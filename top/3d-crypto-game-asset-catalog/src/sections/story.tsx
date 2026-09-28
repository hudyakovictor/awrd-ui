import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { Mascot, CoinArt, type Mood } from "../components/art";
import { BearRival, type BearMood, SkylineScene, LockIcon } from "../components/art2";
import { particles } from "../lib/particles";
import { wallet } from "../lib/wallet";
import { tap, sfx, haptic } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════ V01 — Branching dialogue with typewriter ═══════════════ */
type Line = { who: "max" | "bora" | "you"; mood?: Mood | BearMood; text: string; choices?: { t: string; to: string; good?: boolean }[]; next?: string; end?: "good" | "bad" };
const SCRIPT: Record<string, Line> = {
  s1: { who: "bora", mood: "smug", text: "Эй, новичок! DOGE растёт уже третий день. Все покупают. Бери на всё с плечом 100x — завтра будешь на Ламбо!", next: "s2" },
  s2: { who: "max", mood: "think", text: "Стоп. Прежде чем что-то делать — что говорит твой план?", choices: [
    { t: "Бора прав, беру 100x!", to: "bad1" },
    { t: "Сначала проверю риск и поставлю стоп", to: "good1", good: true },
    { t: "Подожду отката", to: "mid1" },
  ] },
  bad1: { who: "bora", mood: "smug", text: "Ха-ха! Рынок качнулся на 1%… и твою позицию ликвидировали. Спасибо за ликвидность!", end: "bad" },
  mid1: { who: "max", mood: "happy", text: "Неплохо — терпение лучше FOMO. Но без плана ты просто ждёшь. Какой риск ты готов взять?", choices: [
    { t: "1–2% депозита", to: "good1", good: true },
    { t: "Всё или ничего", to: "bad1" },
  ] },
  good1: { who: "max", mood: "hype", text: "Вот это трейдер! Риск 1%, стоп под уровнем, плечо не выше 3x. Бора, у тебя ничего не вышло.", next: "good2" },
  good2: { who: "bora", mood: "defeated", text: "Грр… С дисциплинированными скучно. Я ещё вернусь, когда рынок сойдёт с ума…", end: "good" },
};
function useTypewriter(text: string, speed = 22) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => { if (v >= text.length) { clearInterval(id); return v; } if (v % 3 === 0) sfx("tick"); return v + 1; }), speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { shown: text.slice(0, n), done: n >= text.length, skip: () => setN(text.length) };
}
export function Dialogue() {
  const [id, setId] = useState("s1");
  const [log, setLog] = useState<string[]>([]);
  const line = SCRIPT[id];
  const tw = useTypewriter(line.text);
  const box = useRef<HTMLDivElement>(null);
  const advance = () => {
    if (!tw.done) { tw.skip(); return; }
    if (line.next) { tap(); setId(line.next); }
  };
  useEffect(() => {
    if (line.end === "good" && tw.done) { sfx("levelup"); haptic([10, 30, 10, 30, 60]); particles.burstAt(box.current, { count: 50 }); }
    if (line.end === "bad" && tw.done) { sfx("error"); haptic([60, 40, 60]); }
  }, [line.end, tw.done]);
  const speaking = line.who;
  return (
    <div ref={box} className="relative overflow-hidden rounded-3xl">
      <SkylineScene className="absolute inset-0 h-full w-full opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/60 to-transparent" />
      <div className="relative flex h-[200px] items-end justify-between px-4">
        <div className={cn("transition-all duration-300", speaking === "max" ? "translate-y-0 scale-105" : "translate-y-3 scale-95 opacity-60 saturate-50")}>
          <Mascot size={130} mood={(speaking === "max" ? line.mood : "idle") as Mood} className={speaking === "max" && !tw.done ? "animate-bob" : ""} />
        </div>
        <div className={cn("transition-all duration-300", speaking === "bora" ? "translate-y-0 scale-105" : "translate-y-3 scale-95 opacity-60 saturate-50")}>
          <BearRival size={130} mood={(speaking === "bora" ? line.mood : "smug") as BearMood} className={speaking === "bora" && !tw.done ? "animate-bob" : ""} />
        </div>
      </div>
      <div className="relative p-4 pt-0">
        <button onClick={advance} className="panel block w-full p-4 text-left">
          <div className={cn("mb-1 font-display text-[11px] font-black uppercase tracking-wider", speaking === "max" ? "text-sky" : "text-bear")}>{speaking === "max" ? "Бык Макс" : "Медведь Бора"}</div>
          <div className="min-h-[60px] text-[14px] font-semibold leading-relaxed">{tw.shown}{!tw.done && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-white" />}</div>
          {tw.done && line.next && <div className="mt-1 flex justify-end"><Icon name="chevD" size={16} className="animate-bounce text-ink-400" /></div>}
        </button>
        {tw.done && line.choices && (
          <div className="mt-3 space-y-2">
            {line.choices.map((c, i) => (
              <button key={c.t} onClick={() => { tap(); setLog((l) => [...l, c.t]); setId(c.to); }} className="tile3d flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] font-bold animate-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="flex size-6 items-center justify-center rounded-md bg-ink-850 font-display text-[10px]">{i + 1}</span>{c.t}
              </button>
            ))}
          </div>
        )}
        {tw.done && line.end && (
          <div className={cn("mt-3 flex items-center gap-3 rounded-2xl p-3 animate-zoom-in", line.end === "good" ? "bg-bull/15 ring-1 ring-bull/40" : "bg-bear/15 ring-1 ring-bear/40")}>
            <Icon name={line.end === "good" ? "trophy" : "alert"} size={22} className={line.end === "good" ? "text-gold" : "text-bear"} />
            <div className="flex-1 text-[12px] font-bold">{line.end === "good" ? "Глава пройдена · +40 XP · открыт урок «Риск 1%»" : "Плохая концовка · попробуй другой выбор"}</div>
            <Btn s="xs" v="ghost" icon="refresh" onClick={() => { setId("s1"); setLog([]); }}>Заново</Btn>
          </div>
        )}
        {log.length > 0 && <div className="mt-2 text-[10px] text-ink-500">Твои решения: {log.join(" → ")}</div>}
      </div>
    </div>
  );
}

/* ═══════════════ V02 — AI mentor chat ═══════════════ */
type Msg = { id: number; me: boolean; text: string; card?: "chart" | "quiz" };
const REPLIES: { k: RegExp; a: string; card?: Msg["card"] }[] = [
  { k: /шорт|short|пад/i, a: "Шорт — ставка на падение: ты продаёшь актив «в долг» дороже и выкупаешь дешевле. Риск теоретически безграничен, поэтому стоп обязателен.", card: "chart" },
  { k: /пример|покаж/i, a: "Смотри: цена 100 → вход в шорт, стоп 104, цель 92. Риск 4, прибыль 8 → R:R = 1:2 ✅", card: "chart" },
  { k: /проверь|тест|вопрос/i, a: "Лови вопрос! Если у тебя $1000 и риск 2%, какой максимальный убыток на сделку?", card: "quiz" },
  { k: /плеч|leverage/i, a: "Плечо умножает и прибыль, и убыток. При 10x падение на 10% = ликвидация. Новичкам — не выше 3x." },
];
export function MentorChat() {
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, me: false, text: "Привет! Я Макс, твой ментор. Спроси что угодно про трейдинг 👋" }]);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [quizAns, setQuizAns] = useState<number | null>(null);
  const list = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing]);
  const send = (t: string) => {
    if (!t.trim() || typing) return;
    sfx("whoosh");
    setMsgs((m) => [...m, { id: Date.now(), me: true, text: t }]);
    setText("");
    setTyping(true);
    const r = REPLIES.find((x) => x.k.test(t)) ?? { a: "Хороший вопрос! Разберём его в модуле «Основы». А пока — попробуй спросить про шорт, плечо или попроси проверить тебя.", card: undefined };
    setTimeout(() => { setTyping(false); sfx("tap"); setMsgs((m) => [...m, { id: Date.now() + 1, me: false, text: r.a, card: r.card }]); }, 900 + Math.min(1400, r.a.length * 12));
  };
  return (
    <div className="flex h-[440px] flex-col overflow-hidden rounded-3xl well">
      <div className="flex items-center gap-3 border-b border-white/5 bg-ink-850/60 px-4 py-2.5">
        <div className="relative"><Mascot size={38} mood="happy" /><span className="absolute bottom-0.5 right-0.5 size-2.5 rounded-full border-2 border-ink-850 bg-bull" /></div>
        <div className="flex-1"><div className="font-display text-xs font-black">Макс · ИИ-ментор</div><div className="text-[10px] text-bull">{typing ? "печатает…" : "онлайн"}</div></div>
        <Chip tone="gold">Pro</Chip>
      </div>
      <div ref={list} className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {msgs.map((m) => (
          <div key={m.id} className={cn("flex animate-slide-up", m.me ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] font-semibold leading-snug", m.me ? "rounded-br-md bg-sky text-white shadow-[0_3px_0_var(--color-sky-d)]" : "rounded-bl-md bg-ink-750 shadow-[0_3px_0_#0a1430]")}>
              {m.text}
              {m.card === "chart" && (
                <svg viewBox="0 0 160 60" className="mt-2 h-16 w-full rounded-xl bg-ink-900">
                  <line x1="0" x2="160" y1="16" y2="16" stroke="var(--color-bear)" strokeDasharray="3 3" /><line x1="0" x2="160" y1="44" y2="44" stroke="var(--color-bull)" strokeDasharray="3 3" />
                  <polyline points="0,40 25,30 50,26 75,22 90,24 110,34 135,40 160,46" fill="none" stroke="#3D9BFF" strokeWidth="2.5" />
                  <text x="4" y="12" fontSize="7" fill="var(--color-bear)" fontWeight="800">SL 104</text><text x="4" y="55" fontSize="7" fill="var(--color-bull)" fontWeight="800">TP 92</text>
                </svg>
              )}
              {m.card === "quiz" && (
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {["$2", "$20", "$200"].map((o, i) => (
                    <button key={o} disabled={quizAns !== null} onClick={() => { setQuizAns(i); if (i === 1) { sfx("success"); particles.flyFrom(list.current, "xp", "xp", 5, () => wallet.add({ xp: 5 })); } else sfx("error"); }}
                      className={cn("rounded-lg py-1.5 font-mono text-xs font-bold transition-colors", quizAns === null ? "bg-ink-900 hover:bg-ink-800" : i === 1 ? "bg-bull text-ink-900" : quizAns === i ? "bg-bear text-white" : "bg-ink-900 opacity-50")}>{o}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex"><div className="flex gap-1 rounded-2xl rounded-bl-md bg-ink-750 px-4 py-3">{[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-ink-300" style={{ animationDelay: `${i * 0.15}s` }} />)}</div></div>
        )}
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pb-2">
        {["Что такое шорт?", "Покажи пример", "Проверь меня", "Про плечо"].map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full bg-ink-750 px-3 py-1.5 text-[11px] font-bold text-sky ring-1 ring-sky/30 hover:bg-sky/15">{q}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex gap-2 border-t border-white/5 p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Спроси Макса…" aria-label="Сообщение" className="min-w-0 flex-1 rounded-xl bg-ink-850 px-3 text-sm font-semibold outline-none ring-2 ring-transparent focus:ring-sky" />
        <button type="submit" disabled={!text.trim() || typing} className="btn3d v-sky size-11 rounded-xl px-0" aria-label="Отправить"><Icon name="up" size={20} stroke={3} /></button>
      </form>
    </div>
  );
}

/* ═══════════════ V03 — Coach marks / spotlight tutorial ═══════════════ */
const TOUR: { ref: string; t: string; d: string; icon: IconName }[] = [
  { ref: "hud", t: "Твой кошелёк", d: "Стрик, кристаллы и жизни всегда наверху.", icon: "wallet" },
  { ref: "node", t: "Путь обучения", d: "Тапни зелёный узел, чтобы начать урок.", icon: "map" },
  { ref: "chest", t: "Сундуки", d: "Каждые 3 урока — награда.", icon: "gift" },
  { ref: "tabs", t: "Вкладки", d: "Лига, квесты и профиль — здесь.", icon: "menu" },
];
export function CoachMarks() {
  const [step, setStep] = useState<number | null>(null);
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const wrap = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  useLayoutEffect(() => {
    if (step === null) return;
    const el = refs.current[TOUR[step].ref], w = wrap.current;
    if (!el || !w) return;
    const a = el.getBoundingClientRect(), b = w.getBoundingClientRect();
    setRect({ x: a.left - b.left - 6, y: a.top - b.top - 6, w: a.width + 12, h: a.height + 12 });
  }, [step]);
  const s = step !== null ? TOUR[step] : null;
  const below = rect.y < 200;
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div ref={wrap} className="relative mx-auto h-[420px] w-[240px] overflow-hidden rounded-[32px] bg-ink-900 ring-4 ring-ink-700">
        <div ref={(e) => { refs.current.hud = e; }} className="mx-3 mt-4 flex justify-between rounded-xl bg-ink-800 px-3 py-2 text-[11px] font-black"><span className="text-flame">🔥 27</span><span className="text-sky">◆ 1240</span><span className="text-bear">♥ 5</span></div>
        <div className="mt-6 flex flex-col items-center gap-5">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold text-ink-900 shadow-[0_5px_0_var(--color-gold-d)]"><Icon name="check" size={24} stroke={3} /></span>
          <span ref={(e) => { refs.current.node = e; }} className="ml-16 flex size-14 items-center justify-center rounded-full bg-bull text-ink-900 shadow-[0_5px_0_var(--color-bull-d)]"><Icon name="candle" size={24} stroke={2.6} /></span>
          <span ref={(e) => { refs.current.chest = e; }} className="-ml-10 flex size-14 items-center justify-center rounded-2xl bg-ink-700 text-gold shadow-[0_5px_0_#0e1b3a]"><Icon name="gift" size={24} /></span>
          <span className="flex size-14 items-center justify-center rounded-full bg-ink-700 text-ink-500 shadow-[0_5px_0_#0e1b3a]"><Icon name="lock" size={22} /></span>
        </div>
        <div ref={(e) => { refs.current.tabs = e; }} className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-ink-800 bg-ink-900 py-3 text-ink-500">{(["home", "trophy", "target", "user"] as IconName[]).map((i) => <Icon key={i} name={i} size={20} className="mx-auto" />)}</div>
        {s && (
          <>
            <div className="pointer-events-none absolute rounded-2xl transition-all duration-500 [transition-timing-function:cubic-bezier(.22,1,.36,1)]" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: "0 0 0 9999px rgba(5,11,28,.82), 0 0 0 3px var(--color-sky), 0 0 24px 4px rgba(61,155,255,.6)" }} />
            <div key={step} className="absolute left-3 right-3 z-10 rounded-2xl bg-white p-3 text-ink-900 shadow-[0_4px_0_#8aa0d4] animate-zoom-in" style={{ top: below ? rect.y + rect.h + 12 : undefined, bottom: below ? undefined : 420 - rect.y + 12 }}>
              <div className="flex items-center gap-2"><Icon name={s.icon} size={16} className="text-sky-d" stroke={2.6} /><span className="font-display text-xs font-black">{s.t}</span><span className="ml-auto font-mono text-[10px] text-ink-400">{step! + 1}/{TOUR.length}</span></div>
              <div className="mt-1 text-[12px] font-semibold text-ink-600">{s.d}</div>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => { tap(); setStep(null); }} className="text-[11px] font-bold text-ink-400">Пропустить</button>
                <button onClick={() => { tap(); if (step! < TOUR.length - 1) setStep(step! + 1); else { setStep(null); sfx("success"); } }} className="ml-auto rounded-lg bg-sky px-3 py-1.5 font-display text-[10px] font-black uppercase text-white shadow-[0_3px_0_var(--color-sky-d)] active:translate-y-0.5">{step! < TOUR.length - 1 ? "Далее" : "Понятно"}</button>
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        <Label>Прожектор-обучение</Label>
        <div className="text-sm text-ink-300">Затемнение с «вырезом» плавно переезжает между элементами, подсказка сама выбирает сторону. Пропуск доступен на каждом шаге.</div>
        <div className="mt-4 flex gap-1.5">{TOUR.map((_, i) => <span key={i} className={cn("h-2 rounded-full transition-all", step === i ? "w-8 bg-sky" : step !== null && i < step ? "w-2 bg-bull" : "w-2 bg-ink-700")} />)}</div>
        <Btn s="md" v="sky" icon="play" className="mt-4" onClick={() => { setStep(0); sfx("whoosh"); }}>{step === null ? "Запустить тур" : "Сначала"}</Btn>
      </div>
    </div>
  );
}

/* ═══════════════ V04 — Story chapters ═══════════════ */
const CHAPTERS = [
  { n: 1, t: "Первая свеча", d: "Макс учит читать график", c: "from-sky/40 to-ink-800", done: true },
  { n: 2, t: "Пузырь", d: "Бора разгоняет мем-коин", c: "from-bear/40 to-ink-800", done: false },
  { n: 3, t: "Зима крипты", d: "Выжить на медвежьем рынке", c: "from-violet/40 to-ink-800", done: false },
  { n: 4, t: "Кит на горизонте", d: "Финальная битва сезона", c: "from-gold/40 to-ink-800", done: false },
];
export function Chapters() {
  const [unlocked, setUnlocked] = useState(2);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHAPTERS.map((ch) => {
          const locked = ch.n > unlocked;
          return (
            <button key={ch.n} onClick={(e) => { if (locked) { sfx("error"); haptic(30); e.currentTarget.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 300 }); return; } tap(); setOpen(ch.n); }}
              className={cn("group relative aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-b p-3 text-left shadow-[0_6px_0_#0a1430] transition-transform hover:-translate-y-1", ch.c)}>
              <div className={cn("absolute inset-0 grid-bg", locked && "backdrop-blur-sm")} />
              <div className="absolute inset-x-0 bottom-10 flex justify-center transition-transform duration-500 group-hover:scale-110">
                {ch.n === 1 ? <Mascot size={78} mood="happy" /> : ch.n === 2 ? <BearRival size={78} mood="smug" /> : ch.n === 3 ? <Mascot size={78} mood="sad" /> : <CoinArt size={64} />}
              </div>
              {locked && <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60"><LockIcon /></div>}
              <div className="relative font-mono text-[10px] font-bold text-white/70">ГЛАВА {ch.n}</div>
              <div className="absolute inset-x-3 bottom-3"><div className="font-display text-[12px] font-black leading-tight">{ch.t}</div><div className="text-[10px] text-white/70">{locked ? "Закрыто" : ch.d}</div></div>
              {ch.n < unlocked && <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-bull text-ink-900"><Icon name="check" size={14} stroke={3} /></span>}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="flex-1 text-[12px] text-ink-400">{open ? `Глава ${open}: «${CHAPTERS[open - 1].t}» — откроется диалог (см. V01)` : "Каждая глава = диалог + 5 уроков + босс"}</span>
        <Btn s="sm" v="gold" icon="up" disabled={unlocked >= 4} onClick={() => { setUnlocked((u) => u + 1); sfx("levelup"); }}>Открыть главу</Btn>
      </div>
    </div>
  );
}
