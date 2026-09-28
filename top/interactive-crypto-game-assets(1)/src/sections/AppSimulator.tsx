/* ------------------------------------------------------------------
 * 19 · APP SIMULATOR — the full mobile game inside a phone
 * direction-aware page transitions · collapsing header on inner scroll ·
 * 5 screens (Home / Learn / Trade / League / Profile) · shared tab pill
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  BarChart3, BookOpen, Check, ChevronRight, Crown, Flame, Gem, Heart, Home, Lock, Play, Settings, Star, Swords, TrendingDown, TrendingUp, Trophy, User, Zap,
} from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { SectionShell, Tag } from "../components/ui";
import { Odometer, Reveal } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Tab = "home" | "learn" | "trade" | "league" | "profile";
const tabs: { id: Tab; i: typeof Home; l: string }[] = [
  { id: "home", i: Home, l: "Home" }, { id: "learn", i: BookOpen, l: "Learn" }, { id: "trade", i: BarChart3, l: "Trade" },
  { id: "league", i: Trophy, l: "League" }, { id: "profile", i: User, l: "Me" },
];

/* ---------- screen scaffold with collapsing header ---------- */
function Screen({ title, sub, accent, children, right }: { title: string; sub: string; accent: string; children: ReactNode; right?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: ref });
  const h = useTransform(scrollY, [0, 80], [96, 56]);
  const fs = useTransform(scrollY, [0, 80], [24, 16]);
  const subO = useTransform(scrollY, [0, 40], [1, 0]);
  const bgO = useTransform(scrollY, [0, 60], [0, 1]);
  return (
    <div className="relative h-full">
      <motion.div style={{ height: h }} className="absolute inset-x-0 top-0 z-20 flex flex-col justify-end px-4 pb-2">
        <motion.div style={{ opacity: bgO }} className="absolute inset-0 border-b border-white/10 bg-[#0b1a42]/95 backdrop-blur" />
        <div className="relative flex items-end justify-between">
          <div>
            <motion.p style={{ opacity: subO }} className="text-[10px] font-extrabold uppercase tracking-widest" >
              <span style={{ color: accent }}>{sub}</span>
            </motion.p>
            <motion.h4 style={{ fontSize: fs }} className="display font-extrabold leading-tight text-white">{title}</motion.h4>
          </div>
          {right}
        </div>
      </motion.div>
      <div ref={ref} className="no-scrollbar h-full overflow-y-auto px-4 pb-24 pt-[104px]">{children}</div>
    </div>
  );
}

/* ---------- HOME ---------- */
function HomeScreen({ go, xp }: { go: (t: Tab) => void; xp: number }) {
  return (
    <Screen title="Привет, Bull 👋" sub="Tuesday · Day 12" accent="#8ef23c" right={<span className="flex items-center gap-1 rounded-xl bg-[#ff8b3d]/20 px-2 py-1 text-xs font-extrabold text-[#ff8b3d]"><Flame size={13} /> 12</span>}>
      <div className="space-y-3">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => go("learn")} className="relative w-full overflow-hidden rounded-[22px] border border-[#8ef23c]/40 bg-gradient-to-br from-[#1b4d12] to-[#0b1a42] p-4 text-left" style={{ boxShadow: "0 5px 0 #030816" }}>
          <motion.div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#8ef23c]/30 blur-2xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8ef23c]">Continue</p>
          <p className="display text-lg font-extrabold text-white">Плечо ×10</p>
          <p className="text-[11px] text-white/70">Урок 5 из 8 · 3 мин</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40"><motion.div className="h-full rounded-full bg-[#8ef23c]" initial={{ width: 0 }} animate={{ width: "62%" }} transition={{ duration: 1 }} /></div>
          <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#8ef23c] text-[#0a2210]" style={{ boxShadow: "0 4px 0 #3a7d0d" }}><Play size={18} className="fill-current" /></span>
        </motion.button>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#12265a] p-3">
            <Zap size={18} className="text-[#ffc531]" />
            <p className="mt-2 text-lg font-extrabold text-white"><Odometer value={xp} /></p>
            <p className="text-[10px] font-bold text-[#8ea6d8]">Total XP</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#12265a] p-3">
            <Trophy size={18} className="text-[#5b8cff]" />
            <p className="num-mono mt-2 text-lg font-extrabold text-white">#3</p>
            <p className="text-[10px] font-bold text-[#8ea6d8]">Diamond League</p>
          </div>
        </div>
        <p className="pt-1 text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Daily quests</p>
        {[{ t: "Пройди 2 урока", p: 1, m: 2, c: "#8ef23c" }, { t: "3 paper-сделки", p: 2, m: 3, c: "#5b8cff" }, { t: "Выиграй дуэль", p: 0, m: 1, c: "#ff5470" }].map((q, i) => (
          <motion.div key={q.t} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${q.c}22`, color: q.c }}><Star size={16} /></span>
            <div className="flex-1">
              <p className="text-[11px] font-extrabold text-white">{q.t}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40"><motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(q.p / q.m) * 100}%` }} transition={{ delay: 0.3 + i * 0.1 }} style={{ background: q.c }} /></div>
            </div>
            <span className="num-mono text-[10px] font-bold text-[#8ea6d8]">{q.p}/{q.m}</span>
          </motion.div>
        ))}
        <p className="pt-1 text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Market pulse</p>
        {[["BTC", "+2.84%", "#F7931A", "₿"], ["ETH", "+1.92%", "#627EEA", "Ξ"], ["SOL", "−1.24%", "#14F195", "◎"]].map(([s, c, col, g]) => (
          <div key={s} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[.03] px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black" style={{ color: col, background: `${col}22` }}>{g}</span>
            <span className="flex-1 text-xs font-extrabold text-white">{s}</span>
            <span className={cn("num-mono text-xs font-bold", c.startsWith("+") ? "text-[#2ede8a]" : "text-[#ff5470]")}>{c}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- LEARN ---------- */
function LearnScreen() {
  const [done, setDone] = useState(4);
  const units = ["Что такое свеча", "Long vs Short", "Поддержка", "Сопротивление", "Плечо ×10", "Ликвидация", "Стоп-лосс", "BOSS"];
  return (
    <Screen title="Price Action" sub="Unit 2 · 8 lessons" accent="#5b8cff" right={<span className="num-mono rounded-xl bg-[#5b8cff]/20 px-2 py-1 text-xs font-extrabold text-[#9db9ff]">{done}/8</span>}>
      <div className="relative flex flex-col items-center gap-4 py-2">
        {units.map((u, i) => {
          const st = i < done ? "done" : i === done ? "cur" : "lock";
          const x = Math.sin(i * 1.1) * 60;
          return (
            <motion.div key={u} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="flex flex-col items-center" style={{ transform: `translateX(${x}px)` }}>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => { if (st === "cur") { setDone(d => Math.min(8, d + 1)); sfx.success(); } else sfx.tap(); }}
                className={cn("flex h-16 w-16 items-center justify-center rounded-full border-2", st === "done" ? "border-[#ffd76a]/50 bg-gradient-to-b from-[#ffd76a] to-[#e79a06] text-[#3a2200]" : st === "cur" ? "anim-pulse-ring border-[#b6ff7d] bg-gradient-to-b from-[#a4ff5e] to-[#62c91d] text-[#0a2210]" : "border-white/10 bg-gradient-to-b from-[#22345e] to-[#101f47] text-[#54678f]")}
                style={{ boxShadow: "0 6px 0 #030816, inset 0 2px 0 rgba(255,255,255,.3)" }}>
                {st === "done" ? <Check size={24} strokeWidth={3.5} /> : st === "cur" ? (i === 7 ? <Swords size={24} /> : <Star size={24} className="fill-current" />) : <Lock size={20} />}
              </motion.button>
              <span className={cn("mt-1.5 text-[10px] font-extrabold", st === "lock" ? "text-[#54678f]" : "text-white")}>{u}</span>
            </motion.div>
          );
        })}
        {done >= 8 && <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="display text-sm font-extrabold text-[#8ef23c]">Unit complete! 🏆</motion.p>}
      </div>
    </Screen>
  );
}

/* ---------- TRADE ---------- */
function TradeScreen() {
  const [side, setSide] = useState<"long" | "short" | null>(null);
  const [amt, setAmt] = useState(500);
  const pts = "0,70 20,62 40,66 60,48 80,52 100,38 120,42 140,26 160,30 180,18 200,22 220,10";
  return (
    <Screen title="BTC/USDT" sub="Paper trading · $10,000" accent="#F7931A" right={<span className="num-mono text-sm font-extrabold text-[#2ede8a]">$97,432</span>}>
      <div className="space-y-3">
        <div className="rounded-[20px] border border-white/10 bg-black/30 p-3">
          <svg viewBox="0 0 220 80" className="w-full">
            <defs><linearGradient id="simG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2ede8a" stopOpacity=".4" /><stop offset="1" stopColor="#2ede8a" stopOpacity="0" /></linearGradient></defs>
            <polygon points={`0,80 ${pts} 220,80`} fill="url(#simG)" />
            <motion.polyline points={pts} fill="none" stroke="#2ede8a" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
            <motion.circle cx="220" cy="10" r="4" fill="#2ede8a" animate={{ r: [3, 7, 3] }} transition={{ duration: 1.2, repeat: Infinity }} />
          </svg>
          <div className="mt-2 flex gap-1">{["1H", "4H", "1D", "1W"].map((t, i) => <span key={t} className={cn("flex-1 rounded-lg py-1 text-center text-[10px] font-extrabold", i === 1 ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>{t}</span>)}</div>
        </div>
        <div className="rounded-[20px] border border-white/10 bg-black/25 p-3">
          <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase text-[#7d92c4]">Amount</span><span className="num-mono text-sm font-extrabold text-white">${amt}</span></div>
          <input type="range" min={50} max={5000} step={50} value={amt} onChange={e => { setAmt(+e.target.value); sfx.tick(); }} className="lever mt-2 w-full" style={{ ["--fill" as string]: `${(amt / 5000) * 100}%` }} />
          <div className="mt-2 grid grid-cols-4 gap-1">{[10, 25, 50, 100].map(p => <button key={p} onClick={() => { setAmt(p * 50); sfx.tick(); }} className="rounded-lg bg-white/5 py-1 text-[10px] font-extrabold text-[#8ea6d8]">{p}%</button>)}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { setSide("long"); sfx.long(); }} className={cn("btn3d py-4 text-xs", side === "long" ? "btn3d-long anim-pulse-ring" : "btn3d-long")}><TrendingUp size={16} strokeWidth={3} /> Long</button>
          <button onClick={() => { setSide("short"); sfx.short(); }} className="btn3d btn3d-short py-4 text-xs"><TrendingDown size={16} strokeWidth={3} /> Short</button>
        </div>
        <AnimatePresence>
          {side && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className={cn("rounded-[20px] border p-3", side === "long" ? "border-[#2ede8a]/50 bg-[#2ede8a]/10" : "border-[#ff5470]/50 bg-[#ff5470]/10")}>
              <p className={cn("text-xs font-extrabold", side === "long" ? "text-[#2ede8a]" : "text-[#ff5470]")}>{side === "long" ? "LONG" : "SHORT"} открыт · ${amt}</p>
              <p className="text-[10px] text-[#aebde6]">Entry $97,432 · SL 2% · TP 4%</p>
              <button onClick={() => { setSide(null); sfx.coin(); }} className="btn3d btn3d-gold mt-2 w-full py-2 text-[10px]">Close +$18.40</button>
            </motion.div>
          )}
        </AnimatePresence>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[.02] px-3 py-2 text-[11px]">
            <span className="font-bold text-white">{["BTC Long", "ETH Short", "SOL Long", "TON Long"][i]}</span>
            <span className={cn("num-mono font-bold", i === 1 ? "text-[#ff5470]" : "text-[#2ede8a]")}>{["+$42.10", "−$8.30", "+$19.00", "+$6.70"][i]}</span>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ---------- LEAGUE ---------- */
function LeagueScreen() {
  const rows = ["CryptoQueen", "Satoshi_Fan", "YOU", "HodlMaster", "DegenHunter", "ChartWizard", "MoonBoy", "Whale42", "Sats_Stacker", "GasFee"];
  return (
    <Screen title="Diamond League" sub="Ends in 2d 14h" accent="#9ff5ff" right={<Crown size={22} className="text-[#9ff5ff]" />}>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <motion.div key={r} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className={cn("flex items-center gap-3 rounded-2xl border px-3 py-2.5", r === "YOU" ? "border-[#8ef23c]/50 bg-[#8ef23c]/10" : "border-white/8 bg-white/[.02]", i === 3 && "mt-3")}>
            <span className={cn("num-mono w-5 text-xs font-black", i < 3 ? "text-[#ffc531]" : "text-[#54678f]")}>{i + 1}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl text-[10px] font-black" style={{ background: `hsl(${i * 40} 70% 60% / .25)`, color: `hsl(${i * 40} 80% 70%)` }}>{r.slice(0, 2).toUpperCase()}</span>
            <span className={cn("flex-1 text-xs font-extrabold", r === "YOU" ? "text-[#a4ff5e]" : "text-white")}>{r}</span>
            <span className="num-mono text-[11px] font-bold text-[#8ea6d8]">{(4800 - i * 170).toLocaleString()}</span>
          </motion.div>
        ))}
        <p className="py-2 text-center text-[9px] font-extrabold uppercase tracking-widest text-[#2ede8a]">▲ Promotion zone: top 3</p>
      </div>
    </Screen>
  );
}

/* ---------- PROFILE ---------- */
function ProfileScreen({ xp }: { xp: number }) {
  return (
    <Screen title="BullRunner" sub="Level 22 · since 2024" accent="#a78bff" right={<Settings size={18} className="text-[#8ea6d8]" />}>
      <div className="flex flex-col items-center">
        <motion.img src="/images/bull-mascot.png" alt="" className="h-28 w-28 object-contain" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <div className="mt-2 grid w-full grid-cols-3 gap-2">
          {[{ v: "12", l: "Streak", c: "#ff8b3d", i: Flame }, { v: xp.toLocaleString(), l: "XP", c: "#8ef23c", i: Zap }, { v: "240", l: "Gems", c: "#5b8cff", i: Gem }].map(s => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-black/25 p-2 text-center">
              <s.i size={16} className="mx-auto" style={{ color: s.c }} />
              <p className="num-mono mt-1 text-xs font-extrabold text-white">{s.v}</p>
              <p className="text-[9px] font-bold text-[#7d92c4]">{s.l}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 self-start text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Achievements</p>
        <div className="mt-2 grid w-full grid-cols-4 gap-2">
          {[Trophy, Flame, Crown, Heart, Star, Swords, Zap, Gem].map((I, i) => (
            <motion.div key={i} whileTap={{ scale: 0.85, rotate: -10 }} onClick={() => sfx.pop()} className={cn("flex aspect-square items-center justify-center rounded-2xl border", i < 5 ? "border-[#ffc531]/40 bg-[#ffc531]/10" : "border-white/10 bg-black/25")}>
              <I size={20} className={i < 5 ? "text-[#ffc531]" : "text-[#2a4b8f]"} />
            </motion.div>
          ))}
        </div>
        <div className="mt-4 w-full space-y-1.5">
          {["Статистика сделок", "Сертификаты", "Друзья · 18", "Настройки"].map(r => (
            <div key={r} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[.02] px-3 py-2.5">
              <span className="text-xs font-bold text-white">{r}</span><ChevronRight size={14} className="text-[#54678f]" />
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

/* ================= SECTION ================= */
export default function AppSimulator({ xp }: { xp: number }) {
  const [tab, setTab] = useState<Tab>("home");
  const [dir, setDir] = useState(1);
  const go = (t: Tab) => {
    const a = tabs.findIndex(x => x.id === tab), b = tabs.findIndex(x => x.id === t);
    if (a === b) return;
    setDir(b > a ? 1 : -1); setTab(t); sfx.swipe();
  };
  return (
    <SectionShell id="simulator" index="19" kicker="App Simulator" title="Вся игра в одном телефоне" desc="Полноценная навигация: 5 экранов, направленные переходы, сворачивающийся заголовок при скролле внутри телефона, общий индикатор таб-бара."
      right={<div className="flex gap-2"><Tag tone="green">5 screens</Tag><Tag tone="blue">inner scroll</Tag></div>}>
      <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <div className="hidden space-y-4 lg:block">
          {[{ t: "Direction-aware", d: "Экран уезжает туда, откуда пришёл следующий таб", c: "#8ef23c" }, { t: "Collapsing header", d: "Заголовок сжимается при скролле внутри экрана", c: "#5b8cff" }, { t: "Shared tab pill", d: "Индикатор перетекает между табами через layoutId", c: "#ffc531" }].map((f, i) => (
            <Reveal key={f.t} variant="left" delay={i * 0.1}>
              <div className="panel-3d p-4 text-right"><p className="display text-sm font-extrabold" style={{ color: f.c }}>{f.t}</p><p className="text-xs text-[#9fb2dd]">{f.d}</p></div>
            </Reveal>
          ))}
        </div>
        <Reveal variant="scale">
          <div className="relative mx-auto h-[640px] w-[320px] overflow-hidden rounded-[46px] border-[8px] border-[#030816] bg-gradient-to-b from-[#0e2152] to-[#070f2b]" style={{ boxShadow: "0 40px 80px rgba(0,0,0,.7), 0 0 0 2px rgba(148,184,255,.15), inset 0 0 0 1px rgba(255,255,255,.05)" }}>
            <div className="absolute left-1/2 top-2 z-40 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            <div className="absolute inset-x-0 top-0 z-30 flex justify-between px-7 pt-3 text-[10px] font-extrabold text-white"><span>9:41</span><span>5G ▮▮▮</span></div>
            <div className="absolute inset-0 pt-6">
              <AnimatePresence mode="popLayout" custom={dir} initial={false}>
                <motion.div key={tab} custom={dir} className="absolute inset-0 pt-6"
                  initial={{ x: dir * 320, opacity: 0.4 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -dir * 120, opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}>
                  {tab === "home" && <HomeScreen go={go} xp={xp} />}
                  {tab === "learn" && <LearnScreen />}
                  {tab === "trade" && <TradeScreen />}
                  {tab === "league" && <LeagueScreen />}
                  {tab === "profile" && <ProfileScreen xp={xp} />}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="absolute inset-x-2 bottom-2 z-30 rounded-[30px] border border-white/10 bg-[#081130]/95 px-2 py-2 backdrop-blur">
              <div className="grid grid-cols-5">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => go(t.id)} className="relative flex flex-col items-center gap-0.5 py-1.5">
                    {tab === t.id && <motion.span layoutId="simPill" className="absolute inset-0 rounded-2xl bg-[#8ef23c]/15" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <motion.span animate={{ y: tab === t.id ? -2 : 0, scale: tab === t.id ? 1.1 : 1 }}><t.i size={20} className={tab === t.id ? "text-[#8ef23c]" : "text-[#54678f]"} /></motion.span>
                    <span className={cn("relative text-[9px] font-extrabold", tab === t.id ? "text-[#a4ff5e]" : "text-[#54678f]")}>{t.l}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="absolute bottom-0.5 left-1/2 z-40 h-1 w-24 -translate-x-1/2 rounded-full bg-white/40" />
          </div>
        </Reveal>
        <div className="hidden space-y-4 lg:block">
          {[{ t: "Живые данные", d: "XP синхронизирован с шапкой каталога", c: "#ff5470" }, { t: "Тактильный фидбек", d: "Звук и вибрация на каждое действие", c: "#a78bff" }, { t: "Мобильный first", d: "Все жесты работают на тач-экранах", c: "#2ede8a" }].map((f, i) => (
            <Reveal key={f.t} variant="right" delay={i * 0.1}>
              <div className="panel-3d p-4"><p className="display text-sm font-extrabold" style={{ color: f.c }}>{f.t}</p><p className="text-xs text-[#9fb2dd]">{f.d}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
