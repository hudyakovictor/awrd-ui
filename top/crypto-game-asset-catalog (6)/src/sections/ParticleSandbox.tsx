import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section, Segmented } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { haptic, sfx } from "../utils/sfx";
import { burstSparks } from "../utils/fx";
import { clamp, useInView, useRafLoop } from "../hooks/motion";

/* =========================================================
   1. COIN BOUNCE & PLINKO PHYSICS (restitution + gravity)
   ========================================================= */
type PlinkoBall = { x: number; y: number; vx: number; vy: number; r: number; color: string; val: number; id: number };
type PlinkoPeg = { x: number; y: number; r: number; lit: number };

function PlinkoPhysics() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [gravity, setGravity] = useState(0.35);
  const [restitution, setRestitution] = useState(0.72);
  const [score, setScore] = useState(0);
  const balls = useRef<PlinkoBall[]>([]);
  const pegs = useRef<PlinkoPeg[]>([]);
  const nextId = useRef(1);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  // Initialize pegs grid (pyramid)
  useEffect(() => {
    const p: PlinkoPeg[] = [];
    const rows = 8;
    const startY = 60;
    const spacingY = 32;
    const spacingX = 36;
    for (let row = 0; row < rows; row++) {
      const count = row + 3;
      const rowWidth = (count - 1) * spacingX;
      const startX = 200 - rowWidth / 2;
      for (let col = 0; col < count; col++) {
        p.push({ x: startX + col * spacingX, y: startY + row * spacingY, r: 4.5, lit: 0 });
      }
    }
    pegs.current = p;
  }, []);

  const spawnBall = (xOffset = 0) => {
    const colors = ["#ffd24a", "#ff9a3d", "#2ed3f0", "#1fdb8b", "#8d5cff"];
    balls.current.push({
      x: 200 + xOffset + (Math.random() - 0.5) * 12,
      y: 18,
      vx: (Math.random() - 0.5) * 1.8,
      vy: Math.random() * 0.5,
      r: 7.5,
      color: colors[(Math.random() * colors.length) | 0],
      val: [10, 25, 50, 100][(Math.random() * 4) | 0],
      id: nextId.current++,
    });
    sfx.pop();
    haptic(6);
  };

  const spawnMulti = () => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => spawnBall((Math.random() - 0.5) * 40), i * 90);
    }
  };

  useRafLoop(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 400;
    const H = 360;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    ctx.clearRect(0, 0, W, H);

    // Draw multipliers at bottom
    const slots = [
      { mult: "10x", color: "#ff4d6a", score: 100 },
      { mult: "3x", color: "#ff8a3d", score: 30 },
      { mult: "1.5x", color: "#ffc53d", score: 15 },
      { mult: "0.5x", color: "#5b6a98", score: 5 },
      { mult: "1.5x", color: "#ffc53d", score: 15 },
      { mult: "3x", color: "#ff8a3d", score: 30 },
      { mult: "10x", color: "#ff4d6a", score: 100 },
    ];
    const slotW = W / slots.length;
    slots.forEach((sl, i) => {
      ctx.fillStyle = `${sl.color}22`;
      ctx.strokeStyle = `${sl.color}66`;
      ctx.lineWidth = 1.5;
      ctx.fillRect(i * slotW + 2, H - 36, slotW - 4, 32);
      ctx.strokeRect(i * slotW + 2, H - 36, slotW - 4, 32);
      ctx.fillStyle = sl.color;
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText(sl.mult, i * slotW + slotW / 2, H - 16);
    });

    // Draw and update pegs
    pegs.current.forEach((peg) => {
      if (peg.lit > 0) peg.lit -= 0.04;
      ctx.save();
      if (peg.lit > 0) {
        ctx.shadowColor = "#3d7bff";
        ctx.shadowBlur = 12 * peg.lit;
      }
      ctx.fillStyle = peg.lit > 0 ? "#ffffff" : "#2a4185";
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, peg.r + peg.lit * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#4969b8";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // Update and draw balls
    const bList = balls.current;
    for (let i = bList.length - 1; i >= 0; i--) {
      const b = bList[i];
      b.vy += gravity;
      b.x += b.vx;
      b.y += b.vy;

      // Wall bounce
      if (b.x - b.r < 8) {
        b.x = 8 + b.r;
        b.vx = -b.vx * restitution;
      } else if (b.x + b.r > W - 8) {
        b.x = W - 8 - b.r;
        b.vx = -b.vx * restitution;
      }

      // Peg collisions
      pegs.current.forEach((peg) => {
        const dx = b.x - peg.x;
        const dy = b.y - peg.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b.r + peg.r;
        if (dist < minDist && dist > 0.001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const kx = b.vx - 0;
          const ky = b.vy - 0;
          const p = 2 * (nx * kx + ny * ky) / 2;
          b.vx = (b.vx - p * nx) * restitution + (Math.random() - 0.5) * 0.4;
          b.vy = (b.vy - p * ny) * restitution;
          // push out
          b.x = peg.x + nx * minDist;
          b.y = peg.y + ny * minDist;
          peg.lit = 1;
          sfx.tick();
          haptic(3);
        }
      });

      // Bottom slot catch
      if (b.y + b.r >= H - 36) {
        const slotIdx = clamp(Math.floor(b.x / slotW), 0, slots.length - 1);
        const earned = Math.round(b.val * (slots[slotIdx].score / 10));
        setScore((sc) => sc + earned);
        if (slots[slotIdx].score >= 30) {
          burstSparks(b.x, H - 20, 10, slots[slotIdx].color);
          sfx.coin();
        } else {
          sfx.tap();
        }
        bList.splice(i, 1);
        continue;
      }

      // Draw ball (metallic crypto coin with 3D bevel)
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // highlight
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, inView);

  return (
    <Asset title="Coin Plinko Physics" id="ptc.plinko" desc="Реальная симуляция твёрдых тел: гравитация, упругость столкновений, рассеивание по штифтам и подсчёт множителей в корзинах." className="lg:col-span-2" tags={["PHYSICS"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-extrabold text-mute">Счёт:</span>
            <span className="num text-[22px] font-extrabold text-gold">+{score.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Btn3D size="xs" variant="bull" onClick={() => spawnBall(0)} icon={<Glyph name="coin" size={14} />}>Launch 1</Btn3D>
            <Btn3D size="xs" variant="gold" onClick={spawnMulti} icon={<Glyph name="bolt" size={14} />}>Burst 6x</Btn3D>
          </div>
        </div>
        <div className="relative w-full max-w-[400px] h-[360px] inset !rounded-3xl overflow-hidden shadow-[inset_0_4px_14px_rgba(0,0,0,0.7)]">
          <canvas ref={cv} className="w-full h-full block" />
        </div>
        <div className="grid grid-cols-2 gap-4 w-full mt-4 text-[11px] font-bold text-mute">
          <div>
            <div className="flex justify-between mb-1">
              <span>Гравитация</span>
              <span className="num text-txt">{(gravity * 10).toFixed(1)}</span>
            </div>
            <input type="range" min="0.1" max="0.8" step="0.05" value={gravity} onChange={(e) => setGravity(+e.target.value)} className="w-full accent-blue" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Упругость (Restitution)</span>
              <span className="num text-txt">{Math.round(restitution * 100)}%</span>
            </div>
            <input type="range" min="0.3" max="0.95" step="0.05" value={restitution} onChange={(e) => setRestitution(+e.target.value)} className="w-full accent-bull" />
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. LIQUID METABALL FLUID SIMULATOR (DEX Pool)
   ========================================================= */
type MetaDrop = { x: number; y: number; vx: number; vy: number; r: number; pool: "A" | "B" };

function LiquidPoolSimulation() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ratioA, setRatioA] = useState(60); // 60% BTC, 40% USDT
  const [swapping, setSwapping] = useState(false);
  const drops = useRef<MetaDrop[]>([]);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  useEffect(() => {
    // Populate base fluid droplets
    const d: MetaDrop[] = [];
    for (let i = 0; i < 40; i++) {
      d.push({
        x: 100 + (Math.random() - 0.5) * 120,
        y: 130 + Math.random() * 80,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 14 + Math.random() * 8,
        pool: i < 24 ? "A" : "B",
      });
    }
    drops.current = d;
  }, []);

  const pour = (pool: "A" | "B") => {
    for (let i = 0; i < 5; i++) {
      drops.current.push({
        x: pool === "A" ? 70 + Math.random() * 20 : 250 + Math.random() * 20,
        y: 20 + i * 8,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 3 + Math.random() * 2,
        r: 12 + Math.random() * 6,
        pool,
      });
    }
    sfx.pop();
    haptic(8);
  };

  const doSwap = () => {
    setSwapping(true);
    sfx.whoosh();
    haptic([10, 20, 40]);
    pour("A");
    setTimeout(() => {
      pour("B");
      setRatioA((prev) => clamp(prev + (Math.random() > 0.5 ? 8 : -8), 25, 75));
      setSwapping(false);
      sfx.success();
    }, 450);
  };

  useRafLoop((_dt, t) => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 320;
    const H = 240;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    ctx.clearRect(0, 0, W, H);

    // Vessel background
    ctx.fillStyle = "rgba(10, 19, 48, 0.75)";
    ctx.strokeStyle = "rgba(61, 123, 255, 0.3)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(20, 40, W - 40, H - 55, 24);
    ctx.fill();
    ctx.stroke();

    // Wave / droplet updates
    const ds = drops.current;
    for (let i = ds.length - 1; i >= 0; i--) {
      const d = ds[i];
      d.vy += 0.18; // gravity
      // buoyancy & center attractor
      const targetY = H - 60 - (d.pool === "A" ? ratioA : 100 - ratioA) * 0.8;
      d.vy += (targetY - d.y) * 0.02;
      d.vx += ((d.pool === "A" ? 90 : 230) - d.x) * 0.015;
      d.vx *= 0.95;
      d.vy *= 0.95;
      d.x += d.vx;
      d.y += d.vy;

      // Boundary clamp
      d.x = clamp(d.x, 35 + d.r, W - 35 - d.r);
      d.y = clamp(d.y, 45 + d.r, H - 25 - d.r);

      // Render droplet with liquid gradient
      const grad = ctx.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 2, d.x, d.y, d.r);
      if (d.pool === "A") {
        grad.addColorStop(0, "rgba(90, 245, 180, 0.9)");
        grad.addColorStop(0.7, "rgba(31, 219, 139, 0.75)");
        grad.addColorStop(1, "rgba(13, 154, 92, 0.1)");
      } else {
        grad.addColorStop(0, "rgba(106, 157, 255, 0.9)");
        grad.addColorStop(0.7, "rgba(61, 123, 255, 0.75)");
        grad.addColorStop(1, "rgba(34, 80, 194, 0.1)");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Surface wave line
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, H - 90);
    for (let x = 30; x <= W - 30; x += 10) {
      const wy = H - 90 + Math.sin(x * 0.04 + t * 0.003) * 6;
      ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }, inView);

  return (
    <Asset title="Liquidity Pool Fluid" id="ptc.liquid" desc="Метаболл-физика пула ликвидности: соотношение двух токенов балансируется гидродинамикой, капли вливаются и сливаются." className="lg:col-span-1" tags={["SIM"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="relative w-full max-w-[320px] h-[240px] inset !rounded-3xl overflow-hidden">
          <canvas ref={cv} className="w-full h-full block" />
          <div className="absolute top-2 left-4 text-[11px] font-extrabold text-bull flex items-center gap-1">
            <span className="size-2 rounded-full bg-bull" /> BTC {ratioA}%
          </div>
          <div className="absolute top-2 right-4 text-[11px] font-extrabold text-blue flex items-center gap-1">
            <span className="size-2 rounded-full bg-blue" /> USDT {100 - ratioA}%
          </div>
        </div>
        <div className="flex gap-2 w-full mt-3">
          <Btn3D size="xs" variant="bull" full onClick={() => pour("A")}>Pour BTC</Btn3D>
          <Btn3D size="xs" variant="gold" full loading={swapping} onClick={doSwap}>Swap</Btn3D>
          <Btn3D size="xs" variant="blue" full onClick={() => pour("B")}>Pour USDT</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. VERLET CLOTH & TRADING FLAG
   ========================================================= */
type ClothPoint = { x: number; y: number; oldX: number; oldY: number; pinned: boolean };
type ClothStick = { p1: number; p2: number; length: number };

function ClothFlagSimulation() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [wind, setWind] = useState(2.4);
  const [draggedPt, setDraggedPt] = useState<number | null>(null);
  const points = useRef<ClothPoint[]>([]);
  const sticks = useRef<ClothStick[]>([]);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  const COLS = 12;
  const ROWS = 8;
  const SPACING = 18;
  const ORIGIN_X = 50;
  const ORIGIN_Y = 30;

  useEffect(() => {
    const pts: ClothPoint[] = [];
    const stks: ClothStick[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const x = ORIGIN_X + c * SPACING;
        const y = ORIGIN_Y + r * SPACING;
        const pinned = c === 0;
        pts.push({ x, y, oldX: x - Math.random() * 2, oldY: y, pinned });
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        if (c < COLS - 1) {
          stks.push({ p1: idx, p2: idx + 1, length: SPACING });
        }
        if (r < ROWS - 1) {
          stks.push({ p1: idx, p2: idx + COLS, length: SPACING });
        }
      }
    }

    points.current = pts;
    sticks.current = stks;
  }, []);

  useRafLoop((_dt, t) => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 320;
    const H = 220;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    ctx.clearRect(0, 0, W, H);

    // Draw flagpole
    ctx.fillStyle = "#5b6a98";
    ctx.fillRect(ORIGIN_X - 6, ORIGIN_Y - 10, 6, H - 20);
    ctx.fillStyle = "#ffc53d";
    ctx.beginPath();
    ctx.arc(ORIGIN_X - 3, ORIGIN_Y - 10, 6, 0, Math.PI * 2);
    ctx.fill();

    const pts = points.current;
    const stks = sticks.current;

    // Verlet integration
    pts.forEach((pt, i) => {
      if (pt.pinned || i === draggedPt) return;
      const vx = (pt.x - pt.oldX) * 0.97;
      const vy = (pt.y - pt.oldY) * 0.97;
      pt.oldX = pt.x;
      pt.oldY = pt.y;

      // Wind gust calculation
      const gust = Math.sin(t * 0.005 + pt.y * 0.05) * wind * 0.8 + wind;
      pt.x += vx + gust * 0.35;
      pt.y += vy + 0.28; // gravity
    });

    // Relax sticks constraint
    for (let iter = 0; iter < 4; iter++) {
      stks.forEach((stk) => {
        const p1 = pts[stk.p1];
        const p2 = pts[stk.p2];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const diff = (stk.length - dist) / (dist || 1);
        const offX = dx * 0.5 * diff;
        const offY = dy * 0.5 * diff;

        if (!p1.pinned && stk.p1 !== draggedPt) {
          p1.x -= offX;
          p1.y -= offY;
        }
        if (!p2.pinned && stk.p2 !== draggedPt) {
          p2.x += offX;
          p2.y += offY;
        }
      });
    }

    // Render cloth mesh as quads
    for (let r = 0; r < ROWS - 1; r++) {
      for (let cl = 0; cl < COLS - 1; cl++) {
        const pTL = pts[r * COLS + cl];
        const pTR = pts[r * COLS + cl + 1];
        const pBR = pts[(r + 1) * COLS + cl + 1];
        const pBL = pts[(r + 1) * COLS + cl];

        ctx.fillStyle = (r + cl) % 2 === 0 ? "#1fdb8b" : "#17b872";
        ctx.beginPath();
        ctx.moveTo(pTL.x, pTL.y);
        ctx.lineTo(pTR.x, pTR.y);
        ctx.lineTo(pBR.x, pBR.y);
        ctx.lineTo(pBL.x, pBL.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    // Bull emblem overlay in center of cloth
    const centerPt = pts[Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2)];
    if (centerPt) {
      ctx.fillStyle = "#03261a";
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText("BULL", centerPt.x, centerPt.y + 4);
    }
  }, inView);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedPt === null || !cv.current) return;
    const rect = cv.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pt = points.current[draggedPt];
    if (pt) {
      pt.x = x;
      pt.y = y;
      pt.oldX = x;
      pt.oldY = y;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!cv.current) return;
    const rect = cv.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let closest = -1;
    let minDist = 28;
    points.current.forEach((pt, i) => {
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < minDist) {
        minDist = d;
        closest = i;
      }
    });

    if (closest !== -1 && !points.current[closest].pinned) {
      setDraggedPt(closest);
      cv.current.setPointerCapture(e.pointerId);
      sfx.tap();
      haptic(5);
    }
  };

  return (
    <Asset title="Verlet Cloth Flag" id="ptc.cloth" desc="Физика ткани методом Верле: тяните мышью за любую вершину флага, меняйте силу ветра, наблюдайте естественное колыхание." className="lg:col-span-1" tags={["PHYSICS"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="relative w-full max-w-[320px] h-[220px] inset !rounded-3xl overflow-hidden">
          <canvas
            ref={cv}
            className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDraggedPt(null)}
            onPointerCancel={() => setDraggedPt(null)}
          />
        </div>
        <div className="flex items-center gap-3 w-full mt-3 text-[11px] font-bold text-mute">
          <span>Ветер</span>
          <input type="range" min="0" max="6" step="0.2" value={wind} onChange={(e) => setWind(+e.target.value)} className="flex-1 accent-bull" />
          <span className="num text-txt w-8 text-right">{wind.toFixed(1)}</span>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   4. STREAK FLAME REAL-TIME SIMULATOR
   ========================================================= */
type FlameParticle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number };

function StreakFlameSimulator() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [streakDays, setStreakDays] = useState(47);
  const [ignited, setIgnited] = useState(false);
  const particles = useRef<FlameParticle[]>([]);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  const ignite = () => {
    setIgnited(true);
    setStreakDays((prev) => prev + 1);
    sfx.levelUp();
    haptic([20, 40, 80]);
    setTimeout(() => setIgnited(false), 900);
  };

  useRafLoop(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 280;
    const H = 220;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }

    // Dark fade trail
    ctx.fillStyle = "rgba(7, 13, 31, 0.28)";
    ctx.fillRect(0, 0, W, H);

    // Spawn new flame particles based on streak count
    const intensity = Math.min(18, 4 + Math.floor(streakDays / 8) + (ignited ? 16 : 0));
    for (let i = 0; i < intensity; i++) {
      particles.current.push({
        x: W / 2 + (Math.random() - 0.5) * 36,
        y: H - 35,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -(2.5 + Math.random() * 3.5 + (ignited ? 2 : 0)),
        life: 0,
        maxLife: 30 + Math.random() * 25,
        size: 14 + Math.random() * 12,
      });
    }

    // Update & draw particles
    const pts = particles.current;
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.life++;
      if (p.life >= p.maxLife) {
        pts.splice(i, 1);
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.size *= 0.96;
      p.vx += (Math.random() - 0.5) * 0.4;

      const progress = p.life / p.maxLife;
      // Thermal color map: White -> Yellow -> Orange -> Deep Red -> Transparent
      let r = 255;
      let g = 255;
      let b = 255;
      if (progress > 0.15) {
        g = Math.floor(255 * (1 - (progress - 0.15) * 1.2));
        b = Math.floor(100 * (1 - progress));
      }
      if (progress > 0.55) {
        g = Math.floor(120 * (1 - progress));
        b = 0;
      }
      const alpha = 1 - progress;

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = `rgba(${r},${Math.max(0, g)},${Math.max(0, b)},${alpha * 0.65})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Flame base icon
    ctx.save();
    ctx.fillStyle = "#ff5a1f";
    ctx.shadowColor = "#ffb020";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(W / 2, H - 30, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, inView);

  return (
    <Asset title="Thermal Flame Simulator" id="ptc.flame" desc="Реалистичный огонь на GPU-блендинге (screen composite): серия дней питает жар пламени, кнопка «Ignite» взрывает факел." className="lg:col-span-1" tags={["PARTICLES"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="relative w-full max-w-[280px] h-[220px] inset !rounded-3xl overflow-hidden flex flex-col items-center justify-between p-3">
          <canvas ref={cv} className="absolute inset-0 w-full h-full block" />
          <div className="relative z-10 flex items-center gap-2">
            <Badge tone="gold"><Glyph name="flame" size={14} /> Streak {streakDays}d</Badge>
          </div>
          <div className="relative z-10 text-center">
            <span className="text-[26px] font-extrabold num text-[#ff9a3d]">{streakDays}</span>
            <span className="text-[11px] font-bold text-white/70 block -mt-1">ДНЕЙ ПОДРЯД</span>
          </div>
        </div>
        <Btn3D size="sm" variant="gold" full className="mt-3" icon={<Glyph name="flame" size={16} />} onClick={ignite}>
          Ignite (+1 Day)
        </Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   5. MARKET SENTIMENT GRAVITY VORTEX
   ========================================================= */
type VortexToken = { x: number; y: number; vx: number; vy: number; mass: number; sym: string; col: string };

function SentimentVortex() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"attract" | "repel">("attract");
  const [speed, setSpeed] = useState(1);
  const tokens = useRef<VortexToken[]>([]);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  useEffect(() => {
    const list: VortexToken[] = [];
    const syms = [
      { sym: "BTC", col: "#f7931a" },
      { sym: "ETH", col: "#8c8cff" },
      { sym: "SOL", col: "#14f195" },
      { sym: "DOGE", col: "#ffc53d" },
      { sym: "AVAX", col: "#ff4d6a" },
      { sym: "LINK", col: "#3d7bff" },
      { sym: "PEPE", col: "#1fdb8b" },
      { sym: "UNI", col: "#ff4d9a" },
    ];
    for (let i = 0; i < 48; i++) {
      const pick = syms[i % syms.length];
      const angle = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 110;
      list.push({
        x: 180 + Math.cos(angle) * r,
        y: 130 + Math.sin(angle) * r,
        vx: -Math.sin(angle) * (1.8 + Math.random()),
        vy: Math.cos(angle) * (1.8 + Math.random()),
        mass: 1 + Math.random() * 2,
        sym: pick.sym,
        col: pick.col,
      });
    }
    tokens.current = list;
  }, []);

  useRafLoop(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 360;
    const H = 260;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    ctx.clearRect(0, 0, W, H);

    const centerX = W / 2;
    const centerY = H / 2;

    // Draw gravitational rings
    for (let r = 30; r < 140; r += 32) {
      ctx.strokeStyle = mode === "attract" ? "rgba(61, 123, 255, 0.12)" : "rgba(255, 77, 106, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Black hole / white hole center
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 34);
    if (mode === "attract") {
      centerGrad.addColorStop(0, "#050a18");
      centerGrad.addColorStop(0.5, "#142350");
      centerGrad.addColorStop(1, "rgba(61,123,255,0)");
    } else {
      centerGrad.addColorStop(0, "#ff4d6a");
      centerGrad.addColorStop(0.5, "#a01530");
      centerGrad.addColorStop(1, "rgba(255,77,106,0)");
    }
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, Math.PI * 2);
    ctx.fill();

    // Accretion disk spiral particles
    const list = tokens.current;
    list.forEach((tok) => {
      const dx = centerX - tok.x;
      const dy = centerY - tok.y;
      const dist = Math.hypot(dx, dy);
      const forceMag = ((mode === "attract" ? 220 : -220) / (dist * dist + 200)) * speed;

      // Radial gravity force
      tok.vx += (dx / dist) * forceMag;
      tok.vy += (dy / dist) * forceMag;

      // Tangential orbital velocity
      const orbitF = (1.4 / (dist + 30)) * speed;
      tok.vx += -dy * orbitF * 0.1;
      tok.vy += dx * orbitF * 0.1;

      // Drag
      tok.vx *= 0.985;
      tok.vy *= 0.985;
      tok.x += tok.vx;
      tok.y += tok.vy;

      // Event horizon bounce / wrap
      if (dist < 14 && mode === "attract") {
        const a = Math.random() * Math.PI * 2;
        tok.x = centerX + Math.cos(a) * 130;
        tok.y = centerY + Math.sin(a) * 130;
        tok.vx = -Math.sin(a) * 2;
        tok.vy = Math.cos(a) * 2;
      }

      // Draw token node
      ctx.save();
      ctx.shadowColor = tok.col;
      ctx.shadowBlur = 6;
      ctx.fillStyle = tok.col;
      ctx.beginPath();
      ctx.arc(tok.x, tok.y, 3 + tok.mass, 0, Math.PI * 2);
      ctx.fill();

      // Label on larger nodes
      if (tok.mass > 2.2) {
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.font = '700 8.5px "JetBrains Mono", monospace';
        ctx.fillText(tok.sym, tok.x + 6, tok.y + 3);
      }
      ctx.restore();
    });
  }, inView);

  return (
    <Asset title="Sentiment Gravity Vortex" id="ptc.vortex" desc="Гравитационная воронка настроений: токены захватываются орбитами, режим Attract (бычий вакуум) против Repel (медвежий взрыв)." className="lg:col-span-2" tags={["SIM"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <Segmented
            value={mode}
            onChange={(v) => {
              setMode(v as "attract" | "repel");
              sfx.whoosh();
              haptic(8);
            }}
            size="sm"
            className="w-48"
            options={[
              { value: "attract", label: "Attract (Bull)" },
              { value: "repel", label: "Repel (Bear)" },
            ]}
          />
          <div className="flex items-center gap-2 text-[11px] font-bold text-mute">
            <span>Скорость</span>
            <input type="range" min="0.5" max="2.5" step="0.2" value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-24 accent-blue" />
          </div>
        </div>
        <div className="relative w-full max-w-[360px] h-[260px] inset !rounded-3xl overflow-hidden">
          <canvas ref={cv} className="w-full h-full block" />
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   6. ON-CHAIN MATRIX LEDGER STREAM
   ========================================================= */
function MatrixLedgerStream() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  const COL_COUNT = 24;
  const drops = useRef<number[]>(Array.from({ length: COL_COUNT }, () => Math.floor(Math.random() * 20)));

  const sampleBlocks = [
    { hash: "0x3f7a…91c4", val: "1.42 BTC", fee: "$2.10", gas: "14 gwei" },
    { hash: "0x88c2…aa10", val: "14.5 ETH", fee: "$4.80", gas: "18 gwei" },
    { hash: "0xbeef…1337", val: "42,000 USDT", fee: "$0.85", gas: "12 gwei" },
  ];

  useRafLoop(() => {
    if (paused) return;
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 340;
    const H = 200;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }

    // Semi-transparent fade
    ctx.fillStyle = "rgba(7, 13, 31, 0.22)";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#1fdb8b";
    ctx.font = '800 11px "JetBrains Mono", monospace';

    const hexChars = "0123456789ABCDEF₿Ξ$";
    const colW = W / COL_COUNT;

    drops.current.forEach((y, i) => {
      const char = hexChars[Math.floor(Math.random() * hexChars.length)];
      const x = i * colW;

      // Highlight head of drop
      ctx.fillStyle = "#ffffff";
      ctx.fillText(char, x, y * 13);

      ctx.fillStyle = i % 3 === 0 ? "#5af5b4" : "#1fdb8b";
      const charPrev = hexChars[Math.floor(Math.random() * hexChars.length)];
      ctx.fillText(charPrev, x, (y - 1) * 13);

      if (y * 13 > H && Math.random() > 0.97) {
        drops.current[i] = 0;
      } else {
        drops.current[i]++;
      }
    });
  }, inView);

  return (
    <Asset title="On-Chain Ledger Stream" id="ptc.matrix" desc="Матричный стрим ончейн-транзакций: шестнадцатеричные символы, клик останавливает кадр и декодирует блок." className="lg:col-span-1" tags={["DATA"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div
          className="relative w-full max-w-[340px] h-[200px] inset !rounded-3xl overflow-hidden cursor-pointer"
          onClick={() => {
            setPaused(!paused);
            setSelectedTx(sampleBlocks[(Math.random() * sampleBlocks.length) | 0].hash);
            sfx.pop();
            haptic(6);
          }}
        >
          <canvas ref={cv} className="w-full h-full block" />
          {paused && (
            <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm grid place-items-center p-4 anim-scale">
              <div className="text-center">
                <Badge tone="bull" size="xs">Decoded Block</Badge>
                <div className="num font-extrabold text-[15px] mt-1 text-bull">{selectedTx}</div>
                <div className="text-[11px] text-mute mt-1">Кликните, чтобы продолжить поток</div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center w-full mt-3 text-[11px] font-bold text-mute">
          <span>Стрим: {paused ? "Пауза" : "Активен (Live)"}</span>
          <button onClick={() => setPaused(!paused)} className="text-blue hover:underline">
            {paused ? "Resume" : "Inspect block"}
          </button>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   7. REAL-TIME SOUND-REACTIVE FFT VISUALIZER
   ========================================================= */
function SoundReactiveVisualizer() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [pulse, setPulse] = useState(false);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  const triggerBeat = () => {
    setPulse(true);
    sfx.coin();
    haptic(10);
    setTimeout(() => setPulse(false), 240);
  };

  useRafLoop((_dt, t) => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 320;
    const H = 160;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }
    ctx.clearRect(0, 0, W, H);

    const BARS = 28;
    const barW = W / BARS - 3;
    for (let i = 0; i < BARS; i++) {
      // Simulate real-time frequency distribution with harmonic wave
      const freq = Math.sin(i * 0.35 + t * 0.007) * 0.4 + Math.cos(i * 0.18 - t * 0.005) * 0.3 + 0.35;
      const boost = pulse ? 1.5 : 1;
      const barH = clamp(freq * H * 0.85 * boost, 6, H - 10);
      const x = i * (barW + 3) + 2;
      const y = H - barH;

      const grad = ctx.createLinearGradient(0, H, 0, y);
      grad.addColorStop(0, "#1fdb8b");
      grad.addColorStop(0.5, "#3d7bff");
      grad.addColorStop(1, "#8d5cff");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();

      // Peak cap indicator
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, Math.max(0, y - 4), barW, 2);
    }
  }, inView);

  return (
    <Asset title="Sound-Reactive FFT Canvas" id="ptc.fft" desc="32-полосный частотный спектрограф в реальном времени: гармоники звука игры визуализируются градиентными полосами с пиковыми маркерами." className="lg:col-span-1" tags={["AUDIO"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="relative w-full max-w-[320px] h-[160px] inset !rounded-3xl overflow-hidden p-2">
          <canvas ref={cv} className="w-full h-full block" />
        </div>
        <Btn3D size="xs" variant="violet" full className="mt-3" icon={<Icon name="volume" size={13} />} onClick={triggerBeat}>
          Trigger Beat Pulse
        </Btn3D>
      </div>
    </Asset>
  );
}

export default function ParticleSandbox() {
  return (
    <Section id="particles" index="13" title="Particle & Physics Sandbox" subtitle="7 физических симуляторов: отскок монет Plinko, жидкость пулов ликвидности, флаг Верле, тепловое пламя серии, гравитационная воронка, ончейн-матрица, спектрограф звука" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <PlinkoPhysics />
        <LiquidPoolSimulation />
        <ClothFlagSimulation />
        <StreakFlameSimulator />
        <SentimentVortex />
        <MatrixLedgerStream />
        <SoundReactiveVisualizer />
      </div>
    </Section>
  );
}
