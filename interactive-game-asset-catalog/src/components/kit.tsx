import { animate, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { bezierAt, type Bezier } from "../motion/tokens";

/* ============================ PHONE ============================ */
export function Phone({ children, tint = "#2ee6c5", className = "" }: { children: ReactNode; tint?: string; className?: string }) {
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: 300, height: 624 }}>
      <div
        className="absolute -inset-6 rounded-[70px] opacity-40 blur-3xl"
        style={{ background: `radial-gradient(closest-side, ${tint}55, transparent)` }}
      />
      <div className="relative h-full w-full rounded-[46px] bg-gradient-to-b from-[#2a3350] via-[#141a2c] to-[#0b0f1c] p-[7px] shadow-[0_40px_80px_-30px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.15)]">
        <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-deep" style={{ isolation: "isolate" }}>
          {children}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex h-9 items-center justify-between px-7 pt-1 text-[11px] font-bold text-white/90">
            <span>9:41</span>
            <div className="absolute left-1/2 top-2 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1">
              <svg width="16" height="10" viewBox="0 0 16 10"><path d="M1 9h2V7H1zm4 0h2V5H5zm4 0h2V3H9zm4 0h2V1h-2z" fill="currentColor" /></svg>
              <svg width="22" height="10" viewBox="0 0 22 10"><rect x=".5" y=".5" width="18" height="9" rx="2.5" stroke="currentColor" fill="none" opacity=".5" /><rect x="2" y="2" width="13" height="6" rx="1.5" fill="currentColor" /></svg>
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-[60] h-1 w-28 -translate-x-1/2 rounded-full bg-white/40" />
        </div>
      </div>
    </div>
  );
}

/* ============================ ICONS ============================ */
type IP = { size?: number; className?: string; stroke?: number };
const S = ({ size = 20, className = "", stroke = 2, children }: IP & { children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
export const I = {
  trend: (p: IP) => <S {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></S>,
  bars: (p: IP) => <S {...p}><path d="M5 20V11M12 20V5M19 20v-7" /></S>,
  shield: (p: IP) => <S {...p}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></S>,
  clock: (p: IP) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>,
  lock: (p: IP) => <S {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></S>,
  swords: (p: IP) => <S {...p}><path d="M14.5 17.5L3 6V3h3l11.5 11.5" /><path d="M13 19l6-6M16 16l4 4M19 21l2-2" /><path d="M9.5 6.5L21 18v3h-3l-2.5-2.5" opacity=".0" /><path d="M14.5 6.5L18 3h3v3l-3.5 3.5" /><path d="M5 14l-2 2 2 2M8 17l-3 3" /></S>,
  cap: (p: IP) => <S {...p}><path d="M2 9l10-5 10 5-10 5z" /><path d="M6 11v5c3 2 9 2 12 0v-5" /></S>,
  cards: (p: IP) => <S {...p}><rect x="3" y="6" width="12" height="15" rx="2" /><path d="M8 3h11a2 2 0 012 2v13" /></S>,
  dots: (p: IP) => <S {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></S>,
  bell: (p: IP) => <S {...p}><path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 20a2 2 0 004 0" /></S>,
  arrowUp: (p: IP) => <S {...p}><path d="M12 19V5M5 12l7-7 7 7" /></S>,
  hourglass: (p: IP) => <S {...p}><path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9" /></S>,
  warn: (p: IP) => <S {...p}><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></S>,
  check: (p: IP) => <S {...p}><path d="M5 12l5 5 9-10" /></S>,
  x: (p: IP) => <S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>,
  trophy: (p: IP) => <S {...p}><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0z" /><path d="M7 6H4a3 3 0 003 4M17 6h3a3 3 0 01-3 4" /></S>,
  brain: (p: IP) => <S {...p}><path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 1V5a2 2 0 00-3-1zM15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 1" /></S>,
  flame: (p: IP) => <S {...p}><path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-2-1-2-3-2-3-2 2-3 5-3 8 0 4 3 7 7 7z" /></S>,
  eye: (p: IP) => <S {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></S>,
  news: (p: IP) => <S {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h6M7 12h10M7 16h10" /></S>,
  play: (p: IP) => <S {...p}><path d="M7 4l13 8-13 8z" /></S>,
  replay: (p: IP) => <S {...p}><path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.3" /><path d="M3 3v4h4" /></S>,
  arrowL: (p: IP) => <S {...p}><path d="M15 5l-7 7 7 7" /></S>,
  arrowR: (p: IP) => <S {...p}><path d="M9 5l7 7-7 7" /></S>,
  target: (p: IP) => <S {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></S>,
  heart: (p: IP) => <S {...p}><path d="M12 20s-8-5-8-11a4.5 4.5 0 018-3 4.5 4.5 0 018 3c0 6-8 11-8 11z" /></S>,
  bolt: (p: IP) => <S {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></S>,
  gem: (p: IP) => <S {...p}><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20M12 21L8 9l4-6 4 6z" /></S>,
  layers: (p: IP) => <S {...p}><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></S>,
  sparkle: (p: IP) => <S {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></S>,
  code: (p: IP) => <S {...p}><path d="M8 7l-5 5 5 5M16 7l5 5-5 5" /></S>,
};

export function Coin({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <radialGradient id="cg" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff6cc" />
          <stop offset=".45" stopColor="#ffc34d" />
          <stop offset="1" stopColor="#a8620f" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#cg)" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="#8a4f0b" strokeOpacity=".5" strokeWidth="1.5" />
      <path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.1 3.1-.4z" fill="#fff1b8" opacity=".9" />
    </svg>
  );
}

/* ============================ CANDLES ============================ */
export interface Candle { o: number; c: number; h: number; l: number }
export function genCandles(n: number, seed = 7, drift = 0.15): Candle[] {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out: Candle[] = [];
  let p = 50;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + (r() - 0.5 + drift) * 9;
    const h = Math.max(o, c) + r() * 4;
    const l = Math.min(o, c) - r() * 4;
    out.push({ o, c, h, l });
    p = c;
  }
  return out;
}

export function Candles({
  data, w = 260, h = 140, visible, grow = true, delay = 0, step = 0.05, glow = true, highlight,
}: {
  data: Candle[]; w?: number; h?: number; visible?: number; grow?: boolean; delay?: number; step?: number; glow?: boolean; highlight?: number;
}) {
  const min = Math.min(...data.map((d) => d.l));
  const max = Math.max(...data.map((d) => d.h));
  const y = (v: number) => h - 8 - ((v - min) / (max - min)) * (h - 16);
  const cw = w / data.length;
  const vis = visible ?? data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {glow && (
        <defs>
          <filter id="cglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      )}
      {data.map((d, i) => {
        const up = d.c >= d.o;
        const col = up ? "#3ddc84" : "#ff4d5e";
        const x = i * cw + cw / 2;
        const top = y(Math.max(d.o, d.c));
        const bh = Math.max(2, Math.abs(y(d.o) - y(d.c)));
        const show = i < vis;
        return (
          <motion.g
            key={i}
            initial={grow ? { opacity: 0, scaleY: 0 } : false}
            animate={show ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
            transition={{ delay: show ? delay + (grow ? i * step : 0) : 0, type: "spring", stiffness: 500, damping: 26 }}
            style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
            filter={glow ? "url(#cglow)" : undefined}
          >
            <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth={1.4} />
            <rect x={x - cw * 0.32} y={top} width={cw * 0.64} height={bh} rx={1.5} fill={col} />
            {highlight === i && (
              <circle cx={x} cy={top + bh / 2} r={9} fill="none" stroke="#2ee6c5" strokeWidth={2}>
                <animate attributeName="r" values="7;13;7" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;.3;1" dur="1.4s" repeatCount="indefinite" />
              </circle>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ============================ COUNT UP ============================ */
export function fmt(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
}
export function CountUp({ to, from = 0, duration = 1.2, delay = 0, run = 0, suffix = "", className = "" }: { to: number; from?: number; duration?: number; delay?: number; run?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    el.textContent = fmt(from) + suffix;
    const c = animate(from, to, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = fmt(v) + suffix) });
    return () => c.stop();
  }, [to, from, duration, delay, run, suffix]);
  return <span ref={ref} className={`tabular-nums ${className}`} />;
}

/* ============================ TIMELINE ============================ */
export interface Track { label: string; start: number; dur: number; color?: string }
export function Timeline({ tracks, total, run }: { tracks: Track[]; total: number; run: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[.2em] text-white/40">
        <span>Хореография</span>
        <span className="font-mono">{total} ms</span>
      </div>
      <div className="relative space-y-1.5">
        {tracks.map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-28 shrink-0 truncate text-[11px] text-white/55">{t.label}</div>
            <div className="relative h-4 flex-1 rounded bg-white/[.03]">
              <motion.div
                key={run}
                initial={{ scaleX: 0, opacity: 0.4 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: t.start / 1000, duration: Math.max(0.05, t.dur / 1000), ease: "linear" }}
                className="absolute top-0 h-full origin-left rounded"
                style={{
                  left: `${(t.start / total) * 100}%`,
                  width: `${(t.dur / total) * 100}%`,
                  background: `linear-gradient(90deg, ${t.color ?? "#2ee6c5"}cc, ${t.color ?? "#2ee6c5"}55)`,
                  boxShadow: `0 0 12px ${t.color ?? "#2ee6c5"}55`,
                }}
              />
            </div>
          </div>
        ))}
        <div className="pointer-events-none absolute inset-y-0 left-[124px] right-0">
          <motion.div
            key={run}
            initial={{ left: "0%" }}
            animate={{ left: "100%" }}
            transition={{ duration: total / 1000, ease: "linear" }}
            className="absolute -bottom-1 -top-1 w-px bg-white shadow-[0_0_10px_#fff]"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================ CODE ============================ */
const KW = /\b(const|let|await|async|function|return|if|else|for|new|import|from|export|type|of|while|true|false)\b/;
export function Code({ code }: { code: string }) {
  const lines = useMemo(() => code.trim().split("\n"), [code]);
  const tok = (line: string) => {
    const parts: ReactNode[] = [];
    const re = /(\/\/.*$)|("[^"]*"|'[^']*'|`[^`]*`)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_]\w*\b)|(\s+)|([^\w\s])/g;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(line))) {
      const [t] = m;
      let c = "text-white/80";
      if (m[1]) c = "text-white/35 italic";
      else if (m[2]) c = "text-[#ffc34d]";
      else if (m[3]) c = "text-[#ff8fa0]";
      else if (m[4] && KW.test(t)) c = "text-[#9b7bff]";
      else if (m[4] && /^[A-Z]/.test(t)) c = "text-[#4cc3ff]";
      else if (m[4] && line[re.lastIndex] === "(") c = "text-[#2ee6c5]";
      else if (m[6]) c = "text-white/45";
      parts.push(<span key={k++} className={c}>{t}</span>);
    }
    return parts;
  };
  return (
    <pre className="max-h-[340px] overflow-auto rounded-2xl border border-white/5 bg-[#070b17] p-4 font-mono text-[11.5px] leading-[1.7]">
      {lines.map((l, i) => (
        <div key={i} className="flex">
          <span className="mr-4 w-5 shrink-0 select-none text-right text-white/15">{i + 1}</span>
          <span className="whitespace-pre">{tok(l)}</span>
        </div>
      ))}
    </pre>
  );
}

/* ============================ EASE CURVE ============================ */
export function EaseCurve({ bez, label, color = "#2ee6c5", dur = 1.4 }: { bez: Bezier; label: string; color?: string; dur?: number }) {
  const W = 120, H = 90, pad = 14;
  const minY = Math.min(0, ...Array.from({ length: 30 }, (_, i) => bezierAt(bez, i / 29)));
  const maxY = Math.max(1, ...Array.from({ length: 30 }, (_, i) => bezierAt(bez, i / 29)));
  const sy = (v: number) => H - pad - ((v - minY) / (maxY - minY)) * (H - pad * 2);
  const sx = (t: number) => pad + t * (W - pad * 2);
  const d = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40;
    return `${i ? "L" : "M"}${sx(t).toFixed(1)},${sy(bezierAt(bez, t)).toFixed(1)}`;
  }).join(" ");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const st = performance.now();
    const loop = (n: number) => {
      const p = ((n - st) / 1000) % (dur + 0.6);
      setT(Math.min(1, p / dur));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, dur]);
  const v = bezierAt(bez, t);
  return (
    <div ref={ref} className="rounded-2xl border border-white/5 bg-black/30 p-3">
      <div className="flex items-center gap-3">
        <svg width={W} height={H} className="shrink-0">
          <line x1={pad} x2={W - pad} y1={sy(0)} y2={sy(0)} stroke="#ffffff14" />
          <line x1={pad} x2={W - pad} y1={sy(1)} y2={sy(1)} stroke="#ffffff14" strokeDasharray="3 3" />
          <path d={d} fill="none" stroke={color} strokeWidth={2.2} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          <circle cx={sx(t)} cy={sy(v)} r={4} fill="#fff" />
        </svg>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/40">Кривая</div>
          <div className="font-display text-sm" style={{ color }}>{label}</div>
          <div className="mt-1 font-mono text-[10px] text-white/40">cubic-bezier({bez.join(", ")})</div>
          <div className="relative mt-2 h-6 rounded-full bg-white/5">
            <div className="absolute top-1 h-4 w-4 rounded-full" style={{ left: `calc(${v * 100}% * .85)`, background: color, boxShadow: `0 0 12px ${color}` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ SMALL ============================ */
export function Bar({ value, color = "#2ee6c5", className = "", delay = 0, run = 0 }: { value: number; color?: string; className?: string; delay?: number; run?: number }) {
  return (
    <div className={`relative h-2 overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        key={run}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: value }}
        transition={{ delay, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 origin-left rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 10px ${color}` }}
      />
    </div>
  );
}

export function TapHint({ text = "Нажми" }: { text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -4] }}
      transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.6 }}
      className="pointer-events-none rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.2em] text-white/80 backdrop-blur"
    >
      {text}
    </motion.div>
  );
}
