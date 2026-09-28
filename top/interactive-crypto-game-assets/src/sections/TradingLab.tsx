/* 03 · TRADING LAB v2 — one deep terminal scene.
   Assets × timeframes × tape speed × paper position with live visual state. */
import { motion } from "framer-motion";
import { Crosshair, Pause, Play, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { aggregate, candlesRange, fmtPrice, genCandles, pctChange, type Candle, type Regime } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const ASSETS = [
  { sym: "BTC", name: "Bitcoin", price: 97432, color: "#F7931A", glyph: "₿", vol: 1.0 },
  { sym: "ETH", name: "Ethereum", price: 3841, color: "#8fa2ff", glyph: "Ξ", vol: 1.35 },
  { sym: "SOL", name: "Solana", price: 214.6, color: "#14F195", glyph: "◎", vol: 1.9 },
] as const;
const TFS = ["1m", "5m", "15m", "1H", "4H"] as const;
type TF = (typeof TFS)[number];
const TF_AGG: Record<TF, number> = { "1m": 1, "5m": 5, "15m": 15, "1H": 60, "4H": 240 };

type Pos = { side: "long" | "short"; entry: number; size: number } | null;

export default function TradingLab({ onToast }: { onToast: (t: string, s: string, tone: string) => void }) {
  const [sym, setSym] = useState<(typeof ASSETS)[number]["sym"]>("BTC");
  const [tf, setTf] = useState<TF>("15m");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState<Pos>(null);
  const [seed, setSeed] = useState(11);
  const [regime, setRegime] = useState<Regime>("trend");
  const asset = ASSETS.find((a) => a.sym === sym) ?? ASSETS[0];

  // base series per asset+regime, aggregated to timeframe
  const base = useMemo(
    () => genCandles(seed + sym.length * 7, 480, 100, regime, 60_000),
    [seed, sym, regime],
  );
  const [live, setLive] = useState<Candle[]>(base);
  const candles = useMemo(() => aggregate(live, TF_AGG[tf]).slice(-64), [live, tf]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setLive((prev) => {
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.485) * 1.6 * asset.vol;
        const nc = Math.max(5, last.c + drift * 0.4);
        const upd: Candle = {
          ...last,
          h: Math.max(last.h, nc),
          l: Math.min(last.l, nc),
          c: nc,
          v: last.v + Math.random() * 5,
        };
        if (Math.random() > 0.86) {
          return [...prev.slice(1), upd, { o: nc, h: nc + 0.6, l: nc - 0.6, c: nc + (Math.random() - 0.5), v: 24, t: Date.now() }];
        }
        return [...prev.slice(0, -1), upd];
      });
    }, Math.max(220, 750 / speed));
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing, speed, asset.vol]);

  useEffect(() => { setLive(base); }, [base]);

  const W = 680, H = 250, pad = 12;
  const y = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2 - 30);
  const bw = W / Math.max(1, candles.length);
  const last = candles[candles.length - 1];
  const scale = asset.price / 100;
  const px = (v: number) => v * scale;
  const dayChg = pctChange(candles[0]?.o ?? 100, last?.c ?? 100);

  const pnl = pos ? (pos.side === "long" ? 1 : -1) * pctChange(pos.entry, last.c) : 0;
  const pnlUsd = pos ? (pnl / 100) * pos.size : 0;
  const state: "bull" | "bear" | "flat" = pnl > 0.15 ? "bull" : pnl < -0.15 ? "bear" : dayChg >= 0 ? "bull" : "bear";

  const tape = useMemo(() => {
    if (!last) return [];
    return Array.from({ length: 9 }, (_, i) => {
      const side = Math.random() > 0.46 ? "B" : "S";
      const p = last.c * (1 + (Math.random() - 0.5) * 0.004);
      return { side, p: px(p), a: (Math.random() * 1.8 + 0.05).toFixed(3), t: `${String(9 + Math.floor(i / 6)).padStart(2, "0")}:${String(41 + i).padStart(2, "0")}` };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.round(last?.c ?? 0), playing]);

  const openPos = (side: "long" | "short") => {
    setPos({ side, entry: last.c, size: 1000 });
    if (side === "long") sfx.long(); else sfx.short();
    onToast(`${side.toUpperCase()} ${sym} opened`, `Entry ${fmtPrice(px(last.c))} · size $1,000`, side);
  };
  const closePos = () => {
    if (!pos) return;
    onToast(`Closed ${pnlUsd >= 0 ? "+" : ""}$${pnlUsd.toFixed(2)}`, `${pos.side} ${sym} · ${pnl.toFixed(2)}%`, pnlUsd >= 0 ? "green" : "short");
    sfx.coin();
    setPos(null);
  };

  const glow = state === "bull" ? "rgba(46,222,138,.16)" : "rgba(255,84,112,.16)";

  return (
    <ShowcaseSection
      id="trading" index="03" kicker="Trading Lab · v2" title="Терминал как живой организм"
      desc="Переключай актив и таймфрейм, крути скорость ленты, открывай бумажную позицию — терминал меняет свечение, линии входа и PnL в реальном времени."
      accent={asset.color}
      variant="scan"
      moment="Запоминающийся момент: открыл позицию — терминал меняет свечение под твой PnL"
      keys={[{ k: "Space", d: "пауза" }, { k: "L / S", d: "long / short" }, { k: "C", d: "закрыть" }, { k: "← →", d: "таймфрейм" }, { k: "1 2 3", d: "актив" }]}
      hotkeys={{
        Space: () => setPlaying((p) => !p),
        l: () => { if (!pos) openPos("long"); },
        s: () => { if (!pos) openPos("short"); },
        c: () => closePos(),
        ArrowRight: () => setTf((t) => TFS[Math.min(TFS.length - 1, TFS.indexOf(t) + 1)]),
        ArrowLeft: () => setTf((t) => TFS[Math.max(0, TFS.indexOf(t) - 1)]),
        "1": () => setSym("BTC"), "2": () => setSym("ETH"), "3": () => setSym("SOL"),
      }}
      tags={<div className="flex gap-2"><Tag tone={dayChg >= 0 ? "green" : "red"}>{dayChg >= 0 ? "▲" : "▼"} {Math.abs(dayChg).toFixed(2)}%</Tag><Tag tone="ghost">{tf} · ×{speed}</Tag></div>}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
        {/* main terminal */}
        <ScenePanel
          title={`${sym} / USDT · Perpetual`} sub={`${asset.name} · ${regime} tape · seed ${seed}`}
          accent={asset.color}
          right={
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-1.5 text-[10px]">Reshuffle</button>
              <button onClick={() => setPlaying((p) => !p)} className="btn3d btn3d-ghost h-8 w-8 !rounded-lg">{playing ? <Pause size={14} /> : <Play size={14} />}</button>
            </div>
          }
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5">
              {ASSETS.map((a) => (
                <button
                  key={a.sym}
                  onClick={() => { setSym(a.sym); sfx.pop(); }}
                  className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition", sym === a.sym ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-black/25 text-[#8ea6d8]")}
                  style={sym === a.sym ? { boxShadow: `0 0 16px ${a.color}55, 0 4px 0 #030816` } : undefined}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-black" style={{ color: a.color, background: `${a.color}22` }}>{a.glyph}</span>
                  {a.sym}
                </button>
              ))}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Seg options={TFS} value={tf} onChange={setTf} accent={asset.color} />
              <Seg options={["1", "2", "4"] as const} value={String(speed) as "1" | "2" | "4"} onChange={(v) => setSpeed(Number(v) as 1 | 2 | 4)} accent="#5b8cff" />
            </div>
          </div>

          <div className="mb-2 flex flex-wrap gap-1.5">
            {(["trend", "range", "volatile", "crash", "calm"] as Regime[]).map((r) => (
              <button key={r} onClick={() => { setRegime(r); sfx.tick(); }} className={cn("rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider", regime === r ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-[#7d92c4]")}>{r}</button>
            ))}
          </div>

          <div className="panel-inset relative overflow-hidden p-2 transition-colors duration-500" style={{ boxShadow: `inset 0 3px 10px rgba(0,0,0,.7), 0 0 60px ${glow}` }}>
            <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(122,156,255,.12) 1px,transparent 1px)", backgroundSize: "100% 32px" }} />
            <svg
              viewBox={`0 0 ${W} ${H}`} className="relative w-full cursor-crosshair"
              onMouseLeave={() => setHover(null)}
              onMouseMove={(e) => {
                const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const idx = Math.floor(((e.clientX - r.left) / r.width) * candles.length);
                setHover(Math.max(0, Math.min(candles.length - 1, idx)));
              }}
            >
              {candles.map((c, i) => {
                const up = c.c >= c.o;
                const col = up ? "#2ede8a" : "#ff5470";
                const x = i * bw + bw * 0.2, w = bw * 0.6;
                const dim = hover === null || hover === i ? 1 : 0.4;
                return (
                  <g key={i} opacity={dim}>
                    <line x1={x + w / 2} x2={x + w / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.4} />
                    <motion.rect
                      x={x} y={y(Math.max(c.o, c.c))} width={w} height={Math.max(2.5, Math.abs(y(c.o) - y(c.c)))} rx={2} fill={col}
                      initial={false} animate={{ opacity: 1 }} style={hover === i ? { filter: `drop-shadow(0 0 7px ${col})` } : undefined}
                    />
                    <rect x={i * bw + 1} y={H - 12 - (c.v / 160) * 22} width={Math.max(1, bw - 2)} height={(c.v / 160) * 22} rx={1} fill={col} opacity={0.3} />
                  </g>
                );
              })}
              {pos && (
                <>
                  <line x1={0} x2={W} y1={y(pos.entry)} y2={y(pos.entry)} stroke={pos.side === "long" ? "#2ede8a" : "#ff5470"} strokeWidth={1.6} strokeDasharray="8 5" />
                  <line x1={0} x2={W} y1={y(pos.entry * (pos.side === "long" ? 1.02 : 0.98))} y2={y(pos.entry * (pos.side === "long" ? 1.02 : 0.98))} stroke="#ffc531" strokeWidth={1.1} strokeDasharray="3 4" opacity={0.8} />
                  <line x1={0} x2={W} y1={y(pos.entry * (pos.side === "long" ? 0.99 : 1.01))} y2={y(pos.entry * (pos.side === "long" ? 0.99 : 1.01))} stroke="#ff5470" strokeWidth={1.1} strokeDasharray="3 4" opacity={0.8} />
                </>
              )}
              {hover !== null && candles[hover] && (
                <g>
                  <line x1={hover * bw + bw / 2} x2={hover * bw + bw / 2} y1={0} y2={H} stroke="#9db9ff" strokeDasharray="4 4" strokeWidth={1} />
                  <circle cx={hover * bw + bw / 2} cy={y(candles[hover].c)} r={4.5} fill="#fff" stroke="#5b8cff" strokeWidth={2} />
                </g>
              )}
              <line x1={0} x2={W} y1={y(last.c)} y2={y(last.c)} stroke={last.c >= last.o ? "#2ede8a" : "#ff5470"} strokeWidth={1.2} strokeDasharray="6 4" opacity={0.85} />
            </svg>
            {hover !== null && candles[hover] && (
              <div className="anim-pop absolute left-3 top-3 flex items-center gap-2 rounded-xl border border-white/15 bg-[#060d24]/92 px-3 py-1.5 backdrop-blur">
                <Crosshair size={13} className="text-[#8ef23c]" />
                <span className="num-mono text-[11px] font-bold text-white">
                  O {fmtPrice(px(candles[hover].o))} · H {fmtPrice(px(candles[hover].h))} · L {fmtPrice(px(candles[hover].l))} · C {fmtPrice(px(candles[hover].c))}
                </span>
              </div>
            )}
            <div className={cn("absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold", playing ? "bg-[#2ede8a]/15 text-[#2ede8a]" : "bg-white/10 text-[#8ea6d8]")}>
              <span className={cn("h-1.5 w-1.5 rounded-full", playing ? "animate-pulse bg-[#2ede8a]" : "bg-[#8ea6d8]")} />
              {playing ? `LIVE · ×${speed}` : "PAUSED"}
            </div>
            <div className="absolute bottom-3 left-3 flex gap-1.5 text-[9px] font-extrabold">
              <span className="rounded-md bg-[#2ede8a]/15 px-2 py-0.5 text-[#2ede8a]">— entry</span>
              <span className="rounded-md bg-[#ffc531]/15 px-2 py-0.5 text-[#ffd76a]">- - TP +2%</span>
              <span className="rounded-md bg-[#ff5470]/15 px-2 py-0.5 text-[#ff8ba0]">- - SL −1%</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SceneStat label={`${sym} price`} value={`$${fmtPrice(px(last.c))}`} sub={`${sym}/USDT`} color={last.c >= last.o ? "#2ede8a" : "#ff5470"} />
            <SceneStat label="Session" value={`${dayChg >= 0 ? "+" : ""}${dayChg.toFixed(2)}%`} sub={`${candles.length} bars`} color={dayChg >= 0 ? "#2ede8a" : "#ff5470"} />
            <SceneStat label="Position" value={pos ? pos.side.toUpperCase() : "FLAT"} sub={pos ? `entry ${fmtPrice(px(pos.entry))}` : "no exposure"} color={pos ? (pos.side === "long" ? "#2ede8a" : "#ff5470") : "#8ea6d8"} />
            <SceneStat label="Unrealized" value={pos ? `${pnlUsd >= 0 ? "+" : ""}$${pnlUsd.toFixed(2)}` : "$0.00"} sub={pos ? `${pnl.toFixed(2)}%` : "—"} color={!pos ? "#8ea6d8" : pnlUsd >= 0 ? "#2ede8a" : "#ff5470"} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {!pos ? (
              <>
                <button onClick={() => openPos("long")} className="btn3d btn3d-long py-4 text-sm"><TrendingUp size={18} strokeWidth={3} /> Long $1k</button>
                <button onClick={() => openPos("short")} className="btn3d btn3d-short py-4 text-sm"><TrendingDown size={18} strokeWidth={3} /> Short $1k</button>
              </>
            ) : (
              <>
                <div className={cn("flex items-center justify-between rounded-2xl border px-4 py-3", pnlUsd >= 0 ? "border-[#2ede8a]/40 bg-[#2ede8a]/10" : "border-[#ff5470]/40 bg-[#ff5470]/10")}>
                  <span className="text-xs font-bold text-[#aebde6]">Floating</span>
                  <motion.span key={pnlUsd.toFixed(1)} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className={cn("num-mono text-lg font-extrabold", pnlUsd >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>
                    {pnlUsd >= 0 ? "+" : ""}${pnlUsd.toFixed(2)}
                  </motion.span>
                </div>
                <button onClick={closePos} className="btn3d btn3d-gold py-4 text-sm"><X size={16} strokeWidth={3} /> Close position</button>
              </>
            )}
          </div>
        </ScenePanel>

        {/* tape */}
        <ScenePanel title="Time & Sales" sub="Лента сделок живёт со скоростью графика" accent="#5b8cff">
          <div className="space-y-1.5">
            {tape.map((t, i) => (
              <motion.div key={`${t.t}-${i}`} initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[.02] px-2.5 py-1.5 text-[11px]">
                <span className={cn("font-black", t.side === "B" ? "text-[#2ede8a]" : "text-[#ff5470]")}>{t.side}</span>
                <span className="num-mono font-bold text-white">{fmtPrice(t.p)}</span>
                <span className="num-mono text-[#8ea6d8]">{t.a}</span>
                <span className="num-mono text-[#54678f]">{t.t}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Terminal mood</p>
            <p className={cn("display mt-1 text-lg font-extrabold", state === "bull" ? "text-[#2ede8a]" : "text-[#ff5470]")}>
              {pos ? (pnlUsd >= 0 ? "In profit — держи план" : "In drawdown — следи за SL") : dayChg >= 0 ? "Bull tape" : "Bear tape"}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/50">
              <motion.div className="h-full rounded-full" animate={{ width: `${Math.min(100, Math.abs(pos ? pnl : dayChg) * 22 + 12)}%`, backgroundColor: state === "bull" ? "#2ede8a" : "#ff5470" }} />
            </div>
          </div>
        </ScenePanel>
      </div>
    </ShowcaseSection>
  );
}
