import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { S, BASE, E, TUNE, feel, sampleSpring, springFrom, copyText, useFps, useTuneVersion, dur, commitTune, type Tune } from "../lib/motion";
import { Tuner, SpringGraph } from "./Tuner";
import { IcPlay, IcCheck, IcClose, IcWarn, IcGauge, IcCopy, IcCoinMark, IcCrown, IcBolt, IcArrow, IcStar, IcLayers, IcTarget, IcEye } from "../ui/icons";
import { Bar } from "../ui/kit";
import { RankCrest, Avatar, Dial, StatRadar, CandleScene, VolumeStrip, Ribbon, Medal, Stamp, MiniScreen } from "../ui/art";
import { specForAll, specForCategory, download } from "../lib/spec";
import { CATEGORIES, ALL } from "../data/catalog";

/* =====================================================================
   ЛАБОРАТОРИЯ — инструментальная часть каталога:
   1) стенд пружин  2) кривые  3) Do / Don't  4) хронометраж каскада
   5) бюджет производительности
   ===================================================================== */

export function Lab() {
  const [tab, setTab] = useState(0);
  const tabs = ["Стенд пружин", "A / B профили", "Кривые", "Do / Don't", "Хронометраж", "Бюджет FPS", "Ядро · исходники", "Токены", "Арт-кит", "Микро", "Звук и хаптика", "Спецификация"];
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
            {tab === 1 && <ABCompare />}
            {tab === 2 && <EasingBench />}
            {tab === 3 && <DoDont />}
            {tab === 4 && <Choreography />}
            {tab === 5 && <Budget />}
            {tab === 6 && <Core />}
            {tab === 7 && <Tokens />}
            {tab === 8 && <ArtKit />}
            {tab === 9 && <MicroLab />}
            {tab === 10 && <SoundLab />}
            {tab === 11 && <SpecExport />}
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


/* ---------- 9. Хендофф-спецификация: каталог как документ ---------- */
function SpecExport() {
  useTuneVersion();
  const [pick, setPick] = useState<string>("all");
  const [done, setDone] = useState("");
  const cat = CATEGORIES.find((c) => c.id === pick);
  const text = cat ? specForCategory(cat) : specForAll(CATEGORIES);
  const lines = text.split("\n").length;
  const words = text.split(/\s+/).length;
  const screens = cat ? cat.assets.length : ALL.length;

  const save = () => {
    download(cat ? `signal-motion-spec-${cat.id}.md` : "signal-motion-spec.md", text);
    feel("reward");
    setDone("файл сохранён");
    setTimeout(() => setDone(""), 1800);
  };
  const copy = async () => {
    await copyText(text);
    feel("confirm");
    setDone("скопировано в буфер");
    setTimeout(() => setDone(""), 1800);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-teal/25 bg-teal/[0.06] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal">хендофф разработчику</div>
          <p className="mt-2 text-[12px] font-bold leading-relaxed text-mist">
            Каталог умеет отдавать себя текстом: markdown со всей физикой, таймингами,
            чеклистами приёмки, ловушками и кодом. Параметры берутся из тюнера —
            документ всегда соответствует тому, что видно на экране.
          </p>
        </div>

        <div className="space-y-1.5">
          <button onClick={() => { feel("tap"); setPick("all"); }}
            className="relative block w-full rounded-2xl px-4 py-3 text-left">
            {pick === "all" && <motion.span layoutId="specpill" transition={S.pop} className="absolute inset-0 rounded-2xl bg-white/[0.07]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(62,201,167,.55)" }} />}
            <span className="relative block text-[12.5px] font-extrabold" style={{ color: pick === "all" ? "#3ec9a7" : "#cfe0f7" }}>
              Весь каталог
            </span>
            <span className="relative block text-[10.5px] font-bold text-mist">{ALL.length} экранов · {CATEGORIES.length} категорий</span>
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => { feel("tap"); setPick(c.id); }}
              className="relative block w-full rounded-2xl px-4 py-2.5 text-left">
              {pick === c.id && <motion.span layoutId="specpill" transition={S.pop} className="absolute inset-0 rounded-2xl bg-white/[0.07]"
                style={{ boxShadow: `inset 0 0 0 1px ${c.color}88` }} />}
              <span className="relative block text-[12px] font-extrabold" style={{ color: pick === c.id ? c.color : "#cfe0f7" }}>{c.name}</span>
              <span className="relative block text-[10px] font-bold text-mist">{c.assets.length} экранов · {c.tagline}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "экранов", v: screens },
            { l: "строк", v: lines },
            { l: "слов", v: words },
          ].map((m) => (
            <div key={m.l} className="rounded-2xl border border-white/8 bg-[#111a2b]/70 p-4 text-center">
              <div className="mono text-xl font-extrabold text-teal">{m.v.toLocaleString("ru-RU")}</div>
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-mist">{m.l}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={save}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-[11px] font-extrabold uppercase tracking-[0.2em]"
            style={{ background: "linear-gradient(180deg,#54dcb6,#2a9b81)", color: "#06231c", boxShadow: "0 5px 0 #186050" }}>
            <IcCheck size={14} /> скачать .md
          </button>
          <button onClick={copy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] py-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist hover:text-white">
            <IcCopy size={14} /> копировать
          </button>
        </div>
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-xl border border-teal/40 bg-teal/10 px-3 py-2 text-center text-[11px] font-extrabold text-teal">
              {done}
            </motion.div>
          )}
        </AnimatePresence>

        <pre className="mono max-h-[46vh] overflow-auto rounded-2xl border border-white/10 bg-[#080d18] p-4 text-[10.5px] leading-relaxed text-teal">
          {text.slice(0, 4200)}
          {text.length > 4200 ? "\n\n… (полный документ — в файле)" : ""}
        </pre>
      </div>
    </div>
  );
}


/* ---------- 9. Арт-кит: процедурные компоненты вместо картинок ---------- */
const ART_ITEMS: { id: string; t: string; d: string; code: string; render: (tone: string) => any }[] = [
  {
    id: "crest",
    t: "Герб ранга",
    d: "Семь ступеней от дерева до мастера. Металл, фаска, три звезды и центральный знак — всё в одном SVG на 12 узлов. Меняется только палитра.",
    code: `<RankCrest rank="dia" size={96} stars={2} label="АЛМАЗ IV" />
// палитры: wood · bronze · silver · gold · plat · dia · master`,
    render: () => (
      <div className="flex flex-wrap items-end justify-center gap-3">
        {(["bronze", "silver", "gold", "plat", "dia", "master"] as const).map((r, i) => (
          <motion.div key={r} initial={{ y: 20, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ ...S.pop, delay: i * 0.06 }}>
            <RankCrest rank={r} size={68} stars={((i + 1) % 3) + 1} />
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "avatar",
    t: "Процедурный аватар",
    d: "Три типа визора, лучи фона и оправа под цвет фракции. Сид даёт стабильный, но разный результат — можно генерировать на каждого игрока.",
    code: `<Avatar seed={player.id} size={56} tone={faction.color} />
// visor = seed % 3, фон и оправа наследуют tone`,
    render: (tone) => (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {[1, 2, 3, 4, 5].map((sd, i) => (
          <motion.div key={sd} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ ...S.pop, delay: i * 0.06 }}>
            <Avatar seed={sd} size={62} tone={[tone, "#f2c14e", "#9d8cf5", "#5b9cd6", "#e46a5f"][i]} />
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "dial",
    t: "Кольцевой индикатор",
    d: "Прогресс на strokeDashoffset с пружиной и свечением по цвету. Заменяет и полосу, и круговой чарт — читается на 64 px.",
    code: `<Dial v={winrate} max={100} tone="#3ec9a7"
      label={\`\${winrate}%\`} sub="винрейт" size={112} />`,
    render: (tone) => (
      <div className="flex flex-wrap items-center justify-center gap-5">
        <Dial v={67} tone={tone} label="67%" sub="винрейт" />
        <Dial v={34} tone="#f2c14e" label="34" sub="серия" size={92} thick={7} />
        <Dial v={88} tone="#9d8cf5" label="88" sub="навык" size={78} thick={6} />
      </div>
    ),
  },
  {
    id: "radar",
    t: "Радар навыков",
    d: "Пять-шесть осей, полигон растёт из центра, вершины досыпаются каскадом. Больше шести осей превращают радар в круг.",
    code: `<StatRadar values={[85,72,50,90,60]}
  labels={["ТЕХ","РИСК","ФУНД","ПСИХО","СЕЙФ"]} tone="#3ec9a7" />`,
    render: (tone) => <StatRadar values={[85, 72, 50, 90, 60]} labels={["ТЕХ", "РИСК", "ФУНД", "ПСИХО", "СЕЙФ"]} size={186} tone={tone} />,
  },
  {
    id: "chart",
    t: "Свечная сцена",
    d: "Четырнадцать свечей печатаются слева направо, уровень рисуется pathLength, маркер пульсирует кольцом. Один компонент на все экраны с графиком.",
    code: `<CandleScene w={260} h={130} seed={7}
  level={68} marker={11} tone="#3ec9a7" bear="#e46a5f" />`,
    render: (tone) => (
      <div className="grid gap-3">
        <CandleScene w={300} h={120} seed={7} level={68} marker={11} tone={tone} />
        <VolumeStrip data={[4, 6, 5, 8, 7, 5, 4, 3, 6, 9, 7, 5]} tone={tone} w={300} h={30} />
      </div>
    ),
  },
  {
    id: "misc",
    t: "Лента, медаль, штамп",
    d: "Мелкие носители статуса. Лента для титулов, медаль для достижений, штамп для необратимых событий — все три с одинаковой геометрией углов.",
    code: `<Ribbon tone="#f2c14e">топ 8% сезона</Ribbon>
<Medal tone="#9d8cf5" locked={false} />
<Stamp text="ЗАКРЫТО" tone="#e46a5f" />`,
    render: (tone) => (
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Ribbon tone={tone} w={196}>топ 8% сезона</Ribbon>
        <div className="flex gap-3">
          <Medal tone="#f2c14e" /><Medal tone="#9d8cf5" /><Medal tone="#46587a" locked />
        </div>
        <Stamp text="ЗАКРЫТО" tone="#e46a5f" size={92} />
      </div>
    ),
  },
  {
    id: "screen",
    t: "Мини-экран",
    d: "Пиктограмма экрана для карт потоков и навигации. Четыре типа раскладки, цвет наследуется от состояния.",
    code: `<MiniScreen tone={flow.tone} kind={i % 4} w={44} />`,
    render: (tone) => (
      <div className="flex items-end justify-center gap-5">
        {[0, 1, 2, 3].map((k) => (
          <motion.div key={k} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.pop, delay: k * 0.07 }}>
            <MiniScreen tone={k === 1 ? tone : "#6f83a6"} kind={k} w={52} />
          </motion.div>
        ))}
      </div>
    ),
  },
];

function ArtKit() {
  const [open, setOpen] = useState(0);
  const [tone, setTone] = useState("#3ec9a7");
  const [seed, setSeed] = useState(0);
  const item = ART_ITEMS[open];
  const TONES = ["#3ec9a7", "#f2c14e", "#9d8cf5", "#5b9cd6", "#e46a5f"];

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-2">
        <div className="rounded-2xl border border-purple/25 bg-purple/[0.06] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-purple">арт без растра</div>
          <p className="mt-2 text-[12px] font-bold leading-relaxed text-mist">
            Вся графика каталога — процедурный SVG: гербы, аватары, графики, медали.
            Ноль PNG, ноль спрайтов, мгновенная перекраска под любую палитру и ретина по умолчанию.
          </p>
        </div>
        {ART_ITEMS.map((a, i) => (
          <button key={a.id} onClick={() => { feel("tap"); setOpen(i); }}
            className="relative block w-full rounded-2xl px-4 py-3 text-left">
            {open === i && <motion.span layoutId="artpill" transition={S.pop} className="absolute inset-0 rounded-2xl bg-white/[0.06]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(157,140,245,.55)" }} />}
            <span className="relative block text-[12.5px] font-extrabold" style={{ color: open === i ? "#9d8cf5" : "#cfe0f7" }}>{a.t}</span>
            <span className="relative mt-0.5 block text-[10.5px] font-bold leading-snug text-mist line-clamp-2">{a.d}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-[#111a2b]/70 px-4 py-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-mist">палитра</span>
          <div className="flex gap-1.5">
            {TONES.map((t) => (
              <button key={t} onClick={() => { feel("tap"); setTone(t); }}
                className="h-7 w-7 rounded-lg transition-transform"
                style={{ background: t, boxShadow: tone === t ? `0 0 0 2px #0b1220, 0 0 0 4px ${t}` : "none", transform: tone === t ? "scale(1.08)" : "none" }} />
            ))}
          </div>
          <button onClick={() => { feel("confirm"); setSeed((s) => s + 1); }}
            className="ml-auto flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[9.5px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
            <IcPlay size={11} /> перерисовать
          </button>
        </div>

        <div className="grid min-h-[280px] place-items-center rounded-3xl border border-white/8 bg-[#0b1220] p-6"
          style={{ backgroundImage: "radial-gradient(60% 50% at 50% 30%, " + tone + "14, transparent 70%)" }}>
          <AnimatePresence mode="wait">
            <motion.div key={`${item.id}-${tone}-${seed}`}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(6px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }} transition={{ duration: 0.3, ease: E.out }}>
              {item.render(tone)}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111a2b]/70 p-4">
          <div className="text-[14px] font-extrabold uppercase">{item.t}</div>
          <p className="mt-1.5 text-[12.5px] font-bold leading-relaxed text-mist">{item.d}</p>
        </div>
        <CopyBlock code={item.code} tone="#9d8cf5" />
      </div>
    </div>
  );
}


/* ---------- 10. Микровзаимодействия: 12 атомарных приёмов ---------- */
type Micro = {
  t: string; d: string; tone: string;
  why: string;
  code: string;
  render: (k: number) => any;
};

const MICRO: Micro[] = [
  {
    t: "Магнитная кнопка",
    d: "Элемент притягивается к курсору, а не просто меняет фон.",
    tone: "#3ec9a7",
    why: "Магнит создаёт ощущение «веса» интерфейса. Радиус притяжения 40–60 px — дальше объект перестаёт ощущаться связанным с пальцем.",
    code: `// притяжение к указателю
onPointerMove={(e) => {
  const r = el.getBoundingClientRect();
  x.set((e.clientX - (r.left + r.width / 2)) * .22);
  y.set((e.clientY - (r.top + r.height / 2)) * .22);
}}
onPointerLeave={() => { x.set(0); y.set(0); }}   // возврат пружиной`,
    render: (k) => <MagnetBox key={k} />,
  },
  {
    t: "Жидкая заливка",
    d: "Клик заполняет кнопку цветом от точки касания.",
    tone: "#f2c14e",
    why: "Заливка от точки тапа связывает действие и причину. От центра — выглядит как обычная CSS-анимация.",
    code: `<motion.span
  style={{ background: tone }}
  initial={{ scale: 0, x: ox, y: oy, opacity: .9 }}
  animate={{ scale: 14, opacity: 0 }}
  transition={{ duration: .55, ease: E.out }} />`,
    render: (k) => <LiquidFill key={k} />,
  },
  {
    t: "Squash без потери объёма",
    d: "Прыжок сохраняет площадь: sy = 1 / sx.",
    tone: "#9d8cf5",
    why: "Нарушение объёма — самый быстрый способ сделать объект «пластиковым». sx·sy = 1 и глаз его принимает.",
    code: `const sx = 1 + press * .18;
animate={{ scale: [sx, 1 / sx, 1] }}
transition={{ duration: .42, ease: E.back }}`,
    render: (k) => <SquashBall key={k} />,
  },
  {
    t: "Отложенный хвост",
    d: "Второй элемент догоняет первый с задержкой пружины.",
    tone: "#5b9cd6",
    why: "Разные дампинги у слоёв дают «органичность». Одинаковый отклик всех слоёв читается как картинка.",
    code: `const follow = useSpring(source, { stiffness: 210, damping: 18 });
// второй слой на follow, первый на source → «хвост»`,
    render: (k) => <TrailingDots key={k} />,
  },
  {
    t: "Расширение границы",
    d: "При фокусе кант расходится наружу импульсом.",
    tone: "#e46a5f",
    why: "Импульс края виден боковым зрением. Это заменяет линию фокуса, которая уязвима для low-contrast контента.",
    code: `animate={{ boxShadow: [
  "0 0 0 0 rgba(62,201,167,.55)",
  "0 0 0 12px rgba(62,201,167,0)",
]}}
transition={{ duration: .9, repeat: Infinity }}`,
    render: (k) => <RippleRing key={k} />,
  },
  {
    t: "Тоггл с инерцией",
    d: "Ручка перелетает и слегка отскакивает.",
    tone: "#3ec9a7",
    why: "Перелёт на 2–3 px в конце хода сообщает «щёлкнуло». Идеальная остановка ощущается цифровой, а не механической.",
    code: `<motion.span layout
  transition={{ type: "spring", stiffness: 520, damping: 22, mass: .6 }} />`,
    render: (k) => <InertiaToggle key={k} />,
  },
  {
    t: "Карточка с подъёмом",
    d: "Наведение поднимает карточку и меняет свет.",
    tone: "#f2c14e",
    why: "Сдвиг света важнее тени: он сообщает, что источник один. Разная причина появления тени читается как наложение.",
    code: `whileHover={{ y: -8, rotateX: 4, rotateY: -5 }}
style={{ transformPerspective: 800 }}`,
    render: (k) => <LiftCard key={k} />,
  },
  {
    t: "Пунктирный прогресс",
    d: "Индикатор ожидания идёт штрихами, а не заливкой.",
    tone: "#5b9cd6",
    why: "Неизвестная длительность требует бесконечного паттерна. Проценты врут, штрихи — нет.",
    code: `<motion.div
  animate={{ backgroundPositionX: ["0px", "24px"] }}
  transition={{ duration: .8, repeat: Infinity, ease: "linear" }} />`,
    render: (k) => <DashedProgress key={k} />,
  },
  {
    t: "Счётчик с пролётом",
    d: "Число перелетает цель и садится пружиной.",
    tone: "#9d8cf5",
    why: "Точная остановка на числе = скука. Перелёт 8% и возврат — зона, где валюта ощущается «зачисленной».",
    code: `animate(from, target * 1.08, { onUpdate: set, onComplete: () =>
  animate(current, target, { type: "spring", stiffness: 260, damping: 18 })
});`,
    render: (k) => <OvershootNumber key={k} />,
  },
  {
    t: "Пульс важного",
    d: "Единственный акцент на экране дышит гало.",
    tone: "#e46a5f",
    why: "Два пульсирующих элемента = ноль пульсирующих. Внимание не делится — оно выбирает.",
    code: `<motion.span
  animate={{ scale: [1, 1.06, 1], opacity: [.55, 1, .55] }}
  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />`,
    render: (k) => <PulseAccent key={k} />,
  },
  {
    t: "Задержанная подсказка",
    d: "Тултип появляется через 400 мс, а не мгновенно.",
    tone: "#3ec9a7",
    why: "Мгновенный тултип мешает работе. Задержка даёт сначала намерение, затем помощь.",
    code: `onPointerEnter={() => { timer = setTimeout(() => setOpen(true), 400); }}
onPointerLeave={() => clearTimeout(timer);`,
    render: (k) => <DelayedTip key={k} />,
  },
  {
    t: "Выпадение по маске",
    d: "Список раскрывается через clip-path, а не через высоту.",
    tone: "#f2c14e",
    why: "clip-path работает на композиторе и не пересчитывает layout. Для коротких списков это дешевле и красивее height-анимации.",
    code: `animate={{ clipPath: open
  ? "inset(0 0 0% 0)"
  : "inset(0 0 100% 0)" }}`,
    render: (k) => <MaskDropdown key={k} />,
  },
];

function MicroLab() {
  const [hot, setHot] = useState(0);
  const [seed, setSeed] = useState(0);
  const m = MICRO[hot];
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-1.5">
        <div className="rounded-2xl border border-teal/25 bg-teal/[0.06] p-4">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-teal">атомы движения</div>
          <p className="mt-2 text-[12px] font-bold leading-relaxed text-mist">
            Двенадцать приёмов, из которых складывается всё остальное. Каждый работает
            на transform/opacity, не трогает layout и укладывается в 500 мс.
          </p>
        </div>
        {MICRO.map((x, i) => (
          <button key={x.t} onClick={() => { feel("tap"); setHot(i); }}
            className="relative block w-full rounded-2xl px-3.5 py-2.5 text-left">
            {hot === i && <motion.span layoutId="micropill" transition={S.pop} className="absolute inset-0 rounded-2xl bg-white/[0.06]"
              style={{ boxShadow: `inset 0 0 0 1px ${x.tone}66` }} />}
            <span className="relative block text-[12px] font-extrabold" style={{ color: hot === i ? x.tone : "#cfe0f7" }}>{x.t}</span>
            <span className="relative block text-[10px] font-bold leading-snug text-mist">{x.d}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="grid min-h-[260px] place-items-center rounded-3xl border border-white/8 bg-[#0b1220] p-6"
          style={{ backgroundImage: `radial-gradient(60% 55% at 50% 40%, ${m.tone}14, transparent 70%)` }}>
          <AnimatePresence mode="wait">
            <motion.div key={`${hot}-${seed}`}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }} transition={{ duration: 0.28, ease: E.out }}
              className="grid w-full place-items-center">
              {m.render(seed)}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-[#111a2b]/70 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: m.tone + "1e", color: m.tone }}>
            <IcBolt size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-extrabold uppercase">{m.t}</div>
            <div className="text-[10.5px] font-bold text-mist">{m.d}</div>
          </div>
          <button onClick={() => { feel("sweep"); setSeed((v) => v + 1); }}
            className="rounded-full border border-white/12 px-3 py-1.5 text-[9.5px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
            проиграть
          </button>
        </div>

        <div className="rounded-2xl border border-white/8 bg-[#111a2b]/70 p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">почему это работает</div>
          <p className="mt-1.5 text-[12.5px] font-bold leading-relaxed text-mist">{m.why}</p>
        </div>
        <CopyBlock code={m.code} tone={m.tone} />
      </div>
    </div>
  );
}

/* ---------- атомы микровзаимодействий ---------- */
function MagnetBox() {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, S.soft), sy = useSpring(y, S.soft);
  return (
    <div className="grid h-[170px] w-full place-items-center"
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      <motion.button style={{ x: sx, y: sy, background: "#3ec9a7", color: "#06231c" }}
        whileTap={{ scale: 0.93 }}
        className="rounded-2xl px-7 py-3.5 text-[12px] font-extrabold uppercase tracking-widest">
        Магнит
      </motion.button>
    </div>
  );
}

function LiquidFill() {
  const [n, setN] = useState(0);
  return (
    <button key={n} onPointerDown={() => { setN((v) => v + 1); feel("confirm", 8); }}
      className="relative grid h-[62px] place-items-center overflow-hidden rounded-2xl px-8"
      style={{ background: "#1a2338", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)" }}>
      <span key={`s${n}`} className="absolute left-4 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full"
        style={{ background: "#f2c14e" }} />
      <motion.span key={`f${n}`} className="absolute left-4 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full"
        style={{ background: "#f2c14e" }} initial={{ scale: 0 }} animate={{ scale: 14, opacity: 0 }}
        transition={{ duration: 0.55, ease: E.out }} />
      <span className="relative text-[12px] font-extrabold uppercase tracking-widest">кликни</span>
    </button>
  );
}

function SquashBall() {
  return (
    <motion.div className="grid h-24 w-24 place-items-center rounded-3xl text-void"
      style={{ background: "linear-gradient(160deg,#b39dff,#7b5fe0)" }}
      animate={{ scale: [1, 1.22, 0.86, 1.05, 1] }}
      transition={{ duration: 1.1, repeat: Infinity, ease: E.back }}>
      <IcBolt size={30} />
    </motion.div>
  );
}

function TrailingDots() {
  return (
    <div className="flex items-center gap-3">
      {[0, 1, 2, 3].map((i) => (
        <motion.span key={i} className="h-9 w-9 rounded-full"
          style={{ background: "#5b9cd6", opacity: 1 - i * 0.2 }}
          animate={{ x: [0, 34, -22, 0], y: [0, -22, 16, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }} />
      ))}
    </div>
  );
}

function RippleRing() {
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <motion.span className="absolute inset-0 rounded-full border-2 border-teal"
        animate={{ scale: [1, 1.7], opacity: [0.9, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.span className="absolute inset-0 rounded-full border-2 border-teal"
        animate={{ scale: [1, 1.7], opacity: [0.9, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }} />
      <span className="relative grid h-12 w-12 place-items-center rounded-full bg-teal text-void"><IcTarget size={20} /></span>
    </div>
  );
}

function InertiaToggle() {
  const [on, setOn] = useState(false);
  return (
    <motion.button onClick={() => { setOn((v) => !v); feel("tap", 10); }}
      className="relative h-[52px] w-[104px] rounded-full"
      style={{ background: on ? "#3ec9a7" : "rgba(255,255,255,.1)", boxShadow: "inset 0 2px 5px rgba(0,0,0,.5)" }}>
      <motion.span layout transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.6 }}
        className="absolute top-1.5 h-[39px] w-[39px] rounded-full bg-white"
        style={{ left: on ? 54 : 7, boxShadow: "0 3px 10px rgba(0,0,0,.5)" }} />
    </motion.button>
  );
}

function LiftCard() {
  return (
    <motion.div whileHover={{ y: -10, rotateX: 5, rotateY: -6 }} whileTap={{ scale: 0.97 }}
      style={{
        transformPerspective: 800,
        background: "linear-gradient(165deg,#2b3c5e,#1a2338)",
        boxShadow: "0 18px 34px -18px rgba(0,0,0,.9)",
      }}
      className="grid h-[128px] w-[104px] place-items-center rounded-2xl">
      <span className="grid place-items-center gap-1.5 text-gold">
        <IcCrown size={26} />
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-mist">наведи</span>
      </span>
    </motion.div>
  );
}

function DashedProgress() {
  return (
    <div className="h-3 w-[240px] overflow-hidden rounded-full"
      style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,.16) 0 12px, transparent 12px 24px)", backgroundSize: "24px 100%" }}>
      <motion.div className="h-full rounded-full"
        style={{ background: "repeating-linear-gradient(90deg, #5b9cd6 0 12px, transparent 12px 24px)", backgroundSize: "24px 100%" }}
        animate={{ backgroundPositionX: ["0px", "24px"] }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
    </div>
  );
}

function OvershootNumber() {
  const [v, setV] = useState(1240);
  useEffect(() => {
    const iv = setInterval(() => setV((x) => (x === 1240 ? 1620 : 1240)), 1800);
    return () => clearInterval(iv);
  }, []);
  return <span className="mono text-[38px] font-extrabold text-purple">{v.toLocaleString("ru-RU")}</span>;
}

function PulseAccent() {
  return (
    <div className="relative grid h-24 w-24 place-items-center">
      <motion.span className="absolute inset-0 rounded-2xl"
        style={{ background: "#e46a5f" }} animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      <span className="relative text-[11px] font-extrabold uppercase tracking-widest text-void">важно</span>
    </div>
  );
}

function DelayedTip() {
  const [open, setOpen] = useState(false);
  const timer = useRef<any>(null);
  return (
    <div className="relative grid h-[120px] w-full place-items-center">
      <button className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.07] text-mist"
        onPointerEnter={() => { timer.current = setTimeout(() => setOpen(true), 400); }}
        onPointerLeave={() => { clearTimeout(timer.current); setOpen(false); }}>
        <IcEye size={20} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={S.pop}
            className="absolute top-4 rounded-xl bg-white px-3 py-1.5 text-[11px] font-extrabold text-void">
            Появляется через 400 мс
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MaskDropdown() {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-[260px]">
      <button onClick={() => { setOpen((v) => !v); feel("tap"); }}
        className="w-full rounded-xl bg-white/[0.07] px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-widest">
        {open ? "свернуть" : "развернуть"}
      </button>
      <motion.div animate={{ clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" }}
        transition={{ duration: 0.34, ease: E.out }} className="mt-2 space-y-1">
        {["Пункт списка", "Ещё пункт", "Третий пункт"].map((t) => (
          <div key={t} className="rounded-lg bg-white/[0.05] px-3 py-2 text-[11px] font-bold text-mist">{t}</div>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- 11. Звук и хаптика: партитура откликов ---------- */
type SoundRow = {
  t: string; d: string; tone: string;
  kind: Parameters<typeof feel>[0];
  haptic: number | number[];
  ms: string;
  wave: number[];
};

const SOUNDS: SoundRow[] = [
  { t: "Тап", d: "Мгновенный отклик интерфейса", tone: "#3ec9a7", kind: "tap", haptic: 6, ms: "50 мс", wave: [3, 6, 4, 2, 1] },
  { t: "Подтверждение", d: "Две ноты вверх: действие принято", tone: "#3ec9a7", kind: "confirm", haptic: [8, 18], ms: "170 мс", wave: [3, 5, 7, 8, 6] },
  { t: "Отказ", d: "Низкая частота: действие недоступно", tone: "#e46a5f", kind: "deny", haptic: 30, ms: "160 мс", wave: [8, 6, 4, 2, 1] },
  { t: "Награда", d: "Мажорная секвенция из четырёх нот", tone: "#f2c14e", kind: "reward", haptic: [12, 28, 12], ms: "230 мс", wave: [2, 4, 6, 8, 10] },
  { t: "Свист перехода", d: "Рост частоты под шторку", tone: "#5b9cd6", kind: "sweep", haptic: 14, ms: "280 мс", wave: [1, 3, 5, 7, 9] },
  { t: "Монета", d: "Две короткие квадратные ноты", tone: "#f2c14e", kind: "coin", haptic: 8, ms: "115 мс", wave: [6, 8, 5, 7, 4] },
];

function SoundLab() {
  useTuneVersion();
  const [last, setLast] = useState<string | null>(null);
  const soundOn = TUNE.sound;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="title-xl text-[22px] uppercase">Партитура откликов</div>
            <p className="mt-1.5 max-w-lg text-[12.5px] font-bold leading-relaxed text-mist">
              Шесть тембров, синтезируемых WebAudio без единого аудиофайла. Каждое значимое
              событие получает собственный голос и собственную вибрацию — это добавляет к весу
              движения около 30%.
            </p>
          </div>
          <StatusChipLocal on={soundOn} />
        </div>

        <div className="mt-5 space-y-2">
          {SOUNDS.map((row) => (
            <button key={row.t}
              onClick={() => { feel(row.kind, row.haptic); setLast(row.t); setTimeout(() => setLast(null), 900); }}
              className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left"
              style={{
                background: last === row.t ? row.tone + "16" : "rgba(255,255,255,.03)",
                boxShadow: `inset 0 0 0 1px ${last === row.t ? row.tone + "77" : "rgba(255,255,255,.06)"}`,
              }}>
              <motion.span animate={last === row.t ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.4 }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{ background: row.tone + "22", color: row.tone }}>
                <IcPlay size={16} />
              </motion.span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-extrabold">{row.t}</div>
                <div className="text-[10px] font-bold text-mist">{row.d}</div>
              </div>
              <WaveBars data={row.wave} tone={row.tone} active={last === row.t} />
              <div className="w-[70px] shrink-0 text-right">
                <div className="mono text-[10px] font-extrabold" style={{ color: row.tone }}>{row.ms}</div>
                <div className="mono text-[9px] font-bold text-mist">
                  вибро {Array.isArray(row.haptic) ? row.haptic.join("+") : row.haptic} мс
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-mist">правила хаптики</div>
          <div className="mt-3 space-y-2">
            {[
              { t: "Вибро на 1–2 кадра раньше пика", d: "Мозг склеивает тактильность с визуалом и считает это «туго»." },
              { t: "Разная длительность = разный вес", d: "6 мс для тапа, 30 мс для отказа. Одинаковые ноты стирают разницу событий." },
              { t: "Партитура, а не сигнал", d: "[12, 28, 12] читается как удар. Одна нота — как виброзвонок." },
              { t: "Молчание тоже инструмент", d: "Контентные события (листание, ввод текста) не вибрируют вовсе." },
            ].map((r) => (
              <div key={r.t} className="rounded-xl bg-white/[0.035] p-3">
                <div className="text-[11px] font-extrabold">{r.t}</div>
                <div className="mt-1 text-[10.5px] font-bold leading-relaxed text-mist">{r.d}</div>
              </div>
            ))}
          </div>
        </div>

        <CopyBlock code={`// WebAudio синтез, ноль файлов в бандле
export function sfx(kind) {
  if (!TUNE.sound) return;
  const c = ctx(), t = c.currentTime;
  const tone = (f0, f1, d, type, g0, delay = 0) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t + delay);
    o.frequency.exponentialRampToValueAtTime(f1, t + delay + d);
    g.gain.setValueAtTime(.0001, t + delay);
    g.gain.exponentialRampToValueAtTime(g0, t + delay + .008);
    g.gain.exponentialRampToValueAtTime(.0001, t + delay + d);
    o.connect(g).connect(c.destination);
    o.start(t + delay); o.stop(t + delay + d + .02);
  };
  if (kind === "reward") [0,.07,.14,.23].forEach((d,i) =>
    tone(520 + i*180, 900 + i*220, .14, "triangle", .03, d));
  if (kind === "deny") tone(200, 120, .16, "sawtooth", .028);
}`} tone="#f2c14e" />

        <div className="rounded-2xl border border-white/8 bg-[#111a2b]/70 p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">синхронизация</div>
          <div className="mt-2 space-y-1.5">
            {[
              { l: "звук", v: 0, tone: "#3ec9a7" },
              { l: "вибрация", v: 0, tone: "#f2c14e" },
              { l: "импакт", v: 2, tone: "#e46a5f" },
              { l: "частицы", v: 4, tone: "#9d8cf5" },
              { l: "текст ответа", v: 12, tone: "#8fa4c7" },
            ].map((t) => (
              <div key={t.l} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-[10px] font-bold text-mist">{t.l}</span>
                <div className="relative h-2 flex-1 rounded-full bg-white/[0.06]">
                  <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: t.tone }}
                    initial={{ width: 0 }} animate={{ width: `${18 + t.v * 4}%` }}
                    transition={{ delay: t.v * 0.06, ...S.soft }} />
                </div>
                <span className="mono w-10 shrink-0 text-right text-[9px] font-bold text-mist">+{t.v} мс</span>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] font-bold leading-relaxed text-mist">
            Звук и вибрация идут ровно в нуле, удар — через кадр, частицы — через два.
            Так порядок ощущается, но не воспринимается как задержка.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusChipLocal({ on }: { on: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest"
      style={{ background: on ? "#3ec9a71e" : "#e46a5f1e", color: on ? "#3ec9a7" : "#e46a5f", boxShadow: `inset 0 0 0 1px ${on ? "#3ec9a755" : "#e46a5f55"}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: on ? "#3ec9a7" : "#e46a5f" }} />
      {on ? "звук включён" : "звук выключен"}
    </span>
  );
}

function WaveBars({ data, tone, active }: { data: number[]; tone: string; active: boolean }) {
  return (
    <div className="flex h-8 shrink-0 items-end gap-[2px]">
      {data.map((v, i) => (
        <motion.span key={i} className="w-[3px] rounded-full"
          animate={{ height: active ? 4 + v * 2.4 : 3 + v * 1.2, background: active ? tone : "rgba(255,255,255,.16)" }}
          transition={{ delay: i * 0.03, ...S.snap }} />
      ))}
    </div>
  );
}
