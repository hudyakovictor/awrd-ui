import { useCallback, useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Burst, Icon, Section, useBump } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useRaf } from "../ui/hooks";
import { pointerPos, roundRect, useCanvas } from "../ui/canvas";
import { feel, haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* Shared best-score memory (session) */
const bests: Record<string, number> = {};

function GameShell({ id, title, desc, tags, score, best, playing, onStart, children, footer, className }: {
  id: string; title: string; desc: string; tags: string[]; score: number; best: number; playing: boolean; onStart: () => void; children: React.ReactNode; footer?: React.ReactNode; className?: string;
}) {
  return (
    <AssetCard id={id} title={title} desc={desc} tags={tags} className={className}>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-gold"><Icon name="bolt" size={16} variant="solid" />{score}</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-ink-400"><Icon name="trophy" size={13} variant="solid" className="text-ink-500" />best {best}</span>
      </div>
      {children}
      <div className="mt-3 flex items-center gap-2">
        <Btn v="bull" size="sm" block onClick={onStart}><Icon name={playing ? "refresh" : "play"} size={14} variant={playing ? "line" : "solid"} />{playing ? "Restart" : "Play"}</Btn>
        {footer}
      </div>
    </AssetCard>
  );
}

/* ═════════ ARC-01 · Candle Catcher ═════════ */
type Falling = { x: number; y: number; vy: number; up: boolean; r: number };
function CandleCatcher() {
  const game = useGame();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(bests.catch ?? 0);
  const st = useRef({ basket: 0.5, items: [] as Falling[], spawn: 0, speed: 1, score: 0, lives: 3, over: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const start = useCallback(() => { st.current = { basket: 0.5, items: [], spawn: 0, speed: 1, score: 0, lives: 3, over: false }; setScore(0); setLives(3); setPlaying(true); feel("whoosh"); }, []);
  const cvRef = useCanvas((g, w, h, dt) => {
    const s = st.current;
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#0a1330"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) { g.globalAlpha = 0.12; g.fillStyle = "#22376f"; g.fillRect((i * 53) % w, ((i * 97) % h), 1.5, 1.5); }
    g.globalAlpha = 1;
    if (playing && !s.over) {
      s.spawn -= dt; s.speed += dt * 0.00003;
      if (s.spawn <= 0) { s.spawn = 620 / s.speed; s.items.push({ x: 20 + Math.random() * (w - 40), y: -20, vy: (0.06 + Math.random() * 0.04) * s.speed, up: Math.random() > 0.32, r: 0 }); }
      const bx = s.basket * (w - 60) + 30;
      for (let i = s.items.length - 1; i >= 0; i--) {
        const it = s.items[i];
        it.y += it.vy * dt; it.r += dt * 0.004;
        if (it.y > h - 42 && it.y < h - 6 && Math.abs(it.x - bx) < 38) {
          s.items.splice(i, 1);
          if (it.up) { s.score += 1; setScore(s.score); sfx.play("coin"); haptic(6); game.reward({ xp: 1, silent: true }); }
          else { s.lives -= 1; setLives(s.lives); feel("error", 30); if (s.lives <= 0) { s.over = true; setPlaying(false); if (s.score > (bests.catch ?? 0)) { bests.catch = s.score; setBest(s.score); } game.complete({ skill: "candles", xp: Math.min(30, 5 + s.score) }); } }
          continue;
        }
        if (it.y > h + 20) { s.items.splice(i, 1); }
      }
      for (const it of s.items) {
        const col = it.up ? "#2ee59d" : "#ff4d6a";
        g.save(); g.translate(it.x, it.y); g.rotate(Math.sin(it.r) * 0.3);
        g.fillStyle = col; g.fillRect(-4, -12, 8, 24); g.fillRect(-1, -18, 2, 36);
        g.restore();
      }
      g.save(); g.translate(bx, h - 24);
      g.fillStyle = "#3d8bff"; roundRect(g, -38, -6, 76, 22, 8); g.fill();
      g.fillStyle = "#1e56c9"; roundRect(g, -38, 8, 76, 8, 4); g.fill();
      g.fillStyle = "#5ce1ff"; g.font = "800 12px Manrope"; g.textAlign = "center"; g.fillText("▲", 0, 8);
      g.restore();
    }
  }, true);
  useEffect(() => { canvasRef.current = cvRef.current; });
  const move = (clientX: number) => { if (!cvRef.current) return; const p = pointerPos(cvRef.current, clientX, 0); st.current.basket = clamp((p.x - 30) / (cvRef.current.clientWidth - 60), 0, 1); };
  return (
    <GameShell id="ARC-01" title="Candle Catcher" desc="Аркада: лови зелёные (бычьи) свечи корзиной, пропускай красные — они стоят жизни. Скорость растёт. Управление: тяни/веди мышью." tags={["arcade", "game", "canvas", "reflex"]} score={score} best={best} playing={playing} onStart={start}
      footer={<span className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon name="heart" size={16} variant="solid" />{lives}</span>}>
      <div className="relative">
        <canvas ref={cvRef} className="well aspect-[4/3] w-full touch-none rounded-2xl" onPointerMove={(e) => move(e.clientX)} onPointerDown={(e) => move(e.clientX)} />
        {!playing && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/60 backdrop-blur-[1px]">
            <div className="text-center"><Mascot mood={score > 0 ? "cool" : "idle"} size={64} /><div className="mt-1 text-sm font-extrabold text-white">{score > 0 ? `Поймано: ${score}` : "Лови только зелёные"}</div></div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

/* ═════════ ARC-02 · Rocket Run (endless runner) ═════════ */
function RocketRun() {
  const game = useGame();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bests.run ?? 0);
  const st = useRef({ y: 0, vy: 0, ground: true, obstacles: [] as { x: number; h: number; gap: boolean }[], coins: [] as { x: number; y: number }[], spawn: 0, speed: 0.28, dist: 0, over: false, frame: 0, score: 0 });
  const start = useCallback(() => { st.current = { y: 0, vy: 0, ground: true, obstacles: [], coins: [], spawn: 0, speed: 0.28, dist: 0, over: false, frame: 0, score: 0 }; setScore(0); setPlaying(true); feel("whoosh"); }, []);
  const jump = () => { const s = st.current; if (!playing) return; if (s.ground) { s.vy = -0.62; s.ground = false; feel("tap", 8); } };
  const cvRef = useCanvas((g, w, h, dt) => {
    const s = st.current;
    g.clearRect(0, 0, w, h);
    const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, "#0d1839"); grad.addColorStop(1, "#111f47"); g.fillStyle = grad; g.fillRect(0, 0, w, h);
    const gy = h - 30;
    s.frame += dt;
    for (let i = 0; i < 30; i++) { g.globalAlpha = 0.15; g.fillStyle = "#fff"; g.fillRect((i * 89 - s.dist * 0.3) % w + (i % 2 ? 0 : w), (i * 53) % (gy - 20), 1.5, 1.5); }
    g.globalAlpha = 1;
    if (playing && !s.over) {
      s.speed += dt * 0.00002; s.dist += s.speed * dt;
      s.vy += 0.0022 * dt; s.y += s.vy * dt;
      if (s.y >= 0) { s.y = 0; s.vy = 0; s.ground = true; }
      s.spawn -= dt;
      if (s.spawn <= 0) { s.spawn = 900 / s.speed / 0.28; s.obstacles.push({ x: w + 20, h: 22 + Math.random() * 34, gap: false }); if (Math.random() > 0.4) s.coins.push({ x: w + 20 + 40, y: gy - 60 - Math.random() * 50 }); }
      const px = 46, py = gy + s.y - 12;
      for (let i = s.obstacles.length - 1; i >= 0; i--) { const o = s.obstacles[i]; o.x -= s.speed * dt; if (o.x < -30) { s.obstacles.splice(i, 1); s.score += 1; setScore(s.score); continue; }
        if (Math.abs(o.x - px) < 20 && py + 12 > gy - o.h) { s.over = true; setPlaying(false); feel("error", [40, 40, 60]); if (s.score > (bests.run ?? 0)) { bests.run = s.score; setBest(s.score); } game.complete({ skill: "psychology", xp: Math.min(30, 5 + s.score) }); } }
      for (let i = s.coins.length - 1; i >= 0; i--) { const c = s.coins[i]; c.x -= s.speed * dt; if (c.x < -20) { s.coins.splice(i, 1); continue; }
        if (Math.hypot(c.x - px, c.y - py) < 22) { s.coins.splice(i, 1); s.score += 3; setScore(s.score); sfx.play("coin"); game.reward({ gems: 1, silent: true }); } }
      // ground
      g.fillStyle = "#1a2c60"; g.fillRect(0, gy, w, h - gy);
      g.strokeStyle = "#2ee59d"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, gy); g.lineTo(w, gy); g.stroke();
      // obstacles (red candles)
      for (const o of s.obstacles) { g.fillStyle = "#ff4d6a"; roundRect(g, o.x - 8, gy - o.h, 16, o.h, 3); g.fill(); g.fillRect(o.x - 1, gy - o.h - 6, 2, 6); }
      // coins
      for (const c of s.coins) { g.fillStyle = "#ffc53d"; g.beginPath(); g.arc(c.x, c.y, 8, 0, Math.PI * 2); g.fill(); g.fillStyle = "#7a4a00"; g.font = "800 10px Manrope"; g.textAlign = "center"; g.fillText("$", c.x, c.y + 3.5); }
      // rocket
      g.save(); g.translate(px, py); g.rotate(clamp(s.vy, -0.4, 0.4));
      for (let k = 0; k < 5; k++) { g.globalAlpha = 0.3 - k * 0.05; g.fillStyle = k % 2 ? "#ffc53d" : "#ff8a3d"; g.beginPath(); g.ellipse(-14 - k * 7 - (s.ground ? 4 : 0), 0, 7 - k, 4, 0, 0, Math.PI * 2); g.fill(); }
      g.globalAlpha = 1;
      g.fillStyle = "#e6ebf8"; g.beginPath(); g.moveTo(16, 0); g.lineTo(-8, -9); g.lineTo(-8, 9); g.closePath(); g.fill();
      g.fillStyle = "#3d8bff"; g.beginPath(); g.arc(2, 0, 4, 0, Math.PI * 2); g.fill();
      g.restore();
      g.fillStyle = "#8fa0cf"; g.font = "800 11px JetBrains Mono"; g.textAlign = "right"; g.fillText(`${Math.floor(s.dist / 50)}m`, w - 8, 16);
    }
  }, true);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); jump(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  return (
    <GameShell id="ARC-02" title="Rocket Run" desc="Бесконечный раннер: тап/пробел — прыжок над красными свечами, собирай монеты. Скорость постоянно растёт. Проверка тайминга и нервов." tags={["arcade", "runner", "canvas", "endless"]} score={score} best={best} playing={playing} onStart={start}>
      <div className="relative">
        <canvas ref={cvRef} onPointerDown={jump} className="well aspect-[4/3] w-full cursor-pointer touch-none rounded-2xl" />
        {!playing && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/60"><div className="text-center"><Icon name="rocket" size={44} variant="duo" className="mx-auto text-flame" /><div className="mt-1 text-sm font-extrabold text-white">{score > 0 ? `Score ${score}` : "Тап = прыжок"}</div></div></div>}
      </div>
    </GameShell>
  );
}

/* ═════════ ARC-03 · Liquidation Popper ═════════ */
type Bub = { x: number; y: number; vx: number; vy: number; r: number; kind: "green" | "red" | "gold"; life: number };
function BubblePop() {
  const game = useGame();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [best, setBest] = useState(bests.pop ?? 0);
  const st = useRef({ bubs: [] as Bub[], spawn: 0, score: 0, time: 20, over: true, combo: 0, comboT: 0 });
  const start = useCallback(() => { st.current = { bubs: [], spawn: 0, score: 0, time: 20, over: false, combo: 0, comboT: 0 }; setScore(0); setTime(20); setPlaying(true); feel("whoosh"); }, []);
  const cvRef = useCanvas((g, w, h, dt) => {
    const s = st.current;
    g.clearRect(0, 0, w, h); g.fillStyle = "#081130"; g.fillRect(0, 0, w, h);
    if (playing && !s.over) {
      s.time -= dt / 1000; if (s.time <= 0) { s.time = 0; s.over = true; setPlaying(false); setTime(0); if (s.score > (bests.pop ?? 0)) { bests.pop = s.score; setBest(s.score); } game.complete({ skill: "patterns", xp: Math.min(30, Math.round(s.score / 3)) }); }
      setTime(Math.ceil(s.time));
      if (s.comboT > 0) s.comboT -= dt; else s.combo = 0;
      s.spawn -= dt;
      if (s.spawn <= 0) { s.spawn = 340; const roll = Math.random(); const kind = roll > 0.85 ? "gold" : roll > 0.55 ? "red" : "green"; const r = kind === "gold" ? 14 : 18 + Math.random() * 10; s.bubs.push({ x: 30 + Math.random() * (w - 60), y: h + 30, vx: (Math.random() - 0.5) * 0.04, vy: -(0.05 + Math.random() * 0.05), r, kind, life: 0 }); }
      for (let i = s.bubs.length - 1; i >= 0; i--) { const b = s.bubs[i]; b.x += b.vx * dt; b.y += b.vy * dt; b.life += dt; if (b.y < -40) s.bubs.splice(i, 1); }
      for (const b of s.bubs) {
        const col = b.kind === "green" ? "#2ee59d" : b.kind === "red" ? "#ff4d6a" : "#ffc53d";
        g.beginPath(); g.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const rg = g.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 2, b.x, b.y, b.r);
        rg.addColorStop(0, col); rg.addColorStop(1, col + "55"); g.fillStyle = rg; g.fill();
        g.strokeStyle = col; g.lineWidth = 1.5; g.stroke();
        g.fillStyle = "#0a1330"; g.font = `800 ${b.r * 0.7}px Manrope`; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(b.kind === "gold" ? "$" : b.kind === "green" ? "↑" : "↓", b.x, b.y);
      }
      g.fillStyle = "#8fa0cf"; g.font = "800 12px JetBrains Mono"; g.textAlign = "left"; g.textBaseline = "alphabetic";
      if (s.combo > 1) { g.fillStyle = "#ff8a3d"; g.fillText(`combo ×${s.combo}`, 8, 18); }
    }
  }, true);
  const pop = (clientX: number, clientY: number) => {
    if (!cvRef.current || !playing) return; const s = st.current; const p = pointerPos(cvRef.current, clientX, clientY);
    for (let i = s.bubs.length - 1; i >= 0; i--) { const b = s.bubs[i]; if (Math.hypot(b.x - p.x, b.y - p.y) < b.r + 6) {
      s.bubs.splice(i, 1);
      if (b.kind === "red") { s.score = Math.max(0, s.score - 3); s.combo = 0; feel("error", 25); }
      else { s.combo += 1; s.comboT = 1400; const add = (b.kind === "gold" ? 5 : 1) * Math.min(5, s.combo); s.score += add; sfx.play(b.kind === "gold" ? "combo" : "pop"); haptic(6); if (b.kind === "gold") game.reward({ gems: 1, silent: true }); }
      setScore(s.score); return;
    } }
  };
  return (
    <GameShell id="ARC-03" title="Liquidation Popper" desc="20 секунд: лопай зелёные (↑) и золотые ($) пузыри, не трогай красные (↓). Быстрые серии дают комбо-множитель очков." tags={["arcade", "tap", "canvas", "combo"]} score={score} best={best} playing={playing} onStart={start}
      footer={<span className="flex items-center gap-1 font-mono text-sm font-extrabold text-sky"><Icon name="clock" size={15} />{time}s</span>}>
      <div className="relative">
        <canvas ref={cvRef} onPointerDown={(e) => pop(e.clientX, e.clientY)} className="well aspect-[4/3] w-full cursor-pointer touch-none rounded-2xl" />
        {!playing && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/60"><div className="text-center"><div className="text-2xl font-extrabold text-white">{score > 0 ? `${score} pts` : "Pop!"}</div><div className="text-xs text-ink-400">green & gold only</div></div></div>}
      </div>
    </GameShell>
  );
}

/* ═════════ ARC-04 · Coin Stacker ═════════ */
function CoinStacker() {
  const game = useGame();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bests.stack ?? 0);
  const st = useRef({ blocks: [] as { x: number; w: number }[], cur: { x: 0, w: 120, dir: 1 }, speed: 0.22, over: true, offset: 0, perfect: 0 });
  const start = useCallback(() => { st.current = { blocks: [{ x: 0, w: 120 }], cur: { x: -60, w: 120, dir: 1 }, speed: 0.22, over: false, offset: 0, perfect: 0 }; setScore(0); setPlaying(true); feel("whoosh"); }, []);
  const cvRef = useCanvas((g, w, h, dt) => {
    const s = st.current;
    g.clearRect(0, 0, w, h);
    const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, "#0d1839"); grad.addColorStop(1, "#081130"); g.fillStyle = grad; g.fillRect(0, 0, w, h);
    const BH = 22, baseY = h - 30, cx = w / 2;
    const targetOffset = Math.max(0, s.blocks.length - 6) * BH;
    s.offset += (targetOffset - s.offset) * 0.1;
    if (playing && !s.over) { const c = s.cur; c.x += c.dir * s.speed * dt; const lim = w / 2 - c.w / 2; if (c.x > lim) { c.x = lim; c.dir = -1; } if (c.x < -lim) { c.x = -lim; c.dir = 1; } }
    for (let i = 0; i < s.blocks.length; i++) { const b = s.blocks[i]; const y = baseY - i * BH + s.offset; if (y > h + BH || y < -BH) continue;
      const hue = 150 + i * 6; g.fillStyle = `hsl(${hue} 70% 55%)`; roundRect(g, cx + b.x - b.w / 2, y - BH, b.w, BH - 3, 4); g.fill();
      g.fillStyle = `hsl(${hue} 70% 65%)`; g.fillRect(cx + b.x - b.w / 2 + 3, y - BH + 3, b.w - 6, 3);
    }
    if (playing && !s.over) { const c = s.cur; const y = baseY - s.blocks.length * BH + s.offset;
      g.fillStyle = "#ffc53d"; roundRect(g, cx + c.x - c.w / 2, y - BH, c.w, BH - 3, 4); g.fill();
      g.fillStyle = "#7a4a00"; g.font = "800 12px Manrope"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", cx + c.x, y - BH / 2 - 1);
    }
  }, true);
  const drop = () => {
    const s = st.current; if (!playing || s.over) return;
    const top = s.blocks[s.blocks.length - 1]; const c = s.cur;
    const overlap = Math.min(top.x + top.w / 2, c.x + c.w / 2) - Math.max(top.x - top.w / 2, c.x - c.w / 2);
    if (overlap <= 2) { s.over = true; setPlaying(false); feel("error", [40, 40, 60]); if (score > (bests.stack ?? 0)) { bests.stack = score; setBest(score); } game.complete({ skill: "risk", xp: Math.min(30, 5 + score) }); return; }
    const perfect = Math.abs(top.x - c.x) < 6;
    const nx = perfect ? top.x : (Math.max(top.x - top.w / 2, c.x - c.w / 2) + Math.min(top.x + top.w / 2, c.x + c.w / 2)) / 2;
    const nw = perfect ? c.w : overlap;
    s.blocks.push({ x: nx, w: nw }); s.speed += 0.006;
    if (perfect) { s.perfect += 1; sfx.play("combo"); haptic([8, 20]); game.reward({ gems: 1, silent: true }); } else { s.perfect = 0; sfx.play("pop"); haptic(6); }
    s.cur = { x: -w2() / 2 + nw / 2, w: nw, dir: 1 };
    setScore(s.blocks.length - 1);
  };
  const w2 = () => cvRef.current?.clientWidth ?? 300;
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); drop(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  return (
    <GameShell id="ARC-04" title="Coin Stacker" desc="Тап в нужный момент — блок ложится на башню. Точное попадание не режет блок и даёт гем. Тайминг и терпение вместо жадности." tags={["arcade", "timing", "canvas", "stack"]} score={score} best={best} playing={playing} onStart={start}>
      <div className="relative">
        <canvas ref={cvRef} onPointerDown={drop} className="well aspect-[4/3] w-full cursor-pointer touch-none rounded-2xl" />
        {!playing && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/60"><div className="text-center"><div className="text-2xl font-extrabold text-white">{score > 0 ? `Height ${score}` : "Stack it"}</div><div className="text-xs text-ink-400">tap to drop</div></div></div>}
      </div>
    </GameShell>
  );
}

/* ═════════ ARC-05 · Balloon Pump (risk & greed) ═════════ */
function BalloonPump() {
  const game = useGame();
  const [size, setSize] = useState(0);
  const [bank, setBank] = useState(0);
  const [round, setRound] = useState(0);
  const [state, setState] = useState<"idle" | "pumping" | "popped" | "cashed">("idle");
  const [best, setBest] = useState(bests.balloon ?? 0);
  const popAt = useRef(0);
  const [b, bump] = useBump();
  const pot = Math.floor(size * size * 0.5);
  const risk = clamp(size / 100, 0, 1);
  const start = () => { popAt.current = 40 + Math.random() * 60; setSize(0); setState("pumping"); feel("tap", 6); };
  const pump = () => {
    if (state !== "pumping") return;
    const ns = size + 4 + Math.random() * 3;
    if (ns >= popAt.current) { setSize(ns); setState("popped"); setRound((r) => r + 1); feel("error", [50, 40, 80]); }
    else { setSize(ns); sfx.play("tick"); haptic(clamp(Math.round(ns / 10), 2, 10)); }
  };
  const cash = () => {
    if (state !== "pumping") return;
    setState("cashed"); setBank((x) => x + pot); setRound((r) => r + 1); bump(); feel("success", [20, 30, 60]);
    game.reward({ gems: Math.round(pot / 10) });
    if (bank + pot > (bests.balloon ?? 0)) { bests.balloon = bank + pot; setBest(bank + pot); }
  };
  const col = risk < 0.4 ? "#2ee59d" : risk < 0.7 ? "#ffc53d" : "#ff4d6a";
  return (
    <AssetCard id="ARC-05" title="Balloon Pump" desc="Игра жадности: качай шар — банк растёт квадратично, но шар лопнет в случайный момент. Забери до взрыва. Учит фиксировать прибыль." tags={["arcade", "risk", "greed", "gamble"]}>
      <div className="mb-2 flex items-center justify-between font-mono text-sm font-extrabold"><span className="text-violet"><Icon name="gem" size={15} variant="solid" className="mr-1 inline" />{bank}</span><span className="text-ink-400 text-[11px]">best {best}</span></div>
      <div className="relative grid h-52 place-items-center rounded-2xl bg-ink-950/60">
        <div className="relative" style={{ transform: `scale(${state === "popped" ? 1.3 : 1})`, transition: "transform .1s" }}>
          {state === "popped" ? (
            <div className="text-center"><div className="text-4xl">💥</div><Burst trigger={round} count={20} spread={100} colors={["#ff4d6a", "#ff8a3d", "#fff"]} /></div>
          ) : (
            <svg width="150" height="170" viewBox="0 0 150 170">
              <ellipse cx="75" cy={90 - size * 0.3} rx={20 + size * 0.9} ry={24 + size} fill={col} opacity=".9" style={{ transition: "all .12s ease-out" }} />
              <ellipse cx={68 - size * 0.15} cy={80 - size * 0.5} rx={6 + size * 0.15} ry={9 + size * 0.25} fill="#fff" opacity=".4" />
              <path d={`M75 ${114 + size * 0.7} l-5 8 h10z`} fill={col} />
              <line x1="75" y1={122 + size * 0.7} x2="75" y2="168" stroke="#5a70ad" strokeWidth="1.5" />
              <text x="75" y={92 - size * 0.3} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="800" fill="#0a1330">${pot}</text>
            </svg>
          )}
          <Burst trigger={state === "cashed" ? b : 0} colors={["#2ee59d", "#ffc53d"]} />
        </div>
        {state !== "idle" && state !== "popped" && <div className="absolute bottom-3 left-3 right-3"><div className="well h-2 overflow-hidden rounded-full"><div className="h-full rounded-full transition-[width]" style={{ width: `${risk * 100}%`, background: col }} /></div><div className="mt-1 text-center text-[10px] font-extrabold uppercase" style={{ color: col }}>{risk < 0.4 ? "Safe" : risk < 0.7 ? "Getting risky" : "About to pop!"}</div></div>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {state === "pumping" ? <>
          <Btn v="sky" onClick={pump}><Icon name="plus" size={16} stroke={3} />Pump</Btn>
          <Btn v="bull" onClick={cash}><Icon name="gem" size={16} variant="solid" />Cash ${pot}</Btn>
        </> : <Btn v="gold" block className="col-span-2" onClick={start}><Icon name="play" size={16} variant="solid" />{state === "idle" ? "Start" : state === "popped" ? "Лопнул! Ещё раз" : `Забрал! Ещё раунд`}</Btn>}
      </div>
    </AssetCard>
  );
}

/* ═════════ ARC-06 · Whack-a-Dip ═════════ */
function WhackDip() {
  const game = useGame();
  const [holes, setHoles] = useState<(null | "dip" | "pump")[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [best, setBest] = useState(bests.whack ?? 0);
  const [hit, setHit] = useState<number | null>(null);
  const holesRef = useRef(holes); holesRef.current = holes;
  const scoreRef = useRef(0);
  useRaf((dt) => {
    if (!playing) return;
    tRef.current -= dt; if (tRef.current <= 0) return;
    spawnRef.current -= dt;
    if (spawnRef.current <= 0) { spawnRef.current = 620 - Math.min(300, score * 8); const empty = holesRef.current.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0); if (empty.length) { const idx = empty[Math.floor(Math.random() * empty.length)]; const kind = Math.random() > 0.35 ? "dip" : "pump"; setHoles((h) => h.map((v, i) => (i === idx ? kind : v))); window.setTimeout(() => setHoles((h) => h.map((v, i) => (i === idx && v === kind ? null : v))), 900); } }
  }, playing);
  const tRef = useRef(20); const spawnRef = useRef(0);
  const start = () => { tRef.current = 20; spawnRef.current = 0; scoreRef.current = 0; setScore(0); setTime(20); setHoles(Array(9).fill(null)); setPlaying(true); feel("whoosh"); timer(); };
  const timer = () => { const iv = setInterval(() => { tRef.current <= 0 ? (clearInterval(iv), setPlaying(false), setTime(0), finish()) : setTime(Math.ceil(tRef.current / 1000) * 1); setTime(Math.max(0, Math.ceil(tRef.current / 1000))); if (tRef.current <= 0) clearInterval(iv); }, 200); };
  const finish = () => { if (scoreRef.current > (bests.whack ?? 0)) { bests.whack = scoreRef.current; setBest(scoreRef.current); } game.complete({ skill: "psychology", xp: Math.min(30, Math.round(scoreRef.current / 2)) }); };
  const whack = (i: number) => { if (!playing) return; const v = holes[i]; if (!v) return; setHit(i); window.setTimeout(() => setHit(null), 200); setHoles((h) => h.map((x, k) => (k === i ? null : x))); if (v === "dip") { scoreRef.current += 1; setScore(scoreRef.current); sfx.play("pop"); haptic(8); } else { scoreRef.current = Math.max(0, scoreRef.current - 2); setScore(scoreRef.current); feel("error", 25); } };
  return (
    <AssetCard id="ARC-06" title="Buy the Dip · Whack" desc="За 20 секунд «выкупай» красные проливы (dip) тапом и не трогай зелёные памп-пузыри. Кроты выскакивают всё быстрее." tags={["arcade", "reflex", "grid", "timer"]}>
      <div className="mb-2 flex items-center justify-between font-mono text-sm font-extrabold"><span className="text-gold"><Icon name="bolt" size={15} variant="solid" className="mr-1 inline" />{score}</span><span className="text-sky"><Icon name="clock" size={14} className="mr-1 inline" />{time}s</span></div>
      <div className="grid grid-cols-3 gap-2">
        {holes.map((v, i) => (
          <button key={i} onPointerDown={() => whack(i)} className={cn("relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-ink-950/70 shadow-[inset_0_4px_10px_#000a]", hit === i && "anim-jelly")}>
            <div className="absolute bottom-0 h-1/3 w-full rounded-t-[50%] bg-ink-800" />
            {v && <div className="anim-pop" style={{ animation: "popIn .2s cubic-bezier(.2,1.4,.4,1) both" }}>
              <div className={cn("grid h-12 w-12 place-items-center rounded-full", v === "dip" ? "bg-gradient-to-b from-bear to-bear-edge" : "bg-gradient-to-b from-bull to-bull-edge")}>
                <Icon name={v === "dip" ? "trendDown" : "trendUp"} size={22} stroke={3} className="text-white" />
              </div>
            </div>}
          </button>
        ))}
      </div>
      <Btn v="bull" size="sm" block className="mt-3" onClick={start}><Icon name={playing ? "refresh" : "play"} size={14} variant="solid" />{playing ? "…" : score > 0 ? `Best ${best} · Again` : "Play"}</Btn>
    </AssetCard>
  );
}

/* ═════════ ARC-07 · Trend Snake ═════════ */
function TrendSnake() {
  const game = useGame();
  const N = 13;
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bests.snake ?? 0);
  const st = useRef({ snake: [{ x: 6, y: 6 }], dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, food: { x: 9, y: 6 }, acc: 0, step: 200, over: true, score: 0 });
  const start = useCallback(() => { st.current = { snake: [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }], dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 }, food: { x: 9, y: 6 }, acc: 0, step: 200, over: false, score: 0 }; setScore(0); setPlaying(true); feel("whoosh"); }, []);
  const turn = (x: number, y: number) => { const s = st.current; if (s.dir.x === -x && s.dir.y === -y) return; s.nextDir = { x, y }; };
  const cvRef = useCanvas((g, w, h, dt) => {
    const s = st.current; const cell = Math.min(w, h) / N; const ox = (w - cell * N) / 2, oy = (h - cell * N) / 2;
    g.clearRect(0, 0, w, h); g.fillStyle = "#081130"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#16264f"; g.lineWidth = 1;
    for (let i = 0; i <= N; i++) { g.beginPath(); g.moveTo(ox + i * cell, oy); g.lineTo(ox + i * cell, oy + N * cell); g.stroke(); g.beginPath(); g.moveTo(ox, oy + i * cell); g.lineTo(ox + N * cell, oy + i * cell); g.stroke(); }
    if (playing && !s.over) {
      s.acc += dt;
      if (s.acc >= s.step) { s.acc = 0; s.dir = s.nextDir;
        const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || s.snake.some((p) => p.x === head.x && p.y === head.y)) { s.over = true; setPlaying(false); feel("error", [40, 40, 60]); if (s.score > (bests.snake ?? 0)) { bests.snake = s.score; setBest(s.score); } game.complete({ skill: "patterns", xp: Math.min(30, 3 + s.score) }); }
        else { s.snake.unshift(head); if (head.x === s.food.x && head.y === s.food.y) { s.score += 1; setScore(s.score); s.step = Math.max(80, s.step - 6); sfx.play("coin"); haptic(6); do { s.food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; } while (s.snake.some((p) => p.x === s.food.x && p.y === s.food.y)); } else s.snake.pop(); }
      }
      // food (green candle)
      g.fillStyle = "#2ee59d"; roundRect(g, ox + s.food.x * cell + cell * 0.25, oy + s.food.y * cell + cell * 0.15, cell * 0.5, cell * 0.7, 2); g.fill();
      // snake
      s.snake.forEach((p, i) => { const t = i / s.snake.length; g.fillStyle = i === 0 ? "#ffc53d" : `hsl(${200 - t * 40} 80% ${55 - t * 15}%)`; roundRect(g, ox + p.x * cell + 1.5, oy + p.y * cell + 1.5, cell - 3, cell - 3, 4); g.fill(); });
    }
  }, true);
  useEffect(() => { const k = (e: KeyboardEvent) => { const m: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }; if (m[e.key]) { e.preventDefault(); turn(m[e.key][0], m[e.key][1]); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  const startDrag = useRef<{ x: number; y: number } | null>(null);
  return (
    <GameShell id="ARC-07" title="Trend Snake" desc="Змейка-тренд: собирай зелёные свечи, растёт длина и скорость. Свайп по полю или стрелки задают направление." tags={["arcade", "snake", "canvas", "swipe"]} score={score} best={best} playing={playing} onStart={start}>
      <div className="relative">
        <canvas ref={cvRef} className="well aspect-square w-full touch-none rounded-2xl"
          onPointerDown={(e) => { startDrag.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={(e) => { const s = startDrag.current; if (!s) return; const dx = e.clientX - s.x, dy = e.clientY - s.y; if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return; if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy)); startDrag.current = null; }} />
        {!playing && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/60"><div className="text-center"><div className="text-2xl font-extrabold text-white">{score > 0 ? `Length ${score + 3}` : "🐍"}</div><div className="text-xs text-ink-400">swipe to steer</div></div></div>}
      </div>
    </GameShell>
  );
}

/* ═════════ ARC-08 · Chart Flappy ═════════ */
function ChartFlappy() {
  const game = useGame();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bests.flappy ?? 0);
  const st = useRef({ y: 0.5, vy: 0, pipes: [] as { x: number; gap: number; passed: boolean }[], spawn: 0, over: true, score: 0 });
  const start = useCallback(() => { st.current = { y: 0.5, vy: 0, pipes: [], spawn: 0, over: false, score: 0 }; setScore(0); setPlaying(true); feel("whoosh"); }, []);
  const flap = () => { if (!playing) return; st.current.vy = -0.011; feel("tap", 6); };
  const cvRef = useCanvas((g, w, h, dt) => {
    const s = st.current; g.clearRect(0, 0, w, h);
    const grad = g.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, "#0d1839"); grad.addColorStop(1, "#111f47"); g.fillStyle = grad; g.fillRect(0, 0, w, h);
    if (playing && !s.over) {
      s.vy += 0.00006 * dt; s.y += s.vy * dt * 0.06;
      s.spawn -= dt; if (s.spawn <= 0) { s.spawn = 1500; s.pipes.push({ x: w + 30, gap: 0.28 + Math.random() * 0.44, passed: false }); }
      const px = w * 0.28, py = s.y * h;
      const gapH = h * 0.32;
      for (let i = s.pipes.length - 1; i >= 0; i--) { const p = s.pipes[i]; p.x -= 0.14 * dt; if (p.x < -40) { s.pipes.splice(i, 1); continue; }
        const gy = p.gap * h;
        if (!p.passed && p.x < px) { p.passed = true; s.score += 1; setScore(s.score); sfx.play("coin"); }
        if (Math.abs(p.x - px) < 24 && (py < gy - gapH / 2 || py > gy + gapH / 2)) { s.over = true; setPlaying(false); feel("error", [40, 40, 60]); if (s.score > (bests.flappy ?? 0)) { bests.flappy = s.score; setBest(s.score); } game.complete({ skill: "psychology", xp: Math.min(30, 4 + s.score * 2) }); }
        g.fillStyle = "#ff4d6a"; g.fillRect(p.x - 12, 0, 24, gy - gapH / 2); g.fillRect(p.x - 12, gy + gapH / 2, 24, h - (gy + gapH / 2));
        g.fillStyle = "#c21f43"; g.fillRect(p.x - 14, gy - gapH / 2 - 8, 28, 8); g.fillRect(p.x - 14, gy + gapH / 2, 28, 8);
      }
      if (py > h || py < 0) { s.over = true; setPlaying(false); feel("error", [40, 40, 60]); }
      // trail
      g.strokeStyle = "#5ce1ff44"; g.lineWidth = 2; g.beginPath(); g.moveTo(px - 40, py - s.vy * 200); g.lineTo(px, py); g.stroke();
      g.save(); g.translate(px, py); g.rotate(clamp(s.vy * 30, -0.5, 0.7));
      g.fillStyle = "#5ce1ff"; g.beginPath(); g.arc(0, 0, 9, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#0a1330"; g.font = "800 9px Manrope"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 0, 0.5);
      g.restore();
    }
  }, true);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); flap(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); });
  return (
    <GameShell id="ARC-08" title="Chart Flappy" desc="Проведи цену сквозь коридоры волатильности: тап/пробел — импульс вверх, гравитация тянет вниз. Классика на реакцию." tags={["arcade", "flappy", "canvas", "reflex"]} score={score} best={best} playing={playing} onStart={start}>
      <div className="relative">
        <canvas ref={cvRef} onPointerDown={flap} className="well aspect-[4/3] w-full cursor-pointer touch-none rounded-2xl" />
        {!playing && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-ink-950/60"><div className="text-center"><div className="text-2xl font-extrabold text-white">{score > 0 ? score : "Tap!"}</div><div className="text-xs text-ink-400">keep the price alive</div></div></div>}
      </div>
    </GameShell>
  );
}

/* ═════════ ARC-09 · Simon Signals ═════════ */
const SIG = [{ c: "#2ee59d", n: "buy", f: 330 }, { c: "#ff4d6a", n: "sell", f: 262 }, { c: "#ffc53d", n: "hold", f: 392 }, { c: "#3d8bff", n: "wait", f: 440 }];
function SimonSignals() {
  const game = useGame();
  const [seq, setSeq] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [state, setState] = useState<"idle" | "show" | "input" | "over">("idle");
  const [best, setBest] = useState(bests.simon ?? 0);
  const inputIdx = useRef(0);
  const beep = (i: number) => { const s = SIG[i]; try { sfx.play("tick"); } catch { /* */ } void s.f; };
  const showSeq = (s: number[]) => {
    setState("show"); let k = 0;
    const iv = setInterval(() => { if (k >= s.length) { clearInterval(iv); setState("input"); inputIdx.current = 0; return; } const idx = s[k]; setFlash(idx); beep(idx); haptic(8); window.setTimeout(() => setFlash(null), 320); k++; }, 560);
  };
  const next = (cur: number[]) => { const ns = [...cur, Math.floor(Math.random() * 4)]; setSeq(ns); window.setTimeout(() => showSeq(ns), 600); };
  const start = () => { setSeq([]); setState("idle"); feel("whoosh"); next([]); };
  const press = (i: number) => {
    if (state !== "input") return;
    setFlash(i); beep(i); haptic(6); window.setTimeout(() => setFlash(null), 160);
    if (seq[inputIdx.current] === i) { inputIdx.current++; if (inputIdx.current === seq.length) { sfx.play("success"); const lvl = seq.length; if (lvl > best) { bests.simon = lvl; setBest(lvl); } game.reward({ xp: 2, silent: true }); setState("show"); window.setTimeout(() => next(seq), 700); } }
    else { setState("over"); feel("error", [40, 40, 60]); game.complete({ skill: "candles", xp: Math.min(30, seq.length * 3) }); }
  };
  return (
    <AssetCard id="ARC-09" title="Simon Signals" desc="Память на сигналы: запомни и повтори растущую последовательность (buy/sell/hold/wait). Каждый цвет со своим звуком и вспышкой." tags={["arcade", "memory", "sequence", "audio"]}>
      <div className="mb-2 flex items-center justify-between font-mono text-sm font-extrabold"><span className="text-gold">Level {Math.max(0, seq.length)}</span><span className="text-ink-400 text-[11px]">best {best}</span></div>
      <div className="relative mx-auto grid max-w-[240px] grid-cols-2 gap-3">
        {SIG.map((s, i) => (
          <button key={s.n} onPointerDown={() => press(i)} disabled={state !== "input"} className="grid aspect-square place-items-center rounded-3xl text-sm font-extrabold uppercase tracking-wider transition-all duration-100" style={{ background: `linear-gradient(160deg, ${s.c}, ${s.c}77)`, boxShadow: flash === i ? `0 0 40px ${s.c}, inset 0 0 0 3px #fff` : "0 5px 0 rgba(0,0,0,.35)", transform: flash === i ? "scale(.94)" : "scale(1)", opacity: flash === i || state === "input" ? 1 : 0.78 }}>
            <span className="text-ink-900">{s.n}</span>
          </button>
        ))}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          {(state === "idle" || state === "over") && <div className="pointer-events-auto rounded-2xl bg-ink-950/80 px-4 py-3 text-center backdrop-blur"><div className="text-sm font-extrabold text-white">{state === "over" ? `Ошибка на уровне ${seq.length}` : "Повтори сигналы"}</div><Btn v="bull" size="sm" className="mt-2" onClick={start}><Icon name="play" size={13} variant="solid" />{state === "over" ? "Again" : "Start"}</Btn></div>}
        </div>
      </div>
      <div className="mt-3 text-center text-[11px] font-bold text-ink-400">{state === "show" ? "Смотри…" : state === "input" ? `Твой ход: ${inputIdx.current}/${seq.length}` : ""}</div>
    </AssetCard>
  );
}

/* ═════════ ARC-10 · Merge Coins (2048-lite) ═════════ */
const TIERS = ["🥉", "🥈", "🥇", "💵", "💰", "💎", "👑"];
const TCOL = ["#8c6239", "#9aa8c7", "#ffc53d", "#2ee59d", "#3d8bff", "#a174ff", "#ff4d6a"];
function MergeCoins() {
  const game = useGame();
  const N = 4;
  const [grid, setGrid] = useState<number[]>(() => Array(16).fill(-1));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(bests.merge ?? 0);
  const [b, bump] = useBump();
  const start = useCallback((first = false) => {
    const g = Array(16).fill(-1);
    const add = () => { const e = g.map((v, i) => (v < 0 ? i : -1)).filter((i) => i >= 0); if (e.length) g[e[Math.floor(Math.random() * e.length)]] = 0; };
    add(); add(); setGrid(g); setScore(0); if (!first) feel("whoosh");
  }, []);
  useEffect(() => { start(true); }, [start]);
  const move = useCallback((dir: "l" | "r" | "u" | "d") => {
    setGrid((prev) => {
      const g = [...prev]; let moved = false, gained = 0;
      const line = (idx: number[]) => {
        let vals = idx.map((i) => g[i]).filter((v) => v >= 0);
        for (let i = 0; i < vals.length - 1; i++) { if (vals[i] === vals[i + 1]) { vals[i]++; gained += (vals[i] + 1) * 2; vals.splice(i + 1, 1); if (vals[i] === TIERS.length - 1) game.reward({ gems: 5, silent: true }); } }
        while (vals.length < N) vals.push(-1);
        idx.forEach((cell, k) => { if (g[cell] !== vals[k]) moved = true; g[cell] = vals[k]; });
      };
      for (let r = 0; r < N; r++) { const row = [0, 1, 2, 3].map((c) => r * N + c); line(dir === "r" ? [...row].reverse() : dir === "l" ? row : row); }
      if (dir === "u" || dir === "d") { for (let c = 0; c < N; c++) { const col = [0, 1, 2, 3].map((r) => r * N + c); line(dir === "d" ? [...col].reverse() : col); } }
      if (dir === "l" || dir === "r") { /* already handled rows */ }
      if (moved) {
        const e = g.map((v, i) => (v < 0 ? i : -1)).filter((i) => i >= 0); if (e.length) g[e[Math.floor(Math.random() * e.length)]] = 0;
        sfx.play("pop"); haptic(6);
        setScore((sc) => { const ns = sc + gained; if (ns > (bests.merge ?? 0)) { bests.merge = ns; setBest(ns); } return ns; });
        if (gained > 0) bump();
      }
      return g;
    });
    if (game.complete) game.complete({ skill: "defi", xp: 1, ok: true });
  }, [game, bump]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { const m: Record<string, "l" | "r" | "u" | "d"> = { ArrowLeft: "l", ArrowRight: "r", ArrowUp: "u", ArrowDown: "d" }; if (m[e.key]) { e.preventDefault(); move(m[e.key]); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [move]);
  const start2 = useRef<{ x: number; y: number } | null>(null);
  return (
    <AssetCard id="ARC-10" title="Merge Coins · 2048" desc="Свайпай сетку — одинаковые монеты сливаются в старший ранг (🥉→👑). Стрелки на десктопе, свайп на телефоне. Дошёл до алмаза — гемы." tags={["arcade", "puzzle", "merge", "swipe"]}>
      <div className="mb-2 flex items-center justify-between font-mono text-sm font-extrabold"><span className="text-gold">{score}</span><span className="text-ink-400 text-[11px]">best {best}</span></div>
      <div className="relative mx-auto aspect-square w-full max-w-[280px] touch-none rounded-2xl bg-ink-950/70 p-2"
        onPointerDown={(e) => (start2.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => { const s = start2.current; if (!s) return; const dx = e.clientX - s.x, dy = e.clientY - s.y; if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "r" : "l"); else move(dy > 0 ? "d" : "u"); start2.current = null; }}>
        <div className="grid h-full grid-cols-4 gap-2">
          {grid.map((v, i) => (
            <div key={i} className="grid place-items-center rounded-xl bg-ink-800/60">
              {v >= 0 && <div key={`${i}-${v}-${b}`} className="grid h-full w-full place-items-center rounded-xl text-2xl anim-pop" style={{ background: `${TCOL[v]}33`, boxShadow: `inset 0 0 0 2px ${TCOL[v]}` }}>{TIERS[v]}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-2"><Btn v="ghost" size="sm" block onClick={() => start()}><Icon name="refresh" size={14} />New game</Btn></div>
    </AssetCard>
  );
}

export default function Arcade() {
  return (
    <Section id="arcade" num="18" title="Arcade" subtitle="10 играбельных мини-игр на canvas-физике: ловец свечей, раннер, поппер, стакер, шар жадности, whack, змейка, flappy, Simon, merge">
      <CandleCatcher />
      <RocketRun />
      <BubblePop />
      <CoinStacker />
      <BalloonPump />
      <WhackDip />
      <TrendSnake />
      <ChartFlappy />
      <SimonSignals />
      <MergeCoins />
    </Section>
  );
}
