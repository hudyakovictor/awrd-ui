import { useState, type ReactElement } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "motion/react";
import { S, feel, useInView } from "../lib/motion";
import { IcLayers, IcStar, IcTrend, IcShield, IcLock, IcClock, IcCheck, IcArrow } from "../ui/icons";

/* =====================================================================
   АНАТОМИЯ ЭКРАНА — разнесённый 3D-вид слоёв сцены «Раунд арены».
   Каждый слой — отдельная плоскость по Z с подписью его роли
   в движении. Так объясняют сцену разработчику: что живёт само,
   что реагирует на касание и что появляется по событию.
   ===================================================================== */
type Layer = { id: string; t: string; role: string; timing: string; tone: string; kind: "ambient" | "static" | "cascade" | "input" | "event"; draw: () => ReactElement };

const LAYERS: Layer[] = [
  {
    id: "bg", t: "Фон", role: "ambient · aurora дрейфует 26 с", timing: "∞", tone: "#5b9cd6", kind: "ambient",
    draw: () => (
      <div className="absolute inset-0 overflow-hidden rounded-[26px] bg-[#101827]">
        <motion.div className="absolute -inset-10" animate={{ x: [-10, 10, -10], y: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity }}
          style={{ background: "radial-gradient(40% 35% at 30% 30%, rgba(62,201,167,.35), transparent 70%), radial-gradient(40% 35% at 75% 70%, rgba(157,140,245,.3), transparent 70%)" }} />
      </div>
    ),
  },
  {
    id: "hud", t: "HUD", role: "статичен · меняются только числа", timing: "count 900 мс", tone: "#8fa4c7", kind: "static",
    draw: () => (
      <div className="absolute inset-x-3 top-4 flex gap-1.5">
        <div className="h-7 flex-1 overflow-hidden rounded-full bg-[#141d33]"><div className="h-full w-[68%] bg-teal/50" /></div>
        <div className="h-7 w-16 rounded-full bg-[#141d33]" />
        <div className="h-7 w-7 rounded-full bg-[#141d33]" />
      </div>
    ),
  },
  {
    id: "term", t: "Терминал", role: "каскад строк · blur 6 px → 0", timing: "80 мс × i", tone: "#3ec9a7", kind: "cascade",
    draw: () => (
      <div className="absolute inset-x-3 top-16 rounded-2xl bg-[#1d2a44] p-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} className="mb-1.5 h-6 rounded-lg bg-white/8" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    ),
  },
  {
    id: "factors", t: "Факторы", role: "ввод · pop + layoutId-подсветка", timing: "S.pop", tone: "#f2c14e", kind: "input",
    draw: () => (
      <div className="absolute inset-x-3 top-[190px] grid grid-cols-4 gap-1.5">
        {[IcTrend, IcStar, IcShield, IcLock].map((I, i) => (
          <div key={i} className="grid aspect-square place-items-center rounded-xl" style={{ background: i === 1 ? "#f2c14e55" : "#1d2a44", color: i === 1 ? "#f2c14e" : "#6f83a6", boxShadow: i === 1 ? "0 0 0 2px #f2c14e" : "none" }}>
            <I size={16} />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "answers", t: "Ответы", role: "ввод · ход вниз 4 px + звук", timing: "S.snap", tone: "#5b9cd6", kind: "input",
    draw: () => (
      <div className="absolute inset-x-3 top-[268px] grid grid-cols-2 gap-1.5">
        {["#3ec9a7", "#5b9cd6", "#2b3a58", "#e46a5f"].map((c, i) => (
          <div key={i} className="h-9 rounded-xl" style={{ background: c, boxShadow: `0 4px 0 ${c}88` }} />
        ))}
      </div>
    ),
  },
  {
    id: "verdict", t: "Вердикт", role: "событие · затемнение + pop + импакт", timing: "на ответ", tone: "#e46a5f", kind: "event",
    draw: () => (
      <div className="absolute inset-0 grid place-items-center rounded-[26px] bg-[#06231c]/55">
        <div className="w-[78%] rounded-2xl bg-[#223250] p-3 text-center">
          <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-teal/25 text-teal"><IcCheck size={20} /></div>
          <div className="mx-auto mt-2 h-2.5 w-20 rounded-full bg-white/30" />
          <div className="mx-auto mt-1.5 h-2 w-28 rounded-full bg-white/12" />
        </div>
      </div>
    ),
  },
  {
    id: "fx", t: "Частицы", role: "событие · canvas, засыпает в простое", timing: "700 мс", tone: "#9d8cf5", kind: "event",
    draw: () => (
      <div className="absolute inset-0">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.span key={i} className="absolute h-1.5 w-1.5 rounded-full" style={{ left: `${20 + ((i * 37) % 60)}%`, top: `${25 + ((i * 53) % 45)}%`, background: ["#f2c14e", "#3ec9a7", "#9d8cf5"][i % 3] }}
            animate={{ y: [0, -14, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1 }} />
        ))}
      </div>
    ),
  },
];

const KIND: Record<Layer["kind"], { t: string; tone: string }> = {
  ambient: { t: "живёт само", tone: "#5b9cd6" },
  static: { t: "статика", tone: "#8fa4c7" },
  cascade: { t: "каскад входа", tone: "#3ec9a7" },
  input: { t: "отклик на ввод", tone: "#f2c14e" },
  event: { t: "по событию", tone: "#e46a5f" },
};

export function Exploded() {
  const [spread, setSpread] = useState(1);
  const [hot, setHot] = useState<string | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [62, 44]), S.soft);
  const rz = useSpring(useTransform(mx, [-0.5, 0.5], [-46, -24]), S.soft);
  const gap = inView ? 44 * spread : 0;

  return (
    <div ref={ref} className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
      <div
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }}
        onPointerLeave={() => { mx.set(0); my.set(0); }}
        className="relative grid h-[560px] place-items-center overflow-hidden rounded-3xl border border-white/8 bg-[#0b1120]"
        style={{ perspective: 1800 }}>
        <div className="mesh absolute inset-0 opacity-70" />
        <motion.div style={{ rotateX: rx, rotateZ: rz, transformStyle: "preserve-3d" }} className="relative h-[380px] w-[210px]">
          {LAYERS.map((l, i) => {
            const on = hot === l.id;
            return (
              <motion.div key={l.id}
                onPointerEnter={() => setHot(l.id)} onPointerLeave={() => setHot(null)}
                animate={{ z: i * gap + (on ? 26 : 0), opacity: hot && !on ? 0.35 : 1 }}
                transition={{ ...S.soft, delay: inView ? i * 0.05 : 0 }}
                className="absolute inset-0 rounded-[26px]"
                style={{ transformStyle: "preserve-3d", boxShadow: on ? `0 0 0 2px ${l.tone}, 0 0 40px ${l.tone}66` : `0 0 0 1px ${l.tone}55` }}>
                {l.draw()}
                <div className="pointer-events-none absolute -right-2 top-1 translate-x-full whitespace-nowrap rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider"
                  style={{ background: l.tone + "22", color: l.tone, opacity: spread > 0.3 ? 1 : 0 }}>
                  {String(i + 1).padStart(2, "0")} {l.t}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        <div className="absolute inset-x-5 bottom-4 flex items-center gap-3">
          <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-mist">разнести</span>
          <input type="range" min={0} max={1.6} step={0.05} value={spread} onChange={(e) => setSpread(+e.target.value)}
            className="h-1.5 flex-1 appearance-none rounded-full bg-white/10" style={{ accentColor: "#3ec9a7" }} />
          <button onClick={() => { feel("sweep"); setSpread((s) => (s > 0.5 ? 0 : 1)); }}
            className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[9.5px] font-extrabold uppercase tracking-widest text-mist hover:text-white">
            {spread > 0.5 ? "собрать" : "разнести"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {LAYERS.map((l, i) => (
          <motion.button key={l.id}
            onPointerEnter={() => setHot(l.id)} onPointerLeave={() => setHot(null)} onClick={() => feel("tap")}
            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ ...S.soft, delay: 0.1 + i * 0.05 }}
            className="flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors"
            style={{ borderColor: hot === l.id ? l.tone + "88" : "rgba(255,255,255,.08)", background: hot === l.id ? l.tone + "12" : "rgba(255,255,255,.025)" }}>
            <span className="mono w-6 text-[11px] font-extrabold" style={{ color: l.tone }}>{String(i + 1).padStart(2, "0")}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-extrabold">{l.t}</div>
              <div className="truncate text-[11px] font-bold text-mist">{l.role}</div>
            </div>
            <span className="shrink-0 rounded-full px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wider" style={{ background: KIND[l.kind].tone + "1c", color: KIND[l.kind].tone }}>{KIND[l.kind].t}</span>
            <span className="mono hidden w-20 shrink-0 text-right text-[10px] font-bold text-mist sm:block">{l.timing}</span>
          </motion.button>
        ))}
        <AnimatePresence>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 pt-2 text-[12px] font-bold leading-relaxed text-mist">
            <span className="mt-0.5 text-teal"><IcLayers size={14} /></span>
            <span>Правило слоёв: <b className="text-white">живёт само</b> — только фон, <b className="text-white">по событию</b> — только верхние слои.
            Если средний слой анимируется без ввода, экран начинает «шуметь».</span>
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-2 pt-1 text-[10.5px] font-bold text-mist"><IcClock size={12} /> наведи на слой — он поднимется в стопке <IcArrow size={11} /></div>
      </div>
    </div>
  );
}
