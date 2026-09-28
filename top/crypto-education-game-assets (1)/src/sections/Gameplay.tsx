import { useRef, useState } from "react";
import { Asset, Btn, Chip, Section, SubHead } from "../components/ui";
import { Icon, XPIcon } from "../components/icons";
import { fx, useGame } from "../lib/game";
import { sfx } from "../lib/sound";
import LessonGames from "./gameplay/Lesson";
import MiniGames from "./gameplay/MiniGames";
import Arcade from "./gameplay/Arcade";
import Strategy from "./gameplay/Strategy";
import Puzzle from "./gameplay/Puzzle";
import Mastery from "./gameplay/Mastery";
import Rewards from "./gameplay/Rewards";
import StoryMode, { MascotCoach } from "./gameplay/Story";
import { cn } from "../utils/cn";

/* =====================================================================
 * G-24 · FRIENDS QUEST — shared co-op goal, nudges, joint reward
 * ===================================================================== */
function FriendsQuest() {
  const g = useGame();
  const GOAL = 500;
  const [mine, setMine] = useState(180);
  const [hers, setHers] = useState(210);
  const [reply, setReply] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);
  const meRef = useRef<HTMLDivElement>(null);
  const herRef = useRef<HTMLDivElement>(null);
  const total = Math.min(GOAL, mine + hers);
  const done = total >= GOAL;
  const nudge = () => {
    const a = meRef.current?.getBoundingClientRect();
    const b = herRef.current?.getBoundingClientRect();
    if (a && b) {
      fx.text({ x: a.left + a.width / 2, y: a.top }, "👋", "#fff", true);
      setTimeout(() => fx.ring(herRef.current, "#ff7a2f"), 350);
    }
    sfx("whoosh");
    setTimeout(() => {
      setReply(["On it! 🔥", "Grinding now 💪", "Let's gooo 🚀"][Math.floor(Math.random() * 3)]);
      setHers((h) => Math.min(GOAL, h + 40));
      sfx("pop");
      setTimeout(() => setReply(null), 1800);
    }, 1100);
  };
  return (
    <Asset title="Friends Quest · Co-op" code="G-24" tags="friends quest coop social shared goal nudge together weekly" span={4} badge="Social">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-base font-black text-white">Earn {GOAL} XP together</div>
          <div className="text-[11px] font-bold text-ink-400">Weekly quest · 3 days left</div>
        </div>
        <Chip tone="flame">🤝 Co-op</Chip>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div ref={meRef} className="flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#6bf0c0] to-bull text-2xl shadow-[0_4px_0_#0c8f63] ring-[3px] ring-white/20">🐂</span>
          <span className="mt-1 text-[11px] font-black text-bull">You · {mine}</span>
        </div>
        <div className="relative flex-1 px-3">
          <div className="panel-inset flex h-5 overflow-hidden rounded-full">
            <div className="h-full bg-gradient-to-b from-[#5ff0bd] to-bull transition-all duration-700" style={{ width: `${(Math.min(mine, GOAL) / GOAL) * 100}%` }} />
            <div className="h-full bg-gradient-to-b from-[#ffb07a] to-flame transition-all duration-700" style={{ width: `${(Math.min(hers, GOAL - Math.min(mine, GOAL)) / GOAL) * 100}%` }} />
          </div>
          <div className="mt-1 text-center font-mono text-xs font-bold text-white">
            {total}/{GOAL}
          </div>
        </div>
        <div ref={herRef} className="relative flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-[#ffb07a] to-flame text-2xl shadow-[0_4px_0_#c24a0c] ring-[3px] ring-white/20">🐯</span>
          <span className="mt-1 text-[11px] font-black text-flame">Kate · {hers}</span>
          {reply && (
            <span className="anim-pop absolute -top-9 right-0 whitespace-nowrap rounded-xl bg-white px-2 py-1 text-[11px] font-black text-ink-900 shadow-[0_3px_0_#8ea4d2]">
              {reply}
            </span>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Btn variant="ghost" size="sm" onClick={nudge} disabled={done} sound={false}>
          👋 Nudge
        </Btn>
        <Btn
          variant="bull"
          size="sm"
          disabled={done}
          onClick={(e) => {
            setMine((m) => m + 50);
            g.reward("xp", 50, e.currentTarget);
          }}
        >
          <XPIcon size={14} /> +50
        </Btn>
      </div>
      <div className={cn("mt-3 flex items-center gap-3 rounded-2xl p-3 transition-colors", done ? "bg-gold/15 ring-1 ring-gold/40" : "bg-ink-950/40")}>
        <span className={cn("text-3xl", done && "anim-bounce-soft")}>🎁</span>
        <div className="flex-1 text-xs font-bold text-ink-200">{done ? "Quest complete! Shared chest unlocked." : "Complete to unlock a shared chest for both of you."}</div>
        {done && (
          <Btn
            variant="gold"
            size="sm"
            disabled={claimed}
            onClick={(e) => {
              setClaimed(true);
              g.reward("gems", 30, e.currentTarget);
              sfx("open");
            }}
          >
            {claimed ? <Icon name="check" size={14} stroke={3} /> : "Open"}
          </Btn>
        )}
      </div>
    </Asset>
  );
}

export default function Gameplay() {
  return (
    <Section
      id="gameplay"
      kicker="Core loop · 42 playable assets"
      title="Gameplay"
      desc="Every mini-game is wired into one shared economy: XP, coins, gems and hearts fly into your HUD dock, with sound and haptics."
    >
      <SubHead icon="book" title="Lesson mechanics" desc="Duolingo-grade exercise formats for trading literacy" tone="#3e8bff" count={7} />
      <LessonGames />
      <MascotCoach />
      <SubHead icon="grid" title="Mini-games" desc="Swipe, predict, place stops, remember and balance" tone="#22d39a" count={6} />
      <MiniGames />
      <SubHead icon="bolt" title="Arcade & battles" desc="Canvas arcade, boss fights, PvP races and live trading challenges" tone="#ff4d6d" count={4} />
      <Arcade />
      <SubHead icon="target" title="Strategy desk" desc="Draw levels, read flow, climb leverage, hunt whales, run arb" tone="#2fd4ff" count={6} />
      <Strategy />
      <SubHead icon="sparkle" title="Puzzle arcade" desc="Simon patterns, breakout, aim, snake, math sprint, jigsaw, runner" tone="#ff7a2f" count={7} />
      <Puzzle />
      <SubHead icon="medal" title="Mastery challenges" desc="Streaks, flips, sorting, timing and grid bots" tone="#ffc23d" count={5} />
      <Mastery />
      <SubHead icon="users" title="Story & social" desc="Narrative lessons and co-op goals" tone="#9170ff" count={2} />
      <StoryMode />
      <FriendsQuest />
      <SubHead icon="gift" title="Rewards & loot" desc="Spin, scratch, open, claim — dopamine done responsibly" tone="#ffc23d" count={5} />
      <Rewards />
    </Section>
  );
}
