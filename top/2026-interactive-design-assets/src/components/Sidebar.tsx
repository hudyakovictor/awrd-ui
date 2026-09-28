import {
  BookOpen,
  Compass,
  Eye,
  Flag,
  Gamepad2,
  Gift,
  LayoutGrid,
  MessageCircle,
  MousePointerClick,
  Puzzle,
  Search,
  SlidersHorizontal,
  Smile,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { BLOCKS, CATEGORIES, type Category } from "../blocks/registry";
import { Mascot } from "../duo/Mascot";
import { useFx } from "../fx/fx";
import { LiveDot } from "../fx/Motion";

interface Props {
  cat: Category | "All";
  setCat: (c: Category | "All") => void;
  query: string;
  setQuery: (q: string) => void;
  onNavigate?: () => void;
}

const ICONS: Record<Category | "All", { I: LucideIcon; c: string }> = {
  All: { I: LayoutGrid, c: "#3b82f6" },
  Mechanics: { I: Puzzle, c: "#22c55e" },
  Tactile: { I: SlidersHorizontal, c: "#fb923c" },
  Arcade: { I: Gamepad2, c: "#ef4444" },
  VFX: { I: Zap, c: "#fbbf24" },
  Lessons: { I: BookOpen, c: "#22c55e" },
  Character: { I: Smile, c: "#8b5cf6" },
  Reveal: { I: Eye, c: "#fbbf24" },
  "Decision Input": { I: MousePointerClick, c: "#3b82f6" },
  Feedback: { I: MessageCircle, c: "#fb923c" },
  Rewards: { I: Gift, c: "#fbbf24" },
  "Market Data": { I: TrendingUp, c: "#22c55e" },
  Navigation: { I: Compass, c: "#60a5fa" },
  Onboarding: { I: Flag, c: "#ef4444" },
  Social: { I: Users, c: "#8b5cf6" },
  Transitions: { I: Sparkles, c: "#f97316" },
};

function Switch({ on, set, label }: { on: boolean; set: (b: boolean) => void; label: string }) {
  const fx = useFx();
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => { set(!on); fx.sfx("click"); }}
      className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-[15px] font-extrabold text-white/70 transition-colors hover:bg-white/[.05] hover:text-white"
    >
      {label}
      <span className="relative h-7 w-[52px] shrink-0 rounded-full transition-all" style={on ? { background: "linear-gradient(180deg,#c2410c,#f97316)", boxShadow: "inset 2px 2px 5px rgba(0,0,0,.5), 0 0 12px rgba(249,115,22,.45)" } : { background: "#060a14", boxShadow: "inset 3px 3px 7px rgba(2,4,11,.9), inset -2px -2px 5px rgba(255,255,255,.07)" }}>
        <motion.span
          className="absolute top-1 h-5 w-5 rounded-full"
          animate={{ left: on ? 27 : 4 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          style={{ background: "linear-gradient(145deg,#f2f4fb,#aab2cc)", boxShadow: "0 2px 5px rgba(0,0,0,.7), inset 0 1px 0 #fff" }}
        />
      </span>
    </button>
  );
}

export function SidebarContent({ cat, setCat, query, setQuery, onNavigate }: Props) {
  const fx = useFx();
  const items: (Category | "All")[] = ["All", ...CATEGORIES];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[76px] shrink-0 items-center gap-2.5 px-5">
        <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }} transition={{ duration: 0.5 }}>
          <Mascot size={46} mood="idle" />
        </motion.div>
        <div>
          <div className="font-display text-[24px] font-black leading-none tracking-tight">
            signal<span className="glow-ember">fx</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[.18em] text-white/40">
            <LiveDot color="#22c55e" size={7} /> game-feel kit
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <label className="inset-well flex h-11 items-center gap-2.5 rounded-2xl px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#f97316]/60">
          <Search size={17} className="shrink-0 text-white/40" strokeWidth={3} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search blocks" aria-label="Search blocks" className="w-full bg-transparent text-[15px] font-bold outline-none placeholder:text-white/30" />
        </label>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-2" aria-label="Categories">
        <ul className="space-y-1">
          {items.map((c) => {
            const count = c === "All" ? BLOCKS.length : BLOCKS.filter((b) => b.category === c).length;
            const active = cat === c;
            const { I, c: col } = ICONS[c];
            return (
              <li key={c} className="relative">
                {active && (
                  <motion.span
                    layoutId="side-active"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: "linear-gradient(145deg, rgba(249,115,22,.22), rgba(249,115,22,.06))", boxShadow: "inset 2px 2px 6px rgba(2,4,11,.7), inset -1px -1px 3px rgba(255,255,255,.06), 0 0 0 1.5px rgba(249,115,22,.45), 0 0 18px rgba(249,115,22,.2)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <button
                  onClick={() => { setCat(c); fx.sfx("tick"); fx.haptic(4); onNavigate?.(); }}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-[14px] font-black uppercase tracking-wide transition-colors ${active ? "text-white" : "text-white/60 hover:text-white"}`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl" style={{ background: active ? `${col}26` : "rgba(255,255,255,.04)", boxShadow: active ? `inset 2px 2px 4px rgba(0,0,0,.5), 0 0 10px ${col}44` : "inset 1px 1px 3px rgba(0,0,0,.4)" }}>
                    <I size={19} strokeWidth={2.6} color={col} />
                  </span>
                  <span className="flex-1 truncate">{c === "All" ? "All blocks" : c}</span>
                  <span className={`rounded-md px-1.5 py-0.5 font-mono text-[12px] font-bold ${active ? "text-white" : "text-white/35"}`} style={active ? { background: "rgba(0,0,0,.4)", boxShadow: "inset 1px 1px 3px rgba(0,0,0,.6)" } : undefined}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 px-4 pb-2 text-[12px] font-black uppercase tracking-[.18em] text-white/35">Playback speed</div>
        <div className="px-3 pb-2">
          <div className="inset-well grid grid-cols-3 gap-1 rounded-2xl p-1.5">
            {[0.25, 0.5, 1].map((s) => (
              <button
                key={s}
                onClick={() => { fx.setSpeed(s); fx.sfx("click"); }}
                className="h-10 rounded-xl text-[15px] font-black transition-all"
                style={fx.speed === s ? { background: "linear-gradient(180deg, #fb923c, #f97316)", color: "#fff", boxShadow: "0 3px 0 #c2410c, 0 0 14px rgba(249,115,22,.5)", textShadow: "0 1px 2px rgba(0,0,0,.4)" } : { color: "rgba(255,255,255,.5)" }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
        <Switch on={fx.sound} set={fx.setSound} label="Sound" />
        <Switch on={fx.haptics} set={fx.setHaptics} label="Haptics" />
        <Switch on={fx.reduced} set={fx.setReduced} label="Reduced motion" />

        <div className="mx-4 mb-2 mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
          <div className="text-[12px] font-black uppercase tracking-[.16em] text-[#fbbf24]">Design tokens</div>
          <div className="mt-2 flex gap-1.5">
            {["#f97316", "#fbbf24", "#22c55e", "#3b82f6", "#8b5cf6", "#ef4444"].map((c) => (
              <span key={c} className="h-6 flex-1 rounded-md" style={{ background: `linear-gradient(180deg, ${c}, ${c}99)`, boxShadow: "0 2px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.4)" }} />
            ))}
          </div>
          <div className="mt-2 font-mono text-[11px] font-bold text-white/40">graphite navy · vivid accents</div>
        </div>
        <div className="h-4" />
      </nav>
    </div>
  );
}
