import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton } from "./Device";
import { Mascot } from "./Mascot";
import { ART, type ArtKey, ItemTile, RARITY, type Rarity, ChestArt, CoinArt, GemArt, StarArt, CrownArt, LockArt } from "./art";
import { sfx, Confetti, Rays, Twinkles, Pop } from "./Juice";

/* ================================================================== */
/*  SPIN WHEEL                                                         */
/* ================================================================== */
const SEG: { l: string; art: ArtKey; c: string; r: Rarity }[] = [
  { l: "50 Coins", art: "coin", c: "#1c2e58", r: "common" },
  { l: "2× XP", art: "potion", c: "#2a1d56", r: "epic" },
  { l: "5 Gems", art: "gem", c: "#13335a", r: "rare" },
  { l: "Freeze", art: "freeze", c: "#1c2e58", r: "rare" },
  { l: "100 Coins", art: "coin", c: "#2a1d56", r: "common" },
  { l: "Heart", art: "heart", c: "#13335a", r: "common" },
  { l: "20 Gems", art: "gem", c: "#1c2e58", r: "epic" },
  { l: "JACKPOT", art: "chest", c: "#4a2d06", r: "legendary" },
];

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function SpinWheel() {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<number | null>(null);
  const [conf, setConf] = useState(0);
  const [spins, setSpins] = useState(3);
  const timers = useRef<number[]>([]);

  const spin = () => {
    if (spinning || spins <= 0) return;
    setSpinning(true);
    setWin(null);
    setSpins((s) => s - 1);
    const k = Math.random() < 0.12 ? 7 : Math.floor(Math.random() * 7);
    const target = -(k * 45 + 22.5);
    const base = rot + 360 * 6;
    const delta = (((target - base) % 360) + 360) % 360;
    const final = base + delta;
    setRot(final);
    sfx("whoosh");
    // decelerating tick sounds
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let t = 0;
    for (let n = 0; n < 34; n++) {
      t += 40 + n * n * 0.9;
      timers.current.push(window.setTimeout(() => sfx("tick", false), t));
    }
    window.setTimeout(() => {
      setSpinning(false);
      setWin(k);
      setConf((c) => c + 1);
      sfx(k === 7 ? "levelup" : "chest");
    }, 4300);
  };

  const R = 130;
  return (
    <div className="relative flex flex-col items-center gap-4">
      <Confetti fire={conf} />
      <div className="relative" style={{ width: 300, height: 300 }}>
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 70%)", filter: "blur(20px)", opacity: 0.5 }} />
        {/* rim */}
        <div className="absolute inset-0 rounded-full" style={{ background: "linear-gradient(160deg,#ffe08a,#c7801a 40%,#6b3f05 70%,#ffcf5a)", boxShadow: "0 10px 0 #4a2a02, 0 30px 40px -16px #000" }} />
        {/* lights */}
        {Array.from({ length: 16 }, (_, i) => {
          const [x, y] = polar(150, 150, 141, i * 22.5);
          return (
            <motion.span
              key={i}
              className="absolute h-2.5 w-2.5 rounded-full"
              style={{ left: x - 5, top: y - 5, background: "#fff7cf", boxShadow: "0 0 8px #ffe08a" }}
              animate={{ opacity: spinning ? [1, 0.2, 1] : i % 2 ? [1, 0.35, 1] : [0.35, 1, 0.35] }}
              transition={{ duration: spinning ? 0.2 : 1.2, repeat: Infinity, delay: spinning ? (i % 2) * 0.1 : 0 }}
            />
          );
        })}
        <motion.svg
          viewBox="0 0 300 300"
          className="absolute inset-[14px]"
          style={{ width: 272, height: 272 }}
          animate={{ rotate: rot }}
          transition={{ duration: 4.2, ease: [0.12, 0.8, 0.12, 1] }}
        >
          <g transform="translate(-14 -14) scale(1.1)">
            {SEG.map((s, i) => {
              const [x1, y1] = polar(150, 150, R, i * 45);
              const [x2, y2] = polar(150, 150, R, (i + 1) * 45);
              const [tx, ty] = polar(150, 150, R * 0.64, i * 45 + 22.5);
              const A = ART[s.art];
              return (
                <g key={i}>
                  <path d={`M150 150 L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={s.c} stroke="#0a1226" strokeWidth="2" />
                  <path d={`M150 150 L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`} fill={RARITY[s.r].c} opacity={s.r === "legendary" ? 0.35 : 0.08} />
                  <g transform={`translate(${tx} ${ty}) rotate(${i * 45 + 22.5})`}>
                    <foreignObject x="-18" y="-30" width="36" height="36">
                      <A size={36} />
                    </foreignObject>
                    <text y="18" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff" fontFamily="JetBrains Mono, monospace">
                      {s.l}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </motion.svg>
        {/* hub */}
        <motion.button
          type="button"
          onClick={spin}
          whileTap={{ scale: 0.92 }}
          disabled={spinning || spins <= 0}
          className="absolute left-1/2 top-1/2 z-10 grid h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-[family-name:var(--font-display)] text-[15px] font-bold uppercase"
          style={{
            background: spins > 0 ? "linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #fff), var(--accent))" : "linear-gradient(180deg,#2a3858,#1a2440)",
            color: spins > 0 ? "var(--accent-ink)" : "#5f6f96",
            boxShadow: `0 5px 0 ${spins > 0 ? "var(--accent-edge)" : "#0a1122"}, 0 0 0 6px #0a1226, 0 0 0 9px #c7801a`,
          }}
        >
          {spinning ? "···" : spins > 0 ? "Spin" : "0"}
        </motion.button>
        {/* pointer */}
        <div className="absolute left-1/2 top-[-10px] z-20 -translate-x-1/2">
          <motion.svg width="40" height="48" viewBox="0 0 40 48" animate={spinning ? { rotate: [0, -14, 0] } : { rotate: 0 }} transition={{ duration: 0.12, repeat: spinning ? Infinity : 0 }} style={{ originY: 0.2 }}>
            <path d="M20 46 L4 12 A16 16 0 1 1 36 12 Z" fill="#8e0f2c" transform="translate(0 3)" />
            <path d="M20 46 L4 12 A16 16 0 1 1 36 12 Z" fill="#ff4d6a" />
            <circle cx="20" cy="14" r="6" fill="#fff" opacity=".85" />
          </motion.svg>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("h-3 w-8 rounded-full transition-colors", i < spins ? "" : "bg-[#1a2745]")} style={i < spins ? { background: "var(--accent)", boxShadow: "0 0 10px var(--accent-glow)" } : undefined} />
        ))}
        <button type="button" onClick={() => { setSpins(3); sfx("coin"); }} className="ml-2 font-mono text-[9px] uppercase tracking-widest text-ink-500 hover:text-white">
          refill
        </button>
      </div>
      <AnimatePresence>
        {win !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 320, damping: 16 }}
            className="absolute inset-x-4 top-[80px] z-30 flex flex-col items-center overflow-hidden rounded-3xl p-5"
            style={{ background: "linear-gradient(170deg,#1a2a52,#0a1226)", boxShadow: `inset 0 0 0 2px ${RARITY[SEG[win].r].c}, 0 30px 60px -20px #000` }}
          >
            <Rays color={`${RARITY[SEG[win].r].c}40`} />
            <div className="relative font-mono text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: RARITY[SEG[win].r].c }}>
              {RARITY[SEG[win].r].label} reward
            </div>
            <motion.div className="relative my-2" animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
              {(() => {
                const A = ART[SEG[win].art];
                return <A size={90} />;
              })()}
            </motion.div>
            <div className="relative font-[family-name:var(--font-display)] text-[24px] font-bold text-white">{SEG[win].l}</div>
            <GameButton className="relative mt-3" size="md" onClick={() => { setWin(null); sfx("coin"); }}>
              Collect
            </GameButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  CHEST OPENING SEQUENCE                                             */
/* ================================================================== */
const LOOT: { art: ArtKey; label: string; r: Rarity }[] = [
  { art: "gem", label: "×120 Gems", r: "rare" },
  { art: "potion", label: "XP Boost 30m", r: "epic" },
  { art: "crown", label: "Crown Frame", r: "legendary" },
];

function ChestSequence() {
  const [taps, setTaps] = useState(0);
  const [stage, setStage] = useState<"idle" | "burst" | "cards">("idle");
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [conf, setConf] = useState(0);
  const tap = () => {
    if (stage !== "idle") return;
    const n = taps + 1;
    setTaps(n);
    sfx(n >= 3 ? "chest" : "hit");
    if (n >= 3) {
      setStage("burst");
      setConf((c) => c + 1);
      setTimeout(() => setStage("cards"), 700);
    }
  };
  const reset = () => {
    setTaps(0);
    setStage("idle");
    setFlipped([false, false, false]);
  };
  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-2xl" style={{ background: "radial-gradient(circle at 50% 45%, #2a1d56 0%, #0a1226 70%)" }}>
      <Confetti fire={conf} />
      <Twinkles n={18} color="#ffe08a" />
      <AnimatePresence mode="wait">
        {stage !== "cards" ? (
          <motion.div key="chest" exit={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.4 }} className="relative flex flex-col items-center">
            <Rays color={`rgba(255,194,75,${0.08 + taps * 0.08})`} size="320%" />
            <motion.button
              type="button"
              onClick={tap}
              animate={
                stage === "burst"
                  ? { scale: [1, 1.4], opacity: [1, 0] }
                  : { rotate: taps ? [0, -6 * taps, 6 * taps, -4 * taps, 0] : [0, -2, 2, 0], y: [0, -8, 0] }
              }
              transition={stage === "burst" ? { duration: 0.6 } : { duration: taps ? 0.45 : 2.2, repeat: taps ? 0 : Infinity }}
              key={taps}
              className="relative"
              style={{ filter: `drop-shadow(0 0 ${10 + taps * 14}px rgba(255,194,75,${0.3 + taps * 0.2}))` }}
            >
              <ChestArt size={170} open={stage === "burst"} />
            </motion.button>
            <div className="relative mt-4 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} animate={i < taps ? { scale: [1, 1.4, 1] } : {}} className="h-3 w-3 rounded-full" style={{ background: i < taps ? "#ffc24b" : "#2a3858", boxShadow: i < taps ? "0 0 10px #ffc24b" : undefined }} />
              ))}
            </div>
            <div className="relative mt-2 font-[family-name:var(--font-display)] text-[16px] font-bold uppercase tracking-wider text-gold">
              {taps === 0 ? "Tap to crack open" : taps === 1 ? "Keep going!" : "One more!"}
            </div>
          </motion.div>
        ) : (
          <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex w-full flex-col items-center px-4">
            <div className="mb-4 font-[family-name:var(--font-display)] text-[20px] font-bold text-white">Tap cards to reveal</div>
            <div className="flex justify-center gap-3" style={{ perspective: 900 }}>
              {LOOT.map((l, i) => (
                <motion.button
                  type="button"
                  key={i}
                  initial={{ y: 200, rotate: (i - 1) * 25, opacity: 0 }}
                  animate={{ y: 0, rotate: (i - 1) * 4, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18, delay: i * 0.12 }}
                  onClick={() => {
                    if (flipped[i]) return;
                    const n = [...flipped];
                    n[i] = true;
                    setFlipped(n);
                    sfx(l.r === "legendary" ? "levelup" : "unlock");
                    if (l.r === "legendary") setConf((c) => c + 1);
                  }}
                  className="relative h-[168px] w-[108px]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <motion.div className="absolute inset-0" animate={{ rotateY: flipped[i] ? 180 : 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ transformStyle: "preserve-3d" }}>
                    <div
                      className="backface-hidden absolute inset-0 grid place-items-center rounded-2xl border-[3px] border-[#ffc24b]"
                      style={{ background: "repeating-linear-gradient(45deg,#2a1d56 0 10px,#22174a 10px 20px)", boxShadow: "0 6px 0 #9a6209" }}
                    >
                      <StarArt size={44} />
                    </div>
                    <div className="backface-hidden absolute inset-0" style={{ transform: "rotateY(180deg)" }}>
                      <ItemTile art={l.art} rarity={l.r} label={l.label} size={54} className="h-full" />
                    </div>
                  </motion.div>
                </motion.button>
              ))}
            </div>
            <div className="mt-6 w-full max-w-[260px]">
              <GameButton tone="gold" size="md" disabled={!flipped.every(Boolean)} onClick={reset}>
                Collect all
              </GameButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  BATTLE PASS                                                        */
/* ================================================================== */
const PASS: { free: ArtKey; prem: ArtKey; fl: string; pl: string }[] = [
  { free: "coin", prem: "gem", fl: "50", pl: "25" },
  { free: "heart", prem: "potion", fl: "Heart", pl: "2× XP" },
  { free: "coin", prem: "freeze", fl: "100", pl: "Freeze" },
  { free: "gem", prem: "chest", fl: "10", pl: "Chest" },
  { free: "potion", prem: "ticket", fl: "Boost", pl: "Ticket" },
  { free: "coin", prem: "crown", fl: "150", pl: "Frame" },
  { free: "freeze", prem: "rocket", fl: "Freeze", pl: "Skin" },
  { free: "gem", prem: "gem", fl: "20", pl: "200" },
  { free: "chest", prem: "trophy", fl: "Chest", pl: "Title" },
  { free: "coin", prem: "whale", fl: "250", pl: "Whale" },
];

function BattlePass() {
  const [tier, setTier] = useState(4);
  const [premium, setPremium] = useState(false);
  const [claimed, setClaimed] = useState<Record<string, boolean>>({ "f0": true, "f1": true });
  const [conf, setConf] = useState(0);
  const claim = (k: string, locked: boolean) => {
    if (locked || claimed[k]) {
      sfx("wrong");
      return;
    }
    setClaimed((c) => ({ ...c, [k]: true }));
    sfx("coin");
  };
  const Slot = ({ art, label, k, reached, prem }: { art: ArtKey; label: string; k: string; reached: boolean; prem: boolean }) => {
    const A = ART[art];
    const locked = !reached || (prem && !premium);
    const can = !locked && !claimed[k];
    return (
      <motion.button
        type="button"
        onClick={() => claim(k, locked)}
        animate={can ? { y: [0, -5, 0] } : { y: 0 }}
        transition={{ duration: 1.2, repeat: can ? Infinity : 0 }}
        whileTap={{ scale: 0.92 }}
        className="relative flex h-[92px] w-[80px] shrink-0 flex-col items-center justify-center rounded-2xl border-2"
        style={{
          borderColor: can ? (prem ? "#ffc24b" : "var(--accent)") : prem ? "#5a3f10" : "#22355e",
          background: prem ? "linear-gradient(170deg,#3a2a0e,#150f05)" : "linear-gradient(170deg,#16223f,#0b1224)",
          boxShadow: `0 4px 0 ${prem ? "#2a1d05" : "#0a1328"}${can ? `, 0 0 20px -4px ${prem ? "#ffc24b" : "var(--accent)"}` : ""}`,
        }}
      >
        <A size={40} className={cn(locked && "opacity-40 grayscale")} />
        <span className="mt-1 font-mono text-[9px] font-black text-white">{label}</span>
        {claimed[k] && (
          <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/55">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-bull text-[#02150b]">
              <Icon name="check" size={16} strokeWidth={4} />
            </span>
          </span>
        )}
        {locked && !claimed[k] && (
          <span className="absolute right-1 top-1">
            <LockArt size={16} />
          </span>
        )}
      </motion.button>
    );
  };
  return (
    <div className="relative">
      <Confetti fire={conf} />
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <CrownArt size={34} />
          <div>
            <div className="font-[family-name:var(--font-display)] text-[17px] font-bold text-white">Season 04 · Halving Hype</div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">ends in 12d 04h · tier {tier}/10</div>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => { setTier((t) => Math.min(10, t + 1)); sfx("levelup"); }} className="rounded-xl border-2 border-[#22355e] bg-[#101a33] px-3 py-2 font-mono text-[10px] font-black uppercase text-ink-200" style={{ boxShadow: "0 3px 0 #0a1328" }}>
            +1 tier
          </button>
          {!premium && (
            <div className="w-[170px]">
              <GameButton tone="gold" size="md" onClick={() => { setPremium(true); setConf((c) => c + 1); sfx("levelup"); }}>
                <CrownArt size={18} /> Unlock
              </GameButton>
            </div>
          )}
        </div>
      </div>
      <div className="no-scrollbar mask-fade-r overflow-x-auto pb-2">
        <div className="flex w-max flex-col gap-2 px-2">
          <div className="flex gap-2">
            <span className="grid w-14 shrink-0 place-items-center font-mono text-[9px] font-black uppercase tracking-widest text-ink-500">free</span>
            {PASS.map((p, i) => (
              <Slot key={i} art={p.free} label={p.fl} k={`f${i}`} reached={i < tier} prem={false} />
            ))}
          </div>
          <div className="relative flex gap-2">
            <span className="w-14 shrink-0" />
            <div className="absolute left-16 right-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-[#0a1122]" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.7)" }} />
            <motion.div className="absolute left-16 top-1/2 h-3 -translate-y-1/2 rounded-full" animate={{ width: tier * 88 - 44 }} style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)" }} />
            {PASS.map((_, i) => (
              <div key={i} className="relative grid w-[80px] shrink-0 place-items-center">
                <span
                  className="grid h-8 w-8 place-items-center rounded-full font-mono text-[11px] font-black"
                  style={{
                    background: i < tier ? "var(--accent)" : "#1a2745",
                    color: i < tier ? "var(--accent-ink)" : "#5f6f96",
                    boxShadow: `0 3px 0 ${i < tier ? "var(--accent-edge)" : "#0a1122"}`,
                  }}
                >
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <span className="grid w-14 shrink-0 place-items-center font-mono text-[9px] font-black uppercase tracking-widest text-gold">pro</span>
            {PASS.map((p, i) => (
              <Slot key={i} art={p.prem} label={p.pl} k={`p${i}`} reached={i < tier} prem />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  DAILY LOGIN                                                        */
/* ================================================================== */
const DAYS: { art: ArtKey; v: string }[] = [
  { art: "coin", v: "50" },
  { art: "gem", v: "5" },
  { art: "coin", v: "100" },
  { art: "potion", v: "2×" },
  { art: "gem", v: "15" },
  { art: "freeze", v: "×1" },
  { art: "chest", v: "EPIC" },
];

function DailyLogin() {
  const [claimed, setClaimed] = useState(3);
  const [fly, setFly] = useState(0);
  const today = claimed;
  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-2">
        {DAYS.map((d, i) => {
          const A = ART[d.art];
          const isToday = i === today;
          const got = i < claimed;
          const big = i === 6;
          return (
            <motion.button
              type="button"
              key={i}
              onClick={() => {
                if (!isToday) return sfx("wrong");
                setClaimed((c) => c + 1);
                setFly((f) => f + 1);
                sfx(big ? "levelup" : "coin");
              }}
              animate={isToday ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: isToday ? Infinity : 0 }}
              className={cn("relative flex flex-col items-center justify-center rounded-2xl border-2 py-2", big && "col-span-1 row-span-1")}
              style={{
                borderColor: isToday ? "var(--accent)" : got ? "#1c3a2e" : "#22355e",
                background: got ? "#0c1e19" : isToday ? "color-mix(in srgb, var(--accent) 14%, #101a33)" : big ? "linear-gradient(170deg,#3a2a0e,#150f05)" : "#101a33",
                boxShadow: `0 4px 0 ${got ? "#07130f" : isToday ? "var(--accent-edge)" : "#0a1328"}`,
              }}
            >
              <span className="font-mono text-[8px] font-black uppercase tracking-widest text-ink-500">day {i + 1}</span>
              <A size={big ? 44 : 34} className={cn(got && "opacity-40")} />
              <span className="font-mono text-[11px] font-black text-white">{d.v}</span>
              {got && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-bull text-[#02150b]" style={{ boxShadow: "0 3px 0 #0f7048" }}>
                    <Icon name="check" size={14} strokeWidth={4} />
                  </span>
                </span>
              )}
            </motion.button>
          );
        })}
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#22355e] p-1 text-center">
          <Pop value={`${claimed}/7`} className="font-mono text-[18px] font-black" color="var(--accent)" />
          <button type="button" onClick={() => setClaimed(3)} className="font-mono text-[8px] uppercase tracking-widest text-ink-500 hover:text-white">
            reset
          </button>
        </div>
      </div>
      <AnimatePresence>
        {fly > 0 && (
          <motion.div key={fly} className="pointer-events-none absolute inset-0 z-20">
            {Array.from({ length: 10 }, (_, k) => (
              <motion.span
                key={k}
                className="absolute left-1/2 top-1/2"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{ x: (Math.random() - 0.5) * 220, y: -120 - Math.random() * 80, opacity: 0, scale: 1 }}
                transition={{ duration: 1, delay: k * 0.03 }}
              >
                <CoinArt size={22} />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  LEVEL UP OVERLAY                                                   */
/* ================================================================== */
function LevelUp() {
  const [open, setOpen] = useState(false);
  const [lvl, setLvl] = useState(7);
  const [conf, setConf] = useState(0);
  const go = () => {
    setOpen(true);
    setLvl((l) => l + 1);
    setConf((c) => c + 1);
    sfx("levelup");
  };
  const word = "LEVEL UP!";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-4">
      <Mascot mood="celebrate" size={120} />
      <div className="w-full max-w-[240px]">
        <GameButton tone="violet" onClick={go}>
          Trigger level up
        </GameButton>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] grid place-items-center overflow-hidden p-6" style={{ background: "radial-gradient(circle, #2a1d56 0%, rgba(3,6,14,.96) 70%)" }} onClick={() => setOpen(false)}>
            <Confetti fire={conf} count={220} />
            <Rays color="rgba(155,107,255,.3)" size="140vmax" />
            <Twinkles n={30} color="#d8c4ff" />
            <div className="relative flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
              <div className="flex">
                {word.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: -80, opacity: 0, rotate: -20 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 380, damping: 12, delay: 0.1 + i * 0.05 }}
                    className="font-[family-name:var(--font-display)] text-[44px] font-bold text-white sm:text-[64px]"
                    style={{ textShadow: "0 6px 0 #4a1f9c, 0 0 40px rgba(155,107,255,.8)", whiteSpace: "pre" }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </div>
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 }} className="relative my-6 grid h-40 w-40 place-items-center">
                <div className="spin-slow absolute inset-0 rounded-[40px]" style={{ background: "conic-gradient(#9b6bff,#38e1ff,#2be08a,#ffc24b,#ff4d6a,#9b6bff)", padding: 5 }} />
                <div className="absolute inset-[6px] rounded-[36px]" style={{ background: "linear-gradient(170deg,#2a1d56,#0a1226)" }} />
                <div className="relative">
                  <div className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-violet">level</div>
                  <motion.div key={lvl} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="font-[family-name:var(--font-display)] text-[68px] font-bold leading-none text-white">
                    {lvl}
                  </motion.div>
                </div>
              </motion.div>
              <div className="mb-5 flex gap-3">
                {(["gem", "potion", "ticket"] as ArtKey[]).map((a, i) => {
                  const A = ART[a];
                  return (
                    <motion.div key={a} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 + i * 0.12 }} className="flex flex-col items-center rounded-2xl border-2 border-[#4a3a8a] bg-[#1a1440] px-3 py-2" style={{ boxShadow: "0 4px 0 #0d0a24" }}>
                      <A size={40} />
                      <span className="font-mono text-[10px] font-black text-white">{["+50", "2× XP", "Pass"][i]}</span>
                    </motion.div>
                  );
                })}
              </div>
              <div className="w-[240px]">
                <GameButton tone="violet" onClick={() => setOpen(false)}>
                  Continue
                </GameButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  STREAK MILESTONE                                                   */
/* ================================================================== */
function StreakMilestone() {
  const [d, setD] = useState(29);
  const milestone = d % 10 === 0 || d === 7 || d === 30;
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl py-5" style={{ background: "radial-gradient(circle at 50% 30%, #4a220c 0%, #0a1226 70%)" }}>
      {milestone && <Rays color="rgba(255,150,60,.3)" size="260%" />}
      <motion.div key={d} initial={{ scale: 0.4 }} animate={{ scale: milestone ? [1, 1.25, 1.1] : 1 }} transition={{ type: "spring", stiffness: 260, damping: 10 }} className="relative">
        {(() => {
          const F = ART.flame;
          return <F size={milestone ? 130 : 100} />;
        })()}
      </motion.div>
      <div className="relative text-center">
        <motion.div key={`n${d}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-[family-name:var(--font-display)] text-[54px] font-bold leading-none text-[#ffb347]" style={{ textShadow: "0 5px 0 #7a2e08" }}>
          {d}
        </motion.div>
        <div className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#ffcf9a]">day streak{milestone && " · milestone!"}</div>
      </div>
      <div className="relative flex gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
          <span key={i} className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-black" style={{ background: i < (d % 7 || 7) ? "linear-gradient(180deg,#ffb347,#ff6a3d)" : "#1a2745", color: i < (d % 7 || 7) ? "#3a1405" : "#4a5c85", boxShadow: i < (d % 7 || 7) ? "0 3px 0 #9a3a0e" : "0 3px 0 #0a1122" }}>
            {l}
          </span>
        ))}
      </div>
      <div className="relative w-[220px]">
        <GameButton tone="gold" size="md" onClick={() => { setD((x) => x + 1); sfx(d + 1 === 30 ? "levelup" : "correct"); }}>
          Extend streak
        </GameButton>
      </div>
    </div>
  );
}

export default function Rewards() {
  return (
    <Section id="rewards" index="" title="Reward Systems" kicker="Variable rewards · anticipation · celebration" count="6 systems">
      <Grid>
        <Cell title="Daily Spin Wheel" spec="4.2s decel · weighted jackpot" span="col-span-2 md:col-span-2 lg:col-span-3">
          <SpinWheel />
        </Cell>
        <Cell title="Chest Opening Sequence" spec="tap ×3 · card flip" span="col-span-2 md:col-span-2 lg:col-span-3">
          <ChestSequence />
        </Cell>
        <Cell title="Battle Pass Track" spec="free / pro rails · claim" span="col-span-2 md:col-span-4 lg:col-span-6">
          <BattlePass />
        </Cell>
        <Cell title="Daily Login Calendar" spec="7-day ladder" span="col-span-2">
          <DailyLogin />
        </Cell>
        <Cell title="Streak Milestone" spec="rays at 30" span="col-span-2">
          <StreakMilestone />
        </Cell>
        <Cell title="Level Up Takeover" spec="fullscreen · 220 confetti" span="col-span-2">
          <LevelUp />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="gold">variable-ratio schedule</Tag>
        <Tag tone="accent">anticipation → reveal → collect</Tag>
        <Tag tone="violet">rarity colour law</Tag>
        <Tag>
          <GemArt size={12} /> economy-safe caps
        </Tag>
      </div>
    </Section>
  );
}
