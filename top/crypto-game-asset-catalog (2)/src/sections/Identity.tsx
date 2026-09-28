import { useState, type CSSProperties } from "react";
import { Check, Copy, Lock, X } from "lucide-react";
import { Asset, Section, Chip } from "../kit/ui";
import { LogoMark, LogoBadge, Lockup } from "../kit/Brand";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";
import plate from "../assets/plate.jpg";

function MarkDisplay() {
  const [variant, setVariant] = useState<"bevel" | "solid" | "mono" | "outline">("bevel");
  const [grid, setGrid] = useState(false);
  const [size, setSize] = useState(160);
  return (
    <Asset code="K-001" title="The Mark" desc="Знак «Q», у которого хвост — свеча, а внутри — бычья свеча. Рисован путями, масштабируется бесконечно." hint="Меняй размер и вариант" specs={["hand-drawn paths", "evenodd donut", "45° tail"]} className="xl:row-span-2">
      <div className="relative mx-auto grid aspect-square w-full max-w-[320px] place-items-center rounded-3xl bg-[radial-gradient(circle_at_50%_35%,#1b2e5c,#0a1224_75%)]">
        {grid && (
          <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" aria-hidden>
            {[...Array(9)].map((_, i) => (
              <g key={i} stroke="#3b82ff" strokeOpacity=".25" strokeWidth=".3">
                <line x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
                <line x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} />
              </g>
            ))}
            <circle cx="50" cy="50" r="41.4" stroke="#ffc53d" strokeOpacity=".5" strokeWidth=".5" fill="none" />
            <circle cx="50" cy="50" r="26.2" stroke="#ffc53d" strokeOpacity=".5" strokeWidth=".5" fill="none" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="#22d39a" strokeOpacity=".4" strokeDasharray="2 2" />
            <rect x="18.8" y="18.8" width="62.5" height="62.5" stroke="#ff4f6d" strokeOpacity=".45" strokeWidth=".5" fill="none" strokeDasharray="3 2" />
          </svg>
        )}
        <div key={`${variant}${size}${grid}`} className="anim-pop">
          <LogoMark size={size} variant={variant} style={{ color: "#e8eeff", filter: "drop-shadow(0 18px 30px rgba(0,0,0,.55))" }} />
        </div>
        <span className="absolute bottom-3 left-4 text-[9px] font-bold uppercase tracking-widest text-mist">64 × 64 grid</span>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {(["bevel", "solid", "mono", "outline"] as const).map((v) => (
          <button key={v} onClick={() => { setVariant(v); sfx.tick(); }} className={cn("h-10 rounded-xl text-[10px] font-extrabold uppercase transition", variant === v ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{v}</button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {[32, 64, 96, 160].map((s) => (
          <button key={s} onClick={() => { setSize(s); sfx.tick(); }} className={cn("num rounded-lg px-2 py-1 text-[11px] font-bold", size === s ? "bg-gold text-ink-900" : "bg-ink-800 text-mist")}>{s}</button>
        ))}
        <button onClick={() => { setGrid(!grid); sfx.soft(); }} className={cn("ml-auto h-9 rounded-xl px-3 text-[10px] font-extrabold uppercase", grid ? "bg-gold text-ink-900" : "bg-ink-800 text-mist")}>Construction</button>
      </div>
    </Asset>
  );
}

function ScaleTest() {
  const sizes = [16, 24, 32, 48, 72, 112];
  return (
    <Asset code="K-002" title="Legibility & One-colour Test" desc="Знак читается от 16 px и работает в один цвет на светлом и тёмном." hint="Сравни размеры" specs={["16px min", "mono", "reversed"]}>
      <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-ink-900/60 p-4">
        {sizes.map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <LogoMark size={s} variant="bevel" />
            <span className="num text-[9px] text-mist">{s}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <div className="grid h-24 place-items-center rounded-2xl bg-white"><LogoMark size={54} variant="mono" style={{ color: "#0a1224" }} /></div>
        <div className="grid h-24 place-items-center rounded-2xl bg-ink-800"><LogoMark size={54} variant="mono" style={{ color: "#e8eeff" }} /></div>
        <div className="grid h-24 place-items-center rounded-2xl bg-gold"><LogoMark size={54} variant="mono" style={{ color: "#3b2600" }} /></div>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-ink-900/60 p-3">
        <LogoBadge size={56} />
        <div className="text-[11px] text-mist">App-icon badge: плитка с фаской и верхним бликом — тот же знак, тот же путь.</div>
      </div>
    </Asset>
  );
}

function Misuse() {
  const bad = [
    { t: "Don't stretch", style: { transform: "scaleX(1.5)" } },
    { t: "Don't rotate", style: { transform: "rotate(28deg)" } },
    { t: "Don't recolour", style: { filter: "hue-rotate(120deg) saturate(3)" } },
    { t: "Don't shadow", style: { filter: "drop-shadow(6px 6px 0 #ff4f6d)" } },
  ];
  return (
    <Asset code="K-003" title="Clear Space & Misuse" desc="Охранное поле = 12 ед. сетки. Четыре главных запрета с живым примером." hint="Сравни с правильным" specs={["12u clear", "4 don'ts"]}>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="grid h-28 place-items-center rounded-2xl border-2 border-bull/40 bg-bull/10">
          <div className="relative grid h-full w-full place-items-center">
            <span className="absolute inset-2 border border-dashed border-bull/40" />
            <LogoMark size={54} variant="bevel" />
            <span className="absolute bottom-1 left-1 text-[9px] font-extrabold uppercase text-bull">Do</span>
          </div>
        </div>
        {bad.map((b) => (
          <div key={b.t} className="group/b relative grid h-28 place-items-center overflow-hidden rounded-2xl border-2 border-bear/30 bg-bear/5">
            <div style={b.style as CSSProperties}><LogoMark size={52} variant="solid" /></div>
            <span className="absolute bottom-1 left-1 text-[9px] font-extrabold uppercase text-bear">{b.t}</span>
            <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-bear/20 text-bear opacity-0 transition group-hover/b:opacity-100"><X size={12} /></span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Lockups() {
  const [copied, setCopied] = useState(false);
  return (
    <Asset code="K-004" title="Lockups" desc="Горизонтальный, вертикальный, бейдж и минимальный вариант для разных носителей." hint="Скопируй имя файла" specs={["4 lockups", "light/dark"]}>
      <div className="space-y-2.5">
        <div className="flex items-center rounded-2xl bg-ink-900/60 px-4 py-5"><Lockup /></div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white px-3 py-5"><LogoMark size={44} variant="mono" style={{ color: "#0a1224" }} /><Lockup scale={0.62} tone="dark" /></div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-ink-900/60 px-3 py-5"><LogoBadge size={52} /><div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">app icon</div></div>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-ink-900/60 px-4 py-3">
          <code className="num text-[11px] text-sky">logo-candlequest-bevel.svg</code>
          <button onClick={() => { navigator.clipboard?.writeText("logo-candlequest-bevel.svg").catch(() => {}); setCopied(true); sfx.coin(); setTimeout(() => setCopied(false), 1200); }} className="text-mist hover:text-white">
            {copied ? <Check size={15} className="anim-pop text-bull" /> : <Copy size={15} />}
          </button>
        </div>
      </div>
    </Asset>
  );
}

function TypeSpecimen() {
  const [track, setTrack] = useState(0);
  const [txt, setTxt] = useState("Read the market");
  return (
    <Asset code="K-005" title="Type Specimen" desc="Unbounded 900 для заголовков, Manrope для текста, JetBrains Mono для цифр. Шкала 1.25." hint="Тяни трекинг" specs={["ratio 1.25", "3 faces", "tabular nums"]}>
      <div className="overflow-hidden rounded-2xl bg-ink-900/60 p-4">
        <div className="font-display font-black leading-[0.95] text-white" style={{ fontSize: "clamp(26px, 7vw, 48px)", letterSpacing: `${track / 100}em` }}>
          {txt || "Candle"}
        </div>
        <div className="mt-2 flex items-baseline gap-2 text-[13px]">
          <span className="font-semibold text-mist">Manrope 600</span>
          <span className="num text-bull">0123456789</span>
          <span className="text-mist/70">Rigular &amp; italic</span>
        </div>
      </div>
      <input value={txt} onChange={(e) => setTxt(e.target.value)} maxLength={26} className="panel-inset mt-3 h-11 w-full px-3 text-sm font-semibold outline-none" />
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Letter-spacing</span><span className="num text-gold">{track / 100}em</span></div>
        <input type="range" min={-4} max={16} value={track} onChange={(e) => setTrack(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${((track + 4) / 20) * 100}%,#0b1530 0)` }} />
      </div>
      <div className="mt-4 space-y-1">
        {[["Display", "2.441rem"], ["Title", "1.563rem"], ["Body", "1rem"], ["Caption", "0.8rem"]].map(([n, s], i) => (
          <div key={n} className="flex items-center gap-3 border-b border-white/5 py-1">
            <span className="w-14 text-[9px] font-extrabold uppercase text-mist">{n}</span>
            <div className="flex-1" style={{ height: 6 + i * 2 }}>
              <div className="h-full rounded bg-gradient-to-r from-sky to-violet" style={{ width: `${100 - i * 18}%` }} />
            </div>
            <span className="num text-[10px] text-mist">{s}</span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Materials() {
  const [copied, setCopied] = useState<string | null>(null);
  const chips = [
    ["#0A1224", "Midnight navy", "Фон"],
    ["#1D3160", "Steel panel", "Панель"],
    ["#3B82FF", "Signal blue", "Действие"],
    ["#FFC53D", "Reward gold", "Награда"],
    ["#22D39A", "Bull green", "Рост"],
    ["#FF4F6D", "Bear rose", "Падение"],
    ["#8A9BC4", "Cool mist", "Текст 2"],
    ["#E8EEFF", "Snow", "Текст 1"],
  ];
  return (
    <Asset code="K-006" title="Materials & Palette Posters" desc="Поверхности как металл и стекло: анодированная панель, фаски, блики, тиснёные чипы." hint="Кликни по чипу" specs={["brushed metal", "bevel", "8 tokens"]}>
      <div className="relative grid h-32 place-items-center overflow-hidden rounded-2xl">
        <img src={plate} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ filter: "saturate(.7) brightness(.75)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-ink-900/35" />
        <LogoMark size={64} variant="bevel" className="relative drop-shadow-[0_10px_18px_rgba(0,0,0,.6)]" />
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {chips.map(([c, n, r]) => (
          <button key={c} title={`${n} · ${r}`} onClick={() => { navigator.clipboard?.writeText(c).catch(() => {}); setCopied(c); sfx.coin(); setTimeout(() => setCopied(null), 1100); }} className="group/c overflow-hidden rounded-xl text-left" style={{ boxShadow: `0 3px 0 ${c}66` }}>
            <div className="h-12 w-full transition-transform group-hover/c:scale-110" style={{ background: `linear-gradient(160deg, ${c}, ${c}88)` }}>
              {copied === c && <div className="grid h-full place-items-center text-[10px] font-black" style={{ color: c > "#5" ? "#0a1224" : "#fff" }}>copied</div>}
            </div>
            <div className="bg-ink-800 px-1.5 py-1">
              <div className="num text-[8px] font-bold" style={{ color: c }}>{c}</div>
              <div className="truncate text-[8px] font-semibold text-mist">{n}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="sky">Material 1 · paper</Chip>
        <Chip tone="violet">Material 2 · steel</Chip>
        <Chip tone="gold">Material 3 · reward</Chip>
      </div>
    </Asset>
  );
}

function FilePack() {
  const files = [
    ["logo-bevel.svg", "Vector logo · bevel"],
    ["logo-mono.svg", "Vector logo · one colour"],
    ["app-icon-1024.png", "App icon"],
    ["tokens-tailwind.css", "Design tokens"],
    ["motion-easings.json", "Motion curves"],
    ["sound-pack.zip", "Procedural SFX spec"],
  ];
  return (
    <Asset code="K-007" title="Export Pack" desc="Что получает команда: вектор знака, токены, кривые движения, звук." hint="Нажми на файл" specs={["6 deliverables", "SVG + JSON"]}>
      <div className="space-y-2">
        {files.map(([f, d], i) => (
          <button key={f} onClick={() => sfx.tap()} className="anim-slide-right flex w-full items-center gap-3 rounded-xl bg-ink-800 p-2.5 text-left shadow-[0_3px_0_#08112a] transition hover:bg-ink-700" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink-700 text-sky"><Lock size={15} /></span>
            <div className="min-w-0 flex-1"><div className="num truncate text-[12px] font-bold">{f}</div><div className="text-[10px] text-mist">{d}</div></div>
            <span className="text-[10px] font-extrabold uppercase text-mist">svg</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky/15 to-violet/15 p-3">
        <LogoBadge size={38} />
        <div className="text-[11px] leading-snug text-mist">Все ассеты — вектор или код. Растровых логотипов нет и не будет.</div>
      </div>
    </Asset>
  );
}

export default function Identity() {
  return (
    <Section id="identity" index="11" title="Brand Identity" subtitle="Знак, локапы, материалы, типографика и пакет поставки">
      <MarkDisplay />
      <ScaleTest />
      <Misuse />
      <Lockups />
      <TypeSpecimen />
      <Materials />
      <FilePack />
    </Section>
  );
}
