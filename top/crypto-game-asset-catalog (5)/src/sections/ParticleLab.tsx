import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { sfx } from "../utils/sfx";
import { burstConfetti } from "../utils/fx";
import { clamp } from "../hooks/motion";

/* Shared canvas helper */
function useCanvas2D(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void, active = true) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fn = useRef(draw);
  fn.current = draw;
  useEffect(() => {
    if (!active) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let last = performance.now();
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      cv.width = Math.max(1, r.width * dpr);
      cv.height = Math.max(1, r.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const r = cv.getBoundingClientRect();
      fn.current(ctx, r.width, r.height, t / 1000, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active]);
  return ref;
}
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];
const PAL = ["#1fdb8b", "#3d7bff", "#ffc53d", "#ff4d6a", "#8d5cff", "#2ed3f0", "#ffffff"];

/* ============ 1. FIREWORKS ============ */
type Rocket = { x: number; y: number; vy: number; hue: string; trail: { x: number; y: number }[] };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; size: number; grav: number };
function Fireworks() {
  const rockets = useRef<Rocket[]>([]);
  const sparks = useRef<Spark[]>([]);
  const flashes = useRef<{ x: number; y: number; r: number; a: number; c: string }[]>([]);
  const [auto, setAuto] = useState(true);
  const [power, setPower] = useState(80);
  const [count, setCount] = useState(0);
  const autoT = useRef(0);
  const launch = (x: number, w: number) => {
    rockets.current.push({ x: x ?? rnd(w * 0.15, w * 0.85), y: 240, vy: rnd(-340, -260), hue: pick(PAL), trail: [] });
    if (rockets.current.length > 8) rockets.current.shift();
  };
  const explode = (r: Rocket) => {
    const n = Math.round(40 + (power / 100) * 80);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.1, 0.1);
      const v = rnd(40, 60 + power * 1.6);
      sparks.current.push({ x: r.x, y: r.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rnd(0.8, 1.7), c: Math.random() > 0.3 ? r.hue : "#ffffff", size: rnd(1.5, 3.5), grav: 90 });
    }
    // inner ring
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      sparks.current.push({ x: r.x, y: r.y, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, life: 0, max: 0.6, c: "#ffffff", size: 2, grav: 20 });
    }
    flashes.current.push({ x: r.x, y: r.y, r: 6, a: 0.9, c: r.hue });
    setCount((c) => c + 1);
    sfx.pop();
  };
  const ref = useCanvas2D((ctx, w, h, _t, dt) => {
    void _t;
    ctx.fillStyle = "rgba(5,10,24,0.32)";
    ctx.fillRect(0, 0, w, h);
    autoT.current += dt;
    if (auto && autoT.current > 0.9) { autoT.current = 0; launch(rnd(w * 0.12, w * 0.88), w); }
    // rockets
    for (let i = rockets.current.length - 1; i >= 0; i--) {
      const r = rockets.current[i];
      r.vy += 120 * dt;
      r.y += r.vy * dt;
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 14) r.trail.shift();
      r.trail.forEach((p, k) => {
        ctx.globalAlpha = (k / r.trail.length) * 0.9;
        ctx.fillStyle = r.hue;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.4, 0, 7); ctx.fill();
      if (r.vy > -60 || r.y < h * 0.18) { rockets.current.splice(i, 1); explode(r); }
    }
    // sparks
    for (let i = sparks.current.length - 1; i >= 0; i--) {
      const s = sparks.current[i];
      s.life += dt;
      if (s.life >= s.max) { sparks.current.splice(i, 1); continue; }
      s.vy += s.grav * dt;
      s.vx *= 0.985; s.vy *= 0.99;
      s.x += s.vx * dt; s.y += s.vy * dt;
      const k = 1 - s.life / s.max;
      ctx.globalAlpha = k;
      ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size * (0.5 + k * 0.5), 0, 7); ctx.fill();
      ctx.globalAlpha = k * 0.35;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 2.6, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // flashes
    for (let i = flashes.current.length - 1; i >= 0; i--) {
      const f = flashes.current[i];
      f.r += 260 * dt; f.a -= 1.8 * dt;
      if (f.a <= 0) { flashes.current.splice(i, 1); continue; }
      ctx.globalAlpha = f.a;
      ctx.strokeStyle = f.c; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // ground silhouette
    ctx.fillStyle = "#0a1330";
    ctx.fillRect(0, h - 14, w, 14);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    for (let x = 0; x < w; x += 26) ctx.fillRect(x, h - 14 - ((x * 7919) % 17), 14, 30);
  });
  return (
    <Asset title="Fireworks Show" id="ptl.fireworks" desc="Клик — запуск ракеты. Авторежим, мощность взрыва, шлейфы, кольца-вспышки, затухание с трейлами." className="lg:col-span-2">
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        <canvas ref={ref} className="w-full h-[240px] cursor-crosshair"
          onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); launch(e.clientX - r.left, r.width); }} />
        <div className="absolute top-2.5 left-3"><Badge tone="gold"><span className="num">{count}</span> взрывов</Badge></div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <Btn3D size="xs" variant={auto ? "bull" : "neutral"} onClick={() => { setAuto(!auto); sfx.toggle(); }}>{auto ? "Auto ON" : "Auto OFF"}</Btn3D>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <span className="text-[11px] font-bold text-dim">Power</span>
          <input type="range" min={20} max={100} value={power} onChange={(e) => setPower(+e.target.value)} className="flex-1 accent-[#ffc53d]" />
          <span className="num text-[11px] font-extrabold w-8">{power}</span>
        </div>
        <Btn3D size="xs" variant="gold" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); for (let i = 0; i < 4; i++) setTimeout(() => launch(rnd(40, 400), 440), i * 140); burstConfetti(r.left + r.width / 2, r.top, 30, 0.8); }}>Salvo ×4</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 2. EMBER FIELD ============ */
type Ember = { x: number; y: number; s: number; v: number; ph: number; c: string; a: number };
function Embers() {
  const [wind, setWind] = useState(30);
  const [density, setDensity] = useState(70);
  const embers = useRef<Ember[]>([]);
  const ref = useCanvas2D((ctx, w, h, t) => {
    const target = Math.round((density / 100) * 130);
    while (embers.current.length < target) embers.current.push({ x: rnd(0, w), y: rnd(0, h), s: rnd(1, 3.2), v: rnd(18, 60), ph: rnd(0, 6.28), c: pick(["#ff8a3d", "#ffc53d", "#ff4d6a", "#ffcf7a"]), a: rnd(0.4, 1) });
    while (embers.current.length > target) embers.current.pop();
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#070d1f"); g.addColorStop(1, "#2a0f14");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (const e of embers.current) {
      e.y -= e.v * 0.016;
      e.x += Math.sin(t * 1.6 + e.ph) * 0.5 + (wind / 100) * 0.8;
      if (e.y < -6) { e.y = h + 6; e.x = rnd(0, w); }
      if (e.x > w + 6) e.x = -6; if (e.x < -6) e.x = w + 6;
      const flick = 0.6 + Math.sin(t * 7 + e.ph * 3) * 0.4;
      ctx.globalAlpha = e.a * flick;
      ctx.fillStyle = e.c;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.s, 0, 7); ctx.fill();
      ctx.globalAlpha = e.a * flick * 0.25;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.s * 3, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
  return (
    <Asset title="Ember Field" id="ptl.embers" desc="Тлеющие угли костра: мерцание, дрейф по синусу, ветер и плотность.">
      <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10" />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-[11px] font-bold text-dim">Wind<input type="range" min={-100} max={100} value={wind} onChange={(e) => setWind(+e.target.value)} className="w-full accent-[#ff8a3d]" /></label>
        <label className="text-[11px] font-bold text-dim">Density<input type="range" min={10} max={100} value={density} onChange={(e) => setDensity(+e.target.value)} className="w-full accent-[#ffc53d]" /></label>
      </div>
    </Asset>
  );
}

/* ============ 3. BUBBLE TANK ============ */
type Bub = { x: number; y: number; r: number; v: number; ph: number; a: number };
function Bubbles() {
  const bubbles = useRef<Bub[]>([]);
  const pops = useRef<{ x: number; y: number; r: number; a: number }[]>([]);
  const [popped, setPopped] = useState(0);
  const [flow, setFlow] = useState(60);
  const ref = useCanvas2D((ctx, w, h, t, dt) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0a1a3f"); g.addColorStop(1, "#06101f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // light rays
    ctx.save(); ctx.globalAlpha = 0.05; ctx.fillStyle = "#7ee8fa";
    for (let i = 0; i < 3; i++) { const x = w * (0.2 + i * 0.3) + Math.sin(t * 0.4 + i) * 14; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 40, 0); ctx.lineTo(x + 90, h); ctx.lineTo(x + 50, h); ctx.fill(); }
    ctx.restore();
    const target = Math.round(8 + (flow / 100) * 34);
    if (bubbles.current.length < target && Math.random() < 0.3) bubbles.current.push({ x: rnd(10, w - 10), y: h + 12, r: rnd(3, 13), v: rnd(30, 90), ph: rnd(0, 6.28), a: rnd(0.3, 0.8) });
    for (let i = bubbles.current.length - 1; i >= 0; i--) {
      const b = bubbles.current[i];
      b.y -= b.v * dt; b.x += Math.sin(t * 2 + b.ph) * 0.6;
      if (b.y < -16) { bubbles.current.splice(i, 1); continue; }
      ctx.globalAlpha = b.a;
      ctx.strokeStyle = "#9be9ff"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke();
      ctx.fillStyle = "rgba(155,233,255,.12)";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, Math.max(1, b.r * 0.18), 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = pops.current.length - 1; i >= 0; i--) {
      const p = pops.current[i];
      p.r += 90 * dt; p.a -= 2.4 * dt;
      if (p.a <= 0) { pops.current.splice(i, 1); continue; }
      ctx.globalAlpha = p.a; ctx.strokeStyle = "#9be9ff"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  const popAt = (cx: number, cy: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = cx - r.left, y = cy - r.top;
    for (let i = bubbles.current.length - 1; i >= 0; i--) {
      const b = bubbles.current[i];
      if (Math.hypot(b.x - x, b.y - y) < b.r + 8) {
        bubbles.current.splice(i, 1);
        pops.current.push({ x: b.x, y: b.y, r: b.r, a: 1 });
        setPopped((p) => p + 1); sfx.pop();
        return;
      }
    }
  };
  return (
    <Asset title="Bubble Tank" id="ptl.bubbles" desc="Лопайте пузыри кликом. Поток регулирует spawn-rate, лучи света качаются.">
      <div className="relative">
        <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10 cursor-pointer"
          onPointerDown={(e) => popAt(e.clientX, e.clientY)} />
        <div className="absolute top-2.5 left-3"><Badge tone="cyan">Popped <span className="num">{popped}</span></Badge></div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[11px] font-bold text-dim">Flow</span>
        <input type="range" min={5} max={100} value={flow} onChange={(e) => setFlow(+e.target.value)} className="flex-1 accent-[#2ed3f0]" />
      </div>
    </Asset>
  );
}

/* ============ 4. WARP TUNNEL ============ */
type Star = { x: number; y: number; z: number; pz: number };
function Warp() {
  const stars = useRef<Star[]>(Array.from({ length: 260 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1), pz: 1 })));
  const [speed, setSpeed] = useState(55);
  const [boost, setBoost] = useState(false);
  const cur = useRef(0.3);
  const ref = useCanvas2D((ctx, w, h, _t, dt) => {
    const target = boost ? 3.4 : 0.15 + (speed / 100) * 1.1;
    cur.current += (target - cur.current) * 0.06;
    ctx.fillStyle = "rgba(5,10,24,0.5)";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    for (const s of stars.current) {
      s.pz = s.z;
      s.z -= cur.current * dt;
      if (s.z <= 0.02) { s.x = rnd(-1, 1); s.y = rnd(-1, 1); s.z = 1; s.pz = 1; continue; }
      const sx = cx + (s.x / s.z) * w * 0.5, sy = cy + (s.y / s.z) * h * 0.5;
      const px = cx + (s.x / s.pz) * w * 0.5, py = cy + (s.y / s.pz) * h * 0.5;
      const k = 1 - s.z;
      const warm = k > 0.75;
      ctx.strokeStyle = warm ? `rgba(255,197,61,${k})` : `rgba(140,170,255,${0.25 + k * 0.75})`;
      ctx.lineWidth = 0.6 + k * 2.2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
    }
    // vignette
    const v = ctx.createRadialGradient(cx, cy, h * 0.2, cx, cy, h * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.55)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  });
  return (
    <Asset title="Warp Tunnel" id="ptl.warp" desc="Полёт сквозь звёзды: скорость + кнопка Boost с разгоном. Линии растягиваются от центра.">
      <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10" />
      <div className="flex items-center gap-3 mt-3">
        <input type="range" min={5} max={100} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="flex-1 accent-[#8d5cff]" />
        <Btn3D size="xs" variant={boost ? "gold" : "violet"}
          onPointerDown={() => { setBoost(true); sfx.whoosh(); }} onPointerUp={() => setBoost(false)} onPointerLeave={() => setBoost(false)}>
          Hold Boost
        </Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 5. CONFETTI CANNONS ============ */
type CF = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; c: string; w: number; h: number; life: number };
function Cannons() {
  const parts = useRef<CF[]>([]);
  const [angle, setAngle] = useState(62);
  const [spread, setSpread] = useState(26);
  const fire = (side: -1 | 1 | 0, w: number, h: number) => {
    const shoot = (sx: number, dir: number) => {
      const base = (angle * Math.PI) / 180;
      for (let i = 0; i < 46; i++) {
        const a = base + rnd(-spread, spread) * (Math.PI / 180) * 0.5;
        const v = rnd(280, 520);
        parts.current.push({ x: sx, y: h - 26, vx: Math.cos(a) * v * dir, vy: -Math.sin(a) * v, rot: rnd(0, 6.28), vr: rnd(-12, 12), c: pick(PAL), w: rnd(4, 8), h: rnd(6, 12), life: 0 });
      }
    };
    if (side <= 0) shoot(26, 1);
    if (side >= 0) shoot(w - 26, -1);
    sfx.success();
  };
  const ref = useCanvas2D((ctx, w, h, _t, dt) => {
    ctx.fillStyle = "#070d1f"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#0a1330"; ctx.fillRect(0, h - 18, w, 18);
    for (let i = parts.current.length - 1; i >= 0; i--) {
      const p = parts.current[i];
      p.life += dt;
      p.vy += 560 * dt; p.vx *= 0.992;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > h - 14 && p.vy > 0) { p.vy *= -0.45; p.y = h - 14; p.vx *= 0.8; }
      if (p.life > 5) { parts.current.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.globalAlpha = clamp(1.4 - p.life / 4);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.rot * 1.4)) * 0.7 + p.h * 0.3);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    // cannons
    const drawCannon = (x: number, dir: 1 | -1) => {
      ctx.save(); ctx.translate(x, h - 20); ctx.scale(dir, 1); ctx.rotate(-((90 - angle) * Math.PI) / 180 * 0.5);
      ctx.fillStyle = "#1c3068";
      ctx.beginPath(); ctx.roundRect(-10, -12, 46, 24, 6); ctx.fill();
      ctx.fillStyle = "#3d7bff"; ctx.fillRect(26, -12, 8, 24);
      ctx.restore();
      ctx.fillStyle = "#0f1b3f";
      ctx.beginPath(); ctx.arc(x, h - 14, 13, 0, 7); ctx.fill();
      ctx.fillStyle = "#ffc53d";
      ctx.beginPath(); ctx.arc(x, h - 14, 5, 0, 7); ctx.fill();
    };
    drawCannon(26, 1); drawCannon(w - 26, -1);
  });
  const W = () => ref.current?.getBoundingClientRect().width ?? 400;
  const H = () => ref.current?.getBoundingClientRect().height ?? 240;
  return (
    <Asset title="Confetti Cannons" id="ptl.cannons" desc="Две пушки с физикой: угол, разброс, отскок от пола, затухание. Огонь по одной или залпом.">
      <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10" />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <label className="text-[11px] font-bold text-dim">Angle {angle}°<input type="range" min={25} max={85} value={angle} onChange={(e) => setAngle(+e.target.value)} className="w-full accent-[#1fdb8b]" /></label>
        <label className="text-[11px] font-bold text-dim">Spread {spread}°<input type="range" min={4} max={60} value={spread} onChange={(e) => setSpread(+e.target.value)} className="w-full accent-[#8d5cff]" /></label>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Btn3D size="xs" variant="blue" onClick={() => fire(-1, W(), H())}>Left</Btn3D>
        <Btn3D size="xs" variant="gold" onClick={() => fire(0, W(), H())}>Both</Btn3D>
        <Btn3D size="xs" variant="violet" onClick={() => fire(1, W(), H())}>Right</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 6. MAGNETIC DUST ============ */
type Dust = { x: number; y: number; vx: number; vy: number; c: string };
function MagneticDust() {
  const dust = useRef<Dust[]>([]);
  const mouse = useRef<{ x: number; y: number; on: boolean }>({ x: 0, y: 0, on: false });
  const [mode, setMode] = useState<"attract" | "repel" | "swirl">("attract");
  const [power, setPower] = useState(70);
  const ref = useCanvas2D((ctx, w, h, _t, dt) => {
    if (!dust.current.length) for (let i = 0; i < 160; i++) dust.current.push({ x: rnd(0, w), y: rnd(0, h), vx: 0, vy: 0, c: pick(["#2ed3f0", "#8d5cff", "#3d7bff", "#1fdb8b"]) });
    ctx.fillStyle = "rgba(5,10,24,0.4)"; ctx.fillRect(0, 0, w, h);
    const m = mouse.current;
    const P = (power / 100) * 9000;
    for (const d of dust.current) {
      const dx = m.x - d.x, dy = m.y - d.y;
      const dist = Math.max(18, Math.hypot(dx, dy));
      const f = m.on ? P / (dist * dist) : 0;
      if (mode === "attract") { d.vx += (dx / dist) * f * dt * 60; d.vy += (dy / dist) * f * dt * 60; }
      else if (mode === "repel") { d.vx -= (dx / dist) * f * dt * 60; d.vy -= (dy / dist) * f * dt * 60; }
      else { const tx = -dy / dist, ty = dx / dist; d.vx += (tx * f * dt * 60 + (dx / dist) * f * dt * 12); d.vy += (ty * f * dt * 60 + (dy / dist) * f * dt * 12); }
      d.vx *= 0.96; d.vy *= 0.96;
      d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      d.x = clamp(d.x, 0, w); d.y = clamp(d.y, 0, h);
      const sp = Math.min(1, Math.hypot(d.vx, d.vy) / 300);
      ctx.fillStyle = d.c;
      ctx.globalAlpha = 0.45 + sp * 0.55;
      ctx.beginPath(); ctx.arc(d.x, d.y, 1.4 + sp * 2, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (m.on) {
      ctx.strokeStyle = mode === "repel" ? "rgba(255,77,106,.5)" : "rgba(46,211,240,.5)";
      ctx.lineWidth = 1.5; ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.arc(m.x, m.y, 44, 0, 7); ctx.stroke();
      ctx.setLineDash([]);
    }
  });
  const setMouse = (e: React.PointerEvent) => { const r = e.currentTarget.getBoundingClientRect(); mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top, on: true }; };
  return (
    <Asset title="Magnetic Dust" id="ptl.magnet" desc="160 частиц следуют за курсором: притяжение, отталкивание или вихрь. Скорость влияет на яркость и размер.">
      <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10 cursor-none touch-none"
        onPointerMove={setMouse} onPointerDown={setMouse} onPointerLeave={() => (mouse.current.on = false)} />
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {(["attract", "repel", "swirl"] as const).map((m) => (
          <Btn3D key={m} size="xs" variant={mode === m ? "cyan" : "neutral"} onClick={() => { setMode(m); sfx.tick(); }}>{m}</Btn3D>
        ))}
        <input type="range" min={10} max={100} value={power} onChange={(e) => setPower(+e.target.value)} className="flex-1 min-w-[100px] accent-[#2ed3f0]" />
      </div>
    </Asset>
  );
}

/* ============ 7. SNOWFALL ============ */
type Flake = { x: number; y: number; r: number; v: number; ph: number; o: number };
function Snowfall() {
  const flakes = useRef<Flake[]>([]);
  const [wind, setWind] = useState(20);
  const [amount, setAmount] = useState(70);
  const [gust, setGust] = useState(false);
  const gustV = useRef(0);
  const ref = useCanvas2D((ctx, w, h, t, dt) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0a1430"); g.addColorStop(1, "#142350");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // moon
    ctx.fillStyle = "#eaf0ff";
    ctx.beginPath(); ctx.arc(w - 44, 40, 18, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(234,240,255,.15)";
    ctx.beginPath(); ctx.arc(w - 44, 40, 30, 0, 7); ctx.fill();
    gustV.current += ((gust ? 1 : 0) - gustV.current) * 0.05;
    const target = Math.round((amount / 100) * 220);
    while (flakes.current.length < target) flakes.current.push({ x: rnd(0, w), y: rnd(-h, 0), r: rnd(1, 3.6), v: rnd(24, 70), ph: rnd(0, 6.28), o: rnd(0.35, 1) });
    while (flakes.current.length > target) flakes.current.pop();
    const wv = (wind / 100) * 90 + gustV.current * 260;
    for (const f of flakes.current) {
      f.y += f.v * dt;
      f.x += (Math.sin(t * 1.2 + f.ph) * 22 + wv) * dt;
      if (f.y > h + 4) { f.y = -4; f.x = rnd(-40, w); }
      if (f.x > w + 10) f.x = -10; if (f.x < -10) f.x = w + 10;
      ctx.globalAlpha = f.o;
      ctx.fillStyle = "#eaf0ff";
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // ground
    ctx.fillStyle = "#eaf0ff";
    ctx.beginPath(); ctx.ellipse(w / 2, h + 26, w * 0.7, 44, 0, 0, 7); ctx.fill();
  });
  return (
    <Asset title="Snowfall" id="ptl.snow" desc="Снег с ветром и порывами: хлопья качаются по синусу, сугроб и луна. Удерживайте Gust.">
      <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10" />
      <div className="flex items-center gap-3 mt-3">
        <input type="range" min={-100} max={100} value={wind} onChange={(e) => setWind(+e.target.value)} className="flex-1 accent-[#8fb3ff]" />
        <input type="range" min={5} max={100} value={amount} onChange={(e) => setAmount(+e.target.value)} className="flex-1 accent-[#2ed3f0]" />
        <Btn3D size="xs" variant={gust ? "cyan" : "neutral"} onPointerDown={() => setGust(true)} onPointerUp={() => setGust(false)} onPointerLeave={() => setGust(false)}>Gust</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 8. COIN FOUNTAIN ============ */
type Coin = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; r: number; spin: number };
function CoinFountain() {
  const coins = useRef<Coin[]>([]);
  const [total, setTotal] = useState(0);
  const [auto, setAuto] = useState(false);
  const acc = useRef(0);
  const erupt = (x: number, y: number, n = 14) => {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + rnd(-0.7, 0.7);
      const v = rnd(220, 480);
      coins.current.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: rnd(0, 6.28), vr: rnd(-10, 10), r: rnd(7, 12), spin: rnd(2, 7) });
    }
    if (coins.current.length > 420) coins.current.splice(0, coins.current.length - 420);
    setTotal((t) => t + n);
    sfx.coin();
  };
  const ref = useCanvas2D((ctx, w, h, _t, dt) => {
    ctx.fillStyle = "#070d1f"; ctx.fillRect(0, 0, w, h);
    acc.current += dt;
    if (auto && acc.current > 0.5) { acc.current = 0; erupt(w / 2, h - 30, 10); }
    // pot
    ctx.fillStyle = "#101d44";
    ctx.beginPath(); ctx.roundRect(w / 2 - 44, h - 34, 88, 30, 8); ctx.fill();
    ctx.fillStyle = "#ffc53d";
    ctx.beginPath(); ctx.ellipse(w / 2, h - 34, 44, 10, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#8a5200";
    ctx.beginPath(); ctx.ellipse(w / 2, h - 34, 34, 6, 0, 0, 7); ctx.fill();
    for (let i = coins.current.length - 1; i >= 0; i--) {
      const c = coins.current[i];
      c.vy += 900 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.spin * dt;
      if (c.y > h - 8) { c.y = h - 8; c.vy *= -0.5; c.vx *= 0.85; c.vr *= 0.7; if (Math.abs(c.vy) < 40) { coins.current.splice(i, 1); continue; } }
      if (c.x < 0 || c.x > w) c.vx *= -1;
      ctx.save(); ctx.translate(c.x, c.y);
      ctx.scale(Math.abs(Math.cos(c.rot)) * 0.7 + 0.3, 1);
      ctx.fillStyle = "#8a5200";
      ctx.beginPath(); ctx.arc(0, 1.5, c.r, 0, 7); ctx.fill();
      const g = ctx.createLinearGradient(0, -c.r, 0, c.r);
      g.addColorStop(0, "#ffe27a"); g.addColorStop(1, "#e39a0b");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, c.r, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(140,80,0,.5)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, c.r * 0.68, 0, 7); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.beginPath(); ctx.arc(-c.r * 0.3, -c.r * 0.35, c.r * 0.18, 0, 7); ctx.fill();
      ctx.restore();
    }
  });
  return (
    <Asset title="Coin Fountain" id="ptl.coins" desc="Клик — извержение монет с вращением, бликом и отскоком от пола. Авторежим капает из горшка.">
      <div className="relative">
        <canvas ref={ref} className="w-full h-[240px] rounded-2xl border border-white/10 cursor-pointer"
          onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); erupt(e.clientX - r.left, e.clientY - r.top); }} />
        <div className="absolute top-2.5 left-3"><Badge tone="gold"><span className="num">{total}</span> coins</Badge></div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <Btn3D size="xs" variant={auto ? "gold" : "neutral"} onClick={() => setAuto(!auto)}>{auto ? "Auto ON" : "Auto OFF"}</Btn3D>
        <Btn3D size="xs" variant="blue" onClick={() => { const r = ref.current?.getBoundingClientRect(); if (r) erupt(r.width / 2, r.height - 40, 40); }}>Erupt ×40</Btn3D>
        <span className="ml-auto text-[11px] text-dim font-bold">клик в любом месте</span>
      </div>
    </Asset>
  );
}

export default function ParticleLab() {
  return (
    <Section id="particles" index="22" title="Particle Lab" subtitle="8 canvas-систем частиц с физикой: салюты, угли, пузыри, варп, пушки, магнитная пыль, снег, монеты" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Fireworks />
        <Embers />
        <Bubbles />
        <Warp />
        <Cannons />
        <MagneticDust />
        <Snowfall />
        <CoinFountain />
      </div>
      <div className="hidden"><Icon name="sparkles" size={12} /></div>
    </Section>
  );
}
