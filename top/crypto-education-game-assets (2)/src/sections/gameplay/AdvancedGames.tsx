import { useState, useRef, useEffect } from "react";
import { Asset, Btn, Chip, Label, Confetti } from "../../components/ui";
import { Icon } from "../../components/icons";
import { fx, useGame } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { useInterval } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * G-25 · PUMP & CRASH — Multiplier Rocket Crash Game
 * ===================================================================== */
export function PumpCrashGame() {
  const g = useGame();
  const [bet, setBet] = useState(20);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [status, setStatus] = useState<"idle" | "pumping" | "crashed" | "cashed">("idle");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [history, setHistory] = useState<number[]>([1.45, 2.8, 1.12, 5.4, 1.05, 3.2, 12.4]);
  const [fire, setFire] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const startTime = useRef<number>(0);
  const currentMult = useRef<number>(1.0);

  const startPump = () => {
    if (g.coins < bet) {
      sfx("error");
      return;
    }
    if (!g.spend("coins", bet)) return;

    // Determine crash point
    const r = Math.random();
    let point = 1.0;
    if (r < 0.1) point = 1.0 + Math.random() * 0.15; // Instant crash 10%
    else if (r < 0.4) point = 1.15 + Math.random() * 0.85; // 1.15x - 2.0x (30%)
    else if (r < 0.75) point = 2.0 + Math.random() * 2.5; // 2.0x - 4.5x (35%)
    else if (r < 0.92) point = 4.5 + Math.random() * 5.5; // 4.5x - 10x (17%)
    else point = 10.0 + Math.random() * 15.0; // 10x - 25x (8%)
    
    setCrashPoint(point);
    setStatus("pumping");
    setMultiplier(1.0);
    currentMult.current = 1.0;
    startTime.current = performance.now();
    sfx("charge");

    const tick = (now: number) => {
      const elapsed = (now - startTime.current) / 1000;
      // Exponential curve: 1.06^(elapsed * 8)
      const m = Math.max(1.0, Math.pow(1.075, elapsed * 7.5));
      currentMult.current = m;
      setMultiplier(m);

      if (m >= autoCashout && autoCashout > 1.0 && status !== "cashed") {
        // Auto cashout check handled inside state or here
      }

      if (m >= point) {
        setStatus("crashed");
        setHistory((prev) => [Number(point.toFixed(2)), ...prev.slice(0, 7)]);
        sfx("lose");
        try { navigator.vibrate?.([60, 40, 80]); } catch {}
        return;
      }

      animFrame.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(tick);
  };

  const cashOut = () => {
    if (status !== "pumping") return;
    cancelAnimationFrame(animFrame.current);
    const winMult = currentMult.current;
    setStatus("cashed");
    const payout = Math.round(bet * winMult);
    g.reward("coins", payout);
    setFire((f) => f + 1);
    sfx("levelup");
    fx.text(canvasRef.current, `+${payout} 🪙`, "#ffc23d", true);
    setHistory((prev) => [Number(winMult.toFixed(2)), ...prev.slice(0, 7)]);
  };

  // Draw rocket & curve
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    const render = () => {
      const w = cvs.width;
      const h = cvs.height;
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = "rgba(62, 139, 255, 0.08)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      if (status === "pumping" || status === "crashed" || status === "cashed") {
        const m = currentMult.current;
        const normX = Math.min(1, (m - 1) / 10);
        const normY = Math.min(1, (m - 1) / 10);

        const endX = 30 + normX * (w - 70);
        const endY = h - 25 - normY * (h - 60);

        // Gradient curve
        const grad = ctx.createLinearGradient(0, h, endX, endY);
        if (status === "crashed") {
          grad.addColorStop(0, "rgba(255, 77, 109, 0.2)");
          grad.addColorStop(1, "#ff4d6d");
        } else if (status === "cashed") {
          grad.addColorStop(0, "rgba(255, 194, 61, 0.2)");
          grad.addColorStop(1, "#ffc23d");
        } else {
          grad.addColorStop(0, "rgba(34, 211, 154, 0.2)");
          grad.addColorStop(1, "#22d39a");
        }

        ctx.beginPath();
        ctx.moveTo(30, h - 25);
        ctx.quadraticCurveTo(endX * 0.4, h - 25, endX, endY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Area under curve
        ctx.lineTo(endX, h - 25);
        ctx.closePath();
        ctx.fillStyle = status === "crashed" ? "rgba(255, 77, 109, 0.05)" : "rgba(34, 211, 154, 0.08)";
        ctx.fill();

        // Rocket / Icon at the tip
        ctx.save();
        ctx.translate(endX, endY);
        if (status === "crashed") {
          ctx.font = "28px sans-serif";
          ctx.fillText("💥", -14, 10);
        } else {
          ctx.rotate(-0.45);
          ctx.font = "26px sans-serif";
          ctx.fillText("🚀", -13, 10);
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [status]);

  return (
    <Asset
      title="Pump & Crash · Multiplier Rocket"
      code="G-25"
      tags="pump crash rocket multiplier crypto casino arcade high roller timing cashout"
      span={6}
      badge="Arcade 99"
    >
      <Confetti fire={fire} count={40} />
      
      {/* History Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider shrink-0">Recent:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={cn(
              "px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 shadow-sm",
              h >= 4.0 ? "bg-gold/20 text-gold ring-1 ring-gold/40" : h >= 2.0 ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear"
            )}
          >
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Main Screen */}
      <div className="relative mt-2 h-52 rounded-2xl bg-ink-950 overflow-hidden border border-white/10 flex flex-col justify-center items-center">
        <canvas ref={canvasRef} width={420} height={208} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Large Multiplier Display */}
        <div className="relative z-10 flex flex-col items-center">
          <span
            className={cn(
              "font-display text-5xl font-black tracking-tight",
              status === "crashed" ? "text-bear anim-shake" : status === "cashed" ? "text-gold anim-bump" : "text-white"
            )}
            style={{ textShadow: status === "pumping" ? "0 0 25px rgba(34, 211, 154, 0.4)" : "none" }}
          >
            {multiplier.toFixed(2)}x
          </span>
          <span className="text-xs font-bold uppercase tracking-widest mt-1 text-ink-400">
            {status === "pumping"
              ? "Rocket is Flying!"
              : status === "crashed"
              ? `CRASHED @ ${crashPoint.toFixed(2)}x`
              : status === "cashed"
              ? `CASHED OUT @ +$${Math.round(bet * multiplier)}`
              : "READY TO LAUNCH"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 grid grid-cols-2 gap-3 items-center">
        <div>
          <Label>Wager Amount</Label>
          <div className="flex gap-1.5">
            {[10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => { setBet(amt); sfx("tick"); }}
                disabled={status === "pumping"}
                className={cn(
                  "flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition",
                  bet === amt ? "bg-azure text-white shadow-[0_2px_0_#1c55c2]" : "bg-ink-800 text-ink-300 hover:bg-ink-700"
                )}
              >
                {amt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Auto Cashout</Label>
          <div className="flex gap-1.5">
            {[1.5, 2.0, 3.0, 5.0].map((m) => (
              <button
                key={m}
                onClick={() => { setAutoCashout(m); sfx("tick"); }}
                disabled={status === "pumping"}
                className={cn(
                  "flex-1 py-1.5 rounded-xl font-mono text-xs font-bold transition",
                  autoCashout === m ? "bg-violet text-white shadow-[0_2px_0_#5a3ccc]" : "bg-ink-800 text-ink-300 hover:bg-ink-700"
                )}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {status === "pumping" ? (
          <Btn variant="gold" block size="lg" onClick={cashOut} className="anim-pulse-ring">
            Cash Out (${Math.round(bet * multiplier)})
          </Btn>
        ) : (
          <Btn variant="bull" block size="lg" onClick={startPump}>
            <Icon name="bolt" size={20} /> Launch Rocket ({bet} Coins)
          </Btn>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-26 · MEME COIN TWEET RADAR — Influencer Sentiment Simulator
 * ===================================================================== */
export function MemeRadarGame() {
  const g = useGame();
  const [tweetIndex, setTweetIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const TWEETS = [
    {
      author: "Elon Bark",
      handle: "@dogeking_99",
      avatar: "🐕",
      text: "Thinking about putting literal Doge on literal Moon with my next rocket. Just saying...",
      isBull: true,
      reason: "Hype influencer tweet historically sparks massive speculative retail pump.",
    },
    {
      author: "Fed Chairman Jerome",
      handle: "@fed_print_machine",
      avatar: "🏦",
      text: "Inflation remains stubborn. We are considering 3 consecutive 50bps rate hikes next quarter.",
      isBull: false,
      reason: "Rate hikes dry up speculative liquidity, severely crashing meme coins.",
    },
    {
      author: "CryptoWhale_0x",
      handle: "@onchain_sleuth",
      avatar: "🐋",
      text: "Top 3 dev wallets just dumped 40% of circulating supply into Uniswap pool liquidity.",
      isBull: false,
      reason: "Dev dump indicates rug-pull or massive insider exit liquidity.",
    },
    {
      author: "Binance Listing Bot",
      handle: "@listings_bot",
      avatar: "🟡",
      text: "New Spot Trading Pair Available: $PEPE / USDT is now live with zero maker fees!",
      isBull: true,
      reason: "Tier-1 exchange listing instantly introduces millions of retail buyers.",
    },
    {
      author: "CertiK Security Alerts",
      handle: "@certik_alert",
      avatar: "🛡️",
      text: "CRITICAL: Malicious backdoor detected in proxy contract. Mint function allows infinite supply.",
      isBull: false,
      reason: "Smart contract exploit leads to instant hyperinflation and price zero.",
    },
  ];

  const current = TWEETS[tweetIndex % TWEETS.length];

  const handleVote = (voteBull: boolean) => {
    const isCorrect = voteBull === current.isBull;
    if (isCorrect) {
      sfx("success");
      setStreak((s) => s + 1);
      setScore((sc) => sc + 50 * (streak + 1));
      g.reward("xp", 15);
      setFeedback(`Correct! ${current.reason}`);
    } else {
      sfx("error");
      setStreak(0);
      g.loseHeart();
      setFeedback(`Wrong! ${current.reason}`);
    }

    setTimeout(() => {
      setFeedback(null);
      setTweetIndex((idx) => idx + 1);
    }, 2200);
  };

  return (
    <Asset
      title="Meme Tweet Sentiment Radar"
      code="G-26"
      tags="twitter sentiment news pump dump meme coins trading signals social"
      span={6}
      badge="Viral"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Chip tone="azure">News Sentiment</Chip>
          <span className="text-xs font-bold text-ink-300">Streak: {streak} 🔥</span>
        </div>
        <span className="font-mono text-sm font-bold text-gold">Score: {score}</span>
      </div>

      {/* Tweet Card */}
      <div className="panel-raised p-4 rounded-2xl border border-white/10 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <span className="text-3xl p-2 rounded-xl bg-ink-800 shadow-inner">{current.avatar}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-black text-white">{current.author}</span>
              <span className="text-cyan text-xs">✓</span>
            </div>
            <span className="text-xs font-mono text-ink-400">{current.handle}</span>
            <p className="mt-2.5 text-sm font-bold text-ink-100 leading-relaxed">{current.text}</p>
          </div>
        </div>

        {feedback && (
          <div className="anim-slide-up absolute inset-0 bg-ink-950/90 backdrop-blur-md p-4 flex flex-col justify-center items-center text-center">
            <span className={cn("font-display text-base font-black mb-1", feedback.startsWith("Correct") ? "text-bull" : "text-bear")}>
              {feedback.startsWith("Correct") ? "🎯 ACCURATE ANALYSIS" : "⚠️ MISSED SIGNAL"}
            </span>
            <p className="text-xs font-semibold text-ink-200 max-w-sm">{current.reason}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn variant="bear" size="lg" onClick={() => handleVote(false)} disabled={!!feedback}>
          <Icon name="trendDown" size={20} stroke={3} /> Dump (Bearish)
        </Btn>
        <Btn variant="bull" size="lg" onClick={() => handleVote(true)} disabled={!!feedback}>
          <Icon name="trendUp" size={20} stroke={3} /> Pump (Bullish)
        </Btn>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * G-27 · TRADING BOT STRATEGY BUILDER — Visual Node Logic
 * ===================================================================== */
export function AlgoBotBuilder() {
  const g = useGame();
  const [trigger, setTrigger] = useState<"RSI < 30" | "MACD Cross" | "EMA 20/50" | "Bollinger Break">("RSI < 30");
  const [filter, setFilter] = useState<"Volume Spike" | "Bullish Market" | "No Filter">("Volume Spike");
  const [action, setAction] = useState<"Market Buy" | "Limit Buy -1%" | "DCA 3-Steps">("Market Buy");
  const [tested, setTested] = useState(false);
  const [winrate, setWinrate] = useState(0);
  const [profit, setProfit] = useState(0);

  const runBacktest = () => {
    sfx("charge");
    setTested(false);

    // Calculate score based on logic pairing
    let baseWin = 52;
    if (trigger === "RSI < 30" && filter === "Volume Spike") baseWin += 19;
    if (trigger === "MACD Cross" && filter === "Bullish Market") baseWin += 23;
    if (action === "Limit Buy -1%") baseWin += 7;
    if (action === "DCA 3-Steps") baseWin += 12;

    const noise = (Math.random() - 0.5) * 8;
    const finalWin = Math.min(94, Math.round(baseWin + noise));
    const finalPnl = Math.round(finalWin * 4.2 - 120);

    setTimeout(() => {
      setWinrate(finalWin);
      setProfit(finalPnl);
      setTested(true);
      sfx(finalPnl > 0 ? "success" : "error");
      if (finalPnl > 0) g.reward("xp", 25);
    }, 700);
  };

  return (
    <Asset
      title="Algo Strategy Node Builder"
      code="G-27"
      tags="algo bot strategy nodes logic visual programming backtest quantitative"
      span={6}
      badge="Pro Algo"
    >
      <div className="space-y-3">
        {/* Node 1: Trigger */}
        <div className="panel-inset p-3 rounded-xl border-l-4 border-azure">
          <Label>1. Trigger Signal</Label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {(["RSI < 30", "MACD Cross", "EMA 20/50", "Bollinger Break"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTrigger(t); setTested(false); sfx("tick"); }}
                className={cn(
                  "py-1.5 px-2.5 rounded-lg text-xs font-bold text-left transition",
                  trigger === t ? "bg-azure text-white shadow" : "bg-ink-800 text-ink-300 hover:bg-ink-700"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Node 2: Confirmation */}
        <div className="panel-inset p-3 rounded-xl border-l-4 border-violet">
          <Label>2. Confirmation Filter</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {(["Volume Spike", "Bullish Market", "No Filter"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setTested(false); sfx("tick"); }}
                className={cn(
                  "py-1.5 px-2 rounded-lg text-xs font-bold text-center transition",
                  filter === f ? "bg-violet text-white shadow" : "bg-ink-800 text-ink-300 hover:bg-ink-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Node 3: Execution */}
        <div className="panel-inset p-3 rounded-xl border-l-4 border-bull">
          <Label>3. Execution Action</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {(["Market Buy", "Limit Buy -1%", "DCA 3-Steps"] as const).map((a) => (
              <button
                key={a}
                onClick={() => { setAction(a); setTested(false); sfx("tick"); }}
                className={cn(
                  "py-1.5 px-2 rounded-lg text-xs font-bold text-center transition",
                  action === a ? "bg-bull text-ink-950 font-black shadow" : "bg-ink-800 text-ink-300 hover:bg-ink-700"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Backtest Results */}
      {tested && (
        <div className="anim-pop mt-4 panel-raised p-3 rounded-xl flex items-center justify-between border border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-400">Backtest (30 Days):</span>
            <div className="font-display text-base font-black text-white">Winrate: {winrate}%</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase text-ink-400">Net Profit</span>
            <div className={cn("font-mono text-base font-black", profit >= 0 ? "text-bull" : "text-bear")}>
              {profit >= 0 ? "+" : ""}${profit}
            </div>
          </div>
        </div>
      )}

      <Btn variant="azure" block size="md" className="mt-4" onClick={runBacktest}>
        <Icon name="play" size={16} /> Run 100-Trade Simulation
      </Btn>
    </Asset>
  );
}

/* =====================================================================
 * G-28 · LEVERAGE LIQUIDATION RUNNER — Endless Obstacle Dodge
 * ===================================================================== */
export function LiquidationRunner() {
  const [lane, setLane] = useState<0 | 1 | 2>(1); // Left, Mid, Right
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; text: string }[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowLeft") setLane((l) => (l > 0 ? ((l - 1) as 0 | 1 | 2) : l));
      if (e.key === "ArrowRight") setLane((l) => (l < 2 ? ((l + 1) as 0 | 1 | 2) : l));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setLane(1);
    sfx("go");
  };

  // Game loop
  useInterval(() => {
    if (!isPlaying) return;
    setScore((s) => s + 10);

    // Move obstacles down
    setObstacles((prev) => {
      const moved = prev.map((o) => ({ ...o, y: o.y + 12 }));

      // Collision check with player (lane match & y between 75 and 95)
      const hit = moved.some((o) => o.lane === lane && o.y >= 75 && o.y <= 95);
      if (hit) {
        setIsPlaying(false);
        setGameOver(true);
        sfx("lose");
        return [];
      }

      // Add new obstacle periodically
      if (Math.random() < 0.28 && (moved.length === 0 || moved[moved.length - 1].y > 35)) {
        const obsTexts = ["🚨 100x WICK", "📉 CPI SPIKE", "💀 FUNDING SURGE", "⚡ FLASH CRASH"];
        moved.push({
          id: Date.now() + Math.random(),
          lane: Math.floor(Math.random() * 3),
          y: 0,
          text: obsTexts[Math.floor(Math.random() * obsTexts.length)],
        });
      }

      return moved.filter((o) => o.y < 110);
    });
  }, isPlaying ? 65 : null);

  return (
    <Asset
      title="Liquidation Runner · 3-Lane Dodge"
      code="G-28"
      tags="runner arcade dodge reflex 3-lane liquidation wick survival fast-paced"
      span={6}
      badge="Fast Action"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-ink-300">Dodge liquidation wicks! (Use ← → buttons or keys)</span>
        <span className="font-mono text-sm font-bold text-gold">Distance: {score}m</span>
      </div>

      {/* 3-Lane Track */}
      <div className="relative h-60 bg-ink-950 rounded-2xl border border-white/10 overflow-hidden flex">
        {/* Lane 0, 1, 2 */}
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="flex-1 border-r border-white/5 relative flex justify-center">
            {/* Player Car / Bull */}
            {lane === idx && isPlaying && (
              <div className="absolute bottom-4 text-3xl anim-bounce-soft transition-all duration-150">
                🐂
              </div>
            )}
          </div>
        ))}

        {/* Falling Obstacles */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute rounded-lg bg-bear/90 text-white font-mono text-[9px] font-black px-1.5 py-1 shadow-[0_0_12px_#ff4d6d] pointer-events-none text-center"
            style={{
              left: `${obs.lane * 33.33 + 3}%`,
              top: `${obs.y}%`,
              width: "27%",
            }}
          >
            {obs.text}
          </div>
        ))}

        {/* Start / Gameover Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            {gameOver ? (
              <>
                <span className="text-4xl mb-1">💥</span>
                <span className="font-display text-xl font-black text-bear">LIQUIDATED!</span>
                <span className="text-xs text-ink-300 mt-1">Survived: {score} meters</span>
                <Btn variant="gold" size="sm" className="mt-3" onClick={startGame}>
                  Re-enter Margin
                </Btn>
              </>
            ) : (
              <>
                <span className="text-4xl mb-1">⚡</span>
                <span className="font-display text-lg font-black text-white">High-Leverage Lane Runner</span>
                <span className="text-xs text-ink-300 mt-1">Avoid margin calls and black-swan wicks.</span>
                <Btn variant="bull" size="sm" className="mt-3" onClick={startGame}>
                  Start Running
                </Btn>
              </>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Btn variant="ghost" size="md" onClick={() => setLane((l) => (l > 0 ? ((l - 1) as 0 | 1 | 2) : l))} disabled={!isPlaying}>
          <Icon name="chevronLeft" size={18} stroke={3} /> Left Lane
        </Btn>
        <Btn variant="ghost" size="md" onClick={() => setLane((l) => (l < 2 ? ((l + 1) as 0 | 1 | 2) : l))} disabled={!isPlaying}>
          Right Lane <Icon name="chevronRight" size={18} stroke={3} />
        </Btn>
      </div>
    </Asset>
  );
}
