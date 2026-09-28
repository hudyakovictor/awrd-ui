import { motion } from "framer-motion";
import { Gift, GraduationCap, Map as MapIcon, Settings, ShoppingBag, Swords, Users } from "lucide-react";
import { Bolt, Coin, Gem, Pill } from "../lib/ui";
import { ART } from "../art";
import { cn } from "../utils/cn";

export function TopBar({ coins, gems, energy, onSettings, onShop, onDaily, dailyDot }: {
  coins: number; gems: number; energy: number;
  onSettings?: () => void; onShop?: () => void; onDaily?: () => void; dailyDot?: boolean;
}) {
  const xp = 0.68;
  const C = 2 * Math.PI * 17.5;
  return (
    <div className="relative z-30 flex items-center gap-1.5 px-2.5 pt-2.5">
      <div className="pnl-soft flex items-center gap-1.5 rounded-full py-[3px] pl-[3px] pr-2.5">
        <div className="relative grid h-[38px] w-[38px] place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17.5" fill="none" stroke="#050e26" strokeWidth="4" />
            <circle cx="20" cy="20" r="17.5" fill="none" stroke="url(#xpg)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - xp)} />
            <defs><linearGradient id="xpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1ff0c8" /><stop offset="1" stopColor="#11c3e8" /></linearGradient></defs>
          </svg>
          <div className="grid h-[30px] w-[30px] place-items-center overflow-hidden rounded-full"
            style={{ background: "linear-gradient(160deg,#3563b8,#16295c)", boxShadow: "inset 0 2px 0 rgba(150,195,255,.45)" }}>
            <img src={ART.hero} alt="" className="h-full w-full scale-[1.7] object-cover object-top" />
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[6px] px-1 font-num text-[9px] font-bold leading-[13px] text-[#06283b]"
            style={{ background: "linear-gradient(180deg,#35f7d2,#0bb7d8)", boxShadow: "0 1px 3px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.5)" }}>12</span>
        </div>
        <div className="leading-none">
          <div className="font-display text-[12px] font-extrabold text-white">NeoTrader</div>
          <div className="mt-[3px] font-num text-[9px] font-medium tracking-wide text-teal/85">1 240 / 1 800 XP</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-1">
        <div onClick={onShop} className="cursor-pointer"><Pill icon={<Coin s={17} />} value={fmt(coins)} onAdd w={34} /></div>
        <div onClick={onShop} className="cursor-pointer"><Pill icon={<Gem s={17} />} value={fmt(gems)} onAdd w={34} /></div>
      </div>
      <div className="flex flex-col gap-1">
        <div><Pill icon={<Bolt s={17} />} value={`${energy}/60`} w={34} /></div>
        <button onClick={onDaily} className="pnl-soft relative grid h-[26px] w-full place-items-center rounded-full text-gold active:scale-90">
          <Gift size={14} />
          {dailyDot && <span className="absolute -right-0.5 -top-0.5 h-[8px] w-[8px] rounded-full bg-coral ring-2 ring-[#132a5c] a-breathe" />}
        </button>
      </div>
      <button onClick={onSettings} className="pnl-soft self-start mt-0.5 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-sky/80 active:scale-90">
        <Settings size={13} />
      </button>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/\u00A0/g, " ");

export type Tab = "map" | "heroes" | "academy" | "shop";

const TABS: { id: Tab; label: string; icon: typeof MapIcon }[] = [
  { id: "map", label: "Карта", icon: MapIcon },
  { id: "heroes", label: "Монстры", icon: Users },
  { id: "academy", label: "Уроки", icon: GraduationCap },
  { id: "shop", label: "Магазин", icon: ShoppingBag },
];

export function BottomNav({ tab, onTab, onPlay, dot }: { tab: Tab; onTab: (t: Tab) => void; onPlay?: () => void; dot?: boolean }) {
  return (
    <div className="relative z-30 px-2.5 pb-2.5">
      <div className="pnl flex items-end justify-between rounded-[24px] px-2 pb-1.5 pt-2.5">
        {TABS.slice(0, 2).map((t) => <NavBtn key={t.id} t={t} on={tab === t.id} click={() => onTab(t.id)} />)}
        <div className="relative -mt-9 flex w-[76px] flex-col items-center">
          <motion.button onClick={onPlay} whileTap={{ scale: 0.9, y: 4 }}
            className="a-breathe relative grid h-[68px] w-[68px] place-items-center rounded-full"
            style={{
              background: "linear-gradient(177deg,#35f7d2,#0bb7d8 78%)",
              boxShadow: "inset 0 3px 0 rgba(255,255,255,.7), inset 0 -8px 0 #056a80, inset 0 0 0 1.5px rgba(255,255,255,.35), 0 8px 0 #044f61, 0 14px 26px -6px rgba(24,226,198,.6), 0 0 0 5px #0e2049",
            }}>
            <Swords size={28} strokeWidth={2.8} className="text-[#04303f] drop-shadow" />
            <span className="absolute inset-0 rounded-full a-ring" />
          </motion.button>
          <span className="hd hd-thin mt-1 text-[11px] uppercase">В бой</span>
        </div>
        {TABS.slice(2).map((t) => <NavBtn key={t.id} t={t} on={tab === t.id} click={() => onTab(t.id)} dot={t.id === "academy" && dot} />)}
      </div>
    </div>
  );
}

function NavBtn({ t, on, click, dot }: { t: { id: Tab; label: string; icon: typeof MapIcon }; on: boolean; click: () => void; dot?: boolean }) {
  const Icon = t.icon;
  return (
    <button onClick={click} className="group relative flex w-[60px] flex-col items-center gap-[3px] pb-0.5">
      <motion.span animate={{ y: on ? -2 : 0, scale: on ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 420, damping: 17 }}
        className={cn("grid h-9 w-9 place-items-center rounded-[13px]", on ? "text-[#04303f]" : "text-sky/60")}
        style={on ? {
          background: "linear-gradient(177deg,#35f7d2,#0bb7d8)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -4px 0 #056a80, 0 4px 12px -3px rgba(24,226,198,.6)",
        } : { background: "rgba(8,20,48,.55)", boxShadow: "inset 0 0 0 1.5px rgba(47,92,176,.3)" }}>
        <Icon size={18} strokeWidth={2.6} />
      </motion.span>
      <span className={cn("font-display text-[9.5px] font-bold uppercase tracking-wide", on ? "text-teal" : "text-sky/45")}>{t.label}</span>
      {dot && <span className="absolute right-1.5 top-0 h-[9px] w-[9px] rounded-full bg-coral ring-2 ring-[#132a5c] a-breathe" />}
    </button>
  );
}
