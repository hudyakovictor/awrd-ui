import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { Device, StatusBar, GameHUD } from "../game/Device";
import { Mascot, type Mood } from "../game/Mascot";
import { ART, type ArtKey, GemArt, BoltArt, CoinArt } from "../game/art";
import { sfx, Confetti } from "../game/Juice";

/* ================================================================== */
/*  TRADER PULSE — heartbeat-like radial chart                          */
/* ================================================================== */
function TraderPulse() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth;
    const H = 180;
    c.width = W * dpr;
    c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const points: number[] = [];
    for (let i = 0; i < 120; i++) {
      points.push(50 + Math.sin(i / 6) * 18 + Math.sin(i / 23) * 6 + (Math.random() - 0.5) * 4);
    }
    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0a1226";
      ctx.fillRect(0, 0, W, H);
      for (let i = 1; i < 5; i++) {
        ctx.strokeStyle = "rgba(120,160,240,.08)";
        ctx.beginPath();
        ctx.moveTo(0, (H / 5) * i);
        ctx.lineTo(W, (H / 5) * i);
        ctx.stroke();
      }
      points.shift();
      const lastV = points[points.length - 1];
      points.push(lastV + (Math.random() - 0.5) * 2 + Math.sin(now / 1100) * 0.7);

      const min = Math.min(...points);
      const max = Math.max(...points);
      const range = max - min || 1;

      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "rgba(43,224,138,.45)");
      grd.addColorStop(1, "rgba(43,224,138,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(0, H);
      points.forEach((v, i) => {
        const x = (i / (points.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 12) - 6;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#2be08a";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#2be08a";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      points.forEach((v, i) => {
        const x = (i / (points.length - 1)) * W;
        const y = H - ((v - min) / range) * (H - 12) - 6;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      const head = points[points.length - 1];
      const lastY = H - ((head - min) / range) * (H - 12) - 6;
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "#2be08a";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(W - 4, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      const sx = (Math.sin(now / 1300) * 0.5 + 0.5) * W;
      const grd2 = ctx.createLinearGradient(sx - 30, 0, sx + 30, 0);
      grd2.addColorStop(0, "rgba(56,225,255,0)");
      grd2.addColorStop(0.5, "rgba(56,225,255,.35)");
      grd2.addColorStop(1, "rgba(56,225,255,0)");
      ctx.fillStyle = grd2;
      ctx.fillRect(sx - 30, 0, 60, H);

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }, []);
  return <canvas ref={ref} className="block h-[180px] w-full rounded-2xl border-2 border-[#1c2c52]" style={{ background: "#0a1226", boxShadow: "inset 0 3px 8px rgba(0,0,0,.7)" }} />;
}

/* ================================================================== */
/*  LIVE DONUT                                                         */
/* ================================================================== */
const SLICES: { n: string; v: number; c: string; art: ArtKey }[] = [
  { n: "BTC", v: 38, c: "#ffc24b", art: "coin" },
  { n: "ETH", v: 24, c: "#9b6bff", art: "gem" },
  { n: "SOL", v: 14, c: "#38e1ff", art: "bolt" },
  { n: "Stables", v: 16, c: "#2be08a", art: "coin" },
  { n: "Alt", v: 8, c: "#ff4d6a", art: "bolt" },
];

function LiveDonut() {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((x) => x + 1), 1200);
    return () => clearInterval(id);
  }, []);
  const total = SLICES.reduce((s, x) => s + x.v, 0);
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 200 200" width="180" height="180">
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(120,160,240,.08)" strokeWidth="22" />
        {SLICES.map((s, i) => {
          const r = (s.v / total) * C;
          const dasharray = `${r - 2} ${C - r + 2}`;
          const offset = acc;
          acc += r;
          return (
            <motion.circle
              key={s.n}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={s.c}
              strokeWidth="22"
              strokeDasharray={dasharray}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.4 }}
              style={{ filter: `drop-shadow(0 0 6px ${s.c})` }}
            />
          );
        })}
        <motion.circle cx="100" cy="100" r="36" fill="#0a1226" stroke="rgba(160,200,255,.16)" strokeWidth="1" />
        <motion.text
          x="100"
          y="92"
          textAnchor="middle"
          fontSize="10"
          fontWeight="800"
          fill="#a3b1d2"
          fontFamily="JetBrains Mono, monospace"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          PORTFOLIO
        </motion.text>
        <motion.text
          key={pulse}
          x="100"
          y="118"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="#fff"
          fontFamily="JetBrains Mono, monospace"
        >
          ${(24800 + pulse * 7).toLocaleString("en-US")}
        </motion.text>
      </svg>
      <div className="space-y-2">
        {SLICES.map((s) => {
          const A = ART[s.art];
          return (
            <div key={s.n} className="flex items-center gap-2">
              <A size={22} />
              <span className="w-[50px] font-mono text-[10px] font-black uppercase tracking-wider text-ink-300">{s.n}</span>
              <span className="tnum font-mono text-[12px] font-black text-white">{s.v}%</span>
              <span className="ml-1 h-2 w-12 overflow-hidden rounded-full bg-[#0a1122]">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${s.v * 2.5}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-full"
                  style={{ background: s.c, boxShadow: `0 0 6px ${s.c}` }}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SKILL RADAR                                                       */
/* ================================================================== */
function SkillRadar({ t = 1 }: { t?: number }) {
  const stats: [string, number][] = [
    ["Risk", 0.84],
    ["TA", 0.62],
    ["Macro", 0.74],
    ["Speed", 0.55],
    ["Psych", 0.9],
    ["Dex", 0.66],
  ];
  const r = 70;
  const cx = 90;
  const cy = 90;
  const points = stats.map(([, v], i) => {
    const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
    return `${cx + Math.cos(a) * r * v},${cy + Math.sin(a) * r * v}`;
  });
  return (
    <svg viewBox="0 0 180 180" className="w-full">
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon
          key={s}
          points={stats
            .map((_, i) => {
              const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
              return `${cx + Math.cos(a) * r * s},${cy + Math.sin(a) * r * s}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(120,160,240,.12)"
        />
      ))}
      {stats.map(([l], i) => {
        const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <text
            key={l}
            x={cx + Math.cos(a) * (r + 12)}
            y={cy + Math.sin(a) * (r + 12) + 4}
            textAnchor="middle"
            fontSize="8"
            fontWeight="900"
            fill="#a3b1d2"
            fontFamily="JetBrains Mono, monospace"
          >
            {l}
          </text>
        );
      })}
      <motion.polygon
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: t * 0.2 }}
        points={points.join(" ")}
        fill="rgba(56,225,255,.3)"
        stroke="#38e1ff"
        strokeWidth="2"
        style={{ filter: "drop-shadow(0 0 6px #38e1ff)" }}
      />
      {stats.map(([, v], i) => {
        const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: t * 0.2 + i * 0.1 }}
            cx={cx + Math.cos(a) * r * v}
            cy={cy + Math.sin(a) * r * v}
            r="3"
            fill="#fff"
            stroke="#38e1ff"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

/* ================================================================== */
/*  COIN SHOWER                                                       */
/* ================================================================== */
function CoinShower() {
  const [coins, setCoins] = useState<
    { id: number; x: number; rot: number; t: number; val: string; col: string; delay: number }[]
  >([]);
  const [tick, setTick] = useState(0);
  const colors = ["#2be08a", "#ffc24b", "#38e1ff"];
  const vals = ["+5", "+25", "+50", "+100", "+250"];
  useEffect(() => {
    setCoins((c) => [
      ...c.slice(-30),
      ...Array.from({ length: 2 }, () => ({
        id: Date.now() + Math.random(),
        x: Math.random() * 90 + 5,
        rot: Math.random() * 360,
        t: 1800 + Math.random() * 2200,
        val: vals[Math.floor(Math.random() * vals.length)],
        col: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1,
      })),
    ]);
  }, [tick]);
  useEffect(() => {
    const id = setInterval(() => setTick((c) => c + 1), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative h-[180px] overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[radial-gradient(circle_at_50%_0%,#16234a,#040712_80%)]">
      {coins.map((c) => (
        <motion.span
          key={c.id}
          initial={{ y: -40, x: `${c.x}%`, rotate: 0, opacity: 0 }}
          animate={{ y: 200, rotate: c.rot, opacity: [0, 1, 1, 0] }}
          transition={{ duration: c.t / 1000, ease: "easeIn", delay: c.delay, repeat: Infinity, repeatDelay: 1 }}
          className="absolute flex flex-col items-center"
        >
          <CoinArt size={26} />
          <span className="mt-1 rounded-md px-1 font-mono text-[9px] font-black" style={{ background: c.col, color: "#06101b" }}>
            {c.val}
          </span>
        </motion.span>
      ))}
      <GemArt size={40} className="absolute bottom-3 left-3 opacity-30" />
      <GemArt size={28} className="absolute right-3 top-3 opacity-40" />
      <GemArt size={32} className="absolute bottom-3 right-4 opacity-30" />
      <BoltArt size={30} className="absolute right-6 bottom-6 opacity-40" />
    </div>
  );
}

/* ================================================================== */
/*  PEAK CHART — large canvas candlestick                              */
/* ================================================================== */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function PeakChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = 600;
    const H = 220;
    c.width = W * dpr;
    c.height = H * dpr;
    c.style.width = "100%";
    c.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let last = 100;
    const bars: { o: number; c: number; h: number; l: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const drift = (Math.random() - 0.45) * 4;
      const cv = last + drift;
      const w = 3 + Math.random() * 6;
      bars.push({ o: last, c: cv, h: Math.max(last, cv) + w, l: Math.min(last, cv) - w });
      last = cv;
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, "#0e1a36");
      grd.addColorStop(1, "#050914");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(120,160,240,.08)";
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (H / 4) * i);
        ctx.lineTo(W, (H / 4) * i);
        ctx.stroke();
      }

      bars.shift();
      const drift = (Math.random() - 0.48) * 4;
      const cv = last + drift;
      const w = 3 + Math.random() * 6;
      bars.push({ o: last, c: cv, h: Math.max(last, cv) + w, l: Math.min(last, cv) - w });
      last = cv;

      const lo = Math.min(...bars.map((b) => b.l)) - 4;
      const hi = Math.max(...bars.map((b) => b.h)) + 4;
      const y = (v: number) => H - ((v - lo) / (hi - lo)) * (H - 12) - 6;

      const bw = W / bars.length;
      bars.forEach((b, i) => {
        const cx = i * bw + bw / 2;
        const up = b.c >= b.o;
        const color = up ? "#2be08a" : "#ff4d6a";
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, y(b.h));
        ctx.lineTo(cx, y(b.l));
        ctx.stroke();
        const yo = Math.min(y(b.o), y(b.c));
        const yc = Math.max(y(b.o), y(b.c));
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = i === bars.length - 1 ? 14 : 0;
        ctx.fillRect(cx - bw * 0.32, yo, bw * 0.64, Math.max(2, yc - yo));
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,.4)";
        ctx.fillRect(cx - bw * 0.32 + 2, yo + 2, bw * 0.16, Math.max(0, yc - yo - 4));
      });

      const lastV = bars[bars.length - 1].c;
      const lastY = y(lastV);
      ctx.strokeStyle = "#38e1ff";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, lastY);
      ctx.lineTo(W, lastY);
      ctx.stroke();
      ctx.setLineDash([]);
      const ribbonGrd = ctx.createLinearGradient(0, lastY - 20, 0, lastY + 20);
      ribbonGrd.addColorStop(0, "rgba(56,225,255,0)");
      ribbonGrd.addColorStop(0.5, "rgba(56,225,255,.18)");
      ribbonGrd.addColorStop(1, "rgba(56,225,255,0)");
      ctx.fillStyle = ribbonGrd;
      ctx.fillRect(0, lastY - 20, W, 40);

      ctx.fillStyle = "#0a1226";
      roundRect(ctx, W - 110, lastY - 14, 102, 28, 14);
      ctx.fill();
      ctx.fillStyle = "#38e1ff";
      ctx.font = '900 14px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lastV.toFixed(2), W - 59, lastY);

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }, []);
  return <canvas ref={ref} className="block rounded-2xl border-2 border-[#1c2c52]" style={{ background: "#0a1226", boxShadow: "inset 0 4px 10px rgba(0,0,0,.7)" }} />;
}

/* ================================================================== */
/*  STORYBOARD                                                        */
/* ================================================================== */
const PANELS: { me: string; mood: Mood; side: "left" | "right"; color: string }[] = [
  { me: "Bears rampage\nafter the halving", mood: "sad", side: "left", color: "#ff4d6a" },
  { me: "Stay calm — your\nplan is your shield", mood: "think", side: "right", color: "#38e1ff" },
  { me: "Step by step,\nyou turned the tables", mood: "happy", side: "left", color: "#2be08a" },
  { me: "Diamond hands\nfor the win!", mood: "celebrate", side: "right", color: "#ffc24b" },
];

function Storyboard() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % PANELS.length), 4200);
    return () => clearInterval(id);
  }, []);
  const cur = PANELS[step];
  const other = PANELS[(step + 1) % PANELS.length];
  const third = PANELS[(step + 2) % PANELS.length];
  const render = (p: typeof cur, t: number, label: string) => (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: step === t ? 1 : 0.94, opacity: step === t ? 1 : 0.7 }}
      className="relative rounded-2xl border-2 p-2"
      style={{ borderColor: "#1c2c52", background: `linear-gradient(180deg, color-mix(in srgb, ${p.color} 14%, #0d1528), #0d1528)` }}
    >
      <span className="absolute right-1 top-1 font-mono text-[8px] font-black uppercase" style={{ color: p.color }}>
        {label}
      </span>
      <div className="grid place-items-center">
        <Mascot mood={p.mood} size={92} species={p.color === "#ff4d6a" ? "bear" : "bull"} track={false} />
      </div>
      <p className="whitespace-pre-line text-center text-[10px] font-bold text-ink-200">{p.me}</p>
    </motion.div>
  );
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {render(cur, 0, "01")}
        {render(other, 1, "02")}
        {render(third, 2, "03")}
      </div>
      <div className="text-center font-mono text-[9px] uppercase tracking-widest text-ink-500">
        auto-advancing every 4.2s · tap to advance
      </div>
    </div>
  );
}

/* ================================================================== */
/*  INVENTORY                                                         */
/* ================================================================== */
const INV: { art: ArtKey; n: string; v: number }[] = [
  { art: "gem", n: "Gem", v: 124 },
  { art: "trophy", n: "Trophy", v: 12 },
  { art: "key", n: "Key", v: 3 },
  { art: "potion", n: "Potion", v: 5 },
  { art: "ticket", n: "Ticket", v: 2 },
  { art: "rocket", n: "Boost", v: 1 },
];

function Inventory() {
  const [fired, setFired] = useState(0);
  return (
    <div className="grid grid-cols-3 gap-2">
      <Confetti fire={fired} origin={{ x: 0.5, y: 0.5 }} count={40} />
      {INV.map((it, i) => {
        const A = ART[it.art];
        return (
          <motion.button
            type="button"
            key={i}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setFired(Date.now());
              sfx("coin");
            }}
            className="relative aspect-square overflow-hidden rounded-2xl border-2 p-2 text-center"
            style={{ borderColor: "#22355e", background: "linear-gradient(165deg,#1b2b55,#0a1226)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.1), 0 4px 0 #070d1c" }}
          >
            <A size={62} className="mx-auto" />
            <div className="mt-1 text-[11px] font-extrabold text-white">{it.n}</div>
            <div className="font-mono text-[9px] text-ink-500">× {it.v}</div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  QUEST TIMER — circular progress                                    */
/* ================================================================== */
function QuestTimer() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => (x + 1) % 100), 50);
    return () => clearInterval(id);
  }, []);
  const R = 64;
  const C = 2 * Math.PI * R;
  const col = t > 60 ? "#ff4d6a" : t > 30 ? "#ffc24b" : "#2be08a";
  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 160 160" className="w-[150px]">
        <defs>
          <radialGradient id="qt-glow">
            <stop offset="0" stopColor={col} stopOpacity=".5" />
            <stop offset="1" stopColor={col} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="80" cy="80" r={R + 12} fill="url(#qt-glow)" />
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(120,160,240,.12)" strokeWidth="14" />
        <motion.circle
          cx="80"
          cy="80"
          r={R}
          fill="none"
          stroke={col}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          animate={{ strokeDashoffset: -(C * t) / 100 }}
          style={{ filter: `drop-shadow(0 0 6px ${col})` }}
          transform="rotate(-90 80 80)"
        />
        <text x="80" y="78" textAnchor="middle" fontSize="11" fontWeight="900" fill="#a3b1d2" fontFamily="JetBrains Mono, monospace">
          QUEST
        </text>
        <motion.text
          x="80"
          y="105"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="#fff"
          fontFamily="JetBrains Mono, monospace"
          key={t}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          {Math.floor(t * 1.2)}%
        </motion.text>
      </svg>
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-400">tomorrow 7am</span>
    </div>
  );
}

/* ================================================================== */
/*  QUEST LIST                                                        */
/* ================================================================== */
function QuestList() {
  const QUESTS = [
    { t: "Daily warm-up", xp: 60, done: true },
    { t: "Predict 5 candles", xp: 40, done: false },
    { t: "Win 1 duel", xp: 75, done: false },
    { t: "Open 2 chests", xp: 30, done: false },
  ];
  return (
    <div className="space-y-2">
      {QUESTS.map((q) => (
        <div key={q.t} className="flex items-center gap-2.5 rounded-2xl border-2 p-2" style={{ borderColor: "#1c2c52", background: "#0d1528", boxShadow: "0 3px 0 #070d1c" }}>
          <span
            className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-black"
            style={{ background: q.done ? "#2be08a" : "#15223f", color: q.done ? "#02150b" : "#5f6f96" }}
          >
            {q.done ? <Icon name="check" size={14} strokeWidth={4} /> : "·"}
          </span>
          <div className="flex-1 text-[12px] font-bold text-ink-200">{q.t}</div>
          <span className="font-mono text-[10px] font-black text-gold">+{q.xp}</span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  TRADING DESK MOCK                                                 */
/* ================================================================== */
function TradingDesk() {
  return (
    <Device w={360} h={640}>
      <div className="relative flex h-full flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,#1b2b55,#0a1226_60%)]" />
        <StatusBar />
        <GameHUD streak={42} gems={1280} coins={8640} />
        <div className="space-y-3 px-4">
          <Tag tone="accent">portfolio · 24,802 USD</Tag>
          <TraderPulse />
          <CoinShower />
        </div>
      </div>
    </Device>
  );
}

/* ================================================================== */
/*  GLOSSARY                                                          */
/* ================================================================== */
const TERMS: { t: string; d: string; i: IconName; c: string }[] = [
  { t: "Stop-loss", d: "Auto-close on loss", i: "shield", c: "#38e1ff" },
  { t: "Leverage", d: "Borrowed exposure", i: "bolt", c: "#ffc24b" },
  { t: "Limit order", d: "Buy/sell at target", i: "target", c: "#9b6bff" },
  { t: "Liquidity", d: "Ease of execution", i: "gem", c: "#2be08a" },
  { t: "Whale", d: "Big-market mover", i: "star", c: "#9b6bff" },
  { t: "Drawdown", d: "Peak-to-trough loss", i: "trendDown", c: "#ff4d6a" },
];

function Glossary() {
  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {TERMS.map((x, i) => (
        <motion.div
          key={x.t}
          whileHover={{ y: -4, scale: 1.02 }}
          className="relative overflow-hidden rounded-2xl border-2 p-2.5"
          style={{ borderColor: "#22355e", background: "linear-gradient(165deg,#1b2b55,#0a1226)", boxShadow: "0 4px 0 #070d1c" }}
        >
          <div
            className="mb-1 grid h-8 w-8 place-items-center rounded-xl"
            style={{ background: `linear-gradient(180deg, ${x.c}, color-mix(in srgb, ${x.c} 50%, #000))`, boxShadow: `0 3px 0 color-mix(in srgb, ${x.c} 40%, #000)` }}
          >
            <Icon name={x.i} size={16} className="text-[#0a1226]" />
          </div>
          <div className="text-[12px] font-extrabold text-white">{x.t}</div>
          <div className="text-[10px] leading-tight text-ink-400">{x.d}</div>
          <span className="absolute right-1 top-1 font-mono text-[8px] font-black opacity-50" style={{ color: x.c }}>
            {String(i + 1).padStart(2, "0")}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default function RichSurfaces() {
  return (
    <Section id="rich" index="" title="Surfaces" kicker="Canvas-heavy compositions" count="9 surfaces">
      <Grid>
        <Cell title="Live Trader Pulse + Peak Chart" spec="60fps canvas · 600×220" span="col-span-2 md:col-span-4 lg:col-span-4">
          <div className="space-y-3">
            <TraderPulse />
            <PeakChart />
          </div>
        </Cell>
        <Cell title="Live Donut" spec="pulsing arcs · 5 assets" span="col-span-2 md:col-span-4 lg:col-span-2">
          <LiveDonut />
        </Cell>
        <Cell title="Skill Radar" spec="6 axes · spring" span="col-span-2 md:col-span-4 lg:col-span-2">
          <div className="grid grid-cols-3 gap-2">
            <SkillRadar t={0.5} />
            <SkillRadar t={1} />
            <SkillRadar t={1.5} />
          </div>
        </Cell>
        <Cell title="Trade Pad Mock" spec="full device shell" span="col-span-2 md:col-span-4 lg:col-span-3">
          <TradingDesk />
        </Cell>
        <Cell title="Storyboard" spec="auto-advance 4.2s" span="col-span-2 md:col-span-4 lg:col-span-3">
          <Storyboard />
        </Cell>
        <Cell title="Inventory Grid" spec="tap to sparkle" span="col-span-2 md:col-span-4 lg:col-span-3">
          <Inventory />
        </Cell>
        <Cell title="Daily Quest Progress" spec="heartbeat timer" span="col-span-2 md:col-span-4 lg:col-span-3">
          <div className="grid grid-cols-3 gap-4">
            <QuestTimer />
            <div className="col-span-2">
              <QuestList />
            </div>
          </div>
        </Cell>
        <Cell title="Glossary" spec="revolving cards" span="col-span-2 md:col-span-4 lg:col-span-3">
          <Glossary />
        </Cell>
        <Cell title="Coin Shower" spec="RNG · 700ms cadence" span="col-span-2 md:col-span-4 lg:col-span-3">
          <CoinShower />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="accent">TraderPulse canvas</Tag>
        <Tag>PeakChart canvas</Tag>
        <Tag tone="violet">Donut</Tag>
        <Tag tone="gold">Coin Shower</Tag>
        <Tag tone="aqua">Storyboard</Tag>
        <Tag>Inventory</Tag>
        <Tag tone="gold">Quest list</Tag>
      </div>
    </Section>
  );
}
