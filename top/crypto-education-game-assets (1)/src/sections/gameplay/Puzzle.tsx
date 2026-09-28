import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip } from "../../components/ui";
import { BullIcon, CoinIcon, Icon } from "../../components/icons";
import { fx, useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, mulberry32, shuffleSeeded, useAssetVisible, useInterval } from "../../lib/motion";
import { Countdown, TickNumber, combatText } from "../../lib/fx2";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-31 · SEQUENCE TRADER — Simon-style: repeat the candle pattern
 * ===================================================================== */
const SEQ_COLORS = [
  { k: "up", c: "#22d39a", l: "▲", f: 523.25 },
  { k: "down", c: "#ff4d6d", l: "▼", f: 392 },
  { k: "doji", c: "#ffc23d", l: "—", f: 659.25 },
  { k: "vol", c: "#3e8bff", l: "●", f: 783.99 },
];
function SequenceTrader() {
  const g = useGame();
  const [seq, setSeq] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [show, setShow] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "demo" | "input" | "over">("idle");
  const [claimed, setClaimed] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const start = () => {
    setSeq([Math.floor(Math.random() * 4)]);
    setPos(0);
    setPhase("demo");
    setClaimed(false);
    sfx("go");
  };
  useEffect(() => {
    if (phase !== "demo" || !seq.length) return;
    let i = 0;
    setShow(null);
    const t = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(t);
        setShow(null);
        setPhase("input");
        setPos(0);
        return;
      }
      const v = seq[i];
      setShow(v);
      sfx("select", SEQ_COLORS[v].f / 523.25);
      setTimeout(() => setShow(null), 320);
      i++;
    }, 560);
    return () => clearInterval(t);
  }, [phase, seq]);
  const press = (i: number) => {
    if (phase !== "input") return;
    sfx("select", SEQ_COLORS[i].f / 523.25);
    setShow(i);
    setTimeout(() => setShow(null), 220);
    if (i === seq[pos]) {
      const n = pos + 1;
      if (n >= seq.length) {
        const add = Math.floor(Math.random() * 4);
        setSeq((s) => [...s, add]);
        setPhase("demo");
        sfx("success");
        if (boxRef.current) {
          const r = boxRef.current.getBoundingClientRect();
          combatText(r.left + r.width / 2, r.top + 30, `Round ${seq.length + 1}`, "#ffc23d", 20);
        }
      } else setPos(n);
    } else {
      setPhase("over");
      sfx("lose");
    }
  };
  const reward = Math.max(5, seq.length * 6);
  return (
    <Asset title="Sequence Trader · Simon" code="G-31" tags="simon sequence memory pattern repeat rhythm sound muscle" span={4}>
      <div ref={boxRef} className="relative">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-sm font-black text-white">Repeat the pattern</div>
          <Chip tone="violet">Round {Math.max(1, seq.length)}</Chip>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SEQ_COLORS.map((s, i) => (
            <button
              key={s.k}
              onClick={() => press(i)}
              disabled={phase !== "input"}
              className="flex h-24 items-center justify-center rounded-3xl text-3xl font-black text-white transition-all duration-150"
              style={{
                background: `linear-gradient(180deg, color-mix(in srgb, ${s.c} 80%, white), ${s.c})`,
                boxShadow: show === i ? `0 0 34px ${s.c}, 0 2px 0 color-mix(in srgb, ${s.c} 45%, black)` : `0 5px 0 color-mix(in srgb, ${s.c} 45%, black)`,
                transform: show === i ? "scale(1.05) translateY(3px)" : undefined,
                filter: phase === "input" ? "none" : "saturate(.7)",
              }}
            >
              {s.l}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {phase === "idle" || phase === "over" ? (
            <>
              {phase === "over" && <span className="text-xs font-bold text-bear">Wrong! Reached round {seq.length}</span>}
              <Btn variant="azure" size="sm" className="ml-auto" onClick={start} sound={false}>
                {phase === "over" ? "Retry" : "Start"}
              </Btn>
            </>
          ) : (
            <span className="text-[11px] font-bold text-ink-400">{phase === "demo" ? "👀 Watch…" : "👆 Your turn"}</span>
          )}
          {phase === "over" && seq.length >= 3 && (
            <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", reward, e.currentTarget); }}>
              +{reward} XP
            </Btn>
          )}
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-32 · BREAKOUT: LIQUIDATION — canvas breakout, paddle = wallet
 * ===================================================================== */
type Brick = { x: number; y: number; hp: number; max: number; alive: boolean };
function Breakout() {
  const g = useGame();
  const visible = useAssetVisible();
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "play" | "win" | "lose">("ready");
  const [hud, setHud] = useState({ score: 0, lives: 3, left: 0 });
  const [count, setCount] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const st = useRef({
    px: 0.5, tx: 0.5, bx: 0.5, by: 0.6, vx: 0.35, vy: -0.5,
    bricks: [] as Brick[], score: 0, lives: 3, stuck: true, flash: 0, parts: [] as { x: number; y: number; vx: number; vy: number; life: number; c: string }[],
  });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const build = () => {
    const bricks: Brick[] = [];
    const cols = 8;
    const rows = 5;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) bricks.push({ x: c / cols, y: 0.1 + r * 0.055, hp: r < 2 ? 2 : 1, max: r < 2 ? 2 : 1, alive: true });
    return bricks;
  };
  const start = () => {
    setCount(true);
  };
  const begin = () => {
    setCount(false);
    Object.assign(st.current, { bricks: build(), score: 0, lives: 3, stuck: true, bx: 0.5, by: 0.62, vx: 0.35, vy: -0.5, parts: [] });
    setHud({ score: 0, lives: 3, left: 40 });
    setClaimed(false);
    setPhase("play");
  };
  useEffect(() => {
    if (!visible) return;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const S = st.current;
      const playing = phaseRef.current === "play";
      S.px += (S.tx - S.px) * Math.min(1, dt * 14);
      if (playing) {
        if (S.stuck) {
          S.bx = S.px;
          S.by = 0.88;
        } else {
          S.bx += S.vx * dt;
          S.by += S.vy * dt;
          if (S.bx < 0.02 || S.bx > 0.98) {
            S.vx *= -1;
            S.bx = clamp(S.bx, 0.02, 0.98);
            sfx("tick");
          }
          if (S.by < 0.03) {
            S.vy *= -1;
            S.by = 0.03;
            sfx("tick");
          }
          const padY = 0.92;
          if (S.by > padY - 0.025 && S.by < padY + 0.03 && Math.abs(S.bx - S.px) < 0.11) {
            S.vy = -Math.abs(S.vy) * 1.02;
            S.vx += (S.bx - S.px) * 2.2;
            const sp = Math.hypot(S.vx, S.vy);
            S.vx = (S.vx / sp) * Math.min(0.9, sp);
            S.vy = (S.vy / sp) * Math.min(0.9, sp);
            sfx("pop");
          }
          const bw = 1 / 8;
          const bh = 0.055;
          S.bricks.forEach((b) => {
            if (!b.alive) return;
            if (S.bx > b.x && S.bx < b.x + bw && S.by > b.y && S.by < b.y + bh) {
              b.hp -= 1;
              S.vy *= -1;
              if (b.hp <= 0) {
                b.alive = false;
                S.score += b.max * 10;
                sfx("coin", 1 + Math.random() * 0.3);
                for (let i = 0; i < 10; i++) S.parts.push({ x: S.bx, y: S.by, vx: (Math.random() - 0.5) * 0.8, vy: -Math.random() * 0.6, life: 1, c: b.max > 1 ? "#9170ff" : "#22d39a" });
              } else sfx("tick", 1.4);
              setHud({ score: S.score, lives: S.lives, left: S.bricks.filter((x) => x.alive).length });
            }
          });
          if (S.by > 1.05) {
            S.lives -= 1;
            S.flash = 0.4;
            sfx("hit");
            if (S.lives <= 0) {
              setPhase("lose");
              sfx("lose");
            } else {
              S.stuck = true;
              S.bx = S.px;
              S.by = 0.88;
              S.vx = 0.35;
              S.vy = -0.5;
            }
            setHud({ score: S.score, lives: S.lives, left: S.bricks.filter((x) => x.alive).length });
          }
          if (S.bricks.every((b) => !b.alive)) {
            setPhase("win");
            sfx("levelup");
          }
        }
      }
      // draw
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#081130");
      grd.addColorStop(1, "#13244a");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      S.bricks.forEach((b) => {
        if (!b.alive) return;
        const x = b.x * W + 2;
        const y = b.y * H;
        const w = (W / 8) - 4;
        const h = 0.055 * H - 4;
        ctx.fillStyle = "#0b1838";
        ctx.beginPath();
        ctx.roundRect(x, y + 3, w, h, 5);
        ctx.fill();
        const g2 = ctx.createLinearGradient(0, y, 0, y + h);
        if (b.max > 1) {
          g2.addColorStop(0, b.hp > 1 ? "#c2b0ff" : "#7a58f0");
          g2.addColorStop(1, "#5a3ccc");
        } else {
          g2.addColorStop(0, "#5ff0bd");
          g2.addColorStop(1, "#0e9e70");
        }
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 5);
        ctx.fill();
        if (b.max > 1 && b.hp > 1) {
          ctx.fillStyle = "#fff";
          ctx.font = "900 10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("2", x + w / 2, y + h / 2 + 4);
        }
      });
      // paddle
      const px = S.px * W;
      const py = 0.92 * H;
      ctx.fillStyle = "#0b1838";
      ctx.beginPath();
      ctx.roundRect(px - 52, py - 4, 104, 24, 10);
      ctx.fill();
      const pg = ctx.createLinearGradient(0, py - 10, 0, py + 10);
      pg.addColorStop(0, "#5ea0ff");
      pg.addColorStop(1, "#3e8bff");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.roundRect(px - 52, py - 10, 104, 22, 10);
      ctx.fill();
      // ball
      ctx.shadowColor = "#ffc23d";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ffc23d";
      ctx.beginPath();
      ctx.arc(S.bx * W, S.by * H, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // parts
      S.parts = S.parts.filter((p) => (p.life -= dt * 1.6) > 0);
      S.parts.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += dt * 1.4;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x * W, p.y * H, 4, 4);
      });
      ctx.globalAlpha = 1;
      if (S.flash > 0) {
        S.flash -= dt;
        ctx.fillStyle = `rgba(255,77,109,${S.flash})`;
        ctx.fillRect(0, 0, W, H);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible]);
  const reward = Math.max(10, Math.floor(hud.score / 8));
  return (
    <Asset title="Breakout · Liquidation" code="G-32" tags="breakout arkanoid canvas paddle ball bricks arcade" span={4} badge="Arcade">
      <div
        className="relative h-[360px] cursor-none overflow-hidden rounded-2xl outline-none"
        tabIndex={0}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          st.current.tx = clamp((e.clientX - r.left) / r.width, 0.08, 0.92);
        }}
        onPointerDown={() => {
          if (phase === "play" && st.current.stuck) {
            st.current.stuck = false;
            sfx("pop");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") st.current.tx = clamp(st.current.tx - 0.06, 0.08, 0.92);
          if (e.key === "ArrowRight") st.current.tx = clamp(st.current.tx + 0.06, 0.08, 0.92);
          if (e.key === " " && phase === "play" && st.current.stuck) st.current.stuck = false;
        }}
      >
        <canvas ref={cvRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 p-2.5">
          <Chip tone="gold" className="backdrop-blur">
            <TickNumber value={hud.score} />
          </Chip>
          <Chip tone="violet" className="backdrop-blur">
            {hud.left} left
          </Chip>
          <span className="ml-auto font-display text-sm font-black text-bear">{"❤".repeat(Math.max(0, hud.lives))}</span>
        </div>
        {count && <Countdown onDone={begin} />}
        {phase === "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950/60 text-center backdrop-blur-[2px]">
            <div className="font-display text-2xl font-black text-white">Liquidation Breakout</div>
            <div className="mt-1 text-xs font-semibold text-ink-300">Smash every position block. Don't drop the ball!</div>
            <Btn variant="bull" className="mt-4" onClick={start} sound={false}>
              <Icon name="play" size={16} /> Play
            </Btn>
          </div>
        )}
        {(phase === "win" || phase === "lose") && (
          <div className="anim-pop absolute inset-0 flex flex-col items-center justify-center bg-ink-950/70 text-center backdrop-blur-sm">
            <div className={cn("font-display text-3xl font-black", phase === "win" ? "text-bull" : "text-bear")}>{phase === "win" ? "CLEARED!" : "REKT"}</div>
            <div className="font-mono text-lg font-bold text-gold">{hud.score} pts</div>
            <div className="mt-3 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={start}>
                Retry
              </Btn>
              <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", reward, e.currentTarget); }}>
                {claimed ? "Claimed" : `+${reward} XP`}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-33 · VOLATILITY AIM TRAINER — tap targets before they fade
 * ===================================================================== */
type Tgt = { id: number; x: number; y: number; r: number; born: number; life: number; bull: boolean };
function AimTrainer() {
  const g = useGame();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [tgts, setTgts] = useState<Tgt[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [time, setTime] = useState(30);
  const [claimed, setClaimed] = useState(false);
  const id = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  useInterval(
    () => {
      setTgts((t) => {
        const now = performance.now();
        const alive = t.filter((x) => now - x.born < x.life);
        if (alive.length >= 4 || Math.random() < 0.2) return alive;
        return [
          ...alive,
          {
            id: ++id.current,
            x: 8 + Math.random() * 84,
            y: 10 + Math.random() * 78,
            r: 22 + Math.random() * 16 - Math.min(10, hits * 0.4),
            born: now,
            life: Math.max(900, 1600 - hits * 22),
            bull: Math.random() > 0.35,
          },
        ];
      });
    },
    phase === "play" ? 120 : null,
  );
  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), phase === "play" ? 100 : null);
  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("over");
      sfx("levelup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);
  const hit = (t: Tgt, e: React.MouseEvent) => {
    e.stopPropagation();
    const age = performance.now() - t.born;
    const speedBonus = Math.max(0, Math.round((1 - age / t.life) * 20));
    const pts = (t.bull ? 15 : -10) + (t.bull ? speedBonus : 0);
    setScore((s) => Math.max(0, s + pts));
    if (t.bull) {
      setHits((h) => h + 1);
      sfx("pop", 1 + hits * 0.03);
      fx.burst(e.currentTarget, { colors: ["#22d39a", "#fff"], count: 10, spread: 44 });
    } else {
      setMiss((m) => m + 1);
      sfx("error");
    }
    setTgts((l) => l.filter((x) => x.id !== t.id));
  };
  const acc = hits + miss ? Math.round((hits / (hits + miss)) * 100) : 100;
  const start = () => {
    setPhase("play");
    setTgts([]);
    setScore(0);
    setHits(0);
    setMiss(0);
    setTime(30);
    setClaimed(false);
    sfx("go");
  };
  return (
    <Asset title="Volatility Aim Trainer" code="G-33" tags="aim trainer reaction targets tap speed accuracy reflex" span={4}>
      <div className="mb-3 flex items-center gap-2">
        <Chip tone="gold">
          <TickNumber value={score} />
        </Chip>
        <Chip tone="azure">{Math.ceil(time)}s</Chip>
        <span className="ml-auto font-mono text-xs font-bold text-ink-300">
          {hits}✓ {miss}✗ · {acc}%
        </span>
      </div>
      <div
        ref={boxRef}
        onPointerDown={() => phase === "play" && setMiss((m) => m + 1)}
        className="panel-inset relative h-[300px] cursor-crosshair overflow-hidden rounded-2xl select-none"
      >
        <div className="bg-grid absolute inset-0 opacity-60" />
        {phase === "play" &&
          tgts.map((t) => (
            <button
              key={t.id}
              onPointerDown={(e) => hit(t, e)}
              className="absolute flex items-center justify-center rounded-full font-black text-white"
              style={{
                left: `${t.x}%`,
                top: `${t.y}%`,
                width: t.r * 2,
                height: t.r * 2,
                marginLeft: -t.r,
                marginTop: -t.r,
                background: t.bull ? "radial-gradient(circle at 35% 30%, #6bf0c0, #0c8f63)" : "radial-gradient(circle at 35% 30%, #ff8aa0, #b31f3d)",
                boxShadow: `0 0 22px ${t.bull ? "#22d39a" : "#ff4d6d"}`,
                animation: `tgt-fade ${t.life}ms linear forwards, pop-in .2s cubic-bezier(.3,1.6,.5,1)`,
              }}
            >
              {t.bull ? "▲" : "▼"}
              <style>{`@keyframes tgt-fade{0%{opacity:1;transform:scale(1)}75%{opacity:1}100%{opacity:0;transform:scale(.4)}}`}</style>
            </button>
          ))}
        {phase !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950/50 text-center backdrop-blur-[1px]">
            {phase === "ready" ? (
              <>
                <div className="text-4xl">🎯</div>
                <div className="mt-2 font-display text-lg font-black text-white">Tap green only!</div>
                <div className="text-xs font-semibold text-ink-400">Red targets cost 10 pts · faster = more pts</div>
                <Btn variant="bull" size="sm" className="mt-3" onClick={start} sound={false}>
                  Start
                </Btn>
              </>
            ) : (
              <>
                <div className="font-display text-3xl font-black text-white">{score}</div>
                <div className="text-xs font-bold text-ink-300">
                  {hits} hits · {acc}% accuracy
                </div>
                <div className="mt-3 flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={start}>
                    Retry
                  </Btn>
                  <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", Math.max(5, Math.floor(score / 12)), e.currentTarget); }}>
                    {claimed ? "Claimed" : `+${Math.max(5, Math.floor(score / 12))}`}
                  </Btn>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-34 · SNAKE TRADER — eat profits, avoid liquidations
 * ===================================================================== */
type Pt = { x: number; y: number };
function SnakeTrader() {
  const g = useGame();
  const visible = useAssetVisible();
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem("tl-snake-best") || 0));
  const [claimed, setClaimed] = useState(false);
  const S = useRef({ snake: [{ x: 8, y: 10 }] as Pt[], dir: { x: 1, y: 0 } as Pt, next: { x: 1, y: 0 } as Pt, food: { x: 14, y: 10 } as Pt, bad: [] as Pt[], t: 0, score: 0, grow: 0 });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const N = 21;
  const start = () => {
    S.current = { snake: [{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }], dir: { x: 1, y: 0 }, next: { x: 1, y: 0 }, food: { x: 14, y: 10 }, bad: [], t: 0, score: 0, grow: 0 };
    setScore(0);
    setClaimed(false);
    setPhase("play");
    sfx("go");
  };
  const spawn = (avoid: Pt[]) => {
    for (let k = 0; k < 60; k++) {
      const p = { x: 1 + Math.floor(Math.random() * (N - 2)), y: 1 + Math.floor(Math.random() * (N - 2)) };
      if (!avoid.some((a) => a.x === p.x && a.y === p.y)) return p;
    }
    return { x: 10, y: 10 };
  };
  useEffect(() => {
    if (!visible) return;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const cell = W / N;
      ctx.fillStyle = "#081130";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(142,164,210,.08)";
      for (let i = 1; i < N; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(W, i * cell);
        ctx.stroke();
      }
      const st = S.current;
      if (phaseRef.current === "play") {
        st.t += dt;
        const speed = Math.max(0.055, 0.11 - st.score * 0.0012);
        if (st.t >= speed) {
          st.t = 0;
          st.dir = st.next;
          const head = { x: st.snake[0].x + st.dir.x, y: st.snake[0].y + st.dir.y };
          const dead = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || st.snake.some((s) => s.x === head.x && s.y === head.y) || st.bad.some((b) => b.x === head.x && b.y === head.y);
          if (dead) {
            setPhase("over");
            sfx("lose");
            setBest((b) => {
              const nb = Math.max(b, st.score);
              localStorage.setItem("tl-snake-best", String(nb));
              return nb;
            });
          } else {
            st.snake.unshift(head);
            if (head.x === st.food.x && head.y === st.food.y) {
              st.score += 10;
              st.grow += 1;
              setScore(st.score);
              sfx("coin", 1 + st.score / 200);
              st.food = spawn([...st.snake, ...st.bad]);
              if (st.score % 30 === 0) st.bad.push(spawn([...st.snake, st.food, ...st.bad]));
              if (st.score % 50 === 0) sfx("combo");
            }
            if (st.grow > 0) st.grow--;
            else st.snake.pop();
          }
        }
      }
      // food (coin)
      const fx = (st.food.x + 0.5) * cell;
      const fy = (st.food.y + 0.5) * cell;
      const pulse = 1 + Math.sin(now / 220) * 0.12;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = "#a86400";
      ctx.beginPath();
      ctx.arc(0, 1.5, cell * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffc23d";
      ctx.beginPath();
      ctx.arc(0, 0, cell * 0.34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#8a5200";
      ctx.font = `900 ${cell * 0.32}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 1);
      ctx.restore();
      // bad (red liq)
      st.bad.forEach((b) => {
        ctx.fillStyle = "#ff4d6d";
        ctx.shadowColor = "#ff4d6d";
        ctx.shadowBlur = 10;
        const bx = (b.x + 0.5) * cell;
        const by = (b.y + 0.5) * cell;
        ctx.beginPath();
        ctx.arc(bx, by, cell * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 4, by - 4);
        ctx.lineTo(bx + 4, by + 4);
        ctx.moveTo(bx + 4, by - 4);
        ctx.lineTo(bx - 4, by + 4);
        ctx.stroke();
      });
      // snake
      st.snake.forEach((s, i) => {
        const x = s.x * cell;
        const y = s.y * cell;
        const t = 1 - i / Math.max(1, st.snake.length);
        ctx.fillStyle = i === 0 ? "#5ff0bd" : `rgba(34,211,154,${0.45 + t * 0.55})`;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, i === 0 ? 6 : 4);
        ctx.fill();
        if (i === 0) {
          ctx.fillStyle = "#03281b";
          const ex = x + cell / 2 + st.dir.x * 3;
          const ey = y + cell / 2 + st.dir.y * 3;
          ctx.beginPath();
          ctx.arc(ex - 3 + st.dir.y * 3, ey - 3 - st.dir.x * 3, 1.8, 0, Math.PI * 2);
          ctx.arc(ex + 3 - st.dir.y * 3, ey + 3 + st.dir.x * 3, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible]);
  const turn = (x: number, y: number) => {
    const d = S.current.dir;
    if (d.x === -x && d.y === -y) return;
    if (d.x === x && d.y === y) return;
    S.current.next = { x, y };
  };
  return (
    <Asset title="Snake Trader" code="G-34" tags="snake canvas arcade eat profits avoid liquidation retro" span={4}>
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") turn(0, -1);
          if (e.key === "ArrowDown") turn(0, 1);
          if (e.key === "ArrowLeft") turn(-1, 0);
          if (e.key === "ArrowRight") turn(1, 0);
          if (e.key === " ") phase !== "play" && start();
          if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
        }}
        className="relative overflow-hidden rounded-2xl outline-none"
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
          else turn(0, dy > 0 ? 1 : -1);
        }}
      >
        <canvas ref={cvRef} className="block aspect-square w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-2 p-2.5">
          <Chip tone="gold">
            <TickNumber value={score} />
          </Chip>
          <span className="ml-auto font-mono text-[11px] font-bold text-ink-400">Best {best}</span>
        </div>
        {phase !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950/60 text-center backdrop-blur-[2px]">
            {phase === "ready" ? (
              <>
                <div className="text-4xl">🐍</div>
                <div className="mt-2 font-display text-lg font-black text-white">Snake Trader</div>
                <div className="text-xs font-semibold text-ink-400">Eat $ · dodge red liquidations · tap side / arrows</div>
                <Btn variant="bull" size="sm" className="mt-3" onClick={start} sound={false}>
                  Start
                </Btn>
              </>
            ) : (
              <>
                <div className="font-display text-3xl font-black text-white">{score}</div>
                {score >= best && score > 0 && <Chip tone="gold" className="anim-pop mt-1">★ New best</Chip>}
                <div className="mt-3 flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={start}>
                    Retry
                  </Btn>
                  <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", Math.max(5, Math.floor(score / 6)), e.currentTarget); }}>
                    {claimed ? "Claimed" : `+${Math.max(5, Math.floor(score / 6))}`}
                  </Btn>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-35 · PNL MATH SPRINT — fast position math, 45s
 * ===================================================================== */
function genMath(seed: number) {
  const r = mulberry32(seed);
  const kind = Math.floor(r() * 4);
  if (kind === 0) {
    const entry = [30000, 40000, 50000, 60000][Math.floor(r() * 4)];
    const pct = [5, 10, 20, 25][Math.floor(r() * 4)];
    const ans = Math.round(entry * (1 + pct / 100));
    return { q: `Long BTC @ ${entry.toLocaleString()}, +${pct}% = ?`, opts: shuffleSeeded([ans, Math.round(entry * (1 - pct / 100)), Math.round(entry * (1 + pct / 200))], seed), a: ans };
  }
  if (kind === 1) {
    const risk = [0.5, 1, 2][Math.floor(r() * 3)];
    const bal = [1000, 5000, 10000][Math.floor(r() * 3)];
    const ans = Math.round(bal * (risk / 100));
    return { q: `Risk ${risk}% of $${bal.toLocaleString()} = ?`, opts: shuffleSeeded([ans, ans * 2, Math.round(ans / 2)], seed), a: ans };
  }
  if (kind === 2) {
    const lev = [5, 10, 20][Math.floor(r() * 3)];
    const move = [2, 4, 5][Math.floor(r() * 3)];
    const ans = lev * move;
    return { q: `${lev}× long, price +${move}% → PnL?`, opts: shuffleSeeded([ans, Math.round(ans / 2), ans + 10], seed).map((v) => v), a: ans, suffix: "%" };
  }
  const qty = [0.5, 1, 2, 5][Math.floor(r() * 4)];
  const px = [2000, 3000, 60000][Math.floor(r() * 3)];
  const ans = Math.round(qty * px);
  return { q: `Buy ${qty} @ $${px.toLocaleString()} = ?`, opts: shuffleSeeded([ans, Math.round(ans * 1.2), Math.round(ans * 0.8)], seed), a: ans };
}
function MathSprint() {
  const g = useGame();
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [seed, setSeed] = useState(1);
  const [time, setTime] = useState(45);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [claimed, setClaimed] = useState(false);
  const Q = useMemo(() => genMath(seed * 47 + 11), [seed]);
  useInterval(() => setTime((t) => Math.max(0, t - 0.1)), phase === "play" ? 100 : null);
  useEffect(() => {
    if (phase === "play" && time <= 0) {
      setPhase("over");
      sfx("levelup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time]);
  const answer = (v: number) => {
    if (phase !== "play") return;
    if (v === Q.a) {
      const pts = 10 + Math.min(30, streak * 3);
      setScore((s) => s + pts);
      setStreak((s) => s + 1);
      setFlash("ok");
      sfx(streak >= 4 ? "combo" : "success");
    } else {
      setStreak(0);
      setFlash("bad");
      sfx("error");
      setTime((t) => Math.max(0, t - 2));
    }
    setTimeout(() => setFlash(null), 250);
    setSeed((s) => s + 1);
  };
  const start = () => {
    setPhase("play");
    setSeed(1);
    setTime(45);
    setScore(0);
    setStreak(0);
    setClaimed(false);
    sfx("go");
  };
  return (
    <Asset title="PnL Math Sprint" code="G-35" tags="math sprint pnl calculation quiz speed leverage risk position size" span={4}>
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          const n = parseInt(e.key);
          if (n >= 1 && n <= 3) answer(Q.opts[n - 1]);
        }}
        className="outline-none"
      >
        <div className="mb-3 flex items-center gap-2">
          <Chip tone="gold">
            <TickNumber value={score} />
          </Chip>
          <Chip tone={streak >= 5 ? "flame" : "azure"}>🔥 {streak}</Chip>
          <span className={cn("ml-auto font-mono text-sm font-bold", time < 10 && phase === "play" ? "anim-glow text-bear" : "text-white")}>{Math.ceil(time)}s</span>
        </div>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-ink-950">
          <div className="h-full rounded-full bg-gradient-to-r from-azure to-cyan transition-all" style={{ width: `${(time / 45) * 100}%` }} />
        </div>
        {phase === "ready" ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="text-5xl">🧮</div>
            <div className="mt-2 font-display text-lg font-black text-white">PnL Math Sprint</div>
            <div className="text-xs font-semibold text-ink-400">Position math under pressure · keys 1–3</div>
            <Btn variant="azure" className="mt-4" onClick={start} sound={false}>
              Start 45s
            </Btn>
          </div>
        ) : phase === "over" ? (
          <div className="anim-pop flex flex-col items-center py-6 text-center">
            <div className="font-display text-4xl font-black text-white">{score}</div>
            <div className="text-xs font-bold text-ink-400">{score > 200 ? "Quant brain!" : score > 100 ? "Solid desk math." : "Keep practicing sizes."}</div>
            <div className="mt-4 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={start}>
                Retry
              </Btn>
              <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", Math.max(5, Math.floor(score / 8)), e.currentTarget); }}>
                {claimed ? "Claimed" : `+${Math.max(5, Math.floor(score / 8))}`}
              </Btn>
            </div>
          </div>
        ) : (
          <div className={cn("rounded-3xl p-5 text-center transition-colors", flash === "ok" ? "bg-bull/20" : flash === "bad" ? "bg-bear/20 anim-shake" : "bg-ink-850")}>
            <div key={seed} className="anim-slide-up font-display text-xl font-black text-white">
              {Q.q}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Q.opts.map((o, i) => (
                <button
                  key={`${seed}-${o}`}
                  onClick={() => answer(o)}
                  className="anim-pop rounded-2xl border-2 border-ink-600 bg-ink-800 py-3.5 font-mono text-sm font-bold text-white shadow-[0_4px_0_#0b1838] transition hover:bg-ink-750 active:translate-y-1 active:shadow-none"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="mr-1 text-[10px] text-ink-500">{i + 1}</span>
                  {o.toLocaleString()}
                  {"suffix" in Q ? (Q as { suffix: string }).suffix : ""}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-36 · CHART JIGSAW — drag 4 chart chunks into the right order
 * ===================================================================== */
function genChunks(seed: number) {
  const r = mulberry32(seed);
  let p = 100;
  const full: number[] = [];
  for (let i = 0; i < 48; i++) {
    p += (r() - 0.47 + Math.sin(i / 9) * 0.14) * 2.4;
    full.push(p);
  }
  return [0, 1, 2, 3].map((k) => full.slice(k * 12, k * 12 + 12));
}
function ChartJigsaw() {
  const g = useGame();
  const [round, setRound] = useState(1);
  const chunks = useMemo(() => genChunks(round * 67 + 3), [round]);
  const [order, setOrder] = useState(() => shuffleSeeded([0, 1, 2, 3], 9));
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const all = chunks.flat();
  const min = Math.min(...all);
  const max = Math.max(...all);
  const path = (ch: number[]) => {
    const W = 120;
    const H = 64;
    return ch.map((v, i) => `${i ? "L" : "M"}${(i / 11) * W},${6 + ((max - v) / (max - min)) * (H - 12)}`).join("");
  };
  const check = (o: number[]) => {
    if (o.every((v, i) => v === i)) {
      setDone(true);
      sfx("success");
      fx.burst(document.querySelector(`[data-jig="${round}"]`), { count: 30, spread: 130 });
    }
  };
  const drop = (to: number) => {
    if (drag === null) return;
    const n = [...order];
    const [m] = n.splice(drag, 1);
    n.splice(to, 0, m);
    setOrder(n);
    setDrag(null);
    setOver(null);
    sfx("tap");
    check(n);
  };
  return (
    <Asset title="Chart Jigsaw" code="G-36" tags="jigsaw puzzle chart order drag sequence trend assemble" span={8}>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-sm font-black text-white">Reassemble the trend left → right</div>
        <Chip tone="azure">Round {round}</Chip>
      </div>
      <div data-jig={round} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {order.map((ci, slot) => (
          <div
            key={`${round}-${slot}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(slot);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              drop(slot);
            }}
            onPointerDown={() => {
              if (done) return;
              if (drag === null) {
                setDrag(slot);
                sfx("select");
              } else if (drag === slot) setDrag(null);
              else drop(slot);
            }}
            className={cn(
              "cursor-grab rounded-2xl border-2 bg-ink-850 p-2 transition-all active:cursor-grabbing",
              over === slot ? "scale-[1.03] border-azure shadow-[0_0_18px_rgba(62,139,255,.5)]" : drag === slot ? "border-gold" : "border-ink-600",
              done && "border-bull/60",
            )}
          >
            <svg viewBox="0 0 120 64" className="w-full rounded-xl bg-ink-950">
              <path d={path(chunks[ci])} stroke={done ? "#22d39a" : "#5ea0ff"} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx={chunks[ci].length - 1 === 11 ? 120 - 2 : 0} cy="0" r="0" />
            </svg>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-ink-500">
              <span>Piece {String.fromCharCode(65 + ci)}</span>
              <span>Slot {slot + 1}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] font-bold text-ink-400">Tap two pieces to swap (or drag & drop)</span>
        {done ? (
          <div className="anim-pop ml-auto flex items-center gap-2">
            <span className="font-display text-sm font-black text-bull">Trend restored!</span>
            <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", 25, e.currentTarget); }}>
              {claimed ? "Claimed" : "+25 XP"}
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => { setRound((r) => r + 1); setOrder(shuffleSeeded([0, 1, 2, 3], Date.now() % 997)); setDone(false); setClaimed(false); }}>
              Next
            </Btn>
          </div>
        ) : (
          <Btn
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              setOrder(shuffleSeeded([0, 1, 2, 3], Date.now() % 997));
              setDrag(null);
            }}
          >
            Shuffle
          </Btn>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-37 · BULL RUNNER — endless runner: jump over red candles
 * ===================================================================== */
type Ob = { x: number; w: number; h: number; kind: "red" | "coin" };
function BullRunner() {
  const g = useGame();
  const visible = useAssetVisible();
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const [score, setScore] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const S = useRef({ y: 0, vy: 0, ground: true, obs: [] as Ob[], coins: 0, t: 0, speed: 260, dist: 0, dead: 0 });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const jump = () => {
    const s = S.current;
    if (phaseRef.current !== "play") return;
    if (s.ground) {
      s.vy = -560;
      s.ground = false;
      sfx("pop", 1.3);
    }
  };
  const start = () => {
    S.current = { y: 0, vy: 0, ground: true, obs: [], coins: 0, t: 0, speed: 260, dist: 0, dead: 0 };
    setScore(0);
    setClaimed(false);
    setPhase("play");
    sfx("go");
  };
  useEffect(() => {
    if (!visible) return;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const gy = H - 44;
      const st = S.current;
      const playing = phaseRef.current === "play";
      if (playing) {
        st.t += dt;
        st.speed = 260 + st.t * 9;
        st.vy += 1650 * dt;
        st.y += st.vy * dt;
        if (st.y >= 0) {
          st.y = 0;
          st.vy = 0;
          st.ground = true;
        }
        st.dist += st.speed * dt;
        const lastOb = st.obs[st.obs.length - 1];
        if (!lastOb || lastOb.x < W - 260 - Math.random() * 160) {
          const r = Math.random();
          if (r < 0.3) st.obs.push({ x: W + 20, w: 26, h: 26, kind: "coin" });
          else st.obs.push({ x: W + 20, w: 22 + Math.random() * 14, h: 46 + Math.random() * 40, kind: "red" });
        }
        const px = 70;
        const py = gy + st.y - 30;
        st.obs.forEach((o) => {
          o.x -= st.speed * dt;
          if (o.kind === "coin") {
            if (Math.abs(o.x - px) < 26 && Math.abs(gy - 60 - py) < 40) {
              o.x = -999;
              st.coins += 1;
              sfx("coin", 1 + st.coins * 0.02);
            }
          } else if (o.x < px + 22 && o.x + o.w > px - 22 && py + 30 > gy - o.h) {
            setPhase("over");
            sfx("hit");
            sfx("lose");
          }
        });
        st.obs = st.obs.filter((o) => o.x > -60);
        setScore(Math.floor(st.dist / 10) + st.coins * 25);
      }
      // bg
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#0d1a3d");
      grd.addColorStop(1, "#1c3365");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // moon
      ctx.fillStyle = "#ffc23d";
      ctx.beginPath();
      ctx.arc(W - 60, 52, 24, 0, Math.PI * 2);
      ctx.fill();
      // mountains (parallax)
      ctx.fillStyle = "#16295a";
      const off = playing ? st.dist * 0.2 : 0;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = -((off % 200) + 200); x < W + 200; x += 200) {
        ctx.lineTo(x + 100, gy - 90);
        ctx.lineTo(x + 200, gy);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.fill();
      // ground
      ctx.fillStyle = "#0b1838";
      ctx.fillRect(0, gy, W, H - gy);
      ctx.fillStyle = "#22d39a";
      ctx.fillRect(0, gy, W, 3);
      const goff = playing ? st.dist % 40 : 0;
      ctx.fillStyle = "rgba(34,211,154,.3)";
      for (let x = -goff; x < W; x += 40) ctx.fillRect(x, gy + 12, 20, 3);
      // obstacles
      st.obs.forEach((o) => {
        if (o.kind === "coin") {
          ctx.fillStyle = "#ffc23d";
          ctx.beginPath();
          ctx.arc(o.x, gy - 60 + Math.sin(now / 300 + o.x) * 5, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#8a5200";
          ctx.font = "900 11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("$", o.x, gy - 59 + Math.sin(now / 300 + o.x) * 5);
        } else {
          ctx.fillStyle = "#8a1628";
          ctx.fillRect(o.x, gy - o.h + 4, o.w, o.h);
          ctx.fillStyle = "#ff4d6d";
          ctx.fillRect(o.x, gy - o.h, o.w, o.h - 4);
          ctx.fillStyle = "rgba(255,255,255,.3)";
          ctx.fillRect(o.x + 4, gy - o.h + 4, 4, o.h - 12);
        }
      });
      // bull player
      const px = 70;
      const py = gy + st.y;
      const run = playing && st.ground ? Math.sin(now / 70) * 3 : 0;
      ctx.save();
      ctx.translate(px, py - 26 + run * 0.3);
      if (!st.ground) ctx.rotate(-0.12);
      ctx.fillStyle = "#22d39a";
      ctx.beginPath();
      ctx.roundRect(-20, -20, 42, 36, 10);
      ctx.fill();
      ctx.fillStyle = "#e3eaf8";
      ctx.fillRect(-24, -26, 8, 12);
      ctx.fillRect(16, -26, 8, 12);
      ctx.fillStyle = "#03281b";
      ctx.beginPath();
      ctx.arc(-6, -4, 3, 0, Math.PI * 2);
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a6b4a";
      ctx.beginPath();
      ctx.ellipse(1, 10, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible]);
  const reward = Math.max(5, Math.floor(score / 25));
  return (
    <Asset title="Bull Runner · Endless" code="G-37" tags="runner endless jump canvas bull dodge red candles coins" span={4} badge="Arcade">
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "ArrowUp") {
            e.preventDefault();
            phase === "play" ? jump() : start();
          }
        }}
        onPointerDown={() => (phase === "play" ? jump() : start())}
        className="relative cursor-pointer overflow-hidden rounded-2xl outline-none select-none"
      >
        <canvas ref={cvRef} className="block h-[240px] w-full" />
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex gap-2">
          <Chip tone="gold">
            <TickNumber value={score} />
          </Chip>
          <Chip tone="azure">
            <CoinIcon size={12} /> {S.current.coins}
          </Chip>
        </div>
        {phase !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-950/55 text-center backdrop-blur-[1px]">
            {phase === "ready" ? (
              <>
                <BullIcon size={52} />
                <div className="mt-1 font-display text-lg font-black text-white">Bull Runner</div>
                <div className="text-xs font-semibold text-ink-300">Tap / Space to jump over red candles</div>
              </>
            ) : (
              <>
                <div className="font-display text-3xl font-black text-white">{score}</div>
                <div className="mt-2 flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); start(); }}>
                    Retry
                  </Btn>
                  <Btn
                    variant="gold"
                    size="sm"
                    disabled={claimed}
                    onClick={(e) => {
                      e.stopPropagation();
                      setClaimed(true);
                      g.reward("xp", reward, e.currentTarget);
                    }}
                  >
                    {claimed ? "Claimed" : `+${reward}`}
                  </Btn>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Asset>
  );
}

export default function Puzzle() {
  return (
    <>
      <SequenceTrader />
      <Breakout />
      <AimTrainer />
      <SnakeTrader />
      <MathSprint />
      <ChartJigsaw />
      <BullRunner />
    </>
  );
}
