import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useFx } from "../fx/fx";

export type Mood = "idle" | "happy" | "cheer" | "sad" | "think" | "wow" | "sleep" | "talk";

const INK = "#1b1f3b";

export const SKINS = {
  green: { body: "#22c55e", belly: "#bbf7d0", shade: "#15803d" },
  blue: { body: "#3b82f6", belly: "#bfdbfe", shade: "#1d4ed8" },
  purple: { body: "#8b5cf6", belly: "#ddd6fe", shade: "#6d28d9" },
  orange: { body: "#f97316", belly: "#fed7aa", shade: "#c2410c" },
  pink: { body: "#f472b6", belly: "#fbcfe8", shade: "#be185d" },
} as const;
export type Skin = keyof typeof SKINS;

interface Props {
  mood?: Mood;
  size?: number;
  skin?: Skin;
  className?: string;
  onClick?: () => void;
  label?: string;
}

const BODY: Record<Mood, TargetAndTransition> = {
  idle: { y: [0, -3, 0], scaleY: [1, 0.975, 1], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
  talk: { y: [0, -2, 0], transition: { duration: 0.32, repeat: Infinity, ease: "easeInOut" } },
  happy: { y: [0, -18, 0, -7, 0], scaleY: [1, 1.04, 0.94, 1.02, 1], transition: { duration: 0.9, ease: "easeOut" } },
  cheer: { y: [0, -20, 0], scaleY: [1, 1.05, 0.92], transition: { duration: 0.55, repeat: Infinity, ease: "easeOut" } },
  sad: { y: 5, rotate: -5, scaleY: 0.95, transition: { type: "spring", stiffness: 120, damping: 12 } },
  think: { rotate: [-4, 4, -4], transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  wow: { scale: [1, 1.14, 1], transition: { duration: 0.35 } },
  sleep: { scaleY: [1, 0.95, 1], transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
};

const ARMS: Record<Mood, [number, number]> = {
  idle: [8, -8],
  talk: [20, -20],
  happy: [60, -60],
  cheer: [155, -155],
  sad: [-12, 12],
  think: [8, 125],
  wow: [100, -100],
  sleep: [0, 0],
};

/** "Moo" — the Signal Arena bull. Pure SVG, 8 moods, blinking, talking mouth. */
export function Mascot({ mood = "idle", size = 120, skin = "green", className = "", onClick, label = "Moo the bull" }: Props) {
  const fx = useFx();
  const s = SKINS[skin];
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);

  useEffect(() => {
    if (mood === "happy" || mood === "cheer" || mood === "sleep") return;
    let t = 0;
    let u = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        u = window.setTimeout(() => setBlink(false), 120);
        loop();
      }, 1800 + Math.random() * 2600);
    };
    loop();
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, [mood]);

  useEffect(() => {
    if (mood !== "talk" || fx.reduced) {
      setMouthOpen(false);
      return;
    }
    const id = setInterval(() => setMouthOpen((o) => !o), 150);
    return () => clearInterval(id);
  }, [mood, fx.reduced]);

  const [la, ra] = ARMS[mood];
  const armT = fx.reduced
    ? { duration: 0 }
    : mood === "cheer"
      ? { duration: 0.55, repeat: Infinity, ease: "easeOut" as const }
      : { type: "spring" as const, stiffness: 260, damping: 14 };
  const armL = mood === "cheer" && !fx.reduced ? { rotate: [140, 165, 140] } : { rotate: la };
  const armR = mood === "cheer" && !fx.reduced ? { rotate: [-140, -165, -140] } : { rotate: ra };

  const eyes = (): ReactNode => {
    if (mood === "happy" || mood === "cheer") {
      return (
        <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
          <path d="M36 60 Q45 49 54 60" />
          <path d="M66 60 Q75 49 84 60" />
        </g>
      );
    }
    if (mood === "sleep") {
      return (
        <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M37 58 Q45 64 53 58" />
          <path d="M67 58 Q75 64 83 58" />
        </g>
      );
    }
    const r = mood === "wow" ? 13.5 : 11.5;
    const pr = mood === "wow" ? 5 : 6.5;
    const off = mood === "think" ? { x: 3.5, y: -4 } : mood === "sad" ? { x: 0, y: 3 } : { x: 1, y: 1 };
    return (
      <g>
        <motion.g animate={{ scaleY: blink ? 0.08 : 1 }} transition={{ duration: 0.07 }}>
          {[45, 75].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={58} r={r} fill="#fff" />
              <circle cx={cx + off.x} cy={58 + off.y} r={pr} fill={INK} />
              <circle cx={cx + off.x + 2.2} cy={58 + off.y - 2.6} r={2.1} fill="#fff" />
            </g>
          ))}
        </motion.g>
        {mood === "sad" && (
          <g stroke={INK} strokeWidth={3.5} strokeLinecap="round">
            <line x1={35} y1={46} x2={52} y2={41} />
            <line x1={85} y1={46} x2={68} y2={41} />
          </g>
        )}
        {mood === "think" && (
          <g stroke={INK} strokeWidth={3.5} strokeLinecap="round">
            <line x1={36} y1={42} x2={53} y2={44} />
            <line x1={67} y1={40} x2={84} y2={37} />
          </g>
        )}
      </g>
    );
  };

  const mouth = (): ReactNode => {
    switch (mood) {
      case "happy":
      case "cheer":
        return (
          <g>
            <path d="M50 88 Q60 104 70 88 Z" fill={INK} />
            <path d="M54 96 Q60 101 66 96 Q60 92 54 96 Z" fill="#ff7a93" />
          </g>
        );
      case "sad":
        return <path d="M52 97 Q60 90 68 97" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
      case "think":
        return <circle cx={66} cy={94} r={3.2} fill={INK} />;
      case "wow":
        return <ellipse cx={60} cy={94} rx={6} ry={7.5} fill={INK} />;
      case "sleep":
        return <path d="M55 93 Q60 96 65 93" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
      case "talk":
        return mouthOpen ? <ellipse cx={60} cy={93} rx={7} ry={6} fill={INK} /> : <path d="M53 91 Q60 97 67 91" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
      default:
        return <path d="M53 91 Q60 97 67 91" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    }
  };

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      aria-label={onClick ? label : undefined}
      role={onClick ? undefined : "img"}
      className={`relative inline-block shrink-0 select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute bottom-[2%] left-1/2 h-[8%] w-[54%] -translate-x-1/2 rounded-[50%] bg-black/25" />
      <motion.div key={mood} className="absolute inset-0" style={{ originY: 1 }} animate={fx.reduced ? undefined : BODY[mood]}>
        <svg viewBox="0 0 120 124" width={size} height={size} className="overflow-visible">
          {/* horns */}
          <path d="M34 40 C22 33 17 20 25 11 C28 23 36 29 45 31 Z" fill="#fff4d6" stroke={s.shade} strokeWidth={2} strokeLinejoin="round" />
          <path d="M86 40 C98 33 103 20 95 11 C92 23 84 29 75 31 Z" fill="#fff4d6" stroke={s.shade} strokeWidth={2} strokeLinejoin="round" />
          {/* arms (behind body) */}
          <motion.ellipse cx={19} cy={82} rx={7.5} ry={14} fill={s.body} stroke={s.shade} strokeWidth={2} style={{ originX: 0.6, originY: 0.1 }} animate={armL} transition={armT} />
          <motion.ellipse cx={101} cy={82} rx={7.5} ry={14} fill={s.body} stroke={s.shade} strokeWidth={2} style={{ originX: 0.4, originY: 0.1 }} animate={armR} transition={armT} />
          {/* feet */}
          <ellipse cx={44} cy={113} rx={11} ry={6} fill="#ff9600" />
          <ellipse cx={76} cy={113} rx={11} ry={6} fill="#ff9600" />
          {/* body */}
          <path d="M60 26 C90 26 104 50 104 76 C104 100 86 112 60 112 C34 112 16 100 16 76 C16 50 30 26 60 26 Z" fill={s.body} />
          <path d="M18 84 C22 104 40 112 60 112 C80 112 98 104 102 84 C96 100 80 106 60 106 C40 106 24 100 18 84 Z" fill={s.shade} opacity={0.55} />
          <path d="M30 40 C36 32 46 28 56 28" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} fill="none" strokeLinecap="round" />
          {/* tuft */}
          <path d="M50 30 C50 18 58 14 60 24 C63 15 71 18 69 30 Z" fill={s.body} />
          {/* snout */}
          <ellipse cx={60} cy={88} rx={21} ry={14} fill={s.belly} />
          <ellipse cx={52.5} cy={84} rx={2.6} ry={3.2} fill={s.shade} />
          <ellipse cx={67.5} cy={84} rx={2.6} ry={3.2} fill={s.shade} />
          {/* cheeks */}
          <circle cx={31} cy={74} r={6} fill="#ff8fb1" opacity={0.55} />
          <circle cx={89} cy={74} r={6} fill="#ff8fb1" opacity={0.55} />
          {eyes()}
          {mouth()}
          {mood === "sad" && !fx.reduced && (
            <motion.path d="M34 66 Q31 72 34 75 Q37 72 34 66 Z" fill="#7fd3ff" animate={{ y: [0, 16], opacity: [1, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeIn" }} />
          )}
        </svg>
      </motion.div>

      <AnimatePresence>
        {mood === "think" && (
          <motion.span
            key="q"
            initial={{ opacity: 0, y: 6, scale: 0.6 }}
            animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ y: { duration: 1.6, repeat: Infinity } }}
            className="absolute -right-[4%] -top-[6%] font-black text-[#ffc800]"
            style={{ fontSize: size * 0.24 }}
          >
            ?
          </motion.span>
        )}
        {mood === "sleep" &&
          [0, 1, 2].map((k) => (
            <motion.span
              key={`z${k}`}
              className="absolute right-0 top-0 font-black text-[#a8e1fc]"
              style={{ fontSize: size * (0.12 + k * 0.04) }}
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={fx.reduced ? { opacity: 1 } : { opacity: [0, 1, 0], x: [0, 10 + k * 6], y: [0, -24 - k * 8] }}
              transition={{ duration: 2.4, delay: k * 0.7, repeat: Infinity }}
            >
              z
            </motion.span>
          ))}
        {mood === "wow" &&
          [-1, 1].map((d) => (
            <motion.span
              key={`w${d}`}
              className="absolute top-[4%] font-black text-[#ffc800]"
              style={{ fontSize: size * 0.18, [d < 0 ? "left" : "right"]: "-2%" }}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: d * 20 }}
              exit={{ scale: 0 }}
            >
              ✦
            </motion.span>
          ))}
      </AnimatePresence>
    </Wrapper>
  );
}

export function Bubble({ children, className = "", tail = "left" }: { children: ReactNode; className?: string; tail?: "left" | "right" | "bottom" }) {
  const tailCls =
    tail === "left"
      ? "-left-[9px] top-1/2 -mt-2 border-b-2 border-l-2"
      : tail === "right"
        ? "-right-[9px] top-1/2 -mt-2 border-r-2 border-t-2"
        : "-bottom-[9px] left-8 border-b-2 border-r-2";
  return (
    <div className={`skeu-raised relative rounded-2xl border-2 border-transparent px-4 py-3 font-bold leading-snug ${className}`}>
      <span className={`absolute h-4 w-4 rotate-45 border-transparent bg-[#1d2947] ${tailCls}`} />
      <span className="relative">{children}</span>
    </div>
  );
}
