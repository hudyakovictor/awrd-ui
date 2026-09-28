import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import enemy from "../assets/enemy.jpg";
import type { Category } from "../data/catalog";
import {
  Carousel,
  HoldButton,
  Segmented,
  Roll,
  Slider,
  useGhost,
} from "../components/controls";
import { I } from "../components/kit";
import {
  ParticleCanvas,
  centerIn,
  useParticles,
} from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

/* ================================================================
   HEROES — 5 архетипов трейдера. Один арт, разные hue-rotate +
   цвет ауры: экономия ассетов без потери различимости.
   ================================================================ */
const HEROES = [
  {
    n: "Тень",
    role: "Скальпер",
    img: hood,
    hue: 0,
    c: "#3ddc84",
    st: [0.9, 0.4, 0.7],
    icon: I.eye,
    q: "Вижу ловушку за две свечи",
  },
  {
    n: "Инферно",
    role: "Моментум",
    img: enemy,
    hue: 0,
    c: "#ff4d5e",
    st: [0.6, 0.95, 0.3],
    icon: I.flame,
    q: "Скорость решает всё",
  },
  {
    n: "Оракул",
    role: "Аналитик",
    img: hood,
    hue: 190,
    c: "#4cc3ff",
    st: [0.95, 0.3, 0.85],
    icon: I.brain,
    q: "Данные не лгут",
  },
  {
    n: "Страж",
    role: "Риск-менеджер",
    img: hood,
    hue: 90,
    c: "#ffc34d",
    st: [0.5, 0.5, 0.95],
    icon: I.shield,
    q: "Сначала — защита капитала",
  },
  {
    n: "Фантом",
    role: "Контрарианец",
    img: enemy,
    hue: 220,
    c: "#9b7bff",
    st: [0.75, 0.7, 0.6],
    icon: I.sparkle,
    q: "Толпа всегда опаздывает",
  },
];
const STAT_N = ["Анализ", "Агрессия", "Хладнокровие"];

function HeroCard({
  h,
  active,
}: {
  h: (typeof HEROES)[number];
  active: boolean;
}) {
  return (
    <div
      className="relative h-[200px] w-[140px] overflow-hidden rounded-2xl p-[3px]"
      style={{
        background: `linear-gradient(160deg, ${h.c}, #1a2440 55%, ${h.c}88)`,
        boxShadow: active
          ? `0 20px 50px -10px ${h.c}`
          : "0 10px 30px -10px #000",
      }}
    >
      <div className="relative h-full overflow-hidden rounded-[13px] bg-[#0c1428]">
        <motion.img
          src={h.img}
          draggable={false}
          className="mask-bottom absolute inset-0 h-[150px] w-full object-cover"
          style={{
            filter: `hue-rotate(${h.hue}deg) saturate(${active ? 1.2 : 0.6})`,
          }}
          animate={{ scale: active ? 1.08 : 1 }}
          transition={{ duration: 0.8, ease: EASE.outExpo }}
        />
        <div className="absolute inset-x-0 bottom-0 p-2.5 text-center">
          <div
            className="text-[8px] font-bold uppercase tracking-[.25em]"
            style={{ color: h.c }}
          >
            {h.role}
          </div>
          <div className="font-display text-base font-black">{h.n}</div>
        </div>
        {active && <div className="sheen absolute inset-0" />}
      </div>
    </div>
  );
}

/* Способности: 3 на героя. Тап по чипу раскрывает подсказку-морф. */
const ABIL: Record<string, { t: string; d: string }[]> = {
  Тень: [
    { t: "Засада", d: "Видит ложный пробой за 2 свечи" },
    { t: "Тихий вход", d: "Вход с половиной риска" },
    { t: "Растворение", d: "Отмена ошибки раз в бой" },
  ],
  Инферно: [
    { t: "Импульс", d: "+50% урона на трендовых сценариях" },
    { t: "Разгон", d: "Каждое комбо ускоряет таймер" },
    { t: "Пекло", d: "Крит с 2 верных, а не с 3" },
  ],
  Оракул: [
    { t: "Прозрение", d: "Показывает 1 свечу будущего" },
    { t: "Сводка", d: "Подсветка ключевых уровней" },
    { t: "Холодный расчёт", d: "+10% к оценке процесса" },
  ],
  Страж: [
    { t: "Щит", d: "Первая ошибка без потери сердца" },
    { t: "Стоп-линия", d: "Авто-стоп на каждом входе" },
    { t: "Бастион", d: "+1 сердце в боссах" },
  ],
  Фантом: [
    { t: "Против толпы", d: "Бонус за вход против FOMO" },
    { t: "Мираж", d: "Скрывает шумовые новости" },
    { t: "Разворот", d: "x2 XP за контртрендовые решения" },
  ],
};

function Abilities({ hero, color }: { hero: string; color: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const list = ABIL[hero] ?? [];
  return (
    <div className="relative">
      <div className="flex justify-center gap-2">
        {list.map((a, i) => (
          <motion.button
            key={hero + i}
            initial={{ scale: 0, y: 10 }}
            animate={{
              scale: 1,
              y: 0,
              background: open === i ? color : "#ffffff0d",
              color: open === i ? "#04121a" : "#ffffffcc",
            }}
            transition={{ delay: i * 0.05, ...SPRING.reward }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              sfx.pop(i * 3);
              setOpen((o) => (o === i ? null : i));
            }}
            className="rounded-full border px-2.5 py-1 text-[10px] font-bold"
            style={{ borderColor: `${color}55` }}
          >
            {a.t}
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {open !== null && list[open] && (
          <motion.div
            key={hero + open}
            initial={{ opacity: 0, y: -6, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.95,
              transition: { duration: 0.12 },
            }}
            transition={SPRING.panel}
            className="absolute inset-x-2 top-8 z-10 rounded-xl border bg-[#0c1428]/95 p-2 text-center text-[10px] text-white/75 backdrop-blur"
            style={{
              borderColor: `${color}66`,
              boxShadow: `0 10px 30px -10px ${color}`,
            }}
          >
            {list[open].d}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   32 · COVERFLOW HERO SELECT
   ================================================================ */
export function CoverflowHeroes({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const x = useMotionValue(0);
  const g = useGhost();
  const p = useParticles();
  const root = useRef<HTMLDivElement>(null);
  const h = HEROES[idx];
  // фон «тянется» за пальцем: параллакс от сырого x карусели
  const bgX = useTransform(x, (v) => v * 0.15);
  const ringR = useTransform(x, (v) => v * 0.4);

  const select = (i: number) => {
    setPicked(i);
    sfx.success();
    const c = centerIn(
      root.current?.querySelector("[data-center]") ?? null,
      root.current,
    );
    p.ring(150, c.y || 230, HEROES[i].c, 160, 0.7, 8);
    p.burst({
      x: 150,
      y: c.y || 230,
      count: 50,
      colors: [HEROES[i].c, "#fff"],
      speed: [150, 480],
    });
    window.setTimeout(() => setPicked(null), 1600);
  };

  useScript(run, async (wait) => {
    setIdx(0);
    setPicked(null);
    await wait(500);
    cue();
    g.show(210, 250);
    for (const n of [1, 2, 3]) {
      g.press(true);
      await g.move(90, 250, 0.35);
      g.press(false);
      setIdx(n);
      await wait(550);
      await g.move(210, 250, 0.25);
    }
    g.press(true);
    await g.move(250, 252, 0.3);
    g.press(false);
    setIdx(2);
    await wait(500);
    await g.move(150, 250, 0.3);
    g.press(true);
    await wait(120);
    g.press(false);
    select(2);
    await wait(400);
    g.hide();
  });

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={h.c} />
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `radial-gradient(70% 45% at 50% 38%, ${h.c}33, transparent 70%)`,
        }}
        transition={{ duration: 0.6 }}
      />
      <motion.svg
        viewBox="-150 -150 300 300"
        className="absolute left-1/2 top-[70px] h-[320px] w-[320px] -ml-[160px] opacity-40"
        style={{ x: bgX, rotate: ringR }}
      >
        {Array.from({ length: 48 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1="-140"
            x2="0"
            y2={i % 4 ? -132 : -124}
            stroke={h.c}
            strokeWidth={i % 4 ? 1 : 2}
            transform={`rotate(${i * 7.5})`}
          />
        ))}
      </motion.svg>
      <div className="absolute inset-x-0 top-11 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/45">
          Выбери героя
        </div>
      </div>
      <div className="absolute inset-x-0 top-[84px]" data-center>
        <Carousel
          count={HEROES.length}
          index={idx}
          onIndex={setIdx}
          step={150}
          mode="cover"
          height={220}
          xOut={x}
          onTapActive={select}
          render={(i, a) => <HeroCard h={HEROES[i]} active={a} />}
        />
      </div>
      <div className="absolute inset-x-5 top-[322px]">
        <div className="flex items-center justify-center gap-2">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={idx}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={SPRING.reward}
              style={{ color: h.c }}
            >
              <h.icon size={18} />
            </motion.span>
          </AnimatePresence>
          <div className="relative h-7 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={idx}
                initial={{ y: 28 }}
                animate={{ y: 0 }}
                exit={{ y: -28 }}
                transition={SPRING.panel}
                className="font-display text-xl font-black"
              >
                {h.n}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1 text-center text-[11px] italic text-white/55"
          >
            «{h.q}»
          </motion.div>
        </AnimatePresence>
        <div className="mt-2">
          <Abilities hero={h.n} color={h.c} />
        </div>
        <div className="mt-3 space-y-2">
          {h.st.map((v, i) => (
            <div key={i}>
              <div className="mb-1 flex justify-between text-[10px] font-bold">
                <span className="text-white/55">{STAT_N[i]}</span>
                <Roll value={Math.round(v * 100)} color={h.c} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${v * 100}%`, background: h.c }}
                  transition={{
                    type: "spring",
                    stiffness: 180,
                    damping: 20,
                    delay: i * 0.05,
                  }}
                  style={{ boxShadow: `0 0 10px ${h.c}` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-20 flex justify-center gap-1.5">
        {HEROES.map((hh, i) => (
          <motion.button
            key={i}
            onClick={() => setIdx(i)}
            animate={{
              width: i === idx ? 22 : 7,
              background: i === idx ? hh.c : "#ffffff33",
            }}
            transition={SPRING.panel}
            className="h-[7px] rounded-full"
          />
        ))}
      </div>
      <motion.button
        onClick={() => select(idx)}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 rounded-2xl py-3 font-display text-sm font-black text-[#051018]"
        animate={{ background: h.c, boxShadow: `0 8px 30px -6px ${h.c}` }}
      >
        ВЫБРАТЬ
      </motion.button>
      <AnimatePresence>
        {picked !== null && (
          <motion.div
            key="pick"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 grid place-items-center bg-black/50 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 2.6, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: -6, opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE.snap }}
              className="rounded-xl border-4 px-4 py-2 font-display text-2xl font-black"
              style={{
                borderColor: HEROES[picked].c,
                color: HEROES[picked].c,
                textShadow: `0 0 20px ${HEROES[picked].c}`,
              }}
            >
              {HEROES[picked].n.toUpperCase()} В ОТРЯДЕ
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   33 · STAT FORGE — бюджет очков, радар морфит от слайдеров
   ================================================================ */
const BUDGET = 1.8;
const CLASSES = [
  { n: "АНАЛИТИК", c: "#4cc3ff" },
  { n: "ШТУРМОВИК", c: "#ff4d5e" },
  { n: "СТРАЖ", c: "#3ddc84" },
  { n: "УНИВЕРСАЛ", c: "#ffc34d" },
];

function radarPoint(i: number, v: number, R = 80) {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
  return [Math.cos(a) * R * v, Math.sin(a) * R * v];
}

const PRESETS = [
  { n: "Баланс", v: [0.6, 0.6, 0.6] },
  { n: "Ум", v: [0.95, 0.25, 0.6] },
  { n: "Штурм", v: [0.4, 0.95, 0.45] },
  { n: "Броня", v: [0.45, 0.35, 0.95] },
];

export function StatForge({ run, cue }: SceneProps) {
  const [preset, setPreset] = useState(0);
  const a = useMotionValue(0.6);
  const b = useMotionValue(0.6);
  const c = useMotionValue(0.6);
  const mvs = [a, b, c];
  const [over, setOver] = useState(false);
  const [cls, setCls] = useState(3);
  const g = useGhost();
  const p = useParticles();
  const shakeRef = useRef<HTMLDivElement>(null);
  const pts = useTransform([a, b, c], ([x, y, z]: number[]) =>
    [x, y, z]
      .map((v, i) => radarPoint(i, Math.max(0.08, v)).join(","))
      .join(" "),
  );
  const used = useTransform([a, b, c], ([x, y, z]: number[]) => x + y + z);
  const usedW = useTransform(used, (u) => `${Math.min(1, u / BUDGET) * 100}%`);
  const usedC = useTransform(used, (u) =>
    u > BUDGET ? "#ff4d5e" : u > BUDGET * 0.9 ? "#ffc34d" : "#2ee6c5",
  );
  const left = useTransform(
    used,
    (u) => `${Math.max(0, Math.round((BUDGET - u) * 100))}`,
  );

  const evaluate = () => {
    const v = mvs.map((m) => m.get());
    const sum = v[0] + v[1] + v[2];
    setOver(sum > BUDGET + 0.001);
    const mx = Math.max(...v);
    const spread = mx - Math.min(...v);
    const nc =
      spread < 0.18 ? 3 : v.indexOf(mx) === 0 ? 0 : v.indexOf(mx) === 1 ? 1 : 2;
    setCls((prev) => {
      if (prev !== nc) {
        sfx.pop(nc * 3);
        p.burst({
          x: 150,
          y: 150,
          count: 20,
          colors: [CLASSES[nc].c, "#fff"],
          speed: [80, 220],
        });
      }
      return nc;
    });
  };
  useMotionValueEvent(used, "change", evaluate);

  // Если бюджет превышен — при отпускании слайдер «откатывается» к лимиту
  const commit = (k: number) => {
    const others = mvs.reduce((s, m, i) => (i === k ? s : s + m.get()), 0);
    const max = BUDGET - others;
    if (mvs[k].get() > max) {
      sfx.error();
      if (shakeRef.current)
        animate(shakeRef.current, shakeKeys(0.5, 10, 8, 0), { duration: 0.35 });
      animate(mvs[k], clamp(max), {
        type: "spring",
        stiffness: 300,
        damping: 14,
      });
    } else sfx.snap();
  };

  useScript(run, async (wait) => {
    mvs.forEach((m) => m.set(0.6));
    setPreset(0);
    await wait(500);
    cue();
    const demo = async (k: number, to: number) => {
      const y = 402 + k * 52;
      g.show(40 + mvs[k].get() * 220, y);
      g.press(true);
      await Promise.all([
        g.move(40 + to * 220, y, 0.7),
        animate(mvs[k], to, { duration: 0.7, ease: EASE.camera }),
      ]);
      g.press(false);
      commit(k);
      await wait(450);
    };
    await demo(0, 0.95);
    await demo(1, 0.2);
    await demo(2, 0.95);
    await demo(1, 0.5);
    g.hide();
    await wait(300);
    for (const k of [2, 3, 0]) {
      setPreset(k);
      sfx.tap();
      PRESETS[k].v.forEach((v, i) =>
        animate(mvs[i], v, {
          type: "spring",
          stiffness: 220,
          damping: 20,
          delay: i * 0.06,
        }),
      );
      await wait(900);
    }
  });

  const C = CLASSES[cls];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={C.c} />
      <div className="absolute inset-x-0 top-11 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[.3em] text-white/45">
          Кузница характеристик
        </div>
        <div className="relative mx-auto mt-1 h-7 w-48 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={cls}
              initial={{ y: 30, rotateX: -90 }}
              animate={{ y: 0, rotateX: 0 }}
              exit={{ y: -30, rotateX: 90 }}
              transition={SPRING.reward}
              className="absolute inset-0 font-display text-xl font-black"
              style={{ color: C.c, textShadow: `0 0 18px ${C.c}` }}
            >
              {C.n}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <svg
        viewBox="-110 -110 220 220"
        className="absolute left-1/2 top-[96px] h-[220px] w-[220px] -ml-[110px]"
      >
        {[0.33, 0.66, 1].map((r) => (
          <polygon
            key={r}
            points={[0, 1, 2].map((i) => radarPoint(i, r).join(",")).join(" ")}
            fill="none"
            stroke="#ffffff1a"
          />
        ))}
        {[0, 1, 2].map((i) => {
          const [x, y] = radarPoint(i, 1);
          const [lx, ly] = radarPoint(i, 1.24);
          return (
            <g key={i}>
              <line x1="0" y1="0" x2={x} y2={y} stroke="#ffffff1a" />
              <text
                x={lx}
                y={ly + 3}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="#ffffff88"
              >
                {STAT_N[i]}
              </text>
            </g>
          );
        })}
        <motion.polygon
          points={pts}
          fill={`${C.c}33`}
          stroke={C.c}
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 8px ${C.c})` }}
        />
      </svg>
      <div ref={shakeRef} className="absolute inset-x-5 top-[330px]">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-white/50">Очки навыков</span>
          <span className="text-white/70">
            осталось{" "}
            <motion.span className="font-mono" style={{ color: usedC }}>
              {left}
            </motion.span>
          </span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: usedW,
              background: usedC,
              boxShadow: "0 0 10px currentColor",
            }}
          />
        </div>
        <AnimatePresence>
          {over && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 text-center text-[10px] font-bold text-bear"
            >
              Превышен бюджет — отпусти, чтобы вернуть к лимиту
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Пресеты билдов: один тап — три слайдера едут каскадом */}
      <div className="absolute inset-x-5 top-[536px]">
        <Segmented
          options={PRESETS.map((x) => x.n)}
          value={preset}
          color={C.c}
          onChange={(k) => {
            setPreset(k);
            PRESETS[k].v.forEach((v, i) =>
              animate(mvs[i], v, {
                type: "spring",
                stiffness: 220,
                damping: 20,
                delay: i * 0.06,
              }),
            );
          }}
        />
      </div>
      <div className="absolute inset-x-5 top-[380px] space-y-3">
        {mvs.map((m, i) => (
          <Slider
            key={i}
            mv={m}
            label={STAT_N[i]}
            color={["#4cc3ff", "#ff4d5e", "#3ddc84"][i]}
            onCommit={() => commit(i)}
            format={(v) => `${Math.round(v * 100)}`}
          />
        ))}
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   34 · LOCK-IN — удержание: заряд, раскрашивание, энергия
   ================================================================ */
export function LockIn({ run, cue }: SceneProps) {
  const prog = useMotionValue(0);
  const [locked, setLocked] = useState(false);
  const [scope, setScope] = useState<HTMLDivElement | null>(null);
  const p = useParticles();
  const g = useGhost();
  const gray = useTransform(
    prog,
    (v) => `grayscale(${1 - v}) brightness(${0.5 + v * 0.7})`,
  );
  const portraitScale = useTransform(prog, [0, 1], [0.9, 1.05]);
  const aura = useTransform(
    prog,
    (v) =>
      `radial-gradient(closest-side, #3ddc84${Math.round(v * 120)
        .toString(16)
        .padStart(2, "0")}, transparent)`,
  );
  const shake = useTransform(prog, (v) =>
    v > 0.6 ? (Math.random() - 0.5) * (v - 0.6) * 10 : 0,
  );
  const pctText = useTransform(prog, (v) => `${Math.round(v * 100)}%`);
  const emit = useRef<number | null>(null);

  const startEmit = () => {
    if (emit.current) clearInterval(emit.current);
    emit.current = window.setInterval(() => {
      const v = prog.get();
      if (v <= 0.01) return;
      const a = Math.random() * Math.PI * 2;
      const r = 140;
      p.burst({
        x: 150 + Math.cos(a) * r,
        y: 200 + Math.sin(a) * r,
        count: 2 + Math.round(v * 4),
        shape: "dot",
        colors: ["#3ddc84", "#fff"],
        speed: [10, 40],
        target: { x: 150, y: 200 },
        size: [1.5, 3],
      });
      if (Math.random() < v * 0.5) sfx.tick();
    }, 60);
  };
  const stopEmit = () => {
    if (emit.current) clearInterval(emit.current);
    emit.current = null;
  };
  const complete = () => {
    stopEmit();
    setLocked(true);
    sfx.impact();
    sfx.chime();
    if (scope) animate(scope, shakeKeys(0.9, 14, 12, 2), { duration: 0.45 });
    p.ring(150, 200, "#fff", 220, 0.6, 14);
    p.ring(150, 200, "#3ddc84", 170, 0.9, 6);
    p.burst({
      x: 150,
      y: 200,
      count: 80,
      colors: ["#3ddc84", "#fff", "#ffc34d"],
      speed: [250, 700],
      drag: 3.5,
    });
  };

  useScript(run, async (wait) => {
    setLocked(false);
    prog.set(0);
    stopEmit();
    await wait(500);
    cue();
    // 1. неудачная попытка: отпустил рано → откат с пружиной
    g.show(150, 480);
    g.press(true);
    startEmit();
    sfx.suck();
    await animate(prog, 0.55, { duration: 0.66, ease: "linear" });
    g.press(false);
    stopEmit();
    await animate(prog, 0, { type: "spring", stiffness: 300, damping: 14 });
    await wait(400);
    // 2. полное удержание
    g.press(true);
    startEmit();
    sfx.suck();
    await animate(prog, 1, { duration: 1.2, ease: "linear" });
    g.press(false);
    complete();
    g.hide();
  });

  return (
    <div ref={setScope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#3ddc84" />
      <motion.div
        className="absolute left-1/2 top-[200px] h-[340px] w-[340px] -ml-[170px] -mt-[170px]"
        style={{ background: aura }}
      />
      <motion.div
        className="absolute left-1/2 top-[90px] h-[220px] w-[220px] -ml-[110px]"
        style={{ scale: portraitScale, x: shake }}
      >
        <motion.img
          src={hood}
          className="mask-soft h-full w-full object-cover"
          style={{ filter: locked ? "none" : gray }}
        />
      </motion.div>
      <svg
        viewBox="0 0 300 300"
        className="pointer-events-none absolute left-0 top-[50px] h-[300px] w-[300px]"
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.line
            key={i}
            x1="150"
            y1="20"
            x2="150"
            y2="34"
            stroke="#3ddc84"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${i * 15} 150 150)`}
            style={{
              opacity: useTransform(prog, (v) => (v * 24 > i ? 1 : 0.12)),
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 top-[330px] text-center">
        <AnimatePresence mode="wait">
          {locked ? (
            <motion.div
              key="l"
              initial={{ scale: 3, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.3, ease: EASE.snap }}
            >
              <div
                className="font-display text-3xl font-black text-bull"
                style={{ textShadow: "0 0 24px #3ddc84" }}
              >
                ГОТОВ
              </div>
              <div className="text-[11px] text-white/55">
                Тень зафиксирована в составе
              </div>
            </motion.div>
          ) : (
            <motion.div key="h" exit={{ opacity: 0, scale: 0.8 }}>
              <div className="font-display text-lg font-bold">
                Тень · Скальпер
              </div>
              <div className="text-[11px] text-white/50">
                Удерживай, чтобы зафиксировать ·{" "}
                <motion.span className="font-mono text-bull">
                  {pctText}
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 top-[432px] flex justify-center">
        <HoldButton
          mv={prog}
          ms={1200}
          color="#3ddc84"
          size={100}
          onStart={() => {
            if (locked) {
              setLocked(false);
              prog.set(0);
            }
            startEmit();
          }}
          onCancel={() => {
            stopEmit();
            sfx.error();
          }}
          onComplete={complete}
        >
          <motion.span
            animate={locked ? { scale: [1, 1.3, 1] } : {}}
            className="text-bull"
          >
            {locked ? <I.check size={30} stroke={3} /> : <I.lock size={28} />}
          </motion.span>
        </HoldButton>
      </div>
      <div className="absolute inset-x-0 bottom-6 text-center text-[10px] text-white/35">
        Отпустишь раньше — заряд стечёт пружиной
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_HERO: Category = {
  id: "hero",
  n: "10",
  title: "Выбор героя",
  en: "Coverflow · Stat forge · Hold lock-in",
  color: "#3ddc84",
  blurb:
    "Три интерактива выбора персонажа: 3D-карусель со свайпом, кузница характеристик на слайдерах с бюджетом и фиксация удержанием.",
  scenes: [
    {
      id: "coverflow",
      n: "32",
      title: "Coverflow выбор героя",
      kind: "Swipe carousel",
      lead: "3D-карусель героев: карточки поворачиваются по Y, размываются по краям, фон и кольцо делений тянутся за пальцем. Имя прокручивается слотом, характеристики перетекают пружиной, тап по центральной — выбор со штампом.",
      secrets: [
        "Вся геометрия карусели — производные одного x: rotateY, scale, opacity, blur и z-index для каждой карточки считаются через useTransform от смещения (x + i·step)/step.",
        "Снэп по проекции: x + velocity × 0.18. Короткий резкий флик перелистывает, медленный дрег — нет.",
        "Rubber-band на краях: смещение за границей возводится в степень 0.7 — сопротивление растёт нелинейно.",
        "Тик звука на смене центрального индекса во время драга — пальцем «чувствуешь» зубцы.",
        "Параллакс окружения: кольцо делений вращается от сырого x ×0.4, а не от индекса — мир реагирует на каждый пиксель жеста.",
      ],
      tracks: [
        { label: "Свайп 1", start: 500, dur: 350, color: "#3ddc84" },
        { label: "Снэп + статы", start: 850, dur: 500, color: "#ff4d5e" },
        { label: "Свайп 2-3", start: 1450, dur: 1800, color: "#4cc3ff" },
        { label: "Возврат", start: 3500, dur: 800, color: "#ffc34d" },
        { label: "Выбор + штамп", start: 4700, dur: 600, color: "#3ddc84" },
      ],
      total: 5600,
      ease: { bez: EASE.outExpo, label: "outExpo — зум портрета" },
      code: `function CItem({ x, i, step }) {
  const off = useTransform(x, v => (v + i * step) / step);
  const rotateY = useTransform(off, [-2, -1, 0, 1, 2], [55, 42, 0, -42, -55]);
  const scale   = useTransform(off, [-2, 0, 2], [0.62, 1, 0.62]);
  const blur    = useTransform(off, v => \`blur(\${Math.min(4, Math.abs(v) * 2)}px)\`);
  const zIndex  = useTransform(off, v => 100 - Math.round(Math.abs(v) * 10));
  return <motion.div style={{ x: off * step * .72, rotateY, scale, filter: blur, zIndex }} />;
}
onPanEnd={(_, i) => onIndex(Math.round(-(x.get() + i.velocity.x * .18) / step))}`,
      C: CoverflowHeroes,
      interactive: "Свайпай карусель, тапни центр",
    },
    {
      id: "statforge",
      n: "33",
      title: "Кузница характеристик",
      kind: "Constrained sliders",
      lead: "Три слайдера распределяют ограниченный бюджет очков. Радар-полигон морфит в реальном времени, шкала бюджета меняет цвет. При превышении слайдер при отпускании откатывается к лимиту с отскоком, а класс героя пересчитывается слотом.",
      secrets: [
        "Полигон радара — один useTransform от массива трёх MotionValue: строка points пересобирается без единого ререндера.",
        "Ограничение применяется на отпускании, а не во время драга: игрок может «перетянуть», увидеть красный и почувствовать откат — это обучает правилу.",
        "Откат — пружина damping 14 с перелётом: система мягко, но явно говорит «нет».",
        "Класс считается по разбросу: если разница < 0.18 — Универсал. Смена класса — слот rotateX и вспышка частиц цвета класса.",
        "Цвет бюджета: бирюза → золото (90%) → красный (>100%). Предупреждение приходит раньше ошибки.",
      ],
      tracks: [
        { label: "Анализ → 95", start: 500, dur: 700, color: "#4cc3ff" },
        { label: "Агрессия → 20", start: 1650, dur: 700, color: "#ff4d5e" },
        { label: "Хладнокр. → 95", start: 2800, dur: 700, color: "#3ddc84" },
        { label: "Превышение/откат", start: 3500, dur: 500, color: "#ff4d5e" },
        { label: "Класс-слот", start: 1200, dur: 3000, color: "#ffc34d" },
      ],
      total: 5200,
      ease: { bez: EASE.overshoot, label: "overshoot — откат к лимиту" },
      code: `const pts = useTransform([a, b, c], ([x, y, z]) =>
  [x, y, z].map((v, i) => radarPoint(i, v).join(",")).join(" "));
<motion.polygon points={pts} />

const commit = k => {
  const max = BUDGET - sumOthers(k);
  if (mvs[k].get() > max) {
    sfx.error(); shake(panel);
    animate(mvs[k], max, { type: "spring", stiffness: 300, damping: 14 });
  }
};`,
      C: StatForge,
      interactive: "Двигай три слайдера",
    },
    {
      id: "lockin",
      n: "34",
      title: "Фиксация удержанием",
      kind: "Press & hold",
      lead: "Удержание кнопки заряжает кольцо: портрет наполняется цветом, 24 деления загораются, энергия стягивается к центру, на последней трети портрет дрожит. Отпустил раньше — заряд стекает пружиной. Дотерпел — взрыв и штамп «ГОТОВ».",
      secrets: [
        "Цвет как прогресс: grayscale(1 − v) — игрок буквально «оживляет» героя удержанием.",
        "Дрожь только после 60%: shake = (v − 0.6) × 10. Напряжение нарастает в конце, когда важно не отпустить.",
        "Частицы стягиваются к центру (homing), их количество растёт с прогрессом — чем дольше держишь, тем гуще поток.",
        "Досрочное отпускание — пружина 300/14 назад, с перелётом через ноль. Ощущается как «сорвалось», а не как сброс.",
        "Демо сначала показывает неудачу, потом успех — правило понятно без единого слова.",
      ],
      tracks: [
        { label: "Попытка 55%", start: 500, dur: 660, color: "#3ddc84" },
        { label: "Срыв (spring)", start: 1160, dur: 500, color: "#ff4d5e" },
        { label: "Полное удержание", start: 2060, dur: 1200, color: "#3ddc84" },
        { label: "Дрожь >60%", start: 2780, dur: 480, color: "#ffc34d" },
        { label: "Взрыв + штамп", start: 3260, dur: 600, color: "#ffffff" },
      ],
      total: 4000,
      ease: { bez: EASE.snap, label: "snap — штамп" },
      code: `const gray  = useTransform(prog, v => \`grayscale(\${1 - v})\`);
const shake = useTransform(prog, v => v > .6 ? (Math.random() - .5) * (v - .6) * 10 : 0);

<HoldButton mv={prog} ms={1200}
  onCancel={() => sfx.error()}          // пружина 300/14 назад
  onComplete={() => { sfx.impact(); shakeRoot(); burst(); }} />`,
      C: LockIn,
      interactive: "Удерживай кнопку",
    },
  ],
};
