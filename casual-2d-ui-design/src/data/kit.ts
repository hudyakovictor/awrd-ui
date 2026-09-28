import { ART } from "../art";

/* ════════════ RARITY ════════════ */
export type Rarity = "common" | "rare" | "epic" | "legend";
export const RARITY: Record<Rarity, { label: string; c1: string; c2: string; glow: string }> = {
  common: { label: "Обычный", c1: "#7fa6d9", c2: "#3c68b5", glow: "rgba(99,179,255,.4)" },
  rare: { label: "Редкий", c1: "#35f7d2", c2: "#0bb7d8", glow: "rgba(31,240,200,.5)" },
  epic: { label: "Эпический", c1: "#bb9bff", c2: "#7a3ef0", glow: "rgba(154,107,255,.5)" },
  legend: { label: "Легендарный", c1: "#ffe884", c2: "#ff9b1f", glow: "rgba(255,190,60,.55)" },
};

/* ════════════ MONSTERS = trading psychology ════════════ */
export interface Monster {
  id: string; name: string; sub: string; art: string;
  tint: string; rarity: Rarity; hp: number; atk: number; spd: number;
  desc: string; abilityName: string; ability: string; lesson: string;
}
export const MONSTERS: Monster[] = [
  {
    id: "dopamine", name: "Допаминовый Бес", sub: "питается зелёными свечами",
    art: ART.dopamine, tint: "#4ceb96", rarity: "rare", hp: 150, atk: 16, spd: 66,
    desc: "Шепчет «ещё одна сделка» после каждой победы. Чем дольше бой, тем сильнее становится.",
    abilityName: "Эйфория", ability: "+2 к атаке за каждый серию верных прогнозов",
    lesson: "реже торгуйте после выигрыша — дофамин имитирует опыт",
  },
  {
    id: "wick", name: "Фитиль-Мимик", sub: "притворяется пробоем",
    art: ART.wick, tint: "#11c3e8", rarity: "rare", hp: 170, atk: 19, spd: 74,
    desc: "Рисует идеальный сетап, а затем выносит стопы всей толпы. Его длинные тени — ловушка.",
    abilityName: "Ложный пробой", ability: "Уклоняется от первого удара в бою",
    lesson: "волатильность на фитиле ≠ пробой: дождитесь закрытия тела",
  },
  {
    id: "paper", name: "Полтергейст Бумажных Рук", sub: "продаёт на самом дне",
    art: ART.paper, tint: "#ffd14a", rarity: "epic", hp: 210, atk: 23, spd: 40,
    desc: "Призрак нервных ладоней. Заставляет закрыть прибыльную позицию за секунду до взрыва цены.",
    abilityName: "Паник-сейл", ability: "Cнижает вашу атаку после его удара",
    lesson: "позиция без плана закрывается паникой",
  },
  {
    id: "fomo", name: "Фомо-Дух", sub: "боится упустить всё",
    art: ART.fomo, tint: "#ff4d8d", rarity: "epic", hp: 240, atk: 27, spd: 81,
    desc: "Влетает с криком «памп уже начался!». Заставляет покупать вершину — снова и снова.",
    abilityName: "Правило толпы", ability: "Ускоряется после каждой вашей ошибки",
    lesson: "входящий из-за FOMO уже опоздал к тренду",
  },
  {
    id: "loss", name: "Дух Неприятия Потерь", sub: "не даёт закрыть минус",
    art: ART.loss, tint: "#9a6bff", rarity: "epic", hp: 270, atk: 25, spd: 35,
    desc: "Кандалы из слов «оно обязательно отрастёт». Держит трейдера в убытке до ликвидации.",
    abilityName: "Усреднение", ability: "Лечится после каждого вашего удара",
    lesson: "убыточная позиция + усреднение = дорога к ликвидации",
  },
  {
    id: "chimera", name: "Химера Волатильности", sub: "босс сезона I",
    art: ART.chimera, tint: "#ffd14a", rarity: "legend", hp: 560, atk: 42, spd: 58,
    desc: "Трёхголовое чудовище: день новостей, ночной гэп и внезапный пин-бар. Пожирает ликвидность.",
    abilityName: "Чёрный лебедь", ability: "Каждый 5-й его удар наносит тройной урон",
    lesson: "риск-менеджмент важнее точности: одна сделка не должна решать всё",
  },
];
export const M = (id: string) => MONSTERS.find((m) => m.id === id)!;

/* ════════════ PATTERNS = crypto education core ════════════ */
export type Dir = 1 | -1;
export interface Pattern {
  id: string; key: string; name: string; sub: string;
  dir: Dir;                    /** what usually follows the pattern */
  desc: string;                /** short hint shown in battle */
  insight: string;             /** academy lesson text */
}
export const PATTERNS: Pattern[] = [
  { id: "bullEng", key: "BE", name: "Бычье поглощение", sub: "разворот вверх", dir: 1,
    desc: "Зелёная свеча полностью накрыла красную — покупатели перехватили контроль.",
    insight: "Бычье поглощение после падения — первый сигнал смены тренда. Ждите закрытия тела свечи, а не её фитиля." },
  { id: "bearEng", key: "SR", name: "Медвежье поглощение", sub: "разворот вниз", dir: -1,
    desc: "Красная свеча съела всё тело предыдущей — продавцы сильнее.",
    insight: "Медвежье поглощение на локальном хае — сигнал к фиксации лонга. Тело красной свечи больше, чем у предыдущей тело — подтверждение." },
  { id: "hammer", key: "HM", name: "Молот", sub: "разворот вверх", dir: 1,
    desc: "Длинный фитиль вниз: цену выкупили с продаж. Маленькое тело наверху.",
    insight: "Молот показывает: продавцы толкнули цену вниз, но покупатели выкупили всё обратно. На уровне поддержки это «пол» рынка." },
  { id: "shoot", key: "SS", name: "Падающая звезда", sub: "разворот вниз", dir: -1,
    desc: "Длинный фитиль вверх после роста: быки не смогли удержать цену.",
    insight: "Длинный верхний фитиль после пампа — истощение покупателей. NB: подтверждение — следующая красная свеча." },
  { id: "dojiUp", key: "DJ", name: "Силовая доджи", sub: "продолжение вверх", dir: 1,
    desc: "Открытие почти = закрытию, но на повышенном объёме — нерешительность перед рывком.",
    insight: "Крошечное тело доджи после импульса — пауза, а не разворот, если объём растёт. Тренд обычно продолжается." },
  { id: "soldiers", key: "3W", name: "Три белых солдата", sub: "тренд вверх", dir: 1,
    desc: "Три зелёные свечи подряд, каждая выше предыдущей — устойчивый бычий импульс.",
    insight: "Три растущих тела подряд без длинных фитилей — это тренд, а не флэт. Входить поздно всё же рискованно: жди откат." },
  { id: "crows", key: "3B", name: "Три вороны", sub: "тренд вниз", dir: -1,
    desc: "Три сильные красные свечи подряд: медведи давят без передышки.",
    insight: "Тела красных свечей более 60% диапазона всей тройки — это системная продажа, не просто «откат». Лонг ловить поздно." },
];
export const P = (id: string) => PATTERNS.find((p) => p.id === id)!;

/* ════════════ MAP ════════════ */
export type NodeType = "battle" | "lesson" | "chest" | "elite" | "boss";
export interface LevelNode { id: number; x: number; y: number; type: NodeType; enemy?: string; pattern?: string; stars: number }
export const MAP_W = 330;
export const MAP_H = 1280;
export const LEVELS: LevelNode[] = [
  { id: 1,  x: 165, y: 1190, type: "battle", enemy: "dopamine", pattern: "hammer", stars: 3 },
  { id: 2,  x: 96,  y: 1100, type: "lesson", pattern: "hammer", stars: 3 },
  { id: 3,  x: 66,  y: 998,  type: "battle", enemy: "dopamine", pattern: "bullEng", stars: 3 },
  { id: 4,  x: 112, y: 900,  type: "battle", enemy: "wick", pattern: "bearEng", stars: 2 },
  { id: 5,  x: 202, y: 828,  type: "battle", enemy: "fomo", pattern: "bullEng", stars: 0 },
  { id: 6,  x: 266, y: 740,  type: "chest", stars: -1 },
  { id: 7,  x: 262, y: 640,  type: "battle", enemy: "paper", pattern: "shoot", stars: -1 },
  { id: 8,  x: 188, y: 560,  type: "elite", enemy: "paper", pattern: "dojiUp", stars: -1 },
  { id: 9,  x: 104, y: 478,  type: "lesson", pattern: "dojiUp", stars: -1 },
  { id: 10, x: 62,  y: 388,  type: "battle", enemy: "loss", pattern: "soldiers", stars: -1 },
  { id: 11, x: 102, y: 292,  type: "chest", stars: -1 },
  { id: 12, x: 168, y: 168,  type: "boss", enemy: "chimera", pattern: "crows", stars: -1 },
];

/* ════════════ SHOP / DAILY ════════════ */
export interface ShopItem {
  id: string; title: string; amount: string; price: string; old?: string;
  kind: "coins" | "gems" | "energy" | "bundle";
  accent: "teal" | "gold" | "grape" | "pink" | "mint";
  tag?: string; add: { coins?: number; gems?: number };
}
export const SHOP: ShopItem[] = [
  { id: "g1", title: "Горсть кристаллов", amount: "80", price: "99 ₽", kind: "gems", accent: "grape", add: { gems: 80 } },
  { id: "c1", title: "Мешок монет", amount: "5 000", price: "149 ₽", kind: "coins", accent: "gold", add: { coins: 5000 } },
  { id: "g2", title: "Плечо кристаллов", amount: "500", price: "449 ₽", old: "529 ₽", kind: "gems", accent: "grape", tag: "-15%", add: { gems: 500 } },
  { id: "e1", title: "Заряд энергии", amount: "×60", price: "199 ₽", kind: "energy", accent: "teal", add: {} },
  { id: "b1", title: "Стартовый пак", amount: "3 предмета", price: "299 ₽", old: "690 ₽", kind: "bundle", accent: "pink", tag: "ХИТ", add: { coins: 2500, gems: 120 } },
  { id: "b2", title: "Пак инсайдера", amount: "7 предметов", price: "999 ₽", old: "1 540 ₽", kind: "bundle", accent: "mint", tag: "-35%", add: { coins: 12000, gems: 600 } },
];
export const DAILY = [
  { day: 1, label: "500", kind: "coins" as const },
  { day: 2, label: "20", kind: "energy" as const },
  { day: 3, label: "15", kind: "gems" as const },
  { day: 4, label: "900", kind: "coins" as const },
  { day: 5, label: "40", kind: "energy" as const },
  { day: 6, label: "30", kind: "gems" as const },
  { day: 7, label: "СУНДУК", kind: "chest" as const },
];

/* ════════════ STYLE GUIDE ════════════ */
export const PALETTE: { group: string; items: { name: string; hex: string; use: string }[] }[] = [
  { group: "Основа", items: [
    { name: "Ink", hex: "#04081A", use: "глубокий фон" },
    { name: "Deep Navy", hex: "#0A1735", use: "фон экрана" },
    { name: "Card", hex: "#16305F", use: "панели, карточки" },
    { name: "Line", hex: "#2F5CB0", use: "обводки, сетка" },
  ]},
  { group: "Сигнальные", items: [
    { name: "Signal Teal", hex: "#1FF0C8", use: "CTA, верные ответы" },
    { name: "Aqua", hex: "#11C3E8", use: "градиент CTA, hints" },
    { name: "Coin Gold", hex: "#FFD14A", use: "награды, криты" },
    { name: "Amber", hex: "#FF9B1F", use: "градиент золота" },
  ]},
  { group: "Акцентные", items: [
    { name: "Panic Pink", hex: "#FF4D8D", use: "враги, скидки" },
    { name: "Gem Grape", hex: "#9A6BFF", use: "кристаллы, эпик" },
    { name: "HP Coral", hex: "#FF5C6E", use: "HP, ошибки" },
    { name: "Mint", hex: "#4CEB96", use: "профит, лонг" },
  ]},
];
export const PRINCIPLES = [
  { t: "Игра = обучение", d: "Каждый бой проверяет знание реальных паттернов: побеждает не ловкость, а понимание рынка." },
  { t: "Тактильность", d: "Любая кнопка вдавливается, карты наклоняются за пальцем, counter числа «дотикают» до цели." },
  { t: "Объём", d: "Внутренний блик сверху, губа снизу, свечение под неоном. Ни одной плоской заливки с рамкой." },
  { t: "Цвет = смысл", d: "Бирюза — действие, золото — награда, розовый — опасность, зелёный — верный ответ." },
  { t: "Juice всегда", d: "Каждое действие: тряска камеры, вспышка, частицы и всплывающее число. Наказать или похвалить — громко." },
  { t: "Риск-менедж", d: "Механика поощряет стоп-лосс, а не удачу: длинная верная серия даёт награды, ошибка — урон." },
];
