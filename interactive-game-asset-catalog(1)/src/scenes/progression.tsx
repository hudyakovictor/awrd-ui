import { animate, AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import { I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, sleep } from "../motion/tokens";
import { SceneBg, useScript, type SceneProps } from "./common";
import { sfx } from "../motion/sfx";

/* ================================================================
   14 · SKILL TREE UNLOCK — энергия бежит по ветке, узел рождается
   ================================================================ */
type NS = "done" | "avail" | "locked";
const NODES = [
  { x: 150, y: 110, p: -1, icon: I.brain, l: "Основы", c: "#2ee6c5" },
  { x: 72, y: 220, p: 0, icon: I.trend, l: "Тренд", c: "#3ddc84" },
  { x: 228, y: 220, p: 0, icon: I.shield, l: "Риск", c: "#4cc3ff" },
  { x: 72, y: 340, p: 1, icon: I.bars, l: "Объём", c: "#ffc34d" },
  { x: 228, y: 340, p: 2, icon: I.warn, l: "Угрозы", c: "#ff4d5e" },
  { x: 150, y: 460, p: 4, icon: I.target, l: "Мастер", c: "#9b7bff" },
];
const INIT: NS[] = ["done", "done", "avail", "avail", "locked", "locked"];
const edge = (i: number) => {
  const a = NODES[NODES[i].p], b = NODES[i];
  const my = (a.y + b.y) / 2;
  return `M${a.x} ${a.y} C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
};

export function SkillTree({ run, cue }: SceneProps) {
  const [st, setSt] = useState<NS[]>(INIT);
  const [flow, setFlow] = useState<number | null>(null);
  const [charging, setCharging] = useState<number | null>(null);
  const cam = useMotionValue(0);
  const p = useParticles();
  const busy = useRef(false);
  const stRef = useRef(st);
  stRef.current = st;

  const unlock = async (i: number) => {
    if (busy.current || stRef.current[i] !== "avail") return;
    busy.current = true;
    cue();
    const n = NODES[i];
    animate(cam, Math.min(0, 300 - n.y - 60), { duration: 0.8, ease: EASE.camera }); // камера следует
    setFlow(i);
    sfx.whoosh(0.6);
    await sleep(650);
    setCharging(i);
    sfx.suck();
    await sleep(520);
    setCharging(null);
    setFlow(null);
    const y = n.y + cam.get();
    sfx.chime();
    p.ring(n.x, y, "#fff", 90, 0.5, 8);
    p.ring(n.x, y, n.c, 70, 0.8, 4);
    p.burst({ x: n.x, y, count: 36, colors: [n.c, "#fff"], speed: [150, 420] });
    setSt((s) => s.map((v, k) => (k === i ? "done" : NODES[k].p === i && v === "locked" ? "avail" : v)));
    busy.current = false;
  };
  useScript(run, async (wait) => {
    setSt(INIT);
    cam.set(0);
    busy.current = false;
    await wait(700);
    await unlock(2);
    await wait(900);
    await unlock(4);
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#4cc3ff" />
      <div className="absolute inset-x-0 top-11 z-10 text-center font-display text-base font-bold">Карта навыков</div>
      <motion.div className="absolute inset-0" style={{ y: cam }}>
        <svg viewBox="0 0 300 624" className="absolute inset-0 h-[624px] w-[300px]">
          {NODES.map((_, i) => i > 0 && (
            <g key={i}>
              <path d={edge(i)} fill="none" stroke="#ffffff14" strokeWidth="6" strokeLinecap="round" />
              {st[i] === "done" && <path d={edge(i)} fill="none" stroke={NODES[i].c} strokeWidth="3" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${NODES[i].c})` }} />}
              {st[i] === "avail" && <path d={edge(i)} className="flow-dash" fill="none" stroke={NODES[i].c} strokeOpacity=".7" strokeWidth="2.5" strokeDasharray="4 16" strokeLinecap="round" />}
              {flow === i && (
                <motion.path d={edge(i)} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: EASE.camera }} style={{ filter: `drop-shadow(0 0 6px ${NODES[i].c}) drop-shadow(0 0 12px ${NODES[i].c})` }} />
              )}
            </g>
          ))}
        </svg>
        {/* CSS motion-path comet */}
        {flow !== null && (
          <motion.div
            className="absolute left-0 top-0 h-4 w-4 rounded-full bg-white"
            style={{ offsetPath: `path('${edge(flow)}')`, boxShadow: `0 0 14px 6px ${NODES[flow].c}`, offsetRotate: "0deg" } as React.CSSProperties}
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 0.6, ease: EASE.camera }}
          />
        )}
        {NODES.map((n, i) => {
          const s = st[i];
          return (
            <motion.button
              key={i}
              onClick={() => unlock(i)}
              whileTap={s === "avail" ? { scale: 0.9 } : undefined}
              className="absolute -ml-8 -mt-8 h-16 w-16"
              style={{ left: n.x, top: n.y, perspective: 400 }}
            >
              {s === "avail" && <span className="pulse-ring absolute inset-0 rounded-2xl border-2" style={{ borderColor: n.c }} />}
              <motion.div
                className="absolute inset-0 grid place-items-center rounded-2xl border-2"
                initial={false}
                animate={{
                  rotateY: s === "done" ? 0 : 180,
                  scale: charging === i ? [1, 0.85, 1.12] : 1,
                  borderColor: s === "locked" ? "#ffffff22" : n.c,
                  background: s === "done" ? `linear-gradient(160deg, ${n.c}55, #0c1428)` : "linear-gradient(160deg,#1a2440,#0c1428)",
                  boxShadow: s === "done" ? `0 0 26px ${n.c}88` : "0 0 0 #0000",
                }}
                transition={charging === i ? { duration: 0.5, ease: EASE.anticipate } : { type: "spring", stiffness: 260, damping: 18 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <span style={{ backfaceVisibility: "hidden", color: n.c }} className="absolute inset-0 grid place-items-center">
                  <n.icon size={26} />
                </span>
                <span style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className={`absolute inset-0 grid place-items-center ${s === "avail" ? "text-white/80" : "text-white/25"}`}>
                  {s === "avail" ? <n.icon size={24} /> : <I.lock size={20} />}
                </span>
              </motion.div>
              {charging === i && (
                <svg className="absolute -inset-2 h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                  <motion.circle cx="40" cy="40" r="36" fill="none" stroke={n.c} strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} style={{ filter: `drop-shadow(0 0 6px ${n.c})` }} />
                </svg>
              )}
              <div className={`absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold ${s === "locked" ? "text-white/30" : "text-white/80"}`}>{n.l}</div>
            </motion.button>
          );
        })}
      </motion.div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   15 · LEADERBOARD FLIP — игрок пробивается вверх
   ================================================================ */
const PLAYERS = [
  { n: "SignalRider", s: 2840 },
  { n: "TradeFox", s: 2710 },
  { n: "RiskLess", s: 2420 },
  { n: "CandleMage", s: 2290 },
  { n: "WhaleHunt", s: 2150 },
  { n: "Ты", s: 1980, me: true },
];
export function Leaderboard({ run, cue }: SceneProps) {
  const [rows, setRows] = useState(PLAYERS);
  const [climb, setClimb] = useState(false);
  useScript(run, async (wait) => {
    setRows(PLAYERS);
    setClimb(false);
    await wait(1100);
    cue();
    setClimb(true);
    // очки растут — позиция пересчитывается пошагово (каждый обгон = событие)
    for (const s of [2200, 2300, 2450, 2760]) {
      await wait(380);
      sfx.pop(s / 200);
      setRows((r) => [...r.map((x) => (x.me ? { ...x, s } : x))].sort((a, b) => b.s - a.s));
    }
    await wait(500);
    setClimb(false);
  });
  const podium = [
    { h: 70, n: 2, c: "#cfd8ea" },
    { h: 100, n: 1, c: "#ffc34d" },
    { h: 52, n: 3, c: "#d08a4a" },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ffc34d" />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-base font-bold">Турнир недели</div>
        <div className="glass rounded-full px-2 py-1 font-mono text-[10px] text-white/60">2д 14ч</div>
      </div>
      <div className="absolute inset-x-8 top-[82px] flex h-[120px] items-end justify-center gap-2">
        {podium.map((pd, i) => (
          <div key={i} className="flex flex-1 flex-col items-center">
            <motion.div key={`t${run}`} initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1, ...SPRING.reward }} style={{ color: pd.c }}>
              <I.trophy size={pd.n === 1 ? 30 : 22} />
            </motion.div>
            <motion.div
              key={run}
              initial={{ height: 0 }}
              animate={{ height: pd.h }}
              transition={{ delay: [0.15, 0, 0.3][i], type: "spring", stiffness: 140, damping: 14 }}
              className="mt-1 grid w-full place-items-center rounded-t-xl font-display text-2xl font-black"
              style={{ background: `linear-gradient(180deg, ${pd.c}66, ${pd.c}11)`, borderTop: `3px solid ${pd.c}`, color: pd.c }}
            >
              {pd.n}
            </motion.div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 top-[214px] space-y-1.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.n}
            layout
            transition={SPRING.layout}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.me ? "z-10 border border-gold/60 bg-gradient-to-r from-gold/25 to-gold/5" : "glass"}`}
            animate={r.me && climb ? { scale: 1.05, boxShadow: "0 0 30px #ffc34d88" } : { scale: 1, boxShadow: "0 0 0 #0000" }}
          >
            <div className="relative h-5 w-5 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div key={i} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} className={`absolute inset-0 text-center font-display text-sm font-black ${i < 3 ? "text-gold" : "text-white/40"}`}>
                  {i + 1}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="h-7 w-7 overflow-hidden rounded-full border border-white/20 bg-panel">
              {r.me ? <img src={hood} className="h-full w-full object-cover" /> : <div className="h-full w-full" style={{ background: `hsl(${r.n.length * 40} 50% 40%)` }} />}
            </div>
            <div className={`flex-1 text-xs font-bold ${r.me ? "text-gold" : ""}`}>{r.n}</div>
            <motion.div key={r.s} initial={r.me ? { scale: 1.5, color: "#ffffff" } : false} animate={{ scale: 1, color: r.me ? "#ffc34d" : "#ffffffaa" }} transition={SPRING.reward} className="font-mono text-xs font-bold tabular-nums">
              {r.s}
            </motion.div>
            {r.me && climb && (
              <motion.div className="absolute -right-1 -top-1 text-bull" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
                <I.arrowUp size={14} stroke={3} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   16 · HOLO CARD — гироскопический 3D + голографическая фольга
   ================================================================ */
export function HoloCard({ run, cue }: SceneProps) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 180, damping: 18 });
  const sy = useSpring(py, { stiffness: 180, damping: 18 });
  const rY = useTransform(sx, [0, 1], [-22, 22]);
  const rX = useTransform(sy, [0, 1], [18, -18]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const foilPos = useTransform(sx, (v) => `${v * 200}% ${50}%`);
  const glare = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,.55), transparent 45%)`;
  const layerX = useTransform(sx, [0, 1], [-10, 10]);
  const layerY = useTransform(sy, [0, 1], [-8, 8]);
  const [flip, setFlip] = useState(false);
  const auto = useRef(true);

  useScript(run, async (wait) => {
    cue();
    auto.current = true;
    setFlip(false);
    // «призрачный палец»: орбита по кругу, затем флип
    const ctl = animate(0, Math.PI * 4, {
      duration: 3.2,
      ease: "easeInOut",
      onUpdate: (t) => {
        if (!auto.current) return;
        px.set(0.5 + Math.cos(t) * 0.45);
        py.set(0.5 + Math.sin(t) * 0.4);
      },
    });
    await wait(3300);
    ctl.stop();
    px.set(0.5);
    py.set(0.5);
    setFlip(true);
    await wait(1600);
    setFlip(false);
  });

  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#9b7bff" />
      <div className="absolute inset-x-0 top-12 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Коллекция · наведи / двигай</div>
      <div
        className="absolute left-1/2 top-[96px] h-[340px] w-[230px] -ml-[115px]"
        style={{ perspective: 900 }}
        onPointerMove={(e) => {
          auto.current = false;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => { px.set(0.5); py.set(0.5); }}
        onClick={() => setFlip((f) => !f)}
      >
        <motion.div className="relative h-full w-full cursor-pointer" style={{ rotateX: rX, rotateY: rY, transformStyle: "preserve-3d" }}>
          <motion.div className="absolute inset-0" animate={{ rotateY: flip ? 180 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} style={{ transformStyle: "preserve-3d" }}>
            {/* FRONT */}
            <div className="absolute inset-0 overflow-hidden rounded-[22px] p-[4px]" style={{ backfaceVisibility: "hidden", background: "linear-gradient(150deg,#c9b6ff,#6a4dff 35%,#2ee6c5 65%,#ffc34d)" }}>
              <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-[#120d2a]">
                <motion.img src={hood} className="absolute -inset-4 h-[calc(100%+32px)] w-[calc(100%+32px)] object-cover opacity-90" style={{ x: layerX, y: layerY, scale: 1.05 }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120d2a] via-transparent to-transparent" />
                {/* holo foil */}
                <motion.div
                  className="absolute inset-0 mix-blend-color-dodge"
                  style={{ backgroundImage: "linear-gradient(115deg, transparent 20%, #ff4d5e55 30%, #ffc34d55 38%, #3ddc8455 46%, #4cc3ff55 54%, #9b7bff55 62%, transparent 72%)", backgroundSize: "200% 100%", backgroundPosition: foilPos }}
                />
                <motion.div className="absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
                <motion.div className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-[#6fd6ff] to-[#2365d9] font-display text-base font-black shadow-[0_0_12px_#4cc3ff]" style={{ x: useTransform(layerX, (v) => -v * 0.8) }}>
                  4
                </motion.div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-[9px] font-bold tracking-[.3em] text-violet">ЛЕГЕНДАРНАЯ · НАВЫК</div>
                  <div className="font-display text-xl font-black">Тень Рынка</div>
                  <div className="mt-1 text-[11px] leading-snug text-white/65">Видит ложный пробой за 2 свечи до разворота.</div>
                </div>
              </div>
            </div>
            {/* BACK */}
            <div className="absolute inset-0 overflow-hidden rounded-[22px] border-4 border-violet/60 bg-[radial-gradient(circle_at_50%_40%,#3b2a7a,#0e0a22)] p-5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="spin-slow absolute left-1/2 top-16 h-32 w-32 -ml-16 rounded-full border-2 border-dashed border-violet/40" />
              <div className="relative mt-24 space-y-2.5">
                {[["Анализ", 92], ["Риск", 78], ["Хладнокровие", 85]].map(([l, v]) => (
                  <div key={l as string}>
                    <div className="flex justify-between text-[11px]"><span className="text-white/60">{l}</span><span className="font-bold">{v}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-violet shadow-[0_0_8px_#9b7bff]" style={{ width: `${v}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* shadow */}
          <motion.div className="absolute -bottom-10 left-6 right-6 h-8 rounded-full bg-black/60 blur-xl" style={{ x: useTransform(rY, (v) => -v), transform: "translateZ(-60px)" }} />
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-10 text-center text-[11px] text-white/40">Тап — перевернуть</div>
    </div>
  );
}
