import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { FxCtx, useFx, type Sfx } from "./fx";
import { Particles, type BurstOpts, type ParticlesHandle } from "./Particles";
import { track } from "./stats";

/**
 * JUICE LAYER v3 — per-screen VFX engine.
 *  • shake / flash / pop / combo / ring / shockwave / burst / cannon / rain / confetti / slowmo
 *  • every call is counted in the session store (VFX Console)
 *  • global intensity (Low / Normal / High) scales particles, shake and flash
 *  • `onEvent` reports interact / success / error / lock / reveal to the owning scene
 */

export type SceneEvent = "interact" | "success" | "error" | "lock" | "reveal";

type Pop = { id: number; text: string; x: number; y: number; color: string; size: number };
type Ring = { id: number; x: number; y: number; color: string; big: boolean };
type Flash = { id: number; color: string; o: number };

export interface Juice {
  shake: (power?: number) => void;
  flash: (color?: string, opacity?: number) => void;
  pop: (text: string, x: number, y: number, color?: string, size?: number) => void;
  combo: (text: string, x: number, y: number, step?: number) => void;
  ring: (x: number, y: number, color?: string, big?: boolean) => void;
  shockwave: (x: number, y: number, color?: string) => void;
  burst: (x: number, y: number, o?: BurstOpts) => void;
  cannon: (side: "left" | "right" | "both", colors?: string[]) => void;
  rain: (colors?: string[], count?: number) => void;
  confetti: () => void;
  slowmo: (on: boolean) => void;
  local: (el: Element) => { x: number; y: number };
  size: () => { w: number; h: number };
}

const noop = () => {};
const NOOP: Juice = {
  shake: noop, flash: noop, pop: noop, combo: noop, ring: noop, shockwave: noop,
  burst: noop, cannon: noop, rain: noop, confetti: noop, slowmo: noop,
  local: () => ({ x: 0, y: 0 }),
  size: () => ({ w: 286, h: 588 }),
};
const JuiceCtx = createContext<Juice>(NOOP);
export const useJuice = () => useContext(JuiceCtx);

export const CONFETTI = ["#f97316", "#fbbf24", "#3b82f6", "#22c55e", "#8b5cf6", "#f472b6"];
export const COMBO_COLORS = ["#4ade80", "#fbbf24", "#fb923c", "#f97316", "#ef4444", "#8b5cf6"];
const COMBO_RE = /×|combo|multi|streak|fever/i;
const SUCCESS = new Set<Sfx>(["win", "fanfare", "levelup"]);
const ERROR = new Set<Sfx>(["lose", "error"]);
const LOCK = new Set<Sfx>(["lock", "stamp"]);
let uid = 0;

export function JuiceLayer({ children, onEvent }: { children: ReactNode; onEvent?: (e: SceneEvent) => void }) {
  const fx = useFx();
  const fxr = useRef(fx);
  fxr.current = fx;
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pr = useRef<ParticlesHandle>(null);
  const lastPt = useRef({ x: 143, y: 300 });
  const [pops, setPops] = useState<Pop[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [slow, setSlow] = useState(false);

  const juice = useMemo<Juice>(() => {
    const size = () => ({ w: root.current?.offsetWidth ?? 286, h: root.current?.offsetHeight ?? 588 });
    /** single entry point for particles: scales by intensity, counts, respects reduced motion */
    const emit = (x: number, y: number, o: BurstOpts = {}) => {
      const f = fxr.current;
      if (f.reduced) return;
      const count = Math.max(1, Math.round((o.count ?? 40) * f.k));
      track("particles", count);
      pr.current?.burst(x, y, { ...o, count });
    };
    const api: Juice = {
      shake(power = 1) {
        const f = fxr.current;
        track("shake", 1, `shake · ${power.toFixed(1)}`);
        track("effects");
        if (f.reduced || !stage.current) return;
        const p = power * Math.min(1.5, f.k);
        const a = 7 * p;
        const kf: Keyframe[] = Array.from({ length: 8 }, (_, i) => {
          const k = 1 - i / 8;
          return { translate: `${((Math.random() * 2 - 1) * a * k).toFixed(1)}px ${((Math.random() * 2 - 1) * a * k).toFixed(1)}px`, rotate: `${((Math.random() * 2 - 1) * p * 0.9 * k).toFixed(2)}deg` };
        });
        kf.push({ translate: "0px 0px", rotate: "0deg" });
        stage.current.animate(kf, { duration: 460 / f.speed, easing: "cubic-bezier(.2,.7,.3,1)" });
      },
      flash(color = "#fff", o = 0.5) {
        const f = fxr.current;
        track("flash", 1, "flash");
        track("effects");
        o = Math.min(0.7, o * Math.min(1.25, f.k));
        if (f.reduced) o *= 0.35;
        const id = ++uid;
        setFlashes((s) => [...s.slice(-3), { id, color, o }]);
        window.setTimeout(() => setFlashes((s) => s.filter((x) => x.id !== id)), 700);
      },
      pop(text, x, y, color = "#fff", sz = 24) {
        track("effects");
        if (COMBO_RE.test(text)) track("combo", 1, `combo · ${text}`);
        const id = ++uid;
        setPops((s) => [...s.slice(-10), { id, text, x, y, color, size: sz }]);
        window.setTimeout(() => setPops((s) => s.filter((p) => p.id !== id)), 1200 / fxr.current.speed);
      },
      combo(text, x, y, step = 0) {
        track("combo", 1, `combo · ${text}`);
        const color = COMBO_COLORS[Math.min(step, COMBO_COLORS.length - 1)];
        const id = ++uid;
        track("effects");
        setPops((s) => [...s.slice(-10), { id, text, x, y, color, size: Math.min(26 + step * 4, 52) }]);
        window.setTimeout(() => setPops((s) => s.filter((p) => p.id !== id)), 1200 / fxr.current.speed);
        api.ring(x, y, color, step >= 3);
        if (step >= 2) emit(x, y, { count: 10 + step * 4, shape: "star", glow: true, colors: [color, "#fff"], speed: 5 + step, gravity: 0.06, size: 8, life: 30 });
      },
      ring(x, y, color = "#fff", big = false) {
        track("effects");
        if (fxr.current.reduced) return;
        const id = ++uid;
        setRings((s) => [...s.slice(-10), { id, x, y, color, big }]);
        window.setTimeout(() => setRings((s) => s.filter((r) => r.id !== id)), 900);
      },
      shockwave(x, y, color = "#fb923c") {
        track("effects", 1, "shockwave");
        if (fxr.current.reduced) return;
        api.ring(x, y, "#ffffff", true);
        window.setTimeout(() => api.ring(x, y, color, true), 70);
        window.setTimeout(() => api.ring(x, y, color, false), 140);
        api.flash(color, 0.16);
        api.shake(0.5);
        emit(x, y, { count: 26, shape: "spark", glow: true, colors: [color, "#fff"], speed: 10, gravity: 0, life: 30 });
      },
      burst(x, y, o) {
        track("effects");
        emit(x, y, o);
      },
      cannon(side = "both", colors = CONFETTI) {
        track("effects", 1, "confetti cannon");
        const { w, h } = size();
        if (side === "left" || side === "both") emit(0, h * 0.55, { count: 55, colors, angle: -Math.PI / 4.5, spread: 0.55, speed: 12, gravity: 0.24, size: 9, life: 95 });
        if (side === "right" || side === "both") emit(w, h * 0.55, { count: 55, colors, angle: (-Math.PI * 3.5) / 4.5, spread: 0.55, speed: 12, gravity: 0.24, size: 9, life: 95 });
      },
      rain(colors = ["#ffc800", "#ffe066", "#fff4b8"], count = 70) {
        track("effects", 1, "coin rain");
        const { w } = size();
        for (let i = 0; i < 7; i++) {
          window.setTimeout(() => {
            emit(w / 2, -10, { count: Math.round(count / 7), colors, shape: "circle", angle: Math.PI / 2, spread: 0.5, speed: 3, gravity: 0.28, size: 9, life: 90, jitterX: w });
          }, i * 70);
        }
      },
      confetti() {
        track("effects", 1, "confetti");
        const { w, h } = size();
        emit(0, h * 0.35, { count: 60, colors: CONFETTI, angle: -Math.PI / 3.2, spread: 0.8, speed: 13, gravity: 0.25, size: 9, life: 95 });
        emit(w, h * 0.35, { count: 60, colors: CONFETTI, angle: (-Math.PI * 2.2) / 3.2, spread: 0.8, speed: 13, gravity: 0.25, size: 9, life: 95 });
      },
      slowmo(on: boolean) {
        if (on) track("effects", 1, "slow-mo");
        setSlow(on);
      },
      local(el) {
        const r = root.current!.getBoundingClientRect();
        const e = el.getBoundingClientRect();
        const k = root.current!.offsetWidth / r.width || 1;
        return { x: (e.left + e.width / 2 - r.left) * k, y: (e.top + e.height / 2 - r.top) * k };
      },
      size,
    };
    return api;
  }, []);

  /* Mirror every game sound as a visual effect + report scene events */
  const fxOverride = useMemo(() => {
    const react = (s: Sfx) => {
      const { x, y } = lastPt.current;
      const { w } = juice.size();
      if (SUCCESS.has(s)) onEventRef.current?.("success");
      else if (ERROR.has(s)) onEventRef.current?.("error");
      else if (LOCK.has(s)) onEventRef.current?.("lock");
      else if (s === "reveal") onEventRef.current?.("reveal");
      switch (s) {
        case "win":
        case "fanfare":
          juice.flash("#22c55e", 0.16);
          juice.burst(w / 2, -6, { count: 26, shape: "star", glow: true, colors: ["#fbbf24", "#fff", "#4ade80"], angle: Math.PI / 2, spread: 1.4, speed: 5, gravity: 0.12, size: 10, life: 70, jitterX: w * 0.8 });
          break;
        case "levelup":
          juice.shockwave(x, y, "#fbbf24");
          break;
        case "lose":
        case "error":
          juice.flash("#ef4444", 0.22);
          juice.shake(0.7);
          break;
        case "lock":
        case "stamp":
          juice.flash("#ffffff", 0.2);
          juice.shake(0.55);
          juice.ring(x, y, "#fb923c", true);
          break;
        case "reveal":
          juice.shockwave(w / 2, y, "#3b82f6");
          break;
        case "coin":
          juice.burst(x, y, { count: 10, shape: "star", glow: true, colors: ["#fbbf24", "#fff"], speed: 4, gravity: 0.08, size: 8, life: 34 });
          break;
        case "glitch":
          juice.shake(1.6);
          juice.flash("#8b5cf6", 0.25);
          break;
        case "drop":
          juice.shake(0.35);
          break;
        default:
          break;
      }
    };
    return { ...fx, sfx: (s: Sfx) => { fx.sfx(s); react(s); } };
  }, [fx, juice]);

  const onDown = (e: React.PointerEvent) => {
    if (!root.current) return;
    onEventRef.current?.("interact");
    const r = root.current.getBoundingClientRect();
    const k = root.current.offsetWidth / r.width || 1;
    const x = (e.clientX - r.left) * k;
    const y = (e.clientY - r.top) * k;
    lastPt.current = { x, y };
    const t = (e.target as HTMLElement).closest<HTMLElement>("button,[role=button],[role=switch]");
    if (!t || (t as HTMLButtonElement).disabled) return;
    juice.ring(x, y, "rgba(255,255,255,.75)");
    if (fxr.current.reduced) return;
    const n = Math.max(2, Math.round(7 * fxr.current.k));
    track("particles", n);
    pr.current?.burst(x, y, { count: n, shape: "star", glow: true, colors: ["#ffffff", "#fbbf24", "#fb923c"], speed: 3.4, gravity: 0.04, size: 7, life: 26 });
    t.animate([{ scale: "1" }, { scale: "0.9" }, { scale: "1.07" }, { scale: "0.98" }, { scale: "1" }], { duration: 360, easing: "ease-out" });
  };

  return (
    <JuiceCtx.Provider value={juice}>
      <FxCtx.Provider value={fxOverride}>
        <div ref={root} className="absolute inset-0 overflow-hidden" onPointerDownCapture={onDown}>
          <div ref={stage} className="absolute inset-0">
            {children}
          </div>

          <AnimatePresence>
            {flashes.map((f) => (
              <motion.div key={f.id} className="pointer-events-none absolute inset-0 z-[60]" style={{ background: f.color }} initial={{ opacity: f.o }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {slow && (
              <motion.div
                key="slow"
                className="pointer-events-none absolute inset-0 z-[59]"
                style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(92,200,255,.28) 100%)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {rings.map((r) => (
            <motion.div
              key={r.id}
              className="pointer-events-none absolute z-[61] rounded-full"
              style={{ left: r.x, top: r.y, width: 24, height: 24, marginLeft: -12, marginTop: -12, border: `${r.big ? 5 : 3}px solid ${r.color}`, boxShadow: `0 0 18px ${r.color}` }}
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: r.big ? 9 : 3.2, opacity: 0 }}
              transition={{ duration: r.big ? 0.7 : 0.45, ease: "easeOut" }}
            />
          ))}

          {pops.map((p) => (
            <motion.div
              key={p.id}
              className="pointer-events-none absolute z-[62] whitespace-nowrap font-black"
              style={{ left: p.x, top: p.y, fontSize: p.size, color: p.color, x: "-50%", textShadow: "0 3px 0 rgba(10,18,48,.85), 0 0 18px rgba(0,0,0,.35)", WebkitTextStroke: "1.5px rgba(10,18,48,.6)" }}
              initial={{ y: 0, scale: 0.2, opacity: 0, rotate: (p.id % 2 ? 1 : -1) * 12 }}
              animate={{ y: [0, -30, -58], scale: [0.2, 1.35, 1], opacity: [0, 1, 1, 0], rotate: 0 }}
              transition={{ duration: 1.05 / fx.speed, times: [0, 0.25, 1], ease: "easeOut" }}
            >
              {p.text}
            </motion.div>
          ))}

          <Particles ref={pr} className="z-[63]" />
        </div>
      </FxCtx.Provider>
    </JuiceCtx.Provider>
  );
}
