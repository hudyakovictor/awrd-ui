/* ------------------------------------------------------------------
 * TRADELINGO FX LIBRARY
 * Tilt · Magnetic · Ripple · Reveal · SplitText · Scramble · Typewriter
 * Odometer · CursorGlow · ScrollProgress · SectionRail · ParticleField
 * Spotlight · VelocityMarquee · Parallax · FloatingCoins · BackToTop
 * ------------------------------------------------------------------ */
import {
  motion, useAnimationFrame, useInView, useMotionTemplate, useMotionValue, useScroll,
  useSpring, useTransform, useVelocity, type MotionValue,
} from "framer-motion";
import { ArrowUp } from "lucide-react";
import {
  useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent as RME,
  type PointerEvent as RPE, type ReactNode,
} from "react";
import { cn } from "../utils/cn";
import { sfx } from "./sfx";

/* =============== utils =============== */
export const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const fn = () => setR(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return r;
}

/* =============== TILT CARD (3D + glare) =============== */
export function Tilt({ children, className, max = 14, glare = true, scale = 1.03, style }: {
  children: ReactNode; className?: string; max?: number; glare?: boolean; scale?: number; style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });
  const s = useSpring(1, { stiffness: 260, damping: 20 });
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,.28), transparent 55%)`;

  const onMove = (e: RPE<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  };
  const reset = () => { rx.set(0); ry.set(0); s.set(1); gx.set(50); gy.set(50); };

  return (
    <div className="perspective" style={{ perspective: 900 }}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerEnter={() => s.set(scale)}
        onPointerLeave={reset}
        style={{ rotateX: srx, rotateY: sry, scale: s, transformStyle: "preserve-3d", ...style }}
        className={cn("relative will-change-transform", className)}
      >
        {children}
        {glare && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}

/* =============== MAGNETIC =============== */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 14 });
  const y = useSpring(0, { stiffness: 200, damping: 14 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

/* =============== RIPPLE BUTTON =============== */
type Rip = { id: number; x: number; y: number; s: number };
export function RippleButton({ children, className, onClick, sound = "tap", disabled }: {
  children: ReactNode; className?: string; onClick?: () => void; sound?: keyof typeof sfx | null; disabled?: boolean;
}) {
  const [rips, setRips] = useState<Rip[]>([]);
  const handle = (e: RME<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 2.2;
    const id = Date.now() + Math.random();
    setRips(p => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top, s }]);
    setTimeout(() => setRips(p => p.filter(q => q.id !== id)), 650);
    if (sound) sfx[sound]();
    onClick?.();
  };
  return (
    <button disabled={disabled} onClick={handle} className={cn("relative overflow-hidden", className)}>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {rips.map(r => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute rounded-full bg-white"
          style={{ left: r.x - r.s / 2, top: r.y - r.s / 2, width: r.s, height: r.s }}
        />
      ))}
    </button>
  );
}

/* =============== REVEAL ON SCROLL =============== */
type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "blur" | "flip" | "rotate";
const revealMap: Record<RevealVariant, Record<string, number | string>> = {
  up: { y: 40, opacity: 0 },
  down: { y: -40, opacity: 0 },
  left: { x: -60, opacity: 0 },
  right: { x: 60, opacity: 0 },
  scale: { scale: 0.8, opacity: 0 },
  blur: { filter: "blur(14px)", opacity: 0, y: 20 },
  flip: { rotateX: 70, opacity: 0, y: 30 },
  rotate: { rotate: -8, opacity: 0, y: 30 },
};
export function Reveal({ children, variant = "up", delay = 0, className, once = true, duration = 0.6 }: {
  children: ReactNode; variant?: RevealVariant; delay?: number; className?: string; once?: boolean; duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-60px" });
  const init = revealMap[variant];
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={init}
      animate={inView ? { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)", rotateX: 0, rotate: 0 } : init}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, gap = 0.07 }: { children: ReactNode[]; className?: string; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} className={className}>
      {children.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 26, scale: 0.94 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: i * gap, type: "spring", stiffness: 160, damping: 18 }}
        >
          {c}
        </motion.div>
      ))}
    </div>
  );
}

/* =============== SPLIT TEXT =============== */
export function SplitText({ text, className, delay = 0, stagger = 0.03 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <span ref={ref} className={cn("inline-block", className)} aria-label={text}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          initial={{ y: "110%", opacity: 0, rotate: 8 }}
          animate={inView ? { y: 0, opacity: 1, rotate: 0 } : {}}
          transition={{ delay: delay + i * stagger, type: "spring", stiffness: 260, damping: 18 }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}

/* =============== SCRAMBLE TEXT =============== */
const GLYPHS = "01$₿Ξ◎#%&@*+=<>/\\ABCDEFXYZ";
export function ScrambleText({ text, className, trigger = true, speed = 28 }: { text: string; className?: string; trigger?: boolean; speed?: number }) {
  const [out, setOut] = useState(text);
  const run = useCallback(() => {
    let frame = 0;
    const total = text.length * 3;
    const id = setInterval(() => {
      frame++;
      setOut(text.split("").map((c, i) => {
        if (c === " ") return " ";
        if (i < frame / 3) return c;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }).join(""));
      if (frame >= total) { clearInterval(id); setOut(text); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  useEffect(() => { if (trigger) return run(); }, [trigger, run]);
  return <span className={cn("num-mono", className)} onMouseEnter={run}>{out}</span>;
}

/* =============== TYPEWRITER =============== */
export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[i % words.length];
    const t = setTimeout(() => {
      if (!del) {
        const n = w.slice(0, txt.length + 1);
        setTxt(n);
        if (n === w) setTimeout(() => setDel(true), 1100);
      } else {
        const n = w.slice(0, txt.length - 1);
        setTxt(n);
        if (n === "") { setDel(false); setI(v => v + 1); }
      }
    }, del ? 35 : 70);
    return () => clearTimeout(t);
  }, [txt, del, i, words]);
  return (
    <span className={className}>
      {txt}
      <span className="ml-0.5 inline-block w-[3px] animate-pulse bg-current align-middle" style={{ height: "0.9em" }} />
    </span>
  );
}

/* =============== ODOMETER =============== */
function Digit({ d }: { d: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none">
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        animate={{ y: `${-d}em` }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        {Array.from({ length: 10 }, (_, n) => <span key={n} className="block h-[1em] leading-none">{n}</span>)}
      </motion.span>
    </span>
  );
}
export function Odometer({ value, className, prefix = "", decimals = 0 }: { value: number; className?: string; prefix?: string; decimals?: number }) {
  const str = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span className={cn("num-mono inline-flex items-center", className)}>
      {prefix}
      {str.split("").map((c, i) => (/\d/.test(c) ? <Digit key={i} d={+c} /> : <span key={i}>{c}</span>))}
    </span>
  );
}

/* =============== CURSOR GLOW =============== */
export function CursorGlow() {
  const x = useSpring(-200, { stiffness: 140, damping: 20 });
  const y = useSpring(-200, { stiffness: 140, damping: 20 });
  const dx = useSpring(-200, { stiffness: 800, damping: 40 });
  const dy = useSpring(-200, { stiffness: 800, damping: 40 });
  const [down, setDown] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const mv = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY); dx.set(e.clientX); dy.set(e.clientY);
      const t = e.target as HTMLElement;
      setHoverBtn(!!t.closest("button, a, [data-cursor]"));
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
    };
  }, [x, y, dx, dy]);
  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] hidden -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#8ef23c]/70 md:block"
        style={{ x, y }}
        animate={{ width: hoverBtn ? 54 : 34, height: hoverBtn ? 54 : 34, scale: down ? 0.75 : 1, opacity: 1, backgroundColor: hoverBtn ? "rgba(142,242,60,.12)" : "rgba(142,242,60,0)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[201] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8ef23c] md:block" style={{ x: dx, y: dy }} />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{ x, y, background: "radial-gradient(circle, rgba(91,140,255,.10), transparent 60%)" }}
      />
    </>
  );
}

/* =============== SCROLL PROGRESS BAR =============== */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[120] h-[4px] origin-left"
      style={{ scaleX, background: "linear-gradient(90deg,#8ef23c,#5b8cff,#a78bff,#ffc531)", boxShadow: "0 0 14px rgba(142,242,60,.7)" }}
    />
  );
}

/* =============== SECTION RAIL (scroll-spy dots) =============== */
export function SectionRail({ items }: { items: { id: string; n: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    items.forEach(i => { const el = document.getElementById(i.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [items]);
  return (
    <div className="fixed right-4 top-1/2 z-[70] hidden -translate-y-1/2 flex-col gap-2.5 2xl:flex">
      {items.map(i => (
        <a key={i.id} href={"#" + i.id} className="group relative flex items-center justify-end" onClick={() => sfx.soft()}>
          <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-lg border border-white/10 bg-[#081130]/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white opacity-0 transition group-hover:opacity-100">
            {i.n}
          </span>
          <motion.span
            animate={{ height: active === i.id ? 26 : 10, backgroundColor: active === i.id ? "#8ef23c" : "rgba(142,166,216,.35)" }}
            className="block w-2.5 rounded-full"
            style={{ boxShadow: active === i.id ? "0 0 12px rgba(142,242,60,.7)" : "none" }}
          />
        </a>
      ))}
    </div>
  );
}

/* =============== BACK TO TOP with progress ring =============== */
export function BackToTop() {
  const { scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);
  const dash = useTransform(scrollYProgress, [0, 1], [132, 0]);
  useEffect(() => scrollYProgress.on("change", v => setShow(v > 0.06)), [scrollYProgress]);
  return (
    <motion.button
      initial={false}
      animate={{ scale: show ? 1 : 0, opacity: show ? 1 : 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => { sfx.whoosh(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
      className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-[#223d7d] to-[#101f47] text-white"
      style={{ boxShadow: "0 5px 0 #030816, 0 12px 30px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.2)" }}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="21" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
        <motion.circle cx="28" cy="28" r="21" fill="none" stroke="#8ef23c" strokeWidth="3" strokeLinecap="round" strokeDasharray="132" style={{ strokeDashoffset: dash }} />
      </svg>
      <ArrowUp size={20} strokeWidth={2.8} />
    </motion.button>
  );
}

/* =============== PARTICLE FIELD (canvas, mouse repel) =============== */
export function ParticleField({ className, count = 70, color = "142,242,60", link = true }: { className?: string; count?: number; color?: string; link?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    let w = 0, h = 0, raf = 0;
    const mouse = { x: -999, y: -999 };
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pts = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0006, vy: (Math.random() - 0.5) * 0.0006, r: Math.random() * 1.8 + 0.6, sx: 0, sy: 0 }));
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    const mv = (e: PointerEvent) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    const lv = () => { mouse.x = -999; mouse.y = -999; };
    c.addEventListener("pointermove", mv);
    c.addEventListener("pointerleave", lv);
    const loop = () => {
      g.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        let px = p.x * w, py = p.y * h;
        const dx = px - mouse.x, dy = py - mouse.y, d = Math.hypot(dx, dy);
        if (d < 110) { const f = (110 - d) / 110; px += (dx / d) * f * 26; py += (dy / d) * f * 26; }
        g.beginPath();
        g.arc(px, py, p.r, 0, Math.PI * 2);
        g.fillStyle = `rgba(${color},.75)`;
        g.fill();
        p.sx = px;
        p.sy = py;
      }
      if (link) {
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.sx - b.sx, a.sy - b.sy);
          if (d < 95) { g.strokeStyle = `rgba(${color},${0.16 * (1 - d / 95)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(a.sx, a.sy); g.lineTo(b.sx, b.sy); g.stroke(); }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); c.removeEventListener("pointermove", mv); c.removeEventListener("pointerleave", lv); };
  }, [count, color, link]);
  return <canvas ref={ref} className={cn("h-full w-full", className)} />;
}

/* =============== SPOTLIGHT CARD =============== */
export function Spotlight({ children, className, color = "142,242,60" }: { children: ReactNode; className?: string; color?: string }) {
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const bg = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(${color},.16), transparent 70%)`;
  const border = useMotionTemplate`radial-gradient(200px circle at ${mx}px ${my}px, rgba(${color},.8), transparent 70%)`;
  return (
    <div
      className={cn("group relative overflow-hidden rounded-[24px]", className)}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(e.clientX - r.left); my.set(e.clientY - r.top); }}
      onPointerLeave={() => { mx.set(-300); my.set(-300); }}
    >
      <motion.div className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] p-px" style={{ background: border, WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
      <motion.div className="pointer-events-none absolute inset-0 z-0" style={{ background: bg }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* =============== VELOCITY MARQUEE (scroll-speed reactive) =============== */
export function VelocityMarquee({ children, baseVelocity = -3, className }: { children: ReactNode; baseVelocity?: number; className?: string }) {
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const smooth = useSpring(vel, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const skew = useTransform(smooth, [-2000, 2000], [10, -10]);
  const x = useTransform(base, v => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);
  useAnimationFrame((_, delta) => {
    let m = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1; else if (f > 0) dir.current = 1;
    m += dir.current * m * f;
    base.set(base.get() + m);
  });
  return (
    <div className={cn("flex overflow-hidden whitespace-nowrap", className)}>
      <motion.div className="flex flex-nowrap gap-10" style={{ x, skewX: skew }}>
        {[0, 1, 2, 3].map(i => <span key={i} className="flex shrink-0 items-center gap-10">{children}</span>)}
      </motion.div>
    </div>
  );
}

/* =============== PARALLAX wrapper =============== */
export function Parallax({ children, speed = 0.3, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 200, -speed * 200]);
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}

export function useParallax(value: MotionValue<number>, distance: number) {
  return useTransform(value, [0, 1], [-distance, distance]);
}

/* =============== MOUSE PARALLAX LAYER =============== */
export function useMouseParallax(strength = 20) {
  const x = useSpring(0, { stiffness: 80, damping: 18 });
  const y = useSpring(0, { stiffness: 80, damping: 18 });
  const bind = {
    onPointerMove: (e: RPE<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      x.set(((e.clientX - r.left) / r.width - 0.5) * strength);
      y.set(((e.clientY - r.top) / r.height - 0.5) * strength);
    },
    onPointerLeave: () => { x.set(0); y.set(0); },
  };
  return { x, y, bind };
}

/* =============== FLOATING COINS BG =============== */
const COIN_GLYPHS = [
  { g: "₿", c: "#F7931A" }, { g: "Ξ", c: "#627EEA" }, { g: "◎", c: "#14F195" },
  { g: "Ð", c: "#C2A633" }, { g: "⬢", c: "#F0B90B" }, { g: "◈", c: "#0098EA" },
];
export function FloatingCoins({ n = 10 }: { n?: number }) {
  const { scrollYProgress } = useScroll();
  const items = useRef(Array.from({ length: n }, (_, i) => ({
    ...COIN_GLYPHS[i % COIN_GLYPHS.length],
    left: Math.random() * 100, top: Math.random() * 100, size: 22 + Math.random() * 30, depth: 0.3 + Math.random() * 1.4, dur: 5 + Math.random() * 6,
  }))).current;
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((c, i) => <FloatCoin key={i} c={c} p={scrollYProgress} />)}
    </div>
  );
}
function FloatCoin({ c, p }: { c: { g: string; c: string; left: number; top: number; size: number; depth: number; dur: number }; p: MotionValue<number> }) {
  const y = useTransform(p, [0, 1], [0, -900 * c.depth]);
  const rot = useTransform(p, [0, 1], [0, 360 * c.depth]);
  return (
    <motion.div style={{ left: `${c.left}%`, top: `${c.top}%`, y, rotate: rot, opacity: 0.1 + c.depth * 0.08 }} className="absolute">
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: c.dur, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center rounded-full font-black"
        style={{ width: c.size, height: c.size, fontSize: c.size * 0.5, color: c.c, background: `${c.c}18`, border: `1.5px solid ${c.c}55`, filter: `blur(${c.depth < 0.7 ? 1.5 : 0}px)` }}
      >
        {c.g}
      </motion.div>
    </motion.div>
  );
}

/* =============== SHINE / animated gradient border =============== */
export function ShineBorder({ children, className, radius = 24 }: { children: ReactNode; className?: string; radius?: number }) {
  return (
    <div className={cn("relative p-[2px]", className)} style={{ borderRadius: radius }}>
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: radius }}>
        <div className="absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2" style={{ background: "conic-gradient(from 0deg, transparent 0 70%, #8ef23c 80%, #5b8cff 90%, transparent 100%)", animation: "spin-slow 4s linear infinite" }} />
      </div>
      <div className="relative" style={{ borderRadius: radius - 2 }}>{children}</div>
    </div>
  );
}

/* =============== BURST (particles explosion on click) =============== */
export function useBurst() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const fire = (x: number, y: number, color = "#8ef23c") => {
    const id = Date.now() + Math.random();
    setBursts(b => [...b, { id, x, y, color }]);
    setTimeout(() => setBursts(b => b.filter(q => q.id !== id)), 800);
  };
  const node = (
    <>
      {bursts.map(b => (
        <span key={b.id} className="pointer-events-none absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{ background: i % 2 ? b.color : "#ffc531" }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{ x: Math.cos(a) * 46, y: Math.sin(a) * 46, scale: 0, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            );
          })}
        </span>
      ))}
    </>
  );
  return { fire, node };
}

/* =============== FLOATING +XP numbers =============== */
export function useFloaters() {
  const [items, setItems] = useState<{ id: number; x: number; y: number; t: string; c: string }[]>([]);
  const spawn = (x: number, y: number, t: string, c = "#8ef23c") => {
    const id = Date.now() + Math.random();
    setItems(p => [...p, { id, x, y, t, c }]);
    setTimeout(() => setItems(p => p.filter(q => q.id !== id)), 1000);
  };
  const node = (
    <>
      {items.map(f => (
        <motion.span
          key={f.id}
          className="num-mono pointer-events-none absolute z-50 text-sm font-extrabold"
          style={{ left: f.x, top: f.y, color: f.c, textShadow: `0 0 12px ${f.c}` }}
          initial={{ y: 0, opacity: 1, scale: 0.6 }}
          animate={{ y: -60, opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.95, ease: "easeOut" }}
        >
          {f.t}
        </motion.span>
      ))}
    </>
  );
  return { spawn, node };
}
