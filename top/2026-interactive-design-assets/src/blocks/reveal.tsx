import { AnimatePresence, animate, motion, useAnimate } from "framer-motion";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { C, centerIn, makeCandles, useTimers, type Candle } from "./util";

/* ═════════════ 01 · SERVER REVEAL ═════════════ */
export function CandleReveal() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [rev, setRev] = useState(false);
  const [done, setDone] = useState(false);

  const past = useMemo(() => makeCandles(16, 7, 100, 0), []);
  const fut = useMemo(() => makeCandles(10, 21, past[past.length - 1].c, 0.45), [past]);
  const all = [...past, ...fut];
  const lo = Math.min(...all.map((c) => c.l));
  const hi = Math.max(...all.map((c) => c.h));
  const W = 270;
  const H = 220;
  const cw = W / all.length;
  const y = (v: number) => 10 + (1 - (v - lo) / (hi - lo)) * (H - 20);
  const split = past.length * cw;
  const last = past[past.length - 1].c;
  const pct = ((fut[fut.length - 1].c - last) / last) * 100;
  const up = pct >= 0;
  const line = fut.map((c, i) => `${i ? "L" : "M"}${split + i * cw + cw / 2},${y(c.c)}`).join(" ");

  const candle = (c: Candle, x: number) => {
    const col = c.c >= c.o ? C.bull : C.bear;
    return (
      <>
        <line x1={x + cw / 2} x2={x + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1} />
        <rect x={x + cw * 0.18} width={cw * 0.64} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={1} />
      </>
    );
  };

  const reveal = () => {
    if (rev) return;
    setRev(true);
    fx.sfx("reveal");
    fx.haptic(15);
    later(() => {
      setDone(true);
      fx.sfx(up ? "win" : "lose");
      fx.haptic([30, 40, 70]);
      later(() => {
        if (root.current && badge.current) {
          const p = centerIn(root.current, badge.current);
          pr.current?.burst(p.x, p.y, { count: 90, colors: [up ? C.bull : C.bear, C.acid, "#fff"], speed: 8 });
        }
      }, 90);
    }, fx.ms(1500));
  };

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-white/40">SCENARIO #0412</div>
          <div className="text-[15px] font-semibold">BTC / USDT · 4H</div>
        </div>
        <div className="rounded-full border border-white/10 px-2 py-1 font-mono text-[10px] text-white/60">t0 · decision</div>
      </div>

      <div className="mt-3 rounded-2xl border border-white/[.07] bg-white/[.02] p-2">
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,.05)" />
            ))}
            {past.map((c, i) => <g key={i}>{candle(c, i * cw)}</g>)}
            <line x1={split} x2={split} y1={0} y2={H} stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" />
            {fut.map((c, i) => (
              <motion.g
                key={i}
                initial={false}
                animate={rev ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                transition={{ duration: fx.t(0.3), delay: rev ? fx.t(0.45 + i * 0.09) : 0, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ transformBox: "fill-box", originY: 1 }}
              >
                {candle(c, split + i * cw)}
              </motion.g>
            ))}
            <motion.path
              d={line}
              fill="none"
              stroke={C.acid}
              strokeWidth={1.6}
              initial={false}
              animate={rev ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: fx.t(1.1), delay: rev ? fx.t(0.45) : 0 }}
            />
          </svg>

          <motion.div
            className="hatch absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 rounded-r-lg bg-[#141417]"
            style={{ left: `${(split / W) * 100}%` }}
            initial={false}
            animate={{ clipPath: rev ? "inset(0 0 0 100%)" : "inset(0 0 0 0%)" }}
            transition={{ duration: fx.t(0.9), ease: [0.7, 0, 0.2, 1] }}
          >
            <motion.div animate={fx.reduced ? {} : { y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Lock size={18} className="text-white/60" />
            </motion.div>
            <div className="font-mono text-[10px] font-bold tracking-widest text-white/70">SEALED</div>
            <div className="text-[10px] text-white/35">future hidden</div>
          </motion.div>

          <AnimatePresence>
            {rev && !done && (
              <motion.div
                className="absolute inset-y-0 w-[3px] bg-[#c8ff00] shadow-[0_0_18px_4px_rgba(200,255,0,.6)]"
                initial={{ left: `${(split / W) * 100}%` }}
                animate={{ left: "100%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: fx.t(0.9), ease: [0.7, 0, 0.2, 1] }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[.03] px-3 py-2 text-[12px]">
        <span className="text-white/45">Your call</span>
        <span className="rounded-md bg-[#22e58b]/15 px-2 py-0.5 font-mono text-[11px] font-bold text-[#22e58b]">LONG</span>
        <span className="text-white/45">Inval.</span>
        <span className="font-mono text-[11px]">63,090</span>
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              ref={badge}
              key="res"
              initial={{ scale: 2.4, opacity: 0, rotate: -14 }}
              animate={{ scale: 1, opacity: 1, rotate: -4 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 16 }}
              className="rounded-2xl px-6 py-3 text-center"
              style={{ background: up ? C.bull : C.bear, color: C.ink }}
            >
              <div className="font-mono text-[10px] font-bold tracking-widest">{up ? "THESIS HELD" : "INVALIDATED"}</div>
              <div className="tnum text-4xl font-bold">{up ? "+" : ""}{pct.toFixed(1)}%</div>
            </motion.div>
          ) : (
            <motion.p key="wait" exit={{ opacity: 0, scale: 0.9 }} className="max-w-[200px] text-center text-[13px] leading-snug text-white/40">
              {rev ? "Revealing…" : "The future is sealed on the server. Reveal after you commit."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={done ? () => { setRev(false); setDone(false); } : reveal}
        disabled={rev && !done}
        className="h-12 w-full rounded-2xl bg-[#c8ff00] font-semibold text-[#0b0b0d] transition active:scale-[.97] disabled:opacity-40"
      >
        {done ? "Replay" : "Reveal future"}
      </button>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 02 · HOLD TO LOCK ═════════════ */
export function HoldToLock() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const [p, setP] = useState(0);
  const [locked, setLocked] = useState(false);
  const prog = useRef(0);
  const holding = useRef(false);
  const raf = useRef(0);
  const last = useRef(0);
  const tick = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const step = (now: number) => {
    const f = fxr.current;
    const dt = Math.min(0.05, (now - last.current) / 1000);
    last.current = now;
    prog.current = Math.max(0, Math.min(1, prog.current + (holding.current ? (dt * f.speed) / 1.2 : -dt * 2.5)));
    const tk = Math.floor(prog.current * 10);
    if (holding.current && tk > tick.current) {
      f.sfx("tick");
      f.haptic(6);
    }
    tick.current = tk;
    setP(prog.current);
    if (prog.current >= 1) {
      holding.current = false;
      raf.current = 0;
      setLocked(true);
      f.sfx("lock");
      f.haptic([40, 30, 90]);
      if (root.current && btn.current) {
        const c = centerIn(root.current, btn.current);
        pr.current?.burst(c.x, c.y, { count: 80, shape: "spark", colors: [C.acid, "#fff"], speed: 11, gravity: 0, life: 38, size: 5 });
      }
      return;
    }
    raf.current = holding.current || prog.current > 0 ? requestAnimationFrame(step) : 0;
  };

  const down = () => {
    if (locked) return;
    holding.current = true;
    last.current = performance.now();
    if (!raf.current) raf.current = requestAnimationFrame(step);
  };
  const up = () => {
    holding.current = false;
  };

  const R = 84;
  const CIRC = 2 * Math.PI * R;
  const jitter = locked || fx.reduced ? 0 : Math.sin(performance.now() / 18) * p * 2.6;

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="font-mono text-[10px] text-white/40">DECISION WORKSPACE</div>
      <div className="mt-2 space-y-2 rounded-2xl border border-white/[.07] bg-white/[.02] p-4 text-[13px]">
        {[
          ["Action", <span key="a" className="rounded-md bg-[#22e58b]/15 px-2 py-0.5 font-mono text-[11px] font-bold text-[#22e58b]">LONG BTC</span>],
          ["Entry", "64,210"],
          ["Invalidation", "62,900"],
          ["Risk", "1.0% equity"],
        ].map(([k, v]) => (
          <div key={k as string} className="flex items-center justify-between">
            <span className="text-white/45">{k}</span>
            <span className="tnum font-mono text-[12px]">{v}</span>
          </div>
        ))}
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        <AnimatePresence>
          {locked &&
            [0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute h-[150px] w-[150px] rounded-full border-2 border-[#c8ff00]"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: fx.t(0.9), delay: fx.t(i * 0.12), ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>
        <svg className="absolute" width={196} height={196} viewBox="0 0 196 196" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={98} cy={98} r={R} stroke="rgba(255,255,255,.08)" strokeWidth={6} fill="none" />
          <circle
            cx={98} cy={98} r={R} stroke={C.acid} strokeWidth={6} fill="none" strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - (locked ? 1 : p))}
            style={{ filter: `drop-shadow(0 0 ${6 + p * 10}px rgba(200,255,0,${0.3 + p * 0.5}))` }}
          />
        </svg>
        <button
          ref={btn}
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              down();
            }
          }}
          onKeyUp={up}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Hold to lock decision"
          style={{
            transform: `translateX(${jitter}px) scale(${locked ? 1 : 1 - p * 0.07})`,
            touchAction: "none",
            background: locked ? C.acid : `radial-gradient(circle at 50% 35%, ${C.raised}, ${C.card})`,
            boxShadow: `0 0 ${p * 50}px rgba(200,255,0,${p * 0.35}), inset 0 1px 0 rgba(255,255,255,.08)`,
          }}
          className="relative grid h-[150px] w-[150px] select-none place-items-center rounded-full"
        >
          {locked ? (
            <motion.div
              initial={{ scale: 0.3, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 14 }}
              className="flex flex-col items-center text-[#0b0b0d]"
            >
              <Lock size={34} strokeWidth={2.5} />
              <div className="mt-1 text-[13px] font-bold tracking-widest">LOCKED</div>
            </motion.div>
          ) : (
            <div>
              <div className="tnum font-mono text-2xl font-bold">{Math.round(p * 100)}%</div>
              <div className="mt-1 text-[10px] tracking-[0.2em] text-white/50">HOLD TO LOCK</div>
            </div>
          )}
        </button>
      </div>

      <AnimatePresence>
        {locked && (
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[#c8ff00]"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: fx.t(0.5) }}
          />
        )}
      </AnimatePresence>

      <div className="h-12">
        {locked ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-white/40">sealed · 0x9f3a…c21e</span>
            <button
              onClick={() => { prog.current = 0; tick.current = 0; setP(0); setLocked(false); }}
              className="h-10 rounded-xl border border-white/10 px-4 text-[12px] text-white/70 active:scale-95"
            >
              Replay
            </button>
          </motion.div>
        ) : (
          <p className="pt-3 text-center text-[12px] text-white/35">Release early to cancel · no accidental trades</p>
        )}
      </div>
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 03 · SCORE BREAKDOWN ═════════════ */
const ROWS = [
  { k: "Thesis quality", v: 92 },
  { k: "Invalidation set", v: 100 },
  { k: "Risk sizing", v: 64 },
  { k: "Timing discipline", v: 81 },
];

export function ScoreBreakdown() {
  const fx = useFx();
  const [scope, anim] = useAnimate();
  const stamp = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const a = animate(0, 87, { duration: fx.t(1.5) || 0.01, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setScore(Math.round(v)) });
    later(() => setStage(1), fx.ms(1200));
    later(() => {
      setStage(2);
      fx.sfx("lock");
      fx.haptic([25, 30, 70]);
      if (!fx.reduced && scope.current) anim(scope.current, { x: [0, -7, 6, -4, 2, 0] }, { duration: 0.4 });
      later(() => {
        if (scope.current && stamp.current) {
          const c = centerIn(scope.current, stamp.current);
          pr.current?.burst(c.x, c.y, { count: 90, colors: [C.acid, C.bull, "#fff", C.iris], speed: 9 });
        }
      }, 80);
    }, fx.ms(2400));
    later(() => setStage(3), fx.ms(3000));
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const R = 58;
  const CIRC = 2 * Math.PI * R;

  return (
    <div ref={scope} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="font-mono text-[10px] text-white/40">PROCESS SCORE · #0412</div>
      <div className="relative mt-4 flex justify-center">
        <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={75} cy={75} r={R} stroke="rgba(255,255,255,.07)" strokeWidth={10} fill="none" />
          <circle cx={75} cy={75} r={R} stroke={C.acid} strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - score / 100)} />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="tnum text-5xl font-bold">{score}</div>
            <div className="font-mono text-[10px] text-white/40">/ 100</div>
          </div>
        </div>
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div
              ref={stamp}
              initial={{ scale: 3, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: -12, opacity: 1 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 17 }}
              className="absolute right-3 top-1 grid h-16 w-16 place-items-center rounded-xl border-[3px] border-[#c8ff00] bg-[#0b0b0d] text-3xl font-bold text-[#c8ff00]"
            >
              A−
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 space-y-3">
        {ROWS.map((r, i) => (
          <div key={r.k}>
            <div className="mb-1 flex justify-between text-[12px]">
              <span className="text-white/55">{r.k}</span>
              <span className="tnum font-mono">{stage >= 1 ? r.v : "—"}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[.06]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: r.v < 70 ? C.gold : C.bull }}
                initial={{ width: 0 }}
                animate={{ width: stage >= 1 ? `${r.v}%` : 0 }}
                transition={{ duration: fx.t(0.7), delay: fx.t(i * 0.12), ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: fx.t(0.45), ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-[#ffc83d]/25 bg-[#ffc83d]/[.07] p-3"
          >
            <div className="font-mono text-[10px] font-bold text-[#ffc83d]">PERSONAL INSIGHT</div>
            <p className="mt-1 text-[12.5px] leading-snug text-white/75">You sized before defining invalidation. Fix mission unlocked: “Stop first, size second.”</p>
          </motion.div>
        )}
      </AnimatePresence>
      <Particles ref={pr} />
    </div>
  );
}
