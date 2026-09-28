/* 57 · SENTIMENT TERRAIN — rotatable isometric landscape of market mood.
   Drag to rotate / tilt · metric morph (sentiment / volume / funding)
   · click a pillar → ripple wave through the terrain · day scrubber. */
import { motion } from "framer-motion";
import { RotateCw, Waves } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, lerp, useOnScreen, useRafLoop, useSceneKeys } from "../showcase/fx";
import { mulberry } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "TON", "AVAX", "LINK", "PEPE"];
const DAYS = 12;
const NA = ASSETS.length;
const METRICS = ["Sentiment", "Volume", "Funding"] as const;
type Metric = (typeof METRICS)[number];

function buildField(metric: Metric, seed: number) {
  const rnd = mulberry(seed + metric.length * 13);
  return Array.from({ length: NA }, (_, i) =>
    Array.from({ length: DAYS }, (_, j) => {
      const wave = Math.sin(j / 2.2 + i * 0.7) * 0.5 + Math.cos(i / 1.8 - j / 3) * 0.3;
      if (metric === "Volume") return clamp(0.25 + Math.abs(wave) * 0.6 + rnd() * 0.3, 0.05, 1);
      if (metric === "Funding") return clamp(wave * 0.8 + (rnd() - 0.5) * 0.4, -1, 1);
      return clamp(wave + (rnd() - 0.5) * 0.5 + (i === 0 ? 0.25 : 0), -1, 1);
    }),
  );
}

type Ripple = { i: number; j: number; t: number };

function valueColor(v: number, metric: Metric) {
  if (metric === "Volume") {
    const t = clamp(v, 0, 1);
    return `hsl(${210 - t * 170}, 90%, ${38 + t * 22}%)`;
  }
  if (v >= 0) return `hsl(${145}, ${55 + v * 35}%, ${30 + v * 26}%)`;
  return `hsl(${350}, ${55 + -v * 35}%, ${30 + -v * 26}%)`;
}

export default function SentimentTerrain() {
  const [metric, setMetric] = useState<Metric>("Sentiment");
  const [seed, setSeed] = useState(4);
  const [angle, setAngle] = useState(38);
  const [tilt, setTilt] = useState(0.55);
  const [spin, setSpin] = useState(false);
  const [hover, setHover] = useState<{ i: number; j: number } | null>(null);
  const [sel, setSel] = useState<{ i: number; j: number }>({ i: 0, j: DAYS - 1 });
  const [day, setDay] = useState(DAYS - 1);
  const [, setFrame] = useState(0);
  const { ref: wrapRef, inView } = useOnScreen<HTMLDivElement>();
  const target = useMemo(() => buildField(metric, seed), [metric, seed]);
  const current = useRef<number[][]>(target.map((r) => [...r]));
  const ripples = useRef<Ripple[]>([]);
  const morphing = useRef(true);
  const drag = useRef<{ x: number; y: number; a: number; t: number; moved: number } | null>(null);

  useRafLoop((dt) => {
    let changed = false;
    if (spin && !drag.current) { setAngle((a) => (a + dt * 18) % 360); changed = true; }
    if (morphing.current) {
      let diff = 0;
      for (let i = 0; i < NA; i++) for (let j = 0; j < DAYS; j++) {
        const nv = lerp(current.current[i][j], target[i][j], Math.min(1, dt * 6));
        diff += Math.abs(nv - target[i][j]);
        current.current[i][j] = nv;
      }
      if (diff < 0.01) morphing.current = false;
      changed = true;
    }
    if (ripples.current.length) {
      ripples.current.forEach((r) => { r.t += dt; });
      ripples.current = ripples.current.filter((r) => r.t < 2.6);
      changed = true;
    }
    if (changed) setFrame((f) => (f + 1) % 100000);
  }, inView);

  const prevTarget = useRef(target);
  if (prevTarget.current !== target) {
    prevTarget.current = target;
    morphing.current = true;
  }

  const heightAt = (i: number, j: number) => {
    let v = current.current[i][j];
    for (const r of ripples.current) {
      const d = Math.hypot(i - r.i, j - r.j);
      const front = r.t * 6;
      const amp = Math.exp(-r.t * 1.4) * Math.exp(-((d - front) ** 2) / 2.5);
      v += amp * 0.9;
    }
    if (j === day) v += 0.06;
    return v;
  };

  const W = 720, H = 420, CX = W / 2, CY = H * 0.56;
  const cell = 30;
  const a = (angle * Math.PI) / 180;
  const ca = Math.cos(a), sa = Math.sin(a);
  const proj = (u: number, v: number, h: number) => {
    const ru = u * ca - v * sa;
    const rv = u * sa + v * ca;
    return { x: CX + ru * cell, y: CY + rv * cell * tilt - h * 70, depth: rv };
  };

  const pillars = useMemo(() => {
    const list: { i: number; j: number; depth: number }[] = [];
    for (let i = 0; i < NA; i++) for (let j = 0; j < DAYS; j++) {
      const u = i - NA / 2 + 0.5;
      const v = j - DAYS / 2 + 0.5;
      list.push({ i, j, depth: u * sa + v * ca });
    }
    return list.sort((p, q) => p.depth - q.depth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle]);

  const ripple = (i: number, j: number) => {
    ripples.current.push({ i, j, t: 0 });
    setSel({ i, j });
    sfx.pop();
  };

  const keys = useSceneKeys({
    ArrowLeft: () => setAngle((x) => x - 12),
    ArrowRight: () => setAngle((x) => x + 12),
    ArrowUp: () => setTilt((x) => clamp(x + 0.07, 0.25, 0.95)),
    ArrowDown: () => setTilt((x) => clamp(x - 0.07, 0.25, 0.95)),
    r: () => setSpin((x) => !x),
    m: () => setMetric((m) => METRICS[(METRICS.indexOf(m) + 1) % METRICS.length]),
    Space: () => ripple(Math.floor(Math.random() * NA), Math.floor(Math.random() * DAYS)),
  });

  const focus = hover ?? sel;
  const fv = current.current[focus.i][focus.j];
  const row = current.current[focus.i];
  const col = current.current.map((r, i) => ({ sym: ASSETS[i], v: r[day] })).sort((p, q) => q.v - p.v);
  const marketMood = current.current.reduce((s, r) => s + r[day], 0) / NA;

  return (
    <ShowcaseSection
      id="terrain" index="57" kicker="Sentiment Terrain" title="Ландшафт рыночного настроения"
      desc="Активы × дни как рельеф. Тяни мышью — вращай и наклоняй ландшафт, меняй метрику — рельеф перетекает, кликни по столбу — волна расходится по всему рынку."
      accent="#8ef23c" variant="holo"
      keys={[{ k: "← →", d: "поворот" }, { k: "↑ ↓", d: "наклон" }, { k: "R", d: "spin" }, { k: "M", d: "метрика" }, { k: "Space", d: "волна" }]}
      moment="Запоминающийся момент: клик по BTC — ударная волна прокатывается по всему рельефу"
      tags={<div className="flex gap-2"><Tag tone={marketMood >= 0 ? "green" : "red"}>mood {marketMood >= 0 ? "+" : ""}{marketMood.toFixed(2)}</Tag><Tag tone="ghost">{metric}</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Seg options={METRICS} value={metric} onChange={setMetric} accent="#8ef23c" />
          <button onClick={() => { setSpin((s) => !s); sfx.tick(); }} className={cn("btn3d px-3 py-2 text-[10px]", spin ? "btn3d-green" : "btn3d-ghost")}><RotateCw size={13} /> Spin</button>
          <button onClick={() => ripple(sel.i, sel.j)} className="btn3d btn3d-blue px-3 py-2 text-[10px]"><Waves size={13} /> Ripple</button>
          <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">New market</button>
          <label className="ml-auto flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            Day {day + 1}
            <input type="range" min={0} max={DAYS - 1} value={day} onChange={(e) => { setDay(+e.target.value); sfx.tick(); }}
              className="lever w-36" style={{ ["--fill" as string]: `${(day / (DAYS - 1)) * 100}%` }} />
          </label>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div ref={wrapRef} className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_50%_40%,#12305a,#050b1f_72%)]" style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,.55)" }}>
            <svg
              viewBox={`0 0 ${W} ${H}`} className={cn("block w-full touch-none select-none", drag.current ? "cursor-grabbing" : "cursor-grab")}
              onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, a: angle, t: tilt, moved: 0 }; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y));
                setAngle(d.a + (e.clientX - d.x) * 0.45);
                setTilt(clamp(d.t - (e.clientY - d.y) * 0.003, 0.25, 0.95));
              }}
              onPointerUp={() => { drag.current = null; }}
              onPointerLeave={() => { drag.current = null; setHover(null); }}
            >
              {/* base plate */}
              {(() => {
                const c1 = proj(-NA / 2, -DAYS / 2, -0.12), c2 = proj(NA / 2, -DAYS / 2, -0.12), c3 = proj(NA / 2, DAYS / 2, -0.12), c4 = proj(-NA / 2, DAYS / 2, -0.12);
                return <polygon points={`${c1.x},${c1.y} ${c2.x},${c2.y} ${c3.x},${c3.y} ${c4.x},${c4.y}`} fill="rgba(142,242,60,.05)" stroke="rgba(142,242,60,.35)" strokeWidth={1.5} />;
              })()}
              {pillars.map(({ i, j }) => {
                const u = i - NA / 2 + 0.5;
                const v = j - DAYS / 2 + 0.5;
                const val = heightAt(i, j);
                const hgt = metric === "Volume" ? val : (val + 1) / 2;
                const hh = Math.max(0.02, hgt) * 1.8;
                const s = 0.42;
                const corners = [[u - s, v - s], [u + s, v - s], [u + s, v + s], [u - s, v + s]];
                const top = corners.map(([cu, cv]) => proj(cu, cv, hh));
                const bot = corners.map(([cu, cv]) => proj(cu, cv, 0));
                const base = valueColor(current.current[i][j], metric);
                const isFocus = focus.i === i && focus.j === j;
                const isDay = j === day;
                // visible side faces: choose two faces with greater depth
                const faces = [0, 1, 2, 3].map((k) => {
                  const n = (k + 1) % 4;
                  const depth = (top[k].depth + top[n].depth) / 2;
                  return { k, n, depth };
                }).sort((p, q) => q.depth - p.depth).slice(0, 2);
                return (
                  <g
                    key={`${i}-${j}`}
                    onPointerEnter={() => setHover({ i, j })}
                    onPointerUp={() => { if (drag.current && drag.current.moved < 6) ripple(i, j); }}
                    className="cursor-pointer"
                    opacity={hover && !isFocus && hover.i !== i ? 0.72 : 1}
                  >
                    {faces.map((f) => (
                      <polygon key={f.k}
                        points={`${top[f.k].x},${top[f.k].y} ${top[f.n].x},${top[f.n].y} ${bot[f.n].x},${bot[f.n].y} ${bot[f.k].x},${bot[f.k].y}`}
                        fill={base} style={{ filter: `brightness(${f.k % 2 ? 0.55 : 0.72})` }}
                      />
                    ))}
                    <polygon
                      points={top.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill={base} stroke={isFocus ? "#fff" : isDay ? "#8ef23c" : "rgba(255,255,255,.18)"} strokeWidth={isFocus ? 2.5 : isDay ? 1.5 : 0.6}
                      style={{ filter: `brightness(${isFocus ? 1.6 : 1.2})` }}
                    />
                  </g>
                );
              })}
              {/* asset labels */}
              {ASSETS.map((s, i) => {
                const p = proj(i - NA / 2 + 0.5, -DAYS / 2 - 0.9, 0);
                return <text key={s} x={p.x} y={p.y} textAnchor="middle" fontSize={10} fontWeight={800} fill={focus.i === i ? "#fff" : "#7d92c4"}>{s}</text>;
              })}
            </svg>
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1 text-[10px] font-bold text-[#8ea6d8] backdrop-blur">
              {Math.round(((angle % 360) + 360) % 360)}° · tilt {tilt.toFixed(2)} · drag to orbit
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
              <span className="h-2.5 w-10 rounded-full" style={{ background: metric === "Volume" ? "linear-gradient(90deg,hsl(210,90%,38%),hsl(40,90%,60%))" : "linear-gradient(90deg,hsl(350,90%,50%),#1a2a52,hsl(145,90%,50%))" }} />
              {metric === "Volume" ? "low → high" : "bear → bull"}
            </div>
          </div>

          <div className="space-y-4">
            <ScenePanel title={`${ASSETS[focus.i]} · day ${focus.j + 1}`} sub={metric} accent={fv >= 0 ? "#2ede8a" : "#ff5470"}>
              <motion.p key={`${focus.i}-${focus.j}-${metric}`} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="num-mono text-3xl font-extrabold" style={{ color: metric === "Volume" ? "#ffc531" : fv >= 0 ? "#2ede8a" : "#ff5470" }}
              >
                {metric === "Volume" ? `${Math.round(fv * 100)}%` : `${fv >= 0 ? "+" : ""}${fv.toFixed(2)}`}
              </motion.p>
              <svg viewBox="0 0 240 70" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30">
                <line x1={0} x2={240} y1={35} y2={35} stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" />
                {row.map((val, j) => {
                  const x = (j / (DAYS - 1)) * 228 + 6;
                  const y = metric === "Volume" ? 64 - val * 58 : 35 - val * 30;
                  return <circle key={j} cx={x} cy={y} r={j === day ? 4.5 : 2.5} fill={j === day ? "#fff" : valueColor(val, metric)} />;
                })}
                <path d={row.map((val, j) => `${j ? "L" : "M"}${(j / (DAYS - 1)) * 228 + 6},${metric === "Volume" ? 64 - val * 58 : 35 - val * 30}`).join(" ")} fill="none" stroke="#8ef23c" strokeWidth={1.6} opacity={0.7} />
              </svg>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SceneStat label="Row avg" value={(row.reduce((s, x) => s + x, 0) / DAYS).toFixed(2)} color="#fff" />
                <SceneStat label="Rank" value={`#${col.findIndex((c) => c.sym === ASSETS[focus.i]) + 1}`} sub={`day ${day + 1}`} color="#ffc531" />
              </div>
            </ScenePanel>
            <ScenePanel title={`Day ${day + 1} ranking`} sub="Клик — фокус и волна" accent="#8ef23c">
              <div className="space-y-1">
                {col.map((c) => {
                  const i = ASSETS.indexOf(c.sym);
                  return (
                    <motion.button key={c.sym} layout onClick={() => ripple(i, day)}
                      className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left", focus.i === i ? "bg-white/10" : "hover:bg-white/5")}
                    >
                      <span className="w-11 text-[11px] font-extrabold text-white">{c.sym}</span>
                      <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/50">
                        <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={false}
                          animate={{ width: `${metric === "Volume" ? c.v * 100 : ((c.v + 1) / 2) * 100}%` }} style={{ background: valueColor(c.v, metric) }} />
                      </span>
                      <span className="num-mono w-10 text-right text-[10px] text-[#8ea6d8]">{c.v.toFixed(2)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
