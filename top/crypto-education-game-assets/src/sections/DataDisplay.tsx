import { useMemo, useState } from "react";
import { Asset, Btn, Chip, Label, Section, Segmented, haptic, useInterval } from "../components/ui";
import { BullIcon, CoinIcon, FlameIcon, Icon, XPIcon } from "../components/icons";
import { cn } from "../utils/cn";

const coins = [
  { s: "BTC", n: "Bitcoin", p: 64250, c: "#f7931a" },
  { s: "ETH", n: "Ethereum", p: 3420, c: "#627eea" },
  { s: "SOL", n: "Solana", p: 148.2, c: "#14f195" },
  { s: "BNB", n: "BNB", p: 592.4, c: "#f3ba2f" },
  { s: "XRP", n: "XRP", p: 0.52, c: "#9ca3af" },
  { s: "ADA", n: "Cardano", p: 0.45, c: "#3468d1" },
  { s: "DOGE", n: "Dogecoin", p: 0.158, c: "#c2a633" },
  { s: "AVAX", n: "Avalanche", p: 36.1, c: "#e84142" },
];

function useLive(initial: number, vol = 0.002, ms = 1200) {
  const [p, setP] = useState(initial);
  const [prev, setPrev] = useState(initial);
  const [hist, setHist] = useState(() => {
    let v = initial;
    return Array.from({ length: 40 }, () => (v = v * (1 + (Math.random() - 0.5) * vol * 3)));
  });
  useInterval(() => {
    setPrev(p);
    const n = p * (1 + (Math.random() - 0.48) * vol);
    setP(n);
    setHist((h) => [...h.slice(1), n]);
  }, ms);
  return { p, prev, hist, up: p >= prev };
}

const fmt = (v: number) => (v >= 100 ? v.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 }) : v.toFixed(v < 1 ? 4 : 2));

function CoinDot({ c, s, size = 32 }: { c: string; s: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-display font-black text-white"
      style={{ width: size, height: size, fontSize: size * 0.32, background: `linear-gradient(180deg, color-mix(in srgb, ${c} 80%, white), ${c})`, boxShadow: `0 3px 0 color-mix(in srgb, ${c} 50%, black), inset 0 1px 0 rgba(255,255,255,.4)` }}
    >
      {s.slice(0, s.length > 3 ? 1 : 3)}
    </span>
  );
}

function Spark({ data, up, w = 120, h = 40, fill = true }: { data: number[]; up: boolean; w?: number; h?: number; fill?: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)]);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const col = up ? "#22d39a" : "#ff4d6d";
  const id = up ? "spk-up" : "spk-dn";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".35" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient>
      </defs>
      {fill && <path d={`${d}L${w},${h}L0,${h}Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={col} className="anim-glow" />
    </svg>
  );
}

function TickerItem({ c }: { c: (typeof coins)[number] }) {
  const { p, up, hist } = useLive(c.p, 0.003, 1500 + Math.random() * 800);
  const ch = ((p - hist[0]) / hist[0]) * 100;
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-ink-850/70 px-3 py-2">
      <CoinDot c={c.c} s={c.s} size={28} />
      <div>
        <div className="text-[11px] font-extrabold text-ink-300">{c.s}/USDT</div>
        <div key={p} className={cn("font-mono text-sm font-bold transition-colors", up ? "text-bull" : "text-bear")}>
          ${fmt(p)}
        </div>
      </div>
      <Chip tone={ch >= 0 ? "bull" : "bear"}>
        {ch >= 0 ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}%
      </Chip>
    </div>
  );
}

function Ticker() {
  const [paused, setPaused] = useState(false);
  return (
    <Asset title="Live Market Ticker" code="D-01" tags="ticker marquee prices live market" span={12} bodyClass="px-0 py-4">
      <div
        className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="flex w-max gap-3" style={{ animation: "ticker 40s linear infinite", animationPlayState: paused ? "paused" : "running" }}>
          {[...coins, ...coins].map((c, i) => (
            <TickerItem key={i} c={c} />
          ))}
        </div>
      </div>
      <div className="mt-2 px-5 text-[11px] text-ink-500">Hover to pause · prices tick in real time</div>
    </Asset>
  );
}

type Cd = { o: number; h: number; l: number; c: number; v: number };
function genCandles(n: number, seed: number, start: number): Cd[] {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let p = start;
  return Array.from({ length: n }, () => {
    const o = p;
    const c = o * (1 + (r() - 0.48) * 0.02);
    const h = Math.max(o, c) * (1 + r() * 0.008);
    const l = Math.min(o, c) * (1 - r() * 0.008);
    p = c;
    return { o, h, l, c, v: 20 + r() * 80 };
  });
}

function CandleChart() {
  const [tf, setTf] = useState<"15m" | "1h" | "4h" | "1D">("1h");
  const [hover, setHover] = useState<number | null>(null);
  const [showMA, setShowMA] = useState(true);
  const seed = { "15m": 11, "1h": 42, "4h": 97, "1D": 7 }[tf];
  const [tick, setTick] = useState(0);
  const base = useMemo(() => genCandles(48, seed, 62000), [seed]);
  useInterval(() => setTick((t) => t + 1), 900);
  const data = useMemo(() => {
    const d = base.slice();
    const last = { ...d[d.length - 1] };
    const wig = Math.sin(tick * 1.3) * last.o * 0.004 + Math.cos(tick * 0.7) * last.o * 0.002;
    last.c = last.o + (last.c - last.o) + wig;
    last.h = Math.max(last.h, last.c);
    last.l = Math.min(last.l, last.c);
    d[d.length - 1] = last;
    return d;
  }, [base, tick]);
  const W = 640, H = 260, VH = 50;
  const max = Math.max(...data.map((d) => d.h)), min = Math.min(...data.map((d) => d.l));
  const cw = W / data.length;
  const y = (v: number) => 8 + ((max - v) / (max - min)) * (H - 16);
  const ma = data.map((_, i) => {
    const sl = data.slice(Math.max(0, i - 6), i + 1);
    return sl.reduce((a, b) => a + b.c, 0) / sl.length;
  });
  const last = data[data.length - 1];
  const hv = hover !== null ? data[hover] : last;
  const chg = ((hv.c - hv.o) / hv.o) * 100;
  return (
    <Asset title="Candlestick Chart" code="D-02" tags="chart candlestick ohlc crosshair volume timeframe live" span={8}>
      <div className="flex flex-wrap items-center gap-3">
        <CoinDot c="#f7931a" s="BTC" size={36} />
        <div>
          <div className="text-xs font-extrabold text-ink-300">BTC / USDT · Perp</div>
          <div className={cn("font-mono text-2xl font-bold", last.c >= last.o ? "text-bull" : "text-bear")}>${fmt(last.c)}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowMA((s) => !s)} className={cn("rounded-lg px-2 py-1 text-[11px] font-extrabold", showMA ? "bg-gold/20 text-gold" : "text-ink-400")}>
            MA7
          </button>
          <Segmented
            className="w-56"
            value={tf}
            onChange={setTf}
            options={(["15m", "1h", "4h", "1D"] as const).map((v) => ({ value: v, label: v }))}
          />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[11px]">
        {(["o", "h", "l", "c"] as const).map((k) => (
          <span key={k} className="text-ink-400">
            {k.toUpperCase()} <b className="text-ink-100">{fmt(hv[k])}</b>
          </span>
        ))}
        <span className={chg >= 0 ? "text-bull" : "text-bear"}>
          {chg >= 0 ? "+" : ""}
          {chg.toFixed(2)}%
        </span>
      </div>
      <div className="panel-inset relative mt-3 overflow-hidden rounded-2xl">
        <svg viewBox={`0 0 ${W} ${H + VH}`} className="block w-full cursor-crosshair" onMouseLeave={() => setHover(null)}>
          {[0.2, 0.4, 0.6, 0.8].map((g) => (
            <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#16295a" />
          ))}
          {data.map((d, i) => {
            const up = d.c >= d.o;
            const col = up ? "#22d39a" : "#ff4d6d";
            return (
              <g key={`${tf}${i}`} style={{ transformOrigin: `${i * cw}px ${H + VH}px`, animation: `bar-grow .5s ${i * 8}ms both cubic-bezier(.3,1.2,.5,1)` }} opacity={hover === null || hover === i ? 1 : 0.55}>
                <rect x={i * cw + 2} y={H + VH - (d.v / 100) * VH} width={cw - 4} height={(d.v / 100) * VH} fill={col} opacity=".25" rx="1" />
                <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.4" />
                <rect x={i * cw + 2} y={y(Math.max(d.o, d.c))} width={cw - 4} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="1.5" fill={col} />
                <rect x={i * cw} y="0" width={cw} height={H + VH} fill="transparent" onMouseEnter={() => setHover(i)} />
              </g>
            );
          })}
          {showMA && (
            <path
              d={ma.map((v, i) => `${i ? "L" : "M"}${i * cw + cw / 2},${y(v)}`).join("")}
              fill="none"
              stroke="#ffc23d"
              strokeWidth="2"
              strokeDasharray="2000"
              strokeDashoffset="2000"
              style={{ animation: "dash 1.4s .3s ease-out forwards" }}
              pointerEvents="none"
            />
          )}
          <line x1="0" x2={W} y1={y(last.c)} y2={y(last.c)} stroke={last.c >= last.o ? "#22d39a" : "#ff4d6d"} strokeDasharray="4 4" strokeOpacity=".8" pointerEvents="none" />
          {hover !== null && (
            <g pointerEvents="none">
              <line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1="0" y2={H + VH} stroke="#8ea4d2" strokeDasharray="3 3" />
              <line x1="0" x2={W} y1={y(data[hover].c)} y2={y(data[hover].c)} stroke="#8ea4d2" strokeDasharray="3 3" />
            </g>
          )}
        </svg>
        <div
          className={cn("pointer-events-none absolute right-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold text-white", last.c >= last.o ? "bg-bull" : "bg-bear")}
          style={{ top: `calc(${(y(last.c) / (H + VH)) * 100}% - 9px)` }}
        >
          {fmt(last.c)}
        </div>
      </div>
    </Asset>
  );
}

function OrderBook() {
  const [mid, setMid] = useState(64250);
  const [rows, setRows] = useState(() => gen(64250));
  function gen(m: number) {
    const asks = Array.from({ length: 7 }, (_, i) => ({ p: m + (7 - i) * 2.5, s: +(Math.random() * 2 + 0.1).toFixed(3) }));
    const bids = Array.from({ length: 7 }, (_, i) => ({ p: m - (i + 1) * 2.5, s: +(Math.random() * 2 + 0.1).toFixed(3) }));
    return { asks, bids };
  }
  useInterval(() => {
    const m = mid + (Math.random() - 0.5) * 6;
    setMid(m);
    setRows(gen(m));
  }, 1100);
  const maxS = Math.max(...rows.asks.map((a) => a.s), ...rows.bids.map((b) => b.s));
  const Row = ({ p, s, side }: { p: number; s: number; side: "a" | "b" }) => (
    <div className="relative flex h-6 items-center justify-between px-2 font-mono text-[11px]">
      <div
        className={cn("absolute inset-y-0.5 right-0 rounded-md transition-all duration-500", side === "a" ? "bg-bear/15" : "bg-bull/15")}
        style={{ width: `${(s / maxS) * 100}%` }}
      />
      <span className={cn("relative font-bold", side === "a" ? "text-bear" : "text-bull")}>{fmt(p)}</span>
      <span className="relative text-ink-200">{s.toFixed(3)}</span>
    </div>
  );
  return (
    <Asset title="Order Book Depth" code="D-03" tags="order book depth bids asks spread live" span={4}>
      <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-ink-500">
        <span>Price</span>
        <span>Size BTC</span>
      </div>
      <div className="mt-1">
        {rows.asks.map((a, i) => (
          <Row key={i} {...a} side="a" />
        ))}
      </div>
      <div className="panel-raised my-2 flex items-center justify-between rounded-xl px-3 py-2">
        <span className="font-mono text-lg font-bold text-white">{fmt(mid)}</span>
        <span className="text-[10px] font-bold text-ink-400">Spread 2.50</span>
      </div>
      <div>
        {rows.bids.map((b, i) => (
          <Row key={i} {...b} side="b" />
        ))}
      </div>
      <div className="mt-3 flex h-2 overflow-hidden rounded-full">
        <div className="bg-bull transition-all duration-500" style={{ width: `${(rows.bids.reduce((a, b) => a + b.s, 0) / (rows.bids.reduce((a, b) => a + b.s, 0) + rows.asks.reduce((a, b) => a + b.s, 0))) * 100}%` }} />
        <div className="flex-1 bg-bear" />
      </div>
    </Asset>
  );
}

function AssetTile() {
  const btc = useLive(64250, 0.004, 1000);
  const [fav, setFav] = useState(true);
  const ch = ((btc.p - btc.hist[0]) / btc.hist[0]) * 100;
  return (
    <Asset title="Asset Card · Live" code="D-04" tags="asset card sparkline price flash favorite" span={4}>
      <div className={cn("panel-raised relative overflow-hidden rounded-2xl p-4 transition-shadow duration-300", btc.up ? "shadow-[0_5px_0_#0b1838,0_0_0_2px_rgba(34,211,154,.25)]" : "shadow-[0_5px_0_#0b1838,0_0_0_2px_rgba(255,77,109,.25)]")}>
        <div className="flex items-center gap-3">
          <CoinDot c="#f7931a" s="BTC" size={40} />
          <div className="flex-1">
            <div className="font-display text-base font-black text-white">Bitcoin</div>
            <div className="text-[11px] font-bold text-ink-400">BTC · Rank #1</div>
          </div>
          <button onClick={() => { setFav((f) => !f); haptic(); }} className={cn("transition-transform active:scale-75", fav ? "text-gold" : "text-ink-500")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className={fav ? "anim-pop" : ""} key={String(fav)}>
              <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" />
            </svg>
          </button>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div key={Math.round(btc.p)} className={cn("font-mono text-2xl font-bold transition-colors duration-300", btc.up ? "text-bull" : "text-bear")}>
              ${fmt(btc.p)}
            </div>
            <Chip tone={ch >= 0 ? "bull" : "bear"} className="mt-1">
              {ch >= 0 ? "▲" : "▼"} {Math.abs(ch).toFixed(2)}% 24h
            </Chip>
          </div>
          <Spark data={btc.hist} up={ch >= 0} w={130} h={54} />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[["Mkt cap", "$1.26T"], ["Vol 24h", "$28.4B"], ["Supply", "19.7M"]].map(([k, v]) => (
          <div key={k} className="panel-inset rounded-xl py-2">
            <div className="text-[9px] font-bold uppercase text-ink-500">{k}</div>
            <div className="font-mono text-xs font-bold text-white">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Btn variant="bull" size="sm">Buy</Btn>
        <Btn variant="bear" size="sm">Sell</Btn>
      </div>
    </Asset>
  );
}

function Portfolio() {
  const parts = [
    { s: "BTC", v: 45, c: "#f7931a" },
    { s: "ETH", v: 25, c: "#627eea" },
    { s: "SOL", v: 15, c: "#14f195" },
    { s: "USDT", v: 10, c: "#26a17b" },
    { s: "Other", v: 5, c: "#9170ff" },
  ];
  const [h, setH] = useState<number | null>(null);
  const R = 60, C = 2 * Math.PI * R;
  let acc = 0;
  const total = 12480.52;
  return (
    <Asset title="Portfolio Allocation" code="D-05" tags="portfolio donut pie allocation balance chart" span={4}>
      <div className="flex items-center gap-4">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
            <circle cx="80" cy="80" r={R} fill="none" stroke="#0a1330" strokeWidth="22" />
            {parts.map((p, i) => {
              const len = (p.v / 100) * C;
              const el = (
                <circle
                  key={p.s}
                  cx="80"
                  cy="80"
                  r={R}
                  fill="none"
                  stroke={p.c}
                  strokeWidth={h === i ? 28 : 22}
                  strokeDasharray={`${len - 3} ${C}`}
                  strokeDashoffset={-acc}
                  className="cursor-pointer transition-all duration-300"
                  style={{ filter: h === i ? `drop-shadow(0 0 8px ${p.c})` : undefined, opacity: h === null || h === i ? 1 : 0.4 }}
                  onMouseEnter={() => setH(i)}
                  onMouseLeave={() => setH(null)}
                  onClick={() => setH(h === i ? null : i)}
                />
              );
              acc += len;
              return el;
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            {h === null ? (
              <>
                <span className="text-[10px] font-bold uppercase text-ink-400">Total</span>
                <span className="font-mono text-base font-bold text-white">${(total / 1000).toFixed(2)}k</span>
                <span className="text-[11px] font-bold text-bull">+8.4%</span>
              </>
            ) : (
              <span key={h} className="anim-pop flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase text-ink-400">{parts[h].s}</span>
                <span className="font-display text-2xl font-black" style={{ color: parts[h].c }}>{parts[h].v}%</span>
                <span className="font-mono text-[11px] text-ink-300">${((total * parts[h].v) / 100).toFixed(0)}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {parts.map((p, i) => (
            <button
              key={p.s}
              onMouseEnter={() => setH(i)}
              onMouseLeave={() => setH(null)}
              className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold transition", h === i ? "bg-white/10" : "")}
            >
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.c }} />
              <span className="flex-1 text-left text-ink-100">{p.s}</span>
              <span className="font-mono text-ink-300">{p.v}%</span>
            </button>
          ))}
        </div>
      </div>
      <Label className="mt-4">PnL today</Label>
      <div className="flex items-center gap-3">
        <div className="font-mono text-xl font-bold text-bull">+$412.80</div>
        <Chip tone="bull">▲ 3.42%</Chip>
        <BullIcon size={30} className="ml-auto anim-float" />
      </div>
    </Asset>
  );
}

function Watchlist() {
  const [items, setItems] = useState(coins.slice(0, 5).map((c) => ({ ...c, fav: c.s === "BTC" || c.s === "SOL" })));
  const [removed, setRemoved] = useState<string | null>(null);
  return (
    <Asset title="Watchlist · List Items" code="D-06" tags="list items watchlist rows swipe favorites" span={4}>
      <div className="space-y-2">
        {items.map((c, i) => (
          <WatchRow
            key={c.s}
            c={c}
            i={i}
            onFav={() => setItems((s) => s.map((x) => (x.s === c.s ? { ...x, fav: !x.fav } : x)))}
            onRemove={() => {
              setItems((s) => s.filter((x) => x.s !== c.s));
              setRemoved(c.s);
            }}
          />
        ))}
      </div>
      {removed && (
        <div className="anim-slide-up mt-3 flex items-center justify-between rounded-xl bg-ink-950/60 px-3 py-2 text-xs">
          <span className="text-ink-300">{removed} removed</span>
          <button
            className="font-extrabold text-cyan"
            onClick={() => {
              const c = coins.find((x) => x.s === removed)!;
              setItems((s) => [...s, { ...c, fav: false }]);
              setRemoved(null);
            }}
          >
            UNDO
          </button>
        </div>
      )}
      <div className="mt-3 text-[11px] text-ink-500">Hover row → remove. Star to pin.</div>
    </Asset>
  );
}

function WatchRow({ c, i, onFav, onRemove }: { c: (typeof coins)[number] & { fav: boolean }; i: number; onFav: () => void; onRemove: () => void }) {
  const live = useLive(c.p, 0.004, 1300 + i * 170);
  const ch = ((live.p - live.hist[0]) / live.hist[0]) * 100;
  return (
    <div className="anim-slide-up group/r panel-raised flex items-center gap-3 rounded-2xl p-2.5 pr-3 transition hover:-translate-y-0.5" style={{ animationDelay: `${i * 50}ms` }}>
      <CoinDot c={c.c} s={c.s} size={34} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-sm font-extrabold text-white">
          {c.s}
          <button onClick={onFav} className={c.fav ? "text-gold" : "text-ink-600 hover:text-ink-300"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8L12 3.5Z" /></svg>
          </button>
        </div>
        <div className="truncate text-[11px] text-ink-400">{c.n}</div>
      </div>
      <Spark data={live.hist.slice(-20)} up={ch >= 0} w={54} h={24} fill={false} />
      <div className="w-20 text-right">
        <div className="font-mono text-xs font-bold text-white">${fmt(live.p)}</div>
        <div className={cn("font-mono text-[10px] font-bold", ch >= 0 ? "text-bull" : "text-bear")}>
          {ch >= 0 ? "+" : ""}
          {ch.toFixed(2)}%
        </div>
      </div>
      <button onClick={onRemove} className="w-0 overflow-hidden text-bear opacity-0 transition-all group-hover/r:w-5 group-hover/r:opacity-100">
        <Icon name="x" size={16} stroke={3} />
      </button>
    </div>
  );
}

function Table() {
  type K = "name" | "price" | "change" | "status";
  const [sort, setSort] = useState<{ k: K; d: 1 | -1 }>({ k: "change", d: -1 });
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");
  const rows = [
    { name: "BTC Long", price: 64250, change: 4.2, status: "open" },
    { name: "ETH Short", price: 3420, change: -1.8, status: "open" },
    { name: "SOL Long", price: 148.2, change: 12.6, status: "closed" },
    { name: "AVAX Long", price: 36.1, change: -6.3, status: "closed" },
    { name: "BNB Short", price: 592.4, change: 2.1, status: "open" },
  ];
  const data = rows
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => {
      const va = a[sort.k], vb = b[sort.k];
      return (typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb))) * sort.d;
    });
  const H = ({ k, children, right }: { k: K; children: React.ReactNode; right?: boolean }) => (
    <button
      onClick={() => setSort((s) => ({ k, d: s.k === k ? (s.d === 1 ? -1 : 1) : -1 }))}
      className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition", right && "justify-end", sort.k === k ? "text-cyan" : "text-ink-400 hover:text-ink-200")}
    >
      {children}
      <span className={cn("transition-transform", sort.k === k && sort.d === 1 && "rotate-180")}>
        <Icon name="chevronDown" size={12} stroke={3} />
      </span>
    </button>
  );
  return (
    <Asset title="Compact Table" code="D-07" tags="table header sortable filter rows positions" span={6}>
      <div className="mb-3 flex items-center gap-2">
        <Icon name="filter" size={14} className="text-ink-400" />
        {(["all", "open", "closed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase transition", filter === f ? "bg-azure text-white shadow-[0_2px_0_#1c55c2]" : "text-ink-400 hover:text-white")}>
            {f}
          </button>
        ))}
      </div>
      <div className="panel-raised grid grid-cols-[1.4fr_1fr_1fr_0.9fr] gap-2 rounded-xl px-3 py-2.5">
        <H k="name">Position</H>
        <H k="price" right>Price</H>
        <H k="change" right>PnL</H>
        <H k="status">Status</H>
      </div>
      <div className="mt-1.5">
        {data.map((r, i) => (
          <div key={r.name} className="anim-slide-up grid grid-cols-[1.4fr_1fr_1fr_0.9fr] items-center gap-2 rounded-xl px-3 py-2.5 text-xs transition hover:bg-white/5" style={{ animationDelay: `${i * 40}ms` }}>
            <span className="flex items-center gap-2 font-extrabold text-white">
              <span className={cn("h-6 w-1 rounded-full", r.name.includes("Long") ? "bg-bull" : "bg-bear")} />
              {r.name}
            </span>
            <span className="text-right font-mono text-ink-200">{fmt(r.price)}</span>
            <span className={cn("text-right font-mono font-bold", r.change >= 0 ? "text-bull" : "text-bear")}>
              {r.change >= 0 ? "+" : ""}
              {r.change}%
            </span>
            <span>
              <Chip tone={r.status === "open" ? "azure" : "ink"}>{r.status}</Chip>
            </span>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function BadgesAvatars() {
  const [tip, setTip] = useState<number | null>(null);
  const [online, setOnline] = useState([true, true, false, true, false]);
  const users = [
    { n: "Kate", c: "#ff7a2f", r: "gold" },
    { n: "Sato", c: "#3e8bff", r: "diamond" },
    { n: "Max", c: "#9170ff", r: "" },
    { n: "Lena", c: "#22d39a", r: "" },
    { n: "Ivan", c: "#ff4d6d", r: "" },
  ];
  return (
    <Asset title="Badges · Avatars · Tooltips" code="D-08" tags="badges avatars tooltip status pill chips" span={6}>
      <Label>Badges</Label>
      <div className="flex flex-wrap gap-2">
        <Chip tone="bull">● Profit</Chip>
        <Chip tone="bear">● Loss</Chip>
        <Chip tone="gold">★ Pro</Chip>
        <Chip tone="azure">New</Chip>
        <Chip tone="violet">Beta</Chip>
        <Chip tone="flame">🔥 Hot</Chip>
        <Chip>Unverified</Chip>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-bear px-1.5 text-[11px] font-black text-white shadow-[0_2px_0_#b31f3d] anim-pulse-ring [--ring:rgba(255,77,109,.5)]">9+</span>
      </div>
      <Label className="mt-5">Avatars · tap for status</Label>
      <div className="flex items-center gap-3">
        {users.map((u, i) => (
          <button
            key={u.n}
            onClick={() => setOnline((o) => o.map((v, j) => (j === i ? !v : v)))}
            onMouseEnter={() => setTip(i)}
            onMouseLeave={() => setTip(null)}
            className="relative transition-transform hover:-translate-y-1"
          >
            <span
              className={cn("flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-black text-white ring-[3px]", u.r === "gold" ? "ring-gold" : u.r === "diamond" ? "ring-cyan" : "ring-ink-600")}
              style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${u.c} 75%, white), ${u.c})`, boxShadow: `0 4px 0 color-mix(in srgb, ${u.c} 45%, black)` }}
            >
              {u.n[0]}
            </span>
            <span className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full ring-[3px] ring-ink-800 transition-colors", online[i] ? "bg-bull" : "bg-ink-500")} />
            {tip === i && (
              <span className="anim-pop absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-ink-900 shadow-[0_3px_0_#8ea4d2]">
                {u.n} · {online[i] ? "online" : "away"}
                <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" />
              </span>
            )}
          </button>
        ))}
        <div className="flex -space-x-3">
          {["#f7931a", "#627eea", "#14f195"].map((c, i) => (
            <span key={i} className="h-9 w-9 rounded-full ring-[3px] ring-ink-800" style={{ background: c }} />
          ))}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-600 text-[10px] font-black text-white ring-[3px] ring-ink-800">+12</span>
        </div>
      </div>
      <Label className="mt-5">Tooltips</Label>
      <div className="flex flex-wrap gap-3">
        {[
          { l: "What is APY?", t: "Annual Percentage Yield — includes compounding." },
          { l: "Funding rate", t: "Periodic payment between longs and shorts." },
        ].map((x, i) => (
          <div key={x.l} className="group/t relative">
            <button className="btn3d v-ghost h-9 rounded-xl px-3 text-[11px] normal-case [--depth:3px]">
              <Icon name="info" size={14} /> {x.l}
            </button>
            <div className="pointer-events-none absolute bottom-[calc(100%+10px)] left-0 z-20 w-56 translate-y-1 rounded-xl border border-white/10 bg-ink-950 p-3 text-[11px] font-semibold text-ink-200 opacity-0 shadow-xl transition-all duration-200 group-hover/t:translate-y-0 group-hover/t:opacity-100">
              <b className="text-cyan">{x.l}</b>
              <br />
              {x.t}
              <span className={cn("absolute -bottom-1 h-2 w-2 rotate-45 border-b border-r border-white/10 bg-ink-950", i ? "left-6" : "left-6")} />
            </div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Cards() {
  const [enrolled, setEnrolled] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(248);
  const [flip, setFlip] = useState(false);
  return (
    <Asset title="Cards" code="D-09" tags="cards course lesson news flashcard promo" span={12}>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Course card */}
        <div className="panel-raised group/c overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1">
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-azure to-violet">
            <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none">
              <path d="M0 80 L30 60 L55 70 L85 35 L110 50 L140 20 L170 30 L200 10" stroke="#fff" strokeWidth="3" fill="none" />
            </svg>
            <div className="absolute left-3 top-3"><Chip tone="gold">★ Bestseller</Chip></div>
            <Icon name="chart" size={56} className="absolute -bottom-2 right-2 text-white/80 transition-transform duration-500 group-hover/c:scale-110 group-hover/c:-rotate-6" />
          </div>
          <div className="p-4">
            <div className="font-display text-sm font-black text-white">Technical Analysis 101</div>
            <div className="mt-1 text-xs text-ink-400">12 lessons · 2h 40m</div>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-ink-300">
              <XPIcon size={16} /> 450 XP <span className="ml-auto text-gold">★ 4.9</span>
            </div>
            <Btn variant={enrolled ? "bull" : "azure"} size="sm" block className="mt-3" onClick={() => setEnrolled((e) => !e)}>
              {enrolled ? <><Icon name="check" size={14} stroke={3} /> Enrolled</> : "Start course"}
            </Btn>
          </div>
        </div>
        {/* Progress card */}
        <div className="panel-raised rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <Chip tone="violet">In progress</Chip>
            <Icon name="more" size={18} className="text-ink-400" />
          </div>
          <div className="mt-3 font-display text-sm font-black text-white">DeFi Fundamentals</div>
          <div className="text-xs text-ink-400">Liquidity pools & AMMs</div>
          <div className="mt-4 flex items-center justify-between text-[11px] font-bold">
            <span className="text-ink-300">Progress</span>
            <span className="text-violet">60%</span>
          </div>
          <div className="panel-inset mt-1.5 h-3 overflow-hidden rounded-full">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-violet to-[#c2b0ff]" />
          </div>
          <div className="mt-4 flex -space-x-2">
            {["#ff7a2f", "#3e8bff", "#22d39a"].map((c) => (
              <span key={c} className="h-7 w-7 rounded-full ring-2 ring-ink-700" style={{ background: c }} />
            ))}
            <span className="pl-4 text-[11px] font-bold text-ink-400">+2.1k learners</span>
          </div>
          <Btn variant="violet" size="sm" block className="mt-4">
            <Icon name="play" size={14} /> Continue
          </Btn>
        </div>
        {/* Flashcard */}
        <button onClick={() => setFlip((f) => !f)} className="relative h-full min-h-[280px] [perspective:900px]">
          <div className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flip ? "rotateY(180deg)" : "none" }}>
            <div className="panel-raised absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-5 [backface-visibility:hidden]">
              <Chip tone="azure">Flashcard</Chip>
              <div className="mt-4 font-display text-3xl font-black text-white">RSI</div>
              <div className="mt-2 text-xs text-ink-400">Tap to reveal</div>
              <Icon name="refresh" size={18} className="mt-5 text-ink-500" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-azure to-azure-dark p-5 text-center shadow-[0_5px_0_#123a8a] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="font-display text-base font-black text-white">Relative Strength Index</div>
              <div className="mt-2 text-xs font-semibold text-white/85">Momentum oscillator 0–100. Above 70 = overbought, below 30 = oversold.</div>
            </div>
          </div>
        </button>
        {/* News card */}
        <div className="panel-raised flex flex-col rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex items-center gap-2">
            <Chip tone="flame"><FlameIcon size={12} /> Breaking</Chip>
            <span className="text-[10px] font-bold text-ink-500">2m ago</span>
          </div>
          <div className="mt-3 font-display text-sm font-black leading-snug text-white">ETH ETF inflows hit record $1.2B in a single day</div>
          <div className="mt-2 text-xs text-ink-400">What does institutional demand mean for price action? Quick 2-min lesson.</div>
          <div className="mt-auto flex items-center gap-3 pt-4">
            <button
              onClick={() => {
                setLiked((l) => !l);
                setLikes((n) => n + (liked ? -1 : 1));
                haptic();
              }}
              className={cn("flex items-center gap-1 text-xs font-bold transition", liked ? "text-bear" : "text-ink-400 hover:text-white")}
            >
              <svg key={String(liked)} width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" className={liked ? "anim-pop" : ""}>
                <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
              </svg>
              {likes}
            </button>
            <span className="flex items-center gap-1 text-xs font-bold text-ink-400"><CoinIcon size={16} /> +5</span>
            <Btn variant="ghost" size="sm" className="ml-auto">Read</Btn>
          </div>
        </div>
      </div>
    </Asset>
  );
}

export default function DataDisplay() {
  return (
    <Section id="data" index="06" kicker="Markets & content" title="Trading & Data Display">
      <Ticker />
      <CandleChart />
      <OrderBook />
      <AssetTile />
      <Portfolio />
      <Watchlist />
      <Table />
      <BadgesAvatars />
      <Cards />
    </Section>
  );
}
