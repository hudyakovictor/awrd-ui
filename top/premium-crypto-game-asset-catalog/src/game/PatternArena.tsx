import React, { useState } from "react";
import { motion } from "framer-motion";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

export interface PatternQuizItem {
  id: string;
  name: string;
  patternType: "bullish" | "bearish" | "neutral";
  candles: { o: number; c: number; h: number; l: number }[];
  description: string;
  question: string;
  options: { label: string; correct: boolean; explanation: string }[];
}

export const PATTERNS_DATABASE: PatternQuizItem[] = [
  {
    id: "bullish-engulfing",
    name: "Bullish Engulfing",
    patternType: "bullish",
    candles: [
      { o: 65, c: 55, h: 68, l: 52 },
      { o: 52, c: 72, h: 75, l: 49 }
    ],
    description: "A large green candle completely covers the body of the preceding small red candle, signaling buyers taking control.",
    question: "After this pattern forms at a strong support level, what is the highest probability move?",
    options: [
      { label: "Long / Buy Breakout", correct: true, explanation: "Correct! The massive buying volume absorbs previous selling pressure, anticipating upward momentum." },
      { label: "Immediate Market Short", correct: false, explanation: "Incorrect! Shorting into an engulfing green candle goes directly against incoming buy volume." },
      { label: "Liquidate All Assets", correct: false, explanation: "Incorrect! Bullish reversal signals suggest holding or adding to long bias." }
    ]
  },
  {
    id: "shooting-star",
    name: "Shooting Star (Bearish Rejection)",
    patternType: "bearish",
    candles: [
      { o: 45, c: 68, h: 70, l: 42 },
      { o: 69, c: 64, h: 96, l: 62 }
    ],
    description: "Long upper shadow with small body at the bottom, indicating extreme seller rejection at the peak.",
    question: "You spot a Shooting Star at multi-month resistance. What is the optimal risk action?",
    options: [
      { label: "Place tight Short with Stop-Loss above high wick", correct: true, explanation: "Accurate! The long wick confirms seller liquidity, providing an asymmetric risk-reward short." },
      { label: "FOMO Market Buy 100x Leverage", correct: false, explanation: "Dangerous! Buying the top of a rejection wick results in fast liquidation." },
      { label: "Ignore volume and do nothing", correct: false, explanation: "Suboptimal! This is a prime trigger zone for capital protection." }
    ]
  },
  {
    id: "doji-indecision",
    name: "Dragonfly Doji",
    patternType: "neutral",
    candles: [
      { o: 80, c: 65, h: 82, l: 60 },
      { o: 64, c: 65, h: 66, l: 28 }
    ],
    description: "Open and close are almost identical, with a deep lower shadow showing buyers rejecting the dump.",
    question: "What does this Dragonfly Doji tell us about the market equilibrium?",
    options: [
      { label: "Bears attempted dump but bulls fully defended price", correct: true, explanation: "Spot on! The long lower wick proves intense limit buying at the lower range." },
      { label: "Guaranteed 100% price collapse", correct: false, explanation: "False! Lower wicks show buying absorption, not continuation of selling." },
      { label: "Orderbook is completely dead", correct: false, explanation: "Incorrect! Extreme trading volume is required to leave such long wicks." }
    ]
  },
  {
    id: "three-white-soldiers",
    name: "Three White Soldiers",
    patternType: "bullish",
    candles: [
      { o: 30, c: 45, h: 48, l: 28 },
      { o: 44, c: 60, h: 63, l: 42 },
      { o: 59, c: 78, h: 82, l: 58 }
    ],
    description: "Three consecutive long-bodied green candles opening within the previous candle's body.",
    question: "How should a disciplined trader handle this strong trend confirmation?",
    options: [
      { label: "Wait for a slight pullback to enter with trend", correct: true, explanation: "Smart execution! Chasing the third candle is risky; buying the first retest is institutional grade." },
      { label: "Counter-trend short immediately", correct: false, explanation: "Fatal mistake! Stepping in front of high momentum institutional buying causes wipeouts." },
      { label: "Panic sell into cash", correct: false, explanation: "Illogical! The trend is screaming bullish strength." }
    ]
  }
];

export const PatternArena: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userXp, setUserXp] = useState(140);

  const item = PATTERNS_DATABASE[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    soundFx.playClick("plastic");

    const isCorrect = item.options[idx].correct;
    if (isCorrect) {
      soundFx.playTradeExecution("long");
      soundFx.playCoinShower(4);
      setScore((s) => s + 100);
      setStreak((st) => st + 1);
      setUserXp((x) => x + 45);
    } else {
      soundFx.playTradeExecution("short");
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundFx.playClick("soft");
    setIsAnswered(false);
    setSelectedOption(null);
    setCurrentIdx((prev) => (prev + 1) % PATTERNS_DATABASE.length);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden">
      {/* Background Neon ambient */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-bull/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-aqua/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-navy-700/60 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-bull">
            <Icon name="candle" size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Candle Pattern Dojo</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy-800 text-aqua border border-aqua/30 uppercase tracking-widest">
                Interactive Drill
              </span>
            </div>
            <p className="text-ink-400 text-xs">Test pattern recognition with institutional accuracy rules</p>
          </div>
        </div>

        {/* Stats Pill cluster */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sf-inset border border-navy-700/60">
            <Icon name="bolt" size={16} className="text-gold" />
            <span className="font-mono text-xs font-bold text-white">XP: {userXp}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sf-inset border border-navy-700/60">
            <Icon name="flame" size={16} className="text-bear" />
            <span className="font-mono text-xs font-bold text-white">Streak: {streak}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl sf-inset border border-navy-700/60">
            <Icon name="trophy" size={16} className="text-bull" />
            <span className="font-mono text-xs font-bold text-white">Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visualizer + Question Panel */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Neo-Skeuomorphic Candlestick Sandbox (5 cols) */}
        <div className="md:col-span-5 rounded-2xl sf-inset hairline p-5 flex flex-col items-center justify-between min-h-[340px]">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-400 font-bold">Live Visual Formation</span>
            <span
              className={`px-2 py-0.5 rounded-md font-mono text-xs font-extrabold uppercase ${
                item.patternType === "bullish"
                  ? "bg-bull/20 text-bull border border-bull/40"
                  : item.patternType === "bearish"
                  ? "bg-bear/20 text-bear border border-bear/40"
                  : "bg-gold/20 text-gold border border-gold/40"
              }`}
            >
              {item.patternType}
            </span>
          </div>

          {/* Candlestick Drawing Box */}
          <div className="relative w-full h-56 flex items-center justify-center gap-6 px-4 bg-navy-950/40 rounded-xl border border-navy-800/80 my-auto">
            {item.candles.map((c, i) => {
              const isBull = c.c >= c.o;
              const candleHeight = Math.max(12, Math.abs(c.c - c.o) * 2.2);
              const wickTop = (c.h - Math.max(c.o, c.c)) * 2;
              const wickBottom = (Math.min(c.o, c.c) - c.l) * 2;

              return (
                <div key={i} className="flex flex-col items-center group relative cursor-pointer">
                  {/* High Wick */}
                  <div
                    className={`w-1 rounded-t-full transition-all duration-300 ${isBull ? "bg-bull" : "bg-bear"}`}
                    style={{ height: `${wickTop}px` }}
                  />

                  {/* Body with 3D tactile elevation */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    className={`w-12 rounded-lg border flex items-center justify-center relative shadow-lg ${
                      isBull
                        ? "bg-gradient-to-b from-bull to-emerald-700 border-bull/80 shadow-bull/20"
                        : "bg-gradient-to-b from-bear to-rose-800 border-bear/80 shadow-bear/20"
                    }`}
                    style={{ height: `${candleHeight}px` }}
                  >
                    <div className="absolute inset-x-1 top-1 h-1/3 bg-white/30 rounded-t-sm pointer-events-none" />
                    <span className="text-[10px] font-mono font-black text-navy-950/70 select-none">
                      {isBull ? "+" : "-"}
                    </span>
                  </motion.div>

                  {/* Low Wick */}
                  <div
                    className={`w-1 rounded-b-full transition-all duration-300 ${isBull ? "bg-bull" : "bg-bear"}`}
                    style={{ height: `${wickBottom}px` }}
                  />

                  <div className="absolute -bottom-6 font-mono text-[10px] text-ink-500 font-bold">
                    C{i + 1}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-ink-300 text-xs text-center italic mt-2 px-2">
            "{item.description}"
          </p>
        </div>

        {/* Right: Question, Options, and Feedback (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-ink-400">Question {currentIdx + 1} of {PATTERNS_DATABASE.length}</span>
            </div>
            <h3 className="font-display font-bold text-white text-lg leading-snug mb-4">
              {item.question}
            </h3>

            {/* Interactive Options list */}
            <div className="space-y-3">
              {item.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                let borderClass = "border-navy-700 hover:border-navy-500";
                let bgClass = "sf-base";
                let textClass = "text-ink-200";

                if (isAnswered) {
                  if (opt.correct) {
                    borderClass = "border-bull bg-bull/15 text-bull";
                    textClass = "text-white font-bold";
                  } else if (isSelected && !opt.correct) {
                    borderClass = "border-bear bg-bear/15 text-bear";
                    textClass = "text-rose-200";
                  } else {
                    bgClass = "opacity-40 sf-inset";
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    whileHover={!isAnswered ? { x: 4 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 ${bgClass} ${borderClass}`}
                  >
                    <span className="w-6 h-6 rounded-full border border-current/40 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="flex-1">
                      <span className={`text-sm ${textClass}`}>{opt.label}</span>
                      {isAnswered && isSelected && (
                        <p className={`text-xs mt-2 font-mono ${opt.correct ? "text-bull" : "text-rose-300"}`}>
                          {opt.explanation}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-navy-800">
            <span className="text-xs font-mono text-ink-500">
              {isAnswered ? "Analysis complete" : "Choose the highest probability trading action"}
            </span>
            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleNext}
                className="btn3d h-11 px-6 rounded-xl font-display font-bold text-xs uppercase tracking-wider"
                style={{
                  background: "linear-gradient(180deg, #2be08a 0%, #15905a 100%)",
                  color: "#03160c",
                  ["--edge" as any]: "#0c5f3c"
                }}
              >
                Next Pattern &rarr;
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
