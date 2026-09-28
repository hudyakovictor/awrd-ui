import { useEffect, useRef, useState } from "react";
import { FilterCtx, Btn, Chip, SECTION_ORDER } from "./components/ui";
import { FlameIcon, GemIcon, HeartIcon, Icon, TrophyIcon, XPIcon, BullIcon, CoinIcon } from "./components/icons";
import { FxLayer, GameProvider, PlayerHUD } from "./lib/game";
import { CountUp, Tilt, usePointerParallax, useScrollFrame } from "./lib/motion";
import { CombatTextLayer, CursorTrail } from "./lib/fx2";
import { sfx } from "./lib/sound";
import { AchievementToasts, CommandPalette, DailyGift, OnboardingTour, SettingsDrawer, loadPrefs, type Prefs } from "./components/overlays";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import Navigation from "./sections/Navigation";
import Gameplay from "./sections/Gameplay";
import Motion from "./sections/Motion";
import Playground from "./sections/Playground";
import Progression from "./sections/Progression";
import DataDisplay from "./sections/DataDisplay";
import Feedback from "./sections/Feedback";
import { cn } from "./utils/cn";

const NAV: Record<string, { l: string; i: string }> = {
  gameplay: { l: "Gameplay", i: "brain" },
  motion: { l: "Motion", i: "sparkle" },
  playground: { l: "Playground", i: "bolt" },
  progression: { l: "Progression", i: "trophy" },
  data: { l: "Trading & Data", i: "candle" },
  controls: { l: "Controls", i: "grid" },
  navigation: { l: "Navigation", i: "flag" },
  feedback: { l: "Feedback", i: "bell" },
  foundations: { l: "Foundations", i: "layers" },
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-[#4fe8b3] to-bull shadow-[0_4px_0_#0c8f63,inset_0_2px_0_rgba(255,255,255,.35)]">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#03281b" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l5-5 4 3 7-8" />
          <path d="M15 7h5v5" />
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-display text-base font-black tracking-tight text-white">TRADELINGO</div>
        <div className="text-[9px] font-bold uppercase tracking-[0.25em] text-ink-400">Tactile Game UI Kit</div>
      </div>
    </div>
  );
}

function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useScrollFrame((i) => {
    if (bar.current) bar.current.style.transform = `scaleX(${i.p})`;
  });
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-transparent">
      <div ref={bar} className="h-full origin-left bg-gradient-to-r from-bull via-cyan to-violet shadow-[0_0_10px_rgba(47,212,255,.7)]" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);
  useScrollFrame((i) => {
    setShow(i.y > 700);
    if (ring.current) ring.current.style.strokeDashoffset = String(125.6 * (1 - i.p));
  });
  return (
    <button
      onClick={() => {
        sfx("whoosh");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={cn(
        "fixed bottom-24 right-4 z-[65] flex h-12 w-12 items-center justify-center rounded-full bg-ink-800/90 text-white shadow-[0_5px_0_#081231] ring-1 ring-white/10 backdrop-blur transition-all duration-500 hover:-translate-y-1 sm:bottom-5 sm:right-5",
        show ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0",
      )}
      aria-label="Back to top"
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle ref={ring} cx="24" cy="24" r="20" fill="none" stroke="#2fd4ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset="125.6" />
      </svg>
      <Icon name="arrowUp" size={18} stroke={3} />
    </button>
  );
}

function PhoneMock() {
  return (
    <Tilt max={14} scale={1.02} className="mx-auto w-[270px] rounded-[42px]">
      <div className="relative rounded-[42px] bg-gradient-to-b from-ink-500 to-ink-800 p-2.5 shadow-[0_10px_0_#081231,0_40px_80px_-20px_rgba(0,0,0,.8)] ring-1 ring-white/10">
        <div className="relative overflow-hidden rounded-[34px] bg-ink-900">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          <div className="flex items-center justify-between px-4 pb-2 pt-9">
            <span className="flex items-center gap-1 font-display text-xs font-black text-flame">
              <FlameIcon size={18} className="anim-flicker" />
              47
            </span>
            <span className="flex items-center gap-1 font-display text-xs font-black text-cyan">
              <GemIcon size={16} />
              1.2k
            </span>
            <span className="flex items-center gap-1 font-display text-xs font-black text-bear">
              <HeartIcon size={16} className="anim-heart" />5
            </span>
          </div>
          <div className="mx-3 rounded-2xl p-3 text-ink-950" style={{ background: "linear-gradient(135deg,#22d39a,#0e9e70)", boxShadow: "0 4px 0 #0a6b4a" }}>
            <div className="text-[8px] font-black uppercase opacity-70">Unit 2</div>
            <div className="font-display text-xs font-black">Reading Candlesticks</div>
          </div>
          <div className="flex flex-col items-center gap-3 py-5">
            {[0, 34, 50, 34, 0].map((x, i) => (
              <div key={i} style={{ transform: `translateX(${x}px) translateZ(${20 + i * 6}px)` }}>
                <div className={cn("btn3d h-12 w-14 rounded-[50%] [--depth:5px]", i < 2 ? "v-gold" : i === 2 ? "v-bull anim-pulse-ring" : "v-ghost")}>
                  {i < 2 ? <Icon name="check" size={20} stroke={3.4} /> : i === 2 ? <Icon name="star" size={20} stroke={3} /> : i === 4 ? <TrophyIcon size={22} /> : <Icon name="lock" size={16} className="text-ink-500" />}
                </div>
              </div>
            ))}
          </div>
          <div className="mx-2 mb-2 flex rounded-2xl bg-ink-800 p-1.5">
            {["home", "chart", "trophy", "target", "user"].map((n, i) => (
              <div key={n} className={cn("flex flex-1 justify-center rounded-xl py-1.5", i === 0 ? "bg-azure/15 text-azure ring-1 ring-azure/60" : "text-ink-500")}>
                <Icon name={n} size={17} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="anim-float absolute -left-16 top-24 hidden rounded-2xl bg-ink-800 p-2.5 shadow-[0_5px_0_#081231] ring-1 ring-white/10 sm:block" style={{ transform: "translateZ(60px)" }}>
        <div className="flex items-center gap-2">
          <BullIcon size={28} />
          <div>
            <div className="text-[9px] font-bold uppercase text-ink-400">Prediction</div>
            <div className="font-mono text-xs font-bold text-bull">+20 XP</div>
          </div>
        </div>
      </div>
      <div className="anim-float absolute -right-14 bottom-28 hidden rounded-2xl bg-ink-800 p-2.5 shadow-[0_5px_0_#081231] ring-1 ring-white/10 sm:block" style={{ animationDelay: "1s", transform: "translateZ(80px)" }}>
        <div className="flex items-center gap-2">
          <XPIcon size={24} />
          <div className="font-display text-sm font-black text-gold">LVL 12</div>
        </div>
      </div>
      <div className="anim-float absolute -right-6 top-10 hidden sm:block" style={{ animationDelay: ".5s", transform: "translateZ(100px)" }}>
        <CoinIcon size={40} />
      </div>
    </Tilt>
  );
}

function Hero() {
  const hero = useRef<HTMLDivElement>(null);
  const orbs = useRef<(HTMLDivElement | null)[]>([]);
  const content = useRef<HTMLDivElement>(null);
  const ptr = useRef({ x: 0, y: 0 });
  const sy = useRef(0);
  const apply = () => {
    const D = [0.25, -0.18, 0.4];
    orbs.current.forEach((o, i) => {
      if (o) o.style.transform = `translate3d(${ptr.current.x * 40 * (i + 1)}px, ${sy.current * D[i] + ptr.current.y * 30}px, 0)`;
    });
    if (content.current) {
      content.current.style.transform = `translate3d(0, ${sy.current * 0.18}px, 0)`;
      content.current.style.opacity = String(Math.max(0, 1 - sy.current / 700));
    }
  };
  usePointerParallax(hero, (x, y) => {
    ptr.current = { x, y };
    apply();
  });
  useScrollFrame((i) => {
    sy.current = Math.min(i.y, 900);
    apply();
  });
  const words = ["Tactile", "Game", "UI"];
  return (
    <div ref={hero} className="panel relative overflow-hidden rounded-[32px] p-6 sm:p-10">
      <div ref={(el) => { orbs.current[0] = el; }} className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-violet/25 blur-3xl" />
      <div ref={(el) => { orbs.current[1] = el; }} className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-bull/15 blur-3xl" />
      <div ref={(el) => { orbs.current[2] = el; }} className="absolute left-[-60px] top-1/3 h-60 w-60 rounded-full bg-azure/20 blur-3xl" />
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_30%_40%,#000,transparent_70%)]" />
      <div ref={content} className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap gap-2" style={{ animation: "slide-up .6s both" }}>
            <Chip tone="gold">★ Award-grade</Chip>
            <Chip tone="azure">Neo-tactile 3D</Chip>
            <Chip tone="bull">● 130 live assets</Chip>
            <Chip tone="violet">🔊 Sound + haptics</Chip>
          </div>
          <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            <span className="flex flex-wrap gap-x-4">
              {words.map((w, i) => (
                <span key={w} className="text-gradient-hero inline-block" style={{ animation: `letter-pop .7s ${0.1 + i * 0.12}s cubic-bezier(.3,1.5,.5,1) both` }}>
                  {w}
                </span>
              ))}
            </span>
            <span className="block text-white" style={{ animation: "slide-up .7s .5s both" }}>
              for crypto trading education
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base font-semibold text-ink-300" style={{ animation: "slide-up .7s .65s both" }}>
            A full catalog for a Duolingo-grade trading academy. It has 42 playable mini-games and 43 motion patterns (carousels, swipes, parallax, scroll-driven stories), plus a tuning playground. All of them run on one economy: earn XP, coins and gems anywhere and watch them fly into your dock.
          </p>
          <div className="mt-7 flex flex-wrap gap-3" style={{ animation: "slide-up .7s .8s both" }}>
            <a href="#gameplay">
              <Btn variant="bull" size="lg" sound="go">
                <Icon name="play" size={18} /> Play the games
              </Btn>
            </a>
            <a href="#motion">
              <Btn variant="ghost" size="lg">
                <Icon name="sparkle" size={18} /> Motion & gestures
              </Btn>
            </a>
            <a href="#playground">
              <Btn variant="violet" size="lg">
                <Icon name="bolt" size={18} /> Open playground
              </Btn>
            </a>
          </div>
          <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: 130, s: "", l: "Asset groups" },
              { v: 42, s: "", l: "Mini-games" },
              { v: 43, s: "", l: "Motion patterns" },
              { v: 60, s: "fps", l: "Animations" },
            ].map((x, i) => (
              <div key={x.l} className="panel-inset rounded-2xl px-4 py-3" style={{ animation: `slide-up .6s ${0.9 + i * 0.08}s both` }}>
                <div className="font-display text-2xl font-black text-white">
                  <CountUp to={x.v} duration={1400 + i * 200} suffix={x.s} />
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">{x.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative" style={{ animation: "drop .9s .3s cubic-bezier(.3,1.3,.5,1) both" }}>
          <div className="absolute -inset-10 rounded-full bg-azure/20 blur-3xl" />
          <PhoneMock />
        </div>
      </div>
      <div className="relative mt-8 flex justify-center">
        <a href="#gameplay" className="flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-[0.3em] text-ink-500 hover:text-white">
          <span className="flex h-9 w-6 justify-center rounded-full border-2 border-ink-500 pt-1.5">
            <span className="h-2 w-1 rounded-full bg-cyan" style={{ animation: "bounce-soft 1.4s infinite" }} />
          </span>
          Scroll
        </a>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("gameplay");
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    SECTION_ORDER.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <GameProvider>
      <FilterCtx.Provider value={{ query }}>
        <div className="noise pointer-events-none fixed inset-0 z-0 opacity-60" />
        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-3 sm:px-6">
            <Logo />
            <div className="panel-inset ml-auto flex h-11 w-full max-w-sm items-center gap-2 rounded-2xl px-3 focus-within:ring-2 focus-within:ring-azure">
              <Icon name="search" size={18} className="text-ink-400" />
              <input
                id="global-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 130 assets… (swipe, boss, kanban)"
                className="h-full flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-ink-500"
              />
              {query ? (
                <button onClick={() => setQuery("")} className="text-ink-400 hover:text-white">
                  <Icon name="x" size={16} stroke={3} />
                </button>
              ) : (
                <kbd className="rounded-md bg-ink-700 px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-300">/</kbd>
              )}
            </div>
          </div>
          <nav className="no-scrollbar mx-auto flex max-w-[1440px] gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6">
            {SECTION_ORDER.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => sfx("select")}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all",
                  active === id ? "bg-azure text-white shadow-[0_3px_0_#1c55c2]" : "text-ink-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon name={NAV[id].i} size={14} stroke={2.6} />
                {NAV[id].l}
              </a>
            ))}
          </nav>
          <ScrollProgress />
        </header>

        <main className="relative z-10 mx-auto max-w-[1440px] space-y-20 px-4 pb-32 pt-10 sm:px-6">
          {!query && <Hero />}
          <Gameplay />
          <Motion />
          <Playground />
          <Progression />
          <DataDisplay />
          <Controls />
          <Navigation />
          <Feedback />
          <Foundations />

          <div className="global-empty panel flex-col items-center rounded-3xl p-12 text-center">
            <div className="anim-float flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-ink-500 text-ink-400">
              <Icon name="search" size={36} />
            </div>
            <div className="mt-4 font-display text-xl font-black text-white">No assets match “{query}”</div>
            <div className="mt-1 text-sm text-ink-400">Try “swipe”, “boss”, “kanban”, “snake” or “sound”.</div>
            <Btn variant="azure" className="mt-5" onClick={() => setQuery("")}>
              Clear search
            </Btn>
          </div>
        </main>

        <footer className="relative z-10 border-t border-white/5 py-8 pb-28">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 text-xs text-ink-500">
            <Logo />
            <span>Dark-navy neo-tactile system · 130 live assets · one shared game economy · WebAudio SFX · Unbounded / Manrope / JetBrains Mono</span>
          </div>
        </footer>
        <BackToTop />
        <SettingsDrawer prefs={prefs} setPrefs={setPrefs} />
        <CommandPalette />
        <AchievementToasts />
        <OnboardingTour />
        <DailyGift />
        <PlayerHUD />
        <FxLayer />
        <CombatTextLayer />
        <CursorTrail enabled={prefs.trail} />
      </FilterCtx.Provider>
    </GameProvider>
  );
}
