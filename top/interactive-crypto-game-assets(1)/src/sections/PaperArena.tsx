/* 26 · PAPER ARENA v2 — cinematic market simulator.
   Speed × pause × rewind × hide-future × regimes × paper position. */
import { motion } from "framer-motion";
import { Eye, EyeOff, Pause, Play, Rewind, StepBack, StepForward, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { candlesRange, fmtPrice, genCandles, pctChange, type Regime } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };
const SPEEDS = [0.5, 1, 2, 4] as const;
const REGIMES: { id: Regime; label: string; color: string }[] = [
  { id: "trend", label: "Bull Trend", color: "#2ede8a" },
  { id: "range", label: "Range", color: "#5b8cff" },
  { id: "volatile", label: "Chop Storm", color: "#ffc531" },
  { id: "crash", label: "Crash", color: "#ff5470" },
  { id: "calm", label: "Calm Asia", color: "#8ea6d8" },
];

export default function PaperArena({ onXp, toast }: Props) {
  const [regime, setRegime] = useState<Regime>("trend");
  const [seed, setSeed] = useState(4);
  const [cursor, setCursor] = useState(40);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [hideFuture, setHideFuture] = useState(true);
  const [pos, setPos] = useState<{ side: "long" | "short"; entry: number; idx: number } | null>(null);
  const [trades, setTrades] = useState<{ side: string; pnl: number }[]>([]);
  const timer = useRef<number | null>(null);

  const candles = useMemo(() => genCandles(seed, 120, 100, regime, 300_000), [seed, regime]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);
  const W = 680, H = 240;
  const y = (v: number) => 12 + (1 - (v - min) / (max - min || 1)) * (H - 40);
  const bw = W / candles.length;

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setCursor((c) => (c + 1 >= candles.length ? 0 : c + 1));
    }, Math.max(140, 620 / speed));
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing, speed, candles.length]);

  useEffect(() => { setCursor(40); setPos(null); }, [regime, seed]);

  const cur = candles[cursor];
  const first = candles[0];
  const sess = pctChange(first.o, cur.c);
  const pnl = pos ? (pos.side === "long" ? 1 : -1) * pctChange(pos.entry, cur.c) : 0;
  const reg = REGIMES.find((r) => r.id === regime) ?? REGIMES[0];
  const balance = 10000 + trades.reduce((a, t) => a + t.pnl, 0) + (pos ? (pnl / 100) * 1000 : 0);

  const step = (d: number) => {
    setCursor((c) => Math.max(0, Math.min(candles.length - 1, c + d)));
    sfx.tick();
  };
  const openPos = (side: "long" | "short") => {
    setPos({ side, entry: cur.c, idx: cursor });
    if (side === "long") sfx.long(); else sfx.short();
    toast(`${side.toUpperCase()} @ bar ${cursor}`, "Paper · $1,000", side);
  };
  const closePos = () => {
    if (!pos) return;
    const usd = (pnl / 100) * 1000;
    setTrades((t) => [{ side: pos.side, pnl: usd }, ...t].slice(0, 8));
    if (usd >= 0) { onXp(12); sfx.coin(); } else sfx.error();
    toast(`${usd >= 0 ? "+" : ""}$${usd.toFixed(2)}`, `Closed ${pos.side}`, usd >= 0 ? "green" : "short");
    setPos(null);
  };

  return (
    <ShowcaseSection
      id="paper" index="26" kicker="Paper Arena · v2" title="Симулятор с перемоткой времени"
      desc="Крути скорость, ставь паузу, мотай назад и прячь будущее. Режимы рынка меняют характер ленты, фон и статистику."
      accent={reg.color}
      tags={<div className="flex gap-2"><Tag tone="gold">Bar {cursor + 1}/{candles.length}</Tag><Tag tone={sess >= 0 ? "green" : "red"}>{sess >= 0 ? "+" : ""}{sess.toFixed(2)}%</Tag></div>}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_270px]">
        <ScenePanel title={`${reg.label} · BTC/USD paper`} sub={`seed ${seed} · ${hideFuture ? "будущее скрыто" : "видно всё"}`} accent={reg.color}
          right={
            <button onClick={() => { setHideFuture((v) => !v); sfx.pop(); }} className={cn("btn3d px-3.5 py-2 text-[10px]", hideFuture ? "btn3d-gold" : "btn3d-ghost")}>
              {hideFuture ? <EyeOff size={13} /> : <Eye size={13} />} {hideFuture ? "Hidden" : "Visible"}
            </button>
          }
        >
          <div className="mb-3 flex flex-wrap gap-1.5">
            {REGIMES.map((r) => (
              <button key={r.id} onClick={() => { setRegime(r.id); sfx.tick(); }}
                className={cn("rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider transition", regime === r.id ? "text-white" : "border-white/10 text-[#7d92c4]")}
                style={regime === r.id ? { borderColor: r.color, background: `${r.color}22`, boxShadow: `0 0 14px ${r.color}55` } : undefined}
              >{r.label}</button>
            ))}
            <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost ml-auto px-3 py-1.5 text-[10px]">New tape</button>
          </div>

          <div className="panel-inset relative overflow-hidden p-2" style={{ boxShadow: `inset 0 3px 10px rgba(0,0,0,.7), 0 0 50px ${reg.color}22` }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {candles.map((c, i) => {
                const future = i > cursor;
                const up = c.c >= c.o;
                const col = up ? "#2ede8a" : "#ff5470";
                const x = i * bw + bw * 0.2, w = bw * 0.6;
                return (
                  <g key={i} opacity={future ? (hideFuture ? 0.12 : 0.4) : 1} filter={future && hideFuture ? "blur(1.2px)" : undefined}>
                    <line x1={x + w / 2} x2={x + w / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.1} />
                    <rect x={x} y={y(Math.max(c.o, c.c))} width={w} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} rx={1} fill={col} />
                  </g>
                );
              })}
              {pos && (
                <line x1={0} x2={W} y1={y(pos.entry)} y2={y(pos.entry)} stroke={pos.side === "long" ? "#2ede8a" : "#ff5470"} strokeWidth={1.6} strokeDasharray="8 5" />
              )}
              <line x1={cursor * bw + bw / 2} x2={cursor * bw + bw / 2} y1={0} y2={H} stroke="#fff" strokeWidth={1.6} />
              <circle cx={cursor * bw + bw / 2} cy={y(cur.c)} r={5} fill={reg.color} stroke="#fff" strokeWidth={2} style={{ filter: `drop-shadow(0 0 10px ${reg.color})` }} />
            </svg>
            <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">
              O {cur.o.toFixed(1)} · H {cur.h.toFixed(1)} · L {cur.l.toFixed(1)} · <b style={{ color: cur.c >= cur.o ? "#2ede8a" : "#ff5470" }}>C {cur.c.toFixed(1)}</b>
            </div>
          </div>

          {/* transport */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3">
            <input
              type="range" min={0} max={candles.length - 1} value={cursor}
              onChange={(e) => { setCursor(+e.target.value); setPlaying(false); }}
              className="lever w-full" style={{ ["--fill" as string]: `${(cursor / (candles.length - 1)) * 100}%` }}
            />
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button onClick={() => { setCursor(0); sfx.whoosh(); }} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><Rewind size={16} /></button>
              <button onClick={() => step(-1)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><StepBack size={16} /></button>
              <button onClick={() => { setPlaying((p) => !p); sfx.tap(); }} className="btn3d btn3d-green h-11 w-14 !rounded-2xl">{playing ? <Pause size={17} /> : <Play size={17} />}</button>
              <button onClick={() => step(1)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><StepForward size={16} /></button>
              <div className="ml-auto flex gap-1.5">
                {SPEEDS.map((s) => (
                  <button key={s} onClick={() => { setSpeed(s); sfx.tick(); }} className={cn("rounded-lg px-3 py-2 text-[11px] font-extrabold", speed === s ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>×{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {!pos ? (
              <>
                <button onClick={() => openPos("long")} className="btn3d btn3d-long py-3.5 text-xs"><TrendingUp size={15} strokeWidth={3} /> Long here</button>
                <button onClick={() => openPos("short")} className="btn3d btn3d-short py-3.5 text-xs"><TrendingDown size={15} strokeWidth={3} /> Short here</button>
              </>
            ) : (
              <button onClick={closePos} className={cn("btn3d col-span-2 py-3.5 text-xs", pnl >= 0 ? "btn3d-green" : "btn3d-short")}>
                Close {pos.side} · {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}%
              </button>
            )}
          </div>
        </ScenePanel>

        <div className="space-y-3">
          <ScenePanel title="Account" sub="Paper $10,000" accent="#8ef23c">
            <p className="num-mono text-2xl font-extrabold text-white">${fmtPrice(balance)}</p>
            <p className={cn("num-mono text-sm font-extrabold", pnl >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>
              {pos ? `Floating ${pnl >= 0 ? "+" : ""}$${((pnl / 100) * 1000).toFixed(2)}` : "Flat"}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SceneStat label="Trades" value={`${trades.length}`} color="#fff" />
              <SceneStat label="Win" value={trades.length ? `${Math.round((trades.filter((t) => t.pnl >= 0).length / trades.length) * 100)}%` : "—"} color="#8ef23c" />
            </div>
          </ScenePanel>
          <ScenePanel title="Journal" sub="Последние сделки" accent="#5b8cff">
            <div className="space-y-1.5">
              {trades.length === 0 && <p className="py-4 text-center text-[11px] text-[#54678f]">Открой и закрой первую сделку на ленте</p>}
              {trades.map((t, i) => (
                <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[.03] px-3 py-2 text-[11px]">
                  <span className={cn("font-black uppercase", t.side === "long" ? "text-[#2ede8a]" : "text-[#ff5470]")}>{t.side}</span>
                  <span className={cn("num-mono font-extrabold", t.pnl >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
