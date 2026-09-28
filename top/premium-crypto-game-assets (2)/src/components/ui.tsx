import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type ButtonHTMLAttributes, type CSSProperties } from "react";
import { cn } from "../utils/cn";
import { Icon } from "./icons";

/* ---------------- Catalog context (search) ---------------- */
export const CatalogCtx = createContext<{ query: string }>({ query: "" });

/* ---------------- Hooks ---------------- */
export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

export function useAnimatedNumber(target: number, duration = 700) {
  const [val, setVal] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const f = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = f + (target - f) * e;
      setVal(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = target; };
  }, [target, duration]);
  return val;
}

export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/* ---------------- Section ---------------- */
export function Section({ id, index, title, subtitle, children }: { id: string; index: string; title: string; subtitle: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <div className="flex items-end gap-4 mb-6">
        <div className="tile w-14 h-14 grid place-items-center shrink-0">
          <span className="num text-lg font-extrabold text-grad-sky">{index}</span>
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">{title}</h2>
          <p className="text-mist text-sm mt-0.5">{subtitle}</p>
        </div>
        <div className="hairline flex-1 mb-3 hidden md:block" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

/* ---------------- Asset card ---------------- */
export function Asset({ code, title, desc, tags = [], children, span, className }: { code: string; title: string; desc?: string; tags?: string[]; children: ReactNode; span?: 1 | 2 | 3; className?: string }) {
  const { query } = useContext(CatalogCtx);
  const [ref, seen] = useInView<HTMLDivElement>();
  const q = query.trim().toLowerCase();
  if (q && !`${code} ${title} ${desc ?? ""} ${tags.join(" ")}`.toLowerCase().includes(q)) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "panel p-5 flex flex-col min-w-0 transition-all duration-700",
        seen ? "opacity-100" : "opacity-0 translate-y-6",
        span === 2 && "md:col-span-2",
        span === 3 && "md:col-span-2 xl:col-span-3",
        className
      )}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="num text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky/15 text-sky border border-sky/25">{code}</span>
            <h3 className="font-extrabold uppercase tracking-wide text-[15px] truncate">{title}</h3>
          </div>
          {desc && <p className="text-xs text-mist mt-1.5 leading-relaxed">{desc}</p>}
        </div>
        <div className="flex gap-1 shrink-0 flex-wrap justify-end max-w-[45%]">
          {tags.map((t) => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/5 text-fog/70 border border-white/5">{t}</span>
          ))}
        </div>
      </header>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-[10px] font-bold uppercase tracking-[0.16em] text-mist/80 mb-2", className)}>{children}</div>;
}

/* ---------------- 3D Button ---------------- */
type Variant = "bull" | "bear" | "sky" | "gold" | "violet" | "flame" | "ghost" | "outline";
export function Btn({ variant = "sky", size = "md", loading, icon, iconRight, block, className, children, style, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "xs" | "sm" | "md" | "lg" | "xl"; loading?: boolean; icon?: string; iconRight?: string; block?: boolean }) {
  const sz = { xs: "h-8 px-3 text-[10px] rounded-xl", sm: "h-10 px-4 text-[11px]", md: "h-12 px-5 text-xs", lg: "h-14 px-6 text-sm", xl: "h-16 px-8 text-base rounded-[20px]" }[size];
  const lip = { xs: "3px", sm: "4px", md: "5px", lg: "6px", xl: "7px" }[size];
  return (
    <button
      {...rest}
      style={{ ...(style as CSSProperties), ["--lip" as string]: lip }}
      className={cn("btn3d", `v-${variant}`, sz, block && "w-full", className)}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-[2.5px] border-current border-t-transparent anim-spin" />
      ) : icon ? (
        <Icon name={icon} size={size === "xs" ? 14 : size === "sm" ? 16 : 18} stroke={2.6} />
      ) : null}
      {children && <span>{loading ? "Processing" : children}</span>}
      {iconRight && !loading && <Icon name={iconRight} size={16} stroke={2.6} />}
    </button>
  );
}

/* ---------------- Coin glyph ---------------- */
export const COINS: Record<string, { c: string; g: string; s: string }> = {
  BTC: { c: "#F7931A", g: "₿", s: "Bitcoin" },
  ETH: { c: "#7B8CFF", g: "Ξ", s: "Ethereum" },
  SOL: { c: "#14F195", g: "◎", s: "Solana" },
  BNB: { c: "#F3BA2F", g: "B", s: "BNB" },
  XRP: { c: "#9DB4D9", g: "✕", s: "XRP" },
  DOGE: { c: "#C2A633", g: "Ð", s: "Dogecoin" },
  ADA: { c: "#3C8DFF", g: "₳", s: "Cardano" },
  TON: { c: "#0098EA", g: "◆", s: "Toncoin" },
};
export function Coin({ sym, size = 36 }: { sym: string; size?: number }) {
  const c = COINS[sym] ?? COINS.BTC;
  return (
    <div
      className="rounded-full grid place-items-center font-black shrink-0 relative"
      style={{
        width: size, height: size, fontSize: size * 0.46,
        color: "#fff",
        background: `radial-gradient(circle at 35% 30%, ${c.c}ff, ${c.c}bb 55%, ${c.c}77)`,
        boxShadow: `inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(0,0,0,.25), 0 3px 0 rgba(0,0,0,.35), 0 0 16px ${c.c}33`,
        textShadow: "0 1px 0 rgba(0,0,0,.3)",
      }}
    >
      {c.g}
    </div>
  );
}

/* ---------------- Confetti ---------------- */
const CONF_COLORS = ["#22d38a", "#ffc53d", "#3da5ff", "#9b6bff", "#ff8a3d", "#ff4b6e"];
export function Confetti({ burst, count = 36 }: { burst: number; count?: number }) {
  const parts = useMemo(() => (burst ? makeParticles(count) : []), [burst, count]);
  if (!burst) return null;
  return (
    <div key={burst} className="pointer-events-none absolute inset-0 overflow-visible z-30">
      {parts.map((st, i) => <span key={i} className="absolute" style={st} />)}
    </div>
  );
}
function makeParticles(count: number): CSSProperties[] {
  return Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const d = 70 + Math.random() * 110;
        const st = {
          left: "50%", top: "50%",
          width: 6 + Math.random() * 5, height: 8 + Math.random() * 8,
          background: CONF_COLORS[i % CONF_COLORS.length],
          borderRadius: i % 3 === 0 ? "50%" : 2,
          ["--x" as string]: `${Math.cos(a) * d}px`,
          ["--y" as string]: `${Math.sin(a) * d + 60}px`,
          ["--r" as string]: `${Math.random() * 720 - 360}deg`,
          animation: `confetti ${0.9 + Math.random() * 0.6}s cubic-bezier(.15,.7,.4,1) forwards`,
        } as CSSProperties;
        return st;
  });
}

/* ---------------- Floating +N text ---------------- */
export function FloatText({ items }: { items: { id: number; text: string; color?: string }[] }) {
  return (
    <>
      {items.map((it) => (
        <span key={it.id} className="absolute left-1/2 -translate-x-1/2 -top-2 font-black text-sm pointer-events-none" style={{ color: it.color ?? "#ffc53d", animation: "riseOut .9s ease-out forwards" }}>
          {it.text}
        </span>
      ))}
    </>
  );
}

/* ---------------- Progress bar (3D) ---------------- */
export function Bar({ value, color = "bull", h = 14, className, shine = true }: { value: number; color?: "bull" | "gold" | "sky" | "violet" | "flame" | "bear"; h?: number; className?: string; shine?: boolean }) {
  const map = { bull: ["#3ce49e", "#16b56f"], gold: ["#ffd865", "#f0a400"], sky: ["#6dbbff", "#2d8cf0"], violet: ["#b394ff", "#7a4af0"], flame: ["#ffae6e", "#ff6f1f"], bear: ["#ff7b95", "#e8325a"] }[color];
  return (
    <div className={cn("well relative overflow-hidden rounded-full", className)} style={{ height: h }}>
      <div
        className="absolute left-0 top-0 bottom-0 rounded-full transition-[width] duration-700 ease-[cubic-bezier(.2,.9,.3,1.1)]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: `linear-gradient(180deg, ${map[0]}, ${map[1]})`, boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18)" }}
      >
        {shine && <div className="absolute left-2 right-2 top-[3px] h-[3px] rounded-full bg-white/40" />}
      </div>
    </div>
  );
}

/* ---------------- Mini states strip ---------------- */
export function Kbd({ children }: { children: ReactNode }) {
  return <span className="num text-[10px] px-1.5 py-0.5 rounded-md bg-ink-900 border border-white/10 text-fog/80 shadow-[0_2px_0_#040916]">{children}</span>;
}
