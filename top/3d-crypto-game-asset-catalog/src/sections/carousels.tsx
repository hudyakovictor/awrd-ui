import { useState } from "react";
import { Carousel } from "../components/Carousel";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { Mascot, CoinArt, GemArt, FlameArt, TrophyArt, ChestArt, AvatarArt } from "../components/art";
import { LeagueBadge, type Tier, BearRival, RocketArt, TicketArt } from "../components/art2";
import { sfx, haptic, notify, tap } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   Q — КАРУСЕЛИ. Один движок <Carousel>, 7 вариантов анимации.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Q01 · Hero-промо: fade + автоплей + прогресс ── */
const HERO_SLIDES = [
  {
    tag: "Сезон 3", tagTone: "gold" as const, title: "Бычий забег начался",
    sub: "Новый сезонный пропуск: 8 уровней наград, легендарный сундук в финале.",
    cta: "Смотреть пропуск", bg: "from-gold/30 via-ink-800 to-ink-900", ring: "ring-gold/30",
    art: <ChestArt size={120} tier="gold" className="animate-float" />,
  },
  {
    tag: "Новое", tagTone: "sky" as const, title: "Дуэль с Медведем Борой",
    sub: "Отвечай на вопросы быстрее таймера — каждый верный ответ это удар.",
    cta: "В бой", bg: "from-bear/25 via-ink-800 to-ink-900", ring: "ring-bear/30",
    art: <BearRival size={120} mood="angry" className="animate-bob" />,
  },
  {
    tag: "x2 XP", tagTone: "violet" as const, title: "Выходные двойного опыта",
    sub: "Каждый урок до понедельника даёт вдвое больше опыта и монет.",
    cta: "Играть", bg: "from-violet/30 via-ink-800 to-ink-900", ring: "ring-violet/30",
    art: <TicketArt size={110} label="x2" />,
  },
  {
    tag: "Лига", tagTone: "bull" as const, title: "Сапфир ждёт тебя",
    sub: "До зоны повышения не хватает 120 XP. Два урока — и ты в топ-3.",
    cta: "К лиге", bg: "from-bull/20 via-ink-800 to-ink-900", ring: "ring-bull/30",
    art: <LeagueBadge tier="sapphire" size={110} />,
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  return (
    <div>
      <Carousel variant="fade" autoplay autoplayMs={5000} counter progress dots arrows={false}
        label="Промо" onChange={setI} height={265} className="rounded-3xl">
        {HERO_SLIDES.map((s, k) => (
          <div key={s.title} className={cn("relative flex h-full items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br p-6 ring-1 sm:p-8", s.bg, s.ring)}>
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className={cn("relative min-w-0 flex-1", k === i && "[&>*]:animate-slide-up")}>
              <Chip tone={s.tagTone}>{s.tag}</Chip>
              <div className="mt-2 font-display text-xl font-black leading-tight sm:text-2xl" style={{ animationDelay: ".05s" }}>{s.title}</div>
              <div className="mt-1 text-[13px] text-ink-300" style={{ animationDelay: ".12s" }}>{s.sub}</div>
              <div style={{ animationDelay: ".2s" }}>
                <Btn s="sm" v={k === 1 ? "bear" : k === 2 ? "violet" : k === 3 ? "bull" : "gold"} className="mt-4"
                  onClick={() => notify(`«${s.cta}» — демо-переход`, "info")}>{s.cta}</Btn>
              </div>
            </div>
            <div className="relative hidden shrink-0 sm:block">{s.art}</div>
          </div>
        ))}
      </Carousel>
      <div className="mt-2 text-center text-[11px] text-ink-500">Автоплей 5с · пауза при наведении · свайп и стрелки ← →</div>
    </div>
  );
}

/* ── Q02 · Coverflow карт навыков ── */
const FLOW = [
  { t: "Стоп-лосс", r: "Обычная", c: "#4d69a8", icon: "shield" as IconName, pow: 3, d: "Ограничивает убыток позиции" },
  { t: "Объём", r: "Редкая", c: "#3D9BFF", icon: "chart" as IconName, pow: 5, d: "+1 подсказка в уроке" },
  { t: "Холодная голова", r: "Эпик", c: "#9A6BFF", icon: "brain" as IconName, pow: 7, d: "Иммунитет к FOMO · 3 хода" },
  { t: "Глаз кита", r: "Легенда", c: "#FFC940", icon: "eye" as IconName, pow: 9, d: "Видит крупных игроков" },
  { t: "Дисциплина", r: "Редкая", c: "#2BE38B", icon: "target" as IconName, pow: 6, d: "+10% XP за серию" },
];

export function CoverflowCards() {
  const [i, setI] = useState(2);
  return (
    <div>
      <Carousel variant="coverflow" onChange={setI} dots={false} counter label="Карты навыков" height={300} className="rounded-3xl">
        {FLOW.map((c) => (
          <div key={c.t} className="mx-auto flex h-full max-w-[240px] flex-col items-center justify-center rounded-3xl p-[3px]"
            style={{ background: `linear-gradient(160deg, ${c.c}, #081229)`, boxShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
            <div className="flex h-full w-full flex-col items-center rounded-[21px] bg-ink-900/95 p-4 text-center">
              <span className="rounded-md px-2 py-0.5 font-display text-[9px] font-black uppercase" style={{ background: c.c, color: "#081229" }}>{c.r}</span>
              <span className="mt-3 flex size-16 items-center justify-center rounded-2xl" style={{ background: `${c.c}22`, boxShadow: `inset 0 0 0 2px ${c.c}55` }}>
                <Icon name={c.icon} size={32} style={{ color: c.c }} />
              </span>
              <div className="mt-3 font-display text-sm font-black">{c.t}</div>
              <div className="text-[11px] text-ink-400">{c.d}</div>
              <div className="mt-2 flex gap-1">{Array.from({ length: c.pow }).map((_, k) => <span key={k} className="size-1.5 rounded-full" style={{ background: c.c }} />)}</div>
            </div>
          </div>
        ))}
      </Carousel>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Btn s="xs" v="ink" onClick={() => setI((v) => (v + FLOW.length - 1) % FLOW.length)}>←</Btn>
        <span className="min-w-40 text-center text-[12px] font-bold">{FLOW[i].t} · <span className="text-ink-400">{FLOW[i].r}</span></span>
        <Btn s="xs" v="ink" onClick={() => setI((v) => (v + 1) % FLOW.length)}>→</Btn>
      </div>
    </div>
  );
}

/* ── Q03 · 3D-куб фич ── */
const CUBE: { t: string; d: string; icon: IconName; hex: string }[] = [
  { t: "Учись по 5 минут", d: "Короткие уроки в стиле Duolingo: квизы, свайпы, прогнозы.", icon: "book", hex: "#3D9BFF" },
  { t: "Торгуй без риска", d: "Демо-симулятор с живым графиком, плечом и стаканом.", icon: "candle", hex: "#2BE38B" },
  { t: "Побеждай боссов", d: "FOMO, Бумажные Руки и Кит Ликвидации ждут.", icon: "sword", hex: "#FF4D6D" },
  { t: "Забирай награды", d: "Сундуки, стрики, лиги и сезонный пропуск.", icon: "gift", hex: "#FFC940" },
];

export function CubeShowcase() {
  const [i, setI] = useState(0);
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <Carousel variant="cube" onChange={setI} dots={false} arrows={false} counter={false} label="Фичи" height={240} className="rounded-3xl">
        {CUBE.map((f) => (
          <div key={f.t} className="flex h-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-ink-700 to-ink-850 p-6 text-center ring-1 ring-white/10">
            <span className="flex size-16 items-center justify-center rounded-3xl text-ink-900" style={{ background: f.hex, boxShadow: "0 5px 0 rgba(0,0,0,.4), inset 0 2px 0 rgba(255,255,255,.4)" }}>
              <Icon name={f.icon} size={30} stroke={2.4} />
            </span>
            <div className="mt-3 font-display text-base font-black">{f.t}</div>
            <div className="mt-1 max-w-xs text-[12px] text-ink-300">{f.d}</div>
          </div>
        ))}
      </Carousel>
      <div className="flex gap-2 sm:flex-col">
        {CUBE.map((f, k) => (
          <button key={f.t} onClick={() => { tap("tick"); setI(k); }}
            className={cn("flex size-12 items-center justify-center rounded-2xl transition-all", i === k ? "text-ink-900 scale-110" : "bg-ink-850 text-ink-400 hover:text-white")}
            style={i === k ? { background: f.hex, boxShadow: "0 4px 0 rgba(0,0,0,.4)" } : undefined}
            aria-label={f.t}>
            <Icon name={f.icon} size={22} stroke={2.4} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Q04 · Стопка отзывов ── */
const REVIEWS = [
  { n: "Алина, 24", seed: 1, t: "Наконец поняла, что такое плечо, — без потери денег. Симулятор топ.", s: 5 },
  { n: "Дмитрий, 31", seed: 3, t: "Прошёл путь за месяц. Дуэль с Китом — лучшее, что было в обучалках.", s: 5 },
  { n: "Олег, 28", seed: 5, t: "Стрик 60 дней. Жена думает, что я играю. А я учусь.", s: 4 },
  { n: "Мира, 22", seed: 2, t: "Карты навыков и сундуки затягивают. Минус — хочется ещё уроков!", s: 5 },
];

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < n ? "#FFC940" : "none"} stroke={i < n ? "#FFC940" : "#30508F"} strokeWidth="2"><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" /></svg>
      ))}
    </span>
  );
}

export function StackReviews() {
  const [i, setI] = useState(0);
  return (
    <div>
      <Carousel variant="stack" onChange={setI} dots progress={false} arrows={false} counter label="Отзывы" height={250} className="rounded-3xl">
        {REVIEWS.map((r) => (
          <div key={r.n} className="panel flex h-full flex-col p-5">
            <Stars n={r.s} />
            <div className="mt-3 flex-1 text-[15px] font-semibold leading-relaxed">«{r.t}»</div>
            <div className="mt-3 flex items-center gap-3">
              <AvatarArt seed={r.seed} size={38} />
              <div><div className="text-[13px] font-bold">{r.n}</div><div className="text-[11px] text-bull">✓ играет 3+ месяца</div></div>
            </div>
          </div>
        ))}
      </Carousel>
      <div className="mt-2 text-center font-mono text-[11px] text-ink-400">{i + 1}/{REVIEWS.length} · тяни карточку в сторону</div>
    </div>
  );
}

/* ── Q05 · Вертикальная лента новостей ── */
const NEWS = [
  { tag: "Рынок", c: "text-bull", t: "Bitcoin обновил максимум", d: "Приток в ETF превысил $2 млрд за неделю", time: "2 мин" },
  { tag: "Игра", c: "text-gold", t: "Новый босс: Кит Ликвидации", d: "Финальная битва модуля «Риск» уже в игре", time: "1 ч" },
  { tag: "Ивент", c: "text-violet", t: "Турнир выходного дня", d: "Призовой фонд 10 000 кристаллов", time: "3 ч" },
  { tag: "Урок", c: "text-sky", t: "Модуль «Деривативы»", d: "6 новых уроков про фьючерсы и опционы", time: "вчера" },
  { tag: "Рынок", c: "text-bear", t: "Волатильность растёт", d: "Индекс страха упал до 24 — время учиться", time: "вчера" },
];

export function VerticalNews() {
  return (
    <div className="mx-auto max-w-sm">
      <Carousel variant="vertical" autoplay autoplayMs={3200} dots={false} arrows={false} counter progress label="Новости" height={220} className="rounded-3xl">
        {NEWS.map((x) => (
          <div key={x.t} className="panel-soft flex h-full items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className={cn("text-[10px] font-black uppercase tracking-wider", x.c)}>{x.tag}</span><span className="text-[10px] text-ink-500">{x.time}</span></div>
              <div className="mt-1 font-display text-sm font-black leading-tight">{x.t}</div>
              <div className="text-[12px] text-ink-400">{x.d}</div>
            </div>
            <Icon name="chevR" size={18} className="shrink-0 text-ink-500" />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

/* ── Q06 · Витрина с миниатюрами (peek) ── */
const TIERS: Tier[] = ["bronze", "silver", "gold", "sapphire", "ruby", "diamond"];
const TIER_NAMES: Record<Tier, [string, string]> = {
  bronze: ["Бронза", "Старт карьеры"], silver: ["Серебро", "Первые победы"], gold: ["Золото", "Уверенный трейдер"],
  sapphire: ["Сапфир", "Топ-10% игроков"], ruby: ["Рубин", "Элита рынка"], diamond: ["Бриллиант", "Легенда сезона"],
};

export function PeekLeagues() {
  const [i, setI] = useState(3);
  return (
    <div>
      <Carousel variant="peek" onChange={setI} dots={false} arrows counter={false} label="Лиги" height={250}
        thumbs={TIERS.map((t) => <span key={t} className="flex h-full items-center justify-center bg-ink-850"><LeagueBadge tier={t} size={36} /></span>)}
        className="rounded-3xl">
        {TIERS.map((t) => (
          <div key={t} className="flex h-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-ink-700 to-ink-850 p-4 text-center ring-1 ring-white/10">
            <LeagueBadge tier={t} size={96} />
            <div className="mt-2 font-display text-sm font-black">Лига «{TIER_NAMES[t][0]}»</div>
            <div className="text-[11px] text-ink-400">{TIER_NAMES[t][1]}</div>
          </div>
        ))}
      </Carousel>
      <div className="mt-3 flex items-center justify-center gap-3">
        <Mascot size={44} mood="happy" />
        <div className="text-[12px] text-ink-300">Ты здесь: <b className="text-white">{TIER_NAMES[TIERS[i]][0]}</b> · соседние лиги видно краем</div>
      </div>
    </div>
  );
}

/* ── Бонус-контент для каруселей: награды ── */
export function RewardStrip() {
  const items = [
    { art: <CoinArt size={40} />, t: "+500", d: "монет" },
    { art: <GemArt size={40} />, t: "+80", d: "кристаллов" },
    { art: <FlameArt size={40} />, t: "x2", d: "стрик-буст" },
    { art: <TrophyArt size={40} />, t: "Кубок", d: "недели" },
    { art: <RocketArt size={40} />, t: "Ракета", d: "аватар" },
  ];
  return (
    <Carousel variant="slide" dots={false} arrows counter={false} label="Награды" height={150} className="rounded-2xl">
      {[0, 1].map((page) => (
        <div key={page} className="grid h-full grid-cols-5 gap-2">
          {items.slice(page * 3, page * 3 + 3).concat(page === 1 ? [] : []).map((x, k) => (
            <button key={k} onClick={() => { sfx("coin"); haptic(10); notify(`${x.t} ${x.d}`, "success"); }} className="panel-soft flex flex-col items-center justify-center gap-1 transition-transform hover:-translate-y-1">
              {x.art}<span className="font-display text-xs font-black">{x.t}</span><span className="text-[10px] text-ink-400">{x.d}</span>
            </button>
          ))}
        </div>
      ))}
    </Carousel>
  );
}
