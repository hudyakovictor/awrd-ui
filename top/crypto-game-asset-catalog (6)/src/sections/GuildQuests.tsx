import { useState } from "react";
import { Asset, Badge, Bar, Btn3D, Section } from "../components/ui";
import { Glyph } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstCoins, celebrate, flash, shake } from "../utils/fx";

/* =========================================================
   1. GUILD CLAN RAID BOSS — "THE GREAT BEAR WHALE"
   ========================================================= */
function RaidBoss() {
  const [bossHp, setBossHp] = useState(84000);
  const maxHp = 100000;
  const [damagePop, setDamagePop] = useState<{ id: number; dmg: number; crit: boolean }[]>([]);
  const [rageMode, setRageMode] = useState(false);

  const attack = (type: "scalp" | "swing" | "liquidation") => {
    let baseDmg = type === "scalp" ? 2400 : type === "swing" ? 6800 : 18500;
    const isCrit = Math.random() > 0.65;
    if (isCrit) baseDmg = Math.floor(baseDmg * 1.8);

    setBossHp((prev) => {
      const next = Math.max(0, prev - baseDmg);
      if (next <= maxHp * 0.3 && !rageMode) {
        setRageMode(true);
        shake("hard");
        flash("rgba(255, 77, 106, 0.4)");
      }
      if (next === 0) {
        celebrate();
        fanfare();
      }
      return next;
    });

    const id = Date.now() + Math.random();
    setDamagePop((prev) => [...prev.slice(-4), { id, dmg: baseDmg, crit: isCrit }]);
    setTimeout(() => {
      setDamagePop((prev) => prev.filter((p) => p.id !== id));
    }, 900);

    if (isCrit) {
      sfx.levelUp();
      shake("soft");
      haptic([30, 40]);
    } else {
      sfx.tap();
      haptic(10);
    }
  };

  const hpPct = (bossHp / maxHp) * 100;

  return (
    <Asset title="Clan Raid Boss: Bear Whale" id="gld.boss" desc="Кооперативный рейд клана: общий урон по Медвежьему Киту, криты с вылетающими цифрами, фаза ярости при HP < 30%." className="lg:col-span-2" tags={["RAID"]}>
      <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-b from-[#1c0f2b] via-[#0f1b3f] to-[#070d1f] border border-white/10">
        {/* Boss visual arena */}
        <div className="relative h-48 flex flex-col items-center justify-center">
          <div className="relative">
            <div className={cn("size-32 rounded-full grid place-items-center transition-transform", rageMode && "animate-pulse scale-110")}>
              <Glyph name="rocket" size={96} dim={bossHp === 0} />
            </div>
            {rageMode && bossHp > 0 && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-extrabold text-bear uppercase tracking-wider bg-black/60 rounded-full px-2 py-0.5 border border-bear animate-bounce">
                RAGE MODE (ENRAGED)
              </span>
            )}
            {/* Flying damage text */}
            {damagePop.map((p) => (
              <span
                key={p.id}
                className={cn(
                  "absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none font-extrabold num text-[18px]",
                  p.crit ? "text-gold text-[24px]" : "text-bear"
                )}
                style={{ animation: "damage-pop 0.9s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards" }}
              >
                {p.crit ? `CRIT! -${p.dmg}` : `-${p.dmg}`}
              </span>
            ))}
          </div>

          {/* Boss HP Bar */}
          <div className="w-full max-w-sm mt-3">
            <div className="flex justify-between items-center text-[11px] font-extrabold mb-1">
              <span className={rageMode ? "text-bear" : "text-txt"}>The Great Bear Whale</span>
              <span className="num text-mute">{bossHp.toLocaleString()} / {maxHp.toLocaleString()} HP</span>
            </div>
            <Bar value={hpPct} tone={rageMode ? "bear" : "bull"} h={14} striped={rageMode} />
          </div>
        </div>

        {/* Attack buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <Btn3D size="sm" variant="bull" onClick={() => attack("scalp")}>Scalp Attack</Btn3D>
          <Btn3D size="sm" variant="gold" onClick={() => attack("swing")}>Swing Strike</Btn3D>
          <Btn3D size="sm" variant="bear" onClick={() => attack("liquidation")}>Liquidation nuke</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. SKILL CONSTELLATION / TALENT TREE
   ========================================================= */
type Talent = { id: string; name: string; x: number; y: number; req?: string; icon: string; unlocked: boolean };

function TalentTree() {
  const [talents, setTalents] = useState<Talent[]>([
    { id: "root", name: "Market Sense", x: 150, y: 190, icon: "target", unlocked: true },
    { id: "candles", name: "Wick Reading", x: 80, y: 130, req: "root", icon: "candles", unlocked: true },
    { id: "rsi", name: "Momentum", x: 220, y: 130, req: "root", icon: "chart", unlocked: false },
    { id: "fib", name: "Golden Ratio", x: 80, y: 50, req: "candles", icon: "star", unlocked: false },
    { id: "whale", name: "Whale Radar", x: 220, y: 50, req: "rsi", icon: "crown", unlocked: false },
    { id: "master", name: "Alpha Grandmaster", x: 150, y: 20, req: "fib", icon: "gem", unlocked: false },
  ]);

  const [points, setPoints] = useState(3);

  const unlock = (t: Talent) => {
    if (t.unlocked) return;
    if (points <= 0) {
      sfx.error();
      haptic(10);
      return;
    }
    const parent = talents.find((x) => x.id === t.req);
    if (parent && !parent.unlocked) {
      sfx.error();
      haptic(10);
      return;
    }
    setTalents((prev) => prev.map((item) => (item.id === t.id ? { ...item, unlocked: true } : item)));
    setPoints((p) => p - 1);
    sfx.success();
    haptic(15);
  };

  return (
    <Asset title="Skill Constellation Tree" id="gld.tree" desc="Созвездие талантов трейдера: связанные ветки навыков, открытие разблокирует следующие уровни в созвездии." className="lg:col-span-1" tags={["TREE"]}>
      <div className="relative h-[240px] inset !rounded-3xl overflow-hidden p-2">
        <svg viewBox="0 0 300 220" className="w-full h-full">
          {/* Connector lines */}
          {talents.map((t) => {
            if (!t.req) return null;
            const parent = talents.find((x) => x.id === t.req);
            if (!parent) return null;
            const active = t.unlocked && parent.unlocked;
            return (
              <line
                key={`${parent.id}-${t.id}`}
                x1={parent.x}
                y1={parent.y}
                x2={t.x}
                y2={t.y}
                stroke={active ? "#1fdb8b" : "#22366f"}
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={active ? undefined : "4 4"}
              />
            );
          })}

          {/* Talent nodes */}
          {talents.map((t) => (
            <g
              key={t.id}
              onClick={() => unlock(t)}
              className="cursor-pointer"
              transform={`translate(${t.x}, ${t.y})`}
            >
              <circle
                r={16}
                fill={t.unlocked ? "#1fdb8b" : "#0f1b3f"}
                stroke={t.unlocked ? "#ffffff" : "#3d7bff"}
                strokeWidth={2}
              />
              <text textAnchor="middle" y={4} fill={t.unlocked ? "#03261a" : "#8e9cc8"} fontSize={9} fontWeight="800">
                ★
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-2 left-3 text-[10.5px] font-extrabold text-mute flex items-center gap-1">
          <span>Очков навыков:</span>
          <span className="num text-gold font-extrabold">{points} SP</span>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. MYSTERY GACHA SUMMONING PORTAL
   ========================================================= */
function GachaPortal() {
  const [summoning, setSummoning] = useState(false);
  const [summonResults, setSummonResults] = useState<{ id: number; name: string; rarity: string; color: string }[]>([]);

  const pull = (count: 1 | 10) => {
    if (summoning) return;
    setSummoning(true);
    setSummonResults([]);
    sfx.whoosh();
    haptic([20, 40]);

    setTimeout(() => {
      const pool = [
        { name: "Common ETH Bull", rarity: "Common", color: "#8e9cc8" },
        { name: "Rare Satoshi Rune", rarity: "Rare", color: "#3d7bff" },
        { name: "Epic Whale Fin", rarity: "Epic", color: "#8d5cff" },
        { name: "Legendary Golden Horn", rarity: "Legendary", color: "#ffc53d" },
      ];
      const res = Array.from({ length: count }, (_, i) => {
        const item = pool[Math.random() > 0.85 ? 3 : Math.random() > 0.6 ? 2 : Math.random() > 0.3 ? 1 : 0];
        return { id: i, ...item };
      });

      setSummonResults(res);
      setSummoning(false);

      if (res.some((r) => r.rarity === "Legendary")) {
        celebrate();
        fanfare();
      } else {
        sfx.success();
      }
    }, 1400);
  };

  return (
    <Asset title="Gacha Summoning Portal" id="gld.gacha" desc="Анимация портала призыва: магический круговой круг рун, золотая вспышка и карточки результатов призыва." className="lg:col-span-2" tags={["GACHA"]}>
      <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-b from-[#240e3f] via-[#101438] to-[#070d1f] border border-white/10 min-h-[220px] flex flex-col items-center justify-center">
        {/* Portal rings */}
        <div className="relative size-36 grid place-items-center mb-3">
          <div
            className={cn("absolute inset-0 rounded-full border-2 border-dashed border-violet/50", summoning && "animate-spin")}
            style={{ animationDuration: summoning ? "1.5s" : "12s" }}
          />
          <div
            className={cn("absolute inset-4 rounded-full border-2 border-dashed border-cyan/60", summoning && "animate-spin")}
            style={{ animationDirection: "reverse", animationDuration: summoning ? "1s" : "8s" }}
          />
          <Glyph name="gem" size={54} className={summoning ? "animate-bounce" : "anim-float"} />
        </div>

        {/* Results grid */}
        {summonResults.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {summonResults.map((r) => (
              <div key={r.id} className="raised px-2.5 py-1.5 rounded-xl text-center anim-scale" style={{ borderColor: r.color }}>
                <span className="text-[10px] font-extrabold uppercase block" style={{ color: r.color }}>
                  {r.rarity}
                </span>
                <span className="text-[11px] font-bold text-txt">{r.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 w-full max-w-xs">
          <Btn3D size="sm" variant="violet" full loading={summoning} onClick={() => pull(1)}>
            Summon 1x
          </Btn3D>
          <Btn3D size="sm" variant="gold" full loading={summoning} onClick={() => pull(10)}>
            Summon 10x
          </Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   4. DEFI STAKING VAULT
   ========================================================= */
function StakingVault() {
  const [stakeAmount, setStakeAmount] = useState(2500);
  const [harvested, setHarvested] = useState(false);
  const apy = 18.4;

  const harvest = () => {
    setHarvested(true);
    sfx.coin();
    haptic([15, 30]);
    burstCoins(innerWidth / 2, innerHeight / 2, 12);
    setTimeout(() => setHarvested(false), 1600);
  };

  const dailyYield = ((stakeAmount * (apy / 100)) / 365).toFixed(2);

  return (
    <Asset title="DeFi Staking Vault" id="gld.vault" desc="Хранилище стейкинга с компаундингом: регулируйте сумму депозита, мгновенный расчёт дневного дохода и сбор урожая." className="lg:col-span-1" tags={["STAKING"]}>
      <div className="inset !rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center text-[11px] font-bold text-mute">
          <span>Staked Balance</span>
          <Badge tone="bull" size="xs">APY {apy}%</Badge>
        </div>
        <div className="num text-[26px] font-extrabold text-gold">${stakeAmount.toLocaleString()}</div>

        <input
          type="range"
          min="500"
          max="10000"
          step="250"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(+e.target.value)}
          className="w-full accent-gold"
        />

        <div className="flex justify-between items-center text-[11.5px] font-bold">
          <span className="text-dim">Est. Daily Yield:</span>
          <span className="num text-bull">+${dailyYield} USDT</span>
        </div>

        <Btn3D size="xs" variant="gold" full loading={harvested} onClick={harvest}>
          {harvested ? "Harvested!" : "Harvest Yield"}
        </Btn3D>
      </div>
    </Asset>
  );
}

export default function GuildQuests() {
  return (
    <Section id="guildquests" index="16" title="Guild Quests & Raids" subtitle="4 социальные и экономические механики: клановый босс Медвежий Кит, дерево талантов созвездия, призыв Гача, хранилище стейкинга" count={4}>
      <div className="grid lg:grid-cols-3 gap-6">
        <RaidBoss />
        <TalentTree />
        <GachaPortal />
        <StakingVault />
      </div>
    </Section>
  );
}
