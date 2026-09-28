import { motion } from "framer-motion";
import { Crown, Flame, Gem, Gift, Heart, Lock, Medal, ShieldCheck, Snowflake, Swords, Target, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Card, Meter, SectionShell, Tag } from "../components/ui";
import { cn } from "../utils/cn";

const league = [
  { n: "CryptoQueen", xp: 4820, you: false, a: "CQ", c: "#ff5470" },
  { n: "Satoshi_Fan", xp: 4610, you: false, a: "SF", c: "#5b8cff" },
  { n: "YOU · BullRunner", xp: 4380, you: true, a: "YO", c: "#8ef23c" },
  { n: "HodlMaster", xp: 4210, you: false, a: "HM", c: "#ffc531" },
  { n: "DegenHunter", xp: 3980, you: false, a: "DH", c: "#a78bff" },
  { n: "ChartWizard", xp: 3650, you: false, a: "CW", c: "#2ede8a" },
];

const badges = [
  { n: "First Long", d: "Открой первую сделку", i: TrendingUp, r: "common", un: false, p: 100 },
  { n: "7-Day Streak", d: "Учись 7 дней подряд", i: Flame, r: "rare", un: false, p: 100 },
  { n: "Risk Master", d: "10 стопов по плану", i: ShieldCheck, r: "epic", un: false, p: 100 },
  { n: "Whale Hunter", d: "Поймай движение кита", i: Target, r: "epic", un: false, p: 100 },
  { n: "Paper Legend", d: "50 прибыльных сделок", i: Medal, r: "legendary", un: true, p: 68 },
  { n: "Duel King", d: "Выиграй 25 дуэлей", i: Swords, r: "legendary", un: true, p: 32 },
];

const quests = [
  { t: "Пройди 2 урока", p: 2, m: 2, xp: 40, done: true },
  { t: "Открой 3 сделки в симуляторе", p: 1, m: 3, xp: 30, done: false },
  { t: "Выиграй дуэль", p: 0, m: 1, xp: 60, done: false },
];

const shop = [
  { n: "Streak Freeze", d: "Сохранит серию", pr: 200, i: Snowflake, c: "#5b8cff" },
  { n: "Hearts Refill", d: "+5 сердец", pr: 150, i: Heart, c: "#ff5470" },
  { n: "2× XP Boost", d: "На 24 часа", pr: 300, i: Zap, c: "#8ef23c" },
];

export default function Gamification({ xp, gems, setGems, onXp, onToast }: {
  xp: number; gems: number; setGems: (n: number) => void; onXp: (n: number) => void; onToast: (t: string, s: string, tone: string) => void;
}) {
  const [claimed, setClaimed] = useState<number[]>([]);
  const [chest, setChest] = useState<"closed" | "opening" | "open">("closed");
  const [bought, setBought] = useState<string[]>([]);
  const level = Math.floor(xp / 500) + 1;
  const inLevel = xp % 500;

  const openChest = () => {
    if (chest !== "closed") return;
    setChest("opening");
    setTimeout(() => {
      setChest("open");
      confetti({ particleCount: 140, spread: 100, origin: { y: .6 }, colors: ["#ffc531", "#8ef23c", "#ff5470", "#5b8cff", "#fff"] });
      onXp(100); setGems(gems + 50);
    }, 900);
  };

  return (
    <SectionShell id="game" index="05" kicker="Gamification" title="Лиги, квесты и награды" desc="Кликни сундук, забери квесты, купи заморозку серии. Всё начисляет настоящий XP и гемы в шапке."
      right={<Tag tone="gold"><Crown size={11} /> Diamond League</Tag>}>
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Level + chest */}
        <div className="flex flex-col gap-5">
          <Card title={`Level ${level} · Bull Trader`} sub="До следующего уровня" action={<Tag tone="green">+{inLevel}/500</Tag>}>
            <div className="flex items-center gap-4">
              <div className="relative h-[110px] w-[110px] shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx={50} cy={50} r={42} fill="none" stroke="#0a1740" strokeWidth={11} />
                  <motion.circle cx={50} cy={50} r={42} fill="none" stroke="url(#lvg)" strokeWidth={11} strokeLinecap="round"
                    strokeDasharray={264} initial={false} animate={{ strokeDashoffset: 264 - (264 * inLevel) / 500 }} transition={{ type: "spring", stiffness: 60, damping: 18 }} />
                  <defs><linearGradient id="lvg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b6ff7d" /><stop offset="1" stopColor="#5cbf1c" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="display text-2xl font-extrabold text-white">{level}</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#8ef23c]">level</span>
                </div>
              </div>
              <div className="flex-1">
                <Meter value={inLevel} max={500} tone="green" h={14} />
                <p className="num-mono mt-2 text-xs text-[#8ea6d8]">Total <b className="text-white">{xp.toLocaleString()} XP</b></p>
                <button onClick={() => { onXp(50); onToast("+50 XP", "Бонус за активность", "green"); }} className="btn3d btn3d-green mt-2 w-full py-2.5 text-[11px]">Farm +50 XP</button>
              </div>
            </div>
          </Card>
          <Card title="Daily Chest" sub={chest === "open" ? "Открыт · +100 XP +50 gems" : "Tap to open"} action={<Tag tone="gold">free</Tag>}>
            <button onClick={openChest} className="mx-auto block">
              <motion.div animate={chest === "opening" ? { rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.12, 1] } : chest === "open" ? { scale: 1.05 } : { y: [0, -6, 0] }}
                transition={chest === "opening" ? { duration: .9 } : { duration: 2, repeat: Infinity }}>
                <Gift size={72} className={chest === "open" ? "text-[#8ef23c]" : "text-[#ffc531]"} style={{ filter: "drop-shadow(0 0 24px rgba(255,197,49,.55))" }} strokeWidth={1.4} />
              </motion.div>
              <span className={cn("btn3d mt-2 px-6 py-2.5 text-[11px]", chest === "open" ? "btn3d-ghost" : "btn3d-gold")}>
                {chest === "closed" ? "Open chest" : chest === "opening" ? "Opening…" : "Claimed ✓"}
              </span>
            </button>
          </Card>
        </div>

        {/* League */}
        <Card title="Diamond League" sub="Неделя 12 · топ-3 переходят выше" pad={false}
          action={<span className="flex items-center gap-1 text-[11px] font-extrabold text-[#8ea6d8]"><Gem size={13} className="text-[#5b8cff]" /> {gems}</span>}>
          <div className="flex items-end justify-center gap-3 px-5 pt-5">
            {[league[1], league[0], league[3]].map((p, i) => (
              <div key={p.n} className={cn("flex flex-col items-center", i === 1 && "-mt-3")}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 text-sm font-black"
                  style={{ background: `${p.c}25`, color: p.c, boxShadow: "0 4px 0 #030816" }}>{p.a}</div>
                <div className={cn("mt-2 w-20 rounded-t-xl border border-b-0 border-white/15 text-center", i === 1 ? "h-20 bg-gradient-to-b from-[#ffd76a]/40 to-transparent" : "h-14 bg-white/5")}>
                  <p className="mt-1.5 text-sm font-black text-white">{i === 1 ? "1" : i === 0 ? "2" : "4"}</p>
                  <p className="num-mono text-[10px] text-[#8ea6d8]">{p.xp}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 p-4">
            {league.map((p, i) => (
              <motion.div layout key={p.n} className={cn("flex items-center gap-3 rounded-2xl border px-3 py-2",
                p.you ? "border-[#8ef23c]/50 bg-[#8ef23c]/10" : "border-white/8 bg-white/[.02]")}>
                <span className={cn("w-5 text-center text-xs font-black", i < 3 ? "text-[#ffc531]" : "text-[#54678f]")}>{i + 1}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black" style={{ background: `${p.c}25`, color: p.c }}>{p.a}</span>
                <span className={cn("flex-1 text-xs font-extrabold", p.you ? "text-[#a4ff5e]" : "text-white")}>{p.n}</span>
                <span className="num-mono text-xs font-bold text-[#8ea6d8]">{p.xp.toLocaleString()} XP</span>
                {p.you && <Tag tone="green">you</Tag>}
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Quests + badges + shop */}
        <div className="flex flex-col gap-5">
          <Card title="Daily Quests" sub="Обновление через 04:12:33">
            <div className="space-y-2.5">
              {quests.map((qt, i) => {
                const done = qt.p >= qt.m;
                const isClaimed = claimed.includes(i);
                return (
                  <div key={i} className="panel-inset flex items-center gap-3 p-3">
                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-white">{qt.t}</p>
                      <Meter value={qt.p} max={qt.m} tone={done ? "green" : "blue"} h={8} />
                      <p className="mt-1 text-[10px] font-bold text-[#8ea6d8]">{qt.p}/{qt.m} · +{qt.xp} XP</p>
                    </div>
                    <button disabled={!done || isClaimed} onClick={() => { setClaimed([...claimed, i]); onXp(qt.xp); confetti({ particleCount: 50, spread: 55, origin: { y: .7 } }); }}
                      className={cn("btn3d px-4 py-2.5 text-[10px]", done && !isClaimed ? "btn3d-gold" : "btn3d-ghost opacity-60")}>
                      {isClaimed ? "Done ✓" : done ? "Claim" : "Locked"}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="Achievements" sub="Tap badge · rarity glow">
            <div className="grid grid-cols-3 gap-2">
              {badges.map((b, i) => (
                <motion.button key={i} whileHover={{ y: -4 }} whileTap={{ scale: .92 }} onClick={() => onToast(b.n, b.d, b.un ? "ghost" : "gold")}
                  className={cn("relative flex flex-col items-center gap-1 rounded-2xl border p-2.5",
                    b.r === "legendary" ? "border-[#ffc531]/40 bg-[#ffc531]/8" : b.r === "epic" ? "border-[#a78bff]/40 bg-[#a78bff]/8" : b.r === "rare" ? "border-[#5b8cff]/40 bg-[#5b8cff]/8" : "border-white/12 bg-white/[.03]",
                    b.un && "opacity-75")}>
                  {b.un && <Lock size={11} className="absolute right-1.5 top-1.5 text-[#54678f]" />}
                  <b.i size={22} className={b.un ? "text-[#54678f]" : b.r === "legendary" ? "text-[#ffc531]" : b.r === "epic" ? "text-[#a78bff]" : b.r === "rare" ? "text-[#5b8cff]" : "text-[#8ef23c]"} />
                  <p className="text-[10px] font-extrabold leading-tight text-white">{b.n}</p>
                  {b.un && <div className="h-1 w-full overflow-hidden rounded-full bg-black/50"><div className="h-full rounded-full bg-[#ffc531]" style={{ width: `${b.p}%` }} /></div>}
                </motion.button>
              ))}
            </div>
          </Card>
          <Card title="Shop" sub="Трать гемы · баланс в шапке">
            <div className="space-y-2">
              {shop.map(s => (
                <div key={s.n} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${s.c}20`, color: s.c }}><s.i size={17} /></span>
                  <div className="flex-1"><p className="text-xs font-extrabold text-white">{s.n}</p><p className="text-[10px] text-[#7d92c4]">{s.d}</p></div>
                  <button disabled={bought.includes(s.n) || gems < s.pr} onClick={() => { setGems(gems - s.pr); setBought([...bought, s.n]); onToast(s.n + " куплен", "Применено к аккаунту", "blue"); }}
                    className={cn("btn3d px-3 py-2 text-[10px]", bought.includes(s.n) ? "btn3d-green" : "btn3d-blue")}>
                    {bought.includes(s.n) ? "Owned" : <><Gem size={11} /> {s.pr}</>}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}
