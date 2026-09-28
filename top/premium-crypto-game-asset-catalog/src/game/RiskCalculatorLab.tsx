import React, { useState } from "react";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface CalculatorState {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
}

export const RiskCalculatorLab: React.FC = () => {
  const [calc, setCalc] = useState<CalculatorState>({
    accountSize: 10000,
    riskPercent: 2.0,
    entryPrice: 68000,
    stopLossPrice: 66500,
    takeProfitPrice: 72500,
  });

  const [activePreset, setActivePreset] = useState<string>("conservative");

  // Calculations
  const dollarRisk = (calc.accountSize * calc.riskPercent) / 100;
  const distanceToStop = Math.abs(calc.entryPrice - calc.stopLossPrice);
  const stopLossPercent = (distanceToStop / calc.entryPrice) * 100;

  // Maximum position size so that hitting stop loss loses exactly dollarRisk
  const maxPositionSizeUsd = stopLossPercent > 0 ? (dollarRisk / (stopLossPercent / 100)) : 0;
  const maxPositionTokens = calc.entryPrice > 0 ? (maxPositionSizeUsd / calc.entryPrice) : 0;

  // Risk:Reward ratio
  const distanceToTarget = Math.abs(calc.takeProfitPrice - calc.entryPrice);
  const rrRatio = distanceToStop > 0 ? (distanceToTarget / distanceToStop) : 0;
  const projectedProfitUsd = (maxPositionSizeUsd * (distanceToTarget / calc.entryPrice));

  const applyPreset = (preset: "conservative" | "moderate" | "aggressive") => {
    soundFx.playClick("soft");
    setActivePreset(preset);

    if (preset === "conservative") {
      setCalc((prev) => ({ ...prev, riskPercent: 1.0, stopLossPrice: prev.entryPrice * 0.98, takeProfitPrice: prev.entryPrice * 1.06 }));
    } else if (preset === "moderate") {
      setCalc((prev) => ({ ...prev, riskPercent: 2.0, stopLossPrice: prev.entryPrice * 0.96, takeProfitPrice: prev.entryPrice * 1.12 }));
    } else {
      setCalc((prev) => ({ ...prev, riskPercent: 5.0, stopLossPrice: prev.entryPrice * 0.94, takeProfitPrice: prev.entryPrice * 1.18 }));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-bull">
            <Icon name="shield" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Institutional Risk Lab</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy-800 text-bull border border-bull/30 uppercase tracking-widest">
                Position Sizing
              </span>
            </div>
            <p className="text-ink-400 text-xs">Mathematical capital protection model preventing ruin and drawdown traps</p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 sf-inset p-1 rounded-xl border border-navy-700">
          {(["conservative", "moderate", "aggressive"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => applyPreset(mode)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                activePreset === mode
                  ? "bg-navy-700 text-white shadow border border-navy-600"
                  : "text-ink-400 hover:text-ink-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Sliders + Metric Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Account Balance Slider */}
          <div className="sf-base p-4 rounded-xl border border-navy-700/60">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-ink-400 font-bold">Total Account Equity</span>
              <span className="text-white font-black text-sm">${calc.accountSize.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={calc.accountSize}
              onChange={(e) => setCalc({ ...calc, accountSize: Number(e.target.value) })}
              className="w-full accent-bull"
            />
          </div>

          {/* Risk Per Trade Slider */}
          <div className="sf-base p-4 rounded-xl border border-navy-700/60">
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-ink-400 font-bold">Risk Capital per Trade (%)</span>
              <span className="text-gold font-black text-sm">{calc.riskPercent.toFixed(1)}% (${dollarRisk.toFixed(0)})</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.5"
              value={calc.riskPercent}
              onChange={(e) => setCalc({ ...calc, riskPercent: Number(e.target.value) })}
              className="w-full accent-gold"
            />
          </div>

          {/* Price Level Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="sf-base p-3 rounded-xl border border-navy-700/60">
              <label className="text-[10px] font-mono text-ink-400 uppercase font-bold block mb-1">Entry Price</label>
              <input
                type="number"
                value={calc.entryPrice}
                onChange={(e) => setCalc({ ...calc, entryPrice: Number(e.target.value) })}
                className="w-full bg-navy-950/60 border border-navy-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white font-bold"
              />
            </div>
            <div className="sf-base p-3 rounded-xl border border-navy-700/60">
              <label className="text-[10px] font-mono text-bear uppercase font-bold block mb-1">Stop-Loss</label>
              <input
                type="number"
                value={calc.stopLossPrice}
                onChange={(e) => setCalc({ ...calc, stopLossPrice: Number(e.target.value) })}
                className="w-full bg-navy-950/60 border border-navy-800 rounded-lg px-2 py-1.5 text-xs font-mono text-bear font-bold"
              />
            </div>
            <div className="sf-base p-3 rounded-xl border border-navy-700/60">
              <label className="text-[10px] font-mono text-bull uppercase font-bold block mb-1">Take-Profit</label>
              <input
                type="number"
                value={calc.takeProfitPrice}
                onChange={(e) => setCalc({ ...calc, takeProfitPrice: Number(e.target.value) })}
                className="w-full bg-navy-950/60 border border-navy-800 rounded-lg px-2 py-1.5 text-xs font-mono text-bull font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Outputs / Asymmetric Sizing Card (5 cols) */}
        <div className="md:col-span-5 sf-inset p-5 rounded-2xl border border-navy-700/80 space-y-4">
          <div className="text-xs font-mono text-ink-400 uppercase tracking-wider font-bold">
            Computed Execution Parameters
          </div>

          <div className="p-4 rounded-xl bg-navy-900 border border-bull/30">
            <span className="text-xs font-mono text-ink-400">Recommended Position Size</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono text-2xl font-black text-white">
                ${maxPositionSizeUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
              <span className="text-xs font-mono text-bull font-bold">
                ({maxPositionTokens.toFixed(3)} BTC)
              </span>
            </div>
            <p className="text-[10px] text-ink-400 font-mono mt-1">
              If your stop-loss at ${calc.stopLossPrice.toLocaleString()} is hit, you lose exactly <span className="text-bear font-bold">${dollarRisk.toFixed(0)}</span> ({calc.riskPercent}% of account).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl sf-base border border-navy-700/60">
              <span className="text-[10px] font-mono uppercase text-ink-400">Risk:Reward Ratio</span>
              <p className={`font-mono text-lg font-black mt-0.5 ${rrRatio >= 2.0 ? "text-bull" : "text-gold"}`}>
                1 : {rrRatio.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl sf-base border border-navy-700/60">
              <span className="text-[10px] font-mono uppercase text-ink-400">Potential Profit</span>
              <p className="font-mono text-lg font-black text-bull mt-0.5">
                +${projectedProfitUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

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
            Lock in Position Size &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
