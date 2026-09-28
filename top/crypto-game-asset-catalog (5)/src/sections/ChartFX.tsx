import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { clamp } from "../hooks/motion";

/* ============ helpers ============ */
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
function useLiveSeries(n: number, vol: number, ms: number, start = 100) {
  const [s, setS] = useState<number[]>(() => { let p = start; const a: number[] = []; for (let i = 0; i < n; i++) { p *= 1 + (Math.random() - 0.5) * vol; a.push(p); } return a; });
  const [run, setRun] = useState(true);
  useEffect(() => {
    if (!run) return;
    const h = setInterval(() => setS((a) => [...a.slice(1), a[a.length - 1] * (1 + (Math.random() - 0.49) * vol)]), ms);
    return () => clearInterval(h);
  }, [run, vol, ms]);
  return { s, run, setRun };
}
function Axis({ h, max, min }: { h: number; max: number; min: number }) {
  return (
    <div className="absolute inset-y-0 right-1 flex flex-col justify-between py-1 pointer-events-none">
      {[max, (max + min) / 2, min].map((v, i) => <span key={i} className="num text-[9px] text-dim font-bold" style={{ height: h / 3 }}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}</span>)}
    </div>
  );
}

/* ============ 1. LIVE AREA CHART ============ */
function LiveArea() {
  const { s, run, setRun } = useLiveSeries(60, 0.02, 500);
  const [hov, setHov] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const W = 600, H = 180;
  const mx = Math.max(...s), mn = Math.min(...s);
  const pts = s.map((v, i) => `${(i / (s.length - 1)) * W},${8 + ((mx - v) / (mx - mn || 1)) * (H - 16)}`).join(" ");
  const last = s[s.length - 1], ch = ((last - s[0]) / s[0]) * 100;
  const up = ch >= 0;
  const col = up ? "#1fdb8b" : "#ff4d6a";
  return (
    <Asset title="Live Area Chart" id="chf.area" desc="Живая цена с градиентной заливкой, пульсом последней точки и кроссхейром по наведению." className="lg:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Badge tone={up ? "bull" : "bear"} dot>Live</Badge><span className="num font-extrabold text-[18px]">${last.toLocaleString("en", { maximumFractionDigits: 2 })}</span><span className={cn("num text-[12px] font-extrabold", up ? "text-bull" : "text-bear")}>{up ? "+" : ""}{ch.toFixed(2)}%</span></div>
        <Btn3D size="xs" variant={run ? "neutral" : "bull"} onClick={() => setRun(!run)}>{run ? "Pause" : "Resume"}</Btn3D>
      </div>
      <div ref={ref} className="relative inset !rounded-2xl p-2"
        onPointerMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (!r) return; setHov(clamp(Math.round(((e.clientX - r.left - 8) / (r.width - 16)) * (s.length - 1)), 0, s.length - 1)); }}
        onPointerLeave={() => setHov(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="la-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".4" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient>
            <linearGradient id="la-l" x1="0" x2="1"><stop offset="0" stopColor={col} stopOpacity=".4" /><stop offset="1" stopColor={col} /></linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(140,170,255,.07)" />)}
          <polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#la-f)" />
          <polyline points={pts} fill="none" stroke="url(#la-l)" strokeWidth="2.4" strokeLinejoin="round" />
          {hov !== null && <>
            <line x1={(hov / (s.length - 1)) * W} x2={(hov / (s.length - 1)) * W} y1="0" y2={H} stroke="rgba(255,255,255,.3)" strokeDasharray="3 3" />
            <circle cx={(hov / (s.length - 1)) * W} cy={8 + ((mx - s[hov]) / (mx - mn || 1)) * (H - 16)} r="5" fill="#fff" stroke={col} strokeWidth="2.5" />
          </>}
          <circle cx={W - 2} cy={8 + ((mx - last) / (mx - mn || 1)) * (H - 16)} r="5" fill={col} opacity=".3"><animate attributeName="r" values="4;9;4" dur="1.6s" repeatCount="indefinite" /></circle>
          <circle cx={W - 2} cy={8 + ((mx - last) / (mx - mn || 1)) * (H - 16)} r="3.5" fill={col} stroke="#fff" strokeWidth="1.5" />
        </svg>
        <Axis h={180} max={mx} min={mn} />
        {hov !== null && <div className="absolute px-2 py-1 rounded-lg bg-[#24397a] num text-[11px] font-extrabold shadow-[0_3px_0_#0b1536] pointer-events-none" style={{ left: `calc(${8 + (hov / (s.length - 1)) * 96}% - 30px)`, top: 2 }}>${s[hov].toFixed(2)}</div>}
      </div>
    </Asset>
  );
}

/* ============ 2. ANIMATED BARS ============ */
function AnimBars() {
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const [data, setData] = useState([42, 68, 35, 80, 56, 92, 64]);
  const [hov, setHov] = useState<number | null>(null);
  const [mode, setMode] = useState<"xp" | "trades">("xp");
  const shuffle = () => { setData(data.map(() => 20 + Math.round(Math.random() * 80))); sfx.whoosh(); };
  const max = Math.max(...data);
  return (
    <Asset title="Animated Bars" id="chf.bars" desc="Столбцы недели с пружинным ростом, hover-подсветкой и переключением метрики.">
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5">
          {(["xp", "trades"] as const).map((m) => <button key={m} onClick={() => { setMode(m); shuffle(); }} className={cn("h-8 px-3 rounded-lg text-[11px] font-extrabold uppercase", mode === m ? "bg-blue text-white" : "text-mute hover:bg-white/5")}>{m === "xp" ? "XP" : "Сделки"}</button>)}
        </div>
        <Btn3D size="xs" variant="neutral" icon={<Icon name="refresh" size={12} />} onClick={shuffle}>New week</Btn3D>
      </div>
      <div className="inset !rounded-2xl p-4">
        <div className="flex items-end gap-2 h-[150px]">
          {data.map((v, i) => (
            <button key={mode + i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} className="flex-1 h-full flex flex-col justify-end items-center gap-1.5 group">
              <span className={cn("num text-[10px] font-extrabold transition-opacity", hov === i ? "opacity-100" : "opacity-0")}>{mode === "xp" ? v * 5 : v}</span>
              <span className="w-full rounded-t-lg relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(.3,1.2,.4,1)]"
                style={{ height: `${(v / max) * 100}%`, background: hov === i ? "linear-gradient(180deg,#5af5b4,#12c47a)" : "linear-gradient(180deg,#6a9dff,#3d7bff)", boxShadow: hov === i ? "0 0 18px rgba(31,219,139,.5)" : "none", animation: `grow-bar .7s ${i * 60}ms cubic-bezier(.3,1.3,.5,1) both`, transformOrigin: "bottom" }}>
                <span className="absolute inset-x-1 top-1 h-2 rounded-full bg-white/30" />
              </span>
              <span className={cn("text-[10px] font-extrabold", hov === i ? "text-txt" : "text-dim")}>{days[i]}</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 3. DONUT BREAKDOWN ============ */
function Donut() {
  const seg = [
    { n: "Спот лонги", v: 44, c: "#1fdb8b" }, { n: "Фьючерсы", v: 27, c: "#8d5cff" },
    { n: "Стейкинг", v: 18, c: "#2ed3f0" }, { n: "Кэш", v: 11, c: "#ffc53d" },
  ];
  const [h, setH] = useState<number | null>(null);
  const [k, setK] = useState(0);
  const R = 64, C = 2 * Math.PI * R;
  let acc = 0;
  useEffect(() => { const h = setTimeout(() => setK(1), 80); return () => clearTimeout(h); }, []);
  return (
    <Asset title="Donut Breakdown" id="chf.donut" desc="Кольцо стратегий: сегменты вырастают при появлении, hover раздувает сегмент и показывает детали.">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
            <circle cx="85" cy="85" r={R} fill="none" stroke="#0a1330" strokeWidth="26" />
            {seg.map((s, i) => {
              const len = (s.v / 100) * C * k, off = (acc / 100) * C * k; acc += s.v;
              return <circle key={s.n} cx="85" cy="85" r={R} fill="none" stroke={s.c} strokeWidth={h === i ? 32 : 24}
                strokeDasharray={`${Math.max(0, len - 4)} ${C}`} strokeDashoffset={-off} strokeLinecap="round"
                className="cursor-pointer transition-all duration-300" style={{ opacity: h === null || h === i ? 1 : 0.3, filter: h === i ? `drop-shadow(0 0 10px ${s.c})` : undefined, transition: "stroke-width .3s, opacity .3s, stroke-dasharray 1s cubic-bezier(.3,1,.3,1)" }}
                onMouseEnter={() => { setH(i); sfx.tick(); }} onMouseLeave={() => setH(null)} />;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
            <div><div className="label-caps !mb-0">{h !== null ? seg[h].n : "PnL"}</div><div className="num font-extrabold text-[22px]" style={{ color: h !== null ? seg[h].c : undefined }}>{h !== null ? `${seg[h].v}%` : "+$3.2k"}</div></div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {seg.map((s, i) => (
            <button key={s.n} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] font-bold transition", h === i && "bg-white/5 scale-[1.03]")}>
              <span className="size-3 rounded-[4px]" style={{ background: s.c }} />{s.n}<span className="ml-auto num text-mute">{s.v}%</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 4. RADAR SKILLS ============ */
function Radar() {
  const skills = [
    { n: "TA", v: 82 }, { n: "Risk", v: 64 }, { n: "DeFi", v: 45 }, { n: "Psy", v: 70 }, { n: "Onchain", v: 38 }, { n: "Macro", v: 55 },
  ];
  const [vals, setVals] = useState(skills.map((s) => s.v));
  const [anim, setAnim] = useState(false);
  const N = skills.length, R = 70, CX = 100, CY = 100;
  const pt = (i: number, v: number) => { const a = (i / N) * Math.PI * 2 - Math.PI / 2; const r = (v / 100) * R; return [CX + Math.cos(a) * r, CY + Math.sin(a) * r] as const; };
  const poly = vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const train = () => {
    if (anim) return;
    setAnim(true); sfx.whoosh();
    const target = vals.map((v) => Math.min(100, v + 4 + Math.round(Math.random() * 10)));
    const t0 = performance.now();
    const loop = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setVals(vals.map((v, i) => v + (target[i] - v) * e));
      if (k < 1) requestAnimationFrame(loop); else { setAnim(false); sfx.success(); }
    };
    requestAnimationFrame(loop);
  };
  return (
    <Asset title="Skills Radar" id="chf.radar" desc="Радар навыков: тренировка анимирует все оси к новым значениям, вершины подсвечены.">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 200" className="w-full max-w-[230px]">
          {[25, 50, 75, 100].map((g) => <polygon key={g} points={skills.map((_, i) => pt(i, g).join(",")).join(" ")} fill="none" stroke="rgba(140,170,255,.12)" />)}
          {skills.map((s, i) => { const [x, y] = pt(i, 100); return <g key={s.n}><line x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(140,170,255,.12)" /><text x={CX + (x - CX) * 1.18} y={CY + (y - CY) * 1.18 + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#8e9cc8">{s.n}</text></g>; })}
          <polygon points={poly} fill="rgba(61,123,255,.25)" stroke="#6a9dff" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(61,123,255,.6))" }} />
          {vals.map((v, i) => { const [x, y] = pt(i, v); return <circle key={i} cx={x} cy={y} r="4" fill="#fff" stroke="#3d7bff" strokeWidth="2.5" />; })}
        </svg>
        <div className="flex gap-1.5 w-full mt-2">{vals.map((v, i) => <div key={i} className="flex-1 text-center"><div className="num text-[11px] font-extrabold" style={{ color: v >= 70 ? "#1fdb8b" : v >= 50 ? "#ffc53d" : "#8e9cc8" }}>{Math.round(v)}</div></div>)}</div>
        <Btn3D size="sm" variant="blue" full className="mt-3" loading={anim} onClick={train} icon={<Icon name="dumbbell" size={15} />}>Train all · 50 XP</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 5. GAUGE RISK ============ */
function Gauge() {
  const [v, setV] = useState(62);
  const a = (-120 + (v / 100) * 240) * (Math.PI / 180);
  const col = v < 33 ? "#1fdb8b" : v < 66 ? "#ffc53d" : "#ff4d6a";
  const label = v < 33 ? "Conservative" : v < 66 ? "Balanced" : "Aggressive";
  return (
    <Asset title="Risk Gauge" id="chf.gauge" desc="Спидометр риска портфеля: стрелка с пружиной, зоны, цифровое значение.">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 130" className="w-full max-w-[250px]">
          <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#1fdb8b" /><stop offset=".5" stopColor="#ffc53d" /><stop offset="1" stopColor="#ff4d6a" /></linearGradient></defs>
          <path d="M20 115 A80 80 0 0 1 180 115" fill="none" stroke="#0a1330" strokeWidth="20" strokeLinecap="round" />
          <path d="M20 115 A80 80 0 0 1 180 115" fill="none" stroke="url(#gg)" strokeWidth="12" strokeLinecap="round" opacity=".9" />
          {Array.from({ length: 9 }).map((_, i) => { const aa = Math.PI - (i / 8) * Math.PI; return <line key={i} x1={100 + Math.cos(aa) * 62} y1={115 - Math.sin(aa) * 62} x2={100 + Math.cos(aa) * 70} y2={115 - Math.sin(aa) * 70} stroke="#5b6a98" strokeWidth="2.5" strokeLinecap="round" />; })}
          <g style={{ transform: `rotate(${-120 + (v / 100) * 240 + 90}deg)`, transformOrigin: "100px 115px", transition: "transform .8s cubic-bezier(.3,1.6,.4,1)" }}>
            <path d="M100 115 L100 48 L104 115 Z" fill="#eaf0ff" />
          </g>
          <circle cx="100" cy="115" r="11" fill="#1d3169" stroke="#eaf0ff" strokeWidth="3" />
          <circle cx={100 + Math.cos(a) * 86} cy={115 - Math.sin(a) * 86} r="5" fill={col} style={{ transition: "all .8s cubic-bezier(.3,1.6,.4,1)", filter: `drop-shadow(0 0 8px ${col})` }} />
        </svg>
        <div className="num text-[30px] font-extrabold -mt-1" style={{ color: col }}>{v}</div>
        <div className="text-[12px] font-extrabold uppercase tracking-wider" style={{ color: col }}>{label}</div>
        <input type="range" min={0} max={100} value={v} onChange={(e) => { setV(+e.target.value); }} className="w-full mt-2 accent-[#ffc53d]" />
      </div>
    </Asset>
  );
}

/* ============ 6. HEATMAP ============ */
function Heatmap() {
  const coins = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "ADA", "AVAX", "LINK", "DOT", "NEAR", "ARB"];
  const [data, setData] = useState(() => coins.map(() => rnd(-12, 12)));
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => { const h = setInterval(() => setData((d) => d.map((v) => clamp(v + rnd(-2.4, 2.4), -14, 14))), 1400); return () => clearInterval(h); }, []);
  const color = (v: number) => v >= 0 ? `rgba(31,219,139,${0.12 + Math.min(1, v / 12) * 0.75})` : `rgba(255,77,106,${0.12 + Math.min(1, -v / 12) * 0.75})`;
  return (
    <Asset title="Market Heatmap" id="chf.heat" desc="Живая тепловая карта: значения тикают, цвет и размер реагируют, клик фиксирует монету.">
      <div className="grid grid-cols-4 gap-2">
        {coins.map((c, i) => (
          <button key={c} onClick={() => { setSel(sel === i ? null : i); sfx.tick(); }}
            className={cn("rounded-xl p-2 text-center border-2 transition-all duration-700 min-h-[64px]", sel === i ? "border-white scale-105 z-10" : "border-transparent")}
            style={{ background: color(data[i]), transform: `scale(${sel === i ? 1.06 : 0.92 + Math.min(1, Math.abs(data[i]) / 12) * 0.08})` }}>
            <div className="font-extrabold text-[12px]">{c}</div>
            <div className="num text-[11px] font-extrabold">{data[i] >= 0 ? "+" : ""}{data[i].toFixed(1)}%</div>
          </button>
        ))}
      </div>
      {sel !== null && <div key={sel} className="mt-3 inset !rounded-xl p-2.5 flex items-center justify-between anim-fade"><span className="font-extrabold text-[13px]">{coins[sel]}/USDT</span><span className={cn("num text-[13px] font-extrabold", data[sel] >= 0 ? "text-bull" : "text-bear")}>{data[sel] >= 0 ? "+" : ""}{data[sel].toFixed(2)}%</span></div>}
    </Asset>
  );
}

/* ============ 7. SPARK GRID ============ */
function SparkGrid() {
  const coins = [
    { s: "BTC", c: "#f7931a", v: 0.008 }, { s: "ETH", c: "#8c8cff", v: 0.012 }, { s: "SOL", c: "#14f195", v: 0.02 },
    { s: "DOGE", c: "#c2a633", v: 0.028 }, { s: "AVAX", c: "#ff4d6a", v: 0.018 }, { s: "LINK", c: "#3d7bff", v: 0.015 },
  ];
  return (
    <Asset title="Sparkline Grid" id="chf.sparks" desc="6 живых спарклайнов с разной волатильностью: вспышка цены при тике.">
      <div className="grid grid-cols-2 gap-2.5">
        {coins.map((c) => <SparkCell key={c.s} {...c} />)}
      </div>
    </Asset>
  );
}
function SparkCell({ s, c, v }: { s: string; c: string; v: number }) {
  const [d, setD] = useState<number[]>(() => { let p = 100; const a: number[] = []; for (let i = 0; i < 24; i++) { p *= 1 + (Math.random() - 0.5) * v; a.push(p); } return a; });
  const [flash, setFlash] = useState<0 | 1 | -1>(0);
  useEffect(() => {
    const h = setInterval(() => {
      setD((a) => { const nv = a[a.length - 1] * (1 + (Math.random() - 0.49) * v); setFlash(nv >= a[a.length - 1] ? 1 : -1); setTimeout(() => setFlash(0), 350); return [...a.slice(1), nv]; });
    }, 1100 + Math.random() * 700);
    return () => clearInterval(h);
  }, [v]);
  const mx = Math.max(...d), mn = Math.min(...d);
  const pts = d.map((x, i) => `${(i / 23) * 100},${26 - ((x - mn) / (mx - mn || 1)) * 22}`).join(" ");
  const ch = ((d[23] - d[0]) / d[0]) * 100;
  return (
    <div className={cn("inset !rounded-xl p-2.5 transition-colors duration-300", flash === 1 && "!border-bull/50", flash === -1 && "!border-bear/50")}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-extrabold text-[12px]"><span className="size-5 rounded-full grid place-items-center text-[9px]" style={{ background: c, color: "#0b1330" }}>{s[0]}</span>{s}</span>
        <span className={cn("num text-[10.5px] font-extrabold", ch >= 0 ? "text-bull" : "text-bear")}>{ch >= 0 ? "+" : ""}{ch.toFixed(1)}%</span>
      </div>
      <svg viewBox="0 0 100 28" className="w-full h-9 mt-1" preserveAspectRatio="none">
        <polygon points={`0,28 ${pts} 100,28`} fill={ch >= 0 ? "rgba(31,219,139,.18)" : "rgba(255,77,106,.18)"} />
        <polyline points={pts} fill="none" stroke={ch >= 0 ? "#1fdb8b" : "#ff4d6a"} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="100" cy={26 - ((d[23] - mn) / (mx - mn || 1)) * 22} r="2.4" fill={ch >= 0 ? "#1fdb8b" : "#ff4d6a"} stroke="#fff" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ============ 8. STACKED FLOW ============ */
function StackedFlow() {
  const cats = [
    { n: "Лонги", c: "#1fdb8b" }, { n: "Шорты", c: "#ff4d6a" }, { n: "Стейкинг", c: "#2ed3f0" },
  ];
  const [rows, setRows] = useState<number[][]>(() => Array.from({ length: 7 }, () => { const a = 25 + rnd(0, 40), b = 15 + rnd(0, 35); return [a, b, 100 - a - b]; }));
  const [hov, setHov] = useState<{ r: number; c: number } | null>(null);
  useEffect(() => { const h = setInterval(() => { if (Math.random() > 0.4) setRows((rs) => { const n = [...rs]; const k = (Math.random() * 7) | 0; const a = 25 + rnd(0, 40), b = 15 + rnd(0, 35); n[k] = [a, b, 100 - a - b]; return n; }); }, 1600); return () => clearInterval(h); }, []);
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  return (
    <Asset title="Stacked Flow" id="chf.stack" desc="Потоки позиций по дням: сегменты перетекают при обновлении, hover показывает долю.">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-dim w-6">{days[i]}</span>
            <div className="flex-1 flex h-8 rounded-xl overflow-hidden bg-[#0a1330]">
              {r.map((v, k) => (
                <div key={k} className="h-full grid place-items-center transition-all duration-1000 ease-[cubic-bezier(.3,1,.3,1)] cursor-pointer"
                  style={{ width: `${v}%`, background: cats[k].c, opacity: hov && (hov.r !== i || hov.c !== k) ? 0.45 : 1 }}
                  onMouseEnter={() => setHov({ r: i, c: k })} onMouseLeave={() => setHov(null)}>
                  {v > 16 && <span className="num text-[9.5px] font-extrabold text-ink-900">{Math.round(v)}%</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3">{cats.map((c) => <span key={c.n} className="flex items-center gap-1.5 text-[11px] font-bold text-mute"><i className="size-2.5 rounded-sm" style={{ background: c.c }} />{c.n}</span>)}</div>
      {hov && <div className="mt-2 text-[11px] font-bold text-center anim-fade">{days[hov.r]} · {cats[hov.c].n}: <span className="num">{Math.round(rows[hov.r][hov.c])}%</span></div>}
    </Asset>
  );
}

/* ============ 9. BUBBLE SCATTER ============ */
function BubbleScatter() {
  const coins = useMemo(() => [
    { s: "BTC", x: 72, y: 68, r: 34, c: 2.4 }, { s: "ETH", x: 58, y: 52, r: 26, c: -1.1 }, { s: "SOL", x: 40, y: 62, r: 20, c: 6.8 },
    { s: "DOGE", x: 28, y: 35, r: 15, c: 11.4 }, { s: "AVAX", x: 48, y: 30, r: 14, c: -0.7 }, { s: "LINK", x: 66, y: 36, r: 12, c: 1.2 },
    { s: "ARB", x: 36, y: 48, r: 10, c: 4.1 }, { s: "NEAR", x: 55, y: 74, r: 11, c: -3.2 },
  ], []);
  const [sel, setSel] = useState<number | null>(null);
  const [jig, setJig] = useState(0);
  useEffect(() => { const h = setInterval(() => setJig((j) => j + 1), 2000); return () => clearInterval(h); }, []);
  return (
    <Asset title="Bubble Scatter" id="chf.bubble" desc="Пузырь монет: X — объём, Y — волатильность, размер — капитализация. Пузыри дышат, клик — детали.">
      <div className="relative inset !rounded-2xl h-[220px] overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(140,170,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(140,170,255,.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-dim uppercase">Объём →</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-dim uppercase [writing-mode:vertical-rl] rotate-180">Волатильность →</span>
        {coins.map((b, i) => (
          <button key={b.s + jig} onClick={() => { setSel(sel === i ? null : i); sfx.pop(); }}
            className={cn("absolute rounded-full grid place-items-center font-extrabold transition-all duration-1000 border-2", sel === i ? "border-white z-10 scale-110" : "border-white/10")}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.r * 2, height: b.r * 2, marginLeft: -b.r, marginTop: -b.r - Math.sin(jig + i) * 3, fontSize: b.r > 15 ? 12 : 9, background: b.c >= 0 ? `radial-gradient(circle at 35% 30%, rgba(31,219,139,.9), rgba(31,219,139,.35))` : `radial-gradient(circle at 35% 30%, rgba(255,77,106,.9), rgba(255,77,106,.35))`, boxShadow: `0 0 ${b.r}px ${b.c >= 0 ? "rgba(31,219,139,.4)" : "rgba(255,77,106,.4)"}`, animation: "floaty 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>
            {b.s}
          </button>
        ))}
      </div>
      {sel !== null && <div key={sel} className="mt-2 inset !rounded-xl p-2.5 flex justify-between anim-fade"><span className="font-extrabold text-[13px]">{coins[sel].s}/USDT</span><span className={cn("num font-extrabold", coins[sel].c >= 0 ? "text-bull" : "text-bear")}>{coins[sel].c >= 0 ? "+" : ""}{coins[sel].c}%</span></div>}
    </Asset>
  );
}

export default function ChartFX() {
  return (
    <Section id="chartfx" index="26" title="Chart FX Lab" subtitle="9 анимированных графиков: live-зона, бары, донат, радар, гейдж, тепловая карта, спарки, стеки, пузыри" count={9}>
      <div className="grid lg:grid-cols-3 gap-6">
        <LiveArea />
        <AnimBars />
        <Donut />
        <Radar />
        <Gauge />
        <Heatmap />
        <SparkGrid />
        <StackedFlow />
        <BubbleScatter />
      </div>
      <style>{`@keyframes grow-bar { from { transform: scaleY(0); } to { transform: scaleY(1); } }`}</style>
    </Section>
  );
}
