import { AnimatePresence, animate, motion, useAnimate, useMotionValue } from "framer-motion";
import { Flame, Heart, Scale, Search, Shield, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { CONFETTI, useJuice } from "../fx/juice";
import { Mascot, type Mood } from "../duo/Mascot";
import { D, DuoButton } from "../duo/ui";
import { useTimers } from "./util";

/* ═════════════ 32 · BOSS BATTLE ═════════════ */
type Move = { k: string; d: number; c: string; I: LucideIcon; tip: string };
const MOVES: Move[] = [
  { k: "Set stop", d: 18, c: D.green, I: Shield, tip: "Defines where you're wrong" },
  { k: "Check data", d: 12, c: D.blue, I: Search, tip: "Evidence before action" },
  { k: "Size down", d: 15, c: D.purple, I: Scale, tip: "Survive the volatility" },
  { k: "FOMO buy", d: -1, c: D.red, I: Flame, tip: "Trap! Heals the boss" },
];
type BPhase = "idle" | "attack" | "boss" | "win" | "lose";
type Fly = { id: number; x: number; y: number; tx: number; ty: number; c: string; I: LucideIcon };

function BossSprite({ hurt, rage, dead }: { hurt: boolean; rage: boolean; dead: boolean }) {
  return (
    <svg viewBox="0 0 120 150" width="132" height="165" aria-label="Volatility boss" className="overflow-visible">
      <line x1={60} x2={60} y1={4} y2={30} stroke="#ff4b4b" strokeWidth={8} strokeLinecap="round" />
      <line x1={60} x2={60} y1={120} y2={146} stroke="#ff4b4b" strokeWidth={8} strokeLinecap="round" />
      <rect x={18} y={26} width={84} height={98} rx={22} fill={rage ? "#ff2d55" : "#ff4b4b"} />
      <rect x={18} y={98} width={84} height={26} rx={18} fill="#c81e3a" opacity={0.7} />
      <path d="M30 38 Q42 32 50 34" stroke="#fff" strokeOpacity={0.4} strokeWidth={5} fill="none" strokeLinecap="round" />
      {dead || hurt ? (
        <g stroke="#1b1f3b" strokeWidth={5} strokeLinecap="round">
          <path d="M34 58 l14 14 M48 58 l-14 14" />
          <path d="M72 58 l14 14 M86 58 l-14 14" />
        </g>
      ) : (
        <g>
          <circle cx={41} cy={66} r={11} fill="#fff" />
          <circle cx={79} cy={66} r={11} fill="#fff" />
          <circle cx={43} cy={68} r={5.5} fill="#1b1f3b" />
          <circle cx={77} cy={68} r={5.5} fill="#1b1f3b" />
          <path d="M28 48 L54 58" stroke="#1b1f3b" strokeWidth={6} strokeLinecap="round" />
          <path d="M92 48 L66 58" stroke="#1b1f3b" strokeWidth={6} strokeLinecap="round" />
        </g>
      )}
      {dead ? (
        <path d="M44 100 Q60 92 76 100" stroke="#1b1f3b" strokeWidth={5} fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <path d="M40 92 Q60 108 80 92 Z" fill="#1b1f3b" />
          <path d="M46 93 l5 6 5-6 5 6 5-6 5 6 4-5" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}

export function BossBattle() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const [bossScope, bossAnim] = useAnimate();
  const bossRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [hp, setHp] = useState(100);
  const [chip, setChip] = useState(100);
  const [you, setYou] = useState(3);
  const [phase, setPhase] = useState<BPhase>("idle");
  const [hurt, setHurt] = useState(false);
  const [flies, setFlies] = useState<Fly[]>([]);
  const [combo, setCombo] = useState(0);
  const [log, setLog] = useState("A wild Volatility appeared!");
  const hpRef = useRef(100);
  const youRef = useRef(3);

  const bossPos = () => (bossRef.current ? juice.local(bossRef.current) : { x: 143, y: 170 });

  const bossHitAnim = (crit: boolean) => {
    if (fx.reduced || !bossScope.current) return;
    bossAnim(bossScope.current, { x: [0, crit ? 22 : 12, -8, 4, 0], rotate: [0, crit ? 8 : 4, -3, 0], filter: ["brightness(3.5) saturate(0)", "brightness(1) saturate(1)"] }, { duration: 0.45 });
  };

  const bossTurn = () => {
    setPhase("boss");
    setLog("Volatility strikes back!");
    later(() => {
      if (!fx.reduced && bossScope.current) bossAnim(bossScope.current, { y: [0, -18, 60, 0], scale: [1, 1.05, 1.25, 1] }, { duration: 0.5 });
      later(() => {
        const n = youRef.current - 1;
        youRef.current = n;
        setYou(n);
        setCombo(0);
        juice.flash("#ff4b4b", 0.38);
        juice.shake(1.3);
        fx.sfx("lose");
        fx.haptic([70, 30, 50]);
        if (heartsRef.current) {
          const p = juice.local(heartsRef.current);
          juice.pop("−1 ♥", p.x, p.y + 10, "#ff6b6b", 26);
          juice.burst(p.x, p.y, { count: 20, colors: ["#ff4b4b", "#ff8a8a"], shape: "circle", speed: 5, size: 7 });
        }
        if (n <= 0) later(() => setPhase("lose"), fx.ms(500));
        else later(() => { setPhase("idle"); setLog("Your move."); }, fx.ms(450));
      }, fx.ms(300));
    }, fx.ms(650));
  };

  const impact = (m: Move) => {
    const b = bossPos();
    if (m.d < 0) {
      const heal = 14;
      hpRef.current = Math.min(100, hpRef.current + heal);
      setHp(hpRef.current);
      setChip(hpRef.current);
      setCombo(0);
      juice.pop(`+${heal}`, b.x, b.y - 50, "#79d634", 30);
      juice.pop("TRAP!", b.x, b.y - 90, "#ff4b4b", 22);
      juice.burst(b.x, b.y, { count: 30, colors: ["#79d634", "#b8f28a"], shape: "circle", speed: 4, gravity: -0.05 });
      fx.sfx("lose");
      setLog("FOMO feeds the boss. Ouch.");
      later(bossTurn, fx.ms(400));
      return;
    }
    const crit = Math.random() < 0.3;
    const nextCombo = combo + 1;
    const dmg = Math.round(m.d * (crit ? 2 : 1) * (1 + (nextCombo - 1) * 0.15));
    const n = Math.max(0, hpRef.current - dmg);
    hpRef.current = n;
    setHp(n);
    setCombo(nextCombo);
    later(() => setChip(n), fx.ms(550));
    setHurt(true);
    later(() => setHurt(false), fx.ms(320));
    bossHitAnim(crit);
    juice.shake(crit ? 1.5 : 0.8);
    juice.flash(crit ? "#ffc800" : "#ffffff", crit ? 0.45 : 0.22);
    juice.ring(b.x, b.y, crit ? "#ffc800" : m.c, crit);
    juice.pop(`−${dmg}`, b.x + (Math.random() - 0.5) * 50, b.y - 40, crit ? "#ffc800" : "#ffffff", crit ? 44 : 32);
    if (crit) juice.pop("CRITICAL!", b.x, b.y - 95, "#ff9600", 22);
    if (nextCombo >= 2) juice.pop(`${nextCombo}× COMBO`, b.x, b.y + 70, m.c, 18);
    juice.burst(b.x, b.y, { count: crit ? 70 : 36, shape: "spark", glow: true, colors: [m.c, "#fff", "#ffc800"], speed: crit ? 12 : 8, gravity: 0.05, life: 36 });
    fx.sfx(crit ? "lock" : "pop");
    fx.haptic(crit ? [40, 20, 60] : 25);
    setLog(crit ? `CRIT! ${m.k} hits for ${dmg}.` : `${m.k} hits for ${dmg}.`);
    if (n <= 0) {
      later(() => {
        setPhase("win");
        fx.sfx("win");
        fx.haptic([40, 40, 140]);
        const bb = bossPos();
        [0, 1, 2, 3].forEach((k) =>
          later(() => {
            juice.burst(bb.x + (Math.random() - 0.5) * 80, bb.y + (Math.random() - 0.5) * 80, { count: 50, colors: ["#ff4b4b", "#ffc800", "#fff"], speed: 10, shape: "circle", size: 9 });
            juice.shake(1.2);
            juice.flash("#fff", 0.3);
          }, fx.ms(k * 180))
        );
        later(() => juice.confetti(), fx.ms(800));
      }, fx.ms(350));
    } else later(bossTurn, fx.ms(450));
  };

  const attack = (i: number) => {
    if (phase !== "idle") return;
    const m = MOVES[i];
    const el = cardRefs.current[i];
    if (!el) return;
    setPhase("attack");
    const s = juice.local(el);
    const b = bossPos();
    fx.sfx("whoosh");
    fx.haptic(10);
    if (fx.reduced) {
      impact(m);
      return;
    }
    const id = Date.now();
    setFlies((f) => [...f, { id, x: s.x, y: s.y, tx: b.x, ty: b.y, c: m.c, I: m.I }]);
    later(() => {
      setFlies((f) => f.filter((x) => x.id !== id));
      impact(m);
    }, fx.ms(330));
  };

  const reset = () => {
    hpRef.current = 100;
    youRef.current = 3;
    setHp(100);
    setChip(100);
    setYou(3);
    setPhase("idle");
    setCombo(0);
    setLog("A wild Volatility appeared!");
  };

  const rage = hp < 35 && phase !== "win";

  return (
    <div className="relative flex h-full flex-col overflow-hidden px-4 pb-5 pt-2" style={{ background: rage ? "radial-gradient(circle at 50% 30%, #3a1330, #132250 70%)" : "radial-gradient(circle at 50% 30%, #22306e, #132250 70%)" }}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-black uppercase tracking-wide text-[#ff6b6b]">Boss · Volatility</div>
        <div ref={heartsRef} className="flex gap-0.5">
          {[0, 1, 2].map((k) => (
            <motion.span key={k} animate={k >= you ? { scale: 0.7, opacity: 0.25 } : { scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
              <Heart size={22} fill="#ff4b4b" strokeWidth={0} />
            </motion.span>
          ))}
        </div>
      </div>

      <div className="relative mt-2 h-6 overflow-hidden rounded-full border-2 border-[#0a1230] bg-[#0a1230]">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[#fff4b8]" animate={{ width: `${chip}%` }} transition={{ duration: fx.t(0.5), ease: "easeOut" }} />
        <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: hp < 35 ? "#ff4b4b" : "#ff9600" }} animate={{ width: `${hp}%` }} transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 26 }}>
          <div className="absolute left-2 right-2 top-[3px] h-[5px] rounded-full bg-white/35" />
        </motion.div>
        <span className="absolute inset-0 grid place-items-center text-xs font-black text-white drop-shadow">{hp} / 100</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        {rage && !fx.reduced && (
          <motion.div className="absolute h-48 w-48 rounded-full bg-[#ff4b4b] blur-3xl" animate={{ opacity: [0.15, 0.4, 0.15], scale: [0.9, 1.1, 0.9] }} transition={{ duration: 0.9, repeat: Infinity }} />
        )}
        <AnimatePresence>
          {phase !== "win" && (
            <motion.div key="boss" ref={bossRef} exit={{ scale: [1, 1.3, 0], rotate: [0, -10, 25], opacity: [1, 1, 0], transition: { duration: 0.6 } }}>
              <motion.div ref={bossScope}>
                <motion.div animate={fx.reduced ? {} : { y: [0, -8, 0], scaleY: [1, 1.03, 1] }} transition={{ duration: rage ? 0.7 : 1.6, repeat: Infinity, ease: "easeInOut" }}>
                  <BossSprite hurt={hurt} rage={rage} dead={false} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {phase === "win" && (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: fx.t(0.5) }}>
            <div className="flex">
              {"VICTORY".split("").map((ch, i) => (
                <motion.span key={i} className="text-5xl font-black text-[#ffc800]" style={{ textShadow: "0 4px 0 #b27f00" }} initial={{ y: -60, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.6 + i * 0.06 }}>
                  {ch}
                </motion.span>
              ))}
            </div>
            <Mascot mood="cheer" size={96} className="mt-4" />
            <div className="mt-2 text-base font-black text-white/70">+50 XP · Boss badge</div>
          </motion.div>
        )}
        {phase === "lose" && (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-[#132250]/80 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Mascot mood="sad" size={96} />
            <div className="mt-3 text-2xl font-black">Knocked out</div>
            <div className="mt-1 text-sm font-bold text-white/60">Avoid FOMO — it heals the boss.</div>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={log} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="mb-3 rounded-2xl bg-[#0a1230]/70 px-3 py-2 text-center text-sm font-black">
          {log}
        </motion.div>
      </AnimatePresence>

      {phase === "win" || phase === "lose" ? (
        <DuoButton full tone={phase === "win" ? "green" : "blue"} onClick={reset}>
          {phase === "win" ? "Continue" : "Try again"}
        </DuoButton>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {MOVES.map((m, i) => (
            <button
              key={m.k}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              disabled={phase !== "idle"}
              onClick={() => attack(i)}
              className="duo-card flex h-[62px] items-center gap-2 px-3 text-left disabled:opacity-50"
              style={{ borderColor: m.c, boxShadow: `0 4px 0 ${m.c}` }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${m.c}33`, color: m.c }}>
                <m.I size={20} strokeWidth={2.6} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-black leading-tight">{m.k}</span>
                <span className="block truncate text-[11px] font-bold text-white/50">{m.d > 0 ? `${m.d} dmg` : "trap"}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {flies.map((f) => (
        <motion.div
          key={f.id}
          className="pointer-events-none absolute left-0 top-0 z-40 -ml-6 -mt-6 grid h-12 w-12 place-items-center rounded-2xl text-white"
          style={{ background: f.c, boxShadow: `0 0 24px ${f.c}` }}
          initial={{ x: f.x, y: f.y, scale: 1, rotate: 0 }}
          animate={{ x: f.tx, y: f.ty, scale: 0.55, rotate: 540 }}
          transition={{ duration: fx.t(0.33) || 0.01, ease: [0.5, 0, 0.9, 0.6] }}
        >
          <f.I size={24} strokeWidth={3} />
        </motion.div>
      ))}
    </div>
  );
}

/* ═════════════ 33 · SPIN WHEEL ═════════════ */
const SEGS = [
  { t: "5 XP", c: "#1cb0f6" },
  { t: "20 💎", c: "#ce82ff" },
  { t: "Freeze", c: "#58cc02" },
  { t: "50 XP", c: "#ff9600" },
  { t: "2× XP", c: "#ff4b4b" },
  { t: "10 💎", c: "#1cb0f6" },
  { t: "JACKPOT", c: "#ffc800" },
  { t: "Chest", c: "#58cc02" },
];
const N = SEGS.length;
const A = 360 / N;

function segPath(i: number, r: number) {
  const a0 = ((i * A - 90) * Math.PI) / 180;
  const a1 = (((i + 1) * A - 90) * Math.PI) / 180;
  return `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
}

export function SpinWheel() {
  const fx = useFx();
  const juice = useJuice();
  const rot = useMotionValue(0);
  const [pointerScope, pointerAnim] = useAnimate();
  const wheelRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [win, setWin] = useState<number | null>(null);
  const [spins, setSpins] = useState(2);
  const lastSeg = useRef(0);

  const segAt = (v: number) => Math.floor((((360 - (v % 360)) % 360) + 360) % 360 / A) % N;

  const spin = () => {
    if (spinning || spins <= 0) return;
    setSpinning(true);
    setWin(null);
    setSpins((s) => s - 1);
    fx.sfx("whoosh");
    fx.haptic(15);
    const target = rot.get() + 360 * 6 + Math.random() * 360;
    animate(rot, target, {
      duration: fx.reduced ? 0.01 : 4.4 / fx.speed,
      ease: [0.12, 0.75, 0.14, 1],
      onUpdate: (v) => {
        const s = segAt(v);
        if (s !== lastSeg.current) {
          lastSeg.current = s;
          fx.sfx("tick");
          fx.haptic(3);
          if (pointerScope.current && !fx.reduced) pointerAnim(pointerScope.current, { rotate: [-28, 0] }, { duration: 0.14 });
        }
      },
      onComplete: () => {
        const idx = segAt(rot.get());
        setWin(idx);
        setSpinning(false);
        const jackpot = SEGS[idx].t === "JACKPOT";
        fx.sfx(jackpot ? "win" : "coin");
        fx.haptic(jackpot ? [40, 40, 140] : [20, 30, 60]);
        const c = wheelRef.current ? juice.local(wheelRef.current) : { x: 143, y: 230 };
        juice.ring(c.x, c.y, SEGS[idx].c, true);
        juice.flash(SEGS[idx].c, 0.25);
        juice.pop(SEGS[idx].t, c.x, c.y - 40, "#fff", jackpot ? 42 : 34);
        if (jackpot) {
          juice.rain();
          juice.confetti();
          juice.shake(1.2);
        } else juice.burst(c.x, c.y, { count: 50, shape: "star", glow: true, colors: [SEGS[idx].c, "#fff", "#ffc800"], speed: 8, gravity: 0.1, size: 10 });
      },
    });
  };

  const bulbs = Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return { x: 50 + Math.cos(a) * 49, y: 50 + Math.sin(a) * 49 };
  });

  return (
    <div className="relative flex h-full flex-col items-center px-4 pb-5 pt-2">
      <div className="text-2xl font-black">Daily Spin</div>
      <div className="text-sm font-bold text-white/55">{spins} spin{spins === 1 ? "" : "s"} left today</div>

      <div className="relative mt-6">
        <motion.div ref={pointerScope} className="absolute -top-4 left-1/2 z-10 -ml-4" style={{ originY: 0.2 }}>
          <svg width="32" height="40" viewBox="0 0 32 40">
            <path d="M16 38 L3 8 Q16 -4 29 8 Z" fill="#fff" stroke="#0a1230" strokeWidth={3} strokeLinejoin="round" />
            <circle cx={16} cy={12} r={5} fill="#ff4b4b" />
          </svg>
        </motion.div>

        <div ref={wheelRef} className="relative h-[248px] w-[248px] rounded-full bg-[#0a1230] p-3" style={{ boxShadow: "0 8px 0 #070d24, 0 0 0 6px #ffc800, 0 0 40px rgba(255,200,0,.25)" }}>
          {bulbs.map((b, i) => (
            <span
              key={i}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fff4b8]"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                boxShadow: "0 0 8px #ffc800",
                animation: fx.reduced ? undefined : `bulb ${spinning ? 0.25 : 1.2}s ${(i % 2) * (spinning ? 0.12 : 0.6)}s infinite`,
              }}
            />
          ))}
          <motion.svg viewBox="-100 -100 200 200" className="h-full w-full" style={{ rotate: rot }}>
            {SEGS.map((s, i) => (
              <g key={i}>
                <path d={segPath(i, 98)} fill={s.c} stroke="#0a1230" strokeWidth={3} />
                <path d={segPath(i, 98)} fill="url(#wshade)" />
                <text transform={`rotate(${i * A + A / 2}) translate(0 -64) rotate(0)`} textAnchor="middle" fontSize={s.t.length > 5 ? 11 : 14} fontWeight={900} fill="#fff" style={{ paintOrder: "stroke", stroke: "rgba(10,18,48,.55)", strokeWidth: 3 }}>
                  {s.t}
                </text>
              </g>
            ))}
            <defs>
              <radialGradient id="wshade">
                <stop offset="60%" stopColor="#000" stopOpacity={0} />
                <stop offset="100%" stopColor="#000" stopOpacity={0.25} />
              </radialGradient>
            </defs>
            <circle r={20} fill="#fff" stroke="#0a1230" strokeWidth={4} />
            <circle r={8} fill="#ffc800" />
          </motion.svg>
        </div>
      </div>

      <div className="relative mt-5 flex h-16 items-center justify-center">
        <AnimatePresence mode="wait">
          {win !== null ? (
            <motion.div key={win + "w"} initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 14 }} className="rounded-2xl px-5 py-2 text-2xl font-black text-white" style={{ background: SEGS[win].c, boxShadow: `0 4px 0 rgba(0,0,0,.3)` }}>
              You won {SEGS[win].t}!
            </motion.div>
          ) : (
            <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-base font-bold text-white/50">
              {spinning ? "Round and round…" : "Spin for a daily bonus"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1" />
      {spins > 0 ? (
        <DuoButton tone="yellow" full disabled={spinning} onClick={spin}>
          {spinning ? "Spinning…" : "Spin!"}
        </DuoButton>
      ) : (
        <DuoButton tone="blue" full disabled={spinning} onClick={() => { setSpins(2); setWin(null); }}>
          Come back tomorrow · reset
        </DuoButton>
      )}
    </div>
  );
}

/* ═════════════ 34 · FEVER COMBO ═════════════ */
export function FeverCombo() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const juice = useJuice();
  const btn = useRef<HTMLButtonElement>(null);
  const heat = useRef(0);
  const feverUntil = useRef(0);
  const lastTap = useRef(0);
  const [h, setH] = useState(0);
  const [fever, setFever] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const comboRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * fxr.current.speed;
      last = now;
      const inFever = now < feverUntil.current;
      if (!inFever) {
        heat.current = Math.max(0, heat.current - dt * 24);
        if (now - lastTap.current > 1200 / fxr.current.speed && comboRef.current) {
          comboRef.current = 0;
          setCombo(0);
        }
      } else heat.current = 100 * ((feverUntil.current - now) / (4000 / fxr.current.speed));
      setFever(inFever);
      setH(heat.current);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tap = () => {
    const now = performance.now();
    lastTap.current = now;
    const inFever = now < feverUntil.current;
    const c = comboRef.current + 1;
    comboRef.current = c;
    setCombo(c);
    const mult = inFever ? 5 : 1 + Math.floor(c / 10);
    const pts = 10 * mult;
    setScore((s) => s + pts);
    const p = btn.current ? juice.local(btn.current) : { x: 143, y: 420 };
    const tier = inFever ? CONFETTI[c % CONFETTI.length] : c > 20 ? "#ff9600" : c > 10 ? "#ffc800" : "#fff";
    juice.pop(`+${pts}`, p.x + (Math.random() - 0.5) * 120, p.y - 70 - Math.random() * 40, tier, Math.min(40, 20 + c * 0.6));
    juice.burst(p.x, p.y, { count: inFever ? 22 : 8, shape: "star", glow: true, colors: inFever ? CONFETTI : ["#ffc800", "#fff"], speed: inFever ? 8 : 5, gravity: 0.05, size: 9, life: 30 });
    fx.sfx(inFever ? "coin" : "pop");
    fx.haptic(inFever ? 12 : 6);
    if (inFever) juice.shake(0.35);
    if (!inFever) {
      heat.current = Math.min(100, heat.current + 8);
      if (heat.current >= 100) {
        feverUntil.current = now + 4000 / fx.speed;
        juice.flash("#ffc800", 0.5);
        juice.shake(1.4);
        juice.ring(p.x, p.y, "#ffc800", true);
        juice.pop("FEVER!", p.x, p.y - 180, "#ffc800", 48);
        juice.confetti();
        fx.sfx("win");
        fx.haptic([40, 30, 100]);
      }
    }
  };

  const mood: Mood = fever ? "cheer" : combo > 10 ? "happy" : combo > 0 ? "wow" : "idle";

  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden px-4 pb-5 pt-2">
      {fever && !fx.reduced && (
        <>
          <motion.div
            className="pointer-events-none absolute -inset-[60%]"
            style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,200,0,.14) 0deg 6deg, transparent 6deg 18deg)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[40px]"
            style={{ padding: 5, background: "conic-gradient(from var(--a,0deg), #58cc02, #ffc800, #ff4b4b, #ce82ff, #1cb0f6, #58cc02)", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
            animate={{ ["--a" as string]: ["0deg", "360deg"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      <div className="relative flex w-full items-center justify-between">
        <div className="text-sm font-black uppercase tracking-wide text-white/60">Speed round</div>
        <div className="tnum text-xl font-black text-[#ffc800]">{score.toLocaleString("en-US")}</div>
      </div>

      <div className="relative mt-3 flex w-full items-center gap-3">
        <Flame size={26} fill={fever ? "#ffc800" : "#ff9600"} strokeWidth={0} />
        <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-[#2a3a6e]">
          <div className="relative h-full rounded-full" style={{ width: `${h}%`, background: fever ? "linear-gradient(90deg,#58cc02,#ffc800,#ff4b4b,#ce82ff)" : "linear-gradient(90deg,#ff9600,#ffc800)" }}>
            <div className="absolute left-2 right-2 top-[3px] h-[5px] rounded-full bg-white/40" />
          </div>
        </div>
        <span className="w-10 text-right text-sm font-black">{fever ? "×5" : `×${1 + Math.floor(combo / 10)}`}</span>
      </div>

      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
        <Mascot mood={mood} size={110} />
        <div className="mt-2 h-20">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={combo}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="text-center"
            >
              <div className="tnum text-6xl font-black leading-none" style={{ color: fever ? CONFETTI[combo % CONFETTI.length] : "#fff", textShadow: "0 4px 0 rgba(10,18,48,.8)" }}>
                {combo}
              </div>
              <div className="text-sm font-black uppercase text-white/50">combo</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-3 text-sm font-bold text-white/50">{fever ? "FEVER! Tap tap tap!" : "Tap fast to fill the meter"}</div>
      </div>

      <button
        ref={btn}
        onPointerDown={tap}
        className="relative h-[120px] w-[120px] touch-none select-none rounded-full text-2xl font-black uppercase text-white"
        style={{ background: fever ? "#ffc800" : "#58cc02", boxShadow: `0 8px 0 ${fever ? "#b27f00" : "#58a700"}, 0 0 ${fever ? 50 : 0}px rgba(255,200,0,.6)` }}
      >
        Tap!
      </button>
    </div>
  );
}

/* ═════════════ 35 · VFX LAB ═════════════ */
type FxKey = "shake" | "flash" | "confetti" | "stars" | "shock" | "coins" | "damage" | "crit" | "level" | "hearts";
const LAB: { k: FxKey; label: string; tone: "green" | "blue" | "red" | "orange" | "yellow" | "purple"; mood: Mood }[] = [
  { k: "shake", label: "Shake", tone: "blue", mood: "wow" },
  { k: "flash", label: "Flash", tone: "yellow", mood: "wow" },
  { k: "confetti", label: "Confetti", tone: "green", mood: "cheer" },
  { k: "stars", label: "Stars", tone: "purple", mood: "happy" },
  { k: "shock", label: "Shockwave", tone: "blue", mood: "wow" },
  { k: "coins", label: "Coin rain", tone: "yellow", mood: "cheer" },
  { k: "damage", label: "Damage", tone: "red", mood: "sad" },
  { k: "crit", label: "Critical", tone: "orange", mood: "wow" },
  { k: "level", label: "Level up", tone: "green", mood: "cheer" },
  { k: "hearts", label: "Hearts", tone: "red", mood: "happy" },
];

export function VfxLab() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const target = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [last, setLast] = useState<string>("Tap an effect");

  const run = (k: FxKey, m: Mood, label: string) => {
    setMood(m);
    setLast(label);
    later(() => setMood("idle"), fx.ms(1400));
    const c = target.current ? juice.local(target.current) : { x: 143, y: 150 };
    switch (k) {
      case "shake":
        juice.shake(1.6);
        fx.haptic([30, 20, 30]);
        break;
      case "flash":
        juice.flash("#fff", 0.7);
        break;
      case "confetti":
        juice.confetti();
        fx.sfx("win");
        break;
      case "stars":
        juice.burst(c.x, c.y, { count: 60, shape: "star", glow: true, colors: ["#ffc800", "#fff", "#ce82ff"], speed: 9, gravity: 0.06, size: 12 });
        fx.sfx("coin");
        break;
      case "shock":
        [0, 1, 2].forEach((i) => later(() => juice.ring(c.x, c.y, i === 1 ? "#ffc800" : "#1cb0f6", true), i * 110));
        juice.shake(0.6);
        fx.sfx("lock");
        break;
      case "coins":
        juice.rain();
        fx.sfx("coin");
        break;
      case "damage":
        juice.pop("−37", c.x, c.y - 30, "#ff6b6b", 38);
        juice.flash("#ff4b4b", 0.3);
        juice.shake(0.8);
        fx.haptic(40);
        break;
      case "crit":
        juice.pop("CRITICAL!", c.x, c.y - 70, "#ff9600", 26);
        juice.pop("−99", c.x, c.y - 20, "#ffc800", 50);
        juice.flash("#ffc800", 0.5);
        juice.shake(1.7);
        juice.burst(c.x, c.y, { count: 80, shape: "spark", glow: true, colors: ["#ffc800", "#fff", "#ff9600"], speed: 13, gravity: 0, life: 36 });
        fx.haptic([50, 20, 80]);
        break;
      case "level":
        juice.ring(c.x, c.y, "#58cc02", true);
        juice.pop("LEVEL UP!", c.x, c.y - 50, "#79d634", 34);
        juice.burst(c.x, c.y, { count: 70, shape: "star", glow: true, colors: ["#58cc02", "#ffc800", "#fff"], speed: 10, gravity: 0.08, size: 11 });
        fx.sfx("win");
        break;
      case "hearts":
        for (let i = 0; i < 6; i++) later(() => juice.pop("♥", c.x + (Math.random() - 0.5) * 140, c.y + 20, CONFETTI[i % 2 ? 3 : 0] === "#58cc02" ? "#ff86b3" : "#ff4b4b", 26 + Math.random() * 14), i * 80);
        fx.sfx("pop");
        break;
    }
  };

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="text-center">
        <div className="text-2xl font-black">VFX Lab</div>
        <div className="text-sm font-bold text-white/55">Every effect in the kit, one tap each</div>
      </div>
      <div ref={target} className="relative mt-2 flex flex-1 flex-col items-center justify-center">
        <Mascot mood={mood} size={120} />
        <AnimatePresence mode="wait">
          <motion.div key={last} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="mt-2 text-base font-black text-white/70">
            {last}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {LAB.map((l) => (
          <DuoButton key={l.k} tone={l.tone} size="sm" onClick={() => run(l.k, l.mood, l.label)}>
            {l.label}
          </DuoButton>
        ))}
      </div>
    </div>
  );
}
