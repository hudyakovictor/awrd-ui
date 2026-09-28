import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useState } from "react";
import hood from "../assets/hood.jpg";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING } from "../motion/tokens";
import { SceneBg, useScript, type SceneProps } from "./common";
import { sfx } from "../motion/sfx";

/* затухающая синусоида: «нет-нет-нет» головой */
const noShake = (amp = 14, n = 7) => Array.from({ length: n + 1 }, (_, i) => (i === n ? 0 : Math.sin(i * Math.PI) + (i % 2 ? -1 : 1) * amp * Math.pow(1 - i / n, 2)));

/* ================================================================
   17 · ERROR FEEDBACK — ошибка учит, а не наказывает
   ================================================================ */
const DATA = genCandles(24, 41, 0.08);
export function ErrorFeedback({ run, cue }: SceneProps) {
  const [pick, setPick] = useState<number | null>(null);
  const [why, setWhy] = useState(false);
  const [rgb, setRgb] = useState(false);
  useScript(run, async (wait) => {
    setPick(null);
    setWhy(false);
    await wait(1100);
    cue();
    setPick(0);
    setRgb(true);
    sfx.error();
    sfx.glitch();
    await wait(260);
    setRgb(false);
    await wait(500);
    setWhy(true);
    sfx.whoosh(0.3);
  });
  const wrong = pick !== null;
  const words = "Пробой без объёма — классическая ловушка. Крупные игроки собирают стопы над уровнем и разворачивают цену.".split(" ");
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={wrong ? "#ff4d5e" : "#2ee6c5"} />
      <motion.div className="absolute inset-0 bg-bear" initial={false} animate={{ opacity: rgb ? [0.35, 0] : 0 }} transition={{ duration: 0.4 }} />
      {/* header morph */}
      <motion.div
        className="absolute inset-x-0 top-0 z-10 flex h-[84px] items-end justify-center pb-3"
        initial={false}
        animate={{ background: wrong ? "linear-gradient(180deg,#6a0f1e,#3a0810)" : "linear-gradient(180deg,#0c1428,#0c142800)" }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div key={wrong ? "e" : "q"} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-2 font-display text-sm font-bold">
            {wrong ? <><I.x size={16} className="text-bear" /> РАЗБОР ОШИБКИ</> : "ВОПРОС СУДЬБЫ"}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-x-3 top-[92px]" style={{ filter: rgb ? "drop-shadow(3px 0 0 #ff004c) drop-shadow(-3px 0 0 #00e5ff)" : "none" }}>
        <div className="glass relative rounded-2xl p-3">
          <Candles data={DATA} w={250} h={120} grow={false} />
          {/* annotation draw */}
          <svg viewBox="0 0 250 120" className="pointer-events-none absolute left-3 top-3 h-[120px] w-[250px]">
            <motion.ellipse cx="196" cy="30" rx="30" ry="22" fill="none" stroke="#ffc34d" strokeWidth="2.5" strokeLinecap="round" initial={false} animate={{ pathLength: why ? 1 : 0, opacity: why ? 1 : 0 }} transition={{ duration: 0.6, delay: why ? 0.3 : 0, ease: EASE.outExpo }} style={{ filter: "drop-shadow(0 0 4px #ffc34d)", rotate: -8 }} />
            <motion.path d="M150 70 L185 45" stroke="#ffc34d" strokeWidth="2" fill="none" markerEnd="" initial={false} animate={{ pathLength: why ? 1 : 0 }} transition={{ duration: 0.3, delay: why ? 0.8 : 0 }} />
          </svg>
          <AnimatePresence>
            {why && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.9, ...SPRING.reward }} className="absolute left-6 top-[88px] rounded-md bg-gold px-1.5 py-0.5 text-[9px] font-black text-black">
                ЛОЖНЫЙ ПРОБОЙ
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-x-3 top-[252px] grid grid-cols-2 gap-2">
        {["Войти на пробое", "Ждать ретест", "Увеличить лот", "Выйти из рынка"].map((t, i) => {
          const isPick = pick === i;
          const isRight = i === 1;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={
                isPick
                  ? { x: noShake(12), background: "#ff4d5e33", borderColor: "#ff4d5e" }
                  : wrong && isRight
                    ? { x: 0, scale: [1, 1.08, 1], background: "#3ddc8426", borderColor: "#3ddc84" }
                    : { x: 0, scale: 1, background: "#f5ecd612", borderColor: "#ffffff1a" }
              }
              transition={{ duration: isPick ? 0.5 : 0.45, delay: wrong && isRight ? 0.45 : 0 }}
              className="rounded-xl border px-2 py-3 text-center text-[11px] font-bold"
            >
              {t}
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {why && (
          <motion.div
            initial={{ y: 320 }}
            animate={{ y: 0 }}
            exit={{ y: 320 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] border-t border-bear/40 bg-gradient-to-b from-[#3a0c16] to-[#1a060b] px-5 pb-6 pt-3"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" />
            <div className="font-display text-2xl font-black text-bear" style={{ textShadow: "0 0 20px #ff4d5e88" }}>ПОЧЕМУ?</div>
            <p className="mt-2 text-[12px] leading-relaxed text-white/80">
              {words.map((w, i) => (
                <motion.span key={i} initial={{ opacity: 0, filter: "blur(6px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ delay: 0.25 + i * 0.035, duration: 0.3 }} className="mr-1 inline-block">
                  {w}
                </motion.span>
              ))}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <motion.button whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, ...SPRING.panel }} className="rounded-xl border border-white/15 py-2.5 text-[11px] font-bold">В ОЧЕРЕДЬ</motion.button>
              <motion.button whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.96, ...SPRING.panel }} className="rounded-xl bg-teal py-2.5 text-[11px] font-bold text-[#022]">КОРРЕКЦИЯ</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   18 · DECISION ≠ OUTCOME — раздельная оценка
   ================================================================ */
export function DecisionOutcome({ run, cue }: SceneProps) {
  const [ph, setPh] = useState(0);
  useScript(run, async (wait) => {
    cue();
    setPh(0);
    await wait(200);
    setPh(1);
    await wait(700);
    setPh(2);
    sfx.pop(4);
    await wait(1000);
    setPh(3);
    sfx.success();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#3ddc84" />
      <div className="absolute inset-x-0 top-12 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Разделение исхода и решения</div>
      <div className="absolute inset-x-3 top-[84px] flex h-[270px] gap-0" style={{ perspective: 800 }}>
        <motion.div
          initial={false}
          animate={ph >= 1 ? { x: 0, opacity: 1, rotateY: ph >= 3 ? 10 : 0 } : { x: -160, opacity: 0, rotateY: 0 }}
          transition={SPRING.panel}
          style={{ transformOrigin: "100% 50%" }}
          className="glass flex flex-1 flex-col items-center rounded-l-2xl p-3"
        >
          <div className="text-[10px] font-bold text-white/50">ТВОЁ РЕШЕНИЕ</div>
          <motion.div initial={false} animate={ph >= 2 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }} transition={SPRING.reward} className="mt-10 grid h-16 w-16 place-items-center rounded-full bg-bull text-[#022] shadow-[0_0_30px_#3ddc84]">
            <I.check size={32} stroke={3} />
          </motion.div>
          <div className="mt-3 font-display text-lg font-black text-bull">Верно</div>
          <div className="mt-1 text-center text-[10px] text-white/50">Ждал ретест, стоп за уровнем</div>
        </motion.div>
        <div className="relative w-0.5">
          <motion.div className="absolute inset-x-0 top-0 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_12px_#fff]" initial={false} animate={{ height: ph >= 1 ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE.outExpo, delay: 0.2 }} />
        </div>
        <motion.div
          initial={false}
          animate={ph >= 1 ? { x: 0, opacity: 1, rotateY: ph >= 3 ? -10 : 0 } : { x: 160, opacity: 0, rotateY: 0 }}
          transition={SPRING.panel}
          style={{ transformOrigin: "0% 50%" }}
          className="glass flex flex-1 flex-col items-center rounded-r-2xl p-3"
        >
          <div className="text-[10px] font-bold text-white/50">РЫНОК</div>
          <svg viewBox="0 0 110 90" className="mt-6 h-[90px] w-[110px]">
            <motion.path d="M4 20 L18 26 L28 18 L40 34 L52 30 L64 50 L76 46 L90 68 L106 80" fill="none" stroke="#ff4d5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: ph >= 2 ? 1 : 0 }} transition={{ duration: 0.9, ease: EASE.camera }} style={{ filter: "drop-shadow(0 0 5px #ff4d5e)" }} />
          </svg>
          <motion.div initial={false} animate={ph >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }} transition={{ delay: 0.7 }} className="font-display text-lg font-black text-bear">-4.2%</motion.div>
          <div className="mt-1 text-center text-[10px] text-white/50">Исторический исход</div>
        </motion.div>
      </div>
      <motion.div
        initial={false}
        animate={ph >= 3 ? { y: 0, opacity: 1, scale: 1 } : { y: 60, opacity: 0, scale: 0.9 }}
        transition={SPRING.reward}
        className="absolute inset-x-4 top-[374px] flex items-center gap-3 rounded-2xl border border-bull/40 bg-bull/10 p-4"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-bull text-bull"><I.shield size={18} /></div>
        <div>
          <div className="text-sm font-bold text-bull">Решение хорошее</div>
          <div className="text-[11px] text-white/60">Даже если рынок пошёл не так, как ожидалось. Оценивается процесс.</div>
        </div>
      </motion.div>
      <motion.div initial={false} animate={ph >= 3 ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.3 }} className="absolute inset-x-4 bottom-8 grid grid-cols-3 gap-2 text-center">
        {[["Процесс", "A-"], ["Удача", "—"], ["XP", "+120"]].map(([a, b], i) => (
          <motion.div key={i} initial={false} animate={ph >= 3 ? { y: 0 } : { y: 20 }} transition={{ delay: 0.35 + i * 0.06, ...SPRING.panel }} className="glass rounded-xl py-2">
            <div className="text-[9px] text-white/45">{a}</div>
            <div className="font-display text-sm font-bold">{b}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

/* ================================================================
   19 · BREATH ORB — box breathing 4-4-4-4
   ================================================================ */
const PH = [
  { t: "Вдох", s: 1.45, c: "#2ee6c5" },
  { t: "Задержка", s: 1.45, c: "#4cc3ff" },
  { t: "Выдох", s: 1, c: "#9b7bff" },
  { t: "Задержка", s: 1, c: "#4cc3ff" },
];
export function BreathOrb({ run, cue }: SceneProps) {
  const [ph, setPh] = useState(0);
  const [cyc, setCyc] = useState(0);
  const stress = useMotionValue(0.82);
  const stressW = useTransform(stress, (v) => `${v * 100}%`);
  const stressC = useTransform(stress, [0.2, 0.5, 0.85], ["#3ddc84", "#ffc34d", "#ff4d5e"]);
  const p = useParticles();
  const D = 2000;
  useScript(run, async (wait) => {
    cue();
    stress.set(0.82);
    setCyc((c) => c + 1);
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 4; i++) {
        setPh(i);
        if (i === 0) sfx.breathIn();
        if (i === 2) sfx.breathOut();
        if (i === 0) for (let j = 0; j < 3; j++) p.burst({ x: 150 + Math.cos(j * 2.1) * 150, y: 250 + Math.sin(j * 2.1) * 150, count: 6, shape: "dot", speed: [10, 30], colors: ["#2ee6c5"], target: { x: 150, y: 250 }, size: [2, 3] });
        if (i === 2) p.burst({ x: 150, y: 250, count: 24, shape: "dot", speed: [60, 140], colors: ["#9b7bff", "#fff"], life: [1.2, 1.8], drag: 1, size: [1.5, 3] });
        animate(stress, stress.get() - 0.075, { duration: D / 1000, ease: "easeInOut" });
        await wait(D);
      }
    }
  });
  const P = PH[ph];
  const box = "M60 60 H240 V240 H60 Z";
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={P.c} />
      <img src={hood} className="mask-soft absolute left-1/2 top-[120px] h-60 w-60 -ml-30 object-cover opacity-20" style={{ marginLeft: -120 }} />
      <div className="absolute inset-x-0 top-12 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Эмоциональный контроль</div>
      <svg viewBox="0 0 300 300" className="absolute left-0 top-[100px] h-[300px] w-[300px]">
        <path d={box} fill="none" stroke="#ffffff14" strokeWidth="2" rx="20" />
        <motion.path key={cyc} d={box} fill="none" stroke={P.c} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: (D * 4) / 1000, ease: "linear", repeat: 1 }} style={{ filter: `drop-shadow(0 0 6px ${P.c})` }} />
      </svg>
      <div className="absolute left-0 top-[100px] h-[300px] w-[300px]">
        <motion.div
          key={`d${cyc}`}
          className="absolute left-0 top-0 h-3 w-3 rounded-full bg-white"
          style={{ offsetPath: `path('${box}')`, offsetRotate: "0deg", boxShadow: `0 0 12px 4px ${P.c}` } as React.CSSProperties}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: (D * 4) / 1000, ease: "linear", repeat: 1 }}
        />
      </div>
      {/* organic orb */}
      <div className="absolute left-1/2 top-[250px] -ml-[60px] -mt-[60px] h-[120px] w-[120px]">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            animate={{
              scale: P.s * (1 - i * 0.12),
              borderRadius: ["42% 58% 63% 37% / 41% 44% 56% 59%", "58% 42% 38% 62% / 55% 38% 62% 45%", "42% 58% 63% 37% / 41% 44% 56% 59%"],
              rotate: [0, 120 * (i % 2 ? -1 : 1)],
              background: `radial-gradient(circle at 35% 30%, ${i === 2 ? "#ffffff" : P.c}${i === 0 ? "44" : i === 1 ? "88" : "cc"}, transparent 70%)`,
            }}
            transition={{
              scale: { duration: D / 1000, ease: [0.45, 0, 0.55, 1] },
              borderRadius: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 9 + i * 3, repeat: Infinity, ease: "linear" },
              background: { duration: 0.8 },
            }}
            style={{ filter: `blur(${i === 0 ? 10 : 2}px)` }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-[410px] text-center">
        <AnimatePresence mode="wait">
          <motion.div key={`${ph}${cyc}`} initial={{ opacity: 0, y: 10, letterSpacing: "0.4em" }} animate={{ opacity: 1, y: 0, letterSpacing: "0.1em" }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE.outExpo }} className="font-display text-2xl font-bold" style={{ color: P.c }}>
            {P.t}
          </motion.div>
        </AnimatePresence>
        <div className="mt-1 font-mono text-[11px] text-white/40">4 · 4 · 4 · 4</div>
      </div>
      <div className="absolute inset-x-6 bottom-10">
        <div className="mb-1 flex justify-between text-[10px] font-bold text-white/50"><span>Уровень стресса</span></div>
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-white/5 p-0.5">
          <motion.div className="h-full rounded-full" style={{ width: stressW, background: stressC, boxShadow: "0 0 10px currentColor" }} />
        </div>
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}
