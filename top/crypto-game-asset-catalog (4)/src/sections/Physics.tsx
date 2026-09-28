import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { AssetCard, Icon, Section, useBump } from "../ui/kit";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ───── shared canvas runner ───── */
type DrawCb = (ctx: CanvasRenderingContext2D, w: number, h: number, dt: number) => void;
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
    const loop = (t: number) => { const dt = Math.min(50, t - last); last = t; ctx.clearRect(0, 0, w, h); cbRef.current(ctx, w, h, dt); raf = requestAnimationFrame(loop); };
    if (active) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [active]);
  return ref;
}

/* ═════════ PHY-01 · Verlet rope with coin ═════════ */
function VerletRope() {
  const pts = useRef({ x: [0, 0, 0, 0, 0, 0, 0, 0, 0], y: [0, 0, 0, 0, 0, 0, 0, 0, 0], px: [0, 0, 0, 0, 0, 0, 0, 0, 0], py: [0, 0, 0, 0, 0, 0, 0, 0, 0] });
  const inited = useRef(false);
  const grab = useRef(-1);
  const mouse = useRef({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const cv = useCanvas((ctx, w, _h, dt) => {
    const k = dt / 16.67;
    const P = pts.current;
    if (!inited.current) {
      for (let i = 0; i < 9; i++) { P.x[i] = w * 0.3 + i * (w * 0.4 / 8); P.y[i] = 26 + i * 6; P.px[i] = P.x[i]; P.py[i] = P.y[i]; }
      inited.current = true;
    }
    for (let i = 1; i < 9; i++) {
      const vx = (P.x[i] - P.px[i]) * 0.995, vy = (P.y[i] - P.py[i]) * 0.995;
      P.px[i] = P.x[i]; P.py[i] = P.y[i];
      P.x[i] += vx; P.y[i] += vy + 0.22 * k * k;
    }
    if (grab.current >= 1) { P.x[grab.current] = mouse.current.x; P.y[grab.current] = mouse.current.y; }
    P.x[0] = w * 0.3; P.y[0] = 26;
    for (let it = 0; it < 5; it++) {
      for (let i = 0; i < 8; i++) {
        const dx = P.x[i + 1] - P.x[i], dy = P.y[i + 1] - P.y[i];
        const d = Math.hypot(dx, dy) || 1;
        const seg = (w * 0.4) / 8;
        const diff = ((d - seg) / d) * 0.5;
        if (i !== 0) { P.x[i] += dx * diff; P.y[i] += dy * diff; }
        if (i + 1 !== grab.current) { P.x[i + 1] -= dx * diff; P.y[i + 1] -= dy * diff; }
      }
    }
    ctx.strokeStyle = "#5a70ad"; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(P.x[0], P.y[0]);
    for (let i = 1; i < 9; i++) ctx.lineTo(P.x[i], P.y[i]);
    ctx.stroke();
    ctx.fillStyle = "#22376f"; ctx.beginPath(); ctx.arc(P.x[0], P.y[0], 6, 0, 7); ctx.fill();
    const cx = P.x[8], cy = P.y[8] + 18;
    const ang = Math.atan2(P.y[8] - P.y[6], P.x[8] - P.x[6]);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang * 0.4);
    const grad = ctx.createRadialGradient(-4, -5, 2, 0, 0, 18);
    grad.addColorStop(0, "#ffe9a8"); grad.addColorStop(1, "#e09a10");
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 7); ctx.fill();
    ctx.strokeStyle = "#a86d00"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#7a4a00"; ctx.font = "800 16px JetBrains Mono"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("$", 0, 1);
    ctx.restore();
  });
  const onDown = (e: RPE<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    let best = -1, bd = 26;
    for (let i = 1; i < 9; i++) { const d = Math.hypot(pts.current.x[i] - mx, pts.current.y[i] - my); if (d < bd) { bd = d; best = i; } }
    grab.current = best; setGrabbing(best >= 0);
    if (best >= 0) feel("tap", 6);
  };
  const onMove = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onUp = () => { grab.current = -1; setGrabbing(false); };
  return (
    <AssetCard id="PHY-01" title="Verlet Rope & Coin" desc="Струна на 9 точек метода верле с 5 итерациями ограничений: тяни любую точку, монета в конце качается и вращается." tags={["physics", "verlet", "rope", "drag"]}>
      <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp} className={cn("h-56 w-full touch-none rounded-2xl bg-ink-950/70", grabbing ? "cursor-grabbing" : "cursor-grab")} />
      <div className="mt-2 flex justify-between text-[11px] font-bold text-ink-400"><span>{grabbing ? "pulling…" : "drag a point on the rope"}</span><span className="font-mono">9 pts · 5 iters</span></div>
    </AssetCard>
  );
}

/* ═════════ PHY-02 · Spring net ═════════ */

function SpringNet() {
  const cols = 11, rows = 6;
  const net = useRef<{ x: number; y: number; vx: number; vy: number; hx: number; hy: number }[]>([]);
  const inited = useRef(false);
  const ptr = useRef({ x: -999, y: -999, in: false });
  const [energy, setEnergy] = useState(0);
  const enRef = useRef(0);
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    if (!inited.current) {
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const hx = 24 + (x / (cols - 1)) * (w - 48), hy = 22 + (y / (rows - 1)) * (h - 44);
        net.current.push({ x: hx, y: hy, vx: 0, vy: 0, hx, hy });
      }
      inited.current = true;
    }
    const N = net.current;
    let en = 0;
    for (const p of N) {
      p.vx += (p.hx - p.x) * 0.045 * k;
      p.vy += (p.hy - p.y) * 0.045 * k;
      if (ptr.current.in) { const d = Math.hypot(p.x - ptr.current.x, p.y - ptr.current.y); if (d < 80) { const f = (1 - d / 80) * 2.4 * k; p.vx += ((p.x - ptr.current.x) / (d || 1)) * f; p.vy += ((p.y - ptr.current.y) / (d || 1)) * f; } }
      p.vx *= 0.9; p.vy *= 0.9;
      p.x += p.vx * k; p.y += p.vy * k;
      en += Math.abs(p.vx) + Math.abs(p.vy);
    }
    enRef.current = en;
    setEnergy((o) => (Math.round(en) === o ? o : Math.round(en)));
    ctx.strokeStyle = "#3d8bff55"; ctx.lineWidth = 1;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const p = N[y * cols + x];
      if (x < cols - 1) { const q = N[y * cols + x + 1]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      if (y < rows - 1) { const q = N[(y + 1) * cols + x]; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    }
    for (const p of N) { const sp = Math.hypot(p.vx, p.vy); ctx.fillStyle = sp > 0.6 ? `hsl(${190 + sp * 40} 90% 65%)` : "#5a70ad"; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fill(); }
  });
  const onMove = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: true }; };
  return (
    <AssetCard id="PHY-02" title="Spring Net" desc="Сетка 11×6 на пружинах к «родным» позициям: курсор продавливает поле, точки раскаляются от скорости, энергия меряется в реальном времени." tags={["physics", "springs", "net", "pointer"]}>
      <canvas ref={cv} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => (ptr.current.in = false)} className="h-56 w-full touch-none rounded-2xl bg-ink-950/70" />
      <div className="mt-2 flex justify-between font-mono text-xs font-bold text-ink-300"><span>energy <span className="text-sky">{energy}</span></span><span>move to push</span></div>
    </AssetCard>
  );
}

/* ═════════ PHY-03 · Risk / Reward pendulum ═════════ */

function Pendulum() {
  const st = useRef({ a: 0.9, v: 0, drag: false, trace: [] as number[] });
  const [deg, setDeg] = useState(0);
  const [damp, setDamp] = useState(0.995);
  const ptr = useRef({ x: 0, y: 0, in: false });
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    const s = st.current;
    const cx = w / 2, cy = 26, L = Math.min(h - 70, 150);
    if (!s.drag) { s.v += -Math.sin(s.a) * 0.0055 * k * k; s.v *= damp; s.a += s.v * k; }
    if (ptr.current.in && s.drag) { s.a = Math.atan2(ptr.current.x - cx, ptr.current.y - cy); s.v = 0; }
    s.trace.push(s.a);
    if (s.trace.length > 90) s.trace.shift();
    setDeg((o) => { const d = Math.round((s.a * 180) / Math.PI); return o === d ? o : d; });
    ctx.strokeStyle = "#22376f"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy + L, L, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    for (let i = 0; i < 11; i++) { const a = Math.PI * (1.15 + (i / 10) * 0.7); ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (L - 5), cy + Math.sin(a) * (L - 5)); ctx.lineTo(cx + Math.cos(a) * (L + 5), cy + Math.sin(a) * (L + 5)); ctx.stroke(); }
    ctx.strokeStyle = "#5a70ad"; ctx.lineWidth = 1; ctx.beginPath();
    s.trace.forEach((a, i) => { const x = cx + Math.sin(a) * L, y = cy + Math.cos(a) * L; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.stroke();
    const bx = cx + Math.sin(s.a) * L, by = cy + Math.cos(s.a) * L;
    ctx.strokeStyle = "#8fa0cf"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
    ctx.fillStyle = "#22376f"; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, 7); ctx.fill();
    const bw = 120;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(s.a);
    const gradL = ctx.createLinearGradient(-bw / 2, -14, -bw / 2, 10);
    gradL.addColorStop(0, "#ff8a9e"); gradL.addColorStop(1, "#c21f43");
    ctx.fillStyle = gradL; ctx.fillRect(-bw / 2, -14, bw / 2 - 4, 24);
    const gradR = ctx.createLinearGradient(4, -14, bw / 2, 10);
    gradR.addColorStop(0, "#7dffcf"); gradR.addColorStop(1, "#12a46a");
    ctx.fillStyle = gradR; ctx.fillRect(4, -14, bw / 2 - 4, 24);
    ctx.fillStyle = "#fff"; ctx.font = "800 10px Manrope"; ctx.textAlign = "center";
    ctx.fillText("RISK", -bw / 4, 2); ctx.fillText("P&L", bw / 4, 2);
    ctx.restore();
  });
  const onDown = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: true }; st.current.drag = true; feel("tap", 6); };
  const onMove = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: true }; };
  const onUp = () => { st.current.drag = false; ptr.current.in = false; };
  return (
    <AssetCard id="PHY-03" title="Risk / Reward Pendulum" desc="Маятник-весы: тяни чашу и отпускай — качается с затуханием и оставляет след траектории. Управляй демпфированием." tags={["physics", "pendulum", "balance", "drag"]}>
      <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp} className="h-60 w-full touch-none cursor-grab rounded-2xl bg-ink-950/70 active:cursor-grabbing" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-extrabold text-ink-200">{deg > 0 ? "risk " : "p&l "}{Math.abs(deg)}°</span>
        <div className="flex flex-1 items-center gap-2"><span className="text-[10px] font-extrabold uppercase text-ink-400">damping</span>
          <input type="range" min={970} max={999} value={Math.round(damp * 1000)} onChange={(e) => setDamp(+e.target.value / 1000)} className="range-reset flex-1" aria-label="damping" />
          <span className="font-mono text-[10px] font-bold text-ink-300">{damp.toFixed(3)}</span>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ PHY-04 · Bounce coins ═════════ */
function BounceCoins() {
  const balls = useRef<{ x: number; y: number; vx: number; vy: number; r: number; c: string }[]>([]);
  const inited = useRef(false);
  const [hits, setHits] = useState(0);
  const [, bump] = useBump();
  const game = useGame();
  const grab = useRef(-1);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    if (!inited.current) {
      const cols = ["#ffc53d", "#f7931a", "#ffd76a", "#e09a10"];
      for (let i = 0; i < 7; i++) balls.current.push({ x: 40 + i * 42, y: 40 + (i % 3) * 30, vx: (Math.random() - 0.5) * 3, vy: 0, r: 15 + (i % 3) * 4, c: cols[i % 4] });
      inited.current = true;
    }
    const B = balls.current;
    for (let i = 0; i < B.length; i++) {
      const p = B[i];
      if (i === grab.current) continue;
      p.vy += 0.16 * k;
      p.x += p.vx * k; p.y += p.vy * k;
      if (p.x < p.r) { p.x = p.r; p.vx = -p.vx * 0.85; }
      if (p.x > w - p.r) { p.x = w - p.r; p.vx = -p.vx * 0.85; }
      if (p.y < p.r) { p.y = p.r; p.vy = -p.vy * 0.85; }
      if (p.y > h - p.r) {
        if (Math.abs(p.vy) > 2) { setHits((x) => x + 1); sfx.play("tick"); }
        p.y = h - p.r; p.vy = -p.vy * 0.85; p.vx *= 0.98;
      }
      for (let j = i + 1; j < B.length; j++) {
        const q = B[j];
        const dx = q.x - p.x, dy = q.y - p.y;
        const d = Math.hypot(dx, dy) || 1, min = p.r + q.r;
        if (d < min) {
          const nx = dx / d, ny = dy / d, ov = (min - d) / 2;
          if (i !== grab.current) { p.x -= nx * ov; p.y -= ny * ov; }
          if (j !== grab.current) { q.x += nx * ov; q.y += ny * ov; }
          const rel = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
          if (rel > 0) { const im = rel * 0.9; if (i !== grab.current) { p.vx -= im * nx; p.vy -= im * ny; } if (j !== grab.current) { q.vx += im * nx; q.vy += im * ny; } if (rel > 1.5) sfx.play("tick"); }
        }
      }
    }
    for (const p of B) {
      const g = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.35, 2, p.x, p.y, p.r);
      g.addColorStop(0, "#fff3cf"); g.addColorStop(0.4, p.c); g.addColorStop(1, "#8a5c00");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      ctx.strokeStyle = "#a86d00"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = "#7a4a00"; ctx.font = `800 ${p.r * 0.9}px JetBrains Mono`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("$", p.x, p.y + 1);
    }
  });
  const toLocal = (e: { clientX: number; clientY: number }) => { const r = cv.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onDown = (e: RPE<HTMLCanvasElement>) => {
    const { x, y } = toLocal(e);
    let best = -1, bd = 30;
    balls.current.forEach((p, i) => { const d = Math.hypot(p.x - x, p.y - y); if (d < Math.max(bd, p.r + 8)) { bd = d; best = i; } });
    grab.current = best;
    last.current = { x, y, t: performance.now() };
    if (best >= 0) feel("tap", 6);
  };
  const onMove = (e: RPE<HTMLCanvasElement>) => {
    if (grab.current < 0) return;
    const { x, y } = toLocal(e);
    const p = balls.current[grab.current];
    const now = performance.now();
    p.x = x; p.y = y;
    p.vx = (x - last.current.x) / Math.max(1, now - last.current.t) * 16;
    p.vy = (y - last.current.y) / Math.max(1, now - last.current.t) * 16;
    last.current = { x, y, t: now };
  };
  const onUp = () => { if (grab.current >= 0 && Math.hypot(balls.current[grab.current].vx, balls.current[grab.current].vy) > 8) { bump(); game.reward({ gems: 3, x: balls.current[grab.current].x, y: balls.current[grab.current].y }); } grab.current = -1; };
  return (
    <AssetCard id="PHY-04" title="Bounce Coins Physics" desc="7 монет с гравитацией, отскоком от стен и упругими столкновениями. Хватай и бросай — сильный бросок (+3 💎) считается." tags={["physics", "collision", "throw", "coins"]}>
      <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp} className="h-56 w-full cursor-grab touch-none rounded-2xl bg-ink-950/70 active:cursor-grabbing" />
      <div className="mt-2 flex justify-between font-mono text-xs font-bold text-ink-300"><span>floor hits <span className="text-gold">{hits}</span></span><span>grab & throw</span></div>
    </AssetCard>
  );
}

/* ═════════ PHY-05 · Follow chain ═════════ */
function FollowChain() {
  const boxes = useRef<{ x: number; y: number }[]>(Array.from({ length: 12 }, () => ({ x: 150, y: 120 })));
  const target = useRef({ x: 150, y: 120, t: 0 });
  const [fingers, setFingers] = useState(false);
  const ptr = useRef(new Map<number, { x: number; y: number }>());
  const cv = useCanvas((ctx, w, h, dt) => {
    const k = dt / 16.67;
    const T = target.current;
    T.t += dt;
    if (ptr.current.size === 0) { T.x = w / 2 + Math.cos(T.t * 0.0011) * w * 0.32; T.y = h / 2 + Math.sin(T.t * 0.0017) * h * 0.3; }
    const B = boxes.current;
    B[0].x += (T.x - B[0].x) * 0.28 * k; B[0].y += (T.y - B[0].y) * 0.28 * k;
    for (let i = 1; i < B.length; i++) { B[i].x += (B[i - 1].x - B[i].x) * 0.3 * k; B[i].y += (B[i - 1].y - B[i].y) * 0.3 * k; }
    const hue = (T.t * 0.05) % 360;
    for (let i = B.length - 1; i >= 0; i--) {
      const p = B[i], q = i ? B[i - 1] : { x: T.x, y: T.y };
      const ang = Math.atan2(q.y - p.y, q.x - p.x);
      const size = 26 - i * 0.8;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(ang);
      const hh = (hue + i * 14) % 360;
      ctx.fillStyle = `hsl(${hh} 75% ${58 - i}%)`;
      ctx.strokeStyle = `hsl(${hh} 80% 35%)`; ctx.lineWidth = 2;
      const r = 7;
      ctx.beginPath();
      ctx.moveTo(-size / 2 + r, -size / 2); ctx.lineTo(size / 2 - r, -size / 2); ctx.arc(size / 2 - r, -size / 2 + r, r, -Math.PI / 2, 0); ctx.lineTo(size / 2, size / 2 - r); ctx.arc(size / 2 - r, size / 2 - r, r, 0, Math.PI / 2); ctx.lineTo(-size / 2 + r, size / 2); ctx.arc(-size / 2 + r, size / 2 - r, r, Math.PI / 2, Math.PI); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = "800 11px JetBrains Mono"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(B.length - i), 0, 0);
      ctx.restore();
    }
  });
  const onDown = (e: RPE<HTMLCanvasElement>) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); ptr.current.set(e.pointerId, { x: e.clientX - r.left, y: e.clientY - r.top }); setFingers(true); };
  const onMove = (e: RPE<HTMLCanvasElement>) => { if (!ptr.current.has(e.pointerId)) return; const r = e.currentTarget.getBoundingClientRect(); const p = { x: e.clientX - r.left, y: e.clientY - r.top }; ptr.current.set(e.pointerId, p); const ps = [...ptr.current.values()]; if (ps.length >= 2) { target.current.x = (ps[0].x + ps[1].x) / 2; target.current.y = (ps[0].y + ps[1].y) / 2; } else { target.current.x = p.x; target.current.y = p.y; } };
  const onUp = (e: RPE<HTMLCanvasElement>) => { ptr.current.delete(e.pointerId); setFingers(false); };
  return (
    <AssetCard id="PHY-05" title="Follow Chain" desc="12 блоков-сегментов гонятся за курсором (или за середину двух пальцев) с разными коэффициентами догоняния — классический follow-chain." tags={["physics", "chain", "follow", "lissajous"]}>
      <canvas ref={cv} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className="h-56 w-full touch-none rounded-2xl bg-ink-950/70" />
      <div className="mt-2 flex justify-between font-mono text-xs font-bold text-ink-300"><span>{fingers ? "2 pointers: midpoint" : "follows your cursor"}</span><span>12 segments</span></div>
    </AssetCard>
  );
}
void 0;

/* ═════════ PHY-06 · Cloth ═════════ */
function Cloth() {
  const cols = 16, rows = 10, gap = 14;
  const cloth = useRef<{ x: number; y: number; px: number; py: number; pin: boolean }[]>([]);
  const inited = useRef(false);
  const ptr = useRef({ x: -999, y: -999, in: false });
  const [torn, setTorn] = useState(0);
  const links = useRef<{ a: number; b: number; alive: boolean }[]>([]);
  const cv = useCanvas((ctx, w, _h, dt) => {
    const k = dt / 16.67;
    if (!inited.current) {
      const ox = (w - (cols - 1) * gap) / 2;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const X = ox + x * gap, Y = 18 + y * gap; cloth.current.push({ x: X, y: Y, px: X, py: Y, pin: y === 0 }); links.current.push(); }
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        if (x < cols - 1) links.current.push({ a: y * cols + x, b: y * cols + x + 1, alive: true });
        if (y < rows - 1) links.current.push({ a: y * cols + x, b: (y + 1) * cols + x, alive: true });
      }
      inited.current = true;
    }
    const C = cloth.current;
    for (const p of C) {
      if (p.pin) continue;
      const vx = (p.x - p.px) * 0.99, vy = (p.y - p.py) * 0.99;
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + 0.18 * k * k;
      if (ptr.current.in) { const d = Math.hypot(p.x - ptr.current.x, p.y - ptr.current.y); if (d < 46) { const f = (1 - d / 46) * 3 * k; p.x += ((p.x - ptr.current.x) / (d || 1)) * f; p.y += ((p.y - ptr.current.y) / (d || 1)) * f; } }
    }
    let breakNow = 0;
    for (const l of links.current) {
      if (!l.alive) continue;
      const a = C[l.a], b = C[l.b];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > gap * 2.6) { l.alive = false; breakNow++; continue; }
      const diff = ((d - gap) / d) * 0.5;
      if (!a.pin) { a.x += dx * diff; a.y += dy * diff; }
      if (!b.pin) { b.x -= dx * diff; b.y -= dy * diff; }
    }
    if (breakNow > 0) { setTorn((t) => t + breakNow); sfx.play("lock"); }
    for (const l of links.current) {
      if (!l.alive) continue;
      const a = C[l.a], b = C[l.b];
      const stretch = Math.min(1, Math.hypot(b.x - a.x, b.y - a.y) / (gap * 2));
      ctx.strokeStyle = stretch > 0.5 ? `hsl(${350 - stretch * 30} 90% 60%)` : "#3d8bff";
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.fillStyle = "#ffc53d";
    for (let x = 0; x < cols; x++) { const p = C[x]; ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fill(); }
  });
  const onMove = (e: RPE<HTMLCanvasElement>) => { const r = e.currentTarget.getBoundingClientRect(); ptr.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: true }; };
  return (
    <AssetCard id="PHY-06" title="Tearable Cloth" desc="Ткань 16×10 на верле: закреплена сверху, продавливай пальцем. Сильное растяжение рвёт связи — нити краснеют перед разрывом." tags={["physics", "cloth", "tear", "verlet"]}>
      <canvas ref={cv} onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => (ptr.current.in = false)} className="h-60 w-full touch-none rounded-2xl bg-ink-950/70" />
      <div className="mt-2 flex justify-between font-mono text-xs font-bold text-ink-300"><span>broken threads <span className="text-bear">{torn}</span></span><span>push through it</span></div>
    </AssetCard>
  );
}

export default function PhysicsSection() {
  return (
    <Section id="physics" num="19" title="Physics Playground" subtitle="Верле-струна, пружинная сетка, маятник, столкновения, follow-chain, рвущаяся ткань">
      <VerletRope />
      <SpringNet />
      <Pendulum />
      <BounceCoins />
      <FollowChain />
      <Cloth />
      <div className="md:col-span-2 2xl:col-span-3 raised flex items-center justify-center gap-3 rounded-2xl p-4 text-center">
        <Icon name="bolt" size={20} className="text-gold" />
        <span className="text-sm font-bold text-ink-200">Вся физика — свой код: верле-интегратор, итерации ограничений, импульсы. Никаких библиотек.</span>
      </div>
    </Section>
  );
}
