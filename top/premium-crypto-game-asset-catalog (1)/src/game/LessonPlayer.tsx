import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { Slider } from "../sections/Controls";
import { cn } from "../utils/cn";
import { Device, StatusBar, GameButton } from "./Device";
import { Mascot, Bubble, type Mood } from "./Mascot";
import { ART, type ArtKey, BoltArt, FlameArt, HeartArt, TrophyArt, GemArt } from "./art";
import { sfx, Confetti, Shake, Rays, Pop, fmtClock } from "./Juice";

/* ================================================================== */
/*  DATA MODEL                                                         */
/* ================================================================== */
type Candle = { o: number; c: number; h: number; l: number };

type Ex =
  | { kind: "choice"; title: string; say: string; options: { t: string; art: ArtKey }[]; answer: number; explain: string }
  | { kind: "chart"; title: string; say: string; candles: Candle[]; answer: number; explain: string }
  | { kind: "match"; title: string; say: string; pairs: [string, string][]; explain: string }
  | { kind: "order"; title: string; say: string; bank: string[]; answer: string[]; explain: string }
  | { kind: "swipe"; title: string; say: string; cards: { t: string; v: boolean }[]; explain: string }
  | { kind: "estimate"; title: string; say: string; min: number; max: number; answer: number; tol: number; prefix: string; explain: string }
  | { kind: "predict"; title: string; say: string; candles: Candle[]; next: "up" | "down"; explain: string };

const ENGULF: Candle[] = [
  { o: 60, c: 56, h: 62, l: 54 },
  { o: 56, c: 52, h: 57.5, l: 50.5 },
  { o: 52, c: 53.5, h: 55, l: 50 },
  { o: 53.5, c: 48, h: 54.5, l: 46.5 },
  { o: 48, c: 45, h: 49, l: 43.5 },
  { o: 45.5, c: 43.5, h: 46.5, l: 41.5 },
  { o: 42.5, c: 51, h: 52, l: 40.5 },
  { o: 51, c: 54.5, h: 56, l: 49.5 },
];

const BREAKOUT: Candle[] = [
  { o: 40, c: 43, h: 44, l: 39 },
  { o: 43, c: 41, h: 45, l: 40 },
  { o: 41, c: 44.5, h: 45.5, l: 40.5 },
  { o: 44.5, c: 42.5, h: 45.5, l: 41.5 },
  { o: 42.5, c: 45, h: 45.8, l: 42 },
  { o: 45, c: 43.8, h: 45.6, l: 43 },
  { o: 43.8, c: 50, h: 51, l: 43.5 },
];

export const LESSON: Ex[] = [
  {
    kind: "choice",
    title: "What does a stop-loss do?",
    say: "Let's start with your safety net.",
    options: [
      { t: "Closes a losing trade automatically", art: "shield" },
      { t: "Doubles your position size", art: "rocket" },
      { t: "Locks your wallet for 24h", art: "lock" },
      { t: "Pays your trading fees", art: "coin" },
    ],
    answer: 0,
    explain: "A stop-loss exits the position at a preset price, capping your downside.",
  },
  {
    kind: "chart",
    title: "Tap the bullish engulfing candle",
    say: "Find the candle that swallows the previous one.",
    candles: ENGULF,
    answer: 6,
    explain: "Candle 7 opens below the prior close and closes above its open — a full engulf.",
  },
  {
    kind: "match",
    title: "Match the slang",
    say: "Traders talk fast. Keep up!",
    pairs: [
      ["Bull", "Price rising"],
      ["Bear", "Price falling"],
      ["HODL", "Hold long-term"],
      ["FOMO", "Fear of missing out"],
    ],
    explain: "You speak fluent trader now.",
  },
  {
    kind: "order",
    title: "Build the golden rule",
    say: "Assemble the most important rule in trading.",
    bank: ["risk", "10%", "per", "Never", "than", "always", "2%", "more", "trade"],
    answer: ["Never", "risk", "more", "than", "2%", "per", "trade"],
    explain: "Never risk more than 2% per trade.",
  },
  {
    kind: "swipe",
    title: "Fact or myth?",
    say: "Swipe right for fact, left for myth.",
    cards: [
      { t: "Bitcoin's supply is capped at 21 million coins.", v: true },
      { t: "Higher leverage lowers your risk.", v: false },
      { t: "Diversification can reduce portfolio risk.", v: true },
    ],
    explain: "Leverage multiplies risk — it never reduces it.",
  },
  {
    kind: "estimate",
    title: "Balance $5,000 · risk 2%. Max loss?",
    say: "Quick maths — drag to your answer.",
    min: 0,
    max: 500,
    answer: 100,
    tol: 10,
    prefix: "$",
    explain: "2% × $5,000 = $100 maximum loss per trade.",
  },
  {
    kind: "predict",
    title: "Breakout on volume. Next move?",
    say: "Price just smashed resistance...",
    candles: BREAKOUT,
    next: "up",
    explain: "A high-volume close above resistance often continues upward.",
  },
];

const KIND_META: Record<Ex["kind"], { l: string; art: ArtKey; c: string }> = {
  choice: { l: "Multiple choice", art: "shield", c: "#38e1ff" },
  chart: { l: "Chart tap", art: "candle", c: "#2be08a" },
  match: { l: "Match pairs", art: "key", c: "#ffc24b" },
  order: { l: "Sentence builder", art: "ticket", c: "#9b6bff" },
  swipe: { l: "Swipe fact/myth", art: "star", c: "#ff4d6a" },
  estimate: { l: "Slider estimate", art: "coin", c: "#ffc24b" },
  predict: { l: "Predict candle", art: "rocket", c: "#38e1ff" },
};

type ReadyFn = (ready: boolean, correct: boolean) => void;
type Phase = "answering" | "correct" | "wrong";

/* ================================================================== */
/*  TILE — the core tactile answer surface                             */
/* ================================================================== */
type TState = "idle" | "selected" | "correct" | "wrong" | "faded";
const TS: Record<TState, { bg: string; bd: string; sh: string; tx: string }> = {
  idle: { bg: "#111c36", bd: "#22355e", sh: "#0a1328", tx: "#dbe5ff" },
  selected: { bg: "color-mix(in srgb, var(--accent) 16%, #111c36)", bd: "var(--accent)", sh: "var(--accent-edge)", tx: "var(--accent)" },
  correct: { bg: "rgba(43,224,138,.16)", bd: "#2be08a", sh: "#0f7048", tx: "#2be08a" },
  wrong: { bg: "rgba(255,77,106,.16)", bd: "#ff4d6a", sh: "#8e0f2c", tx: "#ff4d6a" },
  faded: { bg: "#0d162c", bd: "#18264a", sh: "#0a1122", tx: "#3d4d73" },
};

export function Tile({
  state = "idle",
  onClick,
  children,
  className,
  disabled,
}: {
  state?: TState;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const s = TS[state];
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { y: 3 }}
      animate={
        state === "wrong"
          ? { x: [0, -7, 7, -5, 5, 0], y: 0 }
          : state === "correct"
            ? { scale: [1, 1.06, 1], y: 0 }
            : state === "selected"
              ? { y: 1, x: 0, scale: 1 }
              : { x: 0, y: 0, scale: 1 }
      }
      transition={{ duration: 0.35 }}
      className={cn("relative rounded-2xl border-2 font-bold transition-colors duration-150", className)}
      style={{ background: s.bg, borderColor: s.bd, color: s.tx, boxShadow: `0 ${state === "selected" ? 3 : 4}px 0 ${s.sh}` }}
    >
      {children}
    </motion.button>
  );
}

/* ================================================================== */
/*  CANDLE CHART (shared)                                              */
/* ================================================================== */
function CandleChart({
  data,
  pick,
  onPick,
  reveal,
  answer,
  ghost,
  height = 190,
}: {
  data: Candle[];
  pick?: number | null;
  onPick?: (i: number) => void;
  reveal?: boolean;
  answer?: number;
  ghost?: { dir: "up" | "down"; show: boolean };
  height?: number;
}) {
  const slots = data.length + (ghost ? 1 : 0);
  const all = data.flatMap((d) => [d.h, d.l]);
  const last = data[data.length - 1];
  const gh = ghost ? (ghost.dir === "up" ? last.c + 7 : last.c - 7) : 0;
  const max = Math.max(...all, ghost ? gh + 1 : -Infinity) + 1;
  const min = Math.min(...all, ghost ? gh - 1 : Infinity) - 1;
  const W = 300;
  const H = height;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const bw = W / slots;
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] p-2" style={{ boxShadow: "inset 0 4px 12px rgba(0,0,0,.7)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={W} y1={H * g} y2={H * g} stroke="rgba(120,160,240,.08)" strokeDasharray="4 4" />
        ))}
        {data.map((d, i) => {
          const cx = i * bw + bw / 2;
          const up = d.c >= d.o;
          const col = up ? "#2be08a" : "#ff4d6a";
          const isPick = pick === i;
          const isAns = reveal && answer === i;
          const isWrongPick = reveal && isPick && answer !== i;
          return (
            <g key={i} onClick={() => onPick?.(i)} style={{ cursor: onPick ? "pointer" : "default" }}>
              <rect x={i * bw + 2} y={2} width={bw - 4} height={H - 4} rx={10} fill={isAns ? "rgba(43,224,138,.14)" : isWrongPick ? "rgba(255,77,106,.14)" : isPick ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent"} stroke={isAns ? "#2be08a" : isWrongPick ? "#ff4d6a" : isPick ? "var(--accent)" : "transparent"} strokeWidth="2" />
              <line x1={cx} x2={cx} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="2.4" strokeLinecap="round" />
              <motion.rect
                x={cx - bw * 0.26}
                width={bw * 0.52}
                y={Math.min(y(d.o), y(d.c))}
                height={Math.max(3, Math.abs(y(d.o) - y(d.c)))}
                rx={3}
                fill={col}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: i * 0.05 }}
                style={{ originY: 1, filter: isPick || isAns ? `drop-shadow(0 0 8px ${col})` : undefined }}
              />
              <rect x={cx - bw * 0.26 + 2} width={3} y={Math.min(y(d.o), y(d.c)) + 2} height={Math.max(0, Math.abs(y(d.o) - y(d.c)) - 4)} rx={1.5} fill="#fff" opacity=".3" />
            </g>
          );
        })}
        {ghost && (
          <g>
            <rect x={data.length * bw + 2} y={2} width={bw - 4} height={H - 4} rx={10} fill="rgba(120,160,240,.06)" stroke="rgba(120,160,240,.3)" strokeDasharray="5 4" />
            {!ghost.show && (
              <text x={data.length * bw + bw / 2} y={H / 2 + 8} textAnchor="middle" fontSize="24" fontWeight="900" fill="#3d4d73">
                ?
              </text>
            )}
            {ghost.show && (
              <motion.rect
                x={data.length * bw + bw / 2 - bw * 0.26}
                width={bw * 0.52}
                y={ghost.dir === "up" ? y(gh) : y(last.c)}
                height={Math.abs(y(gh) - y(last.c))}
                rx={3}
                fill={ghost.dir === "up" ? "#2be08a" : "#ff4d6a"}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 14 }}
                style={{ originY: ghost.dir === "up" ? 1 : 0, filter: `drop-shadow(0 0 10px ${ghost.dir === "up" ? "#2be08a" : "#ff4d6a"})` }}
              />
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ================================================================== */
/*  EXERCISES                                                          */
/* ================================================================== */
function ChoiceEx({ ex, phase, onReady }: { ex: Extract<Ex, { kind: "choice" }>; phase: Phase; onReady: ReadyFn }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ex.options.map((o, i) => {
        const A = ART[o.art];
        const st: TState =
          phase !== "answering" ? (i === ex.answer ? "correct" : i === sel ? "wrong" : "faded") : sel === i ? "selected" : "idle";
        return (
          <Tile
            key={i}
            state={st}
            disabled={phase !== "answering"}
            onClick={() => {
              setSel(i);
              sfx("select");
              onReady(true, i === ex.answer);
            }}
            className="flex min-h-[124px] flex-col items-center justify-center gap-2 px-2 py-3 text-center text-[12px] leading-tight"
          >
            <A size={46} />
            <span>{o.t}</span>
            <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-md border-2 border-current font-mono text-[9px] opacity-60">{i + 1}</span>
          </Tile>
        );
      })}
    </div>
  );
}

function ChartEx({ ex, phase, onReady }: { ex: Extract<Ex, { kind: "chart" }>; phase: Phase; onReady: ReadyFn }) {
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div>
      <CandleChart
        data={ex.candles}
        pick={pick}
        reveal={phase !== "answering"}
        answer={ex.answer}
        height={250}
        onPick={
          phase === "answering"
            ? (i) => {
                setPick(i);
                sfx("select");
                onReady(true, i === ex.answer);
              }
            : undefined
        }
      />
      <div className="mt-2 flex justify-between px-1 font-mono text-[9px] uppercase tracking-wider text-ink-500">
        <span>tap a candle</span>
        <span>{pick === null ? "no selection" : `candle #${pick + 1}`}</span>
      </div>
    </div>
  );
}

function shuffle<T>(arr: T[], seed = 7): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MatchEx({ ex, onReady }: { ex: Extract<Ex, { kind: "match" }>; onReady: ReadyFn }) {
  const right = useMemo(() => shuffle(ex.pairs.map((p) => p[1]), 11), [ex]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [flash, setFlash] = useState<string[]>([]);

  useEffect(() => {
    if (!selL || !selR) return;
    const ok = ex.pairs.some(([a, b]) => a === selL && b === selR);
    if (ok) {
      sfx("correct", false);
      setFlash([selL, selR]);
      const nd = [...done, selL, selR];
      setTimeout(() => {
        setDone(nd);
        setFlash([]);
        if (nd.length === ex.pairs.length * 2) onReady(true, true);
      }, 380);
    } else {
      sfx("wrong", false);
      setBad([selL, selR]);
      setTimeout(() => setBad([]), 450);
    }
    setSelL(null);
    setSelR(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selL, selR]);

  const st = (v: string, sel: string | null): TState =>
    done.includes(v) ? "faded" : flash.includes(v) ? "correct" : bad.includes(v) ? "wrong" : sel === v ? "selected" : "idle";

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="space-y-2.5">
        {ex.pairs.map(([l]) => (
          <Tile key={l} state={st(l, selL)} disabled={done.includes(l)} onClick={() => { setSelL(l); sfx("select"); }} className="h-[58px] w-full px-2 text-[14px]">
            {l}
          </Tile>
        ))}
      </div>
      <div className="space-y-2.5">
        {right.map((r) => (
          <Tile key={r} state={st(r, selR)} disabled={done.includes(r)} onClick={() => { setSelR(r); sfx("select"); }} className="h-[58px] w-full px-2 text-[11.5px] leading-tight">
            {r}
          </Tile>
        ))}
      </div>
    </div>
  );
}

function OrderEx({ ex, phase, onReady }: { ex: Extract<Ex, { kind: "order" }>; phase: Phase; onReady: ReadyFn }) {
  const [chosen, setChosen] = useState<number[]>([]);
  const update = (n: number[]) => {
    setChosen(n);
    const words = n.map((i) => ex.bank[i]);
    onReady(n.length > 0, words.join(" ") === ex.answer.join(" "));
  };
  const chip = (i: number) => (
    <motion.button
      layoutId={`ow-${i}`}
      key={i}
      type="button"
      disabled={phase !== "answering"}
      onClick={() => {
        sfx("pop");
        update(chosen.includes(i) ? chosen.filter((x) => x !== i) : [...chosen, i]);
      }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      className="rounded-xl border-2 border-[#26396a] bg-[#14203e] px-3 py-2 text-[14px] font-bold text-[#e6eeff]"
      style={{ boxShadow: "0 3px 0 #0a1328" }}
    >
      {ex.bank[i]}
    </motion.button>
  );
  return (
    <div className="space-y-5">
      <div className="relative min-h-[112px]">
        <div className="absolute inset-x-0 top-[50px] h-[2px] bg-[#1c2c52]" />
        <div className="absolute inset-x-0 top-[104px] h-[2px] bg-[#1c2c52]" />
        <div className="relative flex flex-wrap gap-2 pt-1">{chosen.map((i) => chip(i))}</div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {ex.bank.map((w, i) =>
          chosen.includes(i) ? (
            <span key={i} className="rounded-xl bg-[#0d162c] px-3 py-2 text-[14px] font-bold text-transparent" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.6)" }}>
              {w}
            </span>
          ) : (
            chip(i)
          ),
        )}
      </div>
    </div>
  );
}

function SwipeCard({ text, onDecide, index }: { text: string; onDecide: (v: boolean) => void; index: number }) {
  const x = useMotionValue(0);
  const rot = useTransform(x, [-160, 160], [-18, 18]);
  const yes = useTransform(x, [20, 110], [0, 1]);
  const no = useTransform(x, [-110, -20], [1, 0]);
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      style={{ x, rotate: rot, background: "linear-gradient(170deg,#1a2a52,#0e1730)", boxShadow: "0 6px 0 #0a1328, 0 24px 40px -18px #000" }}
      onDragEnd={(_, i) => {
        if (i.offset.x > 90) onDecide(true);
        else if (i.offset.x < -90) onDecide(false);
      }}
      initial={{ scale: 0.92, y: 14, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
      className="absolute inset-0 flex cursor-grab flex-col items-center justify-center rounded-3xl border-2 border-[#2a3f73] p-5 text-center active:cursor-grabbing"
    >
      <span className="absolute left-4 top-4 font-mono text-[10px] font-black text-ink-500">#{index + 1}</span>
      <motion.span style={{ opacity: yes }} className="absolute right-4 top-4 rotate-12 rounded-lg border-[3px] border-bull px-2 py-0.5 font-mono text-[14px] font-black text-bull">
        FACT
      </motion.span>
      <motion.span style={{ opacity: no }} className="absolute left-4 top-4 -rotate-12 rounded-lg border-[3px] border-bear px-2 py-0.5 font-mono text-[14px] font-black text-bear">
        MYTH
      </motion.span>
      <p className="text-[18px] font-extrabold leading-snug text-white">{text}</p>
      <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">← drag →</span>
    </motion.div>
  );
}

function SwipeEx({ ex, phase, onReady }: { ex: Extract<Ex, { kind: "swipe" }>; phase: Phase; onReady: ReadyFn }) {
  const [idx, setIdx] = useState(0);
  const [res, setRes] = useState<boolean[]>([]);
  const decide = (v: boolean) => {
    if (idx >= ex.cards.length || phase !== "answering") return;
    const ok = ex.cards[idx].v === v;
    sfx("swipe");
    const n = [...res, ok];
    setRes(n);
    setIdx(idx + 1);
    if (n.length === ex.cards.length) onReady(true, n.every(Boolean));
  };
  return (
    <div>
      <div className="relative mx-auto h-[250px] w-full">
        {idx + 1 < ex.cards.length && (
          <div className="absolute inset-0 translate-y-3 scale-[.94] rounded-3xl border-2 border-[#1c2c52] bg-[#0e1730] opacity-70" />
        )}
        <AnimatePresence>
          {idx < ex.cards.length && <SwipeCard key={idx} index={idx} text={ex.cards[idx].t} onDecide={decide} />}
        </AnimatePresence>
        {idx >= ex.cards.length && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 grid place-items-center rounded-3xl border-2 border-dashed border-[#26396a]">
            <div className="text-center">
              <div className="font-mono text-[11px] uppercase tracking-widest text-ink-400">all cards sorted</div>
              <div className="mt-2 flex justify-center gap-2">
                {res.map((r, i) => (
                  <span key={i} className={cn("grid h-8 w-8 place-items-center rounded-full", r ? "bg-bull text-[#02150b]" : "bg-bear text-[#1c0309]")}>
                    <Icon name={r ? "check" : "x"} size={16} strokeWidth={3.5} />
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <GameButton tone="bear" size="md" disabled={idx >= ex.cards.length || phase !== "answering"} onClick={() => decide(false)}>
          <Icon name="x" size={16} strokeWidth={3} /> Myth
        </GameButton>
        <GameButton tone="bull" size="md" disabled={idx >= ex.cards.length || phase !== "answering"} onClick={() => decide(true)}>
          <Icon name="check" size={16} strokeWidth={3} /> Fact
        </GameButton>
      </div>
    </div>
  );
}

function EstimateEx({ ex, phase, onReady }: { ex: Extract<Ex, { kind: "estimate" }>; phase: Phase; onReady: ReadyFn }) {
  const [v, setV] = useState(250);
  const [touched, setTouched] = useState(false);
  const ok = Math.abs(v - ex.answer) <= ex.tol;
  return (
    <div className="flex flex-col items-center gap-5 pt-2">
      <div className="relative">
        <motion.div
          key={v}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          className="tnum rounded-3xl border-2 px-8 py-4 font-mono text-[46px] font-black leading-none"
          style={{
            borderColor: phase === "answering" ? "#26396a" : ok ? "#2be08a" : "#ff4d6a",
            color: phase === "answering" ? "#fff" : ok ? "#2be08a" : "#ff4d6a",
            background: "#0b1428",
            boxShadow: "inset 0 4px 10px rgba(0,0,0,.7), 0 4px 0 #0a1328",
          }}
        >
          {ex.prefix}
          {v}
        </motion.div>
        {phase !== "answering" && !ok && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] font-bold text-bull">
            answer: {ex.prefix}
            {ex.answer}
          </motion.div>
        )}
      </div>
      <div className="w-full px-1">
        <Slider
          value={v}
          min={ex.min}
          max={ex.max}
          marks={["$0", "$125", "$250", "$375", "$500"]}
          onChange={(n) => {
            if (phase !== "answering") return;
            const s = Math.round(n / 10) * 10;
            if (s !== v) sfx("tick", false);
            setV(s);
            setTouched(true);
            onReady(true, Math.abs(s - ex.answer) <= ex.tol);
          }}
        />
      </div>
      <div className="grid w-full grid-cols-4 gap-2">
        {[50, 100, 200, 500].map((q) => (
          <Tile
            key={q}
            state={v === q ? "selected" : "idle"}
            disabled={phase !== "answering"}
            onClick={() => {
              setV(q);
              setTouched(true);
              sfx("select");
              onReady(true, Math.abs(q - ex.answer) <= ex.tol);
            }}
            className="h-11 font-mono text-[13px]"
          >
            ${q}
          </Tile>
        ))}
      </div>
      {!touched && <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500">drag the slider or tap a chip</span>}
    </div>
  );
}

function PredictEx({ ex, phase, onReady }: { ex: Extract<Ex, { kind: "predict" }>; phase: Phase; onReady: ReadyFn }) {
  const [pick, setPick] = useState<"up" | "down" | null>(null);
  return (
    <div className="space-y-3">
      <CandleChart data={ex.candles} ghost={{ dir: ex.next, show: phase !== "answering" }} height={200} />
      <div className="grid grid-cols-2 gap-3">
        {(["up", "down"] as const).map((d) => {
          const st: TState =
            phase !== "answering" ? (d === ex.next ? "correct" : d === pick ? "wrong" : "faded") : pick === d ? "selected" : "idle";
          return (
            <Tile
              key={d}
              state={st}
              disabled={phase !== "answering"}
              onClick={() => {
                setPick(d);
                sfx("select");
                onReady(true, d === ex.next);
              }}
              className="flex h-[78px] flex-col items-center justify-center gap-1"
            >
              <Icon name={d === "up" ? "trendUp" : "trendDown"} size={26} strokeWidth={2.6} />
              <span className="text-[13px] uppercase tracking-wider">{d === "up" ? "Pump" : "Dump"}</span>
            </Tile>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PLAYER                                                             */
/* ================================================================== */
type Screen = "intro" | "play" | "result" | "fail";

const PRAISE = ["Excellent!", "Nailed it!", "Sharp trader!", "Perfect entry!", "Clean read!"];

export default function LessonPlayer() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [ready, setReady] = useState(false);
  const correctRef = useRef(false);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [right, setRight] = useState(0);
  const [shake, setShake] = useState(0);
  const [conf, setConf] = useState(0);
  const [t0, setT0] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [praise, setPraise] = useState(PRAISE[0]);
  const [log, setLog] = useState<string[]>(["boot · lesson engine v3"]);

  const ex = LESSON[i];
  const pushLog = (s: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-GB")} · ${s}`, ...l].slice(0, 7));

  const onReady: ReadyFn = (r, c) => {
    setReady(r);
    correctRef.current = c;
  };

  const start = (at = 0) => {
    setScreen("play");
    setI(at);
    setPhase("answering");
    setReady(false);
    setHearts(5);
    setStreak(0);
    setBest(0);
    setXp(0);
    setRight(0);
    setT0(Date.now());
    sfx("whoosh");
    pushLog(`start @ exercise ${at + 1} (${LESSON[at].kind})`);
  };

  const check = () => {
    if (!ready || phase !== "answering") return;
    if (correctRef.current) {
      const s = streak + 1;
      setPhase("correct");
      setStreak(s);
      setBest((b) => Math.max(b, s));
      setRight((r) => r + 1);
      setXp((x) => x + 10 + (s >= 3 ? 5 : 0));
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      sfx(s >= 3 ? "combo" : "correct");
      pushLog(`✓ correct · streak ${s}`);
    } else {
      setPhase("wrong");
      setStreak(0);
      setHearts((h) => h - 1);
      setShake((n) => n + 1);
      sfx("wrong");
      pushLog(`✗ wrong · hearts ${hearts - 1}`);
    }
  };

  const next = () => {
    if (hearts <= 0) {
      setScreen("fail");
      sfx("lose");
      pushLog("out of hearts");
      return;
    }
    if (i >= LESSON.length - 1) {
      setElapsed(Math.round((Date.now() - t0) / 1000));
      setScreen("result");
      setConf((c) => c + 1);
      sfx("levelup");
      pushLog("lesson complete");
      return;
    }
    setI(i + 1);
    setPhase("answering");
    setReady(false);
    sfx("whoosh", false);
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (screen !== "play") return;
      const tg = e.target as HTMLElement;
      if (tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA")) return;
      if (e.key !== "Enter") return;
      const el = document.getElementById("lesson-device");
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      e.preventDefault();
      if (phase === "answering") check();
      else next();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const progress = screen === "result" ? 1 : (i + (phase !== "answering" ? 1 : 0)) / LESSON.length;
  const mood: Mood =
    screen === "result" ? "celebrate" : screen === "fail" ? "sad" : screen === "intro" ? "wave" : phase === "correct" ? "happy" : phase === "wrong" ? "sad" : ready ? "think" : "idle";

  return (
    <Section id="lesson" index="" title="Lesson Engine" kicker="The core loop · fully playable" count="7 exercise types">
      <Grid>
        <Cell title="Playable Lesson · Risk Management 04" spec="press Enter to check" span="col-span-2 md:col-span-4 lg:col-span-4">
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_auto]">
            <div id="lesson-device" className="order-1 lg:order-2">
              <Device>
                <Shake trigger={shake} className="relative flex h-full flex-col">
                  <Confetti fire={conf} />
                  <StatusBar />
                  <AnimatePresence mode="wait">
                    {screen === "intro" && (
                      <motion.div key="intro" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="relative flex flex-1 flex-col items-center px-6 pb-10">
                        <Rays color="rgba(120,160,255,.12)" size="150%" className="top-[34%]" />
                        <div className="relative mt-4 text-center">
                          <Tag tone="accent">unit 3 · lesson 4</Tag>
                          <h3 className="mt-3 font-[family-name:var(--font-display)] text-[28px] font-bold leading-tight text-white">Risk
                            <br />
                            Management</h3>
                        </div>
                        <div className="relative mt-2">
                          <Mascot mood={mood} size={190} />
                        </div>
                        <Bubble text="7 quick drills. Protect your capital like a pro!" side="bottom" className="relative -mt-2 max-w-[260px]" />
                        <div className="relative mt-auto grid w-full grid-cols-3 gap-2">
                          {[
                            { a: <BoltArt size={26} />, v: "+75", l: "XP" },
                            { a: <HeartArt size={26} />, v: "5", l: "Lives" },
                            { a: <GemArt size={26} />, v: "~4m", l: "Time" },
                          ].map((s) => (
                            <div key={s.l} className="flex flex-col items-center rounded-2xl border-2 border-[#22355e] bg-[#101a33] py-2" style={{ boxShadow: "0 3px 0 #0a1328" }}>
                              {s.a}
                              <span className="font-mono text-[13px] font-black text-white">{s.v}</span>
                              <span className="font-mono text-[8px] uppercase tracking-widest text-ink-500">{s.l}</span>
                            </div>
                          ))}
                        </div>
                        <GameButton className="relative mt-4" onClick={() => start(0)}>
                          Start lesson
                        </GameButton>
                      </motion.div>
                    )}

                    {screen === "play" && (
                      <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-1 flex-col">
                        {/* header */}
                        <div className="flex items-center gap-3 px-4 pb-2">
                          <button type="button" onClick={() => setScreen("intro")} className="text-ink-500 transition-colors hover:text-white" aria-label="Quit lesson">
                            <Icon name="x" size={24} strokeWidth={2.6} />
                          </button>
                          <div className="relative h-[18px] flex-1 overflow-hidden rounded-full bg-[#16223f]" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.6)" }}>
                            <motion.div
                              animate={{ width: `${Math.max(4, progress * 100)}%` }}
                              transition={{ type: "spring", stiffness: 120, damping: 18 }}
                              className="relative h-full rounded-full"
                              style={{ background: streak >= 3 ? "linear-gradient(90deg,#ffc24b,#ff8a3d)" : "var(--accent)" }}
                            >
                              <span className="absolute inset-x-2 top-[3px] h-[5px] rounded-full bg-white/40" />
                            </motion.div>
                          </div>
                          <div className="flex items-center gap-1">
                            <motion.span key={hearts} animate={phase === "wrong" ? { scale: [1, 1.5, 1], rotate: [0, -15, 15, 0] } : {}}>
                              <HeartArt size={24} />
                            </motion.span>
                            <Pop value={hearts} className="font-mono text-[15px] font-black text-bear" />
                          </div>
                        </div>
                        <AnimatePresence>
                          {streak >= 2 && phase !== "wrong" && (
                            <motion.div
                              key={streak}
                              initial={{ opacity: 0, y: -6, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0 }}
                              className="mx-auto -mt-1 mb-1 flex items-center gap-1 font-mono text-[11px] font-black uppercase tracking-widest text-[#ffb347]"
                            >
                              <FlameArt size={16} /> {streak} in a row
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* body */}
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ type: "spring", stiffness: 260, damping: 28 }}
                            className="flex flex-1 flex-col px-4"
                          >
                            <div className="mb-1 flex items-center gap-1.5">
                              <span className="rounded-md px-1.5 py-0.5 font-mono text-[8.5px] font-black uppercase tracking-widest" style={{ color: KIND_META[ex.kind].c, background: `${KIND_META[ex.kind].c}1f` }}>
                                {KIND_META[ex.kind].l}
                              </span>
                            </div>
                            <h4 className="font-[family-name:var(--font-display)] text-[21px] font-bold leading-tight text-white">{ex.title}</h4>
                            <div className="my-3 flex items-center gap-2">
                              <Mascot mood={mood} size={70} />
                              <Bubble text={ex.say} className="flex-1 text-[12px]" />
                            </div>
                            <div className="flex-1">
                              {ex.kind === "choice" && <ChoiceEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "chart" && <ChartEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "match" && <MatchEx ex={ex} onReady={onReady} />}
                              {ex.kind === "order" && <OrderEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "swipe" && <SwipeEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "estimate" && <EstimateEx ex={ex} phase={phase} onReady={onReady} />}
                              {ex.kind === "predict" && <PredictEx ex={ex} phase={phase} onReady={onReady} />}
                            </div>
                          </motion.div>
                        </AnimatePresence>

                        {/* footer */}
                        <div className="relative border-t-2 border-[#16223f] px-4 pb-8 pt-4">
                          <GameButton disabled={!ready} onClick={check}>
                            Check
                          </GameButton>
                          <AnimatePresence>
                            {phase !== "answering" && (
                              <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                                className="absolute inset-x-0 bottom-0 z-20 rounded-t-3xl px-4 pb-8 pt-4"
                                style={{
                                  background: phase === "correct" ? "linear-gradient(180deg,#0f3326,#0a2219)" : "linear-gradient(180deg,#3a0f1c,#260912)",
                                  boxShadow: `inset 0 2px 0 ${phase === "correct" ? "#2be08a55" : "#ff4d6a55"}`,
                                }}
                              >
                                <div className="mb-3 flex items-start gap-3">
                                  <motion.span
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 420, damping: 14 }}
                                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                                    style={{ background: phase === "correct" ? "#2be08a" : "#ff4d6a", color: phase === "correct" ? "#02150b" : "#1c0309" }}
                                  >
                                    <Icon name={phase === "correct" ? "check" : "x"} size={24} strokeWidth={3.6} />
                                  </motion.span>
                                  <div className="min-w-0 flex-1">
                                    <div className={cn("font-[family-name:var(--font-display)] text-[20px] font-bold", phase === "correct" ? "text-bull" : "text-bear")}>
                                      {phase === "correct" ? praise : "Not quite"}
                                    </div>
                                    <p className={cn("text-[12px] font-semibold leading-snug", phase === "correct" ? "text-[#9ff0c8]" : "text-[#ffb3c0]")}>{ex.explain}</p>
                                  </div>
                                  <div className="flex gap-1.5 text-ink-400">
                                    <Icon name="copy" size={16} />
                                    <Icon name="alert" size={16} />
                                  </div>
                                </div>
                                {phase === "correct" && (
                                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-2 flex items-center gap-1 font-mono text-[11px] font-black text-gold">
                                    <BoltArt size={14} /> +{10 + (streak >= 3 ? 5 : 0)} XP {streak >= 3 && <span className="text-[#ffb347]">· combo bonus</span>}
                                  </motion.div>
                                )}
                                <GameButton tone={phase === "correct" ? "bull" : "bear"} onClick={next}>
                                  {hearts <= 0 ? "See results" : "Continue"}
                                </GameButton>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}

                    {screen === "result" && (
                      <motion.div key="res" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative flex flex-1 flex-col items-center px-6 pb-10">
                        <Rays />
                        <div className="relative mt-2">
                          <Mascot mood="celebrate" size={170} />
                        </div>
                        <motion.h3
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.2 }}
                          className="relative font-[family-name:var(--font-display)] text-[30px] font-bold text-gold"
                          style={{ textShadow: "0 4px 0 #7a4b08, 0 0 30px rgba(255,194,75,.5)" }}
                        >
                          Lesson complete!
                        </motion.h3>
                        <div className="relative mt-5 grid w-full grid-cols-3 gap-2.5">
                          {[
                            { l: "Total XP", v: `${xp}`, c: "#ffc24b", art: <BoltArt size={22} /> },
                            { l: "Accuracy", v: `${Math.round((right / LESSON.length) * 100)}%`, c: "#2be08a", art: <TrophyArt size={22} /> },
                            { l: "Time", v: fmtClock(elapsed), c: "#38e1ff", art: <FlameArt size={22} cold /> },
                          ].map((s, k) => (
                            <motion.div
                              key={s.l}
                              initial={{ rotateY: 90, opacity: 0 }}
                              animate={{ rotateY: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + k * 0.15, type: "spring", stiffness: 200, damping: 16 }}
                              className="overflow-hidden rounded-2xl border-2"
                              style={{ borderColor: s.c, background: s.c, boxShadow: `0 4px 0 color-mix(in srgb, ${s.c} 45%, #000)` }}
                            >
                              <div className="py-1 text-center font-mono text-[8.5px] font-black uppercase tracking-widest text-[#0a1226]">{s.l}</div>
                              <div className="flex flex-col items-center gap-0.5 rounded-t-xl bg-[#0b1428] py-2.5">
                                {s.art}
                                <span className="tnum font-mono text-[17px] font-black" style={{ color: s.c }}>
                                  {s.v}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div className="relative mt-3 font-mono text-[10px] uppercase tracking-widest text-ink-400">best streak · {best}</div>
                        <GameButton className="relative mt-auto" tone="gold" onClick={() => { setScreen("intro"); sfx("coin"); }}>
                          Claim XP
                        </GameButton>
                      </motion.div>
                    )}

                    {screen === "fail" && (
                      <motion.div key="fail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex flex-1 flex-col items-center px-6 pb-10 text-center">
                        <motion.div initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 12 }} className="mt-10">
                          <HeartArt size={120} broken />
                        </motion.div>
                        <h3 className="mt-4 font-[family-name:var(--font-display)] text-[26px] font-bold text-white">Out of hearts</h3>
                        <p className="mt-1 text-[13px] text-ink-400">Liquidated! Refill or practise to earn lives back.</p>
                        <div className="mt-4">
                          <Mascot mood="sad" size={120} />
                        </div>
                        <div className="mt-auto w-full space-y-3">
                          <GameButton tone="aqua" onClick={() => start(i)}>
                            <GemArt size={20} /> Refill · 350
                          </GameButton>
                          <GameButton tone="ghost" onClick={() => setScreen("intro")}>
                            Practise to earn
                          </GameButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Shake>
              </Device>
            </div>

            {/* side telemetry */}
            <div className="order-2 space-y-3 lg:order-1">
              <div className="rounded-2xl sf-inset hairline p-3">
                <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">jump to exercise</div>
                <div className="grid gap-1.5">
                  {LESSON.map((e, k) => {
                    const A = ART[KIND_META[e.kind].art];
                    const active = screen === "play" && k === i;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => start(k)}
                        className={cn("flex items-center gap-2.5 rounded-xl border-2 px-2.5 py-2 text-left transition-all hover:translate-x-1", active ? "border-[var(--accent)]" : "border-[#1c2c52]")}
                        style={{ background: active ? "color-mix(in srgb, var(--accent) 12%, #0d1528)" : "#0d1528", boxShadow: "0 3px 0 #070d1c" }}
                      >
                        <A size={26} />
                        <div className="min-w-0 flex-1">
                          <div className="font-mono text-[8px] font-black uppercase tracking-widest" style={{ color: KIND_META[e.kind].c }}>
                            {String(k + 1).padStart(2, "0")} · {KIND_META[e.kind].l}
                          </div>
                          <div className="truncate text-[11.5px] font-bold text-ink-200">{e.title}</div>
                        </div>
                        {screen === "play" && k < i && <Icon name="check" size={14} strokeWidth={3} className="text-bull" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "XP", v: xp, c: "#ffc24b" },
                  { l: "Hearts", v: hearts, c: "#ff4d6a" },
                  { l: "Streak", v: streak, c: "#ffb347" },
                  { l: "Best", v: best, c: "#38e1ff" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl sf-base hairline p-2 text-center">
                    <Pop value={s.v} className="font-mono text-[18px] font-black" color={s.c} />
                    <div className="font-mono text-[7.5px] uppercase tracking-widest text-ink-500">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl sf-inset hairline p-3 font-mono text-[9.5px] leading-relaxed">
                <div className="mb-1 flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-ink-500">
                  <span>state machine</span>
                  <span style={{ color: "var(--accent)" }}>
                    {screen}/{phase}
                  </span>
                </div>
                {log.map((l, k) => (
                  <motion.div key={l + k} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1 - k * 0.12, x: 0 }} className={k === 0 ? "text-ink-200" : "text-ink-500"}>
                    {l}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </Cell>
        <Cell title="Loop Anatomy" spec="Duolingo-grade" span="col-span-2 md:col-span-4 lg:col-span-2">
          <div className="space-y-2">
            {[
              { n: "Prompt", d: "Mascot + typewriter bubble frames the task", a: "star" as ArtKey },
              { n: "Act", d: "Tactile tiles · drag · swipe · slider · chart tap", a: "candle" as ArtKey },
              { n: "Check", d: "Single CTA, disabled until an answer exists", a: "shield" as ArtKey },
              { n: "Judge", d: "Spring sheet, praise variety, haptic + SFX", a: "bolt" as ArtKey },
              { n: "Reward", d: "XP, combo bonus, streak flame, confetti", a: "trophy" as ArtKey },
              { n: "Punish", d: "Heart loss, screen shake, broken-heart gate", a: "heart" as ArtKey },
            ].map((s, k) => {
              const A = ART[s.a];
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: 14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: k * 0.06 }}
                  className="flex items-center gap-3 rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5"
                  style={{ boxShadow: "0 3px 0 #070d1c" }}
                >
                  <span className="font-mono text-[10px] font-black text-ink-500">{String(k + 1).padStart(2, "0")}</span>
                  <A size={34} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-extrabold text-white">{s.n}</div>
                    <div className="text-[10.5px] leading-snug text-ink-400">{s.d}</div>
                  </div>
                </motion.div>
              );
            })}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Tag tone="accent">keyboard: Enter</Tag>
              <Tag>layoutId word chips</Tag>
              <Tag tone="gold">drag physics</Tag>
              <Tag tone="bear">heart economy</Tag>
            </div>
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
