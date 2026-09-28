import { useCallback, useEffect, useRef, useState } from "react";

/* Advanced gesture hooks — pointer-events based, mouse + touch unified. */

export type SwipeDir = "left" | "right" | "up" | "down";

/** Detect swipe with velocity + distance thresholds. */
export function useSwipe(onSwipe: (dir: SwipeDir, v: number) => void, threshold = 60) {
  const st = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    st.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  }, []);
  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const s = st.current;
    st.current = null;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    const dt = Math.max(1, performance.now() - s.t) / 1000;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) < threshold) return;
    const v = Math.max(ax, ay) / dt;
    onSwipe(ax > ay ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up", v);
  }, [onSwipe, threshold]);
  return { onPointerDown, onPointerUp };
}

/** Long-press with progress 0..1 and haptic tick at fire. */
export function useLongPress(onFire: () => void, ms = 600) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const t0 = useRef(0);
  const fired = useRef(false);
  const cancel = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setP(0);
    fired.current = false;
  }, []);
  const onPointerDown = useCallback(() => {
    t0.current = performance.now();
    fired.current = false;
    const loop = () => {
      const v = (performance.now() - t0.current) / ms;
      setP(Math.min(1, v));
      if (v >= 1 && !fired.current) {
        fired.current = true;
        try { navigator.vibrate?.(25); } catch { /* noop */ }
        onFire();
        return;
      }
      if (!fired.current) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [ms, onFire]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { p, fired: p >= 1, bind: { onPointerDown, onPointerUp: cancel, onPointerLeave: cancel, onPointerCancel: cancel } };
}

/** Drag with inertia: returns offset, velocity; call release() on pointerup for glide. */
export function useDragInertia(axis: "x" | "y" | "both" = "both", friction = 0.94) {
  const [o, setO] = useState({ x: 0, y: 0 });
  const st = useRef<{ sx: number; sy: number; ox: number; oy: number; lx: number; ly: number; vx: number; vy: number } | null>(null);
  const gliding = useRef(0);
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    cancelAnimationFrame(gliding.current);
    st.current = { sx: e.clientX, sy: e.clientY, ox: 0, oy: 0, lx: e.clientX, ly: e.clientY, vx: 0, vy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const s = st.current;
    if (!s) return;
    const dx = e.clientX - s.sx, dy = e.clientY - s.sy;
    s.vx = e.clientX - s.lx; s.vy = e.clientY - s.ly;
    s.lx = e.clientX; s.ly = e.clientY;
    setO({
      x: axis === "y" ? 0 : s.ox + dx,
      y: axis === "x" ? 0 : s.oy + dy,
    });
  }, [axis]);
  const onPointerUp = useCallback(() => {
    const s = st.current;
    st.current = null;
    if (!s) return;
    let { vx, vy } = s;
    if (axis === "x") vy = 0;
    if (axis === "y") vx = 0;
    const glide = () => {
      vx *= friction; vy *= friction;
      if (Math.abs(vx) < 0.3 && Math.abs(vy) < 0.3) return;
      setO((p) => ({ x: p.x + vx, y: p.y + vy }));
      gliding.current = requestAnimationFrame(glide);
    };
    gliding.current = requestAnimationFrame(glide);
  }, [axis, friction]);
  const reset = useCallback(() => { cancelAnimationFrame(gliding.current); setO({ x: 0, y: 0 }); }, []);
  useEffect(() => () => cancelAnimationFrame(gliding.current), []);
  return { o, setO, reset, bind: { onPointerDown, onPointerMove, onPointerUp } };
}

/** Magnetic pull toward element center. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const [o, setO] = useState({ x: 0, y: 0 });
  const ref = useRef<T>(null);
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const r = (ref.current ?? e.currentTarget as HTMLElement).getBoundingClientRect();
    setO({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
  }, [strength]);
  const onPointerLeave = useCallback(() => setO({ x: 0, y: 0 }), []);
  return { ref, o, bind: { onPointerMove, onPointerLeave } };
}

/** Wheel / pinch zoom value with clamping. Attach to onWheel. */
export function useWheelZoom(init = 1, min = 0.5, max = 3, step = 0.0015) {
  const [z, setZ] = useState(init);
  const onWheel = useCallback((e: React.WheelEvent) => {
    setZ((v) => Math.max(min, Math.min(max, v - e.deltaY * step * (e.ctrlKey ? 4 : 1))));
  }, [min, max, step]);
  return { z, setZ, onWheel };
}

/** Double-tap detector (touch + mouse). */
export function useDoubleTap(onDouble: () => void, ms = 300) {
  const last = useRef(0);
  return useCallback((e: React.PointerEvent) => {
    const now = performance.now();
    if (now - last.current < ms) {
      onDouble();
      last.current = 0;
    } else last.current = now;
    void e;
  }, [onDouble, ms]);
}

/** Press-and-hold repeat (like stepper): fires immediately, then repeats faster. */
export function useHoldRepeat(onTick: () => void, startDelay = 400, minInterval = 60) {
  const tm = useRef<number>(0);
  const iv = useRef<number>(0);
  const stop = useCallback(() => { clearTimeout(tm.current); clearInterval(iv.current); }, []);
  const start = useCallback(() => {
    onTick();
    tm.current = window.setTimeout(() => {
      let gap = 160;
      const tick = () => { onTick(); gap = Math.max(minInterval, gap * 0.85); iv.current = window.setTimeout(tick, gap); };
      iv.current = window.setTimeout(tick, gap);
    }, startDelay);
  }, [onTick, startDelay, minInterval]);
  useEffect(() => () => { clearTimeout(tm.current); clearInterval(iv.current); }, []);
  return { bind: { onPointerDown: start, onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop } };
}
