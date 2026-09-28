import React, { useState } from "react";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface ArenaStats {
  accuracy: number;
  sharpeRatio: number;
  totalPnl: number;
  level: number;
  xpCurrent: number;
  xpMax: number;
  unlockedBadges: number;
}

export const MasterControlDashboard: React.FC = () => {
  const [stats, setStats] = useState<ArenaStats>({
    accuracy: 78.4,
    sharpeRatio: 2.14,
    totalPnl: 14850.0,
    level: 14,
    xpCurrent: 620,
    xpMax: 1000,
    unlockedBadges: 19,
  });

  const [activeModule, setActiveModule] = useState<string>("overview");

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      {/* Top Banner with Rank */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl sf-inset flex items-center justify-center border border-gold/40 text-gold shadow-lg shadow-gold/10">
            <Icon name="medal" size={32} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-2xl">Tradelingo Master Hub</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-gold/20 text-gold border border-gold/40 uppercase">
                Level {stats.level} Apex Trader
              </span>
            </div>
            <p className="text-ink-400 text-xs mt-0.5">Unified mobile game command center & high-performance trading suite</p>
          </div>
        </div>

        {/* Global Progress to Next Rank */}
        <div className="w-64 sf-inset p-3 rounded-2xl border border-navy-700">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-ink-400">Next Rank Progress</span>
            <span className="text-aqua font-bold">{stats.xpCurrent} / {stats.xpMax} XP</span>
          </div>
          <div className="h-2 w-full bg-navy-950 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-aqua to-bull rounded-full"
              style={{ width: `${(stats.xpCurrent / stats.xpMax) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric Tiles 4-Col Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="sf-base p-4 rounded-2xl border border-navy-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-xs font-mono uppercase font-bold">Model Accuracy</span>
            <Icon name="target" size={16} className="text-bull" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-white">{stats.accuracy}%</span>
            <span className="text-[10px] text-bull font-mono block mt-0.5">+4.2% this week</span>
          </div>
        </div>

        <div className="sf-base p-4 rounded-2xl border border-navy-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-xs font-mono uppercase font-bold">Sharpe Ratio</span>
            <Icon name="trendUp" size={16} className="text-aqua" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-aqua">{stats.sharpeRatio}</span>
            <span className="text-[10px] text-ink-400 font-mono block mt-0.5">Top 5% Institutional</span>
          </div>
        </div>

        <div className="sf-base p-4 rounded-2xl border border-navy-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-xs font-mono uppercase font-bold">Simulated P&L</span>
            <Icon name="wallet" size={16} className="text-gold" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-gold">+${stats.totalPnl.toLocaleString()}</span>
            <span className="text-[10px] text-gold font-mono block mt-0.5">All-time Net Gains</span>
          </div>
        </div>

        <div className="sf-base p-4 rounded-2xl border border-navy-700/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-400">
            <span className="text-xs font-mono uppercase font-bold">Badges Claimed</span>
            <Icon name="crown" size={16} className="text-bear" />
          </div>
          <div className="mt-3">
            <span className="font-mono text-2xl font-black text-white">{stats.unlockedBadges} / 25</span>
            <span className="text-[10px] text-ink-400 font-mono block mt-0.5">Mastery Badges</span>
          </div>
        </div>
      </div>

      {/* Interactive Module Navigator */}
      <div className="flex items-center gap-2 border-b border-navy-800 pb-3 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "Battle Overview", icon: "sparkles" },
          { id: "drills", label: "Combat Drills", icon: "brain" },
          { id: "analytics", label: "Risk Analytics", icon: "chart" },
          { id: "vault", label: "Treasury Vault", icon: "gem" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick("soft");
              setActiveModule(tab.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
              activeModule === tab.id
                ? "bg-navy-700 text-white border border-navy-600 shadow"
                : "text-ink-400 hover:text-white sf-base border border-transparent"
            }`}
          >
            <Icon name={tab.icon as any} size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Content Panel */}
      <div className="sf-inset p-5 rounded-2xl border border-navy-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-aqua font-bold">
            Daily Recommended Protocol:
          </span>
          <h4 className="font-display font-extrabold text-white text-lg">
            Complete Pattern Arena & Orderflow Stress-Test
          </h4>
          <p className="text-xs text-ink-300 font-mono max-w-xl">
            Today's regime is flagged with high volatility. Train on Bullish Engulfing confirmations and Whale Depth order sweeps to earn double XP bonus.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClick("plastic");
            soundFx.playCoinShower(4);
            setStats((s) => ({ ...s, xpCurrent: Math.min(s.xpMax, s.xpCurrent + 120) }));
          }}
          className="btn3d h-12 px-8 rounded-xl font-display font-bold text-xs uppercase shrink-0"
          style={{
            background: "linear-gradient(180deg, #2be08a 0%, #15905a 100%)",
            color: "#03160c",
            ["--edge" as any]: "#0c5f3c",
          }}
        >
          Claim +120 Daily XP &rarr;
        </button>
      </div>
    </div>
  );
};
