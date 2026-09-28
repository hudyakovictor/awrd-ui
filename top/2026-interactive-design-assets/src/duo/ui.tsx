import { AnimatePresence, animate, motion } from "framer-motion";
import { Check, Heart, X } from "lucide-react";
import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { useFx } from "../fx/fx";

/** Duolingo-style palette */
/** Neo-skeuomorphic palette (navy graphite + copper accent) */
export const D = {
  green: "#22c55e",
  greenDark: "#15803d",
  greenText: "#4ade80",
  blue: "#3b82f6",
  blueDark: "#1d4ed8",
  red: "#ef4444",
  redDark: "#b91c1c",
  orange: "#f97316",
  orangeDark: "#c2410c",
  accentHi: "#fb923c",
  yellow: "#fbbf24",
  purple: "#8b5cf6",
  lime: "#4ade80",
  pink: "#f472b6",
  navy: "#05080f",
  screen: "#121b30",
  card: "#151e36",
  line: "#273556",
  track: "#060a14",
  muted: "#8593b8",
} as const;

export type Tone = "green" | "blue" | "red" | "orange" | "yellow" | "purple" | "ghost";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; full?: boolean; size?: "md" | "sm" };

export function DuoButton({ tone = "orange", full, size = "md", className = "", children, ...rest }: BtnProps) {
  return (
    <button {...rest} className={`duo-btn duo-${tone} ${size === "sm" ? "duo-btn-sm" : ""} ${full ? "w-full" : ""} ${className}`}>
      {children}
    </button>
  );
}

export function LessonProgress({ value, color = D.green }: { value: number; color?: string }) {
  const fx = useFx();
  return (
    <div className="relative h-4 flex-1 overflow-hidden rounded-full bg-[#2a3a6e]" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className="relative h-full rounded-full"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${Math.max(6, Math.min(1, value) * 100)}%` }}
        transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 18 }}
      >
        <div className="absolute left-2.5 right-2.5 top-[3px] h-[5px] rounded-full bg-white/35" />
      </motion.div>
    </div>
  );
}

export function HeartCount({ n, breakKey = 0 }: { n: number; breakKey?: number }) {
  const fx = useFx();
  return (
    <div className="relative flex items-center gap-1 text-lg font-black text-[#ff4b4b]">
      <motion.span
        key={breakKey}
        animate={breakKey && !fx.reduced ? { scale: [1, 1.5, 0.9, 1], rotate: [0, -14, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="inline-flex"
      >
        <Heart size={24} fill="currentColor" strokeWidth={0} />
      </motion.span>
      <span className="tnum">{n}</span>
      <AnimatePresence>
        {breakKey > 0 && (
          <motion.span
            key={`b${breakKey}`}
            className="absolute -top-2 left-3 text-sm font-black"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -22 }}
            transition={{ duration: 0.9 }}
          >
            −1
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CountUp({ to, duration = 1, delay = 0, suffix = "" }: { to: number; duration?: number; delay?: number; suffix?: string }) {
  const fx = useFx();
  const [v, setV] = useState(0);
  useEffect(() => {
    const a = animate(0, to, {
      duration: fx.t(duration) || 0.01,
      delay: fx.t(delay),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (x) => setV(Math.round(x)),
    });
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return (
    <>
      {v}
      {suffix}
    </>
  );
}

export function StatCard({ label, color, children, delay = 0 }: { label: string; color: string; children: ReactNode; delay?: number }) {
  const fx = useFx();
  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.85 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 18, delay }}
      className="overflow-hidden rounded-2xl border-2"
      style={{ borderColor: color, background: color }}
    >
      <div className="py-1 text-center text-xs font-black uppercase tracking-wide text-[#0a1230]">{label}</div>
      <div className="flex h-14 items-center justify-center gap-1.5 rounded-t-xl bg-[#132250] text-xl font-black" style={{ color }}>
        {children}
      </div>
    </motion.div>
  );
}

export function TypeLine({ text, onDone }: { text: string; onDone?: () => void }) {
  const fx = useFx();
  const [n, setN] = useState(fx.reduced ? text.length : 0);
  useEffect(() => {
    if (fx.reduced) {
      setN(text.length);
      onDone?.();
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          onDone?.();
          return v;
        }
        return v + 1;
      });
    }, 18 / fx.speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <>
      {text.slice(0, n)}
      <span className="opacity-0">{text.slice(n)}</span>
    </>
  );
}

export function FeedbackSheet({
  state,
  title,
  detail,
  onContinue,
  cta = "Continue",
}: {
  state: "correct" | "wrong" | null;
  title: string;
  detail?: string;
  onContinue: () => void;
  cta?: string;
}) {
  const fx = useFx();
  const ok = state === "correct";
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
          className={`absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] px-4 pb-5 pt-5 ${ok ? "bg-[#1d3b2f]" : "bg-[#43222e]"}`}
          role="status"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 15, delay: 0.08 }}
              className={`grid h-11 w-11 place-items-center rounded-full ${ok ? "bg-[#58cc02]" : "bg-[#ff4b4b]"}`}
            >
              {ok ? <Check size={26} strokeWidth={4} color="#fff" /> : <X size={26} strokeWidth={4} color="#fff" />}
            </motion.div>
            <div className={`text-2xl font-black ${ok ? "text-[#79d634]" : "text-[#ff6b6b]"}`}>{title}</div>
          </div>
          {detail && <p className={`mt-2 text-base font-bold ${ok ? "text-[#79d634]" : "text-[#ff9090]"}`}>{detail}</p>}
          <DuoButton tone={ok ? "green" : "red"} full className="mt-4" onClick={onContinue} autoFocus>
            {cta}
          </DuoButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
