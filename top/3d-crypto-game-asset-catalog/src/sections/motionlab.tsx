import { useEffect, useRef, useState } from "react";
import { Carousel, type CarouselVariant } from "../components/Carousel";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip, Label, Toggle } from "../components/ui";
import { Mascot, CoinArt, GemArt } from "../components/art";
import { EASINGS, EASE_CSS } from "../lib/motion";
import { useDrag } from "../lib/gestures";
import { tap, sfx, haptic, notify, clamp } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   J — ЛАБОРАТОРИЯ ДВИЖЕНИЯ: крути физику и забирай код.
   ═══════════════════════════════════════════════════════════════════ */

/* ── J01 · Пружина: жёсткость и демпфер ── */
export function SpringTuner() {
  const [stiff, setStiff] = useState(0.14);
  const [damp, setDamp] = useState(0.7);
  const [target, setTarget] = useState(70);
  const [pos, setPos] = useState(70);
  const [trail, setTrail] = useState<number[]>([]);
  const st = useRef({ v: 70, vel: 0 });
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const step = () => {
      const s = st.current;
      s.vel = s.vel * damp + (target - s.v) * stiff;
      s.v += s.vel;
      setPos(s.v);
      setTrail((t) => [...t.slice(-40), s.v]);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, stiff, damp]);
  const presets: [string, number, number][] = [["Мягко", 0.06, 0.82], ["Стандарт", 0.14, 0.7], ["Жёстко", 0.3, 0.6], ["Желе", 0.2, 0.45]];
  const overshoot = Math.max(0, ...trail.map((v) => (v - target) * Math.sign(target - 70 || 1)));
  return (
    <div>
      <div
        ref={box}
        className="well relative h-44 cursor-pointer overflow-hidden"
        onClick={(e) => {
          const r = box.current!.getBoundingClientRect();
          const t = clamp(((e.clientX - r.left) / r.width) * 100, 6, 94);
          setTarget(t); setTrail([]); tap("tick");
        }}
      >
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <polyline points={trail.map((v, i) => `${(i / 40) * 100},${52 - (v / 100) * 44}`).join(" ")} fill="none" stroke="#9A6BFF" strokeWidth="1" opacity=".8" />
          <line x1="0" x2="100" y1={52 - (target / 100) * 44} y2={52 - (target / 100) * 44} stroke="#2BE38B" strokeDasharray="2 1.5" strokeWidth=".6" />
        </svg>
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${target}%` }}>
          <div className="size-3 -translate-x-1/2 rounded-full bg-bull shadow-[0_0_12px_var(--color-bull)]" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${pos}%` }}>
          <div className="flex size-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-gradient-to-b from-[#C9A8FF] to-violet shadow-[0_5px_0_var(--color-violet-d)]">
            <Mascot size={44} mood="happy" />
          </div>
        </div>
        <div className="absolute bottom-2 left-3 font-mono text-[10px] text-ink-400">клик — новая цель · перелёт {overshoot.toFixed(1)}%</div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Жёсткость {stiff.toFixed(2)}</Label>
          <input type="range" min={0.02} max={0.4} step={0.01} value={stiff} onChange={(e) => setStiff(+e.target.value)} className="rng" aria-label="жёсткость" />
        </div>
        <div>
          <Label>Демпфер {damp.toFixed(2)}</Label>
          <input type="range" min={0.3} max={0.95} step={0.01} value={damp} onChange={(e) => setDamp(+e.target.value)} className="rng" aria-label="демпфер" />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {presets.map(([t, s, d]) => (
          <button key={t} onClick={() => { tap("tick"); setStiff(s); setDamp(d); }} className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", stiff === s && damp === d ? "bg-violet text-white" : "bg-ink-800 text-ink-300")}>{t}</button>
        ))}
        <button className="ml-auto flex items-center gap-1 rounded-xl bg-ink-800 px-3 py-1.5 text-[12px] font-bold text-ink-300" onClick={() => { navigator.clipboard?.writeText(`useSpringValue(target, ${stiff.toFixed(2)}, ${damp.toFixed(2)})`).catch(() => {}); notify("Параметры пружины скопированы", "success"); }}>
          <Icon name="copy" size={14} />Код
        </button>
      </div>
    </div>
  );
}

/* ── J02 · Кривые: гонка точек ── */
const CURVES: { k: string; css: string; d: string }[] = [
  { k: "spring", css: EASE_CSS.spring, d: "появления, масштаб" },
  { k: "out", css: EASE_CSS.out, d: "цвет, позиция" },
  { k: "snap", css: EASE_CSS.snap, d: "переходы экранов" },
  { k: "smooth", css: EASE_CSS.smooth, d: "фоны, оверлеи" },
];

export function EasingLab() {
  const [go, setGo] = useState(false);
  const [dur, setDur] = useState(900);
  const [sel, setSel] = useState("spring");
  const curve = (fn: (t: number) => number) => Array.from({ length: 40 }, (_, i) => { const t = i / 39; return `${t * 100},${100 - fn(t) * 92 - 4}`; }).join(" ");
  return (
    <div>
      <div className="space-y-2.5">
        {CURVES.map((c) => (
          <button key={c.k} onClick={() => { tap("tick"); setSel(c.k); }} className={cn("grid w-full grid-cols-[92px_1fr_64px] items-center gap-3 rounded-2xl p-2 text-left transition-colors", sel === c.k ? "bg-sky/10 ring-1 ring-sky/40" : "hover:bg-white/[.03]")}>
            <span><span className="block font-mono text-[12px] font-bold">{c.k}</span><span className="block text-[10px] text-ink-400">{c.d}</span></span>
            <span className="well relative block h-9 overflow-hidden">
              <span className="absolute top-1 size-7 rounded-lg bg-gradient-to-b from-white to-ink-100 shadow-[0_3px_0_#8aa0d4]" style={{ left: go ? "calc(100% - 34px)" : "4px", transition: `left ${dur}ms ${c.css}` }} />
            </span>
            <svg viewBox="0 0 100 100" className="h-9 w-16 rounded-lg bg-ink-900">
              <polyline points={curve(EASINGS[c.k === "spring" ? "back" : c.k === "out" ? "out" : c.k === "snap" ? "snap" : "inOut"])} fill="none" stroke={sel === c.k ? "#3D9BFF" : "#30508F"} strokeWidth="3" />
            </svg>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Label className="mb-0 w-24">{dur} мс</Label>
        <input type="range" min={200} max={2000} step={50} value={dur} onChange={(e) => setDur(+e.target.value)} className="rng flex-1" aria-label="длительность" />
        <Btn s="sm" v="sky" icon="play" onClick={() => { sfx("whoosh"); setGo(!go); }}>Гонка</Btn>
      </div>
      <div className="code mt-3 rounded-xl bg-ink-950 p-3">transition: all <span className="n">{dur}ms</span> <span className="s">{EASE_CSS[sel]}</span>;</div>
    </div>
  );
}

/* ── J03 · Конструктор карусели ── */
const DEMO = [
  { t: "Слайд 1", hex: "#2BE38B", icon: "trendUp" as IconName },
  { t: "Слайд 2", hex: "#3D9BFF", icon: "candle" as IconName },
  { t: "Слайд 3", hex: "#FFC940", icon: "trophy" as IconName },
  { t: "Слайд 4", hex: "#9A6BFF", icon: "gift" as IconName },
];

export function CarouselLab() {
  const [variant, setVariant] = useState<CarouselVariant>("slide");
  const [loop, setLoop] = useState(true);
  const [auto, setAuto] = useState(false);
  const [arrows, setArrows] = useState(true);
  const [dots, setDots] = useState(true);
  const [counter, setCounter] = useState(true);
  const [prog, setProg] = useState(false);
  const [gap, setGap] = useState(16);
  const code = `<Carousel variant="${variant}"${loop ? " loop" : ""}${auto ? " autoplay" : ""}${arrows ? "" : " arrows={false}"}${dots ? "" : " dots={false}"}${counter ? " counter" : ""}${prog ? " progress" : ""} gap={${gap}}>`;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div key={`${variant}-${loop}-${auto}-${arrows}-${dots}-${counter}-${prog}-${gap}`}>
        <Carousel variant={variant} loop={loop} autoplay={auto} autoplayMs={2500} arrows={arrows} dots={dots} counter={counter} progress={prog} gap={gap} label="Конструктор" height={220} className="rounded-3xl">
          {DEMO.map((d) => (
            <div key={d.t} className="flex h-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-ink-700 to-ink-850 ring-1 ring-white/10">
              <span className="flex size-14 items-center justify-center rounded-2xl text-ink-900" style={{ background: d.hex }}><Icon name={d.icon} size={26} stroke={2.4} /></span>
              <span className="mt-2 font-display text-sm font-black">{d.t}</span>
            </div>
          ))}
        </Carousel>
        <div className="code mt-3 overflow-x-auto whitespace-pre rounded-xl bg-ink-950 p-3">{code}</div>
        <Btn s="xs" v="ghost" icon="copy" className="mt-2" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); notify("Код скопирован", "success"); }}>Копировать</Btn>
      </div>
      <div className="space-y-3">
        <div>
          <Label>Вариант</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(["slide", "fade", "coverflow", "cube", "stack", "vertical", "peek"] as CarouselVariant[]).map((v) => (
              <button key={v} onClick={() => { tap("tick"); setVariant(v); }} className={cn("rounded-xl px-2 py-2 font-mono text-[11px] font-bold", variant === v ? "bg-sky text-white shadow-[0_3px_0_var(--color-sky-d)]" : "bg-ink-850 text-ink-300")}>{v}</button>
            ))}
          </div>
        </div>
        <div className="panel-soft divide-y divide-white/5">
          {([["loop", "Бесконечность", loop, setLoop], ["auto", "Автоплей", auto, setAuto], ["arrows", "Стрелки", arrows, setArrows], ["dots", "Точки", dots, setDots], ["counter", "Счётчик", counter, setCounter], ["prog", "Прогресс", prog, setProg]] as const).map(([k, t, v, set]) => (
            <div key={k} className="flex items-center justify-between px-3 py-2">
              <span className="text-[12px] font-bold">{t}</span>
              <Toggle on={v} onChange={set} tone="sky" label={t} />
            </div>
          ))}
        </div>
        <div>
          <Label>Зазор {gap}px</Label>
          <input type="range" min={0} max={32} value={gap} onChange={(e) => setGap(+e.target.value)} className="rng" aria-label="зазор" />
        </div>
      </div>
    </div>
  );
}

/* ── J04 · Бросок: скорость, трение, отскок ── */
export function FlingLab() {
  const box = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  const [vel, setVel] = useState({ x: 0, y: 0 });
  const [friction, setFriction] = useState(2.2);
  const [bounce, setBounce] = useState(true);
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const anim = useRef(0);
  const fire = (vx: number, vy: number) => {
    cancelAnimationFrame(anim.current);
    let x = p.x, y = p.y, cx = vx / 16, cy = vy / 16;
    const R = 110;
    const step = () => {
      cx *= 1 - friction * 0.016;
      cy *= 1 - friction * 0.016;
      x += cx; y += cy;
      const d = Math.hypot(x, y);
      if (d > R) {
        if (bounce) {
          const nx = x / d, ny = y / d;
          const dot = cx * nx + cy * ny;
          cx -= 2 * dot * nx; cy -= 2 * dot * ny;
          cx *= 0.72; cy *= 0.72;
          x = nx * R; y = ny * R;
          sfx("tick"); haptic(8);
        } else { x = (x / d) * R; y = (y / d) * R; cx = 0; cy = 0; }
      }
      setP({ x, y });
      setVel({ x: cx * 16, y: cy * 16 });
      setTrail((t) => [...t.slice(-24), { x, y }]);
      if (Math.hypot(cx, cy) > 0.15) anim.current = requestAnimationFrame(step);
      else { setVel({ x: 0, y: 0 }); }
    };
    anim.current = requestAnimationFrame(step);
  };
  const d = useDrag({
    threshold: 0,
    onMove: (i) => {
      const nx = clamp(i.dx, -110, 110), ny = clamp(i.dy, -110, 110);
      setP({ x: nx, y: ny });
      setVel({ x: i.vx, y: i.vy });
      setTrail((t) => [...t.slice(-24), { x: nx, y: ny }]);
    },
    onEnd: (i) => { haptic(10); fire(i.vx, i.vy); },
  });
  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  const speed = Math.hypot(vel.x, vel.y);
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div ref={box} className="relative mx-auto size-64 shrink-0 rounded-full well">
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-ink-600" />
        <svg viewBox="-120 -120 240 240" className="absolute inset-0 h-full w-full">
          <polyline points={trail.map((t) => `${t.x},${t.y}`).join(" ")} fill="none" stroke="#3D9BFF" strokeWidth="3" opacity=".6" strokeLinecap="round" />
          {speed > 60 && <line x1={p.x} y1={p.y} x2={p.x + (vel.x / speed) * 46} y2={p.y + (vel.y / speed) * 46} stroke="#FFC940" strokeWidth="4" strokeLinecap="round" />}
        </svg>
        <div
          onPointerDown={d.onPointerDown}
          className="absolute left-1/2 top-1/2 cursor-grab active:cursor-grabbing"
          style={{ transform: `translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px))`, touchAction: "none" }}
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-b from-[#8CCBFF] to-sky shadow-[0_6px_0_var(--color-sky-d),0_14px_24px_rgba(0,0,0,.5)]">
            <CoinArt size={34} />
          </div>
        </div>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-950/80 px-2 py-0.5 font-mono text-[10px]">v = {Math.round(speed)} px/s</div>
      </div>
      <div>
        <div className="text-sm font-bold">Швырни монету — она полетит по инерции</div>
        <div className="mt-3 space-y-3">
          <div>
            <Label>Трение {friction.toFixed(1)}</Label>
            <input type="range" min={0.4} max={5} step={0.1} value={friction} onChange={(e) => setFriction(+e.target.value)} className="rng" aria-label="трение" />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-ink-850 px-3 py-2.5">
            <span className="text-[13px] font-bold">Отскок от края</span>
            <Toggle on={bounce} onChange={setBounce} tone="gold" label="отскок" />
          </div>
          <div className="flex gap-2">
            <Chip tone="sky">бросок по скорости</Chip>
            <Chip tone="gold">rAF-физика</Chip>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-ink-400"><GemArt size={18} />Та же физика крутит свайп-колоду G01 и шторку G05</div>
        </div>
      </div>
    </div>
  );
}
