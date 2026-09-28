import React, { useState } from "react";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface LootItem {
  id: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  type: "skin" | "booster" | "freeze" | "perk";
  icon: string;
  unlocked: boolean;
}

export const GachaVaultExperience: React.FC = () => {
  const [chestKeys, setChestKeys] = useState(3);
  const [isOpening, setIsOpening] = useState(false);
  const [openedItem, setOpenedItem] = useState<LootItem | null>(null);

  const lootTable: LootItem[] = [
    { id: "skin-gold", name: "Apex Gold Bull Armor", rarity: "legendary", type: "skin", icon: "crown", unlocked: false },
    { id: "booster-3x", name: "3x XP Multiplier (24h)", rarity: "epic", type: "booster", icon: "bolt", unlocked: false },
    { id: "freeze-pack", name: "Streak Freeze Insurance x3", rarity: "rare", type: "freeze", icon: "shield", unlocked: false },
    { id: "liq-shield", name: "Liquidation Rebate Pass", rarity: "legendary", type: "perk", icon: "gem", unlocked: false },
    { id: "skin-cyber", name: "Cyberpunk Neon Visor", rarity: "rare", type: "skin", icon: "sparkles", unlocked: false },
    { id: "xp-pack", name: "+500 Instant XP", rarity: "common", type: "booster", icon: "star", unlocked: false },
  ];

  const [inventory, setInventory] = useState<LootItem[]>([
    { id: "skin-default", name: "Standard Blue Harness", rarity: "common", type: "skin", icon: "shield", unlocked: true },
  ]);

  const handleOpenChest = () => {
    if (chestKeys <= 0 || isOpening) return;

    setIsOpening(true);
    setOpenedItem(null);
    setChestKeys((k) => k - 1);

    soundFx.playClick("metallic");

    // Tension build-up sound
    setTimeout(() => {
      const randomItem = lootTable[Math.floor(Math.random() * lootTable.length)];
      setOpenedItem(randomItem);
      setInventory((prev) => [randomItem, ...prev]);
      setIsOpening(false);

      if (randomItem.rarity === "legendary") {
        soundFx.playChestReveal();
        soundFx.playCoinShower(8);
      } else {
        soundFx.playCoinShower(3);
      }
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-gold/40 text-gold">
            <Icon name="chest" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">The Gacha Vault & Mystery Chests</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gold/20 text-gold border border-gold/30 uppercase tracking-widest">
                Mystery Drop
              </span>
            </div>
            <p className="text-ink-400 text-xs">Unlock rare mascot armor, trading perks, and streak freezes</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="sf-inset px-4 py-2 rounded-xl border border-navy-700 flex items-center gap-2">
            <Icon name="key" size={16} className="text-gold" />
            <span className="font-mono text-sm font-bold text-white">Keys: {chestKeys}</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick("plastic");
              setChestKeys((k) => k + 2);
            }}
            className="h-10 px-3 rounded-xl sf-base border border-navy-700 text-xs font-mono font-bold text-ink-300 hover:text-white"
          >
            + Get 2 Keys
          </button>
        </div>
      </div>

      {/* Main Chest Pedestal Stage */}
      <div className="my-8 py-10 rounded-2xl sf-inset border border-navy-800 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className={`relative transition-all duration-300 ${isOpening ? "animate-bounce scale-110" : ""}`}>
          <div className="w-28 h-28 rounded-3xl sf-raised border-2 border-gold/60 flex items-center justify-center text-gold shadow-2xl shadow-gold/20">
            <Icon name="chest" size={56} strokeWidth={1.8} />
          </div>
        </div>

        {/* Opened Item Popup */}
        {openedItem && (
          <div className="mt-6 p-4 rounded-xl bg-navy-900 border border-gold/50 flex flex-col items-center max-w-sm text-center">
            <span
              className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full mb-2 ${
                openedItem.rarity === "legendary"
                  ? "bg-gold/20 text-gold border border-gold"
                  : openedItem.rarity === "epic"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400"
                  : "bg-blue-500/20 text-blue-300 border border-blue-400"
              }`}
            >
              {openedItem.rarity} Item Dropped!
            </span>
            <h4 className="font-display font-bold text-white text-lg">{openedItem.name}</h4>
            <p className="text-xs font-mono text-ink-400 mt-1">Item added to your permanent mascot locker.</p>
          </div>
        )}

        <button
          disabled={chestKeys <= 0 || isOpening}
          onClick={handleOpenChest}
          className="mt-6 btn3d h-12 px-10 rounded-xl font-display font-bold text-sm uppercase tracking-wider disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg, #ffc24b 0%, #d4860f 100%)",
            color: "#1a1002",
            ["--edge" as any]: "#9a6209",
          }}
        >
          {isOpening ? "Unlocking Vault..." : "Crack Open Mystery Chest"}
        </button>
      </div>

      {/* Inventory Locker Preview */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono text-ink-400 uppercase font-bold mb-3">
          <span>Your Unlocked Vault Collection ({inventory.length})</span>
          <span>Perks Active: 100%</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {inventory.map((item, idx) => (
            <div key={idx} className="sf-base p-3 rounded-xl border border-navy-700/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg sf-inset flex items-center justify-center text-gold shrink-0">
                <Icon name={item.icon as any} size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                <span className="text-[10px] font-mono uppercase text-ink-400 capitalize">{item.rarity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
