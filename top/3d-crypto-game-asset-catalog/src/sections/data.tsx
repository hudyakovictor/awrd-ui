import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { Label, Btn, Bar, Chip } from "../components/ui";
import { AvatarArt } from "../components/art";
import { tap, useInterval, fmt, sfx } from "../lib/fx";
import { cn } from "../utils/cn";

export function Sparkline({ data, up, w = 72, h = 28 }: { data: number[]; up: boolean; w?: number; h?: number }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  const c = up ? "#2BE38B" : "#FF4D6D";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={c} opacity=".12" />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* D01 — Watchlist */
const COINS = [
  { s: "BTC", n: "Bitcoin", p: 67412, c: "#F7931A" },
  { s: "ETH", n: "Ethereum", p: 3521, c: "#8C8CFF" },
  { s: "SOL", n: "Solana", p: 172.4, c: "#2BE3C8" },
  { s: "TON", n: "Toncoin", p: 6.82, c: "#3D9BFF" },
];
export function Watchlist() {
  const [rows, setRows] = useState(() => COINS.map((c) => ({ ...c, open: c.p, hist: Array.from({ length: 16 }, () => c.p * (1 + (Math.random() - 0.5) * 0.02)), dir: 0 })));
  const [fav, setFav] = useState<string[]>(["BTC"]);
  const [sel, setSel] = useState<string | null>(null);
  useInterval(() => {
    setRows((rs) => rs.map((r) => {
      if (Math.random() < 0.4) return { ...r, dir: 0 };
      const np = r.p * (1 + (Math.random() - 0.49) * 0.004);
      return { ...r, p: np, hist: [...r.hist.slice(1), np], dir: np > r.p ? 1 : -1 };
    }));
  }, 1100);
  return (
    <div className="panel-soft divide-y divide-white/5 overflow-hidden">
      {rows.map((r) => {
        const ch = ((r.p - r.open) / r.open) * 100 + (r.s === "SOL" ? 3.2 : r.s === "TON" ? -1.4 : 0.8);
        const up = ch >= 0;
        return (
          <div key={r.s} onClick={() => { tap("tick"); setSel(sel === r.s ? null : r.s); }}
            className={cn("group flex cursor-pointer items-center gap-3 px-3.5 py-3 transition-colors hover:bg-white/[.03]", sel === r.s && "bg-sky/10")}>
            <div className="relative flex size-10 items-center justify-center rounded-xl font-display text-[11px] font-black text-white shadow-[0_3px_0_rgba(0,0,0,.4),inset_0_2px_0_rgba(255,255,255,.3)]" style={{ background: r.c }}>{r.s[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="font-display text-xs font-bold">{r.s}<span className="ml-1.5 font-sans text-[11px] font-semibold text-ink-400">{r.n}</span></div>
              <div className="font-mono text-[10px] text-ink-400">Vol {fmt(r.p * 1234, 0)}</div>
            </div>
            <Sparkline data={r.hist} up={up} />
            <div className="w-24 text-right">
              <div className="rounded-md px-1 font-mono text-sm font-bold tabular-nums" key={r.p} style={{ animation: r.dir ? `${r.dir > 0 ? "tick" : "tickDown"} .8s ease-out` : undefined }}>
                {r.p > 100 ? fmt(r.p, 1) : fmt(r.p, 3)}
              </div>
              <div className={cn("font-mono text-[11px] font-bold", up ? "text-bull" : "text-bear")}>{up ? "+" : ""}{ch.toFixed(2)}%</div>
            </div>
            <button aria-label="fav" onClick={(e) => { e.stopPropagation(); tap("coin"); setFav((f) => (f.includes(r.s) ? f.filter((x) => x !== r.s) : [...f, r.s])); }}
              className={cn("transition-transform active:scale-75", fav.includes(r.s) ? "text-gold" : "text-ink-500 hover:text-ink-300")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={fav.includes(r.s) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={fav.includes(r.s) ? "animate-pop" : ""}><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" /></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* D02 — Cards */
export function Cards() {
  const [started, setStarted] = useState(false);
  const [liked, setLiked] = useState(false);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="panel group overflow-hidden transition-transform hover:-translate-y-1">
        <div className="relative h-28 overflow-hidden bg-gradient-to-br from-sky/40 via-violet/30 to-ink-800 grid-bg">
          <svg viewBox="0 0 200 80" className="absolute inset-x-0 bottom-0 h-20 w-full">
            {[20, 36, 28, 50, 44, 62, 55, 70].map((v, i) => (
              <g key={i} className="transition-transform duration-500 group-hover:-translate-y-1" style={{ transitionDelay: `${i * 40}ms` }}>
                <line x1={14 + i * 24} x2={14 + i * 24} y1={80 - v - 10} y2={80 - v + 22} stroke={i % 3 === 2 ? "#FF4D6D" : "#2BE38B"} strokeWidth="1.5" />
                <rect x={8 + i * 24} y={80 - v} width="12" height="16" rx="2" fill={i % 3 === 2 ? "#FF4D6D" : "#2BE38B"} />
              </g>
            ))}
          </svg>
          <Chip tone="gold" className="absolute left-3 top-3">Модуль 2</Chip>
          <button onClick={() => { tap("coin"); setLiked(!liked); }} className={cn("absolute right-3 top-3 flex size-8 items-center justify-center rounded-xl bg-ink-900/60 backdrop-blur", liked ? "text-bear" : "text-white")} aria-label="like">
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" className={liked ? "animate-pop" : ""}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" /></svg>
          </button>
        </div>
        <div className="p-4">
          <div className="font-display text-sm font-bold">Японские свечи</div>
          <div className="text-[12px] text-ink-300">6 уроков · 18 мин · +120 XP</div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold"><span className="text-ink-300">Прогресс</span><span className="text-bull">{started ? "67" : "50"}%</span></div>
          <Bar value={started ? 67 : 50} className="mt-1.5" h={10} />
          <Btn block s="sm" className="mt-4" icon={started ? "check" : "play"} v={started ? "ink" : "bull"} onClick={() => { setStarted(true); sfx("success"); }}>{started ? "Урок пройден" : "Продолжить"}</Btn>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel-soft flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#C9A8FF] to-violet text-white shadow-[0_4px_0_var(--color-violet-d)]"><Icon name="brain" size={24} /></div>
          <div className="flex-1"><div className="font-display text-xs font-bold">Психология сделок</div><div className="text-[11px] text-ink-400">Заблокировано до ур. 5</div></div>
          <Icon name="lock" size={18} className="text-ink-500" />
        </div>
        <div className="panel-soft p-4">
          <div className="flex items-center justify-between"><Label className="mb-0">Карточка статистики</Label><Chip tone="bull">+12%</Chip></div>
          <div className="mt-2 flex items-end justify-between">
            <div><div className="font-mono text-2xl font-bold">87%</div><div className="text-[11px] text-ink-400">точность ответов</div></div>
            <div className="flex h-12 items-end gap-1">{[40, 55, 48, 70, 62, 80, 87].map((v, i) => <div key={i} className={cn("w-3 rounded-t-md transition-all hover:bg-sky", i === 6 ? "bg-bull" : "bg-ink-600")} style={{ height: `${v}%` }} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* D03 — Badges & avatars */
export function BadgesAvatars() {
  const [status, setStatus] = useState(0);
  const st = [["bg-bull", "онлайн"], ["bg-gold", "в уроке"], ["bg-ink-400", "офлайн"]] as const;
  return (
    <div className="space-y-5">
      <div>
        <Label>Бейджи · редкость и статус</Label>
        <div className="flex flex-wrap gap-2">
          <Chip tone="bull">Новый</Chip><Chip tone="bear">Горячее</Chip><Chip tone="gold">Легенда</Chip><Chip tone="violet">Эпик</Chip><Chip tone="sky">Редкий</Chip><Chip>Обычный</Chip>
          <Chip tone="flame"><Icon name="flame" size={11} stroke={2.6} />x2 XP</Chip>
          <span className="relative inline-flex"><Chip tone="sky">Live</Chip><span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-bear"><span className="absolute inset-0 rounded-full bg-bear animate-ring" /></span></span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <Label>Аватар · уровень · статус</Label>
          <button onClick={() => { tap("tick"); setStatus((status + 1) % 3); }} className="relative">
            <div className="rounded-full p-[3px] bg-[conic-gradient(#2BE38B_0_72%,#1b305c_72%_100%)]">
              <div className="rounded-full border-[3px] border-ink-800"><AvatarArt seed={0} size={60} /></div>
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-lg bg-gold px-1.5 font-display text-[10px] font-black text-ink-900 shadow-[0_2px_0_var(--color-gold-d)]">12</span>
            <span className={cn("absolute right-0.5 top-1 size-4 rounded-full border-[3px] border-ink-800 transition-colors", st[status][0])} />
          </button>
          <div className="mt-2 text-[11px] text-ink-400">{st[status][1]} · тапни</div>
        </div>
        <div>
          <Label>Группа друзей</Label>
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((s) => <div key={s} className="rounded-full border-[3px] border-ink-800 transition-transform hover:z-10 hover:-translate-y-1.5"><AvatarArt seed={s} size={40} /></div>)}
            <div className="flex size-[46px] items-center justify-center rounded-full border-[3px] border-ink-800 bg-ink-700 font-display text-[11px] font-bold">+18</div>
          </div>
        </div>
        <div>
          <Label>Размеры</Label>
          <div className="flex items-end gap-2">{[24, 32, 40, 52].map((s, i) => <AvatarArt key={s} seed={i + 2} size={s} />)}</div>
        </div>
      </div>
    </div>
  );
}

/* D04 — Sortable table */
type Row = { pair: string; side: "Long" | "Short"; size: number; pnl: number; date: number };
const ROWS: Row[] = [
  { pair: "BTC/USDT", side: "Long", size: 1200, pnl: 184.2, date: 5 },
  { pair: "ETH/USDT", side: "Short", size: 800, pnl: -42.7, date: 4 },
  { pair: "SOL/USDT", side: "Long", size: 450, pnl: 61.3, date: 3 },
  { pair: "TON/USDT", side: "Short", size: 300, pnl: 12.9, date: 2 },
  { pair: "DOGE/USDT", side: "Long", size: 150, pnl: -88.1, date: 1 },
];
export function Table() {
  const [sort, setSort] = useState<{ k: keyof Row; dir: 1 | -1 }>({ k: "date", dir: -1 });
  const [filter, setFilter] = useState<"all" | "Long" | "Short">("all");
  const rows = useMemo(() => ROWS.filter((r) => filter === "all" || r.side === filter).sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * sort.dir), [sort, filter]);
  const H = ({ k, children, right }: { k: keyof Row; children: ReactNode; right?: boolean }) => (
    <button onClick={() => { tap("tick"); setSort((s) => ({ k, dir: s.k === k ? (s.dir === 1 ? -1 : 1) : -1 })); }} className={cn("flex items-center gap-1 hover:text-white", right && "justify-end", sort.k === k && "text-sky")}>
      {children}<Icon name={sort.k === k ? (sort.dir === 1 ? "chevU" : "chevD") : "sort"} size={12} stroke={2.6} />
    </button>
  );
  return (
    <div className="panel-soft overflow-hidden">
      <div className="grid grid-cols-[1.4fr_.9fr_1fr_1fr] gap-2 border-b border-white/5 bg-ink-850/60 px-4 py-3 text-[10px] font-extrabold uppercase tracking-wider text-ink-300">
        <H k="pair">Пара</H>
        <button onClick={() => { tap("tick"); setFilter(filter === "all" ? "Long" : filter === "Long" ? "Short" : "all"); }} className={cn("flex items-center gap-1 hover:text-white", filter !== "all" && "text-sky")}>
          {filter === "all" ? "Сторона" : filter}<Icon name="filter" size={12} />
        </button>
        <H k="size" right>Объём</H>
        <H k="pnl" right>PnL</H>
      </div>
      {rows.map((r) => (
        <div key={r.pair} className="grid grid-cols-[1.4fr_.9fr_1fr_1fr] items-center gap-2 border-b border-white/5 px-4 py-2.5 text-xs transition-colors last:border-0 hover:bg-white/[.03] animate-fade">
          <span className="font-display text-[11px] font-bold">{r.pair}</span>
          <span><Chip tone={r.side === "Long" ? "bull" : "bear"}>{r.side}</Chip></span>
          <span className="text-right font-mono tabular-nums">${r.size}</span>
          <span className={cn("text-right font-mono font-bold tabular-nums", r.pnl >= 0 ? "text-bull" : "text-bear")}>{r.pnl >= 0 ? "+" : ""}{r.pnl.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

/* D05 — Glossary tooltips */
const TERMS: Record<string, { d: string; tone: string }> = {
  "стоп-лосс": { d: "Приказ автоматически закрыть позицию при достижении уровня убытка.", tone: "text-bear" },
  "плечо": { d: "Множитель позиции. 10x = позиция в 10 раз больше депозита — и риск тоже.", tone: "text-gold" },
  "ликвидацией": { d: "Принудительное закрытие позиции биржей, когда маржи не хватает.", tone: "text-flame" },
  "волатильность": { d: "Насколько сильно и быстро меняется цена актива.", tone: "text-violet" },
};
export function Glossary() {
  const [open, setOpen] = useState<string | null>("плечо");
  const [learned, setLearned] = useState<string[]>([]);
  const term = (w: string) => (
    <span className="relative inline-block">
      <button onClick={() => { tap("tick"); setOpen(open === w ? null : w); }} onMouseEnter={() => setOpen(w)}
        className={cn("border-b-2 border-dashed font-bold transition-colors", TERMS[w].tone, open === w ? "border-current" : "border-current/40")}>{w}</button>
      {open === w && (
        <span className="absolute bottom-full left-1/2 z-20 mb-3 block w-60 -translate-x-1/2 rounded-2xl bg-white p-3 text-left text-ink-900 shadow-[0_4px_0_#8aa0d4,0_20px_30px_-10px_rgba(0,0,0,.6)] animate-pop">
          <span className="block font-display text-[11px] font-black uppercase">{w}</span>
          <span className="mt-1 block text-[12px] font-semibold leading-snug text-ink-600">{TERMS[w].d}</span>
          <button onClick={() => { sfx("success"); setLearned((l) => [...new Set([...l, w])]); setOpen(null); }} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-bull px-2 py-1 text-[10px] font-black uppercase text-ink-900 shadow-[0_2px_0_var(--color-bull-d)]">
            <Icon name="check" size={12} stroke={3} />Понял · +2 XP
          </button>
          <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-white" />
        </span>
      )}
    </span>
  );
  return (
    <div className="pt-24">
      <p className="text-[15px] font-semibold leading-8 text-ink-200">
        Используя {term("плечо")}, всегда ставь {term("стоп-лосс")}: при высокой {term("волатильность")} позиция может закончиться {term("ликвидацией")} за минуты.
      </p>
      <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-ink-400">
        <Icon name="book" size={14} /> Выучено терминов: <span className="text-bull">{learned.length}/4</span>
        <Bar value={learned.length * 25} h={8} className="ml-2 flex-1" />
      </div>
    </div>
  );
}
