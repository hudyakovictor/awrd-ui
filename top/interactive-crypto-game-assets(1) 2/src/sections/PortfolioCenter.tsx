/* 41 · PORTFOLIO COMMAND CENTER — allocation you can grab.
   Drag dividers → donut, treemap, risk gauge and color mood rebuild. */
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { closesPath, genCandles } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const ASSETS = [
  { sym: "BTC", color: "#F7931A", chg: 2.84, vol: 0.42 },
  { sym: "ETH", color: "#8fa2ff", chg: 1.92, vol: 0.58 },
  { sym: "SOL", color: "#14F195", chg: -1.24, vol: 0.81 },
  { sym: "BNB", color: "#F0B90B", chg: 0.64, vol: 0.5 },
  { sym: "TON", color: "#0098EA", chg: -0.82, vol: 0.66 },
  { sym: "USDT", color: "#26A17B", chg: 0.01, vol: 0.05 },
];

const PRESETS: Record<string, number[]> = {
  Balanced: [30, 22, 14, 12, 10, 12],
  "BTC Maxi": [58, 16, 8, 6, 4, 8],
  Degen: [18, 18, 30, 12, 18, 4],
  Stable: [12, 10, 6, 6, 6, 60],
};

export default function PortfolioCenter() {
  const [alloc, setAlloc] = useState<number[]>(PRESETS.Balanced);
  const [focus, setFocus] = useState(0);
  const [preset, setPreset] = useState("Balanced");
  const barRef = useRef<HTMLDivElement>(null);
  const dragIdx = useRef<number | null>(null);

  const sparks = useMemo(() => ASSETS.map((_, i) => genCandles(51 + i * 19, 40, 100, "volatile", 60_000).map((c) => c.c)), []);
  const total = alloc.reduce((a, b) => a + b, 0) || 1;
  const norm = alloc.map((a) => (a / total) * 100);
  const pnl = ASSETS.reduce((a, s, i) => a + (s.chg * norm[i]) / 100, 0);
  const risk = ASSETS.reduce((a, s, i) => a + s.vol * norm[i], 0);
  const concentration = Math.max(...norm);
  const mood = concentration > 50 ? { t: "Concentrated", c: "#ff5470" } : risk > 55 ? { t: "Aggressive", c: "#ffc531" } : { t: "Balanced", c: "#2ede8a" };

  // donut segments
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  const segs = norm.map((v, i) => {
    const start = acc;
    acc += v;
    return { ...ASSETS[i], v, start };
  });

  const onDivider = (idx: number, clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const frac = Math.max(0.02, Math.min(0.98, (clientX - r.left) / r.width)) * 100;
    // idx = divider after asset idx; redistribute between idx and idx+1 keeping others
    setAlloc((prev) => {
      const t = prev.reduce((a, b) => a + b, 0) || 100;
      const leftTarget = (frac / 100) * t;
      const leftSum = prev.slice(0, idx + 1).reduce((a, b) => a + b, 0);
      const pair = prev[idx] + prev[idx + 1];
      const delta = leftTarget - (leftSum - prev[idx]);
      const a = Math.max(2, Math.min(pair - 2, delta));
      const n = [...prev];
      n[idx] = a;
      n[idx + 1] = pair - a;
      return n;
    });
  };

  const f = ASSETS[focus];

  return (
    <ShowcaseSection
      id="portfolio" index="41" kicker="Portfolio Center" title="Портфель, который можно трогать"
      desc="Тяни разделители долей — пончик, карта, риск-метр и настроение блока перестраиваются целиком. Пресеты показывают, как меняется характер портфеля."
      accent={mood.c}
      tags={<div className="flex gap-2"><Tag tone={pnl >= 0 ? "green" : "red"}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}% · 24h</Tag><Tag tone="gold">{mood.t}</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(PRESETS).map((p) => (
          <button key={p} onClick={() => { setPreset(p); setAlloc(PRESETS[p]); sfx.pop(); }}
            className={cn("rounded-xl px-4 py-2 text-[11px] font-extrabold transition", preset === p ? "text-[#081130]" : "bg-white/5 text-[#8ea6d8]")}
            style={preset === p ? { background: mood.c } : undefined}>{p}</button>
        ))}
      </div>

      {/* draggable stacked bar */}
      <div className="panel-inset relative mb-4 p-3">
        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Allocation · drag dividers</p>
        <div ref={barRef} className="relative flex h-14 overflow-visible rounded-2xl">
          {segs.map((s, i) => (
            <motion.div key={s.sym} className="relative h-full" initial={false} animate={{ width: `${s.v}%` }} transition={{ type: "spring", stiffness: 160, damping: 22 }}
              style={{ background: `linear-gradient(180deg, ${s.color}, ${s.color}88)`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)" }}
              onClick={() => { setFocus(i); sfx.tick(); }}
            >
              {s.v > 9 && <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-[#081130]">{s.sym} {s.v.toFixed(0)}%</span>}
              {i < segs.length - 1 && (
                <div
                  className="absolute -right-2 top-1/2 z-10 flex h-10 w-4 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white bg-[#081130] text-white"
                  style={{ boxShadow: "0 3px 0 #030816" }}
                  onPointerDown={(e) => { dragIdx.current = i; (e.target as Element).setPointerCapture?.(e.pointerId); setPreset("Custom"); }}
                  onPointerMove={(e) => { if (dragIdx.current === i) onDivider(i, e.clientX); }}
                  onPointerUp={() => { dragIdx.current = null; sfx.soft(); }}
                ><span className="text-[8px]">⋮</span></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr_280px]">
        {/* donut */}
        <ScenePanel title="Mix" sub="Tap segment to focus" accent={mood.c}>
          <div className="relative mx-auto h-[190px] w-[190px]">
            <svg viewBox="0 0 200 200" className="-rotate-90">
              <circle cx={100} cy={100} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={26} />
              {segs.map((s, i) => (
                <motion.circle
                  key={s.sym} cx={100} cy={100} r={R} fill="none" stroke={s.color} strokeLinecap="butt"
                  strokeDasharray={`${(s.v / 100) * C - 2} ${C}`}
                  initial={false} animate={{ strokeDashoffset: -((s.start / 100) * C), strokeWidth: focus === i ? 34 : 26, opacity: focus === i || true ? 1 : 0.5 }}
                  onClick={() => { setFocus(i); sfx.tick(); }}
                  style={{ cursor: "pointer", filter: focus === i ? `drop-shadow(0 0 10px ${s.color})` : undefined }}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="num-mono text-2xl font-extrabold" style={{ color: mood.c }}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%</p>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">blended 24h</p>
            </div>
          </div>
        </ScenePanel>

        {/* treemap list */}
        <ScenePanel title="Holdings" sub="Вес · изменение · риск-вклад" accent="#5b8cff">
          <div className="space-y-1.5">
            {segs.map((s, i) => (
              <motion.button key={s.sym} layout onClick={() => { setFocus(i); sfx.tick(); }}
                className={cn("relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-left", focus === i ? "border-white/40 bg-white/8" : "border-white/8 bg-black/25")}
              >
                <motion.span className="absolute inset-y-0 left-0" initial={false} animate={{ width: `${s.v}%`, backgroundColor: `${s.color}2e` }} />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black" style={{ background: `${s.color}25`, color: s.color }}>{s.sym.slice(0, 2)}</span>
                <span className="relative flex-1">
                  <span className="block text-xs font-extrabold text-white">{s.sym}</span>
                  <span className="block text-[10px] text-[#8ea6d8]">risk {(s.vol * 100).toFixed(0)} · contrib {((s.vol * s.v) / Math.max(1, risk)).toFixed(1)}%</span>
                </span>
                <svg viewBox="0 0 100 30" className="relative h-7 w-20">
                  <path d={closesPath(sparks[i], 100, 30)} fill="none" stroke={s.chg >= 0 ? "#2ede8a" : "#ff5470"} strokeWidth={2} />
                </svg>
                <span className={cn("num-mono relative w-16 text-right text-xs font-extrabold", s.chg >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>
                  {s.chg >= 0 ? "+" : ""}{s.chg.toFixed(2)}%
                </span>
                <span className="num-mono relative w-12 text-right text-xs font-extrabold text-white">{s.v.toFixed(0)}%</span>
              </motion.button>
            ))}
          </div>
        </ScenePanel>

        {/* risk */}
        <div className="space-y-4">
          <ScenePanel title="Risk engine" sub="Пересчёт на каждое движение" accent={mood.c}>
            <div className="relative mx-auto h-[120px] w-[200px]">
              <svg viewBox="0 0 200 110" className="w-full">
                <path d="M15,100 A85,85 0 0,1 185,100" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={14} strokeLinecap="round" />
                <motion.path d="M15,100 A85,85 0 0,1 185,100" fill="none" stroke={mood.c} strokeWidth={14} strokeLinecap="round"
                  strokeDasharray={267} initial={false} animate={{ strokeDashoffset: 267 - (267 * Math.min(100, risk)) / 100 }} style={{ filter: `drop-shadow(0 0 10px ${mood.c})` }} />
              </svg>
              <p className="num-mono -mt-8 text-center text-2xl font-extrabold text-white">{risk.toFixed(0)}</p>
              <p className="text-center text-[10px] font-extrabold uppercase tracking-widest" style={{ color: mood.c }}>{mood.t}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SceneStat label="Focus" value={f.sym} sub={`${norm[focus].toFixed(1)}%`} color={f.color} />
              <SceneStat label="Max" value={`${concentration.toFixed(0)}%`} sub="top holding" color={concentration > 50 ? "#ff5470" : "#fff"} />
            </div>
            <div className="mt-2 flex gap-1.5">
              <button onClick={() => { setAlloc((a) => { const n = [...a]; n[focus] = Math.max(2, n[focus] - 4); n[(focus + 1) % n.length] += 4; return n; }); setPreset("Custom"); sfx.tick(); }} className="btn3d btn3d-ghost flex-1 py-2 text-[10px]">− {f.sym}</button>
              <button onClick={() => { setAlloc((a) => { const n = [...a]; const from = (focus + 1) % n.length; if (n[from] <= 2) return a; n[from] -= 4; n[focus] += 4; return n; }); setPreset("Custom"); sfx.tick(); }} className="btn3d btn3d-gold flex-1 py-2 text-[10px]">+ {f.sym}</button>
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
