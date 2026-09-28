import { useState, type CSSProperties } from "react";
import { Asset, CountUp, Label, Section, Segmented, useToast } from "../components/ui";
import { Glyph, Icon, ICONS } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

const SURF = [
  { n: "ink-950", h: "#050A18", r: "App backdrop" }, { n: "ink-900", h: "#070D1F", r: "Canvas" },
  { n: "ink-850", h: "#0A1330", r: "Inset well" }, { n: "ink-800", h: "#0F1B3F", r: "Panel" },
  { n: "ink-700", h: "#142350", r: "Raised" }, { n: "ink-600", h: "#1C3068", r: "Hover / Chip" },
];
const SIG = [
  { n: "bull", h: "#1FDB8B", lip: "#0D9A5C", r: "Profit · Correct" }, { n: "bear", h: "#FF4D6A", lip: "#C0253F", r: "Loss · Wrong" },
  { n: "blue", h: "#3D7BFF", lip: "#2250C2", r: "Primary · Focus" }, { n: "gold", h: "#FFC53D", lip: "#C38709", r: "XP · Coins" },
  { n: "violet", h: "#8D5CFF", lip: "#5A2FCC", r: "Pro · Legendary" }, { n: "cyan", h: "#2ED3F0", lip: "#1595B0", r: "Info · Data" },
];

function Colors() {
  const toast = useToast();
  const [copied, setCopied] = useState("");
  const copy = (h: string) => { navigator.clipboard?.writeText(h).catch(() => {}); setCopied(h); sfx.pop(); toast({ type: "success", title: `Скопировано ${h}`, msg: "Токен цвета в буфере обмена", dur: 2000 }); setTimeout(() => setCopied(""), 1200); };
  return (
    <Asset title="Color Tokens" id="fnd.color" desc="Клик — копировать HEX. Сигнальные цвета имеют «губу» (lip) для 3D-объёма." className="lg:col-span-2">
      <Label>Signal · с тенью-губой</Label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
        {SIG.map((c, i) => (
          <button key={c.n} onClick={() => copy(c.h)} className="group text-left anim-pop" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="h-16 rounded-2xl relative transition-transform group-hover:-translate-y-1 group-active:translate-y-1" style={{ background: `linear-gradient(180deg, ${c.h}, ${c.h}dd)`, boxShadow: `0 6px 0 ${c.lip}, 0 14px 20px -6px ${c.h}66, inset 0 2px 0 rgba(255,255,255,.35)` }}>
              <div className="absolute inset-x-2 top-1.5 h-4 rounded-xl bg-white/25" />
              {copied === c.h && <Icon name="check" size={22} stroke={3} className="absolute inset-0 m-auto text-white anim-pop" />}
            </div>
            <div className="mt-3 text-[12px] font-extrabold">{c.n}</div>
            <div className="num text-[10.5px] text-mute">{c.h}</div>
            <div className="text-[10px] text-dim">{c.r}</div>
          </button>
        ))}
      </div>
      <Label>Navy surfaces</Label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 rounded-2xl overflow-hidden">
        {SURF.map((c) => (
          <button key={c.n} onClick={() => copy(c.h)} className="h-20 p-2.5 flex flex-col justify-end text-left border border-white/5 rounded-xl hover:border-blue/50 transition group" style={{ background: c.h }}>
            <span className="text-[11px] font-extrabold group-hover:text-blue transition">{c.n}</span>
            <span className="num text-[10px] text-mute">{c.h}</span>
          </button>
        ))}
      </div>
    </Asset>
  );
}

function Surfaces() {
  const [down, setDown] = useState<number | null>(null);
  const S = [
    { n: "Base", c: "panel-flat bg-ink-800 border border-white/5 rounded-2xl", spec: "#0F1B3F · 0dp" },
    { n: "Raised", c: "raised", spec: "y4 lip · blur 22" },
    { n: "Inset", c: "inset", spec: "inset y3 b8" },
    { n: "Pressed", c: "pressed", spec: "inset y5 b12" },
  ];
  return (
    <Asset title="Surfaces" id="fnd.surface" desc="Зажмите плитку — тактильный отклик нажатия.">
      <div className="grid grid-cols-2 gap-4">
        {S.map((s, i) => (
          <div key={s.n} className="text-center">
            <button onPointerDown={() => { setDown(i); sfx.tap(); }} onPointerUp={() => setDown(null)} onPointerLeave={() => setDown(null)}
              className={cn("w-full h-20 grid place-items-center transition-all duration-100", down === i && s.n !== "Pressed" ? "pressed translate-y-[3px]" : s.c)}>
              <Icon name={i === 1 ? "arrowUp" : i >= 2 ? "arrowDown" : "layers"} size={18} className="text-mute" />
            </button>
            <div className="text-[12px] font-extrabold mt-2">{s.n}</div>
            <div className="num text-[10px] text-dim">{s.spec}</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Elevation() {
  const [hover, setHover] = useState<number | null>(null);
  const L = ["Elv 0 · Flat", "Elv 1 · Card", "Elv 2 · Raised", "Elv 3 · Popover", "Elv 4 · Modal"];
  const C = ["#1c3068", "#27408a", "#3d7bff", "#6a5cff", "#8d5cff"];
  return (
    <Asset title="Elevation Stack" id="fnd.elevation" desc="Наведите на уровень — слой «всплывает».">
      <div className="flex items-center gap-4">
        <div className="relative h-52 w-40 shrink-0" style={{ perspective: 600 }}>
          {L.map((_, i) => (
            <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              className="absolute left-1/2 w-28 h-28 rounded-2xl border border-white/15 transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]"
              style={{
                top: 60, marginLeft: -56,
                background: `linear-gradient(135deg, ${C[i]}, ${C[i]}99)`,
                transform: `rotateX(58deg) rotateZ(-42deg) translateZ(${i * 22 + (hover === i ? 26 : 0)}px)`,
                boxShadow: hover === i ? `0 0 40px ${C[i]}` : `0 ${i * 4}px ${i * 8}px rgba(0,0,0,.5)`,
                opacity: hover === null || hover === i ? 1 : 0.45,
              }} />
          ))}
        </div>
        <div className="flex-1 space-y-1.5">
          {L.map((l, i) => (
            <button key={l} onMouseEnter={() => setHover(4 - i)} onMouseLeave={() => setHover(null)} className={cn("w-full text-left px-3 py-2 rounded-xl text-[11.5px] font-bold transition-all flex items-center gap-2", hover === 4 - i ? "raised text-txt translate-x-1" : "text-mute hover:text-txt")}>
              <span className="size-2.5 rounded-full" style={{ background: C[4 - i] }} />{L[4 - i]}
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

function Radii() {
  const [r, setR] = useState(16);
  const [bw, setBw] = useState(2);
  return (
    <Asset title="Radii & Borders" id="fnd.radius" desc="Живая песочница: ползунки меняют эталонную кнопку.">
      <div className="flex gap-2.5 mb-4">
        {[6, 10, 14, 20, 28, 99].map((v) => (
          <button key={v} onClick={() => { setR(v); sfx.tick(); }} className={cn("flex-1 aspect-square border-2 transition-all hover:-translate-y-0.5 grid place-items-end p-1", r === v ? "border-blue bg-blue/15" : "border-[#2a3f80] bg-ink-850")} style={{ borderRadius: Math.min(v, 30) }}>
            <span className="num text-[9px] text-mute w-full text-center">{v === 99 ? "full" : v}</span>
          </button>
        ))}
      </div>
      <div className="inset p-4 grid place-items-center mb-4 h-24">
        <button className="btn3d h-12 px-6 text-[13px]" style={{ "--top": "#6a9dff", "--base": "#3d7bff", "--lip": "#2250c2", borderRadius: r, outline: `${bw}px solid rgba(255,255,255,.35)`, outlineOffset: -bw } as CSSProperties}>Radius {r === 99 ? "full" : r}</button>
      </div>
      <div className="space-y-3 text-[11px] font-bold text-mute">
        <label className="flex items-center gap-3">Radius<input type="range" min={0} max={40} value={Math.min(r, 40)} onChange={(e) => setR(+e.target.value)} className="flex-1 accent-[#3d7bff]" /><span className="num w-8 text-txt">{r}</span></label>
        <label className="flex items-center gap-3">Border<input type="range" min={0} max={6} value={bw} onChange={(e) => setBw(+e.target.value)} className="flex-1 accent-[#3d7bff]" /><span className="num w-8 text-txt">{bw}px</span></label>
      </div>
    </Asset>
  );
}

function Spacing() {
  const S = [4, 8, 12, 16, 20, 24, 32, 40, 48];
  const [sel, setSel] = useState(16);
  return (
    <Asset title="Spacing Scale" id="fnd.space" desc="База 4pt. Выберите шаг — превью зазора ниже.">
      <div className="space-y-1.5 mb-4">
        {S.map((s, i) => (
          <button key={s} onClick={() => { setSel(s); sfx.tick(); }} className="w-full flex items-center gap-3 group">
            <span className={cn("num text-[10.5px] w-8 text-right", sel === s ? "text-blue" : "text-dim")}>{s}</span>
            <span className="h-3 rounded-md origin-left transition-colors" style={{ width: s * 3.6, animation: `grow-x .6s ${i * 60}ms cubic-bezier(.2,.9,.3,1.2) both`, background: sel === s ? "linear-gradient(90deg,#6a9dff,#3d7bff)" : "#22366f" }} />
          </button>
        ))}
      </div>
      <div className="inset p-3 flex items-center justify-center transition-all" style={{ gap: sel }}>
        {[0, 1, 2].map((i) => <div key={i} className="raised size-10 !rounded-xl" />)}
      </div>
    </Asset>
  );
}

function Typography() {
  const [xp, setXp] = useState(12480);
  return (
    <Asset title="Typography" id="fnd.type" desc="Plus Jakarta Sans для UI, JetBrains Mono для цифр и цен.">
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3"><span className="text-[34px] font-extrabold tracking-tight leading-none">Display</span><span className="num text-[10px] text-dim">34/800</span></div>
        <div className="flex items-baseline justify-between"><span className="text-[22px] font-extrabold tracking-tight">Heading · Unit 3</span><span className="num text-[10px] text-dim">22/800</span></div>
        <div className="flex items-baseline justify-between"><span className="text-[15px] font-bold">Title · Stop-loss basics</span><span className="num text-[10px] text-dim">15/700</span></div>
        <div className="flex items-baseline justify-between gap-3"><span className="text-[13px] text-mute">Body — рынок движется волнами, а не прямыми линиями.</span><span className="num text-[10px] text-dim shrink-0">13/400</span></div>
        <div className="flex items-baseline justify-between"><span className="label-caps !mb-0">Caption · Overline</span><span className="num text-[10px] text-dim">10.5/800</span></div>
        <button onClick={() => { setXp((v) => v + Math.floor(Math.random() * 900 + 100)); sfx.coin(); }} className="w-full inset p-3 flex items-center justify-between hover:border-gold/40 transition">
          <span className="flex items-center gap-2"><Glyph name="bolt" size={22} /><CountUp value={xp} className="text-[22px] font-extrabold text-gold" /></span>
          <span className="text-[10px] text-dim font-bold">Tap → animated numerals</span>
        </button>
      </div>
    </Asset>
  );
}

function Iconography() {
  const toast = useToast();
  const [w, setW] = useState("2");
  const [sz, setSz] = useState("22");
  const names = Object.keys(ICONS);
  return (
    <Asset title="Iconography" id="fnd.icons" desc={`${names.length} line-иконок + 10 объёмных глифов. Толщина и размер настраиваются.`} className="lg:col-span-2">
      <div className="flex flex-wrap gap-3 mb-4">
        <Segmented className="w-64" size="sm" value={w} onChange={setW} options={[{ value: "1.5", label: "Thin" }, { value: "2", label: "Regular" }, { value: "2.5", label: "Bold" }]} />
        <Segmented className="w-64" size="sm" value={sz} onChange={setSz} options={[{ value: "18", label: "18" }, { value: "22", label: "22" }, { value: "26", label: "26" }, { value: "32", label: "32" }]} />
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-14 gap-2 mb-5">
        {names.map((n, i) => (
          <button key={n} title={n} onClick={() => { navigator.clipboard?.writeText(n).catch(() => {}); toast({ type: "info", title: `Иконка «${n}»`, msg: "Имя скопировано", dur: 1800 }); }}
            className="aspect-square inset !rounded-xl grid place-items-center text-mute hover:text-blue hover:-translate-y-0.5 hover:border-blue/40 transition-all anim-pop" style={{ animationDelay: `${i * 12}ms` }}>
            <Icon name={n} size={+sz} stroke={+w} />
          </button>
        ))}
      </div>
      <Label>Volumetric game glyphs</Label>
      <div className="flex flex-wrap gap-3">
        {(["flame", "gem", "heart", "bolt", "coin", "star", "crown", "shield", "chest", "rocket"] as const).map((g, i) => (
          <button key={g} onClick={() => sfx.pop()} className="raised size-14 grid place-items-center hover:-translate-y-1 active:translate-y-0.5 transition-transform anim-float" style={{ animationDelay: `${i * 0.2}s` }}>
            <Glyph name={g} size={32} />
          </button>
        ))}
      </div>
    </Asset>
  );
}

export default function Foundations() {
  return (
    <Section id="foundations" index="01" title="Foundations" subtitle="Токены, поверхности, объём и визуальный язык системы" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Colors />
        <Surfaces />
        <Elevation />
        <Radii />
        <Spacing />
        <Iconography />
        <Typography />
      </div>
    </Section>
  );
}
