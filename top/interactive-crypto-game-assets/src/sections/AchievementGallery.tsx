/* Achievement Gallery */
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Tag } from "../components/ui";
import { ChipRow, GameSection, MagCTA } from "../fx/gamekit";
import { ACHIEVEMENTS, type Achievement } from "../game/engines";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };
const rarityColor = { common: "#8ea6d8", rare: "#5b8cff", epic: "#a78bff", legendary: "#ffc531" };

export default function AchievementGallery({ onXp, toast }: Props) {
  const [filter, setFilter] = useState("all");
  const [unlocked, setUnlocked] = useState<string[]>(["first_trade", "first_win", "streak_7"]);
  const list = useMemo(() => ACHIEVEMENTS.filter(a => filter === "all" || a.rarity === filter), [filter]);
  const unlock = (a: Achievement) => {
    if (unlocked.includes(a.id)) return;
    setUnlocked(u => [...u, a.id]); onXp(a.xp); sfx.levelUp();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors: [rarityColor[a.rarity], "#fff"] });
    toast(a.name, `+${a.xp} XP · ${a.desc}`, "gold");
  };
  return (
    <GameSection id="achievements" index="29" kicker="Achievements" title="Галерея достижений"
      desc="15 ачивок. Тап для демо-разблокировки." right={<Tag tone="gold">{unlocked.length}/{ACHIEVEMENTS.length}</Tag>}>
      <div className="mb-4"><ChipRow options={["all", "common", "rare", "epic", "legendary"]} value={filter} onChange={setFilter} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a, i) => {
          const on = unlocked.includes(a.id); const col = rarityColor[a.rarity];
          return (
            <motion.button key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.03 }} whileTap={{ scale: 0.97 }} onClick={() => unlock(a)}
              className={cn("panel-3d relative overflow-hidden p-4 text-left", !on && "opacity-70")}>
              <div className="flex items-start gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl" style={{ background: `${col}22` }}>{a.icon}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: col }}>{a.rarity}</p>
                  <p className="display text-sm font-extrabold text-white">{a.name}</p>
                  <p className="text-[11px] text-[#8ea6d8]">{a.desc}</p>
                  <p className="mt-1 text-[10px] font-extrabold text-[#8ef23c]">+{a.xp} XP · {on ? "UNLOCKED" : "TAP"}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="mt-5"><MagCTA tone="gold" onClick={() => ACHIEVEMENTS.forEach(a => unlock(a))}>Unlock all (demo)</MagCTA></div>
    </GameSection>
  );
}
