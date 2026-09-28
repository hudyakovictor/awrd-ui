import { useCallback, useEffect, useRef } from "react";
import { rand } from "../motion/tokens";

// ============================================================
//  PARTICLE ENGINE — additive canvas, gravity, drag, homing.
//  Секрет: "lighter" композиция = бесплатный bloom.
// ============================================================

type Shape = "spark" | "dot" | "confetti" | "star" | "coin";

interface P {
  x: number; y: number; vx: number; vy: number;
  life: number; age: number; size: number; color: string;
  g: number; drag: number; shape: Shape; rot: number; vr: number;
  tx?: number; ty?: number; delay: number; onArrive?: () => void; arrived?: boolean;
}
interface Ring { x: number; y: number; r: number; max: number; life: number; age: number; color: string; w: number }

export interface BurstOpts {
  x: number; y: number;
  count?: number;
  colors?: string[];
  speed?: [number, number];
  size?: [number, number];
  life?: [number, number];
  gravity?: number;
  drag?: number;
  shape?: Shape;
  angle?: number; // центр направления (рад)
  spread?: number; // ширина конуса (рад)
  target?: { x: number; y: number };
  onArrive?: () => void;
  stagger?: number; // сек между частицами
}

export function useParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  const parts = useRef<P[]>([]);
  const rings = useRef<Ring[]>([]);

  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let w = 0, h = 0, raf = 0, last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ro = new ResizeObserver(() => {
      const r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(cv);

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (parts.current.length || rings.current.length) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        // shock rings
        rings.current = rings.current.filter((g) => {
          g.age += dt;
          const t = g.age / g.life;
          if (t >= 1) return false;
          const e = 1 - Math.pow(1 - t, 3);
          ctx.strokeStyle = g.color;
          ctx.globalAlpha = (1 - t) * 0.9;
          ctx.lineWidth = g.w * (1 - t) + 0.5;
          ctx.beginPath();
          ctx.arc(g.x, g.y, g.r + (g.max - g.r) * e, 0, Math.PI * 2);
          ctx.stroke();
          return true;
        });
        parts.current = parts.current.filter((p) => {
          if (p.delay > 0) { p.delay -= dt; return true; }
          p.age += dt;
          const t = p.age / p.life;
          if (p.tx !== undefined && p.ty !== undefined) {
            // HOMING: сначала разлёт, потом магнит к цели
            if (p.age > 0.28) {
              const dx = p.tx - p.x, dy = p.ty - p.y;
              const d = Math.hypot(dx, dy);
              const k = Math.min(1, (p.age - 0.28) * 2.2);
              p.vx += (dx / d) * 2600 * k * dt;
              p.vy += (dy / d) * 2600 * k * dt;
              p.vx *= 1 - 5 * dt * k;
              p.vy *= 1 - 5 * dt * k;
              if (d < 14) {
                if (!p.arrived) { p.arrived = true; p.onArrive?.(); }
                return false;
              }
            }
          } else if (t >= 1) return false;
          p.vy += p.g * dt;
          p.vx *= 1 - p.drag * dt;
          p.vy *= 1 - p.drag * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          const a = p.tx !== undefined ? 1 : Math.max(0, 1 - t * t);
          ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          ctx.strokeStyle = p.color;
          if (p.shape === "spark") {
            const sp = Math.hypot(p.vx, p.vy);
            const len = Math.min(26, sp * 0.035) + p.size;
            ctx.lineWidth = p.size * (1 - t * 0.6);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - (p.vx / (sp || 1)) * len, p.y - (p.vy / (sp || 1)) * len);
            ctx.stroke();
          } else if (p.shape === "confetti") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.cos(p.rot * 1.7));
            ctx.globalCompositeOperation = "source-over";
            ctx.fillRect(-p.size, -p.size * 0.45, p.size * 2, p.size * 0.9);
            ctx.restore();
            ctx.globalCompositeOperation = "lighter";
          } else if (p.shape === "star") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            const s = p.size * (1 - t * 0.5);
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
              ctx.rotate(Math.PI / 2);
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(s * 0.15, s * 0.15, 0, s * 1.6);
              ctx.quadraticCurveTo(-s * 0.15, s * 0.15, 0, 0);
            }
            ctx.fill();
            ctx.restore();
          } else if (p.shape === "coin") {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.scale(Math.abs(Math.cos(p.rot)) * 0.8 + 0.2, 1);
            ctx.globalCompositeOperation = "source-over";
            const gr = ctx.createRadialGradient(-2, -2, 1, 0, 0, p.size);
            gr.addColorStop(0, "#fff4c2");
            gr.addColorStop(0.5, "#ffc34d");
            gr.addColorStop(1, "#b9761a");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.globalCompositeOperation = "lighter";
          } else {
            const s = p.size * (1 - t * 0.7);
            const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 2.4);
            gr.addColorStop(0, p.color);
            gr.addColorStop(1, "transparent");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(p.x, p.y, s * 2.4, 0, Math.PI * 2);
            ctx.fill();
          }
          return true;
        });
        ctx.globalAlpha = 1;
      } else {
        ctx.clearRect(0, 0, w, h);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const burst = useCallback((o: BurstOpts) => {
    const n = o.count ?? 24;
    const cols = o.colors ?? ["#2ee6c5", "#ffffff"];
    const ang = o.angle ?? -Math.PI / 2;
    const spr = o.spread ?? Math.PI * 2;
    let first = true;
    for (let i = 0; i < n; i++) {
      const a = ang + (Math.random() - 0.5) * spr;
      const s = rand(...(o.speed ?? [120, 420]));
      const cb = o.onArrive && first ? o.onArrive : o.onArrive;
      first = false;
      parts.current.push({
        x: o.x, y: o.y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: rand(...(o.life ?? [0.5, 1.1])), age: 0,
        size: rand(...(o.size ?? [1.5, 3.5])),
        color: cols[(Math.random() * cols.length) | 0],
        g: o.gravity ?? 0, drag: o.drag ?? 2.2,
        shape: o.shape ?? "spark",
        rot: Math.random() * 6, vr: rand(-10, 10),
        tx: o.target?.x, ty: o.target?.y,
        delay: (o.stagger ?? 0) * i,
        onArrive: cb,
      });
    }
  }, []);

  const ring = useCallback((x: number, y: number, color = "#2ee6c5", max = 120, life = 0.6, w = 6) => {
    rings.current.push({ x, y, r: 4, max, life, age: 0, color, w });
  }, []);

  return { ref, burst, ring };
}

export function ParticleCanvas({ canvasRef, className = "" }: { canvasRef: React.RefObject<HTMLCanvasElement | null>; className?: string }) {
  return <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ zIndex: 40 }} />;
}

/** Координата центра элемента относительно контейнера */
export function centerIn(el: Element | null, root: Element | null) {
  if (!el || !root) return { x: 0, y: 0 };
  const a = el.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
}
