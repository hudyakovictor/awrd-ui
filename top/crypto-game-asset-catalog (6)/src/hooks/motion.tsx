import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "../utils/cn";

/* =========================================================
   MATH
   ========================================================= */
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a || 1)) * (d - c);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutBack = (t: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
/** iOS-style rubber band: resistance grows with distance */
export const rubber = (d: number, dim: number, c = 0.55) => (1 - 1 / ((Math.abs(d) * c) / dim + 1)) * dim * Math.sign(d);
export const wrap = (v: number, min: number, max: number) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };

/* =========================================================
   SHARED SCROLL BUS (one listener, rAF throttled)
   ========================================================= */
type Sub = () => void;
const subs = new Set<Sub>();
let ticking = false;
const fire = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; subs.forEach((f) => f()); });
};
export function useScrollBus(cb: Sub) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    const f = () => ref.current();
    if (subs.size === 0) { addEventListener("scroll", fire, { passive: true }); addEventListener("resize", fire); }
    subs.add(f);
    f();
    return () => {
      subs.delete(f);
      if (subs.size === 0) { removeEventListener("scroll", fire); removeEventListener("resize", fire); }
    };
  }, []);
}

/* global scroll velocity (px/ms), smoothed, decays on read */
const scrollState = { v: 0, y: 0, t: 0 };
if (typeof window !== "undefined") {
  scrollState.y = window.scrollY;
  addEventListener("scroll", () => {
    const t = performance.now();
    const dt = Math.max(8, t - scrollState.t);
    const inst = (window.scrollY - scrollState.y) / dt;
    scrollState.v = scrollState.v * 0.65 + inst * 0.35;
    scrollState.y = window.scrollY;
    scrollState.t = t;
  }, { passive: true });
}
export function readScrollVelocity() {
  scrollState.v *= 0.94;
  if (Math.abs(scrollState.v) < 0.0005) scrollState.v = 0;
  return scrollState.v;
}

export function useScrollY() {
  const [y, setY] = useState(0);
  useScrollBus(() => setY(window.scrollY));
  return y;
}
export function usePageProgress() {
  const [p, setP] = useState(0);
  useScrollBus(() => {
    const h = document.documentElement.scrollHeight - innerHeight;
    setP(h > 0 ? clamp(window.scrollY / h) : 0);
  });
  return p;
}
export function useScrollDirection(threshold = 8) {
  const [dir, setDir] = useState<"up" | "down">("up");
  const last = useRef(0);
  useScrollBus(() => {
    const y = window.scrollY;
    if (Math.abs(y - last.current) < threshold) return;
    setDir(y > last.current && y > 120 ? "down" : "up");
    last.current = y;
  });
  return dir;
}

/**
 * Element progress relative to viewport.
 * "through": 0 when the top enters from bottom, 1 when the bottom leaves at top.
 * "pin": 0 when element top hits viewport top, 1 when its bottom hits viewport bottom (for sticky scenes).
 * "enter": 0 when top at viewport bottom, 1 when top reaches 35% of viewport.
 */
export function useElementProgress<T extends HTMLElement>(mode: "through" | "pin" | "enter" = "through"): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [p, setP] = useState(0);
  const last = useRef(-1);
  useScrollBus(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = innerHeight;
    let v = 0;
    if (mode === "through") v = (vh - r.top) / (vh + r.height);
    else if (mode === "pin") v = -r.top / Math.max(1, r.height - vh);
    else v = (vh - r.top) / (vh * 0.65);
    v = clamp(v);
    if (Math.abs(v - last.current) > 0.0015) { last.current = v; setP(v); }
  });
  return [ref, p];
}

/* =========================================================
   VISIBILITY
   ========================================================= */
export function useInView<T extends Element>(opts: { threshold?: number; once?: boolean; rootMargin?: string } = {}): [RefObject<T | null>, boolean] {
  const { threshold = 0.15, once = true, rootMargin = "0px 0px -6% 0px" } = opts;
  const ref = useRef<T>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (once) io.disconnect(); }
      else if (!once) setV(false);
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, rootMargin]);
  return [ref, v];
}

/* =========================================================
   LOOPS & TIMERS
   ========================================================= */
export function useRafLoop(cb: (dt: number, t: number) => void, active = true) {
  const r = useRef(cb);
  r.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      r.current(dt, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
export function useInterval(cb: () => void, ms: number | null) {
  const r = useRef(cb);
  r.current = cb;
  useEffect(() => {
    if (ms == null) return;
    const h = setInterval(() => r.current(), ms);
    return () => clearInterval(h);
  }, [ms]);
}

/* =========================================================
   SPRING (damped harmonic oscillator)
   ========================================================= */
export function useSpring(target: number, stiffness = 170, damping = 18) {
  const [v, setV] = useState(target);
  const s = useRef({ x: target, v: 0 });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (t: number) => {
      const dt = Math.min(0.032, (t - last) / 1000);
      last = t;
      const st = s.current;
      const f = -stiffness * (st.x - target) - damping * st.v;
      st.v += f * dt;
      st.x += st.v * dt;
      if (Math.abs(st.v) < 0.002 && Math.abs(st.x - target) < 0.002) { st.x = target; st.v = 0; setV(target); return; }
      setV(st.x);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping]);
  return v;
}

/* =========================================================
   POINTER (local, normalized -1..1)
   ========================================================= */
export function usePointer<T extends HTMLElement>(): [RefObject<T | null>, { x: number; y: number; px: number; py: number; hover: boolean }] {
  const ref = useRef<T>(null);
  const [s, setS] = useState({ x: 0, y: 0, px: 0, py: 0, hover: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setS({ x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1, px: e.clientX - r.left, py: e.clientY - r.top, hover: true });
    };
    const lv = () => setS((p) => ({ ...p, x: 0, y: 0, hover: false }));
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerleave", lv);
    return () => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerleave", lv); };
  }, []);
  return [ref, s];
}

/* =========================================================
   DRAG / SWIPE (pointer events, velocity, axis lock)
   ========================================================= */
export type DragInfo = { dx: number; dy: number; vx: number; vy: number; x: number; y: number; moved: boolean };
export type DragHandlers = {
  onStart?: (i: DragInfo, e: PointerEvent) => void;
  onMove?: (i: DragInfo, e: PointerEvent) => void;
  onEnd?: (i: DragInfo, e: PointerEvent) => void;
};
export function useDrag<T extends HTMLElement>(handlers: DragHandlers, axis: "x" | "y" | "both" = "both") {
  const ref = useRef<T>(null);
  const h = useRef(handlers);
  h.current = handlers;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let sx = 0, sy = 0, lx = 0, ly = 0, lt = 0, vx = 0, vy = 0, id = -1, active = false, moved = false;
    const info = (e: PointerEvent): DragInfo => ({ dx: e.clientX - sx, dy: e.clientY - sy, vx, vy, x: e.clientX, y: e.clientY, moved });
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-nodrag]")) return;
      active = true; moved = false; id = e.pointerId;
      sx = lx = e.clientX; sy = ly = e.clientY; lt = performance.now(); vx = vy = 0;
      h.current.onStart?.(info(e), e);
    };
    const move = (e: PointerEvent) => {
      if (!active || e.pointerId !== id) return;
      const t = performance.now();
      const dt = Math.max(1, t - lt);
      vx = vx * 0.35 + ((e.clientX - lx) / dt) * 0.65;
      vy = vy * 0.35 + ((e.clientY - ly) / dt) * 0.65;
      lx = e.clientX; ly = e.clientY; lt = t;
      if (!moved) {
        const adx = Math.abs(e.clientX - sx), ady = Math.abs(e.clientY - sy);
        if (Math.hypot(adx, ady) < 6) return;
        if (axis === "x" && ady > adx * 1.2) { active = false; return; }
        if (axis === "y" && adx > ady * 1.2) { active = false; return; }
        moved = true;
        try { el.setPointerCapture(id); } catch { /* noop */ }
      }
      h.current.onMove?.(info(e), e);
    };
    const up = (e: PointerEvent) => {
      if (!active || e.pointerId !== id) return;
      active = false;
      if (performance.now() - lt > 90) { vx = 0; vy = 0; }
      h.current.onEnd?.(info(e), e);
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.style.touchAction = axis === "x" ? "pan-y" : axis === "y" ? "pan-x" : "none";
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [axis]);
  return ref;
}

/* =========================================================
   REVEAL COMPONENTS
   ========================================================= */
export type RevealFrom = "up" | "down" | "left" | "right" | "scale" | "blur" | "flip" | "rotate";
const FROM: Record<RevealFrom, string> = {
  up: "translate3d(0,36px,0)",
  down: "translate3d(0,-36px,0)",
  left: "translate3d(-48px,0,0)",
  right: "translate3d(48px,0,0)",
  scale: "scale(.82)",
  blur: "scale(1.06)",
  flip: "perspective(700px) rotateX(38deg)",
  rotate: "rotate(-8deg) scale(.9)",
};
export function Reveal({ children, from = "up", delay = 0, className, style, threshold = 0.15, once = true }: { children: ReactNode; from?: RevealFrom; delay?: number; className?: string; style?: CSSProperties; threshold?: number; once?: boolean }) {
  const [ref, v] = useInView<HTMLDivElement>({ threshold, once });
  return (
    <div ref={ref} className={className}
      style={{
        ...style,
        opacity: v ? 1 : 0,
        transform: v ? "none" : FROM[from],
        filter: from === "blur" && !v ? "blur(12px)" : undefined,
        transition: `opacity .7s ease ${delay}ms, transform .9s cubic-bezier(.2,.9,.3,1.12) ${delay}ms, filter .8s ease ${delay}ms`,
        transformOrigin: from === "flip" ? "50% 100%" : undefined,
      }}>
      {children}
    </div>
  );
}

export function SplitReveal({ text, className, stagger = 45, by = "word", delay = 0 }: { text: string; className?: string; stagger?: number; by?: "word" | "char"; delay?: number }) {
  const [ref, v] = useInView<HTMLSpanElement>({ threshold: 0.3 });
  const parts = by === "word" ? text.split(" ") : [...text];
  return (
    <span ref={ref} className={cn("inline", className)} aria-label={text}>
      {parts.map((p, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[.08em]" aria-hidden>
          <span className="inline-block"
            style={{ transform: v ? "none" : "translateY(115%) rotate(6deg)", opacity: v ? 1 : 0, transition: `transform .8s cubic-bezier(.2,.9,.3,1.2) ${delay + i * stagger}ms, opacity .5s ${delay + i * stagger}ms` }}>
            {by === "word" ? p : p === " " ? "\u00A0" : p}
            {by === "word" && i < parts.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
