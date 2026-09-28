import React from "react";
import { motion } from "motion/react";
import { cx, S, E, feel } from "../lib/motion";
import { IcCap, IcSwords, IcCards, IcDots, IcBell, IcGear, IcStar, IcCoinMark, IcGem } from "./icons";

export const W = 320;
export const H = 660;

/* ---------- Корпус телефона: единый контейнер для всех ассетов ---------- */
/** Масштаб под узкий вьюпорт. Считается от окна, а не от родителя —
 *  иначе получаем обратную связь: ширина родителя зависит от масштаба. */
export function useFitScale(pad = 40) {
  const [s, setS] = React.useState(1);
  React.useEffect(() => {
    const calc = () => setS(Math.min(1, +((window.innerWidth - pad) / W).toFixed(3)));
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [pad]);
  return s;
}

export function Phone({
  children, scale, className, live = true,
}: { children: React.ReactNode; scale?: number; className?: string; live?: boolean }) {
  const auto = useFitScale();
  const fit = scale ?? auto;
  return (
    <div style={{ width: W * fit, height: H * fit }} className={cx("relative shrink-0", className)}>
      <div style={{ width: W, height: H, transform: `scale(${fit})`, transformOrigin: "top left" }} className="phone-shell absolute left-0 top-0">
        <div className="phone-screen noise vignette screen-vignette screen-gloss h-full w-full">
          <div className="absolute left-1/2 top-2 z-50 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80" />
          {children}
          {live && (
            <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-28 -translate-x-1/2 rounded-full bg-white/25" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Верхний HUD игры ---------- */
export function TopHUD({
  xp = 680, xpMax = 1000, coins = 1240, gems = 128, dot = true, compact = false,
}: { xp?: number; xpMax?: number; coins?: number; gems?: number; dot?: boolean; compact?: boolean }) {
  return (
    <div className="relative z-20 flex items-center gap-2 px-3 pt-8">
      <motion.div layout className="panel-sunk relative flex h-9 flex-1 items-center overflow-hidden rounded-full pl-1 pr-3">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal/70 to-teal/30"
          initial={{ width: 0 }}
          animate={{ width: `${(xp / xpMax) * 100}%` }}
          transition={{ ...S.soft, delay: 0.25 }}
        />
        <div className="relative z-10 grid h-7 w-7 place-items-center rounded-full bg-teal/25 text-teal"><IcStar size={15} /></div>
        <span className="relative z-10 ml-2 mono text-[12px] font-bold tabular-nums">{xp}<span className="text-mist/70">/{xpMax}</span></span>
      </motion.div>
      <div className="panel-sunk flex h-9 items-center gap-1.5 rounded-full px-2.5 text-gold">
        <IcCoinMark size={16} /><span className="mono text-[12px] font-bold text-white tabular-nums">{coins.toLocaleString("ru-RU")}</span>
      </div>
      {!compact && (
        <div className="panel-sunk flex h-9 items-center gap-1.5 rounded-full px-2.5 text-purple">
          <IcGem size={15} /><span className="mono text-[12px] font-bold text-white tabular-nums">{gems}</span>
        </div>
      )}
      <button className="panel-sunk relative grid h-9 w-9 place-items-center rounded-full text-mist">
        <IcBell size={16} />
        {dot && <motion.span animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />}
      </button>
      {!compact && <button className="panel-sunk grid h-9 w-9 place-items-center rounded-full text-mist"><IcGear size={16} /></button>}
    </div>
  );
}

/* ---------- Нижняя навигация ---------- */
const NAV = [
  { id: "academy", label: "АКАДЕМИЯ", Icon: IcCap },
  { id: "arena", label: "АРЕНА", Icon: IcSwords },
  { id: "collection", label: "КОЛЛЕКЦИЯ", Icon: IcCards },
  { id: "more", label: "ЕЩЁ", Icon: IcDots },
];
export function BottomNav({ active = "arena", onChange }: { active?: string; onChange?: (id: string) => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/8 bg-[#141d33]/95 px-2 pb-4 pt-2 backdrop-blur">
      <div className="flex items-end justify-between">
        {NAV.map((n) => {
          const on = n.id === active;
          return (
            <button
              key={n.id}
              onClick={() => { feel("tap"); onChange?.(n.id); }}
              className="relative flex flex-1 flex-col items-center gap-1 py-1"
            >
              {on && <motion.span layoutId="navglow" transition={S.pop} className="absolute inset-x-3 -top-1 bottom-0 rounded-2xl bg-teal/14" />}
              <motion.span
                animate={{ y: on ? -3 : 0, scale: on ? 1.12 : 1, color: on ? "#eaf6ff" : "#6f83a6" }}
                transition={S.pop}
                className="relative"
              >
                <n.Icon size={22} />
              </motion.span>
              <motion.span animate={{ color: on ? "#eaf6ff" : "#6f83a6" }} className="relative text-[8.5px] font-extrabold tracking-[0.06em]">
                {n.label}
              </motion.span>
              {on && <motion.span layoutId="navbar" transition={S.pop} className="absolute -bottom-1 h-[3px] w-8 rounded-full bg-teal" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Базовые поверхности ---------- */
export const Panel = ({ children, className, sunk }: { children?: React.ReactNode; className?: string; sunk?: boolean }) => (
  <div className={cx(sunk ? "panel-sunk" : "panel", "rounded-2xl", className)}>{children}</div>
);

export function PillTabs({ tabs, i, set, tone = "#3ec9a7" }: { tabs: string[]; i: number; set: (n: number) => void; tone?: string }) {
  return (
    <div className="no-bar flex gap-2 overflow-x-auto px-3 py-2">
      {tabs.map((t, k) => (
        <button
          key={t}
          onClick={() => { feel("tap"); set(k); }}
          className="relative shrink-0 rounded-full px-3.5 py-2 text-[11px] font-extrabold tracking-wide"
        >
          {k === i && <motion.span layoutId={`tabs-${tabs.join()}`} transition={S.pop} className="absolute inset-0 rounded-full" style={{ background: tone }} />}
          {k !== i && <span className="absolute inset-0 rounded-full border border-white/12 bg-white/[0.03]" />}
          <span className={cx("relative", k === i ? "text-[#08202a]" : "text-mist")}>{t}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Главная игровая кнопка: 3D-корпус, нажатие «в глубину» ---------- */
export function BigButton({
  children, tone = "gold", onClick, className, icon, sub,
}: { children: React.ReactNode; tone?: "gold" | "teal" | "coral" | "ghost" | "sky"; onClick?: () => void; className?: string; icon?: React.ReactNode; sub?: string }) {
  const map = {
    gold: { bg: "linear-gradient(180deg,#ffd964,#e0a72a)", sh: "#8f6412", fg: "#3c2a04" },
    teal: { bg: "linear-gradient(180deg,#54dcb6,#2a9b81)", sh: "#186050", fg: "#06231c" },
    coral: { bg: "linear-gradient(180deg,#f07f72,#c94a40)", sh: "#7d2a23", fg: "#2c0906" },
    sky: { bg: "linear-gradient(180deg,#6fb0e8,#3c74b4)", sh: "#1f4770", fg: "#04182c" },
    ghost: { bg: "linear-gradient(180deg,#2b3a58,#1e2a42)", sh: "#111a2c", fg: "#cfe0f7" },
  }[tone];
  return (
    <motion.button
      onClick={() => { feel("confirm", [8, 20, 8]); onClick?.(); }}
      whileTap={{ y: 4, scale: 0.985 }}
      whileHover={{ y: -1 }}
      transition={S.snap}
      style={{ background: map.bg, color: map.fg, boxShadow: `0 5px 0 ${map.sh}, 0 16px 26px -12px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.4)` }}
      className={cx("sheen relative w-full rounded-2xl px-4 py-3 text-[13px] font-extrabold uppercase tracking-wide", className)}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 emboss">{icon}{children}</span>
      {sub && <span className="relative z-10 mt-0.5 block text-[9px] font-bold opacity-70">{sub}</span>}
    </motion.button>
  );
}

/* ---------- Полоса прогресса с «догоняющим» призраком ---------- */
export function Bar({ v, max = 1, tone = "#3ec9a7", h = 10, label }: { v: number; max?: number; tone?: string; h?: number; label?: string }) {
  const p = Math.max(0, Math.min(1, v / max));
  return (
    <div className="panel-sunk relative w-full overflow-hidden rounded-full" style={{ height: h }}>
      <motion.div className="absolute inset-y-0 left-0 bg-white/25" animate={{ width: `${p * 100}%` }} transition={{ delay: 0.28, duration: 0.7, ease: E.out }} />
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: `linear-gradient(90deg, ${tone}, ${tone}bb)` }} animate={{ width: `${p * 100}%` }} transition={S.soft} />
      {label && <span className="absolute inset-0 grid place-items-center mono text-[9px] font-bold text-white/85">{label}</span>}
    </div>
  );
}

export const Tag = ({ children, tone = "#3ec9a7" }: { children: React.ReactNode; tone?: string }) => (
  <span className="rounded-full px-2 py-[3px] text-[8.5px] font-extrabold uppercase tracking-wider" style={{ background: tone + "26", color: tone, border: `1px solid ${tone}55` }}>
    {children}
  </span>
);

export const ScreenTitle = ({ kicker, title, tone = "#f2c14e" }: { kicker?: string; title: string; tone?: string }) => (
  <div className="px-3 text-center">
    {kicker && <div className="text-[9px] font-extrabold uppercase tracking-[0.32em]" style={{ color: tone }}>{kicker}</div>}
    <div className="title-xl mt-0.5 text-[19px] uppercase">{title}</div>
  </div>
);
