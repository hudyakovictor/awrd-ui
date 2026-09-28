/* 53 · CHART COMPARATOR — interactive A/B of two chart states.
   Draggable magnetic divider · shared zoom/pan · split / overlay / side
   · Heikin-Ashi, EMA smoothing, log scale, before/after regimes · sweep reveal. */
import { animate, motion, useMotionValue, useMotionValueEvent } from "framer-motion";
import { ArrowLeftRight, Minus, Plus, RotateCcw, Wand2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, useSceneKeys, useZoomPan } from "../showcase/fx";
import { emaArr, genCandles, type Candle } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const MODES = ["Heikin-Ashi", "Smoothed", "Log scale", "Regime shift"] as const;
type Mode = (typeof MODES)[number];
const VIEWS = ["Split", "Overlay", "Side"] as const;
type View = (typeof VIEWS)[number];

function heikinAshi(cs: Candle[]): Candle[] {
  const out: Candle[] = [];
  cs.forEach((c, i) => {
    const hc = (c.o + c.h + c.l + c.c) / 4;
    const ho = i === 0 ? (c.o + c.c) / 2 : (out[i - 1].o + out[i - 1].c) / 2;
    out.push({ o: ho, c: hc, h: Math.max(c.h, ho, hc), l: Math.min(c.l, ho, hc), v: c.v, t: c.t });
  });
  return out;
}

function stats(cs: Candle[], a: number, b: number) {
  let flips = 0, body = 0, net = 0, path = 0;
  for (let i = Math.max(1, a); i <= b && i < cs.length; i++) {
    const up = cs[i].c >= cs[i].o;
    const pu = cs[i - 1].c >= cs[i - 1].o;
    if (up !== pu) flips++;
    body += Math.abs(cs[i].c - cs[i].o);
    path += Math.abs(cs[i].c - cs[i - 1].c);
  }
  const s = cs[Math.max(0, a)], e = cs[Math.min(cs.length - 1, b)];
  if (s && e) net = Math.abs(e.c - s.c);
  const n = Math.max(1, b - a);
  return { flips, avgBody: body / n, clarity: path ? (net / path) * 100 : 0 };
}

export default function ChartComparator() {
  const [mode, setMode] = useState<Mode>("Heikin-Ashi");
  const [view, setView] = useState<View>("Split");
  const [seed, setSeed] = useState(15);
  const [ghost, setGhost] = useState(55);
  const [hover, setHover] = useState<number | null>(null);
  const divider = useMotionValue(0.5);
  const [div, setDiv] = useState(0.5);
  useMotionValueEvent(divider, "change", (v) => setDiv(v));
  const dragDiv = useRef(false);
  const areaRef = useRef<HTMLDivElement>(null);

  const base = useMemo(() => genCandles(seed, 160, 100, "volatile", 3_600_000), [seed]);
  const alt = useMemo(() => genCandles(seed + 900, 160, 100, "trend", 3_600_000), [seed]);
  const A = base;
  const B = useMemo(() => {
    if (mode === "Heikin-Ashi") return heikinAshi(base);
    if (mode === "Regime shift") return alt;
    return base;
  }, [mode, base, alt]);
  const emaB = useMemo(() => emaArr(B.map((c) => c.c), 12), [B]);
  const emaB2 = useMemo(() => emaArr(B.map((c) => c.c), 26), [B]);

  const zp = useZoomPan(A.length, { minSpan: 14, initialSpan: 90 });
  const W = 720, H = 300;
  const i0 = Math.max(0, Math.floor(zp.start));
  const i1 = Math.min(A.length - 1, Math.ceil(zp.end));

  const domain = (cs: Candle[], log: boolean) => {
    let mn = Infinity, mx = -Infinity;
    for (let i = i0; i <= i1; i++) { mn = Math.min(mn, cs[i].l); mx = Math.max(mx, cs[i].h); }
    const pad = (mx - mn) * 0.08;
    const lo = mn - pad, hi = mx + pad;
    return log ? { lo: Math.log(Math.max(0.1, lo)), hi: Math.log(hi), log } : { lo, hi, log };
  };
  const dA = domain(A, false);
  const dB = domain(B, mode === "Log scale");
  const shared = view === "Overlay" ? { lo: Math.min(dA.lo, mode === "Log scale" ? Math.exp(dB.lo) : dB.lo), hi: Math.max(dA.hi, mode === "Log scale" ? Math.exp(dB.hi) : dB.hi) } : null;
  const span = Math.max(1, zp.span);
  const bw = W / span;
  const x = (i: number) => ((i - zp.start + 0.5) / span) * W;
  const yFor = (d: { lo: number; hi: number; log: boolean }) => (v: number) => {
    const vv = d.log ? Math.log(Math.max(0.1, v)) : v;
    return 10 + (1 - (vv - d.lo) / (d.hi - d.lo || 1)) * (H - 20);
  };
  const yA = shared ? yFor({ ...shared, log: false }) : yFor(dA);
  const yB = shared ? yFor({ ...shared, log: false }) : yFor(dB);

  const renderSet = (cs: Candle[], y: (v: number) => number, tone: "A" | "B", ghostMode = false) => {
    const smoothed = tone === "B" && mode === "Smoothed";
    return (
      <g opacity={ghostMode ? ghost / 100 : 1}>
        {Array.from({ length: i1 - i0 + 1 }, (_, k) => {
          const i = i0 + k;
          const c = cs[i];
          const up = c.c >= c.o;
          const col = ghostMode ? (up ? "#9db9ff" : "#c9b6ff") : up ? "#2ede8a" : "#ff5470";
          const w = Math.max(1, bw * 0.6);
          return (
            <g key={i} opacity={smoothed ? 0.25 : hover === i ? 1 : 0.95}>
              <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={Math.max(1, Math.min(2, bw * 0.12))} />
              <rect x={x(i) - w / 2} y={y(Math.max(c.o, c.c))} width={w} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={Math.min(2, w / 4)} />
            </g>
          );
        })}
        {smoothed && (
          <>
            <path d={emaPath(emaB, y)} fill="none" stroke="#ffc531" strokeWidth={2.4} style={{ filter: "drop-shadow(0 0 6px #ffc531)" }} />
            <path d={emaPath(emaB2, y)} fill="none" stroke="#ff8b3d" strokeWidth={2.4} />
            <path d={`${emaPath(emaB, y)} ${reversePath(emaB2, y)} Z`} fill="#ffc531" opacity={0.1} />
          </>
        )}
      </g>
    );
  };

  function emaPath(arr: (number | null)[], y: (v: number) => number) {
    let d = "";
    for (let i = i0; i <= i1; i++) {
      const v = arr[i];
      if (v == null) continue;
      d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    }
    return d;
  }
  function reversePath(arr: (number | null)[], y: (v: number) => number) {
    let d = "";
    for (let i = i1; i >= i0; i--) {
      const v = arr[i];
      if (v == null) continue;
      d += `L${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    }
    return d;
  }

  const sA = stats(A, i0, i1);
  const sB = stats(B, i0, i1);

  const sweep = () => {
    sfx.whoosh();
    animate(divider, 0, { duration: 0.25 }).then(() =>
      animate(divider, 1, { duration: 1.4, ease: "easeInOut" }).then(() => animate(divider, 0.5, { type: "spring", stiffness: 120, damping: 16 })),
    );
  };

  const snapDiv = (v: number) => {
    for (const p of [0.25, 0.5, 0.75]) if (Math.abs(v - p) < 0.025) return p;
    return clamp(v, 0.02, 0.98);
  };

  const keys = useSceneKeys({
    ArrowLeft: () => divider.set(snapDiv(divider.get() - 0.05)),
    ArrowRight: () => divider.set(snapDiv(divider.get() + 0.05)),
    s: sweep,
    "+": () => zp.zoomAt(0.8),
    "-": () => zp.zoomAt(1.25),
    "0": () => zp.reset(),
    v: () => setView((vv) => VIEWS[(VIEWS.indexOf(vv) + 1) % VIEWS.length]),
  });

  const hoverFromEvent = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const frac = (clientX - r.left) / r.width;
    const local = view === "Side" ? (frac < 0.5 ? frac * 2 : (frac - 0.5) * 2) : frac;
    setHover(clamp(Math.round(zp.start + local * span - 0.5), 0, A.length - 1));
  };

  const hc = hover !== null ? { a: A[hover], b: B[hover] } : null;
  const label = { A: "Raw candles", B: mode === "Heikin-Ashi" ? "Heikin-Ashi" : mode === "Smoothed" ? "EMA ribbon" : mode === "Log scale" ? "Log scale" : "After regime shift" };

  return (
    <ShowcaseSection
      id="compare" index="53" kicker="Chart Comparator" title="Сравнение двух состояний графика"
      desc="Один рынок — два взгляда. Тяни магнитный разделитель, зумь колесом и таскай график: обе стороны двигаются синхронно. Режимы Split, Overlay и Side меняют всю композицию."
      accent="#5b8cff" variant="grid"
      keys={[{ k: "← →", d: "разделитель" }, { k: "S", d: "sweep" }, { k: "+ − 0", d: "zoom" }, { k: "V", d: "вид" }]}
      moment="Запоминающийся момент: sweep-проход разделителя «перекрашивает» рынок из шума в чистый тренд"
      tags={<div className="flex gap-2"><Tag tone="blue">{view}</Tag><Tag tone="ghost">{zp.zoom.toFixed(1)}× zoom</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Seg options={MODES} value={mode} onChange={setMode} accent="#5b8cff" />
          <Seg options={VIEWS} value={view} onChange={setView} accent="#a78bff" />
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => zp.zoomAt(0.8)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg"><Plus size={13} /></button>
            <button onClick={() => zp.zoomAt(1.25)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg"><Minus size={13} /></button>
            <button onClick={() => zp.reset()} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg"><RotateCcw size={12} /></button>
            <button onClick={sweep} className="btn3d btn3d-blue px-3 py-2 text-[10px]"><Wand2 size={13} /> Sweep</button>
            <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">New data</button>
          </div>
        </div>

        {view === "Overlay" && (
          <label className="mb-3 flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            Ghost opacity {ghost}%
            <input type="range" min={10} max={100} value={ghost} onChange={(e) => setGhost(+e.target.value)} className="lever w-48" style={{ ["--fill" as string]: `${ghost}%` }} />
          </label>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
          <ScenePanel
            title={view === "Side" ? "A · B side by side" : `${label.A}  ⟷  ${label.B}`} sub="wheel — zoom · drag — pan · dbl-click — reset" accent="#5b8cff"
            right={hc ? <span className="num-mono text-[10px] font-bold text-white">A {hc.a.c.toFixed(2)} · B {hc.b.c.toFixed(2)}</span> : undefined}
          >
            <div
              ref={(el) => { areaRef.current = el; (zp.ref as React.MutableRefObject<HTMLDivElement | null>).current = el; }}
              className={cn("panel-inset relative overflow-hidden touch-none select-none", zp.dragging ? "cursor-grabbing" : "cursor-grab")}
              onPointerDown={(e) => { if (!dragDiv.current) zp.bind.onPointerDown(e); }}
              onPointerMove={(e) => {
                if (dragDiv.current && areaRef.current) {
                  const r = areaRef.current.getBoundingClientRect();
                  divider.set(snapDiv((e.clientX - r.left) / r.width));
                  return;
                }
                zp.bind.onPointerMove(e);
                hoverFromEvent(e.clientX, e.currentTarget);
              }}
              onPointerUp={() => { if (dragDiv.current) sfx.soft(); dragDiv.current = false; zp.bind.onPointerUp(); }}
              onPointerLeave={() => { dragDiv.current = false; zp.bind.onPointerUp(); setHover(null); }}
              onDoubleClick={() => zp.reset()}
            >
              {view === "Side" ? (
                <div className="grid grid-cols-2 gap-px bg-white/10">
                  {(["A", "B"] as const).map((t) => (
                    <div key={t} className="relative bg-[#070f2b]">
                      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
                        {t === "A" ? renderSet(A, yA, "A") : renderSet(B, yB, "B")}
                        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="#9db9ff" strokeDasharray="4 4" />}
                      </svg>
                      <span className={cn("absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-black", t === "A" ? "bg-white/15 text-white" : "bg-[#5b8cff] text-white")}>{t} · {label[t]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
                    <defs>
                      <clipPath id="cmp-left"><rect x={0} y={0} width={div * W} height={H} /></clipPath>
                      <clipPath id="cmp-right"><rect x={div * W} y={0} width={W - div * W} height={H} /></clipPath>
                    </defs>
                    {view === "Split" ? (
                      <>
                        <g clipPath="url(#cmp-left)">{renderSet(A, yA, "A")}</g>
                        <g clipPath="url(#cmp-right)">
                          <rect x={div * W} y={0} width={W - div * W} height={H} fill="#5b8cff" opacity={0.05} />
                          {renderSet(B, yB, "B")}
                        </g>
                      </>
                    ) : (
                      <>
                        {renderSet(A, yA, "A")}
                        {renderSet(B, yB, "B", true)}
                      </>
                    )}
                    {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={0} y2={H} stroke="#9db9ff" strokeDasharray="4 4" />}
                  </svg>
                  {view === "Split" && (
                    <>
                      <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-white" style={{ left: `${div * 100}%`, boxShadow: "0 0 18px #5b8cff, 0 0 4px #fff" }} />
                      <button
                        className="absolute top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-[3px] border-white bg-[#5b8cff] text-white"
                        style={{ left: `${div * 100}%`, boxShadow: "0 5px 0 #1a2f7d, 0 0 26px rgba(91,140,255,.8)" }}
                        onPointerDown={(e) => { e.stopPropagation(); dragDiv.current = true; (e.currentTarget.parentElement?.parentElement as HTMLElement)?.setPointerCapture?.(e.pointerId); sfx.tick(); }}
                      ><ArrowLeftRight size={18} strokeWidth={3} /></button>
                      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">A · {label.A}</span>
                      <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-[#5b8cff] px-2 py-0.5 text-[10px] font-black text-white">B · {label.B}</span>
                      {[0.25, 0.5, 0.75].map((p) => (
                        <span key={p} className="pointer-events-none absolute bottom-1 h-2 w-[2px] -translate-x-1/2 rounded bg-white/40" style={{ left: `${p * 100}%` }} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="mt-2 h-8 overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <motion.div
                className="h-full rounded-xl border-2 border-[#5b8cff] bg-[#5b8cff]/15"
                animate={{ marginLeft: `${(zp.start / A.length) * 100}%`, width: `${(zp.span / A.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            </div>
          </ScenePanel>

          <div className="space-y-4">
            <ScenePanel title="Diff in view" sub={`bars ${i0}–${i1}`} accent="#a78bff">
              {([
                ["Color flips", sA.flips, sB.flips, true],
                ["Avg body", +sA.avgBody.toFixed(2), +sB.avgBody.toFixed(2), false],
                ["Trend clarity %", +sA.clarity.toFixed(1), +sB.clarity.toFixed(1), false],
              ] as const).map(([k, a, b, lowerBetter]) => {
                const better = lowerBetter ? b < a : b > a;
                const mx = Math.max(a, b, 0.001);
                return (
                  <div key={k} className="mb-3">
                    <div className="mb-1 flex justify-between text-[10px] font-extrabold">
                      <span className="text-[#8ea6d8]">{k}</span>
                      <span className={better ? "text-[#2ede8a]" : "text-[#ff8ba0]"}>{better ? "B wins" : "A wins"}</span>
                    </div>
                    {[["A", a, "#9db9ff"], ["B", b, "#5b8cff"]].map(([t, v, c]) => (
                      <div key={t as string} className="mb-1 flex items-center gap-2">
                        <span className="w-3 text-[10px] font-black text-white">{t}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/50">
                          <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${((v as number) / mx) * 100}%` }} style={{ background: c as string }} />
                        </div>
                        <span className="num-mono w-10 text-right text-[10px] text-white">{v as number}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </ScenePanel>
            <ScenePanel title="Divider" sub="магнит 25 / 50 / 75" accent="#5b8cff">
              <div className="grid grid-cols-2 gap-2">
                <SceneStat label="A share" value={`${Math.round(div * 100)}%`} color="#9db9ff" />
                <SceneStat label="B share" value={`${Math.round((1 - div) * 100)}%`} color="#5b8cff" />
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0.25, 0.5, 0.75].map((p) => (
                  <button key={p} onClick={() => { animate(divider, p, { type: "spring", stiffness: 200, damping: 20 }); sfx.tick(); }} className="btn3d btn3d-ghost flex-1 py-2 text-[10px]">{p * 100}%</button>
                ))}
              </div>
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
