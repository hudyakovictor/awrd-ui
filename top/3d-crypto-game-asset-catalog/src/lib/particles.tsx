import { useEffect, useRef } from "react";
import { prefersLessMotion } from "./settings";

/* ——————————————————————————————————————————————
   Lightweight canvas particle engine.
   One full-screen canvas, rAF runs only while particles live.
   API:
     particles.burst(x, y, { kind, count })
     particles.fly(from, to, { kind, count, onArrive })
     particles.flyFrom(el, "coins", "coin", 8)   → targets [data-fly="coins"]
   —————————————————————————————————————————————— */

export type PKind = "coin" | "gem" | "star" | "spark" | "confetti" | "xp" | "heart" | "flame";

type Particle = {
  kind: PKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  life: number;
  max: number;
  color: string;
  gravity: number;
  drag: number;
  // flight mode
  fly?: { sx: number; sy: number; cx: number; cy: number; tx: number; ty: number; t: number; dur: number; delay: number; done?: () => void };
};

const CONFETTI = ["#2BE38B", "#3D9BFF", "#FFC940", "#FF4D6D", "#9A6BFF", "#FF8A3D", "#FFFFFF"];
const list: Particle[] = [];
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let last = 0;
let dpr = 1;

function resize() {
  if (!canvas) return;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
}

function star(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
}

function heart(c: CanvasRenderingContext2D, r: number) {
  c.beginPath();
  c.moveTo(0, r * 0.9);
  c.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45);
  c.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9);
  c.closePath();
}

function draw(p: Particle, alpha: number) {
  const c = ctx!;
  c.save();
  c.globalAlpha = alpha;
  c.translate(p.x, p.y);
  const s = p.size;
  switch (p.kind) {
    case "coin": {
      const sx = Math.max(0.15, Math.abs(Math.cos(p.rot)));
      c.scale(sx, 1);
      c.fillStyle = "#A86400";
      c.beginPath();
      c.arc(0, s * 0.18, s, 0, Math.PI * 2);
      c.fill();
      const g = c.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, "#FFE58A");
      g.addColorStop(1, "#F5A800");
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, s, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(255,241,184,.8)";
      c.lineWidth = s * 0.15;
      c.beginPath();
      c.arc(0, 0, s * 0.65, 0, Math.PI * 2);
      c.stroke();
      break;
    }
    case "gem": {
      c.rotate(p.rot * 0.2);
      const g = c.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, "#8FF5FF");
      g.addColorStop(1, "#2A7BFF");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-s * 0.7, -s * 0.5);
      c.lineTo(s * 0.7, -s * 0.5);
      c.lineTo(s, -s * 0.05);
      c.lineTo(0, s);
      c.lineTo(-s, -s * 0.05);
      c.closePath();
      c.fill();
      c.fillStyle = "rgba(255,255,255,.55)";
      c.fillRect(-s * 0.5, -s * 0.42, s * 0.3, s * 0.2);
      break;
    }
    case "star": {
      c.rotate(p.rot);
      c.fillStyle = p.color;
      c.shadowColor = p.color;
      c.shadowBlur = 10;
      star(c, s);
      c.fill();
      break;
    }
    case "spark": {
      c.globalCompositeOperation = "lighter";
      const len = Math.min(24, Math.hypot(p.vx, p.vy) * 0.04 + 4);
      c.rotate(Math.atan2(p.vy, p.vx));
      c.strokeStyle = p.color;
      c.lineWidth = s;
      c.lineCap = "round";
      c.beginPath();
      c.moveTo(-len, 0);
      c.lineTo(0, 0);
      c.stroke();
      break;
    }
    case "confetti": {
      c.rotate(p.rot);
      c.scale(1, Math.cos(p.rot * 1.7));
      c.fillStyle = p.color;
      c.fillRect(-s / 2, -s / 4, s, s / 2);
      break;
    }
    case "xp": {
      c.globalCompositeOperation = "lighter";
      const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 1.8);
      g.addColorStop(0, "rgba(230,215,255,1)");
      g.addColorStop(0.35, "rgba(154,107,255,.9)");
      g.addColorStop(1, "rgba(154,107,255,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, s * 1.8, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case "heart": {
      c.rotate(Math.sin(p.rot) * 0.3);
      c.fillStyle = "#FF4D6D";
      heart(c, s);
      c.fill();
      c.fillStyle = "rgba(255,255,255,.5)";
      c.beginPath();
      c.ellipse(-s * 0.4, -s * 0.35, s * 0.22, s * 0.14, -0.6, 0, Math.PI * 2);
      c.fill();
      break;
    }
    case "flame": {
      c.globalCompositeOperation = "lighter";
      const g = c.createRadialGradient(0, 0, 0, 0, 0, s);
      g.addColorStop(0, "rgba(255,243,163,1)");
      g.addColorStop(0.5, "rgba(255,138,61,.8)");
      g.addColorStop(1, "rgba(255,90,31,0)");
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, s, 0, Math.PI * 2);
      c.fill();
      break;
    }
  }
  c.restore();
}

function loop(t: number) {
  if (!ctx || !canvas) return;
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i];
    if (p.fly) {
      const f = p.fly;
      if (f.delay > 0) {
        f.delay -= dt;
        draw(p, 1);
        continue;
      }
      f.t += dt / f.dur;
      const k = Math.min(1, f.t);
      const e = k * k * (3 - 2 * k); // smoothstep
      const a = 1 - e;
      p.x = a * a * f.sx + 2 * a * e * f.cx + e * e * f.tx;
      p.y = a * a * f.sy + 2 * a * e * f.cy + e * e * f.ty;
      p.rot += p.vr * dt;
      p.size = p.size * (1 - dt * 0.4);
      draw(p, 1);
      if (k >= 1) {
        f.done?.();
        list.splice(i, 1);
      }
      continue;
    }
    p.life += dt;
    if (p.life >= p.max) {
      list.splice(i, 1);
      continue;
    }
    p.vy += p.gravity * dt;
    p.vx *= 1 - p.drag * dt;
    p.vy *= 1 - p.drag * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.vr * dt;
    const r = p.life / p.max;
    draw(p, r > 0.7 ? 1 - (r - 0.7) / 0.3 : 1);
  }
  if (list.length) raf = requestAnimationFrame(loop);
  else {
    raf = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function kick() {
  if (!raf && canvas) {
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
}

type BurstOpts = { kind?: PKind; count?: number; speed?: number; spread?: number; angle?: number; gravity?: number; size?: number; colors?: string[] };
type Pt = { x: number; y: number };

export function center(el: Element | null): Pt {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export const particles = {
  burst(x: number, y: number, o: BurstOpts = {}) {
    if (prefersLessMotion()) return;
    const kind = o.kind ?? "confetti";
    const n = o.count ?? 30;
    const speed = o.speed ?? 520;
    const spread = o.spread ?? Math.PI * 2;
    const base = o.angle ?? -Math.PI / 2;
    const colors = o.colors ?? CONFETTI;
    for (let i = 0; i < n; i++) {
      const a = base + (Math.random() - 0.5) * spread;
      const v = speed * (0.35 + Math.random() * 0.65);
      list.push({
        kind,
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        size: (o.size ?? (kind === "confetti" ? 10 : kind === "spark" ? 2.5 : 8)) * (0.7 + Math.random() * 0.6),
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 16,
        life: 0,
        max: 0.9 + Math.random() * 0.8,
        color: colors[i % colors.length],
        gravity: o.gravity ?? (kind === "spark" ? 300 : kind === "flame" ? -220 : 900),
        drag: kind === "confetti" ? 1.6 : 1.1,
      });
    }
    kick();
  },
  burstAt(el: Element | null, o: BurstOpts = {}) {
    const c = center(el);
    particles.burst(c.x, c.y, o);
  },
  fly(from: Pt, to: Pt, o: { kind?: PKind; count?: number; onArrive?: () => void; onEach?: () => void } = {}) {
    const n = o.count ?? 8;
    if (prefersLessMotion()) {
      o.onArrive?.();
      return;
    }
    let arrived = 0;
    for (let i = 0; i < n; i++) {
      const sx = from.x + (Math.random() - 0.5) * 40;
      const sy = from.y + (Math.random() - 0.5) * 40;
      const mx = (sx + to.x) / 2 + (Math.random() - 0.5) * 220;
      const my = Math.min(sy, to.y) - 80 - Math.random() * 120;
      list.push({
        kind: o.kind ?? "coin",
        x: sx,
        y: sy,
        vx: 0,
        vy: 0,
        size: 10 + Math.random() * 3,
        rot: Math.random() * 6,
        vr: 10 + Math.random() * 8,
        life: 0,
        max: 99,
        color: "#FFC940",
        gravity: 0,
        drag: 0,
        fly: {
          sx,
          sy,
          cx: mx,
          cy: my,
          tx: to.x,
          ty: to.y,
          t: 0,
          dur: 0.6 + Math.random() * 0.25,
          delay: i * 0.05,
          done: () => {
            arrived++;
            o.onEach?.();
            if (arrived === n) o.onArrive?.();
          },
        },
      });
    }
    kick();
  },
  flyFrom(el: Element | null, target: string, kind: PKind = "coin", count = 8, onArrive?: () => void, onEach?: () => void) {
    const t = document.querySelector(`[data-fly="${target}"]`);
    particles.fly(center(el), center(t), { kind, count, onArrive, onEach });
  },
  clear() {
    list.length = 0;
  },
};

/** Mount once near the app root. */
export function ParticleLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    canvas = ref.current;
    ctx = canvas?.getContext("2d") ?? null;
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
      raf = 0;
      canvas = null;
      ctx = null;
    };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[70]" aria-hidden />;
}
