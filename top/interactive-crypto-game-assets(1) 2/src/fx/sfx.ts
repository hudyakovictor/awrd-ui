/* ------------------------------------------------------------------
 * TRADELINGO SFX + HAPTICS ENGINE
 * Tiny WebAudio synth — no audio files, zero latency, game-feel.
 * ------------------------------------------------------------------ */

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let muted = false;
const listeners = new Set<(m: boolean) => void>();

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur = 0.08, type: Wave = "sine", vol = 0.08, delay = 0, slideTo?: number) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delay;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(dur = 0.06, vol = 0.04) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  const g = a.createGain();
  g.gain.value = vol;
  src.buffer = buf;
  src.connect(g).connect(a.destination);
  src.start();
}

export function vibrate(pattern: number | number[] = 12) {
  if (muted) return;
  try { navigator.vibrate?.(pattern); } catch { /* noop */ }
}

export const sfx = {
  tap() { tone(520, 0.05, "triangle", 0.06); vibrate(8); },
  soft() { tone(380, 0.04, "sine", 0.04); },
  tick() { tone(1400, 0.018, "square", 0.018); },
  pop() { tone(300, 0.09, "sine", 0.09, 0, 900); vibrate(10); },
  whoosh() { noise(0.12, 0.03); tone(200, 0.14, "sine", 0.03, 0, 600); },
  swipe() { noise(0.08, 0.035); },
  success() {
    tone(523, 0.1, "triangle", 0.07);
    tone(659, 0.1, "triangle", 0.07, 0.08);
    tone(784, 0.18, "triangle", 0.08, 0.16);
    vibrate([10, 30, 16]);
  },
  error() { tone(220, 0.16, "sawtooth", 0.05, 0, 140); vibrate([30, 40, 30]); },
  coin() { tone(988, 0.06, "square", 0.04); tone(1319, 0.14, "square", 0.04, 0.06); vibrate(12); },
  levelUp() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, "triangle", 0.07, i * 0.07));
    vibrate([12, 20, 12, 20, 40]);
  },
  spin() { tone(600, 0.03, "square", 0.02); },
  drop() { tone(700, 0.18, "sine", 0.07, 0, 120); },
  long() { tone(440, 0.08, "triangle", 0.06); tone(660, 0.12, "triangle", 0.06, 0.06); vibrate(14); },
  short() { tone(440, 0.08, "triangle", 0.06); tone(294, 0.12, "triangle", 0.06, 0.06); vibrate(14); },
  scratch() { noise(0.03, 0.02); },
};

export function setMuted(m: boolean) {
  muted = m;
  listeners.forEach(l => l(m));
}
export function isMuted() { return muted; }
export function onMuteChange(fn: (m: boolean) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
