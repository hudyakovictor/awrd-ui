import { useState } from "react";
import { Asset, Badge, Bar, Btn3D, Section } from "../components/ui";
import { Glyph } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstRing, burstSparks, celebrate, flash, shake } from "../utils/fx";

type BattleCard = {
  id: string;
  name: string;
  cost: number;
  attack: number;
  defense: number;
  type: "attack" | "defense" | "special";
  desc: string;
  color: string;
  glyph: "bolt" | "shield" | "flame" | "crown" | "star" | "gem";
};

const CARDS_DECK: BattleCard[] = [
  {
    id: "c1",
    name: "Golden Cross",
    cost: 3,
    attack: 28,
    defense: 5,
    type: "attack",
    desc: "MA(50) пересекает MA(200) вверх. Мощный бычий импульс.",
    color: "#ffc53d",
    glyph: "star",
  },
  {
    id: "c2",
    name: "Diamond Shield",
    cost: 2,
    attack: 0,
    defense: 30,
    type: "defense",
    desc: "Поглощает следующий удар медвежьего дампа целиком.",
    color: "#2ed3f0",
    glyph: "shield",
  },
  {
    id: "c3",
    name: "Whale Pump",
    cost: 4,
    attack: 42,
    defense: 0,
    type: "attack",
    desc: "Крупная рыночная покупка пробивает сопротивление.",
    color: "#1fdb8b",
    glyph: "crown",
  },
  {
    id: "c4",
    name: "Funding Squeeze",
    cost: 2,
    attack: 20,
    defense: 10,
    type: "special",
    desc: "Ликвидация шортистов разгоняет цену ещё выше.",
    color: "#8d5cff",
    glyph: "flame",
  },
  {
    id: "c5",
    name: "Halving Boost",
    cost: 3,
    attack: 25,
    defense: 15,
    type: "special",
    desc: "Дефицит предложения удваивает следующий ход.",
    color: "#ff8a3d",
    glyph: "bolt",
  },
  {
    id: "c6",
    name: "Liquidity Vamp",
    cost: 3,
    attack: 30,
    defense: 0,
    type: "attack",
    desc: "Высасывает ликвидность из стакана: восстанавливает 15 HP.",
    color: "#ff4d6a",
    glyph: "flame",
  },
  {
    id: "c7",
    name: "Death Cross Trap",
    cost: 2,
    attack: 18,
    defense: 12,
    type: "defense",
    desc: "Ложный медвежий сигнал ловит шортистов в ловушку.",
    color: "#2ed3f0",
    glyph: "shield",
  },
  {
    id: "c8",
    name: "Fibonacci Retrace",
    cost: 1,
    attack: 12,
    defense: 18,
    type: "special",
    desc: "Отскок от Golden Pocket 0.618 возвращает 2 энергии.",
    color: "#ffc53d",
    glyph: "gem",
  },
  {
    id: "c9",
    name: "Bull Flag Runner",
    cost: 4,
    attack: 48,
    defense: 0,
    type: "attack",
    desc: "Взрывной импульс после консолидации флага.",
    color: "#1fdb8b",
    glyph: "crown",
  },
  {
    id: "c10",
    name: "Slippage Armor",
    cost: 2,
    attack: 5,
    defense: 25,
    type: "defense",
    desc: "Защита от проскальзывания и резких ценовых сквизов.",
    color: "#8d5cff",
    glyph: "shield",
  },
  {
    id: "c11",
    name: "Genesis Block",
    cost: 5,
    attack: 60,
    defense: 20,
    type: "special",
    desc: "Первый блок Сатоши Накамото. Абсолютный ультимейт.",
    color: "#ffdc7a",
    glyph: "star",
  },
];

export default function BattleCards() {
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [energy, setEnergy] = useState(6);
  const [maxEnergy] = useState(6);
  const [playerShield, setPlayerShield] = useState(0);
  const [enemyShield, setEnemyShield] = useState(10);
  const [hand, setHand] = useState<BattleCard[]>(() => CARDS_DECK.slice(0, 3));
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [combatLog, setCombatLog] = useState<string[]>(["Битва началась! Ваш ход."]);
  const [victory, setVictory] = useState<boolean | null>(null);

  const playCard = (card: BattleCard) => {
    if (turn !== "player" || energy < card.cost || victory !== null) {
      sfx.error();
      haptic(10);
      return;
    }

    setEnergy((prev) => prev - card.cost);
    sfx.whoosh();
    haptic(15);

    // Apply card effects
    if (card.attack > 0) {
      let dmg = card.attack;
      if (enemyShield > 0) {
        const absorbed = Math.min(enemyShield, dmg);
        setEnemyShield((s) => s - absorbed);
        dmg -= absorbed;
      }
      setEnemyHp((hp) => {
        const next = Math.max(0, hp - dmg);
        if (next === 0) {
          setVictory(true);
          celebrate();
          fanfare();
        }
        return next;
      });
      burstSparks(innerWidth / 2, innerHeight / 3, 16, card.color);
    }

    if (card.defense > 0) {
      setPlayerShield((s) => s + card.defense);
      burstRing(innerWidth / 2, innerHeight / 2, "#2ed3f0");
    }

    setCombatLog((prev) => [`Вы сыграли ${card.name} (-${card.attack} HP, +${card.defense} Щит)`, ...prev.slice(0, 3)]);

    // Remove from hand and draw replacement
    setHand((prev) => {
      const remaining = prev.filter((c) => c.id !== card.id);
      const nextCard = CARDS_DECK[Math.floor(Math.random() * CARDS_DECK.length)];
      return [...remaining, nextCard];
    });

    sfx.success();
  };

  const endTurn = () => {
    if (turn !== "player" || victory !== null) return;
    setTurn("enemy");
    sfx.tap();
    setCombatLog((prev) => ["Ход Медведя…", ...prev]);

    setTimeout(() => {
      // Enemy turn AI
      const enemyDmg = Math.floor(Math.random() * 22 + 10);
      let actualDmg = enemyDmg;

      if (playerShield > 0) {
        const absorbed = Math.min(playerShield, actualDmg);
        setPlayerShield((s) => s - absorbed);
        actualDmg -= absorbed;
      }

      setPlayerHp((hp) => {
        const next = Math.max(0, hp - actualDmg);
        if (next === 0) {
          setVictory(false);
          shake("hard");
          flash();
        }
        return next;
      });

      shake("soft");
      sfx.error();
      haptic([30, 40]);

      setCombatLog((prev) => [`Медведь нанёс ${enemyDmg} урона!`, ...prev.slice(0, 3)]);
      setEnergy(maxEnergy);
      setTurn("player");
    }, 1200);
  };

  const restartBattle = () => {
    setPlayerHp(100);
    setEnemyHp(100);
    setPlayerShield(0);
    setEnemyShield(10);
    setEnergy(6);
    setVictory(null);
    setTurn("player");
    setHand(CARDS_DECK.slice(0, 3));
    setCombatLog(["Новая битва началась!"]);
    sfx.whoosh();
  };

  return (
    <Section id="battlecards" index="22" title="Crypto Battle Card Strategy" subtitle="Карточный пошаговый баттлер: энергия ходов, комбо атаки и защиты, щиты против медвежьего дампа" count={3}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Battle Arena */}
        <Asset title="Turn-Based Strategy Arena" id="card.arena" desc="Сражение картами торговых сетапов: разыгрывайте Golden Cross или Whale Pump за ману, поглощайте дампы алмазным щитом." className="lg:col-span-2" tags={["CARDS"]}>
          {/* Enemy Stage */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#240e1f] to-[#0f1b3f] border border-bear/30 mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-extrabold text-[13px] text-bear flex items-center gap-1.5">
                <Glyph name="flame" size={16} /> Market Bear AI
              </span>
              <div className="flex items-center gap-2">
                {enemyShield > 0 && <Badge tone="cyan" size="xs">Щит {enemyShield}</Badge>}
                <span className="num font-extrabold text-[12px]">{enemyHp} / 100 HP</span>
              </div>
            </div>
            <Bar value={enemyHp} tone="bear" h={10} />
          </div>

          {/* Combat Log */}
          <div className="inset !rounded-xl p-2.5 mb-4 text-[11px] font-semibold text-mute space-y-0.5">
            {combatLog.map((log, i) => (
              <div key={i} className={cn("anim-fade", i === 0 && "text-txt font-bold")}>
                › {log}
              </div>
            ))}
          </div>

          {/* Player Hand Cards */}
          <div className="grid sm:grid-cols-3 gap-2.5 mb-4">
            {hand.map((c) => {
              const canPlay = energy >= c.cost && turn === "player" && victory === null;
              return (
                <button
                  key={c.id + c.name}
                  disabled={!canPlay}
                  onClick={() => playCard(c)}
                  className={cn(
                    "rounded-2xl p-3 text-left flex flex-col justify-between border-2 transition-all select-none min-h-[140px]",
                    canPlay
                      ? "hover:-translate-y-1.5 hover:shadow-xl active:translate-y-0"
                      : "opacity-40 grayscale cursor-not-allowed",
                    "shadow-[0_4px_0_rgba(0,0,0,0.5)]"
                  )}
                  style={{
                    background: `linear-gradient(160deg, ${c.color}25, #0a1330)`,
                    borderColor: `${c.color}66`,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="size-6 rounded-full bg-blue text-white grid place-items-center font-extrabold text-[11px] shadow">
                      {c.cost}⚡
                    </span>
                    <Glyph name={c.glyph} size={22} />
                  </div>

                  <div>
                    <span className="font-extrabold text-[13px] block text-txt">{c.name}</span>
                    <span className="text-[10px] text-mute line-clamp-2 mt-0.5 leading-snug">{c.desc}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-white/10 text-[10px] font-extrabold">
                    {c.attack > 0 && <span className="text-bear">⚔ {c.attack}</span>}
                    {c.defense > 0 && <span className="text-bull">🛡 {c.defense}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Player Status Bar */}
          <div className="rounded-2xl p-4 bg-gradient-to-b from-[#0f2b24] to-[#0f1b3f] border border-bull/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-[13px] text-bull flex items-center gap-1.5">
                  <Glyph name="shield" size={16} /> Bull Trader (You)
                </span>
                <div className="flex items-center gap-2">
                  {playerShield > 0 && <Badge tone="cyan" size="xs">Щит {playerShield}</Badge>}
                  <span className="num font-extrabold text-[12px]">{playerHp} / 100 HP</span>
                </div>
              </div>
              <Bar value={playerHp} tone="bull" h={10} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[13px] font-extrabold text-gold num">
                <Glyph name="bolt" size={18} />
                <span>{energy} / {maxEnergy} Energy</span>
              </div>

              {victory !== null ? (
                <Btn3D size="sm" variant="gold" onClick={restartBattle}>
                  Play Again
                </Btn3D>
              ) : (
                <Btn3D size="sm" variant="blue" disabled={turn !== "player"} onClick={endTurn}>
                  End Turn
                </Btn3D>
              )}
            </div>
          </div>
        </Asset>

        {/* Deck Catalog Drawer */}
        <Asset title="Collectible Card Deck" id="card.deck" desc="Коллекция карт стратегий: открывайте новые карты за закрытие юнитов и победы в турнирах." className="lg:col-span-1" tags={["DECK"]}>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {CARDS_DECK.map((cd) => (
              <div key={cd.id} className="inset !rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-lg grid place-items-center" style={{ backgroundColor: `${cd.color}22` }}>
                    <Glyph name={cd.glyph} size={18} />
                  </span>
                  <div>
                    <span className="font-extrabold text-[12px] block text-txt">{cd.name}</span>
                    <span className="text-[10px] text-dim font-bold">{cd.cost}⚡ · ⚔{cd.attack} · 🛡{cd.defense}</span>
                  </div>
                </div>
                <Badge tone={cd.type === "attack" ? "bear" : cd.type === "defense" ? "bull" : "gold"} size="xs">
                  {cd.type.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
          <div className="inset p-2.5 mt-3 flex justify-between items-center text-[10.5px] font-extrabold text-mute">
            <span>Карт в колоде: {CARDS_DECK.length}</span>
            <span className="text-gold">Ср. стоимость: {(CARDS_DECK.reduce((a, c) => a + c.cost, 0) / CARDS_DECK.length).toFixed(1)}⚡</span>
          </div>
        </Asset>
      </div>
    </Section>
  );
}
