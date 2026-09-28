export type Sfx = "tap" | "pop" | "success" | "error" | "coin" | "whoosh" | "tick" | "levelup" | "swipe" | "lock" | "unlock" | "spin" | "combo" | "open";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = true;
let hapticsOn = true;
let lastTick = 0;
const subs = new Set<() => void>();

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, opts: { type?: OscillatorType; vol?: number; when?: number; to?: number; attack?: number } = {}) {
  const a = ac();
  if (!a || !master) return;
  const { type = "sine", vol = 0.12, when = 0, to, attack = 0.005 } = opts;
  const t = a.currentTime + when;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur: number, vol = 0.08, when = 0, hp = 1200) {
  const a = ac();
  if (!a || !master) return;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = a.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(a.currentTime + when);
}

export const sfx = {
  play(s: Sfx) {
    if (!enabled) return;
    try {
      switch (s) {
        case "tap": tone(520, 0.07, { type: "triangle", vol: 0.07, to: 380 }); break;
        case "pop": tone(700, 0.09, { type: "sine", vol: 0.12, to: 1200 }); break;
        case "tick": {
          const now = performance.now();
          if (now - lastTick < 35) return;
          lastTick = now;
          tone(1500, 0.025, { type: "square", vol: 0.025 });
          break;
        }
        case "success":
          tone(660, 0.12, { type: "triangle", vol: 0.1 });
          tone(880, 0.14, { type: "triangle", vol: 0.1, when: 0.09 });
          tone(1320, 0.22, { type: "sine", vol: 0.08, when: 0.18 });
          break;
        case "error":
          tone(220, 0.18, { type: "sawtooth", vol: 0.06, to: 140 });
          tone(180, 0.2, { type: "square", vol: 0.03, when: 0.08, to: 110 });
          break;
        case "coin":
          tone(988, 0.07, { type: "square", vol: 0.04 });
          tone(1319, 0.16, { type: "square", vol: 0.04, when: 0.06 });
          break;
        case "whoosh": noise(0.22, 0.05, 0, 800); break;
        case "swipe": noise(0.14, 0.05, 0, 2200); tone(400, 0.12, { vol: 0.04, to: 900 }); break;
        case "lock": tone(300, 0.08, { type: "square", vol: 0.04 }); break;
        case "unlock": tone(500, 0.08, { type: "triangle", vol: 0.08 }); tone(1000, 0.12, { type: "triangle", vol: 0.08, when: 0.07 }); break;
        case "spin": tone(900, 0.03, { type: "square", vol: 0.03 }); break;
        case "open": noise(0.3, 0.06, 0, 400); tone(300, 0.4, { type: "triangle", vol: 0.08, to: 900 }); break;
        case "combo":
          [0, 1, 2].forEach((i) => tone(700 + i * 220, 0.1, { type: "triangle", vol: 0.08, when: i * 0.06 }));
          break;
        case "levelup":
          [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, { type: "triangle", vol: 0.09, when: i * 0.08 }));
          noise(0.5, 0.03, 0.35, 5000);
          break;
      }
    } catch {
      /* audio unavailable */
    }
  },
  get enabled() { return enabled; },
  get haptics() { return hapticsOn; },
  setEnabled(v: boolean) { enabled = v; subs.forEach((f) => f()); if (v) sfx.play("pop"); },
  setHaptics(v: boolean) { hapticsOn = v; subs.forEach((f) => f()); },
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};

export function haptic(p: number | number[] = 10) {
  if (!hapticsOn) return;
  try { navigator.vibrate?.(p); } catch { /* noop */ }
}

/** Convenience: sound + haptic in one call */
export function feel(s: Sfx, h: number | number[] = 8) {
  sfx.play(s);
  haptic(h);
}
