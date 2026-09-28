import { AnimatePresence, animate, motion, useAnimate } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFx } from "../fx/fx";
import { C, useTimers } from "./util";

/* ═════════════ 10 · ARENA CAROUSEL ═════════════ */
const SC = [
  { t: "Continue", s: "ETH · range break", c: C.acid, m: "8 min", xp: 40 },
  { t: "Daily Fix", s: "Fix: late invalidation", c: C.gold, m: "5 min", xp: 60 },
  { t: "Blind Scenario", s: "Asset & date hidden", c: C.iris, m: "10 min", xp: 80 },
  { t: "Conflict", s: "Evidence disagrees", c: C.bear, m: "12 min", xp: 90 },
  { t: "Rematch", s: "Beat your 71", c: C.bull, m: "6 min", xp: 50 },
];

export function ScenarioCarousel() {
  const fx = useFx();
  const sc = useRef<HTMLDivElement>(null);
  const [sx, setSx] = useState(0);
  const CW = 200;
  const GAP = 14;
  const pad = (286 - CW) / 2;
  const active = Math.max(0, Math.min(SC.length - 1, Math.round(sx / (CW + GAP))));
  const prev = useRef(0);

  useEffect(() => {
    if (active === prev.current) return;
    prev.current = active;
    fx.sfx("tick");
    fx.haptic(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const go = (i: number) => sc.current?.scrollTo({ left: i * (CW + GAP), behavior: fx.reduced ? "auto" : "smooth" });

  return (
    <div className="relative flex h-full flex-col pb-5 pt-2">
      <div className="flex items-end justify-between px-4">
        <div>
          <div className="font-mono text-[10px] text-white/40">gm, trader</div>
          <div className="text-3xl font-bold tracking-tight">Arena</div>
        </div>
        <div className="rounded-full bg-white/[.06] px-2.5 py-1 font-mono text-[10px]">🔥 4 · LV 8</div>
      </div>

      <div
        ref={sc}
        onScroll={(e) => setSx(e.currentTarget.scrollLeft)}
        className="no-scrollbar mt-6 flex snap-x snap-mandatory overflow-x-auto py-4"
        style={{ paddingLeft: pad, gap: GAP }}
      >
        {SC.map((s, i) => {
          const d = (i * (CW + GAP) - sx) / (CW + GAP);
          const ad = Math.min(1, Math.abs(d));
          return (
            <button
              key={s.t}
              onClick={() => go(i)}
              className="relative h-[300px] shrink-0 snap-center overflow-hidden rounded-[26px] border border-white/10 p-4 text-left"
              style={{
                width: CW,
                transform: fx.reduced ? undefined : `perspective(800px) translateY(${(-(1 - Math.min(1, ad * 2)) * 12).toFixed(1)}px) rotateY(${d * -20}deg) scale(${1 - ad * 0.13})`,
                opacity: 1 - ad * 0.45,
                background: `linear-gradient(165deg, ${s.c}44, ${C.card} 55%)`,
                boxShadow:
                  ad < 0.5
                    ? `0 0 0 2px ${s.c}, 0 22px 36px rgba(1,3,12,.75), 0 0 ${Math.round(34 * (1 - ad * 2))}px ${s.c}88, inset 0 1px 0 rgba(255,255,255,.2)`
                    : "0 10px 20px rgba(1,3,12,.5), inset 0 1px 0 rgba(255,255,255,.08)",
                transition: "box-shadow .25s ease",
              }}
            >
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl" style={{ background: s.c, opacity: 0.35, transform: `translateX(${d * 50}px)` }} />
              <div className="relative font-mono text-[10px] text-white/50">0{i + 1}</div>
              <svg viewBox="0 0 160 60" className="relative mt-8 w-full" style={{ transform: `translateX(${d * 24}px)` }}>
                <path d={`M0 ${40 - i * 3} C30 ${20 + i * 4} 50 50 80 30 S130 ${10 + i * 5} 160 ${18 + i * 2}`} fill="none" stroke={s.c} strokeWidth={2.5} />
              </svg>
              <div className="absolute inset-x-4 bottom-4">
                <div className="text-[22px] font-bold leading-tight">{s.t}</div>
                <div className="mt-1 text-[12px] text-white/50">{s.s}</div>
                <div className="mt-3 flex gap-2 font-mono text-[10px] text-white/60">
                  <span>{s.m}</span><span>·</span><span style={{ color: s.c }}>+{s.xp} XP</span>
                </div>
              </div>
            </button>
          );
        })}
        <div className="shrink-0" style={{ width: pad - GAP }} />
      </div>

      <div className="mt-2 flex justify-center gap-1.5">
        {SC.map((s, i) => (
          <motion.button key={i} aria-label={`Go to ${s.t}`} onClick={() => go(i)} className="h-1.5 rounded-full" animate={{ width: active === i ? 22 : 6, background: active === i ? SC[active].c : "rgba(255,255,255,.2)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
        ))}
      </div>
      <div className="flex-1" />
      <div className="px-4">
        <button className="h-12 w-full overflow-hidden rounded-2xl font-semibold text-[#0b0b0d] transition-colors duration-300" style={{ background: SC[active].c }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={active} className="block" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ duration: fx.t(0.18) }}>
              Start · {SC[active].t}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

/* ═════════════ 11 · LIVE LEADERBOARD ═════════════ */
type Pl = { id: string; name: string; score: number; you?: boolean; av: string };
const INIT: Pl[] = [
  { id: "a", name: "0xNakamo", score: 1840, av: C.iris },
  { id: "b", name: "degen.eth", score: 1795, av: C.bear },
  { id: "c", name: "satsuki", score: 1720, av: C.gold },
  { id: "you", name: "You", score: 1650, you: true, av: C.acid },
  { id: "d", name: "ramen_dca", score: 1610, av: C.bull },
  { id: "e", name: "wagmi_wen", score: 1580, av: "#5ac8fa" },
];

function Num({ v }: { v: number }) {
  const [d, setD] = useState(v);
  const from = useRef(v);
  useEffect(() => {
    const a = animate(from.current, v, { duration: 0.6, onUpdate: (x) => setD(Math.round(x)) });
    from.current = v;
    return () => a.stop();
  }, [v]);
  return <>{d.toLocaleString("en-US")}</>;
}

export function Leaderboard() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const [pl, setPl] = useState(INIT);
  const plRef = useRef(INIT);
  const [delta, setDelta] = useState<Record<string, number>>({});
  const [ver, setVer] = useState(0);
  const [boost, setBoost] = useState(0);

  const commit = (next: Pl[]) => {
    const before = new Map(plRef.current.map((x, i) => [x.id, i]));
    const sorted = [...next].sort((a, b) => b.score - a.score);
    const d: Record<string, number> = {};
    sorted.forEach((x, i) => { d[x.id] = (before.get(x.id) ?? i) - i; });
    plRef.current = sorted;
    setPl(sorted);
    setDelta(d);
    setVer((v) => v + 1);
    if (d.you > 0) { fxr.current.sfx("coin"); fxr.current.haptic(12); }
  };

  useEffect(() => {
    const id = setInterval(() => commit(plRef.current.map((p) => (p.you ? p : { ...p, score: p.score + Math.floor(Math.random() * 70) }))), fx.ms(1700));
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx.speed]);

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="font-mono text-[10px] text-white/40">WEEKLY TOURNAMENT</div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold">Leaderboard</div>
        <div className="font-mono text-[10px] text-white/40">ends 2d 04h</div>
      </div>
      <ul className="relative mt-5 space-y-2">
        {pl.map((p, i) => {
          const dl = delta[p.id] ?? 0;
          return (
            <motion.li
              key={p.id}
              layout={!fx.reduced}
              transition={{ type: "spring", stiffness: 450, damping: 38 }}
              className={`relative flex h-[52px] items-center gap-3 overflow-hidden rounded-2xl px-3 ${p.you ? "border border-[#c8ff00]/60 bg-[#c8ff00]/[.08]" : "bg-white/[.03]"}`}
            >
              {p.you && boost > 0 && (
                <motion.div key={boost} className="absolute inset-0 bg-[#c8ff00]" initial={{ opacity: 0.45 }} animate={{ opacity: 0 }} transition={{ duration: fx.t(0.6) }} />
              )}
              <span className={`tnum relative w-5 font-mono text-[13px] font-bold ${i === 0 ? "text-[#ffc83d]" : i === 1 ? "text-white/80" : i === 2 ? "text-[#d9925b]" : "text-white/35"}`}>{i + 1}</span>
              <span className="relative h-8 w-8 rounded-full" style={{ background: `linear-gradient(135deg, ${p.av}, ${p.av}55)` }} />
              <span className={`relative flex-1 text-[14px] ${p.you ? "font-bold" : ""}`}>{p.name}</span>
              <AnimatePresence>
                {dl !== 0 && (
                  <motion.span key={ver} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], scale: 1 }} transition={{ duration: fx.t(1.4) || 0.01 }} className={`relative font-mono text-[10px] font-bold ${dl > 0 ? "text-[#22e58b]" : "text-[#ff3b5c]"}`}>
                    {dl > 0 ? "▲" : "▼"}{Math.abs(dl)}
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="tnum relative w-14 text-right font-mono text-[13px]"><Num v={p.score} /></span>
            </motion.li>
          );
        })}
      </ul>
      <div className="flex-1" />
      <button
        onClick={() => { setBoost((b) => b + 1); fx.sfx("pop"); commit(plRef.current.map((p) => (p.you ? { ...p, score: p.score + 90 + Math.floor(Math.random() * 90) } : p))); }}
        className="h-12 rounded-2xl bg-[#c8ff00] font-semibold text-[#0b0b0d] active:scale-[.97]"
      >
        Finish a scenario (+XP)
      </button>
    </div>
  );
}

/* ═════════════ 12 · LIQUIDATION GLITCH ═════════════ */
type St = "live" | "glitch" | "rekt" | "protocol";

function LiveScreen({ pnl }: { pnl: number }) {
  const health = Math.max(2, 100 + pnl);
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0b0b0d] px-4 pb-5 pt-2">
      <div className="font-mono text-[10px] text-white/40">OPEN POSITION · SIMULATION</div>
      <div className="mt-3 rounded-2xl border border-white/[.07] bg-white/[.02] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold">ETH-PERP</span>
          <span className="rounded-md bg-[#ff3b5c]/15 px-2 py-0.5 font-mono text-[11px] font-bold text-[#ff3b5c]">LONG 20×</span>
        </div>
        <div className="tnum mt-4 text-5xl font-bold text-[#ff3b5c]">{pnl.toFixed(1)}%</div>
        <div className="mt-1 text-[12px] text-white/40">unrealized PnL</div>
        <div className="mt-5 flex justify-between text-[11px] text-white/45"><span>Margin health</span><span className="tnum">{health.toFixed(0)}%</span></div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[.07]">
          <div className={`h-full rounded-full bg-[#ff3b5c] ${health < 30 ? "animate-pulse" : ""}`} style={{ width: `${health}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
          {[["Entry", "3,412"], ["Mark", "3,251"], ["Liq.", "3,245"]].map(([k, v]) => (
            <div key={k}><div className="text-white/35">{k}</div><div>{v}</div></div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-[#ff3b5c]/30 bg-[#ff3b5c]/10 px-3 py-2 text-[12px] text-[#ff3b5c]">⚠ No invalidation set on this position</div>
    </div>
  );
}

export function LiquidationGlitch() {
  const fx = useFx();
  const [scope, anim] = useAnimate();
  const later = useTimers();
  const [st, setSt] = useState<St>("live");
  const [pnl, setPnl] = useState(-42);
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    if (st !== "live") return;
    const id = setInterval(() => setPnl((p) => Math.max(-97, p - (0.8 + Math.random() * 2.2))), fx.ms(220));
    return () => clearInterval(id);
  }, [st, fx]);
  useEffect(() => {
    if (st !== "glitch" || fx.reduced) return;
    const id = setInterval(() => setSeed((s) => s + 1), 45);
    return () => clearInterval(id);
  }, [st, fx.reduced]);

  const trigger = () => {
    setSt("glitch");
    fx.sfx("glitch");
    fx.haptic([80, 40, 140]);
    if (!fx.reduced && scope.current) anim(scope.current, { x: [0, -10, 9, -7, 6, -3, 0] }, { duration: 0.5 });
    later(() => { setSt("rekt"); fx.sfx("lose"); fx.haptic(120); }, fx.ms(850));
    later(() => setSt("protocol"), fx.ms(3000));
  };

  const rnd = (k: number) => {
    const v = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };

  return (
    <div ref={scope} className="relative h-full overflow-hidden">
      <LiveScreen pnl={pnl} />
      {st === "glitch" && (
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ filter: "drop-shadow(4px 0 0 #ff003c) drop-shadow(-4px 0 0 #00e5ff)" }}>
            <LiveScreen pnl={pnl} />
          </div>
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const top = rnd(k) * 90;
            return (
              <div key={k} className="absolute inset-0" style={{ clipPath: `inset(${top}% 0 ${Math.max(0, 100 - top - 4 - rnd(k + 9) * 8)}% 0)`, transform: `translateX(${(rnd(k + 3) - 0.5) * 40}px)`, filter: k % 2 ? "hue-rotate(140deg) saturate(3)" : "invert(1)" }}>
                <LiveScreen pnl={pnl} />
              </div>
            );
          })}
          <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,0,60,.12) 0 2px, transparent 2px 4px)", opacity: 0.5 + rnd(20) * 0.5 }} />
        </div>
      )}

      <AnimatePresence>
        {st === "rekt" && (
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-[#ff2a2a] text-[#0b0b0d]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: fx.t(0.08) }}>
            <div className="halftone absolute inset-0" />
            <div className="absolute inset-x-4 top-3 border-y-2 border-[#0b0b0d] py-1 text-center font-mono text-[10px] font-bold tracking-widest">THE SIGNAL ARENA TIMES</div>
            <motion.div initial={{ scale: 3, rotate: -14, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }} transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 16 }} className="relative text-[88px] font-bold leading-none tracking-tighter">
              REKT.
            </motion.div>
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: fx.t(0.3) }} className="relative mt-5 rotate-1 bg-[#0b0b0d] px-3 py-2 text-center text-[13px] font-bold text-[#f2efe6]">
              20× LEVERAGE. NO INVALIDATION.<br />A TIMELESS CLASSIC.
            </motion.div>
            <div className="relative mt-4 font-mono text-[11px] font-bold">−100% · position closed</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {st === "protocol" && (
          <motion.div className="absolute inset-0 flex flex-col bg-[#0e1411] px-4 pb-5 pt-2" initial={{ y: "100%" }} animate={{ y: 0 }} transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}>
            <div className="font-mono text-[10px] text-[#22e58b]/70">POST-LOSS PROTOCOL</div>
            <div className="relative flex flex-1 flex-col items-center justify-center">
              <motion.div className="absolute h-36 w-36 rounded-full bg-[#22e58b]/10" animate={fx.reduced ? {} : { scale: [1, 1.35, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="absolute h-24 w-24 rounded-full bg-[#22e58b]/15" animate={fx.reduced ? {} : { scale: [1, 1.25, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
              <div className="relative text-[15px] font-semibold text-[#22e58b]">Breathe</div>
            </div>
            <div className="space-y-2">
              {["60s cooldown — no revenge trades", "Write what invalidated the idea", "Review your sizing rule"].map((t, i) => (
                <motion.div key={t} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: fx.t(0.5 + i * 0.12) }} className="flex items-center gap-3 rounded-xl bg-white/[.04] px-3 py-2.5 text-[12.5px] text-white/75">
                  <span className="grid h-5 w-5 place-items-center rounded-md border border-[#22e58b]/50 font-mono text-[10px] text-[#22e58b]">{i + 1}</span>{t}
                </motion.div>
              ))}
            </div>
            <button onClick={() => { setSt("live"); setPnl(-42); }} className="mt-4 h-12 rounded-2xl border border-white/10 text-[13px] text-white/70 active:scale-95">Replay</button>
          </motion.div>
        )}
      </AnimatePresence>

      {st === "live" && (
        <div className="absolute inset-x-4 bottom-5">
          <button onClick={trigger} className="h-12 w-full rounded-2xl bg-[#ff3b5c] font-semibold text-[#0b0b0d] active:scale-[.97]">Simulate liquidation</button>
        </div>
      )}
    </div>
  );
}

/* ═════════════ 13 · BREAKING NEWS ═════════════ */
const WORDS = ["WHALE", "DUMPS", "12K", "BTC.", "RETAIL", "PANIC-BUYS", "THE", "TOP."];

function Stamp({ children, color }: { children: ReactNode; color: string }) {
  return (
    <motion.div initial={{ scale: 2.6, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: -10, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 16 }} className="rounded-lg border-[4px] px-3 py-1 text-3xl font-bold" style={{ borderColor: color, color }}>
      {children}
    </motion.div>
  );
}

export function BreakingNews() {
  const fx = useFx();
  const later = useTimers();
  const [stage, setStage] = useState(0);
  const [pick, setPick] = useState<null | "signal" | "noise">(null);

  useEffect(() => {
    later(() => { setStage(1); fx.sfx("whoosh"); }, fx.ms(100));
    later(() => { setStage(2); fx.sfx("lock"); fx.haptic(30); }, fx.ms(750));
    later(() => setStage(3), fx.ms(2000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (p: "signal" | "noise") => {
    setPick(p);
    fx.sfx(p === "noise" ? "win" : "lose");
    fx.haptic(p === "noise" ? [20, 30, 50] : [60, 40, 60]);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f2efe6] text-[#0b0b0d]">
      <div className="halftone pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative px-4 pt-2">
        <div className="border-y-2 border-[#0b0b0d] py-1 text-center font-mono text-[10px] font-bold tracking-[0.2em]">THE SIGNAL ARENA TIMES</div>
        <div className="mt-1 flex justify-between font-mono text-[9px]"><span>VOL. 26 · №412</span><span>PRICE: 1 STAR</span></div>
      </div>

      <div className="relative flex-1 px-4 pt-4">
        {stage >= 2 && (
          <motion.div initial={{ scale: 2, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: -3, opacity: 1 }} transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 15 }} className="inline-block bg-[#ff2a2a] px-2 py-0.5 font-mono text-[12px] font-bold text-white">
            ● BREAKING
          </motion.div>
        )}
        <h3 className="mt-3 flex flex-wrap gap-x-2 text-[34px] font-bold uppercase leading-[0.92] tracking-tight">
          {stage >= 2 &&
            WORDS.map((w, i) => (
              <motion.span
                key={w + i}
                initial={{ y: -50, opacity: 0, rotate: (i % 2 ? 1 : -1) * 12 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18, delay: 0.15 + i * 0.07 }}
                className={w === "12K" ? "bg-[#ff2a2a] px-1 text-white" : ""}
              >
                {w}
              </motion.span>
            ))}
        </h3>
        {stage >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: fx.t(0.6) }} className="relative mt-4 h-28 overflow-hidden border-2 border-[#0b0b0d] bg-[#e5e1d5]">
            <div className="halftone absolute inset-0" />
            <svg viewBox="0 0 260 100" className="relative h-full w-full" preserveAspectRatio="none">
              <motion.path d="M0 30 L40 25 L70 35 L100 22 L130 28 L150 60 L170 55 L190 85 L220 78 L260 92" fill="none" stroke="#ff2a2a" strokeWidth={3} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: fx.t(1.1), delay: fx.t(0.7) }} />
            </svg>
          </motion.div>
        )}

        <AnimatePresence>
          {pick && (
            <motion.div className="absolute inset-0 grid place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col items-center gap-3 bg-[#f2efe6]/85 px-4 py-6 backdrop-blur-[2px]">
                {pick === "noise" ? <Stamp color="#12a15c">NOISE ✓</Stamp> : <Stamp color="#ff2a2a">FOMO ✗</Stamp>}
                <p className="max-w-[220px] text-center text-[12.5px] font-medium leading-snug">Headlines trail price. Check on-chain flows before you react.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative px-4 pb-3">
        {stage >= 3 && !pick && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-2 text-center text-[12px] font-bold uppercase tracking-wider">Signal or noise?</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => choose("signal")} className="h-12 border-2 border-[#0b0b0d] font-bold uppercase active:translate-y-0.5">Signal</button>
              <button onClick={() => choose("noise")} className="h-12 bg-[#0b0b0d] font-bold uppercase text-[#f2efe6] active:translate-y-0.5">Noise</button>
            </div>
          </motion.div>
        )}
        {pick && (
          <button onClick={() => setPick(null)} className="h-12 w-full border-2 border-[#0b0b0d] font-bold uppercase active:translate-y-0.5">Again</button>
        )}
      </div>

      <div className="relative overflow-hidden bg-[#0b0b0d] py-1.5 font-mono text-[10px] text-[#f2efe6]">
        <div className="animate-marquee flex w-max gap-6 whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-6">
              <span>BTC 64,210 <b className="text-[#ff3b5c]">▼2.1%</b></span>
              <span>ETH 3,251 <b className="text-[#ff3b5c]">▼4.8%</b></span>
              <span>SOL 142 <b className="text-[#22e58b]">▲1.2%</b></span>
              <span>FUNDING −0.04%</span>
              <span>FEAR &amp; GREED 21</span>
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {stage === 1 && (
          <motion.div className="absolute inset-0 z-20" exit={{ opacity: 0 }}>
            {[C.bear, C.ink, C.acid, C.ink, C.bear].map((c, i) => (
              <motion.div key={i} className="absolute -inset-x-1/2 h-1/5" style={{ top: `${i * 20}%`, background: c, skewX: -20 }} initial={{ x: "-110%" }} animate={{ x: "110%" }} transition={{ duration: fx.t(0.55), delay: fx.t(i * 0.04), ease: [0.7, 0, 0.3, 1] }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
