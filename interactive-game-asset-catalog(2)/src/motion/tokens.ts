// ============================================================
//  SIGNAL ARENA — MOTION TOKENS
//  Единый словарь движения. Никаких "ease-in-out 300ms" наугад.
// ============================================================

export type Bezier = [number, number, number, number];

/** Кривые. Каждая имеет роль, а не "вкус". */
export const EASE = {
  /** Вход UI: резкий старт, долгий мягкий хвост. 80% всех появлений. */
  outExpo: [0.16, 1, 0.3, 1] as Bezier,
  /** Выход UI: быстро уходим с дороги. */
  inQuart: [0.5, 0, 0.75, 0] as Bezier,
  /** Перелёт с перелётом цели — "пружинистая" кнопка-награда. */
  overshoot: [0.34, 1.56, 0.64, 1] as Bezier,
  /** Камера / большие перемещения. Симметрия = ощущение массы. */
  camera: [0.65, 0, 0.35, 1] as Bezier,
  /** Удар: мгновенно, почти без замедления в начале. */
  snap: [0.2, 0.9, 0.1, 1] as Bezier,
  /** Замах (anticipation): сначала медленно назад. */
  anticipate: [0.36, -0.4, 0.64, 1] as Bezier,
} as const;

/** Пружины (framer-motion). Используем для всего, что трогает палец. */
export const SPRING = {
  /** Тактильный отклик на касание. */
  tap: { type: "spring", stiffness: 700, damping: 30, mass: 0.6 } as const,
  /** Карточки, панели, модалки. */
  panel: { type: "spring", stiffness: 380, damping: 32, mass: 0.9 } as const,
  /** Награды: заметный перелёт. */
  reward: { type: "spring", stiffness: 260, damping: 13, mass: 1 } as const,
  /** Тяжёлые объекты (сундук, босс). */
  heavy: { type: "spring", stiffness: 160, damping: 20, mass: 2.2 } as const,
  /** Мягкий общий layout (FLIP). */
  layout: { type: "spring", stiffness: 420, damping: 38 } as const,
};

/** Длительности: шкала 1.5x — глаз различает шаги. */
export const DUR = {
  micro: 0.12,
  fast: 0.18,
  base: 0.28,
  slow: 0.42,
  scene: 0.64,
  epic: 0.96,
} as const;

/** Каскад: 30–60мс между элементами. Больше — ощущение "лага". */
export const STAGGER = { tight: 0.03, base: 0.045, loose: 0.07 } as const;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * TRAUMA SHAKE — секрет "сочного" удара.
 * Сдвиг = trauma² * max * noise. Квадрат даёт резкий пик и мягкое затухание.
 * Возвращает keyframes для x / y / rotate.
 */
export function shakeKeys(trauma = 1, frames = 14, maxOffset = 14, maxAngle = 3) {
  const x: number[] = [0];
  const y: number[] = [0];
  const r: number[] = [0];
  for (let i = 0; i < frames; i++) {
    const t = trauma * (1 - i / frames);
    const s = t * t;
    x.push((Math.random() * 2 - 1) * maxOffset * s);
    y.push((Math.random() * 2 - 1) * maxOffset * s);
    r.push((Math.random() * 2 - 1) * maxAngle * s);
  }
  x.push(0);
  y.push(0);
  r.push(0);
  return { x, y, rotate: r };
}

/** Cubic-bezier evaluator (для визуализации кривых и JS-счётчиков). */
export function bezierAt([x1, y1, x2, y2]: Bezier, t: number) {
  // Newton-Raphson по x, возвращаем y
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  let u = t;
  for (let i = 0; i < 8; i++) {
    const e = sx(u) - t;
    const d = dx(u);
    if (Math.abs(e) < 1e-5 || Math.abs(d) < 1e-6) break;
    u -= e / d;
  }
  return sy(Math.min(1, Math.max(0, u)));
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

export const C = {
  teal: "#2ee6c5",
  bull: "#3ddc84",
  bear: "#ff4d5e",
  gold: "#ffc34d",
  violet: "#9b7bff",
  sky: "#4cc3ff",
  white: "#ffffff",
};
