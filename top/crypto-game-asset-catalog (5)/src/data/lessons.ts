/* Bank of content for the playable lesson "Japanese candles" (the demo mini-game) */

export type CandleKind = "hammer" | "star" | "hanging" | "doji";

export type ChoiceQ = {
  kind: "choice";
  prompt: string;
  options: { t: string; c?: CandleKind }[];
  answer: number;
  why: string;
  tip: string;
  xp: number;
};
export type BuildQ = {
  kind: "build";
  prompt: string;
  answer: string[];
  bank: string[];
  why: string;
  tip: string;
  xp: number;
};
export type MiniCandle = { d: 1 | -1; body: number; wT: number; wB: number };
export type ChartQ = {
  kind: "chart";
  prompt: string;
  options: { name: string; candles: MiniCandle[] }[];
  answer: number;
  why: string;
  tip: string;
  xp: number;
};
export type MatchQ = {
  kind: "match";
  prompt: string;
  pairs: [string, string][];
  why: string;
  tip: string;
  xp: number;
};
export type GameQ = ChoiceQ | BuildQ | ChartQ | MatchQ;

export const GAME_QUESTIONS: GameQ[] = [
  {
    kind: "choice",
    prompt: "Какая свеча — бычий сигнал разворота после падения?",
    options: [
      { t: "Hammer", c: "hammer" },
      { t: "Shooting Star", c: "star" },
      { t: "Hanging Man", c: "hanging" },
      { t: "Doji", c: "doji" },
    ],
    answer: 0,
    why: "Длинный нижний фитиль: покупатели выкупили всё падение внутри свечи.",
    tip: "Ищите длинный «хвост» снизу после медвежьего движения.",
    xp: 10,
  },
  {
    kind: "build",
    prompt: "Соберите правило: зачем нужен стоп-лосс?",
    answer: ["Стоп-лосс", "ограничивает", "максимальный", "убыток"],
    bank: ["Стоп-лосс", "ограничивает", "максимальный", "убыток", "прибыль", "объём"],
    why: "Стоп-лосс закрывает позицию заранее, пока убыток не превратился в катастрофу.",
    tip: "Один и тот же инструмент — у слова два смысла: убыток и прибыль.",
    xp: 15,
  },
  {
    kind: "chart",
    prompt: "Найдите бычье поглощение (bullish engulfing)",
    options: [
      { name: "A", candles: [{ d: -1, body: 6, wT: 3, wB: 3 }, { d: 1, body: 16, wT: 2, wB: 2 }] },
      { name: "B", candles: [{ d: 1, body: 2, wT: 12, wB: 12 }] },
      { name: "C", candles: [{ d: -1, body: 5, wT: 2, wB: 14 }] },
      { name: "D", candles: [{ d: 1, body: 5, wT: 14, wB: 2 }] },
    ],
    answer: 0,
    why: "Крупная бычья свеча «поглощает» тело предыдущей медвежьей — продавцы сломлены.",
    tip: "Сравнивайте ТЕЛА свечей, а не фитили.",
    xp: 15,
  },
  {
    kind: "choice",
    prompt: "RSI выше 70 говорит, что актив…",
    options: [{ t: "Перепродан" }, { t: "Перекуплен" }, { t: "В боковике" }, { t: "Неликвиден" }],
    answer: 1,
    why: "RSI > 70 — зона перекупленности: движение, вероятно, перегретое.",
    tip: "RSI < 30 — зеркальная зона перепроданности.",
    xp: 10,
  },
  {
    kind: "match",
    prompt: "Соедините паттерн и его смысл",
    pairs: [
      ["Engulfing", "Смена тренда"],
      ["Doji", "Нерешительность"],
      ["Hammer", "Бычий сигнал"],
      ["Star", "Медвежий сигнал"],
    ],
    why: "Паттерны читаются от последней свечи: она отражает решение рынка за период.",
    tip: "Доджи — тень без тела: ни одна сторона не победила.",
    xp: 20,
  },
];

export const LESSON_META = {
  unit: "Unit 2 · Section 1",
  title: "Японские свечи",
  subtitle: "5 вопросов · ~2 минуты",
  reward: 70,
  xpPerQuestion: 10,
};

/* ===== Additional lesson banks ===== */
export type LessonDef = { key: string; title: string; subtitle: string; icon: string; questions: GameQ[] };

const RISK_QUESTIONS: GameQ[] = [
  {
    kind: "choice",
    prompt: "Что значит правило 1% для трейдера?",
    options: [
      { t: "Рисковать ≤1% депозита на сделку" },
      { t: "Вносить по 1% средств в день" },
      { t: "Ждать минуту перед каждой покупкой" },
      { t: "Покупать 1% рынка одним лотом" },
    ],
    answer: 0,
    why: "Даже серия из десяти убытков не ударит по депозиту критично.",
    tip: "Риск считайте первым — размер позиции следует из него.",
    xp: 10,
  },
  {
    kind: "build",
    prompt: "Соберите формулу размера позиции",
    answer: ["Размер", "позиции", "считается", "из", "стопа"],
    bank: ["Размер", "позиции", "считается", "из", "стопа", "интуиции", "тренда"],
    why: "Размер = сумма риска ÷ расстояние до стопа. Не наоборот — иначе искажается всё.",
    tip: "Слово «интуиции» не входит в формулу.",
    xp: 15,
  },
  {
    kind: "chart",
    prompt: "Найдите график с соотношением риск:прибыль 1:3",
    options: [
      { name: "A", candles: [{ d: -1, body: 3, wT: 2, wB: 2 }, { d: 1, body: 14, wT: 2, wB: 2 }] },
      { name: "B", candles: [{ d: 1, body: 12, wT: 2, wB: 2 }, { d: -1, body: 4, wT: 2, wB: 2 }] },
      { name: "C", candles: [{ d: 1, body: 4, wT: 2, wB: 2 }, { d: -1, body: 4, wT: 2, wB: 2 }] },
      { name: "D", candles: [{ d: -1, body: 8, wT: 2, wB: 2 }, { d: -1, body: 8, wT: 2, wB: 2 }] },
    ],
    answer: 0,
    why: "Короткий стоп и длинный путь к цели: рискуем единицей, зарабатываем три.",
    tip: "Сравнивайте «хвосты»: вниз — риск, вверх — прибыль.",
    xp: 15,
  },
  {
    kind: "choice",
    prompt: "Три убыточные сделки подряд. Реакция профи?",
    options: [
      { t: "Удвоить размер — отыграться" },
      { t: "Снизить размер и разобрать сделки" },
      { t: "Навсегда покинуть рынок" },
      { t: "Поднять плечо, чтобы быстрее" },
    ],
    answer: 1,
    why: "Месть рынку (revenge trading) — главный убийца депозитов.",
    tip: "Анализ вместо эмоций. Всегда.",
    xp: 10,
  },
  {
    kind: "match",
    prompt: "Соедините термин и определение",
    pairs: [
      ["Drawdown", "Падение депозита"],
      ["Risk:Reward", "Риск vs прибыль"],
      ["Slippage", "Смещение цены"],
      ["Margin", "Залог своими"],
    ],
    why: "Эти термины встречаются в каждом отчёте о рисках.",
    tip: "Margin — собственные средства, которые держат позицию.",
    xp: 20,
  },
];

const PREDICT_QUESTIONS: GameQ[] = [
  {
    kind: "choice",
    prompt: "Цена снова отскакивает от одного уровня снизу. Что это?",
    options: [{ t: "Сопротивление" }, { t: "Поддержка" }, { t: "Флэт" }, { t: "Гэп" }],
    answer: 1,
    why: "Уровень под ценой, который её «держит», — поддержка.",
    tip: "Именно там вы ищете входы в лонг.",
    xp: 10,
  },
  {
    kind: "build",
    prompt: "Соберите правило подтверждения пробоя",
    answer: ["Объём", "подтверждает", "пробой", "уровня"],
    bank: ["Объём", "подтверждает", "пробой", "уровня", "настроение", "выходные"],
    why: "Пробой без объёма чаще всего — ловушка (fakeout).",
    tip: "Без толпы нет пробоя: объём = толпа.",
    xp: 15,
  },
  {
    kind: "chart",
    prompt: "Найдите подтверждённый пробой уровня вниз",
    options: [
      { name: "A", candles: [{ d: 1, body: 6, wT: 2, wB: 2 }, { d: -1, body: 12, wT: 2, wB: 3 }] },
      { name: "B", candles: [{ d: -1, body: 4, wT: 9, wB: 2 }] },
      { name: "C", candles: [{ d: 1, body: 2, wT: 10, wB: 10 }] },
      { name: "D", candles: [{ d: 1, body: 8, wT: 2, wB: 2 }, { d: 1, body: 6, wT: 2, wB: 2 }] },
    ],
    answer: 0,
    why: "Тело свечи ниже уровня: продавцы не просто коснулись — закрылись ниже.",
    tip: "Отклонение фитилём (B) — это не пробой.",
    xp: 15,
  },
  {
    kind: "choice",
    prompt: "Цена стабильно выше MA(200). Тренд…",
    options: [{ t: "Восходящий" }, { t: "Нисходящий" }, { t: "Плоский" }, { t: "Разворотный" }],
    answer: 0,
    why: "Длинное скользящее — скелет тренда: выше него рынок бычий.",
    tip: "MA(200) — любимая линия всех институционалов.",
    xp: 10,
  },
  {
    kind: "match",
    prompt: "Соберите набор прогнозиста",
    pairs: [
      ["MACD", "Импульс движения"],
      ["Support", "Нижняя граница"],
      ["Breakout", "Пробой уровня"],
      ["Fakeout", "Ложный пробой"],
    ],
    why: "Полный рабочий набор теханализа: уровень + импульс + подтверждение.",
    tip: "Пробой без импульса — подозрительно.",
    xp: 20,
  },
];

export const LESSONS: LessonDef[] = [
  { key: "candles", title: LESSON_META.title, subtitle: LESSON_META.subtitle, icon: "candles", questions: GAME_QUESTIONS },
  { key: "risk", title: "Риск-менеджмент", subtitle: "5 вопросов · ~2 минуты", icon: "shield", questions: RISK_QUESTIONS },
  { key: "predict", title: "Прогноз рынка", subtitle: "5 вопросов · ~2 минуты", icon: "chart", questions: PREDICT_QUESTIONS },
];

/* Mascot voice lines */
export const VOICE = {
  idle: "Погнали? Я тут всё проверил.",
  ready: "Давай! Сердца не жалею.",
  correct: ["Bullish move!", "Рынок уважает.", "Ты читаешь свечей, как книга.", "Так держать!"],
  wrong: ["Стоп-лосс на эмоции!", "Не спеши. Вспомни про тени.", "Окей, бывает. Разберёмся."],
  streak: "Комбо горит!",
  lowHearts: "Осталось одно сердце…",
  win: "Это был чистый альфа!",
  fail: "Не расстраивайся: рынок тоже ошибается.",
};
