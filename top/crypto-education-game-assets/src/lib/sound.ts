import { useEffect, useState } from "react";

/**
 * Procedural sound engine (WebAudio) — no audio assets required.
 * Every UI interaction in the catalog routes through `sfx()`.
 */
export type SfxName =
  | "tap"
  | "select"
  | "pop"
  | "success"
  | "error"
  | "coin"
  | "gem"
  | "whoosh"
  | "swipe"
  | "levelup"
  | "tick"
  | "flip"
  | "unlock"
  | "hit"
  | "combo"
  | "lose"
  | "countdown"
  | "go"
  | "charge"
  | "open";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = (() => {
  try {
    return localStorage.getItem("tl-sound") !== "off";
  } catch {
    return true;
  }
})();
const subs = new Set<(v: boolean) => void>();

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.45;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

type ToneOpts = {
  f: number;
  to?: number;
  type?: OscillatorType;
  d?: number;
  v?: number;
  at?: number;
  a?: number;
};

function tone({ f, to, type = "sine", d = 0.12, v = 0.2, at = 0, a = 0.006 }: ToneOpts) {
  const c = audio();
  if (!c || !master) return;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + d);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(g);
  g.connect(master);
  o.start(t0);
  o.stop(t0 + d + 0.03);
}

function noise({
  d = 0.2,
  v = 0.15,
  at = 0,
  f = 1200,
  q = 0.8,
  sweep,
}: {
  d?: number;
  v?: number;
  at?: number;
  f?: number;
  q?: number;
  sweep?: number;
}) {
  const c = audio();
  if (!c || !master) return;
  const len = Math.max(1, Math.floor(c.sampleRate * d));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = f;
  bp.Q.value = q;
  const t0 = c.currentTime + at;
  if (sweep) {
    bp.frequency.setValueAtTime(f, t0);
    bp.frequency.exponentialRampToValueAtTime(sweep, t0 + d);
  }
  const g = c.createGain();
  g.gain.value = v;
  src.connect(bp);
  bp.connect(g);
  g.connect(master);
  src.start(t0);
}

let lastTick = 0;
let lastCoin = 0;

export function sfx(name: SfxName, pitchIn = 1) {
  if (!enabled) return;
  const pitch = Math.min(3, Math.max(0.25, Number.isFinite(pitchIn) ? pitchIn : 1));
  try {
    switch (name) {
      case "tap":
        tone({ f: 520 * pitch, to: 380 * pitch, type: "triangle", d: 0.06, v: 0.1 });
        break;
      case "select":
        tone({ f: 660 * pitch, type: "triangle", d: 0.07, v: 0.11 });
        break;
      case "pop":
        tone({ f: 320 * pitch, to: 920 * pitch, type: "sine", d: 0.09, v: 0.16 });
        break;
      case "success":
        [523.25, 659.25, 783.99].forEach((f, i) => tone({ f: f * pitch, type: "triangle", d: 0.2, v: 0.14, at: i * 0.075 }));
        break;
      case "error":
        tone({ f: 220, to: 140, type: "square", d: 0.2, v: 0.06 });
        tone({ f: 180, to: 110, type: "sawtooth", d: 0.24, v: 0.04, at: 0.05 });
        break;
      case "coin": {
        const now = performance.now();
        if (now - lastCoin < 40) return;
        lastCoin = now;
        tone({ f: 988 * pitch, type: "square", d: 0.05, v: 0.05 });
        tone({ f: 1319 * pitch, type: "square", d: 0.16, v: 0.05, at: 0.05 });
        break;
      }
      case "gem":
        tone({ f: 1568 * pitch, to: 2093 * pitch, type: "sine", d: 0.14, v: 0.09 });
        tone({ f: 2637 * pitch, type: "sine", d: 0.2, v: 0.05, at: 0.05 });
        break;
      case "whoosh":
        noise({ d: 0.3, v: 0.22, f: 500, q: 0.6, sweep: 3200 });
        break;
      case "swipe":
        noise({ d: 0.18, v: 0.18, f: 1800, q: 1.2, sweep: 500 });
        break;
      case "levelup":
        [392, 523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ f, type: "triangle", d: 0.26, v: 0.13, at: i * 0.085 }));
        tone({ f: 1567.98, type: "sine", d: 0.6, v: 0.08, at: 0.45 });
        break;
      case "tick": {
        const now = performance.now();
        if (now - lastTick < 30) return;
        lastTick = now;
        tone({ f: 1800 * pitch, type: "square", d: 0.018, v: 0.035 });
        break;
      }
      case "flip":
        noise({ d: 0.07, v: 0.18, f: 2600, q: 1.4 });
        break;
      case "unlock":
        tone({ f: 440, to: 880, type: "triangle", d: 0.2, v: 0.13 });
        tone({ f: 1320, type: "sine", d: 0.32, v: 0.07, at: 0.14 });
        break;
      case "hit":
        noise({ d: 0.12, v: 0.32, f: 420, q: 0.7 });
        tone({ f: 170, to: 55, type: "sine", d: 0.2, v: 0.28 });
        break;
      case "combo":
        [880, 1108.73, 1318.51].forEach((f, i) => tone({ f: f * pitch, type: "square", d: 0.08, v: 0.05, at: i * 0.045 }));
        break;
      case "lose":
        [392, 349.23, 311.13, 261.63].forEach((f, i) => tone({ f, type: "triangle", d: 0.3, v: 0.11, at: i * 0.16 }));
        break;
      case "countdown":
        tone({ f: 660, type: "sine", d: 0.13, v: 0.14 });
        break;
      case "go":
        tone({ f: 1320, type: "sine", d: 0.32, v: 0.15 });
        tone({ f: 1760, type: "triangle", d: 0.25, v: 0.06, at: 0.04 });
        break;
      case "charge":
        tone({ f: 200 * pitch, to: 600 * pitch, type: "sawtooth", d: 0.18, v: 0.04 });
        break;
      case "open":
        noise({ d: 0.4, v: 0.2, f: 300, q: 0.5, sweep: 2400 });
        [659.25, 830.61, 987.77, 1318.51].forEach((f, i) => tone({ f, type: "triangle", d: 0.3, v: 0.1, at: 0.1 + i * 0.07 }));
        break;
    }
  } catch {
    /* audio unavailable */
  }
}

export const soundState = {
  get: () => enabled,
  set(v: boolean) {
    enabled = v;
    try {
      localStorage.setItem("tl-sound", v ? "on" : "off");
    } catch {
      /* noop */
    }
    subs.forEach((s) => s(v));
    if (v) sfx("pop");
  },
  subscribe(fn: (v: boolean) => void) {
    subs.add(fn);
    return () => {
      subs.delete(fn);
    };
  },
};

export function useSoundEnabled() {
  const [v, setV] = useState(soundState.get());
  useEffect(() => soundState.subscribe(setV), []);
  return [v, soundState.set] as const;
}

export function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !enabled) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.95;
    u.pitch = 1.05;
    synth.speak(u);
  } catch {
    /* noop */
  }
}
