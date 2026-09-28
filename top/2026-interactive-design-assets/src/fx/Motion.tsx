import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFx } from "./fx";

/* ── scroll reveal wrapper ── */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className = "",
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const fx = useFx();
  return (
    <motion.div
      className={className}
      initial={fx.reduced ? false : { opacity: 0, y, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 160, damping: 22, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ── magnetic hover (desktop pointers) ── */
export function Magnetic({ children, strength = 0.28, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  const fx = useFx();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (fx.reduced || !ref.current || e.pointerType !== "mouse") return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── 3D tilt card following the pointer ── */
export function Tilt({
  children,
  max = 7,
  className = "",
  style,
}: {
  children: ReactNode;
  max?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 20 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 20 });
  const fx = useFx();
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, rotateX: fx.reduced ? 0 : rx, rotateY: fx.reduced ? 0 : ry, transformPerspective: 1100, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (fx.reduced || !ref.current || e.pointerType !== "mouse") return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── animated counter ── */
export function CountUp({ to, suffix = "", duration = 1.4, className = "" }: { to: number; suffix?: string; duration?: number; className?: string }) {
  const fx = useFx();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (fx.reduced) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const p = Math.min(1, (now - t0) / (duration * 1000));
      const e = 1 - Math.pow(1 - p, 4);
      setV(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, fx.reduced]);
  return (
    <span ref={ref} className={`tnum tabular-nums ${className}`}>
      {v.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ── staggered container + item ── */
export function Stagger({ children, className = "", gap = 0.07 }: { children: ReactNode; className?: string; gap?: number }) {
  const fx = useFx();
  return (
    <motion.div
      className={className}
      initial={fx.reduced ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className = "", y = 26 }: { children: ReactNode; className?: string; y?: number }) {
  const fx = useFx();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: fx.reduced ? {} : { opacity: 0, y, scale: 0.97 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 170, damping: 20 } },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ── letter-by-letter display headline ── */
export function SplitHeadline({ text, className = "", accent = "FX", delay = 0 }: { text: string; className?: string; accent?: string; delay?: number }) {
  const fx = useFx();
  const words = text.split(" ");
  let ci = 0;
  return (
    <span className={className} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden>
          {w.split("").map((ch, i) => {
            const hot = accent && w.includes(accent);
            const idx = ci++;
            return (
              <motion.span
                key={i}
                className="inline-block"
                style={hot ? { color: "var(--ember-hi)", textShadow: "0 3px 0 rgba(0,0,0,.5), 0 0 30px var(--ember-glow)" } : undefined}
                initial={fx.reduced ? false : { y: 44, opacity: 0, rotateX: -70 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ delay: delay + idx * 0.028, type: "spring", stiffness: 320, damping: 22 }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/* ── infinite marquee row ── */
export function MarqueeRow({ children, slow = false, className = "" }: { children: ReactNode; slow?: boolean; className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className={`${slow ? "animate-marquee-slow" : "animate-marquee"} flex w-max items-center gap-3 pr-3`}>
        {children}
        {children}
      </div>
    </div>
  );
}

/* ── scroll parallax wrapper ── */
export function Parallax({ children, offset = 60, className = "" }: { children: ReactNode; offset?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) {
        const r = ref.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const t = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        setP(t);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className={className} style={{ transform: `translate3d(0, ${(-p * offset).toFixed(1)}px, 0)` }}>
      {children}
    </div>
  );
}

/* ── pulsing live dot ── */
export function LiveDot({ color = "#22c55e", size = 9 }: { color?: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }} aria-hidden>
      <span className="absolute inset-0 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      <span className="absolute inset-0 rounded-full" style={{ background: color, animation: "pulse-ring 2s ease-out infinite" }} />
    </span>
  );
}

/* ── pressable scale wrapper for any control ── */
export function Pressable({ children, className = "" }: { children: ReactNode; className?: string }) {
  const fx = useFx();
  return (
    <motion.div className={className} whileTap={fx.reduced ? undefined : { scale: 0.94 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
      {children}
    </motion.div>
  );
}
