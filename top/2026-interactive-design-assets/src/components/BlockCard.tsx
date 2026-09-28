import { motion } from "framer-motion";
import { Focus, RotateCcw, Sparkles } from "lucide-react";
import type { BlockMeta } from "../blocks/registry";
import { FEATURED, interactionsOf } from "../blocks/tags";
import { useFx } from "../fx/fx";
import { InteractionChips, SceneStage, useScene } from "./Scene";

export const CAT_COLORS: Record<string, string> = {
  Mechanics: "#22c55e",
  Tactile: "#fb923c",
  Arcade: "#ef4444",
  VFX: "#fbbf24",
  Lessons: "#22c55e",
  Character: "#8b5cf6",
  Reveal: "#fbbf24",
  "Decision Input": "#3b82f6",
  Feedback: "#fb923c",
  Rewards: "#fbbf24",
  "Market Data": "#22c55e",
  Navigation: "#3b82f6",
  Onboarding: "#ef4444",
  Social: "#8b5cf6",
  Transitions: "#f97316",
};

export function BlockCard({ b, onFocus, i }: { b: BlockMeta; onFocus: () => void; i: number }) {
  const fx = useFx();
  const scene = useScene();
  const Cmp = b.Component;
  const accent = CAT_COLORS[b.category] ?? "#fb923c";
  const featured = FEATURED.has(b.id);

  return (
    <motion.article
      initial={fx.reduced ? false : { opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 150, damping: 20, delay: (i % 3) * 0.07 }}
      className="group relative"
      id={`block-${b.id}`}
    >
      <div
        className="pointer-events-none absolute -inset-3 rounded-[36px] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${accent}2a, transparent 65%)` }}
        aria-hidden
      />
      <div
        className="shine-card relative overflow-hidden rounded-[28px] border"
        style={{
          borderColor: featured ? `${accent}55` : "rgba(255,255,255,.1)",
          background: "linear-gradient(165deg, rgba(28,40,72,.8), rgba(11,16,32,.94))",
          boxShadow: featured ? `var(--e3), var(--bevel), 0 0 0 1px ${accent}22, 0 0 40px ${accent}14` : "var(--e3), var(--bevel)",
        }}
      >
        {/* meta row */}
        <div className="relative z-10 flex items-center gap-2 px-5 pt-5">
          <span className="font-display rounded-xl border border-white/10 px-2.5 py-1 text-[13px] font-black tracking-wider" style={{ color: accent, background: "rgba(0,0,0,.35)", boxShadow: "var(--inset)", textShadow: `0 0 12px ${accent}` }}>
            {b.n}
          </span>
          <span className="chip !h-[30px] !text-[11.5px] uppercase" style={{ color: accent }}>
            {b.category}
          </span>
          {featured && (
            <span className="chip !h-[30px] !text-[11px] uppercase" style={{ color: "#fbbf24" }}>
              <Sparkles size={12} strokeWidth={3} /> Scene
            </span>
          )}
          <span className="ml-auto flex gap-1.5">
            <button onClick={() => { fx.sfx("click"); scene.replay(); }} aria-label={`Replay ${b.title}`} title="Replay" className="duo-btn duo-ghost duo-btn-sm !h-9 !w-9 !rounded-xl !px-0">
              <RotateCcw size={16} strokeWidth={3} />
            </button>
            <button onClick={() => { fx.sfx("open"); onFocus(); }} aria-label={`Open ${b.title} in Focus View`} title="Focus View" className="duo-btn duo-orange duo-btn-sm !h-9 !w-9 !rounded-xl !px-0">
              <Focus size={16} strokeWidth={3} />
            </button>
          </span>
        </div>

        {/* scene */}
        <div className="relative flex justify-center px-5 pb-4 pt-6">
          <SceneStage scene={scene}>
            <Cmp />
          </SceneStage>
        </div>

        {/* footer */}
        <div className="relative z-10 border-t border-white/10 bg-black/25 px-5 pb-5 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[21px] font-black leading-tight">{b.title}</h3>
            <InteractionChips list={interactionsOf(b)} size="sm" />
          </div>
          <p className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-white/55">{b.desc}</p>
        </div>
      </div>
    </motion.article>
  );
}
