import { motion } from "framer-motion";
import type { ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────
 * Neo-skeuomorphic primitives shared by tactile blocks.
 * Light from top-left. Every part is a physical object.
 * ───────────────────────────────────────────────────────────── */

export function Led({ on, color = "#ff8a4c", size = 10, blink }: { on: boolean; color?: string; size?: number; blink?: boolean }) {
  return (
    <motion.span
      className="inline-block shrink-0 rounded-full"
      animate={on && blink ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
      transition={{ duration: 0.6, repeat: Infinity }}
      style={{
        width: size,
        height: size,
        background: on ? `radial-gradient(circle at 35% 30%, #fff, ${color} 45%, ${color})` : "#0b1022",
        boxShadow: on ? `0 0 ${size}px 2px ${color}, inset 0 0 2px rgba(255,255,255,.8)` : "inset 1px 1px 3px rgba(0,0,0,.85)",
        transition: "background .15s, box-shadow .15s",
      }}
    />
  );
}

export function Screw({ className = "" }: { className?: string }) {
  return (
    <span className={`absolute h-3 w-3 rounded-full ${className}`} style={{ background: "radial-gradient(circle at 35% 30%, #4a5782, #1b2340)", boxShadow: "inset 1px 1px 2px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.08)" }}>
      <span className="absolute left-1/2 top-1/2 h-[1.5px] w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/60" />
    </span>
  );
}

export function Plate({ children, className = "", screws = true }: { children: ReactNode; className?: string; screws?: boolean }) {
  return (
    <div className={`skeu-panel relative rounded-[26px] ${className}`}>
      {screws && (
        <>
          <Screw className="left-3 top-3" />
          <Screw className="right-3 top-3" />
          <Screw className="bottom-3 left-3" />
          <Screw className="bottom-3 right-3" />
        </>
      )}
      {children}
    </div>
  );
}

/** Seven-segment style readout well */
export function Readout({ value, label, color = "#ff8a4c", size = 30, className = "" }: { value: ReactNode; label?: string; color?: string; size?: number; className?: string }) {
  return (
    <div className={`skeu-inset relative overflow-hidden rounded-2xl px-4 py-2 ${className}`} style={{ background: "#0b1022" }}>
      {label && <div className="text-[10px] font-black uppercase tracking-[.2em]" style={{ color: `${color}99` }}>{label}</div>}
      <div className="tnum font-black leading-none tabular-nums" style={{ fontSize: size, color, textShadow: `0 0 12px ${color}, 0 0 2px #fff` }}>
        {value}
      </div>
      <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px)" }} />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: "linear-gradient(180deg, rgba(255,255,255,.06), transparent)" }} />
    </div>
  );
}

/** Groove-mounted progress bar with a lit fill */
export function Gauge({ value, color = "#ff8a4c", height = 14, ticks = 0, className = "" }: { value: number; color?: string; height?: number; ticks?: number; className?: string }) {
  return (
    <div className={`skeu-inset relative overflow-hidden rounded-full ${className}`} style={{ height, background: "#0b1022" }}>
      <motion.div
        className="relative h-full rounded-full"
        initial={false}
        animate={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }}
        transition={{ type: "spring", stiffness: 160, damping: 22 }}
        style={{ background: `linear-gradient(180deg, ${color}, ${color}bb)`, boxShadow: `0 0 10px ${color}88, inset 0 1px 0 rgba(255,255,255,.45)` }}
      />
      {ticks > 0 &&
        Array.from({ length: ticks - 1 }, (_, i) => (
          <span key={i} className="absolute top-0 h-full w-px bg-black/50" style={{ left: `${((i + 1) / ticks) * 100}%` }} />
        ))}
    </div>
  );
}

/** Chunky physical push button (round) */
export function PushButton({ children, color = "#e8622a", dark = "#9c3a12", size = 88, onClick, disabled, pressed, className = "", label, onPointerDownCapture }: { children: ReactNode; color?: string; dark?: string; size?: number; onClick?: () => void; disabled?: boolean; pressed?: boolean; className?: string; label?: string; onPointerDownCapture?: React.PointerEventHandler<HTMLButtonElement> }) {
  return (
    <button
      onClick={onClick}
      onPointerDownCapture={onPointerDownCapture}
      disabled={disabled}
      aria-label={label}
      className={`relative grid shrink-0 place-items-center rounded-full text-white transition-transform active:translate-y-[4px] disabled:opacity-60 ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 38% 32%, #fff3 0, transparent 40%), linear-gradient(180deg, ${color}, ${dark})`,
        boxShadow: pressed ? `inset 4px 4px 10px rgba(0,0,0,.6), inset -2px -2px 6px rgba(255,255,255,.1)` : `0 6px 0 ${dark}, 0 10px 20px rgba(4,8,22,.7), inset 0 2px 0 rgba(255,255,255,.35), 0 0 24px ${color}55`,
        transform: pressed ? "translateY(4px)" : undefined,
      }}
    >
      <span className="absolute inset-[6px] rounded-full" style={{ boxShadow: "inset 0 -3px 0 rgba(0,0,0,.25)" }} />
      <span className="relative">{children}</span>
    </button>
  );
}

/** Bezel ring around a screen / dial */
export function Bezel({ children, className = "", radius = 28 }: { children: ReactNode; className?: string; radius?: number }) {
  return (
    <div className={`relative p-[6px] ${className}`} style={{ borderRadius: radius, background: "linear-gradient(145deg, #2f3b62, #171f38)", boxShadow: "var(--e2), inset 0 1px 0 rgba(255,255,255,.15), inset 0 -2px 0 rgba(0,0,0,.5)" }}>
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: radius - 6, boxShadow: "inset 4px 4px 10px rgba(4,8,22,.75), inset -2px -2px 6px rgba(255,255,255,.05)" }}>
        {children}
      </div>
    </div>
  );
}

/** Small metal label plate */
export function Tag({ children, color = "#ff8a4c" }: { children: ReactNode; color?: string }) {
  return (
    <span className="skeu-inset inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider" style={{ color }}>
      {children}
    </span>
  );
}
