import { useEffect, useState } from "react";
import { Btn3D, ToastProvider, Badge, CountUp, useToast } from "./components/ui";
import { Glyph, Icon } from "./components/Icons";
import { cn } from "./utils/cn";
import { isSfxEnabled, setSfxEnabled, sfx } from "./utils/sfx";
import { isMusicOn, setMusicEnabled } from "./utils/music";
import { FxLayer } from "./utils/fx";
import { PlayGame } from "./sections/PlayGame";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import Navigation from "./sections/Navigation";
import Gamification from "./sections/Gamification";
import Learning from "./sections/Learning";
import Trading from "./sections/Trading";
import DataDisplay from "./sections/DataDisplay";
import Feedback from "./sections/Feedback";
import Carousels from "./sections/Carousels";
import Sliders from "./sections/Sliders";
import Gestures from "./sections/Gestures";
import ScrollFX from "./sections/ScrollFX";
import MotionFX from "./sections/MotionFX";
import Rewards from "./sections/Rewards";
import Transitions from "./sections/Transitions";
import MicroInteractions from "./sections/MicroInteractions";
import { BackToTop, CursorGlow, ScrollProgress } from "./components/ScrollChrome";
import { usePointer, useScrollDirection, useScrollY, useSpring, SplitReveal } from "./hooks/motion";
import { Mascot } from "./sections/Mascot";
import { CommandPalette } from "./components/CommandPalette";
import Store from "./sections/Store";
import Screens from "./sections/Screens";
import MascotSection from "./sections/Mascot";
import JuiceLab from "./sections/JuiceLab";
import PlaySection from "./sections/PlayGame";
import ParticleLab from "./sections/ParticleLab";
import TextFX from "./sections/TextFX";
import Loaders from "./sections/Loaders";
import Perspective3D from "./sections/Perspective3D";
import ChartFX from "./sections/ChartFX";
import ButtonLab from "./sections/ButtonLab";
import Backgrounds from "./sections/Backgrounds";
import Celebrations from "./sections/Celebrations";
import CursorLab from "./sections/CursorLab";
import AvatarLab from "./sections/AvatarLab";
import SoundVisual from "./sections/SoundVisual";
import IconFX from "./sections/IconFX";
import CardLab from "./sections/CardLab";
import TourLab from "./sections/TourLab";
import TimeLab from "./sections/TimeLab";

const NAV = [
  { id: "foundations", l: "Foundations", i: "layers" },
  { id: "controls", l: "Controls", i: "grid" },
  { id: "navigation", l: "Navigation", i: "menu" },
  { id: "gamification", l: "Gamification", i: "trophy" },
  { id: "learning", l: "Learning", i: "book" },
  { id: "trading", l: "Trading", i: "candles" },
  { id: "data", l: "Data Display", i: "chart" },
  { id: "feedback", l: "Feedback", i: "bell" },
  { id: "carousels", l: "Carousels", i: "swap" },
  { id: "sliders", l: "Sliders & Dials", i: "target" },
  { id: "gestures", l: "Gestures", i: "dumbbell" },
  { id: "scroll", l: "Scroll & Parallax", i: "arrowDown" },
  { id: "motionfx", l: "Motion FX", i: "bolt" },
  { id: "rewards", l: "Mini-games", i: "gift" },
  { id: "transitions", l: "Transitions", i: "refresh" },
  { id: "micro", l: "Micro-interactions", i: "heart" },
  { id: "store", l: "Economy & Shop", i: "wallet" },
  { id: "screens", l: "Game Screens", i: "users" },
  { id: "mascot", l: "Mascot & Juice", i: "crown" },
  { id: "juice", l: "Juice Lab", i: "sparkles" },
  { id: "play", l: "Playable Lesson", i: "play" },
  { id: "particles", l: "Particle Lab", i: "star" },
  { id: "textfx", l: "Text FX", i: "sort" },
  { id: "loaders", l: "Loaders", i: "refresh" },
  { id: "p3d", l: "3D & Perspective", i: "layers" },
  { id: "chartfx", l: "Chart FX", i: "chart" },
  { id: "buttons", l: "Button Lab", i: "grid" },
  { id: "backgrounds", l: "Backgrounds", i: "eye" },
  { id: "celebrate", l: "Celebrations", i: "gift" },
  { id: "cursor", l: "Cursor Lab", i: "target" },
  { id: "avatars", l: "Avatar Lab", i: "users" },
  { id: "sound", l: "Sound Visual", i: "volume" },
  { id: "icons", l: "Icon FX", i: "sparkles" },
  { id: "cards", l: "Card Lab", i: "layers" },
  { id: "tour", l: "Tour Lab", i: "users" },
  { id: "time", l: "Time Lab", i: "clock" },
];

function useScrollSpy() {
  const [active, setActive] = useState(NAV[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-25% 0px -65% 0px" });
    NAV.forEach((n) => { const el = document.getElementById(n.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return active;
}

function Header({ onMenu, onPlay }: { onMenu: () => void; onPlay: () => void }) {
  const [snd, setSnd] = useState(isSfxEnabled());
  const [mus, setMus] = useState(isMusicOn());
  const dir = useScrollDirection();
  const y = useScrollY();
  return (
    <header className={cn("sticky top-0 z-[90] backdrop-blur-xl border-b transition-all duration-300 ease-[cubic-bezier(.3,1.1,.4,1)]", dir === "down" ? "-translate-y-full" : "translate-y-0", y > 20 ? "bg-ink-900/85 border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.35)]" : "bg-ink-900/60 border-white/5")}>
      <div className="max-w-[1440px] mx-auto h-16 px-4 lg:px-8 flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden size-10 grid place-items-center rounded-xl hover:bg-white/5" aria-label="Menu"><Icon name="menu" size={22} /></button>
        <a href="#top" className="flex items-center gap-2.5">
          <span className="size-10 rounded-xl bg-gradient-to-b from-[#5af5b4] to-[#12c47a] grid place-items-center shadow-[0_4px_0_#0d9a5c,inset_0_2px_0_rgba(255,255,255,.35)] text-[#03261a]"><Icon name="trendUp" size={22} stroke={3} /></span>
          <span className="leading-none">
            <span className="block font-extrabold text-[17px] tracking-tight">Tradelingo<span className="text-bull">.</span></span>
            <span className="block label-caps !text-[9px] !tracking-[.2em] mt-1">Game Asset Catalog</span>
          </span>
        </a>
        <div className="hidden xl:flex items-center gap-2 ml-4">
          <Badge tone="bull" dot>130+ assets</Badge>
          <Badge tone="gold">Playable</Badge>
          <Badge tone="violet">Music + SFX</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { const n = !mus; setMusicEnabled(n); setMus(n); }} className={cn("h-10 px-2.5 rounded-xl flex items-center gap-1.5 text-[12px] font-extrabold transition", mus ? "bg-violet/20 text-[#b89bff]" : "bg-white/5 text-dim hover:text-mute")} aria-label="Toggle music" title="Фоновая музыка">
            <Icon name={mus ? "play" : "mute"} size={16} />{mus && <span className="hidden sm:flex items-end gap-[2px] h-3.5"><i className="w-[3px] bg-current rounded-full" style={{ animation: "floaty .8s ease-in-out infinite" }} /><i className="w-[3px] bg-current rounded-full" style={{ animation: "floaty .8s .2s ease-in-out infinite" }} /><i className="w-[3px] bg-current rounded-full" style={{ animation: "floaty .8s .4s ease-in-out infinite" }} /></span>}<span className="hidden md:inline">{mus ? "Music" : "Muted"}</span>
          </button>
          <button onClick={() => { setSfxEnabled(!snd); setSnd(!snd); if (!snd) setTimeout(() => sfx.pop(), 10); }} className={cn("h-10 px-2.5 rounded-xl flex items-center gap-1.5 text-[12px] font-extrabold transition", snd ? "bg-bull/15 text-bull" : "bg-white/5 text-dim")} aria-label="Toggle sound" title="Звуковые эффекты">
            <Icon name={snd ? "volume" : "mute"} size={18} /><span className="hidden sm:inline">SFX</span>
          </button>
          <Btn3D size="sm" variant="bull" className="hidden sm:inline-flex" sound="pop" onClick={onPlay} icon={<Icon name="play" size={14} />}>Play</Btn3D>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ active, open, onClose }: { active: string; open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-[95] bg-ink-950/70 lg:hidden anim-fade" onClick={onClose} />}
      <aside className={cn("fixed lg:sticky top-0 lg:top-20 z-[96] lg:z-0 h-screen lg:h-[calc(100vh-6rem)] w-72 lg:w-60 shrink-0 p-4 lg:p-0 bg-ink-900 lg:bg-transparent transition-transform duration-300 lg:translate-x-0 overflow-y-auto", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="panel p-3 h-full lg:h-auto flex flex-col">
          <div className="label-caps px-2 pt-1 pb-3">Разделы</div>
          <nav className="space-y-1">
            {NAV.map((n, i) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => { onClose(); sfx.tick(); }}
                className={cn("flex items-center gap-3 px-2.5 h-11 rounded-xl text-[13px] font-bold transition-all", active === n.id ? "bg-blue/15 text-txt shadow-[inset_0_0_0_2px_rgba(61,123,255,.5)]" : "text-mute hover:text-txt hover:bg-white/5")}>
                <span className={cn("size-7 rounded-lg grid place-items-center transition", active === n.id ? "bg-blue text-white shadow-[0_3px_0_#2250c2]" : "bg-ink-850 text-dim")}><Icon name={n.i} size={15} stroke={2.4} /></span>
                <span className="flex-1">{n.l}</span>
                <span className="num text-[10px] text-dim">{String(i + 1).padStart(2, "0")}</span>
              </a>
            ))}
          </nav>
          <div className="mt-4 inset p-3">
            <div className="flex items-center gap-2 mb-2"><Glyph name="bolt" size={20} /><span className="text-[12px] font-extrabold">Game-feel checklist</span></div>
            <ul className="text-[11px] text-mute space-y-1.5 leading-snug">
              <li>• Juice: частицы, shake, flash, rings</li>
              <li>• Тактильность: 3D-нажатия, ripple, haptics</li>
              <li>• Звук: SFX-библиотека + процедурная музыка</li>
              <li>• Персонаж: реакции маскота на события</li>
              <li>• Играбельность: полный урок с результатами</li>
              <li>• prefers-reduced-motion учтён</li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
}

/* Interactive hero art: mascot follows pointer (spring), glyphs orbit at different depths */
function HeroArt() {
  const [ref, ptr] = usePointer<HTMLDivElement>();
  const mx = useSpring(ptr.x, 110, 14);
  const my = useSpring(ptr.y, 110, 14);
  const [boost, setBoost] = useState(0);
  const G: { g: "coin" | "gem" | "star" | "bolt" | "flame" | "crown"; x: number; y: number; d: number; s: number }[] = [
    { g: "coin", x: 8, y: 18, d: 30, s: 38 }, { g: "gem", x: 78, y: 8, d: 44, s: 42 }, { g: "star", x: 86, y: 62, d: 22, s: 32 },
    { g: "bolt", x: 4, y: 70, d: 38, s: 34 }, { g: "flame", x: 62, y: 84, d: 18, s: 28 }, { g: "crown", x: 30, y: 2, d: 26, s: 30 },
  ];
  return (
    <div ref={ref} className="relative h-[340px] w-full max-w-[380px] mx-auto select-none" onClick={() => { setBoost((b) => b + 1); sfx.levelUp(); }}>
      <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-blue/30 via-violet/20 to-bull/20 blur-2xl" style={{ transform: `translate(${mx * -14}px, ${my * -14}px)` }} />
      <div className="absolute inset-[16%] rounded-full border-2 border-dashed border-blue/20" style={{ animation: "spin-slow 30s linear infinite" }} />
      <div className="absolute inset-[4%] rounded-full border border-white/5" style={{ animation: "spin-slow 50s linear infinite reverse" }} />
      {G.map((g, i) => (
        <div key={i} className="absolute" style={{ left: `${g.x}%`, top: `${g.y}%`, transform: `translate(${mx * g.d}px, ${my * g.d}px)` }}>
          <div className="anim-float" style={{ animationDelay: `${i * 0.35}s` }}><Glyph name={g.g} size={g.s} /></div>
        </div>
      ))}
      <div className="absolute inset-0 grid place-items-center" style={{ transform: `translate(${mx * 10}px, ${my * 8}px) rotate(${mx * 4}deg)` }}>
        <div key={boost} className={boost ? "anim-pop" : ""}><Mascot mood={boost % 2 ? "cheer" : "idle"} size={220} bg={false} /></div>
      </div>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10.5px] font-extrabold text-dim whitespace-nowrap">двигайте мышью · клик</div>
    </div>
  );
}

function Hero({ onPlay }: { onPlay: () => void }) {
  const stats = [
    { v: 130, l: "Интерактивных ассетов", g: "gem" as const },
    { v: 20, l: "Разделов системы", g: "star" as const },
    { v: 13, l: "Видов каруселей", g: "bolt" as const },
    { v: 12, l: "Слайдеров и ручек", g: "flame" as const },
  ];
  const y = useScrollY();
  const k = Math.min(1, y / 650);
  return (
    <section id="top" className="relative mb-16 panel p-6 sm:p-10 overflow-hidden">
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-blue/20 blur-3xl pointer-events-none" style={{ transform: `translateY(${y * 0.3}px)` }} />
      <div className="absolute right-16 bottom-0 size-72 rounded-full bg-violet/15 blur-3xl pointer-events-none" style={{ transform: `translateY(${y * -0.2}px)` }} />
      <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-8 items-center" style={{ transform: `translateY(${y * 0.18}px) scale(${1 - k * 0.06})`, opacity: 1 - k * 0.7, transformOrigin: "50% 0" }}>
        <div>
          <div className="flex flex-wrap gap-2 mb-5"><Badge tone="gold">Award-winning game UI</Badge><Badge tone="bull" dot>Playable inside</Badge><Badge tone="cyan">Mobile-first</Badge></div>
          <h1 className="text-[34px] sm:text-[50px] font-extrabold tracking-tight leading-[1.02]">
            <SplitReveal text="Единый каталог ассетов" stagger={70} /><br /><span className="bg-gradient-to-r from-bull via-cyan to-blue bg-clip-text text-transparent">Tradelingo</span> · crypto trading game
          </h1>
          <p className="text-mute text-[15px] mt-4 max-w-xl leading-relaxed">
            Обучение крипто-трейдингу в духе Duolingo — взрослое, с характером. Тёмно-синий объёмный UI, настоящий персонаж, процедурная музыка, частицы на canvas,
            screen shake и полностью играбельный урок прямо в каталоге.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Btn3D size="lg" variant="bull" sound="pop" onClick={onPlay} icon={<Icon name="play" size={18} />}>Play the lesson</Btn3D>
            <Btn3D size="lg" variant="neutral" onClick={() => document.getElementById("screens")?.scrollIntoView({ behavior: "smooth" })}>Game screens</Btn3D>
          </div>
        </div>
        <HeroArt />
      </div>
      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        <div className="contents">
          {stats.map((s, i) => (
            <div key={s.l} className="raised p-4 anim-pop hover:-translate-y-1 transition-transform" style={{ animationDelay: `${i * 90}ms` }}>
              <Glyph name={s.g} size={30} />
              <CountUp value={s.v} className="block text-[30px] font-extrabold mt-2 leading-none" suffix="+" />
              <div className="text-[11.5px] text-mute font-semibold mt-1.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Shell() {
  const active = useScrollSpy();
  const [menu, setMenu] = useState(false);
  const [play, setPlay] = useState(false);
  const [palette, setPalette] = useState(false);
  const toast = useToast();
  const openPlay = () => { setMenu(false); setPlay(true); sfx.whoosh(); };
  return (
    <div id="shell" className="relative z-10 min-h-screen">
      <CursorGlow />
      <div id="fx-flash" className="fixed inset-0 z-[198] pointer-events-none opacity-0" />
      <FxLayer />
      <ScrollProgress />
      <BackToTop />
      <CommandPalette items={NAV} open={palette} setOpen={setPalette} />
      <button onClick={() => { setPalette(true); sfx.whoosh(); }} className="fixed bottom-5 left-5 z-[110] h-11 px-3.5 rounded-2xl bg-[#13224e] border border-white/10 shadow-[0_4px_0_#081028] hidden md:flex items-center gap-2 text-[12px] font-extrabold text-mute hover:text-txt hover:-translate-y-0.5 transition" aria-label="Open command palette">
        <Icon name="search" size={15} />Jump to…<kbd className="num text-[10px] border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
      <Header onMenu={() => setMenu(true)} onPlay={openPlay} />
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 flex gap-8">
        <Sidebar active={active} open={menu} onClose={() => setMenu(false)} />
        <main className="flex-1 min-w-0">
          <Hero onPlay={openPlay} />
          <Foundations />
          <Controls />
          <Navigation />
          <Gamification />
          <Learning />
          <Trading />
          <DataDisplay />
          <Feedback />
          <Carousels />
          <Sliders />
          <Gestures />
          <ScrollFX />
          <MotionFX />
          <Rewards />
          <Transitions />
          <MicroInteractions />
          <Store />
          <Screens />
          <MascotSection />
          <JuiceLab />
          <PlaySection />
          <ParticleLab />
          <TextFX />
          <Loaders />
          <Perspective3D />
          <ChartFX />
          <ButtonLab />
          <Backgrounds />
          <Celebrations />
          <CursorLab />
          <AvatarLab />
          <SoundVisual />
          <IconFX />
          <CardLab />
          <TourLab />
          <TimeLab />
          <footer className="py-10 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[12px] text-dim">
            <span className="flex items-center gap-2"><Glyph name="shield" size={20} />Tradelingo Design System · Deep Navy Tactile · v4.1</span>
            <span className="num">250+ assets · 36 sections · particles · text-fx · 3d · charts · cursors · avatars · sound · cards · tours · time</span>
          </footer>
        </main>
      </div>
      {play && <PlayOverlay onClose={(xp) => { setPlay(false); if (xp > 0) { toast({ type: "xp", title: `+${xp} XP зачислено`, msg: "Урок «Японские свечи» пройден" }); } }} />}
    </div>
  );
}

/* thin wrapper so the hero Play button reuses the same overlay component */
function PlayOverlay({ onClose }: { onClose: (xp: number) => void }) {
  return <PlayGame open onClose={onClose} />;
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
