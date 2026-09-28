import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Copy, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { BlockMeta } from "../blocks/registry";
import { useFx } from "../fx/fx";
import { PhoneFrame } from "./PhoneFrame";

interface Props {
  list: BlockMeta[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}

const ROWS: [keyof Pick<BlockMeta, "trigger" | "duration" | "easing" | "haptics" | "sound" | "reduced">, string][] = [
  ["trigger", "Trigger"],
  ["duration", "Duration"],
  ["easing", "Easing"],
  ["haptics", "Haptics"],
  ["sound", "Sound"],
  ["reduced", "Reduced motion"],
];

export function DetailModal({ list, index, onClose, onIndex }: Props) {
  const b = index >= 0 ? list[index] : null;
  const [k, setK] = useState(0);
  const [copied, setCopied] = useState(false);
  const fx = useFx();

  useEffect(() => {
    setK((x) => x + 1);
  }, [index]);

  useEffect(() => {
    if (!b) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % list.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + list.length) % list.length);
      if (e.key.toLowerCase() === "r" && !(e.target instanceof HTMLInputElement)) setK((x) => x + 1);
    };
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
  }, [b, index, list.length, onClose, onIndex]);

  const copy = () => {
    if (!b) return;
    const { id, trigger, duration, easing, haptics, sound, reduced } = b;
    navigator.clipboard?.writeText(JSON.stringify({ id, trigger, duration, easing, haptics, sound, reducedMotion: reduced }, null, 2));
    setCopied(true);
    fx.sfx("coin");
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <AnimatePresence>
      {b && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-md"
          style={{ background: "radial-gradient(ellipse at 50% 20%, rgba(255,106,43,.08), rgba(3,6,18,.88) 70%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={b.title}
        >
          <div className="flex min-h-full items-center justify-center p-4 md:p-8">
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="relative grid w-full max-w-6xl gap-8 overflow-hidden rounded-[36px] border border-white/10 p-6 text-base md:grid-cols-[auto_1fr] md:p-10"
              style={{ background: "linear-gradient(165deg, rgba(40,52,98,.9), rgba(12,17,40,.96))", boxShadow: "0 30px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.12)" }}
            >
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #f97316, transparent 70%)" }} aria-hidden />

              <motion.button
                onClick={onClose}
                aria-label="Close"
                whileHover={{ rotate: 90, scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-2xl text-white/60 transition-colors hover:text-white"
                style={{ background: "linear-gradient(145deg,#2b3760,#1a2347)", boxShadow: "0 4px 0 #0b1128, var(--e1)" }}
              >
                <X size={19} strokeWidth={3} />
              </motion.button>

              <div className="flex flex-col items-center gap-4">
                <motion.div key={b.id} initial={{ rotateY: -14, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}>
                  <PhoneFrame>
                    <b.Component key={`${b.id}-${k}`} />
                  </PhoneFrame>
                </motion.div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { fx.sfx("swipe"); onIndex((index - 1 + list.length) % list.length); }} aria-label="Previous" className="duo-btn duo-ghost duo-btn-sm !h-10 !w-10 !px-0 !rounded-full"><ChevronLeft size={18} strokeWidth={3} /></button>
                  <button onClick={() => { fx.sfx("click"); setK((x) => x + 1); }} className="duo-btn duo-ghost duo-btn-sm !h-10">
                    <RotateCcw size={15} strokeWidth={3} /> Replay <kbd className="font-mono text-[10px] text-white/30">R</kbd>
                  </button>
                  <button onClick={() => { fx.sfx("swipe"); onIndex((index + 1) % list.length); }} aria-label="Next" className="duo-btn duo-ghost duo-btn-sm !h-10 !w-10 !px-0 !rounded-full"><ChevronRight size={18} strokeWidth={3} /></button>
                </div>
                <div className="font-mono text-[13px] font-bold text-white/35">
                  {index + 1} / {list.length} · ← → navigate · esc close
                </div>
              </div>

              <div className="min-w-0 pt-8 md:pt-2">
                <motion.div key={`t-${b.id}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08, type: "spring", stiffness: 220, damping: 24 }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip uppercase" style={{ color: "#fb923c" }}>{b.category}</span>
                    <span className="font-mono text-[13px] font-bold text-white/35">#{b.n}</span>
                  </div>
                  <h2 className="font-display mt-3 text-3xl font-black leading-tight md:text-4xl">{b.title}</h2>
                  <p className="mt-3 max-w-[52ch] text-[17px] font-bold leading-relaxed text-white/60">{b.desc}</p>
                </motion.div>

                <div className="inset-well mt-6 overflow-hidden rounded-2xl">
                  {ROWS.map(([key, label], i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className={`flex items-start gap-4 px-4 py-2.5 ${i > 0 ? "border-t border-white/5" : ""}`}
                    >
                      <span className="w-32 shrink-0 pt-0.5 text-[12px] font-black uppercase tracking-widest text-[#fb923c]/80">{label}</span>
                      <span className="font-mono text-[13.5px] font-bold leading-relaxed text-white/80">{String(b[key])}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {b.tech.map((t, i) => (
                    <motion.span key={t} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 400, damping: 18 }} className="chip !text-[12px]">
                      {t}
                    </motion.span>
                  ))}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {b.checks.map((c, i) => (
                    <motion.div key={c} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }} className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[.03] px-3 py-2 text-[14px] font-bold text-white/70">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: "linear-gradient(180deg,#4ade80,#22c55e)", boxShadow: "0 2px 0 #15803d" }}>
                        <Check size={13} strokeWidth={4} color="#052e16" />
                      </span>
                      {c}
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={copy}
                  whileTap={{ scale: 0.96 }}
                  className="duo-btn duo-blue mt-6"
                >
                  {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={17} strokeWidth={2.8} />}
                  {copied ? "Copied to clipboard" : "Copy motion spec (JSON)"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
