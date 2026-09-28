import { useMemo, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { clamp, useInView, useRafLoop } from "../hooks/motion";

/* =========================================================
   1. ORDER FLOW / FOOTPRINT CHART
   ========================================================= */
type Cluster = { price: number; bidVol: number; askVol: number; imbalance: "bid" | "ask" | null };
type FootprintCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  delta: number;
  totalVol: number;
  clusters: Cluster[];
};

function FootprintChart() {
  const [candles, setCandles] = useState<FootprintCandle[]>(() => {
    let p = 67200;
    const res: FootprintCandle[] = [];
    for (let i = 0; i < 5; i++) {
      const o = p;
      const c = o + (Math.random() - 0.45) * 80;
      const h = Math.max(o, c) + Math.random() * 30;
      const l = Math.min(o, c) - Math.random() * 30;
      p = c;

      const clusters: Cluster[] = [];
      let delta = 0;
      let totalVol = 0;
      const step = 20;
      for (let pr = Math.floor(l / step) * step; pr <= Math.ceil(h / step) * step; pr += step) {
        const b = Math.floor(Math.random() * 15 + 1);
        const a = Math.floor(Math.random() * 15 + 1);
        delta += a - b;
        totalVol += a + b;
        clusters.push({
          price: pr,
          bidVol: b,
          askVol: a,
          imbalance: a > b * 3 ? "ask" : b > a * 3 ? "bid" : null,
        });
      }
      res.push({
        time: `10:${30 + i * 5}`,
        open: o,
        high: h,
        low: l,
        close: c,
        delta,
        totalVol,
        clusters: clusters.reverse(),
      });
    }
    return res;
  });

  const [hoverCluster, setHoverCluster] = useState<Cluster | null>(null);

  const addCandle = () => {
    const last = candles[candles.length - 1];
    const o = last.close;
    const c = o + (Math.random() - 0.48) * 90;
    const h = Math.max(o, c) + 25;
    const l = Math.min(o, c) - 25;
    const clusters: Cluster[] = [];
    let delta = 0;
    let totalVol = 0;
    for (let pr = Math.floor(l / 20) * 20; pr <= Math.ceil(h / 20) * 20; pr += 20) {
      const b = Math.floor(Math.random() * 20 + 2);
      const a = Math.floor(Math.random() * 20 + 2);
      delta += a - b;
      totalVol += a + b;
      clusters.push({
        price: pr,
        bidVol: b,
        askVol: a,
        imbalance: a > b * 2.8 ? "ask" : b > a * 2.8 ? "bid" : null,
      });
    }
    setCandles((prev) => [
      ...prev.slice(1),
      {
        time: `10:${30 + prev.length * 5}`,
        open: o,
        high: h,
        low: l,
        close: c,
        delta,
        totalVol,
        clusters: clusters.reverse(),
      },
    ]);
    sfx.tick();
    haptic(5);
  };

  return (
    <Asset title="Footprint / Order Flow" id="adv.footprint" desc="Кластерный график институционального уровня: дельта бид/аск объёмов на каждом ценовом тике, подсветка дисбалансов (imbalance)." className="lg:col-span-2" tags={["PRO"]}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge tone="bull" dot>BTC/USDT Footprint</Badge>
          <span className="text-[11px] text-mute font-bold">Tick Size: 20 USDT</span>
        </div>
        <Btn3D size="xs" variant="blue" onClick={addCandle} icon={<Icon name="plus" size={13} />}>
          Next Bar
        </Btn3D>
      </div>

      <div className="inset !rounded-2xl p-3 overflow-x-auto">
        <div className="flex gap-3 min-w-[500px]">
          {candles.map((cd) => {
            const isBull = cd.close >= cd.open;
            return (
              <div key={cd.time} className="flex-1 flex flex-col items-center">
                {/* Candle header summary */}
                <div className="text-center mb-1.5">
                  <span className="text-[10px] text-dim font-bold block">{cd.time}</span>
                  <span className={cn("num text-[11px] font-extrabold", cd.delta >= 0 ? "text-bull" : "text-bear")}>
                    {cd.delta >= 0 ? `+${cd.delta}` : cd.delta}
                  </span>
                </div>

                {/* Footprint Cluster column */}
                <div className={cn("w-full rounded-xl border p-1 space-y-[2px]", isBull ? "border-bull/30 bg-bull/5" : "border-bear/30 bg-bear/5")}>
                  {cd.clusters.map((cl) => {
                    return (
                      <div
                        key={cl.price}
                        onMouseEnter={() => setHoverCluster(cl)}
                        className={cn(
                          "flex items-center justify-between px-1 py-[2px] rounded text-[10px] font-extrabold num cursor-crosshair transition-colors",
                          cl.imbalance === "ask" ? "bg-bull/25 ring-1 ring-bull/50" : cl.imbalance === "bid" ? "bg-bear/25 ring-1 ring-bear/50" : "hover:bg-white/10"
                        )}
                      >
                        <span className="text-bear">{cl.bidVol}</span>
                        <span className="text-[9px] text-dim">{cl.price}</span>
                        <span className="text-bull">{cl.askVol}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Volume bar footer */}
                <div className="w-full mt-2 text-center">
                  <div className="h-1.5 rounded-full bg-[#16275a] overflow-hidden">
                    <div className="h-full bg-blue rounded-full" style={{ width: `${Math.min(100, (cd.totalVol / 120) * 100)}%` }} />
                  </div>
                  <span className="num text-[9.5px] text-dim font-bold">{cd.totalVol} vol</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoverCluster && (
        <div className="mt-3 inset p-2.5 flex items-center justify-between text-[11.5px] font-bold anim-fade">
          <span>Ценовой уровень: <span className="num text-txt">${hoverCluster.price}</span></span>
          <span className="text-bear">Bid: {hoverCluster.bidVol}</span>
          <span className="text-bull">Ask: {hoverCluster.askVol}</span>
          <Badge tone={hoverCluster.imbalance === "ask" ? "bull" : hoverCluster.imbalance === "bid" ? "bear" : "neutral"} size="xs">
            {hoverCluster.imbalance ? `Imbalance ${hoverCluster.imbalance.toUpperCase()}` : "Balanced"}
          </Badge>
        </div>
      )}

      <div className="mt-3 inset p-3 grid sm:grid-cols-3 gap-2.5 text-[10.5px] font-bold text-mute">
        <div className="flex items-start gap-1.5">
          <span className="size-2 rounded-full bg-bull mt-1 shrink-0" />
          <span><b>Ask Imbalance:</b> Агрессивные рыночные покупатели смели лимиты продавцов в 3+ раза.</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="size-2 rounded-full bg-bear mt-1 shrink-0" />
          <span><b>Bid Imbalance:</b> Агрессивный сброс по рынку: продавцы продавили лимитные заявки.</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="size-2 rounded-full bg-gold mt-1 shrink-0" />
          <span><b>Delta Divergence:</b> Цена растёт, но суммарная дельта отрицательна — признак скрытого распределения.</span>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. LIQUIDITY HEATMAP CANVAS
   ========================================================= */
function LiquidityHeatmap() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [speed] = useState(1);
  const [sweepActive, setSweepActive] = useState(false);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.2 });

  const currentPrice = useRef(67400);

  const triggerSweep = () => {
    setSweepActive(true);
    sfx.whoosh();
    haptic([20, 40]);
    setTimeout(() => {
      setSweepActive(false);
      sfx.success();
    }, 1200);
  };

  useRafLoop(() => {
    const c = cv.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = 360;
    const H = 220;
    if (c.width !== W || c.height !== H) {
      c.width = W;
      c.height = H;
    }

    ctx.fillStyle = "#070d1f";
    ctx.fillRect(0, 0, W, H);

    // Render dense liquidity depth bands
    const bands = 14;
    const bandH = H / bands;
    for (let i = 0; i < bands; i++) {
      const y = i * bandH;
      const isAbove = i < bands / 2;
      const intensity = Math.sin(i * 0.8) * 0.4 + 0.45;

      // Color from deep purple to neon cyan (above) or warm orange/red (below)
      const r = isAbove ? 61 : 255;
      const g = isAbove ? Math.floor(123 + intensity * 100) : Math.floor(77 + intensity * 80);
      const b = isAbove ? 255 : 106;

      ctx.fillStyle = `rgba(${r},${g},${b},${intensity * 0.45})`;
      ctx.fillRect(0, y, W, bandH - 1);
    }

    // Wandering live market price line
    currentPrice.current += (Math.random() - 0.49) * 8 * speed;
    if (sweepActive) currentPrice.current += 16;
    const py = H / 2 + Math.sin(Date.now() * 0.002) * 35;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W, py);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price tag
    ctx.fillStyle = "#3d7bff";
    ctx.beginPath();
    ctx.roundRect(W - 74, py - 11, 70, 22, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = '800 10.5px "JetBrains Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText(`$${Math.round(currentPrice.current)}`, W - 39, py + 4);

    // If sweep is active, draw sweep laser scan
    if (sweepActive) {
      ctx.fillStyle = "rgba(31, 219, 139, 0.25)";
      ctx.fillRect(0, py - 24, W, 48);
    }
  }, inView);

  return (
    <Asset title="Liquidity Heatmap" id="adv.heatmap" desc="Тепловая карта плотности лимитных заявок в стакане: яркие зоны — скопления стоп-лоссов и ликвидаций (магниты для цены)." className="lg:col-span-1" tags={["CANVAS"]}>
      <div ref={inViewRef} className="flex flex-col items-center">
        <div className="relative w-full max-w-[360px] h-[220px] inset !rounded-3xl overflow-hidden shadow-[inset_0_4px_14px_rgba(0,0,0,0.6)]">
          <canvas ref={cv} className="w-full h-full block" />
        </div>
        <div className="flex gap-2 w-full mt-3">
          <Btn3D size="xs" variant="bull" full onClick={triggerSweep}>
            Simulate Liquidity Sweep
          </Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. MULTI-TIMEFRAME SYNCHRONIZED CHARTS
   ========================================================= */
function MultiTimeframeSync() {
  const [crosshairX, setCrosshairX] = useState<number | null>(null);

  const tfs = ["1m (Scalp)", "15m (Intraday)", "4H (Swing)"];

  const generateData = (seed: number, count: number) => {
    let p = 100;
    return Array.from({ length: count }, (_, i) => {
      p += Math.sin(i * 0.3 + seed) * 4 + (Math.random() - 0.48) * 3;
      return p;
    });
  };

  const d1 = useMemo(() => generateData(1, 40), []);
  const d2 = useMemo(() => generateData(3, 40), []);
  const d3 = useMemo(() => generateData(7, 40), []);

  const renderSvgChart = (data: number[], color: string) => {
    const W = 320;
    const H = 80;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / (max - min)) * (H - 16) - 8}`).join(" ");

    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[80px] overflow-visible cursor-crosshair"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCrosshairX(e.clientX - rect.left);
        }}
        onPointerLeave={() => setCrosshairX(null)}
      >
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        {crosshairX !== null && (
          <>
            <line x1={crosshairX} x2={crosshairX} y1="0" y2={H} stroke="rgba(255,255,255,0.6)" strokeDasharray="3 3" />
            <circle cx={crosshairX} cy={H / 2} r="4" fill="#ffffff" stroke={color} strokeWidth="2" />
          </>
        )}
      </svg>
    );
  };

  return (
    <Asset title="Synchronized Multi-Timeframe" id="adv.mtf" desc="Три таймфрейма (1m, 15m, 4H) с единым перекрестием: наведение на любой график проецирует временной маркер на остальные два." className="lg:col-span-2" tags={["SYNC"]}>
      <div className="space-y-2">
        {[
          { tf: tfs[0], data: d1, color: "#1fdb8b" },
          { tf: tfs[1], data: d2, color: "#3d7bff" },
          { tf: tfs[2], data: d3, color: "#ffc53d" },
        ].map((item) => (
          <div key={item.tf} className="inset !rounded-2xl p-2.5">
            <div className="flex justify-between items-center text-[10.5px] font-extrabold text-mute mb-1">
              <span>{item.tf}</span>
              <span className="num text-txt">$67,420</span>
            </div>
            {renderSvgChart(item.data, item.color)}
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   4. INTERACTIVE FIBONACCI RETRACEMENT TOOL
   ========================================================= */
function FibonacciTool() {
  const [highY, setHighY] = useState(25);
  const [lowY, setLowY] = useState(170);
  const [dragging, setDragging] = useState<"high" | "low" | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = clamp(e.clientY - rect.top, 15, 185);
    if (dragging === "high") {
      setHighY(Math.min(y, lowY - 20));
    } else {
      setLowY(Math.max(y, highY + 20));
    }
  };

  const fibLevels = [
    { ratio: 0.0, label: "0.0 (High)", color: "#8e9cc8" },
    { ratio: 0.236, label: "0.236", color: "#8d5cff" },
    { ratio: 0.382, label: "0.382", color: "#3d7bff" },
    { ratio: 0.5, label: "0.500", color: "#2ed3f0" },
    { ratio: 0.618, label: "0.618 (Golden Pocket)", color: "#ffc53d", golden: true },
    { ratio: 0.786, label: "0.786", color: "#ff8a3d" },
    { ratio: 1.0, label: "1.0 (Low)", color: "#8e9cc8" },
  ];

  const diff = lowY - highY;

  return (
    <Asset title="Fibonacci Retracement" id="adv.fib" desc="Интерактивная сетка Фибоначчи: перетаскивайте якоря Swing High и Swing Low за ручки, «Golden Pocket» подсвечивается золотым." className="lg:col-span-1" tags={["TOOL"]}>
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(null)}
        onPointerCancel={() => setDragging(null)}
        className="relative h-[220px] inset !rounded-3xl overflow-hidden select-none touch-none p-3"
      >
        {/* Golden pocket zone highlight (0.618 to 0.65) */}
        <div
          className="absolute inset-x-0 bg-gold/15 border-y border-gold/40"
          style={{
            top: highY + diff * 0.618,
            height: diff * (0.65 - 0.618 + 0.04),
          }}
        />

        {/* Fib levels */}
        {fibLevels.map((lvl) => {
          const y = highY + diff * lvl.ratio;
          return (
            <div key={lvl.ratio} className="absolute inset-x-2" style={{ top: y }}>
              <div className="h-[1px] w-full" style={{ background: lvl.color }} />
              <span
                className="absolute right-2 -top-2.5 text-[8.5px] font-extrabold num px-1 rounded bg-[#0a1330]"
                style={{ color: lvl.color }}
              >
                {lvl.label}
              </span>
            </div>
          );
        })}

        {/* Drag handles */}
        <div
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging("high");
            sfx.pop();
          }}
          className="absolute left-4 size-6 -ml-3 -mt-3 rounded-full bg-bull border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing grid place-items-center"
          style={{ top: highY }}
        >
          <span className="size-2 rounded-full bg-ink-900" />
        </div>

        <div
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging("low");
            sfx.pop();
          }}
          className="absolute left-4 size-6 -ml-3 -mt-3 rounded-full bg-bear border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing grid place-items-center"
          style={{ top: lowY }}
        >
          <span className="size-2 rounded-full bg-ink-900" />
        </div>
      </div>
      <div className="text-[10.5px] font-bold text-dim mt-2 text-center">
        Тяните маркеры High / Low для пересчёта уровней
      </div>
    </Asset>
  );
}

/* =========================================================
   5. VOLUME PROFILE (VPVR) WITH POINT OF CONTROL (POC)
   ========================================================= */
function VolumeProfileVPVR() {
  const profileBars = useMemo(
    () => [
      { price: 68100, vol: 24, isPoc: false },
      { price: 68000, vol: 48, isPoc: false },
      { price: 67900, vol: 82, isPoc: false },
      { price: 67800, vol: 130, isPoc: false },
      { price: 67700, vol: 195, isPoc: false },
      { price: 67600, vol: 280, isPoc: true }, // Point of Control (POC)
      { price: 67500, vol: 210, isPoc: false },
      { price: 67400, vol: 140, isPoc: false },
      { price: 67300, vol: 85, isPoc: false },
      { price: 67200, vol: 35, isPoc: false },
    ],
    []
  );

  return (
    <Asset title="Volume Profile (VPVR)" id="adv.vpvr" desc="Горизонтальный профиль проторгованного объёма: красная линия POC (Point of Control) — цена с максимальным интересом институционалов." className="lg:col-span-1" tags={["VPVR"]}>
      <div className="inset !rounded-2xl p-3 space-y-1">
        {profileBars.map((bar) => {
          const widthPct = (bar.vol / 280) * 100;
          return (
            <div key={bar.price} className="relative flex items-center justify-between text-[10px] font-bold num px-2 py-[2px] rounded overflow-hidden">
              <div
                className={cn("absolute inset-y-0 right-0 rounded-l transition-all", bar.isPoc ? "bg-bear/35" : "bg-blue/20")}
                style={{ width: `${widthPct}%` }}
              />
              <span className={cn("relative z-10", bar.isPoc ? "text-bear font-extrabold" : "text-mute")}>
                ${bar.price}
              </span>
              <span className="relative z-10 num text-dim font-extrabold">
                {bar.isPoc ? "★ POC (280 BTC)" : `${bar.vol} BTC`}
              </span>
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* =========================================================
   6. DEPTH OF MARKET (DOM) LADDER
   ========================================================= */
function DomLadder() {
  const [bids, setBids] = useState([
    { p: 67420, sz: 1.42, myOrder: false },
    { p: 67410, sz: 3.18, myOrder: true },
    { p: 67400, sz: 8.95, myOrder: false },
    { p: 67390, sz: 12.4, myOrder: false },
  ]);

  const [asks, setAsks] = useState([
    { p: 67460, sz: 9.15, myOrder: false },
    { p: 67450, sz: 4.82, myOrder: false },
    { p: 67440, sz: 2.11, myOrder: false },
    { p: 67430, sz: 0.95, myOrder: false },
  ]);

  const placeAt = (price: number, side: "buy" | "sell") => {
    sfx.coin();
    haptic(10);
    if (side === "buy") {
      setBids((prev) => prev.map((b) => (b.p === price ? { ...b, myOrder: !b.myOrder } : b)));
    } else {
      setAsks((prev) => prev.map((a) => (a.p === price ? { ...a, myOrder: !a.myOrder } : a)));
    }
  };

  const cancelAll = () => {
    setBids((prev) => prev.map((b) => ({ ...b, myOrder: false })));
    setAsks((prev) => prev.map((a) => ({ ...a, myOrder: false })));
    sfx.error();
    haptic([10, 20]);
  };

  return (
    <Asset title="DOM Ladder (Depth of Market)" id="adv.dom" desc="Стакан глубины заявок: один клик ставит лимитный ордер, подсветка собственной заявки, кнопка отмены всех ордеров." className="lg:col-span-2" tags={["TRADING"]}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-mute font-bold">Кликните по уровню цены для выставления/снятия ордера</span>
        <Btn3D size="xs" variant="bear" onClick={cancelAll}>
          Cancel All
        </Btn3D>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-bold num">
        {/* Asks */}
        <div className="space-y-1">
          <div className="flex justify-between text-dim text-[10px] uppercase font-extrabold px-2">
            <span>Ask Price</span>
            <span>Size</span>
          </div>
          {asks.map((a) => (
            <button
              key={a.p}
              onClick={() => placeAt(a.p, "sell")}
              className={cn(
                "w-full flex justify-between items-center px-2 py-1.5 rounded-lg border transition-all text-left",
                a.myOrder ? "bg-bear/30 border-bear text-white" : "bg-bear/10 border-bear/20 hover:bg-bear/20"
              )}
            >
              <span className="text-bear font-extrabold">${a.p}</span>
              <span className="text-txt">{a.sz} BTC</span>
            </button>
          ))}
        </div>

        {/* Bids */}
        <div className="space-y-1">
          <div className="flex justify-between text-dim text-[10px] uppercase font-extrabold px-2">
            <span>Bid Price</span>
            <span>Size</span>
          </div>
          {bids.map((b) => (
            <button
              key={b.p}
              onClick={() => placeAt(b.p, "buy")}
              className={cn(
                "w-full flex justify-between items-center px-2 py-1.5 rounded-lg border transition-all text-left",
                b.myOrder ? "bg-bull/30 border-bull text-white" : "bg-bull/10 border-bull/20 hover:bg-bull/20"
              )}
            >
              <span className="text-bull font-extrabold">${b.p}</span>
              <span className="text-txt">{b.sz} BTC</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

export default function AdvancedCharts() {
  return (
    <Section id="advcharts" index="14" title="Advanced Trading Canvas" subtitle="6 профессиональных инструментов: Order Flow Footprint, Heatmap стакана, Multi-Timeframe синхронизация, сетка Фибоначчи, Volume Profile VPVR, DOM лестница" count={6}>
      <div className="grid lg:grid-cols-3 gap-6">
        <FootprintChart />
        <LiquidityHeatmap />
        <MultiTimeframeSync />
        <FibonacciTool />
        <VolumeProfileVPVR />
        <DomLadder />
      </div>
    </Section>
  );
}
