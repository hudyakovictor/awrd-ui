/* 28 · INDICATORS LAB v2 — one synced instrument.
   Overlays + volume + RSI + MACD share a single crosshair and pinned reading. */
import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { bollinger, ema, genOHLC, macd, rsi, sma } from "../game/engines";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

export default function IndicatorsLab() {
  const [seed, setSeed] = useState(7);
  const [layers, setLayers] = useState({ sma: true, ema: true, bb: true, vol: true, rsi: true, macd: true });
  const [smaP, setSmaP] = useState(20);
  const [emaP, setEmaP] = useState(9);
  const [hover, setHover] = useState<number | null>(null);
  const [pin, setPin] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const candles = useMemo(() => genOHLC(96, 100, seed, 1.8), [seed]);
  const closes = candles.map((c) => c.c);
  const sLine = useMemo(() => sma(closes, smaP), [closes, smaP]);
  const eLine = useMemo(() => ema(closes, emaP), [closes, emaP]);
  const bb = useMemo(() => bollinger(closes, 20, 2), [closes]);
  const r = useMemo(() => rsi(closes, 14), [closes]);
  const m = useMemo(() => macd(closes), [closes]);

  const W = 680, H = 230, SUB = 84;
  const min = Math.min(...candles.map((c) => c.l));
  const max = Math.max(...candles.map((c) => c.h));
  const mv = Math.max(...candles.map((c) => c.v));
  const x = (i: number) => (i / (candles.length - 1)) * W;
  const y = (v: number) => 10 + (1 - (v - min) / (max - min || 1)) * (H - 52);
  const bw = W / candles.length;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const idx = Math.round(((e.clientX - rect.left) / rect.width) * (candles.length - 1));
    setHover(Math.max(0, Math.min(candles.length - 1, idx)));
  };
  const active = pin ?? hover;
  const c = active !== null ? candles[active] : null;

  const overlayPath = (arr: (number | null)[]) => {
    let d = "";
    arr.forEach((v, i) => {
      if (v == null) return;
      d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    });
    return d;
  };

  void m;

  const toggle = (k: keyof typeof layers) => {
    setLayers((s) => ({ ...s, [k]: !s[k] }));
    sfx.tick();
  };

  const overbought = active !== null && r[active] != null && (r[active] as number) > 70;
  const oversold = active !== null && r[active] != null && (r[active] as number) < 30;

  return (
    <ShowcaseSection
      id="indicators" index="28" kicker="Indicators Lab · v2" title="Один курсор — четыре панели"
      desc="Включай SMA, EMA, Bollinger, объём, RSI и MACD: график перестраивается мгновенно. Наведи или закрепи точку — значения и подсветка двигаются синхронно."
      accent="#a78bff"
      variant="scan"
      moment="Запоминающийся момент: один курсор синхронно ведёт четыре панели индикаторов"
      keys={[{ k: "1–6", d: "слои" }, { k: "N", d: "reseed" }, { k: "Esc", d: "unpin" }]}
      hotkeys={{
        "1": () => toggle("sma"), "2": () => toggle("ema"), "3": () => toggle("bb"), "4": () => toggle("vol"), "5": () => toggle("rsi"), "6": () => toggle("macd"),
        n: () => setSeed((s) => s + 1), Escape: () => setPin(null),
      }}
      tags={<div className="flex gap-2"><Tag tone="violet">synced crosshair</Tag><Tag tone="ghost">seed {seed}</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(layers) as (keyof typeof layers)[]).map((k) => (
          <button
            key={k}
            onClick={() => toggle(k)}
            className={cn(
              "rounded-xl border px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wider transition",
              layers[k] ? "border-[#a78bff]/50 bg-[#a78bff]/15 text-[#d5c6ff]" : "border-white/10 bg-black/25 text-[#54678f]",
            )}
          >
            {k}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            SMA <input type="range" min={5} max={40} value={smaP} onChange={(e) => setSmaP(+e.target.value)} className="lever w-24" style={{ ["--fill" as string]: `${((smaP - 5) / 35) * 100}%` }} />
            <span className="num-mono text-white">{smaP}</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
            EMA <input type="range" min={5} max={30} value={emaP} onChange={(e) => setEmaP(+e.target.value)} className="lever w-24" style={{ ["--fill" as string]: `${((emaP - 5) / 25) * 100}%` }} />
            <span className="num-mono text-white">{emaP}</span>
          </label>
          <button onClick={() => { setSeed((s) => s + 1); setPin(null); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3.5 py-2 text-[10px]">Reseed</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
        <div ref={wrapRef} className="space-y-3">
          <ScenePanel title="Price · overlays · volume" sub="Клик — закрепить точку · повторный клик — снять" accent="#ffc531"
            right={active !== null && c ? <span className="num-mono text-xs font-extrabold text-white">#{active} · O{c.o.toFixed(1)} H{c.h.toFixed(1)} L{c.l.toFixed(1)} C{c.c.toFixed(1)}</span> : undefined}
          >
            <div className={cn("panel-inset relative overflow-hidden p-2 transition-shadow", overbought && "shadow-[0_0_50px_rgba(255,84,112,.25)]", oversold && "shadow-[0_0_50px_rgba(46,222,138,.25)]")}>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full cursor-crosshair" onMouseMove={onMove} onMouseLeave={() => setHover(null)}
                onClick={() => { setPin((p) => (p === hover ? null : hover)); sfx.pop(); }}>
                {candles.map((cc, i) => {
                  const up = cc.c >= cc.o;
                  const col = up ? "#2ede8a" : "#ff5470";
                  const dim = active === null || Math.abs(i - (active ?? 0)) > 14 ? 0.55 : 1;
                  return (
                    <g key={i} opacity={dim}>
                      {layers.vol && <rect x={x(i) - bw * 0.3} y={H - 10 - (cc.v / mv) * 26} width={bw * 0.6} height={(cc.v / mv) * 26} fill={col} opacity={0.35} rx={1} />}
                      <line x1={x(i)} x2={x(i)} y1={y(cc.h)} y2={y(cc.l)} stroke={col} strokeWidth={1.2} />
                      <rect x={x(i) - bw * 0.28} y={y(Math.max(cc.o, cc.c))} width={bw * 0.56} height={Math.max(1.5, Math.abs(y(cc.o) - y(cc.c)))} fill={col} rx={1} />
                    </g>
                  );
                })}
                {layers.bb && (
                  <>
                    <motion.path d={overlayPath(bb.upper)} fill="none" stroke="#5b8cff" strokeWidth={1.2} opacity={0.75} initial={false} animate={{ opacity: 0.75 }} />
                    <motion.path d={overlayPath(bb.lower)} fill="none" stroke="#5b8cff" strokeWidth={1.2} opacity={0.75} initial={false} />
                  </>
                )}
                {layers.sma && <motion.path d={overlayPath(sLine)} fill="none" stroke="#ffc531" strokeWidth={2} initial={false} />}
                {layers.ema && <motion.path d={overlayPath(eLine)} fill="none" stroke="#ff8b3d" strokeWidth={2} initial={false} />}
                {active !== null && (
                  <g>
                    <rect x={Math.max(0, x(active) - bw * 4)} width={bw * 8} y={0} height={H} fill="#a78bff" opacity={0.08} rx={6} />
                    <line x1={x(active)} x2={x(active)} y1={0} y2={H} stroke="#c9b6ff" strokeDasharray="4 4" strokeWidth={1.2} />
                    <circle cx={x(active)} cy={y(candles[active].c)} r={5} fill="#fff" stroke="#a78bff" strokeWidth={2.5} />
                  </g>
                )}
              </svg>
            </div>
          </ScenePanel>

          {layers.rsi && (
            <ScenePanel title="RSI · 14" sub="Зоны 30 / 70 подсвечивают главный график" accent="#a78bff"
              right={active !== null && r[active] != null ? <span className={cn("num-mono text-sm font-extrabold", (r[active] as number) > 70 ? "text-[#ff5470]" : (r[active] as number) < 30 ? "text-[#2ede8a]" : "text-white")}>{(r[active] as number).toFixed(1)}</span> : undefined}
            >
              <svg viewBox={`0 0 ${W} ${SUB}`} className="w-full cursor-crosshair" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
                <rect x={0} y={0} width={W} height={SUB * 0.3} fill="#ff5470" opacity={0.07} />
                <rect x={0} y={SUB * 0.7} width={W} height={SUB * 0.3} fill="#2ede8a" opacity={0.07} />
                <line x1={0} x2={W} y1={SUB * 0.3} y2={SUB * 0.3} stroke="#ff5470" strokeDasharray="4 3" opacity={0.5} />
                <line x1={0} x2={W} y1={SUB * 0.7} y2={SUB * 0.7} stroke="#2ede8a" strokeDasharray="4 3" opacity={0.5} />
                <path d={r.map((v, i) => (v == null ? "" : `${i && r[i - 1] != null ? "L" : "M"}${x(i).toFixed(1)},${(SUB - (v / 100) * SUB).toFixed(1)}`)).join(" ")} fill="none" stroke="#a78bff" strokeWidth={2.2} strokeLinejoin="round" />
                {active !== null && r[active] != null && (
                  <g>
                    <line x1={x(active)} x2={x(active)} y1={0} y2={SUB} stroke="#c9b6ff" strokeDasharray="4 4" />
                    <circle cx={x(active)} cy={SUB - ((r[active] as number) / 100) * SUB} r={4.5} fill="#fff" stroke="#a78bff" strokeWidth={2.5} />
                  </g>
                )}
              </svg>
            </ScenePanel>
          )}

          {layers.macd && (
            <ScenePanel title="MACD · 12/26/9" sub="Гистограмма + сигнальная" accent="#5b8cff">
              <svg viewBox={`0 0 ${W} ${SUB}`} className="w-full cursor-crosshair" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
                <line x1={0} x2={W} y1={SUB / 2} y2={SUB / 2} stroke="rgba(255,255,255,.15)" />
                {m.hist.map((v, i) => {
                  if (v == null) return null;
                  const h = Math.min(SUB / 2 - 4, Math.abs(v) * 3);
                  return <rect key={i} x={x(i) - bw * 0.3} y={v > 0 ? SUB / 2 - h : SUB / 2} width={bw * 0.6} height={h} rx={1} fill={v > 0 ? "#2ede8a" : "#ff5470"} opacity={active === i ? 1 : 0.6} />;
                })}
                <path d={m.line.map((v, i) => (v == null ? "" : `${i && m.line[i - 1] != null ? "L" : "M"}${x(i).toFixed(1)},${(SUB / 2 - v * 3).toFixed(1)}`)).join(" ")} fill="none" stroke="#5b8cff" strokeWidth={1.6} />
                <path d={m.signal.map((v, i) => (v == null ? "" : `${i && m.signal[i - 1] != null ? "L" : "M"}${x(i).toFixed(1)},${(SUB / 2 - v * 3).toFixed(1)}`)).join(" ")} fill="none" stroke="#ffc531" strokeWidth={1.6} />
                {active !== null && <line x1={x(active)} x2={x(active)} y1={0} y2={SUB} stroke="#c9b6ff" strokeDasharray="4 4" />}
              </svg>
            </ScenePanel>
          )}
        </div>

        <div className="space-y-3">
          <ScenePanel title="Inspector" sub={pin !== null ? "Точка закреплена" : "Наведи на график"} accent="#8ef23c">
            {active !== null && c ? (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <SceneStat label="Close" value={c.c.toFixed(2)} color="#fff" />
                  <SceneStat label="Volume" value={c.v.toFixed(0)} color="#9db9ff" />
                  <SceneStat label={`SMA ${smaP}`} value={sLine[active]?.toFixed(2) ?? "—"} color="#ffc531" />
                  <SceneStat label={`EMA ${emaP}`} value={eLine[active]?.toFixed(2) ?? "—"} color="#ff8b3d" />
                  <SceneStat label="BB up" value={bb.upper[active]?.toFixed(2) ?? "—"} color="#5b8cff" />
                  <SceneStat label="BB low" value={bb.lower[active]?.toFixed(2) ?? "—"} color="#5b8cff" />
                  <SceneStat label="RSI" value={r[active]?.toFixed(1) ?? "—"} color={overbought ? "#ff5470" : oversold ? "#2ede8a" : "#c9b6ff"} />
                  <SceneStat label="MACD" value={m.line[active]?.toFixed(3) ?? "—"} color="#fff" />
                </div>
                <div className={cn("rounded-2xl border p-3 text-xs font-bold", overbought ? "border-[#ff5470]/40 bg-[#ff5470]/10 text-[#ff8ba0]" : oversold ? "border-[#2ede8a]/40 bg-[#2ede8a]/10 text-[#5ff5a8]" : "border-white/10 bg-black/25 text-[#aebde6]")}>
                  {overbought ? "RSI в перекупленности — волатильность расширена, жди охлаждение." : oversold ? "RSI в перепроданности — давление продавцов истощается." : "Нейтральная зона. Смотри пересечения MA и MACD."}
                </div>
                {pin !== null && <button onClick={() => setPin(null)} className="btn3d btn3d-ghost w-full py-2.5 text-[10px]">Unpin</button>}
              </div>
            ) : (
              <p className="py-8 text-center text-xs text-[#7d92c4]">Наведи курсор на любую панель — все графики ответят вместе</p>
            )}
          </ScenePanel>
          <ScenePanel title="Signal" sub="Композит индикаторов" accent="#ffc531">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#8ea6d8]">Bias meter</span>
              <span className={cn("text-xs font-extrabold", overbought ? "text-[#ff5470]" : oversold ? "text-[#2ede8a]" : "text-[#ffc531]")}>
                {overbought ? "BEARISH" : oversold ? "BULLISH" : "NEUTRAL"}
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/50">
              <motion.div
                className="h-full rounded-full"
                animate={{
                  width: overbought ? "82%" : oversold ? "82%" : "50%",
                  x: overbought ? 0 : oversold ? 0 : 0,
                  backgroundColor: overbought ? "#ff5470" : oversold ? "#2ede8a" : "#ffc531",
                }}
                style={{ marginLeft: overbought ? "auto" : 0 }}
              />
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
