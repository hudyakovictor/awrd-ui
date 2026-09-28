import { AnimatePresence, animate, motion, useAnimate, type AnimationPlaybackControls } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { C, centerIn, useTimers } from "./util";

/* ═════════════ 07 · STREAK COMBO ═════════════ */
const TIER = ["#ff8a3d", C.gold, C.acid, C.iris, "#ff4fd8"];

export function StreakCombo() {
  const fx = useFx();
  const [scope, anim] = useAnimate();
  const flame = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState(0);
  const mult = 1 + Math.floor(combo / 3);
  const col = TIER[Math.min(4, mult - 1)];

  useEffect(() => {
    if (combo === 0 || fx.reduced) return;
    const id = setInterval(() => {
      if (scope.current && flame.current) {
        const c = centerIn(scope.current, flame.current);
        pr.current?.burst(c.x, c.y + 20, {
          count: Math.min(5, 1 + Math.floor(combo / 3)), colors: [col, "#fff3c4"], speed: 2.4,
          angle: -Math.PI / 2, spread: 1, gravity: -0.03, shape: "circle", size: 4, life: 55,
        });
      }
    }, 130 / fx.speed);
    return () => clearInterval(id);
  }, [combo, col, fx.reduced, fx.speed, scope]);

  const hit = () => {
    const n = combo + 1;
    setCombo(n);
    fx.sfx("coin");
    fx.haptic(10);
    if (n % 3 === 0) {
      setFlash((f) => f + 1);
      fx.sfx("win");
      fx.haptic([30, 30, 60]);
    }
  };
  const miss = () => {
    if (combo === 0) return;
    if (scope.current && num.current) {
      const c = centerIn(scope.current, num.current);
      pr.current?.burst(c.x, c.y, { count: 45, colors: ["#8a8a8a", "#4a4a4a", C.bear], speed: 6, gravity: 0.35, size: 8 });
    }
    if (!fx.reduced) anim(scope.current, { x: [0, -9, 8, -5, 3, 0] }, { duration: 0.4 });
    setCombo(0);
    fx.sfx("lose");
    fx.haptic([70, 30, 40]);
  };

  const scale = combo === 0 ? 0.45 : 0.6 + Math.min(combo, 15) * 0.045;

  return (
    <div ref={scope} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/40">DAILY STREAK</span>
        <motion.span key={mult} initial={{ scale: 1.6 }} animate={{ scale: 1 }} className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-[#0b0b0d]" style={{ background: col }}>
          ×{mult}
        </motion.span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        <div className="absolute h-56 w-56 rounded-full blur-3xl transition-all duration-500" style={{ background: col, opacity: combo ? 0.18 + Math.min(combo, 12) * 0.02 : 0.04 }} />
        <motion.div ref={flame} animate={{ scale }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="relative">
          <motion.svg
            width="140" height="170" viewBox="0 0 100 120"
            animate={fx.reduced || combo === 0 ? {} : { scaleY: [1, 1.06, 0.97, 1.03, 1], scaleX: [1, 0.97, 1.02, 0.99, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ originY: 1 }}
          >
            <defs>
              <linearGradient id="fl" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor={combo ? col : C.raised} />
                <stop offset="100%" stopColor={combo ? "#fff4c9" : "#3d5499"} />
              </linearGradient>
            </defs>
            <path d="M50 2 C60 24 86 42 86 74 C86 100 70 118 50 118 C30 118 14 100 14 74 C14 52 30 40 36 18 C42 32 46 38 50 42 C50 28 47 14 50 2Z" fill="url(#fl)" />
            <path d="M50 52 C56 66 68 76 68 92 C68 106 60 114 50 114 C40 114 32 106 32 92 C32 80 42 72 50 52Z" fill={combo ? "#fffbe8" : "#5068ad"} opacity={0.85} />
          </motion.svg>
        </motion.div>
        <div ref={num} className="relative -mt-2 h-16">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={combo}
              initial={{ scale: 1.9, opacity: 0, y: -14 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 20 }}
              className="tnum text-6xl font-bold"
            >
              {combo}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-2 text-[12px] text-white/40">{combo ? "correct calls in a row" : "start a streak"}</div>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((k) => (
            <motion.div key={k} className="h-1.5 w-10 rounded-full" animate={{ background: k < combo % 3 ? col : "rgba(255,255,255,.1)" }} />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} className="pointer-events-none absolute inset-0 grid place-items-center" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: fx.t(1.1) || 0.01, delay: fx.t(0.3) }}>
            <motion.div className="absolute inset-0" style={{ background: col }} initial={{ opacity: 0.45 }} animate={{ opacity: 0 }} transition={{ duration: fx.t(0.4) }} />
            <motion.div initial={{ scale: 2.5, rotate: -10 }} animate={{ scale: 1, rotate: -4 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="rounded-xl px-4 py-2 text-3xl font-bold text-[#0b0b0d]" style={{ background: col }}>
              ×{mult} MULTIPLIER
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <button onClick={miss} className="h-12 rounded-2xl border border-white/10 text-[13px] text-white/60 active:scale-95">Miss</button>
        <button onClick={hit} className="h-12 rounded-2xl font-semibold text-[#0b0b0d] transition-colors active:scale-[.97]" style={{ background: col }}>Correct call</button>
      </div>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 08 · REWARD CHEST ═════════════ */
export function RewardChest() {
  const fx = useFx();
  const [scope, anim] = useAnimate();
  const chest = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [taps, setTaps] = useState(0);
  const [open, setOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const tap = () => {
    if (taps >= 3) return;
    const n = taps + 1;
    setTaps(n);
    fx.sfx("pop");
    fx.haptic(8 * n);
    if (chest.current && !fx.reduced) anim(chest.current, { rotate: [0, -5 * n, 5 * n, -3 * n, 0], scale: [1, 1 + n * 0.05, 1] }, { duration: 0.35 });
    if (n >= 3) {
      later(() => {
        setOpen(true);
        fx.sfx("win");
        fx.haptic([40, 40, 120]);
        if (scope.current && chest.current) {
          const c = centerIn(scope.current, chest.current);
          pr.current?.burst(c.x, c.y - 30, { count: 80, colors: [C.gold, "#fff1b8", "#ffb000"], shape: "circle", speed: 10, gravity: 0.3, size: 7, life: 80 });
        }
        later(() => { setFlipped(true); fx.sfx("coin"); }, fx.ms(900));
      }, fx.ms(380));
    }
  };

  return (
    <div ref={scope} className="relative flex h-full flex-col overflow-hidden px-4 pb-5 pt-2">
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/40">FOUNDER PACK</span>
        <span className="flex items-center gap-1 rounded-full bg-[#ffc83d]/15 px-2 py-1 font-mono text-[10px] font-bold text-[#ffc83d]"><Star size={11} fill="currentColor" /> 250</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <AnimatePresence>
          {open && (
            <motion.div className="absolute" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: fx.t(0.5) }}>
              <motion.div
                className="h-[520px] w-[520px] rounded-full"
                style={{
                  background: "repeating-conic-gradient(from 0deg, rgba(255,200,61,.22) 0deg 7deg, transparent 7deg 22deg)",
                  maskImage: "radial-gradient(circle, black 10%, transparent 60%)",
                  WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 60%)",
                }}
                animate={fx.reduced ? {} : { rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-[58%] h-10 w-48 rounded-full bg-[#ffc83d] blur-2xl transition-opacity duration-300" style={{ opacity: open ? 0.5 : taps * 0.14 }} />

        <motion.div
          animate={!open && taps === 0 && !fx.reduced ? { rotate: [0, -3, 3, -2, 0] } : {}}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.6 }}
          className="relative mt-24"
        >
          <div ref={chest} onClick={tap} role="button" aria-label="Tap to open chest" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && tap()} className="relative h-[120px] w-[160px] cursor-pointer select-none">
            <motion.div
              className="absolute inset-x-0 top-0 z-10 h-[46px] rounded-t-[24px] border-2 border-[#3a2408]"
              style={{ background: "linear-gradient(#ffd766,#e39a12)" }}
              animate={open ? { y: -120, rotate: -35, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: fx.t(0.6), ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-[#8a560f]" />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-[78px] rounded-b-[16px] border-2 border-[#3a2408]" style={{ background: "linear-gradient(#d68a18,#8a4f06)" }}>
              <div className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-[#6b3f07]" />
              <div className="absolute left-1/2 top-2 grid h-9 w-8 -translate-x-1/2 place-items-center rounded-md border-2 border-[#3a2408] bg-[#ffd766]">
                <div className="h-3 w-1.5 rounded-full bg-[#3a2408]" />
              </div>
              <div className="absolute inset-x-2 -top-[3px] h-[3px] rounded-full bg-[#fff1b8] transition-opacity" style={{ opacity: taps / 3, boxShadow: "0 0 14px #ffc83d" }} />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {open && (
            <motion.div
              className="absolute z-20"
              style={{ perspective: 800 }}
              initial={{ y: 60, scale: 0.2, opacity: 0 }}
              animate={{ y: -40, scale: 1, opacity: 1 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
            >
              <motion.div className="relative h-[210px] w-[150px]" style={{ transformStyle: "preserve-3d" }} initial={{ rotateY: 180 }} animate={{ rotateY: flipped ? 0 : 180 }} transition={{ duration: fx.t(0.7), ease: [0.6, 0, 0.2, 1] }}>
                <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-white/30 p-3" style={{ backfaceVisibility: "hidden", background: "linear-gradient(160deg,#8b7bff,#3b2fa8 60%,#15122e)", boxShadow: "0 0 40px rgba(139,123,255,.6)" }}>
                  <span className="self-start rounded bg-white/20 px-1.5 py-0.5 font-mono text-[9px] font-bold">EPIC</span>
                  <svg viewBox="0 0 60 60" className="mx-auto w-16">
                    {[12, 24, 36, 48].map((x, i) => (
                      <g key={x}>
                        <line x1={x} x2={x} y1={10 + i * 3} y2={52 - i * 4} stroke="#c8ff00" strokeWidth={1.5} />
                        <rect x={x - 4} y={20 + (i % 2) * 6} width={8} height={18} rx={1.5} fill={i % 2 ? "#ff4fd8" : "#c8ff00"} />
                      </g>
                    ))}
                  </svg>
                  <div>
                    <div className="text-[14px] font-bold leading-tight">Neon Candle Skin</div>
                    <div className="mt-1 text-[9.5px] text-white/60">Cosmetic only · never affects score</div>
                  </div>
                </div>
                <div className="hatch absolute inset-0 grid place-items-center rounded-2xl border border-white/20 bg-[#1b1b20] text-4xl font-bold text-white/30" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>?</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 h-12">
        {flipped ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-2">
            <button onClick={() => { setTaps(0); setOpen(false); setFlipped(false); }} className="h-12 rounded-2xl border border-white/10 text-[13px] text-white/60 active:scale-95">Again</button>
            <button className="h-12 rounded-2xl bg-[#8b7bff] font-semibold text-white active:scale-[.97]">Equip</button>
          </motion.div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((k) => <div key={k} className={`h-1.5 w-6 rounded-full transition-colors ${k < taps ? "bg-[#ffc83d]" : "bg-white/10"}`} />)}
            </div>
            <span className="text-[12px] text-white/40">{open ? "…" : "Tap the chest to open"}</span>
          </div>
        )}
      </div>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 09 · RANK UP ═════════════ */
export function LevelUp() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [stage, setStage] = useState(0);
  const [xp, setXp] = useState(0);
  const [lvl, setLvl] = useState(7);
  const second = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const a = animate(40, 100, { duration: fx.t(1.1) || 0.01, ease: "easeIn", onUpdate: (v) => setXp(v) });
    later(() => {
      setStage(1);
      setLvl(8);
      setXp(0);
      fx.sfx("win");
      fx.haptic([30, 50, 120]);
      later(() => {
        if (root.current && badge.current) {
          const c = centerIn(root.current, badge.current);
          pr.current?.burst(c.x, c.y, { count: 110, colors: [C.acid, C.iris, "#fff"], shape: "spark", speed: 12, gravity: 0.05, life: 55 });
        }
      }, 120);
      second.current = animate(0, 35, { duration: fx.t(1) || 0.01, delay: fx.t(1.3), ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setXp(v) });
    }, fx.ms(1150));
    later(() => setStage(2), fx.ms(2000));
    return () => { a.stop(); second.current?.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hex = "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

  return (
    <div ref={root} className="relative flex h-full flex-col overflow-hidden px-4 pb-5 pt-2">
      <AnimatePresence>
        {stage >= 1 && (
          <motion.div className="pointer-events-none absolute inset-0 z-30 bg-white" initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: fx.t(0.5) }} />
        )}
      </AnimatePresence>
      <div className="font-mono text-[10px] text-white/40">PROGRESSION</div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        {stage >= 1 && (
          <>
            <motion.div
              className="absolute h-[460px] w-[460px] rounded-full"
              style={{
                background: "repeating-conic-gradient(from 0deg, rgba(200,255,0,.16) 0deg 6deg, transparent 6deg 20deg)",
                maskImage: "radial-gradient(circle, black 8%, transparent 58%)",
                WebkitMaskImage: "radial-gradient(circle, black 8%, transparent 58%)",
              }}
              initial={{ scale: 0, rotate: 0 }}
              animate={fx.reduced ? { scale: 1 } : { scale: 1, rotate: 360 }}
              transition={{ scale: { duration: fx.t(0.5) }, rotate: { duration: 24, repeat: Infinity, ease: "linear" } }}
            />
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="absolute h-32 w-32 rounded-full border-2 border-[#c8ff00]" initial={{ scale: 0.8, opacity: 0.9 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: fx.t(1), delay: fx.t(i * 0.15), ease: "easeOut" }} />
            ))}
          </>
        )}

        <motion.div
          ref={badge}
          initial={false}
          animate={stage >= 1 ? { scale: 1, rotate: 0, filter: "grayscale(0)" } : { scale: 0.7, rotate: -8, filter: "grayscale(1)" }}
          transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 11 }}
          className="relative grid h-32 w-32 place-items-center"
          style={{ clipPath: hex, background: "linear-gradient(150deg,#c8ff00,#8b7bff)" }}
        >
          <div className="absolute inset-[5px] grid place-items-center bg-[#0f0f12]" style={{ clipPath: hex }}>
            <AnimatePresence mode="popLayout">
              <motion.span key={lvl} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ duration: fx.t(0.4) }} className="tnum text-5xl font-bold">
                {lvl}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="relative mt-7 flex h-10 overflow-hidden">
          {stage >= 1 &&
            "RANK UP".split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: fx.t(0.45), delay: fx.t(0.15 + i * 0.05), ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl font-bold tracking-wider"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
        </div>
        <div className="relative mt-1 h-6 text-[14px]">
          <AnimatePresence mode="wait">
            <motion.div key={stage >= 2 ? "s" : "a"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={stage >= 2 ? "text-[#c8ff00]" : "text-white/50"}>
              {stage >= 2 ? "Strategist" : "Analyst"}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative space-y-2">
        {stage >= 2 &&
          ["Conflict Scenarios", "Strategist profile frame"].map((u, i) => (
            <motion.div key={u} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: fx.t(i * 0.12) }} className="flex items-center gap-2 rounded-xl bg-white/[.04] px-3 py-2.5 text-[12.5px]">
              <span className="font-mono text-[10px] text-[#c8ff00]">UNLOCKED</span> {u}
            </motion.div>
          ))}
        <div className="pt-2">
          <div className="mb-1 flex justify-between font-mono text-[10px] text-white/40">
            <span>LV {lvl}</span>
            <span className="tnum">{Math.round(xp * 12)} / 1200 XP</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[.07]">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8b7bff] to-[#c8ff00]" style={{ width: `${xp}%` }} />
          </div>
        </div>
      </div>
      <Particles ref={pr} />
    </div>
  );
}
