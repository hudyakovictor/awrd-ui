import { useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { AvatarArt, TrophyArt, ChestArt } from "../components/art";
import { LeagueBadge, TIERS, ReactionArt, type Tier } from "../components/art2";
import { useDrag } from "../lib/gestures";
import { particles } from "../lib/particles";
import { tap, sfx, haptic, notify, useCountUp } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════ S01 — Profile + activity heatmap ═══════════════ */
export function Profile() {
  const days = useMemo(() => Array.from({ length: 7 * 16 }, (_, i) => {
    const r = Math.sin(i * 12.9898) * 43758.5453;
    const v = r - Math.floor(r);
    return i > 7 * 16 - 4 ? 0 : v < 0.18 ? 0 : v < 0.45 ? 1 : v < 0.75 ? 2 : v < 0.92 ? 3 : 4;
  }), []);
  const [hover, setHover] = useState<number | null>(null);
  const [follow, setFollow] = useState(false);
  const xp = useCountUp(15420, 1200);
  const cols = ["bg-ink-850", "bg-bull/25", "bg-bull/50", "bg-bull/75", "bg-bull"];
  const stats: [IconName, string, string, string][] = [["flame", "27", "дней стрик", "text-flame"], ["bolt", Math.round(xp).toLocaleString("ru-RU"), "всего XP", "text-gold"], ["trophy", "Сапфир", "лига", "text-sky"], ["target", "87%", "точность", "text-bull"]];
  return (
    <div>
      <div className="relative -mx-1 overflow-hidden rounded-3xl bg-gradient-to-br from-sky/30 via-violet/20 to-ink-850 p-4">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="relative flex items-center gap-4">
          <div className="relative">
            <div className="rounded-full bg-[conic-gradient(var(--color-bull)_0_68%,#1b305c_68%)] p-1"><div className="rounded-full border-4 border-ink-850"><AvatarArt seed={0} size={72} /></div></div>
            <LeagueBadge tier="sapphire" size={34} className="absolute -bottom-2 -right-2" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-lg font-black">Алекс Волков</div>
            <div className="text-[12px] text-ink-300">@alex_hodl · с марта 2024</div>
            <div className="mt-1 flex gap-3 text-[11px] font-bold"><span><b className="text-white">128</b> <span className="text-ink-400">подписчиков</span></span><span><b className="text-white">94</b> <span className="text-ink-400">подписок</span></span></div>
          </div>
          <Btn s="sm" v={follow ? "ink" : "sky"} icon={follow ? "check" : "plus"} onClick={() => { setFollow(!follow); if (!follow) sfx("success"); }}>{follow ? "Вы друзья" : "Добавить"}</Btn>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map(([ic, v, t, c]) => (
          <div key={t} className="panel-soft flex items-center gap-2.5 p-3">
            <Icon name={ic} size={20} className={c} stroke={2.4} />
            <div className="min-w-0"><div className="truncate font-display text-sm font-black">{v}</div><div className="text-[10px] text-ink-400">{t}</div></div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between"><Label className="mb-2">Активность · 16 недель</Label><span className="font-mono text-[10px] text-ink-400">{hover !== null ? `${["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"][hover % 7]} · ${days[hover] * 12} XP` : "наведи на клетку"}</span></div>
        <div className="well overflow-x-auto p-3">
          <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ width: "max-content" }}>
            {days.map((d, i) => (
              <button key={i} aria-label={`день ${i}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => tap("tick")}
                className={cn("size-3.5 rounded-[4px] transition-transform hover:scale-150 hover:ring-2 hover:ring-white/60", cols[d], i === days.length - 4 && "ring-2 ring-sky")} />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-ink-400">меньше {cols.map((c) => <span key={c} className={cn("size-2.5 rounded-[3px]", c)} />)} больше</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ S02 — Friends feed with reactions ═══════════════ */
type RK = "fire" | "rocket" | "clap" | "diamond";
const FEED: { n: string; seed: number; t: string; ev: string; icon: IconName; tone: string; time: string; r: Record<RK, number> }[] = [
  { n: "Кира", seed: 1, t: "достигла лиги", ev: "Рубин", icon: "trophy", tone: "text-bear", time: "5 мин", r: { fire: 12, rocket: 4, clap: 8, diamond: 2 } },
  { n: "Макс Т.", seed: 2, t: "стрик", ev: "100 дней", icon: "flame", tone: "text-flame", time: "1 ч", r: { fire: 31, rocket: 2, clap: 14, diamond: 6 } },
  { n: "Дима", seed: 3, t: "закрыл сделку", ev: "+34% ROE", icon: "trendUp", tone: "text-bull", time: "3 ч", r: { fire: 5, rocket: 9, clap: 3, diamond: 1 } },
];
function FeedItem({ f }: { f: (typeof FEED)[number] }) {
  const [r, setR] = useState(f.r);
  const [mine, setMine] = useState<RK | null>(null);
  const [open, setOpen] = useState(false);
  const react = (k: RK, el: HTMLElement) => {
    setR((x) => ({ ...x, [k]: x[k] + (mine === k ? -1 : 1), ...(mine && mine !== k ? { [mine]: x[mine] - 1 } : {}) }));
    const on = mine !== k;
    setMine(on ? k : null);
    setOpen(false);
    if (on) {
      sfx("coin"); haptic(10);
      const colors = { fire: ["#FF8A3D", "#FFC940"], rocket: ["#DFE7FA", "#3D9BFF"], clap: ["#FFC940", "#fff"], diamond: ["#6FD6F0", "#fff"] }[k];
      particles.burstAt(el, { kind: "star", count: 10, speed: 240, colors, gravity: 300 });
    } else tap();
  };
  return (
    <div className="panel-soft p-3">
      <div className="flex items-center gap-3">
        <AvatarArt seed={f.seed} size={40} />
        <div className="min-w-0 flex-1 text-[13px]">
          <b>{f.n}</b> <span className="text-ink-300">{f.t}</span> <b className={f.tone}>{f.ev}</b>
          <div className="text-[10px] text-ink-500">{f.time} назад</div>
        </div>
        <span className={cn("flex size-10 items-center justify-center rounded-xl bg-ink-850", f.tone)}><Icon name={f.icon} size={20} stroke={2.4} /></span>
      </div>
      <div className="relative mt-3 flex items-center gap-1.5">
        {(Object.keys(r) as RK[]).filter((k) => r[k] > 0).map((k) => (
          <button key={k} onClick={(e) => react(k, e.currentTarget)} className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition-all", mine === k ? "bg-sky/20 text-sky ring-1 ring-sky/60" : "bg-ink-850 text-ink-300 hover:bg-ink-700")}>
            <ReactionArt kind={k} size={16} /><span className="tabular-nums">{r[k]}</span>
          </button>
        ))}
        <button onClick={() => { tap("tick"); setOpen(!open); }} className="ml-auto flex size-8 items-center justify-center rounded-full bg-ink-850 text-ink-300 hover:text-white" aria-label="реакция"><Icon name="plus" size={16} /></button>
        {open && (
          <div className="absolute bottom-full right-0 z-10 mb-2 flex gap-1 rounded-full bg-ink-700 p-1.5 shadow-[0_6px_0_#0a1430,0_20px_30px_rgba(0,0,0,.5)] animate-zoom-in">
            {(["fire", "rocket", "clap", "diamond"] as RK[]).map((k, i) => (
              <button key={k} onClick={(e) => react(k, e.currentTarget)} className="flex size-10 items-center justify-center rounded-full transition-transform hover:-translate-y-1.5 hover:scale-125 animate-pop" style={{ animationDelay: `${i * 40}ms` }}><ReactionArt kind={k} size={26} /></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export function FriendsFeed() {
  return <div className="space-y-3">{FEED.map((f) => <FeedItem key={f.n} f={f} />)}</div>;
}

/* ═══════════════ S03 — Notification center (swipe to dismiss) ═══════════════ */
type N = { id: number; icon: IconName; tone: string; t: string; d: string; time: string; unread: boolean; group: "Сегодня" | "Ранее" };
const NOTES: N[] = [
  { id: 1, icon: "flame", tone: "bg-flame/15 text-flame", t: "Стрик под угрозой!", d: "Осталось 3 часа, чтобы сохранить 27 дней", time: "сейчас", unread: true, group: "Сегодня" },
  { id: 2, icon: "trendUp", tone: "bg-bull/15 text-bull", t: "BTC +5.2% за час", d: "Твой прогноз «вверх» сбылся · +20 XP", time: "12 мин", unread: true, group: "Сегодня" },
  { id: 3, icon: "users", tone: "bg-sky/15 text-sky", t: "Кира обогнала тебя", d: "Ты опустился на 4 место в лиге", time: "1 ч", unread: true, group: "Сегодня" },
  { id: 4, icon: "gift", tone: "bg-gold/15 text-gold", t: "Сундук готов", d: "Забери награду за неделю", time: "вчера", unread: false, group: "Ранее" },
  { id: 5, icon: "shield", tone: "bg-violet/15 text-violet", t: "Новый урок: «Хеджирование»", d: "Модуль «Риск» · 6 минут", time: "2 дня", unread: false, group: "Ранее" },
];
function NoteRow({ n, onDismiss, onRead }: { n: N; onDismiss: () => void; onRead: () => void }) {
  const [x, setX] = useState(0);
  const [gone, setGone] = useState(false);
  const d = useDrag({
    threshold: 6,
    onMove: (i) => setX(Math.min(0, i.dx)),
    onEnd: (i) => {
      if (i.dx < -110 || i.vx < -800) { setX(-500); setGone(true); sfx("whoosh"); haptic(12); setTimeout(onDismiss, 250); }
      else setX(0);
    },
  });
  return (
    <div className={cn("grid transition-all duration-300", gone ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]")}>
      <div className="overflow-hidden">
        <div className="relative mb-2 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-bear pr-5 text-white" style={{ opacity: Math.min(1, -x / 100) }}>
            <Icon name="x" size={20} stroke={3} className={cn("transition-transform", x < -110 && "scale-125")} />
          </div>
          <div onPointerDown={d.onPointerDown} onClick={() => { if (Math.abs(x) < 4) onRead(); }} style={{ transform: `translateX(${x}px)`, transition: d.dragging ? "none" : "transform .3s cubic-bezier(.22,1,.36,1)", touchAction: "pan-y" }}
            className="relative flex cursor-grab items-center gap-3 bg-ink-750 p-3 active:cursor-grabbing">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", n.tone)}><Icon name={n.icon} size={20} stroke={2.4} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate text-[13px] font-bold">{n.t}</span>{n.unread && <span className="size-2 shrink-0 rounded-full bg-sky" />}</div>
              <div className="truncate text-[11px] text-ink-400">{n.d}</div>
            </div>
            <span className="shrink-0 text-[10px] text-ink-500">{n.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export function Notifications() {
  const [list, setList] = useState(NOTES);
  const unread = list.filter((n) => n.unread).length;
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="relative">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-ink-750 shadow-[0_3px_0_#0a1430]"><Icon name="bell" size={22} className={unread ? "animate-wiggle" : ""} /></span>
          {unread > 0 && <span key={unread} className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-bear text-[10px] font-black text-white shadow-[0_2px_0_var(--color-bear-d)] animate-pop">{unread}</span>}
        </div>
        <div className="flex-1"><div className="font-display text-sm font-black">Уведомления</div><div className="text-[11px] text-ink-400">Свайп влево — удалить · тап — прочитать</div></div>
        <Btn s="xs" v="ghost" disabled={!unread} onClick={() => { setList((l) => l.map((n) => ({ ...n, unread: false }))); sfx("success"); }}>Прочитать все</Btn>
      </div>
      {(["Сегодня", "Ранее"] as const).map((g) => {
        const items = list.filter((n) => n.group === g);
        if (!items.length) return null;
        return (
          <div key={g}>
            <Label className="mt-2">{g}</Label>
            {items.map((n) => <NoteRow key={n.id} n={n} onDismiss={() => setList((l) => l.filter((x) => x.id !== n.id))} onRead={() => { tap("tick"); setList((l) => l.map((x) => (x.id === n.id ? { ...x, unread: false } : x))); }} />)}
          </div>
        );
      })}
      {!list.length && (
        <div className="flex flex-col items-center py-8 text-center animate-zoom-in">
          <Icon name="inbox" size={40} className="text-ink-500" />
          <div className="mt-2 font-display text-sm font-bold">Всё прочитано</div>
          <Btn s="xs" v="ghost" className="mt-3" icon="refresh" onClick={() => setList(NOTES)}>Вернуть</Btn>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ S04 — League results: podium + promotion ═══════════════ */
export function LeagueResult() {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [tier, setTier] = useState<Tier>("sapphire");
  const box = useRef<HTMLDivElement>(null);
  const idx = TIERS.findIndex((t) => t.k === tier);
  const next = TIERS[Math.min(TIERS.length - 1, idx + 1)];
  const run = () => {
    setStage(1);
    sfx("whoosh");
    setTimeout(() => { setStage(2); setTier(next.k); sfx("levelup"); haptic([10, 30, 10, 30, 80]); particles.burstAt(box.current, { count: 60, speed: 640 }); }, 1600);
  };
  const podium = [{ seed: 1, n: "Кира", xp: 2140, h: 80, place: 2 }, { seed: 0, n: "Вы", xp: 2380, h: 110, place: 1 }, { seed: 3, n: "Дима", xp: 1980, h: 60, place: 3 }];
  return (
    <div ref={box} className="text-center">
      {stage < 2 ? (
        <>
          <div className="font-display text-base font-black">Неделя завершена!</div>
          <div className="text-[12px] text-ink-400">{TIERS[idx].name} · итоги</div>
          <div className="mt-4 flex items-end justify-center gap-2">
            {podium.map((p, i) => (
              <div key={p.n} className="flex w-24 flex-col items-center">
                <div className={cn("relative mb-2", stage >= 1 && "animate-pop")} style={{ animationDelay: `${600 + i * 200}ms` }}>
                  {p.place === 1 && <Icon name="crown" size={22} className="absolute -top-5 left-1/2 -translate-x-1/2 text-gold" />}
                  <div className={cn("rounded-full border-4", p.place === 1 ? "border-gold" : p.place === 2 ? "border-ink-200" : "border-flame")}><AvatarArt seed={p.seed} size={p.place === 1 ? 56 : 44} /></div>
                </div>
                <div className={cn("text-[12px] font-bold", p.n === "Вы" && "text-sky")}>{p.n}</div>
                <div className="font-mono text-[10px] text-ink-400">{p.xp} XP</div>
                <div className={cn("mt-1 flex w-full origin-bottom items-start justify-center rounded-t-2xl pt-2 font-display text-2xl font-black",
                  p.place === 1 ? "bg-gradient-to-b from-gold to-gold-d text-ink-900" : p.place === 2 ? "bg-gradient-to-b from-ink-200 to-ink-400 text-ink-900" : "bg-gradient-to-b from-flame to-flame-d text-white")}
                  style={{ height: p.h, animation: stage >= 1 ? `podium .6s cubic-bezier(.34,1.56,.64,1) ${i * 150}ms both` : undefined, transform: stage >= 1 ? undefined : "scaleY(.15)" }}>
                  {p.place}
                </div>
              </div>
            ))}
          </div>
          <Btn s="md" v="gold" className="mt-5" icon="trophy" disabled={stage === 1} onClick={run}>{stage === 0 ? "Показать итоги" : "Подсчёт…"}</Btn>
        </>
      ) : (
        <div className="animate-zoom-in">
          <div className="text-[10px] font-black uppercase tracking-[.2em] text-bull">Повышение!</div>
          <div className="relative mx-auto mt-2 flex w-fit items-center gap-4">
            <LeagueBadge tier={TIERS[Math.max(0, idx - 1)].k} size={60} className="opacity-50 grayscale" />
            <Icon name="chevR" size={24} stroke={3} className="text-ink-400" />
            <div className="relative"><div className="absolute inset-0 rounded-full blur-2xl" style={{ background: next.c[1] + "88" }} /><LeagueBadge tier={tier} size={120} className="relative animate-logo-in" /></div>
          </div>
          <div className="mt-2 font-display text-xl font-black" style={{ color: TIERS[idx].c[1] }}>Лига «{TIERS[idx].name}»</div>
          <div className="text-[12px] text-ink-400">Ты занял 1 место из 30</div>
          <div className="mt-3 flex justify-center gap-2"><Chip tone="gold">+500 монет</Chip><Chip tone="sky">+50 крист.</Chip></div>
          <Btn s="sm" v="ghost" className="mt-4" icon="refresh" onClick={() => setStage(0)}>Следующая неделя</Btn>
        </div>
      )}
      <div className="mt-5 flex justify-center gap-1.5">
        {TIERS.map((t, i) => <div key={t.k} className={cn("transition-all", i === idx ? "scale-110" : "opacity-60")} title={t.name}><LeagueBadge tier={t.k} size={30} locked={i > idx} /></div>)}
      </div>
    </div>
  );
}

/* ═══════════════ S05 — Co-op friend quest ═══════════════ */
export function FriendQuest() {
  const [me, setMe] = useState(140);
  const [fr, setFr] = useState(95);
  const [nudged, setNudged] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const goal = 400;
  const total = me + fr;
  const done = total >= goal;
  const chest = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div className="flex items-center gap-3">
        <TrophyArt size={40} />
        <div className="flex-1"><div className="font-display text-sm font-black">Квест с другом</div><div className="text-[11px] text-ink-400">Наберите {goal} XP вместе · 3 дня</div></div>
        <div ref={chest} className={cn(done && !claimed && "animate-wiggle")}><ChestArt size={56} open={claimed} tier="violet" /></div>
      </div>
      <div className="well relative mt-4 h-8 overflow-hidden rounded-full">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-d to-sky transition-all duration-700" style={{ width: `${Math.min(100, (me / goal) * 100)}%` }} />
        <div className="absolute inset-y-0 bg-gradient-to-r from-violet-d to-violet transition-all duration-700" style={{ left: `${Math.min(100, (me / goal) * 100)}%`, width: `${Math.min(100 - (me / goal) * 100, (fr / goal) * 100)}%` }} />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold drop-shadow">{Math.min(total, goal)}/{goal} XP</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[{ n: "Вы", seed: 0, v: me, c: "text-sky" }, { n: "Кира", seed: 1, v: fr, c: "text-violet" }].map((p) => (
          <div key={p.n} className="panel-soft flex items-center gap-2.5 p-2.5">
            <AvatarArt seed={p.seed} size={36} />
            <div className="flex-1"><div className="text-[12px] font-bold">{p.n}</div><div className={cn("font-mono text-[11px] font-bold", p.c)}>{p.v} XP</div></div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3">
        {done ? (
          <Btn block v="violet" icon={claimed ? "check" : "gift"} disabled={claimed} onClick={() => { setClaimed(true); sfx("open"); haptic([10, 30, 60]); particles.burstAt(chest.current, { count: 40 }); }}>{claimed ? "Награда получена" : "Открыть сундук"}</Btn>
        ) : (
          <>
            <Btn s="sm" v="sky" className="flex-1" icon="bolt" onClick={() => { setMe((v) => v + 40); sfx("coin"); }}>+40 XP</Btn>
            <Btn s="sm" v={nudged ? "ink" : "violet"} className="flex-1" icon="hand" disabled={nudged} onClick={() => { setNudged(true); sfx("whoosh"); notify("Кира получила пинок 👊", "info"); setTimeout(() => setFr((v) => v + 60), 1400); }}>{nudged ? "Отправлено" : "Пнуть Киру"}</Btn>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════ S06 — Referral / invite ═══════════════ */
export function Invite() {
  const [invited, setInvited] = useState(1);
  const [copied, setCopied] = useState(false);
  const [sheet, setSheet] = useState(false);
  const code = "BULL-MAX-7K2";
  const tiers = [{ n: 1, r: "7 дней Pro" }, { n: 3, r: "Скин «Неон»" }, { n: 5, r: "Месяц Pro" }];
  return (
    <div className="relative">
      <div className="text-center">
        <div className="flex justify-center -space-x-3">{[1, 2, 3].map((s) => <div key={s} className="rounded-full border-4 border-ink-800"><AvatarArt seed={s + 1} size={44} /></div>)}</div>
        <div className="mt-2 font-display text-base font-black">Пригласи друзей — учитесь вместе</div>
        <div className="text-[12px] text-ink-400">Друг получает 500 кристаллов, ты — награды ниже</div>
      </div>
      <div className="well mt-4 flex items-center gap-2 p-1.5 pl-4">
        <span className="flex-1 font-mono text-base font-bold tracking-widest">{code}</span>
        <Btn s="sm" v={copied ? "bull" : "ink"} icon={copied ? "check" : "copy"} onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); sfx("coin"); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Скопировано" : "Копировать"}</Btn>
      </div>
      <div className="relative mt-5 px-2">
        <div className="absolute left-6 right-6 top-4 h-1.5 rounded-full bg-ink-800" />
        <div className="absolute left-6 top-4 h-1.5 rounded-full bg-bull transition-all duration-500" style={{ width: `calc(${Math.min(1, (invited - 1) / 4) * 100}% - ${Math.min(1, (invited - 1) / 4) * 48}px)` }} />
        <div className="relative flex justify-between">
          {tiers.map((t) => (
            <div key={t.n} className="flex w-20 flex-col items-center text-center">
              <span className={cn("flex size-9 items-center justify-center rounded-full font-display text-xs font-black", invited >= t.n ? "bg-bull text-ink-900 shadow-[0_3px_0_var(--color-bull-d)]" : "bg-ink-750 text-ink-400 shadow-[0_3px_0_#0a1430]")}>{invited >= t.n ? <Icon name="check" size={16} stroke={3} /> : t.n}</span>
              <span className="mt-1.5 text-[10px] font-bold leading-tight text-ink-300">{t.r}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <Btn block v="sky" icon="share" onClick={() => { setSheet(true); sfx("whoosh"); }}>Поделиться</Btn>
        <Btn s="md" v="ghost" onClick={() => { setInvited((v) => Math.min(5, v + 1)); sfx("success"); }}>+1 друг</Btn>
      </div>
      {sheet && (
        <div className="absolute inset-0 z-20 flex items-end rounded-2xl bg-ink-950/60 backdrop-blur-sm animate-fade" onClick={() => setSheet(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl bg-ink-700 p-4 animate-screen-up">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-400" />
            <div className="grid grid-cols-4 gap-3">
              {([["Telegram", "#2AABEE"], ["WhatsApp", "#25D366"], ["VK", "#0077FF"], ["Ещё", "#30508F"]] as const).map(([n, c]) => (
                <button key={n} onClick={() => { tap(); setSheet(false); notify(`Ссылка отправлена в ${n}`, "success"); }} className="flex flex-col items-center gap-1.5">
                  <span className="flex size-12 items-center justify-center rounded-2xl text-white shadow-[0_3px_0_rgba(0,0,0,.35)]" style={{ background: c }}><Icon name={n === "Ещё" ? "dots" : "share"} size={20} /></span>
                  <span className="text-[10px] font-bold">{n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
