import { createContext, useContext, useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { useInView } from "./hooks";

/* ───────── ICONS ───────── */
const P: Record<string, string> = {
  flame: "M12 2.5c1.2 3.6 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.2 1-3.8 2.2-4.8 0 1.6.8 2.6 2 3.2 0-3.2-1-5.8 1.3-8.9z",
  gem: "M6 3.5h12l4 5.5-10 12.5L2 9z M2 9h20 M12 21.5 8 9l4-5.5L16 9z",
  heart: "M12 20.5s-7.5-4.6-9.3-9.4A5.2 5.2 0 0 1 12 6.6a5.2 5.2 0 0 1 9.3 4.5C19.5 15.9 12 20.5 12 20.5z",
  bolt: "M13.5 2 4 14h7l-1.5 8L19 10h-7z",
  trophy: "M8 21h8 M12 16.5V21 M7 3.5h10V9a5 5 0 0 1-10 0z M17 5h3v2a3.5 3.5 0 0 1-3.5 3.5 M7 5H4v2a3.5 3.5 0 0 0 3.5 3.5",
  lock: "M5.5 10.5h13v10.5h-13z M8 10.5V7a4 4 0 0 1 8 0v3.5 M12 14.5v3",
  check: "M4.5 12.5l5 5L19.5 7",
  x: "M6 6l12 12M18 6 6 18",
  chevR: "M9 5l7 7-7 7",
  chevL: "M15 5l-7 7 7 7",
  chevD: "M5 9l7 7 7-7",
  chevU: "M5 15l7-7 7 7",
  star: "M12 2.8l2.9 5.9 6.4.9-4.6 4.5 1.1 6.4L12 17.5l-5.8 3 1.1-6.4-4.6-4.5 6.4-.9z",
  chart: "M4 4v16h16 M7.5 15l4-5 3 3 5.5-6.5",
  candle: "M7 2.5v4 M7 17.5v4 M4.8 6.5h4.4v11H4.8z M17 4.5v3.5 M17 16v3.5 M14.8 8h4.4v8h-4.4z",
  wallet: "M3 7.5h15.5a2.5 2.5 0 0 1 2.5 2.5v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 7.5 14.5 3.5v4 M16 14h2",
  shield: "M12 2.8l8 3v6.2c0 5-3.5 8.2-8 9.3-4.5-1.1-8-4.3-8-9.3V5.8z M8.5 12l2.5 2.5 4.5-5",
  bell: "M6 16.5v-5.5a6 6 0 0 1 12 0v5.5l1.8 1.8H4.2z M10 21h4",
  gear: "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  user: "M12 12a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4z M4 21a8 8 0 0 1 16 0",
  home: "M3 11.2 12 3.5l9 7.7 M5.5 9.5V20.5h13V9.5 M10 20.5v-6h4v6",
  book: "M4 5.2A2.2 2.2 0 0 1 6.2 3H20v15.5H6.2A2.2 2.2 0 0 0 4 20.7z M4 20.7V5.2 M8.5 7.5h7",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z",
  gift: "M3 8h18v4H3z M5 12v9h14v-9 M12 8v13 M12 8S10.5 3 8 3.5 7 8 12 8z M12 8s1.5-5 4-4.5S17 8 12 8z",
  up: "M12 19.5V4.5 M5 11.5l7-7 7 7",
  down: "M12 4.5v15 M5 12.5l7 7 7-7",
  trendUp: "M3 17l6-6 4 4 8-8 M15 7h6v6",
  trendDown: "M3 7l6 6 4-4 8 8 M15 17h6v-6",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5.5 M12 7.8v.2",
  warn: "M12 3 22 20.5H2z M12 10v4.5 M12 17.3v.2",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M20.5 20.5 16 16",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  crown: "M3 8l4.5 4L12 4.5l4.5 7.5L21 8l-2 11.5H5z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3.2 2",
  coin: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 7.8h3.8a2 2 0 0 1 0 4H9.5 M9.5 11.8h4.3a2.1 2.1 0 0 1 0 4.2H9.5 M9.5 7v10 M11.5 5.8v2 M11.5 16v2",
  sparkles: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.8 2.2 2.2.8-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  play: "M7 4.5 19.5 12 7 19.5z",
  filter: "M3 5h18l-7 8.5v6l-4 2v-8z",
  sort: "M8 4v16 M4 8l4-4 4 4 M16 20V4 M12 16l4 4 4-4",
  copy: "M9 9h11v11H9z M5 15H4V4h11v1",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7 M20 4v7h-7",
  rocket: "M5 15.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2 M9 15l-3-3c1-4.5 5-9.5 12.5-9.5 0 7.5-5 11.5-9.5 12.5z M15 9.2a.3.3 0 1 0 0-.4",
  snow: "M12 2v20 M4.5 6.5l15 11 M19.5 6.5l-15 11 M9 3.5l3 2.5 3-2.5 M9 20.5l3-2.5 3 2.5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  volume: "M4 9.5h4L13 5v14l-5-4.5H4z M16.5 8.5a5 5 0 0 1 0 7 M19 6a8.5 8.5 0 0 1 0 12",
  dots: "M5 12h.01 M12 12h.01 M19 12h.01",
  swap: "M7 4 3 8l4 4 M3 8h14 M17 20l4-4-4-4 M21 16H7",
  news: "M4 4.5h13v15H6a2 2 0 0 1-2-2z M17 8.5h3v9a2 2 0 0 1-2 2 M7.5 8.5h6 M7.5 12h6 M7.5 15.5h4",
  medal: "M8 2.5h8l-2 6h-4z M12 21.5a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 13l1 2 2 .3-1.5 1.4.4 2.1-1.9-1-1.9 1 .4-2.1L9 15.3l2-.3z",
};
export type IconName = keyof typeof P | string;
export const ICON_NAMES = Object.keys(P);

export function Icon({ name, size = 20, stroke = 2.2, variant = "line", className, style }: {
  name: IconName; size?: number; stroke?: number; variant?: "line" | "duo" | "solid"; className?: string; style?: CSSProperties;
}) {
  const d = P[name] ?? P.info;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn("shrink-0", className)} style={style} fill="none" aria-hidden>
      {variant !== "line" && <path d={d} fill="currentColor" opacity={variant === "duo" ? 0.28 : 1} />}
      <path d={d} stroke={variant === "solid" ? "rgba(0,0,0,.25)" : "currentColor"} strokeWidth={variant === "solid" ? 1 : stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────── BUTTON ───────── */
export type Variant = "bull" | "bear" | "gold" | "sky" | "violet" | "flame" | "ghost" | "dark";
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { v?: Variant; size?: "sm" | "md" | "lg" | "icon" | "iconLg"; block?: boolean };
export function Btn({ v = "sky", size = "md", block, className, children, onClick, onPointerDown, ...rest }: BtnProps) {
  const sz = {
    sm: "h-10 px-4 text-[11px] rounded-[13px] [--depth:4px]",
    md: "h-12 px-6 text-xs",
    lg: "h-14 px-8 text-sm rounded-[18px] [--depth:6px]",
    icon: "h-11 w-11 rounded-[14px] [--depth:4px]",
    iconLg: "h-14 w-14 rounded-[18px]",
  }[size];
  return (
    <button {...rest}
      onPointerDown={(e) => { haptic(6); onPointerDown?.(e); }}
      onClick={(e) => { sfx.play(v === "bear" ? "lock" : v === "gold" || v === "violet" ? "pop" : "tap"); onClick?.(e); }}
      className={cn("btn3d", `v-${v}`, sz, block && "w-full", className)}>
      {children}
    </button>
  );
}

/* ───────── FILTER CONTEXT ───────── */
export const FilterCtx = createContext<{ q: string; notify: (m: string) => void }>({ q: "", notify: () => {} });
export const useKit = () => useContext(FilterCtx);

/* ───────── ASSET CARD ───────── */
export function AssetCard({ id, title, desc, tags = [], children, className, stageClass }: {
  id: string; title: string; desc?: string; tags?: string[]; children: ReactNode; className?: string; stageClass?: string;
}) {
  const { q } = useKit();
  const game = useGame();
  const [ref, inView] = useInView<HTMLElement>();
  const hay = `${id} ${title} ${desc ?? ""} ${tags.join(" ")}`.toLowerCase();
  if (q && !hay.includes(q.toLowerCase())) return null;
  return (
    <article id={id} ref={ref}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}
      onPointerDownCapture={(e) => game.touch(id, e.clientX, e.clientY)}
      className={cn("panel spot reveal flex flex-col p-5", inView && "in", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-md bg-ink-900/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-sky shadow-[inset_0_0_0_1px_rgba(61,139,255,.3)]">{id}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-bull/80">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-bull" style={{ animation: "pulseRing 1.6s infinite" }} /><span className="relative h-1.5 w-1.5 rounded-full bg-bull" /></span>
              live
            </span>
          </div>
          <h3 className="text-[17px] font-extrabold leading-tight text-white">{title}</h3>
          {desc && <p className="mt-1 text-[13px] leading-snug text-ink-300">{desc}</p>}
        </div>
      </header>
      <div className={cn("well relative flex-1 rounded-[18px] p-4", stageClass)}>{children}</div>
      {tags.length > 0 && (
        <footer className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-400">#{t}</span>
          ))}
        </footer>
      )}
    </article>
  );
}

export function Section({ id, num, title, subtitle, children, layout = "grid" }: { id: string; num: string; title: string; subtitle: string; children: ReactNode; layout?: "grid" | "free" }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  return (
    <section id={id} className="scroll-mt-24">
      <div ref={ref} className="mb-6 flex items-end gap-4">
        <div className={cn("raised grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-mono text-lg font-extrabold text-sky transition-all duration-700 ease-[cubic-bezier(.3,1.5,.5,1)]", inView ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-50 opacity-0")}>{num}</div>
        <div className="overflow-hidden">
          <h2 className={cn("text-2xl font-extrabold tracking-tight text-white transition-all delay-100 duration-700 sm:text-3xl", inView ? "translate-y-0 opacity-100" : "translate-y-full opacity-0")}>{title}</h2>
          <p className={cn("text-sm text-ink-300 transition-all delay-200 duration-700", inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>{subtitle}</p>
        </div>
        <div className="mb-3 hidden h-px flex-1 origin-left bg-gradient-to-r from-ink-600 to-transparent transition-transform delay-300 duration-1000 md:block" style={{ transform: `scaleX(${inView ? 1 : 0})` }} />
      </div>
      {layout === "grid" ? <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">{children}</div> : children}
    </section>
  );
}

/** Phone frame used by mobile-first assets */
export function Phone({ children, className, h = 560 }: { children: ReactNode; className?: string; h?: number }) {
  return (
    <div className={cn("relative mx-auto w-[290px] rounded-[44px] bg-gradient-to-b from-ink-600 to-ink-800 p-2.5 shadow-[0_8px_0_#050b1f,0_30px_60px_-20px_#000,inset_0_1px_0_#ffffff22]", className)}>
      <div className="relative overflow-hidden rounded-[36px] bg-ink-900" style={{ height: h }}>
        <div className="pointer-events-none absolute left-1/2 top-2 z-50 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
        {children}
      </div>
    </div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-ink-400", className)}>{children}</div>;
}

/* ───────── HOOKS ───────── */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export function useCountUp(target: number, duration = 700) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const f = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(f + (target - f) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, duration]);
  return val;
}

/** Re-triggers a CSS animation by bumping a key. */
export function useBump(): [number, () => void] {
  const [k, setK] = useState(0);
  return [k, () => setK((x) => x + 1)];
}

/* ───────── FX ───────── */
export function Burst({ trigger, colors = ["#2ee59d", "#ffc53d", "#3d8bff", "#ff4d6a", "#a174ff"], count = 14, spread = 70 }: { trigger: number; colors?: string[]; count?: number; spread?: number }) {
  if (!trigger) return null;
  return (
    <span key={trigger} className="pointer-events-none absolute left-1/2 top-1/2 z-20">
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + (trigger % 3);
        const r = spread * (0.6 + ((i * 37) % 10) / 20);
        return (
          <span key={i} className="absolute h-2 w-2 rounded-[3px]" style={{
            background: colors[i % colors.length],
            ["--dx" as string]: `${Math.cos(a) * r}px`, ["--dy" as string]: `${Math.sin(a) * r}px`,
            animation: `burst .7s cubic-bezier(.1,.8,.3,1) forwards`,
          } as CSSProperties} />
        );
      })}
    </span>
  );
}

export function Confetti({ trigger, count = 60 }: { trigger: number; count?: number }) {
  if (!trigger) return null;
  const colors = ["#2ee59d", "#ffc53d", "#3d8bff", "#ff4d6a", "#a174ff", "#ffffff"];
  return (
    <div key={trigger} className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const x = ((i * 53) % 100);
        const dx = (((i * 29) % 60) - 30) * 3;
        const dy = 250 + ((i * 17) % 200);
        return (
          <span key={i} className="absolute top-[-10px] block" style={{
            left: `${x}%`, width: 6 + (i % 3) * 2, height: 10 + (i % 4) * 2, background: colors[i % colors.length],
            borderRadius: i % 3 === 0 ? 99 : 2,
            ["--dx" as string]: `${dx}px`, ["--dy" as string]: `${dy}px`, ["--rot" as string]: `${(i % 2 ? 1 : -1) * (360 + i * 20)}deg`,
            animation: `confetti ${1.4 + (i % 5) * 0.25}s cubic-bezier(.2,.6,.4,1) ${(i % 10) * 0.03}s forwards`,
          } as CSSProperties} />
        );
      })}
    </div>
  );
}

export function FloatText({ trigger, text, color = "#2ee59d" }: { trigger: number; text: string; color?: string }) {
  if (!trigger) return null;
  return (
    <span key={trigger} className="pointer-events-none absolute left-1/2 top-0 z-20 whitespace-nowrap font-mono text-sm font-extrabold" style={{ color, animation: "floatAway 1s ease-out forwards", textShadow: `0 0 12px ${color}88` }}>
      {text}
    </span>
  );
}

export function ProgressBar({ value, color = "bull", h = 16, className, striped }: { value: number; color?: "bull" | "gold" | "sky" | "bear" | "violet" | "flame"; h?: number; className?: string; striped?: boolean }) {
  const map = { bull: ["#2ee59d", "#12a46a"], gold: ["#ffc53d", "#cc8a00"], sky: ["#3d8bff", "#1e56c9"], bear: ["#ff4d6a", "#c21f43"], violet: ["#a174ff", "#6a3fd6"], flame: ["#ff8a3d", "#d9531a"] }[color];
  return (
    <div className={cn("well relative overflow-hidden rounded-full", className)} style={{ height: h }}>
      <div className={cn("relative h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(.2,.9,.3,1.1)]", striped && "stripes")} style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `linear-gradient(180deg, ${map[0]}, ${map[1]})`, boxShadow: `0 0 14px ${map[0]}55` }}>
        <span className="absolute left-2 right-2 top-[3px] h-[28%] rounded-full bg-white/40" />
      </div>
    </div>
  );
}
