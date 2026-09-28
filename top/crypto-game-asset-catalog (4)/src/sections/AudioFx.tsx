import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Label, Section, useCountUp } from "../ui/kit";
import { useRaf } from "../ui/hooks";
import { getAnalyser, note, noteName, noiseBurst, sfx } from "../game/sfx";
import { cn } from "../utils/cn";

/* ───── canvas runner ───── */
function useCanvas(cb: (ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, t: number) => void, active = true) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, last = performance.now(), w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { const r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const loop = (t: number) => { const dt = Math.min(50, t - last); last = t; ctx.clearRect(0, 0, w, h); cbRef.current(ctx, w, h, dt, t); raf = requestAnimationFrame(loop); };
    if (active) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active]);
  return ref;
}

/* ═════════ SND-01 · Live visualizer ═════════ */
function Visualizer() {
  const [boost, setBoost] = useState(0);
  const boostRef = useRef(0);
  const cv = useCanvas((ctx, w, h, _dt, t) => {
    boostRef.current = Math.max(0, boostRef.current - 0.01);
    const an = getAnalyser();
    const data = an ? new Uint8Array(an.frequencyBinCount) : null;
    if (an && data) an.getByteFrequencyData(data);
    const bars = 26;
    const bw = w / bars;
    for (let i = 0; i < bars; i++) {
      let v: number;
      if (data) v = (data[Math.floor((i / bars) * data.length * 0.7)] / 255) * (1 + boostRef.current * 2);
      else v = 0;
      const idle = 0.08 + 0.06 * Math.sin(t * 0.002 + i * 0.5);
      const bh = Math.max(idle * h, Math.min(h, v * h));
      const hue = 160 + (i / bars) * 140;
      ctx.fillStyle = `hsl(${hue} 85% 60%)`;
      ctx.globalAlpha = 0.9;
      const x = i * bw + 2;
      ctx.beginPath();
      ctx.roundRect(x, (h - bh) / 2, bw - 4, bh, 3);
      ctx.fill();
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.roundRect(x, h / 2, bw - 4, bh, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  useEffect(() => {
    const id = window.setInterval(() => {
      const i = Math.floor(Math.random() * 5);
      const f = [523, 659, 784, 1046, 1318][i];
      note(f, 0.25, "triangle", 0.1);
      if (Math.random() > 0.6) noiseBurst(0.05, 0.04, 0, 5000);
      setBoost(1);
    }, 700);
    return () => clearInterval(id);
  }, []);
  return (
    <AssetCard id="SND-01" title="Live Spectrum Visualizer" desc="FFT-анализатор слушает мастер-шины каталога: любое нажатие на любой кнопке отражается в спектре. Плюс авто-арпеджио для демонстрации." tags={["audio", "visualizer", "fft", "realtime"]}>
      <canvas ref={cv} className="h-44 w-full rounded-2xl bg-ink-950/70" />
      <div className="mt-2 flex justify-between text-[11px] font-bold text-ink-400"><span>master bus · 26 bands</span><span>tap anything in the catalog →</span></div>
    </AssetCard>
  );
}

/* ═════════ SND-02 · Synth pads ═════════ */

const KEYS = [
  { n: "C", f: 261.63 }, { n: "D", f: 293.66 }, { n: "E", f: 329.63 }, { n: "F", f: 349.23 }, { n: "G", f: 392 }, { n: "A", f: 440 }, { n: "B", f: 493.88 }, { n: "C5", f: 523.25 },
];
function SynthPads() {
  const [active, setActive] = useState<string | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const hit = (k: (typeof KEYS)[number]) => {
    setActive(k.n);
    setLast(k.n);
    setNotes((n) => [...n.slice(-7), k.n]);
    note(k.f, 0.5, "triangle", 0.16);
    note(k.f * 2, 0.3, "sine", 0.05);
    window.setTimeout(() => setActive((a) => (a === k.n ? null : a)), 220);
  };
  const arp = () => { [0, 2, 4, 6, 7, 4, 2, 0].forEach((i, k) => window.setTimeout(() => { note(KEYS[i].f, 0.28, "triangle", 0.12); setActive(KEYS[i].n); }, k * 130)); feel("combo"); };
  return (
    <AssetCard id="SND-02" title="Synth Piano Pads" desc="8 клавиш, синт на WebAudio: основной тон + октава. Нажатия подсвечиваются, хвост нот рисуется лентой, есть авто-арпеджио." tags={["audio", "synth", "piano", "webaudio"]}>
      <div className="flex gap-1.5">
        {KEYS.map((k, i) => (
          <button key={k.n} onPointerDown={() => hit(k)}
            className={cn("relative h-32 flex-1 select-none rounded-xl border-b-4 transition-all duration-75", active === k.n ? "translate-y-1 border-ink-900 bg-gradient-to-b from-ink-500 to-ink-700" : "border-ink-900 bg-gradient-to-b from-ink-700 to-ink-800 hover:from-ink-600")}
            style={{ animation: last === k.n ? "jelly .4s ease" : undefined }}>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[11px] font-extrabold" style={{ color: active === k.n ? "#5ce1ff" : "#8fa0cf" }}>{k.n}</span>
            <span className="absolute bottom-0.5 right-1 font-mono text-[8px] text-ink-500">{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">{notes.map((n, i) => <span key={i} className="anim-pop rounded bg-ink-800 px-1.5 font-mono text-[10px] font-bold text-sky">{n}</span>)}</div>
        <Btn v="gold" size="sm" onClick={arp}><Icon name="sparkles" size={14} />Arpeggio</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ SND-03 · Step sequencer ═════════ */
const ROWS = [
  { t: "Kick", fn: () => { note(130, 0.22, "sine", 0.3); note(60, 0.18, "sine", 0.2); } },
  { t: "Snare", fn: () => { noiseBurst(0.14, 0.2, 0, 1600); note(220, 0.08, "triangle", 0.08); } },
  { t: "Hat", fn: () => noiseBurst(0.045, 0.12, 0, 6500) },
  { t: "Coin", fn: () => { note(988, 0.06, "square", 0.05); note(1319, 0.12, "square", 0.05, 0.06); } },
];
function Sequencer() {
  const [pat, setPat] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, true],
    [false, false, false, false, true, false, false, false, false, false, true, false, false, false, true, false],
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, true],
    [false, false, false, true, false, false, false, false, false, false, false, false, false, false, true, false],
  ]);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [bpm, setBpm] = useState(112);
  const stepRef = useRef(0);
  useEffect(() => {
    if (!playing) { setStep(-1); return; }
    const id = window.setInterval(() => {
      const s = stepRef.current;
      setStep(s);
      ROWS.forEach((r, ri) => { if (pat[ri][s]) r.fn(); });
      stepRef.current = (s + 1) % 16;
    }, 60000 / bpm / 4);
    return () => clearInterval(id);
  }, [playing, bpm, pat]);
  const toggle = (r: number, c: number) => { setPat((p) => p.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? !v : v)))); if (!pat[r][c]) sfx.play("tick"); };
  const clear = () => { setPat(pat.map(() => Array(16).fill(false))); feel("lock"); };
  const demo = () => setPat([
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, true],
    [false, false, false, false, true, false, false, false, false, false, true, false, false, false, true, false],
    [true, false, true, false, true, false, true, true, true, false, true, false, true, false, true, true],
    [false, false, false, true, false, false, false, false, false, false, false, false, false, false, true, false],
  ]);
  return (
    <AssetCard id="SND-03" title="Step Sequencer 16" desc="4 дорожки × 16 шагов, свой синтез на WebAudio. Play-хед бегает по паттерну, темп 60–180 BPM, пресет и очистка." tags={["audio", "sequencer", "drums", "bpm"]}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Btn v={playing ? "bear" : "bull"} size="icon" onClick={() => { setPlaying(!playing); feel("tap"); }}>{playing ? <span className="flex gap-1"><span className="h-3.5 w-1 rounded bg-current" /><span className="h-3.5 w-1 rounded bg-current" /></span> : <Icon name="play" size={16} variant="solid" />}</Btn>
          <div className="flex items-center gap-2"><span className="text-[10px] font-extrabold uppercase text-ink-400">BPM</span>
            <input type="range" min={60} max={180} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="range-reset w-24" aria-label="bpm" />
            <span className="w-8 font-mono text-sm font-extrabold text-white">{bpm}</span>
          </div>
        </div>
        <div className="flex gap-2"><Btn v="ghost" size="sm" onClick={demo}>Demo</Btn><Btn v="dark" size="sm" onClick={clear}>Clear</Btn></div>
      </div>
      {ROWS.map((r, ri) => (
        <div key={r.t} className="mb-1.5 flex items-center gap-2">
          <span className="w-12 text-right font-mono text-[10px] font-extrabold text-ink-300">{r.t}</span>
          <div className="flex flex-1 gap-1">
            {pat[ri].map((v, ci) => (
              <button key={ci} onClick={() => toggle(ri, ci)}
                className={cn("h-8 flex-1 rounded transition-all duration-100", v ? "bg-gradient-to-b from-bull to-bull-edge shadow-[0_2px_0_#0b7a4d]" : ci % 4 === 0 ? "bg-ink-700" : "bg-ink-800", step === ci && "ring-2 ring-white scale-y-110")}
                style={v && step === ci ? { filter: "brightness(1.5)" } : undefined} />
            ))}
          </div>
        </div>
      ))}
    </AssetCard>
  );
}

/* ═════════ SND-04 · Sound designer ═════════ */
function SoundDesigner() {
  const [type, setType] = useState<"sine" | "square" | "sawtooth" | "triangle">("triangle");
  const [freq, setFreq] = useState(440);
  const [atk, setAtk] = useState(15);
  const [dec, setDec] = useState(300);
  const [loop, setLoop] = useState(false);
  const loopRef = useRef<number | undefined>(undefined);
  const play = () => { note(freq, Math.max(0.08, dec / 1000), type, 0.14); };
  useEffect(() => () => window.clearTimeout(loopRef.current), []);
  const toggleLoop = () => {
    if (loop) { window.clearTimeout(loopRef.current); setLoop(false); return; }
    setLoop(true);
    const tick = () => { play(); loopRef.current = window.setTimeout(tick, 150 + dec); };
    tick();
  };
  const path = `M0 60 L${atk / 50 * 40} 4 Q${atk / 50 * 40 + 8} 4 ${Math.min(96, atk / 50 * 40 + 30)} 60`;
  return (
    <AssetCard id="SND-04" title="Sound Designer" desc="Параметрический синтезатор: форма волны, частота (с именем ноты), атака/затухание, живой огибающий и loop-режим." tags={["audio", "synth", "envelope", "designer"]}>
      <div className="mb-3 flex items-center justify-between rounded-2xl bg-ink-950/60 p-3">
        <svg viewBox="0 0 100 64" className="h-16 w-24">
          <path d={path} fill="none" stroke="#2ee59d" strokeWidth="2.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #2ee59d)" }} />
          <text x="2" y="12" fontSize="8" fontWeight="800" fill="#5a70ad">env</text>
        </svg>
        <div className="text-right">
          <div className="font-mono text-2xl font-extrabold text-white">{freq} <span className="text-sm">Hz</span></div>
          <div className="font-mono text-xs font-bold text-bull">{noteName(freq)} · {type}</div>
        </div>
      </div>
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {(["sine", "triangle", "square", "sawtooth"] as const).map((t) => <button key={t} onClick={() => { setType(t); play(); }} className={cn("rounded-xl py-2 font-mono text-[10px] font-extrabold uppercase", type === t ? "bg-sky text-white shadow-[0_3px_0_#1e56c9]" : "bg-ink-800 text-ink-400")}>{t.slice(0, 5)}</button>)}
      </div>
      <div className="space-y-2.5">
        {[
          { l: "Frequency", v: freq, set: (n: number) => { setFreq(n); }, min: 80, max: 1400, unit: "Hz" },
          { l: "Attack", v: atk, set: setAtk, min: 4, max: 200, unit: "ms" },
          { l: "Decay", v: dec, set: setDec, min: 60, max: 1200, unit: "ms" },
        ].map((s) => (
          <div key={s.l} className="flex items-center gap-3">
            <span className="w-16 text-[10px] font-extrabold uppercase text-ink-400">{s.l}</span>
            <input type="range" min={s.min} max={s.max} value={s.v} onChange={(e) => s.set(+e.target.value)} className="range-reset flex-1" aria-label={s.l} />
            <span className="w-14 text-right font-mono text-[11px] font-bold text-white">{s.v}{s.unit}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2"><Btn v="bull" size="sm" block onClick={play}><Icon name="play" size={14} variant="solid" />Preview</Btn><Btn v={loop ? "bear" : "ghost"} size="sm" block onClick={toggleLoop}>{loop ? "Stop loop" : "Loop"}</Btn></div>
    </AssetCard>
  );
}

/* ═════════ SND-05 · Waveform scope ═════════ */
function Scope() {
  const [wave, setWave] = useState<"sine" | "square" | "saw" | "tri" | "noise">("sine");
  const [phase, setPhase] = useState(0);
  useRaf((dt) => setPhase((p) => (p + dt * 0.0015) % 2));
  const [played, setPlayed] = useState(0);
  const [freq] = useState(() => 523.25);
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * 300;
    const u = i / 120;
    let y: number;
    const t = (u * 4 + phase) % 1;
    if (wave === "sine") y = Math.sin(t * Math.PI * 2) * 30;
    else if (wave === "square") y = t < 0.5 ? 30 : -30;
    else if (wave === "saw") y = (t * 2 - 1) * 30;
    else if (wave === "tri") y = (t < 0.25 ? t * 4 : t < 0.75 ? 2 - t * 4 : t * 4 - 4) * 30;
    else y = (Math.sin(i * 13.37 + phase * 99) * 0.6 + Math.sin(i * 7.1) * 0.4) * 30;
    pts.push(`${x},${60 - y}`);
  }
  const playIt = () => { const map = { sine: "sine", square: "square", saw: "sawtooth", tri: "triangle", noise: "sine" } as const; note(freq, 0.35, map[wave], 0.14); if (wave === "noise") noiseBurst(0.3, 0.06); setPlayed((p) => p + 1); feel("tap"); };
  void played;
  return (
    <AssetCard id="SND-05" title="Waveform Scope" desc="Осциллограф пяти форм сигналов с бегущей фазой; кнопка Play синтезирует выбранную форму на частоте 523 Hz." tags={["audio", "oscilloscope", "waveform", "visual"]}>
      <div className="rounded-2xl bg-ink-950/70 p-3 shadow-[inset_0_0_0_1px_#2ee59d22]">
        <svg viewBox="0 0 300 120" className="w-full">
          <line x1="0" x2="300" y1="60" y2="60" stroke="#ffffff14" />
          {[30, 90].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="#ffffff08" />)}
          <polyline points={pts.join(" ")} fill="none" stroke="#2ee59d" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px #2ee59d)" }} />
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {(["sine", "square", "saw", "tri", "noise"] as const).map((wv) => <button key={wv} onClick={() => { setWave(wv); sfx.play("tick"); }} className={cn("rounded-lg px-2.5 py-1 font-mono text-[10px] font-extrabold", wave === wv ? "bg-bull text-ink-900" : "bg-ink-800 text-ink-400")}>{wv}</button>)}
        </div>
        <Btn v="bull" size="sm" onClick={playIt}><Icon name="play" size={13} variant="solid" />Play</Btn>
      </div>
    </AssetCard>
  );
}

export default function AudioFx() {
  return (
    <Section id="audiofx" num="21" title="Sound & Music" subtitle="FFT-визуализатор, синт-пианино, 16-шаговый секвенсор, дизайнер звука, осциллограф — всё на WebAudio без файлов">
      <Visualizer />
      <SynthPads />
      <Sequencer />
      <SoundDesigner />
      <Scope />
    </Section>
  );
}
