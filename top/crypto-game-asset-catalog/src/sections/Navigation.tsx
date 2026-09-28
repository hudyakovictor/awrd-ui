import { useEffect, useRef, useState } from "react";
import { BookOpen, Dumbbell, CandlestickChart, Trophy, User, Check, Star, Lock, BookMarked, ChevronLeft, ChevronRight } from "lucide-react";
import { Asset, Section, Btn } from "../kit/ui";
import { FlameIcon, GemIcon, HeartIcon, BoltIcon, ChestIcon, TrophyIcon, CoinIcon, CandleUpIcon, ShieldIcon } from "../kit/GameIcons";
import { Mascot } from "../kit/Mascot";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

function Hud() {
  const [v, setV] = useState({ streak: 47, gems: 1280, hearts: 4, bolt: 18 });
  const [fx, setFx] = useState<{ id: number; k: string; t: string }[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [timer, setTimer] = useState(754);
  useEffect(() => { const i = setInterval(() => setTimer((t) => (t <= 0 ? 900 : t - 1)), 1000); return () => clearInterval(i); }, []);
  const bump = (k: keyof typeof v, d: number, t: string) => {
    setV((s) => ({ ...s, [k]: k === "hearts" ? Math.min(5, s.hearts + d > 5 ? 1 : s.hearts + d) : s[k] + d }));
    const id = Date.now() + Math.random();
    setFx((f) => [...f, { id, k, t }]);
    setTimeout(() => setFx((f) => f.filter((x) => x.id !== id)), 800);
    setOpen(k);
    k === "gems" ? sfx.coin() : sfx.tap();
  };
  const items = [
    { k: "streak" as const, I: FlameIcon, c: "#ff8a3d", val: v.streak, d: 1, t: "+1", cls: "anim-flame" },
    { k: "gems" as const, I: GemIcon, c: "#2bd9ff", val: v.gems.toLocaleString(), d: 50, t: "+50", cls: "" },
    { k: "hearts" as const, I: HeartIcon, c: "#ff4f6d", val: v.hearts, d: 1, t: "+1", cls: "" },
    { k: "bolt" as const, I: BoltIcon, c: "#ffc53d", val: v.bolt, d: 5, t: "+5", cls: "" },
  ];
  const info: Record<string, string> = {
    streak: `${v.streak}-дневная серия · не теряй!`,
    gems: "Кристаллы: магазин, заморозка серии",
    hearts: `Жизни ${v.hearts}/5 · +1 через ${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}`,
    bolt: "Энергия для симуляций сделок",
  };
  return (
    <Asset code="C-001" title="Top HUD / Currencies" desc="Игровая шапка: серия, кристаллы, жизни, энергия. Тап — анимация прироста + поповер." hint="Тапай счётчики" specs={["float +n", "popover", "live timer"]}>
      <div className="panel-inset flex items-center justify-between gap-1 p-2 !rounded-2xl">
        {items.map(({ k, I, c, val, d, t, cls }) => (
          <button key={k} onClick={() => bump(k, d, t)} className={cn("relative flex items-center gap-1.5 rounded-xl px-2 py-1.5 transition hover:bg-white/5 active:scale-95", open === k && "bg-white/5")}>
            <I size={26} className={cls} />
            <span key={String(val)} className="num anim-pop text-sm font-extrabold" style={{ color: c }}>{val}</span>
            {fx.filter((f) => f.k === k).map((f) => (
              <span key={f.id} className="num pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-sm font-black" style={{ color: c, animation: "rise .8s ease-out forwards", textShadow: `0 0 10px ${c}` }}>{f.t}</span>
            ))}
          </button>
        ))}
      </div>
      <div className="relative mt-3 h-16">
        {open && (
          <div key={open} className="panel-raised anim-pop absolute inset-x-0 top-0 flex items-center gap-3 p-3">
            <span className="absolute -top-1.5 h-3 w-3 rotate-45 border-l border-t border-white/10 bg-[#213866]" style={{ left: `${items.findIndex((i) => i.k === open) * 25 + 10}%` }} />
            <div className="text-[13px] font-bold">{info[open]}</div>
            <button onClick={() => setOpen(null)} className="ml-auto text-xs font-bold text-mist hover:text-white">✕</button>
          </div>
        )}
        {!open && <p className="pt-4 text-center text-[12px] text-mist">Нажми на валюту — увидишь поповер с деталями</p>}
      </div>
      <div className="mt-2 flex items-center justify-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <HeartIcon key={i} size={28} empty={i >= v.hearts} className={cn("transition-transform", i < v.hearts && "anim-pop")} style={{ animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </Asset>
  );
}

const tabs = [
  { n: "Learn", I: BookOpen, c: "#3b82ff" },
  { n: "Drill", I: Dumbbell, c: "#22d39a" },
  { n: "Trade", I: CandlestickChart, c: "#ffc53d" },
  { n: "League", I: Trophy, c: "#8b5cff" },
  { n: "Me", I: User, c: "#2bd9ff" },
];
function TabBar() {
  const [a, setA] = useState(0);
  const [bounce, setBounce] = useState(0);
  return (
    <Asset code="C-002" title="Bottom Tab Bar" desc="Нижняя навигация с «пузырём»-индикатором, пружинящими иконками и уведомлениями." hint="Переключай вкладки" specs={["5 tabs", "spring 300ms", "dot badge"]}>
      <div className="grid-bg panel-inset relative mb-4 grid h-32 place-items-center overflow-hidden !rounded-2xl">
        <div key={a} className="anim-pop text-center">
          <div className="font-display text-xl font-extrabold" style={{ color: tabs[a].c }}>{tabs[a].n}</div>
          <div className="text-[11px] text-mist">screen · {a + 1}/5</div>
        </div>
      </div>
      <nav className="relative grid grid-cols-5 rounded-[22px] border border-white/10 bg-gradient-to-b from-ink-700 to-ink-800 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_5px_0_#08112a,0_16px_30px_-10px_rgba(0,0,0,.6)]">
        <span className="absolute top-1.5 bottom-1.5 rounded-2xl transition-all duration-300 [transition-timing-function:cubic-bezier(.3,1.5,.5,1)]" style={{ left: `calc(${a * 20}% + 6px)`, width: "calc(20% - 12px)", background: `${tabs[a].c}22`, boxShadow: `inset 0 0 0 2px ${tabs[a].c}, 0 0 18px ${tabs[a].c}44` }} />
        {tabs.map(({ n, I, c }, i) => (
          <button key={n} onClick={() => { setA(i); setBounce((b) => b + 1); sfx.tick(); }} className="relative z-10 flex h-14 flex-col items-center justify-center gap-0.5">
            <span key={a === i ? bounce : 0} className={a === i ? "anim-pop" : ""}>
              <I size={22} style={{ color: a === i ? c : "#5f74a3" }} strokeWidth={a === i ? 2.6 : 2} />
            </span>
            <span className={cn("text-[9px] font-extrabold uppercase tracking-wider transition-colors", a === i ? "text-white" : "text-[#5f74a3]")}>{n}</span>
            {i === 3 && a !== 3 && <span className="absolute top-2 right-[26%] h-2.5 w-2.5 rounded-full border-2 border-ink-700 bg-bear" />}
          </button>
        ))}
      </nav>
    </Asset>
  );
}

type NodeT = { t: "lesson" | "chest" | "boss"; label: string };
const path: NodeT[] = [
  { t: "lesson", label: "What is a candle" },
  { t: "lesson", label: "Wicks & bodies" },
  { t: "chest", label: "Reward" },
  { t: "lesson", label: "Doji & hammer" },
  { t: "lesson", label: "Engulfing" },
  { t: "boss", label: "Unit exam" },
];
function LessonPath() {
  const [cur, setCur] = useState(1);
  const [prog, setProg] = useState(1);
  const [opened, setOpened] = useState<number[]>([]);
  const offsets = [0, 46, 70, 46, 0, -46];
  const tap = (i: number) => {
    if (i > cur) { sfx.error(); return; }
    if (i < cur) { sfx.soft(); return; }
    const n = path[i];
    if (n.t === "chest") { setOpened([...opened, i]); sfx.open(); setTimeout(() => { setCur(i + 1); setProg(0); }, 600); return; }
    if (prog + 1 >= 3) { sfx.levelUp(); setProg(3); setTimeout(() => { setCur((c) => Math.min(path.length, c + 1)); setProg(0); }, 500); }
    else { sfx.correct(); setProg((p) => p + 1); }
  };
  return (
    <Asset code="C-003" title="Lesson Path Map" desc="Карта юнита: пройдено, текущий (кольцо прогресса), закрыто, сундук, босс-экзамен." hint="Тапай текущий узел" specs={["3 crowns", "unlock chain", "pulse"]} className="xl:row-span-2">
      <div className="relative flex flex-col items-center gap-5 py-3">
        <div className="absolute right-0 top-24"><Mascot size={84} mood={cur >= path.length ? "hype" : "idle"} /></div>
        {path.map((n, i) => {
          const done = i < cur, active = i === cur, locked = i > cur;
          const C = 2 * Math.PI * 44;
          return (
            <div key={i} className="relative" style={{ transform: `translateX(${offsets[i]}px)` }}>
              {active && (
                <div className="anim-pop absolute -top-11 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-sky bg-ink-800 px-3 py-1.5 text-[11px] font-extrabold uppercase text-sky shadow-[0_3px_0_#08112a]" style={{ animation: "float 2s ease-in-out infinite" }}>
                  {n.t === "chest" ? "Open!" : prog === 0 ? "Start" : `${prog}/3`}
                  <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-sky bg-ink-800" />
                </div>
              )}
              {active && n.t === "lesson" && (
                <svg className="absolute -inset-3 -rotate-90" viewBox="0 0 100 100" style={{ width: 96, height: 96 }}>
                  <circle cx="50" cy="50" r="44" stroke="#0b1530" strokeWidth="7" fill="none" />
                  <circle cx="50" cy="50" r="44" stroke="#ffc53d" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - prog / 3)} style={{ transition: "stroke-dashoffset .5s cubic-bezier(.3,1.4,.5,1)" }} />
                </svg>
              )}
              <button
                onClick={() => tap(i)}
                className={cn("btn3d relative !h-[72px] !w-[72px] !rounded-full !p-0", active && "sheen")}
                style={{
                  ["--c" as string]: locked ? "#243a68" : n.t === "boss" ? "var(--color-violet)" : done ? "var(--color-gold)" : "var(--color-sky)",
                  ["--cd" as string]: locked ? "#172749" : n.t === "boss" ? "var(--color-violet-d)" : done ? "var(--color-gold-d)" : "var(--color-sky-d)",
                  ["--depth" as string]: "7px",
                }}
              >
                {n.t === "chest" ? <ChestIcon size={44} open={opened.includes(i)} /> : n.t === "boss" ? <TrophyIcon size={40} style={{ filter: locked ? "grayscale(1) brightness(.6)" : undefined }} /> : locked ? <Lock size={26} className="text-[#5f74a3]" /> : done ? <Check size={30} strokeWidth={4} className="text-[#6b4300]" /> : <Star size={28} fill="#fff" />}
              </button>
              <div className={cn("mt-2 text-center text-[10px] font-bold", locked ? "text-[#5f74a3]" : "text-mist")}>{n.label}</div>
            </div>
          );
        })}
        {cur >= path.length && (
          <div className="anim-pop text-center">
            <div className="font-display text-sm font-extrabold text-gold">Unit complete!</div>
            <button onClick={() => { setCur(1); setProg(0); setOpened([]); sfx.whoosh(); }} className="mt-1 text-[11px] font-bold text-mist underline">reset</button>
          </div>
        )}
      </div>
    </Asset>
  );
}

const steps = [
  { n: "Learn", I: BookOpen },
  { n: "Quiz", I: Star },
  { n: "Simulate", I: CandlestickChart },
  { n: "Trade", I: CoinIcon },
  { n: "Review", I: ShieldIcon },
];
function UnitHeader() {
  const [s, setS] = useState(2);
  return (
    <Asset code="C-004" title="Unit Banner & 5-Step Flow" desc="Баннер юнита с гайдбуком и пошаговый процесс обучения с тултипом." hint="Кликай по шагам" specs={["banner", "stepper", "tooltip"]}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bull to-bull-d p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.3),0_6px_0_#0a6b4d]">
        <CandleUpIcon size={90} className="absolute -right-3 -bottom-4 rotate-12 opacity-30" />
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/75">Section 2 · Unit 3</div>
        <div className="font-display text-lg font-extrabold leading-tight">Candlestick Patterns</div>
        <button onClick={() => sfx.tap()} className="relative mt-3 inline-flex items-center gap-1.5 rounded-xl border-2 border-white/30 bg-white/15 px-3 py-1.5 text-[11px] font-extrabold uppercase backdrop-blur transition hover:bg-white/25 active:translate-y-0.5">
          <BookMarked size={14} /> Guidebook
        </button>
      </div>
      <div className="relative mt-12 flex items-center justify-between px-1">
        <div className="panel-inset absolute inset-x-5 top-1/2 h-2 -translate-y-1/2 !rounded-full" />
        <div className="absolute left-5 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold to-ember shadow-[0_0_10px_#ff8a3d] transition-all duration-500" style={{ width: `calc(${(s / 4) * 100}% - ${(s / 4) * 40}px)` }} />
        {steps.map(({ n, I }, i) => {
          const done = i < s, act = i === s;
          return (
            <button key={n} onClick={() => { setS(i); sfx.tick(); }} className="relative z-10 flex flex-col items-center">
              {act && (
                <span className="anim-pop absolute -top-10 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-extrabold text-ink-900 shadow-[0_3px_0_#8ea3d6]">
                  {n}
                  <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
                </span>
              )}
              <span className={cn("grid h-11 w-11 place-items-center rounded-full transition-all duration-300", act ? "scale-110 bg-gradient-to-b from-gold to-ember shadow-[0_4px_0_#c75a14,0_0_18px_#ff8a3d88]" : done ? "bg-ember shadow-[0_3px_0_#c75a14]" : "bg-ink-800 shadow-[0_3px_0_#08112a]")}>
                {done ? <Check size={18} strokeWidth={3.5} /> : typeof I === "function" && (I === CoinIcon || I === ShieldIcon) ? <I size={22} style={{ filter: act ? undefined : "grayscale(1) brightness(.7)" }} /> : <I size={18} className={act ? "text-white" : "text-[#5f74a3]"} />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between text-[9px] font-bold uppercase text-mist">
        {steps.map((x) => <span key={x.n} className="w-11 text-center">{x.n}</span>)}
      </div>
    </Asset>
  );
}

const slides = [
  { t: "Learn by playing", d: "5-минутные уроки о рынке, свечах и рисках.", c: "#3b82ff", I: FlameIcon },
  { t: "Trade with zero risk", d: "Симулятор с реальными котировками.", c: "#22d39a", I: CandleUpIcon },
  { t: "Climb the leagues", d: "Соревнуйся с трейдерами всего мира.", c: "#8b5cff", I: TrophyIcon },
];
function Carousel() {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0);
  const sx = useRef<number | null>(null);
  const go = (n: number) => { const x = Math.max(0, Math.min(slides.length - 1, n)); if (x !== i) sfx.whoosh(); setI(x); };
  return (
    <Asset code="C-005" title="Onboarding Carousel" desc="Свайп-карусель с резиновым сопротивлением, точками-пагинацией и CTA." hint="Свайпни карточку" specs={["drag", "rubber band", "dots"]}>
      <div
        className="relative h-52 touch-pan-y overflow-hidden rounded-2xl"
        onPointerDown={(e) => { sx.current = e.clientX; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
        onPointerMove={(e) => { if (sx.current !== null) { let d = e.clientX - sx.current; if ((i === 0 && d > 0) || (i === slides.length - 1 && d < 0)) d *= 0.3; setDrag(d); } }}
        onPointerUp={() => { if (drag < -50) go(i + 1); else if (drag > 50) go(i - 1); sx.current = null; setDrag(0); }}
      >
        <div className="flex h-full" style={{ transform: `translateX(calc(${-i * 100}% + ${drag}px))`, transition: sx.current !== null ? "none" : "transform .45s cubic-bezier(.3,1.3,.5,1)" }}>
          {slides.map(({ t, d, c, I }) => (
            <div key={t} className="flex h-full w-full shrink-0 select-none flex-col items-center justify-center gap-2 p-4 text-center" style={{ background: `radial-gradient(circle at 50% 30%, ${c}55, transparent 70%), #0d1730` }}>
              <I size={72} className="anim-float" />
              <div className="font-display text-base font-extrabold">{t}</div>
              <div className="text-[12px] text-mist">{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button onClick={() => go(i - 1)} disabled={i === 0} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a] disabled:opacity-30 active:translate-y-[3px] active:shadow-none"><ChevronLeft size={18} /></button>
        <div className="flex gap-2">
          {slides.map((s, n) => (
            <button key={n} onClick={() => go(n)} className="h-2.5 rounded-full transition-all duration-300" style={{ width: n === i ? 28 : 10, background: n === i ? s.c : "#273f75", boxShadow: n === i ? `0 0 10px ${s.c}` : undefined }} />
          ))}
        </div>
        <button onClick={() => go(i + 1)} disabled={i === slides.length - 1} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a] disabled:opacity-30 active:translate-y-[3px] active:shadow-none"><ChevronRight size={18} /></button>
      </div>
      <Btn tone={i === slides.length - 1 ? "bull" : "sky"} block className="mt-4" onClick={() => go(i === slides.length - 1 ? 0 : i + 1)}>{i === slides.length - 1 ? "Get started" : "Next"}</Btn>
    </Asset>
  );
}

export default function Navigation() {
  return (
    <Section id="navigation" index="03" title="Navigation" subtitle="HUD, таб-бар, карта обучения, степпер, онбординг">
      <Hud />
      <LessonPath />
      <TabBar />
      <UnitHeader />
      <Carousel />
    </Section>
  );
}
