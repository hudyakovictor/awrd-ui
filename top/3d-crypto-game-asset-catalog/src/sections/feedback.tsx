import { useEffect, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Label, Btn, Bar, Spinner } from "../components/ui";
import { Mascot, CoinArt } from "../components/art";
import { tap, sfx, haptic, useInterval } from "../lib/fx";
import { cn } from "../utils/cn";

/* E01 — Modal */
export function Modal() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"danger" | "reward">("danger");
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 220); };
  const show = (k: "danger" | "reward") => { setKind(k); setOpen(true); sfx("whoosh"); };
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-2xl well p-4">
      <div className="space-y-2 opacity-60">
        {[1, 2, 3].map((i) => <div key={i} className="flex items-center gap-3 rounded-xl bg-ink-800 p-3"><div className="size-8 rounded-lg bg-ink-700" /><div className="h-2 flex-1 rounded bg-ink-700" /><div className="h-2 w-10 rounded bg-bull/40" /></div>)}
      </div>
      <div className="mt-4 flex gap-3">
        <Btn s="sm" v="bear" icon="x" onClick={() => show("danger")}>Закрыть позицию</Btn>
        <Btn s="sm" v="gold" icon="gift" onClick={() => show("reward")}>Награда</Btn>
      </div>
      {open && (
        <div className={cn("absolute inset-0 z-20 flex items-center justify-center bg-ink-950/70 p-4 backdrop-blur-sm transition-opacity", closing ? "opacity-0" : "animate-fade")} onClick={close}>
          <div onClick={(e) => e.stopPropagation()} className={cn("panel w-full max-w-xs p-5 text-center transition-all duration-200", closing ? "scale-90 opacity-0" : "animate-pop")}>
            {kind === "danger" ? (
              <>
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-bear/15 text-bear ring-2 ring-bear/30"><Icon name="alert" size={28} stroke={2.4} /></div>
                <div className="mt-3 font-display text-base font-black">Закрыть в убыток?</div>
                <div className="mt-1 text-[13px] text-ink-300">Позиция ETH Short: <span className="font-mono font-bold text-bear">−$42.70</span>. Действие нельзя отменить.</div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Btn s="sm" v="ink" onClick={close}>Отмена</Btn>
                  <Btn s="sm" v="bear" onClick={() => { haptic([20, 30, 20]); sfx("error"); close(); }}>Закрыть</Btn>
                </div>
              </>
            ) : (
              <>
                <div className="relative mx-auto w-fit"><Mascot size={96} mood="hype" className="animate-bob" /></div>
                <div className="font-display text-base font-black">Ежедневный бонус!</div>
                <div className="mt-1 flex items-center justify-center gap-1 font-display text-2xl font-black text-gold"><CoinArt size={28} /> +250</div>
                <Btn block s="md" v="gold" className="mt-5" onClick={() => { sfx("coin"); close(); }}>Забрать</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* E02 — Toast stack (local) */
type T = { id: number; k: "success" | "info" | "warn" | "error"; t: string; life: number };
const TK: Record<T["k"], { icon: IconName; c: string; bar: string; msg: string }> = {
  success: { icon: "check", c: "text-bull ring-bull/30", bar: "bg-bull", msg: "Ордер исполнен: +0.02 BTC" },
  info: { icon: "info", c: "text-sky ring-sky/30", bar: "bg-sky", msg: "Новый урок: «Уровни поддержки»" },
  warn: { icon: "alert", c: "text-gold ring-gold/30", bar: "bg-gold", msg: "Маржа ниже 30% — пополни" },
  error: { icon: "x", c: "text-bear ring-bear/30", bar: "bg-bear", msg: "Стоп-лосс сработал: −$18" },
};
export function Toasts() {
  const [list, setList] = useState<T[]>([]);
  useInterval(() => setList((l) => l.map((t) => ({ ...t, life: t.life - 2 })).filter((t) => t.life > 0)), list.length ? 60 : null);
  const push = (k: T["k"]) => { sfx(k === "error" ? "error" : k === "success" ? "success" : "tap"); haptic(10); setList((l) => [...l.slice(-3), { id: Date.now(), k, t: TK[k].msg, life: 100 }]); };
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 content-start">
        <Btn s="xs" icon="check" onClick={() => push("success")}>Успех</Btn>
        <Btn s="xs" v="sky" icon="info" onClick={() => push("info")}>Инфо</Btn>
        <Btn s="xs" v="gold" icon="alert" onClick={() => push("warn")}>Внимание</Btn>
        <Btn s="xs" v="bear" icon="x" onClick={() => push("error")}>Ошибка</Btn>
      </div>
      <div className="well min-h-[220px] space-y-2 p-3">
        {!list.length && <div className="flex h-full min-h-[190px] items-center justify-center text-[12px] text-ink-500">Нажми кнопку — тост появится здесь</div>}
        {list.map((t) => (
          <div key={t.id} className={cn("relative flex items-center gap-3 overflow-hidden rounded-2xl bg-ink-750 p-3 pr-2 ring-1 shadow-[0_4px_0_#0a1430] animate-slide-up", TK[t.k].c)}>
            <span className="flex size-8 items-center justify-center rounded-xl bg-current/15"><Icon name={TK[t.k].icon} size={16} stroke={3} /></span>
            <span className="flex-1 text-[12px] font-bold text-ink-100">{t.t}</span>
            <button onClick={() => { tap("tick"); setList((l) => l.filter((x) => x.id !== t.id)); }} className="rounded-lg p-1 text-ink-400 hover:bg-white/10 hover:text-white" aria-label="close"><Icon name="x" size={14} /></button>
            <div className={cn("absolute bottom-0 left-0 h-[3px]", TK[t.k].bar)} style={{ width: `${t.life}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* E03 — Alert banners */
export function Alerts() {
  const [shown, setShown] = useState([true, true, true]);
  const items = [
    { icon: "alert" as IconName, t: "Высокая волатильность", d: "BTC −6% за час. Уменьши плечо.", c: "from-flame/25 to-flame/5 ring-flame/40 text-flame", a: "Снизить" },
    { icon: "sparkles" as IconName, t: "Двойной XP до 23:59", d: "Каждый урок даёт x2 опыта.", c: "from-violet/25 to-violet/5 ring-violet/40 text-violet", a: "Играть" },
    { icon: "shield" as IconName, t: "Защита стрика активна", d: "Пропуск дня не сбросит огонь.", c: "from-sky/25 to-sky/5 ring-sky/40 text-sky", a: "Ок" },
  ];
  return (
    <div className="space-y-3">
      {items.map((a, i) => (
        <div key={a.t} className={cn("grid transition-all duration-300", shown[i] ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 -translate-x-6")}>
          <div className="overflow-hidden">
            <div className={cn("flex items-center gap-3 rounded-2xl bg-gradient-to-r p-3 ring-1 shadow-[0_4px_0_#0a1430]", a.c)}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-current/15"><Icon name={a.icon} size={20} stroke={2.4} /></span>
              <div className="min-w-0 flex-1"><div className="font-display text-xs font-bold text-white">{a.t}</div><div className="text-[12px] text-ink-300">{a.d}</div></div>
              <button onClick={() => { tap(); setShown((s) => s.map((v, j) => (j === i ? false : v))); }} className="rounded-xl bg-white/10 px-3 py-1.5 font-display text-[10px] font-bold uppercase text-white shadow-[0_2px_0_rgba(0,0,0,.3)] hover:bg-white/20 active:translate-y-0.5">{a.a}</button>
            </div>
          </div>
        </div>
      ))}
      {!shown.some(Boolean) && <Btn s="xs" v="ghost" icon="refresh" onClick={() => setShown([true, true, true])}>Вернуть</Btn>}
    </div>
  );
}

/* E04 — Progress set */
export function Progress() {
  const [p, setP] = useState(45);
  const [seg, setSeg] = useState(3);
  const [run, setRun] = useState(true);
  useInterval(() => setP((v) => (v >= 100 ? 0 : v + 1)), run ? 80 : null);
  const r = 34, C = 2 * Math.PI * r;
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
      <button onClick={() => { tap(); setRun(!run); }} className="relative mx-auto size-32" aria-label="toggle progress">
        <svg viewBox="0 0 80 80" className="size-full -rotate-90">
          <circle cx="40" cy="40" r={r} stroke="#081229" strokeWidth="10" fill="none" />
          <circle cx="40" cy="40" r={r} stroke="url(#pg)" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p / 100)} style={{ transition: "stroke-dashoffset .1s linear", filter: "drop-shadow(0 0 6px rgba(255,138,61,.6))" }} />
          <defs><linearGradient id="pg"><stop offset="0" stopColor="#FFC940" /><stop offset="1" stopColor="#FF8A3D" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-black tabular-nums">{p}%</span>
          <span className="text-[9px] font-bold uppercase text-ink-400">{run ? "пауза" : "старт"}</span>
        </div>
      </button>
      <div className="space-y-4">
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-bold"><span className="text-ink-300">Загрузка графиков…</span><span className="font-mono">{p}%</span></div>
          <Bar value={p} tone="flame" />
        </div>
        <div>
          <Label>Сегменты урока · тапни</Label>
          <div className="flex gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <button key={i} onClick={() => { tap("tick"); setSeg(i + 1); }} className={cn("h-3.5 flex-1 rounded-full transition-all duration-300", i < seg ? "bg-bull shadow-[0_2px_0_var(--color-bull-d)]" : "bg-ink-850 shadow-[inset_0_2px_4px_rgba(0,0,0,.5)]")} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2"><Spinner className="size-6 text-sky" /><span className="text-[11px] text-ink-400">Spinner</span></div>
          <div className="flex items-center gap-2"><CoinArt size={28} className="animate-coin" /><span className="text-[11px] text-ink-400">Coin loader</span></div>
          <div className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2.5 rounded-full bg-bull animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
        </div>
      </div>
    </div>
  );
}

/* E05 — Skeleton & empty */
export function SkeletonEmpty() {
  const [state, setState] = useState<"loading" | "empty" | "data">("loading");
  useEffect(() => { if (state === "loading") { const t = setTimeout(() => setState("empty"), 1800); return () => clearTimeout(t); } }, [state]);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="well space-y-3 p-4">
        <Label>Skeleton · shimmer</Label>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="shine-sweep size-10 rounded-xl bg-ink-700" />
            <div className="flex-1 space-y-2"><div className="shine-sweep h-2.5 w-3/4 rounded bg-ink-700" /><div className="shine-sweep h-2 w-1/2 rounded bg-ink-750" /></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-600 p-4 text-center">
        {state === "loading" && <><Spinner className="size-8 text-sky" /><div className="mt-3 text-[12px] text-ink-400">Загружаем позиции…</div></>}
        {state === "empty" && (
          <div className="animate-pop">
            <Mascot size={84} mood="think" className="mx-auto" />
            <div className="font-display text-sm font-bold">Пока нет сделок</div>
            <div className="mb-3 text-[12px] text-ink-400">Открой первую демо-позицию</div>
            <Btn s="xs" icon="plus" onClick={() => { sfx("success"); setState("data"); }}>Новая сделка</Btn>
          </div>
        )}
        {state === "data" && (
          <div className="w-full animate-slide-up">
            <div className="flex items-center gap-3 rounded-xl bg-ink-800 p-3 text-left"><span className="flex size-9 items-center justify-center rounded-lg bg-bull/15 text-bull"><Icon name="trendUp" size={18} /></span><div className="flex-1"><div className="text-xs font-bold">BTC Long 5x</div><div className="font-mono text-[11px] text-bull">+$12.40</div></div></div>
            <Btn s="xs" v="ghost" className="mt-3" icon="refresh" onClick={() => setState("loading")}>Сброс</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
