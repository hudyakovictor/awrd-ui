import { useSyncExternalStore } from "react";

/* ——————————————————————————————————————————————
   Global accessibility & experience settings.
   Persisted in localStorage, applied as data-* attrs on <html>
   so every Tailwind token (var(--color-bull) etc.) reacts instantly.
   —————————————————————————————————————————————— */

export type ColorMode = "none" | "deut" | "trit" | "mono";
export type Settings = {
  cb: ColorMode;
  reduced: boolean;
  contrast: boolean;
  scale: number;
  haptics: boolean;
  bigTargets: boolean;
};

const KEY = "tl-settings-v1";
const DEFAULTS: Settings = { cb: "none", reduced: false, contrast: false, scale: 1, haptics: true, bigTargets: false };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    /* storage unavailable */
  }
  return { ...DEFAULTS };
}

let state: Settings = load();
const subs = new Set<() => void>();

function apply() {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.cb = state.cb;
  el.dataset.rm = state.reduced ? "1" : "0";
  el.dataset.hc = state.contrast ? "1" : "0";
  el.dataset.bt = state.bigTargets ? "1" : "0";
  el.style.fontSize = `${Math.round(state.scale * 100)}%`;
}
apply();

export const settings = {
  get: () => state,
  set(patch: Partial<Settings>) {
    state = { ...state, ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    apply();
    subs.forEach((f) => f());
  },
  reset() {
    settings.set({ ...DEFAULTS });
  },
  sub(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

export const useSettings = () => useSyncExternalStore(settings.sub, settings.get);

/** true if the user (OS or in-app) asked for less motion */
export function prefersLessMotion() {
  if (state.reduced) return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export const COLOR_MODES: { v: ColorMode; label: string; hint: string; bull: string; bear: string }[] = [
  { v: "none", label: "Стандарт", hint: "Зелёный рост · красное падение", bull: "#2BE38B", bear: "#FF4D6D" },
  { v: "deut", label: "Дейтеранопия", hint: "Синий рост · оранжевое падение", bull: "#3D9BFF", bear: "#FF8A3D" },
  { v: "trit", label: "Тританопия", hint: "Бирюзовый рост · розовое падение", bull: "#2BE3C8", bear: "#FF4D9A" },
  { v: "mono", label: "Монохром", hint: "Только яркость и формы", bull: "#E6ECF5", bear: "#6B7FAF" },
];

/** Resolve the currently active semantic colors (for canvas / SVG attributes that cannot read CSS vars). */
export function semantic() {
  const m = COLOR_MODES.find((c) => c.v === state.cb) ?? COLOR_MODES[0];
  return { bull: m.bull, bear: m.bear };
}
