import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Category } from "../data/catalog";
import { Roll, Segmented, Slider, useGhost } from "../components/controls";
import { Coin, I } from "../components/kit";
import {
  ParticleCanvas,
  centerIn,
  useParticles,
} from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys, sleep } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const T = "#2ee6c5";
const QUESTS = [
  {
    t: "Найди 3 ложных пробоя",
    r: 120,
    c: "#ff4d5e",
    icon: I.target,
    d: "Сложно",
  },
  {
    t: "5 решений без эмоций",
    r: 80,
    c: "#9b7bff",
    icon: I.brain,
    d: "Средне",
  },
  {
    t: "Стоп на каждом входе",
    r: 60,
    c: "#3ddc84",
    icon: I.shield,
    d: "Легко",
  },
  { t: "Победи босса FOMO", r: 200, c: "#ffc34d", icon: I.swords, d: "Эпик" },
  { t: "Изучи 2 урока", r: 50, c: "#4cc3ff", icon: I.cap, d: "Легко" },
];

/* ================================================================
   59 · QUEST SWIPE — вверх принять, вниз пропустить
   ================================================================ */
export function QuestSwipe({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<number[]>([]);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const y = useMotionValue(0);
  const logRef = useRef<HTMLDivElement>(null);
  const g = useGhost();
  const p = useParticles();
  const busy = useRef(false);
  const rot = useTransform(y, [-200, 0, 200], [-6, 0, 10]);
  const acceptOp = useTransform(y, [-120, -30], [1, 0]);
  const skipOp = useTransform(y, [30, 120], [0, 1]);
  const tint = useTransform(
    y,
    [-160, 0, 160],
    [`${T}33`, "#00000000", "#ff4d5e22"],
  );

  const decide = async (dir: -1 | 1) => {
    if (busy.current || idx >= QUESTS.length) return;
    busy.current = true;
    const card = root?.querySelector("[data-top]") as HTMLElement | null;
    if (dir < 0) {
      // ПРИНЯТЬ: полёт по дуге в журнал
      sfx.whoosh(0.3);
      const to = centerIn(logRef.current, root);
      const from = centerIn(card, root);
      await animate(y, [y.get(), -220], { duration: 0.25, ease: EASE.inQuart });
      if (card)
        await animate(
          card,
          {
            x: to.x - from.x,
            y: to.y - from.y + 220,
            scale: 0.12,
            rotate: 20,
            opacity: 0.6,
          },
          { duration: 0.35, ease: EASE.camera },
        );
      sfx.success();
      setLog((l) => [...l, idx]);
      if (logRef.current)
        animate(
          logRef.current,
          { scale: [1.35, 1], rotate: [-10, 0] },
          { type: "spring", stiffness: 500, damping: 12 },
        );
      p.burst({
        x: to.x,
        y: to.y,
        count: 18,
        colors: [QUESTS[idx].c, "#fff"],
        speed: [80, 220],
      });
    } else {
      // ПРОПУСТИТЬ: падение с вращением
      sfx.swipe(-1);
      await animate(y, 700, { duration: 0.45, ease: EASE.inQuart });
    }
    y.set(0);
    if (card)
      await animate(
        card,
        { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 },
        { duration: 0 },
      );
    setIdx((i) => i + 1);
    busy.current = false;
  };

  useScript(run, async (wait) => {
    setIdx(0);
    setLog([]);
    y.set(0);
    busy.current = false;
    await wait(600);
    cue();
    g.show(150, 360);
    const drag = async (to: number, d: -1 | 1) => {
      g.press(true);
      await Promise.all([
        g.move(150, 360 + to, 0.45),
        animate(y, to, { duration: 0.45 }),
      ]);
      g.press(false);
      await decide(d);
      await g.move(150, 360, 0.2);
      await wait(350);
    };
    await drag(-140, -1);
    await drag(150, 1);
    // сомнение: вниз, потом вверх
    g.press(true);
    await Promise.all([
      g.move(150, 420, 0.4),
      animate(y, 60, { duration: 0.4 }),
    ]);
    await Promise.all([
      g.move(150, 230, 0.5),
      animate(y, -130, { duration: 0.5 }),
    ]);
    g.press(false);
    await decide(-1);
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={T} />
      <motion.div className="absolute inset-0" style={{ background: tint }} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-black">Доска заданий</div>
          <div className="text-[10px] text-white/45">
            осталось <Roll value={Math.max(0, QUESTS.length - idx)} />
          </div>
        </div>
        <div
          ref={logRef}
          className="glass relative grid h-11 w-11 place-items-center rounded-xl text-teal"
        >
          <I.news size={20} />
          <AnimatePresence>
            {log.length > 0 && (
              <motion.span
                key={log.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={SPRING.reward}
                className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-teal text-[10px] font-black text-black"
              >
                {log.length}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[110px] text-center font-display text-sm font-black text-teal"
        style={{ opacity: acceptOp }}
      >
        ↑ ПРИНЯТЬ
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-[520px] text-center font-display text-sm font-black text-bear"
        style={{ opacity: skipOp }}
      >
        ↓ ПРОПУСТИТЬ
      </motion.div>
      {QUESTS.map((q, i) => {
        const depth = i - idx;
        if (depth < 0 || depth > 2) return null;
        const top = depth === 0;
        return (
          <motion.div
            key={i}
            data-top={top ? "" : undefined}
            className="absolute inset-x-8 top-[150px] h-[300px] rounded-3xl border p-5"
            style={
              top
                ? {
                    y,
                    rotate: rot,
                    zIndex: 10,
                    borderColor: `${q.c}66`,
                    background: `linear-gradient(170deg, ${q.c}26, #0c1428 55%)`,
                  }
                : {
                    zIndex: 10 - depth,
                    borderColor: "#ffffff14",
                    background: "#0c1428",
                  }
            }
            initial={false}
            animate={
              top
                ? { scale: 1, y: 0, opacity: 1 }
                : {
                    scale: 1 - depth * 0.06,
                    y: depth * 14,
                    opacity: 1 - depth * 0.3,
                  }
            }
            transition={SPRING.panel}
            drag={top ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={1}
            onDrag={(_, info) => top && y.set(info.offset.y)}
            onDragEnd={(_, info) => {
              if (!top) return;
              const proj = info.offset.y + info.velocity.y * 0.2;
              if (proj < -110) decide(-1);
              else if (proj > 110) decide(1);
              else
                animate(y, 0, { type: "spring", stiffness: 500, damping: 26 });
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ background: `${q.c}26`, color: q.c }}
              >
                {q.d}
              </span>
              <span className="flex items-center gap-1 font-display text-sm font-black text-gold">
                <Coin size={14} /> {q.r}
              </span>
            </div>
            <div
              className="mt-8 grid h-20 w-20 place-items-center rounded-3xl"
              style={{
                background: `${q.c}1f`,
                color: q.c,
                boxShadow: `0 0 30px ${q.c}44`,
              }}
            >
              <q.icon size={38} />
            </div>
            <div className="mt-5 font-display text-lg font-black leading-tight">
              {q.t}
            </div>
            <div className="mt-2 text-[11px] text-white/50">
              Срок: 24 часа · прогресс сохраняется
            </div>
          </motion.div>
        );
      })}
      {idx >= QUESTS.length && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.reward}
          className="absolute inset-x-8 top-[240px] text-center"
        >
          <div className="font-display text-xl font-black">Доска пуста</div>
          <div className="text-[11px] text-white/55">
            Новые задания через 6ч
          </div>
        </motion.div>
      )}
      <div className="absolute inset-x-8 bottom-8 grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => decide(1)}
          className="rounded-2xl border border-bear/40 py-3 text-xs font-bold text-bear"
        >
          Пропустить
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => decide(-1)}
          className="rounded-2xl bg-teal py-3 text-xs font-bold text-black"
        >
          Принять
        </motion.button>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   60 · QUEST STEPS — слайдер прогресса рисует галочки
   ================================================================ */
const STEPS = [
  "Открой сценарий",
  "Отметь уровень",
  "Поставь стоп",
  "Прими решение",
  "Разбери итог",
];

export function QuestSteps({ run, cue }: SceneProps) {
  const prog = useMotionValue(0);
  const [done, setDone] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const R = 52;
  const L = 2 * Math.PI * R;
  const ring = useTransform(prog, (v) => `${L * v} ${L}`);
  const pct = useTransform(prog, (v) => `${Math.round(v * 100)}%`);
  const doneRef = useRef(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useMotionValueEvent(prog, "change", (v) => {
    const d = Math.floor(v * STEPS.length + 0.001);
    if (d !== doneRef.current) {
      if (d > doneRef.current) {
        sfx.pop(d * 2);
        const c = centerIn(rowRefs.current[d - 1] ?? null, root);
        p.burst({
          x: 44,
          y: c.y,
          count: 12,
          colors: [T, "#fff"],
          speed: [60, 180],
        });
        if (d === STEPS.length) sfx.chime();
      }
      doneRef.current = d;
      setDone(d);
    }
  });

  const claim = () => {
    if (done < STEPS.length || claimed) return;
    setClaimed(true);
    sfx.open();
    if (root) animate(root, shakeKeys(0.5, 10, 7, 1), { duration: 0.35 });
    p.ring(150, 150, "#ffc34d", 160, 0.7, 8);
    p.burst({
      x: 150,
      y: 150,
      count: 20,
      shape: "coin",
      size: [5, 7],
      speed: [150, 350],
      angle: -Math.PI / 2,
      spread: 2,
      gravity: 500,
      drag: 0.8,
      life: [1, 1.5],
    });
  };

  useScript(run, async (wait) => {
    prog.set(0);
    doneRef.current = 0;
    setClaimed(false);
    await wait(500);
    cue();
    g.show(24, 494);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.45 * 252, 494, 0.9),
      animate(prog, 0.45, { duration: 0.9, ease: EASE.camera }),
    ]);
    await wait(300);
    await Promise.all([
      g.move(24 + 252, 494, 1.1),
      animate(prog, 1, { duration: 1.1, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(400);
    await g.move(150, 560, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    claim();
    g.hide();
  });

  const all = done >= STEPS.length;
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={all ? "#ffc34d" : T} />
      <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
        Задание: «Полный цикл»
      </div>
      <div className="absolute left-1/2 top-[76px] h-[130px] w-[130px] -ml-[65px]">
        <svg viewBox="0 0 130 130" className="absolute inset-0 -rotate-90">
          <circle
            cx="65"
            cy="65"
            r={R}
            fill="none"
            stroke="#ffffff14"
            strokeWidth="10"
          />
          <motion.circle
            cx="65"
            cy="65"
            r={R}
            fill="none"
            stroke={all ? "#ffc34d" : T}
            strokeWidth="10"
            strokeLinecap="round"
            style={{
              strokeDasharray: ring,
              filter: `drop-shadow(0 0 8px ${all ? "#ffc34d" : T})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <AnimatePresence mode="wait">
            {claimed ? (
              <motion.div
                key="c"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={SPRING.reward}
                className="text-gold"
              >
                <I.check size={44} stroke={3} />
              </motion.div>
            ) : all ? (
              <motion.div
                key="g"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-gold"
              >
                <I.gem size={40} />
              </motion.div>
            ) : (
              <motion.div key="p" className="font-display text-2xl font-black">
                <motion.span>{pct}</motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-x-5 top-[222px] space-y-2">
        {STEPS.map((s, i) => {
          const ok = i < done;
          return (
            <motion.div
              key={s}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="flex items-center gap-3 rounded-xl border px-3 py-2"
              animate={{
                borderColor: ok ? `${T}55` : "#ffffff10",
                background: ok ? `${T}12` : "#ffffff05",
                x: ok ? [0, 6, 0] : 0,
              }}
              transition={{ duration: 0.35 }}
            >
              <div className="relative h-6 w-6">
                <svg viewBox="0 0 24 24" className="absolute inset-0">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke={ok ? T : "#ffffff33"}
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M7 12l3.5 3.5L17 9"
                    fill="none"
                    stroke={T}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={false}
                    animate={{ pathLength: ok ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: EASE.outExpo }}
                  />
                </svg>
              </div>
              <span
                className={`flex-1 text-[12px] font-bold ${ok ? "text-white" : "text-white/50"}`}
              >
                {s}
              </span>
              <span className="font-mono text-[10px] text-white/35">
                {i + 1}/5
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="absolute inset-x-6 top-[480px]">
        <Slider
          mv={prog}
          color={T}
          format={(v) => `${Math.floor(v * 5 + 0.001)}/5`}
        />
      </div>
      <motion.button
        onClick={claim}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 rounded-2xl py-3 font-display text-sm font-black"
        animate={{
          background: claimed ? "#3ddc84" : all ? "#ffc34d" : "#ffffff14",
          color: all || claimed ? "#000" : "#ffffff55",
          scale: all && !claimed ? [1, 1.04, 1] : 1,
        }}
        transition={
          all && !claimed ? { scale: { duration: 0.8, repeat: Infinity } } : {}
        }
      >
        {claimed
          ? "ПОЛУЧЕНО +120"
          : all
            ? "ЗАБРАТЬ НАГРАДУ"
            : "ВЫПОЛНИ ВСЕ ШАГИ"}
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   61 · REROLL LEVER — потяни рычаг, барабаны крутятся
   ================================================================ */
const POOL = [
  "Ретест x3",
  "Без плеча",
  "Серия 5",
  "Босс",
  "2 урока",
  "Стоп всегда",
  "Тренд x4",
  "Анти-FOMO",
];
const POOL_C = [
  "#4cc3ff",
  "#3ddc84",
  "#ffc34d",
  "#ff4d5e",
  "#9b7bff",
  "#2ee6c5",
  "#ff8a3d",
  "#ff6bd6",
];
const ROW_H = 52;

function Reel({
  spin,
  result,
  delay,
}: {
  spin: number;
  result: number;
  delay: number;
}) {
  const y = useMotionValue(-result * ROW_H);
  const [landed, setLanded] = useState(true);
  const items = [...POOL, ...POOL, ...POOL, ...POOL];
  useEffect(() => {
    if (spin === 0) {
      y.set(-result * ROW_H);
      return;
    }
    setLanded(false);
    // старт: быстрый разгон, долгий хвост с перелётом (y2 > 1)
    const ctl = animate(y, -(POOL.length * 3 + result) * ROW_H, {
      duration: 1.3 + delay,
      ease: [0.2, 0.7, 0.3, 1.06],
      onComplete: () => {
        y.set(-result * ROW_H);
        setLanded(true);
        sfx.snap();
      },
    });
    return () => ctl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin]);
  return (
    <div className="relative h-[52px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#0c1428]">
      <motion.div
        style={{ y }}
        animate={{ filter: landed ? "blur(0px)" : "blur(1.5px)" }}
      >
        {items.map((t, i) => (
          <div
            key={i}
            className="grid h-[52px] place-items-center text-center text-[11px] font-black"
            style={{ color: POOL_C[i % POOL.length] }}
          >
            {t}
          </div>
        ))}
      </motion.div>
      {landed && spin > 0 && (
        <motion.div
          key={spin}
          className="absolute inset-0 rounded-xl border-2"
          style={{ borderColor: POOL_C[result] }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </div>
  );
}

export function RerollLever({ run, cue }: SceneProps) {
  const pull = useMotionValue(0);
  const [spin, setSpin] = useState(0);
  const [res, setRes] = useState([0, 3, 5]);
  const [charges, setCharges] = useState(3);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const base = useRef(0);
  const knobY = useTransform(pull, (v) => v * 150);
  const armRot = useTransform(pull, [0, 1], [0, 58]);
  const tension = useTransform(pull, (v) => `0 0 ${v * 30}px ${T}`);
  const last = useRef(0);
  useMotionValueEvent(pull, "change", (v) => {
    const s = Math.floor(v * 6);
    if (s !== last.current) {
      last.current = s;
      sfx.tick();
    }
  });

  const fire = async () => {
    if (charges <= 0) {
      sfx.error();
      if (root) animate(root, shakeKeys(0.4, 8, 6, 0.5), { duration: 0.3 });
      animate(pull, 0, { type: "spring", stiffness: 400, damping: 14 });
      return;
    }
    sfx.hit(true);
    if (root) animate(root, shakeKeys(0.4, 8, 6, 0.8), { duration: 0.3 });
    animate(pull, 0, { type: "spring", stiffness: 260, damping: 8 });
    setCharges((c) => c - 1);
    const n = [0, 1, 2].map(() => Math.floor(Math.random() * POOL.length));
    setRes(n);
    setSpin((s) => s + 1);
    await sleep(2100);
    sfx.success();
    p.burst({ x: 150, y: 220, count: 30, colors: POOL_C, speed: [120, 320] });
  };

  useScript(run, async (wait) => {
    pull.set(0);
    setCharges(3);
    await wait(700);
    cue();
    // неполный рывок
    g.show(250, 300);
    g.press(true);
    await Promise.all([
      g.move(250, 300 + 60, 0.4),
      animate(pull, 0.4, { duration: 0.4 }),
    ]);
    g.press(false);
    await animate(pull, 0, { type: "spring", stiffness: 400, damping: 12 });
    await wait(300);
    // полный
    g.press(true);
    await Promise.all([
      g.move(250, 300 + 150, 0.5),
      animate(pull, 1, { duration: 0.5, ease: EASE.outExpo }),
    ]);
    g.press(false);
    g.hide();
    await fire();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={T} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Рерол заданий</div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-3 w-3 rounded-full"
              animate={{
                background: i < charges ? T : "#ffffff1a",
                scale: i === charges ? [1.4, 1] : 1,
              }}
              style={{ boxShadow: i < charges ? `0 0 8px ${T}` : "none" }}
            />
          ))}
        </div>
      </div>
      {/* машина */}
      <div className="absolute left-4 right-[64px] top-[120px] rounded-3xl border-2 border-white/10 bg-gradient-to-b from-[#16223f] to-[#0a1122] p-3 shadow-[inset_0_2px_0_#ffffff14]">
        <div className="mb-2 text-center text-[9px] font-bold uppercase tracking-[.3em] text-white/40">
          Новые задания
        </div>
        <div className="flex gap-2">
          {res.map((r, i) => (
            <Reel key={i} spin={spin} result={r} delay={i * 0.35} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-3 top-[38px] h-[52px] rounded-xl border border-teal/30" />
      </div>
      {/* рычаг */}
      <div className="absolute right-4 top-[130px] h-[220px] w-12">
        <div className="absolute left-1/2 top-0 h-[190px] w-2.5 -ml-[5px] rounded-full bg-white/10" />
        <motion.div
          className="absolute left-1/2 top-2 h-[40px] w-2 -ml-1 origin-top rounded bg-gradient-to-b from-[#6a7ab8] to-[#2a3658]"
          style={{ rotate: armRot }}
        />
        <motion.div
          className="absolute left-1/2 top-0 grid h-12 w-12 -ml-6 cursor-grab touch-none place-items-center rounded-full active:cursor-grabbing"
          style={{
            y: knobY,
            boxShadow: tension,
            background: `radial-gradient(circle at 35% 30%, #aefcf0, ${T} 55%, #0a7563)`,
          }}
          onPanStart={() => {
            base.current = pull.get();
            sfx.tap();
          }}
          onPan={(_, i) => {
            // сопротивление растёт к низу: корень от смещения
            const raw = clamp(base.current + i.offset.y / 150, 0, 1.2);
            pull.set(raw > 1 ? 1 + (raw - 1) * 0.2 : Math.pow(raw, 1.15));
          }}
          onPanEnd={() => {
            if (pull.get() > 0.85) fire();
            else
              animate(pull, 0, { type: "spring", stiffness: 400, damping: 12 });
          }}
          whileTap={{ scale: 1.1 }}
        >
          <div className="h-3 w-3 rounded-full bg-white/70" />
        </motion.div>
      </div>
      <div className="absolute inset-x-4 top-[390px] space-y-2">
        {res.map((r, i) => (
          <motion.div
            key={`${spin}-${i}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: spin ? 1.5 + i * 0.35 : 0, ...SPRING.panel }}
            className="glass flex items-center gap-3 rounded-xl px-3 py-2"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                background: POOL_C[r],
                boxShadow: `0 0 8px ${POOL_C[r]}`,
              }}
            />
            <span className="flex-1 text-[12px] font-bold">{POOL[r]}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-gold">
              <Coin size={12} /> {50 + r * 20}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="absolute inset-x-6 bottom-6 text-center text-[10px] text-white/40">
        Потяни рычаг до упора и отпусти
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   62 · QUEST PERIODS — вкладки день/неделя/сезон с направлением
   ================================================================ */
const PERIODS = [
  {
    n: "День",
    items: [
      ["Сыграй 3 сценария", 0.66],
      ["Серия без ошибок", 0.2],
      ["Открой сундук", 1],
    ],
  },
  {
    n: "Неделя",
    items: [
      ["Победи 2 босса", 0.5],
      ["20 верных решений", 0.75],
      ["Турнир: топ-50", 0.1],
      ["7 дней подряд", 0.86],
    ],
  },
  {
    n: "Сезон",
    items: [
      ["Уровень пропуска 20", 0.35],
      ["Все регионы", 0.33],
      ["Легендарная карта", 0],
    ],
  },
] as const;

export function QuestPeriods({ run, cue }: SceneProps) {
  const [tab, setTab] = useState(0);
  const [dir, setDir] = useState(1);
  const g = useGhost();
  const change = (k: number) => {
    if (k === tab) return;
    setDir(k > tab ? 1 : -1);
    setTab(k);
    sfx.swipe(k > tab ? 1 : -1);
  };
  useScript(run, async (wait) => {
    setTab(0);
    await wait(500);
    cue();
    const xs = [60, 150, 240];
    g.show(xs[0], 108);
    for (const k of [1, 2, 0]) {
      await g.move(xs[k], 108, 0.35);
      g.press(true);
      await wait(90);
      g.press(false);
      change(k);
      await wait(1300);
    }
    g.hide();
  });
  const P = PERIODS[tab];
  const total = P.items.reduce((s, it) => s + it[1], 0) / P.items.length;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={T} />
      <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
        Задания
      </div>
      <div className="absolute inset-x-4 top-[90px]">
        <Segmented
          options={PERIODS.map((x) => x.n)}
          value={tab}
          onChange={change}
          color={T}
        />
      </div>
      <div className="absolute inset-x-4 top-[146px] bottom-24 overflow-hidden">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={tab}
            custom={dir}
            variants={{
              in: (d: number) => ({ x: d * 260, opacity: 0 }),
              c: { x: 0, opacity: 1 },
              out: (d: number) => ({ x: d * -200, opacity: 0 }),
            }}
            initial="in"
            animate="c"
            exit="out"
            transition={SPRING.panel}
            className="absolute inset-0 space-y-2"
          >
            {P.items.map(([t, v], i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + i * 0.05, ...SPRING.panel }}
                className="glass rounded-2xl p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold">{t}</span>
                  {v >= 1 ? (
                    <span className="text-bull">
                      <I.check size={14} stroke={3} />
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-white/50">
                      {Math.round(v * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${v * 100}%` }}
                    transition={{
                      delay: 0.15 + i * 0.06,
                      duration: 0.8,
                      ease: EASE.outExpo,
                    }}
                    style={{ background: v >= 1 ? "#3ddc84" : T }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="glass absolute inset-x-4 bottom-6 flex items-center justify-between rounded-2xl p-3">
        <span className="text-[11px] font-bold text-white/70">
          Прогресс периода
        </span>
        <Roll
          value={`${Math.round(total * 100)}%`}
          color={T}
          className="font-display text-base font-black"
        />
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_QUESTS: Category = {
  id: "quests",
  n: "19",
  title: "Задания",
  en: "Swipe board · Steps · Reroll lever · Periods",
  color: T,
  blurb:
    "Задания, с которыми хочется взаимодействовать: колода свайпом вверх-вниз, шаги с рисующимися галочками, рычаг рерола с барабанами и вкладки периодов с направленной навигацией.",
  scenes: [
    {
      id: "questswipe",
      n: "59",
      title: "Доска заданий свайпом",
      kind: "Vertical swipe deck",
      lead: "Колода заданий: вверх — принять (карточка летит по дуге в журнал, журнал подпрыгивает), вниз — пропустить (карточка проваливается вниз). Подсказки «принять / пропустить» и тинт фона проявляются от расстояния жеста.",
      secrets: [
        "Вертикальный свайп вместо горизонтального: вверх = «беру себе», вниз = «сбрасываю». Направление несёт смысл.",
        "Принятие — двухфазное: короткий рывок вверх с ease-in, затем полёт в журнал по camera. Сначала решение, потом доставка.",
        "Тинт фона от y: бирюза вверху, красный внизу — периферийное зрение подтверждает намерение до отпускания.",
        "Демо показывает сомнение (вниз → вверх): жест обратим, пока палец на экране.",
        "Журнал получает удар (scale 1.35, rotate −10) и бейдж — принятое задание «приземлилось».",
      ],
      tracks: [
        { label: "Принять №1", start: 600, dur: 1050, color: T },
        { label: "Пропустить №2", start: 2000, dur: 900, color: "#ff4d5e" },
        { label: "Сомнение", start: 3300, dur: 900, color: "#ffc34d" },
        { label: "Принять №3", start: 4200, dur: 700, color: T },
      ],
      total: 5100,
      ease: { bez: EASE.inQuart, label: "inQuart — провал вниз" },
      code: `const rot     = useTransform(y, [-200, 0, 200], [-6, 0, 10]);
const tint    = useTransform(y, [-160, 0, 160], [TEAL33, "transparent", RED22]);
onDragEnd={(_, i) => {
  const proj = i.offset.y + i.velocity.y * .2;
  proj < -110 ? accept() : proj > 110 ? skip() : springBack();
}}`,
      C: QuestSwipe,
      interactive: "Свайп вверх/вниз",
    },
    {
      id: "queststeps",
      n: "60",
      title: "Шаги задания",
      kind: "Progress slider",
      lead: "Слайдер прогресса проходит пять шагов: кольцо заполняется, галочки рисуются линией, строки вздрагивают и подсвечиваются, на каждом шаге — искры. На 100% центр превращается в пульсирующий кристалл, кнопка начинает «дышать» и зовёт забрать награду.",
      secrets: [
        "Галочка — pathLength 0 → 1 за 300мс outExpo: выполнение «пишется», а не появляется.",
        "Строка при выполнении делает x [0, 6, 0] — лёгкий толчок, как отметка ручкой.",
        "Центр кольца проходит три состояния через AnimatePresence: проценты → кристалл → галочка. Одна точка — вся история задания.",
        "Кнопка награды «дышит» scale [1, 1.04, 1] бесконечно, пока не нажата — непрерывное приглашение.",
        "Звук pop повышается с каждым шагом — прогресс слышно по высоте тона.",
      ],
      tracks: [
        { label: "Шаги 1-2", start: 500, dur: 900, color: T },
        { label: "Шаги 3-5", start: 1700, dur: 1100, color: T },
        { label: "Кристалл", start: 2800, dur: 800, color: "#ffc34d" },
        { label: "Забрать", start: 3700, dur: 600, color: "#ffc34d" },
      ],
      total: 4500,
      ease: { bez: EASE.outExpo, label: "outExpo — галочка" },
      code: `<motion.path d="M7 12l3.5 3.5L17 9"
  animate={{ pathLength: ok ? 1 : 0 }}
  transition={{ duration: .3, ease: EASE.outExpo }} />

useMotionValueEvent(prog, "change", v => {
  const d = Math.floor(v * 5);
  if (d > done) { sfx.pop(d * 2); sparks(row(d)); }
});`,
      C: QuestSteps,
      interactive: "Двигай прогресс",
    },
    {
      id: "reroll",
      n: "61",
      title: "Рычаг рерола",
      kind: "Lever + slot reels",
      lead: "Рычаг тянут вниз с нарастающим сопротивлением, шарик светится от напряжения, тикает на каждом делении. Недотянул — рычаг отскакивает. Дотянул — удар, рычаг пружинит назад, три барабана разгоняются и останавливаются по очереди с перелётом, новые задания выезжают каскадом.",
      secrets: [
        "Сопротивление: pull = raw^1.15, а за пределом — ×0.2. Рычаг «тяжелеет» к концу хода.",
        "Возврат рычага — пружина 260/8: сильно недодемпфирована, рычаг вибрирует после броска.",
        "Барабан — длинная лента из 4 копий пула. Кривая [0.2, 0.7, 0.3, 1.06]: y2 > 1 даёт перелёт при остановке.",
        "Каскад остановок: задержка +0.35с на барабан. Напряжение растёт к последнему.",
        "Размытие ленты во время вращения — blur 1.5px, при остановке резкость и цветная рамка-вспышка.",
      ],
      tracks: [
        { label: "Неполный рывок", start: 700, dur: 400, color: T },
        { label: "Отскок", start: 1100, dur: 500, color: "#ff4d5e" },
        { label: "Полный рывок", start: 1900, dur: 500, color: T },
        { label: "Барабаны 1-3", start: 2400, dur: 2000, color: "#ffc34d" },
        { label: "Задания каскадом", start: 3900, dur: 900, color: "#3ddc84" },
      ],
      total: 5000,
      ease: { bez: [0.2, 0.7, 0.3, 1.06], label: "reel stop с перелётом" },
      code: `onPan={(_, i) => {
  const raw = clamp(base + i.offset.y / 150, 0, 1.2);
  pull.set(raw > 1 ? 1 + (raw - 1) * .2 : Math.pow(raw, 1.15));
}}
animate(reelY, -(POOL.length * 3 + result) * ROW_H, {
  duration: 1.3 + i * .35, ease: [.2, .7, .3, 1.06],   // перелёт в конце
});`,
      C: RerollLever,
      interactive: "Тяни рычаг вниз",
    },
    {
      id: "periods",
      n: "62",
      title: "Вкладки периодов",
      kind: "Directional tabs",
      lead: "День / неделя / сезон переключаются сегментом с перетекающей плашкой. Список уезжает строго в сторону навигации, строки въезжают каскадом с той же стороны, прогресс-бары заполняются заново, общий процент прокручивается.",
      secrets: [
        "Направление = знак разницы индексов; custom-проп AnimatePresence передаёт его и уходящему, и приходящему экрану.",
        "Строки въезжают с x = dir·40 — внутренний каскад повторяет внешнее направление.",
        "Бары заполняются заново при каждом входе — прогресс «пересчитывается» на глазах.",
        "Плашка сегмента — один layoutId, никогда не мигает.",
        "Выполненные задания получают зелёный бар и галочку вместо процента — финальное состояние отличается формой, а не только цветом.",
      ],
      tracks: [
        { label: "→ Неделя", start: 900, dur: 500, color: T },
        { label: "Строки каскад", start: 950, dur: 600, color: "#4cc3ff" },
        { label: "→ Сезон", start: 2600, dur: 500, color: T },
        { label: "← День", start: 4300, dur: 500, color: T },
      ],
      total: 5200,
      ease: { bez: EASE.outExpo, label: "outExpo — бары" },
      code: `<AnimatePresence mode="popLayout" custom={dir}>
  <motion.div key={tab} custom={dir} variants={{
    in:  d => ({ x: d * 260, opacity: 0 }),
    out: d => ({ x: d * -200, opacity: 0 }) }}
    initial="in" animate="c" exit="out" />
</AnimatePresence>`,
      C: QuestPeriods,
      interactive: "Переключай период",
    },
  ],
};
