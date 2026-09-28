import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Confetti, haptic } from "../../components/ui";
import { BullIcon, CoinIcon, GemIcon, HeartIcon, Icon, TrophyIcon, XPIcon } from "../../components/icons";
import { fx, PALETTE, useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, mulberry32, shuffleSeeded, useAssetVisible, useInterval, useLatest } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-13 · CANDLE CATCHER — canvas arcade: catch green, dodge red
 * ===================================================================== */
type Item = { x: number; y: number; vy: number; kind: "green" | "red" | "coin" | "gem"; rot: number };
type Part = { x: number; y: number; vx: number; vy: number; life: number; c: string; s: number };

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function CandleCatcher() {
  const g = useGame();
  const visible = useAssetVisible();
  const wrapRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"ready" | "play" | "over">("ready");
  const phaseRef = useLatest(phase);
  const [hud, setHud] = useState({ score: 0, lives: 3, level: 1 });
  const [banner, setBanner] = useState<string | null>(null);
  const [best, setBest] = useState(() => Number(localStorage.getItem("tl-catcher-best") || 0));
  const [claimed, setClaimed] = useState(false);
  const G = useRef({
    items: [] as Item[],
    parts: [] as Part[],
    stars: [] as { x: number; y: number; s: number; v: number }[],
    px: 0.5,
    tx: 0.5,
    spawn: 0.6,
    t: 0,
    score: 0,
    lives: 3,
    level: 1,
    shake: 0,
    flash: 0,
    pulse: 0,
    keys: { l: false, r: false },
  });

  const start = () => {
    Object.assign(G.current, { items: [], parts: [], px: 0.5, tx: 0.5, spawn: 0.6, t: 0, score: 0, lives: 3, level: 1, shake: 0, flash: 0 });
    setHud({ score: 0, lives: 3, level: 1 });
    setClaimed(false);
    setPhase("play");
    sfx("go");
    wrapRef.current?.focus();
  };

  useEffect(() => {
    if (!visible) return;
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const st = G.current;
    if (!st.stars.length) st.stars = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.6 + 0.4, v: Math.random() * 0.5 + 0.2 }));
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    const burst = (x: number, y: number, c: string, n: number) => {
      for (let i = 0; i < n; i++) st.parts.push({ x, y, vx: (Math.random() - 0.5) * 280, vy: -Math.random() * 280 - 40, life: 1, c, s: 3 + Math.random() * 4 });
    };
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const playing = phaseRef.current === "play";
      st.t += dt;
      if (st.keys.l) st.tx -= 1.35 * dt;
      if (st.keys.r) st.tx += 1.35 * dt;
      st.tx = clamp(st.tx, 0.07, 0.93);
      st.px += (st.tx - st.px) * Math.min(1, dt * 16);

      if (playing) {
        st.spawn -= dt;
        if (st.spawn <= 0) {
          const r = Math.random();
          const redP = Math.min(0.44, 0.26 + st.level * 0.03);
          const kind: Item["kind"] = r < 0.035 ? "gem" : r < 0.15 ? "coin" : r < 0.15 + redP ? "red" : "green";
          st.items.push({ x: 0.06 + Math.random() * 0.88, y: -30, vy: 130 + st.level * 26 + Math.random() * 50, kind, rot: Math.random() * 6 });
          st.spawn = Math.max(0.24, 0.85 - st.level * 0.07) * (0.65 + Math.random() * 0.7);
        }
      }
      const padW = 96;
      const padY = H - 42;
      st.items.forEach((it) => (it.y += it.vy * dt));
      st.items = st.items.filter((it) => {
        const ix = it.x * W;
        if (playing && it.y > padY - 18 && it.y < padY + 18 && Math.abs(ix - st.px * W) < padW / 2 + 10) {
          if (it.kind === "red") {
            st.lives -= 1;
            st.shake = 0.35;
            st.flash = 0.35;
            sfx("hit");
            haptic(40);
            burst(ix, padY, "#ff4d6d", 18);
            if (st.lives <= 0) {
              setPhase("over");
              sfx("lose");
              setBest((b) => {
                const nb = Math.max(b, st.score);
                localStorage.setItem("tl-catcher-best", String(nb));
                return nb;
              });
            }
          } else {
            const pts = it.kind === "gem" ? 50 : it.kind === "coin" ? 25 : 10 * st.level;
            st.score += pts;
            st.pulse = 1;
            sfx(it.kind === "gem" ? "gem" : it.kind === "coin" ? "coin" : "pop", 1 + Math.random() * 0.2);
            burst(ix, padY - 10, it.kind === "gem" ? "#2fd4ff" : it.kind === "coin" ? "#ffc23d" : "#22d39a", 12);
            const lvl = 1 + Math.floor(st.score / 250);
            if (lvl > st.level) {
              st.level = lvl;
              setBanner(`LEVEL ${lvl}`);
              sfx("combo");
              setTimeout(() => setBanner(null), 1200);
            }
          }
          setHud({ score: st.score, lives: st.lives, level: st.level });
          return false;
        }
        return it.y < H + 40;
      });

      ctx.save();
      if (st.shake > 0) {
        st.shake -= dt;
        const m = st.shake * 20;
        ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
      }
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#081130");
      grd.addColorStop(1, "#13244a");
      ctx.fillStyle = grd;
      ctx.fillRect(-20, -20, W + 40, H + 40);
      ctx.strokeStyle = "rgba(142,164,210,0.07)";
      ctx.lineWidth = 1;
      const off = (st.t * 40 * (playing ? 1 + st.level * 0.25 : 0.4)) % 32;
      for (let yy = off - 32; yy < H; yy += 32) {
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(W, yy);
        ctx.stroke();
      }
      for (let xx = 0; xx < W; xx += 32) {
        ctx.beginPath();
        ctx.moveTo(xx, 0);
        ctx.lineTo(xx, H);
        ctx.stroke();
      }
      st.stars.forEach((s) => {
        s.y += s.v * dt * (playing ? 0.3 : 0.08);
        if (s.y > 1) s.y = 0;
        ctx.fillStyle = `rgba(188,203,234,${0.25 + s.s * 0.2})`;
        ctx.fillRect(s.x * W, s.y * H, s.s, s.s);
      });

      st.items.forEach((it) => {
        const x = it.x * W;
        const y = it.y;
        if (it.kind === "green" || it.kind === "red") {
          const col = it.kind === "green" ? "#22d39a" : "#ff4d6d";
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y - 24);
          ctx.lineTo(x, y + 24);
          ctx.stroke();
          ctx.shadowColor = col;
          ctx.shadowBlur = 16;
          ctx.fillStyle = col;
          rr(ctx, x - 9, y - 15, 18, 30, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(255,255,255,.35)";
          rr(ctx, x - 6, y - 12, 4, 22, 2);
          ctx.fill();
        } else if (it.kind === "coin") {
          const sx = Math.max(0.15, Math.abs(Math.cos(st.t * 5 + it.rot)));
          ctx.save();
          ctx.translate(x, y);
          ctx.scale(sx, 1);
          ctx.fillStyle = "#a86400";
          circle(ctx, 0, 2, 13);
          ctx.fillStyle = "#ffc23d";
          circle(ctx, 0, 0, 13);
          ctx.fillStyle = "#ffe28a";
          circle(ctx, 0, 0, 9);
          ctx.fillStyle = "#a86400";
          ctx.font = "900 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("₿", 0, 1);
          ctx.restore();
        } else {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.sin(st.t * 3 + it.rot) * 0.3);
          const gg = ctx.createLinearGradient(-12, -12, 12, 12);
          gg.addColorStop(0, "#b5f4ff");
          gg.addColorStop(1, "#1c6fe0");
          ctx.shadowColor = "#2fd4ff";
          ctx.shadowBlur = 18;
          ctx.fillStyle = gg;
          ctx.beginPath();
          ctx.moveTo(-10, -8);
          ctx.lineTo(10, -8);
          ctx.lineTo(15, -1);
          ctx.lineTo(0, 16);
          ctx.lineTo(-15, -1);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.shadowBlur = 0;
        }
      });

      const px = st.px * W;
      ctx.fillStyle = "#0b1838";
      rr(ctx, px - padW / 2, padY - 6, padW, 26, 10);
      ctx.fill();
      const pg = ctx.createLinearGradient(0, padY - 12, 0, padY + 12);
      pg.addColorStop(0, "#5ea0ff");
      pg.addColorStop(1, "#3e8bff");
      if (st.pulse > 0) {
        ctx.shadowColor = "#22d39a";
        ctx.shadowBlur = 24 * st.pulse;
      }
      ctx.fillStyle = pg;
      rr(ctx, px - padW / 2, padY - 12, padW, 24, 10);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,.35)";
      rr(ctx, px - padW / 2 + 8, padY - 9, padW - 16, 4, 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "900 10px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WALLET", px, padY + 5);
      st.pulse = Math.max(0, st.pulse - dt * 4);

      st.parts = st.parts.filter((p) => (p.life -= dt * 1.5) > 0);
      st.parts.forEach((p) => {
        p.vy += 620 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
      if (st.flash > 0) {
        st.flash -= dt;
        ctx.fillStyle = `rgba(255,77,109,${Math.max(0, st.flash)})`;
        ctx.fillRect(0, 0, W, H);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, phaseRef]);

  const reward = Math.max(5, Math.floor(hud.score / 20));
  return (
    <Asset title="Candle Catcher · Arcade" code="G-13" tags="arcade canvas game catch candles dodge falling coins gems levels" span={5} badge="Arcade">
      <div
        ref={wrapRef}
        tabIndex={0}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
          if (e.key === "ArrowLeft") G.current.keys.l = true;
          if (e.key === "ArrowRight") G.current.keys.r = true;
          if (e.key === " " && phase !== "play") start();
        }}
        onKeyUp={(e) => {
          if (e.key === "ArrowLeft") G.current.keys.l = false;
          if (e.key === "ArrowRight") G.current.keys.r = false;
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          G.current.tx = clamp((e.clientX - r.left) / r.width, 0.07, 0.93);
        }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          G.current.tx = clamp((e.clientX - r.left) / r.width, 0.07, 0.93);
        }}
        className="relative h-[380px] overflow-hidden rounded-2xl outline-none ring-azure/60 focus-visible:ring-2"
        style={{ touchAction: phase === "play" ? "none" : "auto" }}
      >
        <canvas ref={cvRef} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-3 p-3">
          <div className="rounded-xl bg-ink-950/60 px-3 py-1 backdrop-blur">
            <div className="text-[9px] font-black uppercase tracking-widest text-ink-400">Score</div>
            <div key={hud.score} className="anim-bump font-display text-lg font-black text-white">
              {hud.score}
            </div>
          </div>
          <Chip tone="violet">LVL {hud.level}</Chip>
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <HeartIcon key={i} size={22} dim={i >= hud.lives} />
            ))}
          </div>
        </div>
        {banner && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="anim-pop font-display text-4xl font-black text-gold drop-shadow-[0_4px_0_#7a4f00]">{banner}</span>
          </div>
        )}
        {phase !== "play" && (
          <div className="anim-fade absolute inset-0 flex flex-col items-center justify-center bg-ink-950/60 p-6 text-center backdrop-blur-[2px]" style={{ animation: "fade-in .3s both" }}>
            {phase === "ready" ? (
              <>
                <div className="flex gap-2">
                  <span className="h-10 w-4 rounded bg-bull shadow-[0_0_14px_#22d39a]" />
                  <CoinIcon size={40} className="anim-bounce-soft" />
                  <span className="h-10 w-4 rounded bg-bear shadow-[0_0_14px_#ff4d6d]" />
                </div>
                <div className="mt-3 font-display text-2xl font-black text-white">Candle Catcher</div>
                <div className="mt-1 text-xs font-semibold text-ink-300">Catch green candles, coins & gems. Dodge red. Move with mouse, finger or ← →.</div>
                <Btn variant="bull" className="mt-4" onClick={start} sound={false}>
                  <Icon name="play" size={16} /> Play
                </Btn>
                <div className="mt-2 text-[10px] font-bold text-ink-500">Best {best}</div>
              </>
            ) : (
              <>
                <div className="font-display text-3xl font-black text-white">Game over</div>
                <div className="mt-1 font-mono text-lg font-bold text-gold">{hud.score} pts</div>
                {hud.score >= best && hud.score > 0 && <Chip tone="gold" className="anim-pop mt-2">★ New record</Chip>}
                <div className="mt-4 flex gap-3">
                  <Btn variant="ghost" onClick={start}>
                    Retry
                  </Btn>
                  <Btn variant="gold" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", reward, e.currentTarget); }}>
                    <XPIcon size={16} /> {claimed ? "Claimed" : `+${reward}`}
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
 * G-14 · BOSS BATTLE — answer to attack the Bear King
 * ===================================================================== */
const BQ = [
  { q: "Higher highs & higher lows means…", o: ["Uptrend", "Downtrend", "Range"], a: 0 },
  { q: "Best spot for a long's stop-loss?", o: ["Above resistance", "Below support", "At entry"], a: 1 },
  { q: "10× leverage, price drops 10%. Result?", o: ["-10%", "Liquidated", "+10%"], a: 1 },
  { q: "RSI at 18 suggests the asset is…", o: ["Overbought", "Oversold", "Neutral"], a: 1 },
  { q: "Volume spikes on a breakout. Signal?", o: ["Confirmation", "Fakeout", "Nothing"], a: 0 },
  { q: "Risk per trade most pros use?", o: ["1–2%", "25%", "50%"], a: 0 },
  { q: "'Buy the rumor, sell the…'", o: ["Dip", "News", "Top"], a: 1 },
  { q: "Death cross: 50MA crosses…", o: ["Above 200MA", "Below 200MA", "The price"], a: 1 },
  { q: "Best defense against exchange collapse?", o: ["Self-custody", "More leverage", "Hope"], a: 0 },
  { q: "Stablecoins are mainly used to…", o: ["Park value", "Mine BTC", "Pay miners"], a: 0 },
];
const TAUNTS = {
  start: "The market always wins, rookie!",
  hit: ["Ouch! Lucky guess…", "Grr… not bad!", "That tickled!", "You'll pay for that!"],
  crit: ["CRITICAL?! Impossible!", "My beautiful red candles!"],
  attack: ["RED CANDLES FOREVER!", "Your portfolio is MINE!", "Liquidated! Hahaha!"],
};

function BearKing({ attacking, hurt }: { attacking: boolean; hurt: boolean }) {
  return (
    <svg viewBox="0 0 160 160" className="h-full w-full drop-shadow-[0_12px_20px_rgba(0,0,0,.6)]">
      <defs>
        <linearGradient id="bkFur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a3a4c" />
          <stop offset="1" stopColor="#4a1522" />
        </linearGradient>
        <linearGradient id="bkCrown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1a8" />
          <stop offset="1" stopColor="#e09000" />
        </linearGradient>
        <radialGradient id="bkEye">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".4" stopColor="#ff4d6d" />
          <stop offset="1" stopColor="#ff4d6d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="80" cy="150" rx="46" ry="7" fill="#000" opacity=".35" />
      <circle cx="38" cy="46" r="18" fill="#4a1522" />
      <circle cx="122" cy="46" r="18" fill="#4a1522" />
      <circle cx="38" cy="46" r="9" fill="#c2566a" />
      <circle cx="122" cy="46" r="9" fill="#c2566a" />
      <circle cx="80" cy="86" r="56" fill="url(#bkFur)" />
      <path d="M44 30 L56 8 L68 26 L80 4 L92 26 L104 8 L116 30 Z" fill="url(#bkCrown)" stroke="#a86400" strokeWidth="2" />
      <circle cx="80" cy="16" r="4" fill="#ff4d6d" />
      <circle cx="58" cy="22" r="3" fill="#2fd4ff" />
      <circle cx="102" cy="22" r="3" fill="#22d39a" />
      <path d="M50 66 L70 74 M110 66 L90 74" stroke="#1a0409" strokeWidth="6" strokeLinecap="round" />
      <circle cx="62" cy="82" r="13" fill="url(#bkEye)" className="anim-glow" />
      <circle cx="98" cy="82" r="13" fill="url(#bkEye)" className="anim-glow" />
      <circle cx="62" cy="82" r="4" fill="#fff" />
      <circle cx="98" cy="82" r="4" fill="#fff" />
      <path d="M100 60 l10 26" stroke="#2a0710" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="80" cy="112" rx="26" ry={attacking ? 22 : 16} fill="#e8a0ae" />
      <ellipse cx="80" cy="102" rx="9" ry="6" fill="#1a0409" />
      {attacking ? (
        <>
          <ellipse cx="80" cy="120" rx="16" ry="12" fill="#1a0409" />
          <path d="M66 112 l4 8 l4 -8 M86 112 l4 8 l4 -8" fill="#fff" />
        </>
      ) : (
        <path d={hurt ? "M66 124 q14 -10 28 0" : "M66 118 q14 10 28 0"} stroke="#1a0409" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

function BossBattle() {
  const g = useGame();
  const MAX = 300;
  const [phase, setPhase] = useState<"intro" | "fight" | "win" | "lose">("intro");
  const [hp, setHp] = useState(MAX);
  const [trail, setTrail] = useState(MAX);
  const [hearts, setHearts] = useState(3);
  const [meter, setMeter] = useState(0);
  const [combo, setCombo] = useState(0);
  const [qi, setQi] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [shot, setShot] = useState<{ id: number; tx: number; ty: number; ult: boolean } | null>(null);
  const [hitKey, setHitKey] = useState(0);
  const [atkKey, setAtkKey] = useState(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState<{ k: number; c: "red" | "white" } | null>(null);
  const [taunt, setTaunt] = useState(TAUNTS.start);
  const [claimed, setClaimed] = useState(false);
  const [fire, setFire] = useState(0);
  const bossRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const order = useMemo(() => shuffleSeeded(BQ.map((_, i) => i), 42), []);
  const Q = BQ[order[qi % order.length]];

  useEffect(() => {
    const t = setTimeout(() => setTrail(hp), 550);
    return () => clearTimeout(t);
  }, [hp]);

  const fireShot = (ult: boolean) => {
    const b = bossRef.current?.getBoundingClientRect();
    const p = playerRef.current?.getBoundingClientRect();
    if (!b || !p) return;
    setShot({ id: Date.now(), tx: b.left + b.width / 2 - (p.left + p.width / 2), ty: b.top + b.height / 2 - (p.top + p.height / 2), ult });
    sfx(ult ? "charge" : "whoosh");
  };
  const impact = () => {
    if (!shot) return;
    const crit = shot.ult || combo >= 3;
    const dmg = shot.ult ? 90 : crit ? 45 : 25;
    const nhp = Math.max(0, hp - dmg);
    setHp(nhp);
    setHitKey((k) => k + 1);
    sfx("hit");
    haptic(30);
    fx.text(bossRef.current, `-${dmg}${crit ? "!" : ""}`, crit ? "#ffc23d" : "#ffffff", crit);
    fx.burst(bossRef.current, { colors: ["#fff", "#ffc23d", "#ff4d6d"], count: crit ? 30 : 16, spread: crit ? 110 : 70 });
    if (shot.ult) setFlash({ k: Date.now(), c: "white" });
    setTaunt(crit ? TAUNTS.crit[hitKey % 2] : TAUNTS.hit[hitKey % 4]);
    setShot(null);
    if (nhp <= 0) {
      setTimeout(() => {
        setPhase("win");
        setFire((f) => f + 1);
        sfx("levelup");
      }, 700);
    } else setTimeout(nextQ, 500);
  };
  const nextQ = () => {
    setQi((q) => q + 1);
    setPicked(null);
    setLocked(false);
  };
  const answer = (i: number) => {
    if (locked || phase !== "fight") return;
    setLocked(true);
    setPicked(i);
    if (i === Q.a) {
      setCombo((c) => c + 1);
      setMeter((m) => Math.min(100, m + 34));
      fireShot(false);
    } else {
      setCombo(0);
      setAtkKey((k) => k + 1);
      setTaunt(TAUNTS.attack[atkKey % 3]);
      setTimeout(() => {
        arenaRef.current?.animate(
          [
            { transform: "translate(0,0)" },
            { transform: "translate(-8px,4px) rotate(-.7deg)" },
            { transform: "translate(7px,-5px) rotate(.7deg)" },
            { transform: "translate(-5px,3px)" },
            { transform: "translate(4px,-2px)" },
            { transform: "translate(0,0)" },
          ],
          { duration: 450, easing: "ease-out" },
        );
        setFlash({ k: Date.now(), c: "red" });
        sfx("hit");
        sfx("error");
        haptic(80);
        fx.burst(playerRef.current, { colors: PALETTE.hearts, count: 14, spread: 50 });
        setHearts((h) => {
          const nh = h - 1;
          if (nh <= 0) setTimeout(() => { setPhase("lose"); sfx("lose"); }, 600);
          else setTimeout(nextQ, 700);
          return nh;
        });
      }, 300);
    }
  };
  const ultimate = () => {
    if (meter < 100 || locked) return;
    setMeter(0);
    setLocked(true);
    fireShot(true);
  };
  const reset = () => {
    setPhase("fight");
    setHp(MAX);
    setTrail(MAX);
    setHearts(3);
    setMeter(0);
    setCombo(0);
    setQi(0);
    setLocked(false);
    setPicked(null);
    setTaunt(TAUNTS.start);
    setClaimed(false);
    sfx("go");
  };
  return (
    <Asset title="Boss Battle · Bear King" code="G-14" tags="boss battle fight rpg hp damage attack ultimate quiz combat" span={7} badge="Epic">
      <Confetti fire={fire} count={40} />
      <div ref={arenaRef} className="relative overflow-hidden rounded-3xl">
        <div className="relative h-[270px] overflow-hidden rounded-3xl" style={{ background: "radial-gradient(120% 90% at 80% 10%, #5a1626 0%, #1a0f2e 45%, #0a1330 100%)" }}>
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute left-4 right-4 top-3 z-10">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
              <span className="text-bear">👑 Bear King</span>
              <span className="font-mono text-white">
                {hp}/{MAX}
              </span>
            </div>
            <div className="relative mt-1 h-4 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
              <div className="absolute inset-y-0 left-0 rounded-full bg-white/80 transition-[width] duration-700 ease-out" style={{ width: `${(trail / MAX) * 100}%` }} />
              <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-b from-[#ff8aa0] to-bear transition-[width] duration-200" style={{ width: `${(hp / MAX) * 100}%` }}>
                <div className="absolute inset-x-2 top-[3px] h-1 rounded-full bg-white/40" />
              </div>
            </div>
          </div>
          <div key={`t${taunt}`} className="anim-pop absolute right-40 top-16 z-10 max-w-[180px] rounded-2xl bg-white px-3 py-2 text-[11px] font-black text-ink-900 shadow-[0_3px_0_#8ea4d2] sm:right-44">
            {taunt}
            <span className="absolute -right-1.5 top-4 h-3 w-3 rotate-45 bg-white" />
          </div>
          <div ref={bossRef} className="absolute right-5 top-12 h-40 w-40">
            <div key={`a${atkKey}`} className={cn("h-full w-full", atkKey > 0 && "[animation:lunge_.45s_ease]")}>
              <div key={`h${hitKey}`} className={cn("h-full w-full", phase === "win" ? "translate-y-10 rotate-12 opacity-40 grayscale transition-all duration-700" : "anim-float", hitKey > 0 && phase !== "win" && "[animation:hit-flash_.4s_ease,float_3.2s_ease-in-out_infinite]")}>
                <BearKing attacking={atkKey > 0 && locked && picked !== Q.a} hurt={hitKey > 0 && locked} />
              </div>
            </div>
          </div>
          <div ref={playerRef} className="absolute bottom-6 left-6 h-20 w-20">
            <div className="anim-bounce-soft h-full w-full">
              <BullIcon size={80} />
            </div>
          </div>
          {shot && (
            <div
              key={shot.id}
              onAnimationEnd={impact}
              className="absolute bottom-6 left-6 z-20 flex h-20 w-20 items-center justify-center"
              style={{ ["--tx" as string]: `${shot.tx}px`, ["--ty" as string]: `${shot.ty}px`, animation: `projectile ${shot.ult ? ".6s" : ".42s"} cubic-bezier(.5,0,.8,.5) forwards` }}
            >
              <span className={cn("block rounded-full", shot.ult ? "h-16 w-16 bg-[radial-gradient(circle,#fff,#ffc23d_40%,#ff7a2f_70%,transparent_72%)] shadow-[0_0_40px_#ffc23d]" : "h-8 w-8 bg-[radial-gradient(circle,#fff,#22d39a_50%,transparent_72%)] shadow-[0_0_24px_#22d39a]")} />
            </div>
          )}
          {flash && <div key={flash.k} className={cn("pointer-events-none absolute inset-0 z-30", flash.c === "red" ? "bg-bear" : "bg-white")} style={{ animation: `${flash.c === "red" ? "red-flash" : "white-flash"} .5s ease-out forwards` }} />}
          {phase === "intro" && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink-950/70 text-center backdrop-blur-sm">
              <div className="font-display text-3xl font-black text-bear" style={{ animation: "slam .6s cubic-bezier(.3,1.4,.5,1) both" }}>
                BOSS FIGHT
              </div>
              <div className="mt-1 text-xs font-bold text-ink-300">Answer correctly to attack. 3 wrong answers and you're rekt.</div>
              <Btn variant="bear" className="mt-4" onClick={reset} sound={false}>
                <Icon name="bolt" size={16} /> Fight!
              </Btn>
            </div>
          )}
          {(phase === "win" || phase === "lose") && (
            <div className="anim-pop absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink-950/75 text-center backdrop-blur-sm">
              {phase === "win" ? (
                <>
                  <TrophyIcon size={64} />
                  <div className="text-gradient-gold font-display text-3xl font-black">VICTORY!</div>
                  <div className="mt-1 flex items-center gap-3 text-sm font-black">
                    <span className="flex items-center gap-1 text-gold"><CoinIcon size={18} /> 150</span>
                    <span className="flex items-center gap-1 text-cyan"><GemIcon size={18} /> 20</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Btn variant="ghost" size="sm" onClick={reset}>Rematch</Btn>
                    <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("coins", 150, e.currentTarget); g.reward("gems", 20, e.currentTarget); }}>
                      {claimed ? "Claimed" : "Claim loot"}
                    </Btn>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-display text-3xl font-black text-bear">REKT</div>
                  <div className="text-xs font-bold text-ink-300">The Bear King wins this round.</div>
                  <Btn variant="bear" size="sm" className="mt-3" onClick={reset}>Try again</Btn>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <HeartIcon key={i} size={24} dim={i >= hearts} />
          ))}
        </div>
        {combo >= 2 && <Chip tone="flame" className="anim-pop">🔥 Combo ×{combo}</Chip>}
        <div className="ml-auto flex items-center gap-2">
          <div className="panel-inset h-3 w-28 overflow-hidden rounded-full">
            <div className={cn("h-full rounded-full transition-all duration-500", meter >= 100 ? "fire-ring" : "bg-gradient-to-r from-gold to-flame")} style={{ width: `${meter}%` }} />
          </div>
          <button onClick={ultimate} disabled={meter < 100 || locked || phase !== "fight"} className={cn("btn3d h-9 rounded-xl px-3 text-[11px] [--depth:3px]", meter >= 100 ? "v-flame anim-pulse-ring [--ring:rgba(255,122,47,.6)]" : "v-ghost")}>
            <Icon name="bolt" size={14} /> Ultimate
          </button>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-ink-950/40 p-3">
        <div key={qi} className="anim-slide-up font-display text-sm font-bold text-white">
          {Q.q}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {Q.o.map((o, i) => (
            <button
              key={`${qi}-${o}`}
              onClick={() => answer(i)}
              disabled={locked || phase !== "fight"}
              className={cn(
                "rounded-xl border-2 px-2 py-2.5 text-xs font-extrabold transition active:translate-y-0.5",
                picked === i ? (i === Q.a ? "border-bull bg-bull/15 text-bull" : "border-bear bg-bear/15 text-bear") : "border-ink-600 bg-ink-800 text-ink-100 shadow-[0_3px_0_#0b1838] hover:bg-ink-750",
              )}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-15 · PVP DUEL — matchmaking → VS slam → countdown → race
 * ===================================================================== */
const RIVALS = [
  { n: "SatoshiJr", c: "#3e8bff", e: "🦊" },
  { n: "CryptoKate", c: "#ff7a2f", e: "🐯" },
  { n: "WhaleWatch", c: "#9170ff", e: "🐳" },
  { n: "DiamondHnd", c: "#2fd4ff", e: "💎" },
  { n: "MoonBoi", c: "#ffc23d", e: "🌙" },
];
const fmtUsd = (v: number) => `$${Math.round(v).toLocaleString()}`;
function genDuelQ(seed: number) {
  const r = mulberry32(seed);
  if (r() < 0.55) {
    const base = [20000, 30000, 40000, 50000, 60000][Math.floor(r() * 5)];
    const pct = [5, 10, 20, 25, 50][Math.floor(r() * 5)];
    const up = r() < 0.6;
    const ans = base * (1 + ((up ? 1 : -1) * pct) / 100);
    const opts = shuffleSeeded([ans, base * (1 + ((up ? -1 : 1) * pct) / 100), base * (1 + ((up ? 1 : -1) * pct) / 200)], seed).map(fmtUsd);
    return { q: `BTC ${fmtUsd(base)} ${up ? "+" : "−"}${pct}% = ?`, opts, a: fmtUsd(ans) };
  }
  const price = [2000, 2500, 3000, 4000][Math.floor(r() * 4)];
  const qty = [0.5, 2, 3, 4][Math.floor(r() * 4)];
  const ans = price * qty;
  const opts = shuffleSeeded([ans, ans * 1.5, price + qty * 100], seed + 1).map(fmtUsd);
  return { q: `Buy ${qty} ETH at ${fmtUsd(price)}. Total cost?`, opts, a: fmtUsd(ans) };
}

function Avatar({ c, e, size = 44 }: { c: string; e: string; size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-full ring-[3px] ring-white/20"
      style={{ width: size, height: size, fontSize: size * 0.5, background: `linear-gradient(180deg, color-mix(in srgb, ${c} 75%, white), ${c})`, boxShadow: `0 4px 0 color-mix(in srgb, ${c} 45%, black)` }}
    >
      {e}
    </span>
  );
}
function Lane({ who, v, c, e, fl, target }: { who: string; v: number; c: string; e: string; fl: "ok" | "bad" | null; target: number }) {
  return (
    <div className="relative">
      <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-ink-400">
        <span>{who}</span>
        <span className="font-mono text-white">
          {v}/{target}
        </span>
      </div>
      <div className={cn("panel-inset relative h-12 rounded-2xl transition-colors", fl === "ok" && "bg-bull/20", fl === "bad" && "bg-bear/20")}>
        {Array.from({ length: target - 1 }).map((_, i) => (
          <span key={i} className="absolute inset-y-2 w-px bg-white/10" style={{ left: `${((i + 1) / target) * 100}%` }} />
        ))}
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg">🏁</span>
        <div className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${(v / target) * 100}% * .86 + 2px)` }}>
          <Avatar c={c} e={e} size={40} />
        </div>
      </div>
    </div>
  );
}

function PvPDuel() {
  const g = useGame();
  const [oppTick, setOppTick] = useState(0);
  const [phase, setPhase] = useState<"idle" | "search" | "vs" | "count" | "race" | "result">("idle");
  const [slot, setSlot] = useState(0);
  const [rival, setRival] = useState(RIVALS[0]);
  const [count, setCount] = useState(3);
  const [me, setMe] = useState(0);
  const [opp, setOpp] = useState(0);
  const [qseed, setQseed] = useState(1);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [oppFlash, setOppFlash] = useState<"ok" | "bad" | null>(null);
  const [emotes, setEmotes] = useState<{ id: number; e: string; side: "me" | "opp"; dx: number }[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [fire, setFire] = useState(0);
  const Q = useMemo(() => genDuelQ(qseed * 31 + 7), [qseed]);
  const TARGET = 5;
  const won = me >= TARGET;

  useInterval(() => setSlot((s) => (s + 1) % RIVALS.length), phase === "search" ? 90 : null);

  const find = () => {
    setPhase("search");
    setMe(0);
    setOpp(0);
    setClaimed(false);
    sfx("whoosh");
    setTimeout(() => {
      const r = RIVALS[Math.floor(Math.random() * RIVALS.length)];
      setRival(r);
      setPhase("vs");
      sfx("hit");
      setTimeout(() => {
        setPhase("count");
        setCount(3);
        sfx("countdown");
        [2, 1, 0].forEach((n, i) =>
          setTimeout(() => {
            setCount(n);
            sfx(n === 0 ? "go" : "countdown");
            if (n === 0) setTimeout(() => setPhase("race"), 500);
          }, (i + 1) * 700),
        );
      }, 1500);
    }, 1800);
  };
  const emote = (e: string, side: "me" | "opp") => {
    const id = Date.now() + Math.random();
    setEmotes((l) => [...l, { id, e, side, dx: (Math.random() - 0.5) * 40 }]);
    setTimeout(() => setEmotes((l) => l.filter((x) => x.id !== id)), 1500);
  };

  useEffect(() => {
    if (phase !== "race") return;
    const t = setTimeout(() => {
      const ok = Math.random() < 0.7;
      setOppTick((k) => k + 1);
      setOppFlash(ok ? "ok" : "bad");
      setTimeout(() => setOppFlash(null), 400);
      if (ok) {
        setOpp((o) => {
          const n = o + 1;
          if (n >= TARGET) {
            setPhase("result");
            sfx("lose");
            emote("😎", "opp");
          }
          return n;
        });
        if (Math.random() < 0.3) emote("🔥", "opp");
      }
    }, 2100 + Math.random() * 1900);
    return () => clearTimeout(t);
  }, [phase, oppTick]);

  const answer = (o: string) => {
    if (phase !== "race") return;
    if (o === Q.a) {
      setFlash("ok");
      sfx("success", 1 + me * 0.05);
      const n = me + 1;
      setMe(n);
      if (n >= TARGET) {
        setPhase("result");
        setFire((f) => f + 1);
        sfx("levelup");
      }
    } else {
      setFlash("bad");
      sfx("error");
      if (Math.random() < 0.5) setTimeout(() => emote("😂", "opp"), 300);
    }
    setTimeout(() => setFlash(null), 300);
    setQseed((s) => s + 1);
  };

  return (
    <Asset title="PvP Duel · Live Race" code="G-15" tags="pvp duel multiplayer race matchmaking versus countdown emotes" span={6} badge="Social">
      <Confetti fire={fire} count={40} />
      <div className="relative min-h-[360px]">
        {phase === "idle" && (
          <div className="anim-pop flex h-[360px] flex-col items-center justify-center text-center">
            <div className="flex -space-x-3">
              {RIVALS.slice(0, 4).map((r, i) => (
                <span key={r.n} className="anim-float" style={{ animationDelay: `${i * 0.2}s` }}>
                  <Avatar c={r.c} e={r.e} size={52} />
                </span>
              ))}
            </div>
            <div className="mt-4 font-display text-2xl font-black text-white">Trading Duel</div>
            <div className="text-xs font-semibold text-ink-400">First to {TARGET} correct answers wins the pot.</div>
            <Btn variant="violet" size="lg" className="mt-5 sheen" onClick={find} sound={false}>
              <Icon name="users" size={18} /> Find match
            </Btn>
          </div>
        )}
        {phase === "search" && (
          <div className="flex h-[360px] flex-col items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <span className="absolute inset-0 rounded-full border-4 border-violet/30" />
              <span className="absolute inset-0 animate-ping rounded-full border-4 border-violet/40" />
              <Avatar c={RIVALS[slot].c} e={RIVALS[slot].e} size={80} />
            </div>
            <div className="mt-5 font-display text-lg font-black text-white">Finding opponent…</div>
            <div className="mt-1 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 rounded-full bg-violet" style={{ animation: `dot-bounce 1s ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        {phase === "vs" && (
          <div className="flex h-[360px] items-center justify-between overflow-hidden px-4">
            <div className="anim-slide-left flex flex-col items-center">
              <Avatar c="#22d39a" e="🐂" size={88} />
              <div className="mt-2 font-display text-sm font-black text-white">You</div>
              <div className="text-[10px] font-bold text-ink-400">LVL {g.level.lvl}</div>
            </div>
            <div className="font-display text-6xl font-black text-gold drop-shadow-[0_6px_0_#7a4f00]" style={{ animation: "slam .55s .2s cubic-bezier(.3,1.5,.5,1) both" }}>
              VS
            </div>
            <div className="anim-slide-right flex flex-col items-center">
              <Avatar c={rival.c} e={rival.e} size={88} />
              <div className="mt-2 font-display text-sm font-black text-white">{rival.n}</div>
              <div className="text-[10px] font-bold text-ink-400">LVL {g.level.lvl + 1}</div>
            </div>
          </div>
        )}
        {phase === "count" && (
          <div className="flex h-[360px] items-center justify-center">
            <span key={count} className="font-display text-8xl font-black text-white drop-shadow-[0_8px_0_#1c55c2]" style={{ animation: "count-in .7s ease forwards" }}>
              {count === 0 ? "GO!" : count}
            </span>
          </div>
        )}
        {(phase === "race" || phase === "result") && (
          <div className="space-y-4">
            <div className="relative">
              <Lane who="You" v={me} c="#22d39a" e="🐂" fl={flash} target={TARGET} />
              {emotes.filter((x) => x.side === "me").map((x) => (
                <span key={x.id} className="pointer-events-none absolute left-10 top-8 text-3xl" style={{ ["--dx" as string]: `${x.dx}px`, animation: "rise-far 1.4s ease-out forwards" }}>
                  {x.e}
                </span>
              ))}
            </div>
            <div className="relative">
              <Lane who={rival.n} v={opp} c={rival.c} e={rival.e} fl={oppFlash} target={TARGET} />
              {emotes.filter((x) => x.side === "opp").map((x) => (
                <span key={x.id} className="pointer-events-none absolute right-12 top-8 text-3xl" style={{ ["--dx" as string]: `${x.dx}px`, animation: "rise-far 1.4s ease-out forwards" }}>
                  {x.e}
                </span>
              ))}
            </div>
            {phase === "race" ? (
              <div className={cn("rounded-2xl bg-ink-950/40 p-4 transition-colors", flash === "bad" && "anim-shake")}>
                <div key={qseed} className="anim-slide-up text-center font-display text-base font-black text-white">
                  {Q.q}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {Q.opts.map((o) => (
                    <button key={`${qseed}-${o}`} onClick={() => answer(o)} className="anim-pop rounded-xl border-2 border-ink-600 bg-ink-800 py-3 font-mono text-xs font-bold text-white shadow-[0_4px_0_#0b1838] transition hover:bg-ink-750 active:translate-y-1 active:shadow-none">
                      {o}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex justify-center gap-2">
                  {["🔥", "😂", "😱", "👏"].map((e) => (
                    <button key={e} onClick={() => { emote(e, "me"); sfx("pop"); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-800 text-lg shadow-[0_3px_0_#0b1838] transition hover:-translate-y-0.5 active:translate-y-0.5">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="anim-pop flex flex-col items-center rounded-2xl bg-ink-950/50 p-4 text-center">
                {won ? <TrophyIcon size={56} /> : <span className="text-5xl">{rival.e}</span>}
                <div className={cn("font-display text-2xl font-black", won ? "text-gradient-gold" : "text-bear")}>{won ? "You won the duel!" : `${rival.n} wins`}</div>
                <div className="mt-3 flex gap-2">
                  <Btn variant="ghost" size="sm" onClick={find}>Rematch</Btn>
                  {won && (
                    <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", 40, e.currentTarget); g.reward("coins", 80, e.currentTarget); }}>
                      {claimed ? "Claimed" : "Claim pot"}
                    </Btn>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-16 · PAPER TRADING CHALLENGE — 60s, +$100 goal, liquidation risk
 * ===================================================================== */
function PaperTrade() {
  const g = useGame();
  const NOTIONAL = 5000;
  const GOAL = 100;
  const MARGIN = 200;
  const [phase, setPhase] = useState<"ready" | "live" | "win" | "fail">("ready");
  const [prices, setPrices] = useState<number[]>(() => {
    let p = 64000;
    return Array.from({ length: 90 }, () => (p = p * (1 + (Math.random() - 0.5) * 0.0012)));
  });
  const mom = useRef(0);
  const [pos, setPos] = useState<null | { side: 1 | -1; entry: number }>(null);
  const [realized, setRealized] = useState(0);
  const [trades, setTrades] = useState<number[]>([]);
  const [time, setTime] = useState(60);
  const [liq, setLiq] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [fire, setFire] = useState(0);
  const pnlRef = useRef<HTMLDivElement>(null);
  const price = prices[prices.length - 1];
  const upnl = pos ? (pos.side * (price - pos.entry) * NOTIONAL) / pos.entry : 0;

  useInterval(() => {
    mom.current = mom.current * 0.86 + (Math.random() - 0.5) * 0.0011;
    setPrices((ps) => [...ps.slice(1), ps[ps.length - 1] * (1 + mom.current + (Math.random() - 0.5) * 0.0007)]);
  }, phase === "win" || phase === "fail" ? null : 250);
  useInterval(() => setTime((t) => Math.max(0, t - 1)), phase === "live" ? 1000 : null);

  useEffect(() => {
    if (phase !== "live") return;
    if (pos && upnl <= -MARGIN) {
      setLiq(true);
      setPos(null);
      setRealized((r) => r - MARGIN);
      setTrades((t) => [...t, -MARGIN]);
      setPhase("fail");
      sfx("lose");
      haptic(120);
    } else if (time <= 0) {
      const total = realized + upnl;
      setPos(null);
      if (total >= GOAL) {
        setRealized(total);
        setPhase("win");
        setFire((f) => f + 1);
        sfx("levelup");
      } else {
        setPhase("fail");
        sfx("lose");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, time]);

  const open = (side: 1 | -1) => {
    if (phase === "ready") setPhase("live");
    setPos({ side, entry: price });
    sfx("select");
  };
  const close = () => {
    if (!pos) return;
    const r = realized + upnl;
    setRealized(r);
    setTrades((t) => [...t, upnl]);
    setPos(null);
    fx.text(pnlRef.current, `${upnl >= 0 ? "+" : ""}$${upnl.toFixed(0)}`, upnl >= 0 ? "#22d39a" : "#ff4d6d");
    sfx(upnl >= 0 ? "coin" : "error");
    if (r >= GOAL) {
      setPhase("win");
      setFire((f) => f + 1);
      sfx("levelup");
    }
  };
  const reset = () => {
    setPhase("ready");
    setPos(null);
    setRealized(0);
    setTrades([]);
    setTime(60);
    setLiq(false);
    setClaimed(false);
  };
  const W = 420;
  const H = 180;
  const min = Math.min(...prices, pos?.entry ?? Infinity);
  const max = Math.max(...prices, pos?.entry ?? -Infinity);
  const y = (v: number) => 10 + ((max - v) / (max - min || 1)) * (H - 20);
  const path = prices.map((v, i) => `${i ? "L" : "M"}${(i / (prices.length - 1)) * (W - 50)},${y(v)}`).join("");
  const up = prices[prices.length - 1] >= prices[prices.length - 2];
  return (
    <Asset title="Paper Trading Challenge" code="G-16" tags="paper trading simulator live price long short close pnl liquidation challenge timer" span={6} badge="Live">
      <Confetti fire={fire} count={40} />
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">BTC-PERP · 25× · $200 margin</div>
          <div className={cn("font-mono text-2xl font-bold transition-colors", up ? "text-bull" : "text-bear")}>${price.toLocaleString(undefined, { maximumFractionDigits: 1 })}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Time</div>
          <div className={cn("font-display text-xl font-black", time <= 10 && phase === "live" ? "anim-glow text-bear" : "text-white")}>0:{String(time).padStart(2, "0")}</div>
        </div>
      </div>
      <div className={cn("panel-inset relative mt-3 overflow-hidden rounded-2xl", liq && "anim-glitch")}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          <defs>
            <linearGradient id="ptArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={up ? "#22d39a" : "#ff4d6d"} stopOpacity=".3" />
              <stop offset="1" stopColor={up ? "#22d39a" : "#ff4d6d"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${path}L${W - 50},${H}L0,${H}Z`} fill="url(#ptArea)" />
          <path d={path} fill="none" stroke={up ? "#22d39a" : "#ff4d6d"} strokeWidth="2.2" strokeLinejoin="round" />
          {pos && (
            <>
              <line x1="0" x2={W} y1={y(pos.entry)} y2={y(pos.entry)} stroke="#e3eaf8" strokeDasharray="5 4" strokeOpacity=".7" />
              <rect x={W - 50} y={y(pos.entry) - 10} width="48" height="20" rx="6" fill="#e3eaf8" />
              <text x={W - 26} y={y(pos.entry) + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#0d1a3d">
                {pos.side === 1 ? "LONG" : "SHORT"}
              </text>
            </>
          )}
          <circle cx={W - 50} cy={y(price)} r="4.5" fill="#fff" className="anim-glow" />
        </svg>
        {(phase === "win" || phase === "fail") && (
          <div className="anim-pop absolute inset-0 flex flex-col items-center justify-center bg-ink-950/75 text-center backdrop-blur-sm">
            <div className={cn("font-display text-3xl font-black", phase === "win" ? "text-bull" : "text-bear")}>{phase === "win" ? "CHALLENGE WON" : liq ? "LIQUIDATED" : "TIME'S UP"}</div>
            <div className="mt-1 font-mono text-sm font-bold text-white">
              Realized {realized >= 0 ? "+" : ""}${realized.toFixed(0)}
            </div>
            <div className="mt-3 flex gap-2">
              <Btn variant="ghost" size="sm" onClick={reset}>Retry</Btn>
              {phase === "win" && (
                <Btn variant="gold" size="sm" disabled={claimed} onClick={(e) => { setClaimed(true); g.reward("xp", 50, e.currentTarget); g.reward("coins", 200, e.currentTarget); }}>
                  {claimed ? "Claimed" : "Claim reward"}
                </Btn>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div ref={pnlRef} className={cn("panel-inset rounded-2xl p-3 transition-colors", upnl > 0 ? "ring-1 ring-bull/40" : upnl < 0 ? "ring-1 ring-bear/40" : "")}>
          <div className="text-[9px] font-black uppercase tracking-widest text-ink-500">Unrealized PnL</div>
          <div className={cn("font-mono text-xl font-bold", upnl > 0 ? "text-bull" : upnl < 0 ? "text-bear" : "text-ink-300")}>
            {upnl >= 0 ? "+" : ""}${upnl.toFixed(2)}
          </div>
          {pos && <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full bg-bear transition-all" style={{ width: `${clamp(-upnl / MARGIN, 0, 1) * 100}%` }} /></div>}
        </div>
        <div className="panel-inset rounded-2xl p-3">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-ink-500">
            <span>Goal +${GOAL}</span>
            <span className={realized >= 0 ? "text-bull" : "text-bear"}>${realized.toFixed(0)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-950">
            <div className="h-full rounded-full bg-gradient-to-r from-bull to-cyan transition-all duration-500" style={{ width: `${clamp(realized / GOAL, 0, 1) * 100}%` }} />
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {trades.slice(-5).map((t, i) => (
              <span key={i} className={cn("anim-pop rounded px-1 font-mono text-[9px] font-bold", t >= 0 ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>
                {t >= 0 ? "+" : ""}
                {t.toFixed(0)}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {pos ? (
          <Btn variant={upnl >= 0 ? "gold" : "ghost"} className="col-span-2" onClick={close} sound={false} disabled={phase !== "live"}>
            <Icon name="x" size={16} stroke={3} /> Close {pos.side === 1 ? "long" : "short"} · {upnl >= 0 ? "+" : ""}${upnl.toFixed(0)}
          </Btn>
        ) : (
          <>
            <Btn variant="bull" onClick={() => open(1)} disabled={phase === "win" || phase === "fail"} sound={false}>
              <Icon name="trendUp" size={18} stroke={3} /> Long
            </Btn>
            <Btn variant="bear" onClick={() => open(-1)} disabled={phase === "win" || phase === "fail"} sound={false}>
              <Icon name="trendDown" size={18} stroke={3} /> Short
            </Btn>
          </>
        )}
      </div>
    </Asset>
  );
}

export default function Arcade() {
  return (
    <>
      <CandleCatcher />
      <BossBattle />
      <PvPDuel />
      <PaperTrade />
    </>
  );
}
