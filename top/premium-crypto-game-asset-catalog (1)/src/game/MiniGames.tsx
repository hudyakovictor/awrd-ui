import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Device, StatusBar, GameButton } from "./Device";
import { Mascot } from "./Mascot";
import { HeartArt, TrophyArt, BoltArt, CandleArt, GemArt } from "./art";
import { sfx, Confetti, Shake, Pop } from "./Juice";

/* ================================================================== */
/*  CANDLE RUSH — canvas arcade                                        */
/* ================================================================== */
type Item = { x: number; y: number; vy: number; kind: "bull" | "bear" | "gem"; h: number; rot: number };
type Part = { x: number; y: number; vx: number; vy: number; life: number; c: string };
type Txt = { x: number; y: number; life: number; t: string; c: string };

const GW = 340;
const GH = 560;

function CandleRush() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef({
    px: GW / 2,
    tx: GW / 2,
    items: [] as Item[],
    parts: [] as Part[],
    txts: [] as Txt[],
    score: 0,
    lives: 3,
    combo: 0,
    time: 30,
    spawn: 0,
    running: false,
    last: 0,
    flash: 0,
  });
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0, time: 30 });
  const [phase, setPhase] = useState<"menu" | "play" | "over">("menu");
  const [best, setBest] = useState(() => Number(typeof localStorage !== "undefined" ? localStorage.getItem("tl-rush-best") ?? 0 : 0));
  const [shake, setShake] = useState(0);
  const [conf, setConf] = useState(0);
  const raf = useRef(0);
  const keys = useRef({ l: false, r: false });

  const start = () => {
    const s = st.current;
    Object.assign(s, { px: GW / 2, tx: GW / 2, items: [], parts: [], txts: [], score: 0, lives: 3, combo: 0, time: 30, spawn: 0, running: true, last: performance.now(), flash: 0 });
    setPhase("play");
    sfx("go");
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  };

  const end = () => {
    const s = st.current;
    s.running = false;
    setPhase("over");
    if (s.score > best) {
      setBest(s.score);
      try {
        localStorage.setItem("tl-rush-best", String(s.score));
      } catch {
        /* */
      }
      setConf((c) => c + 1);
      sfx("levelup");
    } else sfx("lose");
  };

  const burst = (x: number, y: number, c: string, n = 14) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 1.5 + Math.random() * 4;
      st.current.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, life: 1, c });
    }
  };

  const loop = (t: number) => {
    const s = st.current;
    const c = canvas.current;
    if (!c || !s.running) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dt = Math.min(0.033, (t - s.last) / 1000);
    s.last = t;
    s.time -= dt;
    if (s.time <= 0 || s.lives <= 0) {
      s.time = Math.max(0, s.time);
      setHud({ score: s.score, lives: s.lives, combo: s.combo, time: 0 });
      end();
      return;
    }

    // input
    if (keys.current.l) s.tx -= 420 * dt;
    if (keys.current.r) s.tx += 420 * dt;
    s.tx = Math.max(36, Math.min(GW - 36, s.tx));
    s.px += (s.tx - s.px) * Math.min(1, dt * 16);

    // spawn
    const diff = 1 + (30 - s.time) / 12;
    s.spawn -= dt;
    if (s.spawn <= 0) {
      s.spawn = Math.max(0.28, 0.75 / diff);
      const r = Math.random();
      s.items.push({
        x: 24 + Math.random() * (GW - 48),
        y: -40,
        vy: (150 + Math.random() * 90) * diff,
        kind: r < 0.08 ? "gem" : r < 0.62 ? "bull" : "bear",
        h: 26 + Math.random() * 22,
        rot: 0,
      });
    }

    // update items
    const by = GH - 70;
    s.items = s.items.filter((it) => {
      it.y += it.vy * dt;
      it.rot += dt * 2;
      const hit = it.y + it.h / 2 > by - 14 && it.y - it.h / 2 < by + 14 && Math.abs(it.x - s.px) < 44;
      if (hit) {
        if (it.kind === "bear") {
          s.lives -= 1;
          s.combo = 0;
          s.flash = 1;
          burst(it.x, by, "#ff4d6a", 22);
          s.txts.push({ x: it.x, y: by - 30, life: 1, t: "−1 ♥", c: "#ff4d6a" });
          sfx("hit");
          setShake((n) => n + 1);
        } else {
          s.combo += 1;
          const mult = 1 + Math.floor(s.combo / 5);
          const pts = (it.kind === "gem" ? 50 : 10) * mult;
          s.score += pts;
          burst(it.x, by, it.kind === "gem" ? "#38e1ff" : "#2be08a");
          s.txts.push({ x: it.x, y: by - 30, life: 1, t: `+${pts}`, c: it.kind === "gem" ? "#38e1ff" : "#2be08a" });
          sfx(it.kind === "gem" ? "chest" : s.combo % 5 === 0 ? "combo" : "coin", false);
        }
        return false;
      }
      if (it.y > GH + 40) {
        if (it.kind === "bull") s.combo = 0;
        return false;
      }
      return true;
    });

    s.parts = s.parts.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.life -= dt * 1.6;
      return p.life > 0;
    });
    s.txts = s.txts.filter((x) => {
      x.y -= 40 * dt;
      x.life -= dt * 1.3;
      return x.life > 0;
    });
    s.flash = Math.max(0, s.flash - dt * 3);

    // ---------- draw ----------
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== GW * dpr) {
      c.width = GW * dpr;
      c.height = GH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, GH);
    g.addColorStop(0, "#0e1a36");
    g.addColorStop(1, "#050914");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GW, GH);
    // grid
    ctx.strokeStyle = "rgba(96,140,224,.07)";
    ctx.lineWidth = 1;
    const off = (t / 30) % 40;
    for (let y = -40 + off; y < GH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GW, y);
      ctx.stroke();
    }
    for (let x = 0; x < GW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GH);
      ctx.stroke();
    }

    // items
    s.items.forEach((it) => {
      if (it.kind === "gem") {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(Math.sin(it.rot) * 0.3);
        ctx.shadowColor = "#38e1ff";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#62e7ff";
        ctx.beginPath();
        ctx.moveTo(-14, -6);
        ctx.lineTo(-7, -14);
        ctx.lineTo(7, -14);
        ctx.lineTo(14, -6);
        ctx.lineTo(0, 14);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#c4f8ff";
        ctx.beginPath();
        ctx.moveTo(-7, -14);
        ctx.lineTo(7, -14);
        ctx.lineTo(4, -6);
        ctx.lineTo(-4, -6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return;
      }
      const col = it.kind === "bull" ? "#2be08a" : "#ff4d6a";
      const dark = it.kind === "bull" ? "#0f7048" : "#8e0f2c";
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -it.h / 2 - 10);
      ctx.lineTo(0, it.h / 2 + 10);
      ctx.stroke();
      ctx.fillStyle = dark;
      roundRect(ctx, -9, -it.h / 2 + 3, 18, it.h, 4);
      ctx.fill();
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.fillStyle = col;
      roundRect(ctx, -9, -it.h / 2, 18, it.h, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,.4)";
      roundRect(ctx, -6, -it.h / 2 + 3, 4, it.h - 6, 2);
      ctx.fill();
      ctx.restore();
    });

    // basket (wallet)
    ctx.save();
    ctx.translate(s.px, by);
    ctx.fillStyle = "rgba(0,0,0,.4)";
    ctx.beginPath();
    ctx.ellipse(0, 26, 42, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a2a52";
    roundRect(ctx, -42, -10, 84, 34, 10);
    ctx.fill();
    const wg = ctx.createLinearGradient(0, -14, 0, 20);
    wg.addColorStop(0, "#6f9bff");
    wg.addColorStop(1, "#2c4fc4");
    ctx.fillStyle = wg;
    roundRect(ctx, -42, -14, 84, 32, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.3)";
    roundRect(ctx, -34, -10, 50, 5, 3);
    ctx.fill();
    ctx.fillStyle = "#ffc24b";
    roundRect(ctx, 18, -4, 16, 12, 4);
    ctx.fill();
    ctx.restore();

    // particles
    s.parts.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    });
    ctx.globalAlpha = 1;
    // texts
    s.txts.forEach((x) => {
      ctx.globalAlpha = Math.max(0, x.life);
      ctx.fillStyle = x.c;
      ctx.font = "900 18px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(x.t, x.x, x.y);
    });
    ctx.globalAlpha = 1;
    if (s.flash > 0) {
      ctx.fillStyle = `rgba(255,77,106,${s.flash * 0.25})`;
      ctx.fillRect(0, 0, GW, GH);
    }

    if (Math.floor(t / 90) !== Math.floor((t - dt * 1000) / 90)) {
      setHud({ score: s.score, lives: s.lives, combo: s.combo, time: s.time });
    }
    raf.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (!st.current.running) return;
      if (e.key === "ArrowLeft" || e.key === "a") {
        keys.current.l = true;
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        keys.current.r = true;
        e.preventDefault();
      }
    };
    const ku = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keys.current.l = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.current.r = false;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  const mult = 1 + Math.floor(hud.combo / 5);

  return (
    <Device w={GW} h={GH + 120}>
      <Shake trigger={shake} className="relative flex h-full flex-col">
        <Confetti fire={conf} />
        <StatusBar />
        <div className="flex items-center gap-2 px-4 pb-2">
          <div className="flex items-center gap-1 rounded-xl border-2 border-[#22355e] bg-[#101a33] px-2 py-1" style={{ boxShadow: "0 3px 0 #0a1328" }}>
            <TrophyArt size={18} />
            <Pop value={hud.score} className="font-mono text-[14px] font-black text-gold" />
          </div>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} animate={i >= hud.lives ? { scale: 0.8, opacity: 0.3 } : { scale: 1, opacity: 1 }}>
                <HeartArt size={22} />
              </motion.span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 font-mono text-[13px] font-black" style={{ color: mult > 1 ? "#ffb347" : "#5f6f96" }}>
            <BoltArt size={16} />×{mult}
          </div>
        </div>
        <div className="mx-4 mb-2 h-2 overflow-hidden rounded-full bg-[#0a1122]">
          <div className="h-full rounded-full transition-[width] duration-100" style={{ width: `${(hud.time / 30) * 100}%`, background: hud.time < 8 ? "#ff4d6a" : "var(--accent)" }} />
        </div>
        <div className="relative flex-1 touch-none">
          <canvas
            ref={canvas}
            className="absolute inset-0 h-full w-full"
            style={{ width: GW, height: GH }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              st.current.tx = ((e.clientX - r.left) / r.width) * GW;
            }}
            onPointerDown={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              st.current.tx = ((e.clientX - r.left) / r.width) * GW;
            }}
          />
          <AnimatePresence>
            {phase !== "play" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050914]/85 px-8 text-center backdrop-blur-sm">
                {phase === "menu" ? (
                  <>
                    <div className="flex items-end gap-2">
                      <CandleArt size={54} />
                      <Mascot mood="wave" size={120} track={false} />
                      <CandleArt size={54} bear />
                    </div>
                    <h4 className="mt-2 font-[family-name:var(--font-display)] text-[30px] font-bold text-white">Candle Rush</h4>
                    <p className="mt-1 text-[12px] text-ink-400">Catch green candles. Dodge red ones. Gems are ×5. Every 5-streak raises the multiplier.</p>
                    <div className="mt-3 flex gap-3 font-mono text-[10px] font-black text-ink-400">
                      <span className="flex items-center gap-1">
                        <CandleArt size={18} /> +10
                      </span>
                      <span className="flex items-center gap-1">
                        <GemArt size={16} /> +50
                      </span>
                      <span className="flex items-center gap-1">
                        <CandleArt size={18} bear /> −1♥
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <Mascot mood={hud.score >= best && hud.score > 0 ? "celebrate" : "sad"} size={120} track={false} />
                    <h4 className="font-[family-name:var(--font-display)] text-[28px] font-bold text-white">{hud.score >= best && hud.score > 0 ? "New record!" : "Market closed"}</h4>
                    <div className="mt-1 font-mono text-[40px] font-black text-gold">{hud.score}</div>
                  </>
                )}
                <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-500">best · {best}</div>
                <div className="mt-5 w-full">
                  <GameButton onClick={start}>{phase === "menu" ? "Play" : "Play again"}</GameButton>
                </div>
                <div className="mt-2 font-mono text-[9px] uppercase tracking-widest text-ink-500">drag · or ← → keys</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Shake>
    </Device>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ================================================================== */
/*  STOP-LOSS REFLEX                                                   */
/* ================================================================== */
type RPhase = "idle" | "wait" | "crash" | "result" | "early" | "liq";

function Reflex() {
  const [phase, setPhase] = useState<RPhase>("idle");
  const [pts, setPts] = useState<number[]>([]);
  const [ms, setMs] = useState(0);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const t0 = useRef(0);
  const timer = useRef(0);
  const iv = useRef(0);
  const LIQ = 18;

  const start = () => {
    setPhase("wait");
    const base = Array.from({ length: 30 }, (_, i) => 60 + Math.sin(i / 3) * 4 + (Math.random() - 0.5) * 3);
    setPts(base);
    sfx("select");
    clearInterval(iv.current);
    iv.current = window.setInterval(() => {
      setPts((p) => [...p.slice(-59), p[p.length - 1] + (Math.random() - 0.5) * 3]);
    }, 80);
    timer.current = window.setTimeout(() => {
      setPhase("crash");
      t0.current = performance.now();
      sfx("wrong", false);
      clearInterval(iv.current);
      iv.current = window.setInterval(() => {
        setPts((p) => {
          const n = p[p.length - 1] - 3.2 - Math.random() * 2;
          if (n <= LIQ) {
            clearInterval(iv.current);
            setPhase("liq");
            sfx("lose");
          }
          return [...p.slice(-59), n];
        });
      }, 60);
    }, 1800 + Math.random() * 2600);
  };

  const hit = () => {
    if (phase === "idle" || phase === "result" || phase === "early" || phase === "liq") return start();
    if (phase === "wait") {
      clearTimeout(timer.current);
      clearInterval(iv.current);
      setPhase("early");
      sfx("wrong");
      return;
    }
    if (phase === "crash") {
      const r = Math.round(performance.now() - t0.current);
      clearInterval(iv.current);
      setMs(r);
      setBestMs((b) => (b === null ? r : Math.min(b, r)));
      setPhase("result");
      sfx(r < 350 ? "levelup" : "correct");
    }
  };

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearInterval(iv.current);
    },
    [],
  );

  const W = 300;
  const H = 180;
  const path = pts.map((v, i) => `${(i / 59) * W},${H - (v / 100) * H}`).join(" ");
  const rank = ms < 250 ? ["Market maker", "#ffc24b"] : ms < 400 ? ["Pro trader", "#2be08a"] : ms < 600 ? ["Swing trader", "#38e1ff"] : ["Bag holder", "#ff4d6a"];
  const colour = phase === "crash" ? "#ff4d6a" : phase === "result" ? "#2be08a" : "#a3b1d2";

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] p-2" style={{ boxShadow: "inset 0 4px 12px rgba(0,0,0,.7)" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full">
          <rect x={0} y={H - (LIQ / 100) * H} width={W} height={(LIQ / 100) * H} fill="rgba(255,77,106,.12)" />
          <line x1={0} x2={W} y1={H - (LIQ / 100) * H} y2={H - (LIQ / 100) * H} stroke="#ff4d6a" strokeWidth="2" strokeDasharray="6 4" />
          <text x={6} y={H - (LIQ / 100) * H - 6} fontSize="10" fontWeight="900" fill="#ff4d6a" fontFamily="JetBrains Mono, monospace">
            LIQUIDATION
          </text>
          <polyline points={path} fill="none" stroke={colour} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {pts.length > 0 && <circle cx={((pts.length - 1) / 59) * W} cy={H - (pts[pts.length - 1] / 100) * H} r="5" fill={colour} />}
        </svg>
        <AnimatePresence>
          {phase === "crash" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 0.4, repeat: Infinity }} className="pointer-events-none absolute inset-0 bg-bear/20" />
          )}
        </AnimatePresence>
      </div>
      <motion.button
        type="button"
        onPointerDown={hit}
        whileTap={{ y: 6 }}
        className="relative h-24 w-full overflow-hidden rounded-3xl font-[family-name:var(--font-display)] text-[26px] font-bold uppercase tracking-wider"
        style={{
          background: phase === "crash" ? "linear-gradient(180deg,#ff8fa2,#ff4d6a 50%,#d61f42)" : phase === "wait" ? "linear-gradient(180deg,#2c4372,#152444)" : "linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #fff), var(--accent))",
          color: phase === "wait" ? "#7d8db4" : "#0a1226",
          boxShadow: `0 7px 0 ${phase === "crash" ? "#8e0f2c" : phase === "wait" ? "#0b1226" : "var(--accent-edge)"}, 0 20px 30px -14px #000`,
        }}
      >
        <span className="pointer-events-none absolute inset-x-6 top-2 h-[30%] rounded-full bg-white/25" />
        <span className="relative">
          {phase === "idle" && "Start"}
          {phase === "wait" && "Wait for it…"}
          {phase === "crash" && "STOP!"}
          {(phase === "result" || phase === "early" || phase === "liq") && "Try again"}
        </span>
      </motion.button>
      <div className="grid min-h-[76px] grid-cols-[1fr_auto] items-center gap-3 rounded-2xl sf-inset hairline p-3">
        <AnimatePresence mode="wait">
          <motion.div key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {phase === "result" && (
              <>
                <div className="font-mono text-[28px] font-black leading-none" style={{ color: rank[1] }}>
                  {ms}ms
                </div>
                <div className="font-mono text-[10px] font-black uppercase tracking-widest" style={{ color: rank[1] }}>
                  {rank[0]}
                </div>
              </>
            )}
            {phase === "early" && <div className="text-[14px] font-bold text-bear">Too early — paper hands! 🧻</div>}
            {phase === "liq" && <div className="text-[14px] font-bold text-bear">Liquidated. Stops save accounts.</div>}
            {phase === "idle" && <div className="text-[12px] text-ink-400">Hit STOP the instant price starts crashing — before it touches liquidation.</div>}
            {phase === "wait" && <div className="text-[12px] text-ink-400">Watching the market…</div>}
            {phase === "crash" && <div className="text-[14px] font-black text-bear">CRASHING!</div>}
          </motion.div>
        </AnimatePresence>
        <div className="text-right">
          <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">best</div>
          <div className="font-mono text-[16px] font-black text-gold">{bestMs ?? "—"}</div>
        </div>
      </div>
    </div>
  );
}

export default function MiniGames() {
  return (
    <Section id="minigames" index="" title="Arcade Mini-Games" kicker="Skill drills disguised as play" count="2 games">
      <Grid>
        <Cell title="Candle Rush · Canvas 60fps" spec="drag / arrow keys" span="col-span-2 md:col-span-2 lg:col-span-3">
          <CandleRush />
        </Cell>
        <Cell title="Stop-Loss Reflex" spec="reaction ms · ranks" span="col-span-2 md:col-span-2 lg:col-span-3">
          <Reflex />
          <div className="mt-4 flex flex-wrap gap-1.5">
            <Tag tone="gold">&lt;250ms market maker</Tag>
            <Tag tone="accent">&lt;400ms pro</Tag>
            <Tag tone="aqua">&lt;600ms swing</Tag>
            <Tag tone="bear">bag holder</Tag>
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
