/* 44 · VOLATILITY REACTOR — futuristic vol playground.
   Sliders bend amplitude, particles, color, speed and density at once. */
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const PRESETS = [
  { id: "Calm", vol: 18, speed: 30, density: 30, chaos: 10 },
  { id: "Normal", vol: 45, speed: 55, density: 55, chaos: 30 },
  { id: "Storm", vol: 75, speed: 80, density: 80, chaos: 65 },
  { id: "Black Swan", vol: 100, speed: 100, density: 100, chaos: 100 },
] as const;

function volColor(v: number) {
  if (v < 35) return "#14c8f5";
  if (v < 60) return "#8ef23c";
  if (v < 82) return "#ffc531";
  return "#ff5470";
}

export default function VolatilityReactor() {
  const [vol, setVol] = useState(45);
  const [speed, setSpeed] = useState(55);
  const [density, setDensity] = useState(55);
  const [chaos, setChaos] = useState(30);
  const [preset, setPreset] = useState("Normal");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const params = useRef({ vol, speed, density, chaos });
  params.current = { vol, speed, density, chaos };

  const color = volColor(vol);
  const wave = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      pts.push(
        Math.sin(t * Math.PI * 4) * (vol / 60) +
          Math.sin(t * Math.PI * 11 + chaos / 20) * (chaos / 90) +
          Math.sin(t * Math.PI * 23) * (vol / 160),
      );
    }
    return pts;
  }, [vol, chaos]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = cv.getBoundingClientRect();
      cv.width = r.width * DPR;
      cv.height = r.height * DPR;
    };
    resize();
    window.addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number; r: number; h: number };
    let parts: P[] = [];
    const spawn = (w: number, h: number): P => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
      r: 1 + Math.random() * 2.5, h: Math.random(),
    });
    let t = 0;
    const loop = () => {
      const p = params.current;
      const w = cv.width, h = cv.height;
      t += 0.008 + p.speed / 900;
      ctx.fillStyle = "rgba(4,10,28,.32)";
      ctx.fillRect(0, 0, w, h);
      const target = Math.round(30 + (p.density / 100) * 260);
      while (parts.length < target) parts.push(spawn(w, h));
      if (parts.length > target) parts = parts.slice(0, target);
      const hue = p.vol < 35 ? 190 : p.vol < 60 ? 95 : p.vol < 82 ? 45 : 350;
      for (const q of parts) {
        const swirl = (p.chaos / 100) * 3;
        q.vx += Math.sin(t * 3 + q.y * 0.01) * 0.03 * (1 + swirl);
        q.vy += Math.cos(t * 2.4 + q.x * 0.01) * 0.03 * (1 + swirl);
        const sp = (0.4 + p.speed / 45) * DPR;
        q.x += q.vx * sp + Math.sin(t * 5 + q.h * 9) * (p.vol / 60);
        q.y += q.vy * sp + Math.cos(t * 4 + q.h * 7) * (p.vol / 60);
        if (q.x < 0) q.x = w;
        if (q.x > w) q.x = 0;
        if (q.y < 0) q.y = h;
        if (q.y > h) q.y = 0;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r * DPR * (0.7 + p.vol / 120), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + q.h * 24}, 95%, 60%, .8)`;
        ctx.shadowColor = `hsla(${hue}, 95%, 60%, .9)`;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // links
      ctx.strokeStyle = `hsla(${hue}, 90%, 65%, .14)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < parts.length; i += 6) {
        for (let j = i + 6; j < parts.length; j += 6) {
          const a = parts[i], b = parts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 90 * DPR) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const apply = (id: (typeof PRESETS)[number]["id"]) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(id);
    setVol(p.vol); setSpeed(p.speed); setDensity(p.density); setChaos(p.chaos);
    sfx.levelUp();
  };

  const W = 600, H = 150;
  const d = wave.map((v, i) => `${i ? "L" : "M"}${((i / (wave.length - 1)) * W).toFixed(1)},${(H / 2 - v * 22).toFixed(1)}`).join(" ");

  return (
    <ShowcaseSection
      id="volatility" index="44" kicker="Volatility Reactor" title="Реактор волатильности"
      desc="Регуляторы гнут всё сразу: амплитуду волны, рой частиц, цвет ядра, скорость и плотность. Пресет Black Swan доводит сцену до перегрева."
      accent={color}
      tags={<div className="flex gap-2"><Tag tone={vol > 82 ? "red" : vol > 60 ? "gold" : "green"}>VOL {vol}</Tag><Tag tone="ghost">{preset}</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => apply(p.id)}
            className={cn("rounded-xl px-4 py-2 text-[11px] font-extrabold transition", preset === p.id ? "text-[#081130]" : "bg-white/5 text-[#8ea6d8]")}
            style={preset === p.id ? { background: color } : undefined}>{p.id}</button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="relative overflow-hidden rounded-[24px] border border-white/12" style={{ boxShadow: `0 0 80px ${color}33, inset 0 0 60px rgba(0,0,0,.5)` }}>
          <canvas ref={canvasRef} className="h-[340px] w-full" />
          {/* core */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative flex h-36 w-36 items-center justify-center rounded-full"
              animate={{ scale: [1, 1 + vol / 900, 1], rotate: 360 }}
              transition={{ scale: { duration: 1.6, repeat: Infinity }, rotate: { duration: 14, repeat: Infinity, ease: "linear" } }}
              style={{ border: `3px solid ${color}`, boxShadow: `0 0 50px ${color}, inset 0 0 30px ${color}55` }}
            >
              <motion.div className="absolute inset-3 rounded-full border border-dashed" style={{ borderColor: `${color}88` }}
                animate={{ rotate: -360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />
              <div className="text-center" style={{ transform: "rotate(0deg)" }}>
                <p className="num-mono text-3xl font-extrabold" style={{ color, textShadow: `0 0 18px ${color}` }}>{vol}</p>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/70">reactor</p>
              </div>
            </motion.div>
          </div>
          <div className="absolute inset-x-4 bottom-3 rounded-2xl border border-white/10 bg-black/55 p-2 backdrop-blur">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <motion.path key={`${vol}-${chaos}`} d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round"
                initial={{ pathLength: 0.4, opacity: 0.4 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.6 }} style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
              <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,.15)" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        <ScenePanel title="Control rods" sub="Каждый регулятор виден мгновенно" accent={color}>
          {(
            [
              ["Volatility", vol, setVol, "амплитуда + цвет"],
              ["Speed", speed, setSpeed, "темп роя"],
              ["Density", density, setDensity, "число частиц"],
              ["Chaos", chaos, setChaos, "турбулентность"],
            ] as const
          ).map(([label, v, set, hint]) => (
            <div key={label} className="mb-3.5">
              <div className="mb-1 flex justify-between text-[11px] font-extrabold">
                <span className="text-white">{label}</span>
                <span className="num-mono" style={{ color }}>{v}</span>
              </div>
              <input type="range" min={0} max={100} value={v} onChange={(e) => { set(+e.target.value); setPreset("Custom"); }}
                className="lever w-full" style={{ ["--fill" as string]: `${v}%` }} />
              <p className="mt-0.5 text-[10px] text-[#7d92c4]">{hint}</p>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <SceneStat label="ATR proxy" value={(vol / 12).toFixed(2)} color={color} />
            <SceneStat label="Energy" value={`${Math.round((vol + speed + chaos) / 3)}%`} color="#fff" />
          </div>
          {vol > 82 && <p className="anim-flicker mt-3 rounded-xl border border-[#ff5470]/50 bg-[#ff5470]/10 p-2.5 text-center text-[11px] font-extrabold text-[#ff8ba0]">⚠ CONTAINMENT RISK — снижай волатильность</p>}
        </ScenePanel>
      </div>
    </ShowcaseSection>
  );
}
