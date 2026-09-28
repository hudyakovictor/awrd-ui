import { useMemo } from "react";
import { motion } from "framer-motion";
import { Coin, Star } from "./ui";

const R = (a: number, b: number) => a + Math.random() * (b - a);

/* ─── ambient dust ─── */
export function Dust({ n = 22 }: { n?: number }) {
  const d = useMemo(() => Array.from({ length: n }, (_, i) => ({
    i, x: R(0, 100), s: R(2, 5), dur: R(8, 17), dl: R(0, 14), t: Math.random() > 0.5,
  })), [n]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {d.map((p) => (
        <motion.span key={p.i} className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: -8, width: p.s, height: p.s, background: p.t ? "#1ff0c8" : "#ffd14a", boxShadow: `0 0 7px ${p.t ? "#1ff0c8" : "#ffd14a"}` }}
          animate={{ y: [0, -760], opacity: [0, 0.85, 0.6, 0], x: [0, R(-26, 26)] }}
          transition={{ duration: p.dur, delay: p.dl, repeat: Infinity, ease: "linear" }} />
      ))}
    </div>
  );
}

/* ─── sparkles ─── */
export function Sparkles({ n = 8 }: { n?: number }) {
  const s = useMemo(() => Array.from({ length: n }, (_, i) => ({ i, x: R(0, 100), y: R(0, 100), d: R(0, 3), sc: R(0.5, 1.1) })), [n]);
  return (
    <div className="pointer-events-none absolute inset-0">
      {s.map((p) => (
        <span key={p.i} className="a-tw absolute" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${p.d}s`, transform: `scale(${p.sc})` }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 0c.5 4.2 2.8 6.5 7 7-4.2.5-6.5 2.8-7 7-.5-4.2-2.8-6.5-7-7 4.2-.5 6.5-2.8 7-7z" fill="#fff" /></svg>
        </span>
      ))}
    </div>
  );
}

/* ─── blobs ─── */
export const Blobs = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="a-drift absolute -left-28 -top-24 h-80 w-80 rounded-full bg-aqua/14 blur-3xl" />
    <div className="a-drift absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-grape/12 blur-3xl" style={{ animationDuration: "17s" }} />
    <div className="a-drift absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-teal/10 blur-3xl" style={{ animationDuration: "21s" }} />
  </div>
);

/* ─── decorative candles ─── */
export function Candles({ n = 26, op = 0.15 }: { n?: number; op?: number }) {
  const cs = useMemo(() => {
    let p = 50;
    return Array.from({ length: n }, (_, i) => {
      const o = p, c = p + R(-20, 22);
      p = Math.max(15, Math.min(85, c));
      return { i, o, c: p, h: Math.max(o, p) + R(2, 9), l: Math.min(o, p) - R(2, 9), up: p >= o };
    });
  }, [n]);
  const lo = Math.min(...cs.map((c) => c.l)), hi = Math.max(...cs.map((c) => c.h));
  const Y = (v: number) => 100 - ((v - lo) / (hi - lo)) * 82 - 9;
  const bw = 100 / n;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ opacity: op }}>
      {cs.map((c) => {
        const x = c.i * bw + bw / 2, col = c.up ? "#1ff0c8" : "#ff5c6e";
        return (
          <g key={c.i}>
            <rect x={x - 0.16} y={Y(c.h)} width={0.32} height={Math.abs(Y(c.l) - Y(c.h))} fill={col} />
            <rect x={x - bw * 0.3} y={Math.min(Y(c.o), Y(c.c))} width={bw * 0.6} height={Math.max(0.9, Math.abs(Y(c.o) - Y(c.c)))} fill={col} rx={0.35} />
          </g>
        );
      })}
    </svg>
  );
}

/* ─── light rays ─── */
export const Rays = ({ className = "", dur = 46 }: { className?: string; dur?: number }) => (
  <div className={`pointer-events-none absolute ${className}`}>
    <div className="rays a-spin absolute inset-0" style={{ animationDuration: `${dur}s` }} />
  </div>
);

/* ─── coin rain ─── */
export function CoinRain({ n = 24 }: { n?: number }) {
  const c = useMemo(() => Array.from({ length: n }, (_, i) => ({ i, x: R(0, 95), dl: R(0, 1), du: R(1.1, 2), s: R(15, 30) })), [n]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {c.map((p) => (
        <span key={p.i} className="absolute top-0" style={{ left: `${p.x}%`, opacity: 0, animation: `coinfall ${p.du}s cubic-bezier(.4,0,.8,.6) ${p.dl}s forwards` }}>
          <Coin s={p.s} />
        </span>
      ))}
    </div>
  );
}

/* ─── confetti ─── */
const CC = ["#1ff0c8", "#ffd14a", "#ff4d8d", "#9a6bff", "#63b3ff", "#ffffff", "#4ceb96"];
export function Confetti({ n = 46, burst = false }: { n?: number; burst?: boolean }) {
  const p = useMemo(() => Array.from({ length: n }, (_, i) => ({
    i, x: R(-160, 160), y: burst ? R(-80, -300) : R(-60, -280), r: R(0, 900), c: CC[i % CC.length], w: R(5, 10), h: R(8, 16), dl: burst ? 0 : R(0, 0.3), star: i % 7 === 0,
  })), [n, burst]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {p.map((q) => (
        <motion.span key={q.i} className="absolute left-1/2 top-[34%]"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: q.x, y: [0, q.y, 460], rotate: q.r, opacity: [1, 1, 0] }}
          transition={{ duration: 2.4, delay: q.dl, ease: [0.15, 0.55, 0.6, 1] }}>
          {q.star ? <Star s={13} /> : <span className="block rounded-[2px]" style={{ width: q.w, height: q.h, background: q.c }} />}
        </motion.span>
      ))}
    </div>
  );
}

/* ─── radial burst at point ─── */
export function Burst({ x, y, c = "#1ff0c8", n = 14, r = 90 }: { x: number; y: number; c?: string; n?: number; r?: number }) {
  const p = useMemo(() => Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2 + R(-0.2, 0.2);
    const d = R(r * 0.45, r);
    return { i, dx: Math.cos(ang) * d, dy: Math.sin(ang) * d, s: R(0.4, 1) };
  }), [n, r]);
  return (
    <div className="pointer-events-none absolute z-30" style={{ left: x, top: y }}>
      {p.map((q) => (
        <motion.span key={q.i} className="absolute block rounded-full"
          style={{ width: 7 * q.s, height: 7 * q.s, background: q.i % 3 ? c : "#fff", boxShadow: `0 0 8px ${c}`, marginLeft: -3, marginTop: -3 }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: q.dx, y: q.dy + 20, opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.55 + q.s * 0.25, ease: [0.16, 1, 0.3, 1] }} />
      ))}
    </div>
  );
}

/* ─── shockwave ring ─── */
export const Shock = ({ x, y, c = "#1ff0c8" }: { x: number; y: number; c?: string }) => (
  <motion.span className="pointer-events-none absolute z-20 rounded-full"
    style={{ left: x, top: y, border: `3px solid ${c}`, boxShadow: `0 0 18px ${c}, inset 0 0 18px ${c}` }}
    initial={{ width: 8, height: 8, x: -4, y: -4, opacity: 0.95 }}
    animate={{ width: 150, height: 150, x: -75, y: -75, opacity: 0 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} />
);

/* ─── impact flash ─── */
export const Impact = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <motion.span className="pointer-events-none absolute z-20 rounded-full"
    style={{ left: x, top: y, background: `radial-gradient(circle, #fff 0%, ${c} 35%, transparent 70%)` }}
    initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
    animate={{ width: 150, height: 150, x: -75, y: -75, opacity: 0 }}
    transition={{ duration: 0.45, ease: "easeOut" }} />
);

/* ─── combat float text ─── */
export function FloatText({ t, c, x, y = 40, big = false }: { t: string; c: string; x: number; y?: number; big?: boolean }) {
  return (
    <motion.span
      initial={{ y: 12, scale: 0.5, opacity: 0 }} animate={{ y: -88, scale: big ? 1.35 : 1, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], times: [0, 0.16, 0.8, 1] }}
      className="pointer-events-none absolute z-30 font-display font-black italic"
      style={{ left: `calc(50% + ${x}px)`, top: `${y}%`, fontSize: big ? 30 : 24, color: c, WebkitTextStroke: "5px rgba(6,12,32,.92)", paintOrder: "stroke fill", textShadow: "0 3px 0 rgba(0,0,0,.45)" }}>
      {t}
    </motion.span>
  );
}

/* ─── vignette flash ─── */
export const Vignette = ({ id, color, strong = 0.5 }: { id: number; color: string; strong?: number }) => (
  <motion.div key={id} className="pointer-events-none absolute inset-0 z-[45]"
    style={{ background: `radial-gradient(ellipse at center, transparent 52%, ${color})` }}
    initial={{ opacity: 0 }} animate={{ opacity: [0, strong, 0] }} transition={{ duration: 0.55, times: [0, 0.25, 1] }} />
);

/* ─── coin flight to HUD pill ─── */
export function CoinFly({ from, to, n = 8, onDone }: { from: { x: number; y: number }; to: { x: number; y: number }; n?: number; onDone?: () => void }) {
  const cs = useMemo(() => Array.from({ length: n }, (_, i) => ({
    i, ox: R(-30, 30), oy: R(-26, 26), dl: i * 0.055, dur: R(0.6, 0.85), s: R(15, 22),
  })), [n]);
  return (
    <div className="pointer-events-none absolute inset-0 z-[60]">
      {cs.map((p) => (
        <motion.span key={p.i} className="absolute"
          style={{ left: from.x + p.ox, top: from.y + p.oy }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.25, 1, 0.7], opacity: [0, 1, 1, 0],
            left: [from.x + p.ox, from.x + p.ox * 1.4, to.x], top: [from.y + p.oy, from.y + p.oy - 60, to.y],
          }}
          transition={{ duration: p.dur + 0.35, delay: p.dl, ease: [0.4, 0, 0.55, 1] }}
          onAnimationComplete={p.i === n - 1 ? onDone : undefined}>
          <Coin s={p.s} />
        </motion.span>
      ))}
    </div>
  );
}
