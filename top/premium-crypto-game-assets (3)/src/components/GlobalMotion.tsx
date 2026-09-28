import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { clamp, damp, useCoarsePointer, useRafLoop, useReduceMotion } from "./motion";
import { cn } from "../utils/cn";

type Pointer = { x: number; y: number; visible: boolean };

/** Page-level motion layer: progress, hero parallax, cursor response and milestones. */
export default function GlobalMotion() {
  const [progress, setProgress] = useState(0);
  const [visibleTop, setVisibleTop] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);
  const pointerTarget = useRef<Pointer>({ x: 0, y: 0, visible: false });
  const pointerCurrent = useRef<Pointer>({ x: 0, y: 0, visible: false });
  const auraRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotion();
  const coarse = useCoarsePointer();
  const reachedRef = useRef(new Set<number>());

  useEffect(() => {
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const next = clamp(window.scrollY / max, 0, 1);
      setProgress(next);
      setVisibleTop(window.scrollY > window.innerHeight * 1.15);
      document.documentElement.style.setProperty("--hero-shift", `${Math.min(72, window.scrollY * .085)}px`);
      document.documentElement.style.setProperty("--page-progress", `${next}`);

      for (const point of [25, 50, 75, 100]) {
        if (next * 100 >= point && !reachedRef.current.has(point)) {
          reachedRef.current.add(point);
          setMilestone(point);
          window.setTimeout(() => setMilestone((value) => value === point ? null : value), 2400);
          break;
        }
      }
    };
    const requestMeasure = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
    };
  }, []);

  useEffect(() => {
    if (coarse || reduce) return;
    const move = (event: PointerEvent) => {
      pointerTarget.current = { x: event.clientX, y: event.clientY, visible: true };
    };
    const leave = () => { pointerTarget.current.visible = false; };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, [coarse, reduce]);

  useRafLoop((_, delta) => {
    if (coarse || reduce) return;
    const current = pointerCurrent.current;
    const target = pointerTarget.current;
    current.x = damp(current.x, target.x, 18, delta);
    current.y = damp(current.y, target.y, 18, delta);
    current.visible = target.visible;
    if (auraRef.current) {
      auraRef.current.style.transform = `translate3d(${current.x - 18}px,${current.y - 18}px,0)`;
      auraRef.current.style.opacity = current.visible ? ".5" : "0";
    }
    if (dotRef.current) {
      dotRef.current.style.transform = `translate3d(${target.x - 2}px,${target.y - 2}px,0)`;
      dotRef.current.style.opacity = target.visible ? ".65" : "0";
    }
  }, !coarse && !reduce);

  return (
    <>
      <div className="fixed top-16 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-white/[.03]">
        <div className="h-full origin-left bg-gradient-to-r from-sky via-violet to-bull shadow-[0_0_12px_rgba(61,165,255,.7)]" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {!coarse && !reduce && <>
        <div ref={auraRef} className="fixed top-0 left-0 w-9 h-9 rounded-full border border-sky/45 bg-sky/[.05] pointer-events-none z-[100] transition-opacity duration-200 mix-blend-screen" />
        <div ref={dotRef} className="fixed top-0 left-0 w-1 h-1 rounded-full bg-white pointer-events-none z-[101] transition-opacity duration-100" />
      </>}

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed right-4 bottom-4 z-40 btn3d v-sky w-11 h-11 !p-0 !rounded-full transition-all duration-300",
          visibleTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none",
        )}
        style={{ ["--lip" as string]: "4px" }}
        aria-label="Back to top"
      >
        <Icon name="arrowUp" size={17} stroke={3} />
      </button>

      {milestone && (
        <div key={milestone} className="fixed right-4 top-20 z-[70] glass rounded-2xl p-3 flex items-center gap-3 shadow-2xl anim-bounce-in max-w-[260px]">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#3a2500] shadow-[0_3px_0_#b07600] grid place-items-center"><Icon name={milestone === 100 ? "trophy" : "bolt"} size={20} /></span>
          <div><div className="text-[8px] uppercase tracking-widest font-black text-gold">Catalog milestone</div><div className="text-xs font-black">{milestone === 100 ? "Full system explored" : `${milestone}% explored`}</div></div>
          <button onClick={() => setMilestone(null)} className="ml-auto text-mist"><Icon name="x" size={13} /></button>
        </div>
      )}
    </>
  );
}