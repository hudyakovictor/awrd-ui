import { Knob as XKnobW, hexMix as xHexW } from "../components/controls";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import arena from "../assets/arena.jpg";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import { Roll, Slider, useGhost } from "../components/controls";
import { I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ================================================================
   47 · REGION SWIPE — 5 слоёв параллакса на одном свайпе
   ================================================================ */
const REGIONS = [
  {
    n: "Бычьи холмы",
    sub: "Тренды и импульсы",
    c: "#3ddc84",
    sky: ["#0b2a1f", "#123f2c"],
    m1: "#16452f",
    m2: "#0f3322",
    fx: "leaf",
    prog: 0.8,
  },
  {
    n: "Медвежий каньон",
    sub: "Падения и паника",
    c: "#ff4d5e",
    sky: ["#2a0b12", "#40121c"],
    m1: "#4a1620",
    m2: "#2e0d14",
    fx: "ash",
    prog: 0.35,
  },
  {
    n: "Пустыня боковика",
    sub: "Диапазоны и терпение",
    c: "#ffc34d",
    sky: ["#2a200b", "#40310f"],
    m1: "#4a3a16",
    m2: "#33280e",
    fx: "dust",
    prog: 0.1,
  },
];
const RW = 300;

function RegionLayer({ x, i }: { x: MotionValue<number>; i: number }) {
  const r = REGIONS[i];
  const off = useTransform(x, (v) => v + i * RW);
  const far = useTransform(off, (v) => v * 0.25);
  const mid = useTransform(off, (v) => v * 0.55);
  const near = useTransform(off, (v) => v * 1.2);
  const title = useTransform(off, (v) => v * 0.8);
  const op = useTransform(off, [-RW * 0.8, 0, RW * 0.8], [0, 1, 0]);
  const sunY = useTransform(off, [-RW, 0, RW], [60, 0, 60]);
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ x: off }}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${r.sky[0]}, ${r.sky[1]} 60%, #060a16)`,
        }}
      />
      <motion.div
        className="absolute left-1/2 top-[110px] h-24 w-24 -ml-12 rounded-full"
        style={{
          y: sunY,
          background: `radial-gradient(circle, ${r.c}, ${r.c}00 70%)`,
          x: far,
        }}
      />
      <motion.svg
        viewBox="0 0 400 200"
        className="absolute -left-12 top-[200px] h-[200px] w-[400px]"
        style={{ x: far }}
      >
        <path
          d="M0 200 L0 120 L50 70 L90 110 L150 40 L210 100 L260 60 L320 110 L360 80 L400 120 L400 200 Z"
          fill={r.m2}
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 400 200"
        className="absolute -left-12 top-[260px] h-[200px] w-[400px]"
        style={{ x: mid }}
      >
        <path
          d="M0 200 L0 140 L70 90 L120 130 L190 80 L250 140 L310 100 L400 150 L400 200 Z"
          fill={r.m1}
        />
        <path
          d="M40 150 L80 120 L110 145 L150 115 L190 140"
          fill="none"
          stroke={r.c}
          strokeWidth="3"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 400 140"
        className="absolute -left-12 bottom-0 h-[140px] w-[400px]"
        style={{ x: near }}
      >
        <path
          d="M0 140 L0 70 Q60 40 120 70 T240 60 T400 80 L400 140 Z"
          fill="#070b16"
        />
        {i === 0 &&
          [60, 200, 330].map((tx) => (
            <path key={tx} d={`M${tx} 70 l-12 -30 l24 0 z`} fill="#0d2a1c" />
          ))}
        {i === 1 &&
          [90, 260].map((tx) => (
            <path
              key={tx}
              d={`M${tx} 72 l-20 -40 l10 8 l10 -20 l10 20 l10 -8 z`}
              fill="#2a0d14"
            />
          ))}
        {i === 2 &&
          [120, 300].map((tx) => (
            <path
              key={tx}
              d={`M${tx} 66 v-26 m0 10 h-8 v-8 m8 12 h8 v-10`}
              stroke="#3a2c0d"
              strokeWidth="5"
              fill="none"
            />
          ))}
      </motion.svg>
      <motion.div
        className="absolute inset-x-6 top-[96px] text-center"
        style={{ x: title, opacity: op }}
      >
        <div
          className="text-[10px] font-bold uppercase tracking-[.3em]"
          style={{ color: r.c }}
        >
          Регион {i + 1}
        </div>
        <div
          className="font-display text-2xl font-black"
          style={{ textShadow: `0 0 24px ${r.c}66` }}
        >
          {r.n}
        </div>
        <div className="text-[11px] text-white/55">{r.sub}</div>
      </motion.div>
    </motion.div>
  );
}

export function RegionSwipe({ run, cue }: SceneProps) {
  const x = useMotionValue(0);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const base = useRef(0);
  const g = useGhost();
  const p = useParticles();
  const R = REGIONS[idx];

  const go = (n: number) => {
    const t = Math.max(0, Math.min(REGIONS.length - 1, n));
    if (t !== idxRef.current) sfx.swipe(t > idxRef.current ? 1 : -1);
    idxRef.current = t;
    setIdx(t);
    animate(x, -t * RW, SPRING.panel);
  };

  // погода региона — свой тип частиц
  useEffect(() => {
    const iv = window.setInterval(() => {
      const r = REGIONS[idxRef.current];
      if (r.fx === "leaf")
        p.burst({
          x: Math.random() * 300,
          y: -5,
          count: 1,
          shape: "confetti",
          colors: ["#3ddc84", "#b8ff3d"],
          speed: [20, 60],
          angle: Math.PI / 2,
          spread: 0.8,
          gravity: 40,
          drag: 0.4,
          life: [3, 4],
          size: [2, 3],
        });
      if (r.fx === "ash")
        p.burst({
          x: Math.random() * 300,
          y: 640,
          count: 1,
          shape: "dot",
          colors: ["#ff4d5e", "#ff9a3d"],
          speed: [20, 50],
          angle: -Math.PI / 2,
          spread: 0.6,
          gravity: -30,
          drag: 0.4,
          life: [2.5, 3.5],
          size: [1, 2],
        });
      if (r.fx === "dust")
        p.burst({
          x: -5,
          y: 300 + Math.random() * 300,
          count: 1,
          shape: "dot",
          colors: ["#ffc34d88"],
          speed: [60, 120],
          angle: 0,
          spread: 0.3,
          drag: 0.2,
          life: [3, 4],
          size: [1, 2.5],
        });
    }, 120);
    return () => clearInterval(iv);
  }, [p]);

  useScript(run, async (wait) => {
    x.set(0);
    idxRef.current = 0;
    setIdx(0);
    await wait(700);
    cue();
    g.show(230, 330);
    for (const n of [1, 2]) {
      g.press(true);
      await Promise.all([
        g.move(70, 330, 0.45),
        animate(x, -idxRef.current * RW - 120, { duration: 0.45 }),
      ]);
      g.press(false);
      go(n);
      await wait(1200);
      await g.move(230, 330, 0.2);
    }
    // попытка за край — rubber band
    g.press(true);
    await Promise.all([
      g.move(120, 330, 0.4),
      animate(x, -2 * RW - 40, { duration: 0.4 }),
    ]);
    g.press(false);
    go(2);
    await wait(500);
    await g.move(60, 330, 0.2);
    g.press(true);
    await Promise.all([
      g.move(260, 330, 0.5),
      animate(x, -2 * RW + 150, { duration: 0.5 }),
    ]);
    g.press(false);
    go(0);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#060a16]">
      <motion.div
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        onPanStart={() => {
          base.current = x.get();
        }}
        onPan={(_, i) => {
          let v = base.current + i.offset.x;
          const min = -(REGIONS.length - 1) * RW;
          if (v > 0) v = Math.pow(v, 0.72);
          if (v < min) v = min - Math.pow(min - v, 0.72);
          x.set(v);
        }}
        onPanEnd={(_, i) => {
          const proj = i.offset.x + i.velocity.x * 0.2;
          go(idxRef.current + (proj < -RW / 3 ? 1 : proj > RW / 3 ? -1 : 0));
        }}
      >
        {REGIONS.map((_, i) => (
          <RegionLayer key={i} x={x} i={i} />
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/50">
          Карта мира
        </div>
        <div className="glass rounded-full px-2 py-0.5 text-[10px] font-bold">
          <Roll value={idx + 1} color={R.c} />
          /3
        </div>
      </div>
      <div className="absolute inset-x-5 bottom-24">
        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span className="text-white/60">Прогресс региона</span>
          <Roll value={`${Math.round(R.prog * 100)}%`} color={R.c} />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${R.prog * 100}%`, background: R.c }}
            transition={SPRING.panel}
            style={{ boxShadow: `0 0 10px ${R.c}` }}
          />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-[70px] flex justify-center gap-2">
        {REGIONS.map((r, i) => (
          <motion.button
            key={i}
            onClick={() => go(i)}
            animate={{
              width: i === idx ? 26 : 8,
              background: i === idx ? r.c : "#ffffff44",
            }}
            transition={SPRING.panel}
            className="h-2 rounded-full"
          />
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-5 rounded-2xl py-3 font-display text-sm font-black text-[#051018]"
        animate={{ background: R.c, boxShadow: `0 8px 30px -6px ${R.c}` }}
      >
        ВОЙТИ В РЕГИОН
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   48 · LEVEL PATH — персонаж идёт по тропе, камера следует
   ================================================================ */
const PATH =
  "M150 1080 C60 1020 60 940 150 900 S250 800 150 740 S40 640 150 580 S260 480 150 420 S50 320 150 260 S240 160 150 100";
const NODES = [0.02, 0.15, 0.28, 0.41, 0.54, 0.67, 0.8, 0.93];
const MAP_H = 1140;

export function LevelPath({ run, cue }: SceneProps) {
  const prog = useMotionValue(0.02);
  const pathRef = useRef<SVGPathElement>(null);
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);
  const [reached, setReached] = useState(0);
  const [cam, setCam] = useState(0);
  const g = useGhost();
  const p = useParticles();
  const camY = useMotionValue(0);
  const charX = useMotionValue(150);
  const charY = useMotionValue(1080);
  const baseP = useRef(0);
  const reachedRef = useRef(0);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    setPts(
      NODES.map((f) => {
        const q = el.getPointAtLength(L * f);
        return { x: q.x, y: q.y };
      }),
    );
  }, []);

  useMotionValueEvent(prog, "change", (v) => {
    const el = pathRef.current;
    if (!el) return;
    const L = el.getTotalLength();
    const q = el.getPointAtLength(L * clamp(v));
    charX.set(q.x);
    charY.set(q.y);
    // камера держит персонажа в нижней трети
    const target = Math.min(0, Math.max(-(MAP_H - 624), -(q.y - 400)));
    camY.set(target);
    setCam(Math.round((1 - (q.y - 100) / 980) * 100));
    const r = NODES.filter((f) => v >= f - 0.005).length;
    if (r !== reachedRef.current) {
      if (r > reachedRef.current) {
        sfx.pop(r * 2);
        const n = NODES[r - 1];
        const qq = el.getPointAtLength(L * n);
        p.burst({
          x: qq.x,
          y: qq.y + target,
          count: 20,
          shape: "star",
          colors: ["#b8ff3d", "#fff"],
          speed: [80, 220],
          size: [2, 4],
        });
        if (r === NODES.length) sfx.levelup();
      }
      reachedRef.current = r;
      setReached(r);
    }
  });

  useScript(run, async (wait) => {
    prog.set(0.02);
    reachedRef.current = 1;
    await wait(700);
    cue();
    g.show(24 + 0.02 * 252, 580);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.45 * 252, 580, 1.4),
      animate(prog, 0.45, { duration: 1.4, ease: EASE.camera }),
    ]);
    await wait(300);
    await Promise.all([
      g.move(24 + 0.95 * 252, 580, 1.6),
      animate(prog, 0.95, { duration: 1.6, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(700);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.3 * 252, 580, 0.8),
      animate(prog, 0.3, { duration: 0.8, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
  });

  const dash = useTransform(prog, (v) => `${v * 1300} 3000`);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#08120c]">
      <motion.div
        className="absolute inset-x-0 top-0 touch-none"
        style={{ y: camY, height: MAP_H }}
        onPanStart={() => {
          baseP.current = prog.get();
        }}
        onPan={(_, i) =>
          prog.set(clamp(baseP.current - i.offset.y / 900, 0, 1))
        }
      >
        <div className="absolute inset-0 bg-[radial-gradient(60%_20%_at_30%_80%,#1a3a1f,transparent),radial-gradient(50%_15%_at_70%_40%,#1f3a2a,transparent),linear-gradient(180deg,#0b1a2a,#0a1a10_40%,#08120c)]" />
        {Array.from({ length: 26 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#133222]"
            style={{
              left: ((i * 83) % 280) - 10,
              top: (i * 47) % MAP_H,
              width: 24 + (i % 4) * 10,
              height: 24 + (i % 4) * 10,
              opacity: 0.6,
            }}
          />
        ))}
        <svg
          viewBox={`0 0 300 ${MAP_H}`}
          className="absolute inset-0 h-full w-full"
        >
          <path
            d={PATH}
            fill="none"
            stroke="#ffffff14"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            d={PATH}
            fill="none"
            stroke="#ffffff22"
            strokeWidth="3"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <motion.path
            d={PATH}
            fill="none"
            stroke="#b8ff3d"
            strokeWidth="5"
            strokeLinecap="round"
            style={{
              strokeDasharray: dash,
              filter: "drop-shadow(0 0 6px #b8ff3d)",
            }}
          />
        </svg>
        {pts.map((q, i) => {
          const ok = i < reached;
          const boss = i === NODES.length - 1;
          return (
            <motion.div
              key={i}
              className="absolute -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-2xl border-2 font-display text-sm font-black"
              style={{ left: q.x, top: q.y }}
              initial={false}
              animate={
                ok
                  ? {
                      scale: [1.35, 1],
                      borderColor: boss ? "#ff4d5e" : "#b8ff3d",
                      background: boss ? "#3a0a14" : "#1f3a10",
                      color: "#fff",
                    }
                  : {
                      scale: 1,
                      borderColor: "#ffffff22",
                      background: "#0c1428",
                      color: "#ffffff55",
                    }
              }
              transition={{ duration: 0.4, ease: EASE.overshoot }}
            >
              {boss ? (
                <I.swords size={18} />
              ) : ok ? (
                i + 1
              ) : (
                <I.lock size={14} />
              )}
              {ok && !boss && (
                <div className="absolute -bottom-3 flex gap-0.5">
                  {[0, 1, 2].map((s) => (
                    <motion.svg
                      key={s}
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 + s * 0.06, ...SPRING.reward }}
                    >
                      <path
                        d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z"
                        fill={s < 2 + (i % 2) ? "#ffc34d" : "#ffffff33"}
                      />
                    </motion.svg>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
        {/* character */}
        <motion.div
          className="absolute z-10 -ml-6 -mt-14 h-12 w-12"
          style={{ left: charX, top: charY }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="h-12 w-12 overflow-hidden rounded-full border-[3px] border-[#b8ff3d] shadow-[0_0_20px_#b8ff3d]"
          >
            <img
              src={hood}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </motion.div>
          <div className="mx-auto mt-0.5 h-2 w-8 rounded-full bg-black/50 blur-[2px]" />
        </motion.div>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="glass rounded-full px-3 py-1 text-[10px] font-bold">
          Бычьи холмы
        </div>
        <div className="glass rounded-full px-3 py-1 text-[10px] font-bold">
          <Roll value={Math.max(0, reached)} color="#b8ff3d" />/{NODES.length}
        </div>
      </div>
      <div className="absolute inset-x-6 bottom-5 rounded-2xl bg-[#060a16]/80 p-3 backdrop-blur">
        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span className="text-white/55">Путь</span>
          <span className="font-mono text-[#b8ff3d]">{cam}%</span>
        </div>
        <Slider
          mv={prog}
          color="#b8ff3d"
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   49 · ZOOM DIVE — слайдер зума: мир → регион → арена
   ================================================================ */
const CRUMB = ["Мир", "Регион", "Город", "Арена"];

export function ZoomDive({ run, cue }: SceneProps) {
  const z = useMotionValue(0);
  const [lvl, setLvl] = useState(0);
  const g = useGhost();
  const p = useParticles();
  const lvlRef = useRef(0);
  // Слой мира
  const wS = useTransform(z, [0, 0.33], [1, 7]);
  const wO = useTransform(z, [0.2, 0.33], [1, 0]);
  const wR = useTransform(z, [0, 0.33], [0, 40]);
  // Регион
  const rS = useTransform(z, [0.18, 0.33, 0.66], [0.25, 1, 7]);
  const rO = useTransform(z, [0.18, 0.28, 0.55, 0.66], [0, 1, 1, 0]);
  // Город
  const cS = useTransform(z, [0.5, 0.66, 1], [0.25, 1, 6]);
  const cO = useTransform(z, [0.5, 0.6, 0.88, 0.97], [0, 1, 1, 0]);
  // Арена
  const aS = useTransform(z, [0.85, 1], [0.4, 1]);
  const aO = useTransform(z, [0.85, 0.97], [0, 1]);
  const blur = useTransform(z, (v) => {
    const d = Math.min(...[0.33, 0.66, 0.97].map((b) => Math.abs(v - b)));
    return `blur(${Math.max(0, 3 - d * 40)}px)`;
  });

  useMotionValueEvent(z, "change", (v) => {
    const l = v < 0.25 ? 0 : v < 0.58 ? 1 : v < 0.9 ? 2 : 3;
    if (l !== lvlRef.current) {
      lvlRef.current = l;
      setLvl(l);
      sfx.whoosh(0.3);
      if (l === 3) {
        sfx.impact();
        p.ring(150, 280, "#b8ff3d", 160, 0.6, 8);
      }
    }
  });

  const stepTo = (l: number) =>
    animate(z, [0, 0.4, 0.72, 1][l], { duration: 0.9, ease: EASE.camera });

  useScript(run, async (wait) => {
    z.set(0);
    await wait(600);
    cue();
    g.show(24, 520);
    g.press(true);
    for (const t of [0.4, 0.72, 1]) {
      await Promise.all([
        g.move(24 + t * 252, 520, 1),
        animate(z, t, { duration: 1, ease: EASE.camera }),
      ]);
      await wait(500);
    }
    await Promise.all([
      g.move(24, 520, 1.2),
      animate(z, 0, { duration: 1.2, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050811]">
      <SceneBg tint="#b8ff3d" />
      <motion.div className="absolute inset-0" style={{ filter: blur }}>
        {/* WORLD */}
        <motion.div
          className="absolute left-1/2 top-[280px] h-[220px] w-[220px] -ml-[110px] -mt-[110px]"
          style={{ scale: wS, opacity: wO, rotate: wR }}
        >
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,#1f4a6a,#0a1a2a_70%)] shadow-[0_0_60px_#4cc3ff44,inset_-20px_-20px_40px_#000]" />
          <svg viewBox="0 0 220 220" className="absolute inset-0">
            <path
              d="M40 80 Q60 60 90 70 T130 90 Q120 110 90 105 T50 110 Z"
              fill="#2a6a3a"
            />
            <path
              d="M120 130 Q150 120 170 140 T160 175 Q130 180 125 160 Z"
              fill="#6a2a2a"
            />
            <path
              d="M60 140 Q80 135 95 150 T80 175 Q60 170 58 155 Z"
              fill="#6a5a2a"
            />
            <circle cx="72" cy="85" r="5" fill="#b8ff3d">
              <animate
                attributeName="r"
                values="4;8;4"
                dur="1.2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </motion.div>
        {/* REGION */}
        <motion.div
          className="absolute left-1/2 top-[280px] h-[260px] w-[260px] -ml-[130px] -mt-[130px] overflow-hidden rounded-3xl border border-[#b8ff3d]/30"
          style={{ scale: rS, opacity: rO }}
        >
          <div className="absolute inset-0 bg-[#123a1f]" />
          <svg viewBox="0 0 260 260" className="absolute inset-0">
            <path
              d="M0 180 Q60 150 120 170 T260 150 V260 H0 Z"
              fill="#0d2a16"
            />
            <path
              d="M20 40 Q80 80 130 120 T240 200"
              fill="none"
              stroke="#2a5a3a"
              strokeWidth="10"
            />
            {[
              [60, 70],
              [180, 90],
              [100, 200],
            ].map(([x, y], i) => (
              <rect
                key={i}
                x={x - 12}
                y={y - 12}
                width="24"
                height="24"
                rx="4"
                fill="#1f4a2a"
                stroke="#3ddc84"
              />
            ))}
            <circle cx="130" cy="120" r="10" fill="#b8ff3d" />
          </svg>
        </motion.div>
        {/* CITY */}
        <motion.div
          className="absolute left-1/2 top-[280px] h-[240px] w-[240px] -ml-[120px] -mt-[120px] overflow-hidden rounded-3xl border border-[#b8ff3d]/30 bg-[#0c1428]"
          style={{ scale: cS, opacity: cO }}
        >
          <div className="grid h-full grid-cols-6 gap-1 p-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{
                  background:
                    i === 14
                      ? "#b8ff3d"
                      : `hsl(220, 30%, ${12 + ((i * 7) % 12)}%)`,
                  boxShadow: i === 14 ? "0 0 16px #b8ff3d" : "none",
                }}
              />
            ))}
          </div>
        </motion.div>
        {/* ARENA */}
        <motion.div
          className="absolute left-1/2 top-[280px] h-[300px] w-[270px] -ml-[135px] -mt-[150px] overflow-hidden rounded-3xl border-2 border-[#b8ff3d]"
          style={{ scale: aS, opacity: aO }}
        >
          <img
            src={arena}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a16] to-transparent" />
          <div className="absolute inset-x-0 bottom-4 text-center">
            <div className="font-display text-xl font-black">
              Арена «Импульс»
            </div>
            <div className="text-[10px] text-white/60">
              Босс: FOMO · 5 сценариев
            </div>
          </div>
        </motion.div>
      </motion.div>
      <div className="absolute inset-x-4 top-11 flex justify-center gap-1">
        {CRUMB.map((c, i) => (
          <motion.button
            key={c}
            onClick={() => stepTo(i)}
            className="rounded-full px-2.5 py-1 text-[10px] font-bold"
            animate={{
              background:
                i === lvl ? "#b8ff3d" : i < lvl ? "#b8ff3d22" : "#ffffff0d",
              color: i === lvl ? "#0a1a05" : i < lvl ? "#b8ff3d" : "#ffffff66",
            }}
            transition={{ duration: 0.25 }}
          >
            {c}
          </motion.button>
        ))}
      </div>
      <div className="absolute inset-x-6 top-[500px]">
        <Slider
          mv={z}
          color="#b8ff3d"
          format={(v) => `x${(1 + v * 99).toFixed(0)}`}
        />
        <div className="mt-2 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => stepTo(Math.max(0, lvl - 1))}
            className="glass grid h-9 w-9 place-items-center rounded-full text-lg font-bold"
          >
            −
          </motion.button>
          <AnimatePresence mode="wait">
            <motion.div
              key={lvl}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-[11px] font-bold text-white/70"
            >
              {
                ["Весь рынок", "Бычьи холмы", "Город трендов", "Арена открыта"][
                  lvl
                ]
              }
            </motion.div>
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => stepTo(Math.min(3, lvl + 1))}
            className="glass grid h-9 w-9 place-items-center rounded-full text-lg font-bold"
          >
            +
          </motion.button>
        </div>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   88 · SKY DIAL — ручка времени суток меняет небо над регионом
   ================================================================ */
export function SkyDial({ run, cue }: SceneProps) {
  const t = useMotionValue(0.35);
  const [tv, setTv] = useState(0.35);
  const g = useGhost();
  useMotionValueEvent(t, "change", setTv);
  const day = clamp(Math.sin((tv - 0.25) * 2 * Math.PI) * 0.7 + 0.5);
  const sky = xHexW("#050814", "#1e5a8a", day);
  const horizon = xHexW(
    "#0a1022",
    "#f0a050",
    clamp(1 - Math.abs(day - 0.45) * 3),
  );
  const sunP = (tv - 0.25) / 0.5;
  const sunVis = sunP > -0.05 && sunP < 1.05;
  const sunX = 20 + sunP * 260;
  const sunY = 250 - Math.sin(clamp(sunP) * Math.PI) * 170;
  const moonP = (((tv + 0.5) % 1) - 0.25) / 0.5;
  const moonX = 20 + moonP * 260;
  const moonY = 250 - Math.sin(clamp(moonP) * Math.PI) * 150;
  const hh = Math.floor(tv * 24) % 24;
  const mm = Math.floor((tv * 24 * 60) % 60);
  useScript(run, async (wait) => {
    t.set(0.35);
    await wait(600);
    cue();
    g.show(150, 480);
    g.press(true);
    await animate(t, 0.95, { duration: 2.4, ease: "linear" });
    await animate(t, 0.5, { duration: 1.2, ease: EASE.camera });
    g.press(false);
    g.hide();
  });
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${sky}, ${horizon} 62%, #060a16 63%)`,
      }}
    >
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute h-0.5 w-0.5 rounded-full bg-white"
          style={{
            left: (i * 97) % 300,
            top: 40 + ((i * 53) % 220),
            opacity: (1 - day) * (0.4 + (i % 3) * 0.2),
          }}
        />
      ))}
      {sunVis && (
        <div
          className="absolute h-14 w-14 -ml-7 -mt-7 rounded-full"
          style={{
            left: sunX,
            top: sunY,
            background:
              "radial-gradient(circle, #fff6cc, #ffc34d 45%, #ffc34d00 70%)",
            boxShadow: "0 0 60px #ffc34d88",
          }}
        />
      )}
      {moonP > -0.05 && moonP < 1.05 && (
        <div
          className="absolute h-9 w-9 -ml-[18px] -mt-[18px] rounded-full bg-[#e6ecff]"
          style={{
            left: moonX,
            top: moonY,
            boxShadow: "0 0 30px #e6ecff66",
            opacity: 1 - day,
          }}
        />
      )}
      <svg
        viewBox="0 0 300 120"
        className="absolute inset-x-0 top-[270px] h-[120px] w-full"
      >
        <path
          d="M0 120 L0 60 L40 30 L80 55 L130 15 L180 50 L230 25 L300 60 L300 120 Z"
          fill={xHexW("#0a1a10", "#1f5a2f", day)}
        />
        {[
          [60, 80],
          [150, 70],
          [240, 85],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 12} y={y - 18} width="24" height="30" fill="#0a0f1a" />
            {[0, 1].map((w) => (
              <rect
                key={w}
                x={x - 8 + w * 10}
                y={y - 12}
                width="5"
                height="6"
                fill="#ffc34d"
                opacity={day < 0.4 ? 1 : 0.1}
                style={{
                  filter: day < 0.4 ? "drop-shadow(0 0 4px #ffc34d)" : "none",
                }}
              />
            ))}
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Время региона</div>
        <div className="font-mono text-base font-black">
          <Roll
            value={`${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`}
          />
        </div>
      </div>
      <div className="absolute inset-x-0 top-[400px] flex justify-center">
        <XKnobW
          mv={t}
          size={130}
          color={day > 0.5 ? "#ffc34d" : "#9b7bff"}
          steps={48}
          label={
            day > 0.55
              ? "День · активная торговля"
              : day > 0.3
                ? "Сумерки · волатильность"
                : "Ночь · низкая ликвидность"
          }
        />
      </div>
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_WORLD: Category = {
  id: "world",
  n: "15",
  title: "Карта мира",
  en: "Parallax regions · Level path · Zoom dive",
  color: "#b8ff3d",
  blurb:
    "Навигация по миру игры как аттракцион: регионы с пятью слоями параллакса, тропа уровней, по которой идёт персонаж, и бесшовный зум от глобуса до арены.",
  scenes: [
    {
      id: "regions",
      n: "47",
      title: "Свайп регионов",
      kind: "Parallax pager",
      lead: "Три региона листаются свайпом. Небо, солнце, дальние горы, ближние горы, передний план и заголовок двигаются с разной скоростью от одного жеста. У каждого региона своя погода — листья, пепел, пыль. На краях работает резиновое сопротивление.",
      secrets: [
        "Пять коэффициентов глубины от одного x: солнце ×0.25, дальние ×0.25, средние ×0.55, передний план ×1.2 (быстрее экрана!), заголовок ×0.8.",
        "Передний план движется быстрее самой страницы — это даёт ощущение, что камера ближе к земле.",
        "Солнце «заходит» при уходе страницы: y 0 → 60 от смещения. Небесное тело реагирует на жест.",
        "Погода — одна частица каждые 120мс, тип зависит от текущего региона (ref, а не стейт — без перезапуска интервала).",
        "Rubber-band x^0.72 на краях: мир можно «потянуть», но не сломать.",
      ],
      tracks: [
        { label: "Свайп → Каньон", start: 700, dur: 450, color: "#ff4d5e" },
        { label: "Снэп", start: 1150, dur: 600, color: "#ff4d5e" },
        { label: "Свайп → Пустыня", start: 2550, dur: 450, color: "#ffc34d" },
        { label: "Rubber-band край", start: 4400, dur: 700, color: "#ffffff" },
        { label: "Флик к началу", start: 5300, dur: 800, color: "#3ddc84" },
      ],
      total: 6300,
      ease: { bez: EASE.camera, label: "≈ spring снэпа" },
      code: `const off  = useTransform(x, v => v + i * RW);
const far  = useTransform(off, v => v * .25);
const mid  = useTransform(off, v => v * .55);
const near = useTransform(off, v => v * 1.2);   // быстрее страницы
const sunY = useTransform(off, [-RW, 0, RW], [60, 0, 60]);`,
      C: RegionSwipe,
      interactive: "Свайпай регионы",
    },
    {
      id: "levelpath",
      n: "48",
      title: "Тропа уровней",
      kind: "Path follower",
      lead: "Слайдер или вертикальный жест ведёт персонажа по извилистой тропе. Пройденная часть заливается светом, камера держит героя в кадре, узлы раскрываются по мере прохождения — со звёздами и искрами. Последний узел — босс, его достижение звучит фанфарами.",
      secrets: [
        "Позиция героя — getPointAtLength(L × progress) на реальном SVG-пути. Кривая тропы — единственный источник правды для героя, света и узлов.",
        "Свет пути — strokeDasharray от прогресса: заливка идёт ровно до героя.",
        "Камера — clamp(−(y − 400)): герой всегда в нижней трети, откуда виден путь вперёд.",
        "Узлы открываются по порогу и закрываются при движении назад — время обратимо, фанфары только вперёд.",
        "Герой подпрыгивает бесконечной анимацией y [0, −5, 0] — он идёт, а не едет.",
      ],
      tracks: [
        { label: "Путь → 45%", start: 700, dur: 1400, color: "#b8ff3d" },
        { label: "Узлы 2-4", start: 900, dur: 1200, color: "#ffc34d" },
        { label: "Путь → 95%", start: 2400, dur: 1600, color: "#b8ff3d" },
        { label: "Босс-узел", start: 3800, dur: 600, color: "#ff4d5e" },
        { label: "Откат к 30%", start: 4700, dur: 800, color: "#ffffff" },
      ],
      total: 5700,
      ease: { bez: EASE.camera, label: "camera — прогулка" },
      code: `useMotionValueEvent(prog, "change", v => {
  const q = pathEl.getPointAtLength(L * v);
  charX.set(q.x); charY.set(q.y);
  camY.set(clamp(-(q.y - 400), -(MAP_H - 624), 0));
});
const dash = useTransform(prog, v => \`\${v * 1300} 3000\`);
<motion.path d={PATH} style={{ strokeDasharray: dash }} />`,
      C: LevelPath,
      interactive: "Тяни слайдер или карту",
    },
    {
      id: "zoomdive",
      n: "49",
      title: "Бесшовный зум",
      kind: "Semantic zoom",
      lead: "Один слайдер ведёт камеру с глобуса в регион, затем в город и на арену. Каждый слой масштабируется и растворяется в своём окне, на стыках появляется моушн-блюр, хлебные крошки подсвечивают текущий уровень, кнопки ± прыгают на соседний уровень.",
      secrets: [
        "Четыре слоя = четыре окна диапазонов: мир [0–0.33], регион [0.18–0.66], город [0.5–0.97], арена [0.85–1]. Окна перекрываются — переход без разрыва.",
        "Входящий слой начинает с scale 0.25 внутри уходящего, уходящий улетает до ×7: камера «проходит сквозь» точку интереса.",
        "Блюр — функция расстояния до ближайшей границы: blur(3 − d·40). Размытие только в моменты перехода.",
        "Глобус ещё и поворачивается на 40° при зуме — движение по двум осям продаёт скорость.",
        "Кнопки ± анимируют тот же MotionValue кривой camera — слайдер едет сам.",
      ],
      tracks: [
        { label: "Мир → Регион", start: 600, dur: 1000, color: "#4cc3ff" },
        { label: "Регион → Город", start: 2100, dur: 1000, color: "#3ddc84" },
        { label: "Город → Арена", start: 3600, dur: 1000, color: "#b8ff3d" },
        { label: "Удар + кольцо", start: 4500, dur: 600, color: "#b8ff3d" },
        { label: "Отъезд", start: 5100, dur: 1200, color: "#ffffff" },
      ],
      total: 6400,
      ease: { bez: EASE.camera, label: "camera — зум" },
      code: `const wS = useTransform(z, [0, .33], [1, 7]);
const wO = useTransform(z, [.2, .33], [1, 0]);
const rS = useTransform(z, [.18, .33, .66], [.25, 1, 7]);
const rO = useTransform(z, [.18, .28, .55, .66], [0, 1, 1, 0]);
const blur = useTransform(z, v =>
  \`blur(\${Math.max(0, 3 - minDist(v, [.33, .66, .97]) * 40)}px)\`);`,
      C: ZoomDive,
      interactive: "Тяни зум или жми ±",
    },
    {
      id: "skydial",
      n: "88",
      title: "Циферблат суток",
      kind: "Rotary time",
      lead: "Поворотная ручка прокручивает сутки над регионом: небо перетекает от ночи к дню, солнце и луна идут по дугам, горизонт розовеет на закате, звёзды гаснут днём, окна домов загораются ночью. Подпись объясняет, как время влияет на рынок.",
      secrets: [
        "Освещённость = sin((t − 0.25)·2π): одна функция управляет небом, звёздами, окнами, цветом гор.",
        "Закатное свечение горизонта — пик около освещённости 0.45: цвет появляется только в сумерках.",
        "Солнце и луна — одна дуга со сдвигом фазы на полсуток: небесная механика в двух строках.",
        "Ручка с 48 делениями — получасовые шаги, каждый слышно.",
        "Время суток привязано к смыслу (ликвидность, волатильность) — атмосфера работает на обучение.",
      ],
      tracks: [
        { label: "08:24 → 22:48", start: 600, dur: 2400, color: "#ffc34d" },
        { label: "Закат", start: 1500, dur: 700, color: "#ff8a3d" },
        { label: "Ночь: окна", start: 2300, dur: 700, color: "#9b7bff" },
        {
          label: "Возврат к полудню",
          start: 3000,
          dur: 1200,
          color: "#4cc3ff",
        },
      ],
      total: 4400,
      ease: { bez: EASE.camera, label: "camera — возврат" },
      code: `const day = clamp(Math.sin((t - .25) * 2 * Math.PI) * .7 + .5);
const sky = hexMix("#050814", "#1e5a8a", day);
const sunX = 20 + p * 260, sunY = 250 - Math.sin(p * Math.PI) * 170;
<rect fill="#ffc34d" opacity={day < .4 ? 1 : .1} />      // окна ночью`,
      C: SkyDial,
      interactive: "Крути ручку времени",
    },
  ],
};
