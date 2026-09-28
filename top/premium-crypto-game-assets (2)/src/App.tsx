import { useEffect, useState } from "react";
import { CatalogCtx, Btn, Bar } from "./components/ui";
import { Icon } from "./components/icons";
import { cn } from "./utils/cn";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import Navigation from "./sections/Navigation";
import Learning from "./sections/Learning";
import Trading from "./sections/Trading";
import Gamification from "./sections/Gamification";
import DataDisplay from "./sections/DataDisplay";
import Feedback from "./sections/Feedback";
import CoreScreens from "./sections/CoreScreens";
import Economy from "./sections/Economy";
import Social from "./sections/Social";
import AdvancedTrading from "./sections/AdvancedTrading";
import Onboarding from "./sections/Onboarding";
import MobilePatterns from "./sections/MobilePatterns";
import Accessibility from "./sections/Accessibility";
import BrandAssets from "./sections/BrandAssets";
import MotionLab from "./sections/MotionLab";
import QualitySystem from "./sections/QualitySystem";
import Gameplay from "./sections/Gameplay";
import Arcade from "./sections/Arcade";
import Carousels from "./sections/Carousels";
import ScrollScenes from "./sections/ScrollScenes";
import MicroInteractions from "./sections/MicroInteractions";
import GameFeel from "./sections/GameFeel";

const NAV = [
  { id: "gameplay", t: "Gameplay", i: "play", n: 22 },
  { id: "arcade", t: "Arcade", i: "zap", n: 9 },
  { id: "carousels", t: "Carousels", i: "layers", n: 10 },
  { id: "scroll-scenes", t: "Scroll Scenes", i: "arrowDown", n: 9 },
  { id: "micro", t: "Micro-interactions", i: "hand", n: 10 },
  { id: "game-feel", t: "Game Feel", i: "sparkle", n: 7 },
  { id: "foundations", t: "Foundations", i: "layers", n: 7 },
  { id: "controls", t: "Controls", i: "grid", n: 9 },
  { id: "navigation", t: "Navigation", i: "menu", n: 6 },
  { id: "learning", t: "Learning Loop", i: "book", n: 7 },
  { id: "trading", t: "Trading", i: "candles", n: 8 },
  { id: "gamification", t: "Gamification", i: "trophy", n: 7 },
  { id: "data", t: "Data Display", i: "list", n: 6 },
  { id: "feedback", t: "Feedback", i: "bell", n: 7 },
  { id: "screens", t: "Core Screens", i: "grid", n: 3 },
  { id: "economy", t: "Economy", i: "gem", n: 4 },
  { id: "social", t: "Social", i: "users", n: 6 },
  { id: "pro-trading", t: "Advanced", i: "chart", n: 6 },
  { id: "onboarding", t: "Onboarding", i: "target", n: 6 },
  { id: "mobile-patterns", t: "Mobile", i: "zap", n: 7 },
  { id: "accessibility", t: "Accessible", i: "eye", n: 6 },
  { id: "brand", t: "Brand", i: "sparkle", n: 5 },
  { id: "motion", t: "Motion", i: "play", n: 6 },
  { id: "quality", t: "Quality", i: "shield", n: 7 },
];
const TOTAL = NAV.reduce((a, b) => a + b.n, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("gameplay");
  const [motion, setMotion] = useState(true);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "/" && document.activeElement?.tagName !== "INPUT") { e.preventDefault(); document.getElementById("asset-search")?.focus(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <CatalogCtx.Provider value={{ query }}>
      <div className={cn("min-h-screen", !motion && "no-motion")}>
        {/* Top bar */}
        <header className="sticky top-0 z-50 glass !border-x-0 !border-t-0">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
            <button className="lg:hidden text-fog" onClick={() => setMenu(!menu)} aria-label="Menu"><Icon name={menu ? "x" : "menu"} size={22} /></button>
            <a href="#top" className="flex items-center gap-2.5 shrink-0">
              <div className="w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_4px_0_#0b7a4a,inset_0_2px_0_rgba(255,255,255,.3)]"><Icon name="logo" size={22} stroke={3} className="text-white" /></div>
              <div className="leading-none hidden sm:block">
                <div className="font-black tracking-tight text-lg">BULLRUN</div>
                <div className="text-[9px] font-bold uppercase tracking-[.2em] text-mist">UI Asset Catalog</div>
              </div>
            </a>
            <div className="flex-1 max-w-md mx-auto well !rounded-full h-10 flex items-center gap-2 px-4 border-2 border-transparent focus-within:!border-sky/60 transition-all">
              <Icon name="search" size={16} className="text-mist" />
              <input id="asset-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search assets: chart, quiz, streak, CTL-04…" className="bg-transparent outline-none flex-1 text-sm min-w-0 placeholder:text-mist/60" />
              {query ? <button onClick={() => setQuery("")} className="text-mist hover:text-fog"><Icon name="x" size={14} stroke={3} /></button> : <span className="num text-[10px] px-1.5 py-0.5 rounded-md bg-ink-900 border border-white/10 text-mist hidden sm:inline">/</span>}
            </div>
            <button onClick={() => setMotion(!motion)} className={cn("hidden sm:flex items-center gap-2 text-[11px] font-bold px-3 h-9 rounded-xl border-2 transition-all", motion ? "border-bull/50 text-bull bg-bull/10" : "border-ink-600 text-mist")}>
              <Icon name="sparkle" size={14} />Motion {motion ? "ON" : "OFF"}
            </button>
          </div>
        </header>

        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 flex gap-8">
          {/* Sidebar */}
          <aside className={cn("fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 py-6 transition-transform lg:translate-x-0 lg:block overflow-y-auto overscroll-contain", menu ? "translate-x-0 bg-ink-900/95 backdrop-blur-lg px-4" : "-translate-x-full")}>
            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-mist mb-3 px-3">Sections</div>
            <nav className="space-y-1">
              {NAV.map((n, i) => (
                <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)} className={cn("flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-bold transition-all", active === n.id ? "tile !border-sky/40 text-fog" : "text-mist hover:text-fog hover:bg-white/5")}>
                  <span className={cn("num text-[10px] w-5", active === n.id ? "text-sky" : "text-mist/60")}>{String(i + 1).padStart(2, "0")}</span>
                  <Icon name={n.i} size={18} className={active === n.id ? "text-sky" : ""} />
                  <span className="flex-1">{n.t}</span>
                  <span className="num text-[10px] text-mist">{n.n}</span>
                </a>
              ))}
            </nav>
            <div className="tile p-4 mt-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-mist mb-2">Coverage</div>
              <Bar value={100} color="bull" h={10} />
              <div className="text-xs text-fog mt-2"><b className="num text-bull">{TOTAL}</b> interactive assets · 0 duplicates</div>
            </div>
          </aside>

          {/* Main */}
          <main id="top" className="flex-1 min-w-0 py-0">
            <section className="hero-world -mx-4 sm:-mx-6 lg:mx-0 mb-20 noise">
              <div className="hero-scan" />
              <div className="relative z-10 px-5 sm:px-10 xl:px-16 py-16 max-w-4xl">
                <div className="hero-kicker mb-7">Award-grade trading education</div>
                <h1 className="hero-brand mb-8" aria-label="BULLRUN Academy">
                  BULL<span className="hero-brand-accent">RUN</span>
                  <span className="block text-[.28em] leading-none tracking-[.16em] text-fog mt-8 ml-1">ACADEMY</span>
                </h1>
                <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight max-w-xl leading-tight mb-4">
                  Learn the market.<br />Earn your discipline.
                </h2>
                <p className="text-sm sm:text-base text-fog/75 leading-relaxed max-w-lg mb-8">
                  A complete tactile system for a serious mobile learning game: lessons, live practice, social duels and fair progression in one coherent world.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="#screens"><Btn variant="bull" size="lg" icon="play">Play the product</Btn></a>
                  <a href="#gameplay"><Btn variant="ghost" size="lg" icon="play">Explore {TOTAL} assets</Btn></a>
                </div>
              </div>
            </section>

            <div className="mb-16 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                [TOTAL, "Unique interactive assets", "bull", "grid"],
                [NAV.length, "Connected systems", "sky", "layers"],
                [420, "Designed states", "gold", "sparkle"],
                [60, "FPS motion target", "violet", "bolt"],
              ].map(([value, label, color, icon]) => (
                <div key={label as string} className="game-surface rounded-2xl p-4 flex items-center gap-3">
                  <span className={cn("w-11 h-11 rounded-xl grid place-items-center", color === "bull" ? "bg-bull/15 text-bull" : color === "sky" ? "bg-sky/15 text-sky" : color === "gold" ? "bg-gold/15 text-gold" : "bg-violet/15 text-violet")}><Icon name={icon as string} size={21} /></span>
                  <div><div className="num text-2xl font-black">{value as number}{(value as number) >= 300 ? "+" : ""}</div><div className="text-[9px] uppercase tracking-wider font-bold text-mist">{label as string}</div></div>
                </div>
              ))}
            </div>

            {query && (
              <div className="mb-8 tile p-3 flex items-center gap-3 anim-rise">
                <Icon name="filter" size={16} className="text-sky" />
                <span className="text-sm">Filtering by <b className="text-sky">"{query}"</b> — empty sections hide their cards.</span>
                <button onClick={() => setQuery("")} className="ml-auto text-xs font-bold text-mist hover:text-fog">Clear</button>
              </div>
            )}

            <Gameplay />
            <Arcade />
            <Carousels />
            <ScrollScenes />
            <MicroInteractions />
            <GameFeel />
            <Foundations />
            <Controls />
            <Navigation />
            <Learning />
            <Trading />
            <Gamification />
            <DataDisplay />
            <Feedback />
            <CoreScreens />
            <Economy />
            <Social />
            <AdvancedTrading />
            <Onboarding />
            <MobilePatterns />
            <Accessibility />
            <BrandAssets />
            <MotionLab />
            <QualitySystem />

            <footer className="panel p-6 flex flex-col sm:flex-row items-center gap-4 justify-between mt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_4px_0_#0b7a4a]"><Icon name="logo" size={22} stroke={3} className="text-white" /></div>
                <div><div className="font-black">BULLRUN Academy UI</div><div className="text-xs text-mist">Tokens · Components · Game systems — v1.0</div></div>
              </div>
              <div className="text-xs text-mist text-center sm:text-right">Educational demo. Simulated market data — not financial advice.</div>
            </footer>
          </main>
        </div>
      </div>
    </CatalogCtx.Provider>
  );
}
