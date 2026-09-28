/* ------------------------------------------------------------------
 * 36 · SCENARIO DRILL — 20 real market scenarios with filters
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ChipRow, GameSection, StarBurst } from "../fx/gamekit";
import { SCENARIOS, scenariosByTag } from "../game/scenarios";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

export default function ScenarioDrill({ onXp }: Props) {
  const [tag, setTag] = useState("all");
  const pool = useMemo(() => tag === "all" ? SCENARIOS : scenariosByTag(tag), [tag]);
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(0);
  const s = pool[idx % pool.length];

  const answer = (i: number) => {
    if (pick !== null) return;
    setPick(i);
    const ok = i === s.correct;
    if (ok) { setScore(x => x + 10 * s.difficulty); sfx.success(); onXp(10 * s.difficulty); }
    else sfx.error();
    setDone(d => d + 1);
  };

  const next = () => {
    setPick(null);
    setIdx(i => i + 1);
    sfx.soft();
  };

  return (
    <GameSection id="scenarios" index="36" kicker="Scenario Drill" title="20 рыночных сценариев"
      desc="Реалистичные кейсы BTC/ETH/SOL… Фильтр по тегам, очки за сложность, разбор после ответа."
      right={<Tag tone="green">Score {score}</Tag>}>
      <div className="mb-4">
        <ChipRow options={["all", "breakout", "risk", "psychology", "trend", "funding", "liquidity", "macro"]} value={tag} onChange={(v) => { setTag(v); setIdx(0); setPick(null); }} />
      </div>
      <div className="panel-3d p-5">
        <div className="mb-2 flex flex-wrap gap-2">
          <Tag tone="blue">{s.market}</Tag>
          <Tag tone="ghost">{s.timeframe}</Tag>
          <Tag tone={s.difficulty === 3 ? "red" : s.difficulty === 2 ? "gold" : "green"}>D{s.difficulty}</Tag>
          <span className="ml-auto text-[11px] font-bold text-[#7d92c4]">{done} answered · pool {pool.length}</span>
        </div>
        <h3 className="display text-xl font-extrabold text-white">{s.title}</h3>
        <p className="mt-2 text-sm text-[#aebde6]">{s.context}</p>
        <p className="mt-1 text-sm font-semibold text-[#c9d8ff]">{s.setup}</p>
        <p className="display mt-4 text-base font-bold text-white">{s.question}</p>
        <div className="mt-4 space-y-2">
          {s.options.map((o, i) => {
            const isC = pick !== null && i === s.correct;
            const isW = pick === i && i !== s.correct;
            return (
              <button key={o} onClick={() => answer(i)} disabled={pick !== null}
                className={cn("w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold",
                  isC ? "border-[#8ef23c] bg-[#8ef23c]/15 text-[#a4ff5e]" :
                  isW ? "border-[#ff5470] bg-[#ff5470]/15 text-[#ff8ba0]" :
                  pick !== null ? "border-white/8 text-[#54678f]" : "border-white/12 bg-black/25 text-white hover:border-[#5b8cff]/40")}>
                {o}
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {pick !== null && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-[#c9d8ff]">{s.explain}</p>
              <button onClick={next} className="btn3d btn3d-green mt-3 w-full py-3 text-xs">Next scenario</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {done >= 10 && (
        <div className="mt-4 text-center">
          <StarBurst stars={score > 120 ? 3 : score > 60 ? 2 : 1} />
          <p className="display mt-2 text-lg font-extrabold text-white">Drill session · {score} pts</p>
        </div>
      )}
    </GameSection>
  );
}
