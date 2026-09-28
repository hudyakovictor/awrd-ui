/* Procedural menu music: dark, chill synth loop (bass + arp + hat + kick) on WebAudio.
   No samples — everything synthesized. Toggle-safe, low volume, non-intrusive. */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let timer: number | null = null;
let step = 0;
let nextT = 0;
let enabled = false;
let vol = 0.5;

const BPM = 84;
const SPB = 60 / BPM / 2; // 8th notes
// 4-bar loop: Am9 → Fmaj7 → Cmaj9 → G6
const CHORDS = [
  { root: 110.0, arp: [220.0, 261.63, 329.63, 440.0, 392.0] },   // A
  { root: 87.31, arp: [174.61, 220.0, 261.63, 349.23, 293.66] },  // F
  { root: 130.81, arp: [261.63, 329.63, 392.0, 523.25, 440.0] },  // C
  { root: 98.0, arp: [196.0, 246.94, 293.66, 392.0, 329.63] },    // G
];
const BASS_PAT = [1, 0, 1, 0, 1, 1, 0, 1]; // 8ths per bar
const ARP_PAT = [0, 2, 1, 3, 0, 3, 4, 2];
const HAT_PAT = [0, 0, 1, 0, 0, 1, 1, 0];
const KICK = [1, 0, 0, 0, 1, 0, 0, 0];

function ensure() {
  if (ctx) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = vol * 0.06;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
  const len = ctx.sampleRate * 0.3;
  noise = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
}
function osc(type: OscillatorType, f: number, t: number, dur: number, g: number, slideTo?: number) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const gn = ctx.createGain();
  const flt = ctx.createBiquadFilter();
  flt.type = "lowpass";
  flt.frequency.value = 2400;
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gn.gain.setValueAtTime(0.0001, t);
  gn.gain.exponentialRampToValueAtTime(g, t + 0.012);
  gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(flt).connect(gn).connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}
function hat(t: number, g: number) {
  if (!ctx || !master || !noise) return;
  const s = ctx.createBufferSource();
  s.buffer = noise;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass"; hp.frequency.value = 6000;
  const gn = ctx.createGain();
  gn.gain.setValueAtTime(g, t);
  gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(hp).connect(gn).connect(master);
  s.start(t); s.stop(t + 0.08);
}
function kick(t: number, g: number) {
  if (!ctx || !master) return;
  osc("sine", 130, t, 0.16, g, 42);
}
function schedStep(s: number, t: number) {
  const bar = Math.floor(s / 8) % 4;
  const inBar = s % 8;
  const c = CHORDS[bar];
  if (BASS_PAT[inBar]) osc("triangle", c.root / 2, t, SPB * 0.95, 0.9, c.root / 2);
  const tone = c.arp[ARP_PAT[inBar] % c.arp.length];
  osc("sine", tone, t, SPB * 0.9, 0.16);
  if (inBar % 2 === 0) osc("sine", tone * 2, t, SPB * 0.5, 0.045);
  if (HAT_PAT[inBar]) hat(t, 0.09);
  if (KICK[inBar]) kick(t, 0.5);
  if (s % 16 === 0) hat(t, 0.05);
}
function loopTick() {
  if (!ctx) return;
  while (nextT < ctx.currentTime + 0.12) {
    schedStep(step, nextT);
    step = (step + 1) % 32;
    nextT += SPB;
  }
}
export function isMusicOn() { return enabled; }
export function setMusicVolume(v: number) { vol = v; if (master && ctx) master.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.1); }
export function setMusicEnabled(on: boolean) {
  enabled = on;
  if (on) {
    try {
      ensure();
      ctx!.resume();
      step = 0;
      nextT = ctx!.currentTime + 0.06;
      if (timer == null) timer = window.setInterval(loopTick, 30);
    } catch { /* noop */ }
  } else if (timer != null) {
    clearInterval(timer); timer = null;
  }
}
export function toggleMusic() { setMusicEnabled(!enabled); return enabled; }

/* One-shot fanfare for big wins (independent of the loop) */
const FANFARE: [number, number][] = [[523.25, 0], [659.25, 0.09], [783.99, 0.18], [1046.5, 0.28], [783.99, 0.4], [1046.5, 0.47], [1318.5, 0.6]];
export function fanfare() {
  try {
    ensure();
    ctx!.resume();
    const t0 = ctx!.currentTime + 0.02;
    FANFARE.forEach(([f, d]) => {
      osc("triangle", f, t0 + d, 0.34, 0.5);
      osc("sine", f * 2, t0 + d, 0.3, 0.12);
    });
    // shimmer
    for (let i = 0; i < 10; i++) osc("sine", 1568 + Math.random() * 800, t0 + 0.6 + i * 0.03, 0.25, 0.05);
    if (noise && ctx && master) {
      const s = ctx.createBufferSource(); s.buffer = noise;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3000;
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(0.0001, t0 + 0.55);
      gn.gain.exponentialRampToValueAtTime(0.12, t0 + 0.7);
      gn.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
      s.connect(bp).connect(gn).connect(master);
      s.start(t0 + 0.55); s.stop(t0 + 1.3);
    }
  } catch { /* noop */ }
}
