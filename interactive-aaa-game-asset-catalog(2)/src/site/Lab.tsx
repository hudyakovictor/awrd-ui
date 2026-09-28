import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { S, BASE, E, TUNE, feel, sampleSpring, springFrom, copyText, useFps, useTuneVersion, dur, commitTune, type Tune } from "../lib/motion";
import { Tuner, SpringGraph } from "./Tuner";
import { Anatomy, SoundHaptics, StaggerLab } from "./LabPlus";
import { IcPlay, IcCheck, IcClose, IcWarn, IcGauge, IcCopy, IcCoinMark, IcCrown, IcBolt, IcArrow, IcStar, IcLayers } from "../ui/icons";
import { Bar } from "../ui/kit";
import { specForAll, download } from "../lib/spec";
import { CATEGORIES } from "../data/catalog";

/* =====================================================================
   ЛАБОРАТОРИЯ — инструментальная часть каталога:
   1) стенд пружин  2) кривые  3) Do / Don't  4) хронометраж каскада
   5) бюджет производительности
   ===================================================================== */

export function Lab() {
  const [tab, setTab] = useState(0);
  const tabs = ["Стенд пружин", "Анатомия кадра", "A / B профили", "Кривые", "Каскад", "Звук и хаптика", "Do / Don't", "Хронометраж", "Бюджет FPS", "Ядро · исходники", "Токены"];
  const fps = useFps();
  return (
    <div className="relative min-h-screen pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]" style={{ background: "radial-gradient(55% 45% at 50% 0%, #3ec9a722, transparent)" }} />
      <div className="mesh absolute inset-x-0 top-0 h-[50vh] opacity-60" />

      <div className="relative mx-auto max-w-6xl px-5 pt-24">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.45em] text-teal">Инструменты</div>
        <h1 className="title-xl mt-3 text-[13vw] uppercase leading-[0.88] sm:text-7xl">Лаборатория</h1>
        <p className="mt-4 max-w-2xl text-[14px] font-bold leading-relaxed text-mist">
          Здесь каталог перестаёт быть витриной. Крути параметры — физика меняется во всех экранах каталога сразу,
          сравнивай кривые, смотри на разницу «плохо / правильно» и забирай готовый конфиг в свой проект.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 mono text-[10px] font-bold">
            <IcGauge size={13} /> <span style={{ color: fps > 50 ? "#3ec9a7" : fps > 35 ? "#f2c14e" : "#e46a5f" }}>{fps} FPS</span>
          </span>
          <span className="mono rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-mist">
            pop → {S.pop.stiffness}/{S.pop.damping}/{S.pop.mass}
          </span>
        </div>

        <div className="no-bar mt-8 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => { feel("tap"); setTab(i); }} className="relative shrink-0 rounded-full px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.2em]">
              {tab === i && <motion.span layoutId="labpill" transition={S.pop} className="absolute inset-0 rounded-full bg-teal" />}
              {tab !== i && <span className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.03]" />}
              <span className={`relative ${tab === i ? "text-[#06231c]" : "text-mist"}`}>{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-6xl px-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, filter: "blur(8px)" }} transition={{ duration: 0.35, ease: E.out }}>
            {tab === 0 && <SpringBench />}
            {tab === 1 && <Anatomy />}
            {tab === 2 && <ABCompare />}
            {tab === 3 && <EasingBench />}
            {tab === 4 && <StaggerLab />}
            {tab === 5 && <SoundHaptics />}
            {tab === 6 && <DoDont />}
            {tab === 7 && <Choreography />}
            {tab === 8 && <Budget />}
            {tab === 9 && <Core />}
            {tab === 10 && <Tokens />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- 1. Стенд пружин: гонка пресетов + тюнер ---------- */
function SpringBench() {
  useTuneVersion();
  const [run, setRun] = useState(0);
  const rows: { k: keyof typeof BASE; t: string; use: string; tone: string }[] = [
    { k: "snap", t: "snap", use: "кнопки, тумблеры, тапы", tone: "#3ec9a7" },
    { k: "pop", t: "pop", use: "награды, акценты, поп-ины", tone: "#f2c14e" },
    { k: "soft", t: "soft", use: "панели, шиты, экраны", tone: "#5b9cd6" },
    { k: "heavy", t: "heavy", use: "тяжёлые объекты, дайлы", tone: "#9d8cf5" },
  ];
  useEffect(() => { const t = setInterval(() => setRun((r) => r + 1), 2600); return () => clearInterval(t); }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.25em]">гонка пресетов</div>
          <button onClick={() => { feel("confirm"); setRun((r) => r + 1); }}
            className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#06231c]">
            <IcPlay size={12} /> прогнать
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {rows.map((r) => {
            const m = sampleSpring(S[r.k]);
            return (
              <div key={r.k}>
                <div className="flex items-baseline justify-between">
                  <span className="mono text-[12px] font-extrabold" style={{ color: r.tone }}>S.{r.t}</span>
                  <span className="mono text-[10px] font-bold text-mist">
                    {S[r.k].stiffness}/{S[r.k].damping}/{S[r.k].mass} · settle {m.settleMs} мс · over {(m.overshoot * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative mt-2 h-11 overflow-hidden rounded-2xl border border-white/8 bg-[#0b1220]">
                  <div className="absolute inset-y-0 right-10 w-px bg-white/15" />
                  <motion.div key={`${run}-${r.k}`} initial={{ x: 6 }} animate={{ x: "calc(100% - 46px)" }} transition={S[r.k]}
                    className="absolute top-1.5 grid h-8 w-8 place-items-center rounded-xl text-[#06231c]"
                    style={{ background: r.tone, boxShadow: `0 6px 16px -6px ${r.tone}` }}>
                    <IcBolt size={15} />
                  </motion.div>
                </div>
                <div className="mt-1 text-[10px] font-bold text-mist">{r.use}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <SpringGraph tone={r.tone} spring={S[r.k]} w={120} h={58} />
              <div>
                <div className="mono text-[11px] font-extrabold" style={{ color: r.tone }}>{r.t}</div>
                <div className="text-[10px] font-bold leading-snug text-mist">
                  {r.k === "snap" && "Почти без отскока. Если кнопка «качается» — интерфейс ощущается дешёвым."}
                  {r.k === "pop" && "Отскок 12–25% — зона, где награда читается как ценная."}
                  {r.k === "soft" && "Длинный ход, мягкая посадка. Панель не должна щёлкать."}
                  {r.k === "heavy" && "Масса 1.6 даёт «вес» без замедления темпа."}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tuner compact />
    </div>
  );
}

/* ---------- 2. Кривые: bezier vs spring на одном треке ---------- */
const CURVES: { t: string; e: any; d: string; tone: string }[] = [
  { t: "linear", e: "linear", d: "Запрещено в UI: нет ускорения — нет физики", tone: "#e46a5f" },
  { t: "easeOut .16,1,.3,1", e: E.out, d: "Основной вход контента", tone: "#3ec9a7" },
  { t: "easeInOut .83,0,.17,1", e: E.io, d: "Переходы экранов и шторки", tone: "#5b9cd6" },
  { t: "back .34,1.56,.64,1", e: E.back, d: "Лёгкий перелёт для иконок", tone: "#f2c14e" },
];
function EasingBench() {
  const [run, setRun] = useState(0);
  const [d, setD] = useState(0.7);
  useEffect(() => { const t = setInterval(() => setRun((r) => r + 1), 2400); return () => clearInterval(t); }, []);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">bezier vs spring</span>
          <span className="mono text-[10px] font-bold text-mist">duration {d.toFixed(2)}с</span>
        </div>
        <input type="range" min={0.2} max={1.4} step={0.05} value={d} onChange={(e) => setD(+e.target.value)}
          className="mt-3 h-1.5 w-full appearance-none rounded-full bg-white/10" style={{ accentColor: "#3ec9a7" }} />

        <div className="mt-5 space-y-4">
          {CURVES.map((c) => (
            <div key={c.t}>
              <div className="flex items-baseline justify-between">
                <span className="mono text-[11px] font-extrabold" style={{ color: c.tone }}>{c.t}</span>
                <span className="text-[9.5px] font-bold text-mist">{c.d}</span>
              </div>
              <div className="relative mt-1.5 h-9 overflow-hidden rounded-xl border border-white/8 bg-[#0b1220]">
                <motion.div key={`${run}-${c.t}`} initial={{ x: 4 }} animate={{ x: "calc(100% - 38px)" }}
                  transition={{ duration: dur(d), ease: c.e as any }}
                  className="absolute top-1.5 h-6 w-8 rounded-lg" style={{ background: c.tone }} />
              </div>
            </div>
          ))}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="mono text-[11px] font-extrabold text-purple">spring S.pop</span>
              <span className="text-[9.5px] font-bold text-mist">Длительность не задаётся — её считает физика</span>
            </div>
            <div className="relative mt-1.5 h-9 overflow-hidden rounded-xl border border-purple/40 bg-[#0b1220]">
              <motion.div key={`${run}-sp`} initial={{ x: 4 }} animate={{ x: "calc(100% - 38px)" }} transition={S.pop}
                className="absolute top-1.5 h-6 w-8 rounded-lg bg-purple" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">форма кривых</span>
        <svg viewBox="0 0 220 220" className="mt-4 w-full">
          <rect x="10" y="10" width="200" height="200" rx="14" fill="#0b1220" stroke="rgba(255,255,255,.08)" />
          {[0.25, 0.5, 0.75].map((g) => (
            <g key={g}>
              <line x1={10 + g * 200} y1="10" x2={10 + g * 200} y2="210" stroke="rgba(255,255,255,.05)" />
              <line x1="10" y1={10 + g * 200} x2="210" y2={10 + g * 200} stroke="rgba(255,255,255,.05)" />
            </g>
          ))}
          {CURVES.filter((c) => Array.isArray(c.e)).map((c) => {
            const [x1, y1, x2, y2] = c.e as number[];
            return <motion.path key={c.t} d={`M10,210 C${10 + x1 * 200},${210 - y1 * 200} ${10 + x2 * 200},${210 - y2 * 200} 210,10`}
              fill="none" stroke={c.tone} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: E.out }} />;
          })}
        </svg>
        <div className="mt-3 space-y-1.5 text-[11px] font-bold leading-relaxed text-mist">
          <p><b className="text-white">Правило 1.</b> Кривая, которая начинается почти вертикально (0.16,1) — это «резкий старт, долгая посадка». Так входит контент.</p>
          <p><b className="text-white">Правило 2.</b> Симметричная S-кривая (0.83,0,0.17,1) — это переход между состояниями. Так двигаются шторки.</p>
          <p><b className="text-white">Правило 3.</b> Всё, что должно ощущаться «живым», отдавай пружине: она сама подберёт длительность под расстояние.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Do / Don't на реальных игровых элементах ---------- */
const PAIRS = [
  {
    t: "Награда появляется",
    bad: "Fade-in 300 мс, linear",
    good: "Anticipation → pop + частицы",
    why: "Линейное появление не сообщает ценность. Сжатие перед выбросом и overshoot дают «весомость» без единого лишнего пикселя.",
  },
  {
    t: "Список подгружается",
    bad: "Все строки разом",
    good: "Stagger 70 мс + blur→0",
    why: "Одновременное появление читается как «перерисовка». Каскад задаёт порядок чтения и маскирует задержку данных.",
  },
  {
    t: "Нажатие кнопки",
    bad: "Только смена цвета",
    good: "Ход вниз 4 px + звук + вибро",
    why: "Палец не видит цвет под собой. Отклик обязан быть геометрическим и тактильным, а не цветовым.",
  },
  {
    t: "Урон / ошибка",
    bad: "Красная рамка",
    good: "Импакт + низкий звук + shake",
    why: "Ошибку игрок должен почувствовать телом. Статичная рамка не прерывает поток внимания.",
  },
];

function DoDont() {
  const [run, setRun] = useState(0);
  useEffect(() => { const t = setInterval(() => setRun((r) => r + 1), 2800); return () => clearInterval(t); }, []);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="max-w-xl text-[13px] font-bold text-mist">
          Слева — как делает 90% команд. Справа — как должно быть. Один и тот же элемент, разница только в моушене.
        </p>
        <button onClick={() => { feel("confirm"); setRun((r) => r + 1); }}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-teal px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#06231c]">
          <IcPlay size={12} /> проиграть
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {PAIRS.map((p, i) => (
          <div key={p.t} className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-4">
            <div className="text-[13px] font-extrabold uppercase">{p.t}</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Cell bad label={p.bad}><Demo i={i} run={run} good={false} /></Cell>
              <Cell label={p.good}><Demo i={i} run={run} good /></Cell>
            </div>
            <p className="mt-3 text-[11.5px] font-bold leading-relaxed text-mist"><b className="text-white">Почему: </b>{p.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cell({ children, label, bad }: any) {
  return (
    <div className="rounded-2xl border p-2" style={{ borderColor: bad ? "#e46a5f44" : "#3ec9a744", background: bad ? "#e46a5f0d" : "#3ec9a70d" }}>
      <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider" style={{ color: bad ? "#e46a5f" : "#3ec9a7" }}>
        {bad ? <IcClose size={11} /> : <IcCheck size={11} />}{label}
      </div>
      <div className="mt-2 grid h-[118px] place-items-center overflow-hidden rounded-xl bg-[#0b1220]">{children}</div>
    </div>
  );
}

function Demo({ i, run, good }: { i: number; run: number; good: boolean }) {
  const k = `${run}-${good}`;
  if (i === 0)
    return good ? (
      <motion.div key={k} initial={{ scale: 0.2, rotate: -20 }} animate={{ scale: [0.2, 0.86, 1.12, 1], rotate: [-20, 6, -2, 0] }}
        transition={{ duration: 0.75, ease: E.out }} className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-b from-[#ffd964] to-[#e0a72a] text-[#3c2a04]">
        <IcCrown size={28} />
      </motion.div>
    ) : (
      <motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: "linear" }}
        className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-b from-[#ffd964] to-[#e0a72a] text-[#3c2a04]">
        <IcCrown size={28} />
      </motion.div>
    );

  if (i === 1)
    return (
      <div className="w-full space-y-1.5 px-3">
        {[0, 1, 2, 3].map((r) => (
          <motion.div key={`${k}-${r}`}
            initial={good ? { x: 26, opacity: 0, filter: "blur(6px)" } : { opacity: 0 }}
            animate={good ? { x: 0, opacity: 1, filter: "blur(0px)" } : { opacity: 1 }}
            transition={good ? { ...S.soft, delay: r * 0.07 } : { duration: 0.2 }}
            className="flex items-center gap-2 rounded-lg bg-white/6 px-2 py-1.5">
            <span className="text-teal"><IcCoinMark size={12} /></span>
            <span className="h-1.5 flex-1 rounded-full bg-white/15" />
          </motion.div>
        ))}
      </div>
    );

  if (i === 2)
    return good ? (
      <motion.button whileTap={{ y: 4, scale: 0.98 }} transition={S.snap} onTap={() => feel("confirm", [8, 18, 8])}
        className="rounded-2xl px-5 py-3 text-[12px] font-extrabold uppercase text-[#06231c]"
        style={{ background: "linear-gradient(180deg,#54dcb6,#2a9b81)", boxShadow: "0 5px 0 #186050" }}>
        в бой
      </motion.button>
    ) : (
      <button className="rounded-2xl bg-[#2a9b81] px-5 py-3 text-[12px] font-extrabold uppercase text-[#06231c] transition-colors hover:bg-[#54dcb6]">
        в бой
      </button>
    );

  return good ? (
    <ShakeCard key={k} />
  ) : (
    <motion.div key={k} initial={{ borderColor: "#e46a5f00" }} animate={{ borderColor: "#e46a5f" }} transition={{ duration: 0.25 }}
      className="grid h-16 w-28 place-items-center rounded-2xl border-2 bg-white/5 text-[11px] font-extrabold text-coral">ОШИБКА</motion.div>
  );
}

function ShakeCard() {
  const x = useMotionValue(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const p = (t - t0) / 420;
      if (p >= 1) { x.set(0); return; }
      const d = (1 - p) ** 2 * 14 * TUNE.impact;
      x.set((Math.random() * 2 - 1) * d);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    feel("deny", [26, 30, 26]);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <motion.div style={{ x }} className="grid h-16 w-28 place-items-center rounded-2xl border-2 border-coral bg-coral/15 text-[11px] font-extrabold text-coral">
      <span className="flex items-center gap-1"><IcWarn size={14} /> ОШИБКА</span>
    </motion.div>
  );
}

/* ---------- 4. Хронометраж каскада: скраб по таймлайну ---------- */
const TRACKS = [
  { t: "Затемнение фона", s: 0, d: 220, tone: "#5b9cd6" },
  { t: "Печать «ПОБЕДА»", s: 120, d: 520, tone: "#f2c14e" },
  { t: "Импакт + звук", s: 280, d: 120, tone: "#e46a5f" },
  { t: "Заливка XP", s: 620, d: 900, tone: "#3ec9a7" },
  { t: "Частицы", s: 1500, d: 700, tone: "#9d8cf5" },
  { t: "Награды (stagger 120)", s: 1700, d: 780, tone: "#f2c14e" },
  { t: "Статистика (stagger 80)", s: 2500, d: 640, tone: "#8fa4c7" },
  { t: "Кнопки", s: 3000, d: 420, tone: "#3ec9a7" },
];
const TOTAL = 3600;
function Choreography() {
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(true);
  useEffect(() => {
    if (!play) return;
    let raf = 0; const t0 = performance.now() - t;
    const loop = (now: number) => {
      const v = (now - t0) % TOTAL;
      setT(v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [play]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">партитура экрана «итоги боя»</span>
          <div className="flex items-center gap-2">
            <span className="mono text-[11px] font-extrabold text-teal">{Math.round(t)} мс</span>
            <button onClick={() => { feel("tap"); setPlay((p) => !p); }} className="grid h-7 w-7 place-items-center rounded-full bg-teal text-[#06231c]">
              {play ? <span className="block h-2.5 w-2.5 bg-[#06231c]" /> : <IcPlay size={12} />}
            </button>
          </div>
        </div>

        <input type="range" min={0} max={TOTAL} value={t} onChange={(e) => { setPlay(false); setT(+e.target.value); }}
          className="mt-4 h-1.5 w-full appearance-none rounded-full bg-white/10" style={{ accentColor: "#3ec9a7" }} />

        <div className="relative mt-4 space-y-1.5">
          {TRACKS.map((tr) => {
            const active = t >= tr.s && t <= tr.s + tr.d;
            const done = t > tr.s + tr.d;
            return (
              <div key={tr.t} className="flex items-center gap-3">
                <span className="w-44 shrink-0 text-[10.5px] font-extrabold" style={{ color: active ? tr.tone : done ? "#cfe0f7" : "#5f7496" }}>{tr.t}</span>
                <div className="relative h-5 flex-1 overflow-hidden rounded-lg bg-[#0b1220]">
                  <div className="absolute inset-y-0 rounded-lg opacity-30" style={{ left: `${(tr.s / TOTAL) * 100}%`, width: `${(tr.d / TOTAL) * 100}%`, background: tr.tone }} />
                  <div className="absolute inset-y-0 rounded-lg" style={{
                    left: `${(tr.s / TOTAL) * 100}%`,
                    width: `${(Math.max(0, Math.min(tr.d, t - tr.s)) / TOTAL) * 100}%`,
                    background: tr.tone,
                  }} />
                </div>
                <span className="mono w-16 shrink-0 text-right text-[9.5px] font-bold text-mist">{tr.s}→{tr.s + tr.d}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">что показывает партитура</span>
          <ul className="mt-3 space-y-2 text-[12px] font-bold leading-relaxed text-mist">
            <li><b className="text-white">Волны, а не ковёр.</b> Четыре группы событий с паузами 200–400 мс. Одновременный запуск сжигает эмоцию за один кадр.</li>
            <li><b className="text-white">Импакт короткий.</b> 120 мс — предел. Дольше — игрок ощущает лаг, а не удар.</li>
            <li><b className="text-white">Деньги позже частиц.</b> Счётчик стартует через 200 мс после вспышки: сначала «летит», потом «зачислено».</li>
            <li><b className="text-white">Выход за 3.6 с.</b> Полный экран итогов обязан закрываться меньше чем за 4 секунды, иначе его начнут скипать.</li>
          </ul>
        </div>
        <CopyBlock code={`// партитура = массив, а не набор magic-number'ов в JSX
const BEAT = [
  { at: 0,    fn: dim },
  { at: 120,  fn: stampVictory },
  { at: 280,  fn: () => impact(14) },
  { at: 620,  fn: fillXP },
  { at: 1500, fn: () => burst({ n: 50 }) },
  { at: 1700, fn: () => rewards(120) },  // stagger
  { at: 2500, fn: () => stats(80) },
];
BEAT.forEach(b => setTimeout(b.fn, b.at / TUNE.speed));`} />
      </div>
    </div>
  );
}

/* ---------- 5. Бюджет производительности ---------- */
function Budget() {
  const fps = useFps();
  const rows = [
    { t: "transform / opacity", v: "GPU, композитор", ok: true, d: "Единственные свойства, которые можно анимировать бесконечно." },
    { t: "filter: blur()", v: "дорого при >12 px", ok: true, d: "Ок для коротких входов 6 px. Постоянный blur на большой площади убивает Android." },
    { t: "box-shadow", v: "перерисовка", ok: false, d: "Анимируй тень только на маленьких элементах и короткими всплесками." },
    { t: "width / height / top", v: "layout-шторм", ok: false, d: "Только через FLIP: layout / layoutId. Иначе пересчёт всего дерева." },
    { t: "canvas-частицы", v: "1 узел вместо 60", ok: true, d: "60 DOM-нод частиц = смерть. Один canvas с idle-stop — 0% в простое." },
    { t: "backdrop-filter", v: "не более 2 слоёв", ok: false, d: "Каждый слой — отдельный проход композитора." },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal/15 text-teal"><IcGauge size={24} /></span>
          <div>
            <div className="mono text-2xl font-extrabold" style={{ color: fps > 50 ? "#3ec9a7" : "#f2c14e" }}>{fps} FPS</div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">текущая страница</div>
          </div>
        </div>
        <div className="mt-4"><Bar v={Math.min(1, fps / 60)} tone={fps > 50 ? "#3ec9a7" : "#f2c14e"} h={10} label={`${fps} / 60`} /></div>
        <div className="mt-5 space-y-2">
          {rows.map((r) => (
            <div key={r.t} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <span className="mt-0.5" style={{ color: r.ok ? "#3ec9a7" : "#e46a5f" }}>{r.ok ? <IcCheck size={15} /> : <IcWarn size={15} />}</span>
              <div>
                <div className="mono text-[11.5px] font-extrabold">{r.t} <span className="text-mist">· {r.v}</span></div>
                <div className="text-[11px] font-bold leading-snug text-mist">{r.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">чеклист перед релизом</span>
          <div className="mt-3 space-y-2">
            {[
              "Все анимации читают общий конфиг пружин, а не хардкод в компонентах",
              "prefers-reduced-motion выключает импакт, частицы и параллакс",
              "Ни одной анимации layout-свойств вне FLIP",
              "Частицы останавливают rAF при пустом буфере",
              "Звук инициализируется только после первого жеста пользователя",
              "Каждое значимое событие имеет звук + вибро + геометрию",
              "Выход анимации ≤ 60% времени входа",
            ].map((c) => (
              <label key={c} className="flex cursor-pointer items-start gap-2.5 rounded-xl bg-white/[0.03] p-2.5">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-teal/60 text-teal"><IcCheck size={10} /></span>
                <span className="text-[11.5px] font-bold text-mist">{c}</span>
              </label>
            ))}
          </div>
        </div>
        <CopyBlock code={`/* глобальный тормоз для доступности */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
}
// и в коде:
if (matchMedia("(prefers-reduced-motion: reduce)").matches)
  commitTune({ impact: 0, particles: .15, stagger: .2, speed: 1.6 });`} />
      </div>
    </div>
  );
}

export function CopyBlock({ code, tone = "#3ec9a7" }: { code: string; tone?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div className="relative">
      <pre className="mono overflow-auto rounded-2xl border border-white/10 bg-[#080d18] p-4 text-[11px] leading-relaxed" style={{ color: tone }}>{code}</pre>
      <button onClick={async () => { setOk(await copyText(code)); feel("tap"); setTimeout(() => setOk(false), 1500); }}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#111a2b] px-2 py-1 text-[9px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
        {ok ? <IcCheck size={11} /> : <IcCopy size={11} />}{ok ? "ок" : "copy"}
      </button>
    </div>
  );
}

/* ---------- 6. Исходники ядра: то, что реально забирают в проект ---------- */
const CORE: { t: string; d: string; code: string }[] = [
  {
    t: "Тюнингуемые пресеты",
    d: "S — живой объект. Компоненты читают его в момент рендера, поэтому один вызов applyTune() перенастраивает всё приложение.",
    code: `export const BASE = {
  snap:  { type: "spring", stiffness: 760, damping: 34, mass: .55 },
  pop:   { type: "spring", stiffness: 430, damping: 17, mass: .70 },
  soft:  { type: "spring", stiffness: 210, damping: 26, mass: 1   },
  heavy: { type: "spring", stiffness: 130, damping: 20, mass: 1.6 },
};
export const S = structuredClone(BASE);
export const TUNE = { speed: 1, bounce: 1, weight: 1, stagger: 1, impact: 1, particles: 1, sound: true };

export function applyTune(t) {
  Object.assign(TUNE, t);
  for (const k in BASE) {
    S[k].stiffness = Math.round(BASE[k].stiffness * TUNE.speed);
    S[k].damping   = BASE[k].damping / TUNE.bounce;
    S[k].mass      = BASE[k].mass * TUNE.weight;
  }
}
export const stg = (i, step = .07) => i * step * TUNE.stagger;   // каскад
export const dur = (v) => v / TUNE.speed;                         // длительность`,
  },
  {
    t: "Импакт (screen shake)",
    d: "Квадратичное затухание по rAF. Трясём контейнер сцены, а не body — иначе появляется скролл и layout-шторм.",
    code: `export function useImpact() {
  const x = useMotionValue(0), y = useMotionValue(0), r = useMotionValue(0);
  const fire = useCallback((power = 10, time = .36) => {
    power *= TUNE.impact;
    if (power < .4) return;                 // режим доступности
    const t0 = performance.now();
    const loop = (t) => {
      const p = (t - t0) / (time * 1000);
      if (p >= 1) { x.set(0); y.set(0); r.set(0); return; }
      const d = (1 - p) ** 2 * power;       // затухание — квадрат, не линия
      x.set(rnd(-d, d)); y.set(rnd(-d, d)); r.set(rnd(-d, d) * .1);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, []);
  return { x, y, r, fire };
}
// применение: <motion.div style={{ x: imp.x, y: imp.y, rotate: imp.r }}>`,
  },
  {
    t: "Звук без ассетов",
    d: "WebAudio синтезирует отклик: 6 тембров, ~40 строк, ноль файлов в бандле. Разные тембры для успеха и ошибки обязательны.",
    code: `export function sfx(kind = "tap") {
  if (!TUNE.sound) return;
  const c = ctx(), t = c.currentTime;
  const tone = (f0, f1, d, type, g0, delay = 0) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t + delay);
    o.frequency.exponentialRampToValueAtTime(f1, t + delay + d);
    g.gain.setValueAtTime(.0001, t + delay);
    g.gain.exponentialRampToValueAtTime(g0, t + delay + .008);   // атака 8 мс
    g.gain.exponentialRampToValueAtTime(.0001, t + delay + d);   // спад
    o.connect(g).connect(c.destination); o.start(t + delay); o.stop(t + delay + d + .02);
  };
  if (kind === "tap")     tone(520, 340, .05, "triangle", .03);
  if (kind === "deny")    tone(200, 120, .16, "sawtooth", .028);          // низ = ошибка
  if (kind === "reward")  [0,.07,.14,.23].forEach((d,i) =>
                            tone(520 + i*180, 900 + i*220, .14, "triangle", .03, d));
}
export const feel = (kind = "tap", v = 9) => { sfx(kind); navigator.vibrate?.(v); };`,
  },
  {
    t: "Частицы с idle-stop",
    d: "Один canvas вместо десятков DOM-узлов. Цикл сам засыпает при пустом буфере — шесть телефонов на странице не жрут кадры.",
    code: `const loop = () => {
  ctx.clearRect(0, 0, w, h);
  parts = parts.filter(p => p.life < p.max);
  if (!parts.length) { running = false; return; }      // ← ключевая строка
  for (const p of parts) {
    p.life++; p.vy += gravity; p.vx *= .985; p.vy *= .985;
    p.x += p.vx; p.y += p.vy;
    const a = 1 - p.life / p.max;
    ctx.globalAlpha = a; ctx.fillStyle = p.c;
    ctx.shadowBlur = 10; ctx.shadowColor = p.c;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.s * a, 0, 7); ctx.fill();
  }
  requestAnimationFrame(loop);
};
const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };`,
  },
  {
    t: "Партитура сцены",
    d: "Тайминги живут в данных, а не в JSX. Так сцену можно ускорить целиком и показать хронометраж дизайнеру.",
    code: `export function useTimeline(steps, stepMs, active = true) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    let id;
    const run = (k) => {
      const d = Array.isArray(stepMs) ? stepMs[k % stepMs.length] : stepMs;
      id = setTimeout(() => { const n = (k + 1) % steps; setI(n); run(n); }, d / TUNE.speed);
    };
    run(i);
    return () => clearTimeout(id);
  }, [active, steps]);
  return [i, setI];
}`,
  },
  {
    t: "Счётчик значений",
    d: "Валюта и очки докручиваются через animate(), а не setInterval: один rAF, идеальная синхронизация с кадром.",
    code: `export function useCount(value, duration = .9) {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, {
      duration: duration / TUNE.speed, ease: [.16,1,.3,1], onUpdate: setD,
    });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return d;
}`,
  },
];

function Core() {
  const [open, setOpen] = useState(0);
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-2">
        <div className="rounded-2xl border border-teal/25 bg-teal/[0.06] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal">motion-ядро</div>
          <p className="mt-2 text-[12px] font-bold leading-relaxed text-mist">
            Шесть примитивов, на которых держатся все экраны каталога. Копируются в проект как есть —
            зависимость одна: <span className="mono text-white">motion</span>.
          </p>
        </div>
        {CORE.map((c, i) => (
          <button key={c.t} onClick={() => { feel("tap"); setOpen(i); }}
            className="relative block w-full rounded-2xl px-4 py-3 text-left">
            {open === i && <motion.span layoutId="corepill" transition={S.pop} className="absolute inset-0 rounded-2xl bg-white/[0.06]" style={{ boxShadow: "inset 0 0 0 1px rgba(62,201,167,.5)" }} />}
            <span className="relative block text-[12.5px] font-extrabold" style={{ color: open === i ? "#3ec9a7" : "#cfe0f7" }}>{c.t}</span>
            <span className="relative mt-0.5 block text-[10.5px] font-bold leading-snug text-mist line-clamp-2">{c.d}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={open} initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(8px)" }} transition={{ duration: 0.3, ease: E.out }} className="space-y-3">
          <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
            <div className="text-[15px] font-extrabold uppercase">{CORE[open].t}</div>
            <p className="mt-2 text-[13px] font-bold leading-relaxed text-mist">{CORE[open].d}</p>
          </div>
          <CopyBlock code={CORE[open].code} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


/* ---------- 2. A/B сравнение двух профилей на одной сцене ---------- */
const PROFILES: Record<string, { t: string; v: Partial<Tune>; tone: string }> = {
  aaa: { t: "AAA mobile", v: { speed: 1, bounce: 1, weight: 1, stagger: 1 }, tone: "#3ec9a7" },
  snappy: { t: "Snappy UI", v: { speed: 1.35, bounce: 0.7, weight: 0.85, stagger: 0.6 }, tone: "#5b9cd6" },
  juicy: { t: "Juicy arcade", v: { speed: 0.95, bounce: 1.45, weight: 1.15, stagger: 1.3 }, tone: "#f2c14e" },
  cinema: { t: "Cinematic", v: { speed: 0.7, bounce: 1.1, weight: 1.5, stagger: 1.6 }, tone: "#9d8cf5" },
  a11y: { t: "Reduced", v: { speed: 1.6, bounce: 0.35, weight: 0.8, stagger: 0.2 }, tone: "#8fa4c7" },
};

function ABCompare() {
  const [a, setA] = useState("snappy");
  const [b, setB] = useState("juicy");
  const [run, setRun] = useState(0);
  const [scene, setScene] = useState(0);
  const scenes = ["Карточка награды", "Каскад списка", "Панель снизу"];
  useEffect(() => { const t = setInterval(() => setRun((r) => r + 1), 2600); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-[13px] font-bold text-mist">
          Две физики на одной сцене. Так выбирают профиль для продукта: не по описанию, а по тому,
          какая версия ощущается правильной на конкретном элементе.
        </p>
        <div className="flex gap-2">
          {scenes.map((sc, i) => (
            <button key={sc} onClick={() => { feel("tap"); setScene(i); }}
              className="relative rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider">
              {scene === i && <motion.span layoutId="abscene" transition={S.pop} className="absolute inset-0 rounded-full bg-white/10" />}
              <span className={`relative ${scene === i ? "text-white" : "text-mist"}`}>{sc}</span>
            </button>
          ))}
          <button onClick={() => { feel("confirm"); setRun((r) => r + 1); }}
            className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-[#06231c]">
            <IcPlay size={12} /> прогнать
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {[{ id: a, set: setA, side: "A" }, { id: b, set: setB, side: "B" }].map(({ id, set, side }) => {
          const p = PROFILES[id];
          const sp = springFrom("pop", p.v);
          const m = sampleSpring(sp);
          return (
            <div key={side} className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-4">
              <div className="flex items-center justify-between">
                <span className="mono text-[11px] font-extrabold" style={{ color: p.tone }}>{side} · {p.t}</span>
                <select value={id} onChange={(e) => { set(e.target.value); feel("tap"); }}
                  className="mono rounded-lg border border-white/12 bg-[#0b1220] px-2 py-1 text-[10px] font-bold text-mist outline-none">
                  {Object.entries(PROFILES).map(([k, v]) => <option key={k} value={k}>{v.t}</option>)}
                </select>
              </div>

              <div className="mt-3 grid h-[176px] place-items-center overflow-hidden rounded-2xl border border-white/8 bg-[#0b1220]">
                <ABScene scene={scene} spring={sp} stagger={(p.v.stagger ?? 1) * 0.07} tone={p.tone} runKey={`${run}-${id}-${scene}`} />
              </div>

              <div className="mt-3 flex items-center gap-3">
                <SpringGraph tone={p.tone} spring={sp} w={124} h={56} />
                <div className="space-y-1 text-[10px] font-bold">
                  <Row l="stiffness" v={String(sp.stiffness)} tone={p.tone} />
                  <Row l="damping" v={String(sp.damping)} tone={p.tone} />
                  <Row l="settle" v={`${m.settleMs} мс`} tone={m.settleMs > 900 ? "#f2c14e" : p.tone} />
                  <Row l="overshoot" v={`${(m.overshoot * 100).toFixed(0)}%`} tone={m.overshoot > 0.35 ? "#e46a5f" : p.tone} />
                </div>
              </div>

              <button onClick={() => { commitTune(p.v); feel("confirm"); }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em]"
                style={{ background: p.tone + "22", color: p.tone, boxShadow: `inset 0 0 0 1px ${p.tone}66` }}>
                <IcCheck size={13} /> применить ко всему каталогу
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.25em]">как читать сравнение</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { t: "settle < 600 мс", d: "Для UI-элементов. Дольше — интерфейс ощущается «ватным»." },
            { t: "overshoot 12–25%", d: "Зона, где награда читается как ценная. Выше 40% — мультик." },
            { t: "stagger 60–90 мс", d: "Ниже — каскад не читается, выше — список «тянется»." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div className="mono text-[11px] font-extrabold text-teal">{x.t}</div>
              <div className="mt-1 text-[11.5px] font-bold leading-snug text-mist">{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function Row({ l, v, tone }: any) {
  return <div className="flex gap-2"><span className="w-16 text-mist">{l}</span><span className="mono font-extrabold" style={{ color: tone }}>{v}</span></div>;
}

function ABScene({ scene, spring, stagger, tone, runKey }: any) {
  if (scene === 0)
    return (
      <motion.div key={runKey} initial={{ scale: 0.2, y: 30, rotate: -14 }} animate={{ scale: 1, y: 0, rotate: 0 }} transition={spring}
        className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: tone + "26", boxShadow: `inset 0 0 0 2px ${tone}` }}>
        <span style={{ color: tone }}><IcCrown size={34} /></span>
      </motion.div>
    );
  if (scene === 1)
    return (
      <div className="w-full space-y-2 px-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div key={`${runKey}-${i}`} initial={{ x: 40, opacity: 0, filter: "blur(6px)" }} animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ ...spring, delay: i * stagger }} className="flex items-center gap-2 rounded-lg bg-white/6 px-2 py-1.5">
            <span style={{ color: tone }}><IcStar size={12} /></span>
            <span className="h-1.5 flex-1 rounded-full" style={{ background: tone + "44" }} />
            <span className="mono text-[9px] font-bold text-mist">+{(i + 1) * 40}</span>
          </motion.div>
        ))}
      </div>
    );
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-x-4 top-4 space-y-2 opacity-40">
        {[0, 1, 2].map((i) => <div key={i} className="h-7 rounded-lg bg-white/8" />)}
      </div>
      <motion.div key={runKey} initial={{ y: 200 }} animate={{ y: 0 }} transition={spring}
        className="absolute inset-x-0 bottom-0 h-24 rounded-t-3xl border-t p-3"
        style={{ background: "#18223b", borderColor: tone + "77" }}>
        <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20" />
        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: tone + "22", color: tone }}><IcLayers size={16} /></span>
          <div className="flex-1">
            <div className="h-2 w-20 rounded-full bg-white/25" />
            <div className="mt-1.5 h-1.5 w-28 rounded-full bg-white/10" />
          </div>
          <span style={{ color: tone }}><IcArrow size={16} /></span>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------- 8. Токены: полный экспорт дизайн-системы движения ---------- */
function Tokens() {
  useTuneVersion();
  const css = `/* motion-tokens.css — цвет + физика одним файлом */
:root {
  /* палитра «СИГНАЛ» */
  --c-abyss:#0b1120; --c-deep:#121b2e; --c-panel:#1b2740;
  --c-teal:#3ec9a7;  --c-gold:#f2c14e; --c-purple:#9d8cf5;
  --c-coral:#e46a5f; --c-sky:#5b9cd6;  --c-mist:#8fa4c7;

  /* кривые */
  --e-out: cubic-bezier(.16,1,.3,1);
  --e-io:  cubic-bezier(.83,0,.17,1);
  --e-back:cubic-bezier(.34,1.56,.64,1);

  /* тайминги при темпе ×${TUNE.speed.toFixed(2)} */
  --t-micro:  ${Math.round(120 / TUNE.speed)}ms;   /* тап, тумблер      */
  --t-enter:  ${Math.round(420 / TUNE.speed)}ms;   /* вход элемента     */
  --t-exit:   ${Math.round(240 / TUNE.speed)}ms;   /* выход (< входа)   */
  --t-screen: ${Math.round(560 / TUNE.speed)}ms;   /* переход экрана    */
  --stagger:  ${Math.round(70 * TUNE.stagger)}ms;  /* шаг каскада       */

  /* поверхности */
  --panel: linear-gradient(180deg,#223250,#1a2540);
  --panel-sunk: linear-gradient(180deg,#141d33,#18223b);
  --press: 0 5px 0 rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.22);
}`;
  const ts = `// motion-tokens.ts
export const SPRING = {
  snap:  { type:"spring", stiffness:${S.snap.stiffness}, damping:${S.snap.damping}, mass:${S.snap.mass} },
  pop:   { type:"spring", stiffness:${S.pop.stiffness}, damping:${S.pop.damping}, mass:${S.pop.mass} },
  soft:  { type:"spring", stiffness:${S.soft.stiffness}, damping:${S.soft.damping}, mass:${S.soft.mass} },
  heavy: { type:"spring", stiffness:${S.heavy.stiffness}, damping:${S.heavy.damping}, mass:${S.heavy.mass} },
} as const;

export const EASE = {
  out:  [.16, 1, .3, 1],
  io:   [.83, 0, .17, 1],
  back: [.34, 1.56, .64, 1],
} as const;

export const TIME = {
  micro: ${(0.12 / TUNE.speed).toFixed(3)},
  enter: ${(0.42 / TUNE.speed).toFixed(3)},
  exit:  ${(0.24 / TUNE.speed).toFixed(3)},
  screen:${(0.56 / TUNE.speed).toFixed(3)},
  stagger:${(0.07 * TUNE.stagger).toFixed(3)},
} as const;

export const FX = { impact: ${TUNE.impact.toFixed(2)}, particles: ${TUNE.particles.toFixed(2)}, sound: ${TUNE.sound} };`;

  const json = JSON.stringify({
    spring: { snap: S.snap, pop: S.pop, soft: S.soft, heavy: S.heavy },
    ease: { out: [0.16, 1, 0.3, 1], io: [0.83, 0, 0.17, 1], back: [0.34, 1.56, 0.64, 1] },
    time: { micro: +(0.12 / TUNE.speed).toFixed(3), enter: +(0.42 / TUNE.speed).toFixed(3), exit: +(0.24 / TUNE.speed).toFixed(3), screen: +(0.56 / TUNE.speed).toFixed(3), stagger: +(0.07 * TUNE.stagger).toFixed(3) },
    fx: { impact: TUNE.impact, particles: TUNE.particles, sound: TUNE.sound },
  }, null, 2);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-teal/25 bg-teal/[0.06] p-5">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-teal">полный экспорт</div>
        <p className="mt-2 max-w-2xl text-[13px] font-bold leading-relaxed text-mist">
          Три формата одних и тех же токенов: CSS-переменные для вёрстки, TypeScript для motion-компонентов
          и JSON для дизайн-инструментов. Значения отражают текущее положение ползунков тюнера.
        </p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <Label t="CSS · переменные" />
          <CopyBlock code={css} tone="#5b9cd6" />
        </div>
        <div className="space-y-2">
          <Label t="TypeScript · motion" />
          <CopyBlock code={ts} tone="#3ec9a7" />
        </div>
      </div>
      <div className="space-y-2">
        <Label t="JSON · для Figma / design tokens" />
        <CopyBlock code={json} tone="#f2c14e" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold/25 bg-gold/[0.05] p-5">
        <div>
          <div className="text-[13px] font-extrabold uppercase">Полная спецификация каталога</div>
          <p className="mt-1 max-w-lg text-[12px] font-bold leading-relaxed text-mist">
            Markdown-документ по всем экранам: физика, партитуры, чеклисты приёмки, типовые ловушки и код.
            Отдаётся разработчику как есть.
          </p>
        </div>
        <button onClick={() => { feel("confirm"); download("signal-motion-spec.md", specForAll(CATEGORIES)); }}
          className="flex items-center gap-2 rounded-2xl bg-gold px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#3c2a04]">
          <IcCopy size={14} /> скачать .md
        </button>
      </div>
    </div>
  );
}
function Label({ t }: { t: string }) {
  return <div className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-mist">{t}</div>;
}
