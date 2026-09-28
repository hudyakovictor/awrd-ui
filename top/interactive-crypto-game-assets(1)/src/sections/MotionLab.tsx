/* ------------------------------------------------------------------
 * 13 · MOTION LAB — micro-interactions & effects gallery
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell, Bookmark, Check, Copy, Gem, Heart, MessageCircle, Minus, Plus, Rocket, Share2, Star, ThumbsUp, TrendingUp, Trophy, Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Card, SectionShell, Tag } from "../components/ui";
import { Magnetic, Odometer, RippleButton, ScrambleText, ShineBorder, Spotlight, SplitText, Tilt, Typewriter, useBurst } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

/* ---------- 1. BURST BUTTONS ---------- */
function BurstIcon({ icon, color, label, count }: { icon: (on: boolean) => ReactNode; color: string; label: string; count: number }) {
  const [on, setOn] = useState(false);
  const [n, setN] = useState(count);
  const { fire, node } = useBurst();
  return (
    <div className="relative flex flex-col items-center gap-1">
      {node}
      <motion.button
        whileTap={{ scale: 0.75 }}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const pr = e.currentTarget.parentElement!.getBoundingClientRect();
          if (!on) fire(r.left - pr.left + r.width / 2, r.top - pr.top + r.height / 2, color);
          setOn(!on); setN(x => x + (on ? -1 : 1)); sfx.pop();
        }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border transition"
        style={{ borderColor: on ? color : "rgba(255,255,255,.12)", background: on ? `${color}22` : "rgba(0,0,0,.25)", boxShadow: on ? `0 0 20px ${color}66, 0 4px 0 #030816` : "0 4px 0 #030816" }}
      >
        <motion.span animate={on ? { scale: [1, 1.5, 0.9, 1.1, 1], rotate: [0, -15, 10, 0] } : { scale: 1 }} transition={{ duration: 0.5 }}>{icon(on)}</motion.span>
      </motion.button>
      <span className="num-mono text-[11px] font-extrabold text-white">{n}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider text-[#54678f]">{label}</span>
    </div>
  );
}
function Bursts() {
  return (
    <div className="grid grid-cols-4 gap-2">
      <BurstIcon label="Like" color="#ff5470" count={128} icon={(on) => <Heart size={24} className={on ? "fill-[#ff5470] text-[#ff5470]" : "text-[#8ea6d8]"} />} />
      <BurstIcon label="Star" color="#ffc531" count={42} icon={(on) => <Star size={24} className={on ? "fill-[#ffc531] text-[#ffc531]" : "text-[#8ea6d8]"} />} />
      <BurstIcon label="Save" color="#5b8cff" count={16} icon={(on) => <Bookmark size={24} className={on ? "fill-[#5b8cff] text-[#5b8cff]" : "text-[#8ea6d8]"} />} />
      <BurstIcon label="Hype" color="#8ef23c" count={301} icon={(on) => <Rocket size={24} className={on ? "fill-[#8ef23c]/40 text-[#8ef23c]" : "text-[#8ea6d8]"} />} />
    </div>
  );
}

/* ---------- 2. LOADERS GALLERY ---------- */
const loaders: { n: string; el: ReactNode }[] = [
  { n: "Candles", el: <div className="flex h-10 items-end gap-1">{[0, 1, 2, 3, 4].map(i => <motion.span key={i} className="w-2 rounded-sm" style={{ background: i % 2 ? "#ff5470" : "#2ede8a" }} animate={{ height: [10, 36, 16, 28, 10] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }} />)}</div> },
  { n: "Orbit", el: <div className="relative h-10 w-10">{[0, 1, 2].map(i => <motion.span key={i} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 1 + i * 0.4, repeat: Infinity, ease: "linear" }}><span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full" style={{ background: ["#8ef23c", "#5b8cff", "#ffc531"][i] }} /></motion.span>)}</div> },
  { n: "Pulse", el: <div className="relative h-10 w-10">{[0, 1, 2].map(i => <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-[#8ef23c]" animate={{ scale: [0.3, 1.3], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }} />)}</div> },
  { n: "Coin flip", el: <motion.div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ffc531] bg-[#ffc531]/20 text-lg font-black text-[#ffc531]" animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 1.2, repeat: Infinity }}>₿</motion.div> },
  { n: "Dots", el: <div className="flex gap-1.5">{[0, 1, 2].map(i => <motion.span key={i} className="h-3 w-3 rounded-full bg-[#5b8cff]" animate={{ y: [0, -12, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />)}</div> },
  { n: "Ring", el: <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#a78bff]/20 border-t-[#a78bff]" /> },
  { n: "Chart draw", el: <svg viewBox="0 0 60 30" className="h-10 w-16"><motion.path d="M2,25 L12,18 L20,22 L30,8 L40,14 L50,4 L58,10" fill="none" stroke="#2ede8a" strokeWidth="3" strokeLinecap="round" animate={{ pathLength: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity }} /></svg> },
  { n: "Blocks", el: <div className="grid grid-cols-3 gap-1">{Array.from({ length: 9 }, (_, i) => <motion.span key={i} className="h-2.5 w-2.5 rounded-[3px] bg-[#8ef23c]" animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }} transition={{ duration: 1.2, repeat: Infinity, delay: ((i % 3) + Math.floor(i / 3)) * 0.1 }} />)}</div> },
  { n: "Bar", el: <div className="h-3 w-16 overflow-hidden rounded-full bg-black/40"><motion.div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5b8cff]" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }} /></div> },
  { n: "Heartbeat", el: <svg viewBox="0 0 60 30" className="h-10 w-16"><motion.path d="M0,15 L15,15 L20,5 L25,25 L30,10 L35,15 L60,15" fill="none" stroke="#ff5470" strokeWidth="2.5" strokeDasharray="80" animate={{ strokeDashoffset: [80, 0, -80] }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} /></svg> },
  { n: "Morph", el: <motion.div className="h-8 w-8 bg-[#ffc531]" animate={{ borderRadius: ["20%", "50%", "20%"], rotate: [0, 180, 360], scale: [1, 0.7, 1] }} transition={{ duration: 1.6, repeat: Infinity }} /> },
  { n: "Gem spin", el: <motion.div animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }}><Gem size={30} className="text-[#5b8cff]" style={{ filter: "drop-shadow(0 0 10px #5b8cff)" }} /></motion.div> },
];
function Loaders() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {loaders.map(l => (
        <div key={l.n} className="panel-inset flex h-[88px] flex-col items-center justify-center gap-2 !rounded-2xl">
          {l.el}
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#7d92c4]">{l.n}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- 3. TEXT EFFECTS ---------- */
function TextFx() {
  const [k, setK] = useState(0);
  return (
    <div className="space-y-3">
      <div className="panel-inset p-3">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Split letters</p>
        <p key={k} className="display text-2xl font-extrabold text-white"><SplitText text="TO THE MOON" /></p>
      </div>
      <div className="panel-inset p-3">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Scramble (hover)</p>
        <ScrambleText key={k} text="WALLET 0x7F…A93C" className="text-lg font-extrabold text-[#8ef23c]" />
      </div>
      <div className="panel-inset p-3">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Typewriter</p>
        <p className="display text-lg font-extrabold text-white">Учись <Typewriter words={["свечам", "плечу", "стопам", "DeFi", "психологии"]} className="text-[#ffc531]" /></p>
      </div>
      <div className="panel-inset p-3">
        <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Gradient shimmer + glitch</p>
        <p className="display bg-[linear-gradient(90deg,#8ef23c,#5b8cff,#a78bff,#ffc531,#8ef23c)] bg-[length:200%_100%] bg-clip-text text-2xl font-extrabold text-transparent" style={{ animation: "shimmer 3s linear infinite" }}>LEGENDARY</p>
        <motion.p className="display relative text-xl font-extrabold text-white" animate={{ x: [0, -2, 2, 0, 0], textShadow: ["0 0 0 transparent", "2px 0 #ff5470, -2px 0 #5b8cff", "-2px 0 #ff5470, 2px 0 #5b8cff", "0 0 0 transparent", "0 0 0 transparent"] }} transition={{ duration: 1.8, repeat: Infinity, times: [0, 0.05, 0.1, 0.15, 1] }}>MARKET CRASH</motion.p>
      </div>
      <button onClick={() => { setK(x => x + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost w-full py-2.5 text-[11px]">Replay</button>
    </div>
  );
}

/* ---------- 4. ODOMETER / COUNTERS ---------- */
function Counters() {
  const [bal, setBal] = useState(12480.2);
  const [qty, setQty] = useState(3);
  return (
    <div className="space-y-4">
      <div className="panel-inset p-4 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Balance odometer</p>
        <Odometer value={bal} prefix="$" decimals={2} className="text-3xl font-extrabold text-white" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={() => { setBal(b => b + Math.random() * 900); sfx.coin(); }} className="btn3d btn3d-long py-2 text-[10px]">+ Win</button>
          <button onClick={() => { setBal(b => Math.max(0, b - Math.random() * 600)); sfx.error(); }} className="btn3d btn3d-short py-2 text-[10px]">− Loss</button>
          <button onClick={() => { setBal(99999.99); sfx.levelUp(); }} className="btn3d btn3d-gold py-2 text-[10px]">Moon</button>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 p-2">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setQty(q => Math.max(0, q - 1)); sfx.tick(); }} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><Minus size={16} /></motion.button>
        <div className="relative h-10 w-20 overflow-hidden text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={qty} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="num-mono absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-white">{qty}</motion.span>
          </AnimatePresence>
        </div>
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setQty(q => q + 1); sfx.tick(); }} className="btn3d btn3d-green h-10 w-10 !rounded-xl"><Plus size={16} /></motion.button>
      </div>
    </div>
  );
}

/* ---------- 5. MORPHING ICONS ---------- */
function MorphIcons() {
  const [menu, setMenu] = useState(false);
  const [play, setPlay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bell, setBell] = useState(false);
  return (
    <div className="grid grid-cols-4 gap-2">
      <button onClick={() => { setMenu(!menu); sfx.soft(); }} className="panel-inset flex h-16 flex-col items-center justify-center gap-1 !rounded-2xl">
        <div className="relative h-5 w-6">
          <motion.span className="absolute left-0 h-[3px] w-6 rounded-full bg-white" animate={menu ? { top: 9, rotate: 45 } : { top: 2, rotate: 0 }} />
          <motion.span className="absolute left-0 top-[9px] h-[3px] w-6 rounded-full bg-white" animate={{ opacity: menu ? 0 : 1, x: menu ? 10 : 0 }} />
          <motion.span className="absolute left-0 h-[3px] w-6 rounded-full bg-white" animate={menu ? { top: 9, rotate: -45 } : { top: 16, rotate: 0 }} />
        </div>
        <span className="text-[9px] font-bold text-[#7d92c4]">Menu</span>
      </button>
      <button onClick={() => { setPlay(!play); sfx.soft(); }} className="panel-inset flex h-16 flex-col items-center justify-center gap-1 !rounded-2xl">
        <svg viewBox="0 0 24 24" className="h-6 w-6">
          <motion.path fill="#8ef23c" animate={{ d: play ? "M6 5 L10 5 L10 19 L6 19 Z M14 5 L18 5 L18 19 L14 19 Z" : "M7 4 L19 12 L19 12 L7 20 Z M7 4 L7 4 L7 20 L7 20 Z" }} transition={{ duration: 0.3 }} />
        </svg>
        <span className="text-[9px] font-bold text-[#7d92c4]">{play ? "Pause" : "Play"}</span>
      </button>
      <button onClick={() => { setCopied(true); sfx.success(); setTimeout(() => setCopied(false), 1400); }} className="panel-inset flex h-16 flex-col items-center justify-center gap-1 !rounded-2xl">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? <motion.span key="c" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}><Check size={22} className="text-[#8ef23c]" strokeWidth={3} /></motion.span>
            : <motion.span key="p" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={20} className="text-white" /></motion.span>}
        </AnimatePresence>
        <span className="text-[9px] font-bold text-[#7d92c4]">{copied ? "Copied" : "Copy"}</span>
      </button>
      <button onClick={() => { setBell(!bell); sfx.pop(); }} className="panel-inset relative flex h-16 flex-col items-center justify-center gap-1 !rounded-2xl">
        <motion.span animate={bell ? { rotate: [0, -25, 25, -15, 15, 0] } : {}} transition={{ duration: 0.6 }} style={{ originY: 0 }}><Bell size={20} className={bell ? "fill-[#ffc531] text-[#ffc531]" : "text-white"} /></motion.span>
        <AnimatePresence>{bell && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute right-3 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff5470] text-[8px] font-black text-white">3</motion.span>}</AnimatePresence>
        <span className="text-[9px] font-bold text-[#7d92c4]">Alerts</span>
      </button>
    </div>
  );
}

/* ---------- 6. SPEED DIAL FAB ---------- */
function SpeedDial() {
  const [open, setOpen] = useState(false);
  const actions = [
    { i: TrendingUp, c: "#2ede8a", l: "Trade" }, { i: MessageCircle, c: "#5b8cff", l: "Chat" },
    { i: Share2, c: "#a78bff", l: "Share" }, { i: Trophy, c: "#ffc531", l: "Rank" }, { i: ThumbsUp, c: "#ff5470", l: "Rate" },
  ];
  return (
    <div className="relative flex h-[220px] items-end justify-center overflow-hidden rounded-[22px] border border-white/10 bg-black/20 pb-5">
      <AnimatePresence>
        {open && actions.map((a, i) => {
          const ang = Math.PI + (i / (actions.length - 1)) * Math.PI;
          return (
            <motion.button key={a.l} onClick={() => { sfx.tap(); setOpen(false); }}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ x: Math.cos(ang) * 105, y: Math.sin(ang) * 105, scale: 1, opacity: 1 }}
              exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.03 }}
              className="absolute bottom-6 flex flex-col items-center gap-1">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20" style={{ background: `linear-gradient(180deg, ${a.c}, ${a.c}aa)`, boxShadow: `0 4px 0 #030816, 0 0 16px ${a.c}66` }}><a.i size={20} className="text-[#081130]" /></span>
              <span className="text-[9px] font-extrabold text-white">{a.l}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
      <motion.button onClick={() => { setOpen(!open); sfx.pop(); }} animate={{ rotate: open ? 135 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} whileTap={{ scale: 0.9 }}
        className="relative z-10 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-b from-[#a4ff5e] to-[#4e9c14] text-[#0a2210]" style={{ boxShadow: "0 6px 0 #2c5c08, 0 12px 28px rgba(142,242,60,.4), inset 0 2px 0 rgba(255,255,255,.5)" }}>
        <Plus size={30} strokeWidth={3} />
      </motion.button>
    </div>
  );
}

/* ---------- 7. HOVER EFFECTS GRID ---------- */
function HoverGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Tilt className="rounded-[22px]">
        <div className="flex h-[130px] flex-col justify-between rounded-[22px] border border-white/15 bg-gradient-to-br from-[#2a4b8f] to-[#0e1f4a] p-4">
          <Zap size={24} className="text-[#ffc531]" />
          <div><p className="display text-sm font-extrabold text-white">3D Tilt + Glare</p><p className="text-[10px] text-[#8ea6d8]">Наведи и двигай</p></div>
        </div>
      </Tilt>
      <Spotlight className="border border-white/10 bg-[#0e1f4a]">
        <div className="flex h-[130px] flex-col justify-between p-4">
          <Star size={24} className="text-[#8ef23c]" />
          <div><p className="display text-sm font-extrabold text-white">Spotlight Border</p><p className="text-[10px] text-[#8ea6d8]">Свет за курсором</p></div>
        </div>
      </Spotlight>
      <ShineBorder>
        <div className="flex h-[126px] flex-col justify-between rounded-[22px] bg-[#0b1a42] p-4">
          <Trophy size={24} className="text-[#5b8cff]" />
          <div><p className="display text-sm font-extrabold text-white">Shine Border</p><p className="text-[10px] text-[#8ea6d8]">Conic sweep</p></div>
        </div>
      </ShineBorder>
      <div className="flex h-[130px] items-center justify-center rounded-[22px] border border-white/10 bg-black/20">
        <Magnetic strength={0.5}>
          <RippleButton className="btn3d btn3d-violet px-5 py-3 text-[11px]" sound="pop">Magnetic + Ripple</RippleButton>
        </Magnetic>
      </div>
    </div>
  );
}

/* ---------- 8. DRAWN CHECKLIST ---------- */
function Checklist() {
  const [items, setItems] = useState([{ t: "Поставить стоп-лосс", d: true }, { t: "Риск ≤ 2% депозита", d: false }, { t: "Проверить фандинг", d: false }, { t: "Записать сделку в журнал", d: false }]);
  const done = items.filter(i => i.d).length;
  return (
    <div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <motion.button key={it.t} layout onClick={() => { setItems(a => a.map((x, k) => k === i ? { ...x, d: !x.d } : x)); sfx[it.d ? "soft" : "success"](); }}
            className={cn("flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition", it.d ? "border-[#8ef23c]/40 bg-[#8ef23c]/8" : "border-white/10 bg-black/25")}>
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 transition", it.d ? "border-[#8ef23c] bg-[#8ef23c]" : "border-white/20")}>
              <svg viewBox="0 0 24 24" className="h-4 w-4"><motion.path d="M5 12 L10 17 L19 7" fill="none" stroke="#0a2210" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={false} animate={{ pathLength: it.d ? 1 : 0 }} transition={{ duration: 0.3 }} /></svg>
            </span>
            <span className={cn("relative text-xs font-bold", it.d ? "text-[#a4ff5e]" : "text-white")}>
              {it.t}
              <motion.span className="absolute left-0 top-1/2 h-[2px] bg-[#a4ff5e]" initial={false} animate={{ width: it.d ? "100%" : "0%" }} />
            </span>
          </motion.button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40"><motion.div className="h-full bg-[#8ef23c]" animate={{ width: `${(done / items.length) * 100}%` }} /></div>
        <span className="num-mono text-xs font-extrabold text-white">{done}/{items.length}</span>
      </div>
      <AnimatePresence>{done === items.length && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-center text-xs font-extrabold text-[#8ef23c]">✓ Сделка готова к входу</motion.p>}</AnimatePresence>
    </div>
  );
}

/* ---------- 9. SEGMENTED with sliding pill ---------- */
function Segmented() {
  const opts = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
  const [a, setA] = useState(2);
  const [b, setB] = useState(0);
  return (
    <div className="space-y-3">
      <div className="panel-inset flex p-1">
        {opts.map((o, i) => (
          <button key={o} onClick={() => { setA(i); sfx.tick(); }} className="relative flex-1 py-2 text-xs font-extrabold">
            {a === i && <motion.span layoutId="segPill" className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#a4ff5e] to-[#62c91d]" style={{ boxShadow: "0 3px 0 #3a7d0d" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
            <span className={cn("relative", a === i ? "text-[#0a2210]" : "text-[#8ea6d8]")}>{o}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-1 border-b border-white/10">
        {["Spot", "Futures", "Options", "Earn"].map((o, i) => (
          <button key={o} onClick={() => { setB(i); sfx.tick(); }} className={cn("relative px-3 pb-2.5 pt-1 text-xs font-extrabold", b === i ? "text-white" : "text-[#54678f]")}>
            {o}
            {b === i && <motion.span layoutId="underline" className="absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-[#5b8cff]" style={{ boxShadow: "0 0 10px #5b8cff" }} />}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={b} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs text-[#aebde6]">
          {["Спот — покупка актива напрямую, без плеча.", "Фьючерсы — контракты с плечом до ×100.", "Опционы — право, но не обязанность.", "Earn — пассивный доход на стейкинге."][b]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ================= SECTION ================= */
export default function MotionLab() {
  return (
    <SectionShell id="motion" index="13" kicker="Motion Lab" title="Микро-взаимодействия" desc="Burst-реакции, 12 лоадеров, текстовые эффекты, одометр, морфинг иконок, speed-dial, tilt/spotlight/shine/magnetic, SVG-чеклист и скользящие пилюли."
      right={<div className="flex gap-2"><Tag tone="green">60fps</Tag><Tag tone="violet">layoutId</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Burst Reactions" sub="Частицы при тапе"><Bursts /></Card>
        <Card title="Morphing Icons" sub="Menu↔X · Play↔Pause · Copy↔Check"><MorphIcons /></Card>
        <Card title="Segmented & Tabs" sub="Sliding pill · underline"><Segmented /></Card>
        <Card title="Loader Gallery" sub="12 состояний загрузки" className="lg:col-span-2"><Loaders /></Card>
        <Card title="Counters" sub="Odometer · stepper"><Counters /></Card>
        <Card title="Text Effects" sub="Split · scramble · type · glitch"><TextFx /></Card>
        <Card title="Hover Effects" sub="Tilt · spotlight · shine · magnetic"><HoverGrid /></Card>
        <div className="flex flex-col gap-5">
          <Card title="Speed Dial FAB" sub="Радиальное меню"><SpeedDial /></Card>
          <Card title="Pre-trade Checklist" sub="Рисованные галочки"><Checklist /></Card>
        </div>
      </div>
    </SectionShell>
  );
}

