import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Shield, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { ArtImage, BoltIcon } from "../components/ui";
import { FloatNum } from "../components/fx";
import { VictoryModal, DefeatModal, PauseModal } from "../popups/Popups";
import { LevelNode, MONSTERS } from "../data/game";
import { cn } from "../utils/cn";

interface Candle { o: number; c: number; h: number; l: number; up: boolean }
interface Float { id: number; text: string; color: string; x: number }

const P_MAX = 120;
const R = (a: number, b: number) => Math.round(a + Math.random() * (b - a));

const freshCandles = () => {
  let p = 50;
  return Array.from({ length: 12 }, () => {
    const o = p; const c = p + R(-10, 11);
    p = c;
    return { o, c, h: Math.max(o, c) + R(1, 5), l: Math.min(o, c) - R(1, 5), up: c >= o };
  });
};

export default function Battle({ level, onExit, onWin }: { level: LevelNode; onExit: () => void; onWin: (stars: number, coins: number) => void }) {
  const enemy = MONSTERS.find((m) => m.id === level.enemyId) ?? MONSTERS[0];
  const E_MAX = Math.round(enemy.hp * 0.7);

  const [php, setPhp] = useState(P_MAX);
  const [ehp, setEhp] = useState(E_MAX);
  const [energy, setEnergy] = useState(4);
  const [shield, setShield] = useState(0);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<"fight" | "won" | "lost">("fight");
  const [paused, setPaused] = useState(false);
  const [telegraph, setTelegraph] = useState(false);
  const [enemyFlash, setEnemyFlash] = useState(0);
  const [playerFlash, setPlayerFlash] = useState(0);
  const [floats, setFloats] = useState<Float[]>([]);
  const [secs, setSecs] = useState(0);
  const [candles, setCandles] = useState<Candle[]>(freshCandles);

  const reset = () => {
    setPhp(P_MAX); setEhp(E_MAX); setEnergy(4); setShield(0); setCombo(0);
    setPhase("fight"); setSecs(0); setFloats([]); setTelegraph(false);
    setCandles(freshCandles());
  };

  const lastAct = useRef(0);
  const fighting = phase === "fight" && !paused;
  const stars = php > 84 ? 3 : php > 44 ? 2 : 1;
  const reward = 120 + stars * 40;

  const pushFloat = (text: string, color: string, x = R(-70, 70)) => {
    const id = Date.now() + Math.random();
    setFloats((f) => [...f, { id, text, color, x }]);
    setTimeout(() => setFloats((f) => f.filter((q) => q.id !== id)), 1000);
  };

  const pushCandle = (delta: number) =>
    setCandles((cs) => {
      const o = cs[cs.length - 1].c;
      const c = Math.max(8, Math.min(95, o + delta));
      const next = { o, c, h: Math.max(o, c) + R(1, 4), l: Math.min(o, c) - R(1, 4), up: c >= o };
      return [...cs.slice(-15), next];
    });

  /* energy regen + timer */
  useEffect(() => {
    const t = setInterval(() => {
      if (!fighting) return;
      setEnergy((e) => Math.min(6, e + 1 / 2));
      setSecs((s) => s + 0.5);
    }, 500);
    return () => clearInterval(t);
  }, [fighting]);

  /* enemy loop */
  useEffect(() => {
    if (!fighting) return;
    const iv = setInterval(() => {
      setTelegraph(true);
      setTimeout(() => {
        setTelegraph(false);
        const raw = R(10, 16) + Math.round(enemy.atk / 6);
        setShield((sh) => {
          const blocked = Math.min(sh, raw);
          const dmg = raw - blocked;
          if (blocked > 0) pushFloat("БЛОК", "#4ba3ff");
          if (dmg > 0) {
            setPhp((p) => {
              const v = Math.max(0, p - dmg);
              if (v <= 0) setPhase("lost");
              return v;
            });
            pushFloat(`-${dmg}`, "#ff5468", R(-90, -30));
            setPlayerFlash((f) => f + 1);
          }
          return Math.max(0, sh - raw);
        });
        pushCandle(-R(4, 9));
      }, 780);
    }, 3600);
    return () => clearInterval(iv);
  }, [fighting, enemy.atk]);

  const act = (cost: number, run: (mult: number) => void) => {
    if (!fighting || energy < cost) return;
    setEnergy((e) => e - cost);
    const now = Date.now();
    const c = now - lastAct.current < 2600 ? combo + 1 : 1;
    lastAct.current = now;
    setCombo(c);
    if (c >= 2) pushFloat(`КОМБО ×${c}`, "#ffcb40", R(-30, 30));
    run(1 + 0.08 * (c - 1));
  };

  const hitEnemy = (base: number, mult: number) => {
    const dmg = Math.round(base * mult);
    setEhp((e) => {
      const v = Math.max(0, e - dmg);
      if (v <= 0) setPhase("won");
      return v;
    });
    pushFloat(`-${dmg}`, "#ffe066", R(30, 90));
    setEnemyFlash((f) => f + 1);
    pushCandle(R(4, 8) + dmg / 10);
  };

  const CARDS = [
    { id: "long", name: "Лонг", cost: 2, icon: TrendingUp, c1: "#1cf5c7", c2: "#0891b2", run: (m: number) => hitEnemy(R(22, 30), m) },
    { id: "short", name: "Шорт", cost: 3, icon: TrendingDown, c1: "#ff6f9f", c2: "#e11d63", run: (m: number) => hitEnemy(R(30, 40), m) },
    { id: "sl", name: "Стоп-лосс", cost: 2, icon: Shield, c1: "#ffe066", c2: "#ff9a1f", run: () => { setShield((s) => Math.min(40, s + 26)); pushFloat("+ЩИТ", "#4ba3ff", R(-80, -20)); pushCandle(2); } },
    { id: "tp", name: "Тейк", cost: 4, icon: Target, c1: "#a37bff", c2: "#6c3df0", run: (m: number) => { hitEnemy(R(12, 16), m); setPhp((p) => Math.min(P_MAX, p + 14)); pushFloat("+14", "#42e98c", R(-80, -20)); } },
  ];

  const timer = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}`;

  return (
    <div className="relative flex flex-1 min-h-0 flex-col">
      {/* ======= top VS bar ======= */}
      <div className="relative z-20 flex items-center gap-2 px-3 pt-3">
        <FighterTag
          left
          name="NeoTrader"
          art={null}
          hp={php} max={P_MAX}
          bar="#42e98c"
          flash={playerFlash}
          shield={shield}
        />
        <div className="flex flex-col items-center gap-1.5">
          <div className="well rounded-full px-3 py-1 font-mono text-[11px] text-teal">{timer}</div>
          <button onClick={() => setPaused(true)} className="panel-soft grid h-8 w-8 place-items-center rounded-xl text-sky active:scale-90">
            <Pause size={14} />
          </button>
        </div>
        <FighterTag
          name={enemy.name}
          art={enemy.art} tint={enemy.tint}
          hp={ehp} max={E_MAX}
          bar="#ff5468"
          flash={enemyFlash}
        />
      </div>

      {/* ======= arena ======= */}
      <div className="relative mx-3 mt-3 flex-1 min-h-0 overflow-hidden rounded-[26px] panel">
        {/* grid */}
        <div className="absolute inset-0 opacity-[.13]"
          style={{ backgroundImage: "linear-gradient(#4ba3ff33 1px,transparent 1px),linear-gradient(90deg,#4ba3ff33 1px,transparent 1px)", backgroundSize: "100% 25%, 25% 100%" }} />

        {/* candles */}
        <Chart candles={candles} />

        {/* enemy */}
        <motion.div
          key={enemyFlash}
          className="absolute right-4 top-6"
          animate={{ y: [0, -10, 0], x: enemyFlash ? [0, -8, 8, -4, 0] : 0 }}
          transition={{ y: { duration: 3.4, repeat: Infinity, ease: "easeInOut" }, x: { duration: 0.4 } }}
        >
          <div className="relative">
            <div className="absolute inset-[-14px] rounded-full blur-xl" style={{ background: `${enemy.tint}44` }} />
            <ArtImage src={enemy.art} alt={enemy.name} tint={enemy.tint}
              className={cn("relative h-28 w-28 rounded-3xl ring-2", enemyFlash > 0 && "brightness-150")}
              style={{ "--tw-ring-color": enemy.tint } as React.CSSProperties} />
            <AnimatePresence>
              {telegraph && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} exit={{ scale: 0 }}
                  className="absolute -left-3 -top-3 grid h-9 w-9 place-items-center rounded-full bg-hp text-white ring-4 ring-[#0d1b3f]">
                  <Zap size={17} fill="currentColor" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* player token */}
        <motion.div
          key={"p" + playerFlash}
          className="absolute bottom-5 left-4"
          animate={{ x: playerFlash ? [0, -6, 6, 0] : 0 }}
        >
          <div className="relative">
            <div className="absolute inset-[-10px] rounded-full bg-teal/30 blur-xl" />
            <div className="relative grid h-16 w-16 place-items-center rounded-3xl"
              style={{ background: "linear-gradient(160deg,#31579f,#16295c)", boxShadow: "inset 0 2px 0 rgba(140,180,255,.4), inset 0 0 0 2px #19f2c4aa" }}>
              <TrendingUp size={26} className="text-teal" />
            </div>
            {shield > 0 && (
              <div className="absolute -right-2 -top-2 flex items-center gap-0.5 rounded-full bg-sky px-1.5 py-0.5 font-mono text-[9px] text-[#081430]" style={{ boxShadow: "0 3px 8px rgba(75,163,255,.5)" }}>
                <Shield size={9} fill="currentColor" />{shield}
              </div>
            )}
          </div>
        </motion.div>

        {/* combo badge */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div key={combo} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full px-4 py-1"
              style={{ background: "linear-gradient(180deg,#ffe066,#ff9a1f)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -4px 0 #b45d06, 0 8px 18px -4px rgba(255,170,40,.6)" }}>
              <span className="tstrok-sm font-display text-sm font-black italic">СЕРИЯ ×{combo}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* floating numbers */}
        {floats.map((f) => <FloatNum key={f.id} text={f.text} color={f.color} x={f.x} />)}
      </div>

      {/* ======= hand ======= */}
      <div className="relative z-20 px-3 pb-5 pt-3">
        {/* energy */}
        <div className="mb-2.5 flex items-center gap-2">
          <BoltIcon size={17} />
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="well h-3 flex-1 overflow-hidden">
                <motion.div
                  className="fillbar h-full"
                  animate={{ width: energy >= i + 1 ? "100%" : energy > i ? `${(energy - i) * 100}%` : "0%" }}
                  style={{ background: "linear-gradient(180deg,#9dffe9,#07bcd8)" }}
                />
              </div>
            ))}
          </div>
          <span className="font-mono text-[11px] text-teal">{Math.floor(energy)}/6</span>
        </div>

        {/* cards */}
        <div className="grid grid-cols-4 gap-2">
          {CARDS.map((card) => {
            const ok = fighting && energy >= card.cost;
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                whileTap={ok ? { scale: 0.9, y: 3 } : undefined}
                onClick={() => act(card.cost, card.run)}
                className={cn("panel-soft card-shine relative flex flex-col items-center gap-1 rounded-2xl px-1 pb-1.5 pt-2 transition-all", !ok && "saturate-[.4] brightness-[.7]")}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl text-[#081430]"
                  style={{ background: `linear-gradient(180deg,${card.c1},${card.c2})`, boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), inset 0 -4px 0 rgba(0,0,0,.3)" }}>
                  <Icon size={17} strokeWidth={2.6} />
                </span>
                <span className="font-display text-[10px] font-extrabold uppercase tracking-tight text-white/90 leading-none">{card.name}</span>
                <span className="flex items-center gap-0.5 rounded-full bg-[#081430] px-1.5 py-[1px]">
                  <BoltIcon size={10} />
                  <span className="font-mono text-[10px] text-white/90">{card.cost}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ======= popups ======= */}
      <VictoryModal open={phase === "won"} stars={stars} coins={reward} onContinue={() => onWin(stars, reward)} />
      <DefeatModal open={phase === "lost"} enemyName={enemy.name} onRetry={reset} onExit={onExit} />
      <PauseModal open={paused} onResume={() => setPaused(false)} onQuit={onExit} />
    </div>
  );
}

/* =================== pieces =================== */

function FighterTag({ name, art, tint = "#19f2c4", hp, max, bar, left = false, flash, shield = 0 }: {
  name: string; art: string | null; tint?: string; hp: number; max: number; bar: string; left?: boolean; flash: number; shield?: number;
}) {
  return (
    <div className={cn("flex flex-1 items-center gap-2", !left && "flex-row-reverse")}>
      <motion.div key={flash} animate={{ scale: flash ? [1, 1.15, 1] : 1 }} className="relative shrink-0">
        <div className="h-11 w-11 overflow-hidden rounded-2xl ring-2 ring-[#2c4a94]"
          style={{ background: "linear-gradient(160deg,#31579f,#16295c)", boxShadow: "inset 0 2px 0 rgba(140,180,255,.35)" }}>
          {art ? <ArtImage src={art} alt={name} tint={tint} className="h-full w-full" /> : <div className="grid h-full w-full place-items-center font-display text-base font-black text-teal">N</div>}
        </div>
        {shield > 0 && <Shield size={14} className="absolute -bottom-1 -right-1 text-sky" fill="#4ba3ff" />}
      </motion.div>
      <div className={cn("min-w-0 flex-1", !left && "text-right")}>
        <div className="truncate font-display text-[11px] font-extrabold text-white/90">{name}</div>
        <div className="well relative mt-1 h-3.5">
          <motion.div className="fillbar absolute inset-y-[3px] left-[3px] rounded-full"
            animate={{ width: `calc(${(hp / max) * 100}% - 6px)` }}
            transition={{ type: "spring", stiffness: 140, damping: 20 }}
            style={{ background: `linear-gradient(180deg, ${bar}cc, ${bar})`, boxShadow: `0 0 8px ${bar}66` }} />
          <span className="absolute inset-0 grid place-items-center font-mono text-[8.5px] text-white/85">{Math.ceil(hp)}/{max}</span>
        </div>
      </div>
    </div>
  );
}

function Chart({ candles }: { candles: Candle[] }) {
  const { min, max } = useMemo(() => ({
    min: Math.min(...candles.map((c) => c.l)) - 4,
    max: Math.max(...candles.map((c) => c.h)) + 4,
  }), [candles]);

  const W = 100, H = 100;
  const Y = (v: number) => H - ((v - min) / (max - min)) * 78 - 12;
  const bw = W / candles.length;
  const closes = candles.map((c, i) => `${i * bw + bw / 2},${Y(c.c)}`).join(" ");

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#19f2c4" stopOpacity=".22" /><stop offset="1" stopColor="#19f2c4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${closes} 100,100`} fill="url(#areag)" stroke="none" />
      {candles.map((c, i) => {
        const x = i * bw + bw / 2;
        const col = c.up ? "#19f2c4" : "#ff5468";
        return (
          <g key={i + c.c}>
            <line x1={x} y1={Y(c.h)} x2={x} y2={Y(c.l)} stroke={col} strokeWidth={0.45} opacity=".9" />
            <rect x={x - bw * 0.32} y={Math.min(Y(c.o), Y(c.c))} width={bw * 0.64} height={Math.max(1.2, Math.abs(Y(c.o) - Y(c.c)))} rx={0.5}
              fill={c.up ? col : col} opacity={c.up ? .95 : .9} />
          </g>
        );
      })}
      <polyline points={closes} fill="none" stroke="#9dffe9" strokeWidth={0.5} opacity=".8" strokeLinejoin="round" />
    </svg>
  );
}
