/* ------------------------------------------------------------------
 * 31 · COSMETIC FORGE — preview, equip, rarity rolls, craft
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import { Gem, Wand2 } from "lucide-react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { Card, Tag } from "../components/ui";
import { ChipRow, GameSection, RARITY_COLOR, type Rarity } from "../fx/gamekit";
import { Tilt } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { gems: number; setGems: (n: number | ((v: number) => number)) => void; toast: (t: string, s: string, tone?: string) => void };

type Item = { id: string; name: string; slot: string; rarity: Rarity; price: number; emoji: string; owned?: boolean };

const CATALOG: Item[] = [
  { id: "1", name: "Golden Bull", slot: "skin", rarity: "legendary", price: 800, emoji: "🐂" },
  { id: "2", name: "Night Bear", slot: "skin", rarity: "epic", price: 500, emoji: "🐻" },
  { id: "3", name: "Neon Trail", slot: "trail", rarity: "rare", price: 300, emoji: "✨" },
  { id: "4", name: "Fire Trail", slot: "trail", rarity: "epic", price: 450, emoji: "🔥" },
  { id: "5", name: "Diamond Frame", slot: "frame", rarity: "legendary", price: 1000, emoji: "💎" },
  { id: "6", name: "OG Frame", slot: "frame", rarity: "rare", price: 250, emoji: "🖼️" },
  { id: "7", name: "Title: Degen", slot: "title", rarity: "common", price: 100, emoji: "🏷️" },
  { id: "8", name: "Title: Legend", slot: "title", rarity: "legendary", price: 1200, emoji: "👑" },
  { id: "9", name: "Emote: Rocket", slot: "emote", rarity: "rare", price: 180, emoji: "🚀" },
  { id: "10", name: "Emote: Rekt", slot: "emote", rarity: "common", price: 80, emoji: "💀" },
  { id: "11", name: "Aura: Cyan", slot: "aura", rarity: "epic", price: 600, emoji: "🌀" },
  { id: "12", name: "Aura: Gold", slot: "aura", rarity: "legendary", price: 900, emoji: "🌟" },
];

export default function CosmeticForge({ gems, setGems, toast }: Props) {
  const [filter, setFilter] = useState("all");
  const [owned, setOwned] = useState<string[]>(["7", "10"]);
  const [equip, setEquip] = useState<Record<string, string>>({ title: "7", emote: "10" });
  const [craft, setCraft] = useState<Rarity | null>(null);
  const list = CATALOG.filter(i => filter === "all" || i.slot === filter || i.rarity === filter);

  const buy = (it: Item) => {
    if (owned.includes(it.id)) { setEquip(e => ({ ...e, [it.slot]: it.id })); sfx.pop(); toast("Equipped", it.name, "blue"); return; }
    if (gems < it.price) { sfx.error(); toast("Not enough gems", `Need ${it.price}`, "short"); return; }
    setGems(g => g - it.price);
    setOwned(o => [...o, it.id]);
    setEquip(e => ({ ...e, [it.slot]: it.id }));
    sfx.coin(); confetti({ particleCount: 40, spread: 55, colors: [RARITY_COLOR[it.rarity], "#fff"] });
    toast("Purchased", it.name, "gold");
  };

  const roll = () => {
    if (gems < 100) { sfx.error(); return; }
    setGems(g => g - 100);
    const table: Rarity[] = ["common", "common", "common", "rare", "rare", "epic", "legendary"];
    const r = table[Math.floor(Math.random() * table.length)];
    setCraft(r);
    sfx.levelUp();
    if (r === "legendary" || r === "epic") confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    toast("Craft roll", r.toUpperCase(), r === "legendary" ? "gold" : "violet");
  };

  const eqSkin = CATALOG.find(i => i.id === equip.skin);
  const eqFrame = CATALOG.find(i => i.id === equip.frame);
  const eqTitle = CATALOG.find(i => i.id === equip.title);

  return (
    <GameSection id="forge" index="31" kicker="Cosmetic Forge" title="Скины, рамки, крафт"
      desc="Магазин косметики, экипировка превью, roll-крафт редкости за гемы."
      right={<Tag tone="blue"><Gem size={11} /> {gems}</Tag>}>
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card title="Preview" sub="Equipped look">
          <Tilt className="rounded-[24px]">
            <div className="relative flex h-[260px] flex-col items-center justify-center overflow-hidden rounded-[24px] border-4 bg-gradient-to-b from-[#1b3773] to-[#081130]"
              style={{ borderColor: eqFrame ? RARITY_COLOR[eqFrame.rarity] : "rgba(255,255,255,.15)", boxShadow: eqFrame ? `0 0 30px ${RARITY_COLOR[eqFrame.rarity]}55` : undefined }}>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-7xl">
                {eqSkin?.emoji || "🐂"}
              </motion.div>
              <p className="display mt-3 text-lg font-extrabold text-white">BullRunner</p>
              <p className="text-[11px] font-bold" style={{ color: eqTitle ? RARITY_COLOR[eqTitle.rarity] : "#8ea6d8" }}>
                {eqTitle?.name || "No title"}
              </p>
              {equip.aura && <div className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(circle,rgba(142,242,60,.15),transparent_60%)]" />}
            </div>
          </Tilt>
          <button onClick={roll} className="btn3d btn3d-violet mt-4 w-full py-3 text-xs"><Wand2 size={14} /> Craft roll · 100💎</button>
          <AnimatePresence>
            {craft && (
              <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-2 text-center text-sm font-extrabold" style={{ color: RARITY_COLOR[craft] }}>
                Rolled: {craft.toUpperCase()}
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
        <div>
          <div className="mb-3"><ChipRow options={["all", "skin", "trail", "frame", "title", "emote", "aura", "legendary"]} value={filter} onChange={setFilter} /></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.map(it => {
              const on = owned.includes(it.id);
              const eq = equip[it.slot] === it.id;
              const col = RARITY_COLOR[it.rarity];
              return (
                <button key={it.id} onClick={() => buy(it)} className={cn("rounded-2xl border p-3 text-left transition", eq ? "border-white bg-white/10" : "border-white/10 bg-black/25 hover:border-white/25")}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{it.emoji}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-extrabold uppercase" style={{ color: col }}>{it.rarity} · {it.slot}</p>
                      <p className="text-xs font-extrabold text-white">{it.name}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-[#8ea6d8]">{on ? (eq ? "Equipped" : "Own · tap equip") : <><Gem size={11} className="mr-1 inline" />{it.price}</>}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </GameSection>
  );
}
