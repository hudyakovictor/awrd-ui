/* 61 · ORDER FLOW FOOTPRINT — bid×ask volume inside every candle.
   Zoom/pan · delta / volume / imbalance modes · POC per bar · stacked
   imbalance zones · hover cell inspector · live forming last bar. */
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Pause, Play, Plus, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, useOnScreen, useZoomPan } from "../showcase/fx";
import { mulberry } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const TICK = 10;
const MODES = ["Delta", "Volume", "Imbalance"] as const;
type Mode = (typeof MODES)[number];

type Cell = { bid: number; ask: number };
type Bar = { o: number; c: number; h: number; l: number; cells: Cell[]; base: number };

function makeBar(rnd: () => number, open: number): Bar {
  const move = Math.round((rnd() - 0.48) * 6);
  const c = open + move;
  const h = Math.max(open, c) + Math.round(rnd() * 2);
  const l = Math.min(open, c) - Math.round(rnd() * 2);
  const base = l;
  const n = h - l + 1;
  const cells: Cell[] = Array.from({ length: n }, (_, k) => {
    const lvl = base + k;
    const center = Math.exp(-((lvl - (open + c) / 2) ** 2) / 4);
    const vol = 20 + center * 140 + rnd() * 40;
    const aggr = move > 0 ? 0.62 : move < 0 ? 0.38 : 0.5;
    const ask = Math.round(vol * clamp(aggr + (rnd() - 0.5) * 0.35, 0.05, 0.95));
    return { ask, bid: Math.round(vol - ask) };
  });
  return { o: open, c, h, l, cells, base };
}

export default function FootprintChart() {
  const [seed, setSeed] = useState(12);
  const [mode, setMode] = useState<Mode>("Delta");
  const [ratio, setRatio] = useState(3);
  const [live, setLive] = useState(true);
  const [hover, setHover] = useState<{ b: number; k: number } | null>(null);
  const { ref: wrapRef, inView } = useOnScreen<HTMLDivElement>();
  const initial = useMemo(() => {
    const rnd = mulberry(seed);
    const out: Bar[] = [];
    let p = 100;
    for (let i = 0; i < 40; i++) { const b = makeBar(rnd, p); out.push(b); p = b.c; }
    return out;
  }, [seed]);
  const [bars, setBars] = useState<Bar[]>(initial);
  useEffect(() => setBars(initial), [initial]);
  const zp = useZoomPan(bars.length, { minSpan: 5, initialSpan: 12 });

  useEffect(() => {
    if (!live || !inView) return;
    const id = window.setInterval(() => {
      setBars((bs) => {
        const last = bs[bs.length - 1];
        const rnd = Math.random;
        // grow last bar or start new
        if (Math.random() > 0.8) {
          sfx.tick();
          return [...bs.slice(1), makeBar(rnd, last.c)];
        }
        const step = Math.random() > 0.5 ? 1 : -1;
        const nc = last.c + (Math.random() > 0.6 ? step : 0);
        const nh = Math.max(last.h, nc), nl = Math.min(last.l, nc);
        const cells = [...last.cells.map((c) => ({ ...c }))];
        let base = last.base;
        if (nl < last.base) { cells.unshift({ bid: 0, ask: 0 }); base = nl; }
        if (nh > last.base + cells.length - 1) cells.push({ bid: 0, ask: 0 });
        const k = nc - base;
        if (cells[k]) {
          const v = 8 + Math.round(Math.random() * 30);
          if (step > 0) cells[k].ask += v; else cells[k].bid += v;
        }
        return [...bs.slice(0, -1), { ...last, c: nc, h: nh, l: nl, base, cells }];
      });
    }, 360);
    return () => window.clearInterval(id);
  }, [live, inView]);

  const i0 = Math.max(0, Math.floor(zp.start));
  const i1 = Math.min(bars.length - 1, Math.ceil(zp.end) - 1);
  const vis = bars.slice(i0, i1 + 1);
  const lo = Math.min(...vis.map((b) => b.l)) - 1;
  const hi = Math.max(...vis.map((b) => b.h)) + 1;
  const rowsN = hi - lo + 1;
  const W = 720, H = 380;
  const colW = W / Math.max(1, zp.span);
  const rowH = (H - 24) / rowsN;
  const xb = (i: number) => (i - zp.start) * colW;
  const yl = (lvl: number) => 12 + (hi - lvl) * rowH;
  const maxCell = Math.max(1, ...vis.flatMap((b) => b.cells.map((c) => c.bid + c.ask)));
  const showNums = colW > 58 && rowH > 13;

  const cellColor = (c: Cell, bar: Bar, k: number) => {
    const total = c.bid + c.ask;
    if (mode === "Volume") return `rgba(91,140,255,${0.12 + (total / maxCell) * 0.75})`;
    if (mode === "Imbalance") {
      const up = bar.cells[k + 1];
      const dn = bar.cells[k - 1];
      if (dn && c.ask >= ratio * Math.max(1, dn.bid)) return "rgba(46,222,138,.8)";
      if (up && c.bid >= ratio * Math.max(1, up.ask)) return "rgba(255,84,112,.8)";
      return "rgba(255,255,255,.05)";
    }
    const d = c.ask - c.bid;
    const a = Math.min(0.85, 0.1 + (Math.abs(d) / maxCell) * 2.2);
    return d >= 0 ? `rgba(46,222,138,${a})` : `rgba(255,84,112,${a})`;
  };

  const barDelta = (b: Bar) => b.cells.reduce((s, c) => s + c.ask - c.bid, 0);
  const barVol = (b: Bar) => b.cells.reduce((s, c) => s + c.ask + c.bid, 0);
  const pocIdx = (b: Bar) => b.cells.reduce((best, c, k) => (c.ask + c.bid > b.cells[best].ask + b.cells[best].bid ? k : best), 0);
  const cumDelta = bars.reduce((s, b) => s + barDelta(b), 0);

  const hb = hover ? bars[hover.b] : null;
  const hc = hb && hover ? hb.cells[hover.k] : null;

  return (
    <ShowcaseSection
      id="footprint" index="61" kicker="Order Flow Footprint" title="Footprint: объём внутри каждой свечи"
      desc="Каждая свеча разложена на цены: слева продажи по bid, справа покупки по ask. Режимы Delta / Volume / Imbalance перекрашивают сетку, золотая рамка — POC. Зумь колесом, тащи, последняя свеча формируется вживую."
      accent="#2ede8a" variant="scan"
      keys={[{ k: "Space", d: "live" }, { k: "D V I", d: "режим" }, { k: "+ − 0", d: "zoom" }]}
      hotkeys={{
        Space: () => setLive((v) => !v),
        d: () => setMode("Delta"), v: () => setMode("Volume"), i: () => setMode("Imbalance"),
        "+": () => zp.zoomAt(0.8), "-": () => zp.zoomAt(1.25), "0": () => zp.reset(),
      }}
      moment="Запоминающийся момент: в режиме Imbalance проступают стопки зелёных ячеек — след агрессивного покупателя"
      tags={<div className="flex gap-2"><Tag tone={cumDelta >= 0 ? "green" : "red"}>CVD {cumDelta >= 0 ? "+" : ""}{cumDelta}</Tag><Tag tone="ghost">{zp.zoom.toFixed(1)}×</Tag></div>}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Seg options={MODES} value={mode} onChange={setMode} accent="#2ede8a" />
        {mode === "Imbalance" && (
          <label className="flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            Ratio {ratio}:1
            <input type="range" min={2} max={6} step={0.5} value={ratio} onChange={(e) => setRatio(+e.target.value)} className="lever w-24" style={{ ["--fill" as string]: `${((ratio - 2) / 4) * 100}%` }} />
          </label>
        )}
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => zp.zoomAt(0.8)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg"><Plus size={13} /></button>
          <button onClick={() => zp.zoomAt(1.25)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg"><Minus size={13} /></button>
          <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><RotateCcw size={12} /> New</button>
          <button onClick={() => setLive((v) => !v)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg">{live ? <Pause size={13} /> : <Play size={13} />}</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <ScenePanel title="BTC/USDT · 5m footprint" sub="bid × ask · wheel — zoom · drag — pan" accent="#2ede8a">
          <div ref={wrapRef}>
            <div
              ref={zp.ref}
              {...zp.bind}
              className={cn("panel-inset relative overflow-hidden touch-none select-none", zp.dragging ? "cursor-grabbing" : "cursor-grab")}
              onPointerLeave={() => { zp.bind.onPointerUp(); setHover(null); }}
            >
              <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
                {Array.from({ length: rowsN }, (_, r) => (
                  <line key={r} x1={0} x2={W} y1={12 + r * rowH} y2={12 + r * rowH} stroke="rgba(255,255,255,.035)" />
                ))}
                {vis.map((b, vi) => {
                  const bi = i0 + vi;
                  const x = xb(bi);
                  const cw = colW * 0.86;
                  const poc = pocIdx(b);
                  const up = b.c >= b.o;
                  const isLast = bi === bars.length - 1;
                  return (
                    <g key={bi}>
                      {/* candle spine */}
                      <line x1={x + 4} x2={x + 4} y1={yl(b.h) } y2={yl(b.l) + rowH} stroke={up ? "#2ede8a" : "#ff5470"} strokeWidth={2} />
                      <rect x={x + 1.5} y={yl(Math.max(b.o, b.c))} width={5} height={Math.max(2, (Math.abs(b.c - b.o) + 1) * rowH)} rx={1.5} fill={up ? "#2ede8a" : "#ff5470"} />
                      {b.cells.map((c, k) => {
                        const lvl = b.base + k;
                        const y = yl(lvl);
                        const isHover = hover && hover.b === bi && hover.k === k;
                        return (
                          <g key={k}
                            onPointerEnter={() => setHover({ b: bi, k })}
                          >
                            <rect x={x + 10} y={y + 0.5} width={cw - 10} height={rowH - 1} rx={2}
                              fill={cellColor(c, b, k)} stroke={isHover ? "#fff" : k === poc ? "#ffc531" : "transparent"} strokeWidth={isHover ? 1.8 : 1.4} />
                            {showNums && (
                              <>
                                <text x={x + 10 + (cw - 10) * 0.25} y={y + rowH * 0.68} textAnchor="middle" fontSize={Math.min(10, rowH * 0.6)} fontWeight={800} fill="#ffd0d8" fontFamily="JetBrains Mono, monospace">{c.bid}</text>
                                <text x={x + 10 + (cw - 10) * 0.5} y={y + rowH * 0.68} textAnchor="middle" fontSize={Math.min(9, rowH * 0.55)} fill="rgba(255,255,255,.35)">×</text>
                                <text x={x + 10 + (cw - 10) * 0.75} y={y + rowH * 0.68} textAnchor="middle" fontSize={Math.min(10, rowH * 0.6)} fontWeight={800} fill="#c8ffe4" fontFamily="JetBrains Mono, monospace">{c.ask}</text>
                              </>
                            )}
                          </g>
                        );
                      })}
                      {isLast && live && (
                        <rect x={x + 8} y={yl(b.h) - 2} width={cw - 6} height={(b.h - b.l + 1) * rowH + 4} fill="none" stroke="#fff" strokeDasharray="4 3" rx={4}>
                          <animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite" />
                        </rect>
                      )}
                      <text x={x + cw / 2 + 5} y={H - 2} textAnchor="middle" fontSize={9} fontWeight={800} fill={barDelta(b) >= 0 ? "#2ede8a" : "#ff5470"}>
                        {barDelta(b) >= 0 ? "+" : ""}{barDelta(b)}
                      </text>
                    </g>
                  );
                })}
                {Array.from({ length: rowsN }, (_, r) => (r % 2 === 0 ? (
                  <text key={`p${r}`} x={W - 4} y={12 + r * rowH + rowH * 0.7} textAnchor="end" fontSize={9} fontWeight={700} fill="#5f75a8">{((hi - r) * TICK + 96400).toLocaleString("en-US")}</text>
                ) : null))}
              </svg>
              <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
                <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-extrabold text-[#ffd0d8] backdrop-blur">bid</span>
                <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-extrabold text-[#c8ffe4] backdrop-blur">ask</span>
                <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-extrabold text-[#ffc531] backdrop-blur">▢ POC</span>
                {!showNums && <span className="rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-[#8ea6d8] backdrop-blur">zoom in for numbers</span>}
              </div>
            </div>
          </div>
        </ScenePanel>

        <div className="space-y-4">
          <ScenePanel title="Cell inspector" sub={hb && hover ? `bar ${hover.b} · ${((hb.base + hover.k) * TICK + 96400).toLocaleString("en-US")}` : "Наведи на ячейку"} accent="#2ede8a">
            <AnimatePresence mode="wait">
              {hc && hb ? (
                <motion.div key={`${hover?.b}-${hover?.k}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-2 gap-2">
                    <SceneStat label="Bid (sells)" value={`${hc.bid}`} color="#ff8ba0" />
                    <SceneStat label="Ask (buys)" value={`${hc.ask}`} color="#5ff5a8" />
                    <SceneStat label="Delta" value={`${hc.ask - hc.bid >= 0 ? "+" : ""}${hc.ask - hc.bid}`} color={hc.ask >= hc.bid ? "#2ede8a" : "#ff5470"} />
                    <SceneStat label="Share of bar" value={`${Math.round(((hc.ask + hc.bid) / Math.max(1, barVol(hb))) * 100)}%`} color="#fff" />
                  </div>
                  <div className="mt-3 flex h-4 overflow-hidden rounded-full border border-white/10">
                    <motion.div className="h-full bg-[#ff5470]" initial={false} animate={{ width: `${(hc.bid / Math.max(1, hc.bid + hc.ask)) * 100}%` }} />
                    <motion.div className="h-full bg-[#2ede8a]" initial={false} animate={{ width: `${(hc.ask / Math.max(1, hc.bid + hc.ask)) * 100}%` }} />
                  </div>
                </motion.div>
              ) : (
                <p className="py-6 text-center text-[11px] text-[#7d92c4]">Каждая ячейка — объём на одном уровне цены</p>
              )}
            </AnimatePresence>
          </ScenePanel>
          <ScenePanel title="Session delta" sub="Кумулятивная дельта по барам" accent="#5b8cff">
            <div className="flex h-24 items-end gap-[2px]">
              {bars.slice(-30).map((b, k) => {
                const d = barDelta(b);
                const mx = Math.max(1, ...bars.slice(-30).map((x) => Math.abs(barDelta(x))));
                return (
                  <div key={k} className="relative flex-1" style={{ height: "100%" }}>
                    <motion.div className="absolute inset-x-0 rounded-sm" initial={false}
                      animate={{ height: `${(Math.abs(d) / mx) * 48}%`, bottom: d >= 0 ? "50%" : `${50 - (Math.abs(d) / mx) * 48}%` }}
                      style={{ background: d >= 0 ? "#2ede8a" : "#ff5470" }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <SceneStat label="CVD" value={`${cumDelta >= 0 ? "+" : ""}${cumDelta}`} color={cumDelta >= 0 ? "#2ede8a" : "#ff5470"} />
              <SceneStat label="Last bar vol" value={`${barVol(bars[bars.length - 1])}`} color="#fff" />
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
