import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { BrainCircuit, Pause, Percent, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { Art, Bar, Bolt, Coin } from "../lib/ui";
import { Burst, FloatText, Impact, Shock, Vignette, CoinFly } from "../lib/fx";
import ChartCanvas from "./ChartCanvas";
import PatternIcon from "./PatternIcon";
import { buildPattern, genWalk, Candle } from "./chart";
import { M, Monster, P, PATTERNS } from "../data/kit";
import { cn } from "../utils/cn";

const PMAX = 120;
const R = (a: number, b: number) => Math.round(a + Math.random() * (b - a));

type Phase = "vs" | "stream" | "decide" | "resolve" | "over";
interface Flt { id: number; t: string; c: string; x: number; y: number; big?: boolean }
interface Fx { id: number; kind: "impact" | "burst" | "shock" | "proj-hit" | "proj-miss"; x: number; y: number; c: string }

export interface BattleResult { stars: number; coins: number; patternId: string; win: boolean }

/* stage coordinates (panel 316×196) */
const HERO = { x: 66, y: 128 };
const FOE = { x: 252, y: 66 };
const CH_X = 170;                 // coin fly origin (chart middle)

export default function Battle({
  enemyId = "fomo", patternId, live = true, level = 5,
  onWin, onLose, onPause,
}: {
  enemyId?: string; patternId?: string; live?: boolean; level?: number;
  onWin?: (r: BattleResult) => void; onLose?: () => void; onPause?: () => void;
}) {
  const enemy: Monster = M(enemyId);
  const EMAX = Math.round(enemy.hp * 0.9);

  const [php, setPhp] = useState(live ? PMAX : 78);
  const [ehp, setEhp] = useState(live ? EMAX : Math.round(EMAX * 0.48));
  const [energy, setEnergy] = useState(4);
  const [shield, setShield] = useState(0);
  const [leverage, setLeverage] = useState(false);
  const [combo, setCombo] = useState(live ? 0 : 3);
  const [phase, setPhase] = useState<Phase>(live ? "vs" : "decide");
  const [data, setData] = useState<Candle[]>([]);
  const [zone, setZone] = useState<{ from: number; to: number; id: number } | null>(null);
  const [flash, setFlash] = useState<{ id: number; ok: boolean } | null>(null);
  const [active, setActive] = useState<string | null>(null);       // current pattern id
  const [timer, setTimer] = useState(live ? 0 : 0.62);             // decide countdown 0..1
  const [reveal, setReveal] = useState<0 | 1 | -1 | null>(null);
  const [round, setRound] = useState(1);
  const [acc, setAcc] = useState({ ok: 0, all: 0 });
  const [coinsWon, setCoinsWon] = useState(0);
  const [flts, setFlts] = useState<Flt[]>([]);
  const [fxs, setFxs] = useState<Fx[]>([]);
  const [coinWay, setCoinWay] = useState<number>(0);
  const [vig, setVig] = useState<{ id: number; c: string } | null>(null);
  const [t, setT] = useState(0);

  const price = useRef(live ? 50 : 50);
  const dead = useRef(false);
  const pending = useRef<{ id: string; dir: 1 | -1; outcome: Candle } | null>(null);
  const pick = useRef<0 | 1 | -1 | null>(null);
  const decideIv = useRef<number | null>(null);
  const zoneN = useRef(0);
  const cam = useAnimation();

  const alive = live && phase !== "over" && phase !== "vs";

  /* ── pure helpers ── */
  const flt = (t2: string, c: string, x: number, y = 40, big = false) => {
    const id = Math.random(); setFlts((f) => [...f, { id, t: t2, c, x, y, big }]);
    setTimeout(() => setFlts((f) => f.filter((q) => q.id !== id)), 1100);
  };
  const fx = (kind: Fx["kind"], x: number, y: number, c: string) => {
    const id = Math.random(); setFxs((f) => [...f, { id, kind, x, y, c }]);
    setTimeout(() => setFxs((f) => f.filter((q) => q.id !== id)), 900);
  };
  const shake = (s = 1) => {
    cam.start({ x: [0, -9 * s, 8 * s, -5 * s, 3 * s, 0], y: [0, 5 * s, -4 * s, 2 * s, 0], transition: { duration: 0.42 } });
  };

  /* ════ VS intro ════ */
  useEffect(() => {
    if (!live) return;
    const boot = genWalk(50, 10);
    price.current = boot.end;
    setData(boot.cs);
    const to = setTimeout(() => setPhase("stream"), 1900);
    return () => clearTimeout(to);
  }, [live]);

  /* ════ static gallery mode ════ */
  useEffect(() => {
    if (live) return;
    const g = genWalk(50, 10); let p = g.end;
    const built = buildPattern("bullEng", p);
    setData([...g.cs, ...built.pb.candles]);
    price.current = built.end;
    setActive("bullEng");
    setZone({ from: 10, to: 9 + built.pb.candles.length, id: 1 });
  }, [live]);

  /* ════ streaming ════ */
  useEffect(() => {
    if (!alive || phase !== "stream") return;
    const pid = activeFor(round, patternId);
    const built = buildPattern(pid, price.current);
    const seq = [...built.pb.candles];
    let i = 0;
    price.current = seq[seq.length - 1].c;
    pending.current = { id: pid, dir: built.pb.dir, outcome: built.pb.outcome };
    setActive(pid);
    setReveal(null); pick.current = null;

    const iv = setInterval(() => {
      if (i >= seq.length) {
        clearInterval(iv);
        setData((d) => {
          const from = d.length - seq.length;
          zoneN.current += 1;
          setZone({ from, to: d.length - 1, id: zoneN.current });
          return d;
        });
        setTimer(0); setPhase("decide");
        return;
      }
      const c = seq[i++];
      setData((d) => [...d, c]);
    }, i === 0 ? 60 : 430);
    return () => clearInterval(iv);
  }, [phase, round, alive]);

  /* ════ decide: countdown ════ */
  useEffect(() => {
    if (!alive || phase !== "decide") return;
    decideIv.current = window.setInterval(() => {
      setTimer((v) => {
        if (v >= 1) { decide(null); return 1; }
        return +(v + 1 / (6.5 * 16)).toFixed(3);
      });
    }, 1000 / 16);
    return () => { if (decideIv.current) clearInterval(decideIv.current); };
  }, [phase, alive]);

  /* ════ resolve ════ */
  useEffect(() => {
    if (!alive || phase !== "resolve" || !pending.current) return;
    const out = pending.current.outcome;
    const dir = pending.current.dir;
    price.current = out.c;
    setData((d) => [...d, out]);
    const to = setTimeout(() => evaluate(dir), 420);
    return () => clearTimeout(to);
  }, [phase, alive]);

  /* ════ battle clock ════ */
  useEffect(() => {
    if (!live || phase === "vs" || phase === "over") return;
    const iv = setInterval(() => setT((v) => v + 1), 1000);
    return () => clearInterval(iv);
  }, [live, phase]);

  function decide(dir: 0 | 1 | -1 | null) {
    if (phase !== "decide") return;
    if (decideIv.current) clearInterval(decideIv.current);
    pick.current = dir;
    setTimer(1);
    setPhase("resolve");
  }

  function evaluate(dir: 1 | -1) {
    const pk = pick.current;
    if (pk === dir) {                       /* ── CORRECT ── */
      const mult = (1 + 0.15 * combo) * (leverage ? 2 : 1);
      const crit = Math.random() < 0.18;
      const dmg = Math.round(R(22, 30) * mult * (crit ? 1.8 : 1));
      setLeverage(false);
      setCombo((c) => c + 1);
      setEnergy((e) => Math.min(6, e + 1));
      setAcc((a) => ({ ok: a.ok + 1, all: a.all + 1 }));
      setFlash({ id: Date.now(), ok: true });
      setVig({ id: Date.now(), c: "rgba(31,240,200,.5)" });
      setZone(null);
      const coinsGot = R(4, 9) * (leverage ? 2 : 1);
      setCoinsWon((c) => c + coinsGot);
      setCoinWay((w) => w + 1);
      fx("proj-hit", FOE.x - 20, FOE.y + 40, "#1ff0c8");
      setTimeout(() => { fx("impact", FOE.x, FOE.y + 30, "#1ff0c8"); fx("burst", FOE.x, FOE.y + 30, "#1ff0c8"); fx("shock", FOE.x, FOE.y + 30, "#1ff0c8"); }, 340);
      shake(0.7);
      flt(String(dmg), crit ? "#ffd14a" : "#b6fff0", 55, 26, true);
      if (crit) flt("КРИТ!", "#ffd14a", -30, 16, true);
      setEhp((e) => {
        const v = Math.max(0, e - dmg);
        if (!v) end(true);
        return v;
      });
    } else {                                /* ── WRONG / timeout ── */
      const raw = R(12, 20) + Math.round(enemy.atk / 8);
      setCombo(0); setLeverage(false);
      setAcc((a) => ({ ok: a.ok, all: a.all + 1 }));
      setFlash({ id: Date.now(), ok: false });
      setZone(null);
      const dmg = Math.max(0, raw - shield);
      if (shield > 0) { flt("БЛОК", "#63b3ff", -70, 60); setShield(0); }
      fx("proj-miss", HERO.x + 30, HERO.y - 30, "#ff5c6e");
      setTimeout(() => { fx("impact", HERO.x + 14, HERO.y - 40, "#ff5c6e"); fx("burst", HERO.x + 14, HERO.y - 40, "#ff5c6e"); }, 340);
      if (dmg > 0) {
        setVig({ id: Date.now(), c: "rgba(255,92,110,.6)" });
        shake(1.3);
        flt(`-${dmg}`, "#ff5c6e", -70, 60, true);
        setPhp((pp) => {
          const v = Math.max(0, pp - dmg);
          if (!v) end(false);
          return v;
        });
      } else shake(0.6);
    }
    // schedule next round
    setTimeout(() => {
      if (dead.current) return;
      setData((d) => {
        const g = genWalk(price.current, R(3, 5), Math.random() > 0.5 ? 0.25 : -0.25);
        price.current = g.end;
        return [...d, ...g.cs];
      });
      setRound((r) => r + 1);
      setPhase("stream");
    }, 1500);
  }

  function end(win: boolean) {
    dead.current = true;
    setPhase("over");
    setZone(null);
    const stars = php > 70 ? 3 : php > 35 ? 2 : 1;
    const coins = 110 + stars * 60 + acc.ok * 14;
    setTimeout(() => {
      if (win) onWin?.({ stars, coins, patternId: pending.current?.id ?? "bullEng", win: true });
      else onLose?.();
    }, 1100);
  }

  function useAbility(id: "an" | "sl" | "lev") {
    if (!alive) return;
    if (id === "an" && energy >= 2 && phase === "decide") {
      setEnergy((e) => e - 2); setReveal(pending.current?.dir ?? 1);
      flt("ИНСАЙД", "#63b3ff", 0, 30);
    }
    if (id === "sl" && energy >= 2 && !shield) {
      setEnergy((e) => e - 2); setShield(30);
      flt("Стоп-лосс выставлен", "#63b3ff", -30, 56);
    }
    if (id === "lev" && energy >= 3 && !leverage) {
      setEnergy((e) => e - 3); setLeverage(true);
      flt("Плечо ×2", "#ffe884", 20, 46);
    }
  }

  const pat = active ? P(active) : null;
  const mmss = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  const dirControls = {
    up: { id: 1 as const, label: "Лонг", c1: "#5cf09e", c2: "#0e9e58", I: TrendingUp, hint: "вверх" },
    down: { id: -1 as const, label: "Шорт", c1: "#ff8090", c2: "#d92740", I: TrendingDown, hint: "вниз" },
  };

  return (
    <motion.div animate={cam} className="relative flex h-full flex-col">
      {/* ─── top VS bar ─── */}
      <div className="relative z-20 flex items-start gap-1.5 px-2.5 pt-2.5">
        <Fighter name="NeoTrader" lvl={12} artPath="hero" hp={php} max={PMAX} c1="#5cf09e" c2="#17c46b" shield={shield} tint="#1ff0c8" />
        <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
          <span className="hd hd-thin text-[15px] leading-none">VS</span>
          <span className="well px-2 py-[2px] font-num text-[10px] font-semibold text-teal">{mmss}</span>
          <button onClick={onPause} className="pnl-soft grid h-6 w-6 place-items-center rounded-lg text-sky/80 active:scale-90">
            <Pause size={12} />
          </button>
        </div>
        <Fighter right name={enemy.name} lvl={level + 3} artPath={enemy.id} hp={ehp} max={EMAX} c1="#ff8fb6" c2="#d92740" tint={enemy.tint} />
      </div>

      {/* ─── stage: fighters ─── */}
      <div className="relative mx-2.5 mt-1.5 h-[188px] shrink-0 overflow-hidden rounded-[20px]"
        style={{ boxShadow: "inset 0 0 0 2px rgba(70,118,205,.45), 0 0 0 2.5px rgba(8,17,42,.9)" }}>
        <img src={ARENA_SRC} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,18,44,.35), rgba(7,16,38,.05) 40%, rgba(7,16,38,.55))" }} />

        {/* combo badge */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div key={combo}
              initial={{ scale: 0.3, opacity: 0, rotate: -14 }} animate={{ scale: 1, opacity: 1, rotate: -7 }} exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 440, damping: 13 }}
              className="absolute left-2 top-2 z-20">
              <div className="rounded-[12px] px-2.5 py-1"
                style={{ background: "linear-gradient(177deg,#ffe884,#ff9b1f)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.65), inset 0 -3px 0 #a8530a, 0 6px 16px -3px rgba(255,170,40,.7)" }}>
                <span className="hd hd-thin block text-[14px] leading-none">×{combo} СЕРИЯ</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* wave pips */}
        <div className="absolute left-1/2 top-2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#04081a]/55 px-2 py-1 backdrop-blur-sm">
          <span className="font-display text-[8px] font-black uppercase italic tracking-wider text-sky/70">Раунд</span>
          <span className="font-num text-[10px] font-bold text-teal">{round}</span>
        </div>

        {/* hero */}
        <motion.div className="absolute bottom-1.5 left-1 z-10" animate={hpY} transition={{ repeat: Infinity, duration: 4.4, ease: "easeInOut" }}>
          <div className="relative">
            <div className="absolute inset-[16%] rounded-full bg-teal/30 blur-xl" />
            <Art src={heroArt} alt="" className="relative h-[104px] w-[104px] -scale-x-100" />
            {shield > 0 && (
              <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-[8%] rounded-full border-2 border-sky/70"
                style={{ background: "radial-gradient(circle, transparent 55%, rgba(99,179,255,.22))", boxShadow: "0 0 18px rgba(99,179,255,.5)" }} />
            )}
          </div>
        </motion.div>

        {/* enemy */}
        <motion.div className="absolute right-1 top-1.5 z-10" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}>
          <motion.div animate={eScale} key={ehp}>
            <div className="relative">
              <div className="absolute inset-[10%] rounded-full blur-xl" style={{ background: `${enemy.tint}55` }} />
              <Art src={enemy.art} alt={enemy.name} className="relative h-[112px] w-[112px]" />
            </div>
          </motion.div>
          <span className="mx-auto -mt-1 block h-3 w-[76px] rounded-[50%] bg-black/45 blur-[5px]" />
        </motion.div>

        {/* combat fx layers */}
        {fxs.map((f) => (
          <span key={f.id}>
            {f.kind === "impact" && <Impact x={f.x} y={f.y} c={f.c} />}
            {f.kind === "burst" && <Burst x={f.x} y={f.y} c={f.c} />}
            {f.kind === "shock" && <Shock x={f.x} y={f.y} c={f.c} />}
            {f.kind === "proj-hit" && <Projectile from={{ x: HERO.x + 55, y: f.y + 40 }} to={{ x: f.x + 40, y: f.y - 22 }} c="#1ff0c8" />}
            {f.kind === "proj-miss" && <Projectile from={{ x: f.x - 40, y: f.y - 90 }} to={{ x: f.x + 8, y: f.y - 4 }} c="#ff5c6e" />}
          </span>
        ))}
        {flts.map((f) => <FloatText key={f.id} t={f.t} c={f.c} x={f.x} y={f.y} big={f.big} />)}

        {/* leverage flag */}
        {leverage && (
          <div className="absolute bottom-2 right-2 z-20 rounded-[10px] px-2 py-[3px] font-display text-[9px] font-black uppercase italic text-[#4a2a04]"
            style={{ background: "linear-gradient(177deg,#ffe884,#ff9b1f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.65)" }}>Плечо ×2 готово</div>
        )}
      </div>

      {/* ─── chart panel ─── */}
      <div className="relative z-10 mx-2.5 mt-2 flex-1 overflow-hidden rounded-[20px]"
        style={{ background: "linear-gradient(180deg,#0e2049,#0a1838)", boxShadow: "inset 0 0 0 2px rgba(70,118,205,.45), inset 0 -14px 30px rgba(4,10,30,.55)" }}>
        <ChartCanvas data={data} zone={zone} resolveFlash={flash} height={216} className="absolute inset-x-0 bottom-0 top-8" />

        {/* header strip */}
        <div className="absolute inset-x-0 top-0 z-10 flex h-8 items-center gap-2 px-2.5"
          style={{ background: "linear-gradient(180deg,rgba(6,14,36,.85),transparent)" }}>
          <span className="well flex items-center gap-1 rounded-full px-2 py-[2px]">
            <Coin s={12} />
            <motion.span key={coinsWon} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-num text-[10.5px] font-semibold text-gold">{coinsWon}</motion.span>
          </span>
          <span className="font-num text-[9.5px] font-semibold tracking-[.14em] text-sky/60">BTC / SIGNAL · 15s</span>
          <span className={cn("font-num text-[10px] font-bold", lastUp(data) ? "text-teal" : "text-coral")}>
            {data.length ? (data[data.length - 1].c * 210).toFixed(2) : "—"}
          </span>
          <div className="flex-1" />
          <Bolt s={13} /><span className="font-num text-[10.5px] font-semibold text-teal">{energy}/6</span>
        </div>

        {/* pattern hint card */}
        <AnimatePresence>
          {phase === "decide" && pat && (
            <motion.div key={`h${round}`}
              initial={{ x: -240, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="absolute left-2 top-10 z-20 flex max-w-[210px] items-center gap-2 rounded-[15px] p-2"
              style={{ background: "rgba(8,18,44,.88)", backdropFilter: "blur(6px)", boxShadow: "inset 0 0 0 1.5px rgba(255,209,74,.55), 0 8px 20px -6px rgba(0,0,0,.7)" }}>
              <span className="shrink-0 rounded-[11px] bg-gold/15 p-1.5"><PatternIcon id={pat.id} s={34} /></span>
              <div className="min-w-0">
                <div className="font-display text-[9px] font-black uppercase italic tracking-wide text-gold">Паттерн найден</div>
                <div className="font-display text-[12.5px] font-black leading-tight text-white">{pat.name}</div>
                <div className="font-body text-[9.5px] font-bold leading-tight text-sky/65">{pat.sub}</div>
              </div>
              {/* timer ring */}
              <div className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-[#0a1838]" style={{ boxShadow: "0 4px 10px rgba(0,0,0,.6), inset 0 0 0 2px rgba(70,118,205,.5)" }}>
                <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#0f2547" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke={timer > 0.7 ? "#ff5c6e" : timer > 0.4 ? "#ffd14a" : "#1ff0c8"}
                    strokeWidth="4" strokeLinecap="round" strokeDasharray={2 * Math.PI * 15} strokeDashoffset={2 * Math.PI * 15 * (1 - timer)} />
                </svg>
                <span className="font-num text-[10px] font-bold text-white">{Math.max(0, Math.ceil((1 - timer) * 6.5))}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {vig && <Vignette id={vig.id} color={vig.c} />}
        <AnimatePresence>
          {coinWay > 0 && <CoinFly key={coinWay} from={{ x: CH_X, y: 140 }} to={{ x: 26, y: 14 }} n={7} />}
        </AnimatePresence>
      </div>

      {/* ─── controls ─── */}
      <div className="relative z-20 px-2.5 pb-2.5 pt-2">
        {/* long / short */}
        <div className="mb-2 grid grid-cols-2 gap-2">
          {[dirControls.up, dirControls.down].map((d) => {
            const ok = phase === "decide" && live;
            const hinted = reveal === d.id;
            return (
              <motion.button key={d.id} whileTap={ok ? { scale: 0.93, y: 5 } : undefined}
                onClick={() => ok && decide(d.id)}
                animate={hinted ? { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 0.9 } } : {}}
                className={cn("relative overflow-hidden rounded-[18px] py-2.5 transition-all", !ok && "saturate-[.3] brightness-[.55]")}
                style={{
                  background: `linear-gradient(177deg, ${d.c1}, ${d.c2} 80%)`,
                  boxShadow: `inset 0 2px 0 rgba(255,255,255,.65), inset 0 -7px 0 ${shade(d.c2, -32)}, inset 0 0 0 1.5px rgba(255,255,255,.3), ${hinted ? "0 0 0 3px #ffd14a, " : ""}0 7px 0 ${shade(d.c2, -46)}, 0 14px 24px -8px ${d.c1}66`,
                }}>
                <span className="pointer-events-none absolute left-1.5 right-1.5 top-1 h-[38%] rounded-full"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,.5),rgba(255,255,255,0))" }} />
                <span className="relative flex items-center justify-center gap-1.5">
                  <d.I size={19} strokeWidth={3.2} className="text-white drop-shadow" />
                  <span className="hd hd-thin text-[18px] uppercase">{d.label}</span>
                </span>
                {hinted && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#4a2a04]">
                    <span className="text-gold text-[10px] font-black">✓</span>
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* abilities */}
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: "an", n: "Аналитик", c: 2, I: BrainCircuit, c1: "#8ecaff", c2: "#2a7fd4", lip: "#124a85", ok: energy >= 2 && phase === "decide" },
            { id: "sl", n: "Стоп-лосс", c: 2, I: Shield, c1: "#35f7d2", c2: "#0bb7d8", lip: "#056a80", ok: energy >= 2 && !shield },
            { id: "lev", n: "Плечо ×2", c: 3, I: Percent, c1: "#ffe884", c2: "#ff9b1f", lip: "#a8530a", ok: energy >= 3 && !leverage },
          ] as const).map((a) => (
            <motion.button key={a.id} whileTap={a.ok ? { scale: 0.92 } : undefined} onClick={() => live && useAbility(a.id)}
              className={cn("relative flex items-center gap-1.5 rounded-[13px] px-2 py-1.5 transition-all", !a.ok && "saturate-[.35] brightness-[.6]")}
              style={{ background: "linear-gradient(178deg,#1e3d75,#112349)", boxShadow: "inset 0 1.5px 0 rgba(150,195,255,.3), inset 0 -3px 0 rgba(4,10,30,.6), inset 0 0 0 1.5px rgba(60,104,185,.5)" }}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px]"
                style={{ background: `linear-gradient(177deg,${a.c1},${a.c2})`, boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -3px 0 rgba(0,0,0,.3)" }}>
                <a.I size={14} strokeWidth={2.6} className="text-[#0a1735]" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block truncate font-display text-[9px] font-black uppercase italic leading-none text-white/85">{a.n}</span>
                <span className="mt-[3px] flex items-center gap-[2px]"><Bolt s={9} /><span className="font-num text-[9px] font-semibold text-white/85">{a.c}</span></span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ─── VS splash intro ─── */}
      <AnimatePresence>
        {phase === "vs" && live && (
          <motion.div className="absolute inset-0 z-[65] flex flex-col items-center justify-center bg-[#04081a]/92 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.15 }} transition={{ duration: .3 }}>
            <div className="flex items-center gap-4">
              <motion.div initial={{ x: -180, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 130, damping: 15 }}
                className="relative">
                <div className="absolute inset-[-10%] rounded-full bg-teal/25 blur-2xl" />
                <Art src={heroArt} alt="" className="relative h-24 w-24" />
              </motion.div>
              <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: [0, 1.5, 1], rotate: 0 }}
                transition={{ delay: .35, type: "spring", stiffness: 260, damping: 12 }}
                className="hd text-[40px] italic" style={{ color: "#ffd14a", WebkitTextStrokeColor: "#7a4404" }}>VS</motion.span>
              <motion.div initial={{ x: 180, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 130, damping: 15 }}
                className="relative">
                <div className="absolute inset-[-10%] rounded-full blur-2xl" style={{ background: `${enemy.tint}40` }} />
                <Art src={enemy.art} alt="" className="relative h-24 w-24" />
              </motion.div>
            </div>
            <motion.p initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .55 }}
              className="mt-4 text-center font-body text-[12px] font-bold text-sky/70">
              Читай паттерны и выбирай направление.<br />Верный прогноз — удар, ошибка — потери.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* end flash */}
      <AnimatePresence>
        {phase === "over" && php > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[60] grid place-items-center bg-[#04081a]/70 backdrop-blur-[3px]">
            <motion.span initial={{ scale: .4, rotate: -10 }} animate={{ scale: 1, rotate: -2 }} transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="hd text-[34px] uppercase" style={{ color: "#b6fff0", WebkitTextStrokeColor: "#06364a" }}>Ликвидирован!</motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════ helpers ═══════════ */

const lastUp = (d: Candle[]) => {
  const l = d[d.length - 1];
  return l ? l.c >= l.o : true;
};
const activeFor = (round: number, preferred?: string) =>
  round === 1 && preferred ? preferred : PATTERNS[(round * 63083) % PATTERNS.length].id;

const hpY = { y: [0, -5, 0] };
const eScale = { scale: [1, 0.93, 1.06, 1] };

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  return `#${((cl((n >> 16) + amt) << 16) | (cl(((n >> 8) & 255) + amt) << 8) | cl((n & 255) + amt)).toString(16).padStart(6, "0")}`;
}

const Projectile = ({ from, to, c }: { from: { x: number; y: number }; to: { x: number; y: number }; c: string }) => (
  <motion.span className="absolute z-30 rounded-full"
    style={{ width: 14, height: 14, background: "radial-gradient(circle,#fff 5%," + c + " 60%,transparent 75%)", boxShadow: `0 0 16px ${c}, 0 0 30px ${c}66` }}
    initial={{ left: from.x, top: from.y, scale: 0.4, opacity: 0 }}
    animate={{ left: to.x, top: to.y, scale: [0.4, 1.5, 1], opacity: [0, 1, 1] }}
    transition={{ duration: 0.4, ease: [0.3, 0.8, 0.6, 1] }} />
);

function Fighter({ name, lvl, artPath, hp, max, c1, c2, shield = 0, tint, right = false }: {
  name: string; lvl: number; artPath: string; hp: number; max: number; c1: string; c2: string; shield?: number; tint: string; right?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-start gap-1.5", right && "flex-row-reverse")}>
      <div className="relative shrink-0">
        <div className="h-[42px] w-[42px] overflow-hidden rounded-[13px]"
          style={{ background: `radial-gradient(circle at 50% 35%, ${tint}30, #0d1e44)`, boxShadow: "inset 0 2px 0 rgba(150,195,255,.3), 0 0 0 2px #0a1735, 0 0 0 3.5px rgba(70,118,205,.7)" }}>
          <img src={imgFor(artPath)} alt="" className="h-full w-full scale-[1.25] object-cover" />
        </div>
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-[5px] px-[5px] font-num text-[8.5px] font-bold leading-[12px] text-[#0a1735]"
          style={{ background: "linear-gradient(180deg,#ffe884,#ff9b1f)", boxShadow: "0 1px 3px rgba(0,0,0,.7)" }}>{lvl}</span>
        {shield > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex items-center gap-[1px] rounded-full bg-sky px-1 font-num text-[8px] font-bold text-[#06213f]"
            style={{ boxShadow: "0 2px 5px rgba(0,0,0,.5)" }}>
            <Shield size={7} fill="currentColor" />{shield}
          </span>
        )}
      </div>
      <div className={cn("min-w-0 flex-1 pt-0.5", right && "text-right")}>
        <div className="truncate font-display text-[10.5px] font-extrabold leading-tight text-white/90">{name}</div>
        <div className="mt-1"><Bar v={hp} max={max} c1={c1} c2={c2} h={13} label={`${Math.ceil(hp)}/${max}`} /></div>
      </div>
    </div>
  );
}

/* art mapping (avoids importing ART multiple times) */
import { ART } from "../art";
import { M as MM } from "../data/kit";
const heroArt = ART.hero;
const imgFor = (id: string) => (id === "hero" ? ART.hero : (id in ART ? (ART as Record<string, string>)[id] : MM("fomo").art));
const ARENA_SRC = ART.bgArena;
