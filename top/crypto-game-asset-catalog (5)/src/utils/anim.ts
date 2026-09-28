/* ============================================================
   Tradelingo Animation Library
   Easing functions, spring physics, stagger presets, durations,
   and WAAPI helpers used across all FX labs.
   ============================================================ */

/* ---------- easing functions (0..1 -> 0..1) ---------- */
export const easeLinear = (t: number) => t;
export const easeInQuad = (t: number) => t * t;
export const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
export const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeInCubic = (t: number) => t * t * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeInQuart = (t: number) => t * t * t * t;
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
export const easeInQuint = (t: number) => t * t * t * t * t;
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
export const easeInExpo = (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10));
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInCirc = (t: number) => 1 - Math.sqrt(1 - t * t);
export const easeOutCirc = (t: number) => Math.sqrt(1 - Math.pow(t - 1, 2));
export const easeOutBack = (t: number, s = 1.70158) => { const c = s + 1; return 1 + c * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
export const easeInBack = (t: number, s = 1.70158) => { const c = s + 1; return c * t * t * t - s * t * t; };
export const easeOutElastic = (t: number) => {
  if (t <= 0 || t >= 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
};
export const easeOutBounce = (t: number) => {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};
export const easeSpringy = (t: number) => {
  // overshooting cubic approximating a spring
  const c1 = 1.2, c2 = c1 * 1.35;
  return 1 + c2 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const EASINGS: Record<string, (t: number) => number> = {
  linear: easeLinear, inQuad: easeInQuad, outQuad: easeOutQuad, inOutQuad: easeInOutQuad,
  inCubic: easeInCubic, outCubic: easeOutCubic, inOutCubic: easeInOutCubic,
  inQuart: easeInQuart, outQuart: easeOutQuart, inOutQuart: easeInOutQuart,
  inQuint: easeInQuint, outQuint: easeOutQuint, inExpo: easeInExpo, outExpo: easeOutExpo,
  inCirc: easeInCirc, outCirc: easeOutCirc, outBack: easeOutBack, inBack: easeInBack,
  outElastic: easeOutElastic, outBounce: easeOutBounce, springy: easeSpringy,
};

/* CSS cubic-bezier equivalents for transitions */
export const BEZIER = {
  snap: "cubic-bezier(.3,1.4,.5,1)",
  soft: "cubic-bezier(.3,1.1,.4,1)",
  spring: "cubic-bezier(.3,1.6,.4,1)",
  smooth: "cubic-bezier(.4,0,.2,1)",
  punch: "cubic-bezier(.2,.9,.3,1.3)",
  drift: "cubic-bezier(.45,0,.2,1)",
} as const;

/* ---------- spring physics (semi-implicit euler) ---------- */
export type SpringOpts = { stiffness?: number; damping?: number; mass?: number; precision?: number };
export function createSpring(from: number, to: number, opts: SpringOpts = {}) {
  const { stiffness = 170, damping = 22, mass = 1, precision = 0.05 } = opts;
  let x = from, v = 0, target = to, settled = false;
  return {
    get value() { return x; },
    get velocity() { return v; },
    get settled() { return settled; },
    setTarget(t: number) { target = t; settled = false; },
    snap(t: number) { x = t; v = 0; target = t; settled = true; },
    step(dt: number) {
      const F = -stiffness * (x - target) - damping * v;
      v += (F / mass) * dt;
      x += v * dt;
      if (Math.abs(v) < precision && Math.abs(x - target) < precision) { x = target; v = 0; settled = true; }
      return x;
    },
  };
}

/* spring presets tuned for UI */
export const SPRINGS = {
  gentle: { stiffness: 90, damping: 16 },
  default: { stiffness: 170, damping: 22 },
  snappy: { stiffness: 260, damping: 24 },
  bouncy: { stiffness: 220, damping: 13 },
  stiff: { stiffness: 400, damping: 32 },
} as const;

/* ---------- tween helper (rAF, promise) ---------- */
export function tween(duration: number, onUpdate: (k: number) => void, ease: (t: number) => number = easeOutCubic): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const loop = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      onUpdate(ease(k));
      if (k < 1) requestAnimationFrame(loop);
      else resolve();
    };
    requestAnimationFrame(loop);
  });
}
export function delayed(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/* ---------- stagger helpers ---------- */
export type StaggerMode = "cascade" | "center" | "edges" | "random" | "diagonal";
export function staggerDelay(i: number, total: number, mode: StaggerMode, step = 55, seed = 7): number {
  switch (mode) {
    case "cascade": return i * step;
    case "center": return Math.abs(i - (total - 1) / 2) * step;
    case "edges": return ((total - 1) / 2 - Math.abs(i - (total - 1) / 2)) * step;
    case "random": { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return Math.abs(x - Math.floor(x)) * total * step * 0.5; }
    case "diagonal": { const cols = Math.ceil(Math.sqrt(total)); return (((i % cols) + Math.floor(i / cols)) * step) / 1.4; }
  }
}

/* ---------- value helpers ---------- */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const invLerp = (a: number, b: number, v: number) => clamp01((v - a) / (b - a || 1));
export const remap = (v: number, a: number, b: number, c: number, d: number) => c + clamp01((v - a) / (b - a || 1)) * (d - c);
export const damp = (cur: number, target: number, lambda: number, dt: number) => lerp(cur, target, 1 - Math.exp(-lambda * dt));

/* rubber-band resistance (iOS-style) */
export function rubberBand(d: number, dim: number, constant = 0.55): number {
  return (1 - 1 / ((Math.abs(d) * constant) / dim + 1)) * dim * Math.sign(d);
}

/* ---------- WAAPI presets ---------- */
export type AnimPreset = { keyframes: Keyframe[]; options: KeyframeAnimationOptions };
export const PRESETS: Record<string, (dir?: number) => AnimPreset> = {
  fadeSlideUp: () => ({ keyframes: [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], options: { duration: 450, easing: BEZIER.soft, fill: "both" } }),
  fadeSlideDown: () => ({ keyframes: [{ opacity: 0, transform: "translateY(-18px)" }, { opacity: 1, transform: "none" }], options: { duration: 450, easing: BEZIER.soft, fill: "both" } }),
  pop: () => ({ keyframes: [{ opacity: 0, transform: "scale(.5)" }, { opacity: 1, transform: "scale(1.12)", offset: 0.6 }, { opacity: 1, transform: "scale(1)" }], options: { duration: 420, easing: BEZIER.punch, fill: "both" } }),
  punch: () => ({ keyframes: [{ transform: "scale(1)" }, { transform: "scale(1.18)", offset: 0.35 }, { transform: "scale(1)" }], options: { duration: 300, easing: "ease-out" } }),
  shakeX: () => ({ keyframes: [{ transform: "translateX(0)" }, { transform: "translateX(-8px)", offset: 0.2 }, { transform: "translateX(8px)", offset: 0.45 }, { transform: "translateX(-5px)", offset: 0.7 }, { transform: "translateX(0)" }], options: { duration: 420, easing: "ease-out" } }),
  slideIn: (dir = 1) => ({ keyframes: [{ transform: `translateX(${dir * 60}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], options: { duration: 480, easing: BEZIER.soft, fill: "both" } }),
  flipY: () => ({ keyframes: [{ transform: "perspective(800px) rotateY(90deg)", opacity: 0 }, { transform: "perspective(800px) rotateY(0)", opacity: 1 }], options: { duration: 550, easing: BEZIER.soft, fill: "both" } }),
  zoomOut: () => ({ keyframes: [{ transform: "scale(1.25)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], options: { duration: 420, easing: BEZIER.soft, fill: "both" } }),
  dropIn: () => ({ keyframes: [{ transform: "translateY(-120%)", opacity: 0 }, { transform: "translateY(8px)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }], options: { duration: 600, easing: BEZIER.spring, fill: "both" } }),
  stamp: () => ({ keyframes: [{ transform: "scale(2.4) rotate(-18deg)", opacity: 0 }, { transform: "scale(.92) rotate(-8deg)", opacity: 1, offset: 0.6 }, { transform: "scale(1) rotate(-10deg)", opacity: 1 }], options: { duration: 480, easing: BEZIER.punch, fill: "both" } }),
};
export function playPreset(el: Element | null, name: keyof typeof PRESETS, dir?: number): Animation | null {
  if (!el) return null;
  const p = PRESETS[name](dir);
  try { return el.animate(p.keyframes, p.options); } catch { return null; }
}

/* ---------- number formatting for counters ---------- */
export function formatCompact(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 10_000) return `${(v / 1000).toFixed(1)}k`;
  if (Math.abs(v) >= 1000) return v.toLocaleString("en-US");
  return String(Math.round(v));
}
export function formatMoney(v: number, digits = 2): string {
  return v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
export function formatSigned(v: number, digits = 2): string {
  return `${v >= 0 ? "+" : ""}${formatMoney(v, digits)}`;
}

/* ---------- durations scale (ms) ---------- */
export const DUR = { instant: 90, fast: 160, normal: 300, slow: 500, cinematic: 800, epic: 1200 } as const;

/* ---------- reduced motion ---------- */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}
export function motionSafe<T>(normal: T, reduced: T): T {
  return prefersReducedMotion() ? reduced : normal;
}

/* ---------- color helpers ---------- */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  const m = A.map((x, i) => Math.round(lerp(x, B[i], clamp01(t))));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------- signal palette (single source of truth for FX) ---------- */
export const SIGNAL = {
  bull: "#1fdb8b", bear: "#ff4d6a", blue: "#3d7bff", gold: "#ffc53d",
  violet: "#8d5cff", cyan: "#2ed3f0", orange: "#ff8a3d", pink: "#ff4d9a",
} as const;
export type SignalName = keyof typeof SIGNAL;

/* ---------- random helpers (seedable) ---------- */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const pick = <T,>(arr: readonly T[]): T => arr[(Math.random() * arr.length) | 0];
export const chance = (p: number) => Math.random() < p;
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- frame loop with fixed-dt accumulator ---------- */
export function createLoop(step: (dt: number, t: number) => void, fps = 60) {
  let raf = 0, last = performance.now(), acc = 0, running = false;
  const frame = 1000 / fps;
  const loop = (t: number) => {
    if (!running) return;
    acc += Math.min(100, t - last);
    last = t;
    while (acc >= frame) { step(frame / 1000, t / 1000); acc -= frame; }
    raf = requestAnimationFrame(loop);
  };
  return {
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); },
    get running() { return running; },
  };
}

/* ---------- canvas helpers ---------- */
export function fitCanvas(cv: HTMLCanvasElement, maxDpr = 2): { w: number; h: number; dpr: number } {
  const dpr = Math.min(maxDpr, window.devicePixelRatio || 1);
  const r = cv.getBoundingClientRect();
  cv.width = Math.max(1, Math.round(r.width * dpr));
  cv.height = Math.max(1, Math.round(r.height * dpr));
  return { w: r.width, h: r.height, dpr };
}
export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
}
export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/* ---------- confetti + coin palettes ---------- */
export const CONFETTI_COLORS = ["#1fdb8b", "#3d7bff", "#ffc53d", "#ff4d6a", "#8d5cff", "#2ed3f0", "#ffffff"] as const;
export const COIN_COLORS = ["#ffe27a", "#ffc53d", "#e39a0b"] as const;
export const RARITY_COLORS = { common: "#8e9cc8", rare: "#3d7bff", epic: "#8d5cff", legendary: "#ffc53d", mythic: "#ff4d9a" } as const;

/* ---------- gesture math ---------- */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}
export function dist2(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}
export function velocity(points: { x: number; y: number; t: number }[]): { vx: number; vy: number } {
  if (points.length < 2) return { vx: 0, vy: 0 };
  const a = points[points.length - 2], b = points[points.length - 1];
  const dt = Math.max(1, b.t - a.t) / 1000;
  return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
}

/* ---------- misc ---------- */
export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const uid = (() => { let n = 0; return (p = "fx") => `${p}-${Date.now().toString(36)}-${(n++).toString(36)}`; })();
export function debounce<F extends (...a: never[]) => void>(fn: F, ms: number): F {
  let h = 0;
  return ((...a: never[]) => { clearTimeout(h); h = window.setTimeout(() => fn(...a), ms); }) as F;
}
export function throttle<F extends (...a: never[]) => void>(fn: F, ms: number): F {
  let last = 0;
  return ((...a: never[]) => { const t = performance.now(); if (t - last >= ms) { last = t; fn(...a); } }) as F;
}
