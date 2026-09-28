import { useMemo, useRef, useState } from "react";
import { Pencil, Trash2, TrendingUp, GitCompare, Palette, Eraser } from "lucide-react";
import { Asset, Section } from "../kit/ui";
import { genSeries, makeScale, svgPoint, BULL, BEAR } from "../kit/chart";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

const W = 330, H = 180;
function sma(data: number[], p: number) {
  return data.map((_, i) => (i < p - 1 ? null : data.slice(i - p + 1, i + 1).reduce((a, b) => a + b, 0) / p));
}
function ema(data: number[], p: number) {
  const k = 2 / (p + 1);
  let e = data[0];
  return data.map((v, i) => { e = i ? v * k + e * (1 - k) : v; return e; });
}
function rsi(data: number[], p = 14) {
  const out: (number | null)[] = data.map(() => null);
  let g = 0, l = 0;
  for (let i = 1; i < data.length; i++) {
    const d = data[i] - data[i - 1];
    if (i <= p) { g += Math.max(0, d); l += Math.max(0, -d); if (i === p) out[i] = 100 - 100 / (1 + g / Math.max(1e-6, l)); }
    else { g = (g * (p - 1) + Math.max(0, d)) / p; l = (l * (p - 1) + Math.max(0, -d)) / p; out[i] = 100 - 100 / (1 + g / Math.max(1e-6, l)); }
  }
  return out;
}

/* ============ SB-01 INDICATORS ============ */
function Indicators() {
  const data = useMemo(() => genSeries(99, 60, { vol: 1.9, drift: 0.04 }), []);
  const [show, setShow] = useState({ sma: true, ema: true, bb: false, rsi: true });
  const [per, setPer] = useState(20);
  const closes = data.map((d) => d.c);
  const ma = sma(closes, per);
  const em = ema(closes, 12);
  const rs = rsi(closes);
  const s = useMemo(() => makeScale(data, W, H, 12), [data]);
  const bb = useMemo(() => {
    const mid = sma(closes, 20);
    return mid.map((m, i) => {
      if (m === null) return null;
      const sl = closes.slice(i - 19, i + 1);
      const sd = Math.sqrt(sl.reduce((a, v) => a + (v - m) ** 2, 0) / 20);
      return { m, u: m + sd * 2, l: m - sd * 2 };
    });
  }, [closes]);
  const line = (arr: (number | null)[], c: string, w = 1.6, dash?: string) => (
    <polyline points={arr.map((v, i) => (v === null ? "" : `${s.x(i).toFixed(1)},${s.y(v).toFixed(1)}`)).filter(Boolean).join(" ")} fill="none" stroke={c} strokeWidth={w} strokeDasharray={dash} />
  );
  const lastRsi = [...rs].reverse().find((v) => v !== null) as number;
  const t = (k: keyof typeof show) => setShow({ ...show, [k]: !show[k] });
  return (
    <Asset code="SB-01" title="Indicator Lab" desc="SMA, EMA, Bollinger и RSI на одном графике. Период средней двигается слайдером." hint="Включай индикаторы" specs={["SMA/EMA/BB/RSI", "period", "live values"]}>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {([["sma", "SMA", "#ffc53d"], ["ema", "EMA", "#2bd9ff"], ["bb", "BB", "#8b5cff"], ["rsi", "RSI", "#ff8a3d"]] as const).map(([k, n, c]) => (
          <button key={k} onClick={() => { t(k); sfx.tick(); }} className={cn("h-8 rounded-lg px-3 text-[11px] font-extrabold transition", show[k] ? "text-ink-900" : "bg-ink-800 text-mist")} style={show[k] ? { background: c } : undefined}>{n}</button>
        ))}
        <span className="num ml-auto rounded-lg bg-ink-800 px-2 py-1 text-[11px] font-bold">RSI <b style={{ color: lastRsi > 70 ? BEAR : lastRsi < 30 ? BULL : "#e8eeff" }}>{lastRsi.toFixed(0)}</b></span>
      </div>
      <div className="panel-inset p-2 !rounded-2xl">
        <svg viewBox={`0 0 ${W} ${show.rsi ? H + 44 : H}`} className="block w-full">
          {data.map((d, i) => {
            const up = d.c >= d.o, col = up ? BULL : BEAR, x = s.x(i);
            return <g key={i} opacity="0.85"><rect x={x - 0.6} y={s.y(d.h)} width="1.2" height={Math.max(1, s.y(d.l) - s.y(d.h))} fill={col} /><rect x={x - 2} y={s.y(Math.max(d.o, d.c))} width="4" height={Math.max(1.2, Math.abs(s.y(d.o) - s.y(d.c)))} fill={col} /></g>;
          })}
          {show.bb && bb.map((b, i) => (b ? <circle key={i} cx={s.x(i)} cy={s.y(b.u)} r="0.8" fill="#8b5cff" opacity=".7" /> : null))}
          {show.bb && bb.map((b, i) => (b ? <circle key={i} cx={s.x(i)} cy={s.y(b.l)} r="0.8" fill="#8b5cff" opacity=".7" /> : null))}
          {show.sma && line(ma, "#ffc53d")}
          {show.ema && line(em, "#2bd9ff", 1.4, "3 2")}
          {show.rsi && (
            <g>
              <line x1="0" x2={W} y1={H + 6} y2={H + 6} stroke="#3a5494" strokeOpacity=".4" />
              <line x1="0" x2={W} y1={H + 14} y2={H + 14} stroke={BEAR} strokeOpacity=".4" strokeDasharray="3 3" />
              <line x1="0" x2={W} y1={H + 36} y2={H + 36} stroke={BULL} strokeOpacity=".4" strokeDasharray="3 3" />
              <polyline points={rs.map((v, i) => (v === null ? "" : `${s.x(i).toFixed(1)},${(H + 42 - (v / 100) * 34).toFixed(1)}`)).filter(Boolean).join(" ")} fill="none" stroke="#ff8a3d" strokeWidth="1.6" />
            </g>
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-[11px] font-bold text-mist">MA period</span>
        <input type="range" min={5} max={40} value={per} onChange={(e) => setPer(+e.target.value)} className="h-2 flex-1" style={{ accentColor: "#ffc53d" }} />
        <span className="num w-8 text-right text-[12px] font-extrabold text-gold">{per}</span>
      </div>
    </Asset>
  );
}

/* ============ SB-02 DRAWING ============ */
type Draw = { id: number; kind: "trend" | "hline" | "rect"; a: [number, number]; b: [number, number] };
function Drawing() {
  const data = useMemo(() => genSeries(31, 40, { vol: 2 }), []);
  const s = useMemo(() => makeScale(data, W, H, 12), [data]);
  const [tool, setTool] = useState<"trend" | "hline" | "rect" | "erase">("trend");
  const [draws, setDraws] = useState<Draw[]>([]);
  const [draft, setDraft] = useState<[number, number] | null>(null);
  const [cur, setCur] = useState<[number, number] | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const id = useRef(1);
  const pt = (e: React.PointerEvent) => {
    const p = svgPoint(svg.current!, e.clientX, e.clientY, W, H);
    return [s.idx(p.x), s.inv(p.y)] as [number, number];
  };
  const down = (e: React.PointerEvent) => {
    if (tool === "erase") return;
    const p = pt(e);
    if (!draft) { setDraft(p); sfx.tick(); }
    else {
      const a = tool === "hline" ? [0, draft[1]] as [number, number] : draft;
      const b = tool === "hline" ? [data.length - 1, draft[1]] as [number, number] : p;
      setDraws((d) => [...d, { id: id.current++, kind: tool, a, b }]);
      setDraft(null); setCur(null);
      sfxRaw.pop();
    }
  };
  const eraseAt = (e: React.PointerEvent) => {
    const [i, v] = pt(e);
    const hit = draws.find((d) => {
      if (d.kind === "hline") return Math.abs(d.a[1] - v) < (s.max - s.min) * 0.04;
      const i0 = Math.min(d.a[0], d.b[0]), i1 = Math.max(d.a[0], d.b[0]);
      if (i < i0 - 1 || i > i1 + 1) return false;
      const vAt = d.a[1] + ((d.b[1] - d.a[1]) / ((d.b[0] - d.a[0]) || 1)) * (i - d.a[0]);
      return d.kind === "rect" ? (v >= Math.min(d.a[1], d.b[1]) && v <= Math.max(d.a[1], d.b[1])) : Math.abs(vAt - v) < (s.max - s.min) * 0.05;
    });
    if (hit) { setDraws((d) => d.filter((x) => x.id !== hit.id)); sfxRaw.thud(); }
  };
  const render = (d: Draw, ghost = false) => {
    const col = ghost ? "#8a9bc4" : "#ffc53d";
    if (d.kind === "rect") {
      const x0 = s.x(Math.min(d.a[0], d.b[0])) - s.cw / 2, x1 = s.x(Math.max(d.a[0], d.b[0])) + s.cw / 2;
      return <rect x={x0} y={s.y(Math.max(d.a[1], d.b[1]))} width={x1 - x0} height={Math.abs(s.y(d.a[1]) - s.y(d.b[1]))} fill={col} opacity={ghost ? 0.1 : 0.15} stroke={col} strokeDasharray={ghost ? "4 3" : undefined} />;
    }
    return <line x1={s.x(d.a[0])} y1={s.y(d.a[1])} x2={s.x(d.b[0])} y2={s.y(d.b[1])} stroke={col} strokeWidth="2" strokeDasharray={ghost ? "4 3" : undefined} />;
  };
  return (
    <Asset code="SB-02" title="Drawing Tools" desc="Рисуй прямо на графике: трендовая, горизонталь, зона. Ластик удаляет одним тапом." hint="Клик-клик — фигура" specs={["3 tools", "eraser", "click-click"]}>
      <div className="mb-2 grid grid-cols-4 gap-1.5">
        {([["trend", "Trend"], ["hline", "H-line"], ["rect", "Zone"], ["erase", "Erase"]] as const).map(([k, n]) => (
          <button key={k} onClick={() => { setTool(k); setDraft(null); sfx.tick(); }} className={cn("flex h-9 items-center justify-center gap-1 rounded-xl text-[10px] font-extrabold", tool === k ? "bg-gold text-ink-900 shadow-[0_3px_0_#8a5c08]" : "bg-ink-800 text-mist")}>
            {k === "erase" ? <Eraser size={13} /> : <Pencil size={13} />}{n}
          </button>
        ))}
      </div>
      <div className="panel-inset p-2 !rounded-2xl">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none" style={{ cursor: tool === "erase" ? "not-allowed" : "crosshair" }} onPointerDown={(e) => (tool === "erase" ? eraseAt(e) : down(e))} onPointerMove={(e) => draft && setCur(pt(e))}>
          {data.map((d, i) => {
            const up = d.c >= d.o, col = up ? BULL : BEAR, x = s.x(i);
            return <g key={i}><rect x={x - 0.7} y={s.y(d.h)} width="1.4" height={Math.max(1, s.y(d.l) - s.y(d.h))} fill={col} /><rect x={x - 2.6} y={s.y(Math.max(d.o, d.c))} width="5.2" height={Math.max(1.2, Math.abs(s.y(d.o) - s.y(d.c)))} rx="1" fill={col} /></g>;
          })}
          {draws.map((d) => <g key={d.id}>{render(d)}</g>)}
          {draft && cur && render({ id: -1, kind: tool as "trend", a: tool === "hline" ? [0, draft[1]] : draft, b: tool === "hline" ? [data.length - 1, draft[1]] : cur }, true)}
          {draft && <circle cx={s.x(draft[0])} cy={s.y(draft[1])} r="4" fill="#ffc53d" style={{ animation: "pulse-ring 1.2s infinite" }} />}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-mist">{draft ? "Теперь кликни вторую точку" : `${draws.length} объектов`}</span>
        <button onClick={() => { setDraws([]); setDraft(null); sfx.soft(); }} className="flex items-center gap-1 font-bold text-bear"><Trash2 size={12} /> Clear all</button>
      </div>
    </Asset>
  );
}

/* ============ SB-03 FIBONACCI ============ */
function Fib() {
  const data = useMemo(() => genSeries(55, 44, { vol: 2.2, drift: 0.08 }), []);
  const s = useMemo(() => makeScale(data, W, H, 12, [86, 116]), [data]);
  const [a, setA] = useState({ i: 6, v: 94 });
  const [b, setB] = useState({ i: 34, v: 109 });
  const [drag, setDrag] = useState<"a" | "b" | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const lvls: [number, string][] = [[0, "#8a9bc4"], [0.236, "#3b82ff"], [0.382, "#2bd9ff"], [0.5, "#ffc53d"], [0.618, "#ff8a3d"], [0.786, "#ff4f6d"], [1, "#8a9bc4"]];
  const move = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = svgPoint(svg.current!, e.clientX, e.clientY, W, H);
    const pt = { i: Math.max(0, Math.min(data.length - 1, Math.round((p.x - s.pad - s.cw / 2) / s.cw))), v: s.inv(p.y) };
    drag === "a" ? setA(pt) : setB(pt);
  };
  return (
    <Asset code="SB-03" title="Fibonacci Retracement" desc="Тащи две точки свинга — уровни Фибоначчи перестроятся сами. Золотая зона 0.5–0.618 подсвечена." hint="Тащи точки A и B" specs={["7 levels", "golden zone", "drag"]}>
      <div className="panel-inset p-2 !rounded-2xl">
        <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none" onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
          {data.map((d, i) => {
            const up = d.c >= d.o, col = up ? BULL : BEAR, x = s.x(i);
            return <g key={i} opacity="0.8"><rect x={x - 0.6} y={s.y(d.h)} width="1.2" height={Math.max(1, s.y(d.l) - s.y(d.h))} fill={col} /><rect x={x - 2.4} y={s.y(Math.max(d.o, d.c))} width="4.8" height={Math.max(1.2, Math.abs(s.y(d.o) - s.y(d.c)))} fill={col} /></g>;
          })}
          <rect x={s.x(Math.min(a.i, b.i))} y={s.y(Math.max(a.v, b.v) - (Math.max(a.v, b.v) - Math.min(a.v, b.v)) * 0.382)} width={Math.abs(s.x(b.i) - s.x(a.i))} height={Math.abs(s.y(a.v + (b.v - a.v) * 0.5) - s.y(a.v + (b.v - a.v) * 0.618))} fill="#ffc53d" opacity=".08" />
          {lvls.map(([f, c]) => {
            const v = b.v + (a.v - b.v) * f;
            return (
              <g key={f}>
                <line x1={s.x(Math.min(a.i, b.i))} x2={W} y1={s.y(v)} y2={s.y(v)} stroke={c} strokeWidth={f === 0.618 || f === 0.5 ? 2 : 1} strokeDasharray={f === 0 || f === 1 ? undefined : "4 3"} opacity=".85" />
                <text x={W - 4} y={s.y(v) - 3} textAnchor="end" fontSize="8" fontWeight="800" fill={c}>{f} · {v.toFixed(1)}</text>
              </g>
            );
          })}
          {(["a", a] as const).map(() => null)}
          {([["a", a], ["b", b]] as const).map(([k, p]) => (
            <g key={k} onPointerDown={() => { setDrag(k); sfxRaw.pop(); }} style={{ cursor: "grab" }}>
              <circle cx={s.x(p.i)} cy={s.y(p.v)} r="14" fill="transparent" />
              <circle cx={s.x(p.i)} cy={s.y(p.v)} r={drag === k ? 8 : 6} fill="#fff" stroke="#8b5cff" strokeWidth="3" />
              <text x={s.x(p.i)} y={s.y(p.v) - 11} textAnchor="middle" fontSize="9" fontWeight="900" fill="#8b5cff">{k.toUpperCase()}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-mist"><TrendingUp size={13} className="text-violet" /> Swing: <span className="num text-white">{Math.abs(b.v - a.v).toFixed(1)} pts</span> · 0.618 → <span className="num text-gold">{(b.v + (a.v - b.v) * 0.618).toFixed(1)}</span></div>
    </Asset>
  );
}

/* ============ SB-04 VOLUME PROFILE ============ */
function VolProfile() {
  const data = useMemo(() => genSeries(17, 48, { vol: 2.4 }), []);
  const [hov, setHov] = useState<number | null>(null);
  const rows = 12;
  const s = useMemo(() => makeScale(data, 250, H, 10), [data]);
  const prof = useMemo(() => {
    const p = Array(rows).fill(0);
    data.forEach((d) => {
      const r = Math.max(0, Math.min(rows - 1, Math.floor(((d.c - s.min) / (s.max - s.min)) * rows)));
      p[r] += (d.v ?? 0.5);
    });
    return p;
  }, [data, s]);
  const max = Math.max(...prof);
  const poc = prof.indexOf(max);
  return (
    <Asset code="SB-04" title="Volume Profile" desc="Где проторговали больше всего: профиль объёма по ценам. POC-уровень подсвечен, ховер показывает зону." hint="Наведи на строки" specs={["12 rows", "POC", "hover zone"]}>
      <div className="panel-inset flex gap-1 p-2 !rounded-2xl">
        <svg viewBox="0 0 250 190" className="block w-[68%]">
          {data.map((d, i) => {
            const up = d.c >= d.o, col = up ? BULL : BEAR, x = (i / data.length) * 250 + 3;
            const y = (v: number) => 8 + (1 - (v - s.min) / (s.max - s.min)) * 174;
            return <g key={i}><rect x={x - 0.5} y={y(d.h)} width="1" height={Math.max(1, y(d.l) - y(d.h))} fill={col} opacity=".8" /><rect x={x - 1.8} y={y(Math.max(d.o, d.c))} width="3.6" height={Math.max(1, Math.abs(y(d.o) - y(d.c)))} fill={col} /></g>;
          })}
          {hov !== null && <rect x="0" y={8 + ((rows - 1 - hov) / rows) * 174} width="250" height={174 / rows} fill="#3b82ff" opacity=".15" />}
        </svg>
        <div className="flex flex-1 flex-col-reverse gap-[2px]">
          {prof.map((v, i) => (
            <button key={i} onPointerEnter={() => setHov(i)} onPointerLeave={() => setHov(null)} className="group/v relative h-[13px] rounded-sm bg-ink-800 text-left" title={`row ${i}`}>
              <span className="absolute inset-y-0 left-0 rounded-sm transition-all" style={{ width: `${(v / max) * 100}%`, background: i === poc ? "#ffc53d" : i === hov ? "#3b82ff" : "#2c4580", boxShadow: i === poc ? "0 0 8px #ffc53d" : undefined }} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-mist">POC <span className="num font-extrabold text-gold">{(s.min + ((poc + 0.5) / rows) * (s.max - s.min)).toFixed(1)}</span></span>
        {hov !== null && <span className="num anim-fade text-sky">{(s.min + (hov / rows) * (s.max - s.min)).toFixed(1)} – {(s.min + ((hov + 1) / rows) * (s.max - s.min)).toFixed(1)}</span>}
        <span className="text-mist">value area 70%</span>
      </div>
    </Asset>
  );
}

/* ============ SB-05 COMPARE ============ */
function Compare() {
  const series = useMemo(() => [
    { n: "BTC", c: "#f7931a", d: genSeries(3, 60, { vol: 1.5, drift: 0.05 }) },
    { n: "ETH", c: "#8b9dff", d: genSeries(8, 60, { vol: 2.2, drift: 0.02 }) },
    { n: "SOL", c: "#22d39a", d: genSeries(13, 60, { vol: 3.2, drift: 0.09 }) },
  ], []);
  const [on, setOn] = useState([true, true, true]);
  const [h, setH] = useState<number | null>(null);
  const norm = series.map((s) => s.d.map((d) => ((d.c - s.d[0].o) / s.d[0].o) * 100));
  const all = norm.flat();
  const mn = Math.min(...all), mx = Math.max(...all);
  const X = (i: number) => (i / 59) * W;
  const Y = (v: number) => 10 + (1 - (v - mn) / (mx - mn)) * (H - 20);
  return (
    <Asset code="SB-05" title="Asset Compare" desc="Три актива, нормированные к старту. Общий курсор показывает расхождение в процентах." hint="Веди по линиям" specs={["normalized", "sync cursor", "toggles"]}>
      <div className="mb-2 flex gap-1.5">
        {series.map((s, i) => (
          <button key={s.n} onClick={() => { const n = [...on]; n[i] = !n[i]; setOn(n); sfx.toggle(n[i]); }} className={cn("flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-[11px] font-extrabold transition", on[i] ? "text-white" : "bg-ink-800 text-mist")} style={on[i] ? { background: `${s.c}26`, boxShadow: `inset 0 0 0 1.5px ${s.c}` } : undefined}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.c }} />{s.n}
          </button>
        ))}
      </div>
      <div className="panel-inset p-2 !rounded-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full cursor-crosshair" onPointerMove={(e) => { const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setH(Math.floor(((e.clientX - r.left) / r.width) * 60)); }} onPointerLeave={() => setH(null)}>
          <line x1="0" x2={W} y1={Y(0)} y2={Y(0)} stroke="#3a5494" strokeDasharray="3 3" />
          {series.map((s, k) => on[k] && <polyline key={s.n} points={norm[k].map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ")} fill="none" stroke={s.c} strokeWidth="2" />)}
          {h !== null && <g><line x1={X(h)} x2={X(h)} y1="0" y2={H} stroke="#e8eeff" strokeOpacity=".5" />{series.map((s, k) => on[k] && <circle key={s.n} cx={X(h)} cy={Y(norm[k][h])} r="3.5" fill={s.c} stroke="#0a1224" strokeWidth="1.5" />)}</g>}
        </svg>
      </div>
      <div className="num mt-2 flex justify-between text-[11px] font-bold">
        {h === null ? <span className="text-mist">Наведи на график</span> : series.map((s, k) => on[k] && <span key={s.n} style={{ color: s.c }}>{s.n} {norm[k][h] >= 0 ? "+" : ""}{norm[k][h].toFixed(1)}%</span>)}
      </div>
    </Asset>
  );
}

/* ============ SB-06 THEMES ============ */
const themes = [
  { n: "Neon", up: "#22d39a", dn: "#ff4f6d", bg: "#0a1224", grid: "#3a5494" },
  { n: "Sunset", up: "#ffc53d", dn: "#8b5cff", bg: "#160f2e", grid: "#5a4a8a" },
  { n: "Ocean", up: "#2bd9ff", dn: "#ff8a3d", bg: "#062a33", grid: "#1d5a6a" },
  { n: "Mono", up: "#e8eeff", dn: "#5f74a3", bg: "#0b0e14", grid: "#2a2f3a" },
];
function Themes() {
  const data = useMemo(() => genSeries(44, 36, { vol: 2 }), []);
  const [ti, setTi] = useState(0);
  const [hollow, setHollow] = useState(false);
  const [grid, setGrid] = useState(true);
  const t = themes[ti];
  const s = useMemo(() => makeScale(data, W, H, 12), [data]);
  return (
    <Asset code="SB-06" title="Chart Themes" desc="Четыре темы оформления графика + полые свечи и сетка. Переключается мгновенно." hint="Меняй тему" specs={["4 themes", "hollow", "grid"]}>
      <div className="grid grid-cols-4 gap-1.5">
        {themes.map((x, i) => (
          <button key={x.n} onClick={() => { setTi(i); sfx.tick(); }} className={cn("h-10 rounded-xl text-[10px] font-extrabold transition", ti === i ? "ring-2 ring-white" : "opacity-70")} style={{ background: `linear-gradient(135deg, ${x.bg} 55%, ${x.up}55)` }}>
            <span className="rounded bg-black/50 px-1.5 py-0.5">{x.n}</span>
          </button>
        ))}
      </div>
      <div key={ti} className="anim-fade mt-3 overflow-hidden rounded-2xl p-2 transition-colors duration-300" style={{ background: t.bg }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          {grid && [0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke={t.grid} strokeOpacity=".5" strokeDasharray="2 4" />)}
          {data.map((d, i) => {
            const up = d.c >= d.o, col = up ? t.up : t.dn, x = s.x(i);
            return (
              <g key={i}>
                <rect x={x - 0.7} y={s.y(d.h)} width="1.4" height={Math.max(1, s.y(d.l) - s.y(d.h))} fill={col} />
                <rect x={x - 2.8} y={s.y(Math.max(d.o, d.c))} width="5.6" height={Math.max(1.4, Math.abs(s.y(d.o) - s.y(d.c)))} rx="1" fill={hollow && up ? "none" : col} stroke={col} strokeWidth={hollow && up ? 1.4 : 0} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => { setHollow(!hollow); sfx.toggle(!hollow); }} className={cn("flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[11px] font-extrabold", hollow ? "bg-sky/20 text-sky ring-1 ring-sky" : "bg-ink-800 text-mist")}><GitCompare size={13} /> Hollow</button>
        <button onClick={() => { setGrid(!grid); sfx.toggle(!grid); }} className={cn("flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[11px] font-extrabold", grid ? "bg-sky/20 text-sky ring-1 ring-sky" : "bg-ink-800 text-mist")}><Palette size={13} /> Grid</button>
      </div>
    </Asset>
  );
}

export default function Sandbox() {
  return (
    <Section id="sandbox" index="SB" title="Chart Sandbox" subtitle="Индикаторы, рисование, Фибоначчи, профиль объёма, сравнение, темы">
      <Indicators />
      <Drawing />
      <Fib />
      <VolProfile />
      <Compare />
      <Themes />
    </Section>
  );
}
