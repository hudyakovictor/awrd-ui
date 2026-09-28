/* 56 · LIQUIDATION CASCADE — chain reaction on a leverage map.
   Clusters by leverage · drag price / wick buttons · crossed clusters detonate,
   push price further (cascade) · shockwaves · rolling $ counter · feed. */
import { AnimatePresence, motion } from "framer-motion";
import { Bomb, RotateCcw, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { AnimatedNumber, clamp, useRafLoop, useSceneKeys, useShockwaves } from "../showcase/fx";
import { fmtPrice, mulberry } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const P0 = 97000;
const LO = P0 * 0.86;
const HI = P0 * 1.14;
const BINS = 64;
const LEVS = [10, 25, 50, 100] as const;
type Lev = (typeof LEVS)[number];
const LEV_COLOR: Record<Lev, string> = { 10: "#5b8cff", 25: "#a78bff", 50: "#ffc531", 100: "#ff5470" };

type Bin = { long: Record<Lev, number>; short: Record<Lev, number>; boom: number };
const binPrice = (i: number) => LO + ((i + 0.5) / BINS) * (HI - LO);
const priceBin = (p: number) => clamp(Math.floor(((p - LO) / (HI - LO)) * BINS), 0, BINS - 1);

function buildBins(seed: number, around: number): Bin[] {
  const rnd = mulberry(seed);
  const bins: Bin[] = Array.from({ length: BINS }, () => ({ long: { 10: 0, 25: 0, 50: 0, 100: 0 }, short: { 10: 0, 25: 0, 50: 0, 100: 0 }, boom: 0 }));
  LEVS.forEach((lev) => {
    const d = (1 / lev) * 0.92;
    for (let k = 0; k < 5; k++) {
      const entry = around * (1 + (rnd() - 0.5) * 0.05);
      const lp = entry * (1 - d);
      const sp = entry * (1 + d);
      const amt = (6 + rnd() * 22) * (lev === 100 ? 0.7 : lev === 50 ? 1.1 : 1);
      const lb = priceBin(lp), sb = priceBin(sp);
      for (let s = -1; s <= 1; s++) {
        const f = s === 0 ? 1 : 0.35;
        if (lb + s >= 0 && lb + s < BINS && binPrice(lb + s) < around) bins[lb + s].long[lev] += amt * f;
        if (sb + s >= 0 && sb + s < BINS && binPrice(sb + s) > around) bins[sb + s].short[lev] += amt * f;
      }
    }
  });
  return bins;
}

type Feed = { id: number; side: "long" | "short"; amt: number; price: number; lev: Lev };
let feedId = 1;

export default function LiquidationCascade() {
  const [seed, setSeed] = useState(3);
  const [bins, setBins] = useState<Bin[]>(() => buildBins(3, P0));
  const [price, setPrice] = useState(P0);
  const [target, setTarget] = useState(P0);
  const [filter, setFilter] = useState<Lev[]>([...LEVS]);
  const [liqLong, setLiqLong] = useState(0);
  const [liqShort, setLiqShort] = useState(0);
  const [feed, setFeed] = useState<Feed[]>([]);
  const [chain, setChain] = useState(0);
  const [bestChain, setBestChain] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const { fire, node: waves } = useShockwaves();

  const W = 720, H = 280, BASE = 236;
  const xp = (p: number) => ((p - LO) / (HI - LO)) * W;
  const maxStack = useMemo(() => Math.max(1, ...bins.map((b) => Math.max(LEVS.reduce((s, l) => s + b.long[l], 0), LEVS.reduce((s, l) => s + b.short[l], 0)))), [bins]);

  const detonate = (bi: number) => {
    const b = bins[bi];
    const p = binPrice(bi);
    const isLong = p < P0 || LEVS.some((l) => b.long[l] > 0);
    let total = 0;
    let topLev: Lev = 10;
    let topAmt = 0;
    const nb = { ...b, long: { ...b.long }, short: { ...b.short }, boom: 1 };
    LEVS.forEach((l) => {
      if (!filter.includes(l)) return;
      const a = isLong ? b.long[l] : b.short[l];
      if (a > topAmt) { topAmt = a; topLev = l; }
      total += a;
      if (isLong) nb.long[l] = 0; else nb.short[l] = 0;
    });
    if (total < 0.5) return 0;
    setBins((bs) => bs.map((x, i) => (i === bi ? nb : x)));
    if (isLong) setLiqLong((v) => v + total); else setLiqShort((v) => v + total);
    setFeed((f) => [{ id: feedId++, side: isLong ? "long" as const : "short" as const, amt: total, price: p, lev: topLev }, ...f].slice(0, 8));
    const r = stageRef.current?.getBoundingClientRect();
    const s = svgRef.current?.getBoundingClientRect();
    if (r && s) fire(s.left - r.left + (xp(p) / W) * s.width, s.top - r.top + s.height * 0.62, isLong ? "#ff5470" : "#2ede8a", 0.6 + Math.min(1.6, total / 30));
    if (total > 25) sfx.error(); else sfx.drop();
    return total;
  };

  useRafLoop((dt) => {
    // decay boom flashes
    setBins((bs) => (bs.some((b) => b.boom > 0) ? bs.map((b) => (b.boom > 0 ? { ...b, boom: Math.max(0, b.boom - dt * 1.6) } : b)) : bs));
    if (dragging.current || Math.abs(target - price) < 4) {
      if (chain > 0 && Math.abs(target - price) < 4) {
        setBestChain((b) => Math.max(b, chain));
        setChain(0);
      }
      return;
    }
    const dir = Math.sign(target - price);
    const stepP = Math.min(Math.abs(target - price), (HI - LO) * dt * 0.09);
    const np = price + dir * stepP;
    const a = priceBin(price), b = priceBin(np);
    let push = 0;
    if (a !== b) {
      const from = Math.min(a, b), to = Math.max(a, b);
      for (let i = from; i <= to; i++) {
        const bin = bins[i];
        const has = LEVS.some((l) => filter.includes(l) && (bin.long[l] > 0.5 || bin.short[l] > 0.5));
        if (has) {
          const amt = detonate(i);
          if (amt > 0) {
            push += amt * 42;
            setChain((c) => c + 1);
          }
        }
      }
    }
    setPrice(np);
    if (push > 0) setTarget((t) => clamp(t + dir * push, LO + 50, HI - 50));
  }, true);

  const wick = (pct: number) => {
    setTarget(clamp(price * (1 + pct), LO + 50, HI - 50));
    sfx.whoosh();
  };
  const reset = () => {
    const s = seed + 1;
    setSeed(s);
    setBins(buildBins(s, P0));
    setPrice(P0); setTarget(P0);
    setLiqLong(0); setLiqShort(0); setFeed([]); setChain(0);
    sfx.levelUp();
  };

  const keys = useSceneKeys({
    ArrowLeft: () => wick(-0.03),
    ArrowRight: () => wick(0.03),
    r: reset,
    "1": () => toggleLev(10), "2": () => toggleLev(25), "3": () => toggleLev(50), "4": () => toggleLev(100),
  });

  function toggleLev(l: Lev) {
    setFilter((f) => (f.includes(l) ? f.filter((x) => x !== l) : [...f, l]));
    sfx.tick();
  }

  const toPrice = (clientX: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return price;
    return clamp(LO + ((clientX - r.left) / r.width) * (HI - LO), LO + 50, HI - 50);
  };

  const remaining = LEVS.map((l) => ({ l, v: bins.reduce((s, b) => s + b.long[l] + b.short[l], 0) }));
  const remTotal = remaining.reduce((s, r) => s + r.v, 0) || 1;
  const move = ((price - P0) / P0) * 100;
  const nearestLong = [...bins.keys()].filter((i) => binPrice(i) < price && LEVS.some((l) => bins[i].long[l] > 0.5)).pop();
  const nearestShort = [...bins.keys()].find((i) => binPrice(i) > price && LEVS.some((l) => bins[i].short[l] > 0.5));

  return (
    <ShowcaseSection
      id="liquidations" index="56" kicker="Liquidation Cascade" title="Цепная реакция ликвидаций"
      desc="Кластеры ликвидаций по плечу стоят слева и справа от цены. Тяни цену или бей фитилём — пересечённые кластеры взрываются и толкают цену дальше. Чем плотнее кластеры, тем длиннее каскад."
      accent="#ff5470" variant="circuit"
      keys={[{ k: "← →", d: "фитиль ∓3%" }, { k: "1–4", d: "фильтр плеча" }, { k: "R", d: "новая карта" }]}
      moment="Запоминающийся момент: один фитиль запускает серию взрывов, и цена сама уезжает на −8%"
      tags={<div className="flex gap-2"><Tag tone={chain > 0 ? "red" : "ghost"}>{chain > 0 ? `CHAIN ×${chain}` : `best ×${bestChain}`}</Tag><Tag tone={move >= 0 ? "green" : "red"}>{move >= 0 ? "+" : ""}{move.toFixed(2)}%</Tag></div>}
    >
      <div ref={stageRef} className="relative" {...keys}>
        {waves}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button onClick={() => wick(-0.05)} className="btn3d btn3d-short px-3.5 py-2 text-[10px]"><TrendingDown size={13} /> Wick −5%</button>
          <button onClick={() => wick(-0.02)} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">−2%</button>
          <button onClick={() => wick(0.02)} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">+2%</button>
          <button onClick={() => wick(0.05)} className="btn3d btn3d-long px-3.5 py-2 text-[10px]"><TrendingUp size={13} /> Wick +5%</button>
          <div className="ml-auto flex items-center gap-1.5">
            {LEVS.map((l) => (
              <button key={l} onClick={() => toggleLev(l)}
                className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", filter.includes(l) ? "text-[#081130]" : "bg-white/5 text-[#54678f]")}
                style={filter.includes(l) ? { background: LEV_COLOR[l] } : undefined}>×{l}</button>
            ))}
            <button onClick={reset} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><RotateCcw size={12} /> Rebuild</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <ScenePanel title="BTC · liquidation clusters" sub="Тяни белый маркер цены · слева лонги, справа шорты" accent="#ff5470"
            right={<span className="num-mono text-sm font-extrabold text-white">${fmtPrice(price)}</span>}
          >
            <div className="panel-inset relative overflow-hidden p-2" style={{ boxShadow: chain > 0 ? "inset 0 0 60px rgba(255,84,112,.35)" : undefined }}>
              <svg
                ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full cursor-ew-resize touch-none select-none"
                onPointerDown={(e) => { dragging.current = true; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); const p = toPrice(e.clientX); setTarget(p); sfx.tick(); }}
                onPointerMove={(e) => { if (dragging.current) { const p = toPrice(e.clientX); setTarget(p); dragging.current = true; } }}
                onPointerUp={() => { dragging.current = false; }}
                onPointerLeave={() => { dragging.current = false; }}
              >
                <rect x={0} y={0} width={xp(price)} height={BASE} fill="#ff5470" opacity={0.035} />
                <rect x={xp(price)} y={0} width={W - xp(price)} height={BASE} fill="#2ede8a" opacity={0.035} />
                {bins.map((b, i) => {
                  const bx = (i / BINS) * W;
                  const bwid = W / BINS - 2;
                  let yCur = BASE;
                  const side = binPrice(i) < P0 ? "long" : "short";
                  const src = side === "long" ? b.long : b.short;
                  return (
                    <g key={i}>
                      {LEVS.map((l) => {
                        const v = src[l];
                        if (v < 0.3) return null;
                        const h = (v / maxStack) * 190;
                        yCur -= h;
                        const on = filter.includes(l);
                        return (
                          <motion.rect key={l} x={bx + 1} width={bwid} rx={2} initial={false}
                            animate={{ y: yCur, height: h, opacity: on ? 0.95 : 0.18 }}
                            transition={{ type: "spring", stiffness: 200, damping: 24 }}
                            fill={LEV_COLOR[l]} style={on ? { filter: `drop-shadow(0 0 3px ${LEV_COLOR[l]})` } : undefined} />
                        );
                      })}
                      {b.boom > 0 && (
                        <g>
                          <rect x={bx - 6} width={bwid + 14} y={0} height={BASE} fill={side === "long" ? "#ff5470" : "#2ede8a"} opacity={b.boom * 0.35} rx={4} />
                          <text x={bx + bwid / 2} y={BASE - 200 - (1 - b.boom) * 30} textAnchor="middle" fontSize={14} opacity={b.boom}>💥</text>
                        </g>
                      )}
                    </g>
                  );
                })}
                <line x1={0} x2={W} y1={BASE} y2={BASE} stroke="rgba(255,255,255,.18)" />
                {[0.9, 0.95, 1, 1.05, 1.1].map((k) => (
                  <g key={k}>
                    <line x1={xp(P0 * k)} x2={xp(P0 * k)} y1={BASE} y2={BASE + 6} stroke="rgba(255,255,255,.3)" />
                    <text x={xp(P0 * k)} y={BASE + 20} textAnchor="middle" fontSize={10} fontWeight={700} fill="#7d92c4">{fmtPrice(P0 * k)}</text>
                  </g>
                ))}
                {Math.abs(target - price) > 4 && (
                  <line x1={xp(price)} x2={xp(target)} y1={24} y2={24} stroke="#fff" strokeWidth={2} strokeDasharray="4 4" opacity={0.6} markerEnd="" />
                )}
                <g>
                  <line x1={xp(price)} x2={xp(price)} y1={10} y2={BASE} stroke="#fff" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 8px #fff)" }} />
                  <rect x={xp(price) - 42} y={2} width={84} height={20} rx={10} fill="#fff" />
                  <text x={xp(price)} y={16} textAnchor="middle" fontSize={11} fontWeight={800} fill="#081130">{fmtPrice(price)}</text>
                </g>
              </svg>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SceneStat label="Next long cluster" value={nearestLong !== undefined ? fmtPrice(binPrice(nearestLong)) : "—"} sub={nearestLong !== undefined ? `${(((binPrice(nearestLong) - price) / price) * 100).toFixed(2)}%` : "clear"} color="#ff8ba0" />
              <SceneStat label="Next short cluster" value={nearestShort !== undefined ? fmtPrice(binPrice(nearestShort)) : "—"} sub={nearestShort !== undefined ? `+${(((binPrice(nearestShort) - price) / price) * 100).toFixed(2)}%` : "clear"} color="#5ff5a8" />
              <SceneStat label="Chain now" value={`×${chain}`} color={chain > 2 ? "#ff5470" : "#fff"} />
              <SceneStat label="Best chain" value={`×${bestChain}`} color="#ffc531" />
            </div>
          </ScenePanel>

          <div className="space-y-4">
            <ScenePanel title="Liquidated" sub="Каскадный счётчик" accent="#ff5470">
              <div className="grid grid-cols-2 gap-2">
                <div className="panel-inset p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Longs rekt</p>
                  <AnimatedNumber value={liqLong} format={(v) => `$${v.toFixed(1)}M`} className="num-mono block text-lg font-extrabold text-[#ff5470]" />
                </div>
                <div className="panel-inset p-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Shorts rekt</p>
                  <AnimatedNumber value={liqShort} format={(v) => `$${v.toFixed(1)}M`} className="num-mono block text-lg font-extrabold text-[#2ede8a]" />
                </div>
              </div>
              <p className="mt-3 text-[9px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Remaining OI by leverage</p>
              <div className="mt-1.5 flex h-4 overflow-hidden rounded-full border border-white/10">
                {remaining.map((r) => (
                  <motion.div key={r.l} initial={false} animate={{ width: `${(r.v / remTotal) * 100}%` }} style={{ background: LEV_COLOR[r.l] }} />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[9px] font-extrabold">
                {remaining.map((r) => <span key={r.l} style={{ color: LEV_COLOR[r.l] }}>×{r.l} {r.v.toFixed(0)}M</span>)}
              </div>
            </ScenePanel>
            <ScenePanel title="Rekt feed" sub="Последние взрывы" accent="#ffc531">
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {feed.length === 0 && <p className="py-4 text-center text-[11px] text-[#54678f]">Ударь фитилём, чтобы запустить каскад</p>}
                  {feed.map((f) => (
                    <motion.div key={f.id} layout initial={{ opacity: 0, x: 30, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/25 px-2.5 py-1.5"
                    >
                      <Bomb size={13} className={f.side === "long" ? "text-[#ff5470]" : "text-[#2ede8a]"} />
                      <span className="text-[11px] font-extrabold text-white">${f.amt.toFixed(1)}M</span>
                      <span className="text-[10px] text-[#8ea6d8]">{f.side}s @ {fmtPrice(f.price)}</span>
                      <span className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-black" style={{ background: LEV_COLOR[f.lev], color: "#081130" }}>×{f.lev}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
