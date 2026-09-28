/* 47 · TRADING WORKSPACE BUILDER — magnetic splits + preset morphs.
   Drag dividers (snap 25/50/75) · toggle panels · morph between 4 layouts. */
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, Seg } from "../showcase/Scene";
import { candlesRange, genCandles } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const PRESETS = ["Pro", "Focus", "Tape", "Mobile"] as const;
type Preset = (typeof PRESETS)[number];
const SPLITS: Record<Preset, { main: number; side: number }> = {
  Pro: { main: 66, side: 50 },
  Focus: { main: 82, side: 60 },
  Tape: { main: 50, side: 34 },
  Mobile: { main: 100, side: 50 },
};

export default function WorkspaceBuilder() {
  const [preset, setPreset] = useState<Preset>("Pro");
  const [main, setMain] = useState(66);
  const [side, setSide] = useState(50);
  const [show, setShow] = useState({ book: true, assets: true, info: true });
  const [seed, setSeed] = useState(9);
  const drag = useRef<"main" | "side" | null>(null);

  const candles = useMemo(() => genCandles(seed, 64, 100, "trend", 60_000), [seed]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);
  const W = 560, H = 220;
  const y = (v: number) => 10 + (1 - (v - min) / (max - min || 1)) * (H - 20);
  const bw = W / candles.length;

  const snap = (v: number) => {
    const pts = [25, 33, 50, 66, 75];
    for (const p of pts) if (Math.abs(v - p) < 3.5) return p;
    return Math.max(20, Math.min(85, v));
  };

  const applyPreset = (p: Preset) => {
    setPreset(p);
    setMain(SPLITS[p].main);
    setSide(SPLITS[p].side);
    sfx.whoosh();
  };

  const onMove = (e: React.PointerEvent, zone: HTMLElement | null, kind: "main" | "side") => {
    if (drag.current !== kind || !zone) return;
    const r = zone.getBoundingClientRect();
    const frac = kind === "main" ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100;
    if (kind === "main") setMain(snap(frac));
    else setSide(snap(frac));
    setPreset("Pro");
  };

  const book = useMemo(
    () => Array.from({ length: 10 }, (_, i) => ({ b: 0.3 + Math.random() * 2, a: 0.3 + Math.random() * 2, i })),
    [seed],
  );
  const assets = [
    { s: "BTC", c: "#F7931A", v: "+2.84%" }, { s: "ETH", c: "#8fa2ff", v: "+1.92%" },
    { s: "SOL", c: "#14F195", v: "-1.24%" }, { s: "TON", c: "#0098EA", v: "-0.82%" },
  ];

  return (
    <ShowcaseSection
      id="workspace" index="47" kicker="Workspace Builder" title="Конструктор терминала"
      desc="Тяни разделители — они магнитно липнут к 25/50/75. Прячь панели и morph'ся между четырьмя готовыми компоновками."
      accent="#8ef23c"
      variant="grid"
      keys={[{ k: "1–4", d: "компоновка" }]}
      hotkeys={{ "1": () => applyPreset("Pro"), "2": () => applyPreset("Focus"), "3": () => applyPreset("Tape"), "4": () => applyPreset("Mobile") }}
      tags={<div className="flex gap-2"><Tag tone="green">{preset}</Tag><Tag tone="ghost">{Math.round(main)}/{Math.round(side)}</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Seg options={PRESETS} value={preset} onChange={applyPreset} accent="#8ef23c" />
        <div className="ml-auto flex gap-1.5">
          {(["book", "assets", "info"] as const).map((k) => (
            <button key={k} onClick={() => { setShow((s) => ({ ...s, [k]: !s[k] })); sfx.tick(); }}
              className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase", show[k] ? "bg-white/12 text-white" : "bg-white/5 text-[#54678f]")}>{k}</button>
          ))}
          <button onClick={() => setSeed((s) => s + 1)} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]">New data</button>
        </div>
      </div>

      <div
        className="relative flex h-[440px] gap-0 overflow-hidden rounded-[24px] border border-white/12 bg-[#060d24]"
        onPointerMove={(e) => onMove(e, e.currentTarget, "main")}
        onPointerUp={() => { drag.current = null; }}
      >
        {/* main chart */}
        <motion.div className="relative h-full p-3" initial={false} animate={{ width: preset === "Mobile" ? "100%" : `${main}%` }} transition={{ type: "spring", stiffness: 120, damping: 22 }}>
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#101f47] to-[#070f2b]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <p className="display text-sm font-extrabold text-white">BTC/USDT · chart</p>
              <span className="num-mono text-[11px] text-[#8ef23c]">{main.toFixed(0)}% width</span>
            </div>
            <div className="flex-1 p-2">
              <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
                {candles.map((c, i) => {
                  const up = c.c >= c.o;
                  const col = up ? "#2ede8a" : "#ff5470";
                  return (
                    <g key={i}>
                      <line x1={i * bw + bw / 2} x2={i * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.1} />
                      <rect x={i * bw + bw * 0.22} y={y(Math.max(c.o, c.c))} width={bw * 0.56} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={1} />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </motion.div>

        {/* main divider */}
        {preset !== "Mobile" && (
          <div
            className="relative z-10 w-3 cursor-ew-resize touch-none"
            onPointerDown={(e) => { drag.current = "main"; (e.target as Element).setPointerCapture?.(e.pointerId); sfx.tick(); }}
          >
            <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-[#8ef23c]" style={{ boxShadow: "0 0 14px #8ef23c" }} />
            <div className="absolute left-1/2 top-1/2 flex h-12 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#8ef23c] text-[10px] font-black text-[#0a2210]">⇔</div>
          </div>
        )}

        {/* side stack */}
        {preset !== "Mobile" && (
          <motion.div className="relative h-full flex-1 p-3 pl-0" initial={false} animate={{ opacity: 1 }}>
            <div
              className="flex h-full flex-col gap-0"
              onPointerMove={(e) => { e.stopPropagation(); onMove(e, e.currentTarget, "side"); }}
            >
              {show.book && (
                <motion.div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a1740]" initial={false} animate={{ height: `${side}%` }}>
                  <p className="border-b border-white/10 px-3 py-2 text-[11px] font-extrabold text-white">Order book</p>
                  <div className="space-y-1 p-2">
                    {book.slice(0, 6).map((r) => (
                      <div key={r.i} className="flex gap-1">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40"><div className="h-full rounded-full bg-[#2ede8a]" style={{ width: `${r.b * 30}%` }} /></div>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40"><div className="ml-auto h-full rounded-full bg-[#ff5470]" style={{ width: `${r.a * 30}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {/* side divider */}
              <div className="relative h-3 cursor-ns-resize touch-none" onPointerDown={(e) => { drag.current = "side"; (e.target as Element).setPointerCapture?.(e.pointerId); sfx.tick(); }}>
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#5b8cff]" style={{ boxShadow: "0 0 12px #5b8cff" }} />
              </div>
              <motion.div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden" initial={false} animate={{ opacity: 1 }}>
                {show.assets && (
                  <div className="rounded-2xl border border-white/10 bg-[#0a1740] p-2">
                    <p className="px-1 pb-1 text-[11px] font-extrabold text-white">Assets</p>
                    {assets.map((a) => (
                      <div key={a.s} className="flex items-center justify-between rounded-lg px-2 py-1 text-[11px]">
                        <span className="font-extrabold" style={{ color: a.c }}>{a.s}</span>
                        <span className={cn("num-mono font-bold", a.v.startsWith("+") ? "text-[#2ede8a]" : "text-[#ff5470]")}>{a.v}</span>
                      </div>
                    ))}
                  </div>
                )}
                {show.info && (
                  <div className="rounded-2xl border border-[#8ef23c]/30 bg-[#8ef23c]/8 p-3">
                    <p className="text-[11px] font-extrabold text-[#a4ff5e]">Session info</p>
                    <p className="mt-1 text-[11px] leading-snug text-[#c9d8ff]">Разделители липнут к сетке. Пресеты — это сохранённые пропорции {Math.round(main)}/{Math.round(side)}.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      <p className="mt-3 text-center text-[11px] text-[#7d92c4]">Запоминающийся момент: магнитный snap и пружинный morph компоновки</p>
    </ShowcaseSection>
  );
}
