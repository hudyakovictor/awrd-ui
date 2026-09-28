import { useEffect, useRef, useState, type RefObject } from "react";

/* =============================================================================
 *  Shared motion engine
 *  Every gameplay animation builds on these primitives. All RAF loops read the
 *  latest callback through a ref, so closures never go stale, and loops can be
 *  paused when their component is offscreen.
 * =============================================================================*/

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent exponential smoothing. dt in seconds. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

export const map = (v: number, a1: number, a2: number, b1: number, b2: number) =>
  ((v - a1) / (a2 - a1)) * (b2 - b1) + b1;

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const snapTo = (v: number, step: number) => Math.round(v / step) * step;

/** Positive modulo: wraps negatives correctly (used by infinite carousels). */
export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Wrap a value into [-range/2, range/2). */
export const wrapCentered = (v: number, range: number) => mod(v + range / 2, range) - range / 2;

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Seeded pseudo random — deterministic decoration without re-render flicker. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ---------- RAF loop ---------- */

/**
 * requestAnimationFrame loop. `fn(time, dt)` always sees the latest props/state
 * because it is read through a ref. dt is clamped to 50ms so tab switches
 * never explode physics.
 */
export function useRafLoop(fn: (time: number, dt: number) => void, enabled = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
      last = t;
      fnRef.current(t, dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
}

/** Always-current reference to a value (for event listeners). */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/* ---------- Visibility ---------- */

/** Continuous visibility (true while intersecting). Used to pause offscreen loops. */
export function useVisible<T extends Element>(ref: RefObject<T | null>, rootMargin = "120px") {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return visible;
}

/* ---------- Scroll ---------- */

/** 0 when the element's top touches the viewport bottom, 1 when its bottom leaves the top. */
export function useScrollProgress(target: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      setP(clamp((vh - r.top) / (r.height + vh), 0, 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);
  return p;
}

/**
 * Progress of a tall container whose child is `position: sticky`.
 * 0 when the sticky child pins, 1 when it releases.
 */
export function useStickyProgress(
  target: RefObject<HTMLElement | null>,
  opts: { offset?: number; stickyHeight?: number } = {},
) {
  const { offset = 80, stickyHeight } = opts;
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const sh = stickyHeight ?? vh - offset;
      const total = Math.max(1, r.height - sh);
      setP(clamp((offset - r.top) / total, 0, 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, offset, stickyHeight]);
  return p;
}

/** Smoothed window scroll velocity in px/s (signed). Settles to 0 when idle. */
export function useScrollVelocity(enabled = true) {
  const [velocity, setVelocity] = useState(0);
  const last = useRef(0);
  const smooth = useRef(0);
  const shown = useRef(0);
  useEffect(() => {
    last.current = window.scrollY;
  }, []);
  useRafLoop((_, dt) => {
    const y = window.scrollY;
    const raw = (y - last.current) / Math.max(dt, 0.001);
    last.current = y;
    smooth.current = damp(smooth.current, raw, 6, dt);
    const next = Math.abs(smooth.current) < 2 ? 0 : smooth.current;
    if (Math.abs(next - shown.current) > 3 || (next === 0 && shown.current !== 0)) {
      shown.current = next;
      setVelocity(next);
    }
  }, enabled);
  return velocity;
}

/** Global page progress 0..1. */
export function usePageProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? clamp(window.scrollY / max, 0, 1) : 0);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

/* ---------- Pointer ---------- */

/** Window-level pointer relative to the returned ref (keeps tracking outside the element). */
export function usePointer(): { ref: RefObject<HTMLElement | null>; point: { x: number; y: number; rx: number; ry: number } } {
  const ref = useRef<HTMLElement>(null);
  const [point, setPoint] = useState({ x: 0.5, y: 0.5, rx: 0, ry: 0 });
  useEffect(() => {
    let raf = 0;
    let pending: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const el = ref.current;
      const e = pending;
      if (!el || !e) return;
      const r = el.getBoundingClientRect();
      const px = clamp((e.clientX - r.left) / r.width, 0, 1);
      const py = clamp((e.clientY - r.top) / r.height, 0, 1);
      setPoint({ x: px, y: py, rx: (0.5 - py) * 12, ry: (px - 0.5) * 14 });
    };
    const onMove = (e: PointerEvent) => {
      pending = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return { ref, point };
}

/** Pointer position inside a given element, with `inside` flag. Pixel + normalized. */
export function useElementPointer<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [state, setState] = useState({ x: 0.5, y: 0.5, px: 0, py: 0, inside: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let pending: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!pending) return;
      const r = el.getBoundingClientRect();
      const px = pending.clientX - r.left;
      const py = pending.clientY - r.top;
      setState({ x: clamp(px / r.width, 0, 1), y: clamp(py / r.height, 0, 1), px, py, inside: true });
    };
    const move = (e: PointerEvent) => {
      pending = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => setState((s) => ({ ...s, inside: false }));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
  return state;
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

export function useCoarsePointer() {
  return useMedia("(pointer: coarse)");
}

export function useReduceMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/* ---------- Springs ---------- */

/**
 * Damped spring toward `target`. Runs RAF only while moving, then sleeps.
 * stiffness/damping follow the usual physical model.
 */
export function useSpring(target: number, stiffness = 170, damping = 22) {
  const [value, setValue] = useState(target);
  const s = useRef({ x: target, v: 0 });
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (Math.abs(s.current.x - target) > 0.0005) setActive(true);
  }, [target]);
  useRafLoop((_, dt) => {
    const st = s.current;
    const steps = Math.max(1, Math.ceil(dt / 0.008));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const force = -stiffness * (st.x - target) - damping * st.v;
      st.v += force * h;
      st.x += st.v * h;
    }
    if (Math.abs(st.v) < 0.001 && Math.abs(st.x - target) < 0.001) {
      st.x = target;
      st.v = 0;
      setActive(false);
    }
    setValue(st.x);
  }, active);
  return value;
}

/** Spring for 2D points (magnetic buttons, cursor followers). */
export function useSpring2D(tx: number, ty: number, stiffness = 180, damping = 18) {
  return { x: useSpring(tx, stiffness, damping), y: useSpring(ty, stiffness, damping) };
}

export const MOTION_OK = (reduce: boolean) => !reduce;
