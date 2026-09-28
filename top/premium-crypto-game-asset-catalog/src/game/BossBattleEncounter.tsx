import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface BossStage {
  id: string;
  name: string;
  title: string;
  bossHp: number;
  playerHp: number;
  dialogue: string;
  scenario: {
    chartContext: string;
    targetAction: "defend_support" | "short_resistance" | "cut_loss" | "scale_in";
    question: string;
    options: {
      text: string;
      action: "defend_support" | "short_resistance" | "cut_loss" | "scale_in";
      damage: number;
      feedback: string;
    }[];
  };
}

export const BossBattleEncounter: React.FC = () => {
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [currentRound, setCurrentRound] = useState(1);
  const [combatLog, setCombatLog] = useState<string[]>([
    "Encounter started: The Liquidation Whale appears with 50,000 BTC in asks!",
  ]);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [outcome, setOutcome] = useState<"victory" | "defeat" | null>(null);

  const rounds: BossStage[] = [
    {
      id: "round-1",
      name: "The Liquidation Whale",
      title: "Raid Boss: Level 50 Apex Market Maker",
      bossHp: 100,
      playerHp: 100,
      dialogue: "You think your retail indicators can stop my iceberg limit walls? Watch me sweep your stops!",
      scenario: {
        chartContext: "Price tests $67,500 Support for the 4th time with decreasing buy volume. Whale dumps 5,000 BTC.",
        targetAction: "defend_support",
        question: "Massive whale ask wall appears just above market. What counter-measure do you deploy?",
        options: [
          {
            text: "Do NOT FOMO Long into the wall; wait for fakeout sweep and enter on reclaimed reclaim",
            action: "defend_support",
            damage: 40,
            feedback: "CRITICAL HIT! You avoided the whale stop-hunt trap and caught the reclaim bounce!",
          },
          {
            text: "Market Buy 100x right into the iceberg sell wall",
            action: "scale_in",
            damage: -35,
            feedback: "OUCH! The whale's sell wall absorbed your market buy instantly, causing slippage liquidation!",
          },
          {
            text: "Panic dump all spot holdings at the exact bottom",
            action: "cut_loss",
            damage: -20,
            feedback: "MISPLAY! You sold into whale bid liquidity at maximum discount.",
          },
        ],
      },
    },
    {
      id: "round-2",
      name: "The Liquidation Whale",
      title: "Raid Boss: Phase 2 Enrage",
      bossHp: 60,
      playerHp: 65,
      dialogue: "Impressive defense, novice. But can you handle a sudden flash crash cascade?!",
      scenario: {
        chartContext: "Major exchange reports API lag; perpetual funding turns wildly negative as liquidation cascade begins.",
        targetAction: "cut_loss",
        question: "Cascading liquidations trigger rapid 8% candle drop. How do you survive the cascade?",
        options: [
          {
            text: "Execute pre-planned Stop-Loss; preserve 98% of capital to buy the oversold capitulation wick",
            action: "cut_loss",
            damage: 60,
            feedback: "BOSS DEFEATED! Your strict risk discipline neutralized the whale's cascade attempt!",
          },
          {
            text: "Remove Stop-Loss and pray the market bounces back",
            action: "scale_in",
            damage: -70,
            feedback: "FATAL ERROR! The cascade triggered account liquidation! Never remove stop-losses.",
          },
          {
            text: "Double down on margin to average down a falling knife",
            action: "defend_support",
            damage: -50,
            feedback: "HEAVY DAMAGE! Averaging down in a liquidation cascade is the #1 account killer.",
          },
        ],
      },
    },
  ];

  const currentStage = rounds[Math.min(currentRound - 1, rounds.length - 1)];

  const handleAction = (option: BossStage["scenario"]["options"][0]) => {
    if (isBattleOver) return;

    soundFx.playClick("hard");

    if (option.damage > 0) {
      soundFx.playTradeExecution("long");
      soundFx.playCoinShower(4);
      setBossHp((prev) => {
        const next = Math.max(0, prev - option.damage);
        if (next === 0) {
          setIsBattleOver(true);
          setOutcome("victory");
          soundFx.playLevelUp();
        }
        return next;
      });
      setCombatLog((prev) => [`⚔️ ${option.feedback}`, ...prev]);

      if (currentRound < rounds.length && bossHp - option.damage > 0) {
        setCurrentRound((r) => r + 1);
      }
    } else {
      soundFx.playTradeExecution("short");
      setPlayerHp((prev) => {
        const next = Math.max(0, prev + option.damage); // option.damage is negative
        if (next === 0) {
          setIsBattleOver(true);
          setOutcome("defeat");
        }
        return next;
      });
      setCombatLog((prev) => [`💥 ${option.feedback}`, ...prev]);
    }
  };

  const handleReset = () => {
    soundFx.playClick("soft");
    setBossHp(100);
    setPlayerHp(100);
    setCurrentRound(1);
    setIsBattleOver(false);
    setOutcome(null);
    setCombatLog(["Encounter restarted: The Liquidation Whale returns!"]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-bear/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-bear">
            <Icon name="crown" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Boss Encounter: Liquidation Whale</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-bear/20 text-bear border border-bear/30 uppercase tracking-widest">
                Stage {currentRound} / 2
              </span>
            </div>
            <p className="text-ink-400 text-xs">Survive high-stakes market manipulation attacks using disciplined trade execution</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl sf-base border border-navy-700 hover:border-ink-300 text-xs font-mono font-bold text-ink-300 hover:text-white"
        >
          Restart Encounter
        </button>
      </div>

      {/* Boss vs Player HP Combat Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
        {/* Boss HP */}
        <div className="sf-inset p-4 rounded-2xl border border-navy-700/60">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-bear font-bold">Whale Armor HP</span>
            <span className="text-white font-mono font-black">{bossHp} / 100</span>
          </div>
          <div className="h-4 w-full bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-800">
            <motion.div
              animate={{ width: `${bossHp}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-rose-600 to-bear shadow-lg shadow-bear/30"
            />
          </div>
        </div>

        {/* Player Capital HP */}
        <div className="sf-inset p-4 rounded-2xl border border-navy-700/60">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-bull font-bold">Trader Equity Margin</span>
            <span className="text-white font-mono font-black">{playerHp} / 100</span>
          </div>
          <div className="h-4 w-full bg-navy-950 rounded-full overflow-hidden p-0.5 border border-navy-800">
            <motion.div
              animate={{ width: `${playerHp}%` }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-bull shadow-lg shadow-bull/30"
            />
          </div>
        </div>
      </div>

      {/* Arena Stage Dialogue Box */}
      <div className="sf-base p-5 rounded-2xl border border-navy-700/60 mb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl sf-inset flex items-center justify-center border border-bear/30 text-bear shrink-0">
            <Icon name="rocket" size={32} strokeWidth={2.0} />
          </div>
          <div className="flex-1">
            <span className="font-mono text-xs uppercase text-bear font-bold">{currentStage.name} says:</span>
            <p className="text-white font-display font-bold text-base mt-1 italic">
              "{currentStage.dialogue}"
            </p>
            <div className="mt-2.5 p-2.5 rounded-xl bg-navy-950/60 border border-navy-800 text-xs font-mono text-ink-300">
              <span className="text-gold font-bold">Scenario Context: </span>
              {currentStage.scenario.chartContext}
            </div>
          </div>
        </div>
      </div>

      {/* Player Decision Buttons */}
      <div className="space-y-3 relative z-10 mb-6">
        <span className="text-xs font-mono font-bold uppercase text-ink-400 block mb-2">
          Select Strategic Defense Counter:
        </span>
        {currentStage.scenario.options.map((opt, i) => (
          <motion.button
            key={i}
            disabled={isBattleOver}
            whileHover={!isBattleOver ? { x: 4 } : {}}
            whileTap={!isBattleOver ? { scale: 0.98 } : {}}
            onClick={() => handleAction(opt)}
            className="w-full text-left p-4 rounded-xl sf-base border border-navy-700 hover:border-aqua/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg sf-inset flex items-center justify-center font-mono text-xs font-bold text-ink-400 group-hover:text-aqua">
                {i + 1}
              </span>
              <span className="text-sm font-medium text-white group-hover:text-aqua transition-colors">
                {opt.text}
              </span>
            </div>
            <Icon name="chevronRight" size={18} className="text-ink-500 group-hover:text-aqua shrink-0 ml-2" />
          </motion.button>
        ))}
      </div>

      {/* Outcome Modal or Combat Feed */}
      <AnimatePresence>
        {isBattleOver && outcome && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-6 rounded-2xl border text-center mb-6 ${
              outcome === "victory"
                ? "bg-bull/15 border-bull text-bull"
                : "bg-bear/15 border-bear text-bear"
            }`}
          >
            <h3 className="font-display font-black text-2xl mb-1">
              {outcome === "victory" ? "🏆 ENCOUNTER VICTORY!" : "💀 ACCOUNT WIPEOUT!"}
            </h3>
            <p className="text-sm font-mono text-white mb-4">
              {outcome === "victory"
                ? "You defended your margin, neutralized the whale's liquidity trap, and secured +500 XP!"
                : "You were wiped out by excessive leverage. Study the risk parameters and try again!"}
            </p>
            <button
              onClick={handleReset}
              className="btn3d h-11 px-8 rounded-xl font-display font-bold text-xs uppercase"
              style={{
                background: outcome === "victory" ? "linear-gradient(180deg, #2be08a 0%, #15905a 100%)" : "linear-gradient(180deg, #ff4d6a 0%, #d61f42 100%)",
                color: "#03160c",
                ["--edge" as any]: outcome === "victory" ? "#0c5f3c" : "#8e0f2c",
              }}
            >
              Replay Boss Challenge
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Combat Log */}
      <div className="sf-inset p-3.5 rounded-xl border border-navy-800 text-[11px] font-mono text-ink-400 max-h-24 overflow-y-auto">
        <span className="text-ink-500 font-bold uppercase block mb-1">Tactical Combat Stream:</span>
        {combatLog.map((log, i) => (
          <div key={i} className="py-0.5">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
