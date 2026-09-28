import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Asset, Btn, Coin, Confetti, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { clamp } from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 * MICROGAMES
 * Each interaction trains one market skill and has a clear win / loss state.
 * =============================================================================*/

type Candle = { open: number; close: number; high: number; low: number };

function classifyCandle(candle: Candle) {
  const body = Math.abs(candle.close - candle.open);
  const upper = candle.high - Math.max(candle.open, candle.close);
  const lower = Math.min(candle.open, candle.close) - candle.low;
  if (body < 5 && upper > 8 && lower > 8) return "Doji";
  if (lower > body * 2.2 && upper < body) return "Hammer";
  if (upper > body * 2.2 && lower < body) return "Shooting star";
  if (body > 34 && upper < 6 && lower < 6) return "Marubozu";
  return candle.close >= candle.open ? "Bull candle" : "Bear candle";
}

function CandleForge() {
  const [candle, setCandle] = useState<Candle>({ open: 58, close: 68, high: 73, low: 22 });
  const [target, setTarget] = useState("Hammer");
  const [checked, setChecked] = useState<"win" | "lose" | null>(null);
  const [burst, setBurst] = useState(0);
  const pattern = classifyCandle(candle);
  const update = (key: keyof Candle, value: number) => {
    setChecked(null);
    setCandle((current) => {
      const next = { ...current, [key]: value };
      next.high = Math.max(next.high, next.open, next.close);
      next.low = Math.min(next.low, next.open, next.close);
      return next;
    });
  };
  const check = () => {
    const won = pattern === target;
    setChecked(won ? "win" : "lose");
    if (won) setBurst((value) => value + 1);
  };
  const next = () => {
    const patterns = ["Hammer", "Shooting star", "Doji", "Marubozu"];
    setTarget(patterns[(patterns.indexOf(target) + 1) % patterns.length]);
    setChecked(null);
  };
  const y = (value: number) => 210 - value * 1.75;
  const bullish = candle.close >= candle.open;
  const color = bullish ? "#22d38a" : "#ff4b6e";

  return (
    <Asset code="GAME-01" title="Candle Forge" desc="Build the requested candlestick by adjusting OHLC values. Constraint logic keeps high/low valid; classification updates instantly." tags={["builder", "OHLC", "puzzle"]} span={2}>
      <div className="grid lg:grid-cols-[300px_1fr] gap-5 relative">
        <Confetti burst={burst} count={28} />
        <div className="well dotgrid min-h-80 grid place-items-center relative">
          <svg viewBox="0 0 180 230" className="w-48 h-72">
            {[35, 75, 115, 155, 195].map((line) => <line key={line} x1="20" x2="160" y1={line} y2={line} stroke="rgba(140,175,255,.08)" />)}
            <line x1="90" x2="90" y1={y(candle.high)} y2={y(candle.low)} stroke={color} strokeWidth="5" strokeLinecap="round" />
            <rect x="58" y={y(Math.max(candle.open, candle.close))} width="64" height={Math.max(4, Math.abs(y(candle.open) - y(candle.close)))} rx="9" fill={color} />
            <rect x="64" y={y(Math.max(candle.open, candle.close)) + 5} width="12" height={Math.max(0, Math.abs(y(candle.open) - y(candle.close)) - 10)} rx="5" fill="rgba(255,255,255,.25)" />
            {[["H", candle.high], ["O", candle.open], ["C", candle.close], ["L", candle.low]].map(([label, value]) => <g key={label as string}><line x1="125" x2="145" y1={y(value as number)} y2={y(value as number)} stroke="#8ea3cf" strokeDasharray="3 3" /><text x="150" y={y(value as number) + 3} fill="#8ea3cf" fontSize="8" fontWeight="800">{label as string}</text></g>)}
          </svg>
          <div className="absolute top-3 left-3 right-3 flex justify-between"><span className="text-[8px] uppercase tracking-widest font-black text-mist">Live classification</span><span className="text-[10px] font-black" style={{ color }}>{pattern}</span></div>
        </div>
        <div className="flex flex-col">
          <div className="rounded-2xl p-4 bg-violet/10 border border-violet/25 mb-4"><div className="text-[9px] uppercase tracking-widest font-black text-violet">Build this pattern</div><div className="text-2xl font-black mt-1">{target}</div><div className="text-[10px] text-mist mt-1">Use the four sliders. Shape matters more than color.</div></div>
          <div className="space-y-3">
            {(["high", "open", "close", "low"] as const).map((key) => (
              <label key={key} className="grid grid-cols-[42px_1fr_34px] items-center gap-2">
                <span className="text-[9px] uppercase font-black text-mist">{key}</span>
                <input type="range" min={5} max={95} value={candle[key]} onChange={(event) => update(key, +event.target.value)} className="accent-violet" />
                <span className="num text-[10px] font-black text-right">{candle[key]}</span>
              </label>
            ))}
          </div>
          {checked && <div className={cn("mt-4 rounded-xl p-3 flex items-center gap-2 text-[10px] font-black anim-rise", checked === "win" ? "bg-bull/10 text-bull border border-bull/25" : "bg-bear/10 text-bear border border-bear/25")}><Icon name={checked === "win" ? "check" : "x"} size={16} stroke={3} />{checked === "win" ? `Correct: ${pattern} · +20 XP` : `This is ${pattern}. Keep shaping it.`}</div>}
          <div className="grid grid-cols-2 gap-3 mt-auto pt-4"><Btn variant="ghost" onClick={next}>New target</Btn><Btn variant="violet" onClick={check}>Check shape</Btn></div>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Stop-loss placement ---------- */

function StopLossDrop() {
  const [line, setLine] = useState(68);
  const [side, setSide] = useState<"long" | "short">("long");
  const [score, setScore] = useState<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const ideal = side === "long" ? 73 : 27;

  const update = (clientY: number) => {
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds) return;
    setLine(clamp(((clientY - bounds.top) / bounds.height) * 100, 8, 92));
    setScore(null);
  };
  const check = () => setScore(Math.round(Math.max(0, 100 - Math.abs(line - ideal) * 5.5)));

  return (
    <Asset code="GAME-02" title="Place the Stop" desc="Drag the stop line under support for a long, or above resistance for a short. Score rewards protection without choking the trade." tags={["drag", "risk", "precision"]}>
      <div className="flex gap-2 mb-3">{(["long", "short"] as const).map((value) => <button key={value} onClick={() => { setSide(value); setLine(value === "long" ? 68 : 32); setScore(null); }} className={cn("h-9 px-4 rounded-xl border-2 text-[9px] font-black uppercase", side === value ? value === "long" ? "border-bull bg-bull/10 text-bull" : "border-bear bg-bear/10 text-bear" : "border-ink-600 text-mist")}>{value}</button>)}<span className="ml-auto text-[9px] text-mist self-center">Entry: <b className="num text-fog">$67,420</b></span></div>
      <div ref={stage} className="relative h-72 well rounded-2xl overflow-hidden touch-none">
        <svg viewBox="0 0 380 240" className="absolute inset-0 w-full h-full">
          {[45, 95, 145, 195].map((y) => <line key={y} x1="0" x2="380" y1={y} y2={y} stroke="rgba(140,175,255,.07)" />)}
          <path d="M0 175 C35 168 52 140 88 154 S138 168 164 130 S215 125 235 98 S282 112 310 73 S350 80 380 55" fill="none" stroke="#3da5ff" strokeWidth="3" />
          <rect x="40" y="170" width="150" height="20" rx="6" fill="rgba(34,211,138,.08)" stroke="rgba(34,211,138,.45)" strokeDasharray="4 4" />
          <text x="115" y="165" fill="#22d38a" textAnchor="middle" fontSize="8" fontWeight="800">SUPPORT ZONE</text>
          <rect x="225" y="45" width="140" height="18" rx="6" fill="rgba(255,75,110,.08)" stroke="rgba(255,75,110,.45)" strokeDasharray="4 4" />
          <text x="295" y="40" fill="#ff4b6e" textAnchor="middle" fontSize="8" fontWeight="800">RESISTANCE</text>
        </svg>
        <div className="absolute left-0 right-0 h-[2px] bg-gold shadow-[0_0_12px_#ffc53d]" style={{ top: `${line}%` }}>
          <button
            onPointerDown={(event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => { if (dragging.current) update(event.clientY); }}
            onPointerUp={() => { dragging.current = false; }}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 px-3 rounded-xl bg-gold text-ink-900 num text-[9px] font-black shadow-[0_3px_0_#b07600] cursor-ns-resize"
          >
            STOP ${Math.round(68100 - line * 15)}
          </button>
        </div>
        <div className="absolute left-3 top-3 text-[8px] uppercase tracking-widest font-black text-mist">Drag gold stop line</div>
      </div>
      {score !== null && <div key={score} className={cn("mt-3 rounded-xl p-3 flex items-center gap-3 anim-score-pop", score >= 85 ? "bg-bull/10 text-bull" : score >= 55 ? "bg-gold/10 text-gold" : "bg-bear/10 text-bear")}><Icon name={score >= 85 ? "check" : "alert"} size={18} /><div><div className="num font-black">{score}% risk quality</div><div className="text-[9px] opacity-75">{score >= 85 ? "Protected and outside market noise." : "Recheck the nearest structural level."}</div></div></div>}
      <Btn variant="gold" size="sm" block className="mt-3" onClick={check}>Evaluate stop</Btn>
    </Asset>
  );
}

/* ---------- Order book rush ---------- */

type BookRow = { id: number; price: number; size: number; side: "bid" | "ask"; hot?: boolean };

function makeBook(seed: number): BookRow[] {
  const rows: BookRow[] = [];
  for (let index = 0; index < 6; index++) rows.push({ id: seed * 100 + index, price: 67430 + index * 4, size: 0.2 + ((seed + index * 3) % 9) * 0.17, side: "ask", hot: index === seed % 6 });
  for (let index = 0; index < 6; index++) rows.push({ id: seed * 100 + 20 + index, price: 67418 - index * 4, size: 0.25 + ((seed + index * 5) % 8) * 0.16, side: "bid", hot: index === (seed + 2) % 6 });
  return rows;
}

function OrderBookRush() {
  const [seed, setSeed] = useState(1);
  const [rows, setRows] = useState(() => makeBook(1));
  const [target, setTarget] = useState<"largest" | "best" | "hot">("largest");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const nextRound = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setRows(makeBook(nextSeed));
    setTarget(((["largest", "best", "hot"] as const)[nextSeed % 3]));
  };
  const pick = (row: BookRow) => {
    const max = Math.max(...rows.map((item) => item.size));
    const correct = target === "largest" ? row.size === max : target === "hot" ? !!row.hot : row.side === "bid" ? row.price === Math.max(...rows.filter((item) => item.side === "bid").map((item) => item.price)) : row.price === Math.min(...rows.filter((item) => item.side === "ask").map((item) => item.price));
    setFeedback(correct ? "ok" : "bad");
    if (correct) { setScore((value) => value + 100 + combo * 25); setCombo((value) => value + 1); }
    else setCombo(0);
    setTimeout(() => { setFeedback(null); nextRound(); }, 420);
  };
  const asks = rows.filter((row) => row.side === "ask").reverse();
  const bids = rows.filter((row) => row.side === "bid");
  const maxSize = Math.max(...rows.map((row) => row.size));
  const label = target === "largest" ? "Tap the largest wall" : target === "hot" ? "Tap the flashing order" : "Tap best bid or ask";
  return (
    <Asset code="GAME-03" title="Order Book Rush" desc="Read depth under pressure: find the largest wall, best quote or flashing update. Correct streaks earn a combo multiplier." tags={["order book", "speed", "combo"]}>
      <div className="flex items-center justify-between mb-3"><div><div className="text-[9px] uppercase tracking-widest font-black text-sky">Round {seed}</div><div className="font-black">{label}</div></div><div className="text-right"><div className="num text-lg font-black text-gold">{score}</div><div className="text-[8px] text-mist">combo ×{combo}</div></div></div>
      <div className={cn("well rounded-2xl p-2 transition-colors", feedback === "ok" ? "!bg-bull/10" : feedback === "bad" ? "!bg-bear/10 anim-shake" : "")}>
        <div className="grid grid-cols-3 px-2 pb-1 text-[8px] uppercase font-black text-mist"><span>Price</span><span className="text-right">Size</span><span className="text-right">Depth</span></div>
        {[...asks, ...bids].map((row, index) => (
          <button key={row.id} onClick={() => pick(row)} className="relative w-full grid grid-cols-3 px-2 py-1.5 rounded-lg overflow-hidden hover:bg-white/[.04] text-left">
            <span className={cn("absolute right-0 inset-y-0", row.side === "bid" ? "bg-bull/10" : "bg-bear/10")} style={{ width: `${(row.size / maxSize) * 100}%` }} />
            <span className={cn("num text-[10px] font-black relative", row.side === "bid" ? "text-bull" : "text-bear")}>{row.price}</span>
            <span className="num text-[10px] text-right relative">{row.size.toFixed(3)}</span>
            <span className="num text-[9px] text-right text-mist relative">{Math.round(row.size * 67)}k</span>
            {row.hot && <span className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full bg-gold anim-pulse-ring" style={{ ["--ring" as string]: "rgba(255,197,61,.55)" }} />}
            {index === 5 && <span className="absolute inset-x-0 -bottom-px h-px bg-white/10" />}
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* ---------- Allocation puzzle ---------- */

const ALLOCATION_ASSETS = [
  { symbol: "BTC", risk: 2, color: "#F7931A" },
  { symbol: "ETH", risk: 3, color: "#7B8CFF" },
  { symbol: "SOL", risk: 5, color: "#14F195" },
  { symbol: "DOGE", risk: 8, color: "#C2A633" },
];

function AllocationPuzzle() {
  const [values, setValues] = useState([45, 30, 20, 5]);
  const [checked, setChecked] = useState(false);
  const total = values.reduce((sum, value) => sum + value, 0);
  const risk = values.reduce((sum, value, index) => sum + value * ALLOCATION_ASSETS[index].risk, 0) / Math.max(1, total);
  const valid = total === 100 && risk <= 3.7 && values[3] <= 10;
  const update = (index: number, value: number) => {
    setChecked(false);
    setValues((items) => items.map((item, itemIndex) => itemIndex === index ? value : item));
  };
  const normalize = () => {
    const sum = values.reduce((acc, value) => acc + value, 0) || 1;
    const next = values.map((value) => Math.round((value / sum) * 100));
    next[0] += 100 - next.reduce((acc, value) => acc + value, 0);
    setValues(next);
  };
  return (
    <Asset code="GAME-04" title="Allocation Puzzle" desc="Build a 100% demo portfolio under a risk cap. The allocation bar, risk grade and constraints update live." tags={["portfolio", "sliders", "puzzle"]}>
      <div className="rounded-2xl game-surface p-4 mb-4">
        <div className="flex h-5 rounded-full overflow-hidden mb-3">
          {values.map((value, index) => <div key={ALLOCATION_ASSETS[index].symbol} className="h-full transition-[width] duration-300 relative" style={{ width: `${Math.max(0, value)}%`, background: ALLOCATION_ASSETS[index].color }}>{value >= 12 && <span className="absolute inset-0 grid place-items-center num text-[8px] font-black text-ink-950">{value}%</span>}</div>)}
        </div>
        <div className="flex items-center justify-between"><div><div className="text-[8px] uppercase tracking-widest font-black text-mist">Allocation</div><div className={cn("num text-xl font-black", total === 100 ? "text-bull" : "text-bear")}>{total}%</div></div><div className="text-center"><div className="text-[8px] uppercase tracking-widest font-black text-mist">Risk score</div><div className={cn("num text-xl font-black", risk <= 3.7 ? "text-bull" : risk <= 5 ? "text-gold" : "text-bear")}>{risk.toFixed(1)}</div></div><div className="text-right"><div className="text-[8px] uppercase tracking-widest font-black text-mist">Target</div><div className="text-xs font-black">≤ 3.7</div></div></div>
      </div>
      <div className="space-y-3">
        {ALLOCATION_ASSETS.map((asset, index) => (
          <label key={asset.symbol} className="grid grid-cols-[34px_1fr_38px] items-center gap-2">
            <Coin sym={asset.symbol} size={30} />
            <input type="range" min={0} max={80} step={5} value={values[index]} onChange={(event) => update(index, +event.target.value)} style={{ accentColor: asset.color }} />
            <span className="num text-[10px] font-black text-right">{values[index]}%</span>
          </label>
        ))}
      </div>
      <div className="rounded-xl bg-sky/[.06] border border-sky/20 p-3 mt-4 text-[9px] text-mist"><b className="text-sky">Constraints:</b> exactly 100%; risk ≤ 3.7; DOGE ≤ 10%.</div>
      {checked && <div className={cn("rounded-xl p-3 mt-3 flex items-center gap-2 text-[10px] font-black anim-rise", valid ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}><Icon name={valid ? "check" : "alert"} size={16} />{valid ? "Balanced portfolio · +30 XP" : total !== 100 ? "Allocation must equal 100%." : "Risk is above the mission limit."}</div>}
      <div className="grid grid-cols-2 gap-3 mt-4"><Btn variant="ghost" size="sm" onClick={normalize}>Normalize</Btn><Btn variant="bull" size="sm" onClick={() => setChecked(true)}>Submit mix</Btn></div>
    </Asset>
  );
}

/* ---------- Trendline drawing challenge ---------- */

function TrendlineChallenge() {
  const stage = useRef<SVGSVGElement>(null);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const points = [165, 152, 158, 138, 145, 122, 128, 112, 118, 94, 103, 82, 91, 70, 76, 58];
  const getPoint = (event: ReactPointerEvent<SVGSVGElement>) => {
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return { x: ((event.clientX - bounds.left) / bounds.width) * 360, y: ((event.clientY - bounds.top) / bounds.height) * 210 };
  };
  const check = () => {
    if (!line) return;
    const drawnSlope = (line.y2 - line.y1) / Math.max(1, line.x2 - line.x1);
    const targetSlope = (58 - 165) / 315;
    const slopeScore = Math.max(0, 100 - Math.abs(drawnSlope - targetSlope) * 170);
    const anchorScore = Math.max(0, 100 - (Math.abs(line.y1 - 165) + Math.abs(line.y2 - 58)) * 0.8);
    setScore(Math.round(slopeScore * 0.65 + anchorScore * 0.35));
  };
  return (
    <Asset code="GAME-05" title="Draw the Trend" desc="Draw a support trendline through rising lows. Scoring compares slope and anchor accuracy with the hidden target." tags={["draw", "chart", "precision"]} span={2}>
      <div className="game-surface rounded-[24px] p-4">
        <div className="flex items-center justify-between mb-3"><div><div className="text-[9px] uppercase tracking-widest font-black text-violet">Technical analysis drill</div><div className="font-black">Connect the rising lows</div></div>{score !== null && <div className={cn("num text-2xl font-black", score > 80 ? "text-bull" : score > 55 ? "text-gold" : "text-bear")}>{score}%</div>}</div>
        <div className="well rounded-xl overflow-hidden touch-none">
          <svg
            ref={stage}
            viewBox="0 0 360 210"
            className="w-full h-64 cursor-crosshair"
            onPointerDown={(event) => { const point = getPoint(event); start.current = point; setLine({ ...point, x1: point.x, y1: point.y, x2: point.x, y2: point.y }); setScore(null); event.currentTarget.setPointerCapture(event.pointerId); }}
            onPointerMove={(event) => { if (!start.current) return; const point = getPoint(event); setLine({ x1: start.current.x, y1: start.current.y, x2: point.x, y2: point.y }); }}
            onPointerUp={() => { start.current = null; }}
          >
            {[35, 75, 115, 155, 195].map((y) => <line key={y} x1="0" x2="360" y1={y} y2={y} stroke="rgba(140,175,255,.07)" />)}
            <polyline points={points.map((value, index) => `${15 + index * 22},${value}`).join(" ")} fill="none" stroke="#3da5ff" strokeWidth="3" strokeLinejoin="round" />
            {points.filter((_, index) => index % 3 === 0).map((value, index) => <circle key={index} cx={15 + index * 66} cy={value} r="4" fill="#eef3ff" />)}
            {line && <><line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={score !== null ? score > 80 ? "#22d38a" : "#ffc53d" : "#9b6bff"} strokeWidth="4" strokeLinecap="round" /><circle cx={line.x1} cy={line.y1} r="6" fill="#9b6bff" /><circle cx={line.x2} cy={line.y2} r="6" fill="#9b6bff" /></>}
            {score !== null && <line x1="15" y1="173" x2="345" y2="57" stroke="#22d38a" strokeDasharray="5 5" opacity=".55" />}
          </svg>
        </div>
        <div className="flex items-center gap-3 mt-3"><span className="text-[9px] text-mist flex-1">Drag directly across the chart. The green dashed line appears only after grading.</span><Btn variant="violet" size="sm" disabled={!line} onClick={check}>Grade line</Btn></div>
      </div>
    </Asset>
  );
}

/* ---------- News impact decision game ---------- */

const NEWS = [
  { title: "Protocol pauses withdrawals after oracle issue", tag: "Security", answer: "reduce", why: "Unpriced operational risk should reduce exposure before analysis." },
  { title: "ETF inflows reach a new monthly high", tag: "Flow", answer: "wait", why: "Flow is supportive, but chasing one headline creates poor entries." },
  { title: "Network fees fall 68% after upgrade", tag: "Fundamental", answer: "research", why: "Lower costs may change usage; verify activity before acting." },
  { title: "Anonymous account predicts BTC to $1M", tag: "Noise", answer: "ignore", why: "A prediction without evidence does not change the trade plan." },
];

function NewsImpactGame() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const item = NEWS[index % NEWS.length];
  const answer = (value: string) => {
    if (choice) return;
    setChoice(value);
    if (value === item.answer) { setScore((current) => current + 100 + streak * 20); setStreak((current) => current + 1); }
    else setStreak(0);
  };
  const next = () => { setIndex((value) => (value + 1) % NEWS.length); setChoice(null); };
  return (
    <Asset code="GAME-06" title="News Filter" desc="Separate signal, research and noise. Feedback explains process rather than rewarding reflexive bullish or bearish guesses." tags={["news", "decision", "media literacy"]}>
      <div className="rounded-[24px] overflow-hidden game-surface">
        <div className="p-4 border-b border-white/[.07] flex items-center justify-between"><span className="text-[9px] uppercase tracking-widest font-black text-mist">Market desk · breaking</span><span className="num text-xs font-black text-gold">{score} pts · ×{streak}</span></div>
        <div className="p-5 min-h-44 flex flex-col" key={index}>
          <span className="self-start text-[8px] uppercase tracking-widest font-black px-2 py-1 rounded-lg bg-bear/15 text-bear">{item.tag}</span>
          <h4 className="text-xl font-black leading-tight mt-3">{item.title}</h4>
          <div className="text-[9px] text-mist mt-auto pt-4">What changes in your process?</div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          {[["reduce", "Reduce exposure", "shield"], ["wait", "Wait for setup", "clock"], ["research", "Research data", "search"], ["ignore", "Ignore noise", "eyeOff"]].map(([value, label, icon]) => {
            const selected = choice === value;
            const correct = choice && value === item.answer;
            const wrong = selected && value !== item.answer;
            return <button key={value} onClick={() => answer(value)} className={cn("h-12 rounded-xl border-2 text-[9px] font-black flex items-center justify-center gap-2 transition-all", !choice && "border-ink-600 bg-ink-800 shadow-[0_3px_0_#0a1430]", correct && "border-bull bg-bull/10 text-bull", wrong && "border-bear bg-bear/10 text-bear anim-shake", choice && !selected && !correct && "opacity-40 border-ink-700")}><Icon name={correct ? "check" : wrong ? "x" : icon} size={15} />{label}</button>;
          })}
        </div>
        {choice && <div className="mx-4 mb-4 rounded-xl p-3 bg-sky/[.06] border border-sky/20 anim-rise"><div className={cn("text-[10px] font-black", choice === item.answer ? "text-bull" : "text-bear")}>{choice === item.answer ? "Strong process" : `Better action: ${item.answer}`}</div><div className="text-[9px] text-mist mt-1 leading-relaxed">{item.why}</div><button onClick={next} className="mt-2 text-[9px] font-black text-sky flex items-center gap-1">Next headline <Icon name="chevR" size={12} /></button></div>}
      </div>
    </Asset>
  );
}

/* ---------- Liquidity hunt reflex field ---------- */

type Bubble = { id: number; x: number; y: number; value: number; born: number; whale: boolean };

function LiquidityHunt() {
  const [running, setRunning] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [time, setTime] = useState(20);
  const idRef = useRef(1);

  useInterval(() => {
    if (!running) return;
    const id = idRef.current++;
    const whale = id % 5 === 0;
    setBubbles((items) => [...items.slice(-9), { id, x: 8 + ((id * 47) % 84), y: 10 + ((id * 73) % 72), value: whale ? 250 : 40 + (id % 4) * 20, born: Date.now(), whale }]);
  }, 620);
  useInterval(() => {
    if (!running) return;
    setTime((value) => {
      if (value <= 1) { setRunning(false); return 0; }
      return value - 1;
    });
    const now = Date.now();
    setBubbles((items) => {
      const expired = items.filter((item) => now - item.born > 2600).length;
      if (expired) setMisses((value) => value + expired);
      return items.filter((item) => now - item.born <= 2600);
    });
  }, 1000);

  const start = () => { setRunning(true); setBubbles([]); setScore(0); setMisses(0); setTime(20); };
  const hit = (bubble: Bubble) => { setScore((value) => value + bubble.value); setBubbles((items) => items.filter((item) => item.id !== bubble.id)); };
  return (
    <Asset code="GAME-07" title="Liquidity Hunt" desc="Tap disappearing liquidity bubbles before they age out. Whale orders are rarer, larger and worth more." tags={["tap", "reflex", "liquidity"]} span={2}>
      <div className="relative h-[420px] rounded-[24px] panel overflow-hidden">
        <div className="absolute inset-0 dotgrid opacity-30" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 360"><path d="M0 220 C75 240 95 140 165 188 S275 220 320 135 S440 188 500 88 S570 110 600 58" fill="none" stroke="#3da5ff" strokeWidth="3" opacity=".45" /></svg>
        <div className="absolute left-4 right-4 top-4 flex items-center gap-3 z-10"><span className="num text-xl font-black text-gold">{score}</span><span className="text-[8px] uppercase tracking-widest font-black text-mist">liquidity pts</span><span className="ml-auto num text-sm font-black text-bear">{time}s</span><span className="text-[8px] text-mist">miss {misses}</span></div>
        {bubbles.map((bubble) => {
          const age = clamp((Date.now() - bubble.born) / 2600, 0, 1);
          const size = bubble.whale ? 70 : 44;
          return <button key={bubble.id} onClick={() => hit(bubble)} className="absolute rounded-full grid place-items-center anim-pop" style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, width: size, height: size, transform: "translate(-50%,-50%)", color: bubble.whale ? "#3a2500" : "#fff", background: bubble.whale ? "radial-gradient(circle at 35% 28%,#ffe08a,#ffc53d 65%,#b07600)" : "radial-gradient(circle at 35% 28%,#6dbbff,#3da5ff 65%,#1a56a8)", boxShadow: `0 5px 0 rgba(0,0,0,.35),0 0 ${18 - age * 10}px ${bubble.whale ? "#ffc53d" : "#3da5ff"}`, opacity: 1 - age * .55 }}><span className="num text-[9px] font-black">{bubble.whale ? "WHALE" : bubble.value}</span><svg className="absolute inset-[-5px] w-[calc(100%+10px)] h-[calc(100%+10px)] -rotate-90" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeDasharray="138" strokeDashoffset={138 * age} /></svg></button>;
        })}
        {!running && <div className="absolute inset-0 bg-ink-950/62 backdrop-blur-sm grid place-items-center z-20"><div className="text-center"><Icon name="target" size={48} className="mx-auto text-sky mb-3" /><div className="font-black text-xl">{time === 0 ? `Run complete · ${score} pts` : "Spot the liquidity"}</div><div className="text-xs text-mist mt-1 mb-4">20 seconds · whale bubbles = 250</div><Btn variant="sky" icon="play" onClick={start}>{time === 0 ? "Play again" : "Start hunt"}</Btn></div></div>}
      </div>
    </Asset>
  );
}

/* ---------- Pattern memory reveal ---------- */

function PatternMemory() {
  const patterns = [
    { name: "Double bottom", icon: "trendUp", answer: 1 },
    { name: "Head and shoulders", icon: "trendDown", answer: 2 },
    { name: "Ascending triangle", icon: "chart", answer: 0 },
  ];
  const [round, setRound] = useState(0);
  const [visible, setVisible] = useState(true);
  const [choice, setChoice] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const pattern = patterns[round % patterns.length];
  useEffect(() => {
    setVisible(true); setChoice(null);
    const timer = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(timer);
  }, [round]);
  const choose = (index: number) => { if (choice !== null) return; setChoice(index); if (index === pattern.answer) setPoints((value) => value + 100); };
  const paths = ["M10 90 L70 25 L130 90 L190 25 L250 90", "M10 90 Q65 35 120 90 Q175 35 230 90", "M10 82 L65 35 L120 80 L170 18 L230 84"];
  return (
    <Asset code="GAME-08" title="Pattern Memory" desc="Memorize a chart for 1.7 seconds, then choose its structure after the chart is masked. Trains recall, not recognition-by-label." tags={["memory", "chart", "recall"]}>
      <div className="game-surface rounded-[24px] p-4">
        <div className="flex justify-between mb-3"><div><div className="text-[9px] uppercase tracking-widest font-black text-violet">Chart recall</div><div className="font-black">{visible ? "Memorize the structure" : "Which pattern did you see?"}</div></div><div className="num text-lg font-black text-gold">{points}</div></div>
        <div className="relative h-44 well rounded-xl overflow-hidden">
          <svg viewBox="0 0 260 110" className={cn("absolute inset-0 w-full h-full transition-all duration-500", visible ? "opacity-100 blur-0" : "opacity-0 blur-lg scale-110")}><path d={paths[pattern.answer]} fill="none" stroke="#9b6bff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><line x1="0" x2="260" y1="90" y2="90" stroke="#22d38a" strokeDasharray="5 4" /></svg>
          {!visible && <div className="absolute inset-0 grid place-items-center"><Icon name="eyeOff" size={38} className="text-ink-500" /><div className="absolute bottom-4 text-[9px] text-mist">Chart hidden</div></div>}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">{patterns.map((item, index) => { const selected = choice === index; const correct = choice !== null && index === pattern.answer; const wrong = selected && !correct; return <button key={item.name} disabled={visible || choice !== null} onClick={() => choose(index)} className={cn("min-h-14 rounded-xl border-2 px-2 text-[9px] font-black transition-all", visible && "opacity-30 border-ink-700", !visible && choice === null && "border-ink-600 bg-ink-800 shadow-[0_3px_0_#0a1430]", correct && "border-bull bg-bull/10 text-bull", wrong && "border-bear bg-bear/10 text-bear anim-shake")}><Icon name={correct ? "check" : wrong ? "x" : item.icon} size={15} className="mx-auto mb-1" />{item.name}</button>; })}</div>
        {choice !== null && <div className="flex items-center justify-between mt-3 anim-rise"><span className={cn("text-[10px] font-black", choice === pattern.answer ? "text-bull" : "text-bear")}>{choice === pattern.answer ? "+100 · clean recall" : `It was ${pattern.name}`}</span><Btn variant="ghost" size="xs" iconRight="chevR" onClick={() => setRound((value) => value + 1)}>Next</Btn></div>}
      </div>
    </Asset>
  );
}

export default function Microgames() {
  return (
    <Section id="microgames" index="03" title="Microgames" subtitle="Short, replayable drills where motion is the mechanic: build a candle, place risk, read depth, draw structure, filter news and hunt liquidity.">
      <CandleForge />
      <StopLossDrop />
      <OrderBookRush />
      <AllocationPuzzle />
      <TrendlineChallenge />
      <NewsImpactGame />
      <LiquidityHunt />
      <PatternMemory />
    </Section>
  );
}