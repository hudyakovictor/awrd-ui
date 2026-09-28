import { useState } from "react";
import { Asset, Label, Section, useInterval, Btn } from "../components/ui";
import { Icon, ICON_NAMES } from "../components/icons";
import { cn } from "../utils/cn";

const RAMP = [
  ["ink-950", "#040916"], ["ink-900", "#070E22"], ["ink-850", "#0A1330"], ["ink-800", "#0E1A3B"],
  ["ink-750", "#122049"], ["ink-700", "#172856"], ["ink-600", "#1F3468"], ["ink-500", "#2B4380"],
];
const SEM = [
  ["Bull", "#22D38A", "#0B7A4A", "Profit · Correct · Long"],
  ["Bear", "#FF4B6E", "#A01E3C", "Loss · Wrong · Short"],
  ["Gold", "#FFC53D", "#B07600", "XP · Rewards · Premium"],
  ["Sky", "#3DA5FF", "#1A56A8", "Primary · Info · Links"],
  ["Violet", "#9B6BFF", "#4F2BB0", "Pro · Legendary · League"],
  ["Flame", "#FF8A3D", "#B84A10", "Streak · Hot · Urgent"],
];

function ColorTokens() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopied(hex);
    setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1100);
  };
  return (
    <Asset code="FND-01" title="Color Tokens" desc="Navy surface ramp + 6 semantic game colors, each with a 3D lip shade. Click any swatch to copy HEX." tags={["click", "copy"]} span={2}>
      <Label>Surface ramp</Label>
      <div className="grid grid-cols-8 gap-1.5 mb-5">
        {RAMP.map(([n, h]) => (
          <button key={n} onClick={() => copy(h)} className="group text-left">
            <div className="h-14 rounded-xl border border-white/10 transition-transform group-hover:-translate-y-1 group-active:translate-y-0.5 relative overflow-hidden" style={{ background: h, boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 3px 0 #02050d" }}>
              {copied === h && <span className="absolute inset-0 grid place-items-center text-[10px] font-black text-bull anim-pop">COPIED</span>}
            </div>
            <div className="text-[9px] font-bold text-fog mt-1.5 truncate">{n}</div>
            <div className="num text-[9px] text-mist">{h}</div>
          </button>
        ))}
      </div>
      <Label>Semantic · base / lip</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SEM.map(([n, c, d, use]) => (
          <button key={n} onClick={() => copy(c)} className="tile tile-hover p-2.5 flex items-center gap-3 text-left relative">
            <div className="relative w-11 h-11 shrink-0">
              <div className="absolute inset-x-0 bottom-0 h-10 rounded-xl" style={{ background: d }} />
              <div className="absolute inset-x-0 top-0 h-10 rounded-xl" style={{ background: `linear-gradient(180deg, ${c}, ${c}dd)`, boxShadow: "inset 0 2px 0 rgba(255,255,255,.35)" }} />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm">{n}</div>
              <div className="num text-[10px] text-mist">{copied === c ? <span className="text-bull">Copied ✓</span> : `${c} · ${d}`}</div>
              <div className="text-[9px] text-mist/70 truncate">{use}</div>
            </div>
          </button>
        ))}
      </div>
    </Asset>
  );
}

function Surfaces() {
  const [active, setActive] = useState(1);
  const S = [
    { n: "Base", cls: "bg-ink-800 rounded-2xl border border-white/5", spec: "flat · #0E1A3B" },
    { n: "Raised", cls: "tile", spec: "y4 · b22 · hi 9%" },
    { n: "Inset", cls: "well", spec: "inset y3 · b8" },
    { n: "Pressed", cls: "pressed", spec: "inset y4 · b10" },
  ];
  return (
    <Asset code="FND-02" title="Surface Tokens" desc="Four tactile depths. Tap to inspect — the big tile morphs between states." tags={["morph", "4 states"]}>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {S.map((s, i) => (
          <button key={s.n} onClick={() => setActive(i)} className="text-center group">
            <div className={cn(s.cls, "h-14 grid place-items-center transition-all", active === i && "ring-2 ring-sky/70 ring-offset-2 ring-offset-ink-800")}>
              <Icon name={i < 2 ? "arrowUp" : "arrowDown"} size={16} className="text-mist group-hover:text-sky transition-colors" />
            </div>
            <div className="text-[10px] font-bold mt-2">{s.n}</div>
          </button>
        ))}
      </div>
      <div className="dotgrid well p-5 flex-1 grid place-items-center min-h-[150px]">
        <div className={cn(S[active].cls, "w-40 h-24 grid place-items-center transition-all duration-300")}>
          <div className="text-center">
            <div className="font-black uppercase tracking-wider">{S[active].n}</div>
            <div className="num text-[10px] text-mist mt-1">{S[active].spec}</div>
          </div>
        </div>
      </div>
    </Asset>
  );
}

function Elevation() {
  const [gap, setGap] = useState(22);
  const [sel, setSel] = useState<number | null>(null);
  const L = [
    ["L0 · Canvas", "#0A1330", "none"],
    ["L1 · Card", "#122049", "y2 b8"],
    ["L2 · Panel", "#172856", "y4 b16"],
    ["L3 · Popover", "#1F3468", "y8 b24"],
    ["L4 · Modal", "#2B4380", "y16 b40"],
  ];
  return (
    <Asset code="FND-03" title="Elevation Stack" desc="Isometric z-layers. Drag to explode the stack, tap a layer to focus." tags={["3D", "drag"]}>
      <div className="relative h-52 grid place-items-center" style={{ perspective: 900 }}>
        <div className="relative w-28 h-28" style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg) rotateZ(-42deg)" }}>
          {L.map(([n, c], i) => (
            <button
              key={n}
              onClick={() => setSel(sel === i ? null : i)}
              className="absolute inset-0 rounded-2xl border transition-all duration-500"
              style={{
                background: sel === i ? "linear-gradient(135deg,#5cb3ff,#2d8cf0)" : `linear-gradient(135deg, ${c}, ${c}cc)`,
                borderColor: sel === i ? "#9bd0ff" : "rgba(140,175,255,.25)",
                transform: `translateZ(${i * gap}px)`,
                boxShadow: `0 0 0 1px rgba(0,0,0,.2), ${sel === i ? "0 0 30px rgba(61,165,255,.6)" : "-6px 6px 14px rgba(0,0,0,.45)"}`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1 mb-3">
        {L.slice().reverse().map(([n, , s], ri) => {
          const i = L.length - 1 - ri;
          return (
            <button key={n} onClick={() => setSel(sel === i ? null : i)} className={cn("w-full flex justify-between text-[11px] px-2.5 py-1.5 rounded-lg transition-colors", sel === i ? "bg-sky/20 text-sky" : "hover:bg-white/5 text-fog")}>
              <span className="font-bold">{n}</span><span className="num text-mist">{s}</span>
            </button>
          );
        })}
      </div>
      <input type="range" min={4} max={36} value={gap} onChange={(e) => setGap(+e.target.value)} className="w-full accent-sky" aria-label="Layer gap" />
    </Asset>
  );
}

function Radius() {
  const [r, setR] = useState(16);
  const [bw, setBw] = useState(2);
  return (
    <Asset code="FND-04" title="Radius & Borders" desc="Scale 4 → full. Live-tune a component and read the token." tags={["live", "tokens"]}>
      <div className="flex items-end justify-between gap-2 mb-4">
        {[4, 8, 12, 16, 24, 99].map((x) => (
          <button key={x} onClick={() => setR(x === 99 ? 40 : x)} className="text-center flex-1 group">
            <div className="tile aspect-square transition-transform group-hover:-translate-y-1" style={{ borderRadius: x === 99 ? 999 : x }} />
            <div className="num text-[10px] text-mist mt-1.5">{x === 99 ? "full" : x}</div>
          </button>
        ))}
      </div>
      <div className="well dotgrid p-5 grid place-items-center mb-4 flex-1">
        <div className="px-6 py-4 bg-gradient-to-b from-[#1c2d58] to-[#15244b] transition-all duration-200 text-center" style={{ borderRadius: r, border: `${bw}px solid #3da5ff`, boxShadow: `0 5px 0 #0a1430, 0 0 24px rgba(61,165,255,.25)` }}>
          <div className="text-xs font-black uppercase tracking-wider">Preview</div>
          <div className="num text-[10px] text-sky">r{r} · b{bw}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-[10px] text-mist">
        <label>Radius <b className="num text-fog">{r}px</b><input type="range" min={0} max={40} value={r} onChange={(e) => setR(+e.target.value)} className="w-full accent-sky" /></label>
        <label>Border <b className="num text-fog">{bw}px</b><input type="range" min={0} max={8} value={bw} onChange={(e) => setBw(+e.target.value)} className="w-full accent-sky" /></label>
      </div>
    </Asset>
  );
}

function Typography() {
  const [p, setP] = useState(67421.52);
  const [dir, setDir] = useState(1);
  useInterval(() => {
    const d = (Math.random() - 0.48) * 40;
    setDir(d >= 0 ? 1 : -1);
    setP((x) => x + d);
  }, 1200);
  return (
    <Asset code="FND-05" title="Typography" desc="Rubik (rounded, adult) for UI + JetBrains Mono tabular for all numbers — no jitter on live prices." tags={["live", "scale"]}>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between"><span className="text-4xl font-black tracking-tight text-grad-gold">Level Up</span><span className="num text-[10px] text-mist">Display 36/900</span></div>
        <div className="flex items-baseline justify-between"><span className="text-2xl font-extrabold">Market Basics</span><span className="num text-[10px] text-mist">H1 24/800</span></div>
        <div className="flex items-baseline justify-between"><span className="text-lg font-bold">Support & Resistance</span><span className="num text-[10px] text-mist">H2 18/700</span></div>
        <div className="flex items-baseline justify-between gap-3"><span className="text-sm text-fog">Price tends to bounce off levels where buyers stepped in before.</span><span className="num text-[10px] text-mist shrink-0">Body 14/400</span></div>
        <div className="flex items-baseline justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist">Overline caption</span><span className="num text-[10px] text-mist">Cap 10/700</span></div>
        <div className="hairline" />
        <div className="flex items-baseline justify-between">
          <span className={cn("num text-3xl font-extrabold transition-colors", dir > 0 ? "text-bull" : "text-bear")}>${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="num text-[10px] text-mist">Mono 30/800</span>
        </div>
      </div>
    </Asset>
  );
}

function Iconography() {
  const [size, setSize] = useState(24);
  const [stroke, setStroke] = useState(2);
  const [sel, setSel] = useState<string>("candles");
  const [tint, setTint] = useState("#3da5ff");
  return (
    <Asset code="FND-06" title="Iconography" desc={`${ICON_NAMES.length} custom glyphs on a 24px grid. Tune size, stroke & tint — tap to select.`} tags={["svg", "tunable"]} span={2}>
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div className="flex gap-1 well p-1">
          {[16, 20, 24, 32].map((s) => (
            <button key={s} onClick={() => setSize(s)} className={cn("num text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all", size === s ? "bg-sky text-white shadow-[0_2px_0_#1a56a8]" : "text-mist hover:text-fog")}>{s}</button>
          ))}
        </div>
        <div className="flex gap-1 well p-1">
          {[1.5, 2, 2.5, 3].map((s) => (
            <button key={s} onClick={() => setStroke(s)} className={cn("num text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all", stroke === s ? "bg-violet text-white shadow-[0_2px_0_#4f2bb0]" : "text-mist hover:text-fog")}>{s}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["#3da5ff", "#22d38a", "#ffc53d", "#ff8a3d", "#ff4b6e", "#eef3ff"].map((c) => (
            <button key={c} onClick={() => setTint(c)} className={cn("w-6 h-6 rounded-full transition-transform hover:scale-110", tint === c && "ring-2 ring-white ring-offset-2 ring-offset-ink-800")} style={{ background: c }} aria-label={c} />
          ))}
        </div>
        <div className="ml-auto num text-xs text-mist">selected: <span className="text-fog font-bold">{sel}</span></div>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-9 lg:grid-cols-12 gap-2">
        {ICON_NAMES.filter((n) => n !== "logo").map((n) => (
          <button
            key={n}
            onClick={() => setSel(n)}
            title={n}
            className={cn("aspect-square grid place-items-center rounded-xl transition-all", sel === n ? "tile scale-110" : "hover:bg-white/5")}
            style={{ color: sel === n ? tint : "#8ea3cf" }}
          >
            <Icon name={n} size={size} stroke={stroke} className={sel === n ? "anim-pop" : ""} />
          </button>
        ))}
      </div>
    </Asset>
  );
}

function SpacingMotion() {
  const [play, setPlay] = useState(0);
  const E = [
    ["snap", "cubic-bezier(.2,.9,.3,1.3)", "#22d38a"],
    ["smooth", "cubic-bezier(.4,0,.2,1)", "#3da5ff"],
    ["bounce", "cubic-bezier(.34,1.8,.64,1)", "#ffc53d"],
    ["linear", "linear", "#8ea3cf"],
  ];
  return (
    <Asset code="FND-07" title="Spacing & Motion" desc="4pt spacing ramp and 4 motion curves. Press play to compare easing side-by-side." tags={["motion", "play"]}>
      <Label>Spacing · 4pt grid</Label>
      <div className="flex items-end gap-1.5 mb-5">
        {[4, 8, 12, 16, 20, 24, 32, 40, 48].map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className="mx-auto rounded-md bg-gradient-to-t from-sky/30 to-sky/70 border border-sky/40" style={{ height: s, animation: `rise .5s ${i * 0.05}s both` }} />
            <div className="num text-[9px] text-mist mt-1">{s}</div>
          </div>
        ))}
      </div>
      <Label>Motion curves · 600ms</Label>
      <div className="space-y-2 mb-4">
        {E.map(([n, e, c]) => (
          <div key={n} className="flex items-center gap-3">
            <span className="num text-[10px] w-12 text-mist">{n}</span>
            <div className="well h-7 flex-1 relative">
              <div className="absolute top-1 w-5 h-5 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}`, left: play % 2 ? "calc(100% - 24px)" : 4, transition: `left .6s ${e}` }} />
            </div>
          </div>
        ))}
      </div>
      <Btn variant="ghost" size="sm" icon="play" onClick={() => setPlay((p) => p + 1)} block>Play curves</Btn>
    </Asset>
  );
}

export default function Foundations() {
  return (
    <Section id="foundations" index="01" title="Foundations" subtitle="Tokens that make everything feel tactile: color, depth, radius, type, icons, motion.">
      <ColorTokens />
      <Surfaces />
      <Iconography />
      <Elevation />
      <Radius />
      <Typography />
      <SpacingMotion />
    </Section>
  );
}
