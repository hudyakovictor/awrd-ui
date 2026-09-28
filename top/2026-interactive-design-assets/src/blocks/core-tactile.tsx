import { AnimatePresence, animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Flame, Lock, Shield, Target, Timer, Unlock, Zap } from "lucide-react";
// Tactile core of the Signal Arena loop: reveal → commit → score → streak
import { useEffect, useMemo, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { useJuice } from "../fx/juice";
import { Bezel, Gauge, Led, Plate, PushButton, Readout, Tag } from "../duo/tactile";
import { D, DuoButton } from "../duo/ui";
import { makeCandles, useTimers, type Candle } from "./util";

/* ═══════════════════════════════════════════════════════════
 * 45 · REVEAL TERMINAL — sealed future behind a physical shutter
 * ═══════════════════════════════════════════════════════════ */
export function RevealTerminal() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const screenRef = useRef<HTMLDivElement>(null);
  const [seed, setSeed] = useState(3);
  const past = useMemo(() => makeCandles(16, seed, 100, 0), [seed]);
  const fut = useMemo(() => makeCandles(10, seed * 7 + 1, past[past.length - 1].c, seed % 2 ? 0.4 : -0.35), [past, seed]);
  const all = [...past, ...fut];
  const lo = Math.min(...all.map((c) => c.l)) - 1;
  const hi = Math.max(...all.map((c) => c.h)) + 1;
  const W = 250;
  const H = 150;
  const cw = W / all.length;
  const y = (v: number) => (1 - (v - lo) / (hi - lo)) * H;
  const split = past.length * cw;
  const pct = ((fut[fut.length - 1].c - past[past.length - 1].c) / past[past.length - 1].c) * 100;
  const up = pct >= 0;

  const [side, setSide] = useState<"long" | "short" | null>(null);
  const [phase, setPhase] = useState<"idle" | "arming" | "open" | "done">("idle");
  const [shown, setShown] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const shutter = useMotionValue(0);
  const sShutter = useSpring(shutter, { stiffness: 90, damping: 18 });
  const shutterPct = useTransform(sShutter, (v) => `${v * 100}%`);

  const candle = (c: Candle, x: number, col: string) => (
    <>
      <line x1={x + cw / 2} x2={x + cw / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.4} />
      <rect x={x + cw * 0.2} width={cw * 0.6} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={1} />
    </>
  );

  const reveal = () => {
    if (!side || phase !== "idle") return;
    setPhase("arming");
    fx.sfx("lock");
    fx.haptic([15, 20, 40]);
    const c = screenRef.current ? juice.local(screenRef.current) : { x: 143, y: 200 };
    [0, 120, 240].forEach((d, i) =>
      later(() => {
        fx.sfx("tick");
        fx.haptic(6);
        juice.ring(c.x, c.y, i === 2 ? D.orange : "#fff");
      }, fx.ms(d))
    );
    later(() => {
      setPhase("open");
      setGlitch(true);
      later(() => setGlitch(false), fx.ms(140));
      shutter.set(1);
      fx.sfx("reveal");
      juice.flash("#fff", 0.3);
      juice.burst(c.x + 40, c.y, { count: 30, shape: "spark", glow: true, colors: [D.orange, "#fff"], speed: 6, gravity: 0.05, life: 30 });
      fx.sfx("whoosh");
      fut.forEach((_, i) =>
        later(() => {
          setShown(i + 1);
          fx.sfx("tick");
          fx.haptic(4);
        }, fx.ms(420 + i * 110))
      );
      later(() => {
        setPhase("done");
        const win = (side === "long") === up;
        fx.sfx(win ? "win" : "lose");
        fx.haptic(win ? [30, 40, 90] : [70, 40, 70]);
        juice.pop(win ? "THESIS HELD" : "INVALIDATED", c.x, c.y - 20, win ? D.green : D.red, 26);
        if (win) juice.confetti();
        else juice.shake(1.1);
      }, fx.ms(420 + fut.length * 110 + 300));
    }, fx.ms(420));
  };

  const reset = () => {
    setSide(null);
    setPhase("idle");
    setShown(0);
    shutter.set(0);
    setSeed((s) => s + 1);
  };

  const win = phase === "done" && side && (side === "long") === up;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Scenario #0{seed}12</div>
          <div className="text-xl font-black">BTC / USDT · 4H</div>
        </div>
        <div className="flex items-center gap-2">
          <Led on={phase === "idle"} color={D.yellow} />
          <Led on={phase === "arming"} color={D.orange} blink />
          <Led on={phase === "open" || phase === "done"} color={D.green} />
        </div>
      </div>

      <Plate className="mt-3 px-3 pb-3 pt-4">
        <Bezel radius={22}>
          <div ref={screenRef} className="relative bg-[#0b1022]" style={{ height: H + 24 }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-x-3 top-3 h-[150px] w-[calc(100%-24px)]" preserveAspectRatio="none" style={{ filter: glitch ? "hue-rotate(90deg) contrast(2)" : undefined, transform: glitch ? "translateX(3px)" : undefined }}>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="rgba(255,138,76,.12)" strokeDasharray="2 4" />
              ))}
              {past.map((c, i) => (
                <g key={i}>{candle(c, i * cw, c.c >= c.o ? D.green : D.red)}</g>
              ))}
              <line x1={split} x2={split} y1={0} y2={H} stroke="#ff8a4c" strokeDasharray="3 3" strokeWidth={1.2} />
              {fut.slice(0, shown).map((c, i) => (
                <motion.g key={i} initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} style={{ transformBox: "fill-box", originY: 1 }} transition={{ duration: fx.t(0.25) }}>
                  {candle(c, split + i * cw, c.c >= c.o ? D.green : D.red)}
                </motion.g>
              ))}
            </svg>
            <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }} />

            {/* shutter */}
            <motion.div className="absolute inset-y-0 right-0 overflow-hidden" style={{ left: `calc(12px + ${(split / W) * 100}% * (100% - 24px) / 100%)`, x: shutterPct }}>
              <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(180deg, #2c3860 0 9px, #1a2340 9px 11px)", boxShadow: "inset 4px 0 8px rgba(0,0,0,.6)" }} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-1 rounded-xl bg-[#0b1022]/70 px-3 py-2">
                  {phase === "idle" ? <Lock size={18} className="text-[#ff8a4c]" /> : <Unlock size={18} className="text-[#ff8a4c]" />}
                  <span className="text-[10px] font-black tracking-[.2em] text-[#ff8a4c]">SEALED</span>
                </div>
              </div>
            </motion.div>
            <div className="pointer-events-none absolute inset-y-0 w-[3px] bg-[#ff8a4c]" style={{ left: `calc(12px + ${(split / W) * 100}% * (100% - 24px) / 100%)`, boxShadow: "0 0 10px #ff8a4c" }} />
          </div>
        </Bezel>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Readout label="Last" value={past[past.length - 1].c.toFixed(1)} size={18} />
          <Readout label="Δ future" value={phase === "done" ? `${up ? "+" : ""}${pct.toFixed(1)}%` : "--.-"} size={18} color={phase === "done" ? (up ? D.green : D.red) : "#ff8a4c"} />
          <Readout label="Call" value={side ? side.toUpperCase() : "----"} size={18} color={side === "long" ? D.green : side === "short" ? D.red : "#ff8a4c"} />
        </div>
      </Plate>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["long", "short"] as const).map((s) => (
          <button key={s} disabled={phase !== "idle"} onClick={() => { setSide(s); fx.sfx("tick"); fx.haptic(8); }} className={`duo-card flex h-14 items-center justify-center gap-2 text-base font-black uppercase tracking-wider ${side === s ? (s === "long" ? "duo-ok" : "duo-bad") : ""}`}>
            <Led on={side === s} color={s === "long" ? D.green : D.red} size={8} />
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1" />
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 text-sm font-bold text-white/55">
          {phase === "idle" && (side ? "Press to unseal the future." : "Pick a side, then unseal.")}
          {phase === "arming" && "Arming…"}
          {phase === "open" && "Printing candles…"}
          {phase === "done" && (win ? "Right call. Process over luck." : "Wrong call. Log what the evidence said.")}
        </div>
        {phase === "done" ? (
          <DuoButton tone="ghost" onClick={reset}>
            Next
          </DuoButton>
        ) : (
          <PushButton size={78} onClick={reveal} disabled={!side || phase !== "idle"} pressed={phase !== "idle"} label="Reveal">
            <span className="text-[11px] font-black leading-tight">
              RE
              <br />
              VEAL
            </span>
          </PushButton>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 46 · COMMIT VAULT — twist the dial, hold the key
 * ═══════════════════════════════════════════════════════════ */
export function CommitVault() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const juice = useJuice();
  const later = useTimers();
  const dialRef = useRef<HTMLDivElement>(null);
  const rot = useMotionValue(0);
  const sRot = useSpring(rot, { stiffness: 260, damping: 22 });
  const [turns, setTurns] = useState(0); // 0..3 stages
  const [hold, setHold] = useState(0);
  const [locked, setLocked] = useState(false);
  const holding = useRef(false);
  const raf = useRef(0);
  const startA = useRef(0);
  const startR = useRef(0);
  const lastNotch = useRef(0);

  const ang = (e: React.PointerEvent) => {
    const r = dialRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  };
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startA.current = ang(e);
    startR.current = rot.get();
    fx.haptic(5);
  };
  const onMove = (e: React.PointerEvent) => {
    if (locked || !(e.buttons & 1)) return;
    let d = ang(e) - startA.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const target = Math.max(0, Math.min(360, startR.current + d));
    rot.set(target);
    const notch = Math.floor(target / 15);
    if (notch !== lastNotch.current) {
      lastNotch.current = notch;
      fx.sfx("tick");
      fx.haptic(3);
    }
    const stage = Math.min(3, Math.floor(target / 120));
    if (stage !== turns) {
      setTurns(stage);
      if (stage > 0) {
        fx.sfx("pop");
        fx.haptic([10, 10, 20]);
        const c = dialRef.current ? juice.local(dialRef.current) : { x: 143, y: 250 };
        juice.ring(c.x, c.y, D.orange);
        juice.pop(`PIN ${stage}`, c.x, c.y - 120, D.orange, 20);
      }
    }
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const step = (last: number) => (now: number) => {
    const f = fxr.current;
    const dt = Math.min(0.05, (now - last) / 1000) * f.speed;
    setHold((h) => {
      const n = holding.current ? Math.min(1, h + dt / 1.1) : Math.max(0, h - dt * 2.5);
      if (Math.floor(n * 8) > Math.floor(h * 8) && holding.current) {
        f.sfx("tick");
        f.haptic(5);
      }
      if (n >= 1 && !locked) {
        holding.current = false;
        setLocked(true);
        f.sfx("lock");
        f.haptic([40, 30, 120]);
        const c = dialRef.current ? juice.local(dialRef.current) : { x: 143, y: 250 };
        juice.flash("#fff", 0.35);
        juice.shake(1.2);
        juice.ring(c.x, c.y, D.green, true);
        juice.burst(c.x, c.y, { count: 70, shape: "spark", glow: true, colors: [D.orange, "#fff", D.yellow], speed: 11, gravity: 0, life: 36 });
        later(() => fx.sfx("win"), fx.ms(350));
        return 1;
      }
      if (holding.current || n > 0) raf.current = requestAnimationFrame(step(now));
      return n;
    });
  };
  const holdDown = () => {
    if (turns < 3 || locked) {
      if (!locked) {
        fx.sfx("lose");
        juice.shake(0.4);
        juice.pop("TURN THE DIAL", 143, 420, D.red, 18);
      }
      return;
    }
    holding.current = true;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step(performance.now()));
  };
  const holdUp = () => {
    holding.current = false;
  };
  const reset = () => {
    setLocked(false);
    setTurns(0);
    setHold(0);
    rot.set(0);
    lastNotch.current = 0;
  };

  const R = 92;
  const jitter = !fx.reduced && hold > 0 && !locked ? Math.sin(performance.now() / 16) * hold * 2 : 0;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Decision workspace</div>
          <div className="text-xl font-black">Commit vault</div>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <Led key={i} on={turns > i} color={D.orange} />
          ))}
          <Led on={locked} color={D.green} />
        </div>
      </div>

      <Plate className="mt-3 px-4 pb-4 pt-5">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Action", "LONG BTC", D.green],
            ["Entry", "64,210", "#ff8a4c"],
            ["Invalidation", "62,900", D.red],
            ["Risk", "1.0 %", D.yellow],
          ].map(([k, v, c]) => (
            <Readout key={k as string} label={k as string} value={v} size={15} color={c as string} />
          ))}
        </div>
      </Plate>

      <div className="relative flex flex-1 items-center justify-center">
        <div className="absolute rounded-full" style={{ width: R * 2 + 36, height: R * 2 + 36, background: "linear-gradient(145deg, #2c3860, #161d33)", boxShadow: "var(--e3), inset 0 2px 0 rgba(255,255,255,.14)" }} />
        <svg className="absolute" width={R * 2 + 36} height={R * 2 + 36} viewBox={`0 0 ${R * 2 + 36} ${R * 2 + 36}`}>
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const cx = R + 18;
            const lit = (i / 24) * 360 <= rot.get();
            return <line key={i} x1={cx + Math.sin(a) * (R + 6)} y1={cx - Math.cos(a) * (R + 6)} x2={cx + Math.sin(a) * (R + 13)} y2={cx - Math.cos(a) * (R + 13)} stroke={lit ? D.orange : "#34406a"} strokeWidth={i % 6 === 0 ? 3 : 1.5} strokeLinecap="round" style={{ filter: lit ? `drop-shadow(0 0 3px ${D.orange})` : undefined }} />;
          })}
          {[0, 1, 2].map((i) => {
            const a = ((i + 1) * 120 * Math.PI) / 180;
            const cx = R + 18;
            return <circle key={i} cx={cx + Math.sin(a) * (R + 9.5)} cy={cx - Math.cos(a) * (R + 9.5)} r={4} fill={turns > i ? D.green : "#0b1022"} style={{ filter: turns > i ? `drop-shadow(0 0 4px ${D.green})` : undefined }} />;
          })}
        </svg>
        <div
          ref={dialRef}
          role="slider"
          aria-label="Vault dial"
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(rot.get())}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") rot.set(Math.min(360, rot.get() + 30));
            if (e.key === "ArrowLeft") rot.set(Math.max(0, rot.get() - 30));
            setTurns(Math.min(3, Math.floor(rot.get() / 120)));
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          className={`relative rounded-full ${locked ? "" : "cursor-grab active:cursor-grabbing"} touch-none`}
          style={{ width: R * 2, height: R * 2, transform: `translateX(${jitter}px)`, boxShadow: "-4px -4px 12px rgba(255,255,255,.08), 8px 12px 26px rgba(4,8,22,.85), inset 0 2px 0 rgba(255,255,255,.14), inset 0 -3px 0 rgba(0,0,0,.5)" }}
        >
          <motion.div className="brushed absolute inset-0 rounded-full" style={{ rotate: sRot }}>
            {[0, 90, 180, 270].map((a) => (
              <span key={a} className="absolute left-1/2 top-2 h-5 w-2 -translate-x-1/2 rounded-full" style={{ transform: `rotate(${a}deg) translateY(0)`, transformOrigin: `50% ${R - 8}px`, background: a === 0 ? D.orange : "#0b1022", boxShadow: a === 0 ? `0 0 8px ${D.orange}` : "inset 1px 1px 2px rgba(0,0,0,.8)" }} />
            ))}
          </motion.div>
          <button
            onPointerDown={holdDown}
            onPointerUp={holdUp}
            onPointerLeave={holdUp}
            onPointerCancel={holdUp}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                holdDown();
              }
            }}
            onKeyUp={holdUp}
            aria-label="Hold to lock"
            className="absolute inset-[26%] grid place-items-center rounded-full text-white"
            style={{
              background: locked ? `radial-gradient(circle at 38% 32%, #fff3 0, transparent 40%), linear-gradient(180deg, #5cc97a, ${D.green})` : turns >= 3 ? `radial-gradient(circle at 38% 32%, #fff3 0, transparent 40%), linear-gradient(180deg, #ff8a4c, ${D.orange})` : "radial-gradient(circle at 40% 35%, #2f3b62, #171f38 75%)",
              boxShadow: locked || hold > 0 ? "inset 4px 4px 10px rgba(0,0,0,.6)" : `0 5px 0 ${turns >= 3 ? "#9c3a12" : "#0b1022"}, 0 8px 16px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.3)`,
              transform: locked || hold > 0 ? "translateY(4px)" : undefined,
            }}
          >
            <svg className="absolute inset-0" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={44} fill="none" stroke="rgba(0,0,0,.35)" strokeWidth={5} />
              <circle cx={50} cy={50} r={44} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeDasharray={276} strokeDashoffset={276 * (1 - (locked ? 1 : hold))} transform="rotate(-90 50 50)" style={{ filter: "drop-shadow(0 0 4px #fff)" }} />
            </svg>
            {locked ? <Lock size={26} strokeWidth={3} /> : <span className="text-[11px] font-black leading-tight tracking-wider">{turns >= 3 ? "HOLD" : `${3 - turns} TURN${3 - turns === 1 ? "" : "S"}`}</span>}
          </button>
        </div>
      </div>

      <div className="text-center text-sm font-bold text-white/55">
        {locked ? "Sealed · 0x9f3a…c21e · no edits after lock" : turns < 3 ? "Turn the dial past three pins, then hold the core." : "Hold the core for 1 s. Release early to cancel."}
      </div>
      {locked && (
        <DuoButton tone="ghost" full className="mt-3" onClick={reset}>
          Replay
        </DuoButton>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 47 · SCORE DASHBOARD — analog gauges + grade stamp
 * ═══════════════════════════════════════════════════════════ */
const CRIT = [
  { k: "Thesis", v: 92, I: Target, c: D.blue },
  { k: "Stop first", v: 100, I: Shield, c: D.green },
  { k: "Sizing", v: 64, I: Zap, c: D.yellow },
  { k: "Timing", v: 81, I: Timer, c: D.purple },
];

function Needle({ value, color, size = 110, label }: { value: number; color: string; size?: number; label: string }) {
  const fx = useFx();
  const v = useMotionValue(0);
  const s = useSpring(v, { stiffness: 60, damping: 9 });
  const rot = useTransform(s, [0, 100], [-120, 120]);
  useEffect(() => {
    const t = setTimeout(() => v.set(value), fx.ms(300));
    return () => clearTimeout(t);
  }, [value, v, fx]);
  const r = size / 2;
  return (
    <div className="flex flex-col items-center">
      <div className="relative rounded-full" style={{ width: size, height: size, background: "linear-gradient(145deg, #2c3860, #161d33)", boxShadow: "var(--e2), inset 0 2px 0 rgba(255,255,255,.14)" }}>
        <div className="absolute inset-[6px] rounded-full bg-[#0b1022]" style={{ boxShadow: "inset 3px 3px 8px rgba(0,0,0,.8)" }} />
        <svg className="absolute inset-0" viewBox={`0 0 ${size} ${size}`}>
          {Array.from({ length: 13 }, (_, i) => {
            const a = ((-120 + i * 20) * Math.PI) / 180;
            const lit = i * (100 / 12) <= value;
            return <line key={i} x1={r + Math.sin(a) * (r - 12)} y1={r - Math.cos(a) * (r - 12)} x2={r + Math.sin(a) * (r - (i % 3 === 0 ? 22 : 17))} y2={r - Math.cos(a) * (r - (i % 3 === 0 ? 22 : 17))} stroke={lit ? color : "#34406a"} strokeWidth={i % 3 === 0 ? 2.5 : 1.2} strokeLinecap="round" />;
          })}
        </svg>
        <motion.div className="absolute left-1/2 top-1/2 h-[42%] w-[3px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full" style={{ rotate: rot, background: `linear-gradient(180deg, ${color}, #fff)`, boxShadow: `0 0 6px ${color}` }} />
        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #4a5782, #1b2340)", boxShadow: "0 2px 4px rgba(0,0,0,.7)" }} />
        <span className="absolute inset-x-0 bottom-3 text-center text-sm font-black tabular-nums" style={{ color }}>
          {Math.round(value)}
        </span>
      </div>
      <span className="mt-1 text-[11px] font-black uppercase tracking-wide text-white/55">{label}</span>
    </div>
  );
}

export function ScoreDashboard() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const stampRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(0);
  const [run, setRun] = useState(0);
  const total = Math.round(CRIT.reduce((s, c) => s + c.v, 0) / CRIT.length);

  useEffect(() => {
    setScore(0);
    setStage(0);
    const a = animate(0, total, { duration: fx.t(1.6) || 0.01, delay: fx.t(0.3), ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setScore(Math.round(v)) });
    let n = 0;
    const id = setInterval(() => {
      n++;
      if (n <= 16) {
        fx.sfx("tick");
        fx.haptic(2);
      } else clearInterval(id);
    }, fx.ms(100));
    later(() => setStage(1), fx.ms(1400));
    later(() => {
      setStage(2);
      fx.sfx("lock");
      fx.haptic([30, 30, 90]);
      juice.shake(1);
      juice.flash("#fff", 0.25);
      const c = stampRef.current ? juice.local(stampRef.current) : { x: 143, y: 150 };
      juice.burst(c.x, c.y, { count: 60, shape: "star", glow: true, colors: [D.orange, D.yellow, "#fff"], speed: 9, size: 10 });
      juice.ring(c.x, c.y, D.orange, true);
    }, fx.ms(2300));
    later(() => {
      setStage(3);
      fx.sfx("win");
    }, fx.ms(2900));
    return () => {
      a.stop();
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  const grade = total >= 90 ? "A" : total >= 80 ? "B+" : total >= 70 ? "B" : "C";

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Debrief</div>
          <div className="text-xl font-black">Process score</div>
        </div>
        <Tag>
          <Led on={stage >= 3} color={D.green} size={8} /> {stage >= 3 ? "Logged" : "Scoring"}
        </Tag>
      </div>

      <Plate className="mt-3 px-4 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <Readout label="Total" value={score} size={44} className="flex-1" />
          <div ref={stampRef} className="relative h-[76px] w-[76px]">
            <AnimatePresence>
              {stage >= 2 && (
                <motion.div
                  initial={{ scale: 3, rotate: -35, opacity: 0 }}
                  animate={{ scale: 1, rotate: -12, opacity: 1 }}
                  transition={fx.reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 17 }}
                  className="absolute inset-0 grid place-items-center rounded-2xl border-[4px] text-4xl font-black"
                  style={{ borderColor: D.orange, color: D.orange, background: "rgba(11,16,34,.6)", textShadow: `0 0 14px ${D.orange}`, boxShadow: `0 0 20px ${D.orange}55, inset 0 0 12px ${D.orange}33` }}
                >
                  {grade}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="mt-4">
          <Gauge value={score / 100} ticks={10} />
        </div>
      </Plate>

      <div className="mt-4 grid grid-cols-4 gap-1">
        {CRIT.map((c, i) => (
          <motion.div key={c.k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 14 }} transition={{ delay: fx.t(i * 0.1) }}>
            <Needle value={stage >= 1 ? c.v : 0} color={c.c} size={62} label={c.k} />
          </motion.div>
        ))}
      </div>

      <div className="flex-1" />
      <AnimatePresence>
        {stage >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="skeu-inset rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-[#f2b544]">
              <Led on color={D.yellow} size={7} /> Personal insight
            </div>
            <p className="mt-1 text-sm font-bold leading-snug text-white/80">You sized before defining invalidation. Fix mission unlocked: “Stop first, size second.”</p>
          </motion.div>
        )}
      </AnimatePresence>
      <DuoButton tone="ghost" full className="mt-3" onClick={() => setRun((r) => r + 1)}>
        Replay scoring
      </DuoButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 48 · STREAK FURNACE — pressure gauge + burner
 * ═══════════════════════════════════════════════════════════ */
export function StreakFurnace() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const furnaceRef = useRef<HTMLDivElement>(null);
  const [streak, setStreak] = useState(6);
  const [heat, setHeat] = useState(0.35);
  const [burst, setBurst] = useState(0);
  const heatMv = useMotionValue(0.35);
  const sHeat = useSpring(heatMv, { stiffness: 80, damping: 14 });
  const needle = useTransform(sHeat, [0, 1], [-110, 110]);
  const glow = useTransform(sHeat, [0, 1], [0.1, 0.8]);

  useEffect(() => {
    heatMv.set(heat);
  }, [heat, heatMv]);

  useEffect(() => {
    if (fx.reduced || heat < 0.2) return;
    const id = setInterval(() => {
      const c = furnaceRef.current ? juice.local(furnaceRef.current) : { x: 143, y: 300 };
      juice.burst(c.x, c.y + 30, { count: Math.round(1 + heat * 4), colors: [D.orange, D.yellow, "#fff3c4"], shape: "circle", speed: 2.2, angle: -Math.PI / 2, spread: 1, gravity: -0.04, size: 5, life: 50, glow: true, jitterX: 60 });
    }, 160 / fx.speed);
    return () => clearInterval(id);
  }, [heat, fx.reduced, fx.speed, juice]);

  const stoke = () => {
    const n = streak + 1;
    setStreak(n);
    const h = Math.min(1, heat + 0.14);
    setHeat(h);
    const c = furnaceRef.current ? juice.local(furnaceRef.current) : { x: 143, y: 300 };
    juice.burst(c.x, c.y, { count: 30, colors: [D.orange, D.yellow, "#fff"], shape: "spark", glow: true, speed: 8, gravity: 0.05, life: 30 });
    juice.pop(`+1`, c.x, c.y - 60, D.yellow, 30);
    fx.sfx("coin");
    fx.haptic(12);
    if (n % 7 === 0) {
      setBurst((b) => b + 1);
      fx.sfx("win");
      fx.haptic([40, 40, 120]);
      juice.flash(D.orange, 0.4);
      juice.shake(1.3);
      juice.ring(c.x, c.y, D.orange, true);
      juice.pop("PERFECT WEEK", c.x, c.y - 120, D.orange, 26);
      juice.rain([D.orange, D.yellow, "#fff3c4"], 50);
    }
    if (h >= 1) {
      later(() => setHeat(0.75), fx.ms(600));
    }
  };
  const miss = () => {
    if (streak === 0) return;
    setStreak(0);
    setHeat(0.05);
    const c = furnaceRef.current ? juice.local(furnaceRef.current) : { x: 143, y: 300 };
    juice.burst(c.x, c.y, { count: 40, colors: ["#5d6a93", "#34406a", "#8d98bf"], shape: "circle", speed: 5, gravity: -0.02, size: 9, life: 60 });
    juice.flash("#0b1022", 0.6);
    juice.shake(0.9);
    fx.sfx("lose");
    fx.haptic([70, 30, 40]);
  };

  const R = 70;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Daily streak</div>
          <div className="text-xl font-black">Furnace</div>
        </div>
        <Tag color={D.orange}>
          <Flame size={12} fill="currentColor" /> ×{1 + Math.floor(streak / 7)}
        </Tag>
      </div>

      <Plate className="mt-3 flex flex-col items-center px-4 pb-4 pt-5">
        <div className="relative" style={{ width: R * 2 + 20, height: R + 40 }}>
          <div className="absolute inset-x-0 top-0 overflow-hidden rounded-t-full" style={{ height: R + 10 }}>
            <div className="rounded-full" style={{ width: R * 2 + 20, height: R * 2 + 20, background: "linear-gradient(145deg, #2c3860, #161d33)", boxShadow: "var(--e2), inset 0 2px 0 rgba(255,255,255,.14)" }} />
          </div>
          <svg className="absolute inset-0" viewBox={`0 0 ${R * 2 + 20} ${R + 40}`}>
            <defs>
              <linearGradient id="fg" x1="0" x2="1">
                <stop offset="0%" stopColor={D.blue} />
                <stop offset="50%" stopColor={D.yellow} />
                <stop offset="100%" stopColor={D.red} />
              </linearGradient>
            </defs>
            <path d={`M ${R + 10 - (R - 14) * Math.sin(1.92)} ${R + 10 + (R - 14) * Math.cos(1.92)} A ${R - 14} ${R - 14} 0 1 1 ${R + 10 + (R - 14) * Math.sin(1.92)} ${R + 10 + (R - 14) * Math.cos(1.92)}`} fill="none" stroke="#0b1022" strokeWidth={12} strokeLinecap="round" />
            <path d={`M ${R + 10 - (R - 14) * Math.sin(1.92)} ${R + 10 + (R - 14) * Math.cos(1.92)} A ${R - 14} ${R - 14} 0 1 1 ${R + 10 + (R - 14) * Math.sin(1.92)} ${R + 10 + (R - 14) * Math.cos(1.92)}`} fill="none" stroke="url(#fg)" strokeWidth={7} strokeLinecap="round" opacity={0.85} />
            {Array.from({ length: 11 }, (_, i) => {
              const a = ((-110 + i * 22) * Math.PI) / 180;
              return <line key={i} x1={R + 10 + Math.sin(a) * (R - 26)} y1={R + 10 - Math.cos(a) * (R - 26)} x2={R + 10 + Math.sin(a) * (R - 32)} y2={R + 10 - Math.cos(a) * (R - 32)} stroke="#8d98bf" strokeWidth={i % 5 === 0 ? 2.5 : 1.2} />;
            })}
            <text x={R + 10} y={R + 32} textAnchor="middle" fontSize="10" fontWeight="900" fill="#8d98bf">
              HEAT
            </text>
          </svg>
          <motion.div className="absolute left-1/2 h-[54px] w-[3px] origin-bottom -translate-x-1/2 rounded-full" style={{ top: R + 10 - 54, rotate: needle, background: "linear-gradient(180deg, #ff8a4c, #fff)", boxShadow: "0 0 6px #ff8a4c" }} />
          <span className="absolute left-1/2 h-4 w-4 -translate-x-1/2 rounded-full" style={{ top: R + 2, background: "radial-gradient(circle at 35% 30%, #4a5782, #1b2340)", boxShadow: "0 2px 4px rgba(0,0,0,.7)" }} />
        </div>

        <div ref={furnaceRef} className="relative mt-2 h-[120px] w-full overflow-hidden rounded-2xl" style={{ background: "#0b1022", boxShadow: "inset 4px 4px 12px rgba(0,0,0,.8), inset 0 0 0 3px #1c2540" }}>
          <motion.div className="absolute inset-x-0 bottom-0 h-full" style={{ opacity: glow, background: "radial-gradient(ellipse at 50% 100%, #ff8a4c, #e8622a 30%, transparent 70%)" }} />
          <div className="absolute inset-x-0 bottom-0 flex h-full items-end justify-center">
            <motion.svg viewBox="0 0 100 100" width={90} height={90} style={{ originY: 1 }} animate={fx.reduced || heat < 0.15 ? { scaleY: 0.4, opacity: 0.4 } : { scaleY: [0.9 + heat * 0.3, 1 + heat * 0.35, 0.95 + heat * 0.3], scaleX: [1, 0.94, 1.02], opacity: 1 }} transition={{ duration: 0.5, repeat: Infinity }}>
              <path d="M50 4 C58 24 82 38 82 66 C82 88 68 98 50 98 C32 98 18 88 18 66 C18 48 32 40 38 22 C42 32 46 36 50 40 C50 28 47 16 50 4Z" fill="#e8622a" />
              <path d="M50 46 C56 60 66 68 66 84 C66 94 59 97 50 97 C41 97 34 94 34 84 C34 74 44 66 50 46Z" fill="#f2b544" />
              <path d="M50 70 C53 78 58 82 58 90 C58 95 54 97 50 97 C46 97 42 95 42 90 C42 84 47 80 50 70Z" fill="#fff6c9" />
            </motion.svg>
          </div>
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-9 gap-[2px] px-1 pb-1">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="h-4 rounded-sm" style={{ background: "linear-gradient(180deg, #34406a, #1c2540)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.1)" }} />
            ))}
          </div>
          <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }} />
        </div>

        <div className="mt-3 flex w-full items-center gap-3">
          <Readout label="Streak" value={<motion.span key={streak} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="inline-block">{streak}</motion.span>} size={34} className="flex-1" />
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/45">Week</div>
            <div className="flex gap-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <Led on={i < streak % 7 || (streak > 0 && streak % 7 === 0)} color={D.orange} size={9} />
                  <span className="text-[9px] font-black text-white/40">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Plate>

      <AnimatePresence>
        {burst > 0 && (
          <motion.div key={burst} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-center text-sm font-black text-[#f2b544]">
            ⭐ Perfect week ×{burst} · multiplier up
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1" />
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <DuoButton tone="ghost" onClick={miss}>
          Miss a day
        </DuoButton>
        <DuoButton onClick={stoke}>
          <Flame size={18} fill="currentColor" /> Complete today
        </DuoButton>
      </div>
    </div>
  );
}
