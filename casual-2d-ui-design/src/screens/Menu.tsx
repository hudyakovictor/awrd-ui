import { motion } from "framer-motion";
import { CalendarDays, Megaphone, Play, TrendingUp } from "lucide-react";
import { ArtImage, JellyBtn } from "../components/ui";
import { Particles } from "../components/fx";
import { MONSTERS } from "../data/game";

export default function Menu({ onPlay, onDaily }: { onPlay: () => void; onDaily: () => void }) {
  const hero = MONSTERS.find((m) => m.id === "chimera")!;
  const side1 = MONSTERS.find((m) => m.id === "fomo")!;
  const side2 = MONSTERS.find((m) => m.id === "dopamine")!;

  return (
    <div className="no-scrollbar relative flex flex-1 min-h-0 flex-col overflow-y-auto px-5 pb-6 pt-2">
      <Particles n={18} />

      {/* season chip */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mx-auto">
        <span className="panel-soft flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[.18em] text-teal">
          <TrendingUp size={11} /> Сезон I · бычий рынок
        </span>
      </motion.div>

      {/* logo */}
      <div className="relative mt-5 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative inline-block"
        >
          <svg className="absolute -top-6 left-1/2 w-56 -translate-x-1/2 opacity-90" viewBox="0 0 220 44" fill="none">
            <rect x="8" y="22" width="7" height="14" rx="2" fill="#ff5468" />
            <rect x="22" y="14" width="7" height="18" rx="2" fill="#19f2c4" />
            <rect x="36" y="20" width="7" height="12" rx="2" fill="#ff5468" />
            <rect x="180" y="16" width="7" height="16" rx="2" fill="#19f2c4" />
            <rect x="194" y="8" width="7" height="20" rx="2" fill="#19f2c4" />
            <path d="M50 30 90 18l30 8 40-16 22 6" stroke="#19f2c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="anim-dash" strokeDasharray="6 8" opacity=".7" />
          </svg>
          <div className="tstrok font-display text-[54px] font-black italic leading-[.95] tracking-tight">SIGNAL</div>
          <div className="font-display text-[54px] font-black italic leading-[.95] tracking-tight"
            style={{
              background: "linear-gradient(180deg,#9dffe9 10%,#19f2c4 55%,#07bcd8)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              WebkitTextStroke: "4px #0b3a4a", paintOrder: "stroke fill",
              filter: "drop-shadow(0 5px 0 rgba(4,30,40,.55))",
            }}>
            ARENA
          </div>
          <span className="absolute -right-3 top-8 rotate-12 rounded-lg bg-gold px-2 py-0.5 font-display text-[10px] font-black uppercase text-[#4d2c07]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 4px 8px rgba(0,0,0,.4)" }}>beta</span>
        </motion.div>
      </div>

      {/* hero */}
      <div className="relative mx-auto mt-6 grid w-full max-w-[300px] flex-1 min-h-[220px] place-items-center">
        <motion.div className="absolute h-56 w-56 rounded-full border-2 border-dashed border-teal/25"
          animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: "linear" }} />
        <motion.div
          initial={{ scale: 0, rotate: 8 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: .15, type: "spring", stiffness: 180, damping: 14 }}
          className="anim-floaty relative"
        >
          <div className="absolute inset-[-16px] rounded-[36px] bg-teal/25 blur-2xl" />
          <ArtImage src={hero.art} alt={hero.name} tint={hero.tint}
            className="relative h-44 w-44 rounded-[32px]"
            style={{ boxShadow: "inset 0 0 0 3px #ffe066cc, 0 24px 44px -12px rgba(255,180,60,.45)" }} />
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-display text-[10px] font-black uppercase tracking-wider text-white"
            style={{ background: "linear-gradient(180deg,#ff6f9f,#f43f7f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 6px 12px rgba(0,0,0,.45)" }}>
            Босс сезона
          </span>
        </motion.div>

        <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .35, type: "spring", stiffness: 160, damping: 15 }}
          className="anim-floaty2 absolute -left-2 bottom-8">
          <ArtImage src={side1.art} alt={side1.name} tint={side1.tint} className="h-16 w-16 rounded-2xl -rotate-6 ring-2 ring-pink/70" />
        </motion.div>
        <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .45, type: "spring", stiffness: 160, damping: 15 }}
          className="anim-floaty absolute -right-2 top-6">
          <ArtImage src={side2.art} alt={side2.name} tint={side2.tint} className="h-14 w-14 rounded-2xl rotate-6 ring-2 ring-mint/70" />
        </motion.div>
      </div>

      {/* actions */}
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .3, type: "spring", stiffness: 170, damping: 18 }}
        className="relative z-10 space-y-2.5">
        <JellyBtn variant="teal" className="w-full py-4 text-[22px] uppercase italic tracking-wide" onClick={onPlay}>
          <Play size={22} fill="currentColor" /> Играть
        </JellyBtn>
        <div className="flex gap-2.5">
          <JellyBtn variant="navy" className="flex-1 py-2.5 text-[12px] uppercase italic text-white/90" onClick={onDaily}>
            <CalendarDays size={15} className="text-gold" /> Награда дня
            <span className="ml-1 h-2 w-2 rounded-full bg-hp anim-breathe" />
          </JellyBtn>
          <JellyBtn variant="navy" className="flex-1 py-2.5 text-[12px] uppercase italic text-white/90">
            <Megaphone size={15} className="text-grape" /> События
          </JellyBtn>
        </div>
        <p className="pt-1 text-center font-mono text-[9.5px] uppercase tracking-[.2em] text-sky/40">
          сразись со своей психологией · v1.0
        </p>
      </motion.div>
    </div>
  );
}
