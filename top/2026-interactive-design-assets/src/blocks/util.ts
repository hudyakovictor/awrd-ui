import { useCallback, useEffect, useRef } from "react";

export const C = {
  acid: "#22c55e",
  bull: "#22c55e",
  bear: "#ef4444",
  blue: "#3b82f6",
  orange: "#f97316",
  ink: "#05080f",
  paper: "#f1f5f9",
  navy: "#121b30",
  card: "#151e36",
  raised: "#1d2947",
  iris: "#8b5cf6",
  gold: "#fbbf24",
};

export type Candle = { o: number; c: number; h: number; l: number };

export function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function makeCandles(n: number, seed: number, start = 100, drift = 0): Candle[] {
  const r = rng(seed);
  let p = start;
  return Array.from({ length: n }, () => {
    const o = p;
    const c = o + (r() - 0.5 + drift) * 4;
    const h = Math.max(o, c) + r() * 1.5;
    const l = Math.min(o, c) - r() * 1.5;
    p = c;
    return { o, c, h, l };
  });
}

/** Center of `el` in the un-scaled local coordinate space of `root`. */
export function centerIn(root: Element, el: Element) {
  const r = root.getBoundingClientRect();
  const e = el.getBoundingClientRect();
  const k = (root as HTMLElement).offsetWidth / r.width || 1;
  return { x: (e.left + e.width / 2 - r.left) * k, y: (e.top + e.height / 2 - r.top) * k };
}

/** setTimeout that is auto-cleared on unmount. */
export function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach((id) => clearTimeout(id)), []);
  return useCallback((fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  }, []);
}
