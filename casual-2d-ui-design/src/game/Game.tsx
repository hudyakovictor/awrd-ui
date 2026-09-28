import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coin, Gem } from "../lib/ui";
import { Candles } from "../lib/fx";
import { BottomNav, Tab, TopBar } from "./hud";
import { CollectionScreen, MapScreen, MenuScreen, ShopScreen } from "./screens";
import Academy from "./Academy";
import Battle, { BattleResult } from "./Battle";
import { ChestVictory, Daily, Defeat, MonsterSheet, PauseBox, PreFight, SettingsBox } from "./popups";
import { DAILY, LEVELS, LevelNode, Monster, MONSTERS, ShopItem } from "../data/kit";

export const PH_W = 340;
export const PH_H = 720;

/* ─────────── phone frame ─────────── */
export function Phone({ children, scale = 1, className = "", label }: { children: ReactNode; scale?: number; className?: string; label?: string }) {
  return (
    <div className={className} style={{ width: PH_W * scale }}>
      <div style={{ width: PH_W * scale, height: PH_H * scale }}>
        <div className="phone" style={{ width: PH_W, height: PH_H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0d1d44 0%,#0a1735 45%,#071230 100%)" }} />
          <div className="grid-bg absolute inset-0 opacity-50" />
          <div className="absolute inset-0 opacity-60"><Candles n={22} op={0.14} /></div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-aqua/10 to-transparent" />
          <div className="relative z-10 flex h-full flex-col">{children}</div>
          <span className="pointer-events-none absolute left-1/2 top-[7px] z-40 h-[5px] w-[86px] -translate-x-1/2 rounded-full bg-black/45" />
        </div>
      </div>
      {label && <div className="mt-4 text-center font-display text-[12px] font-extrabold uppercase italic tracking-wider text-sky/60">{label}</div>}
    </div>
  );
}

/* ─────────── live game ─────────── */
type Mode = "boot" | "menu" | "hub" | "battle";

export function Game({ scale = 1 }: { scale?: number }) {
  const [mode, setMode] = useState<Mode>("boot");
  const [tab, setTab] = useState<Tab>("map");
  const [coins, setCoins] = useState(12480);
  const [gems, setGems] = useState(240);
  const [energy, setEnergy] = useState(42);
  const [claimed, setClaimed] = useState(2);
  const [learned, setLearned] = useState<Set<string>>(new Set(["hammer", "bullEng"]));
  const [pre, setPre] = useState<LevelNode | null>(null);
  const [fight, setFight] = useState<LevelNode | null>(null);
  const [mon, setMon] = useState<Monster | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [set, setSet] = useState(false);
  const [daily, setDaily] = useState(false);
  const [pause, setPause] = useState(false);
  const [reward, setReward] = useState<BattleResult | null>(null);
  const [lose, setLose] = useState(false);
  const [toast, setToast] = useState<{ id: number; t: string; i: ReactNode } | null>(null);
  const [mapKey, setMapKey] = useState(0);
  const [battleKey, setBattleKey] = useState(0);

  useEffect(() => {
    if (mode !== "boot") return;
    const t = setTimeout(() => setMode("menu"), 2300);
    return () => clearTimeout(t);
  }, [mode]);

  const say = (t: string, i: ReactNode) => {
    const id = Date.now();
    setToast({ id, t, i });
    setTimeout(() => setToast((p) => (p?.id === id ? null : p)), 2200);
  };

  const start = () => { setFight(pre); setPre(null); setEnergy((e) => Math.max(0, e - 5)); setBattleKey((k) => k + 1); setMode("battle"); };

  const onWin = (r: BattleResult) => {
    if (fight) {
      fight.stars = r.stars;
      const nx = LEVELS.find((l) => l.id === fight.id + 1);
      if (nx && nx.stars < 0) nx.stars = 0;
    }
    setReward(r);
  };

  const collect = () => {
    if (reward) {
      setCoins((c) => c + reward.coins);
      setGems((g) => g + 12);
      setLearned((s) => new Set([...s, reward.patternId]));
      say("Урок добавлен в академию", <Gem s={14} />);
    }
    setReward(null); setFight(null); setMode("hub"); setTab("map"); setMapKey((k) => k + 1);
  };

  const claimDay = () => {
    const d = DAILY[claimed];
    if (!d || d.day !== claimed + 1 && claimed >= 7) return;
    if (d.kind === "coins") setCoins((c) => c + +d.label);
    if (d.kind === "gems") setGems((g) => g + +d.label);
    if (d.kind === "energy") setEnergy((e) => Math.min(60, e + +d.label));
    if (d.kind === "chest") setGems((g) => g + 120);
    setClaimed((n) => n + 1);
    say(`Награда дня ${d.day} получена`, d.kind === "gems" ? <Gem s={14} /> : <Coin s={14} />);
  };

  const buy = (i: ShopItem) => {
    setCoins((c) => c + (i.add.coins ?? 0));
    setGems((g) => g + (i.add.gems ?? 0));
    say(`«${i.title}» — демо-покупка`, i.add.gems ? <Gem s={14} /> : <Coin s={14} />);
  };

  const lesson = (id: string) => { setFocus(id); setTab("academy"); };
  const foe = fight?.enemy ? MONSTERS.find((m) => m.id === fight.enemy) : undefined;

  return (
    <Phone scale={scale}>
      <AnimatePresence mode="wait">
        {mode === "boot" && <Boot key="z" />}
        {mode === "menu" && (
          <motion.div key="m" className="flex h-full flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: .25 }}>
            <MenuScreen onPlay={() => setMode("hub")} onDaily={() => setDaily(true)} />
          </motion.div>
        )}
        {mode === "hub" && (
          <motion.div key="h" className="flex h-full flex-col" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: .22 }}>
            <TopBar coins={coins} gems={gems} energy={energy}
              onSettings={() => setSet(true)} onShop={() => setTab("shop")} onDaily={() => setDaily(true)} dailyDot={claimed < 3} />
            <AnimatePresence mode="wait">
              <motion.div key={tab} className="flex min-h-0 flex-1 flex-col"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .15 }}>
                {tab === "map" && <MapScreen key={mapKey} onNode={setPre} onLesson={lesson} />}
                {tab === "heroes" && <CollectionScreen onPick={setMon} />}
                {tab === "academy" && <Academy unlocked={learned} focus={focus} />}
                {tab === "shop" && <ShopScreen onBuy={buy} />}
              </motion.div>
            </AnimatePresence>
            <BottomNav tab={tab} onTab={(t) => { setFocus(null); setTab(t); }}
              onPlay={() => { setTab("map"); setPre(LEVELS.find((l) => l.stars === 0 && (l.type === "battle" || l.type === "elite")) ?? null); }}
              dot />
          </motion.div>
        )}
        {mode === "battle" && (
          <motion.div key="b" className="h-full" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: .28 }}>
            <Battle key={battleKey} enemyId={fight?.enemy ?? "fomo"} patternId={fight?.pattern} level={fight?.id ?? 5} live
              onPause={() => setPause(true)} onWin={onWin} onLose={() => setLose(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsBox open={set} onClose={() => setSet(false)} />
      <Daily open={daily} claimed={claimed} onClaim={claimDay} onClose={() => setDaily(false)} />
      <PreFight level={pre} onClose={() => setPre(null)} onStart={start} />
      <MonsterSheet m={mon} owned={!!mon && ["dopamine", "wick", "paper", "fomo"].includes(mon.id)} onClose={() => setMon(null)} />
      <PauseBox open={pause} onResume={() => setPause(false)} onQuit={() => { setPause(false); setMode("hub"); }} />
      <ChestVictory open={!!reward} stars={reward?.stars} coins={reward?.coins} patternId={reward?.patternId} onCollect={collect} />
      <Defeat open={lose} enemy={foe?.name} lesson={foe?.lesson}
        onRetry={() => { setLose(false); setMode("hub"); setTimeout(() => setPre(fight), 220); }}
        onExit={() => { setLose(false); setFight(null); setMode("hub"); }} />

      <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[80] flex justify-center px-6">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} initial={{ y: 26, scale: .85, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 22 }}
              className="pnl-glass flex items-center gap-2 rounded-full px-4 py-2">
              {toast.i}
              <span className="font-display text-[11.5px] font-bold text-white/90">{toast.t}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Phone>
  );
}

/* ─────────── boot / loading ─────────── */
function Boot() {
  return (
    <motion.div className="absolute inset-0 z-[85] flex flex-col items-center justify-center"
      style={{ background: "radial-gradient(400px 300px at 50% 35%, #12275c, #060e24 70%)" }}
      exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }} transition={{ duration: 0.35 }}>
      <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 13 }} className="relative">
        <div className="a-breathe absolute inset-[-28px] rounded-full bg-teal/15 blur-2xl" />
        <div className="relative grid h-[88px] w-[88px] place-items-center rounded-[26px]"
          style={{ background: "linear-gradient(160deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 3px 0 rgba(255,255,255,.6), inset 0 -9px 0 #056a80, 0 20px 40px -10px rgba(24,226,198,.65)" }}>
          <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
            <motion.path d="M6 30 L16 20 L24 26 L42 8" stroke="#04303f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="80" initial={{ strokeDashoffset: 80 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.9, delay: .25, ease: "easeOut" }} />
            <motion.path d="M32 8h10v10" stroke="#04303f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="30" initial={{ strokeDashoffset: 30 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.4, delay: 1, ease: "easeOut" }} />
          </svg>
        </div>
      </motion.div>
      <div className="tstrok-sm mt-6 font-display text-[26px] font-black italic tracking-tight">
        SIGNAL <span className="tstrok-teal" style={{ WebkitTextStrokeColor: "#06364a" }}>ARENA</span>
      </div>
      <div className="well mt-5 h-3.5 w-52 overflow-hidden">
        <motion.div className="fill h-full" style={{ background: "linear-gradient(90deg,#1ff0c8,#11c3e8)" }}
          initial={{ width: "4%" }} animate={{ width: "100%" }} transition={{ duration: 1.7, ease: [0.3, 0.7, 0.4, 1] }} />
      </div>
      <p className="mt-3 px-10 text-center font-body text-[11px] font-bold leading-snug text-sky/60">
        Студия «Учимся торговать». Совет: Фитиль-Мимик боится подтверждения телом свечи.
      </p>
    </motion.div>
  );
}

/* ─────────── gallery static screens ─────────── */
export function StaticScreen({ id }: { id: string }) {
  const top = <TopBar coins={12480} gems={240} energy={42} />;
  const nav = (t: Tab, d = false) => <BottomNav tab={t} onTab={() => {}} dot={d} />;
  switch (id) {
    case "menu": return <MenuScreen />;
    case "map": return <>{top}<MapScreen />{nav("map", true)}</>;
    case "prefight": return <>{top}<MapScreen />{nav("map")}<PreFight level={LEVELS[4]} /></>;
    case "battle": return <Battle enemyId="fomo" live={false} />;
    case "victory": return (<><Battle enemyId="fomo" live={false} /><ChestVictory open stars={3} coins={280} patternId="bullEng" auto /></>);
    case "defeat": return (<><Battle enemyId="chimera" live={false} /><Defeat open lesson="входящий из-за FOMO уже опоздал" /></>);
    case "academy": return <>{top}<Academy unlocked={new Set(["hammer", "bullEng", "shoot"])} />{nav("academy")}</>;
    case "heroes": return <>{top}<CollectionScreen />{nav("heroes")}</>;
    case "sheet": return <>{top}<CollectionScreen />{nav("heroes")}<MonsterSheet m={MONSTERS.find((m) => m.id === "chimera")!} /></>;
    case "shop": return <>{top}<ShopScreen />{nav("shop")}</>;
    case "daily": return <>{top}<MapScreen />{nav("map")}<Daily open claimed={2} /></>;
    case "settings": return (<><MenuScreen /><SettingsBox open /></>);
    default: return null;
  }
}

export const GALLERY: { id: string; label: string }[] = [
  { id: "menu", label: "Главный экран" },
  { id: "map", label: "Карта уровней" },
  { id: "prefight", label: "Перед боем" },
  { id: "battle", label: "Трейдинг-бой" },
  { id: "victory", label: "Победа + сундук" },
  { id: "defeat", label: "Поражение" },
  { id: "academy", label: "Академия" },
  { id: "heroes", label: "Бестиарий" },
  { id: "sheet", label: "Карточка монстра" },
  { id: "shop", label: "Магазин" },
  { id: "daily", label: "Награды дня" },
  { id: "settings", label: "Настройки" },
];
