import { useCallback, useEffect, useRef, useState } from "react";
import { Btn, FilterCtx, Icon } from "./ui/kit";
import { PhoneHero } from "./ui/PhoneHero";
import { GameHud, GameProvider, SkillRadar } from "./game/engine";
import { useGame } from "./game/ctx";
import { feel } from "./game/sfx";
import { useTilt, useWindowScroll } from "./ui/hooks";
import Prototype from "./sections/Prototype";
import Gameplay1 from "./sections/Gameplay1";
import Gameplay2 from "./sections/Gameplay2";
import Gameplay3 from "./sections/Gameplay3";
import GameplayHub from "./sections/GameplayHub";
import Arcade from "./sections/Arcade";
import FxLab from "./sections/FxLab";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import Gamification from "./sections/Gamification";
import Trading from "./sections/Trading";
import NavData from "./sections/NavData";
import Feedback from "./sections/Feedback";
import Carousels from "./sections/Carousels";
import Carousels2 from "./sections/Carousels2";
import Sliders from "./sections/Sliders";
import Sliders2 from "./sections/Sliders2";
import Gestures from "./sections/Gestures";
import Gestures2 from "./sections/Gestures2";
import ScrollSection from "./sections/Scroll";
import Scroll2 from "./sections/Scroll2";
import Micro from "./sections/Micro";
import Transitions from "./sections/Transitions";
import LiveOps from "./sections/LiveOps";
import { cn } from "./utils/cn";

const NAV = [
  { id: "play", t: "Playable Game", i: "play", n: 1, c: "#2ee59d", g: "Gameplay" },
  { id: "learn", t: "Learn Exercises", i: "book", n: 10, c: "#2ee59d", g: "Gameplay" },
  { id: "practice", t: "Practice Sims", i: "candle", n: 10, c: "#3d8bff", g: "Gameplay" },
  { id: "advanced", t: "Advanced", i: "sparkles", n: 8, c: "#5ce1ff", g: "Gameplay" },
  { id: "hub", t: "Progression", i: "crown", n: 8, c: "#ffc53d", g: "Gameplay" },
  { id: "game", t: "Game Layer", i: "trophy", n: 10, c: "#ffc53d", g: "Gameplay" },
  { id: "liveops", t: "LiveOps", i: "gift", n: 8, c: "#ff8a3d", g: "Gameplay" },
  { id: "arcade", t: "Arcade", i: "rocket", n: 10, c: "#ff4d6a", g: "Arcade" },
  { id: "fxlab", t: "FX Lab", i: "sparkles", n: 10, c: "#a174ff", g: "Arcade" },
  { id: "foundations", t: "Foundations", i: "grid", n: 5, c: "#3d8bff", g: "System" },
  { id: "controls", t: "Controls", i: "target", n: 6, c: "#2ee59d", g: "System" },
  { id: "trading", t: "Trading", i: "chart", n: 8, c: "#ff4d6a", g: "System" },
  { id: "navigation", t: "Navigation", i: "home", n: 4, c: "#a174ff", g: "System" },
  { id: "data", t: "Data Display", i: "news", n: 6, c: "#ff8a3d", g: "System" },
  { id: "feedback", t: "Feedback", i: "bell", n: 7, c: "#5ce1ff", g: "System" },
  { id: "carousels", t: "Carousels I", i: "swap", n: 10, c: "#ff7ab6", g: "Motion" },
  { id: "carousels2", t: "Carousels II", i: "swap", n: 10, c: "#ff7ab6", g: "Motion" },
  { id: "sliders", t: "Sliders I", i: "filter", n: 9, c: "#ffc53d", g: "Motion" },
  { id: "sliders2", t: "Sliders II", i: "filter", n: 10, c: "#ffc53d", g: "Motion" },
  { id: "gestures", t: "Gestures I", i: "user", n: 9, c: "#2ee59d", g: "Motion" },
  { id: "gestures2", t: "Gestures II", i: "user", n: 10, c: "#2ee59d", g: "Motion" },
  { id: "scroll", t: "Scroll FX I", i: "down", n: 8, c: "#3d8bff", g: "Motion" },
  { id: "scroll2", t: "Scroll FX II", i: "down", n: 11, c: "#3d8bff", g: "Motion" },
  { id: "micro", t: "Micro FX", i: "sparkles", n: 9, c: "#a174ff", g: "Motion" },
  { id: "transitions", t: "Transitions", i: "swap", n: 8, c: "#5ce1ff", g: "Motion" },
];
const TOTAL = NAV.reduce((a, b) => a + b.n, 0);
const GROUPS = ["Gameplay", "Arcade", "System", "Motion"];

/* ───── isolated FX components (own re-render scope) ───── */
function ScrollProgress() {
  const s = useWindowScroll();
  const R = 20, C = 2 * Math.PI * R;
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px]">
        <div className="h-full origin-left bg-gradient-to-r from-bull via-sky to-violet shadow-[0_0_12px_#3d8bff]" style={{ transform: `scaleX(${s.p})` }} />
      </div>
      <button onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); feel("whoosh"); }} aria-label="Back to top"
        className={cn("raised fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(.3,1.5,.5,1)]", s.y > 800 ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-10 scale-50 opacity-0")}>
        <svg width="52" height="52" className="absolute -rotate-90"><circle cx="26" cy="26" r={R} stroke="#081130" strokeWidth="3" fill="none" /><circle cx="26" cy="26" r={R} stroke="#2ee59d" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - s.p)} /></svg>
        <Icon name="chevU" size={20} stroke={3} className="text-white" />
      </button>
    </>
  );
}

function CursorGlow() {
  const m = useTilt();
  return <div className="pointer-events-none fixed inset-0 z-0 hidden md:block" style={{ background: `radial-gradient(600px circle at ${(m.x + 1) * 50}% ${(m.y + 1) * 50}%, rgba(61,139,255,.07), transparent 60%)` }} />;
}

const FLOATERS = [
  { i: "coin", x: 6, y: 18, d: 0.9, s: 44, c: "#ffc53d" }, { i: "candle", x: 44, y: 8, d: 0.4, s: 30, c: "#2ee59d" },
  { i: "gem", x: 88, y: 12, d: 1.2, s: 38, c: "#a174ff" }, { i: "bolt", x: 52, y: 78, d: 0.7, s: 34, c: "#ffc53d" },
  { i: "trendUp", x: 2, y: 70, d: 0.5, s: 36, c: "#2ee59d" }, { i: "shield", x: 94, y: 64, d: 1, s: 32, c: "#3d8bff" },
  { i: "flame", x: 36, y: 92, d: 1.4, s: 28, c: "#ff8a3d" },
];
function HeroParallax() {
  const m = useTilt();
  const s = useWindowScroll();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOATERS.map((f, i) => (
        <div key={i} className="absolute" style={{ left: `${f.x}%`, top: `${f.y}%`, transform: `translate3d(${m.x * f.d * 30}px, ${m.y * f.d * 20 - s.y * f.d * 0.35}px, 0) rotate(${m.x * f.d * 12 + s.y * 0.02 * f.d}deg)`, opacity: Math.max(0, 1 - s.y / 700) }}>
          <div className="grid place-items-center rounded-2xl p-2.5" style={{ background: `${f.c}14`, boxShadow: `inset 0 0 0 1px ${f.c}33, 0 0 30px ${f.c}22`, animation: `floaty ${3 + i * 0.4}s ease-in-out ${i * 0.3}s infinite` }}>
            <Icon name={f.i} size={f.s} variant="duo" style={{ color: f.c, filter: `blur(${f.d < 0.6 ? 1.2 : 0}px)` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneTilt() {
  const m = useTilt();
  const s = useWindowScroll();
  return (
    <div style={{ perspective: 1200 }}>
      <div style={{ transform: `rotateY(${m.x * -8}deg) rotateX(${m.y * 6 + Math.min(20, s.y * 0.03)}deg) translateY(${s.y * -0.12}px)`, transition: "transform .2s ease-out" }}>
        <PhoneHero />
      </div>
    </div>
  );
}

function TouchedMeter() {
  const g = useGame();
  const pct = Math.round((g.touched / TOTAL) * 100);
  return (
    <div className="panel mt-3 p-4">
      <div className="mb-1 flex items-center justify-between"><span className="text-xs font-extrabold text-white">Explorer quest</span><span className="font-mono text-[10px] font-bold text-gold">{g.touched}/{TOTAL}</span></div>
      <div className="well h-2.5 overflow-hidden rounded-full"><div className="h-full rounded-full bg-gradient-to-r from-gold to-flame transition-[width] duration-700" style={{ width: `${pct}%` }} /></div>
      <div className="mt-1.5 text-[10px] font-semibold text-ink-400">Коснись каждого ассета — +5 XP за первый раз</div>
    </div>
  );
}

function HeroStats() {
  const g = useGame();
  return (
    <div className="mt-10 grid max-w-lg grid-cols-4 gap-3">
      {[[String(TOTAL), "assets", "#2ee59d"], ["37", "exercises", "#3d8bff"], [String(g.daily.done) + "/" + g.daily.goal, "daily goal", "#ffc53d"], ["10", "arcade", "#ff4d6a"]].map(([v, l, c], i) => (
        <div key={l} className="raised rounded-2xl px-2 py-3 text-center" style={{ animation: `fadeUp .5s ease ${0.3 + i * 0.1}s both` }}>
          <div className="font-mono text-xl font-extrabold" style={{ color: c }}>{v}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Catalog />
    </GameProvider>
  );
}

function Catalog() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState("play");
  const [toast, setToast] = useState<{ id: number; m: string } | null>(null);
  const tRef = useRef<number | undefined>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const notify = useCallback((m: string) => {
    setToast({ id: Date.now(), m });
    clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: "-30% 0px -60% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") { setQ(""); searchRef.current?.blur(); }
    };
    window.addEventListener("keydown", key);
    return () => { obs.disconnect(); window.removeEventListener("keydown", key); };
  }, []);

  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    if (el && navRef.current) navRef.current.scrollTo({ left: el.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  const activeColor = NAV.find((n) => n.id === active)?.c ?? "#3d8bff";

  return (
    <FilterCtx.Provider value={{ q, notify }}>
      <div className="bg-app relative min-h-screen text-ink-100" style={{ ["--accent" as string]: activeColor }}>
        <CursorGlow />
        <ScrollProgress />
        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6">
            <a href="#top" className="flex shrink-0 items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-b from-bull to-bull-edge shadow-[0_4px_0_#0b7a4d,inset_0_1px_0_#fff8]"><Icon name="candle" size={22} stroke={2.8} className="text-ink-900" /></span>
              <div className="hidden leading-none sm:block">
                <div className="text-lg font-extrabold tracking-tight text-white">PIPWISE</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">Game UI System · v5</div>
              </div>
            </a>
            <div className="well ml-2 hidden h-11 w-full max-w-xs items-center gap-2 rounded-2xl px-3 focus-within:shadow-[inset_0_3px_8px_#0008,0_0_0_2px_#3d8bff] lg:flex">
              <Icon name="search" size={18} className="text-ink-400" />
              <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="swipe, replay, GPP-01…" className="w-full min-w-0 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-ink-500" />
              {q ? <button onClick={() => setQ("")}><Icon name="x" size={16} className="text-ink-400 hover:text-white" /></button> : <kbd className="rounded-md bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-400">⌘K</kbd>}
            </div>
            <div className="ml-auto"><GameHud /></div>
          </div>
        </header>

        <div className="relative mx-auto flex max-w-[1600px] gap-8 px-4 sm:px-6">
          <aside className="no-scrollbar sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 flex-col gap-0.5 overflow-y-auto py-6 xl:flex">
            {GROUPS.map((gname) => (
              <div key={gname} className="mb-2">
                <div className="mb-1 px-3 text-[10px] font-extrabold uppercase tracking-[.18em] text-ink-500">{gname}</div>
                {NAV.filter((n) => n.g === gname).map((n) => {
                  const on = active === n.id;
                  return (
                    <a key={n.id} href={`#${n.id}`} onClick={() => feel("tap", 5)} className={cn("group relative flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-all duration-300", on ? "raised translate-x-1" : "hover:translate-x-1 hover:bg-white/[.03]")}>
                      {on && <span className="absolute -left-1 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full" style={{ background: n.c, boxShadow: `0 0 10px ${n.c}` }} />}
                      <span className="grid h-7 w-7 place-items-center rounded-lg transition-transform group-hover:scale-110" style={{ background: on ? `${n.c}26` : "transparent" }}><Icon name={n.i} size={15} variant={on ? "duo" : "line"} style={{ color: on ? n.c : "#5a70ad" }} /></span>
                      <span className={cn("flex-1 text-[13px] font-extrabold", on ? "text-white" : "text-ink-300")}>{n.t}</span>
                      <span className="rounded-md bg-ink-900/70 px-1.5 font-mono text-[10px] font-bold text-ink-400">{n.n}</span>
                    </a>
                  );
                })}
              </div>
            ))}
            <SkillRadar />
            <TouchedMeter />
          </aside>

          <main id="top" className="min-w-0 flex-1 pb-24">
            <section className="relative grid items-center gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:py-16">
              <HeroParallax />
              <div className="relative anim-fade-up">
                <span className="inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-gold ring-1 ring-gold/30"><Icon name="trophy" size={14} variant="solid" />Award-grade game UI system</span>
                <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
                  Learn to trade.<br />
                  <span className="bg-gradient-to-r from-bull via-sky to-violet bg-[length:200%_auto] bg-clip-text text-transparent" style={{ animation: "gradientShift 6s ease-in-out infinite" }}>Feel every tap.</span>
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-300">
                  {TOTAL} живых ассетов для мобильной игры по крипто-трейдингу, связанных одним движком: 37 обучающих механик и 10 аркад прокачивают 5 навыков, наполняют дневную цель и радар в сайдбаре. XP и гемы летят в HUD, комбо, звук, вибрация, гироскоп-параллакс, искры на каждый клик.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#play"><Btn v="bull" size="lg"><Icon name="play" size={18} variant="solid" />Play the game</Btn></a>
                  <a href="#learn"><Btn v="gold" size="lg"><Icon name="book" size={18} />37 exercises</Btn></a>
                  <a href="#arcade"><Btn v="bear" size="lg"><Icon name="rocket" size={18} />Arcade</Btn></a>
                  <a href="#carousels"><Btn v="ghost" size="lg"><Icon name="swap" size={18} />Motion library</Btn></a>
                </div>
                <HeroStats />
              </div>
              <div className="relative"><PhoneTilt /></div>
            </section>

            <nav ref={navRef} className="no-scrollbar sticky top-16 z-30 -mx-4 mb-8 flex gap-2 overflow-x-auto bg-ink-900/85 px-4 py-3 backdrop-blur-xl xl:hidden">
              {NAV.map((n) => (
                <a key={n.id} data-nav={n.id} href={`#${n.id}`} className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition-all", active === n.id ? "raised text-white" : "bg-ink-800 text-ink-400")}>
                  <Icon name={n.i} size={14} style={{ color: n.c }} />{n.t}
                </a>
              ))}
            </nav>

            {q && <div className="mb-8 rounded-2xl bg-sky/10 px-4 py-3 text-sm font-bold text-sky ring-1 ring-sky/30">Фильтр: «{q}» — показаны только совпадающие ассеты (Esc — сброс).</div>}

            <div className="space-y-24">
              {!q && <Prototype />}
              <Gameplay1 />
              <Gameplay2 />
              <Gameplay3 />
              <GameplayHub />
              <Gamification />
              <LiveOps />
              <Arcade />
              <FxLab />
              <Foundations />
              <Controls />
              <Trading />
              <NavData />
              <Feedback />
              <Carousels />
              <Carousels2 />
              <Sliders />
              <Sliders2 />
              <Gestures />
              <Gestures2 />
              {!q && <ScrollSection />}
              {!q && <Scroll2 />}
              <Micro />
              <Transitions />
            </div>

            <footer className="mt-24 flex flex-col items-center gap-3 border-t border-white/5 pt-10 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-bull to-bull-edge shadow-[0_4px_0_#0b7a4d]"><Icon name="candle" size={24} stroke={2.8} className="text-ink-900" /></span>
              <div className="text-sm font-extrabold text-white">PIPWISE Tactile Game UI</div>
              <div className="text-xs text-ink-400">Dark navy · volumetric surfaces · physics · haptics · sound · gyro · built for crypto education</div>
            </footer>
          </main>
        </div>

        {toast && (
          <div key={toast.id} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <div className="glass flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-extrabold text-white anim-pop">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-bull"><Icon name="check" size={14} stroke={3.4} className="text-ink-900" /></span>
              {toast.m}
            </div>
          </div>
        )}
      </div>
    </FilterCtx.Provider>
  );
}
