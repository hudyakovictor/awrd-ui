import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { settings } from "./settings";

/* ———————— Sound (WebAudio, no assets) ———————— */
let ctx: AudioContext | null = null;
let soundOn = true;
const soundSubs = new Set<() => void>();

export const soundStore = {
  get: () => soundOn,
  set(v: boolean) { soundOn = v; soundSubs.forEach((f) => f()); },
  sub(f: () => void) { soundSubs.add(f); return () => { soundSubs.delete(f); }; },
};
export const useSound = () => useSyncExternalStore(soundStore.sub, soundStore.get);

export type Sfx = "tap" | "success" | "error" | "coin" | "levelup" | "whoosh" | "tick" | "hit" | "open";
export const SFX_LIST: { k: Sfx; d: string }[] = [
  { k: "tap", d: "Кнопка" }, { k: "tick", d: "Тик / выбор" }, { k: "success", d: "Верно" }, { k: "error", d: "Ошибка" },
  { k: "coin", d: "Монета" }, { k: "levelup", d: "Уровень" }, { k: "whoosh", d: "Переход" }, { k: "hit", d: "Удар" }, { k: "open", d: "Сундук" },
];

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.08, delay = 0, slideTo?: number) {
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export function sfx(kind: Sfx) {
  if (!soundOn) return;
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
  } catch { return; }
  switch (kind) {
    case "tap": tone(520, 0.06, "triangle", 0.05); break;
    case "tick": tone(1200, 0.025, "square", 0.02); break;
    case "success": tone(660, 0.1, "triangle", 0.07); tone(990, 0.16, "triangle", 0.07, 0.08); break;
    case "error": tone(220, 0.18, "sawtooth", 0.05, 0, 140); break;
    case "coin": tone(1320, 0.07, "square", 0.035); tone(1760, 0.14, "square", 0.035, 0.06); break;
    case "levelup": [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "triangle", 0.07, i * 0.08)); break;
    case "whoosh": tone(300, 0.2, "sine", 0.04, 0, 900); break;
    case "hit": tone(160, 0.12, "square", 0.06, 0, 60); break;
    case "open": tone(392, 0.1, "triangle", 0.06); tone(587, 0.1, "triangle", 0.06, 0.07); tone(880, 0.25, "triangle", 0.06, 0.14); break;
  }
}

export function haptic(pattern: number | number[] = 10) {
  if (!settings.get().haptics) return;
  try { navigator.vibrate?.(pattern); } catch { /* noop */ }
}

/** Named haptic vocabulary — same pattern language across the whole game */
export const HAPTICS: Record<string, { p: number[]; d: string }> = {
  selection: { p: [8], d: "Выбор варианта, тик слайдера" },
  impactLight: { p: [12], d: "Нажатие кнопки" },
  impactHeavy: { p: [30], d: "Удар по боссу, открытие сундука" },
  success: { p: [10, 40, 10], d: "Верный ответ" },
  warning: { p: [20, 60, 20], d: "Риск, низкая маржа" },
  error: { p: [40, 30, 40], d: "Ошибка, потеря жизни" },
  celebrate: { p: [10, 30, 10, 30, 60], d: "Level-up, победа" },
};

export function tap(kind: Sfx = "tap", h: number | number[] = 8) { sfx(kind); haptic(h); }

/* ———————— Global toast bus ———————— */
export type ToastKind = "success" | "info" | "warn" | "error";
export type ToastMsg = { id: number; text: string; kind: ToastKind };
let toasts: ToastMsg[] = [];
const toastSubs = new Set<() => void>();
let tid = 0;
export const toastStore = {
  get: () => toasts,
  sub(f: () => void) { toastSubs.add(f); return () => { toastSubs.delete(f); }; },
  push(text: string, kind: ToastKind = "success") {
    const id = ++tid;
    toasts = [...toasts, { id, text, kind }].slice(-4);
    toastSubs.forEach((f) => f());
    setTimeout(() => toastStore.remove(id), 2600);
  },
  remove(id: number) { toasts = toasts.filter((t) => t.id !== id); toastSubs.forEach((f) => f()); },
};
export const notify = toastStore.push;
export const useToasts = () => useSyncExternalStore(toastStore.sub, toastStore.get);

/* ———————— Hooks ———————— */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export function useCountUp(target: number, duration = 900) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setV(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, duration]);
  return v;
}

export const fmt = (n: number, d = 2) => n.toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const rand = (a: number, b: number) => a + Math.random() * (b - a);
