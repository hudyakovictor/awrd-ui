/* ------------------------------------------------------------------
 * TRADELINGO SHOWCASE FX KIT v2
 * Zoom/pan · backdrops · shockwaves · orbit (inertia) · animated numbers
 * scene keyboard shortcuts · rAF loops · scan beams · glitch text
 * ------------------------------------------------------------------ */
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Fragment, useCallback, useEffect, useRef, useState,
  type CSSProperties, type PointerEvent as RPE, type ReactNode,
} from "react";
import { cn } from "../utils/cn";

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ============================================================
 * ZOOM & PAN in index space (charts)
 * wheel = zoom around cursor · shift+wheel = pan · drag = pan
 * ============================================================ */
export function useZoomPan(total: number, opts: { minSpan?: number; initialSpan?: number } = {}) {
  const minSpan = Math.max(2, Math.min(total, opts.minSpan ?? 12));
  const [win, setWin] = useState<[number, number]>(() => {
    const s = clamp(opts.initialSpan ?? total, minSpan, total);
    return [total - s, total];
  });
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; a: number; b: number; w: number; moved: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const winRef = useRef(win);
  winRef.current = win;

  useEffect(() => {
    setWin(([a, b]) => {
      const span = clamp(b - a, minSpan, total);
      const end = clamp(b, span, total);
      return [end - span, end];
    });
  }, [total, minSpan]);

  const zoomAt = useCallback(
    (factor: number, frac = 0.5) => {
      setWin(([a, b]) => {
        const span = b - a;
        const ns = clamp(span * factor, minSpan, total);
        const pivot = a + span * frac;
        const na = clamp(pivot - ns * frac, 0, total - ns);
        return [na, na + ns];
      });
    },
    [minSpan, total],
  );

  const panBy = useCallback(
    (fracOfSpan: number) => {
      setWin(([a, b]) => {
        const s = b - a;
        const na = clamp(a + fracOfSpan * s, 0, total - s);
        return [na, na + s];
      });
    },
    [total],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const frac = clamp((e.clientX - r.left) / r.width, 0, 1);
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        panBy((e.deltaX || e.deltaY) / r.width);
      } else {
        zoomAt(e.deltaY > 0 ? 1.12 : 0.89, frac);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt, panBy]);

  const bind = {
    onPointerDown: (e: RPE<HTMLDivElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      drag.current = { x: e.clientX, a: winRef.current[0], b: winRef.current[1], w: r.width, moved: 0 };
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setDragging(true);
    },
    onPointerMove: (e: RPE<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      d.moved = Math.max(d.moved, Math.abs(e.clientX - d.x));
      const span = d.b - d.a;
      const na = clamp(d.a - ((e.clientX - d.x) / d.w) * span, 0, total - span);
      setWin([na, na + span]);
    },
    onPointerUp: () => {
      drag.current = null;
      setDragging(false);
    },
    onPointerCancel: () => {
      drag.current = null;
      setDragging(false);
    },
    onDoubleClick: () => setWin([0, total]),
  };

  return {
    ref,
    start: win[0],
    end: win[1],
    span: win[1] - win[0],
    zoom: total / Math.max(1, win[1] - win[0]),
    dragging,
    lastMoved: () => drag.current?.moved ?? 0,
    zoomAt,
    panBy,
    setWin,
    reset: () => setWin([0, total]),
    bind,
  };
}

/* ============================================================
 * rAF loop with dt (seconds) — pauses when offscreen
 * ============================================================ */
export function useRafLoop(cb: (dt: number, t: number) => void, active = true) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      cbRef.current(dt, t / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

export function useOnScreen<T extends Element>(margin = "150px") {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { margin: margin as `${number}px` });
  return { ref, inView };
}

/* ============================================================
 * SCENE KEYBOARD — keys only fire while pointer is over the scene
 * ============================================================ */
export function useSceneKeys(map: Record<string, () => void>) {
  const active = useRef(false);
  const mapRef = useRef(map);
  mapRef.current = map;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!active.current) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (t as HTMLInputElement).type !== "range"))) return;
      const k = e.key === " " ? "Space" : e.key;
      const fn = mapRef.current[k] ?? mapRef.current[k.toLowerCase()];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return {
    onPointerEnter: () => { active.current = true; },
    onPointerLeave: () => { active.current = false; },
  };
}

export function KeyHints({ keys }: { keys: { k: string; d: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {keys.map((h) => (
        <span key={h.k + h.d} className="flex items-center gap-1.5 text-[10px] font-bold text-[#7d92c4]">
          <kbd className="rounded-md border border-white/20 bg-white/8 px-1.5 py-0.5 font-mono text-[10px] font-extrabold text-white" style={{ boxShadow: "0 2px 0 rgba(0,0,0,.5)" }}>
            {h.k}
          </kbd>
          {h.d}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
 * ANIMATED NUMBER — spring-driven text
 * ============================================================ */
export function AnimatedNumber({
  value, format, className, style, stiffness = 90,
}: {
  value: number; format?: (v: number) => string; className?: string; style?: CSSProperties; stiffness?: number;
}) {
  const mv = useSpring(value, { stiffness, damping: 20 });
  const fmtRef = useRef(format);
  fmtRef.current = format;
  useEffect(() => { mv.set(value); }, [value, mv]);
  const text = useTransform(mv, (v) => (fmtRef.current ? fmtRef.current(v) : Math.round(v).toLocaleString("en-US")));
  return <motion.span className={className} style={style}>{text}</motion.span>;
}

/* ============================================================
 * SHOCKWAVES — expanding rings at a point (px inside parent)
 * ============================================================ */
type Wave = { id: number; x: number; y: number; c: string; s: number };
export function useShockwaves() {
  const [waves, setWaves] = useState<Wave[]>([]);
  const fire = useCallback((x: number, y: number, c = "#ffffff", s = 1) => {
    const id = Math.random();
    setWaves((w) => [...w.slice(-8), { id, x, y, c, s }]);
    window.setTimeout(() => setWaves((w) => w.filter((q) => q.id !== id)), 1100);
  }, []);
  const node = (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {waves.map((w) => (
        <Fragment key={w.id}>
          {[0, 1, 2].map((k) => (
            <motion.span
              key={k}
              className="absolute rounded-full border-2"
              style={{ left: w.x, top: w.y, borderColor: w.c, boxShadow: `0 0 18px ${w.c}` }}
              initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.95 }}
              animate={{ width: 180 * w.s, height: 180 * w.s, x: -90 * w.s, y: -90 * w.s, opacity: 0 }}
              transition={{ duration: 0.9, delay: k * 0.12, ease: "easeOut" }}
            />
          ))}
          <motion.span
            className="absolute rounded-full"
            style={{ left: w.x, top: w.y, background: w.c }}
            initial={{ width: 30 * w.s, height: 30 * w.s, x: -15 * w.s, y: -15 * w.s, opacity: 0.8 }}
            animate={{ opacity: 0, scale: 1.8 }}
            transition={{ duration: 0.45 }}
          />
        </Fragment>
      ))}
    </div>
  );
  return { fire, node };
}

/* ============================================================
 * ORBIT — drag to rotate a 3D stage with inertia + auto spin
 * ============================================================ */
export function Orbit({
  children, className, height = 320, initial = { x: -22, y: 30 }, autoSpin = false, perspective = 1100,
  onRotate,
}: {
  children: ReactNode; className?: string; height?: number; initial?: { x: number; y: number };
  autoSpin?: boolean; perspective?: number; onRotate?: (x: number, y: number) => void;
}) {
  const rx = useMotionValue(initial.x);
  const ry = useMotionValue(initial.y);
  const srx = useSpring(rx, { stiffness: 140, damping: 20 });
  const sry = useSpring(ry, { stiffness: 140, damping: 20 });
  const last = useRef<{ x: number; y: number } | null>(null);
  const vel = useRef({ x: 0, y: 0 });
  const [grab, setGrab] = useState(false);

  useRafLoop((dt) => {
    if (autoSpin && !last.current) ry.set(ry.get() + dt * 16);
  }, autoSpin);

  useEffect(() => {
    if (!onRotate) return;
    const u1 = srx.on("change", (v) => onRotate(v, sry.get()));
    const u2 = sry.on("change", (v) => onRotate(srx.get(), v));
    return () => { u1(); u2(); };
  }, [onRotate, srx, sry]);

  return (
    <div
      className={cn("relative touch-none select-none", grab ? "cursor-grabbing" : "cursor-grab", className)}
      style={{ perspective, height }}
      onPointerDown={(e) => {
        last.current = { x: e.clientX, y: e.clientY };
        vel.current = { x: 0, y: 0 };
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setGrab(true);
      }}
      onPointerMove={(e) => {
        if (!last.current) return;
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        last.current = { x: e.clientX, y: e.clientY };
        vel.current = { x: dx, y: dy };
        ry.set(ry.get() + dx * 0.45);
        rx.set(clamp(rx.get() - dy * 0.35, -85, 85));
      }}
      onPointerUp={() => {
        last.current = null;
        setGrab(false);
        animate(ry, ry.get() + vel.current.x * 7, { type: "spring", stiffness: 40, damping: 16 });
        animate(rx, clamp(rx.get() - vel.current.y * 4, -85, 85), { type: "spring", stiffness: 40, damping: 16 });
      }}
      onDoubleClick={() => { animate(rx, initial.x); animate(ry, initial.y); }}
    >
      <motion.div className="absolute inset-0" style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}

/* ============================================================
 * 3D BOX — five faces anchored at bottom-center
 * ============================================================ */
export function Box3D({
  x = 0, z = 0, w, d, h, color, top, glow, opacity = 1, bottom = 0, transition = "all .45s cubic-bezier(.22,1,.36,1)",
}: {
  x?: number; z?: number; w: number; d: number; h: number; color: string; top?: string; glow?: boolean;
  opacity?: number; bottom?: number; transition?: string;
}) {
  const face = (extra: CSSProperties): CSSProperties => ({
    position: "absolute",
    transition,
    opacity,
    ...extra,
  });
  const hh = Math.max(1, h);
  return (
    <div
      style={{
        position: "absolute", left: "50%", bottom: 0, transformStyle: "preserve-3d",
        transform: `translate3d(${x}px, ${-bottom}px, ${z}px)`, transition,
      }}
    >
      <div style={face({ width: w, height: hh, left: -w / 2, bottom: 0, background: color, transform: `translateZ(${d / 2}px)`, boxShadow: glow ? `0 0 22px ${color}` : undefined })} />
      <div style={face({ width: w, height: hh, left: -w / 2, bottom: 0, background: color, filter: "brightness(.55)", transform: `rotateY(180deg) translateZ(${d / 2}px)` })} />
      <div style={face({ width: d, height: hh, left: -d / 2, bottom: 0, background: color, filter: "brightness(.72)", transform: `rotateY(90deg) translateZ(${w / 2}px)` })} />
      <div style={face({ width: d, height: hh, left: -d / 2, bottom: 0, background: color, filter: "brightness(.6)", transform: `rotateY(-90deg) translateZ(${w / 2}px)` })} />
      <div style={face({ width: w, height: d, left: -w / 2, bottom: hh - d / 2, background: top ?? color, filter: top ? undefined : "brightness(1.3)", transform: "rotateX(90deg)" })} />
    </div>
  );
}

/* ============================================================
 * BACKDROPS — per-scene atmosphere
 * ============================================================ */
export type BackdropVariant = "grid" | "holo" | "floor" | "stars" | "aurora" | "scan" | "radar" | "circuit";

function StarCanvas({ accent }: { accent: string }) {
  const { ref, inView } = useOnScreen<HTMLCanvasElement>();
  const stars = useRef<{ x: number; y: number; z: number; tw: number }[]>([]);
  useRafLoop((_, t) => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const r = cv.getBoundingClientRect();
    if (cv.width !== Math.round(r.width) || cv.height !== Math.round(r.height)) {
      cv.width = Math.round(r.width);
      cv.height = Math.round(r.height);
      stars.current = Array.from({ length: 110 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, z: Math.random(), tw: Math.random() * 6 }));
    }
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const s of stars.current) {
      s.x -= 0.08 + s.z * 0.35;
      if (s.x < 0) s.x = cv.width;
      const a = 0.25 + 0.6 * Math.abs(Math.sin(t * 1.2 + s.tw)) * s.z;
      ctx.fillStyle = s.z > 0.85 ? accent : "#dbe6ff";
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 0.6 + s.z * 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, inView);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export function Backdrop({ variant, accent }: { variant: BackdropVariant; accent: string }) {
  if (variant === "stars") return <StarCanvas accent={accent} />;
  if (variant === "floor") {
    return (
      <div className="absolute inset-x-0 bottom-0 h-[55%] overflow-hidden" style={{ perspective: 500 }}>
        <motion.div
          className="absolute -inset-x-1/2 bottom-[-40%] h-[180%]"
          style={{
            transform: "rotateX(72deg)",
            backgroundImage: `linear-gradient(${accent}40 1px, transparent 1px), linear-gradient(90deg, ${accent}40 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(to top, black 10%, transparent 80%)",
          }}
          animate={{ backgroundPositionY: ["0px", "44px"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  if (variant === "holo") {
    return (
      <motion.div
        className="absolute -inset-[40%] opacity-[.22] mix-blend-screen"
        style={{ background: `conic-gradient(from 0deg, transparent, ${accent}, #5b8cff, #ff5ec8, transparent 60%)`, filter: "blur(60px)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
    );
  }
  if (variant === "aurora") {
    return (
      <>
        {[0, 1, 2].map((k) => (
          <motion.div
            key={k}
            className="absolute h-[60%] w-[60%] rounded-full blur-[90px]"
            style={{ background: k === 0 ? `${accent}44` : k === 1 ? "#5b8cff33" : "#a78bff2e", left: `${k * 25}%`, top: `${k * 15}%` }}
            animate={{ x: [0, 80, -40, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 16 + k * 4, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </>
    );
  }
  if (variant === "scan") {
    return (
      <>
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.035) 3px 4px)" }} />
        <motion.div
          className="absolute inset-x-0 h-40"
          style={{ background: `linear-gradient(180deg, transparent, ${accent}22, transparent)` }}
          animate={{ top: ["-20%", "110%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </>
    );
  }
  if (variant === "radar") {
    return (
      <div className="absolute right-[-10%] top-[-20%] h-[520px] w-[520px] opacity-40">
        {[1, 0.72, 0.44].map((s) => (
          <div key={s} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border" style={{ width: `${s * 100}%`, height: `${s * 100}%`, borderColor: `${accent}44` }} />
        ))}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(from 0deg, ${accent}55, transparent 22%)` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }
  if (variant === "circuit") {
    return (
      <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 800 400">
        {Array.from({ length: 9 }, (_, i) => {
          const y = 30 + i * 42;
          const d = `M0,${y} L${120 + i * 30},${y} L${160 + i * 30},${y + 24} L${480 - i * 12},${y + 24} L${520 - i * 12},${y} L800,${y}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={`${accent}55`} strokeWidth={1} />
              <motion.path
                d={d} fill="none" stroke={accent} strokeWidth={2} strokeDasharray="30 770"
                animate={{ strokeDashoffset: [800, 0] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
              />
            </g>
          );
        })}
      </svg>
    );
  }
  // grid (default)
  return (
    <div
      className="absolute inset-0 opacity-[.5]"
      style={{
        backgroundImage: "linear-gradient(rgba(122,156,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(122,156,255,.06) 1px,transparent 1px)",
        backgroundSize: "30px 30px",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 75%)",
      }}
    />
  );
}

/* ============================================================
 * SMALL VISUAL ATOMS used inside scenes
 * ============================================================ */
export function ScanBeam({ color = "#8ef23c", duration = 3, vertical = false }: { color?: string; duration?: number; vertical?: boolean }) {
  return vertical ? (
    <motion.div
      className="pointer-events-none absolute inset-x-0 h-16"
      style={{ background: `linear-gradient(180deg, transparent, ${color}33, transparent)` }}
      animate={{ top: ["-15%", "110%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  ) : (
    <motion.div
      className="pointer-events-none absolute inset-y-0 w-20"
      style={{ background: `linear-gradient(90deg, transparent, ${color}33, transparent)` }}
      animate={{ left: ["-15%", "110%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  );
}

export function GlitchText({ text, className, color = "#fff" }: { text: string; className?: string; color?: string }) {
  return (
    <span className={cn("relative inline-block", className)} style={{ color }}>
      <span className="relative z-10">{text}</span>
      <motion.span
        aria-hidden className="absolute inset-0 text-[#ff5470]"
        animate={{ x: [0, -2, 1, 0, 0], opacity: [0, 0.8, 0.6, 0, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.04, 0.08, 0.12, 1] }}
      >{text}</motion.span>
      <motion.span
        aria-hidden className="absolute inset-0 text-[#14c8f5]"
        animate={{ x: [0, 2, -1, 0, 0], opacity: [0, 0.8, 0.6, 0, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.05, 0.09, 0.13, 1], delay: 0.03 }}
      >{text}</motion.span>
    </span>
  );
}

export function LiveDot({ color = "#2ede8a", label }: { color?: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold" style={{ color }}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: color }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      {label}
    </span>
  );
}

/** Flash overlay that pulses whenever `trigger` changes. */
export function FlashOnChange({ trigger, color }: { trigger: unknown; color: string }) {
  return (
    <motion.div
      key={String(trigger)}
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      initial={{ opacity: 0.45 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      style={{ boxShadow: `inset 0 0 0 2px ${color}, inset 0 0 40px ${color}55` }}
    />
  );
}

/** Pointer-follow spotlight inside a relative container (no re-render). */
export function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const onPointerMove = (e: RPE<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return { ref, onPointerMove };
}

export function colorRamp(t: number, stops: string[]) {
  const tt = clamp(t, 0, 0.9999) * (stops.length - 1);
  const i = Math.floor(tt);
  const f = tt - i;
  const a = hex(stops[i]);
  const b = hex(stops[i + 1]);
  return [Math.round(lerp(a[0], b[0], f)), Math.round(lerp(a[1], b[1], f)), Math.round(lerp(a[2], b[2], f))] as const;
}
function hex(h: string): [number, number, number] {
  const v = h.replace("#", "");
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
export function rgb(c: readonly [number, number, number], a = 1) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
