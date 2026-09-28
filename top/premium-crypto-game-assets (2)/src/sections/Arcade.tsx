import { useEffect, useRef, useState, type RefObject } from "react";
import { Asset, Bar, Btn, Confetti, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { clamp, damp, seeded, useRafLoop, useVisible } from "../components/motion";
import { cn } from "../utils/cn";

/* =============================================================================
 *  ARCADE — nine playable mini-games that teach trading instincts.
 *  Canvas games run a fixed game loop on requestAnimationFrame and pause when
 *  scrolled offscreen. DOM games use CSS transforms only (GPU-friendly).
 * =============================================================================*/

/* ---------- canvas helpers ---------- */

function useCanvas2D(ref: RefObject<HTMLCanvasElement | null>, w: number, h: number) {
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr;
    c.height = h * dpr;
    c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [ref, w, h]);
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function toCanvas(e: { clientX: number; clientY: number }, c: HTMLCanvasElement, W: number, H: number) {
  const r = c.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: string; s: number };

function burst(list: Particle[], x: number, y: number, c: string, n = 14, power = 320) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = power * (0.3 + Math.random() * 0.7);
    const life = 0.45 + Math.random() * 0.45;
    list.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - power * 0.3, life, max: life, c, s: 2 + Math.random() * 3 });
  }
}

function stepParticles(list: Particle[], dt: number, gravity = 900) {
  for (const p of list) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += gravity * dt;
    p.life -= dt;
  }
  return list.filter((p) => p.life > 0);
}

function drawParticles(ctx: CanvasRenderingContext2D, list: Particle[]) {
  for (const p of list) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Pip the bull, drawn centered at (0,0). */
function drawBull(ctx: CanvasRenderingContext2D, size: number, blink = false) {
  const h = size / 2;
  ctx.fillStyle = "#ffc53d";
  ctx.strokeStyle = "#b07600";
  ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * (h - 6), -h + 6);
    ctx.quadraticCurveTo(side * (h + 8), -h - 4, side * (h + 2), -h - 14);
    ctx.quadraticCurveTo(side * (h - 2), -h - 2, side * (h - 14), -h + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  const g = ctx.createLinearGradient(0, -h, 0, h);
  g.addColorStop(0, "#6dbbff");
  g.addColorStop(1, "#1f6fd0");
  ctx.fillStyle = g;
  rr(ctx, -h, -h, size, size, 10);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.28)";
  rr(ctx, -h + 5, -h + 4, size - 10, 6, 3);
  ctx.fill();
  ctx.fillStyle = "#fff";
  if (blink) {
    ctx.fillRect(-10, -4, 8, 2);
    ctx.fillRect(4, -4, 8, 2);
  } else {
    ctx.beginPath(); ctx.arc(-6, -3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#07122d";
    ctx.beginPath(); ctx.arc(-4.5, -3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9.5, -3, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#a9d8ff";
  ctx.beginPath();
  ctx.ellipse(1, 9, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* =============================================================================
 * 1. Candle Runner — endless runner. Jump red candles, grab coins. Double jump.
 * ============================================================================*/
const RW = 640, RH = 260, GROUND = 214, PX = 96, PS = 34;
type Obstacle = { x: number; w: number; h: number; passed: boolean };
type RunCoin = { x: number; y: number; taken: boolean };

function freshRunner() {
  return {
    y: 0, vy: 0, jumps: 0, t: 0, speed: 280, dist: 0,
    obs: [] as Obstacle[], cs: [] as RunCoin[], parts: [] as Particle[],
    spawn: 1.3, coinSpawn: 0.9, score: 0, coins: 0, shake: 0, squash: 0, ui: 0, blink: 0,
  };
}

function CandleRunner() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(wrap);
  useCanvas2D(canvas, RW, RH);
  const g = useRef(freshRunner());
  const [phase, setPhase] = useState<"idle" | "run" | "over">("idle");
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(0);
  const [speed, setSpeed] = useState(1);

  const start = () => {
    g.current = freshRunner();
    setScore(0);
    setCoins(0);
    setPhase("run");
  };

  const jump = () => {
    if (phase !== "run") return start();
    const s = g.current;
    if (s.jumps < 2) {
      s.vy = s.jumps === 0 ? 760 : 620;
      s.jumps++;
      s.squash = 1;
      burst(s.parts, PX + PS / 2, GROUND - s.y, "rgba(142,163,207,.8)", 6, 120);
      navigator.vibrate?.(6);
    }
  };

  const update = (dt: number) => {
    const s = g.current;
    s.t += dt;
    s.speed = 280 + Math.min(340, s.t * 9);
    s.dist += s.speed * dt;
    s.vy -= 2300 * dt;
    s.y += s.vy * dt;
    if (s.y <= 0) {
      if (s.vy < -300) { s.squash = 0.8; burst(s.parts, PX + PS / 2, GROUND, "rgba(142,163,207,.7)", 5, 100); }
      s.y = 0; s.vy = 0; s.jumps = 0;
    }
    s.squash = Math.max(0, s.squash - dt * 4);
    s.shake = Math.max(0, s.shake - dt * 2.5);

    s.spawn -= dt;
    if (s.spawn <= 0) {
      s.obs.push({ x: RW + 30, w: 16 + Math.random() * 12, h: 34 + Math.random() * 58, passed: false });
      if (Math.random() < 0.28) s.obs.push({ x: RW + 78, w: 16, h: 28 + Math.random() * 28, passed: false });
      s.spawn = Math.max(0.55, 1.35 - s.t * 0.015) + Math.random() * 0.7;
    }
    s.coinSpawn -= dt;
    if (s.coinSpawn <= 0) {
      const base = 60 + Math.random() * 90;
      for (let i = 0; i < 4; i++) s.cs.push({ x: RW + 30 + i * 32, y: base + Math.sin(i * 0.9) * 14, taken: false });
      s.coinSpawn = 1.7 + Math.random() * 1.4;
    }
    for (const o of s.obs) o.x -= s.speed * dt;
    for (const c of s.cs) c.x -= s.speed * dt;
    s.obs = s.obs.filter((o) => o.x > -60);
    s.cs = s.cs.filter((c) => c.x > -30 && !c.taken);

    const px1 = PX + 5, px2 = PX + PS - 5, py2 = GROUND - s.y, py1 = py2 - PS + 5;
    for (const o of s.obs) {
      if (px2 > o.x && px1 < o.x + o.w && py2 > GROUND - o.h) {
        burst(s.parts, PX + PS / 2, py2 - PS / 2, "#ff4b6e", 26, 380);
        s.shake = 1;
        navigator.vibrate?.([40, 30, 40]);
        setPhase("over");
        setBest((b) => Math.max(b, Math.floor(s.score)));
        setScore(Math.floor(s.score));
        return;
      }
      if (!o.passed && o.x + o.w < PX) { o.passed = true; s.score += 10; }
    }
    for (const c of s.cs) {
      const cy = GROUND - c.y;
      if (Math.hypot(c.x - (PX + PS / 2), cy - (py1 + py2) / 2) < 26) {
        c.taken = true;
        s.coins++;
        s.score += 25;
        burst(s.parts, c.x, cy, "#ffc53d", 10, 200);
      }
    }
    s.score += dt * 12;
    s.ui += dt;
    if (s.ui > 0.1) {
      s.ui = 0;
      setScore(Math.floor(s.score));
      setCoins(s.coins);
      setSpeed(Math.round((s.speed / 280) * 10) / 10);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const s = g.current;
    ctx.save();
    if (s.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * s.shake, (Math.random() - 0.5) * 12 * s.shake);
    const bg = ctx.createLinearGradient(0, 0, 0, RH);
    bg.addColorStop(0, "#071433");
    bg.addColorStop(1, "#0f2250");
    ctx.fillStyle = bg;
    ctx.fillRect(-10, -10, RW + 20, RH + 20);

    // Far layer: slow chart line (parallax 0.15)
    ctx.strokeStyle = "rgba(61,165,255,.22)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= RW; x += 8) {
      const t = (x + s.dist * 0.15) / 60;
      const y = 100 + Math.sin(t) * 24 + Math.sin(t * 2.7) * 8;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Mid layer: grid (parallax 0.5)
    ctx.strokeStyle = "rgba(140,175,255,.06)";
    ctx.lineWidth = 1;
    for (let x = -((s.dist * 0.5) % 40); x < RW; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, GROUND); ctx.stroke();
    }
    // Ground
    ctx.fillStyle = "#0a1330";
    ctx.fillRect(0, GROUND, RW, RH - GROUND);
    ctx.fillStyle = "rgba(34,211,138,.5)";
    ctx.fillRect(0, GROUND, RW, 2);
    ctx.fillStyle = "rgba(140,175,255,.12)";
    for (let x = -(s.dist % 30); x < RW; x += 30) ctx.fillRect(x, GROUND + 14, 14, 3);

    // Coins
    for (const c of s.cs) {
      const bob = Math.sin(s.t * 6 + c.x * 0.05) * 3;
      const cy = GROUND - c.y + bob;
      ctx.fillStyle = "#b07600";
      ctx.beginPath(); ctx.arc(c.x, cy + 2, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffc53d";
      ctx.beginPath(); ctx.arc(c.x, cy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#6b4500";
      ctx.font = "bold 11px Rubik, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₿", c.x, cy + 1);
    }
    // Obstacles: bearish candles
    for (const o of s.obs) {
      const top = GROUND - o.h;
      ctx.strokeStyle = "#ff4b6e";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(o.x + o.w / 2, top - 12); ctx.lineTo(o.x + o.w / 2, GROUND); ctx.stroke();
      ctx.fillStyle = "#a01e3c";
      rr(ctx, o.x, top + 3, o.w, o.h - 3, 3); ctx.fill();
      ctx.fillStyle = "#ff4b6e";
      rr(ctx, o.x, top, o.w, o.h - 4, 3); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.25)";
      rr(ctx, o.x + 3, top + 3, 3, o.h - 10, 2); ctx.fill();
    }
    // Player shadow shrinks with height
    const shadow = clamp(1 - s.y / 200, 0.3, 1);
    ctx.fillStyle = "rgba(0,0,0,.35)";
    ctx.beginPath(); ctx.ellipse(PX + PS / 2, GROUND + 3, 18 * shadow, 4 * shadow, 0, 0, Math.PI * 2); ctx.fill();
    // Player
    const py = GROUND - s.y - PS / 2;
    const sx = 1 + s.squash * (s.y > 0 ? -0.18 : 0.25);
    const sy = 1 - s.squash * (s.y > 0 ? -0.18 : 0.25);
    ctx.save();
    ctx.translate(PX + PS / 2, py);
    ctx.rotate(s.y > 0 ? clamp(-s.vy * 0.0005, -0.4, 0.4) : 0);
    ctx.scale(sx, sy);
    drawBull(ctx, PS, Math.sin(s.t * 2.3) > 0.97);
    ctx.restore();
    drawParticles(ctx, s.parts);
    ctx.restore();
  };

  useRafLoop((_, dt) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const s = g.current;
    if (phase === "run") update(dt);
    else s.t += dt * 0.6;
    s.parts = stepParticles(s.parts, dt);
    s.shake = Math.max(0, s.shake - dt * 2.5);
    draw(ctx);
  }, visible);

  return (
    <Asset code="ARC-01" title="Candle Runner" desc="Endless runner: leap bearish candles, collect coins, double-jump in the air. Speed ramps every second; squash & stretch, parallax layers and hit-shake give weight." tags={["canvas", "endless", "double jump"]} span={2}>
      <div
        ref={wrap}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); jump(); } }}
        className="relative rounded-[22px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky/60 select-none"
      >
        <canvas
          ref={canvas}
          onPointerDown={(e) => { e.preventDefault(); wrap.current?.focus(); jump(); }}
          className="block w-full touch-none cursor-pointer"
          style={{ aspectRatio: `${RW}/${RH}` }}
        />
        <div className="absolute top-3 left-3 right-3 flex items-center gap-2 pointer-events-none">
          <span className="glass rounded-xl px-2.5 py-1 num text-sm font-black">{score}</span>
          <span className="glass rounded-xl px-2.5 py-1 num text-xs font-black text-gold flex items-center gap-1"><Icon name="btc" size={12} />{coins}</span>
          <span className="glass rounded-xl px-2.5 py-1 num text-[10px] font-black text-sky">{speed}×</span>
          <span className="ml-auto glass rounded-xl px-2.5 py-1 num text-[10px] font-black text-mist">BEST {best}</span>
        </div>
        {phase !== "run" && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/40 backdrop-blur-[2px]">
            <div className="text-center anim-pop">
              <div className="text-2xl font-black">{phase === "over" ? `Liquidated · ${score}` : "Candle Runner"}</div>
              <div className="text-xs text-mist mb-3">Tap / Space to jump · twice for a double jump</div>
              <Btn variant="bull" icon="play" onClick={start}>{phase === "over" ? "Run again" : "Start run"}</Btn>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 2. Candle Slicer — swipe to slice bullish candles, avoid bearish ones.
 * ============================================================================*/
const SW = 360, SH = 460;
type Flyer = { id: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; kind: "bull" | "bear" | "gold"; r: number };
type Half = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; kind: Flyer["kind"]; side: -1 | 1; r: number; life: number };
type FloatTxt = { x: number; y: number; text: string; c: string; life: number };

function drawFlyer(ctx: CanvasRenderingContext2D, kind: Flyer["kind"], r: number, side: 0 | -1 | 1 = 0) {
  if (kind === "gold") {
    ctx.save();
    if (side !== 0) { ctx.beginPath(); ctx.rect(side < 0 ? -r - 2 : 0, -r - 2, r + 2, r * 2 + 4); ctx.clip(); }
    ctx.fillStyle = "#b07600"; ctx.beginPath(); ctx.arc(0, 2, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffc53d"; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#6b4500"; ctx.font = `bold ${r}px Rubik, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("₿", 0, 1);
    ctx.restore();
    return;
  }
  const c = kind === "bull" ? "#22d38a" : "#ff4b6e";
  const d = kind === "bull" ? "#0b7a4a" : "#a01e3c";
  const w = r * 0.95, h = r * 1.7;
  ctx.save();
  if (side !== 0) { ctx.beginPath(); ctx.rect(side < 0 ? -w : 0, -r * 2, w, r * 4); ctx.clip(); }
  ctx.strokeStyle = c; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -r * 1.35); ctx.lineTo(0, r * 1.35); ctx.stroke();
  ctx.fillStyle = d; rr(ctx, -w / 2, -h / 2 + 3, w, h, 5); ctx.fill();
  ctx.fillStyle = c; rr(ctx, -w / 2, -h / 2, w, h, 5); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.3)"; rr(ctx, -w / 2 + 4, -h / 2 + 4, 4, h - 10, 2); ctx.fill();
  if (kind === "bear") {
    ctx.fillStyle = "#fff"; ctx.font = `bold ${r * 0.8}px Rubik, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("!", 0, 1);
  }
  ctx.restore();
}

function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

function CandleSlicer() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(wrap);
  useCanvas2D(canvas, SW, SH);
  const fresh = () => ({ items: [] as Flyer[], halves: [] as Half[], parts: [] as Particle[], texts: [] as FloatTxt[], trail: [] as { x: number; y: number; t: number }[], spawn: 0.6, time: 45, score: 0, lives: 3, combo: 0, lastSlice: 0, clock: 0, flash: 0, down: false, id: 0, ui: 0 });
  const g = useRef(fresh());
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [hud, setHud] = useState({ score: 0, time: 45, lives: 3, combo: 0 });
  const [best, setBest] = useState(0);

  const start = () => { g.current = fresh(); setPhase("play"); };

  const slice = (item: Flyer) => {
    const s = g.current;
    s.items = s.items.filter((i) => i.id !== item.id);
    for (const side of [-1, 1] as const) s.halves.push({ x: item.x, y: item.y, vx: item.vx + side * 90, vy: item.vy - 60, rot: item.rot, vr: side * 5, kind: item.kind, side, r: item.r, life: 1.4 });
    if (item.kind === "bear") {
      s.lives--;
      s.combo = 0;
      s.flash = 1;
      burst(s.parts, item.x, item.y, "#ff4b6e", 24, 340);
      s.texts.push({ x: item.x, y: item.y, text: "−1 ♥", c: "#ff4b6e", life: 1 });
      navigator.vibrate?.([30, 30, 30]);
      if (s.lives <= 0) { setPhase("over"); setBest((b) => Math.max(b, s.score)); }
      return;
    }
    s.combo = s.clock - s.lastSlice < 0.4 ? s.combo + 1 : 1;
    s.lastSlice = s.clock;
    const pts = item.kind === "gold" ? 5 : s.combo >= 3 ? 2 : 1;
    s.score += pts;
    burst(s.parts, item.x, item.y, item.kind === "gold" ? "#ffc53d" : "#22d38a", 16, 260);
    s.texts.push({ x: item.x, y: item.y - 10, text: s.combo >= 3 ? `+${pts} COMBO ×${s.combo}` : `+${pts}`, c: item.kind === "gold" ? "#ffc53d" : "#3ce49e", life: 1 });
  };

  const onMove = (e: React.PointerEvent) => {
    const s = g.current;
    if (!s.down || !canvas.current) return;
    const p = toCanvas(e, canvas.current, SW, SH);
    const prev = s.trail[s.trail.length - 1];
    s.trail.push({ x: p.x, y: p.y, t: s.clock });
    if (phase !== "play" || !prev) return;
    if (Math.hypot(p.x - prev.x, p.y - prev.y) < 4) return;
    for (const item of [...s.items]) {
      if (distToSegment(item.x, item.y, prev.x, prev.y, p.x, p.y) < item.r * 1.15) slice(item);
    }
  };

  useRafLoop((_, dt) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const s = g.current;
    s.clock += dt;
    if (phase === "play") {
      s.time -= dt;
      if (s.time <= 0) { s.time = 0; setPhase("over"); setBest((b) => Math.max(b, s.score)); }
      s.spawn -= dt;
      if (s.spawn <= 0) {
        const n = 1 + Math.floor(Math.random() * (s.clock > 15 ? 3 : 2));
        for (let i = 0; i < n; i++) {
          const roll = Math.random();
          const x = 60 + Math.random() * (SW - 120);
          s.items.push({ id: ++s.id, x, y: SH + 30, vx: (SW / 2 - x) * (0.4 + Math.random() * 0.5), vy: -(560 + Math.random() * 140), rot: 0, vr: (Math.random() - 0.5) * 4, kind: roll < 0.22 ? "bear" : roll < 0.3 ? "gold" : "bull", r: 20 });
        }
        s.spawn = 0.7 + Math.random() * 0.5;
      }
    }
    for (const it of s.items) { it.x += it.vx * dt; it.y += it.vy * dt; it.vy += 720 * dt; it.rot += it.vr * dt; }
    const missed = s.items.filter((it) => it.y > SH + 50 && it.vy > 0 && it.kind === "bull").length;
    if (missed && phase === "play") s.combo = 0;
    s.items = s.items.filter((it) => !(it.y > SH + 50 && it.vy > 0));
    for (const h of s.halves) { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += 900 * dt; h.rot += h.vr * dt; h.life -= dt; }
    s.halves = s.halves.filter((h) => h.life > 0 && h.y < SH + 80);
    s.parts = stepParticles(s.parts, dt);
    for (const t of s.texts) { t.y -= 50 * dt; t.life -= dt; }
    s.texts = s.texts.filter((t) => t.life > 0);
    s.trail = s.trail.filter((p) => s.clock - p.t < 0.14);
    s.flash = Math.max(0, s.flash - dt * 3);
    s.ui += dt;
    if (s.ui > 0.1) { s.ui = 0; setHud({ score: s.score, time: Math.ceil(s.time), lives: s.lives, combo: s.combo }); }

    // --- draw ---
    const bg = ctx.createLinearGradient(0, 0, 0, SH);
    bg.addColorStop(0, "#0a1636");
    bg.addColorStop(1, "#050b1f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, SW, SH);
    ctx.strokeStyle = "rgba(140,175,255,.05)";
    for (let y = 40; y < SH; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SW, y); ctx.stroke(); }
    for (const h of s.halves) {
      ctx.save(); ctx.globalAlpha = clamp(h.life, 0, 1); ctx.translate(h.x, h.y); ctx.rotate(h.rot); drawFlyer(ctx, h.kind, h.r, h.side); ctx.restore();
    }
    for (const it of s.items) { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot); drawFlyer(ctx, it.kind, it.r); ctx.restore(); }
    drawParticles(ctx, s.parts);
    // blade trail — tapered glowing stroke
    if (s.trail.length > 1) {
      ctx.lineCap = "round";
      for (let i = 1; i < s.trail.length; i++) {
        const a = s.trail[i - 1], b = s.trail[i];
        const k = i / s.trail.length;
        ctx.strokeStyle = `rgba(169,216,255,${k})`;
        ctx.lineWidth = 2 + k * 7;
        ctx.shadowColor = "#3da5ff";
        ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
    for (const t of s.texts) {
      ctx.globalAlpha = clamp(t.life, 0, 1);
      ctx.fillStyle = t.c;
      ctx.font = "900 15px Rubik, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    if (s.flash > 0) { ctx.fillStyle = `rgba(255,75,110,${s.flash * 0.3})`; ctx.fillRect(0, 0, SW, SH); }
  }, visible);

  return (
    <Asset code="ARC-02" title="Candle Slicer" desc="Swipe to slice bullish candles and gold; slicing a bearish candle costs a heart. Chain slices within 0.4s for combo points. 45-second round." tags={["canvas", "swipe", "combo"]}>
      <div ref={wrap} className="relative rounded-[22px] overflow-hidden select-none">
        <canvas
          ref={canvas}
          onPointerDown={(e) => { g.current.down = true; g.current.trail = []; e.currentTarget.setPointerCapture(e.pointerId); onMove(e); }}
          onPointerMove={onMove}
          onPointerUp={() => { g.current.down = false; }}
          onPointerCancel={() => { g.current.down = false; }}
          className="block w-full touch-none cursor-crosshair"
          style={{ aspectRatio: `${SW}/${SH}` }}
        />
        <div className="absolute top-3 inset-x-3 flex items-center gap-2 pointer-events-none">
          <span className="glass rounded-xl px-2.5 py-1 num text-sm font-black">{hud.score}</span>
          {hud.combo >= 3 && <span key={hud.combo} className="rounded-xl px-2 py-1 bg-flame text-white num text-[10px] font-black anim-pop">×{hud.combo}</span>}
          <span className="ml-auto flex gap-0.5">{[0, 1, 2].map((i) => <Icon key={i} name="heart" size={16} fill={i < hud.lives ? "#ff4b6e" : "#172856"} stroke={1.5} className={i < hud.lives ? "text-bear" : "text-ink-600"} />)}</span>
          <span className={cn("glass rounded-xl px-2.5 py-1 num text-xs font-black", hud.time <= 10 ? "text-bear" : "text-fog")}>{hud.time}s</span>
        </div>
        {phase !== "play" && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/45 backdrop-blur-[2px] text-center p-4">
            <div className="anim-pop">
              <div className="flex justify-center gap-3 mb-3"><Icon name="trendUp" size={26} className="text-bull" /><Icon name="btc" size={26} className="text-gold" /><Icon name="trendDown" size={26} className="text-bear" /></div>
              <div className="text-2xl font-black">{phase === "over" ? `Score ${hud.score}` : "Candle Slicer"}</div>
              <div className="text-xs text-mist mb-3">Slice green · grab gold · never cut red</div>
              <Btn variant="bull" icon="play" onClick={start}>{phase === "over" ? "Again" : "Start"}</Btn>
              {best > 0 && <div className="num text-[10px] text-mist mt-2">Best {best}</div>}
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 3. Profit Stack — timing tower. Perfect drops grow the slab back.
 * ============================================================================*/
const TW = 360, TH = 440, LAYER = 24, BASE_Y = TH - 50;
type Slab = { x: number; w: number };
type FallPiece = { x: number; y: number; w: number; vy: number; rot: number; vr: number; i: number };

function ProfitStack() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const visible = useVisible(wrap);
  useCanvas2D(canvas, TW, TH);
  const fresh = () => ({ stack: [{ x: 90, w: 180 }] as Slab[], cur: { x: -180, w: 180, dir: 1 }, speed: 170, cam: 0, falling: [] as FallPiece[], parts: [] as Particle[], perfect: 0, combo: 0, t: 0 });
  const g = useRef(fresh());
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [height, setHeight] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);

  const hue = (i: number) => `hsl(${150 + i * 11} 72% ${58 - Math.min(18, i * 0.6)}%)`;
  const worldY = (i: number) => BASE_Y - i * LAYER;

  const start = () => { g.current = fresh(); setHeight(0); setCombo(0); setPhase("play"); };

  const drop = () => {
    if (phase !== "play") return start();
    const s = g.current;
    const top = s.stack[s.stack.length - 1];
    const i = s.stack.length;
    const left = Math.max(s.cur.x, top.x);
    const right = Math.min(s.cur.x + s.cur.w, top.x + top.w);
    const overlap = right - left;
    if (overlap <= 0) {
      s.falling.push({ x: s.cur.x, y: worldY(i), w: s.cur.w, vy: 0, rot: 0, vr: s.cur.x < top.x ? -2 : 2, i });
      setPhase("over");
      setBest((b) => Math.max(b, s.stack.length - 1));
      navigator.vibrate?.([40, 40, 40]);
      return;
    }
    let slab: Slab;
    if (Math.abs(s.cur.x - top.x) <= 5) {
      s.combo++;
      const grow = s.combo >= 3 ? 8 : 0;
      slab = { x: Math.max(0, top.x - grow / 2), w: Math.min(220, top.w + grow) };
      s.perfect = 1;
      burst(s.parts, slab.x + slab.w / 2, worldY(i), "#ffc53d", 18, 220);
      navigator.vibrate?.(15);
    } else {
      s.combo = 0;
      slab = { x: left, w: overlap };
      const pieceX = s.cur.x < top.x ? s.cur.x : right;
      const pieceW = s.cur.w - overlap;
      s.falling.push({ x: pieceX, y: worldY(i), w: pieceW, vy: 0, rot: 0, vr: s.cur.x < top.x ? -2.5 : 2.5, i });
    }
    s.stack.push(slab);
    const fromLeft = s.stack.length % 2 === 0;
    s.cur = { x: fromLeft ? -slab.w : TW, w: slab.w, dir: fromLeft ? 1 : -1 };
    s.speed = Math.min(420, 170 + s.stack.length * 7);
    setHeight(s.stack.length - 1);
    setCombo(s.combo);
  };

  useRafLoop((_, dt) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    const s = g.current;
    s.t += dt;
    if (phase === "play") {
      s.cur.x += s.cur.dir * s.speed * dt;
      if (s.cur.x < -s.cur.w * 0.35) { s.cur.x = -s.cur.w * 0.35; s.cur.dir = 1; }
      if (s.cur.x > TW - s.cur.w * 0.65) { s.cur.x = TW - s.cur.w * 0.65; s.cur.dir = -1; }
    }
    s.cam = damp(s.cam, Math.max(0, s.stack.length * LAYER - 250), 6, dt);
    for (const f of s.falling) { f.vy += 1300 * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }
    s.falling = s.falling.filter((f) => f.y - s.cam < TH + 200 || f.y < worldY(0) + 400);
    s.parts = stepParticles(s.parts, dt, 600);
    s.perfect = Math.max(0, s.perfect - dt * 2);

    // Sky shifts from dusk to space as the tower grows.
    const h = clamp(s.stack.length / 40, 0, 1);
    const bg = ctx.createLinearGradient(0, 0, 0, TH);
    bg.addColorStop(0, `hsl(${225 + h * 25} 60% ${14 - h * 8}%)`);
    bg.addColorStop(1, `hsl(${215 + h * 20} 55% ${24 - h * 10}%)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, TW, TH);
    const rnd = seeded(7);
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = h * (0.3 + rnd() * 0.7);
      ctx.fillStyle = "#eef3ff";
      ctx.fillRect(rnd() * TW, (rnd() * TH + s.cam * 0.2) % TH, 1.5, 1.5);
    }
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(0, s.cam);
    const slab3d = (x: number, y: number, w: number, color: string) => {
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(x + 3, y + 5, w, LAYER - 2);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, LAYER - 2);
      ctx.fillStyle = "rgba(255,255,255,.3)";
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.fillRect(x, y + LAYER - 7, w, 5);
    };
    ctx.fillStyle = "#0a1330";
    ctx.fillRect(40, BASE_Y + LAYER - 2, TW - 80, 400);
    s.stack.forEach((sl, i) => slab3d(sl.x, worldY(i), sl.w, hue(i)));
    if (phase === "play") {
      const i = s.stack.length;
      slab3d(s.cur.x, worldY(i), s.cur.w, hue(i));
      // alignment guide
      const top = s.stack[s.stack.length - 1];
      ctx.strokeStyle = "rgba(255,255,255,.15)";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(top.x, worldY(i), top.w, LAYER - 2);
      ctx.setLineDash([]);
    }
    for (const f of s.falling) {
      ctx.save();
      ctx.translate(f.x + f.w / 2, f.y + LAYER / 2);
      ctx.rotate(f.rot);
      slab3d(-f.w / 2, -LAYER / 2, f.w, hue(f.i));
      ctx.restore();
    }
    if (s.perfect > 0) {
      const top = s.stack[s.stack.length - 1];
      ctx.strokeStyle = `rgba(255,197,61,${s.perfect})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(top.x - 4 * (1 - s.perfect), worldY(s.stack.length - 1) - 4 * (1 - s.perfect), top.w + 8 * (1 - s.perfect), LAYER + 6 * (1 - s.perfect));
    }
    drawParticles(ctx, s.parts);
    ctx.restore();
  }, visible);

  const portfolio = Math.round(10000 * Math.pow(1.03, height));
  return (
    <Asset code="ARC-03" title="Profit Stack" desc="Tap to drop each slab. Overhang is sliced off and falls; land within 5px for a PERFECT — three in a row grows the slab back. The sky turns to space as you climb." tags={["canvas", "timing", "camera"]}>
      <div
        ref={wrap}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); drop(); } }}
        className="relative rounded-[22px] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-sky/60 select-none"
      >
        <canvas ref={canvas} onPointerDown={(e) => { e.preventDefault(); wrap.current?.focus(); drop(); }} className="block w-full touch-none cursor-pointer" style={{ aspectRatio: `${TW}/${TH}` }} />
        <div className="absolute top-3 inset-x-3 flex items-start justify-between pointer-events-none">
          <div className="glass rounded-xl px-3 py-1.5"><div className="num text-2xl font-black leading-none">{height}</div><div className="text-[8px] uppercase font-black text-mist">floors</div></div>
          <div className="text-right">
            <div className="glass rounded-xl px-3 py-1.5 num text-xs font-black text-bull">${portfolio.toLocaleString()}</div>
            {combo >= 1 && <div key={combo} className="mt-1 rounded-lg px-2 py-0.5 bg-gold text-ink-900 text-[9px] font-black anim-pop inline-block">PERFECT ×{combo}</div>}
          </div>
        </div>
        {phase !== "play" && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/40 backdrop-blur-[2px] text-center">
            <div className="anim-pop">
              <div className="text-2xl font-black">{phase === "over" ? `${height} floors` : "Profit Stack"}</div>
              <div className="text-xs text-mist mb-3">Tap / Space to drop the slab</div>
              <Btn variant="gold" icon="layers" onClick={start}>{phase === "over" ? "Rebuild" : "Start"}</Btn>
              {best > 0 && <div className="num text-[10px] text-mist mt-2">Best {best}</div>}
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 4. Scratch Card — real canvas erasing with coverage detection.
 * ============================================================================*/
const PRIZES = [
  { label: "+250 gems", icon: "gem", color: "#3da5ff" },
  { label: "2× XP · 30 min", icon: "bolt", color: "#ffc53d" },
  { label: "Streak freeze", icon: "shield", color: "#9b6bff" },
  { label: "Rare frame", icon: "crown", color: "#ff8a3d" },
];
const CW = 320, CH = 180;

function ScratchCard() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const [cleared, setCleared] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [prize, setPrize] = useState(PRIZES[0]);
  const [burstN, setBurstN] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = CW * dpr;
    c.height = CH * dpr;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, CW, CH);
    g.addColorStop(0, "#8b9bc2");
    g.addColorStop(0.5, "#d4dcf0");
    g.addColorStop(1, "#7d8db6");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = "rgba(255,255,255,.18)";
    for (let i = -CH; i < CW; i += 14) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + CH, CH); ctx.lineTo(i + CH + 6, CH); ctx.lineTo(i + 6, 0); ctx.fill(); }
    ctx.fillStyle = "#39456b";
    ctx.font = "900 22px Rubik, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH TO REVEAL", CW / 2, CH / 2 + 4);
    ctx.font = "700 11px Rubik, sans-serif";
    ctx.fillText("daily reward card", CW / 2, CH / 2 + 24);
    setCleared(0);
    setRevealed(false);
    setPrize(PRIZES[Math.floor(Math.random() * PRIZES.length)]);
  }, [round]);

  const measure = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 40) { total++; if (data[i] < 40) clear++; }
    const ratio = clear / total;
    setCleared(ratio);
    if (ratio > 0.5 && !revealed) { setRevealed(true); setBurstN((b) => b + 1); navigator.vibrate?.(20); }
  };

  const scratch = (e: React.PointerEvent) => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || revealed) return;
    const p = toCanvas(e, c, CW, CH);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 34;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++moves.current % 6 === 0) measure();
  };

  return (
    <Asset code="ARC-04" title="Scratch Card" desc="Real scratch-off: the pointer erases a canvas layer, coverage is sampled live, and at 50% the card auto-reveals with confetti." tags={["canvas", "erase", "reveal"]}>
      <div className="relative rounded-[22px] overflow-hidden select-none" style={{ aspectRatio: `${CW}/${CH}` }}>
        <Confetti burst={burstN} count={30} />
        <div className="absolute inset-0 grid place-items-center text-center" style={{ background: `radial-gradient(circle at 50% 40%, ${prize.color}55, #0a1330 70%)` }}>
          <div className={cn(revealed && "anim-bounce-in")}>
            <div className="w-14 h-14 rounded-2xl mx-auto grid place-items-center" style={{ background: `${prize.color}33`, color: prize.color }}><Icon name={prize.icon} size={30} /></div>
            <div className="font-black text-lg mt-2">{prize.label}</div>
            <div className="text-[9px] uppercase tracking-widest text-mist font-black">You won</div>
          </div>
        </div>
        <canvas
          ref={canvas}
          onPointerDown={(e) => { last.current = null; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }}
          onPointerMove={(e) => { if (e.buttons || e.pointerType === "touch") scratch(e); }}
          onPointerUp={() => { last.current = null; measure(); }}
          className="absolute inset-0 w-full h-full touch-none cursor-grab transition-opacity duration-500"
          style={{ opacity: revealed ? 0 : 1, pointerEvents: revealed ? "none" : "auto" }}
        />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <Bar value={Math.min(100, (cleared / 0.5) * 100)} color={revealed ? "bull" : "sky"} h={8} className="flex-1" />
        <span className="num text-[10px] font-black text-mist w-10 text-right">{Math.round(cleared * 100)}%</span>
        <Btn variant="ghost" size="xs" icon="refresh" onClick={() => setRound((r) => r + 1)}>New</Btn>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 5. Reward Reels — slot machine with staggered deceleration & a pull lever.
 * ============================================================================*/
const SYMBOLS = [
  { icon: "gem", c: "#3da5ff" }, { icon: "bolt", c: "#ffc53d" }, { icon: "star", c: "#22d38a" },
  { icon: "crown", c: "#9b6bff" }, { icon: "heart", c: "#ff4b6e" }, { icon: "trophy", c: "#ff8a3d" },
];
const REEL_ITEM = 60;
const STRIP = Array.from({ length: SYMBOLS.length * 14 }, (_, i) => SYMBOLS[i % SYMBOLS.length]);

function RewardReels() {
  const [reels, setReels] = useState([{ idx: 0, anim: false }, { idx: 1, anim: false }, { idx: 2, anim: false }]);
  const [spinning, setSpinning] = useState(false);
  const [gems, setGems] = useState(120);
  const [result, setResult] = useState<{ text: string; win: number } | null>(null);
  const [lever, setLever] = useState(0);
  const [burstN, setBurstN] = useState(0);
  const leverDrag = useRef<{ y: number } | null>(null);
  const L = SYMBOLS.length;

  const spin = () => {
    if (spinning || gems < 10) return;
    setGems((g) => g - 10);
    setSpinning(true);
    setResult(null);
    const jackpot = Math.random() < 0.18;
    const first = Math.floor(Math.random() * L);
    const results = jackpot ? [first, first, first] : [first, Math.random() < 0.35 ? first : Math.floor(Math.random() * L), Math.floor(Math.random() * L)];
    // Step 1: normalize strips without animation so every spin travels forward.
    setReels((rs) => rs.map((r) => ({ idx: r.idx % L, anim: false })));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setReels((rs) => rs.map((r, i) => {
        const base = r.idx % L;
        return { idx: base + L * (5 + i * 2) + ((results[i] - base + L) % L), anim: true };
      }));
    }));
    window.setTimeout(() => {
      setSpinning(false);
      const counts: Record<number, number> = {};
      results.forEach((r) => (counts[r] = (counts[r] ?? 0) + 1));
      const max = Math.max(...Object.values(counts));
      const win = max === 3 ? 120 : max === 2 ? 20 : 0;
      setGems((g) => g + win);
      setResult({ text: max === 3 ? "JACKPOT!" : max === 2 ? "Pair!" : "No match", win });
      if (win) { setBurstN((b) => b + 1); navigator.vibrate?.(max === 3 ? [30, 40, 30, 40, 60] : 20); }
    }, 1400 + 2 * 450 + 150);
  };

  return (
    <Asset code="ARC-05" title="Reward Reels" desc="Pull the lever (drag it down) or press Spin. Reels decelerate in a staggered cascade with slight overshoot; payline glows on matches." tags={["slot", "stagger", "lever drag"]}>
      <div className="relative rounded-[22px] p-4 bg-gradient-to-b from-[#2a1a64] to-[#120b33] shadow-[0_6px_0_#0b0620,inset_0_1px_0_rgba(255,255,255,.12)]">
        <Confetti burst={burstN} count={34} />
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] uppercase tracking-[.2em] font-black text-violet">Daily reels</span>
          <span className="num text-xs font-black text-sky flex items-center gap-1"><Icon name="gem" size={13} fill="currentColor" />{gems}</span>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex-1 grid grid-cols-3 gap-2 p-2 rounded-2xl bg-ink-950 shadow-[inset_0_4px_12px_rgba(0,0,0,.7)] relative">
            {reels.map((r, i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-ink-900" style={{ height: REEL_ITEM * 3 }}>
                <div style={{
                  transform: `translate3d(0, ${-(r.idx * REEL_ITEM) + REEL_ITEM}px, 0)`,
                  transition: r.anim ? `transform ${1.4 + i * 0.45}s cubic-bezier(.12,.75,.2,1.04)` : "none",
                  filter: spinning ? "blur(.6px)" : "none",
                }}>
                  {STRIP.map((s, k) => (
                    <div key={k} className="grid place-items-center" style={{ height: REEL_ITEM, color: s.c }}>
                      <Icon name={s.icon} size={30} fill={s.icon === "heart" || s.icon === "bolt" || s.icon === "star" ? "currentColor" : "none"} stroke={2.2} />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-ink-950 via-transparent to-ink-950" />
              </div>
            ))}
            <div className={cn("absolute inset-x-1 top-1/2 -translate-y-1/2 border-y-2 pointer-events-none transition-colors", result?.win ? "border-gold shadow-[0_0_18px_rgba(255,197,61,.6)]" : "border-white/10")} style={{ height: REEL_ITEM }} />
          </div>
          {/* Lever */}
          <div
            className="relative w-8 h-40 touch-none select-none cursor-grab"
            onPointerDown={(e) => { if (spinning) return; leverDrag.current = { y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (leverDrag.current) setLever(clamp(e.clientY - leverDrag.current.y, 0, 80)); }}
            onPointerUp={() => { if (leverDrag.current && lever > 55) spin(); leverDrag.current = null; setLever(0); }}
            onPointerCancel={() => { leverDrag.current = null; setLever(0); }}
          >
            <div className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-2 rounded-full bg-ink-950 shadow-inner" />
            <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-b from-[#ff7b95] to-[#e8325a] shadow-[0_4px_0_#a01e3c,inset_0_2px_0_rgba(255,255,255,.35)]" style={{ top: 8 + lever * 1.3, transition: leverDrag.current ? "none" : "top .45s cubic-bezier(.3,1.8,.5,1)" }} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-9 grid place-items-center">
            {result ? <span key={result.text} className={cn("font-black anim-pop", result.win ? "text-gold text-lg" : "text-mist text-sm")}>{result.text}{result.win ? ` +${result.win}` : ""}</span> : <span className="text-[10px] text-mist">{spinning ? "Spinning…" : "10 gems per spin"}</span>}
          </div>
          <Btn variant="violet" size="sm" loading={spinning} disabled={gems < 10} onClick={spin}>Spin</Btn>
        </div>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 6. Price Guess — drag your prediction, then the future draws itself.
 * ============================================================================*/
function makeSeries(seed: number) {
  const rnd = seeded(seed * 97 + 11);
  const out: number[] = [];
  let p = 50;
  const drift = (rnd() - 0.5) * 2.2;
  for (let i = 0; i < 34; i++) {
    p += drift + (rnd() - 0.5) * 7;
    p = clamp(p, 12, 88);
    out.push(p);
  }
  return out;
}

function PriceGuess() {
  const [round, setRound] = useState(1);
  const series = makeSeries(round);
  const KNOWN = 24;
  const [guess, setGuess] = useState(50);
  const [revealed, setRevealed] = useState(false);
  const [total, setTotal] = useState(0);
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const X = (i: number) => 8 + (i / (series.length - 1)) * 284;
  const Y = (v: number) => 150 - (v / 100) * 140;
  const known = series.slice(0, KNOWN).map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const future = series.slice(KNOWN - 1).map((v, i) => `${X(i + KNOWN - 1)},${Y(v)}`).join(" ");
  const actual = series[series.length - 1];
  const error = Math.abs(actual - guess);
  const score = Math.max(0, Math.round(100 - error * 4));

  const setFromPointer = (clientY: number) => {
    const r = svg.current!.getBoundingClientRect();
    const y = ((clientY - r.top) / r.height) * 160;
    setGuess(clamp(((150 - y) / 140) * 100, 0, 100));
  };

  return (
    <Asset code="ARC-06" title="Price Guess" desc="Drag the orange handle to predict where price ends, then reveal: the real path draws itself and your accuracy is scored." tags={["predict", "drag", "draw-on"]}>
      <div className="well p-2 select-none">
        <svg
          ref={svg}
          viewBox="0 0 300 160"
          className="w-full h-44 touch-none"
          onPointerDown={(e) => { if (revealed) return; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); setFromPointer(e.clientY); }}
          onPointerMove={(e) => { if (dragging.current) setFromPointer(e.clientY); }}
          onPointerUp={() => { dragging.current = false; }}
        >
          {[30, 65, 100, 135].map((y) => <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="rgba(140,175,255,.07)" />)}
          <rect x={X(KNOWN - 1)} y="0" width={300 - X(KNOWN - 1)} height="160" fill="rgba(61,165,255,.05)" />
          <polyline points={known} fill="none" stroke="#3da5ff" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1={X(KNOWN - 1)} y1={Y(series[KNOWN - 1])} x2={X(series.length - 1)} y2={Y(guess)} stroke="#ff8a3d" strokeWidth="2" strokeDasharray="5 4" />
          {revealed && (
            <polyline key={round} points={future} fill="none" stroke={score > 70 ? "#22d38a" : "#ff4b6e"} strokeWidth="2.5" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: "dash 1.1s ease forwards" }} />
          )}
          <g transform={`translate(${X(series.length - 1)}, ${Y(guess)})`} style={{ cursor: revealed ? "default" : "ns-resize" }}>
            <circle r="11" fill="rgba(255,138,61,.25)" className={revealed ? "" : "anim-breathe"} />
            <circle r="6.5" fill="#ff8a3d" stroke="#fff" strokeWidth="2" />
          </g>
          {revealed && <circle cx={X(series.length - 1)} cy={Y(actual)} r="5" fill="#fff" style={{ animation: "pop .4s 1s both", transformBox: "fill-box", transformOrigin: "center" }} />}
        </svg>
      </div>
      <div className="flex items-center gap-3 mt-3">
        {revealed ? (
          <div key={round} className="flex-1 anim-rise">
            <div className="flex items-baseline gap-2"><span className={cn("num text-2xl font-black", score > 70 ? "text-bull" : score > 40 ? "text-gold" : "text-bear")}>{score}</span><span className="text-[10px] text-mist">accuracy · off by {error.toFixed(1)} pts</span></div>
          </div>
        ) : (
          <div className="flex-1 text-[10px] text-mist">Drag anywhere to set your call · <span className="num text-flame font-black">{guess.toFixed(0)}</span></div>
        )}
        {revealed ? (
          <Btn variant="sky" size="sm" iconRight="chevR" onClick={() => { setRound((r) => r + 1); setRevealed(false); setGuess(50); }}>Next</Btn>
        ) : (
          <Btn variant="flame" size="sm" icon="eye" onClick={() => { setRevealed(true); setTotal((t) => t + score); }}>Reveal</Btn>
        )}
      </div>
      <div className="text-[9px] text-mist mt-2">Round {round} · total <b className="num text-fog">{total}</b></div>
    </Asset>
  );
}

/* =============================================================================
 * 7. Plan Order — drag to reorder the steps of a trade.
 * ============================================================================*/
const PLAN_STEPS = ["Identify the setup", "Set the stop-loss", "Size the position", "Enter the trade", "Journal the result"];
const ROW_H = 54;

function PlanOrder() {
  const shuffle = () => {
    let a = [0, 1, 2, 3, 4];
    do { a = [...a].sort(() => Math.random() - 0.5); } while (a.every((v, i) => v === i));
    return a;
  };
  const [order, setOrder] = useState<number[]>(shuffle);
  const [drag, setDrag] = useState<{ from: number; dy: number } | null>(null);
  const [checked, setChecked] = useState(false);
  const [burstN, setBurstN] = useState(0);
  const startY = useRef(0);
  const n = order.length;
  const target = drag ? clamp(drag.from + Math.round(drag.dy / ROW_H), 0, n - 1) : -1;

  const slotFor = (pos: number) => {
    if (!drag || pos === drag.from) return pos;
    if (drag.from < target && pos > drag.from && pos <= target) return pos - 1;
    if (drag.from > target && pos < drag.from && pos >= target) return pos + 1;
    return pos;
  };

  const drop = () => {
    if (!drag) return;
    const next = [...order];
    const [item] = next.splice(drag.from, 1);
    next.splice(target, 0, item);
    setOrder(next);
    setDrag(null);
    setChecked(false);
  };

  const allRight = order.every((v, i) => v === i);

  return (
    <Asset code="ARC-07" title="Plan Order" desc="Drag the steps into the correct trade sequence. Neighbours slide out of the way live; Check marks each row and shakes the wrong ones." tags={["drag reorder", "sortable", "validate"]}>
      <div className="relative" style={{ height: n * ROW_H }}>
        <Confetti burst={burstN} count={28} />
        {order.map((step, pos) => {
          const isDrag = drag?.from === pos;
          const top = isDrag ? pos * ROW_H + drag!.dy : slotFor(pos) * ROW_H;
          const ok = checked && step === pos;
          const bad = checked && step !== pos;
          return (
            <div
              key={step}
              onPointerDown={(e) => { startY.current = e.clientY; setDrag({ from: pos, dy: 0 }); setChecked(false); e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => { if (isDrag) setDrag({ from: pos, dy: e.clientY - startY.current }); }}
              onPointerUp={drop}
              onPointerCancel={drop}
              className={cn("absolute inset-x-0 h-[46px] rounded-xl border-2 flex items-center gap-3 px-3 cursor-grab active:cursor-grabbing touch-none select-none", ok ? "border-bull/60 bg-bull/10" : bad ? "border-bear/60 bg-bear/10 anim-shake" : "border-ink-600 bg-ink-800", isDrag && "z-20 cursor-grabbing")}
              style={{
                top,
                transition: isDrag ? "none" : "top .28s cubic-bezier(.2,.9,.3,1.15), background .2s, border-color .2s",
                transform: isDrag ? "scale(1.04) rotate(-1deg)" : "scale(1)",
                boxShadow: isDrag ? "0 18px 30px -12px rgba(0,0,0,.8)" : "0 4px 0 #0a1430",
              }}
            >
              <Icon name="menu" size={14} className="text-mist" />
              <span className={cn("num w-6 h-6 rounded-lg grid place-items-center text-[10px] font-black", ok ? "bg-bull text-ink-900" : "bg-white/5 text-mist")}>{pos + 1}</span>
              <span className="text-xs font-bold flex-1">{PLAN_STEPS[step]}</span>
              {ok && <Icon name="check" size={16} stroke={3} className="text-bull anim-pop" />}
              {bad && <span className="num text-[9px] text-bear font-black">→ {step + 1}</span>}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Btn variant="ghost" size="sm" icon="shuffle" onClick={() => { setOrder(shuffle()); setChecked(false); }}>Shuffle</Btn>
        <Btn variant={allRight && checked ? "bull" : "sky"} size="sm" icon="check" onClick={() => { setChecked(true); if (allRight) setBurstN((b) => b + 1); }}>{allRight && checked ? "Perfect plan" : "Check"}</Btn>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 8. Find the Alpha — shell game with 3D flips.
 * ============================================================================*/
function FindTheAlpha() {
  const [slots, setSlots] = useState([0, 1, 2]); // slots[card] = slot index
  const [prize, setPrize] = useState(1);
  const [faceUp, setFaceUp] = useState([true, true, true]);
  const [phase, setPhase] = useState<"ready" | "show" | "shuffle" | "pick" | "reveal">("ready");
  const [picked, setPicked] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [burstN, setBurstN] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const play = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    const p = Math.floor(Math.random() * 3);
    setPrize(p);
    setPicked(null);
    setFaceUp([true, true, true]);
    setSlots([0, 1, 2]);
    setPhase("show");
    later(() => setFaceUp([false, false, false]), 1100);
    const swaps = 6 + Math.min(4, streak);
    const speed = Math.max(240, 420 - streak * 40);
    later(() => {
      setPhase("shuffle");
      for (let k = 0; k < swaps; k++) {
        later(() => {
          setSlots((s) => {
            const a = Math.floor(Math.random() * 3);
            let b = Math.floor(Math.random() * 3);
            if (b === a) b = (a + 1) % 3;
            const next = [...s];
            const ca = next.indexOf(a), cb = next.indexOf(b);
            next[ca] = b;
            next[cb] = a;
            return next;
          });
        }, k * speed);
      }
      later(() => setPhase("pick"), swaps * speed + 200);
    }, 1500);
  };

  const pick = (card: number) => {
    if (phase !== "pick") return;
    setPicked(card);
    setPhase("reveal");
    setFaceUp((f) => f.map((v, i) => (i === card ? true : v)));
    later(() => setFaceUp([true, true, true]), 700);
    if (card === prize) { setStreak((s) => s + 1); setBurstN((b) => b + 1); } else setStreak(0);
  };

  return (
    <Asset code="ARC-08" title="Find the Alpha" desc="Watch the gold card, then track it through the shuffle. Cards glide between slots and flip in 3D; every win adds swaps and speed." tags={["3D flip", "shuffle", "tracking"]}>
      <div className="relative h-52 rounded-[22px] panel overflow-hidden" style={{ perspective: 900 }}>
        <Confetti burst={burstN} count={26} />
        {[0, 1, 2].map((card) => (
          <button
            key={card}
            onClick={() => pick(card)}
            className="absolute top-8 w-[28%] h-36 -translate-x-1/2"
            style={{ left: `${20 + slots[card] * 30}%`, transition: `left ${phase === "shuffle" ? 0.3 : 0.5}s cubic-bezier(.4,0,.2,1)`, cursor: phase === "pick" ? "pointer" : "default" }}
          >
            <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: faceUp[card] ? "rotateY(0)" : "rotateY(180deg)" }}>
              <div className="absolute inset-0 rounded-2xl grid place-items-center" style={{ backfaceVisibility: "hidden", background: card === prize ? "linear-gradient(180deg,#ffe08a,#f5b01c)" : "linear-gradient(180deg,#263a6a,#1c2b52)", boxShadow: card === prize ? "0 6px 0 #b07600" : "0 6px 0 #0b1430", color: card === prize ? "#5a3a00" : "#8ea3cf" }}>
                <div className="text-center"><Icon name={card === prize ? "crown" : "x"} size={34} /><div className="text-[9px] font-black uppercase mt-1">{card === prize ? "Alpha" : "Noise"}</div></div>
              </div>
              <div className="absolute inset-0 rounded-2xl grid place-items-center border-2 border-sky/30" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "repeating-linear-gradient(45deg,#1a56a8 0 8px,#2d8cf0 8px 16px)", boxShadow: phase === "pick" ? "0 6px 0 #0b1430, 0 0 18px rgba(61,165,255,.5)" : "0 6px 0 #0b1430" }}>
                <Icon name="logo" size={30} stroke={3} className="text-white" />
              </div>
            </div>
            {picked === card && phase === "reveal" && <span className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black anim-pop", card === prize ? "text-gold" : "text-bear")}>{card === prize ? "Found!" : "Missed"}</span>}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-mist">{phase === "show" ? "Memorize the gold card" : phase === "shuffle" ? "Follow it…" : phase === "pick" ? "Pick a card" : `Streak ${streak}`}</span>
        <Btn variant="gold" size="sm" icon="shuffle" disabled={phase === "show" || phase === "shuffle"} onClick={play}>{phase === "ready" ? "Play" : "Deal again"}</Btn>
      </div>
    </Asset>
  );
}

/* =============================================================================
 * 9. Tap the Bull — whack-a-mole: tap bulls, avoid FOMO rockets.
 * ============================================================================*/
type Pop = { id: number; hole: number; kind: "bull" | "fomo"; until: number; hit?: boolean };

function TapTheBull() {
  const [phase, setPhase] = useState<"idle" | "play" | "over">("idle");
  const [pops, setPops] = useState<Pop[]>([]);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [shake, setShake] = useState(0);
  const [floaters, setFloaters] = useState<{ id: number; hole: number; text: string; good: boolean }[]>([]);
  const clock = useRef({ t: 0, next: 0, id: 0 });
  const box = useRef<HTMLDivElement>(null);
  const visible = useVisible(box);

  const start = () => { clock.current = { t: 0, next: 0.4, id: 0 }; setPops([]); setScore(0); setTime(30); setPhase("play"); };

  useRafLoop((_, dt) => {
    if (phase !== "play") return;
    const c = clock.current;
    c.t += dt;
    const left = Math.max(0, 30 - c.t);
    setTime(Math.ceil(left));
    if (left <= 0) { setPhase("over"); setPops([]); return; }
    const life = Math.max(0.55, 1.05 - c.t * 0.015);
    if (c.t >= c.next) {
      setPops((ps) => {
        const busy = new Set(ps.map((p) => p.hole));
        const free = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((h) => !busy.has(h));
        if (!free.length) return ps;
        const hole = free[Math.floor(Math.random() * free.length)];
        return [...ps, { id: ++c.id, hole, kind: Math.random() < 0.28 ? "fomo" : "bull", until: c.t + life }];
      });
      c.next = c.t + Math.max(0.28, 0.6 - c.t * 0.01);
    }
    setPops((ps) => ps.filter((p) => p.until > c.t));
  }, visible);

  const hit = (p: Pop) => {
    if (p.hit || phase !== "play") return;
    setPops((ps) => ps.map((x) => (x.id === p.id ? { ...x, hit: true, until: clock.current.t + 0.25 } : x)));
    const good = p.kind === "bull";
    setScore((s) => Math.max(0, s + (good ? 10 : -15)));
    setFloaters((f) => [...f.slice(-6), { id: Date.now() + Math.random(), hole: p.hole, text: good ? "+10" : "−15 FOMO", good }]);
    if (!good) { setShake((s) => s + 1); navigator.vibrate?.([30, 30]); } else navigator.vibrate?.(8);
  };

  return (
    <Asset code="ARC-09" title="Tap the Bull" desc="Discipline drill: tap bulls as they pop up, ignore the FOMO rockets. Pop time shrinks and spawn rate climbs over the 30-second round." tags={["whack-a-mole", "speed ramp"]}>
      <div ref={box} key={shake} className={cn("relative rounded-[22px] p-3 bg-gradient-to-b from-[#0f2a55] to-[#081733]", shake > 0 && "anim-shake")}>
        <div className="flex items-center justify-between mb-2">
          <span className="num text-lg font-black">{score}</span>
          <div className="flex-1 mx-3"><Bar value={(time / 30) * 100} color={time <= 8 ? "bear" : "sky"} h={8} /></div>
          <span className="num text-xs font-black text-mist">{time}s</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {Array.from({ length: 9 }).map((_, hole) => {
            const p = pops.find((x) => x.hole === hole);
            const f = floaters.filter((x) => x.hole === hole).slice(-1)[0];
            return (
              <div key={hole} className="relative aspect-square rounded-full bg-ink-950 shadow-[inset_0_6px_12px_rgba(0,0,0,.8)] overflow-hidden">
                <button
                  onPointerDown={() => p && hit(p)}
                  className="absolute inset-2 rounded-full grid place-items-center"
                  style={{
                    transform: `translateY(${p && !p.hit ? "0%" : "110%"}) scale(${p?.hit ? 0.8 : 1})`,
                    transition: "transform .18s cubic-bezier(.2,.9,.3,1.3)",
                    background: p?.kind === "fomo" ? "radial-gradient(circle at 35% 30%,#ff7b95,#c0224a)" : "radial-gradient(circle at 35% 30%,#6dbbff,#1f6fd0)",
                    boxShadow: "inset 0 3px 0 rgba(255,255,255,.3)",
                  }}
                  aria-label={p ? (p.kind === "bull" ? "Bull" : "FOMO rocket") : "Empty hole"}
                >
                  {p && <Icon name={p.kind === "fomo" ? "rocket" : "trendUp"} size={24} stroke={2.6} className="text-white" />}
                </button>
                {f && <span key={f.id} className={cn("absolute inset-x-0 top-1 text-center text-[10px] font-black pointer-events-none", f.good ? "text-bull" : "text-bear")} style={{ animation: "riseOut .8s ease-out forwards" }}>{f.text}</span>}
              </div>
            );
          })}
        </div>
        {phase !== "play" && (
          <div className="absolute inset-0 rounded-[22px] grid place-items-center bg-ink-950/55 backdrop-blur-[2px] text-center">
            <div className="anim-pop">
              <div className="text-xl font-black">{phase === "over" ? `Score ${score}` : "Tap the Bull"}</div>
              <div className="text-[10px] text-mist mb-3">Bulls +10 · FOMO rockets −15</div>
              <Btn variant="sky" icon="hand" onClick={start}>{phase === "over" ? "Again" : "Start"}</Btn>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

export default function Arcade() {
  return (
    <Section id="arcade" index="P2" title="Arcade" subtitle="Nine playable mini-games that train trading instincts: timing, discipline, prediction, sequencing and restraint.">
      <CandleRunner />
      <ProfitStack />
      <CandleSlicer />
      <RewardReels />
      <ScratchCard />
      <PriceGuess />
      <PlanOrder />
      <FindTheAlpha />
      <TapTheBull />
    </Section>
  );
}
