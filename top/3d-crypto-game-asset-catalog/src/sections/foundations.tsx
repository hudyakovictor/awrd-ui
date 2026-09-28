import { useState } from "react";
import { Icon, ICONS, type IconName } from "../components/Icon";
import { Label, Segmented, Btn } from "../components/ui";
import { CoinArt, GemArt, FlameArt, HeartArt, BoltArt } from "../components/art";
import { notify, tap, useCountUp, useInterval, fmt } from "../lib/fx";
import { cn } from "../utils/cn";

/* F01 — Surfaces, elevation, radius */
export function Surfaces() {
  const [lvl, setLvl] = useState(2);
  const levels = [
    { n: "Inset", cls: "well", sh: "inset 0 3 8 / .55" },
    { n: "Base", cls: "bg-ink-800 rounded-2xl", sh: "none" },
    { n: "Raised", cls: "panel-soft", sh: "0 4 0 #0A1430" },
    { n: "Card", cls: "panel", sh: "0 6 0 + 0 22 40" },
    { n: "Overlay", cls: "panel ring-2 ring-sky/40 shadow-[0_6px_0_#0a1430,0_30px_60px_-10px_rgba(61,155,255,.35)]", sh: "0 30 60 sky/35" },
  ];
  const radii = [8, 12, 16, 24, 999];
  return (
    <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr]">
      <div>
        <Label>Уровни высоты · тапни</Label>
        <div className="relative h-56">
          {levels.map((l, i) => (
            <button key={l.n} onClick={() => { tap("tick"); setLvl(i); }}
              className={cn("absolute left-0 right-8 h-12 flex items-center justify-between px-4 text-left transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]", l.cls,
                lvl === i ? "translate-x-6 z-10" : "hover:translate-x-2")}
              style={{ top: i * 42 }}>
              <span className="font-display text-xs font-bold">{`L${i} · ${l.n}`}</span>
              <span className="font-mono text-[10px] text-ink-300">{l.sh}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <Label>Радиусы</Label>
          <div className="flex items-end gap-3">
            {radii.map((r) => (
              <div key={r} className="text-center">
                <div className="size-12 panel-soft border-2 border-sky/40 transition-transform hover:-translate-y-1" style={{ borderRadius: Math.min(r, 24) }} />
                <div className="mt-1 font-mono text-[10px] text-ink-300">{r === 999 ? "full" : r}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Label>Подошва (sole) нажатия</Label>
          <div className="flex gap-3">
            {[0, 3, 5, 8].map((h) => (
              <button key={h} className="btn3d v-ink h-11 w-14 text-[10px]" style={{ ["--h" as string]: `${h}px` }} onClick={() => tap()}>{h}px</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Отступы · шкала 4pt</Label>
          <div className="flex items-end gap-1.5">
            {[4, 8, 12, 16, 20, 24, 32].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div className="rounded bg-sky/30 ring-1 ring-sky/60" style={{ width: s, height: s }} />
                <span className="font-mono text-[9px] text-ink-300">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* F02 — Palette */
const PALETTE = [
  { n: "Bull", v: "#2BE38B", d: "#12A25E", role: "рост · успех · CTA" },
  { n: "Bear", v: "#FF4D6D", d: "#BF2345", role: "падение · ошибка" },
  { n: "Gold", v: "#FFC940", d: "#C98A08", role: "монеты · награды" },
  { n: "Sky", v: "#3D9BFF", d: "#1B5FC9", role: "фокус · инфо" },
  { n: "Violet", v: "#9A6BFF", d: "#5F35C9", role: "эпик · энергия" },
  { n: "Flame", v: "#FF8A3D", d: "#C9521A", role: "стрик · риск" },
];
const INKS = ["#050B1C", "#081229", "#11203F", "#1B305C", "#30508F", "#7D93C6", "#DFE7FA"];
export function Palette() {
  const copy = (hex: string) => { navigator.clipboard?.writeText(hex).catch(() => {}); tap("coin"); notify(`${hex} скопирован`, "success"); };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {PALETTE.map((c) => (
          <button key={c.n} onClick={() => copy(c.v)} className="group text-left">
            <div className="relative h-16 rounded-2xl transition-transform group-hover:-translate-y-1 group-active:translate-y-1" style={{ background: `linear-gradient(180deg, ${c.v}, ${c.v})`, boxShadow: `0 5px 0 ${c.d}, inset 0 2px 0 rgba(255,255,255,.4)` }}>
              <Icon name="copy" size={14} className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-80 text-black/60" />
            </div>
            <div className="mt-2.5 font-display text-[11px] font-bold">{c.n}</div>
            <div className="font-mono text-[10px] text-ink-300">{c.v}</div>
            <div className="text-[10px] text-ink-400 leading-tight">{c.role}</div>
          </button>
        ))}
      </div>
      <div>
        <Label>Ink — тёмно-синяя база</Label>
        <div className="flex overflow-hidden rounded-2xl shadow-[0_4px_0_#050b1c]">
          {INKS.map((h) => (
            <button key={h} onClick={() => copy(h)} className="group relative h-12 flex-1 transition-[flex] duration-300 hover:flex-[1.8]" style={{ background: h }}>
              <span className={cn("absolute inset-0 flex items-center justify-center font-mono text-[9px] opacity-0 group-hover:opacity-100", h === "#DFE7FA" ? "text-ink-900" : "text-ink-100")}>{h}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* F03 — Typography & numerics */
export function Typography() {
  const [price, setPrice] = useState(67412.5);
  useInterval(() => setPrice((p) => p + (Math.random() - 0.48) * 60), 1200);
  const shown = useCountUp(price, 600);
  const up = shown <= price;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-3">
        <div><div className="font-display text-3xl font-black tracking-tight leading-none">Display 32</div><div className="font-mono text-[10px] text-ink-400 mt-1">Unbounded · 900 · заголовки экранов</div></div>
        <div><div className="font-display text-lg font-bold">Title 18 — Урок 4</div><div className="font-mono text-[10px] text-ink-400">Unbounded · 700</div></div>
        <div><div className="text-sm font-semibold text-ink-100">Body 14 — Стоп-лосс ограничивает убыток позиции.</div><div className="font-mono text-[10px] text-ink-400">Manrope · 600</div></div>
        <div><div className="text-[10px] font-extrabold uppercase tracking-[.18em] text-ink-300">Overline 10 — категория</div></div>
      </div>
      <div className="panel-soft p-4">
        <Label>Цифры · моно + тикер</Label>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums">${fmt(shown)}</span>
        </div>
        <div className={cn("mt-1 inline-flex items-center gap-1 font-mono text-sm font-bold", up ? "text-bull" : "text-bear")}>
          <Icon name={up ? "up" : "down"} size={14} stroke={3} /> {up ? "+" : "−"}{fmt(Math.abs(price - 67000) / 670, 2)}%
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
          {[["BTC", "0.0231"], ["ETH", "1.504"], ["SOL", "42.10"]].map(([a, b]) => (
            <div key={a} className="well px-2 py-1.5"><div className="text-ink-400">{a}</div><div className="font-bold tabular-nums">{b}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* F04 — Iconography */
export function Iconography() {
  const [size, setSize] = useState<"16" | "24" | "32">("24");
  const [w, setW] = useState<"1.5" | "2" | "2.6">("2");
  const [hit, setHit] = useState<string | null>(null);
  const list = ICONS.slice(0, 40);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Segmented value={size} onChange={setSize} options={[{ v: "16", label: "16" }, { v: "24", label: "24" }, { v: "32", label: "32" }]} />
        <Segmented value={w} onChange={setW} options={[{ v: "1.5", label: "Thin" }, { v: "2", label: "Regular" }, { v: "2.6", label: "Bold" }]} />
      </div>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
        {list.map((n) => (
          <button key={n} title={n} onClick={() => { tap("tick"); setHit(n); navigator.clipboard?.writeText(n).catch(() => {}); }}
            className={cn("tile3d aspect-square flex items-center justify-center text-ink-200 hover:text-sky", hit === n && "text-gold")} data-state={hit === n ? "selected" : undefined}>
            <Icon name={n as IconName} size={+size} stroke={+w} className={hit === n ? "animate-pop" : ""} />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Label className="mb-0">3D-иконки валют</Label>
        <div className="flex gap-3">
          {[CoinArt, GemArt, FlameArt, HeartArt, BoltArt].map((A, i) => <div key={i} className="transition-transform hover:-translate-y-1.5 hover:rotate-6"><A size={36} /></div>)}
        </div>
        {hit && <span className="ml-auto font-mono text-[11px] text-ink-300">«{hit}»</span>}
      </div>
    </div>
  );
}

/* F05 — Motion */
const CURVES = [
  { n: "Spring", v: "cubic-bezier(.34,1.56,.64,1)", use: "масштаб, появление", d: 600 },
  { n: "Ease-out", v: "cubic-bezier(.22,1,.36,1)", use: "цвет, позиция", d: 500 },
  { n: "Snap", v: "cubic-bezier(.9,0,.1,1)", use: "переходы экранов", d: 450 },
  { n: "Press", v: "ease-out", use: "подошва кнопки", d: 90 },
];
export function Motion() {
  const [go, setGo] = useState(false);
  return (
    <div className="space-y-3">
      {CURVES.map((c) => (
        <div key={c.n} className="grid grid-cols-[88px_1fr] items-center gap-3">
          <div>
            <div className="font-display text-[11px] font-bold">{c.n}</div>
            <div className="font-mono text-[9px] text-ink-400">{c.d}ms · {c.use}</div>
          </div>
          <div className="well relative h-10">
            <div className="absolute top-1.5 size-7 rounded-xl bg-gradient-to-b from-[#8CCBFF] to-sky shadow-[0_3px_0_var(--color-sky-d)]"
              style={{ left: go ? "calc(100% - 34px)" : "6px", transition: `left ${c.d}ms ${c.v}` }} />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-ink-400">Всё уважает prefers-reduced-motion</span>
        <Btn s="sm" v="sky" icon="play" onClick={() => setGo((g) => !g)}>Проиграть</Btn>
      </div>
    </div>
  );
}
