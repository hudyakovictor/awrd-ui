import { useEffect, useState, type CSSProperties } from "react";
import { Asset, Bar, Btn3D, Section, Toggle, useToast } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx, isSfxEnabled, setSfxEnabled, haptic, type SfxName } from "../utils/sfx";
import { isMusicOn, setMusicEnabled, fanfare } from "../utils/music";
import { burstConfetti, burstSparks, burstStars, burstRing } from "../utils/fx";

/* ---------- SFX console ---------- */
const SFX_LIST: { k: SfxName; l: string; d: string }[] = [
  { k: "tap", l: "Tap", d: "любое нажатие" },
  { k: "pop", l: "Pop", d: "выбор, лайк" },
  { k: "toggle", l: "Toggle", d: "свитчи" },
  { k: "success", l: "Success", d: "верный ответ" },
  { k: "error", l: "Error", d: "ошибка, shake" },
  { k: "coin", l: "Coin", d: "монеты, XP" },
  { k: "whoosh", l: "Whoosh", d: "переходы" },
  { k: "tick", l: "Tick", d: "слайдеры, таймер" },
  { k: "levelUp", l: "Level Up", d: "победа" },
];
function SfxConsole() {
  const [on, setOn] = useState(isSfxEnabled());
  const [mus, setMus] = useState(isMusicOn());
  const [playing, setPlaying] = useState<SfxName | null>(null);
  const toast = useToast();
  const play = (k: SfxName) => {
    if (!on) { toast({ type: "warning", title: "SFX выключены", msg: "Включите звук, чтобы слушать", dur: 2500 }); return; }
    sfx[k]();
    setPlaying(k);
    setTimeout(() => setPlaying(null), 350);
  };
  return (
    <Asset title="SFX Console" id="jux.sfx" desc="Вся библиотека звуков с превью. Переключатели управляют настоящим звуком всего каталога." tags={["LIVE"]} className="lg:col-span-2">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Toggle on={on} onChange={(v) => { setOn(v); setSfxEnabled(v); if (v) sfx.pop(); }} />
        <span className="text-[13px] font-extrabold">SFX {on ? "ON" : "OFF"}</span>
        <span className="w-px h-6 bg-white/10" />
        <Toggle on={mus} onChange={(v) => { setMus(v); setMusicEnabled(v); }} />
        <span className="text-[13px] font-extrabold">Music {mus ? "ON" : "OFF"}</span>
        {mus && <span className="flex items-end gap-[2px] h-4">{[0, 1, 2, 3, 4].map((i) => <i key={i} className="w-1 bg-violet rounded-full" style={{ animation: `floaty .7s ${i * 0.12}s ease-in-out infinite`, height: "100%" }} />)}</span>}
        <Btn3D size="xs" variant="gold" className="ml-auto" icon={<Icon name="sparkles" size={12} />} onClick={() => { if (!on) { setOn(true); setSfxEnabled(true); } fanfare(); toast({ type: "xp", title: "Fanfare!", msg: "Победная мелодия" }); }}>Fanfare</Btn3D>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {SFX_LIST.map((s) => (
          <button key={s.k} onClick={() => play(s.k)} className={cn("inset p-3 text-left transition-all hover:-translate-y-0.5", playing === s.k && "!border-gold/60 anim-pop")}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-extrabold">{s.l}</span>
              <span className={cn("flex gap-[2px] h-3.5", playing === s.k ? "opacity-100" : "opacity-30")}>{[0, 1, 2].map((i) => <i key={i} className={cn("w-[3px] rounded-full", playing === s.k ? "bg-gold" : "bg-dim")} style={{ height: `${[60, 100, 45][i]}%`, animation: playing === s.k ? `floaty .5s ${i * 0.1}s ease-in-out infinite` : "none" }} />)}</span>
            </div>
            <div className="text-[10.5px] text-dim mt-0.5">{s.d}</div>
          </button>
        ))}
      </div>
      <div className="text-[11px] text-dim mt-3">Все звуки синтезируются WebAudio в реальном времени — без сэмплов, 0 Байте аудио в бандле.</div>
    </Asset>
  );
}

/* ---------- Haptics patterns ---------- */
const PATTERNS: { l: string; ms: number | number[]; d: string }[] = [
  { l: "Tap", ms: 8, d: "кнопки, чипы" },
  { l: "Toggle", ms: 6, d: "свитчи" },
  { l: "Success", ms: [15, 30, 45], d: "верный ответ" },
  { l: "Error", ms: [40, 30, 40], d: "ошибка + shake" },
  { l: "Reward", ms: [30, 40, 90], d: "награда, сундук" },
  { l: "Rumble", ms: 250, d: "долгое удержание" },
];
function HapticsLab() {
  const [test, setTest] = useState<string | null>(null);
  return (
    <Asset title="Haptic Patterns" id="jux.haptics" desc="Вибрационные паттерны игры. На телефоне — реальный отклик, на десктопе — подсвечка.">
      <div className="grid grid-cols-2 gap-2.5">
        {PATTERNS.map((p) => (
          <button key={p.l} onClick={() => { haptic(p.ms); setTest(p.l); sfx.tick(); setTimeout(() => setTest(null), 400); }}
            className={cn("opt p-3 text-left", test === p.l && "data-active")} data-state={test === p.l ? "correct" : undefined}>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-extrabold">{p.l}</span>
              {test === p.l && <span className="ml-auto flex gap-0.5">{[0, 1, 2].map((i) => <i key={i} className="size-1.5 rounded-full bg-bull" style={{ animation: `dot-bounce .5s ${i * 0.07}s infinite` }} />)}</span>}
            </div>
            <div className="text-[10.5px] text-dim mt-0.5">{p.d} · <span className="num">{Array.isArray(p.ms) ? p.ms.join(", ") : p.ms}ms</span></div>
          </button>
        ))}
      </div>
      <div className="text-[11px] text-dim mt-3">Navigator.vibrate с массивом паттернов — тактильный «язык» эмоций игры.</div>
    </Asset>
  );
}

/* ---------- Squash & stretch ---------- */
function SquashLab() {
  const [n, setN] = useState(0);
  return (
    <Asset title="Squash & Stretch" id="jux.squash" desc="Классический принцип анимации: кнопка сжимается по оси нажатия и «пружинит» обратно.">
      <div className="flex flex-col items-center gap-6 pt-2">
        <div className="flex items-end gap-5">
          <div className="text-center">
            <Btn3D variant="blue" size="lg" className="!px-8" onClick={() => setN(n + 1)} sound="pop">Classic</Btn3D>
            <div className="label-caps mt-2">translate-y</div>
          </div>
          <div className="text-center">
            <button onClick={() => { setN(n + 1); sfx.pop(); haptic(8); }}
              className="btn3d h-14 px-7 text-[14px] active:scale-x-[1.14] active:scale-y-[0.82] active:translate-y-0"
              style={{ "--top": "#5af5b4", "--base": "#1fdb8b", "--lip": "#0d9a5c", "--fg": "#03261a", transformOrigin: "bottom" } as CSSProperties}>
              Squash
            </button>
            <div className="label-caps mt-2">scale x/y</div>
          </div>
          <div className="text-center">
            <button onClick={() => { setN(n + 1); sfx.levelUp(); haptic([15, 20, 30]); burstStars(innerWidth / 2, innerHeight / 2, 8); }}
              className="relative">
              <span key={n} className="absolute inset-0 rounded-[18px] bg-gold/60 -z-10" style={{ animation: n ? "pulse-ring .7s" : "none" }} />
              <Btn3D variant="gold" size="lg" className="!px-8 !rounded-[18px]" sound="none">Spring</Btn3D>
            </button>
            <div className="label-caps mt-2">ring burst</div>
          </div>
        </div>
        <div className="inset px-4 py-2.5 flex items-center gap-3 w-full justify-center">
          <span className="text-[11px] font-bold text-dim">Нажатий:</span>
          <span key={n} className="num text-[18px] font-extrabold anim-pop">{n}</span>
          <span className="text-[11px] text-dim">— каждая с обратной связью</span>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- FPS meter ---------- */
function FpsMeter() {
  const [fps, setFps] = useState(60);
  const [testing, setTesting] = useState(false);
  useEffect(() => {
    let raf = 0, count = 0, last = performance.now();
    const loop = (t: number) => {
      count++;
      if (t - last >= 500) { setFps(Math.min(120, Math.round((count * 1000) / (t - last)))); count = 0; last = t; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const test = () => {
    setTesting(true);
    const w = innerWidth, h = innerHeight;
    for (let i = 0; i < 6; i++) setTimeout(() => { burstConfetti(w * (0.2 + Math.random() * 0.6), h * (0.2 + Math.random() * 0.5), 60, 1.2); burstSparks(w / 2, h / 2, 40); burstRing(w / 2, h / 2, i % 2 ? "#8d5cff" : "#1fdb8b", 260); }, i * 130);
    sfx.whoosh();
    setTimeout(() => setTesting(false), 900);
  };
  const tone = fps >= 55 ? "bull" : fps >= 40 ? "gold" : "bear";
  return (
    <Asset title="Perf · FPS Meter" id="jux.fps" desc="Реальный счётчик кадров. Load test выбрасывает ~500 частиц — canvas держит 60fps.">
      <div className="flex items-center gap-5">
        <div className="relative size-24 shrink-0">
          <svg viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#0a1330" strokeWidth="12" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={tone === "bull" ? "#1fdb8b" : tone === "gold" ? "#ffc53d" : "#ff4d6a"} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(Math.min(fps, 120) / 120) * 264} 264`} style={{ transition: "stroke-dasharray .4s" }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div><span className="num text-[26px] font-extrabold block leading-none">{fps}</span><span className="text-[9px] font-extrabold text-dim uppercase">fps</span></div>
          </div>
        </div>
        <div className="flex-1">
          <Bar value={(Math.min(fps, 120) / 120) * 100} tone={tone} h={12} />
          <div className="text-[11.5px] text-mute font-semibold mt-2 leading-snug">{testing ? "Load test идёт… наблюдайте счётчик." : "Метрика реального времени: rAF-цикл считает кадры каждые 500 мс."}</div>
          <Btn3D size="sm" variant="violet" className="mt-3" icon={<Icon name="bolt" size={14} />} onClick={test} disabled={testing}>{testing ? "Testing…" : "Load test · 500 particles"}</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Motion settings ---------- */
function MotionLab() {
  const [reduced, setReduced] = useState(false);
  const apply = (v: boolean) => {
    setReduced(v);
    document.documentElement.classList.toggle("reduce-motion", v);
    sfx.tap();
  };
  return (
    <Asset title="Motion Control" id="jux.motion" desc="Управляет анимациями всего каталога — включая системный prefers-reduced-motion.">
      <div className="inset p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-extrabold">Reduced Motion</div>
            <div className="text-[11px] text-mute mt-0.5">Отключает все анимации и частицы (доступность)</div>
          </div>
          <Toggle on={reduced} onChange={apply} tone="blue" />
        </div>
        <div className="flex gap-2 mt-4">
          <Btn3D size="sm" full variant={reduced ? "neutral" : "bull"} onClick={() => { burstConfetti(innerWidth / 2, innerHeight / 2, 30, 0.9); sfx.pop(); }}>Test burst</Btn3D>
          <Btn3D size="sm" variant="neutral" onClick={() => apply(!reduced)}>{reduced ? "Enable motion" : "Disable"}</Btn3D>
        </div>
        <div className={cn("mt-4 h-10 rounded-xl inset grid place-items-center overflow-hidden", !reduced && "shine")}>
          <span className={cn("text-[11.5px] font-extrabold", reduced ? "text-dim" : "text-mute")}>
            {reduced ? "Анимации отключены: всё статично, но функционально" : "Анимации включены: shine бегает по панели"}
          </span>
        </div>
      </div>
    </Asset>
  );
}

export default function JuiceLab() {
  return (
    <Section id="juice" index="20" title="Juice Lab" subtitle="Испытательная: звук, вибрация, squash & stretch, производительность, доступность" count={5}>
      <div className="grid lg:grid-cols-3 gap-6">
        <SfxConsole />
        <HapticsLab />
        <SquashLab />
        <FpsMeter />
        <MotionLab />
      </div>
    </Section>
  );
}
