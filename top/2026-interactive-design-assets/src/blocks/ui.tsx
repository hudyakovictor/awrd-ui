import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { BellRing, ChevronsRight, GraduationCap, ShoppingBag, Star, Swords, Trophy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { Particles, type ParticlesHandle } from "../fx/Particles";
import { Odometer } from "./market";
import { C, centerIn, useTimers } from "./util";

/* ───────────── swipe to confirm ───────────── */
function SwipeConfirm({ color, label, onDone }: { color: string; label: string; onDone: () => void }) {
  const fx = useFx();
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [max, setMax] = useState(220);
  const stepRef = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMax(el.offsetWidth - 56));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fillW = useTransform(x, (v) => v + 52);
  const textO = useTransform(x, (v) => 1 - Math.min(1, v / (max * 0.6)));
  useMotionValueEvent(x, "change", (v) => {
    const s = Math.floor((v / max) * 5);
    if (s > stepRef.current) {
      fx.haptic(4);
      fx.sfx("tick");
    }
    stepRef.current = s;
  });

  const end = () => {
    if (x.get() > max * 0.85) {
      animate(x, max, { duration: 0.12 });
      onDone();
    } else animate(x, 0, { type: "spring", stiffness: 500, damping: 32 });
  };

  return (
    <div ref={track} className="relative h-14 overflow-hidden rounded-2xl bg-white/[.06]">
      <motion.div className="absolute inset-y-0 left-0 rounded-2xl" style={{ width: fillW, background: color, opacity: 0.28 }} />
      <motion.div style={{ opacity: textO }} className="absolute inset-0 grid place-items-center text-[14px] font-medium text-white/60">
        <span className="flex items-center gap-1">{label} <ChevronsRight size={16} /></span>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={end}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={(e) => e.key === "Enter" && onDone()}
        style={{ x, background: color }}
        className="absolute left-1 top-1 grid h-12 w-12 cursor-grab touch-none place-items-center rounded-xl text-[#0b0b0d] active:cursor-grabbing"
      >
        <ChevronsRight size={22} />
      </motion.div>
    </div>
  );
}

/* ═════════════ 20 · TRADE SHEET ═════════════ */
const LEVS = [1, 2, 3, 5, 10, 20];

export function TradeSheet() {
  const fx = useFx();
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const chk = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const later = useTimers();
  const controls = useDragControls();
  const SNAP = [428, 214, 18];
  const y = useMotionValue(SNAP[0]);
  const dim = useTransform(y, [SNAP[0], SNAP[2]], [0, 0.65]);
  const bgScale = useTransform(y, [SNAP[0], SNAP[2]], [1, 0.93]);
  const bgRadius = useTransform(y, [SNAP[0], SNAP[2]], [0, 26]);
  const [snap, setSnap] = useState(0);
  const [side, setSide] = useState<"long" | "short">("long");
  const [lev, setLev] = useState(3);
  const [amt, setAmt] = useState(250);
  const [done, setDone] = useState(false);
  const [shakeK, setShakeK] = useState(0);

  const entry = 64210;
  const liq = side === "long" ? entry * (1 - 0.9 / lev) : entry * (1 + 0.9 / lev);
  const col = side === "long" ? C.bull : C.bear;
  const danger = lev >= 10;

  const go = (i: number) => {
    setSnap(i);
    animate(y, SNAP[i], fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 40 });
    fx.haptic(6);
    fx.sfx("tick");
  };
  const onEnd = (_: unknown, info: PanInfo) => {
    const proj = y.get() + info.velocity.y * 0.18;
    let b = 0;
    SNAP.forEach((s, i) => {
      if (Math.abs(s - proj) < Math.abs(SNAP[b] - proj)) b = i;
    });
    go(b);
  };
  const pickLev = (l: number) => {
    setLev(l);
    fx.sfx(l >= 10 ? "lose" : "tick");
    fx.haptic(l >= 10 ? [30, 20, 30] : 6);
    if (l >= 10) setShakeK((k) => k + 1);
  };
  const step = (n: number) => {
    setAmt((a) => Math.max(50, Math.min(1000, a + n)));
    fx.sfx("tick");
    fx.haptic(4);
  };
  const confirm = () => {
    setDone(true);
    fx.sfx("win");
    fx.haptic([30, 40, 90]);
    later(() => {
      if (root.current && chk.current) {
        const c = centerIn(root.current, chk.current);
        pr.current?.burst(c.x, c.y, { count: 90, colors: [col, C.acid, "#fff"], speed: 9 });
      }
    }, 80);
  };

  return (
    <div ref={root} className="relative h-full overflow-hidden bg-black">
      <motion.div className="absolute inset-0 origin-top overflow-hidden bg-[#0b0b0d] px-4 pt-2" style={{ scale: bgScale, borderRadius: bgRadius }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] text-white/40">SIMULATOR</div>
            <div className="text-[15px] font-semibold">BTC-PERP</div>
          </div>
          <div className="rounded-full bg-white/[.06] px-2.5 py-1 font-mono text-[10px]">bal 1,000</div>
        </div>
        <div className="mt-3 text-[34px] font-semibold"><Odometer value={entry} decimals={0} /></div>
        <div className="font-mono text-[12px] text-[#22e58b]">▲ 1.24% · 24h</div>
        <svg viewBox="0 0 260 150" className="mt-4 w-full">
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.acid} stopOpacity={0.3} />
              <stop offset="100%" stopColor={C.acid} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d="M0 110 C30 100 40 70 70 80 S120 40 150 60 S200 20 230 35 L260 22 L260 150 L0 150Z" fill={`url(#${uid}-g)`} />
          <path d="M0 110 C30 100 40 70 70 80 S120 40 150 60 S200 20 230 35 L260 22" fill="none" stroke={C.acid} strokeWidth={2} />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
          {[["High", "64,980"], ["Low", "62,870"], ["Funding", "0.01%"]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/[.03] py-2"><div className="text-white/35">{k}</div><div>{v}</div></div>
          ))}
        </div>
      </motion.div>

      <motion.div className="absolute inset-0 bg-black" style={{ opacity: dim, pointerEvents: snap === 0 ? "none" : "auto" }} onClick={() => go(0)} />

      <motion.div
        drag="y"
        dragControls={controls}
        dragListener={false}
        dragConstraints={{ top: SNAP[2], bottom: SNAP[0] }}
        dragElastic={0.06}
        dragMomentum={false}
        onDragEnd={onEnd}
        style={{ y }}
        className="absolute inset-x-0 top-0 h-[590px] rounded-t-[28px] border-t border-white/10 bg-[#151518] shadow-[0_-20px_40px_rgba(0,0,0,.6)]"
      >
        <div onPointerDown={(e) => controls.start(e)} className="cursor-grab touch-none px-4 pb-3 pt-2 active:cursor-grabbing">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-white/20" />
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[17px] font-semibold">New position</div>
              <div className="font-mono text-[10px] text-white/40">drag the handle · 3 snap points</div>
            </div>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => go(snap === 2 ? 1 : 2)} className="h-9 rounded-full bg-white/[.06] px-3 font-mono text-[10px] text-white/60">
              {snap === 2 ? "Less" : "More"}
            </button>
          </div>
        </div>

        {done ? (
          <div className="flex flex-col items-center px-4 pt-10 text-center">
            <motion.div
              ref={chk}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 14 }}
              className="grid h-20 w-20 place-items-center rounded-full"
              style={{ background: col, boxShadow: `0 0 40px ${col}80` }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24">
                <motion.path d="M4 12l5 5L20 6" fill="none" stroke={C.ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: fx.t(0.4), delay: fx.t(0.15) }} />
              </svg>
            </motion.div>
            <div className="mt-5 text-xl font-semibold">Position opened</div>
            <div className="mt-1 font-mono text-[12px] text-white/50">
              {side.toUpperCase()} {lev}× · {(amt * lev).toLocaleString("en-US")} USDT · simulation
            </div>
            <div className="mt-2 font-mono text-[12px] text-white/40">liq. {Math.round(liq).toLocaleString("en-US")}</div>
            <button onClick={() => { setDone(false); go(0); }} className="mt-8 h-11 rounded-xl border border-white/10 px-6 text-sm text-white/70 active:scale-95">Done</button>
          </div>
        ) : (
          <div className="space-y-5 px-4">
            <div className="grid grid-cols-2 rounded-xl bg-white/[.05] p-1">
              {(["long", "short"] as const).map((s) => (
                <button key={s} onClick={() => { setSide(s); fx.sfx("tick"); fx.haptic(5); }} className="relative h-10 text-sm font-semibold capitalize">
                  {side === s && (
                    <motion.div layoutId={`${uid}-side`} className="absolute inset-0 rounded-lg" style={{ background: s === "long" ? C.bull : C.bear }} transition={{ type: "spring", stiffness: 500, damping: 36 }} />
                  )}
                  <span className={`relative ${side === s ? "text-[#0b0b0d]" : "text-white/50"}`}>{s}</span>
                </button>
              ))}
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-white/40"><span>Margin (USDT)</span><span>Balance 1,000</span></div>
              <div className="mt-2 flex items-center justify-between">
                <button onClick={() => step(-50)} aria-label="Decrease" className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-xl active:scale-90">−</button>
                <div className="text-[38px] font-semibold"><Odometer value={amt} decimals={0} /></div>
                <button onClick={() => step(50)} aria-label="Increase" className="grid h-11 w-11 place-items-center rounded-xl bg-white/[.06] text-xl active:scale-90">+</button>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[100, 250, 500, 1000].map((v) => (
                  <button key={v} onClick={() => { setAmt(v); fx.sfx("tick"); }} className={`h-8 rounded-lg font-mono text-[11px] ${amt === v ? "bg-white/15 text-white" : "bg-white/[.04] text-white/45"}`}>
                    {v === 1000 ? "MAX" : v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-white/40">Leverage</div>
              <motion.div key={shakeK} animate={shakeK && !fx.reduced ? { x: [0, -8, 7, -4, 2, 0] } : {}} transition={{ duration: 0.4 }} className="mt-2 grid grid-cols-6 gap-1.5">
                {LEVS.map((l) => (
                  <button
                    key={l}
                    onClick={() => pickLev(l)}
                    className="h-9 rounded-lg font-mono text-[12px] font-semibold transition-colors"
                    style={lev === l ? { background: l >= 10 ? C.bear : C.acid, color: C.ink } : { background: "rgba(255,255,255,.04)", color: "rgba(255,255,255,.5)" }}
                  >
                    {l}×
                  </button>
                ))}
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[.03] p-3">
                <div className="text-[10px] text-white/40">Position size</div>
                <div className="tnum mt-0.5 font-mono text-[15px]">{(amt * lev).toLocaleString("en-US")}</div>
              </div>
              <div className="rounded-xl p-3 transition-colors" style={{ background: danger ? "rgba(255,59,92,.12)" : "rgba(255,255,255,.03)" }}>
                <div className="text-[10px] text-white/40">Liq. price</div>
                <div className="tnum mt-0.5 font-mono text-[15px]" style={{ color: danger ? C.bear : undefined }}>{Math.round(liq).toLocaleString("en-US")}</div>
              </div>
            </div>

            <AnimatePresence>
              {danger && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="rounded-xl border border-[#ff3b5c]/30 bg-[#ff3b5c]/10 px-3 py-2 text-[12px] text-[#ff8a9e]">
                    At {lev}× a {(90 / lev).toFixed(1)}% move liquidates you. Most pros stay ≤ 3×.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <SwipeConfirm color={col} label={`Swipe to ${side}`} onDone={confirm} />
          </div>
        )}
      </motion.div>

      {snap === 0 && !done && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center font-mono text-[10px] text-white/30">↑ drag the sheet up</div>
      )}
      <Particles ref={pr} />
    </div>
  );
}

/* ═════════════ 24 · TAB BAR ═════════════ */
const TABS = [
  { k: "Arena", I: Swords, c: C.acid },
  { k: "Academy", I: GraduationCap, c: C.iris },
  { k: "Shop", I: ShoppingBag, c: C.gold },
  { k: "Tournaments", I: Trophy, c: C.bull },
];

function Ring({ v, c }: { v: number; c: string }) {
  const R = 26;
  const CIRC = 2 * Math.PI * R;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="32" cy="32" r={R} stroke="rgba(255,255,255,.08)" strokeWidth="6" fill="none" />
      <motion.circle cx="32" cy="32" r={R} stroke={c} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={CIRC} initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: CIRC * (1 - v) }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
    </svg>
  );
}

function TabPage({ i }: { i: number }) {
  const st = (k: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: k * 0.06 } });
  if (i === 0)
    return (
      <div className="space-y-3">
        {["Continue · ETH range", "Daily Fix Mission", "Blind Scenario"].map((t, k) => (
          <motion.div key={t} {...st(k)} className="rounded-2xl bg-white/[.04] p-4">
            <div className="font-mono text-[10px] text-white/40">0{k + 1}</div>
            <div className="mt-1 text-[15px] font-semibold">{t}</div>
            <div className="mt-3 h-1.5 rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-[#c8ff00]" style={{ width: `${75 - k * 25}%` }} /></div>
          </motion.div>
        ))}
      </div>
    );
  if (i === 1)
    return (
      <div className="grid grid-cols-2 gap-3">
        {[["Candles", 1], ["Funding", 0.6], ["Leverage", 0.35], ["Risk", 0.1]].map(([t, v], k) => (
          <motion.div key={t as string} {...st(k)} className="flex flex-col items-center rounded-2xl bg-white/[.04] py-4">
            <Ring v={v as number} c={C.iris} />
            <div className="mt-2 text-[13px] font-semibold">{t}</div>
            <div className="font-mono text-[10px] text-white/40">{Math.round((v as number) * 100)}%</div>
          </motion.div>
        ))}
      </div>
    );
  if (i === 2)
    return (
      <div>
        <div className="grid grid-cols-2 gap-3">
          {[["Neon Candles", "#ff4fd8", 250], ["Paper Terminal", "#f2efe6", 120], ["Acid Frame", C.acid, 180], ["Iris Glow", C.iris, 300]].map(([t, c, p], k) => (
            <motion.div key={t as string} {...st(k)} className="rounded-2xl bg-white/[.04] p-3">
              <div className="h-16 rounded-xl" style={{ background: `linear-gradient(135deg, ${c}, ${c}22)` }} />
              <div className="mt-2 text-[12.5px] font-semibold">{t}</div>
              <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-[#ffc83d]"><Star size={10} fill="currentColor" /> {p}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-3 text-center text-[11px] text-white/35">Cosmetic only · never affects score</div>
      </div>
    );
  return (
    <div className="flex h-[300px] items-end justify-center gap-3">
      {[["satsuki", 2, 150, "#cfcfd6"], ["0xNakamo", 1, 210, C.gold], ["You", 3, 110, "#d9925b"]].map(([n, place, h, c], k) => (
        <div key={n as string} className="flex w-20 flex-col items-center">
          <motion.div {...st(k)} className="mb-2 h-10 w-10 rounded-full" style={{ background: `linear-gradient(135deg, ${c}, ${c}44)` }} />
          <div className="mb-2 text-[12px] font-semibold">{n}</div>
          <motion.div initial={{ height: 0 }} animate={{ height: h as number }} transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 + k * 0.1 }} className="grid w-full place-items-start justify-center rounded-t-xl pt-2 text-2xl font-bold text-[#0b0b0d]" style={{ background: c as string }}>
            {place}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export function TabBar() {
  const fx = useFx();
  const uid = useId();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [taps, setTaps] = useState(0);
  const [badge, setBadge] = useState(2);
  const iRef = useRef(0);
  iRef.current = i;

  useEffect(() => {
    const id = setInterval(() => {
      if (iRef.current !== 3) setBadge((b) => Math.min(9, b + 1));
    }, fx.ms(4000));
    return () => clearInterval(id);
  }, [fx]);

  const select = (n: number) => {
    setTaps((t) => t + 1);
    fx.sfx("tick");
    fx.haptic(6);
    if (n === i) return;
    setDir(n > i ? 1 : -1);
    setI(n);
    if (n === 3) setBadge(0);
  };

  const tab = TABS[i];

  return (
    <div className="relative flex h-full flex-col">
      <div className="px-4 pt-2">
        <div className="relative h-10 overflow-hidden">
          <AnimatePresence mode="popLayout" custom={dir}>
            <motion.div
              key={tab.k}
              custom={dir}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: fx.t(0.25) }}
              className="text-3xl font-bold tracking-tight"
            >
              {tab.k}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden px-4 pt-4">
        <AnimatePresence mode="popLayout" custom={dir} initial={false}>
          <motion.div
            key={i}
            custom={dir}
            variants={{
              enter: (d: number) => ({ x: d * 70, opacity: 0, filter: "blur(4px)" }),
              center: { x: 0, opacity: 1, filter: "blur(0px)" },
              exit: (d: number) => ({ x: d * -70, opacity: 0, filter: "blur(4px)" }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
          >
            <TabPage i={i} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-3 pb-5">
        <nav className="flex h-16 items-center rounded-[22px] border border-white/10 bg-[#17171b] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,.5)]" aria-label="Main">
          {TABS.map((t, k) => {
            const active = i === k;
            return (
              <button key={t.k} onClick={() => select(k)} aria-current={active ? "page" : undefined} aria-label={t.k} className="relative flex h-full flex-1 items-center justify-center gap-1.5">
                {active && (
                  <motion.div layoutId={`${uid}-pill`} className="absolute inset-0 rounded-2xl" style={{ background: `${t.c}22` }} transition={{ type: "spring", stiffness: 450, damping: 34 }} />
                )}
                <motion.span
                  key={active ? `a${taps}` : "i"}
                  animate={active && !fx.reduced ? { scale: [1, 1.3, 0.9, 1], rotate: [0, -12, 8, 0] } : {}}
                  transition={{ duration: 0.45 }}
                  className="relative"
                  style={{ color: active ? t.c : "rgba(255,255,255,.45)" }}
                >
                  <t.I size={20} strokeWidth={active ? 2.4 : 1.8} />
                  {k === 3 && badge > 0 && (
                    <motion.span key={badge} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 14 }} className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#ff3b5c] px-1 font-mono text-[9px] font-bold text-white">
                      {badge}
                    </motion.span>
                  )}
                </motion.span>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="relative overflow-hidden whitespace-nowrap text-[11px] font-semibold" style={{ color: t.c }}>
                      {t.k === "Tournaments" ? "Cups" : t.k}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ═════════════ 18 · PULL TO REFRESH ═════════════ */
const FEED = [
  { t: "BTC · range break", s: "Arena · 8 min", c: C.acid },
  { t: "Funding divergence", s: "Academy · 5 min", c: C.iris },
  { t: "ETH · CPI reaction", s: "Arena · 7 min", c: C.gold },
  { t: "Post-loss review", s: "Protocol · 3 min", c: C.bull },
  { t: "Blind · 2022 capitulation", s: "Arena · 10 min", c: C.bear },
];
const NEW = [
  { t: "SOL · funding flip", s: "New · 6 min", c: C.gold },
  { t: "Blind · 2021 top", s: "New · 10 min", c: C.iris },
  { t: "TON · breakout retest", s: "New · 7 min", c: C.bull },
];

export function PullRefresh() {
  const fx = useFx();
  const later = useTimers();
  const y = useMotionValue(0);
  const prog = useTransform(y, [0, 80], [0.15, 1]);
  const [items, setItems] = useState(FEED.map((f, i) => ({ ...f, id: i, fresh: false })));
  const [loading, setLoading] = useState(false);
  const [armed, setArmed] = useState(false);
  const [toast, setToast] = useState(false);
  const start = useRef<number | null>(null);
  const armedRef = useRef(false);
  const round = useRef(0);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    if (loading) return;
    start.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    if (start.current === null) return;
    const dy = Math.max(0, e.clientY - start.current);
    const v = 150 * (1 - Math.exp(-dy / 170));
    y.set(v);
    const a = v > 80;
    if (a !== armedRef.current) {
      armedRef.current = a;
      setArmed(a);
      fx.haptic(a ? 12 : 4);
      fx.sfx(a ? "pop" : "tick");
    }
  };
  const up = () => {
    if (start.current === null) return;
    start.current = null;
    if (armedRef.current) {
      armedRef.current = false;
      setArmed(false);
      setLoading(true);
      animate(y, 72, { type: "spring", stiffness: 400, damping: 30 });
      fx.sfx("whoosh");
      later(() => {
        round.current++;
        const r = round.current;
        setItems((it) => [
          ...NEW.map((n, k) => ({ ...n, t: r > 1 ? `${n.t} · v${r}` : n.t, id: r * 100 + k, fresh: true })),
          ...it.map((x) => ({ ...x, fresh: false })),
        ].slice(0, 8));
        setLoading(false);
        setToast(true);
        later(() => setToast(false), fx.ms(1800));
        animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
        fx.sfx("coin");
        fx.haptic([15, 20, 30]);
      }, fx.ms(1500));
    } else animate(y, 0, { type: "spring", stiffness: 500, damping: 34 });
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="px-4 pt-2">
        <div className="font-mono text-[10px] text-white/40">FEED</div>
        <div className="text-2xl font-bold">Scenarios</div>
      </div>

      <div className="relative mt-3 flex-1 touch-none select-none overflow-hidden" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <motion.div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center gap-2 overflow-hidden" style={{ height: y }}>
          <div className="flex h-8 items-end gap-1.5">
            {[C.bull, C.bear, C.bull].map((c, k) =>
              loading ? (
                <motion.div key={k} className="w-2.5 origin-bottom rounded-sm" style={{ background: c, height: 28 }} animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, delay: k * 0.12 }} />
              ) : (
                <motion.div key={k} className="w-2.5 origin-bottom rounded-sm" style={{ background: c, height: [18, 28, 22][k], scaleY: prog }} />
              )
            )}
          </div>
          <div className="font-mono text-[10px] text-white/50">{loading ? "Loading scenarios…" : armed ? "Release to refresh" : "Pull to refresh"}</div>
        </motion.div>

        <motion.div style={{ y }} className="space-y-2 px-4">
          {items.map((it, k) => (
            <motion.div
              key={it.id}
              layout={!fx.reduced}
              initial={it.fresh ? { opacity: 0, y: -24, scale: 0.95 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 30, delay: it.fresh ? k * 0.07 : 0 }}
              className="relative flex h-[60px] items-center gap-3 overflow-hidden rounded-2xl bg-white/[.04] px-3"
            >
              {it.fresh && <motion.div className="absolute inset-0" style={{ background: it.c }} initial={{ opacity: 0.25 }} animate={{ opacity: 0 }} transition={{ duration: 1.2 }} />}
              <span className="relative h-9 w-1.5 rounded-full" style={{ background: it.c }} />
              <span className="relative flex-1">
                <span className="block text-[14px] font-semibold">{it.t}</span>
                <span className="font-mono text-[10px] text-white/40">{it.s}</span>
              </span>
              {it.fresh && <span className="relative rounded bg-[#c8ff00] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#0b0b0d]">NEW</span>}
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-[#c8ff00] px-3 py-1.5 font-mono text-[11px] font-bold text-[#0b0b0d] shadow-lg">
              ↑ 3 new scenarios
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="pb-5 pt-2 text-center font-mono text-[10px] text-white/30">↓ drag the list down</div>
    </div>
  );
}

/* ═════════════ 19 · NOTIFICATION STACK ═════════════ */
const KINDS = {
  ach: { I: Trophy, c: C.gold, t: "Achievement unlocked", d: "Stop-first ×10 — discipline badge", s: "win" as const },
  alert: { I: BellRing, c: C.bear, t: "BTC touched 63,900", d: "Your invalidation level was hit", s: "lose" as const },
  duel: { I: Swords, c: C.iris, t: "@satsuki challenged you", d: "Blind scenario · accept in 10 min", s: "pop" as const },
};
type Kind = keyof typeof KINDS;

function Toast({ kind, i, expanded, onDismiss }: { kind: Kind; i: number; expanded: boolean; onDismiss: () => void }) {
  const fx = useFx();
  const x = useMotionValue(0);
  const K = KINDS[kind];
  const dur = 5 / fx.speed;

  useEffect(() => {
    const id = setTimeout(onDismiss, dur * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hidden = !expanded && i > 2;
  return (
    <motion.div
      initial={{ y: -90, opacity: 0, scale: 0.9 }}
      animate={{ y: expanded ? i * 80 : i * 10, scale: expanded ? 1 : 1 - i * 0.05, opacity: hidden ? 0 : 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
      style={{ x, zIndex: 20 - i }}
      drag="x"
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onDismiss();
        else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      }}
      className="absolute inset-x-0 top-0 cursor-grab touch-none overflow-hidden rounded-[20px] border border-white/10 bg-[#1c1c21]/95 shadow-[0_12px_30px_rgba(0,0,0,.55)] backdrop-blur active:cursor-grabbing"
    >
      <div className="flex items-center gap-3 p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${K.c}22`, color: K.c }}>
          <K.I size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13.5px] font-semibold">{K.t}</span>
          <span className="block truncate text-[11.5px] text-white/50">{K.d}</span>
        </span>
        <span className="font-mono text-[9px] text-white/35">now</span>
      </div>
      <motion.div className="h-0.5 origin-left" style={{ background: K.c }} initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: dur, ease: "linear" }} />
    </motion.div>
  );
}

export function NotificationStack() {
  const fx = useFx();
  const [toasts, setToasts] = useState<{ id: number; kind: Kind }[]>([]);
  const [expanded, setExpanded] = useState(false);
  const idc = useRef(0);

  const add = (kind: Kind) => {
    idc.current++;
    setToasts((t) => [{ id: idc.current, kind }, ...t].slice(0, 6));
    fx.sfx(KINDS[kind].s);
    fx.haptic(kind === "alert" ? [40, 30, 40] : 12);
  };
  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  useEffect(() => {
    if (toasts.length < 2) setExpanded(false);
  }, [toasts.length]);

  return (
    <div className="relative flex h-full flex-col px-3 pb-5 pt-2">
      <div className="relative h-[330px]" onClick={() => toasts.length > 1 && setExpanded((e) => !e)}>
        <AnimatePresence>
          {toasts.map((t, i) => (
            <Toast key={t.id} kind={t.kind} i={i} expanded={expanded} onDismiss={() => remove(t.id)} />
          ))}
        </AnimatePresence>
        {toasts.length === 0 && (
          <div className="grid h-full place-items-center text-center text-[12.5px] text-white/35">
            No notifications.<br />Trigger one below.
          </div>
        )}
      </div>

      <div className="flex-1" />
      <div className="mb-3 flex items-center justify-between px-1 font-mono text-[10px] text-white/35">
        <span>{toasts.length > 1 ? (expanded ? "tap stack to collapse" : "tap stack to expand") : "swipe sideways to dismiss"}</span>
        {toasts.length > 0 && <button onClick={() => setToasts([])} className="text-white/55 hover:text-white">Clear all</button>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(KINDS) as Kind[]).map((k) => {
          const K = KINDS[k];
          return (
            <motion.button key={k} whileTap={{ scale: 0.92 }} onClick={() => add(k)} className="flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-white/[.04] text-[11px] text-white/70">
              <K.I size={18} style={{ color: K.c }} />
              {k === "ach" ? "Achievement" : k === "alert" ? "Price alert" : "Challenge"}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
