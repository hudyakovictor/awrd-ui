/* ------------------------------------------------------------------
 * 23 · SEASON PASS — battle pass track, weekly missions, prestige
 * ------------------------------------------------------------------ */
import { Check, Crown, Lock, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Card, Meter, Tag } from "../components/ui";
import { GameSection, MagCTA, RewardBurst, type Reward } from "../fx/gamekit";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; onGems: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

const TIERS = 30;
const freeRewards = Array.from({ length: TIERS }, (_, i) => ({
  xp: 20 + i * 5,
  gem: i % 5 === 4 ? 25 : i % 3 === 2 ? 10 : 0,
  special: i === 9 ? "Rare skin" : i === 19 ? "Epic title" : i === 29 ? "Legendary bull" : null as string | null,
}));
const premiumRewards = Array.from({ length: TIERS }, (_, i) => ({
  xp: 40 + i * 8,
  gem: 15 + (i % 4) * 10,
  special: i % 10 === 9 ? "Premium exclusive" : null as string | null,
}));

const missions = [
  { t: "Complete 3 lessons", p: 2, m: 3, xp: 40 },
  { t: "Win 1 duel", p: 0, m: 1, xp: 60 },
  { t: "Survive 30s liquidation", p: 1, m: 1, xp: 50 },
  { t: "Score 10 rhythm hits", p: 6, m: 10, xp: 35 },
  { t: "Open a pack", p: 0, m: 1, xp: 25 },
  { t: "Finish Risk School", p: 0, m: 1, xp: 45 },
];

export default function SeasonPass({ onXp, onGems, toast }: Props) {
  const [sp, setSp] = useState(420); // season points
  const [claimedFree, setClaimedFree] = useState<number[]>([0, 1, 2]);
  const [claimedPrem, setClaimedPrem] = useState<number[]>([0, 1]);
  const [premium, setPremium] = useState(false);
  const [missionDone, setMissionDone] = useState<number[]>([]);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const level = Math.min(TIERS, Math.floor(sp / 100) + 1);
  const into = sp % 100;

  const claim = (i: number, prem: boolean) => {
    if (i >= level) return;
    if (prem && !premium) { toast("Premium required", "Unlock season pass", "gold"); sfx.error(); return; }
    if (prem) {
      if (claimedPrem.includes(i)) return;
      setClaimedPrem(c => [...c, i]);
      const r = premiumRewards[i];
      onXp(r.xp); onGems(r.gem);
      setRewards([{ type: "xp", amount: r.xp }, { type: "gem", amount: r.gem }]);
    } else {
      if (claimedFree.includes(i)) return;
      setClaimedFree(c => [...c, i]);
      const r = freeRewards[i];
      onXp(r.xp); if (r.gem) onGems(r.gem);
      setRewards([{ type: "xp", amount: r.xp }, ...(r.gem ? [{ type: "gem" as const, amount: r.gem }] : [])]);
    }
    setRewardOpen(true); sfx.coin(); confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const claimMission = (i: number) => {
    const m = missions[i];
    if (m.p < m.m || missionDone.includes(i)) return;
    setMissionDone(d => [...d, i]);
    setSp(s => s + m.xp);
    onXp(m.xp);
    toast(`Mission +${m.xp} SP`, m.t, "green");
    sfx.success();
  };

  return (
    <GameSection id="season" index="23" kicker="Season Pass" title="Season 4 · Bull Run"
      desc="30 тиров, free + premium дорожки, недельные миссии, прогресс SP. Клайм награды, докупи премиум."
      right={<div className="flex gap-2"><Tag tone="gold">Lvl {level}/{TIERS}</Tag><Tag tone="green">{into}/100 SP</Tag></div>}>

      <div className="panel-3d mb-5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="display text-xl font-extrabold text-white">Season level {level}</p>
            <p className="text-xs text-[#8ea6d8]">Ends in 18 days · Prestige at 30</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSp(s => s + 50); sfx.coin(); toast("+50 SP", "Debug boost", "blue"); }} className="btn3d btn3d-ghost px-4 py-2 text-[11px]">+50 SP</button>
            <button onClick={() => { setPremium(true); onGems(-0); sfx.levelUp(); confetti({ particleCount: 100, spread: 80 }); }} className={cn("btn3d px-5 py-2 text-[11px]", premium ? "btn3d-gold" : "btn3d-violet")}>
              {premium ? "Premium ✓" : "Unlock Premium"}
            </button>
          </div>
        </div>
        <div className="mt-3"><Meter value={into} max={100} tone="gold" h={14} /></div>
      </div>

      {/* track */}
      <div className="no-scrollbar mb-5 flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: TIERS }, (_, i) => {
          const unlocked = i < level;
          const freeC = claimedFree.includes(i);
          const premC = claimedPrem.includes(i);
          return (
            <div key={i} className="w-[88px] shrink-0">
              <p className="mb-1 text-center text-[10px] font-extrabold text-[#7d92c4]">{i + 1}</p>
              <button onClick={() => claim(i, false)} disabled={!unlocked || freeC}
                className={cn("mb-2 flex h-[72px] w-full flex-col items-center justify-center rounded-2xl border-2 text-[10px] font-extrabold",
                  freeC ? "border-[#8ef23c] bg-[#8ef23c]/15 text-[#a4ff5e]" : unlocked ? "border-white/20 bg-black/30 text-white" : "border-white/10 bg-black/20 text-[#54678f]")}>
                {!unlocked ? <Lock size={14} /> : freeC ? <Check size={16} /> : freeRewards[i].special ? <Sparkles size={16} className="text-[#ffc531]" /> : <Zap size={14} className="text-[#8ef23c]" />}
                <span className="mt-1">{freeC ? "Claimed" : freeRewards[i].special ? freeRewards[i].special!.slice(0, 10) : `+${freeRewards[i].xp}`}</span>
              </button>
              <button onClick={() => claim(i, true)} disabled={!unlocked || premC}
                className={cn("flex h-[72px] w-full flex-col items-center justify-center rounded-2xl border-2 text-[10px] font-extrabold",
                  !premium ? "border-[#a78bff]/30 bg-[#a78bff]/5 text-[#a78bff]/60" :
                  premC ? "border-[#ffc531] bg-[#ffc531]/15 text-[#ffd76a]" : unlocked ? "border-[#a78bff]/50 bg-[#a78bff]/15 text-[#c9b6ff]" : "border-white/10 bg-black/20 text-[#54678f]")}>
                {!premium || !unlocked ? <Lock size={14} /> : premC ? <Check size={16} /> : <Crown size={14} className="text-[#ffc531]" />}
                <span className="mt-1">{premC ? "Claimed" : `+${premiumRewards[i].xp}`}</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Weekly Missions" sub="Reset in 4d 12h">
          <div className="space-y-2">
            {missions.map((m, i) => {
              const done = m.p >= m.m;
              const claimed = missionDone.includes(i);
              return (
                <div key={m.t} className="panel-inset flex items-center gap-3 p-3">
                  <div className="flex-1">
                    <p className="text-xs font-extrabold text-white">{m.t}</p>
                    <Meter value={m.p} max={m.m} tone={done ? "green" : "blue"} h={8} />
                    <p className="mt-1 text-[10px] text-[#8ea6d8]">{m.p}/{m.m} · +{m.xp} SP</p>
                  </div>
                  <button disabled={!done || claimed} onClick={() => claimMission(i)}
                    className={cn("btn3d px-4 py-2.5 text-[10px]", done && !claimed ? "btn3d-gold" : "btn3d-ghost opacity-60")}>
                    {claimed ? "Done" : done ? "Claim" : "…"}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
        <Card title="Prestige & Perks" sub="At level 30">
          <div className="space-y-3">
            {[
              { t: "XP Boost 1.25×", d: "All modes", c: "#8ef23c" },
              { t: "Extra daily chest", d: "Once per day", c: "#ffc531" },
              { t: "Diamond frame", d: "Profile badge", c: "#5b8cff" },
              { t: "Season title", d: "Bull Run Legend", c: "#a78bff" },
            ].map(p => (
              <div key={p.t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2.5">
                <span className="h-3 w-3 rounded-full" style={{ background: p.c, boxShadow: `0 0 10px ${p.c}` }} />
                <div className="flex-1"><p className="text-xs font-extrabold text-white">{p.t}</p><p className="text-[10px] text-[#7d92c4]">{p.d}</p></div>
                <Lock size={14} className="text-[#54678f]" />
              </div>
            ))}
            <MagCTA tone="gold" onClick={() => { setSp(3000); toast("Maxed SP", "Debug", "gold"); }}>Fill season (demo)</MagCTA>
          </div>
        </Card>
      </div>
      <RewardBurst open={rewardOpen} rewards={rewards} title="Season reward" onClose={() => setRewardOpen(false)} />
    </GameSection>
  );
}
