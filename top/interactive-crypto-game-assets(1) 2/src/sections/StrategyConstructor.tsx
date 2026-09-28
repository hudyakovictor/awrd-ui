/* 43 · STRATEGY CONSTRUCTOR — assemble a playbook from chunky blocks.
   Drag to reorder, tap to cycle options, watch the flow validate + backtest. */
import { motion, Reorder } from "framer-motion";
import { useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { closesPath } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Slot = "signal" | "confirm" | "entry" | "risk" | "exit";
const ORDER: Slot[] = ["signal", "confirm", "entry", "risk", "exit"];
const OPTIONS: Record<Slot, { opts: string[]; color: string; icon: string }> = {
  signal: { opts: ["RSI cross 50", "Breakout + volume", "EMA 9/21 cross", "Sweep + reclaim"], color: "#5b8cff", icon: "◎" },
  confirm: { opts: ["HTF trend align", "CVD divergence ok", "Funding neutral", "2nd candle close"], color: "#a78bff", icon: "◈" },
  entry: { opts: ["Limit at retest", "Market on close", "Stop above high", "Scale 2 legs"], color: "#8ef23c", icon: "➤" },
  risk: { opts: ["Risk 1% · SL structure", "Risk 2% · SL ATR", "Risk 0.5% · tight", "No stop (chaos)"], color: "#ffc531", icon: "⛨" },
  exit: { opts: ["TP 2R + trail", "TP 3R fixed", "RSI flip exit", "Time exit 8H"], color: "#ff8b3d", icon: "⚑" },
};

export default function StrategyConstructor() {
  const [slots, setSlots] = useState<Slot[]>(ORDER);
  const [pick, setPick] = useState<Record<Slot, number>>({ signal: 1, confirm: 0, entry: 0, risk: 0, exit: 0 });
  const [pulse, setPulse] = useState(0);
  const [result, setResult] = useState<{ wr: number; pf: number; note: string } | null>(null);

  const completeness = slots.length === 5 ? 100 : (slots.length / 5) * 100;
  const chaos = OPTIONS.risk.opts[pick.risk].includes("chaos");
  const valid = !chaos;

  const equity = useMemo(() => {
    const winP = chaos ? 0.4 : 0.56;
    let eq = 100;
    const out = [eq];
    for (let i = 1; i < 60; i++) {
      const win = Math.random() < winP;
      eq += win ? 1.6 : -1.1;
      out.push(eq);
    }
    return out;
  }, [pick, chaos, pulse]);

  const run = () => {
    setPulse((p) => p + 1);
    if (!valid) {
      sfx.error();
      setResult({ wr: 31, pf: 0.7, note: "No-stop branch blows up on the first chop storm." });
      return;
    }
    sfx.levelUp();
    const wr = 52 + ((pick.signal + pick.confirm) % 3) * 3;
    setResult({ wr, pf: 1.6 + ((pick.exit + pick.risk) % 3) * 0.3, note: "Flow validated. Edge comes from confirmation + risk pairing." });
  };

  return (
    <ShowcaseSection
      id="strategy" index="43" kicker="Strategy Constructor" title="Собери стратегию как схему"
      desc="Пять крупных блоков: сигнал, подтверждение, вход, риск, выход. Перетаскивай порядок, кликай для смены 옵ций, запускай проверку — схема оживёт."
      accent="#a78bff"
      tags={<div className="flex gap-2"><Tag tone={valid ? "green" : "red"}>{valid ? "valid flow" : "chaos branch"}</Tag><Tag tone="ghost">{completeness}% complete</Tag></div>}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <ScenePanel title="Flow canvas" sub="Drag blocks to reorder · click option to cycle" accent="#a78bff">
          <div className="relative">
            <svg className="pointer-events-none absolute left-[27px] top-4 h-[calc(100%-32px)] w-2" viewBox="0 0 8 400" preserveAspectRatio="none">
              <motion.line x1={4} y1={0} x2={4} y2={400} stroke={valid ? "#8ef23c" : "#ff5470"} strokeWidth={3} strokeDasharray="10 8"
                initial={false} animate={{ strokeDashoffset: [0, -36] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} opacity={0.7} />
              {pulse > 0 && (
                <motion.circle key={pulse} cx={4} cy={0} r={6} fill="#fff"
                  initial={{ cy: 0, opacity: 1 }} animate={{ cy: 400, opacity: [1, 1, 0] }} transition={{ duration: 1.4, ease: "easeInOut" }} />
              )}
            </svg>
            <Reorder.Group axis="y" values={slots} onReorder={(v) => { setSlots(v); sfx.swipe(); }} className="space-y-3">
              {slots.map((s, i) => {
                const cfg = OPTIONS[s];
                const opt = cfg.opts[pick[s]];
                return (
                  <Reorder.Item key={s} value={s} whileDrag={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,.5)" }} className="relative">
                    <div className="flex items-stretch gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 text-xl font-black"
                        style={{ borderColor: cfg.color, background: `${cfg.color}22`, color: cfg.color, boxShadow: `0 4px 0 #030816, 0 0 18px ${cfg.color}44` }}>
                        {cfg.icon}
                      </div>
                      <button
                        onClick={() => { setPick((p) => ({ ...p, [s]: (p[s] + 1) % cfg.opts.length })); sfx.tick(); setResult(null); }}
                        className="flex-1 cursor-grab rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-left active:cursor-grabbing"
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: cfg.color }}>{i + 1} · {s}</span>
                          <span className="text-[10px] font-bold text-[#54678f]">tap — next option</span>
                        </span>
                        <motion.span key={opt} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="display block text-[15px] font-extrabold text-white">
                          {opt}
                        </motion.span>
                      </button>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
          </div>
          <button onClick={run} className={cn("btn3d mt-4 w-full py-4 text-sm", valid ? "btn3d-green" : "btn3d-short")}>
            {valid ? "▶ Validate + backtest" : "⚠ Run anyway (chaos)"}
          </button>
        </ScenePanel>

        <div className="space-y-4">
          <ScenePanel title="Backtest sketch" sub="Equity pulse on run" accent="#8ef23c">
            <svg viewBox="0 0 260 110" className="w-full rounded-xl border border-white/10 bg-black/30">
              <motion.path key={pulse} d={closesPath(equity, 260, 110)} fill="none" stroke={valid ? "#8ef23c" : "#ff5470"} strokeWidth={2.5}
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} style={{ filter: `drop-shadow(0 0 8px ${valid ? "#8ef23c" : "#ff5470"})` }} />
            </svg>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SceneStat label="Winrate" value={result ? `${result.wr}%` : "—"} color="#fff" />
              <SceneStat label="Profit f." value={result ? result.pf.toFixed(2) : "—"} color={result && result.pf >= 1.4 ? "#8ef23c" : "#ffc531"} />
            </div>
            <p className="mt-2 min-h-[36px] text-[11px] font-bold text-[#aebde6]">{result ? result.note : "Нажми run — поток засветится, кривая перерисуется."}</p>
          </ScenePanel>
          <ScenePanel title="Recipe" sub="Текущая сборка" accent="#ffc531">
            <ol className="space-y-1.5">
              {slots.map((s, i) => (
                <li key={s} className="flex gap-2 text-[11px] font-bold text-[#c9d8ff]">
                  <span className="num-mono text-[#54678f]">{i + 1}.</span>
                  <span><b style={{ color: OPTIONS[s].color }}>{s}</b> — {OPTIONS[s].opts[pick[s]]}</span>
                </li>
              ))}
            </ol>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
