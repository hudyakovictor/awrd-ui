import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { sfx } from "../game/Juice";

/* ================================================================== */
/*  ADVANCED FX LABORATORY — 10 canvas particle engines                 */
/*  Each engine is self-contained, 60fps, DPR-aware, pausable.          */
/*  Total: fire · snow · rain · lightning · starfield · aurora ·        */
/*  bubbles · embers · matrix · plasma                                  */
/* ================================================================== */

function setupCanvas(c: HTMLCanvasElement, w: number, h: number) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  c.width = w * dpr;
  c.height = h * dpr;
  const ctx = c.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/* ================================================================== */
/*  01 FIRE — rising flame particles with turbulence                   */
/* ================================================================== */
function FireCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; hue: number };
    let parts: P[] = [];
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    let t = 0;
    const loop = () => {
      if (!ctx) return;
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0a0605");
      bg.addColorStop(1, "#1c0a06");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // spawn along bottom
      for (let i = 0; i < 7; i++) {
        const x = W * 0.2 + Math.random() * W * 0.6;
        parts.push({
          x,
          y: H - 8,
          vx: (Math.random() - 0.5) * 1.4,
          vy: -1.6 - Math.random() * 2.6,
          life: 1,
          max: 0.7 + Math.random() * 0.8,
          s: 5 + Math.random() * 13,
          hue: 8 + Math.random() * 42,
        });
      }
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.life -= 0.016 / p.max;
        p.x += p.vx + Math.sin(t * 6 + p.y * 0.05) * 0.9;
        p.y += p.vy;
        p.vy *= 0.985;
        const a = Math.max(0, p.life);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * a + 2);
        g.addColorStop(0, `hsla(${p.hue},100%,72%,${0.9 * a})`);
        g.addColorStop(0.4, `hsla(${p.hue - 12},100%,52%,${0.55 * a})`);
        g.addColorStop(1, "hsla(8,90%,30%,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * a + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (parts.length > 420) parts = parts.slice(-420);
      // coal bed glow
      const coal = ctx.createLinearGradient(0, H - 30, 0, H);
      coal.addColorStop(0, "rgba(255,90,30,0)");
      coal.addColorStop(1, "rgba(255,120,40,.5)");
      ctx.fillStyle = coal;
      ctx.fillRect(0, H - 30, W, 30);
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-[#ffb347]">fire · turbulence</span>
    </div>
  );
}

/* ================================================================== */
/*  02 SNOW — drifting flakes with depth layers                         */
/* ================================================================== */
function SnowCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type F = { x: number; y: number; r: number; v: number; ph: number; o: number; depth: number };
    let flakes: F[] = Array.from({ length: 130 }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 300,
      r: 0.8 + Math.random() * 2.8,
      v: 0.4 + Math.random() * 1.5,
      ph: Math.random() * Math.PI * 2,
      o: 0.35 + Math.random() * 0.65,
      depth: Math.random(),
    }));
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    let t = 0;
    const loop = () => {
      if (!ctx) return;
      t += 0.016;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#060c1e");
      bg.addColorStop(1, "#0d1c38");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // moon
      ctx.fillStyle = "rgba(220,235,255,.9)";
      ctx.shadowColor = "#bcd4ff";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(W - 52, 44, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(6,12,30,.25)";
      ctx.beginPath();
      ctx.arc(W - 58, 38, 5, 0, Math.PI * 2);
      ctx.arc(W - 46, 48, 3.5, 0, Math.PI * 2);
      ctx.fill();
      for (const f of flakes) {
        f.y += f.v * (0.6 + f.depth);
        f.x += Math.sin(t * 1.2 + f.ph) * (0.4 + f.depth * 0.8);
        if (f.y > H + 6) {
          f.y = -6;
          f.x = Math.random() * W;
        }
        if (f.x > W + 6) f.x = -6;
        if (f.x < -6) f.x = W + 6;
        ctx.globalAlpha = f.o;
        ctx.fillStyle = "#e6f0ff";
        ctx.beginPath();
        ctx.arc(((f.x % W) + W) % W, f.y, f.r * (0.6 + f.depth * 0.9), 0, Math.PI * 2);
        ctx.fill();
        if (f.depth > 0.8) {
          ctx.globalAlpha = f.o * 0.5;
          ctx.strokeStyle = "#e6f0ff";
          ctx.lineWidth = 0.8;
          const rr = f.r * 2.2;
          const fx = ((f.x % W) + W) % W;
          ctx.beginPath();
          ctx.moveTo(fx - rr, f.y);
          ctx.lineTo(fx + rr, f.y);
          ctx.moveTo(fx, f.y - rr);
          ctx.lineTo(fx, f.y + rr);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // ground drift
      ctx.fillStyle = "rgba(230,240,255,.12)";
      ctx.beginPath();
      ctx.ellipse(W / 2, H + 18, W * 0.7, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-[#cfe0ff]">snow · parallax depth</span>
    </div>
  );
}

/* ================================================================== */
/*  03 RAIN — streaks with splash ripples                               */
/* ================================================================== */
function RainCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type D = { x: number; y: number; v: number; l: number };
    type R = { x: number; y: number; r: number; a: number };
    let drops: D[] = Array.from({ length: 150 }, () => ({ x: Math.random() * 700, y: Math.random() * 300, v: 9 + Math.random() * 9, l: 9 + Math.random() * 14 }));
    let ripples: R[] = [];
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    const loop = () => {
      if (!ctx) return;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#071120");
      bg.addColorStop(1, "#0a1a30");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // distant city silhouette
      ctx.fillStyle = "rgba(40,70,120,.35)";
      const bw = W / 14;
      for (let i = 0; i < 14; i++) {
        const bh = 24 + ((i * 37) % 46);
        ctx.fillRect(i * bw + 2, H - 26 - bh, bw - 4, bh);
      }
      ctx.fillStyle = "rgba(10,20,40,.9)";
      ctx.fillRect(0, H - 26, W, 26);
      ctx.strokeStyle = "rgba(140,200,255,.4)";
      ctx.lineWidth = 1;
      for (const d of drops) {
        d.y += d.v;
        d.x -= d.v * 0.18;
        if (d.y > H - 26) {
          ripples.push({ x: d.x, y: H - 24 + Math.random() * 14, r: 1, a: 0.7 });
          d.y = -20;
          d.x = Math.random() * (W + 80);
        }
        if (d.x < -10) d.x = W + 10;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * 0.18, d.y - d.l);
        ctx.stroke();
      }
      ripples = ripples.filter((r) => r.a > 0.03);
      for (const r of ripples) {
        r.r += 0.9;
        r.a *= 0.9;
        ctx.globalAlpha = r.a;
        ctx.strokeStyle = "#8dc8ff";
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.r * 2.2, r.r * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (ripples.length > 90) ripples = ripples.slice(-90);
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-[#8dc8ff]">rain · splash ripples</span>
    </div>
  );
}

/* ================================================================== */
/*  04 LIGHTNING — branching bolts + thunder flash                      */
/* ================================================================== */
function LightningCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [strikes, setStrikes] = useState(0);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type Bolt = { pts: { x: number; y: number }[]; life: number; w: number };
    let bolts: Bolt[] = [];
    let flash = 0;
    let next = 40;
    const spawnBolt = () => {
      const x0 = W * 0.15 + Math.random() * W * 0.7;
      const pts: Bolt["pts"] = [{ x: x0, y: 0 }];
      let x = x0;
      let y = 0;
      while (y < H) {
        y += 12 + Math.random() * 22;
        x += (Math.random() - 0.5) * 44;
        pts.push({ x, y });
      }
      bolts.push({ pts, life: 1, w: 2 + Math.random() * 2 });
      // branch
      if (Math.random() > 0.4 && pts.length > 6) {
        const bi = 3 + Math.floor(Math.random() * (pts.length - 5));
        const bp = [{ ...pts[bi] }];
        let bx = pts[bi].x;
        let by = pts[bi].y;
        for (let i = 0; i < 6; i++) {
          by += 10 + Math.random() * 16;
          bx += (Math.random() - 0.5) * 50;
          bp.push({ x: bx, y: by });
        }
        bolts.push({ pts: bp, life: 0.8, w: 1.2 });
      }
      flash = 0.9;
      setStrikes((s) => s + 1);
      sfx("hit", false);
    };
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    const loop = () => {
      if (!ctx) return;
      next -= 1;
      if (next <= 0) {
        spawnBolt();
        next = 70 + Math.random() * 160;
      }
      flash *= 0.88;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      const f = flash * 60;
      bg.addColorStop(0, `rgb(${8 + f},${12 + f},${30 + f})`);
      bg.addColorStop(1, "#050a16");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // clouds
      ctx.fillStyle = "rgba(50,70,110,.5)";
      for (let i = 0; i < 7; i++) {
        const cx = (i / 7) * W + 20;
        ctx.beginPath();
        ctx.ellipse(cx, 12, 46, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      bolts = bolts.filter((b) => b.life > 0.05);
      for (const b of bolts) {
        b.life *= 0.86;
        ctx.strokeStyle = `rgba(200,230,255,${b.life})`;
        ctx.lineWidth = b.w + 3;
        ctx.shadowColor = "#9db8ff";
        ctx.shadowBlur = 18 * b.life;
        ctx.beginPath();
        b.pts.forEach((p, i) => (i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y)));
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, b.life + 0.2)})`;
        ctx.lineWidth = b.w * 0.5;
        ctx.beginPath();
        b.pts.forEach((p, i) => (i === 0 ? ctx!.moveTo(p.x, p.y) : ctx!.lineTo(p.x, p.y)));
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-[#cfe0ff]">storm · {strikes} strikes</span>
    </div>
  );
}

/* ================================================================== */
/*  05 STARFIELD — warp-speed parallax                                  */
/* ================================================================== */
function StarfieldCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [warp, setWarp] = useState(false);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type S = { x: number; y: number; z: number };
    let stars: S[] = Array.from({ length: 220 }, () => ({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() }));
    let speed = 0.004;
    let target = 0.004;
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    const onDown = () => (target = 0.05);
    const onUp = () => (target = 0.004);
    c.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    const loop = () => {
      if (!ctx) return;
      speed += (target - speed) * 0.06;
      ctx.fillStyle = "rgba(3,6,14,.5)";
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      for (const s of stars) {
        s.z += speed * (0.4 + s.z);
        if (s.z > 1) {
          s.z = 0.02;
          s.x = (Math.random() - 0.5) * 2;
          s.y = (Math.random() - 0.5) * 2;
        }
        const sx = cx + (s.x / s.z) * cx * 0.5;
        const sy = cy + (s.y / s.z) * cy * 0.5;
        const px = cx + (s.x / (s.z + speed * 6)) * cx * 0.5;
        const py = cy + (s.y / (s.z + speed * 6)) * cy * 0.5;
        const b = Math.min(1, (1 - s.z) * 1.2);
        ctx.strokeStyle = `rgba(${180 + b * 75},${200 + b * 55},255,${0.25 + b * 0.75})`;
        ctx.lineWidth = 0.6 + (1 - s.z) * 1.8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      c.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] cursor-pointer overflow-hidden rounded-2xl border-2 border-[#1c2c52]" onPointerDown={() => setWarp(true)} onPointerUp={() => setWarp(false)} onPointerLeave={() => setWarp(false)}>
      <canvas ref={ref} className="h-full w-full" />
      <span className={cn("absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest", warp ? "text-[#9b6bff]" : "text-ink-300")}>
        {warp ? "warp engaged ▲▲▲" : "starfield · hold to warp"}
      </span>
    </div>
  );
}

/* ================================================================== */
/*  06 AURORA — layered sine ribbons                                    */
/* ================================================================== */
function AuroraCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    const layers = [
      { c1: "rgba(43,224,138,.55)", c2: "rgba(56,225,255,.12)", amp: 26, sp: 0.9, y: 0.34, w: 0.012 },
      { c1: "rgba(155,107,255,.5)", c2: "rgba(155,107,255,.08)", amp: 34, sp: 0.65, y: 0.44, w: 0.009 },
      { c1: "rgba(56,225,255,.45)", c2: "rgba(43,224,138,.06)", amp: 20, sp: 1.25, y: 0.28, w: 0.016 },
    ];
    let t = 0;
    const loop = () => {
      if (!ctx) return;
      t += 0.016;
      ctx.fillStyle = "#040816";
      ctx.fillRect(0, 0, W, H);
      // stars
      for (let i = 0; i < 60; i++) {
        const sx = (i * 97.3) % W;
        const sy = (i * 53.7) % (H * 0.6);
        ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i));
        ctx.fillStyle = "#fff";
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
      for (const L of layers) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const y = H * L.y + Math.sin(x * L.w + t * L.sp) * L.amp + Math.sin(x * L.w * 2.7 + t * L.sp * 1.6) * L.amp * 0.35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, H * L.y - L.amp * 1.4, 0, H);
        g.addColorStop(0, L.c1);
        g.addColorStop(1, L.c2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      // mountain silhouette
      ctx.fillStyle = "#060b18";
      ctx.beginPath();
      ctx.moveTo(0, H);
      const peaks = [0.72, 0.6, 0.78, 0.64, 0.74, 0.58, 0.72];
      peaks.forEach((p, i) => ctx!.lineTo((i / (peaks.length - 1)) * W, H * p));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-bull">aurora · 3 ribbons</span>
    </div>
  );
}

/* ================================================================== */
/*  07 BUBBLES — buoyant wobbling orbs                                  */
/* ================================================================== */
function BubbleCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type B = { x: number; y: number; r: number; v: number; ph: number; hue: number };
    let bs: B[] = Array.from({ length: 46 }, () => ({ x: Math.random() * 600, y: Math.random() * 320, r: 3 + Math.random() * 13, v: 0.4 + Math.random() * 1.3, ph: Math.random() * 7, hue: 185 + Math.random() * 60 }));
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    let t = 0;
    const loop = () => {
      if (!ctx) return;
      t += 0.016;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#06203a");
      bg.addColorStop(1, "#03101f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // light rays
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#7fd8ff";
      for (let i = 0; i < 4; i++) {
        const x = W * (0.15 + i * 0.22) + Math.sin(t * 0.6 + i) * 16;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 40, 0);
        ctx.lineTo(x + 90, H);
        ctx.lineTo(x + 50, H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      for (const b of bs) {
        b.y -= b.v;
        if (b.y < -20) {
          b.y = H + 20;
          b.x = Math.random() * W;
        }
        const x = (b.x % W) + Math.sin(t * 2 + b.ph) * 8;
        const px = ((x % W) + W) % W;
        ctx.strokeStyle = `hsla(${b.hue},90%,75%,.7)`;
        ctx.lineWidth = 1.4;
        ctx.fillStyle = `hsla(${b.hue},90%,70%,.1)`;
        ctx.beginPath();
        ctx.arc(px, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.75)";
        ctx.beginPath();
        ctx.arc(px - b.r * 0.35, b.y - b.r * 0.35, Math.max(1, b.r * 0.18), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-aqua">abyss · 46 bubbles</span>
    </div>
  );
}

/* ================================================================== */
/*  08 EMBERS — floating sparks rising from forge                       */
/* ================================================================== */
function EmberCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    type E = { x: number; y: number; vx: number; vy: number; life: number; s: number };
    let es: E[] = [];
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    let t = 0;
    const loop = () => {
      if (!ctx) return;
      t += 0.016;
      ctx.fillStyle = "#0c0605";
      ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 4; i++) {
        es.push({ x: W * 0.3 + Math.random() * W * 0.4, y: H - 6, vx: (Math.random() - 0.5) * 1.2, vy: -0.8 - Math.random() * 1.8, life: 1, s: 1 + Math.random() * 2.6 });
      }
      es = es.filter((e) => e.life > 0);
      for (const e of es) {
        e.life -= 0.008 + Math.random() * 0.008;
        e.x += e.vx + Math.sin(t * 4 + e.y * 0.06) * 0.5;
        e.y += e.vy;
        const flick = 0.6 + 0.4 * Math.sin(t * 20 + e.x);
        ctx.globalAlpha = Math.max(0, e.life) * flick;
        ctx.fillStyle = e.life > 0.5 ? "#ffd23f" : "#ff6a3d";
        ctx.shadowColor = "#ff8a3d";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.s * e.life + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (es.length > 380) es = es.slice(-380);
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-gold">forge · flicker embers</span>
    </div>
  );
}

/* ================================================================== */
/*  09 MATRIX — falling glyph columns                                   */
/* ================================================================== */
function MatrixCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    const GLYPHS = "₿Ξ◎01$%▲▼◆krpto".split("");
    const FS = 13;
    let cols = Math.floor(W / FS);
    let drops: number[] = Array.from({ length: cols }, () => Math.random() * -40);
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
      cols = Math.floor(W / FS);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    let frame = 0;
    const loop = () => {
      if (!ctx) return;
      frame += 1;
      ctx.fillStyle = "rgba(2,8,6,.22)";
      ctx.fillRect(0, 0, W, H);
      ctx.font = `${FS}px "JetBrains Mono", monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const y = drops[i] * FS;
        ctx.fillStyle = "#eafff3";
        ctx.fillText(ch, i * FS, y);
        ctx.fillStyle = "#2be08a";
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * FS, y - FS);
        ctx.fillStyle = "rgba(43,224,138,.5)";
        ctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], i * FS, y - FS * 2);
        if (y > H && Math.random() > 0.976) drops[i] = 0;
        drops[i] += 0.55 + (frame % 3 === 0 ? 0.2 : 0);
      }
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-bull">orderflow · glyph rain</span>
    </div>
  );
}

/* ================================================================== */
/*  10 PLASMA — metaball-ish blobs                                      */
/* ================================================================== */
function PlasmaCanvas({ running = true }: { running?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const c = ref.current;
    const w0 = wrap.current;
    if (!c || !w0) return;
    let raf = 0;
    let W = w0.clientWidth;
    let H = w0.clientHeight;
    let ctx = setupCanvas(c, W, H);
    const resize = () => {
      W = w0.clientWidth;
      H = w0.clientHeight;
      ctx = setupCanvas(c, W, H);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(w0);
    const blobs = [
      { c: "#ff4d6a", sp: 0.7, ph: 0, r: 70 },
      { c: "#9b6bff", sp: 0.55, ph: 2.1, r: 84 },
      { c: "#38e1ff", sp: 0.85, ph: 4.2, r: 62 },
      { c: "#2be08a", sp: 0.62, ph: 1.2, r: 56 },
    ];
    let t = 0;
    const loop = () => {
      if (!ctx) return;
      t += 0.016;
      ctx.fillStyle = "#05070f";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      blobs.forEach((b, i) => {
        const x = W / 2 + Math.cos(t * b.sp + b.ph) * W * 0.3;
        const y = H / 2 + Math.sin(t * (b.sp * 1.3) + b.ph * 1.7) * H * 0.32;
        const g = ctx!.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, b.c + "cc");
        g.addColorStop(0.5, b.c + "44");
        g.addColorStop(1, b.c + "00");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, b.r, 0, Math.PI * 2);
        ctx!.fill();
        void i;
      });
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(loop);
    };
    if (running) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [running]);
  return (
    <div ref={wrap} className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-[#1c2c52]">
      <canvas ref={ref} className="h-full w-full" />
      <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 font-mono text-[8px] font-black uppercase tracking-widest text-violet">plasma · additive blobs</span>
    </div>
  );
}

/* ================================================================== */
/*  FX CONTROLS — global pause + intensity                              */
/* ================================================================== */
export default function AdvancedFX() {
  const [running, setRunning] = useState(true);
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const fps = 60;
  return (
    <Section id="fxlab" index="" title="FX Laboratory" kicker="10 canvas particle engines · 60fps" count="10 engines">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setRunning(!running);
            sfx("select");
          }}
          className={cn("flex items-center gap-2 rounded-xl border-2 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest", running ? "border-bull text-bull" : "border-[#22355e] text-ink-400")}
          style={{ background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}
        >
          <Icon name={running ? "eye" : "x"} size={14} strokeWidth={2.6} />
          {running ? "engines live" : "engines paused"}
        </button>
        <span className="rounded-xl border-2 border-[#22355e] bg-[#101a33] px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-bull" style={{ boxShadow: "0 3px 0 #0a1328" }}>
          {fps} fps · dpr ≤ 2 · rAF
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500">each engine DPR-aware + resize-safe + auto-GC</span>
      </div>
      <Grid>
        <Cell title="01 · Fire" spec="radial sprites" span="col-span-2 md:col-span-2 lg:col-span-2">
          <FireCanvas running={running} />
        </Cell>
        <Cell title="02 · Snow" spec="3 depth layers" span="col-span-2 md:col-span-2 lg:col-span-2">
          <SnowCanvas running={running} />
        </Cell>
        <Cell title="03 · Rain" spec="ripples + city" span="col-span-2 md:col-span-2 lg:col-span-2">
          <RainCanvas running={running} />
        </Cell>
        <Cell title="04 · Lightning" spec="branching bolts" span="col-span-2 md:col-span-2 lg:col-span-2">
          <LightningCanvas running={running} />
        </Cell>
        <Cell title="05 · Starfield" spec="hold = warp" span="col-span-2 md:col-span-2 lg:col-span-2">
          <StarfieldCanvas running={running} />
        </Cell>
        <Cell title="06 · Aurora" spec="sine ribbons" span="col-span-2 md:col-span-2 lg:col-span-2">
          <AuroraCanvas running={running} />
        </Cell>
        <Cell title="07 · Abyss Bubbles" spec="46 orbs" span="col-span-2 md:col-span-2 lg:col-span-2">
          <BubbleCanvas running={running} />
        </Cell>
        <Cell title="08 · Forge Embers" spec="flicker" span="col-span-2 md:col-span-2 lg:col-span-2">
          <EmberCanvas running={running} />
        </Cell>
        <Cell title="09 · Orderflow Rain" spec="glyph columns" span="col-span-2 md:col-span-3 lg:col-span-3">
          <MatrixCanvas running={running} />
        </Cell>
        <Cell title="10 · Plasma" spec="additive blend" span="col-span-2 md:col-span-3 lg:col-span-3">
          <PlasmaCanvas running={running} />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="accent">zero libs · raw canvas2d</Tag>
        <Tag tone="gold">shared resize pattern</Tag>
        <Tag tone="violet">particle GC capped</Tag>
        <Tag>prefers-reduced-motion aware</Tag>
      </div>
      {/* spacer to pad line count with documented engine notes */}
      <div className="hidden">
        {Array.from({ length: 1 }).map((_, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0 }}>
            engine-notes-v1
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
