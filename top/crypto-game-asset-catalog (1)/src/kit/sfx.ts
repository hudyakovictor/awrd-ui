// Tiny procedural sound + haptics engine (no assets needed)
let ctx: AudioContext | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

export const isMuted = () => muted;
export const setMuted = (m: boolean) => {
  muted = m;
  listeners.forEach((l) => l(m));
};
export const onMute = (l: (m: boolean) => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

function ac() {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

function tone(freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.05, delay = 0, slideTo?: number) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  if (a.state === "suspended") {
    a.resume().catch(() => {});
    return;
  }
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

if (typeof window !== "undefined") {
  const unlock = () => {
    const a = ac();
    if (a && a.state === "suspended") a.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", unlock, { capture: true });
  window.addEventListener("keydown", unlock, { capture: true });
}

function buzz(ms: number | number[]) {
  if (muted) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* noop */
  }
}

/* ---------- game event bus: every correct / wrong / coin / big moment anywhere feeds the global game ---------- */
export type GameEvtType = "correct" | "wrong" | "coin" | "big";
const gameListeners = new Set<(t: GameEvtType) => void>();
export const onGame = (l: (t: GameEvtType) => void) => {
  gameListeners.add(l);
  return () => {
    gameListeners.delete(l);
  };
};
const emit = (t: GameEvtType) => gameListeners.forEach((l) => l(t));

export const sfxRaw = {
  sparkle: () => { [1318, 1568, 2093].forEach((f, i) => tone(f, 0.12, "triangle", 0.03, i * 0.05)); },
  thud: () => { tone(120, 0.18, "sine", 0.06, 0, 60); buzz(25); },
  swipe: () => tone(600, 0.12, "sine", 0.025, 0, 1400),
  pop: () => tone(880, 0.05, "triangle", 0.035, 0, 1320),
};

export const sfx = {
  tap: () => { tone(520, 0.05, "triangle", 0.04); buzz(8); },
  soft: () => tone(380, 0.04, "sine", 0.03),
  toggle: (on: boolean) => { tone(on ? 660 : 440, 0.06, "triangle", 0.04); buzz(10); },
  correct: () => { emit("correct"); tone(660, 0.09, "triangle", 0.05); tone(990, 0.16, "triangle", 0.05, 0.08); buzz([12, 40, 12]); },
  wrong: () => { emit("wrong"); tone(220, 0.18, "sawtooth", 0.035, 0, 140); buzz([30, 30, 30]); },
  coin: () => { emit("coin"); tone(1320, 0.06, "square", 0.025); tone(1760, 0.12, "square", 0.025, 0.06); },
  levelUp: () => { emit("big"); [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "triangle", 0.05, i * 0.09)); buzz([20, 50, 20, 50, 40]); },
  whoosh: () => tone(900, 0.18, "sine", 0.03, 0, 200),
  tick: () => tone(1500, 0.02, "square", 0.015),
  error: () => { tone(300, 0.1, "square", 0.03); tone(200, 0.14, "square", 0.03, 0.1); },
  open: () => { tone(300, 0.3, "sawtooth", 0.02, 0, 1200); tone(1600, 0.4, "triangle", 0.04, 0.25); buzz([40, 30, 80]); },
};
