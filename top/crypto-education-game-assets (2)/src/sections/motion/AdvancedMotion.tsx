import { useState, useMemo } from "react";
import { Asset, Btn } from "../../components/ui";
import { sfx } from "../../lib/sound";
import { useDrag, mulberry32 } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-26 · INTERACTIVE DEPTH HEATMAP MATRIX — 3D Tilt Liquidity Wall
 * ===================================================================== */
export function LiquidityHeatmapMatrix() {
  const [hoveredCell, setHoveredCell] = useState<{ p: number; vol: number; side: "bids" | "asks" } | null>(null);
  const matrix = useMemo(() => {
    const rnd = mulberry32(101);
    const cells = [];
    const base = 64200;
    for (let i = 0; i < 48; i++) {
      const isAsk = i < 24;
      const step = isAsk ? (24 - i) * 15 : (i - 23) * -15;
      const p = base + step;
      const vol = Math.round(5 + rnd() * 45 + (i === 12 || i === 36 ? 80 : 0)); // Liquidity clusters
      cells.push({ p, vol, side: isAsk ? ("asks" as const) : ("bids" as const) });
    }
    return cells;
  }, []);

  return (
    <Asset
      title="Liquidity Order Book Heatmap"
      code="M-26"
      tags="heatmap liquidity book matrix depth 3d grid visual clusters bid ask walls"
      span={6}
      badge="Orderflow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-ink-300">Cluster Density (Hover or tap cells)</span>
        <div className="flex gap-2 text-[10px] font-mono">
          <span className="text-bear">Asks: Resistance</span>
          <span className="text-bull">Bids: Support</span>
        </div>
      </div>

      {/* Grid of Depth Blocks */}
      <div className="grid grid-cols-6 gap-1.5 p-2 bg-ink-950 rounded-2xl border border-white/5">
        {matrix.map((c, idx) => {
          const intensity = Math.min(1, c.vol / 100);
          const bg =
            c.side === "asks"
              ? `rgba(255, 77, 109, ${0.15 + intensity * 0.75})`
              : `rgba(34, 211, 154, ${0.15 + intensity * 0.75})`;

          return (
            <div
              key={idx}
              onMouseEnter={() => { setHoveredCell(c); sfx("tick"); }}
              className="h-10 rounded-lg flex flex-col justify-center items-center cursor-pointer transition-transform duration-150 hover:scale-105 hover:z-10 relative group"
              style={{
                backgroundColor: bg,
                boxShadow: c.vol > 70 ? `0 0 12px ${c.side === "asks" ? "#ff4d6d" : "#22d39a"}` : "none",
              }}
            >
              <span className="font-mono text-[9px] font-black text-white/90">
                {c.vol} <span className="text-[7px]">BTC</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Hover Inspector */}
      <div className="mt-3 p-3 rounded-xl bg-ink-850 border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-ink-400">Inspected Price Level:</span>
          <div className="font-mono text-base font-black text-white">
            {hoveredCell ? `$${hoveredCell.p.toLocaleString()}` : "$64,200 (Market Mid)"}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase text-ink-400">Resting Liquidity:</span>
          <div className={cn("font-mono text-base font-black", hoveredCell?.side === "asks" ? "text-bear" : "text-bull")}>
            {hoveredCell ? `${hoveredCell.vol} BTC (${hoveredCell.side.toUpperCase()})` : "Hover cell"}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-27 · ELASTIC SPRING TRADING PAD — Rubberband Haptic Drag
 * ===================================================================== */
export function ElasticSpringPad() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [triggered, setTriggered] = useState<string | null>(null);

  const bind = useDrag((s) => {
    if (s.first) {
      setIsDragging(true);
      return;
    }
    if (!s.last) {
      // Damped rubber-band drag
      setPos({ x: s.dx * 0.45, y: s.dy * 0.45 });
      if (s.dy < -70 && triggered !== "LONG") {
        setTriggered("LONG");
        sfx("tick");
        try { navigator.vibrate?.(15); } catch {}
      } else if (s.dy > 70 && triggered !== "SHORT") {
        setTriggered("SHORT");
        sfx("tick");
        try { navigator.vibrate?.(15); } catch {}
      } else if (Math.abs(s.dy) < 60) {
        setTriggered(null);
      }
      return;
    }

    setIsDragging(false);
    if (triggered === "LONG") {
      sfx("success");
    } else if (triggered === "SHORT") {
      sfx("success");
    }
    setPos({ x: 0, y: 0 });
    setTimeout(() => setTriggered(null), 1200);
  });

  return (
    <Asset
      title="Elastic Spring Trade Trigger"
      code="M-27"
      tags="elastic spring physics rubberband drag gesture haptic snap tactile"
      span={6}
      badge="Spring Physics"
    >
      <div className="relative h-64 bg-ink-950 rounded-2xl border border-white/10 flex flex-col items-center justify-between p-4 overflow-hidden select-none">
        {/* Top Drop Zone (Long) */}
        <div
          className={cn(
            "w-full py-2.5 rounded-xl border border-dashed text-center transition-all duration-200",
            triggered === "LONG"
              ? "border-bull bg-bull/20 text-bull scale-105 shadow-[0_0_18px_#22d39a]"
              : "border-bull/40 text-bull/60"
          )}
        >
          <span className="font-display text-xs font-black uppercase tracking-wider">▲ Pull UP to Fire LONG</span>
        </div>

        {/* Center Draggable Puck */}
        <div
          {...bind}
          className={cn(
            "w-24 h-24 rounded-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_8px_0_#0b1838,0_16px_30px_rgba(0,0,0,0.5)] z-20 touch-none",
            triggered === "LONG"
              ? "bg-bull text-ink-950"
              : triggered === "SHORT"
              ? "bg-bear text-white"
              : "bg-gradient-to-b from-[#27427d] to-[#162a57] text-white"
          )}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <span className="text-2xl">{triggered === "LONG" ? "🚀" : triggered === "SHORT" ? "📉" : "⚡"}</span>
          <span className="text-[10px] font-black uppercase tracking-widest mt-1">
            {triggered || "DRAG ME"}
          </span>
        </div>

        {/* Bottom Drop Zone (Short) */}
        <div
          className={cn(
            "w-full py-2.5 rounded-xl border border-dashed text-center transition-all duration-200",
            triggered === "SHORT"
              ? "border-bear bg-bear/20 text-bear scale-105 shadow-[0_0_18px_#ff4d6d]"
              : "border-bear/40 text-bear/60"
          )}
        >
          <span className="font-display text-xs font-black uppercase tracking-wider">▼ Pull DOWN to Fire SHORT</span>
        </div>
      </div>

      <div className="mt-2 text-center text-xs font-bold text-ink-400">
        Pull puck vertically and release into target zone
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-28 · MULTI-TOUCH PINCH CANDLE SCRUBBER — Mobile Depth Zoom
 * ===================================================================== */
export function PinchCandleScrubber() {
  const [scale, setScale] = useState(1.0);
  const [offset, setOffset] = useState(0);

  const candles = useMemo(() => {
    const rnd = mulberry32(404);
    let p = 60000;
    return Array.from({ length: 50 }, () => {
      const o = p;
      p = p + (rnd() - 0.49) * 450;
      return {
        o,
        c: p,
        h: Math.max(o, p) + rnd() * 200,
        l: Math.min(o, p) - rnd() * 200,
      };
    });
  }, []);

  return (
    <Asset
      title="Pinch-to-Expand Candle Scrubber"
      code="M-28"
      tags="pinch zoom multi-touch gesture scrub candles detail inspect stretch"
      span={6}
      badge="Pinch/Zoom"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-ink-300">Magnification Level:</span>
        <div className="flex gap-1.5">
          {[1.0, 1.5, 2.0, 3.0].map((s) => (
            <button
              key={s}
              onClick={() => { setScale(s); sfx("tick"); }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition",
                scale === s ? "bg-azure text-white" : "bg-ink-800 text-ink-300"
              )}
            >
              {s.toFixed(1)}x
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas with Horizontal Pinch Simulation */}
      <div className="h-52 bg-ink-950 rounded-2xl border border-white/10 overflow-hidden relative flex items-center">
        <svg viewBox="0 0 500 180" className="w-full h-full">
          {candles.map((c, idx) => {
            const isUp = c.c >= c.o;
            const w = 6 * scale;
            const x = 20 + idx * (9 * scale) + offset;
            const normY = (val: number) => 170 - ((val - 55000) / 10000) * 150;

            if (x < -20 || x > 520) return null;

            return (
              <g key={idx}>
                <line
                  x1={x + w / 2}
                  x2={x + w / 2}
                  y1={normY(c.h)}
                  y2={normY(c.l)}
                  stroke={isUp ? "#22d39a" : "#ff4d6d"}
                  strokeWidth={1.5}
                />
                <rect
                  x={x}
                  y={normY(Math.max(c.o, c.c))}
                  width={w}
                  height={Math.max(2, Math.abs(normY(c.o) - normY(c.c)))}
                  fill={isUp ? "#22d39a" : "#ff4d6d"}
                  rx={1}
                />
              </g>
            );
          })}
        </svg>

        <input
          type="range"
          min={-200}
          max={100}
          value={offset}
          onChange={(e) => setOffset(Number(e.target.value))}
          className="absolute bottom-2 inset-x-6 range"
        />
      </div>

      <div className="mt-2 text-center text-xs font-bold text-ink-400">
        Use multiplier buttons or scrubber slider to inspect wick details
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-29 · SMART GYRO WALLET VAULT — 3D Tilt Foil Unlocking
 * ===================================================================== */
export function GyroVaultCard() {
  const [unlocked, setUnlocked] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <Asset
      title="Gyro 3D Crypto Vault Card"
      code="M-29"
      tags="gyro tilt 3d holo vault private keys security biometric unlock"
      span={6}
      badge="Web3 Vault"
    >
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          setTilt({ x: x * 30, y: -y * 30 });
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="h-64 rounded-3xl p-6 relative overflow-hidden transition-transform duration-200 cursor-pointer select-none"
        style={{
          perspective: 1000,
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          background: "linear-gradient(135deg, #182d5c 0%, #0d1a3d 50%, #050b1c 100%)",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
        }}
        onClick={() => {
          setUnlocked((u) => !u);
          sfx(unlocked ? "tap" : "unlock");
        }}
      >
        {/* Holographic Sheen Layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.x * 2}% ${50 - tilt.y * 2}%, #2fd4ff, #ffc23d, #ff4d6d, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-black text-cyan">COLD VAULT SECURE</span>
            <span className="text-xl">{unlocked ? "🔓" : "🔒"}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-ink-400">Total Seed Value Protected:</span>
            <div className="font-display text-3xl font-black text-white mt-1">
              {unlocked ? "$248,910.45" : "••••••••••••"}
            </div>
            <div className="font-mono text-xs text-bull mt-1">
              {unlocked ? "4.12 BTC · 28.5 ETH · 12,000 USDT" : "Tap card to authenticate biometric"}
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-ink-400">
            <span>KEY: 0x98F...A41B</span>
            <span className="text-gold font-bold">HARDWARE SECURED</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <Btn variant={unlocked ? "bull" : "azure"} size="sm" onClick={() => setUnlocked((u) => !u)}>
          {unlocked ? "Lock Vault" : "Authenticate FaceID"}
        </Btn>
      </div>
    </Asset>
  );
}
