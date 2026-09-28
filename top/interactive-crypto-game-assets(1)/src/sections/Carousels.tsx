/* ------------------------------------------------------------------
 * 08 · CAROUSELS — all carousel archetypes in one tactile system
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useSpring, useTransform, type PanInfo, type MotionValue } from "framer-motion";
import {
  BarChart3, Brain, ChevronLeft, ChevronRight, Coins, Crown, Flame, Gem, Lock, Pause, Play, Rocket,
  ShieldCheck, Sparkles, Star, Swords, Target, TrendingUp, Trophy, Wallet, Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Card, SectionShell, Tag } from "../components/ui";
import { clamp, Tilt, wrap } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

/* ---------------- data ---------------- */
const courses = [
  { t: "Candlestick Basics", s: "12 уроков · 45 мин", lvl: "Beginner", icon: BarChart3, g: ["#8ef23c", "#2c7a0a"], p: 100, xp: 240 },
  { t: "Long & Short", s: "9 уроков · 38 мин", lvl: "Beginner", icon: TrendingUp, g: ["#2ede8a", "#0a6b44"], p: 72, xp: 180 },
  { t: "Leverage & Risk", s: "14 уроков · 1ч", lvl: "Intermediate", icon: ShieldCheck, g: ["#5b8cff", "#1a2f8a"], p: 35, xp: 320 },
  { t: "On-chain Analytics", s: "11 уроков · 52 мин", lvl: "Advanced", icon: Brain, g: ["#a78bff", "#3f1fa0"], p: 0, xp: 400 },
  { t: "DeFi & Yield", s: "10 уроков · 44 мин", lvl: "Intermediate", icon: Coins, g: ["#ffc531", "#8a5c00"], p: 0, xp: 280 },
  { t: "Trading Psychology", s: "8 уроков · 30 мин", lvl: "All levels", icon: Target, g: ["#ff5470", "#7c0f2c"], p: 12, xp: 200 },
  { t: "Whale Watching", s: "7 уроков · 28 мин", lvl: "Advanced", icon: Wallet, g: ["#14c8f5", "#085a78"], p: 0, xp: 360 },
];

const promos = [
  { t: "Season 4 · Bull Run", s: "Двойной XP на все уроки фьючерсов", cta: "Join season", g: "from-[#1b4d12] via-[#0e2a0a] to-[#050c22]", acc: "#8ef23c", icon: Rocket },
  { t: "Weekend Duel Cup", s: "Турнир 1v1 · призовой фонд 50 000 гемов", cta: "Enter cup", g: "from-[#4a1020] via-[#2a0814] to-[#050c22]", acc: "#ff5470", icon: Swords },
  { t: "Diamond League", s: "Топ-10 получают эксклюзивный скин быка", cta: "See ranks", g: "from-[#12306e] via-[#0a1a42] to-[#050c22]", acc: "#5b8cff", icon: Crown },
  { t: "Mystery Chest Drop", s: "Каждый 3-й урок — сундук с редкими наградами", cta: "Open now", g: "from-[#4d3a08] via-[#2a1f05] to-[#050c22]", acc: "#ffc531", icon: Gem },
];

const leagues = [
  { n: "Bronze", c: "#cd7f32" }, { n: "Silver", c: "#c0c8d8" }, { n: "Gold", c: "#ffc531" }, { n: "Sapphire", c: "#5b8cff" },
  { n: "Ruby", c: "#ff5470" }, { n: "Emerald", c: "#2ede8a" }, { n: "Amethyst", c: "#a78bff" }, { n: "Diamond", c: "#9ff5ff" },
];

const pickerCoins = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "TON", "ADA", "AVAX", "LINK", "DOT", "MATIC"];
const pickerTf = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];

/* ================= 1. COVERFLOW 3D ================= */
function Coverflow() {
  const [idx, setIdx] = useState(2);
  const [auto, setAuto] = useState(true);
  const [prog, setProg] = useState(0);
  const n = courses.length;
  const go = useCallback((d: number) => { setIdx(i => wrap(0, n, i + d)); setProg(0); sfx.swipe(); }, [n]);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setProg(p => {
        if (p >= 100) { setIdx(i => wrap(0, n, i + 1)); return 0; }
        return p + 2;
      });
    }, 70);
    return () => clearInterval(id);
  }, [auto, n]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
  };

  return (
    <div>
      <motion.div
        className="relative h-[300px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ perspective: 1100 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={onDragEnd}
        onHoverStart={() => setAuto(false)}
        onHoverEnd={() => setAuto(true)}
      >
        {courses.map((c, i) => {
          let off = i - idx;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          const Icon = c.icon;
          return (
            <motion.div
              key={c.t}
              className="absolute left-1/2 top-1/2 h-[260px] w-[200px] -ml-[100px] -mt-[130px]"
              animate={{
                x: off * 150,
                rotateY: off * -38,
                z: -abs * 120,
                scale: abs === 0 ? 1 : 0.86,
                opacity: abs > 2 ? 0 : 1 - abs * 0.18,
                filter: abs === 0 ? "brightness(1)" : "brightness(.6)",
              }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              style={{ zIndex: 10 - abs, transformStyle: "preserve-3d" }}
              onClick={() => { if (off !== 0) go(off); }}
            >
              <div
                className="relative flex h-full flex-col overflow-hidden rounded-[26px] border border-white/20 p-4"
                style={{ background: `linear-gradient(160deg, ${c.g[0]}, ${c.g[1]} 70%)`, boxShadow: `0 8px 0 ${c.g[1]}, 0 26px 50px -10px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.45)` }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">{c.lvl}</span>
                  {c.p === 100 ? <Trophy size={18} className="text-white" /> : c.p === 0 ? <Lock size={16} className="text-white/70" /> : null}
                </div>
                <motion.div
                  animate={abs === 0 ? { y: [0, -8, 0], rotate: [0, -4, 0] } : {}}
                  transition={{ duration: 2.6, repeat: Infinity }}
                  className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-[22px] bg-white/20 text-white backdrop-blur"
                  style={{ boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), 0 6px 0 rgba(0,0,0,.25)" }}
                >
                  <Icon size={40} strokeWidth={2.2} />
                </motion.div>
                <p className="display text-[17px] font-extrabold leading-tight text-white drop-shadow">{c.t}</p>
                <p className="text-[11px] font-semibold text-white/75">{c.s}</p>
                <div className="mt-auto">
                  <div className="h-2.5 overflow-hidden rounded-full bg-black/35">
                    <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${c.p}%` }} transition={{ delay: 0.3, duration: 1 }} />
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10px] font-extrabold text-white/85">
                    <span>{c.p}%</span><span>+{c.xp} XP</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button onClick={() => go(-1)} className="btn3d btn3d-ghost h-11 w-11 !rounded-2xl"><ChevronLeft size={18} /></button>
        <div className="flex flex-1 items-center justify-center gap-1.5">
          {courses.map((_, i) => (
            <button key={i} onClick={() => { setIdx(i); setProg(0); sfx.tick(); }} className="relative h-2.5 overflow-hidden rounded-full bg-white/10 transition-all" style={{ width: i === idx ? 38 : 10 }}>
              {i === idx && <motion.span className="absolute inset-y-0 left-0 bg-[#8ef23c]" style={{ width: `${auto ? prog : 100}%` }} />}
            </button>
          ))}
        </div>
        <button onClick={() => setAuto(a => !a)} className="btn3d btn3d-ghost h-11 w-11 !rounded-2xl">{auto ? <Pause size={16} /> : <Play size={16} />}</button>
        <button onClick={() => go(1)} className="btn3d btn3d-green h-11 w-11 !rounded-2xl"><ChevronRight size={18} strokeWidth={3} /></button>
      </div>
    </div>
  );
}

/* ================= 2. SCROLL-SNAP CAROUSEL ================= */
function SnapCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const w = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 12 : 1;
    const a = Math.round(el.scrollLeft / w);
    if (a !== active) { setActive(a); sfx.tick(); }
    setProg(el.scrollLeft / (el.scrollWidth - el.clientWidth || 1));
  };
  const to = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12;
    el.scrollTo({ left: i * w, behavior: "smooth" });
  };
  return (
    <div>
      <div ref={ref} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
        {courses.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.t}
              animate={{ scale: i === active ? 1 : 0.94, opacity: i === active ? 1 : 0.7 }}
              className="panel-inset w-[78%] shrink-0 snap-center !rounded-[22px] p-4 sm:w-[46%]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(180deg,${c.g[0]},${c.g[1]})`, boxShadow: `0 4px 0 ${c.g[1]}` }}>
                  <Icon size={22} />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-white">{c.t}</p>
                  <p className="text-[11px] text-[#8ea6d8]">{c.s}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {[0, 1, 2, 3, 4].map(s => (
                  <Star key={s} size={13} className={s < Math.round(c.p / 25) ? "fill-[#ffc531] text-[#ffc531]" : "text-[#2a4b8f]"} />
                ))}
                <span className="ml-auto text-[10px] font-extrabold text-[#8ef23c]">+{c.xp} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/40">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5b8cff]" style={{ width: `${Math.max(8, prog * 100)}%` }} />
        </div>
        <span className="num-mono text-[11px] font-bold text-[#8ea6d8]">{active + 1}/{courses.length}</span>
        <div className="flex gap-1.5">
          <button onClick={() => to(Math.max(0, active - 1))} className="btn3d btn3d-ghost h-8 w-8 !rounded-xl"><ChevronLeft size={14} /></button>
          <button onClick={() => to(Math.min(courses.length - 1, active + 1))} className="btn3d btn3d-blue h-8 w-8 !rounded-xl"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/* ================= 3. INFINITE MOMENTUM DRAG ================= */
const ticks = [
  { s: "BTC", p: "97,432", c: 2.84, col: "#F7931A", g: "₿" }, { s: "ETH", p: "3,841", c: 1.92, col: "#627EEA", g: "Ξ" },
  { s: "SOL", p: "214.6", c: -1.24, col: "#14F195", g: "◎" }, { s: "BNB", p: "692.1", c: 0.64, col: "#F0B90B", g: "⬢" },
  { s: "DOGE", p: "0.321", c: 5.41, col: "#C2A633", g: "Ð" }, { s: "TON", p: "5.842", c: -0.82, col: "#0098EA", g: "◈" },
  { s: "XRP", p: "2.341", c: 3.12, col: "#9fb2dd", g: "✕" }, { s: "AVAX", p: "41.20", c: -2.1, col: "#E84142", g: "▲" },
];
function InfiniteDrag() {
  const x = useMotionValue(0);
  const dragging = useRef(false);
  const vel = useRef(-40);
  const ITEM = 176;
  const total = ITEM * ticks.length;
  const [speed, setSpeed] = useState(1);
  useAnimationFrame((_, d) => {
    if (dragging.current) return;
    vel.current += (-40 * speed - vel.current) * 0.04;
    x.set(x.get() + vel.current * (d / 1000));
  });
  const wrapped = useTransform(x, v => wrap(-total, 0, v));
  return (
    <div>
      <div className="relative overflow-hidden rounded-[20px]" style={{ maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
        <motion.div
          className="flex w-max cursor-grab gap-3 py-2 active:cursor-grabbing"
          style={{ x: wrapped }}
          onPanStart={() => { dragging.current = true; }}
          onPan={(_, info) => x.set(x.get() + info.delta.x)}
          onPanEnd={(_, info) => { dragging.current = false; vel.current = info.velocity.x; sfx.swipe(); }}
        >
          {[...ticks, ...ticks, ...ticks].map((t, i) => (
            <div key={i} className="panel-3d flex w-[164px] shrink-0 select-none items-center gap-2.5 !rounded-2xl p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black" style={{ color: t.col, background: `${t.col}20`, border: `1px solid ${t.col}55` }}>{t.g}</span>
              <div className="leading-tight">
                <p className="text-xs font-extrabold text-white">{t.s}</p>
                <p className="num-mono text-[11px] text-[#aebde6]">${t.p}</p>
                <p className={cn("num-mono text-[10px] font-extrabold", t.c >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{t.c >= 0 ? "▲" : "▼"} {Math.abs(t.c)}%</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Speed</span>
        {[0, 0.5, 1, 2, 4].map(s => (
          <button key={s} onClick={() => { setSpeed(s); sfx.tick(); }} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-extrabold", speed === s ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>{s === 0 ? "Stop" : `${s}×`}</button>
        ))}
        <span className="ml-auto text-[10px] text-[#54678f]">Бросай с инерцией →</span>
      </div>
    </div>
  );
}

/* ================= 4. STACK DECK ================= */
function StackDeck() {
  const [order, setOrder] = useState(courses.slice(0, 5).map((_, i) => i));
  const send = () => { setOrder(o => [...o.slice(1), o[0]]); sfx.whoosh(); };
  const back = () => { setOrder(o => [o[o.length - 1], ...o.slice(0, -1)]); sfx.swipe(); };
  return (
    <div>
      <div className="relative mx-auto h-[220px] w-full max-w-[250px]">
        {order.map((ci, pos) => {
          const c = courses[ci];
          const Icon = c.icon;
          const top = pos === 0;
          return (
            <motion.div
              key={ci}
              className="absolute inset-x-0 top-0 h-[190px] rounded-[24px] border border-white/20 p-4"
              style={{ background: `linear-gradient(160deg,${c.g[0]},${c.g[1]})`, zIndex: 10 - pos, boxShadow: `0 6px 0 ${c.g[1]}, 0 20px 40px -10px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.4)` }}
              animate={{ y: pos * 12, scale: 1 - pos * 0.06, opacity: pos > 3 ? 0 : 1, rotate: pos === 0 ? 0 : pos % 2 ? 2 : -2 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              drag={top ? true : false}
              dragSnapToOrigin
              whileDrag={{ scale: 1.05, rotate: 6 }}
              onDragEnd={(_, info) => { if (Math.hypot(info.offset.x, info.offset.y) > 90) send(); }}
            >
              <div className="flex items-center justify-between">
                <Icon size={26} className="text-white" />
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-extrabold text-white">#{ci + 1}</span>
              </div>
              <p className="display mt-6 text-lg font-extrabold text-white">{c.t}</p>
              <p className="text-[11px] text-white/75">{c.s}</p>
              {top && <p className="absolute bottom-3 left-4 text-[10px] font-bold uppercase tracking-widest text-white/70">↔ drag to shuffle</p>}
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-center gap-2">
        <button onClick={back} className="btn3d btn3d-ghost px-4 py-2.5 text-[11px]"><ChevronLeft size={14} /> Back</button>
        <button onClick={send} className="btn3d btn3d-violet px-4 py-2.5 text-[11px]">Next <ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

/* ================= 5. KEN BURNS PROMO FADE ================= */
function PromoFade() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [p, setP] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setP(v => {
      if (v >= 100) { setDir(1); setI(x => wrap(0, promos.length, x + 1)); return 0; }
      return v + 1.4;
    }), 50);
    return () => clearInterval(id);
  }, [paused]);
  const go = (d: number) => { setDir(d); setI(x => wrap(0, promos.length, x + d)); setP(0); sfx.swipe(); };
  const pr = promos[i];
  const Icon = pr.icon;
  return (
    <div
      className="relative h-[240px] overflow-hidden rounded-[22px] border border-white/15"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={i}
          custom={dir}
          className={cn("absolute inset-0 bg-gradient-to-br p-5", pr.g)}
          initial={{ opacity: 0, x: dir * 60, scale: 1.05 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -dir * 60, scale: 0.98 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => { if (info.offset.x < -50) go(1); else if (info.offset.x > 50) go(-1); }}
        >
          <motion.div
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full blur-2xl"
            style={{ background: pr.acc, opacity: 0.25 }}
            animate={{ scale: [1, 1.25, 1], x: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-4 right-4"
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
          >
            <motion.div animate={{ y: [0, -10, 0], rotate: [0, 6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Icon size={96} strokeWidth={1.3} style={{ color: pr.acc, filter: `drop-shadow(0 0 24px ${pr.acc})` }} />
            </motion.div>
          </motion.div>
          <div className="relative mt-5 max-w-[65%]">
            <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: pr.acc }}>Featured · {i + 1}/{promos.length}</motion.p>
            <motion.h4 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }} className="display mt-1 text-2xl font-extrabold leading-tight text-white">{pr.t}</motion.h4>
            <motion.p initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.26 }} className="mt-1 text-xs text-white/75">{pr.s}</motion.p>
            <motion.button initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.34 }} onClick={() => sfx.success()} className="btn3d btn3d-green mt-4 px-5 py-2.5 text-[11px]">{pr.cta}</motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute left-4 right-4 top-3 z-10 flex gap-1.5">
        {promos.map((_, k) => (
          <button key={k} onClick={() => { setI(k); setP(0); }} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full bg-white" style={{ width: k < i ? "100%" : k === i ? `${p}%` : "0%" }} />
          </button>
        ))}
      </div>
      {paused && <span className="absolute right-4 top-6 z-10 rounded-md bg-black/50 px-2 py-0.5 text-[9px] font-extrabold text-white">HOLD · PAUSED</span>}
    </div>
  );
}

/* ================= 6. WHEEL PICKER (iOS style) ================= */
function WheelColumn({ items, value, onChange, width = 90 }: { items: string[]; value: number; onChange: (i: number) => void; width?: number }) {
  const H = 38;
  const y = useMotionValue(-value * H);
  const sy = useSpring(y, { stiffness: 300, damping: 30 });
  const last = useRef(value);
  useEffect(() => { y.set(-value * H); }, [value, y]);
  useEffect(() => sy.on("change", v => {
    const i = clamp(Math.round(-v / H), 0, items.length - 1);
    if (i !== last.current) { last.current = i; sfx.tick(); }
  }), [sy, items.length]);
  return (
    <div
      className="relative h-[190px] overflow-hidden"
      style={{ width, maskImage: "linear-gradient(transparent, #000 30%, #000 70%, transparent)" }}
      onWheel={(e) => onChange(clamp(value + Math.sign(e.deltaY), 0, items.length - 1))}
    >
      <motion.div
        className="absolute inset-x-0 cursor-grab active:cursor-grabbing"
        style={{ y: sy, top: 76 }}
        drag="y"
        dragConstraints={{ top: -(items.length - 1) * H, bottom: 0 }}
        dragElastic={0.15}
        onDrag={(_, info) => y.set(-value * H + info.offset.y)}
        onDragEnd={(_, info) => {
          const proj = -value * H + info.offset.y + info.velocity.y * 0.15;
          onChange(clamp(Math.round(-proj / H), 0, items.length - 1));
        }}
      >
        {items.map((it, i) => (
          <WheelItem key={it} label={it} i={i} sy={sy} H={H} onClick={() => onChange(i)} />
        ))}
      </motion.div>
    </div>
  );
}
function WheelItem({ label, i, sy, H, onClick }: { label: string; i: number; sy: MotionValue<number>; H: number; onClick: () => void }) {
  const d = useTransform(sy, v => (v + i * H) / H);
  const rotateX = useTransform(d, [-3, 0, 3], [60, 0, -60]);
  const opacity = useTransform(d, [-3, 0, 3], [0.2, 1, 0.2]);
  const scale = useTransform(d, [-2, 0, 2], [0.8, 1.08, 0.8]);
  return (
    <motion.div onClick={onClick} style={{ height: H, rotateX, opacity, scale, transformPerspective: 400 }} className="num-mono flex items-center justify-center text-[17px] font-extrabold text-white">
      {label}
    </motion.div>
  );
}
function WheelPicker() {
  const [c, setC] = useState(0);
  const [t, setT] = useState(4);
  const [lev, setLev] = useState(9);
  const levs = ["1×", "2×", "3×", "5×", "10×", "15×", "20×", "25×", "50×", "75×", "100×"].map((v, i) => i === 9 ? v : v);
  return (
    <div>
      <div className="panel-inset relative flex items-center justify-center gap-1 !rounded-[22px] px-2">
        <div className="pointer-events-none absolute inset-x-3 top-1/2 h-[38px] -translate-y-1/2 rounded-xl border border-[#8ef23c]/40 bg-[#8ef23c]/8" />
        <WheelColumn items={pickerCoins} value={c} onChange={setC} />
        <WheelColumn items={pickerTf} value={t} onChange={setT} width={70} />
        <WheelColumn items={levs} value={lev} onChange={setLev} width={80} />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5">
        <span className="text-[11px] font-bold text-[#8ea6d8]">Selected</span>
        <motion.span key={`${c}${t}${lev}`} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="num-mono text-sm font-extrabold text-[#8ef23c]">
          {pickerCoins[c]} · {pickerTf[t]} · {levs[lev]}
        </motion.span>
      </div>
    </div>
  );
}

/* ================= 7. ROTARY CAROUSEL ================= */
function Rotary() {
  const rot = useMotionValue(0);
  const srot = useSpring(rot, { stiffness: 120, damping: 20 });
  const [sel, setSel] = useState(0);
  const step = 360 / leagues.length;
  const snap = (r: number) => {
    const s = Math.round(r / step) * step;
    rot.set(s);
    const i = wrap(0, leagues.length, Math.round(-s / step));
    setSel(i);
    sfx.tick();
  };
  const counter = useTransform(srot, v => -v);
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[230px] w-[230px]">
        <motion.div
          className="absolute inset-0 cursor-grab rounded-full border-2 border-dashed border-white/10 active:cursor-grabbing"
          style={{ rotate: srot }}
          onPan={(_, info) => rot.set(rot.get() + info.delta.x * 0.6)}
          onPanEnd={(_, info) => snap(rot.get() + info.velocity.x * 0.08)}
        >
          {leagues.map((l, i) => {
            const a = (i * step - 90) * (Math.PI / 180);
            return (
              <motion.button
                key={l.n}
                onClick={() => snap(-i * step)}
                className="absolute flex h-14 w-14 -ml-7 -mt-7 items-center justify-center rounded-2xl border-2"
                style={{ left: 115 + Math.cos(a) * 95, top: 115 + Math.sin(a) * 95, rotate: counter, borderColor: sel === i ? l.c : "rgba(255,255,255,.12)", background: `linear-gradient(180deg, ${l.c}40, ${l.c}10)`, boxShadow: sel === i ? `0 0 24px ${l.c}, 0 4px 0 #030816` : "0 4px 0 #030816" }}
                animate={{ scale: sel === i ? 1.15 : 0.9 }}
              >
                <Crown size={22} style={{ color: l.c }} />
              </motion.button>
            );
          })}
        </motion.div>
        <div className="pointer-events-none absolute inset-[52px] flex flex-col items-center justify-center rounded-full border border-white/15 bg-gradient-to-b from-[#1b3773] to-[#0a1740]" style={{ boxShadow: "inset 0 2px 0 rgba(255,255,255,.15), 0 10px 30px rgba(0,0,0,.5)" }}>
          <motion.div key={sel} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <Crown size={30} style={{ color: leagues[sel].c, filter: `drop-shadow(0 0 12px ${leagues[sel].c})` }} className="mx-auto" />
            <p className="display text-sm font-extrabold text-white">{leagues[sel].n}</p>
            <p className="text-[10px] font-bold text-[#8ea6d8]">League {sel + 1}/8</p>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[-6px] h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[12px] border-x-transparent border-t-[#8ef23c]" />
      </div>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#54678f]">Крути пальцем · snap к лиге</p>
    </div>
  );
}

/* ================= 8. THUMB GALLERY (layout) ================= */
const gallery = [
  { t: "Bull Skin", c: "#8ef23c", i: Flame, r: "Legendary" }, { t: "Bear Skin", c: "#ff5470", i: Swords, r: "Epic" },
  { t: "Whale Skin", c: "#5b8cff", i: Gem, r: "Rare" }, { t: "Satoshi Skin", c: "#ffc531", i: Sparkles, r: "Mythic" },
  { t: "Degen Skin", c: "#a78bff", i: Zap, r: "Epic" },
];
function ThumbGallery() {
  const [i, setI] = useState(0);
  const g = gallery[i];
  const Icon = g.i;
  return (
    <div>
      <Tilt className="rounded-[24px]" max={10}>
        <div className="relative flex h-[170px] items-center justify-center overflow-hidden rounded-[24px] border border-white/15" style={{ background: `radial-gradient(circle at 50% 40%, ${g.c}40, #081130 70%)` }}>
          <AnimatePresence mode="popLayout">
            <motion.div key={i} initial={{ scale: 0.3, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 1.6, opacity: 0 }} transition={{ type: "spring", stiffness: 200, damping: 16 }}>
              <Icon size={84} style={{ color: g.c, filter: `drop-shadow(0 0 30px ${g.c})` }} strokeWidth={1.6} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-3 left-4">
            <p className="display text-base font-extrabold text-white">{g.t}</p>
            <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: g.c }}>{g.r}</p>
          </div>
        </div>
      </Tilt>
      <div className="mt-3 flex gap-2">
        {gallery.map((it, k) => {
          const I = it.i;
          return (
            <button key={k} onClick={() => { setI(k); sfx.pop(); }} className="relative flex h-12 flex-1 items-center justify-center rounded-xl border border-white/10 bg-black/25">
              {k === i && <motion.span layoutId="thumbSel" className="absolute inset-0 rounded-xl border-2" style={{ borderColor: it.c, boxShadow: `0 0 14px ${it.c}66` }} />}
              <I size={18} style={{ color: it.c }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================= SECTION ================= */
export default function Carousels() {
  return (
    <SectionShell id="carousels" index="08" kicker="Carousels" title="8 видов каруселей" desc="Coverflow 3D, scroll-snap, бесконечная с инерцией, колода, промо с Ken Burns, iOS-пикер, ротор лиг и галерея скинов. Тяни, бросай, крути колесом."
      right={<div className="flex gap-2"><Tag tone="green">drag · fling</Tag><Tag tone="violet">keyboard ← →</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Card title="3D Coverflow · Courses" sub="Drag · клик по боковым · стрелки ← → · автоплей" action={<Tag tone="gold">auto</Tag>}>
          <Coverflow />
        </Card>
        <Card title="Promo Stories Banner" sub="Ken Burns · свайп · удерживай для паузы">
          <PromoFade />
        </Card>
      </div>
      <div className="mt-5">
        <Card title="Infinite Momentum Ticker" sub="Бросай ленту — она летит с инерцией и возвращается к авто-скорости" action={<Tag tone="blue">physics</Tag>}>
          <InfiniteDrag />
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Scroll-Snap" sub="Нативный snap + прогресс" className="md:col-span-2"><SnapCarousel /></Card>
        <Card title="Card Deck" sub="Тяни верхнюю карту"><StackDeck /></Card>
        <Card title="Skin Gallery" sub="Tilt + layout thumbs"><ThumbGallery /></Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Card title="Wheel Picker · Order Setup" sub="3 барабана · drag / колесо мыши · тики" action={<Tag tone="green">iOS-feel</Tag>}><WheelPicker /></Card>
        <Card title="Rotary League Carousel" sub="Круговая карусель со snap"><Rotary /></Card>
      </div>
    </SectionShell>
  );
}
