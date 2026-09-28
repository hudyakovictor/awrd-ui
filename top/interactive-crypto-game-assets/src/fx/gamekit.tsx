/* ------------------------------------------------------------------
 * TRADELINGO GAMEKIT — shared award-winning mobile-game primitives
 * Used across all gameplay sections so every screen feels consistent.
 * ------------------------------------------------------------------ */
import {
  AnimatePresence, motion, useMotionValue, useTransform,
  type PanInfo,
} from "framer-motion";
import {
  Check, ChevronLeft, ChevronRight, Crown, Flame, Gem, Heart, Lock,
  Shield, Sparkles, Star, Trophy, X, Zap,
} from "lucide-react";
import {
  createContext, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import confetti from "canvas-confetti";
import { cn } from "../utils/cn";
import { sfx } from "./sfx";
import { Magnetic, Odometer, RippleButton, Tilt, useFloaters } from "./effects";

/* ===================== TYPES ===================== */
export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#8ea6d8", rare: "#5b8cff", epic: "#a78bff", legendary: "#ffc531", mythic: "#ff5470",
};
export type Reward = { type: "xp" | "gem" | "heart" | "item" | "skin"; amount: number; label?: string };

/* ===================== GAME CONTEXT ===================== */
type GameCtx = {
  xp: number; gems: number; hearts: number; streak: number; level: number;
  addXp: (n: number) => void; addGems: (n: number) => void;
  spendHeart: () => boolean; addHeart: (n?: number) => void;
  toast: (t: string, s: string, tone?: string) => void;
};
const Ctx = createContext<GameCtx | null>(null);
export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}
export function GameProvider({ children, value }: { children: ReactNode; value: GameCtx }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ===================== HUD CHIPS ===================== */
export function HudChip({ icon, value, color, label, pulse }: { icon: ReactNode; value: string | number; color: string; label?: string; pulse?: boolean }) {
  return (
    <motion.div layout className={cn("panel-inset flex items-center gap-1.5 !rounded-xl px-2.5 py-1.5", pulse && "anim-pulse-ring")}>
      <span style={{ color }}>{icon}</span>
      <span className="leading-none">
        <span className="num-mono block text-xs font-extrabold text-white">{typeof value === "number" ? <Odometer value={value} /> : value}</span>
        {label && <span className="block text-[8px] font-bold uppercase tracking-widest text-[#7d92c4]">{label}</span>}
      </span>
    </motion.div>
  );
}

export function GameHud({ extra }: { extra?: ReactNode }) {
  const g = useGame();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <HudChip icon={<Flame size={14} />} value={g.streak} color="#ff8b3d" label="streak" />
      <HudChip icon={<Zap size={14} />} value={g.xp} color="#8ef23c" label="xp" />
      <HudChip icon={<Gem size={14} />} value={g.gems} color="#5b8cff" label="gems" />
      <HudChip icon={<Heart size={14} className="fill-current" />} value={g.hearts} color="#ff5470" label="hearts" />
      <HudChip icon={<Crown size={14} />} value={g.level} color="#ffc531" label="lvl" />
      {extra}
    </div>
  );
}

/* ===================== REWARD BURST OVERLAY ===================== */
export function RewardBurst({ open, rewards, title, onClose }: { open: boolean; rewards: Reward[]; title?: string; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    confetti({ particleCount: 140, spread: 90, origin: { y: 0.55 }, colors: ["#8ef23c", "#ffc531", "#5b8cff", "#ff5470", "#fff"] });
    sfx.levelUp();
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[160] flex items-center justify-center bg-[#020617]/85 p-4 backdrop-blur-md" onClick={onClose}>
          <motion.div initial={{ scale: 0.4, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            onClick={e => e.stopPropagation()} className="relative w-full max-w-sm text-center">
            <motion.div className="absolute -inset-20" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,49,.14) 0deg 10deg, transparent 10deg 20deg)" }}
              animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} />
            <div className="relative">
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, 6, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
                <Trophy size={72} className="mx-auto text-[#ffc531]" style={{ filter: "drop-shadow(0 0 30px #ffc531)" }} />
              </motion.div>
              <p className="display mt-3 text-2xl font-extrabold text-white">{title ?? "Rewards!"}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {rewards.map((r, i) => (
                  <motion.div key={i} initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                    className="panel-3d flex min-w-[90px] flex-col items-center gap-1 !rounded-2xl px-4 py-3">
                    <span className="text-2xl">{r.type === "xp" ? "⚡" : r.type === "gem" ? "💎" : r.type === "heart" ? "❤️" : "🎁"}</span>
                    <span className="num-mono text-lg font-extrabold text-white">+{r.amount}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8ea6d8]">{r.label ?? r.type}</span>
                  </motion.div>
                ))}
              </div>
              <button onClick={onClose} className="btn3d btn3d-green mt-6 px-10 py-3.5 text-sm">Claim all</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ===================== TIMER RING ===================== */
export function TimerRing({ seconds, max, size = 56, color = "#8ef23c", dangerAt = 3 }: { seconds: number; max: number; size?: number; color?: string; dangerAt?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const danger = seconds <= dangerAt;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={danger ? "#ff5470" : color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circ} animate={{ strokeDashoffset: circ - (circ * seconds) / max }} transition={{ duration: 0.9, ease: "linear" }}
          style={{ filter: danger ? "drop-shadow(0 0 8px #ff5470)" : undefined }} />
      </svg>
      <motion.span key={seconds} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
        className={cn("num-mono absolute inset-0 flex items-center justify-center text-sm font-extrabold", danger ? "text-[#ff5470]" : "text-white")}>
        {seconds}
      </motion.span>
    </div>
  );
}

/* ===================== COMBO METER ===================== */
export function ComboMeter({ combo, max = 10 }: { combo: number; max?: number }) {
  if (combo < 2) return null;
  return (
    <motion.div key={combo} initial={{ scale: 1.6, y: -10 }} animate={{ scale: 1, y: 0 }} className="flex items-center gap-2">
      <Flame size={18} className="text-[#ff8b3d]" style={{ filter: "drop-shadow(0 0 10px #ff8b3d)" }} />
      <div>
        <p className="display text-sm font-extrabold text-[#ff8b3d]">COMBO ×{combo}</p>
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-black/40">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#ff8b3d] to-[#ff5470]" animate={{ width: `${Math.min(100, (combo / max) * 100)}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ===================== QUIZ ENGINE ===================== */
export type QuizQ = { q: string; a: string[]; correct: number; explain: string; img?: string };
export function QuizEngine({
  questions, onDone, title = "Quiz", hearts = 5, timePerQ,
}: {
  questions: QuizQ[]; onDone: (r: { score: number; max: number; heartsLeft: number; combo: number }) => void;
  title?: string; hearts?: number; timePerQ?: number;
}) {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [hp, setHp] = useState(hearts);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(timePerQ ?? 0);
  const { spawn, node } = useFloaters();
  const q = questions[qi];
  const answered = pick !== null;

  useEffect(() => {
    if (!timePerQ || answered) return;
    setTime(timePerQ);
    const id = setInterval(() => setTime(t => {
      if (t <= 1) { clearInterval(id); answer(-1); return 0; }
      if (t <= 4) sfx.tick();
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, answered, timePerQ]);

  const answer = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    const ok = i === q.correct;
    if (ok) {
      const pts = 10 + combo * 5;
      setScore(s => s + pts); setCombo(c => c + 1);
      sfx.success(); spawn(180, 40, `+${pts}`, "#8ef23c");
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 }, colors: ["#8ef23c", "#fff"] });
    } else {
      setHp(h => Math.max(0, h - 1)); setCombo(0); sfx.error(); spawn(180, 40, "MISS", "#ff5470");
    }
  };

  const next = () => {
    if (qi + 1 >= questions.length || hp <= 0) {
      onDone({ score, max: questions.length * 10, heartsLeft: hp, combo });
    } else { setQi(qi + 1); setPick(null); }
  };

  return (
    <div className="relative">
      {node}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/40">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5b8cff]"
            animate={{ width: `${((qi + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="flex items-center gap-1 text-sm font-extrabold text-[#ff5470]"><Heart size={14} className="fill-current" />{hp}</span>
        {timePerQ ? <TimerRing seconds={time} max={timePerQ} size={40} /> : null}
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">{title} · {qi + 1}/{questions.length}</span>
        <ComboMeter combo={combo} />
      </div>
      <p className="display mb-4 text-[16px] font-bold leading-snug text-white">{q.q}</p>
      <div className="space-y-2">
        {q.a.map((opt, i) => {
          const isC = answered && i === q.correct;
          const isW = pick === i && i !== q.correct;
          return (
            <motion.button key={i} whileTap={!answered ? { scale: 0.98 } : {}} onClick={() => answer(i)} disabled={answered}
              className={cn("flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[13px] font-bold transition",
                isC ? "anim-pop border-[#8ef23c] bg-[#8ef23c]/12 text-[#a4ff5e]" :
                isW ? "anim-shake border-[#ff5470] bg-[#ff5470]/12 text-[#ff8ba0]" :
                answered ? "border-white/8 bg-black/20 text-[#54678f]" :
                "border-white/12 bg-black/25 text-[#dbe6ff] hover:border-[#5b8cff]/50")}
              style={{ boxShadow: "0 3px 0 #030816" }}>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-extrabold",
                isC ? "border-[#8ef23c] bg-[#8ef23c] text-[#0a2210]" : isW ? "border-[#ff5470] bg-[#ff5470] text-white" : "border-white/15 bg-white/5 text-[#8ea6d8]")}>
                {isC ? <Check size={14} strokeWidth={3.5} /> : isW ? <X size={14} strokeWidth={3.5} /> : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
            className={cn("mt-3 rounded-2xl border p-3.5", pick === q.correct ? "border-[#8ef23c]/40 bg-[#8ef23c]/10" : "border-[#ff5470]/40 bg-[#ff5470]/10")}>
            <p className={cn("display text-sm font-extrabold", pick === q.correct ? "text-[#8ef23c]" : "text-[#ff5470]")}>
              {pick === q.correct ? `Верно! +${10 + combo * 5} XP` : "Неверно"}
            </p>
            <p className="mb-3 text-xs text-[#aebde6]">{q.explain}</p>
            <button onClick={next} className={cn("btn3d w-full py-3.5 text-xs", pick === q.correct ? "btn3d-green" : "btn3d-short")}>
              {qi + 1 >= questions.length || hp <= 0 ? "Finish" : "Continue"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ===================== LIVES / HEARTS BREAK ===================== */
export function OutOfHearts({ onRefill, onClose, cost = 150 }: { onRefill: () => void; onClose: () => void; cost?: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-[#020617]/8 p-4 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className="panel-3d w-full max-w-sm p-6 text-center">
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
          <Heart size={64} className="mx-auto fill-[#ff5470] text-[#ff5470]" style={{ filter: "drop-shadow(0 0 20px #ff5470)" }} />
        </motion.div>
        <h3 className="display mt-3 text-xl font-extrabold text-white">Out of hearts!</h3>
        <p className="text-sm text-[#8ea6d8]">Подожди 4 часа или купи пополнение.</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="btn3d btn3d-ghost py-3 text-xs">Wait</button>
          <button onClick={() => { onRefill(); sfx.coin(); }} className="btn3d btn3d-blue py-3 text-xs"><Gem size={14} /> {cost}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ===================== STAR RATING ===================== */
export function StarBurst({ stars, max = 3 }: { stars: number; max?: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: max }, (_, i) => (
        <motion.div key={i} initial={{ scale: 0, rotate: -40, y: 20 }} animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{ delay: 0.3 + i * 0.18, type: "spring", stiffness: 300, damping: 12 }}>
          <Star size={40} className={i < stars ? "fill-[#ffc531] text-[#ffc531]" : "text-[#2a4b8f]"}
            style={i < stars ? { filter: "drop-shadow(0 0 14px #ffc531)" } : undefined} />
        </motion.div>
      ))}
    </div>
  );
}

/* ===================== PROGRESS PATH NODE ===================== */
export type PathNode = {
  id: string; title: string; kind: "lesson" | "chest" | "boss" | "checkpoint" | "story";
  state: "locked" | "current" | "done" | "chest";
  xp?: number; x?: number;
};
export function LearningPath({ nodes, onNode }: { nodes: PathNode[]; onNode: (n: PathNode) => void }) {
  return (
    <div className="relative mx-auto max-w-[320px] py-4">
      <svg className="pointer-events-none absolute left-1/2 top-0 h-full w-[140px] -translate-x-1/2 opacity-70" viewBox={`0 0 140 ${nodes.length * 90}`} preserveAspectRatio="none">
        <path d={nodes.map((_, i) => {
          const y = 40 + i * 90;
          const x = 70 + (i % 2 === 0 ? -40 : 40) * (i === 0 ? 0 : 1);
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        }).join(" ")} fill="none" stroke="#244385" strokeWidth="10" strokeLinecap="round" strokeDasharray="2 14" />
        <motion.path d={nodes.filter(n => n.state === "done" || n.state === "current").map((_, i) => {
          const y = 40 + i * 90;
          const x = 70 + (i % 2 === 0 ? -40 : 40) * (i === 0 ? 0 : 1);
          return `${i === 0 ? "M" : "L"}${x},${y}`;
        }).join(" ")} fill="none" stroke="#8ef23c" strokeWidth="10" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
      </svg>
      <div className="relative z-10 flex flex-col items-center gap-6">
        {nodes.map((n, i) => {
          const x = (i % 2 === 0 ? -1 : 1) * (i === 0 ? 0 : 48);
          const Icon = n.kind === "boss" ? Shield : n.kind === "chest" ? Sparkles : n.kind === "checkpoint" ? Trophy : n.state === "done" ? Check : Star;
          return (
            <div key={n.id} style={{ transform: `translateX(${x}px)` }} className="flex flex-col items-center">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => { if (n.state !== "locked") { sfx.pop(); onNode(n); } }}
                className={cn("relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] transition",
                  n.state === "done" && "border-[#ffd76a]/50 bg-gradient-to-b from-[#ffd76a] to-[#e79a06] text-[#3a2200]",
                  n.state === "current" && "anim-pulse-ring border-[#b6ff7d] bg-gradient-to-b from-[#a4ff5e] to-[#62c91d] text-[#0a2210]",
                  n.state === "chest" && "border-[#ffd76a] bg-gradient-to-b from-[#2a1f08] to-[#141021] text-[#ffc531]",
                  n.state === "locked" && "border-white/10 bg-gradient-to-b from-[#22345e] to-[#101f47] text-[#54678f]",
                  n.kind === "boss" && n.state !== "locked" && "border-[#ff5470] bg-gradient-to-b from-[#4a1020] to-[#1c0a14] text-[#ff8ba0]",
                )}
                style={{ boxShadow: "0 6px 0 #030816, inset 0 2px 0 rgba(255,255,255,.35)", animation: n.state === "chest" ? "chest-glow 2s infinite" : undefined }}>
                {n.state === "locked" ? <Lock size={24} /> : <Icon size={28} strokeWidth={n.state === "done" ? 3.2 : 2.2} className={n.state === "current" ? "fill-current" : ""} />}
                {n.state === "current" && (
                  <span className="absolute -top-9 whitespace-nowrap rounded-xl border border-[#8ef23c]/40 bg-[#0a2210] px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#8ef23c]">START</span>
                )}
              </motion.button>
              <p className={cn("mt-1.5 max-w-[100px] text-center text-[11px] font-extrabold", n.state === "locked" ? "text-[#54678f]" : "text-white")}>{n.title}</p>
              {n.xp && n.state !== "locked" && <span className="text-[9px] font-bold text-[#8ef23c]">+{n.xp} XP</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== SWIPE CARD STACK ===================== */
export type SwipeItem = { id: string; title: string; body: string; color: string; glyph: string; answer: "left" | "right"; leftLabel: string; rightLabel: string };
export function SwipeStack({ items, onDone }: { items: SwipeItem[]; onDone: (r: { correct: number; total: number }) => void }) {
  const [deck, setDeck] = useState(items);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; t: string } | null>(null);

  const swipe = (dir: "left" | "right") => {
    const top = deck[0];
    if (!top) return;
    const ok = top.answer === dir;
    if (ok) { setCorrect(c => c + 1); sfx.success(); } else sfx.error();
    setFeedback({ ok, t: ok ? "Верно!" : "Мимо" });
    setTimeout(() => {
      setFeedback(null);
      setDeck(d => {
        const next = d.slice(1);
        if (next.length === 0) onDone({ correct: correct + (ok ? 1 : 0), total: items.length });
        return next;
      });
    }, 500);
  };

  if (deck.length === 0) return null;
  return (
    <div className="relative mx-auto h-[380px] max-w-[320px]">
      <AnimatePresence>
        {deck.slice(0, 3).map((it, i) => (
          <SwipeableCard key={it.id} item={it} top={i === 0} depth={i} onSwipe={swipe} />
        )).reverse()}
      </AnimatePresence>
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            className={cn("absolute inset-x-8 top-1/2 z-50 -translate-y-1/2 rounded-2xl border-4 py-4 text-center display text-3xl font-black",
              feedback.ok ? "border-[#2ede8a] bg-[#2ede8a]/20 text-[#2ede8a]" : "border-[#ff5470] bg-[#ff5470]/20 text-[#ff5470]")}>
            {feedback.t}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute -bottom-2 left-0 right-0 flex justify-between px-2 text-[10px] font-extrabold uppercase tracking-widest">
        <span className="text-[#ff5470]">← {deck[0]?.leftLabel}</span>
        <span className="text-[#7d92c4]">{items.length - deck.length + 1}/{items.length}</span>
        <span className="text-[#2ede8a]">{deck[0]?.rightLabel} →</span>
      </div>
    </div>
  );
}

function SwipeableCard({ item, top, depth, onSwipe }: { item: SwipeItem; top: boolean; depth: number; onSwipe: (d: "left" | "right") => void }) {
  const x = useMotionValue(0);
  const rot = useTransform(x, [-220, 220], [-18, 18]);
  const leftO = useTransform(x, [-120, -20], [1, 0]);
  const rightO = useTransform(x, [20, 120], [0, 1]);
  const fly = (d: "left" | "right") => {
    const to = d === "right" ? 520 : -520;
    const start = performance.now();
    const from = x.get();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 280);
      x.set(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(step);
      else onSwipe(d);
    };
    requestAnimationFrame(step);
  };
  const end = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 500) fly("right");
    else if (info.offset.x < -110 || info.velocity.x < -500) fly("left");
  };
  return (
    <motion.div className="absolute inset-0" style={{ x: top ? x : 0, rotate: top ? rot : 0, zIndex: 10 - depth }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 2 ? 0 : 1 }}
      drag={top ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.9} onDragEnd={end}
      exit={{ opacity: 0 }}>
      <div className="panel-3d relative h-full overflow-hidden !rounded-[28px] p-5" style={{ borderColor: `${item.color}55` }}>
        <motion.div style={{ opacity: rightO, borderColor: "#2ede8a", color: "#2ede8a" }} className="absolute left-4 top-4 z-10 -rotate-12 rounded-xl border-4 px-3 py-1 display text-2xl font-black">{item.rightLabel}</motion.div>
        <motion.div style={{ opacity: leftO, borderColor: "#ff5470", color: "#ff5470" }} className="absolute right-4 top-4 z-10 rotate-12 rounded-xl border-4 px-3 py-1 display text-2xl font-black">{item.leftLabel}</motion.div>
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl text-4xl font-black" style={{ background: `${item.color}22`, color: item.color, border: `2px solid ${item.color}66` }}>{item.glyph}</div>
        <p className="display mt-6 text-xl font-extrabold text-white">{item.title}</p>
        <p className="mt-2 text-sm text-[#aebde6]">{item.body}</p>
        {top && (
          <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
            <button onClick={() => fly("left")} className="btn3d btn3d-short py-3 text-xs">{item.leftLabel}</button>
            <button onClick={() => fly("right")} className="btn3d btn3d-long py-3 text-xs">{item.rightLabel}</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ===================== COUNTDOWN / READY GO ===================== */
export function ReadyGo({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n < 0) { onDone(); return; }
    sfx.tick();
    const t = setTimeout(() => setN(x => x - 1), 700);
    return () => clearTimeout(t);
  }, [n, onDone]);
  const label = n > 0 ? String(n) : "GO!";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-[#020617]/7 backdrop-blur-sm">
      <motion.span key={label} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
        className="display text-7xl font-extrabold text-white" style={{ textShadow: "0 0 40px #8ef23c" }}>{label}</motion.span>
    </motion.div>
  );
}

/* ===================== HP BAR BIG ===================== */
export function BossHp({ hp, max, name, color = "#ff5470" }: { hp: number; max: number; name: string; color?: string }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-extrabold">
        <span className="text-white">{name}</span>
        <span className="num-mono" style={{ color }}>{Math.ceil(hp)}/{max}</span>
      </div>
      <div className="relative h-5 overflow-hidden rounded-full border border-white/20 bg-black/60">
        <motion.div className="absolute inset-y-0 left-0 rounded-full" animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{ background: `linear-gradient(180deg, ${color}, ${color}99)`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.5), 0 0 16px ${color}88` }} />
        {[25, 50, 75].map(m => <span key={m} className="absolute inset-y-0 w-px bg-black/50" style={{ left: `${m}%` }} />)}
      </div>
    </div>
  );
}

/* ===================== SLOT / REEL helpers ===================== */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/* ===================== PRESSABLE 3D TILE ===================== */
export function PressTile({ children, onPress, color, className, disabled }: {
  children: ReactNode; onPress?: () => void; color?: string; className?: string; disabled?: boolean;
}) {
  return (
    <motion.button disabled={disabled} whileTap={disabled ? undefined : { scale: 0.92, y: 4 }}
      onClick={() => { if (disabled) return; sfx.tap(); onPress?.(); }}
      className={cn("relative rounded-2xl border border-white/15 p-3 text-left transition disabled:opacity-50", className)}
      style={{
        background: color ? `linear-gradient(160deg, ${color}55, #0b1a42)` : "linear-gradient(180deg, #1b3773, #12265a)",
        boxShadow: "0 5px 0 #030816, inset 0 1px 0 rgba(255,255,255,.25)",
      }}>
      {children}
    </motion.button>
  );
}

/* ===================== HORIZONTAL SNAP CAROUSEL (gameplay) ===================== */
export function SnapRail({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    setN(el.children.length);
    const onScroll = () => {
      const w = (el.firstElementChild as HTMLElement)?.offsetWidth + 12 || 1;
      const a = Math.round(el.scrollLeft / w);
      if (a !== i) { setI(a); sfx.tick(); }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [i]);
  const go = (d: number) => {
    const el = ref.current; if (!el) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    el.scrollTo({ left: Math.max(0, Math.min(n - 1, i + d)) * w, behavior: "smooth" });
  };
  return (
    <div className={className}>
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">{children}</div>
      <div className="mt-2 flex items-center justify-between">
        <button onClick={() => go(-1)} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl"><ChevronLeft size={16} /></button>
        <div className="flex gap-1.5">{Array.from({ length: n }, (_, k) => (
          <span key={k} className={cn("h-2 rounded-full transition-all", k === i ? "w-6 bg-[#8ef23c]" : "w-2 bg-white/20")} />
        ))}</div>
        <button onClick={() => go(1)} className="btn3d btn3d-green h-9 w-9 !rounded-xl"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

/* ===================== VERTICAL PARALLAX LAYER ===================== */
export function ParallaxLayer({ children, speed = 0.3, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      y.set(-mid * speed);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed, y]);
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}

/* ===================== SECTION HEADER (gameplay style) ===================== */
export function GameSection({ id, index, kicker, title, desc, children, right }: {
  id: string; index: string; kicker: string; title: string; desc: string; children: ReactNode; right?: ReactNode;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }}
        className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <Tilt max={10} className="!rounded-2xl">
            <div className="panel-3d flex h-14 w-14 items-center justify-center !rounded-2xl">
              <span className="display text-lg font-extrabold text-[#8ef23c] text-glow-green">{index}</span>
            </div>
          </Tilt>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-[6px] w-10 rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5b8cff]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#8ea6d8]">{kicker}</span>
            </div>
            <h2 className="display text-2xl sm:text-[32px] font-extrabold tracking-tight text-white leading-tight">{title}</h2>
            <p className="mt-1 max-w-xl text-sm text-[#9fb2dd]">{desc}</p>
          </div>
        </div>
        {right}
      </motion.div>
      {children}
    </section>
  );
}

/* ===================== FLOATING DAMAGE NUMBERS ===================== */
export function useDamageNumbers() {
  const [items, setItems] = useState<{ id: number; x: number; y: number; t: string; c: string }[]>([]);
  const hit = (x: number, y: number, t: string, c = "#ff5470") => {
    const id = Date.now() + Math.random();
    setItems(p => [...p, { id, x, y, t, c }]);
    setTimeout(() => setItems(p => p.filter(q => q.id !== id)), 900);
  };
  const node = (
    <>
      {items.map(f => (
        <motion.span key={f.id} className="num-mono pointer-events-none absolute z-50 text-lg font-black"
          style={{ left: f.x, top: f.y, color: f.c, textShadow: `0 0 12px ${f.c}` }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }} animate={{ y: -50, opacity: 0, scale: 1.4 }} transition={{ duration: 0.9 }}>
          {f.t}
        </motion.span>
      ))}
    </>
  );
  return { hit, node };
}

/* ===================== DAILY LOGIN CALENDAR ===================== */
export function LoginCalendar({ claimed, onClaim }: { claimed: boolean[]; onClaim: (day: number) => void }) {
  const rewards = [10, 20, 30, 50, 40, 60, 100];
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {rewards.map((r, i) => {
        const c = claimed[i];
        const today = claimed.filter(Boolean).length === i;
        return (
          <motion.button key={i} whileTap={today && !c ? { scale: 0.9 } : {}}
            onClick={() => { if (today && !c) { onClaim(i); sfx.coin(); confetti({ particleCount: 40, spread: 55 }); } }}
            className={cn("relative flex flex-col items-center rounded-xl border p-2",
              c ? "border-[#8ef23c]/40 bg-[#8ef23c]/15" : today ? "anim-pulse-ring border-[#ffc531] bg-[#ffc531]/15" : "border-white/10 bg-black/25")}>
            <span className="text-[9px] font-bold text-[#7d92c4]">D{i + 1}</span>
            <span className="text-base">{c ? "✓" : i === 6 ? "🎁" : "⚡"}</span>
            <span className="num-mono text-[9px] font-extrabold text-white">+{r}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ===================== ENERGY / STAMINA BAR ===================== */
export function EnergyBar({ value, max = 100 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <Zap size={14} className="text-[#ffc531]" />
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/50 border border-white/10">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-[#ffc531] to-[#ff8b3d]"
          animate={{ width: `${(value / max) * 100}%` }} style={{ boxShadow: "0 0 10px #ffc531" }} />
      </div>
      <span className="num-mono text-[10px] font-extrabold text-white">{value}/{max}</span>
    </div>
  );
}

/* ===================== CONFETTI HELPERS ===================== */
export function fireWin() {
  confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ["#8ef23c", "#ffc531", "#5b8cff", "#fff"] });
  sfx.levelUp();
}
export function fireSmall() {
  confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 }, colors: ["#8ef23c", "#fff"] });
  sfx.success();
}

/* ===================== MULTIPLIER BADGE ===================== */
export function MultiBadge({ x }: { x: number }) {
  if (x <= 1) return null;
  return (
    <motion.span key={x} initial={{ scale: 2, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
      className="inline-flex items-center rounded-full border border-[#ffc531]/50 bg-[#ffc531]/20 px-2 py-0.5 text-[10px] font-black text-[#ffd76a]">
      ×{x} BOOST
    </motion.span>
  );
}

/* ===================== LOCKED OVERLAY ===================== */
export function LockedOverlay({ reason }: { reason: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[inherit] bg-[#020617]/75 backdrop-blur-sm">
      <Lock size={28} className="text-[#8ea6d8]" />
      <p className="mt-2 text-xs font-extrabold text-white">{reason}</p>
    </div>
  );
}

/* ===================== SIMPLE SPARKLINE ===================== */
export function Spark({ data, color = "#2ede8a", h = 36, w = 100 }: { data: number[]; color?: string; h?: number; w?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 4 - ((v - min) / (max - min || 1)) * (h - 8)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ===================== TOGGLE CHIP ROW ===================== */
export function ChipRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o} onClick={() => { onChange(o); sfx.tick(); }}
          className={cn("relative rounded-xl px-3 py-1.5 text-[11px] font-extrabold", value === o ? "text-[#0a2210]" : "text-[#8ea6d8] bg-white/5")}>
          {value === o && <motion.span layoutId="chiprow" className="absolute inset-0 rounded-xl bg-[#8ef23c]" style={{ boxShadow: "0 3px 0 #3a7d0d" }} />}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

/* ===================== NUMBER TICKER ===================== */
export function LivePrice({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const prev = useRef(value);
  const [dir, setDir] = useState(0);
  useEffect(() => {
    setDir(value > prev.current ? 1 : value < prev.current ? -1 : 0);
    prev.current = value;
  }, [value]);
  return (
    <span className={cn("num-mono font-extrabold transition-colors", dir > 0 ? "text-[#2ede8a]" : dir < 0 ? "text-[#ff5470]" : "text-white")}>
      {prefix}<Odometer value={value} decimals={value < 10 ? 4 : value < 1000 ? 2 : 0} />
    </span>
  );
}

/* ===================== SHAKE ON ERROR ===================== */
export function useShake() {
  const [n, setN] = useState(0);
  const shake = () => { setN(x => x + 1); sfx.error(); };
  const props = { key: n, animate: n ? { x: [0, -8, 8, -6, 6, 0] } : {}, transition: { duration: 0.4 } };
  return { shake, props };
}

/* ===================== PAGE PAGER (onboarding style) ===================== */
export function Pager({ pages }: { pages: { title: string; body: string; color: string; icon: ReactNode }[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    const n = Math.max(0, Math.min(pages.length - 1, i + d));
    if (n !== i) { setDir(d); setI(n); sfx.swipe(); }
  };
  const p = pages[i];
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/10" style={{ background: `radial-gradient(circle at 50% 0%, ${p.color}33, #081130 70%)` }}>
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.div key={i} custom={dir} drag="x" dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => { if (info.offset.x < -50) go(1); else if (info.offset.x > 50) go(-1); }}
          initial={{ x: dir * 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -dir * 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="cursor-grab p-6 text-center active:cursor-grabbing">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[24px]" style={{ background: `linear-gradient(180deg, ${p.color}, ${p.color}88)`, boxShadow: `0 6px 0 ${p.color}55` }}>
            {p.icon}
          </div>
          <h4 className="display text-xl font-extrabold text-white">{p.title}</h4>
          <p className="mt-2 text-sm text-[#aebde6]">{p.body}</p>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between px-4 pb-4">
        <button onClick={() => go(-1)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><ChevronLeft size={16} /></button>
        <div className="flex gap-1.5">{pages.map((_, k) => (
          <button key={k} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }} className="h-2 rounded-full transition-all" style={{ width: k === i ? 24 : 8, background: k === i ? p.color : "rgba(255,255,255,.2)" }} />
        ))}</div>
        <button onClick={() => go(1)} className="btn3d btn3d-green h-10 w-10 !rounded-xl"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

/* ===================== EXPORT MAGNETIC CTA ===================== */
export function MagCTA({ children, onClick, tone = "green" }: { children: ReactNode; onClick?: () => void; tone?: "green" | "gold" | "blue" | "short" }) {
  return (
    <Magnetic strength={0.4}>
      <RippleButton onClick={onClick} sound="pop" className={cn("btn3d px-6 py-3.5 text-xs", `btn3d-${tone}`)}>{children}</RippleButton>
    </Magnetic>
  );
}


/* ===================== DAILY RUN ROGUELITE MAP ===================== */
export type RunNode = { id: string; x: number; y: number; type: "fight" | "shop" | "rest" | "elite" | "boss" | "event"; cleared?: boolean };
export function generateRunMap(seed = 1): RunNode[][] {
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const layers = 8;
  const out: RunNode[][] = [];
  for (let y = 0; y < layers; y++) {
    const count = y === 0 || y === layers - 1 ? 1 : 2 + Math.floor(rnd() * 3);
    const row: RunNode[] = [];
    for (let i = 0; i < count; i++) {
      let type: RunNode["type"] = "fight";
      if (y === layers - 1) type = "boss";
      else if (y === 0) type = "fight";
      else {
        const r = rnd();
        type = r < 0.45 ? "fight" : r < 0.6 ? "event" : r < 0.72 ? "shop" : r < 0.85 ? "rest" : "elite";
      }
      row.push({ id: `${y}-${i}`, x: (i + 1) / (count + 1), y: y / (layers - 1), type });
    }
    out.push(row);
  }
  return out;
}

export const RUN_EVENTS = [
  { t: "Mysterious chart", b: "A stranger offers a pattern. Pay 10 HP for +20 ATK?", ok: "Accept", no: "Leave" },
  { t: "Funding storm", b: "All leverage free for one fight — or skip safely.", ok: "Ride it", no: "Skip" },
  { t: "Mentor ghost", b: "Learn one relic upgrade free.", ok: "Study", no: "Ignore" },
  { t: "Scam link", b: "Looks juicy. Probably a trap.", ok: "Click (dumb)", no: "Block" },
];

export const RUN_RELICS = [
  { id: "r1", n: "Iron Stop", desc: "+10 DEF", atk: 0, def: 10 },
  { id: "r2", n: "Scalper Blade", desc: "+8 ATK", atk: 8, def: 0 },
  { id: "r3", n: "Zen Amulet", desc: "+4 ATK +4 DEF", atk: 4, def: 4 },
  { id: "r4", n: "Whale Tooth", desc: "+15 ATK -5 DEF", atk: 15, def: -5 },
  { id: "r5", n: "Journal Quill", desc: "+6 ATK +6 DEF", atk: 6, def: 6 },
];

/* ===================== FORMAT HELPERS ===================== */
export function formatMoney(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function formatCompact(n: number) {
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(2);
}
export function pct(n: number, d = 2) { return `${n >= 0 ? "+" : ""}${n.toFixed(d)}%`; }

/* ===================== LOCAL STORAGE HOOK ===================== */
export function loadJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

/* ===================== COMBO TEXT TABLE ===================== */
export const COMBO_TITLES = ["", "", "Good", "Nice", "Great", "Awesome", "Insane", "Godlike", "Unstoppable", "LEGENDARY", "GOD TIER"];
export function comboTitle(n: number) { return COMBO_TITLES[Math.min(COMBO_TITLES.length - 1, n)] || ""; }

/* ===================== SOUND CUE MAP ===================== */
export type Cue = "tap" | "success" | "error" | "coin" | "level" | "whoosh" | "long" | "short";
export function playCue(_c: Cue) {
  /* reserved for batched audio scheduling */
}
