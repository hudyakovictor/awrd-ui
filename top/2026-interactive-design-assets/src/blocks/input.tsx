import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { C, centerIn, makeCandles } from "./util";

/* ═════════════ 04 · EVIDENCE SWIPE ═════════════ */
const CARDS = [
  { src: "ON-CHAIN", t: "Exchange inflow +4.2k BTC", d: "Coins moving to exchanges in 6h", bars: [3, 5, 4, 8, 9, 12] },
  { src: "DERIVATIVES", t: "Funding −0.04% while price flat", d: "Shorts are paying longs", bars: [6, 5, 4, 3, 2, 1] },
  { src: "STRUCTURE", t: "Higher low held at 62.9k", d: "Third successful retest", bars: [4, 6, 5, 7, 6, 8] },
  { src: "SENTIMENT", t: "Fear & Greed: 21", d: "Crowd leaning defensive", bars: [9, 7, 6, 4, 3, 2] },
  { src: "MACRO", t: "CPI print in 3 hours", d: "Scheduled event risk", bars: [2, 2, 3, 2, 9, 3] },
];

export function SwipeEvidence() {
  const fx = useFx();
  const [i, setI] = useState(0);
  const [votes, setVotes] = useState({ bull: 0, bear: 0 });
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const bullO = useTransform(x, [20, 110], [0, 1]);
  const bearO = useTransform(x, [-110, -20], [1, 0]);
  const tint = useTransform(x, [-160, 0, 160], ["rgba(255,59,92,.22)", "rgba(0,0,0,0)", "rgba(34,229,139,.22)"]);

  const fling = (dir: number) => {
    fx.sfx("whoosh");
    fx.haptic(14);
    animate(x, dir * 380, {
      duration: fx.t(0.28) || 0.01,
      ease: "easeIn",
      onComplete: () => {
        setVotes((v) => (dir > 0 ? { ...v, bull: v.bull + 1 } : { ...v, bear: v.bear + 1 }));
        x.set(0);
        setI((n) => n + 1);
      },
    });
  };
  const onEnd = (_: unknown, info: PanInfo) => {
    const v = info.offset.x + info.velocity.x * 0.15;
    if (Math.abs(v) > 110) fling(v > 0 ? 1 : -1);
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 28 });
  };

  const finished = i >= CARDS.length;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: tint }} />
      <div className="relative flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/40">EVIDENCE · {Math.min(i + 1, CARDS.length)}/{CARDS.length}</span>
        <span className="font-mono text-[10px]"><span className="text-[#22e58b]">▲{votes.bull}</span> <span className="text-[#ff3b5c]">▼{votes.bear}</span></span>
      </div>
      <div className="relative mt-2 flex gap-1">
        {CARDS.map((_, k) => (
          <motion.div key={k} className="h-1 flex-1 rounded-full" animate={{ background: k < i ? C.acid : "rgba(255,255,255,.1)" }} />
        ))}
      </div>

      <div className="relative mt-6 flex-1">
        {finished ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex h-full flex-col items-center justify-center text-center">
            <div className="font-mono text-[10px] text-white/40">YOUR READ</div>
            <div className="mt-2 text-3xl font-bold">{votes.bull >= votes.bear ? "Cautious long" : "Defensive"}</div>
            <div className="mt-4 flex w-48 overflow-hidden rounded-full">
              <motion.div className="h-2 bg-[#22e58b]" initial={{ width: 0 }} animate={{ width: `${(votes.bull / CARDS.length) * 100}%` }} transition={{ duration: fx.t(0.6) }} />
              <motion.div className="h-2 bg-[#ff3b5c]" initial={{ width: 0 }} animate={{ width: `${(votes.bear / CARDS.length) * 100}%` }} transition={{ duration: fx.t(0.6) }} />
            </div>
            <button onClick={() => { setI(0); setVotes({ bull: 0, bear: 0 }); }} className="mt-6 h-11 rounded-xl border border-white/10 px-5 text-[13px] text-white/70 active:scale-95">Restart</button>
          </motion.div>
        ) : (
          CARDS.slice(i, i + 3).map((c, k) => {
            const top = k === 0;
            return (
              <motion.div
                key={i + k}
                className="absolute inset-x-0 top-0 h-[300px] cursor-grab touch-none select-none rounded-3xl border border-white/10 bg-[#17171b] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,.8)] active:cursor-grabbing"
                style={top ? { x, rotate, zIndex: 10 } : { zIndex: 10 - k }}
                initial={false}
                animate={{ scale: 1 - k * 0.05, y: k * 14 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                drag={top ? "x" : false}
                dragMomentum={false}
                onDragEnd={top ? onEnd : undefined}
              >
                <span className="rounded-md bg-white/[.06] px-2 py-1 font-mono text-[10px] text-white/60">{c.src}</span>
                <div className="mt-5 text-[22px] font-bold leading-tight">{c.t}</div>
                <div className="mt-2 text-[13px] text-white/45">{c.d}</div>
                <div className="absolute inset-x-5 bottom-5 flex h-16 items-end gap-1.5">
                  {c.bars.map((b, j) => (
                    <div key={j} className="flex-1 rounded-t bg-white/10" style={{ height: `${b * 8}%` }} />
                  ))}
                </div>
                {top && (
                  <>
                    <motion.div style={{ opacity: bullO }} className="absolute left-5 top-14 -rotate-12 rounded-lg border-[3px] border-[#22e58b] px-2 py-0.5 text-2xl font-bold text-[#22e58b]">BULL</motion.div>
                    <motion.div style={{ opacity: bearO }} className="absolute right-5 top-14 rotate-12 rounded-lg border-[3px] border-[#ff3b5c] px-2 py-0.5 text-2xl font-bold text-[#ff3b5c]">BEAR</motion.div>
                  </>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {!finished && (
        <div className="relative flex items-center justify-center gap-6">
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => fling(-1)} aria-label="Bearish" className="grid h-14 w-14 place-items-center rounded-full border border-[#ff3b5c]/40 bg-[#ff3b5c]/10 text-[#ff3b5c]"><X size={22} /></motion.button>
          <span className="text-[11px] text-white/35">swipe or tap</span>
          <motion.button whileTap={{ scale: 0.85 }} onClick={() => fling(1)} aria-label="Bullish" className="grid h-14 w-14 place-items-center rounded-full border border-[#22e58b]/40 bg-[#22e58b]/10 text-[#22e58b]"><Check size={22} /></motion.button>
        </div>
      )}
    </div>
  );
}

/* ═════════════ 05 · RISK SLIDER ═════════════ */
export function RiskSlider() {
  const fx = useFx();
  const H = 300;
  const entryY = 110;
  const candles = useMemo(() => makeCandles(22, 33, 100, 0.05), []);
  const entry = candles[candles.length - 1].c;
  const hi = Math.max(...candles.map((c) => c.h));
  const k = (hi - entry) / (entryY - 15);
  const yOf = (v: number) => entryY + (entry - v) / k;
  const cw = 270 / candles.length;

  const y = useMotionValue(entryY + 70);
  const [val, setVal] = useState(entryY + 70);
  useMotionValueEvent(y, "change", (v) => setVal(v));
  const color = useTransform(y, [entryY + 10, entryY + 95, H - 10], [C.bull, C.gold, C.bear]);
  const glow = useTransform(color, (c) => `0 0 16px ${c}`);
  const zoneH = useTransform(y, (v) => Math.max(0, v - entryY));

  const risk = ((val - entryY) / (H - 10 - entryY)) * 4;
  const over = risk > 2;
  const rr = 3.2 / Math.max(0.1, risk);
  const px = (v: number) => (v * 642.1).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const stop = entry - (val - entryY) * k;

  const prevOver = useRef(false);
  useEffect(() => {
    if (over === prevOver.current) return;
    prevOver.current = over;
    if (over) { fx.sfx("lose"); fx.haptic([30, 20, 30]); }
    else { fx.sfx("tick"); fx.haptic(8); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [over]);

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/40">SET INVALIDATION</span>
        <span className="font-mono text-[10px] text-white/40">drag ↕</span>
      </div>
      <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.02]" style={{ height: H }}>
        <svg viewBox={`0 0 270 ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {candles.map((c, i) => {
            const col = c.c >= c.o ? C.bull : C.bear;
            return (
              <g key={i} opacity={0.75}>
                <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={yOf(c.h)} y2={yOf(c.l)} stroke={col} />
                <rect x={i * cw + cw * 0.2} width={cw * 0.6} y={yOf(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(yOf(c.o) - yOf(c.c)))} fill={col} />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-x-0 border-t border-dashed border-[#22e58b]/60" style={{ top: entryY - 60 }}>
          <span className="absolute left-2 -top-5 font-mono text-[10px] text-[#22e58b]">TARGET</span>
        </div>
        <motion.div className="absolute inset-x-0" style={{ top: entryY, height: zoneH, background: color, opacity: 0.12 }} />
        <div className="absolute inset-x-0 border-t border-dashed border-white/60" style={{ top: entryY }}>
          <span className="absolute left-2 -top-5 font-mono text-[10px] text-white/70">ENTRY {px(entry)}</span>
        </div>
        <motion.div
          drag="y"
          dragConstraints={{ top: entryY + 10, bottom: H - 10 }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragStart={() => fx.haptic(5)}
          style={{ y }}
          className="absolute inset-x-0 top-0 z-10 h-0 cursor-grab touch-none active:cursor-grabbing"
        >
          <div className="absolute inset-x-0 -top-5 h-10" />
          <motion.div className="absolute inset-x-0 -top-px h-[2px]" style={{ background: color, boxShadow: glow }} />
          <motion.div
            whileTap={{ scale: 1.1 }}
            className="tnum absolute -top-4 right-2 flex h-8 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] font-bold text-[#0b0b0d]"
            style={{ background: color }}
          >
            ≡ SL {px(stop)}
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/[.03] p-3">
          <div className="text-[10px] text-white/40">Risk</div>
          <motion.div className="tnum mt-0.5 text-xl font-bold" style={{ color }}>{risk.toFixed(2)}%</motion.div>
        </div>
        <div className="rounded-xl bg-white/[.03] p-3">
          <div className="text-[10px] text-white/40">R : R</div>
          <div className="tnum mt-0.5 text-xl font-bold">{rr.toFixed(1)}</div>
        </div>
        <div className="rounded-xl bg-white/[.03] p-3">
          <div className="text-[10px] text-white/40">Rule</div>
          <div className="mt-0.5 text-xl font-bold">≤2%</div>
        </div>
      </div>
      <div className="mt-3 flex h-9 items-center justify-center">
        <AnimatePresence mode="wait">
          {over ? (
            <motion.div key="o" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, x: fx.reduced ? 0 : [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }} className="rounded-full bg-[#ff3b5c]/15 px-3 py-1.5 text-[12px] font-semibold text-[#ff3b5c]">
              Over-risked — tighten your stop
            </motion.div>
          ) : (
            <motion.div key="k" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[12px] text-white/45">
              Within your risk rules ✓
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═════════════ 06 · QUIZ FEEDBACK ═════════════ */
const Q = {
  q: "Funding flips negative while price holds its range. The most likely read?",
  opts: ["A guaranteed dump is coming", "Shorts are crowded — squeeze risk rises", "Funding never matters"],
  correct: 1,
  why: "Negative funding + stable price = shorts paying to stay in. The crowded side becomes fuel.",
};

export function QuizFeedback() {
  const fx = useFx();
  const root = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [flash, setFlash] = useState(0);
  const [ok, setOk] = useState(false);

  const pick = (i: number) => {
    if (ok || wrong.includes(i)) return;
    if (i === Q.correct) {
      setOk(true);
      fx.sfx("win");
      fx.haptic([20, 30, 50]);
      const el = refs.current[i];
      if (root.current && el) {
        const c = centerIn(root.current, el);
        pr.current?.burst(c.x, c.y, { count: 70, colors: [C.bull, C.acid, "#fff"], speed: 7 });
      }
    } else {
      setWrong((w) => [...w, i]);
      setFlash((f) => f + 1);
      fx.sfx("lose");
      fx.haptic([60, 40, 60]);
    }
  };

  return (
    <div ref={root} className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <AnimatePresence>
        {flash > 0 && (
          <motion.div key={flash} className="pointer-events-none absolute inset-0 bg-[#ff3b5c]" initial={{ opacity: 0.22 }} animate={{ opacity: 0 }} transition={{ duration: fx.t(0.45) }} />
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-white/40">ACADEMY · FUNDING 3/5</span>
        <span className="font-mono text-[10px] text-[#c8ff00]">♥♥♥</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.06]">
        <motion.div className="h-full bg-[#c8ff00]" initial={{ width: "40%" }} animate={{ width: ok ? "60%" : "40%" }} transition={{ duration: fx.t(0.6), ease: [0.16, 1, 0.3, 1] }} />
      </div>
      <h3 className="mt-6 text-[19px] font-semibold leading-snug">{Q.q}</h3>

      <div className="mt-6 space-y-2.5">
        {Q.opts.map((o, i) => {
          const isWrong = wrong.includes(i);
          const isOk = ok && i === Q.correct;
          return (
            <motion.button
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              onClick={() => pick(i)}
              animate={isWrong && !fx.reduced ? { x: [0, -12, 10, -7, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              whileTap={!ok && !isWrong ? { scale: 0.97 } : undefined}
              className={`relative flex min-h-[56px] w-full items-center gap-3 overflow-hidden rounded-2xl border px-4 text-left text-[14px] transition-colors ${
                isWrong ? "border-[#ff3b5c]/50 bg-[#ff3b5c]/10 text-white/40" : isOk ? "border-[#22e58b]" : ok ? "border-white/5 text-white/30" : "border-white/10 bg-white/[.03]"
              }`}
            >
              {isOk && (
                <motion.div className="absolute inset-0 origin-left bg-[#22e58b]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: fx.t(0.35), ease: [0.7, 0, 0.2, 1] }} />
              )}
              <span className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold ${isOk ? "bg-[#0b0b0d] text-[#22e58b]" : "bg-white/[.07]"}`}>
                {isWrong ? <X size={14} className="text-[#ff3b5c]" /> : isOk ? (
                  <svg width="14" height="14" viewBox="0 0 24 24"><motion.path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: fx.t(0.3), delay: fx.t(0.2) }} /></svg>
                ) : "ABC"[i]}
              </span>
              <span className={`relative ${isWrong ? "line-through" : ""} ${isOk ? "font-semibold text-[#0b0b0d]" : ""}`}>{o}</span>
              {isOk && (
                <motion.span className="absolute right-3 font-mono text-[12px] font-bold text-[#0b0b0d]" initial={{ y: 10, opacity: 0 }} animate={{ y: [10, 0, -26], opacity: [0, 1, 0] }} transition={{ duration: fx.t(1.3) || 0.01, times: [0, 0.3, 1] }}>
                  +25 XP
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex-1" />
      <AnimatePresence>
        {(ok || wrong.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`rounded-2xl p-3 text-[12.5px] leading-snug ${ok ? "bg-[#22e58b]/10 text-white/80" : "bg-white/[.04] text-white/60"}`}>
            {ok ? Q.why : "Not quite. Think: who is paying whom to hold the position?"}
          </motion.div>
        )}
      </AnimatePresence>
      {ok && (
        <button onClick={() => { setOk(false); setWrong([]); setFlash(0); }} className="mt-3 h-12 rounded-2xl bg-[#c8ff00] font-semibold text-[#0b0b0d] active:scale-[.97]">Continue</button>
      )}
      <Particles ref={pr} />
    </div>
  );
}
