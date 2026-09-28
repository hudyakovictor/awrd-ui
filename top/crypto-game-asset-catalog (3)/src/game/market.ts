export type Candle = { o: number; h: number; l: number; c: number; v: number };

/** Deterministic PRNG (LCG) so exercises are reproducible */
export function rng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280 || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export function genCandles(seed: number, n: number, start = 100, vol = 1, drift = 0): Candle[] {
  const r = rng(seed);
  const out: Candle[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const move = (r() - 0.5) * 2 * vol + drift + Math.sin(i / 9) * vol * 0.25;
    const c = Math.max(1, o + move);
    const h = Math.max(o, c) + r() * vol * 0.6;
    const l = Math.min(o, c) - r() * vol * 0.6;
    out.push({ o, h, l, c, v: 50 + r() * 100 });
    p = c;
  }
  return out;
}

export type PatternKind = "hammer" | "doji" | "star" | "engulfBull" | "engulfBear";

/** Injects a textbook pattern at index i and re-chains following candles */
export function inject(src: Candle[], i: number, kind: PatternKind): Candle[] {
  const d = src.map((c) => ({ ...c }));
  const R = (d.reduce((a, c) => a + (c.h - c.l), 0) / d.length) * 1.8;
  const P = d[i].o;
  const set = (k: number, o: number, c: number, h: number, l: number) => { d[k] = { ...d[k], o, c, h: Math.max(h, o, c), l: Math.min(l, o, c) }; };
  if (kind === "hammer") set(i, P, P + R * 0.18, P + R * 0.22, P - R);
  if (kind === "star") set(i, P, P - R * 0.18, P + R, P - R * 0.22);
  if (kind === "doji") set(i, P, P + R * 0.01, P + R * 0.5, P - R * 0.5);
  if (kind === "engulfBull") { set(i - 1, P + R * 0.25, P, P + R * 0.3, P - R * 0.05); set(i, P - R * 0.08, P + R * 0.55, P + R * 0.6, P - R * 0.12); }
  if (kind === "engulfBear") { set(i - 1, P - R * 0.25, P, P + R * 0.05, P - R * 0.3); set(i, P + R * 0.08, P - R * 0.55, P + R * 0.12, P - R * 0.6); }
  for (let k = i + 1; k < d.length; k++) {
    const shift = d[k - 1].c - d[k].o;
    d[k] = { o: d[k].o + shift, c: d[k].c + shift, h: d[k].h + shift, l: d[k].l + shift, v: d[k].v };
  }
  return d;
}

export function ema(vals: number[], p: number): number[] {
  const k = 2 / (p + 1);
  const out: number[] = [];
  let e = vals[0];
  vals.forEach((v, i) => { e = i ? v * k + e * (1 - k) : v; out.push(e); });
  return out;
}

export function rsi(cl: number[], p = 14): number[] {
  const out: number[] = [];
  let g = 0, l = 0;
  for (let i = 0; i < cl.length; i++) {
    const ch = i ? cl[i] - cl[i - 1] : 0;
    const up = Math.max(ch, 0), dn = Math.max(-ch, 0);
    if (i <= p) { g += up / p; l += dn / p; } else { g = (g * (p - 1) + up) / p; l = (l * (p - 1) + dn) / p; }
    out.push(l === 0 ? 100 : 100 - 100 / (1 + g / l));
  }
  return out;
}

export const closes = (d: Candle[]) => d.map((c) => c.c);
export const fmt = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
