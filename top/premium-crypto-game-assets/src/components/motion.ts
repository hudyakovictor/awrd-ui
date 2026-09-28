import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

/* Shared motion runtime: events update targets, RAF renders interpolation. */
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * progress;

export const damp = (
  current: number,
  target: number,
  lambda: number,
  deltaSeconds: number,
) => lerp(current, target, 1 - Math.exp(-lambda * deltaSeconds));

export const map = (
  value: number,
  inputStart: number,
  inputEnd: number,
  outputStart: number,
  outputEnd: number,
) => outputStart + ((value - inputStart) / Math.max(0.0001, inputEnd - inputStart)) * (outputEnd - outputStart);

export const snapTo = (value: number, step: number) =>
  Math.round(value / step) * step;

export const wrap = (value: number, min: number, max: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

export const easeOutCubic = (value: number) =>
  1 - Math.pow(1 - clamp(value, 0, 1), 3);

export const easeInOutCubic = (value: number) => {
  const t = clamp(value, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function useRafLoop(
  callback: (time: number, deltaSeconds: number) => void,
  enabled = true,
) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const frame = (time: number) => {
      if (!active) return;
      if (document.hidden) {
        lastTimeRef.current = time;
        frameRef.current = requestAnimationFrame(frame);
        return;
      }
      const previous = lastTimeRef.current ?? time;
      const delta = clamp((time - previous) / 1000, 0, 0.064);
      lastTimeRef.current = time;
      callbackRef.current(time, delta);
      frameRef.current = requestAnimationFrame(frame);
    };
    frameRef.current = requestAnimationFrame(frame);
    return () => {
      active = false;
      lastTimeRef.current = null;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled]);

  return useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);
}

export function useMedia(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export function useReduceMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}

export function useCoarsePointer() {
  return useMedia("(pointer: coarse)");
}

export const MOTION_OK = (reduceMotion: boolean) => !reduceMotion;

type SpringOptions = {
  stiffness?: number;
  damping?: number;
  mass?: number;
  precision?: number;
  immediate?: boolean;
};

/** Physics spring that continues after the input event ends. */
export function useSpringNumber(target: number, options: SpringOptions = {}) {
  const {
    stiffness = 220,
    damping = 26,
    mass = 1,
    precision = 0.001,
    immediate = false,
  } = options;
  const reduceMotion = useReduceMotion();
  const valueRef = useRef(target);
  const targetRef = useRef(target);
  const velocityRef = useRef(0);
  const renderedRef = useRef(target);
  const [value, setValue] = useState(target);
  const [active, setActive] = useState(false);
  targetRef.current = target;

  useEffect(() => {
    if (Math.abs(valueRef.current - target) >= precision || immediate || reduceMotion) {
      setActive(true);
    }
  }, [immediate, precision, reduceMotion, target]);

  useRafLoop((_, delta) => {
    if (immediate || reduceMotion) {
      if (valueRef.current !== targetRef.current) {
        valueRef.current = targetRef.current;
        velocityRef.current = 0;
        renderedRef.current = targetRef.current;
        setValue(targetRef.current);
      }
      setActive(false);
      return;
    }

    const displacement = valueRef.current - targetRef.current;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * velocityRef.current;
    velocityRef.current += ((springForce + dampingForce) / mass) * delta;
    valueRef.current += velocityRef.current * delta;

    const settled =
      Math.abs(velocityRef.current) < precision &&
      Math.abs(displacement) < precision;
    if (settled) {
      valueRef.current = targetRef.current;
      velocityRef.current = 0;
      setActive(false);
    }
    if (Math.abs(renderedRef.current - valueRef.current) >= precision) {
      renderedRef.current = valueRef.current;
      setValue(valueRef.current);
    }
  }, active);
  return value;
}

export function useSpringPoint(
  target: { x: number; y: number },
  options: SpringOptions = {},
) {
  const x = useSpringNumber(target.x, options);
  const y = useSpringNumber(target.y, options);
  return { x, y };
}

type PointerState = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  inside: boolean;
};

export function usePointer(): {
  ref: RefObject<HTMLElement | null>;
  point: PointerState;
} {
  const ref = useRef<HTMLElement>(null);
  const [point, setPoint] = useState<PointerState>({
    x: 0.5,
    y: 0.5,
    rx: 0,
    ry: 0,
    inside: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame: number | null = null;
    let pending: PointerEvent | null = null;

    const commit = () => {
      frame = null;
      if (!pending) return;
      const bounds = element.getBoundingClientRect();
      const x = clamp((pending.clientX - bounds.left) / bounds.width, 0, 1);
      const y = clamp((pending.clientY - bounds.top) / bounds.height, 0, 1);
      setPoint({ x, y, rx: (0.5 - y) * 12, ry: (x - 0.5) * 14, inside: true });
    };
    const move = (event: PointerEvent) => {
      pending = event;
      if (frame === null) frame = requestAnimationFrame(commit);
    };
    const leave = () => setPoint({ x: 0.5, y: 0.5, rx: 0, ry: 0, inside: false });
    element.addEventListener("pointermove", move, { passive: true });
    element.addEventListener("pointerleave", leave);
    element.addEventListener("pointercancel", leave);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("pointercancel", leave);
    };
  }, []);
  return { ref, point };
}

export function useDampedPointer(options: SpringOptions = {}) {
  const { ref, point } = usePointer();
  const spring = useSpringPoint(
    { x: point.x, y: point.y },
    { stiffness: 180, damping: 24, ...options },
  );
  return {
    ref,
    point: {
      ...spring,
      rx: (0.5 - spring.y) * 12,
      ry: (spring.x - 0.5) * 14,
      inside: point.inside,
    },
  };
}

export function useScrollProgress(target: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const bounds = element.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      setProgress(clamp((viewport - bounds.top) / (viewport + bounds.height), 0, 1));
    };
    const requestMeasure = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
    };
  }, [target]);
  return progress;
}

export function useDampedScrollY(lambda = 16) {
  const targetRef = useRef(0);
  const valueRef = useRef(0);
  const renderedRef = useRef(0);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const update = () => { targetRef.current = window.scrollY; };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useRafLoop((_, delta) => {
    valueRef.current = damp(valueRef.current, targetRef.current, lambda, delta);
    if (Math.abs(renderedRef.current - valueRef.current) > .1) {
      renderedRef.current = valueRef.current;
      setValue(valueRef.current);
    }
  });
  return value;
}

export function useScrollVelocity() {
  const lastRef = useRef(0);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const renderedRef = useRef(0);
  const [velocity, setVelocity] = useState(0);
  useEffect(() => {
    const update = () => {
      const next = window.scrollY;
      targetRef.current = next - lastRef.current;
      lastRef.current = next;
    };
    lastRef.current = window.scrollY;
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useRafLoop((_, delta) => {
    currentRef.current = damp(currentRef.current, targetRef.current, 12, delta);
    targetRef.current *= 0.88;
    if (Math.abs(renderedRef.current - currentRef.current) > .01) {
      renderedRef.current = currentRef.current;
      setVelocity(currentRef.current);
    }
  });
  return velocity;
}

export type Axis = "x" | "y";
type DragOptions = {
  axis?: Axis;
  min: number;
  max: number;
  initial?: number;
  snap?: number;
  friction?: number;
  rubberBand?: number;
  onSettle?: (value: number) => void;
};

/** Inertial drag with velocity, rubber-band boundaries and release snapping. */
export function useDrag(options: DragOptions) {
  const {
    axis = "x",
    min,
    max,
    initial = 0,
    snap,
    friction = 0.92,
    rubberBand = 0.18,
    onSettle,
  } = options;
  const valueRef = useRef(clamp(initial, min, max));
  const targetRef = useRef(valueRef.current);
  const velocityRef = useRef(0);
  const renderedRef = useRef(valueRef.current);
  const pointerRef = useRef<number | null>(null);
  const previousRef = useRef({ position: 0, time: 0 });
  const [value, setValue] = useState(valueRef.current);
  const [dragging, setDragging] = useState(false);

  const applyBounds = useCallback((next: number) => {
    if (next < min) return min + (next - min) * rubberBand;
    if (next > max) return max + (next - max) * rubberBand;
    return next;
  }, [max, min, rubberBand]);

  useRafLoop((_, delta) => {
    if (pointerRef.current !== null) return;
    velocityRef.current *= Math.pow(friction, delta * 60);
    targetRef.current += velocityRef.current * delta;
    if (targetRef.current < min || targetRef.current > max) {
      const boundary = clamp(targetRef.current, min, max);
      targetRef.current = damp(targetRef.current, boundary, 20, delta);
      velocityRef.current *= 0.72;
    }
    if (Math.abs(velocityRef.current) < 5 && snap) {
      const snapped = clamp(snapTo(targetRef.current, snap), min, max);
      targetRef.current = damp(targetRef.current, snapped, 18, delta);
      if (Math.abs(targetRef.current - snapped) < 0.15) {
        targetRef.current = snapped;
        velocityRef.current = 0;
        onSettle?.(snapped);
      }
    }
    valueRef.current = damp(valueRef.current, targetRef.current, 24, delta);
    if (Math.abs(renderedRef.current - valueRef.current) > .01) {
      renderedRef.current = valueRef.current;
      setValue(valueRef.current);
    }
  });

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    pointerRef.current = event.pointerId;
    previousRef.current = {
      position: axis === "x" ? event.clientX : event.clientY,
      time: performance.now(),
    };
    velocityRef.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    const position = axis === "x" ? event.clientX : event.clientY;
    const time = performance.now();
    const deltaPosition = position - previousRef.current.position;
    const deltaTime = Math.max(8, time - previousRef.current.time);
    targetRef.current = applyBounds(targetRef.current + deltaPosition);
    valueRef.current = targetRef.current;
    renderedRef.current = valueRef.current;
    velocityRef.current = (deltaPosition / deltaTime) * 1000;
    previousRef.current = { position, time };
    setValue(valueRef.current);
  };
  const release = (event: ReactPointerEvent<HTMLElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    pointerRef.current = null;
    setDragging(false);
  };
  const set = useCallback((next: number, immediate = false) => {
    targetRef.current = clamp(next, min, max);
    velocityRef.current = 0;
    if (immediate) {
      valueRef.current = targetRef.current;
      renderedRef.current = valueRef.current;
      setValue(valueRef.current);
    }
  }, [max, min]);

  return {
    value,
    velocity: velocityRef.current,
    dragging,
    set,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: release,
      onPointerCancel: release,
      onLostPointerCapture: release,
    },
  };
}

export function carouselSpring(current: number, target: number, lambda: number, deltaSeconds: number) {
  return damp(current, target, lambda, deltaSeconds);
}