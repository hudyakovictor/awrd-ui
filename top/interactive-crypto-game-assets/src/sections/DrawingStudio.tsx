/* 58 · DRAWING STUDIO — chart annotation workbench on ZoomChart.
   Trendline · horizontal ray · fib retracement · zone · ruler · select/move
   · magnet to OHLC · undo · drawings anchored in (index, price) space
   so they stay glued while you zoom and pan. */
import { AnimatePresence, motion } from "framer-motion";
import { Hand, Magnet, Minus as HLine, MousePointer2, Ruler, Slash, Square, Trash2, Undo2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { ZoomChart, type ChartPointer, type ChartScales } from "../showcase/ZoomChart";
import { useSceneKeys } from "../showcase/fx";
import { fmtPrice, genCandles } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Tool = "pan" | "select" | "trend" | "hline" | "fib" | "zone" | "ruler";
type Pt = { i: number; v: number };
type Shape = { id: number; kind: Exclude<Tool, "pan" | "select" | "ruler">; a: Pt; b: Pt; color: string };

const TOOLS: { id: Tool; icon: typeof Hand; label: string; key: string }[] = [
  { id: "pan", icon: Hand, label: "Pan", key: "h" },
  { id: "select", icon: MousePointer2, label: "Select", key: "v" },
  { id: "trend", icon: Slash, label: "Trend", key: "t" },
  { id: "hline", icon: HLine, label: "H-line", key: "l" },
  { id: "fib", icon: Ruler, label: "Fib", key: "f" },
  { id: "zone", icon: Square, label: "Zone", key: "z" },
  { id: "ruler", icon: Ruler, label: "Measure", key: "m" },
];
const COLORS = ["#8ef23c", "#ffc531", "#5b8cff", "#ff5470", "#a78bff", "#14c8f5"];
const FIBS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
const PRICE_SCALE = 974;

let shapeId = 1;

export default function DrawingStudio() {
  const [tool, setTool] = useState<Tool>("trend");
  const [color, setColor] = useState(COLORS[0]);
  const [magnet, setMagnet] = useState(true);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [draft, setDraft] = useState<{ a: Pt; b: Pt } | null>(null);
  const [ruler, setRuler] = useState<{ a: Pt; b: Pt } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [seed, setSeed] = useState(27);
  const moveRef = useRef<{ id: number; start: Pt; a: Pt; b: Pt } | null>(null);
  const candles = useMemo(() => genCandles(seed, 220, 100, "volatile", 3_600_000), [seed]);

  const onPointer = (p: ChartPointer) => {
    const pt = { i: p.snapped.i, v: p.snapped.v };
    if (tool === "pan") return;
    if (tool === "select") {
      if (p.kind === "down") {
        const hit = hitTest(pt);
        setSelected(hit?.id ?? null);
        if (hit) { moveRef.current = { id: hit.id, start: pt, a: hit.a, b: hit.b }; sfx.tick(); }
      } else if (p.kind === "move" && moveRef.current) {
        const m = moveRef.current;
        const di = pt.i - m.start.i, dv = pt.v - m.start.v;
        setShapes((s) => s.map((sh) => (sh.id === m.id ? { ...sh, a: { i: m.a.i + di, v: m.a.v + dv }, b: { i: m.b.i + di, v: m.b.v + dv } } : sh)));
      } else if (p.kind === "up") {
        if (moveRef.current) sfx.soft();
        moveRef.current = null;
      }
      return;
    }
    if (tool === "ruler") {
      if (p.kind === "down") setRuler({ a: pt, b: pt });
      else if (p.kind === "move" && ruler && (p as ChartPointer).kind === "move" && draftActive.current) setRuler((r) => (r ? { ...r, b: pt } : r));
      if (p.kind === "down") draftActive.current = true;
      if (p.kind === "up") { draftActive.current = false; sfx.pop(); }
      return;
    }
    if (p.kind === "down") {
      draftActive.current = true;
      setDraft({ a: pt, b: pt });
    } else if (p.kind === "move" && draftActive.current) {
      setDraft((d) => (d ? { ...d, b: pt } : d));
    } else if (p.kind === "up" && draftActive.current) {
      draftActive.current = false;
      setDraft((d) => {
        if (d) {
          const kind = tool as Shape["kind"];
          const moved = Math.abs(d.b.i - d.a.i) > 0.8 || Math.abs(d.b.v - d.a.v) > 0.2 || kind === "hline";
          if (moved) {
            const sh: Shape = { id: shapeId++, kind, a: d.a, b: kind === "hline" ? { i: d.a.i + 40, v: d.a.v } : d.b, color };
            setShapes((s) => [...s, sh]);
            setSelected(sh.id);
            sfx.success();
          }
        }
        return null;
      });
    }
  };
  const draftActive = useRef(false);

  function hitTest(pt: Pt) {
    let best: Shape | null = null;
    let bestD = Infinity;
    for (const s of shapes) {
      let d = Infinity;
      if (s.kind === "hline") d = Math.abs(pt.v - s.a.v) * 3;
      else if (s.kind === "zone" || s.kind === "fib") {
        const inI = pt.i >= Math.min(s.a.i, s.b.i) - 1 && pt.i <= Math.max(s.a.i, s.b.i) + 1;
        const inV = pt.v >= Math.min(s.a.v, s.b.v) - 0.5 && pt.v <= Math.max(s.a.v, s.b.v) + 0.5;
        d = inI && inV ? 0.5 : Infinity;
      } else {
        const t = Math.max(0, Math.min(1, ((pt.i - s.a.i) * (s.b.i - s.a.i) + (pt.v - s.a.v) * (s.b.v - s.a.v)) / (((s.b.i - s.a.i) ** 2 + (s.b.v - s.a.v) ** 2) || 1)));
        const ci = s.a.i + t * (s.b.i - s.a.i), cv = s.a.v + t * (s.b.v - s.a.v);
        d = Math.abs(pt.i - ci) * 0.5 + Math.abs(pt.v - cv) * 3;
      }
      if (d < bestD && d < 2.5) { bestD = d; best = s; }
    }
    return best;
  }

  const undo = () => { setShapes((s) => s.slice(0, -1)); sfx.soft(); };
  const clear = () => { setShapes([]); setRuler(null); setSelected(null); sfx.whoosh(); };
  const del = () => { if (selected !== null) { setShapes((s) => s.filter((x) => x.id !== selected)); setSelected(null); sfx.drop(); } };

  const keys = useSceneKeys({
    ...Object.fromEntries(TOOLS.map((t) => [t.key, () => { setTool(t.id); sfx.tick(); }])),
    g: () => setMagnet((m) => !m),
    Backspace: del,
    Delete: del,
    u: undo,
    Escape: () => { setDraft(null); setSelected(null); setRuler(null); },
  });

  const renderShape = (s: { kind: Shape["kind"]; a: Pt; b: Pt; color: string }, sc: ChartScales, active: boolean, key: string | number) => {
    const ax = sc.x(s.a.i), ay = sc.y(s.a.v), bx = sc.x(s.b.i), by = sc.y(s.b.v);
    const glow = active ? { filter: `drop-shadow(0 0 7px ${s.color})` } : undefined;
    if (s.kind === "trend") {
      const dx = bx - ax, dy = by - ay;
      const ext = { x: bx + dx * 3, y: by + dy * 3 };
      return (
        <g key={key} style={glow}>
          <line x1={bx} y1={by} x2={ext.x} y2={ext.y} stroke={s.color} strokeWidth={1.2} strokeDasharray="5 5" opacity={0.5} />
          <line x1={ax} y1={ay} x2={bx} y2={by} stroke={s.color} strokeWidth={active ? 3 : 2.2} strokeLinecap="round" />
          <circle cx={ax} cy={ay} r={5} fill="#081130" stroke={s.color} strokeWidth={2.5} />
          <circle cx={bx} cy={by} r={5} fill="#081130" stroke={s.color} strokeWidth={2.5} />
        </g>
      );
    }
    if (s.kind === "hline") {
      return (
        <g key={key} style={glow}>
          <line x1={0} x2={sc.W} y1={ay} y2={ay} stroke={s.color} strokeWidth={active ? 2.6 : 1.8} />
          <rect x={6} y={ay - 10} width={70} height={20} rx={10} fill={s.color} />
          <text x={41} y={ay + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#081130">{fmtPrice(s.a.v * PRICE_SCALE)}</text>
        </g>
      );
    }
    if (s.kind === "zone") {
      return (
        <g key={key} style={glow}>
          <rect x={Math.min(ax, bx)} y={Math.min(ay, by)} width={Math.abs(bx - ax)} height={Math.abs(by - ay)} fill={s.color} opacity={0.14} stroke={s.color} strokeWidth={active ? 2.5 : 1.5} rx={4} />
          <text x={Math.min(ax, bx) + 6} y={Math.min(ay, by) + 14} fontSize={10} fontWeight={800} fill={s.color}>ZONE {fmtPrice(Math.max(s.a.v, s.b.v) * PRICE_SCALE)}–{fmtPrice(Math.min(s.a.v, s.b.v) * PRICE_SCALE)}</text>
        </g>
      );
    }
    // fib
    const hiV = s.a.v, loV = s.b.v;
    const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx) + 60;
    return (
      <g key={key} style={glow}>
        {FIBS.map((f, k) => {
          const v = hiV + (loV - hiV) * f;
          const yy = sc.y(v);
          const next = k < FIBS.length - 1 ? sc.y(hiV + (loV - hiV) * FIBS[k + 1]) : yy;
          return (
            <g key={f}>
              {k < FIBS.length - 1 && <rect x={x0} y={Math.min(yy, next)} width={x1 - x0} height={Math.abs(next - yy)} fill={s.color} opacity={f === 0.5 || f === 0.618 ? 0.14 : 0.05} />}
              <line x1={x0} x2={x1} y1={yy} y2={yy} stroke={s.color} strokeWidth={f === 0.618 ? 2 : 1.1} opacity={0.9} />
              <text x={x1 + 4} y={yy + 3} fontSize={9} fontWeight={800} fill={s.color}>{f.toFixed(3)} · {fmtPrice(v * PRICE_SCALE)}</text>
            </g>
          );
        })}
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={s.color} strokeDasharray="3 4" opacity={0.7} />
      </g>
    );
  };

  const overlay = (sc: ChartScales) => (
    <g>
      {shapes.map((s) => renderShape(s, sc, selected === s.id, s.id))}
      {draft && tool !== "ruler" && tool !== "select" && tool !== "pan" && renderShape({ kind: tool as Shape["kind"], a: draft.a, b: tool === "hline" ? { i: draft.a.i + 40, v: draft.a.v } : draft.b, color }, sc, true, "draft")}
      {ruler && (() => {
        const ax = sc.x(ruler.a.i), ay = sc.y(ruler.a.v), bx = sc.x(ruler.b.i), by = sc.y(ruler.b.v);
        const pct = ((ruler.b.v - ruler.a.v) / ruler.a.v) * 100;
        const bars = Math.round(ruler.b.i - ruler.a.i);
        const up = pct >= 0;
        const col = up ? "#2ede8a" : "#ff5470";
        return (
          <g>
            <rect x={Math.min(ax, bx)} y={Math.min(ay, by)} width={Math.abs(bx - ax)} height={Math.abs(by - ay)} fill={col} opacity={0.14} />
            <line x1={ax} y1={ay} x2={bx} y2={by} stroke={col} strokeWidth={2} strokeDasharray="6 4" />
            <rect x={(ax + bx) / 2 - 62} y={Math.min(ay, by) - 30} width={124} height={24} rx={8} fill={col} />
            <text x={(ax + bx) / 2} y={Math.min(ay, by) - 14} textAnchor="middle" fontSize={11} fontWeight={800} fill="#081130">
              {up ? "+" : ""}{pct.toFixed(2)}% · {bars} bars
            </text>
          </g>
        );
      })()}
    </g>
  );

  const sel = shapes.find((s) => s.id === selected);
  const cursor = tool === "pan" ? undefined : tool === "select" ? "default" : "crosshair";

  return (
    <ShowcaseSection
      id="drawing" index="58" kicker="Drawing Studio" title="Студия разметки графика"
      desc="Рисуй трендовые, горизонтали, Фибоначчи, зоны и измеряй движение линейкой. Разметка привязана к цене и времени — зумь колесом и двигай график, фигуры остаются на своих местах."
      accent="#8ef23c" variant="grid"
      keys={[
        { k: "T L F Z", d: "инструменты" }, { k: "M", d: "линейка" }, { k: "V", d: "выбор" }, { k: "H", d: "pan" },
        { k: "G", d: "магнит" }, { k: "U", d: "undo" }, { k: "Del", d: "удалить" },
      ]}
      moment="Запоминающийся момент: зумишь в 6× — сетка Фибоначчи растягивается и остаётся приклеенной к свечам"
      tags={<div className="flex gap-2"><Tag tone="green">{shapes.length} drawings</Tag><Tag tone={magnet ? "gold" : "ghost"}>{magnet ? "magnet on" : "free"}</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="panel-inset flex gap-1 p-1">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id} onClick={() => { setTool(t.id); sfx.tick(); }}
                  className={cn("relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold transition", tool === t.id ? "text-[#0a2210]" : "text-[#8ea6d8] hover:text-white")}
                  title={`${t.label} (${t.key.toUpperCase()})`}
                >
                  {tool === t.id && <motion.span layoutId="draw-tool" className="absolute inset-0 rounded-lg bg-[#8ef23c]" style={{ boxShadow: "0 3px 0 #3a7d0d" }} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  <Icon size={13} className="relative" />
                  <span className="relative hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button key={c} onClick={() => { setColor(c); if (sel) setShapes((s) => s.map((x) => (x.id === sel.id ? { ...x, color: c } : x))); sfx.tick(); }}
                className="h-7 w-7 rounded-lg border-2 transition" style={{ background: c, borderColor: color === c ? "#fff" : "transparent", boxShadow: color === c ? `0 0 12px ${c}` : undefined }} />
            ))}
          </div>
          <button onClick={() => { setMagnet((m) => !m); sfx.tick(); }} className={cn("btn3d px-3 py-2 text-[10px]", magnet ? "btn3d-gold" : "btn3d-ghost")}><Magnet size={13} /> Magnet</button>
          <div className="ml-auto flex gap-1.5">
            <button onClick={undo} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><Undo2 size={13} /> Undo</button>
            <button onClick={clear} className="btn3d btn3d-short px-3 py-2 text-[10px]"><Trash2 size={13} /> Clear</button>
            <button onClick={() => { setSeed((s) => s + 1); clear(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">New chart</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <ScenePanel title="BTC/USDT · 1H · annotate" sub={tool === "pan" ? "Pan mode: drag & wheel" : "Рисуй прямо на графике · wheel продолжает зумить"} accent="#8ef23c">
            <ZoomChart
              candles={candles} height={340} accent="#8ef23c" initialSpan={110} priceScale={PRICE_SCALE}
              panEnabled={tool === "pan"} onPointer={onPointer} magnet={magnet} overlay={overlay} cursor={cursor}
            />
          </ScenePanel>

          <div className="space-y-4">
            <ScenePanel title="Layers" sub="Клик — выбрать" accent="#5b8cff">
              <div className="max-h-[210px] space-y-1.5 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {shapes.length === 0 && <p className="py-5 text-center text-[11px] text-[#54678f]">Нарисуй первую фигуру на графике</p>}
                  {[...shapes].reverse().map((s) => (
                    <motion.button
                      key={s.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      onClick={() => { setSelected(s.id); setTool("select"); sfx.tick(); }}
                      className={cn("flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left", selected === s.id ? "border-white/40 bg-white/10" : "border-white/8 bg-black/25")}
                    >
                      <span className="h-3 w-3 rounded" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                      <span className="text-[11px] font-extrabold uppercase text-white">{s.kind}</span>
                      <span className="num-mono ml-auto text-[10px] text-[#8ea6d8]">{fmtPrice(s.a.v * PRICE_SCALE)}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </ScenePanel>
            <ScenePanel title="Inspector" sub={sel ? `#${sel.id} · ${sel.kind}` : ruler ? "Measure" : "—"} accent={sel?.color ?? "#ffc531"}>
              {sel ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <SceneStat label="From" value={fmtPrice(sel.a.v * PRICE_SCALE)} color="#fff" />
                    <SceneStat label="To" value={fmtPrice(sel.b.v * PRICE_SCALE)} color="#fff" />
                    <SceneStat label="Δ %" value={`${(((sel.b.v - sel.a.v) / sel.a.v) * 100).toFixed(2)}%`} color={sel.b.v >= sel.a.v ? "#2ede8a" : "#ff5470"} />
                    <SceneStat label="Bars" value={`${Math.round(Math.abs(sel.b.i - sel.a.i))}`} color="#9db9ff" />
                  </div>
                  <button onClick={del} className="btn3d btn3d-short w-full py-2 text-[10px]"><Trash2 size={12} /> Delete</button>
                </div>
              ) : ruler ? (
                <div className="grid grid-cols-2 gap-2">
                  <SceneStat label="Move" value={`${(((ruler.b.v - ruler.a.v) / ruler.a.v) * 100).toFixed(2)}%`} color={ruler.b.v >= ruler.a.v ? "#2ede8a" : "#ff5470"} />
                  <SceneStat label="Bars" value={`${Math.round(ruler.b.i - ruler.a.i)}`} color="#fff" />
                </div>
              ) : (
                <p className="py-4 text-center text-[11px] text-[#7d92c4]">Выбери фигуру инструментом Select или в списке слоёв</p>
              )}
            </ScenePanel>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
