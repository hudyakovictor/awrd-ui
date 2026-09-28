import type { ReactNode, Ref, SVGProps } from "react";
import { cn } from "../utils/cn";

export type Candle = { o: number; h: number; l: number; c: number; v?: number };

export const BULL = "#22d39a";
export const BEAR = "#ff4f6d";

/** Deterministic xorshift PRNG so every round is reproducible. */
export function rng(seed: number) {
  let s = (Math.imul(seed || 1, 2654435761) >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function genSeries(seed: number, n: number, o: { start?: number; vol?: number; drift?: number } = {}): Candle[] {
  const r = rng(seed);
  const vol = o.vol ?? 2.2, drift = o.drift ?? 0;
  let p = o.start ?? 100;
  const out: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const open = p;
    const close = open + (r() - 0.5) * vol * 2 + drift;
    out.push({ o: open, c: close, h: Math.max(open, close) + r() * vol * 0.9, l: Math.min(open, close) - r() * vol * 0.9, v: 0.3 + r() * 0.7 });
    p = close;
  }
  return out;
}

/** Build candles from a list of closes (hand-crafted teaching charts). */
export function fromCloses(closes: number[], wick = 0.9, start?: number): Candle[] {
  let prev = start ?? closes[0] - 1;
  return closes.map((c, i) => {
    const o = prev;
    prev = c;
    const w = wick * (0.6 + ((i * 37) % 10) / 12);
    return { o, c, h: Math.max(o, c) + w, l: Math.min(o, c) - w, v: 0.35 + ((i * 53) % 10) / 15 };
  });
}

export type Scale = { x: (i: number) => number; y: (v: number) => number; inv: (py: number) => number; idx: (px: number) => number; cw: number; W: number; H: number; min: number; max: number; n: number; pad: number };

export function makeScale(data: Candle[], W: number, H: number, pad = 12, extra: number[] = [], nOverride?: number): Scale {
  const vals = [...data.flatMap((d) => [d.h, d.l]), ...extra];
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const n = nOverride ?? data.length;
  const cw = (W - pad * 2) / n;
  return {
    x: (i) => pad + cw * i + cw / 2,
    y: (v) => pad + (1 - (v - min) / span) * (H - pad * 2),
    inv: (py) => min + (1 - (py - pad) / (H - pad * 2)) * span,
    idx: (px) => Math.max(0, Math.min(n - 1, Math.floor((px - pad) / cw))),
    cw, W, H, min, max, n, pad,
  };
}

export function svgPoint(svg: SVGSVGElement, cx: number, cy: number, W: number, H: number) {
  const r = svg.getBoundingClientRect();
  return { x: ((cx - r.left) / r.width) * W, y: ((cy - r.top) / r.height) * H };
}

type ChartProps = Omit<SVGProps<SVGSVGElement>, "children" | "ref"> & {
  data: Candle[];
  W?: number;
  H?: number;
  s?: Scale;
  highlight?: number[];
  dimOthers?: boolean;
  colorOf?: (i: number, d: Candle) => string | undefined;
  onPick?: (i: number) => void;
  animate?: boolean;
  volume?: boolean;
  svgRef?: Ref<SVGSVGElement>;
  children?: (s: Scale) => ReactNode;
  under?: (s: Scale) => ReactNode;
};

export function CandleChart({ data, W = 320, H = 180, s: sIn, highlight, dimOthers, colorOf, onPick, animate = true, volume, svgRef, children, under, className, ...rest }: ChartProps) {
  const s = sIn ?? makeScale(data, W, H);
  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={cn("block h-auto w-full touch-none select-none", className)} {...rest}>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#3a5494" strokeOpacity=".18" strokeDasharray="2 4" />)}
      {under?.(s)}
      {data.map((d, i) => {
        const up = d.c >= d.o;
        const col = colorOf?.(i, d) ?? (up ? BULL : BEAR);
        const hl = highlight?.includes(i);
        const x = s.x(i);
        const bw = Math.max(2, s.cw * 0.62);
        return (
          <g
            key={i}
            opacity={dimOthers && highlight && !hl ? 0.28 : 1}
            onClick={onPick ? () => onPick(i) : undefined}
            style={{ cursor: onPick ? "pointer" : undefined, transformOrigin: `${x}px ${s.y((d.o + d.c) / 2)}px`, animation: animate ? `bar-grow .45s ${Math.min(i, 40) * 16}ms both cubic-bezier(.3,1.4,.5,1)` : undefined, transition: "opacity .3s" }}
          >
            {onPick && <rect x={x - s.cw / 2} y={0} width={s.cw} height={H} fill="transparent" />}
            {volume && <rect x={x - bw / 2} y={H - (d.v ?? 0.5) * 22} width={bw} height={(d.v ?? 0.5) * 22} fill={col} opacity=".18" />}
            <rect x={x - 0.7} y={s.y(d.h)} width="1.4" height={Math.max(1, s.y(d.l) - s.y(d.h))} fill={col} />
            <rect x={x - bw / 2} y={s.y(Math.max(d.o, d.c))} width={bw} height={Math.max(1.6, Math.abs(s.y(d.o) - s.y(d.c)))} rx="1.5" fill={col} style={hl ? { filter: `drop-shadow(0 0 5px ${col})` } : undefined} />
            {hl && <rect x={x - s.cw / 2 + 0.5} y={s.y(d.h) - 4} width={s.cw - 1} height={s.y(d.l) - s.y(d.h) + 8} rx="3" fill="none" stroke={col} strokeOpacity=".7" strokeWidth="1" strokeDasharray="3 2" />}
          </g>
        );
      })}
      {children?.(s)}
    </svg>
  );
}

export function Stamp({ text, color, show }: { text: string; color: string; show: boolean }) {
  if (!show) return null;
  return (
    <span className="font-display pointer-events-none rounded-xl border-4 px-3 py-1 text-2xl font-black tracking-wider" style={{ color, borderColor: color, animation: "stamp .35s cubic-bezier(.2,1.6,.4,1) both", textShadow: `0 0 16px ${color}` }}>
      {text}
    </span>
  );
}
