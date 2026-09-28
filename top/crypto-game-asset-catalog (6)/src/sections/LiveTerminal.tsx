import { useEffect, useMemo, useState } from "react";
import { Asset, Badge, Btn3D, Section, Segmented } from "../components/ui";
import { Icon } from "../components/Icons";
import { Mascot } from "./Mascot";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstCoins, celebrate } from "../utils/fx";

type Order = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  price: number;
  amount: number;
  time: string;
  status: "filled" | "open" | "canceled";
  pnl?: number;
};

type MarketAsset = {
  symbol: string;
  name: string;
  basePrice: number;
  volatility: number;
  iconColor: string;
};

const ASSETS: MarketAsset[] = [
  { symbol: "BTC", name: "Bitcoin", basePrice: 67420, volatility: 25, iconColor: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", basePrice: 3512, volatility: 4, iconColor: "#8c8cff" },
  { symbol: "SOL", name: "Solana", basePrice: 172.4, volatility: 0.8, iconColor: "#14f195" },
];

export default function LiveTerminal() {
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(ASSETS[0]);
  const [livePrice, setLivePrice] = useState(selectedAsset.basePrice);
  const [priceDirection, setPriceDirection] = useState<"up" | "down">("up");
  const [balance, setBalance] = useState(10000);
  const [leverage, setLeverage] = useState(5);
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderAmount, setOrderAmount] = useState(0.25);
  const [limitPrice, setLimitPrice] = useState(selectedAsset.basePrice);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-9421",
      symbol: "BTC",
      side: "buy",
      type: "limit",
      price: 66800,
      amount: 0.15,
      time: "10:14:22",
      status: "filled",
      pnl: 93.0,
    },
    {
      id: "ORD-9422",
      symbol: "ETH",
      side: "sell",
      type: "market",
      price: 3540,
      amount: 1.2,
      time: "10:28:05",
      status: "filled",
      pnl: -33.6,
    },
  ]);

  // Social Brag Card state
  const [cardOpen, setCardOpen] = useState(false);
  const [bragPnl, setBragPnl] = useState(38.4);
  const [bragAsset, setBragAsset] = useState("BTC/USDT");

  // Simulated live price ticks
  useEffect(() => {
    setLivePrice(selectedAsset.basePrice);
    setLimitPrice(selectedAsset.basePrice);
    const timer = setInterval(() => {
      setLivePrice((prev) => {
        const delta = (Math.random() - 0.49) * selectedAsset.volatility;
        const next = Math.max(1, prev + delta);
        setPriceDirection(delta >= 0 ? "up" : "down");
        return +next.toFixed(selectedAsset.symbol === "SOL" ? 2 : 0);
      });
    }, 900);
    return () => clearInterval(timer);
  }, [selectedAsset]);

  // Submit new order
  const submitOrder = () => {
    const execPrice = orderType === "market" ? livePrice : limitPrice;
    const requiredMargin = (execPrice * orderAmount) / leverage;

    if (requiredMargin > balance) {
      sfx.error();
      haptic([30, 40]);
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: selectedAsset.symbol,
      side: orderSide,
      type: orderType,
      price: execPrice,
      amount: orderAmount,
      time: new Date().toLocaleTimeString(),
      status: "filled",
      pnl: 0,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setBalance((prev) => Math.max(0, prev - (orderSide === "buy" ? 5 : 5))); // fee
    sfx.success();
    haptic(15);
    burstCoins(innerWidth / 2, innerHeight / 2, 8);
  };

  // Liquidation calculation
  const liquidationPrice = useMemo(() => {
    if (orderSide === "buy") {
      return livePrice * (1 - 1 / leverage);
    } else {
      return livePrice * (1 + 1 / leverage);
    }
  }, [livePrice, leverage, orderSide]);

  // Open social brag card
  const openBragCard = (order: Order) => {
    setBragPnl(order.pnl ?? 24.5);
    setBragAsset(`${order.symbol}/USDT`);
    setCardOpen(true);
    sfx.levelUp();
    celebrate();
  };

  return (
    <Section id="liveterminal" index="21" title="Live Simulated Trading Terminal" subtitle="Полноценный симулятор биржевого терминала: исполнение ордеров, маржинальный риск, расчёт ликвидации и генератор карточек прибыли для соцсетей" count={4}>
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 1. Terminal Header & Live Ticker */}
        <Asset title="Interactive Trading Terminal" id="term.core" desc="Полнофункциональный терминал: выбор актива, переключение плеча, расчет маржи и исполнение рыночных / лимитных ордеров." className="lg:col-span-2" tags={["ENGINE"]}>
          {/* Asset Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-2">
              {ASSETS.map((ast) => (
                <button
                  key={ast.symbol}
                  onClick={() => {
                    setSelectedAsset(ast);
                    sfx.tick();
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-extrabold text-[12px] flex items-center gap-2 border transition-all",
                    selectedAsset.symbol === ast.symbol
                      ? "bg-blue/20 border-blue text-white shadow-[0_2px_0_#2250c2]"
                      : "border-white/5 bg-white/5 text-mute hover:bg-white/10"
                  )}
                >
                  <span className="size-4 rounded-full grid place-items-center text-[9px] text-ink-900 font-extrabold" style={{ backgroundColor: ast.iconColor }}>
                    {ast.symbol[0]}
                  </span>
                  {ast.symbol}/USDT
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-mute">Demo Balance:</span>
              <span className="num font-extrabold text-bull text-[14px]">${balance.toLocaleString()}</span>
            </div>
          </div>

          {/* Price Header Banner */}
          <div className="inset !rounded-2xl p-4 flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-dim uppercase">{selectedAsset.symbol}/USDT Perpetual</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={cn("num text-[32px] font-extrabold leading-none", priceDirection === "up" ? "text-bull" : "text-bear")}>
                  ${livePrice.toLocaleString()}
                </span>
                <span className={cn("num text-[12px] font-bold", priceDirection === "up" ? "text-bull" : "text-bear")}>
                  {priceDirection === "up" ? "▲ +2.4%" : "▼ -1.2%"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold text-dim block uppercase">Est. Liquidation</span>
              <span className="num font-extrabold text-bear text-[15px]">${Math.round(liquidationPrice).toLocaleString()}</span>
            </div>
          </div>

          {/* Order Placement Form */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Btn3D
                size="sm"
                variant={orderSide === "buy" ? "bull" : "neutral"}
                onClick={() => setOrderSide("buy")}
                icon={<Icon name="arrowUp" size={15} stroke={3} />}
              >
                Buy / Long
              </Btn3D>
              <Btn3D
                size="sm"
                variant={orderSide === "sell" ? "bear" : "neutral"}
                onClick={() => setOrderSide("sell")}
                icon={<Icon name="arrowDown" size={15} stroke={3} />}
              >
                Sell / Short
              </Btn3D>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10.5px] font-bold text-mute block mb-1">Order Type</span>
                <Segmented
                  value={orderType}
                  onChange={(v) => setOrderType(v as "market" | "limit")}
                  size="sm"
                  options={[
                    { value: "market", label: "Market" },
                    { value: "limit", label: "Limit" },
                  ]}
                />
              </div>

              <div>
                <span className="text-[10.5px] font-bold text-mute block mb-1">Leverage ({leverage}x)</span>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={leverage}
                  onChange={(e) => setLeverage(+e.target.value)}
                  className="w-full accent-blue mt-1.5"
                />
              </div>
            </div>

            {orderType === "limit" && (
              <div className="inset !rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-[11px] font-bold text-mute">Limit Price:</span>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(+e.target.value)}
                  className="bg-transparent num text-right font-extrabold text-txt outline-none w-28"
                />
              </div>
            )}

            <div className="inset !rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-mute">Amount ({selectedAsset.symbol}):</span>
              <input
                type="number"
                step="0.05"
                value={orderAmount}
                onChange={(e) => setOrderAmount(Math.max(0.01, +e.target.value))}
                className="bg-transparent num text-right font-extrabold text-txt outline-none w-28"
              />
            </div>

            <Btn3D
              size="lg"
              full
              variant={orderSide === "buy" ? "bull" : "bear"}
              onClick={submitOrder}
            >
              {orderSide === "buy" ? `Buy ${selectedAsset.symbol}` : `Sell ${selectedAsset.symbol}`} ({leverage}x)
            </Btn3D>
          </div>
        </Asset>

        {/* 2. Margin & Risk Radar */}
        <Asset title="Margin & Risk Engine" id="term.risk" desc="Радар маржинального риска: мгновенный расчёт залоговой маржи, шкала опасности ликвидации и предупреждения." className="lg:col-span-1" tags={["RISK"]}>
          <div className="inset !rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center text-[11px] font-bold text-mute">
              <span>Margin Requirement:</span>
              <span className="num text-txt font-extrabold">
                ${Math.round((livePrice * orderAmount) / leverage).toLocaleString()} USDT
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold text-mute">
              <span>Position Size (Notional):</span>
              <span className="num text-gold font-extrabold">
                ${Math.round(livePrice * orderAmount).toLocaleString()} USDT
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold text-mute">
              <span>Estimated Trading Fee:</span>
              <span className="num text-txt font-extrabold">$2.40 USDT</span>
            </div>

            <div className="h-px bg-white/10" />

            <div>
              <div className="flex justify-between text-[11px] font-extrabold mb-1">
                <span>Liquidation Buffer</span>
                <span className={leverage > 20 ? "text-bear" : "text-bull"}>
                  {leverage > 20 ? "HIGH RISK!" : "SAFE"}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[#16275a] overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-300", leverage > 20 ? "bg-bear" : "bg-bull")}
                  style={{ width: `${Math.max(10, 100 - leverage * 1.8)}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-mute leading-snug">
              Принудительное закрытие позиции наступает при снижении маржи ниже 0.5% от номинальной стоимости контракта.
            </p>
          </div>
        </Asset>

        {/* 3. Execution History & Social Brag Card Generator */}
        <Asset title="Order History & Brag Card" id="term.history" desc="Журнал исполненных сделок: кликните «Share Brag Card» для генерации вирусной карточки прибыли для Telegram / X." className="lg:col-span-3" tags={["SOCIAL"]}>
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left text-[11.5px] font-bold">
              <thead>
                <tr className="border-b border-white/10 text-dim text-[10px] uppercase font-extrabold">
                  <th className="py-2">Order ID</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Type</th>
                  <th>Filled Price</th>
                  <th>Amount</th>
                  <th>Time</th>
                  <th>PnL</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 num text-dim font-bold">{ord.id}</td>
                    <td>{ord.symbol}/USDT</td>
                    <td>
                      <Badge tone={ord.side === "buy" ? "bull" : "bear"} size="xs">
                        {ord.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="capitalize text-dim">{ord.type}</td>
                    <td className="num font-extrabold">${ord.price.toLocaleString()}</td>
                    <td className="num">{ord.amount}</td>
                    <td className="text-dim text-[10.5px]">{ord.time}</td>
                    <td className={cn("num font-extrabold", (ord.pnl ?? 0) >= 0 ? "text-bull" : "text-bear")}>
                      {(ord.pnl ?? 0) >= 0 ? `+${ord.pnl}%` : `${ord.pnl}%`}
                    </td>
                    <td className="text-right">
                      <Btn3D size="xs" variant="gold" onClick={() => openBragCard(ord)}>
                        Share Brag
                      </Btn3D>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Asset>
      </div>

      {/* Social Brag Card Modal */}
      {cardOpen && (
        <div
          className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md anim-fade"
          onClick={() => setCardOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-[32px] p-6 bg-gradient-to-b from-[#1b2f70] via-[#0f1b3f] to-[#070d1f] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center anim-scale"
          >
            <button
              onClick={() => setCardOpen(false)}
              className="absolute top-4 right-4 text-dim hover:text-txt"
            >
              <Icon name="x" size={18} />
            </button>

            <Badge tone="bull" size="sm" className="mb-3">
              TRADELINGO VERIFIED PNL
            </Badge>

            <Mascot mood="cheer" size={130} />

            <div className="font-extrabold text-[15px] text-mute mt-3">{bragAsset} Long 10x</div>
            <div className="num text-[44px] font-extrabold text-bull leading-none mt-1">
              +{bragPnl}%
            </div>
            <p className="text-[11.5px] text-white/70 mt-2 font-semibold">
              Учись торговать без риска в Tradelingo — мобильной игре №1 по криптотрейдингу.
            </p>

            <div className="flex gap-2 mt-5">
              <Btn3D
                size="sm"
                variant="bull"
                full
                onClick={() => {
                  sfx.success();
                  burstCoins(innerWidth / 2, innerHeight / 2, 16);
                  setCardOpen(false);
                }}
              >
                Copy Brag Image
              </Btn3D>
              <Btn3D size="sm" variant="neutral" onClick={() => setCardOpen(false)}>
                Close
              </Btn3D>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
