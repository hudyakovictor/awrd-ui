import { animate, motion, useAnimate, useMotionValue, useTransform, type MotionValue, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import arena from "../assets/arena.jpg";
import hood from "../assets/hood.jpg";
import enemy from "../assets/enemy.jpg";
import { ParticleCanvas, useParticles } from "../components/particles";
import { Bar, Coin, CountUp, I } from "../components/kit";
import { EASE, SPRING, shakeKeys } from "../motion/tokens";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   01 · SPLASH BOOT — сборка логотипа ударом двух трендов
   ================================================================ */
export function SplashBoot({ run, cue }: SceneProps) {
  const [phase, setPhase] = useState(0);
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const barHead = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const barW = useTransform(progress, (v) => `${v}%`);
  const pct = useTransform(progress, (v) => `${Math.round(v)}%`);

  useScript(run, async (wait) => {
    cue();
    setPhase(0);
    progress.set(0);
    await wait(60);
    setPhase(1); // клинки летят
    await wait(560);
    // IMPACT: флэш + кольцо + искры + тряска
    setPhase(2);
    const cx = 150, cy = 230;
    p.ring(cx, cy, "#ffffff", 190, 0.7, 10);
    p.ring(cx, cy, "#2ee6c5", 140, 0.9, 5);
    p.burst({ x: cx, y: cy, count: 70, colors: ["#3ddc84", "#ff4d5e", "#fff", "#ffc34d"], speed: [200, 700], drag: 3.2 });
    anim(scope.current, shakeKeys(1, 12, 10, 2), { duration: 0.42 });
    await wait(260);
    setPhase(3); // буквы
    await wait(700);
    setPhase(4); // загрузка
    const ctrl = animate(progress, 100, {
      duration: 1.9,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: () => {
        const el = barHead.current;
        if (!el || Math.random() > 0.45) return;
        const r = el.getBoundingClientRect();
        const root = scope.current.getBoundingClientRect();
        p.burst({ x: r.left - root.left + 4, y: r.top - root.top + 4, count: 2, speed: [40, 160], angle: Math.PI, spread: 1.4, colors: ["#2ee6c5", "#fff"], life: [0.3, 0.6], size: [1, 2] });
      },
    });
    await wait(2000);
    ctrl.stop();
    setPhase(5); // iris в хаб
  });

  const blades = [
    { c: "#3ddc84", from: { x: -260, y: 260 }, rot: -42, d: "M4 34 L22 22 L32 28 L50 12 L62 18 L86 4" },
    { c: "#ff4d5e", from: { x: 260, y: 260 }, rot: 42, d: "M4 4 L22 14 L34 8 L52 24 L64 18 L86 34" },
  ];

  return (
    <div ref={scope} className="absolute inset-0 bg-[#04070f]">
      {/* bloom */}
      <motion.div
        className="absolute left-1/2 top-[230px] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, #2ee6c533, #1a2c6a22 50%, transparent)" }}
        animate={{ scale: phase >= 2 ? 1 : 0.3, opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE.outExpo }}
      />
      {/* rotating ticks ring */}
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute left-1/2 top-[230px] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={{ opacity: phase >= 2 ? 0.55 : 0, scale: phase >= 2 ? 1 : 0.5, rotate: phase >= 2 ? 90 : 0 }}
        transition={{ duration: 1.6, ease: EASE.outExpo }}
      >
        {Array.from({ length: 60 }).map((_, i) => (
          <line key={i} x1="100" y1="6" x2="100" y2={i % 5 ? 12 : 18} stroke="#2ee6c5" strokeWidth={i % 5 ? 1 : 2} transform={`rotate(${i * 6} 100 100)`} />
        ))}
      </motion.svg>
      {/* shield */}
      <motion.svg
        viewBox="0 0 100 110"
        className="absolute left-1/2 top-[230px] h-[150px] w-[140px] -translate-x-1/2 -translate-y-1/2"
        initial={false}
        animate={phase >= 2 ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0.3, opacity: 0, rotate: -25 }}
        transition={phase >= 2 ? SPRING.reward : { duration: 0 }}
      >
        <defs>
          <linearGradient id="shg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4b7c" />
            <stop offset="1" stopColor="#0f1730" />
          </linearGradient>
          <linearGradient id="shs" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe6a0" />
            <stop offset=".5" stopColor="#c58b2c" />
            <stop offset="1" stopColor="#ffd67a" />
          </linearGradient>
        </defs>
        <path d="M50 4 L92 18 V52 C92 80 72 98 50 106 C28 98 8 80 8 52 V18 Z" fill="url(#shg)" stroke="url(#shs)" strokeWidth="4" />
        <path d="M50 16 L80 26 V52 C80 72 66 86 50 92 C34 86 20 72 20 52 V26 Z" fill="none" stroke="#2ee6c5" strokeOpacity=".35" strokeWidth="1.5" />
      </motion.svg>
      {/* blades */}
      {blades.map((b, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-[230px] -ml-[80px] -mt-[22px] h-[44px] w-[160px]"
          initial={false}
          animate={
            phase === 0
              ? { x: b.from.x, y: b.from.y, rotate: b.rot, scaleX: 1.8, opacity: 0 }
              : { x: 0, y: 0, rotate: b.rot, scaleX: 1, opacity: 1 }
          }
          transition={phase === 0 ? { duration: 0 } : { duration: 0.55, ease: EASE.snap }}
        >
          <svg viewBox="0 0 90 38" className="h-full w-full overflow-visible" style={{ filter: `drop-shadow(0 0 6px ${b.c}) drop-shadow(0 0 16px ${b.c})` }}>
            <path d={b.d} fill="none" stroke={b.c} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d={b.d} fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />
          </svg>
        </motion.div>
      ))}
      {/* flash */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-white mix-blend-screen"
        initial={false}
        animate={{ opacity: phase === 2 ? [0.9, 0] : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      {/* wordmark */}
      <div className="absolute inset-x-0 top-[318px] flex flex-col items-center" style={{ perspective: 600 }}>
        <div className="flex">
          {"SIGNAL".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="font-display text-[46px] font-black leading-none"
              style={{
                background: "linear-gradient(180deg,#ffffff 0%,#cfe0ff 45%,#6c7fb8 55%,#e8f0ff 100%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 3px 0 #0b1330) drop-shadow(0 0 14px #2ee6c566)",
                transformOrigin: "50% 100%",
              }}
              initial={false}
              animate={phase >= 3 ? { rotateX: 0, y: 0, opacity: 1 } : { rotateX: -100, y: -30, opacity: 0 }}
              transition={phase >= 3 ? { delay: i * 0.045, type: "spring", stiffness: 420, damping: 18 } : { duration: 0 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>
        <div className="-mt-1 flex">
          {"ARENA".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="font-display text-[30px] font-black leading-none tracking-[.2em] text-gold"
              style={{ textShadow: "0 0 18px #ffc34d88, 0 2px 0 #6a3d00" }}
              initial={false}
              animate={phase >= 3 ? { y: 0, opacity: 1, scale: 1 } : { y: 30, opacity: 0, scale: 0.6 }}
              transition={phase >= 3 ? { delay: 0.25 + i * 0.05, ...SPRING.reward } : { duration: 0 }}
            >
              {ch}
            </motion.span>
          ))}
        </div>
      </div>
      {/* loader */}
      <motion.div
        className="absolute inset-x-10 bottom-20"
        initial={false}
        animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 16 }}
        transition={{ duration: 0.4, ease: EASE.outExpo }}
      >
        <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-white/5">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0f8f7e] to-teal shadow-[0_0_14px_#2ee6c5]" style={{ width: barW }}>
            <div className="sheen absolute inset-0" />
            <div ref={barHead} className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_4px_#2ee6c5]" />
          </motion.div>
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[.25em] text-white/50">
          <span>Синхронизация рынка</span>
          <motion.span className="tabular-nums text-teal">{pct}</motion.span>
        </div>
      </motion.div>
      {/* iris out → hub */}
      <motion.div
        className="absolute inset-0 z-30"
        initial={false}
        animate={{ clipPath: phase >= 5 ? "circle(80% at 50% 37%)" : "circle(0% at 50% 37%)" }}
        transition={{ duration: phase >= 5 ? 0.9 : 0, ease: EASE.camera }}
      >
        <motion.img src={arena} className="absolute inset-0 h-full w-full object-cover" initial={false} animate={{ scale: phase >= 5 ? 1 : 1.5 }} transition={{ duration: 1.2, ease: EASE.outExpo }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a16]/40 via-transparent to-[#060a16]" />
        <motion.div
          initial={false}
          animate={phase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ delay: 0.45, ...SPRING.panel }}
          className="absolute inset-x-5 bottom-14 text-center"
        >
          <div className="font-display text-xl font-bold">Добро пожаловать</div>
          <div className="mt-1 text-xs text-white/60">Арена открыта. Рынок ждёт решений.</div>
        </motion.div>
      </motion.div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   02 · HUB ASSEMBLE — хаб собирается из глубины
   ================================================================ */
export function HubAssemble({ run, cue }: SceneProps) {
  const [k, setK] = useState(0);
  useScript(run, async (wait) => {
    cue();
    setK((v) => v + 1);
    await wait(10);
  });
  const tiles = [
    { t: "Академия", icon: I.cap, c: "#4cc3ff" },
    { t: "Арена", icon: I.swords, c: "#2ee6c5" },
    { t: "Угрозы", icon: I.warn, c: "#ff4d5e" },
    { t: "Маркет", icon: I.gem, c: "#ffc34d" },
  ];
  const tabs = [I.cap, I.swords, I.cards, I.trophy, I.dots];
  const [tab, setTab] = useState(1);
  return (
    <div key={k} className="absolute inset-0 overflow-hidden" style={{ perspective: 900 }}>
      <motion.img
        src={arena}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.35, filter: "blur(14px) brightness(.4)" }}
        animate={{ scale: 1, filter: "blur(2px) brightness(.45)" }}
        transition={{ duration: 1.4, ease: EASE.outExpo }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060a16]/60 via-[#060a16]/30 to-[#060a16]" />
      {/* HUD */}
      <div className="absolute inset-x-3 top-11 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06, ...SPRING.panel }}
            className={`glass flex h-9 items-center gap-2 rounded-full px-2 ${i === 0 ? "flex-1" : ""}`}
          >
            {i === 0 && (
              <>
                <div className="grid h-6 w-6 place-items-center rounded-full bg-bull/20 font-display text-[9px] font-black text-bull">12</div>
                <div className="flex-1">
                  <Bar value={0.68} color="#3ddc84" delay={0.6} run={k} />
                </div>
              </>
            )}
            {i === 1 && (
              <>
                <Coin size={20} />
                <CountUp to={1240} duration={1.4} delay={0.55} run={k} className="pr-1 text-xs font-bold" />
              </>
            )}
            {i === 2 && <I.bell size={16} className="mx-0.5 text-white/80" />}
          </motion.div>
        ))}
      </div>
      {/* hero card */}
      <motion.div
        initial={{ rotateX: 38, y: 80, opacity: 0, scale: 0.86 }}
        animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 20 }}
        className="absolute inset-x-3 top-[92px] h-[190px] overflow-hidden rounded-3xl border border-teal/30"
        style={{ transformOrigin: "50% 100%", boxShadow: "0 20px 50px -20px #2ee6c566" }}
      >
        <img src={arena} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a16] via-[#060a16]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5, ease: EASE.outExpo }} className="font-display text-lg font-bold">
            Арена трейдеров
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.76, duration: 0.5, ease: EASE.outExpo }} className="text-[11px] text-white/60">
            Сценарий 5/10 · BTC/USDT · 1h
          </motion.div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, ...SPRING.reward }}
            className="sheen mt-3 w-full rounded-xl bg-gradient-to-b from-[#ffd76a] to-[#e8a121] py-2.5 font-display text-sm font-bold text-[#3a2200] shadow-[0_6px_0_#9a5f00,0_10px_24px_-6px_#ffc34d]"
          >
            НАЧАТЬ
          </motion.button>
        </div>
      </motion.div>
      {/* tiles */}
      <div className="absolute inset-x-3 top-[296px] grid grid-cols-4 gap-2">
        {tiles.map((t, i) => (
          <motion.button
            key={i}
            initial={{ rotateY: -90, opacity: 0, x: 20 }}
            animate={{ rotateY: 0, opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.06, type: "spring", stiffness: 260, damping: 20 }}
            whileTap={{ scale: 0.9, rotate: -2 }}
            className="glass flex aspect-[.85] flex-col items-center justify-center gap-1.5 rounded-2xl"
            style={{ borderColor: `${t.c}44` }}
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${t.c}22`, color: t.c, boxShadow: `0 0 16px ${t.c}44` }}>
              <t.icon size={18} />
            </div>
            <span className="text-[9.5px] font-bold text-white/80">{t.t}</span>
          </motion.button>
        ))}
      </div>
      {/* daily */}
      <motion.div
        initial={{ x: 320 }}
        animate={{ x: 0 }}
        transition={{ delay: 0.85, ...SPRING.panel }}
        className="glass absolute inset-x-3 top-[392px] flex items-center gap-3 rounded-2xl p-3"
      >
        <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gold/15 text-gold">
          <I.gem size={20} />
          <span className="pulse-ring absolute inset-0 rounded-xl border border-gold/60" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold">Ежедневный бонус</div>
          <div className="font-mono text-[10px] text-white/50">23:47:12</div>
        </div>
        <I.arrowR size={16} className="text-white/40" />
      </motion.div>
      {/* quote ticker */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="absolute inset-x-3 top-[462px] overflow-hidden rounded-xl border border-white/5 bg-black/30 py-2">
        <div className="marquee flex w-max gap-6 whitespace-nowrap text-[10px] font-bold">
          {Array.from({ length: 2 }).flatMap((_, j) =>
            [["BTC", "+2.8%", 1], ["ETH", "+3.1%", 1], ["SOL", "-1.2%", 0], ["TON", "+6.8%", 1], ["BNB", "-0.4%", 0]].map(([n, v, up], i) => (
              <span key={`${j}${i}`} className="flex gap-1.5">
                <span className="text-white/60">{n}</span>
                <span className={up ? "text-bull" : "text-bear"}>{v}</span>
              </span>
            )),
          )}
        </div>
      </motion.div>
      {/* nav */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, ...SPRING.panel }}
        className="glass absolute inset-x-3 bottom-4 flex h-14 items-center justify-around rounded-2xl"
      >
        {tabs.map((Ic, i) => (
          <button key={i} onClick={() => setTab(i)} className="relative grid h-11 w-11 place-items-center">
            {tab === i && <motion.div layoutId={`hubtab${k}`} transition={SPRING.layout} className="absolute inset-0 rounded-xl bg-teal/20 shadow-[inset_0_0_0_1px_#2ee6c566,0_0_18px_#2ee6c544]" />}
            <motion.span animate={{ scale: tab === i ? 1.15 : 1, y: tab === i ? -1 : 0 }} transition={SPRING.tap} className={tab === i ? "text-teal" : "text-white/45"}>
              <Ic size={20} />
            </motion.span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}

/* ================================================================
   03 · PARALLAX ONBOARDING — 4 слоя глубины на одном жесте
   ================================================================ */
const SLIDES = [
  { img: hood, title: "Учись", sub: "Реальные рыночные ситуации. Никакой подгонки.", c: "#3ddc84" },
  { img: enemy, title: "Сражайся", sub: "Угрозы — это ловушки рынка. Узнай их в лицо.", c: "#ff4d5e" },
  { img: arena, title: "Побеждай", sub: "Оценивается решение, а не удача.", c: "#ffc34d" },
];
const W = 286;

function Slide({ x, i }: { x: MotionValue<number>; i: number }) {
  const s = SLIDES[i];
  const off = useTransform(x, (v) => v + i * W);
  const bgX = useTransform(off, (v) => v * 0.35);
  const charX = useTransform(off, (v) => v * -0.25);
  const charS = useTransform(off, [-W, 0, W], [0.75, 1, 0.75]);
  const charR = useTransform(off, [-W, 0, W], [12, 0, -12]);
  const txtX = useTransform(off, (v) => v * 0.6);
  const op = useTransform(off, [-W * 0.7, 0, W * 0.7], [0, 1, 0]);
  return (
    <motion.div className="absolute inset-y-0 left-0 overflow-hidden" style={{ x: off, width: W }}>
      <motion.div className="absolute -inset-x-20 inset-y-0" style={{ x: bgX, background: `radial-gradient(60% 45% at 50% 38%, ${s.c}33, transparent 70%)` }} />
      <motion.div className="absolute -inset-x-20 top-24 h-40 opacity-30" style={{ x: bgX }}>
        <svg viewBox="0 0 400 120" className="h-full w-full">
          <path d="M0 90 L40 70 L80 80 L120 40 L160 55 L200 20 L240 45 L280 30 L320 60 L360 35 L400 50" fill="none" stroke={s.c} strokeWidth="2" />
        </svg>
      </motion.div>
      <motion.img src={s.img} className="mask-soft absolute left-1/2 top-16 h-64 w-64 -ml-32 object-cover" style={{ x: charX, scale: charS, rotate: charR }} draggable={false} />
      <motion.div className="absolute inset-x-6 top-[350px] text-center" style={{ x: txtX, opacity: op }}>
        <div className="font-display text-3xl font-black" style={{ color: s.c, textShadow: `0 0 24px ${s.c}66` }}>{s.title}</div>
        <div className="mt-2 text-sm text-white/65">{s.sub}</div>
      </motion.div>
    </motion.div>
  );
}

export function ParallaxOnboarding({ run, cue }: SceneProps) {
  const x = useMotionValue(0);
  const [idx, setIdx] = useState(0);
  const go = (n: number) => {
    const t = Math.max(0, Math.min(SLIDES.length - 1, n));
    setIdx(t);
    animate(x, -t * W, SPRING.panel);
  };
  useScript(run, async (wait) => {
    go(0);
    await wait(500);
    cue();
    go(1);
    await wait(1400);
    go(2);
    await wait(1400);
    go(0);
  });
  return (
    <div className="absolute inset-0">
      <SceneBg tint={SLIDES[idx].c} />
      <motion.div
        className="absolute inset-y-0 left-[7px] cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ width: W }}
        onPan={(_, info) => {
          // rubber-band на краях: сопротивление растёт с расстоянием
          let o = info.offset.x;
          if ((idx === 0 && o > 0) || (idx === SLIDES.length - 1 && o < 0)) o = Math.sign(o) * Math.pow(Math.abs(o), 0.72);
          x.set(-idx * W + o);
        }}
        onPanEnd={(_, info) => {
          const proj = info.offset.x + info.velocity.x * 0.2;
          go(idx + (proj < -W / 3 ? 1 : proj > W / 3 ? -1 : 0));
        }}
      >
        {SLIDES.map((_, i) => (
          <Slide key={i} x={x} i={i} />
        ))}
      </motion.div>
      <div className="absolute inset-x-0 bottom-28 flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <motion.div key={i} animate={{ width: idx === i ? 28 : 8, background: idx === i ? s.c : "#ffffff33" }} transition={SPRING.panel} className="h-2 rounded-full" />
        ))}
      </div>
      <AnimatePresence mode="popLayout">
        <motion.button
          key={idx === 2 ? "go" : "next"}
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.9 }}
          transition={SPRING.panel}
          whileTap={{ scale: 0.95 }}
          onClick={() => go(idx === 2 ? 0 : idx + 1)}
          className="absolute inset-x-6 bottom-10 rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3.5 font-display text-sm font-bold text-[#032a24] shadow-[0_6px_0_#0a7563,0_14px_30px_-8px_#2ee6c5]"
        >
          {idx === 2 ? "СТАТЬ ЛУЧШЕ" : "ДАЛЕЕ"}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
