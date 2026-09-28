import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel } from "../ui/kit";
import { S, feel, useImpact, Particles, useTimeline } from "../lib/motion";
import { IcBolt, IcStar, IcShield, IcEye, IcGauge, IcCrown, IcCheck } from "../ui/icons";

/* =====================================================================
   АССЕТ · MOTION SETTINGS — настройки анимаций внутри самой игры.
   Требование доступности: игрок сам решает, сколько движения ему нужно.
   Превью-награда справа реагирует на каждое изменение мгновенно.
   ===================================================================== */
type Level = 0 | 1 | 2;
const LEVELS: { t: string; d: string; tone: string; spring: any; stagger: number }[] = [
  { t: "Минимум", d: "Без отскоков и тряски", tone: "#8fa4c7", spring: { type: "spring", stiffness: 700, damping: 44, mass: 0.6 }, stagger: 0.01 },
  { t: "Стандарт", d: "Как задумано", tone: "#3ec9a7", spring: { type: "spring", stiffness: 430, damping: 17, mass: 0.7 }, stagger: 0.07 },
  { t: "Максимум", d: "Больше сока и частиц", tone: "#f2c14e", spring: { type: "spring", stiffness: 400, damping: 11, mass: 0.85 }, stagger: 0.1 },
];

export function MotionSettings({ live = true }: { live?: boolean }) {
  const [lvl, setLvl] = useState<Level>(1);
  const [opt, setOpt] = useState({ haptics: true, sound: true, shake: true, particles: true, parallax: false });
  const [run, setRun] = useState(0);
  const imp = useImpact();
  const burst = useRef<any>(null);
  const L = LEVELS[lvl];

  /* демо-сценарий: переключаем уровни и тумблеры, чтобы было видно реакцию */
  const [auto] = useTimeline(5, [2200, 2200, 2200, 1800, 1800], live);
  useEffect(() => {
    if (!live) return;
    if (auto <= 2) setLvl(([1, 2, 0] as Level[])[auto]);
    if (auto === 3) setOpt((o) => ({ ...o, shake: false }));
    if (auto === 4) setOpt((o) => ({ ...o, shake: true }));
  }, [auto, live]);

  /* каждое изменение перезапускает превью */
  useEffect(() => {
    setRun((r) => r + 1);
    const t = setTimeout(() => {
      if (opt.shake && lvl > 0) imp.fire(lvl === 2 ? 12 : 7, 0.35);
      if (opt.particles && lvl > 0) burst.current?.(236, 214, { n: lvl === 2 ? 36 : 16, power: lvl === 2 ? 10 : 7, colors: [L.tone, "#eaf2ff"] });
    }, 260);
    return () => clearTimeout(t);
  }, [lvl, opt.shake, opt.particles]);

  const toggle = (k: keyof typeof opt) => { setOpt((o) => ({ ...o, [k]: !o[k] })); feel(opt[k] ? "tap" : "confirm", 8); };

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />
        <div className="px-4 pt-2">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-teal">Настройки</div>
          <div className="title-xl text-[19px] uppercase">Анимации и отклик</div>
        </div>

        {/* превью */}
        <div className="mt-3 px-3">
          <Panel className="relative flex h-[128px] items-center gap-4 overflow-hidden px-4">
            <motion.div className="absolute -right-8 -top-10 h-32 w-32 rounded-full blur-2xl" style={{ background: L.tone + "33" }} animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
            <div className="relative flex-1 space-y-1.5">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-mist">превью</div>
              {[0, 1, 2].map((i) => (
                <motion.div key={`${run}-${i}`} initial={lvl ? { x: 22, opacity: 0 } : { opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={lvl ? { ...L.spring, delay: 0.1 + i * L.stagger } : { duration: 0.12 }}
                  className="flex items-center gap-1.5 rounded-lg bg-white/6 px-2 py-1">
                  <span style={{ color: L.tone }}><IcStar size={11} /></span>
                  <span className="h-1.5 flex-1 rounded-full bg-white/15" />
                </motion.div>
              ))}
            </div>
            <motion.div key={run} initial={lvl ? { scale: 0.3, rotate: -20 } : { opacity: 0 }}
              animate={lvl ? { scale: 1, rotate: 0 } : { opacity: 1 }} transition={lvl ? L.spring : { duration: 0.15 }}
              className="relative grid h-[76px] w-[76px] place-items-center rounded-3xl"
              style={{ background: `linear-gradient(180deg, ${L.tone}, ${L.tone}99)`, color: "#0b1220", boxShadow: `0 14px 30px -12px ${L.tone}` }}>
              <IcCrown size={34} />
            </motion.div>
          </Panel>
        </div>

        {/* уровень интенсивности: трёхпозиционный сегмент */}
        <div className="mt-3 px-3">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-mist">интенсивность</span>
            <AnimatePresence mode="wait">
              <motion.span key={lvl} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} className="text-[10px] font-extrabold" style={{ color: L.tone }}>{L.d}</motion.span>
            </AnimatePresence>
          </div>
          <div className="panel-sunk relative grid grid-cols-3 rounded-2xl p-1">
            {LEVELS.map((l, i) => (
              <button key={l.t} onClick={() => { feel("tap"); setLvl(i as Level); }} className="relative rounded-xl py-2.5">
                {lvl === i && <motion.span layoutId="motion-lvl" transition={S.pop} className="absolute inset-0 rounded-xl" style={{ background: l.tone, boxShadow: `0 6px 16px -8px ${l.tone}` }} />}
                <span className={`relative text-[11px] font-extrabold ${lvl === i ? "text-[#08121a]" : "text-mist"}`}>{l.t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* тумблеры */}
        <div className="mt-3 space-y-1.5 px-3">
          {([
            { k: "haptics", t: "Вибрация", d: "Отклик на нажатия", Icon: IcBolt },
            { k: "sound", t: "Звуки интерфейса", d: "Клики, награды, ошибки", Icon: IcGauge },
            { k: "shake", t: "Тряска экрана", d: "Удары и импакт", Icon: IcShield },
            { k: "particles", t: "Частицы", d: "Искры и конфетти", Icon: IcStar },
            { k: "parallax", t: "Параллакс", d: "Движение фона от наклона", Icon: IcEye },
          ] as const).map((row, i) => {
            const on = opt[row.k] && !(lvl === 0 && (row.k === "shake" || row.k === "particles" || row.k === "parallax"));
            const locked = lvl === 0 && (row.k === "shake" || row.k === "particles" || row.k === "parallax");
            return (
              <motion.div key={row.k} initial={{ x: -14, opacity: 0 }} animate={{ x: 0, opacity: locked ? 0.45 : 1 }} transition={{ ...S.soft, delay: i * 0.04 }}
                className="flex items-center gap-2.5 rounded-2xl bg-[#1a2338] px-3 py-2" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.05)" }}>
                <span className="grid h-8 w-8 place-items-center rounded-xl" style={{ background: on ? L.tone + "22" : "rgba(255,255,255,.05)", color: on ? L.tone : "#6f83a6" }}><row.Icon size={15} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-extrabold">{row.t}</div>
                  <div className="truncate text-[9px] font-bold text-mist">{locked ? "выключено режимом «Минимум»" : row.d}</div>
                </div>
                <button disabled={locked} onClick={() => toggle(row.k)} className="relative h-6 w-11 shrink-0 rounded-full transition-colors" style={{ background: on ? L.tone : "rgba(255,255,255,.12)" }}>
                  <motion.span layout transition={S.snap} className="absolute top-1 grid h-4 w-4 place-items-center rounded-full bg-white" style={{ left: on ? 24 : 4 }}>
                    {on && <IcCheck size={9} />}
                  </motion.span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="flex-1" />
        <div className="h-[78px] shrink-0" />
        <BottomNav active="more" />
      </motion.div>
    </Phone>
  );
}
