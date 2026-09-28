import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Btn, Cell, Grid, Section, Tag, Ring, Num, blip } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

/* ============ particle burst ============ */
export function Burst({ fire, colors = ["#2be08a", "#ffc24b", "#38e1ff", "#9b6bff", "#ff4d6a"], count = 26 }: { fire: number; colors?: string[]; count?: number }) {
  const parts = Array.from({ length: count }, (_, i) => i);
  return (
    <AnimatePresence>
      {fire > 0 && (
        <div key={fire} className="pointer-events-none absolute inset-0 z-30 grid place-items-center overflow-visible">
          {parts.map((i) => {
            const a = (i / count) * Math.PI * 2;
            const d = 50 + Math.random() * 70;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 30, opacity: 0, scale: 0.3, rotate: Math.random() * 360 }}
                transition={{ duration: 0.85 + Math.random() * 0.4, ease: "easeOut" }}
                className="absolute h-1.5 w-1.5 rounded-[2px]"
                style={{ background: colors[i % colors.length], boxShadow: `0 0 8px ${colors[i % colors.length]}` }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

/* ============ XP bar ============ */
function XpBar() {
  const [xp, setXp] = useState(320);
  const [lvl, setLvl] = useState(7);
  const [fire, setFire] = useState(0);
  const need = 500;
  const gain = () => {
    setXp((v) => {
      const n = v + 85;
      if (n >= need) { setLvl((l) => l + 1); setFire((f) => f + 1); blip("level"); return n - need; }
      blip("coin");
      return n;
    });
  };
  return (
    <div className="relative flex h-full flex-col justify-center gap-3">
      <Burst fire={fire} />
      <div className="flex items-center gap-3">
        <motion.div key={lvl} initial={{ scale: 0.6, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 420, damping: 14 }} className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: "linear-gradient(160deg,#ffe0a0,#e39312)", boxShadow: "0 5px 0 #9a6209, 0 12px 22px -8px rgba(255,194,75,.5), inset 0 2px 0 rgba(255,255,255,.55)" }}>
          <span className="tnum font-mono text-[19px] font-black text-[#2a1a02]">{lvl}</span>
          <span className="absolute -bottom-1.5 rounded-full bg-[#0b1224] px-1.5 font-mono text-[7px] font-black uppercase tracking-wider text-gold shadow-[0_0_0_2px_#0b1224]">lvl</span>
        </motion.div>
        <div className="flex-1">
          <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wider">
            <span className="text-ink-400">Experience</span>
            <span className="tnum font-bold" style={{ color: "var(--accent)" }}>{Math.round(xp)} / {need} XP</span>
          </div>
          <div className="relative h-5 overflow-hidden rounded-full sf-inset">
            <motion.div animate={{ width: `${(xp / need) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} className="shine relative h-full rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb,var(--accent) 45%,#000), var(--accent))", boxShadow: "0 0 18px -2px var(--accent-glow)" }} />
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-black tracking-widest text-white/80">
              {Math.round((xp / need) * 100)}%
            </div>
          </div>
        </div>
      </div>
      <Btn variant="accent" size="sm" icon="bolt" onClick={gain} full>+85 XP · complete drill</Btn>
    </div>
  );
}

/* ============ Streak ============ */
function Streak() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const [done, setDone] = useState([true, true, true, true, true, false, false]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="relative">
        <motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="absolute inset-0 rounded-full blur-xl" style={{ background: "radial-gradient(circle,#ffc24b90,transparent 70%)" }} />
        <div className="relative flex items-center gap-2">
          <Icon name="flame" size={42} className="flame text-gold" strokeWidth={1.6} style={{ fill: "rgba(255,194,75,.22)" }} />
          <span className="tnum font-mono text-[34px] font-black leading-none text-white glow-text">42</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => { const n = [...done]; n[i] = !n[i]; setDone(n); blip(n[i] ? "ok" : "tap"); }}
            className="grid h-8 w-8 place-items-center rounded-lg font-mono text-[9px] font-black transition-all"
            style={{
              background: done[i] ? "linear-gradient(180deg,#ffe0a0,#e39312)" : "linear-gradient(180deg,#131c33,#0a1020)",
              color: done[i] ? "#2a1a02" : "#4a5c85",
              boxShadow: done[i] ? "0 3px 0 #9a6209, inset 0 1px 0 rgba(255,255,255,.4)" : "inset 0 2px 5px rgba(0,0,0,.8)",
            }}
          >
            {done[i] ? <Icon name="check" size={12} strokeWidth={4} /> : d}
          </button>
        ))}
      </div>
      <span className="font-mono text-[9px] uppercase tracking-widest text-ink-500">streak freeze ×2 available</span>
    </div>
  );
}

/* ============ Hearts ============ */
function Hearts() {
  const [h, setH] = useState(3);
  const [t, setT] = useState(287);
  useEffect(() => {
    const id = setInterval(() => setT((v) => (v <= 0 ? 300 : v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.button
            key={i}
            onClick={() => { setH(i + 1); blip(i + 1 > h ? "ok" : "err"); }}
            animate={i < h ? { scale: [1, 1.14, 1] } : { scale: 1 }}
            transition={{ duration: 1.1, repeat: i < h ? Infinity : 0, delay: i * 0.12 }}
            className="relative"
          >
            <Icon name="heart" size={26} strokeWidth={2} className={i < h ? "text-bear" : "text-navy-500"} style={i < h ? { fill: "rgba(255,77,106,.85)", filter: "drop-shadow(0 0 8px rgba(255,77,106,.6))" } : { fill: "rgba(20,30,55,.8)" }} />
          </motion.button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-full sf-inset px-3 py-1.5">
        <Icon name="clock" size={13} className="text-ink-400" />
        <span className="tnum font-mono text-[11px] font-bold text-ink-200">{String(Math.floor(t / 60)).padStart(2, "0")}:{String(t % 60).padStart(2, "0")}</span>
        <span className="font-mono text-[8px] uppercase tracking-wider text-ink-500">to next ♥</span>
      </div>
      <Btn variant="gold" size="xs" icon="gem" onClick={() => setH(5)}>Refill · 350</Btn>
    </div>
  );
}

/* ============ Currency wallet ============ */
function Wallet() {
  const [gems, setGems] = useState(1280);
  const [coins, setCoins] = useState(8640);
  const [floats, setFloats] = useState<{ id: number; v: string; k: string }[]>([]);
  const add = (k: "g" | "c") => {
    const v = k === "g" ? 50 : 250;
    if (k === "g") setGems((x) => x + v); else setCoins((x) => x + v);
    const id = Date.now();
    setFloats((f) => [...f, { id, v: `+${v}`, k }]);
    setTimeout(() => setFloats((f) => f.filter((x) => x.id !== id)), 900);
    blip("coin");
  };
  return (
    <div className="relative flex h-full flex-col justify-center gap-2.5">
      {[{ k: "g" as const, i: "gem" as IconName, n: "Gems", v: gems, c: "#38e1ff" }, { k: "c" as const, i: "coin" as IconName, n: "Coins", v: coins, c: "#ffc24b" }].map((row) => (
        <button key={row.k} onClick={() => add(row.k)} className="relative flex items-center gap-3 rounded-2xl sf-raised hairline-strong p-3 transition-transform active:scale-[.98]">
          <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `linear-gradient(180deg, ${row.c}, color-mix(in srgb,${row.c} 55%,#000))`, boxShadow: `0 4px 0 color-mix(in srgb,${row.c} 40%,#000), inset 0 1px 0 rgba(255,255,255,.5)` }}>
            <Icon name={row.i} size={19} strokeWidth={2} className="text-[#06121b]" />
          </span>
          <div className="flex-1 text-left">
            <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">{row.n}</div>
            <div className="tnum font-mono text-[18px] font-black leading-tight" style={{ color: row.c }}><Num value={row.v} /></div>
          </div>
          <Icon name="plus" size={16} className="text-ink-400" strokeWidth={3} />
          <AnimatePresence>
            {floats.filter((f) => f.k === row.k).map((f) => (
              <motion.span key={f.id} initial={{ y: 0, opacity: 1 }} animate={{ y: -34, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.85 }} className="pointer-events-none absolute right-8 tnum font-mono text-[13px] font-black" style={{ color: row.c }}>
                {f.v}
              </motion.span>
            ))}
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}

/* ============ League badge ============ */
const TIERS = [
  { n: "Bronze", c: "#c98a4b", e: "#7a4b1c" },
  { n: "Silver", c: "#cfd8ea", e: "#7c8aa5" },
  { n: "Gold", c: "#ffc24b", e: "#9a6209" },
  { n: "Sapphire", c: "#38e1ff", e: "#0b6f8d" },
  { n: "Diamond", c: "#9b6bff", e: "#4a1f9c" },
];

function League() {
  const [t, setT] = useState(2);
  const [fire, setFire] = useState(0);
  const tier = TIERS[t];
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3">
      <Burst fire={fire} colors={[tier.c, "#fff", tier.e]} />
      <motion.div key={t} initial={{ scale: 0.5, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 340, damping: 15 }} className="relative">
        <span className="absolute inset-0 rounded-full blur-2xl" style={{ background: `radial-gradient(circle, ${tier.c}80, transparent 70%)` }} />
        <div className="shine relative grid h-[86px] w-[86px] place-items-center rounded-[26px]" style={{ background: `conic-gradient(from 210deg, ${tier.c}, ${tier.e}, ${tier.c})`, boxShadow: `0 7px 0 ${tier.e}, 0 18px 30px -10px ${tier.c}80, inset 0 2px 0 rgba(255,255,255,.5)` }}>
          <div className="grid h-[64px] w-[64px] place-items-center rounded-[20px]" style={{ background: "linear-gradient(180deg,#131f3a,#080d1c)", boxShadow: "inset 0 3px 8px rgba(0,0,0,.8)" }}>
            <Icon name="shield" size={30} strokeWidth={1.8} style={{ color: tier.c }} />
          </div>
        </div>
      </motion.div>
      <div className="text-center">
        <div className="font-mono text-[13px] font-black uppercase tracking-[0.22em]" style={{ color: tier.c }}>{tier.n}</div>
        <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">rank 4 of 30 · top 12%</div>
      </div>
      <div className="flex gap-1.5">
        {TIERS.map((x, i) => (
          <button key={x.n} onClick={() => { setT(i); if (i > t) setFire((f) => f + 1); blip(i > t ? "level" : "tap"); }} className="h-2.5 w-2.5 rounded-full transition-transform hover:scale-150" style={{ background: i <= t ? x.c : "#22304f", boxShadow: i === t ? `0 0 10px ${x.c}` : undefined }} />
        ))}
      </div>
    </div>
  );
}

/* ============ Leaderboard ============ */
const LB = [
  { n: "Kira_V", xp: 4820, d: 1, a: "#9b6bff" },
  { n: "0xNomad", xp: 4610, d: -1, a: "#38e1ff" },
  { n: "You", xp: 4380, d: 2, a: "#2be08a", me: true },
  { n: "Delta_One", xp: 4102, d: 0, a: "#ffc24b" },
  { n: "Satoshi_Jr", xp: 3990, d: -2, a: "#ff4d6a" },
];

function Leaderboard() {
  const [sorted, setSorted] = useState(LB);
  return (
    <div className="flex h-full flex-col gap-1.5">
      {sorted.map((r, i) => (
        <motion.div
          layout
          key={r.n}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className={cn("flex items-center gap-2.5 rounded-xl p-2 transition-colors", r.me ? "hairline-strong" : "hairline")}
          style={r.me ? { background: "color-mix(in srgb,var(--accent) 12%,#0d1528)", boxShadow: "inset 0 0 0 1px var(--accent-glow)" } : { background: "linear-gradient(180deg,#101a34,#0a1022)" }}
        >
          <span className="tnum w-5 text-center font-mono text-[11px] font-black" style={{ color: i === 0 ? "#ffc24b" : i === 1 ? "#cfd8ea" : i === 2 ? "#c98a4b" : "#5f6f96" }}>{i + 1}</span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[10px] font-black text-[#07101f]" style={{ background: `linear-gradient(160deg, ${r.a}, color-mix(in srgb,${r.a} 50%,#000))`, boxShadow: `0 2px 0 color-mix(in srgb,${r.a} 40%,#000)` }}>{r.n[0]}</span>
          <span className={cn("flex-1 truncate text-[11px] font-bold", r.me ? "text-white" : "text-ink-300")}>{r.n}</span>
          <span className={cn("font-mono text-[9px] font-bold", r.d > 0 ? "text-bull" : r.d < 0 ? "text-bear" : "text-ink-500")}>{r.d > 0 ? `▲${r.d}` : r.d < 0 ? `▼${-r.d}` : "–"}</span>
          <span className="tnum w-12 text-right font-mono text-[11px] font-black text-ink-200">{r.xp}</span>
        </motion.div>
      ))}
      <button onClick={() => { setSorted((s) => [...s].sort(() => Math.random() - 0.5)); blip("tap"); }} className="mt-auto font-mono text-[9px] uppercase tracking-widest text-ink-500 hover:text-[var(--accent)]">↻ simulate rank shuffle</button>
    </div>
  );
}

/* ============ Quests ============ */
function Quests() {
  const [q, setQ] = useState([
    { t: "Complete 3 drills", v: 3, m: 3, r: 50, claimed: false },
    { t: "Predict 5 candles", v: 3, m: 5, r: 80, claimed: false },
    { t: "Zero liquidations", v: 1, m: 1, r: 120, claimed: false },
  ]);
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {q.map((x, i) => {
        const full = x.v >= x.m;
        return (
          <div key={x.t} className="flex items-center gap-2.5 rounded-xl sf-base hairline p-2.5">
            <Ring value={(x.v / x.m) * 100} size={38} stroke={5} label={<span className="text-[9px]">{x.v}/{x.m}</span>} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[11px] font-bold text-ink-200">{x.t}</div>
              <div className="flex items-center gap-1 font-mono text-[8.5px] text-gold"><Icon name="gem" size={9} />+{x.r}</div>
            </div>
            <Btn
              variant={x.claimed ? "neutral" : full ? "gold" : "ghost"}
              size="xs"
              depth="sm"
              disabled={!full || x.claimed}
              onClick={() => { const n = [...q]; n[i] = { ...x, claimed: true }; setQ(n); blip("level"); }}
            >
              {x.claimed ? "Claimed" : full ? "Claim" : "Locked"}
            </Btn>
          </div>
        );
      })}
    </div>
  );
}

/* ============ Loot chest ============ */
function Chest() {
  const [state, setState] = useState<"idle" | "shaking" | "open">("idle");
  const [fire, setFire] = useState(0);
  const open = () => {
    if (state !== "idle") { setState("idle"); return; }
    setState("shaking");
    blip("tap");
    setTimeout(() => { setState("open"); setFire((f) => f + 1); blip("level"); }, 700);
  };
  return (
    <div className="relative grid h-full min-h-[190px] place-items-center">
      <Burst fire={fire} count={34} />
      <motion.button
        onClick={open}
        animate={state === "shaking" ? { rotate: [0, -6, 6, -6, 6, 0], scale: [1, 1.04, 1] } : state === "open" ? { scale: 0.9, y: 6 } : { y: [0, -6, 0] }}
        transition={state === "shaking" ? { duration: 0.7 } : state === "open" ? { duration: 0.3 } : { duration: 2.6, repeat: Infinity }}
        className="relative grid h-[92px] w-[92px] place-items-center rounded-3xl"
        style={{ background: "linear-gradient(170deg,#ffe0a0,#e39312 55%,#a86e10)", boxShadow: "0 8px 0 #7a4b08, 0 22px 34px -12px rgba(255,194,75,.55), inset 0 2px 0 rgba(255,255,255,.6)" }}
      >
        <Icon name="chest" size={44} strokeWidth={1.7} className="text-[#3a2405]" />
      </motion.button>
      <AnimatePresence>
        {state === "open" && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="absolute bottom-1 left-1/2 w-[86%] -translate-x-1/2 rounded-2xl sf-raised hairline-strong p-2.5 text-center">
            <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-gold">legendary drop</div>
            <div className="mt-0.5 text-[13px] font-black text-white">+500 Gems · Streak Freeze</div>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="absolute top-0 font-mono text-[9px] uppercase tracking-widest text-ink-500">tap to open</span>
    </div>
  );
}

/* ============ Combo meter ============ */
function Combo() {
  const [c, setC] = useState(0);
  const timer = useRef<number | null>(null);
  const hit = () => {
    setC((v) => Math.min(10, v + 1));
    blip("coin");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setC(0), 2200);
  };
  const mult = 1 + c * 0.5;
  const col = c > 7 ? "#ff4d6a" : c > 4 ? "#ffc24b" : "var(--accent)";
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <motion.div key={c} initial={{ scale: 1.4, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="tnum font-mono text-[38px] font-black leading-none" style={{ color: col, textShadow: `0 0 26px ${col}` }}>
        ×{mult.toFixed(1)}
      </motion.div>
      <div className="flex w-full gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <motion.span key={i} animate={{ opacity: i < c ? 1 : 0.16, scaleY: i < c ? 1 : 0.6 }} className="h-2.5 flex-1 rounded-sm" style={{ background: i < c ? col : "#22304f", boxShadow: i < c ? `0 0 8px ${col}` : undefined }} />
        ))}
      </div>
      <Btn variant="accent" size="sm" icon="target" onClick={hit} full>Correct answer</Btn>
      <span className="font-mono text-[8px] uppercase tracking-widest text-ink-500">decays after 2.2s</span>
    </div>
  );
}

/* ============ Achievement ============ */
function Achievement() {
  const [show, setShow] = useState(true);
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-3">
      <AnimatePresence>
        {show && (
          <motion.div initial={{ x: -40, opacity: 0, rotateY: -40 }} animate={{ x: 0, opacity: 1, rotateY: 0 }} exit={{ x: 40, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="shine relative w-full overflow-hidden rounded-2xl p-3" style={{ background: "linear-gradient(120deg,#1b2b4e,#0d1429)", boxShadow: "inset 0 0 0 1px rgba(255,194,75,.4), 0 14px 30px -12px rgba(255,194,75,.35)" }}>
            <div className="flex items-center gap-3">
              <motion.span animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity }} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: "linear-gradient(170deg,#ffe0a0,#e39312)", boxShadow: "0 4px 0 #9a6209" }}>
                <Icon name="medal" size={24} strokeWidth={1.8} className="text-[#3a2405]" />
              </motion.span>
              <div className="min-w-0">
                <div className="font-mono text-[8px] uppercase tracking-[0.25em] text-gold">achievement unlocked</div>
                <div className="truncate text-[13px] font-black text-white">Diamond Hands</div>
                <div className="font-mono text-[8.5px] text-ink-400">Held a position 30 days · +250 XP</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Btn variant="neutral" size="xs" onClick={() => setShow((s) => !s)}>{show ? "Dismiss" : "Replay unlock"}</Btn>
    </div>
  );
}

/* ============ Lesson summary ============ */
function Summary() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
        <Ring value={92} size={92} stroke={10} label={<span className="text-[20px]">92%</span>} sub="accuracy" />
      </motion.div>
      <div className="grid w-full grid-cols-3 gap-1.5">
        {[{ i: "bolt" as IconName, v: "+140", l: "XP" }, { i: "clock" as IconName, v: "4:12", l: "Time" }, { i: "flame" as IconName, v: "×1.5", l: "Combo" }].map((s) => (
          <div key={s.l} className="rounded-xl sf-inset hairline px-1.5 py-2">
            <Icon name={s.i} size={14} className="mx-auto mb-0.5" style={{ color: "var(--accent)" }} />
            <div className="tnum font-mono text-[12px] font-black text-white">{s.v}</div>
            <div className="font-mono text-[7px] uppercase tracking-wider text-ink-500">{s.l}</div>
          </div>
        ))}
      </div>
      <Btn variant="accent" size="sm" full iconRight="chevronRight">Continue</Btn>
    </div>
  );
}

export default function GameLayer() {
  return (
    <Section id="game" index="04" title="Game Layer" kicker="Progression · Economy · Reward psychology" count="11 assets">
      <Grid>
        <Cell title="XP & Level Up" spec="burst · spring bar" span="col-span-2"><XpBar /></Cell>
        <Cell title="Streak Engine" spec="7-day · freeze" span="col-span-2"><Streak /></Cell>
        <Cell title="Hearts / Lives" spec="live refill timer" span="col-span-2"><Hearts /></Cell>
        <Cell title="Currency Wallet" spec="float +values" span="col-span-2"><Wallet /></Cell>
        <Cell title="League Tiers" spec="5 ranks · promo fx" span="col-span-2"><League /></Cell>
        <Cell title="Leaderboard" spec="layout-animated" span="col-span-2"><Leaderboard /></Cell>
        <Cell title="Daily Quests" spec="ring + claim" span="col-span-2"><Quests /></Cell>
        <Cell title="Loot Chest" spec="shake → burst" span="col-span-2"><Chest /></Cell>
        <Cell title="Combo Multiplier" spec="decay 2.2s" span="col-span-2"><Combo /></Cell>
        <Cell title="Achievement Unlock" spec="3D flip-in" span="col-span-2"><Achievement /></Cell>
        <Cell title="Lesson Summary" spec="ring + stats" span="col-span-2"><Summary /></Cell>
        <Cell title="Reward Economy" spec="tokens" span="col-span-2">
          <div className="flex h-full flex-wrap content-center gap-1.5">
            <Tag tone="gold">gem · hard</Tag>
            <Tag tone="accent">coin · soft</Tag>
            <Tag tone="bear">heart · life</Tag>
            <Tag tone="aqua">xp · progress</Tag>
            <Tag tone="violet">crown · mastery</Tag>
            <Tag>freeze · insurance</Tag>
            <Tag tone="gold">chest · variable</Tag>
            <Tag tone="accent">combo · multiplier</Tag>
            <Tag>league · social</Tag>
          </div>
        </Cell>
      </Grid>
    </Section>
  );
}
