import { useEffect, useRef, useState } from "react";
import { Play, Copy, Check, Vibrate, Hand, Hash } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip } from "../kit/ui";
import { AnimatedNumber, RollingNumber, SpringBar, useTrail } from "../kit/spring";
import { useLongPress, useDoubleTap, useSwipe } from "../kit/gestures";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ============ AN-01 EASING COMPOSER ============ */
const presets: [string, [number, number, number, number]][] = [
  ["Spring", [0.3, 1.6, 0.5, 1]],
  ["Snappy", [0.2, 1, 0.3, 1]],
  ["Smooth", [0.4, 0, 0.2, 1]],
  ["Bounce-ish", [0.3, 1.8, 0.4, 0.9]],
];
function EasingLab() {
  const [b, setB] = useState<[number, number, number, number]>([0.3, 1.6, 0.5, 1]);
  const [go, setGo] = useState(false);
  const [copied, setCopied] = useState(false);
  const css = `cubic-bezier(${b.map((x) => x.toFixed(2)).join(", ")})`;
  const run = () => { setGo(false); requestAnimationFrame(() => requestAnimationFrame(() => { setGo(true); sfxRaw.pop(); })); };
  return (
    <Asset code="AN-01" title="Easing Composer" desc="Собери свою кривую: 4 ползунка, живое превью гонки и готовый CSS для копирования." hint="Крути кривую" specs={["bezier", "race preview", "copy CSS"]}>
      <div className="grid grid-cols-2 gap-1.5">
        {presets.map(([n, v]) => <button key={n} onClick={() => { setB(v); sfx.tick(); }} className={cn("h-9 rounded-xl text-[10px] font-extrabold", JSON.stringify(b) === JSON.stringify(v) ? "bg-violet shadow-[0_3px_0_#5a33c7]" : "bg-ink-800 text-mist")}>{n}</button>)}
      </div>
      <div className="panel-inset relative mt-3 h-28 overflow-hidden !rounded-2xl">
        {[0, 1].map((r) => (
          <div key={r} className="absolute inset-x-3" style={{ top: 18 + r * 44 }}>
            <div className="mb-1 text-[9px] font-bold text-mist">{r ? "linear (reference)" : "your curve"}</div>
            <div className="relative h-4">
              <span className="absolute top-0 h-4 w-4 rounded-full" style={{ left: go ? "calc(100% - 16px)" : 0, background: r ? "#8a9bc4" : "#ffc53d", boxShadow: r ? undefined : "0 0 10px #ffc53d", transition: go ? `left 1.1s ${r ? "linear" : css}` : "none" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {b.map((v, i) => (
          <div key={i}>
            <div className="flex justify-between text-[10px] font-bold"><span className="text-mist">{["x1", "y1", "x2", "y2"][i]}</span><span className="num text-gold">{v.toFixed(2)}</span></div>
            <input type="range" min={i % 2 ? -1 : 0} max={i % 2 ? 2 : 1} step={0.01} value={v} onChange={(e) => { const n = [...b] as [number, number, number, number]; n[i] = +e.target.value; setB(n); }} className="h-1.5 w-full" style={{ accentColor: "#ffc53d" }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <code className="num flex-1 truncate rounded-xl bg-ink-900 px-3 py-2.5 text-[11px] text-sky">{css}</code>
        <button onClick={() => { navigator.clipboard?.writeText(css).catch(() => {}); setCopied(true); sfx.coin(); setTimeout(() => setCopied(false), 1200); }} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800">{copied ? <Check size={15} className="text-bull" /> : <Copy size={15} className="text-mist" />}</button>
        <Btn tone="gold" size="sm" className="!h-10 !text-[#3b2600]" onClick={run}><Play size={13} /> Run</Btn>
      </div>
    </Asset>
  );
}

/* ============ AN-02 SPRING TUNER ============ */
function SpringLab() {
  const [k, setK] = useState(170);
  const [d, setD] = useState(18);
  const [target, setTarget] = useState(0);
  const trail = useTrail(target, 5, k, d);
  const drop = () => { setTarget((t) => (t > 100 ? 0 : 220)); sfxRaw.thud(); };
  return (
    <Asset code="AN-02" title="Spring Tuner" desc="Жёсткость и демпфирование пружины: шарик со шлейфом показывает перелёт и затухание." hint="Урони шарик" specs={["stiffness", "damping", "trail"]}>
      <div className="panel-inset relative h-64 overflow-hidden !rounded-2xl">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="absolute left-1/2 h-10 w-10 -translate-x-1/2 rounded-full" style={{ top: 20 + trail[i], opacity: 1 - i * 0.18, transform: `translateX(${(i - 2) * 2}px) scale(${1 - i * 0.12})`, background: `linear-gradient(180deg, #ffd76b, #e08e0b)`, boxShadow: i === 0 ? "0 0 20px #ffc53d" : undefined }} />
        ))}
        <div className="absolute inset-x-8 bottom-4 h-2 rounded-full bg-ink-700" />
        <div className="absolute inset-x-8 h-2 rounded-full bg-bull/40" style={{ top: 20 + target + 40 }} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div><div className="mb-1 flex justify-between text-[10px] font-bold"><span className="text-mist">Stiffness</span><span className="num text-sky">{k}</span></div><input type="range" min={40} max={400} value={k} onChange={(e) => setK(+e.target.value)} className="h-2 w-full" style={{ accentColor: "#3b82ff" }} /></div>
        <div><div className="mb-1 flex justify-between text-[10px] font-bold"><span className="text-mist">Damping</span><span className="num text-gold">{d}</span></div><input type="range" min={4} max={40} value={d} onChange={(e) => setD(+e.target.value)} className="h-2 w-full" style={{ accentColor: "#ffc53d" }} /></div>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <Btn tone="gold" className="!text-[#3b2600]" onClick={drop}>Drop / lift</Btn>
        <GhostBtn onClick={() => { setK(170); setD(18); }}>Reset</GhostBtn>
      </div>
    </Asset>
  );
}

/* ============ AN-03 PARTICLE PLAYGROUND ============ */
function ParticleLab() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(60);
  const [speed, setSpeed] = useState(3);
  const [size, setSize] = useState(3);
  const [grav, setGrav] = useState(0.06);
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; life: number; c: string }[]>([]);
  const cfg = useRef({ count, speed, size, grav });
  cfg.current = { count, speed, size, grav };
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const cols = ["#22d39a", "#ffc53d", "#3b82ff", "#8b5cff", "#ff4f6d"];
    const burst = (x: number, y: number) => {
      const { count: n, speed: sp } = cfg.current;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, v = (0.5 + Math.random()) * sp;
        parts.current.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: 1, c: cols[i % cols.length] });
      }
      if (parts.current.length > 900) parts.current = parts.current.slice(-900);
    };
    (cv as HTMLCanvasElement & { _b?: (x: number, y: number) => void })._b = burst;
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.current = parts.current.filter((p) => p.life > 0);
      for (const p of parts.current) {
        p.vy += cfg.current.grav;
        p.x += p.vx; p.y += p.vy; p.life -= 0.012;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, cfg.current.size * p.life + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    burst(cv.width / 2, cv.height / 2);
    return () => cancelAnimationFrame(raf);
  }, []);
  const fire = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cv = ref.current!;
    const x = ((e.clientX - r.left) / r.width) * cv.width, y = ((e.clientY - r.top) / r.height) * cv.height;
    (cv as unknown as { _b: (x: number, y: number) => void })._b(x, y);
    sfxRaw.pop();
  };
  return (
    <Asset code="AN-03" title="Particle Playground" desc="Эмиттер частиц: клик — взрыв. Количество, скорость, размер и гравитация настраиваются." hint="Кликай по полю" specs={["canvas", "4 params", "click burst"]}>
      <canvas ref={ref} width={340} height={220} onPointerDown={fire} className="h-52 w-full cursor-crosshair rounded-2xl bg-ink-950" />
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {[["Count", count, 10, 150, setCount, "#3b82ff"], ["Speed", speed, 1, 8, setSpeed, "#22d39a"], ["Size", size, 1, 7, setSize, "#ffc53d"], ["Gravity", grav, 0, 0.25, setGrav, "#ff4f6d"]].map(([l, v, mn, mx, set, c]) => (
          <div key={l as string}>
            <div className="flex justify-between text-[10px] font-bold"><span className="text-mist">{l as string}</span><span className="num" style={{ color: c as string }}>{Number(v).toFixed(l === "Gravity" ? 2 : 0)}</span></div>
            <input type="range" min={mn as number} max={mx as number} step={l === "Gravity" ? 0.01 : 1} value={v as number} onChange={(e) => (set as (n: number) => void)(+e.target.value)} className="h-1.5 w-full" style={{ accentColor: c as string }} />
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* ============ AN-04 HAPTIC COMPOSER ============ */
type Seg = { k: "tap" | "pause" | "buzz"; ms: number };
function HapticLab() {
  const [seq, setSeq] = useState<Seg[]>([{ k: "tap", ms: 15 }, { k: "pause", ms: 60 }, { k: "tap", ms: 15 }]);
  const [playing, setPlaying] = useState<number | null>(null);
  const add = (k: Seg["k"]) => { setSeq((s) => [...s, { k, ms: k === "pause" ? 80 : k === "tap" ? 15 : 60 }].slice(-8)); sfx.tick(); };
  const play = () => {
    const pattern: number[] = [];
    seq.forEach((s, i) => { if (i > 0) pattern.push(seq[i - 1].k === "pause" ? seq[i - 1].ms : 30); if (s.k !== "pause") pattern.push(s.ms); });
    try { navigator.vibrate?.(pattern.length ? pattern : 10); } catch { /* noop */ }
    seq.forEach((_, i) => setTimeout(() => { setPlaying(i); setTimeout(() => setPlaying(null), 200); }, i * 220));
    sfxRaw.pop();
  };
  const total = seq.reduce((a, s) => a + s.ms, 0);
  return (
    <Asset code="AN-04" title="Haptic Composer" desc="Собери вибро-паттерн из блоков: тап, пауза, гул. Проигрывание — настоящая вибрация телефона." hint="Собери и проиграй" specs={["8 blocks", "real vibrate", "visual play"]}>
      <div className="flex min-h-[84px] flex-wrap items-end gap-1.5 rounded-2xl bg-ink-900/60 p-3">
        {seq.map((s, i) => (
          <button key={i} onClick={() => { setSeq(seq.filter((_, k) => k !== i)); sfx.soft(); }} title="tap to remove" className={cn("rounded-lg transition-all", playing === i && "scale-110 ring-2 ring-white")} style={{ width: Math.max(26, s.ms * 0.5), height: s.k === "pause" ? 22 : s.k === "tap" ? 44 : 62, background: s.k === "pause" ? "#273f75" : s.k === "tap" ? "#3b82ff" : "#ff8a3d", boxShadow: playing === i ? "0 0 14px #fff" : undefined }}>
            <span className="num block pt-1 text-center text-[8px] font-bold text-white/80">{s.ms}</span>
          </button>
        ))}
        {!seq.length && <span className="text-[11px] text-mist">Пусто — добавь блоки ниже</span>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <button onClick={() => add("tap")} className="h-10 rounded-xl bg-sky/20 text-[11px] font-extrabold text-sky ring-1 ring-sky/40 active:translate-y-0.5">+ Tap</button>
        <button onClick={() => add("pause")} className="h-10 rounded-xl bg-ink-700 text-[11px] font-extrabold text-mist active:translate-y-0.5">+ Pause</button>
        <button onClick={() => add("buzz")} className="h-10 rounded-xl bg-ember/20 text-[11px] font-extrabold text-ember ring-1 ring-ember/40 active:translate-y-0.5">+ Buzz</button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Btn tone="violet" className="flex-1" onClick={play}><Vibrate size={14} /> Play · {total}ms</Btn>
        <GhostBtn className="!h-12" onClick={() => setSeq([])}>Clear</GhostBtn>
      </div>
    </Asset>
  );
}

/* ============ AN-05 GESTURE LAB ============ */
function GestureLab() {
  const [log, setLog] = useState<string[]>(["Жду жестов…"]);
  const [pad, setPad] = useState({ x: 0, y: 0, s: 1 });
  const push = (t: string) => { setLog((l) => [t, ...l].slice(0, 5)); };
  const long = useLongPress(() => { push("⏱ long-press fired"); sfx.levelUp(); }, 700);
  const dbl = useDoubleTap(() => { push("👆👆 double-tap"); sfx.coin(); });
  const swipe = useSwipe((d, v) => { push(`↔ swipe ${d} · ${Math.round(v)}px/s`); sfxRaw.swipe(); });
  return (
    <Asset code="AN-05" title="Gesture Lab" desc="Песочница жестов: свайпы со скоростью, долгое нажатие с прогрессом, дабл-тап. Всё логируется." hint="Жестикулируй на паде" specs={["swipe", "long-press", "double-tap"]}>
      <div
        className="relative grid h-52 touch-none select-none place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-ink-500 bg-ink-900/60"
        style={{ transform: `translate(${pad.x}px, ${pad.y}px) scale(${pad.s})` }}
        onPointerDown={(e) => { long.bind.onPointerDown(); swipe.onPointerDown(e); dbl(e); }}
        onPointerUp={(e) => { long.bind.onPointerUp(); swipe.onPointerUp(e); }}
        onPointerLeave={() => long.bind.onPointerLeave()}
        onPointerMove={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setPad((p) => ({ ...p, x: (e.clientX - r.left - r.width / 2) * 0.06, y: (e.clientY - r.top - r.height / 2) * 0.06 })); }}
      >
        <div className="text-center">
          <Hand size={40} className="mx-auto text-sky anim-float" />
          <div className="mt-2 text-[12px] font-extrabold">Gesture pad</div>
          <div className="text-[10px] text-mist">swipe · hold · double-tap</div>
        </div>
        {long.p > 0 && (
          <svg viewBox="0 0 100 100" className="absolute h-36 w-36 -rotate-90">
            <circle cx="50" cy="50" r="44" stroke="#273f75" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r="44" stroke="#ffc53d" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - long.p)} />
          </svg>
        )}
      </div>
      <div className="mt-3 space-y-1">
        {log.map((l, i) => <div key={`${l}-${i}`} className={cn("num anim-slide-right rounded-lg px-2.5 py-1.5 text-[11px]", i === 0 ? "bg-sky/15 text-sky" : "bg-ink-800 text-mist")}>{l}</div>)}
      </div>
    </Asset>
  );
}

/* ============ AN-06 NUMBER LAB ============ */
function NumberLab() {
  const [v, setV] = useState(1240);
  const bump = () => setV((x) => x + Math.round(50 + Math.random() * 400));
  return (
    <Asset code="AN-06" title="Number Choreography" desc="Три способа показать число: пружина, переворот цифры и пружинящий бар. Жми и сравни." hint="Накрути счётчик" specs={["spring", "rolling", "spring bar"]}>
      <div className="space-y-3 rounded-2xl bg-ink-900/60 p-4">
        <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] font-bold text-mist"><Hash size={12} /> Spring</span><AnimatedNumber value={v} className="num text-2xl font-extrabold text-gold" /></div>
        <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-[11px] font-bold text-mist"><Hash size={12} /> Rolling</span><RollingNumber value={v} className="num text-2xl font-extrabold text-sky" /></div>
        <div><div className="mb-1 text-[11px] font-bold text-mist">Spring bar → {v % 100}%</div><SpringBar value={v % 100} color="#22d39a" h={14} /></div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Btn tone="gold" size="sm" className="!text-[#3b2600]" onClick={bump}>+ random</Btn>
        <Btn tone="bull" size="sm" onClick={() => setV((x) => x + 1000)} silent>+1000</Btn>
        <GhostBtn className="!h-10 !text-[11px]" onClick={() => setV(0)}>Reset</GhostBtn>
      </div>
      <div className="mt-3 flex gap-1.5"><Chip tone="gold">150 stiffness</Chip><Chip tone="sky">roll 300ms</Chip><Chip tone="bull">overshoot</Chip></div>
    </Asset>
  );
}

export default function PlayLab() {
  return (
    <Section id="animlab" index="AN" title="Animation Lab" subtitle="Конструкторы движения: кривые, пружины, частицы, вибрация, жесты, числа">
      <EasingLab />
      <SpringLab />
      <ParticleLab />
      <HapticLab />
      <GestureLab />
      <NumberLab />
    </Section>
  );
}
