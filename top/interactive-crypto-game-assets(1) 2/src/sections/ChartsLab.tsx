/* ------------------------------------------------------------------
 * 14 · CHARTS LAB — animated, interactive data-viz
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, SectionShell, Tag } from "../components/ui";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

/* ---------- 1. DONUT PORTFOLIO ---------- */
const alloc = [
  { s: "BTC", v: 42, c: "#F7931A" }, { s: "ETH", v: 24, c: "#627EEA" }, { s: "SOL", v: 14, c: "#14F195" },
  { s: "USDT", v: 12, c: "#26A17B" }, { s: "TON", v: 8, c: "#0098EA" },
];
function Donut() {
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  const h = hover !== null ? alloc[hover] : null;
  return (
    <div ref={ref} className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[200px] w-[200px] shrink-0">
        <svg viewBox="0 0 200 200" className="-rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" stroke="#050b21" strokeWidth="26" />
          {alloc.map((a, i) => {
            const len = (a.v / 100) * C;
            const off = acc;
            acc += len;
            return (
              <motion.circle key={a.s} cx="100" cy="100" r={R} fill="none" stroke={a.c} strokeLinecap="butt"
                strokeDasharray={`${len - 3} ${C}`}
                initial={{ strokeDashoffset: C, strokeWidth: 26 }}
                animate={{ strokeDashoffset: inView ? -off : C, strokeWidth: hover === i ? 36 : 26, opacity: hover === null || hover === i ? 1 : 0.35 }}
                transition={{ strokeDashoffset: { duration: 1.2, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }, strokeWidth: { type: "spring", stiffness: 300 } }}
                onPointerEnter={() => { setHover(i); sfx.tick(); }} onPointerLeave={() => setHover(null)}
                style={{ cursor: "pointer", filter: hover === i ? `drop-shadow(0 0 10px ${a.c})` : undefined }} />
            );
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={h?.s ?? "total"} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} className="text-center">
              <p className="num-mono text-2xl font-extrabold" style={{ color: h?.c ?? "#fff" }}>{h ? `${h.v}%` : "$12.4K"}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">{h ? h.s : "Total"}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {alloc.map((a, i) => (
          <motion.div key={a.s} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} animate={{ x: hover === i ? 6 : 0 }}
            className={cn("flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition", hover === i ? "border-white/25 bg-white/8" : "border-white/8 bg-black/20")}>
            <span className="h-3 w-3 rounded-full" style={{ background: a.c, boxShadow: `0 0 8px ${a.c}` }} />
            <span className="flex-1 text-xs font-extrabold text-white">{a.s}</span>
            <span className="num-mono text-xs font-bold text-[#aebde6]">${((a.v / 100) * 12480).toFixed(0)}</span>
            <span className="num-mono w-9 text-right text-xs font-extrabold" style={{ color: a.c }}>{a.v}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 2. AREA CHART with tooltip ---------- */
function genSeries(n: number, vol: number) {
  const a: number[] = []; let v = 100;
  for (let i = 0; i < n; i++) { v += (Math.random() - 0.45) * vol; a.push(v); }
  return a;
}
function AreaChart() {
  const ranges = { "1D": 24, "1W": 42, "1M": 60, "1Y": 80 } as const;
  const [r, setR] = useState<keyof typeof ranges>("1W");
  const data = useMemo(() => genSeries(ranges[r], r === "1Y" ? 9 : 4), [r]);
  const [hi, setHi] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  const W = 600, H = 200;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, 10 + (1 - (v - min) / (max - min)) * (H - 30)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const up = data[data.length - 1] >= data[0];
  const col = up ? "#2ede8a" : "#ff5470";
  const chg = ((data[data.length - 1] - data[0]) / data[0]) * 100;
  return (
    <div ref={ref}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="num-mono text-2xl font-extrabold text-white">${(hi !== null ? data[hi] * 974 : data[data.length - 1] * 974).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
          <p className="num-mono text-xs font-extrabold" style={{ color: col }}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}% · {r}</p>
        </div>
        <div className="panel-inset flex p-1">
          {(Object.keys(ranges) as (keyof typeof ranges)[]).map(k => (
            <button key={k} onClick={() => { setR(k); sfx.tick(); }} className="relative px-3 py-1.5 text-[11px] font-extrabold">
              {r === k && <motion.span layoutId="areaRange" className="absolute inset-0 rounded-lg bg-[#5b8cff]" style={{ boxShadow: "0 2px 0 #1a2f7d" }} />}
              <span className={cn("relative", r === k ? "text-white" : "text-[#7d92c4]")}>{k}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="panel-inset relative p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onPointerLeave={() => setHi(null)}
          onPointerMove={(e) => { const b = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setHi(Math.round(((e.clientX - b.left) / b.width) * (data.length - 1))); }}>
          <defs>
            <linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".45" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map(g => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(122,156,255,.1)" strokeDasharray="4 6" />)}
          <motion.path key={`a${r}`} d={area} fill="url(#areaG)" initial={{ opacity: 0 }} animate={{ opacity: inView ? 1 : 0 }} transition={{ duration: 0.8, delay: 0.6 }} />
          <motion.path key={`l${r}`} d={line} fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: inView ? 1 : 0 }} transition={{ duration: 1.4, ease: "easeInOut" }} style={{ filter: `drop-shadow(0 0 6px ${col})` }} />
          {hi !== null && pts[hi] && (
            <g>
              <line x1={pts[hi][0]} x2={pts[hi][0]} y1="0" y2={H} stroke="#8ea6d8" strokeDasharray="4 4" />
              <circle cx={pts[hi][0]} cy={pts[hi][1]} r="7" fill={col} opacity=".3" />
              <circle cx={pts[hi][0]} cy={pts[hi][1]} r="4.5" fill="#fff" stroke={col} strokeWidth="2.5" />
            </g>
          )}
          <motion.circle cx={pts[pts.length - 1][0] - 2} cy={pts[pts.length - 1][1]} r="5" fill={col} animate={{ r: [4, 9, 4], opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
        </svg>
        {hi !== null && pts[hi] && (
          <div className="pointer-events-none absolute top-3 rounded-lg border border-white/15 bg-[#081130]/95 px-2.5 py-1.5 text-[10px] font-bold" style={{ left: `clamp(8px, calc(${(pts[hi][0] / W) * 100}% - 50px), calc(100% - 110px))` }}>
            <p className="num-mono text-white">${(data[hi] * 974).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
            <p className="text-[#7d92c4]">Point {hi + 1}/{data.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 3. GAUGE ---------- */
function Gauge() {
  const [v, setV] = useState(68);
  const sv = useSpring(v, { stiffness: 60, damping: 10 });
  useEffect(() => { sv.set(v); }, [v, sv]);
  const rot = useTransform(sv, [0, 100], [-90, 90]);
  const num = useTransform(sv, n => Math.round(n).toString());
  useEffect(() => { const id = setInterval(() => setV(x => Math.max(5, Math.min(95, x + (Math.random() - 0.5) * 14))), 2500); return () => clearInterval(id); }, []);
  const label = v < 25 ? "Extreme Fear" : v < 45 ? "Fear" : v < 55 ? "Neutral" : v < 75 ? "Greed" : "Extreme Greed";
  const col = v < 25 ? "#ff5470" : v < 45 ? "#ff8b3d" : v < 55 ? "#ffc531" : v < 75 ? "#a4ff5e" : "#2ede8a";
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[130px] w-[240px]">
        <svg viewBox="0 0 240 130" className="absolute inset-0">
          <defs><linearGradient id="gaugeG"><stop offset="0" stopColor="#ff5470" /><stop offset=".25" stopColor="#ff8b3d" /><stop offset=".5" stopColor="#ffc531" /><stop offset=".75" stopColor="#a4ff5e" /><stop offset="1" stopColor="#2ede8a" /></linearGradient></defs>
          <path d="M20,120 A100,100 0 0,1 220,120" fill="none" stroke="#050b21" strokeWidth="22" strokeLinecap="round" />
          <path d="M20,120 A100,100 0 0,1 220,120" fill="none" stroke="url(#gaugeG)" strokeWidth="16" strokeLinecap="round" />
          {Array.from({ length: 11 }, (_, i) => { const a = Math.PI - (i / 10) * Math.PI; return <line key={i} x1={120 + Math.cos(a) * 78} y1={120 - Math.sin(a) * 78} x2={120 + Math.cos(a) * 70} y2={120 - Math.sin(a) * 70} stroke="rgba(255,255,255,.4)" strokeWidth="2" />; })}
        </svg>
        <motion.div className="absolute bottom-[10px] left-1/2 h-[92px] w-1.5 -translate-x-1/2 rounded-full bg-white" style={{ rotate: rot, originY: 1, originX: 0.5, boxShadow: "0 0 10px rgba(255,255,255,.7)" }} />
        <div className="absolute bottom-0 left-1/2 h-6 w-6 -translate-x-1/2 translate-y-1/2 rounded-full border-4 border-white bg-[#081130]" />
      </div>
      <motion.p className="num-mono mt-5 text-3xl font-extrabold" style={{ color: col }}>{num}</motion.p>
      <p className="text-xs font-extrabold uppercase tracking-widest text-white">{label}</p>
      <div className="mt-2 flex gap-1.5">
        {[10, 35, 50, 70, 92].map(n => <button key={n} onClick={() => { setV(n); sfx.tick(); }} className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-extrabold text-[#8ea6d8] hover:bg-white/10">{n}</button>)}
      </div>
    </div>
  );
}

/* ---------- 4. HEATMAP TREEMAP ---------- */
const heat = [
  { s: "BTC", w: 4, h: 2 }, { s: "ETH", w: 2, h: 2 }, { s: "SOL", w: 2, h: 1 }, { s: "BNB", w: 1, h: 1 }, { s: "XRP", w: 1, h: 1 },
  { s: "DOGE", w: 2, h: 1 }, { s: "TON", w: 1, h: 1 }, { s: "ADA", w: 1, h: 1 }, { s: "AVAX", w: 1, h: 1 }, { s: "LINK", w: 1, h: 1 }, { s: "DOT", w: 2, h: 1 },
];
function Heatmap() {
  const [chg, setChg] = useState(() => heat.map(() => (Math.random() - 0.45) * 12));
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => { const id = setInterval(() => setChg(c => c.map(x => Math.max(-12, Math.min(12, x + (Math.random() - 0.5) * 1.6)))), 1500); return () => clearInterval(id); }, []);
  const color = (v: number) => v >= 0 ? `rgba(46,222,138,${0.2 + Math.min(1, v / 10) * 0.7})` : `rgba(255,84,112,${0.2 + Math.min(1, -v / 10) * 0.7})`;
  return (
    <div>
      <div className="grid grid-cols-8 gap-1.5" style={{ gridAutoRows: "54px" }}>
        {heat.map((h, i) => (
          <motion.button key={h.s} layout onClick={() => { setSel(sel === i ? null : i); sfx.pop(); }}
            whileHover={{ scale: 1.04, zIndex: 10 }} whileTap={{ scale: 0.95 }}
            animate={{ backgroundColor: color(chg[i]) }} transition={{ backgroundColor: { duration: 0.8 } }}
            className={cn("relative flex flex-col items-start justify-end overflow-hidden rounded-xl border p-2 text-left", sel === i ? "border-white" : "border-white/10")}
            style={{ gridColumn: `span ${h.w}`, gridRow: `span ${h.h}`, boxShadow: sel === i ? "0 0 20px rgba(255,255,255,.3)" : "inset 0 1px 0 rgba(255,255,255,.1)" }}>
            <span className={cn("font-extrabold text-white", h.w * h.h >= 4 ? "display text-xl" : "text-[11px]")}>{h.s}</span>
            <motion.span key={Math.round(chg[i] * 10)} initial={{ y: 4, opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} className={cn("num-mono font-bold text-white/90", h.w * h.h >= 4 ? "text-sm" : "text-[9px]")}>{chg[i] >= 0 ? "+" : ""}{chg[i].toFixed(2)}%</motion.span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {sel !== null && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2">
              <span className="text-xs font-extrabold text-white">{heat[sel].s} · 24h</span>
              <span className={cn("num-mono text-xs font-extrabold", chg[sel] >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{chg[sel] >= 0 ? "+" : ""}{chg[sel].toFixed(2)}%</span>
              <button onClick={() => sfx.long()} className="btn3d btn3d-long px-3 py-1.5 text-[10px]">Trade</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- 5. ACTIVITY RINGS ---------- */
function Rings() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [vals, setVals] = useState([0.82, 0.6, 0.45]);
  const rings = [{ l: "XP goal", c: "#8ef23c", r: 70 }, { l: "Lessons", c: "#5b8cff", r: 52 }, { l: "Trades", c: "#ff5470", r: 34 }];
  return (
    <div ref={ref} className="flex items-center gap-4">
      <svg viewBox="0 0 170 170" className="h-[170px] w-[170px] shrink-0 -rotate-90">
        {rings.map((r, i) => {
          const C = 2 * Math.PI * r.r;
          return (
            <g key={r.l}>
              <circle cx="85" cy="85" r={r.r} fill="none" stroke={r.c} strokeOpacity=".15" strokeWidth="14" />
              <motion.circle cx="85" cy="85" r={r.r} fill="none" stroke={r.c} strokeWidth="14" strokeLinecap="round" strokeDasharray={C}
                initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: inView ? C * (1 - vals[i]) : C }} transition={{ duration: 1.4, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }} style={{ filter: `drop-shadow(0 0 6px ${r.c})` }} />
            </g>
          );
        })}
      </svg>
      <div className="flex-1 space-y-2">
        {rings.map((r, i) => (
          <div key={r.l}>
            <div className="flex justify-between text-[11px] font-extrabold"><span style={{ color: r.c }}>{r.l}</span><span className="num-mono text-white">{Math.round(vals[i] * 100)}%</span></div>
            <button onClick={() => { setVals(v => v.map((x, k) => k === i ? Math.min(1, x + 0.1) : x)); sfx.coin(); }} className="mt-1 w-full rounded-lg bg-white/5 py-1 text-[10px] font-bold text-[#8ea6d8] hover:bg-white/10">+10%</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 6. BAR RACE ---------- */
const racers = [
  { n: "CryptoQueen", c: "#ff5470" }, { n: "Satoshi_Fan", c: "#5b8cff" }, { n: "YOU", c: "#8ef23c" },
  { n: "HodlMaster", c: "#ffc531" }, { n: "DegenHunter", c: "#a78bff" }, { n: "ChartWizard", c: "#2ede8a" },
];
function BarRace() {
  const [vals, setVals] = useState(() => racers.map(() => 200 + Math.random() * 300));
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setVals(v => v.map((x, i) => x + Math.random() * (i === 2 ? 70 : 55))), 900);
    return () => clearInterval(id);
  }, [running]);
  const order = racers.map((r, i) => ({ ...r, v: vals[i] })).sort((a, b) => b.v - a.v);
  const max = order[0].v;
  return (
    <div>
      <div className="relative space-y-1.5">
        {order.map((r, i) => (
          <motion.div key={r.n} layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex items-center gap-2">
            <span className={cn("num-mono w-5 text-xs font-black", i < 3 ? "text-[#ffc531]" : "text-[#54678f]")}>{i + 1}</span>
            <div className="relative h-8 flex-1 overflow-hidden rounded-xl bg-black/30">
              <motion.div className="absolute inset-y-0 left-0 rounded-xl" animate={{ width: `${(r.v / max) * 100}%` }} transition={{ type: "spring", stiffness: 80, damping: 20 }} style={{ background: `linear-gradient(90deg, ${r.c}55, ${r.c})`, boxShadow: `inset 0 1px 0 rgba(255,255,255,.3)` }} />
              <span className={cn("absolute inset-y-0 left-3 flex items-center text-[11px] font-extrabold", r.n === "YOU" ? "text-[#0a2210]" : "text-white")}>{r.n}</span>
              <span className="num-mono absolute inset-y-0 right-3 flex items-center text-[11px] font-extrabold text-white">{Math.round(r.v)}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <button onClick={() => setRunning(!running)} className={cn("btn3d mt-3 w-full py-2.5 text-[11px]", running ? "btn3d-ghost" : "btn3d-green")}>{running ? "Pause race" : "Resume race"}</button>
    </div>
  );
}

/* ---------- 7. DEPTH CHART ---------- */
function Depth() {
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(x => x + 1), 1200); return () => clearInterval(id); }, []);
  const bids = useMemo(() => { let a = 0; return Array.from({ length: 20 }, () => (a += Math.random() * 10 + 2)); }, [t]);
  const asks = useMemo(() => { let a = 0; return Array.from({ length: 20 }, () => (a += Math.random() * 10 + 2)); }, [t]);
  const max = Math.max(bids[19], asks[19]);
  const W = 300, H = 130;
  const bp = bids.map((v, i) => `${150 - (i / 19) * 150},${H - (v / max) * (H - 10)}`).join(" L");
  const ap = asks.map((v, i) => `${150 + (i / 19) * 150},${H - (v / max) * (H - 10)}`).join(" L");
  return (
    <div className="panel-inset p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <motion.path animate={{ d: `M150,${H} L${bp} L0,${H} Z` }} transition={{ duration: 0.8 }} fill="rgba(46,222,138,.25)" stroke="#2ede8a" strokeWidth="2" />
        <motion.path animate={{ d: `M150,${H} L${ap} L300,${H} Z` }} transition={{ duration: 0.8 }} fill="rgba(255,84,112,.25)" stroke="#ff5470" strokeWidth="2" />
        <line x1="150" x2="150" y1="0" y2={H} stroke="#fff" strokeDasharray="3 3" opacity=".4" />
        <text x="150" y="12" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">97,431</text>
      </svg>
      <div className="flex justify-between px-1 text-[10px] font-extrabold"><span className="text-[#2ede8a]">BIDS {bids[19].toFixed(0)} BTC</span><span className="text-[#ff5470]">ASKS {asks[19].toFixed(0)} BTC</span></div>
    </div>
  );
}

/* ================= SECTION ================= */
export default function ChartsLab() {
  return (
    <SectionShell id="charts" index="14" kicker="Charts Lab" title="Живая визуализация данных" desc="Графики рисуются при появлении в зоне видимости, реагируют на ховер и обновляются в реальном времени."
      right={<div className="flex gap-2"><Tag tone="green">draw-on-scroll</Tag><Tag tone="blue">live</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Portfolio Value" sub="Draw-on-view · hover tooltip · range switch" className="lg:col-span-2"><AreaChart /></Card>
        <Card title="Fear & Greed Index" sub="Пружинная стрелка · live"><Gauge /></Card>
        <Card title="Allocation Donut" sub="Hover для деталей" className="lg:col-span-2"><Donut /></Card>
        <Card title="Daily Rings" sub="Цели дня"><Rings /></Card>
        <Card title="Market Heatmap" sub="Живые цвета · тап по тайлу" className="lg:col-span-2"><Heatmap /></Card>
        <div className="flex flex-col gap-5">
          <Card title="League Bar Race" sub="Анимированная перестановка"><BarRace /></Card>
          <Card title="Depth Chart" sub="Morphing paths"><Depth /></Card>
        </div>
      </div>
    </SectionShell>
  );
}
