import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { Check, Heart, Lock, Trophy } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { C, centerIn, useTimers } from "./util";

/* ═════════════ 17 · COACH MARKS ═════════════ */
const STEPS = [
  { k: "balance", t: "Practice balance", d: "Simulated funds. Losses here are lessons, not money." },
  { k: "chart", t: "The decision point", d: "Everything right of t0 is sealed on the server until you commit." },
  { k: "evidence", t: "Evidence cards", d: "Collect at least three before you form a thesis." },
  { k: "lock", t: "Lock your call", d: "Hold to commit. No edits after lock — just like real markets." },
];

function TypeText({ text }: { text: string }) {
  const fx = useFx();
  const [n, setN] = useState(fx.reduced ? text.length : 0);
  useEffect(() => {
    if (fx.reduced) return;
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, 16 / fx.speed);
    return () => clearInterval(id);
  }, [text, fx.reduced, fx.speed]);
  return (
    <>
      {text.slice(0, n)}
      <span className="opacity-0">{text.slice(n)}</span>
    </>
  );
}

export function CoachMarks() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const targets = useRef<Record<string, HTMLElement | null>>({});
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [rect, setRect] = useState({ x: 16, y: 16, w: 100, h: 60 });
  const [H, setH] = useState(588);

  useLayoutEffect(() => {
    const r0 = root.current;
    const el = targets.current[STEPS[step].k];
    if (!r0 || !el) return;
    const r = r0.getBoundingClientRect();
    const k = r0.offsetWidth / r.width || 1;
    const e = el.getBoundingClientRect();
    setRect({ x: (e.left - r.left) * k - 6, y: (e.top - r.top) * k - 6, w: e.width * k + 12, h: e.height * k + 12 });
    setH(r0.offsetHeight);
  }, [step, done]);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      fx.sfx("whoosh");
      fx.haptic(6);
    } else {
      setDone(true);
      fx.sfx("win");
      fx.haptic([20, 30, 60]);
    }
  };

  const spring = fx.reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 28 };
  const below = rect.y + rect.h + 160 < H;
  const tipTop = below ? rect.y + rect.h + 14 : rect.y - 14 - 146;
  const arrowLeft = Math.max(20, Math.min(230, rect.x + rect.w / 2 - 16 - 7));
  const reg = (k: string) => (el: HTMLElement | null) => {
    targets.current[k] = el;
  };

  return (
    <div ref={root} className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-4 pb-5 pt-2">
        <div ref={reg("balance")} className="rounded-2xl bg-white/[.04] p-4">
          <div className="text-[11px] text-white/45">Practice balance</div>
          <div className="tnum mt-1 text-[28px] font-semibold">10,000.00 <span className="text-[14px] text-white/40">USDT</span></div>
          <div className="font-mono text-[11px] text-[#22e58b]">▲ 2.4% this week</div>
        </div>
        <div ref={reg("chart")} className="mt-3 rounded-2xl bg-white/[.03] p-3">
          <svg viewBox="0 0 250 110" className="w-full">
            {[20, 35, 28, 50, 44, 60, 55, 70, 62].map((v, i) => (
              <rect key={i} x={i * 16 + 4} y={100 - v} width={9} height={Math.max(8, (i % 3) * 8 + 10)} rx={1.5} fill={i % 3 === 1 ? C.bear : C.bull} />
            ))}
            <line x1={150} x2={150} y1={0} y2={110} stroke="rgba(255,255,255,.35)" strokeDasharray="3 3" />
            <rect x={152} y={0} width={98} height={110} fill="rgba(255,255,255,.05)" rx={6} />
            <text x={201} y={60} textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="10" fontFamily="JetBrains Mono">SEALED</text>
          </svg>
        </div>
        <div ref={reg("evidence")} className="mt-3 flex gap-2">
          {["On-chain", "Funding", "Structure"].map((t) => (
            <span key={t} className="flex-1 rounded-xl bg-white/[.05] py-3 text-center text-[11.5px] text-white/70">{t}</span>
          ))}
        </div>
        <div className="flex-1" />
        <button ref={reg("lock")} className="h-14 rounded-2xl bg-[#c8ff00] font-semibold text-[#0b0b0d]">Hold to lock</button>
      </div>

      <AnimatePresence>
        {!done && (
          <motion.div className="absolute inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: fx.t(0.3) }}>
            <div className="absolute inset-0" onClick={next} />
            <motion.div
              className="pointer-events-none absolute rounded-[18px]"
              initial={false}
              animate={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
              transition={spring}
              style={{ boxShadow: "0 0 0 2px #c8ff00, 0 0 0 9999px rgba(5,5,8,.8)" }}
            >
              {!fx.reduced && (
                <motion.div
                  className="absolute inset-0 rounded-[18px] border-2 border-[#c8ff00]"
                  animate={{ scale: [1, 1.08], opacity: [0.8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </motion.div>

            <motion.div className="absolute inset-x-4 z-10" initial={false} animate={{ top: tipTop }} transition={spring}>
              <div className="relative rounded-2xl bg-[#f2efe6] p-4 text-[#0b0b0d] shadow-2xl">
                <div
                  className="absolute h-3.5 w-3.5 rotate-45 bg-[#f2efe6]"
                  style={below ? { top: -7, left: arrowLeft } : { bottom: -7, left: arrowLeft }}
                />
                <div className="flex items-center justify-between font-mono text-[10px] font-bold text-black/50">
                  <span>STEP {step + 1} / {STEPS.length}</span>
                  <button onClick={() => { setDone(true); fx.sfx("tick"); }} className="underline-offset-2 hover:underline">Skip</button>
                </div>
                <div className="mt-1 text-[16px] font-bold">{STEPS[step].t}</div>
                <p className="mt-1 min-h-[36px] text-[12.5px] leading-snug text-black/70">
                  <TypeText key={step} text={STEPS[step].d} />
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {STEPS.map((_, k) => (
                      <motion.span key={k} className="h-1.5 rounded-full" animate={{ width: k === step ? 18 : 6, background: k <= step ? C.ink : "rgba(0,0,0,.2)" }} />
                    ))}
                  </div>
                  <button onClick={next} className="h-9 rounded-xl bg-[#0b0b0d] px-4 text-[12.5px] font-semibold text-[#f2efe6] active:scale-95">
                    {step === STEPS.length - 1 ? "Let's trade" : "Next"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && (
          <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-4 top-3 z-20 flex items-center justify-between rounded-2xl bg-[#c8ff00] px-4 py-3 text-[#0b0b0d]">
            <span className="flex items-center gap-2 text-[13px] font-semibold"><Check size={16} strokeWidth={3} /> Tour complete</span>
            <button onClick={() => { setStep(0); setDone(false); }} className="font-mono text-[11px] font-bold underline-offset-2 hover:underline">Replay</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═════════════ 22 · ACADEMY PATH ═════════════ */
const LESSONS = ["What is a candle", "Support & resistance", "Funding rates", "Leverage math", "Liquidations", "Invalidation first", "Boss: Conflict"];
type Flight = { id: number; sx: number; sy: number; ex: number; ey: number; d: number; bend: number };

export function AcademyPath() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const xpEl = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [done, setDone] = useState(2);
  const [xp, setXp] = useState(120);
  const [bump, setBump] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [busy, setBusy] = useState(false);
  const GAP = 94;
  const TOP = 64;
  const WIDTH = 286;
  const pos = LESSONS.map((_, i) => ({ x: WIDTH / 2 + Math.sin(i * 1.15) * 70, y: TOP + i * GAP }));
  const pathD = pos
    .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `C${pos[i - 1].x},${pos[i - 1].y + GAP / 2} ${p.x},${p.y - GAP / 2} ${p.x},${p.y}`))
    .join(" ");
  const finished = done >= LESSONS.length;

  useEffect(() => {
    scroller.current?.scrollTo({ top: Math.max(0, pos[done]?.y - 200 || 0) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const complete = () => {
    if (busy || finished) return;
    setBusy(true);
    fx.sfx("pop");
    fx.haptic(10);
    const el = nodes.current[done];
    if (root.current && el && xpEl.current) {
      const s = centerIn(root.current, el);
      const e = centerIn(root.current, xpEl.current);
      pr.current?.burst(s.x, s.y, { count: 45, colors: [C.iris, C.acid, "#fff"], speed: 6 });
      const base = Date.now();
      setFlights(Array.from({ length: 6 }, (_, k) => ({ id: base + k, sx: s.x, sy: s.y, ex: e.x, ey: e.y, d: k * 0.07, bend: (k - 2.5) * 26 })));
    }
    later(() => {
      const next = done + 1;
      setDone(next);
      setBusy(false);
      fx.sfx("win");
      fx.haptic([20, 30, 60]);
      if (scroller.current && next < LESSONS.length) scroller.current.scrollTo({ top: Math.max(0, pos[next].y - 200), behavior: fx.reduced ? "auto" : "smooth" });
    }, fx.ms(950));
  };

  return (
    <div ref={root} className="relative flex h-full flex-col">
      <div className="relative z-10 flex items-center justify-between border-b border-white/[.06] bg-[#0b0b0d] px-4 pb-3 pt-2">
        <div>
          <div className="font-mono text-[10px] text-white/40">ACADEMY · UNIT 3</div>
          <div className="text-[15px] font-semibold">Funding & Leverage</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[11px] text-[#ff3b5c]"><Heart size={13} fill="currentColor" /> 5</span>
          <motion.div
            ref={xpEl}
            key={bump}
            animate={bump && !fx.reduced ? { scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.25 }}
            className="tnum rounded-full bg-[#ffc83d]/15 px-2.5 py-1 font-mono text-[11px] font-bold text-[#ffc83d]"
          >
            ✦ {xp}
          </motion.div>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar relative flex-1 overflow-y-auto">
        <div className="relative" style={{ height: TOP + LESSONS.length * GAP + 40 }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${WIDTH} ${TOP + LESSONS.length * GAP + 40}`} preserveAspectRatio="xMidYMin meet">
            <path d={pathD} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={10} strokeLinecap="round" strokeDasharray="1 16" />
            <motion.path d={pathD} fill="none" stroke={C.acid} strokeWidth={6} strokeLinecap="round" initial={false} animate={{ pathLength: Math.min(1, done / (LESSONS.length - 1)) }} transition={{ duration: fx.t(0.8), ease: [0.6, 0, 0.2, 1] }} />
          </svg>

          {LESSONS.map((l, i) => {
            const state = i < done ? "done" : i === done ? "current" : "locked";
            const last = i === LESSONS.length - 1;
            const bg = state === "done" ? C.acid : state === "current" ? C.iris : C.raised;
            const shade = state === "done" ? "#7fa300" : state === "current" ? "#5143c9" : C.ink;
            return (
              <div key={l} className="absolute" style={{ left: `calc(50% + ${pos[i].x - WIDTH / 2}px - 32px)`, top: pos[i].y - 32 }}>
                {state === "current" && (
                  <>
                    {!fx.reduced && <motion.div className="absolute inset-0 rounded-full border-4 border-[#8b7bff]" animate={{ scale: [1, 1.5], opacity: [0.7, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />}
                    <motion.div
                      className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#f2efe6] px-2.5 py-1 font-mono text-[10px] font-bold text-[#0b0b0d]"
                      animate={fx.reduced ? {} : { y: [0, -4, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    >
                      START
                    </motion.div>
                  </>
                )}
                <motion.button
                  ref={(el) => {
                    nodes.current[i] = el;
                  }}
                  onClick={state === "current" ? complete : () => { fx.sfx("tick"); fx.haptic(4); }}
                  initial={false}
                  animate={{ scale: state === "locked" ? 0.9 : 1 }}
                  whileTap={state === "current" ? { y: 5, boxShadow: `0 1px 0 ${shade}` } : { scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  aria-label={`${l} — ${state}`}
                  className="relative grid h-16 w-16 place-items-center rounded-full"
                  style={{ background: bg, boxShadow: `0 6px 0 ${shade}` }}
                >
                  {state === "done" ? (
                    <Check size={26} strokeWidth={3.2} className="text-[#0b0b0d]" />
                  ) : state === "locked" ? (
                    last ? <Trophy size={22} className="text-white/30" /> : <Lock size={20} className="text-white/30" />
                  ) : last ? (
                    <Trophy size={24} className="text-white" />
                  ) : (
                    <span className="text-xl font-bold text-white">{i + 1}</span>
                  )}
                </motion.button>
                <div className={`absolute left-1/2 top-[74px] w-28 -translate-x-1/2 text-center text-[10.5px] leading-tight ${state === "locked" ? "text-white/25" : "text-white/60"}`}>{l}</div>
              </div>
            );
          })}
        </div>
      </div>

      {flights.map((f) => (
        <motion.div
          key={f.id}
          className="pointer-events-none absolute left-0 top-0 z-40 -ml-2.5 -mt-2.5 grid h-5 w-5 place-items-center rounded-full bg-[#ffc83d] text-[10px] font-bold text-[#0b0b0d] shadow-[0_0_12px_#ffc83d]"
          initial={{ x: f.sx, y: f.sy, scale: 0.4 }}
          animate={{ x: [f.sx, (f.sx + f.ex) / 2 + f.bend * 2.4, f.ex], y: [f.sy, Math.min(f.sy, f.ey) + (f.sy - f.ey) * 0.25 - 50, f.ey], scale: [0.4, 1.25, 0.6] }}
          transition={{ duration: fx.t(0.75) || 0.01, delay: fx.t(f.d), ease: "easeInOut" }}
          onAnimationComplete={() => {
            setFlights((fs) => fs.filter((x) => x.id !== f.id));
            setXp((v) => v + 5);
            setBump((b) => b + 1);
            fx.sfx("coin");
          }}
        >
          ✦
        </motion.div>
      ))}

      <AnimatePresence>
        {finished && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} className="absolute inset-x-3 bottom-4 z-30 rounded-3xl bg-[#c8ff00] p-5 text-center text-[#0b0b0d]">
            <div className="font-mono text-[10px] font-bold">UNIT COMPLETE</div>
            <div className="mt-1 text-2xl font-bold">Leverage tamer</div>
            <button onClick={() => { setDone(2); setXp(120); scroller.current?.scrollTo({ top: 0 }); }} className="mt-4 h-11 w-full rounded-xl bg-[#0b0b0d] text-sm font-semibold text-[#c8ff00]">Replay unit</button>
          </motion.div>
        )}
      </AnimatePresence>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 21 · VERSUS MATCH ═════════════ */
type Ph = "idle" | "search" | "found" | "count" | "go";
const BLIPS = [
  { a: 30, r: 70, c: C.bear },
  { a: 120, r: 92, c: C.gold },
  { a: 200, r: 55, c: C.bull },
  { a: 280, r: 85, c: "#5ac8fa" },
  { a: 330, r: 40, c: "#ff4fd8" },
];

function PlayerCard({ name, rank, wr, c, side }: { name: string; rank: string; wr: number; c: string; side: "l" | "r" }) {
  return (
    <div className={`flex items-center gap-3 ${side === "r" ? "flex-row-reverse text-right" : ""}`}>
      <div className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white/30" style={{ background: `linear-gradient(135deg, ${c}, ${c}44)` }} />
      <div>
        <div className="text-xl font-bold">{name}</div>
        <div className="font-mono text-[10px] opacity-70">{rank}</div>
        <div className="mt-1 font-mono text-[11px]">WR {wr}% · 🔥{Math.round(wr / 12)}</div>
      </div>
    </div>
  );
}

export function VersusMatch() {
  const fx = useFx();
  const [scope, anim] = useAnimate();
  const vs = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [ph, setPh] = useState<Ph>("idle");
  const [n, setN] = useState(3);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (ph !== "search") return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [ph]);

  const start = () => {
    setPh("search");
    setSecs(0);
    fx.sfx("whoosh");
    fx.haptic(10);
    later(() => {
      setPh("found");
      fx.sfx("lock");
      fx.haptic([40, 30, 100]);
      later(() => {
        if (!fx.reduced && scope.current) anim(scope.current, { x: [0, -10, 9, -6, 3, 0] }, { duration: 0.45 });
        if (scope.current && vs.current) {
          const c = centerIn(scope.current, vs.current);
          pr.current?.burst(c.x, c.y, { count: 100, shape: "spark", colors: [C.acid, "#fff", C.gold], speed: 12, gravity: 0, life: 40 });
        }
      }, fx.ms(420));
      later(() => {
        setPh("count");
        setN(3);
        [3, 2, 1].forEach((v, k) =>
          later(() => {
            setN(v);
            fx.sfx("tick");
            fx.haptic(15);
          }, fx.ms(k * 650))
        );
        later(() => {
          setPh("go");
          fx.sfx("win");
          fx.haptic([30, 30, 80]);
        }, fx.ms(3 * 650));
      }, fx.ms(1800));
    }, fx.ms(2600));
  };

  const matched = ph === "found" || ph === "count" || ph === "go";

  return (
    <div ref={scope} className="relative h-full overflow-hidden">
      {!matched && (
        <div className="flex h-full flex-col px-4 pb-5 pt-2">
          <div className="font-mono text-[10px] text-white/40">CHALLENGE FRIEND</div>
          <div className="text-2xl font-bold">Versus</div>
          <div className="relative flex flex-1 items-center justify-center">
            <div className="relative h-[230px] w-[230px]">
              {[1, 0.7, 0.4].map((s) => (
                <div key={s} className="absolute rounded-full border border-white/10" style={{ inset: `${((1 - s) / 2) * 100}%` }} />
              ))}
              {ph === "search" && !fx.reduced && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "conic-gradient(from 0deg, rgba(200,255,0,.35), transparent 70deg, transparent)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.6 / fx.speed, repeat: Infinity, ease: "linear" }}
                />
              )}
              {ph === "search" &&
                BLIPS.map((b, k) => (
                  <motion.div
                    key={k}
                    className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/40"
                    style={{
                      left: 115 + Math.sin((b.a * Math.PI) / 180) * b.r,
                      top: 115 - Math.cos((b.a * Math.PI) / 180) * b.r,
                      background: b.c,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.5] }}
                    transition={{ duration: 1.4, delay: 0.3 + k * 0.35, repeat: Infinity, repeatDelay: 1 }}
                  />
                ))}
              <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#c8ff00]" style={{ background: `linear-gradient(135deg, ${C.acid}, ${C.acid}33)` }} />
            </div>
          </div>
          <div className="text-center">
            {ph === "search" ? (
              <div className="tnum font-mono text-[13px] text-white/60">Finding an opponent… 0:0{Math.min(9, secs)}</div>
            ) : (
              <p className="mx-auto max-w-[240px] text-[13px] leading-snug text-white/45">Same scenario. Same evidence. Better process wins — not luck.</p>
            )}
          </div>
          <button
            onClick={ph === "idle" ? start : () => setPh("idle")}
            className={`mt-5 h-12 rounded-2xl font-semibold active:scale-[.97] ${ph === "idle" ? "bg-[#c8ff00] text-[#0b0b0d]" : "border border-white/10 text-white/60"}`}
          >
            {ph === "idle" ? "Find opponent" : "Cancel"}
          </button>
        </div>
      )}

      {matched && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            style={{ background: `linear-gradient(160deg, ${C.iris}, #1a1440)`, clipPath: "polygon(0 0, 100% 0, 100% 42%, 0 58%)" }}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
          />
          <motion.div
            className="absolute inset-0"
            style={{ background: `linear-gradient(340deg, ${C.bear}, #3a0d18)`, clipPath: "polygon(0 58%, 100% 42%, 100% 100%, 0 100%)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 26 }}
          />
          <motion.div className="absolute left-4 top-16" initial={{ x: -260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: fx.t(0.15), type: "spring", stiffness: 260, damping: 22 }}>
            <PlayerCard name="You" rank="Strategist · LV 8" wr={64} c={C.acid} side="l" />
          </motion.div>
          <motion.div className="absolute bottom-24 right-4" initial={{ x: 260, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: fx.t(0.15), type: "spring", stiffness: 260, damping: 22 }}>
            <PlayerCard name="satsuki" rank="Analyst · LV 7" wr={58} c={C.gold} side="r" />
          </motion.div>

          <div ref={vs} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <svg width="90" height="120" viewBox="0 0 90 120" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.path d="M55 0 L25 58 L48 58 L30 120 L70 48 L46 48 L62 0Z" fill={C.acid} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.9 }} transition={{ duration: fx.t(0.3), delay: fx.t(0.35) }} />
            </svg>
            <motion.div
              initial={{ scale: 4, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: -8 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 15, delay: 0.4 }}
              className="relative text-[64px] font-bold italic leading-none text-white"
              style={{ textShadow: "4px 4px 0 #0b0b0d, -2px -2px 0 #c8ff00" }}
            >
              VS
            </motion.div>
          </div>

          <AnimatePresence mode="popLayout">
            {ph === "count" && (
              <motion.div
                key={n}
                className="absolute inset-0 z-10 grid place-items-center bg-black/35"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span initial={{ scale: 2.6 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} className="text-[130px] font-bold leading-none text-white" style={{ textShadow: "0 0 40px rgba(200,255,0,.7)" }}>
                  {n}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {ph === "go" && (
              <>
                <motion.div className="absolute inset-0 z-10 bg-[#c8ff00]" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: fx.t(0.5) }} />
                <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="absolute inset-x-3 bottom-4 z-20 rounded-3xl bg-[#0b0b0d] p-4">
                  <div className="font-mono text-[10px] text-[#c8ff00]">GO · BLIND SCENARIO</div>
                  <div className="mt-1 text-[15px] font-semibold">Asset & date hidden. Lock with the better process.</div>
                  <button onClick={() => setPh("idle")} className="mt-3 h-11 w-full rounded-xl bg-[#c8ff00] text-sm font-semibold text-[#0b0b0d]">Rematch</button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 25 · CONFIDENCE DIAL ═════════════ */
const polar = (cx: number, cy: number, r: number, deg: number) => ({
  x: cx + r * Math.sin((deg * Math.PI) / 180),
  y: cy - r * Math.cos((deg * Math.PI) / 180),
});
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const s = polar(cx, cy, r, a0);
  const e = polar(cx, cy, r, a1);
  return `M${s.x},${s.y} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${e.x},${e.y}`;
};

export function ConfidenceDial() {
  const fx = useFx();
  const [scope, anim] = useAnimate();
  const dial = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(55);
  const prev = useRef(55);
  const dragging = useRef(false);
  const [logged, setLogged] = useState(false);
  const actual = Math.round(50 + (val - 50) * 0.35);
  const over = val - actual >= 20;
  const prevOver = useRef(false);

  useEffect(() => {
    if (over === prevOver.current) return;
    prevOver.current = over;
    if (over) {
      fx.sfx("lose");
      fx.haptic([30, 20, 30]);
      if (!fx.reduced && scope.current) anim(scope.current, { x: [0, -6, 5, -3, 0] }, { duration: 0.35 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  const update = (v: number) => {
    v = Math.max(0, Math.min(100, v));
    if (v === prev.current) return;
    if (Math.floor(v / 5) !== Math.floor(prev.current / 5)) {
      fx.haptic(v % 25 === 0 ? 14 : 4);
      fx.sfx("tick");
    }
    prev.current = v;
    setVal(v);
    setLogged(false);
  };

  const fromPointer = (e: React.PointerEvent) => {
    const r = dial.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (a > 135 || a < -135) a = prev.current > 50 ? 135 : -135;
    update(Math.round(((a + 135) / 270) * 100));
  };

  const ang = -135 + val * 2.7;
  const knob = polar(120, 120, 92, ang);
  const col = val < 50 ? C.bull : val < 80 ? C.gold : C.bear;
  const label = val < 30 ? "Low conviction" : val < 60 ? "Moderate" : val < 80 ? "High conviction" : "All-in energy";

  return (
    <div ref={scope} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="font-mono text-[10px] text-white/40">CALIBRATION</div>
      <div className="text-[15px] font-semibold">How sure are you?</div>

      <div className="relative mt-2 flex justify-center">
        <div
          ref={dial}
          role="slider"
          tabIndex={0}
          aria-label="Confidence"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={val}
          onKeyDown={(e) => {
            const d = e.shiftKey ? 5 : 1;
            if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); update(val + d); }
            if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); update(val - d); }
          }}
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
          onPointerMove={(e) => dragging.current && fromPointer(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          className="relative h-[240px] w-[240px] cursor-grab touch-none select-none rounded-full active:cursor-grabbing"
        >
          <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0">
            <defs>
              <linearGradient id="cd-grad" x1="0" y1="1" x2="1" y2="1">
                <stop offset="0%" stopColor={C.bull} />
                <stop offset="55%" stopColor={C.gold} />
                <stop offset="100%" stopColor={C.bear} />
              </linearGradient>
            </defs>
            {Array.from({ length: 21 }, (_, i) => {
              const a = -135 + i * 13.5;
              const major = i % 5 === 0;
              const p1 = polar(120, 120, 112, a);
              const p2 = polar(120, 120, major ? 102 : 107, a);
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={i * 5 <= val ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.15)"} strokeWidth={major ? 2 : 1} />;
            })}
            <path d={arc(120, 120, 92, -135, 135)} stroke="rgba(255,255,255,.08)" strokeWidth={14} fill="none" strokeLinecap="round" />
            {val > 0 && <path d={arc(120, 120, 92, -135, ang)} stroke="url(#cd-grad)" strokeWidth={14} fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${col}90)` }} />}
            <circle cx={knob.x} cy={knob.y} r={13} fill="#f2efe6" stroke={col} strokeWidth={4} />
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="tnum text-[52px] font-bold leading-none" style={{ color: col }}>{val}<span className="text-2xl">%</span></div>
              <AnimatePresence mode="wait">
                <motion.div key={label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: fx.t(0.15) }} className="mt-1 text-[12px] text-white/55">
                  {label}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 rounded-2xl bg-white/[.03] p-3">
        {[
          ["Stated confidence", val, col],
          ["Your hit-rate at this level", actual, "#9a9aa5"],
        ].map(([k, v, c]) => (
          <div key={k as string}>
            <div className="mb-1 flex justify-between text-[11.5px]"><span className="text-white/50">{k}</span><span className="tnum font-mono">{v}%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]">
              <motion.div className="h-full rounded-full" animate={{ width: `${v}%` }} style={{ background: c as string }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex min-h-[40px] items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {over ? (
            <motion.div key="o" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-xl bg-[#ff3b5c]/12 px-3 py-2 text-[12px] font-medium text-[#ff8a9e]">
              Overconfident by {val - actual} pts — history disagrees with you.
            </motion.div>
          ) : (
            <motion.div key="k" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12px] text-white/40">
              Drag the dial · scored later with a Brier score
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1" />
      <button
        onClick={() => { setLogged(true); fx.sfx("lock"); fx.haptic([20, 20, 50]); }}
        className="relative h-12 overflow-hidden rounded-2xl bg-[#f2efe6] font-semibold text-[#0b0b0d] active:scale-[.97]"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(logged)} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }}>
            {logged ? `Logged at ${val}% ✓` : "Log confidence"}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
