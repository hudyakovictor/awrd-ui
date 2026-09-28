import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AlertTriangle, Bell, Check, Info, Power, Shield, TrendingDown, TrendingUp, X, Zap } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useFx } from "../fx/fx";
import { useJuice } from "../fx/juice";
import { D, DuoButton } from "../duo/ui";
import { useTimers } from "./util";

/* ═══════════════════════════════════════════════════════════
 * shared tactile primitives
 * ═══════════════════════════════════════════════════════════ */
function Led({ on, color = D.orange, size = 10 }: { on: boolean; color?: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full transition-all duration-150"
      style={{
        width: size,
        height: size,
        background: on ? color : "#0b1022",
        color,
        boxShadow: on ? `0 0 ${size}px 2px ${color}, inset 0 0 3px rgba(255,255,255,.7)` : "inset 1px 1px 3px rgba(0,0,0,.8)",
      }}
    />
  );
}

function Screw({ className = "" }: { className?: string }) {
  return (
    <span className={`absolute h-3 w-3 rounded-full ${className}`} style={{ background: "radial-gradient(circle at 35% 30%, #4a5782, #1b2340)", boxShadow: "inset 1px 1px 2px rgba(0,0,0,.8), 0 1px 0 rgba(255,255,255,.08)" }}>
      <span className="absolute left-1/2 top-1/2 h-[1.5px] w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black/60" />
    </span>
  );
}

function Plate({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`skeu-panel relative rounded-[26px] ${className}`}>
      <Screw className="left-3 top-3" />
      <Screw className="right-3 top-3" />
      <Screw className="bottom-3 left-3" />
      <Screw className="bottom-3 right-3" />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 40 · RISK DIAL — brushed-metal rotary knob with detents
 * ═══════════════════════════════════════════════════════════ */
const MIN_A = -135;
const MAX_A = 135;
const ZONES = [
  { to: 1, label: "SAFE", c: D.green },
  { to: 2, label: "SMART", c: D.blue },
  { to: 3.5, label: "AGGRESSIVE", c: D.yellow },
  { to: 5.01, label: "DEGEN", c: D.red },
];

export function RiskDial() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const knobRef = useRef<HTMLDivElement>(null);
  const angle = useMotionValue(-81);
  const sAngle = useSpring(angle, { stiffness: 380, damping: 26 });
  const [risk, setRisk] = useState(1);
  const [armed, setArmed] = useState(false);
  const [tick, setTick] = useState(0);
  const dragging = useRef(false);
  const lastDetent = useRef(0);
  const startA = useRef(0);
  const startV = useRef(0);

  const pct = (a: number) => ((a - MIN_A) / (MAX_A - MIN_A)) * 5;
  const zone = ZONES.find((z) => risk < z.to)!;
  const glowOpacity = useTransform(sAngle, [MIN_A, MAX_A], [0.15, 0.9]);

  const pointerAngle = (e: PointerEvent | React.PointerEvent) => {
    const r = knobRef.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  };

  const setFromAngle = (a: number) => {
    const clamped = Math.max(MIN_A, Math.min(MAX_A, a));
    const snapped = Math.round(pct(clamped) * 4) / 4; // 0.25% detents
    const v = Math.max(0, Math.min(5, snapped));
    angle.set(MIN_A + (v / 5) * (MAX_A - MIN_A));
    if (v !== lastDetent.current) {
      const crossedZone = ZONES.findIndex((z) => v < z.to) !== ZONES.findIndex((z) => lastDetent.current < z.to);
      lastDetent.current = v;
      setRisk(v);
      setTick((t) => t + 1);
      fx.sfx("tick");
      fx.haptic(crossedZone ? [12, 20, 12] : v % 1 === 0 ? 8 : 3);
      if (crossedZone) {
        const c = knobRef.current ? juice.local(knobRef.current) : { x: 143, y: 200 };
        const z = ZONES.find((zz) => v < zz.to)!;
        juice.ring(c.x, c.y, z.c);
        juice.pop(z.label, c.x, c.y - 120, z.c, 22);
        if (z.label === "DEGEN") {
          juice.shake(1);
          juice.flash(D.red, 0.25);
        }
      }
    }
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    startA.current = pointerAngle(e);
    startV.current = angle.get();
    setArmed(false);
    fx.haptic(6);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    let d = pointerAngle(e) - startA.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    setFromAngle(startV.current + d);
  };
  const onUp = () => {
    dragging.current = false;
  };

  const arm = () => {
    setArmed(true);
    fx.sfx("lock");
    fx.haptic([30, 20, 60]);
    const c = knobRef.current ? juice.local(knobRef.current) : { x: 143, y: 200 };
    juice.ring(c.x, c.y, zone.c, true);
    juice.burst(c.x, c.y, { count: 40, shape: "spark", glow: true, colors: [zone.c, "#fff"], speed: 9, gravity: 0, life: 32 });
    later(() => setArmed(false), fx.ms(2200));
  };

  const R = 96;
  const ticks = Array.from({ length: 21 }, (_, i) => MIN_A + (i / 20) * (MAX_A - MIN_A));

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            animate={{ background: `radial-gradient(120% 70% at 50% 48%, ${zone.c}${zone.label === "DEGEN" ? "40" : "26"}, transparent 70%)` }}
            transition={{ duration: fx.reduced ? 0 : 0.5 }}
          />
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Position sizing</div>
          <div className="text-xl font-black">Risk per trade</div>
        </div>
        <div className="flex items-center gap-1.5">
          {ZONES.map((z) => (
            <Led key={z.label} on={zone.label === z.label} color={z.c} />
          ))}
        </div>
      </div>

      <Plate className="mt-4 flex flex-col items-center px-4 pb-6 pt-7">
        <div className="skeu-inset relative flex h-14 w-full items-center justify-between rounded-2xl px-4" style={{ background: "#0b1022" }}>
          <span className="text-xs font-black uppercase tracking-widest text-[#ff8a4c]/70">Risk</span>
          <motion.span key={tick} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="tnum text-3xl font-black tabular-nums" style={{ color: zone.c, textShadow: `0 0 14px ${zone.c}` }}>
            {risk.toFixed(2)}%
          </motion.span>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: zone.c }}>
            {zone.label}
          </span>
          <span className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }} />
        </div>

        <div className="relative mt-6" style={{ width: R * 2 + 40, height: R * 2 + 40 }}>
          <svg className="absolute inset-0" viewBox={`0 0 ${R * 2 + 40} ${R * 2 + 40}`}>
            {ticks.map((a, i) => {
              const major = i % 5 === 0;
              const rad = (a * Math.PI) / 180;
              const cx = R + 20;
              const r1 = R + 6;
              const r2 = major ? R + 18 : R + 12;
              const lit = a <= angle.get() + 0.01;
              const zc = ZONES.find((z) => pct(a) < z.to)!.c;
              return <line key={i} x1={cx + Math.sin(rad) * r1} y1={cx - Math.cos(rad) * r1} x2={cx + Math.sin(rad) * r2} y2={cx - Math.cos(rad) * r2} stroke={lit ? zc : "#34406a"} strokeWidth={major ? 3 : 1.5} strokeLinecap="round" style={{ filter: lit ? `drop-shadow(0 0 3px ${zc})` : undefined }} />;
            })}
            {[0, 1, 2, 3, 4, 5].map((v) => {
              const a = ((MIN_A + (v / 5) * (MAX_A - MIN_A)) * Math.PI) / 180;
              const cx = R + 20;
              return (
                <text key={v} x={cx + Math.sin(a) * (R + 30)} y={cx - Math.cos(a) * (R + 30) + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill="#8d98bf">
                  {v}
                </text>
              );
            })}
          </svg>

          <motion.div className="absolute rounded-full" style={{ inset: 20, background: zone.c, opacity: glowOpacity, filter: "blur(22px)" }} />

          <div
            ref={knobRef}
            role="slider"
            aria-label="Risk per trade"
            aria-valuemin={0}
            aria-valuemax={5}
            aria-valuenow={risk}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowUp") setFromAngle(angle.get() + 13.5);
              if (e.key === "ArrowLeft" || e.key === "ArrowDown") setFromAngle(angle.get() - 13.5);
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="absolute cursor-grab touch-none rounded-full active:cursor-grabbing"
            style={{ inset: 20, boxShadow: "-4px -4px 12px rgba(255,255,255,.08), 8px 12px 26px rgba(4,8,22,.85), inset 0 2px 0 rgba(255,255,255,.14), inset 0 -3px 0 rgba(0,0,0,.5)" }}
          >
            <motion.div className="brushed absolute inset-0 rounded-full" style={{ rotate: sAngle }}>
              <div className="absolute inset-[14%] rounded-full" style={{ background: "radial-gradient(circle at 40% 35%, #2f3b62, #171f38 75%)", boxShadow: "inset 3px 3px 8px rgba(0,0,0,.7), inset -2px -2px 6px rgba(255,255,255,.06)" }} />
              <div className="absolute left-1/2 top-[9%] h-[22%] w-[7px] -translate-x-1/2 rounded-full" style={{ background: zone.c, boxShadow: `0 0 10px ${zone.c}, inset 0 1px 0 rgba(255,255,255,.6)` }} />
            </motion.div>
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
          {[
            ["Account", "$10,000"],
            ["At risk", `$${(risk * 100).toFixed(0)}`],
            ["Max loss/day", `$${(risk * 300).toFixed(0)}`],
          ].map(([k, v]) => (
            <div key={k} className="skeu-inset rounded-xl px-2 py-2">
              <div className="text-[10px] font-black uppercase tracking-wide text-white/40">{k}</div>
              <div className="tnum text-sm font-black">{v}</div>
            </div>
          ))}
        </div>
      </Plate>

      <div className="flex-1" />
      <AnimatePresence mode="wait">
        <motion.p key={zone.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mb-3 text-center text-sm font-bold text-white/60">
          {zone.label === "SAFE" && "Slow and steady. Compounding loves you."}
          {zone.label === "SMART" && "1–2% is where pros live."}
          {zone.label === "AGGRESSIVE" && "A 10-loss streak costs a third of the account."}
          {zone.label === "DEGEN" && "Five bad trades = game over. Turn it down."}
        </motion.p>
      </AnimatePresence>
      <DuoButton full tone={zone.label === "DEGEN" ? "red" : "orange"} onClick={arm}>
        <Power size={18} strokeWidth={3} /> {armed ? "Armed ✓" : "Arm risk limit"}
      </DuoButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 41 · SAFETY SWITCHBOARD — toggles, rocker, mission lever
 * ═══════════════════════════════════════════════════════════ */
type Rule = { k: string; t: string; d: string; I: typeof Shield };
const RULES: Rule[] = [
  { k: "stop", t: "Stop-loss", d: "Every entry has an exit", I: Shield },
  { k: "size", t: "Size rule", d: "Never above 2% risk", I: Zap },
  { k: "news", t: "News lock", d: "No trades 15 min around CPI", I: Bell },
  { k: "revenge", t: "Revenge guard", d: "Cooldown after 2 losses", I: AlertTriangle },
];

function Toggle({ on, onChange, color = D.orange }: { on: boolean; onChange: (b: boolean) => void; color?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="skeu-inset relative h-9 w-[64px] shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? `linear-gradient(180deg, ${color}aa, ${color})` : undefined }}
    >
      <motion.span
        className="absolute top-1 h-7 w-7 rounded-full"
        animate={{ left: on ? 32 : 4 }}
        transition={{ type: "spring", stiffness: 600, damping: 30 }}
        style={{ background: "linear-gradient(145deg, #f4f5fb, #b9bfd6)", boxShadow: "0 3px 6px rgba(0,0,0,.7), inset 0 1px 0 #fff, inset 0 -2px 0 rgba(0,0,0,.18)" }}
      >
        <span className="absolute left-1/2 top-1/2 h-3 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded bg-black/15" />
      </motion.span>
    </button>
  );
}

export function SafetySwitchboard() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const leverRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState<Record<string, boolean>>({ stop: true, size: false, news: false, revenge: false });
  const [live, setLive] = useState(false);
  const [alarm, setAlarm] = useState(0);
  const leverY = useMotionValue(0);
  const sLever = useSpring(leverY, { stiffness: 300, damping: 22 });
  const count = Object.values(on).filter(Boolean).length;
  const allOn = count === RULES.length;

  const flip = (k: string, v: boolean) => {
    setOn((s) => ({ ...s, [k]: v }));
    fx.sfx(v ? "pop" : "tick");
    fx.haptic(v ? [8, 15, 8] : 8);
    const el = rowRefs.current[k];
    if (el) {
      const c = juice.local(el);
      if (v) juice.burst(c.x + 90, c.y, { count: 10, shape: "star", glow: true, colors: [D.orange, "#fff"], speed: 4, gravity: 0.05, size: 7, life: 26 });
    }
    if (live && !v) {
      setLive(false);
      leverY.set(0);
      setAlarm((a) => a + 1);
      juice.flash(D.red, 0.35);
      juice.shake(1.2);
      fx.sfx("lose");
      fx.haptic([60, 30, 60]);
    }
  };

  const goLive = () => {
    if (!allOn) {
      setAlarm((a) => a + 1);
      juice.shake(0.6);
      juice.flash(D.red, 0.2);
      fx.sfx("lose");
      fx.haptic([40, 30, 40]);
      return;
    }
    setLive(true);
    leverY.set(46);
    fx.sfx("lock");
    fx.haptic([20, 20, 80]);
    const c = leverRef.current ? juice.local(leverRef.current) : { x: 143, y: 480 };
    juice.ring(c.x, c.y, D.green, true);
    juice.flash(D.green, 0.2);
    later(() => fx.sfx("win"), fx.ms(300));
  };

  const stopLive = () => {
    setLive(false);
    leverY.set(0);
    fx.sfx("tick");
    fx.haptic(10);
  };

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Pre-flight</div>
          <div className="text-xl font-black">Safety switchboard</div>
        </div>
        <div className="flex items-center gap-2">
          <motion.span key={alarm} animate={alarm && !fx.reduced ? { opacity: [1, 0.2, 1, 0.2, 1] } : {}} transition={{ duration: 0.6 }}>
            <Led on={live} color={live ? D.green : D.red} size={12} />
          </motion.span>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: live ? D.green : "#8d98bf" }}>
            {live ? "Live" : "Locked"}
          </span>
        </div>
      </div>

      <Plate className="mt-4 px-4 pb-4 pt-5">
        <div className="space-y-2.5">
          {RULES.map((r) => {
            const v = on[r.k];
            return (
              <div
                key={r.k}
                ref={(el) => {
                  rowRefs.current[r.k] = el;
                }}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${v ? "skeu-raised" : "skeu-inset"}`}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: v ? "rgba(232,98,42,.18)" : "rgba(255,255,255,.04)", color: v ? "#ff8a4c" : "#5d6a93", boxShadow: "inset 2px 2px 5px rgba(0,0,0,.5)" }}>
                  <r.I size={20} strokeWidth={2.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-black">{r.t}</span>
                  <span className="block truncate text-xs font-bold text-white/50">{r.d}</span>
                </span>
                <Led on={v} color={D.green} size={8} />
                <Toggle on={v} onChange={(b) => flip(r.k, b)} />
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {RULES.map((r) => (
            <span key={r.k} className="h-2 flex-1 rounded-full transition-all" style={{ background: on[r.k] ? D.green : "#0b1022", boxShadow: on[r.k] ? `0 0 8px ${D.green}` : "inset 1px 1px 3px rgba(0,0,0,.8)" }} />
          ))}
          <span className="ml-1 text-xs font-black text-white/50">
            {count}/{RULES.length}
          </span>
        </div>
      </Plate>

      <div className="flex-1" />

      <div ref={leverRef} className="flex items-center gap-4">
        <div className="skeu-inset relative h-[86px] w-[54px] shrink-0 rounded-2xl" style={{ background: "#0b1022" }}>
          <div className="absolute left-1/2 top-3 h-[62px] w-2 -translate-x-1/2 rounded-full bg-black/70" />
          <motion.div
            className="absolute left-1/2 top-2 -translate-x-1/2"
            style={{ y: sLever }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 46 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 20 && !live) goLive();
              else if (info.offset.y < -20 && live) stopLive();
              else leverY.set(live ? 46 : 0);
            }}
          >
            <div className="h-7 w-10 cursor-grab rounded-lg active:cursor-grabbing" style={{ background: live ? `linear-gradient(180deg, #5cc97a, ${D.green})` : `linear-gradient(180deg, ${D.accentHi ?? "#ff8a4c"}, ${D.orange})`, boxShadow: "0 4px 0 rgba(0,0,0,.5), 0 6px 12px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.4)" }}>
              <div className="mx-auto mt-2 h-[2px] w-6 rounded bg-black/30" />
              <div className="mx-auto mt-1 h-[2px] w-6 rounded bg-black/30" />
            </div>
          </motion.div>
          <span className="absolute -right-6 top-3 text-[9px] font-black text-white/40">OFF</span>
          <span className="absolute -right-6 bottom-3 text-[9px] font-black" style={{ color: D.green }}>
            ON
          </span>
        </div>
        <div className="flex-1">
          <div className="text-base font-black">{live ? "Trading enabled" : allOn ? "All checks passed — pull the lever" : `Enable ${RULES.length - count} more rule${RULES.length - count === 1 ? "" : "s"}`}</div>
          <div className="text-xs font-bold text-white/50">{live ? "Flip any switch off to kill the session." : "The lever won't engage without every guard on."}</div>
          <DuoButton size="sm" tone={live ? "red" : "green"} className="mt-2" onClick={live ? stopLive : goLive}>
            {live ? "Kill switch" : "Go live"}
          </DuoButton>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 42 · SETUP DEALER — flick cards, 3D flip, verdict stamp
 * ═══════════════════════════════════════════════════════════ */
type Setup = { t: string; sub: string; good: boolean; why: string; up: boolean };
const SETUPS: Setup[] = [
  { t: "Breakout + volume", sub: "Retest held, stop below range", good: true, why: "Defined risk, confirmation, plan.", up: true },
  { t: "Influencer call", sub: "“100x, trust me”", good: false, why: "No thesis, no invalidation.", up: true },
  { t: "Bounce off support", sub: "3rd touch, funding negative", good: true, why: "Structure + positioning edge.", up: true },
  { t: "Revenge short", sub: "Right after a stop-out", good: false, why: "Emotion, not evidence.", up: false },
  { t: "Falling knife", sub: "−40% today, ‘can’t go lower’", good: false, why: "Hope is not a setup.", up: false },
];

export function SetupDealer() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const deckRef = useRef<HTMLDivElement>(null);
  const [dealt, setDealt] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>(SETUPS.map(() => false));
  const [verdict, setVerdict] = useState<(null | "take" | "pass")[]>(SETUPS.map(() => null));
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setDealt((d) => (d < SETUPS.length ? d + 1 : d)), fx.ms(160));
    return () => clearInterval(id);
  }, [fx]);
  useEffect(() => {
    if (dealt > 0 && dealt <= SETUPS.length) {
      fx.sfx("whoosh");
      fx.haptic(5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealt]);

  const flip = (i: number) => {
    if (i !== active || flipped[i]) return;
    setFlipped((f) => f.map((v, k) => (k === i ? true : v)));
    fx.sfx("pop");
    fx.haptic(10);
  };

  const decide = (i: number, take: boolean) => {
    if (verdict[i]) return;
    const s = SETUPS[i];
    const correct = take === s.good;
    setVerdict((v) => v.map((x, k) => (k === i ? (take ? "take" : "pass") : x)));
    const c = deckRef.current ? juice.local(deckRef.current) : { x: 143, y: 250 };
    if (correct) {
      setScore((x) => x + 1);
      juice.pop(take ? "GOOD TRADE" : "GOOD PASS", c.x, c.y - 90, D.green, 26);
      juice.burst(c.x, c.y, { count: 30, shape: "star", glow: true, colors: [D.green, "#fff", D.yellow], speed: 8, size: 9 });
      fx.sfx("win");
      fx.haptic([20, 30, 50]);
    } else {
      juice.pop(take ? "TRAP!" : "MISSED EDGE", c.x, c.y - 90, D.red, 26);
      juice.flash(D.red, 0.25);
      juice.shake(0.9);
      fx.sfx("lose");
      fx.haptic([50, 30, 50]);
    }
    later(() => setActive((a) => a + 1), fx.ms(1100));
  };

  const reset = () => {
    setDealt(0);
    setFlipped(SETUPS.map(() => false));
    setVerdict(SETUPS.map(() => null));
    setScore(0);
    setActive(0);
  };

  const done = active >= SETUPS.length;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Setup or trap?</div>
          <div className="text-xl font-black">Dealer</div>
        </div>
        <div className="skeu-inset flex items-center gap-1 rounded-full px-3 py-1 text-base font-black" style={{ color: D.yellow }}>
          {score} <span className="text-white/40">/ {SETUPS.length}</span>
        </div>
      </div>

      <div ref={deckRef} className="relative mt-3 flex-1" style={{ perspective: 900 }}>
        <div className="skeu-inset absolute inset-x-2 top-2 bottom-2 rounded-[28px]" style={{ background: "radial-gradient(ellipse at 50% 30%, #1f3a2c, #0f1c1a 70%)" }} />
        {SETUPS.map((s, i) => {
          const isDealt = i < dealt;
          const isActive = i === active;
          const past = i < active;
          const fl = flipped[i];
          const v = verdict[i];
          const restY = 20 + (SETUPS.length - 1 - i) * 3;
          return (
            <motion.div
              key={s.t}
              className="absolute left-1/2 top-1/2 h-[250px] w-[190px] -ml-[95px] -mt-[125px]"
              style={{ zIndex: isActive ? 20 : past ? 30 + i : 10 - i, transformStyle: "preserve-3d" }}
              initial={{ x: 260, y: -220, rotate: 35, opacity: 0 }}
              animate={
                !isDealt
                  ? { x: 260, y: -220, rotate: 35, opacity: 0 }
                  : past
                    ? { x: v === "take" ? 280 : -280, y: 40, rotate: v === "take" ? 25 : -25, opacity: 0 }
                    : isActive
                      ? { x: 0, y: -8, rotate: 0, opacity: 1, scale: 1 }
                      : { x: (i - active) * 3, y: restY, rotate: (i - active) * 1.5, opacity: 1, scale: 0.96 }
              }
              transition={fx.reduced ? { duration: 0 } : past ? { duration: 0.5, ease: [0.5, 0, 0.9, 0.5] } : { type: "spring", stiffness: 260, damping: 22 }}
            >
              <motion.button
                onClick={() => flip(i)}
                aria-label={fl ? s.t : "Flip card"}
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: fl ? 0 : 180 }}
                transition={{ duration: fx.t(0.55), ease: [0.6, 0, 0.2, 1] }}
                whileHover={!fl && isActive && !fx.reduced ? { y: -6 } : undefined}
              >
                {/* face */}
                <div className="skeu-raised absolute inset-0 flex flex-col rounded-[22px] p-4 text-left" style={{ backfaceVisibility: "hidden" }}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: s.up ? "rgba(79,185,107,.18)" : "rgba(224,82,79,.18)", color: s.up ? D.green : D.red, boxShadow: "inset 2px 2px 5px rgba(0,0,0,.5)" }}>
                      {s.up ? <TrendingUp size={22} strokeWidth={2.6} /> : <TrendingDown size={22} strokeWidth={2.6} />}
                    </span>
                    <span className="text-xs font-black text-white/40">#{i + 1}</span>
                  </div>
                  <div className="mt-4 text-[20px] font-black leading-tight">{s.t}</div>
                  <div className="mt-1 text-sm font-bold text-white/55">{s.sub}</div>
                  <div className="flex-1" />
                  <svg viewBox="0 0 150 50" className="w-full opacity-70">
                    <path d={s.up ? "M0 42 L30 34 L50 38 L80 20 L105 26 L150 6" : "M0 8 L30 16 L50 12 L80 30 L105 24 L150 44"} fill="none" stroke={s.up ? D.green : D.red} strokeWidth={3} strokeLinecap="round" />
                  </svg>
                  <AnimatePresence>
                    {v && (
                      <motion.div
                        initial={{ scale: 3, opacity: 0, rotate: -25 }}
                        animate={{ scale: 1, opacity: 1, rotate: -12 }}
                        transition={{ type: "spring", stiffness: 500, damping: 16 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border-[4px] px-3 py-1 text-2xl font-black"
                        style={{ borderColor: (v === "take") === s.good ? D.green : D.red, color: (v === "take") === s.good ? D.green : D.red, background: "rgba(11,16,34,.7)", mixBlendMode: "screen" }}
                      >
                        {(v === "take") === s.good ? "CORRECT" : "WRONG"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* back */}
                <div className="absolute inset-0 grid place-items-center rounded-[22px]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "linear-gradient(145deg, #2c3860, #1a2340)", boxShadow: "var(--e2), inset 0 0 0 6px #1a2340, inset 0 0 0 8px rgba(255,138,76,.45)" }}>
                  <div className="absolute inset-4 rounded-2xl" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 6px, transparent 6px 12px)" }} />
                  <span className="grid h-16 w-16 place-items-center rounded-full text-3xl font-black text-white" style={{ background: `linear-gradient(180deg, #ff8a4c, ${D.orange})`, boxShadow: "0 5px 0 #9c3a12, 0 8px 16px rgba(0,0,0,.5)" }}>
                    S
                  </span>
                  {isActive && !fx.reduced && <motion.span className="absolute bottom-5 text-xs font-black text-white/60" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>TAP TO FLIP</motion.span>}
                </div>
              </motion.button>
            </motion.div>
          );
        })}

        <AnimatePresence>
          {done && (
            <motion.div className="absolute inset-0 z-40 flex flex-col items-center justify-center text-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="tnum text-6xl font-black" style={{ color: D.yellow, textShadow: `0 0 24px ${D.yellow}` }}>
                {score}/{SETUPS.length}
              </div>
              <div className="mt-2 text-xl font-black">{score === SETUPS.length ? "Flawless read" : score >= 3 ? "Sharp eye" : "Trap-prone"}</div>
              <div className="mt-1 text-sm font-bold text-white/55">Every card had an answer in its subtitle.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 h-[50px]">
        {done ? (
          <DuoButton full onClick={reset}>
            Deal again
          </DuoButton>
        ) : flipped[active] && !verdict[active] ? (
          <div className="grid grid-cols-2 gap-3">
            <DuoButton tone="red" onClick={() => decide(active, false)}>
              <X size={18} strokeWidth={3} /> Pass
            </DuoButton>
            <DuoButton tone="green" onClick={() => decide(active, true)}>
              <Check size={18} strokeWidth={3} /> Take it
            </DuoButton>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-white/45">{flipped[active] ? SETUPS[active]?.why : "Flip the top card"}</div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 43 · SIGNAL SLOTS — three reels, lever, near-miss
 * ═══════════════════════════════════════════════════════════ */
const SYM = [
  { k: "bull", I: TrendingUp, c: D.green },
  { k: "bear", I: TrendingDown, c: D.red },
  { k: "shield", I: Shield, c: D.blue },
  { k: "zap", I: Zap, c: D.yellow },
  { k: "bell", I: Bell, c: D.purple },
];
const REEL_H = 84;
const LOOP = 5; // symbol cycles per spin

export function SignalSlots() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const machineRef = useRef<HTMLDivElement>(null);
  const ys = [useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const [result, setResult] = useState<number[]>([0, 2, 3]);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState("Pull the lever");
  const [credits, setCredits] = useState(20);
  const [lit, setLit] = useState<number[]>([]);
  const leverY = useMotionValue(0);
  const sLever = useSpring(leverY, { stiffness: 260, damping: 18 });
  const strip = [...SYM, ...SYM, ...SYM, ...SYM, ...SYM, ...SYM];

  const spin = () => {
    if (spinning || credits <= 0) return;
    setSpinning(true);
    setLit([]);
    setCredits((c) => c - 1);
    setMsg("…");
    fx.sfx("lock");
    fx.haptic([15, 10, 25]);
    leverY.set(70);
    later(() => leverY.set(0), fx.ms(350));
    const r = Math.random();
    // rig: 18% jackpot (3 bulls), 22% near-miss (2 bulls), else random
    const target = r < 0.18 ? [0, 0, 0] : r < 0.4 ? [0, 0, Math.floor(Math.random() * 4) + 1] : [0, 1, 2].map(() => Math.floor(Math.random() * SYM.length));
    const c = machineRef.current ? juice.local(machineRef.current) : { x: 143, y: 240 };
    target.forEach((t, i) => {
      const from = result[i];
      const dist = (LOOP * SYM.length + ((t - from + SYM.length) % SYM.length)) * REEL_H;
      const startY = ys[i].get();
      const tickEvery = REEL_H;
      let lastTick = 0;
      animate(ys[i], startY - dist, {
        duration: fx.reduced ? 0.01 : (1.4 + i * 0.55) / fx.speed,
        ease: [0.15, 0.85, 0.2, 1.08],
        onUpdate: (v) => {
          const n = Math.floor((startY - v) / tickEvery);
          if (n !== lastTick) {
            lastTick = n;
            if (n % 2 === 0) fx.sfx("tick");
          }
        },
        onComplete: () => {
          ys[i].set(((ys[i].get() % (SYM.length * REEL_H)) - SYM.length * REEL_H) % (SYM.length * REEL_H));
          fx.haptic(20);
          juice.burst(c.x - 82 + i * 82, c.y, { count: 8, shape: "spark", glow: true, colors: [SYM[t].c, "#fff"], speed: 4, gravity: 0.1, life: 22 });
          setLit((l) => [...l, i]);
          if (i === 2) {
            setResult(target);
            setSpinning(false);
            const bulls = target.filter((x) => x === 0).length;
            if (bulls === 3) {
              setCredits((cc) => cc + 15);
              setMsg("JACKPOT · +15");
              fx.sfx("win");
              fx.haptic([40, 40, 160]);
              juice.flash(D.yellow, 0.45);
              juice.shake(1.4);
              juice.pop("JACKPOT!", c.x, c.y - 40, D.yellow, 44);
              juice.rain();
              juice.confetti();
            } else if (bulls === 2) {
              setMsg("So close… that's the hook.");
              fx.sfx("lose");
              juice.pop("NEAR MISS", c.x, c.y - 40, D.orange, 26);
              juice.shake(0.5);
            } else if (target[0] === target[1] && target[1] === target[2]) {
              setCredits((cc) => cc + 5);
              setMsg("Triple · +5");
              fx.sfx("coin");
              juice.pop("+5", c.x, c.y - 40, D.green, 30);
            } else {
              setMsg("Nothing. The house edge, visualised.");
              fx.sfx("tick");
            }
          }
        },
      });
    });
    setResult(target);
  };

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Academy · Gambling vs trading</div>
          <div className="text-xl font-black">Signal Slots</div>
        </div>
        <div className="skeu-inset rounded-full px-3 py-1 text-base font-black tabular-nums" style={{ color: D.yellow }}>
          ◈ {credits}
        </div>
      </div>

      <div className="mt-3 flex items-stretch gap-3">
        <Plate className="flex-1 px-4 pb-4 pt-5">
          <div ref={machineRef} className="skeu-inset relative flex justify-center gap-2 rounded-2xl p-2" style={{ background: "#0b1022" }}>
            {ys.map((y, i) => (
              <div key={i} className="relative w-[72px] overflow-hidden rounded-xl" style={{ height: REEL_H, background: "linear-gradient(180deg, #0b1022, #1c2540 25%, #232f52 50%, #1c2540 75%, #0b1022)", boxShadow: lit.includes(i) ? `inset 0 0 0 2px ${SYM[result[i]].c}, 0 0 16px ${SYM[result[i]].c}66` : "inset 0 0 0 2px #34406a" }}>
                <motion.div style={{ y }} className="absolute inset-x-0 top-0">
                  {strip.map((s, k) => (
                    <div key={k} className="grid place-items-center" style={{ height: REEL_H }}>
                      <s.I size={38} strokeWidth={2.5} color={s.c} style={{ filter: `drop-shadow(0 0 6px ${s.c}88)` }} />
                    </div>
                  ))}
                </motion.div>
                <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-[#0b1022] to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-[#0b1022] to-transparent" />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-x-3 top-1/2 h-[2px] -translate-y-1/2 bg-[#ff8a4c]/50" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <span key={k} className="h-2 w-2 rounded-full" style={{ background: D.yellow, animation: fx.reduced ? undefined : `bulb ${spinning ? 0.25 : 1.4}s ${k * 0.08}s infinite`, boxShadow: `0 0 6px ${D.yellow}` }} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={msg} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-2 text-center text-sm font-black" style={{ color: msg.includes("JACKPOT") ? D.yellow : msg.includes("hook") ? "#ff8a4c" : "#c9cee0" }}>
              {msg}
            </motion.div>
          </AnimatePresence>
        </Plate>

        <div className="skeu-inset relative w-[54px] shrink-0 rounded-2xl" style={{ background: "#0b1022" }}>
          <div className="absolute left-1/2 top-4 h-[70%] w-2 -translate-x-1/2 rounded-full bg-black/70" />
          <motion.button
            onClick={spin}
            aria-label="Pull lever"
            disabled={spinning || credits <= 0}
            className="absolute left-1/2 top-3 -translate-x-1/2 disabled:opacity-60"
            style={{ y: sLever }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 70 }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 40) spin();
              else leverY.set(0);
            }}
          >
            <span className="block h-3 w-3 -mb-1 rounded-full bg-[#34406a] mx-auto" />
            <span className="block h-11 w-11 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, #ff9f6a, ${D.orange} 60%, #9c3a12)`, boxShadow: "0 5px 0 #6b2609, 0 8px 18px rgba(0,0,0,.7), inset 0 2px 0 rgba(255,255,255,.5)" }} />
          </motion.button>
        </div>
      </div>

      <div className="skeu-inset mt-4 rounded-2xl px-4 py-3 text-sm font-bold leading-snug text-white/70">
        <span className="font-black text-[#ff8a4c]">Lesson:</span> slots are engineered with near-misses and lights so losses feel like almost-wins. A trade with no stop, no size rule and a “gut feeling” is the same machine.
      </div>
      <div className="flex-1" />
      <DuoButton full disabled={spinning || credits <= 0} onClick={credits <= 0 ? undefined : spin}>
        {credits <= 0 ? "Out of credits · that's the point" : "Spin"}
      </DuoButton>
      {credits <= 0 && (
        <button onClick={() => { setCredits(20); setMsg("Pull the lever"); }} className="mt-2 text-center text-xs font-black text-white/50 underline-offset-2 hover:underline">
          Reset demo
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 44 · ALERT CONSOLE — physical toast stack with drag-to-dismiss
 * ═══════════════════════════════════════════════════════════ */
type Kind = "success" | "info" | "warn" | "error";
const KIND: Record<Kind, { c: string; I: typeof Info; t: string; d: string }> = {
  success: { c: D.green, I: Check, t: "Stop-loss filled", d: "ETH · −1.0R · plan respected" },
  info: { c: D.blue, I: Info, t: "Funding flipped negative", d: "BTC-PERP · −0.02%/8h" },
  warn: { c: D.yellow, I: AlertTriangle, t: "CPI in 15 min", d: "News lock engaged" },
  error: { c: D.red, I: X, t: "Revenge-trade blocked", d: "Cooldown: 14:59" },
};
type ToastT = { id: number; k: Kind };

function Toast({ t, i, onClose, total }: { t: ToastT; i: number; onClose: () => void; total: number }) {
  const fx = useFx();
  const juice = useJuice();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-160, 0, 160], [0, 1, 0]);
  const K = KIND[t.k];
  const ref = useRef<HTMLDivElement>(null);
  const [life, setLife] = useState(1);

  useEffect(() => {
    const dur = 6000 / fx.speed;
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      const p = 1 - (performance.now() - start) / dur;
      setLife(Math.max(0, p));
      if (p > 0) raf = requestAnimationFrame(loop);
      else onClose();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const depth = Math.min(i, 3);
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ y: -80, scale: 0.9, opacity: 0 }}
      animate={{ y: depth * 10, scale: 1 - depth * 0.04, opacity: i > 3 ? 0 : 1, zIndex: total - i }}
      exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.18 } }}
      transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
      drag={i === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 600) {
          const c = ref.current ? juice.local(ref.current) : { x: 143, y: 80 };
          juice.burst(c.x, c.y, { count: 14, colors: [K.c, "#fff"], shape: "circle", speed: 5, size: 6, life: 26 });
          fx.sfx("whoosh");
          fx.haptic(8);
          onClose();
        }
      }}
      style={{ x, opacity: i === 0 ? opacity : undefined }}
      className="skeu-raised absolute inset-x-0 top-0 flex cursor-grab items-center gap-3 rounded-2xl px-3 py-3 active:cursor-grabbing"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${K.c}26`, color: K.c, boxShadow: `inset 2px 2px 5px rgba(0,0,0,.5), 0 0 12px ${K.c}44` }}>
        <K.I size={20} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-black">{K.t}</span>
        <span className="block truncate text-xs font-bold text-white/55">{K.d}</span>
      </span>
      <button onClick={onClose} aria-label="Dismiss" className="grid h-8 w-8 place-items-center rounded-lg text-white/50 hover:text-white">
        <X size={16} strokeWidth={3} />
      </button>
      <span className="absolute inset-x-3 bottom-1 h-[3px] overflow-hidden rounded-full bg-black/40">
        <span className="block h-full rounded-full" style={{ width: `${life * 100}%`, background: K.c, boxShadow: `0 0 6px ${K.c}` }} />
      </span>
    </motion.div>
  );
}

export function AlertConsole() {
  const fx = useFx();
  const juice = useJuice();
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const [log, setLog] = useState<Kind[]>([]);
  const idc = useRef(1);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const push = (k: Kind) => {
    const id = idc.current++;
    setToasts((t) => [{ id, k }, ...t].slice(0, 6));
    setLog((l) => [k, ...l].slice(0, 8));
    const el = btnRefs.current[k];
    const c = el ? juice.local(el) : { x: 143, y: 480 };
    juice.burst(c.x, c.y, { count: 12, shape: "star", glow: true, colors: [KIND[k].c, "#fff"], speed: 5, gravity: 0.05, size: 8, life: 26 });
    fx.sfx(k === "error" ? "lose" : k === "success" ? "coin" : "pop");
    fx.haptic(k === "error" ? [40, 30, 40] : k === "warn" ? [15, 15, 15] : 10);
    if (k === "error") juice.shake(0.6);
    if (k === "warn") juice.flash(D.yellow, 0.12);
  };
  const close = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Feedback</div>
          <div className="text-xl font-black">Alert console</div>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(KIND) as Kind[]).map((k) => (
            <Led key={k} on={toasts.some((t) => t.k === k)} color={KIND[k].c} size={9} />
          ))}
        </div>
      </div>

      <div className="relative mt-3 h-[150px]">
        <AnimatePresence>
          {toasts.map((t, i) => (
            <Toast key={t.id} t={t} i={i} total={toasts.length} onClose={() => close(t.id)} />
          ))}
        </AnimatePresence>
        {toasts.length === 0 && (
          <div className="skeu-inset flex h-[64px] items-center justify-center rounded-2xl text-sm font-bold text-white/40">No alerts · press a button</div>
        )}
        {toasts.length > 1 && (
          <button onClick={() => setToasts([])} className="absolute -bottom-1 right-0 text-xs font-black text-white/50 underline-offset-2 hover:underline">
            Clear all ({toasts.length})
          </button>
        )}
      </div>

      <Plate className="mt-4 px-4 pb-4 pt-5">
        <div className="mb-3 text-center text-xs font-black uppercase tracking-widest text-white/45">Trigger</div>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(KIND) as Kind[]).map((k) => {
            const K = KIND[k];
            return (
              <button
                key={k}
                ref={(el) => {
                  btnRefs.current[k] = el;
                }}
                onClick={() => push(k)}
                className="duo-card flex h-[64px] items-center gap-3 px-3 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${K.c}26`, color: K.c, boxShadow: `inset 2px 2px 5px rgba(0,0,0,.5)` }}>
                  <K.I size={20} strokeWidth={3} />
                </span>
                <span className="text-sm font-black capitalize">{k}</span>
              </button>
            );
          })}
        </div>
      </Plate>

      <div className="skeu-inset mt-4 flex-1 overflow-hidden rounded-2xl p-3" style={{ background: "#0b1022" }}>
        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#ff8a4c]/70">Event log</div>
        <div className="space-y-1 font-mono text-xs">
          <AnimatePresence initial={false}>
            {log.map((k, i) => (
              <motion.div key={`${k}${log.length - i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - i * 0.1, x: 0 }} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: KIND[k].c, boxShadow: `0 0 5px ${KIND[k].c}` }} />
                <span className="text-white/45">{`00:${String(59 - i * 3).padStart(2, "0")}`}</span>
                <span className="truncate text-white/80">{KIND[k].t}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
