/* ZoomChart — reusable interactive candle chart for showcase scenes.
   Wheel zoom around cursor · drag pan · double-click reset · minimap brush
   · auto-scaled price axis · crosshair · lines · markers · overlay render prop
   · pointer callbacks in (index, price) space for drawing tools. */
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Move, Plus, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import type { Candle } from "./market";
import { closesPath, fmtPrice } from "./market";
import { clamp, useZoomPan } from "./fx";
import { cn } from "../utils/cn";

export type ChartScales = {
  W: number; H: number; plotH: number;
  x: (i: number) => number; y: (v: number) => number;
  invX: (px: number) => number; invY: (py: number) => number;
  bw: number; start: number; end: number; min: number; max: number;
};
export type ChartLine = { v: number; color: string; label?: string; dash?: boolean };
export type ChartMarker = { i: number; label: string; color: string };
export type ChartPointer = { kind: "down" | "move" | "up"; i: number; v: number; snapped: { i: number; v: number } };

export function ZoomChart({
  candles, height = 280, accent = "#8ef23c", lines = [], markers = [], overlay, onHover,
  showVolume = true, minimap = true, initialSpan, priceScale = 1, highlight, style = "candles",
  panEnabled = true, onPointer, magnet = false, cursor, children,
}: {
  candles: Candle[]; height?: number; accent?: string; lines?: ChartLine[]; markers?: ChartMarker[];
  overlay?: (s: ChartScales) => ReactNode; onHover?: (i: number | null) => void; showVolume?: boolean;
  minimap?: boolean; initialSpan?: number; priceScale?: number; highlight?: [number, number] | null;
  style?: "candles" | "line" | "area" | "ohlc"; panEnabled?: boolean; onPointer?: (p: ChartPointer) => void;
  magnet?: boolean; cursor?: string; children?: ReactNode;
}) {
  const zp = useZoomPan(candles.length, { minSpan: 10, initialSpan });
  const [hover, setHover] = useState<{ i: number; v: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const miniDrag = useRef(false);
  const W = 720;
  const H = height;
  const volH = showVolume ? 36 : 0;
  const plotH = H - volH - 18;

  const i0 = Math.max(0, Math.floor(zp.start));
  const i1 = Math.min(candles.length - 1, Math.ceil(zp.end));
  const { min, max, maxV } = useMemo(() => {
    let mn = Infinity, mx = -Infinity, mv = 1;
    for (let i = i0; i <= i1; i++) {
      const c = candles[i];
      if (!c) continue;
      if (c.l < mn) mn = c.l;
      if (c.h > mx) mx = c.h;
      if (c.v > mv) mv = c.v;
    }
    if (!isFinite(mn)) { mn = 0; mx = 1; }
    const pad = (mx - mn) * 0.08 || 1;
    return { min: mn - pad, max: mx + pad, maxV: mv };
  }, [candles, i0, i1]);

  const span = Math.max(1, zp.span);
  const bw = W / span;
  const x = (i: number) => ((i - zp.start + 0.5) / span) * W;
  const y = (v: number) => 8 + (1 - (v - min) / (max - min || 1)) * plotH;
  const invX = (px: number) => zp.start + (px / W) * span - 0.5;
  const invY = (py: number) => min + (1 - (py - 8) / plotH) * (max - min);
  const scales: ChartScales = { W, H, plotH, x, y, invX, invY, bw, start: zp.start, end: zp.end, min, max };

  const toPoint = (clientX: number, clientY: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return null;
    const px = ((clientX - r.left) / r.width) * W;
    const py = ((clientY - r.top) / r.height) * H;
    const fi = clamp(invX(px), 0, candles.length - 1);
    const v = invY(py);
    const si = Math.round(fi);
    const c = candles[si];
    let sv = v;
    if (c && magnet) {
      const opts = [c.o, c.h, c.l, c.c];
      sv = opts.reduce((b, o) => (Math.abs(o - v) < Math.abs(b - v) ? o : b), opts[0]);
    }
    return { i: fi, v, snapped: { i: magnet ? si : fi, v: sv } };
  };

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let k = 0; k <= 4; k++) out.push(min + ((max - min) * k) / 4);
    return out;
  }, [min, max]);

  const last = candles[candles.length - 1];
  const hc = hover ? candles[Math.round(clamp(hover.i, 0, candles.length - 1))] : null;
  const closes = useMemo(() => candles.map((c) => c.c), [candles]);

  const linePath = useMemo(() => {
    let d = "";
    for (let i = i0; i <= i1; i++) d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(candles[i].c).toFixed(1)} `;
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, i0, i1, zp.start, zp.end, min, max, plotH]);

  return (
    <div className="relative">
      <div
        ref={zp.ref}
        className={cn("panel-inset relative overflow-hidden p-1.5 touch-none select-none", panEnabled ? (zp.dragging ? "cursor-grabbing" : "cursor-crosshair") : "")}
        style={cursor ? { cursor } : undefined}
        onPointerDown={(e) => {
          if (panEnabled) zp.bind.onPointerDown(e);
          const p = toPoint(e.clientX, e.clientY);
          if (p && onPointer) {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            onPointer({ kind: "down", ...p });
          }
        }}
        onPointerMove={(e) => {
          if (panEnabled) zp.bind.onPointerMove(e);
          const p = toPoint(e.clientX, e.clientY);
          if (p) {
            if (!zp.dragging) {
              setHover({ i: p.i, v: p.v });
              onHover?.(Math.round(p.i));
            }
            onPointer?.({ kind: "move", ...p });
          }
        }}
        onPointerUp={(e) => {
          if (panEnabled) zp.bind.onPointerUp();
          const p = toPoint(e.clientX, e.clientY);
          if (p) onPointer?.({ kind: "up", ...p });
        }}
        onPointerLeave={() => {
          if (panEnabled) zp.bind.onPointerUp();
          setHover(null);
          onHover?.(null);
        }}
        onDoubleClick={() => { if (panEnabled) zp.reset(); }}
      >
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block w-full">
          <defs>
            <linearGradient id={`zc-area-${accent.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={accent} stopOpacity=".35" />
              <stop offset="1" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <line key={t} x1={0} x2={W} y1={y(t)} y2={y(t)} stroke="rgba(122,156,255,.1)" strokeDasharray="3 6" />
          ))}
          {highlight && (
            <rect
              x={x(Math.min(highlight[0], highlight[1])) - bw / 2}
              width={Math.abs(highlight[1] - highlight[0]) * bw + bw}
              y={0} height={H} fill={accent} opacity={0.1} rx={6}
            />
          )}
          {(style === "area" || style === "line") && (
            <>
              {style === "area" && <path d={`${linePath} L${x(i1)},${8 + plotH} L${x(i0)},${8 + plotH} Z`} fill={`url(#zc-area-${accent.slice(1)})`} />}
              <path d={linePath} fill="none" stroke={accent} strokeWidth={2.2} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
            </>
          )}
          {Array.from({ length: i1 - i0 + 1 }, (_, k) => {
            const i = i0 + k;
            const c = candles[i];
            const up = c.c >= c.o;
            const col = up ? "#2ede8a" : "#ff5470";
            const cx = x(i);
            const w = Math.max(1, bw * 0.62);
            const isHover = hover && Math.round(hover.i) === i;
            return (
              <g key={i} opacity={hover && !isHover ? 0.72 : 1}>
                {showVolume && (
                  <rect x={cx - w / 2} y={H - 4 - (c.v / maxV) * volH} width={w} height={(c.v / maxV) * volH} fill={col} opacity={0.28} rx={1} />
                )}
                {style === "candles" && (
                  <>
                    <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={Math.max(1, Math.min(2, bw * 0.12))} />
                    <rect
                      x={cx - w / 2} y={y(Math.max(c.o, c.c))} width={w}
                      height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} rx={Math.min(2, w / 4)} fill={col}
                      style={isHover ? { filter: `drop-shadow(0 0 7px ${col})` } : undefined}
                    />
                  </>
                )}
                {style === "ohlc" && (
                  <>
                    <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.4} />
                    <line x1={cx - w / 2} x2={cx} y1={y(c.o)} y2={y(c.o)} stroke={col} strokeWidth={1.4} />
                    <line x1={cx} x2={cx + w / 2} y1={y(c.c)} y2={y(c.c)} stroke={col} strokeWidth={1.4} />
                  </>
                )}
              </g>
            );
          })}
          {lines.map((l, k) => (
            <g key={k}>
              <line x1={0} x2={W} y1={y(l.v)} y2={y(l.v)} stroke={l.color} strokeWidth={1.4} strokeDasharray={l.dash ? "6 5" : undefined} />
              {l.label && (
                <g>
                  <rect x={W - 92} y={y(l.v) - 9} width={90} height={18} rx={9} fill={l.color} />
                  <text x={W - 47} y={y(l.v) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#081130">{l.label}</text>
                </g>
              )}
            </g>
          ))}
          {markers.map((m, k) =>
            m.i >= zp.start - 1 && m.i <= zp.end + 1 ? (
              <g key={k}>
                <line x1={x(m.i)} x2={x(m.i)} y1={0} y2={H} stroke={m.color} strokeDasharray="3 4" opacity={0.7} />
                <circle cx={x(m.i)} cy={12} r={7} fill={m.color} stroke="#fff" strokeWidth={2} />
                <text x={x(m.i) + 10} y={16} fontSize={10} fontWeight={800} fill={m.color}>{m.label}</text>
              </g>
            ) : null,
          )}
          {overlay?.(scales)}
          {ticks.map((t) => (
            <text key={`t${t}`} x={W - 4} y={y(t) - 3} textAnchor="end" fontSize={9} fontWeight={700} fill="#5f75a8">{fmtPrice(t * priceScale)}</text>
          ))}
          {last && (
            <g>
              <line x1={0} x2={W} y1={y(last.c)} y2={y(last.c)} stroke={last.c >= last.o ? "#2ede8a" : "#ff5470"} strokeDasharray="2 4" opacity={0.7} />
              <rect x={W - 64} y={y(last.c) - 9} width={62} height={18} rx={5} fill={last.c >= last.o ? "#2ede8a" : "#ff5470"} />
              <text x={W - 33} y={y(last.c) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#081130">{fmtPrice(last.c * priceScale)}</text>
            </g>
          )}
          {hover && (
            <g pointerEvents="none">
              <line x1={x(Math.round(hover.i))} x2={x(Math.round(hover.i))} y1={0} y2={H} stroke="#9db9ff" strokeDasharray="4 4" />
              <line x1={0} x2={W} y1={y(hover.v)} y2={y(hover.v)} stroke="#9db9ff" strokeDasharray="4 4" opacity={0.6} />
              <rect x={0} y={y(hover.v) - 9} width={62} height={18} rx={5} fill="#1b3773" stroke="#5b8cff" />
              <text x={31} y={y(hover.v) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">{fmtPrice(hover.v * priceScale)}</text>
            </g>
          )}
        </svg>
        {children}

        {/* controls */}
        <div className="absolute left-3 top-3 flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <button onClick={() => zp.zoomAt(0.8)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-[#060d24]/85 text-white backdrop-blur hover:bg-white/10"><Plus size={13} /></button>
          <button onClick={() => zp.zoomAt(1.25)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-[#060d24]/85 text-white backdrop-blur hover:bg-white/10"><Minus size={13} /></button>
          <button onClick={() => zp.reset()} className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-[#060d24]/85 text-white backdrop-blur hover:bg-white/10"><RotateCcw size={12} /></button>
          <motion.span key={zp.zoom.toFixed(1)} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="ml-1 rounded-lg bg-[#060d24]/85 px-2 py-1 font-mono text-[10px] font-extrabold backdrop-blur" style={{ color: accent }}>
            {zp.zoom.toFixed(1)}×
          </motion.span>
          {panEnabled && <span className="ml-1 hidden items-center gap-1 rounded-lg bg-[#060d24]/70 px-2 py-1 text-[9px] font-bold text-[#7d92c4] sm:flex"><Move size={10} /> drag · wheel</span>}
        </div>

        <AnimatePresence>
          {hc && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="pointer-events-none absolute right-3 top-3 rounded-xl border border-white/15 bg-[#060d24]/92 px-3 py-1.5 backdrop-blur"
            >
              <span className="num-mono text-[10px] font-bold text-white">
                O {fmtPrice(hc.o * priceScale)} · H {fmtPrice(hc.h * priceScale)} · L {fmtPrice(hc.l * priceScale)} ·{" "}
                <b style={{ color: hc.c >= hc.o ? "#2ede8a" : "#ff5470" }}>C {fmtPrice(hc.c * priceScale)}</b>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {minimap && (
        <div
          className="relative mt-2 h-11 cursor-pointer touch-none overflow-hidden rounded-xl border border-white/10 bg-black/30"
          onPointerDown={(e) => {
            miniDrag.current = true;
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            const c = ((e.clientX - r.left) / r.width) * candles.length;
            const s = zp.span;
            const na = clamp(c - s / 2, 0, candles.length - s);
            zp.setWin([na, na + s]);
          }}
          onPointerMove={(e) => {
            if (!miniDrag.current) return;
            const r = e.currentTarget.getBoundingClientRect();
            const c = ((e.clientX - r.left) / r.width) * candles.length;
            const s = zp.span;
            const na = clamp(c - s / 2, 0, candles.length - s);
            zp.setWin([na, na + s]);
          }}
          onPointerUp={() => { miniDrag.current = false; }}
        >
          <svg viewBox="0 0 720 44" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={closesPath(closes, 720, 44, 5)} fill="none" stroke="#5f75a8" strokeWidth={1.5} />
          </svg>
          <motion.div
            className="absolute inset-y-0 rounded-lg border-2"
            style={{ borderColor: accent, background: `${accent}1f`, boxShadow: `0 0 14px ${accent}55` }}
            animate={{ left: `${(zp.start / candles.length) * 100}%`, width: `${(zp.span / candles.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        </div>
      )}
    </div>
  );
}
