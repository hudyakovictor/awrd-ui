import { useEffect, useRef, useState, type PointerEvent as RPE, type RefObject } from "react";

/** true once the element enters the viewport (or toggles if once=false). */
export function useInView<T extends Element>(threshold = 0.2, once = true): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (once) io.disconnect(); } else if (!once) setV(false);
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return [ref, v];
}

/**
 * Scroll progress of an element.
 *  - "through": 0 when its top enters the bottom of the viewport → 1 when its bottom leaves the top.
 *  - "pinned":  0 → 1 while a tall section scrolls under a sticky child.
 */
export function useViewportProgress<T extends HTMLElement>(mode: "through" | "pinned" = "through"): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const v = mode === "pinned" ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
      setP(Math.max(0, Math.min(1, v)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [mode]);
  return [ref, p];
}

/** Smoothed page-scroll velocity in px/frame (signed). */
export function useScrollVelocity() {
  const [v, setV] = useState(0);
  useEffect(() => {
    let last = window.scrollY, cur = 0, raf = 0;
    const loop = () => {
      const y = window.scrollY;
      const d = y - last;
      last = y;
      cur += (d - cur) * 0.15;
      if (Math.abs(cur) < 0.01) cur = 0;
      setV(cur);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return v;
}

/** Pointer tilt with glare coordinates. */
export function useTilt(max = 12) {
  const [t, setT] = useState({ rx: 0, ry: 0, mx: 50, my: 50, on: false });
  const onPointerMove = (e: RPE<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    setT({ rx: (0.5 - py) * max * 2, ry: (px - 0.5) * max * 2, mx: px * 100, my: py * 100, on: true });
  };
  const onPointerLeave = () => setT({ rx: 0, ry: 0, mx: 50, my: 50, on: false });
  return { t, bind: { onPointerMove, onPointerLeave } };
}

/** Eased count-up that starts when run becomes true. */
export function useCountUp(target: number, run: boolean, ms = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const f = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(target * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [target, run, ms]);
  return v;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
