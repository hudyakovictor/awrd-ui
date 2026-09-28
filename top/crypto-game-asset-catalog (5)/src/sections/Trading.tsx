import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Badge, Btn3D, CountUp, Label, Section, Segmented, Toggle, useToast } from "../components/ui";
import { Icon } from "../components/Icons";
import { Slider3D } from "./Controls";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

/* ---------- live data hooks ---------- */
function useWalk(start: number, vol: number, ms = 1200) {
  const [s, setS] = useState(() => {
    let p = start; const arr: number[] = [];
    for (let i = 0; i < 30; i++) { p *= 1 + (Math.random() - 0.5) * vol; arr.push(p); }
    return arr;
  });
  useEffect(() => {
    const h = setInterval(() => setS((a) => [...a.slice(1), a[a.length - 1] * (1 + (Math.random() - 0.49) * vol)]), ms + Math.random() * 400);
    return () => clearInterval(h);
  }, [vol, ms]);
  return s;
}
function Spark({ data, up, w = 80, h = 28 }: { data: number[]; up: boolean; w?: number; h?: number }) {
  const mx = Math.max(...data), mn = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - mn) / (mx - mn || 1)) * (h - 4)}`).join(" ");
  const col = up ? "#1fdb8b" : "#ff4d6a";
  const id = useMemo(() => "sp" + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".35" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Ticker ---------- */
const COINS = [
  { s: "BTC", n: "Bitcoin", p: 67420, v: 0.004, c: "#f7931a" }, { s: "ETH", n: "Ethereum", p: 3512, v: 0.006, c: "#8c8cff" },
  { s: "SOL", n: "Solana", p: 172.4, v: 0.01, c: "#14f195" }, { s: "DOGE", n: "Dogecoin", p: 0.1612, v: 0.014, c: "#c2a633" },
];
function TickerRow({ coin, fav, onFav }: { coin: (typeof COINS)[0]; fav: boolean; onFav: () => void }) {
  const d = useWalk(coin.p, coin.v);
  const last = d[d.length - 1], prev = d[d.length - 2], first = d[0];
  const ch = ((last - first) / first) * 100;
  const up = last >= prev;
  const dec = coin.p < 1 ? 4 : coin.p < 1000 ? 2 : 0;
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/[.03] transition group">
      <button onClick={onFav} className={cn("transition", fav ? "text-gold" : "text-dim/50 group-hover:text-dim")}><Icon name="star" size={15} className={fav ? "fill-current anim-pop" : ""} /></button>
      <div className="size-9 rounded-full grid place-items-center font-extrabold text-[11px] shadow-[inset_0_2px_0_rgba(255,255,255,.25),0_3px_0_rgba(0,0,0,.35)]" style={{ background: coin.c, color: "#0b1330" }}>{coin.s[0]}</div>
      <div className="min-w-0 w-20"><div className="font-extrabold text-[13px]">{coin.s}</div><div className="text-[10.5px] text-dim truncate">{coin.n}</div></div>
      <div className="flex-1 flex justify-center"><Spark data={d} up={ch >= 0} /></div>
      <div className="text-right">
        <div key={last} className="num text-[13px] font-bold px-1 rounded" style={{ animation: `${up ? "flash-up" : "flash-down"} .9s ease-out` }}>${last.toLocaleString("en", { minimumFractionDigits: dec, maximumFractionDigits: dec })}</div>
        <div className={cn("num text-[11px] font-extrabold flex items-center justify-end gap-0.5", ch >= 0 ? "text-bull" : "text-bear")}><Icon name={ch >= 0 ? "arrowUp" : "arrowDown"} size={10} stroke={3.2} />{Math.abs(ch).toFixed(2)}%</div>
      </div>
    </div>
  );
}
function Ticker() {
  const [fav, setFav] = useState<string[]>(["BTC"]);
  const [tab, setTab] = useState("all");
  const list = tab === "fav" ? COINS.filter((c) => fav.includes(c.s)) : COINS;
  return (
    <Asset title="Live Market Ticker" id="trd.ticker" desc="Цены обновляются в реальном времени: вспышка при тике, спарклайн, избранное.">
      <div className="flex items-center justify-between mb-3"><Badge tone="bull" dot>Live</Badge><Segmented className="w-44" size="sm" value={tab} onChange={setTab} options={[{ value: "all", label: "All" }, { value: "fav", label: "★ Fav" }]} /></div>
      <div className="inset p-1.5 min-h-[120px]">
        {list.map((c) => <TickerRow key={c.s} coin={c} fav={fav.includes(c.s)} onFav={() => { setFav(fav.includes(c.s) ? fav.filter((x) => x !== c.s) : [...fav, c.s]); sfx.pop(); }} />)}
        {!list.length && <div className="text-center text-dim text-[12px] py-8">Нет избранных монет</div>}
      </div>
    </Asset>
  );
}

/* ---------- Candle chart ---------- */
type C = { o: number; h: number; l: number; c: number; v: number };
function gen(n: number, base: number, vol: number): C[] {
  let p = base; const out: C[] = [];
  for (let i = 0; i < n; i++) {
    const o = p, c = o * (1 + (Math.random() - 0.48) * vol);
    out.push({ o, c, h: Math.max(o, c) * (1 + Math.random() * vol * 0.5), l: Math.min(o, c) * (1 - Math.random() * vol * 0.5), v: 20 + Math.random() * 80 });
    p = c;
  }
  return out;
}
function CandleChart() {
  const [tf, setTf] = useState("1H");
  const volMap: Record<string, number> = { "1m": 0.002, "15m": 0.005, "1H": 0.01, "1D": 0.03 };
  const [data, setData] = useState(() => gen(40, 67000, 0.01));
  const [hov, setHov] = useState<number | null>(null);
  const [type, setType] = useState("candle");
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => { setData(gen(40, 67000, volMap[tf])); sfx.whoosh(); }, [tf]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const h = setInterval(() => setData((d) => {
      const a = [...d]; const L = { ...a[a.length - 1] };
      L.c = L.c * (1 + (Math.random() - 0.49) * volMap[tf] * 0.3); L.h = Math.max(L.h, L.c); L.l = Math.min(L.l, L.c); L.v += Math.random() * 4;
      a[a.length - 1] = L;
      if (Math.random() < 0.12) a.push({ o: L.c, c: L.c, h: L.c, l: L.c, v: 5 }), a.shift();
      return a;
    }), 700);
    return () => clearInterval(h);
  }, [tf]); // eslint-disable-line react-hooks/exhaustive-deps
  const W = 640, H = 260, VH = 50;
  const mx = Math.max(...data.map((d) => d.h)), mn = Math.min(...data.map((d) => d.l));
  const cw = W / data.length;
  const y = (v: number) => 10 + ((mx - v) / (mx - mn)) * (H - VH - 20);
  const last = data[data.length - 1];
  const first = data[0];
  const ch = ((last.c - first.o) / first.o) * 100;
  const hd = hov !== null ? data[hov] : last;
  const vmx = Math.max(...data.map((d) => d.v));
  const line = data.map((d, i) => `${i * cw + cw / 2},${y(d.c)}`).join(" ");
  return (
    <Asset title="Candlestick Chart · Live" id="trd.chart" desc="Живая последняя свеча, перекрестие с OHLC-тултипом, объём, смена таймфрейма и типа графика." className="lg:col-span-2" tags={["PRO"]}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2"><span className="size-7 rounded-full bg-[#f7931a] grid place-items-center text-ink-900"><Icon name="bitcoin" size={15} stroke={2.8} /></span><span className="font-extrabold">BTC / USDT</span><Badge tone={ch >= 0 ? "bull" : "bear"} size="xs">{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</Badge></div>
          <CountUp value={last.c} decimals={2} prefix="$" className={cn("text-[28px] font-extrabold block mt-1", last.c >= last.o ? "text-bull" : "text-bear")} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Segmented className="w-48" size="sm" value={tf} onChange={setTf} options={["1m", "15m", "1H", "1D"].map((v) => ({ value: v, label: v }))} />
          <Segmented className="w-28" size="sm" value={type} onChange={setType} options={[{ value: "candle", label: <Icon name="candles" size={15} /> }, { value: "line", label: <Icon name="chart" size={15} /> }]} />
        </div>
      </div>
      <div className="inset p-2 relative">
        <div className="absolute top-3 left-4 z-10 flex gap-3 num text-[10.5px] font-bold text-mute pointer-events-none">
          {(["o", "h", "l", "c"] as const).map((k) => <span key={k}>{k.toUpperCase()} <span className={hd.c >= hd.o ? "text-bull" : "text-bear"}>{hd[k].toFixed(0)}</span></span>)}
        </div>
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-[260px] cursor-crosshair" preserveAspectRatio="none"
          onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setHov(Math.max(0, Math.min(data.length - 1, Math.floor(((e.clientX - r.left) / r.width) * data.length)))); }}
          onMouseLeave={() => setHov(null)}>
          <defs><linearGradient id="lf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3d7bff" stopOpacity=".35" /><stop offset="1" stopColor="#3d7bff" stopOpacity="0" /></linearGradient></defs>
          {[0.2, 0.4, 0.6].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(140,170,255,.06)" />)}
          {data.map((d, i) => <rect key={"v" + i} x={i * cw + 2} y={H - (d.v / vmx) * VH} width={cw - 4} height={(d.v / vmx) * VH} fill={d.c >= d.o ? "rgba(31,219,139,.22)" : "rgba(255,77,106,.22)"} rx="1" />)}
          {type === "candle" ? data.map((d, i) => {
            const col = d.c >= d.o ? "#1fdb8b" : "#ff4d6a";
            return (
              <g key={i} opacity={hov === null || hov === i ? 1 : 0.55}>
                <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.4" />
                <rect x={i * cw + 2.5} y={y(Math.max(d.o, d.c))} width={cw - 5} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="1.5" />
              </g>
            );
          }) : <><polygon points={`0,${H - VH} ${line} ${W},${H - VH}`} fill="url(#lf)" /><polyline points={line} fill="none" stroke="#6a9dff" strokeWidth="2.2" strokeLinejoin="round" /></>}
          <line x1="0" x2={W} y1={y(last.c)} y2={y(last.c)} stroke={last.c >= last.o ? "#1fdb8b" : "#ff4d6a"} strokeDasharray="3 4" strokeWidth="1" />
          {hov !== null && <>
            <line x1={hov * cw + cw / 2} x2={hov * cw + cw / 2} y1="0" y2={H} stroke="rgba(200,215,255,.35)" strokeDasharray="3 3" />
            <circle cx={hov * cw + cw / 2} cy={y(data[hov].c)} r="4" fill="#fff" stroke="#3d7bff" strokeWidth="2" />
          </>}
        </svg>
        <div className="absolute right-2 px-1.5 py-0.5 rounded-md num text-[10px] font-extrabold text-ink-900 transition-all" style={{ top: `calc(${(y(last.c) / H) * 100}% - 2px)`, background: last.c >= last.o ? "#1fdb8b" : "#ff4d6a" }}>{last.c.toFixed(0)}</div>
      </div>
    </Asset>
  );
}

/* ---------- Order ticket ---------- */
function OrderTicket() {
  const toast = useToast();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [type, setType] = useState("market");
  const [pct, setPct] = useState(25);
  const [lev, setLev] = useState(5);
  const [tp, setTp] = useState(true);
  const [limit, setLimit] = useState("66800");
  const [loading, setLoading] = useState(false);
  const bal = 10000, size = (bal * pct) / 100;
  const submit = () => { setLoading(true); setTimeout(() => { setLoading(false); sfx.success(); toast({ type: side === "buy" ? "success" : "error", title: `${side === "buy" ? "Покупка" : "Продажа"} исполнена`, msg: `${(size * lev / 67420).toFixed(4)} BTC · ${type === "market" ? "Market" : `Limit ${limit}`} · x${lev}` }); }, 1100); };
  return (
    <Asset title="Order Ticket" id="trd.ticket" desc="Buy/Sell, Market/Limit, размер, плечо, TP/SL — единый тикет с живым расчётом." className="lg:row-span-2">
      <div className="grid grid-cols-2 gap-2 inset p-1.5 !rounded-2xl mb-4">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} onClick={() => { setSide(s); sfx.tick(); }} className={cn("h-11 rounded-xl font-extrabold uppercase text-[13px] tracking-wider transition-all", side === s ? (s === "buy" ? "bg-gradient-to-b from-[#5af5b4] to-[#1fdb8b] text-[#03261a] shadow-[0_4px_0_#0d9a5c] -translate-y-0.5" : "bg-gradient-to-b from-[#ff7c93] to-[#ff4d6a] text-white shadow-[0_4px_0_#c0253f] -translate-y-0.5") : "text-mute hover:text-txt")}>{s === "buy" ? "Buy / Long" : "Sell / Short"}</button>
        ))}
      </div>
      <Segmented value={type} onChange={setType} size="sm" options={[{ value: "market", label: "Market" }, { value: "limit", label: "Limit" }, { value: "stop", label: "Stop" }]} />
      {type !== "market" && (
        <div className="mt-3 anim-fade flex items-center gap-2 h-12 px-4 rounded-2xl bg-[#0a1330] border-2 border-[#22366f] focus-within:border-blue transition">
          <span className="text-[11px] font-extrabold text-dim uppercase">Цена</span>
          <input value={limit} onChange={(e) => setLimit(e.target.value.replace(/[^\d.]/g, ""))} className="flex-1 bg-transparent outline-none text-right num font-bold" />
          <span className="text-[11px] text-dim font-bold">USDT</span>
        </div>
      )}
      <div className="flex justify-between mt-4 text-[11px] font-bold"><span className="text-dim">Размер</span><span className="num">{size.toLocaleString()} USDT</span></div>
      <Slider3D value={pct} onChange={setPct} marks={[0, 25, 50, 75, 100]} format={(v) => `${v}%`} color={side === "buy" ? "linear-gradient(90deg,#12c47a,#5af5b4)" : "linear-gradient(90deg,#e3304f,#ff7c93)"} />
      <div className="flex justify-between mt-2 text-[11px] font-bold"><span className="text-dim">Плечо</span><span className="num text-gold">{lev}x</span></div>
      <div className="grid grid-cols-5 gap-1.5 mt-2">
        {[1, 3, 5, 10, 20].map((l) => <button key={l} onClick={() => { setLev(l); sfx.tick(); }} className="opt h-9 text-[12px] font-extrabold num" data-state={lev === l ? "selected" : undefined}>{l}x</button>)}
      </div>
      <div className="inset p-3 mt-4 space-y-2.5">
        <div className="flex items-center justify-between text-[12.5px] font-bold"><span>Take-Profit / Stop-Loss</span><Toggle size="sm" on={tp} onChange={setTp} /></div>
        {tp && <div className="grid grid-cols-2 gap-2 anim-fade">
          <div className="rounded-xl bg-bull/10 border border-bull/30 px-3 py-2"><div className="text-[9.5px] font-extrabold text-bull uppercase">TP +8%</div><div className="num text-[13px] font-bold">{(67420 * (side === "buy" ? 1.08 : 0.92)).toFixed(0)}</div></div>
          <div className="rounded-xl bg-bear/10 border border-bear/30 px-3 py-2"><div className="text-[9.5px] font-extrabold text-bear uppercase">SL −3%</div><div className="num text-[13px] font-bold">{(67420 * (side === "buy" ? 0.97 : 1.03)).toFixed(0)}</div></div>
        </div>}
      </div>
      <div className="space-y-1.5 my-4 text-[11.5px] font-semibold">
        {[["Объём позиции", `${(size * lev).toLocaleString()} USDT`], ["Маржа", `${size.toLocaleString()} USDT`], ["Комиссия", `${(size * lev * 0.0006).toFixed(2)} USDT`]].map(([k, v]) => <div key={k} className="flex justify-between"><span className="text-dim">{k}</span><span className="num">{v}</span></div>)}
      </div>
      <Btn3D full size="lg" variant={side === "buy" ? "bull" : "bear"} loading={loading} disabled={pct === 0} onClick={submit}>{loading ? "Отправка…" : side === "buy" ? "Buy BTC" : "Sell BTC"}</Btn3D>
    </Asset>
  );
}

/* ---------- Position card ---------- */
function Position() {
  const d = useWalk(67420, 0.003, 900);
  const [closed, setClosed] = useState(false);
  const entry = 66100, sl = 64200, tp = 71000, qty = 0.15;
  const p = d[d.length - 1];
  const pnl = (p - entry) * qty;
  const roe = ((p - entry) / entry) * 100 * 5;
  const pos = Math.max(0, Math.min(100, ((p - sl) / (tp - sl)) * 100));
  const ePos = ((entry - sl) / (tp - sl)) * 100;
  return (
    <Asset title="Open Position" id="trd.position" desc="Живой PnL, шкала между SL и TP, быстрое закрытие.">
      {closed ? (
        <div className="text-center py-8 anim-scale">
          <div className="size-14 mx-auto rounded-full bg-bull/15 border-2 border-bull grid place-items-center text-bull mb-3"><Icon name="check" size={26} stroke={3} /></div>
          <div className="font-extrabold">Позиция закрыта</div>
          <div className={cn("num font-extrabold mt-1", pnl >= 0 ? "text-bull" : "text-bear")}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)} USDT</div>
          <Btn3D size="sm" variant="neutral" className="mt-4" onClick={() => setClosed(false)}>Reopen demo</Btn3D>
        </div>
      ) : <>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><span className="font-extrabold">BTCUSDT</span><Badge tone="bull" size="xs">Long 5x</Badge></div>
          <span className="text-[11px] text-dim font-bold num">{qty} BTC</span>
        </div>
        <div className={cn("rounded-2xl p-4 border-2 transition-colors duration-500", pnl >= 0 ? "bg-bull/[.08] border-bull/30" : "bg-bear/[.08] border-bear/30")}>
          <div className="label-caps !mb-1">Нереализованный PnL</div>
          <div className="flex items-baseline gap-2">
            <CountUp value={pnl} decimals={2} prefix={pnl >= 0 ? "+" : ""} className={cn("text-[26px] font-extrabold", pnl >= 0 ? "text-bull" : "text-bear")} />
            <span className={cn("num text-[13px] font-extrabold", roe >= 0 ? "text-bull" : "text-bear")}>{roe >= 0 ? "+" : ""}{roe.toFixed(2)}%</span>
          </div>
        </div>
        <div className="mt-5 relative">
          <div className="h-3 rounded-full bg-gradient-to-r from-bear/70 via-[#27408a] to-bull/70" />
          <div className="absolute top-0 h-3 w-0.5 bg-white/60" style={{ left: `${ePos}%` }} />
          <div className="absolute -top-1.5 size-6 -ml-3 rounded-full bg-white shadow-[0_3px_0_#7d8fc4] border-4 border-blue transition-all duration-700" style={{ left: `${pos}%` }} />
          <div className="flex justify-between mt-2 num text-[10px] font-bold"><span className="text-bear">SL {sl}</span><span className="text-mute">Entry {entry}</span><span className="text-bull">TP {tp}</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-5">
          <Btn3D size="sm" variant="neutral">Edit TP/SL</Btn3D>
          <Btn3D size="sm" variant="bear" onClick={() => { setClosed(true); sfx.success(); }}>Close</Btn3D>
        </div>
      </>}
    </Asset>
  );
}

/* ---------- Order book ---------- */
function OrderBook() {
  const mk = () => Array.from({ length: 6 }).map(() => Math.random() * 3 + 0.1);
  const [asks, setAsks] = useState(mk);
  const [bids, setBids] = useState(mk);
  const [mid, setMid] = useState(67420);
  useEffect(() => { const h = setInterval(() => { setAsks(mk()); setBids(mk()); setMid((m) => m + (Math.random() - 0.5) * 20); }, 1100); return () => clearInterval(h); }, []);
  const mx = Math.max(...asks, ...bids);
  const bidSum = bids.reduce((a, b) => a + b, 0), askSum = asks.reduce((a, b) => a + b, 0);
  const row = (q: number, i: number, side: "a" | "b") => (
    <div key={side + i} className="relative flex justify-between px-2 py-[3px] num text-[11.5px] font-semibold">
      <div className={cn("absolute inset-y-0 right-0 rounded-sm transition-all duration-700", side === "a" ? "bg-bear/15" : "bg-bull/15")} style={{ width: `${(q / mx) * 100}%` }} />
      <span className={cn("relative", side === "a" ? "text-bear" : "text-bull")}>{(mid + (side === "a" ? (6 - i) * 2.5 : -(i + 1) * 2.5)).toFixed(1)}</span>
      <span className="relative text-mute">{q.toFixed(3)}</span>
    </div>
  );
  return (
    <Asset title="Order Book · Depth" id="trd.book" desc="Глубина обновляется, баланс покупателей/продавцов.">
      <div className="inset p-2">
        <div className="flex justify-between px-2 label-caps !mb-1"><span>Price</span><span>Size</span></div>
        {asks.map((q, i) => row(q, i, "a"))}
        <div className="my-1.5 py-2 px-2 rounded-lg bg-white/[.03] flex items-center justify-between"><CountUp value={mid} decimals={1} className="font-extrabold text-[15px]" /><span className="text-[10px] text-dim font-bold">Spread 0.01%</span></div>
        {bids.map((q, i) => row(q, i, "b"))}
      </div>
      <div className="flex h-2.5 rounded-full overflow-hidden mt-3 shadow-inner">
        <div className="bg-bull transition-all duration-700" style={{ width: `${(bidSum / (bidSum + askSum)) * 100}%` }} />
        <div className="bg-bear flex-1" />
      </div>
      <div className="flex justify-between num text-[10.5px] font-extrabold mt-1.5"><span className="text-bull">B {Math.round((bidSum / (bidSum + askSum)) * 100)}%</span><span className="text-bear">{Math.round((askSum / (bidSum + askSum)) * 100)}% S</span></div>
    </Asset>
  );
}

/* ---------- Portfolio donut ---------- */
function Portfolio() {
  const seg = [{ n: "BTC", v: 48, c: "#f7931a" }, { n: "ETH", v: 26, c: "#8c8cff" }, { n: "SOL", v: 14, c: "#14f195" }, { n: "USDT", v: 12, c: "#2ed3f0" }];
  const [h, setH] = useState<number | null>(null);
  const R = 58, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <Asset title="Portfolio Allocation" id="trd.portfolio" desc="Интерактивный donut: наведение выделяет сегмент.">
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
            <circle cx="75" cy="75" r={R} fill="none" stroke="#0a1330" strokeWidth="22" />
            {seg.map((s, i) => {
              const len = (s.v / 100) * C, off = acc; acc += len;
              return <circle key={s.n} cx="75" cy="75" r={R} fill="none" stroke={s.c} strokeWidth={h === i ? 28 : 20} strokeDasharray={`${len - 3} ${C}`} strokeDashoffset={-off} className="transition-all duration-300 cursor-pointer" style={{ opacity: h === null || h === i ? 1 : 0.35, strokeDasharray: `${len - 3} ${C}`, animation: `fade-in .6s ${i * 0.1}s both` }} onMouseEnter={() => { setH(i); sfx.tick(); }} onMouseLeave={() => setH(null)} />;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center pointer-events-none">
            <div><div className="label-caps !mb-0">{h !== null ? seg[h].n : "Total"}</div><div className="num font-extrabold text-[18px]">{h !== null ? `${seg[h].v}%` : "$24.8k"}</div></div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {seg.map((s, i) => (
            <button key={s.n} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className={cn("w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-bold transition", h === i && "bg-white/5")}>
              <span className="size-3 rounded" style={{ background: s.c }} />{s.n}<span className="ml-auto num text-mute">{s.v}%</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Fear & Greed ---------- */
function FearGreed() {
  const [v, setV] = useState(68);
  const lab = v < 25 ? ["Extreme Fear", "#ff4d6a"] : v < 45 ? ["Fear", "#ff8a3d"] : v < 55 ? ["Neutral", "#ffc53d"] : v < 75 ? ["Greed", "#8be05a"] : ["Extreme Greed", "#1fdb8b"];
  const ang = -90 + (v / 100) * 180;
  return (
    <Asset title="Fear & Greed Gauge" id="trd.gauge" desc="Индикатор настроения рынка. Клик — новое значение.">
      <button onClick={() => { setV(Math.floor(Math.random() * 100)); sfx.whoosh(); }} className="w-full flex flex-col items-center">
        <svg viewBox="0 0 200 115" className="w-full max-w-[240px]">
          <defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stopColor="#ff4d6a" /><stop offset=".3" stopColor="#ff8a3d" /><stop offset=".5" stopColor="#ffc53d" /><stop offset=".75" stopColor="#8be05a" /><stop offset="1" stopColor="#1fdb8b" /></linearGradient></defs>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#0a1330" strokeWidth="22" strokeLinecap="round" />
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#fg)" strokeWidth="16" strokeLinecap="round" />
          {Array.from({ length: 11 }).map((_, i) => { const a = Math.PI - (i / 10) * Math.PI; return <line key={i} x1={100 + Math.cos(a) * 62} y1={100 - Math.sin(a) * 62} x2={100 + Math.cos(a) * 56} y2={100 - Math.sin(a) * 56} stroke="#5b6a98" strokeWidth="2" strokeLinecap="round" />; })}
          <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: "100px 100px", transition: "transform 1s cubic-bezier(.3,1.5,.5,1)" }}>
            <path d="M97 100 L100 36 L103 100 Z" fill="#eaf0ff" />
          </g>
          <circle cx="100" cy="100" r="10" fill="#1d3169" stroke="#eaf0ff" strokeWidth="3" />
        </svg>
        <CountUp value={v} className="text-[34px] font-extrabold -mt-2" />
        <span className="font-extrabold text-[13px] uppercase tracking-wider transition-colors" style={{ color: lab[1] }}>{lab[0]}</span>
      </button>
      <Label className="mt-4 text-center">7-дневная история</Label>
      <div className="flex items-end gap-1.5 h-10">{[42, 55, 61, 58, 70, 66, v].map((x, i) => <div key={i} className="flex-1 rounded-t-md transition-all duration-700" style={{ height: `${x}%`, background: x < 45 ? "#ff8a3d" : x < 55 ? "#ffc53d" : "#1fdb8b", opacity: i === 6 ? 1 : 0.5 }} />)}</div>
    </Asset>
  );
}

export default function Trading() {
  return (
    <Section id="trading" index="06" title="Trading Widgets" subtitle="Живые рыночные компоненты для симулятора и практики без риска" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <CandleChart />
        <OrderTicket />
        <Ticker />
        <Position />
        <OrderBook />
        <Portfolio />
        <FearGreed />
      </div>
    </Section>
  );
}
