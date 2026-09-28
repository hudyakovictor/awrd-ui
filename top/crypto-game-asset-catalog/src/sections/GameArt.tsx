import { useState } from "react";
import { Download, Layers, Palette, Sparkles, Wand2 } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip, Bar } from "../kit/ui";
import { LogoMark } from "../kit/Brand";
import { GemIcon, TrophyIcon, FlameIcon, ShieldIcon, CoinIcon } from "../kit/GameIcons";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";
import heroArt from "../assets/hero-arena.jpg";
import terrain from "../assets/terrain.jpg";
import duel from "../assets/arena-duel.jpg";
import vault from "../assets/vault.jpg";
import plate from "../assets/plate.jpg";

const scenes = [
  { src: heroArt, n: "Trading Canyon", role: "Hero · lobby", chips: ["#0A1224", "#22D39A", "#FF4F6D"] },
  { src: terrain, n: "Chart Ranges", role: "Lesson map", chips: ["#1D3160", "#FFC53D", "#22D39A"] },
  { src: duel, n: "Duel Arena", role: "PvP mode", chips: ["#0D1730", "#22D39A", "#FF4F6D"] },
  { src: vault, n: "Reward Vault", role: "Loot · shop", chips: ["#2A1F6E", "#2BD9FF", "#FFC53D"] },
];

function KeyArt() {
  const [active, setActive] = useState(0);
  return (
    <Asset code="L-001" title="Key Art & Environments" desc="Четыре окружения одной световой схемы: холодный синий свет, тёплые акценты, туман." hint="Наведи на кадр" specs={["4 scenes", "parallax", "graded to palette"]} className="md:col-span-2 xl:col-span-2">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {scenes.map((s, i) => (
          <button
            key={s.n}
            onClick={() => { setActive(i); sfx.tap(); }}
            className={cn("group/s relative aspect-[3/4] overflow-hidden rounded-2xl transition-all duration-300", active === i ? "ring-2 ring-sky shadow-[0_8px_0_#08112a]" : "shadow-[0_4px_0_#08112a]")}
          >
            <img src={s.src} alt={s.n} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/s:scale-[1.12]" style={{ objectPosition: "50% 45%", filter: active === i ? "saturate(1.1)" : "saturate(.75) brightness(.85)" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
            <div className="absolute inset-x-2 bottom-2 text-left">
              <div className="text-[11px] font-extrabold text-white">{s.n}</div>
              <div className="text-[9px] uppercase tracking-wider text-mist">{s.role}</div>
              <div className="mt-1 flex gap-1">{s.chips.map((c) => <span key={c} className="h-2 w-2 rounded-full ring-1 ring-white/20" style={{ background: c }} />)}</div>
            </div>
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-sky to-transparent opacity-0 transition group-hover/s:opacity-100" />
          </button>
        ))}
      </div>
    </Asset>
  );
}

const grades = [
  { n: "Native", f: "none" },
  { n: "Cold terminal", f: "saturate(0.85) hue-rotate(-12deg) contrast(1.12) brightness(0.92)" },
  { n: "Neon night", f: "saturate(1.5) contrast(1.2) brightness(0.95)" },
  { n: "Golden hour", f: "sepia(0.35) saturate(1.25) hue-rotate(-8deg) brightness(1.05)" },
  { n: "Blueprint", f: "grayscale(0.4) saturate(1.8) hue-rotate(170deg) contrast(1.15)" },
  { n: "Mono", f: "grayscale(1) contrast(1.18)" },
];
function Grading() {
  const [g, setG] = useState(1);
  const [mix, setMix] = useState(100);
  return (
    <Asset code="L-002" title="Scene Colour Grading" desc="Пресеты цветокоррекции для сцен и анимаций — как фильтры в движке игры." hint="Меняй пресет и силу" specs={["6 grades", "live mix", "no assets"]}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl">
        <img src={duel} alt="Duel arena" className="h-full w-full object-cover" style={{ filter: grades[g].f, opacity: mix / 100 }} />
        <div className="absolute inset-0 bg-ink-900" style={{ opacity: (100 - mix) / 100 }} />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-ink-950/70 px-2 py-1 backdrop-blur">
          <Palette size={12} className="text-sky" />
          <span className="num text-[10px] font-bold">{grades[g].n}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {grades.map((x, i) => (
          <button key={x.n} onClick={() => { setG(i); sfx.tick(); }} className={cn("h-9 rounded-xl text-[10px] font-extrabold transition", g === i ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{x.n}</button>
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Intensity</span><span className="num text-gold">{mix}%</span></div>
        <input type="range" min={0} max={100} value={mix} onChange={(e) => setMix(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${mix}%,#0b1530 0)` }} />
      </div>
    </Asset>
  );
}

const rarities = [
  { n: "Common", c: "#8a9bc4", d: "#4a5c86", I: CoinIcon, drop: "62%", glow: 0 },
  { n: "Rare", c: "#2bd9ff", d: "#1395b8", I: ShieldIcon, drop: "24%", glow: 6 },
  { n: "Epic", c: "#8b5cff", d: "#5a33c7", I: GemIcon, drop: "9%", glow: 10 },
  { n: "Legendary", c: "#ffc53d", d: "#c98a12", I: TrophyIcon, drop: "4%", glow: 16 },
  { n: "Mythic", c: "#ff4f6d", d: "#c02a47", I: FlameIcon, drop: "1%", glow: 22 },
];
function Rarity() {
  const [sel, setSel] = useState(3);
  const r = rarities[sel];
  return (
    <Asset code="L-003" title="Rarity & Item Art" desc="Пять рангов предметов: металл-основа, цветной ореол и глубина свечения по редкости." hint="Выбери ранг" specs={["5 tiers", "drop rates", "material"]}>
      <div className="flex gap-2">
        {rarities.map((x, i) => (
          <button key={x.n} onClick={() => { setSel(i); sfx.tap(); }} className="group/r relative flex-1 rounded-xl p-1 transition-all" style={{ background: sel === i ? `${x.c}22` : "transparent", boxShadow: sel === i ? `inset 0 0 0 1.5px ${x.c}` : "inset 0 0 0 1.5px transparent" }}>
            <div className="relative grid h-16 place-items-center overflow-hidden rounded-lg">
              <img src={plate} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
              <x.I size={34} style={{ filter: `drop-shadow(0 0 ${x.glow}px ${x.c})`, opacity: sel === i ? 1 : 0.75 }} />
            </div>
            <div className="mt-1 truncate text-center text-[8px] font-extrabold uppercase" style={{ color: x.c }}>{x.n}</div>
          </button>
        ))}
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl">
        <img src={plate} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ filter: "brightness(.5) saturate(.8)" }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, ${r.c}44, transparent 68%)` }} />
        <div key={sel} className="anim-pop relative flex flex-col items-center gap-2 p-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: r.c, opacity: 0.35 }} />
            <r.I size={110} style={{ filter: `drop-shadow(0 0 ${r.glow + 14}px ${r.c})` }} />
          </div>
          <div className="font-display text-lg font-extrabold" style={{ color: r.c }}>{r.n} Reward</div>
          <div className="num text-[11px] text-mist">drop chance {r.drop}</div>
          <div className="mt-2 w-full"><Bar value={[62, 86, 95, 99, 100][sel]} tone="gold" h={8} glow={false} /></div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Sparkles size={14} className="text-gold" />
        <span className="text-[11px] text-mist">Свечение = реальный drop-shadow, не картинка: работает с любым предметом.</span>
      </div>
    </Asset>
  );
}

function SceneTemplate() {
  const [bg, setBg] = useState(1);
  const [dim, setDim] = useState(55);
  return (
    <Asset code="L-004" title="In-Game Scene Template" desc="Как арт соединяется с интерфейсом: слой сцены, затемнение, поверх — UI." hint="Меняй фон и затемнение" specs={["3 layers", "scrim %", "live UI"]}>
      <div className="relative h-[330px] overflow-hidden rounded-2xl">
        <img src={scenes[bg].src} alt="" className="absolute inset-0 h-full w-full object-cover transition-all duration-500" style={{ objectPosition: "50% 40%" }} />
        <div className="absolute inset-0 bg-ink-950 transition-opacity duration-300" style={{ opacity: dim / 100 }} />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-950/70 to-transparent" />
        <div className="relative flex h-full flex-col p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1"><FlameIcon size={16} /><span className="num text-[11px] font-extrabold text-ember">12</span></span>
            <LogoMark size={26} variant="bevel" />
            <span className="flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-1"><GemIcon size={16} /><span className="num text-[11px] font-extrabold text-cyan">840</span></span>
          </div>
          <div className="mt-auto">
            <div className="rounded-2xl bg-ink-950/75 p-3 backdrop-blur">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold">{scenes[bg].n}</div>
              <div className="mt-0.5 text-[13px] font-bold">Lesson 4 · Risk in trending markets</div>
              <div className="mt-2 flex gap-2">
                <button className="btn3d h-10 flex-1 !rounded-xl !text-[10px]" style={{ ["--c" as string]: "var(--color-bull)", ["--cd" as string]: "var(--color-bull-d)" }}>Start</button>
                <button className="btn-ghost3d h-10 !rounded-xl !text-[10px]">Guide</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {scenes.slice(0, 3).map((s, i) => (
          <button key={s.n} onClick={() => { setBg(i); sfx.tick(); }} className={cn("h-9 rounded-xl text-[10px] font-extrabold transition", bg === i ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{s.n}</button>
        ))}
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Scrim</span><span className="num text-gold">{dim}%</span></div>
        <input type="range" min={20} max={85} value={dim} onChange={(e) => setDim(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${((dim - 20) / 65) * 100}%,#0b1530 0)` }} />
      </div>
    </Asset>
  );
}

function ArtPipeline() {
  const steps = [
    ["01", "Concept", "Свет: холодный key, тёплый rim. Палитра уже задана токенами.", "#3b82ff"],
    ["02", "Render", "Кинематографичный рендер с туманом и зерном, без текста и логотипов.", "#22d39a"],
    ["03", "Grade", "Цветокоррекция под игру: синие тени, золотые и неоновые акценты.", "#ffc53d"],
    ["04", "Composite", "Поверх арта — UI со скримом 55%, кнопки держат контраст ≥ 4.5:1.", "#8b5cff"],
    ["05", "Export", "WebP/JPG для фонов, SVG для знаков, без растровых иконок.", "#2bd9ff"],
  ];
  return (
    <Asset code="L-005" title="Art Pipeline" desc="Как делается каждый кадр: свет, рендер, грейдинг, композит и экспорт." hint="Кликай шаги" specs={["5 stages", "one light scheme"]}>
      <div className="relative space-y-2">
        {steps.map(([n, t, d, c], i) => (
          <div key={n} className="anim-slide-right flex items-start gap-3 rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#08112a]" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-black" style={{ background: `${c}22`, color: c }}>{n}</span>
            <div><div className="text-[13px] font-extrabold">{t}</div><div className="text-[11px] leading-snug text-mist">{d}</div></div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ink-900/60 p-3">
        <Layers size={18} className="text-sky" />
        <div className="text-[11px] text-mist">Все кадры в одной световой схеме — поэтому экраны склеиваются в один мир.</div>
      </div>
    </Asset>
  );
}

function Downloads() {
  return (
    <Asset code="L-006" title="Art Deliverables" desc="Набор для разработки: фоны, плитка предметов, тени, грейдинг-пресеты." hint="Скачай пак" specs={["JPG 2048", "LUT presets", "SVG icons"]}>
      <div className="grid grid-cols-2 gap-2.5">
        {[["bg-canyon-2048.jpg", heroArt], ["bg-ranges-2048.jpg", terrain], ["bg-arena-2048.jpg", duel], ["bg-vault-2048.jpg", vault]].map(([f, src]) => (
          <button key={f as string} onClick={() => sfx.tap()} className="group/d relative aspect-[3/2] overflow-hidden rounded-xl">
            <img src={src as string} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover/d:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 to-transparent opacity-90" />
            <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-between">
              <span className="num text-[8px] font-bold text-white">{f as string}</span>
              <Download size={12} className="text-mist opacity-0 transition group-hover/d:opacity-100" />
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[["LUT · cold-terminal.cube", "#3b82ff"], ["LUT · neon-night.cube", "#8b5cff"], ["Item glow presets · JSON", "#ffc53d"]].map(([n, c]) => (
          <div key={n} className="flex items-center gap-2.5 rounded-xl bg-ink-800 p-2.5 shadow-[0_3px_0_#08112a]">
            <Wand2 size={16} style={{ color: c as string }} />
            <span className="num flex-1 text-[11px]">{n as string}</span>
            <Chip tone="gold">preset</Chip>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <GhostBtn className="!h-11 !text-[10px]">Preview LUT</GhostBtn>
        <Btn tone="sky" className="!h-11 !text-[10px]" onClick={() => sfx.coin()}>Get art pack</Btn>
      </div>
    </Asset>
  );
}

export default function GameArt() {
  return (
    <Section id="art" index="12" title="Game Art Direction" subtitle="Ключевой арт, окружения, цветокоррекция, редкость предметов и пакет поставки">
      <KeyArt />
      <Grading />
      <SceneTemplate />
      <Rarity />
      <ArtPipeline />
      <Downloads />
    </Section>
  );
}
