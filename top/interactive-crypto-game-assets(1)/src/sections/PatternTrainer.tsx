/* 18 · PATTERN TRAINER v2 — one chart workbench.
   Select candles × brush zone × draw trendline × pick pattern × score. */
import { motion } from "framer-motion";
import { Brush, Check, MousePointerClick, PenLine, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { candlesRange, genCandles } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Tool = "select" | "brush" | "line";
const PATTERNS = ["Double Bottom", "Head & Shoulders", "Bull Flag", "Rising Wedge"] as const;

export default function PatternTrainer({ onXp }: { onXp: (n: number) => void }) {
  const [seed, setSeed] = useState(21);
  const [tool, setTool] = useState<Tool>("select");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [brush, setBrush] = useState<{ a: number; b: number } | null>(null);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [guess, setGuess] = useState<(typeof PATTERNS)[number] | null>(null);
  const [result, setResult] = useState<{ score: number; verdict: string } | null>(null);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef<{ x: number; idx: number } | null>(null);

  const candles = useMemo(() => genCandles(seed, 48, 100, "range", 3_600_000), [seed]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);
  const W = 680, H = 260, pad = 14;
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2);
  const bw = W / candles.length;
  const x = (i: number) => i * bw + bw / 2;

  const toSvg = (clientX: number, clientY: number) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0, idx: 0 };
    const sx = ((clientX - r.left) / r.width) * W;
    const sy = ((clientY - r.top) / r.height) * H;
    return { x: sx, y: sy, idx: Math.max(0, Math.min(candles.length - 1, Math.floor(sx / bw))) };
  };

  const onDown = (e: React.PointerEvent) => {
    const p = toSvg(e.clientX, e.clientY);
    if (tool === "select") {
      setSelected((prev) => {
        const n = new Set(prev);
        if (n.has(p.idx)) n.delete(p.idx); else n.add(p.idx);
        return n;
      });
      sfx.tick();
      setResult(null);
    } else {
      dragStart.current = p;
      setDragging(true);
      if (tool === "brush") setBrush({ a: p.idx, b: p.idx });
      if (tool === "line") setLine({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
    }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return;
    const p = toSvg(e.clientX, e.clientY);
    if (tool === "brush") setBrush({ a: dragStart.current.idx, b: p.idx });
    if (tool === "line") setLine((l) => (l ? { ...l, x2: p.x, y2: p.y } : l));
  };
  const onUp = () => {
    setDragging(false);
    dragStart.current = null;
    if (tool !== "select") sfx.soft();
    setResult(null);
  };

  const brushRange = brush ? [Math.min(brush.a, brush.b), Math.max(brush.a, brush.b)] as const : null;

  const check = () => {
    // scoring: selection coverage of lows + brush width + line slope + guess
    const lows = candles
      .map((c, i) => ({ i, l: c.l }))
      .sort((a, b) => a.l - b.l)
      .slice(0, 4)
      .map((d) => d.i);
    const selHit = lows.filter((i) => selected.has(i)).length;
    const brushScore = brushRange ? Math.min(30, (brushRange[1] - brushRange[0] + 1) * 5) : 0;
    let lineScore = 0;
    if (line && Math.abs(line.x2 - line.x1) > 60) {
      const slope = (line.y2 - line.y1) / (line.x2 - line.x1);
      lineScore = slope > -0.15 && slope < 0.35 ? 30 : 12;
    }
    const guessScore = guess === "Double Bottom" ? 25 : guess ? 8 : 0;
    const score = Math.min(100, selHit * 6 + brushScore + lineScore + guessScore);
    const verdict = score >= 80 ? "Чистый сетап: зона, линия и паттерн совпали." : score >= 50 ? "Есть структура, но добей выбор свечей и линию." : "Пока шум: выдели минимумы и проведи опору.";
    setResult({ score, verdict });
    if (score >= 60) {
      sfx.success();
      onXp(20);
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 }, colors: ["#8ef23c", "#fff", "#5b8cff"] });
    } else {
      sfx.error();
    }
  };

  const reset = () => {
    setSelected(new Set());
    setBrush(null);
    setLine(null);
    setGuess(null);
    setResult(null);
    sfx.whoosh();
  };

  return (
    <ShowcaseSection
      id="trainer" index="18" kicker="Pattern Trainer · v2" title="Верстак паттернов"
      desc="Одна сцена: кликай свечи, тяни кисть по зоне, рисуй трендовую линию и выбирай паттерн. Проверка оценивает всё вместе — как настоящий сетап."
      accent="#ffc531"
      tags={<div className="flex gap-2"><Tag tone="gold">{selected.size} candles</Tag><Tag tone="blue">{brushRange ? `${brushRange[1] - brushRange[0] + 1} in zone` : "no zone"}</Tag></div>}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <ScenePanel
          title="Double Bottom · workbench" sub="Инструмент → действие на графике" accent="#ffc531"
          right={
            <div className="flex gap-1.5">
              <button onClick={() => { setSeed((s) => s + 1); reset(); }} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]"><RotateCcw size={12} /> New chart</button>
            </div>
          }
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <Seg options={["select", "brush", "line"] as const} value={tool} onChange={setTool} accent="#ffc531" />
            <span className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#7d92c4]">
              {tool === "select" && <><MousePointerClick size={12} /> клик — выбрать свечу</>}
              {tool === "brush" && <><Brush size={12} /> тяни — зона</>}
              {tool === "line" && <><PenLine size={12} /> тяни — трендовая</>}
            </span>
          </div>
          <div className="panel-inset relative overflow-hidden p-2">
            <svg
              ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full cursor-crosshair touch-none select-none"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
            >
              {brushRange && (
                <motion.rect
                  x={brushRange[0] * bw} y={0} width={(brushRange[1] - brushRange[0] + 1) * bw} height={H}
                  fill="#5b8cff" opacity={0.14} rx={8} initial={false}
                />
              )}
              {candles.map((c, i) => {
                const up = c.c >= c.o;
                const col = up ? "#2ede8a" : "#ff5470";
                const sel = selected.has(i);
                const inBrush = brushRange && i >= brushRange[0] && i <= brushRange[1];
                return (
                  <g key={i} opacity={brushRange && !inBrush && !sel ? 0.45 : 1}>
                    <line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={sel ? "#ffc531" : col} strokeWidth={sel ? 2.4 : 1.5} />
                    <rect
                      x={x(i) - bw * 0.3} y={y(Math.max(c.o, c.c))} width={bw * 0.6}
                      height={Math.max(2.5, Math.abs(y(c.o) - y(c.c)))} rx={2}
                      fill={sel ? "#ffc531" : col}
                      style={sel ? { filter: "drop-shadow(0 0 7px #ffc531)" } : undefined}
                    />
                    {sel && <circle cx={x(i)} cy={y(c.l) + 10} r={3} fill="#ffc531" />}
                  </g>
                );
              })}
              {line && (
                <g>
                  <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#8ef23c" strokeWidth={2.6} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px #8ef23c)" }} />
                  <circle cx={line.x1} cy={line.y1} r={6} fill="#fff" stroke="#8ef23c" strokeWidth={3} />
                  <circle cx={line.x2} cy={line.y2} r={6} fill="#fff" stroke="#8ef23c" strokeWidth={3} />
                </g>
              )}
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PATTERNS.map((p) => (
              <button
                key={p}
                onClick={() => { setGuess(p); setResult(null); sfx.tick(); }}
                className={cn(
                  "rounded-2xl border px-3 py-2.5 text-[11px] font-extrabold transition",
                  guess === p ? "border-[#8ef23c] bg-[#8ef23c]/15 text-[#a4ff5e]" : "border-white/10 bg-black/25 text-white hover:border-white/25",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={check} className="btn3d btn3d-gold mt-3 w-full py-4 text-sm"><Check size={16} strokeWidth={3} /> Проверить сетап</button>
        </ScenePanel>

        <div className="space-y-3">
          <ScenePanel title="Score" sub="Live components" accent="#8ef23c">
            <div className="grid grid-cols-3 gap-2">
              <SceneStat label="Select" value={`${selected.size}`} sub="candles" color="#ffc531" />
              <SceneStat label="Zone" value={brushRange ? `${brushRange[1] - brushRange[0] + 1}` : "0"} sub="bars" color="#5b8cff" />
              <SceneStat label="Line" value={line ? "✓" : "—"} sub="trend" color="#8ef23c" />
            </div>
            <div className="relative mx-auto mt-4 h-28 w-28">
              <svg viewBox="0 0 56 56" className="-rotate-90">
                <circle cx={28} cy={28} r={23} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth={6} />
                <motion.circle
                  cx={28} cy={28} r={23} fill="none" stroke={result && result.score >= 60 ? "#8ef23c" : "#ffc531"}
                  strokeWidth={6} strokeLinecap="round" strokeDasharray={145}
                  initial={false} animate={{ strokeDashoffset: 145 - (145 * (result?.score ?? 0)) / 100 }} transition={{ duration: 0.8 }}
                />
              </svg>
              <span className="num-mono absolute inset-0 flex items-center justify-center text-xl font-extrabold text-white">{result?.score ?? 0}</span>
            </div>
            <p className="mt-3 min-h-[40px] text-center text-xs font-bold text-[#aebde6]">{result ? result.verdict : "Собери минимум: 2+ свечи, зону и линию."}</p>
          </ScenePanel>
          <ScenePanel title="Checklist" sub="Что смотрит механика" accent="#5b8cff">
            <ul className="space-y-2 text-[11px] font-bold text-[#aebde6]">
              <li className={cn("flex gap-2", selected.size >= 2 && "text-[#a4ff5e]")}><span>{selected.size >= 2 ? "✓" : "○"}</span> Выбраны свечи-минимумы</li>
              <li className={cn("flex gap-2", brushRange && "text-[#a4ff5e]")}><span>{brushRange ? "✓" : "○"}</span> Зона покрывает формацию</li>
              <li className={cn("flex gap-2", line && "text-[#a4ff5e]")}><span>{line ? "✓" : "○"}</span> Линия идёт по опоре</li>
              <li className={cn("flex gap-2", guess && "text-[#a4ff5e]")}><span>{guess ? "✓" : "○"}</span> Паттерн назван</li>
            </ul>
            <button onClick={reset} className="btn3d btn3d-ghost mt-3 w-full py-2.5 text-[10px]">Reset workbench</button>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
