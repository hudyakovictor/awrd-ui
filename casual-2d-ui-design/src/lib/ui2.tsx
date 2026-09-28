import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";

/* ─── 3D pointer tilt (physics) ─── */
export function Tilt({ children, max = 10, scale = 1.03, className = "", style }: {
  children: ReactNode; max?: number; scale?: number; className?: string; style?: CSSProperties;
}) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 190, damping: 15 });
  const sry = useSpring(ry, { stiffness: 190, damping: 15 });
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div ref={ref} className={className}
      style={{ ...style, rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 700 }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx.set(-py * max); ry.set(px * max);
      }}
      onPointerLeave={() => { rx.set(0); ry.set(0); }}
      whileHover={{ scale }} whileTap={{ scale: scale * 0.97 }}>
      {children}
    </motion.div>
  );
}

/* ─── magnetic pull toward cursor ─── */
export function Magnet({ children, strength = 0.25, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 160, damping: 13 });
  const sy = useSpring(y, { stiffness: 160, damping: 13 });
  const ref = useRef<HTMLDivElement>(null);
  return (
    <motion.div ref={ref} className={className} style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

/* ─── animated number ─── */
export function CountUp({ value, duration = 0.8, className = "", style }: { value: number; duration?: number; className?: string; style?: CSSProperties }) {
  const [disp, setDisp] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, {
      duration, ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisp(Math.round(v)),
    });
    prev.current = value;
    return () => c.stop();
  }, [value, duration]);
  return <motion.span key={value} initial={{ scale: 1 }} className={className} style={style}>{disp.toLocaleString("ru-RU")}</motion.span>;
}

/* ─── stepper with pop ─── */
export function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const bump = (d: number) => {
    const v = Math.max(min, Math.min(max, value + d));
    if (v !== value) onChange(v);
  };
  const BTN = ({ d, ch }: { d: number; ch: string }) => (
    <motion.button whileTap={{ scale: 0.82 }} onClick={() => bump(d)}
      className="grid h-8 w-8 place-items-center rounded-[10px] font-display text-[16px] font-black text-[#04303f]"
      style={{ background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -3px 0 #056a80" }}>{ch}</motion.button>
  );
  return (
    <div className="flex items-center gap-2.5">
      <BTN d={-1} ch="−" />
      <motion.span key={value} initial={{ scale: 1.35 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="well grid h-8 min-w-[52px] place-items-center px-2 font-num text-[15px] font-bold text-white">{value}</motion.span>
      <BTN d={1} ch="+" />
    </div>
  );
}

/* ─── segmented control ─── */
export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="well relative flex gap-1 p-1">
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} className="relative flex-1 rounded-full px-3 py-1.5">
          {value === o.id && (
            <motion.span layoutId="seg-active" className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -3px 0 #056a80" }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }} />
          )}
          <span className={`relative font-display text-[11px] font-extrabold uppercase italic ${value === o.id ? "text-[#04303f]" : "text-sky/60"}`}>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export const useReduced = () => {
  const [r, setR] = useState(false);
  useEffect(() => { setR(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  return r;
};
