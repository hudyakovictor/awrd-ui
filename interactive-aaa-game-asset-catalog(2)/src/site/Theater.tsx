import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ALL, CATEGORIES } from "../data/catalog";
import { S, E, feel } from "../lib/motion";
import { IcClose, IcArrow, IcPlay, IcEye, IcLayers } from "../ui/icons";

/* =====================================================================
   ТЕАТР — полноэкранный шоурил каталога.
   Режим презентации для команды: все экраны подряд, как stories,
   с 3D-соседями, секретом каждого экрана и управлением с клавиатуры.
   ===================================================================== */
const SLIDE_MS = 7000;

export function Theater({ open, onClose, go }: { open: boolean; onClose: () => void; go: (cat: string, asset?: string) => void }) {
  const [cat, setCat] = useState<string>("all");
  const list = useMemo(() => (cat === "all" ? ALL : ALL.filter((a) => a.cat.id === cat)), [cat]);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [t, setT] = useState(0);

  const cur = list[Math.min(i, list.length - 1)];
  const step = (d: number) => { setDir(d); setI((v) => (v + d + list.length) % list.length); setT(0); feel("sweep", 6); };

  useEffect(() => { setI(0); setT(0); }, [cat]);

  /* прогресс слайда на rAF: пауза просто замораживает t */
  useEffect(() => {
    if (!open || paused) return;
    let raf = 0; let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      setT((v) => {
        const n = v + dt;
        if (n >= SLIDE_MS) { setDir(1); setI((k) => (k + 1) % list.length); return 0; }
        return n;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [open, paused, list.length]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === " ") { e.preventDefault(); setPaused((p) => !p); }
      if (e.key === "Escape") onClose();
    };
    addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, list.length]);

  if (!cur) return null;
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[140] overflow-hidden bg-[#05080f]"
          initial={{ clipPath: "circle(0% at 50% 50%)" }} animate={{ clipPath: "circle(150% at 50% 50%)" }} exit={{ clipPath: "circle(0% at 50% 50%)" }}
          transition={{ duration: 0.7, ease: E.io }}>

          {/* фон перекрашивается под категорию текущего экрана */}
          <motion.div key={cur.cat.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}
            style={{ background: `radial-gradient(60% 55% at 50% 45%, ${cur.cat.color}2a, transparent 70%)` }} />
          <div className="mesh absolute inset-0 opacity-50" />

          {/* stories-прогресс */}
          <div className="absolute inset-x-0 top-0 z-20 flex gap-1 px-4 pt-3">
            {list.map((a, k) => (
              <button key={a.id} onClick={() => { setDir(k > i ? 1 : -1); setI(k); setT(0); }} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/12">
                <div className="h-full rounded-full" style={{
                  background: a.cat.color,
                  width: k < i ? "100%" : k === i ? `${(t / SLIDE_MS) * 100}%` : "0%",
                }} />
              </button>
            ))}
          </div>

          {/* верхняя панель */}
          <div className="absolute inset-x-0 top-6 z-20 flex items-center justify-between gap-3 px-5">
            <div className="no-bar flex gap-1.5 overflow-x-auto">
              {[{ id: "all", name: "Все", color: "#3ec9a7" }, ...CATEGORIES].map((c) => (
                <button key={c.id} onClick={() => { feel("tap"); setCat(c.id); }} className="relative shrink-0 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider">
                  {cat === c.id && <motion.span layoutId="thcat" transition={S.pop} className="absolute inset-0 rounded-full" style={{ background: c.color + "2a", boxShadow: `inset 0 0 0 1px ${c.color}88` }} />}
                  <span className="relative" style={{ color: cat === c.id ? c.color : "#8fa4c7" }}>{c.name}</span>
                </button>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setPaused((p) => !p)} className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-mist hover:text-white">
                {paused ? <IcPlay size={15} /> : <span className="flex gap-[3px]"><span className="h-3 w-[3px] rounded bg-current" /><span className="h-3 w-[3px] rounded bg-current" /></span>}
              </button>
              <motion.button whileHover={{ rotate: 90 }} transition={S.pop} onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/5 text-mist hover:text-white"><IcClose size={16} /></motion.button>
            </div>
          </div>

          {/* сцена: соседи в 3D + центральный живой экран */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: 1600 }}>
            <Neighbor a={prev} side={-1} onClick={() => step(-1)} />
            <Neighbor a={next} side={1} onClick={() => step(1)} />

            <AnimatePresence mode="popLayout" custom={dir}>
              <motion.div key={cur.id + cat} custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d * 340, rotateY: d * -34, scale: 0.78, opacity: 0 }),
                  center: { x: 0, rotateY: 0, scale: 1, opacity: 1 },
                  exit: (d: number) => ({ x: d * -340, rotateY: d * 34, scale: 0.78, opacity: 0 }),
                }}
                initial="enter" animate="center" exit="exit" transition={{ ...S.soft, damping: 24 }}
                onHoverStart={() => setPaused(true)} onHoverEnd={() => setPaused(false)}
                className="relative z-10" style={{ transformStyle: "preserve-3d" }}>
                <motion.div className="absolute -inset-16 -z-10 rounded-full blur-3xl" style={{ background: cur.cat.color + "40" }}
                  animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />
                <div style={{ transform: "scale(0.92)", transformOrigin: "center" }}>
                  <cur.Comp live />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* подпись + секрет */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#05080f] via-[#05080f]/85 to-transparent px-5 pb-6 pt-16">
            <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-5">
              <AnimatePresence mode="wait">
                <motion.div key={cur.id} initial={{ y: 22, opacity: 0, filter: "blur(8px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.45, ease: E.out }} className="max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="mono text-[11px] font-extrabold" style={{ color: cur.cat.color }}>{String(i + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.3em]" style={{ color: cur.cat.color }}>{cur.cat.name}</span>
                  </div>
                  <div className="title-xl mt-1 text-3xl uppercase sm:text-4xl">{cur.title}</div>
                  <div className="mt-2 flex items-start gap-2 text-[13px] font-bold leading-relaxed text-mist">
                    <span className="mt-1 shrink-0" style={{ color: cur.cat.color }}><IcEye size={14} /></span>
                    <span><b className="text-white">{cur.secrets[0].t}. </b>{cur.secrets[0].d}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="flex shrink-0 items-center gap-2">
                <button onClick={() => step(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 text-mist hover:text-white"><span className="rotate-180"><IcArrow size={16} /></span></button>
                <button onClick={() => step(1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-white/5 text-mist hover:text-white"><IcArrow size={16} /></button>
                <button onClick={() => { onClose(); go(cur.cat.id, cur.id); }}
                  className="flex items-center gap-2 rounded-full px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.18em]"
                  style={{ background: cur.cat.color, color: "#06121a" }}>
                  <IcLayers size={14} /> разобрать
                </button>
              </div>
            </div>
            <div className="mx-auto mt-4 max-w-5xl text-[10px] font-bold text-mist/70">
              ← → листать · пробел пауза · Esc выход · наведение на экран останавливает таймер
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Neighbor({ a, side, onClick }: { a: (typeof ALL)[number]; side: number; onClick: () => void }) {
  return (
    <motion.button key={a.id} onClick={onClick}
      initial={{ opacity: 0 }} animate={{ opacity: 0.32 }} whileHover={{ opacity: 0.6, scale: 0.72 }} transition={S.soft}
      className="absolute hidden lg:block"
      style={{ x: side * 420, rotateY: side * -38, scale: 0.68, filter: "blur(1.5px) saturate(.7)" }}>
      <a.Comp live={false} />
    </motion.button>
  );
}

/* Кнопка запуска для хедера и главной */
export function TheaterButton({ onClick, big = false }: { onClick: () => void; big?: boolean }) {
  return (
    <motion.button onClick={() => { feel("confirm"); onClick(); }} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} transition={S.snap}
      className={big
        ? "relative flex items-center gap-2 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] px-6 py-3.5 text-[12px] font-extrabold uppercase tracking-[0.15em] text-white"
        : "hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-mist hover:text-white md:flex"}>
      <span className="grid place-items-center text-teal"><IcPlay size={big ? 15 : 12} /></span>
      {big ? "смотреть шоурил" : "театр"}
    </motion.button>
  );
}
