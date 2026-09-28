import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, SkipBack } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { SceneEvent } from "../fx/juice";
import { useFx } from "../fx/fx";
import { INTERACTION_ICON, type Interaction } from "../blocks/tags";
import { PhoneFrame } from "./PhoneFrame";

export type SceneState = "idle" | "active" | "success" | "error";

export const STATE_META: Record<SceneState, { label: string; color: string; step: number; hint: string }> = {
  idle: { label: "Ready", color: "#3b82f6", step: 1, hint: "Initial state" },
  active: { label: "Interacting", color: "#f97316", step: 2, hint: "Active interaction" },
  success: { label: "Success", color: "#22c55e", step: 3, hint: "Completed" },
  error: { label: "Error", color: "#ef4444", step: 4, hint: "Failed — reset or replay" },
};

export interface SceneApi {
  state: SceneState;
  settled: boolean;
  key: number;
  runs: { n: number; wins: number; fails: number };
  flare: { id: number; color: string } | null;
  onEvent: (e: SceneEvent) => void;
  replay: () => void;
  reset: () => void;
}

/** Four-state scene machine driven by events coming out of the block's JuiceLayer. */
export function useScene(): SceneApi {
  const [state, setState] = useState<SceneState>("idle");
  const [settled, setSettled] = useState(false);
  const [key, setKey] = useState(0);
  const [runs, setRuns] = useState({ n: 1, wins: 0, fails: 0 });
  const [flare, setFlare] = useState<SceneApi["flare"]>(null);
  const stateRef = useRef<SceneState>("idle");
  const timer = useRef<number | undefined>(undefined);
  const flareId = useRef(0);

  const set = (s: SceneState) => {
    stateRef.current = s;
    setState(s);
  };

  const onEvent = useCallback((e: SceneEvent) => {
    if (e === "interact") {
      window.clearTimeout(timer.current);
      setSettled(false);
      if (stateRef.current !== "active") set("active");
      return;
    }
    if (e === "lock" || e === "reveal") {
      if (stateRef.current === "idle") set("active");
      setFlare({ id: ++flareId.current, color: e === "lock" ? "#fb923c" : "#3b82f6" });
      return;
    }
    // success / error: light changes immediately, the completion bar waits for the block to calm down
    set(e);
    setFlare({ id: ++flareId.current, color: STATE_META[e].color });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setSettled(true);
      setRuns((r) => (stateRef.current === "success" ? { ...r, wins: r.wins + 1 } : stateRef.current === "error" ? { ...r, fails: r.fails + 1 } : r));
    }, 900);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const replay = useCallback(() => {
    window.clearTimeout(timer.current);
    set("idle");
    setSettled(false);
    setKey((k) => k + 1);
    setRuns((r) => ({ ...r, n: r.n + 1 }));
  }, []);

  const reset = useCallback(() => {
    window.clearTimeout(timer.current);
    set("idle");
    setSettled(false);
    setKey((k) => k + 1);
    setRuns({ n: 1, wins: 0, fails: 0 });
  }, []);

  return { state, settled, key, runs, flare, onEvent, replay, reset };
}

export function StateChip({ state }: { state: SceneState }) {
  const m = STATE_META[state];
  return (
    <span className="chip !h-8 gap-2 !pl-2.5" style={{ color: m.color }} aria-live="polite">
      <span className="flex gap-[3px]" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="h-2 w-[5px] rounded-sm transition-colors" style={{ background: i === m.step ? m.color : "rgba(255,255,255,.12)", boxShadow: i === m.step ? `0 0 6px ${m.color}` : undefined }} />
        ))}
      </span>
      {m.label}
    </span>
  );
}

export function InteractionChips({ list, size = "md" }: { list: Interaction[]; size?: "sm" | "md" }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {list.map((i) => (
        <span key={i} className={`chip ${size === "sm" ? "!h-7 !px-2.5 !text-[11.5px]" : ""}`} title={`${i} interaction`}>
          <span aria-hidden>{INTERACTION_ICON[i]}</span>
          {i}
        </span>
      ))}
    </span>
  );
}

/**
 * Phone + lighting that follows the scene state + completion bar.
 * `scale` enlarges the device without breaking pointer math (JuiceLayer compensates).
 */
export function SceneStage({ scene, children, scale = 1, showBar = true }: { scene: SceneApi; children: ReactNode; scale?: number; showBar?: boolean }) {
  const fx = useFx();
  const m = STATE_META[scene.state];
  const w = 300 * scale;
  const h = 620 * scale;

  return (
    <div className="relative flex flex-col items-center">
      {/* state lighting */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ width: w * 1.5, height: h * 0.9 }}
        animate={{ background: `radial-gradient(circle, ${m.color}${scene.state === "idle" ? "30" : "55"}, transparent 65%)`, opacity: scene.state === "idle" ? 0.55 : 0.95 }}
        transition={{ duration: fx.reduced ? 0 : 0.6 }}
        aria-hidden
      />
      <AnimatePresence>
        {scene.flare && !fx.reduced && (
          <motion.div
            key={scene.flare.id}
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[60px]"
            style={{ width: w + 20, height: h + 20, border: `3px solid ${scene.flare.color}`, boxShadow: `0 0 40px ${scene.flare.color}, inset 0 0 30px ${scene.flare.color}55` }}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 1.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <div className="relative" style={{ width: w, height: h }}>
        <div
          className="absolute left-0 top-0 rounded-[54px] transition-shadow duration-500"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left", boxShadow: `0 0 0 2px ${m.color}${scene.state === "idle" ? "22" : "88"}, 0 0 38px ${m.color}${scene.state === "idle" ? "11" : "44"}` }}
        >
          <PhoneFrame onEvent={scene.onEvent}>
            <motion.div
              key={scene.key}
              className="absolute inset-0"
              initial={scene.key === 0 || fx.reduced ? false : { opacity: 0, scale: 0.94, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.35 }}
            >
              {children}
            </motion.div>
          </PhoneFrame>
        </div>
      </div>

      {showBar && (
        <div className="relative mt-4 h-[52px] w-full" style={{ maxWidth: Math.max(300, w) }}>
          <AnimatePresence mode="wait">
            {scene.settled && (scene.state === "success" || scene.state === "error") ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ type: "spring", stiffness: 320, damping: 24 }}
                className="flex h-full items-center gap-2 rounded-2xl border px-2 pl-4"
                style={{ borderColor: `${m.color}66`, background: `linear-gradient(90deg, ${m.color}22, rgba(10,15,36,.9))`, boxShadow: `0 0 22px ${m.color}33` }}
              >
                <span className="flex-1 text-[14px] font-black" style={{ color: m.color }}>
                  {scene.state === "success" ? "Scene complete" : "Scene failed"}
                </span>
                <button onClick={() => { fx.sfx("click"); scene.replay(); }} className="duo-btn duo-orange duo-btn-sm !h-9 !px-3">
                  <RotateCcw size={15} strokeWidth={3} /> Replay
                </button>
                <button onClick={() => { fx.sfx("close"); scene.reset(); }} className="duo-btn duo-ghost duo-btn-sm !h-9 !px-3">
                  <SkipBack size={15} strokeWidth={3} /> Reset
                </button>
              </motion.div>
            ) : (
              <motion.div key="state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-between gap-2 px-1">
                <StateChip state={scene.state} />
                <span className="font-mono text-[12px] font-bold text-white/40">
                  run {scene.runs.n} · <span className="text-[#22c55e]">{scene.runs.wins}✓</span> <span className="text-[#ef4444]">{scene.runs.fails}✗</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
