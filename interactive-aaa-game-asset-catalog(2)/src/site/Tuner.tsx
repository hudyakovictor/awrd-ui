import { useState } from "react";
import { motion } from "motion/react";
import { S, BASE, TUNE, commitTune, sampleSpring, copyText, useTuneVersion, type Tune } from "../lib/motion";
import { IcCheck, IcRefresh, IcBolt, IcCopy } from "../ui/icons";

/* =====================================================================
   ТЮНЕР — главный рабочий инструмент каталога.
   Меняет физику ВСЕХ экранов вживую и отдаёт готовый конфиг в код.
   ===================================================================== */

const PRESETS: { id: string; t: string; d: string; v: Partial<Tune> }[] = [
  { id: "aaa", t: "AAA mobile", d: "Базис каталога", v: { speed: 1, bounce: 1, weight: 1, stagger: 1, impact: 1, particles: 1 } },
  { id: "snappy", t: "Snappy UI", d: "Утилитарный интерфейс", v: { speed: 1.35, bounce: 0.7, weight: 0.85, stagger: 0.6, impact: 0.5, particles: 0.6 } },
  { id: "juicy", t: "Juicy arcade", d: "Максимум сока", v: { speed: 0.95, bounce: 1.45, weight: 1.15, stagger: 1.3, impact: 1.6, particles: 1.6 } },
  { id: "cinema", t: "Cinematic", d: "Кинематографично", v: { speed: 0.7, bounce: 1.1, weight: 1.5, stagger: 1.6, impact: 1.2, particles: 1.2 } },
  { id: "a11y", t: "Reduced", d: "Доступность", v: { speed: 1.6, bounce: 0.35, weight: 0.8, stagger: 0.2, impact: 0, particles: 0.15 } },
];

const KNOBS: { k: keyof Tune; t: string; hint: string; min: number; max: number }[] = [
  { k: "speed", t: "Темп", hint: "× stiffness, ÷ duration", min: 0.5, max: 2 },
  { k: "bounce", t: "Упругость", hint: "÷ damping — overshoot", min: 0.4, max: 1.8 },
  { k: "weight", t: "Масса", hint: "× mass — инерция", min: 0.5, max: 2 },
  { k: "stagger", t: "Каскад", hint: "× задержки в списках", min: 0, max: 2 },
  { k: "impact", t: "Импакт", hint: "× сила тряски", min: 0, max: 2 },
  { k: "particles", t: "Частицы", hint: "× плотность", min: 0, max: 2 },
];

export function Tuner({ tone = "#3ec9a7", compact = false }: { tone?: string; compact?: boolean }) {
  useTuneVersion();
  const [preset, setPreset] = useState("aaa");
  const [copied, setCopied] = useState(false);
  const m = sampleSpring(S.pop);

  const set = (k: keyof Tune, v: number) => { commitTune({ [k]: v } as any); setPreset("custom"); };

  const code = `// motion/config.ts — конфиг, сгенерированный тюнером каталога
export const SPRING = {
  snap:  { type: "spring", stiffness: ${S.snap.stiffness}, damping: ${S.snap.damping}, mass: ${S.snap.mass} },
  pop:   { type: "spring", stiffness: ${S.pop.stiffness}, damping: ${S.pop.damping}, mass: ${S.pop.mass} },
  soft:  { type: "spring", stiffness: ${S.soft.stiffness}, damping: ${S.soft.damping}, mass: ${S.soft.mass} },
  heavy: { type: "spring", stiffness: ${S.heavy.stiffness}, damping: ${S.heavy.damping}, mass: ${S.heavy.mass} },
};
export const STAGGER = ${(0.07 * TUNE.stagger).toFixed(3)};   // шаг каскада, с
export const IMPACT  = ${TUNE.impact.toFixed(2)};   // множитель тряски
export const PARTICLES = ${TUNE.particles.toFixed(2)};
// pop: overshoot ${(m.overshoot * 100).toFixed(0)}% · settle ${m.settleMs} мс`;

  return (
    <div className="rounded-3xl border border-white/8 bg-[#111a2b]/80 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span style={{ color: tone }}><IcBolt size={16} /></span>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.25em]">тюнер физики</span>
        </div>
        <button onClick={() => { commitTune(PRESETS[0].v); setPreset("aaa"); }}
          className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
          <IcRefresh size={12} /> сброс
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => { commitTune(p.v); setPreset(p.id); }}
            className="relative rounded-xl px-2.5 py-1.5 text-left">
            {preset === p.id && <motion.span layoutId="tunepreset" transition={S.pop} className="absolute inset-0 rounded-xl" style={{ background: tone + "24", boxShadow: `inset 0 0 0 1px ${tone}77` }} />}
            <span className="relative block text-[10px] font-extrabold" style={{ color: preset === p.id ? tone : "#cfe0f7" }}>{p.t}</span>
            <span className="relative block text-[8px] font-bold text-mist">{p.d}</span>
          </button>
        ))}
      </div>

      <div className={`mt-4 grid gap-x-5 gap-y-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {KNOBS.map((kn) => (
          <div key={kn.k}>
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">{kn.t}</span>
              <span className="mono text-[10px] font-bold" style={{ color: tone }}>×{(TUNE[kn.k] as number).toFixed(2)}</span>
            </div>
            <input
              type="range" min={kn.min} max={kn.max} step={0.05}
              value={TUNE[kn.k] as number}
              onChange={(e) => set(kn.k, +e.target.value)}
              className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-current"
              style={{ color: tone, accentColor: tone }}
            />
            <div className="mono mt-0.5 text-[8.5px] font-bold text-mist">{kn.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <SpringGraph tone={tone} />
        <div className="space-y-1">
          <Metric l="overshoot" v={`${(m.overshoot * 100).toFixed(0)}%`} tone={m.overshoot > 0.35 ? "#e46a5f" : tone} />
          <Metric l="settle" v={`${m.settleMs} мс`} tone={m.settleMs > 900 ? "#f2c14e" : tone} />
          <Metric l="stagger" v={`${Math.round(70 * TUNE.stagger)} мс`} tone="#8fa4c7" />
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-mist">
          звук
          <button onClick={() => commitTune({ sound: !TUNE.sound })}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: TUNE.sound ? tone : "rgba(255,255,255,.12)" }}>
            <motion.span layout transition={S.snap} className="absolute top-1 h-4 w-4 rounded-full bg-white"
              style={{ left: TUNE.sound ? 26 : 4 }} />
          </button>
        </label>
      </div>

      <pre className="mono mt-4 max-h-44 overflow-auto rounded-2xl border border-white/10 bg-[#080d18] p-3 text-[10.5px] leading-relaxed" style={{ color: tone }}>{code}</pre>
      <button
        onClick={async () => { setCopied(await copyText(code)); setTimeout(() => setCopied(false), 1600); }}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em]"
        style={{ background: tone, color: "#06231c" }}>
        {copied ? <IcCheck size={14} /> : <IcCopy size={14} />} {copied ? "скопировано" : "скопировать конфиг"}
      </button>
    </div>
  );
}

function Metric({ l, v, tone }: { l: string; v: string; tone: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="w-16 text-[9px] font-extrabold uppercase tracking-wider text-mist">{l}</span>
      <span className="mono text-[11px] font-extrabold" style={{ color: tone }}>{v}</span>
    </div>
  );
}

export function SpringGraph({ tone = "#3ec9a7", spring = S.pop, w = 150, h = 74 }: any) {
  const { pts } = sampleSpring(spring);
  const max = Math.max(1.5, ...pts);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * w},${h - (p / max) * (h - 10) - 5}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0 rounded-xl bg-[#0a1120]" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.07)" }}>
      <line x1="0" y1={h - (1 / max) * (h - 10) - 5} x2={w} y2={h - (1 / max) * (h - 10) - 5} stroke="rgba(255,255,255,.18)" strokeDasharray="3 3" />
      <motion.path d={d} fill="none" stroke={tone} strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
    </svg>
  );
}

/* Восстановление BASE наружу для лаборатории */
export { BASE };
