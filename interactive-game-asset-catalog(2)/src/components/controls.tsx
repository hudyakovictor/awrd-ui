import { animate, AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { sfx } from "../motion/sfx";
import { EASE, SPRING, clamp } from "../motion/tokens";

/* =====================================================================
   INTERACTIVE CONTROLS — общий тактильный язык всех интерактивных наборов.
   Правило: каждый контрол управляет MotionValue, а не стейтом.
   Сцена подписывается на значение и строит из него эффекты — 60 FPS
   без ререндеров, и скрипт демо может «двигать палец» тем же API.
   ===================================================================== */

/* ------------------------------- SLIDER ------------------------------- */
export interface SliderProps {
  mv: MotionValue<number>;
  steps?: number;
  color?: string;
  label?: string;
  format?: (v: number) => string;
  onCommit?: (v: number) => void;
  onStart?: () => void;
  gradient?: string;
  className?: string;
  marks?: string[];
}

export function Slider({ mv, steps = 0, color = "#2ee6c5", label, format, onCommit, onStart, gradient, className = "", marks }: SliderProps) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [drag, setDrag] = useState(false);
  const last = useRef(-1);
  const pct = useTransform(mv, (v) => `${clamp(v) * 100}%`);
  const text = useTransform(mv, (v) => (format ? format(clamp(v)) : `${Math.round(clamp(v) * 100)}%`));
  useMotionValueEvent(mv, "change", (v) => {
    const s = steps ? Math.round(v * steps) : Math.floor(v * 16);
    if (s !== last.current) {
      last.current = s;
      if (dragging.current) sfx.tick();
    }
  });
  const setFrom = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    mv.set(clamp((e.clientX - r.left) / r.width));
  };
  const end = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setDrag(false);
    let v = mv.get();
    if (steps) {
      v = Math.round(v * steps) / steps;
      animate(mv, v, SPRING.tap);
    }
    onCommit?.(v);
  };
  return (
    <div className={`select-none ${className}`}>
      {label && (
        <div className="mb-1 flex justify-between text-[10px] font-bold">
          <span className="text-white/50">{label}</span>
          <motion.span style={{ color }}>{text}</motion.span>
        </div>
      )}
      <div
        ref={track}
        className="relative h-8 cursor-pointer touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          setDrag(true);
          onStart?.();
          sfx.tap();
          setFrom(e);
        }}
        onPointerMove={(e) => dragging.current && setFrom(e)}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
        {steps > 0 &&
          Array.from({ length: steps + 1 }).map((_, i) => (
            <div key={i} className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/20" style={{ left: `${(i / steps) * 100}%` }} />
          ))}
        <motion.div
          className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
          style={{ width: pct, background: gradient ?? `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 12px ${color}88` }}
        />
        <motion.div className="absolute top-1/2 -ml-3.5 -mt-3.5 h-7 w-7" style={{ left: pct }}>
          <motion.div
            className="h-full w-full rounded-full border-[3px] bg-white"
            style={{ borderColor: color, boxShadow: `0 0 16px ${color}, 0 4px 10px #0008` }}
            animate={{ scale: drag ? 1.3 : 1 }}
            transition={SPRING.tap}
          />
          <AnimatePresence>
            {drag && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.6 }}
                transition={SPRING.tap}
                className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 font-mono text-[10px] font-bold text-black"
                style={{ background: color }}
              >
                <motion.span>{text}</motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {marks && (
        <div className="mt-0.5 flex justify-between text-[9px] font-bold text-white/35">
          {marks.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ V-SLIDER ------------------------------ */
export function VSlider({ mv, color = "#2ee6c5", height = 150, label, onCommit }: { mv: MotionValue<number>; color?: string; height?: number; label?: string; onCommit?: (v: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [drag, setDrag] = useState(false);
  const h = useTransform(mv, (v) => `${clamp(v) * 100}%`);
  const last = useRef(-1);
  useMotionValueEvent(mv, "change", (v) => {
    const s = Math.floor(v * 12);
    if (s !== last.current) {
      last.current = s;
      if (dragging.current) sfx.tick();
    }
  });
  const setFrom = (e: React.PointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    mv.set(clamp(1 - (e.clientY - r.top) / r.height));
  };
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div
        ref={track}
        className="relative w-10 cursor-pointer touch-none rounded-2xl bg-white/[.06]"
        style={{ height }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          setDrag(true);
          setFrom(e);
        }}
        onPointerMove={(e) => dragging.current && setFrom(e)}
        onPointerUp={() => {
          dragging.current = false;
          setDrag(false);
          onCommit?.(mv.get());
        }}
      >
        <motion.div className="absolute inset-x-0 bottom-0 rounded-2xl" style={{ height: h, background: `linear-gradient(0deg, ${color}55, ${color})`, boxShadow: `0 0 16px ${color}66` }} />
        <motion.div className="absolute inset-x-1 h-2 rounded-full bg-white" style={{ bottom: h, marginBottom: -4 }} animate={{ scaleX: drag ? 1.15 : 1 }} />
      </div>
      {label && <span className="text-[9px] font-bold text-white/50">{label}</span>}
    </div>
  );
}

/* -------------------------------- KNOB -------------------------------- */
export function Knob({ mv, size = 130, color = "#2ee6c5", steps = 30, label, onCommit }: { mv: MotionValue<number>; size?: number; color?: string; steps?: number; label?: string; onCommit?: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [drag, setDrag] = useState(false);
  const rot = useTransform(mv, (v) => -135 + clamp(v) * 270);
  const R = size / 2 - 8;
  const L = 2 * Math.PI * R;
  const dash = useTransform(mv, (v) => `${L * 0.75 * clamp(v)} ${L}`);
  const last = useRef(-1);
  useMotionValueEvent(mv, "change", (v) => {
    const s = Math.round(v * steps);
    if (s !== last.current) {
      last.current = s;
      if (dragging.current) sfx.spinTick(s);
    }
  });
  const setFrom = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
    a = Math.max(-135, Math.min(135, a));
    mv.set((a + 135) / 270);
  };
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        ref={ref}
        className="relative cursor-grab touch-none active:cursor-grabbing"
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          setDrag(true);
          setFrom(e);
        }}
        onPointerMove={(e) => dragging.current && setFrom(e)}
        onPointerUp={() => {
          dragging.current = false;
          setDrag(false);
          onCommit?.(mv.get());
        }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 rotate-[135deg]">
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#ffffff14" strokeWidth="6" strokeDasharray={`${L * 0.75} ${L}`} strokeLinecap="round" />
          <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" style={{ strokeDasharray: dash, filter: `drop-shadow(0 0 6px ${color})` }} />
        </svg>
        <motion.div
          className="absolute inset-[18%] rounded-full border border-white/15 bg-gradient-to-b from-[#2a3658] to-[#0c1428] shadow-[0_10px_20px_-6px_#000,inset_0_1px_0_#ffffff22]"
          style={{ rotate: rot }}
          animate={{ scale: drag ? 1.05 : 1 }}
        >
          <div className="absolute left-1/2 top-2 h-3 w-1.5 -ml-[3px] rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        </motion.div>
      </div>
      {label && <span className="text-[10px] font-bold text-white/50">{label}</span>}
    </div>
  );
}

/* ------------------------------ CAROUSEL ------------------------------ */
type CMode = "cover" | "flat" | "stack";

function CItem({ x, i, step, mode, active, children, onTap }: { x: MotionValue<number>; i: number; step: number; mode: CMode; active: boolean; children: ReactNode; onTap: () => void }) {
  const off = useTransform(x, (v) => (v + i * step) / step);
  const rotateY = useTransform(off, [-2, -1, 0, 1, 2], mode === "cover" ? [55, 42, 0, -42, -55] : [0, 0, 0, 0, 0]);
  const scale = useTransform(off, [-2, -1, 0, 1, 2], mode === "flat" ? [0.8, 0.88, 1, 0.88, 0.8] : [0.62, 0.78, 1, 0.78, 0.62]);
  const opacity = useTransform(off, [-3, -2, 0, 2, 3], [0, 0.45, 1, 0.45, 0]);
  const zIndex = useTransform(off, (v) => 100 - Math.round(Math.abs(v) * 10));
  const tx = useTransform(off, (v) => (mode === "stack" ? (v < 0 ? v * step : v * 18) : v * step * (mode === "cover" ? 0.72 : 1)));
  const ty = useTransform(off, (v) => (mode === "stack" && v > 0 ? v * -10 : 0));
  const blur = useTransform(off, (v) => `blur(${Math.min(4, Math.abs(v) * 2)}px)`);
  return (
    <motion.div
      className="absolute left-1/2 top-0"
      style={{ x: tx, y: ty, rotateY, scale, opacity, zIndex, filter: mode === "cover" ? blur : undefined, translateX: "-50%", transformStyle: "preserve-3d" }}
      onTap={onTap}
    >
      <motion.div animate={{ y: active ? -4 : 0 }} transition={SPRING.panel}>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Carousel({
  count,
  index,
  onIndex,
  step = 150,
  mode = "cover",
  height = 220,
  render,
  onTapActive,
  xOut,
}: {
  count: number;
  index: number;
  onIndex: (i: number) => void;
  step?: number;
  mode?: CMode;
  height?: number;
  render: (i: number, active: boolean) => ReactNode;
  onTapActive?: (i: number) => void;
  xOut?: MotionValue<number>;
}) {
  const own = useMotionValue(-index * step);
  const x = xOut ?? own;
  const base = useRef(0);
  const center = useRef(index);
  useEffect(() => {
    animate(x, -index * step, SPRING.panel);
  }, [index, step, x]);
  useMotionValueEvent(x, "change", (v) => {
    const c = Math.round(-v / step);
    if (c !== center.current) {
      center.current = c;
      if (c >= 0 && c < count) sfx.spinTick(c);
    }
  });
  return (
    <motion.div
      className="relative w-full cursor-grab touch-pan-y active:cursor-grabbing"
      style={{ height, perspective: 900 }}
      onPanStart={() => {
        base.current = x.get();
      }}
      onPan={(_, info) => {
        let v = base.current + info.offset.x;
        const min = -(count - 1) * step;
        if (v > 0) v = Math.pow(v, 0.7);
        if (v < min) v = min - Math.pow(min - v, 0.7);
        x.set(v);
      }}
      onPanEnd={(_, info) => {
        const proj = x.get() + info.velocity.x * 0.18;
        const n = Math.max(0, Math.min(count - 1, Math.round(-proj / step)));
        if (n === index) animate(x, -n * step, SPRING.panel);
        onIndex(n);
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CItem key={i} x={x} i={i} step={step} mode={mode} active={i === index} onTap={() => (i === index ? onTapActive?.(i) : onIndex(i))}>
          {render(i, i === index)}
        </CItem>
      ))}
    </motion.div>
  );
}

/* ------------------------------ SEGMENTED ------------------------------ */
export function Segmented({ options, value, onChange, color = "#2ee6c5" }: { options: string[]; value: number; onChange: (i: number) => void; color?: string }) {
  const id = useId();
  return (
    <div className="relative flex rounded-xl border border-white/10 bg-black/30 p-1">
      {options.map((o, i) => (
        <button
          key={o}
          onClick={() => {
            if (i !== value) sfx.tap();
            onChange(i);
          }}
          className="relative flex-1 rounded-lg py-1.5 text-[11px] font-bold"
        >
          {value === i && <motion.span layoutId={`seg${id}`} transition={SPRING.layout} className="absolute inset-0 rounded-lg" style={{ background: color, boxShadow: `0 0 14px ${color}66` }} />}
          <span className={`relative ${value === i ? "text-black" : "text-white/60"}`}>{o}</span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- TOGGLE ------------------------------- */
export function Toggle({ on, onChange, color = "#2ee6c5", size = 1 }: { on: boolean; onChange: (v: boolean) => void; color?: string; size?: number }) {
  return (
    <motion.button
      onClick={() => {
        sfx.snap();
        onChange(!on);
      }}
      className="relative rounded-full"
      style={{ width: 48 * size, height: 28 * size }}
      animate={{ background: on ? color : "#ffffff1a", boxShadow: on ? `0 0 16px ${color}88` : "0 0 0 #0000" }}
      transition={{ duration: 0.25 }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.span
        className="absolute top-[3px] rounded-full bg-white shadow-md"
        style={{ height: 22 * size, width: 22 * size }}
        animate={{ left: on ? 23 * size : 3 * size, scaleX: [1, 1.35, 1] }}
        transition={{ left: { type: "spring", stiffness: 600, damping: 28 }, scaleX: { duration: 0.3 } }}
        key={on ? "on" : "off"}
      />
    </motion.button>
  );
}

/* ------------------------------ HOLD BUTTON ------------------------------ */
export function HoldButton({
  mv,
  ms = 1200,
  color = "#2ee6c5",
  size = 96,
  onComplete,
  onStart,
  onCancel,
  children,
}: {
  mv: MotionValue<number>;
  ms?: number;
  color?: string;
  size?: number;
  onComplete: () => void;
  onStart?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
}) {
  const R = size / 2 - 5;
  const L = 2 * Math.PI * R;
  const dash = useTransform(mv, (v) => `${L * clamp(v)} ${L}`);
  const scale = useTransform(mv, [0, 1], [1, 0.9]);
  const glow = useTransform(mv, (v) => `0 0 ${10 + v * 40}px ${color}`);
  const ctl = useRef<ReturnType<typeof animate> | null>(null);
  const done = useRef(false);
  const down = () => {
    done.current = false;
    onStart?.();
    sfx.suck();
    ctl.current?.stop();
    ctl.current = animate(mv, 1, {
      duration: (ms / 1000) * (1 - mv.get()),
      ease: "linear",
      onComplete: () => {
        done.current = true;
        onComplete();
      },
    });
  };
  const up = () => {
    if (done.current) return;
    ctl.current?.stop();
    if (mv.get() > 0.02) onCancel?.();
    animate(mv, 0, { type: "spring", stiffness: 300, damping: 14 });
  };
  return (
    <motion.button
      className="relative grid touch-none place-items-center rounded-full select-none"
      style={{ width: size, height: size, scale }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
    >
      <motion.div className="absolute inset-[10px] rounded-full bg-gradient-to-b from-[#1d2b4f] to-[#0c1428]" style={{ boxShadow: glow }} />
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#ffffff14" strokeWidth="5" />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" style={{ strokeDasharray: dash, filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="relative">{children}</div>
    </motion.button>
  );
}

/* ----------------------------- SWIPE CONFIRM ----------------------------- */
export function SwipeConfirm({ mv, label = "Проведи, чтобы подтвердить", color = "#2ee6c5", onDone, width = 256, doneLabel = "Готово" }: { mv: MotionValue<number>; label?: string; color?: string; onDone: () => void; width?: number; doneLabel?: string }) {
  const track = width - 56;
  const x = useTransform(mv, (v) => clamp(v) * track);
  const fill = useTransform(mv, (v) => 48 + clamp(v) * track);
  const textOp = useTransform(mv, [0, 0.6], [1, 0]);
  const [done, setDone] = useState(false);
  const base = useRef(0);
  useMotionValueEvent(mv, "change", (v) => {
    if (v < 0.02 && done) setDone(false);
  });
  return (
    <div className="relative h-14 overflow-hidden rounded-full border border-white/10 bg-black/40 select-none" style={{ width }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width: fill, background: `linear-gradient(90deg, ${color}33, ${color}aa)` }} />
      <motion.div className="sheen absolute inset-0 grid place-items-center text-[12px] font-bold text-white/70" style={{ opacity: textOp }}>
        {label}
      </motion.div>
      <motion.div
        className="absolute left-1 top-1 grid h-12 w-12 cursor-grab touch-none place-items-center rounded-full active:cursor-grabbing"
        style={{ x, background: color, boxShadow: `0 0 20px ${color}` }}
        onPanStart={() => {
          base.current = mv.get();
          sfx.tap();
        }}
        onPan={(_, info) => !done && mv.set(clamp(base.current + info.offset.x / track))}
        onPanEnd={() => {
          if (done) return;
          if (mv.get() > 0.85) {
            animate(mv, 1, SPRING.tap);
            setDone(true);
            onDone();
          } else animate(mv, 0, { type: "spring", stiffness: 400, damping: 22 });
        }}
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.svg key="ok" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#022" strokeWidth="3.5" strokeLinecap="round">
              <path d="M5 12l5 5 9-10" />
            </motion.svg>
          ) : (
            <motion.svg key="ar" exit={{ scale: 0 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#022" strokeWidth="3" strokeLinecap="round">
              <path d="M9 5l7 7-7 7" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 grid place-items-center pr-10 text-[12px] font-black text-[#022]">
            {doneLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------ SWIPE ZONE ------------------------------ */
export type Dir = "left" | "right" | "up" | "down";
export function useSwipe(onSwipe: (d: Dir) => void, threshold = 50) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      const fast = performance.now() - s.t < 400;
      const th = fast ? threshold * 0.6 : threshold;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < th) return;
      if (Math.abs(dx) > Math.abs(dy)) onSwipe(dx > 0 ? "right" : "left");
      else onSwipe(dy > 0 ? "down" : "up");
    },
  };
}

/* ------------------------------ GHOST FINGER ------------------------------ */
/**
 * «Призрачный палец» — демонстрирует жест в автодемо.
 * Секрет обучения без текста: палец показывает КУДА и КАК, а контрол
 * двигается тем же MotionValue, что и при реальном касании.
 */
export function useGhost() {
  const x = useMotionValue(150);
  const y = useMotionValue(560);
  const [show, setShow] = useState(false);
  const [down, setDown] = useState(false);
  const api = useMemo(
    () => ({
      show: (px?: number, py?: number) => {
        if (px !== undefined) x.set(px);
        if (py !== undefined) y.set(py);
        setShow(true);
      },
      hide: () => setShow(false),
      press: (v: boolean) => setDown(v),
      move: (tx: number, ty: number, d = 0.5, ease: [number, number, number, number] = EASE.camera) =>
        Promise.all([animate(x, tx, { duration: d, ease }), animate(y, ty, { duration: d, ease })]),
      x,
      y,
    }),
    [x, y],
  );
  const el = (
    <AnimatePresence>
      {show && (
        <motion.div
          key="ghost"
          className="pointer-events-none absolute left-0 top-0 z-[55] -ml-5 -mt-5 h-10 w-10"
          style={{ x, y }}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.4 }}
        >
          <motion.div className="absolute inset-0 rounded-full border-2 border-white/80" animate={{ scale: down ? 0.7 : 1.15, opacity: down ? 1 : 0.5 }} transition={SPRING.tap} />
          <motion.div className="absolute inset-2.5 rounded-full bg-white shadow-[0_0_18px_#fff]" animate={{ scale: down ? 0.8 : 1 }} transition={SPRING.tap} />
        </motion.div>
      )}
    </AnimatePresence>
  );
  return { ...api, el };
}

/* ------------------------------ ROLLING NUMBER ------------------------------ */
export function Roll({ value, className = "", color }: { value: string | number; className?: string; color?: string }) {
  const chars = String(value).split("");
  return (
    <span className={`inline-flex overflow-hidden ${className}`} style={{ color }}>
      {chars.map((ch, i) => (
        <span key={i} className="relative inline-block">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={ch + i} className="inline-block" initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30, delay: i * 0.02 }}>
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------ HINT CHIP ------------------------------ */
export function Hint({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={`pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.2em] text-white/70 backdrop-blur ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

/* helpers */
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function hexMix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(mix(v, pb[i], clamp(t))).toString(16).padStart(2, "0")).join("");
}
