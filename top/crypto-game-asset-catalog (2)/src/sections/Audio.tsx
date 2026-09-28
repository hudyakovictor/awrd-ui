import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, Vibrate, Music4, Waves, Power } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip } from "../kit/ui";
import { sfx, isMuted, setMuted, onMute } from "../kit/sfx";
import { cn } from "../utils/cn";

const palette: { n: string; hz: string; d: string; wave: "tri" | "sq" | "sin" | "saw"; call: () => void; use: string; c: string }[] = [
  { n: "Tap", hz: "520 Hz", d: "45 ms", wave: "tri", call: sfx.tap, use: "Кнопка, плитка", c: "#3b82ff" },
  { n: "Soft", hz: "380 Hz", d: "40 ms", wave: "sin", call: sfx.soft, use: "Побочный тап", c: "#2bd9ff" },
  { n: "Tick", hz: "1.5 kHz", d: "20 ms", wave: "sq", call: sfx.tick, use: "Слайдер, инкремент", c: "#8a9bc4" },
  { n: "Toggle", hz: "660/440", d: "60 ms", wave: "tri", call: () => sfx.toggle(true), use: "Свитч on", c: "#22d39a" },
  { n: "Correct", hz: "660→990", d: "240 ms", wave: "tri", call: sfx.correct, use: "Верный ответ", c: "#22d39a" },
  { n: "Wrong", hz: "220→140", d: "180 ms", wave: "saw", call: sfx.wrong, use: "Ошибка, тряска", c: "#ff4f6d" },
  { n: "Coin", hz: "1320/1760", d: "180 ms", wave: "sq", call: sfx.coin, use: "Валюта, награда", c: "#ffc53d" },
  { n: "Level up", hz: "523→1046", d: "620 ms", wave: "tri", call: sfx.levelUp, use: "Арпeджио 4 ноты", c: "#ffc53d" },
  { n: "Whoosh", hz: "900→200", d: "180 ms", wave: "sin", call: sfx.whoosh, use: "Переход, лист", c: "#8b5cff" },
  { n: "Error", hz: "300/200", d: "240 ms", wave: "sq", call: sfx.error, use: "Блокировка", c: "#ff4f6d" },
  { n: "Open", hz: "300→1600", d: "650 ms", wave: "saw", call: sfx.open, use: "Сундук", c: "#ff8a3d" },
];

function wavePath(kind: string, w = 120, h = 34) {
  const mid = h / 2;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const x = (i / 60) * w;
    const t = i / 60;
    let y = mid;
    if (kind === "sin") y = mid - Math.sin(t * Math.PI * 6) * mid * 0.8;
    if (kind === "tri") y = mid - (Math.abs(((t * 6) % 2) - 1) * 2 - 1) * mid * 0.85;
    if (kind === "sq") y = mid - (Math.floor(t * 6) % 2 ? 1 : -1) * mid * 0.85;
    if (kind === "saw") y = mid - ((t * 6) % 1 * 2 - 1) * mid * 0.85;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function SoundPalette() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(60);
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMute(setM), []);
  const hit = (n: string, call: () => void) => {
    setPlaying(n);
    call();
    setTimeout(() => setPlaying((p) => (p === n ? null : p)), 420);
  };
  return (
    <Asset code="M-001" title="Sound Palette" desc="11 процедурных звуков: частота, длительность, форма волны и роль. Генерируются в браузере." hint="Нажми на звук" specs={["11 cues", "4 waveforms", "no files"]}>
      <div className="mb-3 flex items-center gap-3">
        <button onClick={() => { const m = !muted; setMuted(m); setM(m); if (!m) sfx.toggle(true); }} className={cn("grid h-10 w-10 place-items-center rounded-xl shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none", muted ? "bg-ink-700 text-mist" : "bg-bull/20 text-bull")}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[10px] font-bold"><span className="text-mist">Master</span><span className="num text-gold">{volume}%</span></div>
          <input type="range" min={0} max={100} value={volume} onChange={(e) => setVolume(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${volume}%,#0b1530 0)` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {palette.map((s) => (
          <button key={s.n} onClick={() => hit(s.n, s.call)} className="group/p relative overflow-hidden rounded-2xl bg-ink-800 p-2.5 text-left shadow-[0_3px_0_#08112a] transition active:translate-y-1 active:shadow-none">
            <svg viewBox="0 0 120 34" className="h-8 w-full">
              <polyline points={wavePath(s.wave)} fill="none" stroke={s.c} strokeWidth="2" strokeLinecap="round" style={{ opacity: playing === s.n ? 1 : 0.45, filter: playing === s.n ? `drop-shadow(0 0 6px ${s.c})` : undefined, transition: "opacity .3s" }} />
            </svg>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] font-extrabold" style={{ color: s.c }}>{s.n}</span>
              <span className="num text-[8px] text-mist">{s.hz}</span>
            </div>
            <div className="text-[9px] text-mist">{s.use}</div>
            {playing === s.n && <span className="absolute inset-0 rounded-2xl ring-2" style={{ borderColor: s.c, animation: "pop-in .35s" }} />}
          </button>
        ))}
      </div>
    </Asset>
  );
}

const motif = [
  { n: 523, d: 0.18, c: "#3b82ff" },
  { n: 659, d: 0.18, c: "#22d39a" },
  { n: 784, d: 0.18, c: "#ffc53d" },
  { n: 1046, d: 0.36, c: "#ff8a3d" },
  { n: 784, d: 0.18, c: "#ffc53d" },
  { n: 1046, d: 0.5, c: "#8b5cff" },
];
function Motif() {
  const [step, setStep] = useState(-1);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let acc = 0;
    motif.forEach((m, i) => {
      timers.current.push(window.setTimeout(() => { setStep(i); sfx.tick(); }, acc * 1000));
      acc += m.d;
    });
    timers.current.push(window.setTimeout(() => setStep(-1), acc * 1000 + 200));
  };
  const maxD = 1046;
  return (
    <Asset code="M-002" title="Sonic Brand Motif" desc="Звуковая айдентика: 6-нотный мотив запуска, тот же, что звучит при повышении уровня." hint="Проиграй мотив" specs={["6 notes", "C-E-G-C", "shared with level-up"]}>
      <div className="relative flex h-40 items-end gap-1.5 rounded-2xl bg-ink-900/60 p-3">
        {motif.map((m, i) => (
          <button key={i} onClick={() => { sfx.tick(); setStep(i); setTimeout(() => setStep(-1), m.d * 400); }} className="group/n flex-1 rounded-lg transition-all duration-200" style={{ height: `${(m.n / maxD) * 100}%`, background: `linear-gradient(180deg, ${m.c}, ${m.c}55)`, boxShadow: step === i ? `0 0 22px ${m.c}` : undefined, transform: step === i ? "scaleY(1.12)" : undefined }}>
            <span className="num block pt-1.5 text-[8px] font-bold opacity-70">{m.n}</span>
          </button>
        ))}
        <div className="absolute inset-x-3 top-1/2 h-px bg-white/5" />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn tone="violet" size="sm" onClick={play}><Play size={14} /> Play motif</Btn>
        <span className="text-[10px] leading-snug text-mist">Мотив повторяется в логотип-анимации, экране итогов и пуш-уведомлениях.</span>
      </div>
    </Asset>
  );
}

const haptics = [
  { n: "Tap", p: [8], c: "#3b82ff", use: "Кнопка" },
  { n: "Success", p: [12, 40, 12], c: "#22d39a", use: "Верный ответ" },
  { n: "Error", p: [30, 30, 30], c: "#ff4f6d", use: "Ошибка" },
  { n: "Reward", p: [20, 50, 20, 50, 40], c: "#ffc53d", use: "Лут, уровень" },
  { n: "Heavy", p: [60], c: "#8b5cff", use: "Модальное окно" },
  { n: "Countdown", p: [10, 90, 10, 90, 10], c: "#ff8a3d", use: "Таймер, дуэль" },
];
function Haptics() {
  const [active, setActive] = useState<string | null>(null);
  const fire = (n: string, p: number[]) => {
    setActive(n);
    try { navigator.vibrate?.(p); } catch { /* noop */ }
    setTimeout(() => setActive(null), p.reduce((a, b) => a + b, 0) + 80);
  };
  return (
    <Asset code="M-003" title="Haptic Patterns" desc="Шесть вибро-паттернов с визуализацией импульсов и зонами применения." hint="Потрогай паттерн" specs={["6 patterns", "vibration API", "fallback"]}>
      <div className="grid grid-cols-2 gap-2.5">
        {haptics.map((h) => (
          <button key={h.n} onClick={() => fire(h.n, h.p)} className={cn("relative overflow-hidden rounded-2xl bg-ink-800 p-3 text-left shadow-[0_3px_0_#08112a] transition active:translate-y-1 active:shadow-none", active === h.n && "ring-2")} style={active === h.n ? { borderColor: h.c } : undefined}>
            <div className="flex items-center gap-1.5">
              {h.p.map((v, i) => (
                <span key={i} className="w-1.5 rounded-full" style={{ height: Math.max(6, v * 0.9), background: h.c, opacity: active === h.n ? 1 : 0.55, transition: "opacity .2s" }} />
              ))}
              <Vibrate size={15} className="ml-auto" style={{ color: h.c }} />
            </div>
            <div className="mt-2 text-[11px] font-extrabold" style={{ color: h.c }}>{h.n}</div>
            <div className="text-[9px] text-mist">{h.use} · {h.p.join("/")} мс</div>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-ink-500 p-3 text-[10px] text-mist">
        На устройствах без вибрации интерфейс не теряет смысла: гаптика — усиление, а не единственный сигнал.
      </div>
    </Asset>
  );
}

function MixingDesk() {
  const [ch, setCh] = useState({ music: 35, sfx: 80, voice: 55, ui: 65 });
  const [duck, setDuck] = useState(true);
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMute(setM), []);
  return (
    <Asset code="M-004" title="Mixing Desk" desc="Микс: 4 канала с фейдерами, авто-приглушение музыки под SFX и общий мьют." hint="Двигай фейдеры" specs={["4 channels", "ducking", "master mute"]}>
      <div className="flex items-end justify-between gap-3 rounded-2xl bg-ink-900/60 p-4">
        {(["music", "sfx", "voice", "ui"] as const).map((k, i) => {
          const col = ["#8b5cff", "#22d39a", "#2bd9ff", "#ffc53d"][i];
          return (
            <div key={k} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative h-32 w-6 overflow-hidden rounded-full bg-ink-800 shadow-[inset_0_2px_4px_rgba(0,0,0,.5)]">
                <div className="absolute inset-x-0 bottom-0 rounded-full transition-all duration-200" style={{ height: `${ch[k]}%`, background: `linear-gradient(180deg, ${col}, ${col}77)`, boxShadow: `0 0 12px ${col}88` }} />
              </div>
              <input type="range" min={0} max={100} value={ch[k]} onChange={(e) => { setCh({ ...ch, [k]: +e.target.value }); sfx.tick(); }} className="h-1.5 w-full cursor-pointer" style={{ accentColor: col }} aria-label={k} />
              <span className="text-[9px] font-extrabold uppercase" style={{ color: col }}>{k}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button onClick={() => { const m = !muted; setMuted(m); setM(m); }} className={cn("flex h-11 items-center gap-2 rounded-xl px-3 text-[11px] font-extrabold uppercase", muted ? "bg-bear/15 text-bear" : "bg-ink-800 text-mist")}>
          <Power size={15} /> {muted ? "Muted" : "Active"}
        </button>
        <button onClick={() => { setDuck(!duck); sfx.toggle(!duck); }} className={cn("flex h-11 flex-1 items-center justify-between rounded-xl px-3 text-[11px] font-extrabold", duck ? "bg-sky/15 text-sky" : "bg-ink-800 text-mist")}>
          <span className="flex items-center gap-1.5"><Music4 size={14} /> Music ducking</span>
          <span className={cn("h-5 w-9 rounded-full p-0.5 transition", duck ? "bg-sky" : "bg-ink-600")}>
            <span className="block h-4 w-4 rounded-full bg-white transition-transform" style={{ transform: duck ? "translateX(16px)" : "none" }} />
          </span>
        </button>
      </div>
    </Asset>
  );
}

function AudioState() {
  const [bars, setBars] = useState<number[]>(() => [...Array(32)].map(() => Math.random()));
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setBars((b) => b.map((_, i) => 0.15 + Math.abs(Math.sin(Date.now() / 220 + i * 0.7)) * 0.85)), 90);
    return () => clearInterval(t);
  }, [playing]);
  return (
    <Asset code="M-005" title="Live Audio Visualiser" desc="Визуализатор звука интерфейса: реагирует на игру, отключается в тихом режиме." hint="Запусти визуализатор" specs={["32 bands", "90 ms", "mute-aware"]}>
      <div className="flex h-40 items-end gap-1 rounded-2xl bg-ink-900/60 p-3">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 rounded-t-md transition-all duration-100" style={{ height: `${(playing ? v : 0.12) * 100}%`, background: `linear-gradient(180deg, ${["#2bd9ff", "#3b82ff", "#8b5cff", "#ffc53d"][i % 4]}, transparent)` }} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <GhostBtn className="!h-11" onClick={() => setPlaying(false)}>Stop</GhostBtn>
        <Btn tone="cyan" className="!h-11" onClick={() => { setPlaying(true); sfx.levelUp(); }}><Waves size={15} /> Play</Btn>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Chip tone="bull">Ducking −12 dB</Chip>
        <Chip tone="gold">Headphone safe</Chip>
        <Chip tone="violet">Silent mode</Chip>
      </div>
    </Asset>
  );
}

export default function Audio() {
  return (
    <Section id="audio" index="13" title="Sound & Haptics" subtitle="Звуковая айдентика, гаптика, микс и тихий режим">
      <SoundPalette />
      <Motif />
      <Haptics />
      <MixingDesk />
      <AudioState />
    </Section>
  );
}
