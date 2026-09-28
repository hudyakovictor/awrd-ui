import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LayoutGrid, RotateCcw, SkipBack, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BlockMeta } from "../blocks/registry";
import { FEATURED, INTERACTION_ICON, interactionsOf } from "../blocks/tags";
import { useFx } from "../fx/fx";
import { CAT_COLORS } from "./BlockCard";
import { STATE_META, SceneStage, StateChip, useScene } from "./Scene";

function useScale() {
  const [s, setS] = useState(1);
  useEffect(() => {
    const f = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const byH = (h - 230) / 620;
      const byW = w >= 1024 ? 1.2 : (w - 32) / 300;
      setS(Math.max(0.82, Math.min(1.2, byH, byW)));
    };
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return s;
}

function Stage({ b, onPrev, onNext, index, total }: { b: BlockMeta; onPrev: () => void; onNext: () => void; index: number; total: number }) {
  const fx = useFx();
  const scene = useScene();
  const scale = useScale();
  const Cmp = b.Component;
  const accent = CAT_COLORS[b.category] ?? "#fb923c";
  const m = STATE_META[scene.state];

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key.toLowerCase() === "r") scene.replay();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [scene]);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_300px]">
      <div className="relative flex justify-center py-2">
        <SceneStage scene={scene} scale={scale} showBar={false}>
          <Cmp />
        </SceneStage>
      </div>

      <motion.div initial={fx.reduced ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 220, damping: 24 }} className="flex flex-col gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip uppercase" style={{ color: accent }}>{b.category}</span>
            {FEATURED.has(b.id) && (
              <span className="chip uppercase" style={{ color: "#fbbf24" }}>
                <Sparkles size={12} strokeWidth={3} /> Scene
              </span>
            )}
            <span className="font-mono text-[13px] font-bold text-white/35">
              {index + 1}/{total}
            </span>
          </div>
          <h2 className="font-display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] font-black leading-[1.05]">{b.title}</h2>
        </div>

        <div className="panel-glow rounded-2xl p-4">
          <div className="text-[11px] font-black uppercase tracking-[.18em] text-white/40">Interactions</div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {interactionsOf(b).map((i) => (
              <div key={i} className="inset-well flex items-center gap-2.5 rounded-xl px-3 py-2.5">
                <span className="text-xl" aria-hidden>
                  {INTERACTION_ICON[i]}
                </span>
                <span className="text-[16px] font-black">{i}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-glow rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-black uppercase tracking-[.18em] text-white/40">Scene state</div>
            <span className="font-mono text-[12px] font-bold text-white/40">run {scene.runs.n}</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <StateChip state={scene.state} />
            <span className="font-mono text-[13px] font-bold">
              <span className="text-[#22c55e]">{scene.runs.wins}✓</span> <span className="text-[#ef4444]">{scene.runs.fails}✗</span>
            </span>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {(["idle", "active", "success", "error"] as const).map((s) => (
              <div key={s} className="rounded-lg px-1 py-1.5 text-center text-[10.5px] font-black uppercase tracking-wide transition-all" style={scene.state === s ? { background: `${STATE_META[s].color}26`, color: STATE_META[s].color, boxShadow: `inset 0 0 0 1.5px ${STATE_META[s].color}` } : { color: "rgba(255,255,255,.3)", background: "rgba(0,0,0,.25)" }}>
                {STATE_META[s].label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => { fx.sfx("click"); scene.replay(); }} className={`duo-btn duo-orange ${scene.settled ? "animate-glow-pulse" : ""}`}>
            <RotateCcw size={17} strokeWidth={3} /> Replay
          </button>
          <button onClick={() => { fx.sfx("close"); scene.reset(); }} className="duo-btn duo-ghost">
            <SkipBack size={17} strokeWidth={3} /> Reset
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={onPrev} className="duo-btn duo-ghost duo-btn-sm">
            <ChevronLeft size={17} strokeWidth={3} /> Prev
          </button>
          <button onClick={onNext} className="duo-btn duo-ghost duo-btn-sm">
            Next <ChevronRight size={17} strokeWidth={3} />
          </button>
        </div>
        <div className="font-mono text-[12px] font-bold text-white/35">← → switch · R replay · Esc grid</div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/5" aria-hidden>
          <motion.div className="h-full" animate={{ width: `${m.step * 25}%`, background: m.color }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
        </div>
      </motion.div>
    </div>
  );
}

export function FocusView({ list, id, setId, onExit }: { list: BlockMeta[]; id: string; setId: (id: string) => void; onExit: () => void }) {
  const fx = useFx();
  const idx = Math.max(0, list.findIndex((b) => b.id === id));
  const b = list[idx];
  const [dir, setDir] = useState(1);
  const railRef = useRef<HTMLDivElement>(null);

  const go = (d: number) => {
    if (!list.length) return;
    setDir(d);
    setId(list[(idx + d + list.length) % list.length].id);
    fx.sfx("swipe");
    fx.haptic(6);
  };

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, list]);

  useEffect(() => {
    railRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: fx.reduced ? "auto" : "smooth" });
  }, [id, fx.reduced]);

  if (!b) return null;

  return (
    <section className="mt-6 grid gap-6 xl:grid-cols-[250px_1fr]" aria-label="Focus View">
      {/* block rail */}
      <div className="order-2 xl:order-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-[.18em] text-white/40">{list.length} blocks</span>
          <button onClick={onExit} className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-wide text-[#fb923c] hover:text-white">
            <LayoutGrid size={14} strokeWidth={3} /> Grid
          </button>
        </div>
        <div ref={railRef} className="no-scrollbar flex gap-2 overflow-x-auto pb-1 xl:max-h-[calc(100vh-230px)] xl:flex-col xl:overflow-y-auto xl:overflow-x-hidden">
          {list.map((x) => {
            const active = x.id === id;
            const col = CAT_COLORS[x.category] ?? "#fb923c";
            return (
              <button
                key={x.id}
                data-id={x.id}
                onClick={() => { setDir(list.indexOf(x) > idx ? 1 : -1); setId(x.id); fx.sfx("tick"); }}
                className="relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors xl:w-full"
                style={active ? { background: `linear-gradient(90deg, ${col}2e, rgba(10,15,36,.6))`, boxShadow: `inset 0 0 0 1.5px ${col}` } : { background: "rgba(10,15,36,.55)" }}
              >
                <span className="font-mono text-[11px] font-bold" style={{ color: col }}>{x.n}</span>
                <span className={`whitespace-nowrap text-[13.5px] font-black ${active ? "text-white" : "text-white/60"}`}>{x.title}</span>
                {FEATURED.has(x.id) && <Sparkles size={11} className="ml-auto shrink-0 text-[#fbbf24]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* stage */}
      <div className="panel-glow relative order-1 overflow-hidden rounded-[28px] p-5 md:p-7 xl:order-2">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={b.id}
            custom={dir}
            initial={fx.reduced ? false : { opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={fx.reduced ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative"
          >
            <Stage b={b} index={idx} total={list.length} onPrev={() => go(-1)} onNext={() => go(1)} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
