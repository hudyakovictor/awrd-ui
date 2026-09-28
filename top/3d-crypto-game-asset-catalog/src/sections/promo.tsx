import { useEffect, useRef, useState } from "react";
import { Carousel } from "../components/Carousel";
import { Marquee, Tilt, Reveal } from "../components/Reveal";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { Mascot, CoinArt, GemArt, FlameArt, AvatarArt, type Mood } from "../components/art";
import { LeagueBadge, BearRival, RocketArt } from "../components/art2";
import { useCountdown } from "../lib/gestures";
import { particles } from "../lib/particles";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   O — ПРОМО И ОНБОРДИНГ: пейджер, табы, marquee, баннер с таймером.
   ═══════════════════════════════════════════════════════════════════ */

/* ── O01 · Свайп-пейджер онбординга ── */
const PAGES: { mood: Mood; hex: string; t: string; d: string; art: React.ReactNode }[] = [
  { mood: "happy", hex: "#2BE38B", t: "Учись играя", d: "Короткие уроки, квизы и прогнозы. 5 минут в день — и ты понимаешь рынок.", art: <Mascot size={130} mood="happy" className="animate-bob" /> },
  { mood: "think", hex: "#3D9BFF", t: "Торгуй без риска", d: "Демо-симулятор с живым графиком: плечо, стопы, стакан — всё как настоящее.", art: <Mascot size={130} mood="think" /> },
  { mood: "hype", hex: "#FFC940", t: "Побеждай и забирай", d: "Боссы, лиги, сундуки и стрики. Учёба, от которой не оторваться.", art: <Mascot size={130} mood="hype" className="animate-float" /> },
];

export function OnboardingPager() {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const last = i === PAGES.length - 1;
  if (done) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center text-center animate-zoom-in">
        <LeagueBadge tier="gold" size={110} />
        <div className="mt-3 font-display text-xl font-black">Добро пожаловать, трейдер!</div>
        <div className="text-[13px] text-ink-400">Онбординг пройден · +50 XP</div>
        <Btn s="sm" v="ghost" icon="refresh" className="mt-4" onClick={() => { setDone(false); setI(0); }}>Смотреть снова</Btn>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {PAGES.map((_, k) => (
            <span key={k} className={cn("h-1.5 rounded-full transition-all duration-500", k === i ? "w-8" : "w-3", k <= i ? "" : "bg-ink-700")} style={k <= i ? { background: PAGES[i].hex } : undefined} />
          ))}
        </div>
        <button onClick={() => { tap(); setDone(true); sfx("success"); }} className="text-[12px] font-bold text-ink-400 hover:text-white">Пропустить</button>
      </div>
      <div key={i}>
        <Carousel variant="slide" loop={false} arrows={false} dots={false} startIndex={i} onChange={setI} label="Онбординг" height={330} className="mt-3 rounded-3xl">
          {PAGES.map((p) => (
            <div key={p.t} className="flex h-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-ink-700 to-ink-850 p-6 text-center ring-1 ring-white/10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${p.hex}44` }} />
                <div className="relative">{p.art}</div>
              </div>
              <div className="mt-4 font-display text-lg font-black">{p.t}</div>
              <div className="mt-1 text-[13px] leading-relaxed text-ink-300">{p.d}</div>
            </div>
          ))}
        </Carousel>
      </div>
      <div className="mt-4 flex gap-3">
        {i > 0 && <Btn s="md" v="ghost" onClick={() => setI(i - 1)}>Назад</Btn>}
        <Btn s="md" block v={last ? "gold" : "bull"} onClick={() => { if (last) { setDone(true); sfx("levelup"); haptic([10, 30, 10, 30, 60]); } else { sfx("whoosh"); setI(i + 1); } }}>
          {last ? "Начать учиться" : "Далее"}
        </Btn>
      </div>
      <div className="mt-2 text-center text-[11px] text-ink-500">Свайп тоже листает · кнопка синхронизирована</div>
    </div>
  );
}

/* ── O02 · Табы фич с бегущим индикатором ── */
const FEATS: { k: string; icon: IconName; hex: string; t: string; d: string; points: string[] }[] = [
  { k: "Уроки", icon: "book", hex: "#3D9BFF", t: "Уроки, а не лекции", d: "12 типов заданий: от квизов до перетаскивания стопов по графику.", points: ["4 минуты на урок", "Объяснение каждой ошибки", "Повторение по кривой забывания"] },
  { k: "Симулятор", icon: "candle", hex: "#2BE38B", t: "Симулятор как настоящий", d: "Живые котировки, плечо до 100x, стакан и PnL-карточки.", points: ["$10 000 демо-депозит", "TP/SL и ликвидация", "Журнал всех сделок"] },
  { k: "Битвы", icon: "sword", hex: "#FF4D6D", t: "Боссы-искажения", d: "FOMO-Дух, Бумажные Руки и Кит Ликвидации. Ответил — ударил.", points: ["Дуэли на время", "Слабости у каждого босса", "Награды за победу"] },
  { k: "Награды", icon: "gift", hex: "#FFC940", t: "Мета, которая держит", d: "Стрики, лиги, сундуки, сезонный пропуск и квесты с друзьями.", points: ["6 лиг от Бронзы", "Кооп-квесты", "Ежедневное колесо"] },
];

export function FeatureTabs() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(true);
  const f = FEATS[t];
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT((v) => (v + 1) % FEATS.length), 5000);
    return () => clearInterval(id);
  }, [auto]);
  return (
    <div onMouseEnter={() => setAuto(false)} onMouseLeave={() => setAuto(true)}>
      <div className="relative grid grid-cols-4 gap-1 rounded-2xl bg-ink-850 p-1.5">
        {FEATS.map((x, i) => (
          <button key={x.k} onClick={() => { tap("tick"); setT(i); }} className={cn("relative z-10 flex flex-col items-center gap-1 rounded-xl py-2.5 font-display text-[10px] font-black uppercase transition-colors sm:text-[11px]", t === i ? "text-white" : "text-ink-400 hover:text-ink-200")}>
            <Icon name={x.icon} size={20} stroke={t === i ? 2.6 : 2} />{x.k}
          </button>
        ))}
        <span className="absolute inset-y-1.5 rounded-xl transition-all duration-300 [transition-timing-function:cubic-bezier(.34,1.3,.64,1)]" style={{ left: `calc(${t * 25}% + 6px)`, width: "calc(25% - 12px)", background: f.hex, boxShadow: "0 3px 0 rgba(0,0,0,.4)" }} />
      </div>
      <div key={t} className="panel-soft mt-3 overflow-hidden p-5">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-ink-900 animate-pop" style={{ background: f.hex, boxShadow: "0 4px 0 rgba(0,0,0,.4)" }}>
            <Icon name={f.icon} size={28} stroke={2.4} />
          </span>
          <div>
            <div className="font-display text-base font-black animate-slide-up">{f.t}</div>
            <div className="mt-1 text-[13px] text-ink-300 animate-slide-up" style={{ animationDelay: ".06s" }}>{f.d}</div>
          </div>
        </div>
        <ul className="mt-4 space-y-2">
          {f.points.map((p, i) => (
            <li key={p} className="flex items-center gap-2.5 text-[13px] font-semibold animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
              <span className="flex size-5 items-center justify-center rounded-full text-ink-900" style={{ background: f.hex }}><Icon name="check" size={12} stroke={3.4} /></span>{p}
            </li>
          ))}
        </ul>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-ink-900">
          {auto && <span key={t} className="block h-full origin-left rounded-full" style={{ background: f.hex, animation: "autorot 5s linear forwards" }} />}
        </div>
      </div>
      <style>{`@keyframes autorot { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </div>
  );
}

/* ── O03 · Двойная marquee-лента ── */
const QUOTES = [
  { n: "Кира", seed: 1, t: "Стрик 100 дней. Лучшая привычка года.", s: 5 },
  { n: "Дима", seed: 3, t: "Понял фьючерсы за неделю. До этого год боялся.", s: 5 },
  { n: "Алина", seed: 2, t: "Дуэли с боссами — гениально. Азарт и польза.", s: 5 },
  { n: "Олег", seed: 5, t: "Симулятор спас мой депозит. Сначала было больно, но виртуально.", s: 4 },
  { n: "Мира", seed: 4, t: "Карточки, сундуки, лиги — Duolingo для денег.", s: 5 },
  { n: "Тимур", seed: 0, t: "Прошёл путь дважды. Второй раз — на скорость.", s: 4 },
];

function QuoteCard({ q }: { q: (typeof QUOTES)[number] }) {
  return (
    <div className="w-64 shrink-0 rounded-2xl bg-ink-800 p-4 ring-1 ring-white/5 transition-transform hover:-translate-y-1 hover:ring-sky/40">
      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="star" size={12} className={i < q.s ? "text-gold" : "text-ink-600"} />)}</div>
      <div className="mt-2 min-h-10 text-[12px] font-semibold leading-snug">«{q.t}»</div>
      <div className="mt-2 flex items-center gap-2"><AvatarArt seed={q.seed} size={24} /><span className="text-[11px] font-bold text-ink-300">{q.n}</span></div>
    </div>
  );
}

export function QuoteMarquee() {
  const [speed, setSpeed] = useState(36);
  return (
    <div className="space-y-3">
      <Marquee speed={speed} gap={12}>
        {QUOTES.slice(0, 3).map((q) => <QuoteCard key={q.n} q={q} />)}
      </Marquee>
      <Marquee speed={speed + 8} reverse gap={12}>
        {QUOTES.slice(3).map((q) => <QuoteCard key={q.n} q={q} />)}
      </Marquee>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-ink-400">Скорость</span>
        <input type="range" min={12} max={70} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="rng w-40" aria-label="скорость ленты" />
        <span className="font-mono text-[11px] text-ink-400">{speed}с</span>
        <span className="ml-auto hidden items-center gap-4 text-[11px] text-ink-500 sm:flex">
          <span className="flex items-center gap-1"><FlameArt size={16} />4.9</span>
          <span className="flex items-center gap-1"><CoinArt size={16} />128K отзывов</span>
        </span>
      </div>
    </div>
  );
}

/* ── O04 · Баннер ивента с таймером ── */
export function EventBanner() {
  const cd = useCountdown(26 * 3600 * 1000 + 14 * 60000);
  const [joined, setJoined] = useState(842 + 0);
  const [inBtn, setInBtn] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const join = (e: React.MouseEvent<HTMLElement>) => {
    if (inBtn) return;
    setInBtn(true);
    setJoined((j) => j + 1);
    sfx("levelup"); haptic([10, 30, 10, 30, 60]);
    particles.burstAt(e.currentTarget as HTMLElement, { count: 46, speed: 560 });
    notify("Ты в турнире! Удачи 🐂", "success");
    setTimeout(() => setInBtn(false), 1200);
  };
  return (
    <Tilt max={6} glare={false}>
      <div ref={box} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet via-[#4a2a9e] to-ink-900 p-6 shadow-[0_8px_0_#2d1470] ring-1 ring-violet/40 sm:p-8">
        <div className="animate-marquee pointer-events-none absolute inset-x-0 top-0 flex w-max gap-8 whitespace-nowrap py-1.5 text-[10px] font-black uppercase tracking-[.3em] text-white/25" style={{ animationDuration: "22s" }}>
          {Array.from({ length: 12 }).map((_, i) => <span key={i}>Турнир выходного дня · призовой фонд 10 000 ·</span>)}
        </div>
        <div className="relative mt-4 grid items-center gap-5 sm:grid-cols-[1fr_auto]">
          <div>
            <div className="flex flex-wrap gap-2"><Chip tone="gold">Live скоро</Chip><Chip tone="bull">{joined} участников</Chip></div>
            <div className="mt-2 font-display text-2xl font-black leading-tight sm:text-3xl">Турнир «Бычий забег»</div>
            <div className="mt-1 text-[13px] text-white/75">30 вопросов за 10 минут. Топ-10 делят 10 000 кристаллов.</div>
            <div className="mt-4 flex items-center gap-2">
              {[cd.h, cd.m, cd.s].map((v, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="flex gap-1">
                    {String(v).padStart(2, "0").split("").map((d, j) => (
                      <span key={`${d}-${j}-${v}`} className="flex h-11 w-8 items-center justify-center rounded-xl bg-ink-950/70 font-mono text-xl font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,.6)] animate-pop">{d}</span>
                    ))}
                  </span>
                  {i < 2 && <span className="font-black text-white/40">:</span>}
                </span>
              ))}
              <span className="ml-2 text-[11px] font-bold uppercase text-white/60">до старта</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <RocketArt size={96} className="animate-float drop-shadow-[0_16px_24px_rgba(0,0,0,.5)]" />
            <button onClick={join} className="btn3d v-gold shine-sweep h-12 px-6 text-xs">Участвовать</button>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/70"><GemArt size={16} />вход свободный</span>
          </div>
        </div>
        <Reveal variant="fade" className="relative mt-4 flex items-center gap-2 text-[11px] text-white/60">
          <BearRival size={0} mood="smug" />
          <span className="flex -space-x-2">{[1, 2, 3, 4].map((s) => <span key={s} className="rounded-full border-2 border-violet"><AvatarArt seed={s} size={22} /></span>)}</span>
          Кира, Дима и ещё {joined - 2} уже зарегистрировались
        </Reveal>
      </div>
    </Tilt>
  );
}
