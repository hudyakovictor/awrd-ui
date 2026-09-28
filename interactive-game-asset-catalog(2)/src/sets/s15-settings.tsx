import { Carousel as XCarousel } from "../components/controls";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import {
  Knob,
  Roll,
  Slider,
  Toggle,
  VSlider,
  useGhost,
} from "../components/controls";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const C = "#22d3ee";

/* ================================================================
   79 · THEME REVEAL — круговое раскрытие темы из точки касания
   ================================================================ */
const THEMES = [
  { n: "Неон", bg: "#0a1122", card: "#16223f", acc: "#2ee6c5", txt: "#e6ecff" },
  {
    n: "Золото",
    bg: "#1a1206",
    card: "#2e220c",
    acc: "#ffc34d",
    txt: "#fff5e0",
  },
  {
    n: "Кровь",
    bg: "#1a0609",
    card: "#2e0c12",
    acc: "#ff4d5e",
    txt: "#ffe6ea",
  },
  { n: "Лёд", bg: "#e8f4ff", card: "#ffffff", acc: "#2563eb", txt: "#0c1428" },
];

function ThemeUI({ t }: { t: (typeof THEMES)[number] }) {
  return (
    <div
      className="absolute inset-0"
      style={{ background: t.bg, color: t.txt }}
    >
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Тема: {t.n}</div>
        <div
          className="h-8 w-8 overflow-hidden rounded-full border-2"
          style={{ borderColor: t.acc }}
        >
          <img src={hood} className="h-full w-full object-cover" />
        </div>
      </div>
      <div
        className="absolute inset-x-4 top-[88px] rounded-2xl p-3"
        style={{ background: t.card }}
      >
        <div className="text-[10px] font-bold opacity-60">BTC/USDT · 15M</div>
        <Candles
          data={genCandles(20, 6, 0.1)}
          w={244}
          h={100}
          grow={false}
          glow={false}
        />
      </div>
      <div className="absolute inset-x-4 top-[240px] grid grid-cols-3 gap-2">
        {[I.trend, I.shield, I.brain].map((Ic, i) => (
          <div
            key={i}
            className="grid h-16 place-items-center rounded-xl"
            style={{ background: t.card, color: t.acc }}
          >
            <Ic size={22} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[322px] space-y-2">
        {[0.7, 0.45].map((w, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{ background: t.card }}
          >
            <div
              className="h-2 rounded-full"
              style={{ width: `${w * 100}%`, background: t.acc, opacity: 0.8 }}
            />
            <div
              className="mt-1.5 h-1.5 w-1/2 rounded-full opacity-30"
              style={{ background: t.txt }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ThemeReveal({ run, cue }: SceneProps) {
  const [cur, setCur] = useState(0);
  const [next, setNext] = useState<{
    i: number;
    x: number;
    y: number;
    k: number;
  } | null>(null);
  const g = useGhost();
  const p = useParticles();
  const rootRef = useRef<HTMLDivElement>(null);
  const pick = (i: number, x: number, y: number) => {
    if (i === cur || next) return;
    setNext({ i, x, y, k: Date.now() });
    sfx.whoosh(0.5);
    p.ring(x, y, THEMES[i].acc, 80, 0.5, 6);
  };
  useScript(run, async (wait) => {
    setCur(0);
    setNext(null);
    await wait(700);
    cue();
    for (const i of [1, 2, 3, 0]) {
      const bx = 42 + i * 72,
        by = 560;
      g.show(bx, by);
      await g.move(bx, by, 0.35);
      g.press(true);
      await wait(90);
      g.press(false);
      pick(i, bx, by);
      await wait(1300);
    }
    g.hide();
  });
  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden">
      <ThemeUI t={THEMES[cur]} />
      <AnimatePresence>
        {next && (
          <motion.div
            key={next.k}
            className="absolute inset-0"
            initial={{ clipPath: `circle(0px at ${next.x}px ${next.y}px)` }}
            animate={{ clipPath: `circle(760px at ${next.x}px ${next.y}px)` }}
            transition={{ duration: 0.75, ease: EASE.camera }}
            onAnimationComplete={() => {
              setCur(next.i);
              setNext(null);
              sfx.snap();
            }}
          >
            <ThemeUI t={THEMES[next.i]} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-3 bottom-5 z-10 grid grid-cols-4 gap-2 rounded-2xl bg-black/40 p-2 backdrop-blur">
        {THEMES.map((t, i) => (
          <motion.button
            key={t.n}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              const r = rootRef.current!.getBoundingClientRect();
              const b = e.currentTarget.getBoundingClientRect();
              pick(
                i,
                b.left - r.left + b.width / 2,
                b.top - r.top + b.height / 2,
              );
            }}
            className="flex flex-col items-center gap-1 rounded-xl py-1.5"
            animate={{ background: cur === i ? "#ffffff22" : "#00000000" }}
          >
            <span
              className="h-7 w-7 rounded-full border-2"
              style={{
                background: t.bg,
                borderColor: t.acc,
                boxShadow: cur === i ? `0 0 12px ${t.acc}` : "none",
              }}
            />
            <span className="text-[9px] font-bold text-white/80">{t.n}</span>
          </motion.button>
        ))}
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   80 · EFFECT TOGGLES — тумблеры меняют «сочность» превью
   ================================================================ */
const FX = [
  { k: "particles", n: "Частицы", icon: I.sparkle },
  { k: "shake", n: "Тряска экрана", icon: I.bolt },
  { k: "sound", n: "Звук", icon: I.bell },
  { k: "bounce", n: "Пружины", icon: I.layers },
  { k: "reduced", n: "Меньше движения", icon: I.eye },
] as const;
type FxKey = (typeof FX)[number]["k"];

export function EffectToggles({ run, cue }: SceneProps) {
  const [on, setOn] = useState<Record<FxKey, boolean>>({
    particles: true,
    shake: true,
    sound: true,
    bounce: true,
    reduced: false,
  });
  const [hits, setHits] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const btn = useRef<HTMLButtonElement>(null);
  const set = (k: FxKey, v: boolean) => {
    setOn((o) => {
      const n = { ...o, [k]: v };
      // «Меньше движения» — мастер: гасит тряску, частицы и пружины каскадом
      if (k === "reduced" && v) {
        (["particles", "shake", "bounce"] as FxKey[]).forEach((kk, i) =>
          window.setTimeout(
            () => setOn((oo) => ({ ...oo, [kk]: false })),
            80 + i * 90,
          ),
        );
      }
      return n;
    });
  };
  const test = () => {
    setHits((h) => h + 1);
    if (on.sound) sfx.hit(true);
    if (on.shake && !on.reduced && root)
      animate(root, shakeKeys(0.8, 12, 10, 1.5), { duration: 0.4 });
    if (on.particles && !on.reduced) {
      p.ring(150, 150, C, 120, 0.6, 8);
      p.burst({
        x: 150,
        y: 150,
        count: 50,
        colors: [C, "#fff", "#ffc34d"],
        speed: [150, 450],
      });
    }
    if (btn.current) {
      if (on.bounce && !on.reduced)
        animate(
          btn.current,
          { scale: [0.85, 1.12, 1] },
          { type: "spring", stiffness: 500, damping: 10 },
        );
      else animate(btn.current, { opacity: [0.5, 1] }, { duration: 0.25 });
    }
  };
  useScript(run, async (wait) => {
    setOn({
      particles: true,
      shake: true,
      sound: true,
      bounce: true,
      reduced: false,
    });
    await wait(700);
    cue();
    g.show(150, 150);
    g.press(true);
    await wait(90);
    g.press(false);
    test();
    await wait(900);
    // выключаем тряску
    await g.move(250, 330, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    set("shake", false);
    sfx.snap();
    await wait(400);
    await g.move(150, 150, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    test();
    await wait(900);
    // «меньше движения» — мастер
    await g.move(250, 466, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    set("reduced", true);
    sfx.snap();
    await wait(700);
    await g.move(150, 150, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    test();
    await wait(600);
    g.hide();
  });
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={C} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Эффекты</div>
        <div className="text-[10px] text-white/50">
          тестов <Roll value={hits} color={C} />
        </div>
      </div>
      <div className="absolute inset-x-0 top-[90px] flex justify-center">
        <motion.button
          ref={btn}
          onClick={test}
          whileTap={{ scale: 0.95 }}
          className="grid h-[110px] w-[110px] place-items-center rounded-full font-display text-sm font-black text-[#022]"
          style={{
            background: `radial-gradient(circle at 35% 30%, #b8f6ff, ${C} 55%, #0e7490)`,
            boxShadow: `0 0 40px -6px ${C}`,
          }}
        >
          ТЕСТ
        </motion.button>
      </div>
      <div className="absolute inset-x-4 top-[226px] space-y-2">
        {FX.map((f) => {
          const disabled = on.reduced && f.k !== "reduced" && f.k !== "sound";
          return (
            <motion.div
              key={f.k}
              className="glass flex h-12 items-center gap-3 rounded-xl px-3"
              animate={{
                opacity: disabled ? 0.45 : 1,
                borderColor: on[f.k] ? `${C}55` : "#ffffff14",
              }}
            >
              <span style={{ color: on[f.k] ? C : "#ffffff55" }}>
                <f.icon size={18} />
              </span>
              <span className="flex-1 text-[12px] font-bold">{f.n}</span>
              {f.k === "reduced" && (
                <span className="rounded bg-white/10 px-1.5 text-[8px] font-bold text-white/60">
                  A11Y
                </span>
              )}
              <Toggle
                on={on[f.k]}
                onChange={(v) => set(f.k, v)}
                color={f.k === "reduced" ? "#ffc34d" : C}
                size={0.85}
              />
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {on.reduced && (
          <motion.div
            key="rm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-4 bottom-5 rounded-xl border border-gold/40 bg-gold/10 p-2.5 text-[10px] text-gold"
          >
            Смысл сохраняется цветом и прозрачностью, но без тряски, частиц и
            пружин.
          </motion.div>
        )}
      </AnimatePresence>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   81 · SOUND MIXER — фейдеры + мастер-ручка + живой эквалайзер
   ================================================================ */
export function SoundMixer({ run, cue }: SceneProps) {
  const mus = useMotionValue(0.7);
  const sfxL = useMotionValue(0.85);
  const voice = useMotionValue(0.4);
  const master = useMotionValue(0.8);
  const [muted, setMuted] = useState(false);
  const [lv, setLv] = useState([0.7, 0.85, 0.4, 0.8]);
  const [t, setT] = useState(0);
  const g = useGhost();
  useMotionValueEvent(mus, "change", (v) =>
    setLv((l) => [v, l[1], l[2], l[3]]),
  );
  useMotionValueEvent(sfxL, "change", (v) =>
    setLv((l) => [l[0], v, l[2], l[3]]),
  );
  useMotionValueEvent(voice, "change", (v) =>
    setLv((l) => [l[0], l[1], v, l[3]]),
  );
  useMotionValueEvent(master, "change", (v) =>
    setLv((l) => [l[0], l[1], l[2], v]),
  );
  useEffect(() => {
    const iv = window.setInterval(() => setT((x) => x + 1), 90);
    return () => clearInterval(iv);
  }, []);
  const lastM = useRef(-1);
  useMotionValueEvent(master, "change", (v) => {
    const s = Math.round(v * 10);
    if (s !== lastM.current) {
      lastM.current = s;
      sfx.tick();
    }
  });
  const m = muted ? 0 : lv[3];
  const bars = Array.from({ length: 18 }, (_, i) => {
    const band = i < 6 ? lv[0] : i < 12 ? lv[1] : lv[2];
    const wob =
      (Math.sin(t * 0.7 + i * 1.3) + Math.sin(t * 0.37 + i * 2.1) + 2) / 4;
    return clamp(band * m * (0.35 + wob * 0.65));
  });
  useScript(run, async (wait) => {
    mus.set(0.7);
    sfxL.set(0.85);
    voice.set(0.4);
    master.set(0.8);
    setMuted(false);
    await wait(600);
    cue();
    const fader = async (mv: typeof mus, x: number, to: number) => {
      g.show(x, 520 - mv.get() * 140);
      g.press(true);
      await Promise.all([
        g.move(x, 520 - to * 140, 0.6),
        animate(mv, to, { duration: 0.6, ease: EASE.camera }),
      ]);
      g.press(false);
      await wait(300);
    };
    await fader(mus, 48, 0.2);
    await fader(voice, 128, 1);
    await g.move(230, 440, 0.4);
    g.press(true);
    await animate(master, 0.35, { duration: 0.6 });
    await animate(master, 1, { duration: 0.6 });
    g.press(false);
    await wait(300);
    await g.move(245, 110, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    setMuted(true);
    sfx.snap();
    await wait(900);
    g.press(true);
    await wait(90);
    g.press(false);
    setMuted(false);
    sfx.snap();
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={C} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Звук</div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
          без звука{" "}
          <Toggle on={muted} onChange={setMuted} color="#ff4d5e" size={0.8} />
        </div>
      </div>
      {/* эквалайзер */}
      <div className="glass absolute inset-x-4 top-[88px] flex h-[150px] items-end gap-1 rounded-2xl p-3">
        {bars.map((b, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            animate={{
              height: `${4 + b * 92}%`,
              background: i < 6 ? "#9b7bff" : i < 12 ? C : "#ffc34d",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            style={{
              boxShadow: `0 0 8px ${i < 6 ? "#9b7bff" : i < 12 ? C : "#ffc34d"}66`,
            }}
          />
        ))}
        <AnimatePresence>
          {muted && (
            <motion.div
              key="m"
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE.snap }}
              className="absolute inset-0 grid place-items-center font-display text-lg font-black text-bear"
            >
              MUTE
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-4 top-[252px] flex justify-between text-[9px] font-bold">
        <span className="text-[#9b7bff]">музыка</span>
        <span style={{ color: C }}>эффекты</span>
        <span className="text-gold">голос</span>
      </div>
      <div className="absolute left-4 top-[370px] flex gap-5">
        <VSlider mv={mus} color="#9b7bff" height={140} label="Музыка" />
        <VSlider mv={sfxL} color={C} height={140} label="Эффекты" />
        <VSlider mv={voice} color="#ffc34d" height={140} label="Голос" />
      </div>
      <div className="absolute right-4 top-[380px]">
        <Knob
          mv={master}
          size={120}
          color={muted ? "#ffffff33" : C}
          steps={20}
          label="Мастер"
        />
      </div>
      <div className="absolute right-4 top-[510px] w-[120px] text-center font-mono text-[11px] text-white/60">
        <Roll value={`${Math.round(m * 100)}%`} color={C} />
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   82 · SENSITIVITY PAD — чувствительность жестов на тест-площадке
   ================================================================ */
export function SensitivityPad({ run, cue }: SceneProps) {
  const sens = useMotionValue(0.5);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>(
    [],
  );
  const [s, setS] = useState(0.5);
  const g = useGhost();
  const p = useParticles();
  const base = useRef({ x: 0, y: 0 });
  const W = 120,
    H = 120;
  useMotionValueEvent(sens, "change", setS);
  const gain = 0.5 + s * 1.5;
  const friction = 1 - s * 0.6;
  const pushTrail = () =>
    setTrail((t) => [
      ...t.slice(-18),
      { x: px.get(), y: py.get(), id: Math.random() },
    ]);
  useMotionValueEvent(px, "change", pushTrail);
  const bounce = () => {
    sfx.tick();
    p.burst({
      x: 150 + px.get(),
      y: 250 + py.get(),
      count: 6,
      colors: [C, "#fff"],
      speed: [40, 120],
    });
  };
  const fling = (vx: number, vy: number) => {
    const cx = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));
    animate(px, cx(px.get() + vx * 0.25 * gain * friction, W), {
      type: "spring",
      stiffness: 90 * (1.5 - s),
      damping: 14 + (1 - s) * 10,
      velocity: vx * gain,
      onComplete: bounce,
    });
    animate(py, cx(py.get() + vy * 0.25 * gain * friction, H), {
      type: "spring",
      stiffness: 90 * (1.5 - s),
      damping: 14 + (1 - s) * 10,
      velocity: vy * gain,
    });
  };
  useScript(run, async (wait) => {
    sens.set(0.2);
    px.set(0);
    py.set(0);
    setTrail([]);
    await wait(600);
    cue();
    for (const level of [0.2, 0.95]) {
      sens.set(level);
      g.show(150, 250);
      g.press(true);
      await Promise.all([
        g.move(200, 220, 0.2),
        animate(px, 50 * (0.5 + level * 1.5) * 0.6, { duration: 0.2 }),
        animate(py, -30, { duration: 0.2 }),
      ]);
      g.press(false);
      fling(700, -300);
      await wait(1300);
      animate(px, 0, SPRING.panel);
      animate(py, 0, SPRING.panel);
      await wait(400);
      if (level === 0.2) {
        await g.move(24 + 0.2 * 252, 520, 0.4);
        g.press(true);
        await Promise.all([
          g.move(24 + 0.95 * 252, 520, 0.7),
          animate(sens, 0.95, { duration: 0.7, ease: EASE.camera }),
        ]);
        g.press(false);
        await wait(300);
      }
    }
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={C} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">
          Чувствительность жестов
        </div>
        <Roll
          value={`x${gain.toFixed(1)}`}
          color={C}
          className="font-mono text-[11px] font-bold"
        />
      </div>
      <div className="absolute left-1/2 top-[250px] h-[260px] w-[260px] -ml-[130px] -mt-[130px] rounded-3xl border border-white/10 bg-black/30">
        <div className="grid-bg absolute inset-0 rounded-3xl opacity-70" />
        <svg
          viewBox="-130 -130 260 260"
          className="absolute inset-0 h-full w-full"
        >
          {trail.map((q, i) => (
            <circle
              key={q.id}
              cx={q.x}
              cy={q.y}
              r={2 + (i / trail.length) * 6}
              fill={C}
              opacity={(i / trail.length) * 0.6}
            />
          ))}
        </svg>
        <motion.div
          className="absolute left-1/2 top-1/2 h-14 w-14 -ml-7 -mt-7 cursor-grab touch-none rounded-full active:cursor-grabbing"
          style={{
            x: px,
            y: py,
            background: `radial-gradient(circle at 35% 30%, #b8f6ff, ${C} 55%, #0e7490)`,
            boxShadow: `0 0 24px ${C}`,
          }}
          onPanStart={() => {
            base.current = { x: px.get(), y: py.get() };
            px.stop();
            py.stop();
            sfx.tap();
          }}
          onPan={(_, i) => {
            px.set(
              Math.max(-W, Math.min(W, base.current.x + i.offset.x * gain)),
            );
            py.set(
              Math.max(-H, Math.min(H, base.current.y + i.offset.y * gain)),
            );
          }}
          onPanEnd={(_, i) => fling(i.velocity.x, i.velocity.y)}
          whileTap={{ scale: 1.15 }}
        />
      </div>
      <div className="absolute inset-x-6 top-[400px] grid grid-cols-2 gap-2 text-center">
        <div className="glass rounded-xl py-2">
          <div className="text-[9px] text-white/45">Усиление</div>
          <div className="font-display text-sm font-black" style={{ color: C }}>
            <Roll value={`x${gain.toFixed(1)}`} />
          </div>
        </div>
        <div className="glass rounded-xl py-2">
          <div className="text-[9px] text-white/45">Инерция</div>
          <div className="font-display text-sm font-black" style={{ color: C }}>
            <Roll value={`${Math.round(s * 100)}%`} />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-6 top-[466px]">
        <Slider
          mv={sens}
          color={C}
          label="Чувствительность"
          marks={["точно", "", "быстро"]}
        />
      </div>
      <div className="absolute inset-x-6 bottom-5 text-center text-[10px] text-white/40">
        Брось шайбу. Высокая чувствительность — дальше и дольше катится.
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   83 · HAPTIC PATTERNS — карусель вибро-паттернов с осциллограммой
   ================================================================ */
const PATTERNS = [
  { n: "Тап", p: [8], c: "#22d3ee", play: () => sfx.tap() },
  { n: "Удар", p: [22], c: "#ff4d5e", play: () => sfx.hit() },
  { n: "Крит", p: [30, 20, 45], c: "#ffc34d", play: () => sfx.crit() },
  { n: "Ошибка", p: [40, 50, 40], c: "#ff8a3d", play: () => sfx.error() },
  {
    n: "Уровень",
    p: [20, 40, 20, 40, 60],
    c: "#9b7bff",
    play: () => sfx.levelup(),
  },
  { n: "Сердце", p: [25, 150, 18], c: "#ff6bd6", play: () => sfx.heartbeat(1) },
];

function HapticWave({
  p,
  c,
  k,
  w = 200,
}: {
  p: number[];
  c: string;
  k: number;
  w?: number;
}) {
  const total = p.reduce((s, v) => s + v, 0);
  let cur = 0;
  const segs = p.map((ms, i) => {
    const x = (cur / total) * w;
    cur += ms;
    return { x, w: Math.max(3, (ms / total) * w), on: i % 2 === 0, i };
  });
  return (
    <svg
      viewBox={`0 0 ${w} 60`}
      className="h-[60px] w-full"
      preserveAspectRatio="none"
    >
      <line x1="0" x2={w} y1="30" y2="30" stroke="#ffffff22" />
      {segs
        .filter((s) => s.on)
        .map((s) => (
          <motion.rect
            key={`${s.i}-${k}`}
            x={s.x}
            width={s.w}
            rx="2"
            fill={c}
            initial={{ y: 28, height: 4, opacity: 0.4 }}
            animate={{ y: [28, 6, 14], height: [4, 48, 32], opacity: 1 }}
            transition={{
              delay: k ? (s.x / w) * 0.5 : 0,
              duration: 0.35,
              ease: EASE.outExpo,
            }}
            style={{ filter: `drop-shadow(0 0 6px ${c})` }}
          />
        ))}
    </svg>
  );
}

export function HapticPatterns({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [k, setK] = useState(0);
  const g = useGhost();
  const p = useParticles();
  const P = PATTERNS[idx];
  const play = (i: number) => {
    PATTERNS[i].play();
    setK((x) => x + 1);
    p.ring(150, 200, PATTERNS[i].c, 110, 0.5, 6);
    p.burst({
      x: 150,
      y: 200,
      count: 10 + PATTERNS[i].p.length * 6,
      colors: [PATTERNS[i].c, "#fff"],
      speed: [80, 240],
    });
  };
  useScript(run, async (wait) => {
    setIdx(0);
    await wait(600);
    cue();
    g.show(220, 200);
    for (const n of [1, 2, 4]) {
      g.press(true);
      await g.move(90, 200, 0.3);
      g.press(false);
      setIdx(n);
      await wait(350);
      await g.move(150, 200, 0.2);
      g.press(true);
      await wait(80);
      g.press(false);
      play(n);
      await wait(1000);
      await g.move(220, 200, 0.2);
    }
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={P.c} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Вибро-паттерны</div>
        <div className="font-mono text-[10px] text-white/50">
          {P.p.join(" · ")} мс
        </div>
      </div>
      <div className="absolute inset-x-0 top-[100px]">
        <XCarousel
          count={PATTERNS.length}
          index={idx}
          onIndex={setIdx}
          step={150}
          mode="flat"
          height={200}
          onTapActive={play}
          render={(i, a) => {
            const pt = PATTERNS[i];
            return (
              <div
                className="flex h-[180px] w-[140px] flex-col items-center justify-center gap-2 rounded-3xl border p-3"
                style={{
                  borderColor: `${pt.c}66`,
                  background: `linear-gradient(170deg, ${pt.c}22, #0c1428 60%)`,
                  boxShadow: a ? `0 16px 40px -12px ${pt.c}` : "none",
                }}
              >
                <div
                  className="font-display text-base font-black"
                  style={{ color: pt.c }}
                >
                  {pt.n}
                </div>
                <HapticWave p={pt.p} c={pt.c} k={a ? k : 0} w={120} />
                <div className="text-[9px] text-white/45">
                  {Math.ceil(pt.p.length / 2)} имп.
                </div>
              </div>
            );
          }}
        />
      </div>
      <div className="glass absolute inset-x-4 top-[320px] rounded-2xl p-3">
        <div className="text-[9px] font-bold uppercase tracking-[.2em] text-white/40">
          Осциллограмма
        </div>
        <HapticWave p={P.p} c={P.c} k={k} w={260} />
      </div>
      <motion.button
        onClick={() => play(idx)}
        whileTap={{ scale: 0.9 }}
        className="absolute left-1/2 top-[440px] -ml-[44px] grid h-[88px] w-[88px] place-items-center rounded-full font-display text-xs font-black text-black"
        animate={{ background: P.c, boxShadow: `0 0 30px -4px ${P.c}` }}
      >
        ИГРАТЬ
      </motion.button>
      <div className="absolute inset-x-6 bottom-5 text-center text-[10px] text-white/40">
        На телефоне со включённым звуком паттерн ощущается вибрацией
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_SETTINGS: Category = {
  id: "settings",
  n: "24",
  title: "Настройки как игра",
  en: "Theme reveal · FX toggles · Mixer · Sensitivity",
  color: C,
  blurb:
    "Даже экран настроек может быть сочным: тема раскрывается кругом из точки касания, тумблеры меняют «сочность» превью, микшер оживляет эквалайзер, площадка проверяет чувствительность жестов.",
  scenes: [
    {
      id: "theme",
      n: "79",
      title: "Круговая смена темы",
      kind: "Circular reveal",
      lead: "Тап по теме запускает круговое раскрытие новой темы из точки касания: круг clip-path растёт до края экрана, открывая тот же интерфейс в новых цветах. Кольцо-импульс отмечает точку, по завершении старая тема заменяется.",
      secrets: [
        "Два слоя одного UI: старая тема внизу, новая сверху под clip-path circle(0 → 760px at x y). Никакой перерисовки — только маска.",
        "Центр круга = точка касания. Изменение исходит от пальца — причинность считывается мгновенно.",
        "По завершении раскрытия новая тема становится базовым слоем, верхний удаляется — состояние всегда одно.",
        "Кривая camera: медленный старт (виден центр), быстрая середина, мягкий финиш у краёв.",
        "Повторный тап во время раскрытия игнорируется — никаких мигающих гонок анимаций.",
      ],
      tracks: [
        { label: "→ Золото", start: 700, dur: 750, color: "#ffc34d" },
        { label: "→ Кровь", start: 2350, dur: 750, color: "#ff4d5e" },
        { label: "→ Лёд", start: 4000, dur: 750, color: "#2563eb" },
        { label: "→ Неон", start: 5650, dur: 750, color: "#2ee6c5" },
      ],
      total: 6600,
      ease: { bez: EASE.camera, label: "camera — раскрытие" },
      code: `<ThemeUI t={THEMES[cur]} />
<motion.div
  initial={{ clipPath: \`circle(0px at \${x}px \${y}px)\` }}
  animate={{ clipPath: \`circle(760px at \${x}px \${y}px)\` }}
  transition={{ duration: .75, ease: EASE.camera }}
  onAnimationComplete={() => { setCur(next); setNext(null); }}>
  <ThemeUI t={THEMES[next]} />
</motion.div>`,
      C: ThemeReveal,
      interactive: "Тапай по темам",
    },
    {
      id: "fxtoggles",
      n: "80",
      title: "Тумблеры эффектов",
      kind: "Juice switches",
      lead: "Кнопка «Тест» показывает текущую «сочность»: частицы, тряску, звук, пружины. Каждый тумблер отключает свой слой. «Меньше движения» — мастер-режим доступности: каскадом гасит тряску, частицы и пружины, оставляя смысл цветом и прозрачностью.",
      secrets: [
        "Сочность = сумма слоёв. Отключая их по одному, игрок буквально слышит и видит, из чего собран удар.",
        "«Меньше движения» каскадно выключает три тумблера с шагом 90мс — пользователь видит, что именно изменилось.",
        "При reduced motion кнопка не пружинит, а мигает прозрачностью: обратная связь остаётся, движение — нет.",
        "Звук не отключается режимом доступности — это разные потребности, и интерфейс их не смешивает.",
        "Бейдж A11Y рядом с мастер-тумблером — доступность подана как функция, а не как ограничение.",
      ],
      tracks: [
        { label: "Тест: всё вкл", start: 700, dur: 500, color: C },
        { label: "Тряска off", start: 1700, dur: 300, color: "#ffffff" },
        { label: "Тест без тряски", start: 2500, dur: 500, color: C },
        { label: "Reduced → каскад", start: 3900, dur: 400, color: "#ffc34d" },
        { label: "Тест минимальный", start: 5100, dur: 300, color: "#ffc34d" },
      ],
      total: 5700,
      ease: { bez: EASE.overshoot, label: "overshoot — кнопка" },
      code: `if (k === "reduced" && v)
  ["particles", "shake", "bounce"].forEach((kk, i) =>
    setTimeout(() => setOn(o => ({ ...o, [kk]: false })), 80 + i * 90));

on.bounce && !on.reduced
  ? animate(btn, { scale: [.85, 1.12, 1] }, { type: "spring", damping: 10 })
  : animate(btn, { opacity: [.5, 1] }, { duration: .25 });   // смысл без движения`,
      C: EffectToggles,
      interactive: "Щёлкай тумблеры и тест",
    },
    {
      id: "mixer",
      n: "81",
      title: "Микшер звука",
      kind: "Faders + knob",
      lead: "Три вертикальных фейдера — музыка, эффекты, голос — и мастер-ручка управляют живым эквалайзером: его полосы разбиты на три группы цветов и «дышат» с амплитудой уровня. Тумблер Mute гасит все полосы со штампом.",
      secrets: [
        "Полосы эквалайзера = уровень группы × мастер × (0.35 + колебание·0.65). Колебание — сумма двух синусоид с разными частотами: без повторений.",
        "Цвет полосы = цвет её фейдера — игрок видит, какая ручка за что отвечает, без подписи.",
        "Полосы следуют пружиной 400/22 — они «пружинят», а не прыгают по кадрам.",
        "Мастер-ручка тикает каждые 10% — громкость чувствуется ступенями.",
        "Mute — штамп поверх эквалайзера, а не просто нули: состояние явное.",
      ],
      tracks: [
        { label: "Музыка ↓", start: 600, dur: 600, color: "#9b7bff" },
        { label: "Голос ↑", start: 1500, dur: 600, color: "#ffc34d" },
        { label: "Мастер вниз/вверх", start: 2800, dur: 1200, color: C },
        { label: "Mute", start: 4700, dur: 900, color: "#ff4d5e" },
      ],
      total: 5800,
      ease: { bez: EASE.camera, label: "camera — фейдер" },
      code: `const wob = (Math.sin(t * .7 + i * 1.3) + Math.sin(t * .37 + i * 2.1) + 2) / 4;
const h = band * master * (.35 + wob * .65);
<motion.div animate={{ height: \`\${4 + h * 92}%\` }}
  transition={{ type: "spring", stiffness: 400, damping: 22 }} />`,
      C: SoundMixer,
      interactive: "Двигай фейдеры и ручку",
    },
    {
      id: "sensitivity",
      n: "82",
      title: "Чувствительность жестов",
      kind: "Physics test pad",
      lead: "Слайдер чувствительности меняет усиление жеста и инерцию. Шайбу на тест-площадке бросают пальцем: она летит с пружиной, оставляя светящийся след, и искрит при остановке. Низкая чувствительность — точно и коротко, высокая — далеко и долго.",
      secrets: [
        "Усиление: смещение ×(0.5 + s·1.5). Палец проходит тот же путь — шайба разный.",
        "Бросок — пружина, получающая velocity жеста ×усиление; жёсткость и затухание тоже от s: инерция настраивается физически.",
        "След — 18 последних точек с растущим радиусом и прозрачностью: траектория читается как комета.",
        "Демо бросает шайбу одинаково на двух настройках — разница видна наглядно.",
        "Искры при остановке (onComplete) — «приземление» подтверждено.",
      ],
      tracks: [
        { label: "Бросок (точно)", start: 600, dur: 1500, color: C },
        { label: "Слайдер → быстро", start: 2600, dur: 700, color: C },
        { label: "Бросок (быстро)", start: 3600, dur: 1500, color: "#ffc34d" },
      ],
      total: 5400,
      ease: { bez: EASE.outExpo, label: "≈ spring броска" },
      code: `const gain = .5 + s * 1.5;
onPan={(_, i) => px.set(base.x + i.offset.x * gain)}
onPanEnd={(_, i) => animate(px, target, {
  type: "spring", velocity: i.velocity.x * gain,
  stiffness: 90 * (1.5 - s), damping: 14 + (1 - s) * 10,
})}`,
      C: SensitivityPad,
      interactive: "Брось шайбу, меняй чувствительность",
    },
    {
      id: "haptics",
      n: "83",
      title: "Вибро-паттерны",
      kind: "Haptic carousel",
      lead: "Карусель паттернов вибрации: тап, удар, крит, ошибка, уровень, сердцебиение. У каждого — своя осциллограмма, импульсы которой «выстреливают» слева направо при проигрывании синхронно со звуком и вибрацией телефона.",
      secrets: [
        "Паттерн — массив [вибрация, пауза, вибрация…] в мс. Та же структура, что у navigator.vibrate, — дизайн и код говорят на одном языке.",
        "Импульсы на осциллограмме появляются с задержкой пропорционально их позиции во времени: визуал проигрывает ритм.",
        "Каждый импульс — keyframes высоты [4, 48, 32]: пик и удержание, как у настоящего мотора вибрации.",
        "Крит = три импульса с короткой паузой, ошибка = три длинных. Характер события кодируется ритмом, а не силой.",
        "Кольцо и частицы масштабируются количеством импульсов — сложный паттерн выглядит богаче.",
      ],
      tracks: [
        { label: "→ Удар", start: 600, dur: 1500, color: "#ff4d5e" },
        { label: "→ Крит", start: 2400, dur: 1500, color: "#ffc34d" },
        { label: "→ Уровень", start: 4200, dur: 1500, color: "#9b7bff" },
      ],
      total: 6000,
      ease: { bez: EASE.outExpo, label: "outExpo — импульс" },
      code: `const PATTERNS = [{ n: "Крит", p: [30, 20, 45], play: () => sfx.crit() }];
navigator.vibrate(pattern.p);                       // та же структура
<motion.rect animate={{ height: [4, 48, 32] }}
  transition={{ delay: (seg.x / w) * .5, ease: EASE.outExpo }} />`,
      C: HapticPatterns,
      interactive: "Листай и проигрывай",
    },
  ],
};
