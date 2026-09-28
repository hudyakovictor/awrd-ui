import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Bar } from "../components/ui";
import { Mascot, CoinArt, GemArt, HeartArt, FlameArt, ChestArt, AvatarArt, TrophyArt, type Mood } from "../components/art";
import { LogoMark, SkylineScene, LeagueBadge, BearRival } from "../components/art2";
import { particles } from "../lib/particles";
import { wallet, useWallet } from "../lib/wallet";
import { tap, sfx, haptic, useCountUp } from "../lib/fx";
import { cn } from "../utils/cn";

export type Go = (s: string, dir?: "fwd" | "back" | "up") => void;

/* ——— In-phone HUD (own fly targets so it never collides with the page header) ——— */
export function PHud({ go }: { go: Go }) {
  const w = useWallet();
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-1">
      <button onClick={() => { tap(); go("profile"); }} className="flex items-center gap-1.5"><LeagueBadge tier="sapphire" size={28} /></button>
      <div data-fly="p-streak" className="flex items-center gap-1"><FlameArt size={22} off={w.streak === 0} className="animate-flicker" /><span className="font-display text-xs font-black text-flame tabular-nums">{w.streak}</span></div>
      <button data-fly="p-gems" onClick={() => { tap(); go("shop", "up"); }} className="flex items-center gap-1"><GemArt size={22} /><span className="font-display text-xs font-black text-sky tabular-nums">{w.gems}</span></button>
      <div data-fly="p-coins" className="flex items-center gap-1"><CoinArt size={22} /><span className="font-display text-xs font-black text-gold tabular-nums">{w.coins >= 10000 ? (w.coins / 1000).toFixed(1) + "K" : w.coins}</span></div>
      <div data-fly="p-hearts" className="flex items-center gap-1"><HeartArt size={22} empty={!w.pro && w.hearts === 0} /><span className="font-display text-xs font-black text-bear">{w.pro ? "∞" : w.hearts}</span></div>
    </div>
  );
}

export function PTabs({ cur, go }: { cur: string; go: Go }) {
  const tabs: [string, IconName, string][] = [["home", "home", "text-bull"], ["league", "trophy", "text-gold"], ["quests", "target", "text-flame"], ["profile", "user", "text-violet"]];
  const order = tabs.map((t) => t[0]);
  return (
    <div className="grid grid-cols-4 border-t-2 border-ink-800 bg-ink-900 px-2 pb-5 pt-2">
      {tabs.map(([k, ic, tone]) => (
        <button key={k} aria-label={k} onClick={() => { if (k !== cur) { tap("tick"); go(k, order.indexOf(k) > order.indexOf(cur) ? "fwd" : "back"); } }}
          className={cn("mx-auto flex h-11 w-14 items-center justify-center rounded-2xl border-2 transition-all", k === cur ? cn("border-sky/60 bg-sky/10", tone) : "border-transparent text-ink-500")}>
          <Icon name={ic} size={24} stroke={k === cur ? 2.6 : 2} />
        </button>
      ))}
    </div>
  );
}

/* ═══════════ Splash ═══════════ */
export function Splash({ go }: { go: Go }) {
  return (
    <div className="relative flex h-full flex-col">
      <SkylineScene className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-900/30 to-ink-900" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <LogoMark size={110} className="animate-logo-in drop-shadow-[0_20px_30px_rgba(0,0,0,.5)]" />
        <div className="mt-5 font-display text-3xl font-black tracking-tight animate-slide-up" style={{ animationDelay: ".3s" }}>TradeLingo</div>
        <div className="mt-2 text-sm font-semibold text-ink-300 animate-slide-up" style={{ animationDelay: ".45s" }}>Трейдинг за 5 минут в день.<br />Без риска. С азартом.</div>
      </div>
      <div className="relative space-y-3 px-6 pb-10 animate-slide-up" style={{ animationDelay: ".6s" }}>
        <Btn block s="lg" onClick={() => { sfx("whoosh"); go("onboarding"); }}>Начать</Btn>
        <Btn block s="lg" v="ghost" onClick={() => go("home")}>У меня есть аккаунт</Btn>
      </div>
    </div>
  );
}

/* ═══════════ Onboarding ═══════════ */
const OB = [
  { q: "Зачем тебе трейдинг?", mood: "happy" as Mood, opts: [["trendUp", "Приумножить сбережения"], ["brain", "Понять, как устроен рынок"], ["briefcase", "Карьера в финансах"], ["sparkles", "Просто интересно"]] },
  { q: "Как хорошо ты знаешь крипту?", mood: "think" as Mood, opts: [["user", "Впервые слышу"], ["book", "Знаю основы"], ["candle", "Уже торгую"], ["crown", "Я кит 🐋"]] },
  { q: "Сколько времени в день?", mood: "hype" as Mood, opts: [["clock", "5 мин · Лайт"], ["clock", "10 мин · Стандарт"], ["clock", "15 мин · Серьёзно"], ["bolt", "20 мин · Интенсив"]] },
];
export function Onboarding({ go }: { go: Go }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<(number | null)[]>([null, null, null]);
  const s = OB[step];
  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-2">
      <div className="flex items-center gap-3">
        <button aria-label="назад" onClick={() => { tap(); step ? setStep(step - 1) : go("splash", "back"); }} className="text-ink-400"><Icon name="chevL" size={24} stroke={2.6} /></button>
        <Bar value={((step + (sel[step] !== null ? 1 : 0)) / OB.length) * 100} className="flex-1" h={14} />
      </div>
      <div key={step} className="mt-5 flex items-end gap-2 animate-screen-in">
        <Mascot size={78} mood={s.mood} />
        <div className="relative mb-6 rounded-2xl border-2 border-ink-600 bg-ink-800 px-3 py-2 text-sm font-bold">
          <span className="absolute -left-2 bottom-3 size-3 rotate-45 border-b-2 border-l-2 border-ink-600 bg-ink-800" />{s.q}
        </div>
      </div>
      <div key={"o" + step} className="mt-3 space-y-2.5">
        {s.opts.map(([ic, t], i) => (
          <button key={t} onClick={() => { tap("tick"); setSel((a) => a.map((v, j) => (j === step ? i : v))); }} data-state={sel[step] === i ? "selected" : undefined}
            className="tile3d flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-bold animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-ink-850"><Icon name={(ic === "briefcase" ? "wallet" : ic) as IconName} size={18} /></span>{t}
          </button>
        ))}
      </div>
      <div className="mt-auto">
        <Btn block s="lg" disabled={sel[step] === null} onClick={() => { if (step < OB.length - 1) { setStep(step + 1); sfx("whoosh"); } else { sfx("levelup"); go("home"); } }}>Продолжить</Btn>
      </div>
    </div>
  );
}

/* ═══════════ Home / path ═══════════ */
const NODES: { t: string; icon: IconName }[] = [
  { t: "Что такое биржа", icon: "book" }, { t: "Японские свечи", icon: "candle" }, { t: "Тренды", icon: "trendUp" },
  { t: "Сундук", icon: "gift" }, { t: "Стоп-лосс", icon: "shield" }, { t: "Босс: Медведь Бора", icon: "sword" },
];
export function Home({ go, done }: { go: Go; done: number }) {
  const [pop, setPop] = useState<number | null>(null);
  const cur = done;
  const offs = [0, 50, 70, 30, -40, 0];
  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
        <div className="sticky top-0 z-20 -mx-4 mb-4 bg-ink-900 px-4 pb-2">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-b from-bull to-bull-d p-3 text-ink-900 shadow-[0_5px_0_#0b6b3e]">
            <div className="flex-1"><div className="text-[10px] font-black uppercase tracking-wider opacity-70">Раздел 1 · Модуль 1</div><div className="font-display text-sm font-black">Основы рынка</div></div>
            <span className="flex size-10 items-center justify-center rounded-xl border-2 border-black/15 bg-black/10"><Icon name="book" size={20} stroke={2.6} /></span>
          </div>
        </div>
        <div className="relative flex flex-col items-center gap-6 pt-6">
          {NODES.map((n, i) => {
            const state = i < cur ? "done" : i === cur ? "cur" : "lock";
            const chest = n.icon === "gift";
            const boss = n.icon === "sword";
            return (
              <div key={i} className="relative" style={{ transform: `translateX(${offs[i]}px)` }}>
                {state === "cur" && !chest && (
                  <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 animate-bob whitespace-nowrap rounded-xl border-2 border-ink-600 bg-ink-800 px-3 py-1 font-display text-[11px] font-black text-bull">
                    НАЧАТЬ<span className="absolute -bottom-1.5 left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-ink-600 bg-ink-800" />
                  </div>
                )}
                {chest ? (
                  <button onClick={() => { if (state === "cur") { sfx("open"); haptic([20, 40]); particles.burst(window.innerWidth / 2, window.innerHeight / 2, { kind: "coin", count: 14, speed: 380 }); wallet.add({ coins: 150 }); go("home-chest"); } else tap(state === "lock" ? "error" : "tap"); }} className={cn(state === "cur" && "animate-wiggle")}>
                    <ChestArt size={80} open={state === "done"} tier="gold" />
                  </button>
                ) : (
                  <button onClick={() => { tap(state === "lock" ? "error" : "tap", state === "lock" ? 30 : 8); setPop(pop === i ? null : i); }}
                    className={cn("relative flex items-center justify-center rounded-full transition-transform active:translate-y-1.5", boss ? "size-20" : "size-[70px]",
                      state === "done" ? "bg-gold text-ink-900 shadow-[0_6px_0_var(--color-gold-d)]" : state === "cur" ? (boss ? "bg-bear text-white shadow-[0_6px_0_var(--color-bear-d)]" : "bg-bull text-ink-900 shadow-[0_6px_0_var(--color-bull-d)]") : "bg-ink-700 text-ink-500 shadow-[0_6px_0_#0e1b3a]")}>
                    {state === "cur" && <span className="absolute -inset-2 rounded-full border-4 border-bull/30 animate-ring" />}
                    <span className="absolute left-2.5 right-2.5 top-1.5 h-1/3 rounded-full bg-white/25" />
                    <Icon name={state === "done" ? "check" : state === "lock" ? "lock" : n.icon} size={30} stroke={2.8} className="relative" />
                  </button>
                )}
                {pop === i && (
                  <div className="absolute left-1/2 top-full z-30 mt-4 w-56 -translate-x-1/2 rounded-2xl bg-bull p-3 text-ink-900 shadow-[0_5px_0_var(--color-bull-d)] animate-zoom-in" style={state !== "cur" ? { background: state === "done" ? "var(--color-gold)" : "#243d73", color: state === "done" ? "#3a2400" : "#b0c0e4" } : undefined}>
                    <span className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45" style={{ background: "inherit" }} />
                    <div className="relative font-display text-sm font-black">{n.t}</div>
                    <div className="relative mb-3 text-[11px] font-bold opacity-80">{state === "done" ? "Пройдено · повтор +5 XP" : state === "lock" ? "Сначала пройди предыдущие" : "Урок 1 из 1 · 4 задания"}</div>
                    <button disabled={state === "lock"} onClick={() => { tap(); setPop(null); if (state !== "lock") go(boss ? "boss" : "lesson", "up"); }}
                      className={cn("relative w-full rounded-xl py-2.5 font-display text-xs font-black uppercase", state === "lock" ? "bg-ink-800 text-ink-500" : "bg-white text-ink-900 shadow-[0_4px_0_rgba(0,0,0,.2)] active:translate-y-1 active:shadow-none")}>
                      {state === "done" ? "Повторить" : state === "lock" ? "Закрыто" : boss ? "В бой · +50 XP" : "Начать · +15 XP"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div className="pointer-events-none absolute right-0 top-40"><Mascot size={70} mood="happy" className="animate-float" /></div>
          <div className="pointer-events-none absolute left-0 top-[380px]"><BearRival size={64} mood="smug" className="animate-bob" /></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Lesson (4 exercise types) ═══════════ */
type Ex =
  | { k: "mcq"; q: string; a: string[]; ok: number; why: string }
  | { k: "bank"; q: string; answer: string[]; extra: string[] }
  | { k: "news"; h: string; ok: "bull" | "bear"; why: string }
  | { k: "tf"; s: string; ok: boolean; why: string };
const LESSON: Ex[] = [
  { k: "mcq", q: "Что показывает зелёная свеча?", a: ["Цена выросла за период", "Объём упал", "Биржа закрыта"], ok: 0, why: "Закрытие выше открытия = бычья свеча." },
  { k: "bank", q: "Переведи: «Buy the dip»", answer: ["Покупай", "на", "просадке"], extra: ["продавай", "хаях", "всегда"] },
  { k: "news", h: "Крупный банк начал хранить BTC клиентов", ok: "bull", why: "Институционалы входят — спрос растёт." },
  { k: "tf", s: "Стоп-лосс гарантирует прибыль", ok: false, why: "Он ограничивает убыток, а не гарантирует прибыль." },
];
export function Lesson({ go, onComplete }: { go: Go; onComplete: (acc: number) => void }) {
  const w = useWallet();
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<unknown>(null);
  const [res, setRes] = useState<null | boolean>(null);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quit, setQuit] = useState(false);
  const [bank, setBank] = useState<number[]>([]);
  const ex = LESSON[i];
  const noHearts = !w.pro && w.hearts <= 0;
  const bankWords = ex.k === "bank" ? [...ex.answer, ...ex.extra].map((x, j) => ({ x, j })).sort((a, b) => ((a.j * 7) % 5) - ((b.j * 7) % 5)) : [];
  const ready = ex.k === "bank" ? bank.length > 0 : ans !== null;
  const check = () => {
    let ok = false;
    if (ex.k === "mcq") ok = ans === ex.ok;
    if (ex.k === "news") ok = ans === ex.ok;
    if (ex.k === "tf") ok = ans === ex.ok;
    if (ex.k === "bank") ok = bank.map((j) => bankWords.find((b) => b.j === j)!.x).join(" ") === ex.answer.join(" ");
    setRes(ok);
    if (ok) { sfx("success"); haptic([10, 40, 10]); setStreak((s) => s + 1); if (streak + 1 >= 2) particles.burstAt(document.querySelector("[data-lesson-bar]"), { kind: "flame", count: 16, speed: 220 }); }
    else { sfx("error"); haptic([40, 30, 40]); setStreak(0); setMistakes((m) => m + 1); if (!w.pro) { particles.burstAt(document.querySelector('[data-fly="p-hearts-l"]'), { kind: "heart", count: 6, speed: 220, gravity: 700, size: 7 }); wallet.add({ hearts: -1 }); } }
  };
  const next = () => {
    tap();
    if (i === LESSON.length - 1) { onComplete(Math.round(((LESSON.length - mistakes) / LESSON.length) * 100)); go("result", "up"); return; }
    setI(i + 1); setAns(null); setRes(null); setBank([]);
  };
  const why = res !== null ? ("why" in ex ? ex.why : ex.k === "bank" ? ex.answer.join(" ") : "") : "";
  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center gap-3 px-4 pt-1">
        <button aria-label="выйти" onClick={() => { tap(); setQuit(true); }} className="text-ink-400"><Icon name="x" size={24} stroke={2.6} /></button>
        <div data-lesson-bar className="relative flex-1">
          <Bar value={((i + (res ? 1 : 0)) / LESSON.length) * 100} h={16} />
          {streak >= 2 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-display text-[10px] font-black text-flame animate-pop" key={streak}>СЕРИЯ {streak}!</span>}
        </div>
        <div data-fly="p-hearts-l" className="flex items-center gap-1"><HeartArt size={22} empty={noHearts} className={res === false ? "animate-shake" : ""} /><span className="font-display text-sm font-black text-bear">{w.pro ? "∞" : w.hearts}</span></div>
      </div>
      <div key={i} className="flex-1 overflow-y-auto px-4 pt-5 animate-screen-in">
        {ex.k === "mcq" && (
          <Q title="Выбери правильный ответ" q={ex.q} mood={res === null ? "think" : res ? "happy" : "sad"}>
            <div className="space-y-2.5">{ex.a.map((a, j) => <Opt key={a} n={j + 1} text={a} state={res === null ? (ans === j ? "selected" : undefined) : j === ex.ok ? "correct" : ans === j ? "wrong" : "disabled"} onClick={() => res === null && (tap("tick"), setAns(j))} />)}</div>
          </Q>
        )}
        {ex.k === "bank" && (
          <Q title="Собери фразу" q={ex.q} mood={res === null ? "think" : res ? "happy" : "sad"}>
            <div className="flex min-h-[56px] flex-wrap gap-2 border-b-2 border-t-2 border-ink-700 py-2">
              {bank.map((j) => <button key={j} disabled={res !== null} onClick={() => { tap("tick"); setBank((b) => b.filter((x) => x !== j)); }} className="tile3d h-10 px-3 text-sm font-bold animate-zoom-in">{bankWords.find((b) => b.j === j)!.x}</button>)}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {bankWords.map((b) => <button key={b.j} disabled={bank.includes(b.j) || res !== null} onClick={() => { tap("tick"); setBank((x) => [...x, b.j]); }} className={cn("tile3d h-10 px-3 text-sm font-bold", bank.includes(b.j) && "opacity-0")}>{b.x}</button>)}
            </div>
          </Q>
        )}
        {ex.k === "news" && (
          <Q title="Как отреагирует рынок?" q={ex.h} mood={res === null ? "think" : res ? "happy" : "sad"}>
            <div className="grid grid-cols-2 gap-3">
              {(["bull", "bear"] as const).map((k) => (
                <button key={k} onClick={() => res === null && (tap("tick"), setAns(k))} data-state={res === null ? (ans === k ? "selected" : undefined) : k === ex.ok ? "correct" : ans === k ? "wrong" : "disabled"} className="tile3d flex flex-col items-center gap-2 py-5">
                  {k === "bull" ? <Mascot size={64} mood="hype" /> : <BearRival size={64} mood="smug" />}
                  <span className="font-display text-xs font-black uppercase">{k === "bull" ? "Рост ↑" : "Падение ↓"}</span>
                </button>
              ))}
            </div>
          </Q>
        )}
        {ex.k === "tf" && (
          <Q title="Правда или миф?" q={ex.s} mood={res === null ? "think" : res ? "happy" : "sad"}>
            <div className="grid grid-cols-2 gap-3">
              {[true, false].map((v) => <Opt key={String(v)} text={v ? "Правда" : "Миф"} state={res === null ? (ans === v ? "selected" : undefined) : v === ex.ok ? "correct" : ans === v ? "wrong" : "disabled"} onClick={() => res === null && (tap("tick"), setAns(v))} center />)}
            </div>
          </Q>
        )}
      </div>
      <div className={cn("px-4 pb-6 pt-4 transition-colors duration-300", res === true && "bg-bull/15", res === false && "bg-bear/15")}>
        {res !== null && (
          <div className="mb-3 flex items-center gap-3 animate-slide-up">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-ink-900 animate-pop", res ? "bg-bull" : "bg-bear")}><Icon name={res ? "check" : "x"} size={22} stroke={3.4} /></span>
            <div><div className={cn("font-display text-sm font-black", res ? "text-bull" : "text-bear")}>{res ? ["Отлично!", "Верно!", "Супер!", "Так держать!"][i % 4] : "Правильный ответ:"}</div><div className="text-[12px] text-ink-200">{why}</div></div>
          </div>
        )}
        {noHearts && res === false ? (
          <Btn block s="lg" v="gold" onClick={() => go("shop", "up")}>Нет жизней · в магазин</Btn>
        ) : (
          <Btn block s="lg" v={res === false ? "bear" : "bull"} disabled={!ready} onClick={res === null ? check : next}>{res === null ? "Проверить" : "Продолжить"}</Btn>
        )}
      </div>
      {quit && (
        <div className="absolute inset-0 z-30 flex items-end bg-ink-950/70 backdrop-blur-sm animate-fade">
          <div className="w-full rounded-t-3xl bg-ink-800 p-5 text-center animate-screen-up">
            <Mascot size={80} mood="sad" className="mx-auto" />
            <div className="font-display text-base font-black">Уже уходишь?</div>
            <div className="mb-4 text-[12px] text-ink-400">Весь прогресс урока будет потерян</div>
            <Btn block s="md" onClick={() => setQuit(false)}>Продолжить урок</Btn>
            <button onClick={() => { tap(); go("home", "back"); }} className="mt-3 w-full py-2 font-display text-xs font-black uppercase text-bear">Выйти</button>
          </div>
        </div>
      )}
    </div>
  );
}
function Q({ title, q, mood, children }: { title: string; q: string; mood: Mood; children: ReactNode }) {
  return (
    <div>
      <div className="font-display text-lg font-black">{title}</div>
      <div className="mt-3 flex items-end gap-2">
        <Mascot size={70} mood={mood} />
        <div className="relative mb-4 flex-1 rounded-2xl border-2 border-ink-600 bg-ink-800 px-3 py-2 text-sm font-bold"><span className="absolute -left-2 bottom-3 size-3 rotate-45 border-b-2 border-l-2 border-ink-600 bg-ink-800" />{q}</div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
function Opt({ n, text, state, onClick, center }: { n?: number; text: string; state?: string; onClick: () => void; center?: boolean }) {
  return (
    <button onClick={onClick} data-state={state} className={cn("tile3d flex w-full items-center gap-3 px-3 py-3.5 text-left text-sm font-bold", center && "justify-center py-6 font-display uppercase", state === "wrong" && "animate-shake")}>
      {n && <span className="flex size-7 items-center justify-center rounded-lg border-2 border-current/30 font-display text-[11px]">{n}</span>}{text}
    </button>
  );
}

/* ═══════════ Result ═══════════ */
export function Result({ go, acc }: { go: Go; acc: number }) {
  const [open, setOpen] = useState(false);
  const chest = useRef<HTMLButtonElement>(null);
  const xp = useCountUp(15 + (acc === 100 ? 10 : 0), 1000);
  const a = useCountUp(acc, 1200);
  useEffect(() => {
    sfx("levelup"); haptic([10, 30, 10, 30, 60]);
    particles.burst(window.innerWidth / 2, window.innerHeight * 0.3, { count: 60, speed: 620 });
    const t = setTimeout(() => particles.flyFrom(document.querySelector("[data-res-xp]"), "p-streak", "flame", 6, () => wallet.add({ xp: 25 })), 800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex h-full flex-col items-center px-5 pb-6 pt-6 text-center">
      <div className="relative"><div className="absolute inset-0 rounded-full bg-gold/30 blur-3xl" /><Mascot size={130} mood="hype" className="relative animate-bob" /></div>
      <div className="font-display text-2xl font-black text-gold drop-shadow-[0_3px_0_rgba(0,0,0,.4)]">Урок пройден!</div>
      <div className="mt-4 grid w-full grid-cols-2 gap-3">
        <div data-res-xp className="rounded-2xl bg-gradient-to-b from-gold to-gold-d p-[2px] shadow-[0_4px_0_rgba(0,0,0,.35)] animate-pop"><div className="rounded-[14px] bg-ink-850 p-2"><div className="text-[10px] font-black uppercase text-gold">Всего XP</div><div className="flex items-center justify-center gap-1 font-display text-xl font-black"><Icon name="bolt" size={16} />{Math.round(xp)}</div></div></div>
        <div className="rounded-2xl bg-gradient-to-b from-bull to-bull-d p-[2px] shadow-[0_4px_0_rgba(0,0,0,.35)] animate-pop" style={{ animationDelay: ".15s" }}><div className="rounded-[14px] bg-ink-850 p-2"><div className="text-[10px] font-black uppercase text-bull">{acc === 100 ? "Идеально" : "Точность"}</div><div className="flex items-center justify-center gap-1 font-display text-xl font-black"><Icon name="target" size={16} />{Math.round(a)}%</div></div></div>
      </div>
      <button ref={chest} disabled={open} onClick={() => { setOpen(true); sfx("open"); haptic([20, 40, 60]); particles.flyFrom(chest.current, "p-coins", "coin", 10, () => wallet.add({ coins: 60 })); }} className={cn("mt-5", !open && "animate-wiggle")}>
        <ChestArt size={100} open={open} tier="violet" />
      </button>
      <div className="text-[12px] font-bold text-ink-300">{open ? "+60 монет в кошелёк!" : "Тапни сундук за бонусом"}</div>
      <div className="mt-auto w-full"><Btn block s="lg" onClick={() => go("home", "back")}>Продолжить</Btn></div>
    </div>
  );
}

/* ═══════════ League / Quests / Profile / Shop (compact) ═══════════ */
export function League() {
  const rows = [["Кира", 1, 2140], ["Вы", 0, 1980], ["Макс", 2, 1810], ["Дима", 3, 1500], ["Лена", 4, 1320], ["Олег", 5, 900]] as const;
  return (
    <div className="h-full overflow-y-auto px-4 pb-4">
      <div className="flex flex-col items-center py-3">
        <div className="flex items-end gap-2"><LeagueBadge tier="gold" size={40} className="opacity-60" /><LeagueBadge tier="sapphire" size={72} /><LeagueBadge tier="ruby" size={40} locked /></div>
        <div className="mt-2 font-display text-lg font-black">Сапфировая лига</div>
        <div className="text-[12px] text-ink-400">Топ-3 → Рубин · 2 дня</div>
      </div>
      <div className="space-y-1.5">
        {rows.map(([n, seed, xp], i) => (
          <div key={n} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2", n === "Вы" ? "bg-sky/15 ring-2 ring-sky/50" : "bg-ink-850")}>
            <span className={cn("w-5 text-center font-display text-sm font-black", i === 0 ? "text-gold" : i < 3 ? "text-bull" : "text-ink-500")}>{i + 1}</span>
            <AvatarArt seed={seed} size={34} /><span className={cn("flex-1 text-[13px] font-bold", n === "Вы" && "text-sky")}>{n}</span><span className="font-mono text-xs text-ink-300">{xp} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function Quests() {
  const [q, setQ] = useState([{ t: "Заработай 30 XP", p: 30, n: 30, c: false }, { t: "Пройди 2 урока без ошибок", p: 1, n: 2, c: false }, { t: "Серия из 5 верных", p: 5, n: 5, c: false }]);
  return (
    <div className="h-full overflow-y-auto px-4 pb-4 pt-2">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-flame to-bear p-4 shadow-[0_5px_0_#8a1a30]">
        <div className="font-display text-base font-black">Ежедневные квесты</div><div className="text-[12px] text-white/80">Обновление через 6 ч</div>
        <TrophyArt size={64} className="absolute -bottom-1 right-3" />
      </div>
      <div className="mt-4 space-y-3">
        {q.map((x, i) => (
          <div key={x.t} className={cn("panel-soft flex items-center gap-3 p-3", x.c && "opacity-50")}>
            <div className="flex-1"><div className="text-[13px] font-bold">{x.t}</div><div className="mt-1.5 flex items-center gap-2"><Bar value={(x.p / x.n) * 100} tone="gold" h={12} className="flex-1" /><span className="font-mono text-[10px]">{x.p}/{x.n}</span></div></div>
            {x.p >= x.n && !x.c ? (
              <button onClick={(e) => { const el = e.currentTarget; setQ((a) => a.map((y, j) => (j === i ? { ...y, c: true } : y))); sfx("coin"); particles.flyFrom(el, "p-gems", "gem", 6, () => wallet.add({ gems: 15 })); }} className="btn3d v-gold h-9 px-3 text-[10px]"><GemArt size={14} />15</button>
            ) : <ChestArt size={40} open={x.c} tier="sky" />}
          </div>
        ))}
      </div>
    </div>
  );
}
export function ProfileP({ go }: { go: Go }) {
  const w = useWallet();
  return (
    <div className="h-full overflow-y-auto px-4 pb-4 pt-2 text-center">
      <div className="mx-auto w-fit rounded-full bg-[conic-gradient(var(--color-bull)_0_70%,#1b305c_70%)] p-1"><div className="rounded-full border-4 border-ink-900"><AvatarArt seed={0} size={84} /></div></div>
      <div className="mt-2 font-display text-lg font-black">Алекс</div>
      <div className="text-[12px] text-ink-400">Трейдер-ученик · ур. 7</div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {[["flame", w.streak, "стрик", "text-flame"], ["bolt", w.xp, "XP", "text-gold"], ["gem", w.gems, "кристаллы", "text-sky"], ["coin", w.coins, "монеты", "text-gold"]].map(([ic, v, t, c]) => (
          <div key={t as string} className="panel-soft p-3"><Icon name={ic as IconName} size={20} className={cn("mx-auto", c as string)} /><div className="mt-1 font-display text-base font-black tabular-nums">{(v as number).toLocaleString("ru-RU")}</div><div className="text-[10px] text-ink-400">{t}</div></div>
        ))}
      </div>
      <div className="mt-4 space-y-2 text-left">
        <button onClick={() => go("shop", "up")} className="panel-soft flex w-full items-center gap-3 p-3"><Icon name="gift" size={20} className="text-gold" /><span className="flex-1 text-[13px] font-bold">Магазин</span><Icon name="chevR" size={16} className="text-ink-500" /></button>
        <button onClick={() => { tap(); go("splash", "back"); }} className="panel-soft flex w-full items-center gap-3 p-3"><Icon name="logout" size={20} className="text-bear" /><span className="flex-1 text-[13px] font-bold">Начать заново</span></button>
      </div>
    </div>
  );
}
export function ShopP({ go }: { go: Go }) {
  const w = useWallet();
  const items = [{ id: "p-refill", t: "Полные жизни", p: 350, a: <HeartArt size={40} /> }, { id: "p-freeze", t: "Заморозка", p: 200, a: <FlameArt size={40} off /> }, { id: "p-pro", t: "Pro · 7 дней", p: 900, a: <LeagueBadge tier="diamond" size={40} /> }];
  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-1">
      <div className="flex items-center justify-between"><button aria-label="закрыть" onClick={() => go("home", "back")} className="text-ink-400"><Icon name="x" size={24} stroke={2.6} /></button><div className="font-display text-base font-black">Магазин</div><span className="w-6" /></div>
      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.id} className="panel-soft flex items-center gap-3 p-3">
            {it.a}<span className="flex-1 text-[13px] font-bold">{it.t}</span>
            <button onClick={() => {
              if (!wallet.spend("gems", it.p)) { sfx("error"); haptic([40, 30, 40]); return; }
              sfx("success"); if (it.id === "p-refill") wallet.setHearts(5); if (it.id === "p-pro") wallet.setPro(true);
            }} className={cn("btn3d h-10 px-3 text-[11px]", w.gems >= it.p ? "v-sky" : "v-ghost")}><GemArt size={16} />{it.p}</button>
          </div>
        ))}
      </div>
      <div className="mt-auto text-center text-[11px] text-ink-500">Кошелёк общий с каталогом</div>
    </div>
  );
}

/* ═══════════ Boss (compact duel) ═══════════ */
export function Boss({ go, onWin }: { go: Go; onWin: () => void }) {
  const Q = [{ q: "Риск 1% от $5000 — это…", a: ["$50", "$500"], ok: 0 }, { q: "Цена −10% при плече 10x →", a: ["−10%", "Ликвидация"], ok: 1 }, { q: "Лучшее против FOMO?", a: ["План сделки", "Чат с друзьями"], ok: 0 }];
  const [hp, setHp] = useState(100);
  const [me, setMe] = useState(100);
  const [i, setI] = useState(0);
  const [hit, setHit] = useState<"b" | "m" | null>(null);
  const bear = useRef<HTMLDivElement>(null);
  const over = hp <= 0 || me <= 0;
  const answer = (j: number) => {
    if (over) return;
    if (j === Q[i % Q.length].ok) { setHp((h) => Math.max(0, h - 34)); setHit("b"); sfx("hit"); haptic(30); particles.burstAt(bear.current, { kind: "spark", count: 24, colors: ["#FFC940", "#fff", "#FF8A3D"] }); }
    else { setMe((m) => Math.max(0, m - 40)); setHit("m"); sfx("error"); haptic([40, 30, 40]); }
    setTimeout(() => setHit(null), 400);
    setI(i + 1);
  };
  useEffect(() => { if (hp <= 0) { sfx("levelup"); particles.burst(window.innerWidth / 2, window.innerHeight / 2, { count: 70 }); } }, [hp]);
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-bear/20 to-ink-900 px-4 pb-6">
      <div className="flex items-center gap-2 pt-1"><button aria-label="выйти" onClick={() => go("home", "back")} className="text-ink-400"><Icon name="x" size={22} stroke={2.6} /></button><div className="flex-1 font-display text-xs font-black uppercase text-bear">Босс · Медведь Бора</div></div>
      <div className="mt-3 grid grid-cols-2 gap-3"><Bar value={me} tone="sky" h={12} /><Bar value={hp} tone="bear" h={12} /></div>
      <div className="relative flex flex-1 items-center justify-between">
        <div className={cn("transition-transform", hit === "b" && "translate-x-8", hit === "m" && "animate-shake")}><Mascot size={100} mood={over ? (hp <= 0 ? "hype" : "sad") : "idle"} /></div>
        <div ref={bear} className={cn("transition-all duration-500", hit === "b" && "animate-shake", hp <= 0 && "scale-75 opacity-30 grayscale")}><BearRival size={130} mood={hp <= 0 ? "defeated" : hit === "m" ? "smug" : "angry"} /></div>
      </div>
      {over ? (
        <div className="text-center animate-zoom-in">
          <div className={cn("font-display text-xl font-black", hp <= 0 ? "text-gold" : "text-bear")}>{hp <= 0 ? "Медведь повержен!" : "Ты ликвидирован"}</div>
          <Btn block s="lg" className="mt-4" v={hp <= 0 ? "gold" : "sky"} onClick={() => { if (hp <= 0) { onWin(); wallet.add({ xp: 50, gems: 30 }); go("home", "back"); } else { setHp(100); setMe(100); setI(0); } }}>{hp <= 0 ? "Забрать +30 крист." : "Реванш"}</Btn>
        </div>
      ) : (
        <>
          <div key={i} className="panel p-4 text-center text-sm font-bold animate-zoom-in">{Q[i % Q.length].q}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">{Q[i % Q.length].a.map((a, j) => <button key={a} onClick={() => answer(j)} className="tile3d py-4 text-sm font-bold">{a}</button>)}</div>
        </>
      )}
    </div>
  );
}
