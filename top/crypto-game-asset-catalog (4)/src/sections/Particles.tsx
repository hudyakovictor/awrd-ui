import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { AssetCard, Btn, Icon, ProgressBar, Section } from "../ui/kit";
import { useRaf } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ───── shared canvas particle runner ───── */
type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; c: string; g?: number; drag?: number; rot?: number; vr?: number; shape?: "rect" | "dot" | "spark" };
type DrawCb = (ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, t: number) => void;
function useCanvas(cb: DrawCb, active = true) {
  const ref = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0, last = performance.now(), w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => { const r = cv.getBoundingClientRect(); w = r.width; h = r.height; cv.width = Math.max(1, w * dpr); cv.height = Math.max(1, h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const loop = (t: number) => {
      const dt = Math.min(50, t - last);
      last = t;
      ctx.clearRect(0, 0, w, h);
      cbRef.current(ctx, w, h, dt, t);
      raf = requestAnimationFrame(loop);
    };
    if (active) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active]);
  return ref;
}

/* ═════════ PTX-01 · Fire button ═════════ */

function FireButton() {
  const game = useGame();
  const [hits, setHits] = useState(0);
  const flames = useRef<P[]>([]);
  const sparks = useRef<P[]>([]);
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    const cx = w / 2, base = h - 4;
    if (flames.current.length < 90) for (let i = 0; i < 3; i++) flames.current.push({ x: cx + (Math.random() - 0.5) * 26, y: base, vx: (Math.random() - 0.5) * 0.5, vy: -(1.4 + Math.random() * 1.8), life: 0, max: 26 + Math.random() * 22, size: 2 + Math.random() * 4, c: Math.random() > 0.7 ? "#fff7d6" : Math.random() > 0.4 ? "#ffc53d" : "#ff8a3d" });
    ctx.globalCompositeOperation = "lighter";
    for (const p of flames.current) {
      p.life += k; p.x += p.vx * k + Math.sin(p.life * 0.4) * 0.3; p.y += p.vy * k; p.size *= 0.985;
      if (p.life > p.max) continue;
      const a = 1 - p.life / p.max;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, 7); ctx.fill();
    }
    for (const s of sparks.current) {
      s.life += k; s.x += s.vx * k; s.y += s.vy * k; s.vy += 0.12 * k;
      if (s.life > s.max) continue;
      ctx.globalAlpha = 1 - s.life / s.max;
      ctx.strokeStyle = s.c; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    flames.current = flames.current.filter((p) => p.life < p.max);
    sparks.current = sparks.current.filter((p) => p.life < p.max);
  });
  const ignite = (e: React.MouseEvent) => {
    const r = cv.current!.getBoundingClientRect();
    for (let i = 0; i < 26; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6; const sp = 3 + Math.random() * 5; sparks.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 30 + Math.random() * 20, size: 3, c: ["#ffc53d", "#ff8a3d", "#fff", "#2ee59d"][i % 4] }); }
    setHits((h) => h + 1); feel("success", 12);
    game.reward({ xp: 8, gems: 4, x: e.clientX, y: e.clientY });
  };
  return (
    <AssetCard id="PTX-01" title="Fire Button" desc="Кнопка с живым пламенем на canvas: частицы поднимаются, дрожат и сгорают; клик — вспышка искр от точки касания и награда." tags={["particles", "canvas", "fire", "button"]}>
      <div className="relative mx-auto w-56">
        <canvas ref={cv} className="pointer-events-none absolute -top-14 inset-x-0 h-14" />
        <Btn v="flame" size="lg" block onClick={ignite}><Icon name="flame" size={20} variant="solid" />Ignite</Btn>
      </div>
      <div className="mt-4 flex justify-between font-mono text-xs font-bold text-ink-300"><span>sparks: <span className="text-flame">{hits}</span></span><span>+8 XP +4 💎 each</span></div>
    </AssetCard>
  );
}

/* ═════════ PTX-02 · Fireworks arena ═════════ */

type Rocket = { x: number; y: number; tx: number; ty: number; vy: number; hue: number };
function Fireworks() {
  const rockets = useRef<Rocket[]>([]);
  const parts = useRef<P[]>([]);
  const [booms, setBooms] = useState(0);
  const [shots, setShots] = useState(0);
  const tAcc = useRef(0);
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    tAcc.current += dt;
    if (tAcc.current > 1500) { tAcc.current = 0; launch(Math.random() * w, h * (0.15 + Math.random() * 0.25)); }
    function launch(tx: number, ty: number) {
      rockets.current.push({ x: w / 2 + (Math.random() - 0.5) * w * 0.6, y: h, tx, ty, vy: -(7 + Math.random() * 3), hue: Math.floor(Math.random() * 360) });
      setShots((s) => s + 1); sfx.play("whoosh");
    }
    (window as unknown as { __fwLaunch?: (x: number, y: number) => void }).__fwLaunch = launch;
    for (const r of rockets.current) {
      r.y += r.vy * k;
      ctx.globalAlpha = 0.8; ctx.fillStyle = `hsl(${r.hue} 90% 70%)`;
      ctx.beginPath(); ctx.arc(r.x, r.y, 2.4, 0, 7); ctx.fill();
      if (Math.random() > 0.4) parts.current.push({ x: r.x, y: r.y, vx: 0, vy: 0.4, life: 0, max: 12, size: 1.6, c: `hsl(${r.hue} 90% 70%)` });
      if (r.y <= r.ty) {
        for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2; const sp = 1.5 + Math.random() * 4.2; parts.current.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 50 + Math.random() * 34, size: 1.8 + Math.random() * 1.6, c: `hsl(${r.hue + Math.random() * 40 - 20} 95% ${60 + Math.random() * 25}%)`, g: 0.045, drag: 0.985, shape: Math.random() > 0.8 ? "spark" : "dot" }); }
        setBooms((b) => b + 1); sfx.play("pop"); hapticSafe();
      }
    }
    rockets.current = rockets.current.filter((r) => r.y > r.ty);
    ctx.globalCompositeOperation = "lighter";
    for (const p of parts.current) {
      p.life += k;
      p.vx = (p.vx ?? 0) * (p.drag ?? 1); p.vy = (p.vy ?? 0) * (p.drag ?? 1) + (p.g ?? 0) * k;
      p.x += p.vx * k; p.y += p.vy * k;
      if (p.life > p.max) continue;
      const a = 1 - p.life / p.max;
      ctx.globalAlpha = a;
      if (p.shape === "spark") { ctx.strokeStyle = p.c; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4); ctx.stroke(); }
      else { ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a + 0.3, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    parts.current = parts.current.filter((p) => p.life < p.max);
  });
  const hapticSafe = () => { try { navigator.vibrate?.(8); } catch { /* noop */ } };
  const tap = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); const f = (window as unknown as { __fwLaunch?: (x: number, y: number) => void }).__fwLaunch; if (f) f(e.clientX - r.left, (e.clientY - r.top) * 0.9); };
  return (
    <AssetCard id="PTX-02" title="Fireworks Arena" desc="Автозапуск фейерверков + тап по небу запускает ракету в точку: хвост, взрыв на 60+ частиц с гравитацией, сопротивлением и искрами. Aditive-блендинг." tags={["particles", "canvas", "fireworks", "celebration"]}>
      <canvas ref={cv} onPointerDown={tap} className="h-64 w-full cursor-crosshair touch-none rounded-2xl bg-ink-950/70" />
      <div className="mt-2 flex justify-between font-mono text-xs font-bold text-ink-300"><span>shots <span className="text-gold">{shots}</span></span><span>booms <span className="text-flame">{booms}</span></span><span>tap the sky</span></div>
    </AssetCard>
  );
}

/* ═════════ PTX-03 · Confetti cannons ═════════ */
function ConfettiCannon() {
  const parts = useRef<P[]>([]);
  const COLORS = ["#2ee59d", "#ffc53d", "#3d8bff", "#ff4d6a", "#a174ff", "#fff"];
  const cv = useCanvas((ctx, _w, h, dt) => {
    const k = dt / 16.67;
    for (const p of parts.current) {
      p.life += k; p.x += p.vx * k; p.y += p.vy * k; p.vy += 0.16 * k; p.vx *= 0.995; p.rot = (p.rot ?? 0) + (p.vr ?? 0) * k;
      if (p.life > p.max || p.y > h + 20) continue;
      ctx.globalAlpha = Math.min(1, (p.max - p.life) / 20);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot ?? 0);
      ctx.fillStyle = p.c;
      if (p.shape === "rect") ctx.fillRect(-p.size, -p.size / 2, p.size * 2, p.size);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size * 0.7, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    parts.current = parts.current.filter((p) => p.life < p.max && p.y < h + 20);
  });
  const fire = (side: -1 | 1, e?: React.MouseEvent) => {
    const r = cv.current!.getBoundingClientRect();
    const ox = side === 1 ? r.width - 12 : 12;
    for (let i = 0; i < 64; i++) parts.current.push({ x: ox, y: r.height - 8, vx: side * (2.5 + Math.random() * 5.5), vy: -(9 + Math.random() * 6), life: 0, max: 140 + Math.random() * 60, size: 2.5 + Math.random() * 3, c: COLORS[i % COLORS.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.5, shape: Math.random() > 0.5 ? "rect" : "dot" });
    if (e) feel("success", 15); else feel("whoosh", 10);
    sfx.play("combo");
  };
  return (
    <AssetCard id="PTX-03" title="Confetti Cannons" desc="Две пушки по углам: 64 конфетти со случайным вращением, гравитацией и затуханием. Комбо-звук при выстреле." tags={["particles", "confetti", "cannon", "celebration"]}>
      <canvas ref={cv} className="h-56 w-full rounded-2xl bg-ink-950/70" />
      <div className="mt-3 grid grid-cols-2 gap-3"><Btn v="bull" size="sm" onClick={(e) => fire(-1, e)}><Icon name="chevL" size={14} stroke={3} />Left cannon</Btn><Btn v="bear" size="sm" onClick={(e) => fire(1, e)}>Right cannon<Icon name="chevR" size={14} stroke={3} /></Btn></div>
    </AssetCard>
  );
}

/* ═════════ PTX-04 · Energy orb ═════════ */
function EnergyOrb() {
  const game = useGame();
  const [charge, setCharge] = useState(0);
  const chRef = useRef(0);
  const ptr = useRef<{ x: number; y: number; in: boolean }>({ x: -999, y: -999, in: false });
  const orbs = useRef<{ a: number; r: number; sp: number; s: number }[]>(Array.from({ length: 64 }, () => ({ a: Math.random() * 6.28, r: 30 + Math.random() * 55, sp: 0.004 + Math.random() * 0.012, s: 1.2 + Math.random() * 2 })));
  const rings = useRef<{ r: number; a: number }[]>([]);
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    const cx = w / 2, cy = h / 2;
    if (ptr.current.in) chRef.current = Math.min(100, chRef.current + dt * 0.045);
    else chRef.current = Math.max(0, chRef.current - dt * 0.02);
    const ch = chRef.current;
    if (ch >= 100) {
      chRef.current = 0; rings.current.push({ r: 20, a: 1 });
      feel("levelup", [20, 40, 80]); game.reward({ gems: 25, x: cx, y: cy });
      for (const o of orbs.current) o.r = 30 + Math.random() * 55;
    }
    /* core */
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 34 + ch * 0.3);
    grad.addColorStop(0, `rgba(255,255,255,${0.7 + ch * 0.003})`);
    grad.addColorStop(0.4, `rgba(92,225,255,${0.5 + ch * 0.004})`);
    grad.addColorStop(1, "rgba(61,139,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, 40 + ch * 0.4 + Math.sin(performance.now() * 0.004) * 3, 0, 7); ctx.fill();
    /* orbiting particles */
    for (const o of orbs.current) {
      o.a += o.sp * k * (1 + ch * 0.01);
      const px = cx + Math.cos(o.a) * o.r, py = cy + Math.sin(o.a) * o.r * 0.8;
      let dx = 0, dy = 0;
      if (ptr.current.in) { const d = Math.hypot(px - ptr.current.x, py - ptr.current.y); if (d < 90) { const f = (1 - d / 90) * 40; dx = ((px - ptr.current.x) / (d || 1)) * f; dy = ((py - ptr.current.y) / (d || 1)) * f; } }
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = ch > 60 ? "#ffc53d" : "#5ce1ff";
      ctx.beginPath(); ctx.arc(px + dx, py + dy, o.s, 0, 7); ctx.fill();
    }
    for (const rg of rings.current) { rg.r += 6 * k; rg.a -= 0.03 * k; if (rg.a > 0) { ctx.globalAlpha = rg.a; ctx.strokeStyle = "#ffc53d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, rg.r, 0, 7); ctx.stroke(); } }
    rings.current = rings.current.filter((r) => r.a > 0);
    ctx.globalAlpha = 1;
  });
  useRaf(() => { const c = Math.round(chRef.current); setCharge((o) => (o === c ? o : c)); });
  const onMove = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: true }; };
  return (
    <AssetCard id="PTX-04" title="Energy Orb" desc="Держи палец внутри — орб зарядится: частицы ускоряются, ядро растёт, в 100% — кольцо-вспышка и +25 💎. Курсор отталкивает орбиты." tags={["particles", "orb", "charge", "pointer"]}>
      <div className="relative">
        <canvas ref={cv} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => (ptr.current.in = false)} className="h-56 w-full touch-none rounded-2xl bg-ink-950/70" />
      </div>
      <div className="mt-3 flex items-center gap-3"><span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Charge</span><ProgressBar value={charge} color={charge > 70 ? "gold" : "sky"} h={12} className="flex-1" /><span className={cn("font-mono text-sm font-extrabold", charge > 70 ? "text-gold" : "text-sky")}>{charge}%</span></div>
    </AssetCard>
  );
}

/* ═════════ PTX-05 · Particle trail paint ═════════ */
function ParticleTrail() {
  const parts = useRef<P[]>([]);
  const ptr = useRef<{ x: number; y: number; vx: number; vy: number; in: boolean }>({ x: 0, y: 0, vx: 0, vy: 0, in: false });
  const [n, setN] = useState(0);
  const nRef = useRef(0);
  const cv = useCanvas((ctx, _w, _h, dt) => {
    const k = dt / 16.67;
    const p = ptr.current;
    if (p.in) {
      const sp = Math.hypot(p.vx, p.vy);
      const hue = 180 + Math.min(140, sp * 6);
      for (let i = 0; i < 2; i++) parts.current.push({ x: p.x + (Math.random() - 0.5) * 6, y: p.y + (Math.random() - 0.5) * 6, vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2, life: 0, max: 34 + Math.random() * 26, size: 1.5 + Math.min(4, sp * 0.4), c: `hsl(${hue} 90% 65%)` });
    }
    nRef.current = parts.current.length;
    setN((o) => (o === nRef.current ? o : nRef.current));
    ctx.globalCompositeOperation = "lighter";
    for (const q of parts.current) {
      q.life += k; q.x += q.vx * k; q.y += q.vy * k;
      if (q.life > q.max) continue;
      ctx.globalAlpha = (1 - q.life / q.max) * 0.9;
      ctx.fillStyle = q.c;
      ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (1 - q.life / q.max) + 0.3, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    parts.current = parts.current.filter((q) => q.life < q.max);
  });
  const onMove = (e: RPE<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    ptr.current = { x, y, vx: x - ptr.current.x, vy: y - ptr.current.y, in: true };
  };
  return (
    <AssetCard id="PTX-05" title="Particle Paint" desc="Рисуй пальцем: цвет следов зависит от скорости, частицы разлетаются и гаснут. Additive-сложение даёт неоновое свечение." tags={["particles", "trail", "paint", "neon"]}>
      <canvas ref={cv} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => (ptr.current.in = false)} className="h-56 w-full cursor-crosshair touch-none rounded-2xl bg-ink-950/70 grid-dots" />
      <div className="mt-2 flex justify-between"><span className="font-mono text-xs font-bold text-ink-300">live particles: <span className="text-sky">{n}</span></span><Btn v="ghost" size="sm" onClick={() => { parts.current = []; feel("whoosh"); }}>Clear</Btn></div>
    </AssetCard>
  );
}

/* ═════════ PTX-06 · Particle text ═════════ */
function ParticleText() {
  const pts = useRef<{ tx: number; ty: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const ptr = useRef<{ x: number; y: number; in: boolean }>({ x: -999, y: -999, in: false });
  const built = useRef(false);
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    const arr = pts.current;
    if (arr.length) {
      const s = Math.min(w / 640, h / 150);
      const ox = (w - 640 * s) / 2, oy = (h - 150 * s) / 2;
      for (const p of arr) {
        const tx = ox + p.tx * s, ty = oy + p.ty * s;
        p.vx += (tx - p.x) * 0.02 * k; p.vy += (ty - p.y) * 0.02 * k;
        if (ptr.current.in) { const d = Math.hypot(p.x - ptr.current.x, p.y - ptr.current.y); if (d < 80) { const f = (1 - d / 80) * 14; p.vx += ((p.x - ptr.current.x) / (d || 1)) * f * 0.4; p.vy += ((p.y - ptr.current.y) / (d || 1)) * f * 0.4; } }
        p.vx *= 0.86; p.vy *= 0.86;
        p.x += p.vx * k; p.y += p.vy * k;
        const heat = Math.min(1, Math.hypot(p.vx, p.vy) / 6);
        ctx.fillStyle = `hsl(${190 + heat * 130} 90% ${60 + heat * 25}%)`;
        ctx.fillRect(p.x, p.y, 2.4, 2.4);
      }
    }
  });
  useEffect(() => {
    const off = document.createElement("canvas");
    off.width = 640; off.height = 150;
    const g = off.getContext("2d");
    if (!g) return;
    g.fillStyle = "#fff"; g.font = "800 108px Manrope, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("HODL", 320, 80);
    const d = g.getImageData(0, 0, 640, 150).data;
    const out: { tx: number; ty: number; x: number; y: number; vx: number; vy: number }[] = [];
    for (let y = 0; y < 150; y += 4) for (let x = 0; x < 640; x += 4) if (d[(y * 640 + x) * 4] > 128) out.push({ tx: x, ty: y, x: Math.random() * 640, y: Math.random() * 150, vx: 0, vy: 0 });
    pts.current = out;
    built.current = true;
  }, []);
  const scatter = () => { for (const p of pts.current) { p.x = (Math.random() - 0.5) * 40; p.y = (Math.random() - 0.5) * 200; p.vx = (Math.random() - 0.5) * 30; p.vy = (Math.random() - 0.5) * 30; } feel("whoosh"); sfx.play("combo"); };
  const onMove = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: true }; };
  return (
    <AssetCard id="PTX-06" title="Particle Text" desc="Слово из ~800 частиц: каждая летит к своей точке сетки букв. Курсор выталкивает частицы, кнопка Scatter взрывает слово, они сами собираются обратно." tags={["particles", "text", "morph", "pointer"]}>
      <canvas ref={cv} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => (ptr.current.in = false)} className="h-56 w-full touch-none rounded-2xl bg-ink-950/70" />
      <div className="mt-2 flex justify-between"><span className="text-[11px] font-bold text-ink-400">Weave through the letters</span><Btn v="gold" size="sm" onClick={scatter}><Icon name="sparkles" size={14} />Scatter</Btn></div>
      {!built.current && <span className="sr-only">building</span>}
    </AssetCard>
  );
}

export default function Particles() {
  return (
    <Section id="particles" num="18" title="Particles & Canvas" subtitle="Своя canvas-система: пламя, фейерверки, конфетти, энергия, неон-краска, частицы-текст">
      <FireButton />
      <Fireworks />
      <ConfettiCannon />
      <EnergyOrb />
      <ParticleTrail />
      <ParticleText />
    </Section>
  );
}
