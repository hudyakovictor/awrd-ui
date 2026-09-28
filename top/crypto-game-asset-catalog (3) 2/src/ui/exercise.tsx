import type { ReactNode } from "react";
import { Btn, Icon, useCountUp } from "./kit";
import { Mascot } from "./Mascot";
import { cn } from "../utils/cn";

/** Bottom feedback sheet used by all exercises */
export function Verdict({ ok, title, text, onNext, label = "Continue", inline }: { ok: boolean; title?: string; text: string; onNext: () => void; label?: string; inline?: boolean }) {
  return (
    <div className={cn(inline ? "mt-3 rounded-2xl" : "absolute inset-x-0 bottom-0 z-30 rounded-t-3xl", "p-4", ok ? "bg-[#0f3b33]" : "bg-[#3d1628]")} style={{ animation: "slideUp .35s cubic-bezier(.2,1.2,.4,1) both" }}>
      <div className="mb-3 flex items-center gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full anim-pop", ok ? "bg-bull text-ink-900" : "bg-bear text-white")}><Icon name={ok ? "check" : "x"} size={22} stroke={3.4} /></span>
        <div><div className={cn("text-base font-extrabold", ok ? "text-bull" : "text-bear")}>{title ?? (ok ? "Верно!" : "Не совсем")}</div><div className="text-xs font-semibold text-ink-200">{text}</div></div>
      </div>
      <Btn v={ok ? "bull" : "bear"} block size="sm" onClick={onNext}>{label}</Btn>
    </div>
  );
}

export function ExHeader({ step, total, label, right }: { step: number; total: number; label?: string; right?: ReactNode }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-3">
        <div className="well h-3 flex-1 overflow-hidden rounded-full"><div className="h-full rounded-full bg-gradient-to-r from-sky to-bull transition-[width] duration-500" style={{ width: `${(step / total) * 100}%` }} /></div>
        <span className="font-mono text-[11px] font-extrabold text-ink-300">{Math.min(step + 1, total)}/{total}</span>
        {right}
      </div>
      {label && <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-violet">{label}</div>}
    </div>
  );
}

export function TimerBar({ t, color }: { t: number; color?: string }) {
  const c = color ?? (t > 0.5 ? "#2ee59d" : t > 0.25 ? "#ffc53d" : "#ff4d6a");
  return <div className="well h-2 overflow-hidden rounded-full"><div className="h-full origin-left rounded-full" style={{ transform: `scaleX(${t})`, background: c, boxShadow: `0 0 10px ${c}` }} /></div>;
}

export function Summary({ correct, total, xp, onRestart, title, extra }: { correct: number; total: number; xp: number; onRestart: () => void; title?: string; extra?: ReactNode }) {
  const acc = Math.round((correct / Math.max(1, total)) * 100);
  const a = useCountUp(acc, 1200);
  return (
    <div className="anim-pop flex flex-col items-center py-4 text-center">
      <Mascot mood={acc >= 80 ? "happy" : acc >= 50 ? "cool" : "sad"} size={80} />
      <div className="mt-2 text-xl font-extrabold text-white">{title ?? (acc >= 80 ? "Отлично!" : acc >= 50 ? "Неплохо" : "Нужна практика")}</div>
      <div className="mt-1 font-mono text-3xl font-extrabold text-gold">{Math.round(a)}%</div>
      <div className="mb-3 text-xs text-ink-400">{correct}/{total} верно · +{xp} XP</div>
      {extra}
      <Btn v="sky" size="sm" onClick={onRestart}><Icon name="refresh" size={14} />Again</Btn>
    </div>
  );
}

export function ScoreRing({ value, size = 72, color = "#2ee59d", label }: { value: number; size?: number; color?: string; label?: string }) {
  const R = size / 2 - 6, C = 2 * Math.PI * R;
  const v = useCountUp(value, 900);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90"><circle cx={size / 2} cy={size / 2} r={R} stroke="#081130" strokeWidth="7" fill="none" /><circle cx={size / 2} cy={size / 2} r={R} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - value / 100)} style={{ transition: "stroke-dashoffset .9s cubic-bezier(.3,1.2,.5,1)", filter: `drop-shadow(0 0 6px ${color})` }} /></svg>
      <div className="text-center"><div className="font-mono text-base font-extrabold text-white">{Math.round(v)}</div>{label && <div className="text-[8px] font-extrabold uppercase tracking-widest text-ink-400">{label}</div>}</div>
    </div>
  );
}
