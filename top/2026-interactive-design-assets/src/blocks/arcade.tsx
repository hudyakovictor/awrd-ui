import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring } from "framer-motion";
import {
  BookOpen,
  Coins,
  Crown,
  Flame,
  Gem,
  Heart,
  Lock,
  Shield,
  Snowflake,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { useJuice } from "../fx/juice";
import { Mascot, type Mood } from "../duo/Mascot";
import { D, DuoButton } from "../duo/ui";
import { useTimers } from "./util";

const INK = "#1b1f3b";

/* ═══════════════════════════════════════════════════════════
 * 36 · CANDLE CRUSH — match-3 with cascades
 * ═══════════════════════════════════════════════════════════ */
const COLS = 6;
const ROWS = 7;
const CELL = 42;
const GOAL = 1500;
const MOVES = 15;
const KINDS: { I: LucideIcon; c: string; d: string }[] = [
  { I: TrendingUp, c: D.green, d: D.greenDark },
  { I: TrendingDown, c: D.red, d: D.redDark },
  { I: Coins, c: D.yellow, d: "#d9a000" },
  { I: Gem, c: D.blue, d: D.blueDark },
  { I: Zap, c: D.purple, d: "#a568cc" },
];
type Tile = { id: number; t: number; sy?: number };
type Grid = (Tile | null)[][];
type RC = [number, number];
let tileId = 1;
const rndKind = () => Math.floor(Math.random() * KINDS.length);

function makeGrid(): Grid {
  const b: Tile[][] = [];
  for (let r = 0; r < ROWS; r++) {
    b.push([]);
    for (let c = 0; c < COLS; c++) {
      let t: number;
      do t = rndKind();
      while ((c >= 2 && b[r][c - 1].t === t && b[r][c - 2].t === t) || (r >= 2 && b[r - 1][c].t === t && b[r - 2][c].t === t));
      b[r].push({ id: tileId++, t });
    }
  }
  return b;
}

/** Runs of ≥3 identical kinds. Only valid on a full grid. */
function findGroups(b: Grid): RC[][] {
  const out: RC[][] = [];
  for (let r = 0; r < ROWS; r++) {
    let s = 0;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && b[r][c]!.t === b[r][s]!.t) continue;
      if (c - s >= 3) out.push(Array.from({ length: c - s }, (_, k) => [r, s + k] as RC));
      s = c;
    }
  }
  for (let c = 0; c < COLS; c++) {
    let s = 0;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && b[r][c]!.t === b[s][c]!.t) continue;
      if (r - s >= 3) out.push(Array.from({ length: r - s }, (_, k) => [s + k, c] as RC));
      s = r;
    }
  }
  return out;
}

function swapGrid(b: Grid, a: RC, z: RC): Grid {
  const n = b.map((row) => row.slice());
  const t = n[a[0]][a[1]];
  n[a[0]][a[1]] = n[z[0]][z[1]];
  n[z[0]][z[1]] = t;
  return n;
}

function findMove(b: Grid): [RC, RC] | null {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (const [dr, dc] of [
        [0, 1],
        [1, 0],
      ]) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (r2 >= ROWS || c2 >= COLS) continue;
        if (findGroups(swapGrid(b, [r, c], [r2, c2])).length) return [[r, c], [r2, c2]];
      }
  return null;
}

/** Drop survivors, spawn new tiles above the board (sy = spawn y). */
function collapse(b: Grid): Grid {
  const n: Grid = Array.from({ length: ROWS }, () => Array<Tile | null>(COLS).fill(null));
  for (let c = 0; c < COLS; c++) {
    let w = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      const t = b[r][c];
      if (t) {
        n[w][c] = { id: t.id, t: t.t };
        w--;
      }
    }
    for (let r = w; r >= 0; r--) n[r][c] = { id: tileId++, t: rndKind(), sy: (r - w - 1) * CELL };
  }
  return n;
}

export function CandleCrush() {
  const fx = useFx();
  const juice = useJuice();
  const grid = useRef<HTMLDivElement>(null);
  const alive = useRef(true);
  const [board, setBoard] = useState<Grid>(makeGrid);
  const bRef = useRef(board);
  const [sel, setSel] = useState<RC | null>(null);
  const [busy, setBusy] = useState(false);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [moves, setMoves] = useState(MOVES);
  const [bad, setBad] = useState<number[]>([]);
  const [hint, setHint] = useState<number[]>([]);
  const [cascade, setCascade] = useState(0);
  const [over, setOver] = useState<null | "win" | "lose">(null);
  const [run, setRun] = useState(0);
  const start = useRef<{ x: number; y: number; r: number; c: number } | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, fx.reduced ? 20 : ms / fx.speed));
  const commit = (b: Grid) => {
    bRef.current = b;
    setBoard(b);
  };
  const cellPos = (r: number, c: number) => {
    const g = grid.current ? juice.local(grid.current) : { x: 143, y: 300 };
    return { x: g.x - (COLS * CELL) / 2 + c * CELL + CELL / 2, y: g.y - (ROWS * CELL) / 2 + r * CELL + CELL / 2 };
  };

  /* idle hint after 5s */
  useEffect(() => {
    if (busy || over) return;
    const id = setTimeout(() => {
      const m = findMove(bRef.current);
      if (m) setHint(m.map(([r, c]) => bRef.current[r][c]!.id));
    }, 5000);
    return () => clearTimeout(id);
  }, [busy, over, board]);

  /* end conditions */
  useEffect(() => {
    if (busy || over) return;
    if (score >= GOAL) {
      setOver("win");
      fx.sfx("win");
      fx.haptic([40, 40, 140]);
      juice.confetti();
      juice.rain();
    } else if (moves <= 0) {
      setOver("lose");
      fx.sfx("lose");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, moves, score]);

  const resolve = async (b: Grid) => {
    let level = 0;
    let cur = b;
    while (alive.current) {
      const gs = findGroups(cur);
      if (!gs.length) break;
      level++;
      setCascade(level);
      const hit = new Set<string>();
      let pts = 0;
      gs.forEach((g) => g.forEach(([r, c]) => hit.add(`${r},${c}`)));
      gs.forEach((g) => {
        const big = g.length >= 4;
        const gp = g.length * 20 * level * (big ? 2 : 1);
        pts += gp;
        const mid = g[Math.floor(g.length / 2)];
        const p = cellPos(mid[0], mid[1]);
        const k = KINDS[cur[mid[0]][mid[1]]!.t];
        juice.pop(`+${gp}`, p.x, p.y - 8, "#ffffff", 20 + Math.min(18, level * 4 + (g.length - 3) * 5));
        if (big) {
          juice.ring(p.x, p.y, k.c, true);
          juice.shake(g.length >= 5 ? 1.3 : 0.8);
          juice.pop(g.length >= 5 ? "AMAZING!" : "GREAT!", p.x, p.y - 52, k.c, 24);
        }
      });
      hit.forEach((key) => {
        const [r, c] = key.split(",").map(Number);
        const p = cellPos(r, c);
        const k = KINDS[cur[r][c]!.t];
        juice.burst(p.x, p.y, { count: 9, colors: [k.c, "#fff"], shape: "star", glow: true, speed: 5, gravity: 0.14, size: 8, life: 30 });
      });
      fx.sfx(level > 1 ? "coin" : "pop");
      fx.haptic(level > 1 ? [15, 20, 30] : 12);
      if (level >= 2) {
        const g = cellPos(ROWS / 2, COLS / 2 - 0.5);
        juice.pop(`CASCADE ×${level}`, g.x, g.y - 140, D.orange, 26);
        juice.flash(D.orange, 0.12);
      }
      scoreRef.current += pts;
      setScore(scoreRef.current);
      const holes: Grid = cur.map((row, r) => row.map((t, c) => (hit.has(`${r},${c}`) ? null : t)));
      commit(holes);
      await sleep(240);
      cur = collapse(holes);
      commit(cur);
      await sleep(400);
    }
    setCascade(0);
    if (alive.current && !findMove(cur)) {
      let nb: Grid;
      do nb = makeGrid();
      while (!findMove(nb));
      const g = cellPos(ROWS / 2, COLS / 2 - 0.5);
      juice.pop("SHUFFLE!", g.x, g.y, D.blue, 28);
      await sleep(300);
      commit(nb);
    }
  };

  const trySwap = async (a: RC, z: RC) => {
    if (busy || over) return;
    setSel(null);
    setHint([]);
    setBusy(true);
    const b = bRef.current;
    const n = swapGrid(b, a, z);
    commit(n);
    fx.sfx("whoosh");
    fx.haptic(6);
    await sleep(210);
    if (!findGroups(n).length) {
      setBad([b[a[0]][a[1]]!.id, b[z[0]][z[1]]!.id]);
      fx.sfx("tick");
      fx.haptic([30, 20, 30]);
      commit(b);
      await sleep(320);
      setBad([]);
      setBusy(false);
      return;
    }
    setMoves((m) => m - 1);
    await resolve(n);
    if (alive.current) setBusy(false);
  };

  const cellFrom = (e: React.PointerEvent) => {
    const el = grid.current!;
    const r = el.getBoundingClientRect();
    const k = el.offsetWidth / r.width || 1;
    const x = (e.clientX - r.left) * k;
    const y = (e.clientY - r.top) * k;
    return { x, y, r: Math.floor(y / CELL), c: Math.floor(x / CELL) };
  };
  const inside = (r: number, c: number) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy || over) return;
    const p = cellFrom(e);
    if (!inside(p.r, p.c)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = p;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const p = cellFrom(e);
    const dx = p.x - s.x;
    const dy = p.y - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    start.current = null;
    const t: RC = Math.abs(dx) > Math.abs(dy) ? [s.r, s.c + Math.sign(dx)] : [s.r + Math.sign(dy), s.c];
    if (inside(t[0], t[1])) trySwap([s.r, s.c], t);
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (sel && Math.abs(sel[0] - s.r) + Math.abs(sel[1] - s.c) === 1) {
      trySwap(sel, [s.r, s.c]);
      return;
    }
    setSel(sel && sel[0] === s.r && sel[1] === s.c ? null : [s.r, s.c]);
    fx.sfx("tick");
    fx.haptic(4);
  };

  const reset = () => {
    scoreRef.current = 0;
    setScore(0);
    setMoves(MOVES);
    setOver(null);
    setSel(null);
    setHint([]);
    commit(makeGrid());
    setRun((r) => r + 1);
  };

  const stars = score >= GOAL ? 3 : score >= 1000 ? 2 : score >= 500 ? 1 : 0;
  const mood: Mood = over === "win" ? "cheer" : over === "lose" ? "sad" : cascade >= 2 ? "wow" : cascade ? "happy" : "idle";

  return (
    <div className="relative flex h-full flex-col items-center px-4 pb-4 pt-1">
      <div className="flex w-full items-center gap-2">
        <Mascot mood={mood} size={48} />
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <motion.span key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="tnum text-xl font-black">
              {score}
            </motion.span>
            <span className="text-xs font-black text-white/50">GOAL {GOAL}</span>
          </div>
          <div className="relative mt-1 h-3.5 rounded-full bg-[#2a3a6e]">
            <motion.div className="relative h-full rounded-full bg-[#ffc800]" animate={{ width: `${Math.min(100, (score / GOAL) * 100)}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
              <div className="absolute left-2 right-2 top-[3px] h-[4px] rounded-full bg-white/40" />
            </motion.div>
            {[500, 1000, 1500].map((v) => (
              <Star key={v} size={16} className="absolute -top-[1px] -ml-2" style={{ left: `${(v / GOAL) * 100}%` }} fill={score >= v ? "#ffc800" : "#3a4d90"} strokeWidth={0} />
            ))}
          </div>
        </div>
        <motion.div key={moves} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className={`grid h-12 w-12 place-items-center rounded-2xl text-center ${moves <= 3 ? "bg-[#ff4b4b]" : "bg-[#1cb0f6]"}`} style={{ boxShadow: `0 4px 0 ${moves <= 3 ? D.redDark : D.blueDark}` }}>
          <div>
            <div className="tnum text-lg font-black leading-none">{moves}</div>
            <div className="text-[9px] font-black">MOVES</div>
          </div>
        </motion.div>
      </div>

      <div className="mt-3 h-6">
        <AnimatePresence mode="wait">
          {cascade >= 2 ? (
            <motion.div key={cascade} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -3 }} exit={{ scale: 0 }} className="rounded-lg bg-[#ff9600] px-2 text-sm font-black text-white">
              COMBO ×{cascade}
            </motion.div>
          ) : (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-bold text-white/45">
              Swipe or tap two tiles to swap
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        key={run}
        ref={grid}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (start.current = null)}
        className="relative mt-1 touch-none select-none rounded-2xl bg-[#0a1230]/70"
        style={{ width: COLS * CELL, height: ROWS * CELL }}
        role="grid"
        aria-label="Candle Crush board"
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-lg"
            style={{
              left: (i % COLS) * CELL + 2,
              top: Math.floor(i / COLS) * CELL + 2,
              width: CELL - 4,
              height: CELL - 4,
              background: ((i % COLS) + Math.floor(i / COLS)) % 2 ? "rgba(255,255,255,.035)" : "rgba(255,255,255,.075)",
            }}
          />
        ))}
        <AnimatePresence>
          {board.flatMap((row, r) =>
            row.map((t, c) => {
              if (!t) return null;
              const k = KINDS[t.t];
              const isSel = !!sel && sel[0] === r && sel[1] === c;
              const isHint = hint.includes(t.id);
              const isBad = bad.includes(t.id);
              return (
                <motion.div
                  key={t.id}
                  className="absolute left-0 top-0 grid place-items-center"
                  style={{ width: CELL, height: CELL, zIndex: isSel ? 5 : 1 }}
                  initial={t.sy !== undefined ? { x: c * CELL, y: t.sy } : false}
                  animate={{ x: c * CELL, y: r * CELL }}
                  exit={{ scale: [1, 1.4, 0], rotate: 60, opacity: [1, 1, 0], transition: { duration: fx.t(0.24) || 0.01 } }}
                  transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 28, mass: 0.9 }}
                >
                  <motion.div
                    animate={
                      isBad
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : isHint
                          ? { scale: [1, 1.15, 1], rotate: [0, -10, 10, 0] }
                          : isSel
                            ? { scale: [1.08, 1.16, 1.08] }
                            : { scale: 1, rotate: 0, x: 0 }
                    }
                    transition={isHint || isSel ? { duration: 0.8, repeat: Infinity } : { duration: 0.3 }}
                    className="relative grid place-items-center rounded-xl"
                    style={{
                      width: CELL - 6,
                      height: CELL - 6,
                      background: k.c,
                      boxShadow: `inset 0 -4px 0 ${k.d}${isSel ? ", 0 0 0 3px #fff, 0 0 16px #fff" : ""}`,
                    }}
                  >
                    <k.I size={20} strokeWidth={3} color="#fff" />
                    <span className="absolute left-1.5 top-1 h-1.5 w-3 rounded-full bg-white/50" />
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {over && (
          <motion.div className="absolute inset-0 z-30 flex flex-col items-center bg-[#132250]/95 px-5 pb-5 pt-10 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-end gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -90, y: 30 }}
                  animate={{ scale: i === 1 ? 1.3 : 1, rotate: 0, y: i === 1 ? -10 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.3 + i * 0.25 }}
                  onAnimationComplete={() => {
                    if (i < stars) fx.sfx("coin");
                  }}
                >
                  <Star size={56} fill={i < stars ? "#ffc800" : "#2a3a6e"} stroke={i < stars ? "#d9a000" : "#3a4d90"} strokeWidth={2} />
                </motion.div>
              ))}
            </div>
            <div className="mt-5 text-3xl font-black">{over === "win" ? "Level complete!" : "Out of moves"}</div>
            <div className="tnum mt-2 text-5xl font-black text-[#ffc800]">{score}</div>
            <div className="mt-1 text-base font-bold text-white/55">{over === "win" ? "Every match = a disciplined trade." : `${GOAL - score} to go. Look for 4-in-a-rows.`}</div>
            <div className="flex-1" />
            <Mascot mood={mood} size={90} />
            <DuoButton full tone={over === "win" ? "green" : "blue"} className="mt-4" onClick={reset}>
              {over === "win" ? "Next level" : "Try again"}
            </DuoButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 37 · CANDLE CATCHER — canvas arcade
 * ═══════════════════════════════════════════════════════════ */
type It = { x: number; y: number; vy: number; t: "g" | "r" | "y"; rot: number };
const GAME_T = 30;

export function CandleCatcher() {
  const fx = useFx();
  const juice = useJuice();
  const fxr = useRef(fx);
  fxr.current = fx;
  const jr = useRef(juice);
  jr.current = juice;
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [screen, setScreen] = useState<"start" | "play" | "over">("start");
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0, time: GAME_T });
  const [best, setBest] = useState(0);
  const g = useRef({ items: [] as It[], bx: 143, tx: 143, score: 0, lives: 3, combo: 0, el: 0, last: 0, spawn: 0, squash: 0 });

  useEffect(() => {
    if (screen !== "play") return;
    const c = cv.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth;
    const H = c.clientHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    const s = g.current;
    Object.assign(s, { items: [], bx: W / 2, tx: W / 2, score: 0, lives: 3, combo: 0, el: 0, last: performance.now(), spawn: 0.4, squash: 0 });
    setHud({ score: 0, lives: 3, combo: 0, time: GAME_T });
    const BY = H - 60;
    let lastSec = GAME_T;
    let raf = 0;
    const sync = () => setHud({ score: s.score, lives: s.lives, combo: s.combo, time: Math.max(0, Math.ceil(GAME_T - s.el)) });

    const onCatch = (it: It) => {
      const J = jr.current;
      const f = fxr.current;
      s.squash = 1;
      if (it.t === "r") {
        s.lives--;
        s.combo = 0;
        f.sfx("lose");
        f.haptic([50, 30, 50]);
        J.pop("−1 ♥", it.x, BY - 50, D.red, 28);
        J.burst(it.x, BY - 10, { count: 26, colors: [D.red, "#7a1f2b", "#fff"], speed: 6, gravity: 0.3 });
      } else {
        const mult = 1 + Math.floor(s.combo / 5);
        const pts = (it.t === "y" ? 50 : 10) * mult;
        s.score += pts;
        s.combo++;
        if (it.t === "y") {
          f.sfx("coin");
          J.ring(it.x, BY - 10, D.yellow, true);
        } else f.sfx("tick");
        f.haptic(it.t === "y" ? [15, 15, 30] : 6);
        J.pop(`+${pts}`, it.x, BY - 50, it.t === "y" ? D.yellow : "#79d634", it.t === "y" ? 32 : 24);
        J.burst(it.x, BY - 14, { count: it.t === "y" ? 30 : 12, colors: it.t === "y" ? [D.yellow, "#fff"] : [D.green, "#fff"], speed: 5, shape: "star", glow: true, size: 7, life: 28 });
        if (s.combo % 5 === 0) {
          J.pop(`COMBO ×${1 + s.combo / 5}`, W / 2, H * 0.35, D.orange, 30);
          J.flash(D.orange, 0.14);
          f.sfx("win");
        }
      }
      sync();
    };

    const drawCandle = (it: It) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot);
      if (it.t === "y") {
        ctx.shadowColor = D.yellow;
        ctx.shadowBlur = 16;
        ctx.fillStyle = D.yellow;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff6c9";
        ctx.font = "900 16px Nunito, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", 0, 1);
      } else {
        const col = it.t === "g" ? D.green : D.red;
        ctx.strokeStyle = col;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(0, 24);
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.roundRect(-8, -15, 16, 30, 5);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.35)";
        ctx.fillRect(-4, -11, 3, 20);
      }
      ctx.restore();
    };

    const drawMoo = () => {
      const sq = s.squash;
      ctx.save();
      ctx.translate(s.bx, BY);
      ctx.scale(1 + sq * 0.18, 1 - sq * 0.22);
      ctx.fillStyle = "#fff4d6";
      for (const d of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(30 * d, -10);
        ctx.quadraticCurveTo(50 * d, -30, 40 * d, -46);
        ctx.quadraticCurveTo(34 * d, -28, 18 * d, -16);
        ctx.fill();
      }
      ctx.fillStyle = "#46a302";
      ctx.beginPath();
      ctx.roundRect(-42, -14, 84, 42, 18);
      ctx.fill();
      ctx.fillStyle = D.green;
      ctx.beginPath();
      ctx.roundRect(-42, -18, 84, 38, 18);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-14, -4, 6, 0, Math.PI * 2);
      ctx.arc(14, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(-13, -3, 3, 0, Math.PI * 2);
      ctx.arc(15, -3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b8f28a";
      ctx.beginPath();
      ctx.ellipse(0, 10, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const loop = (now: number) => {
      const f = fxr.current;
      const dt = Math.min(0.05, (now - s.last) / 1000) * f.speed;
      s.last = now;
      s.el += dt;
      const rem = GAME_T - s.el;
      s.spawn -= dt;
      if (s.spawn <= 0) {
        const r = Math.random();
        const t: It["t"] = r < 0.1 ? "y" : r < 0.38 ? "r" : "g";
        s.items.push({ x: 22 + Math.random() * (W - 44), y: -30, vy: (130 + s.el * 7) * (0.8 + Math.random() * 0.4), t, rot: (Math.random() - 0.5) * 0.5 });
        s.spawn = Math.max(0.26, 0.72 - s.el * 0.014);
      }
      s.bx += (s.tx - s.bx) * Math.min(1, dt * 16);
      s.squash = Math.max(0, s.squash - dt * 5);
      const keep: It[] = [];
      for (const it of s.items) {
        it.y += it.vy * dt;
        if (it.y > BY - 26 && it.y < BY + 8 && Math.abs(it.x - s.bx) < 46) {
          onCatch(it);
          continue;
        }
        if (it.y > H + 30) {
          if (it.t === "g" && s.combo > 0) {
            s.combo = 0;
            sync();
          }
          continue;
        }
        keep.push(it);
      }
      s.items = keep;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.05)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 10]);
      for (let x = W / 4; x < W; x += W / 4) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.beginPath();
      ctx.ellipse(s.bx, BY + 34, 40, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      for (const it of s.items) drawCandle(it);
      drawMoo();

      if (Math.ceil(rem) !== lastSec) {
        lastSec = Math.ceil(rem);
        sync();
        if (lastSec <= 5 && lastSec > 0) {
          f.sfx("tick");
          jr.current.pop(String(lastSec), W / 2, H * 0.3, "#fff", 46);
        }
      }
      if (rem <= 0 || s.lives <= 0) {
        setBest((b) => Math.max(b, s.score));
        setScreen("over");
        f.sfx(s.score >= 150 ? "win" : "lose");
        if (s.score >= 150) jr.current.confetti();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") s.tx = Math.max(40, s.tx - 50);
      if (e.key === "ArrowRight") s.tx = Math.min(W - 40, s.tx + 50);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [screen]);

  const steer = (e: React.PointerEvent) => {
    if (screen !== "play" || !wrap.current) return;
    const r = wrap.current.getBoundingClientRect();
    const k = wrap.current.offsetWidth / r.width || 1;
    g.current.tx = Math.max(40, Math.min(wrap.current.offsetWidth - 40, (e.clientX - r.left) * k));
  };
  const mult = 1 + Math.floor(hud.combo / 5);

  return (
    <div ref={wrap} className="relative h-full touch-none select-none overflow-hidden" onPointerMove={steer} onPointerDown={steer}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" />
      {screen === "play" && (
        <div className="pointer-events-none absolute inset-x-4 top-2">
          <div className="flex items-center justify-between">
            <motion.div key={hud.score} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="tnum text-3xl font-black">
              {hud.score}
            </motion.div>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} animate={{ scale: i < hud.lives ? 1 : 0.6, opacity: i < hud.lives ? 1 : 0.25 }}>
                  <Heart size={24} fill={D.red} strokeWidth={0} />
                </motion.span>
              ))}
            </div>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#2a3a6e]">
            <motion.div className="h-full rounded-full" animate={{ width: `${(hud.time / GAME_T) * 100}%`, background: hud.time <= 5 ? D.red : D.blue }} transition={{ duration: 0.3 }} />
          </div>
          <AnimatePresence>
            {hud.combo >= 3 && (
              <motion.div key={mult} initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -4 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} className="mt-2 inline-block rounded-xl bg-[#ff9600] px-3 py-1 text-base font-black text-white" style={{ boxShadow: "0 4px 0 #cd7900" }}>
                {hud.combo} combo · ×{mult}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      <AnimatePresence>
        {screen !== "play" && (
          <motion.div className="absolute inset-0 z-20 flex flex-col items-center bg-[#132250]/92 px-5 pb-5 pt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <Mascot mood={screen === "start" ? "happy" : hud.score >= 150 ? "cheer" : "sad"} size={110} />
            {screen === "start" ? (
              <>
                <div className="mt-4 text-3xl font-black">Candle Catcher</div>
                <p className="mt-2 text-base font-bold text-white/60">Drag to move Moo · 30 seconds</p>
                <div className="mt-5 w-full space-y-2">
                  {[
                    [D.green, "Green candle", "+10"],
                    [D.yellow, "Gold star", "+50"],
                    [D.red, "Red candle", "−1 ♥"],
                  ].map(([c, t, v]) => (
                    <div key={t} className="duo-card flex items-center gap-3 px-4 py-2.5">
                      <span className="h-6 w-3 rounded" style={{ background: c }} />
                      <span className="flex-1 text-left text-base font-extrabold">{t}</span>
                      <span className="text-base font-black" style={{ color: c }}>
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 text-lg font-black text-white/60">Score</div>
                <motion.div initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }} className="tnum text-6xl font-black text-[#ffc800]">
                  {hud.score}
                </motion.div>
                <div className="mt-1 text-base font-bold text-white/55">Best {best}</div>
                {hud.score >= best && hud.score > 0 && <div className="mt-3 rounded-full bg-[#ff9600] px-3 py-1 text-sm font-black text-white">NEW BEST!</div>}
              </>
            )}
            <div className="flex-1" />
            <DuoButton full onClick={() => setScreen("play")}>
              {screen === "start" ? "Play" : "Play again"}
            </DuoButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 38 · CARD PACK — swipe to tear, holo cards, rarity build-up
 * ═══════════════════════════════════════════════════════════ */
type Rar = "common" | "rare" | "epic" | "legend";
const RAR: Record<Rar, { c: string; d: string; label: string }> = {
  common: { c: "#1cb0f6", d: "#0f6fa3", label: "COMMON" },
  rare: { c: "#58cc02", d: "#3a8a00", label: "RARE" },
  epic: { c: "#ce82ff", d: "#7b3fb0", label: "EPIC" },
  legend: { c: "#ffc800", d: "#c47f00", label: "LEGENDARY" },
};
const PACK: { n: string; I: LucideIcon; r: Rar }[] = [
  { n: "Stop-Loss", I: Shield, r: "common" },
  { n: "Whale Alert", I: Target, r: "common" },
  { n: "Funding Flip", I: Zap, r: "rare" },
  { n: "Diamond Plan", I: Gem, r: "epic" },
  { n: "Moo Legend", I: Crown, r: "legend" },
];
const SLOTS = [
  { x: -92, y: -78, r: -8 },
  { x: 0, y: -86, r: 0 },
  { x: 92, y: -78, r: 8 },
  { x: -48, y: 62, r: -4 },
  { x: 48, y: 62, r: 4 },
];

export function PackOpening() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const packRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [stage, setStage] = useState<"pack" | "open" | "collect" | "done">("pack");
  const [tearP, setTearP] = useState(0);
  const tearStart = useRef<number | null>(null);
  const lastSpark = useRef(0);
  const [flipped, setFlipped] = useState<boolean[]>(() => PACK.map(() => false));
  const [charging, setCharging] = useState<number | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 16 });
  const sry = useSpring(ry, { stiffness: 220, damping: 16 });

  const tear = () => {
    if (stage !== "pack") return;
    setTearP(1);
    const c = packRef.current ? juice.local(packRef.current) : { x: 143, y: 260 };
    fx.sfx("lock");
    fx.haptic([40, 30, 100]);
    juice.flash("#ffffff", 0.7);
    juice.shake(1.3);
    juice.ring(c.x, c.y, D.yellow, true);
    juice.burst(c.x, c.y - 90, { count: 60, shape: "star", glow: true, colors: [D.yellow, "#fff", D.purple], speed: 10, size: 10 });
    later(() => setStage("open"), fx.ms(220));
  };

  const onPackMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    if (!fx.reduced) {
      ry.set((px - 0.5) * 24);
      rx.set(-(py - 0.5) * 18);
    }
    if (tearStart.current === null || stage !== "pack") return;
    const p = Math.min(1, Math.abs(px - tearStart.current) / 0.8);
    if (p > tearP) {
      setTearP(p);
      const now = performance.now();
      if (now - lastSpark.current > 45) {
        lastSpark.current = now;
        const c = packRef.current ? juice.local(packRef.current) : { x: 143, y: 260 };
        const w = packRef.current?.offsetWidth ?? 170;
        const h = packRef.current?.offsetHeight ?? 240;
        juice.burst(c.x - w / 2 + px * w, c.y - h / 2 + 30, { count: 4, shape: "spark", glow: true, colors: ["#fff", D.yellow], speed: 4, gravity: 0.1, life: 18 });
        fx.sfx("tick");
        fx.haptic(3);
      }
      if (p >= 0.9) {
        tearStart.current = null;
        tear();
      }
    }
  };

  const flip = (i: number) => {
    if (stage !== "open" || flipped[i] || charging !== null) return;
    const card = PACK[i];
    const R = RAR[card.r];
    const reveal = () => {
      setFlipped((f) => f.map((v, k) => (k === i ? true : v)));
      const el = cardRefs.current[i];
      const c = el ? juice.local(el) : { x: 143, y: 260 };
      switch (card.r) {
        case "common":
          juice.burst(c.x, c.y, { count: 16, shape: "star", glow: true, colors: [R.c, "#fff"], speed: 5, size: 8, life: 30 });
          fx.sfx("pop");
          fx.haptic(10);
          break;
        case "rare":
          juice.ring(c.x, c.y, R.c);
          juice.burst(c.x, c.y, { count: 30, shape: "star", glow: true, colors: [R.c, "#fff"], speed: 7, size: 9 });
          fx.sfx("coin");
          fx.haptic([15, 15, 30]);
          break;
        case "epic":
          juice.flash(R.c, 0.35);
          juice.ring(c.x, c.y, R.c, true);
          juice.burst(c.x, c.y, { count: 50, shape: "spark", glow: true, colors: [R.c, "#fff"], speed: 10, gravity: 0, life: 34 });
          juice.pop("EPIC!", c.x, c.y - 70, R.c, 26);
          fx.sfx("lock");
          fx.haptic([30, 20, 60]);
          break;
        case "legend":
          juice.flash(R.c, 0.6);
          juice.shake(1.5);
          juice.ring(c.x, c.y, R.c, true);
          juice.pop("LEGENDARY!", c.x, c.y - 80, R.c, 30);
          juice.rain();
          juice.confetti();
          fx.sfx("win");
          fx.haptic([50, 40, 150]);
          break;
      }
    };
    if (card.r === "epic" || card.r === "legend") {
      setCharging(i);
      fx.sfx("tick");
      fx.haptic(card.r === "legend" ? [10, 30, 10, 30, 10] : 10);
      later(() => {
        setCharging(null);
        reveal();
      }, fx.ms(card.r === "legend" ? 900 : 420));
    } else reveal();
  };

  const collect = () => {
    setStage("collect");
    fx.sfx("whoosh");
    PACK.forEach((_, i) => later(() => fx.sfx("coin"), fx.ms(120 + i * 90)));
    later(() => setStage("done"), fx.ms(800));
  };

  const reset = () => {
    setStage("pack");
    setTearP(0);
    setFlipped(PACK.map(() => false));
    setCharging(null);
  };

  const allFlipped = flipped.every(Boolean);

  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden px-4 pb-5 pt-2">
      <div className="text-center">
        <div className="text-2xl font-black">Card Pack</div>
        <div className="text-sm font-bold text-white/55">
          {stage === "pack" ? "Swipe across the top to tear it open" : stage === "open" ? (allFlipped ? "Nice pull!" : "Tap each card to reveal") : "Added to your deck"}
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: 900 }}>
        {stage !== "pack" && !fx.reduced && (
          <motion.div
            className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgba(255,200,0,.16) 0deg 7deg, transparent 7deg 20deg)",
              maskImage: "radial-gradient(circle, black 12%, transparent 60%)",
              WebkitMaskImage: "radial-gradient(circle, black 12%, transparent 60%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, rotate: 360 }}
            transition={{ scale: { duration: 0.5 }, opacity: { duration: 0.5 }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
          />
        )}

        <AnimatePresence>
          {stage === "pack" && (
            <motion.div
              key="pack"
              ref={packRef}
              exit={{ y: 260, rotate: 12, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }}
              onPointerDown={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                if (e.clientY - r.top < 70) {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  tearStart.current = (e.clientX - r.left) / r.width;
                }
              }}
              onPointerMove={onPackMove}
              onPointerUp={() => (tearStart.current = null)}
              onPointerLeave={() => {
                rx.set(0);
                ry.set(0);
              }}
              style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
              animate={fx.reduced ? {} : { y: [0, -8, 0] }}
              transition={{ y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } }}
              className="relative h-[240px] w-[170px] cursor-grab touch-none select-none"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[22px] border-[3px] border-white/80" style={{ background: "linear-gradient(145deg, #ce82ff, #1cb0f6 45%, #58cc02 75%, #ffc800)", boxShadow: "0 10px 0 #0a1230, 0 20px 40px rgba(0,0,0,.4)" }}>
                <div className="holo absolute inset-0 opacity-70" />
                <div className="absolute inset-x-0 top-[70px] flex flex-col items-center">
                  <Mascot size={78} mood="happy" />
                  <div className="mt-1 text-xl font-black text-white" style={{ textShadow: "0 3px 0 rgba(10,18,48,.4)" }}>
                    TRADER PACK
                  </div>
                  <div className="text-xs font-black text-white/85">5 cards · 1 legendary chance</div>
                </div>
              </div>
              <motion.div
                className="absolute inset-x-0 top-0 h-[44px] rounded-t-[22px] border-[3px] border-b-0 border-white/80"
                style={{ background: "linear-gradient(145deg, #e0a8ff, #5ac8fa)" }}
                animate={tearP >= 1 ? { y: -140, rotate: -35, opacity: 0 } : { y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />
              <div className="absolute left-2 right-2 top-[42px] border-t-[3px] border-dashed border-white/70" />
              <div className="absolute left-2 top-[40px] h-[5px] rounded-full bg-white" style={{ width: `calc(${tearP * 100}% - 16px)`, boxShadow: "0 0 12px #fff, 0 0 20px #ffc800" }} />
              {tearP === 0 && !fx.reduced && (
                <motion.div className="pointer-events-none absolute left-3 top-[28px] text-2xl" animate={{ x: [0, 110, 110], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.4 }}>
                  👆
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {stage !== "pack" &&
          PACK.map((card, i) => {
            const R = RAR[card.r];
            const s = SLOTS[i];
            const isFlip = flipped[i];
            const isCharge = charging === i;
            return (
              <motion.div
                key={card.n}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute"
                style={{ zIndex: isCharge ? 20 : isFlip ? 10 : 5 - i }}
                initial={{ x: 0, y: 40, scale: 0.3, rotate: 0, opacity: 0 }}
                animate={
                  stage === "collect" || stage === "done"
                    ? { x: 0, y: 320, scale: 0.2, rotate: 0, opacity: 0 }
                    : { x: s.x, y: s.y, scale: isCharge ? 1.12 : 1, rotate: s.r, opacity: 1 }
                }
                transition={
                  stage === "collect"
                    ? { duration: 0.45, delay: i * 0.08, ease: "easeIn" }
                    : fx.reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 260, damping: 18, delay: flipped.some(Boolean) || charging !== null ? 0 : 0.1 + i * 0.09 }
                }
              >
                <motion.button
                  onClick={() => flip(i)}
                  aria-label={isFlip ? `${card.n}, ${R.label}` : `Reveal card ${i + 1}`}
                  animate={isCharge && !fx.reduced ? { x: [0, -3, 3, -3, 3, 0], rotate: [0, -2, 2, -2, 2, 0] } : {}}
                  transition={isCharge ? { duration: 0.25, repeat: Infinity } : {}}
                  className="relative block h-[112px] w-[80px]"
                  style={{ perspective: 600 }}
                >
                  {isCharge && <motion.div className="absolute -inset-3 rounded-2xl blur-xl" style={{ background: R.c }} animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 0.3, repeat: Infinity }} />}
                  <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }} initial={false} animate={{ rotateY: isFlip ? 0 : 180 }} transition={{ duration: fx.t(0.55), ease: [0.6, 0, 0.2, 1] }}>
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-xl border-[3px] border-white p-1.5"
                      style={{ backfaceVisibility: "hidden", background: `linear-gradient(160deg, ${R.c}, ${R.d})`, boxShadow: isFlip && card.r !== "common" ? `0 0 22px ${R.c}` : "0 4px 0 rgba(0,0,0,.3)" }}
                      onPointerMove={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
                        e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
                      }}
                    >
                      {card.r !== "common" && <div className="holo pointer-events-none absolute inset-0" />}
                      <span className="relative rounded bg-black/25 px-1 text-[8px] font-black tracking-wide text-white">{R.label}</span>
                      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white/25">
                        <card.I size={22} strokeWidth={3} color="#fff" />
                      </span>
                      <span className="relative text-center text-[10px] font-black leading-tight text-white">{card.n}</span>
                    </div>
                    <div className="absolute inset-0 grid place-items-center rounded-xl border-[3px] border-white/80 bg-[#243a78]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0 6px, transparent 6px 12px)" }}>
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#58cc02] text-lg font-black text-white" style={{ boxShadow: "0 3px 0 #58a700" }}>
                        S
                      </span>
                    </div>
                  </motion.div>
                </motion.button>
              </motion.div>
            );
          })}

        {stage === "done" && (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <Mascot mood="cheer" size={110} />
            <div className="mt-4 text-2xl font-black">+5 cards</div>
            <div className="mt-1 text-sm font-bold text-white/55">Cosmetic collection · never affects score</div>
          </motion.div>
        )}
      </div>

      {stage === "pack" && (
        <DuoButton tone="purple" full onClick={tear}>
          Tear open
        </DuoButton>
      )}
      {stage === "open" && (
        <DuoButton full disabled={!allFlipped} onClick={collect}>
          {allFlipped ? "Collect all" : `${flipped.filter(Boolean).length} / ${PACK.length} revealed`}
        </DuoButton>
      )}
      {stage === "done" && (
        <DuoButton tone="blue" full onClick={reset}>
          Open another
        </DuoButton>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 39 · ACHIEVEMENT WALL — shared-layout unlock
 * ═══════════════════════════════════════════════════════════ */
const BADGES: { n: string; d: string; I: LucideIcon; c: string }[] = [
  { n: "First Trade", d: "Lock your first decision", I: Star, c: D.yellow },
  { n: "Stop Master", d: "Set 10 invalidations", I: Shield, c: D.blue },
  { n: "On Fire", d: "7-day streak", I: Flame, c: D.orange },
  { n: "Sharpshooter", d: "90%+ forecast accuracy", I: Target, c: D.red },
  { n: "Scholar", d: "Finish Academy unit 3", I: BookOpen, c: D.purple },
  { n: "Diamond Mind", d: "No revenge trades for 30 days", I: Gem, c: "#5ac8fa" },
  { n: "Cool Head", d: "Complete a Post-Loss Protocol", I: Snowflake, c: D.lime },
  { n: "Champion", d: "Win a weekly league", I: Trophy, c: D.yellow },
  { n: "Legend", d: "Reach Strategist rank", I: Crown, c: D.pink },
];
const HEX = "polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

function BadgeArt({ i, locked, size }: { i: number; locked: boolean; size: number }) {
  const b = BADGES[i];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0" style={{ clipPath: HEX, background: locked ? "#2a3a6e" : `linear-gradient(160deg, #fff 0%, ${b.c} 22%, ${b.c} 70%, rgba(0,0,0,.25) 100%)` }} />
      <div className={`absolute inset-[9%] grid place-items-center ${locked ? "" : "badge-shine"}`} style={{ clipPath: HEX, background: locked ? "#1d2c62" : b.c }}>
        {locked ? <Lock size={size * 0.3} strokeWidth={3} color="#5a6ca3" /> : <b.I size={size * 0.4} strokeWidth={2.8} color="#fff" />}
      </div>
    </div>
  );
}

function Tilt({ children, disabled }: { children: React.ReactNode; disabled: boolean }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 300, damping: 18 });
  const sry = useSpring(ry, { stiffness: 300, damping: 18 });
  return (
    <motion.div
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 400 }}
      onPointerMove={(e) => {
        if (disabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 36);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 36);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function AchievementWall() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const uid = useId();
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [unlocked, setUnlocked] = useState(3);
  const [show, setShow] = useState<number | null>(null);
  const [peek, setPeek] = useState<number | null>(null);

  const unlockNext = () => {
    if (show !== null || unlocked >= BADGES.length) return;
    const i = unlocked;
    setShow(i);
    fx.sfx("whoosh");
    fx.haptic(10);
    later(() => {
      const { w, h } = juice.size();
      fx.sfx("win");
      fx.haptic([30, 40, 100]);
      juice.flash(BADGES[i].c, 0.35);
      juice.ring(w / 2, h * 0.4, BADGES[i].c, true);
      juice.burst(w / 2, h * 0.4, { count: 60, shape: "star", glow: true, colors: [BADGES[i].c, "#fff", D.yellow], speed: 10, size: 11 });
      juice.confetti();
    }, fx.ms(900));
  };

  const close = () => {
    const i = show;
    if (i === null) return;
    setUnlocked((u) => u + 1);
    setShow(null);
    fx.sfx("whoosh");
    later(() => {
      const el = slotRefs.current[i];
      if (!el) return;
      const c = juice.local(el);
      juice.burst(c.x, c.y, { count: 22, shape: "star", glow: true, colors: [BADGES[i].c, "#fff"], speed: 5, size: 8 });
      juice.ring(c.x, c.y, BADGES[i].c);
      juice.shake(0.4);
      fx.sfx("coin");
      fx.haptic(15);
    }, fx.ms(500));
  };

  const reset = () => {
    setUnlocked(3);
    setShow(null);
  };

  const done = unlocked >= BADGES.length;
  const detail = peek !== null ? BADGES[peek] : null;

  return (
    <LayoutGroup id={uid}>
      <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black">Achievements</div>
            <div className="text-sm font-bold text-white/55">
              {unlocked} / {BADGES.length} unlocked
            </div>
          </div>
          <Trophy size={30} color={D.yellow} fill={D.yellow} strokeWidth={1.5} />
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#2a3a6e]">
          <motion.div className="h-full rounded-full bg-[#ffc800]" animate={{ width: `${(unlocked / BADGES.length) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-x-2 gap-y-4">
          {BADGES.map((b, i) => {
            const locked = i >= unlocked;
            return (
              <div
                key={b.n}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
                className="flex flex-col items-center"
              >
                <button onClick={() => setPeek(peek === i ? null : i)} aria-label={`${b.n}${locked ? " (locked)" : ""}`} className="relative grid h-[70px] w-[70px] place-items-center">
                  {show === i ? (
                    <div className="h-[64px] w-[64px] rounded-full border-2 border-dashed border-white/15" />
                  ) : (
                    <motion.div layoutId={`${uid}-b${i}`} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
                      <Tilt disabled={locked || fx.reduced}>
                        <BadgeArt i={i} locked={locked} size={64} />
                      </Tilt>
                    </motion.div>
                  )}
                </button>
                <span className={`mt-1 text-center text-[11px] font-black leading-tight ${locked ? "text-white/30" : ""}`}>{b.n}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 min-h-[44px]">
          <AnimatePresence mode="wait">
            {detail && (
              <motion.div key={peek} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="duo-card px-3 py-2 text-center text-sm font-bold text-white/75">
                <span className="font-black" style={{ color: detail.c }}>
                  {detail.n}:
                </span>{" "}
                {detail.d}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1" />
        {done ? (
          <DuoButton tone="blue" full onClick={reset}>
            Reset wall
          </DuoButton>
        ) : (
          <DuoButton tone="yellow" full disabled={show !== null} onClick={unlockNext}>
            Complete challenge
          </DuoButton>
        )}

        <AnimatePresence>
          {show !== null && (
            <motion.div className="absolute inset-0 z-30 flex flex-col items-center px-5 pb-5 pt-10 text-center" initial={{ backgroundColor: "rgba(10,18,48,0)" }} animate={{ backgroundColor: "rgba(10,18,48,.92)" }} exit={{ backgroundColor: "rgba(10,18,48,0)" }}>
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: fx.t(0.8) }} className="text-sm font-black uppercase tracking-wide text-[#ffc800]">
                Achievement unlocked
              </motion.div>
              <div className="relative mt-8 grid place-items-center">
                {!fx.reduced && (
                  <motion.div
                    className="pointer-events-none absolute h-[380px] w-[380px] rounded-full"
                    style={{
                      background: `repeating-conic-gradient(from 0deg, ${BADGES[show].c}33 0deg 8deg, transparent 8deg 22deg)`,
                      maskImage: "radial-gradient(circle, black 10%, transparent 60%)",
                      WebkitMaskImage: "radial-gradient(circle, black 10%, transparent 60%)",
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: 360 }}
                    exit={{ opacity: 0 }}
                    transition={{ scale: { delay: 0.7, duration: 0.5 }, opacity: { delay: 0.7 }, rotate: { duration: 18, repeat: Infinity, ease: "linear" } }}
                  />
                )}
                <motion.div layoutId={`${uid}-b${show}`} transition={{ type: "spring", stiffness: 160, damping: 18 }}>
                  <motion.div initial={{ rotateY: 0 }} animate={{ rotateY: fx.reduced ? 0 : 720 }} transition={{ duration: 1, ease: [0.3, 0, 0.2, 1], delay: 0.15 }} style={{ transformPerspective: 600 }}>
                    <BadgeArt i={show} locked={false} size={150} />
                  </motion.div>
                </motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: fx.t(0.95) }}>
                <div className="mt-8 text-3xl font-black" style={{ color: BADGES[show].c }}>
                  {BADGES[show].n}
                </div>
                <div className="mt-1 text-base font-bold text-white/60">{BADGES[show].d}</div>
              </motion.div>
              <div className="flex-1" />
              <DuoButton full onClick={close}>
                Awesome!
              </DuoButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
