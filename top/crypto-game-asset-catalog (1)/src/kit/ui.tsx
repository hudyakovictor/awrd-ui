import { useState, type ReactNode, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { RotateCcw, MousePointerClick, Sparkles } from "lucide-react";
import { cn } from "../utils/cn";
import { sfx } from "./sfx";

export type Tone = "sky" | "bull" | "bear" | "gold" | "violet" | "cyan" | "ember";

export const toneVars: Record<Tone, CSSProperties> = {
  sky: { "--c": "var(--color-sky)", "--cd": "var(--color-sky-d)" } as CSSProperties,
  bull: { "--c": "var(--color-bull)", "--cd": "var(--color-bull-d)" } as CSSProperties,
  bear: { "--c": "var(--color-bear)", "--cd": "var(--color-bear-d)" } as CSSProperties,
  gold: { "--c": "var(--color-gold)", "--cd": "var(--color-gold-d)" } as CSSProperties,
  violet: { "--c": "var(--color-violet)", "--cd": "var(--color-violet-d)" } as CSSProperties,
  cyan: { "--c": "var(--color-cyan)", "--cd": "var(--color-cyan-d)" } as CSSProperties,
  ember: { "--c": "var(--color-ember)", "--cd": "var(--color-ember-d)" } as CSSProperties,
};

export const toneHex: Record<Tone, string> = {
  sky: "#3b82ff",
  bull: "#22d39a",
  bear: "#ff4f6d",
  gold: "#ffc53d",
  violet: "#8b5cff",
  cyan: "#2bd9ff",
  ember: "#ff8a3d",
};

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  silent?: boolean;
};

export function Btn({ tone = "sky", size = "md", block, className, style, onClick, silent, children, ...rest }: BtnProps) {
  const sz = size === "sm" ? "h-10 px-4 text-[11px] rounded-xl" : size === "lg" ? "h-14 px-7 text-sm" : "h-12 px-5 text-xs";
  return (
    <button
      {...rest}
      onClick={(e) => {
        if (!silent) sfx.tap();
        onClick?.(e);
      }}
      className={cn("btn3d", sz, block && "w-full", className)}
      style={{ ...toneVars[tone], ...(size === "sm" ? ({ "--depth": "4px" } as CSSProperties) : {}), ...style }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ className, onClick, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      onClick={(e) => {
        sfx.soft();
        onClick?.(e);
      }}
      className={cn("btn-ghost3d h-12 px-5 text-xs", className)}
    >
      {children}
    </button>
  );
}

export function Chip({ children, tone = "sky", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  const c = toneHex[tone];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider", className)}
      style={{ color: c, background: `${c}1f`, boxShadow: `inset 0 0 0 1px ${c}40` }}
    >
      {children}
    </span>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-mist/80">{children}</div>;
}

/** Asset card — every asset is a group of interactive, animated elements */
export function Asset({
  code,
  title,
  desc,
  children,
  className,
  specs,
  hint,
}: {
  code: string;
  title: string;
  desc?: string;
  children: ReactNode;
  className?: string;
  specs?: string[];
  hint?: string;
}) {
  const [k, setK] = useState(0);
  return (
    <article
      className={cn("panel group flex flex-col p-5 sm:p-6", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <div className="spotlight pointer-events-none absolute inset-0 rounded-[24px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <header className="relative mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="num rounded-md bg-ink-900/70 px-1.5 py-0.5 text-[10px] font-bold text-sky shadow-[inset_0_0_0_1px_rgba(59,130,255,.35)]">
              {code}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-bull/90">
              <Sparkles size={11} /> animated
            </span>
            <span className="hidden items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gold/90 sm:inline-flex">
              <MousePointerClick size={11} /> interactive
            </span>
          </div>
          <h3 className="font-display text-base font-bold tracking-tight text-white sm:text-lg">{title}</h3>
          {desc && <p className="mt-1 text-[13px] leading-snug text-mist">{desc}</p>}
        </div>
        <button
          aria-label="Replay"
          title="Перезапустить анимации"
          onClick={() => {
            sfx.whoosh();
            setK((v) => v + 1);
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-800 text-mist shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_3px_0_#08112a] transition hover:text-white active:translate-y-[3px] active:shadow-none"
        >
          <RotateCcw size={15} className="transition-transform duration-500 group-hover:-rotate-180" />
        </button>
      </header>
      <div key={k} className="relative flex-1">
        {children}
      </div>
      {(specs || hint) && (
        <footer className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-4">
          {hint && <span className="mr-auto text-[11px] font-semibold text-mist/70">👆 {hint}</span>}
          {specs?.map((s) => (
            <span key={s} className="num rounded-md bg-ink-900/60 px-2 py-0.5 text-[10px] text-mist">
              {s}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}

export function Section({ id, index, title, subtitle, children }: { id: string; index: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex items-end gap-4">
        <div className="font-display text-5xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#2c4580] sm:text-6xl">{index}</div>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h2>
          <p className="text-sm text-mist">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

export function Toggle({ on, onChange, tone = "bull" }: { on: boolean; onChange: (v: boolean) => void; tone?: Tone }) {
  const c = toneHex[tone];
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        sfx.toggle(!on);
        onChange(!on);
      }}
      className="relative h-9 w-16 rounded-full transition-colors duration-300"
      style={{
        background: on ? `linear-gradient(180deg, ${c}, ${c}cc)` : "#0b1530",
        boxShadow: on ? `inset 0 2px 4px rgba(0,0,0,.25), 0 0 16px ${c}55` : "inset 0 3px 6px rgba(0,0,0,.5)",
      }}
    >
      <span
        className="absolute top-1 left-1 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-b from-white to-[#d3ddff] shadow-[0_3px_0_#8ea3d6,0_6px_10px_rgba(0,0,0,.4)] transition-transform duration-300 [transition-timing-function:cubic-bezier(.3,1.6,.5,1)]"
        style={{ transform: `translateX(${on ? 28 : 0}px)` }}
      >
        <span className="h-2 w-2 rounded-full transition-colors" style={{ background: on ? c : "#8ea3d6" }} />
      </span>
    </button>
  );
}

export function Bar({ value, tone = "bull", h = 16, glow = true }: { value: number; tone?: Tone; h?: number; glow?: boolean }) {
  const c = toneHex[tone];
  return (
    <div className="panel-inset relative w-full overflow-hidden rounded-full" style={{ height: h }}>
      <div
        className="relative h-full rounded-full transition-[width] duration-700 [transition-timing-function:cubic-bezier(.2,1,.3,1)]"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(180deg, ${c}, ${c}bb)`,
          boxShadow: glow ? `0 0 14px ${c}88` : undefined,
        }}
      >
        <div className="absolute inset-x-2 top-[3px] h-[3px] rounded-full bg-white/40" />
      </div>
    </div>
  );
}
