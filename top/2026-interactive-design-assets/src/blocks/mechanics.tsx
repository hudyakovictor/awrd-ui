import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Crosshair, Layers, Radar, RotateCcw, Scale } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFx } from "../fx/fx";
import { useJuice } from "../fx/juice";
import { Gauge, Led, Plate, PushButton, Readout, Tag } from "../duo/tactile";
import { D, DuoButton } from "../duo/ui";
import { useTimers } from "./util";

/* ═══════════════════════════════════════════════════════════
 * 49 · CHART SNIPER — rhythm timing game
 * ═══════════════════════════════════════════════════════════ */
type Note = { id: number; t: number; kind: "g" | "r"; hit?: "perfect" | "good" | "miss" };
const LANE_H = 300;
const HIT_Y = 240;
const SPEED = 160; // px per second
const BPM = 92;

export function ChartSniper() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const juice = useJuice();
  const jr = useRef(juice);
  jr.current = juice;
  const laneRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<"start" | "play" | "over">("start");
  const [notes, setNotes] = useState<Note[]>([]);
  const notesRef = useRef<Note[]>([]);
  const [now, setNow] = useState(0);
  const [hud, setHud] = useState({ score: 0, combo: 0, perfect: 0, good: 0, miss: 0 });
  const hudRef = useRef(hud);
  const startT = useRef(0);
  const [flash, setFlash] = useState<null | "perfect" | "good" | "miss">(null);
  const [aim, setAim] = useState<{ x: number; y: number } | null>(null);
  const total = 24;

  useEffect(() => {
    if (screen !== "play") return;
    const beat = 60 / BPM;
    const seq: Note[] = Array.from({ length: total }, (_, i) => ({ id: i, t: 2 + i * beat * (i % 4 === 3 ? 0.5 : 1) + Math.floor(i / 4) * beat * 0.5, kind: Math.random() < 0.3 ? "r" : "g" }));
    notesRef.current = seq;
    setNotes(seq);
    hudRef.current = { score: 0, combo: 0, perfect: 0, good: 0, miss: 0 };
    setHud(hudRef.current);
    startT.current = performance.now();
    let raf = 0;
    let lastBeat = -1;
    const loop = () => {
      const t = ((performance.now() - startT.current) / 1000) * fxr.current.speed;
      setNow(t);
      const b = Math.floor(t / beat);
      if (b !== lastBeat) {
        lastBeat = b;
        if (t < seq[seq.length - 1].t + 1) fxr.current.sfx("tick");
      }
      let changed = false;
      for (const n of notesRef.current) {
        if (!n.hit && t - n.t > 0.18) {
          if (n.kind === "g") {
            n.hit = "miss";
            hudRef.current = { ...hudRef.current, combo: 0, miss: hudRef.current.miss + 1 };
            changed = true;
            fxr.current.sfx("lose");
            fxr.current.haptic(20);
            jr.current.flash(D.red, 0.12);
          } else n.hit = "good"; // dodged a red = fine, silent
        }
      }
      if (changed) {
        setHud(hudRef.current);
        setNotes([...notesRef.current]);
      }
      if (t > seq[seq.length - 1].t + 1.2) {
        setScreen("over");
        const h = hudRef.current;
        fxr.current.sfx(h.perfect + h.good >= total * 0.6 ? "win" : "lose");
        if (h.perfect + h.good >= total * 0.6) jr.current.confetti();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  const fire = () => {
    if (screen !== "play") return;
    const t = ((performance.now() - startT.current) / 1000) * fx.speed;
    const cand = notesRef.current.filter((n) => !n.hit && Math.abs(n.t - t) < 0.22).sort((a, b) => Math.abs(a.t - t) - Math.abs(b.t - t))[0];
    const c = laneRef.current ? juice.local(laneRef.current) : { x: 143, y: 300 };
    const hy = c.y - LANE_H / 2 + HIT_Y;
    if (!cand) {
      hudRef.current = { ...hudRef.current, combo: 0 };
      setHud(hudRef.current);
      setFlash("miss");
      fx.sfx("tick");
      fx.haptic(6);
      juice.pop("EARLY", c.x, hy - 40, "#8d98bf", 18);
      return;
    }
    const d = Math.abs(cand.t - t);
    if (cand.kind === "r") {
      cand.hit = "miss";
      hudRef.current = { ...hudRef.current, combo: 0, miss: hudRef.current.miss + 1 };
      setFlash("miss");
      fx.sfx("lose");
      fx.haptic([50, 30, 50]);
      juice.shake(1);
      juice.flash(D.red, 0.3);
      juice.pop("FAKEOUT!", c.x, hy - 50, D.red, 26);
    } else {
      const grade = d < 0.07 ? "perfect" : "good";
      cand.hit = grade;
      const mult = 1 + Math.floor(hudRef.current.combo / 8);
      const pts = (grade === "perfect" ? 100 : 50) * mult;
      hudRef.current = { ...hudRef.current, score: hudRef.current.score + pts, combo: hudRef.current.combo + 1, [grade]: hudRef.current[grade] + 1 };
      setFlash(grade);
      fx.sfx(grade === "perfect" ? "coin" : "pop");
      fx.haptic(grade === "perfect" ? [10, 10, 20] : 10);
      juice.pop(grade === "perfect" ? "PERFECT" : "GOOD", c.x, hy - 50, grade === "perfect" ? D.yellow : D.green, grade === "perfect" ? 28 : 22);
      juice.pop(`+${pts}`, c.x + 70, hy - 20, "#fff", 18);
      juice.burst(c.x, hy, { count: grade === "perfect" ? 30 : 14, shape: "star", glow: true, colors: [grade === "perfect" ? D.yellow : D.green, "#fff"], speed: grade === "perfect" ? 8 : 5, size: 8, life: 28 });
      if (grade === "perfect") juice.ring(c.x, hy, D.yellow);
      if (hudRef.current.combo % 8 === 0) {
        juice.pop(`×${1 + hudRef.current.combo / 8} MULTI`, c.x, hy - 110, D.orange, 24);
        juice.flash(D.orange, 0.15);
        fx.sfx("win");
      }
    }
    setHud(hudRef.current);
    setNotes([...notesRef.current]);
  };

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 160);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === " " && screen === "play" && !e.repeat) {
        e.preventDefault();
        fire();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const acc = total ? Math.round(((hud.perfect + hud.good) / total) * 100) : 0;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Timing drill</div>
          <div className="text-xl font-black">Chart Sniper</div>
        </div>
        <Tag color={D.yellow}>{BPM} BPM</Tag>
      </div>

      <Plate className="mt-3 px-3 pb-3 pt-4" screws={false}>
        <div className="flex items-center gap-2">
          <Readout label="Score" value={hud.score} size={22} className="flex-1" />
          <Readout label="Combo" value={hud.combo} size={22} color={hud.combo >= 8 ? D.orange : D.yellow} className="w-[84px]" />
        </div>
        <div
          ref={laneRef}
          className="skeu-inset relative mt-3 cursor-crosshair touch-none overflow-hidden rounded-2xl"
          style={{ height: LANE_H, background: "#0b1022" }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const k = e.currentTarget.offsetWidth / r.width || 1;
            setAim({ x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k });
          }}
          onPointerLeave={() => setAim(null)}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const k = e.currentTarget.offsetWidth / r.width || 1;
            setAim({ x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k });
            fire();
          }}
        >
          {/* aiming reticle */}
          {screen === "play" && aim && (
            <>
              <div className="pointer-events-none absolute inset-y-0 w-px bg-[#ff8a4c]/35" style={{ left: aim.x }} />
              <div className="pointer-events-none absolute inset-x-0 h-px bg-[#ff8a4c]/35" style={{ top: aim.y }} />
              <motion.div
                className="pointer-events-none absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ left: aim.x, top: aim.y, borderColor: Math.abs(aim.y - HIT_Y) < 24 ? D.green : "#ff8a4c", boxShadow: Math.abs(aim.y - HIT_Y) < 24 ? `0 0 14px ${D.green}` : "none" }}
                animate={{ scale: Math.abs(aim.y - HIT_Y) < 24 ? 0.8 : 1, rotate: Math.abs(aim.y - HIT_Y) < 24 ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
              >
                <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
              </motion.div>
            </>
          )}
          {/* lock-on brackets at the hit line after a perfect */}
          <AnimatePresence>
            {flash === "perfect" && (
              <motion.div key={`lock${now}`} className="pointer-events-none absolute left-1/2 h-12 w-24 -translate-x-1/2 rounded-lg border-2" style={{ top: HIT_Y - 24, borderColor: D.yellow, boxShadow: `0 0 18px ${D.yellow}` }} initial={{ scale: 1.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 500, damping: 20 }} />
            )}
          </AnimatePresence>
          <div className="absolute inset-x-0 h-[3px]" style={{ top: HIT_Y, background: D.orange, boxShadow: `0 0 10px ${D.orange}` }} />
          <div className="absolute inset-x-0" style={{ top: HIT_Y - 22, height: 44, background: "linear-gradient(180deg, transparent, rgba(232,98,42,.14), transparent)" }} />
          <AnimatePresence>
            {flash && <motion.div key={flash + now} className="absolute inset-x-0" style={{ top: HIT_Y - 22, height: 44, background: flash === "miss" ? D.red : flash === "perfect" ? D.yellow : D.green }} initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />}
          </AnimatePresence>
          {[0.25, 0.5, 0.75].map((f) => (
            <div key={f} className="absolute inset-y-0 w-px bg-white/5" style={{ left: `${f * 100}%` }} />
          ))}
          {screen === "play" &&
            notes.map((n) => {
              const y = HIT_Y - (n.t - now) * SPEED;
              if (y < -40 || y > LANE_H + 40) return null;
              const col = n.kind === "g" ? D.green : D.red;
              const done = !!n.hit;
              return (
                <div key={n.id} className="absolute left-1/2 -translate-x-1/2" style={{ top: y - 18, opacity: done ? 0.15 : 1, transform: `translateX(-50%) scale(${done ? 0.7 : 1})`, transition: "opacity .15s, transform .15s" }}>
                  <div className="mx-auto w-[3px] rounded-full" style={{ height: 46, background: col }} />
                  <div className="absolute left-1/2 top-2 h-7 w-4 -translate-x-1/2 rounded-sm" style={{ background: col, boxShadow: `0 0 10px ${col}88, inset 0 1px 0 rgba(255,255,255,.4)` }} />
                </div>
              );
            })}
          {screen === "play" && <div className="absolute left-3 top-3 text-[10px] font-black uppercase tracking-widest text-[#ff8a4c]/70">Tap when a green candle crosses the line · never tap red</div>}
          <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }} />
          <AnimatePresence>
            {screen !== "play" && (
              <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1022]/85 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Crosshair size={40} className="text-[#ff8a4c]" />
                {screen === "start" ? (
                  <>
                    <div className="mt-3 text-xl font-black">Enter on the beat</div>
                    <div className="mt-1 max-w-[200px] text-sm font-bold text-white/55">Green candles = entries. Red = fakeouts — let them pass.</div>
                  </>
                ) : (
                  <>
                    <div className="mt-2 text-4xl font-black" style={{ color: D.yellow }}>
                      {acc}%
                    </div>
                    <div className="text-sm font-bold text-white/60">
                      {hud.perfect} perfect · {hud.good} good · {hud.miss} miss
                    </div>
                    <div className="mt-1 text-base font-black">{acc >= 85 ? "Sniper" : acc >= 60 ? "Steady hands" : "Chasing entries"}</div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Plate>

      <div className="flex-1" />
      <div className="flex items-center justify-center gap-5">
        <div className="flex-1 text-sm font-bold text-white/55">{screen === "play" ? "Space bar works too." : "Timing beats prediction. Late entries pay the spread."}</div>
        {screen === "play" ? (
          <PushButton size={84} onClick={fire} label="Fire">
            <span className="text-sm font-black">ENTER</span>
          </PushButton>
        ) : (
          <PushButton size={84} color={D.green} dark={D.greenDark} onClick={() => setScreen("play")} label="Start">
            <span className="text-sm font-black">{screen === "start" ? "GO" : "AGAIN"}</span>
          </PushButton>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 50 · PORTFOLIO BALANCE — physical scale
 * ═══════════════════════════════════════════════════════════ */
type Asset = { k: string; w: number; c: string; risk: "stable" | "risky" };
const ASSETS: Asset[] = [
  { k: "BTC", w: 3, c: "#f7931a", risk: "risky" },
  { k: "ETH", w: 2, c: "#8b7bff", risk: "risky" },
  { k: "SOL", w: 2, c: "#4fb96b", risk: "risky" },
  { k: "USDC", w: 3, c: "#4c8ee6", risk: "stable" },
  { k: "GOLD", w: 2, c: "#f2b544", risk: "stable" },
  { k: "BONDS", w: 1, c: "#8d98bf", risk: "stable" },
];

export function PortfolioBalance() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const panL = useRef<HTMLDivElement>(null);
  const panR = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState<string[]>(["BTC", "ETH"]);
  const [right, setRight] = useState<string[]>(["USDC"]);
  const [locked, setLocked] = useState(false);
  const [hover, setHover] = useState<"L" | "R" | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  /** which pan (if any) is under a viewport point — generous hit area for thumbs */
  const hitPan = (x: number, y: number): "L" | "R" | null => {
    for (const [side, ref] of [["L", panL], ["R", panR]] as const) {
      const r = ref.current?.getBoundingClientRect();
      if (r && x > r.left - 26 && x < r.right + 26 && y > r.top - 60 && y < r.bottom + 26) return side;
    }
    return null;
  };
  const wL = left.reduce((s, k) => s + ASSETS.find((a) => a.k === k)!.w, 0);
  const wR = right.reduce((s, k) => s + ASSETS.find((a) => a.k === k)!.w, 0);
  const diff = wL - wR;
  const tilt = useMotionValue(0);
  const sTilt = useSpring(tilt, { stiffness: 60, damping: 7, mass: 1.4 });
  const dropL = useTransform(sTilt, (v) => v * 2.2);
  const dropR = useTransform(sTilt, (v) => -v * 2.2);
  const balanced = Math.abs(diff) <= 1 && wL + wR >= 6;

  useEffect(() => {
    tilt.set(Math.max(-14, Math.min(14, diff * 3.2)));
  }, [diff, tilt]);

  useEffect(() => {
    if (balanced && !locked) {
      fx.sfx("win");
      fx.haptic([20, 30, 60]);
      juice.flash(D.green, 0.18);
      juice.ring(143, 240, D.green, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balanced]);

  const place = (k: string, side: "L" | "R") => {
    if (locked) return;
    const inL = left.includes(k);
    const inR = right.includes(k);
    if (inL) setLeft((l) => l.filter((x) => x !== k));
    if (inR) setRight((r) => r.filter((x) => x !== k));
    const already = (side === "L" && inL) || (side === "R" && inR);
    if (!already) {
      if (side === "L") setLeft((l) => [...l.filter((x) => x !== k), k]);
      else setRight((r) => [...r.filter((x) => x !== k), k]);
      const pan = side === "L" ? panL.current : panR.current;
      const c = pan ? juice.local(pan) : { x: 143, y: 260 };
      const a = ASSETS.find((x) => x.k === k)!;
      juice.burst(c.x, c.y, { count: 10 + a.w * 4, colors: [a.c, "#fff"], shape: "circle", speed: 3 + a.w, gravity: 0.2, size: 5, life: 26 });
      fx.sfx("pop");
      fx.haptic(6 + a.w * 4);
      juice.shake(0.2 + a.w * 0.12);
    } else {
      fx.sfx("tick");
      fx.haptic(5);
    }
  };

  const lock = () => {
    setLocked(true);
    fx.sfx("lock");
    fx.haptic([30, 20, 80]);
    juice.confetti();
    later(() => setLocked(false), fx.ms(2500));
  };

  const pan = (side: "L" | "R", items: string[], ref: React.RefObject<HTMLDivElement | null>, drop: typeof dropL) => (
    <motion.div className="absolute top-[54px] flex w-[104px] flex-col items-center" style={{ [side === "L" ? "left" : "right"]: 8, y: drop }}>
      <div className="relative h-14 w-[2px] bg-[#34406a]">
        <div className="absolute -left-[26px] top-0 h-14 w-[2px] origin-top rotate-[22deg] bg-[#34406a]" />
        <div className="absolute -right-[26px] top-0 h-14 w-[2px] origin-top -rotate-[22deg] bg-[#34406a]" />
      </div>
      <div
        ref={ref}
        className="relative h-[70px] w-[104px] rounded-b-[26px] rounded-t-md transition-shadow duration-200"
        style={{
          background: hover === side ? "linear-gradient(180deg, #3a3326, #1d1a1a)" : "linear-gradient(180deg, #2c3860, #161d33)",
          boxShadow: hover === side
            ? `0 0 0 2px ${D.orange}, 0 0 24px ${D.orange}88, inset 0 3px 8px rgba(0,0,0,.6)`
            : dragging
              ? "0 0 0 1.5px rgba(255,255,255,.25), var(--e2), inset 0 3px 8px rgba(0,0,0,.6)"
              : "var(--e2), inset 0 3px 8px rgba(0,0,0,.6), inset 0 -2px 0 rgba(255,255,255,.08)",
        }}
      >
        {dragging && <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest" style={{ color: hover === side ? D.orange : "rgba(255,255,255,.35)" }}>drop here</span>}
        <div className="absolute inset-x-2 top-2 flex flex-wrap-reverse content-start justify-center gap-1">
          <AnimatePresence>
            {items.map((k) => {
              const a = ASSETS.find((x) => x.k === k)!;
              return (
                <motion.button
                  key={k}
                  layoutId={`w-${k}`}
                  onClick={() => place(k, side)}
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="grid place-items-center rounded-md text-[9px] font-black text-[#0b1022]"
                  style={{ width: 22 + a.w * 6, height: 18 + a.w * 3, background: `linear-gradient(180deg, ${a.c}, ${a.c}aa)`, boxShadow: `0 2px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)` }}
                  aria-label={`Remove ${k}`}
                >
                  {a.w}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-white/45">{side === "L" ? "Risk-on" : "Risk-off"}</div>
    </motion.div>
  );

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Allocation</div>
          <div className="text-xl font-black">Portfolio scale</div>
        </div>
        <Tag color={balanced ? D.green : D.yellow}>
          <Led on={balanced} color={D.green} size={8} /> {balanced ? "Balanced" : diff > 0 ? "Risk-heavy" : diff < 0 ? "Too safe" : "Empty"}
        </Tag>
      </div>

      <Plate className="relative mt-3 h-[236px]" screws={false}>
        <div className="absolute left-1/2 top-[40px] h-[150px] w-4 -translate-x-1/2 rounded-full" style={{ background: "linear-gradient(90deg, #2c3860, #161d33)", boxShadow: "var(--e1)" }} />
        <div className="absolute bottom-3 left-1/2 h-4 w-32 -translate-x-1/2 rounded-full" style={{ background: "linear-gradient(180deg, #2c3860, #161d33)", boxShadow: "var(--e2)" }} />
        <motion.div className="absolute left-1/2 top-[44px] h-3 w-[230px] -translate-x-1/2 origin-center rounded-full" style={{ rotate: sTilt, background: "linear-gradient(180deg, #3a4772, #1c2540)", boxShadow: "var(--e1), inset 0 1px 0 rgba(255,255,255,.2)" }} />
        <span className="absolute left-1/2 top-[38px] h-6 w-6 -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #4a5782, #1b2340)", boxShadow: "0 2px 4px rgba(0,0,0,.7)" }} />
        {pan("L", left, panL, dropL)}
        {pan("R", right, panR, dropR)}
        <div className="absolute inset-x-0 bottom-9 flex justify-center">
          <Readout value={`${wL} : ${wR}`} size={18} color={balanced ? D.green : D.orange} className="px-3 py-1" />
        </div>
      </Plate>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {ASSETS.map((a) => {
          const where = left.includes(a.k) ? "L" : right.includes(a.k) ? "R" : null;
          return (
            <div key={a.k} className="skeu-inset relative flex items-center justify-between rounded-xl p-1.5 pl-1.5" style={{ zIndex: dragging === a.k ? 30 : 1 }}>
              <motion.span
                drag={!locked}
                dragSnapToOrigin
                dragElastic={0.6}
                dragMomentum={false}
                whileDrag={{ scale: 1.25, rotate: -6, zIndex: 40, boxShadow: `0 12px 24px rgba(0,0,0,.6), 0 0 16px ${a.c}` }}
                onDragStart={() => {
                  setDragging(a.k);
                  fx.sfx("tick");
                  fx.haptic(6);
                }}
                onDrag={(_, info) => {
                  const h = hitPan(info.point.x - window.scrollX, info.point.y - window.scrollY);
                  if (h !== hover) {
                    setHover(h);
                    if (h) fx.haptic(4);
                  }
                }}
                onDragEnd={(_, info) => {
                  const h = hitPan(info.point.x - window.scrollX, info.point.y - window.scrollY);
                  setDragging(null);
                  setHover(null);
                  if (h && !(h === where)) place(a.k, h);
                  else if (!h) fx.sfx("swipe");
                }}
                className="flex cursor-grab touch-none items-center gap-1.5 rounded-lg px-1 py-1 active:cursor-grabbing"
                style={{ background: dragging === a.k ? "#26315a" : "transparent" }}
                aria-label={`Drag ${a.k} onto a pan`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-md text-[9px] font-black text-[#0b1022]" style={{ background: `linear-gradient(180deg, ${a.c}, ${a.c}aa)`, boxShadow: "0 2px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.5)" }}>
                  {a.w}
                </span>
                <span className="text-xs font-black">{a.k}</span>
              </motion.span>
              <span className="flex gap-1">
                {(["L", "R"] as const).map((s) => (
                  <button key={s} onClick={() => place(a.k, s)} disabled={locked} aria-label={`${a.k} to ${s === "L" ? "risk-on" : "risk-off"}`} className="grid h-7 w-7 place-items-center rounded-lg text-[10px] font-black" style={{ background: where === s ? a.c : "linear-gradient(145deg, #2c3860, #212b4a)", color: where === s ? "#0b1022" : "#c9cee0", boxShadow: where === s ? "inset 2px 2px 4px rgba(0,0,0,.4)" : "0 2px 0 #121a30, var(--e1)" }}>
                    {s}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />
      <div className="mb-2 text-center text-sm font-bold text-white/55">{balanced ? "Risk and safety within one weight. Lock it." : dragging ? `Drop ${dragging} on a pan` : "Drag assets onto the pans. Keep them within 1 weight, total ≥ 6."}</div>
      <DuoButton full disabled={!balanced || locked} onClick={lock}>
        <Scale size={18} strokeWidth={3} /> {locked ? "Rebalanced ✓" : "Lock allocation"}
      </DuoButton>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 51 · PATTERN TRACE — draw the shape
 * ═══════════════════════════════════════════════════════════ */
type Pt = { x: number; y: number };
const PATTERNS: { n: string; pts: Pt[] }[] = [
  { n: "Double bottom", pts: [{ x: 10, y: 30 }, { x: 60, y: 130 }, { x: 110, y: 70 }, { x: 160, y: 132 }, { x: 210, y: 40 }, { x: 250, y: 20 }] },
  { n: "Head & shoulders", pts: [{ x: 10, y: 120 }, { x: 50, y: 60 }, { x: 90, y: 110 }, { x: 130, y: 20 }, { x: 170, y: 110 }, { x: 210, y: 60 }, { x: 250, y: 130 }] },
  { n: "Bull flag", pts: [{ x: 10, y: 140 }, { x: 80, y: 30 }, { x: 120, y: 55 }, { x: 160, y: 45 }, { x: 200, y: 70 }, { x: 250, y: 10 }] },
  { n: "Cup & handle", pts: [{ x: 10, y: 30 }, { x: 50, y: 100 }, { x: 100, y: 130 }, { x: 150, y: 110 }, { x: 190, y: 40 }, { x: 215, y: 62 }, { x: 250, y: 20 }] },
];
const W = 260;
const H = 150;
const toD = (a: Pt[]) => a.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
const yAt = (a: Pt[], x: number) => {
  if (x <= a[0].x) return a[0].y;
  for (let i = 1; i < a.length; i++) if (a[i].x >= x) return a[i - 1].y + ((a[i].y - a[i - 1].y) * (x - a[i - 1].x)) / (a[i].x - a[i - 1].x || 1);
  return a[a.length - 1].y;
};

export function PatternTrace() {
  const fx = useFx();
  const juice = useJuice();
  const svg = useRef<SVGSVGElement>(null);
  const [pi, setPi] = useState(0);
  const [path, setPath] = useState<Pt[]>([]);
  const pts = useRef<Pt[]>([]);
  const drawing = useRef(false);
  const [acc, setAcc] = useState<number | null>(null);
  const [ghost, setGhost] = useState(true);
  const [best, setBest] = useState<Record<number, number>>({});
  const P = PATTERNS[pi];

  const local = (e: React.PointerEvent): Pt => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: Math.max(0, Math.min(H, ((e.clientY - r.top) * H) / r.height)) };
  };
  const down = (e: React.PointerEvent<SVGSVGElement>) => {
    if (acc !== null) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    pts.current = [local(e)];
    setPath([...pts.current]);
    setGhost(false);
    fx.haptic(4);
  };
  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const p = local(e);
    const last = pts.current[pts.current.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 2) return;
    if (Math.floor(p.x / 26) !== Math.floor(last.x / 26)) {
      const err = Math.abs(yAt(P.pts, p.x) - p.y);
      fx.sfx("tick");
      fx.haptic(err < 12 ? 2 : 0);
      if (err < 10) {
        const r = svg.current!.getBoundingClientRect();
        const c = juice.local(svg.current!);
        juice.burst(c.x - r.width / 2 + (p.x / W) * r.width, c.y - r.height / 2 + (p.y / H) * r.height, { count: 3, shape: "star", glow: true, colors: [D.green, "#fff"], speed: 2, size: 5, life: 18 });
      }
    }
    pts.current.push(p);
    setPath([...pts.current]);
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const a = pts.current;
    if (a.length < 8 || a[a.length - 1].x - a[0].x < W * 0.55) {
      setPath([]);
      setGhost(true);
      fx.sfx("lose");
      fx.haptic([20, 20, 20]);
      juice.pop("TRACE THE WHOLE SHAPE", 143, 260, D.red, 16);
      return;
    }
    let err = 0;
    const N = 40;
    for (let i = 0; i <= N; i++) {
      const x = 10 + (i / N) * 240;
      err += Math.abs(yAt(a, x) - yAt(P.pts, x));
    }
    err /= N + 1;
    const score = Math.max(0, Math.min(100, Math.round(100 - err * 2.6)));
    setAcc(score);
    setBest((b) => ({ ...b, [pi]: Math.max(b[pi] ?? 0, score) }));
    const c = svg.current ? juice.local(svg.current) : { x: 143, y: 260 };
    if (score >= 80) {
      fx.sfx("win");
      fx.haptic([20, 30, 60]);
      juice.ring(c.x, c.y, D.green, true);
      juice.pop(`${score}%`, c.x, c.y - 20, D.green, 40);
      juice.confetti();
    } else if (score >= 55) {
      fx.sfx("coin");
      juice.pop(`${score}%`, c.x, c.y - 20, D.yellow, 34);
    } else {
      fx.sfx("lose");
      juice.shake(0.6);
      juice.pop(`${score}%`, c.x, c.y - 20, D.red, 34);
    }
  };
  const next = () => {
    setPi((i) => (i + 1) % PATTERNS.length);
    setPath([]);
    setAcc(null);
    setGhost(true);
    fx.sfx("whoosh");
  };
  const retry = () => {
    setPath([]);
    setAcc(null);
    setGhost(true);
    fx.sfx("tick");
  };

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Pattern library · {pi + 1}/{PATTERNS.length}</div>
          <div className="text-xl font-black">{P.n}</div>
        </div>
        <Tag color={D.yellow}>Best {best[pi] ?? 0}%</Tag>
      </div>

      <Plate className="mt-3 px-3 pb-3 pt-4" screws={false}>
        <div className="skeu-inset relative overflow-hidden rounded-2xl" style={{ background: "#0b1022" }}>
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="block w-full touch-none select-none" style={{ cursor: acc === null ? "crosshair" : "default" }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke="rgba(255,138,76,.1)" strokeDasharray="2 4" />
            ))}
            <motion.path d={toD(P.pts)} fill="none" stroke={D.orange} strokeWidth={acc !== null ? 3 : 8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={acc !== null ? "none" : "6 10"} initial={false} animate={{ opacity: ghost ? 0.45 : acc !== null ? 0.9 : 0.12 }} style={{ filter: `drop-shadow(0 0 6px ${D.orange})` }} />
            {ghost && !fx.reduced && (
              <motion.circle r={6} fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0], offsetDistance: ["0%", "100%"] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 0.6 }} style={{ offsetPath: `path("${toD(P.pts)}")` }} />
            )}
            {acc !== null &&
              Array.from({ length: 9 }, (_, i) => {
                const x = 20 + i * 27.5;
                const uy = yAt(path, x);
                const ty = yAt(P.pts, x);
                return <line key={i} x1={x} x2={x} y1={uy} y2={ty} stroke={Math.abs(uy - ty) < 14 ? D.green : D.red} strokeWidth={1.5} strokeDasharray="2 2" />;
              })}
            {path.length > 1 && (
              <>
                <path d={toD(path)} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,.5))" }} />
                {acc === null && <circle cx={path[path.length - 1].x} cy={path[path.length - 1].y} r={5} fill="#fff" />}
              </>
            )}
          </svg>
          <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1">
            <Gauge value={(acc ?? 0) / 100} color={acc === null ? D.orange : acc >= 80 ? D.green : acc >= 55 ? D.yellow : D.red} ticks={4} />
          </div>
          <Readout value={acc === null ? "--" : `${acc}%`} size={18} color={acc === null ? "#ff8a4c" : acc >= 80 ? D.green : acc >= 55 ? D.yellow : D.red} className="w-[76px] py-1 text-center" />
        </div>
      </Plate>

      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {PATTERNS.map((p, i) => (
          <button key={p.n} onClick={() => { setPi(i); setPath([]); setAcc(null); setGhost(true); fx.sfx("tick"); }} className={`skeu-inset flex h-9 items-center justify-center gap-1 rounded-xl text-[10px] font-black ${i === pi ? "text-[#ff8a4c]" : "text-white/50"}`}>
            <Led on={(best[i] ?? 0) >= 80} color={D.green} size={6} /> #{i + 1}
          </button>
        ))}
      </div>

      <div className="flex-1" />
      <div className="mb-2 text-center text-sm font-bold text-white/55">{acc === null ? "Trace the glowing dashed shape in one stroke." : acc >= 80 ? "Muscle memory unlocked." : "Watch the pivots — highs and lows matter most."}</div>
      {acc === null ? (
        <DuoButton tone="ghost" full onClick={() => setGhost((g) => !g)}>
          {ghost ? "Hide guide" : "Show guide"}
        </DuoButton>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <DuoButton tone="ghost" onClick={retry}>
            <RotateCcw size={16} strokeWidth={3} /> Retry
          </DuoButton>
          <DuoButton onClick={next}>Next pattern</DuoButton>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 52 · MEMORY DECK — spaced repetition with decay
 * ═══════════════════════════════════════════════════════════ */
type Card = { q: string; a: string; hint: string; strength: number; due: number };
const CARDS0: Omit<Card, "strength" | "due">[] = [
  { q: "Funding rate negative", a: "Shorts pay longs", hint: "Who pays whom?" },
  { q: "Invalidation", a: "The price where your idea is wrong", hint: "Not a target." },
  { q: "R multiple", a: "Profit ÷ initial risk", hint: "Units of risk." },
  { q: "Liquidation price", a: "Where margin hits zero", hint: "Leverage sets it." },
  { q: "Fakeout", a: "Breakout that fails and reverses", hint: "Traps breakout buyers." },
];

export function MemoryDeck() {
  const fx = useFx();
  const juice = useJuice();
  const later = useTimers();
  const cardRef = useRef<HTMLDivElement>(null);
  const [deck, setDeck] = useState<Card[]>(() => CARDS0.map((c, i) => ({ ...c, strength: 0.25 + (i % 3) * 0.2, due: i })));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tick, setTick] = useState(0);
  const [reviews, setReviews] = useState(0);
  const c = deck[i];

  // decay every 2.5s while not reviewed
  useEffect(() => {
    const id = setInterval(() => {
      setDeck((d) => d.map((x, k) => (k === i ? x : { ...x, strength: Math.max(0.05, x.strength - 0.02) })));
      setTick((t) => t + 1);
    }, fx.ms(2500));
    return () => clearInterval(id);
  }, [i, fx]);

  const grade = (g: 0 | 1 | 2) => {
    const el = cardRef.current;
    const p = el ? juice.local(el) : { x: 143, y: 250 };
    const delta = g === 2 ? 0.35 : g === 1 ? 0.15 : -0.2;
    setDeck((d) => d.map((x, k) => (k === i ? { ...x, strength: Math.max(0.05, Math.min(1, x.strength + delta)), due: reviews + (g === 2 ? 5 : g === 1 ? 3 : 1) } : x)));
    setReviews((r) => r + 1);
    if (g === 2) {
      fx.sfx("win");
      fx.haptic([15, 20, 40]);
      juice.burst(p.x, p.y, { count: 30, shape: "star", glow: true, colors: [D.green, "#fff"], speed: 7, size: 8 });
      juice.pop("+35% memory", p.x, p.y - 100, D.green, 20);
    } else if (g === 1) {
      fx.sfx("coin");
      fx.haptic(10);
      juice.pop("+15%", p.x, p.y - 100, D.yellow, 20);
    } else {
      fx.sfx("lose");
      fx.haptic([40, 20, 40]);
      juice.shake(0.5);
      juice.pop("again soon", p.x, p.y - 100, D.red, 18);
    }
    later(() => {
      setFlipped(false);
      // pick weakest/most due next
      setDeck((d) => {
        const order = d.map((x, k) => ({ k, s: x.due - x.strength * 3 })).filter((o) => o.k !== i).sort((a, b) => a.s - b.s);
        setI(order[0].k);
        return d;
      });
      fx.sfx("whoosh");
    }, fx.ms(350));
  };

  const avg = deck.reduce((s, x) => s + x.strength, 0) / deck.length;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Spaced repetition</div>
          <div className="text-xl font-black">Memory deck</div>
        </div>
        <Tag color={avg > 0.7 ? D.green : avg > 0.4 ? D.yellow : D.red}>Retention {Math.round(avg * 100)}%</Tag>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {deck.map((x, k) => (
          <button key={x.q} onClick={() => { setI(k); setFlipped(false); fx.sfx("tick"); }} className="skeu-inset relative h-10 overflow-hidden rounded-lg" aria-label={`Card ${k + 1}, strength ${Math.round(x.strength * 100)}%`}>
            <motion.div className="absolute inset-x-0 bottom-0" animate={{ height: `${x.strength * 100}%`, background: x.strength > 0.66 ? D.green : x.strength > 0.33 ? D.yellow : D.red }} transition={{ duration: 0.6 }} style={{ boxShadow: "0 0 8px currentColor", opacity: 0.85 }} />
            <span className={`absolute inset-0 grid place-items-center text-[11px] font-black ${k === i ? "text-white" : "text-white/60"}`}>{k + 1}</span>
            {k === i && <span className="absolute inset-0 rounded-lg ring-2 ring-[#ff8a4c]" />}
          </button>
        ))}
      </div>

      <div className="relative mt-4 flex flex-1 items-center justify-center" style={{ perspective: 900 }}>
        <motion.div key={tick % 2 === 0 ? "a" : "b"} className="pointer-events-none absolute -inset-x-4 top-1/2 h-px bg-white/5" />
        <motion.div ref={cardRef} className="relative h-[220px] w-[240px]" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: fx.t(0.5), ease: [0.6, 0, 0.2, 1] }}>
          <button onClick={() => { setFlipped(true); fx.sfx("pop"); fx.haptic(8); }} className="skeu-raised absolute inset-0 flex flex-col items-center justify-center rounded-[24px] p-5 text-center" style={{ backfaceVisibility: "hidden" }}>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a4c]/70">Term</div>
            <div className="mt-3 text-2xl font-black leading-tight">{c.q}</div>
            <div className="mt-4 text-sm font-bold text-white/50">{c.hint}</div>
            <div className="absolute inset-x-5 bottom-4">
              <Gauge value={c.strength} color={c.strength > 0.66 ? D.green : c.strength > 0.33 ? D.yellow : D.red} height={8} />
              <div className="mt-1 text-[10px] font-black text-white/40">memory strength · decays while you wait</div>
            </div>
            {!fx.reduced && <motion.span className="absolute right-4 top-4 text-[10px] font-black text-white/40" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity }}>TAP TO FLIP</motion.span>}
          </button>
          <div className="skeu-raised absolute inset-0 flex flex-col items-center justify-center rounded-[24px] p-5 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: `var(--e2), var(--bevel), 0 0 0 2px ${D.orange}` }}>
            <div className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff8a4c]/70">Answer</div>
            <div className="mt-3 text-xl font-black leading-snug" style={{ color: "#ff8a4c" }}>
              {c.a}
            </div>
            <div className="mt-2 text-sm font-bold text-white/45">{c.q}</div>
          </div>
        </motion.div>
      </div>

      <div className="mb-2 text-center text-sm font-bold text-white/55">{flipped ? "How well did you know it?" : "Weak cards come back sooner. Strong cards fade slower."}</div>
      <div className="grid grid-cols-3 gap-2">
        <DuoButton tone="red" size="sm" disabled={!flipped} onClick={() => grade(0)}>
          Again
        </DuoButton>
        <DuoButton tone="yellow" size="sm" disabled={!flipped} onClick={() => grade(1)}>
          Hard
        </DuoButton>
        <DuoButton tone="green" size="sm" disabled={!flipped} onClick={() => grade(2)}>
          Easy
        </DuoButton>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 53 · LEVERAGE TOWER — stacking game with cascading collapse
 * ═══════════════════════════════════════════════════════════ */
type Block = { x: number; w: number; lev: number };
const TW = 250;
const BH = 22;

export function LeverageTower() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const juice = useJuice();
  const jr = useRef(juice);
  jr.current = juice;
  const later = useTimers();
  const areaRef = useRef<HTMLDivElement>(null);
  const [stack, setStack] = useState<Block[]>([{ x: 55, w: 140, lev: 1 }]);
  const [mover, setMover] = useState<Block>({ x: 0, w: 140, lev: 2 });
  const moverRef = useRef(mover);
  const dir = useRef(1);
  const [state, setState] = useState<"play" | "fall" | "over">("play");
  const [best, setBest] = useState(0);
  const [wobble, setWobble] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (state !== "play") return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * fxr.current.speed;
      last = now;
      const m = moverRef.current;
      const speed = 120 + stack.length * 18;
      let x = m.x + dir.current * speed * dt;
      if (x < 0) {
        x = 0;
        dir.current = 1;
      }
      if (x + m.w > TW) {
        x = TW - m.w;
        dir.current = -1;
      }
      moverRef.current = { ...m, x };
      setMover(moverRef.current);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [state, stack.length]);

  const drop = () => {
    if (state !== "play") return;
    const m = moverRef.current;
    const top = stack[stack.length - 1];
    const left = Math.max(m.x, top.x);
    const right = Math.min(m.x + m.w, top.x + top.w);
    const overlap = right - left;
    const a = areaRef.current ? jr.current.local(areaRef.current) : { x: 143, y: 300 };
    const cy = a.y + 150 - (stack.length + 1) * BH - 20;
    if (overlap <= 12) {
      setState("fall");
      fx.sfx("glitch");
      fx.haptic([80, 40, 120]);
      juice.shake(1.6);
      juice.flash(D.red, 0.4);
      juice.pop("LIQUIDATED", a.x, cy - 40, D.red, 30);
      // cascade: every floor gives way from the top down
      const base = a.y + 150 - 12 + Math.max(0, (stack.length - 8) * BH);
      for (let f = stack.length - 1; f >= 1; f--) {
        const b = stack[f];
        later(() => {
          const fy = base - f * BH - BH / 2;
          const fxX = a.x - TW / 2 + b.x + b.w / 2;
          juice.burst(fxX, fy, { count: 10, colors: [levColor(b.lev), "#fff"], speed: 5, gravity: 0.45, size: 6, life: 34 });
          juice.pop(`${b.lev}×`, fxX, fy - 10, levColor(b.lev), 14);
          fx.sfx("drop");
          fx.haptic(8);
        }, fx.ms((stack.length - 1 - f) * 80 + 60));
      }
      juice.burst(a.x, cy, { count: 60, colors: [D.red, "#fff", "#8d98bf"], speed: 9, gravity: 0.35, size: 8 });
      later(() => {
        setBest((b) => Math.max(b, stack.length - 1));
        setState("over");
        fx.sfx("lose");
      }, fx.ms(900));
      return;
    }
    const perfect = Math.abs(m.x - top.x) < 4;
    const nb: Block = { x: perfect ? top.x : left, w: perfect ? top.w : overlap, lev: m.lev };
    const cut = m.w - nb.w;
    setStack((s) => [...s, nb]);
    const nextLev = Math.min(100, Math.round(nb.lev * 1.6));
    moverRef.current = { x: dir.current > 0 ? 0 : TW - nb.w, w: nb.w, lev: nextLev };
    setMover(moverRef.current);
    setWobble((w) => w + 1);
    if (perfect) {
      fx.sfx("win");
      fx.haptic([15, 15, 40]);
      juice.pop("PERFECT", a.x, cy - 30, D.yellow, 24);
      juice.ring(a.x, cy, D.yellow);
      juice.burst(a.x, cy, { count: 30, shape: "star", glow: true, colors: [D.yellow, "#fff"], speed: 7, size: 8 });
    } else {
      fx.sfx("pop");
      fx.haptic(12);
      juice.shake(0.35);
      const sideX = m.x < top.x ? a.x - TW / 2 + m.x + cut / 2 : a.x - TW / 2 + right + cut / 2;
      juice.burst(sideX, cy, { count: 12 + cut / 2, colors: [D.red, "#8d98bf"], speed: 5, gravity: 0.4, size: 6, life: 40 });
      juice.pop(`−${Math.round(cut)}`, sideX, cy - 20, D.red, 16);
    }
    if (nb.lev >= 20) {
      juice.pop(`${nb.lev}× · thin ice`, a.x, cy - 70, D.orange, 16);
    }
  };

  const reset = () => {
    setStack([{ x: 55, w: 140, lev: 1 }]);
    moverRef.current = { x: 0, w: 140, lev: 2 };
    setMover(moverRef.current);
    setState("play");
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === " " && !e.repeat) {
        e.preventDefault();
        if (state === "over") reset();
        else drop();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, stack]);

  const height = stack.length - 1;
  const levColor = (l: number) => (l <= 3 ? D.green : l <= 10 ? D.yellow : l <= 25 ? D.orange : D.red);
  const camY = Math.max(0, (stack.length - 8) * BH);

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">Leverage stacking</div>
          <div className="text-xl font-black">Liquidation tower</div>
        </div>
        <Tag color={D.yellow}>Best {best}</Tag>
      </div>

      <Plate className="mt-3 px-3 pb-3 pt-4" screws={false}>
        <div className="flex items-center gap-2">
          <Readout label="Floors" value={height} size={22} className="flex-1" />
          <Readout label="Next lev" value={`${mover.lev}×`} size={22} color={levColor(mover.lev)} className="flex-1" />
          <Readout label="Width" value={`${Math.round((mover.w / 140) * 100)}%`} size={22} color={mover.w < 50 ? D.red : "#ff8a4c"} className="flex-1" />
        </div>
        <div ref={areaRef} className="skeu-inset relative mt-3 overflow-hidden rounded-2xl" style={{ height: 300, background: "linear-gradient(180deg, #0b1022, #131a2e)" }}>
          <motion.div className="absolute inset-x-0 bottom-0" animate={{ y: camY }} transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ height: 300 + camY, left: `calc(50% - ${TW / 2}px)`, width: TW }}>
            <div className="absolute bottom-0 h-3 w-full rounded-t" style={{ background: "linear-gradient(180deg, #34406a, #1c2540)" }} />
            {stack.map((b, k) => (
              <motion.div
                key={k}
                className="absolute flex items-center justify-center rounded-[5px] text-[10px] font-black text-[#0b1022]"
                initial={k === 0 ? false : { y: -60, opacity: 0.6 }}
                animate={
                  state === "fall" || state === "over"
                    ? k === 0
                      ? { y: 0, x: [0, 7, -7, 3, 0], rotate: 0 }
                      : { y: 360 + k * 8, x: (k % 2 ? 1 : -1) * (18 + k * 7), rotate: (k % 2 ? 1 : -1) * (28 + k * 5), opacity: 0 }
                    : { y: 0, opacity: 1, rotate: 0, x: wobble && k > 0 && !fx.reduced ? [0, (k % 2 ? 1 : -1) * Math.min(6, k), 0] : 0 }
                }
                transition={
                  state === "fall" || state === "over"
                    ? { delay: fx.reduced ? 0 : (stack.length - 1 - k) * 0.08, duration: fx.reduced ? 0 : 0.75, ease: [0.5, 0, 0.9, 0.45] }
                    : { type: "spring", stiffness: 500, damping: 26 }
                }
                style={{ left: b.x, width: b.w, height: BH - 2, bottom: 12 + k * BH, background: `linear-gradient(180deg, ${levColor(b.lev)}, ${levColor(b.lev)}bb)`, boxShadow: "0 3px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.45), 0 0 10px rgba(0,0,0,.4)" }}
              >
                {b.lev}×
              </motion.div>
            ))}
            {state === "play" && (
              <div className="absolute flex items-center justify-center rounded-[5px] text-[10px] font-black text-[#0b1022]" style={{ left: mover.x, width: mover.w, height: BH - 2, bottom: 12 + stack.length * BH + 30, background: `linear-gradient(180deg, ${levColor(mover.lev)}, ${levColor(mover.lev)}bb)`, boxShadow: `0 3px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.45), 0 0 16px ${levColor(mover.lev)}66` }}>
                {mover.lev}×
              </div>
            )}
            {state === "fall" && (
              <motion.div className="absolute rounded-[5px]" initial={{ left: mover.x, bottom: 12 + stack.length * BH + 30, rotate: 0, opacity: 1 }} animate={{ bottom: -80, rotate: mover.x < 100 ? -70 : 70, opacity: 0 }} transition={{ duration: 0.8, ease: "easeIn" }} style={{ width: mover.w, height: BH - 2, background: D.red }} />
            )}
          </motion.div>
          <div className="absolute left-3 top-3 text-[10px] font-black uppercase tracking-widest text-[#ff8a4c]/70">Each floor multiplies leverage · overhang gets cut</div>
          <span className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,.03) 0 1px, transparent 1px 3px)" }} />
          <AnimatePresence>
            {state === "over" && (
              <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b1022]/85 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Layers size={36} className="text-[#ff8a4c]" />
                <div className="mt-2 text-3xl font-black">{height} floors</div>
                <div className="text-sm font-bold text-white/60">Reached {stack[stack.length - 1].lev}× before the tower fell.</div>
                <div className="mt-2 max-w-[220px] text-xs font-bold text-white/45">Every mistake shrinks your base. High leverage on a thin base ends the same way.</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Plate>

      <div className="flex-1" />
      <div className="flex items-center justify-center gap-5">
        <div className="flex-1 text-sm font-bold text-white/55">{state === "play" ? "Drop when aligned. Space works." : "Try again — smaller size, more floors."}</div>
        <PushButton size={84} color={state === "over" ? D.green : D.orange} dark={state === "over" ? D.greenDark : D.orangeDark} onClick={state === "over" ? reset : drop} disabled={state === "fall"} label="Drop">
          <span className="text-sm font-black">{state === "over" ? "AGAIN" : "DROP"}</span>
        </PushButton>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 54 · WHALE RADAR — sonar sweep with moving contacts
 * ═══════════════════════════════════════════════════════════ */
type Contact = { id: number; a: number; r: number; va: number; vr: number; kind: "whale" | "noise" | "shark"; seen: number; tagged?: boolean };
const RAD = 120;

export function WhaleRadar() {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const juice = useJuice();
  const jr = useRef(juice);
  jr.current = juice;
  const scopeRef = useRef<HTMLDivElement>(null);
  const [sweep, setSweep] = useState(0);
  const sweepRef = useRef(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const cRef = useRef<Contact[]>([]);
  const [score, setScore] = useState({ whales: 0, false: 0, sharks: 0 });
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);
  const idc = useRef(1);

  useEffect(() => {
    if (!running) return;
    cRef.current = [];
    setScore({ whales: 0, false: 0, sharks: 0 });
    setTime(30);
    let last = performance.now();
    let spawn = 0.4;
    let secAcc = 0;
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000) * fxr.current.speed;
      last = now;
      sweepRef.current = (sweepRef.current + dt * 110) % 360;
      setSweep(sweepRef.current);
      spawn -= dt;
      if (spawn <= 0) {
        const k = Math.random();
        cRef.current.push({ id: idc.current++, a: Math.random() * 360, r: 30 + Math.random() * (RAD - 40), va: (Math.random() - 0.5) * 30, vr: (Math.random() - 0.5) * 12, kind: k < 0.4 ? "whale" : k < 0.8 ? "noise" : "shark", seen: 0 });
        spawn = 0.9 + Math.random() * 0.8;
      }
      for (const c of cRef.current) {
        c.a = (c.a + c.va * dt + 360) % 360;
        c.r = Math.max(20, Math.min(RAD - 10, c.r + c.vr * dt));
        const d = Math.abs(((sweepRef.current - c.a + 540) % 360) - 180);
        if (d < 3) {
          c.seen = 1;
          if (c.kind === "whale") fxr.current.sfx("tick");
        } else c.seen = Math.max(0, c.seen - dt * 0.55);
      }
      cRef.current = cRef.current.filter((c) => !(c.tagged && c.seen <= 0));
      if (cRef.current.length > 9) cRef.current.shift();
      setContacts([...cRef.current]);
      secAcc += dt;
      if (secAcc >= 1) {
        secAcc -= 1;
        setTime((t) => {
          if (t - 1 <= 0) {
            setRunning(false);
            fxr.current.sfx("win");
            return 0;
          }
          if (t - 1 <= 5) fxr.current.sfx("tick");
          return t - 1;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const [event, setEvent] = useState<{ id: number; text: string; sub: string; inflow: boolean } | null>(null);
  useEffect(() => {
    if (!event) return;
    const t = window.setTimeout(() => setEvent(null), fx.ms(2200));
    return () => window.clearTimeout(t);
  }, [event, fx]);

  const tag = (c: Contact) => {
    if (!running || c.tagged || c.seen < 0.2) return;
    c.tagged = true;
    const s = scopeRef.current ? juice.local(scopeRef.current) : { x: 143, y: 250 };
    const rad = (c.a * Math.PI) / 180;
    const px = s.x + Math.sin(rad) * c.r;
    const py = s.y - Math.cos(rad) * c.r;
    if (c.kind === "whale") {
      setScore((x) => ({ ...x, whales: x.whales + 1 }));
      fx.sfx("coin");
      fx.haptic([10, 10, 30]);
      juice.ring(px, py, D.green);
      juice.pop("WHALE +1", px, py - 20, D.green, 18);
      juice.burst(px, py, { count: 20, shape: "star", glow: true, colors: [D.green, "#fff"], speed: 5, size: 7 });
      // reveal the on-chain event behind the blip
      const amt = (800 + Math.round(Math.random() * 4200)).toLocaleString("en-US");
      const coin = ["BTC", "ETH", "SOL", "USDT"][Math.floor(Math.random() * 4)];
      const to = ["Binance", "Coinbase", "cold wallet", "OKX", "unknown"][Math.floor(Math.random() * 5)];
      const inflow = to !== "cold wallet" && to !== "unknown";
      setEvent({ id: c.id, text: `${amt} ${coin} → ${to}`, sub: inflow ? "Exchange inflow · possible sell pressure" : "Moved to storage · supply leaving market", inflow });
      fx.sfx("reveal");
    } else if (c.kind === "shark") {
      setScore((x) => ({ ...x, sharks: x.sharks + 1 }));
      fx.sfx("lose");
      fx.haptic([50, 30, 50]);
      juice.shake(0.9);
      juice.flash(D.red, 0.25);
      juice.pop("WASH TRADE", px, py - 20, D.red, 18);
    } else {
      setScore((x) => ({ ...x, false: x.false + 1 }));
      fx.sfx("tick");
      fx.haptic(8);
      juice.pop("noise", px, py - 20, "#8d98bf", 14);
    }
  };

  const net = score.whales * 10 - score.false * 3 - score.sharks * 8;

  return (
    <div className="relative flex h-full flex-col px-4 pb-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-wide text-white/45">On-chain scanner</div>
          <div className="text-xl font-black">Whale radar</div>
        </div>
        <Tag color={time <= 5 && running ? D.red : D.green}>
          <Led on={running} color={D.green} size={8} blink /> {String(time).padStart(2, "0")}s
        </Tag>
      </div>

      <div className="relative mt-3 flex justify-center">
        <div className="relative rounded-full p-[10px]" style={{ background: "linear-gradient(145deg, #2c3860, #161d33)", boxShadow: "var(--e3), inset 0 2px 0 rgba(255,255,255,.14)" }}>
          <div ref={scopeRef} className="relative overflow-hidden rounded-full" style={{ width: RAD * 2, height: RAD * 2, background: "radial-gradient(circle, #0f2a1e 0%, #0b1a16 60%, #0b1022 100%)", boxShadow: "inset 5px 5px 14px rgba(0,0,0,.8)" }}>
            <svg className="absolute inset-0" viewBox={`0 0 ${RAD * 2} ${RAD * 2}`}>
              {[0.33, 0.66, 1].map((f) => (
                <circle key={f} cx={RAD} cy={RAD} r={RAD * f - 2} fill="none" stroke="rgba(79,185,107,.25)" strokeWidth={1} />
              ))}
              <line x1={RAD} x2={RAD} y1={0} y2={RAD * 2} stroke="rgba(79,185,107,.2)" />
              <line x1={0} x2={RAD * 2} y1={RAD} y2={RAD} stroke="rgba(79,185,107,.2)" />
              {Array.from({ length: 36 }, (_, i) => {
                const a = (i / 36) * Math.PI * 2;
                return <line key={i} x1={RAD + Math.sin(a) * (RAD - 8)} y1={RAD - Math.cos(a) * (RAD - 8)} x2={RAD + Math.sin(a) * (RAD - (i % 9 === 0 ? 16 : 11))} y2={RAD - Math.cos(a) * (RAD - (i % 9 === 0 ? 16 : 11))} stroke="rgba(79,185,107,.5)" strokeWidth={1} />;
              })}
            </svg>
            <div className="absolute inset-0 origin-center" style={{ transform: `rotate(${sweep}deg)`, background: "conic-gradient(from 0deg, rgba(127,224,154,.55) 0deg, rgba(127,224,154,.12) 40deg, transparent 70deg)" }} />
            <div className="absolute left-1/2 top-0 h-1/2 w-[2px] origin-bottom -translate-x-1/2" style={{ transform: `translateX(-50%) rotate(${sweep}deg)`, background: "linear-gradient(180deg, #7fe09a, transparent)", boxShadow: "0 0 8px #7fe09a" }} />
            {contacts.map((c) => {
              const rad = (c.a * Math.PI) / 180;
              const x = RAD + Math.sin(rad) * c.r;
              const y = RAD - Math.cos(rad) * c.r;
              const size = c.kind === "whale" ? 22 : c.kind === "shark" ? 18 : 12;
              const col = c.tagged ? (c.kind === "whale" ? D.green : c.kind === "shark" ? D.red : "#8d98bf") : "#7fe09a";
              return (
                <button key={c.id} onClick={() => tag(c)} aria-label={`contact ${c.id}`} className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full" style={{ left: x, top: y, width: size + 14, height: size + 14, opacity: Math.max(0.05, c.seen), transition: "opacity .1s" }}>
                  <span className="rounded-full" style={{ width: size, height: size, background: c.kind === "whale" ? "radial-gradient(circle, #fff, #7fe09a 50%, transparent 70%)" : c.kind === "shark" ? "radial-gradient(circle, #fff, #7fe09a 40%, transparent 70%)" : "radial-gradient(circle, #7fe09a, transparent 70%)", boxShadow: `0 0 ${size}px ${col}`, filter: c.tagged ? `drop-shadow(0 0 4px ${col})` : undefined }} />
                  {c.tagged && <span className="absolute -top-3 text-[9px] font-black uppercase" style={{ color: col }}>{c.kind === "whale" ? "🐳" : c.kind === "shark" ? "⚠" : "·"}</span>}
                  {!c.tagged && c.kind === "whale" && c.seen > 0.5 && <span className="absolute inset-0 animate-ping rounded-full border border-[#7fe09a]/60" />}
                </button>
              );
            })}
            <span className="pointer-events-none absolute inset-0 rounded-full" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.12) 0 1px, transparent 1px 3px)" }} />
            <span className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,.6)" }} />
          </div>
        </div>
      </div>

      <div className="relative h-0">
        <AnimatePresence>
          {event && (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20, scale: 0.85, rotateX: -40 }}
              animate={{ opacity: 1, y: -64, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: -80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              className="skeu-raised absolute inset-x-2 z-20 rounded-2xl px-3 py-2.5"
              style={{ boxShadow: `var(--e2), 0 0 0 1.5px ${event.inflow ? D.red : D.green}, 0 0 22px ${event.inflow ? D.red : D.green}55`, transformPerspective: 600 }}
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: event.inflow ? D.red : D.green }}>
                <Led on color={event.inflow ? D.red : D.green} size={7} blink /> Event revealed
              </div>
              <div className="mt-0.5 font-mono text-[15px] font-bold">{event.text}</div>
              <div className="text-[11px] font-bold text-white/55">{event.sub}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Readout label="Whales" value={score.whales} size={20} color={D.green} />
        <Readout label="Noise" value={score.false} size={20} color="#8d98bf" />
        <Readout label="Wash" value={score.sharks} size={20} color={D.red} />
      </div>

      <div className="flex-1" />
      <div className="mb-2 text-center text-sm font-bold text-white/55">
        {running ? "Tap big pulsing blips (whales). Small = noise. Bright-and-small = wash trades." : time === 0 ? `Edge score ${net}. ${net >= 40 ? "Alpha." : net >= 15 ? "Decent signal." : "Mostly noise."}` : "A sweep reveals contacts briefly. Tag the whales."}
      </div>
      <DuoButton full tone={running ? "ghost" : "green"} onClick={() => (running ? setRunning(false) : setRunning(true))}>
        <Radar size={18} strokeWidth={3} /> {running ? "Stop scan" : time === 0 ? "Scan again" : "Start scan"}
      </DuoButton>
    </div>
  );
}


