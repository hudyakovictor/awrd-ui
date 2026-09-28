import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";
import { Device, StatusBar, HudPill, GameHUD } from "../game/Device";
import { Mascot } from "../game/Mascot";
import { ART, type ArtKey, RARITY, type Rarity, CrownArt, GemArt } from "../game/art";
import { sfx, Confetti, Pop } from "../game/Juice";
import { BackdropCanvas } from "./FX";

/* ================================================================== */
/*  TROPHY BOARD — horizontal scrolling locker of unlockables          */
/* ================================================================== */
type T = { id: string; n: string; d: string; a: ArtKey; r: Rarity; locked?: boolean; got: number; total: number };
const TROPHIES: T[] = [
  { id: "first", n: "First Lesson", d: "Complete your first drill", a: "star", r: "common", got: 1, total: 1 },
  { id: "seven", n: "Weekly Win", d: "7 drills correct in a row", a: "flame", r: "rare", got: 4, total: 7 },
  { id: "thirty", n: "Diamond Hands", d: "Hold a position 30 simulated days", a: "shield", r: "epic", got: 12, total: 30 },
  { id: "league", n: "Diamond League", d: "Promote to the top tier", a: "crown", r: "legendary", got: 0, total: 1 },
  { id: "whale", n: "Whale Spotter", d: "Predict 10 whale trades", a: "whale", r: "epic", got: 7, total: 10 },
  { id: "duel", n: "Duel Master", d: "Win 25 PvP duels", a: "trophy", r: "legendary", got: 18, total: 25 },
  { id: "treasure", n: "Treasure Hunter", d: "Open 50 mystery chests", a: "chest", r: "epic", got: 27, total: 50 },
  { id: "altruist", n: "Altruist", d: "Complete 100 friend quests", a: "ticket", r: "rare", got: 64, total: 100 },
];

function Trophies() {
  const [filter, setFilter] = useState<"all" | "common" | "rare" | "epic" | "legendary">("all");
  const [claimFlash, setClaimFlash] = useState<string | null>(null);
  const list = TROPHIES.filter((t) => filter === "all" || t.r === filter);
  return (
    <div className="space-y-3">
      <div className="no-scrollbar mask-fade-r flex gap-2 overflow-x-auto pb-1">
        {(["all", "common", "rare", "epic", "legendary"] as const).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => { setFilter(r); sfx("select"); }}
            className="rounded-xl border-2 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider"
            style={{ borderColor: filter === r ? (r === "all" ? "var(--accent)" : RARITY[r].c) : "#22355e", color: filter === r ? (r === "all" ? "var(--accent)" : RARITY[r].c) : "#7d8db4", background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {list.map((t) => {
          const A = ART[t.a];
          const pct = t.got / t.total;
          const done = t.got >= t.total;
          return (
            <motion.div
              key={t.id}
              layout
              whileHover={{ y: -2 }}
              className="relative flex items-center gap-2 rounded-2xl border-2 p-2"
              style={{
                borderColor: done ? RARITY[t.r].c : "#1c2c52",
                background: done ? `linear-gradient(120deg, color-mix(in srgb, ${RARITY[t.r].c} 18%, #0d1528), #0d1528 70%)` : "#0d1528",
                boxShadow: `0 3px 0 ${done ? RARITY[t.r].e : "#070d1c"}, ${done ? `0 0 24px -10px ${RARITY[t.r].c}` : "none"}`,
              }}
              onClick={() => { if (done) { setClaimFlash(t.id); sfx("unlock"); setTimeout(() => setClaimFlash(null), 1200); } }}
            >
              <motion.div animate={claimFlash === t.id ? { rotate: [0, -10, 10, 0], scale: [1, 1.12, 1] } : {}}>
                <A size={48} className={done ? "" : "opacity-40 grayscale"} />
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-[12px] font-extrabold", done ? "text-white" : "text-ink-300")}>{t.n}</div>
                <div className="text-[10px] leading-tight text-ink-400">{t.d}</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#0a1122]">
                  <motion.div
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="h-full rounded-full"
                    style={{ background: done ? RARITY[t.r].c : "#38537f" }}
                  />
                </div>
                <span className="mt-0.5 font-mono text-[8px] text-ink-500">{t.got}/{t.total}</span>
              </div>
              {done && (
                <motion.span initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-bull text-[#02150b] shadow-[0_0_0_2px_#0a1226]">
                  <Icon name="check" size={11} strokeWidth={4} />
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MARKETS — full page mock terminal with crypto pairs                */
/* ================================================================== */
const PAIRS: { s: string; n: string; v: number; c: number; vs: number[]; i: ArtKey }[] = [
  { s: "BTC", n: "Bitcoin", v: 68412.55, c: 2.14, vs: [42, 41, 43, 42, 44, 45, 47, 46, 49, 50, 49, 51], i: "candle" },
  { s: "ETH", n: "Ethereum", v: 3521.08, c: 1.02, vs: [22, 21, 23, 22, 24, 24, 25, 25, 27, 26, 27, 28], i: "rocket" },
  { s: "SOL", n: "Solana", v: 178.42, c: -0.84, vs: [4, 4, 5, 4, 5, 5, 4, 5, 4, 3, 4, 3], i: "bolt" },
  { s: "LINK", n: "Chainlink", v: 18.92, c: 4.51, vs: [6, 6, 7, 6, 7, 7, 8, 8, 9, 9, 10, 11], i: "shield" },
  { s: "ARB", n: "Arbitrum", v: 1.204, c: -1.73, vs: [5, 4, 5, 4, 4, 4, 4, 5, 4, 4, 3, 3], i: "gem" },
  { s: "AVAX", n: "Avalanche", v: 38.77, c: 3.06, vs: [3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8], i: "whale" },
];

function MarketFeed() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-1.5">
      {PAIRS.map((p, i) => {
        const drift = (Math.sin((tick + i) * 0.3) * 0.5 + (Math.random() - 0.5) * 1.4);
        const v = p.v + drift * p.v * 0.003;
        const up = drift >= 0;
        const A = ART[p.i];
        return (
          <motion.div
            key={p.s}
            layout
            whileHover={{ x: 3 }}
            className="flex items-center gap-2 rounded-xl p-2 transition-colors"
            style={{ background: "#0d1528", boxShadow: "0 3px 0 #070d1c, inset 0 0 0 2px #1c2c52" }}
          >
            <A size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-extrabold text-white">{p.s}</div>
              <div className="truncate text-[9.5px] text-ink-400">{p.n}</div>
            </div>
            <svg viewBox="0 0 100 24" className="h-7 w-20">
              <polyline
                points={p.vs.map((x, k) => `${(k / (p.vs.length - 1)) * 100},${24 - (x / Math.max(...p.vs)) * 22}`).join(" ")}
                fill="none"
                stroke={up ? "#2be08a" : "#ff4d6a"}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div className="w-20 text-right">
              <div className="tnum font-mono text-[12px] font-extrabold text-white">
                <Pop value={v.toLocaleString("en-US", { minimumFractionDigits: p.v < 10 ? 4 : 2, maximumFractionDigits: p.v < 10 ? 4 : 2 })} />
              </div>
              <div className={cn("tnum font-mono text-[10px] font-black", up ? "text-bull" : "text-bear")}>{up ? "▲" : "▼"} {(Math.abs(drift * 0.5)).toFixed(2)}%</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  RAIN — crypto rain canvas overlay (reserved for future scenes)     */
/* ================================================================== */
function CryptoRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth;
    const H = c.clientHeight;
    if (!W || !H) return;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const COINS = ["₿", "Ξ", "◎", "₳", "✕", "⧫"];
    const drops: { y: number; x: number; v: number; ch: string; col: string; size: number }[] = [];
    for (let i = 0; i < 28; i++) {
      drops.push({
        y: -Math.random() * H,
        x: Math.random() * W,
        v: 40 + Math.random() * 90,
        ch: COINS[i % COINS.length],
        col: ["#2be08a", "#38e1ff", "#9b6bff", "#ffc24b"][i % 4],
        size: 16 + Math.random() * 14,
      });
    }
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const d of drops) {
        d.y += d.v * (1 / 60);
        if (d.y > H + 50) d.y = -Math.random() * 60;
        ctx.fillStyle = d.col;
        ctx.globalAlpha = 0.45;
        ctx.font = `${d.size}px JetBrains Mono, monospace`;
        ctx.fillText(d.ch, d.x, d.y);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
void CryptoRain;

/* ================================================================== */
/*  HOLD-TO-CONFIG — slider that updates the depth dynamically.         */
/* ================================================================== */
/* eslint-disable @typescript-eslint/no-unused-vars */
function FluidCard() {
  const [depth, setDepth] = useState(40);
  return (
    <div className="space-y-3">
      <div
        className="relative rounded-3xl border-2 p-4 scan-line"
        style={{ borderColor: "#22355e", background: "linear-gradient(170deg,#1b2b55,#0a1226)", boxShadow: "0 6px 0 #070d1c, 0 30px 50px -22px #000" }}
      >
        <div className="grid grid-cols-3 gap-2 text-[10px] text-white">
          {["qty", "yield", "apy"].map((l, i) => (
            <div key={l} className="flex flex-col gap-1">
              <span className="font-mono text-[8.5px] uppercase tracking-widest text-ink-400">{l}</span>
              <span className="tnum font-mono text-[15px] font-black">
                <Pop value={[1243.42, 0.082, 12.4][i]} suffix={[null, null, "%"][i]} />
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
          <motion.div animate={{ width: `${depth}%` }} className="h-full rounded-full" style={{ background: "var(--accent)" }} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-[10px] text-ink-400">
        DEPTH
        <input type="range" min={5} max={100} value={depth} onChange={(e) => setDepth(+e.target.value)} className="flex-1" />
        <span className="tnum font-mono text-[11px] font-bold" style={{ color: "var(--accent)" }}>{depth}</span>
      </label>
    </div>
  );
}

/* ================================================================== */
/*  PROFILE — full bio screen with holographic layered ID card         */
/* ================================================================== */
function Profile() {
  const [stat, setStat] = useState({ name: "Kira_V", xp: 2480, wins: 67, lessons: 184, trades: 502 });
  return (
    <Device w={360} h={720}>
      <BackdropCanvas shader="nebula" speed={0.7} />
      <div className="relative flex h-full flex-col">
        <StatusBar />
        <GameHUD streak={42} gems={1280} coins={8640} />
        <div className="px-4 pt-1 text-center">
          <Tag tone="accent">profile · {stat.name}</Tag>
        </div>
        <div className="relative mt-3 grid flex-1 place-items-center px-4">
          <motion.div
            initial={{ rotateX: 0, rotateY: 0 }}
            whileHover={{ rotateY: 16, rotateX: -8 }}
            transition={{ type: "spring", stiffness: 140, damping: 12 }}
            className="relative h-[280px] w-[200px] overflow-hidden rounded-3xl border-4 p-3 gradient-border island-shadow"
            style={{
              background: "linear-gradient(165deg,#1b2b55,#0a1226)",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 mix-blend-color-dodge"
              style={{
                background: "repeating-linear-gradient(115deg, transparent 0 4px, rgba(255,255,255,.06) 4px 6px), radial-gradient(circle at 30% 20%, rgba(255,255,255,.2), transparent 50%)",
              }}
            />
            <div className="relative flex h-full w-full flex-col">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-aqua">All-Stars</div>
                <div className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-gold">Diamond</div>
              </div>
              <div className="mt-2 flex-1 grid place-items-center">
                <Mascot mood="happy" size={120} outfit={{ shades: true, chain: true, hat: "crown" }} track={false} />
              </div>
              <div className="space-y-1 font-mono text-[10px] text-ink-300">
                <div className="flex justify-between">
                  <span>XP</span>
                  <span className="text-bull">{stat.xp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wins</span>
                  <span className="text-gold">{stat.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lessons</span>
                  <span className="text-aqua">{stat.lessons}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trades</span>
                  <span className="text-violet">{stat.trades}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStat((s) => ({ ...s, xp: s.xp + Math.floor(Math.random() * 80) }));
                  sfx("correct");
                }}
                className="mt-2 rounded-xl border-2 border-[#22355e] bg-[#101a33] py-1.5 font-[family-name:var(--font-display)] text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]"
                style={{ boxShadow: "0 3px 0 #0a1328" }}
              >
                Earn XP
              </button>
            </div>
          </motion.div>
        </div>
        <div className="px-4 pb-8 pt-2">
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "Studio", I: "gem" as IconName, glow: "#38e1ff" },
              { l: "Discord", I: "share" as IconName, glow: "#9b6bff" },
              { l: "Friends", I: "user" as IconName, glow: "#2be08a" },
              { l: "Share", I: "play" as IconName, glow: "#ffc24b" },
            ].map((s) => (
              <button
                key={s.l}
                type="button"
                onClick={() => sfx("coin")}
                className="rounded-2xl border-2 p-2 transition-transform hover:scale-105"
                style={{ borderColor: "#22355e", background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}
              >
                <span className="grid h-8 place-items-center">
                  <Icon name={s.I} size={18} style={{ color: s.glow }} />
                </span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-wider text-ink-400">{s.l}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Device>
  );
}

/* ================================================================== */
/*  ACHIEVEMENT CANVAS — sphere of unlocked artifacts                   */
/* ================================================================== */
function AchievementsCluster() {
  const placed = [
    { a: "gem" as ArtKey, x: 10, y: 20 },
    { a: "crown" as ArtKey, x: 70, y: 14 },
    { a: "chest" as ArtKey, x: 24, y: 64 },
    { a: "trophy" as ArtKey, x: 78, y: 70 },
    { a: "shield" as ArtKey, x: 48, y: 36 },
    { a: "candle" as ArtKey, x: 12, y: 80 },
    { a: "rocket" as ArtKey, x: 86, y: 38 },
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 p-4" style={{ borderColor: "#22355e", background: "radial-gradient(ellipse at 50% 60%, #1b2b55 0%, #060a16 80%)", boxShadow: "inset 0 0 0 2px rgba(255,194,75,.12)" }}>
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-display)] text-[18px] font-bold text-white">Achievements</span>
        <HudPill>
          <CrownArt size={18} />
          <span className="text-gold">14 unlocked</span>
        </HudPill>
      </div>
      <div className="relative mt-2 h-[260px]">
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(255,194,75,.25), transparent 70%)" }} />
        {placed.map(({ a, x, y }, i) => {
          const A = ART[a];
          return (
            <motion.button
              type="button"
              key={a + i}
              onMouseEnter={() => sfx("pop")}
              whileHover={{ scale: 1.18, y: -4 }}
              onClick={() => { sfx("unlock"); }}
              className="absolute grid place-items-center"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <A size={58} />
            </motion.button>
          );
        })}
        <svg className="absolute inset-0 pointer-events-none">
          {placed.map((p, i) => {
            const nx = placed[(i + 1) % placed.length];
            return (
              <motion.line
                key={i}
                x1={`${p.x}%`} y1={`${p.y}%`} x2={`${nx.x}%`} y2={`${nx.y}%`}
                stroke="rgba(255,194,75,.3)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: i * 0.1 }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  MATCH-3 MINI-GAME — bitmap gem swap (small)                         */
/* ================================================================== */
const GEM_TYPES = ["gem", "coin", "flame", "heart", "rocket"] as ArtKey[];

function Match3() {
  interface T { art: ArtKey; id: number; drop: number; }
  const newBoard = (): T[][] => {
    return Array.from({ length: 5 }, (_, r) =>
      Array.from({ length: 5 }, (_, c) => ({ art: GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)], id: r * 5 + c, drop: 0 })),
    );
  };
  const [board, setBoard] = useState<T[][]>(newBoard);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [busy, setBusy] = useState(false);

  const swap = async (r1: number, c1: number, r2: number, c2: number) => {
    if (busy) return;
    setBusy(true);
    const nb = board.map((row) => row.slice());
    [nb[r1][c1], nb[r2][c2]] = [nb[r2][c2], nb[r1][c1]];
    setBoard(nb);
    sfx("select");
    await new Promise((res) => setTimeout(res, 260));
    const clear = findMatches(nb);
    if (clear.size === 0) {
      // reverse
      [nb[r1][c1], nb[r2][c2]] = [nb[r2][c2], nb[r1][c1]];
      setBoard(nb.map((row) => row.slice()));
      sfx("wrong");
      setSel(null);
      setBusy(false);
      return;
    }
    while (clear.size) {
      await compress(nb, clear, setBoard, setScore);
      await refill(nb, setBoard);
      const next = findMatches(nb);
      if (!next.size) break;
      clear.clear();
      next.forEach((k) => clear.add(k));
    }
    setSel(null);
    setBusy(false);
  };

  void board; // referenced inside callbacks only

  return (
    <Device w={360} h={680}>
      <BackdropCanvas shader="circuit" speed={1.2} />
      <div className="relative flex h-full flex-col">
        <StatusBar />
        <div className="flex items-center justify-between px-4 pb-3">
          <HudPill>
            <GemArt size={18} />
            <Pop value={score} className="text-aqua" />
          </HudPill>
          <span className="font-mono text-[12px] font-black uppercase tracking-widest text-gold">match · 3</span>
          <HudPill>
            <span className="text-violet">∞</span>
          </HudPill>
        </div>
        <Confetti fire={score > 0 && score % 90 === 0 ? Date.now() : 0} />
        <div className="grid grid-cols-5 gap-1.5 px-4">
          {board.flatMap((row, r) =>
            row.map((cell, c) => {
              const A = ART[cell.art];
              const selA = sel?.r === r && sel?.c === c;
              return (
                <motion.button
                  type="button"
                  key={cell.id + ":" + r + ":" + c}
                  whileTap={{ scale: 0.85 }}
                  disabled={busy}
                  onClick={() => {
                    if (!sel) {
                      setSel({ r, c });
                      sfx("select");
                    } else if (sel && Math.abs(sel.r - r) + Math.abs(sel.c - c) === 1) {
                      void swap(sel.r, sel.c, r, c);
                    } else {
                      setSel({ r, c });
                    }
                  }}
                  className={cn("relative aspect-square rounded-2xl border-2 transition-colors", selA ? "border-gold" : "border-transparent")}
                  style={{
                    background: selA ? "linear-gradient(180deg,#3a2a0e,#1a1408)" : "#0d1528",
                    boxShadow: `0 3px 0 ${selA ? "#5a3f10" : "#070d1c"}`,
                  }}
                >
                  <A size={48} />
                </motion.button>
              );
            }),
          )}
        </div>
        <div className="px-4 pb-8 pt-4">
          <FluidCard />
        </div>
      </div>
    </Device>
  );
}

async function compress(
  board: { art: ArtKey; id: number; drop: number }[][],
  matches: Set<string>,
  setBoard: (b: { art: ArtKey; id: number; drop: number }[][]) => void,
  setScore: (n: number | ((p: number) => number)) => void,
) {
  for (let c = 0; c < 5; c++) {
    let write = 4;
    for (let r = 4; r >= 0; r--) {
      const k = `${r},${c}`;
      if (!matches.has(k)) {
        const v = board[r][c];
        board[write][c] = v;
        if (write !== r) board[r][c] = { art: "gem", id: -1, drop: 1 };
        write--;
      } else {
        // remove
        board[r][c] = { art: "gem", id: -1, drop: 1 };
      }
    }
    // fill top
    while (write >= 0) {
      board[write][c] = { art: GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)], id: Math.random(), drop: 1 };
      write--;
    }
  }
  setBoard(board.map((row) => row.slice()));
  setScore((s) => s + matches.size * 10);
  sfx(matches.size > 5 ? "levelup" : "coin");
  await new Promise((res) => setTimeout(res, 200));
}

async function refill(
  board: { art: ArtKey; id: number; drop: number }[][],
  setBoard: (b: { art: ArtKey; id: number; drop: number }[][]) => void,
) {
  setBoard(board.map((row) => row.slice()));
  await new Promise((res) => setTimeout(res, 180));
}

function findMatches(board: { art: ArtKey }[][]): Set<string> {
  const m = new Set<string>();
  // rows
  for (let r = 0; r < 5; r++) {
    let run = 1;
    for (let c = 1; c < 5; c++) {
      if (board[r][c].art === board[r][c - 1].art) {
        run++;
      } else if (run >= 3) {
        for (let k = 0; k < run; k++) m.add(`${r},${c - 1 - k}`);
        run = 1;
      } else {
        run = 1;
      }
    }
    if (run >= 3) {
      const c0 = 5 - run;
      for (let k = 0; k < run; k++) m.add(`${r},${c0 + k}`);
    }
  }
  // cols
  for (let c = 0; c < 5; c++) {
    let run = 1;
    for (let r = 1; r < 5; r++) {
      if (board[r][c].art === board[r - 1][c].art) {
        run++;
      } else if (run >= 3) {
        for (let k = 0; k < run; k++) m.add(`${r - 1 - k},${c}`);
        run = 1;
      } else {
        run = 1;
      }
    }
    if (run >= 3) {
      const r0 = 5 - run;
      for (let k = 0; k < run; k++) m.add(`${r0 + k},${c}`);
    }
  }
  return m;
}

void 0;
export default function Achievements() {
  return (
    <Section id="achievements" index="" title="Trophy Room" kicker="Onboarding-into-engagement spine" count="4 surfaces · match-3">
      <Grid>
        <Cell title="Trophy Board" spec="tiered · progress" span="col-span-2 md:col-span-4 lg:col-span-6">
          <Trophies />
        </Cell>
        <Cell title="Achievement Cluster" spec="interactive constellation" span="col-span-2 md:col-span-4 lg:col-span-3">
          <AchievementsCluster />
        </Cell>
        <Cell title="Profile · Holographic ID" spec="tilt · interactive" span="col-span-2 md:col-span-4 lg:col-span-3">
          <Profile />
        </Cell>
        <Cell title="Trade Feed" spec="live tick 1.2s" span="col-span-2 md:col-span-4 lg:col-span-3">
          <MarketFeed />
        </Cell>
        <Cell title="Match-3 Gems" spec="tap to swap" span="col-span-2 md:col-span-4 lg:col-span-3">
          <Match3 />
        </Cell>
      </Grid>
    </Section>
  );
}
