import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip, Label, Segmented } from "../components/ui";
import { Mascot, FlameArt, type Mood } from "../components/art";
import { LogoMark, CalendarArt } from "../components/art2";
import { particles } from "../lib/particles";
import { useCountdown } from "../lib/gestures";
import { tap, sfx, haptic, useInterval, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════ W01 — Lock screen: push + widget ═══════════════ */
const PUSHES = [
  { t: "🔥 Стрик 27 дней под угрозой", d: "Один урок — и огонь горит. 3 минуты.", tone: "text-flame" },
  { t: "📈 BTC пробил $68 000", d: "Твой прогноз «вверх» сбылся! Забери +20 XP", tone: "text-bull" },
  { t: "🏆 Кира обогнала тебя в лиге", d: "Верни 3 место — до конца недели 2 дня", tone: "text-gold" },
  { t: "🐻 Бора вернулся", d: "Новый босс-уровень: «Медвежий капкан»", tone: "text-bear" },
];
export function LockScreen() {
  const [stack, setStack] = useState<number[]>([0]);
  const [exp, setExp] = useState<number | null>(null);
  const [price, setPrice] = useState(67412);
  const [now, setNow] = useState(new Date());
  useInterval(() => { setPrice((p) => p + (Math.random() - 0.48) * 40); setNow(new Date()); }, 2000);
  const push = () => { const n = (stack[stack.length - 1] ?? -1) + 1; setStack((s) => [...s.slice(-2), n % PUSHES.length]); sfx("coin"); haptic([15, 60, 15]); };
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="relative mx-auto h-[440px] w-[240px] overflow-hidden rounded-[34px] ring-4 ring-ink-700" style={{ background: "radial-gradient(120% 80% at 30% 0%, #3D5FB0 0%, #16285A 45%, #070F26 100%)" }}>
        <div className="mt-8 text-center">
          <div className="text-[11px] font-semibold text-white/80">{now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</div>
          <div className="font-display text-5xl font-black tracking-tight text-white/95 tabular-nums">{now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
        </div>
        <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/12 p-2.5 backdrop-blur-md ring-1 ring-white/15">
            <div className="flex items-center gap-1"><FlameArt size={18} /><span className="font-display text-lg font-black">27</span></div>
            <div className="text-[9px] font-bold text-white/70">стрик · урок сегодня</div>
            <div className="mt-1 h-1.5 rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-flame" /></div>
          </div>
          <div className="rounded-2xl bg-white/12 p-2.5 backdrop-blur-md ring-1 ring-white/15">
            <div className="text-[9px] font-bold text-white/70">BTC</div>
            <div className="font-mono text-sm font-bold tabular-nums">{Math.round(price).toLocaleString("ru-RU")}</div>
            <svg viewBox="0 0 60 16" className="mt-0.5 h-4 w-full"><polyline points="0,14 10,10 20,12 30,6 40,8 50,3 60,4" fill="none" stroke="var(--color-bull)" strokeWidth="2" /></svg>
          </div>
        </div>
        <div className="absolute inset-x-2.5 bottom-16 space-y-2">
          {stack.map((p, i) => (
            <button key={`${p}-${i}`} onClick={() => { tap(); setExp(exp === i ? null : i); }} className="block w-full rounded-2xl bg-white/14 p-2.5 text-left backdrop-blur-xl ring-1 ring-white/15 animate-slide-up" style={{ transform: `scale(${1 - (stack.length - 1 - i) * 0.03})`, opacity: 1 - (stack.length - 1 - i) * 0.2 }}>
              <div className="flex items-center gap-2"><LogoMark size={18} /><span className="text-[10px] font-bold text-white/80">TradeLingo</span><span className="ml-auto text-[9px] text-white/50">сейчас</span></div>
              <div className="mt-1 text-[11px] font-bold text-white">{PUSHES[p].t}</div>
              <div className={cn("text-[10px] text-white/75", exp !== i && "truncate")}>{PUSHES[p].d}</div>
              {exp === i && <div className="mt-2 grid grid-cols-2 gap-1.5"><span className="rounded-lg bg-white/15 py-1 text-center text-[10px] font-bold">Открыть урок</span><span className="rounded-lg bg-white/10 py-1 text-center text-[10px] font-bold text-white/70">Позже</span></div>}
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-16"><span className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur"><Icon name="bolt" size={16} /></span><span className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur"><Icon name="image" size={16} /></span></div>
      </div>
      <div>
        <Label>Пуши и виджет · удержание вне приложения</Label>
        <div className="space-y-2">
          {PUSHES.map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-ink-850 p-2.5">
              <span className={cn("mt-0.5 font-mono text-[10px] font-bold", p.tone)}>0{i + 1}</span>
              <div><div className="text-[12px] font-bold">{p.t}</div><div className="text-[11px] text-ink-400">{p.d}</div></div>
            </div>
          ))}
        </div>
        <Btn s="sm" v="sky" icon="bell" className="mt-3" onClick={push}>Прислать пуш</Btn>
        <div className="mt-2 text-[11px] text-ink-500">Правило: максимум 1 пуш в день, персональный повод, никакого давления в тоне.</div>
      </div>
    </div>
  );
}

/* ═══════════════ W02 — App icon variants + home screen ═══════════════ */
const ICONS: { k: string; t: string; bg: string; ring?: string; badge?: string }[] = [
  { k: "default", t: "Классика", bg: "linear-gradient(180deg,#4FA8FF,#1B4FB0)" },
  { k: "dark", t: "Ночь", bg: "linear-gradient(180deg,#1B305C,#050B1C)" },
  { k: "bull", t: "Бычий", bg: "linear-gradient(180deg,#6DF5B3,#12A25E)" },
  { k: "pro", t: "Pro", bg: "linear-gradient(180deg,#FFE58A,#E09200)", ring: "#fff", badge: "PRO" },
  { k: "ny", t: "Новый год", bg: "linear-gradient(180deg,#FF8FA3,#BF2345)", badge: "❄" },
  { k: "halloween", t: "Хэллоуин", bg: "linear-gradient(180deg,#FFB547,#5F35C9)", badge: "🎃" },
];
function AppIcon({ v, size = 60 }: { v: (typeof ICONS)[number]; size?: number }) {
  return (
    <div className="relative overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,.4)]" style={{ width: size, height: size, borderRadius: size * 0.26, background: v.bg, boxShadow: v.ring ? `inset 0 0 0 2px ${v.ring}66, 0 4px 10px rgba(0,0,0,.4)` : undefined }}>
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "scale(1.25) translateY(2%)" }}><LogoMark size={size} bare /></div>
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
      {v.badge && <span className="absolute bottom-0.5 right-0.5 rounded-md bg-ink-950/70 px-1 text-[8px] font-black text-white">{v.badge}</span>}
    </div>
  );
}
export function AppIcons() {
  const [sel, setSel] = useState("default");
  const [badge, setBadge] = useState(3);
  const v = ICONS.find((i) => i.k === sel)!;
  const others: [string, string][] = [["#34C759", "phone"], ["#0A84FF", "search"], ["#FF9F0A", "image"], ["#FF375F", "heart"], ["#5E5CE6", "settings"], ["#30B0C7", "map"], ["#8E8E93", "clock"]];
  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div>
        <Label>Альтернативные иконки · сезонные и Pro</Label>
        <div className="grid grid-cols-3 gap-3">
          {ICONS.map((i) => (
            <button key={i.k} onClick={() => { tap("tick"); setSel(i.k); }} className={cn("flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition-all", sel === i.k ? "bg-sky/15 ring-2 ring-sky" : "hover:bg-white/5")}>
              <AppIcon v={i} size={56} /><span className="text-[11px] font-bold">{i.t}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2"><span className="text-[12px] text-ink-400">Бейдж на иконке</span><Btn s="xs" v="ink" onClick={() => setBadge((b) => Math.max(0, b - 1))}>−</Btn><span className="w-4 text-center font-mono text-sm font-bold">{badge}</span><Btn s="xs" v="ink" onClick={() => setBadge((b) => b + 1)}>+</Btn></div>
      </div>
      <div className="mx-auto w-[210px] rounded-[30px] p-4 ring-4 ring-ink-700" style={{ background: "linear-gradient(160deg,#243d73,#0c1834 60%,#1b305c)" }}>
        <div className="grid grid-cols-4 gap-3">
          {others.slice(0, 5).map(([c, ic]) => <div key={c} className="flex flex-col items-center gap-1"><span className="flex size-10 items-center justify-center rounded-[11px] text-white" style={{ background: c }}><Icon name={ic as IconName} size={18} /></span><span className="h-1 w-6 rounded bg-white/20" /></div>)}
          <div className="relative flex flex-col items-center gap-1">
            <div key={sel} className="animate-zoom-in"><AppIcon v={v} size={40} /></div>
            {badge > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[10px] font-bold text-white animate-pop" key={badge}>{badge}</span>}
            <span className="text-[8px] font-semibold text-white/90">TradeLingo</span>
          </div>
          {others.slice(5).map(([c, ic]) => <div key={c} className="flex flex-col items-center gap-1"><span className="flex size-10 items-center justify-center rounded-[11px] text-white" style={{ background: c }}><Icon name={ic as IconName} size={18} /></span><span className="h-1 w-6 rounded bg-white/20" /></div>)}
        </div>
        <div className="mt-24 grid grid-cols-4 gap-3 rounded-2xl bg-white/10 p-2 backdrop-blur">{others.slice(0, 4).map(([c, ic]) => <span key={c} className="flex size-9 items-center justify-center rounded-[10px] text-white" style={{ background: c }}><Icon name={ic as IconName} size={16} /></span>)}</div>
      </div>
    </div>
  );
}

/* ═══════════════ W03 — Error / offline / maintenance states ═══════════════ */
type ES = "offline" | "server" | "maintenance" | "update";
const ERR: Record<ES, { mood: Mood; t: string; d: string; icon: IconName; cta: string; tone: "sky" | "bear" | "gold" | "violet" }> = {
  offline: { mood: "think", t: "Нет подключения", d: "Уроки из кэша доступны офлайн. Прогресс синхронизируется позже.", icon: "link", cta: "Повторить", tone: "sky" },
  server: { mood: "sad", t: "Что-то сломалось", d: "Наши трейдеры уже чинят сервер. Попробуй через минуту.", icon: "alert", cta: "Попробовать снова", tone: "bear" },
  maintenance: { mood: "idle", t: "Плановые работы", d: "Обновляем симулятор. Твой стрик заморожен автоматически.", icon: "settings", cta: "Напомнить", tone: "gold" },
  update: { mood: "hype", t: "Доступно обновление", d: "Новые боссы, лиги и тёмная тема графиков.", icon: "sparkles", cta: "Обновить", tone: "violet" },
};
export function ErrorStates() {
  const [s, setS] = useState<ES>("offline");
  const [attempt, setAttempt] = useState(0);
  const [wait, setWait] = useState(0);
  const [loading, setLoading] = useState(false);
  const cd = useCountdown(47 * 60000);
  useInterval(() => setWait((w) => Math.max(0, w - 1)), wait > 0 ? 1000 : null);
  const e = ERR[s];
  const retry = () => {
    setLoading(true);
    sfx("whoosh");
    setTimeout(() => {
      setLoading(false);
      if (attempt >= 2 || s === "update") { notify(s === "update" ? "Обновление загружено" : "Соединение восстановлено", "success"); sfx("success"); setAttempt(0); return; }
      const n = attempt + 1;
      setAttempt(n);
      setWait(Math.pow(2, n));
      sfx("error"); haptic(30);
    }, 900);
  };
  return (
    <div>
      <Segmented value={s} onChange={(v) => { setS(v); setAttempt(0); setWait(0); }} options={[{ v: "offline", label: "Офлайн" }, { v: "server", label: "500" }, { v: "maintenance", label: "Работы" }, { v: "update", label: "Апдейт" }]} />
      <div className="relative mt-4 overflow-hidden rounded-3xl well">
        {s === "offline" && <div className="flex items-center gap-2 bg-ink-700 px-4 py-2 text-[12px] font-bold"><span className="size-2 animate-pulse rounded-full bg-bear" />Офлайн-режим · 3 урока в кэше</div>}
        <div key={s} className="flex flex-col items-center px-6 py-6 text-center animate-zoom-in">
          <div className="relative">
            <Mascot size={110} mood={e.mood} />
            <span className={cn("absolute -right-2 top-2 flex size-10 items-center justify-center rounded-2xl text-white shadow-[0_3px_0_rgba(0,0,0,.35)]", { sky: "bg-sky", bear: "bg-bear", gold: "bg-gold text-ink-900", violet: "bg-violet" }[e.tone])}><Icon name={e.icon} size={20} stroke={2.6} className={s === "maintenance" ? "animate-spin-slow" : ""} /></span>
          </div>
          <div className="mt-2 font-display text-lg font-black">{e.t}</div>
          <div className="max-w-xs text-[12px] text-ink-400">{e.d}</div>
          {s === "maintenance" && <div className="mt-3 font-mono text-2xl font-bold tabular-nums text-gold">{cd.text}</div>}
          {s === "server" && <div className="mt-2 font-mono text-[10px] text-ink-600">код 500 · req a7f3-19c2</div>}
          <Btn s="md" v={e.tone} className="mt-4" loading={loading} disabled={wait > 0} icon={s === "update" ? "down" : "refresh"} onClick={retry}>{wait > 0 ? `Повтор через ${wait}с` : e.cta}</Btn>
          {attempt > 0 && <div className="mt-2 text-[11px] text-ink-500">Попытка {attempt} · экспоненциальная задержка {Math.pow(2, attempt)}с</div>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ W04 — Streak milestone celebration ═══════════════ */
export function Milestone() {
  const [n, setN] = useState(29);
  const [celebrate, setCelebrate] = useState(false);
  const [share, setShare] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!celebrate) return;
    sfx("levelup"); haptic([10, 30, 10, 30, 80]);
    const r = box.current?.getBoundingClientRect();
    if (r) {
      particles.burst(r.left + r.width / 2, r.top + r.height / 2, { kind: "flame", count: 40, speed: 380 });
      setTimeout(() => particles.burst(r.left + r.width / 2, r.top + 40, { count: 60, speed: 700 }), 300);
    }
  }, [celebrate]);
  return (
    <div ref={box} className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-flame/25 via-ink-850 to-ink-900 p-5 text-center">
      {celebrate && <div className="pointer-events-none absolute left-1/2 top-24 size-[520px] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full opacity-60" style={{ background: "repeating-conic-gradient(rgba(255,138,61,.28) 0 10deg, transparent 10deg 24deg)" }} />}
      <div className="relative">
        <div className="relative mx-auto w-fit">
          <div className={cn("absolute inset-0 rounded-full bg-flame/40 blur-3xl transition-opacity", celebrate ? "opacity-100" : "opacity-0")} />
          <FlameArt size={celebrate ? 130 : 96} className="relative animate-flicker transition-all duration-500" />
        </div>
        <div key={n} className="font-display text-6xl font-black text-flame drop-shadow-[0_5px_0_rgba(0,0,0,.4)] animate-pop">{n}</div>
        <div className="font-display text-sm font-black uppercase tracking-widest">{celebrate ? "дней подряд · легенда!" : "дней подряд"}</div>
        {celebrate ? (
          <div className="mt-3 animate-slide-up">
            <div className="flex justify-center gap-2"><Chip tone="gold">Значок «Месяц огня»</Chip><Chip tone="sky">+100 крист.</Chip></div>
            <div className="mt-4 flex justify-center gap-3">
              <Btn s="sm" v="flame" icon="share" onClick={() => setShare(true)}>Поделиться</Btn>
              <Btn s="sm" v="ghost" onClick={() => { setCelebrate(false); setN(29); setShare(false); }}>Сброс</Btn>
            </div>
          </div>
        ) : (
          <Btn s="md" v="flame" icon="flame" className="mt-4" onClick={() => { setN(30); setCelebrate(true); }}>Пройти урок дня</Btn>
        )}
        {share && (
          <div className="mx-auto mt-4 w-56 rounded-2xl bg-gradient-to-br from-flame to-bear p-3 text-left shadow-[0_6px_0_#7a1a2c] animate-zoom-in">
            <div className="flex items-center gap-2"><LogoMark size={22} /><span className="text-[10px] font-black uppercase">TradeLingo</span></div>
            <div className="mt-2 flex items-center gap-2"><CalendarArt size={40} day={30} /><div><div className="font-display text-lg font-black leading-none">30 дней</div><div className="text-[10px] text-white/80">учу трейдинг без пропусков</div></div></div>
            <div className="mt-2 text-[9px] text-white/70">Присоединяйся: tradelingo.app/alex</div>
          </div>
        )}
      </div>
      {!celebrate && <div className="relative mt-3 flex justify-center gap-1">{[7, 14, 30, 50, 100, 365].map((m) => <span key={m} className={cn("rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold", n >= m ? "bg-flame/20 text-flame" : m === 30 ? "bg-ink-700 text-white ring-1 ring-flame/50" : "bg-ink-850 text-ink-500")}>{m}</span>)}</div>}
    </div>
  );
}
