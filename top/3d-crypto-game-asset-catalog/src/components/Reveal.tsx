import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useInView, useParallax, useMouse, EASE_CSS } from "../lib/motion";
import { useCountUp } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   REVEAL — появление при скролле. Варианты: fade-up / fade / scale /
   slide-left / slide-right / flip / blur / pop. Каскад через delay.
   ═══════════════════════════════════════════════════════════════════ */

export type RevealVariant = "fade-up" | "fade" | "scale" | "slide-left" | "slide-right" | "flip" | "blur" | "pop";

const FROM: Record<RevealVariant, CSSProperties> = {
  "fade-up": { opacity: 0, transform: "translateY(36px)" },
  fade: { opacity: 0 },
  scale: { opacity: 0, transform: "scale(.88)" },
  "slide-left": { opacity: 0, transform: "translateX(-48px)" },
  "slide-right": { opacity: 0, transform: "translateX(48px)" },
  flip: { opacity: 0, transform: "perspective(800px) rotateX(14deg) translateY(20px)" },
  blur: { opacity: 0, transform: "translateY(16px)", filter: "blur(10px)" },
  pop: { opacity: 0, transform: "scale(.6)" },
};

export function Reveal({
  children, variant = "fade-up", delay = 0, duration = 700, distance,
  once = true, threshold = 0.15, className, style, as: Tag = "div",
}: {
  children: ReactNode; variant?: RevealVariant; delay?: number; duration?: number;
  /** переопределить дистанцию (px) для fade-up/slide */
  distance?: number; once?: boolean; threshold?: number; className?: string; style?: CSSProperties;
  as?: "div" | "section" | "article" | "span" | "li";
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold, once });
  const from = { ...FROM[variant] };
  if (distance !== undefined) {
    if (variant === "fade-up") from.transform = `translateY(${distance}px)`;
    if (variant === "slide-left") from.transform = `translateX(${-distance}px)`;
    if (variant === "slide-right") from.transform = `translateX(${distance}px)`;
  }
  const ease = variant === "pop" ? EASE_CSS.spring : EASE_CSS.out;
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={{
        ...style,
        ...(inView ? { opacity: 1, transform: "none", filter: "none" } : from),
        transitionProperty: "opacity, transform, filter",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: ease,
        transitionDelay: `${delay}ms`,
        willChange: inView ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/* ——— Stagger: каскад детей ——— */
export function Stagger({ children, gap = 90, variant = "fade-up", className }: { children: ReactNode[]; gap?: number; variant?: RevealVariant; className?: string }) {
  return (
    <div className={className}>
      {children.map((c, i) => (
        <Reveal key={i} variant={variant} delay={i * gap}>{c}</Reveal>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PARALLAX — слои двигаются с разной скоростью от скролла.
   speed: 0 = стоит, 1 = едет со скроллом, отрицательный — против.
   ═══════════════════════════════════════════════════════════════════ */
export function Parallax({ children, speed = 0.35, className, style, axis = "y" }: { children: ReactNode; speed?: number; className?: string; style?: CSSProperties; axis?: "y" | "x" }) {
  const { ref, k } = useParallax<HTMLDivElement>(1);
  const px = k * 120 * speed;
  return (
    <div ref={ref} className={className} style={{ ...style, transform: axis === "y" ? `translate3d(0, ${-px}px, 0)` : `translate3d(${-px}px, 0, 0)`, willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ——— MouseParallax: слои следуют за курсором ——— */
export function MouseParallax({ children, depth = 18, className, style }: { children: ReactNode; depth?: number; className?: string; style?: CSSProperties }) {
  const { ref, x, y, onMove, onLeave } = useMouse<HTMLDivElement>();
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={style}>
      <div style={{ transform: `translate3d(${x * depth}px, ${y * depth}px, 0)`, transition: "transform .35s cubic-bezier(.22,1,.36,1)" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TILT — 3D-наклон карточки за курсором + блик.
   ═══════════════════════════════════════════════════════════════════ */
export function Tilt({ children, max = 12, glare = true, className, style }: { children: ReactNode; max?: number; glare?: boolean; className?: string; style?: CSSProperties }) {
  const { ref, x, y, inside, onMove, onLeave } = useMouse<HTMLDivElement>();
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={className} style={{ perspective: "1000px", ...style }}>
      <div
        style={{
          transform: `rotateX(${(-y * max * 2).toFixed(2)}deg) rotateY(${(x * max * 2).toFixed(2)}deg) translateZ(0)`,
          transition: inside ? "transform .08s linear" : "transform .5s cubic-bezier(.22,1,.36,1)",
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {children}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
            style={{
              opacity: inside ? 1 : 0,
              background: `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(255,255,255,.28), transparent 55%)`,
              mixBlendMode: "overlay",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAGNETIC — элемент тянется к курсору в радиусе.
   ═══════════════════════════════════════════════════════════════════ */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      className={cn("inline-block", className)}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setT({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
    >
      <div style={{ transform: `translate(${t.x}px, ${t.y}px)`, transition: t.x || t.y ? "transform .12s linear" : "transform .45s cubic-bezier(.34,1.56,.64,1)" }}>
        {children}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MARQUEE — бесконечная бегущая строка. Дублирует контент ×2.
   ═══════════════════════════════════════════════════════════════════ */
export function Marquee({ children, speed = 30, reverse = false, pauseOnHover = true, className, gap = 12 }: {
  children: ReactNode; speed?: number; reverse?: boolean; pauseOnHover?: boolean; className?: string; gap?: number;
}) {
  const [pause, setPause] = useState(false);
  const row = (key: string, hidden: boolean) => (
    <div key={key} aria-hidden={hidden} className="flex shrink-0 items-center" style={{ gap }}>
      {children}
    </div>
  );
  return (
    <div
      className={cn("relative flex overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setPause(true)}
      onMouseLeave={() => setPause(false)}
    >
      <div
        className="flex w-max"
        style={{
          gap,
          animation: `marquee ${speed}s linear infinite ${reverse ? "reverse" : "normal"}`,
          animationPlayState: pause ? "paused" : "running",
        }}
      >
        {row("a", false)}
        {row("b", true)}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-ink-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-ink-900 to-transparent" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   COUNT — число анимируется, когда видно.
   ═══════════════════════════════════════════════════════════════════ */
export function Count({ to, duration = 1400, format = (v: number) => Math.round(v).toLocaleString("ru-RU"), className }: {
  to: number; duration?: number; format?: (v: number) => string; className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const v = useCountUp(inView ? to : 0, duration);
  return <span ref={ref} className={cn("tabular-nums", className)}>{format(v)}</span>;
}

/* ═══════════════════════════════════════════════════════════════════
   STICKY STACK — карточки налипают друг на друга при скролле.
   Каждая карточка: sticky top + масштаб предыдущих.
   ═══════════════════════════════════════════════════════════════════ */
export function StickyStack({ cards, top = 120 }: { cards: { title: string; sub: string; body: ReactNode; hex: string }[]; top?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.max(0, Math.min(1, -rect.top / (total || 1)));
      setActive(Math.min(cards.length - 1, Math.floor(p * cards.length)));
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, [cards.length]);
  return (
    <div ref={wrap} className="relative">
      {cards.map((c, i) => (
        <div key={c.title} className="sticky" style={{ top: top + i * 18, zIndex: i + 1, marginBottom: i === cards.length - 1 ? 0 : "12vh" }}>
          <div
            className="panel overflow-hidden p-6 transition-all duration-500 sm:p-8"
            style={{
              transform: `scale(${i < active ? 0.94 - (active - i) * 0.02 : 1})`,
              filter: i < active ? "brightness(.75)" : "none",
              transformOrigin: "center top",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl font-display text-sm font-black text-ink-900" style={{ background: c.hex }}>{i + 1}</span>
              <div>
                <div className="font-display text-base font-black sm:text-lg">{c.title}</div>
                <div className="text-[12px] text-ink-400">{c.sub}</div>
              </div>
              <span className="ml-auto font-mono text-[11px] text-ink-500">{i + 1}/{cards.length}</span>
            </div>
            <div className="mt-4">{c.body}</div>
          </div>
        </div>
      ))}
      {/* прогресс-rail */}
      <div className="pointer-events-none absolute -right-2 top-0 hidden h-full w-1.5 flex-col gap-2 lg:flex" style={{ top }}>
        {cards.map((_, i) => (
          <span key={i} className={cn("w-full flex-1 rounded-full transition-colors", i <= active ? "bg-sky" : "bg-ink-700")} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HORIZONTAL — секция превращается в горизонтальный скролл.
   Колесо/тач вертикальный → двигает трек (липкая сцена).
   ═══════════════════════════════════════════════════════════════════ */
export function Horizontal({ children, height = 260 }: { children: ReactNode[]; height?: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(Math.max(0, Math.min(1, -r.top / (total || 1))));
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div ref={wrap} className="relative" style={{ height: `${height}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div
          className="flex w-max items-stretch gap-5 px-6"
          style={{ transform: `translate3d(${-p * (children.length - 1) * 78}vw, 0, 0)`, transition: "transform .1s linear", willChange: "transform" }}
        >
          {children.map((c, i) => (
            <div key={i} className="w-[72vw] max-w-[560px] shrink-0">{c}</div>
          ))}
        </div>
        <div className="mx-auto mt-6 flex w-64 items-center gap-3">
          <span className="font-mono text-[11px] text-ink-400">{String(Math.min(children.length, Math.floor(p * children.length) + 1)).padStart(2, "0")}</span>
          <div className="well h-2.5 flex-1 overflow-hidden rounded-full">
            <div className="h-full rounded-full bg-gradient-to-r from-bull to-sky" style={{ width: `${p * 100}%` }} />
          </div>
          <span className="font-mono text-[11px] text-ink-400">{String(children.length).padStart(2, "0")}</span>
        </div>
      </div>
    </div>
  );
}

/* ——— Flip-цифра для счётчиков ——— */
export function FlipDigit({ d }: { d: string }) {
  return (
    <span className="relative inline-flex h-[1.15em] w-[0.68em] items-center justify-center overflow-hidden rounded-[6px] bg-ink-950 font-mono font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,.6)]">
      <span key={d} className="animate-slide-up">{d}</span>
      <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
    </span>
  );
}
