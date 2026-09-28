import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type DependencyList,
  type PointerEvent as RPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "../utils/cn";

/* ================= MATH ================= */
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);
export const ease = {
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  outQuint: (t: number) => 1 - Math.pow(1 - t, 5),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t: number) =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1,
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const r = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ================= VISIBILITY CONTEXT =================
 * Each Asset provides whether it is on-screen. Loops/intervals
 * automatically pause when their asset is scrolled away.        */
export const VisibleCtx = createContext(true);
export const useAssetVisible = () => useContext(VisibleCtx);

export function useInterval(cb: () => void, ms: number | null) {
  const ref = useRef(cb);
  ref.current = cb;
  const visible = useContext(VisibleCtx);
  useEffect(() => {
    if (ms === null || !visible) return;
    const t = setInterval(() => ref.current(), ms);
    return () => clearInterval(t);
  }, [ms, visible]);
}

export function useRaf(cb: (dt: number, t: number) => void, active = true) {
  const ref = useRef(cb);
  ref.current = cb;
  const visible = useContext(VisibleCtx);
  useEffect(() => {
    if (!active || !visible) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ref.current(dt, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, visible]);
}

export function useAnimatedNumber(target: number, duration = 700) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  const cur = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const f = cur.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const val = f + (target - f) * ease.outCubic(p);
      cur.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

/** Imperative tween helper. Returns cancel fn. */
export function tween(
  from: number,
  to: number,
  duration: number,
  onUpdate: (v: number, p: number) => void,
  easing: (t: number) => number = ease.outCubic,
  onDone?: () => void,
) {
  const start = performance.now();
  let raf = 0;
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    onUpdate(from + (to - from) * easing(p), p);
    if (p < 1) raf = requestAnimationFrame(step);
    else onDone?.();
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

/* ================= IN VIEW ================= */
export function useInView<T extends Element = HTMLDivElement>(
  opts: { rootMargin?: string; threshold?: number; once?: boolean } = {},
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { rootMargin = "0px", threshold = 0.15, once = true } = opts;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) setInView(false);
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);
  return [ref, inView] as const;
}

export type RevealFrom = "up" | "down" | "left" | "right" | "scale" | "blur" | "flip" | "zoom" | "rotate" | "clip";
const hiddenTransform: Record<RevealFrom, string> = {
  up: "translate3d(0,44px,0)",
  down: "translate3d(0,-44px,0)",
  left: "translate3d(-56px,0,0)",
  right: "translate3d(56px,0,0)",
  scale: "scale(.86)",
  blur: "translate3d(0,18px,0) scale(.98)",
  flip: "perspective(900px) rotateX(38deg) translate3d(0,30px,0)",
  zoom: "scale(1.12)",
  rotate: "rotate(-8deg) scale(.9)",
  clip: "none",
};

export function Reveal({
  children,
  from = "up",
  delay = 0,
  duration = 750,
  className,
  style,
  once = true,
  threshold = 0.12,
}: {
  children: ReactNode;
  from?: RevealFrom;
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  threshold?: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold, once, rootMargin: "0px 0px -6% 0px" });
  const tr = `cubic-bezier(.2,.9,.25,1.05)`;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : hiddenTransform[from],
        filter: from === "blur" ? (inView ? "blur(0px)" : "blur(14px)") : undefined,
        clipPath: from === "clip" ? (inView ? "inset(0 0 0 0 round 16px)" : "inset(0 100% 0 0 round 16px)") : undefined,
        transition: `opacity ${duration}ms cubic-bezier(.2,.8,.2,1) ${delay}ms, transform ${duration}ms ${tr} ${delay}ms, filter ${duration}ms ease ${delay}ms, clip-path ${duration}ms cubic-bezier(.7,0,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ================= SCROLL ENGINE ================= */
export type ScrollInfo = { y: number; v: number; max: number; p: number; h: number };
const scrollInfo: ScrollInfo = { y: 0, v: 0, max: 1, p: 0, h: 800 };
const frameSubs = new Set<(i: ScrollInfo) => void>();
let ticking = false;
let prevY = 0;
let prevT = 0;
let idleTimer = 0;
let bound = false;

function scrollUpdate() {
  ticking = false;
  const y = window.scrollY;
  const t = performance.now();
  const dt = Math.max(8, t - prevT);
  scrollInfo.v = clamp(((y - prevY) / dt) * 16, -120, 120);
  prevY = y;
  prevT = t;
  scrollInfo.y = y;
  scrollInfo.h = window.innerHeight;
  scrollInfo.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  scrollInfo.p = clamp(y / scrollInfo.max, 0, 1);
  frameSubs.forEach((f) => f(scrollInfo));
}
function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(scrollUpdate);
  }
  clearTimeout(idleTimer);
  idleTimer = window.setTimeout(() => {
    scrollInfo.v = 0;
    frameSubs.forEach((f) => f(scrollInfo));
  }, 110);
}
function ensureBound() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  prevY = window.scrollY;
  prevT = performance.now();
  scrollUpdate();
}

/** Mutating subscription — no re-render. Best for parallax. */
export function useScrollFrame(cb: (i: ScrollInfo) => void) {
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => {
    ensureBound();
    const f = (i: ScrollInfo) => ref.current(i);
    frameSubs.add(f);
    f(scrollInfo);
    return () => {
      frameSubs.delete(f);
    };
  }, []);
}

export function useScrollInfo() {
  const [s, setS] = useState<ScrollInfo>({ ...scrollInfo });
  useScrollFrame((i) => setS({ ...i }));
  return s;
}

/** Progress of an element travelling through the viewport: 0 (enters bottom) → 1 (leaves top). */
export function useElementThrough(ref: RefObject<HTMLElement | null>, cb: (p: number, rect: DOMRect) => void) {
  useScrollFrame((i) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    cb(clamp((i.h - r.top) / (i.h + r.height), 0, 1), r);
  });
}

/** Progress through a tall container whose first child is sticky. */
export function useStickyProgress(ref: RefObject<HTMLElement | null>, top: number, cb: (p: number) => void) {
  useScrollFrame(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const child = el.firstElementChild as HTMLElement | null;
    const sh = child ? child.offsetHeight : window.innerHeight - top;
    const total = Math.max(1, r.height - sh);
    cb(clamp((top - r.top) / total, 0, 1));
  });
}

/* ================= POINTER / TILT / MAGNETIC ================= */
export function Tilt({
  children,
  className,
  style,
  max = 12,
  scale = 1.03,
  glare = true,
  perspective = 900,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
  scale?: number;
  glare?: boolean;
  perspective?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const s = useRef({ x: 0, y: 0, tx: 0, ty: 0, s: 1, ts: 1, raf: 0 });
  const loop = () => {
    const st = s.current;
    st.x = lerp(st.x, st.tx, 0.14);
    st.y = lerp(st.y, st.ty, 0.14);
    st.s = lerp(st.s, st.ts, 0.14);
    const el = ref.current;
    if (el) {
      el.style.transform = `perspective(${perspective}px) rotateX(${(-st.y * max).toFixed(2)}deg) rotateY(${(st.x * max).toFixed(2)}deg) scale(${st.s.toFixed(3)})`;
      el.style.setProperty("--mx", `${((st.x + 1) * 50).toFixed(1)}%`);
      el.style.setProperty("--my", `${((st.y + 1) * 50).toFixed(1)}%`);
      el.style.setProperty("--tilt", `${Math.hypot(st.x, st.y).toFixed(3)}`);
    }
    if (Math.abs(st.tx - st.x) > 0.001 || Math.abs(st.ty - st.y) > 0.001 || Math.abs(st.ts - st.s) > 0.001) st.raf = requestAnimationFrame(loop);
    else st.raf = 0;
  };
  const kick = () => {
    if (!s.current.raf) s.current.raf = requestAnimationFrame(loop);
  };
  useEffect(() => () => cancelAnimationFrame(s.current.raf), []);
  return (
    <div
      ref={ref}
      className={cn("group/tilt relative [transform-style:preserve-3d]", className)}
      style={{ ...style, ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        s.current.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        s.current.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        s.current.ts = scale;
        kick();
      }}
      onPointerLeave={() => {
        s.current.tx = 0;
        s.current.ty = 0;
        s.current.ts = 1;
        kick();
      }}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: "radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,.22), transparent 55%)" }}
        />
      )}
    </div>
  );
}

export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={cn("inline-block transition-transform duration-300 ease-[cubic-bezier(.3,1.6,.5,1)]", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        if (ref.current) {
          ref.current.style.transitionDuration = "80ms";
          ref.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      }}
      onPointerLeave={() => {
        if (ref.current) {
          ref.current.style.transitionDuration = "500ms";
          ref.current.style.transform = "translate(0,0)";
        }
      }}
    >
      {children}
    </div>
  );
}

/** Smoothed pointer position (-1..1) over an element, delivered each frame without re-render. */
export function usePointerParallax(ref: RefObject<HTMLElement | null>, cb: (x: number, y: number) => void, smooth = 0.08) {
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const visible = useContext(VisibleCtx);
  useEffect(() => {
    const el = ref.current;
    if (!el || !visible) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.current.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.2, 1.2);
      target.current.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.2, 1.2);
    };
    const leave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };
    const orient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      target.current.x = clamp(e.gamma / 30, -1, 1);
      target.current.y = clamp((e.beta - 45) / 30, -1, 1);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("deviceorientation", orient);
    let raf = 0;
    const loop = () => {
      cur.current.x = lerp(cur.current.x, target.current.x, smooth);
      cur.current.y = lerp(cur.current.y, target.current.y, smooth);
      cbRef.current(cur.current.x, cur.current.y);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("deviceorientation", orient);
      cancelAnimationFrame(raf);
    };
  }, [ref, smooth, visible]);
}

/* ================= DRAG / SWIPE ================= */
export type DragState = {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
  first: boolean;
  last: boolean;
  moved: boolean;
  target: HTMLElement;
};

export function useDrag(
  handler: (s: DragState) => void,
  opts: { threshold?: number; capture?: "lazy" | "immediate"; mouseOnly?: boolean } = {},
) {
  const h = useRef(handler);
  h.current = handler;
  const { threshold = 4, capture = "lazy", mouseOnly = false } = opts;
  const st = useRef<{
    id: number;
    sx: number;
    sy: number;
    lx: number;
    ly: number;
    lt: number;
    vx: number;
    vy: number;
    moved: boolean;
    el: HTMLElement;
  } | null>(null);

  const onPointerDown = (e: RPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (mouseOnly && e.pointerType !== "mouse") return;
    const el = e.currentTarget as HTMLElement;
    st.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0, moved: false, el };
    if (capture === "immediate") el.setPointerCapture?.(e.pointerId);
    h.current({ dx: 0, dy: 0, vx: 0, vy: 0, x: e.clientX, y: e.clientY, first: true, last: false, moved: false, target: el });
  };
  const onPointerMove = (e: RPointerEvent) => {
    const s = st.current;
    if (!s || e.pointerId !== s.id) return;
    const now = performance.now();
    const dt = Math.max(1, now - s.lt);
    s.vx = s.vx * 0.25 + ((e.clientX - s.lx) / dt) * 0.75;
    s.vy = s.vy * 0.25 + ((e.clientY - s.ly) / dt) * 0.75;
    s.lx = e.clientX;
    s.ly = e.clientY;
    s.lt = now;
    const dx = e.clientX - s.sx;
    const dy = e.clientY - s.sy;
    if (!s.moved && Math.hypot(dx, dy) > threshold) {
      s.moved = true;
      if (capture === "lazy") s.el.setPointerCapture?.(e.pointerId);
    }
    h.current({ dx, dy, vx: s.vx, vy: s.vy, x: e.clientX, y: e.clientY, first: false, last: false, moved: s.moved, target: s.el });
  };
  const end = (e: RPointerEvent) => {
    const s = st.current;
    if (!s || e.pointerId !== s.id) return;
    const idle = performance.now() - s.lt > 90;
    h.current({
      dx: e.clientX - s.sx,
      dy: e.clientY - s.sy,
      vx: idle ? 0 : s.vx,
      vy: idle ? 0 : s.vy,
      x: e.clientX,
      y: e.clientY,
      first: false,
      last: true,
      moved: s.moved,
      target: s.el,
    });
    st.current = null;
  };
  return { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end };
}

/* ================= SPRING ================= */
export function useSpring(target: number, { stiffness = 170, damping = 20, mass = 1 } = {}) {
  const [v, setV] = useState(target);
  const s = useRef({ x: target, v: 0, raf: 0 });
  useEffect(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const st = s.current;
      const F = -stiffness * (st.x - target) - damping * st.v;
      st.v += (F / mass) * dt;
      st.x += st.v * dt;
      if (Math.abs(st.v) < 0.01 && Math.abs(st.x - target) < 0.005) {
        st.x = target;
        st.v = 0;
        setV(target);
        st.raf = 0;
        return;
      }
      setV(st.x);
      st.raf = requestAnimationFrame(step);
    };
    cancelAnimationFrame(s.current.raf);
    s.current.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(s.current.raf);
  }, [target, stiffness, damping, mass]);
  return v;
}

/* ================= FLIP ================= */
/** Animates any [data-flip] child from its previous position to the new one. */
export function useFlip(containerRef: RefObject<HTMLElement | null>, deps: DependencyList, duration = 420) {
  const rects = useRef(new Map<string, { x: number; y: number }>());
  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const rr = root.getBoundingClientRect();
    const next = new Map<string, { x: number; y: number }>();
    root.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
      const id = el.dataset.flip!;
      const r = el.getBoundingClientRect();
      const pos = { x: r.left - rr.left, y: r.top - rr.top };
      next.set(id, pos);
      const prev = rects.current.get(id);
      if (prev) {
        const dx = prev.x - pos.x;
        const dy = prev.y - pos.y;
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          el.animate(
            [
              { transform: `translate(${dx}px, ${dy}px) scale(1.04)` },
              { transform: "translate(0,0) scale(1)" },
            ],
            { duration, easing: "cubic-bezier(.3,1.25,.5,1)" },
          );
        }
      }
    });
    rects.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ================= COUNT UP ================= */
export function CountUp({
  to,
  duration = 1600,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  to: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    return tween(0, to, duration, (x) => setV(x), ease.outQuart);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ================= MISC ================= */
export function useLatest<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}

export function useTimeoutFn() {
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);
  return (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };
}
