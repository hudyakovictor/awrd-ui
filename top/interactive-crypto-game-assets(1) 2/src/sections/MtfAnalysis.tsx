/* 38 · MULTI-TIMEFRAME ANALYSIS — four synced charts, one time.
   Brush on any chart → matching period glows on the rest. */
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, Seg } from "../showcase/Scene";
import { candlesRange, genCandles, pctChange } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const TFS = [
  { id: "M5", n: 96, color: "#5b8cff" },
  { id: "M15", n: 72, color: "#8ef23c" },
  { id: "H1", n: 56, color: "#ffc531" },
  { id: "H4", n: 40, color: "#ff5470" },
] as const;

export default function MtfAnalysis() {
  const [seed, setSeed] = useState(31);
  const [sel, setSel] = useState<{ a: number; b: number } | null>({ a: 0.55, b: 0.78 });
  const [hoverT, setHoverT] = useState<number | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const [layout, setLayout] = useState<"grid" | "stack">("grid");
  const dragId = useRef<string | null>(null);

  const series = useMemo(() => {
    return TFS.map((t, k) => {
      const cs = genCandles(seed + k * 131, t.n, 100, k < 2 ? "volatile" : "trend", 60_000 * (k + 1));
      return { ...t, candles: cs };
    });
  }, [seed]);

  const visible = series.filter((s) => !hidden.includes(s.id));
  const ordered = focus ? [...visible.filter((s) => s.id === focus), ...visible.filter((s) => s.id !== focus)] : visible;

  const tToIdx = (t: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor(t * n)));

  const onDown = (id: string, clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    dragId.current = id;
    setSel({ a: t, b: t });
  };
  const onMove = (clientX: number, el: SVGSVGElement) => {
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setHoverT(t);
    if (dragId.current) setSel((s) => (s ? { a: s.a, b: t } : null));
  };
  const onUp = () => {
    if (dragId.current) sfx.soft();
    dragId.current = null;
    setSel((s) => {
      if (!s) return s;
      if (Math.abs(s.b - s.a) < 0.02) return { a: Math.max(0, s.a - 0.02), b: Math.min(1, s.a + 0.02) };
      return { a: Math.min(s.a, s.b), b: Math.max(s.a, s.b) };
    });
  };

  const range = sel ? [Math.min(sel.a, sel.b), Math.max(sel.a, sel.b)] as const : null;

  return (
    <ShowcaseSection
      id="mtf" index="38" kicker="Multi-Timeframe" title="Четыре графика — одно время"
      desc="Тяни область на любом таймфрейме: соответствующий период подсветится на остальных. Прячь панели, раскрывай фокус, меняй компоновку."
      accent="#5b8cff"
      tags={<div className="flex gap-2"><Tag tone="blue">synced brush</Tag><Tag tone="ghost">{visible.length}/4 visible</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {TFS.map((t) => (
            <button
              key={t.id} onClick={() => { setHidden((h) => (h.includes(t.id) ? h.filter((x) => x !== t.id) : [...h, t.id])); sfx.tick(); }}
              className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", hidden.includes(t.id) ? "bg-white/5 text-[#54678f]" : "text-[#081130]")}
              style={hidden.includes(t.id) ? undefined : { background: t.color }}
            >{t.id}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Seg options={["grid", "stack"] as const} value={layout} onChange={setLayout} accent="#5b8cff" />
          <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]">New market</button>
        </div>
      </div>

      {range && (
        <div className="mb-3 flex flex-wrap gap-2">
          {series.filter((s) => !hidden.includes(s.id)).map((s) => {
            const i0 = tToIdx(range[0], s.candles.length);
            const i1 = tToIdx(range[1], s.candles.length);
            const chg = pctChange(s.candles[i0].o, s.candles[i1].c);
            return (
              <span key={s.id} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-extrabold">
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[#8ea6d8]">{s.id}</span>
                <span className={chg >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]"}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span>
              </span>
            );
          })}
        </div>
      )}

      <div className={cn("grid gap-4", layout === "grid" ? "md:grid-cols-2" : "grid-cols-1", focus && layout === "grid" ? "lg:grid-cols-[1.5fr_1fr]" : "")}>
        {ordered.map((s, order) => {
          const { min, max } = candlesRange(s.candles);
          const W = 560, H = focus === s.id ? 240 : 168;
          const y = (v: number) => 8 + (1 - (v - min) / (max - min || 1)) * (H - 16);
          const bw = W / s.candles.length;
          const isFocus = focus === s.id;
          const showIdx = isFocus || order === 0 || layout === "stack" ? true : order < 4;
          if (!showIdx) return null;
          return (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <ScenePanel
                title={`${s.id} · BTC/USD`} sub={`${s.candles.length} bars`} accent={s.color}
                className={cn(isFocus && "ring-2", layout === "grid" && isFocus && "md:col-span-1")}
                right={
                  <button onClick={() => { setFocus((f) => (f === s.id ? null : s.id)); sfx.pop(); }} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]">
                    {isFocus ? "Unfocus" : "Focus"}
                  </button>
                }
              >
                <div className="panel-inset overflow-hidden p-1.5">
                  <svg
                    viewBox={`0 0 ${W} ${H}`} className="w-full cursor-ew-resize touch-none select-none"
                    onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); onDown(s.id, e.clientX, e.currentTarget); }}
                    onPointerMove={(e) => onMove(e.clientX, e.currentTarget)}
                    onPointerUp={onUp} onPointerLeave={() => { setHoverT(null); if (dragId.current) onUp(); }}
                  >
                    {range && <rect x={range[0] * W} y={0} width={(range[1] - range[0]) * W} height={H} fill={s.color} opacity={0.13} rx={6} />}
                    {s.candles.map((c, i) => {
                      const up = c.c >= c.o;
                      const col = up ? "#2ede8a" : "#ff5470";
                      const t = i / s.candles.length;
                      const inSel = range && t >= range[0] && t <= range[1];
                      return (
                        <g key={i} opacity={range && !inSel ? 0.4 : 1}>
                          <line x1={i * bw + bw / 2} x2={i * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={inSel ? "#fff" : col} strokeWidth={inSel ? 2 : 1.1} />
                          <rect x={i * bw + bw * 0.22} y={y(Math.max(c.o, c.c))} width={bw * 0.56} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} rx={1.2} fill={inSel ? s.color : col}
                            style={inSel ? { filter: `drop-shadow(0 0 6px ${s.color})` } : undefined} />
                        </g>
                      );
                    })}
                    {hoverT !== null && <line x1={hoverT * W} x2={hoverT * W} y1={0} y2={H} stroke="#fff" strokeWidth={1} strokeDasharray="4 4" opacity={0.7} />}
                    {range && (
                      <>
                        <line x1={range[0] * W} x2={range[0] * W} y1={0} y2={H} stroke={s.color} strokeWidth={2} />
                        <line x1={range[1] * W} x2={range[1] * W} y1={0} y2={H} stroke={s.color} strokeWidth={2} />
                      </>
                    )}
                  </svg>
                </div>
              </ScenePanel>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[11px] text-[#7d92c4]">Запоминающийся момент: одна кисть движется сразу по четырём масштабам времени</p>
    </ShowcaseSection>
  );
}
