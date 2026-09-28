/* ------------------------------------------------------------------
 * 34 · CURRICULUM TREE — skill tree with unlock graph & mastery bars
 * ------------------------------------------------------------------ */
import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Meter, Tag } from "../components/ui";
import { GameSection } from "../fx/gamekit";
import { Reveal, Tilt } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

type Skill = {
  id: string; name: string; branch: string; cost: number; max: number;
  desc: string; requires?: string[];
};

const SKILLS: Skill[] = [
  { id: "c1", name: "Candle Anatomy", branch: "Price Action", cost: 1, max: 3, desc: "OHLC mastery" },
  { id: "c2", name: "Pattern Library", branch: "Price Action", cost: 1, max: 5, desc: "20+ patterns", requires: ["c1"] },
  { id: "c3", name: "Multi-TF Reads", branch: "Price Action", cost: 2, max: 3, desc: "1m→1D alignment", requires: ["c2"] },
  { id: "r1", name: "Risk 101", branch: "Risk", cost: 1, max: 3, desc: "1% rule" },
  { id: "r2", name: "Position Sizing", branch: "Risk", cost: 1, max: 4, desc: "Math of size", requires: ["r1"] },
  { id: "r3", name: "Portfolio Heat", branch: "Risk", cost: 2, max: 3, desc: "Correlated risk", requires: ["r2"] },
  { id: "t1", name: "Trend Filters", branch: "Systems", cost: 1, max: 3, desc: "EMA/structure" },
  { id: "t2", name: "Playbook Builder", branch: "Systems", cost: 2, max: 4, desc: "If-then rules", requires: ["t1", "r1"] },
  { id: "t3", name: "Automation Mind", branch: "Systems", cost: 2, max: 3, desc: "Bot logic", requires: ["t2"] },
  { id: "p1", name: "Emotion Labels", branch: "Mind", cost: 1, max: 3, desc: "Name FOMO/tilt" },
  { id: "p2", name: "Process Over PnL", branch: "Mind", cost: 1, max: 4, desc: "Journal habits", requires: ["p1"] },
  { id: "p3", name: "Peak Performance", branch: "Mind", cost: 2, max: 3, desc: "Routines", requires: ["p2"] },
  { id: "o1", name: "Book Reading", branch: "Flow", cost: 1, max: 3, desc: "Bids/asks" },
  { id: "o2", name: "Spoof Radar", branch: "Flow", cost: 2, max: 3, desc: "Fake walls", requires: ["o1"] },
  { id: "o3", name: "CVD Edge", branch: "Flow", cost: 2, max: 3, desc: "Divergence", requires: ["o2"] },
];

export default function CurriculumTree({ onXp, toast }: Props) {
  const [pts, setPts] = useState(8);
  const [levels, setLevels] = useState<Record<string, number>>({ c1: 1, r1: 1 });
  const [branch, setBranch] = useState("all");
  const branches = ["all", "Price Action", "Risk", "Systems", "Mind", "Flow"];

  const can = (s: Skill) => {
    if ((levels[s.id] || 0) >= s.max) return false;
    if (pts < s.cost) return false;
    if (!s.requires) return true;
    return s.requires.every(r => (levels[r] || 0) > 0);
  };

  const up = (s: Skill) => {
    if (!can(s)) { sfx.error(); return; }
    setPts(p => p - s.cost);
    setLevels(l => ({ ...l, [s.id]: (l[s.id] || 0) + 1 }));
    onXp(15);
    sfx.success();
    toast(s.name, `Rank ${(levels[s.id] || 0) + 1}/${s.max}`, "green");
    if ((levels[s.id] || 0) + 1 >= s.max) confetti({ particleCount: 40, spread: 55 });
  };

  const list = SKILLS.filter(s => branch === "all" || s.branch === branch);
  const mastery = useMemo(() => {
    const total = SKILLS.reduce((a, s) => a + s.max, 0);
    const have = SKILLS.reduce((a, s) => a + (levels[s.id] || 0), 0);
    return Math.round((have / total) * 100);
  }, [levels]);

  return (
    <GameSection id="curriculum" index="34" kicker="Skill Tree" title="Дерево навыков"
      desc="15 скиллов в 5 ветках. Требования, стоимость очков, mastery %. Прокачка даёт XP."
      right={<div className="flex gap-2"><Tag tone="green">{pts} pts</Tag><Tag tone="gold">{mastery}% mastery</Tag></div>}>
      <div className="mb-4 flex flex-wrap gap-2">
        {branches.map(b => (
          <button key={b} onClick={() => { setBranch(b); sfx.tick(); }} className={cn("rounded-xl px-3 py-1.5 text-[11px] font-extrabold", branch === b ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>{b}</button>
        ))}
        <button onClick={() => setPts(p => p + 5)} className="btn3d btn3d-ghost ml-auto px-3 py-1.5 text-[10px]">+5 pts</button>
      </div>
      <div className="mb-4"><Meter value={mastery} tone="gold" h={12} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s, i) => {
          const lv = levels[s.id] || 0;
          const locked = s.requires && !s.requires.every(r => (levels[r] || 0) > 0);
          return (
            <Reveal key={s.id} delay={i * 0.03}>
              <Tilt max={8}>
                <button onClick={() => up(s)} disabled={locked || lv >= s.max}
                  className={cn("panel-3d w-full p-4 text-left", locked && "opacity-50")}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]">{s.branch}</p>
                      <p className="display text-sm font-extrabold text-white">{s.name}</p>
                      <p className="text-[11px] text-[#8ea6d8]">{s.desc}</p>
                    </div>
                    <span className="num-mono rounded-lg bg-black/40 px-2 py-1 text-[11px] font-extrabold text-[#ffc531]">{lv}/{s.max}</span>
                  </div>
                  <div className="mt-3"><Meter value={lv} max={s.max} tone={lv >= s.max ? "green" : "blue"} h={8} /></div>
                  <p className="mt-2 text-[10px] font-bold text-[#8ea6d8]">
                    {locked ? `Requires ${s.requires?.join(", ")}` : lv >= s.max ? "MAXED" : `Upgrade · ${s.cost} pts`}
                  </p>
                </button>
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </GameSection>
  );
}
