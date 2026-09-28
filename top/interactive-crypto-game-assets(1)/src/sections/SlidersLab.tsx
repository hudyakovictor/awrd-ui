/* ------------------------------------------------------------------
 * 11 · SLIDERS LAB — every slider archetype, built from scratch
 * ------------------------------------------------------------------ */
import { animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPE } from "react";
import { Card, SectionShell, Tag } from "../components/ui";
import { clamp } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

/* ---------- helpers ---------- */
function usePointerTrack(onMove: (ratio: number) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const calc = (e: RPE<HTMLDivElement> | PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    onMove(clamp((e.clientX - r.left) / r.width, 0, 1));
  };
  const bind = {
    onPointerDown: (e: RPE<HTMLDivElement>) => { active.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); calc(e); },
    onPointerMove: (e: RPE<HTMLDivElement>) => { if (active.current) calc(e); },
    onPointerUp: () => { active.current = false; },
    onPointerCancel: () => { active.current = false; },
  };
  return { ref, bind };
}

const Thumb = ({ left, label, color = "#8ef23c", active }: { left: string; label?: string; color?: string; active?: boolean }) => (
  <motion.div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ left }} animate={{ scale: active ? 1.15 : 1 }}>
    {label && (
      <motion.div initial={false} animate={{ y: active ? -6 : 0, opacity: 1 }} className="num-mono absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-[#081130] px-2 py-1 text-[10px] font-extrabold text-white" style={{ boxShadow: "0 3px 0 #030816" }}>
        {label}
      </motion.div>
    )}
    <div className="h-7 w-7 rounded-full border-2 border-white/60" style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${color} 55%, ${color}aa)`, boxShadow: `0 4px 0 #030816, 0 0 16px ${color}88` }} />
  </motion.div>
);

/* ---------- 1. DUAL RANGE + HISTOGRAM ---------- */
function DualRange() {
  const MIN = 80000, MAX = 110000;
  const [lo, setLo] = useState(0.3);
  const [hi, setHi] = useState(0.72);
  const [drag, setDrag] = useState<"lo" | "hi" | null>(null);
  const bars = useMemo(() => Array.from({ length: 40 }, (_, i) => 15 + Math.abs(Math.sin(i * 0.45) * 60) + Math.random() * 25), []);
  const { ref, bind } = usePointerTrack((r) => {
    const which = drag ?? (Math.abs(r - lo) < Math.abs(r - hi) ? "lo" : "hi");
    if (!drag) setDrag(which);
    if (which === "lo") setLo(Math.min(r, hi - 0.05));
    else setHi(Math.max(r, lo + 0.05));
    sfx.tick();
  });
  const val = (r: number) => Math.round(MIN + r * (MAX - MIN));
  return (
    <div>
      <div className="flex h-20 items-end gap-[3px] px-3">
        {bars.map((h, i) => {
          const r = i / bars.length;
          const inR = r >= lo && r <= hi;
          return <motion.div key={i} className="flex-1 rounded-t-sm" animate={{ height: `${h}%`, backgroundColor: inR ? "#8ef23c" : "#1a356d", opacity: inR ? 1 : 0.6 }} transition={{ duration: 0.2 }} />;
        })}
      </div>
      <div ref={ref} {...bind} onPointerUp={() => { bind.onPointerUp(); setDrag(null); }} className="relative mx-3 h-10 cursor-pointer touch-none">
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#050b21]" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.7)" }} />
        <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#8ef23c] to-[#5cbf1c]" style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%`, boxShadow: "0 0 12px rgba(142,242,60,.5)" }} />
        <Thumb left={`${lo * 100}%`} label={`$${(val(lo) / 1000).toFixed(1)}K`} active={drag === "lo"} />
        <Thumb left={`${hi * 100}%`} label={`$${(val(hi) / 1000).toFixed(1)}K`} active={drag === "hi"} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="panel-inset px-3 py-2"><p className="text-[10px] font-bold uppercase text-[#7d92c4]">Buy zone from</p><p className="num-mono text-sm font-extrabold text-white">${val(lo).toLocaleString()}</p></div>
        <div className="panel-inset px-3 py-2"><p className="text-[10px] font-bold uppercase text-[#7d92c4]">to</p><p className="num-mono text-sm font-extrabold text-white">${val(hi).toLocaleString()}</p></div>
      </div>
    </div>
  );
}

/* ---------- 2. STEPPED SNAP SLIDER ---------- */
const steps = [0.5, 1, 2, 3, 5];
function Stepped() {
  const [i, setI] = useState(1);
  const [dragging, setDragging] = useState(false);
  const { ref, bind } = usePointerTrack((r) => {
    const n = Math.round(r * (steps.length - 1));
    setI(prev => { if (prev !== n) sfx.tick(); return n; });
  });
  const pct = (i / (steps.length - 1)) * 100;
  const tone = i <= 1 ? "#8ef23c" : i <= 2 ? "#ffc531" : "#ff5470";
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Risk per trade</span>
        <motion.span key={i} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="num-mono text-2xl font-extrabold" style={{ color: tone }}>{steps[i]}%</motion.span>
      </div>
      <div ref={ref} {...bind} onPointerDown={(e) => { setDragging(true); bind.onPointerDown(e); }} onPointerUp={() => { setDragging(false); bind.onPointerUp(); }} className="relative h-10 cursor-pointer touch-none">
        <div className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#050b21]" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.7)" }} />
        <motion.div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full" animate={{ width: `${pct}%`, backgroundColor: tone }} transition={{ type: "spring", stiffness: 300, damping: 26 }} />
        {steps.map((_, k) => (
          <span key={k} className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ left: `${(k / (steps.length - 1)) * 100}%`, borderColor: k <= i ? tone : "#1a356d", background: k <= i ? tone : "#081130" }} />
        ))}
        <motion.div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" animate={{ left: `${pct}%`, scale: dragging ? 1.2 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 26 }}>
          <div className="h-8 w-8 rounded-full border-2 border-white/70" style={{ background: `radial-gradient(circle at 35% 30%, #fff, ${tone})`, boxShadow: `0 4px 0 #030816, 0 0 18px ${tone}` }} />
        </motion.div>
      </div>
      <div className="mt-1 flex justify-between">
        {steps.map((s, k) => <button key={s} onClick={() => { setI(k); sfx.tick(); }} className={cn("num-mono text-[11px] font-extrabold", k === i ? "text-white" : "text-[#54678f]")}>{s}%</button>)}
      </div>
      <p className="mt-2 text-[11px] text-[#8ea6d8]">{i <= 1 ? "✓ Профессиональный риск-менеджмент" : i === 2 ? "⚠ Агрессивно, но допустимо" : "✕ Слишком высокий риск для депозита"}</p>
    </div>
  );
}

/* ---------- 3. ROTARY KNOB ---------- */
function Knob() {
  const [v, setV] = useState(0.2);
  const ref = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startV = useRef(0);
  const angle = -135 + v * 270;
  const lev = Math.max(1, Math.round(v * 100));
  const onDown = (e: RPE<HTMLDivElement>) => { startY.current = e.clientY; startV.current = v; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: RPE<HTMLDivElement>) => {
    if (!(e.buttons & 1)) return;
    const nv = clamp(startV.current + (startY.current - e.clientY) / 200, 0, 1);
    if (Math.round(nv * 100) !== Math.round(v * 100) && Math.round(nv * 100) % 5 === 0) sfx.tick();
    setV(nv);
  };
  const col = lev > 50 ? "#ff5470" : lev > 20 ? "#ffc531" : "#8ef23c";
  const arcLen = 2 * Math.PI * 70 * 0.75;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 180 180" className="absolute inset-0 rotate-[135deg]">
          <circle cx="90" cy="90" r="70" fill="none" stroke="#050b21" strokeWidth="12" strokeDasharray={`${arcLen} 999`} strokeLinecap="round" />
          <motion.circle cx="90" cy="90" r="70" fill="none" stroke={col} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${arcLen * v} 999`} style={{ filter: `drop-shadow(0 0 8px ${col})` }} />
        </svg>
        {Array.from({ length: 28 }, (_, i) => {
          const a = (-135 + (i / 27) * 270) * (Math.PI / 180);
          return <span key={i} className="absolute h-2 w-[2px] rounded-full" style={{ left: 90 + Math.sin(a) * 86 - 1, top: 90 - Math.cos(a) * 86 - 4, transform: `rotate(${-135 + (i / 27) * 270}deg)`, background: i / 27 <= v ? col : "#1a356d" }} />;
        })}
        <div ref={ref} onPointerDown={onDown} onPointerMove={onMove} onWheel={(e) => setV(x => clamp(x - e.deltaY / 1500, 0, 1))}
          className="absolute inset-[34px] cursor-ns-resize touch-none rounded-full border border-white/20"
          style={{ background: "radial-gradient(circle at 35% 30%, #35589f, #122657 60%, #081130)", boxShadow: "0 8px 0 #030816, 0 14px 30px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.25)", transform: `rotate(${angle}deg)` }}>
          <span className="absolute left-1/2 top-2 h-5 w-1.5 -translate-x-1/2 rounded-full" style={{ background: col, boxShadow: `0 0 10px ${col}` }} />
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="num-mono text-2xl font-extrabold text-white">×{lev}</span>
        </div>
      </div>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#54678f]">Тяни вверх/вниз · колесо</p>
      <div className="mt-2 flex gap-1.5">
        {[1, 10, 25, 50, 100].map(n => <button key={n} onClick={() => { animate(v, n / 100, { onUpdate: setV, type: "spring", stiffness: 200, damping: 20 }); sfx.tick(); }} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-extrabold text-[#8ea6d8] hover:bg-white/10">×{n}</button>)}
      </div>
    </div>
  );
}

/* ---------- 4. VERTICAL FADERS (allocation mixer) ---------- */
const faderCoins = [
  { s: "BTC", c: "#F7931A" }, { s: "ETH", c: "#627EEA" }, { s: "SOL", c: "#14F195" }, { s: "USDT", c: "#26A17B" }, { s: "TON", c: "#0098EA" },
];
function Fader({ v, set, c, s }: { v: number; set: (n: number) => void; c: string; s: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: RPE<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    set(clamp(1 - (e.clientY - r.top) / r.height, 0, 1));
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="num-mono text-[11px] font-extrabold text-white">{Math.round(v * 100)}</span>
      <div ref={ref} className="relative h-[150px] w-9 cursor-ns-resize touch-none rounded-full bg-[#050b21]" style={{ boxShadow: "inset 0 3px 8px rgba(0,0,0,.8)" }}
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e); sfx.tick(); }}
        onPointerMove={(e) => { if (e.buttons & 1) move(e); }}>
        <motion.div className="absolute inset-x-1 bottom-1 rounded-full" animate={{ height: `calc(${v * 100}% - 8px)` }} transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{ background: `linear-gradient(0deg, ${c}66, ${c})`, boxShadow: `0 0 14px ${c}66` }} />
        {Array.from({ length: 10 }, (_, i) => (
          <motion.span key={i} className="absolute left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full" style={{ bottom: `${8 + i * 9.5}%` }} animate={{ backgroundColor: i / 10 < v ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.08)" }} />
        ))}
        <motion.div className="absolute left-1/2 h-4 w-12 -translate-x-1/2 rounded-md border border-white/40" animate={{ bottom: `calc(${v * 100}% - 8px)` }} transition={{ type: "spring", stiffness: 400, damping: 30 }} style={{ background: "linear-gradient(180deg,#e8eefc,#8ea6d8)", boxShadow: "0 3px 0 #030816" }} />
      </div>
      <span className="text-[10px] font-extrabold" style={{ color: c }}>{s}</span>
    </div>
  );
}
function Faders() {
  const [vals, setVals] = useState([0.5, 0.3, 0.15, 0.4, 0.1]);
  const total = vals.reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="flex justify-between px-2">
        {faderCoins.map((c, i) => <Fader key={c.s} {...c} v={vals[i]} set={(n) => setVals(vs => vs.map((x, k) => k === i ? n : x))} />)}
      </div>
      <div className="mt-4 flex h-4 overflow-hidden rounded-full border border-white/10">
        {faderCoins.map((c, i) => <motion.div key={c.s} animate={{ width: `${(vals[i] / total) * 100}%` }} style={{ background: c.c }} />)}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-bold text-[#8ea6d8]">
        {faderCoins.map((c, i) => <span key={c.s}>{c.s} {Math.round((vals[i] / total) * 100)}%</span>)}
      </div>
    </div>
  );
}

/* ---------- 5. FEAR & GREED SENTIMENT ---------- */
const moods = [
  { at: 0, e: "😱", l: "Extreme Fear", c: "#ff5470" }, { at: 0.25, e: "😟", l: "Fear", c: "#ff8b3d" },
  { at: 0.5, e: "😐", l: "Neutral", c: "#ffc531" }, { at: 0.75, e: "😏", l: "Greed", c: "#a4ff5e" }, { at: 1, e: "🤑", l: "Extreme Greed", c: "#2ede8a" },
];
function FearGreed() {
  const [v, setV] = useState(0.62);
  const [act, setAct] = useState(false);
  const { ref, bind } = usePointerTrack((r) => setV(r));
  const m = moods.reduce((a, b) => (Math.abs(b.at - v) < Math.abs(a.at - v) ? b : a));
  const prev = useRef(m.l);
  useEffect(() => { if (prev.current !== m.l) { sfx.pop(); prev.current = m.l; } }, [m.l]);
  return (
    <div>
      <div className="flex items-center gap-4">
        <motion.div key={m.e} initial={{ scale: 0.3, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl" style={{ background: `${m.c}22`, border: `2px solid ${m.c}66`, boxShadow: `0 0 24px ${m.c}55` }}>
          {m.e}
        </motion.div>
        <div>
          <p className="num-mono text-3xl font-extrabold" style={{ color: m.c }}>{Math.round(v * 100)}</p>
          <p className="text-xs font-extrabold uppercase tracking-widest text-white">{m.l}</p>
        </div>
      </div>
      <div ref={ref} {...bind} onPointerDown={(e) => { setAct(true); bind.onPointerDown(e); }} onPointerUp={() => { setAct(false); bind.onPointerUp(); }} className="relative mt-4 h-12 cursor-pointer touch-none">
        <div className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full" style={{ background: "linear-gradient(90deg,#ff5470,#ff8b3d,#ffc531,#a4ff5e,#2ede8a)", boxShadow: "inset 0 2px 4px rgba(0,0,0,.4), 0 2px 0 rgba(255,255,255,.1)" }} />
        <motion.div className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: `${v * 100}%` }} animate={{ scale: act ? 1.25 : 1 }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white text-lg" style={{ background: m.c, boxShadow: `0 4px 0 #030816, 0 0 20px ${m.c}` }}>{m.e}</div>
        </motion.div>
      </div>
      <div className="flex justify-between text-[10px] font-bold text-[#7d92c4]"><span>Fear</span><span>Neutral</span><span>Greed</span></div>
      <p className="mt-2 rounded-xl border border-white/10 bg-black/25 p-2.5 text-[11px] text-[#aebde6]">
        💡 {v < 0.3 ? "«Покупай, когда на улицах кровь» — возможности для долгосрока." : v > 0.7 ? "Рынок перегрет — фиксируй прибыль частями." : "Рынок в балансе — следуй своей стратегии."}
      </p>
    </div>
  );
}

/* ---------- 6. BEFORE / AFTER COMPARE ---------- */
function BeforeAfter() {
  const [v, setV] = useState(0.5);
  const { ref, bind } = usePointerTrack((r) => setV(r));
  const path = "M0,110 C20,100 30,70 50,80 C70,90 80,50 100,55 C120,60 130,30 150,40 C170,50 180,80 200,70 C220,60 230,30 250,25 C270,20 280,50 300,45";
  return (
    <div ref={ref} {...bind} className="relative h-[180px] cursor-ew-resize touch-none select-none overflow-hidden rounded-[20px] border border-white/15">
      <div className="absolute inset-0 bg-[#081130] p-3">
        <svg viewBox="0 0 300 130" className="h-full w-full">
          <path d={path} fill="none" stroke="#5b6d9e" strokeWidth="2.5" />
        </svg>
        <span className="absolute bottom-2 right-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-extrabold text-[#8ea6d8]">RAW CHART</span>
      </div>
      <div className="absolute inset-0 bg-[#0a1a3a] p-3" style={{ clipPath: `inset(0 ${100 - v * 100}% 0 0)` }}>
        <svg viewBox="0 0 300 130" className="h-full w-full">
          <rect x="0" y="20" width="300" height="20" fill="#ff5470" opacity=".12" />
          <rect x="0" y="95" width="300" height="20" fill="#2ede8a" opacity=".12" />
          <line x1="0" x2="300" y1="30" y2="30" stroke="#ff5470" strokeDasharray="5 4" />
          <line x1="0" x2="300" y1="105" y2="105" stroke="#2ede8a" strokeDasharray="5 4" />
          <path d="M0,100 C60,85 120,60 180,55 C240,50 270,35 300,30" fill="none" stroke="#ffc531" strokeWidth="2" opacity=".8" />
          <path d={path} fill="none" stroke="#8ef23c" strokeWidth="3" />
          <circle cx="100" cy="55" r="5" fill="#2ede8a" /><circle cx="250" cy="25" r="5" fill="#ff5470" />
        </svg>
        <span className="absolute bottom-2 left-3 rounded-md bg-[#8ef23c]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#8ef23c]">WITH TRADELINGO</span>
      </div>
      <div className="absolute inset-y-0 z-10 w-1 -translate-x-1/2 bg-white" style={{ left: `${v * 100}%`, boxShadow: "0 0 14px rgba(255,255,255,.8)" }}>
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#8ef23c] text-sm font-black text-[#0a2210]" style={{ boxShadow: "0 4px 0 #3a7d0d" }}>⇆</div>
      </div>
    </div>
  );
}

/* ---------- 7. ELASTIC VOLUME ---------- */
function Elastic() {
  const [v, setV] = useState(0.6);
  const over = useMotionValue(0);
  const sOver = useSpring(over, { stiffness: 400, damping: 12 });
  const scaleX = useTransform(sOver, [-60, 0, 60], [1.12, 1, 1.12]);
  const scaleY = useTransform(sOver, [-60, 0, 60], [0.7, 1, 0.7]);
  const originX = useTransform(sOver, v2 => (v2 < 0 ? 1 : 0));
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: RPE<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const raw = (e.clientX - r.left) / r.width;
    setV(clamp(raw, 0, 1));
    if (raw < 0) over.set(Math.max(-60, raw * r.width * 0.5));
    else if (raw > 1) over.set(Math.min(60, (raw - 1) * r.width * 0.5));
    else over.set(0);
  };
  const Icon = v === 0 ? VolumeX : v < 0.5 ? Volume1 : Volume2;
  return (
    <div className="flex items-center gap-3">
      <motion.button whileTap={{ scale: 0.8 }} onClick={() => setV(v > 0 ? 0 : 0.6)} className="text-[#8ea6d8]"><Icon size={20} /></motion.button>
      <motion.div ref={ref} style={{ scaleX, scaleY, originX }} className="relative h-4 flex-1 cursor-pointer touch-none rounded-full bg-[#050b21]"
        onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); move(e); }}
        onPointerMove={(e) => { if (e.buttons & 1) move(e); }}
        onPointerUp={() => over.set(0)}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#5b8cff] to-[#a78bff]" style={{ width: `${v * 100}%`, boxShadow: "0 0 12px rgba(167,139,255,.6)" }} />
      </motion.div>
      <span className="num-mono w-8 text-right text-xs font-extrabold text-white">{Math.round(v * 100)}</span>
    </div>
  );
}

/* ---------- 8. CIRCULAR ARC (DCA) ---------- */
function ArcSlider() {
  const [v, setV] = useState(0.35);
  const ref = useRef<SVGSVGElement>(null);
  const move = (e: RPE<SVGSVGElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let a = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90;
    if (a < 0) a += 360;
    const nv = a / 360;
    if (Math.abs(nv - v) > 0.5) return;
    setV(nv);
    if (Math.random() > 0.6) sfx.tick();
  };
  const amt = Math.round(10 + v * 990);
  const a = v * 2 * Math.PI - Math.PI / 2;
  const R = 70;
  return (
    <div className="flex flex-col items-center">
      <svg ref={ref} viewBox="0 0 180 180" className="h-[180px] w-[180px] cursor-pointer touch-none"
        onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); move(e); }} onPointerMove={(e) => { if (e.buttons & 1) move(e); }}>
        <defs><linearGradient id="arcg" x1="0" x2="1"><stop offset="0" stopColor="#ffc531" /><stop offset="1" stopColor="#ff8b3d" /></linearGradient></defs>
        <circle cx="90" cy="90" r={R} fill="none" stroke="#050b21" strokeWidth="16" />
        <circle cx="90" cy="90" r={R} fill="none" stroke="url(#arcg)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * R * v} 999`} transform="rotate(-90 90 90)" style={{ filter: "drop-shadow(0 0 8px #ffc531)" }} />
        <circle cx={90 + Math.cos(a) * R} cy={90 + Math.sin(a) * R} r="13" fill="#fff" stroke="#ffc531" strokeWidth="4" style={{ filter: "drop-shadow(0 3px 0 #030816)" }} />
        <text x="90" y="86" textAnchor="middle" className="num-mono" fill="#fff" fontSize="24" fontWeight="800">${amt}</text>
        <text x="90" y="106" textAnchor="middle" fill="#8ea6d8" fontSize="10" fontWeight="700">PER WEEK</text>
      </svg>
      <p className="text-[11px] text-[#aebde6]">За год: <b className="num-mono text-[#ffc531]">${(amt * 52).toLocaleString()}</b> в DCA</p>
    </div>
  );
}

/* ================= SECTION ================= */
export default function SlidersLab() {
  return (
    <SectionShell id="sliders" index="11" kicker="Sliders Lab" title="8 видов слайдеров" desc="Двойной с гистограммой, шаговый со снапом, поворотная ручка, микшер-фейдеры, Fear & Greed с эмоциями, до/после, эластичный и круговой."
      right={<div className="flex gap-2"><Tag tone="green">pointer events</Tag><Tag tone="gold">tick sfx</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Dual Range · Buy Zone" sub="Два бегунка + живая гистограмма" className="lg:col-span-2"><DualRange /></Card>
        <Card title="Stepped · Risk %" sub="Snap к шагам"><Stepped /></Card>
        <Card title="Rotary Knob · Leverage" sub="Аналоговая ручка"><Knob /></Card>
        <Card title="Allocation Mixer" sub="5 вертикальных фейдеров"><Faders /></Card>
        <Card title="Fear & Greed" sub="Эмоциональный слайдер"><FearGreed /></Card>
        <Card title="Before / After" sub="Тяни разделитель" className="lg:col-span-2"><BeforeAfter /></Card>
        <Card title="Elastic + Arc" sub="Резинка за краем · круговой DCA">
          <Elastic />
          <div className="mt-4"><ArcSlider /></div>
        </Card>
      </div>
    </SectionShell>
  );
}
