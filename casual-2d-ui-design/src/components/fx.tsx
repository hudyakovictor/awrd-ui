import { useMemo } from "react";
import { motion } from "framer-motion";
import { CoinIcon } from "./ui";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/* ---------- ambient rising particles ---------- */
export function Particles({ n = 26 }: { n?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        x: rand(0, 100),
        size: rand(2, 5),
        dur: rand(7, 16),
        delay: rand(0, 12),
        teal: Math.random() > 0.45,
      })),
    [n]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            bottom: -10,
            width: d.size,
            height: d.size,
            background: d.teal ? "#19f2c4" : "#ffd76b",
            boxShadow: `0 0 8px ${d.teal ? "#19f2c4" : "#ffd76b"}`,
          }}
          animate={{ y: [0, -900], opacity: [0, 0.9, 0.7, 0], x: [0, rand(-30, 30)] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ---------- drifting blurred blobs ---------- */
export function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="anim-drift absolute -top-24 -left-24 h-80 w-80 rounded-full bg-teal2/14 blur-3xl" />
      <div className="anim-drift absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-grape/13 blur-3xl" style={{ animationDuration: "15s" }} />
      <div className="anim-drift absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-sky/10 blur-3xl" style={{ animationDuration: "18s" }} />
    </div>
  );
}

/* ---------- decorative candlestick field (bg) ---------- */
export function CandleField() {
  const candles = useMemo(() => {
    let price = 50;
    return Array.from({ length: 26 }, (_, i) => {
      const o = price;
      const c = price + rand(-22, 24);
      const h = Math.max(o, c) + rand(2, 10);
      const l = Math.min(o, c) - rand(2, 10);
      price = c;
      return { i, o, c, h, l, up: c >= o };
    });
  }, []);
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const Y = (v: number) => 100 - ((v - min) / (max - min)) * 84 - 8;
  const bw = 100 / candles.length;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]" viewBox="0 0 100 100" preserveAspectRatio="none">
      {candles.map((c) => {
        const x = c.i * bw + bw / 2;
        const col = c.up ? "#19f2c4" : "#ff5468";
        return (
          <g key={c.i}>
            <line x1={x} y1={Y(c.h)} x2={x} y2={Y(c.l)} stroke={col} strokeWidth={0.35} />
            <rect x={x - bw * 0.3} y={Math.min(Y(c.o), Y(c.c))} width={bw * 0.6} height={Math.max(0.8, Math.abs(Y(c.o) - Y(c.c)))} fill={col} rx={0.3} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- rotating light rays ---------- */
export const Rays = ({ className = "" }: { className?: string }) => (
  <div className={`rays pointer-events-none absolute inset-[-60%] ${className}`} />
);

/* ---------- coin rain ---------- */
export function CoinRain({ n = 22 }: { n?: number }) {
  const coins = useMemo(
    () => Array.from({ length: n }, (_, i) => ({ id: i, x: rand(2, 92), delay: rand(0, 0.9), dur: rand(1.1, 1.9), size: rand(16, 30) })),
    [n]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {coins.map((c) => (
        <span key={c.id} className="absolute top-0" style={{ left: `${c.x}%`, animation: `coinfall ${c.dur}s ease-in ${c.delay}s forwards`, opacity: 0 }}>
          <CoinIcon size={c.size} />
        </span>
      ))}
    </div>
  );
}

/* ---------- confetti burst ---------- */
const CCOLORS = ["#19f2c4", "#ffcb40", "#ff4d8d", "#8b5cff", "#4ba3ff", "#ffffff"];
export function Confetti({ n = 40 }: { n?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        x: rand(-160, 160),
        y: rand(-40, -260),
        r: rand(0, 720),
        color: CCOLORS[i % CCOLORS.length],
        w: rand(5, 9),
        h: rand(8, 14),
        delay: rand(0, 0.25),
      })),
    [n]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-1/3 rounded-[2px]"
          style={{ width: p.w, height: p.h, background: p.color }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, p.y, 420], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: 2.4, delay: p.delay, ease: [0.15, 0.6, 0.6, 1] }}
        />
      ))}
    </div>
  );
}

/* ---------- damage / heal floating number ---------- */
export function FloatNum({ text, color, x = 0 }: { text: string; color: string; x?: number }) {
  return (
    <span
      className="anim-rise pointer-events-none absolute font-display text-2xl font-black italic"
      style={{
        left: `calc(50% + ${x}px)`,
        top: "38%",
        color,
        WebkitTextStroke: "5px rgba(10,18,42,.9)",
        paintOrder: "stroke fill",
        textShadow: "0 3px 0 rgba(0,0,0,.35)",
      }}
    >
      {text}
    </span>
  );
}
