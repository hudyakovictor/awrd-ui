import { useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";
import { tap } from "../lib/fx";
import { Icon, type IconName } from "./Icon";

export type Variant = "bull" | "sky" | "bear" | "gold" | "violet" | "flame" | "ink" | "ghost";
const sizes = { xs: "h-8 px-3 text-[10px] rounded-xl", sm: "h-10 px-4 text-[11px]", md: "h-12 px-6 text-xs", lg: "h-14 px-8 text-sm" };

export function Btn({ v = "bull", s = "md", icon, loading, children, className, onClick, block, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { v?: Variant; s?: keyof typeof sizes; icon?: IconName; loading?: boolean; block?: boolean }) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      onClick={(e) => { tap(); onClick?.(e); }}
      className={cn("btn3d", v !== "bull" && `v-${v}`, sizes[s], block && "w-full", className)}
    >
      {loading ? <Spinner /> : icon && <Icon name={icon} size={s === "lg" ? 20 : 16} stroke={2.6} />}
      {children}
    </button>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block size-4 rounded-full border-[3px] border-current border-r-transparent animate-spin", className)} />;
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[10px] font-extrabold uppercase tracking-[.18em] text-ink-300 mb-2", className)}>{children}</div>;
}

export function Chip({ children, tone = "ink", className }: { children: ReactNode; tone?: "ink" | "bull" | "bear" | "gold" | "sky" | "violet" | "flame"; className?: string }) {
  const t = {
    ink: "bg-ink-700 text-ink-200 shadow-[0_2px_0_#0e1b3a]",
    bull: "bg-bull/15 text-bull shadow-[0_2px_0_rgba(18,162,94,.5)]",
    bear: "bg-bear/15 text-bear shadow-[0_2px_0_rgba(191,35,69,.5)]",
    gold: "bg-gold/15 text-gold shadow-[0_2px_0_rgba(201,138,8,.5)]",
    sky: "bg-sky/15 text-sky shadow-[0_2px_0_rgba(27,95,201,.5)]",
    violet: "bg-violet/15 text-violet shadow-[0_2px_0_rgba(95,53,201,.5)]",
    flame: "bg-flame/15 text-flame shadow-[0_2px_0_rgba(201,82,26,.5)]",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider", t, className)}>{children}</span>;
}

export function Toggle({ on, onChange, tone = "bull", label }: { on: boolean; onChange: (v: boolean) => void; tone?: "bull" | "sky" | "gold" | "bear"; label?: string }) {
  const bg = { bull: "bg-bull", sky: "bg-sky", gold: "bg-gold", bear: "bg-bear" }[tone];
  return (
    <button
      role="switch" aria-checked={on} aria-label={label}
      onClick={() => { tap("tick"); onChange(!on); }}
      className={cn("relative h-8 w-14 rounded-full transition-colors duration-200 shadow-[inset_0_3px_6px_rgba(0,0,0,.45)] focus-visible:outline-3 focus-visible:outline-sky outline-offset-2", on ? bg : "bg-ink-850")}
    >
      <span className={cn("absolute top-1 left-1 size-6 rounded-full bg-gradient-to-b from-white to-ink-100 shadow-[0_3px_0_#8aa0d4,0_4px_8px_rgba(0,0,0,.4)] transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]", on && "translate-x-6")} />
    </button>
  );
}

export function Bar({ value, tone = "bull", h = 14, className, glow }: { value: number; tone?: "bull" | "sky" | "gold" | "bear" | "violet" | "flame"; h?: number; className?: string; glow?: boolean }) {
  const c = { bull: "from-[#6DF5B3] to-bull", sky: "from-[#8CCBFF] to-sky", gold: "from-[#FFE58A] to-gold", bear: "from-[#FF9AAE] to-bear", violet: "from-[#C9A8FF] to-violet", flame: "from-[#FFC08A] to-flame" }[tone];
  return (
    <div className={cn("well relative overflow-hidden rounded-full", className)} style={{ height: h }}>
      <div className={cn("relative h-full rounded-full bg-gradient-to-b transition-[width] duration-700 [transition-timing-function:cubic-bezier(.22,1,.36,1)]", c, glow && "shadow-[0_0_14px_currentColor]")} style={{ width: `${Math.max(0, Math.min(100, value))}%` }}>
        <div className="absolute left-2 right-2 top-[3px] h-[28%] rounded-full bg-white/45" />
      </div>
    </div>
  );
}

/* Confetti burst — mounts particles, auto cleans */
export function Confetti({ fire, count = 28 }: { fire: number; count?: number }) {
  if (!fire) return null;
  const colors = ["#2BE38B", "#3D9BFF", "#FFC940", "#FF4D6D", "#9A6BFF", "#FF8A3D"];
  return (
    <div key={fire} className="pointer-events-none absolute inset-0 overflow-visible z-30" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2;
        const d = 70 + Math.random() * 90;
        return (
          <span key={i} className="absolute left-1/2 top-1/2 block rounded-sm"
            style={{
              width: 6 + (i % 3) * 2, height: 10 - (i % 3) * 2, background: colors[i % colors.length],
              ["--x" as string]: `${Math.cos(a) * d}px`, ["--y" as string]: `${Math.sin(a) * d + 40}px`, ["--r" as string]: `${Math.random() * 720}deg`,
              animation: `confetti ${0.9 + Math.random() * 0.6}s cubic-bezier(.2,.7,.3,1) forwards`,
            }} />
        );
      })}
    </div>
  );
}

/* Floating "+10" text */
export function useFloaters() {
  const [items, setItems] = useState<{ id: number; text: string; x: number; y: number; cls: string }[]>([]);
  const add = (text: string, x = 50, y = 40, cls = "text-gold") => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text, x, y, cls }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 950);
  };
  const layer = (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      {items.map((i) => (
        <span key={i.id} className={cn("absolute font-display text-lg font-black animate-rise drop-shadow-[0_3px_0_rgba(0,0,0,.5)]", i.cls)} style={{ left: `${i.x}%`, top: `${i.y}%` }}>{i.text}</span>
      ))}
    </div>
  );
  return { add, layer };
}

export function Segmented<T extends string>({ options, value, onChange, className }: { options: { v: T; label: ReactNode; tone?: string }[]; value: T; onChange: (v: T) => void; className?: string }) {
  const idx = Math.max(0, options.findIndex((o) => o.v === value));
  const tone = options[idx]?.tone ?? "bg-sky shadow-[0_3px_0_var(--color-sky-d)]";
  return (
    <div className={cn("well relative grid p-1", className)} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      <div className={cn("absolute top-1 bottom-[7px] rounded-[10px] transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.4,.64,1)]", tone)}
        style={{ left: `calc(${(idx * 100) / options.length}% + 4px)`, width: `calc(${100 / options.length}% - 8px)` }} />
      {options.map((o) => (
        <button key={o.v} onClick={() => { tap("tick"); onChange(o.v); }}
          className={cn("relative z-10 h-9 rounded-[10px] font-display text-[11px] font-bold uppercase tracking-wider transition-colors", o.v === value ? "text-white" : "text-ink-300 hover:text-ink-100")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
