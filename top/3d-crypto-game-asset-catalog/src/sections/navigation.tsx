import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Label, Btn } from "../components/ui";
import { FlameArt, GemArt, HeartArt, CoinArt } from "../components/art";
import { tap, sfx } from "../lib/fx";
import { cn } from "../utils/cn";

/* N01 — Bottom tab bar */
const TABS: { k: string; icon: IconName; t: string; badge?: number; tone: string }[] = [
  { k: "learn", icon: "home", t: "Учёба", tone: "text-bull" },
  { k: "trade", icon: "candle", t: "Симулятор", tone: "text-sky" },
  { k: "league", icon: "trophy", t: "Лига", badge: 3, tone: "text-gold" },
  { k: "quests", icon: "target", t: "Квесты", badge: 1, tone: "text-flame" },
  { k: "me", icon: "user", t: "Профиль", tone: "text-violet" },
];
export function TabBar({ compact }: { compact?: boolean }) {
  const [active, setActive] = useState("learn");
  const idx = TABS.findIndex((t) => t.k === active);
  return (
    <div className={cn("relative panel grid grid-cols-5 p-1.5", compact && "rounded-[20px]")}>
      <div className="absolute top-1.5 bottom-2 rounded-2xl bg-ink-850 shadow-[inset_0_3px_6px_rgba(0,0,0,.5)] ring-2 ring-white/5 transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.3,.64,1)]"
        style={{ left: `calc(${idx * 20}% + 6px)`, width: `calc(20% - 12px)` }} />
      {TABS.map((t) => {
        const on = t.k === active;
        return (
          <button key={t.k} onClick={() => { tap("tick"); setActive(t.k); }} aria-label={t.t}
            className={cn("relative z-10 flex flex-col items-center gap-0.5 py-2 transition-colors", on ? t.tone : "text-ink-400 hover:text-ink-200")}>
            <span className={cn("transition-transform duration-300 [transition-timing-function:cubic-bezier(.34,1.56,.64,1)]", on && "-translate-y-0.5 scale-110")}>
              <Icon name={t.icon} size={compact ? 20 : 22} stroke={on ? 2.6 : 2} />
            </span>
            {!compact && <span className="text-[9px] font-extrabold uppercase tracking-wider">{t.t}</span>}
            {t.badge && !on && <span className="absolute right-[18%] top-1 flex size-4 items-center justify-center rounded-full bg-bear text-[9px] font-black text-white shadow-[0_2px_0_var(--color-bear-d)] animate-pop">{t.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* N02 — HUD */
export function Hud({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [hearts, setHearts] = useState(4);
  const items = [
    { k: "streak", art: <FlameArt size={24} className="animate-flicker" />, v: "27", c: "text-flame", title: "Стрик 27 дней", body: "Пройди урок сегодня, чтобы не потерять огонь. Заморозка: 2 шт." },
    { k: "gems", art: <GemArt size={24} />, v: "1 240", c: "text-sky", title: "Кристаллы", body: "Премиум-валюта: заморозки, бусты XP, скины для графика." },
    { k: "coins", art: <CoinArt size={24} />, v: "8.5K", c: "text-gold", title: "Монеты", body: "Виртуальный депозит симулятора. Реальных денег нет." },
    { k: "hearts", art: <HeartArt size={24} empty={hearts === 0} />, v: String(hearts), c: "text-bear", title: `Жизни ${hearts}/5`, body: "Ошибка в уроке = −1 жизнь. Восстановление: 1 за 4 часа." },
  ];
  return (
    <div className="relative">
      <div className={cn("panel-soft flex items-center justify-between gap-0.5 px-1.5 py-1.5 sm:gap-1 sm:px-2", compact && "rounded-2xl")}>
        <button className="flex items-center gap-1.5 rounded-xl px-2 py-1 hover:bg-white/5" onClick={() => tap()}>
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-b from-[#FFE58A] to-gold text-[10px] font-black text-ink-900 shadow-[0_2px_0_var(--color-gold-d)]">B</span>
          {!compact && <Icon name="chevD" size={14} className="text-ink-400" />}
        </button>
        {items.map((i) => (
          <button key={i.k} onClick={() => { tap("tick"); setOpen(open === i.k ? null : i.k); }}
            className={cn("flex min-w-0 items-center gap-1 rounded-xl px-1 py-1 transition-colors hover:bg-white/5 sm:px-2", open === i.k && "bg-white/10")}>
            {i.art}<span className={cn("font-display text-xs font-black tabular-nums", i.c)}>{i.v}</span>
          </button>
        ))}
      </div>
      {open && (() => {
        const i = items.find((x) => x.k === open)!;
        return (
          <div className="absolute left-2 right-2 top-full z-30 mt-3 panel p-4 animate-slide-up">
            <div className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#172b57]" />
            <div className="flex items-center gap-3">
              <div className="scale-150 p-2">{i.art}</div>
              <div className="flex-1">
                <div className="font-display text-sm font-bold">{i.title}</div>
                <div className="text-[12px] leading-snug text-ink-300">{i.body}</div>
              </div>
            </div>
            {i.k === "hearts" && (
              <div className="mt-3 flex gap-2">
                <Btn s="xs" v="bear" onClick={() => setHearts((h) => Math.max(0, h - 1))}>−1</Btn>
                <Btn s="xs" v="sky" icon="gem" onClick={() => { sfx("success"); setHearts(5); }}>Восстановить · 350</Btn>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* N03 — Tabs, breadcrumbs, pagination */
export function TabsNav() {
  const tabs = ["Обзор", "Позиции", "История", "Ордера"];
  const [t, setT] = useState(0);
  const [page, setPage] = useState(2);
  const [crumb, setCrumb] = useState(3);
  const crumbs = ["Курс", "Основы", "Свечи", "Паттерны"];
  const pages = 8;
  const around = [1, page - 1, page, page + 1, pages].filter((p, i, a) => p >= 1 && p <= pages && a.indexOf(p) === i).sort((a, b) => a - b);
  return (
    <div className="space-y-5">
      <div>
        <Label>Табы · underline-пилюля</Label>
        <div className="relative flex gap-1 border-b-2 border-ink-700">
          {tabs.map((x, i) => (
            <button key={x} onClick={() => { tap("tick"); setT(i); }} className={cn("relative flex-1 pb-3 pt-1 font-display text-[11px] font-bold uppercase tracking-wider transition-colors", t === i ? "text-white" : "text-ink-400 hover:text-ink-200")}>
              {x}{i === 1 && <span className="ml-1 rounded-md bg-bull/20 px-1.5 text-bull">2</span>}
            </button>
          ))}
          <div className="absolute -bottom-[2px] h-1 rounded-full bg-sky shadow-[0_0_12px_var(--color-sky)] transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.3,.64,1)]" style={{ left: `calc(${t * 25}% + 12px)`, width: `calc(25% - 24px)` }} />
        </div>
      </div>
      <div>
        <Label>Хлебные крошки</Label>
        <div className="well inline-flex flex-wrap items-center gap-1 px-2 py-1.5">
          {crumbs.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              <button onClick={() => { tap("tick"); setCrumb(i); }} className={cn("rounded-lg px-2 py-1 text-xs font-bold transition-colors", i === crumb ? "bg-ink-700 text-white shadow-[0_2px_0_#0e1b3a]" : i < crumb ? "text-sky hover:bg-white/5" : "text-ink-500")}>{c}</button>
              {i < crumbs.length - 1 && <Icon name="chevR" size={12} className="text-ink-500" />}
            </span>
          ))}
        </div>
      </div>
      <div>
        <Label>Пагинация</Label>
        <div className="flex items-center gap-2">
          <Btn s="sm" v="ink" icon="chevL" disabled={page === 1} onClick={() => setPage(page - 1)} className="w-10 px-0" aria-label="prev" />
          {around.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              {i > 0 && p - around[i - 1] > 1 && <span className="text-ink-500">…</span>}
              <button onClick={() => { tap("tick"); setPage(p); }} className={cn("btn3d h-10 w-10 text-xs", p === page ? "v-sky" : "v-ghost")}>{p}</button>
            </span>
          ))}
          <Btn s="sm" v="ink" icon="chevR" disabled={page === pages} onClick={() => setPage(page + 1)} className="w-10 px-0" aria-label="next" />
        </div>
      </div>
    </div>
  );
}

/* N04 — Onboarding stepper */
const STEPS: { t: string; icon: IconName; d: string }[] = [
  { t: "Цель", icon: "target", d: "Зачем ты учишься трейдингу" },
  { t: "Уровень", icon: "brain", d: "Мини-тест из 5 вопросов" },
  { t: "Риск", icon: "shield", d: "Профиль допустимых потерь" },
  { t: "Кошелёк", icon: "wallet", d: "Демо-депозит $10 000" },
  { t: "Старт", icon: "bolt", d: "Первый урок · 3 минуты" },
];
export function Stepper() {
  const [s, setS] = useState(2);
  return (
    <div className="space-y-5">
      <div className="relative flex items-start justify-between px-2 pt-10">
        <div className="absolute left-7 right-7 top-[62px] h-1.5 rounded-full bg-ink-800" />
        <div className="absolute left-7 top-[62px] h-1.5 rounded-full bg-gradient-to-r from-bull to-sky shadow-[0_0_12px_rgba(43,227,139,.6)] transition-all duration-500" style={{ width: `calc(${(s / (STEPS.length - 1)) * 100}% - ${(s / (STEPS.length - 1)) * 56}px)` }} />
        {STEPS.map((st, i) => {
          const done = i < s, cur = i === s;
          return (
            <button key={st.t} onClick={() => { tap("tick"); setS(i); }} className="relative z-10 flex w-14 flex-col items-center gap-2">
              {cur && (
                <div className="absolute -top-10 whitespace-nowrap rounded-xl bg-white px-2.5 py-1 font-display text-[10px] font-bold text-ink-900 shadow-[0_3px_0_#8aa0d4] animate-pop" key={s}>
                  {st.d.split(" ").slice(0, 3).join(" ")}
                  <div className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-white" />
                </div>
              )}
              <span className={cn("relative flex size-11 items-center justify-center rounded-full transition-all duration-300",
                done ? "bg-bull text-ink-900 shadow-[0_4px_0_var(--color-bull-d)]" : cur ? "bg-sky text-white shadow-[0_4px_0_var(--color-sky-d)] scale-110" : "bg-ink-750 text-ink-400 shadow-[0_4px_0_#0a1430]")}>
                {cur && <span className="absolute inset-0 rounded-full bg-sky animate-ring" />}
                <Icon name={done ? "check" : st.icon} size={18} stroke={2.6} className="relative" />
              </span>
              <span className={cn("text-[10px] font-extrabold uppercase tracking-wider", cur ? "text-white" : done ? "text-bull" : "text-ink-500")}>{st.t}</span>
            </button>
          );
        })}
      </div>
      <div className="panel-soft flex items-center gap-3 p-3">
        <div className="flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">Шаг {s + 1} из {STEPS.length}</div>
          <div className="text-sm font-bold">{STEPS[s].d}</div>
        </div>
        <Btn s="sm" v="ghost" disabled={s === 0} onClick={() => setS(s - 1)}>Назад</Btn>
        <Btn s="sm" onClick={() => { if (s === STEPS.length - 1) sfx("levelup"); setS(Math.min(STEPS.length - 1, s + 1)); }}>{s === STEPS.length - 1 ? "Готово" : "Далее"}</Btn>
      </div>
    </div>
  );
}
