import { useEffect, useRef, useState } from "react";
import { Asset, Btn3D, Section, Segmented } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { clamp } from "../hooks/motion";

/* =========================================================
   1. 16-STEP MULTI-TRACK DRUM & SYNTH SEQUENCER
   ========================================================= */
const TRACKS = [
  { name: "Kick", icon: "bolt", color: "#ff4d6a", freq: 140 },
  { name: "Snare", icon: "sparkles", color: "#ffc53d", freq: 280 },
  { name: "HiHat", icon: "star", color: "#2ed3f0", freq: 800 },
  { name: "Bass", icon: "flame", color: "#8d5cff", freq: 110 },
  { name: "CoinArp", icon: "coin", color: "#1fdb8b", freq: 880 },
];

function StepSequencer() {
  const [bpm, setBpm] = useState(105);
  const [playing, setPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pattern, setPattern] = useState<boolean[][]>(() => [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], // HiHat
    [true, false, false, true, false, false, true, false, false, true, false, false, true, false, false, false], // Bass
    [false, true, false, false, true, false, true, false, false, false, true, false, false, true, false, true], // CoinArp
  ]);

  const stepRef = useRef(0);
  const audioCtx = useRef<AudioContext | null>(null);

  const toggleStep = (trackIdx: number, stepIdx: number) => {
    setPattern((prev) => {
      const next = prev.map((row) => [...row]);
      next[trackIdx][stepIdx] = !next[trackIdx][stepIdx];
      return next;
    });
    sfx.tick();
    haptic(4);
  };

  const playStepSound = (freq: number) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtx.current) audioCtx.current = new AC();
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = freq < 200 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch {
      // noop
    }
  };

  useEffect(() => {
    if (!playing) return;
    const intervalMs = (60 / bpm / 4) * 1000;
    const timer = setInterval(() => {
      const nextStep = (stepRef.current + 1) % 16;
      stepRef.current = nextStep;
      setCurrentStep(nextStep);

      // Play active tracks on this step
      TRACKS.forEach((tr, idx) => {
        if (pattern[idx][nextStep]) {
          playStepSound(tr.freq);
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [playing, bpm, pattern]);

  return (
    <Asset title="16-Step Game Sound Sequencer" id="aud.seq" desc="Многодорожечный пошаговый секвенсор: создавайте ритм для игровых сессий, меняйте темп (BPM), активируйте шаги в реальном времени." className="lg:col-span-3" tags={["WEBAUDIO"]}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Btn3D size="sm" variant={playing ? "bear" : "bull"} onClick={() => setPlaying(!playing)} icon={<Icon name={playing ? "minus" : "play"} size={16} />}>
            {playing ? "Stop" : "Play Beat"}
          </Btn3D>
          <span className="text-[12px] font-extrabold text-mute">
            Step: <span className="num text-txt text-[14px]">#{currentStep + 1}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold text-mute">
          <span>Tempo:</span>
          <input type="range" min="70" max="150" value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-28 accent-blue" />
          <span className="num text-txt w-10 text-right">{bpm} BPM</span>
        </div>
      </div>

      <div className="space-y-2 overflow-x-auto pb-2">
        {TRACKS.map((track, tIdx) => (
          <div key={track.name} className="flex items-center gap-2 min-w-[540px]">
            <span className="w-18 text-[11px] font-extrabold" style={{ color: track.color }}>
              {track.name}
            </span>
            <div className="flex-1 grid grid-cols-16 gap-1">
              {pattern[tIdx].map((active, sIdx) => {
                const isCurrent = currentStep === sIdx && playing;
                return (
                  <button
                    key={sIdx}
                    onClick={() => toggleStep(tIdx, sIdx)}
                    className={cn(
                      "h-8 rounded-lg border transition-all duration-100 flex items-center justify-center",
                      active
                        ? "shadow-[0_2px_0_rgba(0,0,0,0.4)]"
                        : "bg-[#0c1737] border-[#22366f] hover:border-[#38539e]",
                      isCurrent && "ring-2 ring-white scale-105"
                    )}
                    style={{
                      backgroundColor: active ? track.color : undefined,
                      borderColor: active ? track.color : undefined,
                    }}
                  >
                    {active && <span className="size-1.5 rounded-full bg-white shadow" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   2. ADSR SYNTHESIZER & KEYBOARD
   ========================================================= */
function AdsrSynthesizer() {
  const [waveType, setWaveType] = useState<OscillatorType>("sawtooth");
  const [attack, setAttack] = useState(0.04);
  const [decay, setDecay] = useState(0.18);
  const [sustain, setSustain] = useState(0.45);
  const [release, setRelease] = useState(0.35);
  const [cutoff, setCutoff] = useState(1800);

  const audioCtx = useRef<AudioContext | null>(null);

  const playNote = (freq: number) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtx.current) audioCtx.current = new AC();
      const ctx = audioCtx.current;

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cutoff, ctx.currentTime);

      // ADSR Envelope
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + attack);
      gain.gain.exponentialRampToValueAtTime(0.18 * sustain, t + attack + decay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay + release);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + attack + decay + release + 0.05);

      sfx.tick();
      haptic(5);
    } catch {
      // noop
    }
  };

  const keyboardNotes = [
    { note: "C4", freq: 261.63, isBlack: false },
    { note: "C#4", freq: 277.18, isBlack: true },
    { note: "D4", freq: 293.66, isBlack: false },
    { note: "D#4", freq: 311.13, isBlack: true },
    { note: "E4", freq: 329.63, isBlack: false },
    { note: "F4", freq: 349.23, isBlack: false },
    { note: "F#4", freq: 369.99, isBlack: true },
    { note: "G4", freq: 392.0, isBlack: false },
    { note: "G#4", freq: 415.3, isBlack: true },
    { note: "A4", freq: 440.0, isBlack: false },
    { note: "A#4", freq: 466.16, isBlack: true },
    { note: "B4", freq: 493.88, isBlack: false },
    { note: "C5", freq: 523.25, isBlack: false },
  ];

  return (
    <Asset title="ADSR Synth & Keyboard" id="aud.synth" desc="Синтезатор звуков интерфейса: настраиваемая огибающая ADSR (Attack, Decay, Sustain, Release), фильтр среза частот и живая клавиатура." className="lg:col-span-2" tags={["SYNTH"]}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Segmented
          value={waveType}
          onChange={(v) => setWaveType(v as OscillatorType)}
          size="sm"
          className="w-72"
          options={[
            { value: "sine", label: "Sine" },
            { value: "triangle", label: "Triangle" },
            { value: "sawtooth", label: "Saw" },
            { value: "square", label: "Square" },
          ]}
        />
        <div className="text-[11px] font-bold text-mute flex items-center gap-2">
          <span>Filter Cutoff:</span>
          <input type="range" min="400" max="4000" step="50" value={cutoff} onChange={(e) => setCutoff(+e.target.value)} className="w-24 accent-violet" />
          <span className="num text-txt">{cutoff}Hz</span>
        </div>
      </div>

      {/* ADSR Sliders */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-[10px] font-bold text-mute">
        <div>
          <span>Attack</span>
          <input type="range" min="0.01" max="0.3" step="0.01" value={attack} onChange={(e) => setAttack(+e.target.value)} className="w-full accent-bull" />
          <span className="num text-txt">{(attack * 1000).toFixed(0)}ms</span>
        </div>
        <div>
          <span>Decay</span>
          <input type="range" min="0.05" max="0.5" step="0.02" value={decay} onChange={(e) => setDecay(+e.target.value)} className="w-full accent-blue" />
          <span className="num text-txt">{(decay * 1000).toFixed(0)}ms</span>
        </div>
        <div>
          <span>Sustain</span>
          <input type="range" min="0.1" max="0.9" step="0.05" value={sustain} onChange={(e) => setSustain(+e.target.value)} className="w-full accent-gold" />
          <span className="num text-txt">{Math.round(sustain * 100)}%</span>
        </div>
        <div>
          <span>Release</span>
          <input type="range" min="0.1" max="0.8" step="0.05" value={release} onChange={(e) => setRelease(+e.target.value)} className="w-full accent-bear" />
          <span className="num text-txt">{(release * 1000).toFixed(0)}ms</span>
        </div>
      </div>

      {/* Piano Keyboard */}
      <div className="relative h-28 flex justify-center inset !rounded-2xl p-2 select-none touch-none">
        {keyboardNotes.map((k) => (
          <button
            key={k.note}
            onClick={() => playNote(k.freq)}
            className={cn(
              "relative rounded-b-xl border transition-all active:translate-y-1",
              k.isBlack
                ? "w-7 h-16 -mx-3.5 z-10 bg-[#0f1b3f] border-[#22366f] hover:bg-[#1a2d6b]"
                : "w-9 h-24 bg-gradient-to-b from-[#ffffff] to-[#d8e3ff] text-ink-900 border-[#9db4eb] hover:brightness-105"
            )}
          >
            <span className={cn("absolute bottom-1.5 inset-x-0 text-center font-extrabold text-[9px]", k.isBlack ? "text-white/60" : "text-ink-900/60")}>
              {k.note}
            </span>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   3. SPATIAL 3D AUDIO SIMULATOR
   ========================================================= */
function Spatial3DAudio() {
  const [sourcePos, setSourcePos] = useState({ x: 0.6, y: -0.4 });
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.buttons !== 1) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    setSourcePos({ x, y });
  };

  const ping = () => {
    setPlaying(true);
    sfx.coin();
    haptic(8);
    setTimeout(() => setPlaying(false), 300);
  };

  const dist = Math.hypot(sourcePos.x, sourcePos.y);
  const pan = sourcePos.x;

  return (
    <Asset title="Spatial 3D Audio" id="aud.spatial" desc="Пространственное 3D-аудио: перетаскивайте источник звука вокруг слушателя, рассчитывается стерео-панорама и затухание громкости." className="lg:col-span-1" tags={["3D"]}>
      <div className="flex flex-col items-center">
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          className="relative size-44 inset !rounded-full overflow-hidden cursor-crosshair select-none touch-none grid place-items-center"
        >
          {/* Radar circles */}
          <div className="absolute inset-8 rounded-full border border-blue/20" />
          <div className="absolute inset-16 rounded-full border border-blue/25" />

          {/* Central Listener */}
          <div className="relative size-8 rounded-full bg-blue grid place-items-center text-white shadow-[0_0_12px_#3d7bff]">
            <Icon name="user" size={16} />
          </div>

          {/* Draggable Sound Source */}
          <div
            className={cn(
              "absolute size-7 rounded-full bg-gold grid place-items-center text-ink-900 shadow-[0_0_14px_#ffc53d] transition-transform",
              playing && "scale-125"
            )}
            style={{
              left: `${(sourcePos.x + 1) * 50}%`,
              top: `${(sourcePos.y + 1) * 50}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Glyph name="coin" size={16} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full mt-3 text-[11px] font-bold text-mute">
          <div className="inset p-2 text-center">
            <span className="block text-dim">Pan (L/R)</span>
            <span className="num text-txt font-extrabold">{pan > 0 ? `R +${Math.round(pan * 100)}%` : `L ${Math.round(pan * 100)}%`}</span>
          </div>
          <div className="inset p-2 text-center">
            <span className="block text-dim">Distance</span>
            <span className="num text-txt font-extrabold">{dist.toFixed(2)}m</span>
          </div>
        </div>

        <Btn3D size="xs" variant="gold" full className="mt-3" onClick={ping}>
          Ping Sound Source
        </Btn3D>
      </div>
    </Asset>
  );
}

export default function AudioStudio() {
  return (
    <Section id="audiostudio" index="15" title="Interactive Audio & Synth Studio" subtitle="3 звуковые лаборатории: 16-шаговый секвенсор битов, огибающая ADSR с клавишами пианино, пространственное 3D-аудио" count={3}>
      <div className="grid lg:grid-cols-3 gap-6">
        <StepSequencer />
        <AdsrSynthesizer />
        <Spatial3DAudio />
      </div>
    </Section>
  );
}
