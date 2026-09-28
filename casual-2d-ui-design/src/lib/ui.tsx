import { ReactNode, CSSProperties, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "../utils/cn";

/* ══════════════════ ICONS ══════════════════ */

export const Coin = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 1px rgba(90,40,0,.5))" }}>
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2=".3" y2="1">
        <stop offset="0" stopColor="#fff3b8" /><stop offset=".45" stopColor="#ffd14a" /><stop offset="1" stopColor="#f08a12" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10.2" fill="url(#cg)" stroke="#9c4e06" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="7.2" fill="none" stroke="#fff6d4" strokeWidth="1.3" opacity=".7" />
    <path d="M12 7.4v9.2M9.4 9.4h3.9a1.9 1.9 0 0 1 0 3.8h-2.6a1.9 1.9 0 0 0 0 3.8h4.1" stroke="#9c4e06" strokeWidth="1.9" fill="none" strokeLinecap="round" />
    <ellipse cx="8.6" cy="7.6" rx="2.4" ry="1.4" fill="#fff" opacity=".5" transform="rotate(-38 8.6 7.6)" />
  </svg>
);

export const Gem = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 1px 2px rgba(60,20,140,.55))" }}>
    <defs>
      <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e2cfff" /><stop offset=".45" stopColor="#9a6bff" /><stop offset="1" stopColor="#5a24d8" />
      </linearGradient>
    </defs>
    <path d="M7.2 3.2h9.6l4.2 5.6L12 20.8 3 8.8z" fill="url(#gg)" stroke="#3a1494" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M3 8.8h18M7.2 3.2 9.7 8.8 12 20.8M16.8 3.2 14.3 8.8 12 20.8" fill="none" stroke="#f0e6ff" strokeWidth="1" opacity=".75" />
    <path d="M9.7 8.8 12 20.8l2.3-12z" fill="#fff" opacity=".28" />
  </svg>
);

export const Bolt = ({ s = 20 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 0 4px rgba(31,240,200,.6))" }}>
    <defs>
      <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d6fff5" /><stop offset=".5" stopColor="#1ff0c8" /><stop offset="1" stopColor="#0bb7d8" />
      </linearGradient>
    </defs>
    <path d="M13.8 1.8 4.6 14.2h5.6L9.4 22.2l9.4-12.8h-5.9z" fill="url(#bg1)" stroke="#05576b" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const Star = ({ s = 22, on = true }: { s?: number; on?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" style={{ filter: on ? "drop-shadow(0 2px 3px rgba(140,70,0,.6))" : "none" }}>
    <defs>
      <linearGradient id="sg" x1="0" y1="0" x2=".2" y2="1">
        <stop offset="0" stopColor="#fff8cf" /><stop offset=".45" stopColor="#ffd14a" /><stop offset="1" stopColor="#f58a10" />
      </linearGradient>
    </defs>
    <path d="M12 1.9l3 6.1 6.7.98-4.85 4.73 1.15 6.7L12 17.25 5.99 20.4l1.15-6.7L2.3 8.98 9 8z"
      fill={on ? "url(#sg)" : "#1b3564"} stroke={on ? "#9c4e06" : "#0f2148"} strokeWidth="1.6" strokeLinejoin="round" />
    {on && <path d="M12 4.6 14 8.7l4.4.7-3.2 3.1.5 4.4L12 14.9z" fill="#fff" opacity=".32" />}
  </svg>
);

export const Heart = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M12 21s-8.5-5.4-8.5-11A4.9 4.9 0 0 1 12 7.2 4.9 4.9 0 0 1 20.5 10c0 5.6-8.5 11-8.5 11z" fill="#ff5c6e" stroke="#8d1122" strokeWidth="1.6" strokeLinejoin="round" />
    <ellipse cx="8.3" cy="10" rx="1.8" ry="1.2" fill="#fff" opacity=".45" transform="rotate(-35 8.3 10)" />
  </svg>
);

export const Sword = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M19.5 2.5 21 4 10.2 14.8l-1.5-1.5z" fill="#d8e8ff" stroke="#3a5a90" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M8.6 13.3 10.7 15.4 7.9 18.2 5.8 16.1z" fill="#ffd14a" stroke="#9c4e06" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="m6.8 17.1-3.4 3.4" stroke="#9c4e06" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ShieldIco = ({ s = 16 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24">
    <path d="M12 2.4 20 5v6.4c0 5-3.4 8.7-8 10.2-4.6-1.5-8-5.2-8-10.2V5z" fill="#63b3ff" stroke="#154a8e" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 2.4 20 5v6.4c0 5-3.4 8.7-8 10.2z" fill="#2a7fd4" opacity=".55" />
    <path d="m8.2 11.6 2.8 2.8 5-5.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Chest = ({ s = 34, open = false }: { s?: number; open?: boolean }) => (
  <svg width={s} height={s * 0.86} viewBox="0 0 36 31">
    <defs>
      <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c98a3c" /><stop offset="1" stopColor="#8a5416" />
      </linearGradient>

    </defs>
    {open && <ellipse cx="18" cy="12" rx="13" ry="7" fill="#ffd14a" opacity=".45" />}
    <g transform={open ? "rotate(-22 6 13)" : ""}>
      <path d="M4 14c0-6.3 6.3-10.5 14-10.5S32 7.7 32 14z" fill="url(#wd)" stroke="#5c360a" strokeWidth="2" strokeLinejoin="round" />
      <path d="M4 14c0-6.3 6.3-10.5 14-10.5" fill="none" stroke="#ffca7a" strokeWidth="1.4" opacity=".55" />
    </g>
    <rect x="3" y="14" width="30" height="14" rx="3" fill="url(#wd)" stroke="#5c360a" strokeWidth="2" />
    <rect x="3" y="14" width="30" height="4" fill="#ffd14a" opacity=".22" />
    <rect x="14.4" y="13" width="7.2" height="9" rx="2" fill="#ffd14a" stroke="#9c4e06" strokeWidth="1.6" />
    <circle cx="18" cy="18.5" r="1.5" fill="#6b3d05" />
  </svg>
);

/* ══════════════════ ART ══════════════════ */

export function Art({ src, alt, tint = "#1ff0c8", className, style, blend = true }: {
  src: string; alt: string; tint?: string; className?: string; style?: CSSProperties; blend?: boolean;
}) {
  const [err, setErr] = useState(false);
  if (err)
    return (
      <div className={cn("relative grid place-items-center", className)}
        style={{ background: `radial-gradient(circle at 50% 42%, ${tint}55, ${tint}14 45%, transparent 72%)`, ...style }}>
        <svg viewBox="0 0 64 64" className="a-breathe h-1/2 w-1/2" style={{ filter: `drop-shadow(0 0 12px ${tint})` }}>
          <path d="M32 6c12 0 20 9 20 21v25l-7-5-6 5-7-5-7 5-6-5-7 5V27C12 15 20 6 32 6z"
            fill={tint} opacity=".5" />
          <circle cx="24" cy="27" r="4.2" fill="#04081a" /><circle cx="40" cy="27" r="4.2" fill="#04081a" />
        </svg>
      </div>
    );
  return (
    <img src={src} alt={alt} draggable={false} onError={() => setErr(true)}
      className={cn("object-cover", blend && "art-blend", className)} style={style} />
  );
}

/* ══════════════════ BUTTON ══════════════════ */

export type BtnColor = "teal" | "gold" | "pink" | "grape" | "navy" | "coral" | "mint";
const BC: Record<BtnColor, string> = { teal: "", gold: "b-gold", pink: "b-pink", grape: "b-grape", navy: "b-navy", coral: "b-coral", mint: "b-mint" };

export function Btn({ children, color = "teal", size = "md", className, onClick, disabled, full }: {
  children: ReactNode; color?: BtnColor; size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string; onClick?: () => void; disabled?: boolean; full?: boolean;
}) {
  const sz = {
    xs: "text-[10px] px-2.5 py-1.5",
    sm: "text-[12px] px-3.5 py-2",
    md: "text-[14px] px-5 py-2.5",
    lg: "text-[17px] px-6 py-3",
    xl: "text-[21px] px-7 py-3.5",
  }[size];
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn("btn3d uppercase tracking-wide", BC[color], sz, full && "w-full", className)}>
      {children}
    </button>
  );
}

/* ══════════════════ CURRENCY ══════════════════ */

export function Pill({ icon, value, onAdd, w }: { icon: ReactNode; value: string; onAdd?: boolean; w?: number }) {
  return (
    <div className="well flex items-center gap-1 py-[3px] pl-1 pr-1">
      <span className="shrink-0">{icon}</span>
      <span className="font-num text-[13px] font-semibold leading-none text-white/95 tabular-nums px-0.5" style={{ minWidth: w }}>{value}</span>
      {onAdd && (
        <span className="grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(180deg,#5cf09e,#10a75c)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), inset 0 -2px 0 #07713e, 0 2px 4px rgba(0,0,0,.5)" }}>
          <Plus size={12} strokeWidth={3.5} />
        </span>
      )}
    </div>
  );
}

/* ══════════════════ BAR ══════════════════ */

export function Bar({ v, max, c1 = "#5cf09e", c2 = "#17c46b", h = 14, label, className, delay = 0 }: {
  v: number; max: number; c1?: string; c2?: string; h?: number; label?: string; className?: string; delay?: number;
}) {
  const pct = Math.max(0, Math.min(100, (v / max) * 100));
  return (
    <div className={cn("well relative w-full", className)} style={{ height: h }}>
      <motion.div className="fill absolute left-[2.5px] rounded-full"
        style={{ top: 2.5, bottom: 2.5, background: `linear-gradient(180deg, ${c1}, ${c2})`, boxShadow: `0 0 9px ${c1}77` }}
        initial={{ width: 0 }} animate={{ width: `calc(${pct}% - 5px)` }}
        transition={{ type: "spring", stiffness: 110, damping: 20, delay }} />
      {label && (
        <span className="absolute inset-0 grid place-items-center font-num text-[9.5px] font-semibold tabular-nums text-white"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.9)" }}>{label}</span>
      )}
    </div>
  );
}

/* ══════════════════ STARS ══════════════════ */

export const Stars = ({ n, s = 22, gap = 1 }: { n: number; s?: number; gap?: number }) => (
  <div className="flex items-end" style={{ gap }}>
    {[0, 1, 2].map((i) => (
      <motion.span key={i} initial={{ scale: 0, rotate: -50 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1 + i * 0.13, type: "spring", stiffness: 320, damping: 13 }}
        className={i === 1 ? "-translate-y-[18%]" : ""}>
        <Star s={i === 1 ? s * 1.22 : s} on={i < n} />
      </motion.span>
    ))}
  </div>
);

/* ══════════════════ RIBBON TITLE ══════════════════ */

export function Ribbon({ children, color = "navy" }: { children: ReactNode; color?: "navy" | "gold" | "pink" }) {
  const bg = {
    navy: "linear-gradient(180deg,#3563b8,#16295c)",
    gold: "linear-gradient(180deg,#ffd14a,#e0790c)",
    pink: "linear-gradient(180deg,#ff8fb6,#e01f5e)",
  }[color];
  const side = { navy: "#16295c", gold: "#b45d06", pink: "#a3123f" }[color];
  return (
    <div className="relative -mt-9 mb-4 flex justify-center">
      <div className="relative rounded-[14px] px-7 py-2"
        style={{ background: bg, boxShadow: "inset 0 2px 0 rgba(255,255,255,.4), inset 0 -4px 0 rgba(0,0,0,.35), 0 10px 20px -8px rgba(0,0,0,.8)" }}>
        <span className="absolute -left-[9px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rotate-45 rounded-[4px]" style={{ background: side }} />
        <span className="absolute -right-[9px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rotate-45 rounded-[4px]" style={{ background: side }} />
        <span className="hd relative block text-[17px] uppercase leading-none">{children}</span>
      </div>
    </div>
  );
}

/* ══════════════════ MODAL ══════════════════ */

export function Modal({ open, onClose, children, max = 320 }: { open: boolean; onClose?: () => void; children: ReactNode; max?: number }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-[70] grid place-items-center p-5"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-[#030816]/80 backdrop-blur-[5px]" onClick={onClose} />
          <motion.div className="pnl noise relative w-full p-5" style={{ maxWidth: max }}
            initial={{ scale: 0.55, y: 70, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.7, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 23 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ══════════════════ CONTROLS ══════════════════ */

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="relative h-[28px] w-[52px] shrink-0 rounded-full transition-colors"
      style={{
        background: on ? "linear-gradient(180deg,#1ff0c8,#0b9fc0)" : "linear-gradient(180deg,#0a1838,#132a5c)",
        boxShadow: on
          ? "inset 0 2px 4px rgba(0,60,60,.45), 0 0 12px rgba(31,240,200,.45), inset 0 0 0 1.5px rgba(255,255,255,.2)"
          : "inset 0 3px 6px rgba(0,0,0,.75), inset 0 0 0 1.5px rgba(47,92,176,.5)",
      }}>
      <motion.span animate={{ x: on ? 25 : 3 }} transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="absolute top-[3px] left-0 h-[22px] w-[22px] rounded-full"
        style={{ background: "linear-gradient(180deg,#fff,#cde3ff)", boxShadow: "0 2px 5px rgba(0,0,0,.5), inset 0 -3px 4px rgba(90,140,220,.35)" }} />
    </button>
  );
}

export const Slider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(+e.target.value)}
    className="rng w-full" style={{ "--p": `${value}%` } as CSSProperties} />
);

/* ══════════════════ BADGE ══════════════════ */

export function Badge({ children, color = "#ff4d8d", rotate = 8 }: { children: ReactNode; color?: string; rotate?: number }) {
  return (
    <span className="absolute -right-2 -top-2 z-10 rounded-[9px] px-2 py-[3px] font-display text-[9px] font-black uppercase italic tracking-wide text-white"
      style={{
        background: `linear-gradient(180deg, ${color}, ${shade(color, -28)})`, transform: `rotate(${rotate}deg)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 0 rgba(0,0,0,.28), 0 4px 9px rgba(0,0,0,.55)",
        textShadow: "0 1px 1px rgba(0,0,0,.4)",
      }}>{children}</span>
  );
}

export function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const r = cl((n >> 16) + amt), g = cl(((n >> 8) & 255) + amt), b = cl((n & 255) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
