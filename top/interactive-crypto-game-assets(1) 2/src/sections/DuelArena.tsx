/* ------------------------------------------------------------------
 * 16 · DUEL ARENA — real-time 1v1 prediction battle vs AI opponent
 * matchmaking radar · VS intro · HP bars · rounds · emotes · results
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Crown, Flame, Heart, Loader2, RotateCcw, Shield, Swords, TrendingDown, TrendingUp, Trophy, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Card, SectionShell, Tag } from "../components/ui";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Phase = "lobby" | "search" | "vs" | "round" | "reveal" | "result";
type Dir = "up" | "down";

const opponents = [
  { n: "CryptoQueen", a: "CQ", c: "#ff5470", lvl: 24, wr: 68, skill: 0.62 },
  { n: "HodlMaster", a: "HM", c: "#ffc531", lvl: 19, wr: 57, skill: 0.55 },
  { n: "DegenHunter", a: "DH", c: "#a78bff", lvl: 31, wr: 74, skill: 0.68 },
  { n: "Satoshi_Fan", a: "SF", c: "#5b8cff", lvl: 15, wr: 51, skill: 0.5 },
];
const emotes = ["🔥", "😂", "😱", "🐂", "🐻", "💎", "🚀", "🤡"];
const ROUNDS = 5;
const ROUND_TIME = 6;

function Avatar({ a, c, size = 64, glow = false, shake = false }: { a: string; c: string; size?: number; glow?: boolean; shake?: boolean }) {
  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -5, 5, 0], rotate: [0, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="relative flex items-center justify-center rounded-[22px] border-2 font-black"
      style={{ width: size, height: size, fontSize: size * 0.32, color: c, borderColor: c, background: `linear-gradient(180deg, ${c}40, ${c}10)`, boxShadow: glow ? `0 0 30px ${c}, 0 5px 0 #030816` : "0 5px 0 #030816" }}
    >
      {a}
    </motion.div>
  );
}

function HpBar({ hp, c, flip }: { hp: number; c: string; flip?: boolean }) {
  const [hit, setHit] = useState(0);
  const prev = useRef(hp);
  useEffect(() => { if (hp < prev.current) setHit(h => h + 1); prev.current = hp; }, [hp]);
  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full border border-white/15 bg-black/50", flip && "scale-x-[-1]")}>
      <motion.div className="absolute inset-y-0 left-0 bg-white/60" animate={{ width: `${hp}%` }} transition={{ duration: 0.9, delay: 0.25 }} />
      <motion.div key={hit} className={cn("absolute inset-y-0 left-0 rounded-full", hit && "hp-hit")} animate={{ width: `${hp}%` }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ background: hp > 50 ? `linear-gradient(180deg, ${c}, ${c}aa)` : hp > 25 ? "linear-gradient(180deg,#ffd76a,#e79a06)" : "linear-gradient(180deg,#ff8ba0,#c81d47)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5)" }} />
      {[25, 50, 75].map(m => <span key={m} className="absolute inset-y-0 w-px bg-black/40" style={{ left: `${m}%` }} />)}
    </div>
  );
}

function MiniSpark({ data, reveal }: { data: number[]; reveal: number | null }) {
  const all = reveal !== null ? [...data, reveal] : data;
  const min = Math.min(...all) - 2, max = Math.max(...all) + 2;
  const W = 320, H = 120;
  const x = (i: number) => (i / (data.length)) * W;
  const y = (v: number) => H - ((v - min) / (max - min)) * H;
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = data[data.length - 1];
  const up = reveal !== null && reveal >= last;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[120px] w-full">
      <defs><linearGradient id="duelG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5b8cff" stopOpacity=".35" /><stop offset="1" stopColor="#5b8cff" stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${H} ${pts} ${x(data.length - 1)},${H}`} fill="url(#duelG)" />
      <polyline points={pts} fill="none" stroke="#9db9ff" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <line x1={x(data.length - 1)} x2={W} y1={y(last)} y2={y(last)} stroke="#fff" strokeDasharray="4 4" opacity=".35" />
      <circle cx={x(data.length - 1)} cy={y(last)} r="5" fill="#fff" />
      {reveal !== null && (
        <motion.line x1={x(data.length - 1)} y1={y(last)} x2={W - 6} y2={y(reveal)} stroke={up ? "#2ede8a" : "#ff5470"} strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ filter: `drop-shadow(0 0 8px ${up ? "#2ede8a" : "#ff5470"})` }} />
      )}
    </svg>
  );
}

export default function DuelArena({ onXp }: { onXp: (n: number) => void }) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [opp, setOpp] = useState(opponents[0]);
  const [round, setRound] = useState(1);
  const [time, setTime] = useState(ROUND_TIME);
  const [myHp, setMyHp] = useState(100);
  const [opHp, setOpHp] = useState(100);
  const [myPick, setMyPick] = useState<Dir | null>(null);
  const [opPick, setOpPick] = useState<Dir | null>(null);
  const [series, setSeries] = useState<number[]>(() => Array.from({ length: 20 }, (_, i) => 50 + Math.sin(i / 2) * 6 + Math.random() * 4));
  const [reveal, setReveal] = useState<number | null>(null);
  const [log, setLog] = useState<{ r: number; me: boolean; op: boolean }[]>([]);
  const [myEmote, setMyEmote] = useState<string | null>(null);
  const [opEmote, setOpEmote] = useState<string | null>(null);
  const [shakeMe, setShakeMe] = useState(false);
  const [shakeOp, setShakeOp] = useState(false);
  const [combo, setCombo] = useState(0);
  const [searchT, setSearchT] = useState(0);
  const [record, setRecord] = useState({ w: 12, l: 7 });
  const resolving = useRef(false);

  /* matchmaking */
  useEffect(() => {
    if (phase !== "search") return;
    setSearchT(0);
    const id = setInterval(() => setSearchT(t => t + 1), 500);
    const done = setTimeout(() => { setOpp(opponents[Math.floor(Math.random() * opponents.length)]); setPhase("vs"); sfx.levelUp(); }, 2600);
    return () => { clearInterval(id); clearTimeout(done); };
  }, [phase]);

  /* vs intro */
  useEffect(() => {
    if (phase !== "vs") return;
    const t = setTimeout(() => { setPhase("round"); setTime(ROUND_TIME); sfx.whoosh(); }, 2200);
    return () => clearTimeout(t);
  }, [phase]);

  /* round timer + opponent AI */
  useEffect(() => {
    if (phase !== "round") return;
    if (time <= 0) { resolve(myPick ?? (Math.random() > 0.5 ? "up" : "down")); return; }
    const t = setTimeout(() => { setTime(x => x - 1); if (time <= 3) sfx.tick(); }, 1000);
    if (!opPick && Math.random() > 0.55) {
      setOpPick(Math.random() > 0.5 ? "up" : "down");
      if (Math.random() > 0.6) { const e = emotes[Math.floor(Math.random() * emotes.length)]; setOpEmote(e); setTimeout(() => setOpEmote(null), 1500); }
    }
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, time]);

  const pick = (d: Dir) => {
    if (phase !== "round" || myPick) return;
    setMyPick(d);
    if (d === "up") sfx.long(); else sfx.short();
    if (opPick) setTimeout(() => resolve(d), 500);
  };

  const resolve = (mine: Dir) => {
    if (phase !== "round" || resolving.current) return;
    resolving.current = true;
    const op = opPick ?? (Math.random() > 0.5 ? "up" : "down");
    setMyPick(mine); setOpPick(op);
    const last = series[series.length - 1];
    const bias = (Math.random() - 0.5) * 12;
    const next = last + bias;
    const truth: Dir = next >= last ? "up" : "down";
    setPhase("reveal");
    setReveal(next);
    const meOk = mine === truth;
    const opOk = Math.random() < opp.skill ? op === truth || Math.random() > 0.4 : op === truth;
    const dmg = 20 + combo * 5;
    setTimeout(() => {
      if (meOk && !opOk) { setOpHp(h => Math.max(0, h - dmg)); setShakeOp(true); setCombo(c => c + 1); sfx.success(); }
      else if (!meOk && opOk) { setMyHp(h => Math.max(0, h - 22)); setShakeMe(true); setCombo(0); sfx.error(); }
      else if (meOk && opOk) { setOpHp(h => Math.max(0, h - 8)); setMyHp(h => Math.max(0, h - 8)); sfx.pop(); }
      else { sfx.soft(); setCombo(0); }
      setLog(l => [...l, { r: round, me: meOk, op: opOk }]);
      setTimeout(() => { setShakeMe(false); setShakeOp(false); }, 500);
    }, 650);
  };

  const nextRound = () => {
    const finished = round >= ROUNDS || myHp <= 0 || opHp <= 0;
    if (finished) {
      setPhase("result");
      const win = myHp > opHp;
      setRecord(r => ({ w: r.w + (win ? 1 : 0), l: r.l + (win ? 0 : 1) }));
      if (win) { onXp(120); sfx.levelUp(); confetti({ particleCount: 160, spread: 100, origin: { y: 0.55 } }); } else sfx.error();
      return;
    }
    resolving.current = false;
    setSeries(s => [...s.slice(1), reveal!]);
    setReveal(null); setMyPick(null); setOpPick(null);
    setRound(r => r + 1); setTime(ROUND_TIME); setPhase("round");
  };

  const restart = () => {
    resolving.current = false;
    setMyHp(100); setOpHp(100); setRound(1); setLog([]); setReveal(null); setMyPick(null); setOpPick(null); setCombo(0);
    setPhase("search");
  };

  const sendEmote = (e: string) => { setMyEmote(e); sfx.pop(); setTimeout(() => setMyEmote(null), 1500); };
  const won = myHp > opHp;
  const radarDots = useMemo(() => Array.from({ length: 7 }, () => ({ a: Math.random() * Math.PI * 2, r: 30 + Math.random() * 60 })), []);

  return (
    <SectionShell id="duel" index="16" kicker="Duel Arena" title="Дуэли 1v1 в реальном времени" desc="Матчмейкинг с радаром, VS-интро, 5 раундов прогнозов на время, HP-бары с уроном и комбо, эмоции оппоненту и финальный экран победы."
      right={<div className="flex gap-2"><Tag tone="red"><Swords size={11} /> PvP</Tag><Tag tone="gold">W {record.w} · L {record.l}</Tag></div>}>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="panel-3d relative min-h-[560px] overflow-hidden !rounded-[32px] p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(142,242,60,.12),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,84,112,.12),transparent_50%)]" />
          <AnimatePresence mode="wait">
            {/* LOBBY */}
            {phase === "lobby" && (
              <motion.div key="lobby" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative flex min-h-[520px] flex-col items-center justify-center text-center">
                <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity }}>
                  <Swords size={90} className="text-[#ff5470]" style={{ filter: "drop-shadow(0 0 30px #ff5470)" }} strokeWidth={1.6} />
                </motion.div>
                <h3 className="display mt-4 text-3xl font-extrabold text-white">Prediction Duel</h3>
                <p className="mt-1 max-w-sm text-sm text-[#9fb2dd]">5 раундов. Угадай направление цены быстрее и точнее соперника. Каждый верный прогноз наносит урон.</p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {[{ i: Heart, l: "100 HP", c: "#ff5470" }, { i: Clock, l: `${ROUND_TIME}s / раунд`, c: "#5b8cff" }, { i: Flame, l: "Combo dmg", c: "#ffc531" }].map(x => (
                    <div key={x.l} className="panel-inset flex flex-col items-center gap-1 px-4 py-3"><x.i size={20} style={{ color: x.c }} /><span className="text-[10px] font-extrabold text-white">{x.l}</span></div>
                  ))}
                </div>
                <button onClick={() => { setPhase("search"); sfx.tap(); }} className="btn3d btn3d-short anim-pulse-ring mt-6 px-10 py-4 text-sm"><Swords size={18} /> Find opponent</button>
              </motion.div>
            )}

            {/* SEARCH */}
            {phase === "search" && (
              <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.2 }} className="relative flex min-h-[520px] flex-col items-center justify-center">
                <div className="relative h-[240px] w-[240px] overflow-hidden rounded-full border-2 border-[#8ef23c]/40 bg-[radial-gradient(circle,#0e2a18,#050c22)]">
                  {[0.33, 0.66, 1].map(r => <span key={r} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8ef23c]/25" style={{ width: `${r * 100}%`, height: `${r * 100}%` }} />)}
                  <motion.div className="absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(142,242,60,.45), transparent 25%)" }} animate={{ rotate: 360 }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }} />
                  {radarDots.map((d, i) => (
                    <motion.span key={i} className="absolute h-2.5 w-2.5 rounded-full bg-[#8ef23c]" style={{ left: 120 + Math.cos(d.a) * d.r - 5, top: 120 + Math.sin(d.a) * d.r - 5, boxShadow: "0 0 10px #8ef23c" }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.22 }} />
                  ))}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><Avatar a="YO" c="#8ef23c" size={54} glow /></div>
                </div>
                <p className="display mt-6 flex items-center gap-2 text-lg font-extrabold text-white"><Loader2 size={18} className="animate-spin" /> Ищем соперника{".".repeat((searchT % 3) + 1)}</p>
                <p className="num-mono text-xs text-[#7d92c4]">Лига Diamond · ±200 рейтинга · {(searchT * 0.5).toFixed(1)}s</p>
                <button onClick={() => setPhase("lobby")} className="btn3d btn3d-ghost mt-4 px-6 py-2.5 text-[11px]">Cancel</button>
              </motion.div>
            )}

            {/* VS */}
            {phase === "vs" && (
              <motion.div key="vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex min-h-[520px] items-center justify-center">
                <motion.div initial={{ x: -400, rotate: -20 }} animate={{ x: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} className="flex flex-col items-center">
                  <Avatar a="YO" c="#8ef23c" size={110} glow />
                  <p className="display mt-3 text-lg font-extrabold text-white">BullRunner</p>
                  <p className="text-xs font-bold text-[#8ef23c]">Lvl 22 · WR 63%</p>
                </motion.div>
                <motion.div initial={{ scale: 5, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 10 }}
                  className="display mx-6 text-6xl font-extrabold italic text-white sm:mx-10 sm:text-7xl" style={{ textShadow: "0 0 30px #ffc531, 0 6px 0 #8a5c00" }}>VS</motion.div>
                <motion.div initial={{ x: 400, rotate: 20 }} animate={{ x: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} className="flex flex-col items-center">
                  <Avatar a={opp.a} c={opp.c} size={110} glow />
                  <p className="display mt-3 text-lg font-extrabold text-white">{opp.n}</p>
                  <p className="text-xs font-bold" style={{ color: opp.c }}>Lvl {opp.lvl} · WR {opp.wr}%</p>
                </motion.div>
                <motion.div className="pointer-events-none absolute inset-0 bg-white" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }} transition={{ delay: 0.45, duration: 0.4 }} />
              </motion.div>
            )}

            {/* ROUND / REVEAL */}
            {(phase === "round" || phase === "reveal") && (
              <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <div className="relative">
                    <Avatar a="YO" c="#8ef23c" size={56} shake={shakeMe} glow={phase === "reveal" && log[log.length - 1]?.me} />
                    <AnimatePresence>{myEmote && <motion.span initial={{ y: 0, scale: 0 }} animate={{ y: -40, scale: 1.4 }} exit={{ opacity: 0 }} className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl">{myEmote}</motion.span>}</AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2"><span className="w-20 truncate text-[11px] font-extrabold text-white">You</span><HpBar hp={myHp} c="#8ef23c" /><span className="num-mono w-8 text-right text-[11px] font-extrabold text-white">{myHp}</span></div>
                    <div className="flex items-center gap-2"><span className="w-20 truncate text-[11px] font-extrabold text-white">{opp.n}</span><HpBar hp={opHp} c={opp.c} /><span className="num-mono w-8 text-right text-[11px] font-extrabold text-white">{opHp}</span></div>
                  </div>
                  <div className="relative">
                    <Avatar a={opp.a} c={opp.c} size={56} shake={shakeOp} />
                    <AnimatePresence>{opEmote && <motion.span initial={{ y: 0, scale: 0 }} animate={{ y: -40, scale: 1.4 }} exit={{ opacity: 0 }} className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl">{opEmote}</motion.span>}</AnimatePresence>
                    {opPick && phase === "round" && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ffc531] text-[10px] font-black text-[#3a2200]">✓</motion.span>}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {Array.from({ length: ROUNDS }, (_, i) => {
                      const l = log[i];
                      return <span key={i} className={cn("flex h-7 w-7 items-center justify-center rounded-lg border text-[10px] font-black", !l ? (i + 1 === round ? "border-[#8ef23c] text-[#8ef23c]" : "border-white/10 text-[#54678f]") : l.me && !l.op ? "border-[#2ede8a] bg-[#2ede8a]/20 text-[#2ede8a]" : !l.me && l.op ? "border-[#ff5470] bg-[#ff5470]/20 text-[#ff5470]" : "border-white/20 bg-white/10 text-white")}>{i + 1}</span>;
                    })}
                  </div>
                  {combo > 1 && <motion.span key={combo} initial={{ scale: 1.8 }} animate={{ scale: 1 }}><Tag tone="red"><Flame size={11} /> Combo ×{combo}</Tag></motion.span>}
                  <div className="relative flex h-12 w-12 items-center justify-center">
                    <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90"><circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4" /><motion.circle cx="24" cy="24" r="20" fill="none" stroke={time <= 2 ? "#ff5470" : "#8ef23c"} strokeWidth="4" strokeLinecap="round" strokeDasharray="126" animate={{ strokeDashoffset: 126 - (126 * time) / ROUND_TIME }} transition={{ duration: 1, ease: "linear" }} /></svg>
                    <motion.span key={time} initial={{ scale: 1.6 }} animate={{ scale: 1 }} className={cn("num-mono text-sm font-extrabold", time <= 2 ? "text-[#ff5470]" : "text-white")}>{phase === "reveal" ? "—" : time}</motion.span>
                  </div>
                </div>

                <div className="panel-inset mt-4 p-3">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[#7d92c4]"><span>BTC/USDT · 1m</span><span>Round {round}/{ROUNDS}</span></div>
                  <MiniSpark data={series} reveal={reveal} />
                </div>

                {phase === "round" ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button onClick={() => pick("up")} disabled={!!myPick} className={cn("btn3d py-5 text-base", myPick === "up" ? "btn3d-long anim-pulse-ring" : myPick ? "btn3d-ghost" : "btn3d-long")}><TrendingUp size={22} strokeWidth={3} /> Up</button>
                    <button onClick={() => pick("down")} disabled={!!myPick} className={cn("btn3d py-5 text-base", myPick === "down" ? "btn3d-short" : myPick ? "btn3d-ghost" : "btn3d-short")}><TrendingDown size={22} strokeWidth={3} /> Down</button>
                  </div>
                ) : (
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="mt-4 flex items-center gap-3">
                    <div className="grid flex-1 grid-cols-2 gap-2 text-center">
                      <div className={cn("rounded-xl border px-3 py-2", log[log.length - 1]?.me ? "border-[#2ede8a]/40 bg-[#2ede8a]/10" : "border-[#ff5470]/40 bg-[#ff5470]/10")}>
                        <p className="text-[10px] font-bold text-[#8ea6d8]">You · {myPick?.toUpperCase()}</p><p className={cn("text-sm font-extrabold", log[log.length - 1]?.me ? "text-[#2ede8a]" : "text-[#ff5470]")}>{log[log.length - 1]?.me ? "HIT" : "MISS"}</p>
                      </div>
                      <div className={cn("rounded-xl border px-3 py-2", log[log.length - 1]?.op ? "border-[#2ede8a]/40 bg-[#2ede8a]/10" : "border-[#ff5470]/40 bg-[#ff5470]/10")}>
                        <p className="text-[10px] font-bold text-[#8ea6d8]">{opp.a} · {opPick?.toUpperCase()}</p><p className={cn("text-sm font-extrabold", log[log.length - 1]?.op ? "text-[#2ede8a]" : "text-[#ff5470]")}>{log[log.length - 1]?.op ? "HIT" : "MISS"}</p>
                      </div>
                    </div>
                    <button onClick={nextRound} className="btn3d btn3d-green px-6 py-4 text-xs">{round >= ROUNDS || myHp <= 0 || opHp <= 0 ? "Results" : "Next"}</button>
                  </motion.div>
                )}

                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {emotes.map(e => <motion.button key={e} whileHover={{ scale: 1.2, y: -3 }} whileTap={{ scale: 0.8 }} onClick={() => sendEmote(e)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-lg">{e}</motion.button>)}
                </div>
              </motion.div>
            )}

            {/* RESULT */}
            {phase === "result" && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative flex min-h-[520px] flex-col items-center justify-center text-center">
                {won && <motion.div className="absolute h-[500px] w-[500px]" style={{ background: "repeating-conic-gradient(from 0deg, rgba(142,242,60,.12) 0deg 12deg, transparent 12deg 24deg)" }} animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} />}
                <motion.div initial={{ y: -80, rotate: -20 }} animate={{ y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 10 }} className="relative">
                  {won ? <Crown size={96} className="text-[#ffc531]" style={{ filter: "drop-shadow(0 0 30px #ffc531)" }} /> : <Shield size={96} className="text-[#54678f]" />}
                </motion.div>
                <h3 className={cn("display relative mt-3 text-5xl font-extrabold", won ? "text-[#8ef23c] text-glow-green" : "text-[#ff8ba0]")}>{won ? "VICTORY" : "DEFEAT"}</h3>
                <p className="relative mt-1 text-sm text-[#9fb2dd]">{won ? `Ты победил ${opp.n}!` : `${opp.n} оказался сильнее. Реванш?`}</p>
                <div className="relative mt-5 grid grid-cols-3 gap-3">
                  <div className="panel-inset px-4 py-3"><p className="num-mono text-xl font-extrabold text-white">{log.filter(l => l.me).length}/{log.length}</p><p className="text-[10px] font-bold uppercase text-[#7d92c4]">Accuracy</p></div>
                  <div className="panel-inset px-4 py-3"><p className="num-mono text-xl font-extrabold text-[#8ef23c]">{won ? "+120" : "+15"}</p><p className="text-[10px] font-bold uppercase text-[#7d92c4]">XP</p></div>
                  <div className="panel-inset px-4 py-3"><p className={cn("num-mono text-xl font-extrabold", won ? "text-[#2ede8a]" : "text-[#ff5470]")}>{won ? "+24" : "−18"}</p><p className="text-[10px] font-bold uppercase text-[#7d92c4]">Rating</p></div>
                </div>
                <div className="relative mt-6 flex gap-3">
                  <button onClick={restart} className="btn3d btn3d-short px-6 py-3.5 text-xs"><RotateCcw size={14} /> Rematch</button>
                  <button onClick={() => { setPhase("lobby"); setMyHp(100); setOpHp(100); setRound(1); setLog([]); setReveal(null); setMyPick(null); setOpPick(null); }} className="btn3d btn3d-ghost px-6 py-3.5 text-xs">Lobby</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Opponents Online" sub="Тапни, чтобы бросить вызов" action={<span className="flex items-center gap-1 text-[10px] font-extrabold text-[#2ede8a]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#2ede8a]" /> 2 481 online</span>}>
            <div className="space-y-2">
              {opponents.map((o, i) => (
                <motion.button key={o.n} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ x: 4 }}
                  onClick={() => { setOpp(o); setMyHp(100); setOpHp(100); setRound(1); setLog([]); setReveal(null); setMyPick(null); setOpPick(null); setPhase("vs"); sfx.levelUp(); }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-2.5 text-left hover:border-white/25">
                  <Avatar a={o.a} c={o.c} size={40} />
                  <div className="flex-1"><p className="text-xs font-extrabold text-white">{o.n}</p><p className="text-[10px] text-[#7d92c4]">Lvl {o.lvl} · WR {o.wr}%</p></div>
                  <span className="btn3d btn3d-short px-3 py-1.5 text-[10px]"><Swords size={12} /></span>
                </motion.button>
              ))}
            </div>
          </Card>
          <Card title="Season Rewards" sub="Победы открывают награды">
            <div className="space-y-3">
              {[{ w: 5, r: "Rare chest", i: Trophy, c: "#5b8cff" }, { w: 15, r: "Epic skin", i: Zap, c: "#a78bff" }, { w: 30, r: "Legend crown", i: Crown, c: "#ffc531" }].map(x => {
                const p = Math.min(1, record.w / x.w);
                return (
                  <div key={x.r} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${x.c}22`, color: x.c }}><x.i size={18} /></span>
                    <div className="flex-1">
                      <div className="flex justify-between text-[11px] font-extrabold"><span className="text-white">{x.r}</span><span className="num-mono text-[#8ea6d8]">{Math.min(record.w, x.w)}/{x.w}</span></div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/40"><motion.div className="h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${p * 100}%` }} transition={{ duration: 1 }} style={{ background: x.c }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}
