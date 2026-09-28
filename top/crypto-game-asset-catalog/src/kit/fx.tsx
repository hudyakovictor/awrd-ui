import { useEffect, useRef, useState, type ReactNode } from "react";
import { clamp, useInView } from "./motion";

/* ============================================================================
   CursorFX — custom cursor: a solid dot + a lagging ring that snaps and grows
   over interactive elements. Hidden for coarse pointers (touch devices).
   ========================================================================== */
export function CursorFX() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState(false);
  const [down, setDown] = useState(false);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      if (dot.current) dot.current.style.transform = `translate(${tx}px, ${ty}px)`;
      const t = e.target as HTMLElement | null;
      setHot(Boolean(t?.closest("a,button,[role=button],input[type=range],svg[data-drag]")));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);
    const loop = () => {
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      if (ring.current) ring.current.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("pointerdown", dn); window.removeEventListener("pointerup", up); };
  }, []);
  if (!enabled) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[97]" aria-hidden>
      <div ref={ring} className="absolute -ml-[14px] -mt-[14px]" style={{ mixBlendMode: down ? "normal" : "difference" }}>
        <div
          className="rounded-full border-2 border-white transition-all duration-300"
          style={{ width: hot ? 46 : 28, height: hot ? 46 : 28, margin: hot ? "-9px" : 0, opacity: down ? 0.5 : 1 }}
        />
      </div>
      <div ref={dot} className="absolute -ml-1 -mt-1">
        <div className="h-2 w-2 rounded-full bg-white" style={{ transform: down ? "scale(2.2)" : "none", transition: "transform .15s" }} />
      </div>
    </div>
  );
}

/* ============================================================================
   Scramble — decode / glitch text reveal: letters churn through glyphs then lock.
   ========================================================================== */
const GLYPHS = "01#$%&@ЖДЛЦЩЭА₽▲▼◆";
export function Scramble({ text, className, delay = 0, on = true, speed = 26 }: { text: string; className?: string; delay?: number; on?: boolean; speed?: number }) {
  const [out, setOut] = useState(on ? "" : text);
  useEffect(() => {
    if (!on) { setOut(text); return; }
    let frame = 0;
    let timer = 0;
    const start = performance.now() + delay;
    const total = text.length;
    const tick = (t: number) => {
      if (t < start) { timer = window.setTimeout(() => requestAnimationFrame(tick), 40); return; }
      frame++;
      const resolved = Math.floor(frame / 3);
      if (resolved >= total) { setOut(text); return; }
      let s = text.slice(0, resolved);
      for (let i = resolved; i < text.length; i++) s += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setOut(s);
      timer = window.setTimeout(() => requestAnimationFrame(tick), speed);
    };
    timer = window.setTimeout(() => requestAnimationFrame(tick), 40);
    return () => clearTimeout(timer);
  }, [text, delay, on, speed]);
  return <span className={className}>{out || "\u00a0"}</span>;
}

/** Scrambles once when it enters the viewport. */
export function ScrambleOnView({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  return <span ref={ref} className={className}><Scramble text={text} on={seen} delay={delay} /></span>;
}

/* ============================================================================
   Reveal — clip-path wipe + lift when the block enters the viewport.
   ========================================================================== */
export function Reveal({ children, className, delay = 0, dir = "up", ms = 750 }: { children: ReactNode; className?: string; delay?: number; dir?: "up" | "left" | "right" | "wipe"; ms?: number }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  const from: Record<string, string> = {
    up: "inset(0 0 100% 0) translateY(40px)",
    down: "inset(100% 0 0 0) translateY(-40px)",
    left: "inset(0 100% 0 0) translateX(-40px)",
    right: "inset(0 0 0 100%) translateX(40px)",
    wipe: "inset(0 100% 0 0)",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        clipPath: seen ? "inset(0 0 0 0) translate(0,0)" : from[dir === "up" ? "up" : dir],
        opacity: seen ? 1 : 0.001,
        transition: `clip-path ${ms}ms cubic-bezier(.2,1,.3,1), opacity ${ms}ms ease, transform ${ms}ms cubic-bezier(.2,1,.3,1)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================================
   Odometer — rolling digit columns, used for level, score, price.
   ========================================================================== */
function Digit({ d, h = 34, cls }: { d: string; h?: number; cls?: string }) {
  const isNum = /[0-9]/.test(d);
  if (!isNum) return <span className={cls} style={{ lineHeight: `${h}px` }}>{d}</span>;
  const n = Number(d);
  return (
    <span className="relative inline-block overflow-hidden align-top" style={{ height: h, width: "0.62em" }}>
      <span className="absolute inset-x-0 left-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(.3,1.4,.5,1)]" style={{ transform: `translateY(${-n * h}px)` }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <span key={i} className={cls} style={{ display: "block", height: h, lineHeight: `${h}px`, textAlign: "center" }}>{i}</span>
        ))}
      </span>
    </span>
  );
}
export function Odometer({ value, h = 34, className, cls }: { value: string | number; h?: number; className?: string; cls?: string }) {
  const chars = String(value).split("");
  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "flex-start" }}>
      {chars.map((c, i) => <Digit key={`${i}-${chars.length}`} d={c} h={h} cls={cls} />)}
    </span>
  );
}

/* ============================================================================
   useRaf — rAF loop hook shared by the canvas backgrounds.
   ========================================================================== */
export function useRaf(cb: (t: number) => void, active = true) {
  const saved = useRef(cb);
  saved.current = cb;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = (t: number) => { saved.current(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/* ============================================================================
   GlowField — canvas backdrop: candlestick particles drifting upward with
   parallax to the pointer. Behind the hero, never in front of content.
   ========================================================================== */
export function GlowField({ className, density = 46 }: { className?: string; density?: number }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const [on, setOn] = useState(true);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setOn(false); return; }
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.max(1, r.width * dpr);
      c.height = Math.max(1, r.height * dpr);
    };
    resize();
    window.addEventListener("resize", resize);
    type P = { x: number; y: number; s: number; sp: number; up: boolean; d: number; o: number };
    const ps: P[] = [...Array(density)].map(() => ({
      x: Math.random(), y: Math.random(), s: 0.35 + Math.random() * 1.4,
      sp: 0.00018 + Math.random() * 0.0006, up: Math.random() > 0.35,
      d: 0.25 + Math.random() * 0.75, o: 0.12 + Math.random() * 0.4,
    }));
    const move = (e: PointerEvent) => { mouse.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }; };
    window.addEventListener("pointermove", move, { passive: true });
    const draw = () => {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      const mx = (mouse.current.x - 0.5) * 60 * dpr, my = (mouse.current.y - 0.5) * 40 * dpr;
      for (const p of ps) {
        p.y += p.up ? -p.sp : p.sp;
        p.x += p.up ? p.sp * 0.35 : -p.sp * 0.35;
        if (p.y < -0.1) { p.y = 1.1; p.x = Math.random(); }
        if (p.y > 1.1) { p.y = -0.1; p.x = Math.random(); }
        if (p.x < -0.1) p.x = 1.1;
        if (p.x > 1.1) p.x = -0.1;
        const px = p.x * W + mx * p.d, py = p.y * H + my * p.d;
        const w = p.s * 7 * dpr, h = p.s * 30 * dpr;
        const col = p.up ? "34,211,154" : "255,79,109";
        ctx.globalAlpha = p.o * p.d;
        ctx.strokeStyle = `rgba(${col},.8)`;
        ctx.lineWidth = Math.max(1, dpr);
        ctx.beginPath(); ctx.moveTo(px, py - h / 2 - h * 0.35); ctx.lineTo(px, py + h / 2 + h * 0.35); ctx.stroke();
        const grad = ctx.createLinearGradient(0, py - h / 2, 0, py + h / 2);
        grad.addColorStop(0, `rgba(${col},.55)`);
        grad.addColorStop(1, `rgba(${col},.95)`);
        ctx.fillStyle = grad;
        ctx.fillRect(px - w / 2, py - h / 2, w, h);
        ctx.fillStyle = `rgba(${col},.9)`;
        ctx.fillRect(px - w * 0.22, py - h / 2 + h * 0.12, w * 0.22, h * 0.5);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", move); };
  }, [density]);
  return <canvas ref={cv} className={className} style={{ opacity: on ? 1 : 0 }} aria-hidden />;
}

/* ============================================================================
   MagButton — magnetic wrapper: children lean toward the pointer.
   ========================================================================== */
export function Mag({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const [o, setO] = useState({ x: 0, y: 0 });
  return (
    <div
      className={className}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength }); }}
      onPointerLeave={() => setO({ x: 0, y: 0 })}
      style={{ transform: `translate(${o.x}px,${o.y}px)`, transition: "transform .35s cubic-bezier(.3,1.6,.5,1)" }}
    >
      {children}
    </div>
  );
}

/* ============================================================================
   Flip — flips content on click (front/back), 3D, with tilt on hover.
   ========================================================================== */
export function Flip({ front, back, ratio = "4/5", auto = false }: { front: ReactNode; back: ReactNode; ratio?: string; auto?: boolean }) {
  const [f, setF] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <div
      className="grid w-full place-items-center [perspective:900px]"
      style={{ aspectRatio: ratio }}
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientY - r.top) / r.height - 0.5) * -14, y: ((e.clientX - r.left) / r.width - 0.5) * 14 }); }}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={() => { setF((v) => !v); }}
    >
      <div className="relative h-full w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d]" style={{ transform: `rotateX(${tilt.x + (f ? 180 : 0)}deg) rotateY(${tilt.y}deg) scale(${auto ? 1 : 0.99})` }}>
        <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
      </div>
    </div>
  );
}

export const clampPct = (v: number) => clamp(v, 0, 100);
