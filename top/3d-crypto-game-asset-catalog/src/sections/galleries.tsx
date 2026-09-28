import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { Mascot, CoinArt, GemArt } from "../components/art";
import { SkylineScene, LeagueBadge } from "../components/art2";
import { useDrag } from "../lib/gestures";
import { tap, sfx, haptic } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   H — ГАЛЕРЕИ И ПРОСМОТР: до/после, лайтбокс, скины, Ken Burns, лупа.
   ═══════════════════════════════════════════════════════════════════ */

/* ── H01 · До / После: риск портфеля ── */
function Donut({ w, c }: { w: number[]; c: string[] }) {
  const R = 40, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg viewBox="0 0 100 100" className="size-36 -rotate-90">
      <circle cx="50" cy="50" r={R} fill="none" stroke="#081229" strokeWidth="16" />
      {w.map((x, i) => {
        const len = (x / 100) * C;
        const el = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={c[i]} strokeWidth="16" strokeDasharray={`${len - 1.5} ${C}`} strokeDashoffset={-acc} />;
        acc += len;
        return el;
      })}
    </svg>
  );
}

export function BeforeAfter() {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const set = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)));
  };
  const d = useDrag({ threshold: 0, onMove: (i) => set(i.x), onStart: (i) => set(i.x) });
  const before = { w: [10, 15, 70, 5], risk: 81, label: "До курса", mood: "sad" as const };
  const after = { w: [40, 25, 15, 20], risk: 44, label: "После курса", mood: "hype" as const };
  const cols = ["#F7931A", "#8C8CFF", "#FF4D6D", "#2BE38B"];
  return (
    <div>
      <div
        ref={box}
        onPointerDown={d.onPointerDown}
        className="relative h-72 cursor-ew-resize select-none overflow-hidden rounded-3xl ring-1 ring-white/10"
        style={{ touchAction: "none" }}
        role="slider"
        aria-label="Сравнение до и после"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") { e.preventDefault(); setPos((p) => Math.max(4, p - 4)); }
          if (e.key === "ArrowRight") { e.preventDefault(); setPos((p) => Math.min(96, p + 4)); }
        }}
      >
        {/* AFTER — нижний слой */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-bull/20 to-ink-900 p-5">
          <Chip tone="bull">{after.label}</Chip>
          <div className="relative mt-2">
            <Donut w={after.w} c={cols} />
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-2xl font-black text-bull">{after.risk}</span><span className="text-[9px] font-bold uppercase text-ink-400">риск</span></div>
          </div>
          <div className="mt-1 text-[11px] text-ink-300">BTC 40 · ETH 25 · альты 15 · USDT 20</div>
        </div>
        {/* BEFORE — верхний, обрезанный */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-bear/25 to-ink-900 p-5" style={{ width: box.current?.clientWidth ? `${box.current.clientWidth}px` : "100%" }}>
            <Chip tone="bear">{before.label}</Chip>
            <div className="relative mt-2">
              <Donut w={before.w} c={cols} />
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-2xl font-black text-bear">{before.risk}</span><span className="text-[9px] font-bold uppercase text-ink-400">риск</span></div>
            </div>
            <div className="mt-1 whitespace-nowrap text-[11px] text-ink-300">альты 70% · плечо 25x · без стопов</div>
          </div>
        </div>
        {/* ручка */}
        <div className="absolute inset-y-0 z-10" style={{ left: `calc(${pos}% - 2px)` }}>
          <div className="h-full w-1 bg-white shadow-[0_0_16px_rgba(255,255,255,.6)]" />
          <button
            aria-label="Двигать разделитель"
            className={cn("absolute top-1/2 flex size-12 -translate-x-[22px] -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-900 shadow-[0_4px_0_#8aa0d4]", d.dragging && "scale-110")}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Icon name="sort" size={20} stroke={3} className="rotate-90" />
          </button>
        </div>
        <div className="absolute left-3 top-3 z-10 rounded-lg bg-ink-950/70 px-2 py-1 font-display text-[10px] font-black uppercase backdrop-blur">До</div>
        <div className="absolute right-3 top-3 z-10 rounded-lg bg-ink-950/70 px-2 py-1 font-display text-[10px] font-black uppercase backdrop-blur">После</div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Mascot size={40} mood={pos < 50 ? "happy" : "sad"} />
        <div className="flex-1 text-[12px] text-ink-300">{pos < 35 ? "Вот так выглядит здоровый портфель" : pos > 65 ? "А так начинало большинство" : "Тяните ручку — сравните результат курса"}</div>
        <Btn s="xs" v="ghost" onClick={() => { tap(); setPos(50); }}>50/50</Btn>
      </div>
    </div>
  );
}

/* ── H02 · Лайтбокс: моменты сезона ── */
const SHOTS = [
  { t: "Первая прибыль", d: "+$184 за неделю", g: "from-bull/40 to-ink-900", icon: "trendUp" as const },
  { t: "Победа над Борой", d: "Босс повержен за 4 вопроса", g: "from-bear/40 to-ink-900", icon: "sword" as const },
  { t: "Сапфировая лига", d: "Повышение после 3 недель", g: "from-sky/40 to-ink-900", icon: "trophy" as const },
  { t: "Стрик 100", d: "Сто дней без пропусков", g: "from-flame/40 to-ink-900", icon: "flame" as const },
  { t: "Глаз кита", d: "Легендарная карта получена", g: "from-gold/40 to-ink-900", icon: "eye" as const },
  { t: "Кубок сезона", d: "1 место из 30 игроков", g: "from-violet/40 to-ink-900", icon: "crown" as const },
];

export function Lightbox() {
  const [open, setOpen] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const touch = useRef<{ x: number; dx: number } | null>(null);
  const show = (i: number) => {
    setOpen(i);
    setZoom(1);
    sfx("whoosh");
  };
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % SHOTS.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o + SHOTS.length - 1) % SHOTS.length));
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(2.5, z + 0.5));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.5));
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <div>
      <div className="grid grid-cols-3 gap-2.5">
        {SHOTS.map((s, i) => (
          <button key={s.t} onClick={() => show(i)} className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-b ring-1 ring-white/10 transition-transform hover:-translate-y-1 hover:ring-sky/50">
            <span className={cn("absolute inset-0 bg-gradient-to-b", s.g)} />
            <span className="absolute inset-0 grid-bg opacity-60" />
            <span className="absolute inset-0 flex items-center justify-center text-white/90 transition-transform duration-300 group-hover:scale-125"><Icon name={s.icon} size={34} stroke={2.2} /></span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 to-transparent p-2 pt-5 text-left">
              <span className="block truncate text-[11px] font-bold">{s.t}</span>
            </span>
            <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-lg bg-ink-950/60 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"><Icon name="eye" size={13} /></span>
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="fixed inset-0 z-[65] flex flex-col bg-ink-950/92 backdrop-blur-md animate-fade" onClick={() => setOpen(null)}>
          <div className="flex items-center gap-3 p-4" onClick={(e) => e.stopPropagation()}>
            <span className="font-mono text-sm font-bold tabular-nums">{open + 1} / {SHOTS.length}</span>
            <div className="ml-auto flex gap-2">
              <button aria-label="Отдалить" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-lg font-black">−</button>
              <button aria-label="Приблизить" onClick={() => setZoom((z) => Math.min(2.5, z + 0.5))} className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-lg font-black">+</button>
              <button aria-label="Закрыть" onClick={() => setOpen(null)} className="flex size-10 items-center justify-center rounded-xl bg-ink-800"><Icon name="x" size={18} stroke={2.6} /></button>
            </div>
          </div>
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden px-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, dx: 0 }; }}
            onTouchMove={(e) => { if (touch.current) touch.current.dx = e.touches[0].clientX - touch.current.x; }}
            onTouchEnd={() => {
              const dx = touch.current?.dx ?? 0;
              if (dx < -60) { sfx("whoosh"); setOpen((o) => (o === null ? o : (o + 1) % SHOTS.length)); }
              if (dx > 60) { sfx("whoosh"); setOpen((o) => (o === null ? o : (o + SHOTS.length - 1) % SHOTS.length)); }
              touch.current = null;
            }}
          >
            <button aria-label="Назад" onClick={() => { sfx("whoosh"); setOpen((open + SHOTS.length - 1) % SHOTS.length); setZoom(1); }} className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full bg-ink-800/80 backdrop-blur"><Icon name="chevL" size={20} stroke={2.8} /></button>
            <div key={open} className="flex max-h-full w-full max-w-lg flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-b from-ink-700 to-ink-900 ring-1 ring-white/15 animate-zoom-in" style={{ transform: `scale(${zoom})`, transition: "transform .3s" }}>
              <div className={cn("relative flex h-56 w-full items-center justify-center overflow-hidden bg-gradient-to-b", SHOTS[open].g)}>
                <div className="absolute inset-0 grid-bg" />
                <Icon name={SHOTS[open].icon} size={90} stroke={1.6} className="text-white drop-shadow-[0_10px_20px_rgba(0,0,0,.5)]" />
              </div>
              <div className="w-full p-5 text-center">
                <div className="font-display text-lg font-black">{SHOTS[open].t}</div>
                <div className="text-[13px] text-ink-300">{SHOTS[open].d}</div>
              </div>
            </div>
            <button aria-label="Вперёд" onClick={() => { sfx("whoosh"); setOpen((open + 1) % SHOTS.length); setZoom(1); }} className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full bg-ink-800/80 backdrop-blur"><Icon name="chevR" size={20} stroke={2.8} /></button>
          </div>
          <div className="flex justify-center gap-2 p-4" onClick={(e) => e.stopPropagation()}>
            {SHOTS.map((_, i) => (
              <button key={i} aria-label={`Кадр ${i + 1}`} onClick={() => { tap("tick"); setOpen(i); setZoom(1); }} className={cn("h-1.5 rounded-full transition-all", i === open ? "w-8 bg-white" : "w-3 bg-ink-600")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── H03 · Скины графика ── */
const SKINS = [
  { k: "neon", t: "Неон", up: "#2BE38B", dn: "#FF4D6D", bg: "#081229", line: "#3D9BFF", price: 0 },
  { k: "sunset", t: "Закат", up: "#FFC940", dn: "#9A6BFF", bg: "#1A0F2E", line: "#FF8A3D", price: 120 },
  { k: "ocean", t: "Океан", up: "#2BE3C8", dn: "#3D9BFF", bg: "#062A33", line: "#8FF5FF", price: 200 },
  { k: "mono", t: "Моно", up: "#E6ECF5", dn: "#6B7FAF", bg: "#0A0E1A", line: "#8EA3D6", price: 80 },
];
const BARS = [42, 55, 48, 62, 58, 72, 66, 80, 74, 88, 82, 92];

function SkinChart({ up, dn, bg, line }: { up: string; dn: string; bg: string; line: string }) {
  return (
    <svg viewBox="0 0 240 120" className="h-36 w-full rounded-2xl" style={{ background: bg }}>
      {BARS.map((v, i) => {
        const prev = BARS[Math.max(0, i - 1)];
        const isUp = v >= prev;
        const x = 10 + i * 19;
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={115 - v - 8} y2={115 - v + 24} stroke={isUp ? up : dn} strokeWidth="1.5" opacity=".9" />
            <rect x={x - 5} y={115 - v} width="10" height="16" rx="2" fill={isUp ? up : dn} />
          </g>
        );
      })}
      <polyline points={BARS.map((v, i) => `${10 + i * 19},${107 - v}`).join(" ")} fill="none" stroke={line} strokeWidth="2" />
    </svg>
  );
}

export function SkinPicker() {
  const [skin, setSkin] = useState(0);
  const [owned, setOwned] = useState<number[]>([0]);
  const s = SKINS[skin];
  return (
    <div>
      <div className="overflow-hidden rounded-3xl ring-1 ring-white/10" key={skin}>
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="font-display text-xs font-black">BTC/USDT · {s.t}</span>
          <Chip tone="sky">Демо</Chip>
        </div>
        <div className="p-3 animate-fade"><SkinChart up={s.up} dn={s.dn} bg={s.bg} line={s.line} /></div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {SKINS.map((k, i) => (
          <button key={k.k} onClick={() => { tap("tick"); setSkin(i); }}
            className={cn("overflow-hidden rounded-2xl ring-2 transition-all", skin === i ? "ring-sky scale-[1.03]" : "ring-transparent opacity-70 hover:opacity-100")}>
            <span className="block p-1" style={{ background: k.bg }}>
              <span className="flex h-8 items-end justify-center gap-[3px]">
                {[40, 65, 50, 80, 60].map((h, j) => <span key={j} className="w-1.5 rounded-sm" style={{ height: `${h}%`, background: j % 2 ? k.up : k.dn }} />)}
              </span>
            </span>
            <span className="block bg-ink-850 py-1 text-[10px] font-bold">{k.t}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          {[s.up, s.dn, s.line].map((c) => <span key={c} className="size-6 rounded-lg ring-1 ring-white/20" style={{ background: c }} />)}
        </div>
        <div className="flex-1" />
        {owned.includes(skin) ? (
          <span className="flex items-center gap-1.5 text-[12px] font-bold text-bull"><Icon name="check" size={16} stroke={3} />Выбран</span>
        ) : (
          <Btn s="xs" v="sky" onClick={() => { sfx("success"); haptic(12); setOwned((o) => [...o, skin]); }}><GemArt size={14} />{s.price}</Btn>
        )}
      </div>
    </div>
  );
}

/* ── H04 · Ken Burns слайд-шоу ── */
const SLIDES = [
  { t: "Утро трейдера", d: "Стрик 28 · +45 XP за кофе", art: <SkylineScene className="h-full w-full" /> },
  { t: "Сапфировая лига", d: "2 место · до рубина 340 XP", art: <span className="flex h-full items-center justify-center bg-gradient-to-br from-sky/30 to-ink-900"><LeagueBadge tier="sapphire" size={110} /></span> },
  { t: "Сундук недели", d: "Легендарная награда ждёт", art: <span className="flex h-full items-center justify-center bg-gradient-to-br from-gold/25 to-ink-900"><Mascot size={110} mood="hype" /></span> },
];

export function KenBurns() {
  const [i, setI] = useState(0);
  const [play, setPlay] = useState(true);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    if (!play) return;
    setProg(0);
    const t0 = performance.now();
    const dur = 5000;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setProg(k);
      if (k >= 1) setI((v) => (v + 1) % SLIDES.length);
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [i, play]);
  return (
    <div>
      <div className="relative h-64 overflow-hidden rounded-3xl ring-1 ring-white/10">
        {SLIDES.map((s, k) => (
          <div key={s.t} className={cn("absolute inset-0 transition-opacity duration-700", k === i ? "z-10 opacity-100" : "z-0 opacity-0")}>
            <div className="h-full w-full" style={k === i && play ? { animation: "kb 5.2s ease-out forwards", transformOrigin: k % 2 ? "20% 80%" : "80% 20%" } : undefined}>{s.art}</div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/95 via-ink-950/50 to-transparent p-4 pt-10">
              <div className={cn("font-display text-base font-black", k === i && "animate-slide-up")}>{s.t}</div>
              <div className={cn("text-[12px] text-ink-300", k === i && "animate-slide-up")} style={{ animationDelay: ".1s" }}>{s.d}</div>
            </div>
          </div>
        ))}
        <div className="absolute left-3 right-3 top-3 z-20 flex gap-1.5">
          {SLIDES.map((_, k) => (
            <button key={k} aria-label={`Слайд ${k + 1}`} onClick={() => { tap("tick"); setI(k); }} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <span className="block h-full rounded-full bg-white" style={{ width: k < i ? "100%" : k === i ? `${prog * 100}%` : "0%" }} />
            </button>
          ))}
        </div>
        <button aria-label={play ? "Пауза" : "Играть"} onClick={() => { tap(); setPlay(!play); }} className="absolute bottom-3 right-3 z-20 flex size-9 items-center justify-center rounded-full bg-ink-950/70 backdrop-blur">
          <Icon name={play ? "minus" : "play"} size={16} stroke={2.6} />
        </button>
      </div>
      <style>{`@keyframes kb { from { transform: scale(1) } to { transform: scale(1.14) } }`}</style>
    </div>
  );
}

/* ── H05 · Лупа над графиком ── */
const MAG = [52, 58, 55, 63, 60, 68, 72, 69, 78, 83, 80, 90, 86, 94];

export function Magnifier() {
  const box = useRef<HTMLDivElement>(null);
  const [m, setM] = useState<{ x: number; y: number } | null>(null);
  const [z, setZ] = useState(2);
  const W = 300, H = 170;
  const y = (v: number) => H - (v / 100) * H;
  const pts = MAG.map((v, i) => `${(i / (MAG.length - 1)) * W},${y(v)}`).join(" ");
  return (
    <div>
      <Label>Наведи на график — лупа ×{z}</Label>
      <div
        ref={box}
        className="relative cursor-none overflow-hidden rounded-3xl well"
        onMouseMove={(e) => {
          const r = box.current!.getBoundingClientRect();
          setM({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
        }}
        onMouseLeave={() => setM(null)}
        onTouchMove={(e) => {
          const t = e.touches[0];
          const r = box.current!.getBoundingClientRect();
          setM({ x: ((t.clientX - r.left) / r.width) * W, y: ((t.clientY - r.top) / r.height) * H });
        }}
        onTouchEnd={() => setM(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-44 w-full" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke="#3D9BFF" strokeWidth="2.5" />
          {MAG.map((v, i) => <circle key={i} cx={(i / (MAG.length - 1)) * W} cy={y(v)} r="2.5" fill="#3D9BFF" />)}
        </svg>
        {m && (
          <div
            className="pointer-events-none absolute z-10 size-32 overflow-hidden rounded-full border-[3px] border-white shadow-[0_16px_32px_rgba(0,0,0,.6)]"
            style={{ left: `calc(${(m.x / W) * 100}% - 64px)`, top: `calc(${(m.y / H) * 100}% - 64px)` }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute max-w-none" preserveAspectRatio="none"
              style={{ width: `${100 * z}%`, height: `${100 * z}%`, left: `${-(m.x / W) * 100 * z + 50}%`, top: `${-(m.y / H) * 100 * z + 50}%`, background: "#0b1938" }}>
              <polyline points={pts} fill="none" stroke="#3D9BFF" strokeWidth={2.5 / z + 1} />
              {MAG.map((v, i) => <circle key={i} cx={(i / (MAG.length - 1)) * W} cy={y(v)} r={3} fill="#3D9BFF" />)}
            </svg>
            <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Label className="mb-0">Зум</Label>
        {[1.5, 2, 3].map((v) => (
          <button key={v} onClick={() => { tap("tick"); setZ(v); }} className={cn("rounded-lg px-3 py-1.5 font-mono text-[12px] font-bold", z === v ? "bg-sky text-white" : "bg-ink-800 text-ink-300")}>×{v}</button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 text-[11px] text-ink-400"><CoinArt size={18} />Совет: лупа помогает целиться в SL/TP</span>
      </div>
    </div>
  );
}
