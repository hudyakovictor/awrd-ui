import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Grid, Section, Tag, useCopy, blip } from "../components/kit";
import { Icon, ICON_NAMES } from "../components/icons";
import { cn } from "../utils/cn";

/* ---------------- palette ---------------- */
const PALETTE = [
  { g: "Depth", items: [["abyss", "#04060E"], ["navy-950", "#070B18"], ["navy-850", "#0C142A"], ["navy-750", "#13203E"], ["navy-600", "#1E3159"], ["navy-400", "#37538C"]] },
  { g: "Signal", items: [["bull", "#2BE08A"], ["bear", "#FF4D6A"], ["gold", "#FFC24B"], ["aqua", "#38E1FF"], ["violet", "#9B6BFF"], ["ink-300", "#A3B1D2"]] },
];

function Palette() {
  const { copied, copy } = useCopy();
  return (
    <div className="space-y-3">
      {PALETTE.map((row) => (
        <div key={row.g}>
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500">{row.g}</div>
          <div className="grid grid-cols-6 gap-1.5">
            {row.items.map(([name, hex]) => (
              <button
                key={name}
                onClick={() => copy(hex)}
                className="group relative aspect-square overflow-hidden rounded-xl transition-transform duration-200 hover:scale-[1.09] hover:z-10"
                style={{ background: hex, boxShadow: `inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 6px rgba(0,0,0,.5), 0 6px 14px -6px ${hex}66` }}
              >
                <span className="absolute inset-x-0 bottom-0 bg-black/55 py-0.5 text-center font-mono text-[7px] font-bold tracking-tight text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  {copied === hex ? "COPIED" : hex}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- surfaces ---------------- */
const SURFACES = [
  { k: "sf-base", n: "Base", d: "y2 b6 · α.45" },
  { k: "sf-raised", n: "Raised", d: "y10 b24 · α.85" },
  { k: "sf-inset", n: "Inset", d: "in y3 b8" },
  { k: "sf-pressed", n: "Pressed", d: "in y4 b10" },
  { k: "sf-glass", n: "Glass", d: "blur 14" },
];

function SurfaceLab() {
  const [sel, setSel] = useState(1);
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="grid grid-cols-5 gap-2">
        {SURFACES.map((s, i) => (
          <button
            key={s.k}
            onMouseEnter={() => setSel(i)}
            onClick={() => { setSel(i); blip("tap"); }}
            className={cn("group relative h-14 rounded-xl transition-all duration-300 hairline", s.k, sel === i && "scale-[1.06]")}
            style={sel === i ? { boxShadow: "inset 0 0 0 1px var(--accent), 0 0 22px -6px var(--accent-glow)" } : undefined}
          >
            <span className="absolute inset-0 grid place-items-center font-mono text-[8px] font-bold uppercase tracking-wider text-ink-400 group-hover:text-white">
              {s.n}
            </span>
          </button>
        ))}
      </div>
      <div className="sf-inset hairline mt-auto rounded-lg px-2.5 py-1.5 font-mono text-[9px] tracking-wide text-ink-400">
        <span style={{ color: "var(--accent)" }}>.{SURFACES[sel].k}</span> → shadow {SURFACES[sel].d}
      </div>
    </div>
  );
}

/* ---------------- elevation ---------------- */
function Elevation() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState({ x: 0, y: 0 });
  const layers = [0, 1, 2, 3, 4, 5];
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setP({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
      }}
      onMouseLeave={() => setP({ x: 0, y: 0 })}
      className="relative h-[168px] w-full"
      style={{ perspective: "800px" }}
    >
      {layers.map((i) => (
        <motion.div
          key={i}
          animate={{ x: p.x * (i + 1) * 9, y: -i * 19 + p.y * (i + 1) * 5, rotateX: 52 + p.y * 6, rotateZ: -34 + p.x * 6 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="absolute left-1/2 top-[54%] h-[74px] w-[124px] -translate-x-1/2 rounded-[14px]"
          style={{
            transformStyle: "preserve-3d",
            background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) ${8 + i * 13}%, #16233f), #0b1224)`,
            boxShadow: `0 ${4 + i * 3}px ${10 + i * 8}px -4px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.18)`,
            zIndex: i,
          }}
        >
          <span className="absolute right-2 top-1.5 font-mono text-[7px] font-bold text-ink-300/70">L{i}</span>
        </motion.div>
      ))}
      <div className="absolute bottom-0 left-0 font-mono text-[9px] leading-relaxed text-ink-500">
        <div>L0 flat · L1 hover · L2 card</div>
        <div>L3 sheet · L4 modal · L5 toast</div>
      </div>
    </div>
  );
}

/* ---------------- radius ---------------- */
function RadiusScale() {
  const [r, setR] = useState(18);
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-end justify-center gap-2">
        {[4, 10, 18, 26, 999].map((v) => (
          <button
            key={v}
            onClick={() => { setR(v); blip("tap"); }}
            className={cn("sf-raised hairline h-11 w-11 shrink-0 transition-all duration-300", r === v && "scale-110")}
            style={{ borderRadius: v, boxShadow: r === v ? "inset 0 0 0 1px var(--accent), 0 0 20px -6px var(--accent-glow)" : undefined }}
          />
        ))}
      </div>
      <div
        className="mx-auto grid h-16 w-full max-w-[210px] place-items-center bg-[linear-gradient(135deg,#1b2b4e,#0d1429)] transition-[border-radius] duration-300 hairline-strong"
        style={{ borderRadius: r }}
      >
        <span className="tnum font-mono text-[11px] font-bold" style={{ color: "var(--accent)" }}>
          radius / {r === 999 ? "full" : `${r}px`}
        </span>
      </div>
      <input type="range" min={0} max={40} value={Math.min(r, 40)} onChange={(e) => setR(+e.target.value)} className="accent-[var(--accent)]" />
    </div>
  );
}

/* ---------------- spacing ---------------- */
function Spacing() {
  const steps = [2, 4, 8, 12, 16, 24, 32, 48];
  const [h, setH] = useState<number | null>(null);
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2" onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)}>
          <span className="w-7 shrink-0 font-mono text-[8px] text-ink-500">s{i + 1}</span>
          <motion.div
            animate={{ width: s * 3.4, opacity: h === i ? 1 : 0.55 }}
            className="h-2 rounded-full"
            style={{ background: "linear-gradient(90deg,var(--accent),color-mix(in srgb,var(--accent) 30%,transparent))" }}
          />
          <span className="tnum font-mono text-[8px] text-ink-400">{s}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- typography ---------------- */
const TYPE = [
  { n: "Display / 900", s: "text-[30px] font-black tracking-tight", t: "Bull Run" },
  { n: "Title / 800", s: "text-[20px] font-extrabold tracking-tight", t: "Lesson Complete" },
  { n: "Body / 500", s: "text-[13px] font-medium", t: "Support & resistance zones" },
  { n: "Mono / 700", s: "font-mono text-[12px] font-bold tnum", t: "BTC 68,412.55 +2.14%" },
  { n: "Micro / 700", s: "font-mono text-[9px] font-bold uppercase tracking-[0.22em]", t: "STREAK · DAY 42" },
];

function TypeScale() {
  return (
    <div className="space-y-2.5">
      {TYPE.map((t) => (
        <div key={t.n} className="group flex items-baseline gap-3 rounded-lg px-1.5 py-1 transition-colors hover:bg-[rgba(90,130,220,.08)]">
          <span className="w-[86px] shrink-0 font-mono text-[8px] uppercase tracking-wider text-ink-500">{t.n}</span>
          <span className={cn("truncate text-white transition-colors group-hover:text-[var(--accent)]", t.s)}>{t.t}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- iconography ---------------- */
function IconForge() {
  const [size, setSize] = useState(22);
  const [sw, setSw] = useState(1.7);
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="grid grid-cols-9 gap-1.5 sm:grid-cols-12">
        {ICON_NAMES.map((n, i) => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.22, y: -3 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 16 }}
            onClick={() => blip("tap")}
            title={n}
            className="group grid aspect-square place-items-center rounded-lg sf-base hairline text-ink-300 transition-colors hover:text-[var(--accent)]"
            style={{ animationDelay: `${i * 20}ms` }}
          >
            <Icon name={n} size={size} strokeWidth={sw} />
          </motion.button>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 font-mono text-[9px] text-ink-400">
          SIZE
          <input type="range" min={14} max={30} value={size} onChange={(e) => setSize(+e.target.value)} className="w-24 accent-[var(--accent)]" />
          <span className="tnum w-6" style={{ color: "var(--accent)" }}>{size}</span>
        </label>
        <label className="flex items-center gap-2 font-mono text-[9px] text-ink-400">
          STROKE
          <input type="range" min={10} max={30} value={sw * 10} onChange={(e) => setSw(+e.target.value / 10)} className="w-24 accent-[var(--accent)]" />
          <span className="tnum w-6" style={{ color: "var(--accent)" }}>{sw.toFixed(1)}</span>
        </label>
        <Tag tone="accent">{ICON_NAMES.length} glyphs · 24 grid</Tag>
      </div>
    </div>
  );
}

/* ---------------- motion curves ---------------- */
const CURVES = [
  { n: "snap", e: [0.22, 1, 0.36, 1] },
  { n: "bounce", e: [0.34, 1.56, 0.64, 1] },
  { n: "glide", e: [0.4, 0, 0.2, 1] },
  { n: "impact", e: [0.7, 0, 0.84, 0] },
];

function MotionCurves() {
  const [k, setK] = useState(0);
  return (
    <div className="flex h-full flex-col gap-2">
      {CURVES.map((c) => (
        <div key={c.n} className="relative h-7 overflow-hidden rounded-lg sf-inset px-1">
          <motion.div
            key={`${c.n}-${k}`}
            initial={{ x: 0 }}
            animate={{ x: "calc(100% - 22px)" }}
            transition={{ duration: 1.1, ease: c.e as [number, number, number, number], repeat: Infinity, repeatType: "reverse", repeatDelay: 0.25 }}
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full"
            style={{ background: "var(--accent)", boxShadow: "0 0 14px var(--accent-glow)", left: 4 }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-wider text-ink-500">
            {c.n} · {(c.e as number[]).join(",")}
          </span>
        </div>
      ))}
      <button onClick={() => { setK((v) => v + 1); blip("tap"); }} className="mt-auto font-mono text-[9px] uppercase tracking-widest text-ink-400 hover:text-[var(--accent)]">
        ↻ replay timeline
      </button>
    </div>
  );
}

/* ---------------- gradients ---------------- */
const GRADS = [
  ["Bull Surge", "linear-gradient(135deg,#2be08a,#0d9f8f)"],
  ["Bear Drop", "linear-gradient(135deg,#ff4d6a,#7b1e7a)"],
  ["Bullion", "linear-gradient(135deg,#ffe0a0,#e39312)"],
  ["Deep Sea", "linear-gradient(135deg,#1e3159,#070b18)"],
  ["Neon Grid", "linear-gradient(135deg,#38e1ff,#9b6bff)"],
  ["Molten", "linear-gradient(135deg,#ffc24b,#ff4d6a)"],
];

function Gradients() {
  const { copied, copy } = useCopy();
  return (
    <div className="grid grid-cols-3 gap-2">
      {GRADS.map(([n, g]) => (
        <button
          key={n}
          onClick={() => copy(g)}
          className="group relative h-16 overflow-hidden rounded-xl transition-transform hover:scale-[1.05]"
          style={{ backgroundImage: g, boxShadow: "inset 0 1px 0 rgba(255,255,255,.3), 0 8px 18px -8px rgba(0,0,0,.9)" }}
        >
          <span className="grad-pan absolute inset-0" style={{ backgroundImage: g }} />
          <span className="absolute inset-x-0 bottom-0 bg-black/45 py-0.5 text-center font-mono text-[7.5px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {copied === g ? "copied ✓" : n}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- borders ---------------- */
function Borders() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5">
      {[1, 1.5, 2, 3].map((w) => (
        <div key={w} className="flex items-center gap-3">
          <span className="w-9 shrink-0 font-mono text-[8px] text-ink-500">{w}px</span>
          <div className="h-8 flex-1 rounded-lg sf-base transition-all duration-300 hover:shadow-[0_0_20px_-6px_var(--accent-glow)]" style={{ border: `${w}px solid color-mix(in srgb, var(--accent) ${28 + w * 16}%, transparent)` }} />
        </div>
      ))}
    </div>
  );
}

export default function Foundations() {
  return (
    <Section id="foundations" index="01" title="Foundations" kicker="Tokens · Surfaces · Elevation · Motion" count="10 assets">
      <Grid>
        <Cell title="Color Tokens" spec="12 · click=copy" span="col-span-2 lg:col-span-2"><Palette /></Cell>
        <Cell title="Surface Tokens" spec="5 states" span="col-span-2"><SurfaceLab /></Cell>
        <Cell title="Elevation Stack" spec="L0–L5 · parallax" span="col-span-2"><Elevation /></Cell>
        <Cell title="Radius Scale" spec="0–40 · full" span="col-span-2"><RadiusScale /></Cell>
        <Cell title="Spacing Scale" spec="8 steps · 4pt" span="col-span-1 lg:col-span-1"><Spacing /></Cell>
        <Cell title="Border Weights" spec="1–3px" span="col-span-1"><Borders /></Cell>
        <Cell title="Type Ramp" spec="5 roles" span="col-span-2"><TypeScale /></Cell>
        <Cell title="Iconography Forge" spec="live size + stroke" span="col-span-2 md:col-span-4 lg:col-span-4"><IconForge /></Cell>
        <Cell title="Motion Curves" spec="4 easings" span="col-span-2"><MotionCurves /></Cell>
        <Cell title="Gradient Vault" spec="6 · click=copy" span="col-span-2 lg:col-span-6"><Gradients /></Cell>
      </Grid>
    </Section>
  );
}
