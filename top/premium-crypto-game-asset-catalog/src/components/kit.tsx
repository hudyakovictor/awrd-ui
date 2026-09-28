import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { Icon, type IconName } from "./icons";
import { ORDER } from "../order";

/* ------------------------------------------------------------------ */
/*  Sound / haptic feedback bus (WebAudio, zero assets)                */
/* ------------------------------------------------------------------ */
let ctx: AudioContext | null = null;
export const FX = { enabled: true };

export function blip(kind: "tap" | "ok" | "err" | "coin" | "level" = "tap") {
  if (!FX.enabled) return;
  try {
    ctx = ctx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;
    const seq: Record<string, number[]> = {
      tap: [440],
      ok: [660, 880],
      err: [200, 150],
      coin: [880, 1320],
      level: [523, 659, 784, 1046],
    };
    seq[kind].forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = kind === "err" ? "sawtooth" : "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + i * 0.07);
      g.gain.exponentialRampToValueAtTime(0.06, t + i * 0.07 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.16);
      o.connect(g).connect(ctx!.destination);
      o.start(t + i * 0.07);
      o.stop(t + i * 0.07 + 0.18);
    });
  } catch {
    /* noop */
  }
  if ("vibrate" in navigator) navigator.vibrate?.(kind === "err" ? [14, 30, 14] : 8);
}

/* ------------------------------------------------------------------ */
/*  Accent theming context                                             */
/* ------------------------------------------------------------------ */
export const ACCENTS = {
  bull: { name: "Bull Green", face: "#2be08a", edge: "#127a4c", ink: "#03160c", glow: "rgba(43,224,138,.45)" },
  aqua: { name: "Cyber Aqua", face: "#38e1ff", edge: "#0d7a9c", ink: "#02141c", glow: "rgba(56,225,255,.45)" },
  gold: { name: "Bullion Gold", face: "#ffc24b", edge: "#a86e10", ink: "#1a1002", glow: "rgba(255,194,75,.45)" },
  violet: { name: "Deep Violet", face: "#9b6bff", edge: "#5628b5", ink: "#0d0620", glow: "rgba(155,107,255,.45)" },
  bear: { name: "Bear Red", face: "#ff4d6a", edge: "#a01131", ink: "#1c0309", glow: "rgba(255,77,106,.45)" },
} as const;
export type AccentKey = keyof typeof ACCENTS;

const AccentCtx = createContext<{ accent: AccentKey; setAccent: (a: AccentKey) => void }>({
  accent: "bull",
  setAccent: () => {},
});
export const useAccent = () => useContext(AccentCtx);

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<AccentKey>("bull");
  useEffect(() => {
    const a = ACCENTS[accent];
    const r = document.documentElement.style;
    r.setProperty("--accent", a.face);
    r.setProperty("--accent-edge", a.edge);
    r.setProperty("--accent-ink", a.ink);
    r.setProperty("--accent-glow", a.glow);
  }, [accent]);
  return <AccentCtx.Provider value={{ accent, setAccent }}>{children}</AccentCtx.Provider>;
}

/* ------------------------------------------------------------------ */
/*  Buttons — the 3D engine                                            */
/* ------------------------------------------------------------------ */
export type BtnVariant = "accent" | "gold" | "danger" | "neutral" | "ghost" | "aqua" | "violet" | "bull";
export type BtnSize = "xs" | "sm" | "md" | "lg";

const FACES: Record<BtnVariant, { bg: string; edge: string; ink: string; glow: string }> = {
  accent: {
    bg: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 82%, #fff) 0%, var(--accent) 48%, color-mix(in srgb, var(--accent) 80%, #000) 100%)",
    edge: "var(--accent-edge)",
    ink: "var(--accent-ink)",
    glow: "var(--accent-glow)",
  },
  bull: {
    bg: "linear-gradient(180deg,#5cf0ab 0%,#2be08a 48%,#18b06a 100%)",
    edge: "#0f7048",
    ink: "#02150b",
    glow: "rgba(43,224,138,.4)",
  },
  gold: {
    bg: "linear-gradient(180deg,#ffe0a0 0%,#ffc24b 45%,#e39312 100%)",
    edge: "#9a6209",
    ink: "#1b1102",
    glow: "rgba(255,194,75,.4)",
  },
  danger: {
    bg: "linear-gradient(180deg,#ff8fa2 0%,#ff4d6a 46%,#d61f42 100%)",
    edge: "#8e0f2c",
    ink: "#1c0309",
    glow: "rgba(255,77,106,.4)",
  },
  aqua: {
    bg: "linear-gradient(180deg,#8df0ff 0%,#38e1ff 46%,#12a8cf 100%)",
    edge: "#0b6f8d",
    ink: "#02141c",
    glow: "rgba(56,225,255,.4)",
  },
  violet: {
    bg: "linear-gradient(180deg,#c4a6ff 0%,#9b6bff 46%,#6c34e0 100%)",
    edge: "#4a1f9c",
    ink: "#0d0620",
    glow: "rgba(155,107,255,.4)",
  },
  neutral: {
    bg: "linear-gradient(180deg,#2c4372 0%,#1d2e54 48%,#152444 100%)",
    edge: "#0b1226",
    ink: "#dbe5ff",
    glow: "rgba(10,16,34,.8)",
  },
  ghost: { bg: "linear-gradient(180deg,rgba(60,90,160,.18),rgba(12,20,40,.35))", edge: "#0a1124", ink: "#a3b1d2", glow: "rgba(0,0,0,.5)" },
};

const SIZES: Record<BtnSize, string> = {
  xs: "h-8 px-3 text-[10px] rounded-[10px]",
  sm: "h-10 px-4 text-[11px] rounded-xl",
  md: "h-12 px-6 text-[13px] rounded-2xl",
  lg: "h-16 px-9 text-[15px] rounded-[22px]",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  depth?: "sm" | "md" | "lg";
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  full?: boolean;
  sound?: Parameters<typeof blip>[0];
}

export function Btn({
  variant = "accent",
  size = "md",
  depth = "md",
  icon,
  iconRight,
  loading,
  full,
  sound = "tap",
  className,
  children,
  onClick,
  ...rest
}: BtnProps) {
  const f = FACES[variant];
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  return (
    <button
      {...rest}
      data-depth={depth}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
        setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 620);
        blip(sound);
        onClick?.(e);
      }}
      style={{ background: f.bg, color: f.ink, ["--edge" as any]: f.edge, ["--glow" as any]: f.glow }}
      className={cn(
        "btn3d overflow-hidden whitespace-nowrap",
        SIZES[size],
        variant === "ghost" && "backdrop-blur-sm",
        full && "w-full",
        className,
      )}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute z-[1] rounded-full"
          style={{
            left: r.x,
            top: r.y,
            width: 8,
            height: 8,
            marginLeft: -4,
            marginTop: -4,
            background: "radial-gradient(circle, rgba(255,255,255,.85), rgba(255,255,255,0) 70%)",
            animation: "rippleGrow .6s ease-out forwards",
          }}
        />
      ))}
      {loading ? (
        <span className="relative z-[4] h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} size={size === "lg" ? 20 : size === "xs" ? 13 : 16} strokeWidth={2.4} className="relative z-[4]" />
      )}
      <span className="relative z-[4]">{children}</span>
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 20 : 16} strokeWidth={2.4} className="relative z-[4]" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */
export function Cell({
  title,
  spec,
  span,
  children,
  className,
  center,
}: {
  title: string;
  spec?: string;
  span?: string;
  children: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "group/cell relative flex flex-col rounded-2xl p-4 transition-all duration-300",
        "sf-base hairline hover:-translate-y-[3px] hover:shadow-[0_18px_34px_-16px_rgba(0,0,0,.95)]",
        span,
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/cell:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px var(--accent), 0 0 34px -12px var(--accent-glow)" }}
      />
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ink-400 transition-colors group-hover/cell:text-ink-200">
          {title}
        </span>
        {spec && (
          <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wider text-ink-500 opacity-60 transition-opacity group-hover/cell:opacity-100">
            {spec}
          </span>
        )}
      </div>
      <div className={cn("relative flex-1", center && "flex items-center justify-center")}>{children}</div>
    </div>
  );
}

export function Section({
  id,
  index,
  title,
  kicker,
  count,
  children,
}: {
  id: string;
  index: string;
  title: string;
  kicker: string;
  count: string;
  children: ReactNode;
}) {
  const pos = ORDER.indexOf(id);
  const shownIndex = pos >= 0 ? String(pos + 1).padStart(2, "0") : index;
  return (
    <section id={id} className="scroll-mt-24 px-4 py-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[rgba(125,155,220,.14)] pb-4">
          <div className="flex items-end gap-4">
            <span
              className="font-mono text-[42px] leading-none font-bold opacity-25"
              style={{ color: "var(--accent)" }}
            >
              {shownIndex}
            </span>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-white sm:text-[30px]">
                {title}
              </h2>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-ink-400">{kicker}</p>
            </div>
          </div>
          <span className="rounded-full sf-inset hairline px-3 py-1 font-mono text-[10px] tracking-widest text-ink-400">
            {count}
          </span>
        </div>
        {children}
      </motion.div>
    </section>
  );
}

export function Grid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6", className)}>{children}</div>;
}

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "bull" | "bear" | "gold" | "aqua" | "violet" | "accent";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "text-ink-300 bg-[rgba(90,120,190,.14)] shadow-[inset_0_0_0_1px_rgba(140,175,255,.2)]",
    bull: "text-bull bg-[rgba(43,224,138,.12)] shadow-[inset_0_0_0_1px_rgba(43,224,138,.34)]",
    bear: "text-bear bg-[rgba(255,77,106,.12)] shadow-[inset_0_0_0_1px_rgba(255,77,106,.34)]",
    gold: "text-gold bg-[rgba(255,194,75,.12)] shadow-[inset_0_0_0_1px_rgba(255,194,75,.34)]",
    aqua: "text-aqua bg-[rgba(56,225,255,.12)] shadow-[inset_0_0_0_1px_rgba(56,225,255,.34)]",
    violet: "text-violet bg-[rgba(155,107,255,.12)] shadow-[inset_0_0_0_1px_rgba(155,107,255,.34)]",
    accent: "",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
      style={
        tone === "accent"
          ? { color: "var(--accent)", background: "color-mix(in srgb, var(--accent) 12%, transparent)", boxShadow: "inset 0 0 0 1px var(--accent-glow)" }
          : undefined
      }
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated number                                                    */
/* ------------------------------------------------------------------ */
export function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(a + (target - a) * e);
      if (p < 1) raf = requestAnimationFrame(step);
      else from.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function Num({ value, dp = 0, prefix = "", suffix = "" }: { value: number; dp?: number; prefix?: string; suffix?: string }) {
  const v = useCountUp(value);
  return (
    <span className="tnum">
      {prefix}
      {v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress ring                                                      */
/* ------------------------------------------------------------------ */
export function Ring({
  value,
  size = 72,
  stroke = 8,
  color,
  track = "rgba(120,160,240,.12)",
  label,
  sub,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: ReactNode;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color || "var(--accent)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c - (c * Math.min(100, Math.max(0, value))) / 100 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 6px var(--accent-glow))" }}
        />
      </svg>
      <div className="absolute grid place-items-center text-center leading-none">
        <span className="tnum text-[15px] font-extrabold text-white">{label ?? `${Math.round(value)}%`}</span>
        {sub && <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-ink-500">{sub}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */
export function Tip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute bottom-[calc(100%+9px)] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg sf-raised hairline-strong px-2.5 py-1.5 text-[10px] font-semibold text-ink-200"
          >
            {label}
            <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 sf-raised hairline-strong" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Copy-to-clipboard token chip                                       */
/* ------------------------------------------------------------------ */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((v: string) => {
    navigator.clipboard?.writeText(v).catch(() => {});
    setCopied(v);
    blip("ok");
    setTimeout(() => setCopied(null), 1100);
  }, []);
  return { copied, copy };
}
