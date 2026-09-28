/* 50 · LIQUIDITY POOL — concentrated liquidity range lab.
   Drag range bounds / body · live price walk · fees tick only in range
   · out-of-range shockwave · 2D distribution ↔ 3D liquidity city. */
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { AnimatedNumber, Box3D, clamp, Orbit, useSceneKeys, useShockwaves } from "../showcase/fx";
import { mulberry } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const P0 = 3800;
const PMIN = P0 * 0.62;
const PMAX = P0 * 1.38;
const BINS = 46;
const FEES = ["0.05%", "0.30%", "1.00%"] as const;
type Fee = (typeof FEES)[number];
const FEE_MULT: Record<Fee, number> = { "0.05%": 0.55, "0.30%": 1, "1.00%": 1.75 };
const PRESETS = { Narrow: 0.04, Balanced: 0.12, Wide: 0.25, Full: 1 } as const;
type PresetName = keyof typeof PRESETS;

const binPrice = (i: number) => PMIN + ((i + 0.5) / BINS) * (PMAX - PMIN);

function buildMarket(seed: number, center: number) {
  const rnd = mulberry(seed);
  const bumps = Array.from({ length: 3 }, () => ({ at: PMIN + rnd() * (PMAX - PMIN), w: 60 + rnd() * 160, a: 0.25 + rnd() * 0.5 }));
  return Array.from({ length: BINS }, (_, i) => {
    const p = binPrice(i);
    const main = Math.exp(-((p - center) ** 2) / (2 * (P0 * 0.08) ** 2));
    const extra = bumps.reduce((s, b) => s + b.a * Math.exp(-((p - b.at) ** 2) / (2 * b.w ** 2)), 0);
    return clamp(main + extra * 0.7 + rnd() * 0.08, 0.04, 1.6);
  });
}

export default function LiquidityPool() {
  const [price, setPrice] = useState(P0);
  const [hist, setHist] = useState<number[]>(() => Array.from({ length: 90 }, (_, i) => P0 + Math.sin(i / 7) * 40));
  const [range, setRange] = useState<[number, number]>([P0 * 0.9, P0 * 1.1]);
  const [capital, setCapital] = useState(10000);
  const [fee, setFee] = useState<Fee>("0.30%");
  const [view, setView] = useState<"2D" | "3D">("2D");
  const [playing, setPlaying] = useState(true);
  const [vol, setVol] = useState(40);
  const [fees, setFees] = useState(0);
  const [ticksIn, setTicksIn] = useState(0);
  const [ticksTotal, setTicksTotal] = useState(0);
  const [preset, setPreset] = useState<PresetName | "Custom">("Custom");
  const [seed, setSeed] = useState(5);
  const [outFlash, setOutFlash] = useState(0);
  const market = useMemo(() => buildMarket(seed, P0), [seed]);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ mode: "lo" | "hi" | "body"; startP: number; lo: number; hi: number } | null>(null);
  const wasIn = useRef(true);
  const { fire, node: waves } = useShockwaves();

  const [lo, hi] = range;
  const inRange = price >= lo && price <= hi;
  const concentration = clamp(1 / Math.max(0.0025, 1 - Math.sqrt(lo / hi)), 1, 400);
  const baseApr = 6.2 * FEE_MULT[fee];
  const apr = inRange ? Math.min(2400, baseApr * Math.sqrt(concentration) * 3.1) : 0;
  const ethShare = price <= lo ? 1 : price >= hi ? 0 : (Math.sqrt(hi) - Math.sqrt(price)) / (Math.sqrt(hi) - Math.sqrt(lo));
  const move = price / P0 - 1;
  const il = -Math.min(60, Math.sqrt(concentration) * move * move * 100 * 0.5);
  const uptime = ticksTotal ? (ticksIn / ticksTotal) * 100 : 100;

  const W = 720, H = 250, BASE = 212;
  const xp = (p: number) => ((p - PMIN) / (PMAX - PMIN)) * W;
  const px2p = (px: number) => PMIN + (px / W) * (PMAX - PMIN);
  const maxM = Math.max(...market);

  // price simulation
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPrice((p) => {
        const shock = (Math.random() - 0.5) * (vol / 100) * 90;
        const pull = (P0 - p) * 0.01;
        return clamp(p + shock + pull, PMIN * 1.02, PMAX * 0.98);
      });
    }, 420);
    return () => window.clearInterval(id);
  }, [playing, vol]);

  useEffect(() => {
    setHist((h) => [...h.slice(1), price]);
    setTicksTotal((t) => t + 1);
    if (inRange) {
      setTicksIn((t) => t + 1);
      setFees((f) => f + (capital * (apr / 100)) / (365 * 24 * 6));
    }
    if (wasIn.current && !inRange) {
      const r = stageRef.current?.getBoundingClientRect();
      const s = svgRef.current?.getBoundingClientRect();
      if (r && s) fire(s.left - r.left + (xp(price) / W) * s.width, s.top - r.top + s.height * 0.55, "#ff5470", 1.2);
      setOutFlash((k) => k + 1);
      sfx.error();
    } else if (!wasIn.current && inRange) {
      sfx.success();
    }
    wasIn.current = inRange;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price]);

  const setPresetRange = (name: PresetName) => {
    const w = PRESETS[name];
    setPreset(name);
    if (w >= 1) setRange([PMIN * 1.01, PMAX * 0.99]);
    else setRange([price * (1 - w), price * (1 + w)]);
    sfx.pop();
  };

  const rebalance = () => {
    const half = (hi - lo) / 2;
    setRange([clamp(price - half, PMIN, PMAX - 40), clamp(price + half, PMIN + 40, PMAX)]);
    sfx.levelUp();
  };

  const shift = (dir: number) => {
    const step = (hi - lo) * 0.08 * dir;
    setRange(([a, b]) => (a + step < PMIN || b + step > PMAX ? [a, b] : [a + step, b + step]));
    setPreset("Custom");
    sfx.tick();
  };
  const widen = (k: number) => {
    const mid = (lo + hi) / 2;
    const half = ((hi - lo) / 2) * k;
    setRange([clamp(mid - half, PMIN, mid - 20), clamp(mid + half, mid + 20, PMAX)]);
    setPreset("Custom");
    sfx.tick();
  };

  const keys = useSceneKeys({
    Space: () => setPlaying((p) => !p),
    ArrowLeft: () => shift(-1),
    ArrowRight: () => shift(1),
    "[": () => widen(0.85),
    "]": () => widen(1.18),
    r: rebalance,
    "3": () => setView((v) => (v === "2D" ? "3D" : "2D")),
  });

  const toPrice = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return price;
    return px2p(((clientX - r.left) / r.width) * W);
  };

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const p = toPrice(e.clientX);
    const tol = (PMAX - PMIN) * 0.025;
    let mode: "lo" | "hi" | "body" = "body";
    if (Math.abs(p - lo) < tol) mode = "lo";
    else if (Math.abs(p - hi) < tol) mode = "hi";
    else if (p < lo) mode = "lo";
    else if (p > hi) mode = "hi";
    drag.current = { mode, startP: p, lo, hi };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    if (mode !== "body") setRange(mode === "lo" ? [clamp(p, PMIN, hi - 30), hi] : [lo, clamp(p, lo + 30, PMAX)]);
    setPreset("Custom");
    sfx.tick();
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = toPrice(e.clientX);
    if (d.mode === "lo") setRange([clamp(p, PMIN, d.hi - 30), d.hi]);
    else if (d.mode === "hi") setRange([d.lo, clamp(p, d.lo + 30, PMAX)]);
    else {
      const dp = p - d.startP;
      const w = d.hi - d.lo;
      const nlo = clamp(d.lo + dp, PMIN, PMAX - w);
      setRange([nlo, nlo + w]);
    }
  };
  const onUp = () => {
    if (drag.current) sfx.soft();
    drag.current = null;
  };

  // price-path mini chart
  const PH = 110;
  const hMin = Math.min(...hist, lo) - 20;
  const hMax = Math.max(...hist, hi) + 20;
  const hy = (v: number) => 6 + (1 - (v - hMin) / (hMax - hMin)) * (PH - 12);

  return (
    <ShowcaseSection
      id="liquidity" index="50" kicker="Liquidity Pool" title="Лаборатория концентрированной ликвидности"
      desc="Тяни границы диапазона или весь диапазон целиком. Цена гуляет сама — комиссии капают только внутри. Выход за границу бьёт ударной волной. Переключи в 3D — распределение станет городом ликвидности."
      accent="#14F195" variant="aurora"
      keys={[
        { k: "Space", d: "пауза" }, { k: "← →", d: "сдвиг диапазона" }, { k: "[ ]", d: "уже / шире" },
        { k: "R", d: "ребаланс" }, { k: "3", d: "2D/3D" },
      ]}
      moment="Запоминающийся момент: цена пробивает границу — вспышка, ударная волна и APR обнуляется"
      tags={
        <div className="flex gap-2">
          <Tag tone={inRange ? "green" : "red"}>{inRange ? "IN RANGE" : "OUT OF RANGE"}</Tag>
          <Tag tone="ghost">×{concentration.toFixed(1)} eff.</Tag>
        </div>
      }
    >
      <div ref={stageRef} className="relative" {...keys}>
        {waves}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Seg options={["2D", "3D"] as const} value={view} onChange={setView} accent="#14F195" />
          <Seg options={FEES} value={fee} onChange={setFee} accent="#5b8cff" />
          <div className="flex gap-1.5">
            {(Object.keys(PRESETS) as PresetName[]).map((p) => (
              <button
                key={p} onClick={() => setPresetRange(p)}
                className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", preset === p ? "bg-[#14F195] text-[#04231a]" : "bg-white/5 text-[#8ea6d8] hover:text-white")}
              >{p}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]"><RotateCcw size={12} /> Market</button>
            <button onClick={() => setPlaying((p) => !p)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg">{playing ? <Pause size={14} /> : <Play size={14} />}</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
          <div className="space-y-4">
            <ScenePanel
              title="ETH / USDC · liquidity distribution" sub="Тяни ручки или тело диапазона · клик вне — прыжок границы" accent="#14F195"
              right={<span className="num-mono text-sm font-extrabold text-white">${price.toFixed(1)}</span>}
            >
              <AnimatePresence mode="wait">
                {view === "2D" ? (
                  <motion.div key="2d" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                    className="panel-inset relative overflow-hidden p-2"
                  >
                    <motion.div
                      key={outFlash}
                      className="pointer-events-none absolute inset-0"
                      initial={{ opacity: outFlash ? 0.6 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }}
                      style={{ background: "radial-gradient(circle at 50% 60%, rgba(255,84,112,.45), transparent 60%)" }}
                    />
                    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full cursor-ew-resize touch-none select-none"
                      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
                    >
                      <defs>
                        <linearGradient id="lp-in" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor="#5ff5a8" />
                          <stop offset="1" stopColor="#0a8f5b" />
                        </linearGradient>
                        <linearGradient id="lp-you" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor="#14F195" stopOpacity=".55" />
                          <stop offset="1" stopColor="#14F195" stopOpacity=".05" />
                        </linearGradient>
                      </defs>
                      {/* your liquidity block */}
                      <motion.rect
                        initial={false}
                        animate={{ x: xp(lo), width: Math.max(2, xp(hi) - xp(lo)), y: BASE - clamp(concentration * 3.2, 18, 190), height: clamp(concentration * 3.2, 18, 190) }}
                        transition={{ type: "spring", stiffness: 260, damping: 30 }}
                        fill="url(#lp-you)" rx={8}
                      />
                      {market.map((m, i) => {
                        const p = binPrice(i);
                        const inside = p >= lo && p <= hi;
                        const bx = (i / BINS) * W;
                        const bh = (m / maxM) * 170;
                        return (
                          <motion.rect
                            key={i} x={bx + 1.5} width={W / BINS - 3} rx={2}
                            initial={false} animate={{ y: BASE - bh, height: bh, opacity: inside ? 1 : 0.35 }}
                            transition={{ type: "spring", stiffness: 160, damping: 22, delay: i * 0.004 }}
                            fill={inside ? "url(#lp-in)" : "#2a4b8f"}
                            style={inside ? { filter: "drop-shadow(0 0 4px rgba(20,241,149,.6))" } : undefined}
                          />
                        );
                      })}
                      <line x1={0} x2={W} y1={BASE} y2={BASE} stroke="rgba(255,255,255,.15)" />
                      {/* handles */}
                      {([lo, hi] as const).map((v, k) => (
                        <g key={k}>
                          <line x1={xp(v)} x2={xp(v)} y1={10} y2={BASE} stroke="#14F195" strokeWidth={2.5} />
                          <rect x={xp(v) - 10} y={BASE / 2 - 22} width={20} height={44} rx={10} fill="#081130" stroke="#14F195" strokeWidth={2.5} />
                          <line x1={xp(v) - 3} x2={xp(v) - 3} y1={BASE / 2 - 10} y2={BASE / 2 + 10} stroke="#14F195" strokeWidth={1.5} />
                          <line x1={xp(v) + 3} x2={xp(v) + 3} y1={BASE / 2 - 10} y2={BASE / 2 + 10} stroke="#14F195" strokeWidth={1.5} />
                          <rect x={xp(v) - 36} y={BASE + 8} width={72} height={20} rx={10} fill="#14F195" />
                          <text x={xp(v)} y={BASE + 22} textAnchor="middle" fontSize={11} fontWeight={800} fill="#04231a">{v.toFixed(0)}</text>
                        </g>
                      ))}
                      {/* price */}
                      <motion.g initial={false} animate={{ x: xp(price) }} transition={{ type: "spring", stiffness: 220, damping: 26 }}>
                        <line x1={0} x2={0} y1={0} y2={BASE} stroke={inRange ? "#fff" : "#ff5470"} strokeWidth={2} strokeDasharray="5 4" />
                        <circle cx={0} cy={14} r={9} fill={inRange ? "#fff" : "#ff5470"} />
                        <circle cx={0} cy={14} r={15} fill="none" stroke={inRange ? "#fff" : "#ff5470"} opacity={0.35}>
                          <animate attributeName="r" values="9;20;9" dur="1.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values=".5;0;.5" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                      </motion.g>
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div key="3d" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="panel-inset relative overflow-hidden"
                  >
                    <Orbit height={300} initial={{ x: -26, y: 24 }}>
                      <div className="absolute left-1/2 top-[62%]" style={{ transformStyle: "preserve-3d" }}>
                        {/* floor */}
                        <div
                          className="absolute"
                          style={{
                            width: 620, height: 180, left: -310, top: -90, transform: "rotateX(90deg)",
                            backgroundImage: "linear-gradient(rgba(20,241,149,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(20,241,149,.18) 1px, transparent 1px)",
                            backgroundSize: "26px 26px", borderRadius: 16, boxShadow: "0 0 60px rgba(20,241,149,.15)",
                          }}
                        />
                        {market.map((m, i) => {
                          const p = binPrice(i);
                          const inside = p >= lo && p <= hi;
                          return (
                            <Box3D
                              key={i} x={(i - BINS / 2) * 13} w={10} d={inside ? 40 : 26} h={(m / maxM) * 150}
                              color={inside ? "#14F195" : "#27427f"} glow={inside} opacity={inside ? 1 : 0.8}
                            />
                          );
                        })}
                        {/* price plane */}
                        <motion.div
                          className="absolute"
                          initial={false}
                          animate={{ x: ((price - PMIN) / (PMAX - PMIN) - 0.5) * BINS * 13 - 1 }}
                          style={{ width: 2, height: 190, top: -190, left: 0, background: inRange ? "#fff" : "#ff5470", boxShadow: `0 0 20px ${inRange ? "#fff" : "#ff5470"}`, transformStyle: "preserve-3d" }}
                        >
                          <div className="absolute -left-[80px] top-0 h-full w-[160px]" style={{ background: `linear-gradient(90deg, transparent, ${inRange ? "rgba(255,255,255,.14)" : "rgba(255,84,112,.18)"}, transparent)`, transform: "rotateY(90deg)" }} />
                        </motion.div>
                      </div>
                    </Orbit>
                    <p className="pointer-events-none absolute bottom-2 left-3 text-[10px] font-bold text-[#7d92c4]">drag — вращать · двойной клик — сброс</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button onClick={() => shift(-1)} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">◀ Shift</button>
                <button onClick={() => widen(0.85)} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">Narrow</button>
                <button onClick={() => widen(1.18)} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">Widen</button>
                <button onClick={() => shift(1)} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">Shift ▶</button>
                <button onClick={rebalance} className="btn3d btn3d-green ml-auto px-4 py-2 text-[10px]"><Crosshair size={13} /> Rebalance to price</button>
              </div>
            </ScenePanel>

            <ScenePanel title="Price path vs range" sub="Красные участки — вне диапазона, комиссий нет" accent="#5b8cff">
              <svg viewBox={`0 0 ${W} ${PH}`} className="w-full">
                <motion.rect initial={false} animate={{ y: hy(hi), height: Math.max(2, hy(lo) - hy(hi)) }} x={0} width={W} fill="#14F195" opacity={0.1} />
                <motion.line initial={false} animate={{ y1: hy(hi), y2: hy(hi) }} x1={0} x2={W} stroke="#14F195" strokeDasharray="5 4" />
                <motion.line initial={false} animate={{ y1: hy(lo), y2: hy(lo) }} x1={0} x2={W} stroke="#14F195" strokeDasharray="5 4" />
                {hist.slice(1).map((v, i) => {
                  const a = hist[i];
                  const ok = v >= lo && v <= hi;
                  return (
                    <line key={i} x1={(i / (hist.length - 1)) * W} x2={((i + 1) / (hist.length - 1)) * W} y1={hy(a)} y2={hy(v)}
                      stroke={ok ? "#fff" : "#ff5470"} strokeWidth={2} strokeLinecap="round" />
                  );
                })}
              </svg>
            </ScenePanel>
          </div>

          <div className="space-y-4">
            <ScenePanel title="Position" sub="Капитал в диапазоне" accent="#14F195">
              <label className="block text-[10px] font-extrabold text-[#8ea6d8]">
                Capital ${capital.toLocaleString()}
                <input type="range" min={1000} max={50000} step={500} value={capital} onChange={(e) => setCapital(+e.target.value)}
                  className="lever mt-1 w-full" style={{ ["--fill" as string]: `${((capital - 1000) / 49000) * 100}%` }} />
              </label>
              <label className="mt-3 block text-[10px] font-extrabold text-[#8ea6d8]">
                Market volatility {vol}
                <input type="range" min={5} max={100} value={vol} onChange={(e) => setVol(+e.target.value)}
                  className="lever mt-1 w-full" style={{ ["--fill" as string]: `${vol}%` }} />
              </label>
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Fees earned</p>
                <AnimatedNumber value={fees} format={(v) => `$${v.toFixed(3)}`} className="num-mono block text-2xl font-extrabold text-[#14F195]" />
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
                  <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${uptime}%`, backgroundColor: uptime > 70 ? "#14F195" : uptime > 40 ? "#ffc531" : "#ff5470" }} />
                </div>
                <p className="mt-1 text-[10px] font-bold text-[#8ea6d8]">uptime in range {uptime.toFixed(0)}%</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SceneStat label="APR" value={`${apr.toFixed(1)}%`} color={inRange ? "#14F195" : "#ff5470"} />
                <SceneStat label="Efficiency" value={`×${concentration.toFixed(1)}`} color="#fff" />
                <SceneStat label="Width" value={`±${(((hi - lo) / 2 / price) * 100).toFixed(1)}%`} color="#9db9ff" />
                <SceneStat label="IL est." value={`${il.toFixed(2)}%`} color={il < -3 ? "#ff5470" : "#ffc531"} />
              </div>
            </ScenePanel>
            <ScenePanel title="Composition" sub="ETH ↔ USDC внутри позиции" accent="#5b8cff">
              <div className="flex h-5 overflow-hidden rounded-full border border-white/10">
                <motion.div className="h-full bg-gradient-to-r from-[#8fa2ff] to-[#627EEA]" initial={false} animate={{ width: `${ethShare * 100}%` }} />
                <motion.div className="h-full bg-gradient-to-r from-[#26A17B] to-[#1c7a5c]" initial={false} animate={{ width: `${(1 - ethShare) * 100}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] font-extrabold">
                <span className="text-[#9db9ff]">ETH {(ethShare * 100).toFixed(0)}%</span>
                <span className="text-[#5fd6ae]">USDC {((1 - ethShare) * 100).toFixed(0)}%</span>
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#aebde6]">
                {price <= lo ? "Цена ниже диапазона — позиция полностью в ETH." : price >= hi ? "Цена выше — вы всё продали в USDC." : "Внутри диапазона — пул продаёт на росте и покупает на падении."}
              </p>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
