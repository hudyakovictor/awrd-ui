/* ------------------------------------------------------------------
 * 15 · STORIES & FLOWS — stories viewer, onboarding pager, dynamic island,
 * shared-layout expandable cards, accordion FAQ, level-up celebration
 * ------------------------------------------------------------------ */
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useTransform } from "framer-motion";
import {
  BarChart3, Bell, BookOpen, Brain, ChevronDown, ChevronRight, Crown, Flame, Gem, Pause, Rocket, ShieldCheck, Sparkles, Star, Swords, Trophy, X, Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Card, SectionShell, Tag } from "../components/ui";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

/* ---------- 1. STORIES ---------- */
const stories = [
  { u: "Daily Tip", c: "#8ef23c", ring: ["#8ef23c", "#5b8cff"], slides: [
    { t: "Правило 1%", s: "Никогда не рискуй больше 1–2% депозита в одной сделке.", i: ShieldCheck, bg: "from-[#1b4d12] to-[#050c22]" },
    { t: "Стоп — друг", s: "Стоп-лосс — это не проигрыш, а страховка от катастрофы.", i: Brain, bg: "from-[#12306e] to-[#050c22]" },
  ] },
  { u: "Market", c: "#F7931A", ring: ["#F7931A", "#ff5470"], slides: [
    { t: "BTC +2.84%", s: "Биткоин пробил сопротивление $97K на растущем объёме.", i: BarChart3, bg: "from-[#4d2a08] to-[#050c22]" },
    { t: "ETH ETF", s: "Приток в ETF на эфир — 3-й день подряд.", i: Rocket, bg: "from-[#1f2a6e] to-[#050c22]" },
    { t: "Фандинг", s: "Фандинг по SOL ушёл в минус — шорты перегреты.", i: Flame, bg: "from-[#4a1020] to-[#050c22]" },
  ] },
  { u: "League", c: "#ffc531", ring: ["#ffc531", "#ff8b3d"], slides: [
    { t: "Ты #3!", s: "До топ-2 осталось всего 230 XP. Жми!", i: Trophy, bg: "from-[#4d3a08] to-[#050c22]" },
  ] },
  { u: "Duels", c: "#ff5470", ring: ["#ff5470", "#a78bff"], slides: [
    { t: "3 вызова", s: "CryptoQueen, HodlMaster и DegenHunter ждут дуэли.", i: Swords, bg: "from-[#4a1020] to-[#050c22]" },
    { t: "Win streak", s: "5 побед подряд = сундук легендарной редкости.", i: Crown, bg: "from-[#3f1fa0] to-[#050c22]" },
  ] },
  { u: "Shop", c: "#5b8cff", ring: ["#5b8cff", "#14c8f5"], slides: [
    { t: "−50% скины", s: "Только сегодня: скин «Diamond Bull» за полцены.", i: Gem, bg: "from-[#0a2a5e] to-[#050c22]" },
  ] },
];
function StoryViewer({ start, onClose }: { start: number; onClose: () => void }) {
  const [u, setU] = useState(start);
  const [s, setS] = useState(0);
  const [p, setP] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);
  const y = useMotionValue(0);
  const scale = useTransform(y, [0, 300], [1, 0.8]);
  const radius = useTransform(y, [0, 200], [0, 32]);
  const st = stories[u];
  const next = () => {
    sfx.soft();
    if (s < st.slides.length - 1) { setS(s + 1); setP(0); }
    else if (u < stories.length - 1) { setSeen(x => [...x, u]); setU(u + 1); setS(0); setP(0); }
    else onClose();
  };
  const prev = () => {
    sfx.soft();
    if (s > 0) { setS(s - 1); setP(0); }
    else if (u > 0) { setU(u - 1); setS(0); setP(0); }
  };
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setP(v => { if (v >= 100) { next(); return 0; } return v + 2; }), 60);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, u, s]);
  const sl = st.slides[s];
  const Icon = sl.i;
  void seen;
  return (
    <motion.div className="absolute inset-0 z-30 touch-none overflow-hidden" style={{ y, scale, borderRadius: radius }}
      initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
      drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.8 }}
      onDragEnd={(_, i) => { if (i.offset.y > 120) onClose(); }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={`${u}-${s}`} className={cn("absolute inset-0 bg-gradient-to-b", sl.bg)} initial={{ opacity: 0, x: 40, rotateY: -20 }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
          <motion.div className="absolute left-1/2 top-[28%] -translate-x-1/2" initial={{ scale: 0.3, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
              <Icon size={90} strokeWidth={1.4} style={{ color: st.c, filter: `drop-shadow(0 0 30px ${st.c})` }} />
            </motion.div>
          </motion.div>
          <div className="absolute inset-x-5 bottom-20">
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="display text-3xl font-extrabold text-white">{sl.t}</motion.p>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-sm text-white/80">{sl.s}</motion.p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
        {st.slides.map((_, k) => (
          <div key={k} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-white" style={{ width: k < s ? "100%" : k === s ? `${p}%` : "0%" }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 top-6 z-10 flex items-center gap-2">
        <span className="h-8 w-8 rounded-full border-2 border-white" style={{ background: st.c }} />
        <span className="text-xs font-extrabold text-white">{st.u}</span>
        <span className="text-[10px] text-white/60">2h</span>
        {paused && <Pause size={14} className="ml-1 text-white" />}
        <button onClick={onClose} className="ml-auto text-white"><X size={20} /></button>
      </div>
      <div className="absolute inset-0 top-16 flex">
        <button className="h-full w-1/3" onClick={prev} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} aria-label="prev" />
        <button className="h-full w-2/3" onClick={next} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} aria-label="next" />
      </div>
      <div className="absolute inset-x-4 bottom-4 z-10">
        <button onClick={() => sfx.success()} className="btn3d btn3d-green w-full py-3 text-xs">Подробнее <ChevronRight size={14} /></button>
      </div>
    </motion.div>
  );
}
function Stories() {
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  return (
    <div className="relative mx-auto h-[520px] max-w-[300px] overflow-hidden rounded-[36px] border-[6px] border-[#030816] bg-gradient-to-b from-[#0e2152] to-[#070f2b]" style={{ boxShadow: "0 30px 60px rgba(0,0,0,.6)" }}>
      <div className="flex gap-3 overflow-x-auto px-3 pt-5 no-scrollbar">
        {stories.map((st, i) => (
          <motion.button key={st.u} whileTap={{ scale: 0.9 }} onClick={() => { setOpen(i); setSeen(s => [...new Set([...s, i])]); sfx.pop(); }} className="flex shrink-0 flex-col items-center gap-1">
            <span className="rounded-full p-[3px]" style={{ background: seen.includes(i) ? "#2a4b8f" : `conic-gradient(${st.ring[0]}, ${st.ring[1]}, ${st.ring[0]})` }}>
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#0e2152]" style={{ background: `${st.c}33` }}>
                {(() => { const I = st.slides[0].i; return <I size={22} style={{ color: st.c }} />; })()}
              </span>
            </span>
            <span className="text-[10px] font-bold text-white">{st.u}</span>
          </motion.button>
        ))}
      </div>
      <div className="space-y-2 p-3">
        {[1, 2, 3, 4].map(k => (
          <div key={k} className="rounded-2xl border border-white/10 bg-white/[.03] p-3">
            <div className="shimmer-line mb-2 h-2.5 w-2/3 rounded-full bg-white/10" />
            <div className="h-2 w-1/2 rounded-full bg-white/5" />
          </div>
        ))}
        <p className="pt-2 text-center text-[10px] font-bold uppercase tracking-widest text-[#54678f]">тапни на кружок сверху</p>
      </div>
      <AnimatePresence>{open !== null && <StoryViewer start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  );
}

/* ---------- 2. ONBOARDING PAGER ---------- */
const pages = [
  { t: "Учись за 3 минуты в день", s: "Короткие уроки, которые реально работают", i: BookOpen, c: "#8ef23c" },
  { t: "Торгуй на виртуальные $10K", s: "Живой рынок, нулевой риск", i: BarChart3, c: "#5b8cff" },
  { t: "Соревнуйся с друзьями", s: "Лиги, дуэли и сезонные награды", i: Trophy, c: "#ffc531" },
  { t: "Стань профи", s: "Сертификат и доступ к Pro-стратегиям", i: Crown, c: "#a78bff" },
];
function Onboarding() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => { const n = Math.max(0, Math.min(pages.length - 1, i + d)); if (n !== i) { setDir(d); setI(n); sfx.swipe(); } };
  const pg = pages[i];
  const Icon = pg.i;
  return (
    <div className="relative mx-auto h-[520px] max-w-[300px] overflow-hidden rounded-[36px] border-[6px] border-[#030816]" style={{ boxShadow: "0 30px 60px rgba(0,0,0,.6)" }}>
      <motion.div className="absolute inset-0" animate={{ background: `radial-gradient(circle at 50% 30%, ${pg.c}44, #070f2b 65%)` }} transition={{ duration: 0.6 }} />
      <div className="relative flex justify-end p-4"><button onClick={() => { setI(pages.length - 1); sfx.tap(); }} className="text-[11px] font-extrabold uppercase text-[#8ea6d8]">Skip</button></div>
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.div key={i} custom={dir} className="absolute inset-x-0 top-14 flex cursor-grab flex-col items-center px-6 text-center active:cursor-grabbing"
          initial={{ x: dir * 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -dir * 300, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5}
          onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1); }}>
          <div className="relative h-[200px] w-[200px]">
            {[0, 1, 2].map(k => (
              <motion.span key={k} className="absolute inset-0 rounded-full border-2" style={{ borderColor: `${pg.c}55` }} animate={{ scale: [0.6, 1.2], opacity: [0.8, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.8 }} />
            ))}
            <motion.div className="absolute inset-[40px] flex items-center justify-center rounded-[36px]" initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
              style={{ background: `linear-gradient(180deg, ${pg.c}, ${pg.c}88)`, boxShadow: `0 8px 0 ${pg.c}55, 0 0 40px ${pg.c}88, inset 0 3px 0 rgba(255,255,255,.5)` }}>
              <Icon size={56} className="text-[#081130]" strokeWidth={2.2} />
            </motion.div>
          </div>
          <motion.h4 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="display mt-6 text-2xl font-extrabold leading-tight text-white">{pg.t}</motion.h4>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="mt-2 text-sm text-[#aebde6]">{pg.s}</motion.p>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-x-5 bottom-5">
        <div className="mb-4 flex justify-center gap-2">
          {pages.map((p, k) => (
            <motion.button key={k} onClick={() => { setDir(k > i ? 1 : -1); setI(k); }} animate={{ width: k === i ? 28 : 10, backgroundColor: k === i ? pg.c : "rgba(255,255,255,.2)" }} className="h-2.5 rounded-full" aria-label={p.t} />
          ))}
        </div>
        <button onClick={() => i === pages.length - 1 ? (sfx.levelUp(), confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 } })) : go(1)} className="btn3d btn3d-green w-full py-4 text-sm">
          {i === pages.length - 1 ? "Начать бесплатно" : "Далее"}
        </button>
      </div>
    </div>
  );
}

/* ---------- 3. DYNAMIC ISLAND ---------- */
type IslandMode = "idle" | "trade" | "timer" | "alert" | "call";
function DynamicIsland() {
  const [mode, setMode] = useState<IslandMode>("idle");
  const [secs, setSecs] = useState(0);
  useEffect(() => { if (mode !== "timer") return; const id = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(id); }, [mode]);
  const size: Record<IslandMode, { w: number; h: number; r: number }> = {
    idle: { w: 120, h: 34, r: 20 }, trade: { w: 300, h: 76, r: 30 }, timer: { w: 220, h: 38, r: 22 }, alert: { w: 300, h: 150, r: 40 }, call: { w: 260, h: 60, r: 30 },
  };
  const s = size[mode];
  return (
    <div>
      <div className="relative flex h-[190px] justify-center overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#0a1740] pt-3">
        <motion.div layout animate={{ width: s.w, height: s.h, borderRadius: s.r }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative overflow-hidden bg-black" style={{ boxShadow: "0 10px 30px rgba(0,0,0,.6)" }}>
          <AnimatePresence mode="wait">
            {mode === "trade" && (
              <motion.div key="t" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} className="flex h-full items-center gap-3 px-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7931A]/20 text-lg font-black text-[#F7931A]">₿</span>
                <div className="flex-1"><p className="text-xs font-extrabold text-white">BTC Long ×10</p><p className="text-[10px] text-white/60">Entry $94,120</p></div>
                <div className="text-right"><p className="num-mono text-sm font-extrabold text-[#2ede8a]">+$248</p><p className="num-mono text-[10px] text-[#2ede8a]">+12.4%</p></div>
              </motion.div>
            )}
            {mode === "timer" && (
              <motion.div key="tm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-between px-4">
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#ffc531]"><Flame size={14} /> Lesson</span>
                <span className="num-mono text-sm font-extrabold text-[#ffc531]">{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</span>
              </motion.div>
            )}
            {mode === "alert" && (
              <motion.div key="a" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col justify-center p-4">
                <div className="flex items-center gap-3">
                  <motion.span animate={{ rotate: [0, -20, 20, -10, 10, 0] }} transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 1 }} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff5470]"><Bell size={20} className="text-white" /></motion.span>
                  <div><p className="text-sm font-extrabold text-white">Whale Alert 🐋</p><p className="text-[11px] text-white/60">2 400 BTC → Binance</p></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => setMode("idle")} className="rounded-full bg-white/10 py-2 text-[11px] font-extrabold text-white">Dismiss</button>
                  <button onClick={() => { setMode("trade"); sfx.short(); }} className="rounded-full bg-[#ff5470] py-2 text-[11px] font-extrabold text-white">Short now</button>
                </div>
              </motion.div>
            )}
            {mode === "call" && (
              <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center gap-3 px-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a78bff] text-xs font-black text-[#081130]">CQ</span>
                <div className="flex-1"><p className="text-[11px] font-extrabold text-white">CryptoQueen</p><p className="text-[10px] text-white/60">вызывает на дуэль</p></div>
                <button onClick={() => setMode("idle")} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff5470]"><X size={16} className="text-white" /></button>
                <button onClick={() => { setMode("idle"); sfx.success(); }} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2ede8a]"><Swords size={16} className="text-[#081130]" /></button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050c22] to-transparent" />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {(["idle", "trade", "timer", "alert", "call"] as IslandMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setSecs(0); sfx.pop(); }} className={cn("rounded-xl py-2 text-[10px] font-extrabold uppercase", mode === m ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>{m}</button>
        ))}
      </div>
    </div>
  );
}

/* ---------- 4. EXPANDABLE CARDS (shared layout) ---------- */
const lessons = [
  { id: "a", t: "Японские свечи", s: "Основы · 12 мин", c: "#8ef23c", i: BarChart3, d: "Разберём 12 ключевых свечных паттернов: молот, поглощение, доджи, утренняя звезда. После урока — квиз и мини-игра на распознавание." },
  { id: "b", t: "Управление риском", s: "Core · 18 мин", c: "#5b8cff", i: ShieldCheck, d: "Размер позиции, риск на сделку, соотношение R:R, где ставить стоп и почему 90% трейдеров сливают без этих правил." },
  { id: "c", t: "Психология трейдера", s: "Mindset · 9 мин", c: "#a78bff", i: Brain, d: "FOMO, тильт, месть рынку. Учимся распознавать эмоции и строить торговый план, которому следуешь всегда." },
];
function Expandables() {
  const [open, setOpen] = useState<string | null>(null);
  const sel = lessons.find(l => l.id === open);
  return (
    <LayoutGroup>
      <div className="relative min-h-[300px]">
        <div className="space-y-2.5">
          {lessons.map(l => (
            <motion.button key={l.id} layoutId={`card-${l.id}`} onClick={() => { setOpen(l.id); sfx.whoosh(); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#12265a] p-3 text-left" style={{ borderRadius: 18 }}>
              <motion.span layoutId={`icon-${l.id}`} className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `linear-gradient(180deg, ${l.c}, ${l.c}88)` }}><l.i size={22} className="text-[#081130]" /></motion.span>
              <div className="flex-1">
                <motion.p layoutId={`title-${l.id}`} className="text-sm font-extrabold text-white">{l.t}</motion.p>
                <motion.p layoutId={`sub-${l.id}`} className="text-[11px] text-[#8ea6d8]">{l.s}</motion.p>
              </div>
              <ChevronRight size={16} className="text-[#54678f]" />
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {sel && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} className="absolute -inset-2 z-10 rounded-3xl bg-[#020617]/70 backdrop-blur-sm" />
              <motion.div layoutId={`card-${sel.id}`} className="absolute inset-0 z-20 overflow-hidden border border-white/15 bg-gradient-to-b from-[#1b3773] to-[#0a1740] p-4" style={{ borderRadius: 24 }}>
                <div className="flex items-start gap-3">
                  <motion.span layoutId={`icon-${sel.id}`} className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `linear-gradient(180deg, ${sel.c}, ${sel.c}88)`, boxShadow: `0 0 30px ${sel.c}66` }}><sel.i size={30} className="text-[#081130]" /></motion.span>
                  <div className="flex-1">
                    <motion.p layoutId={`title-${sel.id}`} className="display text-lg font-extrabold text-white">{sel.t}</motion.p>
                    <motion.p layoutId={`sub-${sel.id}`} className="text-xs text-[#8ea6d8]">{sel.s}</motion.p>
                  </div>
                  <button onClick={() => setOpen(null)} className="rounded-full bg-white/10 p-1.5 text-white"><X size={16} /></button>
                </div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} exit={{ opacity: 0 }} className="mt-4 text-sm leading-relaxed text-[#c9d8ff]">{sel.d}</motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} exit={{ opacity: 0 }} className="mt-4 flex gap-2">
                  <Tag tone="gold"><Zap size={11} /> +60 XP</Tag><Tag tone="blue"><Star size={11} /> 4.9</Tag>
                </motion.div>
                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.35 } }} exit={{ opacity: 0 }} onClick={() => sfx.success()} className="btn3d btn3d-green absolute inset-x-4 bottom-4 py-3.5 text-xs">Начать урок</motion.button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}

/* ---------- 5. ACCORDION FAQ ---------- */
const faq = [
  { q: "Это настоящие деньги?", a: "Нет. Все сделки в TRADELINGO — на виртуальный баланс $10 000 по живым котировкам. Учишься без риска." },
  { q: "Сколько времени нужно в день?", a: "Достаточно 3–5 минут. Один урок + одна paper-сделка поддерживают стрик." },
  { q: "Что даёт лига?", a: "Топ-10 недели переходят в лигу выше и получают гемы, скины и сундуки." },
  { q: "Подходит ли новичкам?", a: "Да. Путь начинается с азов: что такое свеча, биржа и кошелёк." },
];
function Accordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {faq.map((f, i) => (
        <motion.div key={i} layout className={cn("overflow-hidden rounded-2xl border transition-colors", open === i ? "border-[#8ef23c]/40 bg-[#8ef23c]/5" : "border-white/10 bg-black/20")}>
          <button onClick={() => { setOpen(open === i ? null : i); sfx.soft(); }} className="flex w-full items-center gap-3 px-4 py-3 text-left">
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black", open === i ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/10 text-[#8ea6d8]")}>{i + 1}</span>
            <span className="flex-1 text-[13px] font-extrabold text-white">{f.q}</span>
            <motion.span animate={{ rotate: open === i ? 180 : 0 }}><ChevronDown size={16} className="text-[#8ea6d8]" /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <p className="px-4 pb-4 pl-14 text-xs leading-relaxed text-[#aebde6]">{f.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- 6. LEVEL UP CELEBRATION ---------- */
function LevelUp() {
  const [show, setShow] = useState(false);
  const timer = useRef<number | null>(null);
  const fire = () => {
    setShow(true); sfx.levelUp();
    const end = Date.now() + 1200;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#8ef23c", "#ffc531", "#5b8cff"] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#8ef23c", "#ffc531", "#5b8cff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
    if (timer.current) clearTimeout(timer.current);
  };
  return (
    <>
      <div className="flex flex-col items-center py-4 text-center">
        <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <Crown size={56} className="text-[#ffc531]" style={{ filter: "drop-shadow(0 0 20px #ffc531)" }} />
        </motion.div>
        <p className="mt-2 text-xs text-[#8ea6d8]">Полноэкранный оверлей с лучами, конфетти и счётчиком</p>
        <button onClick={fire} className="btn3d btn3d-gold mt-4 px-6 py-3.5 text-xs"><Sparkles size={15} /> Trigger Level Up</button>
      </div>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-[#020617]/85 backdrop-blur-md" onClick={() => setShow(false)}>
            <motion.div className="absolute h-[700px] w-[700px]" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,49,.14) 0deg 10deg, transparent 10deg 20deg)" }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
            <motion.div initial={{ scale: 0.3, y: 60 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="relative text-center" onClick={(e) => e.stopPropagation()}>
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto flex h-36 w-36 items-center justify-center rounded-[40px] border-4 border-[#ffd76a] bg-gradient-to-b from-[#ffd76a] to-[#e79a06]" style={{ boxShadow: "0 10px 0 #8a5c00, 0 0 80px rgba(255,197,49,.7), inset 0 4px 0 rgba(255,255,255,.6)" }}>
                <span className="display text-6xl font-extrabold text-[#3a2200]">10</span>
              </motion.div>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 text-sm font-extrabold uppercase tracking-[0.3em] text-[#ffd76a]">Level up!</motion.p>
              <motion.h3 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="display text-4xl font-extrabold text-white">Bull Trader</motion.h3>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 flex justify-center gap-2">
                <Tag tone="green"><Zap size={11} /> +500 XP</Tag><Tag tone="blue"><Gem size={11} /> +100</Tag><Tag tone="gold"><Crown size={11} /> New skin</Tag>
              </motion.div>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} onClick={() => setShow(false)} className="btn3d btn3d-green mt-6 px-10 py-4 text-sm">Continue</motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================= SECTION ================= */
export default function StoriesFlows() {
  return (
    <SectionShell id="flows" index="15" kicker="Stories & Flows" title="Мобильные флоу" desc="Сторис с прогрессом и hold-to-pause, онбординг со свайпом, Dynamic Island с 5 состояниями, shared-layout карточки, аккордеон и полноэкранный Level Up."
      right={<div className="flex gap-2"><Tag tone="red">stories</Tag><Tag tone="violet">shared layout</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Stories" sub="Тап ← → · держи для паузы · свайп вниз закрыть"><Stories /></Card>
        <Card title="Onboarding Pager" sub="Свайп · точки · morph фона"><Onboarding /></Card>
        <div className="flex flex-col gap-5">
          <Card title="Dynamic Island" sub="5 live-состояний"><DynamicIsland /></Card>
          <Card title="Level Up Overlay" sub="Праздник на весь экран"><LevelUp /></Card>
        </div>
        <Card title="Expandable Lessons" sub="Shared layout transition" className="lg:col-span-2"><Expandables /></Card>
        <Card title="FAQ Accordion" sub="Spring height"><Accordion /></Card>
      </div>
    </SectionShell>
  );
}
