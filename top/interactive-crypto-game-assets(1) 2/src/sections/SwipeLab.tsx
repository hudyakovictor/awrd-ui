/* ------------------------------------------------------------------
 * 09 · SWIPE LAB — gestures: swipe-cards, swipe-to-confirm, swipe-to-delete,
 * pull-to-refresh, drag-reorder, draggable bottom sheet with snap points
 * ------------------------------------------------------------------ */
import { AnimatePresence, animate, motion, Reorder, useDragControls, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import {
  Archive, ArrowRight, Bell, Check, ChevronsRight, GripVertical, Heart, Loader2, RefreshCw, RotateCcw, Star, Trash2,
  TrendingDown, TrendingUp, X,
} from "lucide-react";
import { useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Card, SectionShell, Tag } from "../components/ui";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

/* ---------------- 1. BULL / BEAR SWIPE CARDS ---------------- */
type Pred = { sym: string; q: string; hint: string; col: string; g: string; ans: "bull" | "bear"; chart: number[] };
const preds: Pred[] = [
  { sym: "BTC", q: "Пробой уровня $98K на объёме ×3", hint: "Объём подтверждает пробой", col: "#F7931A", g: "₿", ans: "bull", chart: [30, 34, 31, 38, 36, 44, 42, 52, 58, 66] },
  { sym: "ETH", q: "Двойная вершина + дивергенция RSI", hint: "Классический разворотный паттерн", col: "#627EEA", g: "Ξ", ans: "bear", chart: [40, 52, 60, 54, 48, 58, 61, 52, 44, 36] },
  { sym: "SOL", q: "Отскок от 200 EMA, фандинг отрицательный", hint: "Шорты перегреты — возможен сквиз", col: "#14F195", g: "◎", ans: "bull", chart: [60, 52, 46, 40, 38, 36, 40, 45, 50, 56] },
  { sym: "DOGE", q: "Памп на твите, объём падает", hint: "Хайп без объёма быстро гаснет", col: "#C2A633", g: "Ð", ans: "bear", chart: [20, 22, 24, 60, 64, 58, 52, 46, 40, 34] },
  { sym: "TON", q: "Восходящий треугольник, сжатие волатильности", hint: "Чаще пробивается вверх", col: "#0098EA", g: "◈", ans: "bull", chart: [30, 38, 34, 42, 38, 44, 41, 46, 44, 52] },
];

function SwipeCard({ p, onSwipe, top, depth }: { p: Pred; onSwipe: (d: "bull" | "bear") => void; top: boolean; depth: number }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-22, 22]);
  const bullO = useTransform(x, [20, 120], [0, 1]);
  const bearO = useTransform(x, [-120, -20], [1, 0]);
  const bg = useTransform(x, [-200, 0, 200], ["rgba(255,84,112,.35)", "rgba(0,0,0,0)", "rgba(46,222,138,.35)"]);
  const fly = (d: "bull" | "bear") => {
    animate(x, d === "bull" ? 520 : -520, { duration: 0.35, ease: "easeIn" }).then(() => onSwipe(d));
  };
  const end = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 600) fly("bull");
    else if (info.offset.x < -110 || info.velocity.x < -600) fly("bear");
  };
  const max = Math.max(...p.chart), min = Math.min(...p.chart);
  const pts = p.chart.map((v, i) => `${(i / (p.chart.length - 1)) * 240},${80 - ((v - min) / (max - min)) * 70}`).join(" ");
  return (
    <motion.div
      className="absolute inset-0 touch-none"
      style={{ x: top ? x : 0, rotate: top ? rotate : 0, zIndex: 10 - depth }}
      initial={{ scale: 0.9, y: 30, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 2 ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      drag={top ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={end}
      whileTap={top ? { cursor: "grabbing" } : undefined}
    >
      <div className="panel-3d relative h-full cursor-grab overflow-hidden !rounded-[28px] p-5">
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} />
        <motion.div style={{ opacity: bullO }} className="absolute left-5 top-6 z-10 -rotate-12 rounded-xl border-4 border-[#2ede8a] px-3 py-1 display text-2xl font-black text-[#2ede8a]">BULL</motion.div>
        <motion.div style={{ opacity: bearO }} className="absolute right-5 top-6 z-10 rotate-12 rounded-xl border-4 border-[#ff5470] px-3 py-1 display text-2xl font-black text-[#ff5470]">BEAR</motion.div>
        <div className="relative flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-black" style={{ color: p.col, background: `${p.col}22`, border: `1.5px solid ${p.col}66`, boxShadow: "0 4px 0 #030816" }}>{p.g}</span>
          <div>
            <p className="display text-lg font-extrabold text-white">{p.sym}/USDT</p>
            <p className="text-[11px] text-[#8ea6d8]">Сетап дня · 4H</p>
          </div>
        </div>
        <div className="panel-inset relative mt-4 p-3">
          <svg viewBox="0 0 240 86" className="h-[86px] w-full">
            <defs>
              <linearGradient id={`sg${p.sym}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={p.col} stopOpacity=".45" /><stop offset="1" stopColor={p.col} stopOpacity="0" /></linearGradient>
            </defs>
            <polygon points={`0,86 ${pts} 240,86`} fill={`url(#sg${p.sym})`} />
            <polyline points={pts} fill="none" stroke={p.col} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            <line x1="200" x2="240" y1="10" y2="10" stroke="#fff" strokeDasharray="3 3" opacity=".4" />
          </svg>
          <span className="absolute right-3 top-2 text-[10px] font-extrabold text-white/60">?</span>
        </div>
        <p className="mt-4 text-[15px] font-bold leading-snug text-white">{p.q}</p>
        <p className="mt-1 text-[11px] text-[#7d92c4]">Свайп → BULL · ← BEAR</p>
        {top && (
          <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
            <button onClick={() => fly("bear")} className="btn3d btn3d-short py-3 text-xs"><TrendingDown size={15} strokeWidth={3} /> Bear</button>
            <button onClick={() => fly("bull")} className="btn3d btn3d-long py-3 text-xs"><TrendingUp size={15} strokeWidth={3} /> Bull</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BullBear() {
  const [deck, setDeck] = useState(preds);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [last, setLast] = useState<{ ok: boolean; hint: string } | null>(null);
  const [history, setHistory] = useState<Pred[]>([]);
  const onSwipe = (d: "bull" | "bear") => {
    const top = deck[0];
    const ok = top.ans === d;
    if (ok) { setScore(s => s + 10 + streak * 2); setStreak(s => s + 1); sfx.success(); }
    else { setStreak(0); sfx.error(); }
    setLast({ ok, hint: top.hint });
    setHistory(h => [top, ...h]);
    setDeck(dk => dk.slice(1));
    if (deck.length === 1 && ok) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };
  const undo = () => {
    if (!history.length) return;
    setDeck(d => [history[0], ...d]);
    setHistory(h => h.slice(1));
    setLast(null);
    sfx.swipe();
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Tag tone="gold"><Star size={11} /> {score} pts</Tag>
        <Tag tone="red">🔥 streak {streak}</Tag>
        <span className="ml-auto text-[11px] font-bold text-[#7d92c4]">{deck.length} left</span>
      </div>
      <div className="relative mx-auto h-[400px] max-w-[330px]">
        <AnimatePresence>
          {deck.slice(0, 3).map((p, i) => (
            <SwipeCard key={p.sym} p={p} top={i === 0} depth={i} onSwipe={onSwipe} />
          )).reverse()}
        </AnimatePresence>
        {deck.length === 0 && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="panel-inset flex h-full flex-col items-center justify-center !rounded-[28px] text-center">
            <p className="display text-2xl font-extrabold text-white">{score} очков</p>
            <p className="mb-4 text-xs text-[#8ea6d8]">Все сетапы разобраны</p>
            <button onClick={() => { setDeck(preds); setScore(0); setStreak(0); setHistory([]); setLast(null); }} className="btn3d btn3d-green px-6 py-3 text-xs"><RotateCcw size={14} /> Ещё раунд</button>
          </motion.div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={undo} disabled={!history.length} className="btn3d btn3d-ghost px-4 py-2.5 text-[11px]"><RotateCcw size={13} /> Undo</button>
        <AnimatePresence mode="wait">
          {last && (
            <motion.div key={history.length} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className={cn("flex-1 rounded-xl border px-3 py-2 text-[11px] font-bold", last.ok ? "border-[#2ede8a]/40 bg-[#2ede8a]/10 text-[#5ff5a8]" : "border-[#ff5470]/40 bg-[#ff5470]/10 text-[#ff8ba0]")}>
              {last.ok ? "✓ Верно · " : "✕ Мимо · "}{last.hint}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------- 2. SWIPE TO CONFIRM ---------------- */
function SwipeToConfirm({ label, tone = "green", onDone }: { label: string; tone?: "green" | "short"; onDone?: () => void }) {
  const W = 280, K = 56;
  const x = useMotionValue(0);
  const [done, setDone] = useState(false);
  const fill = useTransform(x, [0, W - K - 8], ["0%", "100%"]);
  const txtO = useTransform(x, [0, 120], [1, 0]);
  const col = tone === "green" ? ["#8ef23c", "#3a7d0d"] : ["#ff5470", "#7c0f2c"];
  const reset = () => { setDone(false); animate(x, 0, { type: "spring", stiffness: 300, damping: 25 }); };
  return (
    <div className="panel-inset relative h-[64px] overflow-hidden !rounded-full p-1" style={{ maxWidth: W }}>
      <motion.div className="absolute inset-y-1 left-1 rounded-full" style={{ width: fill, background: `linear-gradient(90deg, ${col[0]}33, ${col[0]}88)` }} />
      <motion.span style={{ opacity: txtO }} className="shimmer-line absolute inset-0 flex items-center justify-center bg-clip-text pl-10 text-[12px] font-extrabold uppercase tracking-widest text-white/80">
        {label} <ChevronsRight size={16} className="ml-1" />
      </motion.span>
      {done && <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold uppercase tracking-widest text-white">Confirmed ✓ <button onClick={reset} className="ml-2 underline opacity-70">reset</button></motion.span>}
      <motion.div
        drag={done ? false : "x"}
        dragConstraints={{ left: 0, right: W - K - 8 }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x, background: `linear-gradient(180deg, ${col[0]}, ${col[1]})`, boxShadow: `0 4px 0 ${col[1]}, inset 0 2px 0 rgba(255,255,255,.5)` }}
        onDrag={() => { if (Math.random() > 0.7) sfx.tick(); }}
        onDragEnd={() => {
          if (x.get() > W - K - 30) { animate(x, W - K - 8); setDone(true); sfx.success(); onDone?.(); }
          else animate(x, 0, { type: "spring", stiffness: 400, damping: 28 });
        }}
        whileTap={{ scale: 0.94 }}
        className="relative z-10 flex h-[56px] w-[56px] cursor-grab items-center justify-center rounded-full text-[#0a2210] active:cursor-grabbing"
      >
        {done ? <Check size={22} strokeWidth={3.5} /> : <ArrowRight size={22} strokeWidth={3} />}
      </motion.div>
    </div>
  );
}

/* ---------------- 3. SWIPE TO DELETE / ARCHIVE LIST ---------------- */
const alertsInit = [
  { id: 1, t: "BTC пересёк $97K", s: "2 мин назад", c: "#F7931A" },
  { id: 2, t: "Кит перевёл 12 000 ETH", s: "8 мин назад", c: "#627EEA" },
  { id: 3, t: "SOL фандинг −0.04%", s: "15 мин назад", c: "#14F195" },
  { id: 4, t: "Новый урок разблокирован", s: "1 ч назад", c: "#8ef23c" },
  { id: 5, t: "Друг обогнал тебя в лиге", s: "3 ч назад", c: "#ff5470" },
];
function SwipeRow({ a, onRemove }: { a: typeof alertsInit[number]; onRemove: (id: number, kind: "del" | "arch") => void }) {
  const x = useMotionValue(0);
  const delO = useTransform(x, [-120, -40], [1, 0]);
  const archO = useTransform(x, [40, 120], [0, 1]);
  const delS = useTransform(x, [-160, -60], [1.3, 0.6]);
  return (
    <motion.div layout exit={{ height: 0, opacity: 0, marginTop: 0 }} transition={{ duration: 0.25 }} className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-between rounded-2xl px-5" style={{ background: "linear-gradient(90deg,#1a4a2e,#081130 50%,#4a1020)" }}>
        <motion.span style={{ opacity: archO }} className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#2ede8a]"><Archive size={16} /> Archive</motion.span>
        <motion.span style={{ opacity: delO, scale: delS }} className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#ff5470]">Delete <Trash2 size={16} /></motion.span>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -120) { sfx.drop(); onRemove(a.id, "del"); }
          else if (info.offset.x > 120) { sfx.coin(); onRemove(a.id, "arch"); }
        }}
        className="relative flex cursor-grab items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#12265a] px-3.5 py-3 active:cursor-grabbing"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${a.c}22`, color: a.c }}><Bell size={16} /></span>
        <div className="flex-1">
          <p className="text-xs font-extrabold text-white">{a.t}</p>
          <p className="text-[10px] text-[#7d92c4]">{a.s}</p>
        </div>
        <GripVertical size={14} className="text-[#54678f]" />
      </motion.div>
    </motion.div>
  );
}
function SwipeList() {
  const [list, setList] = useState(alertsInit);
  const [log, setLog] = useState("");
  return (
    <div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {list.map(a => (
            <SwipeRow key={a.id} a={a} onRemove={(id, k) => { setList(l => l.filter(q => q.id !== id)); setLog(k === "del" ? "Удалено" : "В архиве"); }} />
          ))}
        </AnimatePresence>
      </div>
      {list.length === 0 && <p className="py-6 text-center text-xs text-[#7d92c4]">Inbox zero 🎉</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#8ea6d8]">{log || "← удалить · архив →"}</span>
        <button onClick={() => { setList(alertsInit); setLog(""); sfx.pop(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><RotateCcw size={12} /> Restore</button>
      </div>
    </div>
  );
}

/* ---------------- 4. PULL TO REFRESH ---------------- */
function PullToRefresh() {
  const y = useMotionValue(0);
  const [state, setState] = useState<"idle" | "ready" | "loading">("idle");
  const [items, setItems] = useState(["BTC +2.8%", "ETH +1.9%", "SOL −1.2%", "BNB +0.6%"]);
  const rot = useTransform(y, [0, 90], [0, 360]);
  const iconS = useTransform(y, [0, 90], [0.4, 1]);
  const refresh = () => {
    setState("loading");
    animate(y, 60);
    setTimeout(() => {
      const coins = ["DOGE", "TON", "XRP", "AVAX", "LINK", "ADA"];
      const c = coins[Math.floor(Math.random() * coins.length)];
      const v = (Math.random() * 8 - 3).toFixed(1);
      setItems(it => [`${c} ${+v >= 0 ? "+" : ""}${v}%`, ...it].slice(0, 5));
      setState("idle");
      animate(y, 0, { type: "spring", stiffness: 300, damping: 26 });
      sfx.success();
    }, 1300);
  };
  return (
    <div className="panel-inset relative h-[260px] overflow-hidden !rounded-[22px]">
      <motion.div className="absolute left-1/2 top-3 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#8ef23c] text-[#0a2210]" style={{ scale: iconS, rotate: state === "loading" ? undefined : rot, boxShadow: "0 4px 0 #3a7d0d" }}>
        {state === "loading" ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
      </motion.div>
      <motion.div
        drag={state === "loading" ? false : "y"}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        style={{ y }}
        onDrag={() => { const r = y.get() > 70 ? "ready" : "idle"; if (r !== state && state !== "loading") { setState(r); if (r === "ready") sfx.tick(); } }}
        onDragEnd={() => { if (y.get() > 70) refresh(); else setState("idle"); }}
        className="relative z-10 h-full cursor-grab bg-gradient-to-b from-[#0e1d48] to-[#081130] p-3 active:cursor-grabbing"
      >
        <p className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">
          {state === "ready" ? "Отпусти для обновления" : state === "loading" ? "Обновляем…" : "↓ Потяни вниз"}
        </p>
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {items.map((t, i) => (
              <motion.div key={t + i} layout initial={{ opacity: 0, x: -30, backgroundColor: "rgba(142,242,60,.3)" }} animate={{ opacity: 1, x: 0, backgroundColor: "rgba(255,255,255,.03)" }} transition={{ duration: 0.6 }}
                className="flex items-center justify-between rounded-xl border border-white/8 px-3 py-2">
                <span className="text-xs font-extrabold text-white">{t.split(" ")[0]}</span>
                <span className={cn("num-mono text-xs font-bold", t.includes("−") || t.includes("-") ? "text-[#ff5470]" : "text-[#2ede8a]")}>{t.split(" ")[1]}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- 5. REORDER PORTFOLIO ---------------- */
const port = [
  { id: "BTC", p: 48, c: "#F7931A", g: "₿" }, { id: "ETH", p: 26, c: "#627EEA", g: "Ξ" },
  { id: "SOL", p: 14, c: "#14F195", g: "◎" }, { id: "TON", p: 8, c: "#0098EA", g: "◈" }, { id: "DOGE", p: 4, c: "#C2A633", g: "Ð" },
];
function ReorderItem({ item, i }: { item: typeof port[number]; i: number }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls}
      whileDrag={{ scale: 1.04, boxShadow: "0 20px 40px rgba(0,0,0,.6)", zIndex: 20 }}
      onDragStart={() => sfx.pop()} onDragEnd={() => sfx.drop()}
      className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#12265a] px-3 py-2.5">
      <span className="num-mono w-4 text-xs font-extrabold text-[#54678f]">{i + 1}</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-black" style={{ color: item.c, background: `${item.c}22` }}>{item.g}</span>
      <div className="flex-1">
        <p className="text-xs font-extrabold text-white">{item.id}</p>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full" style={{ width: `${item.p * 2}%`, background: item.c }} /></div>
      </div>
      <span className="num-mono text-xs font-bold text-[#aebde6]">{item.p}%</span>
      <button onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none rounded-lg p-1.5 text-[#8ea6d8] hover:bg-white/10 active:cursor-grabbing"><GripVertical size={16} /></button>
    </Reorder.Item>
  );
}
function ReorderPortfolio() {
  const [items, setItems] = useState(port);
  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
      {items.map((it, i) => <ReorderItem key={it.id} item={it} i={i} />)}
    </Reorder.Group>
  );
}

/* ---------------- 6. DRAGGABLE BOTTOM SHEET ---------------- */
function SheetPhone() {
  const H = 380;
  const snaps = [H - 90, H - 220, 40];
  const y = useMotionValue(snaps[0]);
  const [snap, setSnap] = useState(0);
  const dim = useTransform(y, [40, H - 90], [0.6, 0]);
  const radius = useTransform(y, [40, H - 90], [18, 28]);
  const to = (i: number) => { setSnap(i); animate(y, snaps[i], { type: "spring", stiffness: 320, damping: 32 }); sfx.soft(); };
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className="relative mx-auto h-[380px] max-w-[290px] overflow-hidden rounded-[32px] border-[6px] border-[#030816] bg-gradient-to-b from-[#0e2152] to-[#070f2b]" style={{ boxShadow: "0 20px 50px rgba(0,0,0,.6)" }}>
      <div className="p-4">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Portfolio</p>
        <p className="num-mono text-2xl font-extrabold text-white">$12,480.20</p>
        <p className="num-mono text-xs font-bold text-[#2ede8a]">+$482.10 (4.02%)</p>
        <svg viewBox="0 0 240 80" className="mt-3 w-full">
          <path d="M0,60 C30,55 40,40 70,45 C100,50 110,20 140,25 C170,30 190,10 240,8" fill="none" stroke="#8ef23c" strokeWidth="3" />
        </svg>
      </div>
      <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />
      <motion.div
        className="absolute inset-x-0 top-0 h-full border-t border-white/15 bg-gradient-to-b from-[#1b3773] to-[#0e1f4a]"
        style={{ y, borderTopLeftRadius: radius, borderTopRightRadius: radius, boxShadow: "0 -10px 30px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.15)" }}
        drag="y"
        dragConstraints={{ top: 40, bottom: H - 90 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          const proj = y.get() + info.velocity.y * 0.2;
          let best = 0;
          snaps.forEach((s, i) => { if (Math.abs(s - proj) < Math.abs(snaps[best] - proj)) best = i; });
          to(best);
        }}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-white/30" />
        <div className="flex items-center justify-between px-4 pt-3">
          <p className="display text-sm font-extrabold text-white">Quick Trade</p>
          <div className="flex gap-1">
            {["Peek", "Half", "Full"].map((s, i) => (
              <button key={s} onClick={() => to(i)} className={cn("rounded-md px-2 py-0.5 text-[9px] font-extrabold", snap === i ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/10 text-[#8ea6d8]")}>{s}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 pt-3">
          <button onClick={() => sfx.long()} className="btn3d btn3d-long py-3 text-[11px]"><TrendingUp size={14} /> Long</button>
          <button onClick={() => sfx.short()} className="btn3d btn3d-short py-3 text-[11px]"><TrendingDown size={14} /> Short</button>
        </div>
        <div className="space-y-2 px-4 pt-4">
          {["Market", "Limit $96,800", "Stop $95,200", "TP $101,000", "Trailing 1.5%"].map((o, i) => (
            <div key={o} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
              <span className="text-[11px] font-bold text-white">{o}</span>
              {i === 0 ? <Check size={14} className="text-[#8ef23c]" /> : <X size={12} className="text-[#54678f]" />}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- 7. DOUBLE TAP LIKE ---------------- */
function DoubleTapLike() {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(1284);
  const lastTap = useRef(0);
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const r = e.currentTarget.getBoundingClientRect();
      const id = now;
      setHearts(h => [...h, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      setTimeout(() => setHearts(h => h.filter(q => q.id !== id)), 900);
      if (!liked) { setLiked(true); setCount(c => c + 1); }
      sfx.pop();
    }
    lastTap.current = now;
  };
  return (
    <div>
      <div onPointerDown={tap} className="relative flex h-[150px] cursor-pointer select-none items-center justify-center overflow-hidden rounded-[22px] border border-white/15 bg-[radial-gradient(circle_at_30%_30%,#2a4b8f,#081130)]">
        <p className="display px-6 text-center text-base font-extrabold text-white">«Не торгуй на эмоциях — торгуй по плану»</p>
        <AnimatePresence>
          {hearts.map(h => (
            <motion.span key={h.id} className="pointer-events-none absolute" style={{ left: h.x - 30, top: h.y - 30 }}
              initial={{ scale: 0, opacity: 1, rotate: -20 }} animate={{ scale: [0, 1.4, 1], opacity: [1, 1, 0], y: -40, rotate: 0 }} transition={{ duration: 0.9 }}>
              <Heart size={60} className="fill-[#ff5470] text-[#ff5470]" style={{ filter: "drop-shadow(0 0 20px #ff5470)" }} />
            </motion.span>
          ))}
        </AnimatePresence>
        <span className="absolute bottom-2 text-[9px] font-bold uppercase tracking-widest text-white/50">double-tap</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => { setLiked(!liked); setCount(c => c + (liked ? -1 : 1)); sfx.pop(); }}>
          <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} className="block">
            <Heart size={22} className={liked ? "fill-[#ff5470] text-[#ff5470]" : "text-[#8ea6d8]"} />
          </motion.span>
        </motion.button>
        <span className="num-mono text-xs font-bold text-white">{count.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ================= SECTION ================= */
export default function SwipeLab() {
  const [confirmed, setConfirmed] = useState(0);
  return (
    <SectionShell id="swipe" index="09" kicker="Swipe Lab" title="Жесты и свайпы" desc="Tinder-свайп сетапов Bull/Bear, свайп для подтверждения, свайп-удаление, pull-to-refresh, drag-reorder портфеля, bottom sheet со снапами и double-tap лайк."
      right={<div className="flex gap-2"><Tag tone="green">touch-first</Tag><Tag tone="gold">haptics</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr]">
        <Card title="Bull or Bear? · Swipe Game" sub="Свайпай прогнозы · стрик множит очки" className="lg:row-span-2" action={<Tag tone="red">game</Tag>}>
          <BullBear />
        </Card>
        <Card title="Swipe to Confirm" sub={`Защита от случайного ордера · ${confirmed} подтверждено`}>
          <div className="space-y-3">
            <SwipeToConfirm label="Slide to Long" onDone={() => setConfirmed(c => c + 1)} />
            <SwipeToConfirm label="Slide to close all" tone="short" onDone={() => setConfirmed(c => c + 1)} />
          </div>
        </Card>
        <Card title="Pull to Refresh" sub="Тяни список вниз"><PullToRefresh /></Card>
        <Card title="Swipe Actions · Alerts" sub="← delete · archive →"><SwipeList /></Card>
        <Card title="Drag Reorder · Portfolio" sub="Тяни за ручку ⋮⋮"><ReorderPortfolio /></Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card title="Bottom Sheet · 3 Snap Points" sub="Тяни шторку · бросай с инерцией"><SheetPhone /></Card>
        <Card title="Double-Tap to Like" sub="Двойной тап — вылетает сердце"><DoubleTapLike /></Card>
      </div>
    </SectionShell>
  );
}
