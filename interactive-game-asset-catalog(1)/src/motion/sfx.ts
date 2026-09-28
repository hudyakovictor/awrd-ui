import { useSyncExternalStore } from "react";

// ============================================================
//  SFX ENGINE — процедурный звук на WebAudio. Ноль файлов.
//  Секрет AAA: звук — половина ощущения удара. Анимация без
//  звука воспринимается на ~30% «слабее» (плейтесты Supercell).
// ============================================================

type Listener = () => void;
const listeners = new Set<Listener>();

let muted = (() => {
  try {
    return localStorage.getItem("sa-sound") !== "on";
  } catch {
    return true;
  }
})();

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function ac(): AudioContext | null {
  if (muted || typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.32;
    // компрессор склеивает слои и защищает от клиппинга при залпах
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    master.connect(comp);
    comp.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const sound = {
  get muted() {
    return muted;
  },
  toggle() {
    muted = !muted;
    try {
      localStorage.setItem("sa-sound", muted ? "off" : "on");
    } catch {
      /* noop */
    }
    if (!muted) {
      ac();
      sfx.chime();
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useMuted() {
  return useSyncExternalStore(sound.subscribe, () => muted, () => true);
}

interface ToneOpts {
  f: number;
  f2?: number;
  d?: number;
  type?: OscillatorType;
  g?: number;
  delay?: number;
  a?: number;
  pan?: number;
}

function tone({ f, f2, d = 0.15, type = "sine", g = 0.5, delay = 0, a = 0.004, pan = 0 }: ToneOpts) {
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const v = c.createGain();
  const p = c.createStereoPanner();
  p.pan.value = pan;
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + d);
  v.gain.setValueAtTime(0.0001, t);
  v.gain.exponentialRampToValueAtTime(g, t + a);
  v.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(v);
  v.connect(p);
  p.connect(master);
  o.start(t);
  o.stop(t + d + 0.05);
}

interface NoiseOpts {
  d?: number;
  g?: number;
  f?: number;
  f2?: number;
  q?: number;
  type?: BiquadFilterType;
  delay?: number;
  a?: number;
}

function noise({ d = 0.2, g = 0.4, f = 1200, f2, q = 1, type = "bandpass", delay = 0, a = 0.005 }: NoiseOpts) {
  const c = ac();
  if (!c || !master) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  const fl = c.createBiquadFilter();
  fl.type = type;
  fl.frequency.setValueAtTime(f, t);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  fl.Q.value = q;
  const v = c.createGain();
  v.gain.setValueAtTime(0.0001, t);
  v.gain.exponentialRampToValueAtTime(g, t + a);
  v.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(fl);
  fl.connect(v);
  v.connect(master);
  s.start(t, Math.random() * 0.5);
  s.stop(t + d + 0.05);
}

export function haptic(p: number | number[]) {
  if (muted) return;
  try {
    navigator.vibrate?.(p);
  } catch {
    /* noop */
  }
}

const semi = (base: number, s: number) => base * Math.pow(2, s / 12);

export const sfx = {
  /** Тактильный «клик» — короткий треугольник вниз */
  tap: () => {
    tone({ f: 620, f2: 380, d: 0.06, type: "triangle", g: 0.28 });
    haptic(8);
  },
  /** Мягкий pop — появление элемента */
  pop: (pitch = 0) => tone({ f: semi(340, pitch), f2: semi(900, pitch), d: 0.09, type: "sine", g: 0.35 }),
  /** Взмах — фильтр шума вверх */
  whoosh: (len = 0.35) => noise({ d: len, f: 350, f2: 3200, q: 0.9, g: 0.32, a: len * 0.4 }),
  /** Обратный взмах — втягивание */
  suck: () => noise({ d: 0.3, f: 3200, f2: 300, q: 1.2, g: 0.28, a: 0.2 }),
  /** Удар: сабвуфер + щелчок + шум */
  hit: (heavy = false) => {
    tone({ f: heavy ? 110 : 160, f2: 38, d: heavy ? 0.4 : 0.25, type: "sine", g: 0.95 });
    tone({ f: 1400, f2: 200, d: 0.04, type: "square", g: 0.18 });
    noise({ d: 0.22, f: 2600, f2: 250, type: "lowpass", g: 0.55 });
    haptic(heavy ? [30, 20, 45] : 22);
  },
  /** Крит: удар + звон */
  crit: () => {
    sfx.hit(true);
    [0, 7, 12].forEach((s, i) => tone({ f: semi(880, s), d: 0.5, type: "triangle", g: 0.14, delay: 0.05 + i * 0.03 }));
  },
  /** Взрыв/импакт кинематографичный */
  impact: () => {
    tone({ f: 70, f2: 28, d: 0.9, type: "sine", g: 1 });
    noise({ d: 0.8, f: 1800, f2: 120, type: "lowpass", g: 0.7 });
    noise({ d: 0.12, f: 5000, type: "highpass", g: 0.3 });
    haptic([50, 30, 60]);
  },
  coin: (i = 0) => {
    const b = 1250 + (i % 6) * 70;
    tone({ f: b, d: 0.07, type: "square", g: 0.08 });
    tone({ f: b * 1.5, d: 0.2, type: "square", g: 0.07, delay: 0.05 });
  },
  chime: () => [0, 4, 7, 12].forEach((s, i) => tone({ f: semi(523, s), d: 0.55, type: "triangle", g: 0.2, delay: i * 0.06 })),
  success: () => {
    [0, 4, 7].forEach((s) => tone({ f: semi(392, s), d: 0.6, type: "triangle", g: 0.18 }));
    tone({ f: semi(784, 0), d: 0.8, type: "sine", g: 0.12, delay: 0.12 });
  },
  levelup: () => {
    [0, 2, 4, 5, 7, 9, 11, 12, 16, 19, 24].forEach((s, i) => tone({ f: semi(392, s), d: 0.25, type: "square", g: 0.07, delay: i * 0.045 }));
    noise({ d: 1.2, f: 6000, type: "highpass", g: 0.08, delay: 0.4, a: 0.3 });
    haptic([20, 40, 20, 40, 60]);
  },
  error: () => {
    tone({ f: 233, f2: 150, d: 0.28, type: "sawtooth", g: 0.16 });
    tone({ f: 220, f2: 140, d: 0.32, type: "square", g: 0.1, delay: 0.1 });
    haptic([40, 50, 40]);
  },
  tick: () => tone({ f: 2200, d: 0.018, type: "square", g: 0.05 }),
  heartbeat: (k = 1) => {
    tone({ f: 62, f2: 40, d: 0.14, g: 0.9 * k });
    tone({ f: 56, f2: 38, d: 0.14, g: 0.6 * k, delay: 0.19 });
    haptic([25, 150, 18]);
  },
  glitch: () => {
    for (let i = 0; i < 7; i++) tone({ f: 180 + Math.random() * 2200, d: 0.03, type: "square", g: 0.07, delay: i * 0.03 });
    noise({ d: 0.2, f: 3000, q: 8, g: 0.2 });
  },
  alarm: () => {
    for (let i = 0; i < 3; i++) {
      tone({ f: 740, f2: 980, d: 0.18, type: "sawtooth", g: 0.08, delay: i * 0.36 });
      tone({ f: 980, f2: 740, d: 0.18, type: "sawtooth", g: 0.08, delay: i * 0.36 + 0.18 });
    }
  },
  open: () => {
    noise({ d: 0.6, f: 200, f2: 5000, q: 0.6, g: 0.3, a: 0.4 });
    [0, 4, 7, 11, 14].forEach((s, i) => tone({ f: semi(523, s), d: 0.9, type: "triangle", g: 0.12, delay: 0.35 + i * 0.05 }));
  },
  stamp: () => {
    tone({ f: 140, f2: 60, d: 0.18, type: "sine", g: 0.8 });
    noise({ d: 0.08, f: 900, type: "lowpass", g: 0.5 });
    haptic(30);
  },
  swipe: (dir = 1) => noise({ d: 0.18, f: dir > 0 ? 900 : 2600, f2: dir > 0 ? 2600 : 900, q: 1.5, g: 0.25 }),
  snap: () => {
    tone({ f: 880, f2: 1320, d: 0.06, type: "triangle", g: 0.2 });
    tone({ f: 220, f2: 120, d: 0.1, type: "sine", g: 0.5 });
    haptic(15);
  },
  breathIn: () => noise({ d: 1.8, f: 400, f2: 1400, q: 0.5, g: 0.06, a: 1.2 }),
  breathOut: () => noise({ d: 1.8, f: 1400, f2: 300, q: 0.5, g: 0.06, a: 0.3 }),
  shatter: () => {
    for (let i = 0; i < 12; i++) tone({ f: 2000 + Math.random() * 4000, d: 0.08 + Math.random() * 0.2, type: "triangle", g: 0.05, delay: Math.random() * 0.35 });
    noise({ d: 0.6, f: 4000, type: "highpass", g: 0.25 });
    sfx.impact();
  },
  spinTick: (i: number) => tone({ f: 1600 + (i % 2) * 200, d: 0.015, type: "square", g: 0.05 }),
  combo: (n: number) => tone({ f: semi(440, Math.min(n, 12) * 2), f2: semi(660, Math.min(n, 12) * 2), d: 0.12, type: "square", g: 0.08 }),
  fever: () => {
    [0, 3, 7, 10, 12, 15, 19, 24].forEach((s, i) => tone({ f: semi(330, s), d: 0.18, type: "sawtooth", g: 0.06, delay: i * 0.03 }));
    haptic([20, 20, 20, 20, 80]);
  },
  lose: () => {
    [0, -3, -7, -12].forEach((s, i) => tone({ f: semi(330, s), f2: semi(300, s), d: 0.45, type: "triangle", g: 0.15, delay: i * 0.2 }));
    tone({ f: 60, f2: 30, d: 1.2, g: 0.6, delay: 0.7 });
  },
  vs: () => {
    sfx.impact();
    [0, 12].forEach((s, i) => tone({ f: semi(110, s), d: 0.8, type: "sawtooth", g: 0.1, delay: i * 0.02 }));
  },
  island: () => tone({ f: 520, f2: 780, d: 0.12, type: "sine", g: 0.2 }),
};
