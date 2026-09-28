import { useState } from "react";
import { AssetCard, Icon, ICON_NAMES, Label, Section, useCountUp, useInterval, useKit } from "../ui/kit";
import { cn } from "../utils/cn";

const SURF = [
  ["ink-950", "#050b1f"], ["ink-900", "#0a1330"], ["ink-800", "#111f47"], ["ink-700", "#182a5c"], ["ink-600", "#22376f"], ["ink-500", "#2f4789"],
];
const SIGNAL = [
  ["Bull", "#2ee59d", "#12a46a", "Рост / верно"], ["Bear", "#ff4d6a", "#c21f43", "Падение / ошибка"], ["Gold", "#ffc53d", "#cc8a00", "Награды / XP"],
  ["Sky", "#3d8bff", "#1e56c9", "Действие / инфо"], ["Violet", "#a174ff", "#6a3fd6", "PRO / гемы"], ["Flame", "#ff8a3d", "#d9531a", "Стрик"],
];

function ColorTokens() {
  const { notify } = useKit();
  const [picked, setPicked] = useState<string | null>(null);
  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setPicked(hex);
    notify(`Скопировано ${hex}`);
  };
  return (
    <AssetCard id="FND-01" title="Color Tokens" desc="Пары face/edge для объёма. Клик — копирует HEX." tags={["color", "tokens"]}>
      <Label>Signal · face + edge</Label>
      <div className="grid grid-cols-3 gap-3">
        {SIGNAL.map(([n, f, e, role]) => (
          <button key={n} onClick={() => copy(f)} className="group text-left">
            <div className={cn("relative h-14 rounded-2xl transition-transform duration-150 group-hover:-translate-y-1 group-active:translate-y-1", picked === f && "anim-pop")}
              style={{ background: `linear-gradient(180deg, ${f}, ${f}dd)`, boxShadow: `0 5px 0 ${e}, 0 12px 20px -8px ${e}, inset 0 1px 0 #ffffff66` }}>
              <span className="absolute left-2 right-2 top-1 h-4 rounded-xl bg-white/25" />
              {picked === f && <Icon name="check" size={22} className="absolute inset-0 m-auto text-black/60" stroke={3} />}
            </div>
            <div className="mt-2.5 text-xs font-extrabold text-white">{n}</div>
            <div className="font-mono text-[10px] text-ink-400">{f.toUpperCase()}</div>
            <div className="text-[10px] text-ink-300">{role}</div>
          </button>
        ))}
      </div>
      <Label className="mt-4">Surface depth</Label>
      <div className="flex overflow-hidden rounded-xl">
        {SURF.map(([n, h]) => (
          <button key={n} onClick={() => copy(h)} title={n} className="group relative h-12 flex-1 transition-all hover:flex-[1.8]" style={{ background: h }}>
            <span className="absolute inset-x-0 bottom-1 text-center font-mono text-[9px] text-ink-300 opacity-0 transition group-hover:opacity-100">{h}</span>
          </button>
        ))}
      </div>
    </AssetCard>
  );
}

function Surfaces() {
  const [pressed, setPressed] = useState<number | null>(null);
  const [lvl, setLvl] = useState(2);
  const items = [
    { n: "Base", c: "bg-ink-800", arrow: "" },
    { n: "Raised", c: "raised", arrow: "up" },
    { n: "Inset", c: "well", arrow: "down" },
    { n: "Pressed", c: "pressed", arrow: "down" },
  ];
  const shadows = [
    "none",
    "0 2px 0 #0b1638, 0 4px 8px -4px #000a",
    "0 4px 0 #0b1638, 0 10px 18px -8px #000b",
    "0 6px 0 #0b1638, 0 18px 28px -10px #000c",
    "0 8px 0 #0b1638, 0 28px 40px -12px #000d, 0 0 40px -10px #3d8bff66",
  ];
  return (
    <AssetCard id="FND-02" title="Surfaces & Elevation" desc="4 материала поверхности + 5 уровней подъёма. Тапни тайл / двигай уровень." tags={["surface", "elevation", "shadow"]}>
      <div className="grid grid-cols-4 gap-3">
        {items.map((it, i) => (
          <button key={it.n} onClick={() => setPressed(pressed === i ? null : i)} className="text-center">
            <div className={cn("grid aspect-square place-items-center rounded-2xl transition-all duration-150", pressed === i ? "pressed translate-y-1" : it.c)}>
              {it.arrow && <Icon name={it.arrow} size={18} className="text-ink-300" />}
            </div>
            <div className="mt-2 text-[11px] font-bold text-ink-200">{it.n}</div>
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="relative h-36" style={{ perspective: 600 }}>
          {[4, 3, 2, 1, 0].map((l) => (
            <div key={l} className="absolute left-1/2 top-1/2 h-16 w-24 rounded-2xl border border-white/10 transition-all duration-500"
              style={{
                transform: `translate(-50%, -50%) rotateX(58deg) rotateZ(-38deg) translateZ(${(l - 2) * (lvl * 7 + 8)}px)`,
                background: l === lvl ? "linear-gradient(135deg,#3d8bff,#1e56c9)" : `linear-gradient(135deg, hsl(225 50% ${18 + l * 4}%), hsl(225 55% ${13 + l * 3}%))`,
                boxShadow: l === lvl ? "0 0 30px #3d8bff99" : "0 10px 20px #0008",
              }} />
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {[0, 1, 2, 3, 4].map((l) => (
            <button key={l} onClick={() => setLvl(l)} className={cn("rounded-lg px-2.5 py-1.5 text-left font-mono text-[10px] font-bold transition", lvl === l ? "bg-sky text-white" : "bg-ink-800 text-ink-300 hover:bg-ink-700")}>
              ELV {l}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 rounded-2xl bg-ink-700 p-3 text-center text-xs font-bold text-ink-200 transition-all duration-300" style={{ boxShadow: shadows[lvl], transform: `translateY(${-lvl}px)` }}>
        Demo card · elevation {lvl}
      </div>
    </AssetCard>
  );
}

function Typography() {
  const [p, setP] = useState(64231.5);
  useInterval(() => setP((x) => x + (Math.random() - 0.48) * 40), 1200);
  const v = useCountUp(p, 600);
  return (
    <AssetCard id="FND-03" title="Typography" desc="Manrope 800 для заголовков, JetBrains Mono — для цен и чисел (табличные цифры)." tags={["type", "font"]}>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between"><span className="text-3xl font-extrabold tracking-tight text-white text-3d">Display 32</span><span className="font-mono text-[10px] text-ink-400">800 / -2%</span></div>
        <div className="flex items-baseline justify-between"><span className="text-xl font-extrabold text-white">Heading 20</span><span className="font-mono text-[10px] text-ink-400">800</span></div>
        <div className="flex items-baseline justify-between"><span className="text-[15px] font-semibold text-ink-200">Body 15 — объясняем рынок просто.</span><span className="font-mono text-[10px] text-ink-400">600</span></div>
        <div className="flex items-baseline justify-between"><span className="text-[11px] font-extrabold uppercase tracking-[.16em] text-ink-400">Overline 11</span><span className="font-mono text-[10px] text-ink-400">800 / +16%</span></div>
        <div className="raised flex items-center justify-between rounded-2xl px-4 py-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Mono numerals · live</div>
            <div className="font-mono text-2xl font-extrabold tabular-nums text-white">${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <Icon name="trendUp" size={28} className="text-bull" />
        </div>
      </div>
    </AssetCard>
  );
}

function RadiusSpacing() {
  const [r, setR] = useState(16);
  const radii = [6, 10, 16, 24, 999];
  const spacing = [4, 8, 12, 16, 24, 32, 48];
  const [hover, setHover] = useState<number | null>(null);
  return (
    <AssetCard id="FND-04" title="Radius & Spacing" desc="Скругления в стиле мягких игровых плиток и 4pt сетка отступов." tags={["radius", "spacing", "grid"]}>
      <Label>Radius · клик применяет к превью</Label>
      <div className="flex items-end justify-between gap-2">
        {radii.map((x) => (
          <button key={x} onClick={() => setR(x)} className="flex flex-col items-center gap-1.5">
            <div className={cn("h-11 w-11 border-2 transition-all", r === x ? "border-sky bg-sky/20 shadow-[0_0_16px_#3d8bff66]" : "border-ink-500 bg-ink-800")} style={{ borderRadius: Math.min(x, 22) }} />
            <span className="font-mono text-[10px] text-ink-400">{x === 999 ? "full" : x}</span>
          </button>
        ))}
      </div>
      <div className="raised mx-auto mt-4 grid h-16 w-40 place-items-center text-xs font-bold text-ink-200 transition-all duration-300" style={{ borderRadius: Math.min(r, 32) }}>r = {r === 999 ? "full" : r}</div>
      <Label className="mt-5">Spacing scale</Label>
      <div className="flex items-end gap-2">
        {spacing.map((s, i) => (
          <div key={s} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full rounded-md bg-gradient-to-t from-sky-edge to-sky transition-all duration-300" style={{ height: s + (hover === i ? 14 : 0), opacity: hover === null || hover === i ? 1 : 0.4 }} />
            <span className="font-mono text-[10px] text-ink-400">{s}</span>
          </div>
        ))}
      </div>
    </AssetCard>
  );
}

function Iconography() {
  const [variant, setVariant] = useState<"line" | "duo" | "solid">("duo");
  const [size, setSize] = useState(24);
  const [sel, setSel] = useState("flame");
  const colors = ["text-flame", "text-violet", "text-bear", "text-gold", "text-gold", "text-sky", "text-bull"];
  return (
    <AssetCard id="FND-05" title="Iconography" desc={`${ICON_NAMES.length} иконок, 3 стиля, 4 размера. Округлые окончания, stroke 2.2.`} tags={["icons", "svg"]} className="md:col-span-2 2xl:col-span-1">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="well flex rounded-xl p-1">
          {(["line", "duo", "solid"] as const).map((v) => (
            <button key={v} onClick={() => setVariant(v)} className={cn("rounded-lg px-3 py-1 text-[11px] font-extrabold uppercase transition", variant === v ? "raised text-white" : "text-ink-400")}>{v}</button>
          ))}
        </div>
        <div className="flex gap-1">
          {[16, 20, 24, 32].map((s) => (
            <button key={s} onClick={() => setSize(s)} className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-bold", size === s ? "bg-sky text-white" : "bg-ink-800 text-ink-400")}>{s}</button>
          ))}
        </div>
      </div>
      <div className="grid max-h-56 grid-cols-7 gap-1.5 overflow-y-auto pr-1">
        {ICON_NAMES.map((n, i) => (
          <button key={n} onClick={() => setSel(n)} title={n}
            className={cn("group grid aspect-square place-items-center rounded-xl transition-all", sel === n ? "raised" : "hover:bg-ink-800", i < 7 ? colors[i] : "text-ink-200")}>
            <Icon name={n} size={size} variant={variant} className="transition-transform group-hover:scale-125 group-active:scale-90" />
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-xl bg-ink-800/60 px-3 py-2">
        <Icon key={sel} name={sel} size={28} variant={variant} className="anim-pop text-sky" />
        <code className="font-mono text-xs text-ink-200">&lt;Icon name="{sel}" size={"{"}{size}{"}"} variant="{variant}" /&gt;</code>
      </div>
    </AssetCard>
  );
}

export default function Foundations() {
  return (
    <Section id="foundations" num="01" title="Foundations" subtitle="Токены, материалы и базовая визуальная грамматика">
      <ColorTokens />
      <Surfaces />
      <Typography />
      <RadiusSpacing />
      <Iconography />
    </Section>
  );
}
