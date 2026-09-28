import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, a: number, b: number, c: number, d: number) => c + ((clamp(v, Math.min(a, b), Math.max(a, b)) - a) / (b - a)) * (d - c);

/* ───────── In-view (IntersectionObserver) ───────── */
export function useInView<T extends Element = HTMLDivElement>(opts: { once?: boolean; threshold?: number; rootMargin?: string } = {}) {
  const ref = useRef<T>(null);
  const [inView, set] = useState(false);
  const { once = true, threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { set(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { set(true); if (once) io.disconnect(); }
      else if (!once) set(false);
    }, { threshold, rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold, rootMargin]);
  return [ref, inView] as const;
}

/* ───────── Element scroll progress ─────────
   through: 0 when element top enters bottom of viewport → 1 when bottom leaves top
   pinned : 0 when element top hits viewport top → 1 when its bottom hits viewport bottom (for sticky scenes) */
export function useElementScroll<T extends HTMLElement = HTMLDivElement>(mode: "through" | "pinned" | "center" = "through") {
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
      let v: number;
      if (mode === "pinned") v = -r.top / Math.max(1, r.height - vh);
      else if (mode === "center") v = (vh / 2 - r.top) / Math.max(1, r.height);
      else v = (vh - r.top) / (vh + r.height);
      setP((old) => {
        const nv = clamp(v, 0, 1);
        return Math.abs(old - nv) < 0.0005 ? old : nv;
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [mode]);
  return [ref, p] as const;
}

/* ───────── Window scroll (y, progress) ───────── */
export function useWindowScroll() {
  const [s, setS] = useState({ y: 0, p: 0, dir: 1 as 1 | -1 });
  useEffect(() => {
    let raf = 0, last = window.scrollY;
    const calc = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const dir: 1 | -1 = y >= last ? 1 : -1;
      last = y;
      setS({ y, p: max > 0 ? y / max : 0, dir });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return s;
}

/* ───────── Smoothed scroll velocity (px / frame) ───────── */
export function useScrollVelocity() {
  const [v, setV] = useState(0);
  useEffect(() => {
    let last = window.scrollY, lt = performance.now(), cur = 0, raf = 0, shown = 0;
    const loop = () => {
      const now = performance.now();
      const y = window.scrollY;
      const inst = ((y - last) / Math.max(1, now - lt)) * 16;
      last = y; lt = now;
      cur += (inst - cur) * 0.12;
      if (Math.abs(cur) < 0.02) cur = 0;
      if (Math.abs(cur - shown) > 0.04 || (cur === 0 && shown !== 0)) { shown = cur; setV(cur); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return v;
}

/* ───────── Global mouse (normalized -1..1) ───────── */
export function useWindowMouse() {
  const [m, setM] = useState({ x: 0, y: 0 });
  useEffect(() => {
    let raf = 0, nx = 0, ny = 0;
    const on = (e: PointerEvent) => {
      nx = (e.clientX / window.innerWidth) * 2 - 1;
      ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; setM({ x: nx, y: ny }); });
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => { window.removeEventListener("pointermove", on); cancelAnimationFrame(raf); };
  }, []);
  return m;
}

/* ───────── Pointer drag with velocity ───────── */
export type DragInfo = { dx: number; dy: number; vx: number; vy: number; x: number; y: number; sx: number; sy: number; dt: number };
export function useDrag(h: { onStart?: (x: number, y: number, e: RPointerEvent) => void | boolean; onMove?: (d: DragInfo) => void; onEnd?: (d: DragInfo) => void }) {
  const hr = useRef(h);
  hr.current = h;
  return useCallback((e: RPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    if (hr.current.onStart?.(sx, sy, e) === false) return;
    const t0 = performance.now();
    let lx = sx, ly = sy, lt = t0, vx = 0, vy = 0;
    const mk = (ev: PointerEvent): DragInfo => ({ dx: ev.clientX - sx, dy: ev.clientY - sy, vx, vy, x: ev.clientX, y: ev.clientY, sx, sy, dt: performance.now() - t0 });
    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lt);
      vx = vx * 0.5 + ((ev.clientX - lx) / dt) * 16 * 0.5;
      vy = vy * 0.5 + ((ev.clientY - ly) / dt) * 16 * 0.5;
      lx = ev.clientX; ly = ev.clientY; lt = now;
      hr.current.onMove?.(mk(ev));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (performance.now() - lt > 90) { vx = 0; vy = 0; }
      hr.current.onEnd?.(mk(ev));
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, []);
}

/* ───────── Spring physics (with hold/release for drag) ───────── */
export function useSpring(target: number, stiffness = 170, damping = 24) {
  const [v, setV] = useState(target);
  const s = useRef({ x: target, v: 0, hold: false });
  const [kick, setKick] = useState(0);
  useEffect(() => {
    if (s.current.hold) return;
    let raf = 0, last = performance.now();
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
  }, [target, stiffness, damping, kick]);
  const api = useMemo(() => ({
    set: (x: number) => { s.current.hold = true; s.current.x = x; s.current.v = 0; setV(x); },
    release: (vel = 0) => { s.current.hold = false; s.current.v = vel; setKick((n) => n + 1); },
    get: () => s.current.x,
  }), []);
  return [v, api] as const;
}

/* ───────── rAF loop ───────── */

export function useRaf(cb: (dt: number, t: number) => void, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0, last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(64, t - last);
      last = t;
      ref.current(dt, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/* ───────── Long press ───────── */
export function useLongPress(onLong: () => void, ms = 450) {
  const t = useRef<number | undefined>(undefined);
  const fired = useRef(false);
  const start = () => { fired.current = false; t.current = window.setTimeout(() => { fired.current = true; onLong(); }, ms); };
  const cancel = () => clearTimeout(t.current);
  return { onPointerDown: start, onPointerUp: cancel, onPointerLeave: cancel, fired };
}

/* ───────── Previous value ───────── */
export function usePrevious<T>(v: T) {
  const r = useRef<T>(v);
  useEffect(() => { r.current = v; }, [v]);
  return r.current;
}

/* ───────── Device tilt (gyroscope) with mouse fallback ───────── */
export function useTilt() {
  const m = useWindowMouse();
  const [g, setG] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
    let raf = 0, gx = 0, gy = 0;
    const on = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      gx = clamp(e.gamma / 28, -1, 1);
      gy = clamp((e.beta - 42) / 28, -1, 1);
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; setG({ x: gx, y: gy }); });
    };
    window.addEventListener("deviceorientation", on);
    return () => { window.removeEventListener("deviceorientation", on); cancelAnimationFrame(raf); };
  }, []);
  return g ?? m;
}

export async function requestGyro(): Promise<boolean> {
  if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return false;
  const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
  if (typeof D.requestPermission === "function") {
    try { return (await D.requestPermission()) === "granted"; } catch { return false; }
  }
  return true;
}

/* ───────── Shake detection (devicemotion) ───────── */
export function useShake(onShake: () => void, threshold = 16) {
  const ref = useRef(onShake);
  ref.current = onShake;
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) return;
    let last = 0;
    const on = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.abs(a.x ?? 0) + Math.abs(a.y ?? 0) + Math.abs(a.z ?? 0) - 9.8;
      const now = Date.now();
      if (mag > threshold && now - last > 900) { last = now; ref.current(); }
    };
    window.addEventListener("devicemotion", on);
    return () => window.removeEventListener("devicemotion", on);
  }, [threshold]);
}
