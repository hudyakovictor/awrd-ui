import type { CSSProperties, PointerEvent as RPE, ReactNode } from "react";
import type { Candle } from "../game/market";
import { clamp } from "./hooks";

export type Scale = { x: (i: number) => number; y: (v: number) => number; price: (py: number) => number; cw: number; w: number; h: number; mn: number; mx: number };

export function makeScale(data: Candle[], w: number, h: number, pad = 8, lo?: number, hi?: number): Scale {
  const mx = hi ?? Math.max(...data.map((d) => d.h));
  const mn = lo ?? Math.min(...data.map((d) => d.l));
  const cw = w / Math.max(1, data.length);
  return {
    x: (i) => i * cw + cw / 2,
    y: (v) => pad + ((mx - v) / (mx - mn || 1)) * (h - pad * 2),
    price: (py) => mx - ((py - pad) / (h - pad * 2)) * (mx - mn),
    cw, w, h, mn, mx,
  };
}

/** Reusable candlestick renderer with overlay render-prop */
export function CandleChart({ data, w = 300, h = 160, pad = 8, onTap, active, dim, children, className, lo, hi, style, grid = true }: {
  data: Candle[]; w?: number; h?: number; pad?: number;
  onTap?: (i: number, e: RPE<SVGSVGElement>) => void;
  active?: number | null; dim?: (i: number) => boolean;
  children?: (s: Scale) => ReactNode; className?: string; lo?: number; hi?: number; style?: CSSProperties; grid?: boolean;
}) {
  const s = makeScale(data, w, h, pad, lo, hi);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} style={{ aspectRatio: `${w} / ${h}`, ...style }}
      onPointerDown={onTap ? (e) => { const r = e.currentTarget.getBoundingClientRect(); const i = Math.floor(((e.clientX - r.left) / r.width) * data.length); onTap(clamp(i, 0, data.length - 1), e); } : undefined}>
      {grid && [0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="#ffffff0c" strokeDasharray="3 5" />)}
      {data.map((d, i) => {
        const up = d.c >= d.o;
        const col = up ? "#2ee59d" : "#ff4d6a";
        const x = s.x(i);
        const isA = active === i;
        const isDim = dim?.(i);
        return (
          <g key={i} opacity={isDim ? 0.3 : 1} style={{ transition: "opacity .3s" }}>
            {isA && <rect x={x - s.cw / 2} y={0} width={s.cw} height={h} fill="#fff" opacity=".08" />}
            <line x1={x} x2={x} y1={s.y(d.h)} y2={s.y(d.l)} stroke={col} strokeWidth={Math.max(1, s.cw * 0.12)} />
            <rect x={x - s.cw * 0.32} width={s.cw * 0.64} y={s.y(Math.max(d.o, d.c))} height={Math.max(1.5, Math.abs(s.y(d.o) - s.y(d.c)))} rx={Math.min(2, s.cw * 0.1)} fill={col} style={isA ? { filter: `drop-shadow(0 0 6px ${col})` } : undefined} />
          </g>
        );
      })}
      {children?.(s)}
    </svg>
  );
}

/** Horizontal price line with a label tag */
export function PriceTag({ s, price, color, label, dash = "5 4" }: { s: Scale; price: number; color: string; label: string; dash?: string }) {
  const y = s.y(price);
  return (
    <g>
      <line x1="0" x2={s.w} y1={y} y2={y} stroke={color} strokeWidth="1.5" strokeDasharray={dash} />
      <rect x={s.w - 58} y={y - 9} width="58" height="18" rx="5" fill={color} />
      <text x={s.w - 29} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="JetBrains Mono" fill="#0a1330">{label}</text>
    </g>
  );
}

export const tri = (x: number, y: number, up: boolean) => (up ? `M${x} ${y + 12} l-6 9 h12z` : `M${x} ${y - 12} l-6 -9 h12z`);
