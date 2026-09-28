import { useState, type CSSProperties } from "react";
import { Check, Copy, Play } from "lucide-react";
import { Asset, Section, Btn, Label, Chip } from "../kit/ui";
import { gameIcons } from "../kit/GameIcons";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

const brand = [
  { n: "Bull", role: "Buy · Correct · Profit", c: "#22d39a", d: "#10916a" },
  { n: "Bear", role: "Sell · Wrong · Loss", c: "#ff4f6d", d: "#c02a47" },
  { n: "Sky", role: "Primary · Continue", c: "#3b82ff", d: "#2152c4" },
  { n: "Gold", role: "Rewards · XP · Premium", c: "#ffc53d", d: "#c98a12" },
  { n: "Violet", role: "Legendary · League", c: "#8b5cff", d: "#5a33c7" },
  { n: "Cyan", role: "Gems · Info", c: "#2bd9ff", d: "#1395b8" },
  { n: "Ember", role: "Streak · Hot", c: "#ff8a3d", d: "#c75a14" },
];
const ink = ["#060b18", "#0a1224", "#0d1730", "#111d3a", "#16264a", "#1d3160", "#273f75", "#3a5494", "#8a9bc4", "#e8eeff"];

function ColorTokens() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    sfx.coin();
    setCopied(hex);
    setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
  };
  return (
    <Asset code="A-001" title="Color Tokens" desc="Семантическая палитра: рынок, награды, состояния. Клик — копирует HEX." hint="Нажми на свотч" specs={["7 brand", "10 ink", "AA contrast"]}>
      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7 md:grid-cols-4 xl:grid-cols-4">
        {brand.map((b, i) => (
          <button
            key={b.n}
            onClick={() => copy(b.c)}
            className="group/s relative flex flex-col items-center gap-1.5 anim-pop"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span
              className="relative grid h-14 w-full place-items-center rounded-2xl transition-transform duration-200 group-hover/s:-translate-y-1 group-active/s:translate-y-1"
              style={{ background: `linear-gradient(180deg, ${b.c}, ${b.c}cc)`, boxShadow: `inset 0 2px 0 rgba(255,255,255,.35), 0 5px 0 ${b.d}, 0 10px 18px -6px ${b.c}88` }}
            >
              {copied === b.c ? <Check size={18} className="anim-pop text-white" /> : <Copy size={14} className="text-white/0 transition group-hover/s:text-white/80" />}
            </span>
            <span className="text-[11px] font-extrabold text-white">{b.n}</span>
            <span className="num -mt-1 text-[9px] text-mist">{b.c}</span>
          </button>
        ))}
      </div>
      <Label>
        <span className="mt-4 block">Ink · depth scale</span>
      </Label>
      <div className="flex overflow-hidden rounded-xl shadow-[0_4px_0_#060b18]">
        {ink.map((c) => (
          <button key={c} onClick={() => copy(c)} title={c} className="group/i relative h-10 flex-1 transition-all hover:flex-[2.2]" style={{ background: c }}>
            <span className={cn("num absolute inset-0 grid place-items-center text-[8px] opacity-0 transition group-hover/i:opacity-100", c > "#5" ? "text-ink-900" : "text-white")}>
              {copied === c ? "✓" : c.slice(1)}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-mist">
        Роли: <span className="text-bull">{brand[0].role}</span> · <span className="text-bear">{brand[1].role}</span>
      </p>
    </Asset>
  );
}

const surfaces = [
  { n: "Base", cls: "panel", t: "y6 · b40" },
  { n: "Raised", cls: "panel-raised", t: "y4 · b24" },
  { n: "Inset", cls: "panel-inset", t: "inset y3" },
  { n: "Pressed", cls: "panel-inset opacity-80", t: "inset y5" },
];
function Surfaces() {
  const [lvl, setLvl] = useState(3);
  const [pressed, setPressed] = useState<number | null>(null);
  const shadow = `inset 0 1px 0 rgba(255,255,255,.08), 0 ${lvl * 2}px 0 #0a142b, 0 ${lvl * 6}px ${lvl * 10}px -${lvl * 2}px rgba(0,0,0,.65)`;
  return (
    <Asset code="A-002" title="Surfaces & Elevation" desc="Объёмные поверхности с твёрдой «нижней гранью» — фирменный тактильный язык." hint="Двигай уровень, жми на плитки" specs={["L0–L5", "hard edge", "soft drop"]}>
      <div className="grid grid-cols-4 gap-3">
        {surfaces.map((s, i) => (
          <button
            key={s.n}
            onPointerDown={() => { setPressed(i); sfx.soft(); }}
            onPointerUp={() => setPressed(null)}
            onPointerLeave={() => setPressed(null)}
            className="flex flex-col items-center gap-2"
          >
            <span className={cn(s.cls, "block h-16 w-full !rounded-2xl transition-transform duration-100")} style={{ transform: pressed === i ? "translateY(4px) scale(.97)" : undefined }} />
            <span className="text-[11px] font-bold">{s.n}</span>
            <span className="num -mt-1.5 text-[9px] text-mist">{s.t}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-5">
        <div className="relative h-28 [perspective:600px]">
          {[0, 1, 2, 3, 4, 5].map((l) => (
            <div
              key={l}
              className="absolute inset-x-6 h-12 rounded-2xl border border-white/10 transition-all duration-500 [transition-timing-function:cubic-bezier(.3,1.5,.5,1)]"
              style={{
                bottom: l * (l <= lvl ? 12 : 4),
                background: l === lvl ? "linear-gradient(180deg,#3b82ff,#2152c4)" : `rgba(40,65,120,${0.25 + l * 0.08})`,
                transform: `rotateX(55deg) scale(${1 - l * 0.04})`,
                boxShadow: l === lvl ? "0 0 30px rgba(59,130,255,.6)" : undefined,
                opacity: l <= lvl ? 1 : 0.25,
              }}
            />
          ))}
        </div>
        <div className="h-20 w-24 rounded-2xl bg-gradient-to-b from-ink-600 to-ink-700 transition-all duration-300" style={{ boxShadow: shadow, transform: `translateY(${-lvl}px)` }}>
          <div className="num p-2 text-[10px] text-mist">
            L{lvl}
            <br />y{lvl * 2} b{lvl * 10}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((l) => (
          <button
            key={l}
            onClick={() => { setLvl(l); sfx.tick(); }}
            className={cn("num h-9 flex-1 rounded-xl text-xs font-bold transition-all", l === lvl ? "bg-sky text-white shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a] hover:text-white")}
          >
            L{l}
          </button>
        ))}
      </div>
    </Asset>
  );
}

function Typography() {
  const [txt, setTxt] = useState("Buy the dip, not the hype");
  const scale = [
    { n: "Display XL", cls: "font-display text-3xl font-black", s: "32/36 · 900" },
    { n: "Title", cls: "font-display text-xl font-extrabold", s: "20/26 · 800" },
    { n: "Body", cls: "text-[15px] font-semibold", s: "15/22 · 600" },
    { n: "Numeric", cls: "num text-lg font-bold text-bull", s: "18 mono · tnum" },
    { n: "Caption", cls: "text-[10px] font-extrabold uppercase tracking-[0.18em] text-mist", s: "10 · caps" },
  ];
  return (
    <Asset code="A-003" title="Typography" desc="Unbounded для заголовков, Manrope для текста, JetBrains Mono для цен." hint="Впиши свой текст" specs={["3 families", "5 steps", "tnum"]}>
      <div className="panel-inset mb-4 flex items-center gap-2 px-3">
        <span className="text-mist">Aa</span>
        <input value={txt} onChange={(e) => setTxt(e.target.value)} maxLength={40} className="h-11 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-mist/50" placeholder="Type to preview…" />
      </div>
      <div className="space-y-3">
        {scale.map((s, i) => (
          <div key={s.n} className="flex items-baseline justify-between gap-3 anim-fade" style={{ animationDelay: `${i * 70}ms` }}>
            <div className={cn("min-w-0 truncate", s.cls)}>{s.n === "Numeric" ? "$64,218.40 ▲2.14%" : txt || s.n}</div>
            <span className="num shrink-0 text-[9px] text-mist">{s.s}</span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Icons() {
  const [size, setSize] = useState(40);
  const [hit, setHit] = useState<string | null>(null);
  const [k, setK] = useState(0);
  return (
    <Asset code="A-004" title="Game Iconography" desc="13 объёмных иллюстративных иконок с «толщиной» и бликом." hint="Тапни иконку" specs={["64 grid", "3D extrude", "gradient"]}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {[28, 40, 52].map((s) => (
            <button key={s} onClick={() => { setSize(s); sfx.tick(); }} className={cn("num rounded-lg px-2.5 py-1 text-[11px] font-bold", s === size ? "bg-sky text-white shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist")}>
              {s}px
            </button>
          ))}
        </div>
        <Chip tone="gold">{hit ?? "tap one"}</Chip>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-5">
        {gameIcons.map(({ name, C }, i) => (
          <button
            key={name}
            onClick={() => { setHit(name); setK((v) => v + 1); sfx.coin(); }}
            className="panel-raised grid aspect-square place-items-center !rounded-2xl transition hover:-translate-y-1 active:translate-y-0.5 anim-pop"
            style={{ animationDelay: `${i * 35}ms` }}
            title={name}
          >
            <span key={hit === name ? k : 0} className={hit === name ? "anim-pop" : ""}>
              <C size={size} className={name === "Streak" ? "anim-flame" : ""} />
            </span>
          </button>
        ))}
      </div>
    </Asset>
  );
}

function RadiusSpacing() {
  const radii = [6, 10, 16, 24, 999];
  const [r, setR] = useState(16);
  const space = [4, 8, 12, 16, 24, 32, 48];
  return (
    <Asset code="A-005" title="Radius & Spacing" desc="Мягкие, но не «детские» радиусы. Шкала отступов 4-pt." hint="Выбери радиус" specs={["r6–full", "4pt grid"]}>
      <div className="flex items-center gap-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center bg-gradient-to-b from-violet to-violet-d text-xs font-bold shadow-[inset_0_2px_0_rgba(255,255,255,.3),0_6px_0_#3a1f8f] transition-all duration-500 [transition-timing-function:cubic-bezier(.3,1.6,.5,1)]" style={{ borderRadius: Math.min(r, 56) }}>
          <span className="num">{r === 999 ? "full" : `r${r}`}</span>
        </div>
        <div className="grid flex-1 grid-cols-5 gap-2">
          {radii.map((x) => (
            <button key={x} onClick={() => { setR(x); sfx.tick(); }} className="flex flex-col items-center gap-1">
              <span className={cn("h-10 w-10 border-2 transition-all", r === x ? "border-violet bg-violet/20 shadow-[0_0_14px_rgba(139,92,255,.6)]" : "border-ink-400")} style={{ borderRadius: Math.min(x, 20) }} />
              <span className="num text-[9px] text-mist">{x === 999 ? "full" : x}</span>
            </button>
          ))}
        </div>
      </div>
      <Label>
        <span className="mt-5 block">Spacing scale</span>
      </Label>
      <div className="flex items-end gap-2">
        {space.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full origin-bottom rounded-md bg-gradient-to-t from-sky-d to-sky" style={{ height: s * 1.2, animation: `bar-grow .6s ${i * 60}ms both cubic-bezier(.3,1.5,.5,1)` }} />
            <span className="num text-[9px] text-mist">{s}</span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

const easings = [
  { n: "Spring", v: "cubic-bezier(.3,1.6,.5,1)", c: "#22d39a", use: "Кнопки, pop" },
  { n: "Snappy", v: "cubic-bezier(.2,1,.3,1)", c: "#3b82ff", use: "Панели, листы" },
  { n: "Smooth", v: "cubic-bezier(.4,0,.2,1)", c: "#8b5cff", use: "Прогресс" },
  { n: "Linear", v: "linear", c: "#8a9bc4", use: "Лоадеры" },
];
function Motion() {
  const [go, setGo] = useState(false);
  return (
    <Asset code="A-006" title="Motion Tokens" desc="Четыре кривые движения — каждая со своей ролью." hint="Запусти гонку" specs={["90ms tap", "350ms sheet", "700ms bar"]}>
      <div className="space-y-3">
        {easings.map((e) => (
          <div key={e.n}>
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="font-bold" style={{ color: e.c }}>{e.n}</span>
              <span className="text-mist">{e.use}</span>
            </div>
            <div className="panel-inset relative h-8 !rounded-full">
              <span
                className="absolute top-1 h-6 w-6 rounded-full"
                style={{
                  left: go ? "calc(100% - 28px)" : 4,
                  background: `linear-gradient(180deg,#fff,${e.c})`,
                  boxShadow: `0 3px 0 ${e.c}88, 0 0 12px ${e.c}`,
                  transition: `left 900ms ${e.v}`,
                } as CSSProperties}
              />
            </div>
          </div>
        ))}
      </div>
      <Btn tone="violet" size="sm" block className="mt-5" onClick={() => setGo((g) => !g)}>
        <Play size={14} /> {go ? "Reset" : "Play motion"}
      </Btn>
    </Asset>
  );
}

export default function Foundations() {
  return (
    <Section id="foundations" index="01" title="Foundations" subtitle="Токены, поверхности, типографика, иконки, движение">
      <ColorTokens />
      <Surfaces />
      <Typography />
      <Icons />
      <RadiusSpacing />
      <Motion />
    </Section>
  );
}
