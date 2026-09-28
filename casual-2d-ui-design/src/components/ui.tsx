import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ghost, Plus } from "lucide-react";
import { cn } from "../utils/cn";

/* ===================== game-art icons ===================== */

export const CoinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="coing" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe98a" /><stop offset=".55" stopColor="#ffcb40" /><stop offset="1" stopColor="#ff9a1f" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coing)" stroke="#b45d06" strokeWidth="2" />
    <circle cx="12" cy="12" r="6.4" fill="none" stroke="#fff2b8" strokeWidth="1.6" opacity=".85" />
    <path d="M12 8.2v7.6M9.6 9.6h3.4a1.7 1.7 0 0 1 0 3.4h-2.2a1.7 1.7 0 0 0 0 3.4h3.8" stroke="#a3540a" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

export const GemIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="gemg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c9a8ff" /><stop offset=".5" stopColor="#8b5cff" /><stop offset="1" stopColor="#5a2ee0" />
      </linearGradient>
    </defs>
    <path d="M7 3.5h10l4 5.5-9 11.5L3 9z" fill="url(#gemg)" stroke="#3c1d94" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M3 9h18M7 3.5 9.6 9 12 20.5M17 3.5 14.4 9 12 20.5" fill="none" stroke="#e4d4ff" strokeWidth="1.1" opacity=".8" />
  </svg>
);

export const BoltIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="boltg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9dffe9" /><stop offset="1" stopColor="#07bcd8" />
      </linearGradient>
    </defs>
    <path d="M13.5 2 5 13.6h5.4L9.8 22l8.9-12.4h-5.6z" fill="url(#boltg)" stroke="#075a6e" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const StarIcon = ({ size = 22, on = true }: { size?: number; on?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: on ? "drop-shadow(0 2px 0 rgba(120,60,0,.5))" : "none" }}>
    <defs>
      <linearGradient id="starg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3b0" /><stop offset=".5" stopColor="#ffcb40" /><stop offset="1" stopColor="#ff9a1f" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"
      fill={on ? "url(#starg)" : "#233b74"}
      stroke={on ? "#b45d06" : "#16295c"}
      strokeWidth="1.8" strokeLinejoin="round"
    />
  </svg>
);

export const CrownIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 8.5 7 11l5-6 5 6 4-2.5L19 18H5z" fill="url(#starg)" stroke="#b45d06" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

/* ===================== art with fallback ===================== */

export function ArtImage({ src, alt, tint, className, style }: { src: string; alt: string; tint: string; className?: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  if (err)
    return (
      <div className={cn("flex items-center justify-center", className)}
        style={{ background: `radial-gradient(circle at 50% 30%, ${tint}55, #0d1b3f 75%)`, ...style }}>
        <Ghost size={34} style={{ color: tint }} />
      </div>
    );
  return <img src={src} alt={alt} draggable={false} style={style} onError={() => setErr(true)} className={cn("object-cover", className)} />;
}

/* ===================== jelly button ===================== */

type BtnVariant = "teal" | "gold" | "pink" | "grape" | "navy" | "red";

export function JellyBtn({
  children, variant = "teal", className, onClick, disabled, sheen = true,
}: {
  children: ReactNode; variant?: BtnVariant; className?: string;
  onClick?: () => void; disabled?: boolean; sheen?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={cn("jelly", `j-${variant}`, !sheen && "[&::after]:hidden", className)}
    >
      {children}
    </motion.button>
  );
}

/* ===================== currency pill ===================== */

export function CurrencyPill({ icon, value, onAdd }: { icon: ReactNode; value: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-1 well">
      <span className="drop-shadow">{icon}</span>
      <span className="font-mono text-[13px] leading-none text-white/95 pr-1">{value}</span>
      {onAdd && (
        <button onClick={onAdd}
          className="grid h-5 w-5 place-items-center rounded-full text-white active:scale-90 transition-transform"
          style={{ background: "linear-gradient(180deg,#42e98c,#0aa85f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 2px 4px rgba(0,0,0,.4)" }}>
          <Plus size={13} strokeWidth={3.2} />
        </button>
      )}
    </div>
  );
}

/* ===================== glossy progress bar ===================== */

export function Bar({ value, max, from = "#42e98c", to = "#19f2c4", className, h = "h-3.5" }: {
  value: number; max: number; from?: string; to?: string; className?: string; h?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn("well relative w-full", h, className)}>
      <motion.div
        className="fillbar absolute inset-y-[3px] left-[3px] rounded-full"
        style={{ background: `linear-gradient(180deg, ${from}, ${to})`, boxShadow: `0 0 10px ${to}88` }}
        animate={{ width: `calc(${pct}% - 6px)` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

/* ===================== stars row ===================== */

export const Stars = ({ n, size = 22 }: { n: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[0, 1, 2].map((i) => (
      <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.12 * i, type: "spring", stiffness: 300, damping: 14 }}>
        <StarIcon size={i === 1 ? size + 6 : size} on={i < n} />
      </motion.span>
    ))}
  </div>
);

/* ===================== modal shell ===================== */

export function Modal({ open, onClose, children, wide = false }: {
  open: boolean; onClose?: () => void; children: ReactNode; wide?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[60] flex items-center justify-center p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-[#030918]/78 backdrop-blur-[6px]" onClick={onClose} />
          <motion.div
            className={cn("panel relative w-full p-5", wide ? "max-w-[380px]" : "max-w-[330px]")}
            initial={{ scale: 0.6, y: 60, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
          >
            <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-teal/20 blur-3xl" />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ===================== title ribbon ===================== */

export function ModalTitle({ children, color = "tstrok" }: { children: ReactNode; color?: string }) {
  return (
    <div className="relative -mx-5 -mt-9 mb-4 flex justify-center">
      <div className="relative rounded-2xl px-6 py-2.5"
        style={{ background: "linear-gradient(180deg,#264a9b,#16295c)", boxShadow: "inset 0 2px 0 rgba(140,180,255,.35), inset 0 -4px 0 rgba(6,14,38,.5), 0 8px 18px -6px rgba(0,0,0,.6)" }}>
        <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 rounded-[4px] bg-navy" />
        <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 rounded-[4px] bg-navy" />
        <span className={cn("font-display text-[19px] font-black italic tracking-wide uppercase", color)}>{children}</span>
      </div>
    </div>
  );
}

/* ===================== toggle & slider ===================== */

export function JellyToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative h-7 w-13 shrink-0 rounded-full transition-colors"
      style={{
        width: 52,
        background: on ? "linear-gradient(180deg,#19f2c4,#07a8c4)" : "#0a1735",
        boxShadow: on ? "inset 0 2px 4px rgba(0,60,60,.4), 0 0 10px rgba(25,242,196,.4)" : "inset 0 2px 6px rgba(0,0,0,.6), inset 0 0 0 2px rgba(44,74,148,.5)",
      }}
    >
      <motion.span
        animate={{ x: on ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        className="absolute top-[3px] left-0 h-[22px] w-[22px] rounded-full"
        style={{ background: "linear-gradient(180deg,#fff,#cfe6ff)", boxShadow: "0 2px 4px rgba(0,0,0,.45), inset 0 -3px 4px rgba(90,140,220,.4)" }}
      />
    </button>
  );
}

export function JellySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range" min={0} max={100} value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="jelly-range w-full"
      style={{ "--p": `${value}%` } as React.CSSProperties}
    />
  );
}
