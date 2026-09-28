import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { nav } from "../App";
import { CountUp, I, Phone } from "../components/kit";
import { ALL_SCENES, CATEGORIES, type Category } from "../data/catalog";
import { INTERACTIVE_IDS, INTERACTIVE_SETS, gestureKinds } from "../data/catalog3";
import { EASE, SPRING } from "../motion/tokens";
import { SplashBoot } from "../scenes/boot";
import arenaImg from "../assets/arena.jpg";
import enemyImg from "../assets/enemy.jpg";
import { Logo } from "./Header";

/* ------------------------------ background ------------------------------ */
function LiveBg() {
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const bg = useMotionTemplate`radial-gradient(600px circle at ${sx}% ${sy}%, #2ee6c522, transparent 60%)`;
  useEffect(() => {
    const on = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 100);
      my.set((e.clientY / window.innerHeight) * 100);
    };
    window.addEventListener("pointermove", on);
    return () => window.removeEventListener("pointermove", on);
  }, [mx, my]);
  return (
    <div className="pointer-events-none fixed inset-0 -z-0">
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_-10%,#16244a,transparent_70%)]" />
      <div className="grid-bg absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_75%)]" />
      <motion.div className="absolute inset-0" style={{ background: bg }} />
      {Array.from({ length: 14 }).map((_, i) => {
        const up = i % 3 !== 0;
        return (
          <motion.div
            key={i}
            className="absolute w-2 rounded-sm"
            style={{ left: `${(i * 73) % 100}%`, top: `${(i * 37) % 90}%`, height: 20 + ((i * 13) % 40), background: up ? "#3ddc84" : "#ff4d5e", opacity: 0.12, boxShadow: `0 0 12px ${up ? "#3ddc84" : "#ff4d5e"}` }}
            animate={{ y: [0, -40, 0] }}
            transition={{ duration: 8 + (i % 5) * 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------ hero ------------------------------ */
const ORBIT = [
  { t: "hit-stop 90ms", c: "#ff4d5e", x: -210, y: -170 },
  { t: "trauma² shake", c: "#ffc34d", x: 190, y: -120 },
  { t: "spring 260 / 13", c: "#9b7bff", x: -230, y: 40 },
  { t: "layoutId morph", c: "#4cc3ff", x: 200, y: 90 },
  { t: "homing particles", c: "#2ee6c5", x: -170, y: 220 },
  { t: "ghost HP bar", c: "#3ddc84", x: 180, y: 250 },
];

function HeroPhone() {
  const [run, setRun] = useState(1);
  useEffect(() => {
    const t = window.setInterval(() => setRun((r) => r + 1), 6200);
    return () => clearInterval(t);
  }, []);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 80, damping: 16 }), sry = useSpring(ry, { stiffness: 80, damping: 16 });
  return (
    <div
      className="relative flex h-[680px] items-center justify-center"
      style={{ perspective: 1400 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
    >
      <motion.div style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }} initial={{ y: 80, opacity: 0, rotateZ: -4 }} animate={{ y: 0, opacity: 1, rotateZ: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 90, damping: 16 }}>
        <Phone tint="#2ee6c5">
          <SplashBoot run={run} cue={() => {}} />
        </Phone>
        {ORBIT.map((o, i) => (
          <motion.div
            key={i}
            className="glass absolute left-1/2 top-1/2 hidden whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold md:block"
            style={{ x: o.x - 60, y: o.y, z: 80, color: o.c, borderColor: `${o.c}44`, boxShadow: `0 0 24px -6px ${o.c}` }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1, y: [o.y, o.y - 10, o.y] }}
            transition={{ opacity: { delay: 0.8 + i * 0.08 }, scale: { delay: 0.8 + i * 0.08, ...SPRING.reward }, y: { duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" } }}
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: o.c }} />
            {o.t}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function SplitTitle({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={`inline-flex flex-wrap ${className}`} style={{ perspective: 600 }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ transformOrigin: "50% 100%", whiteSpace: "pre" }}
          initial={{ rotateX: -90, y: 30, opacity: 0 }}
          animate={{ rotateX: 0, y: 0, opacity: 1 }}
          transition={{ delay: delay + i * 0.03, type: "spring", stiffness: 300, damping: 20 }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------ category motifs ------------------------------ */
function Motif({ id, c }: { id: string; c: string }) {
  if (id === "boot")
    return (
      <div className="relative h-full w-full">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="absolute left-1/2 top-1/2 rounded-full border-2" style={{ width: 60 + i * 40, height: 60 + i * 40, marginLeft: -(30 + i * 20), marginTop: -(30 + i * 20), borderColor: `${c}${["aa", "66", "33"][i]}`, borderStyle: i === 1 ? "dashed" : "solid" }} animate={{ rotate: i % 2 ? -360 : 360, scale: [1, 1.05, 1] }} transition={{ rotate: { duration: 10 + i * 4, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }} />
        ))}
        <motion.div className="absolute left-1/2 top-1/2 h-10 w-10 -ml-5 -mt-5 rounded-xl" style={{ background: c, boxShadow: `0 0 30px ${c}` }} animate={{ rotate: [0, 90, 90, 180], scale: [1, 0.8, 1.1, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: EASE.camera }} />
      </div>
    );
  if (id === "transitions")
    return (
      <div className="relative h-full w-full" style={{ perspective: 400 }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="absolute left-1/2 top-1/2 h-24 w-16 -ml-8 -mt-12 rounded-xl border" style={{ borderColor: `${c}88`, background: `${c}${["15", "25", "40"][i]}` }} animate={{ x: [(i - 1) * 34, (i - 1) * 10, (i - 1) * 34], rotateY: [(i - 1) * -25, 0, (i - 1) * -25], z: [i * 10, 40, i * 10] }} transition={{ duration: 3, repeat: Infinity, ease: EASE.camera, delay: i * 0.1 }} />
        ))}
      </div>
    );
  if (id === "battle")
    return (
      <div className="relative h-full w-full">
        {[0, 1].map((i) => (
          <motion.div key={i} className="absolute left-1/2 top-1/2 h-1 w-40 -ml-20 rounded-full" style={{ background: i ? "#ff4d5e" : "#3ddc84", boxShadow: `0 0 16px ${i ? "#ff4d5e" : "#3ddc84"}`, rotate: i ? 35 : -35 }} animate={{ x: [i ? 120 : -120, 0, 0, i ? 120 : -120], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.2, 0.7, 1], ease: EASE.snap }} />
        ))}
        <motion.div className="absolute left-1/2 top-1/2 h-24 w-24 -ml-12 -mt-12 rounded-full border-4 border-white" animate={{ scale: [0, 0, 1.8], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.2, 0.5] }} />
      </div>
    );
  if (id === "rewards")
    return (
      <div className="relative h-full w-full">
        <motion.div className="absolute left-1/2 top-1/2 h-56 w-56 -ml-28 -mt-28" style={{ background: `repeating-conic-gradient(${c}55 0 8deg, transparent 8deg 24deg)`, WebkitMaskImage: "radial-gradient(closest-side,#000 10%,transparent)", maskImage: "radial-gradient(closest-side,#000 10%,transparent)" }} animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} />
        <motion.div className="absolute left-1/2 top-1/2 h-14 w-14 -ml-7 -mt-7 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%,#fff6cc,#ffc34d 50%,#a8620f)", boxShadow: `0 0 40px ${c}` }} animate={{ y: [0, -12, 0], rotateY: [0, 180, 360] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      </div>
    );
  if (id === "progression")
    return (
      <svg viewBox="0 0 200 140" className="h-full w-full">
        <path d="M100 20 C100 50 50 40 50 70 M100 20 C100 50 150 40 150 70 M150 70 C150 95 100 90 100 120" fill="none" stroke={`${c}44`} strokeWidth="3" />
        <path d="M100 20 C100 50 150 40 150 70 M150 70 C150 95 100 90 100 120" fill="none" stroke={c} strokeWidth="3" strokeDasharray="6 14" className="flow-dash" />
        {[[100, 20], [50, 70], [150, 70], [100, 120]].map(([x, y], i) => (
          <motion.rect key={i} x={x - 10} y={y - 10} width="20" height="20" rx="5" fill="#0c1428" stroke={c} strokeWidth="2.5" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        ))}
      </svg>
    );
  if (id === "meta")
    return (
      <div className="relative h-full w-full" style={{ perspective: 500 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div key={i} className="absolute left-1/2 top-1/2 h-20 w-14 -ml-7 -mt-10 rounded-lg border" style={{ borderColor: `${c}aa`, background: i === 4 ? "linear-gradient(160deg,#ffc34d,#6a3d00)" : `${c}22`, transformOrigin: "50% 120%" }} animate={{ rotate: [(i - 2) * 0, (i - 2) * 14, (i - 2) * 14, 0], x: [0, (i - 2) * 26, (i - 2) * 26, 0], rotateY: [180, 180, 0, 180] }} transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.05, times: [0, 0.3, 0.6, 1], ease: EASE.camera }} />
        ))}
      </div>
    );
  if (id === "gestures")
    return (
      <div className="relative h-full w-full">
        <motion.div className="absolute left-1/2 top-1/2 h-24 w-16 -ml-8 -mt-12 rounded-xl border-2" style={{ borderColor: c, background: `${c}22` }} animate={{ x: [0, 60, 0, -60, 0], rotate: [0, 14, 0, -14, 0] }} transition={{ duration: 3, repeat: Infinity, ease: EASE.camera }} />
        <motion.div className="absolute left-1/2 top-1/2 h-6 w-6 -ml-3 mt-8 rounded-full bg-white/90 shadow-[0_0_16px_#fff]" animate={{ x: [0, 60, 0, -60, 0], scale: [1, 0.8, 1, 0.8, 1] }} transition={{ duration: 3, repeat: Infinity, ease: EASE.camera }} />
      </div>
    );
  if (id === "finale")
    return (
      <div className="relative h-full w-full">
        {Array.from({ length: 16 }).map((_, i) => {
          const x = (i % 4) - 1.5, y = Math.floor(i / 4) - 1.5;
          return <motion.div key={i} className="absolute left-1/2 top-1/2 h-5 w-5 rounded-sm" style={{ background: c, boxShadow: `0 0 10px ${c}`, marginLeft: x * 22 - 10, marginTop: y * 22 - 10 }} animate={{ x: [0, 0, x * 40, 0], y: [0, 0, y * 40 + 30, 0], rotate: [0, 0, x * 90, 0], opacity: [1, 1, 0, 1] }} transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.4, 0.75, 1], delay: Math.hypot(x, y) * 0.05 }} />;
        })}
      </div>
    );
  return (
    <div className="relative h-full w-full">
      <motion.div className="absolute left-1/2 top-1/2 h-24 w-24 -ml-12 -mt-12" style={{ background: `radial-gradient(circle at 35% 30%, ${c}, transparent 70%)`, filter: "blur(2px)" }} animate={{ scale: [1, 1.4, 1.4, 1, 1], borderRadius: ["42% 58% 63% 37% / 41% 44% 56% 59%", "58% 42% 38% 62% / 55% 38% 62% 45%", "42% 58% 63% 37% / 41% 44% 56% 59%"] }} transition={{ scale: { duration: 6, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }, borderRadius: { duration: 4, repeat: Infinity } }} />
    </div>
  );
}

function CatCard({ c, i }: { c: Category; i: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 200, damping: 20 }), sy = useSpring(py, { stiffness: 200, damping: 20 });
  const rY = useTransform(sx, [0, 1], [-10, 10]);
  const rX = useTransform(sy, [0, 1], [8, -8]);
  const gx = useTransform(sx, (v) => `${v * 100}%`), gy = useTransform(sy, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(400px circle at ${gx} ${gy}, ${c.color}26, transparent 50%)`;
  return (
    <motion.button
      ref={ref}
      onClick={() => nav(`/c/${c.id}`)}
      initial={{ opacity: 0, y: 60, rotateX: 20 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: (i % 3) * 0.08, type: "spring", stiffness: 120, damping: 18 }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
      whileTap={{ scale: 0.97 }}
      className="group relative text-left"
      style={{ perspective: 1000 }}
    >
      <motion.div style={{ rotateX: rX, rotateY: rY, transformStyle: "preserve-3d" }} className="relative h-full overflow-hidden rounded-[28px] border border-white/[.07] bg-gradient-to-b from-[#111b33] to-[#0a1122] p-6 transition-shadow duration-500 group-hover:shadow-[0_30px_80px_-30px_var(--c)]" >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }} />
        <div className="relative flex items-start justify-between">
          <div className="font-display text-5xl font-black" style={{ color: "transparent", WebkitTextStroke: `1.5px ${c.color}88` }}>{c.n}</div>
          <div className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${c.color}1c`, color: c.color }}>{c.scenes.length} сцены</div>
        </div>
        <div className="relative my-4 h-40" style={{ transform: "translateZ(40px)" }}>
          <Motif id={c.id} c={c.color} />
        </div>
        <div className="relative" style={{ transform: "translateZ(30px)" }}>
          <div className="text-[10px] font-bold uppercase tracking-[.25em] text-white/40">{c.en}</div>
          <div className="mt-1 font-display text-2xl font-bold">{c.title}</div>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{c.blurb}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {c.scenes.map((s) => (
              <span key={s.id} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-white/60">{s.title}</span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm font-bold" style={{ color: c.color }}>
            Открыть категорию
            <motion.span className="inline-block" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity }}><I.arrowR size={16} /></motion.span>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

/* ------------------------------ page ------------------------------ */
export default function Home() {
  const totalSecrets = ALL_SCENES.reduce((a, s) => a + s.secrets.length, 0);
  const principles = ["Anticipation", "Hit-stop", "Trauma shake", "Squash & stretch", "Overshoot", "Stagger 45ms", "Shared element", "FLIP", "Homing particles", "Ghost bar", "Depth push", "Motion path", "Holo foil", "Rubber band"];
  return (
    <div className="relative">
      <LiveBg />
      {/* HERO */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-6 px-5 pt-24 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, ...SPRING.panel }} className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-[11px] font-bold text-teal">
            <span className="h-1.5 w-1.5 rounded-full bg-teal blink" /> AAA Mobile Game Motion Library
          </motion.div>
          <h1 className="mt-5 font-display text-[44px] font-black leading-[1.02] sm:text-6xl lg:text-7xl">
            <SplitTitle text="Движение," delay={0.2} />
            <br />
            <SplitTitle text="которое" delay={0.45} className="text-white/40" />{" "}
            <SplitTitle text="бьёт." delay={0.65} className="bg-gradient-to-r from-teal via-bull to-gold bg-clip-text text-transparent" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.8, ease: EASE.outExpo }} className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Каталог полноэкранных игровых сцен Signal Arena: переходы, бой, награды, прогрессия и фидбэк. Каждая сцена — живая, с хореографией по миллисекундам, кривыми и исходным кодом. Не кнопки. Сцены.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, ...SPRING.panel }} className="mt-8 flex flex-wrap gap-3">
            <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.95, y: 2 }} onClick={() => document.getElementById("cats")?.scrollIntoView({ behavior: "smooth" })} className="sheen rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] px-7 py-4 font-display text-sm font-bold text-[#032a24] shadow-[0_6px_0_#0a7563,0_18px_40px_-10px_#2ee6c5]">
              ОТКРЫТЬ КАТАЛОГ
            </motion.button>
            <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => nav("/play")} className="flex items-center gap-2 rounded-2xl border border-bear/50 bg-bear/10 px-7 py-4 font-display text-sm font-bold text-bear hover:bg-bear/20">
              <I.play size={14} /> ИГРАТЬ
            </motion.button>
            <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => nav("/codex")} className="rounded-2xl border border-gold/40 px-7 py-4 font-display text-sm font-bold text-gold hover:bg-gold/10">
              КОДЕКС
            </motion.button>
          </motion.div>
          <div className="mt-12 grid max-w-lg grid-cols-3 gap-4">
            {[[ALL_SCENES.length, "живых сцен"], [CATEGORIES.length, "категорий"], [totalSecrets, "секретов"]].map(([v, l], i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.08, ...SPRING.panel }} className="border-l border-white/10 pl-4">
                <div className="font-display text-3xl font-black"><CountUp to={v as number} delay={1.3 + i * 0.1} duration={1.6} /></div>
                <div className="text-xs text-white/45">{l}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <HeroPhone />
      </section>

      {/* MARQUEE */}
      <div className="relative my-10 -rotate-1 overflow-hidden border-y border-white/5 bg-white/[.02] py-4">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...principles, ...principles].map((p, i) => (
            <span key={i} className="flex items-center gap-10 font-display text-xl font-bold text-white/25">
              {p} <I.sparkle size={16} className="text-teal/60" />
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section id="cats" className="relative mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.3em] text-teal">Каталог</div>
            <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">{CATEGORIES.length - INTERACTIVE_SETS.length} миров движения</h2>
          </div>
          <p className="max-w-md text-sm text-white/50">Каждая категория — отдельная страница с живыми сценами в телефоне, таймлайном хореографии, визуализацией кривых и кодом.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.filter((c) => !INTERACTIVE_IDS.has(c.id)).map((c, i) => (
            <div key={c.id} style={{ ["--c" as string]: c.color }}><CatCard c={c} i={i} /></div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE SETS */}
      <section className="relative mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.3em] text-[#ff6bd6]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6bd6] blink" /> Новое · управляется жестами
            </div>
            <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">15 интерактивных наборов</h2>
          </div>
          <p className="max-w-md text-sm text-white/50">Свайпы, слайдеры, карусели, ручки, удержание и перетаскивание запускают анимацию. Призрачный палец показывает жест — дальше управляешь сам.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INTERACTIVE_SETS.map((c, i) => (
            <motion.button
              key={c.id}
              onClick={() => nav(`/c/${c.id}`)}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 3) * 0.06, type: "spring", stiffness: 160, damping: 20 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="group relative overflow-hidden rounded-3xl border border-white/[.07] bg-gradient-to-b from-[#111b33] to-[#0a1122] p-5 text-left"
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }} />
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: `${c.color}55` }} />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-sm font-black transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" style={{ background: `${c.color}1c`, color: c.color, boxShadow: `inset 0 0 0 1px ${c.color}55` }}>
                  {c.n}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-lg font-bold">{c.title}</div>
                  <div className="truncate text-[11px] text-white/45">{c.en}</div>
                </div>
                <span className="ml-auto text-[10px] font-bold text-white/40">{c.scenes.length} сцены</span>
              </div>
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {gestureKinds(c).map((k) => (
                  <span key={k} className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${c.color}14`, color: c.color }}>{k}</span>
                ))}
              </div>
              <div className="relative mt-3 space-y-1">
                {c.scenes.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-[11px] text-white/55">
                    <span className="font-mono text-white/30">{s.n}</span> {s.title}
                  </div>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* PLAY TEASER */}
      <section className="relative mx-auto max-w-7xl px-5 py-10">
        <motion.button
          onClick={() => nav("/play")}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 100, damping: 18 }}
          whileHover="hover"
          className="group relative block w-full overflow-hidden rounded-[32px] border border-bear/25 text-left"
        >
          <motion.img src={arenaImg} className="absolute inset-0 h-full w-full object-cover opacity-50" variants={{ hover: { scale: 1.06 } }} transition={{ duration: 1.2, ease: EASE.outExpo }} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060a16] via-[#060a16]/85 to-[#060a16]/20" />
          <motion.img src={enemyImg} className="absolute -right-10 bottom-0 hidden h-[120%] mix-blend-screen md:block" variants={{ hover: { x: -20, scale: 1.04 } }} transition={{ type: "spring", stiffness: 120, damping: 16 }} />
          <div className="relative max-w-xl p-10 sm:p-14">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.3em] text-bear"><span className="h-1.5 w-1.5 rounded-full bg-bear blink" /> Новое · играбельно</div>
            <h2 className="mt-3 font-display text-4xl font-black sm:text-5xl">Сразись с FOMO</h2>
            <p className="mt-4 text-white/60">Полный игровой цикл в одном телефоне: портал, туман будущего, hit-stop, раскол босса, звёзды, монеты-магниты, прокачка. Рядом — журнал, объясняющий каждый приём в реальном времени.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Портал", "Туман будущего", "Hit-stop", "Комбо-крит", "Shatter", "Level up"].map((t) => (
                <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/70">{t}</span>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-b from-[#ff6b7a] to-[#d61f3a] px-7 py-4 font-display text-sm font-black shadow-[0_6px_0_#7a0f20,0_18px_40px_-10px_#ff4d5e]">
              <I.swords size={16} /> В БОЙ
              <motion.span variants={{ hover: { x: 6 } }}><I.arrowR size={16} /></motion.span>
            </div>
          </div>
        </motion.button>
      </section>

      {/* INDEX */}
      <section className="relative mx-auto max-w-7xl px-5 py-16">
        <div className="text-xs font-bold uppercase tracking-[.3em] text-teal">Индекс</div>
        <h2 className="mt-2 font-display text-4xl font-black">Все сцены</h2>
        <div className="mt-8 divide-y divide-white/5 border-y border-white/5">
          {ALL_SCENES.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 6) * 0.04, ...SPRING.panel }}
              onClick={() => { sessionStorage.setItem("scrollTo", s.id); nav(`/c/${s.cat.id}`); }}
              className="group flex w-full items-center gap-5 py-4 text-left"
            >
              <span className="w-10 font-mono text-sm text-white/30 transition-colors group-hover:text-white">{s.n}</span>
              <span className="flex-1 font-display text-lg font-bold transition-transform duration-300 group-hover:translate-x-2">{s.title}</span>
              <span className="hidden text-xs text-white/40 sm:block">{s.kind}</span>
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${s.cat.color}1a`, color: s.cat.color }}>{s.cat.title}</span>
              <I.arrowR size={16} className="text-white/20 transition-all group-hover:translate-x-1 group-hover:text-white" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* CODEX CTA */}
      <section className="relative mx-auto max-w-7xl px-5 py-16">
        <div className="relative overflow-hidden rounded-[32px] border border-gold/20 bg-gradient-to-br from-[#2a1d05] via-[#0f1426] to-[#0a1122] p-10 sm:p-14">
          <div className="spin-slow absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-40" style={{ background: "repeating-conic-gradient(#ffc34d33 0 8deg, transparent 8deg 24deg)" }} />
          <div className="relative max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-[.3em] text-gold">Кодекс</div>
            <h2 className="mt-2 font-display text-4xl font-black sm:text-5xl">99% секретов. С лабораториями.</h2>
            <p className="mt-4 text-white/60">Токены кривых и пружин, hit-stop, trauma-shake, каскады, FLIP, частицы, производительность и доступность — с интерактивными стендами, где можно покрутить каждый параметр.</p>
            <motion.button whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => nav("/codex")} className="sheen mt-8 rounded-2xl bg-gradient-to-b from-[#ffd76a] to-[#e8a121] px-7 py-4 font-display text-sm font-bold text-[#3a2200] shadow-[0_6px_0_#9a5f00]">
              ОТКРЫТЬ КОДЕКС
            </motion.button>
          </div>
        </div>
      </section>

      <footer className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-white/5 px-5 py-10 text-xs text-white/35">
        <Logo />
        <span>Думай · Анализируй · Управляй эмоциями · Развивайся</span>
      </footer>
    </div>
  );
}
