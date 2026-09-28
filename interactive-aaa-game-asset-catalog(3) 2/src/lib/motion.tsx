import React, { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

/* =====================================================================
   MOTION CORE «SIGNAL» — единая физика для всех экранов каталога
   ===================================================================== */

/* ---------------------------------------------------------------------
   ТЮНИНГ-ЯДРО. S — живой объект: движки читают его в момент рендера,
   поэтому слайдеры в каталоге меняют физику всех экранов сразу.
   --------------------------------------------------------------------- */
export type Spring = { type: "spring"; stiffness: number; damping: number; mass: number };

export const BASE: Record<"snap" | "pop" | "soft" | "heavy", Spring> = {
  /** UI-отклик: мгновенно, почти без overshoot */
  snap: { type: "spring", stiffness: 760, damping: 34, mass: 0.55 },
  /** Игровой «поп»: заметный overshoot — для наград и акцентов */
  pop: { type: "spring", stiffness: 430, damping: 17, mass: 0.7 },
  /** Панели и листы: мягкая посадка */
  soft: { type: "spring", stiffness: 210, damping: 26, mass: 1 },
  /** Тяжёлые объекты: инерция массы */
  heavy: { type: "spring", stiffness: 130, damping: 20, mass: 1.6 },
};

export const S: Record<keyof typeof BASE, Spring> = {
  snap: { ...BASE.snap }, pop: { ...BASE.pop }, soft: { ...BASE.soft }, heavy: { ...BASE.heavy },
};

export type Tune = {
  speed: number;      // общий темп: ×stiffness, ÷duration
  bounce: number;     // множитель «упругости» (обратно damping)
  weight: number;     // масса объектов
  stagger: number;    // множитель каскадов
  impact: number;     // сила тряски
  particles: number;  // плотность частиц
  sound: boolean;
};
export const TUNE: Tune = { speed: 1, bounce: 1, weight: 1, stagger: 1, impact: 1, particles: 1, sound: true };

export function applyTune(t: Partial<Tune>) {
  Object.assign(TUNE, t);
  (Object.keys(BASE) as (keyof typeof BASE)[]).forEach((k) => {
    S[k].stiffness = Math.round(BASE[k].stiffness * TUNE.speed);
    S[k].damping = Math.max(4, +(BASE[k].damping / TUNE.bounce).toFixed(1));
    S[k].mass = +(BASE[k].mass * TUNE.weight).toFixed(2);
  });
}
/** длительность с учётом общего темпа */
export const dur = (v: number) => +(v / TUNE.speed).toFixed(3);
/** задержка каскада с учётом множителя */
export const stg = (i: number, step = 0.07) => +(i * step * TUNE.stagger).toFixed(3);

/** Пружина из базового пресета и произвольного профиля — для A/B-сравнения
 *  без изменения глобального состояния. */
export function springFrom(key: keyof typeof BASE, t: Partial<Tune>): Spring {
  const sp = t.speed ?? 1, bo = t.bounce ?? 1, we = t.weight ?? 1;
  return {
    type: "spring",
    stiffness: Math.round(BASE[key].stiffness * sp),
    damping: +(BASE[key].damping / bo).toFixed(1),
    mass: +(BASE[key].mass * we).toFixed(2),
  };
}

/* ---------- Численная симуляция пружины: график + метрики ---------- */
export function sampleSpring(s: Spring, steps = 220, dt = 1 / 120) {
  const pts: number[] = [];
  let x = 0, v = 0;
  for (let i = 0; i < steps; i++) {
    const a = (-s.stiffness * (x - 1) - s.damping * v) / Math.max(0.05, s.mass);
    v += a * dt; x += v * dt;
    pts.push(x);
  }
  const overshoot = Math.max(0, Math.max(...pts) - 1);
  let settle = steps;
  for (let i = steps - 1; i >= 0; i--) { if (Math.abs(pts[i] - 1) > 0.02) { settle = i + 1; break; } }
  return { pts, overshoot, settleMs: Math.round(settle * dt * 1000) };
}

/* ---------- Замер FPS ---------- */
export function useFps() {
  const [fps, setFps] = useState(60);
  useEffect(() => {
    let f = 0, last = performance.now(), raf = 0;
    const loop = (t: number) => {
      f++;
      if (t - last >= 500) { setFps(Math.round((f * 1000) / (t - last))); f = 0; last = t; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return fps;
}

export async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
}

/* ---------- Глобальное воспроизведение: пауза замораживает все сцены ----------
   Экономит батарею и даёт спокойно рассмотреть статичную композицию. */
let playing = true;
const playSubs = new Set<() => void>();
export function setPlaying(v: boolean) { playing = v; playSubs.forEach((f) => f()); }
export function usePlaying() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    playSubs.add(f);
    const vis = () => setPlaying(!document.hidden ? true : false);
    document.addEventListener("visibilitychange", vis);
    return () => { playSubs.delete(f); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return playing;
}

/* ---------- Разблокировка звука по первому жесту (политика браузеров) ---------- */
export function initAudioUnlock() {
  const un = () => {
    try { ctx().resume(); } catch {}
    removeEventListener("pointerdown", un);
    removeEventListener("keydown", un);
  };
  addEventListener("pointerdown", un, { once: true });
  addEventListener("keydown", un, { once: true });
}

/* ---------- Авто-режим доступности ---------- */
export function initReducedMotion() {
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const apply = () => {
    if (mq.matches) applyTune({ speed: 1.6, bounce: 0.35, weight: 0.8, stagger: 0.2, impact: 0, particles: 0.15 });
  };
  apply();
  mq.addEventListener?.("change", apply);
  return mq.matches;
}

/* ---------- Микро-стор: смена тюнинга ремонтирует живые демо ---------- */
let tuneVersion = 0;
const tuneSubs = new Set<() => void>();
export function commitTune(t: Partial<Tune>) {
  applyTune(t);
  tuneVersion++;
  tuneSubs.forEach((f) => f());
}
export function useTuneVersion() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((v) => v + 1);
    tuneSubs.add(f);
    return () => { tuneSubs.delete(f); };
  }, []);
  return tuneVersion;
}

export const E = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  io: [0.83, 0, 0.17, 1] as [number, number, number, number],
  back: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

export const cx = (...v: (string | false | null | undefined)[]) => v.filter(Boolean).join(" ");
export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");

/* ---------- Аудио-фидбек: синтез без ассетов ---------- */
let ac: AudioContext | null = null;
const ctx = () => (ac ||= new (window.AudioContext || (window as any).webkitAudioContext)());
export function sfx(kind: "tap" | "confirm" | "deny" | "reward" | "sweep" | "coin" = "tap") {
  if (!TUNE.sound) return;
  try {
    const c = ctx();
    const t = c.currentTime;
    const make = (f0: number, f1: number, dur: number, type: OscillatorType, g0: number, delay = 0) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t + delay);
      o.frequency.exponentialRampToValueAtTime(f1, t + delay + dur);
      g.gain.setValueAtTime(0.0001, t + delay);
      g.gain.exponentialRampToValueAtTime(g0, t + delay + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      o.connect(g).connect(c.destination);
      o.start(t + delay);
      o.stop(t + delay + dur + 0.02);
    };
    if (kind === "tap") make(520, 340, 0.05, "triangle", 0.03);
    if (kind === "confirm") { make(520, 660, 0.07, "triangle", 0.035); make(780, 990, 0.1, "sine", 0.03, 0.06); }
    if (kind === "deny") { make(200, 120, 0.16, "sawtooth", 0.028); }
    if (kind === "reward") [0, 0.07, 0.14, 0.23].forEach((d, i) => make(520 + i * 180, 900 + i * 220, 0.14, "triangle", 0.03, d));
    if (kind === "sweep") make(180, 900, 0.28, "sine", 0.02);
    if (kind === "coin") { make(1180, 1560, 0.05, "square", 0.018); make(1560, 1960, 0.07, "square", 0.014, 0.045); }
  } catch {}
}
export const buzz = (p: number | number[] = 10) => navigator.vibrate?.(p as any);
export const feel = (kind: Parameters<typeof sfx>[0] = "tap", v: number | number[] = 9) => { sfx(kind); buzz(v); };

/* ---------- Наблюдение за видимостью: анимации стартуют «в кадре» ---------- */
export function useInView<T extends HTMLElement>(threshold = 0.25, once = true) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
      if (e.isIntersecting && once) io.disconnect();
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

/* ---------- Сценарный плеер: экраны играют собственный «фильм» ---------- */
export function useTimeline(steps: number, stepMs: number | number[], active = true) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    let id: any;
    const run = (k: number) => {
      const d = Array.isArray(stepMs) ? stepMs[k % stepMs.length] : stepMs;
      id = setTimeout(() => {
        const n = (k + 1) % steps;
        setI(n);
        run(n);
      }, d);
    };
    run(i);
    return () => clearTimeout(id);
  }, [active, steps]);
  return [i, setI] as const;
}

export function useInterval(fn: () => void, ms: number | null) {
  const cb = useRef(fn);
  cb.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

/* ---------- Счётчик: значения «докручиваются» кадрами ---------- */
export function useCount(value: number, duration = 0.9) {
  const [d, setD] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration, ease: E.out, onUpdate: setD });
    prev.current = value;
    return () => c.stop();
  }, [value, duration]);
  return d;
}

/* ---------- Импакт: затухающая тряска контейнера ---------- */
export function useImpact() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const r = useMotionValue(0);
  const fire = useCallback((power = 10, time = 0.36) => {
    power *= TUNE.impact;
    if (power < 0.4) return;
    const t0 = performance.now();
    const loop = (t: number) => {
      const p = (t - t0) / (time * 1000);
      if (p >= 1) { x.set(0); y.set(0); r.set(0); return; }
      const d = (1 - p) ** 2 * power;
      x.set(rnd(-d, d)); y.set(rnd(-d, d)); r.set(rnd(-d, d) * 0.1);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }, []);
  return { x, y, r, fire };
}

/* ---------- Указатель страницы → параллакс сцены ---------- */
export function usePointer(stiffness = 90) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness, damping: 24 });
  const sy = useSpring(y, { stiffness, damping: 24 });
  useEffect(() => {
    const h = (e: PointerEvent) => {
      x.set((e.clientX / innerWidth) * 2 - 1);
      y.set((e.clientY / innerHeight) * 2 - 1);
    };
    addEventListener("pointermove", h, { passive: true });
    return () => removeEventListener("pointermove", h);
  }, []);
  return { x: sx, y: sy };
}
export const px = (mv: MotionValue<number>, k: number) => useTransform(mv, (v) => v * k);

/* ---------- 3D-наклон с бликом ---------- */
export function useTilt(max = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), S.soft);
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), S.soft);
  const gx = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const gy = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { animate(mx, 0, S.pop); animate(my, 0, S.pop); };
  return { ref, rx, ry, gx, gy, onMove, onLeave };
}

/* ---------- Canvas-частицы: искры, монеты, конфетти ---------- */
type P = { x: number; y: number; vx: number; vy: number; l: number; max: number; c: string; s: number; sq: boolean; rot: number; vr: number };
export function Particles({
  api,
  gravity = 0.22,
  className = "",
}: {
  api: React.MutableRefObject<((x: number, y: number, o?: { n?: number; power?: number; colors?: string[]; square?: boolean; spread?: number }) => void) | null>;
  gravity?: number;
  className?: string;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const ps = useRef<P[]>([]);
  useEffect(() => {
    const c = cv.current!;
    const g = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const size = () => {
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr; c.height = r.height * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    let raf = 0;
    let running = false;
    const loop = () => {
      const r = c.getBoundingClientRect();
      g.clearRect(0, 0, r.width, r.height);
      ps.current = ps.current.filter((p) => p.l < p.max);
      // idle-stop: пустой канвас не жжёт кадры (важно, когда на странице 6 телефонов)
      if (!ps.current.length) { running = false; return; }
      for (const p of ps.current) {
        p.l++; p.vy += gravity; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        const a = 1 - p.l / p.max;
        g.globalAlpha = a; g.fillStyle = p.c; g.shadowBlur = 10; g.shadowColor = p.c;
        if (p.sq) {
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
          g.fillRect(-p.s, -p.s * 0.5, p.s * 2, p.s);
          g.restore();
        } else { g.beginPath(); g.arc(p.x, p.y, p.s * a, 0, 7); g.fill(); }
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    api.current = (x, y, o = {}) => {
      const { n = 24, power = 8, colors = ["#3ec9a7", "#f2c14e", "#9d8cf5", "#eaf2ff"], square = false, spread = Math.PI * 2 } = o;
      const count = Math.round(n * TUNE.particles);
      for (let i = 0; i < count; i++) {
        const a = spread === Math.PI * 2 ? Math.random() * Math.PI * 2 : -Math.PI / 2 + rnd(-spread / 2, spread / 2);
        const sp = rnd(power * 0.25, power);
        ps.current.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - power * 0.3,
          l: 0, max: rnd(34, 78), c: colors[(Math.random() * colors.length) | 0],
          s: rnd(1.6, 4.2), sq: square, rot: rnd(0, 6), vr: rnd(-0.3, 0.3),
        });
      }
      kick();
    };
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={cv} className={cx("pointer-events-none absolute inset-0 h-full w-full", className)} style={{ zIndex: 30 }} />;
}
