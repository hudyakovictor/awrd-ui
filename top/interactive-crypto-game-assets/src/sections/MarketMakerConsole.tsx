/* 60 · MARKET MAKER CONSOLE — quote both sides, survive the flow.
   Drag bid/ask handles on a price ladder · taker orders fly in and fill you
   · inventory balance beam tilts · auto-skew · toxic regime · spread vs fills. */
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw, Scale } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { AnimatedNumber, clamp, useOnScreen } from "../showcase/fx";
import { closesPath } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const ROWS = 26;
const TICK = 5; // $ per level
const REGIMES = ["Calm", "Trending", "Toxic"] as const;
type Regime = (typeof REGIMES)[number];

type Flyer = { id: number; side: "buy" | "sell"; filled: boolean; row: number; born: number };
type Fill = { id: number; side: "bid" | "ask"; price: number; size: number };

let flyerId = 1;

export default function MarketMakerConsole() {
  const [mid, setMid] = useState(97400);
  const [bidOff, setBidOff] = useState(3); // levels below mid
  const [askOff, setAskOff] = useState(3); // levels above mid
  const [size, setSize] = useState(0.2);
  const [regime, setRegime] = useState<Regime>("Calm");
  const [autoSkew, setAutoSkew] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [inv, setInv] = useState(0);
  const [cash, setCash] = useState(0);
  const [fills, setFills] = useState<Fill[]>([]);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [pnlHist, setPnlHist] = useState<number[]>(() => Array(60).fill(0));
  const [stats, setStats] = useState({ bid: 0, ask: 0, missed: 0 });
  const { ref: wrapRef, inView } = useOnScreen<HTMLDivElement>();
  const ladderRef = useRef<HTMLDivElement>(null);
  const drag = useRef<"bid" | "ask" | null>(null);
  const drift = useRef(1);

  const skew = autoSkew ? clamp(Math.round(inv / (size * 2)), -3, 3) : 0;
  const effBid = Math.max(1, bidOff + skew);
  const effAsk = Math.max(1, askOff - skew);
  const bidPx = mid - effBid * TICK;
  const askPx = mid + effAsk * TICK;
  const mtm = cash + inv * mid;
  const spreadBps = ((askPx - bidPx) / mid) * 10000;

  useEffect(() => {
    if (!playing || !inView) return;
    const id = window.setInterval(() => {
      // mid dynamics
      if (Math.random() > 0.97) drift.current *= -1;
      const trend = regime === "Calm" ? 0 : regime === "Trending" ? 1.6 * drift.current : 3.4 * drift.current;
      const noise = (Math.random() - 0.5) * (regime === "Toxic" ? 12 : 8);
      const nm = Math.round((mid + trend + noise) / 1) ;
      setMid(nm);

      // takers
      const toxicBias = regime === "Toxic" ? drift.current : regime === "Trending" ? drift.current * 0.5 : 0;
      const arrivals = Math.random() < 0.8 ? 1 : 2;
      const newFlyers: Flyer[] = [];
      let dInv = 0, dCash = 0;
      const newFills: Fill[] = [];
      let sb = 0, sa = 0, miss = 0;
      for (let k = 0; k < arrivals; k++) {
        const side: "buy" | "sell" = Math.random() < 0.5 + toxicBias * 0.28 ? "buy" : "sell";
        const reach = -Math.log(Math.random()) * 3.2; // levels this taker is willing to cross
        let filled = false;
        let row = ROWS / 2;
        if (side === "buy" && reach >= effAsk) {
          filled = true; dInv -= size; dCash += size * askPx; sa++;
          newFills.push({ id: flyerId, side: "ask", price: askPx, size });
          row = ROWS / 2 - effAsk;
        } else if (side === "sell" && reach >= effBid) {
          filled = true; dInv += size; dCash -= size * bidPx; sb++;
          newFills.push({ id: flyerId, side: "bid", price: bidPx, size });
          row = ROWS / 2 + effBid;
        } else {
          miss++;
          row = side === "buy" ? ROWS / 2 - Math.min(reach, 12) : ROWS / 2 + Math.min(reach, 12);
        }
        newFlyers.push({ id: flyerId++, side, filled, row, born: Date.now() });
      }
      if (newFills.length) sfx.coin();
      setInv((v) => +(v + dInv).toFixed(4));
      setCash((c) => c + dCash);
      setFills((f) => [...newFills, ...f].slice(0, 9));
      setFlyers((fl) => [...fl.filter((x) => Date.now() - x.born < 1100), ...newFlyers]);
      setStats((s) => ({ bid: s.bid + sb, ask: s.ask + sa, missed: s.missed + miss }));
    }, 420);
    return () => window.clearInterval(id);
  }, [playing, inView, regime, effAsk, effBid, askPx, bidPx, size, mid]);

  useEffect(() => {
    setPnlHist((h) => [...h.slice(1), mtm]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mid, cash]);

  const reset = () => {
    setInv(0); setCash(0); setFills([]); setFlyers([]); setStats({ bid: 0, ask: 0, missed: 0 });
    setPnlHist(Array(60).fill(0)); setMid(97400); sfx.whoosh();
  };

  const onLadderMove = (clientY: number) => {
    const el = ladderRef.current;
    if (!el || !drag.current) return;
    const r = el.getBoundingClientRect();
    const row = Math.round(((clientY - r.top) / r.height) * ROWS - 0.5);
    const off = drag.current === "ask" ? ROWS / 2 - row : row - ROWS / 2;
    const v = clamp(off, 1, 12);
    if (drag.current === "ask") setAskOff(v); else setBidOff(v);
  };

  const invRisk = Math.abs(inv) / (size * 8);
  const beamTilt = clamp(inv / (size * 10), -1, 1) * 18;
  const fillRate = stats.bid + stats.ask + stats.missed ? ((stats.bid + stats.ask) / (stats.bid + stats.ask + stats.missed)) * 100 : 0;
  const warn = invRisk > 1;

  return (
    <ShowcaseSection
      id="marketmaker" index="60" kicker="Market Maker Console" title="Консоль маркет-мейкера"
      desc="Выставь котировки с обеих сторон и тяни их по лестнице цен. Узкий спред — больше исполнений, но выше риск. В токсичном режиме поток бьёт в одну сторону, и балансир инвентаря заваливается."
      accent="#14c8f5" variant="scan"
      keys={[{ k: "Space", d: "пауза" }, { k: "↑ ↓", d: "спред" }, { k: "K", d: "auto-skew" }, { k: "1–3", d: "режим" }, { k: "F", d: "flatten" }]}
      hotkeys={{
        Space: () => setPlaying((p) => !p),
        ArrowUp: () => { setBidOff((b) => Math.min(12, b + 1)); setAskOff((a) => Math.min(12, a + 1)); },
        ArrowDown: () => { setBidOff((b) => Math.max(1, b - 1)); setAskOff((a) => Math.max(1, a - 1)); },
        k: () => setAutoSkew((v) => !v),
        "1": () => setRegime("Calm"), "2": () => setRegime("Trending"), "3": () => setRegime("Toxic"),
        f: () => { setCash((c) => c + inv * mid - Math.abs(inv) * TICK); setInv(0); sfx.drop(); },
      }}
      moment="Запоминающийся момент: токсичный поток заваливает балансир — и auto-skew вытягивает его обратно"
      tags={<div className="flex gap-2"><Tag tone={warn ? "red" : "blue"}>inv {inv >= 0 ? "+" : ""}{inv.toFixed(2)} BTC</Tag><Tag tone="ghost">{spreadBps.toFixed(1)} bps</Tag></div>}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Seg options={REGIMES} value={regime} onChange={setRegime} accent={regime === "Toxic" ? "#ff5470" : regime === "Trending" ? "#ffc531" : "#14c8f5"} />
        <button onClick={() => { setAutoSkew((v) => !v); sfx.tick(); }} className={cn("btn3d px-3 py-2 text-[10px]", autoSkew ? "btn3d-blue" : "btn3d-ghost")}><Scale size={13} /> Auto-skew</button>
        <label className="flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
          Size {size.toFixed(2)} BTC
          <input type="range" min={0.05} max={1} step={0.05} value={size} onChange={(e) => setSize(+e.target.value)} className="lever w-28" style={{ ["--fill" as string]: `${((size - 0.05) / 0.95) * 100}%` }} />
        </label>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setCash((c) => c + inv * mid - Math.abs(inv) * TICK); setInv(0); sfx.drop(); }} className="btn3d btn3d-gold px-3 py-2 text-[10px]">Flatten</button>
          <button onClick={reset} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><RotateCcw size={12} /></button>
          <button onClick={() => setPlaying((p) => !p)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl">{playing ? <Pause size={14} /> : <Play size={14} />}</button>
        </div>
      </div>

      <div ref={wrapRef} className="grid gap-4 lg:grid-cols-[320px_1fr_270px]">
        {/* LADDER */}
        <ScenePanel title="Price ladder" sub="Тяни зелёную и красную ручки" accent="#14c8f5">
          <div
            ref={ladderRef}
            className="relative h-[440px] touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-[#060d24]"
            onPointerMove={(e) => onLadderMove(e.clientY)}
            onPointerUp={() => { if (drag.current) sfx.soft(); drag.current = null; }}
            onPointerLeave={() => { drag.current = null; }}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const lvl = ROWS / 2 - r;
              const px = mid + lvl * TICK;
              const isAsk = lvl === effAsk, isBid = -lvl === effBid, isMid = lvl === 0;
              return (
                <div key={r} className={cn("absolute inset-x-0 flex items-center justify-between border-b border-white/[.04] px-3 text-[10px]", isMid && "bg-white/8")}
                  style={{ top: `${(r / ROWS) * 100}%`, height: `${100 / ROWS}%` }}>
                  <span className={cn("num-mono font-bold", lvl > 0 ? "text-[#ff8ba0]/70" : lvl < 0 ? "text-[#5ff5a8]/70" : "text-white")}>{px.toLocaleString("en-US")}</span>
                  {isMid && <span className="text-[9px] font-black tracking-widest text-white">MID</span>}
                  {(isAsk || isBid) && <span className="num-mono font-extrabold text-white">{size.toFixed(2)}</span>}
                </div>
              );
            })}
            {/* spread band */}
            <motion.div className="pointer-events-none absolute inset-x-0 bg-[#14c8f5]/10"
              initial={false}
              animate={{ top: `${((ROWS / 2 - effAsk) / ROWS) * 100}%`, height: `${((effAsk + effBid) / ROWS) * 100 + 100 / ROWS}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            {/* flyers */}
            <AnimatePresence>
              {flyers.map((f) => (
                <motion.div key={f.id}
                  className="pointer-events-none absolute z-10 h-3 w-3 rounded-full"
                  style={{ top: `${(f.row / ROWS) * 100}%`, background: f.side === "buy" ? "#2ede8a" : "#ff5470", boxShadow: `0 0 10px ${f.side === "buy" ? "#2ede8a" : "#ff5470"}` }}
                  initial={{ left: f.side === "buy" ? "-5%" : "105%", scale: 0.6, opacity: 1 }}
                  animate={{ left: f.filled ? "70%" : f.side === "buy" ? "40%" : "60%", scale: f.filled ? [1, 2.2, 0] : [1, 0.6], opacity: f.filled ? [1, 1, 0] : [1, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
            {/* handles */}
            {(["ask", "bid"] as const).map((side) => {
              const row = side === "ask" ? ROWS / 2 - effAsk : ROWS / 2 + effBid;
              const col = side === "ask" ? "#ff5470" : "#2ede8a";
              return (
                <motion.div key={side}
                  className="absolute inset-x-1 z-20 flex cursor-ns-resize items-center justify-between rounded-lg border-2 px-2"
                  initial={false}
                  animate={{ top: `${(row / ROWS) * 100}%` }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  style={{ height: `${100 / ROWS}%`, borderColor: col, background: `${col}33`, boxShadow: `0 0 16px ${col}66` }}
                  onPointerDown={(e) => { drag.current = side; ladderRef.current?.setPointerCapture?.(e.pointerId); sfx.tick(); }}
                >
                  <span className="text-[9px] font-black text-white">{side.toUpperCase()}</span>
                  <span className="num-mono text-[10px] font-extrabold text-white">{(side === "ask" ? askPx : bidPx).toLocaleString("en-US")}</span>
                  <span className="text-[10px] text-white/70">⇕</span>
                </motion.div>
              );
            })}
          </div>
        </ScenePanel>

        {/* CENTER */}
        <div className="space-y-4">
          <ScenePanel title="Inventory balance" sub="Балансир наклоняется от позиции" accent={warn ? "#ff5470" : "#14c8f5"}>
            <div className="relative h-[170px]">
              <div className="absolute bottom-6 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[26px] border-b-[46px] border-x-transparent border-b-[#2a4b8f]" />
              <motion.div className="absolute bottom-[70px] left-[8%] right-[8%] h-3 rounded-full"
                animate={{ rotate: beamTilt }} transition={{ type: "spring", stiffness: 70, damping: 9 }}
                style={{ background: warn ? "linear-gradient(90deg,#ff5470,#ff8b3d)" : "linear-gradient(90deg,#2ede8a,#14c8f5)", boxShadow: warn ? "0 0 22px #ff5470" : "0 0 18px #14c8f5" }}
              >
                <div className="absolute -left-2 -top-10 flex h-10 w-16 items-center justify-center rounded-xl border border-white/20 bg-[#0a1740] text-[10px] font-black text-[#5ff5a8]">LONG</div>
                <div className="absolute -right-2 -top-10 flex h-10 w-16 items-center justify-center rounded-xl border border-white/20 bg-[#0a1740] text-[10px] font-black text-[#ff8ba0]">SHORT</div>
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 text-center">
                <AnimatedNumber value={inv} format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)} BTC`} className={cn("num-mono text-xl font-extrabold", warn ? "text-[#ff5470]" : "text-white")} />
              </div>
            </div>
            {warn && <p className="anim-flicker mt-2 rounded-xl border border-[#ff5470]/50 bg-[#ff5470]/10 p-2 text-center text-[11px] font-extrabold text-[#ff8ba0]">⚠ Inventory runaway — расширь спред или включи auto-skew</p>}
          </ScenePanel>
          <ScenePanel title="Mark-to-market PnL" sub="Спред минус адверс-селекшн" accent={mtm >= 0 ? "#2ede8a" : "#ff5470"}>
            <div className="flex items-end justify-between">
              <AnimatedNumber value={mtm} format={(v) => `${v >= 0 ? "+" : "−"}$${Math.abs(v).toFixed(2)}`} className={cn("num-mono text-3xl font-extrabold", mtm >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")} />
              <span className="num-mono text-[11px] font-bold text-[#8ea6d8]">mid {mid.toLocaleString("en-US")}</span>
            </div>
            <svg viewBox="0 0 400 90" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30">
              <line x1={0} x2={400} y1={45} y2={45} stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" />
              <path d={closesPath(pnlHist, 400, 90, 8, Math.min(-5, ...pnlHist), Math.max(5, ...pnlHist))} fill="none" stroke={mtm >= 0 ? "#2ede8a" : "#ff5470"} strokeWidth={2.2} />
            </svg>
          </ScenePanel>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <ScenePanel title="Flow stats" sub={regime} accent="#ffc531">
            <div className="grid grid-cols-2 gap-2">
              <SceneStat label="Bid fills" value={`${stats.bid}`} color="#2ede8a" />
              <SceneStat label="Ask fills" value={`${stats.ask}`} color="#ff5470" />
              <SceneStat label="Fill rate" value={`${fillRate.toFixed(0)}%`} color="#fff" />
              <SceneStat label="Spread" value={`${spreadBps.toFixed(1)}bp`} color="#14c8f5" />
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] font-extrabold"><span className="text-[#5ff5a8]">bids</span><span className="text-[#ff8ba0]">asks</span></div>
              <div className="flex h-3 overflow-hidden rounded-full bg-black/50">
                <motion.div className="h-full bg-[#2ede8a]" initial={false} animate={{ width: `${(stats.bid / Math.max(1, stats.bid + stats.ask)) * 100}%` }} />
                <motion.div className="h-full bg-[#ff5470]" initial={false} animate={{ width: `${(stats.ask / Math.max(1, stats.bid + stats.ask)) * 100}%` }} />
              </div>
            </div>
            {autoSkew && skew !== 0 && <p className="mt-2 text-[11px] font-bold text-[#9db9ff]">skew {skew > 0 ? "−" : "+"}{Math.abs(skew)} lv — котировки уходят от инвентаря</p>}
          </ScenePanel>
          <ScenePanel title="Fills" sub="Последние исполнения" accent="#5b8cff">
            <div className="space-y-1.5">
              <AnimatePresence initial={false}>
                {fills.length === 0 && <p className="py-4 text-center text-[11px] text-[#54678f]">Ожидание потока…</p>}
                {fills.map((f) => (
                  <motion.div key={f.id} layout initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center justify-between rounded-xl border border-white/8 bg-black/25 px-2.5 py-1.5 text-[11px]"
                  >
                    <span className={cn("font-black uppercase", f.side === "bid" ? "text-[#2ede8a]" : "text-[#ff5470]")}>{f.side === "bid" ? "bought" : "sold"}</span>
                    <span className="num-mono font-bold text-white">{f.size.toFixed(2)}</span>
                    <span className="num-mono text-[#8ea6d8]">@ {f.price.toLocaleString("en-US")}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
