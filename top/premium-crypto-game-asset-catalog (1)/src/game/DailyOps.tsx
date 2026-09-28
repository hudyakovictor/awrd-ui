import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton, HudPill } from "./Device";
import { ART, type ArtKey, GemArt, FlameArt, BoltArt, ChestArt, HeartArt } from "./art";
import { sfx, Confetti, Pop, fmtClock } from "./Juice";

/* ================================================================== */
/*  DAILY OPS — retention command center                                 */
/*  month streak map · quest board · habit tracker · focus timer ·       */
/*  weekly report · rescue offers                                        */
/* ================================================================== */

/* ---------------- month streak map ---------------- */
function MonthMap() {
  const [streak] = useState(42);
  const today = 18;
  // deterministic pseudo-history: 1=done, 0=miss, 2=freeze-used
  const hist: number[] = Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    if (d > today) return -1;
    if (d === 9) return 2;
    if (d === 15) return 0;
    if (d < today - 42) return i % 5 === 0 ? 0 : 1;
    return d === 15 ? 0 : 1;
  });
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <FlameArt size={44} />
        <div>
          <div className="flex items-baseline gap-1.5">
            <Pop value={streak} className="tnum font-mono text-[30px] font-black leading-none text-[#ffb347]" />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#ffcf9a]">day streak</span>
          </div>
          <div className="font-mono text-[9px] text-ink-500">personal best 58 · top 3% of learners</div>
        </div>
        <HudPill>
          <span className="text-[13px]">🧊</span>
          <span className="text-aqua">×2</span>
        </HudPill>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-center font-mono text-[8px] font-black text-ink-500">{d}</span>
        ))}
        <span />
        {hist.map((h, i) => {
          const d = i + 1;
          const isToday = d === today;
          return (
            <motion.button
              key={d}
              type="button"
              whileHover={h >= 0 ? { scale: 1.15 } : undefined}
              onClick={() => {
                if (h < 0) return;
                setSel(sel === d ? null : d);
                sfx("select");
              }}
              className={cn("relative grid aspect-square place-items-center rounded-lg font-mono text-[9px] font-black", h === -1 && "opacity-25")}
              style={{
                background: h === 1 ? "linear-gradient(180deg,#ffb347,#ff6a3d)" : h === 2 ? "linear-gradient(180deg,#7fe3f7,#34b5dc)" : h === 0 ? "#3a0f1c" : "#101a33",
                color: h === 1 ? "#3a1405" : h === 2 ? "#062a3a" : h === 0 ? "#ff4d6a" : "#3d4d73",
                boxShadow: isToday ? "0 0 0 2px #0a1226, 0 0 0 4px var(--accent)" : h >= 0 ? "0 2px 0 rgba(0,0,0,.4)" : undefined,
              }}
            >
              {h === 1 ? <Icon name="check" size={11} strokeWidth={4} /> : h === 2 ? <span className="text-[11px]">🧊</span> : h === 0 ? <Icon name="x" size={11} strokeWidth={3.5} /> : d}
              {isToday && <span className="absolute -bottom-1 h-1 w-1 rounded-full" style={{ background: "var(--accent)" }} />}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {sel && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl bg-[#0d1528] p-2.5 text-[11px] font-bold text-ink-200">
            Sep {sel}: {hist[sel - 1] === 1 ? "✅ 3 lessons · +85 XP · 24 min" : hist[sel - 1] === 2 ? "🧊 Streak freeze saved the day" : "❌ Missed — happened, let's rebuild"}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex gap-3 font-mono text-[8.5px] text-ink-500">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#ff6a3d]" /> done</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#34b5dc]" /> freeze</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-[#3a0f1c]" /> miss</span>
      </div>
    </div>
  );
}

/* ---------------- quest board ---------------- */
type Q = { id: string; t: string; v: number; m: number; xp: number; art: ArtKey; c: string; done: boolean };
const QS: Q[] = [
  { id: "q1", t: "Complete 3 lessons", v: 2, m: 3, xp: 60, art: "bolt", c: "#ffc24b", done: false },
  { id: "q2", t: "Score 80%+ in a quiz", v: 1, m: 1, xp: 40, art: "shield", c: "#2be08a", done: true },
  { id: "q3", t: "Win a PvP duel", v: 0, m: 1, xp: 75, art: "trophy", c: "#ff4d6a", done: false },
  { id: "q4", t: "Open the daily chest", v: 0, m: 1, xp: 30, art: "chest", c: "#9b6bff", done: false },
  { id: "q5", t: "Learn 5 new terms", v: 5, m: 5, xp: 25, art: "star", c: "#38e1ff", done: true },
];

function QuestBoard() {
  const [qs, setQs] = useState(QS);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [conf, setConf] = useState(0);
  const [resetIn, setResetIn] = useState(5 * 3600 + 41 * 60);
  useEffect(() => {
    const id = setInterval(() => setResetIn((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const bump = (id: string) => {
    setQs((list) => list.map((q) => {
      if (q.id !== id || q.v >= q.m) return q;
      const v = q.v + 1;
      if (v >= q.m) sfx("correct");
      else sfx("pop", false);
      return { ...q, v, done: v >= q.m };
    }));
  };
  const claim = (id: string) => {
    setClaimed((c) => [...c, id]);
    setConf((x) => x + 1);
    sfx("chest");
  };
  const done = qs.filter((q) => q.done).length;
  return (
    <div className="relative space-y-2">
      <Confetti fire={conf} count={50} />
      <div className="flex items-center gap-2">
        <span className="font-[family-name:var(--font-display)] text-[15px] font-bold text-white">Daily Quests</span>
        <span className="font-mono text-[10px] font-black text-ink-400">{done}/{qs.length}</span>
        <span className="ml-auto flex items-center gap-1 font-mono text-[10px] font-black text-gold"><Icon name="clock" size={12} /> {fmtClock(resetIn)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#0a1122]">
        <motion.div animate={{ width: `${(done / qs.length) * 100}%` }} className="h-full rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent-glow)" }} />
      </div>
      {qs.map((q) => {
        const A = ART[q.art];
        const isClaimed = claimed.includes(q.id);
        return (
          <motion.div key={q.id} layout className={cn("flex items-center gap-2.5 rounded-2xl border-2 p-2.5", q.done && !isClaimed ? "border-bull/60" : "border-[#1c2c52]")} style={{ background: q.done && !isClaimed ? "rgba(43,224,138,.07)" : "#0d1528", boxShadow: "0 3px 0 #070d1c" }}>
            <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${q.c}1c` }}>
              <A size={30} />
              {q.done && !isClaimed && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-bull" style={{ boxShadow: "0 0 8px #2be08a" }} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-extrabold text-white">{q.t}</span>
                <span className="flex items-center gap-0.5 font-mono text-[9px] font-black text-gold"><BoltArt size={10} />+{q.xp}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#0a1122]">
                  <motion.div animate={{ width: `${(q.v / q.m) * 100}%` }} className="h-full rounded-full" style={{ background: q.done ? "#2be08a" : q.c }} />
                </div>
                <span className="tnum font-mono text-[9px] font-black text-ink-400">{q.v}/{q.m}</span>
              </div>
            </div>
            {isClaimed ? (
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-bull/15 text-bull"><Icon name="check" size={16} strokeWidth={3.5} /></span>
            ) : q.done ? (
              <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={() => claim(q.id)} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="rounded-xl px-3 py-2 font-mono text-[10px] font-black uppercase text-[#02150b]" style={{ background: "#2be08a", boxShadow: "0 3px 0 #0f7048" }}>
                Claim
              </motion.button>
            ) : (
              <button type="button" onClick={() => bump(q.id)} className="rounded-xl border-2 border-[#22355e] bg-[#101a33] px-2.5 py-2 font-mono text-[10px] font-black uppercase text-ink-300" style={{ boxShadow: "0 3px 0 #0a1328" }}>
                +1
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- habit tracker ---------------- */
const HABITS = [
  { t: "Review mistakes", d: [1, 1, 1, 1, 0, 1, 1] },
  { t: "Paper trade 1 setup", d: [1, 1, 0, 1, 1, 0, 1] },
  { t: "Read 1 glossary term", d: [1, 1, 1, 1, 1, 1, 1] },
  { t: "No revenge trades", d: [1, 0, 1, 1, 1, 1, 0] },
];
function Habits() {
  const [grid, setGrid] = useState(HABITS.map((h) => [...h.d]));
  const toggle = (r: number, c: number) => {
    setGrid((g) => {
      const n = g.map((row) => [...row]);
      n[r][c] = n[r][c] ? 0 : 1;
      return n;
    });
    sfx("pop", false);
  };
  return (
    <div className="space-y-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">this week · tap to toggle</div>
      {HABITS.map((h, r) => {
        const pct = Math.round((grid[r].filter(Boolean).length / 7) * 100);
        return (
          <div key={h.t} className="rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] font-bold text-ink-200">{h.t}</span>
              <span className={cn("tnum font-mono text-[10px] font-black", pct === 100 ? "text-bull" : pct >= 60 ? "text-gold" : "text-ink-400")}>{pct}%</span>
            </div>
            <div className="flex gap-1.5">
              {grid[r].map((v, c) => (
                <motion.button
                  key={c}
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggle(r, c)}
                  animate={v ? {} : {}}
                  className="h-9 flex-1 rounded-lg border-2"
                  style={{
                    borderColor: v ? "#2be08a" : "#1c2c52",
                    background: v ? "linear-gradient(180deg, #1d5c3f, #0e2e20)" : "#0a1122",
                    boxShadow: v ? "0 0 12px -4px #2be08a" : "inset 0 2px 4px rgba(0,0,0,.5)",
                  }}
                >
                  {v ? <Icon name="check" size={13} strokeWidth={4} className="mx-auto text-bull" /> : <span className="font-mono text-[8px] text-[#3d4d73]">{["M", "T", "W", "T", "F", "S", "S"][c]}</span>}
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- focus timer ---------------- */
function FocusTimer() {
  const MODES = [
    { l: "Sprint", m: 5 },
    { l: "Deep", m: 25 },
    { l: "Marathon", m: 50 },
  ];
  const [mode, setMode] = useState(1);
  const [left, setLeft] = useState(MODES[1].m * 60);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(0);
  const [conf, setConf] = useState(0);
  const total = MODES[mode].m * 60;
  useEffect(() => {
    setLeft(MODES[mode].m * 60);
    setRun(false);
  }, [mode]);
  useEffect(() => {
    if (!run) return;
    if (left <= 0) {
      setRun(false);
      setDone((d) => d + 1);
      setConf((c) => c + 1);
      sfx("levelup");
      return;
    }
    const id = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [run, left]);
  const pct = left / total;
  const R = 62;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative flex flex-col items-center gap-3 py-2">
      <Confetti fire={conf} count={70} />
      <div className="flex gap-1 rounded-xl bg-[#070d1c] p-1">
        {MODES.map((m, i) => (
          <button key={m.l} type="button" onClick={() => { setMode(i); sfx("select"); }} className={cn("rounded-lg px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider", mode === i ? "text-[#02150b]" : "text-ink-500")} style={mode === i ? { background: "#2be08a" } : undefined}>
            {m.l} {m.m}m
          </button>
        ))}
      </div>
      <div className="relative">
        <svg viewBox="0 0 160 160" className="w-[190px]">
          <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(120,160,240,.1)" strokeWidth="12" />
          <motion.circle cx="80" cy="80" r={R} fill="none" stroke={run ? "#2be08a" : "#38537f"} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - pct) }} transform="rotate(-90 80 80)" style={{ filter: run ? "drop-shadow(0 0 10px #2be08a)" : undefined }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <Pop value={fmtClock(left)} className="tnum font-mono text-[30px] font-black text-white" />
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-ink-500">{run ? "focusing…" : "paused"}</div>
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <GameButton size="md" tone={run ? "ghost" : "bull"} onClick={() => { setRun(!run); sfx(run ? "pop" : "go"); }}>
          {run ? "Pause" : left < total ? "Resume" : "Start"}
        </GameButton>
        <GameButton size="md" tone="ghost" onClick={() => { setLeft(total); setRun(false); }} className="!w-[90px]">Reset</GameButton>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="grid h-8 w-8 place-items-center rounded-full" style={{ background: i < done ? "linear-gradient(180deg,#ffe08a,#c7801a)" : "#1a2745", boxShadow: i < done ? "0 0 12px rgba(255,194,75,.6)" : "0 2px 0 #0a1122" }}>
            {i < done ? <Icon name="check" size={13} strokeWidth={4} className="text-[#2a1a02]" /> : <span className="font-mono text-[9px] text-[#3d4d73]">{i + 1}</span>}
          </span>
        ))}
        <span className="ml-1 self-center font-mono text-[9px] text-ink-500">sessions today</span>
      </div>
    </div>
  );
}

/* ---------------- weekly report ---------------- */
function WeeklyReport() {
  const days = [
    { d: "M", xp: 120, t: 34 },
    { d: "T", xp: 85, t: 22 },
    { d: "W", xp: 140, t: 41 },
    { d: "T", xp: 60, t: 15 },
    { d: "F", xp: 175, t: 48 },
    { d: "S", xp: 220, t: 55 },
    { d: "S", xp: 95, t: 26 },
  ];
  const [metric, setMetric] = useState<"xp" | "t">("xp");
  const max = Math.max(...days.map((d) => d[metric]));
  const total = days.reduce((s, d) => s + d[metric], 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div>
          <div className="font-[family-name:var(--font-display)] text-[16px] font-bold text-white">Your week</div>
          <div className="font-mono text-[9px] text-ink-500">Sep 7 – Sep 13 · <span className="font-black text-bull">▲ 18% vs last week</span></div>
        </div>
        <div className="ml-auto flex gap-1 rounded-lg bg-[#070d1c] p-1">
          {(["xp", "t"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMetric(m)} className={cn("rounded-md px-2.5 py-1 font-mono text-[9px] font-black uppercase", metric === m ? "bg-white/10 text-white" : "text-ink-500")}>{m === "xp" ? "XP" : "min"}</button>
          ))}
        </div>
      </div>
      <div className="flex h-[150px] items-end gap-2 rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] p-3">
        {days.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="tnum font-mono text-[8.5px] font-black text-ink-300">{d[metric]}</span>
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(d[metric] / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 18 }}
              className="w-full rounded-t-lg"
              style={{ background: i === 5 ? "linear-gradient(180deg,#ffe08a,#c7801a)" : "linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 40%, #000))", boxShadow: i === 5 ? "0 0 14px rgba(255,194,75,.5)" : undefined, minHeight: 6 }}
            />
            <span className={cn("font-mono text-[9px] font-black", i === 5 ? "text-gold" : "text-ink-500")}>{d.d}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Total XP", v: "895", c: "#ffc24b" },
          { l: "Time", v: "4h 01m", c: "#38e1ff" },
          { l: "Accuracy", v: "87%", c: "#2be08a" },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border-2 border-[#1c2c52] bg-[#0d1528] py-2">
            <div className="tnum font-mono text-[14px] font-black" style={{ color: s.c }}>{s.v}</div>
            <div className="font-mono text-[7.5px] uppercase tracking-widest text-ink-500">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="font-mono text-[9px] text-ink-500">total {metric === "xp" ? `${total} XP` : `${total} min`} · best day Saturday 🏆</div>
    </div>
  );
}

/* ---------------- rescue offer ---------------- */
function Rescue() {
  const [hearts, setHearts] = useState(1);
  const [gems, setGems] = useState(340);
  const refill = () => {
    if (gems < 350) {
      sfx("wrong");
      return;
    }
    setGems((g) => g - 350);
    setHearts(5);
    sfx("chest");
  };
  return (
    <div className="space-y-3 rounded-3xl border-2 border-bear/40 bg-[#1c0812] p-4">
      <div className="flex items-center gap-2">
        <HeartArt size={40} broken={hearts <= 1} />
        <div>
          <div className="font-[family-name:var(--font-display)] text-[17px] font-bold text-white">Running on empty?</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-400">{hearts} {hearts === 1 ? "heart" : "hearts"} left</div>
        </div>
        <HudPill><GemArt size={16} /><Pop value={gems} className="text-aqua" /></HudPill>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.button key={i} type="button" whileTap={{ scale: 0.85 }} onClick={() => { setHearts(i + 1); sfx("pop", false); }} className="flex-1">
            <HeartArt size={34} broken={false} className="mx-auto" />
            <span className={cn("mx-auto -mt-6 block h-[34px] w-[34px] rounded-full", i < hearts ? "" : "bg-[#0a1226]/80")} />
          </motion.button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border-2 border-[#22355e] bg-[#101a33] p-3 text-center">
          <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">refill · 350</div>
          <div className="my-1 flex justify-center gap-0.5">{[0, 1, 2, 3, 4].map((i) => <HeartArt key={i} size={16} />)}</div>
          <GameButton size="md" tone={gems >= 350 ? "bear" : "ghost"} onClick={refill}>Refill</GameButton>
        </div>
        <div className="rounded-2xl border-2 border-violet/50 bg-violet/5 p-3 text-center">
          <div className="font-mono text-[8px] uppercase tracking-widest text-violet">max · trial</div>
          <div className="my-1 font-[family-name:var(--font-display)] text-[15px] font-bold text-white">Unlimited ∞</div>
          <GameButton size="md" tone="violet" onClick={() => sfx("unlock")}>Try free</GameButton>
        </div>
      </div>
      <button type="button" onClick={() => { setGems((g) => g + 500); sfx("coin"); }} className="w-full font-mono text-[9px] uppercase tracking-widest text-ink-500 hover:text-white">+500 demo gems</button>
    </div>
  );
}

/* ---------------- xp forecast ---------------- */
function Forecast() {
  const [perDay, setPerDay] = useState(60);
  const target = 5000;
  const have = 1840;
  const days = Math.ceil((target - have) / Math.max(1, perDay));
  const date = new Date(Date.now() + days * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink-500">level 10 forecast</div>
        <Pop value={`${days}`} className="tnum font-mono text-[44px] font-black leading-none text-white" />
        <div className="font-mono text-[10px] text-ink-400">days to go · <span className="font-black text-bull">{date}</span></div>
      </div>
      <div>
        <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wider"><span className="text-ink-400">XP per day</span><span className="tnum font-bold text-white">{perDay}</span></div>
        <input type="range" min={10} max={200} value={perDay} onChange={(e) => setPerDay(+e.target.value)} className="w-full" />
      </div>
      <div className="relative h-4 overflow-hidden rounded-full bg-[#0a1122]">
        <motion.div animate={{ width: `${(have / target) * 100}%` }} className="absolute inset-y-0 left-0 rounded-full" style={{ background: "var(--accent)" }} />
        <span className="absolute inset-0 grid place-items-center font-mono text-[8px] font-black text-white">{have.toLocaleString()} / {target.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-bull/10 p-2.5 text-[11px] font-bold text-bull">
        <ChestArt size={26} /> Hit 100/day to finish 12 days earlier!
      </div>
    </div>
  );
}

export default function DailyOps() {
  return (
    <Section id="daily" index="" title="Daily Ops" kicker="Retention command center" count="7 systems">
      <Grid>
        <Cell title="Month Streak Map" spec="30 days · freeze" span="col-span-2 md:col-span-2 lg:col-span-2">
          <MonthMap />
        </Cell>
        <Cell title="Quest Board" spec="live reset timer" span="col-span-2 md:col-span-2 lg:col-span-2">
          <QuestBoard />
        </Cell>
        <Cell title="Focus Timer" spec="pomodoro · sessions" span="col-span-2 md:col-span-2 lg:col-span-2">
          <FocusTimer />
        </Cell>
        <Cell title="Habit Tracker" spec="4 habits × 7d" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Habits />
        </Cell>
        <Cell title="Weekly Report" spec="animated bars" span="col-span-2 md:col-span-2 lg:col-span-2">
          <WeeklyReport />
        </Cell>
        <Cell title="Heart Rescue" spec="monetization" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Rescue />
        </Cell>
        <Cell title="Level Forecast" spec="what-if slider" span="col-span-2 md:col-span-6 lg:col-span-6">
          <div className="mx-auto max-w-[520px]"><Forecast /></div>
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="bear">streak defense</Tag>
        <Tag tone="accent">habit loops</Tag>
        <Tag tone="gold">forecast motivation</Tag>
        <Tag tone="violet">focus sessions</Tag>
      </div>
    </Section>
  );
}
