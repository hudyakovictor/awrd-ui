import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { tap, sfx, haptic, useInterval, notify } from "../lib/fx";
import { LabChart, genCandles, type Regime } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   ВРЕМЯ: Market Replay · News Timeline · History Room.
   Общая идея — время как ось взаимодействия: скраб, события, эпохи.
   ═══════════════════════════════════════════════════════════════════ */

type Ev = { i: number; t: string; d: string; hex: string };

/* ── TL03 · MARKET REPLAY ─────────────────────────────── */
const REPLAY_SEEDS: { t: string; seed: number; regime: Regime; base: number; hex: string }[] = [
  { t: "Бычий забег", seed: 101, regime: "breakout", base: 60000, hex: "#2BE38B" },
  { t: "Медвежий рынок", seed: 202, regime: "trend-down", base: 69000, hex: "#FF4D6D" },
  { t: "Шторм", seed: 303, regime: "volatile", base: 64000, hex: "#FFC940" },
];

export function MarketReplay() {
  const [cfg, setCfg] = useState(0);
  const [progress, setProgress] = useState(40);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [hideFuture, setHideFuture] = useState(true);
  const [seen, setSeen] = useState<number[]>([]);
  const C = REPLAY_SEEDS[cfg];
  const data = useMemo(() => genCandles(C.seed, 180, C.base, C.regime, 1), [C]);
  const events: Ev[] = useMemo(() => [
    { i: 34, t: "Накопление", d: "Объёмы сжимаются, волатильность падает", hex: "#3D9BFF" },
    { i: 78, t: "Первый импульс", d: "Пробой диапазона на растущем объёме", hex: "#FFC940" },
    { i: 112, t: "Ретест", d: "Возврат к пробитому уровню", hex: "#9A6BFF" },
    { i: 148, t: "Развязка", d: "Финальное движение сессии", hex: C.hex },
  ], [C]);
  const future = hideFuture ? data.length - progress : 0;

  useInterval(() => {
    setProgress((p) => {
      const n = Math.min(data.length, p + speed);
      events.forEach((e) => {
        if (e.i <= n && !seen.includes(e.i)) {
          setSeen((s) => [...s, e.i]);
          sfx("tick"); haptic(8);
          notify(`Событие: ${e.t}`, "info");
        }
      });
      if (n >= data.length) setPlaying(false);
      return n;
    });
  }, playing ? 140 : null);

  const jump = (i: number) => {
    tap("tick");
    setProgress(Math.min(data.length, Math.max(8, i + 6)));
    if (!seen.includes(events.find((e) => e.i === i)?.i ?? -1)) setSeen((s) => [...s, i]);
  };
  const vis = data.slice(0, progress);
  const first = vis[0]?.c ?? 1;
  const ret = ((vis[vis.length - 1]?.c ?? first) - first) / first * 100;

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {REPLAY_SEEDS.map((s, k) => (
            <button key={s.t} onClick={() => { tap("tick"); setCfg(k); setProgress(40); setSeen([]); setPlaying(false); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", cfg === k ? "text-ink-900" : "text-ink-300 hover:text-white")}
              style={cfg === k ? { background: s.hex } : undefined}>{s.t}</button>
          ))}
        </div>
        <span className={cn("ml-auto font-mono text-sm font-black tabular-nums", ret >= 0 ? "text-bull" : "text-bear")}>
          {ret >= 0 ? "+" : ""}{ret.toFixed(1)}% за сессию
        </span>
      </div>

      <div className="well relative mt-3 overflow-hidden p-1.5">
        <LabChart id="replay" data={data} height={230} future={future}
          highlight={useMemo(() => new Set(events.filter((e) => e.i < progress).map((e) => e.i)), [events, progress])} />
        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          <span className={cn("rounded-lg px-2 py-1 font-display text-[10px] font-black uppercase", playing ? "bg-bear/80 text-white animate-pulse" : "bg-ink-800 text-ink-300")}>
            {playing ? "● replay" : hideFuture ? "пауза · будущее скрыто" : "пауза · виден весь ряд"}
          </span>
        </div>
      </div>

      {/* транспорт */}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => { tap(); setProgress(8); setSeen([]); setPlaying(false); }} aria-label="В начало" className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-ink-200 shadow-[0_3px_0_#0a1430] hover:text-white"><Icon name="chevL" size={16} /><Icon name="chevL" size={16} className="-ml-2.5" /></button>
        <button onClick={() => setProgress((p) => Math.max(8, p - 5))} aria-label="Назад 5" className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-ink-200 shadow-[0_3px_0_#0a1430] hover:text-white"><Icon name="chevL" size={18} /></button>
        <button onClick={() => { tap(playing ? "error" : "success"); setPlaying(!playing); if (!playing && progress >= data.length) { setProgress(8); setSeen([]); } }}
          aria-label={playing ? "Пауза" : "Старт"} className={cn("btn3d size-12 rounded-2xl px-0", playing ? "v-bear" : "v-bull")}>
          <Icon name={playing ? "minus" : "play"} size={20} stroke={2.8} />
        </button>
        <button onClick={() => setProgress((p) => Math.min(data.length, p + 5))} aria-label="Вперёд 5" className="flex size-10 items-center justify-center rounded-xl bg-ink-800 text-ink-200 shadow-[0_3px_0_#0a1430] hover:text-white"><Icon name="chevR" size={18} /></button>
        <div className="relative mx-1 flex-1">
          <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
          <div className="absolute left-0 top-[11px] h-3 rounded-full bg-gradient-to-r from-sky to-bull" style={{ width: `${(progress / data.length) * 100}%` }} />
          {events.map((e) => (
            <button key={e.i} onClick={() => jump(e.i)} aria-label={e.t} title={e.t}
              className={cn("absolute top-[5px] size-4 -translate-x-1/2 rounded-full border-2 border-ink-900 transition-transform hover:scale-125", e.i < progress ? "" : "opacity-50")}
              style={{ left: `${(e.i / data.length) * 100}%`, background: e.hex }} />
          ))}
          <input type="range" min={8} max={data.length} value={progress} onChange={(e) => { setPlaying(false); setProgress(+e.target.value); }} className="rng relative" aria-label="позиция реплея" />
        </div>
        <span className="hidden font-mono text-[11px] text-ink-400 sm:block">{progress}/{data.length}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {[1, 2, 4, 8].map((s) => (
            <button key={s} onClick={() => { tap("tick"); setSpeed(s); }} className={cn("rounded-lg px-2 py-1 font-mono text-[11px] font-bold", speed === s ? "bg-gold text-ink-900" : "bg-ink-800 text-ink-300")}>{s}x</button>
          ))}
        </div>
        <button onClick={() => { tap("tick"); setHideFuture(!hideFuture); }} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold", hideFuture ? "bg-violet/20 text-violet" : "bg-ink-800 text-ink-400")}>
          <Icon name="eyeOff" size={14} />{hideFuture ? "будущее скрыто" : "показать будущее"}
        </button>
      </div>

      {/* события */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((e) => {
          const active = e.i < progress;
          const next = !active && e.i >= progress && events.filter((x) => x.i < progress).length === events.indexOf(e);
          return (
            <button key={e.i} onClick={() => jump(e.i)}
              className={cn("rounded-2xl border-2 p-3 text-left transition-all", active ? "border-transparent bg-ink-800" : next ? "border-dashed border-ink-500 bg-ink-900/40" : "border-transparent bg-ink-900/40 opacity-60")}>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: active ? e.hex : "#30508F" }} />
                <span className="font-mono text-[10px] text-ink-500">#{e.i}</span>
                {active && <Icon name="check" size={12} stroke={3} className="text-bull" />}
              </div>
              <div className="mt-1 text-[12px] font-black">{e.t}</div>
              <div className="text-[11px] leading-snug text-ink-400">{e.d}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── TL04 · NEWS TIMELINE ─────────────────────────────── */
const NEWS: { t: string; src: string; d: string; mood: "bull" | "bear"; at: number; hex: string }[] = [
  { t: "ФРС намекнула на паузу", src: "Reuters", d: "Рисковые активы выдохнули: деньги дешевеют — трейдеры возвращаются в крипту.", mood: "bull", at: 22, hex: "#2BE38B" },
  { t: "Биржа остановила выводы", src: "CoinDesk", d: "Паника: часть игроков распродаёт «на всякий случай», спреды расширяются.", mood: "bear", at: 58, hex: "#FF4D6D" },
  { t: "Крупный фонд докупил BTC", src: "Bloomberg", d: "Ончейн-метки показывают отток с бирж — монеты уходят в холод.", mood: "bull", at: 96, hex: "#3D9BFF" },
  { t: "Ликвидации на $400M", src: "Coinglass", d: "Каскад стопов снёс плечи 20x+. Рынок очистился и отскочил.", mood: "bear", at: 132, hex: "#FF8A3D" },
  { t: "ETF-фонд обновил рекорд", src: "The Block", d: "Недельный приток — максимум квартала. Тренд подтверждён.", mood: "bull", at: 158, hex: "#9A6BFF" },
];

export function NewsTimeline() {
  const [sel, setSel] = useState(2);
  const [follow, setFollow] = useState(true);
  const data = useMemo(() => genCandles(5150, 180, 64000, "breakout", 1), []);
  const ev = NEWS[sel];
  const win = 44;
  const a = Math.max(0, Math.min(data.length - win, ev.at - Math.floor(win / 2)));
  const view = data.slice(a, a + win);
  const refPrice = data[ev.at].c;
  const after = data[Math.min(data.length - 1, ev.at + 6)].c;
  const react = ((after - refPrice) / refPrice) * 100;
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!follow) return;
    track.current?.querySelector(`[data-n="${sel}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [sel, follow]);

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex items-center gap-2">
        <Chip tone="sky">Новости → цена</Chip>
        <span className="text-[11px] text-ink-400">выбери событие — график подъедет к нему</span>
        <button onClick={() => { tap("tick"); setFollow(!follow); }} className={cn("ml-auto rounded-lg px-2.5 py-1.5 text-[11px] font-bold", follow ? "bg-sky/20 text-sky" : "bg-ink-800 text-ink-400")}>
          {follow ? "следование вкл" : "следование выкл"}
        </button>
      </div>

      {/* лента */}
      <div ref={track} className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
        {NEWS.map((n, k) => (
          <button key={n.t} data-n={k} onClick={() => { tap("tick"); setSel(k); sfx("whoosh"); }}
            className={cn("w-40 shrink-0 rounded-2xl border-2 p-2.5 text-left transition-all", sel === k ? "bg-ink-800" : "bg-ink-900/50 hover:bg-ink-800/70")}
            style={sel === k ? { borderColor: n.hex } : { borderColor: "transparent" }}>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: n.hex }} />
              <span className="font-mono text-[9px] text-ink-500">#{n.at} · {n.src}</span>
            </div>
            <div className="mt-1 text-[11px] font-black leading-tight">{n.t}</div>
          </button>
        ))}
      </div>
      {/* ось */}
      <div className="relative mx-1 mt-1 h-1.5 rounded-full bg-ink-800">
        {NEWS.map((n, k) => (
          <button key={n.t} onClick={() => setSel(k)} aria-label={n.t}
            className={cn("absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink-900 transition-all", sel === k && "scale-125")}
            style={{ left: `${(n.at / 180) * 100}%`, background: n.hex }} />
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="well relative mt-3 overflow-hidden p-1.5">
          <LabChart key={sel} id="news" data={view} height={210}
            highlight={useMemo(() => new Set([ev.at - a]), [ev, a])} />
          <div className="absolute left-3 top-3 rounded-lg bg-ink-950/80 px-2 py-1 font-mono text-[10px] text-ink-300">
            окно свечей {a}–{a + win} · событие #{ev.at}
          </div>
        </div>
        <div key={sel} className="mt-3 rounded-2xl bg-ink-950/50 p-4 ring-1 animate-slide-up lg:mt-3" style={{ ["--tw-ring-color" as string]: `${ev.hex}55` } as React.CSSProperties}>
          <div className="flex items-center gap-2">
            <span className={cn("rounded-lg px-2 py-0.5 font-display text-[10px] font-black uppercase", ev.mood === "bull" ? "bg-bull text-ink-900" : "bg-bear text-white")}>
              {ev.mood === "bull" ? "Бычья" : "Медвежья"}
            </span>
            <span className="font-mono text-[10px] text-ink-500">{ev.src}</span>
          </div>
          <div className="mt-2 font-display text-sm font-black leading-snug">{ev.t}</div>
          <div className="mt-1 text-[12px] leading-relaxed text-ink-300">{ev.d}</div>
          <div className={cn("mt-3 rounded-xl px-3 py-2 font-mono text-sm font-black tabular-nums", react >= 0 ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
            реакция +6 свечей: {react >= 0 ? "+" : ""}{react.toFixed(2)}%
          </div>
          <div className="mt-3 flex gap-2">
            <Btn s="xs" v="ink" icon="chevL" disabled={sel === 0} onClick={() => setSel(sel - 1)}>Назад</Btn>
            <Btn s="xs" v="sky" icon="chevR" disabled={sel === NEWS.length - 1} onClick={() => setSel(sel + 1)}>Далее</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TL05 · HISTORY ROOM ─────────────────────────────── */
const SCEN: { k: string; t: string; y: string; d: string; seed: number; regime: Regime; base: number; hex: string; bg: string; moments: { at: number; t: string; d: string }[] }[] = [
  {
    k: "halving", t: "Халвинг", y: "2024", d: "Награда майнерам уполовинена. Рынок входит в бычий цикл.",
    seed: 44, regime: "breakout", base: 60000, hex: "#FFC940", bg: "radial-gradient(600px 300px at 80% 0%, rgba(255,201,64,.16), transparent 60%)",
    moments: [
      { at: 20, t: "Затишье", d: "Волатильность на минимуме, все ждут" },
      { at: 95, t: "День X", d: "Блок с половинной наградой добыт" },
      { at: 140, t: "Разгон", d: "+35% за шесть недель" },
    ],
  },
  {
    k: "luna", t: "Крах LUNA", y: "2022", d: "Алгоритмический стейблкоин теряет привязку. Паника недели.",
    seed: 88, regime: "crash", base: 40000, hex: "#FF4D6D", bg: "radial-gradient(600px 300px at 20% 0%, rgba(255,77,109,.18), transparent 60%)",
    moments: [
      { at: 30, t: "Первые трещины", d: "UST отклоняется от $1" },
      { at: 95, t: "Спираль смерти", d: "−90% за 72 часа" },
      { at: 140, t: "Дно", d: "Рынок замирает, объёмы рекордные" },
    ],
  },
  {
    k: "etf", t: "Спот-ETF", y: "2024", d: "Одобрение биржевых фондов открывает двери институционалам.",
    seed: 120, regime: "trend-up", base: 42000, hex: "#3D9BFF", bg: "radial-gradient(600px 300px at 50% 0%, rgba(61,155,255,.18), transparent 60%)",
    moments: [
      { at: 25, t: "Слухи", d: "Заявки копятся, цена ползёт вверх" },
      { at: 100, t: "Одобрение", d: "Зелёная свеча недели" },
      { at: 145, t: "Притоки", d: "Миллиарды заходят в фонды" },
    ],
  },
  {
    k: "covid", t: "COVID-крах", y: "2020", d: "Чёрный четверг: всё падает одновременно. Затем V-разворот.",
    seed: 160, regime: "volatile", base: 8000, hex: "#9A6BFF", bg: "radial-gradient(600px 300px at 30% 100%, rgba(154,107,255,.18), transparent 60%)",
    moments: [
      { at: 30, t: "Тревога", d: "Рынки нервничают" },
      { at: 90, t: "Паника", d: "−50% за сутки" },
      { at: 140, t: "Отскок", d: "Покупатели возвращаются" },
    ],
  },
];

export function HistoryRoom() {
  const [s, setS] = useState(0);
  const [m, setM] = useState(1);
  const [tall, setTall] = useState(false);
  const sc = SCEN[s];
  const data = useMemo(() => genCandles(sc.seed, 170, sc.base, sc.regime, 1), [sc]);
  const mom = sc.moments[m];
  const range: [number, number] = [Math.max(0, mom.at - 10), Math.min(data.length - 1, mom.at + 10)];
  const chg = ((data[mom.at].c - data[0].c) / data[0].c) * 100;

  return (
    <div className="relative overflow-hidden rounded-3xl p-4 ring-1 ring-white/10 transition-all duration-700 sm:p-5" style={{ background: `${sc.bg}, linear-gradient(180deg,#0C1834,#081229)` }}>
      <div className="flex flex-wrap gap-2">
        {SCEN.map((x, k) => (
          <button key={x.k} onClick={() => { tap("tick"); setS(k); setM(1); sfx("whoosh"); }}
            className={cn("rounded-2xl border-2 px-3 py-2 text-left transition-all", s === k ? "bg-ink-800" : "bg-ink-900/40 hover:bg-ink-800/60")}
            style={s === k ? { borderColor: x.hex } : { borderColor: "transparent" }}>
            <div className="font-display text-[12px] font-black">{x.t} <span className="font-mono text-[10px] opacity-60">{x.y}</span></div>
            <div className="max-w-36 truncate text-[10px] text-ink-400">{x.d}</div>
          </button>
        ))}
        <button onClick={() => { tap("tick"); setTall(!tall); }} className={cn("ml-auto rounded-2xl px-3 py-2 text-[12px] font-bold", tall ? "bg-white text-ink-900" : "bg-ink-800 text-ink-300")}>
          {tall ? "Свернуть" : "Развернуть"}
        </button>
      </div>

      <div key={sc.k} className="mt-3 animate-fade">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-black" style={{ color: sc.hex }}>{sc.t} · {sc.y}</span>
          <span className={cn("ml-auto font-mono text-sm font-black", chg >= 0 ? "text-bull" : "text-bear")}>{chg >= 0 ? "+" : ""}{chg.toFixed(0)}% к моменту</span>
        </div>
        <div className="text-[12px] text-ink-300">{sc.d}</div>
        <div className="well relative mt-3 overflow-hidden p-1.5">
          <LabChart id="hist" data={data} height={tall ? 330 : 210} selectRange={range}
            highlight={useMemo(() => new Set([mom.at]), [mom.at])} />
        </div>
        <div className="relative mx-2 mt-2 h-2 rounded-full bg-ink-800">
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${(mom.at / data.length) * 100}%`, background: sc.hex }} />
          {sc.moments.map((x, k) => (
            <button key={x.t} onClick={() => { tap("tick"); setM(k); }} aria-label={x.t}
              className={cn("absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink-900 transition-all", m === k && "scale-125")}
              style={{ left: `${(x.at / data.length) * 100}%`, background: m === k ? "#fff" : sc.hex }} />
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {sc.moments.map((x, k) => (
            <button key={x.t} onClick={() => { tap("tick"); setM(k); }}
              className={cn("rounded-2xl p-3 text-left transition-all", m === k ? "bg-ink-800 ring-2" : "bg-ink-900/50 hover:bg-ink-800/60")}
              style={m === k ? ({ ["--tw-ring-color" as string]: sc.hex } as React.CSSProperties) : undefined}>
              <div className="font-mono text-[10px] text-ink-500">момент {k + 1} · #{x.at}</div>
              <div className="text-[12px] font-black">{x.t}</div>
              <div className="text-[11px] text-ink-400">{x.d}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500">
        <Label>Шкала времени · {data.length} свечей · {sc.t}</Label>
      </div>
    </div>
  );
}
