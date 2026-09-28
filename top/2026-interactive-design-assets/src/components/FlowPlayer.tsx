import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Hand, LayoutGrid, Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { BLOCKS, type BlockMeta } from "../blocks/registry";
import { SHOWCASE, interactionsOf } from "../blocks/tags";
import { useFx } from "../fx/fx";
import { CAT_COLORS } from "./BlockCard";
import { InteractionChips, SceneStage, StateChip, useScene } from "./Scene";

const BASE_MS = 9000;
const SPEEDS = [0.5, 1, 2] as const;

function useFitScale() {
  const [s, setS] = useState(1);
  useEffect(() => {
    const f = () => setS(Math.max(0.72, Math.min(1.1, (window.innerHeight - 190) / 620, (window.innerWidth - 32) / 300)));
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return s;
}

function LoopScene({ b, onInteract }: { b: BlockMeta; onInteract: () => void }) {
  const scene = useScene();
  const scale = useFitScale();
  const Cmp = b.Component;
  const cb = useRef(onInteract);
  cb.current = onInteract;
  const wrapped = {
    ...scene,
    onEvent: (e: Parameters<typeof scene.onEvent>[0]) => {
      if (e === "interact") cb.current();
      scene.onEvent(e);
    },
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <SceneStage scene={wrapped} scale={scale} showBar={false}>
        <Cmp />
      </SceneStage>
      <div className="flex items-center gap-2">
        <StateChip state={scene.state} />
        <button onClick={scene.replay} className="chip hover:text-white" aria-label="Replay scene">
          <RotateCcw size={13} strokeWidth={3} /> Replay
        </button>
      </div>
    </div>
  );
}

export function FlowPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fx = useFx();
  const scenes = useMemo(() => SHOWCASE.map((id) => BLOCKS.find((b) => b.id === id)).filter((b): b is BlockMeta => !!b), []);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const dur = BASE_MS / speed;

  const go = (n: number) => {
    if (n < 0) return;
    if (n >= scenes.length) {
      setDone(true);
      setPlaying(false);
      fx.sfx("fanfare");
      return;
    }
    setDir(n > i ? 1 : -1);
    setI(n);
    setElapsed(0);
    setUserPaused(false);
    fx.sfx("whoosh");
  };

  useEffect(() => {
    if (!open) return;
    setI(0);
    setElapsed(0);
    setDone(false);
    setPlaying(true);
    setUserPaused(false);
  }, [open]);

  // autoplay clock
  const goRef = useRef(go);
  goRef.current = go;
  const iRef = useRef(i);
  iRef.current = i;
  useEffect(() => {
    if (!open || !playing || done) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const d = now - last;
      last = now;
      setElapsed((e) => {
        const n = e + d;
        if (n >= dur) {
          window.setTimeout(() => goRef.current(iRef.current + 1), 0);
          return dur;
        }
        return n;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [open, playing, done, dur, i]);

  useEffect(() => {
    if (!open) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, i]);

  const S = scenes[i];
  const progress = Math.min(1, elapsed / dur);

  return (
    <AnimatePresence>
      {open && S && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(249,115,22,.1), rgba(3,5,12,.97) 70%)", backdropFilter: "blur(10px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Full Loop showcase"
        >
          {/* story progress */}
          <div className="fixed inset-x-0 top-0 z-10 flex gap-1.5 px-4 pt-3">
            {scenes.map((s, k) => (
              <button key={s.id} onClick={() => go(k)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10" aria-label={`Go to ${s.title}`}>
                <span className="block h-full rounded-full" style={{ width: `${k < i || done ? 100 : k === i ? progress * 100 : 0}%`, background: "linear-gradient(90deg,#fbbf24,#f97316)", boxShadow: k === i ? "0 0 8px #f97316" : undefined }} />
              </button>
            ))}
          </div>

          <button onClick={onClose} aria-label="Close Full Loop" className="duo-btn duo-ghost fixed right-4 top-6 z-10 !h-11 !w-11 !rounded-2xl !px-0">
            <X size={20} strokeWidth={3} />
          </button>

          <div className="mx-auto flex min-h-full max-w-6xl flex-col items-center justify-center gap-8 px-4 pb-8 pt-14 md:flex-row md:items-center">
            {/* playlist */}
            <ol className="hidden w-64 shrink-0 md:block" aria-label="Scenes">
              <li className="mb-3 font-display text-[13px] font-black tracking-wider text-white/40">
                FULL LOOP · {Math.min(i + 1, scenes.length)}/{scenes.length}
              </li>
              {scenes.map((s, k) => {
                const col = CAT_COLORS[s.category] ?? "#fb923c";
                const active = k === i && !done;
                return (
                  <li key={s.id}>
                    <button onClick={() => go(k)} className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-2 py-2 text-left">
                      {active && <span className="absolute inset-y-0 left-0 rounded-xl" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${col}33, transparent)` }} />}
                      <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold" style={k < i || done ? { background: "linear-gradient(180deg,#4ade80,#22c55e)", color: "#052e16" } : active ? { background: "linear-gradient(180deg,#fb923c,#f97316)", color: "#fff", boxShadow: "0 0 12px rgba(249,115,22,.6)" } : { background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.4)" }}>
                        {k + 1}
                      </span>
                      <span className={`relative text-[14px] font-black ${active ? "text-white" : "text-white/50"}`}>{s.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* stage */}
            <div className="flex min-w-0 flex-col items-center gap-4">
              <div className="text-center">
                <div className="font-mono text-[12px] font-bold text-white/40">
                  scene {i + 1}/{scenes.length} · {S.category}
                </div>
                <div className="font-display mt-1 text-2xl font-black md:text-3xl">{S.title}</div>
                <div className="mt-2 flex justify-center">
                  <InteractionChips list={interactionsOf(S)} size="sm" />
                </div>
              </div>

              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={S.id}
                  custom={dir}
                  initial={fx.reduced ? false : { x: dir * 120, opacity: 0, scale: 0.94, rotateY: dir * -12 }}
                  animate={{ x: 0, opacity: 1, scale: 1, rotateY: 0 }}
                  exit={fx.reduced ? { opacity: 0 } : { x: dir * -90, opacity: 0, scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 240, damping: 28 }}
                  style={{ transformPerspective: 1200 }}
                >
                  <LoopScene
                    b={S}
                    onInteract={() => {
                      if (playing) {
                        setPlaying(false);
                        setUserPaused(true);
                      }
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {userPaused && !playing && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="chip" style={{ color: "#fbbf24" }}>
                    <Hand size={13} strokeWidth={3} /> Paused while you play — press play to continue
                  </motion.div>
                )}
              </AnimatePresence>

              {/* controls */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous scene" className="duo-btn duo-ghost !h-12 !w-12 !rounded-2xl !px-0">
                  <ChevronLeft size={20} strokeWidth={3} />
                </button>
                <button onClick={() => { setPlaying((p) => !p); setUserPaused(false); fx.sfx("click"); }} className="duo-btn duo-orange min-w-[140px]" aria-label={playing ? "Pause" : "Play"}>
                  {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  {playing ? "Pause" : "Play"}
                </button>
                <button onClick={() => go(i + 1)} aria-label="Next scene" className="duo-btn duo-ghost !h-12 !w-12 !rounded-2xl !px-0">
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
                <div className="inset-well flex gap-1 rounded-xl p-1" role="radiogroup" aria-label="Showcase speed">
                  {SPEEDS.map((s) => (
                    <button key={s} role="radio" aria-checked={speed === s} onClick={() => { setSpeed(s); fx.sfx("click"); }} className="h-9 rounded-lg px-3 text-[13px] font-black transition-all" style={speed === s ? { background: "linear-gradient(180deg,#fb923c,#f97316)", color: "#fff", boxShadow: "0 3px 0 #c2410c" } : { color: "rgba(255,255,255,.5)" }}>
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
              <div className="font-mono text-[12px] font-bold text-white/35">
                {Math.ceil((dur - elapsed) / 1000)}s · space pause · ← → switch · esc exit
              </div>
            </div>
          </div>

          {/* finish */}
          <AnimatePresence>
            {done && (
              <motion.div className="fixed inset-0 z-20 grid place-items-center bg-[#03050c]/85 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="panel-glow w-full max-w-md rounded-[28px] p-8 text-center">
                  <div className="font-display text-3xl font-black">
                    Loop <span className="glow-ember">complete</span>
                  </div>
                  <p className="mt-3 text-[15px] font-bold text-white/55">{scenes.length} scenes shown. Head back to the catalog to test any of them in Focus View.</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={() => { setDone(false); go(0); setI(0); setPlaying(true); }} className="duo-btn duo-ghost">
                      <RotateCcw size={17} strokeWidth={3} /> Replay
                    </button>
                    <button onClick={onClose} className="duo-btn duo-orange">
                      <LayoutGrid size={17} strokeWidth={3} /> Catalog
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
