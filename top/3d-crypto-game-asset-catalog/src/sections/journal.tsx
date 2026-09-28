import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { EquityCurve, Donut, Bars, PnlHeatmap } from "../components/Charts";
import { tap, sfx, fmt } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   I — ЖУРНАЛ: кривая доходности, винрейт, календарь, теги, ошибки.
   ═══════════════════════════════════════════════════════════════════ */

const EQUITY = {
  "1Н": [10000, 10040, 9980, 10120, 10090, 10240, 10180, 10310],
  "1М": [10000, 9940, 10080, 10020, 10190, 10110, 10280, 10220, 10390, 10310, 10480, 10420, 10590, 10510, 10680, 10620, 10750],
  "Всё": [10000, 9800, 9950, 9700, 9900, 9750, 10100, 9980, 10250, 10100, 10400, 10320, 10580, 10490, 10720, 10650, 10890, 10820, 11040],
};

/* ── I01 · Кривая доходности с периодами ── */
export function Equity() {
  const [per, setPer] = useState<keyof typeof EQUITY>("1М");
  const [hov, setHov] = useState<{ i: number | null; v: number }>({ i: null, v: 0 });
  const data = EQUITY[per];
  const pnl = data[data.length - 1] - data[0];
  const pct = (pnl / data[0]) * 100;
  const up = pnl >= 0;
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-ink-400">Баланс демо</div>
          <div className="font-mono text-2xl font-bold tabular-nums">${fmt(hov.i !== null ? hov.v : data[data.length - 1], 0)}</div>
          <div className={cn("mt-0.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-[12px] font-bold", up ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
            <Icon name={up ? "trendUp" : "trendDown"} size={13} stroke={2.6} />{up ? "+" : ""}{fmt(pnl, 0)} ({up ? "+" : ""}{pct.toFixed(1)}%)
          </div>
        </div>
        <div className="flex gap-1 rounded-xl bg-ink-850 p-1">
          {(Object.keys(EQUITY) as (keyof typeof EQUITY)[]).map((p) => (
            <button key={p} onClick={() => { tap("tick"); setPer(p); }} className={cn("rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold transition-colors", per === p ? "bg-sky text-white" : "text-ink-400 hover:text-white")}>{p}</button>
          ))}
        </div>
      </div>
      <div className="well mt-3 p-2">
        <EquityCurve data={data} onHover={(i, v) => setHov({ i, v })} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        {[["Макс. просадка", "−4.2%", "text-bear"], ["Лучший день", "+$310", "text-bull"], ["Сделок", String(data.length * 3), "text-sky"]].map(([t, v, c]) => (
          <div key={t as string} className="rounded-xl bg-ink-850 px-2 py-1.5"><div className={cn("font-mono text-[13px] font-bold", c as string)}>{v}</div><div className="text-[9px] text-ink-500">{t}</div></div>
        ))}
      </div>
    </div>
  );
}

/* ── I02 · Винрейт и сплит ── */
const SPLIT = [
  { v: 34, c: "#2BE38B", label: "Long +" },
  { v: 12, c: "#0E5C38", label: "Long −" },
  { v: 21, c: "#3D9BFF", label: "Short +" },
  { v: 9, c: "#1B3A7A", label: "Short −" },
];
const PAIRS = [
  { v: 38, label: "BTC" }, { v: 26, label: "ETH" }, { v: 17, label: "SOL" }, { v: 11, label: "TON" }, { v: 8, label: "ост." },
];

export function Winrate() {
  const [pick, setPick] = useState<number | null>(null);
  const wins = SPLIT[0].v + SPLIT[2].v;
  const total = SPLIT.reduce((a, p) => a + p.v, 0);
  const wr = Math.round((wins / total) * 100);
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <Donut parts={SPLIT} size={160} center={<><span className="font-display text-3xl font-black text-bull">{wr}%</span><span className="text-[9px] font-black uppercase text-ink-400">винрейт</span></>} />
      <div className="min-w-0">
        <div className="grid grid-cols-2 gap-1.5">
          {SPLIT.map((p) => (
            <div key={p.label} className="flex items-center gap-2 rounded-xl bg-ink-850 px-2.5 py-1.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.c }} />
              <span className="flex-1 text-[11px] font-bold">{p.label}</span>
              <span className="font-mono text-[11px] font-bold">{p.v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-ink-400">Сделок по парам · тапни столбец</div>
          <Bars values={PAIRS} height={86} color="#3D9BFF" onPick={setPick} />
          <div className="mt-1 h-4 text-[11px] font-bold text-ink-300">{pick !== null ? `${PAIRS[pick].label}: ${PAIRS[pick].v} сделок · винрейт ${62 + pick * 3}%` : " "}</div>
        </div>
      </div>
    </div>
  );
}

/* ── I03 · Календарь PnL ── */
const MONTH = [120, -45, 0, 210, -180, 95, 0, 310, 145, -60, 0, 88, -120, 260, 190, -30, 0, 140, -95, 220, 175, 0, -70, 130, 245, -40, 0, 180, 95, -25];

export function PnlCalendar() {
  const [day, setDay] = useState(14);
  const days = useMemo(() => MONTH.map((pnl, i) => ({ d: i + 1, pnl: pnl === 0 ? null : pnl, n: pnl === 0 ? 0 : 1 + ((i * 7) % 3) })), []);
  const sel = days[day - 1];
  const sum = MONTH.reduce((a, b) => a + b, 0);
  const green = MONTH.filter((v) => v > 0).length;
  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
      <PnlHeatmap days={days} onPick={setDay} />
      <div className="flex flex-col gap-2">
        <div className="panel-soft p-3 text-center" key={day}>
          <div className="text-[10px] font-black uppercase text-ink-400">{day} октября</div>
          {sel.pnl === null ? (
            <><div className="mt-1 font-display text-lg font-black text-ink-400">Выходной</div><div className="text-[11px] text-ink-500">сделок не было</div></>
          ) : (
            <><div className={cn("mt-1 font-mono text-2xl font-bold animate-pop", sel.pnl >= 0 ? "text-bull" : "text-bear")}>{sel.pnl >= 0 ? "+" : ""}{sel.pnl}</div><div className="text-[11px] text-ink-400">{sel.n} сделок · лучший +{Math.round(Math.abs(sel.pnl) * 0.7)}</div></>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="panel-soft py-2"><div className={cn("font-mono text-base font-bold", sum >= 0 ? "text-bull" : "text-bear")}>+{sum}</div><div className="text-[9px] text-ink-500">итог месяца</div></div>
          <div className="panel-soft py-2"><div className="font-mono text-base font-bold text-sky">{green}/30</div><div className="text-[9px] text-ink-500">зелёных дней</div></div>
        </div>
        <Btn s="xs" v="ghost" icon="share" onClick={() => sfx("coin")}>Экспорт CSV</Btn>
      </div>
    </div>
  );
}

/* ── I04 · Теги сетапов ── */
const TAGS = [
  { t: "пробой уровня", w: 14, l: 3, avg: "+$86" },
  { t: "отскок от MA", w: 11, l: 4, avg: "+$54" },
  { t: "новости", w: 5, l: 7, avg: "−$32" },
  { t: "ночной скальп", w: 3, l: 8, avg: "−$61" },
  { t: "лонг по тренду", w: 18, l: 6, avg: "+$72" },
];

export function TagStats() {
  const [hide, setHide] = useState<string[]>([]);
  const [sort, setSort] = useState<"wr" | "n">("wr");
  const rows = [...TAGS].filter((t) => !hide.includes(t.t)).sort((a, b) => sort === "wr" ? b.w / (b.w + b.l) - a.w / (a.w + a.l) : b.w + b.l - (a.w + a.l));
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[12px] text-ink-400">Сортировка:</span>
        <button onClick={() => { tap("tick"); setSort("wr"); }} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-bold", sort === "wr" ? "bg-sky text-white" : "bg-ink-800 text-ink-300")}>по винрейту</button>
        <button onClick={() => { tap("tick"); setSort("n"); }} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-bold", sort === "n" ? "bg-sky text-white" : "bg-ink-800 text-ink-300")}>по числу</button>
        {hide.length > 0 && <button onClick={() => setHide([])} className="ml-auto text-[11px] font-bold text-sky">показать все</button>}
      </div>
      <div className="space-y-2">
        {rows.map((t) => {
          const n = t.w + t.l;
          const wr = Math.round((t.w / n) * 100);
          const good = wr >= 55;
          return (
            <div key={t.t} className="panel-soft p-3 animate-fade">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-[13px] font-bold">#{t.t}</span>
                <Chip tone={good ? "bull" : "bear"}>{wr}%</Chip>
                <span className={cn("font-mono text-[11px] font-bold", t.avg.startsWith("+") ? "text-bull" : "text-bear")}>{t.avg}</span>
                <button onClick={() => { tap("tick"); setHide((h) => [...h, t.t]); }} className="text-ink-500 hover:text-bear" aria-label={`Скрыть ${t.t}`}><Icon name="x" size={14} /></button>
              </div>
              <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-ink-900">
                <div className="bg-bull transition-all duration-700" style={{ width: `${(t.w / n) * 100}%` }} />
                <div className="bg-bear transition-all duration-700" style={{ width: `${(t.l / n) * 100}%` }} />
              </div>
              <div className="mt-1 font-mono text-[10px] text-ink-500">{t.w}W · {t.l}L · {n} сделок</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 rounded-2xl bg-flame/10 p-3 text-[12px] font-semibold text-ink-200 ring-1 ring-flame/30">
        💡 «Ночной скальп» в минусе 8 из 11 раз. Макс советует: убери его из плана на 2 недели.
      </div>
    </div>
  );
}

/* ── I05 · Разбор ошибок с чек-листом ── */
const MISTAKES = [
  { t: "Вход без стоп-лосса", n: 9, cost: -420, tip: "Правило: нет стопа — нет сделки. Шаблон ордера уже подставляет SL.", fix: "Включить авто-стоп в настройках" },
  { t: "Усреднение убытка", n: 6, cost: -310, tip: "Усреднение = удвоение ошибки. План допускает максимум 1 добор.", fix: "Лимит: 1 добор на сделку" },
  { t: "Ранний выход из прибыли", n: 12, cost: -180, tip: "Ты забираешь +2%, а цель была +6%. Двигай стоп в безубыток и жди.", fix: "Ставить TP сразу при входе" },
];

export function MistakeCoach() {
  const [fixed, setFixed] = useState<string[]>([]);
  const [open, setOpen] = useState(0);
  const total = MISTAKES.filter((m) => !fixed.includes(m.t)).reduce((a, m) => a + m.cost, 0);
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 rounded-2xl bg-bear/10 p-3 ring-1 ring-bear/30">
        <span className="font-mono text-2xl font-bold text-bear">{total}</span>
        <span className="flex-1 text-[12px] font-semibold text-ink-200">упущено на 3 ошибках за месяц.<br />Исправь их — и кривая станет зеленее.</span>
        <span className="font-display text-xs font-black text-bull">{fixed.length}/3</span>
      </div>
      <div className="space-y-2">
        {MISTAKES.map((m, i) => {
          const done = fixed.includes(m.t);
          const isOpen = open === i;
          return (
            <div key={m.t} className={cn("overflow-hidden rounded-2xl transition-all", done ? "bg-bull/10 ring-1 ring-bull/40" : "bg-ink-850 ring-1 ring-white/5")}>
              <button onClick={() => { tap("tick"); setOpen(isOpen ? -1 : i); }} className="flex w-full items-center gap-3 p-3 text-left">
                <span className={cn("flex size-8 items-center justify-center rounded-xl font-display text-xs font-black", done ? "bg-bull text-ink-900" : "bg-bear/20 text-bear")}>
                  {done ? <Icon name="check" size={16} stroke={3} /> : m.n}
                </span>
                <span className="flex-1"><span className={cn("block text-[13px] font-bold", done && "line-through opacity-60")}>{m.t}</span><span className="font-mono text-[11px] text-bear">{m.cost} · {m.n} раз</span></span>
                <Icon name="chevD" size={16} className={cn("text-ink-400 transition-transform", isOpen && "rotate-180")} />
              </button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <div className="px-3 pb-3">
                    <div className="rounded-xl bg-ink-900/60 p-2.5 text-[12px] leading-relaxed text-ink-200">🧠 {m.tip}</div>
                    {!done && <Btn s="xs" v="bull" className="mt-2" icon="check" onClick={() => { sfx("success"); setFixed((f) => [...f, m.t]); }}>Принять: {m.fix}</Btn>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
