import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { Device, StatusBar, GameButton } from "./Device";
import { Mascot, Bubble, type Mood } from "./Mascot";
import { ART, type ArtKey, BoltArt, FlameArt } from "./art";
import { sfx, Confetti, Rays } from "./Juice";

const GOALS: { a: ArtKey; t: string }[] = [
  { a: "gem", t: "Understand crypto" },
  { a: "shield", t: "Trade without losing my shirt" },
  { a: "rocket", t: "Grow my portfolio" },
  { a: "trophy", t: "Go pro / career" },
  { a: "star", t: "Just curious" },
];
const LEVELS = [
  { b: 1, t: "I'm new to crypto" },
  { b: 2, t: "I know what Bitcoin is" },
  { b: 3, t: "I've made a few trades" },
  { b: 4, t: "I trade every week" },
];
const DAILY = [
  { m: 5, l: "Casual", xp: 10 },
  { m: 10, l: "Regular", xp: 20 },
  { m: 15, l: "Serious", xp: 30 },
  { m: 20, l: "Intense", xp: 50 },
];

const SAY = [
  "Hi there! I'm Toro.",
  "Why do you want to learn trading?",
  "How much do you know about crypto?",
  "What's your daily learning goal?",
  "I'll remind you so your streak survives!",
  "Your personal plan is ready!",
];

function Choice({ sel, onClick, children, className }: { sel: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ y: 3 }}
      className={cn("flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition-colors", className)}
      style={{
        borderColor: sel ? "var(--accent)" : "#22355e",
        background: sel ? "color-mix(in srgb, var(--accent) 14%, #111c36)" : "#111c36",
        boxShadow: `0 4px 0 ${sel ? "var(--accent-edge)" : "#0a1328"}`,
        color: sel ? "var(--accent)" : "#dbe5ff",
      }}
    >
      {children}
    </motion.button>
  );
}

function Flow({ onStep }: { onStep: (n: number) => void }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<number | null>(null);
  const [lvl, setLvl] = useState<number | null>(null);
  const [daily, setDaily] = useState<number | null>(1);
  const [notif, setNotif] = useState<"ask" | "yes" | "no">("ask");
  const [conf, setConf] = useState(0);
  const [dir, setDir] = useState(1);

  const canNext = step === 0 || (step === 1 && goal !== null) || (step === 2 && lvl !== null) || (step === 3 && daily !== null) || (step === 4 && notif !== "ask") || step === 5;

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    onStep(n);
    sfx(n > step ? "whoosh" : "select", false);
    if (n === 5) {
      setConf((c) => c + 1);
      setTimeout(() => sfx("levelup"), 200);
    }
  };

  const mood: Mood = step === 0 ? "wave" : step === 5 ? "celebrate" : step === 4 && notif === "yes" ? "happy" : canNext ? "happy" : "idle";

  return (
    <div className="relative flex h-full flex-col">
      <Confetti fire={conf} />
      <StatusBar />
      {step > 0 && step < 5 && (
        <div className="flex items-center gap-3 px-4 pb-3">
          <button type="button" onClick={() => go(step - 1)} className="text-ink-500 hover:text-white" aria-label="Back">
            <Icon name="chevronLeft" size={26} strokeWidth={2.6} />
          </button>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#16223f]" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.6)" }}>
            <motion.div animate={{ width: `${(step / 4) * 100}%` }} transition={{ type: "spring", stiffness: 140, damping: 18 }} className="relative h-full rounded-full" style={{ background: "var(--accent)" }}>
              <span className="absolute inset-x-2 top-[3px] h-1 rounded-full bg-white/40" />
            </motion.div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          initial={{ opacity: 0, x: 60 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 * dir }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="relative flex flex-1 flex-col px-5"
        >
          {step === 0 && (
            <div className="relative flex flex-1 flex-col items-center justify-center text-center">
              <Rays color="rgba(120,160,255,.12)" size="160%" className="top-[40%]" />
              <Bubble text={SAY[0]} side="bottom" className="relative mb-2" />
              <Mascot mood={mood} size={200} className="relative" />
              <h3 className="relative mt-3 font-[family-name:var(--font-display)] text-[30px] font-bold leading-tight text-white">
                Learn to trade.
                <br />
                <span style={{ color: "var(--accent)" }}>Without the losses.</span>
              </h3>
              <p className="relative mt-2 text-[13px] text-ink-400">5 minutes a day. Simulated markets. Real skills.</p>
            </div>
          )}

          {step > 0 && step < 5 && (
            <div className="mb-4 flex items-center gap-2">
              <Mascot mood={mood} size={78} />
              <Bubble text={SAY[step]} className="flex-1 text-[13px]" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2.5">
              {GOALS.map((g, i) => {
                const A = ART[g.a];
                return (
                  <Choice key={g.t} sel={goal === i} onClick={() => { setGoal(i); sfx("select"); }}>
                    <A size={34} />
                    <span className="text-[14px] font-bold">{g.t}</span>
                  </Choice>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2.5">
              {LEVELS.map((l, i) => (
                <Choice key={l.t} sel={lvl === i} onClick={() => { setLvl(i); sfx("select"); }}>
                  <span className="flex h-8 items-end gap-[3px]">
                    {[1, 2, 3, 4].map((b) => (
                      <span key={b} className="w-[6px] rounded-sm" style={{ height: 6 + b * 6, background: b <= l.b ? (lvl === i ? "var(--accent)" : "#38e1ff") : "#22355e" }} />
                    ))}
                  </span>
                  <span className="text-[14px] font-bold">{l.t}</span>
                </Choice>
              ))}
              <div className="pt-1 text-center font-mono text-[10px] uppercase tracking-widest text-ink-500">or take a 2-min placement test</div>
            </div>
          )}

          {step === 3 && (
            <div className="overflow-hidden rounded-2xl border-2 border-[#22355e]" style={{ boxShadow: "0 4px 0 #0a1328" }}>
              {DAILY.map((d, i) => (
                <button
                  key={d.l}
                  type="button"
                  onClick={() => { setDaily(i); sfx("select"); }}
                  className={cn("flex w-full items-center justify-between px-4 py-4 text-left transition-colors", i > 0 && "border-t-2 border-[#22355e]")}
                  style={{ background: daily === i ? "color-mix(in srgb, var(--accent) 14%, #111c36)" : "#111c36", color: daily === i ? "var(--accent)" : "#dbe5ff" }}
                >
                  <span className="text-[15px] font-bold">{d.m} min / day</span>
                  <span className="flex items-center gap-1 font-mono text-[12px] font-black opacity-80">
                    {d.l} <BoltArt size={14} /> {d.xp}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="relative flex flex-1 flex-col items-center pt-4">
              <motion.div animate={{ rotate: [0, -14, 14, -10, 10, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}>
                <FlameArt size={96} />
              </motion.div>
              <AnimatePresence>
                {notif === "ask" && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mt-4 w-[270px] overflow-hidden rounded-2xl bg-[#1e2436]/95 text-center backdrop-blur" style={{ boxShadow: "0 20px 40px -10px #000" }}>
                    <div className="px-4 pb-3 pt-4">
                      <div className="text-[14px] font-bold text-white">"Tradelingo" Would Like to Send You Notifications</div>
                      <div className="mt-1 text-[11px] text-[#aab3c8]">Streak reminders, price alerts and league updates.</div>
                    </div>
                    <div className="grid grid-cols-2 border-t border-white/10 text-[15px]">
                      <button type="button" onClick={() => { setNotif("no"); sfx("pop"); }} className="border-r border-white/10 py-3 text-[#6aa8ff]">
                        Don't Allow
                      </button>
                      <button type="button" onClick={() => { setNotif("yes"); sfx("correct"); }} className="py-3 font-bold text-[#6aa8ff]">
                        Allow
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {notif !== "ask" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 text-center">
                  <div className={cn("font-[family-name:var(--font-display)] text-[20px] font-bold", notif === "yes" ? "text-bull" : "text-ink-300")}>{notif === "yes" ? "Reminders on!" : "No worries"}</div>
                  <div className="text-[12px] text-ink-400">{notif === "yes" ? "We'll nudge you at 7:30 pm." : "You can turn them on in settings."}</div>
                </motion.div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="relative flex flex-1 flex-col items-center text-center">
              <Rays />
              <Mascot mood="celebrate" size={150} className="relative" />
              <h3 className="relative font-[family-name:var(--font-display)] text-[26px] font-bold text-white">Your plan is ready</h3>
              <div className="relative mt-3 w-full rounded-2xl border-2 border-[#22355e] bg-[#101a33] p-3 text-left" style={{ boxShadow: "0 4px 0 #0a1328" }}>
                <div className="font-mono text-[9px] font-black uppercase tracking-widest text-ink-500">in 30 days you'll know</div>
                <svg viewBox="0 0 260 80" className="mt-1 h-[80px] w-full">
                  <defs>
                    <linearGradient id="obg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="var(--accent)" stopOpacity=".4" />
                      <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 75 C 60 70 100 50 150 34 S 230 8 260 4 V80 H0 Z" fill="url(#obg)" />
                  <motion.path d="M0 75 C 60 70 100 50 150 34 S 230 8 260 4" fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.3 }} />
                  {[
                    [40, 71, "Candles"],
                    [130, 40, "Risk"],
                    [240, 6, "Strategy"],
                  ].map(([x, y, l], i) => (
                    <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.35 }}>
                      <circle cx={Number(x)} cy={Number(y)} r="5" fill="#fff" stroke="var(--accent)" strokeWidth="3" />
                      <text x={Number(x)} y={Number(y) + (i === 2 ? 20 : -10)} textAnchor="middle" fontSize="9" fontWeight="800" fill="#dbe5ff">
                        {l}
                      </text>
                    </motion.g>
                  ))}
                </svg>
              </div>
              <div className="relative mt-3 grid w-full grid-cols-3 gap-2 text-center">
                {[
                  ["Goal", goal !== null ? GOALS[goal].t.split(" ")[0] : "—"],
                  ["Level", lvl !== null ? `L${lvl + 1}` : "—"],
                  ["Daily", daily !== null ? `${DAILY[daily].m}m` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-[#0d1528] py-2">
                    <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">{k}</div>
                    <div className="text-[13px] font-extrabold text-white">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="px-5 pb-10 pt-4">
        {step === 0 ? (
          <div className="space-y-3">
            <GameButton onClick={() => go(1)}>Get started</GameButton>
            <GameButton tone="ghost" onClick={() => sfx("select")}>
              I already have an account
            </GameButton>
          </div>
        ) : step === 5 ? (
          <GameButton onClick={() => { go(0); setGoal(null); setLvl(null); setNotif("ask"); }}>Start learning</GameButton>
        ) : (
          <GameButton disabled={!canNext} onClick={() => go(step + 1)}>
            Continue
          </GameButton>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const steps = ["Welcome", "Motivation", "Experience", "Daily goal", "Permissions", "Plan reveal"];
  return (
    <Section id="onboarding" index="" title="Onboarding" kicker="First 60 seconds · personalised" count="6 steps">
      <Grid>
        <Cell title="Onboarding Flow · Live Device" spec="personalisation" span="col-span-2 md:col-span-4 lg:col-span-4">
          <div className="grid items-start gap-6 lg:grid-cols-[auto_1fr]">
            <Device>
              <Flow onStep={setStep} />
            </Device>
            <div className="space-y-2">
              {steps.map((s, i) => (
                <motion.div
                  key={s}
                  animate={{ x: step === i ? 6 : 0 }}
                  className="flex items-center gap-3 rounded-2xl border-2 p-3"
                  style={{ borderColor: step === i ? "var(--accent)" : "#1c2c52", background: step === i ? "color-mix(in srgb, var(--accent) 10%, #0d1528)" : "#0d1528", boxShadow: "0 3px 0 #070d1c" }}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full font-mono text-[12px] font-black" style={{ background: i < step ? "#2be08a" : step === i ? "var(--accent)" : "#1a2745", color: i <= step ? "#051510" : "#5f6f96" }}>
                    {i < step ? <Icon name="check" size={14} strokeWidth={4} /> : i + 1}
                  </span>
                  <div>
                    <div className="text-[13px] font-extrabold text-white">{s}</div>
                    <div className="text-[10.5px] text-ink-400">{SAY[i]}</div>
                  </div>
                </motion.div>
              ))}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <Tag tone="accent">mascot-led copy</Tag>
                <Tag>value before sign-up</Tag>
                <Tag tone="gold">commitment ladder</Tag>
              </div>
            </div>
          </div>
        </Cell>
        <Cell title="Psychology Principles" spec="why it converts" span="col-span-2 md:col-span-4 lg:col-span-2">
          <div className="space-y-2.5">
            {[
              ["Endowed progress", "Progress bar starts moving on the very first tap", "#2be08a"],
              ["Self-selected goals", "Users pick their own reason — ownership raises retention", "#38e1ff"],
              ["Micro-commitment", "Daily goal is a tiny, specific promise", "#ffc24b"],
              ["Pre-permission", "Explain value before the OS dialog appears", "#9b6bff"],
              ["Payoff reveal", "Personalised curve makes the plan feel earned", "#ff4d6a"],
            ].map(([t, d, c], i) => (
              <motion.div key={t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-2xl border-2 p-3" style={{ borderColor: `${c}44`, background: `linear-gradient(100deg, ${c}14, #0b1224 70%)` }}>
                <div className="text-[13px] font-extrabold" style={{ color: c }}>
                  {t}
                </div>
                <div className="text-[11px] text-ink-400">{d}</div>
              </motion.div>
            ))}
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
