import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ArrowDown, X, Plus, Minus, Crosshair, Layers, Wallet, Activity } from "lucide-react";
import { Asset, Section, Btn, Bar } from "../kit/ui";
import { CandleChart, genSeries, makeScale, BULL, BEAR } from "../kit/chart";
import { AnimatedNumber, SpringBar } from "../kit/spring";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ============ DJ-01 ORDER LADDER ============ */
type Order = { id: number; price: number; side: "bid" | "ask"; size: number };
function Ladder() {
  const [mid, setMid] = useState(64200);
  const [orders, setOrders] = useState<Order[]>([]);
  const [side, setSide] = useState<"bid" | "ask">("bid");
  const [size, setSize] = useState(0.05);
  const id = useRef(1);
  useEffect(() => {
    const t = setInterval(() => setMid((m) => m + (Math.random() - 0.5) * 14), 900);
    return () => clearInterval(t);
  }, []);
  const rows = useMemo(() => {
    const step = 10;
    return [...Array(11)].map((_, i) => {
      const price = Math.round((mid - 5 * step + i * step) / 5) * 5;
      const dist = Math.abs(i - 5);
      const base = Math.max(0.02, 1.4 - dist * 0.22 + Math.random() * 0.3);
      return { price, bid: i < 5 ? base : 0, ask: i > 5 ? base : 0, mid: i === 5 };
    }).reverse();
  }, [Math.round(mid / 10)]);
  const place = (price: number) => {
    setOrders((o) => [...o, { id: id.current++, price, side, size }]);
    sfxRaw.pop();
  };
  const totalBid = orders.filter((o) => o.side === "bid").reduce((a, o) => a + o.size, 0);
  return (
    <Asset code="DJ-01" title="Order Ladder (DOM)" desc="Лестница цен с живыми объёмами. Выбери сторону и размер, кликни по строке — ордер встанет в стакан." hint="Кликни по цене" specs={["11 levels", "live sizes", "own orders"]}>
      <div className="mb-2 flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl bg-ink-900 p-1">
          {(["bid", "ask"] as const).map((s) => (
            <button key={s} onClick={() => { setSide(s); sfx.tick(); }} className={cn("h-8 rounded-lg text-[11px] font-extrabold uppercase transition", side === s ? (s === "bid" ? "bg-bull text-ink-900" : "bg-bear") : "text-mist")}>{s === "bid" ? "Buy" : "Sell"}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-ink-900 px-2 py-1">
          <button onClick={() => setSize((v) => Math.max(0.01, +(v - 0.01).toFixed(2)))} className="text-mist hover:text-white"><Minus size={13} /></button>
          <span className="num w-12 text-center text-[12px] font-extrabold">{size.toFixed(2)}</span>
          <button onClick={() => setSize((v) => +(v + 0.01).toFixed(2))} className="text-mist hover:text-white"><Plus size={13} /></button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-ink-900/70">
        <div className="num grid grid-cols-[1fr_auto_1fr] px-3 py-1.5 text-[9px] font-bold uppercase text-mist"><span>Bid</span><span>Price</span><span className="text-right">Ask</span></div>
        {rows.map((r) => {
          const mine = orders.filter((o) => o.price === r.price);
          return (
            <button key={r.price} onClick={() => place(r.price)} className={cn("num group/r relative grid w-full grid-cols-[1fr_auto_1fr] items-center px-3 py-[5px] text-[11px] font-bold transition hover:bg-white/5", r.mid && "bg-gold/10")}>
              <span className="relative text-left">
                {r.bid > 0 && <span className="absolute inset-y-0 left-0 rounded bg-bull/25 transition-all duration-500" style={{ width: `${Math.min(100, r.bid * 55)}%` }} />}
                <span className="relative text-bull">{r.bid ? r.bid.toFixed(2) : ""}</span>
              </span>
              <span className={cn("px-3", r.mid ? "text-gold" : "text-snow")}>{r.price.toLocaleString()}</span>
              <span className="relative text-right">
                {r.ask > 0 && <span className="absolute inset-y-0 right-0 rounded bg-bear/25 transition-all duration-500" style={{ width: `${Math.min(100, r.ask * 55)}%` }} />}
                <span className="relative text-bear">{r.ask ? r.ask.toFixed(2) : ""}</span>
              </span>
              {mine.length > 0 && (
                <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-1" onClick={(e) => e.stopPropagation()}>
                  {mine.map((o) => (
                    <span key={o.id} onClick={() => { setOrders((x) => x.filter((z) => z.id !== o.id)); sfxRaw.thud(); }} className={cn("anim-pop flex cursor-pointer items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-black", o.side === "bid" ? "bg-bull text-ink-900" : "bg-bear")}>
                      {o.size.toFixed(2)} <X size={9} />
                    </span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="num mt-2 flex justify-between text-[10px] text-mist"><span>spread 10.0</span><span>mid <span className="text-gold">{Math.round(mid).toLocaleString()}</span></span><span>my bids {totalBid.toFixed(2)}</span></div>
    </Asset>
  );
}

/* ============ DJ-02 DEPTH CHART ============ */
function Depth() {
  const [hover, setHover] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1400); return () => clearInterval(t); }, []);
  const { bids, asks } = useMemo(() => {
    const b: [number, number][] = [], a: [number, number][] = [];
    let cb = 0, ca = 0;
    for (let i = 20; i >= 1; i--) { cb += 0.3 + Math.random() * (1 - i / 26) + (tick % 3) * 0.02; b.push([64100 - i * 12, cb]); }
    for (let i = 1; i <= 20; i++) { ca += 0.3 + Math.random() * (1 - i / 26); a.push([64300 + i * 12, ca]); }
    return { bids: b, asks: a };
  }, [tick]);
  const W = 320, H = 170;
  const all = [...bids, ...asks];
  const maxV = Math.max(...all.map((x) => x[1]));
  const minP = 64100 - 20 * 12, maxP = 64300 + 20 * 12;
  const cx = (64100 + 64300) / 2;
  const span = (maxP - minP) / zoom;
  const X = (p: number) => ((p - (cx - span / 2)) / span) * W;
  const Y = (v: number) => H - 14 - (v / maxV) * (H - 30);
  const step = (pts: [number, number][]) => pts.map(([p, v], i) => `${i ? "L" : "M"}${X(p).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const sel = hover !== null ? all[hover] : null;
  return (
    <Asset code="DJ-02" title="Depth Chart" desc="Кумулятивная глубина стакана: наведи, чтобы увидеть объём до цены; зум раскрывает ближние уровни." hint="Наведи и зумируй" specs={["cumulative", "hover probe", "zoom"]}>
      <div className="panel-inset relative overflow-hidden !rounded-2xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-48 w-full cursor-crosshair" onPointerMove={(e) => { const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; let best = 0, bd = 1e9; all.forEach(([p], i) => { const d = Math.abs(X(p) - px); if (d < bd) { bd = d; best = i; } }); setHover(best); }} onPointerLeave={() => setHover(null)}>
          <path d={`${step(bids)} L${X(bids[bids.length - 1][0])} ${H - 14} L${X(bids[0][0])} ${H - 14}Z`} fill={BULL} opacity=".18" />
          <path d={step(bids)} fill="none" stroke={BULL} strokeWidth="2" />
          <path d={`${step(asks)} L${X(asks[asks.length - 1][0])} ${H - 14} L${X(asks[0][0])} ${H - 14}Z`} fill={BEAR} opacity=".18" />
          <path d={step(asks)} fill="none" stroke={BEAR} strokeWidth="2" />
          <line x1={X(64200)} x2={X(64200)} y1="0" y2={H} stroke="#ffc53d" strokeDasharray="3 3" strokeOpacity=".6" />
          {sel && <g><line x1={X(sel[0])} x2={X(sel[0])} y1="0" y2={H - 14} stroke="#e8eeff" strokeOpacity=".5" /><circle cx={X(sel[0])} cy={Y(sel[1])} r="4" fill="#fff" stroke="#0a1224" strokeWidth="2" /></g>}
        </svg>
        {sel && <div className="num pointer-events-none absolute rounded-lg bg-ink-600 px-2 py-1 text-[10px] font-bold shadow-lg" style={{ left: `calc(${(X(sel[0]) / W) * 100}% - 40px)`, top: 8 }}>@{Math.round(sel[0]).toLocaleString()} · Σ{sel[1].toFixed(1)}</div>}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {[1, 2, 4].map((z) => <button key={z} onClick={() => { setZoom(z); sfx.tick(); }} className={cn("num h-9 flex-1 rounded-xl text-[11px] font-extrabold", zoom === z ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist")}>x{z}</button>)}
        <div className="num ml-2 text-[10px] text-mist">bid Σ{bids[bids.length - 1][1].toFixed(1)} · ask Σ{asks[asks.length - 1][1].toFixed(1)}</div>
      </div>
    </Asset>
  );
}

/* ============ DJ-03 MULTI-TIMEFRAME ============ */
function MultiTF() {
  const tfs = useMemo(() => [
    { n: "1m", d: genSeries(5, 48, { vol: 1.6 }) },
    { n: "5m", d: genSeries(9, 48, { vol: 2.4 }) },
    { n: "15m", d: genSeries(14, 48, { vol: 3.4 }) },
    { n: "1H", d: genSeries(21, 48, { vol: 4.6 }) },
  ], []);
  const [h, setH] = useState<number | null>(null);
  const W = 160, H = 90;
  const scales = useMemo(() => tfs.map((t) => makeScale(t.d, W, H, 6)), [tfs]);
  return (
    <Asset code="DJ-03" title="Multi-timeframe Sync" desc="Четыре таймфрейма одного рынка. Наведи на любой — вертикаль появится на всех четырёх." hint="Веди по графикам" specs={["4 synced", "shared cursor", "trend tags"]}>
      <div className="grid grid-cols-2 gap-2">
        {tfs.map((t, k) => {
          const s = scales[k];
          const ch = ((t.d[t.d.length - 1].c - t.d[0].o) / t.d[0].o) * 100;
          return (
            <div key={t.n} className="panel-inset p-2 !rounded-xl">
              <div className="mb-1 flex justify-between text-[10px] font-extrabold"><span className="text-mist">{t.n}</span><span className={ch >= 0 ? "text-bull" : "text-bear"}>{ch >= 0 ? "+" : ""}{ch.toFixed(1)}%</span></div>
              <svg
                viewBox={`0 0 ${W} ${H}`} className="block w-full cursor-crosshair"
                onPointerMove={(e) => { const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setH(Math.floor(((e.clientX - r.left) / r.width) * t.d.length)); }}
                onPointerLeave={() => setH(null)}
              >
                {t.d.map((d, i) => {
                  const up = d.c >= d.o, col = up ? BULL : BEAR, x = s.x(i);
                  return <g key={i} opacity={h === null || h === i ? 1 : 0.4}><rect x={x - 0.5} y={s.y(d.h)} width="1" height={Math.max(1, s.y(d.l) - s.y(d.h))} fill={col} /><rect x={x - 1.6} y={s.y(Math.max(d.o, d.c))} width="3.2" height={Math.max(1, Math.abs(s.y(d.o) - s.y(d.c)))} fill={col} /></g>;
                })}
                {h !== null && <line x1={s.x(h)} x2={s.x(h)} y1="0" y2={H} stroke="#e8eeff" strokeOpacity=".6" strokeDasharray="2 2" />}
              </svg>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px]">
        <Crosshair size={14} className="text-sky" />
        {h === null ? <span className="text-mist">Синхронный курсор выключен — наведи на график</span> : <span className="num">bar #{h + 1} · 1m <b className="text-bull">{tfs[0].d[h]?.c.toFixed(1)}</b> · 1H <b className="text-gold">{tfs[3].d[h]?.c.toFixed(1)}</b></span>}
      </div>
    </Asset>
  );
}

/* ============ DJ-04 DCA LADDER ============ */
function DcaLadder() {
  const [legs, setLegs] = useState(4);
  const [step, setStep] = useState(4);
  const [mult, setMult] = useState(1.5);
  const [size] = useState(100);
  const entry = 64000;
  const rows = [...Array(legs)].map((_, i) => {
    const px = entry * (1 - (step / 100) * i);
    const sz = size * Math.pow(mult, i);
    return { i, px, sz, cost: px * (sz / px) };
  });
  const totalQuote = rows.reduce((a, r) => a + r.sz, 0);
  const totalBase = rows.reduce((a, r) => a + r.sz / r.px, 0);
  const avg = totalQuote / totalBase;
  const maxDD = ((rows[rows.length - 1].px - entry) / entry) * 100;
  return (
    <Asset code="DJ-04" title="DCA Ladder Builder" desc="Лестница усреднения: число входов, шаг и множитель. Средняя цена и глубина покрытия считаются вживую." hint="Крути параметры" specs={["avg price", "coverage", "exposure"]}>
      <div className="grid grid-cols-3 gap-2">
        {[["Legs", legs, 2, 7, setLegs, ""], ["Step %", step, 1, 10, setStep, "%"], ["Mult", mult, 1, 3, setMult, "x"]].map(([l, v, mn, mx, set, u]) => (
          <div key={l as string} className="rounded-xl bg-ink-800 p-2 text-center">
            <div className="text-[9px] font-bold uppercase text-mist">{l as string}</div>
            <div className="num text-sm font-extrabold">{v as number}{u as string}</div>
            <input type="range" min={mn as number} max={mx as number} step={l === "Mult" ? 0.1 : 1} value={v as number} onChange={(e) => { (set as (n: number) => void)(+e.target.value); sfx.tick(); }} className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-ink-950" style={{ accentColor: "#ffc53d" }} />
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.i} className="flex items-center gap-2">
            <span className="num w-6 text-[10px] text-mist">L{r.i + 1}</span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-ink-900">
              <div className="h-full rounded-lg bg-gradient-to-r from-sky-d to-sky transition-all duration-400" style={{ width: `${(r.sz / rows[rows.length - 1].sz) * 100}%` }} />
              <span className="num absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold"><span>${r.px.toFixed(0)}</span><span>${r.sz.toFixed(0)}</span></span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Avg</div><div className="num text-[13px] font-extrabold text-sky">${avg.toFixed(0)}</div></div>
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Exposure</div><div className="num text-[13px] font-extrabold">${totalQuote.toFixed(0)}</div></div>
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Covers</div><div className="num text-[13px] font-extrabold text-bear">{maxDD.toFixed(1)}%</div></div>
      </div>
    </Asset>
  );
}

/* ============ DJ-05 PAPER TERMINAL ============ */
function Terminal() {
  const data = useMemo(() => genSeries(77, 70, { vol: 1.8, drift: 0.06 }), []);
  const [n, setN] = useState(45);
  const [live, setLive] = useState(true);
  const [side, setSide] = useState<"long" | "short">("long");
  const [qty, setQty] = useState(0.1);
  const [lev, setLev] = useState(5);
  const [pos, setPos] = useState<{ side: "long" | "short"; entry: number; qty: number; lev: number } | null>(null);
  const [log, setLog] = useState<{ p: number; r: number }[]>([]);
  const [equity, setEquity] = useState<number[]>([10000]);
  useEffect(() => {
    if (!live || n >= data.length) return;
    const t = setInterval(() => setN((x) => x + 1), 900);
    return () => clearInterval(t);
  }, [live, n, data.length]);
  const price = data[Math.min(n, data.length) - 1].c * 640;
  const upnl = pos ? (pos.side === "long" ? price - pos.entry : pos.entry - price) * pos.qty * pos.lev : 0;
  const eq = equity[equity.length - 1] + upnl;
  const openPos = () => { if (pos) return; setPos({ side, entry: price, qty, lev }); sfxRaw.pop(); };
  const closePos = () => {
    if (!pos) return;
    const r = upnl;
    setLog((l) => [{ p: price, r }, ...l].slice(0, 6));
    setEquity((e) => [...e, e[e.length - 1] + r]);
    r >= 0 ? sfx.correct() : sfx.wrong();
    setPos(null);
  };
  const s = useMemo(() => makeScale(data, 340, 170, 10), [data]);
  const liq = pos ? (pos.side === "long" ? pos.entry * (1 - 0.9 / pos.lev) : pos.entry * (1 + 0.9 / pos.lev)) : 0;
  return (
    <Asset code="DJ-05" title="Paper Terminal" desc="Мини-терминал: живой график, тикет с плечом, позиция с ликвидацией, журнал и кривая депозита." hint="Открой позицию" specs={["live chart", "liq price", "equity"]} className="md:col-span-2 xl:col-span-2">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[12px] font-extrabold"><Activity size={14} className="text-bull" /> BTC-PERP <span className={cn("num", live && "text-bull")}>● {live ? "LIVE" : "PAUSED"}</span></span>
            <span className="num text-lg font-extrabold text-gold">${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="panel-inset p-2 !rounded-2xl">
            <CandleChart data={data.slice(0, n)} s={s} W={340} H={170} animate={false}>
              {(sc) => (
                <>
                  {pos && <><line x1="0" x2={sc.W} y1={sc.y(pos.entry / 640)} y2={sc.y(pos.entry / 640)} stroke={pos.side === "long" ? BULL : BEAR} strokeDasharray="4 3" /><line x1="0" x2={sc.W} y1={sc.y(liq / 640)} y2={sc.y(liq / 640)} stroke={BEAR} strokeOpacity=".5" /><text x="6" y={sc.y(liq / 640) - 4} fontSize="8" fontWeight="800" fill={BEAR}>LIQ {liq.toFixed(0)}</text></>}
                </>
              )}
            </CandleChart>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => setLive(!live)} className="h-9 rounded-xl bg-ink-800 px-3 text-[11px] font-extrabold text-mist">{live ? "Pause" : "Resume"}</button>
            <div className="flex-1"><Bar value={(n / data.length) * 100} tone="sky" h={8} glow={false} /></div>
            <button onClick={() => { setN(45); setPos(null); }} className="h-9 rounded-xl bg-ink-800 px-3 text-[11px] font-extrabold text-mist">Restart</button>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-ink-900 p-1">
            {(["long", "short"] as const).map((x) => <button key={x} onClick={() => { setSide(x); sfx.tick(); }} className={cn("flex h-9 items-center justify-center gap-1 rounded-lg text-[11px] font-extrabold uppercase", side === x ? (x === "long" ? "bg-bull text-ink-900" : "bg-bear") : "text-mist")}>{x === "long" ? <ArrowUp size={13} /> : <ArrowDown size={13} />}{x}</button>)}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-ink-800 p-2"><div className="text-[9px] font-bold uppercase text-mist">Qty</div><div className="flex items-center gap-1"><button onClick={() => setQty((q) => Math.max(0.01, +(q - 0.01).toFixed(2)))} className="text-mist"><Minus size={13} /></button><span className="num flex-1 text-center text-sm font-extrabold">{qty.toFixed(2)}</span><button onClick={() => setQty((q) => +(q + 0.01).toFixed(2))} className="text-mist"><Plus size={13} /></button></div></div>
            <div className="rounded-xl bg-ink-800 p-2"><div className="text-[9px] font-bold uppercase text-mist">Lev {lev}x</div><input type="range" min={1} max={20} value={lev} onChange={(e) => setLev(+e.target.value)} className="mt-1 h-1.5 w-full" style={{ accentColor: "#ffc53d" }} /></div>
          </div>
          <div className="mt-2 rounded-xl bg-ink-900 p-2.5">
            <div className="flex justify-between text-[11px]"><span className="text-mist">Equity</span><AnimatedNumber value={eq} decimals={0} prefix="$" className="num font-extrabold" /></div>
            <div className="flex justify-between text-[11px]"><span className="text-mist">uPnL</span><span className={cn("num font-extrabold", upnl >= 0 ? "text-bull" : "text-bear")}>{upnl >= 0 ? "+" : ""}{upnl.toFixed(2)}</span></div>
            <div className="mt-1"><SpringBar value={50 + (upnl / 200) * 50} color={upnl >= 0 ? BULL : BEAR} h={8} /></div>
          </div>
          {pos ? <Btn tone="bear" block size="sm" className="mt-2" onClick={closePos} silent>Close {pos.side} {upnl >= 0 ? "+" : ""}{upnl.toFixed(0)}</Btn> : <Btn tone={side === "long" ? "bull" : "bear"} block size="sm" className="mt-2" onClick={openPos}>Open {side}</Btn>}
          <div className="mt-2 space-y-1">
            {log.map((t, i) => <div key={i} className="num anim-slide-right flex justify-between rounded-lg bg-ink-900 px-2 py-1 text-[10px]"><span className="text-mist">closed @{t.p.toFixed(0)}</span><span className={t.r >= 0 ? "text-bull" : "text-bear"}>{t.r >= 0 ? "+" : ""}{t.r.toFixed(2)}</span></div>)}
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ============ DJ-06 SENTIMENT CLUSTER ============ */
function useLive(base: number, vol: number, ms: number) {
  const [v, setV] = useState(base);
  useEffect(() => { const t = setInterval(() => setV((x) => x + (Math.random() - 0.5) * vol), ms); return () => clearInterval(t); }, [vol, ms]);
  return v;
}
function Sentiment() {
  const fund = useLive(0.012, 0.004, 1200);
  const oi = useLive(4.2, 0.8, 1500);
  const ls = useLive(52, 3, 1300);
  const [tf, setTf] = useState("15m");
  const gauge = (v: number, min: number, max: number, c: string, label: string, fmt: string) => {
    const p = ((v - min) / (max - min)) * 100;
    return (
      <div className="rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#08112a]">
        <div className="text-[9px] font-extrabold uppercase tracking-widest text-mist">{label}</div>
        <div className="num mt-0.5 text-xl font-extrabold" style={{ color: c }}>{fmt}</div>
        <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-ink-950">
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
          <div className="absolute inset-y-0 rounded-full transition-all duration-700" style={{ left: `${Math.min(50, p / 2)}%`, width: `${Math.abs(p / 2 - 50)}%`, background: c }} />
        </div>
      </div>
    );
  };
  return (
    <Asset code="DJ-06" title="Sentiment Cluster" desc="Фандинг, открытый интерес и соотношение long/short — всё тикает вживую. Переключай таймфрейм." hint="Смотри пульс рынка" specs={["live ticks", "diverging bars", "3 TF"]}>
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[12px] font-extrabold"><Wallet size={14} className="text-gold" /> Derivatives pulse</span>
        <div className="flex gap-1">{["5m", "15m", "1H"].map((t) => <button key={t} onClick={() => { setTf(t); sfx.tick(); }} className={cn("num h-7 rounded-lg px-2 text-[10px] font-bold", tf === t ? "bg-gold text-ink-900" : "bg-ink-800 text-mist")}>{t}</button>)}</div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {gauge(fund, -0.05, 0.05, fund >= 0 ? BULL : BEAR, "Funding rate", `${(fund * 100).toFixed(3)}%`)}
        {gauge(oi, -8, 8, "#3b82ff", "Open interest Δ", `${oi >= 0 ? "+" : ""}${oi.toFixed(1)}%`)}
        {gauge(ls, 20, 80, ls >= 50 ? BULL : BEAR, "Long / Short", `${ls.toFixed(0)} / ${(100 - ls).toFixed(0)}`)}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-ink-900/60 p-2.5 text-[11px]">
        <Layers size={14} className="text-violet" />
        <span className="text-mist">{fund > 0.02 ? "Перегрев лонгов — осторожнее с покупками" : fund < -0.01 ? "Шорты платят — возможен шорт-сквиз вверх" : "Фандинг нейтральный — рынок сбалансирован"}</span>
      </div>
    </Asset>
  );
}

export default function Dojo() {
  return (
    <Section id="dojo" index="DJ" title="Trading Dojo · Pro Tools" subtitle="Лестница, глубина, мультитаймфрейм, DCA, бумажный терминал, сентимент">
      <Terminal />
      <Ladder />
      <Depth />
      <MultiTF />
      <DcaLadder />
      <Sentiment />
    </Section>
  );
}
