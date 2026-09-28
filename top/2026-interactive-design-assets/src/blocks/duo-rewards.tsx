import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Check, ChevronUp, ChevronDown, Flame, Gem, Snowflake, Timer, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { Bubble, Mascot } from "../duo/Mascot";
import { D, DuoButton } from "../duo/ui";
import { centerIn, useTimers } from "./util";

/* ───────── shared flame ───────── */
function BigFlame({ lit, size = 150 }: { lit: boolean; size?: number }) {
  const fx = useFx();
  return (
    <motion.svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 100 115"
      style={{ originY: 1 }}
      animate={lit && !fx.reduced ? { scaleY: [1, 1.05, 0.97, 1.03, 1], scaleX: [1, 0.97, 1.02, 0.99, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      aria-hidden
    >
      <defs>
        <linearGradient id="bf-o" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={lit ? "#ff6a00" : "#34488c"} />
          <stop offset="100%" stopColor={lit ? "#ffb000" : "#4a60a8"} />
        </linearGradient>
      </defs>
      <path d="M50 3 C60 24 88 40 88 72 C88 98 71 113 50 113 C29 113 12 98 12 72 C12 50 29 38 36 16 C42 30 46 36 50 40 C50 26 47 14 50 3Z" fill="url(#bf-o)" />
      <path d="M50 50 C57 64 70 74 70 90 C70 104 61 111 50 111 C39 111 30 104 30 90 C30 78 42 70 50 50Z" fill={lit ? "#ffd84a" : "#5b72b8"} />
      <path d="M50 76 C54 84 60 88 60 96 C60 103 56 107 50 107 C44 107 40 103 40 96 C40 90 46 86 50 76Z" fill={lit ? "#fff6c9" : "#6f85c4"} />
    </motion.svg>
  );
}

/* ═════════════ 27 · STREAK CELEBRATION ═════════════ */
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function StreakCelebration() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const flame = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [done, setDone] = useState(false);
  const [n, setN] = useState(6);
  const [perfect, setPerfect] = useState(false);

  useEffect(() => {
    if (!done || fx.reduced) return;
    const id = setInterval(() => {
      if (root.current && flame.current) {
        const c = centerIn(root.current, flame.current);
        pr.current?.burst(c.x, c.y + 10, { count: 2, colors: ["#ffb000", "#fff3c4"], speed: 2.2, angle: -Math.PI / 2, spread: 1.1, gravity: -0.03, shape: "circle", size: 5, life: 55 });
      }
    }, 140 / fx.speed);
    return () => clearInterval(id);
  }, [done, fx.reduced, fx.speed]);

  const complete = () => {
    setDone(true);
    fx.sfx("whoosh");
    fx.haptic(15);
    later(() => {
      setN(7);
      fx.sfx("win");
      fx.haptic([30, 40, 90]);
      if (root.current && flame.current) {
        const c = centerIn(root.current, flame.current);
        pr.current?.burst(c.x, c.y, { count: 90, colors: [D.orange, D.yellow, "#fff"], speed: 9 });
      }
    }, fx.ms(450));
    later(() => {
      setPerfect(true);
      fx.sfx("coin");
    }, fx.ms(1300));
  };

  const reset = () => {
    setDone(false);
    setN(6);
    setPerfect(false);
  };

  return (
    <div ref={root} className="relative flex h-full flex-col items-center px-4 pb-5 pt-4 text-center">
      <div ref={flame} className="relative mt-2">
        {done && !fx.reduced && (
          <motion.div className="absolute inset-0 -z-10 rounded-full bg-[#ff9600] blur-3xl" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.35, scale: 1.2 }} transition={{ duration: 0.6 }} />
        )}
        <motion.div animate={done ? { scale: [0.8, 1.2, 1] } : { scale: 0.85 }} transition={{ duration: fx.t(0.6) }}>
          <BigFlame lit={done} size={130} />
        </motion.div>
      </div>

      <div className="relative -mt-2 h-[72px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={n}
            initial={{ y: 70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -70, opacity: 0 }}
            transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 20 }}
            className="text-6xl font-black leading-[72px]"
            style={{ color: done ? D.orange : "#4a60a8" }}
          >
            {n}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="text-2xl font-black" style={{ color: done ? D.orange : "#8fa0d6" }}>
        day streak!
      </div>

      <div className="duo-card mt-5 w-full p-4">
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d, i) => {
            const today = i === 6;
            const filled = !today || done;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className={`text-xs font-black ${today ? "text-[#ff9600]" : "text-white/50"}`}>{d}</span>
                <motion.div
                  animate={perfect && !fx.reduced ? { y: [0, -8, 0] } : {}}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="relative grid h-8 w-8 place-items-center rounded-full"
                  style={{ background: filled ? D.orange : "transparent", border: filled ? "none" : `3px dashed ${D.orange}` }}
                >
                  {filled && (
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <motion.path
                        d="M4 12l5 5L20 6"
                        fill="none"
                        stroke="#fff"
                        strokeWidth={4}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={today ? { pathLength: 0 } : false}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: fx.t(0.35), delay: today ? fx.t(0.5) : 0 }}
                      />
                    </svg>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
        <AnimatePresence>
          {perfect && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
              <div className="pt-3 text-base font-black text-[#ffc800]">⭐ Perfect week!</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="duo-card mt-3 flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1cb0f6]/20 text-[#1cb0f6]">
          <Snowflake size={22} strokeWidth={2.5} />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-black">Streak Freeze</span>
          <span className="block text-xs font-bold text-white/55">Protects your streak for one missed day</span>
        </span>
        <span className="text-sm font-black text-[#1cb0f6]">×2</span>
      </div>

      <div className="flex-1" />
      {done ? (
        <DuoButton full onClick={reset}>
          Continue
        </DuoButton>
      ) : (
        <DuoButton tone="orange" full onClick={complete}>
          Complete today
        </DuoButton>
      )}
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 28 · DAILY QUESTS ═════════════ */
type Quest = { id: string; title: string; I: LucideIcon; color: string; goal: number; have: number; inc: number; claimed: boolean };
const QUESTS: Quest[] = [
  { id: "xp", title: "Earn 30 XP", I: Zap, color: D.yellow, goal: 30, have: 10, inc: 10, claimed: false },
  { id: "lessons", title: "Complete 2 lessons", I: BookOpen, color: D.blue, goal: 2, have: 1, inc: 1, claimed: false },
  { id: "row", title: "Get 5 in a row", I: Flame, color: D.orange, goal: 5, have: 2, inc: 1, claimed: false },
];
type Fly = { id: number; sx: number; sy: number; ex: number; ey: number; d: number };

function Chest({ open, ready }: { open: boolean; ready: boolean }) {
  const fx = useFx();
  return (
    <motion.svg
      width="42"
      height="40"
      viewBox="0 0 42 40"
      animate={ready && !open && !fx.reduced ? { rotate: [0, -10, 10, -6, 0], y: [0, -3, 0] } : {}}
      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.8 }}
      aria-hidden
    >
      <rect x="4" y="18" width="34" height="19" rx="4" fill={ready || open ? "#c9761a" : "#34488c"} />
      <rect x="18" y="18" width="6" height="19" fill={ready || open ? "#8f4f0c" : "#2a3a6e"} />
      <motion.g style={{ originX: 0.1, originY: 1 }} animate={{ rotate: open ? -38 : 0, y: open ? -3 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
        <path d="M4 18 Q4 6 21 6 Q38 6 38 18 Z" fill={ready || open ? "#ffc800" : "#4a60a8"} />
        <rect x="18" y="6" width="6" height="12" fill={ready || open ? "#e0a100" : "#3d5096"} />
      </motion.g>
      {open && <circle cx="21" cy="16" r="6" fill="#fff6c9" opacity={0.9} />}
    </motion.svg>
  );
}

export function DailyQuests() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const gemEl = useRef<HTMLDivElement>(null);
  const chests = useRef<Record<string, HTMLButtonElement | null>>({});
  const pr = useRef<ParticlesHandle>(null);
  const [qs, setQs] = useState<Quest[]>(QUESTS);
  const [gems, setGems] = useState(420);
  const [bump, setBump] = useState(0);
  const [flights, setFlights] = useState<Fly[]>([]);
  const [happy, setHappy] = useState(false);
  const later = useTimers();

  const play = () => {
    fx.sfx("pop");
    fx.haptic(8);
    setQs((list) =>
      list.map((q) => {
        const have = Math.min(q.goal, q.have + q.inc);
        if (have === q.goal && q.have < q.goal) later(() => { fx.sfx("win"); fx.haptic([20, 30, 60]); }, 250);
        return { ...q, have };
      })
    );
  };

  const claim = (q: Quest) => {
    if (q.have < q.goal || q.claimed) return;
    setQs((list) => list.map((x) => (x.id === q.id ? { ...x, claimed: true } : x)));
    fx.sfx("coin");
    fx.haptic([20, 20, 40]);
    setHappy(true);
    later(() => setHappy(false), fx.ms(1500));
    const el = chests.current[q.id];
    if (root.current && el && gemEl.current) {
      const s = centerIn(root.current, el);
      const e = centerIn(root.current, gemEl.current);
      pr.current?.burst(s.x, s.y, { count: 40, colors: [D.yellow, "#fff6c9", D.blue], speed: 6, shape: "circle", size: 5 });
      const base = Date.now();
      setFlights((f) => [...f, ...Array.from({ length: 6 }, (_, k) => ({ id: base + k, sx: s.x, sy: s.y, ex: e.x, ey: e.y, d: k * 0.06 }))]);
    }
  };

  const allDone = qs.every((q) => q.claimed);

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-black">Daily Quests</div>
        <motion.div
          ref={gemEl}
          key={bump}
          animate={bump && !fx.reduced ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-1 text-lg font-black text-[#1cb0f6]"
        >
          <Gem size={20} fill="currentColor" strokeWidth={1.5} /> <span className="tnum">{gems}</span>
        </motion.div>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-[#ff9600]">
        <Timer size={16} strokeWidth={3} /> 14 HOURS LEFT
      </div>

      <div className="mt-4 space-y-3">
        {qs.map((q) => {
          const ready = q.have >= q.goal;
          return (
            <div key={q.id} className="duo-card flex items-center gap-3 p-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${q.color}26`, color: q.color }}>
                <q.I size={22} strokeWidth={2.5} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-base font-black">{q.title}</div>
                <div className="relative mt-1.5 h-5 overflow-hidden rounded-full bg-[#2a3a6e]">
                  <motion.div
                    className="relative h-full rounded-full"
                    style={{ background: ready ? D.green : D.yellow }}
                    initial={false}
                    animate={{ width: `${(q.have / q.goal) * 100}%` }}
                    transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}
                  >
                    <div className="absolute left-2 right-2 top-[3px] h-[5px] rounded-full bg-white/35" />
                  </motion.div>
                  <span className="absolute inset-0 grid place-items-center text-xs font-black text-white drop-shadow">
                    {q.have} / {q.goal}
                  </span>
                </div>
              </div>
              <button
                ref={(el) => {
                  chests.current[q.id] = el;
                }}
                onClick={() => claim(q)}
                disabled={!ready || q.claimed}
                aria-label={q.claimed ? "Claimed" : ready ? `Open chest for ${q.title}` : "Chest locked"}
                className="relative grid h-12 w-12 place-items-center"
              >
                {q.claimed ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-9 w-9 place-items-center rounded-full bg-[#58cc02]">
                    <Check size={20} strokeWidth={4} color="#fff" />
                  </motion.span>
                ) : (
                  <Chest open={false} ready={ready} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />
      <div className="mb-3 flex items-end gap-2">
        <Mascot mood={happy ? "happy" : allDone ? "cheer" : "idle"} size={64} />
        <Bubble className="mb-2 flex-1 text-sm">{allDone ? "All quests done. See you tomorrow!" : qs.some((q) => q.have >= q.goal && !q.claimed) ? "Tap the shaking chest!" : "Play lessons to fill your quests."}</Bubble>
      </div>
      <DuoButton full disabled={qs.every((q) => q.have >= q.goal)} onClick={play}>
        Play a lesson
      </DuoButton>

      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="pointer-events-none absolute left-0 top-0 z-40 -ml-3 -mt-3 text-[#1cb0f6]"
          initial={{ x: f.sx, y: f.sy, scale: 0.4 }}
          animate={{ x: [f.sx, (f.sx + f.ex) / 2 + (f.id % 3 - 1) * 40, f.ex], y: [f.sy, Math.min(f.sy, f.ey) - 40, f.ey], scale: [0.4, 1.3, 0.7] }}
          transition={{ duration: fx.t(0.75) || 0.01, delay: fx.t(f.d), ease: "easeInOut" }}
          onAnimationComplete={() => {
            setFlights((fs) => fs.filter((x) => x.id !== f.id));
            setGems((g) => g + 5);
            setBump((b) => b + 1);
            fx.sfx("coin");
          }}
        >
          <Gem size={24} fill="currentColor" strokeWidth={1.5} />
        </motion.div>
      ))}
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 29 · LEAGUE PROMOTION ═════════════ */
const LEAGUES = [
  { n: "Bronze", c: "#cd7f32" },
  { n: "Silver", c: "#c3cbe0" },
  { n: "Gold", c: "#ffc800" },
  { n: "Sapphire", c: "#1cb0f6" },
  { n: "Ruby", c: "#ff4b4b" },
];
type Person = { id: string; n: string; xp: number; c: string; you?: boolean };
const PEOPLE: Person[] = [
  { id: "a", n: "Ana", xp: 420, c: D.pink },
  { id: "b", n: "Kenji", xp: 390, c: D.blue },
  { id: "c", n: "Lea", xp: 350, c: D.yellow },
  { id: "d", n: "Omar", xp: 300, c: D.purple },
  { id: "you", n: "You", xp: 180, c: D.green, you: true },
  { id: "e", n: "Sven", xp: 160, c: D.orange },
  { id: "f", n: "Ivy", xp: 120, c: D.red },
  { id: "g", n: "Bo", xp: 90, c: D.lime },
];

function Shield({ c, size = 40, locked }: { c: string; size?: number; locked?: boolean }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" aria-hidden>
      <path d="M20 2 L37 8 V22 C37 34 29 41 20 44 C11 41 3 34 3 22 V8 Z" fill={locked ? "#2a3a6e" : c} stroke={locked ? "#3a4d90" : "rgba(0,0,0,.18)"} strokeWidth={2} />
      <path d="M20 8 L31 12 V22 C31 30 26 35 20 37 Z" fill="#fff" opacity={locked ? 0.05 : 0.28} />
      {!locked && <path d="M20 14 l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.8-4.9 2.8 1.1-5.3-4-3.7 5.4-.6z" fill="#fff" opacity={0.85} />}
    </svg>
  );
}

export function LeaguePromotion() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const [promo, setPromo] = useState(false);
  const rank = people.findIndex((p) => p.you);

  const earn = () => {
    setPeople((ps) => [...ps.map((p) => (p.you ? { ...p, xp: p.xp + 90 } : p))].sort((a, b) => b.xp - a.xp));
    fx.sfx("coin");
    fx.haptic(10);
  };

  const endWeek = () => {
    setPromo(true);
    fx.sfx("win");
    fx.haptic([30, 50, 120]);
    const w = root.current?.offsetWidth ?? 286;
    later(() => {
      pr.current?.burst(w / 2, 180, { count: 110, colors: [D.blue, D.yellow, "#fff", D.green], speed: 11 });
    }, 350);
  };

  const reset = () => {
    setPromo(false);
    setPeople(PEOPLE);
  };

  return (
    <div ref={root} className="relative flex h-full flex-col overflow-hidden px-4 pb-5 pt-2">
      <div className="flex items-end justify-center gap-2">
        {LEAGUES.map((l, i) => (
          <motion.div key={l.n} animate={{ y: i === 2 ? -4 : 0, scale: i === 2 ? 1.15 : 0.8 }} className={i === 2 ? "" : "opacity-80"}>
            <Shield c={l.c} size={i === 2 ? 46 : 34} locked={i > 2} />
          </motion.div>
        ))}
      </div>
      <div className="mt-2 text-center text-2xl font-black">Gold League</div>
      <div className="text-center text-sm font-bold text-white/55">Top 3 advance to Sapphire</div>

      <ul className="mt-3 flex-1 space-y-1 overflow-hidden">
        {people.map((p, i) => (
          <motion.li key={p.id} layout={!fx.reduced} transition={{ type: "spring", stiffness: 420, damping: 36 }}>
            {i === 3 && (
              <div className="my-1.5 flex items-center justify-center gap-1 text-xs font-black text-[#58cc02]">
                <ChevronUp size={14} strokeWidth={4} /> PROMOTION ZONE <ChevronUp size={14} strokeWidth={4} />
              </div>
            )}
            {i === 6 && (
              <div className="my-1.5 flex items-center justify-center gap-1 text-xs font-black text-[#ff4b4b]">
                <ChevronDown size={14} strokeWidth={4} /> DEMOTION ZONE <ChevronDown size={14} strokeWidth={4} />
              </div>
            )}
            <div className={`flex h-11 items-center gap-3 rounded-2xl px-3 ${p.you ? "bg-[#1cb0f6]/15 ring-2 ring-[#1cb0f6]" : ""}`}>
              <span className={`tnum w-5 text-base font-black ${i < 3 ? "text-[#58cc02]" : i >= 6 ? "text-[#ff4b4b]" : "text-white/50"}`}>{i + 1}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full text-sm font-black text-[#0a1230]" style={{ background: p.c }}>
                {p.n[0]}
              </span>
              <span className={`flex-1 text-base font-extrabold ${p.you ? "text-[#1cb0f6]" : ""}`}>{p.n}</span>
              <span className="tnum text-sm font-black text-white/70">{p.xp} XP</span>
            </div>
          </motion.li>
        ))}
      </ul>

      <div className="mt-2">
        {rank < 3 ? (
          <DuoButton tone="blue" full onClick={endWeek}>
            End the week
          </DuoButton>
        ) : (
          <DuoButton full onClick={earn}>
            Earn 90 XP
          </DuoButton>
        )}
      </div>

      <AnimatePresence>
        {promo && (
          <motion.div className="absolute inset-0 z-30 flex flex-col items-center bg-[#132250] px-4 pb-5 pt-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative grid place-items-center">
              {!fx.reduced && (
                <motion.div
                  className="absolute h-[420px] w-[420px] rounded-full"
                  style={{
                    background: "repeating-conic-gradient(from 0deg, rgba(28,176,246,.22) 0deg 8deg, transparent 8deg 24deg)",
                    maskImage: "radial-gradient(circle, black 10%, transparent 60%)",
                    WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 60%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                />
              )}
              <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 11, delay: 0.15 }}>
                <Shield c={D.blue} size={120} />
              </motion.div>
            </div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: fx.t(0.5) }}>
              <div className="mt-6 text-3xl font-black">You're promoted!</div>
              <div className="mt-1 text-xl font-black text-[#1cb0f6]">Sapphire League</div>
              <p className="mt-2 text-base font-bold text-white/60">Finished #{rank + 1} in Gold. Process beats luck.</p>
            </motion.div>
            <div className="flex-1" />
            <Mascot mood="cheer" size={90} />
            <DuoButton tone="blue" full className="mt-4" onClick={reset}>
              Continue
            </DuoButton>
          </motion.div>
        )}
      </AnimatePresence>
      <Particles ref={pr} />
    </div>
  );
}
