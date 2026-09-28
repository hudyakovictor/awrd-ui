import { useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Bar } from "../components/ui";
import { Mascot, CoinArt, GemArt } from "../components/art";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { particles } from "../lib/particles";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   O05–O06 — Роадмап сезона и чек-лист новичка.
   ═══════════════════════════════════════════════════════════════════ */

/* ── O05 · Роадмап с голосованием ── */
type Item = { t: string; d: string; v: number; mine: boolean; quarter: string; hex: string };
const ROAD: Item[] = [
  { t: "PvP-дуэли в реальном времени", d: "Сразись с другом: кто точнее за 10 вопросов", v: 1842, mine: false, quarter: "Q4", hex: "#FF4D6D" },
  { t: "Опционы для новичков", d: "Новый модуль: коллы, путы и стратегии", v: 1507, mine: false, quarter: "Q4", hex: "#3D9BFF" },
  { t: "Кланы и войны кланов", d: "Общая казна, рейды на боссов, рейтинг", v: 1290, mine: false, quarter: "Q1", hex: "#9A6BFF" },
  { t: "Торговля голосом", d: "«Макс, купи биток на сотку» — и готово", v: 864, mine: false, quarter: "Q1", hex: "#2BE38B" },
  { t: "NFT-значки сезона", d: "Достижения как коллекционные предметы", v: 642, mine: false, quarter: "Q2", hex: "#FFC940" },
];

export function Roadmap() {
  const [items, setItems] = useState(ROAD);
  const [votes, setVotes] = useState(3);
  const total = items.reduce((a, b) => a + b.v, 0);
  const vote = (i: number, el: HTMLElement) => {
    const it = items[i];
    if (it.mine) {
      setItems((a) => a.map((x, j) => (j === i ? { ...x, v: x.v - 1, mine: false } : x)));
      setVotes((v) => v + 1);
      tap("tick");
      return;
    }
    if (votes <= 0) { sfx("error"); notify("Голоса кончились — убери старый голос", "warn"); return; }
    setItems((a) => a.map((x, j) => (j === i ? { ...x, v: x.v + 1, mine: true } : x)));
    setVotes((v) => v - 1);
    sfx("success"); haptic(12);
    particles.burstAt(el, { kind: "star", count: 10, speed: 240, colors: [it.hex, "#fff"] });
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Chip tone="sky">Голосование сезона</Chip>
        <span className="ml-auto text-[12px] font-bold text-ink-300">Осталось голосов: <b className="text-gold">{votes}</b></span>
      </div>
      <div className="space-y-2.5">
        {items.map((it, i) => (
          <div key={it.t} className={cn("panel-soft p-3 transition-all", it.mine && "ring-2 ring-sky/60")}>
            <div className="flex items-center gap-3">
              <span className="rounded-lg px-2 py-1 font-mono text-[10px] font-black" style={{ background: `${it.hex}22`, color: it.hex }}>{it.quarter}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold">{it.t}</div>
                <div className="truncate text-[11px] text-ink-400">{it.d}</div>
              </div>
              <button
                onClick={(e) => vote(i, e.currentTarget)}
                className={cn("flex min-w-16 flex-col items-center rounded-xl px-2.5 py-1.5 transition-all active:scale-90", it.mine ? "text-ink-900" : "bg-ink-800 text-ink-200 hover:bg-ink-700")}
                style={it.mine ? { background: it.hex, boxShadow: "0 3px 0 rgba(0,0,0,.35)" } : undefined}
                aria-label={`Голосовать за ${it.t}`}
              >
                <Icon name="up" size={14} stroke={3} />
                <span key={it.v} className="font-mono text-[12px] font-black tabular-nums animate-pop">{it.v.toLocaleString("ru-RU")}</span>
              </button>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-900">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(it.v / total) * 100}%`, background: it.hex }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-ink-500">Топ-2 идеи попадут в следующий сезон · итоги через 12 дней</div>
    </div>
  );
}

/* ── O06 · Чек-лист первых шагов ── */
const STEPS = [
  { t: "Пройди первый урок", d: "4 минуты · +15 XP", icon: "book" as const, r: "+15 XP" },
  { t: "Открой демо-сделку", d: "Без риска · +25 XP", icon: "candle" as const, r: "+25 XP" },
  { t: "Зажги стрик", d: "Урок 2 дня подряд", icon: "flame" as const, r: "+30 XP" },
  { t: "Вступи в лигу", d: "Автоматически после 3 уроков", icon: "trophy" as const, r: "+20 XP" },
  { t: "Пригласи друга", d: "+500 кристаллов обоим", icon: "users" as const, r: "+500 ◆" },
];

export function Checklist() {
  const [done, setDone] = useState<boolean[]>([true, true, false, false, false]);
  const [celebrated, setCelebrated] = useState(false);
  const n = done.filter(Boolean).length;
  const all = n === STEPS.length;
  const toggle = (i: number, el: HTMLElement) => {
    const nd = done.map((v, j) => (j === i ? !v : v));
    setDone(nd);
    if (!done[i]) {
      sfx("success"); haptic(12);
      particles.burstAt(el, { kind: "star", count: 12, speed: 280, colors: ["#2BE38B", "#fff"] });
      if (nd.every(Boolean) && !celebrated) {
        setCelebrated(true);
        setTimeout(() => { sfx("levelup"); particles.burst(window.innerWidth / 2, window.innerHeight / 2, { count: 70, speed: 700 }); }, 350);
      }
    } else tap("tick");
  };
  const R = 30, C = 2 * Math.PI * R;
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col items-center">
        <div className="relative size-32">
          <svg viewBox="0 0 80 80" className="size-full -rotate-90">
            <circle cx="40" cy="40" r={R} fill="none" stroke="#081229" strokeWidth="10" />
            <circle cx="40" cy="40" r={R} fill="none" stroke="url(#cl)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - n / STEPS.length)} style={{ transition: "stroke-dashoffset .7s cubic-bezier(.22,1,.36,1)" }} />
            <defs><linearGradient id="cl"><stop offset="0" stopColor="#2BE38B" /><stop offset="1" stopColor="#3D9BFF" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span key={n} className="font-display text-2xl font-black animate-pop">{n}/{STEPS.length}</span>
            <Mascot size={30} mood={all ? "hype" : n >= 3 ? "happy" : "idle"} />
          </div>
        </div>
        {all && <Chip tone="gold" className="mt-2 animate-pop">+100 XP бонус!</Chip>}
      </div>
      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <button key={s.t} onClick={(e) => toggle(i, e.currentTarget)} className={cn("flex w-full items-center gap-3 rounded-2xl border-2 p-2.5 text-left transition-all", done[i] ? "border-bull/50 bg-bull/8" : "border-transparent bg-ink-850 hover:bg-ink-800")}>
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl transition-all", done[i] ? "bg-bull text-ink-900" : "bg-ink-800 text-ink-300")}>
              {done[i] ? <Icon name="check" size={18} stroke={3.2} className="animate-pop" /> : <Icon name={s.icon} size={18} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate text-[13px] font-bold", done[i] && "line-through opacity-60")}>{s.t}</span>
              <span className="block text-[11px] text-ink-400">{s.d}</span>
            </span>
            <span className={cn("flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] font-bold", done[i] ? "bg-bull/15 text-bull" : "bg-ink-800 text-ink-300")}>
              {s.r.includes("◆") ? <GemArt size={12} /> : <CoinArt size={14} />}{s.r}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Бонус: полоса прогресса сезона для шапок ── */
export function SeasonStrip() {
  const [xp, setXp] = useState(62);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet/25 to-sky/10 p-3 ring-1 ring-violet/30">
      <span className="text-[12px] font-bold">Сезон 3</span>
      <div className="flex-1"><Bar value={xp} tone="violet" h={12} /></div>
      <span className="font-mono text-[11px] text-ink-300">{xp}%</span>
      <Btn s="xs" v="violet" onClick={() => { setXp((v) => Math.min(100, v + 9)); sfx("coin"); }}>+9%</Btn>
    </div>
  );
}
