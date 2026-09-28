import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE, SPRING } from "../motion/tokens";

/* ============================================================
   REVEAL — появление при скролле, 4 режима
   ============================================================ */
export function Reveal({
  children, mode = "up", delay = 0, className = "", once = true, amount = 0.25,
}: { children: ReactNode; mode?: "up" | "mask" | "scale" | "flip" | "blur"; delay?: number; className?: string; once?: boolean; amount?: number }) {
  const v =
    mode === "up" ? { initial: { y: 50, opacity: 0 }, animate: { y: 0, opacity: 1 } }
    : mode === "scale" ? { initial: { scale: 0.85, opacity: 0 }, animate: { scale: 1, opacity: 1 } }
    : mode === "flip" ? { initial: { rotateX: -55, y: 40, opacity: 0 }, animate: { rotateX: 0, y: 0, opacity: 1 } }
    : mode === "blur" ? { initial: { filter: "blur(14px)", opacity: 0, y: 20 }, animate: { filter: "blur(0px)", opacity: 1, y: 0 } }
    : { initial: { clipPath: "inset(0 0 100% 0)", y: 20 }, animate: { clipPath: "inset(0 0 0% 0)", y: 0 } };
  return (
    <motion.div
      className={className}
      initial={v.initial}
      whileInView={v.animate}
      viewport={{ once, amount }}
      transition={{ duration: 0.75, delay, ease: EASE.outExpo }}
      style={mode === "flip" ? { transformOrigin: "50% 0%" } : undefined}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   TEXT REVEAL — посимвольно / пословно / печатающая машинка
   ============================================================ */
export function TextReveal({
  text, mode = "char", delay = 0, step = 0.03, className = "", once = true,
}: { text: string; mode?: "char" | "word" | "type" | "mask"; delay?: number; step?: number; className?: string; once?: boolean }) {
  const units = mode === "word" ? text.split(" ") : text.split("");
  if (mode === "type") return <Typewriter text={text} delay={delay} step={step * 300} className={className} once={once} />;
  return (
    <span className={`inline-flex flex-wrap ${className}`}>
      {units.map((u, i) => {
        const d = delay + i * step;
        const ch = mode === "word" ? `${u}\u00A0` : u;
        return mode === "mask" ? (
          <span key={i} className="inline-block overflow-hidden" style={{ paddingBottom: "0.08em" }}>
            <motion.span className="inline-block" initial={{ y: "110%" }} whileInView={{ y: "0%" }} viewport={{ once }} transition={{ delay: d, duration: 0.7, ease: EASE.outExpo }}>
              {ch}
            </motion.span>
          </span>
        ) : (
          <motion.span
            key={i}
            className="inline-block"
            style={{ transformOrigin: "50% 100%", whiteSpace: "pre" }}
            initial={{ rotateX: -90, y: 26, opacity: 0 }}
            whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
            viewport={{ once }}
            transition={{ delay: d, type: "spring", stiffness: 320, damping: 22 }}
          >
            {ch}
          </motion.span>
        );
      })}
    </span>
  );
}

function Typewriter({ text, delay, step, className, once }: { text: string; delay: number; step: number; className: string; once: boolean }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        let t = 0;
        const tick = (now: number) => {
          if (!t) t = now;
          const k = Math.min(text.length, Math.floor((now - t - delay * 1000) / step));
          setN(Math.max(0, k));
          if (k < text.length) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [text, delay, step]);
  if (!once) return null;
  return (
    <span ref={ref} className={className}>
      {text.slice(0, n)}
      <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.12em] bg-current" />
    </span>
  );
}

/* ============================================================
   ROLLING NUMBER — каждая цифра крутится как барабан
   ============================================================ */
export function RollingNumber({ value, className = "" }: { value: number; className?: string }) {
  const s = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F");
  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      {s.split("").map((ch, i) =>
        ch === "\u202F" ? (
          <span key={i}>{ch}</span>
        ) : (
          <span key={i} className="relative inline-block h-[1.05em] w-[0.62em] overflow-hidden leading-none">
            <AnimatePresence initial={false}>
              <motion.span
                key={ch}
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-105%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="absolute inset-0 text-center"
              >
                {ch}
              </motion.span>
            </AnimatePresence>
          </span>
        ),
      )}
    </span>
  );
}

/* ============================================================
   MAGNETIC — элемент тянется к курсору и «вдавливается»
   ============================================================ */
export function Magnetic({
  children, strength = 0.35, className = "", onClick, depth = 6,
}: { children: ReactNode; strength?: number; className?: string; onClick?: () => void; depth?: number }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 18 });
  const sy = useSpring(y, { stiffness: 300, damping: 18 });
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerEnter={() => setHov(true)}
      onPointerLeave={() => { x.set(0); y.set(0); setHov(false); }}
      whileTap={{ scale: 0.93 }}
      animate={{ scale: hov ? 1.04 : 1, boxShadow: hov ? `0 ${depth * 2}px ${depth * 4}px -${depth}px rgba(0,0,0,.7)` : "0 0 0 rgba(0,0,0,0)" }}
      transition={SPRING.tap}
    >
      {children}
    </motion.button>
  );
}

/* ============================================================
   RARITY — лучи качества предмета
   ============================================================ */
export const RARITY = [
  { id: "common", n: "Обычная", c: "#9aa8c7", rings: 0 },
  { id: "rare", n: "Редкая", c: "#4cc3ff", rings: 1 },
  { id: "epic", n: "Эпическая", c: "#9b7bff", rings: 2 },
  { id: "legend", n: "Легендарная", c: "#ffc34d", rings: 3 },
  { id: "mythic", n: "Мифическая", c: "#ff4d5e", rings: 4 },
] as const;
export type RarityId = (typeof RARITY)[number]["id"];

export function RarityFrame({ id, children, className = "", active = true }: { id: RarityId; children: ReactNode; className?: string; active?: boolean }) {
  const r = RARITY.find((x) => x.id === id)!;
  return (
    <div className={`relative ${className}`} style={{ perspective: 600 }}>
      {active &&
        Array.from({ length: r.rings }).map((_, i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute -inset-2 rounded-[inherit] border"
            style={{ borderColor: r.c, opacity: 0.5 - i * 0.1 }}
            animate={{ rotate: i % 2 ? -360 : 360, scale: [1 + i * 0.02, 1.03 + i * 0.02, 1 + i * 0.02] }}
            transition={{ rotate: { duration: 9 + i * 3, repeat: Infinity, ease: "linear" }, scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
          />
        ))}
      <div
        className="relative overflow-hidden rounded-[inherit] p-[2px]"
        style={{ background: `linear-gradient(150deg, ${r.c}, #101a30 45%, ${r.c})`, boxShadow: active ? `0 0 26px -6px ${r.c}` : "none" }}
      >
        {children}
      </div>
      {active && r.rings >= 2 && (
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-color-dodge"
          style={{ background: `repeating-conic-gradient(${r.c}55 0 5deg, transparent 5deg 18deg)`, WebkitMaskImage: "radial-gradient(closest-side,#000 15%,transparent)", maskImage: "radial-gradient(closest-side,#000 15%,transparent)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

/* ============================================================
   SEGMENTED — переключатель с «жидким» индикатором
   ============================================================ */
export function Segmented<T extends string>({ items, value, onChange, color = "#2ee6c5" }: { items: { id: T; label: string }[]; value: T; onChange: (v: T) => void; color?: string }) {
  return (
    <div className="relative inline-flex rounded-full border border-white/10 bg-white/[.03] p-1">
      {items.map((it) => (
        <button key={it.id} onClick={() => onChange(it.id)} className="relative px-4 py-1.5 text-xs font-bold">
          {value === it.id && <motion.span layoutId={`seg-${items.map((i) => i.id).join()}`} transition={SPRING.layout} className="absolute inset-0 rounded-full" style={{ background: color }} />}
          <span className={`relative ${value === it.id ? "text-black" : "text-white/60"}`}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   GAUGE — дуга с зонами и стрелкой
   ============================================================ */
export function Gauge({ value, size = 150, label, zones = ["#3ddc84", "#ffc34d", "#ff4d5e"], fmt }: { value: number; size?: number; label?: string; zones?: string[]; fmt?: (v: number) => string }) {
  const R = size / 2 - 14;
  const L = 2 * Math.PI * R;
  const v = Math.max(0, Math.min(1, value));
  const color = zones[Math.min(zones.length - 1, Math.floor(v * zones.length))];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg]">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#ffffff10" strokeWidth="12" strokeDasharray={`${L * 0.75} ${L}`} strokeLinecap="round" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={R} fill="none" strokeWidth="12" strokeLinecap="round"
          style={{ strokeDasharray: `${L * 0.75 * v} ${L}`, stroke: color, filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-black" style={{ color }}>{fmt ? fmt(v) : `${Math.round(v * 100)}%`}</div>
          {label && <div className="mt-0.5 text-[10px] uppercase tracking-[.2em] text-white/45">{label}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ENERGY PIPS — капли энергии
   ============================================================ */
export function EnergyPips({ total, filled, color = "#2ee6c5", onPip }: { total: number; filled: number; color?: string; onPip?: (i: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const full = i < filled;
        return (
          <motion.button
            key={i}
            onClick={() => onPip?.(i)}
            animate={full ? { scale: 1, filter: "none" } : { scale: 0.92, filter: "grayscale(1)" }}
            whileTap={{ scale: 0.8 }}
            transition={SPRING.tap}
            className="relative h-7 w-5 overflow-hidden rounded-md border"
            style={{ borderColor: full ? color : "#ffffff22", background: full ? `linear-gradient(180deg,${color},${color}55)` : "#ffffff08", boxShadow: full ? `0 0 12px -2px ${color}` : "none" }}
          >
            {full && <motion.div className="absolute inset-x-0 top-0 h-1 bg-white/50" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ============================================================
   PROGRESS RING
   ============================================================ */
export function Ring({ value, size = 56, w = 5, color = "#2ee6c5", children }: { value: number; size?: number; w?: number; color?: string; children?: ReactNode }) {
  const R = size / 2 - w;
  const L = 2 * Math.PI * R;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#ffffff12" strokeWidth={w} />
        <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" strokeWidth={w} strokeLinecap="round" style={{ strokeDasharray: `${L * value} ${L}`, stroke: color, filter: `drop-shadow(0 0 5px ${color})` }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[11px] font-bold">{children}</div>
    </div>
  );
}

/* ============================================================
   SPARKLINE
   ============================================================ */
export function Sparkline({ data, w = 90, h = 28, color = "#3ddc84", fill = true }: { data: number[]; w?: number; h?: number; color?: string; fill?: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const px = (i: number) => (i / (data.length - 1)) * w;
  const py = (v: number) => h - 2 - ((v - min) / (max - min || 1)) * (h - 4);
  const d = data.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      {fill && (
        <>
          <defs>
            <linearGradient id={`sl${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity=".35" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#sl${color.slice(1)})`} />
        </>
      )}
      <motion.path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE.outExpo }} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
}

/* ============================================================
   DIRECTIONAL STAGGER — каскад от точки касания
   ============================================================ */
export function useRipple(cols: number) {
  const origin = useRef({ x: 0, y: 0 });
  const setOrigin = (i: number) => { origin.current = { x: i % cols, y: Math.floor(i / cols) }; };
  const delayOf = (i: number, ms = 35) => Math.hypot((i % cols) - origin.current.x, Math.floor(i / cols) - origin.current.y) * ms;
  return { setOrigin, delayOf };
}

/* ============================================================
   BEAM — горизонтальная линия-разделитель, прорастающая светом
   ============================================================ */
export function Beam({ color = "#2ee6c5", className = "" }: { color?: string; className?: string }) {
  return (
    <motion.div
      className={`h-px ${className}`}
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: EASE.camera }}
    />
  );
}

/* ============================================================
   PARALLAX LAYER для фонов страниц
   ============================================================ */
export function useParallax(strength = 60) {
  const y = useMotionValue(0);
  const sy = useSpring(y, { stiffness: 60, damping: 20 });
  useEffect(() => {
    const on = () => y.set((window.scrollY % 1000) / 1000 * strength);
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [y, strength]);
  return useTransform(sy, (v) => -v);
}
