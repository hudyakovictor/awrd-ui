import { useMemo, useState } from "react";
import { Asset, Btn, Coin, COINS, Label, Section, useAnimatedNumber, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

const BASE: Record<string, number> = { BTC: 67421.5, ETH: 3512.4, SOL: 172.35, BNB: 598.2, XRP: 0.5234, DOGE: 0.1621, ADA: 0.4512, TON: 7.12 };
const fmt = (v: number) => (v >= 100 ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : v >= 1 ? v.toFixed(3) : v.toFixed(4));

function useLive(ms = 1100) {
  const [p, setP] = useState(() => Object.fromEntries(Object.entries(BASE).map(([k, v]) => [k, { v, d: 0, ch: (Math.random() - 0.4) * 8, hist: Array.from({ length: 24 }, (_, i) => v * (1 + Math.sin(i / 3 + v) * 0.01 + (Math.random() - 0.5) * 0.01)) }])) as Record<string, { v: number; d: number; ch: number; hist: number[] }>);
  useInterval(() => {
    setP((old) => {
      const n = { ...old };
      for (const k of Object.keys(n)) {
        if (Math.random() < 0.55) {
          const o = n[k]; const dv = o.v * (Math.random() - 0.49) * 0.002;
          n[k] = { v: o.v + dv, d: Math.sign(dv), ch: o.ch + (dv / o.v) * 100, hist: [...o.hist.slice(1), o.v + dv] };
        } else n[k] = { ...n[k], d: 0 };
      }
      return n;
    });
  }, ms);
  return p;
}

function Spark({ data, up, w = 80, h = 28 }: { data: number[]; up: boolean; w?: number; h?: number }) {
  const mn = Math.min(...data), mx = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - mn) / (mx - mn || 1)) * (h - 4)}`).join(" ");
  const c = up ? "#22d38a" : "#ff4b6e";
  const id = `sg${up ? "u" : "d"}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".35" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* TRD-01 */
function Ticker() {
  const p = useLive(900);
  const list = Object.keys(BASE);
  return (
    <Asset code="TRD-01" title="Live Ticker Tape" desc="Infinite marquee with per-tick green/red flashes. Hover to pause." tags={["marquee", "live"]} span={3}>
      <div className="well overflow-hidden group">
        <div className="flex w-max group-hover:[animation-play-state:paused]" style={{ animation: "marquee 30s linear infinite" }}>
          {[...list, ...list].map((k, i) => {
            const x = p[k];
            return (
              <div key={i} className="flex items-center gap-2.5 px-5 py-3 border-r border-white/5" style={{ animation: x.d ? `${x.d > 0 ? "flashG" : "flashR"} .8s ease-out` : undefined }} >
                <Coin sym={k} size={26} />
                <span className="font-extrabold text-sm">{k}</span>
                <span className="num text-sm text-fog">${fmt(x.v)}</span>
                <span className={cn("num text-xs font-bold flex items-center", x.ch >= 0 ? "text-bull" : "text-bear")}><Icon name={x.ch >= 0 ? "chevU" : "chevD"} size={14} stroke={3} />{Math.abs(x.ch).toFixed(2)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

/* TRD-02 */
type C = { o: number; h: number; l: number; c: number; v: number };
function seedCandles(n: number, p = 67000) {
  const a: C[] = [];
  for (let i = 0; i < n; i++) { const o = p; const c = o + (Math.random() - 0.48) * 260; a.push({ o, c, h: Math.max(o, c) + Math.random() * 120, l: Math.min(o, c) - Math.random() * 120, v: 20 + Math.random() * 80 }); p = c; }
  return a;
}
function CandleChart() {
  const [tf, setTf] = useState("15m");
  const [data, setData] = useState(() => seedCandles(42));
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [ma, setMa] = useState(true);
  useInterval(() => {
    setTick((t) => t + 1);
    setData((d) => {
      const last = d[d.length - 1];
      if ((tick + 1) % 8 === 0) { const o = last.c; return [...d.slice(1), { o, c: o, h: o, l: o, v: 10 }]; }
      const c = last.c + (Math.random() - 0.48) * 90;
      return [...d.slice(0, -1), { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c), v: last.v + Math.random() * 6 }];
    });
  }, 650);
  const W = 640, H = 260, VH = 44;
  const hi = Math.max(...data.map((d) => d.h)), lo = Math.min(...data.map((d) => d.l));
  const y = (v: number) => 10 + ((hi - v) / (hi - lo)) * (H - VH - 24);
  const cw = W / data.length;
  const maxV = Math.max(...data.map((d) => d.v));
  const maPts = data.map((_, i) => { const s = data.slice(Math.max(0, i - 6), i + 1); const m = s.reduce((a, b) => a + b.c, 0) / s.length; return `${i * cw + cw / 2},${y(m)}`; }).join(" ");
  const last = data[data.length - 1];
  const h = hover !== null ? data[hover] : last;
  const up = last.c >= data[0].o;
  return (
    <Asset code="TRD-02" title="Candlestick Chart" desc="Streaming OHLC with volume, MA(7), last-price tag and crosshair inspector. Candle closes every ~5s." tags={["realtime", "crosshair"]} span={2}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <Coin sym="BTC" size={36} />
        <div>
          <div className="text-xs text-mist font-bold">BTC / USDT</div>
          <div className={cn("num text-2xl font-black transition-colors", up ? "text-bull" : "text-bear")}>{fmt(last.c)}</div>
        </div>
        <div className="num text-[11px] grid grid-cols-4 gap-x-3 text-mist ml-2">
          {(["o", "h", "l", "c"] as const).map((k) => <span key={k}>{k.toUpperCase()} <b className={cn(h.c >= h.o ? "text-bull" : "text-bear")}>{h[k].toFixed(0)}</b></span>)}
        </div>
        <div className="ml-auto flex gap-1 well p-1">
          {["1m", "15m", "1H", "1D"].map((t) => <button key={t} onClick={() => { setTf(t); setData(seedCandles(42, last.c)); }} className={cn("num text-[11px] font-bold px-2.5 py-1 rounded-lg", tf === t ? "bg-sky text-white shadow-[0_2px_0_#1a56a8]" : "text-mist hover:text-fog")}>{t}</button>)}
          <button onClick={() => setMa(!ma)} className={cn("num text-[11px] font-bold px-2.5 py-1 rounded-lg", ma ? "bg-gold text-ink-900 shadow-[0_2px_0_#b07600]" : "text-mist")}>MA</button>
        </div>
      </div>
      <div className="well relative overflow-hidden flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full min-h-[240px] block" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover(Math.max(0, Math.min(data.length - 1, Math.floor(((e.clientX - r.left) / r.width) * data.length)))); }}>
          {[0, 1, 2, 3, 4].map((g) => <line key={g} x1="0" x2={W} y1={10 + g * 48} y2={10 + g * 48} stroke="rgba(140,175,255,.06)" />)}
          {data.map((d, i) => {
            const x = i * cw + cw / 2; const col = d.c >= d.o ? "#22d38a" : "#ff4b6e";
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.55}>
                <rect x={x - cw * 0.35} y={H - (d.v / maxV) * VH} width={cw * 0.7} height={(d.v / maxV) * VH} fill={col} opacity=".22" />
                <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.4" />
                <rect x={x - cw * 0.32} y={y(Math.max(d.o, d.c))} width={cw * 0.64} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="1.5" fill={col} />
              </g>
            );
          })}
          {ma && <polyline points={maPts} fill="none" stroke="#ffc53d" strokeWidth="2" opacity=".85" />}
          <line x1="0" x2={W} y1={y(last.c)} y2={y(last.c)} stroke={last.c >= last.o ? "#22d38a" : "#ff4b6e"} strokeDasharray="4 4" strokeWidth="1" />
          {hover !== null && <><line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1="0" y2={H} stroke="rgba(255,255,255,.3)" strokeDasharray="3 3" /><circle cx={hover * cw + cw / 2} cy={y(data[hover].c)} r="4" fill="#fff" /></>}
        </svg>
        <div className={cn("absolute right-1 num text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white transition-all", last.c >= last.o ? "bg-bull" : "bg-bear")} style={{ top: `calc(${(y(last.c) / H) * 100}% - 9px)` }}>{last.c.toFixed(0)}</div>
        <div className="absolute left-3 top-2 flex items-center gap-1.5 text-[10px] font-bold text-bull"><span className="w-2 h-2 rounded-full bg-bull anim-glow" />LIVE</div>
      </div>
    </Asset>
  );
}

/* TRD-03 */
function OrderBook() {
  const [mid, setMid] = useState(67421.5);
  const [seed, setSeed] = useState(0);
  useInterval(() => { setMid((m) => m + (Math.random() - 0.5) * 12); setSeed((s) => s + 1); }, 800);
  const rows = useMemo(() => {
    const mk = (side: 1 | -1) => Array.from({ length: 7 }, (_, i) => ({ p: mid + side * (i + 1) * 2.5, a: +(Math.random() * 2.4 + 0.05).toFixed(3), f: Math.random() < 0.25 }));
    return { asks: mk(1).reverse(), bids: mk(-1) };
  }, [seed]); // eslint-disable-line
  const max = Math.max(...rows.asks.map((r) => r.a), ...rows.bids.map((r) => r.a));
  const Row = ({ r, side }: { r: { p: number; a: number; f: boolean }; side: "a" | "b" }) => (
    <div className="relative grid grid-cols-3 num text-[11px] py-[3px] px-2 rounded" style={{ animation: r.f ? `${side === "b" ? "flashG" : "flashR"} .7s` : undefined }}>
      <div className={cn("absolute inset-y-0 right-0 rounded transition-all duration-500", side === "a" ? "bg-bear/15" : "bg-bull/15")} style={{ width: `${(r.a / max) * 100}%` }} />
      <span className={cn("relative font-bold", side === "a" ? "text-bear" : "text-bull")}>{r.p.toFixed(1)}</span>
      <span className="relative text-right text-fog">{r.a.toFixed(3)}</span>
      <span className="relative text-right text-mist">{(r.p * r.a / 1000).toFixed(1)}k</span>
    </div>
  );
  return (
    <Asset code="TRD-03" title="Order Book" desc="Depth bars resize smoothly, updated levels flash. Spread & mid price in the center." tags={["depth", "flash"]}>
      <div className="grid grid-cols-3 text-[10px] font-bold uppercase text-mist px-2 mb-1"><span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span></div>
      <div className="space-y-px">{rows.asks.map((r, i) => <Row key={i} r={r} side="a" />)}</div>
      <div className="tile !rounded-xl my-2 px-3 py-2 flex items-center justify-between">
        <span className="num text-lg font-black text-bull flex items-center gap-1"><Icon name="arrowUp" size={16} stroke={3} />{mid.toFixed(1)}</span>
        <span className="text-[10px] text-mist">Spread <b className="num text-fog">2.5</b></span>
      </div>
      <div className="space-y-px">{rows.bids.map((r, i) => <Row key={i} r={r} side="b" />)}</div>
      <div className="mt-3 flex h-2 rounded-full overflow-hidden"><div className="bg-bull transition-all duration-700" style={{ width: `${48 + Math.sin(seed / 3) * 12}%` }} /><div className="bg-bear flex-1" /></div>
      <div className="flex justify-between num text-[10px] mt-1"><span className="text-bull">B {Math.round(48 + Math.sin(seed / 3) * 12)}%</span><span className="text-bear">S {Math.round(52 - Math.sin(seed / 3) * 12)}%</span></div>
    </Asset>
  );
}

/* TRD-04 */
function Position() {
  const entry = 66800;
  const [px, setPx] = useState(67421.5);
  const [closed, setClosed] = useState<null | number>(null);
  const [confirm, setConfirm] = useState(false);
  useInterval(() => { if (closed === null) setPx((p) => p + (Math.random() - 0.47) * 60); }, 700);
  const lev = 10, margin = 250;
  const pnl = ((px - entry) / entry) * margin * lev;
  const roe = (pnl / margin) * 100;
  const shown = useAnimatedNumber(closed ?? pnl, 500);
  const sl = 66100, tp = 69000;
  const prog = ((px - sl) / (tp - sl)) * 100;
  return (
    <Asset code="TRD-04" title="Open Position" desc="Live PnL & ROE tween, SL→TP progress rail with price marker, two-step close." tags={["pnl", "live"]}>
      <div className="flex items-center gap-3 mb-4">
        <Coin sym="BTC" size={40} />
        <div className="flex-1"><div className="font-extrabold">BTCUSDT <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-bull/20 text-bull font-black ml-1">LONG {lev}×</span></div><div className="text-[11px] text-mist">Entry <span className="num">{entry.toLocaleString()}</span> · Margin <span className="num">${margin}</span></div></div>
      </div>
      <div className={cn("rounded-2xl p-4 mb-4 text-center transition-colors", shown >= 0 ? "bg-bull/10 border border-bull/25" : "bg-bear/10 border border-bear/25")}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-mist">{closed !== null ? "Realized PnL" : "Unrealized PnL"}</div>
        <div className={cn("num text-3xl font-black", shown >= 0 ? "text-bull" : "text-bear")}>{shown >= 0 ? "+" : "−"}${Math.abs(shown).toFixed(2)}</div>
        <div className={cn("num text-sm font-bold", roe >= 0 ? "text-bull" : "text-bear")}>{roe >= 0 ? "+" : ""}{roe.toFixed(2)}% ROE</div>
      </div>
      <div className="relative mb-6 mt-2">
        <div className="h-3 rounded-full" style={{ background: "linear-gradient(90deg,#ff4b6e,#3a4a7a 30%,#3a4a7a 70%,#22d38a)" }} />
        <div className="absolute -top-1.5 -translate-x-1/2 transition-[left] duration-500" style={{ left: `${Math.max(0, Math.min(100, prog))}%` }}>
          <div className="w-6 h-6 rounded-full bg-white border-4 border-sky shadow-[0_3px_0_rgba(0,0,0,.3)]" />
        </div>
        <div className="flex justify-between num text-[10px] mt-2"><span className="text-bear">SL {sl}</span><span className="text-fog">{px.toFixed(0)}</span><span className="text-bull">TP {tp}</span></div>
      </div>
      {closed !== null ? <Btn variant="ghost" block icon="refresh" onClick={() => { setClosed(null); setConfirm(false); }}>Reopen demo</Btn>
        : confirm ? <div className="grid grid-cols-2 gap-2 anim-rise"><Btn variant="ghost" onClick={() => setConfirm(false)}>Cancel</Btn><Btn variant="bear" onClick={() => setClosed(pnl)}>Confirm</Btn></div>
          : <Btn variant="bear" block onClick={() => setConfirm(true)}>Close position</Btn>}
    </Asset>
  );
}

/* TRD-05 */
function Portfolio() {
  const A = [["BTC", 48, "#F7931A"], ["ETH", 26, "#7B8CFF"], ["SOL", 14, "#14F195"], ["TON", 8, "#0098EA"], ["DOGE", 4, "#C2A633"]] as const;
  const [h, setH] = useState<number | null>(null);
  const total = useAnimatedNumber(12846.32, 1400);
  const R = 58, Cc = 2 * Math.PI * R;
  let acc = 0;
  return (
    <Asset code="TRD-05" title="Portfolio Donut" desc="Allocation ring with hover-expand segments, synced legend and animated total." tags={["hover", "chart"]}>
      <div className="flex items-center gap-4">
        <div className="relative w-40 h-40 shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle cx="80" cy="80" r={R} fill="none" stroke="#0a1330" strokeWidth="22" />
            {A.map(([s, v, c], i) => {
              const len = (v / 100) * Cc; const off = acc; acc += len;
              return <circle key={s} cx="80" cy="80" r={R} fill="none" stroke={c} strokeWidth={h === i ? 28 : 20} strokeDasharray={`${len - 3} ${Cc}`} strokeDashoffset={-off} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className="transition-all duration-300 cursor-pointer" style={{ opacity: h === null || h === i ? 1 : 0.35, animation: `rise .6s ${i * 0.08}s both` }} />;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>{h === null ? <><div className="text-[9px] text-mist uppercase font-bold">Total</div><div className="num font-black text-base">${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div></> : <><div className="text-[10px] font-black" style={{ color: A[h][2] }}>{A[h][0]}</div><div className="num font-black text-xl">{A[h][1]}%</div></>}</div>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {A.map(([s, v, c], i) => (
            <div key={s} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className={cn("flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors", h === i && "bg-white/5")}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} /><span className="text-xs font-bold flex-1">{s}</span><span className="num text-xs text-mist">{v}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="tile p-2.5"><div className="text-[10px] text-mist font-bold uppercase">24h</div><div className="num font-black text-bull">+$342.18</div></div>
        <div className="tile p-2.5"><div className="text-[10px] text-mist font-bold uppercase">All-time</div><div className="num font-black text-bull">+28.4%</div></div>
      </div>
    </Asset>
  );
}

/* TRD-06 */
function Watchlist() {
  const p = useLive(1300);
  const [stars, setStars] = useState<string[]>(["BTC", "SOL"]);
  const [sort, setSort] = useState<"name" | "chg">("chg");
  const list = ["BTC", "ETH", "SOL", "BNB", "DOGE", "TON"].sort((a, b) => (sort === "chg" ? p[b].ch - p[a].ch : a.localeCompare(b)));
  return (
    <Asset code="TRD-06" title="Watchlist" desc="Live rows with area sparklines, animated re-sorting and favorite toggles." tags={["sort", "spark"]}>
      <div className="flex gap-1 well p-1 mb-3 self-start">
        {(["chg", "name"] as const).map((s) => <button key={s} onClick={() => setSort(s)} className={cn("text-[11px] font-bold px-3 py-1 rounded-lg", sort === s ? "bg-sky text-white shadow-[0_2px_0_#1a56a8]" : "text-mist")}>{s === "chg" ? "Top movers" : "A–Z"}</button>)}
      </div>
      <div className="space-y-1.5">
        {list.map((k) => {
          const x = p[k]; const up = x.ch >= 0; const st = stars.includes(k);
          return (
            <div key={k} className="tile !rounded-xl p-2 flex items-center gap-2.5 tile-hover">
              <button onClick={() => setStars(st ? stars.filter((s) => s !== k) : [...stars, k])} className={st ? "text-gold" : "text-ink-500 hover:text-mist"}><Icon name="star" size={16} fill={st ? "currentColor" : "none"} className={st ? "anim-pop" : ""} /></button>
              <Coin sym={k} size={28} />
              <div className="w-14"><div className="text-xs font-extrabold">{k}</div><div className="text-[9px] text-mist truncate">{COINS[k].s}</div></div>
              <Spark data={x.hist} up={up} w={64} h={24} />
              <div className="ml-auto text-right">
                <div className={cn("num text-xs font-bold transition-colors duration-300", x.d > 0 ? "text-bull" : x.d < 0 ? "text-bear" : "text-fog")}>${fmt(x.v)}</div>
                <div className={cn("num text-[10px] font-bold px-1.5 rounded mt-0.5 inline-block", up ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>{up ? "+" : ""}{x.ch.toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* TRD-07 */
function FearGreed() {
  const [v, setV] = useState(72);
  const a = useAnimatedNumber(v, 1200);
  const ang = -90 + (a / 100) * 180;
  const lab = a < 25 ? ["Extreme Fear", "#ff4b6e"] : a < 45 ? ["Fear", "#ff8a3d"] : a < 55 ? ["Neutral", "#ffc53d"] : a < 75 ? ["Greed", "#9ee35a"] : ["Extreme Greed", "#22d38a"];
  return (
    <Asset code="TRD-07" title="Fear & Greed Gauge" desc="Sentiment meter with spring needle and zone-colored readout. Tap refresh to resample." tags={["gauge", "spring"]}>
      <div className="relative mx-auto w-56 h-32 mt-2">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stopColor="#ff4b6e" /><stop offset=".3" stopColor="#ff8a3d" /><stop offset=".5" stopColor="#ffc53d" /><stop offset=".75" stopColor="#9ee35a" /><stop offset="1" stopColor="#22d38a" /></linearGradient></defs>
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#0a1330" strokeWidth="22" strokeLinecap="round" />
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#fg)" strokeWidth="16" strokeLinecap="round" />
          {Array.from({ length: 11 }).map((_, i) => { const t = (-180 + i * 18) * Math.PI / 180; return <line key={i} x1={100 + Math.cos(t) * 62} y1={100 + Math.sin(t) * 62} x2={100 + Math.cos(t) * 56} y2={100 + Math.sin(t) * 56} stroke="#2b4380" strokeWidth="2" />; })}
          <g transform={`rotate(${ang} 100 100)`}>
            <path d="M100 34 L106 100 L94 100 Z" fill="#eef3ff" />
            <circle cx="100" cy="100" r="10" fill="#eef3ff" stroke="#0a1330" strokeWidth="3" />
          </g>
        </svg>
      </div>
      <div className="text-center -mt-1">
        <div className="num text-4xl font-black" style={{ color: lab[1] }}>{Math.round(a)}</div>
        <div className="text-sm font-black uppercase tracking-wider" style={{ color: lab[1] }}>{lab[0]}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        {[["Yesterday", 68], ["Last week", 54], ["Last month", 31]].map(([l, n]) => <div key={l} className="tile !rounded-xl py-2"><div className="text-[9px] text-mist uppercase font-bold">{l}</div><div className="num font-black text-sm">{n}</div></div>)}
      </div>
      <Btn variant="ghost" size="sm" icon="refresh" className="mt-4" block onClick={() => setV(Math.round(Math.random() * 100))}>Resample</Btn>
    </Asset>
  );
}

/* TRD-08 */
function SentimentPoll() {
  const [vote, setVote] = useState<"bull" | "bear" | null>(null);
  const [b, setB] = useState(6240), [s, setS] = useState(3810);
  const bp = (b / (b + s)) * 100;
  return (
    <Asset code="TRD-08" title="Community Poll" desc="Where's BTC in 24h? Vote to reveal the animated crowd split; earn XP when right." tags={["vote", "social"]}>
      <div className="text-center mb-4"><Coin sym="BTC" size={48} /><div className="font-black text-lg mt-2">BTC in 24h?</div><div className="text-xs text-mist">Closes in <span className="num text-fog">05:42:18</span></div></div>
      {!vote ? (
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Btn variant="bull" size="lg" icon="trendUp" onClick={() => { setVote("bull"); setB(b + 1); }}>Bullish</Btn>
          <Btn variant="bear" size="lg" icon="trendDown" onClick={() => { setVote("bear"); setS(s + 1); }}>Bearish</Btn>
        </div>
      ) : (
        <div className="mt-auto anim-rise">
          <div className="flex justify-between text-sm font-black mb-1.5"><span className="text-bull">🐂 {bp.toFixed(1)}%</span><span className="text-bear">{(100 - bp).toFixed(1)}% 🐻</span></div>
          <div className="well h-6 !rounded-full overflow-hidden flex p-0.5">
            <div className="rounded-l-full bg-gradient-to-b from-[#3ce49e] to-[#16b56f] transition-all duration-1000 ease-out" style={{ width: `${bp}%`, animation: "rise .6s both" }} />
            <div className="flex-1 rounded-r-full bg-gradient-to-b from-[#ff6885] to-[#e8325a]" />
          </div>
          <div className="text-xs text-mist text-center mt-3">You voted <b className={vote === "bull" ? "text-bull" : "text-bear"}>{vote === "bull" ? "Bullish" : "Bearish"}</b> · {(b + s).toLocaleString()} votes</div>
          <button onClick={() => setVote(null)} className="text-[11px] text-mist hover:text-sky mt-2 block mx-auto">change vote</button>
        </div>
      )}
      <Label className="mt-4 mb-0 text-center">Reward: +15 XP if correct</Label>
    </Asset>
  );
}

export default function Trading() {
  return (
    <Section id="trading" index="05" title="Trading Widgets" subtitle="Real market mechanics, simulated live — so learners practice on the real thing, risk-free.">
      <Ticker />
      <CandleChart />
      <OrderBook />
      <Position />
      <Watchlist />
      <Portfolio />
      <FearGreed />
      <SentimentPoll />
    </Section>
  );
}
