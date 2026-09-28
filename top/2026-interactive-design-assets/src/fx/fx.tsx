import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { track } from "./stats";

export type Intensity = "low" | "normal" | "high";
export const INTENSITY_K: Record<Intensity, number> = { low: 0.4, normal: 1, high: 1.7 };

const SUCCESS_SFX = new Set(["win", "fanfare", "levelup"]);
const ERROR_SFX = new Set(["lose", "error"]);
const LOCK_SFX = new Set(["lock", "stamp"]);
const REVEAL_SFX = new Set(["reveal"]);

export type Sfx =
  | "tick" | "lock" | "win" | "lose" | "whoosh" | "coin" | "pop" | "glitch"
  | "hover" | "open" | "close" | "levelup" | "fanfare" | "click" | "error"
  | "swipe" | "drop" | "charge" | "reveal" | "stamp" | "spin";

export interface FxState {
  speed: number;
  setSpeed: (n: number) => void;
  sound: boolean;
  setSound: (b: boolean) => void;
  haptics: boolean;
  setHaptics: (b: boolean) => void;
  reduced: boolean;
  setReduced: (b: boolean) => void;
  intensity: Intensity;
  setIntensity: (i: Intensity) => void;
  /** effect multiplier derived from intensity (particles, shake, flash) */
  k: number;
  sfx: (s: Sfx) => void;
  haptic: (p: number | number[]) => void;
  /** animation duration in seconds, respects speed + reduced motion */
  t: (sec: number) => number;
  /** sequence timer in ms, respects speed */
  ms: (n: number) => number;
}

export const FxCtx = createContext<FxState | null>(null);
const Ctx = FxCtx;

type Tone = [number, number, number, OscillatorType, number, number?]; // f1 f2 dur wave vol delay?

const TONES: Record<Sfx, Tone[]> = {
  tick: [[1500, 1200, 0.035, "square", 0.022]],
  hover: [[2200, 2600, 0.04, "sine", 0.015]],
  click: [[700, 500, 0.06, "triangle", 0.06]],
  pop: [[520, 260, 0.08, "sine", 0.1], [1040, 520, 0.06, "sine", 0.04]],
  lock: [[180, 90, 0.22, "sawtooth", 0.07], [90, 55, 0.3, "square", 0.05, 0.06]],
  coin: [[990, 990, 0.07, "square", 0.045], [1480, 1480, 0.16, "square", 0.045, 0.07]],
  win: [[520, 520, 0.1, "triangle", 0.09], [660, 660, 0.1, "triangle", 0.09, 0.09], [880, 1320, 0.28, "triangle", 0.1, 0.18]],
  fanfare: [[392, 392, 0.11, "square", 0.05], [523, 523, 0.11, "square", 0.05, 0.1], [659, 659, 0.11, "square", 0.05, 0.2], [784, 1568, 0.42, "triangle", 0.09, 0.3]],
  levelup: [[440, 880, 0.14, "sawtooth", 0.05], [660, 1320, 0.2, "triangle", 0.07, 0.1]],
  lose: [[260, 70, 0.38, "sawtooth", 0.06], [130, 55, 0.44, "triangle", 0.05, 0.05]],
  error: [[320, 180, 0.14, "square", 0.06], [180, 120, 0.18, "square", 0.06, 0.12]],
  whoosh: [[180, 900, 0.22, "sine", 0.05], [300, 1400, 0.18, "triangle", 0.03, 0.03]],
  swipe: [[400, 1100, 0.12, "sine", 0.04]],
  glitch: [[90, 1800, 0.18, "square", 0.05], [1400, 120, 0.14, "sawtooth", 0.04, 0.08]],
  open: [[300, 700, 0.16, "triangle", 0.06], [600, 1200, 0.14, "sine", 0.04, 0.06]],
  close: [[700, 280, 0.14, "triangle", 0.05]],
  drop: [[240, 120, 0.12, "sine", 0.08], [120, 60, 0.16, "triangle", 0.05, 0.04]],
  charge: [[120, 900, 0.5, "sawtooth", 0.04]],
  reveal: [[200, 1600, 0.34, "triangle", 0.07], [1600, 2400, 0.2, "sine", 0.04, 0.28]],
  stamp: [[150, 60, 0.16, "square", 0.1], [2500, 1800, 0.03, "square", 0.03, 0.01]],
  spin: [[500, 900, 0.09, "triangle", 0.035], [700, 1300, 0.09, "triangle", 0.035, 0.07]],
};

export function FxProvider({ children }: { children: ReactNode }) {
  const [speed, setSpeed] = useState(1);
  const [sound, setSound] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [intensity, setIntensity] = useState<Intensity>("normal");
  const ac = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);

  const sfx = useCallback(
    (s: Sfx) => {
      // Count every sound request, even when muted — the console tests the block, not the speakers.
      track("sound", 1, `sound · ${s}`);
      if (SUCCESS_SFX.has(s)) track("success", 1, `success · ${s}`);
      if (ERROR_SFX.has(s)) track("error", 1, `error · ${s}`);
      if (LOCK_SFX.has(s)) track("lock", 1, `lock · ${s}`);
      if (REVEAL_SFX.has(s)) track("reveal", 1, "reveal");
      if (!sound) return;
      try {
        if (!ac.current) {
          ac.current = new AudioContext();
          master.current = ac.current.createGain();
          master.current.gain.value = 0.9;
          // gentle echo bus for space
          const delay = ac.current.createDelay(0.5);
          delay.delayTime.value = 0.16;
          const fb = ac.current.createGain();
          fb.gain.value = 0.22;
          const wet = ac.current.createGain();
          wet.gain.value = 0.18;
          master.current.connect(ac.current.destination);
          master.current.connect(delay);
          delay.connect(fb);
          fb.connect(delay);
          delay.connect(wet);
          wet.connect(ac.current.destination);
        }
        const a = ac.current;
        if (a.state === "suspended") void a.resume();
        const out = master.current ?? a.destination;
        for (const [f1, f2, dur, type, vol, delay = 0] of TONES[s]) {
          const t0 = a.currentTime + delay;
          const o = a.createOscillator();
          const g = a.createGain();
          o.type = type;
          o.frequency.setValueAtTime(Math.max(20, f1), t0);
          o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t0 + dur);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
          o.connect(g);
          g.connect(out);
          o.start(t0);
          o.stop(t0 + dur + 0.03);
        }
      } catch {
        /* audio unavailable */
      }
    },
    [sound]
  );

  const haptic = useCallback(
    (p: number | number[]) => {
      track("haptic", 1, `haptic · ${Array.isArray(p) ? `[${p.join(",")}]` : `${p}ms`}`);
      if (!haptics) return;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p);
    },
    [haptics]
  );

  const t = useCallback((sec: number) => (reduced ? 0 : sec / speed), [reduced, speed]);
  const ms = useCallback((n: number) => n / speed, [speed]);

  const k = INTENSITY_K[intensity];
  const value = useMemo(
    () => ({ speed, setSpeed, sound, setSound, haptics, setHaptics, reduced, setReduced, intensity, setIntensity, k, sfx, haptic, t, ms }),
    [speed, sound, haptics, reduced, intensity, k, sfx, haptic, t, ms]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFx() {
  const c = useContext(Ctx);
  if (!c) throw new Error("FxProvider missing");
  return c;
}
