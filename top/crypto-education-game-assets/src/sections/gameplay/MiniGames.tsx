import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Confetti, Label } from "../../components/ui";
import { BearIcon, BullIcon, CoinIcon, Icon, XPIcon } from "../../components/icons";
import { fx, useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, mulberry32, shuffleSeeded, tween, useDrag } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-07 · SWIPE: BULL OR BEAR — Tinder-style news cards with physics
 * ===================================================================== */
const NEWS = [
  { h: "SEC approves the first spot Bitcoin ETFs", src: "Bloomberg", coin: "BTC", c: "#f7931a", bull: true, why: "Opens the door for massive institutional inflows." },
  { h: "Top-5 exchange suddenly halts all withdrawals", src: "CoinDesk", coin: "ALL", c: "#ff4d6d", bull: false, why: "Signals insolvency risk — panic selling follows." },
  { h: "Ethereum upgrade cuts Layer-2 fees by 90%", src: "The Block", coin: "ETH", c: "#627eea", bull: true, why: "Cheaper usage drives more demand for the network." },
  { h: "Whale moves 20,000 BTC onto an exchange", src: "Whale Alert", coin: "BTC", c: "#f7931a", bull: false, why: "Coins sent to exchanges are often about to be sold." },
  { h: "Fed signals interest-rate cuts are coming", src: "Reuters", coin: "MACRO", c: "#22d39a", bull: true, why: "Cheaper money tends to flow into risk assets." },
  { h: "Major stablecoin loses its $1 peg", src: "Decrypt", coin: "USDx", c: "#26a17b", bull: false, why: "Contagion fear spreads across DeFi." },
  { h: "A nation adopts Bitcoin as legal tender", src: "AP News", coin: "BTC", c: "#f7931a", bull: true, why: "New sovereign demand and legitimacy." },
  { h: "$300M drained in a DeFi bridge hack", src: "Rekt News", coin: "DeFi", c: "#9170ff", bull: false, why: "Hacks crush confidence and token prices." },
];

function SwipeBullBear() {
  const g = useGame();
  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const [score, setScore] = useState({ ok: 0, n: 0, streak: 0 });
  const [toast, setToast] = useState<{ ok: boolean; why: string; id: number } | null>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  const decide = (dir: 1 | -1) => {
    if (leaving || idx >= NEWS.length) return;
    setLeaving(dir);
    sfx("swipe");
    setPos((p) => ({ x: dir * 560, y: p.y + 60 }));
    const card = NEWS[idx];
    const ok = (dir === 1) === card.bull;
    setTimeout(() => {
      setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1, streak: ok ? s.streak + 1 : 0 }));
      setToast({ ok, why: card.why, id: Date.now() });
      if (ok) {
        sfx("success");
        g.reward("xp", 8 + score.streak * 2, stackRef.current);
      } else sfx("error");
      setIdx((i) => i + 1);
      setPos({ x: 0, y: 0 });
      setLeaving(0);
    }, 360);
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1900);
    return () => clearTimeout(t);
  }, [toast]);

  const bind = useDrag(
    (s) => {
      if (leaving) return;
      if (s.first) {
        setDragging(true);
        return;
      }
      if (!s.last) {
        setPos({ x: s.dx, y: s.dy * 0.35 });
        return;
      }
      setDragging(false);
      if (Math.abs(s.dx) > 110 || Math.abs(s.vx) > 0.75) decide(s.dx > 0 ? 1 : -1);
      else setPos({ x: 0, y: 0 });
    },
    { capture: "immediate" },
  );

  const tint = clamp(pos.x / 140, -1, 1);
  const done = idx >= NEWS.length;
  return (
    <Asset title="Swipe: Bull or Bear?" code="G-07" tags="swipe tinder cards news bull bear sentiment gesture drag" span={5} badge="Hit">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Is this news bullish?</div>
        <div className="flex gap-2">
          <Chip tone="bull">✓ {score.ok}</Chip>
          <Chip tone="flame">🔥 {score.streak}</Chip>
        </div>
      </div>
      <div ref={stackRef} className="relative h-[320px] select-none">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl transition-opacity"
          style={{
            background: `radial-gradient(circle at ${tint > 0 ? "90%" : "10%"} 50%, ${tint > 0 ? "rgba(34,211,154,.35)" : "rgba(255,77,109,.35)"}, transparent 60%)`,
            opacity: Math.abs(tint),
          }}
        />
        {done ? (
          <div className="anim-pop absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-ink-850 text-center">
            <div className="flex gap-2">
              <BullIcon size={56} />
              <BearIcon size={56} />
            </div>
            <div className="mt-3 font-display text-2xl font-black text-white">
              {score.ok}/{NEWS.length} correct
            </div>
            <div className="text-xs font-semibold text-ink-400">You read market sentiment like a pro.</div>
            <Btn variant="azure" size="sm" className="mt-4" onClick={() => { setIdx(0); setScore({ ok: 0, n: 0, streak: 0 }); }}>
              Play again
            </Btn>
          </div>
        ) : (
          [2, 1, 0]
            .map((d) => idx + d)
            .filter((i) => i < NEWS.length)
            .map((i) => {
              const d = i - idx;
              const n = NEWS[i];
              const top = d === 0;
              const style: React.CSSProperties = top
                ? {
                    transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x * 0.07}deg)`,
                    transition: dragging ? "none" : leaving ? "transform .36s cubic-bezier(.5,0,.9,.5)" : "transform .5s cubic-bezier(.3,1.5,.5,1)",
                    touchAction: "none",
                  }
                : {
                    transform: `translateY(${d * 14}px) scale(${1 - d * 0.05 + (Math.abs(tint) * 0.05 * (d === 1 ? 1 : 0.5))})`,
                    transition: "transform .4s cubic-bezier(.3,1.3,.5,1)",
                    filter: `brightness(${1 - d * 0.18})`,
                  };
              return (
                <div
                  key={i}
                  {...(top ? bind : {})}
                  className={cn("absolute inset-x-2 top-0 h-[290px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-700 to-ink-800 shadow-[0_8px_0_#081231,0_20px_40px_rgba(0,0,0,.5)]", top && "cursor-grab active:cursor-grabbing")}
                  style={{ ...style, zIndex: 10 - d }}
                >
                  <div className="relative h-32 overflow-hidden" style={{ background: `linear-gradient(135deg, ${n.c}, color-mix(in srgb, ${n.c} 35%, #0a1330))` }}>
                    <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-40">
                      <path d={n.bull ? "M0 70 L40 55 L70 60 L110 30 L140 38 L200 8" : "M0 12 L40 25 L70 20 L110 50 L150 44 L200 74"} stroke="#fff" strokeWidth="3" fill="none" />
                    </svg>
                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="rounded-lg bg-black/30 px-2 py-0.5 text-[11px] font-black text-white backdrop-blur">{n.coin}</span>
                      <span className="rounded-lg bg-black/30 px-2 py-0.5 text-[11px] font-bold text-white/80 backdrop-blur">{n.src} · 2m</span>
                    </div>
                    <Icon name="bell" size={64} className="absolute -bottom-3 right-3 text-white/25" />
                  </div>
                  <div className="p-5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-ink-400">Breaking</div>
                    <div className="mt-1 font-display text-lg font-bold leading-snug text-white">{n.h}</div>
                  </div>
                  {top && (
                    <>
                      <span className="absolute left-5 top-8 rounded-xl border-4 border-bull px-3 py-1 font-display text-2xl font-black text-bull" style={{ opacity: clamp(tint * 1.4, 0, 1), transform: "rotate(-14deg)" }}>
                        BULLISH
                      </span>
                      <span className="absolute right-5 top-8 rounded-xl border-4 border-bear px-3 py-1 font-display text-2xl font-black text-bear" style={{ opacity: clamp(-tint * 1.4, 0, 1), transform: "rotate(14deg)" }}>
                        BEARISH
                      </span>
                    </>
                  )}
                </div>
              );
            })
        )}
        {toast && (
          <div key={toast.id} className={cn("anim-slide-up absolute inset-x-4 bottom-0 z-20 flex items-center gap-2 rounded-2xl p-3 text-xs font-bold shadow-xl", toast.ok ? "bg-bull text-ink-950" : "bg-bear text-white")}>
            <Icon name={toast.ok ? "check" : "x"} size={18} stroke={3.2} />
            <span className="flex-1">{toast.why}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-6">
        <button onClick={() => decide(-1)} disabled={done} className="btn3d v-bear h-16 w-16 rounded-full [--depth:6px]" aria-label="Bearish">
          <BearIcon size={34} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-ink-500">
          {Math.min(idx + 1, NEWS.length)}/{NEWS.length}
        </span>
        <button onClick={() => decide(1)} disabled={done} className="btn3d v-bull h-16 w-16 rounded-full [--depth:6px]" aria-label="Bullish">
          <BullIcon size={34} />
        </button>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-08 · CHART PREDICTION — stake coins, candles reveal one by one
 * ===================================================================== */
type C = { o: number; c: number; h: number; l: number };
function makeCandles(seed: number, n: number, start = 100, drift = 0): C[] {
  const rnd = mulberry32(seed);
  const out: C[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + (rnd() - 0.5 + drift) * 6;
    out.push({ o, c, h: Math.max(o, c) + rnd() * 2.5, l: Math.min(o, c) - rnd() * 2.5 });
    p = c;
  }
  return out;
}

function Predict() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const [stake, setStake] = useState(25);
  const [guess, setGuess] = useState<"up" | "down" | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [score, setScore] = useState({ w: 0, l: 0 });
  const resultRef = useRef<HTMLDivElement>(null);
  const base = useMemo(() => makeCandles(round * 77 + 3, 16, 100, 0), [round]);
  const dir = useMemo(() => (mulberry32(round * 5 + 1)() > 0.5 ? 1 : -1), [round]);
  const future = useMemo(() => makeCandles(round * 13 + 5, 6, base[base.length - 1].c, dir * 0.42), [round, base, dir]);
  const all = [...base, ...future.slice(0, revealed)];
  const every = [...base, ...future];
  const max = Math.max(...every.map((c) => c.h));
  const min = Math.min(...every.map((c) => c.l));
  const W = 400;
  const H = 190;
  const cw = W / 23;
  const y = (v: number) => 10 + ((max - v) / (max - min)) * (H - 20);
  const last = base[base.length - 1].c;
  const won = revealed === 6 && !!guess && (future[5].c > last ? "up" : "down") === guess;

  useEffect(() => {
    if (!guess || revealed >= 6) return;
    const t = setTimeout(() => {
      setRevealed((r) => r + 1);
      sfx("tick", 0.8 + revealed * 0.08);
    }, 420);
    return () => clearTimeout(t);
  }, [guess, revealed]);
  useEffect(() => {
    if (revealed !== 6 || !guess) return;
    setScore((s) => (won ? { ...s, w: s.w + 1 } : { ...s, l: s.l + 1 }));
    if (won) {
      sfx("success");
      setTimeout(() => g.reward("coins", stake * 2, resultRef.current), 250);
    } else sfx("lose");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  const place = (d: "up" | "down", el: HTMLElement) => {
    if (!g.spend("coins", stake, el)) return;
    setGuess(d);
  };
  return (
    <Asset title="Chart Prediction · Stakes" code="G-08" tags="chart candle prediction game up down guess stake coins bet" span={7}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Round {round}</div>
          <div className="font-display text-base font-black text-white">Where will price close in 6 candles?</div>
        </div>
        <div className="flex gap-2">
          <Chip tone="bull">W {score.w}</Chip>
          <Chip tone="bear">L {score.l}</Chip>
        </div>
      </div>
      <div ref={resultRef} className="panel-inset relative mt-3 overflow-hidden rounded-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          {[0.25, 0.5, 0.75].map((gg) => (
            <line key={gg} x1="0" x2={W} y1={H * gg} y2={H * gg} stroke="#16295a" strokeDasharray="3 5" />
          ))}
          <line x1="0" x2={W} y1={y(last)} y2={y(last)} stroke="#3e8bff" strokeOpacity=".55" strokeDasharray="4 4" />
          <rect x={cw * 16} y="0" width={cw * 7} height={H} fill="#3e8bff" opacity={guess ? 0.05 : 0.1} />
          {!guess && (
            <text x={cw * 19.5} y={H / 2 + 12} textAnchor="middle" fill="#5c79b5" fontSize="38" fontWeight="900" className="anim-glow">
              ?
            </text>
          )}
          {all.map((c, i) => {
            const up = c.c >= c.o;
            const col = up ? "#22d39a" : "#ff4d6d";
            const isNew = i >= 16;
            return (
              <g key={`${round}-${i}`} style={isNew ? { transformOrigin: `${i * cw + cw / 2}px ${y((c.o + c.c) / 2)}px`, animation: "bar-grow .35s cubic-bezier(.3,1.4,.5,1)" } : undefined}>
                <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.5" />
                <rect x={i * cw + 3} y={y(Math.max(c.o, c.c))} width={cw - 6} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx="2" fill={col} />
              </g>
            );
          })}
        </svg>
        {revealed === 6 && (
          <div className="anim-pop absolute inset-0 flex flex-col items-center justify-center bg-ink-950/70 backdrop-blur-[2px]">
            {won ? <BullIcon size={60} className="anim-bounce-soft" /> : <BearIcon size={60} />}
            <div className={cn("font-display text-xl font-black", won ? "text-bull" : "text-bear")}>{won ? `Called it! +${stake * 2} coins` : `Market disagreed · -${stake}`}</div>
            <Btn variant="light" size="sm" className="mt-3" onClick={() => { setRound((r) => r + 1); setGuess(null); setRevealed(0); }}>
              Next chart
            </Btn>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Label className="mb-0 mr-1">Stake</Label>
        {[10, 25, 50].map((s) => (
          <button
            key={s}
            disabled={!!guess}
            onClick={() => { setStake(s); sfx("select"); }}
            className={cn("flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-black transition active:translate-y-0.5", stake === s ? "bg-gold text-ink-950 shadow-[0_3px_0_#c2850a]" : "bg-ink-800 text-ink-300 shadow-[0_3px_0_#0b1838]")}
          >
            <CoinIcon size={14} /> {s}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-bold text-ink-400">Win pays 2×</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn variant="bull" size="lg" disabled={!!guess} data-pressed={guess === "up"} onClick={(e) => place("up", e.currentTarget)}>
          <Icon name="trendUp" size={22} stroke={3} /> Higher
        </Btn>
        <Btn variant="bear" size="lg" disabled={!!guess} data-pressed={guess === "down"} onClick={(e) => place("down", e.currentTarget)}>
          <Icon name="trendDown" size={22} stroke={3} /> Lower
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-09 · RISK MANAGER — drag Stop-Loss & Take-Profit, then run market
 * ===================================================================== */
function walk(seed: number, n: number, start: number, vol: number) {
  const r = mulberry32(seed);
  const out: number[] = [];
  let p = start;
  let m = 0;
  for (let i = 0; i < n; i++) {
    m = m * 0.6 + (r() - 0.5) * 0.016 * vol;
    p = p * (1 + m);
    out.push(p);
  }
  return out;
}

function RiskManager() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const past = useMemo(() => walk(round * 31 + 7, 42, 100, 0.8), [round]);
  const entry = past[past.length - 1];
  const future = useMemo(() => walk(round * 53 + 19, 70, entry, 1.15), [round, entry]);
  const [tp, setTp] = useState(entry * 1.04);
  const [sl, setSl] = useState(entry * 0.98);
  const [n, setN] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | "tp" | "sl" | "none">(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const resRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"tp" | "sl" | null>(null);
  const minP = entry * 0.9;
  const maxP = entry * 1.1;
  const W = 400;
  const H = 230;
  const split = 200;
  const y = (v: number) => ((maxP - v) / (maxP - minP)) * H;
  const px = (i: number) => (i / 41) * split;
  const fx_ = (i: number) => split + (i / 70) * (W - split - 56);
  const rr = (tp - entry) / (entry - sl);
  const size = 1000;
  const profit = (size * (tp - entry)) / entry;
  const loss = (size * (entry - sl)) / entry;

  useEffect(() => {
    setTp(entry * 1.04);
    setSl(entry * 0.98);
    setN(0);
    setResult(null);
    setRunning(false);
  }, [entry]);

  useEffect(() => {
    if (!running) return;
    let i = n;
    const t = setInterval(() => {
      i++;
      const v = future[i - 1];
      setN(i);
      sfx("tick", 0.7 + (v - entry) / entry * 8);
      let res: "tp" | "sl" | "none" | null = null;
      if (v >= tp) res = "tp";
      else if (v <= sl) res = "sl";
      else if (i >= future.length) res = "none";
      if (res) {
        clearInterval(t);
        setRunning(false);
        setResult(res);
        if (res === "tp") {
          sfx("success");
          g.reward("coins", Math.max(20, Math.round(profit)), resRef.current);
        } else if (res === "sl") {
          sfx(rr >= 2 ? "pop" : "lose");
          if (rr >= 2) g.reward("xp", 10, resRef.current);
        } else sfx("pop");
      }
    }, 55);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const priceAt = (cy: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    return maxP - ((cy - r.top) / r.height) * (maxP - minP);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const p = priceAt(e.clientY);
    if (dragRef.current === "tp") setTp(clamp(p, entry * 1.004, maxP * 0.995));
    else setSl(clamp(p, minP * 1.005, entry * 0.996));
    sfx("tick");
  };
  const handle = (kind: "tp" | "sl", v: number) => {
    const col = kind === "tp" ? "#22d39a" : "#ff4d6d";
    const pct = ((v - entry) / entry) * 100;
    return (
      <g
        className={cn(result || running ? "" : "cursor-ns-resize")}
        onPointerDown={(e) => {
          if (running || result) return;
          dragRef.current = kind;
          svgRef.current?.setPointerCapture(e.pointerId);
          sfx("select");
        }}
      >
        <line x1="0" x2={W} y1={y(v)} y2={y(v)} stroke={col} strokeWidth="2" strokeDasharray="6 4" />
        <rect x={W - 58} y={y(v) - 12} width="56" height="24" rx="8" fill={col} />
        <text x={W - 30} y={y(v) + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill={kind === "tp" ? "#03281b" : "#fff"}>
          {kind.toUpperCase()} {pct > 0 ? "+" : ""}
          {pct.toFixed(1)}%
        </text>
        <rect x="0" y={y(v) - 14} width={W} height="28" fill="transparent" />
      </g>
    );
  };
  const pastPath = past.map((v, i) => `${i ? "L" : "M"}${px(i)},${y(v)}`).join("");
  const futPath = [`M${split},${y(entry)}`, ...future.slice(0, n).map((v, i) => `L${fx_(i + 1)},${y(v)}`)].join("");
  const rrColor = rr >= 2 ? "text-bull" : rr >= 1 ? "text-gold" : "text-bear";
  return (
    <Asset title="Risk Manager · SL / TP" code="G-09" tags="stop loss take profit risk reward drag lines simulate market" span={7} badge="New">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Long BTC · $1,000</div>
          <div className="font-display text-base font-black text-white">Drag your stop & target, then run</div>
        </div>
        <div className="ml-auto flex gap-2 text-center">
          <div className="panel-inset rounded-xl px-3 py-1.5">
            <div className="text-[9px] font-black uppercase text-ink-500">R : R</div>
            <div className={cn("font-mono text-sm font-bold", rrColor)}>1 : {rr.toFixed(1)}</div>
          </div>
          <div className="panel-inset rounded-xl px-3 py-1.5">
            <div className="text-[9px] font-black uppercase text-ink-500">Win / Loss</div>
            <div className="font-mono text-sm font-bold">
              <span className="text-bull">+${profit.toFixed(0)}</span> <span className="text-ink-500">/</span> <span className="text-bear">-${loss.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
      <div ref={resRef} className="panel-inset relative mt-3 overflow-hidden rounded-2xl">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none" onPointerMove={onMove} onPointerUp={() => (dragRef.current = null)} onPointerCancel={() => (dragRef.current = null)}>
          <rect x="0" y={y(tp)} width={W} height={y(entry) - y(tp)} fill="#22d39a" opacity=".08" />
          <rect x="0" y={y(entry)} width={W} height={y(sl) - y(entry)} fill="#ff4d6d" opacity=".08" />
          <line x1={split} x2={split} y1="0" y2={H} stroke="#27427d" strokeDasharray="3 4" />
          <path d={pastPath} fill="none" stroke="#8ea4d2" strokeWidth="2" />
          <path d={futPath} fill="none" stroke={result === "tp" ? "#22d39a" : result === "sl" ? "#ff4d6d" : "#2fd4ff"} strokeWidth="2.6" strokeLinejoin="round" />
          {n > 0 && <circle cx={fx_(n)} cy={y(future[n - 1])} r="5" fill="#fff" className={running ? "anim-glow" : ""} />}
          <line x1="0" x2={W} y1={y(entry)} y2={y(entry)} stroke="#e3eaf8" strokeWidth="1.5" strokeOpacity=".7" />
          <rect x="4" y={y(entry) - 11} width="64" height="22" rx="7" fill="#e3eaf8" />
          <text x="36" y={y(entry) + 4} textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#0d1a3d">
            ENTRY
          </text>
          {handle("tp", tp)}
          {handle("sl", sl)}
        </svg>
        {result && (
          <div className="anim-slide-up absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl bg-ink-950/90 p-3 ring-1 ring-white/10 backdrop-blur">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", result === "tp" ? "bg-bull text-ink-950" : result === "sl" ? "bg-bear text-white" : "bg-azure text-white")}>
              <Icon name={result === "tp" ? "trophy" : result === "sl" ? "shield" : "clock"} size={20} stroke={2.6} />
            </span>
            <div className="flex-1">
              <div className={cn("font-display text-sm font-black", result === "tp" ? "text-bull" : result === "sl" ? "text-bear" : "text-azure")}>
                {result === "tp" ? `Take-profit hit! +$${profit.toFixed(0)}` : result === "sl" ? `Stopped out · -$${loss.toFixed(0)}` : "Closed at market"}
              </div>
              <div className="text-[11px] font-semibold text-ink-300">
                {result === "sl" ? (rr >= 2 ? "Small loss, great R:R — that's how pros survive. +10 XP" : "Tight R:R makes losses hurt. Aim for 1:2+.") : result === "tp" ? "Plan the trade, trade the plan." : "Neither level hit in time."}
              </div>
            </div>
            <Btn variant="azure" size="sm" onClick={() => setRound((r) => r + 1)}>
              Next
            </Btn>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[11px] font-bold text-ink-400">Drag the green / red tags ↕</span>
        <Btn variant="bull" className="ml-auto" disabled={running || !!result} onClick={() => { setRunning(true); sfx("go"); }} sound={false}>
          <Icon name="play" size={16} /> Run market
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-10 · MEMORY FLIP — 3D card pairs with timer and star rating
 * ===================================================================== */
const MEM = [
  { k: "btc", g: "₿", c: "#f7931a", n: "Bitcoin" },
  { k: "eth", g: "Ξ", c: "#627eea", n: "Ethereum" },
  { k: "sol", g: "◎", c: "#14f195", n: "Solana" },
  { k: "doge", g: "Ð", c: "#c2a633", n: "Doge" },
  { k: "bull", g: "🐂", c: "#22d39a", n: "Bull" },
  { k: "bear", g: "🐻", c: "#ff4d6d", n: "Bear" },
];

function MemoryFlip() {
  const g = useGame();
  const [seed, setSeed] = useState(1);
  const deck = useMemo(() => shuffleSeeded([...MEM, ...MEM].map((m, i) => ({ ...m, id: i })), seed * 17 + 3), [seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [t0, setT0] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [fire, setFire] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const refs = useRef<Record<number, HTMLButtonElement | null>>({});
  const complete = matched.length === MEM.length;

  useEffect(() => {
    if (!t0 || complete) return;
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, [t0, complete]);

  const flip = (id: number) => {
    const card = deck[id];
    if (open.length === 2 || open.includes(id) || matched.includes(card.k)) return;
    if (!t0) setT0(Date.now());
    sfx("flip");
    const nx = [...open, id];
    setOpen(nx);
    if (nx.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nx.map((x) => deck[x]);
      if (a.k === b.k) {
        setTimeout(() => {
          setMatched((m) => {
            const next = [...m, a.k];
            if (next.length === MEM.length) {
              setFire((f) => f + 1);
              sfx("levelup");
            }
            return next;
          });
          setOpen([]);
          sfx("success");
          fx.burst(refs.current[id], { colors: [a.c, "#fff", "#ffc23d"], count: 16, spread: 60 });
        }, 380);
      } else {
        setTimeout(() => {
          setOpen([]);
          sfx("tap");
        }, 850);
      }
    }
  };
  const secs = t0 ? Math.floor(((complete ? now : now || Date.now()) - t0) / 1000) : 0;
  const stars = moves <= 8 ? 3 : moves <= 12 ? 2 : 1;
  return (
    <Asset title="Memory Flip" code="G-10" tags="memory flip cards pairs concentration 3d coins" span={5}>
      <Confetti fire={fire} count={36} />
      <div className="mb-3 flex items-center gap-2">
        <div className="font-display text-sm font-black text-white">Match the pairs</div>
        <Chip tone="azure" className="ml-auto">
          <Icon name="refresh" size={11} /> {moves}
        </Chip>
        <Chip tone="violet">
          <Icon name="clock" size={11} /> {secs}s
        </Chip>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {deck.map((c) => {
          const up = open.includes(c.id) || matched.includes(c.k);
          const isM = matched.includes(c.k);
          return (
            <button
              key={`${seed}-${c.id}`}
              ref={(el) => {
                refs.current[c.id] = el;
              }}
              onClick={() => flip(c.id)}
              className="anim-pop relative aspect-[3/4] [perspective:600px]"
              style={{ animationDelay: `${c.id * 35}ms` }}
            >
              <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: up ? "rotateY(180deg)" : "none" }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-b from-ink-600 to-ink-700 shadow-[0_4px_0_#0b1838] [backface-visibility:hidden] hover:brightness-110">
                  <div className="h-8 w-8 rounded-xl border-2 border-dashed border-ink-400/60" />
                </div>
                <div
                  className={cn("absolute inset-0 flex flex-col items-center justify-center rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]", isM && "ring-2 ring-white/70")}
                  style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${c.c} 70%, white), ${c.c})`, boxShadow: `0 4px 0 color-mix(in srgb, ${c.c} 45%, black)` }}
                >
                  <span className="font-display text-2xl font-black text-white drop-shadow">{c.g}</span>
                  <span className="text-[8px] font-black uppercase text-white/80">{c.n}</span>
                  {isM && <span className="sheen absolute inset-0 rounded-2xl" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        {complete ? (
          <>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((s) => (
                <span key={s} className={cn("anim-pop text-xl", s < stars ? "text-gold" : "text-ink-600")} style={{ animationDelay: `${s * 120}ms` }}>
                  ★
                </span>
              ))}
            </div>
            <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", stars * 10, e.currentTarget); }}>
              <XPIcon size={16} /> {claimed ? "Claimed" : `+${stars * 10}`}
            </Btn>
          </>
        ) : (
          <span className="text-[11px] font-bold text-ink-400">
            {matched.length}/{MEM.length} pairs found
          </span>
        )}
        <Btn
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            setSeed((s) => s + 1);
            setOpen([]);
            setMatched([]);
            setMoves(0);
            setT0(null);
            setNow(0);
            setClaimed(false);
          }}
        >
          Reshuffle
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-11 · MATCH PAIRS — glossary terms ↔ definitions
 * ===================================================================== */
const PAIRS = [
  ["HODL", "Hold long-term"],
  ["FOMO", "Fear of missing out"],
  ["ATH", "All-time high"],
  ["DCA", "Buy fixed amounts regularly"],
  ["Rekt", "Heavy loss"],
];
function MatchPairs() {
  const g = useGame();
  const [left, setLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [order, setOrder] = useState(() => [3, 0, 4, 1, 2]);
  const [fire, setFire] = useState(0);
  const pick = (r: number, el: HTMLElement) => {
    if (left === null || matched.includes(r)) return;
    if (left === r) {
      const m = [...matched, r];
      setMatched(m);
      setLeft(null);
      sfx("success", 1 + m.length * 0.06);
      fx.ring(el, "#22d39a");
      if (m.length === PAIRS.length) {
        setFire((f) => f + 1);
        g.reward("xp", 20, el);
      }
    } else {
      setWrong([left, r]);
      sfx("error");
      setTimeout(() => {
        setWrong(null);
        setLeft(null);
      }, 500);
    }
  };
  const tile = (active: boolean, done: boolean, bad: boolean) =>
    cn(
      "flex h-12 w-full items-center justify-center rounded-2xl border-2 px-2 text-center text-xs font-extrabold transition-all duration-200 active:translate-y-1",
      done
        ? "scale-95 border-ink-700 bg-ink-850 text-ink-600 shadow-none"
        : bad
          ? "anim-shake border-bear bg-bear/15 text-bear shadow-[0_4px_0_#b31f3d]"
          : active
            ? "border-azure bg-azure/15 text-white shadow-[0_4px_0_#1c55c2]"
            : "border-ink-600 bg-ink-800 text-ink-100 shadow-[0_4px_0_#0b1838] hover:bg-ink-750",
    );
  return (
    <Asset title="Match Pairs" code="G-11" tags="match pairs vocabulary terms game glossary" span={5}>
      <Confetti fire={fire} />
      <div className="mb-4 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Tap the matching pairs</div>
        <span className="font-mono text-xs font-bold text-bull">
          {matched.length}/{PAIRS.length}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          {PAIRS.map(([t], i) => (
            <button key={t} disabled={matched.includes(i)} onClick={() => { setLeft(i); sfx("select"); }} className={tile(left === i, matched.includes(i), wrong?.[0] === i)}>
              {matched.includes(i) && <Icon name="check" size={14} stroke={3} className="mr-1 text-bull" />}
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {order.map((i) => (
            <button key={i} disabled={matched.includes(i)} onClick={(e) => pick(i, e.currentTarget)} className={tile(false, matched.includes(i), wrong?.[1] === i)}>
              {PAIRS[i][1]}
            </button>
          ))}
        </div>
      </div>
      {matched.length === PAIRS.length && (
        <div className="anim-pop mt-4 flex items-center justify-between rounded-2xl bg-bull/15 p-3 ring-1 ring-bull/40">
          <span className="font-display text-sm font-black text-bull">Glossary mastered!</span>
          <Btn variant="bull" size="sm" onClick={() => { setMatched([]); setOrder((o) => shuffleSeeded(o, Date.now() % 997)); }}>
            Replay
          </Btn>
        </div>
      )}
    </Asset>
  );
}

/* =====================================================================
 * G-12 · PORTFOLIO BALANCER — allocate, then survive a random scenario
 * ===================================================================== */
const ASSETS = [
  { s: "BTC", c: "#f7931a", vol: 0.6 },
  { s: "ETH", c: "#627eea", vol: 0.8 },
  { s: "SOL", c: "#14f195", vol: 1.2 },
  { s: "USDT", c: "#26a17b", vol: 0 },
];
const SCENARIOS = [
  { n: "Bull Run", e: "🚀", d: "Risk-on euphoria lifts everything.", r: [0.45, 0.7, 1.4, 0], good: "risk" },
  { n: "Market Crash", e: "💥", d: "Leverage flush — alts bleed hardest.", r: [-0.35, -0.48, -0.65, 0], good: "safe" },
  { n: "ETH Season", e: "Ξ", d: "Ecosystem upgrades rotate money into ETH.", r: [0.08, 0.6, 0.2, 0], good: "eth" },
  { n: "Sideways Chop", e: "〰️", d: "Nothing trends; volatility eats gains.", r: [-0.03, -0.06, -0.12, 0.01], good: "safe" },
];

function PortfolioBalancer() {
  const g = useGame();
  const [w, setW] = useState([40, 30, 20, 10]);
  const [phase, setPhase] = useState<"plan" | "flip" | "result">("plan");
  const [sc, setSc] = useState(0);
  const [value, setValue] = useState(10000);
  const [grow, setGrow] = useState(0);
  const resRef = useRef<HTMLDivElement>(null);
  const setWeight = (i: number, v: number) => {
    setW((ws) => {
      const others = ws.reduce((a, x, j) => (j === i ? a : a + x), 0);
      const rest = 100 - v;
      return ws.map((x, j) => (j === i ? v : others === 0 ? rest / (ws.length - 1) : (x / others) * rest));
    });
  };
  const risk = w.reduce((a, x, i) => a + (x / 100) * ASSETS[i].vol, 0);
  const S = SCENARIOS[sc];
  const final = w.reduce((a, x, i) => a + 10000 * (x / 100) * (1 + S.r[i]), 0);
  const graded = (() => {
    if (S.good === "risk") return w[3] < 25 && final > 13000;
    if (S.good === "safe") return w[3] >= 35 || final > 9000;
    return w[1] >= 30;
  })();
  const simulate = () => {
    const pick = Math.floor(Math.random() * SCENARIOS.length);
    setSc(pick);
    setPhase("flip");
    sfx("whoosh");
    setTimeout(() => {
      setPhase("result");
      const S2 = SCENARIOS[pick];
      const f = w.reduce((a, x, i) => a + 10000 * (x / 100) * (1 + S2.r[i]), 0);
      tween(10000, f, 1600, (v, p) => {
        setValue(v);
        setGrow(p);
      });
      setTimeout(() => {
        sfx(f >= 10000 ? "success" : "lose");
      }, 1600);
    }, 900);
  };
  useEffect(() => {
    if (phase === "result" && grow >= 1 && graded) g.reward("xp", 25, resRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grow >= 1]);
  return (
    <Asset title="Portfolio Balancer" code="G-12" tags="portfolio allocation sliders scenario simulation risk diversification" span={7}>
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div>
          <div className="mb-3 flex h-8 overflow-hidden rounded-xl ring-1 ring-white/10">
            {w.map((x, i) => (
              <div key={i} className="flex items-center justify-center text-[10px] font-black text-white transition-all duration-300" style={{ width: `${x}%`, background: ASSETS[i].c }}>
                {x > 9 ? `${Math.round(x)}%` : ""}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {ASSETS.map((a, i) => (
              <div key={a.s} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: a.c }}>
                  {a.s.slice(0, 1)}
                </span>
                <span className="w-12 text-xs font-extrabold text-white">{a.s}</span>
                <input type="range" min={0} max={100} value={Math.round(w[i])} disabled={phase !== "plan"} onChange={(e) => setWeight(i, +e.target.value)} className="flex-1" style={{ accentColor: a.c }} />
                <span className="w-10 text-right font-mono text-xs font-bold text-ink-200">{Math.round(w[i])}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Label className="mb-0">Risk</Label>
            <div className="panel-inset h-3 flex-1 overflow-hidden rounded-full">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${clamp(risk / 1.2, 0, 1) * 100}%`, background: "linear-gradient(90deg,#22d39a,#ffc23d,#ff4d6d)" }} />
            </div>
            <span className="font-mono text-xs font-bold text-ink-200">{(risk * 10).toFixed(1)}</span>
          </div>
        </div>
        <div ref={resRef} className="relative [perspective:900px]">
          <div className="relative h-full min-h-[230px] transition-transform duration-700 [transform-style:preserve-3d]" style={{ transform: phase === "plan" ? "none" : "rotateY(180deg)" }}>
            <div className="panel-raised absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-4 text-center [backface-visibility:hidden]">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/20 text-3xl">🎲</div>
              <div className="mt-3 font-display text-sm font-black text-white">Mystery scenario</div>
              <div className="text-[11px] font-semibold text-ink-400">Balance for anything. The market decides.</div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-ink-600 to-ink-800 p-4 text-center shadow-[0_5px_0_#081231] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="text-3xl">{S.e}</div>
              <div className="font-display text-base font-black text-white">{S.n}</div>
              <div className="text-[11px] font-semibold text-ink-300">{S.d}</div>
              <div className={cn("mt-2 font-mono text-2xl font-bold", value >= 10000 ? "text-bull" : "text-bear")}>${Math.round(value).toLocaleString()}</div>
              <div className="mt-2 flex w-full items-end justify-center gap-2" style={{ height: 50 }}>
                {ASSETS.map((a, i) => (
                  <div key={a.s} className="flex flex-col items-center">
                    <div className="w-6 origin-bottom rounded-t" style={{ height: 4 + Math.abs(S.r[i]) * 30 * grow, background: S.r[i] >= 0 ? "#22d39a" : "#ff4d6d" }} />
                    <span className="text-[8px] font-black text-ink-400">{a.s}</span>
                  </div>
                ))}
              </div>
              {grow >= 1 && <Chip tone={graded ? "bull" : "bear"} className="anim-pop mt-2">{graded ? "Well balanced · +25 XP" : "Rebalance next time"}</Chip>}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-3">
        <span className="text-[11px] font-bold text-ink-400">Starting capital $10,000</span>
        {phase === "plan" ? (
          <Btn variant="violet" className="ml-auto" onClick={simulate} sound={false}>
            <Icon name="play" size={16} /> Simulate
          </Btn>
        ) : (
          <Btn variant="ghost" className="ml-auto" onClick={() => { setPhase("plan"); setValue(10000); setGrow(0); }}>
            Try again
          </Btn>
        )}
      </div>
    </Asset>
  );
}

export default function MiniGames() {
  return (
    <>
      <SwipeBullBear />
      <Predict />
      <RiskManager />
      <MemoryFlip />
      <MatchPairs />
      <PortfolioBalancer />
    </>
  );
}
