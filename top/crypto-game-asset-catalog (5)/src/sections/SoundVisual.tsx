import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { isMusicOn, setMusicEnabled, setMusicVolume } from "../utils/music";

/* ============ 1. EQUALIZER BARS ============ */
function Equalizer() {
  const N = 24;
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(true);
  const [style, setStyle] = useState<"bars" | "dots" | "wave">("bars");
  const [gain, setGain] = useState(70);
  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const loop = () => { setT((v) => v + 0.12); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [play]);
  const h = (i: number) => {
    const g = gain / 100;
    return 8 + (Math.sin(t + i * 0.55) * 0.5 + Math.sin(t * 1.7 + i * 1.3) * 0.3 + Math.sin(t * 0.4 + i * 0.2) * 0.4 + 1.2) / 2.4 * 92 * g;
  };
  return (
    <Asset title="Equalizer" id="snd.eq" desc="Эквалайзер музыки: 3 стиля отрисовки, усиление, пауза замораживает спектр.">
      <div className="inset !rounded-2xl h-[150px] flex items-end justify-center gap-[5px] p-4 overflow-hidden">
        {Array.from({ length: N }).map((_, i) => {
          const v = h(i);
          if (style === "dots") return <span key={i} className="w-2 rounded-full transition-all duration-75" style={{ height: 8, marginBottom: v * 1.1, background: `hsl(${160 + (i / N) * 140} 90% 60%)`, boxShadow: `0 0 10px hsl(${160 + (i / N) * 140} 90% 60%)` }} />;
          if (style === "wave") return <span key={i} className="w-2 rounded-full transition-all duration-75" style={{ height: Math.max(6, v), background: `linear-gradient(180deg, hsl(${160 + (i / N) * 140} 90% 65%), transparent)`, opacity: 0.9 }} />;
          return <span key={i} className="flex-1 max-w-3.5 rounded-t-md transition-all duration-75" style={{ height: `${v}%`, background: `linear-gradient(180deg, hsl(${150 + (i / N) * 150} 90% 60%), hsl(${150 + (i / N) * 150} 90% 40%))` }} />;
        })}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Btn3D size="xs" variant={play ? "neutral" : "bull"} onClick={() => setPlay(!play)}>{play ? "Pause" : "Play"}</Btn3D>
        {(["bars", "dots", "wave"] as const).map((s) => <Btn3D key={s} size="xs" variant={style === s ? "violet" : "neutral"} onClick={() => setStyle(s)}>{s}</Btn3D>)}
        <input type="range" min={10} max={100} value={gain} onChange={(e) => setGain(+e.target.value)} className="flex-1 accent-[#8d5cff]" />
      </div>
    </Asset>
  );
}

/* ============ 2. WAVEFORM SCRUBBER ============ */
function Waveform() {
  const N = 48;
  const bars = useRef(Array.from({ length: N }, (_, i) => 0.25 + Math.abs(Math.sin(i * 0.7)) * 0.5 + Math.random() * 0.25));
  const [pos, setPos] = useState(0.3);
  const [play, setPlay] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!play) return;
    const h = setInterval(() => setPos((p) => { if (p >= 1) { setPlay(false); sfx.success(); return 1; } return Math.min(1, p + 0.006 * speed); }), 50);
    return () => clearInterval(h);
  }, [play, speed]);
  const total = 184;
  const cur = Math.floor(pos * total);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  return (
    <Asset title="Waveform Player" id="snd.wave" desc="Голосовой разбор сделки: клик по волне — перемотка, скорость 1x/1.5x/2x, прогресс красит бары.">
      <div className="inset !rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => { if (pos >= 1) setPos(0); setPlay(!play); sfx.tap(); }} className="size-11 rounded-full bg-gradient-to-b from-[#5af5b4] to-[#12c47a] grid place-items-center text-[#03261a] shadow-[0_4px_0_#0d9a5c] active:translate-y-[3px] active:shadow-none transition shrink-0">
            <Icon name={play ? "minus" : "play"} size={18} stroke={3} />
          </button>
          <div className="flex-1">
            <div className="text-[12.5px] font-extrabold">Разбор: BTC лонг от $64k</div>
            <div className="num text-[10.5px] text-dim">{fmt(cur)} / {fmt(total)}</div>
          </div>
          <div className="flex gap-1">{[1, 1.5, 2].map((s) => <button key={s} onClick={() => { setSpeed(s); sfx.tick(); }} className={cn("h-7 px-2 rounded-lg num text-[10.5px] font-extrabold", speed === s ? "bg-blue text-white" : "text-mute hover:bg-white/5")}>{s}x</button>)}</div>
        </div>
        <div className="flex items-center gap-[3px] h-14 cursor-pointer" onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos((e.clientX - r.left) / r.width); }}>
          {bars.current.map((b, i) => {
            const played = i / N < pos;
            const isHead = Math.abs(i / N - pos) < 1 / N;
            return <span key={i} className="flex-1 rounded-full transition-colors duration-150" style={{ height: `${b * 100}%`, background: played ? "linear-gradient(180deg,#5af5b4,#12c47a)" : "#22366f", transform: isHead ? "scaleX(2)" : undefined, boxShadow: isHead ? "0 0 8px #1fdb8b" : undefined }} />;
          })}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 3. BEAT RINGS ============ */
function BeatRings() {
  const [bpm, setBpm] = useState(84);
  const [beat, setBeat] = useState(0);
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!on) return;
    const h = setInterval(() => { setBeat((b) => b + 1); if ((beat + 1) % 4 === 0) sfx.tick(); }, 60000 / bpm);
    return () => clearInterval(h);
  }, [on, bpm, beat]);
  return (
    <Asset title="Beat Rings" id="snd.beat" desc="Кольца бьются в темпе BPM: сильная доля ярче, темп меняет пульс.">
      <div className="relative h-[190px] grid place-items-center">
        {[0, 1, 2].map((k) => {
          const ph = (beat + k) % 4;
          return <span key={`${beat}-${k}`} className="absolute rounded-full border-[3px]" style={{ width: 60, height: 60, borderColor: ph === 0 ? "#ffc53d" : "#3d7bff", animation: `pulse-ring ${60 / bpm}s ease-out both` }} />;
        })}
        <span key={beat} className="size-16 rounded-full grid place-items-center font-extrabold num text-[20px] anim-pop" style={{ background: beat % 4 === 0 ? "linear-gradient(180deg,#ffdc7a,#f0a811)" : "linear-gradient(180deg,#2a4185,#16275a)", color: beat % 4 === 0 ? "#3a2400" : undefined, boxShadow: beat % 4 === 0 ? "0 0 40px rgba(255,197,61,.6)" : "0 5px 0 #0b1536" }}>{(beat % 4) + 1}</span>
        <div className="absolute bottom-1 num text-[13px] font-extrabold text-mute">{bpm} BPM</div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <input type="range" min={50} max={160} value={bpm} onChange={(e) => setBpm(+e.target.value)} className="flex-1 accent-[#ffc53d]" />
        <Btn3D size="xs" variant={on ? "gold" : "neutral"} onClick={() => setOn(!on)}>{on ? "Stop" : "Start"}</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 4. MUSIC CONTROLLER ============ */
function MusicCtrl() {
  const [on, setOn] = useState(isMusicOn());
  const [vol, setVol] = useState(50);
  const [track, setTrack] = useState(0);
  const tracks = [
    { n: "Midnight Session", g: "Lo-Fi · 84 BPM" }, { n: "Bull Run Energy", g: "Synth · 120 BPM" }, { n: "Deep Focus", g: "Ambient · 60 BPM" },
  ];
  return (
    <Asset title="Music Controller" id="snd.music" desc="Настоящее управление фоновой музыкой каталога: play/pause, громкость, треки (меняют настроение).">
      <div className="inset !rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { const n = !on; setOn(n); setMusicEnabled(n); sfx.tap(); }}
            className={cn("size-14 rounded-2xl grid place-items-center transition active:scale-95", on ? "bg-gradient-to-b from-[#ab86ff] to-[#6f3cf0] shadow-[0_4px_0_#4a22b0]" : "bg-[#1c3068] shadow-[0_4px_0_#0b1536]")}>
            <Icon name={on ? "minus" : "play"} size={22} stroke={2.6} className={on ? "text-white" : "text-mute"} />
          </button>
          <div className="flex-1 min-w-0">
            <div key={track} className="font-extrabold text-[14px] truncate anim-fade">{tracks[track].n}</div>
            <div className="text-[11px] text-dim font-bold">{tracks[track].g}</div>
          </div>
          {on && <span className="flex items-end gap-[3px] h-6">{[0, 1, 2, 3].map((i) => <i key={i} className="w-1.5 bg-violet rounded-full" style={{ height: "100%", animation: `floaty .7s ${i * 0.12}s ease-in-out infinite`, transformOrigin: "bottom" }} />)}</span>}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Btn3D size="xs" variant="neutral" onClick={() => setTrack((track + 2) % 3)}><Icon name="chevL" size={13} stroke={3} /></Btn3D>
          <Btn3D size="xs" variant="neutral" onClick={() => setTrack((track + 1) % 3)}><Icon name="chevR" size={13} stroke={3} /></Btn3D>
          <Icon name="volume" size={15} className="text-dim ml-1" />
          <input type="range" min={0} max={100} value={vol} onChange={(e) => { setVol(+e.target.value); setMusicVolume(+e.target.value / 100); }} className="flex-1 accent-[#8d5cff]" />
          <span className="num text-[11px] font-extrabold w-9">{vol}%</span>
        </div>
      </div>
      {on && <div className="mt-2 text-center"><Badge tone="violet" dot>now playing</Badge></div>}
    </Asset>
  );
}

/* ============ 5. VOLUME ARCS ============ */
function VolumeArcs() {
  const [v, setV] = useState(65);
  const segs = 18;
  return (
    <Asset title="Volume Arcs" id="snd.vol" desc="Дуговая громкость: клик по сегменту, градиент от зелёного к красному, иконка меняется.">
      <div className="flex flex-col items-center py-2">
        <div className="flex items-end gap-[5px] h-[90px]">
          {Array.from({ length: segs }).map((_, i) => {
            const on = (i / segs) * 100 < v;
            const h = 24 + Math.sin((i / (segs - 1)) * Math.PI) * 62;
            const hue = 140 - (i / segs) * 140;
            return <button key={i} onClick={() => { setV(Math.round(((i + 1) / segs) * 100)); sfx.tick(); }} className="w-3.5 rounded-full transition-all duration-150 hover:scale-y-110" style={{ height: h, background: on ? `hsl(${hue} 85% 55%)` : "#16275a", boxShadow: on ? `0 0 10px hsl(${hue} 85% 55% / .6)` : "none" }} />;
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 w-full">
          <Icon name={v === 0 ? "mute" : v < 40 ? "volume" : "volume"} size={20} className={v === 0 ? "text-dim" : "text-txt"} />
          <input type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} className="flex-1 accent-[#1fdb8b]" />
          <span className="num text-[14px] font-extrabold w-10">{v}</span>
        </div>
      </div>
    </Asset>
  );
}

/* ============ 6. SFX PAD ============ */
function SfxPad() {
  const pads: { n: string; c: string; fn: () => void }[] = [
    { n: "Tap", c: "#3d7bff", fn: () => sfx.tap() }, { n: "Pop", c: "#2ed3f0", fn: () => sfx.pop() },
    { n: "Coin", c: "#ffc53d", fn: () => sfx.coin() }, { n: "Win", c: "#1fdb8b", fn: () => sfx.success() },
    { n: "Fail", c: "#ff4d6a", fn: () => sfx.error() }, { n: "Whoosh", c: "#8d5cff", fn: () => sfx.whoosh() },
    { n: "Tick", c: "#8e9cc8", fn: () => sfx.tick() }, { n: "Level", c: "#ff8a3d", fn: () => sfx.levelUp() },
    { n: "Toggle", c: "#5af5b4", fn: () => sfx.toggle() },
  ];
  const [active, setActive] = useState<string | null>(null);
  const [seq, setSeq] = useState<string[]>([]);
  const hit = (p: (typeof pads)[0]) => { p.fn(); setActive(p.n); setSeq((s) => [...s.slice(-7), p.n]); setTimeout(() => setActive(null), 180); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { const i = parseInt(e.key) - 1; if (i >= 0 && i < 9 && (e.target as HTMLElement).tagName !== "INPUT") hit(pads[i]); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Asset title="SFX Drum Pad" id="snd.pad" desc="Драм-машина звуков игры: 9 пэдов, клавиши 1–9, история ударов.">
      <div className="grid grid-cols-3 gap-2.5">
        {pads.map((p, i) => (
          <button key={p.n} onPointerDown={() => hit(p)}
            className="h-[68px] rounded-2xl font-extrabold text-[12px] transition-all duration-100 border-2"
            style={{ background: active === p.n ? p.c : "#101c42", borderColor: active === p.n ? "#fff" : `${p.c}55`, color: active === p.n ? "#071022" : p.c, transform: active === p.n ? "scale(.93)" : "none", boxShadow: active === p.n ? `0 0 24px ${p.c}` : "0 4px 0 #0b1536" }}>
            {p.n}<span className="block num text-[9px] opacity-60">{i + 1}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 min-h-[26px] flex-wrap">
        {seq.length === 0 && <span className="text-[11px] text-dim font-bold">жми пэды или клавиши 1–9</span>}
        {seq.map((s, i) => <span key={`${s}-${i}`} className="text-[10px] font-extrabold bg-white/5 rounded-md px-1.5 py-0.5 anim-pop">{s}</span>)}
      </div>
    </Asset>
  );
}

/* ============ 7. MIC PULSE ============ */
function MicPulse() {
  const [rec, setRec] = useState(false);
  const [lvl, setLvl] = useState(0);
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!rec) { setLvl(0); return; }
    const h = setInterval(() => { setLvl(0.2 + Math.random() * 0.8); setTime((t) => t + 1); }, 120);
    return () => clearInterval(h);
  }, [rec]);
  const fmt = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`;
  return (
    <Asset title="Voice Recorder" id="snd.mic" desc="Запись голосовой заметки: пульс от уровня, таймер, волны. Старт/стоп.">
      <div className="flex flex-col items-center py-3">
        <button onClick={() => { setRec(!rec); if (!rec) setTime(0); rec ? sfx.tap() : sfx.pop(); }}
          className={cn("relative size-20 rounded-full grid place-items-center transition-all", rec ? "bg-gradient-to-b from-[#ff7c93] to-[#e3304f] shadow-[0_5px_0_#7a1428]" : "bg-gradient-to-b from-[#2a4185] to-[#16275a] shadow-[0_5px_0_#0b1536]")}>
          {rec && [0, 1].map((k) => <span key={k} className="absolute inset-0 rounded-full border-2 border-bear" style={{ animation: `pulse-ring 1.4s ${k * 0.7}s ease-out infinite` }} />)}
          <span className="size-3.5 rounded-full" style={{ background: rec ? "#fff" : "#ff4d6a", transform: `scale(${1 + lvl * 0.5})`, transition: "transform .1s" }} />
        </button>
        <div className="num text-[22px] font-extrabold mt-3">{fmt}</div>
        <div className="flex items-end gap-1 h-8 mt-1">{Array.from({ length: 20 }).map((_, i) => <span key={i} className="w-1.5 rounded-full bg-bear transition-all duration-100" style={{ height: rec ? `${6 + lvl * 22 * (0.4 + Math.abs(Math.sin(i * 1.3 + time)) * 0.6)}px` : 6, opacity: rec ? 1 : 0.3 }} />)}</div>
        <div className="text-[11px] font-bold mt-1" style={{ color: rec ? "#ff8da0" : "#5b6a98" }}>{rec ? "● recording" : "tap to record"}</div>
      </div>
    </Asset>
  );
}

/* ============ 8. NOTIFICATION SOUNDS ============ */
function NotifSounds() {
  const items = [
    { t: "Ордер исполнен", d: "BUY 0.01 BTC", s: "success" as const, fn: () => sfx.success() },
    { t: "Цена достигла", d: "BTC $70,000", s: "coin" as const, fn: () => sfx.coin() },
    { t: "Стоп сработал", d: "−$124.50", s: "error" as const, fn: () => sfx.error() },
    { t: "Новый уровень", d: "Level 13", s: "level" as const, fn: () => sfx.levelUp() },
  ];
  const [played, setPlayed] = useState<string | null>(null);
  return (
    <Asset title="Alert Sounds" id="snd.alerts" desc="Звуки уведомлений с превью: каждый алерт играет свой SFX и подсвечивается.">
      <div className="space-y-2">
        {items.map((a) => (
          <button key={a.t} onClick={() => { a.fn(); setPlayed(a.t); setTimeout(() => setPlayed(null), 900); }}
            className={cn("w-full flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all", played === a.t ? "border-current scale-[1.02]" : "border-transparent bg-white/[.03] hover:bg-white/5")}
            style={played === a.t ? { color: a.s === "success" ? "#1fdb8b" : a.s === "coin" ? "#ffc53d" : a.s === "error" ? "#ff4d6a" : "#8d5cff", background: "rgba(255,255,255,.05)" } : undefined}>
            <span className="size-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${a.s === "success" ? "#1fdb8b" : a.s === "coin" ? "#ffc53d" : a.s === "error" ? "#ff4d6a" : "#8d5cff"}22`, color: a.s === "success" ? "#1fdb8b" : a.s === "coin" ? "#ffc53d" : a.s === "error" ? "#ff4d6a" : "#8d5cff" }}>
              <Icon name={a.s === "success" ? "check" : a.s === "coin" ? "coin" : a.s === "error" ? "warning" : "bolt"} size={17} />
            </span>
            <span className="flex-1"><span className="block text-[12.5px] font-extrabold text-txt">{a.t}</span><span className="block text-[11px] text-dim num">{a.d}</span></span>
            <Icon name="volume" size={16} className={played === a.t ? "" : "text-dim"} style={played === a.t ? { animation: "pop .3s both" } : undefined} />
          </button>
        ))}
      </div>
    </Asset>
  );
}

export default function SoundVisual() {
  return (
    <Section id="sound" index="32" title="Sound Visual Lab" subtitle="8 звуковых визуалов: эквалайзер, волна, бит, музыка, громкость, драм-пэд, диктофон, алерты" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Equalizer />
        <Waveform />
        <BeatRings />
        <MusicCtrl />
        <VolumeArcs />
        <SfxPad />
        <MicPulse />
        <NotifSounds />
      </div>
    </Section>
  );
}
