import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface LiveTradePosition {
  id: string;
  symbol: string;
  side: "long" | "short";
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  sizeUsd: number;
  liquidationPrice: number;
  pnlUsd: number;
  pnlPercent: number;
}

export const RealtimeTradingArena: React.FC = () => {
  const [balance, setBalance] = useState(10000);
  const [btcPrice, setBtcPrice] = useState(68420.50);
  const [priceHistory, setPriceHistory] = useState<number[]>([
    68350, 68380, 68360, 68410, 68390, 68430, 68415, 68450, 68420.50
  ]);
  const [selectedLeverage, setSelectedLeverage] = useState(10);
  const [tradeAmount, setTradeAmount] = useState(500);
  const [positions, setPositions] = useState<LiveTradePosition[]>([]);
  const [activeTab, setActiveTab] = useState<"positions" | "orderbook" | "history">("positions");

  // Simulated Live Market Engine (WebSocket Simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice((prev) => {
        const delta = (Math.random() - 0.49) * 45;
        const newPrice = Math.max(1000, Number((prev + delta).toFixed(2)));

        setPriceHistory((hist) => [...hist.slice(-24), newPrice]);

        // Update active positions PnL & liquidations
        setPositions((activePositions) =>
          activePositions.map((pos) => {
            const priceDiff = pos.side === "long" ? newPrice - pos.entryPrice : pos.entryPrice - newPrice;
            const pnlPercent = (priceDiff / pos.entryPrice) * pos.leverage * 100;
            const pnlUsd = (pos.sizeUsd * pnlPercent) / 100;

            // Check liquidation trigger
            const isLiquidated =
              (pos.side === "long" && newPrice <= pos.liquidationPrice) ||
              (pos.side === "short" && newPrice >= pos.liquidationPrice);

            if (isLiquidated) {
              soundFx.playTradeExecution("short");
              return { ...pos, pnlPercent: -100, pnlUsd: -pos.sizeUsd, isDead: true } as any;
            }

            return {
              ...pos,
              currentPrice: newPrice,
              pnlUsd: Number(pnlUsd.toFixed(2)),
              pnlPercent: Number(pnlPercent.toFixed(2)),
            };
          }).filter((p: any) => !p.isDead)
        );

        return newPrice;
      });
    }, 1100);

    return () => clearInterval(interval);
  }, []);

  // Open New Position
  const handleOpenTrade = (side: "long" | "short") => {
    if (tradeAmount > balance) {
      soundFx.playClick("metallic");
      return;
    }

    soundFx.playTradeExecution(side);
    soundFx.playClick("heavy");

    setBalance((b) => b - tradeAmount);

    const liqDistance = (btcPrice / selectedLeverage) * 0.9;
    const liquidationPrice =
      side === "long" ? Number((btcPrice - liqDistance).toFixed(2)) : Number((btcPrice + liqDistance).toFixed(2));

    const newPos: LiveTradePosition = {
      id: Math.random().toString(36).substring(2, 9),
      symbol: "BTC/USDT",
      side,
      leverage: selectedLeverage,
      entryPrice: btcPrice,
      currentPrice: btcPrice,
      sizeUsd: tradeAmount,
      liquidationPrice,
      pnlUsd: 0,
      pnlPercent: 0,
    };

    setPositions((prev) => [newPos, ...prev]);
  };

  // Close Position
  const handleClosePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    soundFx.playClick("plastic");
    soundFx.playCoinShower(pos.pnlUsd > 0 ? 5 : 1);

    setBalance((b) => Number((b + pos.sizeUsd + pos.pnlUsd).toFixed(2)));
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      {/* Background glow and subtle matrix */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-aqua/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Terminal Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-gold">
            <Icon name="bitcoin" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">BTC/USDT Perpetual</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bull/15 text-bull border border-bull/30 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse" />
                Live Feed
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-2xl font-black text-white">
                ${btcPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-mono font-bold text-bull">
                +3.24% 24h
              </span>
            </div>
          </div>
        </div>

        {/* Demo Account Balance Box */}
        <div className="flex items-center gap-3">
          <div className="sf-inset px-4 py-2.5 rounded-2xl border border-navy-700 flex flex-col items-end">
            <span className="text-[10px] font-mono font-bold uppercase text-ink-400">Simulated Margin Balance</span>
            <span className="font-mono text-lg font-black text-gold">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick("plastic");
              setBalance((b) => b + 2500);
            }}
            className="h-11 px-3.5 rounded-xl sf-base border border-navy-600 hover:border-gold text-ink-200 text-xs font-mono font-bold"
          >
            + Add $2,500
          </button>
        </div>
      </div>

      {/* Middle Grid: Sparkline Mini-Chart + Order Entry Deck */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Realtime Chart View (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="h-64 sf-inset rounded-2xl p-4 border border-navy-700/80 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-mono text-ink-400 z-10">
              <div className="flex gap-2 items-center">
                <span className="text-white font-bold">1s Tick Stream</span>
                <span>Vol: 24,198 BTC</span>
              </div>
              <span className="text-ink-500">Latency: 12ms</span>
            </div>

            {/* SVG Realtime Sparkline */}
            <div className="w-full h-40 relative flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2be08a" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2be08a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* SVG Area */}
                {priceHistory.length > 1 && (
                  <>
                    <polygon
                      fill="url(#chartGrad)"
                      points={`0,100 ${priceHistory
                        .map((p, i) => {
                          const min = Math.min(...priceHistory);
                          const max = Math.max(...priceHistory);
                          const y = 100 - ((p - min) / (max - min || 1)) * 80 - 10;
                          const x = (i / (priceHistory.length - 1)) * 300;
                          return `${x},${y}`;
                        })
                        .join(" ")} 300,100`}
                    />
                    <polyline
                      fill="none"
                      stroke="#2be08a"
                      strokeWidth="2.5"
                      points={priceHistory
                        .map((p, i) => {
                          const min = Math.min(...priceHistory);
                          const max = Math.max(...priceHistory);
                          const y = 100 - ((p - min) / (max - min || 1)) * 80 - 10;
                          const x = (i / (priceHistory.length - 1)) * 300;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  </>
                )}
              </svg>
            </div>

            <div className="flex justify-between text-[11px] font-mono text-ink-500 z-10 border-t border-navy-800/80 pt-2">
              <span>Low: ${Math.min(...priceHistory).toFixed(1)}</span>
              <span>High: ${Math.max(...priceHistory).toFixed(1)}</span>
              <span>Range: ${(Math.max(...priceHistory) - Math.min(...priceHistory)).toFixed(1)}</span>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="sf-base p-3 rounded-xl border border-navy-700/60">
              <span className="text-[10px] font-mono uppercase text-ink-500">24h High</span>
              <p className="text-sm font-mono font-bold text-white mt-0.5">$69,140.00</p>
            </div>
            <div className="sf-base p-3 rounded-xl border border-navy-700/60">
              <span className="text-[10px] font-mono uppercase text-ink-500">24h Low</span>
              <p className="text-sm font-mono font-bold text-white mt-0.5">$66,820.00</p>
            </div>
            <div className="sf-base p-3 rounded-xl border border-navy-700/60">
              <span className="text-[10px] font-mono uppercase text-ink-500">Funding Rate</span>
              <p className="text-sm font-mono font-bold text-bull mt-0.5">+0.0100%</p>
            </div>
          </div>
        </div>

        {/* Right: 3D Neo-Skeuomorphic Execution Panel (5 cols) */}
        <div className="md:col-span-5 sf-base hairline rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-display font-bold text-sm text-white">Order Execution Deck</span>
              <span className="font-mono text-xs text-aqua font-bold">Cross Margin</span>
            </div>

            {/* Leverage Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-ink-400">Leverage Multiplier</span>
                <span className="text-gold font-bold">{selectedLeverage}x</span>
              </div>
              <div className="flex gap-1.5">
                {[1, 5, 10, 20, 50].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => {
                      soundFx.playClick("soft");
                      setSelectedLeverage(lev);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      selectedLeverage === lev
                        ? "bg-gold/20 border-gold text-gold"
                        : "sf-inset border-navy-700 text-ink-400 hover:text-white"
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Margin Input Field */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-ink-400">Position Size (USD)</span>
                <span className="text-ink-500">Max: ${balance.toFixed(0)}</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(10, Number(e.target.value)))}
                  className="w-full h-12 sf-inset rounded-xl px-4 text-white font-mono font-bold text-base border border-navy-700 focus:border-aqua outline-none"
                />
                <div className="absolute right-3 top-3 flex gap-1">
                  {[0.25, 0.5, 1.0].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTradeAmount(Math.floor(balance * pct))}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold sf-base border border-navy-600 text-ink-300 hover:text-white"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estimated Liquidation Warning */}
            <div className="p-3 rounded-xl bg-navy-950/60 border border-navy-800 text-xs font-mono mb-5 space-y-1">
              <div className="flex justify-between text-ink-400">
                <span>Effective Exposure:</span>
                <span className="text-white font-bold">${(tradeAmount * selectedLeverage).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-ink-400">
                <span>Fee (Maker/Taker):</span>
                <span className="text-ink-300">0.02% / 0.05%</span>
              </div>
            </div>
          </div>

          {/* Dual Action 3D Push Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOpenTrade("long")}
              className="btn3d h-14 rounded-xl font-display font-bold text-sm tracking-wide uppercase flex flex-col items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #2be08a 0%, #15905a 100%)",
                color: "#03160c",
                ["--edge" as any]: "#0c5f3c",
              }}
            >
              <span>Long / Buy</span>
              <span className="text-[10px] font-mono opacity-80 font-normal">Expect Upward Surge</span>
            </button>

            <button
              onClick={() => handleOpenTrade("short")}
              className="btn3d h-14 rounded-xl font-display font-bold text-sm tracking-wide uppercase flex flex-col items-center justify-center"
              style={{
                background: "linear-gradient(180deg, #ff4d6a 0%, #d61f42 100%)",
                color: "#1c0309",
                ["--edge" as any]: "#8e0f2c",
              }}
            >
              <span>Short / Sell</span>
              <span className="text-[10px] font-mono opacity-80 font-normal">Profit on Drop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Position Ledger */}
      <div className="mt-8 border-t border-navy-800 pt-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("positions")}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                activeTab === "positions"
                  ? "bg-navy-700 text-white border border-navy-600"
                  : "text-ink-500 hover:text-ink-300"
              }`}
            >
              Active Positions ({positions.length})
            </button>
            <button
              onClick={() => setActiveTab("orderbook")}
              className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                activeTab === "orderbook"
                  ? "bg-navy-700 text-white border border-navy-600"
                  : "text-ink-500 hover:text-ink-300"
              }`}
            >
              Simulated Liquidity Book
            </button>
          </div>
          <span className="text-xs font-mono text-ink-500">P&L Auto-updates on market tick</span>
        </div>

        {/* Positions Table */}
        {activeTab === "positions" && (
          <div className="overflow-x-auto">
            {positions.length === 0 ? (
              <div className="py-12 text-center text-ink-500 font-mono text-sm sf-inset rounded-xl">
                No active positions. Execute a Long or Short order above to start trading!
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-ink-400 border-b border-navy-800 pb-2">
                    <th className="py-2.5 px-3">Symbol / Side</th>
                    <th className="py-2.5 px-3">Size / Leverage</th>
                    <th className="py-2.5 px-3">Entry Price</th>
                    <th className="py-2.5 px-3">Current Price</th>
                    <th className="py-2.5 px-3">Liq. Price</th>
                    <th className="py-2.5 px-3">Unrealized P&L</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  <AnimatePresence>
                    {positions.map((pos) => {
                      const isProfit = pos.pnlUsd >= 0;
                      return (
                        <motion.tr
                          key={pos.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="hover:bg-navy-850/40"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="text-white">{pos.symbol}</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-black ${
                                  pos.side === "long" ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear"
                                }`}
                              >
                                {pos.side}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            ${pos.sizeUsd.toLocaleString()} ({pos.leverage}x)
                          </td>
                          <td className="py-3 px-3">${pos.entryPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 font-bold text-white">${pos.currentPrice.toFixed(2)}</td>
                          <td className="py-3 px-3 text-bear font-bold">${pos.liquidationPrice.toFixed(2)}</td>
                          <td className="py-3 px-3">
                            <span className={`font-bold ${isProfit ? "text-bull" : "text-bear"}`}>
                              {isProfit ? "+" : ""}${pos.pnlUsd.toFixed(2)} ({isProfit ? "+" : ""}
                              {pos.pnlPercent.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              className="px-3 py-1 rounded-lg sf-base border border-navy-700 hover:border-ink-300 text-ink-200 hover:text-white font-bold"
                            >
                              Market Close
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Orderbook Mock Tab */}
        {activeTab === "orderbook" && (
          <div className="grid grid-cols-2 gap-4 sf-inset p-4 rounded-xl font-mono text-xs">
            <div>
              <div className="text-bear font-bold mb-2 flex justify-between">
                <span>Ask Price (Sell Liquidity)</span>
                <span>Size (BTC)</span>
              </div>
              <div className="space-y-1">
                {[68480, 68465, 68445, 68430].map((p, i) => (
                  <div key={i} className="flex justify-between text-bear/90">
                    <span>${p}.00</span>
                    <span className="text-ink-400">{(Math.random() * 2.4).toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-bull font-bold mb-2 flex justify-between">
                <span>Bid Price (Buy Liquidity)</span>
                <span>Size (BTC)</span>
              </div>
              <div className="space-y-1">
                {[68410, 68390, 68375, 68350].map((p, i) => (
                  <div key={i} className="flex justify-between text-bull/90">
                    <span>${p}.00</span>
                    <span className="text-ink-400">{(Math.random() * 3.8).toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
