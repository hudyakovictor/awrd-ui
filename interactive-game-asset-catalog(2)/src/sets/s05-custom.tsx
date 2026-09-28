import {
  animate,
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import { Carousel, Roll, Slider, useGhost } from "../components/controls";
import { I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ================================================================
   44 · AVATAR SPIN — крути карточку пальцем, инерция + снэп к грани
   ================================================================ */
export function AvatarSpin({ run, cue }: SceneProps) {
  const rot = useMotionValue(0);
  const vel = useVelocity(rot);
  const speed = useSpring(
    useTransform(vel, (v) => Math.min(1, Math.abs(v) / 900)),
    { stiffness: 200, damping: 30 },
  );
  const base = useRef(0);
  const [face, setFace] = useState<"front" | "back">("front");
  const [deg, setDeg] = useState(0);
  const g = useGhost();
  const p = useParticles();
  // блик скользит по карточке в зависимости от угла
  const shineX = useTransform(
    rot,
    (r) => `${50 + Math.sin((r * Math.PI) / 180) * 60}%`,
  );
  const shine = useMotionTemplate`linear-gradient(105deg, transparent 30%, rgba(255,255,255,.35) ${shineX}, transparent 70%)`;
  const shadowX = useTransform(rot, (r) => Math.sin((r * Math.PI) / 180) * -30);
  const shadowS = useTransform(
    rot,
    (r) => 0.6 + Math.abs(Math.cos((r * Math.PI) / 180)) * 0.4,
  );
  const linesOp = useTransform(speed, [0.2, 1], [0, 0.8]);
  const lastFace = useRef<"front" | "back">("front");

  useMotionValueEvent(rot, "change", (r) => {
    const n = ((r % 360) + 360) % 360;
    setDeg(Math.round(n));
    const f = n > 90 && n < 270 ? "back" : "front";
    if (f !== lastFace.current) {
      lastFace.current = f;
      setFace(f);
      sfx.spinTick(f === "back" ? 1 : 0);
    }
  });

  const release = (v: number) => {
    // проекция по скорости → ближайшая грань (кратно 180)
    const proj = rot.get() + v * 0.35;
    const target = Math.round(proj / 180) * 180;
    animate(rot, target, {
      type: "spring",
      stiffness: 120,
      damping: 16,
      velocity: v,
    });
    if (Math.abs(v) > 800) {
      sfx.whoosh(0.4);
      p.burst({
        x: 150,
        y: 230,
        count: 24,
        colors: ["#ff6bd6", "#fff"],
        speed: [150, 380],
      });
    }
    window.setTimeout(() => sfx.snap(), 450);
  };

  useScript(run, async (wait) => {
    rot.set(0);
    await wait(500);
    cue();
    // медленный доворот → отпускание (возврат к фронту)
    g.show(150, 250);
    g.press(true);
    await Promise.all([
      g.move(210, 250, 0.6),
      animate(rot, 70, { duration: 0.6 }),
    ]);
    g.press(false);
    release(0);
    await wait(900);
    // резкий флик → множественные обороты и снэп
    g.press(true);
    await g.move(230, 250, 0.2);
    await Promise.all([
      g.move(60, 250, 0.18),
      animate(rot, -60, { duration: 0.18, ease: "linear" }),
    ]);
    g.press(false);
    release(-2400);
    await wait(1600);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff6bd6" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Твой аватар</div>
        <div className="font-mono text-[10px] text-white/50">
          <Roll value={`${deg}°`} />
        </div>
      </div>
      {/* speed lines */}
      <motion.svg
        viewBox="0 0 300 400"
        className="pointer-events-none absolute inset-x-0 top-[60px] h-[400px] w-full"
        style={{ opacity: linesOp }}
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <line
            key={i}
            x1={i % 2 ? 10 : 230}
            x2={i % 2 ? 70 : 290}
            y1={60 + i * 22}
            y2={60 + i * 22}
            stroke="#ff6bd6"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={0.3 + (i % 3) * 0.2}
          />
        ))}
      </motion.svg>
      <motion.div
        className="absolute left-1/2 top-[110px] -ml-[95px] h-[260px] w-[190px] cursor-grab touch-none active:cursor-grabbing"
        style={{ perspective: 900 }}
        onPanStart={() => {
          base.current = rot.get();
          rot.stop();
          sfx.tap();
        }}
        onPan={(_, i) => rot.set(base.current + i.offset.x * 0.9)}
        onPanEnd={(_, i) => release(i.velocity.x * 0.9)}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ rotateY: rot, transformStyle: "preserve-3d" }}
        >
          {/* FRONT */}
          <div
            className="absolute inset-0 overflow-hidden rounded-3xl p-[3px]"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(150deg,#ffb8ec,#ff6bd6 40%,#5a1452 70%,#ff9be6)",
            }}
          >
            <div className="relative h-full overflow-hidden rounded-[21px] bg-[#1a0a1c]">
              <img
                src={hood}
                className="mask-bottom h-[190px] w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-x-0 bottom-4 text-center">
                <div className="text-[9px] font-bold tracking-[.3em] text-[#ff9be6]">
                  УРОВЕНЬ 12
                </div>
                <div className="font-display text-lg font-black">
                  SignalRider
                </div>
              </div>
              <motion.div
                className="absolute inset-0"
                style={{ background: shine }}
              />
            </div>
          </div>
          {/* BACK */}
          <div
            className="absolute inset-0 overflow-hidden rounded-3xl border-[3px] border-[#ff6bd6]/70 bg-[radial-gradient(circle_at_50%_30%,#4a1440,#12060f)] p-4"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center text-[9px] font-bold tracking-[.3em] text-[#ff9be6]">
              ПРОФИЛЬ
            </div>
            <div className="mt-3 space-y-2.5">
              {[
                ["Решений", 124],
                ["Точность", 68],
                ["Лучшее комбо", 11],
                ["Побед над боссами", 7],
              ].map(([l, v], i) => (
                <div
                  key={i}
                  className="flex justify-between border-b border-white/10 pb-1.5 text-[11px]"
                >
                  <span className="text-white/55">{l}</span>
                  <span className="font-display font-black">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-1.5">
              {["#ffc34d", "#3ddc84", "#4cc3ff", "#9b7bff"].map((c) => (
                <div
                  key={c}
                  className="grid h-7 w-7 place-items-center rounded-full border-2"
                  style={{ borderColor: c, color: c }}
                >
                  <I.trophy size={12} />
                </div>
              ))}
            </div>
            <motion.div
              className="absolute inset-0"
              style={{ background: shine }}
            />
          </div>
        </motion.div>
        <motion.div
          className="absolute -bottom-8 left-1/2 h-6 w-40 -ml-20 rounded-full bg-black/60 blur-lg"
          style={{ x: shadowX, scaleX: shadowS }}
        />
      </motion.div>
      <div className="absolute inset-x-0 top-[410px] flex justify-center gap-2">
        {(["front", "back"] as const).map((f) => (
          <motion.button
            key={f}
            onClick={() =>
              animate(
                rot,
                Math.round(rot.get() / 360) * 360 + (f === "back" ? 180 : 0),
                { type: "spring", stiffness: 120, damping: 16 },
              )
            }
            className="rounded-full px-3 py-1.5 text-[10px] font-bold"
            animate={{
              background: face === f ? "#ff6bd6" : "#ffffff10",
              color: face === f ? "#1a0a1c" : "#ffffffaa",
            }}
            whileTap={{ scale: 0.92 }}
          >
            {f === "front" ? "Лицо" : "Статистика"}
          </motion.button>
        ))}
      </div>
      <div className="absolute inset-x-6 top-[460px] text-center text-[10px] text-white/40">
        Крути пальцем. Сильный флик — несколько оборотов с инерцией и снэп к
        ближайшей грани.
      </div>
      <div className="absolute inset-x-6 bottom-8">
        <div className="mb-1 text-[9px] font-bold text-white/40">
          Скорость вращения
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full origin-left rounded-full bg-[#ff6bd6]"
            style={{ scaleX: speed, boxShadow: "0 0 10px #ff6bd6" }}
          />
        </div>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   45 · HUE FORGE — слайдеры цвета + шторка «до/после»
   ================================================================ */
const PRESETS = [
  { n: "Ориг.", h: 0, gl: 0.3 },
  { n: "Лёд", h: 170, gl: 0.6 },
  { n: "Пламя", h: 300, gl: 0.8 },
  { n: "Золото", h: 40, gl: 0.7 },
  { n: "Пустота", h: 220, gl: 0.9 },
];

export function HueForge({ run, cue }: SceneProps) {
  const hue = useMotionValue(0);
  const glow = useMotionValue(0.3);
  const split = useMotionValue(0.5);
  const [preset, setPreset] = useState(0);
  const [saved, setSaved] = useState(false);
  const g = useGhost();
  const p = useParticles();
  const splitBase = useRef(0);
  const W = 220;
  const hueDeg = useTransform(hue, (v) => v * 360);
  const filter = useMotionTemplate`hue-rotate(${hueDeg}deg) saturate(1.3)`;
  const auraCol = useTransform(
    [hue, glow],
    ([h, gl]: number[]) =>
      `radial-gradient(closest-side, hsla(${130 + h * 360}, 90%, 60%, ${gl * 0.7}), transparent)`,
  );
  const ringCol = useTransform(hue, (h) => `hsl(${130 + h * 360}, 90%, 60%)`);
  const clip = useTransform(split, (s) => `inset(0 0 0 ${s * 100}%)`);
  const divX = useTransform(split, (s) => s * W);

  // частицы ауры — цвет берётся из текущего hue
  useEffect(() => {
    const iv = window.setInterval(() => {
      const gl = glow.get();
      if (Math.random() > gl) return;
      const a = Math.random() * Math.PI * 2;
      p.burst({
        x: 150 + Math.cos(a) * 90,
        y: 210 + Math.sin(a) * 100,
        count: 1,
        shape: "dot",
        colors: [`hsl(${130 + hue.get() * 360}, 90%, 65%)`],
        speed: [10, 30],
        gravity: -60,
        life: [0.8, 1.4],
        size: [1.5, 3],
      });
    }, 70);
    return () => clearInterval(iv);
  }, [glow, hue, p]);

  const applyPreset = (k: number) => {
    setPreset(k);
    setSaved(false);
    sfx.pop(k * 2);
    animate(hue, PRESETS[k].h / 360, {
      type: "spring",
      stiffness: 120,
      damping: 20,
    });
    animate(glow, PRESETS[k].gl, {
      type: "spring",
      stiffness: 120,
      damping: 20,
    });
  };
  const save = () => {
    setSaved(true);
    sfx.success();
    p.ring(150, 210, "#fff", 140, 0.6, 8);
    p.burst({
      x: 150,
      y: 210,
      count: 40,
      shape: "star",
      colors: ["#fff", "#ff6bd6"],
      speed: [120, 340],
      size: [2, 5],
    });
  };

  useScript(run, async (wait) => {
    hue.set(0);
    glow.set(0.3);
    split.set(0.5);
    setSaved(false);
    setPreset(0);
    await wait(500);
    cue();
    // шторка до/после
    g.show(40 + 0.5 * W, 220);
    g.press(true);
    await Promise.all([
      g.move(40 + 0.15 * W, 220, 0.5),
      animate(split, 0.15, { duration: 0.5, ease: EASE.camera }),
    ]);
    // крутим hue при открытой шторке — видно сравнение
    g.press(false);
    await g.move(24 + 0, 410, 0.4);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.8 * 252, 410, 1.1),
      animate(hue, 0.8, { duration: 1.1, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(200);
    await g.move(40 + 0.15 * W, 220, 0.4);
    g.press(true);
    await Promise.all([
      g.move(40 + 0.85 * W, 220, 0.6),
      animate(split, 0.85, { duration: 0.6, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
    for (const k of [1, 3]) {
      applyPreset(k);
      await wait(800);
    }
    save();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff6bd6" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Кузница цвета</div>
        <div className="text-[10px] text-white/45">до / после</div>
      </div>
      <motion.div
        className="absolute left-1/2 top-[210px] h-[300px] w-[300px] -ml-[150px] -mt-[150px]"
        style={{ background: auraCol }}
      />
      {/* compare */}
      <div
        className="absolute left-[40px] top-[90px] h-[240px] overflow-hidden rounded-3xl border-2 border-white/10"
        style={{ width: W }}
      >
        <img
          src={hood}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <motion.img
            src={hood}
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter }}
            draggable={false}
          />
          <motion.div
            className="absolute inset-0 border-[3px]"
            style={{ borderColor: ringCol }}
          />
        </motion.div>
        <div className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold">
          ДО
        </div>
        <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold">
          ПОСЛЕ
        </div>
        <motion.div
          className="absolute inset-y-0 -ml-5 w-10 cursor-ew-resize touch-none"
          style={{ x: divX }}
          onPanStart={() => {
            splitBase.current = split.get();
            sfx.tap();
          }}
          onPan={(_, i) =>
            split.set(clamp(splitBase.current + i.offset.x / W, 0.02, 0.98))
          }
        >
          <div className="absolute inset-y-0 left-1/2 w-0.5 -ml-px bg-white shadow-[0_0_10px_#fff]" />
          <div className="absolute left-1/2 top-1/2 grid h-8 w-8 -ml-4 -mt-4 place-items-center rounded-full bg-white text-black shadow-lg">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
            </svg>
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-x-4 top-[344px] flex justify-center gap-1.5">
        {PRESETS.map((pr, k) => (
          <motion.button
            key={pr.n}
            onClick={() => applyPreset(k)}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: preset === k ? 1.1 : 1,
              borderColor: preset === k ? "#ffffff" : "#ffffff22",
            }}
            className="flex flex-col items-center gap-1 rounded-xl border-2 p-1"
          >
            <span
              className="h-7 w-7 rounded-lg"
              style={{
                background: `hsl(${130 + pr.h}, 85%, 55%)`,
                boxShadow: `0 0 ${pr.gl * 16}px hsl(${130 + pr.h}, 85%, 55%)`,
              }}
            />
            <span className="text-[8px] font-bold text-white/60">{pr.n}</span>
          </motion.button>
        ))}
      </div>
      <div className="absolute inset-x-6 top-[396px] space-y-2">
        <Slider
          mv={hue}
          label="Оттенок"
          gradient="linear-gradient(90deg,hsl(130,90%,55%),hsl(220,90%,60%),hsl(310,90%,60%),hsl(40,90%,55%),hsl(130,90%,55%))"
          color="#ffffff"
          format={(v) => `${Math.round(v * 360)}°`}
          onStart={() => setSaved(false)}
        />
        <Slider
          mv={glow}
          label="Свечение ауры"
          color="#ff6bd6"
          onStart={() => setSaved(false)}
        />
      </div>
      <motion.button
        onClick={save}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 flex items-center justify-center gap-2 overflow-hidden rounded-2xl py-3 font-display text-sm font-black"
        animate={{
          background: saved ? "#3ddc84" : "#ff6bd6",
          color: "#1a0a1c",
        }}
        layout
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={saved ? "s" : "n"}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="flex items-center gap-2"
          >
            {saved ? (
              <>
                <I.check size={16} stroke={3} /> СОХРАНЕНО
              </>
            ) : (
              "СОХРАНИТЬ ОБРАЗ"
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   46 · FRAME CAROUSEL — рамки аватара, у каждой своя анимация
   ================================================================ */
const FRAMES = [
  { n: "Базовая", c: "#cfd8ea", lvl: 1, kind: "plain" },
  { n: "Пульс", c: "#3ddc84", lvl: 3, kind: "pulse" },
  { n: "Орбита", c: "#4cc3ff", lvl: 5, kind: "orbit" },
  { n: "Корона", c: "#ffc34d", lvl: 10, kind: "crown" },
  { n: "Шторм", c: "#9b7bff", lvl: 15, kind: "storm" },
  { n: "Инферно", c: "#ff4d5e", lvl: 25, kind: "fire" },
];
const MY_LVL = 12;

function FrameRing({
  kind,
  c,
  size,
}: {
  kind: string;
  c: string;
  size: number;
}) {
  const r = size / 2 - 6;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 overflow-visible"
    >
      {kind === "plain" && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth="4"
        />
      )}
      {kind === "pulse" && (
        <>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="4"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="2"
            animate={{ r: [r, r + 12], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </>
      )}
      {kind === "orbit" && (
        <>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="3"
            strokeDasharray="4 6"
          />
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ originX: `${size / 2}px`, originY: `${size / 2}px` }}
          >
            <circle
              cx={size / 2}
              cy={6}
              r="5"
              fill={c}
              style={{ filter: `drop-shadow(0 0 6px ${c})` }}
            />
            <circle cx={size / 2} cy={size - 6} r="3" fill={c} />
          </motion.g>
        </>
      )}
      {kind === "crown" && (
        <>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="5"
          />
          <motion.path
            d={`M${size / 2 - 22} 8 l8 -18 l14 12 l14 -12 l8 18 z`}
            fill={c}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ filter: `drop-shadow(0 0 8px ${c})` }}
          />
        </>
      )}
      {kind === "storm" && (
        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ originX: `${size / 2}px`, originY: `${size / 2}px` }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <path
              key={i}
              d={`M${size / 2} 2 l4 10 l-4 -2 l-4 2 z`}
              fill={c}
              transform={`rotate(${i * 30} ${size / 2} ${size / 2})`}
            />
          ))}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r - 4}
            fill="none"
            stroke={c}
            strokeWidth="3"
          />
        </motion.g>
      )}
      {kind === "fire" && (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.path
              key={i}
              d={`M${size / 2} 0 q6 10 0 16 q-6 -6 0 -16`}
              fill={c}
              transform={`rotate(${i * 36} ${size / 2} ${size / 2})`}
              animate={{ scaleY: [1, 1.5, 0.9, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.07 }}
              style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
            />
          ))}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={c}
            strokeWidth="4"
          />
        </>
      )}
    </svg>
  );
}

export function FrameCarousel({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [applied, setApplied] = useState(0);
  const [deny, setDeny] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const F = FRAMES[idx];
  const A = FRAMES[applied];
  const locked = F.lvl > MY_LVL;

  const apply = () => {
    if (locked) {
      sfx.error();
      setDeny((d) => d + 1);
      if (root) animate(root, shakeKeys(0.35, 8, 6, 0.5), { duration: 0.3 });
      return;
    }
    setApplied(idx);
    sfx.success();
    p.ring(150, 200, F.c, 130, 0.6, 8);
    p.burst({
      x: 150,
      y: 200,
      count: 36,
      colors: [F.c, "#fff"],
      speed: [120, 360],
    });
  };

  useScript(run, async (wait) => {
    setIdx(0);
    setApplied(0);
    await wait(500);
    cue();
    g.show(220, 420);
    for (const n of [1, 2, 3]) {
      g.press(true);
      await g.move(100, 420, 0.3);
      g.press(false);
      setIdx(n);
      await wait(450);
      await g.move(220, 420, 0.2);
    }
    await g.move(150, 420, 0.25);
    g.press(true);
    await wait(90);
    g.press(false);
    setApplied(3);
    sfx.success();
    p.ring(150, 200, FRAMES[3].c, 130, 0.6, 8);
    await wait(700);
    await g.move(220, 420, 0.25);
    g.press(true);
    await g.move(40, 420, 0.4);
    g.press(false);
    setIdx(5);
    await wait(500);
    await g.move(150, 420, 0.3);
    g.press(true);
    await wait(90);
    g.press(false);
    sfx.error();
    setDeny((d) => d + 1);
    await wait(500);
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={A.c} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Рамка профиля</div>
        <div className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
          ур. {MY_LVL}
        </div>
      </div>
      {/* avatar with applied frame */}
      <div className="absolute left-1/2 top-[110px] h-[180px] w-[180px] -ml-[90px]">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={applied}
            className="absolute inset-0"
            initial={{ scale: 1.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={SPRING.reward}
          >
            <FrameRing kind={A.kind} c={A.c} size={180} />
          </motion.div>
        </AnimatePresence>
        <motion.div
          key={`a${applied}`}
          className="absolute inset-[16px] overflow-hidden rounded-full"
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 12 }}
        >
          <img
            src={hood}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
      </div>
      <div className="absolute inset-x-0 top-[300px] text-center">
        <div className="relative mx-auto h-6 w-40 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={idx}
              initial={{ y: 24 }}
              animate={{ y: 0 }}
              exit={{ y: -24 }}
              transition={SPRING.panel}
              className="absolute inset-0 font-display text-base font-black"
              style={{ color: F.c }}
            >
              {F.n}
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.div
          key={`d${deny}`}
          animate={deny && locked ? { x: [0, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`text-[10px] font-bold ${locked ? "text-bear" : "text-white/50"}`}
        >
          {locked
            ? `Откроется на уровне ${F.lvl}`
            : applied === idx
              ? "Надета"
              : "Доступна"}
        </motion.div>
      </div>
      <div className="absolute inset-x-0 top-[360px]">
        <Carousel
          count={FRAMES.length}
          index={idx}
          onIndex={setIdx}
          step={90}
          mode="flat"
          height={110}
          onTapActive={apply}
          render={(i, a) => {
            const fr = FRAMES[i];
            const lk = fr.lvl > MY_LVL;
            return (
              <div
                className="relative h-[84px] w-[84px]"
                style={{ filter: lk ? "grayscale(.8) brightness(.6)" : "none" }}
              >
                <FrameRing kind={fr.kind} c={fr.c} size={84} />
                <div className="absolute inset-[10px] overflow-hidden rounded-full bg-[#141d36]">
                  <img
                    src={hood}
                    className="h-full w-full object-cover opacity-70"
                    draggable={false}
                  />
                </div>
                {lk && (
                  <div className="absolute inset-0 grid place-items-center">
                    <I.lock size={20} className="text-white" />
                  </div>
                )}
                {applied === i && (
                  <div className="absolute -bottom-1 left-1/2 -ml-2 grid h-4 w-4 place-items-center rounded-full bg-bull text-black">
                    <I.check size={10} stroke={4} />
                  </div>
                )}
                {a && (
                  <motion.div
                    layoutId="frsel"
                    className="absolute -inset-1 rounded-full border-2 border-white/60"
                  />
                )}
              </div>
            );
          }}
        />
      </div>
      <motion.button
        onClick={apply}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 rounded-2xl py-3 font-display text-sm font-black"
        animate={{
          background: locked ? "#ffffff14" : F.c,
          color: locked ? "#ffffff66" : "#0c1428",
        }}
      >
        {locked ? (
          <span className="flex items-center justify-center gap-2">
            <I.lock size={14} /> ЗАКРЫТО
          </span>
        ) : applied === idx ? (
          "НАДЕТА"
        ) : (
          "НАДЕТЬ"
        )}
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_CUSTOM: Category = {
  id: "custom",
  n: "14",
  title: "Кастомизация",
  en: "Spin · Hue forge · Frames",
  color: "#ff6bd6",
  blurb:
    "Самовыражение через жесты: карточку профиля крутят пальцем с инерцией, цвет меняют слайдерами со шторкой «до/после», рамки листают каруселью, и у каждой своя анимация.",
  scenes: [
    {
      id: "avatarspin",
      n: "44",
      title: "Вращение аватара",
      kind: "Inertial spin",
      lead: "Карточку профиля крутят горизонтальным жестом. Блик скользит по поверхности, тень смещается и сжимается, при быстром вращении появляются speed-lines. На отпускании скорость проецируется, и карточка доворачивается к ближайшей грани — лицу или статистике.",
      secrets: [
        "Снэп по проекции: target = round((rot + v·0.35)/180)·180, пружина получает velocity жеста — вращение продолжается с той же скоростью, а не начинается заново.",
        "Блик — linear-gradient, позиция которого = 50% + sin(угол)·60%. Материал «отвечает» свету при каждом градусе.",
        "Тень: сдвиг −sin(угол)·30 и scaleX от |cos| — карточка «истончается» ребром.",
        "useVelocity → useSpring → opacity speed-lines: линии появляются только при реально быстром вращении.",
        "Смена грани слышна: тик на пересечении 90°/270° — пальцем чувствуешь «переворот».",
      ],
      tracks: [
        { label: "Доворот 70°", start: 500, dur: 600, color: "#ff6bd6" },
        { label: "Возврат к лицу", start: 1100, dur: 700, color: "#ff6bd6" },
        { label: "Флик −2400°/с", start: 2200, dur: 200, color: "#ffffff" },
        { label: "Инерция + снэп", start: 2400, dur: 1500, color: "#9b7bff" },
      ],
      total: 4200,
      ease: { bez: EASE.outExpo, label: "≈ spring 120/16 + velocity" },
      code: `onPan={(_, i) => rot.set(base + i.offset.x * .9)}
onPanEnd={(_, i) => {
  const v = i.velocity.x * .9;
  const target = Math.round((rot.get() + v * .35) / 180) * 180;
  animate(rot, target, { type: "spring", stiffness: 120, damping: 16, velocity: v });
}}
const shineX = useTransform(rot, r => \`\${50 + Math.sin(r * Math.PI / 180) * 60}%\`);`,
      C: AvatarSpin,
      interactive: "Крути карточку пальцем",
    },
    {
      id: "hueforge",
      n: "45",
      title: "Кузница цвета «до/после»",
      kind: "Compare slider",
      lead: "Шторка сравнения делит портрет на оригинал и результат. Слайдеры оттенка и свечения перекрашивают образ, ауру и частицы в реальном времени. Пресеты плавно едут к своим значениям пружиной, сохранение превращает кнопку в галочку.",
      secrets: [
        "Шторка — clip-path inset(0 0 0 s%) поверх копии изображения с фильтром. Два слоя одной картинки = мгновенное сравнение.",
        "useMotionTemplate собирает CSS filter из MotionValue: hue-rotate без ререндеров, 60 FPS на каждом движении.",
        "Частицы ауры берут цвет из текущего hue при рождении — старые частицы доживают прежним цветом, получается шлейф перехода.",
        "Пресеты не прыгают — анимируют те же MotionValue пружиной 120/20. Слайдеры едут сами, связь очевидна.",
        "Кнопка «Сохранить» меняет фон и текст AnimatePresence с y ±20 — подтверждение внутри того же объекта.",
      ],
      tracks: [
        { label: "Шторка ←", start: 500, dur: 500, color: "#ffffff" },
        { label: "Hue 0 → 288°", start: 1400, dur: 1100, color: "#ff6bd6" },
        { label: "Шторка →", start: 2900, dur: 600, color: "#ffffff" },
        { label: "Пресеты", start: 3500, dur: 1600, color: "#4cc3ff" },
        { label: "Сохранение", start: 5100, dur: 600, color: "#3ddc84" },
      ],
      total: 5800,
      ease: { bez: EASE.camera, label: "camera — шторка" },
      code: `const filter = useMotionTemplate\`hue-rotate(\${hueDeg}deg) saturate(1.3)\`;
const clip   = useTransform(split, s => \`inset(0 0 0 \${s * 100}%)\`);

<img src={hero} />                                   {/* ДО */}
<motion.div style={{ clipPath: clip }}>
  <motion.img src={hero} style={{ filter }} />      {/* ПОСЛЕ */}
</motion.div>
<motion.div style={{ x: divX }} onPan={(_, i) => split.set(base + i.offset.x / W)} />`,
      C: HueForge,
      interactive: "Тяни шторку и слайдеры",
    },
    {
      id: "frames",
      n: "46",
      title: "Карусель рамок",
      kind: "Unlock carousel",
      lead: "Рамки аватара листаются каруселью, у каждой свой характер: пульс, орбита, корона, шторм, пламя. Выбранная рамка «надевается» на большой аватар с поворотом и отскоком. Закрытая по уровню — кнопка тускнеет, подпись мотает головой, экран вздрагивает.",
      secrets: [
        "Каждая рамка — отдельная бесконечная анимация (пульс-кольцо, орбита-спутник, огонь scaleY от основания). Предмет продаёт сам себя движением.",
        "Смена надетой рамки — AnimatePresence popLayout: новая влетает со scale 1.4 и поворотом −30°, старая уходит внутрь.",
        "Аватар при смене делает отскок пружиной 400/12 — «примерка».",
        "Закрытые рамки в карусели — grayscale + brightness и замок. Их видно, их хочется, но они честно закрыты.",
        "Отказ: shake подписи по ключу + лёгкая тряска экрана + звук ошибки. Три канала фидбэка на одно «нельзя».",
      ],
      tracks: [
        { label: "Листание ×3", start: 500, dur: 1900, color: "#4cc3ff" },
        { label: "Надеть «Корону»", start: 2700, dur: 600, color: "#ffc34d" },
        { label: "Флик к «Инферно»", start: 3700, dur: 400, color: "#ff4d5e" },
        { label: "Отказ (lvl 25)", start: 4900, dur: 500, color: "#ff4d5e" },
      ],
      total: 5600,
      ease: { bez: EASE.overshoot, label: "overshoot — примерка" },
      code: `<AnimatePresence mode="popLayout">
  <motion.div key={applied}
    initial={{ scale: 1.4, opacity: 0, rotate: -30 }}
    animate={{ scale: 1, opacity: 1, rotate: 0 }}
    exit={{ scale: .7, opacity: 0 }} transition={SPRING.reward}>
    <FrameRing kind={A.kind} />
  </motion.div>
</AnimatePresence>
{kind === "fire" && flames.map(i => <motion.path
  animate={{ scaleY: [1, 1.5, .9, 1] }} style={{ transformOrigin: "50% 100%" }} />)}`,
      C: FrameCarousel,
      interactive: "Листай рамки, тапни центр",
    },
  ],
};
