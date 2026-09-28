/* ------------------------------------------------------------------
 * 37 · PRACTICE SUITE — rapid-fire micro drills (10 modes)
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ComboMeter, fireSmall, fireWin, GameSection, TimerRing, StarBurst } from "../fx/gamekit";
import { genOHLC, detectPatterns, calcLiquidation, calcPnL, positionSize } from "../game/engines";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

type Mode = "hub" | "flashcards" | "math" | "pattern-spot" | "liq-calc" | "size-calc" | "truefalse" | "order" | "match" | "timer-grid" | "chart-call";

const modes: { id: Mode; t: string; s: string; c: string }[] = [
  { id: "flashcards", t: "Term Flash", s: "Flip 12 terms", c: "#5b8cff" },
  { id: "math", t: "PnL Math", s: "Compute quickly", c: "#8ef23c" },
  { id: "pattern-spot", t: "Spot Pattern", s: "Name the candle cluster", c: "#F7931A" },
  { id: "liq-calc", t: "Liq Calculator", s: "Guess liquidation zone", c: "#ff5470" },
  { id: "size-calc", t: "Size Wizard", s: "Risk % → size", c: "#ffc531" },
  { id: "truefalse", t: "True/False Sprint", s: "20 statements", c: "#a78bff" },
  { id: "order", t: "Priority Order", s: "Rank process steps", c: "#14c8f5" },
  { id: "match", t: "Pair Match", s: "Term ↔ definition", c: "#2ede8a" },
  { id: "timer-grid", t: "Grid Tap", s: "Hit green cells", c: "#ff8b3d" },
  { id: "chart-call", t: "Chart Call", s: "Bull or bear bias", c: "#9ff5ff" },
];

const terms = [
  ["HODL", "Hold through volatility"], ["FOMO", "Fear of missing out"], ["ATH", "All-time high"],
  ["DCA", "Average entries over time"], ["TP", "Take profit"], ["SL", "Stop loss"],
  ["R:R", "Reward to risk ratio"], ["OI", "Open interest"], ["CVD", "Cumulative volume delta"],
  ["VWAP", "Volume weighted average price"], ["IB", "Initial balance"], ["MMR", "Maintenance margin"],
];

const tfStatements: { t: string; ok: boolean }[] = [
  { t: "Stop-loss is optional for leverage", ok: false },
  { t: "1% risk is a common pro rule", ok: true },
  { t: "Funding always predicts price", ok: false },
  { t: "Higher TF bias first", ok: true },
  { t: "Revenge trading improves edge", ok: false },
  { t: "Volume can confirm breakouts", ok: true },
  { t: "All indicators are holy grail", ok: false },
  { t: "Journaling improves process", ok: true },
  { t: "Correlated longs reduce heat", ok: false },
  { t: "R:R 1:3 can work under 50% WR", ok: true },
  { t: "Liquidation is a profit bonus", ok: false },
  { t: "Session opens can be volatile", ok: true },
  { t: "Gap = guaranteed direction", ok: false },
  { t: "Process > single trade outcome", ok: true },
  { t: "Max leverage always optimal", ok: false },
  { t: "Support can become resistance", ok: true },
  { t: "News spikes have free liquidity", ok: false },
  { t: "Plan before entry", ok: true },
  { t: "FOMO is a valid strategy", ok: false },
  { t: "Size from risk not emotion", ok: true },
];

function Flashcards({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const done = i >= terms.length;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      {done ? (
        <div className="py-8 text-center"><StarBurst stars={known > 9 ? 3 : 2} /><p className="display mt-3 text-xl font-extrabold text-white">{known}/{terms.length} known</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-4 px-6 py-3 text-xs">Back</button></div>
      ) : (
        <>
          <div className="perspective mx-auto h-[180px] max-w-sm cursor-pointer" onClick={() => { setFlip(f => !f); sfx.soft(); }}>
            <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: flip ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-[#5b8cff]/40 bg-gradient-to-b from-[#1b3773] to-[#0e1f4a] display text-2xl font-extrabold text-white" style={{ backfaceVisibility: "hidden", boxShadow: "0 6px 0 #030816" }}>{terms[i][0]}</div>
              <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-[#8ef23c]/40 bg-gradient-to-b from-[#1c3a12] to-[#0d1f08] p-4 text-center text-sm font-bold text-[#c8f5a0]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 6px 0 #030816" }}>{terms[i][1]}</div>
            </motion.div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => { setI(i + 1); setFlip(false); sfx.error(); }} className="btn3d btn3d-ghost py-3 text-xs">Still learning</button>
            <button onClick={() => { setKnown(k => k + 1); setI(i + 1); setFlip(false); onXp(3); sfx.success(); }} className="btn3d btn3d-green py-3 text-xs">Got it</button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#7d92c4]">{i + 1}/{terms.length}</p>
        </>
      )}
    </div>
  );
}

function MathDrill({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const mk = () => {
    const entry = 100 + Math.random() * 50;
    const price = entry * (1 + (Math.random() - 0.5) * 0.06);
    const size = 100; const lev = 5 + Math.floor(Math.random() * 10);
    const side = Math.random() > 0.5 ? "long" as const : "short" as const;
    const pnl = calcPnL(entry, price, size, lev, side);
    return { entry, price, size, lev, side, pnl };
  };
  const [q, setQ] = useState(mk);
  const [score, setScore] = useState(0);
  const [n, setN] = useState(0);
  const options = useMemo(() => {
    const correct = Math.round(q.pnl);
    const opts = [correct, correct + 12, correct - 9, correct + 25].sort(() => Math.random() - 0.5);
    return opts;
  }, [q]);
  const pick = (v: number) => {
    const ok = v === Math.round(q.pnl);
    if (ok) { setScore(s => s + 1); onXp(5); sfx.success(); } else sfx.error();
    setN(x => x + 1);
    setQ(mk());
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <p className="text-xs text-[#8ea6d8]">Score {score}/{n}</p>
      <div className="panel-inset mt-2 p-4">
        <p className="display text-sm font-extrabold text-white">{q.side.toUpperCase()} · size ${q.size} · ×{q.lev}</p>
        <p className="num-mono mt-1 text-xs text-[#aebde6]">Entry {q.entry.toFixed(2)} → Mark {q.price.toFixed(2)}</p>
        <p className="mt-3 text-xs font-bold text-white">Unrealized PnL ≈ ?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {options.map(o => (
            <button key={o} onClick={() => pick(o)} className="btn3d btn3d-ghost py-3 text-xs num-mono">{o >= 0 ? "+" : ""}{o}</button>
          ))}
        </div>
      </div>
      {n >= 8 && <button onClick={() => { fireSmall(); onBack(); }} className="btn3d btn3d-green mt-3 w-full py-3 text-xs">Finish</button>}
    </div>
  );
}

function PatternSpot({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const [seed, setSeed] = useState(3);
  const candles = useMemo(() => genOHLC(30, 100, seed, 2.2), [seed]);
  const pats = useMemo(() => detectPatterns(candles), [candles]);
  const target = pats[pats.length - 1];
  const [msg, setMsg] = useState("");
  const options = ["Hammer", "Shooting Star", "Bull Engulfing", "Bear Engulfing", "Doji", "Three Soldiers", "None clear"];
  const W = 400, H = 140;
  const min = Math.min(...candles.map(c => c.l)), max = Math.max(...candles.map(c => c.h));
  const y = (v: number) => 8 + (1 - (v - min) / (max - min || 1)) * (H - 16);
  const bw = W / candles.length;
  const guess = (name: string) => {
    const ok = target ? name === target.name : name === "None clear";
    setMsg(ok ? "Correct" : `Answer: ${target?.name || "None clear"}`);
    if (ok) { onXp(8); sfx.success(); } else sfx.error();
    setTimeout(() => { setSeed(s => s + 1); setMsg(""); }, 900);
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <div className="panel-inset p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {candles.map((c, i) => {
            const up = c.c >= c.o; const col = up ? "#2ede8a" : "#ff5470";
            return <g key={i}><line x1={i * bw + bw / 2} x2={i * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.2" /><rect x={i * bw + bw * 0.2} y={y(Math.max(c.o, c.c))} width={bw * 0.6} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} fill={col} /></g>;
          })}
        </svg>
      </div>
      <p className="mt-2 text-center text-xs font-bold text-[#aebde6]">{msg || "Name the latest pattern"}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map(o => <button key={o} onClick={() => guess(o)} className="btn3d btn3d-ghost py-2.5 text-[10px]">{o}</button>)}
      </div>
    </div>
  );
}

function LiqCalc({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const [entry] = useState(100);
  const [lev, setLev] = useState(10);
  const [side, setSide] = useState<"long" | "short">("long");
  const liq = calcLiquidation(entry, lev, side);
  const [guess, setGuess] = useState(90);
  const [msg, setMsg] = useState("");
  const check = () => {
    const err = Math.abs(guess - liq);
    const ok = err < 2;
    setMsg(ok ? `Nice! Liq ${liq.toFixed(2)}` : `Liq is ${liq.toFixed(2)} (err ${err.toFixed(1)})`);
    if (ok) { onXp(10); sfx.success(); } else sfx.error();
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <div className="panel-3d p-4 space-y-3">
        <div className="flex gap-2">
          <button onClick={() => setSide("long")} className={cn("btn3d flex-1 py-2 text-[11px]", side === "long" ? "btn3d-long" : "btn3d-ghost")}>Long</button>
          <button onClick={() => setSide("short")} className={cn("btn3d flex-1 py-2 text-[11px]", side === "short" ? "btn3d-short" : "btn3d-ghost")}>Short</button>
        </div>
        <label className="block text-[10px] font-extrabold text-[#7d92c4]">Leverage ×{lev}
          <input type="range" min={2} max={50} value={lev} onChange={e => setLev(+e.target.value)} className="lever mt-1 w-full" style={{ ["--fill" as string]: `${(lev / 50) * 100}%` }} />
        </label>
        <label className="block text-[10px] font-extrabold text-[#7d92c4]">Your liq guess {guess.toFixed(1)}
          <input type="range" min={50} max={150} value={guess} onChange={e => setGuess(+e.target.value)} className="lever mt-1 w-full" style={{ ["--fill" as string]: `${((guess - 50) / 100) * 100}%` }} />
        </label>
        <p className="text-xs text-[#8ea6d8]">Entry 100 · estimate liquidation</p>
        <button onClick={check} className="btn3d btn3d-gold w-full py-3 text-xs">Check</button>
        {msg && <p className="text-center text-xs font-bold text-white">{msg}</p>}
      </div>
    </div>
  );
}

function SizeCalc({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const bal = 10000; const risk = 1; const entry = 100; const stop = 97;
  const correct = Math.round(positionSize(bal, risk, entry, stop));
  const [guess, setGuess] = useState(2000);
  const [msg, setMsg] = useState("");
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <div className="panel-3d p-4">
        <p className="text-sm text-[#c9d8ff]">Balance $10,000 · Risk 1% · Entry 100 · Stop 97</p>
        <p className="mt-2 text-xs font-bold text-white">Position notional ≈ ?</p>
        <input type="range" min={500} max={8000} step={100} value={guess} onChange={e => setGuess(+e.target.value)} className="lever mt-3 w-full" style={{ ["--fill" as string]: `${((guess - 500) / 7500) * 100}%` }} />
        <p className="num-mono text-center text-lg font-extrabold text-[#ffc531]">${guess}</p>
        <button onClick={() => {
          const ok = Math.abs(guess - correct) < 400;
          setMsg(ok ? `Close enough · ~$${correct}` : `Target ~$${correct}`);
          if (ok) { onXp(10); sfx.success(); } else sfx.error();
        }} className="btn3d btn3d-blue mt-2 w-full py-3 text-xs">Check</button>
        {msg && <p className="mt-2 text-center text-xs text-white">{msg}</p>}
      </div>
    </div>
  );
}

function TrueFalse({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const done = i >= tfStatements.length;
  const ans = (v: boolean) => {
    const ok = tfStatements[i].ok === v;
    if (ok) { setScore(s => s + 1); setCombo(c => c + 1); onXp(2); sfx.success(); } else { setCombo(0); sfx.error(); }
    setI(x => x + 1);
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      {done ? (
        <div className="py-8 text-center"><StarBurst stars={score > 16 ? 3 : score > 10 ? 2 : 1} /><p className="display mt-3 text-xl font-extrabold text-white">{score}/20</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-4 px-6 py-3 text-xs">Back</button></div>
      ) : (
        <>
          <div className="mb-2 flex justify-between"><ComboMeter combo={combo} /><span className="num-mono text-xs text-white">{i + 1}/20</span></div>
          <div className="panel-3d p-5 text-center"><p className="display text-lg font-extrabold text-white">{tfStatements[i].t}</p></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => ans(false)} className="btn3d btn3d-short py-4 text-sm">FALSE</button>
            <button onClick={() => ans(true)} className="btn3d btn3d-long py-4 text-sm">TRUE</button>
          </div>
        </>
      )}
    </div>
  );
}

function OrderDrill({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const correct = ["Idea", "Risk %", "Size", "Stop", "Entry", "Manage"];
  const [items, setItems] = useState(() => [...correct].sort(() => Math.random() - 0.5));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir; if (j < 0 || j >= items.length) return;
    setItems(arr => { const n = [...arr]; const t = n[i]; n[i] = n[j]; n[j] = t; return n; });
    sfx.tick();
  };
  const check = () => {
    const ok = items.every((x, i) => x === correct[i]);
    if (ok) { onXp(20); fireWin(); } else sfx.error();
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={it} className="flex items-center gap-2">
            <button onClick={() => move(i, -1)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl text-xs">↑</button>
            <div className="flex-1 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-extrabold text-white">{i + 1}. {it}</div>
            <button onClick={() => move(i, 1)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl text-xs">↓</button>
          </div>
        ))}
      </div>
      <button onClick={check} className="btn3d btn3d-green mt-3 w-full py-3 text-xs">Check order</button>
    </div>
  );
}

function MatchDrill({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  type C = { id: number; t: string; pair: number };
  const pairs = terms.slice(0, 6);
  const build = () => pairs.flatMap((p, i) => [{ id: i * 2, t: p[0], pair: i }, { id: i * 2 + 1, t: p[1], pair: i }]).sort(() => Math.random() - 0.5);
  const [cards, setCards] = useState<C[]>(build);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const flip = (c: C) => {
    if (open.length === 2 || open.includes(c.id) || matched.includes(c.pair)) return;
    const n = [...open, c.id]; setOpen(n); sfx.soft();
    if (n.length === 2) {
      const [a, b] = n.map(id => cards.find(x => x.id === id)!);
      if (a.pair === b.pair) {
        setTimeout(() => {
          const m = [...matched, a.pair]; setMatched(m); setOpen([]); sfx.success(); onXp(4);
          if (m.length === pairs.length) fireWin();
        }, 300);
      } else setTimeout(() => { setOpen([]); sfx.error(); }, 700);
    }
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <div className="grid grid-cols-3 gap-2">
        {cards.map(c => {
          const isOpen = open.includes(c.id) || matched.includes(c.pair);
          return (
            <button key={c.id} onClick={() => flip(c)} className="relative h-16" style={{ perspective: 600 }}>
              <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: isOpen ? 180 : 0 }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#1b3773] text-white font-black" style={{ backfaceVisibility: "hidden" }}>?</div>
                <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-[#8ef23c]/40 bg-[#8ef23c]/15 p-1 text-center text-[9px] font-extrabold text-[#a4ff5e]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>{c.t}</div>
              </motion.div>
            </button>
          );
        })}
      </div>
      <button onClick={() => { setCards(build()); setOpen([]); setMatched([]); }} className="btn3d btn3d-ghost mt-3 w-full py-2 text-[11px]">Shuffle</button>
    </div>
  );
}

function TimerGrid({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const [time, setTime] = useState(15);
  const [score, setScore] = useState(0);
  const [live, setLive] = useState(false);
  const [cells, setCells] = useState(() => Array.from({ length: 16 }, () => Math.random() > 0.7));
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setTime(t => { if (t <= 1) { setLive(false); onXp(score * 2); if (score > 12) fireWin(); else fireSmall(); return 0; } return t - 1; });
      setCells(Array.from({ length: 16 }, () => Math.random() > 0.65));
    }, 1000);
    return () => clearInterval(id);
  }, [live, score, onXp]);
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      {!live ? (
        <div className="py-8 text-center"><button onClick={() => { setLive(true); setTime(15); setScore(0); sfx.whoosh(); }} className="btn3d btn3d-gold px-8 py-3 text-sm">Start 15s</button></div>
      ) : (
        <>
          <div className="mb-2 flex justify-between"><TimerRing seconds={time} max={15} color="#ff8b3d" /><span className="num-mono text-xl font-extrabold text-white">{score}</span></div>
          <div className="grid grid-cols-4 gap-2">
            {cells.map((on, i) => (
              <button key={i} onClick={() => { if (on) { setScore(s => s + 1); sfx.tap(); setCells(c => c.map((v, k) => k === i ? false : v)); } else sfx.error(); }}
                className={cn("aspect-square rounded-xl border-2", on ? "border-[#8ef23c] bg-[#8ef23c]/40" : "border-white/10 bg-black/30")} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChartCall({ onBack, onXp }: { onBack: () => void; onXp: (n: number) => void }) {
  const [seed, setSeed] = useState(5);
  const candles = useMemo(() => genOHLC(40, 100, seed, 1.5), [seed]);
  const up = candles[candles.length - 1].c >= candles[0].c;
  const [score, setScore] = useState(0);
  const W = 420, H = 150;
  const min = Math.min(...candles.map(c => c.l)), max = Math.max(...candles.map(c => c.h));
  const y = (v: number) => 8 + (1 - (v - min) / (max - min || 1)) * (H - 16);
  const bw = W / candles.length;
  const call = (bull: boolean) => {
    const ok = bull === up;
    if (ok) { setScore(s => s + 1); onXp(5); sfx.success(); } else sfx.error();
    setSeed(s => s + 1);
  };
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8]">← Suite</button>
      <p className="mb-2 text-xs text-[#8ea6d8]">Score {score}</p>
      <div className="panel-inset p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {candles.map((c, i) => {
            const u = c.c >= c.o; const col = u ? "#2ede8a" : "#ff5470";
            return <g key={i}><line x1={i * bw + bw / 2} x2={i * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.2" /><rect x={i * bw + bw * 0.2} y={y(Math.max(c.o, c.c))} width={bw * 0.6} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} fill={col} /></g>;
          })}
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={() => call(false)} className="btn3d btn3d-short py-4 text-sm">BEAR</button>
        <button onClick={() => call(true)} className="btn3d btn3d-long py-4 text-sm">BULL</button>
      </div>
    </div>
  );
}

export default function PracticeSuite({ onXp }: Props) {
  const [mode, setMode] = useState<Mode>("hub");
  return (
    <GameSection id="practice" index="37" kicker="Practice Suite" title="10 микро-тренажёров"
      desc="Flashcards, PnL math, pattern spot, liq/size calc, true/false, ordering, match, grid tap, chart call — быстрые повторы."
      right={<Tag tone="green">drills</Tag>}>
      {mode !== "hub" && <button onClick={() => setMode("hub")} className="btn3d btn3d-ghost mb-4 px-4 py-2 text-[11px]">← All drills</button>}
      <AnimatePresence mode="wait">
        {mode === "hub" ? (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {modes.map(m => (
              <button key={m.id} onClick={() => { setMode(m.id); sfx.pop(); }} className="panel-3d p-4 text-left" style={{ borderColor: `${m.c}44` }}>
                <p className="display text-sm font-extrabold text-white">{m.t}</p>
                <p className="text-[11px] text-[#8ea6d8]">{m.s}</p>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel-3d p-5">
            {mode === "flashcards" && <Flashcards onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "math" && <MathDrill onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "pattern-spot" && <PatternSpot onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "liq-calc" && <LiqCalc onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "size-calc" && <SizeCalc onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "truefalse" && <TrueFalse onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "order" && <OrderDrill onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "match" && <MatchDrill onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "timer-grid" && <TimerGrid onBack={() => setMode("hub")} onXp={onXp} />}
            {mode === "chart-call" && <ChartCall onBack={() => setMode("hub")} onXp={onXp} />}
          </motion.div>
        )}
      </AnimatePresence>
    </GameSection>
  );
}
