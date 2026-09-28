import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import { Carousel, Roll, Slider, useGhost } from "../components/controls";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const R = "#fb7185";

/* ================================================================
   71 · STORIES — тап вперёд/назад, удержание — пауза, свайп вниз — закрыть
   ================================================================ */
const STORIES = [
  {
    t: "Что такое уровень?",
    d: "Цена, где раньше разворачивались покупатели или продавцы.",
    c: "#4cc3ff",
    seed: 5,
    mark: "level",
  },
  {
    t: "Пробой",
    d: "Закрытие свечи за уровнем с объёмом — главный признак силы.",
    c: "#3ddc84",
    seed: 9,
    mark: "break",
  },
  {
    t: "Ложный пробой",
    d: "Цена проколола уровень и вернулась. Это ловушка для толпы.",
    c: "#ff4d5e",
    seed: 41,
    mark: "fake",
  },
  {
    t: "Ретест",
    d: "Возврат к пробитому уровню сверху — самый безопасный вход.",
    c: "#ffc34d",
    seed: 44,
    mark: "retest",
  },
];
const DUR = 3.2;

export function StoriesViewer({ run, cue }: SceneProps) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closed, setClosed] = useState(false);
  const prog = useMotionValue(0);
  const y = useMotionValue(0);
  const ctl = useRef<AnimationPlaybackControls | null>(null);
  const idxRef = useRef(0);
  const g = useGhost();
  const scale = useTransform(y, [0, 300], [1, 0.75]);
  const radius = useTransform(y, [0, 120], [0, 32]);
  const bgOp = useTransform(y, [0, 300], [1, 0.3]);
  const holdT = useRef<number | null>(null);
  const S = STORIES[idx];

  const startTimer = (from = 0) => {
    ctl.current?.stop();
    prog.set(from);
    ctl.current = animate(prog, 1, {
      duration: DUR * (1 - from),
      ease: "linear",
      onComplete: () => go(idxRef.current + 1),
    });
  };
  const go = (n: number) => {
    if (n >= STORIES.length) {
      ctl.current?.stop();
      prog.set(1);
      return;
    }
    const t = Math.max(0, n);
    idxRef.current = t;
    setIdx(t);
    sfx.swipe(n > idx ? 1 : -1);
    startTimer(0);
  };
  const pause = (v: boolean) => {
    setPaused(v);
    if (v) ctl.current?.stop();
    else startTimer(prog.get());
  };

  useEffect(() => () => ctl.current?.stop(), []);

  useScript(run, async (wait) => {
    setClosed(false);
    y.set(0);
    idxRef.current = 0;
    setIdx(0);
    startTimer(0);
    await wait(400);
    cue();
    await wait(1400);
    // тап справа
    g.show(240, 320);
    g.press(true);
    await wait(90);
    g.press(false);
    go(1);
    await wait(1300);
    // удержание — пауза
    g.press(true);
    pause(true);
    await wait(1100);
    g.press(false);
    pause(false);
    await wait(500);
    // тап слева — назад
    await g.move(60, 320, 0.3);
    g.press(true);
    await wait(90);
    g.press(false);
    go(0);
    await wait(900);
    await g.move(240, 320, 0.3);
    g.press(true);
    await wait(90);
    g.press(false);
    go(1);
    await wait(500);
    g.press(true);
    await wait(90);
    g.press(false);
    go(2);
    await wait(900);
    // свайп вниз — закрыть
    await g.move(150, 250, 0.3);
    g.press(true);
    ctl.current?.stop();
    await Promise.all([
      g.move(150, 480, 0.5),
      animate(y, 230, { duration: 0.5 }),
    ]);
    g.press(false);
    setClosed(true);
    sfx.whoosh(0.3);
    await animate(y, 700, { duration: 0.35, ease: EASE.inQuart });
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050811]">
      <motion.div className="absolute inset-0" style={{ opacity: bgOp }}>
        <SceneBg tint={R} />
        <div className="absolute inset-x-4 top-[80px] grid grid-cols-4 gap-2">
          {STORIES.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="h-14 w-14 rounded-full p-[2px]"
                style={{ background: `conic-gradient(${s.c}, ${R}, ${s.c})` }}
              >
                <img
                  src={hood}
                  className="h-full w-full rounded-full border-2 border-[#050811] object-cover"
                />
              </div>
              <span className="text-[8px] font-bold text-white/60">
                {s.t.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
        {closed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-x-4 top-[180px] text-center text-[11px] text-white/50"
          >
            История закрыта свайпом вниз
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className="absolute inset-0 overflow-hidden touch-none"
        style={{ y, scale, borderRadius: radius }}
        onPanStart={() => {
          ctl.current?.stop();
          if (holdT.current) clearTimeout(holdT.current);
        }}
        onPan={(_, i) => i.offset.y > 0 && y.set(i.offset.y)}
        onPanEnd={(_, i) => {
          if (i.offset.y > 140 || i.velocity.y > 800) {
            setClosed(true);
            animate(y, 700, { duration: 0.35, ease: EASE.inQuart });
          } else {
            animate(y, 0, SPRING.panel);
            startTimer(prog.get());
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE.outExpo }}
            style={{
              background: `radial-gradient(120% 70% at 50% 0%, ${S.c}44, #0a1122 60%, #050811)`,
            }}
          >
            <div className="absolute inset-x-5 top-[80px]">
              <div
                className="text-[10px] font-bold uppercase tracking-[.3em]"
                style={{ color: S.c }}
              >
                Урок · {idx + 1}/4
              </div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, ...SPRING.panel }}
                className="mt-1 font-display text-2xl font-black"
              >
                {S.t}
              </motion.div>
            </div>
            <div className="glass absolute inset-x-4 top-[160px] rounded-2xl p-3">
              <div className="relative">
                <Candles
                  data={genCandles(22, S.seed, S.mark === "fake" ? 0.05 : 0.14)}
                  w={252}
                  h={140}
                  step={0.03}
                />
                <svg
                  viewBox="0 0 252 140"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                >
                  <motion.line
                    x1="0"
                    x2="252"
                    y1="62"
                    y2="62"
                    stroke={S.c}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      delay: 0.6,
                      duration: 0.8,
                      ease: EASE.outExpo,
                    }}
                  />
                  {S.mark !== "level" && (
                    <motion.circle
                      cx={S.mark === "retest" ? 200 : 170}
                      cy="62"
                      r="14"
                      fill="none"
                      stroke={S.c}
                      strokeWidth="2.5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 1.3, duration: 0.5 }}
                    />
                  )}
                </svg>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, ...SPRING.panel }}
              className="absolute inset-x-5 top-[340px] text-[13px] leading-relaxed text-white/85"
            >
              {S.d.split(" ").map((w, i) => (
                <motion.span
                  key={i}
                  className="mr-1 inline-block"
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                >
                  {w}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* прогресс-бары */}
        <div className="absolute inset-x-3 top-10 flex gap-1">
          {STORIES.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
            >
              {i < idx && <div className="h-full w-full bg-white" />}
              {i === idx && (
                <motion.div
                  className="h-full origin-left bg-white"
                  style={{ scaleX: prog }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute left-3 top-[52px] flex items-center gap-2">
          <img src={hood} className="h-7 w-7 rounded-full object-cover" />
          <span className="text-[11px] font-bold">Наставник</span>
          <AnimatePresence>
            {paused && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="rounded bg-white/20 px-1.5 text-[9px] font-bold"
              >
                ПАУЗА
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {/* тап-зоны: левая 1/3 назад, правая 2/3 вперёд, удержание — пауза */}
        <div className="absolute inset-x-0 bottom-20 top-24 flex">
          {[-1, 1].map((d) => (
            <div
              key={d}
              className={d < 0 ? "w-1/3" : "flex-1"}
              onPointerDown={() => {
                holdT.current = window.setTimeout(() => {
                  holdT.current = null;
                  pause(true);
                }, 220);
              }}
              onPointerUp={() => {
                if (holdT.current) {
                  clearTimeout(holdT.current);
                  holdT.current = null;
                  go(idxRef.current + d);
                } else pause(false);
              }}
            />
          ))}
        </div>
        <div className="absolute inset-x-5 bottom-6 flex items-center gap-2">
          <div className="flex-1 rounded-full border border-white/20 px-3 py-2 text-[11px] text-white/50">
            Задай вопрос наставнику…
          </div>
          <I.heart size={20} className="text-white/70" />
        </div>
      </motion.div>
      {g.el}
    </div>
  );
}

/* ================================================================
   72 · FLASHCARDS — тап переворот, свайп «знаю / повторить»
   ================================================================ */
const CARDS = [
  {
    q: "Что подтверждает пробой?",
    a: "Объём выше среднего и закрытие свечи за уровнем",
  },
  {
    q: "Где ставить стоп в лонге от ретеста?",
    a: "Под пробитым уровнем, с запасом на шум",
  },
  { q: "Главный враг новичка?", a: "FOMO — вход из страха упустить" },
  { q: "Риск на сделку?", a: "1–2% депозита, не больше" },
];

export function Flashcards({ run, cue }: SceneProps) {
  const [deck, setDeck] = useState([0, 1, 2, 3]);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(0);
  const [again, setAgain] = useState(0);
  const x = useMotionValue(0);
  const g = useGhost();
  const p = useParticles();
  const rot = useTransform(x, [-200, 200], [-18, 18]);
  const knowOp = useTransform(x, [30, 110], [0, 1]);
  const againOp = useTransform(x, [-110, -30], [1, 0]);
  const busy = useRef(false);

  const decide = async (d: number) => {
    if (busy.current || !deck.length) return;
    busy.current = true;
    await animate(x, d * 400, { duration: 0.3, ease: EASE.inQuart });
    if (d > 0) {
      setKnown((k) => k + 1);
      sfx.success();
      p.burst({
        x: 260,
        y: 290,
        count: 20,
        colors: ["#3ddc84", "#fff"],
        speed: [80, 220],
      });
      setDeck((dk) => dk.slice(1));
    } else {
      setAgain((a) => a + 1);
      sfx.pop(0);
      setDeck((dk) => [...dk.slice(1), dk[0]]);
    }
    setFlip(false);
    x.set(0);
    busy.current = false;
  };

  useScript(run, async (wait) => {
    setDeck([0, 1, 2, 3]);
    setFlip(false);
    setKnown(0);
    setAgain(0);
    x.set(0);
    await wait(600);
    cue();
    g.show(150, 300);
    const tapFlip = async () => {
      g.press(true);
      await wait(90);
      g.press(false);
      setFlip(true);
      sfx.whoosh(0.2);
      await wait(1100);
    };
    const swipe = async (d: number) => {
      g.press(true);
      await Promise.all([
        g.move(150 + d * 110, 300, 0.35),
        animate(x, d * 110, { duration: 0.35 }),
      ]);
      g.press(false);
      await decide(d);
      await g.move(150, 300, 0.2);
      await wait(300);
    };
    await tapFlip();
    await swipe(1);
    await tapFlip();
    await swipe(-1);
    await tapFlip();
    await swipe(1);
    g.hide();
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={R} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Карточки</div>
        <div className="flex gap-2 text-[10px] font-bold">
          <span className="text-bull">
            знаю <Roll value={known} />
          </span>
          <span className="text-[#ffc34d]">
            повтор <Roll value={again} />
          </span>
        </div>
      </div>
      <motion.div
        className="pointer-events-none absolute left-6 top-[110px] rounded-lg border-2 border-[#ffc34d] px-2 py-0.5 font-display text-sm font-black text-[#ffc34d]"
        style={{ opacity: againOp, rotate: -10 }}
      >
        ПОВТОРИТЬ
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-6 top-[110px] rounded-lg border-2 border-bull px-2 py-0.5 font-display text-sm font-black text-bull"
        style={{ opacity: knowOp, rotate: 10 }}
      >
        ЗНАЮ
      </motion.div>
      {deck.slice(0, 3).map((ci, d) => {
        const top = d === 0;
        return (
          <motion.div
            key={ci}
            className="absolute inset-x-8 top-[150px] h-[290px]"
            style={
              top
                ? { x, rotate: rot, zIndex: 10, perspective: 900 }
                : { zIndex: 10 - d, perspective: 900 }
            }
            initial={false}
            animate={
              top ? { scale: 1, y: 0 } : { scale: 1 - d * 0.05, y: d * 14 }
            }
            transition={SPRING.panel}
            drag={top ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDrag={(_, i) => top && x.set(i.offset.x)}
            onDragEnd={(_, i) => {
              if (!top) return;
              const proj = i.offset.x + i.velocity.x * 0.2;
              if (Math.abs(proj) > 100) decide(Math.sign(proj));
              else
                animate(x, 0, { type: "spring", stiffness: 500, damping: 26 });
            }}
            onTap={() => {
              if (top) {
                setFlip((f) => !f);
                sfx.whoosh(0.2);
              }
            }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: top && flip ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#1d2b4f] to-[#0c1428] p-5"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span
                  className="text-[10px] font-bold uppercase tracking-[.25em]"
                  style={{ color: R }}
                >
                  Вопрос
                </span>
                <div className="font-display text-xl font-black leading-tight">
                  {CARDS[ci].q}
                </div>
                <span className="text-center text-[10px] text-white/40">
                  тапни, чтобы перевернуть
                </span>
              </div>
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-3xl border-2 p-5"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  borderColor: R,
                  background: `linear-gradient(170deg, ${R}33, #0c1428 60%)`,
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[.25em] text-bull">
                  Ответ
                </span>
                <div className="text-base font-bold leading-snug">
                  {CARDS[ci].a}
                </div>
                <span className="text-center text-[10px] text-white/40">
                  ← повторить · знаю →
                </span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
      {!deck.length && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.reward}
          className="absolute inset-x-8 top-[240px] text-center"
        >
          <div className="font-display text-2xl font-black text-bull">
            Колода выучена
          </div>
        </motion.div>
      )}
      <div className="absolute inset-x-8 bottom-8">
        <div className="mb-1 text-[9px] font-bold text-white/40">Освоено</div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-bull"
            animate={{ width: `${(known / CARDS.length) * 100}%` }}
            transition={SPRING.panel}
          />
        </div>
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   73 · CONFIDENCE — ответ + уверенность → калибровка
   ================================================================ */
const OPTS = ["Войти на пробое", "Дождаться ретеста", "Шорт против тренда"];
const RIGHT = 1;

export function ConfidenceCalib({ run, cue }: SceneProps) {
  const conf = useMotionValue(0.5);
  const [pick, setPick] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [c, setC] = useState(0.5);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  useMotionValueEvent(conf, "change", setC);
  const correct = pick === RIGHT;
  // Калибровка: хорошо — уверенно и верно или неуверенно и неверно
  const calib = shown ? 1 - Math.abs((correct ? 1 : 0) - c) : 0;
  const mult = shown ? (0.5 + calib * 1.5).toFixed(1) : "—";

  const submit = () => {
    if (pick === null) return;
    setShown(true);
    const score = 1 - Math.abs((pick === RIGHT ? 1 : 0) - conf.get());
    if (score > 0.6) {
      sfx.success();
      p.burst({
        x: 150,
        y: 420,
        count: 30,
        shape: "star",
        colors: ["#3ddc84", "#fff", R],
        speed: [100, 300],
        size: [2, 5],
      });
    } else {
      sfx.error();
      if (root) animate(root, shakeKeys(0.4, 8, 6, 0.5), { duration: 0.3 });
    }
  };

  useScript(run, async (wait) => {
    conf.set(0.5);
    setPick(null);
    setShown(false);
    await wait(600);
    cue();
    g.show(150, 190);
    await g.move(150, 200, 0.3);
    g.press(true);
    await wait(90);
    g.press(false);
    setPick(1);
    sfx.tap();
    await wait(500);
    await g.move(24 + 0.5 * 252, 332, 0.4);
    g.press(true);
    await Promise.all([
      g.move(24 + 0.85 * 252, 332, 0.7),
      animate(conf, 0.85, { duration: 0.7, ease: EASE.camera }),
    ]);
    g.press(false);
    await wait(300);
    await g.move(150, 560, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    submit();
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={R} />
      <div className="absolute inset-x-4 top-11">
        <div
          className="text-[10px] font-bold uppercase tracking-[.3em]"
          style={{ color: R }}
        >
          Тест с уверенностью
        </div>
        <div className="mt-1 text-[13px] font-bold">
          Пробой без объёма. Что делаешь?
        </div>
      </div>
      <div className="absolute inset-x-4 top-[100px] space-y-2">
        {OPTS.map((o, i) => {
          const isP = pick === i;
          const reveal = shown && (i === RIGHT || isP);
          const col = reveal
            ? i === RIGHT
              ? "#3ddc84"
              : "#ff4d5e"
            : isP
              ? R
              : "#ffffff1a";
          return (
            <motion.button
              key={o}
              onClick={() => !shown && (setPick(i), sfx.tap())}
              whileTap={{ scale: 0.97 }}
              animate={{
                borderColor: col,
                background: isP || reveal ? `${col}1f` : "#ffffff05",
                x: shown && isP && i !== RIGHT ? [0, 10, -8, 5, 0] : 0,
              }}
              className="flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left text-[12px] font-bold"
            >
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-white/10 font-mono text-[10px]">
                {"ABC"[i]}
              </span>
              {o}
              {reveal && (
                <span className="ml-auto">
                  {i === RIGHT ? (
                    <I.check size={14} className="text-bull" stroke={3} />
                  ) : (
                    <I.x size={14} className="text-bear" stroke={3} />
                  )}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="absolute inset-x-6 top-[300px]">
        <Slider
          mv={conf}
          label="Насколько ты уверен?"
          color={R}
          format={(v) => `${Math.round(v * 100)}%`}
          marks={["наугад", "", "уверен"]}
        />
      </div>
      <AnimatePresence>
        {shown && (
          <motion.div
            key="cal"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={SPRING.panel}
            className="glass absolute inset-x-4 top-[380px] rounded-2xl p-3"
          >
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/50">
              Калибровка
            </div>
            {[
              { l: "Уверенность", v: c, col: R },
              {
                l: "Факт",
                v: correct ? 1 : 0,
                col: correct ? "#3ddc84" : "#ff4d5e",
              },
            ].map((b, k) => (
              <div key={b.l} className="mt-2">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/60">{b.l}</span>
                  <span className="font-bold">{Math.round(b.v * 100)}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${b.v * 100}%` }}
                    transition={{
                      delay: 0.2 + k * 0.2,
                      duration: 0.8,
                      ease: EASE.outExpo,
                    }}
                    style={{ background: b.col }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-white/60">Множитель XP</span>
              <motion.span
                initial={{ scale: 2.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3, ease: EASE.snap }}
                className="font-display text-xl font-black"
                style={{ color: calib > 0.6 ? "#3ddc84" : "#ffc34d" }}
              >
                x{mult}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={submit}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 rounded-2xl py-3 font-display text-sm font-black"
        animate={{
          background: pick !== null && !shown ? R : "#ffffff14",
          color: pick !== null && !shown ? "#1a0508" : "#ffffff55",
        }}
      >
        {shown ? "ОТВЕТ ПРИНЯТ" : "ОТВЕТИТЬ"}
      </motion.button>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   74 · LESSON CAROUSEL — кольца прогресса и раскрытие урока
   ================================================================ */
const LESSONS = [
  { t: "Структура рынка", p: 1, c: "#3ddc84", icon: I.layers, min: 5 },
  { t: "Уровни", p: 0.7, c: "#4cc3ff", icon: I.bars, min: 6 },
  { t: "Риск и позиция", p: 0.3, c: "#ffc34d", icon: I.shield, min: 7 },
  { t: "Психология", p: 0, c: "#9b7bff", icon: I.brain, min: 6 },
  { t: "Ликвидность", p: 0, c: "#ff4d5e", icon: I.flame, min: 8, lock: true },
];

function LRing({ p, c, size = 88 }: { p: number; c: string; size?: number }) {
  const r = size / 2 - 5;
  const L = 2 * Math.PI * r;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#ffffff14"
        strokeWidth="5"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={c}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={L}
        initial={{ strokeDashoffset: L }}
        animate={{ strokeDashoffset: L * (1 - p) }}
        transition={{ duration: 1, ease: EASE.outExpo }}
        style={{ filter: `drop-shadow(0 0 4px ${c})` }}
      />
    </svg>
  );
}

export function LessonCarousel({ run, cue }: SceneProps) {
  const uid = useId();
  const [idx, setIdx] = useState(1);
  const [open, setOpen] = useState<number | null>(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const L = LESSONS[idx];
  const start = (i: number) => {
    if (LESSONS[i].lock) {
      sfx.error();
      if (root) animate(root, shakeKeys(0.35, 8, 6, 0.5), { duration: 0.3 });
      return;
    }
    setOpen(i);
    sfx.whoosh(0.35);
  };
  useScript(run, async (wait) => {
    setIdx(1);
    setOpen(null);
    await wait(600);
    cue();
    g.show(220, 230);
    for (const n of [2, 3, 4]) {
      g.press(true);
      await g.move(90, 230, 0.3);
      g.press(false);
      setIdx(n);
      await wait(550);
      await g.move(220, 230, 0.2);
    }
    await g.move(150, 230, 0.2);
    g.press(true);
    await wait(90);
    g.press(false);
    start(4);
    await wait(600);
    await g.move(40, 230, 0.2);
    g.press(true);
    await g.move(270, 230, 0.4);
    g.press(false);
    setIdx(2);
    await wait(600);
    await g.move(150, 230, 0.3);
    g.press(true);
    await wait(90);
    g.press(false);
    start(2);
    await wait(1800);
    setOpen(null);
    g.hide();
  });
  const total = LESSONS.reduce((s, l) => s + l.p, 0) / LESSONS.length;
  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={L.c} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Академия</div>
        <div className="text-[10px] font-bold">
          курс <Roll value={`${Math.round(total * 100)}%`} color={R} />
        </div>
      </div>
      <div className="absolute inset-x-0 top-[110px]">
        <Carousel
          count={LESSONS.length}
          index={idx}
          onIndex={setIdx}
          step={130}
          mode="cover"
          height={220}
          onTapActive={start}
          render={(i, a) => {
            const l = LESSONS[i];
            return (
              <motion.div
                layoutId={`${uid}l${i}`}
                className="relative flex h-[200px] w-[140px] flex-col items-center justify-center gap-3 rounded-3xl border"
                style={{
                  borderColor: `${l.c}55`,
                  background: `linear-gradient(170deg, ${l.c}22, #0c1428 60%)`,
                  filter: l.lock ? "grayscale(.7) brightness(.7)" : "none",
                }}
              >
                <div
                  className="relative grid h-[88px] w-[88px] place-items-center"
                  style={{ color: l.c }}
                >
                  {a && <LRing p={l.p} c={l.c} />}
                  {l.lock ? (
                    <I.lock size={28} />
                  ) : l.p >= 1 ? (
                    <I.check size={30} stroke={3} />
                  ) : (
                    <l.icon size={30} />
                  )}
                </div>
                <div className="px-2 text-center text-[12px] font-bold leading-tight">
                  {l.t}
                </div>
                <div className="text-[9px] text-white/45">{l.min} мин</div>
              </motion.div>
            );
          }}
        />
      </div>
      <div className="absolute inset-x-5 top-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div
              className="font-display text-lg font-black"
              style={{ color: L.c }}
            >
              {L.t}
            </div>
            <div className="text-[11px] text-white/55">
              {L.lock
                ? "Откроется после «Психологии»"
                : L.p >= 1
                  ? "Пройден · можно повторить"
                  : `Прогресс ${Math.round(L.p * 100)}%`}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <motion.button
        onClick={() => start(idx)}
        whileTap={{ scale: 0.95 }}
        className="absolute inset-x-8 bottom-6 rounded-2xl py-3 font-display text-sm font-black"
        animate={{
          background: L.lock ? "#ffffff14" : L.c,
          color: L.lock ? "#ffffff55" : "#0c1428",
        }}
      >
        {L.lock ? "ЗАКРЫТО" : L.p > 0 && L.p < 1 ? "ПРОДОЛЖИТЬ" : "НАЧАТЬ"}
      </motion.button>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            key="open"
            layoutId={`${uid}l${open}`}
            className="absolute inset-0 z-30 overflow-hidden bg-[#0c1428]"
            style={{ borderRadius: 40 }}
            transition={SPRING.panel}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(100% 50% at 50% 0%, ${LESSONS[open].c}44, transparent)`,
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="relative px-5 pt-14"
            >
              <div
                className="text-[10px] font-bold uppercase tracking-[.3em]"
                style={{ color: LESSONS[open].c }}
              >
                Урок
              </div>
              <div className="font-display text-2xl font-black">
                {LESSONS[open].t}
              </div>
              <div className="mt-6 space-y-2">
                {[
                  "Теория · 2 мин",
                  "Пример на графике",
                  "Мини-тест",
                  "Практика в арене",
                ].map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, ...SPRING.panel }}
                    className="glass flex items-center gap-3 rounded-xl p-3 text-[12px] font-bold"
                  >
                    <span
                      className="grid h-6 w-6 place-items-center rounded-full text-[10px]"
                      style={{
                        background: `${LESSONS[open].c}33`,
                        color: LESSONS[open].c,
                      }}
                    >
                      {i + 1}
                    </span>
                    {s}
                    {i < Math.round(LESSONS[open].p * 4) && (
                      <I.check
                        size={14}
                        className="ml-auto text-bull"
                        stroke={3}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {g.el}
    </div>
  );
}

export const _acadClamp = clamp;

/* ================================================================
   META
   ================================================================ */
export const SET_ACADEMY: Category = {
  id: "academy",
  n: "22",
  title: "Академия",
  en: "Stories · Flashcards · Confidence · Lessons",
  color: R,
  blurb:
    "Обучение через жесты мобильных приложений: истории с тапами и паузой, карточки с переворотом и свайпом, тест с ползунком уверенности и карусель уроков с раскрытием.",
  scenes: [
    {
      id: "stories",
      n: "71",
      title: "Истории-уроки",
      kind: "Tap & hold stories",
      lead: "Уроки в формате историй: полосы прогресса сверху, тап справа — вперёд, слева — назад, удержание ставит на паузу. На графике рисуются уровень и отметка, текст проявляется по словам. Свайп вниз уменьшает историю со скруглением углов и закрывает её.",
      secrets: [
        "Одна тап-зона различает тап и удержание таймером 220мс: короче — навигация, дольше — пауза. Жест без кнопок.",
        "Таймер — linear-анимация MotionValue; пауза = stop, продолжение = новая анимация от текущего значения на оставшееся время.",
        "Свайп вниз: scale 1 → 0.75 и borderRadius 0 → 32 от смещения — история «становится карточкой» и уходит.",
        "Левая зона — 1/3, правая — 2/3: вперёд листают чаще, поэтому и зона больше.",
        "Аннотации рисуются ПОСЛЕ появления графика (задержки 0.6 и 1.3с) — сначала контекст, потом акцент.",
      ],
      tracks: [
        { label: "История 1", start: 400, dur: 1800, color: "#4cc3ff" },
        { label: "Тап вперёд", start: 1800, dur: 100, color: "#ffffff" },
        { label: "Пауза", start: 3200, dur: 1100, color: "#ffc34d" },
        { label: "Тап назад", start: 4900, dur: 100, color: "#ffffff" },
        { label: "Свайп вниз", start: 7000, dur: 850, color: R },
      ],
      total: 8000,
      ease: { bez: EASE.inQuart, label: "inQuart — закрытие" },
      code: `onPointerDown={() => hold = setTimeout(() => { hold = null; pause(true); }, 220)}
onPointerUp={() => hold ? (clearTimeout(hold), go(idx + dir)) : pause(false)}

const pause = v => v ? ctl.stop()
  : ctl = animate(prog, 1, { duration: DUR * (1 - prog.get()), ease: "linear" });
const scale  = useTransform(y, [0, 300], [1, .75]);
const radius = useTransform(y, [0, 120], [0, 32]);`,
      C: StoriesViewer,
      interactive: "Тапай, удерживай, свайп вниз",
    },
    {
      id: "flashcards",
      n: "72",
      title: "Карточки повторения",
      kind: "Flip & swipe",
      lead: "Тап переворачивает карточку в 3D, показывая ответ. Свайп вправо — «знаю»: карточка улетает, прогресс растёт. Свайп влево — «повторить»: карточка уходит в конец колоды. Штампы проявляются от расстояния свайпа.",
      secrets: [
        "Переворот — rotateY 180° пружиной 200/20, две грани с backfaceVisibility hidden.",
        "«Повторить» не удаляет карточку, а переставляет в конец — интервальное повторение в одной строке кода.",
        "Штампы «ЗНАЮ / ПОВТОРИТЬ» — opacity от x: решение видно до отпускания.",
        "Тап и драг на одном элементе: onTap срабатывает только без перемещения — framer сам различает жесты.",
        "Стопка из трёх карточек с шагом 5%/14px — колода ощущается объёмной.",
      ],
      tracks: [
        { label: "Переворот 1", start: 600, dur: 1100, color: R },
        { label: "Знаю →", start: 1800, dur: 650, color: "#3ddc84" },
        { label: "Переворот 2", start: 2800, dur: 1100, color: R },
        { label: "← Повторить", start: 4000, dur: 650, color: "#ffc34d" },
        { label: "Знаю →", start: 6000, dur: 650, color: "#3ddc84" },
      ],
      total: 6900,
      ease: { bez: EASE.inQuart, label: "inQuart — вылет" },
      code: `<motion.div animate={{ rotateY: flip ? 180 : 0 }} style={{ transformStyle: "preserve-3d" }}>
  <Face style={{ backfaceVisibility: "hidden" }} />
  <Face style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
</motion.div>
d > 0 ? setDeck(dk => dk.slice(1))               // знаю
      : setDeck(dk => [...dk.slice(1), dk[0]]);  // повторить → в конец`,
      C: Flashcards,
      interactive: "Тап — переворот, свайп — решение",
    },
    {
      id: "confidence",
      n: "73",
      title: "Калибровка уверенности",
      kind: "Confidence slider",
      lead: "После выбора ответа игрок ползунком отмечает, насколько уверен. После отправки — калибровка: полоса уверенности против факта и множитель XP. Уверенно и верно — максимум, уверенно и неверно — встряска. Обучение не только ответу, но и самооценке.",
      secrets: [
        "Калибровка = 1 − |факт − уверенность|. Честное «не уверен» при ошибке тоже награждается — механика против самонадеянности.",
        "Две полосы растут последовательно (задержка 0.2с): сначала «что ты думал», потом «что было».",
        "Множитель падает штампом после полос — вердикт после доказательств.",
        "Неверный выбранный вариант «мотает головой», верный подсвечивается — два канала обратной связи.",
        "Слайдер с подписями «наугад … уверен» — шкала человеческая, а не только проценты.",
      ],
      tracks: [
        { label: "Выбор ответа", start: 900, dur: 300, color: R },
        { label: "Уверенность → 85%", start: 1700, dur: 700, color: R },
        { label: "Отправка", start: 3100, dur: 100, color: "#ffffff" },
        {
          label: "Полосы калибровки",
          start: 3300,
          dur: 1000,
          color: "#3ddc84",
        },
        { label: "Множитель", start: 3900, dur: 300, color: "#3ddc84" },
      ],
      total: 4500,
      ease: { bez: EASE.snap, label: "snap — множитель" },
      code: `const calib = 1 - Math.abs((correct ? 1 : 0) - confidence);
const mult  = (.5 + calib * 1.5).toFixed(1);       // x0.5 … x2.0
<motion.span initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: .7, duration: .3, ease: EASE.snap }}>x{mult}</motion.span>`,
      C: ConfidenceCalib,
      interactive: "Выбери ответ и уверенность",
    },
    {
      id: "lessons",
      n: "74",
      title: "Карусель уроков",
      kind: "Carousel → screen",
      lead: "Уроки листаются coverflow, у активного урока кольцо прогресса дорисовывается. Закрытый урок трясёт экран. Тап по доступному — карточка раскрывается в экран урока (shared layout), шаги въезжают каскадом, выполненные отмечены галочками.",
      secrets: [
        "Кольцо рисуется только у активной карточки (strokeDashoffset от L до L·(1 − p)) — прогресс «презентуется» при выборе.",
        "Карточка и экран урока связаны layoutId — переход из карусели в экран без разрыва.",
        "Иконка отражает состояние: предмет / галочка / замок. Форма важнее цвета.",
        "Закрытые уроки видны (grayscale), но недоступны: цель впереди мотивирует.",
        "Кнопка меняет глагол по прогрессу: «Начать / Продолжить / Закрыто».",
      ],
      tracks: [
        { label: "Листание ×3", start: 600, dur: 1600, color: "#ffc34d" },
        { label: "Отказ (замок)", start: 2500, dur: 400, color: "#ff4d5e" },
        { label: "Флик назад", start: 3100, dur: 400, color: "#9b7bff" },
        { label: "Раскрытие урока", start: 4400, dur: 600, color: "#ffc34d" },
        { label: "Шаги каскадом", start: 4700, dur: 600, color: R },
      ],
      total: 6400,
      ease: { bez: EASE.outExpo, label: "outExpo — кольцо" },
      code: `<motion.circle strokeDasharray={L}
  initial={{ strokeDashoffset: L }}
  animate={{ strokeDashoffset: L * (1 - p) }}
  transition={{ duration: 1, ease: EASE.outExpo }} />

<motion.div layoutId={\`l\${i}\`} />          {/* карточка в карусели */}
<motion.div layoutId={\`l\${open}\`} />       {/* экран урока */}`,
      C: LessonCarousel,
      interactive: "Листай и открывай уроки",
    },
  ],
};
