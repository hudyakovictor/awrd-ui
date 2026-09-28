import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { Icon } from "./icons";
import { VisibleCtx, useInView } from "../lib/motion";
import { sfx, type SfxName } from "../lib/sound";

export { useInterval, useAnimatedNumber } from "../lib/motion";

/* ---------- Filter context ---------- */
export const FilterCtx = createContext<{ query: string }>({ query: "" });

export const haptic = (ms = 10) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* noop */
  }
};

/* Section numbering follows page order */
export const SECTION_ORDER = ["gameplay", "motion", "playground", "progression", "data", "controls", "navigation", "feedback", "foundations"];

/* ---------- Section ---------- */
export function Section({
  id,
  title,
  kicker,
  children,
  desc,
}: {
  id: string;
  index?: string;
  title: string;
  kicker: string;
  desc?: string;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const n = String(SECTION_ORDER.indexOf(id) + 1).padStart(2, "0");
  return (
    <section id={id} data-section className="scroll-mt-32">
      <div ref={ref} className="mb-6 flex items-end gap-4">
        <div
          className="panel-raised flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-display text-base font-bold text-cyan-300 transition-all duration-700 ease-[cubic-bezier(.3,1.5,.5,1)]"
          style={{ transform: inView ? "none" : "scale(.4) rotate(-30deg)", opacity: inView ? 1 : 0 }}
        >
          {n}
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.25em] text-ink-400 transition-all duration-700"
            style={{ transform: inView ? "none" : "translateY(100%)", opacity: inView ? 1 : 0 }}
          >
            {kicker}
          </div>
          <h2
            className="font-display text-3xl font-black tracking-tight text-white transition-all delay-100 duration-700 sm:text-4xl"
            style={{ transform: inView ? "none" : "translateY(60%)", opacity: inView ? 1 : 0 }}
          >
            {title}
          </h2>
          {desc && (
            <p className="mt-1 max-w-2xl text-sm font-semibold text-ink-400 transition-all delay-200 duration-700" style={{ opacity: inView ? 1 : 0 }}>
              {desc}
            </p>
          )}
        </div>
        <div className="hidden h-px flex-1 origin-left bg-gradient-to-r from-ink-500 to-transparent transition-transform delay-300 duration-1000 md:block" style={{ transform: `scaleX(${inView ? 1 : 0})` }} />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12">{children}</div>
    </section>
  );
}

/* ---------- Sub-section header inside a section grid ---------- */
export function SubHead({
  icon,
  title,
  desc,
  tone = "#3e8bff",
  count,
}: {
  icon: string;
  title: string;
  desc?: string;
  tone?: string;
  count?: number;
}) {
  const { query } = useContext(FilterCtx);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  if (query.trim()) return null;
  return (
    <div ref={ref} className="mt-6 flex items-center gap-3 first:mt-0 md:col-span-2 xl:col-span-12">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all duration-500"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${tone} 85%, white), ${tone})`,
          boxShadow: `0 4px 0 color-mix(in srgb, ${tone} 50%, black)`,
          transform: inView ? "none" : "translateY(10px) scale(.6)",
          opacity: inView ? 1 : 0,
        }}
      >
        <Icon name={icon} size={20} stroke={2.6} />
      </span>
      <div className="transition-all delay-100 duration-500" style={{ transform: inView ? "none" : "translateX(-12px)", opacity: inView ? 1 : 0 }}>
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-black text-white">{title}</h3>
          {count !== undefined && <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-200">{count}</span>}
        </div>
        {desc && <p className="text-xs font-semibold text-ink-400">{desc}</p>}
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

/* ---------- Asset card ----------
 * - reveals on scroll (staggered by column)
 * - mounts content lazily when first seen (animations start in view)
 * - provides VisibleCtx so loops pause when off-screen            */
export function Asset({
  title,
  code,
  tags = "",
  span = 4,
  children,
  className,
  bodyClass,
  minH = 280,
  noClip,
  badge,
}: {
  title: string;
  code: string;
  tags?: string;
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
  minH?: number;
  noClip?: boolean;
  badge?: string;
}) {
  const { query } = useContext(FilterCtx);
  const [k, setK] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [delay, setDelay] = useState(0);
  const q = query.trim().toLowerCase();
  const hidden = !!q && !`${title} ${tags} ${code}`.toLowerCase().includes(q);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      setVisible(true);
      return;
    }
    const reveal = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const col = Math.min(2, Math.floor((e.boundingClientRect.left / Math.max(1, window.innerWidth)) * 3));
          setDelay(col * 110);
          setSeen(true);
          reveal.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -4% 0px" },
    );
    const vis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "160px 0px 160px 0px" });
    reveal.observe(el);
    vis.observe(el);
    return () => {
      reveal.disconnect();
      vis.disconnect();
    };
  }, [hidden]);

  if (hidden) return null;
  const spanCls = {
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
    7: "xl:col-span-7",
    8: "xl:col-span-8",
    12: "xl:col-span-12 md:col-span-2",
  }[span];
  return (
    <div
      ref={ref}
      data-asset
      className={cn("panel group/asset flex flex-col", !noClip && "overflow-clip", spanCls, className)}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? "none" : "translate3d(0,56px,0) scale(.965)",
        transition: `opacity .8s cubic-bezier(.2,.8,.2,1) ${delay}ms, transform .9s cubic-bezier(.2,.9,.25,1.04) ${delay}ms`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-5 pb-3 pt-4">
        <span className="rounded-md bg-ink-950/60 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300/80">{code}</span>
        <h3 className="truncate text-[13px] font-extrabold uppercase tracking-[0.14em] text-ink-200">{title}</h3>
        {badge && <span className="rounded-md bg-gold/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-gold ring-1 ring-gold/30">{badge}</span>}
        <div className="ml-auto flex items-center gap-1.5">
          <span className={cn("hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:flex", visible ? "bg-bull/10 text-bull" : "bg-white/5 text-ink-500")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", visible ? "anim-glow bg-bull" : "bg-ink-500")} /> {visible ? "LIVE" : "PAUSED"}
          </span>
          <button
            onClick={() => {
              sfx("whoosh");
              setK((x) => x + 1);
            }}
            title="Replay"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition hover:bg-white/5 hover:text-white active:rotate-180"
          >
            <Icon name="refresh" size={14} />
          </button>
        </div>
      </div>
      <VisibleCtx.Provider value={visible}>
        <div key={k} className={cn("relative flex-1 p-5", bodyClass)} style={!seen ? { minHeight: minH } : undefined}>
          {seen ? (
            children
          ) : (
            <div className="space-y-3">
              <div className="skeleton h-5 w-2/5 rounded-full" />
              <div className="skeleton h-32 rounded-2xl" />
              <div className="skeleton h-4 w-3/4 rounded-full" />
            </div>
          )}
        </div>
      </VisibleCtx.Provider>
    </div>
  );
}

/* ---------- Button (3D + ripple + sfx + haptic) ---------- */
type Variant = "bull" | "bear" | "gold" | "azure" | "violet" | "flame" | "ghost" | "light";
export function Btn({
  variant = "azure",
  size = "md",
  className,
  children,
  onClick,
  onPointerDown,
  loading,
  block,
  sound = "tap",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md" | "lg" | "icon" | "iconSm";
  loading?: boolean;
  block?: boolean;
  sound?: SfxName | false;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; s: number }[]>([]);
  const sz = {
    sm: "h-10 px-4 text-xs rounded-xl [--depth:4px]",
    md: "h-12 px-5 text-sm",
    lg: "h-14 px-7 text-base rounded-[18px] [--depth:6px]",
    icon: "h-12 w-12 p-0",
    iconSm: "h-10 w-10 p-0 rounded-xl [--depth:4px]",
  }[size];
  return (
    <button
      {...rest}
      onPointerDown={(e: RPointerEvent<HTMLButtonElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        const s = Math.max(r.width, r.height) * 2.2;
        const id = performance.now() + Math.random();
        setRipples((rs) => [...rs.slice(-3), { id, x: e.clientX - r.left, y: e.clientY - r.top, s }]);
        onPointerDown?.(e);
      }}
      onClick={(e) => {
        haptic();
        if (sound) sfx(sound);
        onClick?.(e);
      }}
      className={cn("btn3d overflow-hidden uppercase", `v-${variant}`, sz, block && "w-full", className)}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple"
          style={{ left: r.x - r.s / 2, top: r.y - r.s / 2, width: r.s, height: r.s }}
          onAnimationEnd={() => setRipples((rs) => rs.filter((x) => x.id !== r.id))}
        />
      ))}
      <span className="relative z-[1] inline-flex items-center justify-center gap-2">{loading ? <Spinner size={18} /> : children}</span>
    </button>
  );
}

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn("anim-spin", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ---------- Small helpers ---------- */
export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400", className)}>{children}</div>;
}

export function Chip({
  children,
  tone = "ink",
  className,
}: {
  children: ReactNode;
  tone?: "ink" | "bull" | "bear" | "gold" | "azure" | "violet" | "flame";
  className?: string;
}) {
  const t = {
    ink: "bg-ink-700 text-ink-200 shadow-[0_2px_0_#0b1838]",
    bull: "bg-bull/15 text-bull shadow-[0_2px_0_rgba(12,143,99,.5)] ring-1 ring-bull/30",
    bear: "bg-bear/15 text-bear shadow-[0_2px_0_rgba(179,31,61,.5)] ring-1 ring-bear/30",
    gold: "bg-gold/15 text-gold shadow-[0_2px_0_rgba(194,133,10,.5)] ring-1 ring-gold/30",
    azure: "bg-azure/15 text-azure shadow-[0_2px_0_rgba(28,85,194,.5)] ring-1 ring-azure/30",
    violet: "bg-violet/15 text-violet shadow-[0_2px_0_rgba(90,60,204,.5)] ring-1 ring-violet/30",
    flame: "bg-flame/15 text-flame shadow-[0_2px_0_rgba(194,74,12,.5)] ring-1 ring-flame/30",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide", t, className)}>
      {children}
    </span>
  );
}

/* ---------- Progress bar (glossy) ---------- */
export function Bar({
  value,
  color = "bull",
  className,
  height = 16,
}: {
  value: number;
  color?: "bull" | "gold" | "azure" | "bear" | "violet" | "flame";
  className?: string;
  height?: number;
}) {
  const c = {
    bull: "from-[#5ff0bd] to-bull",
    gold: "from-[#ffe08a] to-gold",
    azure: "from-[#8cc0ff] to-azure",
    bear: "from-[#ff8aa0] to-bear",
    violet: "from-[#c2b0ff] to-violet",
    flame: "from-[#ffb07a] to-flame",
  }[color];
  return (
    <div className={cn("panel-inset relative overflow-hidden rounded-full", className)} style={{ height }}>
      <div
        className={cn("relative h-full rounded-full bg-gradient-to-b transition-[width] duration-700 ease-[cubic-bezier(.3,1.2,.5,1)]", c)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      >
        <div className="absolute inset-x-2 top-[3px] h-[28%] rounded-full bg-white/45" />
      </div>
    </div>
  );
}

/* ---------- Confetti burst (memoized particles) ---------- */
export function Confetti({ fire, count = 28 }: { fire: number; count?: number }) {
  const parts = useMemo(() => {
    const colors = ["#22d39a", "#ffc23d", "#3e8bff", "#ff4d6d", "#9170ff", "#2fd4ff"];
    return Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const d = 80 + Math.random() * 90;
      return {
        w: 6 + Math.random() * 5,
        h: 9 + Math.random() * 6,
        c: colors[i % colors.length],
        dur: 0.8 + Math.random() * 0.6,
        x: Math.cos(a) * d,
        y: Math.sin(a) * d + 40,
        r: Math.random() * 720 - 360,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire, count]);
  if (!fire) return null;
  return (
    <div key={fire} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      {parts.map((p, i) => (
        <span
          key={i}
          className="absolute block rounded-[2px]"
          style={
            {
              width: p.w,
              height: p.h,
              background: p.c,
              animation: `confetti ${p.dur}s cubic-bezier(.15,.8,.3,1) forwards`,
              "--x": `${p.x}px`,
              "--y": `${p.y}px`,
              "--r": `${p.r}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  tones,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  tones?: Partial<Record<T, string>>;
}) {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div className={cn("panel-inset relative flex rounded-2xl p-1", className)}>
      <div
        className={cn(
          "absolute bottom-1 top-1 rounded-xl transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]",
          tones?.[value] ?? "bg-gradient-to-b from-[#2e4d8f] to-ink-600 shadow-[0_3px_0_#0b1838,inset_0_1px_0_rgba(255,255,255,.2)]",
        )}
        style={{ left: `calc(${(idx * 100) / options.length}% + 4px)`, width: `calc(${100 / options.length}% - 8px)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => {
            haptic();
            sfx("select");
            onChange(o.value);
          }}
          className={cn(
            "relative z-10 flex h-10 flex-1 items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-wider transition-colors",
            o.value === value ? "text-white" : "text-ink-400 hover:text-ink-200",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Phone frame for mobile-screen demos ---------- */
export function Phone({
  children,
  className,
  screenClass,
  width = 300,
  height = 600,
}: {
  children: ReactNode;
  className?: string;
  screenClass?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div className={cn("relative mx-auto shrink-0", className)} style={{ width }}>
      <span className="absolute -left-[3px] top-28 h-12 w-[3px] rounded-l bg-ink-500" />
      <span className="absolute -left-[3px] top-44 h-16 w-[3px] rounded-l bg-ink-500" />
      <span className="absolute -right-[3px] top-36 h-20 w-[3px] rounded-r bg-ink-500" />
      <div className="relative rounded-[46px] bg-gradient-to-b from-ink-500 via-ink-700 to-ink-800 p-[10px] shadow-[0_10px_0_#081231,0_36px_70px_-20px_rgba(0,0,0,.85)] ring-1 ring-white/10">
        <div className={cn("relative isolate overflow-hidden rounded-[37px] bg-ink-900", screenClass)} style={{ height }}>
          <div className="pointer-events-none absolute left-1/2 top-2 z-[60] h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[59] flex h-10 items-center justify-between px-7 text-[11px] font-bold text-white/90">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="flex items-end gap-[2px]">
                {[4, 6, 8, 10].map((h) => (
                  <span key={h} className="w-[3px] rounded-sm bg-white/90" style={{ height: h }} />
                ))}
              </span>
              <span className="ml-1 h-[10px] w-5 rounded-[3px] border border-white/70 p-[1px]">
                <span className="block h-full w-3/4 rounded-[1px] bg-bull" />
              </span>
            </span>
          </div>
          {children}
          <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-[60] h-1 w-28 -translate-x-1/2 rounded-full bg-white/50" />
        </div>
      </div>
    </div>
  );
}
