import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import {
  HoldButton,
  Roll,
  Slider,
  hexMix,
  useGhost,
} from "../components/controls";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ================================================================
   50 · FEAR & GREED — слайдер эмоции морфит лицо, шкалу и мир
   ================================================================ */
const MOODS = [
  {
    n: "ПАНИКА",
    c: "#ff4d5e",
    tip: "Продавать на панике — фиксировать чужую прибыль.",
  },
  { n: "СТРАХ", c: "#ff8a3d", tip: "Страх сужает зрение. Вернись к плану." },
  { n: "БАЛАНС", c: "#9b7bff", tip: "Лучшее состояние для решений." },
  {
    n: "ЖАДНОСТЬ",
    c: "#3ddc84",
    tip: "Жадность увеличивает лот. Проверь риск.",
  },
  {
    n: "ЭЙФОРИЯ",
    c: "#ffc34d",
    tip: "Эйфория — сигнал к осторожности, а не к входу.",
  },
];
const HEAD = [
  "BTC −12% за час",
  "Ликвидации $400M",
  "Все покупают!",
  "Новый ATH?!",
  "Кит сливает",
  "To the moon",
  "Рынок рухнет?",
  "x100 за неделю",
];

export function FearGreed({ run, cue }: SceneProps) {
  const v = useMotionValue(0.5);
  const sv = useSpring(v, { stiffness: 140, damping: 12 });
  const [mood, setMood] = useState(2);
  const g = useGhost();
  const p = useParticles();
  const moodRef = useRef(2);
  const needle = useTransform(sv, (x) => -90 + x * 180);
  const bg = useTransform(v, (x) =>
    x < 0.5
      ? hexMix("#3a0a14", "#140f2a", x * 2)
      : hexMix("#140f2a", "#2a2408", (x - 0.5) * 2),
  );
  // лицо: рот — квадратичная кривая, контрольная точка от эмоции
  const mouth = useTransform(v, (x) => {
    const k = (x - 0.5) * 2; // −1 паника … +1 эйфория
    const cy = 64 + k * 14;
    const open = Math.abs(k) > 0.7 ? (Math.abs(k) - 0.7) * 20 : 0;
    return `M34 62 Q50 ${cy + open} 66 62 Q50 ${cy - open * 0.2} 34 62`;
  });
  const brow = useTransform(v, (x) => (x - 0.5) * -24);
  const eye = useTransform(v, (x) => 1 + Math.abs(x - 0.5) * 1.2);
  const faceCol = useTransform(v, (x) =>
    x < 0.5
      ? hexMix("#ff4d5e", "#9b7bff", x * 2)
      : hexMix("#9b7bff", "#ffc34d", (x - 0.5) * 2),
  );
  const speed = useTransform(v, (x) => 0.4 + Math.abs(x - 0.5) * 4);
  const headOp = useTransform(v, (x) => 0.15 + Math.abs(x - 0.5) * 1.4);

  useMotionValueEvent(v, "change", (x) => {
    const m = Math.min(4, Math.floor(x * 5));
    if (m !== moodRef.current) {
      moodRef.current = m;
      setMood(m);
      sfx.pop(m * 3);
      if (m === 0 || m === 4) sfx.heartbeat(1.2);
    }
  });

  // эмоциональные частицы: страх падает вниз, жадность летит вверх
  useEffect(() => {
    const iv = window.setInterval(() => {
      const x = v.get();
      const k = (x - 0.5) * 2;
      if (Math.abs(k) < 0.2 || Math.random() > Math.abs(k)) return;
      p.burst({
        x: 40 + Math.random() * 220,
        y: k > 0 ? 600 : 60,
        count: 1,
        shape: "dot",
        colors: [k > 0 ? "#ffc34d" : "#ff4d5e"],
        speed: [60, 140],
        angle: k > 0 ? -Math.PI / 2 : Math.PI / 2,
        spread: 0.4,
        drag: 0.3,
        life: [2, 3],
        size: [1.5, 3],
      });
    }, 70);
    return () => clearInterval(iv);
  }, [v, p]);

  useScript(run, async (wait) => {
    v.set(0.5);
    await wait(500);
    cue();
    g.show(24 + 0.5 * 252, 518);
    g.press(true);
    for (const t of [0.05, 0.95, 0.5]) {
      await Promise.all([
        g.move(24 + t * 252, 518, 1.1),
        animate(v, t, { duration: 1.1, ease: EASE.camera }),
      ]);
      await wait(600);
    }
    g.press(false);
    g.hide();
  });

  const M = MOODS[mood];
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ background: bg }}
    >
      {/* плывущие заголовки: скорость и яркость растут на крайностях */}
      <motion.div className="absolute inset-0" style={{ opacity: headOp }}>
        {HEAD.map((h, i) => (
          <HeadlineDrift key={i} text={h} i={i} speed={speed} />
        ))}
      </motion.div>
      <div className="absolute inset-x-0 top-11 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">
        Индекс страха и жадности
      </div>
      {/* gauge */}
      <div className="absolute left-1/2 top-[70px] h-[130px] w-[240px] -ml-[120px]">
        <svg viewBox="0 0 240 130" className="absolute inset-0">
          <defs>
            <linearGradient id="fg" x1="0" x2="1">
              <stop offset="0" stopColor="#ff4d5e" />
              <stop offset=".5" stopColor="#9b7bff" />
              <stop offset="1" stopColor="#ffc34d" />
            </linearGradient>
          </defs>
          <path
            d="M20 120 A100 100 0 0 1 220 120"
            fill="none"
            stroke="url(#fg)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {Array.from({ length: 21 }).map((_, i) => (
            <line
              key={i}
              x1="120"
              y1="12"
              x2="120"
              y2={i % 5 ? 20 : 26}
              stroke="#ffffff55"
              strokeWidth={i % 5 ? 1 : 2}
              transform={`rotate(${-90 + i * 9} 120 120)`}
            />
          ))}
        </svg>
        <motion.div
          className="absolute bottom-[10px] left-1/2 h-[92px] w-1.5 -ml-[3px] origin-bottom rounded-full bg-white shadow-[0_0_10px_#fff]"
          style={{ rotate: needle }}
        />
        <div className="absolute bottom-[4px] left-1/2 h-4 w-4 -ml-2 rounded-full border-[3px] border-white bg-[#0c1428]" />
      </div>
      {/* face */}
      <div className="absolute left-1/2 top-[210px] h-[110px] w-[110px] -ml-[55px]">
        <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            style={{
              fill: faceCol,
              filter: "drop-shadow(0 0 16px rgba(155,123,255,.5))",
            }}
            opacity="0.9"
          />
          <motion.g style={{ rotate: brow, transformOrigin: "36px 32px" }}>
            <line
              x1="26"
              y1="32"
              x2="44"
              y2="32"
              stroke="#0c1428"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </motion.g>
          <motion.g
            style={{
              rotate: useTransform(brow, (b) => -b),
              transformOrigin: "64px 32px",
            }}
          >
            <line
              x1="56"
              y1="32"
              x2="74"
              y2="32"
              stroke="#0c1428"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </motion.g>
          <motion.circle
            cx="36"
            cy="44"
            r="5"
            fill="#0c1428"
            style={{ scale: eye, transformOrigin: "36px 44px" }}
          />
          <motion.circle
            cx="64"
            cy="44"
            r="5"
            fill="#0c1428"
            style={{ scale: eye, transformOrigin: "64px 44px" }}
          />
          <motion.path
            d={mouth}
            fill="#0c1428"
            stroke="#0c1428"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="absolute inset-x-0 top-[330px] text-center">
        <div className="relative mx-auto h-9 w-56 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={mood}
              initial={{ y: 36, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -36, scale: 0.8 }}
              transition={SPRING.reward}
              className="absolute inset-0 font-display text-3xl font-black"
              style={{ color: M.c, textShadow: `0 0 24px ${M.c}` }}
            >
              {M.n}
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={mood}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mt-2 max-w-[250px] rounded-xl border px-3 py-2 text-[11px] text-white/80"
            style={{ borderColor: `${M.c}55`, background: `${M.c}14` }}
          >
            {M.tip}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-6 top-[500px]">
        <Slider
          mv={v}
          gradient="linear-gradient(90deg,#ff4d5e,#ff8a3d,#9b7bff,#3ddc84,#ffc34d)"
          color={M.c}
          format={(x) => `${Math.round(x * 100)}`}
          marks={["страх", "", "баланс", "", "жадность"]}
        />
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </motion.div>
  );
}

function HeadlineDrift({
  text,
  i,
  speed,
}: {
  text: string;
  i: number;
  speed: ReturnType<typeof useTransform<number, number>>;
}) {
  const x = useMotionValue((i * 97) % 260);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      let nx = x.get() - (20 + (i % 3) * 12) * speed.get() * dt;
      if (nx < -160) nx = 320;
      x.set(nx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [x, i, speed]);
  return (
    <motion.div
      className="absolute whitespace-nowrap rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/70"
      style={{ x, top: 70 + ((i * 71) % 520) }}
    >
      {text}
    </motion.div>
  );
}

/* ================================================================
   51 · TILT BALANCE — удерживай шар спокойствия в центре
   ================================================================ */
const SHOCKS = [
  "Фейковая новость",
  "Резкий памп",
  "Слив кита",
  "FOMO в чате",
  "Ликвидации",
];

export function TiltBalance({ run, cue }: SceneProps) {
  const angle = useMotionValue(0);
  const ball = useMotionValue(0);
  const calm = useMotionValue(0);
  const [shock, setShock] = useState<{
    id: number;
    t: string;
    dir: number;
  } | null>(null);
  const [won, setWon] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const vel = useRef(0);
  const base = useRef(0);
  const wonRef = useRef(false);
  const calmW = useTransform(calm, (c) => `${c * 100}%`);
  const ballX = useTransform(ball, (b) => b * 110);
  const inZone = useTransform(ball, (b) =>
    Math.abs(b) < 0.25 ? "#3ddc84" : Math.abs(b) < 0.6 ? "#ffc34d" : "#ff4d5e",
  );
  const ballRot = useTransform(ball, (b) => b * 400);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      const a = (angle.get() * Math.PI) / 180;
      vel.current += Math.sin(a) * 4.2 * dt;
      vel.current *= 1 - 0.8 * dt;
      let b = ball.get() + vel.current * dt;
      if (b > 1 || b < -1) {
        b = Math.sign(b);
        vel.current *= -0.45;
        sfx.tick();
      }
      ball.set(b);
      const zone = Math.abs(b) < 0.25;
      const c = clamp(calm.get() + (zone ? 0.22 : -0.28) * dt);
      calm.set(c);
      if (c >= 1 && !wonRef.current) {
        wonRef.current = true;
        setWon(true);
        sfx.success();
        p.burst({
          x: 150,
          y: 300,
          count: 60,
          shape: "star",
          colors: ["#3ddc84", "#fff", "#9b7bff"],
          speed: [150, 450],
          size: [2, 5],
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [angle, ball, calm, p]);

  const hit = (dir: number) => {
    const t = SHOCKS[Math.floor(Math.random() * SHOCKS.length)];
    setShock({ id: Date.now(), t, dir });
    vel.current += dir * 1.6;
    sfx.hit();
    if (root) animate(root, shakeKeys(0.45, 10, 7, 1), { duration: 0.3 });
    p.burst({
      x: 150 + dir * -100,
      y: 300,
      count: 16,
      colors: ["#ff4d5e", "#fff"],
      speed: [100, 260],
      angle: dir > 0 ? 0 : Math.PI,
      spread: 1,
    });
  };

  useScript(run, async (wait) => {
    angle.set(0);
    ball.set(0);
    calm.set(0);
    vel.current = 0;
    wonRef.current = false;
    setWon(false);
    await wait(600);
    cue();
    g.show(150, 380);
    const tiltTo = async (a: number, d = 0.35) => {
      g.press(true);
      await Promise.all([
        g.move(150 + a * 4, 380, d),
        animate(angle, a, { duration: d }),
      ]);
    };
    for (let k = 0; k < 4; k++) {
      const dir = k % 2 ? -1 : 1;
      hit(dir);
      await wait(250);
      await tiltTo(-dir * 14);
      await wait(450);
      await tiltTo(dir * 5, 0.3);
      await wait(250);
      await tiltTo(0, 0.4);
      g.press(false);
      await wait(900);
    }
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#9b7bff" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Баланс спокойствия</div>
        <div className="font-mono text-[10px] text-white/50">
          держи шар в центре
        </div>
      </div>
      <div className="absolute inset-x-5 top-[78px]">
        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span className="text-white/55">Спокойствие</span>
          <motion.span className="font-mono text-bull">
            {useTransform(calm, (c) => `${Math.round(c * 100)}%`)}
          </motion.span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#6a4dff] to-bull"
            style={{ width: calmW, boxShadow: "0 0 12px #3ddc84" }}
          />
        </div>
      </div>
      <div className="absolute inset-x-4 top-[130px] h-12">
        <AnimatePresence mode="popLayout">
          {shock && (
            <motion.div
              key={shock.id}
              initial={{
                x: shock.dir * -200,
                opacity: 0,
                rotate: shock.dir * -8,
              }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: EASE.snap }}
              className="mx-auto flex w-fit items-center gap-2 rounded-xl border border-bear/50 bg-bear/15 px-3 py-2 text-[11px] font-bold text-bear"
            >
              <I.bolt size={14} /> {shock.t}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* beam */}
      <motion.div
        className="absolute left-1/2 top-[300px] h-40 w-[280px] -ml-[140px] -mt-20 cursor-grab touch-none active:cursor-grabbing"
        onPanStart={() => {
          base.current = angle.get();
          sfx.tap();
        }}
        onPan={(_, i) =>
          angle.set(
            Math.max(-20, Math.min(20, base.current + i.offset.x * 0.15)),
          )
        }
        onPanEnd={() =>
          animate(angle, angle.get() * 0.5, {
            type: "spring",
            stiffness: 120,
            damping: 14,
          })
        }
      >
        <motion.div
          className="absolute left-0 right-0 top-1/2"
          style={{ rotate: angle }}
        >
          <div className="relative mx-auto h-3 w-[250px] rounded-full bg-gradient-to-r from-bear via-bull to-bear">
            <div className="absolute left-1/2 top-0 h-3 w-[56px] -ml-[28px] rounded-full border-2 border-white/70" />
          </div>
          <motion.div
            className="absolute left-1/2 -top-[26px] h-6 w-6 -ml-3 rounded-full"
            style={{
              x: ballX,
              rotate: ballRot,
              background: inZone,
              boxShadow: useTransform(inZone, (c) => `0 0 20px ${c}`),
            }}
          >
            <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white/70" />
          </motion.div>
        </motion.div>
        <div
          className="absolute left-1/2 top-1/2 mt-2 h-14 w-6 -ml-3 bg-gradient-to-b from-[#3a4a78] to-transparent"
          style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
        />
      </motion.div>
      <div className="absolute inset-x-6 top-[420px] flex justify-between">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => hit(1)}
          className="rounded-xl border border-bear/40 px-3 py-2 text-[10px] font-bold text-bear"
        >
          Шок ←
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => hit(-1)}
          className="rounded-xl border border-bear/40 px-3 py-2 text-[10px] font-bold text-bear"
        >
          Шок →
        </motion.button>
      </div>
      <AnimatePresence>
        {won && (
          <motion.div
            key="w"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING.reward}
            className="glass absolute inset-x-6 bottom-8 flex items-center gap-3 rounded-2xl border-bull/50 p-3"
          >
            <img src={hood} className="h-11 w-11 rounded-xl object-cover" />
            <div>
              <div className="text-sm font-bold text-bull">Хладнокровие +1</div>
              <div className="text-[10px] text-white/55">
                Ты удержал баланс под давлением новостей
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!won && (
        <div className="absolute inset-x-6 bottom-8 text-center text-[10px] text-white/40">
          Наклоняй балку пальцем влево-вправо. Шоки рынка толкают шар.
        </div>
      )}
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   52 · FOCUS HOLD — удержание гасит информационный шум
   ================================================================ */
const NOISE = [
  { t: "+340% за день!", c: "#3ddc84" },
  { t: "СРОЧНО: крах биржи?", c: "#ff4d5e" },
  { t: "@whale: покупаю всё", c: "#4cc3ff" },
  { t: "Сигнал VIP: x50", c: "#ffc34d" },
  { t: "Ты упускаешь рост", c: "#ff6bd6" },
  { t: "−18% ETH", c: "#ff4d5e" },
  { t: "Новый мемкоин", c: "#b8ff3d" },
  { t: "3 непрочитанных", c: "#9b7bff" },
];

function NoiseChip({
  n,
  i,
  focus,
}: {
  n: (typeof NOISE)[number];
  i: number;
  focus: ReturnType<typeof useMotionValue<number>>;
}) {
  const blur = useTransform(focus, (f) => `blur(${f * 8}px)`);
  const op = useTransform(focus, [0, 0.8], [0.95, 0.05]);
  const sc = useTransform(focus, [0, 1], [1, 0.7]);
  const ox = ((i * 83) % 220) - 10;
  const oy = 70 + ((i * 131) % 420);
  return (
    <motion.div
      className="absolute rounded-lg border px-2 py-1 text-[10px] font-bold"
      style={{
        left: ox,
        top: oy,
        filter: blur,
        opacity: op,
        scale: sc,
        color: n.c,
        borderColor: `${n.c}66`,
        background: `${n.c}1a`,
      }}
      animate={{ x: [0, 12, -8, 0], y: [0, -10, 6, 0], rotate: [0, 3, -3, 0] }}
      transition={{
        duration: 1.4 + (i % 4) * 0.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {n.t}
    </motion.div>
  );
}

export function FocusHold({ run, cue }: SceneProps) {
  const focus = useMotionValue(0);
  const [bpm, setBpm] = useState(118);
  const [done, setDone] = useState(false);
  const g = useGhost();
  const p = useParticles();
  const vign = useTransform(
    focus,
    (f) =>
      `radial-gradient(circle at 50% 42%, transparent ${70 - f * 38}%, #03060e ${92 - f * 30}%)`,
  );
  const chartBlur = useTransform(
    focus,
    (f) => `blur(${(1 - f) * 3}px) saturate(${0.4 + f * 0.8})`,
  );
  const chartScale = useTransform(focus, [0, 1], [0.92, 1.04]);
  const beatRef = useRef<number | null>(null);

  useMotionValueEvent(focus, "change", (f) => setBpm(Math.round(118 - f * 54)));

  // сердцебиение: интервал зависит от текущего пульса
  useEffect(() => {
    let alive = true;
    const beat = () => {
      if (!alive) return;
      const b = 118 - focus.get() * 54;
      if (focus.get() > 0.05) sfx.heartbeat(0.5);
      beatRef.current = window.setTimeout(beat, 60000 / b);
    };
    beat();
    return () => {
      alive = false;
      if (beatRef.current) clearTimeout(beatRef.current);
    };
  }, [focus]);

  const complete = () => {
    setDone(true);
    sfx.chime();
    p.ring(150, 230, "#9b7bff", 180, 0.8, 6);
    p.burst({
      x: 150,
      y: 230,
      count: 40,
      colors: ["#9b7bff", "#fff"],
      speed: [100, 300],
    });
  };

  useScript(run, async (wait) => {
    focus.set(0);
    setDone(false);
    await wait(900);
    cue();
    g.show(150, 488);
    g.press(true);
    sfx.breathIn();
    await animate(focus, 0.5, { duration: 1, ease: "linear" });
    g.press(false);
    await animate(focus, 0, { type: "spring", stiffness: 200, damping: 16 });
    await wait(700);
    g.press(true);
    sfx.breathIn();
    await animate(focus, 1, { duration: 2, ease: "linear" });
    g.press(false);
    complete();
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070a16]">
      <SceneBg tint="#9b7bff" />
      {NOISE.map((n, i) => (
        <NoiseChip key={i} n={n} i={i} focus={focus} />
      ))}
      <motion.div
        className="glass absolute inset-x-6 top-[140px] rounded-2xl p-3"
        style={{ filter: chartBlur, scale: chartScale }}
      >
        <div className="text-[10px] font-bold text-white/45">
          ТВОЙ ПЛАН · BTC/USDT
        </div>
        <Candles
          data={genCandles(18, 51, 0.1)}
          w={220}
          h={110}
          grow={false}
          highlight={17}
        />
        <div className="mt-1 text-[10px] text-white/60">
          Вход только после ретеста уровня
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: vign }}
      />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-bold">Фокус</div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 60 / bpm, repeat: Infinity }}
            className="text-bear"
          >
            <I.heart size={14} />
          </motion.span>
          <Roll value={bpm} color={bpm > 90 ? "#ff4d5e" : "#3ddc84"} /> уд/мин
        </div>
      </div>
      <div className="absolute inset-x-0 top-[330px] text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={done ? "d" : "h"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="font-display text-lg font-black"
              style={{ color: done ? "#9b7bff" : "#fff" }}
            >
              {done ? "Шум погашен" : "Удерживай, чтобы сфокусироваться"}
            </div>
            <div className="text-[10px] text-white/50">
              {done
                ? "Осталось только то, что важно"
                : "Отпустишь — шум вернётся"}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 top-[438px] flex justify-center">
        <HoldButton
          mv={focus}
          ms={2000}
          color="#9b7bff"
          size={100}
          onStart={() => {
            setDone(false);
            sfx.breathIn();
          }}
          onCancel={() => sfx.breathOut()}
          onComplete={complete}
        >
          <I.eye size={28} className="text-violet" />
        </HoldButton>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   86 · BREATH PACER — слайдер задаёт темп, сфера дышит
   ================================================================ */
export function BreathPacer({ run, cue }: SceneProps) {
  const pace = useMotionValue(0.25);
  const orb = useMotionValue(1);
  const [secs, setSecs] = useState(6);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [cycles, setCycles] = useState(0);
  const secsRef = useRef(6);
  const g = useGhost();
  const glow = useTransform(
    orb,
    (s) => `0 0 ${(s - 1) * 160}px ${(s - 1) * 40}px rgba(155,123,255,.45)`,
  );
  const inner = useTransform(orb, [1, 1.55], [0.6, 1]);
  useMotionValueEvent(pace, "change", (v) => {
    const s = Math.round(4 + v * 8);
    secsRef.current = s;
    setSecs(s);
  });
  useEffect(() => {
    let alive = true;
    const loop = async () => {
      while (alive) {
        setPhase("in");
        await animate(orb, 1.55, {
          duration: secsRef.current / 2,
          ease: [0.45, 0, 0.55, 1],
        });
        if (!alive) break;
        setPhase("out");
        await animate(orb, 1, {
          duration: secsRef.current / 2,
          ease: [0.45, 0, 0.55, 1],
        });
        if (alive) setCycles((c) => c + 1);
      }
    };
    loop();
    return () => {
      alive = false;
    };
  }, [orb]);
  useScript(run, async (wait) => {
    pace.set(0.25);
    await wait(600);
    cue();
    g.show(24 + 0.25 * 252, 470);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.02 * 252, 470, 0.6),
      animate(pace, 0.02, { duration: 0.6 }),
    ]);
    await wait(2200);
    await Promise.all([
      g.move(24 + 0.9 * 252, 470, 0.8),
      animate(pace, 0.9, { duration: 0.8, ease: EASE.camera }),
    ]);
    g.press(false);
    g.hide();
  });
  const bpm = (60 / secs).toFixed(1);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#9b7bff" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Темп дыхания</div>
        <div className="text-[10px] font-bold text-white/60">
          циклов <Roll value={cycles} color="#9b7bff" />
        </div>
      </div>
      <div className="absolute left-1/2 top-[230px] h-[150px] w-[150px] -ml-[75px] -mt-[75px]">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-violet/60"
          style={{ scale: orb, boxShadow: glow }}
        />
        <motion.div
          className="absolute inset-[18%] rounded-full"
          style={{
            scale: orb,
            opacity: inner,
            background:
              "radial-gradient(circle at 35% 30%, #e0d6ff, #9b7bff 55%, #3b2a7a)",
          }}
        />
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-violet"
            style={{
              x: useTransform(
                orb,
                (s) => Math.cos((i / 12) * Math.PI * 2) * 60 * s,
              ),
              y: useTransform(
                orb,
                (s) => Math.sin((i / 12) * Math.PI * 2) * 60 * s,
              ),
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-[340px] text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.08em" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE.outExpo }}
            className="font-display text-2xl font-black text-violet"
          >
            {phase === "in" ? "ВДОХ" : "ВЫДОХ"}
          </motion.div>
        </AnimatePresence>
        <div className="mt-1 text-[11px] text-white/55">
          цикл <Roll value={`${secs}с`} color="#fff" /> ·{" "}
          <Roll value={bpm} color="#9b7bff" /> вдохов/мин
        </div>
      </div>
      <div className="absolute inset-x-6 top-[456px]">
        <Slider
          mv={pace}
          color="#9b7bff"
          format={(v) => `${Math.round(4 + v * 8)} с`}
          marks={["4с", "", "8с", "", "12с"]}
        />
      </div>
      <div className="absolute inset-x-6 bottom-5 text-center text-[10px] text-white/40">
        ~6 вдохов в минуту (цикл 10с) — резонансное дыхание, снижает стресс
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_MOOD: Category = {
  id: "mood",
  n: "16",
  title: "Эмоции трейдера",
  en: "Fear/Greed · Tilt balance · Focus",
  color: "#9b7bff",
  blurb:
    "Психология, которую можно потрогать: слайдер эмоции морфит лицо и мир, физическая балка учит держать равновесие под шоками, удержание гасит информационный шум.",
  scenes: [
    {
      id: "feargreed",
      n: "50",
      title: "Страх и жадность",
      kind: "Emotion slider",
      lead: "Один слайдер эмоции меняет всё: стрелка шкалы следует с перелётом, лицо морфит брови, глаза и рот, фон перетекает от бордового к золотому, заголовки новостей ускоряются и становятся ярче на крайностях, частицы страха падают, частицы жадности взлетают.",
      secrets: [
        "Рот — квадратичная кривая, контрольная точка cy = 64 + k·14, а на крайностях рот «открывается». Строка пути собирается useTransform — морф без библиотек.",
        "Стрелка идёт через useSpring(10/12) от слайдера — она перелетает и колеблется, как настоящий прибор.",
        "Фон — двухсегментный hexMix: страх→баланс→жадность. Середина нейтральна, края насыщены.",
        "Скорость и яркость «шума» новостей ∝ |эмоция − 0.5|: в балансе мир тихий, на крайностях — кричит.",
        "Направление частиц кодирует эмоцию: страх тянет вниз, жадность вверх. Метафора через физику.",
      ],
      tracks: [
        { label: "→ Паника", start: 500, dur: 1100, color: "#ff4d5e" },
        { label: "Частицы вниз", start: 900, dur: 1300, color: "#ff4d5e" },
        { label: "→ Эйфория", start: 2200, dur: 1100, color: "#ffc34d" },
        { label: "Частицы вверх", start: 2700, dur: 1300, color: "#ffc34d" },
        { label: "→ Баланс", start: 3900, dur: 1100, color: "#9b7bff" },
      ],
      total: 5600,
      ease: { bez: EASE.camera, label: "camera — демо слайдера" },
      code: `const mouth = useTransform(v, x => {
  const k = (x - .5) * 2;                    // −1 … +1
  const cy = 64 + k * 14;
  const open = Math.abs(k) > .7 ? (Math.abs(k) - .7) * 20 : 0;
  return \`M34 62 Q50 \${cy + open} 66 62 Q50 \${cy - open * .2} 34 62\`;
});
const needle = useTransform(useSpring(v, { stiffness: 140, damping: 12 }), x => -90 + x * 180);`,
      C: FearGreed,
      interactive: "Тяни эмоцию",
    },
    {
      id: "tilt",
      n: "51",
      title: "Балка спокойствия",
      kind: "Physics mini-game",
      lead: "Мини-игра на физике: наклоняй балку пальцем, чтобы удержать шар в центральной зоне. Рыночные шоки прилетают карточками и толкают шар. Пока шар в зоне — шкала спокойствия растёт, вне её — тает. Заполнил — награда «Хладнокровие».",
      secrets: [
        "Настоящая симуляция в rAF: ускорение = sin(угол)·g, трение 0.8/с, отскок от стенок с потерей 55%. Значения в MotionValue — ноль ререндеров.",
        "Цвет шара — функция позиции (зелёный/жёлтый/красный). Игрок читает состояние периферийным зрением.",
        "Шар вращается пропорционально позиции (rotate = x·400) — катится, а не скользит.",
        "Шоки — импульс скорости + карточка, влетающая со стороны удара + тряска. Причина и следствие видны одновременно.",
        "Отпустил балку — она сама возвращается к половине угла пружиной. Помощь, но не автопилот.",
      ],
      tracks: [
        {
          label: "Шок 1 + компенсация",
          start: 600,
          dur: 1700,
          color: "#ff4d5e",
        },
        { label: "Шок 2", start: 2300, dur: 1700, color: "#ff4d5e" },
        { label: "Шок 3", start: 4000, dur: 1700, color: "#ff4d5e" },
        {
          label: "Спокойствие растёт",
          start: 600,
          dur: 6500,
          color: "#3ddc84",
        },
      ],
      total: 7400,
      ease: { bez: [0.45, 0, 0.55, 1], label: "sine — наклон" },
      code: `const loop = t => {
  const a = angle.get() * Math.PI / 180;
  vel += Math.sin(a) * 4.2 * dt;  vel *= 1 - .8 * dt;
  let b = ball.get() + vel * dt;
  if (Math.abs(b) > 1) { b = Math.sign(b); vel *= -.45; }
  ball.set(b);
  calm.set(clamp(calm.get() + (Math.abs(b) < .25 ? .22 : -.28) * dt));
  raf = requestAnimationFrame(loop);
};`,
      C: TiltBalance,
      interactive: "Наклоняй балку пальцем",
    },
    {
      id: "focus",
      n: "52",
      title: "Удержание фокуса",
      kind: "Hold to calm",
      lead: "Вокруг плана дёргаются кричащие уведомления. Удержание кнопки размывает и гасит шум, сжимает виньетку, делает план резким и насыщенным, а пульс замедляется со 118 до 64. Отпустишь раньше — шум возвращается пружиной.",
      secrets: [
        "Шум не исчезает, а уходит в расфокус: blur(f·8px) + opacity + scale. Как у камеры с малой глубиной резкости.",
        "Виньетка — radial-gradient, радиусы которого от прогресса удержания. Туннельное зрение как визуальный язык концентрации.",
        "План, наоборот, резкеет и насыщается: blur(1 − f) и saturate. Фокус — это перераспределение резкости.",
        "Пульс — реальный звук сердцебиения с интервалом 60000/bpm, где bpm падает с удержанием. Звук замедляется вместе с дыханием.",
        "Иконка сердца пульсирует с периодом 60/bpm — визуал и звук в одном ритме.",
      ],
      tracks: [
        { label: "Попытка 50%", start: 900, dur: 1000, color: "#9b7bff" },
        { label: "Шум возвращается", start: 1900, dur: 500, color: "#ff4d5e" },
        { label: "Полное удержание", start: 3100, dur: 2000, color: "#9b7bff" },
        { label: "Пульс 118 → 64", start: 3100, dur: 2000, color: "#3ddc84" },
        { label: "Фокус достигнут", start: 5100, dur: 600, color: "#ffffff" },
      ],
      total: 6000,
      ease: { bez: [0.45, 0, 0.55, 1], label: "sine — дыхание" },
      code: `const blur = useTransform(focus, f => \`blur(\${f * 8}px)\`);          // шум
const vign = useTransform(focus, f =>
  \`radial-gradient(circle, transparent \${70 - f * 38}%, #03060e \${92 - f * 30}%)\`);
const beat = () => {
  sfx.heartbeat(.5);
  setTimeout(beat, 60000 / (118 - focus.get() * 54));  // пульс замедляется
};`,
      C: FocusHold,
      interactive: "Удерживай кнопку фокуса",
    },
    {
      id: "breathpace",
      n: "86",
      title: "Темп дыхания",
      kind: "Pace slider loop",
      lead: "Слайдер задаёт длительность дыхательного цикла от 4 до 12 секунд. Сфера, кольцо и двенадцать спутников расширяются на вдохе и сжимаются на выдохе в выбранном темпе, подпись фазы «выдыхается» разрядкой, счётчик циклов растёт.",
      secrets: [
        "Бесконечный async-цикл animate → await → animate: темп читается из ref на каждой фазе, поэтому новый темп применяется со следующего вдоха — без рывка.",
        "Кривая [0.45, 0, 0.55, 1] — синусоида без перелёта: спокойствие не пружинит.",
        "Спутники — x/y = cos/sin·60·scale от того же MotionValue: орбита «дышит» вместе со сферой.",
        "Свечение растёт с (scale − 1)·160 — на пике вдоха свет максимален.",
        "Подпись показывает и секунды, и вдохи в минуту — физиология понятна без справки.",
      ],
      tracks: [
        { label: "Темп → 4с", start: 600, dur: 600, color: "#9b7bff" },
        { label: "Быстрые циклы", start: 1200, dur: 2200, color: "#ff4d5e" },
        { label: "Темп → 11с", start: 3400, dur: 800, color: "#9b7bff" },
        { label: "Медленный вдох", start: 4200, dur: 1800, color: "#3ddc84" },
      ],
      total: 6200,
      ease: { bez: [0.45, 0, 0.55, 1], label: "sine — дыхание" },
      code: `while (alive) {
  await animate(orb, 1.55, { duration: secsRef.current / 2, ease: [.45, 0, .55, 1] });
  await animate(orb, 1,    { duration: secsRef.current / 2, ease: [.45, 0, .55, 1] });
}
const x = useTransform(orb, s => Math.cos(a) * 60 * s);   // спутники дышат`,
      C: BreathPacer,
      interactive: "Двигай темп",
    },
  ],
};
