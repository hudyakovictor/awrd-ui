import { useEffect, useRef } from "react";

/* ============ PARTICLE ENGINE (canvas, module-level) ============ */
type PKind = "confetti" | "spark" | "coin" | "ring" | "star" | "text";
type P = {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string;
  kind: PKind; rot: number; vr: number; grav: number; drag: number; text?: string;
};
const parts: P[] = [];
const PAL = {
  confetti: ["#1fdb8b", "#3d7bff", "#ffc53d", "#ff4d6a", "#8d5cff", "#2ed3f0"],
  spark: ["#8fb3ff", "#2ed3f0", "#1fdb8b", "#c9d5f5"],
  coin: ["#ffd24a", "#ffb520"],
  star: ["#ffe27a", "#ffc53d", "#fff3c4"],
};
const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function push(p: Partial<P> & { x: number; y: number; kind: PKind }) {
  if (reduceMotion) return;
  parts.push({ vx: 0, vy: 0, life: 0, max: 1, size: 6, color: "#fff", rot: Math.random() * 6.3, vr: 0, grav: 0, drag: 1, ...p } as P);
  if (parts.length > 900) parts.splice(0, parts.length - 900);
}

export function burstConfetti(x: number, y: number, n = 40, spread = 1) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = (2 + Math.random() * 7) * spread;
    push({
      x, y, kind: "confetti",
      vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4 * spread,
      size: 5 + Math.random() * 6, color: PAL.confetti[(Math.random() * PAL.confetti.length) | 0],
      vr: (Math.random() - 0.5) * 16, grav: 11, drag: 0.985, max: 0.9 + Math.random() * 0.8,
    });
  }
}
export function burstSparks(x: number, y: number, n = 18, color?: string) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 1.5 + Math.random() * 5;
    push({
      x, y, kind: "spark", vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      size: 1.5 + Math.random() * 2.5, color: color || PAL.spark[(Math.random() * PAL.spark.length) | 0],
      grav: 2, drag: 0.94, max: 0.4 + Math.random() * 0.5,
    });
  }
}
export function burstCoins(x: number, y: number, n = 14) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8, v = 5 + Math.random() * 6;
    push({
      x, y, kind: "coin", vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      size: 7 + Math.random() * 6, color: PAL.coin[i % 2], vr: (Math.random() - 0.5) * 12, grav: 13, drag: 0.99, max: 1.1 + Math.random() * 0.5,
    });
  }
}
export function burstRing(x: number, y: number, color = "#3d7bff", size = 90) {
  push({ x, y, kind: "ring", size, color, max: 0.55 });
}
export function burstStars(x: number, y: number, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5, v = 2 + Math.random() * 4;
    push({
      x, y, kind: "star", vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2,
      size: 7 + Math.random() * 8, color: PAL.star[i % 3], vr: (Math.random() - 0.5) * 6, grav: 5, drag: 0.97, max: 0.8 + Math.random() * 0.5,
    });
  }
}
export function burstText(x: number, y: number, text: string, color = "#ffc53d") {
  push({ x, y, kind: "text", text, color, vy: -1.6, size: 15, max: 1.1, drag: 1 });
}
/** Burst centered on a DOM element */
export function burstAtEl(el: Element | null, kind: "confetti" | "sparks" | "coins" | "ring" | "stars" | "text", payload?: number | string) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (kind === "confetti") burstConfetti(x, y, payload as number ?? 36);
  else if (kind === "sparks") burstSparks(x, y, payload as number ?? 16);
  else if (kind === "coins") burstCoins(x, y, payload as number ?? 12);
  else if (kind === "ring") burstRing(x, y, payload as string);
  else if (kind === "stars") burstStars(x, y, payload as number ?? 8);
  else if (kind === "text") burstText(x, y, String(payload));
}
/** Full-screen celebration: multi-wave confetti + coins + rings from top corners */
export function celebrate() {
  const w = window.innerWidth, h = window.innerHeight;
  burstConfetti(w * 0.15, h * 0.3, 46, 1.15);
  burstConfetti(w * 0.85, h * 0.3, 46, 1.15);
  burstCoins(w * 0.5, h * 0.2, 16);
  burstRing(w * 0.5, h * 0.45, "#ffc53d", 220);
  burstStars(w * 0.5, h * 0.4, 12);
  setTimeout(() => { burstConfetti(w * 0.5, h * 0.25, 60, 1.3); burstCoins(w * 0.3, h * 0.3, 10); burstCoins(w * 0.7, h * 0.3, 10); }, 260);
  setTimeout(() => { burstRing(w * 0.5, h * 0.45, "#1fdb8b", 320); burstStars(w * 0.5, h * 0.5, 10); }, 480);
}

/* ============ SCREEN SHAKE & HIT FLASH ============ */
let shakeT = 0;
export function shake(intensity: "soft" | "hard" = "soft") {
  if (reduceMotion) return;
  const el = document.getElementById("shell");
  if (!el) return;
  el.classList.remove("fx-shake", "fx-shake-hard");
  void el.offsetWidth;
  el.classList.add(intensity === "hard" ? "fx-shake-hard" : "fx-shake");
  clearTimeout(shakeT);
  shakeT = window.setTimeout(() => el.classList.remove("fx-shake", "fx-shake-hard"), intensity === "hard" ? 620 : 420);
}
export function flash(color = "rgba(255,77,106,.28)") {
  const el = document.getElementById("fx-flash");
  if (!el) return;
  el.style.background = color;
  el.animate([{ opacity: 0.95 }, { opacity: 0 }], { duration: 380, easing: "ease-out" });
}
export const fx = { burstConfetti, burstSparks, burstCoins, burstRing, burstStars, burstText, burstAtEl, celebrate, shake, flash };

/* ============ FX LAYER (canvas + ambient) ============ */
function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.lineTo(Math.cos(a2) * r * 0.45, Math.sin(a2) * r * 0.45);
  }
  ctx.closePath();
}

export function FxLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0, last = performance.now(), ambientT = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; };
    resize();
    addEventListener("resize", resize);
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, cv.width, cv.height);
      // ambient: faint rising sparks
      ambientT += dt;
      if (ambientT > 1.6 && parts.length < 700) {
        ambientT = 0;
        push({ x: Math.random() * innerWidth, y: innerHeight + 10, kind: "spark", vx: (Math.random() - 0.5) * 0.4, vy: -(0.6 + Math.random() * 0.9), size: 1 + Math.random() * 1.6, color: PAL.spark[(Math.random() * 4) | 0], grav: 0, drag: 1, max: 7 + Math.random() * 5 });
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life += dt;
        if (p.life >= p.max) { parts.splice(i, 1); continue; }
        p.vy += p.grav * dt;
        p.vx *= p.drag; p.vy *= p.drag;
        p.x += p.vx * dt * 60; p.y += p.vy * dt * 60;
        p.rot += p.vr * dt;
        const k = 1 - p.life / p.max;
        ctx.save();
        ctx.globalAlpha = p.kind === "spark" && p.max > 3 ? Math.min(0.5, k) : Math.min(1, k * 1.6);
        ctx.translate(p.x * dpr, p.y * dpr);
        ctx.rotate(p.rot);
        const s = p.size * dpr;
        if (p.kind === "confetti") {
          ctx.fillStyle = p.color;
          ctx.fillRect(-s / 2, -s / 3.2, s, s * 0.62);
        } else if (p.kind === "spark") {
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill();
          if (s > 2.4 * dpr) { ctx.globalAlpha *= 0.35; ctx.beginPath(); ctx.arc(0, 0, s * 2.4, 0, 7); ctx.fill(); }
        } else if (p.kind === "coin") {
          const sq = Math.abs(Math.cos(p.rot * 2)) * 0.75 + 0.25;
          ctx.scale(sq, 1);
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(0, 0, s, 0, 7); ctx.fill();
          ctx.fillStyle = "rgba(120,70,0,.55)";
          ctx.beginPath(); ctx.arc(0, 0, s * 0.66, 0, 7); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,.75)";
          ctx.beginPath(); ctx.arc(-s * 0.32, -s * 0.36, s * 0.22, 0, 7); ctx.fill();
        } else if (p.kind === "ring") {
          const r = s * (p.life / p.max);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 3 * dpr * (1 - p.life / p.max) + 1;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.stroke();
        } else if (p.kind === "star") {
          ctx.fillStyle = p.color;
          drawStar(ctx, s / 2);
          ctx.fill();
        } else if (p.kind === "text") {
          ctx.font = `800 ${s * dpr}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.lineWidth = 4 * dpr;
          ctx.strokeStyle = "rgba(0,0,0,.5)";
          ctx.strokeText(p.text || "", 0, 0);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text || "", 0, 0);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-[195] pointer-events-none" aria-hidden />;
}
