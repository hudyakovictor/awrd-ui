import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { FX } from "../components/kit";
import { cn } from "../utils/cn";

/* ================================================================== */
/*  SOUND DESIGN — synthesized, zero audio files                       */
/* ================================================================== */
type Note = [number, number, number, OscillatorType?, number?, number?];

const BANK = {
  correct: [
    [784, 0, 0.12, "triangle", 0.08],
    [1175, 0.09, 0.28, "triangle", 0.08],
  ],
  wrong: [
    [233, 0, 0.16, "square", 0.035, 196],
    [175, 0.13, 0.28, "square", 0.035, 130],
  ],
  pop: [[620, 0, 0.07, "sine", 0.09, 980]],
  select: [[540, 0, 0.05, "sine", 0.07, 640]],
  whoosh: [[260, 0, 0.26, "sawtooth", 0.018, 1400]],
  coin: [
    [988, 0, 0.07, "square", 0.03],
    [1319, 0.06, 0.2, "square", 0.03],
  ],
  chest: [
    [392, 0, 0.1, "triangle", 0.06],
    [523, 0.08, 0.1, "triangle", 0.06],
    [659, 0.16, 0.1, "triangle", 0.06],
    [1046, 0.24, 0.45, "triangle", 0.07],
  ],
  tick: [[1500, 0, 0.022, "square", 0.018]],
  levelup: [
    [523, 0, 0.12, "triangle", 0.07],
    [659, 0.1, 0.12, "triangle", 0.07],
    [784, 0.2, 0.12, "triangle", 0.07],
    [1046, 0.3, 0.12, "triangle", 0.07],
    [1318, 0.42, 0.5, "triangle", 0.08],
  ],
  unlock: [
    [440, 0, 0.08, "sine", 0.07],
    [880, 0.07, 0.25, "sine", 0.07],
  ],
  lose: [
    [392, 0, 0.18, "triangle", 0.06],
    [330, 0.16, 0.18, "triangle", 0.06],
    [262, 0.32, 0.45, "triangle", 0.06, 220],
  ],
  hit: [[140, 0, 0.12, "square", 0.05, 60]],
  combo: [
    [880, 0, 0.06, "square", 0.03],
    [1175, 0.05, 0.06, "square", 0.03],
    [1568, 0.1, 0.16, "square", 0.03],
  ],
  swipe: [[400, 0, 0.12, "sine", 0.05, 900]],
  countdown: [[660, 0, 0.09, "square", 0.03]],
  go: [[1320, 0, 0.3, "square", 0.035]],
} satisfies Record<string, Note[]>;

export type SfxName = keyof typeof BANK;

const HAPTIC: Partial<Record<SfxName, number | number[]>> = {
  correct: 12,
  wrong: [18, 40, 18],
  pop: 6,
  select: 5,
  coin: 8,
  chest: [10, 30, 10, 30, 40],
  levelup: [10, 20, 10, 20, 60],
  hit: 30,
  lose: [40, 60, 80],
  tick: 3,
};

let ac: AudioContext | null = null;

export function sfx(name: SfxName, haptic = true) {
  if (!FX.enabled) return;
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ac = ac || new Ctor();
    if (ac.state === "suspended") void ac.resume();
    const t0 = ac.currentTime + 0.005;
    const master = ac.createGain();
    master.gain.value = 0.9;
    master.connect(ac.destination);
    (BANK[name] as Note[]).forEach(([f, s, d, type = "triangle", vol = 0.06, slide]) => {
      const o = ac!.createOscillator();
      const g = ac!.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f, t0 + s);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + s + d);
      g.gain.setValueAtTime(0.0001, t0 + s);
      g.gain.exponentialRampToValueAtTime(vol, t0 + s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + s + d);
      o.connect(g).connect(master);
      o.start(t0 + s);
      o.stop(t0 + s + d + 0.03);
    });
  } catch {
    /* audio unavailable */
  }
  if (haptic && "vibrate" in navigator) {
    const p = HAPTIC[name];
    if (p) navigator.vibrate?.(p);
  }
}

export const SFX_LIST = Object.keys(BANK) as SfxName[];
export const SFX_NOTES = BANK as Record<SfxName, Note[]>;

/* ================================================================== */
/*  CONFETTI — canvas physics, 60fps                                   */
/* ================================================================== */
const CONF_COLORS = ["#2be08a", "#ffc24b", "#38e1ff", "#9b6bff", "#ff4d6a", "#ffffff"];

export function Confetti({
  fire,
  count = 140,
  origin = { x: 0.5, y: 0.35 },
  spread = 1,
  className,
}: {
  fire: number;
  count?: number;
  origin?: { x: number; y: number };
  spread?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire) return;
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = c.getBoundingClientRect();
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const parts = Array.from({ length: count }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
      const v = 7 + Math.random() * 11;
      return {
        x: r.width * origin.x,
        y: r.height * origin.y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 5 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        wob: Math.random() * 10,
        c: CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
        shape: Math.random() > 0.72 ? 1 : 0,
      };
    });
    const start = performance.now();
    const DUR = 2800;
    let raf = 0;
    const loop = (t: number) => {
      const el = t - start;
      ctx.clearRect(0, 0, r.width, r.height);
      parts.forEach((p) => {
        p.vy += 0.32;
        p.vx *= 0.985;
        p.vy *= 0.992;
        p.x += p.vx + Math.sin((el / 180) + p.wob) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - el / DUR);
        ctx.fillStyle = p.c;
        if (p.shape) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, (-p.h / 2) * Math.abs(Math.cos(p.rot * 1.6)), p.w, p.h * Math.abs(Math.cos(p.rot * 1.6)) + 1);
        }
        ctx.restore();
      });
      if (el < DUR) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, r.width, r.height);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire]);
  return <canvas ref={ref} className={cn("pointer-events-none absolute inset-0 z-[80] h-full w-full", className)} />;
}

/* ================================================================== */
/*  SCREEN SHAKE                                                       */
/* ================================================================== */
export function Shake({ trigger, children, className, power = 1 }: { trigger: number; children: ReactNode; className?: string; power?: number }) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (!trigger) return;
    void controls.start({
      x: [0, -10 * power, 10 * power, -7 * power, 7 * power, -3 * power, 3 * power, 0],
      transition: { duration: 0.45 },
    });
  }, [trigger, controls, power]);
  return (
    <motion.div animate={controls} className={className}>
      {children}
    </motion.div>
  );
}

/* ================================================================== */
/*  POP NUMBER — scales on change                                      */
/* ================================================================== */
export function Pop({
  value,
  className,
  color,
  suffix,
  prefix,
  dp = 0,
}: {
  value: number | string | ReactNode;
  className?: string;
  color?: string;
  suffix?: string | null;
  prefix?: string | null;
  dp?: number;
}) {
  let display: ReactNode = value;
  if (typeof value === "number") {
    const n = value.toLocaleString("en-US", {
      minimumFractionDigits: dp,
      maximumFractionDigits: dp,
    });
    display = (
      <span className="tnum">
        {prefix ?? ""}
        {n}
        {suffix ?? ""}
      </span>
    );
  }
  return (
    <motion.span
      key={String(value)}
      initial={{ scale: 1.6, y: -3 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 520, damping: 14 }}
      className={cn("inline-block tnum", className)}
      style={color ? { color } : undefined}
    >
      {display}
    </motion.span>
  );
}

/* ================================================================== */
/*  RAY BURST — rotating god rays                                      */
/* ================================================================== */
export function Rays({ color = "rgba(255,194,75,.28)", className, size = "180%" }: { color?: string; className?: string; size?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2", className)}
      style={{ width: size }}
    >
      <div
        className="spin-slow h-full w-full rounded-full"
        style={{
          background: `repeating-conic-gradient(from 0deg, ${color} 0deg 9deg, transparent 9deg 22.5deg)`,
          maskImage: "radial-gradient(circle, #000 14%, transparent 66%)",
          WebkitMaskImage: "radial-gradient(circle, #000 14%, transparent 66%)",
        }}
      />
    </div>
  );
}

/* ================================================================== */
/*  TWINKLES — ambient sparkles                                        */
/* ================================================================== */
export function Twinkles({ n = 14, color = "#fff", className }: { n?: number; color?: string; className?: string }) {
  const stars = useMemo(
    () =>
      Array.from({ length: n }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 4 + Math.random() * 8,
        d: Math.random() * 3,
        t: 1.6 + Math.random() * 2.2,
      })),
    [n],
  );
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {stars.map((s, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 10 10"
          width={s.s}
          height={s.s}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
          transition={{ duration: s.t, repeat: Infinity, delay: s.d }}
        >
          <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill={color} />
        </motion.svg>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  FLY-UP — floating "+XP" labels                                     */
/* ================================================================== */
export function FlyUp({ items }: { items: { id: number; text: string; color?: string; x?: number }[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      {items.map((it) => (
        <motion.span
          key={it.id}
          initial={{ opacity: 0, y: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.6, 1.2, 1, 1] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute left-1/2 top-1/2 font-mono text-[15px] font-black"
          style={{ color: it.color || "var(--accent)", marginLeft: it.x ?? 0, textShadow: "0 2px 0 rgba(0,0,0,.5)" }}
        >
          {it.text}
        </motion.span>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  COUNTDOWN TIMER hook                                               */
/* ================================================================== */
export function fmtClock(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
