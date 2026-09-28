import { useEffect, useState } from "react";
import {
  Volume2, VolumeX, Layers, Gamepad2, CandlestickChart, Gift, Bell, Compass, SlidersHorizontal, Star, BookOpen,
  Dumbbell, Trophy, User, Lock, Check, ShoppingBag, Users, Rocket, Play, ArrowDown,
} from "lucide-react";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import Navigation from "./sections/Navigation";
import Learning from "./sections/Learning";
import Trading from "./sections/Trading";
import Rewards from "./sections/Rewards";
import Feedback from "./sections/Feedback";
import Shop from "./sections/Shop";
import Social from "./sections/Social";
import Onboarding from "./sections/Onboarding";
import GameDemo from "./sections/GameDemo";
import Identity from "./sections/Identity";
import GameArt from "./sections/GameArt";
import Audio from "./sections/Audio";
import Access from "./sections/Access";
import Lessons from "./sections/Lessons";
import Practice from "./sections/Practice";
import Practice2 from "./sections/Practice2";
import Practice3 from "./sections/Practice3";
import MotionLab from "./sections/MotionLab";
import Journey from "./sections/Journey";
import Dojo from "./sections/Dojo";
import Clans from "./sections/Clans";
import Trials from "./sections/Trials";
import Coach from "./sections/Coach";
import PlayLab from "./sections/PlayLab";
import Events from "./sections/Events";
import Sandbox from "./sections/Sandbox";
import { GameProvider, HudDock } from "./kit/game";
import { AmbientCanvas, PointerGlow } from "./kit/fx";
import { useViewportProgress } from "./kit/motion";
import { GraduationCap, Dumbbell as DumbbellIcon, Move, Route, Crosshair, Shield, Timer, Mic, Sparkles, Calendar, Pencil } from "lucide-react";
import { Mascot } from "./kit/Mascot";
import { LogoMark, LogoBadge, Lockup } from "./kit/Brand";
import { FlameIcon, GemIcon, HeartIcon, ChestIcon, CoinIcon, TrophyIcon, StarIcon } from "./kit/GameIcons";
import { Btn, GhostBtn } from "./kit/ui";
import { isMuted, onMute, setMuted, sfx } from "./kit/sfx";
import { cn } from "./utils/cn";
import heroArt from "./assets/hero-arena.jpg";
import terrain from "./assets/terrain.jpg";
import duelArt from "./assets/arena-duel.jpg";
import vaultArt from "./assets/vault.jpg";

const nav = [
  { id: "play", n: "Play", I: Play },
  { id: "journey", n: "Journey", I: Route },
  { id: "learn", n: "Learn", I: GraduationCap },
  { id: "practice", n: "Practice", I: DumbbellIcon },
  { id: "dojo", n: "Dojo", I: Crosshair },
  { id: "sandbox", n: "Sandbox", I: Pencil },
  { id: "trials", n: "Trials", I: Timer },
  { id: "events", n: "Events", I: Calendar },
  { id: "clans", n: "Clans", I: Shield },
  { id: "coach", n: "Coach", I: Mic },
  { id: "motion", n: "Motion", I: Move },
  { id: "animlab", n: "AnimLab", I: Sparkles },
  { id: "foundations", n: "Foundations", I: Layers },
  { id: "controls", n: "Controls", I: SlidersHorizontal },
  { id: "navigation", n: "Navigation", I: Compass },
  { id: "learning", n: "Learning", I: Gamepad2 },
  { id: "trading", n: "Trading", I: CandlestickChart },
  { id: "rewards", n: "Rewards", I: Gift },
  { id: "feedback", n: "Feedback", I: Bell },
  { id: "shop", n: "Shop", I: ShoppingBag },
  { id: "social", n: "Social", I: Users },
  { id: "onboarding", n: "Onboarding", I: Rocket },
  { id: "identity", n: "Identity", I: Star },
  { id: "art", n: "Art", I: Layers },
  { id: "audio", n: "Audio", I: Volume2 },
  { id: "access", n: "A11y", I: Check },
];
const total = 169;

const ticker = [
  "BTC +2.14%", "ETH −0.82%", "SOL +5.31%", "TON +1.02%", "DOGE −3.40%", "XRP +0.61%",
  "AVAX +2.90%", "LINK −1.12%", "STREAK 47 DAYS", "DIAMOND LEAGUE", "XP +1840", "GEMS 1280",
];

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const h = () => setP(window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight));
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
      <div className="h-full origin-left bg-gradient-to-r from-sky via-gold to-ember shadow-[0_0_10px_rgba(255,197,61,.7)]" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

function PhonePreview() {
  const [tab, setTab] = useState(0);
  return (
    <div className="relative mx-auto w-[286px] shrink-0 anim-float" style={{ animationDuration: "7s" }}>
      <div className="absolute -inset-14 -z-10 rounded-full bg-sky/30 blur-3xl" />
      <div className="rounded-[46px] border border-white/10 bg-gradient-to-b from-ink-500 to-ink-800 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_12px_0_#060b18,0_50px_90px_-20px_rgba(0,0,0,.9)]">
        <div className="relative h-[556px] overflow-hidden rounded-[38px] bg-ink-900">
          <img src={terrain} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" style={{ objectPosition: "50% 30%" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/85 via-ink-900/55 to-ink-950" />
          <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="relative flex items-center justify-between px-4 pb-2 pt-11">
            <span className="flex items-center gap-1"><FlameIcon size={20} className="anim-flame" /><span className="num text-xs font-extrabold text-ember">47</span></span>
            <span className="flex items-center gap-1"><GemIcon size={20} /><span className="num text-xs font-extrabold text-cyan">1280</span></span>
            <span className="flex items-center gap-1"><HeartIcon size={20} /><span className="num text-xs font-extrabold text-bear">5</span></span>
          </div>
          <div className="relative mx-3 rounded-2xl bg-gradient-to-br from-bull to-bull-d p-3 shadow-[0_4px_0_#0a6b4d]">
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-white/75">Unit 3</div>
            <div className="font-display text-sm font-extrabold">Candlestick Patterns</div>
          </div>
          <div className="relative mt-5 flex flex-col items-center gap-4">
            {[0, 1, 2, 3, 4].map((i) => {
              const off = [0, 40, 56, 30, -20][i];
              const done = i < 2, cur = i === 2;
              return (
                <div key={i} style={{ transform: `translateX(${off}px)` }} className="relative">
                  {cur && <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-lg border-2 border-sky bg-ink-800 px-2 py-0.5 text-[9px] font-extrabold text-sky" style={{ animation: "float 2s infinite" }}>START</span>}
                  <span className={cn("grid h-14 w-14 place-items-center rounded-full", cur && "sheen")} style={{ background: i === 3 ? "transparent" : done ? "linear-gradient(#ffd76b,#ffc53d)" : cur ? "linear-gradient(#6ea4ff,#3b82ff)" : "#243a68", boxShadow: i === 3 ? "none" : `0 6px 0 ${done ? "#c98a12" : cur ? "#2152c4" : "#172749"}` }}>
                    {i === 3 ? <ChestIcon size={48} /> : done ? <Check size={24} strokeWidth={4} className="text-[#6b4300]" /> : cur ? <StarIcon size={26} /> : <Lock size={20} className="text-[#5f74a3]" />}
                  </span>
                </div>
              );
            })}
            <div className="absolute right-1 top-14"><Mascot size={62} /></div>
          </div>
          <div className="absolute inset-x-2 bottom-2 grid grid-cols-5 rounded-3xl border border-white/10 bg-ink-800/95 p-1 shadow-[0_4px_0_#060b18]">
            {[BookOpen, Dumbbell, CandlestickChart, Trophy, User].map((I, i) => (
              <button key={i} onClick={() => { setTab(i); sfx.tick(); }} className={cn("grid h-11 place-items-center rounded-2xl transition-all", tab === i && "bg-sky/20 ring-2 ring-sky")}>
                <I size={18} className={tab === i ? "text-sky" : "text-[#5f74a3]"} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -left-12 top-24 anim-float" style={{ animationDelay: "1s" }}><CoinIcon size={54} /></div>
      <div className="absolute -right-9 top-56 anim-float" style={{ animationDelay: "2s" }}><TrophyIcon size={56} /></div>
      <div className="absolute -left-7 bottom-28 anim-float" style={{ animationDelay: ".5s" }}><GemIcon size={44} /></div>
    </div>
  );
}

function Ticker() {
  return (
    <div className="overflow-hidden border-y border-white/8 bg-ink-950/60 py-3 backdrop-blur">
      <div className="flex w-max gap-8 whitespace-nowrap" style={{ animation: "ticker 32s linear infinite" }}>
        {[...ticker, ...ticker].map((t, i) => (
          <span key={i} className={cn("num text-[11px] font-extrabold tracking-wider", t.includes("−") ? "text-bear" : t.includes("+") ? "text-bull" : "text-mist")}>
            {t.includes("+") || t.includes("−") ? "●" : "◆"} {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function ArtBand({ img, kicker, title, text, align = "left" }: { img: string; kicker: string; title: string; text: string; align?: "left" | "right" }) {
  const [ref, p] = useViewportProgress<HTMLElement>("through");
  return (
    <section ref={ref} className="relative overflow-hidden rounded-[32px]">
      <img src={img} alt="" className="absolute inset-x-0 -top-[15%] h-[130%] w-full object-cover will-change-transform" style={{ objectPosition: "50% 55%", transform: `translateY(${(p - 0.5) * -18}%) scale(${1.05 + p * 0.08})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/72 to-ink-950/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
      <div className={cn("relative px-8 py-20 sm:px-14 sm:py-28", align === "right" && "text-right")}>
        <div className={cn("max-w-2xl", align === "right" && "ml-auto")} style={{ transform: `translateY(${(0.5 - p) * 60}px)`, opacity: Math.min(1, p * 3) }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-gold ring-1 ring-gold/30">{kicker}</div>
          <h3 className="font-display text-3xl font-black leading-[1.08] text-white sm:text-5xl">{title}</h3>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-snow/75">{text}</p>
        </div>
      </div>
    </section>
  );
}

const score = [
  ["Tactility", "Толщина, нажатие, блик, тени, отдача"],
  ["Motion", "Кривые движения, replay, reduced-motion"],
  ["Interactivity", "Каждый ассет реагирует на пользователя"],
  ["States", "Default / hover / press / disabled / error / success"],
  ["Game-feel", "Звук, гаптика, конфетти, комбо, тряска"],
  ["Domain fit", "Рынок, риск, свечи, PnL, лиги"],
  ["Accessibility", "AA-контраст, aria, клавиатура, RTL"],
  ["Consistency", "Единые токены, ноль дублей ассетов"],
];

export default function App() {
  return (
    <>
      <AmbientCanvas />
      <PointerGlow />
      <GameProvider>
        <AppInner />
        <HudDock />
      </GameProvider>
    </>
  );
}

function HeroParallax() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setY(window.scrollY); }); };
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <img src={heroArt} alt="" className="absolute inset-x-0 -top-[10%] h-[125%] w-full object-cover will-change-transform" style={{ objectPosition: "50% 62%", transform: `translateY(${y * 0.35}px) scale(${1 + Math.min(y, 900) / 6000})` }} />
  );
}

function AppInner() {
  const [muted, setM] = useState(isMuted());
  const [active, setActive] = useState("play");
  useEffect(() => onMute(setM), []);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-35% 0px -55% 0px" });
    nav.forEach((n) => { const el = document.getElementById(n.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>("article.panel"));
    cards.forEach((el) => {
      if (el.dataset.reveal === "1") return;
      el.dataset.reveal = "1";
      const sibs = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
      el.style.setProperty("--reveal-delay", `${(sibs % 3) * 90}ms`);
      el.classList.add("reveal-hidden");
    });
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.remove("reveal-hidden");
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollProgress />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1560px] items-center gap-4 px-4 sm:px-6">
          <a href="#top" className="flex shrink-0 items-center gap-2.5">
            <LogoBadge size={38} />
            <span className="font-display text-sm font-black tracking-tight sm:text-base">CANDLE<span className="text-gold">QUEST</span></span>
          </a>
          <nav className="ml-4 hidden flex-1 items-center gap-1 overflow-x-auto lg:flex">
            {nav.map(({ id, n, I }) => (
              <a key={id} href={`#${id}`} onClick={() => sfx.tick()} className={cn("flex h-9 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 text-[11px] font-extrabold transition", active === id ? "bg-sky/15 text-sky ring-1 ring-sky/50" : "text-mist hover:bg-white/5 hover:text-white")}>
                <I size={13} /> {n}
              </a>
            ))}
          </nav>
          <button
            onClick={() => { setMuted(!muted); if (muted) setTimeout(() => sfx.toggle(true), 10); }}
            className={cn("ml-auto flex h-10 items-center gap-2 rounded-xl px-3 text-[11px] font-extrabold uppercase transition active:translate-y-[3px] active:shadow-none", muted ? "bg-ink-800 text-mist shadow-[0_3px_0_#060b18]" : "bg-bull/15 text-bull shadow-[inset_0_0_0_1.5px_#22d39a,0_3px_0_#0a6b4d]")}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span className="hidden sm:inline">{muted ? "Sound off" : "Sound on"}</span>
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
          {nav.map(({ id, n }) => (
            <a key={id} href={`#${id}`} className={cn("whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-extrabold", active === id ? "bg-sky text-white" : "bg-ink-800 text-mist")}>{n}</a>
          ))}
        </nav>
      </header>

      <main id="top">
        {/* ── cinematic hero ── */}
        <section className="relative overflow-hidden">
          <HeroParallax />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,36,.92),rgba(10,18,36,.55)_45%,rgba(10,18,36,.97))]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,36,.94),rgba(10,18,36,.62)_46%,rgba(10,18,36,.12))]" />
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative mx-auto grid max-w-[1560px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-gold ring-1 ring-gold/40">
                <span className="h-2 w-2 rounded-full bg-gold" style={{ animation: "glow-pulse 1.6s infinite" }} /> Unified asset catalog · v2.0
              </div>
              <h1 className="font-display text-[clamp(38px,7.4vw,86px)] font-black leading-[0.95] tracking-[-0.03em]">
                <span className="block text-white">Learn to trade</span>
                <span className="block text-gradient-sky">by playing.</span>
                <span className="block text-white/90 text-[0.62em]">No money at risk.</span>
              </h1>
              <p className="mt-7 max-w-xl text-[16px] leading-relaxed text-snow/80">
                Обучающая игра о криптотрейдинге в духе Duolingo — но для взрослых. 57 уроков, мини-игр и тренажёров,
                дуэли, лиги и экономика наград. Каждый ответ на странице засчитывается в общий прогресс — смотри на панель внизу экрана.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#practice"><Btn tone="bull" size="lg"><Play size={18} /> Start practice</Btn></a>
                <a href="#learn"><Btn tone="sky" size="lg"><GraduationCap size={18} /> Learn</Btn></a>
                <a href="#play"><GhostBtn className="!h-14 !px-7 !text-xs">Play the demo</GhostBtn></a>
              </div>
              <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[[total, "Assets"], [57, "Games & lessons"], [27, "Motion patterns"], [0, "Duplicates"]].map(([v, l]) => (
                  <div key={l as string} className="rounded-2xl border border-white/8 bg-white/5 p-3 text-center backdrop-blur">
                    <div className="num text-2xl font-extrabold text-white">{v}</div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-mist">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <PhonePreview />
          </div>
          <div className="relative flex flex-col items-center gap-2 pb-8">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-mist">
              <LogoMark size={22} variant="bevel" /> scroll to explore
            </div>
            <ArrowDown size={18} className="anim-float text-sky" />
          </div>
        </section>

        <Ticker />

        <div className="mx-auto max-w-[1560px] space-y-24 px-4 py-20 sm:px-6">
          <GameDemo />
          <Journey />
          <Lessons />
          <Practice />
          <Practice2 />
          <Practice3 />
          <Dojo />
          <Sandbox />
          <Trials />
          <Events />
          <Clans />
          <Coach />
          <MotionLab />
          <PlayLab />
          <Foundations />
          <Controls />
          <Navigation />
          <ArtBand
            img={duelArt}
            kicker="Signature mode · 1v1"
            title="Каждый экран — сцена, а не слой"
            text="Окружения, свет и цвет собираются в один мир: холодный синий ключ, тёплые акценты наград, туман между слоями.
                  Интерфейс ложится поверх арта со скримом 55% и всегда держит контраст."
          />
          <Learning />
          <Trading />
          <Rewards />
          <ArtBand
            img={vaultArt}
            kicker="Reward economy"
            title="Награда должна ощущаться физически"
            text="Сундуки открываются с накоплением, лут вылетает конфетти, кристаллы уходят со счётчика со звуком и виброоткликом.
                  Каждый элемент экономики имеет вес, тень и глубину нажатия."
            align="right"
          />
          <Feedback />
          <Shop />
          <Social />
          <Onboarding />
          <Identity />
          <GameArt />
          <Audio />
          <Access />

          {/* coverage */}
          <section className="panel relative overflow-hidden p-6 sm:p-10">
            <img src={terrain} alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 to-ink-900/70" />
            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
              <div className="flex items-center gap-5">
                <Mascot size={130} mood="hype" />
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-mist">Coverage checklist</div>
                  <div className="text-gradient-gold font-display text-7xl font-black">{total}</div>
                  <div className="text-[12px] text-mist">интерактивных ассетов + играбельное демо</div>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                {score.map(([t, d]) => (
                  <div key={t} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 p-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bull/15 text-bull"><Check size={18} strokeWidth={3} /></span>
                    <div className="min-w-0"><div className="text-[13px] font-extrabold">{t}</div><div className="truncate text-[11px] text-mist">{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* footer */}
        <footer className="relative overflow-hidden border-t border-white/8 bg-ink-950 pb-24">
          <div className="mx-auto max-w-[1560px] px-4 py-14 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <Lockup />
                <p className="mt-4 max-w-md text-[12px] leading-relaxed text-mist">
                  Единый каталог UI-ассетов для обучающей игры о криптотрейдинге. Векторный знак, токены, движение,
                  звук и гаптика — всё собрано в одной системе.
                </p>
              </div>
              <div className="flex items-center gap-6">
                {[24, 40, 64, 96].map((s) => <LogoMark key={s} size={s} variant="bevel" className="opacity-80 transition hover:opacity-100 hover:-translate-y-1" />)}
              </div>
            </div>
            <div className="mt-12 select-none overflow-hidden">
              <div className="font-display text-[clamp(46px,13vw,190px)] font-black leading-[0.82] tracking-[-0.05em] text-white/6">
                CANDLE<span className="text-gold/15">QUEST</span>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6 text-[11px] text-mist/70">
              <span>© 2026 CandleQuest UI · dark-navy tactile system · React + Tailwind</span>
              <span className="flex items-center gap-2"><LogoMark size={18} variant="mono" style={{ color: "#8a9bc4" }} /> sound &amp; haptics are procedural</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
