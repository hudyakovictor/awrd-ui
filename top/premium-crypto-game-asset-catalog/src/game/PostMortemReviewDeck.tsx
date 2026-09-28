import React, { useState } from "react";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface LiquidationHistoryItem {
  id: string;
  symbol: string;
  side: "long" | "short";
  leverage: number;
  entryPrice: number;
  liqPrice: number;
  lossAmountUsd: number;
  date: string;
  postMortem: {
    flaw: string;
    psychologicalBias: string;
    recommendedCorrection: string;
    riskScore: number;
  };
}

export const PostMortemReviewDeck: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case-1");

  const cases: LiquidationHistoryItem[] = [
    {
      id: "case-1",
      symbol: "ETH/USDT Perp",
      side: "long",
      leverage: 50,
      entryPrice: 3850.00,
      liqPrice: 3780.00,
      lossAmountUsd: 2500,
      date: "2 hours ago",
      postMortem: {
        flaw: "Over-leverage into major resistance wick without stop-loss",
        psychologicalBias: "FOMO (Fear Of Missing Out) & Revenge Trading",
        recommendedCorrection: "Cap leverage at 10x max for breakout attempts, pre-set stop loss before market order entry.",
        riskScore: 94,
      },
    },
    {
      id: "case-2",
      symbol: "SOL/USDT Perp",
      side: "short",
      leverage: 25,
      entryPrice: 172.50,
      liqPrice: 179.00,
      lossAmountUsd: 1200,
      date: "Yesterday",
      postMortem: {
        flaw: "Shorting a high-volume parabolic breakout with negative funding rate",
        psychologicalBias: "Anchoring bias (expecting previous top to hold)",
        recommendedCorrection: "Never counter-trend trade against positive institutional volume and rising open interest.",
        riskScore: 82,
      },
    },
    {
      id: "case-3",
      symbol: "BTC/USDT Perp",
      side: "long",
      leverage: 20,
      entryPrice: 69400.00,
      liqPrice: 66200.00,
      lossAmountUsd: 4800,
      date: "3 days ago",
      postMortem: {
        flaw: "Averaging down into an active liquidation cascade",
        psychologicalBias: "Sunken Cost Fallacy & Denial",
        recommendedCorrection: "Cut losing trades at 2% risk. Never add margin to a losing leveraged position.",
        riskScore: 98,
      },
    },
  ];

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-bear">
            <Icon name="trendDown" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Liquidation Post-Mortem Lab</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-bear/20 text-bear border border-bear/30 uppercase tracking-widest">
                Forensics
              </span>
            </div>
            <p className="text-ink-400 text-xs">Analyze failed trades to rewire psychological biases and cultivate institutional risk habits</p>
          </div>
        </div>

        {/* Case selector tab bar */}
        <div className="flex items-center gap-2">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                soundFx.playClick("soft");
                setSelectedCaseId(c.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                selectedCaseId === c.id
                  ? "bg-navy-700 text-white border-navy-600"
                  : "sf-base border-navy-800 text-ink-400 hover:text-white"
              }`}
            >
              {c.symbol.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Forensic Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Execution Error Details (5 cols) */}
        <div className="md:col-span-5 sf-inset p-5 rounded-2xl border border-navy-700/80 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ink-400 uppercase font-bold">Trade Breakdown</span>
            <span className="text-ink-500">{currentCase.date}</span>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-bear/40">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-white">{currentCase.symbol}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-bear/20 text-bear">
                {currentCase.side} {currentCase.leverage}x
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-ink-400">
                <span>Entry Price:</span>
                <span className="text-white font-bold">${currentCase.entryPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-ink-400">
                <span>Liquidation Trigger:</span>
                <span className="text-bear font-bold">${currentCase.liqPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-navy-800 pt-1.5 mt-2">
                <span className="text-ink-300 font-bold">Total Capital Vaporized:</span>
                <span className="text-bear font-black text-sm">-${currentCase.lossAmountUsd.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Risk Recklessness Gauge */}
          <div className="p-3 rounded-xl sf-base border border-navy-700/60">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-ink-400">Recklessness Rating</span>
              <span className="text-bear font-bold">{currentCase.postMortem.riskScore} / 100</span>
            </div>
            <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-bear rounded-full"
                style={{ width: `${currentCase.postMortem.riskScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Forensic Autopsy & Cognitive Biases (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="sf-base p-4 rounded-xl border border-navy-700/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-bear font-bold flex items-center gap-1.5 mb-1.5">
              <Icon name="alert" size={14} /> Fatal Execution Flaw
            </span>
            <p className="text-sm font-bold text-white leading-relaxed">
              {currentCase.postMortem.flaw}
            </p>
          </div>

          <div className="sf-base p-4 rounded-xl border border-navy-700/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gold font-bold flex items-center gap-1.5 mb-1.5">
              <Icon name="brain" size={14} /> Cognitive & Psychological Bias Identified
            </span>
            <p className="text-sm font-medium text-ink-200 leading-relaxed">
              {currentCase.postMortem.psychologicalBias}
            </p>
          </div>

          <div className="sf-base p-4 rounded-xl border border-bull/40 bg-bull/5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-bull font-bold flex items-center gap-1.5 mb-1.5">
              <Icon name="shield" size={14} /> Institutional Rx: Prescribed Habit
            </span>
            <p className="text-sm font-medium text-white leading-relaxed">
              {currentCase.postMortem.recommendedCorrection}
            </p>
          </div>

          {/* Commit Rule Button */}
          <button
            onClick={() => {
              soundFx.playClick("plastic");
              soundFx.playCoinShower(3);
            }}
            className="btn3d w-full h-11 rounded-xl font-display font-bold text-xs uppercase tracking-wider"
            style={{
              background: "linear-gradient(180deg, #2be08a 0%, #15905a 100%)",
              color: "#03160c",
              ["--edge" as any]: "#0c5f3c",
            }}
          >
            Acknowledge & Save Rule to Trading Journal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
