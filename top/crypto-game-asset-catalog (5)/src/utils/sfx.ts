let ctx: AudioContext | null = null;
let enabled = true;

export const setSfxEnabled = (v: boolean) => { enabled = v; };
export const isSfxEnabled = () => enabled;

function tone(freq: number, dur = 0.08, type: OscillatorType = "sine", vol = 0.05, delay = 0, slideTo?: number) {
  if (!enabled || typeof window === "undefined") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctx = ctx || new AC();
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
    o.stop(t + dur + 0.03);
  } catch {
    /* noop */
  }
}

export const sfx = {
  tap: () => tone(440, 0.06, "triangle", 0.045),
  pop: () => tone(620, 0.1, "sine", 0.06, 0, 980),
  toggle: () => tone(760, 0.05, "square", 0.02),
  success: () => { tone(523, 0.1, "triangle", 0.05); tone(659, 0.1, "triangle", 0.05, 0.08); tone(784, 0.18, "triangle", 0.05, 0.16); },
  error: () => { tone(230, 0.14, "sawtooth", 0.028); tone(170, 0.2, "sawtooth", 0.028, 0.1); },
  coin: () => { tone(988, 0.07, "square", 0.022); tone(1319, 0.14, "square", 0.022, 0.06); },
  whoosh: () => tone(280, 0.18, "sine", 0.03, 0, 900),
  tick: () => tone(1200, 0.03, "square", 0.015),
  levelUp: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, "triangle", 0.05, i * 0.085)); },
  none: () => {},
};
export type SfxName = keyof typeof sfx;

export const haptic = (ms: number | number[] = 10) => {
  try { navigator.vibrate?.(ms); } catch { /* noop */ }
};
