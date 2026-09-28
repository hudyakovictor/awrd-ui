import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton } from "./Device";
import { Mascot, type SkinKey } from "./Mascot";
import { CrownArt, TrophyArt, ShieldArt, FlameArt, BoltArt, GemArt, StarArt } from "./art";
import { sfx, Confetti, Rays, Pop } from "./Juice";

/* ================================================================== */
/*  AVATAR                                                             */
/* ================================================================== */
const PEOPLE = [
  { n: "Kira_V", c: "#9b6bff", xp: 2480 },
  { n: "0xNomad", c: "#38e1ff", xp: 2210 },
  { n: "Delta_One", c: "#ffc24b", xp: 1995 },
  { n: "You", c: "#2be08a", xp: 1840, me: true },
  { n: "Satoshi_Jr", c: "#ff4d6a", xp: 1702 },
  { n: "Mika.eth", c: "#5fe6ff", xp: 1560 },
  { n: "GreenCandle", c: "#a8e05f", xp: 1320 },
  { n: "Wen_Lambo", c: "#ff9471", xp: 980 },
  { n: "PaperHands", c: "#7d8db4", xp: 610 },
];

export function Avatar({ name, color, size = 44, ring }: { name: string; color: string; size?: number; ring?: string }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center rounded-full font-[family-name:var(--font-display)] font-bold text-[#07101f]"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 60%, #fff), ${color} 55%, color-mix(in srgb, ${color} 55%, #000))`,
        boxShadow: `0 ${size * 0.07}px 0 color-mix(in srgb, ${color} 35%, #000)${ring ? `, 0 0 0 3px #0a1226, 0 0 0 5px ${ring}` : ""}`,
      }}
    >
      {name[0]}
      <span className="pointer-events-none absolute left-[22%] top-[14%] h-[22%] w-[34%] rounded-full bg-white/40" />
    </span>
  );
}

/* ================================================================== */
/*  LEAGUE PODIUM                                                      */
/* ================================================================== */
function League() {
  const [key, setKey] = useState(0);
  const top = PEOPLE.slice(0, 3);
  const order = [1, 0, 2];
  const H = [120, 90, 70];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: "linear-gradient(120deg,#3a2a0e,#0b1224 70%)", boxShadow: "inset 0 0 0 2px #ffc24b44" }}>
        <ShieldArt size={44} />
        <div className="flex-1">
          <div className="font-[family-name:var(--font-display)] text-[17px] font-bold text-gold">Gold League</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-400">top 3 promote · 2d 14h left</div>
        </div>
        <button type="button" onClick={() => { setKey((k) => k + 1); sfx("whoosh"); }} className="font-mono text-[9px] uppercase tracking-widest text-ink-500 hover:text-white">
          replay
        </button>
      </div>
      <div key={key} className="relative flex items-end justify-center gap-2 pt-10">
        <Rays color="rgba(255,194,75,.12)" size="120%" className="top-[40%]" />
        {order.map((idx, k) => {
          const p = top[idx];
          const medal = ["#ffc24b", "#cfd8ea", "#d08a4b"][idx];
          return (
            <div key={p.n} className="relative flex w-[92px] flex-col items-center">
              <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.6 + k * 0.15 }} className="relative mb-2 flex flex-col items-center">
                {idx === 0 && (
                  <motion.div animate={{ y: [0, -4, 0], rotate: [0, -6, 6, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-8">
                    <CrownArt size={34} />
                  </motion.div>
                )}
                <Avatar name={p.n} color={p.c} size={idx === 0 ? 60 : 50} ring={medal} />
                <span className="mt-1.5 max-w-full truncate text-[11px] font-extrabold text-white">{p.n}</span>
                <span className="font-mono text-[9px] font-black" style={{ color: medal }}>
                  {p.xp} XP
                </span>
              </motion.div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: H[idx] }}
                transition={{ type: "spring", stiffness: 120, damping: 16, delay: k * 0.12 }}
                className="relative w-full overflow-hidden rounded-t-2xl"
                style={{ background: `linear-gradient(180deg, ${medal}, color-mix(in srgb, ${medal} 40%, #000))`, boxShadow: `inset 0 3px 0 rgba(255,255,255,.4)` }}
              >
                <span className="absolute inset-x-0 top-3 text-center font-[family-name:var(--font-display)] text-[34px] font-bold text-black/35">{idx + 1}</span>
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="space-y-1.5">
        {PEOPLE.map((p, i) => (
          <div key={p.n}>
            {i === 3 && (
              <div className="my-2 flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-bull">
                <Icon name="arrowUp" size={12} strokeWidth={3} /> promotion zone <span className="h-[2px] flex-1 bg-bull/40" />
              </div>
            )}
            {i === 7 && (
              <div className="my-2 flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-bear">
                <Icon name="arrowDown" size={12} strokeWidth={3} /> demotion zone <span className="h-[2px] flex-1 bg-bear/40" />
              </div>
            )}
            {i >= 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i - 3) * 0.05 }}
                className={cn("flex items-center gap-2.5 rounded-xl border-2 px-2.5 py-2", p.me ? "border-[var(--accent)]" : "border-transparent")}
                style={{ background: p.me ? "color-mix(in srgb, var(--accent) 12%, #0d1528)" : "#0d1528" }}
              >
                <span className={cn("w-5 text-center font-mono text-[12px] font-black", i >= 7 ? "text-bear" : "text-ink-400")}>{i + 1}</span>
                <Avatar name={p.n} color={p.c} size={32} />
                <span className="flex-1 truncate text-[12px] font-bold text-ink-200">{p.n}</span>
                <span className="tnum font-mono text-[11px] font-black text-ink-300">{p.xp} XP</span>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PVP DUEL — Long vs Short                                           */
/* ================================================================== */
type DuelStage = "lobby" | "vs" | "pick" | "run" | "round" | "final";

function Duel() {
  const [stage, setStage] = useState<DuelStage>("lobby");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [me, setMe] = useState<"long" | "short" | null>(null);
  const [op, setOp] = useState<"long" | "short">("long");
  const [pts, setPts] = useState<number[]>([]);
  const [timer, setTimer] = useState(5);
  const [conf, setConf] = useState(0);
  const [lastWin, setLastWin] = useState<0 | 1 | 2>(0);
  const raf = useRef(0);

  const seed = () => {
    const a: number[] = [50];
    for (let i = 0; i < 24; i++) a.push(a[a.length - 1] + (Math.random() - 0.5) * 6);
    setPts(a);
  };

  const startMatch = () => {
    setScore([0, 0]);
    setRound(1);
    setStage("vs");
    sfx("whoosh");
    setTimeout(() => beginRound(), 1600);
  };

  const beginRound = () => {
    seed();
    setMe(null);
    setOp(Math.random() > 0.5 ? "long" : "short");
    setTimer(5);
    setStage("pick");
    sfx("go");
  };

  useEffect(() => {
    if (stage !== "pick") return;
    if (timer <= 0) {
      lockIn(me ?? (Math.random() > 0.5 ? "long" : "short"));
      return;
    }
    const t = setTimeout(() => {
      setTimer((x) => x - 1);
      if (timer <= 3) sfx("countdown", false);
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timer]);

  const lockIn = (side: "long" | "short") => {
    setMe(side);
    setStage("run");
    sfx("select");
    const start = performance.now();
    const drift = (Math.random() - 0.5) * 1.6;
    const step = (t: number) => {
      setPts((p) => (p.length > 48 ? p : [...p, p[p.length - 1] + drift + (Math.random() - 0.5) * 5]));
      if (t - start < 2600) raf.current = requestAnimationFrame(throttled);
      else {
        setPts((p) => {
          const moved = p[p.length - 1] - p[24];
          const upWin = moved > 0;
          const meWin = (side === "long") === upWin;
          const opWin = (op === "long") === upWin;
          const res: 0 | 1 | 2 = meWin && !opWin ? 1 : opWin && !meWin ? 2 : 0;
          setLastWin(res);
          setScore((s) => [s[0] + (res === 1 ? 1 : 0), s[1] + (res === 2 ? 1 : 0)]);
          sfx(res === 1 ? "correct" : res === 2 ? "wrong" : "pop");
          setStage("round");
          return p;
        });
      }
    };
    cancelAnimationFrame(raf.current);
    let last = 0;
    const throttled = (t: number) => {
      if (t - last > 70) {
        last = t;
        step(t);
      } else raf.current = requestAnimationFrame(throttled);
    };
    raf.current = requestAnimationFrame(throttled);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const nextRound = () => {
    if (score[0] >= 2 || score[1] >= 2 || round >= 3) {
      setStage("final");
      if (score[0] > score[1]) {
        setConf((c) => c + 1);
        sfx("levelup");
      } else sfx("lose");
      return;
    }
    setRound((r) => r + 1);
    beginRound();
  };

  const min = Math.min(...(pts.length ? pts : [0])) - 2;
  const max = Math.max(...(pts.length ? pts : [1])) + 2;
  const path = pts.map((v, i) => `${(i / 48) * 300},${140 - ((v - min) / (max - min)) * 130}`).join(" ");
  const up = pts.length > 25 ? pts[pts.length - 1] > pts[24] : true;

  return (
    <div className="relative min-h-[470px] overflow-hidden rounded-2xl p-4" style={{ background: "radial-gradient(circle at 50% 0%, #1b2b55 0%, #0a1226 65%)" }}>
      <Confetti fire={conf} />
      {/* header / HP */}
      <div className="relative flex items-center gap-3">
        <Avatar name="You" color="#2be08a" size={42} ring="#2be08a" />
        <div className="flex-1">
          <div className="flex justify-between font-mono text-[10px] font-black uppercase">
            <span className="text-bull">You</span>
            <span className="text-ink-500">round {round}/3</span>
            <span className="text-bear">Kira_V</span>
          </div>
          <div className="mt-1 flex gap-1">
            {[0, 1].map((i) => (
              <span key={`a${i}`} className="h-2.5 flex-1 rounded-full" style={{ background: i < score[0] ? "#2be08a" : "#1a2745", boxShadow: i < score[0] ? "0 0 8px #2be08a" : undefined }} />
            ))}
            <span className="w-3" />
            {[0, 1].map((i) => (
              <span key={`b${i}`} className="h-2.5 flex-1 rounded-full" style={{ background: i < score[1] ? "#ff4d6a" : "#1a2745", boxShadow: i < score[1] ? "0 0 8px #ff4d6a" : undefined }} />
            ))}
          </div>
        </div>
        <Avatar name="Kira_V" color="#ff4d6a" size={42} ring="#ff4d6a" />
      </div>

      <AnimatePresence mode="wait">
        {stage === "lobby" && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mt-4 flex flex-col items-center text-center">
            <div className="flex items-end gap-2">
              <Mascot mood="idle" size={110} />
              <span className="mb-10 font-[family-name:var(--font-display)] text-[30px] font-bold text-gold">VS</span>
              <Mascot mood="idle" size={110} species="bear" track={false} />
            </div>
            <div className="font-[family-name:var(--font-display)] text-[22px] font-bold text-white">Long vs Short Duel</div>
            <p className="mt-1 max-w-[280px] text-[12px] text-ink-400">Best of 3. Call the direction faster and smarter than your rival.</p>
            <div className="mt-4 flex items-center gap-2">
              <TrophyArt size={22} />
              <span className="font-mono text-[11px] font-black text-gold">+28 trophies</span>
            </div>
            <div className="mt-4 w-full max-w-[260px]">
              <GameButton onClick={startMatch}>Find match</GameButton>
            </div>
          </motion.div>
        )}

        {stage === "vs" && (
          <motion.div key="vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.3 }} className="relative mt-8 flex h-[300px] items-center justify-center">
            <motion.div initial={{ x: -220 }} animate={{ x: -70 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute">
              <Mascot mood="shock" size={130} track={false} />
            </motion.div>
            <motion.div initial={{ x: 220 }} animate={{ x: 70 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute">
              <Mascot mood="shock" size={130} species="bear" track={false} />
            </motion.div>
            <motion.div initial={{ scale: 4, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 10 }} className="relative z-10">
              <BoltArt size={90} />
              <span className="absolute inset-0 grid place-items-center font-[family-name:var(--font-display)] text-[34px] font-bold text-white" style={{ textShadow: "0 4px 0 #000" }}>
                VS
              </span>
            </motion.div>
          </motion.div>
        )}

        {(stage === "pick" || stage === "run" || stage === "round") && (
          <motion.div key="play" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-4">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#070d1c] p-2" style={{ boxShadow: "inset 0 4px 12px rgba(0,0,0,.7)" }}>
              <svg viewBox="0 0 300 150" className="h-[170px] w-full">
                <line x1={(24 / 48) * 300} x2={(24 / 48) * 300} y1={0} y2={150} stroke="rgba(160,190,255,.25)" strokeDasharray="4 4" />
                <polyline points={path} fill="none" stroke={stage === "pick" ? "#a3b1d2" : up ? "#2be08a" : "#ff4d6a"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                {pts.length > 0 && (
                  <circle cx={((pts.length - 1) / 48) * 300} cy={140 - ((pts[pts.length - 1] - min) / (max - min)) * 130} r="5" fill={stage === "pick" ? "#fff" : up ? "#2be08a" : "#ff4d6a"}>
                    <animate attributeName="r" values="4;7;4" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </svg>
              {stage === "pick" && (
                <div className="absolute right-3 top-3">
                  <svg width="46" height="46" viewBox="0 0 46 46">
                    <circle cx="23" cy="23" r="19" fill="#0a1226" stroke="#1a2745" strokeWidth="5" />
                    <motion.circle cx="23" cy="23" r="19" fill="none" stroke={timer <= 2 ? "#ff4d6a" : "var(--accent)"} strokeWidth="5" strokeLinecap="round" strokeDasharray={119} animate={{ strokeDashoffset: 119 - (timer / 5) * 119 }} transform="rotate(-90 23 23)" />
                    <text x="23" y="28" textAnchor="middle" fontSize="15" fontWeight="900" fill="#fff" fontFamily="JetBrains Mono, monospace">
                      {timer}
                    </text>
                  </svg>
                </div>
              )}
            </div>
            {stage === "pick" && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <GameButton tone="bull" onClick={() => lockIn("long")}>
                  <Icon name="trendUp" size={18} strokeWidth={3} /> Long
                </GameButton>
                <GameButton tone="bear" onClick={() => lockIn("short")}>
                  <Icon name="trendDown" size={18} strokeWidth={3} /> Short
                </GameButton>
              </div>
            )}
            {stage === "run" && (
              <div className="mt-4 flex items-center justify-between rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-3 font-mono text-[11px] font-black uppercase">
                <span className={me === "long" ? "text-bull" : "text-bear"}>you: {me}</span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-ink-400">
                  market moving…
                </motion.span>
                <span className={op === "long" ? "text-bull" : "text-bear"}>rival: {op}</span>
              </div>
            )}
            {stage === "round" && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 16 }} className="mt-4 rounded-2xl p-4 text-center" style={{ background: lastWin === 1 ? "#0f3326" : lastWin === 2 ? "#3a0f1c" : "#16223f" }}>
                <div className={cn("font-[family-name:var(--font-display)] text-[24px] font-bold", lastWin === 1 ? "text-bull" : lastWin === 2 ? "text-bear" : "text-ink-200")}>
                  {lastWin === 1 ? "Round won!" : lastWin === 2 ? "Round lost" : "Draw"}
                </div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink-400">
                  market went {up ? "up" : "down"} · you {me} · rival {op}
                </div>
                <GameButton size="md" onClick={nextRound}>
                  {score[0] >= 2 || score[1] >= 2 || round >= 3 ? "Final results" : "Next round"}
                </GameButton>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === "final" && (
          <motion.div key="final" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-4 flex flex-col items-center text-center">
            {score[0] > score[1] && <Rays />}
            <Mascot mood={score[0] > score[1] ? "celebrate" : "sad"} size={140} />
            <div className={cn("relative font-[family-name:var(--font-display)] text-[30px] font-bold", score[0] > score[1] ? "text-gold" : "text-bear")}>{score[0] > score[1] ? "Victory!" : score[0] === score[1] ? "Stalemate" : "Defeat"}</div>
            <div className="relative font-mono text-[14px] font-black text-white">
              {score[0]} — {score[1]}
            </div>
            <div className="relative mt-2 flex items-center gap-1.5 font-mono text-[12px] font-black text-gold">
              <TrophyArt size={20} /> {score[0] > score[1] ? "+28" : "−14"}
            </div>
            <div className="relative mt-4 w-full max-w-[260px]">
              <GameButton onClick={startMatch}>Rematch</GameButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  HOLO TRADER CARD                                                   */
/* ================================================================== */
function TraderCard() {
  const [p, setP] = useState({ x: 50, y: 50, rx: 0, ry: 0 });
  const [flip, setFlip] = useState(false);
  const skin: SkinKey = "royal";
  const stats = [0.82, 0.64, 0.9, 0.55, 0.74];
  const labels = ["Risk", "TA", "Discipline", "Speed", "Macro"];
  const poly = stats
    .map((v, i) => {
      const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
      return `${60 + Math.cos(a) * 44 * v},${60 + Math.sin(a) * 44 * v}`;
    })
    .join(" ");
  return (
    <div className="flex flex-col items-center gap-3 py-2" style={{ perspective: 1000 }}>
      <motion.div
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          setP({ x, y, rx: -(y - 50) / 4, ry: (x - 50) / 4 });
        }}
        onMouseLeave={() => setP({ x: 50, y: 50, rx: 0, ry: 0 })}
        onClick={() => { setFlip(!flip); sfx("swipe"); }}
        animate={{ rotateX: p.rx, rotateY: p.ry + (flip ? 180 : 0) }}
        transition={{ type: "spring", stiffness: 160, damping: 18 }}
        className="relative h-[330px] w-[228px] cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* front */}
        <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[22px] p-[3px]" style={{ background: "linear-gradient(150deg,#ffe08a,#9b6bff,#38e1ff,#2be08a)", boxShadow: "0 24px 50px -20px #000" }}>
          <div className="relative h-full w-full overflow-hidden rounded-[19px]" style={{ background: "linear-gradient(170deg,#1b2b55,#0a1226)" }}>
            <div
              className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge"
              style={{
                background: `radial-gradient(circle at ${p.x}% ${p.y}%, rgba(255,255,255,.55), transparent 40%), linear-gradient(${110 + p.x}deg, transparent 20%, rgba(255,0,180,.25) 35%, rgba(0,255,220,.25) 50%, rgba(255,230,0,.25) 65%, transparent 80%)`,
                opacity: 0.8,
              }}
            />
            <div className="relative z-10 flex items-center justify-between px-3 pt-3">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-gold">legendary</span>
              <span className="flex items-center gap-1 font-mono text-[11px] font-black text-white">
                <StarArt size={14} /> 94
              </span>
            </div>
            <div className="relative z-10 mx-3 mt-2 grid h-[150px] place-items-center overflow-hidden rounded-2xl" style={{ background: "radial-gradient(circle at 50% 60%, #2c4a9c, #0a1226 75%)" }}>
              <Mascot mood="happy" size={130} skin={skin} outfit={{ shades: true, chain: true }} track={false} />
            </div>
            <div className="relative z-10 px-3 pt-2">
              <div className="font-[family-name:var(--font-display)] text-[19px] font-bold text-white">0xNomad</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Swing trader · Gold league</div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {[
                  ["68%", "win"],
                  ["42", "streak"],
                  ["2.4", "R:R"],
                ].map(([v, l]) => (
                  <div key={l} className="rounded-lg bg-black/30 py-1 text-center">
                    <div className="font-mono text-[12px] font-black text-white">{v}</div>
                    <div className="font-mono text-[7px] uppercase tracking-widest text-ink-500">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* back */}
        <div className="backface-hidden absolute inset-0 overflow-hidden rounded-[22px] p-[3px]" style={{ transform: "rotateY(180deg)", background: "linear-gradient(150deg,#38e1ff,#9b6bff)" }}>
          <div className="flex h-full w-full flex-col items-center rounded-[19px] p-4" style={{ background: "linear-gradient(170deg,#1b2b55,#0a1226)" }}>
            <div className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-aqua">skill radar</div>
            <svg viewBox="0 0 120 120" className="my-2 h-[150px] w-[150px]">
              {[1, 0.66, 0.33].map((s) => (
                <polygon
                  key={s}
                  points={stats.map((_, i) => { const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2; return `${60 + Math.cos(a) * 44 * s},${60 + Math.sin(a) * 44 * s}`; }).join(" ")}
                  fill="none"
                  stroke="rgba(160,190,255,.2)"
                />
              ))}
              <polygon points={poly} fill="rgba(56,225,255,.3)" stroke="#38e1ff" strokeWidth="2" />
              {labels.map((l, i) => {
                const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <text key={l} x={60 + Math.cos(a) * 56} y={62 + Math.sin(a) * 56} textAnchor="middle" fontSize="7" fontWeight="800" fill="#a3b1d2" fontFamily="JetBrains Mono, monospace">
                    {l}
                  </text>
                );
              })}
            </svg>
            <div className="w-full space-y-1.5">
              {[
                ["Lessons", "184"],
                ["Duels won", "72"],
                ["Best league", "Diamond"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-lg bg-black/30 px-2.5 py-1.5 font-mono text-[10px]">
                  <span className="text-ink-400">{k}</span>
                  <span className="font-black text-white">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500">hover = holo foil · click = flip</span>
    </div>
  );
}

/* ================================================================== */
/*  FRIEND QUEST                                                       */
/* ================================================================== */
function FriendQuest() {
  const [mine, setMine] = useState(34);
  const [theirs, setTheirs] = useState(28);
  const [nudged, setNudged] = useState(false);
  const goal = 100;
  const total = Math.min(goal, mine + theirs);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar name="You" color="#2be08a" size={44} />
          <span className="absolute -bottom-1 -right-3">
            <Avatar name="Mika" color="#5fe6ff" size={30} />
          </span>
        </div>
        <div className="ml-3 flex-1">
          <div className="text-[13px] font-extrabold text-white">Earn 100 XP together</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">friend quest · 3 days left</div>
        </div>
        <GemArt size={34} />
      </div>
      <div className="relative h-7 overflow-hidden rounded-full bg-[#0a1122]" style={{ boxShadow: "inset 0 3px 6px rgba(0,0,0,.7)" }}>
        <motion.div animate={{ width: `${(Math.min(mine, goal) / goal) * 100}%` }} className="absolute inset-y-0 left-0 rounded-l-full bg-bull" />
        <motion.div animate={{ left: `${(Math.min(mine, goal) / goal) * 100}%`, width: `${(Math.min(theirs, goal - Math.min(mine, goal)) / goal) * 100}%` }} className="absolute inset-y-0 bg-aqua" />
        <span className="absolute inset-x-3 top-[5px] h-1.5 rounded-full bg-white/25" />
        <span className="absolute inset-0 grid place-items-center font-mono text-[11px] font-black text-white" style={{ textShadow: "0 1px 2px #000" }}>
          <Pop value={`${total}/${goal}`} />
        </span>
      </div>
      <div className="flex justify-between font-mono text-[10px] font-black">
        <span className="text-bull">you · {mine}</span>
        <span className="text-aqua">Mika · {theirs}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <GameButton size="md" tone="bull" onClick={() => { setMine((m) => m + 12); sfx("coin"); }}>
          +12 XP
        </GameButton>
        <GameButton
          size="md"
          tone="aqua"
          disabled={nudged}
          onClick={() => {
            setNudged(true);
            sfx("pop");
            setTimeout(() => {
              setTheirs((t) => t + 15);
              sfx("coin");
            }, 1200);
          }}
        >
          {nudged ? "Nudged ✓" : "Nudge 👋"}
        </GameButton>
      </div>
      <AnimatePresence>
        {total >= goal && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-xl bg-[#0f3326] p-2.5 text-[12px] font-bold text-bull">
            <FlameArt size={22} /> Quest complete — both earn a chest!
            <button type="button" onClick={() => { setMine(34); setTheirs(28); setNudged(false); }} className="ml-auto font-mono text-[9px] uppercase text-ink-400">
              reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  REACTIONS                                                          */
/* ================================================================== */
function Reactions() {
  const [bursts, setBursts] = useState<{ id: number; e: string; x: number }[]>([]);
  const emojis = ["🚀", "💎", "🔥", "🐂", "🐻", "👏"];
  const fire = (e: string, i: number) => {
    const n = Array.from({ length: 6 }, (_, k) => ({ id: Date.now() + k + Math.random(), e, x: i * 16 + (Math.random() - 0.5) * 40 }));
    setBursts((b) => [...b, ...n]);
    sfx("pop");
    setTimeout(() => setBursts((b) => b.filter((x) => !n.includes(x))), 1400);
  };
  return (
    <div className="relative">
      <div className="mb-3 rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-3">
        <div className="flex items-start gap-2.5">
          <Avatar name="Kira_V" color="#9b6bff" size={34} />
          <div>
            <div className="text-[12px] font-extrabold text-white">
              Kira_V <span className="font-mono text-[9px] text-ink-500">· 2m</span>
            </div>
            <div className="text-[12px] text-ink-300">Just hit a 60-day streak and Diamond league 💎</div>
          </div>
        </div>
      </div>
      <div className="relative flex justify-between gap-1.5">
        {emojis.map((e, i) => (
          <motion.button key={e} type="button" whileHover={{ y: -4, scale: 1.15 }} whileTap={{ scale: 0.8 }} onClick={() => fire(e, i - 2.5)} className="grid h-11 flex-1 place-items-center rounded-xl border-2 border-[#22355e] bg-[#101a33] text-[20px]" style={{ boxShadow: "0 3px 0 #0a1328" }}>
            {e}
          </motion.button>
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-full h-40">
          <AnimatePresence>
            {bursts.map((b) => (
              <motion.span key={b.id} initial={{ y: 0, opacity: 1, scale: 0.6 }} animate={{ y: -130 - Math.random() * 30, opacity: 0, scale: 1.4, x: b.x }} transition={{ duration: 1.3, ease: "easeOut" }} className="absolute bottom-0 left-1/2 text-[22px]">
                {b.e}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Social() {
  return (
    <Section id="social" index="" title="Competition & Social" kicker="Leagues · PvP · identity · co-op" count="5 systems">
      <Grid>
        <Cell title="League Podium" spec="promote / demote zones" span="col-span-2">
          <League />
        </Cell>
        <Cell title="PvP Duel · Long vs Short" spec="best of 3 · 5s pick" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Duel />
        </Cell>
        <Cell title="Holo Trader Card" spec="foil shader · radar back" span="col-span-2">
          <TraderCard />
        </Cell>
        <Cell title="Friend Quest" spec="co-op progress" span="col-span-2 lg:col-span-3">
          <FriendQuest />
        </Cell>
        <Cell title="Feed Reactions" spec="emoji burst" span="col-span-2 lg:col-span-3">
          <Reactions />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="gold">social proof loops</Tag>
        <Tag tone="accent">rival mascot URSA</Tag>
        <Tag tone="violet">collectible identity</Tag>
      </div>
    </Section>
  );
}
