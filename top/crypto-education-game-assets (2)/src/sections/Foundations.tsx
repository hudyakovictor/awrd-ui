import { useState } from "react";
import { Asset, Label, Section, Segmented, haptic } from "../components/ui";
import {
  BearIcon,
  BullIcon,
  ChestIcon,
  CoinIcon,
  FlameIcon,
  GemIcon,
  HeartIcon,
  Icon,
  ShieldIcon,
  TrophyIcon,
  XPIcon,
  iconNames,
} from "../components/icons";
import { cn } from "../utils/cn";

const palettes = [
  { group: "Surface", items: [["ink-950", "#050B1C"], ["ink-900", "#0A1330"], ["ink-800", "#122247"], ["ink-700", "#1C3365"], ["ink-600", "#27427D"], ["ink-400", "#5C79B5"], ["ink-200", "#BCCBEA"], ["ink-100", "#E3EAF8"]] },
  { group: "Signal", items: [["bull", "#22D39A"], ["bull-lip", "#0C8F63"], ["bear", "#FF4D6D"], ["bear-lip", "#B31F3D"]] },
  { group: "Reward", items: [["gold / XP", "#FFC23D"], ["flame", "#FF7A2F"], ["gem", "#2FD4FF"], ["azure", "#3E8BFF"], ["violet", "#9170FF"]] },
];

function Tokens() {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <Asset title="Color Tokens" code="F-01" tags="color palette tokens hex" span={5}>
      <div className="space-y-4">
        {palettes.map((p) => (
          <div key={p.group}>
            <Label>{p.group}</Label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 xl:grid-cols-4 2xl:grid-cols-8">
              {p.items.map(([n, hex]) => (
                <button
                  key={n}
                  onClick={() => {
                    navigator.clipboard?.writeText(hex).catch(() => {});
                    haptic();
                    setCopied(hex);
                    setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
                  }}
                  className="group/sw text-left"
                >
                  <div
                    className="relative h-12 rounded-xl ring-1 ring-white/10 transition-transform duration-200 group-hover/sw:-translate-y-1 group-active/sw:translate-y-0.5"
                    style={{ background: hex, boxShadow: `0 4px 0 color-mix(in srgb, ${hex} 55%, black), inset 0 1px 0 rgba(255,255,255,.3)` }}
                  >
                    {copied === hex && (
                      <span className="anim-pop absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 text-white">
                        <Icon name="check" size={18} stroke={3} />
                      </span>
                    )}
                  </div>
                  <div className="mt-2 truncate text-[10px] font-bold text-ink-200">{n}</div>
                  <div className="font-mono text-[9px] text-ink-400">{hex}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="text-[11px] text-ink-400">Tap a swatch to copy HEX.</div>
      </div>
    </Asset>
  );
}

function Surfaces() {
  const [active, setActive] = useState(1);
  const layers = [
    { n: "Base", cls: "panel", spec: "y6 · #081231" },
    { n: "Raised", cls: "panel-raised", spec: "y5 · blur 24" },
    { n: "Inset", cls: "panel-inset", spec: "inset y3 · blur 8" },
    { n: "Pressed", cls: "panel-pressed", spec: "inset y4 · blur 10" },
  ];
  return (
    <Asset title="Surface Tokens" code="F-02" tags="surface base raised inset pressed layers" span={4}>
      <div className="flex gap-5">
        <div className="relative h-56 w-36 shrink-0" style={{ perspective: 600 }}>
          {layers.map((l, i) => (
            <div
              key={l.n}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                l.cls,
                "absolute left-2 h-24 w-28 cursor-pointer rounded-2xl transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]",
                active === i && "ring-2 ring-cyan-300/70",
              )}
              style={{
                top: i * 38 + (active === i ? -8 : 0),
                transform: `rotateX(55deg) rotateZ(-40deg) ${active === i ? "translateZ(22px)" : ""}`,
                zIndex: 10 - i,
              }}
            />
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2">
          {layers.map((l, i) => (
            <button
              key={l.n}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-xl px-3 py-2 text-left transition",
                active === i ? "panel-raised" : "hover:bg-white/5",
              )}
            >
              <div className="text-sm font-extrabold text-white">{l.n}</div>
              <div className="font-mono text-[10px] text-ink-400">{l.spec}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {layers.map((l, i) => (
          <div key={l.n} className={cn(l.cls, "flex h-16 items-center justify-center rounded-2xl transition-all", active === i && "ring-2 ring-cyan-300/60")}>
            <Icon name={i < 2 ? "arrowUp" : "arrowDown"} size={16} className="text-ink-300" />
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Elevation() {
  const [lvl, setLvl] = useState(2);
  const levels = [
    { n: "Flat", d: 0, b: 0, use: "Inline content" },
    { n: "Subtle", d: 2, b: 8, use: "List rows, chips" },
    { n: "Card", d: 5, b: 20, use: "Cards, tiles" },
    { n: "Popover", d: 8, b: 32, use: "Menus, tooltips" },
    { n: "Modal", d: 12, b: 48, use: "Sheets, dialogs" },
  ];
  const L = levels[lvl];
  return (
    <Asset title="Elevation Levels" code="F-03" tags="elevation shadow depth" span={3}>
      <div className="space-y-2">
        {levels.map((l, i) => (
          <button
            key={l.n}
            onClick={() => setLvl(i)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition-all duration-300",
              i === lvl ? "bg-gradient-to-b from-[#2b4a8a] to-ink-600 text-white" : "bg-ink-800 text-ink-300 hover:text-white",
            )}
            style={{ boxShadow: `0 ${l.d}px 0 #081231, 0 ${l.d + 4}px ${l.b}px -6px rgba(0,0,0,.7)`, transform: `translateY(${-l.d / 2}px)` }}
          >
            <span>L{i} · {l.n}</span>
            <span className="font-mono text-[10px] text-ink-400">y{l.d}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-ink-950/50 p-3 text-[11px] text-ink-300">
        <span className="font-bold text-cyan-300">Use: </span>
        {L.use}
      </div>
    </Asset>
  );
}

function RadiusBorders() {
  const [hover, setHover] = useState<number | null>(null);
  const radii = [4, 8, 12, 16, 22, 999];
  const borders = [1, 2, 3, 4, 6];
  return (
    <Asset title="Radius & Borders" code="F-04" tags="radius border corners stroke" span={4}>
      <Label>Radius scale</Label>
      <div className="grid grid-cols-6 gap-2">
        {radii.map((r, i) => (
          <div key={r} className="text-center" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <div
              className="panel-raised mx-auto aspect-square w-full transition-all duration-300"
              style={{ borderRadius: hover === i ? 999 : r, transform: hover === i ? "translateY(-4px) rotate(8deg)" : undefined }}
            />
            <div className="mt-1.5 font-mono text-[10px] text-ink-400">{r === 999 ? "full" : r}</div>
          </div>
        ))}
      </div>
      <Label className="mt-5">Border thickness</Label>
      <div className="grid grid-cols-5 gap-2">
        {borders.map((b) => (
          <div key={b} className="text-center">
            <div className="group/b mx-auto aspect-square w-full rounded-xl bg-ink-850 transition-colors hover:border-cyan-300" style={{ borderWidth: b, borderColor: "#3e8bff", borderStyle: "solid", boxShadow: `0 0 ${b * 3}px rgba(62,139,255,.35)` }} />
            <div className="mt-1.5 font-mono text-[10px] text-ink-400">{b}px</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Spacing() {
  const [base, setBase] = useState<"4" | "8">("4");
  const b = Number(base);
  const steps = [1, 2, 3, 4, 5, 6, 8, 10];
  return (
    <Asset title="Spacing Scale" code="F-05" tags="spacing grid gap padding" span={4}>
      <Segmented
        value={base}
        onChange={setBase}
        options={[
          { value: "4", label: "4pt grid" },
          { value: "8", label: "8pt grid" },
        ]}
      />
      <div className="mt-4 space-y-1.5">
        {steps.map((s) => (
          <div key={s} className="flex items-center gap-3">
            <span className="w-8 font-mono text-[10px] text-ink-400">×{s}</span>
            <div
              className="h-4 rounded-md bg-gradient-to-r from-azure to-cyan shadow-[0_2px_0_#1c55c2] transition-all duration-500"
              style={{ width: Math.min(s * b * 2.2, 240) }}
            />
            <span className="font-mono text-[10px] text-ink-200">{s * b}px</span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Typography() {
  const [txt, setTxt] = useState("Buy the dip?");
  return (
    <Asset title="Typography" code="F-06" tags="type font typography heading numbers" span={4}>
      <input
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        className="panel-inset mb-4 h-10 w-full rounded-xl px-3 text-sm text-white outline-none focus:ring-2 focus:ring-azure"
        placeholder="Type to preview"
      />
      <div className="space-y-3">
        <div>
          <div className="font-display text-3xl font-black leading-none text-white">{txt || "Aa"}</div>
          <div className="mt-1 font-mono text-[10px] text-ink-400">Display · Unbounded 900 · 32/1.0</div>
        </div>
        <div>
          <div className="font-display text-lg font-bold text-white">{txt || "Aa"}</div>
          <div className="font-mono text-[10px] text-ink-400">Title · Unbounded 700 · 18</div>
        </div>
        <div>
          <div className="text-sm font-bold text-ink-100">{txt || "Aa"} — Body copy for lessons.</div>
          <div className="font-mono text-[10px] text-ink-400">Body · Manrope 700 · 14</div>
        </div>
        <div>
          <div className="font-mono text-xl font-bold text-bull">+$12,480.52</div>
          <div className="font-mono text-[10px] text-ink-400">Numeric · JetBrains Mono · tabular</div>
        </div>
      </div>
    </Asset>
  );
}

function Iconography() {
  const [size, setSize] = useState(22);
  const [stroke, setStroke] = useState(2.2);
  const [picked, setPicked] = useState("flame");
  const game = [
    ["Streak", FlameIcon],
    ["Lives", HeartIcon],
    ["Gems", GemIcon],
    ["XP", XPIcon],
    ["Coins", CoinIcon],
    ["Trophy", TrophyIcon],
    ["Bull", BullIcon],
    ["Bear", BearIcon],
  ] as const;
  return (
    <Asset title="Iconography" code="F-07" tags="icons iconography glyphs game icons volumetric" span={12}>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-[11px] font-bold text-ink-300">
              SIZE
              <input type="range" min={14} max={32} value={size} onChange={(e) => setSize(+e.target.value)} className="accent-cyan-400" />
              <span className="w-8 font-mono text-cyan-300">{size}</span>
            </label>
            <label className="flex items-center gap-2 text-[11px] font-bold text-ink-300">
              STROKE
              <input type="range" min={1} max={3} step={0.1} value={stroke} onChange={(e) => setStroke(+e.target.value)} className="accent-cyan-400" />
              <span className="w-8 font-mono text-cyan-300">{stroke.toFixed(1)}</span>
            </label>
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-9 lg:grid-cols-10">
            {iconNames.map((n) => (
              <button
                key={n}
                title={n}
                onClick={() => {
                  setPicked(n);
                  haptic();
                }}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl text-ink-200 transition-all hover:-translate-y-0.5 hover:text-white",
                  picked === n ? "panel-raised text-cyan-300" : "bg-ink-850 hover:bg-ink-750",
                )}
              >
                <Icon name={n} size={size} stroke={stroke} />
              </button>
            ))}
          </div>
          <div className="mt-3 font-mono text-[11px] text-ink-400">
            selected: <span className="text-cyan-300">{picked}</span> · 24px grid · round caps
          </div>
        </div>
        <div>
          <Label>Volumetric game icons</Label>
          <div className="grid grid-cols-4 gap-2">
            {game.map(([n, C]) => (
              <div key={n} className="panel-raised group/gi flex flex-col items-center gap-1 rounded-2xl py-3">
                <div className="transition-transform duration-300 group-hover/gi:-translate-y-1 group-hover/gi:scale-110">
                  <C size={34} />
                </div>
                <span className="text-[9px] font-bold uppercase text-ink-300">{n}</span>
              </div>
            ))}
          </div>
          <Label className="mt-4">League tiers</Label>
          <div className="flex justify-between">
            {(["bronze", "silver", "gold", "diamond", "elite"] as const).map((t) => (
              <div key={t} className="flex flex-col items-center transition-transform hover:-translate-y-1">
                <ShieldIcon tier={t} size={40} />
                <span className="text-[9px] font-bold uppercase text-ink-400">{t}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-400">
            <ChestIcon size={24} /> Rewards
          </div>
        </div>
      </div>
    </Asset>
  );
}

export default function Foundations() {
  return (
    <Section id="foundations" index="01" kicker="Design tokens" title="Foundations">
      <Tokens />
      <Surfaces />
      <Elevation />
      <RadiusBorders />
      <Spacing />
      <Typography />
      <Iconography />
    </Section>
  );
}
