import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { CoinArt, FlameArt, GemArt, HeartArt } from "./art";
import { Pop } from "./Juice";

/* ================================================================== */
/*  FIT-SCALE — keeps fixed-size devices responsive                    */
/* ================================================================== */
export function FitScale({ width, height, children, className }: { width: number; height: number; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setS(Math.min(1, el.clientWidth / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={ref} className={cn("w-full", className)} style={{ height: height * s }}>
      <div
        style={{
          width,
          height,
          transform: `scale(${s})`,
          transformOrigin: "top left",
          marginLeft: `calc((100% - ${width * s}px) / 2)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DEVICE — sculpted phone shell                                      */
/* ================================================================== */
export const SCREEN_BG = "radial-gradient(130% 70% at 50% 0%, #15254b 0%, #0a1226 52%, #060a16 100%)";

export function Device({
  children,
  w = 340,
  h = 700,
  bg = SCREEN_BG,
  className,
  glow = true,
}: {
  children: ReactNode;
  w?: number;
  h?: number;
  bg?: string;
  className?: string;
  glow?: boolean;
}) {
  const W = w + 24;
  const H = h + 24;
  return (
    <FitScale width={W + 8} height={H + 8} className={className}>
      <div className="relative" style={{ width: W, height: H, margin: 4 }}>
        {glow && (
          <div
            className="pointer-events-none absolute -inset-10 -z-0 rounded-[80px] opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--accent-glow), transparent)" }}
          />
        )}
        {/* side buttons */}
        <span className="absolute -left-[3px] top-[120px] h-8 w-[5px] rounded-l-md bg-gradient-to-b from-[#51648f] to-[#1c2a4a]" />
        <span className="absolute -left-[3px] top-[170px] h-14 w-[5px] rounded-l-md bg-gradient-to-b from-[#51648f] to-[#1c2a4a]" />
        <span className="absolute -left-[3px] top-[236px] h-14 w-[5px] rounded-l-md bg-gradient-to-b from-[#51648f] to-[#1c2a4a]" />
        <span className="absolute -right-[3px] top-[190px] h-20 w-[5px] rounded-r-md bg-gradient-to-b from-[#51648f] to-[#1c2a4a]" />
        <div
          className="absolute inset-0 rounded-[58px] p-[11px]"
          style={{
            background: "linear-gradient(145deg,#5a6f9e 0%,#1b2847 22%,#101a33 55%,#2a3a60 80%,#62779f 100%)",
            boxShadow:
              "inset 0 2px 1px rgba(255,255,255,.35), inset 0 -2px 2px rgba(0,0,0,.6), 0 50px 80px -30px rgba(0,0,0,1), 0 0 0 1px rgba(0,0,0,.6)",
          }}
        >
          <div className="absolute inset-[5px] rounded-[53px] bg-[#02040a]" />
          <div className="relative h-full w-full overflow-hidden rounded-[47px]" style={{ background: bg, isolation: "isolate" }}>
            {children}
            <div className="pointer-events-none absolute left-1/2 top-[11px] z-[95] flex h-[30px] w-[102px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0c1426] shadow-[inset_0_0_0_2px_#152040]" />
            </div>
            <div className="pointer-events-none absolute bottom-[7px] left-1/2 z-[95] h-[5px] w-[124px] -translate-x-1/2 rounded-full bg-white/50" />
            <div
              className="pointer-events-none absolute inset-0 z-[94] rounded-[47px]"
              style={{ background: "linear-gradient(125deg, rgba(255,255,255,.07) 0%, transparent 28%)" }}
            />
          </div>
        </div>
      </div>
    </FitScale>
  );
}

/* ================================================================== */
/*  STATUS BAR                                                         */
/* ================================================================== */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  const col = dark ? "#0a1226" : "#e6eeff";
  return (
    <div className="relative z-[60] flex h-[50px] shrink-0 items-center justify-between px-8 pt-1" style={{ color: col }}>
      <span className="font-[family-name:var(--font-display)] text-[14px] font-bold tracking-tight">9:41</span>
      <span className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 17 11" fill={col}>
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 4a9 9 0 0 1 13 0M3.3 6.4a5.8 5.8 0 0 1 8.4 0" />
          <circle cx="7.5" cy="9.2" r="1.2" fill={col} stroke="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x=".5" y=".5" width="21" height="11" rx="3.5" stroke={col} strokeOpacity=".5" />
          <rect x="2" y="2" width="16" height="8" rx="2" fill={col} />
          <rect x="23" y="4" width="1.6" height="4" rx=".8" fill={col} fillOpacity=".5" />
        </svg>
      </span>
    </div>
  );
}

/* ================================================================== */
/*  GAME HUD — streak · gems · hearts                                  */
/* ================================================================== */
export function GameHUD({
  streak = 42,
  gems = 1280,
  hearts = 5,
  coins,
  onGem,
  className,
  right,
}: {
  streak?: number;
  gems?: number;
  hearts?: number;
  coins?: number;
  onGem?: () => void;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={cn("relative z-[55] flex items-center gap-2 px-4 pb-2", className)}>
      <HudPill>
        <FlameArt size={20} />
        <Pop value={streak} className="text-[#ffb347]" />
      </HudPill>
      <HudPill onClick={onGem}>
        <GemArt size={19} />
        <Pop value={gems.toLocaleString()} className="text-aqua" />
      </HudPill>
      {coins !== undefined && (
        <HudPill>
          <CoinArt size={19} />
          <Pop value={coins.toLocaleString()} className="text-gold" />
        </HudPill>
      )}
      <HudPill>
        <HeartArt size={19} />
        <Pop value={hearts} className="text-bear" />
      </HudPill>
      <div className="ml-auto">{right}</div>
    </div>
  );
}

export function HudPill({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92, y: 2 }}
      onClick={onClick}
      className="flex h-9 items-center gap-1 rounded-xl border-2 border-[#22355e] bg-[#101a33] pl-1.5 pr-2.5 font-mono text-[13px] font-black"
      style={{ boxShadow: "0 3px 0 #0a1328" }}
    >
      {children}
    </motion.button>
  );
}

/* ================================================================== */
/*  CHUNKY GAME BUTTON — Duolingo-grade 3D                             */
/* ================================================================== */
export function GameButton({
  children,
  onClick,
  tone = "accent",
  disabled,
  className,
  size = "lg",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "accent" | "bull" | "bear" | "gold" | "ghost" | "violet" | "aqua";
  disabled?: boolean;
  className?: string;
  size?: "md" | "lg";
}) {
  const T = {
    accent: ["var(--accent)", "var(--accent-edge)", "var(--accent-ink)"],
    bull: ["#2be08a", "#0f7048", "#02150b"],
    bear: ["#ff4d6a", "#8e0f2c", "#1c0309"],
    gold: ["#ffc24b", "#9a6209", "#1b1102"],
    violet: ["#9b6bff", "#4a1f9c", "#0d0620"],
    aqua: ["#38e1ff", "#0b6f8d", "#02141c"],
    ghost: ["#15223f", "#0a1328", "#a3b1d2"],
  }[tone];
  const [pressed, setPressed] = useState(false);
  const d = pressed && !disabled ? 0 : 5;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl font-[family-name:var(--font-display)] font-bold uppercase tracking-[0.08em] enabled:hover:brightness-110 disabled:cursor-not-allowed",
        size === "lg" ? "h-[54px] text-[15px]" : "h-11 text-[13px]",
        tone === "ghost" && "border-2 border-[#22355e]",
        className,
      )}
      style={
        disabled
          ? { background: "#1a2745", color: "#4a5c85", boxShadow: "0 5px 0 #0e1830" }
          : {
              background: `linear-gradient(180deg, color-mix(in srgb, ${T[0]} 82%, #fff) 0%, ${T[0]} 45%, color-mix(in srgb, ${T[0]} 85%, #000) 100%)`,
              color: T[2],
              transform: `translateY(${5 - d}px)`,
              transition: "transform 80ms cubic-bezier(.2,.9,.3,1), box-shadow 80ms cubic-bezier(.2,.9,.3,1), filter 150ms",
              boxShadow: `0 ${d}px 0 ${T[1]}, 0 ${d * 2.8}px ${d * 4.4}px -12px ${T[0]}`,
            }
      }
    >
      {!disabled && tone !== "ghost" && (
        <span className="pointer-events-none absolute inset-x-3 top-[5px] h-[34%] rounded-full bg-white/30" />
      )}
      <span className="relative flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
