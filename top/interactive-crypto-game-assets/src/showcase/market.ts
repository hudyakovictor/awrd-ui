/* Shared market math for TRADELINGO showcase scenes.
   Deterministic, dependency-free, safe to use in every large block. */

export type Candle = { o: number; h: number; l: number; c: number; v: number; t: number };
export type Regime = "trend" | "range" | "volatile" | "crash" | "calm";

export function mulberry(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REGIME_CFG: Record<Regime, { drift: number; vol: number; pull: number }> = {
  trend: { drift: 0.055, vol: 1.1, pull: 0.012 },
  range: { drift: 0.0, vol: 0.9, pull: 0.08 },
  volatile: { drift: 0.01, vol: 2.6, pull: 0.02 },
  crash: { drift: -0.11, vol: 2.0, pull: 0.01 },
  calm: { drift: 0.008, vol: 0.45, pull: 0.04 },
};

export function genCandles(
  seed: number,
  n: number,
  start = 100,
  regime: Regime = "trend",
  stepMs = 60_000,
): Candle[] {
  const rnd = mulberry(seed * 1000 + 17);
  const cfg = REGIME_CFG[regime];
  const out: Candle[] = [];
  let p = start;
  const mean = start;
  const t0 = Date.now() - n * stepMs;
  for (let i = 0; i < n; i++) {
    const o = p;
    const shock = (rnd() - 0.5) * 2 * cfg.vol;
    const reversion = (mean - p) * cfg.pull;
    const c = Math.max(1, o + cfg.drift + shock + reversion);
    const wickUp = rnd() * cfg.vol * 0.9;
    const wickDown = rnd() * cfg.vol * 0.9;
    const h = Math.max(o, c) + wickUp;
    const l = Math.max(0.5, Math.min(o, c) - wickDown);
    const v = 18 + rnd() * 82 + Math.abs(c - o) * 22;
    out.push({ o, h, l, c, v, t: t0 + i * stepMs });
    p = c;
  }
  return out;
}

/** Aggregate base candles into a higher timeframe (factor: how many base bars per bar). */
export function aggregate(base: Candle[], factor: number): Candle[] {
  if (factor <= 1) return base;
  const out: Candle[] = [];
  for (let i = 0; i + factor <= base.length; i += factor) {
    const slice = base.slice(i, i + factor);
    out.push({
      o: slice[0].o,
      h: Math.max(...slice.map((c) => c.h)),
      l: Math.min(...slice.map((c) => c.l)),
      c: slice[slice.length - 1].c,
      v: slice.reduce((a, c) => a + c.v, 0),
      t: slice[0].t,
    });
  }
  return out;
}

export function candlesRange(cs: Candle[]) {
  let mn = Infinity, mx = -Infinity, mv = 0;
  for (const c of cs) {
    if (c.l < mn) mn = c.l;
    if (c.h > mx) mx = c.h;
    if (c.v > mv) mv = c.v;
  }
  if (!isFinite(mn)) { mn = 0; mx = 1; }
  if (mx - mn < 1e-6) { mx = mn + 1; }
  return { min: mn, max: mx, maxV: mv || 1 };
}

export function smaArr(data: number[], p: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= p) sum -= data[i - p];
    out.push(i >= p - 1 ? sum / p : null);
  }
  return out;
}

export function emaArr(data: number[], p: number): (number | null)[] {
  const out: (number | null)[] = [];
  const k = 2 / (p + 1);
  let prev: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < p - 1) { out.push(null); continue; }
    if (prev === null) {
      let s = 0;
      for (let j = 0; j < p; j++) s += data[i - p + 1 + j];
      prev = s / p;
    } else {
      prev = data[i] * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

export function rsiArr(data: number[], p = 14): (number | null)[] {
  const out: (number | null)[] = [];
  let ag = 0, al = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0) { out.push(null); continue; }
    const ch = data[i] - data[i - 1];
    const g = Math.max(0, ch), l = Math.max(0, -ch);
    if (i <= p) {
      ag += g; al += l;
      out.push(i === p ? 100 - 100 / (1 + ag / (al || 1e-9)) : null);
      if (i === p) { ag /= p; al /= p; }
    } else {
      ag = (ag * (p - 1) + g) / p;
      al = (al * (p - 1) + l) / p;
      out.push(100 - 100 / (1 + ag / (al || 1e-9)));
    }
  }
  return out;
}

export function fmtPrice(v: number) {
  if (v >= 10000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (v >= 1000) return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (v >= 10) return v.toFixed(2);
  return v.toFixed(4);
}

export function fmtPct(v: number, signed = true) {
  const s = v >= 0 && signed ? "+" : "";
  return `${s}${v.toFixed(2)}%`;
}

export function pctChange(from: number, to: number) {
  return ((to - from) / (from || 1)) * 100;
}

/** Build a smooth path from close prices for sparkline / overlay use. */
export function closesPath(
  closes: number[],
  w: number,
  h: number,
  pad = 4,
  min?: number,
  max?: number,
) {
  const mn = min ?? Math.min(...closes);
  const mx = max ?? Math.max(...closes);
  const span = mx - mn || 1;
  return closes
    .map((v, i) => {
      const x = (i / Math.max(1, closes.length - 1)) * w;
      const y = pad + (1 - (v - mn) / span) * (h - pad * 2);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
