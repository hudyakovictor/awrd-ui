import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Signal, Wifi, BatteryFull, Swords, Flame, Gem, Trophy, User } from "lucide-react";
import { Btn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { LogoMark } from "../kit/Brand";
import { FlameIcon, GemIcon, HeartIcon, ChestIcon, TrophyIcon, StarIcon, CoinIcon, ShieldIcon, TargetIcon, BoltIcon, CandleUpIcon, CandleDownIcon } from "../kit/GameIcons";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ---------------------------------------------------------------- shell */
function Phone({ children, label, tag }: { children: ReactNode; label: string; tag: string }) {
  return (
    <div className="relative h-[600px] w-[292px] shrink-0 select-none">
      <div className="absolute -inset-8 -z-10 rounded-full bg-sky/20 blur-3xl" />
      <div className="rounded-[44px] border border-white/12 bg-gradient-to-b from-ink-500 to-ink-800 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.2),0_12px_0_#060b18,0_50px_90px_-20px_rgba(0,0,0,.9)]">
        <div className="relative h-full overflow-hidden rounded-[36px] bg-ink-900">
          <div className="absolute left-1/2 top-2 z-40 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="relative z-30 flex h-11 items-center justify-between px-6 pt-1 text-[11px] font-bold text-white/85">
            <span className="num">9:41</span>
            <span className="flex items-center gap-1.5"><Signal size={12} /><Wifi size={12} /><BatteryFull size={14} /></span>
          </div>
          <div className="h-[calc(100%-44px)] overflow-hidden">{children}</div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="font-display text-sm font-extrabold text-white">{label}</div>
        <div className="text-[11px] text-mist">{tag}</div>
      </div>
    </div>
  );
}
function TabBar({ active }: { active: number }) {
  const t = [Flame, Gem, Swords, Trophy, User];
  return (
    <div className="absolute inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[24px] border border-white/10 bg-ink-800/95 p-1.5 shadow-[0_4px_0_#060b18] backdrop-blur">
      {t.map((I, i) => (
        <div key={i} className={cn("grid h-11 place-items-center rounded-2xl transition-all", active === i && "bg-sky/20 ring-2 ring-sky")} style={{ animation: active === i ? "pop-in .4s both" : undefined }}>
          <I size={19} className={active === i ? "text-sky" : "text-[#5f74a3]"} strokeWidth={active === i ? 2.6 : 2} />
        </div>
      ))}
    </div>
  );
}
function TopBar({ lives = 5, streak = 47, gems = 1280 }: { lives?: number; streak?: number; gems?: number }) {
  return (
    <div className="flex items-center justify-between px-4 pb-2">
      <span className="flex items-center gap-1"><FlameIcon size={22} className="anim-flame" /><span className="num text-[12px] font-extrabold text-ember">{streak}</span></span>
      <span className="flex items-center gap-1"><GemIcon size={22} /><span className="num text-[12px] font-extrabold text-cyan">{gems}</span></span>
      <span className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => <HeartIcon key={i} size={17} empty={i >= lives} />)}</span>
    </div>
  );
}

/* ------------------------------------------------------------ 01 · path */
function ScreenPath() {
  const [i, setI] = useState(1);
  const offs = [0, 52, 74, 40, -24];
  return (
    <div className="relative h-full overflow-y-auto pb-24 no-scrollbar">
      <TopBar />
      <div className="mx-4 rounded-2xl bg-gradient-to-br from-sky to-sky-d p-3.5 shadow-[0_4px_0_#15398f]">
        <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/75">Section 1 · Unit 2</div>
        <div className="font-display text-[15px] font-extrabold">Market Structure</div>
        <div className="mt-2"><Bar value={60} tone="gold" h={8} /></div>
      </div>
      <div className="mt-8 flex flex-col items-center gap-6">
        {[0, 1, 2, 3, 4].map((k) => {
          const done = k < i, cur = k === i;
          return (
            <button key={k} onClick={() => { if (k <= i) { setI(k); sfxRaw.pop(); } else sfx.error(); }} className="relative" style={{ transform: `translateX(${offs[k]}px)` }}>
              {cur && <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-sky bg-ink-800 px-2 py-0.5 text-[9px] font-extrabold text-sky" style={{ animation: "float 2s infinite" }}>{k === 2 ? "OPEN" : "START"}</span>}
              <span className={cn("grid h-16 w-16 place-items-center rounded-full", cur && "sheen")} style={{ background: k === 2 ? "transparent" : done ? "linear-gradient(#ffd76b,#ffc53d)" : cur ? "linear-gradient(#6ea4ff,#3b82ff)" : "#243a68", boxShadow: k === 2 ? "none" : `0 7px 0 ${done ? "#c98a12" : cur ? "#2152c4" : "#172749"}` }}>
                {k === 2 ? <ChestIcon size={54} open /> : done ? <span className="num text-xl font-black text-[#6b4300]">✓</span> : <StarIcon size={26} className={cur ? "" : "opacity-40"} />}
              </span>
            </button>
          );
        })}
        <div className="opacity-50"><TrophyIcon size={46} style={{ filter: "grayscale(1)" }} /></div>
      </div>
      <div className="absolute -right-1 top-40"><Mascot size={72} mood="happy" /></div>
      <TabBar active={0} />
    </div>
  );
}

/* -------------------------------------------------------- 02 · question */
function ScreenQuestion() {
  const [sel, setSel] = useState<number | null>(null);
  const tiles = ["Hammer", "Shooting star", "Doji", "Marubozu"];
  const tone = ["#22d39a", "#3b82ff", "#ffc53d", "#8b5cff"];
  return (
    <div className="relative h-full px-4 pb-6">
      <div className="flex items-center gap-2.5">
        <span className="text-mist">✕</span>
        <div className="flex-1"><Bar value={55} tone="bull" h={14} /></div>
        <span className="flex gap-0.5">{[0, 1, 2].map((i) => <HeartIcon key={i} size={20} />)}</span>
      </div>
      <div className="mt-5 flex items-start gap-2">
        <Mascot size={64} mood={sel === null ? "think" : sel === 1 ? "happy" : "sad"} />
        <div className="panel-raised relative flex-1 p-2.5 text-[13px] font-bold leading-snug">Какой паттерн показывает разворот вверх после падения?</div>
      </div>
      <div className="panel-inset mt-4 flex h-24 items-end justify-center gap-2 px-3 pb-2">
        {[34, 30, 26, 22, 40].map((h, k) => (
          <div key={k} className="relative w-3.5" style={{ height: h }}>
            <div className="absolute -top-2 -bottom-2 left-1/2 w-0.5 -translate-x-1/2 bg-bear" />
            <div className="relative h-full rounded-sm bg-bear" />
          </div>
        ))}
        <div className="relative w-3.5" style={{ height: 42, animation: "float 2s infinite" }}>
          <div className="absolute -top-2 -bottom-3 left-1/2 w-0.5 -translate-x-1/2 bg-gold" />
          <div className="relative h-full rounded-sm bg-gold shadow-[0_0_14px_#ffc53d]" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {tiles.map((t, k) => {
          const on = sel === k;
          const col = on ? (k === 1 ? "#22d39a" : "#ff4f6d") : tone[k];
          return (
            <button key={t} onClick={() => { setSel(k); k === 1 ? sfx.correct() : sfx.wrong(); }} className="rounded-2xl border-2 p-2.5 text-left transition-all active:translate-y-1" style={{ borderColor: col, background: on ? `${col}22` : "#15264a", boxShadow: `0 4px 0 ${col}aa`, transform: on ? "translateY(3px)" : undefined }}>
              <span className="num text-[9px] font-bold text-mist">0{k + 1}</span>
              <div className="text-[12px] font-extrabold" style={{ color: on ? col : "#e8eeff" }}>{t}</div>
            </button>
          );
        })}
      </div>
      <div className="absolute inset-x-4 bottom-5">
        <Btn tone={sel === null ? "sky" : sel === 1 ? "bull" : "bear"} block size="lg" disabled={sel === null} onClick={() => setSel(null)}>{sel === null ? "Check" : "Continue"}</Btn>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- 03 · duel */
function ScreenDuel() {
  const [a, setA] = useState(62);
  const [b, setB] = useState(48);
  const [t, setT] = useState(7);
  useEffect(() => {
    const i = setInterval(() => {
      setA((x) => clampN(x + Math.random() * 14 - 4, 8, 100));
      setB((x) => clampN(x + Math.random() * 14 - 4, 8, 100));
      setT((v) => (v <= 1 ? 10 : v - 1));
    }, 1400);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#1a1f5c,#0a1224_70%)]">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute left-0 top-0 h-1/2 w-full bg-gradient-to-b from-sky/30 to-transparent" />
      <div className="absolute bottom-0 top-1/2 w-full bg-gradient-to-t from-bear/30 to-transparent" />
      <div className="relative flex h-full flex-col p-4 pt-12">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-b from-white to-sky font-black text-ink-900">Y</span>
          <div className="flex-1"><div className="text-[13px] font-extrabold">You</div><div className="mt-1 h-3 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full bg-gradient-to-r from-bull-d to-bull transition-all duration-1000" style={{ width: `${a}%` }} /></div></div>
          <span className="num text-[12px] font-extrabold text-bull">{a.toFixed(0)}</span>
        </div>
        <div className="my-3 grid place-items-center">
          <span key={t} className="num anim-pop grid h-14 w-14 place-items-center rounded-full border-4 border-gold/60 bg-ink-950 text-2xl font-black text-gold">{t}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-b from-white to-bear font-black text-ink-900">R</span>
          <div className="flex-1"><div className="text-right text-[13px] font-extrabold">RexBear</div><div className="mt-1 h-3 overflow-hidden rounded-full bg-ink-950"><div className="ml-auto h-full rounded-full bg-gradient-to-l from-bear-d to-bear transition-all duration-1000" style={{ width: `${b}%` }} /></div></div>
          <span className="num text-[12px] font-extrabold text-bear">{b.toFixed(0)}</span>
        </div>
        <div className="mt-auto pb-6">
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-ink-800/80 p-3 backdrop-blur">
            <span className="text-[12px] font-extrabold">Price breaks $70k resistance</span>
            <span className="flex gap-1 text-[11px]"><span className="rounded-md bg-bull/20 px-1.5 py-0.5 text-bull">+18</span><span className="rounded-md bg-bear/15 px-1.5 py-0.5 text-bear">0</span></span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button onClick={() => { setA((x) => x + 9); setB((x) => x - 6); sfx.coin(); }} className="btn3d !h-14 !rounded-2xl !text-[12px]" style={{ ["--c" as string]: "var(--color-bull)", ["--cd" as string]: "var(--color-bull-d)" }}>▲ Long</button>
            <button onClick={() => { setA((x) => x - 6); setB((x) => x + 9); sfx.tap(); }} className="btn3d !h-14 !rounded-2xl !text-[12px]" style={{ ["--c" as string]: "var(--color-bear)", ["--cd" as string]: "var(--color-bear-d)" }}>▼ Short</button>
          </div>
        </div>
      </div>
    </div>
  );
}
const clampN = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ----------------------------------------------------------- 04 · league */
function ScreenLeague() {
  const rows = [["Satoshi_V", 92, "#f7931a"], ["CandleQueen", 78, "#ff4f6d"], ["You", 71, "#3b82ff"], ["HODLer42", 66, "#22d39a"], ["WickHunter", 54, "#8b5cff"], ["BearTrap", 41, "#2bd9ff"]] as [string, number, string][];
  return (
    <div className="relative h-full overflow-y-auto pb-24 no-scrollbar">
      <div className="bg-gradient-to-b from-violet/40 to-transparent px-4 pb-5 pt-8 text-center">
        <div className="flex justify-center gap-1.5">
          {["#e39a62", "#d6e1ff", "#8ff3ff", "#2bd9ff", "#8b5cff"].map((c, k) => (
            <span key={c} className={cn("grid h-12 w-11 place-items-center", k === 3 && "scale-125")} style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: k <= 3 ? c : "#273f75" }}>
              {k === 3 && <Gem size={20} />}
            </span>
          ))}
        </div>
        <div className="font-display mt-3 text-lg font-extrabold">Diamond League</div>
        <div className="text-[11px] text-mist">Top 3 advance · 2 days left</div>
      </div>
      <div className="space-y-2 px-3">
        {rows.map(([n, v, c], k) => (
          <div key={n} className={cn("anim-slide-right flex items-center gap-2.5 rounded-2xl p-2.5", n === "You" ? "bg-sky/15 ring-2 ring-sky" : "bg-ink-800")} style={{ animationDelay: `${k * 70}ms`, boxShadow: n === "You" ? undefined : "0 3px 0 #060b18" }}>
            <span className={cn("num w-4 text-center font-black", k < 3 ? "text-bull" : "text-mist")}>{k + 1}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full font-black text-ink-900" style={{ background: `linear-gradient(160deg,#fff,${c} 60%)` }}>{n[0]}</span>
            <div className="flex-1">
              <div className="text-[12px] font-extrabold">{n}</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full" style={{ width: `${v}%`, background: c, transition: "width .8s" }} /></div>
            </div>
            <span className="num text-[11px] font-bold text-mist">{Math.round(v * 21)}xp</span>
          </div>
        ))}
      </div>
      <TabBar active={3} />
    </div>
  );
}

/* ------------------------------------------------------------ 05 · store */
function ScreenStore() {
  const packs = [[500, "$4.99"], [1200, "$9.99"], [3000, "$19.99"]];
  const [sel, setSel] = useState(1);
  return (
    <div className="relative h-full overflow-y-auto pb-24 no-scrollbar">
      <div className="mx-4 mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-violet to-violet-d p-4 text-center shadow-[0_5px_0_#2a1570]">
        <div className="font-display text-lg font-black">CandleQuest PRO</div>
        <div className="mt-1 text-[11px] text-white/80">Безлимитные жизни · разбор сделок · без рекламы</div>
        <div className="mx-auto mt-3 w-fit rounded-xl bg-gold px-4 py-1.5 text-[12px] font-black text-ink-900 anim-float">Try free 7 days</div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 px-4">
        {packs.map(([g, p], k) => (
          <button key={g} onClick={() => { setSel(k); sfx.tick(); }} className={cn("relative rounded-2xl border-2 px-1 pb-2 pt-3 transition-all", sel === k ? "-translate-y-1 border-cyan bg-cyan/10 shadow-[0_6px_0_#1395b8]" : "border-ink-500 bg-ink-800 shadow-[0_4px_0_#0f1c3a]")}>
            {k === 2 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-1.5 text-[8px] font-black text-ink-900">BEST</span>}
            <div className="mx-auto w-fit"><GemIcon size={34} /></div>
            <div className="num text-[13px] font-extrabold text-cyan">{g}</div>
            <div className="num text-[10px] font-bold text-mist">{p}</div>
          </button>
        ))}
      </div>
      <div className="mt-5 px-4 text-[11px] font-extrabold uppercase text-mist">Battle pass · level 14</div>
      <div className="mt-2 flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
        {[ChestIcon, GemIcon, ShieldIcon, BoltIcon, TrophyIcon, CoinIcon].map((I, k) => (
          <div key={k} className={cn("relative grid h-20 w-16 shrink-0 place-items-center rounded-2xl border-2", k < 4 ? "border-gold/60 bg-gold/10" : "border-ink-500 bg-ink-800")} style={k === 4 ? { animation: "glow-pulse 1.6s infinite" } : undefined}>
            <I size={38} style={{ filter: k < 4 ? undefined : "grayscale(.7) brightness(.7)" }} />
            <span className="num absolute bottom-1 text-[8px] font-bold text-mist">lv{k + 15}</span>
            {k < 4 && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-bull text-[10px] font-black text-ink-900">✓</span>}
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2 px-4">
        {[["Streak Freeze", FlameIcon, "200 💎"], ["Refill hearts", HeartIcon, "350 💎"], ["Loss Shield", ShieldIcon, "450 💎"]].map(([n, I, p]) => {
          const Icon = I as typeof FlameIcon;
          return (
            <div key={n as string} className="flex items-center gap-3 rounded-2xl bg-ink-800 p-2.5 shadow-[0_3px_0_#060b18]">
              <Icon size={32} />
              <span className="flex-1 text-[12px] font-extrabold">{n as string}</span>
              <span className="num rounded-xl bg-cyan/15 px-2 py-1.5 text-[11px] font-extrabold text-cyan">{p as string}</span>
            </div>
          );
        })}
      </div>
      <TabBar active={1} />
    </div>
  );
}

/* ---------------------------------------------------------- 06 · profile */
function ScreenProfile() {
  const week = [45, 72, 38, 88, 64, 96, 80];
  const [tab, setTab] = useState(0);
  return (
    <div className="relative h-full overflow-y-auto pb-24 no-scrollbar">
      <div className="bg-gradient-to-br from-sky-d to-violet-d px-4 pb-14 pt-7 text-center">
        <div className="mx-auto w-fit anim-float"><Mascot size={110} mood="happy" /></div>
        <div className="font-display text-lg font-extrabold">Alex Trader</div>
        <div className="text-[11px] text-white/70">@alex_hodl · Lv 12</div>
      </div>
      <div className="-mt-9 grid grid-cols-3 gap-2 px-4">
        {[["Streak", "47", "#ff8a3d"], ["XP", "12.4k", "#ffc53d"], ["Gems", "1280", "#2bd9ff"]].map(([l, v, c], k) => (
          <div key={l} className="anim-pop rounded-2xl bg-ink-800 p-2.5 text-center shadow-[0_3px_0_#060b18]" style={{ animationDelay: `${k * 80}ms` }}>
            <div className="num text-base font-black" style={{ color: c }}>{v}</div>
            <div className="text-[8px] font-bold uppercase text-mist">{l}</div>
          </div>
        ))}
      </div>
      <div className="mx-4 mt-4 grid grid-cols-2 gap-1 rounded-xl bg-ink-900 p-1">
        {["Activity", "Badges"].map((t, k) => (
          <button key={t} onClick={() => setTab(k)} className={cn("h-8 rounded-lg text-[11px] font-extrabold", tab === k ? "bg-ink-600 text-white shadow-[0_2px_0_#060b18]" : "text-mist")}>{t}</button>
        ))}
      </div>
      {tab === 0 ? (
        <div className="mx-4 mt-4">
          <div className="mb-2 flex justify-between text-[11px] font-bold"><span className="text-mist">XP this week</span><span className="num text-bull">+1 840</span></div>
          <div className="flex h-28 items-end gap-2">
            {week.map((h, k) => (
              <div key={k} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full origin-bottom rounded-lg bg-gradient-to-t from-sky-d to-sky shadow-[inset_0_2px_0_rgba(255,255,255,.3)]" style={{ height: `${h}%`, animation: `bar-grow .6s ${k * 70}ms both cubic-bezier(.3,1.5,.5,1)` }} />
                <span className="text-[8px] font-bold text-mist">{"MTWTFSS"[k]}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-4 mt-4 grid grid-cols-4 gap-2">
          {[ShieldIcon, TargetIcon, FlameIcon, TrophyIcon, GemIcon, StarIcon, CandleUpIcon, CoinIcon].map((I, k) => (
            <div key={k} className="grid aspect-square place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#060b18]">
              <I size={30} style={{ filter: k > 4 ? "grayscale(1) brightness(.55)" : undefined }} />
            </div>
          ))}
        </div>
      )}
      <div className="mx-4 mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-ink-500 p-3">
        <CandleDownIcon size={26} />
        <span className="text-[11px] text-mist">Последняя симуляция: <span className="font-bold text-bear">−2.4%</span> — пропущен стоп-лосс</span>
      </div>
      <TabBar active={4} />
    </div>
  );
}

/* -------------------------------------------------- carousel with 3D tilt */
const screens: { label: string; tag: string; el: () => ReactNode }[] = [
  { label: "Path", tag: "Карта обучения", el: () => <ScreenPath /> },
  { label: "Question", tag: "Квиз-карточка", el: () => <ScreenQuestion /> },
  { label: "Duel", tag: "PvP в реальном времени", el: () => <ScreenDuel /> },
  { label: "League", tag: "Лига и прогресс", el: () => <ScreenLeague /> },
  { label: "Store", tag: "Магазин и Battle pass", el: () => <ScreenStore /> },
  { label: "Profile", tag: "Профиль игрока", el: () => <ScreenProfile /> },
];
function ScreensGallery() {
  const box = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [off, setOff] = useState({ l: 0, w: 1 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const on = () => { setOff({ l: el.scrollLeft, w: el.clientWidth }); setIdx(Math.round(el.scrollLeft / (300 + 48))); };
    on();
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  const step = 348;
  const go = (n: number) => { const x = Math.max(0, Math.min(screens.length - 1, n)); box.current?.scrollTo({ left: x * step, behavior: "smooth" }); sfxRaw.swipe(); };
  return (
    <section id="screens" className="scroll-mt-24">
      <div className="mb-6 flex items-end gap-4">
        <div className="font-display text-5xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#2c4580] sm:text-6xl">S</div>
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Game Screens</h2>
          <p className="text-sm text-mist">Шесть ключевых экранов в едином разрешении. Все живые: нажимай, листай, переключай.</p>
        </div>
        <div className="ml-auto hidden gap-2 sm:flex">
          <button onClick={() => go(idx - 1)} className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 shadow-[0_4px_0_#08112a] active:translate-y-1 active:shadow-none"><ChevronLeft size={18} /></button>
          <button onClick={() => go(idx + 1)} className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 shadow-[0_4px_0_#08112a] active:translate-y-1 active:shadow-none"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div
        ref={box}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-12 overflow-x-auto py-6 [perspective:1600px] active:cursor-grabbing"
        onPointerDown={(e) => { const el = e.currentTarget; el.dataset.sx = String(e.clientX); el.dataset.sl = String(el.scrollLeft); el.style.scrollSnapType = "none"; }}
        onPointerMove={(e) => { const el = e.currentTarget; if (!el.dataset.sx) return; const dx = e.clientX - Number(el.dataset.sx); if (Math.abs(dx) > 4) el.scrollLeft = Number(el.dataset.sl) - dx; }}
        onPointerUp={(e) => { const el = e.currentTarget; delete el.dataset.sx; delete el.dataset.sl; el.style.scrollSnapType = "x mandatory"; }}
        onPointerLeave={(e) => { const el = e.currentTarget; delete el.dataset.sx; delete el.dataset.sl; el.style.scrollSnapType = "x mandatory"; }}
      >
        {screens.map((s, i) => {
          const cx = i * step + 146 - off.l - off.w / 2;
          const dist = Math.min(1, Math.abs(cx) / (step * 1.4));
          return (
            <div
              key={s.label}
              className="shrink-0 snap-center"
              style={{ transform: `rotateY(${-cx * 0.055}deg) translateZ(${-dist * 240}px) translateY(${dist * 18}px) scale(${1 - dist * 0.1})`, opacity: 1 - dist * 0.55, transition: "transform .6s cubic-bezier(.3,1.2,.5,1), opacity .5s" }}
            >
              <Phone label={s.label} tag={s.tag}>{s.el()}</Phone>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        {screens.map((s, i) => (
          <button key={s.label} onClick={() => go(i)} className={cn("h-2.5 rounded-full transition-all", i === idx ? "w-7 bg-sky shadow-[0_0_10px_#3b82ff]" : "w-2.5 bg-ink-500")} aria-label={s.label} />
        ))}
        <Chip tone="gold"><LogoMark size={13} variant="mono" style={{ color: "#ffc53d" }} /> {screens.length} screens</Chip>
      </div>
    </section>
  );
}

export default function Screens() {
  return <ScreensGallery />;
}
