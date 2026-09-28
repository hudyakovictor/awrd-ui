/* 42 · NEWS IMPACT TIMELINE — events pinned to price action.
   Scrub the timeline → chart flies to the moment, card morphs, reaction glows. */
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel } from "../showcase/Scene";
import { candlesRange, genCandles, pctChange } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const EVENTS = [
  { t: 0.08, tag: "ETF", title: "ETF inflow streak — day 3", body: "Спотовые ETF докупают четвёртую сессию подряд. Продавцы отступают от VWAP.", impact: 2 },
  { t: 0.2, tag: "Macro", title: "CPI ниже ожиданий", body: "Инфляция остывает. Риск-аппетит возвращается, доллар слабеет.", impact: 3 },
  { t: 0.34, tag: "Whale", title: "Кит перевёл 12 000 ETH", body: "Крупный перевод на биржу. Рынок замирает в ожидании давления.", impact: -2 },
  { t: 0.47, tag: "Funding", title: "Фандинг перегрет", body: "Ставка +0.08% три печати подряд. Лонги толпятся у хая.", impact: -1 },
  { t: 0.6, tag: "Upgrade", title: "Апгрейд сети принят", body: "Голосование прошло. Разработчики подтверждают дату активации.", impact: 2 },
  { t: 0.74, tag: "Hack", title: "Взлом моста · $40M", body: "Эксплойт кросс-чейн моста. Альты проливают, BTC держится.", impact: -3 },
  { t: 0.88, tag: "ETF", title: "Рекордный приток недели", body: "Недельный inflow бьёт рекорд. Пробой локального максимума.", impact: 3 },
];

export default function NewsTimeline() {
  const [seed] = useState(77);
  const [pos, setPos] = useState(0.34);
  const [sel, setSel] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [compare, setCompare] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  const candles = useMemo(() => genCandles(seed, 140, 100, "volatile", 300_000), [seed]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);
  const W = 680, H = 250;
  const y = (v: number) => 12 + (1 - (v - min) / (max - min || 1)) * (H - 30);
  void W;

  // viewport window follows pos
  const WIN = 0.34;
  const v0 = Math.max(0, Math.min(1 - WIN, pos - WIN / 2));
  const v1 = v0 + WIN;
  const i0 = Math.floor(v0 * candles.length);
  const i1 = Math.min(candles.length - 1, Math.ceil(v1 * candles.length));
  const view = candles.slice(i0, i1 + 1);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPos((p) => {
        const n = p + 0.004;
        if (n >= 1) { setPlaying(false); return 1; }
        const near = EVENTS.findIndex((e) => Math.abs(e.t - n) < 0.006);
        if (near >= 0) { setSel(near); sfx.tick(); }
        return n;
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [playing]);

  const jump = (i: number) => {
    setSel(i);
    setPos(EVENTS[i].t);
    sfx.pop();
  };

  const scrub = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setPos(t);
    const near = EVENTS.reduce((best, e, i) => (Math.abs(e.t - t) < Math.abs(EVENTS[best].t - t) ? i : best), 0);
    if (Math.abs(EVENTS[near].t - t) < 0.05) setSel(near);
  };

  const ev = EVENTS[sel];
  const ei = Math.floor(ev.t * candles.length);
  const before = candles[Math.max(0, ei - 6)]?.c ?? 100;
  const after = candles[Math.min(candles.length - 1, ei + 6)]?.c ?? 100;
  const react = pctChange(before, after);

  return (
    <ShowcaseSection
      id="news" index="42" kicker="News Timeline" title="Новости, прибитые к графику"
      desc="Тяни ползунок времени или жми событие: график долетает к моменту, карточка раскрывается, а реакция цены подсвечивается."
      accent="#ffc531"
      tags={<div className="flex gap-2"><Tag tone="gold">{EVENTS.length} events</Tag><Tag tone={react >= 0 ? "green" : "red"}>reaction {react >= 0 ? "+" : ""}{react.toFixed(2)}%</Tag></div>}
    >
      <ScenePanel title="BTC/USD · event chart" sub="Окно следует за ползунком" accent="#ffc531"
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setCompare((v) => !v)} className={cn("btn3d px-3 py-1.5 text-[10px]", compare ? "btn3d-gold" : "btn3d-ghost")}>Impact window</button>
            <button onClick={() => { setPlaying((p) => !p); sfx.tap(); }} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl">{playing ? <Pause size={15} /> : <Play size={15} />}</button>
          </div>
        }
      >
        <div className="panel-inset relative overflow-hidden p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {view.map((c, k) => {
              const gi = i0 + k;
              const up = c.c >= c.o;
              const col = up ? "#2ede8a" : "#ff5470";
              const x = (k / Math.max(1, view.length - 1)) * W;
              const w = Math.max(2, W / view.length - 2);
              const isEv = Math.abs(gi / candles.length - ev.t) < 0.012;
              return (
                <g key={gi} opacity={1}>
                  <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={isEv ? "#ffc531" : col} strokeWidth={isEv ? 2.4 : 1.2} />
                  <rect x={x - w / 2} y={y(Math.max(c.o, c.c))} width={w} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx={1.2} fill={isEv ? "#ffc531" : col}
                    style={isEv ? { filter: "drop-shadow(0 0 8px #ffc531)" } : undefined} />
                </g>
              );
            })}
            {compare && (
              <g>
                <rect x={((ev.t - v0) / WIN) * W - 60} y={0} width={120} height={H} fill={ev.impact >= 0 ? "#2ede8a" : "#ff5470"} opacity={0.1} rx={10} />
                <line x1={((ev.t - v0) / WIN) * W} x2={((ev.t - v0) / WIN) * W} y1={0} y2={H} stroke="#ffc531" strokeWidth={2} strokeDasharray="6 4" />
              </g>
            )}
            {/* all events in view */}
            {EVENTS.map((e, i) => {
              if (e.t < v0 || e.t > v1) return null;
              const xx = ((e.t - v0) / WIN) * W;
              return (
                <g key={i} className="cursor-pointer" onClick={() => jump(i)}>
                  <circle cx={xx} cy={18} r={i === sel ? 9 : 6} fill={e.impact >= 0 ? "#2ede8a" : "#ff5470"} stroke="#fff" strokeWidth={2} style={{ filter: `drop-shadow(0 0 8px ${e.impact >= 0 ? "#2ede8a" : "#ff5470"})` }} />
                  <text x={xx} y={22} textAnchor="middle" fontSize={9} fontWeight={900} fill="#081130">{e.impact > 0 ? "+" : ""}{e.impact}</text>
                </g>
              );
            })}
          </svg>
          <div className="absolute left-3 top-3 flex gap-1.5">
            <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-extrabold text-white backdrop-blur">view {(v0 * 100).toFixed(0)}–{(v1 * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* timeline */}
        <div
          ref={trackRef} className="relative mt-4 h-20 cursor-ew-resize touch-none rounded-2xl border border-white/10 bg-black/30"
          onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); scrub(e.clientX); }}
          onPointerMove={(e) => { if (e.buttons & 1) scrub(e.clientX); }}
        >
          <div className="absolute inset-x-4 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#2ede8a] via-[#ffc531] to-[#ff5470] opacity-70" />
          {EVENTS.map((e, i) => (
            <button
              key={i} onClick={() => jump(i)}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `calc(${(e.t * 100).toFixed(1)}% )` }}
            >
              <motion.span
                className={cn("flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-black", i === sel ? "border-white" : "border-white/25")}
                style={{ background: e.impact >= 0 ? "#2ede8a" : "#ff5470", color: "#081130", boxShadow: i === sel ? `0 0 20px ${e.impact >= 0 ? "#2ede8a" : "#ff5470"}` : "0 3px 0 #030816" }}
                animate={i === sel ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              >{e.impact > 0 ? "+" : ""}{e.impact}</motion.span>
              <span className={cn("absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[9px] font-extrabold", i === sel ? "text-white" : "text-[#54678f]")}>{e.tag}</span>
            </button>
          ))}
          <motion.div className="absolute top-0 h-full w-[3px] rounded bg-white" style={{ left: `${(pos * 100).toFixed(2)}%`, boxShadow: "0 0 12px #fff" }} />
        </div>
      </ScenePanel>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={sel} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12 }}
            className="overflow-hidden rounded-[22px] border border-white/12 bg-gradient-to-br from-[#1b3773] to-[#0a1740] p-5"
            style={{ boxShadow: `0 0 40px ${ev.impact >= 0 ? "rgba(46,222,138,.2)" : "rgba(255,84,112,.2)"}` }}
          >
            <div className="flex items-center gap-2">
              <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-black uppercase", ev.impact >= 0 ? "bg-[#2ede8a] text-[#04231a]" : "bg-[#ff5470] text-white")}>{ev.tag} · {ev.impact > 0 ? "+" : ""}{ev.impact}</span>
              <span className="text-[10px] font-bold text-[#7d92c4]">event {sel + 1}/{EVENTS.length}</span>
            </div>
            <h3 className="display mt-2 text-xl font-extrabold text-white">{ev.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#c9d8ff]">{ev.body}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-extrabold">
              <span className="text-[#8ea6d8]">Price reaction ±6 bars:</span>
              <span className={cn("num-mono text-base", react >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{react >= 0 ? "+" : ""}{react.toFixed(2)}%</span>
            </div>
          </motion.div>
        </AnimatePresence>
        <ScenePanel title="Queue" sub="Click to fly" accent="#5b8cff">
          <div className="space-y-1.5">
            {EVENTS.map((e, i) => (
              <button key={i} onClick={() => jump(i)} className={cn("flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left", i === sel ? "border-white/40 bg-white/8" : "border-white/8 bg-black/25")}>
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black", e.impact >= 0 ? "bg-[#2ede8a]/20 text-[#2ede8a]" : "bg-[#ff5470]/20 text-[#ff5470]")}>{e.impact > 0 ? "+" : ""}{e.impact}</span>
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-white">{e.title}</span>
              </button>
            ))}
          </div>
        </ScenePanel>
      </div>
    </ShowcaseSection>
  );
}
