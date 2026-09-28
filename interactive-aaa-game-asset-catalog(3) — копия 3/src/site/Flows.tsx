import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ALL } from "../data/catalog";
import { S, E, feel, useInView, useTuneVersion } from "../lib/motion";
import { MiniScreen, Ribbon } from "../ui/art";
import { IcArrow, IcPlay, IcClock, IcCheck, IcWarn, IcLayers, IcGauge, IcCoinMark, IcCap, IcSwords } from "../ui/icons";

/* =====================================================================
   КАРТА ПОТОКОВ — главный ответ на вопрос «как это собирается в игру».
   Каждый поток: последовательность экранов, тайминги, переходы, риски.
   ===================================================================== */

type Step = { asset: string; note: string; trans: string; ms: number };
type Flow = {
  id: string; t: string; goal: string; tone: string; Icon: any;
  freq: string; risk: string; steps: Step[]; rules: string[];
};

export const FLOWS: Flow[] = [
  {
    id: "first",
    t: "Первый запуск",
    goal: "Довести нового игрока до первой победы за 90 секунд",
    tone: "#3ec9a7",
    Icon: IcPlay,
    freq: "1 раз на игрока",
    risk: "Самый дорогой экран в продукте: здесь теряется до 60% аудитории",
    steps: [
      { asset: "onb", note: "Три обещания, не больше", trans: "swipe + перекраска фона", ms: 9000 },
      { asset: "hub", note: "Сразу виден главный режим", trans: "iris из кнопки", ms: 4000 },
      { asset: "round", note: "Первый бой без ставки", trans: "zoom-punch", ms: 40000 },
      { asset: "result", note: "Победа подстроена", trans: "печать + каскад", ms: 6000 },
      { asset: "levelup", note: "Первый уровень сразу", trans: "вспышка", ms: 5000 },
    ],
    rules: [
      "Онбординг обязан прерываться тапом: игрок, который хочет играть, не должен ждать",
      "Первый бой короче обычного на 30% — темп важнее полноты правил",
      "Награда за первый бой всегда визуально крупнее последующих",
    ],
  },
  {
    id: "daily",
    t: "Ежедневный заход",
    goal: "Вернуть игрока и закрыть дневную петлю за 4 минуты",
    tone: "#f2c14e",
    Icon: IcClock,
    freq: "1–3 раза в день",
    risk: "Повторяемость: любая длинная анимация здесь через неделю бесит",
    steps: [
      { asset: "daily", note: "Серия и сундук недели", trans: "поп-ин ячейки", ms: 6000 },
      { asset: "hub", note: "Миссия дня на виду", trans: "каскад блоков", ms: 4000 },
      { asset: "puzzle", note: "Головоломка на 60 секунд", trans: "layoutId карточек", ms: 60000 },
      { asset: "round", note: "Два боя подряд", trans: "shared hero", ms: 90000 },
      { asset: "inbox", note: "Подарки и вызовы", trans: "свайп-лист", ms: 8000 },
    ],
    rules: [
      "Всё, что игрок видит каждый день, должно укладываться в 400 мс на экран",
      "Награда за серию растёт визуально, а не только в числах",
      "Повторяемые экраны используют профиль Snappy, а не Juicy",
    ],
  },
  {
    id: "monetize",
    t: "Путь к покупке",
    goal: "Провести к оплате без давления и с сохранением доверия",
    tone: "#9d8cf5",
    Icon: IcCoinMark,
    freq: "2–4 касания за сессию",
    risk: "Агрессивный моушен здесь читается как скам и убивает LTV",
    steps: [
      { asset: "bp", note: "Игрок видит, что теряет", trans: "заливка трека", ms: 12000 },
      { asset: "shop", note: "Витрина без мигания", trans: "полки + ценники", ms: 15000 },
      { asset: "pro", note: "Тарифы со счётчиком цены", trans: "подъём выбранного", ms: 20000 },
      { asset: "pack", note: "Кинематик открытия", trans: "anticipation → взрыв", ms: 14000 },
      { asset: "vault", note: "Косметика после валюты", trans: "3D-карусель", ms: 10000 },
    ],
    rules: [
      "Цена никогда не анимируется мигающим цветом — только пересчётом",
      "Максимум один пульсирующий CTA на экран, амплитуда ≤ 1.5%",
      "Открытие пака — единственное место, где допустимы 70 частиц",
    ],
  },
  {
    id: "mastery",
    t: "Рост мастерства",
    goal: "Превратить поражение в обучение и вернуть в бой",
    tone: "#5b9cd6",
    Icon: IcCap,
    freq: "после каждого проигрыша",
    risk: "Если разбор ощущается наказанием — игрок уходит после 2–3 поражений",
    steps: [
      { asset: "replay", note: "Пошаговый разбор боя", trans: "таймлайн + blur", ms: 25000 },
      { asset: "journal", note: "Система нашла повтор", trans: "аккордеон layout", ms: 15000 },
      { asset: "lesson", note: "Урок по конкретной ошибке", trans: "печать графика", ms: 120000 },
      { asset: "skilltree", note: "Очко в нужную ветку", trans: "заливка ветки", ms: 12000 },
      { asset: "bestiary", note: "Ловушка занесена в справочник", trans: "морф силуэта", ms: 10000 },
    ],
    rules: [
      "В разборе жёлтый для «недобрал», красный только для грубой ошибки",
      "Из любой ошибки должен быть выход в практику за один тап",
      "Награда за изучение ловушки визуально равна награде за победу",
    ],
  },
  {
    id: "season",
    t: "Сезонный пик",
    goal: "Создать событие, ради которого возвращаются через месяц",
    tone: "#e46a5f",
    Icon: IcSwords,
    freq: "1 раз в сезон",
    risk: "Пик без кульминации обесценивает весь сезон задним числом",
    steps: [
      { asset: "event", note: "Live-ивент с волнами", trans: "импакт по тикам", ms: 180000 },
      { asset: "bracket", note: "Турнирная сетка", trans: "заливка проводов", ms: 30000 },
      { asset: "league", note: "Финальная таблица", trans: "layout-перестановка", ms: 15000 },
      { asset: "finale", note: "Смена лиги", trans: "вспышка + поворот герба", ms: 12000 },
      { asset: "profile", note: "Новый герб в профиле", trans: "радар + медали", ms: 10000 },
    ],
    rules: [
      "Кульминация сезона — единственное место, где длительность > 3 секунд оправдана",
      "Смена ранга обязана быть видна и в профиле, и в шапке боя",
      "После пика сразу давай следующую цель, иначе отток на следующий день",
    ],
  },
  {
    id: "collection",
    t: "Прокачка коллекции",
    goal: "Дать игроку понятный путь от получения карты до её применения",
    tone: "#f2c14e",
    Icon: IcLayers,
    freq: "2–3 цикла за сессию",
    risk: "Гача без честных шансов и пити-системы убивает доверие за один вечер",
    steps: [
      { asset: "draw", note: "Шансы видны до открытия", trans: "взрыв сундука", ms: 12000 },
      { asset: "deck", note: "Карта едет в колоду", trans: "layoutId перестановки", ms: 20000 },
      { asset: "upgrade", note: "Ковка с риском", trans: "дрожание и импакт", ms: 25000 },
      { asset: "skillpick", note: "Выбор навыка на уровень", trans: "переворот карт", ms: 15000 },
      { asset: "profile", note: "Рост навыков виден", trans: "радар", ms: 10000 },
    ],
    rules: [
      "Сила отклика пропорциональна редкости предмета — иначе редкость ничего не значит",
      "Pity-прогресс показывается всегда, а не только при близком гаранте",
      "Проигрыш в ковке повышает шанс следующей попытки и честно об этом сообщает",
    ],
  },
  {
    id: "squadnight",
    t: "Отрядовый вечер",
    goal: "Сделать совместную игру ритуалом, а не разовой забавой",
    tone: "#5b9cd6",
    Icon: IcSwords,
    freq: "1–2 раза в неделю",
    risk: "Ожидание сбора без обратной связи убивает отряд быстрее, чем сложность",
    steps: [
      { asset: "lobby", note: "Готовность каждого видна", trans: "свечение слотов", ms: 45000 },
      { asset: "round", note: "Совместный бой", trans: "shared hero", ms: 120000 },
      { asset: "history", note: "Разбор каждого боя", trans: "аккордеон", ms: 18000 },
      { asset: "streak", note: "Серия отряда растёт", trans: "кольцо и вехи", ms: 14000 },
      { asset: "clan", note: "Вклад в цель недели", trans: "заливка строки", ms: 12000 },
    ],
    rules: [
      "Обратный отсчёт старта рифмуется со звуком и вибро: ритм должен быть слышен",
      "Пустой слот комнаты оформлен как приглашение, а не как пустота",
      "Серия отряда — главный держатель: показывай множитель крупнее счёта побед",
    ],
  },
];

export function FlowsPage() {
  const [active, setActive] = useState(0);
  const f = FLOWS[active];
  const total = f.steps.reduce((s, x) => s + x.ms, 0);

  return (
    <div className="relative min-h-screen pb-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh]"
        style={{ background: `radial-gradient(55% 45% at 50% 0%, ${f.tone}22, transparent)` }} />
      <div className="mesh absolute inset-x-0 top-0 h-[50vh] opacity-60" />

      <div className="relative mx-auto max-w-6xl px-5 pt-24">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.45em]" style={{ color: f.tone }}>Сценарии</div>
        <h1 className="title-xl mt-3 text-[13vw] uppercase leading-[0.88] sm:text-7xl">Карта потоков</h1>
        <p className="mt-4 max-w-2xl text-[14px] font-bold leading-relaxed text-mist">
          Отдельный экран — деталь. Ценность появляется, когда экраны выстроены в путь.
          Пять сценариев, из которых состоит вся игра: что за чем идёт, каким переходом склеено,
          сколько длится и где обычно ломается.
        </p>

        {/* выбор потока */}
        <div className="no-bar mt-9 flex gap-2 overflow-x-auto pb-1">
          {FLOWS.map((x, i) => (
            <button key={x.id} onClick={() => { feel("tap"); setActive(i); }}
              className="relative flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-left">
              {active === i && <motion.span layoutId="flowpill" transition={S.pop} className="absolute inset-0 rounded-2xl"
                style={{ background: x.tone + "1e", boxShadow: `inset 0 0 0 1.5px ${x.tone}88` }} />}
              {active !== i && <span className="absolute inset-0 rounded-2xl border border-white/8 bg-white/[0.02]" />}
              <span className="relative" style={{ color: active === i ? x.tone : "#8fa4c7" }}><x.Icon size={17} /></span>
              <span className="relative">
                <span className="block text-[12px] font-extrabold" style={{ color: active === i ? "#fff" : "#cfe0f7" }}>{x.t}</span>
                <span className="mono block text-[9px] font-bold text-mist">{x.steps.length} экранов · {Math.round(total / 1000)}с</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={f.id} initial={{ opacity: 0, y: 26, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -18, filter: "blur(8px)" }} transition={{ duration: 0.35, ease: E.out }}
          className="relative mx-auto mt-10 max-w-6xl px-5">

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="title-xl text-[24px] uppercase">{f.t}</div>
                  <p className="mt-1.5 max-w-lg text-[13px] font-bold text-mist">{f.goal}</p>
                </div>
                <div className="flex gap-2">
                  <Meta l="частота" v={f.freq} tone={f.tone} />
                  <Meta l="длина" v={`${Math.round(total / 1000)} с`} tone={f.tone} />
                </div>
              </div>

              <FlowRail flow={f} />

              <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-coral/25 bg-coral/[0.06] p-3.5">
                <span className="mt-0.5 text-coral"><IcWarn size={15} /></span>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-coral">главный риск</div>
                  <div className="mt-1 text-[12.5px] font-bold text-white/85">{f.risk}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest" style={{ color: f.tone }}>
                  <IcCheck size={14} /> правила потока
                </div>
                <div className="mt-3 space-y-2">
                  {f.rules.map((r, i) => (
                    <motion.div key={r} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 + i * 0.07, ...S.soft }}
                      className="flex gap-2.5 rounded-xl bg-white/[0.035] p-3">
                      <span className="mono text-[11px] font-extrabold" style={{ color: f.tone }}>{i + 1}</span>
                      <span className="text-[12px] font-bold leading-relaxed text-mist">{r}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <TimeBudget flow={f} />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Meta({ l, v, tone }: { l: string; v: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-right">
      <div className="mono text-[11px] font-extrabold" style={{ color: tone }}>{v}</div>
      <div className="text-[8px] font-extrabold uppercase tracking-widest text-mist">{l}</div>
    </div>
  );
}

/* ---------- Рельс потока: экраны + переходы между ними ---------- */
function FlowRail({ flow }: { flow: Flow }) {
  const [hot, setHot] = useState(-1);
  const [play, setPlay] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!play) return;
    const iv = setInterval(() => setHot((h) => (h + 1) % flow.steps.length), 1400);
    return () => clearInterval(iv);
  }, [play, flow.id]);

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-mist">последовательность</span>
        <button onClick={() => { feel("tap"); setPlay((p) => !p); }}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
          {play ? "пауза" : "играть"} <IcPlay size={10} />
        </button>
      </div>

      <div ref={ref} className="no-bar flex items-stretch gap-1 overflow-x-auto pb-2">
        {flow.steps.map((s, i) => {
          const a = ALL.find((x) => x.id === s.asset);
          const on = hot === i;
          return (
            <div key={s.asset} className="flex shrink-0 items-center">
              <motion.button
                onMouseEnter={() => { setHot(i); setPlay(false); }}
                onClick={() => { feel("confirm"); location.hash = `/${a?.cat.id}/${s.asset}`; }}
                animate={{ y: on ? -6 : 0, scale: on ? 1.03 : 1 }}
                transition={S.pop}
                className="relative w-[128px] rounded-2xl p-3 text-left"
                style={{
                  background: on ? `linear-gradient(170deg, ${flow.tone}1f, #16213a)` : "rgba(255,255,255,.025)",
                  boxShadow: `inset 0 0 0 1px ${on ? flow.tone + "88" : "rgba(255,255,255,.07)"}`,
                }}
              >
                <div className="mono text-[9px] font-extrabold" style={{ color: flow.tone }}>{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-1.5 grid place-items-center">
                  <MiniScreen tone={on ? flow.tone : "#6f83a6"} kind={i % 4} w={40} />
                </div>
                <div className="mt-2 text-[10.5px] font-extrabold leading-tight">{a?.title ?? s.asset}</div>
                <div className="mt-0.5 text-[9px] font-bold leading-snug text-mist">{s.note}</div>
                <div className="mono mt-1.5 text-[9px] font-bold" style={{ color: flow.tone }}>{Math.round(s.ms / 1000)}с</div>
              </motion.button>

              {i < flow.steps.length - 1 && (
                <div className="flex w-[74px] shrink-0 flex-col items-center gap-1 px-1">
                  <motion.span animate={{ x: hot === i ? [0, 4, 0] : 0, color: hot === i ? flow.tone : "#46587a" }}
                    transition={{ duration: 1, repeat: hot === i ? Infinity : 0 }}>
                    <IcArrow size={16} />
                  </motion.span>
                  <span className="text-center text-[8px] font-bold leading-tight text-mist">{flow.steps[i + 1].trans}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Бюджет времени потока ---------- */
function TimeBudget({ flow }: { flow: Flow }) {
  const total = flow.steps.reduce((s, x) => s + x.ms, 0);
  return (
    <div className="rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5">
      <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-mist">
        <IcGauge size={14} /> бюджет времени
      </div>
      <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-white/[0.05]">
        {flow.steps.map((s, i) => (
          <motion.div key={s.asset} initial={{ width: 0 }} animate={{ width: `${(s.ms / total) * 100}%` }}
            transition={{ ...S.soft, delay: i * 0.08 }}
            style={{ background: flow.tone, opacity: 0.35 + i * 0.14, borderRight: "1px solid #111a2b" }} />
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {flow.steps.map((s, i) => {
          const a = ALL.find((x) => x.id === s.asset);
          const pct = Math.round((s.ms / total) * 100);
          return (
            <div key={s.asset} className="flex items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: flow.tone, opacity: 0.35 + i * 0.14 }} />
              <span className="flex-1 truncate text-[11px] font-bold text-mist">{a?.title ?? s.asset}</span>
              <span className="mono text-[10.5px] font-extrabold" style={{ color: flow.tone }}>{pct}%</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11.5px] font-bold leading-relaxed text-mist">
        Доля экрана в сессии определяет допустимую длину его анимаций: если экран занимает больше трети времени,
        он обязан работать в «щелчковом» профиле.
      </p>
    </div>
  );
}

/* ---------- Компактный превью-блок потоков для главной ---------- */
export function FlowsPreview({ go }: { go: (r: string) => void }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  useTuneVersion();
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FLOWS.map((f, i) => (
        <motion.button key={f.id} onClick={() => { feel("confirm"); go("flows"); }}
          initial={{ opacity: 0, y: 34 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: (i % 3) * 0.08, duration: 0.65, ease: E.out }}
          whileHover={{ y: -6 }}
          className="group relative overflow-hidden rounded-3xl border border-white/8 bg-[#111a2b]/70 p-5 text-left">
          <motion.span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
            style={{ background: f.tone + "2e" }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }} />
          <span className="relative grid h-11 w-11 place-items-center rounded-2xl" style={{ background: f.tone + "1e", color: f.tone }}>
            <f.Icon size={19} />
          </span>
          <div className="relative mt-3 text-[16px] font-extrabold uppercase">{f.t}</div>
          <p className="relative mt-1.5 text-[12px] font-bold leading-relaxed text-mist">{f.goal}</p>
          <div className="relative mt-4 flex items-center gap-1">
            {f.steps.map((s, k) => (
              <span key={s.asset} className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.tone, opacity: 0.4 + k * 0.12 }} />
                {k < f.steps.length - 1 && <span className="h-px w-3" style={{ background: f.tone, opacity: 0.25 }} />}
              </span>
            ))}
            <span className="mono ml-auto text-[9.5px] font-bold text-mist">{f.steps.length} экранов</span>
          </div>
        </motion.button>
      ))}
      <motion.button onClick={() => { feel("confirm"); go("flows"); }}
        initial={{ opacity: 0, y: 34 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3, duration: 0.65, ease: E.out }}
        whileHover={{ y: -6 }}
        className="relative grid place-items-center gap-3 overflow-hidden rounded-3xl border border-teal/30 bg-teal/[0.07] p-5">
        <Ribbon tone="#3ec9a7" w={190}>смотреть карту</Ribbon>
        <p className="text-center text-[12px] font-bold text-mist">
          Тайминги, переходы между экранами и бюджет времени каждого сценария
        </p>
        <span className="text-teal"><IcLayers size={22} /></span>
      </motion.button>
    </div>
  );
}
