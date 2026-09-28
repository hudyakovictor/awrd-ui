/* Shared gameplay engines */
export type Candle = { o: number; h: number; l: number; c: number; v: number; t: number };
export function seedRand(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };
}
export function genOHLC(n: number, start = 100, seed = 42, vol = 1.6): Candle[] {
  const rnd = seedRand(seed); const out: Candle[] = []; let p = start;
  const t0 = Date.now() - n * 60_000;
  for (let i = 0; i < n; i++) {
    const o = p; const drift = (rnd() - 0.48) * vol * 2; const c = o + drift;
    out.push({ o, h: Math.max(o, c) + rnd() * vol, l: Math.min(o, c) - rnd() * vol, c, v: 10 + rnd() * 90, t: t0 + i * 60_000 });
    p = c;
  }
  return out;
}
export function sma(data: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []; let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i]; if (i >= period) sum -= data[i - period];
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}
export function ema(data: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []; const k = 2 / (period + 1); let prev: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { out.push(null); continue; }
    if (prev === null) { let s = 0; for (let j = 0; j < period; j++) s += data[i - period + 1 + j]; prev = s / period; }
    else prev = data[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}
export function rsi(data: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = []; let avgG = 0, avgL = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { out.push(null); continue; }
    const ch = data[i] - data[i - 1]; const g = Math.max(0, ch), l = Math.max(0, -ch);
    if (i <= period) {
      avgG += g; avgL += l;
      if (i === period) { avgG /= period; avgL /= period; out.push(100 - 100 / (1 + avgG / (avgL || 1e-9))); }
      else out.push(null);
    } else {
      avgG = (avgG * (period - 1) + g) / period; avgL = (avgL * (period - 1) + l) / period;
      out.push(100 - 100 / (1 + avgG / (avgL || 1e-9)));
    }
  }
  return out;
}
export function macd(data: number[], fast = 12, slow = 26, signal = 9) {
  const eF = ema(data, fast); const eS = ema(data, slow);
  const line = data.map((_, i) => (eF[i] != null && eS[i] != null ? (eF[i]! - eS[i]!) : null));
  const compact = line.map(v => v ?? 0); const sigFull = ema(compact, signal);
  const hist = line.map((v, i) => (v != null && sigFull[i] != null ? v - sigFull[i]! : null));
  return { line, signal: sigFull, hist };
}
export function bollinger(data: number[], period = 20, mult = 2) {
  const mid = sma(data, period); const upper: (number | null)[] = []; const lower: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (mid[i] == null) { upper.push(null); lower.push(null); continue; }
    let s = 0; for (let j = 0; j < period; j++) s += (data[i - j] - mid[i]!) ** 2;
    const sd = Math.sqrt(s / period); upper.push(mid[i]! + mult * sd); lower.push(mid[i]! - mult * sd);
  }
  return { mid, upper, lower };
}
export function detectPatterns(candles: Candle[]) {
  const out: { i: number; name: string; bias: "bull" | "bear" }[] = [];
  for (let i = 2; i < candles.length; i++) {
    const a = candles[i - 2], b = candles[i - 1], c = candles[i];
    const body = Math.abs(c.c - c.o); const range = c.h - c.l || 1e-9;
    const lowerW = Math.min(c.o, c.c) - c.l; const upperW = c.h - Math.max(c.o, c.c);
    if (lowerW > body * 2 && upperW < body * 0.5 && c.c > c.o) out.push({ i, name: "Hammer", bias: "bull" });
    if (upperW > body * 2 && lowerW < body * 0.5 && c.c < c.o) out.push({ i, name: "Shooting Star", bias: "bear" });
    if (b.c < b.o && c.c > c.o && c.o <= b.c && c.c >= b.o) out.push({ i, name: "Bull Engulfing", bias: "bull" });
    if (b.c > b.o && c.c < c.o && c.o >= b.c && c.c <= b.o) out.push({ i, name: "Bear Engulfing", bias: "bear" });
    if (body / range < 0.1) out.push({ i, name: "Doji", bias: c.c >= a.c ? "bull" : "bear" });
    if (a.c > a.o && b.c > b.o && c.c > c.o && b.c > a.c && c.c > b.c) out.push({ i, name: "Three Soldiers", bias: "bull" });
  }
  return out;
}
export type Achievement = { id: string; name: string; desc: string; icon: string; rarity: "common" | "rare" | "epic" | "legendary"; xp: number };
export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_trade", name: "First Blood", desc: "Open first paper trade", icon: "⚔️", rarity: "common", xp: 20 },
  { id: "first_win", name: "Green Day", desc: "Close trade in profit", icon: "🟢", rarity: "common", xp: 30 },
  { id: "streak_7", name: "Week Warrior", desc: "7-day streak", icon: "🔥", rarity: "rare", xp: 80 },
  { id: "streak_30", name: "Iron Will", desc: "30-day streak", icon: "💎", rarity: "epic", xp: 200 },
  { id: "boss_1", name: "Dragon Slayer", desc: "Beat RSI Dragon", icon: "🐉", rarity: "rare", xp: 100 },
  { id: "boss_all", name: "Raid Legend", desc: "Clear boss rush", icon: "👑", rarity: "legendary", xp: 300 },
  { id: "quiz_perfect", name: "Perfect Mind", desc: "3★ on any quiz", icon: "🧠", rarity: "rare", xp: 90 },
  { id: "rhythm_20", name: "Beat Master", desc: "20 rhythm hits", icon: "🎵", rarity: "rare", xp: 70 },
  { id: "merge_crown", name: "Merger", desc: "Reach crown in merge", icon: "👑", rarity: "epic", xp: 120 },
  { id: "season_30", name: "Season Closer", desc: "Hit season tier 30", icon: "🏆", rarity: "legendary", xp: 250 },
  { id: "social_gift", name: "Generous", desc: "Send 10 gifts", icon: "🎁", rarity: "common", xp: 40 },
  { id: "defense_5", name: "Wall Builder", desc: "Survive 5 waves", icon: "🛡️", rarity: "epic", xp: 150 },
  { id: "liq_survive", name: "Unliquidatable", desc: "Survive 30s ×25+", icon: "💀", rarity: "epic", xp: 140 },
  { id: "pipeline", name: "Quant Intern", desc: "Build correct pipeline", icon: "🤖", rarity: "rare", xp: 80 },
  { id: "painter_90", name: "Candle Artist", desc: "Painter score 90+", icon: "🎨", rarity: "rare", xp: 85 },
];
export const LEAGUES = [
  { name: "Bronze", minXp: 0, color: "#cd7f32" }, { name: "Silver", minXp: 500, color: "#c0c8d8" },
  { name: "Gold", minXp: 1500, color: "#ffc531" }, { name: "Sapphire", minXp: 3000, color: "#5b8cff" },
  { name: "Ruby", minXp: 5000, color: "#ff5470" }, { name: "Emerald", minXp: 8000, color: "#2ede8a" },
  { name: "Amethyst", minXp: 12000, color: "#a78bff" }, { name: "Diamond", minXp: 18000, color: "#9ff5ff" },
];
export function leagueFor(xp: number) { let cur = LEAGUES[0]; for (const l of LEAGUES) if (xp >= l.minXp) cur = l; return cur; }
export function calcLiquidation(entry: number, lev: number, side: "long" | "short", mmr = 0.005) {
  return side === "long" ? entry * (1 - 1 / lev + mmr) : entry * (1 + 1 / lev - mmr);
}
export function calcPnL(entry: number, price: number, size: number, lev: number, side: "long" | "short") {
  return (side === "long" ? 1 : -1) * ((price - entry) / entry) * size * lev;
}

export type QuizBankItem = { id: string; cat: string; q: string; a: string[]; correct: number; explain: string; difficulty: 1 | 2 | 3 };
export const QUIZ_BANK: QuizBankItem[] = [
  { id: "c1", cat: "candles", q: "Молот на поддержке чаще означает…", a: ["Разворот вверх", "Продолжение падения", "Флэт", "Гэп"], correct: 0, explain: "Длинная нижняя тень = rejection.", difficulty: 1 },
  { id: "c2", cat: "candles", q: "Медвежье поглощение — это…", a: ["Красная перекрывает зелёную", "Зелёная перекрывает красную", "Доджи", "Пин-бар"], correct: 0, explain: "Сильный reverse.", difficulty: 1 },
  { id: "r1", cat: "risk", q: "Риск 1% на $5,000 =", a: ["$50", "$500", "$5", "$1000"], correct: 0, explain: "0.01 × 5000.", difficulty: 1 },
  { id: "r2", cat: "risk", q: "R:R 1:3 при winrate 40%…", a: ["Прибыльна в долгосрок", "Всегда убыточна", "Нужен 80%", "Не считается"], correct: 0, explain: "EV > 0.", difficulty: 2 },
  { id: "t1", cat: "trend", q: "HH + HL =", a: ["Восходящий тренд", "Нисходящий", "Флэт", "Гэп"], correct: 0, explain: "Higher highs + higher lows.", difficulty: 1 },
  { id: "p1", cat: "psychology", q: "FOMO чаще приводит к…", a: ["Входу на хаях", "Идеальному входу", "Меньшему риску", "Лучшему R:R"], correct: 0, explain: "Эмоция > план.", difficulty: 1 },
  { id: "p2", cat: "psychology", q: "После 3 стопов…", a: ["Пауза и разбор", "Удвоить лот", "Убрать стопы", "×100"], correct: 0, explain: "Защита психики.", difficulty: 1 },
  { id: "o1", cat: "orderflow", q: "Положительный funding…", a: ["Лонги платят шортам", "Шорты платят лонгам", "Бесплатно", "0 комиссия"], correct: 0, explain: "Перегрев лонгов.", difficulty: 2 },
];
export function pickQuiz(cat: string | "all", n: number, seed = Date.now()) {
  const rnd = seedRand(seed);
  const pool = cat === "all" ? [...QUIZ_BANK] : QUIZ_BANK.filter(q => q.cat === cat);
  return [...pool].sort(() => rnd() - 0.5).slice(0, Math.min(n, pool.length));
}

export function positionSize(balance: number, riskPct: number, entry: number, stop: number) {
  const risk = balance * (riskPct / 100);
  const perUnit = Math.abs(entry - stop) / entry;
  if (perUnit < 1e-9) return 0;
  return risk / perUnit;
}
