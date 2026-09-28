import { useEffect, useRef } from "react";
import { motion, AnimatePresence, type MotionValue, useTransform } from "motion/react";
import { TUNE, S, E, feel } from "../lib/motion";
import { ALL } from "../data/catalog";

/* =====================================================================
   СИГНАЛЬНОЕ ПОЛЕ — фон hero на canvas.
   Мини-свечи дрейфуют вверх, ближайшие связываются линиями,
   курсор притягивает поле. Плотность подчиняется тюнеру (particles),
   цикл засыпает, когда вкладка скрыта или hero вне экрана.
   ===================================================================== */
type Mote = { x: number; y: number; vx: number; vy: number; h: number; up: boolean; a: number; z: number };

export function SignalField({ className = "" }: { className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cv.current!;
    const g = c.getContext("2d")!;
    const dpr = Math.min(2, devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0, visible = true;
    const mouse = { x: -9999, y: -9999 };
    let motes: Mote[] = [];

    const seed = () => {
      const n = Math.round(Math.min(120, (w * h) / 11000) * Math.max(0.15, TUNE.particles));
      motes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12, vy: -0.1 - Math.random() * 0.3,
        h: 4 + Math.random() * 12, up: Math.random() > 0.38, a: 0.25 + Math.random() * 0.55, z: 0.4 + Math.random() * 0.8,
      }));
    };
    const size = () => {
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { threshold: 0 });
    io.observe(c);
    const mv = (e: PointerEvent) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
    addEventListener("pointermove", mv, { passive: true });

    let running = false;
    const loop = () => {
      if (!visible || document.hidden) { running = false; return; }
      g.clearRect(0, 0, w, h);
      for (const m of motes) {
        const dx = mouse.x - m.x, dy = mouse.y - m.y, d = Math.hypot(dx, dy);
        if (d < 180) { m.vx += (dx / d) * 0.012 * m.z; m.vy += (dy / d) * 0.012 * m.z; }
        m.vx *= 0.985; m.vy = m.vy * 0.985 + (-0.18 * m.z) * 0.015;
        m.x += m.vx * m.z; m.y += m.vy * m.z;
        if (m.y < -20) { m.y = h + 20; m.x = Math.random() * w; }
        if (m.x < -20) m.x = w + 20; if (m.x > w + 20) m.x = -20;
      }
      // связи
      for (let i = 0; i < motes.length; i++) for (let j = i + 1; j < motes.length; j++) {
        const a = motes[i], b = motes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 96) {
          g.strokeStyle = `rgba(62,201,167,${(1 - d / 96) * 0.13 * Math.min(a.z, b.z)})`;
          g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
        }
      }
      // свечи
      for (const m of motes) {
        const col = m.up ? "62,201,167" : "228,106,95";
        const bw = 3.2 * m.z, bh = m.h * m.z;
        g.globalAlpha = m.a * m.z * 0.8;
        g.strokeStyle = `rgb(${col})`; g.lineWidth = 1;
        g.beginPath(); g.moveTo(m.x, m.y - bh * 0.9); g.lineTo(m.x, m.y + bh * 0.9); g.stroke();
        g.fillStyle = `rgb(${col})`;
        g.fillRect(m.x - bw / 2, m.y - bh / 2, bw, bh);
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const vis = () => { if (!document.hidden) kick(); };
    document.addEventListener("visibilitychange", vis);
    kick();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); removeEventListener("pointermove", mv); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return <canvas ref={cv} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}

/* =====================================================================
   ВЕЕР ЭКРАНОВ — три живых телефона на разной глубине.
   Центр меняется по таймлайну, соседи уходят назад с поворотом по Y.
   Каждый слой параллакса двигается со своим коэффициентом.
   ===================================================================== */
export function PhoneFan({ idx, ids, px: pX, py: pY, live, tv, onPick }: {
  idx: number; ids: string[]; px: MotionValue<number>; py: MotionValue<number>; live: boolean; tv: number; onPick: (i: number) => void;
}) {
  const items = ids.map((id) => ALL.find((a) => a.id === id)!).filter(Boolean);
  const n = items.length;
  const layerX = [useTransform(pX, (v) => v * -26), useTransform(pX, (v) => v * -12), useTransform(pX, (v) => v * -12)];
  const layerY = [useTransform(pY, (v) => v * -18), useTransform(pY, (v) => v * -8), useTransform(pY, (v) => v * -8)];
  return (
    <div className="relative h-[680px] w-[560px]" style={{ perspective: 1600 }}>
      {items.map((a, k) => {
        const rel = ((k - idx) % n + n) % n;          // 0 — центр, 1 — справа, n-1 — слева
        const side = rel === 0 ? 0 : rel === 1 ? 1 : -1;
        const depth = side === 0 ? 0 : 1;
        return (
          <motion.button
            key={a.id}
            onClick={() => { if (side) { feel("sweep", 6); onPick(k); } }}
            animate={{ x: side * 150, rotateY: side * -26, scale: side ? 0.8 : 1, z: side ? -120 : 0, opacity: side ? 0.55 : 1, filter: side ? "brightness(.55) saturate(.8)" : "brightness(1) saturate(1)" }}
            transition={{ ...S.soft, damping: 24 }}
            style={{ zIndex: side ? 1 : 5, x: layerX[depth] as any, y: layerY[depth] as any, left: "50%", top: 0, marginLeft: -160 }}
            className="absolute"
          >
            <motion.div animate={{ y: side ? [0, -6, 0] : [0, -12, 0] }} transition={{ duration: side ? 7 : 6, repeat: Infinity, ease: "easeInOut", delay: k * 0.6 }}>
              <a.Comp key={`${a.id}-${tv}`} live={live && side === 0} />
            </motion.div>
            {side === 0 && (
              <motion.div className="absolute -inset-14 -z-10 rounded-full blur-3xl" style={{ background: a.cat.color + "33" }}
                animate={{ opacity: [0.45, 0.85, 0.45] }} transition={{ duration: 5, repeat: Infinity }} />
            )}
          </motion.button>
        );
      })}

      {/* подпись текущего экрана */}
      <div className="absolute -bottom-2 left-1/2 w-72 -translate-x-1/2 text-center">
        <AnimatePresence mode="wait">
          <motion.div key={items[idx]?.id} initial={{ y: 12, opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.35, ease: E.out }}>
            <div className="text-[9px] font-extrabold uppercase tracking-[0.3em]" style={{ color: items[idx]?.cat.color }}>{items[idx]?.cat.name}</div>
            <div className="text-[14px] font-extrabold uppercase">{items[idx]?.title}</div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-2 flex justify-center gap-1.5">
          {items.map((a, k) => (
            <motion.button key={a.id} onClick={() => onPick(k)} animate={{ width: k === idx ? 22 : 7, background: k === idx ? a.cat.color : "#2a354e" }} transition={S.pop} className="h-[5px] rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   ЛЕНТА — бесконечная бегущая строка экранов каталога.
   Две копии контента, x от 0 до −50%: шов незаметен.
   ===================================================================== */
export function Ticker({ onPick, reverse = false }: { onPick: (cat: string, id: string) => void; reverse?: boolean }) {
  const row = [...ALL, ...ALL];
  return (
    <div className="relative overflow-hidden border-y border-white/8 bg-[#0b1120]/80 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#090e1a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#090e1a] to-transparent" />
      <motion.div className="flex w-max gap-2.5 pr-2.5"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: ALL.length * 2.6, repeat: Infinity, ease: "linear" }}>
        {row.map((a, i) => (
          <motion.button key={`${a.id}-${i}`} onClick={() => onPick(a.cat.id, a.id)} whileHover={{ y: -3, scale: 1.04 }} transition={S.snap}
            className="flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5"
            style={{ borderColor: a.cat.color + "40", background: a.cat.color + "10" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: a.cat.color, boxShadow: `0 0 8px ${a.cat.color}` }} />
            <span className="text-[10.5px] font-extrabold uppercase tracking-wide">{a.title}</span>
            <span className="mono text-[9px] font-bold text-mist">{a.tags[0]}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
