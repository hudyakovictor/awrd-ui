import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton } from "../ui/kit";
import { S, E, feel, Particles, useTimeline, useImpact } from "../lib/motion";
import { IcCheck, IcLock, IcStar, IcBook, IcTrend, IcArrow, IcTarget, IcBolt, IcCandles, IcEye, IcClock } from "../ui/icons";

/* =====================================================================
   АССЕТ 13 · ACADEMY PATH — карта уроков по кривой, прогресс-заливка
   ===================================================================== */
const NODES = [
  { x: 50, y: 88, t: "Свеча", Icon: IcCandles },
  { x: 24, y: 72, t: "Тренд", Icon: IcTrend },
  { x: 62, y: 57, t: "Объём", Icon: IcBolt },
  { x: 30, y: 42, t: "Уровни", Icon: IcTarget },
  { x: 68, y: 27, t: "Риск", Icon: IcEye },
  { x: 44, y: 12, t: "Сетап", Icon: IcStar },
];
const PATH = "M50 88 C 30 84, 18 80, 24 72 C 30 64, 62 66, 62 57 C 62 49, 26 50, 30 42 C 34 34, 70 36, 68 27 C 66 19, 44 20, 44 12";

export function AcademyPath({ live = true }: { live?: boolean }) {
  const [done, setDone] = useState(2);
  const burst = useRef<any>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setDone((d) => (d >= NODES.length ? 1 : d + 1)), 2800);
    return () => clearInterval(t);
  }, [live]);

  const tap = (i: number) => {
    if (i > done) return feel("deny", 18);
    feel("confirm");
    if (i === done) {
      setDone(i + 1);
      const el = pathRef.current;
      burst.current?.((NODES[i].x / 100) * 320, (NODES[i].y / 100) * 470 + 90, { n: 26, power: 9, colors: ["#3ec9a7", "#f2c14e"] });
      void el;
    }
  };

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-40" />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="px-4 pt-2">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-teal">Академия · Глава 1</div>
          <div className="title-xl mt-0.5 text-[20px] uppercase">Чтение графика</div>
          <div className="mt-2 flex items-center gap-2">
            <Bar v={done} max={NODES.length} tone="#3ec9a7" h={8} />
            <span className="mono text-[10px] font-extrabold text-mist">{done}/{NODES.length}</span>
          </div>
        </div>

        <div className="relative mt-1 flex-1">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={PATH} stroke="rgba(255,255,255,.09)" strokeWidth="3.4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" strokeDasharray="1 5" />
            <motion.path
              ref={pathRef}
              d={PATH} stroke="url(#pg)" strokeWidth="3.4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }} animate={{ pathLength: done / NODES.length }} transition={{ ...S.soft, damping: 28 }}
              style={{ pathLength: undefined }}
            />
            <defs><linearGradient id="pg" x1="0" y1="1" x2="0" y2="0"><stop stopColor="#3ec9a7" /><stop offset="1" stopColor="#f2c14e" /></linearGradient></defs>
          </svg>

          {NODES.map((n, i) => {
            const isDone = i < done;
            const isNext = i === done;
            return (
              <motion.button
                key={n.t}
                onClick={() => tap(i)}
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isNext ? 1.08 : 1, opacity: 1 }}
                transition={{ ...S.pop, delay: 0.1 + i * 0.07 }}
                whileTap={{ scale: 0.88 }}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              >
                <span
                  className="relative grid h-14 w-14 place-items-center rounded-2xl chip-3d"
                  style={{
                    background: isDone ? "linear-gradient(180deg,#54dcb6,#2a9b81)" : isNext ? "linear-gradient(180deg,#f7d271,#d29a20)" : "linear-gradient(180deg,#26324c,#1b2540)",
                    color: isDone ? "#06231c" : isNext ? "#3c2a04" : "#5f7496",
                  }}
                >
                  {isDone ? <IcCheck size={24} /> : isNext ? <n.Icon size={24} /> : <IcLock size={20} />}
                  {isNext && <motion.span className="absolute -inset-1 rounded-2xl border-2 border-gold ring-out" />}
                </span>
                <span className="rounded-full bg-black/45 px-2 py-[2px] text-[9px] font-extrabold" style={{ color: isNext ? "#f2c14e" : isDone ? "#3ec9a7" : "#6f83a6" }}>{n.t}</span>
              </motion.button>
            );
          })}

          {/* «аватар ученика» едет по пути */}
          <motion.div
            className="absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            animate={{ left: `${NODES[Math.min(done, NODES.length - 1)].x}%`, top: `${NODES[Math.min(done, NODES.length - 1)].y}%` }}
            transition={{ ...S.soft, damping: 20 }}
            style={{ boxShadow: "0 0 14px #fff" }}
          />
        </div>

        <div className="mb-24 px-4">
          <Panel className="flex items-center gap-3 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal/18 text-teal"><IcBook size={20} /></span>
            <div className="flex-1">
              <div className="text-[12px] font-extrabold">Урок {done + 1}: {NODES[Math.min(done, NODES.length - 1)].t}</div>
              <div className="text-[9.5px] font-bold text-mist">6 минут · +180 XP</div>
            </div>
            <span className="text-mist"><IcArrow size={18} /></span>
          </Panel>
        </div>
        <BottomNav active="academy" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 14 · LESSON — интерактивный урок: график рисуется, разбор, квиз
   ===================================================================== */
export function LessonScreen({ live = true }: { live?: boolean }) {
  const [step, setStep] = useTimeline(4, [2200, 2400, 2600, 2600], live);
  const [answer, setAnswer] = useState<number | null>(null);
  const imp = useImpact();
  const burst = useRef<any>(null);

  useEffect(() => { setAnswer(step === 3 ? 1 : null); }, [step]);

  const candles = [
    { o: 30, c: 44, h: 48, l: 27 }, { o: 44, c: 40, h: 47, l: 36 }, { o: 40, c: 55, h: 58, l: 38 },
    { o: 55, c: 52, h: 60, l: 49 }, { o: 52, c: 66, h: 70, l: 50 }, { o: 66, c: 60, h: 72, l: 57 },
    { o: 60, c: 74, h: 78, l: 58 }, { o: 74, c: 70, h: 80, l: 66 },
  ];
  const quiz = ["Покупать на пробое", "Ждать подтверждение объёмом", "Шортить"];

  const pick = (i: number) => {
    setAnswer(i);
    const ok = i === 1;
    feel(ok ? "reward" : "deny", ok ? [10, 24, 10] : 28);
    imp.fire(ok ? 8 : 14, 0.35);
    if (ok) burst.current?.(160, 420, { n: 34, power: 10 });
  };

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />

        <div className="px-4 pt-2">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((k) => (
              <motion.div key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full bg-teal" initial={{ width: 0 }} animate={{ width: k <= step ? "100%" : 0 }} transition={{ duration: 0.5, ease: E.out }} />
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-teal">Урок 3 · Объём</span>
            <span className="mono flex items-center gap-1 text-[10px] font-bold text-mist"><IcClock size={12} />4:12</span>
          </div>
        </div>

        {/* сцена графика */}
        <div className="mt-3 px-3">
          <Panel className="relative overflow-hidden p-3">
            <svg viewBox="0 0 280 150" className="w-full">
              {/* сетка */}
              {[0, 1, 2, 3].map((g) => <line key={g} x1="0" y1={30 + g * 32} x2="280" y2={30 + g * 32} stroke="rgba(255,255,255,.06)" strokeWidth="1" />)}
              {/* уровень сопротивления */}
              <motion.line x1="10" y1="42" x2="270" y2="42" stroke="#e46a5f" strokeWidth="2" strokeDasharray="7 6"
                initial={{ pathLength: 0, opacity: 0 }} animate={step >= 1 ? { pathLength: 1, opacity: 1 } : {}} transition={{ duration: 0.8, ease: E.out }} />
              {step >= 1 && (
                <motion.text x="14" y="36" fill="#e46a5f" fontSize="9" fontWeight="800" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>СОПРОТИВЛЕНИЕ</motion.text>
              )}
              {/* свечи */}
              {candles.map((c, i) => {
                const up = c.c > c.o;
                const col = up ? "#3ec9a7" : "#e46a5f";
                const x = 20 + i * 32;
                const y = (v: number) => 140 - v * 1.3;
                return (
                  <motion.g key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.09, ...S.pop }}>
                    <line x1={x + 7} y1={y(c.h)} x2={x + 7} y2={y(c.l)} stroke={col} strokeWidth="2" />
                    <rect x={x} y={y(Math.max(c.o, c.c))} width="14" height={Math.max(4, Math.abs(c.c - c.o) * 1.3)} rx="2.5" fill={col} />
                  </motion.g>
                );
              })}
              {/* объём */}
              {candles.map((_c, i) => (
                <motion.rect key={`v${i}`} x={20 + i * 32} y={146} width="14" height="0" rx="2" fill={i === 6 ? "#f2c14e" : "#31507a"}
                  initial={{ height: 0, y: 146 }} animate={step >= 2 ? { height: 4 + (i === 6 ? 2 : 10 - i), y: 150 - (4 + (i === 6 ? 2 : 10 - i)) } : {}}
                  transition={{ delay: 0.1 + i * 0.05, ...S.pop }} />
              ))}
              {/* маркер ловушки */}
              <AnimatePresence>
                {step >= 2 && (
                  <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={S.pop} style={{ transformOrigin: "222px 46px" }}>
                    <circle cx="222" cy="46" r="15" fill="none" stroke="#f2c14e" strokeWidth="2.5" />
                    <motion.circle cx="222" cy="46" r="15" fill="none" stroke="#f2c14e" strokeWidth="2"
                      animate={{ r: [15, 26], opacity: [0.8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
                  </motion.g>
                )}
              </AnimatePresence>
            </svg>
          </Panel>
        </div>

        {/* объяснение */}
        <div className="mt-3 px-4">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ y: 18, opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -14, opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.34, ease: E.out }}>
              <div className="text-[13px] font-extrabold leading-snug">
                {["Цена подошла к уровню восьмой раз.", "Уровень держит — каждый подход слабее.", "Пробой прошёл на падающем объёме.", "Что делать на таком пробое?"][step]}
              </div>
              <div className="mt-1 text-[11px] font-bold leading-snug text-mist">
                {["Смотри на структуру подходов, а не на одну свечу.", "Продавец ещё в рынке, покупатель выдыхается.", "Объём — это подтверждение. Нет объёма — нет пробоя.", "Выбери верный вариант."][step]}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* квиз */}
        <div className="mt-3 space-y-2 px-4">
          {quiz.map((q, i) => {
            const chosen = answer === i;
            const correct = i === 1;
            const reveal = answer !== null;
            return (
              <motion.button
                key={q}
                onClick={() => pick(i)}
                initial={{ x: -20, opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: step >= 3 ? 1 : 0.35,
                  scale: chosen ? 1.02 : 1,
                }}
                transition={{ ...S.soft, delay: i * 0.06 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left"
                style={{
                  background: reveal && correct ? "linear-gradient(90deg,#1e4038,#1b2740)" : reveal && chosen ? "linear-gradient(90deg,#41211d,#1b2740)" : "#1b2540",
                  boxShadow: reveal && correct ? "inset 0 0 0 1.5px #3ec9a7" : reveal && chosen ? "inset 0 0 0 1.5px #e46a5f" : "inset 0 0 0 1px rgba(255,255,255,.06)",
                }}
              >
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/6 mono text-[11px] font-extrabold text-mist">{["A", "B", "C"][i]}</span>
                <span className="flex-1 text-[11.5px] font-bold">{q}</span>
                {reveal && correct && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop} className="text-teal"><IcCheck size={17} /></motion.span>}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto mb-6 px-4">
          <BigButton tone={answer === 1 ? "teal" : "ghost"} icon={<IcArrow size={15} />} onClick={() => setStep((step + 1) % 4)}>
            {answer === 1 ? "ДАЛЬШЕ · +180 XP" : "ПРОДОЛЖИТЬ"}
          </BigButton>
        </div>
      </motion.div>
    </Phone>
  );
}
