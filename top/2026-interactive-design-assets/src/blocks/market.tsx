import { AnimatePresence, motion } from "framer-motion";
import { Bell, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { C, centerIn, makeCandles, rng, useTimers, type Candle } from "./util";

/* ───────────── shared: rolling odometer ───────────── */
function Digit({ d }: { d: number }) {
  return (
    <span className="relative inline-block h-[1em] overflow-hidden align-top" style={{ width: "0.6em" }}>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-d}em` }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-[1em] leading-[1em]">{n}</span>
        ))}
      </motion.span>
    </span>
  );
}

export function Odometer({ value, decimals = 2, className = "" }: { value: number; decimals?: number; className?: string }) {
  const s = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const chars = s.split("");
  return (
    <span className={`tnum inline-flex font-mono leading-[1em] ${className}`} aria-label={s}>
      {chars.map((ch, i) => {
        const key = chars.length - i;
        return /\d/.test(ch) ? (
          <Digit key={key} d={+ch} />
        ) : (
          <span key={`s${key}`} className="inline-block h-[1em] leading-[1em]">{ch}</span>
        );
      })}
    </span>
  );
}

function Candles({ data, x0, cw, y }: { data: Candle[]; x0: number; cw: number; y: (v: number) => number }) {
  return (
    <g>
      {data.map((c, i) => {
        const col = c.c >= c.o ? C.bull : C.bear;
        const x = x0 + i * cw;
        return (
          <g key={i}>
            <line x1={x + cw / 2} x2={x + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} />
            <rect x={x + cw * 0.2} width={cw * 0.6} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={1} />
          </g>
        );
      })}
    </g>
  );
}

/* ═════════════ 14 · DRAW YOUR FORECAST ═════════════ */
type Pt = { x: number; y: number };

function userYAt(a: Pt[], x: number) {
  if (!a.length) return 0;
  if (x <= a[0].x) return a[0].y;
  for (let i = 1; i < a.length; i++) {
    if (a[i].x >= x) {
      const t = (x - a[i - 1].x) / (a[i].x - a[i - 1].x || 1);
      return a[i - 1].y + (a[i].y - a[i - 1].y) * t;
    }
  }
  return a[a.length - 1].y;
}
const toD = (a: Pt[]) => a.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

export function DrawPrediction() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const W = 270;
  const H = 230;
  const [round, setRound] = useState(0);
  const past = useMemo(() => makeCandles(13, 5 + round * 11, 100, 0), [round]);
  const actual = useMemo(() => makeCandles(12, 91 + round * 7, past[past.length - 1].c, round % 2 ? -0.3 : 0.28), [past, round]);
  const all = [...past, ...actual];
  const lo = Math.min(...all.map((c) => c.l)) - 2;
  const hi = Math.max(...all.map((c) => c.h)) + 2;
  const cw = W / all.length;
  const split = past.length * cw;
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * H;
  const truth: Pt[] = [
    { x: split, y: y(past[past.length - 1].c) },
    ...actual.map((c, i) => ({ x: split + (i + 0.5) * cw, y: y(c.c) })),
  ];

  const pts = useRef<Pt[]>([]);
  const [path, setPath] = useState<Pt[]>([]);
  const drawing = useRef(false);
  const [phase, setPhase] = useState<"draw" | "reveal" | "done">("draw");
  const [acc, setAcc] = useState(0);
  const [hint, setHint] = useState("");

  const local = (e: React.PointerEvent): Pt => {
    const r = svg.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * W) / r.width,
      y: Math.max(4, Math.min(H - 4, ((e.clientY - r.top) * H) / r.height)),
    };
  };

  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    if (phase !== "draw") return;
    const p = local(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    pts.current = [{ x: split, y: truth[0].y }, { x: Math.max(split + 1, p.x), y: p.y }];
    setPath([...pts.current]);
    setHint("");
    fx.haptic(5);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = local(e);
    const last = pts.current[pts.current.length - 1];
    if (p.x <= last.x + 1.5) return;
    if (Math.floor(p.x / 22) > Math.floor(last.x / 22)) {
      fx.sfx("tick");
      fx.haptic(3);
    }
    pts.current.push({ x: Math.min(W, p.x), y: p.y });
    setPath([...pts.current]);
  };

  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const span = pts.current[pts.current.length - 1].x - split;
    if (span < (W - split) * 0.6) {
      setHint("Draw all the way to the right edge");
      pts.current = [];
      setPath([]);
      fx.sfx("lose");
      fx.haptic([20, 20, 20]);
      return;
    }
    const a = pts.current;
    const err = truth.slice(1).reduce((s, p) => s + Math.abs(userYAt(a, p.x) - p.y), 0) / (truth.length - 1) / H;
    const score = Math.max(0, Math.min(100, Math.round(100 - err * 320)));
    setAcc(score);
    setPhase("reveal");
    fx.sfx("whoosh");
    fx.haptic(12);
    later(() => {
      setPhase("done");
      const good = score >= 60;
      fx.sfx(good ? "win" : "lose");
      fx.haptic(good ? [20, 30, 60] : [60, 40, 60]);
      later(() => {
        if (root.current && badge.current) {
          const c = centerIn(root.current, badge.current);
          pr.current?.burst(c.x, c.y, {
            count: good ? 80 : 26,
            colors: good ? [C.acid, C.bull, "#fff"] : [C.bear, "#777"],
            speed: good ? 8 : 4,
          });
        }
      }, 60);
    }, fx.ms(1400));
  };

  const reset = () => {
    pts.current = [];
    setPath([]);
    setPhase("draw");
    setRound((r) => r + 1);
  };

  const verdict = acc >= 75 ? "Sharp read" : acc >= 50 ? "Decent shape" : "Way off";
  const vColor = acc >= 75 ? C.bull : acc >= 50 ? C.gold : C.bear;

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-white/40">FORECAST DRILL</div>
          <div className="text-[15px] font-semibold">Draw the next 12 candles</div>
        </div>
        <div className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] text-white/60">ETH · 1H</div>
      </div>

      <div className="relative mt-3 rounded-2xl border border-white/[.07] bg-white/[.02] p-2">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full touch-none select-none"
          style={{ cursor: phase === "draw" ? "crosshair" : "default" }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <defs>
            <pattern id="dp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,.05)" strokeWidth="3" />
            </pattern>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,.05)" />
          ))}
          <rect x={split} y={0} width={W - split} height={H} fill="url(#dp-hatch)" />
          <Candles data={past} x0={0} cw={cw} y={y} />
          <line x1={split} x2={split} y1={0} y2={H} stroke="rgba(255,255,255,.3)" strokeDasharray="3 3" />

          <motion.g initial={false} animate={{ opacity: phase === "draw" ? 0 : 0.35 }} transition={{ duration: fx.t(0.5) }}>
            <Candles data={actual} x0={split} cw={cw} y={y} />
          </motion.g>

          {phase === "done" &&
            truth.slice(1).map((p, i) => {
              const uy = userYAt(path, p.x);
              return (
                <motion.line
                  key={i}
                  x1={p.x}
                  x2={p.x}
                  y1={uy}
                  y2={p.y}
                  stroke={Math.abs(uy - p.y) < 18 ? C.bull : C.bear}
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: fx.t(i * 0.04) }}
                />
              );
            })}

          <motion.path
            d={toD(truth)}
            fill="none"
            stroke={C.acid}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: phase === "draw" ? 0 : 1, opacity: phase === "draw" ? 0 : 1 }}
            transition={{ duration: fx.t(1.1), ease: [0.6, 0, 0.2, 1] }}
            style={{ filter: "drop-shadow(0 0 6px rgba(200,255,0,.6))" }}
          />

          {path.length > 1 && (
            <>
              <path d={toD(path)} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.45))" }} />
              <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r={5} fill="#fff" />
            </>
          )}
        </svg>

        {phase === "draw" && path.length === 0 && !fx.reduced && (
          <motion.div
            className="pointer-events-none absolute"
            style={{ left: `${(split / W) * 100}%`, top: "42%" }}
            animate={{ x: [0, 45, 90], y: [0, -24, 8], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="h-6 w-6 rounded-full border-2 border-white bg-white/20" />
          </motion.div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4 px-1 font-mono text-[10px] text-white/45">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-white" />You</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-[#c8ff00]" />Actual</span>
        <span className="ml-auto">scored on path error</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "done" ? (
            <motion.div
              ref={badge}
              key="res"
              initial={{ scale: 2, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 16 }}
              className="rounded-2xl px-6 py-3 text-center text-[#0b0b0d]"
              style={{ background: vColor }}
            >
              <div className="font-mono text-[10px] font-bold tracking-widest">{verdict.toUpperCase()}</div>
              <div className="tnum text-4xl font-bold">{acc}%</div>
              <div className="font-mono text-[9px] font-bold">accuracy</div>
            </motion.div>
          ) : (
            <motion.p key={phase + hint} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`max-w-[220px] text-center text-[13px] ${hint ? "text-[#ff3b5c]" : "text-white/40"}`}>
              {phase === "reveal" ? "Comparing with what really happened…" : hint || "Drag through the hatched zone to sketch your forecast."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={reset}
        disabled={phase !== "done"}
        className="h-12 w-full rounded-2xl bg-[#c8ff00] font-semibold text-[#0b0b0d] transition active:scale-[.97] disabled:bg-white/[.06] disabled:text-white/30"
      >
        {phase === "done" ? "Next chart" : "Release to submit"}
      </button>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 15 · ORDER BOOK ═════════════ */
const TICK = 5;
type Order = { price: number; side: "buy" | "sell" };

export function OrderBook() {
  const fx = useFx();
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const rowRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [mid, setMid] = useState(64210);
  const midRef = useRef(64210);
  const [dir, setDir] = useState(0);
  const [seed, setSeed] = useState(1);
  const [order, setOrder] = useState<Order | null>(null);
  const [filled, setFilled] = useState<Order | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const step = (Math.random() - 0.5) * 3.2 * TICK + (64210 - midRef.current) * 0.03;
      const next = Math.round((midRef.current + step) / TICK) * TICK;
      setDir(Math.sign(next - midRef.current));
      midRef.current = next;
      setMid(next);
      setSeed((s) => s + 1);
    }, fx.ms(520));
    return () => clearInterval(id);
  }, [fx]);

  useEffect(() => {
    if (!order) return;
    const hit = order.side === "buy" ? mid <= order.price : mid >= order.price;
    if (!hit) return;
    const el = rowRefs.current[order.price];
    if (root.current) {
      const c = el && el.isConnected ? centerIn(root.current, el) : { x: root.current.offsetWidth / 2, y: 300 };
      pr.current?.burst(c.x, c.y, { count: 60, colors: [order.side === "buy" ? C.bull : C.bear, C.acid, "#fff"], speed: 7 });
    }
    setFilled(order);
    setOrder(null);
    fx.sfx("coin");
    fx.haptic([20, 30, 60]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mid]);

  const size = (p: number) => {
    const r = Math.sin(p * 0.37 + seed * 0.9) * 0.5 + 0.5;
    const wall = p % 50 === 0 ? 2.3 : 1;
    return (0.3 + r * 1.5) * wall;
  };

  const place = (p: number) => {
    if (p === mid) return;
    setOrder({ price: p, side: p < mid ? "buy" : "sell" });
    setFilled(null);
    fx.sfx("pop");
    fx.haptic(8);
  };

  const asks = Array.from({ length: 7 }, (_, k) => mid + (7 - k) * TICK);
  const bids = Array.from({ length: 7 }, (_, k) => mid - (k + 1) * TICK);

  const row = (p: number, side: "ask" | "bid") => {
    const s = size(p);
    const wall = p % 50 === 0;
    const mine = order?.price === p;
    const col = side === "ask" ? C.bear : C.bull;
    return (
      <motion.button
        key={p}
        layout={!fx.reduced}
        ref={(el) => {
          rowRefs.current[p] = el;
        }}
        onClick={() => place(p)}
        transition={{ type: "spring", stiffness: 500, damping: 42 }}
        className="relative flex h-[26px] w-full items-center gap-2 rounded px-3 font-mono text-[11.5px] hover:bg-white/[.04]"
      >
        <div
          className="absolute inset-y-[2px] right-0 rounded-l transition-[width] duration-300"
          style={{ width: `${Math.min(100, (s / 4.2) * 100)}%`, background: side === "ask" ? `rgba(255,59,92,${wall ? 0.34 : 0.13})` : `rgba(34,229,139,${wall ? 0.34 : 0.13})` }}
        />
        <span className="tnum relative" style={{ color: col }}>{p.toLocaleString("en-US")}</span>
        <span className="relative flex flex-1 justify-center gap-1">
          {wall && <span className="rounded bg-white/10 px-1 text-[9px] text-white/60">WALL</span>}
          {mine && (
            <motion.span layoutId={`${uid}-chip`} className="rounded bg-[#c8ff00] px-1.5 text-[9px] font-bold text-[#0b0b0d]">
              YOUR {order!.side.toUpperCase()}
            </motion.span>
          )}
        </span>
        <span className="tnum relative text-white/55">{s.toFixed(2)}</span>
      </motion.button>
    );
  };

  return (
    <div ref={root} className="relative flex h-full flex-col px-3 pb-5 pt-2">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="font-mono text-[10px] text-white/40">ORDER BOOK · SIM</div>
          <div className="text-[15px] font-semibold">BTC / USDT</div>
        </div>
        <div className="flex gap-3 font-mono text-[10px] text-white/40"><span>PRICE</span><span>SIZE</span></div>
      </div>

      <div className="mt-2 overflow-hidden">
        {asks.map((p) => row(p, "ask"))}
        <div className="my-1 flex items-center justify-between rounded-xl bg-white/[.05] px-3 py-2">
          <motion.span
            key={seed}
            initial={{ color: dir > 0 ? C.bull : dir < 0 ? C.bear : "#f2efe6" }}
            animate={{ color: "#f2efe6" }}
            transition={{ duration: fx.t(0.9) || 0.01 }}
            className="text-[22px] font-semibold"
          >
            <Odometer value={mid} decimals={0} />
          </motion.span>
          <span className={`font-mono text-[11px] ${dir > 0 ? "text-[#22e58b]" : dir < 0 ? "text-[#ff3b5c]" : "text-white/40"}`}>
            {dir > 0 ? "▲" : dir < 0 ? "▼" : "•"} spread {TICK}
          </span>
        </div>
        {bids.map((p) => row(p, "bid"))}
      </div>

      <div className="flex-1" />
      <div className="relative h-[58px]">
        <AnimatePresence mode="wait">
          {filled ? (
            <motion.div key="f" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-between rounded-2xl bg-[#c8ff00] px-4 text-[#0b0b0d]">
              <div>
                <div className="font-mono text-[10px] font-bold">FILLED ✓</div>
                <div className="text-[14px] font-semibold">{filled.side === "buy" ? "Bought" : "Sold"} 0.10 BTC @ {filled.price.toLocaleString("en-US")}</div>
              </div>
              <button onClick={() => setFilled(null)} aria-label="Dismiss" className="grid h-9 w-9 place-items-center rounded-full bg-black/10"><X size={16} /></button>
            </motion.div>
          ) : order ? (
            <motion.div key="o" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] px-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8ff00] opacity-70" /><span className="relative h-2 w-2 rounded-full bg-[#c8ff00]" /></span>
                <span className="text-[13px]">{order.side === "buy" ? "Buy" : "Sell"} limit @ <b className="tnum font-mono">{order.price.toLocaleString("en-US")}</b></span>
              </div>
              <button onClick={() => { setOrder(null); fx.sfx("tick"); }} className="text-[12px] text-white/50 hover:text-white">Cancel</button>
            </motion.div>
          ) : (
            <motion.p key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center text-center text-[12px] leading-snug text-white/40">
              Tap a level to place a limit order.<br />Walls cluster at round numbers.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 16 · WATCHLIST → DETAIL ═════════════ */
const ASSETS = [
  { s: "BTC", n: "Bitcoin", p: 64210.5, v: 0.0022, c: "#f7931a" },
  { s: "ETH", n: "Ethereum", p: 3251.4, v: 0.003, c: "#8b7bff" },
  { s: "SOL", n: "Solana", p: 142.18, v: 0.005, c: "#22e58b" },
  { s: "TON", n: "Toncoin", p: 6.842, v: 0.006, c: "#2aa9e0" },
];
type WRow = (typeof ASSETS)[number] & { open: number; hist: number[]; last: number; tick: number };
const TF = ["1H", "1D", "1W"] as const;

function series(seed: number, n: number, base: number, vol: number) {
  const r = rng(seed);
  let p = base;
  return Array.from({ length: n }, () => {
    p *= 1 + (r() - 0.49) * vol * 4;
    return p;
  });
}
function spark(h: number[], w: number, hh: number) {
  const lo = Math.min(...h);
  const hi = Math.max(...h);
  return h.map((v, i) => `${i ? "L" : "M"}${((i / (h.length - 1)) * w).toFixed(1)},${(hh - ((v - lo) / (hi - lo || 1)) * hh).toFixed(1)}`).join(" ");
}
const decOf = (p: number) => (p >= 100 ? 2 : 3);

export function Watchlist() {
  const fx = useFx();
  const uid = useId();
  const [rows, setRows] = useState<WRow[]>(() => ASSETS.map((a, i) => ({ ...a, open: a.p, hist: series(i + 3, 30, a.p, a.v), last: 0, tick: 0 })));
  const [sel, setSel] = useState<string | null>(null);
  const [tf, setTf] = useState<(typeof TF)[number]>("1D");
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const id = setInterval(() => {
      setRows((rs) =>
        rs.map((r) => {
          const np = r.p * (1 + (Math.random() - 0.48) * r.v);
          return { ...r, p: np, hist: [...r.hist.slice(1), np], last: Math.sign(np - r.p), tick: r.tick + 1 };
        })
      );
    }, fx.ms(1200));
    return () => clearInterval(id);
  }, [fx]);

  const cur = rows.find((r) => r.s === sel);
  const big = cur ? series(TF.indexOf(tf) * 7 + cur.s.length * 3, 40, cur.p, cur.v * (1 + TF.indexOf(tf))) : [];
  const bigD = big.length ? spark(big, 254, 140) : "";

  const open = (s: string) => {
    setSel(s);
    fx.sfx("whoosh");
    fx.haptic(8);
  };
  const toggleAlert = (s: string) => {
    setAlerts((a) => ({ ...a, [s]: !a[s] }));
    fx.sfx("pop");
    fx.haptic(10);
  };

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="font-mono text-[10px] text-white/40">WATCHLIST · LIVE SIM</div>
      <div className="text-2xl font-bold">Markets</div>

      <div className="mt-5 space-y-2">
        {rows.map((r) => {
          const ch = ((r.p - r.open) / r.open) * 100;
          const up = ch >= 0;
          return (
            <motion.button
              key={r.s}
              layoutId={`${uid}-${r.s}`}
              onClick={() => open(r.s)}
              style={{ borderRadius: 18 }}
              className="relative flex h-[68px] w-full items-center gap-3 overflow-hidden bg-white/[.04] px-3 text-left"
            >
              <motion.div
                key={r.tick}
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0.22 }}
                animate={{ opacity: 0 }}
                transition={{ duration: fx.t(0.8) || 0.01 }}
                style={{ background: r.last > 0 ? C.bull : C.bear }}
              />
              <span className="relative grid h-9 w-9 place-items-center rounded-full font-mono text-[10px] font-bold text-[#0b0b0d]" style={{ background: r.c }}>{r.s}</span>
              <span className="relative flex-1">
                <span className="block text-[14px] font-semibold">{r.n}</span>
                <span className={`font-mono text-[11px] ${up ? "text-[#22e58b]" : "text-[#ff3b5c]"}`}>{up ? "+" : ""}{ch.toFixed(2)}%</span>
              </span>
              <svg width="56" height="26" className="relative">
                <path d={spark(r.hist, 56, 26)} fill="none" stroke={up ? C.bull : C.bear} strokeWidth={1.6} />
              </svg>
              <span className="relative w-[92px] text-right text-[14px]">
                <Odometer value={r.p} decimals={decOf(r.p)} />
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[12px] text-white/35">Tap an asset for the detail view</p>

      <AnimatePresence>
        {cur && (
          <motion.div
            layoutId={`${uid}-${cur.s}`}
            style={{ borderRadius: 0 }}
            transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
            className="absolute inset-0 z-20 overflow-hidden bg-[#141418]"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: fx.t(0.12), duration: fx.t(0.25) }}
              className="flex h-full flex-col px-4 pb-5 pt-2"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setSel(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full bg-white/[.06]"><X size={18} /></button>
                <motion.button
                  key={String(alerts[cur.s])}
                  onClick={() => toggleAlert(cur.s)}
                  aria-label="Toggle price alert"
                  animate={alerts[cur.s] && !fx.reduced ? { rotate: [0, -18, 14, -8, 0] } : {}}
                  className={`grid h-10 w-10 place-items-center rounded-full ${alerts[cur.s] ? "bg-[#c8ff00] text-[#0b0b0d]" : "bg-white/[.06]"}`}
                >
                  <Bell size={17} />
                </motion.button>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full font-mono text-[9px] font-bold text-[#0b0b0d]" style={{ background: cur.c }}>{cur.s}</span>
                <span className="text-[15px] font-semibold">{cur.n}</span>
              </div>
              <div className="mt-2 text-[40px] font-semibold leading-none">
                <Odometer value={cur.p} decimals={decOf(cur.p)} />
              </div>
              <div className={`mt-2 font-mono text-[12px] ${cur.p >= cur.open ? "text-[#22e58b]" : "text-[#ff3b5c]"}`}>
                {cur.p >= cur.open ? "▲" : "▼"} {(((cur.p - cur.open) / cur.open) * 100).toFixed(2)}% today
              </div>

              <div className="relative mt-6">
                <svg viewBox="0 0 254 150" className="w-full overflow-visible">
                  <defs>
                    <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cur.c} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={cur.c} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <motion.path initial={false} animate={{ d: `${bigD} L254,150 L0,150 Z` }} transition={{ duration: fx.t(0.6), ease: [0.6, 0, 0.2, 1] }} fill={`url(#${uid}-fill)`} />
                  <motion.path initial={false} animate={{ d: bigD }} transition={{ duration: fx.t(0.6), ease: [0.6, 0, 0.2, 1] }} fill="none" stroke={cur.c} strokeWidth={2.2} strokeLinejoin="round" />
                </svg>
              </div>

              <div className="mt-4 grid grid-cols-3 rounded-xl bg-white/[.05] p-1">
                {TF.map((t) => (
                  <button key={t} onClick={() => { setTf(t); fx.sfx("tick"); fx.haptic(5); }} className="relative h-9 font-mono text-[12px]">
                    {tf === t && <motion.div layoutId={`${uid}-tf`} className="absolute inset-0 rounded-lg bg-white/15" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
                    <span className={`relative ${tf === t ? "text-white" : "text-white/45"}`}>{t}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ["High", Math.max(...big)],
                  ["Low", Math.min(...big)],
                  ["Open", cur.open],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-xl bg-white/[.03] py-2">
                    <div className="text-[10px] text-white/40">{k}</div>
                    <div className="tnum font-mono text-[12px]">{(v as number).toLocaleString("en-US", { maximumFractionDigits: decOf(v as number) })}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1" />
              <button className="h-12 rounded-2xl font-semibold text-[#0b0b0d]" style={{ background: cur.c }}>Practice this chart</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═════════════ 23 · VOLATILITY FIELD (WebGL) ═════════════ */
const VS = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FS = `precision mediump float;
uniform vec2 r;uniform float t;uniform float v;uniform vec3 rip[8];
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p*=2.02;a*=.5;}return s;}
void main(){
vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 p=uv*vec2(asp,1.)*3.;
float sp=.12+v*1.1;float w=0.;
for(int i=0;i<8;i++){vec3 rp=rip[i];float age=t-rp.z;if(age>0.&&age<3.){float d=length((uv-rp.xy)*vec2(asp,1.));w+=sin(d*38.-age*10.)*exp(-d*3.5)*exp(-age*1.3);}}
p+=w*.25;
vec2 q=vec2(fbm(p+t*sp*.35),fbm(p+vec2(5.2,1.3)-t*sp*.25));
float f=fbm(p+q*(1.2+v*3.2)+t*sp*.12);
vec3 calm=vec3(.13,.9,.55);vec3 mid=vec3(1.,.78,.24);vec3 hot=vec3(1.,.23,.36);
vec3 c=v<.5?mix(calm,mid,v*2.):mix(mid,hot,(v-.5)*2.);
float ln=smoothstep(.43,.5,abs(fract(f*7.)-.5));
vec3 col=vec3(.035)+c*pow(f,2.4)*1.5+c*ln*(.18+v*.25)+c*abs(w)*.4;
col*=1.-.55*length(uv-.5);
gl_FragColor=vec4(col,1.);
}`;

const REGIMES = [
  { max: 0.25, k: "Calm", c: C.bull, tip: "Trends breathe. Wider stops, patient entries." },
  { max: 0.5, k: "Choppy", c: "#b8e04a", tip: "Tight stops get hunted in chop. Size down." },
  { max: 0.75, k: "Volatile", c: C.gold, tip: "Same risk % = smaller position. Always." },
  { max: 1.01, k: "Panic", c: C.bear, tip: "Liquidation cascades. Sitting out is a position." },
];

export function VolatilityField() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const cv = useRef<HTMLCanvasElement>(null);
  const [vol, setVol] = useState(0.2);
  const volRef = useRef(0.2);
  volRef.current = vol;
  const smooth = useRef(0.2);
  const rips = useRef(new Float32Array(24).fill(-10));
  const ri = useRef(0);
  const time = useRef(0);
  const lastRip = useRef(0);
  const pressed = useRef(false);
  const [ok, setOk] = useState(true);

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const gl = c.getContext("webgl", { antialias: false });
    if (!gl) {
      setOk(false);
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setOk(false);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uV = gl.getUniformLocation(prog, "v");
    const uRip = gl.getUniformLocation(prog, "rip");

    const resize = () => {
      c.width = Math.max(1, c.clientWidth);
      c.height = Math.max(1, c.clientHeight);
      gl.viewport(0, 0, c.width, c.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = fxr.current;
      time.current += dt * (f.reduced ? 0.08 : f.speed);
      smooth.current += (volRef.current - smooth.current) * 0.06;
      gl.uniform2f(uR, c.width, c.height);
      gl.uniform1f(uT, time.current);
      gl.uniform1f(uV, smooth.current);
      gl.uniform3fv(uRip, rips.current);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  const addRip = (e: React.PointerEvent) => {
    const now = performance.now();
    if (now - lastRip.current < 110) return;
    lastRip.current = now;
    const r = cv.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    rips.current.set([x, y, time.current], (ri.current % 8) * 3);
    ri.current++;
    fx.haptic(6);
    fx.sfx("pop");
  };

  const reg = REGIMES.find((g) => vol < g.max)!;

  return (
    <div className="relative h-full overflow-hidden">
      <canvas
        ref={cv}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={(e) => { pressed.current = true; e.currentTarget.setPointerCapture(e.pointerId); addRip(e); }}
        onPointerMove={(e) => pressed.current && addRip(e)}
        onPointerUp={() => (pressed.current = false)}
        onPointerCancel={() => (pressed.current = false)}
      />
      {!ok && <div className="absolute inset-0 grid place-items-center bg-[#0b0b0d] text-[12px] text-white/40">WebGL unavailable</div>}

      <div className="pointer-events-none absolute inset-x-4 top-2">
        <div className="font-mono text-[10px] text-white/60">MARKET REGIME</div>
        <div className="relative h-12 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={reg.k}
              initial={{ y: 40, opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -40, opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: fx.t(0.35) }}
              className="text-[40px] font-bold leading-[48px]"
              style={{ color: reg.c, textShadow: `0 0 24px ${reg.c}80` }}
            >
              {reg.k}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="pointer-events-none mt-1 text-[12px] text-white/50">Touch the field to inject shocks</div>
      </div>

      <div className="absolute inset-x-3 bottom-4 rounded-2xl border border-white/10 bg-black/55 p-4 backdrop-blur-md">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-white/50">Implied volatility</span>
          <span className="tnum font-mono text-xl font-bold" style={{ color: reg.c }}>{Math.round(18 + vol * 122)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(vol * 100)}
          onChange={(e) => {
            const v = +e.target.value / 100;
            if (Math.floor(v * 4) !== Math.floor(vol * 4)) { fx.sfx("tick"); fx.haptic(8); }
            setVol(v);
          }}
          aria-label="Volatility"
          className="mt-3 h-2 w-full cursor-pointer accent-[#c8ff00]"
        />
        <AnimatePresence mode="wait">
          <motion.p key={reg.k} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-[12.5px] leading-snug text-white/75">
            {reg.tip}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
