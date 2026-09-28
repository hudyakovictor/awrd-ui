import { motion } from "framer-motion";
import { Flame, Gem, Heart, Menu, Play, Search, Volume2, VolumeX, X } from "lucide-react";
import { Mascot } from "../duo/Mascot";
import { useFx } from "../fx/fx";
import { Magnetic } from "../fx/Motion";
import { useStats } from "../fx/stats";

const XP_PER_LEVEL = 120;

function SessionLevel() {
  const { counts } = useStats();
  const xp = counts.effects + counts.success * 10 + counts.combo * 4;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const p = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  return (
    <div className="hidden items-center gap-2 lg:flex" title="Session level — grows with every effect you trigger">
      <motion.span
        key={level}
        initial={level > 1 ? { scale: 1.5, rotate: -20 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 14 }}
        className="font-display grid h-9 w-9 place-items-center rounded-xl text-[14px] font-black text-white"
        style={{ background: "linear-gradient(180deg,#fb923c,#f97316)", boxShadow: "0 3px 0 #c2410c, 0 0 14px rgba(249,115,22,.5)" }}
      >
        {level}
      </motion.span>
      <div className="w-24">
        <div className="text-[10px] font-black uppercase tracking-wider text-white/45">Session XP</div>
        <div className="inset-well mt-1 h-2.5 overflow-hidden rounded-full">
          <motion.div className="h-full rounded-full" animate={{ width: `${Math.max(4, p * 100)}%` }} transition={{ type: "spring", stiffness: 200, damping: 24 }} style={{ background: "linear-gradient(90deg,#fbbf24,#f97316)", boxShadow: "0 0 8px #f97316" }} />
        </div>
      </div>
    </div>
  );
}

interface Props {
  query: string;
  setQuery: (q: string) => void;
  onMenu: () => void;
  onPlay: () => void;
  shown: number;
  total: number;
}

export function TopBar({ query, setQuery, onMenu, onPlay, shown, total }: Props) {
  const fx = useFx();
  return (
    <div
      className="sticky top-0 z-40 border-b border-white/10"
      style={{ background: "linear-gradient(180deg, rgba(8,12,26,.94), rgba(8,12,26,.76))", backdropFilter: "blur(14px)", boxShadow: "0 8px 30px rgba(2,4,11,.65)" }}
    >
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 lg:px-8">
        <button onClick={onMenu} aria-label="Open menu" className="duo-btn duo-ghost duo-btn-sm w-11 shrink-0 px-0 lg:hidden">
          <Menu size={20} strokeWidth={3} />
        </button>

        <a href="#top" className="flex shrink-0 items-center gap-2" onClick={() => fx.sfx("click")}>
          <Mascot size={40} mood="idle" />
          <span className="font-display hidden text-[22px] font-black tracking-tight sm:block">
            signal<span className="glow-ember">fx</span>
          </span>
        </a>

        <div className="inset-well mx-auto flex h-11 w-full max-w-md items-center gap-2.5 rounded-full px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#f97316]/60">
          <Search size={17} className="shrink-0 text-white/40" strokeWidth={3} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${total} blocks… try "slots" or "radar"`}
            aria-label="Search blocks"
            className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:text-white/30"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white">
              <X size={15} strokeWidth={3} />
            </button>
          )}
        </div>

        <SessionLevel />
        <div className="hidden shrink-0 items-center gap-4 text-[15px] font-black md:flex" aria-label="Player stats">
          <motion.span whileHover={{ scale: 1.12 }} className="flex items-center gap-1.5 text-[#f97316]" style={{ textShadow: "0 0 12px rgba(249,115,22,.5)" }}>
            <Flame size={20} fill="currentColor" strokeWidth={1.5} /> 7
          </motion.span>
          <motion.span whileHover={{ scale: 1.12 }} className="flex items-center gap-1.5 text-[#3b82f6]" style={{ textShadow: "0 0 12px rgba(59,130,246,.5)" }}>
            <Gem size={19} fill="currentColor" strokeWidth={1.5} /> 420
          </motion.span>
          <motion.span whileHover={{ scale: 1.12 }} className="flex items-center gap-1.5 text-[#ef4444]" style={{ textShadow: "0 0 12px rgba(239,68,68,.5)" }}>
            <Heart size={19} fill="currentColor" strokeWidth={0} /> 5
          </motion.span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Magnetic strength={0.18}>
            <button
              onClick={() => fx.setSound(!fx.sound)}
              aria-label={fx.sound ? "Mute sound" : "Enable sound"}
              aria-pressed={fx.sound}
              className={`grid h-11 w-11 place-items-center rounded-2xl border transition-all ${fx.sound ? "border-[#f97316]/60 text-[#fb923c]" : "border-white/10 text-white/45 hover:text-white"}`}
              style={fx.sound ? { background: "linear-gradient(145deg,#3a2716,#22170e)", boxShadow: "0 4px 0 #080d1a, 0 0 16px rgba(249,115,22,.35)" } : { background: "linear-gradient(145deg,#1d2947,#141c31)", boxShadow: "0 4px 0 #080d1a, var(--e1)" }}
            >
              {fx.sound ? <Volume2 size={19} strokeWidth={2.8} /> : <VolumeX size={19} strokeWidth={2.8} />}
            </button>
          </Magnetic>
          <Magnetic strength={0.18}>
            <button onClick={() => { fx.sfx("open"); fx.haptic(12); onPlay(); }} className="duo-btn duo-orange duo-btn-sm hidden !h-11 sm:inline-flex">
              <Play size={16} fill="currentColor" /> Full loop
            </button>
          </Magnetic>
        </div>
      </div>

      {query && (
        <div className="border-t border-white/5 bg-black/30 px-4 py-1.5 text-center text-[13px] font-bold text-white/55">
          Showing <span className="text-[#fb923c]">{shown}</span> of {total} blocks
        </div>
      )}
    </div>
  );
}
