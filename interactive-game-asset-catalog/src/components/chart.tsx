import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EASE } from "../motion/tokens";

export interface Bar extends Candle { v: number }
export interface Candle { o: number; c: number; h: number; l: number }

/** Детерминированная серия: одинаковые графики при каждом рендере. */
export function genSeries(n: number, seed = 7, drift = 0.12, vol = 1): Bar[] {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out: Bar[] = [];
  let p = 60;
  for (let i = 0; i < n; i++) {
    const wave = Math.sin(i / 5.5) * 2.2 * vol;
    const o = p;
    const c = o + (r() - 0.48 + drift) * 7 * vol + wave * 0.35;
    const h = Math.max(o, c) + r() * 3.4 * vol;
    const l = Math.min(o, c) - r() * 3.4 * vol;
    out.push({ o, c, h, l, v: 0.3 + r() * 0.7 + (Math.abs(c - o) / 7) * 0.8 });
    p = c;
  }
  return out;
}

/** EMA для линии тренда поверх свечей. */
export function ema(data: Bar[], period = 8) {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = data[0].c;
  data.forEach((d, i) => {
    prev = i === 0 ? d.c : d.c * k + prev * (1 - k);
    out.push(prev);
  });
  return out;
}

const UP = "#3ddc84";
const DN = "#ff4d5e";

/**
 * PRICE CHART — свечи + объём + EMA + перекрестие с магнитом к свече.
 * Секреты:
 *  · индекс перекрестия = round((x - pad) / cw) → прилипание к свече, а не пиксельная точность;
 *  · OHLC-ридаут сверху меняется мгновенно, линия — с пружиной (два темпа);
 *  · ценовая метка справа «прилипает» к close бару, а не к курсору.
 */
export function PriceChart({
  data, w = 260, h = 150, volume = true, crosshair = true, visible, pad = 6, tf = "15M", pair = "BTC/USDT", glow = true,
}: {
  data: Bar[]; w?: number; h?: number; volume?: boolean; crosshair?: boolean; visible?: number; pad?: number; tf?: string; pair?: string; glow?: boolean;
}) {
  const [idx, setIdx] = useState<number | null>(null);
  const vh = volume ? h * 0.2 : 0;
  const ch = h - vh - pad * 2 - (volume ? 6 : 0);
  const vis = visible ?? data.length;
  const view = data.slice(0, Math.max(2, vis));
  const min = Math.min(...view.map((d) => d.l));
  const max = Math.max(...view.map((d) => d.h));
  const lo = min - (max - min) * 0.06;
  const hi = max + (max - min) * 0.06;
  const vmax = Math.max(...data.map((d) => d.v));
  const cw = w / data.length;
  const y = (v: number) => pad + ch - ((v - lo) / (hi - lo)) * ch;
  const line = useMemo(() => ema(data), [data]);
  const last = view[view.length - 1];
  const hovered = idx !== null ? data[idx] : null;
  const up = last ? last.c >= last.o : true;
  const cCol = up ? UP : DN;

  const linePath = line
    .map((v, i) => `${i ? "L" : "M"}${(i * cw + cw / 2).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!crosshair) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(x / cw - 0.5)));
    setIdx(i);
  };

  return (
    <div
      className="relative select-none"
      style={{ width: w, height: h }}
      onPointerMove={onMove}
      onPointerLeave={() => setIdx(null)}
    >
      <svg width={w} height={h} className="overflow-visible">
        <defs>
          <linearGradient id="pcVol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4cc3ff" stopOpacity=".5" />
            <stop offset="1" stopColor="#4cc3ff" stopOpacity=".05" />
          </linearGradient>
          {glow && (
            <filter id="pcGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.8" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>
        {/* сетка */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1="0" x2={w} y1={pad + ch * t} y2={pad + ch * t} stroke="#ffffff" strokeOpacity=".05" strokeDasharray={t === 1 ? "0" : "2 4"} />
        ))}
        {/* объёмы */}
        {volume &&
          view.map((d, i) => (
            <rect key={`v${i}`} x={i * cw + cw * 0.22} y={h - pad - (d.v / vmax) * vh} width={cw * 0.56} height={(d.v / vmax) * vh} rx={1} fill="url(#pcVol)" opacity={idx === i ? 1 : 0.55} />
          ))}
        {/* EMA */}
        <motion.path d={linePath} fill="none" stroke="#ffc34d" strokeWidth="1.4" strokeLinecap="round" strokeOpacity=".85" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EASE.outExpo }} style={{ filter: "drop-shadow(0 0 3px #ffc34daa)" }} />
        {/* свечи */}
        {view.map((d, i) => {
          const u = d.c >= d.o;
          const col = u ? UP : DN;
          const top = y(Math.max(d.o, d.c));
          const bh = Math.max(1.6, Math.abs(y(d.o) - y(d.c)));
          const dim = idx !== null && idx !== i;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: dim ? 0.45 : 1, scaleY: 1 }}
              transition={{ delay: i * 0.018, type: "spring", stiffness: 500, damping: 26 }}
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              filter={glow ? "url(#pcGlow)" : undefined}
            >
              <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth={1.3} />
              <rect x={i * cw + cw * 0.2} y={top} width={cw * 0.6} height={bh} rx={1.4} fill={col} />
            </motion.g>
          );
        })}
        {/* перекрестие */}
        {idx !== null && hovered && crosshair && (
          <g pointerEvents="none">
            <line x1={idx * cw + cw / 2} x2={idx * cw + cw / 2} y1={0} y2={h - pad} stroke="#ffffff" strokeOpacity=".4" strokeDasharray="3 3" />
            <line x1="0" x2={w} y1={y(hovered.c)} y2={y(hovered.c)} stroke={hovered.c >= hovered.o ? UP : DN} strokeOpacity=".55" strokeDasharray="3 3" />
            <rect x={w - 2} y={y(hovered.c) - 7} width={0} height={0} />
          </g>
        )}
      </svg>

      {/* заголовок + OHLC */}
      <div className="pointer-events-none absolute left-0 top-0 flex flex-wrap items-baseline gap-1.5 font-mono text-[9px]">
        <span className="font-bold text-white/70">{pair}</span>
        <span className="text-white/35">{tf}</span>
        {hovered ? (
          <>
            <span className="text-white/45">O</span><span className={hovered.c >= hovered.o ? "text-[#3ddc84]" : "text-[#ff4d5e]"}>{hovered.o.toFixed(1)}</span>
            <span className="text-white/45">C</span><span className={hovered.c >= hovered.o ? "text-[#3ddc84]" : "text-[#ff4d5e]"}>{hovered.c.toFixed(1)}</span>
          </>
        ) : (
          <>
            <span className="text-white/45">C</span>
            <span style={{ color: cCol }}>{last ? last.c.toFixed(1) : ""}</span>
          </>
        )}
      </div>

      {/* ценовая метка справа */}
      {hovered && crosshair && (
        <motion.div
          layout
          transition={SPRINGY}
          className="pointer-events-none absolute rounded px-1 py-0.5 font-mono text-[9px] font-bold text-black"
          style={{ right: -2, top: y(hovered.c) - 8, background: hovered.c >= hovered.o ? UP : DN }}
        >
          {hovered.c.toFixed(1)}
        </motion.div>
      )}
      {!hovered && last && (
        <div className="pointer-events-none absolute rounded px-1 py-0.5 font-mono text-[9px] font-bold text-black" style={{ right: -2, top: y(last.c) - 8, background: cCol }}>
          {last.c.toFixed(1)}
        </div>
      )}
    </div>
  );
}

const SPRINGY = { type: "spring" as const, stiffness: 700, damping: 34 };

/* ============================================================
   DEPTH LADDER — стакан заявок
   ============================================================ */
export function makeBook(mid: number, rows = 9, seed = 3, imbalance = 1) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const asks = Array.from({ length: rows }, (_, i) => ({ p: mid + (rows - i) * 0.5, q: r() * 900 * imbalance }));
  const bids = Array.from({ length: rows }, (_, i) => ({ p: mid - (i + 1) * 0.5, q: r() * 900 * imbalance }));
  return { asks, bids };
}

export function DepthLadder({ book, w = 240, rowH = 15 }: { book: { asks: { p: number; q: number }[]; bids: { p: number; q: number }[] }; w?: number; rowH?: number }) {
  const maxQ = Math.max(...book.asks.map((a) => a.q), ...book.bids.map((b) => b.q));
  const Row = ({ p, q, side, i }: { p: number; q: number; side: "a" | "b"; i: number }) => {
    const col = side === "a" ? DN : UP;
    return (
      <motion.div
        initial={{ opacity: 0, x: side === "a" ? 24 : -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: side === "a" ? 24 : -24 }}
        transition={{ delay: i * 0.025, ...SPRINGY }}
        className="relative flex items-center justify-between overflow-hidden px-2 font-mono text-[9px]"
        style={{ height: rowH }}
      >
        <motion.div className="absolute inset-y-0" style={{ background: col, opacity: 0.16, right: side === "a" ? 0 : undefined, left: side === "b" ? 0 : undefined }} animate={{ width: `${(q / maxQ) * 100}%` }} transition={SPRINGY} />
        <span className="relative" style={{ color: col }}>{p.toFixed(1)}</span>
        <span className="relative text-white/45">{Math.round(q)}</span>
      </motion.div>
    );
  };
  return (
    <div style={{ width: w }}>
      <div className="flex flex-col">{book.asks.map((a, i) => <Row key={a.p} {...a} side="a" i={i} />)}</div>
      <div className="my-1 flex items-center justify-between border-y border-white/10 px-2 py-1 font-mono text-[10px] font-bold">
        <span className="text-white">{book.asks[0].p.toFixed(1)}</span>
        <span className="text-[8px] uppercase tracking-widest text-white/35">spread</span>
      </div>
      <div className="flex flex-col">{book.bids.map((b, i) => <Row key={b.p} {...b} side="b" i={i} />)}</div>
    </div>
  );
}
