import React, { useState } from "react";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface JournalEntry {
  id: string;
  date: string;
  asset: string;
  strategy: string;
  pnlUsd: number;
  emotionalState: "disciplined" | "fomo" | "fearful" | "greedy" | "revenge";
  reflection: string;
}

export const TraderJournalSystem: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "j-1",
      date: "Today, 14:20",
      asset: "BTC/USDT",
      strategy: "VWAP Mean Reversion",
      pnlUsd: 420.50,
      emotionalState: "disciplined",
      reflection: "Waited patiently for 15m candle close below VWAP before taking short. Took 50% profit at Support 1.",
    },
    {
      id: "j-2",
      date: "Yesterday, 19:45",
      asset: "ETH/USDT",
      strategy: "Breakout Scalp",
      pnlUsd: -140.00,
      emotionalState: "fomo",
      reflection: "Chased candle #3 after a 4% pump without retest. Stop-loss executed as planned, saving $600.",
    },
    {
      id: "j-3",
      date: "Oct 12, 11:15",
      asset: "SOL/USDT",
      strategy: "Trend Following",
      pnlUsd: 890.20,
      emotionalState: "disciplined",
      reflection: "Held through 2 minor 1h pullbacks because higher-timeframe 4h structure remained strictly bullish.",
    },
  ]);

  const [newAsset, setNewAsset] = useState("BTC/USDT");
  const [newPnl, setNewPnl] = useState("250");
  const [newStrategy, setNewStrategy] = useState("Support Bounce");
  const [newEmotion, setNewEmotion] = useState<JournalEntry["emotionalState"]>("disciplined");
  const [newReflection, setNewReflection] = useState("");

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflection.trim()) return;

    soundFx.playClick("plastic");
    soundFx.playCoinShower(3);

    const created: JournalEntry = {
      id: Math.random().toString(36).substring(2, 9),
      date: "Just now",
      asset: newAsset,
      strategy: newStrategy,
      pnlUsd: Number(newPnl),
      emotionalState: newEmotion,
      reflection: newReflection,
    };

    setEntries([created, ...entries]);
    setNewReflection("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-aqua">
            <Icon name="book" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Neuro-Trader Journal</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy-800 text-aqua border border-aqua/30 uppercase tracking-widest">
                Psychology Log
              </span>
            </div>
            <p className="text-ink-400 text-xs">Track emotional bias, trade rules adherence, and capital evolution over time</p>
          </div>
        </div>
      </div>

      {/* New Entry Form */}
      <form onSubmit={handleAddEntry} className="sf-base p-4 rounded-2xl border border-navy-700/60 mb-6 space-y-4">
        <span className="text-xs font-mono uppercase font-bold text-white block">Log Trade Reflection:</span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] font-mono text-ink-400 block mb-1">Asset</label>
            <input
              type="text"
              value={newAsset}
              onChange={(e) => setNewAsset(e.target.value)}
              className="w-full sf-inset rounded-lg px-3 py-2 text-xs font-mono text-white border border-navy-700 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-ink-400 block mb-1">Strategy</label>
            <input
              type="text"
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              className="w-full sf-inset rounded-lg px-3 py-2 text-xs font-mono text-white border border-navy-700 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-ink-400 block mb-1">P&L (USD)</label>
            <input
              type="number"
              value={newPnl}
              onChange={(e) => setNewPnl(e.target.value)}
              className="w-full sf-inset rounded-lg px-3 py-2 text-xs font-mono text-white border border-navy-700 outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-ink-400 block mb-1">Emotional State</label>
            <select
              value={newEmotion}
              onChange={(e) => setNewEmotion(e.target.value as any)}
              className="w-full sf-inset rounded-lg px-3 py-2 text-xs font-mono text-white border border-navy-700 outline-none"
            >
              <option value="disciplined">Disciplined</option>
              <option value="fomo">FOMO / Chased</option>
              <option value="fearful">Hesitant / Fear</option>
              <option value="greedy">Greedy / Overleveraged</option>
              <option value="revenge">Revenge Trading</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono text-ink-400 block mb-1">Tactical Lessons & Mental Takeaways</label>
          <input
            type="text"
            placeholder="e.g. Obeyed stop loss; waited for 4h confirmation candle..."
            value={newReflection}
            onChange={(e) => setNewReflection(e.target.value)}
            className="w-full sf-inset rounded-lg px-3 py-2 text-xs font-mono text-white border border-navy-700 outline-none"
          />
        </div>

        <button
          type="submit"
          className="btn3d h-10 px-6 rounded-xl font-display font-bold text-xs uppercase"
          style={{
            background: "linear-gradient(180deg, #38e1ff 0%, #12a8cf 100%)",
            color: "#02141c",
            ["--edge" as any]: "#0b6f8d",
          }}
        >
          Add Journal Entry
        </button>
      </form>

      {/* History Log List */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const isProfitable = entry.pnlUsd >= 0;
          return (
            <div
              key={entry.id}
              className="sf-base p-4 rounded-xl border border-navy-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-navy-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl sf-inset flex items-center justify-center font-mono font-bold text-sm ${
                    isProfitable ? "text-bull" : "text-bear"
                  }`}
                >
                  {isProfitable ? "+" : "-"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{entry.asset}</span>
                    <span className="text-xs font-mono text-ink-400">({entry.strategy})</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-bold ${
                        entry.emotionalState === "disciplined"
                          ? "bg-bull/20 text-bull"
                          : "bg-bear/20 text-bear"
                      }`}
                    >
                      {entry.emotionalState}
                    </span>
                  </div>
                  <p className="text-xs text-ink-300 mt-1">{entry.reflection}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <span className="text-xs font-mono text-ink-500">{entry.date}</span>
                <span
                  className={`font-mono text-sm font-black ${
                    isProfitable ? "text-bull" : "text-bear"
                  }`}
                >
                  {isProfitable ? "+" : ""}${entry.pnlUsd.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
