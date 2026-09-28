import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn } from "../components/ui";
import { tap } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   Y05 — АМБИЕНТ-МИКСЕР: процедурный фон для учёбы.
   WebAudio: пэд-аккорд + шум дождя + тики биржевой ленты. 0 КБ файлов.
   ═══════════════════════════════════════════════════════════════════ */

type Stem = { k: string; icon: IconName; t: string; d: string; hex: string };

const STEMS: Stem[] = [
  { k: "pad", icon: "sparkles", t: "Пэд", d: "Мягкий аккорд", hex: "#9A6BFF" },
  { k: "rain", icon: "link", t: "Дождь", d: "Розовый шум", hex: "#3D9BFF" },
  { k: "tape", icon: "chart", t: "Лента", d: "Тики сделок", hex: "#2BE38B" },
  { k: "pulse", icon: "heart", t: "Пульс", d: "Тихий бит 60 BPM", hex: "#FF8A3D" },
];

const PRESETS: Record<string, [number, number, number, number]> = {
  "Фокус": [0.7, 0.5, 0.2, 0.3],
  "Ночь": [0.9, 0.8, 0, 0.15],
  "Торги": [0.3, 0, 0.9, 0.6],
  "Тишина": [0, 0, 0, 0],
};

export function AmbientMixer() {
  const [on, setOn] = useState(false);
  const [vol, setVol] = useState([0.7, 0.5, 0.2, 0.3]);
  const [preset, setPreset] = useState("Фокус");
  const [viz, setViz] = useState<number[]>(Array.from({ length: 24 }, () => 0.2));
  const eng = useRef<{
    ctx: AudioContext; master: GainNode; gains: GainNode[]; timer: number; analyser: AnalyserNode; data: Uint8Array;
  } | null>(null);

  const setStem = (i: number, v: number) => {
    setVol((arr) => arr.map((x, j) => (j === i ? v : x)));
    setPreset("Свой");
    const e = eng.current;
    if (e) e.gains[i].gain.setTargetAtTime(v * 0.5, e.ctx.currentTime, 0.15);
  };

  const applyPreset = (name: string) => {
    setPreset(name);
    const p = PRESETS[name];
    setVol(p);
    tap("tick");
    const e = eng.current;
    if (e) p.forEach((v, i) => e.gains[i].gain.setTargetAtTime(v * 0.5, e.ctx.currentTime, 0.2));
  };

  useEffect(() => {
    if (!on) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.8;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    master.connect(analyser);
    analyser.connect(ctx.destination);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const gains = STEMS.map(() => {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(master);
      return g;
    });
    vol.forEach((v, i) => gains[i].gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.4));

    /* 1. Пэд: три расстроенных треугольника Am9 */
    [110, 164.8, 261.6].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      o.detune.value = (i - 1) * 6;
      const fl = ctx.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.value = 900;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.08 + i * 0.03;
      const lg = ctx.createGain();
      lg.gain.value = 250;
      lfo.connect(lg).connect(fl.frequency);
      o.connect(fl).connect(gains[0]);
      o.start(); lfo.start();
    });

    /* 2. Дождь: фильтрованный шум с медленной модуляцией */
    {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.03 * w) / 1.03;
        ch[i] = last * 2.2;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1400;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.11;
      const lg = ctx.createGain();
      lg.gain.value = 500;
      lfo.connect(lg).connect(hp.frequency);
      src.connect(hp).connect(gains[1]);
      src.start(); lfo.start();
    }

    /* 3. Лента: случайные тики */
    const tickTimer = window.setInterval(() => {
      if (Math.random() < 0.55) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = 1400 + Math.random() * 1800;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      o.connect(g).connect(gains[2]);
      o.start(t);
      o.stop(t + 0.05);
    }, 320);

    /* 4. Пульс: мягкий кик 60 BPM */
    const pulseTimer = window.setInterval(() => {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.16);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(gains[3]);
      o.start(t);
      o.stop(t + 0.25);
    }, 1000);

    /* визуализатор */
    let raf = 0;
    const loop = () => {
      analyser.getByteFrequencyData(data);
      setViz(Array.from({ length: 24 }, (_, i) => (data[Math.floor((i / 24) * data.length)] ?? 0) / 255));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    eng.current = { ctx, master, gains, timer: tickTimer, analyser, data };
    return () => {
      window.clearInterval(tickTimer);
      window.clearInterval(pulseTimer);
      cancelAnimationFrame(raf);
      try { ctx.close(); } catch { /* noop */ }
      eng.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  return (
    <div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => { tap(on ? "error" : "success"); setOn(!on); }}
          aria-label={on ? "Выключить фон" : "Включить фон"}
          className={cn("btn3d size-16 !rounded-full", on ? "v-violet" : "v-ink")}
        >
          <Icon name={on ? "minus" : "play"} size={26} stroke={2.6} />
        </button>
        <div className="flex h-14 flex-1 items-end gap-1" aria-hidden>
          {viz.map((v, i) => (
            <span key={i} className="flex-1 rounded-full bg-gradient-to-t from-violet-d to-violet transition-[height] duration-100" style={{ height: `${on ? Math.max(8, v * 100) : 8}%`, opacity: on ? 0.55 + v * 0.45 : 0.25 }} />
          ))}
        </div>
        <span className={cn("font-display text-[11px] font-black uppercase", on ? "text-violet" : "text-ink-500")}>{on ? "играет" : "пауза"}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEMS.map((s, i) => (
          <div key={s.k} className="panel-soft p-3 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-xl" style={{ background: `${s.hex}22`, color: s.hex }}>
              <Icon name={s.icon} size={20} stroke={2.4} />
            </span>
            <div className="mt-1.5 text-[12px] font-bold">{s.t}</div>
            <div className="text-[10px] text-ink-500">{s.d}</div>
            <input type="range" min={0} max={1} step={0.05} value={vol[i]} onChange={(e) => setStem(i, +e.target.value)} className="rng mt-1" aria-label={s.t} />
            <div className="font-mono text-[10px] text-ink-400">{Math.round(vol[i] * 100)}%</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {Object.keys(PRESETS).map((p) => (
          <button key={p} onClick={() => applyPreset(p)} className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold transition-colors", preset === p ? "bg-violet text-white" : "bg-ink-850 text-ink-300")}>{p}</button>
        ))}
        <Btn s="xs" v="ghost" icon="volumeX" className="ml-auto" onClick={() => applyPreset("Тишина")}>Mute</Btn>
      </div>
    </div>
  );
}
