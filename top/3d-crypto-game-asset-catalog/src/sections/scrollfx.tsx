import { useEffect, useRef, useState } from "react";
import { Reveal, type RevealVariant, Parallax, Count, Tilt } from "../components/Reveal";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip, Bar, Label } from "../components/ui";
import { Mascot, CoinArt, GemArt, FlameArt, BoltArt, AvatarArt } from "../components/art";
import { SkylineScene, LeagueBadge } from "../components/art2";
import { useScrollVelocity, useInView } from "../lib/motion";
import { tap, sfx } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   U — РЕАКЦИЯ НА СКРОЛЛ: появления, параллакс, счётчики, таймлайны.
   ═══════════════════════════════════════════════════════════════════ */

/* ── U01 · Лаборатория появлений: все 8 вариантов ── */
const VARIANTS: RevealVariant[] = ["fade-up", "fade", "scale", "slide-left", "slide-right", "flip", "blur", "pop"];

export function RevealLab() {
  const [key, setKey] = useState(0);
  const [v, setV] = useState<RevealVariant>("fade-up");
  const [d, setD] = useState(120);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {VARIANTS.map((x) => (
            <button key={x} onClick={() => { tap("tick"); setV(x); }} className={cn("rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold transition-colors", v === x ? "bg-sky text-white shadow-[0_3px_0_var(--color-sky-d)]" : "bg-ink-850 text-ink-300 hover:bg-ink-800")}>{x}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink-400">каскад {d}мс</span>
          <input type="range" min={0} max={300} step={20} value={d} onChange={(e) => setD(+e.target.value)} className="rng w-24" aria-label="задержка каскада" />
          <Btn s="xs" v="sky" icon="play" onClick={() => { sfx("whoosh"); setKey(key + 1); }}>Ещё раз</Btn>
        </div>
      </div>
      <div key={key} className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[<CoinArt key="c" size={44} />, <GemArt key="g" size={44} />, <FlameArt key="f" size={44} />, <BoltArt key="b" size={44} />].map((art, i) => (
          <Reveal key={i} variant={v} delay={i * d}>
            <div className="panel-soft flex flex-col items-center gap-2 p-4">
              {art}
              <span className="font-mono text-[10px] text-ink-400">+{i * d}мс</span>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-ink-500">Появление срабатывает от IntersectionObserver · один раз · кривая spring для pop, ease-out для остальных</div>
    </div>
  );
}

/* ── U02 · Липкая стопка: карточки-модули ── */
const STACK = [
  { t: "Модуль 1 · Основы", hex: "#3D9BFF", icon: "book" as IconName, d: "Биржа, свечи, тренды", p: 100 },
  { t: "Модуль 2 · Риск", hex: "#FFC940", icon: "shield" as IconName, d: "Стопы, плечо, размер позиции", p: 64 },
  { t: "Модуль 3 · Психология", hex: "#9A6BFF", icon: "brain" as IconName, d: "FOMO, дисциплина, журнал", p: 28 },
  { t: "Модуль 4 · Боссы", hex: "#FF4D6D", icon: "sword" as IconName, d: "Кит Ликвидации и финал сезона", p: 0 },
];

export function StickyDemo() {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const H = 90; // vh на карточку внутри демо-контейнера
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const on = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.7;
      const p = Math.max(0, Math.min(1, (window.innerHeight * 0.35 - r.top) / (total || 1)));
      setActive(Math.min(STACK.length - 1, Math.floor(p * STACK.length)));
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[12px] text-ink-400">
        <Icon name="chevD" size={14} className="animate-bounce" /> Листайте страницу — карточки налипнут друг на друга
        <span className="ml-auto font-mono">{active + 1}/{STACK.length}</span>
      </div>
      <div ref={wrap} className="relative" style={{ height: `${STACK.length * H}vh`, maxHeight: 2200 }}>
        {STACK.map((c, i) => (
          <div key={c.t} className="sticky" style={{ top: 118 + i * 16, zIndex: i + 1 }}>
            <div
              className="panel p-5 transition-all duration-500 sm:p-6"
              style={{
                transform: `scale(${i < active ? 0.93 - (active - i) * 0.02 : 1}) translateY(${i < active ? -(active - i) * 8 : 0}px)`,
                filter: i < active ? "brightness(.7)" : "none",
                transformOrigin: "center top",
                opacity: i > active + 1 ? 0 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl text-ink-900" style={{ background: c.hex, boxShadow: "0 3px 0 rgba(0,0,0,.4)" }}>
                  <Icon name={c.icon} size={22} stroke={2.4} />
                </span>
                <div className="flex-1">
                  <div className="font-display text-sm font-black">{c.t}</div>
                  <div className="text-[12px] text-ink-400">{c.d}</div>
                </div>
                <span className="font-mono text-xs font-bold" style={{ color: c.hex }}>{c.p}%</span>
              </div>
              <Bar value={i <= active ? c.p : 0} tone={c.p === 100 ? "bull" : c.p > 0 ? "gold" : "sky"} h={10} className="mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── U03 · Горизонтальный трек с параллаксом карточек ── */
const TRACK = [
  { t: "Урок 1", d: "Что такое биржа", hex: "#3D9BFF", icon: "book" as IconName },
  { t: "Урок 2", d: "Японские свечи", hex: "#2BE38B", icon: "candle" as IconName },
  { t: "Урок 3", d: "Тренды", hex: "#FFC940", icon: "trendUp" as IconName },
  { t: "Урок 4", d: "Уровни", hex: "#9A6BFF", icon: "chart" as IconName },
  { t: "Урок 5", d: "Паттерны", hex: "#FF8A3D", icon: "target" as IconName },
  { t: "Босс", d: "Медведь Бора", hex: "#FF4D6D", icon: "sword" as IconName },
];

export function TrackScroll() {
  const scroller = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [shifts, setShifts] = useState<number[]>(TRACK.map(() => 0));
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = el.scrollWidth - el.clientWidth;
        setP(max > 0 ? el.scrollLeft / max : 0);
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        setShifts(TRACK.map((_, i) => {
          const card = el.children[i] as HTMLElement;
          if (!card) return 0;
          const cr = card.getBoundingClientRect();
          return (cr.left + cr.width / 2 - cx) / r.width; // −0.5..0.5
        }));
      });
    };
    on();
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  return (
    <div>
      <div ref={scroller} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2" style={{ scrollbarWidth: "none" }}>
        {TRACK.map((c, i) => {
          const s = shifts[i] ?? 0;
          return (
            <div key={c.t} className="w-[240px] shrink-0 snap-center">
              <div
                className="rounded-3xl p-5 ring-1 ring-white/10 transition-shadow"
                style={{
                  background: `linear-gradient(160deg, ${c.hex}33, #12234a 70%)`,
                  transform: `perspective(800px) rotateY(${(-s * 14).toFixed(1)}deg) scale(${(1 - Math.abs(s) * 0.12).toFixed(3)})`,
                  boxShadow: "0 6px 0 #0a1430",
                }}
              >
                <span className="flex size-12 items-center justify-center rounded-2xl text-ink-900" style={{ background: c.hex, transform: `translateX(${(s * 26).toFixed(1)}px)` }}>
                  <Icon name={c.icon} size={24} stroke={2.4} />
                </span>
                <div className="mt-3 font-display text-sm font-black">{c.t}</div>
                <div className="text-[12px] text-ink-300">{c.d}</div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-900">
                  <div className="h-full rounded-full" style={{ width: `${(1 - Math.abs(s) * 2) * 100}%`, background: c.hex }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn s="xs" v="ink" icon="chevL" aria-label="Назад" className="px-2" onClick={() => scroller.current?.scrollBy({ left: -260, behavior: "smooth" })} />
        <div className="well h-2.5 flex-1 overflow-hidden rounded-full">
          <div className="h-full rounded-full bg-gradient-to-r from-bull to-sky" style={{ width: `${Math.max(8, p * 100)}%` }} />
        </div>
        <Btn s="xs" v="ink" icon="chevR" aria-label="Вперёд" className="px-2" onClick={() => scroller.current?.scrollBy({ left: 260, behavior: "smooth" })} />
      </div>
      <div className="mt-2 text-center text-[11px] text-ink-500">Тяните трек — карточки наклоняются и смещают иконки от центра</div>
    </div>
  );
}

/* ── U04 · Параллакс-сцена: 4 слоя ── */
export function ParallaxScene() {
  const [depth, setDepth] = useState(1);
  const [follow, setFollow] = useState(true);
  const [mx, setMx] = useState({ x: 0, y: 0 });
  return (
    <div>
      <div
        className="relative h-72 overflow-hidden rounded-3xl ring-1 ring-white/10"
        onMouseMove={(e) => {
          if (!follow) return;
          const r = e.currentTarget.getBoundingClientRect();
          setMx({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
        }}
        onMouseLeave={() => setMx({ x: 0, y: 0 })}
      >
        <div className="absolute inset-0" style={{ transform: `translate(${mx.x * -14 * depth}px, ${mx.y * -8 * depth}px) scale(1.08)`, transition: "transform .3s" }}>
          <SkylineScene className="h-full w-full" />
        </div>
        <div className="absolute left-[8%] top-[18%]" style={{ transform: `translate(${mx.x * 22 * depth}px, ${mx.y * 14 * depth}px)`, transition: "transform .3s" }}>
          <CoinArt size={52} className="animate-float" />
        </div>
        <div className="absolute right-[10%] top-[12%]" style={{ transform: `translate(${mx.x * 40 * depth}px, ${mx.y * 26 * depth}px)`, transition: "transform .3s" }}>
          <GemArt size={60} className="animate-float [animation-delay:.5s]" />
        </div>
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2" style={{ transform: `translate(calc(-50% + ${mx.x * 64 * depth}px), ${mx.y * 20 * depth}px)`, transition: "transform .3s" }}>
          <Mascot size={120} mood="happy" className="animate-bob drop-shadow-[0_16px_24px_rgba(0,0,0,.5)]" />
        </div>
        <div className="absolute bottom-3 left-4 rounded-lg bg-ink-950/70 px-2 py-1 font-mono text-[10px] backdrop-blur">слой 1.0 · 1.8 · 2.6 · 4.0</div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-900 to-transparent" />
      </div>
      <Parallax speed={0.5} className="mt-3">
        <div className="panel-soft flex items-center gap-3 p-3">
          <FlameArt size={32} />
          <div className="flex-1 text-[12px] font-semibold text-ink-200">Эта плашка едет со скроллом страницы (scroll-параллакс ×0.5)</div>
        </div>
      </Parallax>
      <div className="mt-3 flex items-center gap-3">
        <Label className="mb-0 w-20">Глубина {depth.toFixed(1)}</Label>
        <input type="range" min={0} max={2} step={0.1} value={depth} onChange={(e) => setDepth(+e.target.value)} className="rng flex-1" aria-label="глубина" />
        <button onClick={() => { tap("tick"); setFollow(!follow); }} className={cn("rounded-xl px-3 py-2 font-display text-[10px] font-bold uppercase", follow ? "bg-sky/20 text-sky" : "bg-ink-800 text-ink-400")}>
          {follow ? "Мышь: вкл" : "Мышь: выкл"}
        </button>
      </div>
    </div>
  );
}

/* ── U05 · Счётчики и бары по появлению ── */
const STATS: { icon: IconName; hex: string; to: number; suffix: string; label: string; bar: number; fmt?: (v: number) => string }[] = [
  { icon: "users", hex: "#3D9BFF", to: 128400, suffix: "", label: "учеников", bar: 82, fmt: (v) => Math.round(v).toLocaleString("ru-RU") },
  { icon: "bolt", hex: "#FFC940", to: 9400000, suffix: "", label: "XP выдано", bar: 64, fmt: (v) => (v / 1000000).toFixed(1) + "M" },
  { icon: "target", hex: "#2BE38B", to: 87, suffix: "%", label: "точность ответов", bar: 87 },
  { icon: "flame", hex: "#FF8A3D", to: 365, suffix: "", label: "макс. стрик, дней", bar: 100 },
];

export function Counters() {
  const [key, setKey] = useState(0);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  return (
    <div ref={ref} key={key}>
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} variant="pop" delay={i * 100}>
            <div className="panel-soft p-4">
              <span className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${s.hex}22`, color: s.hex }}>
                <Icon name={s.icon} size={20} stroke={2.4} />
              </span>
              <div className="mt-2 font-display text-2xl font-black">
                <Count to={s.to} format={(v) => (s.fmt ? s.fmt(v) : Math.round(v) + s.suffix)} />
              </div>
              <div className="text-[11px] text-ink-400">{s.label}</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-900">
                <div className="h-full rounded-full transition-all duration-1000 [transition-timing-function:cubic-bezier(.22,1,.36,1)]" style={{ width: inView ? `${s.bar}%` : "0%", background: s.hex, transitionDelay: `${i * 120}ms` }} />
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-ink-500">Числа и бары анимируются при появлении в кадре</span>
        <Btn s="xs" v="ghost" icon="play" onClick={() => setKey(key + 1)}>Ещё раз</Btn>
      </div>
    </div>
  );
}

/* ── U06 · Скорость скролла → наклон + смаз ── */
export function VelocitySkew() {
  const v = useScrollVelocity();
  const skew = Math.max(-12, Math.min(12, v * 4));
  const blur = Math.min(3, Math.abs(v) * 1.4);
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Chip tone={Math.abs(v) > 1 ? "flame" : "sky"}>скорость {Math.abs(v).toFixed(2)} px/мс</Chip>
        <span className="text-[11px] text-ink-400">Листайте страницу быстро — карточки наклонятся</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="panel-soft flex items-center gap-3 p-4"
            style={{ transform: `skewY(${(-skew * (0.7 + i * 0.2)).toFixed(2)}deg)`, filter: blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none" }}
          >
            {i === 0 ? <AvatarArt seed={1} size={44} /> : i === 1 ? <LeagueBadge tier="gold" size={44} /> : <Mascot size={44} mood="hype" />}
            <div>
              <div className="font-display text-xs font-black">{["Кира · 2140 XP", "Золотая лига", "Серия x8"][i]}</div>
              <div className="text-[11px] text-ink-400">{["обогнала тебя", "топ-3 близко", "держи темп!"][i]}</div>
            </div>
          </div>
        ))}
      </div>
      <Tilt max={10} className="mt-4">
        <div className="flex items-center gap-4 rounded-3xl bg-gradient-to-r from-violet/30 to-sky/20 p-5 ring-1 ring-violet/30">
          <LeagueBadge tier="diamond" size={64} />
          <div>
            <div className="font-display text-sm font-black">Бонус: 3D-tilt за курсором</div>
            <div className="text-[12px] text-ink-300">Наведи на плашку — она наклонится, а блик последует за мышью</div>
          </div>
        </div>
      </Tilt>
    </div>
  );
}
