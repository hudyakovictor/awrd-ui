/* ------------------------------------------------------------------
 * 20 · GAMEPLAY HUB — award-winning mobile game core
 * 12 playable modes with shared gamekit, rewards, hearts, combos
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain, CandlestickChart, Crown, Flame, Gem, Heart, Rocket, Shield,
  Sparkles, Swords, Target, Trophy, Zap, RotateCcw, Play, Lock,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import {
  BossHp, ChipRow, ComboMeter, EnergyBar, fireSmall, fireWin, GameSection, HudChip,
  LearningPath, LoginCalendar, MagCTA, MultiBadge, OutOfHearts, PathNode, PressTile,
  QuizEngine, QuizQ, ReadyGo, RewardBurst, SnapRail, StarBurst, SwipeItem, SwipeStack,
  TimerRing, type Reward,
} from "../fx/gamekit";
import { Odometer, Reveal, Tilt } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = {
  xp: number; gems: number; hearts: number; streak: number;
  setXp: (n: number | ((v: number) => number)) => void;
  setGems: (n: number | ((v: number) => number)) => void;
  setHearts: (n: number | ((v: number) => number)) => void;
  toast: (t: string, s: string, tone?: string) => void;
};

type Mode =
  | "hub" | "quiz-candles" | "quiz-risk" | "swipe-setups" | "boss-rsi"
  | "speed-round" | "path" | "daily" | "memory-pro" | "tower" | "merge" | "defense";

const modes: { id: Mode; t: string; s: string; icon: typeof Trophy; c: string; xp: number; lock?: boolean }[] = [
  { id: "path", t: "Campaign Path", s: "12 nodes · story + chests", icon: Rocket, c: "#8ef23c", xp: 200 },
  { id: "quiz-candles", t: "Candle Master", s: "8 questions · timed", icon: CandlestickChart, c: "#F7931A", xp: 80 },
  { id: "quiz-risk", t: "Risk School", s: "Money management quiz", icon: Shield, c: "#5b8cff", xp: 80 },
  { id: "swipe-setups", t: "Setup Swiper", s: "Bull or Bear? 8 cards", icon: Target, c: "#2ede8a", xp: 60 },
  { id: "boss-rsi", t: "Boss: RSI Dragon", s: "HP fight · pattern DPS", icon: Swords, c: "#ff5470", xp: 150 },
  { id: "speed-round", t: "Speed Round", s: "20s · as many as you can", icon: Flame, c: "#ff8b3d", xp: 100 },
  { id: "memory-pro", t: "Term Memory Pro", s: "12 pairs · ranked", icon: Brain, c: "#a78bff", xp: 90 },
  { id: "tower", t: "Knowledge Tower", s: "Climb 10 floors", icon: Crown, c: "#ffc531", xp: 120 },
  { id: "merge", t: "Coin Merge", s: "2048-style crypto merge", icon: Gem, c: "#14c8f5", xp: 70 },
  { id: "defense", t: "Chart Defense", s: "Stop-loss tower defense", icon: Shield, c: "#ff5470", xp: 110 },
  { id: "daily", t: "Daily Rewards", s: "7-day login calendar", icon: Sparkles, c: "#ffd76a", xp: 50 },
];

const candleQs: QuizQ[] = [
  { q: "Длинная нижняя тень + маленькое тело у поддержки — это?", a: ["Молот (hammer)", "Падающая звезда", "Доджи", "Марубозу"], correct: 0, explain: "Молот показывает, что продавцы давили, но покупатели вернули цену." },
  { q: "Две свечи: вторая полностью перекрывает первую в обратную сторону?", a: ["Поглощение (engulfing)", "Пин-бар", "Харамами", "Три солдата"], correct: 0, explain: "Engulfing — сильный сигнал разворота при объёме." },
  { q: "Свеча с почти равными open/close и длинными тенями?", a: ["Доджи", "Молот", "Волчок", "Марубозу"], correct: 0, explain: "Доджи = нерешительность. Важен на ключевых уровнях." },
  { q: "Три зелёные свечи подряд с ростом close —?", a: ["Три белых солдата", "Три вороны", "Медвежий флаг", "Клин"], correct: 0, explain: "Three white soldiers — бычий continuation/reversal." },
  { q: "Где чаще всего «ложные» пробои?", a: ["На низком объёме у круглых уровней", "На новостях NFP", "В азиатскую сессию всегда", "Никогда"], correct: 0, explain: "Низкий объём + круглый уровень = классика стоп-ханта." },
  { q: "Пин-бар вверх (длинная нижняя тень) после падения —?", a: ["Сигнал возможного разворота вверх", "Сигнал шорта", "Игнор", "Только на дневке"], correct: 0, explain: "Pin-bar = rejection. Контекст важнее формы." },
  { q: "Марубозу — это свеча…", a: ["Без теней, полное тело", "С равными тенями", "С гэпом", "Только чёрная"], correct: 0, explain: "Сильное однонаправленное давление." },
  { q: "Самый надёжный фактор подтверждения паттерна?", a: ["Объём + уровень", "Цвет свечи", "Название паттерна", "Индикатор RSI один"], correct: 0, explain: "Паттерн без контекста и объёма — шум." },
];

const riskQs: QuizQ[] = [
  { q: "Риск на сделку для большинства стратегий?", a: ["1–2% депозита", "10%", "25%", "Всё или ничего"], correct: 0, explain: "1–2% позволяет пережить серию убытков." },
  { q: "Плечо ×10, депозит $1000, риск 1%. Макс. убыток?", a: ["$10", "$100", "$1000", "$50"], correct: 0, explain: "Риск считается от депозита, не от нотионала." },
  { q: "R:R 1:3 значит…", a: ["Риск $1 ради $3 прибыли", "Плечо 3", "3 стопа", "TP ближе SL"], correct: 0, explain: "Даже с winrate 40% стратегия прибыльна." },
  { q: "Что делать после 3 стопов подряд?", a: ["Пауза / разбор / меньше объём", "Удвоить лот", "Убрать стопы", "Перейти на ×100"], correct: 0, explain: "Защита психологии = защита депозита." },
  { q: "Где ставить стоп?", a: ["За структурой + буфер", "Случайно", "На entry", "Очень далеко «на всякий»"], correct: 0, explain: "Стоп должен инвалидировать идею, а не «поболеть»." },
  { q: "Маржин-колл — это…", a: ["Биржа принудительно режет риск", "Бонус", "Новый листинг", "Тип ордера"], correct: 0, explain: "Не путать с обычным стопом — это уже край." },
];

const swipeItems: SwipeItem[] = [
  { id: "1", title: "BTC · пробой $98K на объёме ×3", body: "Закрепление над уровнем, ретест держит.", color: "#F7931A", glyph: "₿", answer: "right", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "2", title: "ETH · двойная вершина + RSI дивергенция", body: "Классический разворотный сетап.", color: "#627EEA", glyph: "Ξ", answer: "left", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "3", title: "SOL · отскок от 200 EMA, funding < 0", body: "Шорты перегреты — возможен сквиз.", color: "#14F195", glyph: "◎", answer: "right", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "4", title: "DOGE · памп на твите, объём падает", body: "Хайп без топлива быстро гаснет.", color: "#C2A633", glyph: "Ð", answer: "left", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "5", title: "TON · ascending triangle, сжатие ATR", body: "Чаще пробивается по тренду вверх.", color: "#0098EA", glyph: "◈", answer: "right", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "6", title: "XRP · медвежий флаг после -18%", body: "Флаг по тренду вниз.", color: "#9fb2dd", glyph: "✕", answer: "left", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "7", title: "AVAX · кит накопил 2M, open interest ↑", body: "Крупный игрок готовит движение вверх.", color: "#E84142", glyph: "▲", answer: "right", leftLabel: "BEAR", rightLabel: "BULL" },
  { id: "8", title: "BNB · вечерний доджи на ATH", body: "Нерешительность на хаях — осторожно.", color: "#F0B90B", glyph: "⬢", answer: "left", leftLabel: "BEAR", rightLabel: "BULL" },
];

const pathNodes: PathNode[] = [
  { id: "p1", title: "Свечи 101", kind: "lesson", state: "done", xp: 20 },
  { id: "p2", title: "Long/Short", kind: "lesson", state: "done", xp: 20 },
  { id: "p3", title: "Сундук", kind: "chest", state: "chest", xp: 50 },
  { id: "p4", title: "Уровни", kind: "lesson", state: "done", xp: 25 },
  { id: "p5", title: "Плечо", kind: "lesson", state: "current", xp: 30 },
  { id: "p6", title: "Риск %", kind: "lesson", state: "locked", xp: 30 },
  { id: "p7", title: "Чекпоинт", kind: "checkpoint", state: "locked", xp: 40 },
  { id: "p8", title: "RSI", kind: "lesson", state: "locked", xp: 25 },
  { id: "p9", title: "Сундук II", kind: "chest", state: "locked", xp: 80 },
  { id: "p10", title: "Психология", kind: "story", state: "locked", xp: 35 },
  { id: "p11", title: "Paper 10", kind: "lesson", state: "locked", xp: 40 },
  { id: "p12", title: "BOSS", kind: "boss", state: "locked", xp: 150 },
];

/* -------------------- MODE: QUIZ WRAPPER -------------------- */
function QuizMode({ qs, title, onBack, onReward }: { qs: QuizQ[]; title: string; onBack: () => void; onReward: (xp: number, gems: number) => void }) {
  const [done, setDone] = useState<null | { score: number; heartsLeft: number; combo: number }>(null);
  const stars = done ? (done.score >= qs.length * 8 ? 3 : done.score >= qs.length * 5 ? 2 : 1) : 0;
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      {!done ? (
        <QuizEngine questions={qs} title={title} timePerQ={20} hearts={5}
          onDone={(r) => { setDone(r); onReward(r.score, r.score >= qs.length * 8 ? 15 : 5); if (r.score >= qs.length * 8) fireWin(); else fireSmall(); }} />
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-6 text-center">
          <StarBurst stars={stars} />
          <p className="display mt-4 text-2xl font-extrabold text-white">{done.score} XP</p>
          <p className="text-sm text-[#8ea6d8]">Combo max · Hearts left {done.heartsLeft}</p>
          <div className="mt-5 flex justify-center gap-2">
            <button onClick={onBack} className="btn3d btn3d-green px-6 py-3 text-xs">Hub</button>
            <button onClick={() => setDone(null)} className="btn3d btn3d-ghost px-6 py-3 text-xs"><RotateCcw size={14} /> Retry</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* -------------------- MODE: SWIPE -------------------- */
function SwipeMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number) => void }) {
  const [res, setRes] = useState<null | { correct: number; total: number }>(null);
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      {!res ? (
        <SwipeStack items={swipeItems} onDone={(r) => { setRes(r); onReward(r.correct * 12); if (r.correct >= 6) fireWin(); else fireSmall(); }} />
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-8 text-center">
          <StarBurst stars={res.correct >= 7 ? 3 : res.correct >= 5 ? 2 : 1} />
          <p className="display mt-4 text-2xl font-extrabold text-white">{res.correct}/{res.total}</p>
          <p className="text-sm text-[#8ea6d8]">сетапов угадано верно</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-5 px-8 py-3 text-xs">Hub</button>
        </motion.div>
      )}
    </div>
  );
}

/* -------------------- MODE: BOSS RSI DRAGON -------------------- */
function BossMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number, gems: number) => void }) {
  const [hp, setHp] = useState(100);
  const [myHp, setMyHp] = useState(100);
  const [round, setRound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [msg, setMsg] = useState("Выбери правильный паттерн, чтобы бить босса");
  const [over, setOver] = useState<"win" | "lose" | null>(null);
  const [ready, setReady] = useState(true);
  const options = useMemo(() => {
    const pool = [
      { t: "RSI > 70 + дивергенция", dmg: 28, ok: true },
      { t: "RSI 50 — флэт", dmg: 0, ok: false },
      { t: "MACD кросс без объёма", dmg: 5, ok: false },
      { t: "Поглощение на поддержке", dmg: 22, ok: true },
      { t: "Шорт без стопа", dmg: 0, ok: false },
      { t: "Пин-бар у сопротивления", dmg: 18, ok: true },
      { t: "FOMO-вход на хаях", dmg: 0, ok: false },
      { t: "R:R 1:3 по плану", dmg: 20, ok: true },
    ];
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const hit = (ok: boolean, dmg: number) => {
    if (over) return;
    if (ok) {
      const d = dmg + combo * 4;
      setHp(h => {
        const n = Math.max(0, h - d);
        if (n <= 0) { setOver("win"); onReward(150, 40); fireWin(); }
        return n;
      });
      setCombo(c => c + 1);
      setMsg(`HIT −${d} HP!`);
      sfx.success();
    } else {
      setMyHp(h => {
        const n = Math.max(0, h - 18);
        if (n <= 0) { setOver("lose"); sfx.error(); }
        return n;
      });
      setCombo(0);
      setMsg("Промах — босс контратакует!");
      sfx.error();
    }
    setRound(r => r + 1);
  };

  return (
    <div className="relative">
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <AnimatePresence>{ready && <ReadyGo onDone={() => setReady(false)} />}</AnimatePresence>
      <div className="panel-3d relative overflow-hidden !rounded-[28px] p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,84,112,.25),transparent_55%)]" />
        <BossHp hp={hp} max={100} name="RSI Dragon 🐉" color="#ff5470" />
        <div className="my-4 flex justify-center">
          <motion.div animate={over === "win" ? { scale: [1, 1.2, 0], rotate: 20 } : { y: [0, -10, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: over === "win" ? 0.8 : 2.4, repeat: over ? 0 : Infinity }}
            className="flex h-28 w-28 items-center justify-center rounded-[32px] border-4 border-[#ff5470] bg-gradient-to-b from-[#4a1020] to-[#1c0a14] text-5xl"
            style={{ boxShadow: "0 0 40px #ff547088, 0 8px 0 #030816" }}>
            🐉
          </motion.div>
        </div>
        <BossHp hp={myHp} max={100} name="You" color="#8ef23c" />
        <div className="mt-3 flex items-center justify-between">
          <ComboMeter combo={combo} />
          <p className="text-xs font-bold text-[#aebde6]">{msg}</p>
        </div>
        {!over ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {options.map(o => (
              <PressTile key={o.t + round} onPress={() => hit(o.ok, o.dmg)} color={o.ok ? undefined : undefined} className="!p-3">
                <p className="text-[12px] font-extrabold text-white">{o.t}</p>
                <p className="text-[10px] text-[#8ea6d8]">DPS ~{o.dmg || "?"}</p>
              </PressTile>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center">
            <p className={cn("display text-3xl font-extrabold", over === "win" ? "text-[#8ef23c]" : "text-[#ff5470]")}>{over === "win" ? "DRAGON DOWN" : "DEFEATED"}</p>
            <button onClick={onBack} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">Hub</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* -------------------- MODE: SPEED ROUND -------------------- */
function SpeedMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number) => void }) {
  const pool = [
    { q: "BTC dominant asset?", ok: true }, { q: "Stop-loss optional?", ok: false },
    { q: "R:R 1:3 good?", ok: true }, { q: "FOMO is a strategy?", ok: false },
    { q: "Support = floor?", ok: true }, { q: "×100 always safe?", ok: false },
    { q: "Volume confirms breakout?", ok: true }, { q: "DCA = one market buy?", ok: false },
    { q: "ATH = all-time high?", ok: true }, { q: "HODL means sell now?", ok: false },
    { q: "Risk 1% smart?", ok: true }, { q: "Margin call is profit?", ok: false },
  ];
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [live, setLive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [started, setStarted] = useState(false);
  const scoreRef = { current: 0 };
  scoreRef.current = score;

  // timer
  useState(() => 0);

  useEffect(() => {
    if (!started || !live) return;
    const id = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          setLive(false);
          const sc = scoreRef.current;
          onReward(sc * 8);
          if (sc >= 8) fireWin(); else fireSmall();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, live, onReward]);

  const answer = (yes: boolean) => {
    if (!live || !started) return;
    const ok = pool[i % pool.length].ok === yes;
    if (ok) { setScore(s => s + 1); setCombo(c => c + 1); sfx.success(); }
    else { setCombo(0); sfx.error(); }
    setI(x => x + 1);
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      {!started ? (
        <div className="py-10 text-center">
          <Flame size={48} className="mx-auto text-[#ff8b3d]" />
          <p className="display mt-3 text-xl font-extrabold text-white">20 seconds · True or False</p>
          <button onClick={() => { setStarted(true); sfx.whoosh(); }} className="btn3d btn3d-gold mt-5 px-8 py-3.5 text-sm"><Play size={16} /> Start</button>
        </div>
      ) : live ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <TimerRing seconds={time} max={20} color="#ff8b3d" />
            <div className="text-right">
              <p className="num-mono text-2xl font-extrabold text-white">{score}</p>
              <ComboMeter combo={combo} />
            </div>
          </div>
          <motion.div key={i} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className="panel-3d p-6 text-center">
            <p className="display text-xl font-extrabold text-white">{pool[i % pool.length].q}</p>
          </motion.div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={() => answer(false)} className="btn3d btn3d-short py-5 text-sm">FALSE</button>
            <button onClick={() => answer(true)} className="btn3d btn3d-long py-5 text-sm">TRUE</button>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center">
          <StarBurst stars={score >= 10 ? 3 : score >= 6 ? 2 : 1} />
          <p className="display mt-3 text-3xl font-extrabold text-white">{score} hits</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-5 px-8 py-3 text-xs">Hub</button>
        </div>
      )}
    </div>
  );
}

/* -------------------- MODE: MEMORY PRO -------------------- */
function MemoryPro({ onBack, onReward }: { onBack: () => void; onReward: (xp: number) => void }) {
  const pairs = [["HODL","Hold long"],["FOMO","Fear missing"],["ATH","All-time high"],["DCA","Avg buy"],["TP","Take profit"],["SL","Stop loss"],["ROI","Return %"],["TVL","Total locked"],["APY","Yearly yield"],["NFT","Unique token"],["DEX","Decentral exch"],["CEX","Central exch"]];
  type C = { id: number; t: string; pair: number };
  const build = () => [...pairs.flatMap((p,i)=>[{id:i*2,t:p[0],pair:i},{id:i*2+1,t:p[1],pair:i}])].sort(()=>Math.random()-0.5);
  const [cards, setCards] = useState<C[]>(build);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);

  const flip = (c: C) => {
    if (open.length === 2 || open.includes(c.id) || matched.includes(c.pair)) return;
    sfx.soft();
    const n = [...open, c.id];
    setOpen(n);
    if (n.length === 2) {
      setMoves(m => m + 1);
      const [a,b] = n.map(id => cards.find(x => x.id === id)!);
      if (a.pair === b.pair) {
        setTimeout(() => {
          const nm = [...matched, a.pair];
          setMatched(nm); setOpen([]); sfx.success();
          if (nm.length === pairs.length) { setDone(true); onReward(90); fireWin(); }
        }, 350);
      } else {
        setTimeout(() => { setOpen([]); sfx.error(); }, 800);
      }
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <div className="mb-3 flex gap-2"><Tag tone="blue">Moves {moves}</Tag><Tag tone="green">{matched.length}/{pairs.length}</Tag></div>
      {done ? (
        <div className="py-8 text-center"><StarBurst stars={moves <= 18 ? 3 : moves <= 28 ? 2 : 1} /><p className="display mt-3 text-xl font-extrabold text-white">Board cleared!</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-4 px-6 py-3 text-xs">Hub</button></div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {cards.map(c => {
            const isOpen = open.includes(c.id) || matched.includes(c.pair);
            const isM = matched.includes(c.pair);
            return (
              <motion.button key={c.id} onClick={() => flip(c)} className="relative h-[70px]" style={{ perspective: 600 }} whileTap={{ scale: 0.92 }}>
                <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-white/15 bg-gradient-to-b from-[#244385] to-[#122657] text-lg font-black text-[#5b8cff]/50" style={{ backfaceVisibility: "hidden", boxShadow: "0 4px 0 #030816" }}>?</div>
                  <div className={cn("absolute inset-0 flex items-center justify-center rounded-xl border-2 p-1 text-center text-[10px] font-extrabold", isM ? "border-[#8ef23c] bg-[#8ef23c]/20 text-[#a4ff5e]" : "border-[#ffc531]/50 bg-[#ffc531]/10 text-[#ffd76a]")}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: "0 4px 0 #030816" }}>{c.t}</div>
                </motion.div>
              </motion.button>
            );
          })}
        </div>
      )}
      <button onClick={() => { setCards(build()); setOpen([]); setMatched([]); setMoves(0); setDone(false); sfx.whoosh(); }} className="btn3d btn3d-ghost mt-3 w-full py-2.5 text-[11px]"><RotateCcw size={12} /> Shuffle</button>
    </div>
  );
}

/* -------------------- MODE: KNOWLEDGE TOWER -------------------- */
function TowerMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number) => void }) {
  const floors = [
    { q: "1 BTC = ?", a: ["100,000,000 sats", "1000 sats", "1 eth", "1 usdt"], c: 0 },
    { q: "Gas fee lives on?", a: ["Network", "CEX only", "Bank", "Wi-Fi"], c: 0 },
    { q: "Bull market = ?", a: ["Rising prices", "Only alts die", "No volume", "Flat"], c: 0 },
    { q: "Liquidity is?", a: ["Ease of trade", "Token color", "A meme", "Tax"], c: 0 },
    { q: "Cold wallet = ?", a: ["Offline keys", "Hot exchange", "Email", "SIM"], c: 0 },
    { q: "Funding rate > 0 means?", a: ["Longs pay shorts", "Shorts pay longs", "Free money", "Halving"], c: 0 },
    { q: "Order book shows?", a: ["Bids & asks", "News", "NFTs", "Gas"], c: 0 },
    { q: "Slippage is?", a: ["Price diff on fill", "A candle", "A chain", "APY"], c: 0 },
    { q: "Impermanent loss in?", a: ["AMM LP", "CEX spot", "Mining", "Airdrop"], c: 0 },
    { q: "Final boss tip?", a: ["Plan > emotion", "YOLO", "No stop", "Copy random"], c: 0 },
  ];
  const [floor, setFloor] = useState(0);
  const [hp, setHp] = useState(3);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const f = floors[floor];

  const pick = (i: number) => {
    if (i === f.c) {
      sfx.success();
      if (floor + 1 >= floors.length) { setWon(true); onReward(120); fireWin(); }
      else setFloor(x => x + 1);
    } else {
      sfx.error();
      setHp(h => {
        const n = h - 1;
        if (n <= 0) setLost(true);
        return n;
      });
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <div className="mb-3 flex items-center justify-between">
        <Tag tone="gold">Floor {floor + 1}/10</Tag>
        <div className="flex gap-1">{Array.from({ length: 3 }, (_, i) => <Heart key={i} size={16} className={i < hp ? "fill-[#ff5470] text-[#ff5470]" : "text-[#2a4b8f]"} />)}</div>
      </div>
      {/* tower visual */}
      <div className="mb-4 flex h-24 items-end justify-center gap-1">
        {floors.map((_, i) => (
          <motion.div key={i} animate={{ height: 20 + i * 6, backgroundColor: i < floor ? "#8ef23c" : i === floor ? "#ffc531" : "#1a356d" }}
            className="w-6 rounded-t-md" style={{ boxShadow: i === floor ? "0 0 12px #ffc531" : undefined }} />
        ))}
      </div>
      {won || lost ? (
        <div className="py-6 text-center">
          <p className={cn("display text-3xl font-extrabold", won ? "text-[#8ef23c]" : "text-[#ff5470]")}>{won ? "SUMMIT!" : "FELL"}</p>
          <button onClick={onBack} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">Hub</button>
        </div>
      ) : (
        <div>
          <p className="display mb-3 text-lg font-extrabold text-white">{f.q}</p>
          <div className="grid grid-cols-2 gap-2">
            {f.a.map((opt, i) => (
              <button key={opt} onClick={() => pick(i)} className="btn3d btn3d-ghost py-4 text-xs !normal-case !tracking-normal">{opt}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- MODE: MERGE 2048 -------------------- */
function MergeMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number) => void }) {
  const glyphs = ["·", "₿", "Ξ", "◎", "Ð", "🚀", "💎", "👑"];
  const empty = () => Array.from({ length: 16 }, () => 0);
  const spawn = (b: number[]) => {
    const free = b.map((v, i) => (v === 0 ? i : -1)).filter(i => i >= 0);
    if (!free.length) return b;
    const i = free[Math.floor(Math.random() * free.length)];
    const n = [...b]; n[i] = Math.random() > 0.9 ? 2 : 1; return n;
  };
  const [board, setBoard] = useState(() => spawn(spawn(empty())));
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const slide = (dir: "L" | "R" | "U" | "D") => {
    const size = 4;
    let b = [...board];
    let moved = false;
    let gained = 0;
    const get = (r: number, c: number) => b[r * size + c];
    const set = (r: number, c: number, v: number) => { b[r * size + c] = v; };
    const lines: number[][] = [];
    for (let i = 0; i < size; i++) {
      let cells: number[] = [];
      for (let j = 0; j < size; j++) {
        if (dir === "L") cells.push(get(i, j));
        if (dir === "R") cells.push(get(i, size - 1 - j));
        if (dir === "U") cells.push(get(j, i));
        if (dir === "D") cells.push(get(size - 1 - j, i));
      }
      lines.push(cells);
    }
    const newLines = lines.map(line => {
      const filtered = line.filter(v => v !== 0);
      const out: number[] = [];
      for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i + 1]) {
          const v = filtered[i] + 1;
          out.push(v); gained += 2 ** v; i++; moved = true;
          if (v >= 7) setWon(true);
        } else out.push(filtered[i]);
      }
      while (out.length < size) out.push(0);
      if (out.some((v, idx) => v !== line[idx])) moved = true;
      return out;
    });
    b = empty();
    newLines.forEach((line, i) => line.forEach((v, j) => {
      if (dir === "L") set(i, j, v);
      if (dir === "R") set(i, size - 1 - j, v);
      if (dir === "U") set(j, i, v);
      if (dir === "D") set(size - 1 - j, i, v);
    }));
    if (moved) {
      b = spawn(b);
      setBoard(b);
      setScore(s => s + gained);
      sfx.tick();
      if (gained) sfx.coin();
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <div className="mb-3 flex items-center justify-between">
        <Tag tone="gold">Score <Odometer value={score} /></Tag>
        <button onClick={() => { setBoard(spawn(spawn(empty()))); setScore(0); setWon(false); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]"><RotateCcw size={12} /></button>
      </div>
      <div className="mx-auto grid max-w-[300px] grid-cols-4 gap-2 touch-none"
        onKeyDown={() => undefined}
        tabIndex={0}
        onPointerUp={() => undefined}>
        {board.map((v, i) => (
          <motion.div key={i + "-" + v} layout className="flex aspect-square items-center justify-center rounded-xl border text-2xl font-black"
            style={{
              background: v === 0 ? "rgba(0,0,0,.35)" : `linear-gradient(180deg, hsl(${40 + v * 25} 80% 55%), hsl(${40 + v * 25} 80% 35%))`,
              borderColor: v === 0 ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.25)",
              boxShadow: v ? "0 4px 0 #030816, inset 0 1px 0 rgba(255,255,255,.35)" : undefined,
              color: v ? "#081130" : "transparent",
            }}
            initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            {glyphs[v] || v}
          </motion.div>
        ))}
      </div>
      <div className="mx-auto mt-4 grid max-w-[220px] grid-cols-3 gap-2">
        <div />
        <button onClick={() => slide("U")} className="btn3d btn3d-ghost py-3 text-xs">↑</button>
        <div />
        <button onClick={() => slide("L")} className="btn3d btn3d-ghost py-3 text-xs">←</button>
        <button onClick={() => slide("D")} className="btn3d btn3d-ghost py-3 text-xs">↓</button>
        <button onClick={() => slide("R")} className="btn3d btn3d-ghost py-3 text-xs">→</button>
      </div>
      {won && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-center">
          <p className="display text-xl font-extrabold text-[#ffc531]">👑 LEGENDARY MERGE</p>
          <button onClick={() => { onReward(70); onBack(); }} className="btn3d btn3d-gold mt-2 px-6 py-2.5 text-xs">Claim +70 XP</button>
        </motion.div>
      )}
      <p className="mt-3 text-center text-[10px] text-[#7d92c4]">Свайпай кнопками · собери 👑</p>
    </div>
  );
}

/* -------------------- MODE: CHART DEFENSE -------------------- */
function DefenseMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number) => void }) {
  const [base, setBase] = useState(100);
  const [wave, setWave] = useState(1);
  const [gold, setGold] = useState(50);
  const [towers, setTowers] = useState([0, 0, 0, 0]); // levels
  const [enemies, setEnemies] = useState<{ id: number; x: number; hp: number; max: number }[]>([]);
  const [live, setLive] = useState(false);
  const [log, setLog] = useState("Построй стоп-лоссы и защити депозит");

  const costs = [20, 35, 50, 80];

  const startWave = () => {
    setLive(true);
    const n = 3 + wave * 2;
    const es = Array.from({ length: n }, (_, i) => ({ id: Date.now() + i, x: -10 - i * 12, hp: 20 + wave * 8, max: 20 + wave * 8 }));
    setEnemies(es);
    setLog(`Wave ${wave} · ${n} dumps incoming`);
    sfx.whoosh();
  };

  const towersRef = useRef(towers); towersRef.current = towers;
  const waveRef = useRef(wave); waveRef.current = wave;
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setEnemies(prev => {
        const tw = towersRef.current;
        const wv = waveRef.current;
        const dps = tw.reduce((a, l, i) => a + (l > 0 ? (i + 1) * l * 3 : 0), 0);
        let next = prev.map(e => ({ ...e, x: e.x + 2 + wv * 0.3, hp: e.hp - dps * 0.05 }));
        const hit = next.filter(e => e.x >= 100);
        if (hit.length) {
          setBase(b => Math.max(0, b - hit.length * 8));
          sfx.error();
        }
        next = next.filter(e => e.x < 100 && e.hp > 0);
        if (hit.length === 0 && prev.length && next.length < prev.length) {
          const killed = prev.length - next.length;
          if (killed > 0) { setGold(g => g + killed * 8); sfx.coin(); }
        }
        if (next.length === 0 && prev.length > 0) {
          setLive(false);
          setWave(w => w + 1);
          setLog("Wave cleared! +gold");
          sfx.success();
          if (wv >= 5) { onReward(110); fireWin(); }
        }
        return next;
      });
      setBase(b => {
        if (b <= 0) { setLive(false); setLog("DEPOSIT LIQUIDATED"); }
        return b;
      });
    }, 200);
    return () => clearInterval(id);
  }, [live, onReward]);

  const upgrade = (i: number) => {
    const cost = costs[Math.min(towers[i], costs.length - 1)];
    if (gold < cost) { sfx.error(); return; }
    setGold(g => g - cost);
    setTowers(t => t.map((l, k) => k === i ? l + 1 : l));
    sfx.pop();
  };

  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <div className="mb-2 flex flex-wrap gap-2">
        <Tag tone="green">Base {base}%</Tag>
        <Tag tone="gold">Gold {gold}</Tag>
        <Tag tone="red">Wave {wave}</Tag>
      </div>
      <div className="panel-inset relative h-[160px] overflow-hidden !rounded-[20px]">
        {/* lane */}
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-gradient-to-r from-[#1a356d] to-[#ff547044]" />
        <div className="absolute right-2 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl border-2 border-[#8ef23c] bg-[#8ef23c]/20 text-xs font-black text-[#8ef23c]">$$</div>
        {towers.map((l, i) => l > 0 && (
          <div key={i} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${15 + i * 18}%` }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5b8cff] bg-[#5b8cff]/30 text-[10px] font-black text-white" style={{ boxShadow: "0 0 14px #5b8cff" }}>
              SL{l}
            </div>
          </div>
        ))}
        {enemies.map(e => (
          <motion.div key={e.id} className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center"
            style={{ left: `${e.x}%` }} animate={{ y: [0, -3, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
            <div className="h-1 w-8 overflow-hidden rounded-full bg-black/50"><div className="h-full bg-[#ff5470]" style={{ width: `${(e.hp / e.max) * 100}%` }} /></div>
            <span className="text-lg">🐻</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-center text-[11px] font-bold text-[#aebde6]">{log}</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {towers.map((l, i) => (
          <button key={i} onClick={() => upgrade(i)} className="btn3d btn3d-blue py-3 text-[10px]">
            SL{i + 1}<br />Lv{l} · ${costs[Math.min(l, costs.length - 1)]}
          </button>
        ))}
      </div>
      <button disabled={live || base <= 0} onClick={startWave} className="btn3d btn3d-short mt-3 w-full py-3.5 text-xs">
        {base <= 0 ? "Liquidated" : live ? "Wave in progress…" : `Start wave ${wave}`}
      </button>
      {wave > 5 && base > 0 && (
        <button onClick={() => { onReward(110); onBack(); }} className="btn3d btn3d-gold mt-2 w-full py-3 text-xs">Claim victory</button>
      )}
    </div>
  );
}

/* -------------------- MODE: PATH + DAILY -------------------- */
function PathMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number, gems: number) => void }) {
  const [nodes, setNodes] = useState(pathNodes);
  const [active, setActive] = useState<PathNode | null>(null);
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <LearningPath nodes={nodes} onNode={(n) => {
        setActive(n);
        if (n.state === "chest") {
          onReward(50, 25); fireWin();
          setNodes(ns => ns.map(x => x.id === n.id ? { ...x, state: "done" } : x));
        }
      }} />
      <AnimatePresence>
        {active && active.state !== "chest" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={() => setActive(null)}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} onClick={e => e.stopPropagation()} className="panel-3d w-full max-w-md p-5">
              <p className="display text-lg font-extrabold text-white">{active.title}</p>
              <p className="text-xs text-[#8ea6d8]">{active.kind} · +{active.xp} XP</p>
              <button onClick={() => {
                onReward(active.xp || 20, 0);
                setNodes(ns => {
                  const idx = ns.findIndex(x => x.id === active.id);
                  return ns.map((x, i) => {
                    if (i === idx) return { ...x, state: "done" as const };
                    if (i === idx + 1 && x.state === "locked") return { ...x, state: x.kind === "chest" ? "chest" as const : "current" as const };
                    return x;
                  });
                });
                setActive(null); fireSmall();
              }} className="btn3d btn3d-green mt-4 w-full py-3.5 text-xs">
                {active.state === "done" ? "Review" : active.state === "locked" ? "Locked" : "Start + XP"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DailyMode({ onBack, onReward }: { onBack: () => void; onReward: (xp: number, gems: number) => void }) {
  const [claimed, setClaimed] = useState([true, true, true, false, false, false, false]);
  return (
    <div>
      <button onClick={onBack} className="mb-3 text-xs font-extrabold text-[#8ea6d8] hover:text-white">← Hub</button>
      <div className="panel-3d p-5">
        <p className="display text-lg font-extrabold text-white">7-Day Login</p>
        <p className="mb-4 text-xs text-[#8ea6d8]">Заходи каждый день — 7-й день легендарный сундук</p>
        <LoginCalendar claimed={claimed} onClaim={(day) => {
          setClaimed(c => c.map((v, i) => i === day ? true : v));
          const xp = [10, 20, 30, 50, 40, 60, 100][day];
          onReward(xp, day === 6 ? 50 : 5);
        }} />
        <EnergyBar value={72} />
        <p className="mt-3 text-[11px] text-[#aebde6]">Streak freeze: 2 · Next heart in 01:12:44</p>
      </div>
      <button onClick={onBack} className="btn3d btn3d-ghost mt-3 w-full py-3 text-xs">Hub</button>
    </div>
  );
}

/* ===================== MAIN HUB ===================== */
export default function GameplayHub({ xp, gems, hearts, streak, setXp, setGems, setHearts, toast }: Props) {
  const [mode, setMode] = useState<Mode>("hub");
  const [boost, setBoost] = useState(1);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [noHearts, setNoHearts] = useState(false);
  const level = Math.floor(xp / 500) + 1;

  const give = (x: number, g = 0) => {
    const xx = Math.round(x * boost);
    setXp(v => v + xx);
    if (g) setGems(v => v + g);
    setRewards([
      { type: "xp", amount: xx },
      ...(g ? [{ type: "gem" as const, amount: g }] : []),
    ]);
    setRewardOpen(true);
    toast(`+${xx} XP`, g ? `+${g} gems` : "Nice run", "gold");
  };

  const enter = (m: Mode) => {
    if (hearts <= 0 && m !== "hub" && m !== "daily" && m !== "path") { setNoHearts(true); return; }
    if (m !== "hub" && m !== "daily" && m !== "path") setHearts(h => Math.max(0, h - 0)); // entry free for demo; spend on fail
    setMode(m); sfx.pop();
  };

  return (
    <GameSection id="gameplay" index="20" kicker="Gameplay Hub" title="Ядро мобильной игры"
      desc="12 режимов: кампания, квизы, свайп-сетапы, босс, speed-round, memory, tower, merge-2048, chart-defense, daily. Общие сердца, комбо, награды и бусты."
      right={<div className="flex flex-wrap gap-2">
        <HudChip icon={<Zap size={14} />} value={xp} color="#8ef23c" label="xp" />
        <HudChip icon={<Gem size={14} />} value={gems} color="#5b8cff" label="gems" />
        <HudChip icon={<Heart size={14} className="fill-current" />} value={hearts} color="#ff5470" label="hp" />
        <HudChip icon={<Flame size={14} />} value={streak} color="#ff8b3d" label="streak" />
        <HudChip icon={<Crown size={14} />} value={level} color="#ffc531" label="lvl" />
        <MultiBadge x={boost} />
      </div>}>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ChipRow options={["1×", "2×", "3×"]} value={`${boost}×`} onChange={(v) => setBoost(parseInt(v))} />
        <span className="text-[11px] text-[#7d92c4]">XP boost · тратитcя только визуально в хабе</span>
        {mode !== "hub" && <button onClick={() => setMode("hub")} className="btn3d btn3d-ghost ml-auto px-4 py-2 text-[11px]">← All modes</button>}
      </div>

      <AnimatePresence mode="wait">
        {mode === "hub" ? (
          <motion.div key="hub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            {/* featured carousel */}
            <SnapRail className="mb-5">
              {[
                { t: "Season 4 · Bull Run", s: "Двойной XP на боссов недели", c: "#8ef23c", i: Rocket },
                { t: "Duel Cup", s: "1v1 до 50 побед — легендарный скин", c: "#ff5470", i: Swords },
                { t: "Candle Exam", s: "Сертификат Price Action", c: "#F7931A", i: CandlestickChart },
                { t: "Risk Mastery", s: "Пройди Risk School на 3★", c: "#5b8cff", i: Shield },
              ].map(f => (
                <Tilt key={f.t} className="w-[78%] shrink-0 snap-center sm:w-[40%]">
                  <div className="relative overflow-hidden rounded-[24px] border border-white/15 p-5" style={{ background: `linear-gradient(135deg, ${f.c}33, #081130 70%)`, boxShadow: "0 8px 0 #030816" }}>
                    <f.i size={48} style={{ color: f.c, filter: `drop-shadow(0 0 16px ${f.c})` }} />
                    <p className="display mt-3 text-xl font-extrabold text-white">{f.t}</p>
                    <p className="text-xs text-[#aebde6]">{f.s}</p>
                    <MagCTA tone="green" onClick={() => enter("path")}>Play featured</MagCTA>
                  </div>
                </Tilt>
              ))}
            </SnapRail>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {modes.map((m, i) => (
                <Reveal key={m.id} delay={i * 0.04} variant="up">
                  <PressTile onPress={() => enter(m.id)} color={m.c} className="min-h-[120px]">
                    {m.lock && <LockedBadge />}
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${m.c}30`, color: m.c, boxShadow: `0 4px 0 #030816` }}>
                        <m.icon size={24} />
                      </span>
                      <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-extrabold text-[#8ef23c]">+{m.xp * boost} XP</span>
                    </div>
                    <p className="display mt-3 text-[15px] font-extrabold text-white">{m.t}</p>
                    <p className="text-[11px] text-[#aebde6]">{m.s}</p>
                  </PressTile>
                </Reveal>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="panel-3d p-4">
                <p className="display text-sm font-extrabold text-white">Quick lesson</p>
                <p className="mb-3 text-xs text-[#8ea6d8]">60-секундный микро-квиз</p>
                <button onClick={() => enter("speed-round")} className="btn3d btn3d-gold w-full py-3 text-xs"><Flame size={14} /> Speed round</button>
              </div>
              <div className="panel-3d p-4">
                <p className="display text-sm font-extrabold text-white">Boss available</p>
                <p className="mb-3 text-xs text-[#8ea6d8]">RSI Dragon · 100 HP</p>
                <button onClick={() => enter("boss-rsi")} className="btn3d btn3d-short w-full py-3 text-xs"><Swords size={14} /> Fight</button>
              </div>
              <div className="panel-3d p-4">
                <p className="display text-sm font-extrabold text-white">Daily claim</p>
                <p className="mb-3 text-xs text-[#8ea6d8]">Day {(claimedCount(claimedStub))} of 7</p>
                <button onClick={() => enter("daily")} className="btn3d btn3d-blue w-full py-3 text-xs"><Sparkles size={14} /> Calendar</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key={mode} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="panel-3d p-5">
            {mode === "quiz-candles" && <QuizMode qs={candleQs} title="Candle Master" onBack={() => setMode("hub")} onReward={(x, g) => give(x, g)} />}
            {mode === "quiz-risk" && <QuizMode qs={riskQs} title="Risk School" onBack={() => setMode("hub")} onReward={(x, g) => give(x, g)} />}
            {mode === "swipe-setups" && <SwipeMode onBack={() => setMode("hub")} onReward={(x) => give(x)} />}
            {mode === "boss-rsi" && <BossMode onBack={() => setMode("hub")} onReward={(x, g) => give(x, g)} />}
            {mode === "speed-round" && <SpeedMode onBack={() => setMode("hub")} onReward={(x) => give(x)} />}
            {mode === "memory-pro" && <MemoryPro onBack={() => setMode("hub")} onReward={(x) => give(x)} />}
            {mode === "tower" && <TowerMode onBack={() => setMode("hub")} onReward={(x) => give(x)} />}
            {mode === "merge" && <MergeMode onBack={() => setMode("hub")} onReward={(x) => give(x)} />}
            {mode === "defense" && <DefenseMode onBack={() => setMode("hub")} onReward={(x) => give(x)} />}
            {mode === "path" && <PathMode onBack={() => setMode("hub")} onReward={(x, g) => give(x, g)} />}
            {mode === "daily" && <DailyMode onBack={() => setMode("hub")} onReward={(x, g) => give(x, g)} />}
          </motion.div>
        )}
      </AnimatePresence>

      <RewardBurst open={rewardOpen} rewards={rewards} onClose={() => setRewardOpen(false)} />
      <AnimatePresence>
        {noHearts && <OutOfHearts onClose={() => setNoHearts(false)} onRefill={() => { setGems(g => g - 150); setHearts(5); setNoHearts(false); toast("Hearts refilled", "−150 gems", "blue"); }} />}
      </AnimatePresence>
    </GameSection>
  );
}

function LockedBadge() {
  return <div className="absolute right-2 top-2 rounded-full bg-black/50 p-1"><Lock size={12} className="text-[#8ea6d8]" /></div>;
}
function claimedCount(_: boolean[]) { return 3; }
const claimedStub = [true, true, true, false, false, false, false];
