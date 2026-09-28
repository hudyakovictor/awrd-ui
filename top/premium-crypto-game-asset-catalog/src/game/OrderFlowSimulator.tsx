import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export const OrderFlowSimulator: React.FC = () => {
  const [currentMarketPrice, setCurrentMarketPrice] = useState(68450.00);
  const [whaleAlert, setWhaleAlert] = useState<string | null>("Whale Wall detected at $68,000 Support (450 BTC)");
  const [cumulativeVolume, setCumulativeVolume] = useState(1480.45);

  const [asks, setAsks] = useState<OrderBookEntry[]>([
    { price: 68490, amount: 14.5, total: 14.5 },
    { price: 68480, amount: 28.2, total: 42.7 },
    { price: 68470, amount: 55.4, total: 98.1 },
    { price: 68460, amount: 12.8, total: 110.9 },
  ]);

  const [bids, setBids] = useState<OrderBookEntry[]>([
    { price: 68440, amount: 18.2, total: 18.2 },
    { price: 68430, amount: 35.8, total: 54.0 },
    { price: 68420, amount: 92.1, total: 146.1 },
    { price: 68400, amount: 250.0, total: 396.1 }, // Whale bid
  ]);

  const triggerWhaleBuy = () => {
    soundFx.playTradeExecution("long");
    soundFx.playCoinShower(5);
    setCurrentMarketPrice((p) => p + 35);
    setCumulativeVolume((v) => v + 85.5);
    setWhaleAlert("🚨 MASSIVE MARKET BUY: 85.5 BTC swept the ask ladder!");

    // Consume top asks
    setAsks((prev) =>
      prev.map((a) => ({
        ...a,
        amount: Math.max(2.1, Number((a.amount * 0.4).toFixed(1))),
      }))
    );
  };

  const triggerWhaleDump = () => {
    soundFx.playTradeExecution("short");
    setCurrentMarketPrice((p) => Math.max(1000, p - 42));
    setCumulativeVolume((v) => v + 120.2);
    setWhaleAlert("⚠️ WHALE DUMP DETECTED: 120.2 BTC dumped into bids!");

    // Consume top bids
    setBids((prev) =>
      prev.map((b) => ({
        ...b,
        amount: Math.max(1.8, Number((b.amount * 0.35).toFixed(1))),
      }))
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-aqua">
            <Icon name="layers" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Orderflow & Liquidity Depth</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy-800 text-gold border border-gold/30 uppercase tracking-widest">
                Whale Scanner
              </span>
            </div>
            <p className="text-ink-400 text-xs">Observe institutional iceberg orders, spoofing, and bid/ask volume imbalance</p>
          </div>
        </div>

        {/* Realtime stats badge */}
        <div className="flex items-center gap-2">
          <div className="sf-inset px-3 py-1.5 rounded-xl border border-navy-700 font-mono text-xs">
            <span className="text-ink-400">Mid-Market: </span>
            <span className="text-white font-bold">${currentMarketPrice.toFixed(2)}</span>
          </div>
          <div className="sf-inset px-3 py-1.5 rounded-xl border border-navy-700 font-mono text-xs">
            <span className="text-ink-400">Total Book Depth: </span>
            <span className="text-white font-bold">{cumulativeVolume.toFixed(1)} BTC</span>
          </div>
        </div>
      </div>

      {/* Whale Alert Notification Ribbon */}
      <AnimatePresence>
        {whaleAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 mb-6 rounded-xl bg-navy-900 border border-gold/40 flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center gap-2 text-gold">
              <Icon name="alert" size={16} />
              <span className="font-bold">{whaleAlert}</span>
            </div>
            <button
              onClick={() => setWhaleAlert(null)}
              className="text-ink-400 hover:text-white"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Dual Orderbook View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ask Depth (Sellers) */}
        <div className="sf-inset p-4 rounded-2xl border border-navy-700/60">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-bear mb-3">
            <span>Ask Price (Resistance Liquidity)</span>
            <span>Size (BTC)</span>
          </div>
          <div className="space-y-1.5">
            {asks.map((ask, i) => {
              const depthPercent = Math.min(100, (ask.amount / 60) * 100);
              return (
                <div key={i} className="relative flex justify-between items-center text-xs font-mono py-1.5 px-2 rounded overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-bear/15 pointer-events-none transition-all duration-300"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <span className="text-bear font-bold relative z-10">${ask.price.toLocaleString()}</span>
                  <span className="text-white font-medium relative z-10">{ask.amount} BTC</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bid Depth (Buyers) */}
        <div className="sf-inset p-4 rounded-2xl border border-navy-700/60">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-bull mb-3">
            <span>Bid Price (Support Liquidity)</span>
            <span>Size (BTC)</span>
          </div>
          <div className="space-y-1.5">
            {bids.map((bid, i) => {
              const depthPercent = Math.min(100, (bid.amount / 250) * 100);
              const isWhaleWall = bid.amount > 100;
              return (
                <div
                  key={i}
                  className={`relative flex justify-between items-center text-xs font-mono py-1.5 px-2 rounded overflow-hidden ${
                    isWhaleWall ? "border border-gold/40 bg-gold/5" : ""
                  }`}
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-bull/15 pointer-events-none transition-all duration-300"
                    style={{ width: `${depthPercent}%` }}
                  />
                  <div className="flex items-center gap-1.5 relative z-10">
                    <span className="text-bull font-bold">${bid.price.toLocaleString()}</span>
                    {isWhaleWall && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-gold/20 text-gold font-bold">
                        WHALE WALL
                      </span>
                    )}
                  </div>
                  <span className="text-white font-medium relative z-10">{bid.amount} BTC</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulator Control Trigger Deck */}
      <div className="mt-6 pt-5 border-t border-navy-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-ink-400">Trigger Market Event:</span>
          <button
            onClick={triggerWhaleBuy}
            className="btn3d h-10 px-4 rounded-xl font-display font-bold text-xs uppercase"
            style={{
              background: "linear-gradient(180deg, #2be08a 0%, #15905a 100%)",
              color: "#03160c",
              ["--edge" as any]: "#0c5f3c",
            }}
          >
            Simulate Whale Buy (+85 BTC)
          </button>
          <button
            onClick={triggerWhaleDump}
            className="btn3d h-10 px-4 rounded-xl font-display font-bold text-xs uppercase"
            style={{
              background: "linear-gradient(180deg, #ff4d6a 0%, #d61f42 100%)",
              color: "#1c0309",
              ["--edge" as any]: "#8e0f2c",
            }}
          >
            Simulate Dump (-120 BTC)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ink-500">Order Matching Engine:</span>
          <span className="font-mono text-xs font-bold text-bull">Deterministic v4.2</span>
        </div>
      </div>
    </div>
  );
};
