import { useEffect, useState } from "react";
import { Asset, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstCoins, burstConfetti, celebrate } from "../utils/fx";

/* =========================================================
   1. TOKEN SWAP ENGINE & ROUTE VISUALIZER
   ========================================================= */
function TokenSwapRouter() {
  const [fromAmount, setFromAmount] = useState(1.5);
  const [slippage, setSlippage] = useState(0.5);
  const [mevShield, setMevShield] = useState(true);
  const [swapping, setSwapping] = useState(false);

  const ethPrice = 3512;
  const toAmount = (fromAmount * ethPrice * 0.998).toFixed(2);
  const priceImpact = fromAmount > 5 ? 1.42 : 0.08;

  const doSwap = () => {
    setSwapping(true);
    sfx.whoosh();
    haptic([20, 30, 50]);

    setTimeout(() => {
      setSwapping(false);
      sfx.success();
      burstCoins(innerWidth / 2, innerHeight / 2, 14);
    }, 1200);
  };

  return (
    <Asset title="DEX Token Swap & Router" id="wal.swap" desc="Автоматический маршрутизатор сделки: разбиение пути на пулы ликвидности, расчёт проскальзывания и защита от MEV-ботов." className="lg:col-span-2" tags={["DEX"]}>
      <div className="space-y-3">
        {/* From Box */}
        <div className="inset !rounded-2xl p-3">
          <div className="flex justify-between items-center text-[10.5px] font-extrabold text-mute mb-1">
            <span>You Pay</span>
            <span>Balance: 4.82 ETH</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <input
              type="number"
              step="0.1"
              value={fromAmount}
              onChange={(e) => setFromAmount(Math.max(0.01, +e.target.value))}
              className="bg-transparent num text-[26px] font-extrabold outline-none text-txt w-36"
            />
            <div className="flex items-center gap-2 raised !rounded-xl px-3 py-1.5 shrink-0">
              <span className="size-6 rounded-full bg-[#8c8cff] grid place-items-center text-ink-900 font-extrabold text-[11px]">
                Ξ
              </span>
              <span className="font-extrabold text-[13px]">ETH</span>
            </div>
          </div>
        </div>

        {/* Swap Switcher Icon */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={() => {
              sfx.pop();
              haptic(6);
            }}
            className="size-8 rounded-full bg-blue text-white grid place-items-center shadow-[0_3px_0_#2250c2] hover:scale-110 active:scale-95 transition-all"
          >
            <Icon name="swap" size={15} />
          </button>
        </div>

        {/* To Box */}
        <div className="inset !rounded-2xl p-3">
          <div className="flex justify-between items-center text-[10.5px] font-extrabold text-mute mb-1">
            <span>You Receive</span>
            <span>Rate: 1 ETH = $3,512</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="num text-[26px] font-extrabold text-bull">{toAmount}</span>
            <div className="flex items-center gap-2 raised !rounded-xl px-3 py-1.5 shrink-0">
              <span className="size-6 rounded-full bg-[#2ed3f0] grid place-items-center text-ink-900 font-extrabold text-[11px]">
                $
              </span>
              <span className="font-extrabold text-[13px]">USDT</span>
            </div>
          </div>
        </div>

        {/* Multi-Hop Route Visualizer */}
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 flex items-center justify-between text-[10px] font-bold text-mute">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-bull animate-pulse" />
            Маршрут: ETH → Uniswap v3 (0.05%) → USDT
          </span>
          <span className={priceImpact > 1 ? "text-bear font-extrabold" : "text-bull"}>
            Impact: {priceImpact}%
          </span>
        </div>

        {/* Swap Settings */}
        <div className="flex justify-between items-center text-[11px] font-bold text-mute pt-1">
          <div className="flex items-center gap-2">
            <span>Slippage:</span>
            {[0.1, 0.5, 1.0].map((sl) => (
              <button
                key={sl}
                onClick={() => setSlippage(sl)}
                className={cn(
                  "px-2 py-0.5 rounded num font-extrabold transition-all",
                  slippage === sl ? "bg-blue text-white" : "bg-white/5 text-dim hover:bg-white/10"
                )}
              >
                {sl}%
              </button>
            ))}
          </div>
          <button
            onClick={() => setMevShield(!mevShield)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold",
              mevShield ? "bg-bull/15 text-bull border border-bull/30" : "bg-white/5 text-dim"
            )}
          >
            <Icon name="shield" size={11} /> {mevShield ? "MEV Shield ON" : "MEV OFF"}
          </button>
        </div>

        <Btn3D size="lg" variant="bull" full loading={swapping} onClick={doSwap}>
          {swapping ? "Routing Swap…" : "Swap Tokens"}
        </Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. MULTI-CHAIN BRIDGE PACKET ANIMATION
   ========================================================= */
function MultiChainBridge() {
  const [transferring, setTransferring] = useState(false);
  const [packetProgress, setPacketProgress] = useState(0);

  const startBridge = () => {
    if (transferring) return;
    setTransferring(true);
    setPacketProgress(0);
    sfx.whoosh();
    haptic(10);

    const timer = setInterval(() => {
      setPacketProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTransferring(false);
          sfx.success();
          celebrate();
          return 100;
        }
        return prev + 10;
      });
    }, 180);
  };

  return (
    <Asset title="Multi-Chain Bridge" id="wal.bridge" desc="Межсетевой мост: анимированный перенос токенов между L1 Ethereum и L2 Arbitrum с проверкой контрольных точек консенсуса." className="lg:col-span-1" tags={["BRIDGE"]}>
      <div className="inset !rounded-2xl p-4 flex flex-col items-center">
        {/* Source & Destination Nodes */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex flex-col items-center">
            <div className="size-12 rounded-2xl bg-[#8c8cff] grid place-items-center text-ink-900 font-extrabold shadow-lg">
              Ξ
            </div>
            <span className="text-[11px] font-extrabold mt-1">Ethereum</span>
          </div>

          {/* Transfer Line with moving packet */}
          <div className="flex-1 relative mx-3 h-2 bg-[#16275a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue via-cyan to-violet transition-all duration-200"
              style={{ width: `${packetProgress}%` }}
            />
            {transferring && (
              <div
                className="absolute top-1/2 -mt-2 size-4 rounded-full bg-white shadow-[0_0_10px_#2ed3f0]"
                style={{ left: `calc(${packetProgress}% - 8px)` }}
              />
            )}
          </div>

          <div className="flex flex-col items-center">
            <div className="size-12 rounded-2xl bg-[#28a0f0] grid place-items-center text-white font-extrabold shadow-lg">
              A
            </div>
            <span className="text-[11px] font-extrabold mt-1">Arbitrum</span>
          </div>
        </div>

        {/* Bridge Status */}
        <div className="w-full text-[11px] font-bold text-mute space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Asset:</span>
            <span className="text-txt">0.5 WETH</span>
          </div>
          <div className="flex justify-between">
            <span>Est. Time:</span>
            <span className="num text-txt">~1.5 mins</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={transferring ? "text-cyan animate-pulse" : "text-bull"}>
              {transferring ? `Bridging (${packetProgress}%)` : "Ready to bridge"}
            </span>
          </div>
        </div>

        <Btn3D size="sm" variant="blue" full loading={transferring} onClick={startBridge}>
          {transferring ? "Confirming..." : "Bridge to Arbitrum"}
        </Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. SEED PHRASE SECURITY MINI-GAME
   ========================================================= */
const CORRECT_SEED = ["alpha", "whale", "rocket", "ledger", "candle", "satoshi"];

function SeedBackupGame() {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledBank, setShuffledBank] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setShuffledBank([...CORRECT_SEED].sort(() => Math.random() - 0.5));
  }, []);

  const selectWord = (word: string) => {
    if (selectedWords.includes(word) || status === "success") return;
    const next = [...selectedWords, word];
    setSelectedWords(next);
    sfx.tick();
    haptic(5);

    if (next.length === CORRECT_SEED.length) {
      if (next.every((w, i) => w === CORRECT_SEED[i])) {
        setStatus("success");
        sfx.levelUp();
        haptic([20, 40, 60]);
        burstConfetti(innerWidth / 2, innerHeight / 2, 40, 1);
      } else {
        setStatus("error");
        sfx.error();
        haptic([30, 30]);
        setTimeout(() => {
          setSelectedWords([]);
          setStatus("idle");
        }, 1100);
      }
    }
  };

  const reset = () => {
    setSelectedWords([]);
    setStatus("idle");
    setShuffledBank([...CORRECT_SEED].sort(() => Math.random() - 0.5));
    sfx.whoosh();
  };

  return (
    <Asset title="Seed Phrase Backup Trainer" id="wal.seed" desc="Тренажёр безопасности: соберите 6 слов мнемонической фразы в правильном порядке. Ошибка сбрасывает попытку." className="lg:col-span-3" tags={["SECURITY"]}>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[11px] font-extrabold text-mute">
          <span>Соберите фразу: alpha → whale → rocket → ledger → candle → satoshi</span>
          <Btn3D size="xs" variant="neutral" onClick={reset}>Reset</Btn3D>
        </div>

        {/* Drop Slot Container */}
        <div
          className={cn(
            "min-h-14 rounded-2xl p-2.5 flex flex-wrap gap-2 items-center border-2 border-dashed transition-all",
            status === "success"
              ? "border-bull bg-bull/10"
              : status === "error"
              ? "border-bear bg-bear/10 animate-shake"
              : "border-[#22366f] bg-[#0a1330]"
          )}
        >
          {selectedWords.length === 0 && (
            <span className="text-[11px] text-dim font-bold px-2">Нажимайте слова в правильной последовательности…</span>
          )}
          {selectedWords.map((word, i) => (
            <span
              key={word}
              className="px-3 py-1 rounded-xl bg-blue/20 border border-blue/40 text-blue font-extrabold text-[12px] flex items-center gap-1.5 anim-scale"
            >
              <span className="num text-[10px] text-dim">{i + 1}</span>
              {word}
            </span>
          ))}
        </div>

        {/* Word Chips Bank */}
        <div className="flex flex-wrap gap-2 pt-1">
          {shuffledBank.map((word) => {
            const used = selectedWords.includes(word);
            return (
              <button
                key={word}
                disabled={used}
                onClick={() => selectWord(word)}
                className={cn(
                  "opt px-3.5 h-10 rounded-xl text-[12.5px] font-bold transition-all",
                  used && "opacity-30 pointer-events-none"
                )}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

export default function WalletSimulator() {
  return (
    <Section id="walletsimulator" index="20" title="Web3 Wallet & Security Lab" subtitle="3 крипто-инструмента: DEX своп токенов с защитой от MEV, межсетевой мост L1/L2, тренажёр бэкапа мнемонической фразы" count={3}>
      <div className="grid lg:grid-cols-3 gap-6">
        <TokenSwapRouter />
        <MultiChainBridge />
        <SeedBackupGame />
      </div>
    </Section>
  );
}
