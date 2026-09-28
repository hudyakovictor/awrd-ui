export const ART_BASE = "https://raw.githubusercontent.com/hudyakovictor/styletesy/main/";

export type Rarity = "rare" | "epic" | "legend";

export interface Monster {
  id: string;
  name: string;
  sub: string;
  art: string;
  tint: string;      // primary tint for frames / glows
  tint2: string;
  rarity: Rarity;
  hp: number;
  atk: number;
  spd: number;
  desc: string;
  ability: string;
}

export const RARITY: Record<Rarity, { label: string; c1: string; c2: string }> = {
  rare:     { label: "Редкий",      c1: "#19f2c4", c2: "#07bcd8" },
  epic:     { label: "Эпический",   c1: "#a37bff", c2: "#6c3df0" },
  legend:   { label: "Легендарный", c1: "#ffe066", c2: "#ff9a1f" },
};

export const MONSTERS: Monster[] = [
  {
    id: "dopamine",
    name: "Допаминовый Бес",
    sub: "питается зелёными свечами",
    art: ART_BASE + "dopamine_imp.jpg",
    tint: "#42e98c", tint2: "#07bcd8",
    rarity: "rare",
    hp: 220, atk: 12, spd: 66,
    desc: "Шепчет «ещё одна сделка» после каждой победы. Чем дольше бой, тем сильнее становится.",
    ability: "Эйфория: +2 к атаке за каждую зелёную свечу",
  },
  {
    id: "wick",
    name: "Фитиль-Мимик",
    sub: "притворяется пробоем",
    art: ART_BASE + "wick_mimic.jpg",
    tint: "#4ba3ff", tint2: "#19f2c4",
    rarity: "rare",
    hp: 260, atk: 15, spd: 74,
    desc: "Рисует идеальный сетап, а потом выносит стопы всей толпы. Его длинные тени — ловушка.",
    ability: "Ложный пробой: уклоняется от первой атаки",
  },
  {
    id: "paper",
    name: "Полтергейст Бумажных Рук",
    sub: "продаёт на самом дне",
    art: ART_BASE + "paper_hands_poltergeist.jpg",
    tint: "#ffcb40", tint2: "#ff9a1f",
    rarity: "epic",
    hp: 320, atk: 18, spd: 40,
    desc: "Призрак нервных ладоней. Заставляет закрыть прибыльную позицию за секунду до взрыва.",
    ability: "Паник-сейл: снижает вашу атаку на 20%",
  },
  {
    id: "fomo",
    name: "Фомо-Дух",
    sub: "боится упустить всё",
    art: ART_BASE + "fomo_wraith.jpg",
    tint: "#ff4d8d", tint2: "#ff9a1f",
    rarity: "epic",
    hp: 380, atk: 22, spd: 81,
    desc: "Влетает в комнату криком «памп уже начался!». Заставляет покупать вершину каждый раз.",
    ability: "Правило толпы: ускоряется после каждого удара",
  },
  {
    id: "loss",
    name: "Дух Неприятия Потерь",
    sub: "не даёт закрыть минус",
    art: ART_BASE + "loss_aversion_wraith.jpg",
    tint: "#8b5cff", tint2: "#ff4d8d",
    rarity: "epic",
    hp: 430, atk: 20, spd: 35,
    desc: "Кандалы из слов «оно отрастёт обратно». Держит трейдера в убыточной сделке до ликвидации.",
    ability: "Усреднение: восстанавливает 10 HP за ход",
  },
  {
    id: "chimera",
    name: "Химера Волатильности",
    sub: "БОСС АРЕНЫ · сезон I",
    art: ART_BASE + "volatility_chimera.jpg",
    tint: "#ffe066", tint2: "#ff4d8d",
    rarity: "legend",
    hp: 900, atk: 34, spd: 58,
    desc: "Трёхголовое чудовище: день новостей, ночной гэп и внезапный пин-бар. Пожирает ликвидность.",
    ability: "Чёрный лебедь: каждый 5-й удар критический",
  },
];

export type NodeState = "done" | "current" | "locked";
export type NodeType = "battle" | "chest" | "elite" | "boss";

export interface LevelNode {
  id: number;
  x: number;   // % of container width
  y: number;   // px from top
  type: NodeType;
  enemyId?: string;
  stars: number; // earned
}

export const LEVELS: LevelNode[] = [
  { id: 1,  x: 50, y: 1060, type: "battle", enemyId: "dopamine", stars: 3 },
  { id: 2,  x: 31, y: 985,  type: "battle", enemyId: "dopamine", stars: 3 },
  { id: 3,  x: 21, y: 900,  type: "chest",  stars: 3 },
  { id: 4,  x: 33, y: 816,  type: "battle", enemyId: "wick", stars: 2 },
  { id: 5,  x: 54, y: 745,  type: "battle", enemyId: "fomo", stars: 0 },
  { id: 6,  x: 74, y: 666,  type: "battle", enemyId: "paper", stars: -1 },
  { id: 7,  x: 80, y: 578,  type: "chest",  stars: -1 },
  { id: 8,  x: 62, y: 500,  type: "elite",  enemyId: "paper", stars: -1 },
  { id: 9,  x: 42, y: 424,  type: "battle", enemyId: "loss", stars: -1 },
  { id: 10, x: 23, y: 340,  type: "battle", enemyId: "wick", stars: -1 },
  { id: 11, x: 30, y: 252,  type: "chest",  stars: -1 },
  { id: 12, x: 50, y: 165,  type: "boss",   enemyId: "chimera", stars: -1 },
];

export const nodeState = (l: LevelNode): NodeState =>
  l.stars >= 0 ? (l.stars === 0 && l.type !== "chest" ? "current" : "done") : "locked";

export interface ShopItem {
  id: string;
  title: string;
  amount: string;
  price: string;
  kind: "coins" | "gems" | "bundle";
  accent: "teal" | "gold" | "grape" | "pink";
  tag?: string;
  add: { coins?: number; gems?: number };
}

export const SHOP: ShopItem[] = [
  { id: "g1", title: "Горсть кристаллов", amount: "80",   price: "99 ₽",  kind: "gems",  accent: "grape", add: { gems: 80 } },
  { id: "g2", title: "Плечо кристаллов",  amount: "500",  price: "449 ₽", kind: "gems",  accent: "grape", tag: "-15%", add: { gems: 500 } },
  { id: "c1", title: "Мешок монет",       amount: "5 000", price: "149 ₽", kind: "coins", accent: "gold", add: { coins: 5000 } },
  { id: "b1", title: "Стартовый пак",     amount: "×3",    price: "299 ₽", kind: "bundle", accent: "pink", tag: "ХИТ", add: { coins: 2500, gems: 120 } },
  { id: "b2", title: "Пак инсайдера",     amount: "×7",    price: "999 ₽", kind: "bundle", accent: "teal", tag: "-35%", add: { coins: 12000, gems: 600 } },
  { id: "g3", title: "Облако кристаллов", amount: "1 200", price: "899 ₽", kind: "gems",  accent: "grape", add: { gems: 1200 } },
];

export const DAILY: { day: number; label: string; kind: "coins" | "gems" | "energy"; value: string }[] = [
  { day: 1, label: "×500",  kind: "coins",  value: "500" },
  { day: 2, label: "×20",   kind: "energy", value: "20" },
  { day: 3, label: "×15",   kind: "gems",   value: "15" },
  { day: 4, label: "×900",  kind: "coins",  value: "900" },
  { day: 5, label: "×40",   kind: "energy", value: "40" },
  { day: 6, label: "×30",   kind: "gems",   value: "30" },
  { day: 7, label: "СУНДУК", kind: "gems",  value: "120" },
];
