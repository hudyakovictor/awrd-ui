import { useEffect, useMemo, useState, type ReactNode } from "react";
import { X, Check, Star, Lock, BookOpen, Dumbbell, CandlestickChart, Trophy, User, ArrowUp, ArrowDown, Zap, Target, Clock } from "lucide-react";
import { Btn, Bar } from "../kit/ui";
import { Mascot, type Mood } from "../kit/Mascot";
import { FlameIcon, GemIcon, HeartIcon, ChestIcon, TrophyIcon, StarIcon } from "../kit/GameIcons";
import { Confetti } from "./Rewards";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

type Q =
  | { k: "mc"; q: string; opts: string[]; a: number; why: string }
  | { k: "tf"; q: string; a: boolean; why: string }
  | { k: "predict"; q: string; seq: number[]; up: boolean; why: string }
  | { k: "fill"; q: string; before: string; after: string; bank: string[]; a: string; why: string };

const LESSONS: { t: string; qs: Q[] }[] = [
  {
    t: "Candle basics",
    qs: [
      { k: "mc", q: "Что показывает тело свечи?", opts: ["Объём торгов", "Разницу открытия и закрытия", "Максимум дня", "Спред"], a: 1, why: "Тело — диапазон между ценой открытия и закрытия." },
      { k: "tf", q: "Зелёная свеча значит, что цена закрытия выше открытия.", a: true, why: "Да: бычья свеча закрылась выше открытия." },
      { k: "predict", q: "Три зелёные свечи с растущим объёмом. Куда дальше?", seq: [1, 1, 1, -1, 1, 1], up: true, why: "Сильный импульс чаще продолжается — но всегда ставь стоп." },
      { k: "fill", q: "Заверши правило", before: "Тень свечи показывает", after: "цены за период.", bank: ["экстремумы", "объём", "комиссию"], a: "экстремумы", why: "Тени — это максимум и минимум периода." },
      { k: "mc", q: "Доджи обычно означает…", opts: ["Сильный рост", "Нерешительность рынка", "Ликвидацию", "Дивиденды"], a: 1, why: "Открытие ≈ закрытие: покупатели и продавцы в равновесии." },
    ],
  },
  {
    t: "Risk management",
    qs: [
      { k: "tf", q: "Стоп-лосс лучше ставить после входа, когда увидишь убыток.", a: false, why: "Стоп определяется ДО входа — эмоции мешают решать потом." },
      { k: "mc", q: "Рекомендуемый риск на сделку для новичка:", opts: ["1–2%", "10%", "25%", "Весь депозит"], a: 0, why: "1–2% позволяет пережить серию убытков." },
      { k: "predict", q: "Цена трижды отскочила от поддержки и пробила её. Дальше?", seq: [-1, 1, -1, 1, -1, -1], up: false, why: "Пробой поддержки часто ускоряет падение." },
      { k: "fill", q: "Заверши правило", before: "Плечо увеличивает и прибыль, и", after: ".", bank: ["убытки", "комиссии", "дивиденды"], a: "убытки", why: "Плечо — усилитель в обе стороны." },
      { k: "tf", q: "Диверсификация снижает риск портфеля.", a: true, why: "Разные активы не падают одновременно одинаково." },
    ],
  },
];

type Screen = "home" | "lesson" | "result" | "league" | "profile";

function Phone({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute -inset-16 -z-10 rounded-full bg-sky/20 blur-3xl" />
      <div className="rounded-[52px] border border-white/10 bg-gradient-to-b from-ink-500 to-ink-800 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_12px_0_#060b18,0_50px_100px_-20px_rgba(0,0,0,.85)]">
        <div className="relative h-[720px] overflow-hidden rounded-[42px] bg-ink-900">
          <div className="absolute left-1/2 top-2.5 z-50 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
          <div className="num absolute inset-x-0 top-0 z-40 flex h-11 items-center justify-between px-8 text-[12px] font-bold">
            <span>9:41</span><span className="flex items-center gap-1">▂▄▆ <span className="ml-1 inline-block h-3 w-6 rounded-sm border border-white/60 p-px"><span className="block h-full w-4/5 rounded-[1px] bg-white" /></span></span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function GameDemo() {
  const [screen, setScreen] = useState<Screen>("home");
  const [unlocked, setUnlocked] = useState(0);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [xp, setXp] = useState(1240);
  const [streak, setStreak] = useState(6);
  const [gems, setGems] = useState(420);
  const [hearts, setHearts] = useState(5);
  const [result, setResult] = useState<{ correct: number; total: number; time: number; xp: number } | null>(null);
  const [streakBumped, setStreakBumped] = useState(false);

  const startLesson = (i: number) => { setLessonIdx(i); setScreen("lesson"); sfx.whoosh(); };
  const finish = (correct: number, total: number, time: number) => {
    const earned = 10 + correct * 3 + (correct === total ? 5 : 0);
    setResult({ correct, total, time, xp: earned });
    setXp((x) => x + earned);
    setGems((g) => g + (correct === total ? 30 : 10));
    if (!streakBumped) { setStreak((s) => s + 1); setStreakBumped(true); }
    const node = lessonIdx < 2 ? lessonIdx : lessonIdx + 1;
    setUnlocked((u) => Math.max(u, Math.min(node + 1, 5)));
    setScreen("result");
  };

  return (
    <section id="play" className="scroll-mt-24">
      <div className="mb-6 flex items-end gap-4">
        <div className="font-display text-5xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#2c4580] sm:text-6xl">00</div>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Playable Game Demo</h2>
          <p className="text-sm text-mist">Все ассеты в работе: полный игровой цикл на реальном мобильном экране</p>
        </div>
      </div>
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 space-y-3 lg:order-1">
          {[
            ["Core loop", "Главная → урок → итоги → прогресс сохраняется", "#3b82ff"],
            ["4 типа заданий", "Выбор ответа, правда/ложь, прогноз свечи, пропуск в фразе", "#22d39a"],
            ["Экономика", "Жизни, кристаллы, XP, серия — всё связано", "#ffc53d"],
            ["Game-feel", "Звук, хаптика, тряска, конфетти, пересчёт чисел", "#ff8a3d"],
          ].map(([t, d, c], i) => (
            <div key={t} className="panel-raised anim-slide-right flex items-start gap-3 p-4" style={{ animationDelay: `${i * 100}ms` }}>
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
              <div><div className="text-[14px] font-extrabold">{t}</div><div className="text-[12px] text-mist">{d}</div></div>
            </div>
          ))}
        </div>
        <div className="order-1 lg:order-2">
          <Phone>
            {screen === "home" && <Home unlocked={unlocked} xp={xp} streak={streak} gems={gems} hearts={hearts} onStart={startLesson} onTab={(s) => setScreen(s)} onChest={() => { setGems((g) => g + 50); setUnlocked((u) => u + 1); }} />}
            {screen === "league" && <LeagueScreen xp={xp} onTab={(s) => setScreen(s)} />}
            {screen === "profile" && <ProfileScreen xp={xp} streak={streak} gems={gems} onTab={(s) => setScreen(s)} />}
            {screen === "lesson" && <Lesson lesson={LESSONS[lessonIdx % LESSONS.length]} hearts={hearts} setHearts={setHearts} onQuit={() => setScreen("home")} onFinish={finish} />}
            {screen === "result" && result && <Result r={result} streak={streak} onDone={() => { setScreen("home"); sfx.whoosh(); }} />}
          </Phone>
        </div>
        <div className="order-3 space-y-3">
          <div className="panel p-5">
            <div className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-mist">Live game state</div>
            {[["XP", xp, "#ffc53d"], ["Streak", streak, "#ff8a3d"], ["Gems", gems, "#2bd9ff"], ["Hearts", hearts, "#ff4f6d"], ["Unlocked", `${unlocked + 1}/5`, "#22d39a"]].map(([l, v, c]) => (
              <div key={l as string} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
                <span className="text-[13px] font-bold text-mist">{l}</span>
                <span key={String(v)} className="num anim-pop text-base font-extrabold" style={{ color: c as string }}>{v}</span>
              </div>
            ))}
            <button onClick={() => { setHearts(5); setUnlocked(0); setStreakBumped(false); sfx.whoosh(); setScreen("home"); }} className="mt-3 w-full text-[11px] font-bold text-sky hover:underline">Reset demo</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TabBar({ active, onTab }: { active: number; onTab: (s: Screen) => void }) {
  const t: [typeof BookOpen, Screen | null][] = [[BookOpen, "home"], [Dumbbell, null], [CandlestickChart, null], [Trophy, "league"], [User, "profile"]];
  return (
    <div className="absolute inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[26px] border border-white/10 bg-ink-800/95 p-1.5 shadow-[0_5px_0_#060b18] backdrop-blur">
      {t.map(([I, s], i) => (
        <button key={i} onClick={() => { if (s) { onTab(s); sfx.tick(); } else sfx.error(); }} className={cn("relative grid h-12 place-items-center rounded-2xl transition-all", active === i && "bg-sky/20 ring-2 ring-sky")}>
          <I size={22} className={cn(active === i ? "anim-pop text-sky" : "text-[#5f74a3]")} />
          {!s && <Lock size={9} className="absolute right-3 top-2 text-[#5f74a3]" />}
        </button>
      ))}
    </div>
  );
}

function Home({ unlocked, xp, streak, gems, hearts, onStart, onTab, onChest }: { unlocked: number; xp: number; streak: number; gems: number; hearts: number; onStart: (i: number) => void; onTab: (s: Screen) => void; onChest: () => void }) {
  const [pop, setPop] = useState<number | null>(null);
  const nodes = [0, 1, 2, 3, 4];
  const offs = [0, 60, 84, 50, -30];
  return (
    <div className="anim-fade h-full overflow-y-auto pb-24 pt-12">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-ink-900/90 px-5 py-2 backdrop-blur">
        <span className="flex items-center gap-1"><FlameIcon size={24} className="anim-flame" /><span className="num text-sm font-extrabold text-ember">{streak}</span></span>
        <span className="flex items-center gap-1"><GemIcon size={24} /><span className="num text-sm font-extrabold text-cyan">{gems}</span></span>
        <span className="flex items-center gap-1"><HeartIcon size={24} empty={hearts === 0} /><span className="num text-sm font-extrabold text-bear">{hearts}</span></span>
        <span className="flex items-center gap-1"><StarIcon size={22} /><span className="num text-sm font-extrabold text-gold">{xp}</span></span>
      </div>
      <div className="mx-4 mt-2 rounded-2xl bg-gradient-to-br from-sky to-sky-d p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.3),0_5px_0_#15398f]">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/75">Section 1 · Unit 1</div>
        <div className="font-display text-lg font-extrabold">Crypto Trading 101</div>
      </div>
      <div className="relative mt-10 flex flex-col items-center gap-7">
        <div className="absolute left-4 top-28"><Mascot size={78} mood={unlocked > 1 ? "happy" : "idle"} /></div>
        {nodes.map((i) => {
          const isChest = i === 2, done = i < unlocked, cur = i === unlocked, locked = i > unlocked;
          const lessonNo = i > 2 ? i - 1 : i;
          return (
            <div key={i} className="relative" style={{ transform: `translateX(${offs[i]}px)` }}>
              {cur && pop !== i && <span className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-sky bg-ink-800 px-3 py-1 text-[11px] font-extrabold text-sky shadow-[0_3px_0_#060b18]" style={{ animation: "float 2s ease-in-out infinite" }}>START</span>}
              {cur && <span className="absolute -inset-2.5 rounded-full border-4 border-gold/60" style={{ animation: "pulse-ring 1.8s infinite" }} />}
              <button
                onClick={() => { if (locked) { sfx.error(); return; } if (isChest) { if (cur) { sfx.open(); onChest(); } return; } setPop(pop === i ? null : i); sfx.tap(); }}
                className={cn("btn3d !h-[76px] !w-[76px] !rounded-full !p-0", cur && "sheen")}
                style={{ ["--c" as string]: locked ? "#243a68" : done ? "var(--color-gold)" : "var(--color-sky)", ["--cd" as string]: locked ? "#172749" : done ? "var(--color-gold-d)" : "var(--color-sky-d)", ["--depth" as string]: "8px" }}
              >
                {isChest ? <ChestIcon size={50} open={done} /> : locked ? <Lock size={26} className="text-[#5f74a3]" /> : done ? <Check size={32} strokeWidth={4} className="text-[#6b4300]" /> : <Star size={30} fill="#fff" />}
              </button>
              {pop === i && !isChest && (
                <div className="panel-raised anim-pop absolute left-1/2 top-[92px] z-30 w-56 -translate-x-1/2 p-4 text-center">
                  <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#213866]" />
                  <div className="font-display text-sm font-extrabold">{LESSONS[lessonNo % 2].t}</div>
                  <div className="text-[11px] text-mist">Lesson {lessonNo + 1} · 5 заданий</div>
                  <Btn tone={done ? "gold" : "bull"} size="sm" block className={cn("mt-3", done && "!text-[#3b2600]")} disabled={hearts === 0} onClick={() => { setPop(null); onStart(lessonNo); }}>
                    {hearts === 0 ? "No hearts" : done ? "Practice +5 XP" : "Start +15 XP"}
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
        <div className="mt-2 opacity-60"><TrophyIcon size={60} style={{ filter: "grayscale(1)" }} /></div>
      </div>
      <TabBar active={0} onTab={onTab} />
    </div>
  );
}

function MiniChart({ seq, reveal, up }: { seq: number[]; reveal: boolean; up: boolean }) {
  let p = 50;
  const candles = seq.map((d) => { const o = p; p += d * (6 + Math.abs(Math.sin(o)) * 4); return { o, c: p }; });
  if (reveal) { const o = p; candles.push({ o, c: o + (up ? 14 : -14) }); }
  const vals = candles.flatMap((c) => [c.o, c.c]);
  const mn = Math.min(...vals) - 6, mx = Math.max(...vals) + 6;
  const y = (v: number) => 110 - ((v - mn) / (mx - mn)) * 100;
  return (
    <svg viewBox="0 0 220 120" className="h-36 w-full">
      {candles.map((c, i) => {
        const x = 18 + i * 28, u = c.c >= c.o, col = u ? "#22d39a" : "#ff4f6d";
        const last = reveal && i === candles.length - 1;
        return (
          <g key={i} style={last ? { transformOrigin: `${x}px ${y(c.o)}px`, animation: "bar-grow .5s cubic-bezier(.3,1.6,.5,1)" } : undefined}>
            <rect x={x - 1} y={Math.min(y(c.o), y(c.c)) - 6} width="2" height={Math.abs(y(c.o) - y(c.c)) + 12} fill={col} />
            <rect x={x - 8} y={Math.min(y(c.o), y(c.c))} width="16" height={Math.max(3, Math.abs(y(c.o) - y(c.c)))} rx="3" fill={col} style={last ? { filter: `drop-shadow(0 0 6px ${col})` } : undefined} />
          </g>
        );
      })}
      {!reveal && <g><rect x={18 + candles.length * 28 - 9} y="30" width="18" height="60" rx="4" fill="none" stroke="#ffc53d" strokeDasharray="4 3" strokeWidth="2" /><text x={18 + candles.length * 28} y="66" textAnchor="middle" fill="#ffc53d" fontSize="18" fontWeight="900">?</text></g>}
    </svg>
  );
}

function Lesson({ lesson, hearts, setHearts, onQuit, onFinish }: { lesson: (typeof LESSONS)[number]; hearts: number; setHearts: (f: (h: number) => number) => void; onQuit: () => void; onFinish: (c: number, t: number, time: number) => void }) {
  const [i, setI] = useState(0);
  const [queue, setQueue] = useState<Q[]>(lesson.qs);
  const [ans, setAns] = useState<number | boolean | string | null>(null);
  const [res, setRes] = useState<null | boolean>(null);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(0);
  const [quit, setQuit] = useState(false);
  const t0 = useMemo(() => Date.now(), []);
  const q = queue[i];
  const progress = (correct / lesson.qs.length) * 100;
  const mood: Mood = res === null ? "idle" : res ? (combo >= 2 ? "hype" : "happy") : "sad";

  const check = () => {
    if (ans === null) return;
    const ok = q.k === "mc" ? ans === q.a : q.k === "tf" ? ans === q.a : q.k === "predict" ? ans === q.up : ans === q.a;
    setRes(ok);
    if (ok) { setCorrect((c) => c + 1); setCombo((c) => c + 1); combo + 1 >= 3 ? sfx.coin() : sfx.correct(); }
    else { setCombo(0); setHearts((h) => Math.max(0, h - 1)); setShake((s) => s + 1); sfx.wrong(); setQueue((qq) => [...qq, q]); }
  };
  const next = () => {
    const ni = i + 1;
    if (ni >= queue.length || hearts === 0) { onFinish(correct, lesson.qs.length, Math.round((Date.now() - t0) / 1000)); return; }
    setI(ni); setAns(null); setRes(null); sfx.whoosh();
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter") { res === null ? check() : next(); }
      if (res === null && q.k === "mc" && ["1", "2", "3", "4"].includes(e.key)) { setAns(+e.key - 1); sfx.tick(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const tile = (on: boolean, state: "ok" | "bad" | null) => {
    const col = state === "ok" ? "#22d39a" : state === "bad" ? "#ff4f6d" : on ? "#3b82ff" : "#2c4580";
    return { borderColor: col, background: on || state ? `${col}1f` : "#15264a", boxShadow: `0 4px 0 ${on || state ? col + "aa" : "#0f1c3a"}`, color: on || state ? col : "#e8eeff" };
  };

  return (
    <div className="anim-fade relative flex h-full flex-col px-5 pb-5 pt-14">
      <div className="flex items-center gap-3">
        <button onClick={() => { setQuit(true); sfx.soft(); }} className="text-mist hover:text-white"><X size={24} /></button>
        <div className="relative flex-1">
          <Bar value={progress} tone={combo >= 3 ? "ember" : "bull"} h={16} />
          {combo >= 3 && <span key={combo} className="anim-pop absolute -top-6 right-0 rounded-md bg-ember px-1.5 text-[9px] font-extrabold">🔥 {combo} COMBO</span>}
        </div>
        <span key={shake} className={cn("flex items-center gap-1", shake && "anim-shake")}><HeartIcon size={24} empty={hearts === 0} /><span className="num text-sm font-extrabold text-bear">{hearts}</span></span>
      </div>

      <div key={i} className="anim-slide-right mt-5 flex flex-1 flex-col">
        {i >= lesson.qs.length && <div className="mb-2 inline-flex w-fit items-center gap-1 rounded-lg bg-gold/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-gold">↻ Previous mistake</div>}
        <div className="flex items-start gap-2">
          <Mascot size={70} mood={mood} />
          <div className="panel-raised relative flex-1 p-3 text-[14px] font-bold leading-snug">
            <span className="absolute -left-1.5 top-6 h-3 w-3 rotate-45 border-b border-l border-white/10 bg-[#1f3462]" />
            {q.q}
          </div>
        </div>

        <div key={shake} className={cn("mt-5", res === false && "anim-shake")}>
          {q.k === "mc" && (
            <div className="space-y-2.5">
              {q.opts.map((o, k) => (
                <button key={o} disabled={res !== null} onClick={() => { setAns(k); sfx.tick(); }} className="flex h-[52px] w-full items-center gap-3 rounded-2xl border-2 px-4 text-left text-[14px] font-extrabold transition active:translate-y-1" style={tile(ans === k, res !== null && ans === k ? (res ? "ok" : "bad") : res === false && k === q.a ? "ok" : null)}>
                  <span className="num grid h-6 w-6 place-items-center rounded-md border border-current/40 text-[11px] opacity-70">{k + 1}</span>{o}
                </button>
              ))}
            </div>
          )}
          {q.k === "tf" && (
            <div className="grid grid-cols-2 gap-3">
              {[true, false].map((v) => (
                <button key={String(v)} disabled={res !== null} onClick={() => { setAns(v); sfx.tick(); }} className="flex h-32 flex-col items-center justify-center gap-2 rounded-3xl border-2 text-lg font-black transition active:translate-y-1" style={tile(ans === v, res !== null && ans === v ? (res ? "ok" : "bad") : null)}>
                  <span className="text-4xl">{v ? "✓" : "✗"}</span>{v ? "Правда" : "Ложь"}
                </button>
              ))}
            </div>
          )}
          {q.k === "predict" && (
            <div>
              <div className="grid-bg panel-inset !rounded-2xl px-2"><MiniChart seq={q.seq} reveal={res !== null} up={q.up} /></div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[true, false].map((v) => (
                  <button key={String(v)} disabled={res !== null} onClick={() => { setAns(v); sfx.tick(); }} className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 text-[15px] font-black transition active:translate-y-1" style={tile(ans === v, res !== null && ans === v ? (res ? "ok" : "bad") : null)}>
                    {v ? <ArrowUp size={20} strokeWidth={3} /> : <ArrowDown size={20} strokeWidth={3} />}{v ? "UP" : "DOWN"}
                  </button>
                ))}
              </div>
            </div>
          )}
          {q.k === "fill" && (
            <div>
              <div className="flex min-h-[80px] flex-wrap items-center gap-2 border-y-2 border-white/5 py-4 text-[16px] font-extrabold">
                {q.before}
                <button onClick={() => { if (res === null) { setAns(null); sfx.soft(); } }} className={cn("h-10 min-w-[100px] rounded-xl border-2 px-3 text-[14px]", ans ? "anim-pop border-solid" : "border-dashed border-ink-400")} style={ans ? tile(true, res === null ? null : res ? "ok" : "bad") : undefined}>{(ans as string) ?? ""}</button>
                {q.after}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {q.bank.map((w) => (
                  <button key={w} disabled={res !== null || ans === w} onClick={() => { setAns(w); sfx.tick(); }} className={cn("h-11 rounded-xl border-2 px-4 text-[14px] font-extrabold transition", ans === w ? "border-ink-600 bg-ink-800 text-transparent" : "border-ink-500 bg-ink-700 shadow-[0_4px_0_#0f1c3a] active:translate-y-1 active:shadow-none")}>{w}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4">
          <Btn tone="bull" block size="lg" disabled={ans === null} onClick={check} silent>Check</Btn>
        </div>
      </div>

      {res !== null && (
        <div className="anim-slide-up absolute inset-x-0 bottom-0 z-40 rounded-t-[28px] p-5 pb-6" style={{ background: res ? "linear-gradient(180deg,#0f3b35,#0b2a27)" : "linear-gradient(180deg,#3d1426,#2c0e1b)", boxShadow: "0 -12px 30px rgba(0,0,0,.5)" }}>
          <div className="flex items-start gap-3">
            <span className={cn("anim-pop grid h-12 w-12 shrink-0 place-items-center rounded-full", res ? "bg-bull shadow-[0_3px_0_#10916a]" : "bg-bear shadow-[0_3px_0_#c02a47]")}>{res ? <Check size={26} strokeWidth={4} /> : <X size={26} strokeWidth={4} />}</span>
            <div>
              <div className={cn("font-display text-lg font-extrabold", res ? "text-bull" : "text-bear")}>{res ? ["Nice!", "Sharp!", "Excellent!", "On fire!"][Math.min(combo - 1, 3)] ?? "Nice!" : "Incorrect"}</div>
              <div className="text-[12px] leading-snug text-snow/80">{q.why}</div>
            </div>
          </div>
          <Btn tone={res ? "bull" : "bear"} block size="lg" className="mt-4" onClick={next}>{hearts === 0 && !res ? "End lesson" : "Continue"}</Btn>
        </div>
      )}

      {quit && (
        <div className="absolute inset-0 z-50 flex items-end bg-ink-950/70 backdrop-blur-sm anim-fade">
          <div className="panel anim-slide-up w-full !rounded-b-none p-6 text-center">
            <Mascot size={90} mood="sad" />
            <div className="font-display text-lg font-extrabold">Уже уходишь?</div>
            <div className="mt-1 text-[12px] text-mist">Прогресс урока будет потерян.</div>
            <Btn tone="sky" block className="mt-4" onClick={() => setQuit(false)}>Keep learning</Btn>
            <button onClick={onQuit} className="mt-3 text-[13px] font-extrabold text-bear">End session</button>
          </div>
        </div>
      )}
    </div>
  );
}

function useCountUp(target: number, ms = 900, delay = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now() + delay;
    const f = (t: number) => { const p = Math.max(0, Math.min(1, (t - start) / ms)); setV(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, delay]);
  return v;
}

function Result({ r, streak, onDone }: { r: { correct: number; total: number; time: number; xp: number }; streak: number; onDone: () => void }) {
  const [stage, setStage] = useState(0);
  const acc = Math.round((r.correct / r.total) * 100);
  const xp = useCountUp(r.xp, 900, 400);
  const accV = useCountUp(acc, 900, 600);
  const perfect = r.correct === r.total;
  useEffect(() => { sfx.levelUp(); }, []);
  return (
    <div className="anim-fade relative flex h-full flex-col px-6 pb-6 pt-16 text-center">
      {stage === 0 && <Confetti n={50} />}
      {stage === 0 ? (
        <>
          <div className="relative mx-auto">
            <div className="absolute inset-0 rounded-full bg-gold/30 blur-3xl" />
            <Mascot size={150} mood="hype" />
          </div>
          <div className="text-gradient-gold font-display mt-2 text-3xl font-black">{perfect ? "Perfect lesson!" : "Lesson complete!"}</div>
          <div className="mt-6 grid grid-cols-3 gap-2.5">
            {[{ l: "Total XP", v: xp, c: "#ffc53d", I: Zap }, { l: "Accuracy", v: `${accV}%`, c: acc >= 80 ? "#22d39a" : "#ff8a3d", I: Target }, { l: "Time", v: `${Math.floor(r.time / 60)}:${String(r.time % 60).padStart(2, "0")}`, c: "#2bd9ff", I: Clock }].map(({ l, v, c, I }, i) => (
              <div key={l} className="anim-pop overflow-hidden rounded-2xl border-2" style={{ borderColor: c, animationDelay: `${300 + i * 150}ms` }}>
                <div className="py-1 text-[9px] font-extrabold uppercase text-ink-900" style={{ background: c }}>{l}</div>
                <div className="flex items-center justify-center gap-1 bg-ink-800 py-3"><I size={14} style={{ color: c }} /><span className="num text-lg font-extrabold" style={{ color: c }}>{v}</span></div>
              </div>
            ))}
          </div>
          <div className="mt-auto"><Btn tone="bull" block size="lg" onClick={() => { setStage(1); sfx.whoosh(); }}>Continue</Btn></div>
        </>
      ) : (
        <>
          <div className="anim-pop relative mx-auto mt-6">
            <FlameIcon size={140} className="anim-flame" style={{ filter: "drop-shadow(0 0 30px rgba(255,138,61,.8))" }} />
          </div>
          <div className="num anim-pop text-7xl font-black text-ember" style={{ animationDelay: "200ms" }}>{streak}</div>
          <div className="font-display text-xl font-extrabold">day streak!</div>
          <div className="panel-inset mt-6 grid grid-cols-7 gap-1 p-3 !rounded-2xl">
            {"MTWTFSS".split("").map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-extrabold text-mist">{d}</span>
                <span className={cn("grid h-8 w-8 place-items-center rounded-full", i <= streak % 7 ? "anim-pop bg-gradient-to-b from-gold to-ember" : "bg-ink-700")} style={{ animationDelay: `${400 + i * 70}ms` }}>{i <= streak % 7 && <Check size={14} strokeWidth={4} />}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] text-mist">Занимайся каждый день, чтобы серия росла!</p>
          <div className="mt-auto"><Btn tone="bull" block size="lg" onClick={onDone}>Back to path</Btn></div>
        </>
      )}
    </div>
  );
}

function LeagueScreen({ xp, onTab }: { xp: number; onTab: (s: Screen) => void }) {
  const rows = [["Satoshi_V", 1840, "#f7931a"], ["You", xp, "#3b82ff"], ["CandleQueen", 1320, "#ff4f6d"], ["HODLer42", 1100, "#22d39a"], ["WickHunter", 870, "#8b5cff"], ["BearTrap", 540, "#2bd9ff"]] as [string, number, string][];
  const sorted = rows.sort((a, b) => b[1] - a[1]);
  return (
    <div className="anim-fade h-full overflow-y-auto px-4 pb-24 pt-14">
      <div className="text-center">
        <div className="mx-auto flex w-fit gap-2">{["#e39a62", "#d6e1ff", "#ffc53d", "#2bd9ff", "#8b5cff"].map((c, i) => <span key={c} className={cn("grid h-11 w-10 place-items-center", i === 3 && "scale-125")} style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: i <= 3 ? c : "#273f75" }}>{i === 3 && <GemIcon size={22} />}</span>)}</div>
        <div className="font-display mt-4 text-xl font-extrabold">Diamond League</div>
        <div className="text-[12px] text-mist">Топ-3 переходят в Obsidian · 2 дня</div>
      </div>
      <div className="mt-5 space-y-2">
        {sorted.map(([n, x, c], i) => (
          <div key={n} className={cn("anim-slide-right flex items-center gap-3 rounded-2xl p-3", n === "You" ? "bg-sky/15 ring-2 ring-sky" : "bg-ink-800")} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cn("num w-5 text-center font-extrabold", i < 3 ? "text-bull" : "text-mist")}>{i + 1}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full font-black text-ink-900" style={{ background: `linear-gradient(160deg,#fff,${c} 60%)` }}>{n[0]}</span>
            <span className="flex-1 text-[14px] font-bold">{n}</span>
            <span className="num text-[12px] font-bold text-mist">{x} XP</span>
          </div>
        ))}
      </div>
      <TabBar active={3} onTab={onTab} />
    </div>
  );
}

function ProfileScreen({ xp, streak, gems, onTab }: { xp: number; streak: number; gems: number; onTab: (s: Screen) => void }) {
  return (
    <div className="anim-fade h-full overflow-y-auto pb-24 pt-11">
      <div className="bg-gradient-to-br from-sky-d to-violet-d px-5 pb-14 pt-6 text-center">
        <div className="mx-auto w-fit"><Mascot size={100} mood="happy" /></div>
        <div className="font-display text-xl font-extrabold">You</div>
        <div className="text-[12px] text-white/70">Strategist · Lv {Math.floor(xp / 100)}</div>
      </div>
      <div className="-mt-9 grid grid-cols-3 gap-2 px-4">
        {[[FlameIcon, streak, "Streak"], [StarIcon, xp, "XP"], [GemIcon, gems, "Gems"]].map(([I, v, l], i) => {
          const C = I as typeof FlameIcon;
          return <div key={l as string} className="panel-raised anim-pop flex flex-col items-center p-3" style={{ animationDelay: `${i * 80}ms` }}><C size={30} /><span className="num text-base font-extrabold">{v as number}</span><span className="text-[9px] font-bold uppercase text-mist">{l as string}</span></div>;
        })}
      </div>
      <div className="mx-4 mt-5 space-y-2">
        {[["Candle basics", 100], ["Risk management", 60], ["Chart patterns", 10]].map(([n, p]) => (
          <div key={n as string} className="rounded-2xl bg-ink-800 p-3"><div className="mb-1.5 flex justify-between text-[12px] font-bold"><span>{n}</span><span className="num text-mist">{p}%</span></div><Bar value={p as number} tone={(p as number) >= 100 ? "gold" : "sky"} h={10} /></div>
        ))}
      </div>
      <TabBar active={4} onTab={onTab} />
    </div>
  );
}
