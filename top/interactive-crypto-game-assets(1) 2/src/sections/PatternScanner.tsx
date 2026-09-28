/* 40 · PATTERN SCANNER — six live mini charts under one radar sweep.
   Pick a pattern → matches glow. Pause, expand, compare with ideal shape. */
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, Seg } from "../showcase/Scene";
import { candlesRange, genCandles } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const PATTERNS = ["Double Bottom", "Head & Shoulders", "Bull Flag", "Triangle", "Wedge", "Channel"] as const;
type Pat = (typeof PATTERNS)[number];

const IDEAL: Record<Pat, { d: string; bias: "bull" | "bear" | "flat" }> = {
  "Double Bottom": { d: "M0,30 L25,80 L50,45 L75,80 L100,20", bias: "bull" },
  "Head & Shoulders": { d: "M0,70 L20,50 L35,62 L55,20 L75,62 L90,48 L110,70", bias: "bear" },
  "Bull Flag": { d: "M0,95 L30,20 L45,35 L60,28 L75,40 L110,8", bias: "bull" },
  Triangle: { d: "M0,85 L25,25 L40,70 L60,25 L75,55 L95,30 L110,40", bias: "flat" },
  Wedge: { d: "M0,90 L30,60 L55,70 L80,40 L110,48", bias: "bear" },
  Channel: { d: "M0,80 L25,55 L50,70 L75,45 L110,55", bias: "flat" },
};

const COINS = [
  { sym: "BTC", color: "#F7931A" }, { sym: "ETH", color: "#8fa2ff" }, { sym: "SOL", color: "#14F195" },
  { sym: "BNB", color: "#F0B90B" }, { sym: "DOGE", color: "#C2A633" }, { sym: "TON", color: "#0098EA" },
];

function scoreFor(seed: number, pat: Pat, coinIdx: number) {
  const h = (seed * 31 + coinIdx * 17 + pat.length * 7) % 100;
  return 52 + ((h * 13) % 47); // 52..98 deterministic
}

export default function PatternScanner() {
  const [pat, setPat] = useState<Pat>("Double Bottom");
  const [seed, setSeed] = useState(3);
  const [live, setLive] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [expand, setExpand] = useState<number | null>(2);
  const [sweep, setSweep] = useState(0);
  const [tick, setTick] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1100 / speed);
    return () => window.clearInterval(id);
  }, [live, speed]);

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (live) setSweep((s) => (s + dt * 0.35 * speed) % 1);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [live, speed]);

  const minis = useMemo(
    () =>
      COINS.map((c, i) => {
        const candles = genCandles(seed + i * 37 + tick * 0, 40, 100, i % 2 ? "range" : "trend", 60_000);
        // nudge last candles with tick for life
        const last = candles[candles.length - 1];
        const wob = Math.sin(tick * 0.7 + i) * 1.2;
        candles[candles.length - 1] = { ...last, c: last.c + wob * 0.3, h: last.h + Math.abs(wob) * 0.2 };
        const score = scoreFor(seed + Math.floor(tick / 4), pat, i);
        return { ...c, candles, score, match: score > 74 };
      }),
    [seed, pat, tick],
  );

  const exp = expand !== null ? minis[expand] : null;

  return (
    <ShowcaseSection
      id="scanner" index="40" kicker="Pattern Scanner" title="Радар формаций"
      desc="Шесть монет тикают под сканирующим лучом. Выбери паттерн — совпадения вспыхнут. Останови сканирование, раскрой монету и сравни с эталоном."
      accent="#F7931A"
      tags={<div className="flex gap-2"><Tag tone="gold">{minis.filter((m) => m.match).length} matches</Tag><Tag tone={live ? "green" : "ghost"}>{live ? `scanning ×${speed}` : "paused"}</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {PATTERNS.map((p) => (
            <button
              key={p} onClick={() => { setPat(p); sfx.pop(); }}
              className={cn("rounded-xl border px-3 py-2 text-[11px] font-extrabold transition", pat === p ? "border-[#F7931A] bg-[#F7931A]/15 text-[#ffd9a8]" : "border-white/10 bg-black/25 text-[#8ea6d8] hover:text-white")}
              style={pat === p ? { boxShadow: "0 0 16px rgba(247,147,26,.35)" } : undefined}
            >{p}</button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Seg options={["1", "2", "4"] as const} value={String(speed) as "1" | "2" | "4"} onChange={(v) => setSpeed(Number(v) as 1 | 2 | 4)} accent="#F7931A" />
          <button onClick={() => { setLive((v) => !v); sfx.tap(); }} className={cn("btn3d px-4 py-2 text-[10px]", live ? "btn3d-ghost" : "btn3d-green")}>
            {live ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Scan</>}
          </button>
          <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">Reshuffle</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {minis.map((m, i) => {
            const { min, max } = candlesRange(m.candles);
            const W = 220, H = 110;
            const y = (v: number) => 6 + (1 - (v - min) / (max - min || 1)) * (H - 12);
            const bw = W / m.candles.length;
            return (
              <button
                key={m.sym} onClick={() => { setExpand(i); sfx.pop(); }}
                className={cn("relative overflow-hidden rounded-[20px] border p-3 text-left transition", expand === i ? "border-white/50 bg-[#0e1f4a]" : m.match ? "border-[#F7931A]/60 bg-[#F7931A]/8" : "border-white/10 bg-black/25 hover:border-white/25")}
                style={m.match ? { boxShadow: "0 0 24px rgba(247,147,26,.25)" } : undefined}
              >
                {/* sweep */}
                <motion.div className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-[#F7931A]/25 to-transparent"
                  style={{ left: `${sweep * 110 - 10}%` }} />
                <div className="relative mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                    <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.sym}
                  </span>
                  <span className={cn("num-mono rounded-md px-1.5 py-0.5 text-[10px] font-extrabold", m.match ? "bg-[#F7931A] text-[#231303]" : "bg-white/8 text-[#7d92c4]")}>
                    {m.score}%
                  </span>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} className="relative w-full">
                  {m.candles.map((c, k) => {
                    const up = c.c >= c.o;
                    const col = up ? "#2ede8a" : "#ff5470";
                    const hot = m.match && k >= m.candles.length - 14;
                    return (
                      <g key={k} opacity={m.match && !hot ? 0.35 : 1}>
                        <line x1={k * bw + bw / 2} x2={k * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={hot ? "#F7931A" : col} strokeWidth={hot ? 2 : 1} />
                        <rect x={k * bw + bw * 0.2} y={y(Math.max(c.o, c.c))} width={bw * 0.6} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} fill={hot ? "#F7931A" : col} rx={1} />
                      </g>
                    );
                  })}
                </svg>
                <p className="relative mt-1 text-[10px] font-bold text-[#8ea6d8]">{m.match ? `▸ ${pat} detected` : "no clear formation"}</p>
              </button>
            );
          })}
        </div>

        <ScenePanel title={exp ? `${exp.sym} · compare` : "Compare"} sub="Факт против эталона" accent="#F7931A"
          right={exp ? <span className="num-mono text-sm font-extrabold text-[#ffd9a8]">{exp.score}%</span> : undefined}
        >
          {exp ? (
            <>
              <div className="panel-inset p-3">
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Live window</p>
                <MiniBig candles={exp.candles} color={exp.color} hot={exp.match} />
                <p className="mb-1 mt-3 text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">Ideal · {pat}</p>
                <svg viewBox="0 0 110 110" className="h-[110px] w-full rounded-xl border border-white/10 bg-black/30">
                  <motion.path d={IDEAL[pat].d} fill="none" stroke="#F7931A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} style={{ filter: "drop-shadow(0 0 8px #F7931A)" }} />
                </svg>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setExpand((e) => (e === null ? 0 : (e + 5) % minis.length))} className="btn3d btn3d-ghost flex-1 py-2.5 text-[10px]">← Prev</button>
                <button onClick={() => setExpand((e) => (e === null ? 0 : (e + 1) % minis.length))} className="btn3d btn3d-gold flex-1 py-2.5 text-[10px]">Next →</button>
              </div>
              <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 p-3">
                <div className="flex justify-between text-[10px] font-extrabold"><span className="text-[#8ea6d8]">Similarity</span><span className="text-white">{exp.score}%</span></div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/50">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-[#F7931A] to-[#ffc531]" initial={false} animate={{ width: `${exp.score}%` }} />
                </div>
                <p className="mt-2 text-[11px] font-bold text-[#aebde6]">
                  Bias: <b className={IDEAL[pat].bias === "bull" ? "text-[#2ede8a]" : IDEAL[pat].bias === "bear" ? "text-[#ff5470]" : "text-[#ffc531]"}>{IDEAL[pat].bias.toUpperCase()}</b>
                  {" · "}{exp.match ? "Формация подтверждена объёмом" : "Сходство ниже порога 75%"}
                </p>
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-xs text-[#7d92c4]">Выбери мини-график слева</p>
          )}
        </ScenePanel>
      </div>
    </ShowcaseSection>
  );
}

function MiniBig({ candles, color, hot }: { candles: { o: number; h: number; l: number; c: number }[]; color: string; hot: boolean }) {
  const { min, max } = candlesRange(candles as never);
  const W = 300, H = 130;
  const y = (v: number) => 6 + (1 - (v - min) / (max - min || 1)) * (H - 12);
  const bw = W / candles.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {candles.slice(-28).map((c, k) => {
        const up = c.c >= c.o;
        const col = up ? "#2ede8a" : "#ff5470";
        return (
          <g key={k} opacity={hot && k < 14 ? 0.35 : 1}>
            <line x1={k * bw + bw / 2} x2={k * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={hot && k >= 14 ? color : col} strokeWidth={1.4} />
            <rect x={k * bw + bw * 0.2} y={y(Math.max(c.o, c.c))} width={bw * 0.6} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={hot && k >= 14 ? color : col} rx={1.2} />
          </g>
        );
      })}
    </svg>
  );
}
