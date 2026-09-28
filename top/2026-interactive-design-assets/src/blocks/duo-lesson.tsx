import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Clock, Flame, Target, X, Zap } from "lucide-react";
import { useEffect, useId, useRef, useState, type MutableRefObject } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { Bubble, Mascot, type Mood } from "../duo/Mascot";
import { CountUp, D, DuoButton, FeedbackSheet, HeartCount, LessonProgress, StatCard } from "../duo/ui";
import { useTimers } from "./util";

type Result = "correct" | "wrong" | null;
interface QProps {
  locked: boolean;
  result: Result;
  setCan: (b: boolean) => void;
  api: MutableRefObject<(() => boolean) | null>;
  onAuto: (ok: boolean) => void;
  onMiss: () => void;
}

function stateCls(sel: boolean, result: Result) {
  if (sel && result === "correct") return "duo-card duo-ok";
  if (sel && result === "wrong") return "duo-card duo-bad";
  if (sel) return "duo-card duo-sel";
  return "duo-card";
}

/* ───────── Q1 · pick the candle ───────── */
const CANDLES = [
  { k: "a", label: "A", o: 32, c: 12, h: 5, l: 39, col: D.lime },
  { k: "b", label: "B", o: 12, c: 32, h: 5, l: 39, col: D.red },
  { k: "c", label: "C", o: 22, c: 23.5, h: 4, l: 40, col: D.muted },
  { k: "d", label: "D", o: 27, c: 33, h: 3, l: 36, col: D.red },
];

function MiniCandle({ o, c, h, l, col }: { o: number; c: number; h: number; l: number; col: string }) {
  return (
    <svg viewBox="0 0 40 44" className="h-16 w-14" aria-hidden>
      <line x1={20} x2={20} y1={h} y2={l} stroke={col} strokeWidth={3.5} strokeLinecap="round" />
      <rect x={10} width={20} y={Math.min(o, c)} height={Math.max(3, Math.abs(o - c))} rx={4} fill={col} />
    </svg>
  );
}

function ChoiceQ({ locked, result, setCan, api }: QProps) {
  const fx = useFx();
  const [sel, setSel] = useState<string | null>(null);
  api.current = () => sel === "a";
  return (
    <div className="grid grid-cols-2 gap-3">
      {CANDLES.map((cd, i) => (
        <motion.div key={cd.k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: fx.t(i * 0.05) }}>
          <button
            disabled={locked}
            onClick={() => {
              setSel(cd.k);
              setCan(true);
              fx.sfx("tick");
              fx.haptic(5);
            }}
            aria-pressed={sel === cd.k}
            className={`${stateCls(sel === cd.k, result)} flex h-[116px] w-full flex-col items-center justify-center gap-1`}
          >
            <MiniCandle {...cd} />
            <span className="text-sm font-black">{cd.label}</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────── Q2 · build the sentence (word bank) ───────── */
const TARGET = ["Cut", "losses,", "let", "winners", "run"];
const BANK = ["let", "losses,", "hold", "run", "Cut", "losers", "winners"];

function TilesQ({ locked, result, setCan, api }: QProps) {
  const fx = useFx();
  const uid = useId();
  const [ans, setAns] = useState<number[]>([]);
  api.current = () => ans.map((i) => BANK[i]).join(" ") === TARGET.join(" ");

  useEffect(() => setCan(ans.length > 0), [ans, setCan]);

  const add = (i: number) => {
    if (locked || ans.includes(i)) return;
    setAns((a) => [...a, i]);
    fx.sfx("pop");
    fx.haptic(6);
  };
  const remove = (i: number) => {
    if (locked) return;
    setAns((a) => a.filter((x) => x !== i));
    fx.sfx("tick");
    fx.haptic(4);
  };
  const tone = result === "correct" ? "text-[#79d634]" : result === "wrong" ? "text-[#ff6b6b]" : "";
  const spring = fx.reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 520, damping: 36 };

  return (
    <LayoutGroup id={uid}>
      <div className="relative min-h-[112px]">
        <div className="absolute inset-x-0 top-[50px] border-b-2 border-[#2a3a6e]" />
        <div className="absolute inset-x-0 top-[104px] border-b-2 border-[#2a3a6e]" />
        <div className="relative flex flex-wrap content-start gap-2">
          {ans.map((i) => (
            <motion.button key={i} layoutId={`${uid}-${i}`} transition={spring} onClick={() => remove(i)} whileTap={{ scale: 0.92 }} className={`duo-tile ${tone}`}>
              {BANK[i]}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="mt-7 flex flex-wrap justify-center gap-2">
        {BANK.map((w, i) =>
          ans.includes(i) ? (
            <div key={i} className="duo-tile duo-tile-empty" aria-hidden>
              <span className="invisible">{w}</span>
            </div>
          ) : (
            <motion.button key={i} layoutId={`${uid}-${i}`} transition={spring} onClick={() => add(i)} whileTap={{ scale: 0.92 }} className="duo-tile">
              {w}
            </motion.button>
          )
        )}
      </div>
    </LayoutGroup>
  );
}

/* ───────── Q3 · match pairs ───────── */
const PAIRS = [
  ["Long", "Bet it goes up"],
  ["Short", "Bet it goes down"],
  ["Stop-loss", "Exit if wrong"],
  ["Leverage", "Borrowed size"],
];
const RIGHT_ORDER = [2, 0, 3, 1];

function MatchQ({ locked, setCan, api, onAuto, onMiss }: QProps) {
  const fx = useFx();
  const later = useTimers();
  const [selL, setSelL] = useState<number | null>(null);
  const [selR, setSelR] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [fresh, setFresh] = useState<number | null>(null);
  const [bad, setBad] = useState<{ l: number; r: number; k: number } | null>(null);
  api.current = () => done.length === PAIRS.length;

  useEffect(() => setCan(false), [setCan]);

  const evaluate = (l: number, r: number) => {
    setSelL(null);
    setSelR(null);
    if (l === r) {
      const next = [...done, l];
      setDone(next);
      setFresh(l);
      fx.sfx("coin");
      fx.haptic(10);
      later(() => setFresh((f) => (f === l ? null : f)), 450);
      if (next.length === PAIRS.length) later(() => onAuto(true), fx.ms(500));
    } else {
      setBad({ l, r, k: Date.now() });
      onMiss();
      fx.sfx("lose");
      fx.haptic([40, 30, 40]);
      later(() => setBad(null), 500);
    }
  };

  const tapL = (i: number) => {
    if (locked || done.includes(i)) return;
    fx.sfx("tick");
    if (selR !== null) evaluate(i, selR);
    else setSelL(i === selL ? null : i);
  };
  const tapR = (i: number) => {
    if (locked || done.includes(i)) return;
    fx.sfx("tick");
    if (selL !== null) evaluate(selL, i);
    else setSelR(i === selR ? null : i);
  };

  const cls = (idx: number, sel: boolean, side: "l" | "r") => {
    if (fresh === idx) return "duo-card duo-ok";
    if (done.includes(idx)) return "duo-card opacity-35";
    if (bad && (side === "l" ? bad.l : bad.r) === idx) return "duo-card duo-bad";
    if (sel) return "duo-card duo-sel";
    return "duo-card";
  };

  const cell = (idx: number, side: "l" | "r") => {
    const sel = side === "l" ? selL === idx : selR === idx;
    const isBad = bad && (side === "l" ? bad.l : bad.r) === idx;
    return (
      <motion.div key={`${side}${idx}`} animate={isBad && !fx.reduced ? { x: [0, -8, 7, -4, 0] } : { x: 0 }} transition={{ duration: 0.35 }}>
        <button
          disabled={done.includes(idx) || locked}
          onClick={() => (side === "l" ? tapL(idx) : tapR(idx))}
          aria-pressed={sel}
          className={`${cls(idx, sel, side)} flex h-[58px] w-full items-center justify-center px-2 text-center text-sm font-extrabold leading-tight`}
        >
          {PAIRS[idx][side === "l" ? 0 : 1]}
        </button>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
      {PAIRS.map((_, row) => (
        <div key={row} className="contents">
          {cell(row, "l")}
          {cell(RIGHT_ORDER[row], "r")}
        </div>
      ))}
    </div>
  );
}

/* ───────── Q4 · true / false on a chart ───────── */
function TFQ({ locked, result, setCan, api }: QProps) {
  const fx = useFx();
  const [sel, setSel] = useState<boolean | null>(null);
  api.current = () => sel === true;
  const pts = [
    [10, 96],
    [55, 60],
    [85, 78],
    [135, 38],
    [165, 56],
    [220, 14],
  ];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const lbl = [
    { p: pts[1], t: "H" },
    { p: pts[3], t: "HH" },
    { p: pts[2], t: "L" },
    { p: pts[4], t: "HL" },
  ];
  return (
    <div>
      <div className="duo-card p-3">
        <svg viewBox="0 0 230 110" className="w-full" aria-label="Zigzag rising chart">
          <motion.path d={d} fill="none" stroke={D.blue} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: fx.t(1) }} />
          {lbl.map((l, i) => (
            <motion.g key={l.t} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: fx.t(0.6 + i * 0.12), type: "spring", stiffness: 500, damping: 15 }}>
              <circle cx={l.p[0]} cy={l.p[1]} r={11} fill={l.t.startsWith("H") && l.t.length === 2 ? D.green : l.t === "HL" ? D.green : D.card} stroke={D.line} strokeWidth={2} />
              <text x={l.p[0]} y={l.p[1] + 4} textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">
                {l.t}
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-center text-base font-extrabold">“Higher highs + higher lows = uptrend”</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            disabled={locked}
            onClick={() => {
              setSel(v);
              setCan(true);
              fx.sfx("tick");
              fx.haptic(5);
            }}
            aria-pressed={sel === v}
            className={`${stateCls(sel === v, result)} h-14 text-lg font-black`}
          >
            {v ? "True" : "False"}
          </button>
        ))}
      </div>
    </div>
  );
}

const QS = [
  { C: ChoiceQ, prompt: "Which candle closed higher than it opened?", explain: "A — the body is green: close above open.", mood: "think" as Mood },
  { C: TilesQ, prompt: "Build the golden rule of trading.", explain: "Cut losses, let winners run.", mood: "idle" as Mood },
  { C: MatchQ, prompt: "Tap the matching pairs.", explain: "All four pairs matched.", mood: "idle" as Mood },
  { C: TFQ, prompt: "True or false?", explain: "True — that is the definition of an uptrend.", mood: "think" as Mood },
];
const PRAISE = ["Nicely done!", "Great job!", "Amazing!", "You got it!"];

/* ═════════════ 26 · DUO LESSON ═════════════ */
export function LessonQuiz() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const api = useRef<(() => boolean) | null>(null);
  const start = useRef(Date.now());
  const [queue, setQueue] = useState<number[]>([0, 1, 2, 3]);
  const [pos, setPos] = useState(0);
  const [solved, setSolved] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [inRow, setInRow] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [can, setCan] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [screen, setScreen] = useState<"play" | "done" | "out">("play");
  const [run, setRun] = useState(0);
  const [breakKey, setBreakKey] = useState(0);
  const [combo, setCombo] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const qi = queue[pos];
  const Q = QS[qi];

  const resolve = (ok: boolean) => {
    setResult(ok ? "correct" : "wrong");
    if (ok) {
      setSolved((s) => s + 1);
      const n = inRow + 1;
      setInRow(n);
      if (n >= 2) {
        setCombo(n);
        later(() => setCombo(null), fx.ms(1500));
      }
      fx.sfx("win");
      fx.haptic([20, 30, 50]);
      const w = root.current?.offsetWidth ?? 286;
      pr.current?.burst(w / 2, 470, { count: 34, colors: [D.green, D.yellow, "#fff"], speed: 7, spread: 1.6 });
    } else {
      setInRow(0);
      setMistakes((m) => m + 1);
      setHearts((h) => Math.max(0, h - 1));
      setBreakKey((k) => k + 1);
      fx.sfx("lose");
      fx.haptic([60, 40, 60]);
    }
  };

  const check = () => {
    if (!can || result) return;
    resolve(!!api.current?.());
  };

  const cont = () => {
    const wasWrong = result === "wrong";
    setResult(null);
    setCan(false);
    if (hearts <= 0) {
      setScreen("out");
      fx.sfx("lose");
      return;
    }
    let q = queue;
    if (wasWrong) {
      q = [...queue, qi];
      setQueue(q);
    }
    if (pos + 1 >= q.length) {
      setElapsed(Math.round((Date.now() - start.current) / 1000));
      setScreen("done");
      fx.sfx("win");
      fx.haptic([30, 40, 90]);
      const w = root.current?.offsetWidth ?? 286;
      later(() => {
        pr.current?.burst(20, 140, { count: 70, angle: -Math.PI / 3, spread: 0.9, speed: 12, colors: [D.green, D.yellow, D.blue, D.pink, D.purple] });
        pr.current?.burst(w - 20, 140, { count: 70, angle: (-2 * Math.PI) / 3, spread: 0.9, speed: 12, colors: [D.green, D.yellow, D.blue, D.pink, D.purple] });
      }, 150);
      return;
    }
    setPos(pos + 1);
    fx.sfx("whoosh");
  };

  const restart = () => {
    setQueue([0, 1, 2, 3]);
    setPos(0);
    setSolved(0);
    setHearts(3);
    setInRow(0);
    setMistakes(0);
    setCan(false);
    setResult(null);
    setScreen("play");
    setBreakKey(0);
    setRun((r) => r + 1);
    start.current = Date.now();
  };

  const onAuto = (ok: boolean) => resolve(ok);
  const onMiss = () => setMistakes((m) => m + 1);

  if (screen === "done") {
    const acc = Math.round((QS.length / (QS.length + mistakes)) * 100);
    const xp = 10 + solved * 3 + (mistakes === 0 ? 5 : 0);
    const mm = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
    return (
      <div ref={root} className="relative flex h-full flex-col items-center px-4 pb-5 pt-6 text-center">
        <Mascot mood="cheer" size={140} />
        <motion.h2 initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }} className="mt-4 text-3xl font-black text-[#ffc800]">
          Lesson complete!
        </motion.h2>
        <div className="mt-6 grid w-full grid-cols-3 gap-2">
          <StatCard label="Total XP" color={D.yellow} delay={0.2}>
            <Zap size={18} fill="currentColor" /> <CountUp to={xp} delay={0.3} />
          </StatCard>
          <StatCard label={acc === 100 ? "Perfect" : "Good"} color={D.green} delay={0.35}>
            <Target size={18} /> <CountUp to={acc} delay={0.45} suffix="%" />
          </StatCard>
          <StatCard label="Speedy" color={D.blue} delay={0.5}>
            <Clock size={18} /> {mm}
          </StatCard>
        </div>
        <div className="flex-1" />
        <DuoButton full onClick={restart}>
          Continue
        </DuoButton>
        <Particles ref={pr} />
      </div>
    );
  }

  if (screen === "out") {
    return (
      <div ref={root} className="relative flex h-full flex-col items-center px-4 pb-5 pt-10 text-center">
        <Mascot mood="sad" size={130} />
        <h2 className="mt-5 text-2xl font-black">You ran out of hearts</h2>
        <p className="mt-2 text-base font-bold text-white/60">Mistakes are data. Review and try again.</p>
        <div className="flex-1" />
        <DuoButton tone="blue" full onClick={restart}>
          Refill hearts
        </DuoButton>
        <DuoButton tone="ghost" full className="mt-3" onClick={restart}>
          Practice instead
        </DuoButton>
      </div>
    );
  }

  const mood: Mood = result === "correct" ? "happy" : result === "wrong" ? "sad" : Q.mood;

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center gap-3">
        <button onClick={restart} aria-label="Quit lesson" className="grid h-9 w-9 place-items-center rounded-xl text-white/50 hover:bg-white/10">
          <X size={24} strokeWidth={3} />
        </button>
        <div className="relative flex-1">
          <LessonProgress value={solved / QS.length} />
          <AnimatePresence>
            {combo !== null && (
              <motion.div
                key={combo}
                initial={{ opacity: 0, y: 6, scale: 0.6 }}
                animate={{ opacity: 1, y: -18, scale: 1 }}
                exit={{ opacity: 0, y: -26 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute left-0 top-0 flex items-center gap-1 text-xs font-black uppercase text-[#ff9600]"
              >
                <Flame size={14} fill="currentColor" /> {combo} in a row!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <HeartCount n={hearts} breakKey={breakKey} />
      </div>

      <div className="mt-4 flex items-center gap-1">
        <Mascot mood={mood} size={72} />
        <Bubble className="ml-2 flex-1 text-sm">{Q.prompt}</Bubble>
      </div>

      <div className="relative mt-4 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${run}-${pos}`}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
          >
            <Q.C locked={!!result} result={result} setCan={setCan} api={api} onAuto={onAuto} onMiss={onMiss} />
          </motion.div>
        </AnimatePresence>
      </div>

      <DuoButton full disabled={!can || !!result} onClick={check}>
        Check
      </DuoButton>

      <FeedbackSheet
        state={result}
        title={result === "correct" ? PRAISE[pos % PRAISE.length] : "Not quite"}
        detail={result === "wrong" ? `Correct answer: ${Q.explain}` : undefined}
        onContinue={cont}
        cta={result === "wrong" ? "Got it" : "Continue"}
      />
      <Particles ref={pr} />
    </div>
  );
}
