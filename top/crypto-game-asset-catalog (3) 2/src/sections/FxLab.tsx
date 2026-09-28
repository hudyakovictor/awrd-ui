import { useRef, useState } from "react";
import { AssetCard, Btn, Icon, Label, Section } from "../ui/kit";
import { useCanvas, pointerPos } from "../ui/canvas";
import { clamp } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { cn } from "../utils/cn";

const PAL = ["#2ee59d", "#3d8bff", "#ffc53d", "#ff4d6a", "#a174ff", "#5ce1ff", "#ff8a3d"];

/* ═════════ FX-01 · Particle Fountain ═════════ */
type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; r: number };
function Fountain() {
  const [gravity, setGravity] = useState(true);
  const parts = useRef<P[]>([]);
  const emit = useRef<{ x: number; y: number } | null>(null);
  const gRef = useRef(true); gRef.current = gravity;
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.28)"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "lighter";
    const src = emit.current ?? { x: w / 2, y: h - 20 };
    const n = emit.current ? 6 : 3;
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9; const sp = 0.2 + Math.random() * 0.35; parts.current.push({ x: src.x, y: src.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 700 + Math.random() * 700, c: PAL[Math.floor(Math.random() * PAL.length)], r: 2 + Math.random() * 3 }); }
    for (let i = parts.current.length - 1; i >= 0; i--) { const p = parts.current[i]; p.life += dt; if (p.life > p.max) { parts.current.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; if (gRef.current) p.vy += 0.0011 * dt; p.vx *= 0.999;
      const t = 1 - p.life / p.max; g.globalAlpha = t; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r * t, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    if (parts.current.length > 900) parts.current.splice(0, parts.current.length - 900);
  }, true);
  const set = (cx: number, cy: number) => { if (cvRef.current) emit.current = pointerPos(cvRef.current, cx, cy); };
  return (
    <AssetCard id="FX-01" title="Particle Fountain" desc="Аддитивные частицы с гравитацией и затуханием, эмиттер следует за пальцем. До 900 частиц в кадре, свечение через lighter-композитинг." tags={["fx", "particles", "canvas", "additive"]}>
      <canvas ref={cvRef} onPointerDown={(e) => { set(e.clientX, e.clientY); feel("whoosh", 6); }} onPointerMove={(e) => e.buttons && set(e.clientX, e.clientY)} onPointerUp={() => (emit.current = null)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <div className="mt-3 flex items-center justify-between"><Label className="mb-0">Держи и веди по полю</Label><button onClick={() => setGravity(!gravity)} className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase", gravity ? "bg-sky text-white" : "bg-ink-800 text-ink-400")}>gravity {gravity ? "on" : "off"}</button></div>
    </AssetCard>
  );
}

/* ═════════ FX-02 · Fireworks ═════════ */
type Rocket = { x: number; y: number; vy: number; tx: number; c: string };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; c: string };
function Fireworks() {
  const rockets = useRef<Rocket[]>([]);
  const sparks = useRef<Spark[]>([]);
  const auto = useRef(0);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.22)"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "lighter";
    auto.current -= dt; if (auto.current <= 0) { auto.current = 1400; launch(Math.random() * w, 40 + Math.random() * (h * 0.4)); }
    for (let i = rockets.current.length - 1; i >= 0; i--) { const r = rockets.current[i]; r.y += r.vy * dt; r.vy += 0.0009 * dt; g.fillStyle = r.c; g.beginPath(); g.arc(r.x, r.y, 3, 0, Math.PI * 2); g.fill();
      if (r.y <= r.tx || r.vy >= 0) { rockets.current.splice(i, 1); burst(r.x, r.y, r.c); } }
    for (let i = sparks.current.length - 1; i >= 0; i--) { const s = sparks.current[i]; s.life -= dt; if (s.life <= 0) { sparks.current.splice(i, 1); continue; } s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 0.0006 * dt; s.vx *= 0.985; s.vy *= 0.985; g.globalAlpha = clamp(s.life / 900, 0, 1); g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, 2.2, 0, Math.PI * 2); g.fill(); }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
  }, true);
  const launch = (x: number, ty: number) => { rockets.current.push({ x, y: 999, tx: ty, vy: -0.55 - Math.random() * 0.15, c: PAL[Math.floor(Math.random() * PAL.length)] }); rockets.current[rockets.current.length - 1].y = 0; rockets.current[rockets.current.length - 1].y = (cvRef.current?.clientHeight ?? 300); sfx.play("whoosh"); };
  const burst = (x: number, y: number, c: string) => { const n = 40; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const sp = 0.12 + Math.random() * 0.22; sparks.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 700 + Math.random() * 500, c: Math.random() > 0.7 ? "#fff" : c }); } sfx.play("pop"); };
  return (
    <AssetCard id="FX-02" title="Fireworks" desc="Тап запускает ракету, которая взрывается кольцом искр с гравитацией и трением. Автосалют в фоне. Мотивационный экран после победы." tags={["fx", "fireworks", "canvas", "celebration"]}>
      <canvas ref={cvRef} onPointerDown={(e) => { if (cvRef.current) { const p = pointerPos(cvRef.current, e.clientX, e.clientY); launch(p.x, p.y); } }} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <Label className="mt-3 mb-0 text-center">Тапни в любое место — запуск ракеты</Label>
    </AssetCard>
  );
}

/* ═════════ FX-03 · Ticker Matrix ═════════ */
const GLYPHS = "₿ΞSOLTON$0123456789▲▼".split("");
function MatrixRain() {
  const cols = useRef<{ y: number; speed: number; chars: string[] }[]>([]);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.16)"; g.fillRect(0, 0, w, h);
    const fs = 15, n = Math.floor(w / fs);
    if (cols.current.length !== n) cols.current = Array.from({ length: n }, () => ({ y: Math.random() * h, speed: 0.03 + Math.random() * 0.06, chars: Array.from({ length: 20 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]) }));
    g.font = `700 ${fs}px JetBrains Mono`;
    cols.current.forEach((c, i) => {
      c.y += c.speed * dt * fs;
      if (c.y > h + 20 * fs) { c.y = -Math.random() * h; c.chars = c.chars.map(() => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]); }
      for (let k = 0; k < c.chars.length; k++) { const y = c.y - k * fs; if (y < 0 || y > h) continue; const head = k === 0; g.fillStyle = head ? "#eafff5" : `rgba(46,229,157,${clamp(1 - k / c.chars.length, 0, 1)})`; if (Math.random() > 0.98) c.chars[k] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; g.fillText(c.chars[k], i * fs + 2, y); }
    });
  }, true);
  return (
    <AssetCard id="FX-03" title="Ticker Matrix Rain" desc="Матрица из крипто-глифов: колонки падают с разной скоростью, голова символа светится, хвост угасает. Каноничный «денежный дождь»." tags={["fx", "matrix", "canvas", "text"]}>
      <canvas ref={cvRef} className="well aspect-[4/3] w-full rounded-2xl" />
      <Label className="mt-3 mb-0 text-center">Процедурный дождь ₿ Ξ SOL $</Label>
    </AssetCard>
  );
}

/* ═════════ FX-04 · Gooey Metaballs ═════════ */
function Metaballs() {
  const balls = useRef(Array.from({ length: 7 }, (_, i) => ({ x: 0.5, y: 0.5, vx: (Math.random() - 0.5) * 0.08, vy: (Math.random() - 0.5) * 0.08, r: 22 + i * 5, c: PAL[i % PAL.length] })));
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.clearRect(0, 0, w, h); g.fillStyle = "#081130"; g.fillRect(0, 0, w, h);
    balls.current.forEach((b, i) => {
      if (i === 0 && mouse.current) { b.x = mouse.current.x; b.y = mouse.current.y; }
      else { b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < b.r || b.x > w - b.r) b.vx *= -1; if (b.y < b.r || b.y > h - b.r) b.vy *= -1; b.x = clamp(b.x, b.r, w - b.r); b.y = clamp(b.y, b.r, h - b.r); }
    });
    g.filter = "blur(12px)"; g.globalCompositeOperation = "lighter";
    balls.current.forEach((b) => { const rg = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2.2); rg.addColorStop(0, b.c); rg.addColorStop(1, "transparent"); g.fillStyle = rg; g.beginPath(); g.arc(b.x, b.y, b.r * 2.2, 0, Math.PI * 2); g.fill(); });
    g.filter = "none"; g.globalCompositeOperation = "source-over";
  }, true);
  const set = (cx: number, cy: number) => { if (cvRef.current) mouse.current = pointerPos(cvRef.current, cx, cy); };
  return (
    <AssetCard id="FX-04" title="Gooey Metaballs" desc="Метаболы сливаются в «лаву» через blur + additive: одна капля привязана к пальцу, остальные летают и отражаются от стенок." tags={["fx", "metaballs", "canvas", "blur"]}>
      <canvas ref={cvRef} onPointerMove={(e) => set(e.clientX, e.clientY)} onPointerDown={(e) => set(e.clientX, e.clientY)} onPointerLeave={() => (mouse.current = null)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <Label className="mt-3 mb-0 text-center">Веди пальцем — управляешь каплей</Label>
    </AssetCard>
  );
}

/* ═════════ FX-05 · Vector Field ═════════ */
function VectorField() {
  const attract = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<"attract" | "repel">("attract");
  const mRef = useRef(mode); mRef.current = mode;
  const dots = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.2)"; g.fillRect(0, 0, w, h);
    if (dots.current.length === 0) dots.current = Array.from({ length: 140 }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0 }));
    const a = attract.current;
    g.globalCompositeOperation = "lighter";
    for (const d of dots.current) {
      if (a) { const dx = a.x - d.x, dy = a.y - d.y; const dist = Math.hypot(dx, dy) + 20; const f = (mRef.current === "attract" ? 1 : -1) * 40 / (dist * dist); d.vx += dx * f * dt; d.vy += dy * f * dt; }
      d.vx *= 0.94; d.vy *= 0.94; d.x += d.vx * dt; d.y += d.vy * dt;
      if (d.x < 0) d.x += w; if (d.x > w) d.x -= w; if (d.y < 0) d.y += h; if (d.y > h) d.y -= h;
      const sp = Math.hypot(d.vx, d.vy); g.strokeStyle = `hsla(${160 + sp * 900}, 80%, 60%, .8)`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x - d.vx * 40, d.y - d.vy * 40); g.stroke();
    }
    g.globalCompositeOperation = "source-over";
    if (a) { g.fillStyle = mRef.current === "attract" ? "#2ee59d" : "#ff4d6a"; g.beginPath(); g.arc(a.x, a.y, 6, 0, Math.PI * 2); g.fill(); }
  }, true);
  const set = (cx: number, cy: number) => { if (cvRef.current) attract.current = pointerPos(cvRef.current, cx, cy); };
  return (
    <AssetCard id="FX-05" title="Vector Field · Attractor" desc="140 частиц-стрелок реагируют на гравитацию к пальцу (притяжение/отталкивание по закону обратных квадратов). Цвет линии — по скорости." tags={["fx", "field", "physics", "canvas"]}>
      <canvas ref={cvRef} onPointerDown={(e) => set(e.clientX, e.clientY)} onPointerMove={(e) => e.buttons && set(e.clientX, e.clientY)} onPointerUp={() => (attract.current = null)} onPointerLeave={() => (attract.current = null)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <div className="mt-3 flex items-center justify-between"><Label className="mb-0">Держи, чтобы создать центр</Label><button onClick={() => { setMode(mode === "attract" ? "repel" : "attract"); feel("tap"); }} className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold uppercase", mode === "attract" ? "bg-bull text-ink-900" : "bg-bear text-white")}>{mode}</button></div>
    </AssetCard>
  );
}

/* ═════════ FX-06 · Ribbon Trail ═════════ */
function RibbonTrail() {
  const pts = useRef<{ x: number; y: number }[]>([]);
  const target = useRef<{ x: number; y: number } | null>(null);
  const hue = useRef(0);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.25)"; g.fillRect(0, 0, w, h);
    const t = target.current ?? { x: w / 2 + Math.cos(performance.now() / 700) * w * 0.3, y: h / 2 + Math.sin(performance.now() / 500) * h * 0.3 };
    const head = pts.current[0] ?? t;
    pts.current.unshift({ x: head.x + (t.x - head.x) * 0.35, y: head.y + (t.y - head.y) * 0.35 });
    if (pts.current.length > 40) pts.current.pop();
    hue.current = (hue.current + dt * 0.06) % 360;
    g.lineCap = "round"; g.lineJoin = "round"; g.globalCompositeOperation = "lighter";
    for (let i = pts.current.length - 1; i > 0; i--) { const a = pts.current[i], b = pts.current[i - 1]; const t2 = 1 - i / pts.current.length; g.strokeStyle = `hsla(${(hue.current + i * 6) % 360}, 90%, 62%, ${t2})`; g.lineWidth = t2 * 16 + 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
    g.globalCompositeOperation = "source-over";
    const hd = pts.current[0]; if (hd) { g.fillStyle = "#fff"; g.beginPath(); g.arc(hd.x, hd.y, 5, 0, Math.PI * 2); g.fill(); }
  }, true);
  const set = (cx: number, cy: number) => { if (cvRef.current) target.current = pointerPos(cvRef.current, cx, cy); };
  return (
    <AssetCard id="FX-06" title="Ribbon Trail" desc="Радужная лента следует за курсором с инерцией (сглаживание позиции), толщина и цвет по возрасту сегмента. Без пальца — рисует фигуру Лиссажу." tags={["fx", "trail", "cursor", "canvas"]}>
      <canvas ref={cvRef} onPointerMove={(e) => set(e.clientX, e.clientY)} onPointerDown={(e) => set(e.clientX, e.clientY)} onPointerLeave={() => (target.current = null)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <Label className="mt-3 mb-0 text-center">Веди курсором за лентой</Label>
    </AssetCard>
  );
}

/* ═════════ FX-07 · Starfield Warp ═════════ */
function Starfield() {
  const stars = useRef<{ x: number; y: number; z: number }[]>([]);
  const speed = useRef(0.4);
  const steer = useRef({ x: 0, y: 0 });
  const [warp, setWarp] = useState(false);
  const wRef = useRef(false); wRef.current = warp;
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.4)"; g.fillRect(0, 0, w, h);
    if (stars.current.length === 0) stars.current = Array.from({ length: 260 }, () => ({ x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: Math.random() * w }));
    const cx = w / 2 + steer.current.x, cy = h / 2 + steer.current.y;
    const sp = (wRef.current ? 2.4 : 1) * speed.current;
    g.globalCompositeOperation = "lighter";
    for (const s of stars.current) {
      const pz = s.z; s.z -= sp * dt; if (s.z < 1) { s.z = w; s.x = (Math.random() - 0.5) * w; s.y = (Math.random() - 0.5) * h; continue; }
      const k = 128 / s.z, px = cx + s.x * k, py = cy + s.y * k;
      const pk = 128 / pz, ppx = cx + s.x * pk, ppy = cy + s.y * pk;
      const t = 1 - s.z / w; g.strokeStyle = `rgba(${140 + t * 115},${200 + t * 55},255,${t})`; g.lineWidth = t * 2.2; g.beginPath(); g.moveTo(ppx, ppy); g.lineTo(px, py); g.stroke();
    }
    g.globalCompositeOperation = "source-over";
  }, true);
  const steerTo = (cx: number, cy: number) => { if (!cvRef.current) return; const p = pointerPos(cvRef.current, cx, cy); steer.current = { x: (p.x - cvRef.current.clientWidth / 2) * 0.4, y: (p.y - cvRef.current.clientHeight / 2) * 0.4 }; };
  return (
    <AssetCard id="FX-07" title="Starfield Warp" desc="Полёт сквозь звёзды с перспективной проекцией: веди курсором, чтобы менять курс, удержание — гиперпрыжок (растяжение линий скорости)." tags={["fx", "starfield", "3d", "canvas"]}>
      <canvas ref={cvRef} onPointerMove={(e) => steerTo(e.clientX, e.clientY)} onPointerDown={() => { setWarp(true); feel("whoosh", 10); }} onPointerUp={() => setWarp(false)} onPointerLeave={() => setWarp(false)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <div className="mt-3 flex items-center justify-between"><Label className="mb-0">Удержи = warp</Label><span className={cn("font-mono text-[11px] font-extrabold", warp ? "text-sky" : "text-ink-400")}>{warp ? "HYPERSPACE" : "cruise"}</span></div>
    </AssetCard>
  );
}

/* ═════════ FX-08 · Ripple Water ═════════ */
type Ring = { x: number; y: number; r: number; life: number; c: string };
function RippleWater() {
  const rings = useRef<Ring[]>([]);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.14)"; g.fillRect(0, 0, w, h);
    for (let i = rings.current.length - 1; i >= 0; i--) { const r = rings.current[i]; r.r += 0.14 * dt; r.life -= dt; if (r.life <= 0) { rings.current.splice(i, 1); continue; }
      const t = clamp(r.life / 1400, 0, 1); g.strokeStyle = r.c; g.globalAlpha = t * 0.8; g.lineWidth = 2 + t * 2; g.beginPath(); g.arc(r.x, r.y, r.r, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = t * 0.4; g.lineWidth = 1; g.beginPath(); g.arc(r.x, r.y, r.r * 0.6, 0, Math.PI * 2); g.stroke();
    }
    g.globalAlpha = 1;
  }, true);
  const drop = (cx: number, cy: number) => { if (!cvRef.current) return; const p = pointerPos(cvRef.current, cx, cy); rings.current.push({ x: p.x, y: p.y, r: 0, life: 1400, c: PAL[Math.floor(Math.random() * PAL.length)] }); sfx.play("tick"); };
  return (
    <AssetCard id="FX-08" title="Ripple Water" desc="Каждый тап рождает расходящиеся кольца-волны с затуханием и вторичным контуром. Веди пальцем — оставляешь дорожку ряби." tags={["fx", "ripple", "waves", "canvas"]}>
      <canvas ref={cvRef} onPointerDown={(e) => drop(e.clientX, e.clientY)} onPointerMove={(e) => e.buttons && Math.random() > 0.5 && drop(e.clientX, e.clientY)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <Label className="mt-3 mb-0 text-center">Тапай по воде</Label>
    </AssetCard>
  );
}

/* ═════════ FX-09 · Gravity Orbits ═════════ */
type Body = { x: number; y: number; vx: number; vy: number; m: number; c: string; trail: { x: number; y: number }[] };
function Orbits() {
  const bodies = useRef<Body[]>([]);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.fillStyle = "rgba(8,17,48,.3)"; g.fillRect(0, 0, w, h);
    if (bodies.current.length === 0) { const cx = w / 2, cy = h / 2; bodies.current = [{ x: cx, y: cy, vx: 0, vy: 0, m: 2600, c: "#ffc53d", trail: [] }, ...Array.from({ length: 4 }, (_, i) => { const r = 50 + i * 26; const v = Math.sqrt(2600 * 0.00001 / r) * 1; return { x: cx + r, y: cy, vx: 0, vy: v, m: 8, c: PAL[i % PAL.length], trail: [] as { x: number; y: number }[] }; })]; }
    const sun = bodies.current[0];
    for (let i = 1; i < bodies.current.length; i++) { const b = bodies.current[i]; const dx = sun.x - b.x, dy = sun.y - b.y; const d = Math.hypot(dx, dy) + 8; const f = (sun.m * 0.00001) / (d * d); b.vx += (dx / d) * f * dt; b.vy += (dy / d) * f * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.trail.unshift({ x: b.x, y: b.y }); if (b.trail.length > 60) b.trail.pop(); }
    g.globalCompositeOperation = "lighter";
    for (let i = 1; i < bodies.current.length; i++) { const b = bodies.current[i]; for (let k = 1; k < b.trail.length; k++) { const t = 1 - k / b.trail.length; g.strokeStyle = b.c; g.globalAlpha = t * 0.5; g.lineWidth = t * 2.5; g.beginPath(); g.moveTo(b.trail[k - 1].x, b.trail[k - 1].y); g.lineTo(b.trail[k].x, b.trail[k].y); g.stroke(); } }
    g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    const sg = g.createRadialGradient(sun.x, sun.y, 2, sun.x, sun.y, 26); sg.addColorStop(0, "#fff6d8"); sg.addColorStop(0.4, "#ffc53d"); sg.addColorStop(1, "transparent"); g.fillStyle = sg; g.beginPath(); g.arc(sun.x, sun.y, 26, 0, Math.PI * 2); g.fill();
    for (let i = 1; i < bodies.current.length; i++) { const b = bodies.current[i]; g.fillStyle = b.c; g.beginPath(); g.arc(b.x, b.y, 5, 0, Math.PI * 2); g.fill(); }
  }, true);
  const add = (cx: number, cy: number) => { if (!cvRef.current) return; const p = pointerPos(cvRef.current, cx, cy); const sun = bodies.current[0]; const dx = p.x - sun.x, dy = p.y - sun.y; const d = Math.hypot(dx, dy) + 8; const v = Math.sqrt(sun.m * 0.00001 / d); bodies.current.push({ x: p.x, y: p.y, vx: (-dy / d) * v, vy: (dx / d) * v, m: 6, c: PAL[Math.floor(Math.random() * PAL.length)], trail: [] }); sfx.play("pop"); };
  return (
    <AssetCard id="FX-09" title="Gravity Orbits" desc="Симуляция N-тел: планеты вращаются вокруг «солнца» по закону тяготения, оставляя светящиеся орбитальные хвосты. Тап добавляет тело на круговой скорости." tags={["fx", "gravity", "orbits", "simulation"]}>
      <canvas ref={cvRef} onPointerDown={(e) => add(e.clientX, e.clientY)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <div className="mt-3 flex items-center justify-between"><Label className="mb-0">Тап = новая планета</Label><button onClick={() => { bodies.current = []; feel("whoosh"); }} className="rounded-lg bg-ink-800 px-3 py-1.5 text-[11px] font-extrabold uppercase text-ink-300">reset</button></div>
    </AssetCard>
  );
}

/* ═════════ FX-10 · Confetti Cannon ═════════ */
type Conf = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; c: string; w: number; h: number; life: number };
function ConfettiCannon() {
  const confs = useRef<Conf[]>([]);
  const [count, setCount] = useState(0);
  const cvRef = useCanvas((g, w, h, dt) => {
    g.clearRect(0, 0, w, h); g.fillStyle = "#081130"; g.fillRect(0, 0, w, h);
    for (let i = confs.current.length - 1; i >= 0; i--) { const c = confs.current[i]; c.life -= dt; if (c.life <= 0 || c.y > h + 30) { confs.current.splice(i, 1); continue; } c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 0.0009 * dt; c.vx *= 0.995; c.rot += c.vr * dt;
      g.save(); g.translate(c.x, c.y); g.rotate(c.rot); g.fillStyle = c.c; g.globalAlpha = clamp(c.life / 600, 0, 1); const sc = Math.abs(Math.cos(c.rot)); g.fillRect(-c.w / 2, -c.h / 2, c.w * sc + 1, c.h); g.restore();
    }
    g.globalAlpha = 1;
    setCount(confs.current.length);
  }, true);
  const fire = (cx?: number, cy?: number) => {
    if (!cvRef.current) return; const w = cvRef.current.clientWidth, h = cvRef.current.clientHeight;
    const ox = cx !== undefined ? pointerPos(cvRef.current, cx, cy!).x : w / 2, oy = cy !== undefined ? pointerPos(cvRef.current, cx!, cy).y : h - 10;
    for (let i = 0; i < 90; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.1; const sp = 0.3 + Math.random() * 0.5; confs.current.push({ x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.02, c: PAL[Math.floor(Math.random() * PAL.length)], w: 5 + Math.random() * 5, h: 8 + Math.random() * 6, life: 1400 + Math.random() * 800 }); }
    feel("combo", [10, 20, 10]);
  };
  return (
    <AssetCard id="FX-10" title="Confetti Cannon" desc="Пушка конфетти: тап стреляет из точки касания, каждая бумажка вращается в 3D (масштаб по косинусу угла) и падает с гравитацией. Готовый эффект победы." tags={["fx", "confetti", "canvas", "reward"]}>
      <canvas ref={cvRef} onPointerDown={(e) => fire(e.clientX, e.clientY)} className="well aspect-[4/3] w-full touch-none rounded-2xl" />
      <div className="mt-3 flex items-center gap-2"><Btn v="gold" size="sm" block onClick={() => fire()}><Icon name="gift" size={14} />Fire!</Btn><span className="font-mono text-[11px] font-bold text-ink-400">{count} pcs</span></div>
    </AssetCard>
  );
}

export default function FxLab() {
  return (
    <Section id="fxlab" num="19" title="FX Lab" subtitle="Интерактивные canvas-эффекты: фонтан частиц, фейерверк, матрица, метаболы, векторное поле, лента, звёздный варп, рябь, орбиты, конфетти">
      <Fountain />
      <Fireworks />
      <MatrixRain />
      <Metaballs />
      <VectorField />
      <RibbonTrail />
      <Starfield />
      <RippleWater />
      <Orbits />
      <ConfettiCannon />
    </Section>
  );
}
