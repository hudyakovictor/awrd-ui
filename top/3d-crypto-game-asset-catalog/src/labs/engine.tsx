import { useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════
   LAB ENGINE — общий движок крупных торговых сцен TRADELINGO.
   Сидированный RNG, режимы рынка, индикаторы, интерактивный график.
   ═══════════════════════════════════════════════════════════════ */

export type Candle = { o: number; h: number; l: number; c: number; v: number };
export type Regime = "trend-up" | "trend-down" | "range" | "volatile" | "breakout" | "crash";

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function genCandles(seed: number, n: number, start: number, regime: Regime, volScale = 1): Candle[] {
  const rnd = mulberry32(seed);
  const out: Candle[] = [];
  let p = start;
  const drift: Record<Regime, number> = {
    "trend-up": 0.0016, "trend-down": -0.0016, range: 0,
    volatile: 0, breakout: 0.0008, crash: -0.004,
  };
  const vol: Record<Regime, number> = {
    "trend-up": 0.006, "trend-down": 0.006, range: 0.004,
    volatile: 0.016, breakout: 0.009, crash: 0.012,
  };
  for (let i = 0; i < n; i++) {
    // режимные фазы: breakout спит первую половину, потом выстрел
    let d = drift[regime];
    let v = vol[regime] * volScale;
    if (regime === "breakout" && i > n * 0.55) { d = 0.004; v = 0.011 * volScale; }
    if (regime === "crash" && i > n * 0.5 && i < n * 0.72) { d = -0.011; v = 0.014 * volScale; }
    if (regime === "range") d = (start - p) / start * 0.02; // mean reversion
    if (regime === "volatile") d = Math.sin(i * 0.35) * 0.004;
    const o = p;
    const shock = (rnd() - 0.5) * 2 * v + d;
    const c = Math.max(1, o * (1 + shock));
    const h = Math.max(o, c) * (1 + rnd() * v * 0.5);
    const l = Math.min(o, c) * (1 - rnd() * v * 0.5);
    out.push({ o, h, l, c, v: 0.4 + rnd() * 1.6 + Math.abs(shock) * 160 });
    p = c;
  }
  return out;
}

export const REGIMES: { k: Regime; t: string; d: string; hex: string }[] = [
  { k: "trend-up", t: "Аптренд", d: "ступени вверх", hex: "#2BE38B" },
  { k: "trend-down", t: "Даунтренд", d: "ступени вниз", hex: "#FF4D6D" },
  { k: "range", t: "Флэт", d: "коридор", hex: "#3D9BFF" },
  { k: "volatile", t: "Пилы", d: "высокая волатильность", hex: "#FFC940" },
  { k: "breakout", t: "Пробой", d: "накопление → выстрел", hex: "#9A6BFF" },
  { k: "crash", t: "Крах", d: "паника и отскок", hex: "#FF8A3D" },
];

/* ── индикаторы ── */
export function sma(data: number[], n: number): (number | null)[] {
  return data.map((_, i) => (i < n - 1 ? null : data.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n));
}
export function ema(data: number[], n: number): number[] {
  const k = 2 / (n + 1);
  let e = data[0];
  return data.map((v, i) => (i === 0 ? (e = v) : (e = v * k + e * (1 - k))));
}
export function rsi(closes: number[], n = 14): (number | null)[] {
  const out: (number | null)[] = closes.map(() => null);
  if (closes.length <= n) return out;
  let g = 0, l = 0;
  for (let i = 1; i <= n; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) g += d; else l -= d;
  }
  g /= n; l /= n;
  out[n] = 100 - 100 / (1 + (l === 0 ? 100 : g / l));
  for (let i = n + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    g = (g * (n - 1) + Math.max(0, d)) / n;
    l = (l * (n - 1) + Math.max(0, -d)) / n;
    out[i] = 100 - 100 / (1 + (l === 0 ? 100 : g / l));
  }
  return out;
}
export function macd(closes: number[]): { line: number[]; signal: number[]; hist: number[] } {
  const line = ema(closes, 12).map((v, i) => v - ema(closes, 26)[i]);
  const signal = ema(line, 9);
  return { line, signal, hist: line.map((v, i) => v - signal[i]) };
}

export const fmtP = (v: number, d = 0) =>
  v.toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ═══════════════ Интерактивный SVG-график ═══════════════
   hover → onHover(i) · клик → onTap(i, price)
   drag → выделение диапазона onRange(a,b) · линия тренда · позиция */
export function LabChart({
  data, height = 240, showMA = true, showVol = false, showGrid = true,
  future = 0, highlight = null, selectRange = null, trend = null,
  position = null, crosshair = true, onHover = null, onTap = null,
  onRange = null, compact = false, id = "lc",
}: {
  data: Candle[]; height?: number; showMA?: boolean; showVol?: boolean; showGrid?: boolean;
  future?: number; highlight?: Set<number> | null; selectRange?: [number, number] | null;
  trend?: { a: number; b: number } | null;
  position?: { entry: number; sl: number; tp: number; side: "long" | "short" } | null;
  crosshair?: boolean; onHover?: ((i: number | null) => void) | null;
  onTap?: ((i: number, price: number) => void) | null;
  onRange?: ((a: number, b: number) => void) | null;
  compact?: boolean; id?: string;
}) {
  const W = 640, H = 300;
  const n = data.length;
  const vis = Math.max(1, n - future);
  const slice = data.slice(0, vis);
  const min = Math.min(...slice.map((d) => d.l));
  const max = Math.max(...slice.map((d) => d.h));
  const padT = 14, padB = showVol ? 64 : 26, padX = 8;
  const plotH = H - padT - padB;
  const y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * plotH;
  const cw = W / Math.max(1, n);
  const maF = useMemo(() => sma(data.map((d) => d.c), 7), [data]);
  const maS = useMemo(() => sma(data.map((d) => d.c), 21), [data]);
  const [hov, setHov] = useState<number | null>(null);
  const [dragA, setDragA] = useState<number | null>(null);
  const [dragB, setDragB] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const idxFromEvent = (e: { clientX: number }) => {
    const r = svgRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(n - 1, Math.floor((((e.clientX - r.left) / r.width) * W - padX) / cw)));
  };
  const priceFromEvent = (e: { clientY: number }) => {
    const r = svgRef.current!.getBoundingClientRect();
    const yy = ((e.clientY - r.top) / r.height) * H;
    return max - ((yy - padT) / plotH) * (max - min);
  };
  const maxV = Math.max(...slice.map((d) => d.v));
  const effHov = hov !== null && hov < vis ? hov : null;

  const range = dragA !== null && dragB !== null
    ? [Math.min(dragA, dragB), Math.max(dragA, dragB)] as [number, number]
    : selectRange;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="block w-full select-none"
      style={{ height, touchAction: onRange ? "none" : "pan-y", cursor: onTap ? "crosshair" : onRange ? "ew-resize" : "default" }}
      onMouseLeave={() => { setHov(null); onHover?.(null); }}
      onMouseMove={(e) => {
        const i = idxFromEvent(e);
        if (dragA !== null) setDragB(i);
        else { setHov(i); onHover?.(i); }
      }}
      onMouseDown={(e) => { if (onRange) { const i = idxFromEvent(e); setDragA(i); setDragB(i); } }}
      onMouseUp={(e) => {
        if (onRange && dragA !== null && dragB !== null) {
          const a = Math.min(dragA, dragB), b = Math.max(dragA, dragB);
          if (b - a >= 2) onRange(a, b); else onTap?.(idxFromEvent(e), priceFromEvent(e));
          setDragA(null); setDragB(null);
        } else if (onTap) onTap(idxFromEvent(e), priceFromEvent(e));
      }}
      onTouchStart={(e) => { if (onRange) { const t = e.touches[0]; const r = svgRef.current!.getBoundingClientRect(); const i = Math.max(0, Math.min(n - 1, Math.floor((((t.clientX - r.left) / r.width) * W - padX) / cw))); setDragA(i); setDragB(i); } }}
      onTouchMove={(e) => { if (onRange && dragA !== null) { const t = e.touches[0]; const r = svgRef.current!.getBoundingClientRect(); setDragB(Math.max(0, Math.min(n - 1, Math.floor((((t.clientX - r.left) / r.width) * W - padX) / cw)))); } }}
      onTouchEnd={() => { if (onRange && dragA !== null && dragB !== null) { const a = Math.min(dragA, dragB), b = Math.max(dragA, dragB); if (b - a >= 2 && b < vis) onRange(a, b); setDragA(null); setDragB(null); } }}
    >
      <defs>
        <linearGradient id={`${id}-up`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2BE38B" stopOpacity=".35" /><stop offset="1" stopColor="#2BE38B" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-dn`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF4D6D" stopOpacity=".35" /><stop offset="1" stopColor="#FF4D6D" stopOpacity="0" />
        </linearGradient>
      </defs>

      {showGrid && [0.15, 0.4, 0.65, 0.9].map((f) => (
        <g key={f}>
          <line x1={padX} x2={W - padX} y1={padT + plotH * f} y2={padT + plotH * f} stroke="#243D73" strokeOpacity=".6" strokeDasharray="2 5" />
          {!compact && (
            <text x={W - padX - 2} y={padT + plotH * f - 4} fontSize="10" fill="#7D93C6" textAnchor="end" fontFamily="monospace">
              {fmtP(max - (max - min) * f, 0)}
            </text>
          )}
        </g>
      ))}

      {/* скрытое будущее */}
      {future > 0 && (
        <g>
          <rect x={(vis / n) * W} y={0} width={W - (vis / n) * W} height={H} fill="#050B1C" opacity=".72" />
          {Array.from({ length: 7 }).map((_, i) => (
            <text key={i} x={(vis / n) * W + 14} y={60 + i * 26} fontSize="15" fill="#30508F" fontFamily="monospace">? ? ?</text>
          ))}
        </g>
      )}

      {/* свечи */}
      {slice.map((d, i) => {
        const g = d.c >= d.o;
        const x = padX + i * cw + cw / 2;
        const hl = highlight?.has(i);
        const dim = highlight && !hl;
        const inRange = range && i >= range[0] && i <= range[1];
        return (
          <g key={i} opacity={dim && !inRange ? 0.28 : 1}>
            {inRange && <rect x={padX + range[0] * cw} y={padT} width={(range[1] - range[0] + 1) * cw} height={plotH} fill="#3D9BFF" opacity=".1" />}
            <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={hl ? "#FFC940" : g ? "#2BE38B" : "#FF4D6D"} strokeWidth={hl ? 2.6 : 1.6} />
            <rect
              x={x - cw * 0.32} width={Math.max(2, cw * 0.64)}
              y={y(Math.max(d.o, d.c))} height={Math.max(2, Math.abs(y(d.o) - y(d.c)))} rx="1.5"
              fill={hl ? "#FFC940" : g ? "#2BE38B" : "#FF4D6D"}
            />
          </g>
        );
      })}

      {/* MA */}
      {showMA && [maF, maS].map((ma, k) => (
        <polyline
          key={k} fill="none" stroke={k === 0 ? "#9A6BFF" : "#FFC940"} strokeWidth={k === 0 ? 2 : 1.6}
          strokeOpacity=".9"
          points={ma.slice(0, vis).map((v, i) => (v === null ? "" : `${padX + i * cw + cw / 2},${y(v)}`)).filter(Boolean).join(" ")}
        />
      ))}

      {/* объём */}
      {showVol && slice.map((d, i) => {
        const x = padX + i * cw + cw / 2;
        const h = (d.v / maxV) * 44;
        return <rect key={i} x={x - cw * 0.3} width={Math.max(1.5, cw * 0.6)} y={H - 18 - h} height={h} rx="1" fill={d.c >= d.o ? "#2BE38B" : "#FF4D6D"} opacity=".55" />;
      })}

      {/* тренд-линия */}
      {trend && (
        <line
          x1={padX + trend.a * cw + cw / 2} y1={y(slice[Math.min(trend.a, vis - 1)].l)}
          x2={padX + Math.min(trend.b, vis - 1) * cw + cw / 2} y2={y(slice[Math.min(trend.b, vis - 1)].l)}
          stroke="#FFC940" strokeWidth="2.5" strokeDasharray="7 5" strokeLinecap="round"
        />
      )}

      {/* позиция */}
      {position && (
        <g>
          <rect x={padX} width={W - padX * 2} y={y(Math.max(position.entry, position.tp, position.sl))} height={Math.abs(y(Math.min(position.entry, position.tp, position.sl)) - y(Math.max(position.entry, position.tp, position.sl)))} fill={position.side === "long" ? "#2BE38B" : "#FF4D6D"} opacity=".07" />
          {([["tp", position.tp, "#2BE38B"], ["entry", position.entry, "#fff"], ["sl", position.sl, "#FF4D6D"]] as const).map(([k, v, c]) => (
            <g key={k}>
              <line x1={padX} x2={W - padX} y1={y(v)} y2={y(v)} stroke={c} strokeWidth={k === "entry" ? 2.4 : 1.8} strokeDasharray={k === "entry" ? "" : "6 4"} />
              <rect x={W - padX - 52} y={y(v) - 10} width="52" height="20" rx="6" fill={c} />
              <text x={W - padX - 26} y={y(v) + 4.5} fontSize="11" fontWeight="900" fill={k === "entry" ? "#081229" : "#fff"} textAnchor="middle" fontFamily="monospace">
                {k === "entry" ? fmtP(v, 0) : `${k.toUpperCase()} ${fmtP(v, 0)}`}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* кроссхейр */}
      {crosshair && effHov !== null && dragA === null && (
        <g>
          <line x1={padX + effHov * cw + cw / 2} x2={padX + effHov * cw + cw / 2} y1={padT} y2={padT + plotH} stroke="#fff" strokeOpacity=".4" strokeDasharray="3 3" />
          <circle cx={padX + effHov * cw + cw / 2} cy={y(slice[effHov].c)} r="4.5" fill="#fff" stroke="#3D9BFF" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

/* компактный спарклайн свечей */
export function CandleSpark({ data, w = 120, h = 40, hex = "#3D9BFF" }: { data: Candle[]; w?: number; h?: number; hex?: string }) {
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const y = (v: number) => 3 + (1 - (v - min) / (max - min || 1)) * (h - 6);
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${y(d.c)}`).join(" ");
  return (
    <svg width={w} height={h} className="block">
      <polyline points={pts} fill="none" stroke={hex} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={y(data[data.length - 1].c)} r="3" fill={hex} />
    </svg>
  );
}

/* бейдж режима рынка */
export function RegimeBadge({ regime, size = "md" }: { regime: Regime; size?: "sm" | "md" }) {
  const r = REGIMES.find((x) => x.k === regime)!;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-lg font-extrabold uppercase tracking-wider", size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]")}
      style={{ background: `${r.hex}22`, color: r.hex, boxShadow: `0 2px 0 ${r.hex}55` }}
    >
      <span className="size-1.5 rounded-full animate-pulse" style={{ background: r.hex }} />
      {r.t}
    </span>
  );
}
