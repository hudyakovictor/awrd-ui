import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Btn, Cell, Grid, Section, Tag, Num, blip } from "../components/kit";
import { Slider } from "./Controls";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

/* ---------- candle generator ---------- */
type C = { o: number; h: number; l: number; c: number };
function nextCandle(prev: number, vol = 1): C {
  const o = prev;
  const drift = (Math.random() - 0.48) * 260 * vol;
  const c = Math.max(100, o + drift);
  const h = Math.max(o, c) + Math.random() * 120 * vol;
  const l = Math.min(o, c) - Math.random() * 120 * vol;
  return { o, h, l, c };
}
function seedCandles(n: number, start = 68000): C[] {
  const out: C[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const k = nextCandle(p);
    out.push(k);
    p = k.c;
  }
  return out;
}

/* ============ Live candlestick chart ============ */
function LiveChart() {
  const [data, setData] = useState<C[]>(() => seedCandles(34));
  const [live, setLive] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setData((d) => [...d.slice(1), nextCandle(d[d.length - 1].c)]), 1300);
    return () => clearInterval(id);
  }, [live]);

  const { min, max } = useMemo(() => {
    const hs = data.map((d) => d.h), ls = data.map((d) => d.l);
    return { min: Math.min(...ls), max: Math.max(...hs) };
  }, [data]);
  const W = 100, H = 100;
  const y = (v: number) => H - ((v - min) / (max - min || 1)) * H;
  const last = data[data.length - 1];
  const up = last.c >= last.o;
  const chg = ((last.c - data[0].o) / data[0].o) * 100;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "linear-gradient(180deg,#ffc24b,#a86e10)" }}><Icon name="bitcoin" size={15} className="text-[#2a1a02]" /></span>
        <span className="text-[13px] font-black text-white">BTC/USDT</span>
        <span className={cn("tnum font-mono text-[15px] font-black", up ? "text-bull" : "text-bear")}>
          <Num value={last.c} dp={2} prefix="$" />
        </span>
        <span className={cn("tnum font-mono text-[10px] font-bold", chg >= 0 ? "text-bull" : "text-bear")}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>
        <button onClick={() => { setLive(!live); blip("tap"); }} className="ml-auto flex items-center gap-1.5 rounded-full sf-inset px-2 py-1 font-mono text-[8px] uppercase tracking-widest" style={{ color: live ? "var(--accent)" : "#5f6f96" }}>
          <span className={cn("h-1.5 w-1.5 rounded-full", live && "animate-pulse")} style={{ background: live ? "var(--accent)" : "#3a4a70" }} />
          {live ? "live" : "paused"}
        </button>
      </div>
      <div ref={wrap} className="relative flex-1 overflow-hidden rounded-xl sf-inset p-2" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full min-h-[132px] w-full">
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(120,160,240,.09)" strokeWidth="0.3" />)}
          {data.map((d, i) => {
            const bw = W / data.length;
            const cx = i * bw + bw / 2;
            const g = d.c >= d.o;
            const col = g ? "#2be08a" : "#ff4d6a";
            return (
              <g key={i} onMouseEnter={() => setHover(i)} style={{ opacity: hover === null || hover === i ? 1 : 0.42, transition: "opacity .15s" }}>
                <rect x={i * bw} y={0} width={bw} height={H} fill="transparent" />
                <line x1={cx} x2={cx} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="0.45" />
                <rect x={cx - bw * 0.3} y={Math.min(y(d.o), y(d.c))} width={bw * 0.6} height={Math.max(0.8, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="0.4" />
              </g>
            );
          })}
          <line x1={0} x2={W} y1={y(last.c)} y2={y(last.c)} stroke={up ? "#2be08a" : "#ff4d6a"} strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity=".8" />
        </svg>
        <AnimatePresence>
          {hover !== null && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pointer-events-none absolute left-2 top-2 rounded-lg sf-raised hairline-strong px-2 py-1 font-mono text-[8px] leading-relaxed text-ink-200">
              O {data[hover].o.toFixed(0)} · H {data[hover].h.toFixed(0)}
              <br />L {data[hover].l.toFixed(0)} · C {data[hover].c.toFixed(0)}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute right-2 top-2 rounded px-1.5 py-0.5 font-mono text-[8px] font-black" style={{ background: up ? "#2be08a" : "#ff4d6a", color: "#06120b" }}>{last.c.toFixed(0)}</div>
      </div>
      <div className="flex gap-1">
        {["1m", "5m", "15m", "1H", "4H", "1D"].map((t, i) => (
          <button key={t} onClick={() => blip("tap")} className={cn("flex-1 rounded-md py-1 font-mono text-[8px] font-bold uppercase transition-colors", i === 3 ? "text-[var(--accent-ink)]" : "text-ink-500 hover:text-ink-200")} style={i === 3 ? { background: "var(--accent)" } : { background: "rgba(90,130,220,.08)" }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

/* ============ Ticker tape ============ */
const TICK = [
  ["BTC", 68412.55, 2.14], ["ETH", 3521.08, 1.02], ["SOL", 178.42, -0.84], ["BNB", 604.11, 0.42],
  ["XRP", 0.6188, -1.73], ["LINK", 18.92, 4.51], ["ARB", 1.204, -2.18], ["AVAX", 38.77, 3.06],
] as [string, number, number][];

function Ticker() {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      <div className="mask-fade-r relative overflow-hidden rounded-xl sf-inset py-2.5">
        <div className="ticker-track flex w-max gap-6 px-3">
          {[...TICK, ...TICK].map(([s, p, c], i) => (
            <span key={i} className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-bold">
              <span className="text-ink-300">{s}</span>
              <span className="tnum text-white">{p.toLocaleString("en-US", { minimumFractionDigits: p < 10 ? 4 : 2 })}</span>
              <span className={cn("tnum text-[9px]", c >= 0 ? "text-bull" : "text-bear")}>{c >= 0 ? "▲" : "▼"}{Math.abs(c).toFixed(2)}%</span>
            </span>
          ))}
        </div>
      </div>
      <div className="font-mono text-[9px] text-ink-500">ticker / 26s loop · pause on hover</div>
    </div>
  );
}

/* ============ Order book ============ */
function OrderBook() {
  const [book, setBook] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({ p: 68420 + i * 6, a: Math.random(), b: Math.random() })),
  );
  useEffect(() => {
    const id = setInterval(() => setBook((b) => b.map((r) => ({ ...r, a: Math.random(), b: Math.random() }))), 900);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col justify-center gap-0.5 font-mono text-[9px]">
      <div className="mb-1 flex justify-between text-[8px] uppercase tracking-wider text-ink-500"><span>Price</span><span>Size</span></div>
      {[...book].reverse().map((r, i) => (
        <div key={`a${i}`} className="relative flex justify-between px-1.5 py-[3px]">
          <motion.span animate={{ width: `${r.a * 100}%` }} className="absolute right-0 top-0 h-full rounded-sm bg-[rgba(255,77,106,.16)]" />
          <span className="relative tnum text-bear">{(r.p + 30).toFixed(1)}</span>
          <span className="relative tnum text-ink-400">{(r.a * 4).toFixed(3)}</span>
        </div>
      ))}
      <div className="my-1 flex items-center justify-between rounded-md sf-base px-1.5 py-1">
        <span className="tnum text-[11px] font-black" style={{ color: "var(--accent)" }}>68,412.5</span>
        <span className="text-[8px] uppercase tracking-wider text-ink-500">spread 0.02%</span>
      </div>
      {book.map((r, i) => (
        <div key={`b${i}`} className="relative flex justify-between px-1.5 py-[3px]">
          <motion.span animate={{ width: `${r.b * 100}%` }} className="absolute right-0 top-0 h-full rounded-sm bg-[rgba(43,224,138,.16)]" />
          <span className="relative tnum text-bull">{(r.p - 60 - i * 6).toFixed(1)}</span>
          <span className="relative tnum text-ink-400">{(r.b * 4).toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

/* ============ Trade panel ============ */
function TradePanel() {
  const [side, setSide] = useState<"long" | "short">("long");
  const [amt, setAmt] = useState(40);
  const [lev, setLev] = useState(5);
  const size = (2500 * (amt / 100) * lev).toFixed(0);
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex gap-1.5 rounded-xl sf-inset p-1.5">
        {(["long", "short"] as const).map((s) => (
          <button key={s} onClick={() => { setSide(s); blip("tap"); }} className="relative flex-1 py-2 text-[11px] font-black uppercase tracking-wider" style={{ color: side === s ? (s === "long" ? "#02150b" : "#1c0309") : "#7d8db4" }}>
            {side === s && <motion.span layoutId="trade-pill" className="absolute inset-0 -z-0 rounded-lg" style={{ background: s === "long" ? "linear-gradient(180deg,#5cf0ab,#2be08a)" : "linear-gradient(180deg,#ff8fa2,#ff4d6a)", boxShadow: `0 3px 0 ${s === "long" ? "#0f7048" : "#8e0f2c"}` }} />}
            <span className="relative flex items-center justify-center gap-1"><Icon name={s === "long" ? "trendUp" : "trendDown"} size={13} strokeWidth={2.6} />{s}</span>
          </button>
        ))}
      </div>
      <div>
        <div className="mb-1 flex justify-between font-mono text-[9px]"><span className="text-ink-400">Balance %</span><span className="tnum font-bold text-white">{amt}%</span></div>
        <Slider value={amt} onChange={setAmt} marks={["0", "25", "50", "75", "MAX"]} />
      </div>
      <div>
        <div className="mb-1 flex justify-between font-mono text-[9px]"><span className="text-ink-400">Leverage</span><span className="tnum font-bold" style={{ color: lev > 10 ? "#ff4d6a" : "var(--accent)" }}>×{lev}</span></div>
        <Slider value={lev} onChange={setLev} min={1} max={20} tone={lev > 10 ? "#ff4d6a" : undefined} />
      </div>
      <div className="grid grid-cols-2 gap-1.5 rounded-xl sf-inset p-2 font-mono text-[9px]">
        <div><div className="text-ink-500">Position</div><div className="tnum font-bold text-white">${size}</div></div>
        <div><div className="text-ink-500">Liq. price</div><div className="tnum font-bold text-bear">${(68412 * (side === "long" ? 1 - 0.9 / lev : 1 + 0.9 / lev)).toFixed(0)}</div></div>
      </div>
      <Btn variant={side === "long" ? "bull" : "danger"} size="md" full depth="md" icon={side === "long" ? "trendUp" : "trendDown"}>
        {side === "long" ? "Open Long" : "Open Short"} ×{lev}
      </Btn>
    </div>
  );
}

/* ============ Portfolio donut ============ */
const ALLOC = [
  { n: "BTC", v: 44, c: "#ffc24b" },
  { n: "ETH", v: 26, c: "#9b6bff" },
  { n: "SOL", v: 16, c: "#38e1ff" },
  { n: "Stables", v: 14, c: "#2be08a" },
];

function Portfolio() {
  const [sel, setSel] = useState<number | null>(null);
  let acc = 0;
  const R = 42, C = 2 * Math.PI * R;
  return (
    <div className="flex h-full items-center gap-3">
      <div className="relative shrink-0">
        <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
          {ALLOC.map((a, i) => {
            const len = (a.v / 100) * C;
            const off = acc;
            acc += len;
            return (
              <motion.circle
                key={a.n}
                cx="54" cy="54" r={R} fill="none"
                stroke={a.c}
                strokeWidth={sel === i ? 16 : 12}
                strokeDasharray={`${len - 2} ${C - len + 2}`}
                strokeDashoffset={-off}
                onMouseEnter={() => setSel(i)}
                onMouseLeave={() => setSel(null)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ cursor: "pointer", filter: sel === i ? `drop-shadow(0 0 10px ${a.c})` : undefined }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="tnum font-mono text-[15px] font-black text-white">{sel === null ? "$24.8k" : `${ALLOC[sel].v}%`}</div>
            <div className="font-mono text-[7px] uppercase tracking-widest text-ink-500">{sel === null ? "portfolio" : ALLOC[sel].n}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {ALLOC.map((a, i) => (
          <div key={a.n} onMouseEnter={() => setSel(i)} onMouseLeave={() => setSel(null)} className={cn("flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors", sel === i && "bg-[rgba(90,130,220,.1)]")}>
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: a.c, boxShadow: `0 0 8px ${a.c}80` }} />
            <span className="flex-1 text-[10px] font-bold text-ink-300">{a.n}</span>
            <span className="tnum font-mono text-[10px] font-black text-white">{a.v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ PnL card + sparkline ============ */
function Spark({ pts, col }: { pts: number[]; col: string }) {
  const max = Math.max(...pts), min = Math.min(...pts);
  const d = pts.map((p, i) => `${(i / (pts.length - 1)) * 100},${30 - ((p - min) / (max - min || 1)) * 28}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full">
      <defs>
        <linearGradient id={`sg-${col.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".45" />
          <stop offset="100%" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,30 ${d} 100,30`} fill={`url(#sg-${col.replace("#", "")})`} />
      <motion.polyline points={d} fill="none" stroke={col} strokeWidth="1.6" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} />
    </svg>
  );
}

function PnlCards() {
  const rows = [
    { n: "Realised PnL", v: 3421.88, p: 14.2, up: true, s: [3, 5, 4, 7, 6, 9, 8, 12, 11, 14] },
    { n: "Unrealised", v: -812.4, p: -3.6, up: false, s: [9, 8, 9, 7, 6, 7, 5, 4, 5, 3] },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      {rows.map((r) => (
        <div key={r.n} className="rounded-2xl sf-raised hairline p-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[8px] uppercase tracking-widest text-ink-500">{r.n}</span>
            <span className={cn("tnum font-mono text-[10px] font-black", r.up ? "text-bull" : "text-bear")}>{r.up ? "+" : ""}{r.p}%</span>
          </div>
          <div className={cn("tnum font-mono text-[19px] font-black", r.up ? "text-bull" : "text-bear")}>
            <Num value={r.v} dp={2} prefix="$" />
          </div>
          <Spark pts={r.s} col={r.up ? "#2be08a" : "#ff4d6a"} />
        </div>
      ))}
    </div>
  );
}

/* ============ Sentiment gauge ============ */
function Sentiment() {
  const [v, setV] = useState(72);
  useEffect(() => {
    const id = setInterval(() => setV((x) => Math.min(96, Math.max(6, x + (Math.random() - 0.5) * 12))), 2200);
    return () => clearInterval(id);
  }, []);
  const ang = -90 + (v / 100) * 180;
  const label = v > 75 ? "Extreme Greed" : v > 55 ? "Greed" : v > 45 ? "Neutral" : v > 25 ? "Fear" : "Extreme Fear";
  const col = v > 75 ? "#2be08a" : v > 55 ? "#a8e05f" : v > 45 ? "#ffc24b" : v > 25 ? "#ff8c42" : "#ff4d6a";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <svg viewBox="0 0 200 110" className="w-full max-w-[210px]">
        <defs>
          <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff4d6a" /><stop offset="35%" stopColor="#ffc24b" /><stop offset="70%" stopColor="#a8e05f" /><stop offset="100%" stopColor="#2be08a" />
          </linearGradient>
        </defs>
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="rgba(120,160,240,.12)" strokeWidth="16" strokeLinecap="round" />
        <path d="M18 100 A82 82 0 0 1 182 100" fill="none" stroke="url(#gauge)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(v / 100) * 258} 400`} style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,1,.36,1)" }} />
        <motion.g animate={{ rotate: ang }} transition={{ type: "spring", stiffness: 60, damping: 14 }} style={{ originX: 0.5, originY: 1 }}>
          <line x1="100" y1="100" x2="100" y2="34" stroke="#e6eeff" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="100" cy="34" r="4.5" fill={col} />
        </motion.g>
        <circle cx="100" cy="100" r="9" fill="#0d1528" stroke="rgba(160,190,255,.3)" strokeWidth="2" />
      </svg>
      <div className="-mt-3 text-center">
        <div className="tnum font-mono text-[24px] font-black leading-none" style={{ color: col }}>{Math.round(v)}</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: col }}>{label}</div>
      </div>
    </div>
  );
}

/* ============ Predict quiz ============ */
function PredictQuiz() {
  const [data] = useState(() => seedCandles(12, 42000));
  const [answer, setAnswer] = useState<"up" | "down" | null>(null);
  const [truth] = useState<"up" | "down">(Math.random() > 0.5 ? "up" : "down");
  const correct = answer === truth;
  const max = Math.max(...data.map((d) => d.h)), min = Math.min(...data.map((d) => d.l));
  const y = (v: number) => 100 - ((v - min) / (max - min)) * 100;
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Icon name="brain" size={14} style={{ color: "var(--accent)" }} />
        <span className="text-[11px] font-black text-white">Next candle?</span>
        <span className="ml-auto font-mono text-[8px] uppercase tracking-wider text-ink-500">+40 XP</span>
      </div>
      <div className="relative flex-1 overflow-hidden rounded-xl sf-inset p-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full min-h-[96px] w-full">
          {data.map((d, i) => {
            const bw = 100 / (data.length + 2);
            const cx = i * bw + bw / 2;
            const g = d.c >= d.o;
            return (
              <g key={i}>
                <line x1={cx} x2={cx} y1={y(d.h)} y2={y(d.l)} stroke={g ? "#2be08a" : "#ff4d6a"} strokeWidth="0.5" />
                <rect x={cx - bw * 0.28} y={Math.min(y(d.o), y(d.c))} width={bw * 0.56} height={Math.max(1, Math.abs(y(d.o) - y(d.c)))} fill={g ? "#2be08a" : "#ff4d6a"} />
              </g>
            );
          })}
          <AnimatePresence>
            {answer && (
              <motion.rect
                initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
                x={(data.length + 0.2) * (100 / (data.length + 2))} y={truth === "up" ? y(max) : y(data[data.length - 1].c)}
                width={100 / (data.length + 2) * 0.56} height={30}
                fill={truth === "up" ? "#2be08a" : "#ff4d6a"}
                style={{ transformOrigin: "center" }}
              />
            )}
          </AnimatePresence>
          <rect x={(data.length + 0.05) * (100 / (data.length + 2))} y={0} width={100 / (data.length + 2)} height={100} fill="rgba(120,160,240,.07)" stroke="rgba(120,160,240,.2)" strokeWidth="0.3" strokeDasharray="2 2" />
        </svg>
      </div>
      <AnimatePresence mode="wait">
        {answer === null ? (
          <motion.div key="ask" exit={{ opacity: 0, y: -6 }} className="flex gap-2">
            <Btn variant="bull" size="sm" full icon="arrowUp" onClick={() => { setAnswer("up"); blip(truth === "up" ? "level" : "err"); }}>Up</Btn>
            <Btn variant="danger" size="sm" full icon="arrowDown" onClick={() => { setAnswer("down"); blip(truth === "down" ? "level" : "err"); }}>Down</Btn>
          </motion.div>
        ) : (
          <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-center gap-2 rounded-xl p-2.5", correct ? "bg-[rgba(43,224,138,.12)]" : "bg-[rgba(255,77,106,.12)]")} style={{ boxShadow: `inset 0 0 0 1px ${correct ? "rgba(43,224,138,.4)" : "rgba(255,77,106,.4)"}` }}>
            <Icon name={correct ? "check" : "x"} size={16} strokeWidth={3} className={correct ? "text-bull" : "text-bear"} />
            <span className={cn("text-[11px] font-black", correct ? "text-bull" : "text-bear")}>{correct ? "Correct! +40 XP" : "Missed — −1 ♥"}</span>
            <button onClick={() => setAnswer(null)} className="ml-auto font-mono text-[9px] uppercase tracking-wider text-ink-400 hover:text-white">retry</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Position card ============ */
function PositionCard() {
  const [health, setHealth] = useState(68);
  const col = health > 60 ? "#2be08a" : health > 30 ? "#ffc24b" : "#ff4d6a";
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      <div className="rounded-2xl sf-raised hairline-strong p-3">
        <div className="flex items-center gap-2">
          <Tag tone="bull">LONG ×5</Tag>
          <span className="text-[12px] font-black text-white">ETH/USDT</span>
          <span className="ml-auto tnum font-mono text-[13px] font-black text-bull">+$482.10</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 font-mono text-[8.5px]">
          {[["Entry", "3,412.00"], ["Mark", "3,521.08"], ["Liq.", "2,884.5"]].map(([k, v]) => (
            <div key={k} className="rounded-lg sf-inset px-1.5 py-1"><div className="text-ink-500">{k}</div><div className="tnum font-bold text-ink-200">{v}</div></div>
          ))}
        </div>
        <div className="mt-2.5">
          <div className="mb-1 flex justify-between font-mono text-[8px] uppercase tracking-wider"><span className="text-ink-500">Margin health</span><span className="tnum font-bold" style={{ color: col }}>{health}%</span></div>
          <div className="relative h-2.5 overflow-hidden rounded-full sf-inset">
            <motion.div animate={{ width: `${health}%` }} className="h-full rounded-full" style={{ background: `linear-gradient(90deg, color-mix(in srgb,${col} 45%,#000), ${col})`, boxShadow: `0 0 12px ${col}80` }} />
            <span className="absolute left-[25%] top-0 h-full w-px bg-bear/60" />
          </div>
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <Btn variant="neutral" size="xs" full onClick={() => setHealth((h) => Math.max(8, h - 14))}>Add risk</Btn>
          <Btn variant="accent" size="xs" full onClick={() => setHealth((h) => Math.min(100, h + 14))}>Add margin</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============ Market list ============ */
function MarketList() {
  const rows: [string, string, number, number, number[], IconName][] = [
    ["BTC", "Bitcoin", 68412.55, 2.14, [4, 5, 4, 6, 7, 6, 9], "bitcoin"],
    ["ETH", "Ethereum", 3521.08, 1.02, [6, 5, 6, 7, 6, 8, 8], "gem"],
    ["SOL", "Solana", 178.42, -0.84, [8, 7, 8, 6, 5, 6, 5], "bolt"],
    ["LINK", "Chainlink", 18.92, 4.51, [3, 4, 4, 6, 7, 8, 10], "globe"],
  ];
  return (
    <div className="flex h-full flex-col gap-1.5">
      {rows.map(([s, n, p, c, sp, ic]) => (
        <motion.div key={s} whileHover={{ x: 3 }} className="flex cursor-pointer items-center gap-2.5 rounded-xl sf-base hairline p-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl sf-raised text-ink-300"><Icon name={ic} size={15} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-black text-white">{s}</div>
            <div className="truncate font-mono text-[8px] text-ink-500">{n}</div>
          </div>
          <div className="w-14 shrink-0"><Spark pts={sp} col={c >= 0 ? "#2be08a" : "#ff4d6a"} /></div>
          <div className="w-[70px] shrink-0 text-right">
            <div className="tnum font-mono text-[11px] font-bold text-white">${p.toLocaleString()}</div>
            <div className={cn("tnum font-mono text-[9px] font-bold", c >= 0 ? "text-bull" : "text-bear")}>{c >= 0 ? "+" : ""}{c}%</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Trading() {
  return (
    <Section id="trading" index="05" title="Trading Modules" kicker="Live market surfaces · Simulated engine" count="10 assets">
      <Grid>
        <Cell title="Live Candlestick Chart" spec="34 bars · 1.3s tick" span="col-span-2 md:col-span-4 lg:col-span-3"><LiveChart /></Cell>
        <Cell title="Trade Panel" spec="long/short · leverage" span="col-span-2"><TradePanel /></Cell>
        <Cell title="Order Book" spec="depth heat · 0.9s" span="col-span-2 lg:col-span-1"><OrderBook /></Cell>
        <Cell title="Ticker Tape" spec="8 pairs · infinite" span="col-span-2 md:col-span-4 lg:col-span-3"><Ticker /></Cell>
        <Cell title="Fear & Greed Gauge" spec="live needle spring" span="col-span-2 lg:col-span-3"><Sentiment /></Cell>
        <Cell title="Portfolio Allocation" spec="donut · hover" span="col-span-2"><Portfolio /></Cell>
        <Cell title="PnL Cards" spec="sparkline draw" span="col-span-2"><PnlCards /></Cell>
        <Cell title="Predict-The-Candle" spec="quiz · reveal fx" span="col-span-2"><PredictQuiz /></Cell>
        <Cell title="Open Position" spec="margin health" span="col-span-2"><PositionCard /></Cell>
        <Cell title="Market List" spec="rows + sparklines" span="col-span-2 md:col-span-2 lg:col-span-4"><MarketList /></Cell>
        <Cell title="Domain Tokens" spec="semantics" span="col-span-2 md:col-span-4 lg:col-span-6">
          <div className="flex h-full flex-wrap content-center gap-1.5">
            <Tag tone="bull">bull · +</Tag><Tag tone="bear">bear · −</Tag><Tag tone="gold">liquidity</Tag><Tag tone="aqua">volatility</Tag>
            <Tag tone="violet">derivative</Tag><Tag>spot</Tag><Tag tone="bear">liquidation</Tag><Tag tone="bull">take-profit</Tag>
            <Tag tone="gold">funding</Tag><Tag tone="aqua">orderflow</Tag><Tag>slippage</Tag><Tag tone="violet">on-chain</Tag>
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
