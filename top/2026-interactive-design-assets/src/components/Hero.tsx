import { motion } from "framer-motion";
import { ChevronDown, Focus, Play, Sparkles, Volume2 } from "lucide-react";
import { Mascot, type Mood } from "../duo/Mascot";
import { useFx } from "../fx/fx";
import { LiveDot, Magnetic, SplitHeadline } from "../fx/Motion";
import { useStats } from "../fx/stats";
import { useState } from "react";

export function Hero({ total, scenes, onPlay, onFocus }: { total: number; scenes: number; onPlay: () => void; onFocus: () => void }) {
  const fx = useFx();
  const { counts } = useStats();
  const [mood, setMood] = useState<Mood>("idle");

  const poke = () => {
    setMood("happy");
    fx.sfx("pop");
    fx.haptic(10);
    window.setTimeout(() => setMood("idle"), 1100);
  };

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10" style={{ background: "linear-gradient(160deg, rgba(26,38,72,.78), rgba(8,12,26,.94))", boxShadow: "var(--e4), var(--bevel)" }}>
      <div className="pointer-events-none absolute -left-20 -top-28 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }} aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 right-[20%] h-64 w-64 rounded-full opacity-[.14] blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} aria-hidden />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      <div className="relative grid items-center gap-4 px-6 py-6 md:grid-cols-[1fr_auto] md:px-9 md:py-7">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-1 text-[12px] font-black uppercase tracking-wider text-white/75" style={{ boxShadow: "var(--inset)" }}>
            <LiveDot size={8} />
            <Sparkles size={13} className="text-[#fbbf24]" />
            Interactive lab · {total} testable blocks · {scenes} scenes
          </div>

          <h1 className="font-display mt-4 text-[clamp(2.3rem,5.4vw,4.4rem)] font-black leading-[0.92] tracking-tight" style={{ perspective: 600 }}>
            <SplitHeadline text="EVERY TAP" accent="XX" delay={0.05} />{" "}
            <SplitHeadline text="FEELS ALIVE" accent="ALIVE" delay={0.25} />
          </h1>

          <p className="mt-3 max-w-[60ch] text-[16.5px] font-bold leading-relaxed text-white/60">
            Every block reacts to tap, drag, swipe, hold and tilt. Pick a category, open a scene in <span className="text-white/85">Focus View</span> and watch the <span className="text-[#fb923c]">VFX Console</span> count every flash, particle and haptic.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Magnetic>
              <button onClick={() => { fx.sfx("open"); fx.haptic(15); onPlay(); }} className="duo-btn duo-orange animate-glow-pulse">
                <Play size={18} fill="currentColor" /> Full Loop
              </button>
            </Magnetic>
            <Magnetic>
              <button onClick={() => { fx.sfx("open"); onFocus(); }} className="duo-btn duo-ghost">
                <Focus size={18} strokeWidth={2.8} /> Focus View
              </button>
            </Magnetic>
            {!fx.sound && (
              <Magnetic>
                <button onClick={() => { fx.setSound(true); fx.sfx("fanfare"); }} className="duo-btn duo-ghost">
                  <Volume2 size={18} strokeWidth={2.8} /> Sound on
                </button>
              </Magnetic>
            )}
            <a href="#catalog" onClick={() => fx.sfx("click")} className="group ml-1 inline-flex items-center gap-1 text-[14px] font-black uppercase tracking-wide text-white/55 hover:text-white">
              Catalog <ChevronDown size={17} strokeWidth={3} className="transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { l: "effects", v: counts.effects, c: "#fb923c" },
              { l: "particles", v: counts.particles, c: "#fbbf24" },
              { l: "success", v: counts.success, c: "#22c55e" },
              { l: "combos", v: counts.combo, c: "#f472b6" },
            ].map((s) => (
              <span key={s.l} className="inset-well flex items-baseline gap-1.5 rounded-xl px-3 py-1.5">
                <motion.span key={s.v} initial={s.v ? { scale: 1.3 } : false} animate={{ scale: 1 }} className="font-mono text-[17px] font-bold tabular-nums" style={{ color: s.v ? s.c : "rgba(255,255,255,.3)", textShadow: s.v ? `0 0 10px ${s.c}66` : undefined }}>
                  {s.v.toLocaleString("en-US")}
                </motion.span>
                <span className="text-[11px] font-black uppercase tracking-wider text-white/40">{s.l}</span>
              </span>
            ))}
          </div>
        </div>

        {/* mascot */}
        <div className="relative mx-auto hidden h-[260px] w-[260px] items-center justify-center sm:flex">
          <div className="absolute inset-4 rounded-full opacity-30 blur-2xl" style={{ background: "conic-gradient(from 0deg, #f97316, #fbbf24, #8b5cf6, #3b82f6, #f97316)", animation: fx.reduced ? undefined : "spin-slow 18s linear infinite" }} aria-hidden />
          <div className="absolute inset-10 rounded-full border border-white/10" style={{ boxShadow: "inset 0 0 40px rgba(249,115,22,.22)" }} aria-hidden />
          <motion.div initial={fx.reduced ? false : { scale: 0.6, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ delay: 0.3, type: "spring", stiffness: 170, damping: 14 }} className="relative">
            <div className="animate-floaty">
              <Mascot mood={mood} size={196} onClick={poke} />
            </div>
          </motion.div>
          <span className="chip absolute bottom-2 left-1/2 -translate-x-1/2 !text-[11.5px]" style={{ color: "#fb923c" }}>
            tap Moo
          </span>
        </div>
      </div>
    </section>
  );
}
