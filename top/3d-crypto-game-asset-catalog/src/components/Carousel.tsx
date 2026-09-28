import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import { sfx, haptic, tap } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   CAROUSEL — единый движок всех каруселей каталога.
   Варианты: slide · fade · coverflow · cube · stack · vertical · peek
   Физика: drag с сопротивлением, бросок по скорости, пружинный возврат.
   A11y: role=region, стрелки клавиатуры, живой регион, фокус-видимость.
   ═══════════════════════════════════════════════════════════════════ */

export type CarouselVariant = "slide" | "fade" | "coverflow" | "cube" | "stack" | "vertical" | "peek";

export type CarouselProps = {
  children: ReactNode[];
  variant?: CarouselVariant;
  loop?: boolean;
  autoplay?: boolean;
  autoplayMs?: number;
  startIndex?: number;
  arrows?: boolean;
  dots?: boolean;
  counter?: boolean;
  progress?: boolean;
  thumbs?: ReactNode[];
  keyboard?: boolean;
  drag?: boolean;
  gap?: number;
  className?: string;
  slideClassName?: string;
  label?: string;
  onChange?: (i: number) => void;
  height?: number | "auto";
};

export function Carousel({
  children, variant = "slide", loop = true, autoplay = false, autoplayMs = 4000,
  startIndex = 0, arrows = true, dots = true, counter = false, progress = false,
  thumbs, keyboard = true, drag = true, gap = 16, className,
  label = "Карусель", onChange, height = "auto",
}: CarouselProps) {
  const n = children.length;
  const [index, setIndex] = useState(startIndex);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);
  const box = useRef<HTMLDivElement>(null);
  const w = useRef(1);
  const idx = useRef(index);
  idx.current = index;

  const go = useCallback((i: number, silent = false) => {
    let next = i;
    if (loop) next = ((i % n) + n) % n;
    else next = Math.max(0, Math.min(n - 1, i));
    if (next === idx.current) return;
    setDir(next > idx.current || (loop && idx.current === n - 1 && next === 0) ? 1 : -1);
    setIndex(next);
    if (!silent) {
      sfx("tick");
      haptic(6);
    }
    onChange?.(next);
  }, [loop, n, onChange]);

  const prev = useCallback(() => go(idx.current - 1), [go]);
  const next = useCallback(() => go(idx.current + 1), [go]);

  /* autoplay */
  useEffect(() => {
    if (!autoplay || hover || dragging || n < 2) return;
    const id = setInterval(() => go(idx.current + 1, true), autoplayMs);
    return () => clearInterval(id);
  }, [autoplay, autoplayMs, hover, dragging, n, go]);

  /* keyboard */
  useEffect(() => {
    if (!keyboard) return;
    const el = box.current;
    if (!el) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); prev(); }
      if (e.key === "Home") { e.preventDefault(); go(0); }
      if (e.key === "End") { e.preventDefault(); go(n - 1); }
    };
    el.addEventListener("keydown", k);
    return () => el.removeEventListener("keydown", k);
  }, [keyboard, next, prev, go, n]);

  /* drag */
  const dragSt = useRef<{ x: number; y: number; t: number; moved: boolean; vx: number; lx: number; lt: number } | null>(null);
  const vertical = variant === "vertical";
  const onDown = (e: React.PointerEvent) => {
    if (!drag || n < 2) return;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    w.current = box.current?.clientWidth || 1;
    dragSt.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, vx: 0, lx: e.clientX, lt: performance.now() };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = dragSt.current;
    if (!s) return;
    const dx = (vertical ? e.clientY - s.y : e.clientX - s.x);
    const now = performance.now();
    const dt = Math.max(1, now - s.lt);
    s.vx = s.vx * 0.7 + ((vertical ? e.clientY : e.clientX) - s.lx) / dt * 1000 * 0.3;
    s.lx = vertical ? e.clientY : e.clientX;
    s.lt = now;
    if (!s.moved && Math.abs(dx) > 6) {
      s.moved = true;
      setDragging(true);
    }
    if (s.moved) {
      let v = dx;
      if (!loop) {
        const atStart = idx.current === 0 && dx > 0;
        const atEnd = idx.current === n - 1 && dx < 0;
        if (atStart || atEnd) v = dx * 0.35; // резиновый край
      }
      setDragPx(v);
      e.preventDefault();
    }
  };
  const onUp = () => {
    const s = dragSt.current;
    dragSt.current = null;
    if (!s?.moved) return;
    setDragging(false);
    const size = vertical ? box.current?.clientHeight || 300 : w.current;
    const threshold = Math.min(120, size * 0.18);
    if (dragPx < -threshold || s.vx < -650) next();
    else if (dragPx > threshold || s.vx > 650) prev();
    setDragPx(0);
  };

  const size = vertical ? box.current?.clientHeight || 320 : w.current;
  const off = (i: number) => {
    let d = i - index;
    if (loop) {
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
    }
    return d;
  };

  /* ── рендер слайда по варианту ── */
  const renderSlide = (c: ReactNode, i: number) => {
    const d = off(i);
    const active = d === 0;
    const base = "absolute inset-0 transition-all duration-500";
    const ease = "[transition-timing-function:cubic-bezier(.22,1,.36,1)]";
    if (variant === "fade") {
      return (
        <div key={i} aria-hidden={!active}
          className={cn(base, ease, active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0")}
          style={{ transform: active ? "scale(1)" : `scale(.96) translateX(${dir * 24}px)` }}>
          {c}
        </div>
      );
    }
    if (variant === "coverflow") {
      const ad = Math.abs(d);
      if (ad > 2) return <div key={i} className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden>{c}</div>;
      return (
        <div key={i} aria-hidden={!active}
          className={cn(base, ease, !active && "pointer-events-none")}
          style={{
            transform: `translateX(calc(${d * 58}% + ${dragPx * 0.4}px)) rotateY(${-d * 38}deg) scale(${1 - ad * 0.14})`,
            zIndex: 10 - ad,
            opacity: 1 - ad * 0.35,
            filter: active ? "none" : "brightness(.72)",
            transformStyle: "preserve-3d",
          }}>
          {c}
        </div>
      );
    }
    if (variant === "cube") {
      const ad = Math.abs(d);
      if (ad > 1) return <div key={i} className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden>{c}</div>;
      const rot = d * -90 + (dragging ? (-dragPx / size) * 90 : 0);
      return (
        <div key={i} aria-hidden={!active}
          className={cn(base, dragging ? "duration-0" : "duration-500", ease)}
          style={{
            transform: `rotateY(${rot + index * 0}deg) translateZ(${ad === 0 ? 0 : 0}px)`,
            transformOrigin: d >= 0 ? "left center" : "right center",
            zIndex: active ? 10 : 5,
            opacity: ad > 1 ? 0 : 1,
            backfaceVisibility: "hidden",
          }}>
          {c}
        </div>
      );
    }
    if (variant === "stack") {
      if (d < 0 || d > 3) return <div key={i} className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden>{c}</div>;
      return (
        <div key={i} aria-hidden={!active}
          className={cn(base, ease, !active && "pointer-events-none")}
          style={{
            transform: `translateY(${d * 16}px) scale(${1 - d * 0.07}) ${active ? `translate(${dragPx}px, ${dragPx * 0.15}px) rotate(${dragPx / 22}deg)` : ""}`,
            zIndex: 20 - d,
            opacity: 1 - d * 0.28,
          }}>
          {c}
        </div>
      );
    }
    if (variant === "vertical") {
      return (
        <div key={i} aria-hidden={!active}
          className={cn(base, dragging ? "duration-0" : "duration-500", ease)}
          style={{ transform: `translateY(calc(${d * 100}% + ${d * gap}px + ${dragPx}px))`, zIndex: active ? 10 : 1, opacity: Math.abs(d) > 1 ? 0 : 1 }}>
          {c}
        </div>
      );
    }
    if (variant === "peek") {
      return (
        <div key={i} aria-hidden={!active}
          className={cn(base, dragging ? "duration-0" : "duration-500", ease)}
          style={{
            transform: `translateX(calc(${d * 78}% + ${d * gap}px + ${dragPx}px)) scale(${active ? 1 : 0.92})`,
            zIndex: 10 - Math.abs(d),
            opacity: Math.abs(d) > 2 ? 0 : 1 - Math.abs(d) * 0.25,
            left: "11%",
            right: "11%",
          }}>
          {c}
        </div>
      );
    }
    /* slide (default) */
    return (
      <div key={i} aria-hidden={!active}
        className={cn(base, dragging ? "duration-0" : "duration-500", ease)}
        style={{ transform: `translateX(calc(${d * 100}% + ${d * gap}px + ${dragPx}px))`, zIndex: active ? 10 : 1 }}>
        {c}
      </div>
    );
  };

  const needPerspective = variant === "coverflow" || variant === "cube";
  return (
    <div className={className}>
      <div
        ref={box}
        role="region"
        aria-roledescription="карусель"
        aria-label={`${label} · ${index + 1} из ${n}`}
        tabIndex={0}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={() => { if (dragSt.current?.moved) onUp(); setHover(false); }}
        onMouseEnter={() => setHover(true)}
        className="relative select-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky rounded-[inherit]"
        style={{ touchAction: vertical ? "pan-x" : "pan-y", height: height === "auto" ? undefined : height, minHeight: height === "auto" ? 200 : undefined, perspective: needPerspective ? "1200px" : undefined }}
      >
        <div className={cn("relative w-full", height === "auto" && "aspect-[16/10]")} style={height !== "auto" ? { height } : undefined}>
          {children.map(renderSlide)}
        </div>
        {/* градиентные края для peek */}
        {variant === "peek" && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-ink-900/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-ink-900/80 to-transparent" />
          </>
        )}
        {/* стрелки */}
        {arrows && n > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); tap(); prev(); }}
              disabled={!loop && index === 0}
              aria-label="Назад"
              className="absolute left-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink-950/70 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-ink-800 disabled:opacity-30"
            >
              <Icon name="chevL" size={20} stroke={2.8} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); tap(); next(); }}
              disabled={!loop && index === n - 1}
              aria-label="Вперёд"
              className="absolute right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink-950/70 text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-ink-800 disabled:opacity-30"
            >
              <Icon name="chevR" size={20} stroke={2.8} />
            </button>
          </>
        )}
        {counter && (
          <div className="absolute bottom-2.5 right-3 z-20 rounded-lg bg-ink-950/70 px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums backdrop-blur">
            {index + 1} / {n}
          </div>
        )}
        {/* живой регион для скринридеров */}
        <div className="sr-only" aria-live="polite">Слайд {index + 1} из {n}</div>
      </div>

      {/* нижняя панель */}
      {(dots || progress || thumbs) && n > 1 && (
        <div className="mt-3 flex flex-col gap-2.5">
          {progress && (
            <div className="well h-2 overflow-hidden rounded-full" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={n}>
              <div className="h-full rounded-full bg-gradient-to-r from-bull to-sky transition-all duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)]" style={{ width: `${((index + 1) / n) * 100}%` }} />
            </div>
          )}
          {dots && (
            <div className="flex items-center justify-center gap-1.5" role="tablist" aria-label="Слайды">
              {children.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Слайд ${i + 1}`}
                  onClick={() => { tap("tick"); go(i); }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]",
                    i === index ? "w-7 bg-white shadow-[0_0_10px_rgba(255,255,255,.5)]" : "w-2 bg-ink-500 hover:bg-ink-300"
                  )}
                />
              ))}
            </div>
          )}
          {thumbs && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {thumbs.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { tap("tick"); go(i); }}
                  aria-label={`Миниатюра ${i + 1}`}
                  className={cn(
                    "h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition-all",
                    i === index ? "ring-sky scale-105" : "ring-transparent opacity-55 hover:opacity-90"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
