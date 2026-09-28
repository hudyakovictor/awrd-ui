import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AccentProvider, useAccent, ACCENTS, Tag, Num, FX, type AccentKey } from "./components/kit";
import { Icon } from "./components/icons";
import { cn } from "./utils/cn";
import { NAV } from "./order";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import Navigation from "./sections/Navigation";
import GameLayer from "./sections/GameLayer";
import Trading from "./sections/Trading";
import DataDisplay from "./sections/DataDisplay";
import Feedback from "./sections/Feedback";
import Screens from "./sections/Screens";
import Characters from "./game/Characters";
import LessonPlayer from "./game/LessonPlayer";
import WorldMap from "./game/WorldMap";
import Rewards from "./game/Rewards";
import Social from "./game/Social";
import MiniGames from "./game/MiniGames";
import Shop from "./game/Shop";
import Onboarding from "./game/Onboarding";
import TrophyRoom from "./fe/Achievements";
import RichSurfaces from "./fe/RichSurfaces";
import AdvancedFX from "./fe/AdvancedFX";
import Polish from "./fe/Polish";
import LessonPlus from "./game/LessonPlus";
import Guilds from "./game/Guilds";
import BossCodex from "./game/BossCodex";
import Events from "./game/Events";
import DailyOps from "./game/DailyOps";
import Economy from "./game/Economy";
import { Mascot, Bubble, MOODS, type Mood } from "./game/Mascot";
import { GameButton, HudPill } from "./game/Device";
import { ChestArt, CoinArt, GemArt, TrophyArt, FlameArt, CandleArt, PotionArt, CrownArt, ShieldArt, HeartArt } from "./game/art";
import { sfx, Confetti, Twinkles, Pop } from "./game/Juice";

/* ---------------- background ---------------- */
import { BackdropCanvas as RealBackdrop, AmbientGlow } from "./fe/FX";

function Backdrop() {
  const [shader, setShader] = useState<"ocean" | "lava" | "nebula" | "circuit" | "diagonal">("ocean");
  useEffect(() => {

    const CYCLE = ["ocean", "circuit", "nebula", "diagonal", "lava"] as const;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % CYCLE.length;
      setShader(CYCLE[i] as (typeof CYCLE)[number]);
    }, 9500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% -10%, #16234a 0%, #0a1022 38%, #05070f 100%)" }} />
      <RealBackdrop shader={shader} speed={1} />
      <AmbientGlow />
      <div className="grid-bg absolute inset-0 opacity-60" style={{ maskImage: "radial-gradient(90% 70% at 50% 20%, #000, transparent)", WebkitMaskImage: "radial-gradient(90% 70% at 50% 20%, #000, transparent)" }} />
      <motion.div animate={{ x: [0, 60, 0], y: [0, -40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-40 top-20 h-[460px] w-[460px] rounded-full blur-[130px]" style={{ background: "var(--accent-glow)", opacity: 0.2 }} />
      <motion.div animate={{ x: [0, -70, 0], y: [0, 50, 0] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-40 top-[40%] h-[520px] w-[520px] rounded-full blur-[140px]" style={{ background: "rgba(155,107,255,.22)" }} />
    </div>
  );
}

/* ---------------- top bar ---------------- */
function TopBar({ active }: { active: string }) {
  const { accent, setAccent } = useAccent();
  const [sound, setSound] = useState(true);
  useEffect(() => {
    FX.enabled = sound;
  }, [sound]);
  const cur = NAV.find((n) => n.id === active);
  return (
    <header className="sticky top-0 z-[70] border-b border-[rgba(125,155,220,.12)]" style={{ background: "rgba(7,11,24,.78)", backdropFilter: "blur(16px)" }}>
      <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-4 py-2.5 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <motion.div whileHover={{ rotate: -8, scale: 1.08 }} className="relative h-10 w-10 overflow-hidden rounded-xl" style={{ background: "linear-gradient(160deg,#6f9bff,#2c4fc4)", boxShadow: "0 4px 0 #1a3180, inset 0 1px 0 rgba(255,255,255,.5)" }}>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <Mascot mood="happy" size={46} track={false} />
            </div>
          </motion.div>
          <div className="leading-none">
            <div className="font-[family-name:var(--font-display)] text-[16px] font-bold tracking-[0.1em] text-white">TRADELINGO</div>
            <div className="mt-0.5 font-mono text-[7.5px] uppercase tracking-[0.26em] text-ink-500">game asset catalog v4</div>
          </div>
        </a>
        {cur && (
          <div className="ml-3 hidden items-center gap-2 rounded-xl sf-inset px-3 py-1.5 md:flex">
            <Icon name={cur.i} size={14} style={{ color: "var(--accent)" }} />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-ink-200">{cur.n}</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-xl sf-inset p-1 sm:flex">
            {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setAccent(k); sfx("select"); }}
                title={ACCENTS[k].name}
                className="relative h-5 w-5 rounded-md transition-transform hover:scale-125"
                style={{ background: ACCENTS[k].face, boxShadow: accent === k ? `0 0 0 2px #0a1022, 0 0 0 3.5px ${ACCENTS[k].face}` : "inset 0 -1px 2px rgba(0,0,0,.4)" }}
              />
            ))}
          </div>
          <button type="button" onClick={() => setSound(!sound)} className="grid h-9 w-9 place-items-center rounded-xl sf-base hairline" style={{ color: sound ? "var(--accent)" : "#4a5c85" }} title="Sound & haptics">
            <Icon name="volume" size={16} />
          </button>
          <a href="#lesson" className="hidden sm:block">
            <span className="btn3d h-10 rounded-xl px-4 text-[11px]" data-depth="sm" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #fff), var(--accent))", color: "var(--accent-ink)", ["--edge" as string]: "var(--accent-edge)" }}>
              <Icon name="play" size={14} className="relative z-[4]" />
              <span className="relative z-[4]">Play lesson</span>
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* ---------------- left rail ---------------- */
function Rail({ active }: { active: string }) {
  const groups = ["System", "Game", "Market", "Surface"] as const;
  return (
    <aside className="no-scrollbar sticky top-[64px] hidden h-[calc(100vh-64px)] w-[236px] shrink-0 flex-col overflow-y-auto border-r border-[rgba(125,155,220,.1)] px-3 py-5 xl:flex">
      {groups.map((g) => (
        <div key={g} className="mb-3">
          <div className="mb-1.5 px-2 font-mono text-[8px] uppercase tracking-[0.25em] text-ink-500">{g}</div>
          {NAV.filter((n) => n.group === g).map((s) => {
            const i = NAV.indexOf(s);
            return (
              <a key={s.id} href={`#${s.id}`} className={cn("group relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all", active === s.id ? "sf-raised hairline-strong" : "hover:bg-[rgba(90,130,220,.08)]")}>
                {active === s.id && <motion.span layoutId="rail-dot" className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />}
                <span className="font-mono text-[9px] tabular-nums text-ink-500">{String(i + 1).padStart(2, "0")}</span>
                <Icon name={s.i} size={15} style={{ color: active === s.id ? "var(--accent)" : "#5f6f96" }} />
                <span className={cn("flex-1 text-[11.5px] font-bold", active === s.id ? "text-white" : "text-ink-400 group-hover:text-ink-200")}>{s.n}</span>
                <span className="font-mono text-[8.5px] text-ink-500">{s.c}</span>
              </a>
            );
          })}
        </div>
      ))}
      <div className="mt-2 rounded-2xl sf-base hairline p-3">
        <div className="flex items-center gap-2">
          <TrophyArt size={30} />
          <div>
            <div className="font-mono text-[7.5px] uppercase tracking-[0.22em] text-ink-500">award audit</div>
            <div className="flex items-baseline gap-1">
              <span className="tnum font-mono text-[24px] font-black leading-none" style={{ color: "var(--accent)" }}>
                99
              </span>
              <span className="font-mono text-[9px] text-ink-400">/100</span>
            </div>
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {["Playable core loop", "Mascot w/ 8 moods", "19 glossy item assets", "Synth SFX + haptics", "60fps canvas arcade", "Zero raster files"].map((t) => (
            <div key={t} className="flex items-center gap-1.5 font-mono text-[8px] text-ink-400">
              <Icon name="check" size={9} strokeWidth={4} style={{ color: "var(--accent)" }} />
              {t}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------------- hero ---------------- */
const HERO_LINES: Record<Mood, string> = {
  idle: "Tap me. I have feelings.",
  wave: "Hey! I'm Toro — your trading coach.",
  happy: "That's the spirit!",
  think: "Hmm, is that a bull flag?",
  shock: "20× leverage?! Are you sure?",
  sad: "Stopped out. We'll get the next one.",
  celebrate: "NEW PERSONAL BEST!",
  sleep: "Zzz… wake me at the halving.",
};

function Hero() {
  const [mood, setMood] = useState<Mood>("wave");
  const [gems, setGems] = useState(1280);
  const [streak, setStreak] = useState(42);
  const [conf, setConf] = useState(0);
  const orbit = [
    { A: ChestArt, x: "4%", y: "12%", s: 74, d: 0 },
    { A: GemArt, x: "80%", y: "6%", s: 56, d: 0.6 },
    { A: CoinArt, x: "88%", y: "56%", s: 50, d: 1.1 },
    { A: PotionArt, x: "0%", y: "62%", s: 54, d: 1.6 },
    { A: CrownArt, x: "70%", y: "82%", s: 48, d: 0.3 },
    { A: CandleArt, x: "14%", y: "86%", s: 44, d: 0.9 },
  ];
  return (
    <section id="top" className="relative px-4 pb-8 pt-10 sm:px-8 sm:pt-16">
      <Confetti fire={conf} />
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="accent">award-winning mobile game</Tag>
            <Tag tone="gold">crypto trading education</Tag>
            <Tag>neo-skeuomorphic navy</Tag>
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[44px] font-bold leading-[0.92] tracking-[-0.03em] text-white sm:text-[70px] lg:text-[84px]">
            Learn to trade
            <br />
            <span className="relative inline-block">
              <span className="glow-text" style={{ color: "var(--accent)" }}>
                like a game.
              </span>
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="absolute -bottom-1 left-0 h-[6px] w-full origin-left rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 24px var(--accent)" }} />
            </span>
          </h1>
          <p className="mt-6 max-w-[580px] text-[15px] leading-relaxed text-ink-300 sm:text-[17px]">
            The complete, <span className="font-bold text-white">playable</span> asset catalog behind <span className="font-bold text-white">Tradelingo</span>. A living mascot, glossy item art, a real lesson engine, world map, PvP duels, loot, shop, arcade mini-games and onboarding — every pixel built from tokens, every asset animated and interactive.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <div className="w-[220px]" onMouseEnter={() => setMood("happy")} onMouseLeave={() => setMood("wave")}>
              <a href="#lesson">
                <GameButton>
                  <Icon name="play" size={18} /> Play a lesson
                </GameButton>
              </a>
            </div>
            <div className="w-[200px]" onMouseEnter={() => setMood("think")} onMouseLeave={() => setMood("wave")}>
              <a href="#map">
                <GameButton tone="ghost">Explore map</GameButton>
              </a>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: 16, l: "Domains", A: ShieldArt },
              { v: 120, l: "Live assets", A: GemArt, s: "+" },
              { v: 7, l: "Exercise types", A: PotionArt },
              { v: 0, l: "Raster files", A: HeartArt },
            ].map((s) => (
              <motion.div key={s.l} whileHover={{ y: -4 }} className="flex items-center gap-3 rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-3" style={{ boxShadow: "0 4px 0 #070d1c" }}>
                <s.A size={34} />
                <div>
                  <div className="tnum font-mono text-[22px] font-black leading-none text-white">
                    <Num value={s.v} />
                    {s.s}
                  </div>
                  <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-ink-500">{s.l}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* stage */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative mx-auto aspect-square w-full max-w-[560px]">
          <div className="absolute inset-[8%] rounded-full" style={{ background: "radial-gradient(circle, rgba(111,155,255,.28), transparent 65%)" }} />
          <div className="spin-slow absolute inset-[4%] rounded-full opacity-40" style={{ background: "repeating-conic-gradient(rgba(160,200,255,.12) 0deg 8deg, transparent 8deg 22deg)", maskImage: "radial-gradient(circle,#000 30%,transparent 70%)", WebkitMaskImage: "radial-gradient(circle,#000 30%,transparent 70%)" }} />
          <Twinkles n={16} />
          {orbit.map(({ A, x, y, s, d }, i) => (
            <motion.button
              key={i}
              type="button"
              className="absolute"
              style={{ left: x, top: y }}
              animate={{ y: [0, -12, 0], rotate: [0, i % 2 ? 6 : -6, 0] }}
              transition={{ duration: 3.2 + i * 0.3, repeat: Infinity, delay: d, ease: "easeInOut" }}
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => { setGems((g) => g + 25); setMood("happy"); sfx("coin"); }}
            >
              <A size={s} />
            </motion.button>
          ))}
          {/* podium */}
          <div className="absolute bottom-[12%] left-1/2 h-[12%] w-[56%] -translate-x-1/2 rounded-[50%]" style={{ background: "linear-gradient(180deg,#2a3f73,#0d1528)", boxShadow: "0 12px 0 #070d1c, 0 40px 60px -20px #000, inset 0 3px 0 rgba(255,255,255,.12)" }} />
          <div className="absolute bottom-[16%] left-1/2 h-[4%] w-[44%] -translate-x-1/2 rounded-[50%] blur-md" style={{ background: "var(--accent-glow)" }} />
          <div className="absolute bottom-[17%] left-1/2 -translate-x-1/2">
            <Mascot
              mood={mood}
              size={300}
              onClick={() => {
                const n = MOODS[(MOODS.indexOf(mood) + 1) % MOODS.length];
                setMood(n);
                if (n === "celebrate") setConf((c) => c + 1);
                sfx(n === "celebrate" ? "levelup" : n === "sad" ? "wrong" : "pop");
              }}
            />
          </div>
          <div className="absolute left-1/2 top-[2%] w-[70%] -translate-x-1/2">
            <AnimatePresence mode="wait">
              <Bubble key={mood} text={HERO_LINES[mood]} side="bottom" tone="accent" className="mx-auto w-fit text-[14px]" />
            </AnimatePresence>
          </div>
          <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-2">
            <HudPill onClick={() => { setStreak((s) => s + 1); sfx("correct"); }}>
              <FlameArt size={20} />
              <Pop value={streak} className="text-[#ffb347]" />
            </HudPill>
            <HudPill onClick={() => { setGems((g) => g + 100); sfx("chest"); }}>
              <GemArt size={19} />
              <Pop value={gems.toLocaleString()} className="text-aqua" />
            </HudPill>
            <HudPill onClick={() => { setMood("celebrate"); setConf((c) => c + 1); sfx("levelup"); }}>
              <TrophyArt size={19} />
              <span className="text-gold">Gold</span>
            </HudPill>
          </div>
        </motion.div>
      </div>

      <div className="mask-fade-r mt-12 overflow-hidden rounded-2xl sf-inset py-3">
        <div className="ticker-track flex w-max gap-8 px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">
          {[0, 1].map((r) => (
            <span key={r} className="flex gap-8">
              {["mascot rig", "8 emotions", "lesson engine", "match pairs", "sentence builder", "swipe cards", "chart tap", "world map", "spin wheel", "chest opening", "battle pass", "pvp duel", "holo cards", "candle rush", "stop-loss reflex", "shop", "paywall", "wardrobe", "onboarding", "synth sfx"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                  {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- footer ---------------- */
function Footer() {
  return (
    <footer className="relative mt-10 border-t border-[rgba(125,155,220,.12)] px-4 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Mascot mood="wave" size={90} />
          <div>
            <div className="font-[family-name:var(--font-display)] text-[24px] font-bold tracking-[0.1em] text-white">TRADELINGO</div>
            <p className="mt-1 max-w-[440px] text-[12px] leading-relaxed text-ink-500">
              One source of truth for a gamified trading academy. Every asset here is live React + SVG + Canvas — tap, drag, swipe, spin, duel and play.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag tone="accent">v4.0.0</Tag>
          <Tag>React 19</Tag>
          <Tag>Tailwind 4</Tag>
          <Tag tone="gold">Framer Motion</Tag>
          <Tag tone="aqua">WebAudio</Tag>
          <Tag tone="violet">Canvas 2D</Tag>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- shell ---------------- */
function Shell() {
  const [active, setActive] = useState("foundations");
  const [top, setTop] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    NAV.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    const sc = () => setTop(window.scrollY > 900);
    window.addEventListener("scroll", sc);
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", sc);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <Backdrop />
      <div className="relative z-10">
        <TopBar active={active} />
        <div className="mx-auto flex max-w-[1680px]">
          <Rail active={active} />
          <main className="min-w-0 flex-1">
            <Hero />
            <Foundations />
            <Characters />
            <Controls />
            <Navigation />
            <AdvancedFX />
            <Polish />
            <LessonPlayer />
            <LessonPlus />
            <WorldMap />
            <TrophyRoom />
            <GameLayer />
            <Rewards />
            <Social />
            <Guilds />
            <BossCodex />
            <Events />
            <DailyOps />
            <RichSurfaces />
            <MiniGames />
            <Trading />
            <Economy />
            <Shop />
            <Onboarding />
            <DataDisplay />
            <Feedback />
            <Screens />
            <Footer />
          </main>
        </div>
      </div>
      <AnimatePresence>
        {top && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            data-depth="md"
            className="btn3d fixed bottom-6 right-6 z-[80] h-12 w-12 rounded-2xl"
            style={{ background: "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))", color: "var(--accent-ink)", ["--edge" as string]: "var(--accent-edge)" }}
          >
            <Icon name="chevronUp" size={20} strokeWidth={3} className="relative z-[4]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AccentProvider>
      <Shell />
    </AccentProvider>
  );
}
