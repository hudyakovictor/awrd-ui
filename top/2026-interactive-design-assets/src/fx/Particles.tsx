import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface BurstOpts {
  count?: number;
  colors?: string[];
  speed?: number;
  gravity?: number;
  spread?: number;
  angle?: number;
  size?: number;
  life?: number;
  shape?: "rect" | "circle" | "spark" | "star";
  /** additive blending — makes particles glow */
  glow?: boolean;
  /** horizontal jitter of the spawn point (for rains) */
  jitterX?: number;
}
export interface ParticlesHandle {
  burst: (x: number, y: number, o?: BurstOpts) => void;
}
interface P {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string;
  rot: number; vr: number; shape: string; g: number; glow: boolean;
}

function star(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

export const Particles = forwardRef<ParticlesHandle, { className?: string }>(function Particles({ className }, ref) {
  const cv = useRef<HTMLCanvasElement>(null);
  const ps = useRef<P[]>([]);
  const raf = useRef(0);

  const loop = () => {
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ps.current = ps.current.filter((p) => p.life < p.max);
    for (const p of ps.current) {
      p.life++;
      p.vy += p.g;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.rot = p.shape === "spark" ? Math.atan2(p.vy, p.vx) : p.rot + p.vr;
      const t = p.life / p.max;
      ctx.globalAlpha = Math.max(0, 1 - t * t);
      ctx.globalCompositeOperation = p.glow ? "lighter" : "source-over";
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const s = p.shape === "circle" || p.shape === "star" ? p.size * (1 - t * 0.5) : p.size;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "spark") {
        ctx.fillRect(-s * 1.6, -0.9, s * 3.2, 1.8);
      } else if (p.shape === "star") {
        star(ctx, s / 2);
      } else {
        ctx.fillRect(-s / 2, -s / 4, s, s / 2);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    raf.current = ps.current.length ? requestAnimationFrame(loop) : 0;
  };

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
    });
    ro.observe(c);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    burst(x, y, o = {}) {
      const {
        count = 40, colors = ["#f97316", "#ffffff"], speed = 6, gravity = 0.15,
        spread = Math.PI * 2, angle = -Math.PI / 2, size = 6, life = 60, shape = "rect", glow = false, jitterX = 0,
      } = o;
      if (ps.current.length > 700) ps.current.splice(0, ps.current.length - 700);
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const s = speed * (0.4 + Math.random() * 0.8);
        ps.current.push({
          x: x + (Math.random() - 0.5) * jitterX, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0,
          max: life * (0.6 + Math.random() * 0.6), size: size * (0.5 + Math.random()),
          color: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
          shape, g: gravity, glow,
        });
      }
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    },
  }));

  return <canvas ref={cv} aria-hidden className={`pointer-events-none absolute inset-0 z-50 h-full w-full ${className ?? ""}`} />;
});
