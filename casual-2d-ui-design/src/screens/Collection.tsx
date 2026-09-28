import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Lock, Sword } from "lucide-react";
import { ArtImage } from "../components/ui";
import { MonsterSheet } from "../popups/Popups";
import { MONSTERS, Monster, RARITY, Rarity } from "../data/game";
import { cn } from "../utils/cn";

const OWNED = new Set(["dopamine", "wick", "paper", "fomo"]);

const FILTERS: { id: Rarity | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "rare", label: "Редкие" },
  { id: "epic", label: "Эпичные" },
  { id: "legend", label: "Легенда" },
];

export default function Collection() {
  const [filter, setFilter] = useState<Rarity | "all">("all");
  const [sel, setSel] = useState<Monster | null>(null);
  const list = MONSTERS.filter((m) => filter === "all" || m.rarity === filter);

  return (
    <div className="no-scrollbar relative flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-2">
      <div className="mb-1 flex items-end justify-between">
        <div>
          <h2 className="tstrok font-display text-[26px] font-black italic uppercase leading-none">Бестиарий</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-sky/60">поймано {OWNED.size}/{MONSTERS.length} демонов рынка</p>
        </div>
      </div>

      {/* filters */}
      <div className="no-scrollbar sticky top-0 z-10 -mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 py-2" style={{ background: "linear-gradient(180deg,#081430 40%,transparent)" }}>
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn("rounded-full px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-wide transition-all active:scale-95")}
              style={active
                ? { background: "linear-gradient(180deg,#1cf5c7,#07bbd8)", color: "#06283b", boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), inset 0 -3px 0 #066a80, 0 6px 14px -4px rgba(16,224,196,.5)" }
                : { background: "#101f49", color: "#7c9bd6", boxShadow: "inset 0 0 0 1.5px #2c4a94" }}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 gap-3">
        {list.map((m, i) => {
          const owned = OWNED.has(m.id);
          const r = RARITY[m.rarity];
          return (
            <motion.button
              key={m.id}
              layout
              initial={{ y: 34, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 220, damping: 20 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setSel(m)}
              className="relative overflow-hidden rounded-[22px] p-[2.5px] text-left"
              style={{ background: `linear-gradient(160deg, ${r.c1}, ${r.c2} 60%, #16295c)`, boxShadow: `0 10px 24px -10px ${r.c2}66` }}
            >
              <div className="overflow-hidden rounded-[19px] bg-navy">
                <div className="relative h-[118px]">
                  <ArtImage src={m.art} alt={m.name} tint={m.tint} className={cn("h-full w-full", !owned && "brightness-[.3] saturate-0")} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(13,27,63,.9))" }} />
                  {!owned && <Lock size={22} className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-white/70" />}
                  <span className="absolute left-2 top-2 rounded-lg px-1.5 py-0.5 font-display text-[8px] font-black uppercase tracking-wider text-[#081430]"
                    style={{ background: `linear-gradient(180deg, ${r.c1}, ${r.c2})` }}>{r.label}</span>
                </div>
                <div className="relative px-2.5 pb-2.5 pt-1">
                  <div className="truncate font-display text-[13px] font-black leading-tight text-white">{owned ? m.name : "???"}</div>
                  <div className="truncate font-body text-[9.5px] font-bold text-sky/60">{owned ? m.sub : "ещё не пойман"}</div>
                  <div className="mt-1.5 flex gap-2.5 font-mono text-[9px]">
                    <span className="flex items-center gap-0.5 text-hp"><Sword size={9} />{owned ? m.atk : "—"}</span>
                    <span className="flex items-center gap-0.5 text-mint"><Heart size={9} />{owned ? m.hp : "—"}</span>
                  </div>
                </div>
              </div>
              {m.rarity === "legend" && owned && <span className="card-shine absolute inset-0 rounded-[22px]" />}
            </motion.button>
          );
        })}
      </div>

      <MonsterSheet m={sel} owned={sel ? OWNED.has(sel.id) : false} onClose={() => setSel(null)} />
    </div>
  );
}
