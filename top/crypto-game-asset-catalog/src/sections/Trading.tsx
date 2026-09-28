import { useEffect, useMemo, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Star } from "lucide-react";
import { Asset, Section, Btn, Chip } from "../kit/ui";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

function useWalk(start: number, vol: number, ms = 1000, len = 40) {
  const [s, setS] = useState(() => { const a = [start]; for (let i = 1; i < len; i++) a.push(a[i - 1] * (1 + (Math.random() - 0.5) * vol)); return a; });
  useEffect(() => { const t = setInterval(() => setS((a) => [...a.slice(1), a[a.length - 1] * (1 + (Math.random() - 0.48) * vol)]), ms); return () => clearInterval(t); }, [vol, ms]);
  return s;
}

function Spark({ data, color, h = 40, fill = true }: { data: number[]; color: string; h?: number; fill?: boolean }) {
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  const id = useMemo(() => "g" + Math.random().toString(36).slice(2), []);
  return (
    <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" className="block w-full" style={{ height: h }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {fill && <polygon points={`0,${h} ${pts} 100,${h}`} fill={`url(#${id})`} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

const coins = [
  { s: "BTC", n: "Bitcoin", p: 64218, v: 0.004, c: "#f7931a" },
  { s: "ETH", n: "Ethereum", p: 3142, v: 0.006, c: "#8b9dff" },
  { s: "SOL", n: "Solana", p: 148.2, v: 0.01, c: "#22d39a" },
];
function PriceCard({ coin, active, onClick }: { coin: (typeof coins)[number]; active: boolean; onClick: () => void }) {
  const d = useWalk(coin.p, coin.v, 1100);
  const last = d[d.length - 1], prev = d[d.length - 2];
  const ch = ((last - d[0]) / d[0]) * 100;
  const up = ch >= 0, tickUp = last >= prev;
  const col = up ? "#22d39a" : "#ff4f6d";
  const [fav, setFav] = useState(false);
  return (
    <button onClick={onClick} className={cn("w-full rounded-2xl border-2 p-3 text-left transition-all", active ? "border-sky bg-sky/10 shadow-[0_4px_0_#2152c4]" : "border-transparent bg-ink-800/70 shadow-[0_4px_0_#08112a] hover:bg-ink-700")}>
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-xl text-[11px] font-black text-ink-900 shadow-[inset_0_2px_0_rgba(255,255,255,.4),0_3px_0_rgba(0,0,0,.35)]" style={{ background: coin.c }}>{coin.s[0]}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm font-extrabold">{coin.s}<span className="text-[10px] font-semibold text-mist">{coin.n}</span></div>
          <div key={last} className={cn("num text-[13px] font-bold transition-colors", tickUp ? "text-bull" : "text-bear")} style={{ animation: "fade-in .3s" }}>${last.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        <div className="w-16"><Spark data={d.slice(-20)} color={col} h={28} fill={false} /></div>
        <div className="w-16 text-right">
          <span className="num inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-extrabold" style={{ color: col, background: `${col}1c` }}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{Math.abs(ch).toFixed(2)}%
          </span>
        </div>
        <span role="button" onClick={(e) => { e.stopPropagation(); setFav(!fav); sfx.toggle(!fav); }} className="p-1">
          <Star size={16} className={cn("transition", fav ? "anim-pop fill-gold text-gold" : "text-ink-400")} />
        </span>
      </div>
    </button>
  );
}
function Markets() {
  const [a, setA] = useState(0);
  const tape = ["BTC +2.14%", "ETH −0.82%", "SOL +5.31%", "TON +1.02%", "DOGE −3.4%", "XRP +0.6%", "AVAX +2.9%", "LINK −1.1%"];
  return (
    <Asset code="E-001" title="Live Market List + Ticker" desc="Лента котировок, живые цены со вспышкой тика, спарклайны и избранное." hint="Выбери рынок, отметь ★" specs={["1.1s tick", "flash", "spark"]}>
      <div className="panel-inset mb-4 overflow-hidden !rounded-xl py-2">
        <div className="flex w-max gap-6 whitespace-nowrap" style={{ animation: "ticker 18s linear infinite" }}>
          {[...tape, ...tape].map((t, i) => (
            <span key={i} className={cn("num text-[11px] font-bold", t.includes("−") ? "text-bear" : "text-bull")}>● {t}</span>
          ))}
        </div>
      </div>
      <div className="space-y-2.5">
        {coins.map((c, i) => <PriceCard key={c.s} coin={c} active={a === i} onClick={() => { setA(i); sfx.tick(); }} />)}
      </div>
    </Asset>
  );
}

type C = { o: number; h: number; l: number; c: number; v: number };
function genCandles(n: number, vol: number) {
  const a: C[] = []; let p = 64000;
  for (let i = 0; i < n; i++) { const o = p, c = o * (1 + (Math.random() - 0.48) * vol); a.push({ o, c, h: Math.max(o, c) * (1 + Math.random() * vol * 0.5), l: Math.min(o, c) * (1 - Math.random() * vol * 0.5), v: Math.random() }); p = c; }
  return a;
}
function CandleChart() {
  const tfs = { "1m": 0.002, "15m": 0.005, "1H": 0.01, "1D": 0.03 } as const;
  const [tf, setTf] = useState<keyof typeof tfs>("15m");
  const data = useMemo(() => genCandles(32, tfs[tf]), [tf]);
  const [hover, setHover] = useState<number | null>(null);
  const [my, setMy] = useState(0);
  const ref = useRef<SVGSVGElement>(null);
  const W = 320, H = 170;
  const min = Math.min(...data.map((d) => d.l)), max = Math.max(...data.map((d) => d.h));
  const y = (v: number) => 8 + (1 - (v - min) / (max - min)) * (H - 50);
  const cw = W / data.length;
  const sel = data[hover ?? data.length - 1];
  const up = sel.c >= sel.o;
  return (
    <Asset code="E-002" title="Candlestick Chart" desc="Свечной график с объёмами, перекрестием, OHLC-плашкой и сменой таймфрейма." hint="Наведи на свечи" specs={["crosshair", "OHLC", "4 TF"]} className="md:col-span-2 xl:col-span-2">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="num flex gap-3 text-[11px] font-bold">
          {(["o", "h", "l", "c"] as const).map((k) => (
            <span key={k}><span className="uppercase text-mist">{k} </span><span className={up ? "text-bull" : "text-bear"}>{sel[k].toFixed(0)}</span></span>
          ))}
        </div>
        <div className="panel-inset ml-auto flex gap-1 p-1 !rounded-xl">
          {(Object.keys(tfs) as (keyof typeof tfs)[]).map((t) => (
            <button key={t} onClick={() => { setTf(t); sfx.tick(); }} className={cn("num h-7 rounded-lg px-2.5 text-[11px] font-bold transition", tf === t ? "bg-sky text-white shadow-[0_2px_0_#2152c4]" : "text-mist hover:text-white")}>{t}</button>
          ))}
        </div>
      </div>
      <div className="grid-bg panel-inset relative overflow-hidden !rounded-2xl">
        <svg
          ref={ref}
          key={tf}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-64 w-full cursor-crosshair"
          preserveAspectRatio="none"
          onPointerMove={(e) => {
            const r = ref.current!.getBoundingClientRect();
            const i = Math.floor(((e.clientX - r.left) / r.width) * data.length);
            setHover(Math.max(0, Math.min(data.length - 1, i)));
            setMy(((e.clientY - r.top) / r.height) * H);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {data.map((d, i) => {
            const x = i * cw + cw / 2, u = d.c >= d.o, col = u ? "#22d39a" : "#ff4f6d";
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.45} style={{ transformOrigin: `${x}px ${H}px`, animation: `bar-grow .5s ${i * 15}ms both cubic-bezier(.3,1.3,.5,1)` }}>
                <rect x={x - cw * 0.35} y={H - d.v * 30} width={cw * 0.7} height={d.v * 30} fill={col} opacity=".25" />
                <rect x={x - 0.6} y={y(d.h)} width="1.2" height={y(d.l) - y(d.h)} fill={col} />
                <rect x={x - cw * 0.32} y={y(Math.max(d.o, d.c))} width={cw * 0.64} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="1.5" fill={col} />
              </g>
            );
          })}
          {hover !== null && (
            <g pointerEvents="none">
              <line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1="0" y2={H} stroke="#8a9bc4" strokeDasharray="3 3" strokeWidth=".6" />
              <line x1="0" x2={W} y1={my} y2={my} stroke="#8a9bc4" strokeDasharray="3 3" strokeWidth=".6" />
            </g>
          )}
          <line x1="0" x2={W} y1={y(data[data.length - 1].c)} y2={y(data[data.length - 1].c)} stroke="#ffc53d" strokeWidth=".6" strokeDasharray="2 3" />
        </svg>
        {hover !== null && (
          <div className="num pointer-events-none absolute right-2 rounded-md bg-ink-600 px-1.5 py-0.5 text-[10px] font-bold" style={{ top: `calc(${(my / H) * 100}% - 10px)` }}>
            {(max - ((my - 8) / (H - 50)) * (max - min)).toFixed(0)}
          </div>
        )}
        <div className="num absolute right-2 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-extrabold text-ink-900" style={{ top: `calc(${(y(data[data.length - 1].c) / H) * 100}% - 9px)` }}>{data[data.length - 1].c.toFixed(0)}</div>
      </div>
    </Asset>
  );
}

function OrderBook() {
  const [mid, setMid] = useState(64218);
  const [rows, setRows] = useState(() => gen());
  const [picked, setPicked] = useState<number | null>(null);
  function gen() { return { asks: [...Array(6)].map(() => Math.random()), bids: [...Array(6)].map(() => Math.random()) }; }
  useEffect(() => { const t = setInterval(() => { setRows(gen()); setMid((m) => m + (Math.random() - 0.5) * 12); }, 900); return () => clearInterval(t); }, []);
  const Row = ({ price, size, side }: { price: number; size: number; side: "a" | "b" }) => {
    const col = side === "a" ? "#ff4f6d" : "#22d39a";
    return (
      <button onClick={() => { setPicked(price); sfx.tick(); }} className="num relative grid h-7 w-full grid-cols-3 items-center rounded-md px-2 text-[11px] font-bold transition hover:bg-white/5">
        <span className="absolute inset-y-0.5 right-0 rounded-md transition-all duration-700" style={{ width: `${size * 100}%`, background: `${col}22` }} />
        <span className="relative text-left" style={{ color: col }}>{price.toFixed(1)}</span>
        <span className="relative text-right text-snow/80">{(size * 2).toFixed(3)}</span>
        <span className="relative text-right text-mist">{(size * price * 2 / 1000).toFixed(1)}k</span>
      </button>
    );
  };
  return (
    <Asset code="E-003" title="Order Book Depth" desc="Стакан с живыми барами глубины, спредом; клик по строке подставляет цену." hint="Кликни уровень цены" specs={["900ms", "depth bars", "spread"]}>
      <div className="num mb-1 grid grid-cols-3 px-2 text-[9px] font-bold uppercase text-mist"><span>Price</span><span className="text-right">Size</span><span className="text-right">Total</span></div>
      <div className="space-y-0.5">{rows.asks.map((s, i) => <div key={`a${i}`}>{Row({ side: "a", size: s, price: mid + (6 - i) * 4.5 })}</div>)}</div>
      <div className="panel-inset my-2 flex items-center justify-between px-3 py-2 !rounded-xl">
        <span className="num text-lg font-extrabold text-bull">{mid.toFixed(1)}</span>
        <Chip tone="gold">spread 4.5</Chip>
      </div>
      <div className="space-y-0.5">{rows.bids.map((s, i) => <div key={`b${i}`}>{Row({ side: "b", size: s, price: mid - (i + 1) * 4.5 })}</div>)}</div>
      <div className="mt-3 flex h-8 items-center justify-center text-[12px] font-bold">
        {picked ? <span key={picked} className="anim-pop">Limit price → <span className="num text-sky">{picked.toFixed(1)}</span></span> : <span className="text-mist">Выбери цену лимит-ордера</span>}
      </div>
    </Asset>
  );
}

function Position() {
  const entry = 64000;
  const d = useWalk(64600, 0.003, 800, 30);
  const px = d[d.length - 1];
  const [tp, setTp] = useState(8);
  const [sl, setSl] = useState(3);
  const [closed, setClosed] = useState<number | null>(null);
  const size = 0.25, lev = 10;
  const pnl = (px - entry) * size;
  const roe = ((px - entry) / entry) * 100 * lev;
  const up = pnl >= 0;
  return (
    <Asset code="E-004" title="Open Position Card" desc="Позиция с живым PnL/ROE, TP/SL-ползунками и закрытием в один тап." hint="Двигай TP/SL, закрой" specs={["live PnL", "TP/SL", "close"]}>
      {closed === null ? (
        <>
          <div className="flex items-center gap-2">
            <Chip tone="bull">Long {lev}x</Chip>
            <span className="text-sm font-extrabold">BTC/USDT</span>
            <span className="num ml-auto text-[11px] text-mist">{size} BTC</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-mist">Unrealized PnL</div>
              <div className={cn("num text-3xl font-extrabold transition-colors", up ? "text-bull" : "text-bear")} style={{ textShadow: `0 0 18px ${up ? "#22d39a55" : "#ff4f6d55"}` }}>{up ? "+" : ""}{pnl.toFixed(2)}</div>
            </div>
            <div className={cn("num rounded-xl px-2.5 py-1 text-sm font-extrabold", up ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>{up ? "+" : ""}{roe.toFixed(1)}%</div>
          </div>
          <div className="mt-2"><Spark data={d} color={up ? "#22d39a" : "#ff4f6d"} h={44} /></div>
          <div className="num mt-2 grid grid-cols-3 gap-2 text-center text-[10px]">
            {[["Entry", entry.toFixed(0), "text-snow"], ["Mark", px.toFixed(0), "text-sky"], ["Liq.", (entry * 0.904).toFixed(0), "text-bear"]].map(([a, b, c]) => (
              <div key={a} className="panel-inset py-1.5"><div className="font-bold uppercase text-mist">{a}</div><div className={cn("text-[12px] font-extrabold", c)}>{b}</div></div>
            ))}
          </div>
          {[["Take profit", tp, setTp, "#22d39a", 20], ["Stop loss", sl, setSl, "#ff4f6d", 10]].map(([l, v, set, c, mx]) => (
            <div key={l as string} className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-bold"><span style={{ color: c as string }}>{l as string}</span><span className="num">{(l as string).startsWith("T") ? "+" : "−"}{v as number}% · ${(entry * (1 + ((l as string).startsWith("T") ? 1 : -1) * (v as number) / 100)).toFixed(0)}</span></div>
              <input type="range" min={1} max={mx as number} value={v as number} onChange={(e) => { (set as (n: number) => void)(+e.target.value); sfx.tick(); }} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: c as string, background: `linear-gradient(90deg, ${c} ${((v as number) / (mx as number)) * 100}%, #0b1530 0)` }} />
            </div>
          ))}
          <Btn tone="bear" block className="mt-4" onClick={() => { setClosed(pnl); pnl >= 0 ? sfx.coin() : sfx.wrong(); }} silent>Close position</Btn>
        </>
      ) : (
        <div className="anim-pop flex flex-col items-center py-8 text-center">
          <div className="text-[11px] font-bold uppercase text-mist">Realized PnL</div>
          <div className={cn("num text-4xl font-extrabold", closed >= 0 ? "text-bull" : "text-bear")}>{closed >= 0 ? "+" : ""}${closed.toFixed(2)}</div>
          <p className="mt-2 text-[12px] text-mist">Сделка закрыта и записана в журнал.</p>
          <Btn tone="sky" size="sm" className="mt-4" onClick={() => setClosed(null)}>Reopen demo</Btn>
        </div>
      )}
    </Asset>
  );
}

const alloc = [
  { s: "BTC", v: 46, c: "#f7931a" },
  { s: "ETH", v: 24, c: "#8b9dff" },
  { s: "SOL", v: 14, c: "#22d39a" },
  { s: "USDT", v: 16, c: "#3a5494" },
];
function Portfolio() {
  const [h, setH] = useState<number | null>(null);
  const [off, setOff] = useState<string[]>([]);
  const vis = alloc.filter((a) => !off.includes(a.s));
  const tot = vis.reduce((s, a) => s + a.v, 0) || 1;
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  const cur = h !== null ? vis[h] : null;
  return (
    <Asset code="E-005" title="Portfolio Donut" desc="Аллокация портфеля: ховер выделяет сегмент, клик в легенде скрывает актив." hint="Наведи на сегмент" specs={["hover lift", "toggle", "animated"]}>
      <div className="flex items-center gap-5">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 140 140" className="-rotate-90">
            <circle cx="70" cy="70" r={R} stroke="#0b1530" strokeWidth="20" fill="none" />
            {vis.map((a, i) => {
              const len = (a.v / tot) * C;
              const el = (
                <circle key={a.s} cx="70" cy="70" r={R} fill="none" stroke={a.c} strokeWidth={h === i ? 26 : 20} strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-acc} onPointerEnter={() => { setH(i); sfx.soft(); }} onPointerLeave={() => setH(null)} className="cursor-pointer" style={{ transition: "all .5s cubic-bezier(.3,1.3,.5,1)", filter: h === i ? `drop-shadow(0 0 8px ${a.c})` : undefined }} />
              );
              acc += len;
              return el;
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div key={cur?.s ?? "t"} className="anim-pop">
              <div className="text-[10px] font-bold uppercase text-mist">{cur ? cur.s : "Total"}</div>
              <div className="num text-lg font-extrabold">{cur ? `${Math.round((cur.v / tot) * 100)}%` : "$12,480"}</div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {alloc.map((a) => {
            const o = off.includes(a.s);
            return (
              <button key={a.s} onClick={() => { setOff(o ? off.filter((x) => x !== a.s) : [...off, a.s]); sfx.toggle(o); }} className={cn("flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-[12px] font-bold transition hover:bg-white/5", o && "opacity-35")}>
                <span className="h-3 w-3 rounded" style={{ background: a.c }} />{a.s}<span className="num ml-auto text-mist">{a.v}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

function FearGreed() {
  const [v, setV] = useState(68);
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(v), 60); return () => clearTimeout(t); }, [v]);
  const lbl = v < 25 ? ["Extreme fear", "#ff4f6d"] : v < 45 ? ["Fear", "#ff8a3d"] : v < 55 ? ["Neutral", "#ffc53d"] : v < 75 ? ["Greed", "#8fe36b"] : ["Extreme greed", "#22d39a"];
  const ang = -90 + (shown / 100) * 180;
  return (
    <Asset code="E-006" title="Fear & Greed Gauge" desc="Индикатор настроения рынка с пружинящей стрелкой. Кликни по шкале." hint="Кликни по дуге" specs={["spring needle", "5 zones"]}>
      <div className="relative mx-auto w-full max-w-[260px]">
        <svg viewBox="0 0 200 116" className="w-full cursor-pointer" onClick={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 200 - 100, y = 100 - ((e.clientY - r.top) / r.height) * 116;
          const a = Math.atan2(y, x); setV(Math.round(Math.max(0, Math.min(100, (1 - a / Math.PI) * 100)))); sfx.tick();
        }}>
          <defs><linearGradient id="fg" x1="0" x2="1"><stop stopColor="#ff4f6d" /><stop offset=".35" stopColor="#ff8a3d" /><stop offset=".5" stopColor="#ffc53d" /><stop offset=".75" stopColor="#8fe36b" /><stop offset="1" stopColor="#22d39a" /></linearGradient></defs>
          <path d="M20 100a80 80 0 01160 0" stroke="#0b1530" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M20 100a80 80 0 01160 0" stroke="url(#fg)" strokeWidth="16" fill="none" strokeLinecap="round" />
          {[...Array(11)].map((_, i) => { const a = Math.PI - (i / 10) * Math.PI; return <line key={i} x1={100 + Math.cos(a) * 62} y1={100 - Math.sin(a) * 62} x2={100 + Math.cos(a) * 67} y2={100 - Math.sin(a) * 67} stroke="#3a5494" strokeWidth="2" />; })}
          <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: "100px 100px", transition: "transform .9s cubic-bezier(.3,1.7,.5,1)" }}>
            <path d="M97 100L100 36l3 64z" fill="#fff" />
          </g>
          <circle cx="100" cy="100" r="9" fill="#e8eeff" stroke="#0b1530" strokeWidth="3" />
        </svg>
      </div>
      <div className="text-center">
        <div className="num text-4xl font-extrabold" style={{ color: lbl[1] }}>{v}</div>
        <div key={lbl[0]} className="anim-pop font-display text-sm font-bold" style={{ color: lbl[1] }}>{lbl[0]}</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[["Panic", 12], ["Calm", 50], ["FOMO", 90]].map(([l, n]) => (
          <button key={l} onClick={() => { setV(n as number); sfx.tap(); }} className="h-9 rounded-xl bg-ink-800 text-[11px] font-extrabold text-mist shadow-[0_3px_0_#08112a] hover:text-white active:translate-y-[3px] active:shadow-none">{l}</button>
        ))}
      </div>
    </Asset>
  );
}

export default function Trading() {
  return (
    <Section id="trading" index="05" title="Trading Simulator" subtitle="Живые рыночные виджеты для симулятора без риска">
      <Markets />
      <CandleChart />
      <OrderBook />
      <Position />
      <Portfolio />
      <FearGreed />
    </Section>
  );
}
