import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCircle2, Flame, Gem, Heart, Info, Layers, Menu, ShieldAlert, Volume2, VolumeX, X, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Carousels from "./sections/Carousels";
import SwipeLab from "./sections/SwipeLab";
import ParallaxWorld from "./sections/ParallaxWorld";
import SlidersLab from "./sections/SlidersLab";
import MiniGames from "./sections/MiniGames";
import MotionLab from "./sections/MotionLab";
import ChartsLab from "./sections/ChartsLab";
import StoriesFlows from "./sections/StoriesFlows";
import DuelArena from "./sections/DuelArena";
import Collection from "./sections/Collection";
import PatternTrainer from "./sections/PatternTrainer";
import AppSimulator from "./sections/AppSimulator";
import GameplayHub from "./sections/GameplayHub";
import GameModesPro from "./sections/GameModesPro";
import EffectsPlayground from "./sections/EffectsPlayground";
import SeasonPass from "./sections/SeasonPass";
import LiveOps from "./sections/LiveOps";
import SocialClans from "./sections/SocialClans";
import PaperArena from "./sections/PaperArena";
import BossRush from "./sections/BossRush";
import IndicatorsLab from "./sections/IndicatorsLab";
import AchievementGallery from "./sections/AchievementGallery";
import QuestBoard from "./sections/QuestBoard";
import CosmeticForge from "./sections/CosmeticForge";
import HighlightTheater from "./sections/HighlightTheater";
import DailyRun from "./sections/DailyRun";
import CurriculumTree from "./sections/CurriculumTree";
import Mentorship from "./sections/Mentorship";
import ScenarioDrill from "./sections/ScenarioDrill";
import PracticeSuite from "./sections/PracticeSuite";
import ExhibitionMap from "./sections/ExhibitionMap";
import MtfAnalysis from "./sections/MtfAnalysis";
import DepthChamber from "./sections/DepthChamber";
import PatternScanner from "./sections/PatternScanner";
import PortfolioCenter from "./sections/PortfolioCenter";
import NewsTimeline from "./sections/NewsTimeline";
import StrategyConstructor from "./sections/StrategyConstructor";
import VolatilityReactor from "./sections/VolatilityReactor";
import HistoryRoom from "./sections/HistoryRoom";
import RiskMatrix from "./sections/RiskMatrix";
import WorkspaceBuilder from "./sections/WorkspaceBuilder";
import WhaleRadar from "./sections/WhaleRadar";
import MarketReplay from "./sections/MarketReplay";
import LiquidityPool from "./sections/LiquidityPool";
import LiquidityHeatmap from "./sections/LiquidityHeatmap";
import CorrelationGalaxy from "./sections/CorrelationGalaxy";
import ChartComparator from "./sections/ChartComparator";
import CandleAnatomy from "./sections/CandleAnatomy";
import SessionClock from "./sections/SessionClock";
import LiquidationCascade from "./sections/LiquidationCascade";
import SentimentTerrain from "./sections/SentimentTerrain";
import DrawingStudio from "./sections/DrawingStudio";
import ArbitrageNetwork from "./sections/ArbitrageNetwork";
import MarketMakerConsole from "./sections/MarketMakerConsole";
import FootprintChart from "./sections/FootprintChart";

import { BackToTop, CursorGlow, FloatingCoins, Odometer, ScrollProgress, SectionRail } from "./fx/effects";
import { setMuted, sfx } from "./fx/sfx";
import Hero from "./sections/Hero";
import Foundations from "./sections/Foundations";
import Controls from "./sections/Controls";
import TradingLab from "./sections/TradingLab";
import LearnPath from "./sections/LearnPath";
import Gamification from "./sections/Gamification";
import Feedback from "./sections/Feedback";
import NavigationDemo from "./sections/NavigationDemo";

type Toast = { id: number; t: string; s: string; tone: string };

const nav = [
  { id: "foundations", n: "01 · Foundations" },
  { id: "controls", n: "02 · Controls" },
  { id: "trading", n: "03 · Trading Lab" },
  { id: "learn", n: "04 · Learn Path" },
  { id: "game", n: "05 · Gamification" },
  { id: "feedback", n: "06 · Feedback" },
  { id: "nav", n: "07 · Navigation" },
  { id: "carousels", n: "08 · Carousels" },
  { id: "swipe", n: "09 · Swipe Lab" },
  { id: "parallax", n: "10 · Parallax" },
  { id: "sliders", n: "11 · Sliders" },
  { id: "games", n: "12 · Mini Games" },
  { id: "motion", n: "13 · Motion Lab" },
  { id: "charts", n: "14 · Charts" },
  { id: "flows", n: "15 · Flows" },
  { id: "duel", n: "16 · Duel Arena" },
  { id: "collection", n: "17 · Collection" },
  { id: "trainer", n: "18 · Trainer" },
  { id: "simulator", n: "19 · Simulator" },
  { id: "gameplay", n: "20 · Gameplay" },
  { id: "modes-pro", n: "21 · Modes Pro" },
  { id: "effects", n: "22 · Effects" },
  { id: "season", n: "23 · Season" },
  { id: "liveops", n: "24 · Live Ops" },
  { id: "social", n: "25 · Social" },
  { id: "paper", n: "26 · Paper Arena" },
  { id: "bossrush", n: "27 · Boss Rush" },
  { id: "indicators", n: "28 · Indicators" },
  { id: "achievements", n: "29 · Achievements" },
  { id: "quest", n: "30 · Quest" },
  { id: "forge", n: "31 · Forge" },
  { id: "theater", n: "32 · Theater" },
  { id: "dailyrun", n: "33 · Daily Run" },
  { id: "curriculum", n: "34 · Curriculum" },
  { id: "mentor", n: "35 · Mentor" },
  { id: "scenarios", n: "36 · Scenarios" },
  { id: "practice", n: "37 · Practice" },
  { id: "exhibition", n: "∞ · Exhibition Map" },
  { id: "mtf", n: "38 · MTF" },
  { id: "depth", n: "39 · Depth" },
  { id: "scanner", n: "40 · Scanner" },
  { id: "portfolio", n: "41 · Portfolio" },
  { id: "news", n: "42 · News" },
  { id: "strategy", n: "43 · Strategy" },
  { id: "volatility", n: "44 · Volatility" },
  { id: "history", n: "45 · History" },
  { id: "riskmatrix", n: "46 · Risk Matrix" },
  { id: "workspace", n: "47 · Workspace" },
  { id: "whales", n: "48 · Whales" },
  { id: "replay", n: "49 · Replay" },
  { id: "liquidity", n: "50 · Liquidity Pool" },
  { id: "heatmap", n: "51 · Heatmap" },
  { id: "galaxy", n: "52 · Galaxy" },
  { id: "compare", n: "53 · Compare" },
  { id: "anatomy", n: "54 · Candle 3D" },
  { id: "sessions", n: "55 · Sessions" },
  { id: "liquidations", n: "56 · Cascade" },
  { id: "terrain", n: "57 · Terrain" },
  { id: "drawing", n: "58 · Drawing" },
  { id: "arbitrage", n: "59 · Arbitrage" },
  { id: "marketmaker", n: "60 · Market Maker" },
  { id: "footprint", n: "61 · Footprint" },
];

const toneStyle: Record<string, { bg: string; icon: typeof Info }> = {
  green: { bg: "from-[#8ef23c] to-[#4e9c14] text-[#0a2210]", icon: CheckCircle2 },
  gold: { bg: "from-[#ffd76a] to-[#e79a06] text-[#3a2200]", icon: Zap },
  blue: { bg: "from-[#7aa5ff] to-[#3358d6] text-white", icon: Bell },
  short: { bg: "from-[#ff8ba0] to-[#c81d47] text-white", icon: ShieldAlert },
  long: { bg: "from-[#5ff5a8] to-[#0fa968] text-[#04231a]", icon: CheckCircle2 },
  ghost: { bg: "from-[#3a4c7d] to-[#1a2a52] text-white", icon: Info },
};

export default function App() {
  const [xp, setXp] = useState(4380);
  const [gems, setGems] = useState(240);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [menu, setMenu] = useState(false);
  const [mute, setMute] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [streak] = useState(12);
  useEffect(() => { setMuted(mute); }, [mute]);

  const push = useCallback((t: string, s: string, tone: string = "green") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, t, s, tone }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3400);
    if (tone === "short") sfx.error(); else if (tone === "gold") sfx.coin(); else sfx.pop();
  }, []);
  const addXp = useCallback((n: number) => setXp(v => v + n), []);

  return (
    <div className="tactile-bg relative min-h-screen">
      <ScrollProgress />
      <CursorGlow />
      <FloatingCoins n={12} />
      <SectionRail items={nav} />
      <BackToTop />
      {/* Top nav */}
      <div className="sticky top-0 z-[80] border-b border-white/10 bg-[#050c22]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-b from-[#a4ff5e] to-[#4e9c14] text-base font-black text-[#0a2210]" style={{ boxShadow: "0 4px 0 #2c5c08, inset 0 1px 0 rgba(255,255,255,.5)" }}>T</span>
            <span className="leading-none">
              <span className="display block text-[15px] font-extrabold text-white">TRADELINGO</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ef23c]">asset catalog</span>
            </span>
          </a>
          <nav className="no-scrollbar ml-4 hidden max-w-[640px] items-center gap-1 overflow-x-auto xl:flex">
            {nav.map(v => (
              <a key={v.id} href={"#" + v.id} className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#8ea6d8] transition hover:bg-white/5 hover:text-white">{v.n}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="panel-inset hidden items-center gap-1.5 !rounded-xl px-2.5 py-1.5 sm:flex">
              <Flame size={14} className="text-[#ff8b3d]" /><b className="num-mono text-xs text-white">12</b>
            </span>
            <span className="panel-inset hidden items-center gap-1.5 !rounded-xl px-2.5 py-1.5 sm:flex">
              <Zap size={14} className="text-[#8ef23c]" /><b className="text-xs text-white"><Odometer value={xp} /></b>
            </span>
            <span className="panel-inset flex items-center gap-1.5 !rounded-xl px-2.5 py-1.5">
              <Gem size={14} className="text-[#5b8cff]" /><b className="text-xs text-white"><Odometer value={gems} /></b>
            </span>
            <span className="panel-inset hidden items-center gap-1.5 !rounded-xl px-2.5 py-1.5 md:flex">
              <Heart size={14} className="fill-[#ff5470] text-[#ff5470]" /><b className="num-mono text-xs text-white">5</b>
            </span>
            <button onClick={() => setMute(m => !m)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl" aria-label="sound">{mute ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
            <button onClick={() => setMenu(!menu)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl xl:hidden"><Menu size={17} /></button>
          </div>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10 xl:hidden">
              <div className="grid grid-cols-2 gap-1.5 p-3">
                {nav.map(v => (
                  <a key={v.id} href={"#" + v.id} onClick={() => setMenu(false)}
                    className="rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-xs font-extrabold text-[#c9d8ff]">{v.n}</a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      <Hero xp={xp} setXp={setXp} gems={gems} />

      {/* Quick strip */}
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="panel-3d flex items-center gap-3 overflow-x-auto no-scrollbar !rounded-2xl p-3">
          <span className="flex shrink-0 items-center gap-2 pl-2 text-[11px] font-extrabold uppercase tracking-widest text-[#8ea6d8]"><Layers size={14} /> Jump to</span>
          {nav.map(v => (
            <a key={v.id} href={"#" + v.id} className="btn3d btn3d-ghost shrink-0 px-4 py-2.5 text-[10px]">{v.n}</a>
          ))}
        </div>
      </div>

      <main className="relative z-10">
        <Foundations />
        <Controls onToast={push} />
        <TradingLab onToast={push} />
        <LearnPath onXp={addXp} />
        <Gamification xp={xp} gems={gems} setGems={setGems} onXp={addXp} onToast={push} />
        <Feedback onToast={push} />
        <NavigationDemo />
        <Carousels />
        <SwipeLab />
        <ParallaxWorld />
        <SlidersLab />
        <MiniGames onXp={addXp} onGems={(n) => setGems(g => g + n)} />
        <MotionLab />
        <ChartsLab />
        <StoriesFlows />
        <DuelArena onXp={addXp} />
        <Collection />
        <PatternTrainer onXp={addXp} />
        <AppSimulator xp={xp} />
        <GameplayHub xp={xp} gems={gems} hearts={hearts} streak={streak} setXp={setXp} setGems={setGems} setHearts={setHearts} toast={push} />
        <GameModesPro onXp={addXp} onGems={(n) => setGems(g => g + n)} toast={push} />
        <EffectsPlayground />
        <SeasonPass onXp={addXp} onGems={(n) => setGems(g => g + n)} toast={push} />
        <LiveOps onXp={addXp} onGems={(n) => setGems(g => g + n)} toast={push} />
        <SocialClans onXp={addXp} toast={push} />
        <PaperArena onXp={addXp} toast={push} />
        <BossRush onXp={addXp} onGems={(n) => setGems(g => g + n)} toast={push} />
        <IndicatorsLab />
        <AchievementGallery onXp={addXp} toast={push} />
        <QuestBoard onXp={addXp} onGems={(n) => setGems(g => g + n)} toast={push} />
        <CosmeticForge gems={gems} setGems={setGems} toast={push} />
        <HighlightTheater toast={push} />
        <DailyRun onXp={addXp} onGems={(n) => setGems(g => g + n)} toast={push} />
        <CurriculumTree onXp={addXp} toast={push} />
        <Mentorship onXp={addXp} toast={push} />
        <ScenarioDrill onXp={addXp} toast={push} />
        <PracticeSuite onXp={addXp} toast={push} />
        <ExhibitionMap />
        <MtfAnalysis />
        <DepthChamber />
        <PatternScanner />
        <PortfolioCenter />
        <NewsTimeline />
        <StrategyConstructor />
        <VolatilityReactor />
        <HistoryRoom />
        <RiskMatrix />
        <WorkspaceBuilder />
        <WhaleRadar />
        <MarketReplay />
        <LiquidityPool />
        <LiquidityHeatmap />
        <CorrelationGalaxy />
        <ChartComparator />
        <CandleAnatomy />
        <SessionClock />
        <LiquidationCascade />
        <SentimentTerrain />
        <DrawingStudio />
        <ArbitrageNetwork />
        <MarketMakerConsole />
        <FootprintChart />
      </main>

      <footer className="mx-auto w-full max-w-[1280px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="panel-3d overflow-hidden p-8 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#8ef23c]">Tradelingo · Exhibition v6.0 · Large Scenes</p>
          <h3 className="display mx-auto mt-2 max-w-xl text-2xl font-extrabold text-white sm:text-3xl">Выставка крупных интерактивных систем.</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#8ea6d8]">Каждый раздел — самодостаточная сцена: MTF-синхронизация, 3D-глубина, сканер паттернов, конструктор стратегий, реактор волатильности и другие концепты.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="#trading" className="btn3d btn3d-green px-7 py-3.5 text-xs">Начать с Trading Lab</a>
            <a href="#learn" className="btn3d btn3d-gold px-7 py-3.5 text-xs">Пройти урок · +20 XP</a>
          </div>
          <p className="num-mono mt-6 text-[11px] text-[#54678f]">61 exhibition scenes · dark-navy #050C22 · synced charts · 2D/3D · timelines · constructors</p>
        </div>
      </footer>

      {/* Toasts */}
      <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[320px] max-w-[calc(100vw-32px)] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map(t => {
            const st = toneStyle[t.tone] ?? toneStyle.green;
            const Icon = st.icon;
            return (
              <motion.div key={t.id} layout initial={{ x: 120, opacity: 0, scale: .9 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: 120, opacity: 0, scale: .9 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="panel-3d pointer-events-auto flex items-center gap-3 !rounded-2xl p-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b ${st.bg}`} style={{ boxShadow: "0 3px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.4)" }}>
                  <Icon size={18} strokeWidth={2.6} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-extrabold text-white">{t.t}</span>
                  <span className="block truncate text-[11px] text-[#8ea6d8]">{t.s}</span>
                </span>
                <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-[#54678f] hover:text-white"><X size={15} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
