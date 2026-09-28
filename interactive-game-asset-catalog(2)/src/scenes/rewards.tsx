import { animate, AnimatePresence, motion, useAnimate, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import { Bar, Coin, CountUp, I, fmt } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, shakeKeys } from "../motion/tokens";
import { SceneBg, useScript, type SceneProps } from "./common";
import { sfx } from "../motion/sfx";

/* ================================================================
   11 · CHEST OPEN — замах ×3 → взрыв света → лут → монеты-магниты
   ================================================================ */
export function ChestOpen({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const chest = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [st, setSt] = useState<"idle" | "charge" | "open">("idle");
  const [seam, setSeam] = useState(0);
  const coins = useRef(1240);

  useScript(run, async (wait) => {
    cue();
    setSt("idle");
    setSeam(0);
    coins.current = 1240;
    if (num.current) num.current.textContent = fmt(1240);
    await wait(500);
    setSt("charge");
    // ANTICIPATION ×3: каждый удар сильнее, щель светится ярче
    for (let i = 1; i <= 3; i++) {
      setSeam(i / 3);
      sfx.hit(i === 3);
      await anim(chest.current!, { scaleX: [1, 1 + 0.05 * i, 0.97, 1], scaleY: [1, 1 - 0.07 * i, 1.04, 1], rotate: [0, -3 * i, 3 * i, 0] }, { duration: 0.32, ease: "easeOut" });
      await wait(120 - i * 30);
    }
    // BURST
    setSt("open");
    sfx.open();
    const c = centerIn(chest.current, scope.current);
    anim(scope.current, shakeKeys(0.9, 12, 9, 1.5), { duration: 0.4 });
    p.ring(c.x, c.y - 20, "#fff", 200, 0.6, 14);
    p.ring(c.x, c.y - 20, "#ffc34d", 160, 0.9, 5);
    p.burst({ x: c.x, y: c.y - 20, count: 40, shape: "star", colors: ["#ffc34d", "#fff", "#ffe29a"], speed: [200, 560], size: [3, 6], drag: 3 });
    p.burst({ x: c.x, y: c.y - 20, count: 50, shape: "confetti", colors: ["#2ee6c5", "#ffc34d", "#9b7bff", "#ff4d5e"], speed: [250, 520], gravity: 500, drag: 1.4, life: [1.4, 2.2], size: [3, 5], angle: -Math.PI / 2, spread: 2.2 });
    await wait(900);
    // COIN MAGNET → HUD
    const t = centerIn(counter.current, scope.current);
    p.burst({
      x: c.x, y: c.y - 10, count: 18, shape: "coin", size: [6, 8], speed: [220, 420], angle: -Math.PI / 2, spread: 2.6, drag: 1.5, gravity: 300, target: { x: t.x - 22, y: t.y }, stagger: 0.035,
      onArrive: () => {
        sfx.coin(coins.current / 25);
        coins.current += 25;
        if (num.current) num.current.textContent = fmt(coins.current);
        animate(counter.current!, { scale: [1.22, 1] }, { type: "spring", stiffness: 600, damping: 12 });
        p.burst({ x: t.x - 22, y: t.y, count: 4, speed: [40, 120], colors: ["#ffc34d", "#fff"], life: [0.2, 0.4] });
      },
    });
  });

  const open = st === "open";
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ffc34d" />
      <div ref={counter} className="glass absolute right-3 top-11 z-50 flex h-9 items-center gap-2 rounded-full pl-1.5 pr-3">
        <Coin size={24} />
        <span ref={num} className="font-display text-sm font-bold tabular-nums">1 240</span>
      </div>
      {/* god rays */}
      <motion.div
        className="absolute left-1/2 top-[330px] h-[640px] w-[640px] -ml-[320px] -mt-[320px]"
        style={{ background: "repeating-conic-gradient(from 0deg, #ffc34d38 0deg 7deg, transparent 7deg 22deg)", WebkitMaskImage: "radial-gradient(closest-side, #000 20%, transparent)", maskImage: "radial-gradient(closest-side, #000 20%, transparent)" }}
        initial={false}
        animate={{ scale: open ? 1 : 0, opacity: open ? 1 : 0, rotate: open ? 180 : 0 }}
        transition={{ scale: { duration: 0.8, ease: EASE.outExpo }, opacity: { duration: 0.3 }, rotate: { duration: 12, ease: "linear" } }}
      />
      <motion.div className="absolute left-1/2 top-[330px] h-60 w-60 -ml-30 -mt-30 rounded-full" style={{ marginLeft: -120, marginTop: -120, background: "radial-gradient(closest-side,#fff3c4,#ffc34d66 40%,transparent)" }} initial={false} animate={{ scale: open ? [0, 1.6, 1] : 0.3 + seam * 0.4, opacity: open ? 1 : seam * 0.6 }} transition={{ duration: 0.6 }} />
      {/* loot card */}
      <div className="absolute left-1/2 top-[110px] -ml-[70px]" style={{ perspective: 800 }}>
        <motion.div
          initial={false}
          animate={open ? { y: 0, scale: 1, rotateY: 0, opacity: 1 } : { y: 200, scale: 0.2, rotateY: 540, opacity: 0 }}
          transition={open ? { delay: 0.15, type: "spring", stiffness: 120, damping: 14 } : { duration: 0 }}
          className="relative h-[190px] w-[140px] rounded-2xl p-[3px]"
          style={{ background: "linear-gradient(150deg,#fff1b8,#ffc34d 30%,#8a4f0b 60%,#ffd67a)", boxShadow: "0 0 50px #ffc34daa", transformStyle: "preserve-3d" }}
        >
          <div className="sheen relative h-full overflow-hidden rounded-[13px] bg-gradient-to-b from-[#2a2140] to-[#0e0b1c]">
            <img src={hood} className="mask-bottom h-[120px] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-3 text-center">
              <div className="text-[9px] font-bold tracking-[.3em] text-gold">ЛЕГЕНДАРНАЯ</div>
              <div className="font-display text-sm font-bold">Плащ Тени</div>
            </div>
          </div>
        </motion.div>
      </div>
      {/* chest */}
      <motion.div ref={chest} className="absolute left-1/2 top-[290px] h-[110px] w-[150px] -ml-[75px]" style={{ transformOrigin: "50% 100%" }} animate={st === "idle" ? { y: [0, -6, 0] } : { y: 0 }} transition={st === "idle" ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}>
        <svg viewBox="0 0 150 110" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a4a22" /><stop offset="1" stopColor="#4a220d" /></linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1b8" /><stop offset=".5" stopColor="#e0a030" /><stop offset="1" stopColor="#8a4f0b" /></linearGradient>
          </defs>
          <rect x="10" y="48" width="130" height="58" rx="6" fill="url(#wood)" stroke="url(#gold)" strokeWidth="4" />
          <rect x="66" y="48" width="18" height="58" fill="url(#gold)" />
          <rect x="62" y="58" width="26" height="22" rx="4" fill="url(#gold)" stroke="#6a3a08" strokeWidth="2" />
          <circle cx="75" cy="69" r="4" fill="#3a1d05" />
          {/* seam light */}
          <rect x="12" y="44" width="126" height="6" rx="3" fill="#fff4c2" opacity={open ? 1 : seam} style={{ filter: `drop-shadow(0 0 ${6 + seam * 14}px #ffc34d)` }} />
        </svg>
        {/* lid */}
        <motion.svg
          viewBox="0 0 150 60"
          className="absolute left-0 top-[-8px] h-[60px] w-[150px] overflow-visible"
          style={{ transformOrigin: "50% 100%" }}
          initial={false}
          animate={open ? { y: -80, rotate: -28, x: -40, opacity: 0 } : { y: 0, rotate: 0, x: 0, opacity: 1 }}
          transition={open ? { duration: 0.7, ease: EASE.outExpo, opacity: { delay: 0.4, duration: 0.3 } } : { duration: 0 }}
        >
          <path d="M8 56 V30 C8 10 30 4 75 4 C120 4 142 10 142 30 V56 Z" fill="url(#wood)" stroke="url(#gold)" strokeWidth="4" />
          <path d="M66 4 H84 V56 H66 Z" fill="url(#gold)" />
        </motion.svg>
      </motion.div>
      <motion.div className="absolute left-1/2 top-[396px] h-6 w-40 -ml-20 rounded-full bg-black/60 blur-md" animate={{ scaleX: st === "idle" ? [1, 0.85, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }} />
      <AnimatePresence>
        {open && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, ...SPRING.panel }} className="absolute inset-x-5 bottom-8 text-center">
            <div className="font-display text-2xl font-black text-gold" style={{ textShadow: "0 0 20px #ffc34d88" }}>+450 монет</div>
            <div className="mt-1 text-xs text-white/50">+100 XP · Миссия выполнена</div>
            <motion.button whileTap={{ scale: 0.95 }} className="sheen mt-4 w-full rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3.5 font-display text-sm font-bold text-[#032a24] shadow-[0_6px_0_#0a7563]">
              ЗАБРАТЬ
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   12 · GRADE REVEAL — «качество решения» вместо победы/поражения
   ================================================================ */
export function GradeReveal({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [ph, setPh] = useState(0);
  const val = useMotionValue(0);
  const R = 88, ARC = 0.75, L = 2 * Math.PI * R;
  const dash = useTransform(val, (v) => `${L * ARC * v} ${L}`);
  const needle = useTransform(val, (v) => -135 + v * 270);
  const pct = useTransform(val, (v) => `${Math.round(v * 100)}%`);
  useScript(run, async (wait) => {
    cue();
    setPh(0);
    val.set(0);
    await wait(300);
    // стрелка с перелётом: пружина с низким демпфированием
    animate(val, 0.78, { type: "spring", stiffness: 60, damping: 9, mass: 1 });
    await wait(1100);
    setPh(1);
    sfx.stamp();
    window.setTimeout(() => sfx.pop(8), 250);
    anim(scope.current, shakeKeys(0.6, 10, 8, 1), { duration: 0.35 });
    p.ring(150, 190, "#3ddc84", 150, 0.6, 8);
    p.burst({ x: 150, y: 190, count: 36, colors: ["#3ddc84", "#fff", "#ffc34d"], speed: [180, 480] });
    await wait(260);
    setPh(2);
  });
  const metrics = [
    ["Анализ контекста", 0.85, "#3ddc84"],
    ["Управление риском", 0.7, "#2ee6c5"],
    ["Учёт угроз", 0.8, "#ffc34d"],
    ["Эмоциональный контроль", 0.75, "#9b7bff"],
  ] as const;
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#3ddc84" />
      <div className="absolute inset-x-0 top-12 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Качество решения</div>
      <div className="absolute left-1/2 top-[80px] h-[220px] w-[220px] -ml-[110px]">
        <svg viewBox="0 0 220 220" className="h-full w-full">
          <defs>
            <linearGradient id="gg" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#ff4d5e" />
              <stop offset=".5" stopColor="#ffc34d" />
              <stop offset="1" stopColor="#3ddc84" />
            </linearGradient>
          </defs>
          <g transform="rotate(135 110 110)">
            <circle cx="110" cy="110" r={R} fill="none" stroke="#ffffff10" strokeWidth="16" strokeDasharray={`${L * ARC} ${L}`} strokeLinecap="round" />
            <motion.circle cx="110" cy="110" r={R} fill="none" stroke="url(#gg)" strokeWidth="16" strokeLinecap="round" style={{ strokeDasharray: dash, filter: "drop-shadow(0 0 6px #3ddc8488)" }} />
          </g>
          {Array.from({ length: 28 }).map((_, i) => (
            <line key={i} x1="110" y1="8" x2="110" y2={i % 3 ? 13 : 17} stroke="#ffffff33" strokeWidth="1.5" transform={`rotate(${-135 + (i / 27) * 270} 110 110)`} />
          ))}
        </svg>
        <motion.div className="absolute left-1/2 top-[40px] h-[70px] w-2 -ml-1" style={{ rotate: needle, transformOrigin: "50% 100%" }}>
          <div className="h-full w-full bg-white" style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)", filter: "drop-shadow(0 0 6px #fff)" }} />
        </motion.div>
        <div className="absolute left-1/2 top-[100px] h-5 w-5 -ml-2.5 rounded-full border-[3px] border-white bg-[#0c1428]" />
        <div className="absolute inset-x-0 top-[128px] text-center">
          <motion.div className="font-mono text-sm font-bold text-white/60">{pct}</motion.div>
        </div>
        <AnimatePresence>
          {ph >= 1 && (
            <motion.div initial={{ scale: 3.2, opacity: 0, rotate: -14 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: 0.26, ease: EASE.snap }} className="absolute inset-x-0 top-[60px] text-center font-display text-6xl font-black text-bull" style={{ textShadow: "0 0 30px #3ddc84, 0 4px 0 #0a4a24" }}>
              B
              <motion.span initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.25, ...SPRING.reward }} className="inline-block align-top text-3xl text-gold" style={{ textShadow: "0 0 20px #ffc34d" }}>+</motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-4 top-[318px] space-y-3">
        {metrics.map(([l, v, c], i) => (
          <motion.div key={i} initial={false} animate={ph >= 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }} transition={{ delay: ph >= 2 ? i * 0.08 : 0, ...SPRING.panel }}>
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="text-white/70">{l}</span>
              {ph >= 2 && <CountUp to={v * 100} delay={i * 0.08} suffix="%" className="font-bold" />}
            </div>
            {ph >= 2 ? <Bar value={v} color={c} delay={i * 0.08} /> : <div className="h-2 rounded-full bg-white/10" />}
          </motion.div>
        ))}
      </div>
      <motion.div initial={false} animate={ph >= 2 ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }} transition={{ delay: 0.5, ...SPRING.panel }} className="absolute inset-x-4 bottom-6 rounded-2xl border border-bull/30 bg-bull/10 p-3 text-center text-[11px] text-white/70">
        Рынок пошёл против — но решение было верным. Оценивается процесс.
      </motion.div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   13 · LEVEL UP — переполнение шкалы и перерождение уровня
   ================================================================ */
export function LevelUp({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const xp = useMotionValue(680);
  const [lvl, setLvl] = useState(12);
  const [burst, setBurst] = useState(false);
  const w = useTransform(xp, (v) => `${(v % 1000) / 10}%`);
  const label = useTransform(xp, (v) => `${Math.round(v % 1000 || (v >= 1000 ? 1000 : 0))} / 1000`);
  const badge = useRef<HTMLDivElement>(null);
  useScript(run, async (wait) => {
    cue();
    xp.set(680);
    setLvl(12);
    setBurst(false);
    await wait(500);
    await animate(xp, 999.9, { duration: 1.1, ease: [0.5, 0, 0.9, 0.6] }); // разгон к переполнению
    setBurst(true);
    setLvl(13);
    sfx.levelup();
    const c = centerIn(badge.current, scope.current);
    anim(scope.current, shakeKeys(0.7, 10, 8, 1.5), { duration: 0.35 });
    p.ring(c.x, c.y, "#fff", 220, 0.7, 12);
    p.ring(c.x, c.y, "#9b7bff", 170, 1, 5);
    p.burst({ x: c.x, y: c.y, count: 60, shape: "star", colors: ["#9b7bff", "#fff", "#2ee6c5"], speed: [200, 600], size: [3, 6], drag: 3 });
    xp.set(1000);
    await animate(xp, 1100, { duration: 0.9, ease: EASE.outExpo });
  });
  const unlocks = [
    { t: "Карта «Ретест»", icon: I.cards, c: "#2ee6c5" },
    { t: "Сценарии уровня 3", icon: I.layers, c: "#9b7bff" },
    { t: "Турнир недели", icon: I.trophy, c: "#ffc34d" },
  ];
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#9b7bff" />
      <motion.div className="absolute inset-0" initial={false} animate={{ background: burst ? "radial-gradient(60% 40% at 50% 35%, #9b7bff44, transparent)" : "radial-gradient(60% 40% at 50% 35%, #9b7bff00, transparent)" }} />
      <div ref={badge} className="absolute left-1/2 top-[110px] h-[150px] w-[150px] -ml-[75px]" style={{ perspective: 600 }}>
        <motion.div className="spin-slow absolute -inset-6 rounded-full border-2 border-dashed border-violet/40" />
        <motion.div
          className="absolute inset-0 grid place-items-center rounded-[36px] border-2 border-violet"
          style={{ background: "linear-gradient(160deg,#3b2a7a,#140d33)", boxShadow: "0 0 40px #9b7bff88, inset 0 0 30px #9b7bff55", transformStyle: "preserve-3d" }}
          initial={false}
          animate={burst ? { rotateY: [0, 360], scale: [1, 1.25, 1] } : { rotateY: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE.outExpo }}
        >
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-[.3em] text-violet">УРОВЕНЬ</div>
            <div className="relative h-16 w-24 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div key={lvl} initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -70, opacity: 0 }} transition={SPRING.reward} className="absolute inset-0 text-center font-display text-6xl font-black" style={{ textShadow: "0 0 20px #9b7bff" }}>
                  {lvl}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {burst && (
          <motion.div initial={{ scale: 0.4, opacity: 0, letterSpacing: "0.6em" }} animate={{ scale: 1, opacity: 1, letterSpacing: "0.08em" }} transition={{ duration: 0.6, ease: EASE.outExpo }} className="absolute inset-x-0 top-[282px] text-center font-display text-2xl font-black text-white" style={{ textShadow: "0 0 24px #9b7bff" }}>
            НОВЫЙ УРОВЕНЬ
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-5 top-[330px]">
        <div className="mb-1 flex justify-between text-[10px] font-bold text-white/50">
          <span>MASTERY XP</span>
          <motion.span className="tabular-nums">{label}</motion.span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#6a4dff] to-violet shadow-[0_0_14px_#9b7bff]" style={{ width: w }}>
            <div className="sheen absolute inset-0" />
          </motion.div>
          <motion.div className="absolute inset-0 bg-white" initial={false} animate={{ opacity: burst ? [1, 0] : 0 }} transition={{ duration: 0.5 }} />
        </div>
      </div>
      <div className="absolute inset-x-4 top-[386px] space-y-2">
        {unlocks.map((u, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={burst ? { x: 0, opacity: 1, rotateX: 0 } : { x: 0, opacity: 0, rotateX: -80 }}
            transition={{ delay: burst ? 0.5 + i * 0.1 : 0, type: "spring", stiffness: 300, damping: 22 }}
            style={{ transformOrigin: "50% 0%" }}
            className="glass flex items-center gap-3 rounded-xl p-2.5"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${u.c}22`, color: u.c }}><u.icon size={18} /></div>
            <div className="flex-1 text-xs font-bold">{u.t}</div>
            <span className="rounded-full bg-violet/20 px-2 py-0.5 text-[9px] font-bold text-violet">ОТКРЫТО</span>
          </motion.div>
        ))}
      </div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}
