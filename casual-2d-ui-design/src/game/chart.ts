export interface Candle { o: number; c: number; h: number; l: number }

const R = (a: number, b: number) => a + Math.random() * (b - a);

/** clamp helper for wicks */
const finish = (o: number, c: number): Candle => ({
  o, c,
  h: Math.max(o, c) + R(0.4, 1.6),
  l: Math.min(o, c) - R(0.4, 1.6),
});

/** random walk candle with slight bias */
const walk = (price: number, bias = 0, amp = 1): { c: Candle; p: number } => {
  const delta = (R(-1, 1) + bias) * 1.5 * amp;
  const close = Math.max(6, Math.min(96, price + delta));
  return { c: finish(price, close), p: close };
};

/**
 * Shapes: [dOpen, dClose] body deltas per candle, relative to price.
 * The LAST candle of each shape is the pattern's final candle;
 * `dir` is what logically follows.
 */
const SHAPES: Record<string, { seg: [number, number][] }> = {
  bullEng:   { seg: [[-0.8, -2.6], [2.4, -3.4]] },
  bearEng:   { seg: [[0.8, 2.6], [-2.4, 3.4]] },
  hammer:    { seg: [[0.9, 2.6], [2.1, 2.45]] },     // second: tiny body up; long lower wick added below
  shoot:     { seg: [[-0.9, -2.6], [-2.1, -2.45]] },
  dojiUp:    { seg: [[1.2, 3.4], [3.4, 3.15]] },
  soldiers:  { seg: [[0.6, 2.4], [2.4, 4.5], [4.5, 6.8]] },
  crows:     { seg: [[-0.6, -2.4], [-2.4, -4.5], [-4.5, -6.8]] },
};

/** jerk hammer / shooting-star wick lengths */
const WICK: Record<string, { i: number; d: number; len: number } | undefined> = {
  hammer: { i: 1, d: 1, len: 3.4 },   // long lower wick (price went down then bought back)
  shoot:  { i: 1, d: -1, len: 3.4 },  // long upper wick
};

export interface PatternBuild {
  id: string;
  candles: Candle[];          // candles that form the pattern (streamed into the chart)
  outcome: Candle;            // the "answer" candle for resolution
  dir: 1 | -1;
}

export function buildPattern(id: string, price: number): { pb: PatternBuild; end: number } {
  const sh = SHAPES[id];
  const dir: 1 | -1 = ["bullEng", "hammer", "dojiUp", "soldiers"].includes(id) ? 1 : -1;
  if (!sh) {
    // fallback: random drift
    let p = price;
    const cs: Candle[] = [];
    for (let i = 0; i < 3; i++) { const w = walk(p); cs.push(w.c); p = w.p; }
    const out = { ...walk(p, dir * 1.3).c };
    return { pb: { id, candles: cs, outcome: out, dir }, end: out.c };
  }
  const candles: Candle[] = [];
  const base = price;
  sh.seg.forEach(([dO, dC], i) => {
    const jitter = R(-0.25, 0.25);
    const o = base + dO + jitter;
    const c = Math.max(6, Math.min(96, base + dC + jitter));
    const ca = finish(o, c);
    const wk = WICK[id];
    if (wk && wk.i === i) {
      if (wk.d === 1) ca.l = Math.min(o, c) - wk.len; else ca.h = Math.max(o, c) + wk.len;
    }
    // prevent pathological drift
    ca.o = Math.max(6, Math.min(96, ca.o));
    ca.c = Math.max(6, Math.min(96, ca.c));
    ca.h = Math.max(6, Math.min(98, Math.max(ca.o, ca.c) + R(0.5, 1.4)));
    candles.push(ca);
  });
  const lastC = candles[candles.length - 1].c;
  const outcome = finish(lastC, Math.max(6, Math.min(96, lastC + dir * R(3.2, 4.6))));
  return { pb: { id, candles, outcome, dir }, end: outcome.c };
}

export function genWalk(price: number, n: number, bias = 0): { cs: Candle[]; end: number } {
  const cs: Candle[] = [];
  let p = price;
  for (let i = 0; i < n; i++) { const w = walk(p, bias); cs.push(w.c); p = w.p; }
  return { cs, end: p };
}
