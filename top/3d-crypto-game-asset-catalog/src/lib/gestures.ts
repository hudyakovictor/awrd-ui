import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type KeyboardEvent as RKeyboardEvent } from "react";

/* ——————————————————————————————————————————————
   Gesture primitives: drag (with velocity), long-press, tilt.
   Pointer-events based → mouse, touch and pen with one code path.
   —————————————————————————————————————————————— */

export type DragInfo = { dx: number; dy: number; x: number; y: number; vx: number; vy: number; startX: number; startY: number };

type DragOpts = {
  onStart?: (d: DragInfo) => void;
  onMove?: (d: DragInfo) => void;
  onEnd?: (d: DragInfo) => void;
  threshold?: number;
  disabled?: boolean;
};

export function useDrag(opts: DragOpts) {
  const o = useRef(opts);
  o.current = opts;
  const [dragging, setDragging] = useState(false);

  const onPointerDown = useCallback((e: RPointerEvent<HTMLElement>) => {
    if (o.current.disabled) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const startX = e.clientX;
    const startY = e.clientY;
    let started = false;
    let lx = startX;
    let ly = startY;
    let lt = performance.now();
    let vx = 0;
    let vy = 0;
    const thr = o.current.threshold ?? 3;
    const info = (ev: PointerEvent): DragInfo => ({ dx: ev.clientX - startX, dy: ev.clientY - startY, x: ev.clientX, y: ev.clientY, vx, vy, startX, startY });

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lt);
      vx = vx * 0.6 + ((ev.clientX - lx) / dt) * 1000 * 0.4;
      vy = vy * 0.6 + ((ev.clientY - ly) / dt) * 1000 * 0.4;
      lx = ev.clientX;
      ly = ev.clientY;
      lt = now;
      if (!started && Math.hypot(ev.clientX - startX, ev.clientY - startY) > thr) {
        started = true;
        setDragging(true);
        o.current.onStart?.(info(ev));
      }
      if (started) o.current.onMove?.(info(ev));
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (performance.now() - lt > 80) {
        vx = 0;
        vy = 0;
      }
      if (started) o.current.onEnd?.(info(ev));
      setDragging(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }, []);

  return { onPointerDown, dragging };
}

/** Hold-to-confirm. Returns progress 0..1 and handlers (pointer + keyboard Space/Enter). */
export function useLongPress(ms: number, onDone: () => void, onCancel?: () => void) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const raf = useRef(0);
  const start = useRef(0);
  const done = useRef(false);
  const cb = useRef({ onDone, onCancel });
  cb.current = { onDone, onCancel };

  const tick = useCallback(() => {
    const p = Math.min(1, (performance.now() - start.current) / ms);
    setProgress(p);
    if (p >= 1) {
      done.current = true;
      setHolding(false);
      cb.current.onDone();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [ms]);

  const begin = useCallback(() => {
    if (holding) return;
    done.current = false;
    start.current = performance.now();
    setHolding(true);
    raf.current = requestAnimationFrame(tick);
  }, [holding, tick]);

  const end = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (!done.current && holding) {
      cb.current.onCancel?.();
    }
    setHolding(false);
    if (!done.current) setProgress(0);
  }, [holding]);

  const reset = useCallback(() => {
    done.current = false;
    setProgress(0);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return {
    progress,
    holding,
    reset,
    handlers: {
      onPointerDown: (e: RPointerEvent) => {
        e.preventDefault();
        begin();
      },
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      onKeyDown: (e: RKeyboardEvent) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          begin();
        }
      },
      onKeyUp: (e: RKeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") end();
      },
      onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    },
  };
}

/** Spring-ish value follower for smooth numbers driven by rAF. */
export function useSpring(target: number, stiffness = 0.18, damping = 0.72) {
  const [v, setV] = useState(target);
  const s = useRef({ v: target, vel: 0 });
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const st = s.current;
      st.vel = st.vel * damping + (target - st.v) * stiffness;
      st.v += st.vel;
      setV(st.v);
      if (Math.abs(target - st.v) > 0.05 || Math.abs(st.vel) > 0.05) raf = requestAnimationFrame(step);
      else {
        st.v = target;
        setV(target);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping]);
  return v;
}

/** Countdown to a fixed timestamp → "HH:MM:SS" */
export function useCountdown(ms: number) {
  const [end] = useState(() => Date.now() + ms);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, end - now);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const sec = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { left, text: `${pad(h)}:${pad(m)}:${pad(sec)}`, h, m, s: sec };
}
