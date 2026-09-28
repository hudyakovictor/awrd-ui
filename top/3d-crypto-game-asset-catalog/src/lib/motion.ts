import { useCallback, useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════
   MOTION LIB — скролл, параллакс, мышь, пружины, изинги.
   Всё на rAF + IntersectionObserver, без внешних зависимостей.
   Уважает prefers-reduced-motion через lib/settings.
   ═══════════════════════════════════════════════════════════════════ */

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** обратная интерполяция: где v между a и b → 0..1 */
export const invLerp = (a: number, b: number, v: number) => clamp01((v - a) / (b - a || 1));

/* ——— Изинги 0..1 → 0..1 ——— */
export const EASINGS: Record<string, (t: number) => number> = {
  linear: (t) => t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
  snap: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
};
export const EASE_CSS: Record<string, string> = {
  spring: "cubic-bezier(.34,1.56,.64,1)",
  out: "cubic-bezier(.22,1,.36,1)",
  snap: "cubic-bezier(.9,0,.1,1)",
  smooth: "cubic-bezier(.4,0,.2,1)",
};

/* ——— inView: видимость элемента + доля пересечения ——— */
export function useInView<T extends Element>(opts: { threshold?: number; rootMargin?: string; once?: boolean } = {}) {
  const { threshold = 0.2, rootMargin = "0px", once = true } = opts;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [ratio, setRatio] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setRatio(e.intersectionRatio);
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: [0, threshold, 0.5, 0.75, 1], rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, rootMargin, once]);
  return { ref, inView, ratio };
}

/* ——— Позиция скролла страницы (rAF-throttled) ——— */
export function useScrollY() {
  const [y, setY] = useState(() => (typeof window === "undefined" ? 0 : window.scrollY));
  useEffect(() => {
    let raf = 0;
    let ticking = false;
    const on = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => {
        setY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return y;
}

/* ——— Направление скролла ——— */
export function useScrollDirection() {
  const [dir, setDir] = useState<"up" | "down" | "idle">("idle");
  const last = useRef(0);
  const idle = useRef(0);
  useEffect(() => {
    const on = () => {
      const y = window.scrollY;
      const d = y > last.current + 4 ? "down" : y < last.current - 4 ? "up" : null;
      if (d) setDir(d);
      last.current = y;
      window.clearTimeout(idle.current);
      idle.current = window.setTimeout(() => setDir("idle"), 160);
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return dir;
}

/* ——— Прогресс скролла: 0 вверху .. 1 внизу (страница или элемент) ——— */
export function useScrollProgress(target?: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      if (target?.current) {
        const r = target.current.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        setP(total <= 0 ? 1 : clamp01(-r.top / total));
      } else {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        setP(max <= 0 ? 0 : clamp01(h.scrollTop / max));
      }
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);
  return p;
}

/* ——— Скорость скролла (px/ms, сглаженная) ——— */
export function useScrollVelocity() {
  const [v, setV] = useState(0);
  useEffect(() => {
    let last = window.scrollY;
    let lastT = performance.now();
    let raf = 0;
    let val = 0;
    const step = (t: number) => {
      const y = window.scrollY;
      const dt = Math.max(1, t - lastT);
      const inst = (y - last) / dt;
      val = val * 0.85 + inst * 0.15;
      if (Math.abs(val) < 0.01) val = 0;
      setV(val);
      last = y;
      lastT = t;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  return v;
}

/* ——— Мышь внутри элемента, нормализованная −0.5..0.5 ——— */
export function useMouse<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [m, setM] = useState({ x: 0, y: 0, inside: false });
  const raf = useRef(0);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setM({ x, y, inside: true }));
  }, []);
  const onLeave = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setM({ x: 0, y: 0, inside: false });
  }, []);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return { ref, ...m, onMove, onLeave };
}

/* ——— Параллакс элемента относительно центра вьюпорта ———
   Возвращает ref и смещение −1..1 (0 = элемент в центре экрана) */
export function useParallax<T extends HTMLElement>(speed = 1) {
  const ref = useRef<T | null>(null);
  const [k, setK] = useState(0);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      const range = window.innerHeight / 2 + r.height / 2;
      setK(Math.max(-1, Math.min(1, center / (range || 1))) * speed);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, k };
}

/* ——— Физическая пружина к цели ——— */
export function useSpringValue(target: number, stiffness = 0.14, damping = 0.7) {
  const [v, setV] = useState(target);
  const s = useRef({ v: target, vel: 0 });
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const st = s.current;
      st.vel = st.vel * damping + (target - st.v) * stiffness;
      st.v += st.vel;
      setV(st.v);
      if (Math.abs(target - st.v) > 0.02 || Math.abs(st.vel) > 0.02) {
        raf = requestAnimationFrame(step);
      } else {
        st.v = target;
        st.vel = 0;
        setV(target);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping]);
  return v;
}

/* ——— Размер элемента ——— */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, ...size };
}

/* ——— Автоплей с паузой ——— */
export function useAutoplay(active: boolean, ms: number, cb: () => void) {
  const fn = useRef(cb);
  fn.current = cb;
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => fn.current(), ms);
    return () => clearInterval(id);
  }, [active, ms]);
}

/* ——— prefers-reduced-motion как реактивный флаг ——— */
export function useReducedMotion() {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setRm(mq.matches || document.documentElement.dataset.rm === "1");
    f();
    mq.addEventListener("change", f);
    const io = new MutationObserver(f);
    io.observe(document.documentElement, { attributes: true, attributeFilter: ["data-rm"] });
    return () => {
      mq.removeEventListener("change", f);
      io.disconnect();
    };
  }, []);
  return rm;
}

/* ——— Задержка появления (для каскадов при загрузке) ——— */
export function useMounted(delay = 30) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setM(true), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return m;
}
