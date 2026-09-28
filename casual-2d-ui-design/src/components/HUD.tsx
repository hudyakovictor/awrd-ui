import { motion } from "framer-motion";
import { Gift, LayoutGrid, Map as MapIcon, Play, Settings, ShoppingBag } from "lucide-react";
import { CoinIcon, CurrencyPill, GemIcon } from "./ui";
import { cn } from "../utils/cn";

/* ===================== top bar ===================== */

export function TopBar({
  coins, gems, onAddCoins, onAddGems, onSettings,
}: {
  coins: number; gems: number;
  onAddCoins: () => void; onAddGems: () => void; onSettings: () => void;
}) {
  const lvl = 12;
  const xp = 0.68;
  return (
    <div className="relative z-30 flex items-center gap-2 px-3 pt-3">
      {/* player chip */}
      <div className="panel-soft flex items-center gap-2 rounded-full py-1 pl-1 pr-3">
        <div className="relative grid h-10 w-10 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="#0a1735" strokeWidth="3.5" />
            <circle cx="20" cy="20" r="17" fill="none" stroke="url(#xpg)" strokeWidth="3.5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 17} strokeDashoffset={2 * Math.PI * 17 * (1 - xp)} />
            <defs>
              <linearGradient id="xpg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#19f2c4" /><stop offset="1" stopColor="#07bcd8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid h-8 w-8 place-items-center rounded-full text-lg"
            style={{ background: "linear-gradient(160deg,#31579f,#16295c)", boxShadow: "inset 0 2px 0 rgba(140,180,255,.4)" }}>
            <span className="font-display text-[13px] font-black text-teal">N</span>
          </div>
        </div>
        <div className="leading-none">
          <div className="font-display text-[13px] font-extrabold text-white">NeoTrader</div>
          <div className="mt-1 font-mono text-[10px] text-teal/90">УР. {lvl}</div>
        </div>
      </div>

      <div className="flex-1" />
      <CurrencyPill icon={<CoinIcon size={19} />} value={coins.toLocaleString("ru-RU")} onAdd={onAddCoins} />
      <CurrencyPill icon={<GemIcon size={19} />} value={gems.toLocaleString("ru-RU")} onAdd={onAddGems} />
      <button onClick={onSettings}
        className="panel-soft grid h-10 w-10 place-items-center rounded-2xl text-sky active:scale-90 transition-transform">
        <Settings size={19} />
      </button>
    </div>
  );
}

/* ===================== bottom nav ===================== */

export type Tab = "arena" | "collection" | "shop" | "rewards";

const TABS: { id: Tab; label: string; icon: typeof MapIcon }[] = [
  { id: "arena", label: "Карта", icon: MapIcon },
  { id: "collection", label: "Монстры", icon: LayoutGrid },
  { id: "shop", label: "Магазин", icon: ShoppingBag },
  { id: "rewards", label: "Награды", icon: Gift },
];

export function BottomNav({ tab, onTab, onPlay, rewardDot }: {
  tab: Tab; onTab: (t: Tab) => void; onPlay: () => void; rewardDot?: boolean;
}) {
  return (
    <div className="relative z-30 px-3 pb-3">
      <div className="panel relative flex items-end justify-between rounded-[26px] px-3 pb-2 pt-3">
        {TABS.slice(0, 2).map((t) => <NavBtn key={t.id} t={t} active={tab === t.id} onClick={() => onTab(t.id)} dot={t.id === "rewards" && rewardDot} />)}

        {/* big play */}
        <div className="relative -mt-10 grid place-items-center">
          <motion.button
            onClick={onPlay}
            whileTap={{ scale: 0.92, y: 3 }}
            className="anim-breathe relative grid h-[74px] w-[74px] place-items-center rounded-full"
            style={{
              background: "linear-gradient(180deg,#1cf5c7,#07bbd8)",
              boxShadow: "inset 0 3px 0 rgba(255,255,255,.6), inset 0 -8px 0 #066a80, 0 10px 24px -4px rgba(16,224,196,.55), 0 0 0 6px #0e1f49",
            }}
          >
            <Play size={30} fill="#06283b" className="translate-x-0.5 text-[#06283b]" />
            <span className="absolute inset-0 rounded-full anim-ring" />
          </motion.button>
          <span className="tstrok-sm mt-1 font-display text-[12px] font-black uppercase italic tracking-wider">В бой</span>
        </div>

        {TABS.slice(2).map((t) => <NavBtn key={t.id} t={t} active={tab === t.id} onClick={() => onTab(t.id)} dot={t.id === "rewards" && rewardDot} />)}
      </div>
    </div>
  );
}

function NavBtn({ t, active, onClick, dot }: { t: (typeof TABS)[number]; active: boolean; onClick: () => void; dot?: boolean }) {
  const Icon = t.icon;
  return (
    <button onClick={onClick} className="group relative flex w-16 flex-col items-center gap-1 py-1">
      <motion.span
        animate={{ y: active ? -3 : 0, scale: active ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-2xl transition-colors",
          active ? "text-[#06283b]" : "text-sky/70 group-active:scale-95"
        )}
        style={active ? {
          background: "linear-gradient(180deg,#1cf5c7,#07bbd8)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), inset 0 -4px 0 #066a80, 0 6px 14px -4px rgba(16,224,196,.5)",
        } : {}}
      >
        <Icon size={20} strokeWidth={2.4} />
      </motion.span>
      <span className={cn("font-display text-[10px] font-bold uppercase tracking-wide", active ? "text-teal" : "text-sky/50")}>
        {t.label}
      </span>
      {dot && <span className="absolute right-2 top-0 h-2.5 w-2.5 rounded-full bg-hp ring-2 ring-navy anim-breathe" />}
    </button>
  );
}
