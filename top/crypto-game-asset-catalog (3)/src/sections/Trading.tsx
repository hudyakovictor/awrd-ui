import { useMemo, useRef, useState } from "react";
import { AssetCard, Btn, Burst, Confetti, Icon, Label, Section, useBump, useCountUp, useInterval, useKit } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { cn } from "../utils/cn";

type C = { o: number; h: number; l: number; c: number };
function genCandles(n: number, start = 64000): C[] {
  const out: C[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + (Math.random() - 0.47) * 260;
    out.push({ o, c, h: Math.max(o, c) + Math.random() * 120, l: Math.min(o, c) - Math.random() * 120 });
    p = c;
  }
  return out;
}

/* ───────── LIVE CHART ───────── */
function LiveChart() {
  const [data, setData] = useState(() => genCandles(32));
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [tf, setTf] = useState("15m");
  const [paused, setPaused] = useState(false);
  useInterval(() => {
    setTick((t) => t + 1);
    setData((d) => {
      const last = d[d.length - 1];
      if ((tick + 1) % 6 === 0) {
        const o = last.c;
        return [...d.slice(1), { o, c: o, h: o, l: o }];
      }
      const c = last.c + (Math.random() - 0.48) * 90;
      return [...d.slice(0, -1), { ...last, c, h: Math.max(last.h, c), l: Math.min(last.l, c) }];
    });
  }, paused ? null : 450);
  const W = 340, H = 180;
  const max = Math.max(...data.map((d) => d.h)), min = Math.min(...data.map((d) => d.l));
  const y = (v: number) => 8 + ((max - v) / (max - min || 1)) * (H - 16);
  const cw = W / data.length;
  const last = data[data.length - 1];
  const up = last.c >= data[0].o;
  const chg = ((last.c - data[0].o) / data[0].o) * 100;
  const hv = hover !== null ? data[hover] : null;
  return (
    <AssetCard id="TRD-01" title="Live Candlestick Chart" desc="Реалтайм-свечи, линия текущей цены, кроссхейр с OHLC по наведению, пауза и таймфреймы." tags={["chart", "candles", "realtime"]} className="md:col-span-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-[#ffb547] to-[#f7931a] font-extrabold text-white shadow-[0_3px_0_#b36200]">₿</span>
          <div>
            <div className="text-xs font-bold text-ink-400">BTC / USDT</div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-extrabold tabular-nums text-white">{last.c.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</span>
              <span className={cn("rounded-md px-1.5 font-mono text-xs font-extrabold", up ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>{up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="well flex rounded-xl p-1">
            {["1m", "15m", "1h", "4h", "1d"].map((t) => (
              <button key={t} onClick={() => { setTf(t); setData(genCandles(32, last.c)); }} className={cn("rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition", tf === t ? "raised text-white" : "text-ink-400 hover:text-ink-200")}>{t}</button>
            ))}
          </div>
          <Btn v="dark" size="icon" onClick={() => setPaused(!paused)} aria-label="pause">
            {paused ? <Icon name="play" size={16} variant="solid" /> : <span className="flex gap-1"><span className="h-3.5 w-1 rounded bg-current" /><span className="h-3.5 w-1 rounded bg-current" /></span>}
          </Btn>
        </div>
      </div>
      <div className="relative">
        <svg viewBox={`0 0 ${W + 56} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * (W + 56); setHover(x < W ? Math.min(data.length - 1, Math.floor(x / cw)) : null); }}>
          <defs>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={up ? "#2ee59d" : "#ff4d6a"} stopOpacity=".18" /><stop offset="1" stopColor={up ? "#2ee59d" : "#ff4d6a"} stopOpacity="0" /></linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#ffffff0d" strokeDasharray="3 5" />)}
          <path d={`M0 ${H} ` + data.map((d, i) => `L${i * cw + cw / 2} ${y(d.c)}`).join(" ") + ` L${W} ${H} Z`} fill="url(#area)" />
          {data.map((d, i) => {
            const g = d.c >= d.o;
            const col = g ? "#2ee59d" : "#ff4d6a";
            const x = i * cw + cw / 2;
            return (
              <g key={i} opacity={hover === null || hover === i ? 1 : 0.45} className="transition-opacity">
                <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.4" />
                <rect x={x - cw * 0.32} width={cw * 0.64} y={y(Math.max(d.o, d.c))} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="1.5" fill={col} style={i === data.length - 1 ? { filter: `drop-shadow(0 0 4px ${col})` } : undefined} />
              </g>
            );
          })}
          <line x1="0" x2={W} y1={y(last.c)} y2={y(last.c)} stroke={up ? "#2ee59d" : "#ff4d6a"} strokeDasharray="4 3" strokeWidth="1" />
          <g transform={`translate(${W + 2}, ${y(last.c) - 9})`}>
            <rect width="52" height="18" rx="5" fill={up ? "#2ee59d" : "#ff4d6a"} />
            <text x="26" y="12.5" textAnchor="middle" fontSize="9" fontWeight="800" fontFamily="JetBrains Mono" fill="#0a1330">{last.c.toFixed(0)}</text>
          </g>
          {hover !== null && <line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1="0" y2={H} stroke="#ffffff55" strokeDasharray="2 3" />}
        </svg>
        {hv && (
          <div className="glass pointer-events-none absolute left-2 top-2 rounded-xl px-3 py-2 font-mono text-[10px] font-bold">
            {(["o", "h", "l", "c"] as const).map((k) => <span key={k} className="mr-2"><span className="uppercase text-ink-400">{k}</span> <span className={hv.c >= hv.o ? "text-bull" : "text-bear"}>{hv[k].toFixed(0)}</span></span>)}
          </div>
        )}
      </div>
    </AssetCard>
  );
}

/* ───────── PREDICT GAME ───────── */
function Predict() {
  const [phase, setPhase] = useState<"pick" | "wait" | "win" | "lose">("pick");
  const [pick, setPick] = useState<"up" | "down" | null>(null);
  const [t, setT] = useState(5);
  const [price, setPrice] = useState(3412.4);
  const [entry, setEntry] = useState(0);
  const [streak, setStreak] = useState(2);
  const [c, conf] = useBump();
  const [pts, setPts] = useState<number[]>(() => Array.from({ length: 30 }, (_, i) => 3412 + Math.sin(i / 3) * 4));
  useInterval(() => {
    const np = price + (Math.random() - 0.5) * 3.2;
    setPrice(np);
    setPts((p) => [...p.slice(1), np]);
  }, 250);
  useInterval(() => {
    if (t <= 1) {
      const won = pick === "up" ? price > entry : price < entry;
      setPhase(won ? "win" : "lose");
      if (won) { setStreak((s) => s + 1); conf(); } else setStreak(0);
      setT(0);
    } else setT(t - 1);
  }, phase === "wait" ? 1000 : null);
  const go = (p: "up" | "down") => { setPick(p); setEntry(price); setT(5); setPhase("wait"); };
  const mn = Math.min(...pts), mx = Math.max(...pts);
  const path = pts.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * 300} ${10 + ((mx - v) / (mx - mn || 1)) * 80}`).join(" ");
  const ey = 10 + ((mx - entry) / (mx - mn || 1)) * 80;
  const R = 26, L = 2 * Math.PI * R;
  return (
    <AssetCard id="TRD-02" title="Predict: Up or Down" desc="Мини-игра прогноза: 5 секунд, кольцо таймера, линия входа, серия побед с множителем." tags={["minigame", "prediction", "timer"]} stageClass="overflow-hidden">
      <Confetti trigger={c} count={36} />
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-ink-400">ETH · 5s round</span>
        <span className="flex items-center gap-1 rounded-full bg-flame/15 px-2 py-0.5 font-mono text-xs font-extrabold text-flame"><Icon name="flame" size={14} variant="solid" />×{streak}</span>
      </div>
      <div className="relative">
        <svg viewBox="0 0 300 100" className="h-28 w-full">
          <path d={path} fill="none" stroke="#3d8bff" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px #3d8bff)" }} />
          {phase !== "pick" && <line x1="0" x2="300" y1={ey} y2={ey} stroke="#ffc53d" strokeDasharray="5 4" />}
          <circle cx="300" cy={10 + ((mx - price) / (mx - mn || 1)) * 80} r="4" fill="#fff" />
        </svg>
        {phase === "wait" && (
          <div className="absolute right-0 top-0 grid h-16 w-16 place-items-center">
            <svg width="64" height="64" className="absolute -rotate-90"><circle cx="32" cy="32" r={R} stroke="#0a1433" strokeWidth="6" fill="none" /><circle cx="32" cy="32" r={R} stroke="#ffc53d" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - t / 5)} style={{ transition: "stroke-dashoffset 1s linear" }} /></svg>
            <span key={t} className="anim-pop font-mono text-xl font-extrabold text-gold">{t}</span>
          </div>
        )}
      </div>
      <div className="my-2 text-center font-mono text-2xl font-extrabold tabular-nums text-white">${price.toFixed(2)}</div>
      {phase === "pick" && (
        <div className="grid grid-cols-2 gap-3">
          <Btn v="bull" size="lg" onClick={() => go("up")}><Icon name="up" size={20} stroke={3} />Up</Btn>
          <Btn v="bear" size="lg" onClick={() => go("down")}><Icon name="down" size={20} stroke={3} />Down</Btn>
        </div>
      )}
      {phase === "wait" && (
        <div className={cn("rounded-2xl py-3.5 text-center text-sm font-extrabold uppercase tracking-wider", pick === "up" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
          You picked {pick} · {(pick === "up" ? price > entry : price < entry) ? "winning" : "losing"}…
        </div>
      )}
      {(phase === "win" || phase === "lose") && (
        <div className="anim-pop flex items-center gap-3">
          <Mascot mood={phase === "win" ? "happy" : "sad"} size={56} />
          <div className="flex-1">
            <div className={cn("text-lg font-extrabold", phase === "win" ? "text-bull" : "text-bear")}>{phase === "win" ? `+${10 * streak} XP` : "Streak lost"}</div>
            <div className="text-xs text-ink-300">{phase === "win" ? "Тренд — твой друг." : "Рынок в краткосроке — шум."}</div>
          </div>
          <Btn v="sky" size="sm" onClick={() => setPhase("pick")}>Again</Btn>
        </div>
      )}
    </AssetCard>
  );
}

/* ───────── WATCHLIST ───────── */
const ASSETS = [
  { s: "BTC", n: "Bitcoin", p: 64250, c: "#f7931a" }, { s: "ETH", n: "Ethereum", p: 3412, c: "#8c8cff" },
  { s: "SOL", n: "Solana", p: 148.2, c: "#14f195" }, { s: "TON", n: "Toncoin", p: 6.84, c: "#0098ea" }, { s: "DOGE", n: "Dogecoin", p: 0.162, c: "#c2a633" },
];
function Watchlist() {
  const [rows, setRows] = useState(() => ASSETS.map((a) => ({ ...a, prev: a.p, open: a.p, hist: Array.from({ length: 20 }, () => a.p * (1 + (Math.random() - 0.5) * 0.02)), k: 0 })));
  const [star, setStar] = useState<string[]>(["BTC"]);
  useInterval(() => {
    setRows((rs) => rs.map((r) => {
      if (Math.random() < 0.45) return r;
      const np = r.p * (1 + (Math.random() - 0.49) * 0.004);
      return { ...r, prev: r.p, p: np, hist: [...r.hist.slice(1), np], k: r.k + 1 };
    }));
  }, 900);
  const fmt = (v: number) => (v < 1 ? v.toFixed(4) : v < 100 ? v.toFixed(2) : v.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 }));
  return (
    <AssetCard id="TRD-03" title="Watchlist & Ticker Tape" desc="Живые котировки со вспышками изменений, спарклайнами и избранным. Бегущая строка сверху." tags={["ticker", "watchlist", "sparkline"]} stageClass="p-0 overflow-hidden">
      <div className="overflow-hidden border-b border-white/5 bg-ink-950/60 py-2">
        <div className="flex w-max gap-6 whitespace-nowrap font-mono text-[11px] font-bold" style={{ animation: "marquee 18s linear infinite" }}>
          {[...rows, ...rows].map((r, i) => {
            const ch = ((r.p - r.open) / r.open) * 100;
            return <span key={i} className="text-ink-300">{r.s} <span className="text-white">{fmt(r.p)}</span> <span className={ch >= 0 ? "text-bull" : "text-bear"}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</span></span>;
          })}
        </div>
      </div>
      <div className="p-2">
        {rows.map((r) => {
          const ch = ((r.p - r.open) / r.open) * 100;
          const up = r.p >= r.prev;
          const mn = Math.min(...r.hist), mx = Math.max(...r.hist);
          const sp = r.hist.map((v, i) => `${i ? "L" : "M"}${i * 3.2} ${22 - ((v - mn) / (mx - mn || 1)) * 20}`).join(" ");
          return (
            <div key={r.s} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[.03]">
              <button onClick={() => setStar(star.includes(r.s) ? star.filter((x) => x !== r.s) : [...star, r.s])}>
                <Icon name="star" size={16} variant={star.includes(r.s) ? "solid" : "line"} className={star.includes(r.s) ? "anim-pop text-gold" : "text-ink-500"} />
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-full text-[10px] font-extrabold text-white" style={{ background: r.c, boxShadow: `0 2px 0 ${r.c}99` }}>{r.s.slice(0, 3)}</span>
              <div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-white">{r.s}</div><div className="text-[11px] text-ink-400">{r.n}</div></div>
              <svg width="62" height="24"><path d={sp} fill="none" stroke={ch >= 0 ? "#2ee59d" : "#ff4d6a"} strokeWidth="1.8" /></svg>
              <div className="w-24 text-right">
                <div key={r.k} className={cn("rounded px-1 font-mono text-sm font-extrabold tabular-nums text-white", r.k > 0 && (up ? "anim-flash-up" : "anim-flash-down"))}>{fmt(r.p)}</div>
                <div className={cn("font-mono text-[11px] font-bold", ch >= 0 ? "text-bull" : "text-bear")}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ───────── PORTFOLIO DONUT ───────── */
const PORT = [
  { s: "BTC", v: 45, c: "#f7931a" }, { s: "ETH", v: 25, c: "#8c8cff" }, { s: "SOL", v: 15, c: "#14f195" }, { s: "USDT", v: 10, c: "#26a17b" }, { s: "Other", v: 5, c: "#5a70ad" },
];
function Portfolio() {
  const [h, setH] = useState<number | null>(null);
  const total = 12480;
  const val = useCountUp(h === null ? total : (total * PORT[h].v) / 100, 500);
  const R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <AssetCard id="TRD-04" title="Portfolio Allocation" desc="Донат с выдвигающимися сегментами по наведению и анимированной суммой в центре." tags={["portfolio", "donut", "dataviz"]}>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r={R} fill="none" stroke="#0a1433" strokeWidth="24" />
            {PORT.map((p, i) => {
              const len = (p.v / 100) * C;
              const off = acc; acc += len;
              const mid = ((off + len / 2) / C) * Math.PI * 2;
              const push = h === i ? 7 : 0;
              return (
                <circle key={p.s} cx="90" cy="90" r={R} fill="none" stroke={p.c} strokeWidth={h === i ? 28 : 22}
                  strokeDasharray={`${len - 3} ${C - len + 3}`} strokeDashoffset={-off}
                  onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} onClick={() => setH(h === i ? null : i)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ transform: `translate(${Math.cos(mid) * push}px, ${Math.sin(mid) * push}px)`, filter: h === i ? `drop-shadow(0 0 8px ${p.c})` : undefined, opacity: h === null || h === i ? 1 : 0.4 }} />
              );
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">{h === null ? "Total" : PORT[h].s}</div>
              <div className="font-mono text-xl font-extrabold text-white">${Math.round(val).toLocaleString()}</div>
              <div className="font-mono text-[11px] font-bold text-bull">{h === null ? "+8.4%" : `${PORT[h].v}%`}</div>
            </div>
          </div>
        </div>
        <div className="w-full flex-1 space-y-1.5">
          {PORT.map((p, i) => (
            <button key={p.s} onMouseEnter={() => setH(i)} onMouseLeave={() => setH(null)} className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition", h === i ? "bg-white/5" : "")}>
              <span className="h-3 w-3 rounded" style={{ background: p.c, boxShadow: `0 0 8px ${p.c}` }} />
              <span className="flex-1 text-left text-sm font-bold text-ink-100">{p.s}</span>
              <span className="font-mono text-xs font-bold text-ink-300">{p.v}%</span>
            </button>
          ))}
        </div>
      </div>
    </AssetCard>
  );
}

/* ───────── FEAR & GREED ───────── */
function FearGreed() {
  const [v, setV] = useState(68);
  const a = -90 + (v / 100) * 180;
  const lbl = v < 25 ? ["Extreme Fear", "#ff4d6a"] : v < 45 ? ["Fear", "#ff8a3d"] : v < 55 ? ["Neutral", "#ffc53d"] : v < 75 ? ["Greed", "#8be36a"] : ["Extreme Greed", "#2ee59d"];
  const n = useCountUp(v, 900);
  return (
    <AssetCard id="TRD-05" title="Fear & Greed Gauge" desc="Спидометр настроения рынка: пружинящая стрелка, градиентная дуга, подсказка-урок." tags={["gauge", "sentiment", "meter"]}>
      <div className="relative mx-auto w-full max-w-[260px]">
        <svg viewBox="0 0 200 120" className="w-full">
          <defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stopColor="#ff4d6a" /><stop offset=".3" stopColor="#ff8a3d" /><stop offset=".5" stopColor="#ffc53d" /><stop offset=".75" stopColor="#8be36a" /><stop offset="1" stopColor="#2ee59d" /></linearGradient></defs>
          <path d="M20 105a80 80 0 0 1 160 0" stroke="#0a1433" strokeWidth="22" fill="none" strokeLinecap="round" />
          <path d="M20 105a80 80 0 0 1 160 0" stroke="url(#fg)" strokeWidth="16" fill="none" strokeLinecap="round" />
          {Array.from({ length: 11 }).map((_, i) => { const t = (-180 + i * 18) * Math.PI / 180; return <line key={i} x1={100 + Math.cos(t) * 62} y1={105 + Math.sin(t) * 62} x2={100 + Math.cos(t) * 56} y2={105 + Math.sin(t) * 56} stroke="#5a70ad" strokeWidth="2" strokeLinecap="round" />; })}
          <g style={{ transform: `rotate(${a}deg)`, transformOrigin: "100px 105px", transition: "transform 1s cubic-bezier(.3,1.6,.5,1)" }}>
            <path d="M100 38 L106 105 L94 105 Z" fill="#fff" style={{ filter: "drop-shadow(0 2px 3px #0008)" }} />
          </g>
          <circle cx="100" cy="105" r="11" fill="#1a2c60" stroke="#fff" strokeWidth="3" />
        </svg>
      </div>
      <div className="text-center">
        <div className="font-mono text-4xl font-extrabold tabular-nums" style={{ color: lbl[1], textShadow: `0 0 20px ${lbl[1]}66` }}>{Math.round(n)}</div>
        <div className="text-sm font-extrabold uppercase tracking-widest" style={{ color: lbl[1] }}>{lbl[0]}</div>
      </div>
      <div className="mt-3 rounded-xl bg-ink-900/60 p-3 text-xs font-semibold text-ink-300"><b className="text-white">Урок:</b> {v > 55 ? "Жадность часто предшествует коррекции. Не догоняй рост." : "Страх создаёт возможности, но лови нож осторожно."}</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Btn v="bear" size="sm" onClick={() => setV(12 + Math.floor(Math.random() * 20))}>Panic</Btn>
        <Btn v="ghost" size="sm" onClick={() => setV(Math.floor(Math.random() * 100))}>Random</Btn>
        <Btn v="bull" size="sm" onClick={() => setV(78 + Math.floor(Math.random() * 20))}>FOMO</Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── ORDER BOOK ───────── */
function BookRow({ p, a, side, maxA }: { p: number; a: number; side: "a" | "b"; maxA: number }) {
  return (
    <div className="relative flex justify-between px-2 py-[3px] font-mono text-[11px] font-bold">
      <div className={cn("absolute inset-y-0 right-0 rounded-l transition-all duration-700", side === "a" ? "bg-bear/15" : "bg-bull/15")} style={{ width: `${(a / maxA) * 100}%` }} />
      <span className={cn("relative", side === "a" ? "text-bear" : "text-bull")}>{p.toFixed(1)}</span>
      <span className="relative text-ink-200">{a.toFixed(3)}</span>
    </div>
  );
}
function OrderBook() {
  const mk = (base: number, dir: 1 | -1) => Array.from({ length: 6 }, (_, i) => ({ p: base + dir * (i + 1) * 2.5, a: +(Math.random() * 3 + 0.2).toFixed(3) }));
  const [mid, setMid] = useState(64250);
  const [asks, setAsks] = useState(() => mk(64250, 1).reverse());
  const [bids, setBids] = useState(() => mk(64250, -1));
  useInterval(() => {
    const m = mid + (Math.random() - 0.5) * 6;
    setMid(m); setAsks(mk(m, 1).reverse()); setBids(mk(m, -1));
  }, 1100);
  const maxA = Math.max(...asks.map((x) => x.a), ...bids.map((x) => x.a));
  const Row = BookRow;
  return (
    <AssetCard id="TRD-06" title="Order Book Depth" desc="Стакан с анимированными барами объёма и спредом — объясняем ликвидность визуально." tags={["orderbook", "depth", "liquidity"]}>
      <div className="mb-1 flex justify-between px-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-400"><span>Price</span><span>Size BTC</span></div>
      {asks.map((r, i) => <Row key={`a${i}`} p={r.p} a={r.a} side="a" maxA={maxA} />)}
      <div className="raised my-2 flex items-center justify-between rounded-xl px-3 py-2">
        <span className="font-mono text-lg font-extrabold text-white">{mid.toFixed(1)}</span>
        <span className="text-[10px] font-bold text-ink-400">Spread <span className="font-mono text-gold">5.0</span></span>
      </div>
      {bids.map((r, i) => <Row key={`b${i}`} p={r.p} a={r.a} side="b" maxA={maxA} />)}
    </AssetCard>
  );
}

/* ───────── POSITION ───────── */
function Position() {
  const { notify } = useKit();
  const [px, setPx] = useState(64250);
  const [open, setOpen] = useState(true);
  const [b, bump] = useBump();
  const entry = 63100, tp = 66000, sl = 62000, size = 0.15;
  useInterval(() => setPx((p) => Math.min(tp - 50, Math.max(sl + 50, p + (Math.random() - 0.47) * 70))), open ? 700 : null);
  const pnl = (px - entry) * size;
  const pnlV = useCountUp(pnl, 500);
  const pos = ((px - sl) / (tp - sl)) * 100;
  const ep = ((entry - sl) / (tp - sl)) * 100;
  return (
    <AssetCard id="TRD-07" title="Open Position · PnL" desc="Карточка позиции: живой PnL, шкала SL → entry → TP с маркером цены, закрытие с празднованием." tags={["position", "pnl", "risk"]}>
      {open ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="rounded-md bg-bull px-1.5 py-0.5 text-[10px] font-extrabold text-ink-900">LONG 5×</span><span className="text-sm font-extrabold text-white">BTC-PERP</span></div>
            <span className="font-mono text-xs text-ink-400">{size} BTC</span>
          </div>
          <div className={cn("font-mono text-3xl font-extrabold tabular-nums", pnl >= 0 ? "text-bull text-glow-bull" : "text-bear")}>{pnl >= 0 ? "+" : "−"}${Math.abs(pnlV).toFixed(2)}</div>
          <div className={cn("font-mono text-xs font-bold", pnl >= 0 ? "text-bull" : "text-bear")}>{((pnl / (entry * size / 5)) * 100).toFixed(1)}% ROE</div>
          <div className="relative mt-6 mb-7">
            <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, #ff4d6a 0%, #ff4d6a33 ${ep}%, #2ee59d33 ${ep}%, #2ee59d 100%)` }} />
            <div className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-white/60" style={{ left: `${ep}%` }} />
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700" style={{ left: `${pos}%` }}>
              <div className="h-6 w-6 rounded-full border-4 border-white bg-sky shadow-[0_0_14px_#3d8bff]" />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-1.5 font-mono text-[10px] font-extrabold text-ink-900">{px.toFixed(0)}</div>
            </div>
            <div className="absolute -bottom-6 left-0 font-mono text-[10px] font-bold text-bear">SL {sl}</div>
            <div className="absolute -bottom-6 -translate-x-1/2 font-mono text-[10px] font-bold text-ink-300" style={{ left: `${ep}%` }}>Entry</div>
            <div className="absolute -bottom-6 right-0 font-mono text-[10px] font-bold text-bull">TP {tp}</div>
          </div>
          <Btn v={pnl >= 0 ? "bull" : "bear"} block onClick={() => { setOpen(false); bump(); notify(`Позиция закрыта: ${pnl >= 0 ? "+" : "−"}$${Math.abs(pnl).toFixed(2)}`); }}>Close position</Btn>
        </>
      ) : (
        <div className="relative flex flex-col items-center py-4 text-center">
          <Burst trigger={b} count={18} spread={90} />
          <Mascot mood="cool" size={84} className="anim-pop" />
          <div className="mt-2 text-lg font-extrabold text-white">Position closed</div>
          <div className="mb-4 text-xs text-ink-400">Дисциплина важнее прибыли.</div>
          <Btn v="sky" size="sm" onClick={() => setOpen(true)}>Open again</Btn>
        </div>
      )}
    </AssetCard>
  );
}

/* ───────── FLASHCARDS ───────── */
const CARDS = [
  { n: "Hammer", m: "Разворот вверх после падения. Длинная нижняя тень = покупатели вернули цену.", d: "M30 10v18 M22 28h16v18H22z M30 46v44", c: "#2ee59d" },
  { n: "Shooting Star", m: "Разворот вниз после роста. Длинная верхняя тень = продавцы отбили рост.", d: "M30 10v44 M22 54h16v18H22z M30 72v8", c: "#ff4d6a" },
  { n: "Doji", m: "Нерешительность. Открытие ≈ закрытие. Ждём подтверждения.", d: "M30 10v80 M18 50h24", c: "#ffc53d" },
  { n: "Marubozu", m: "Сильный импульс без теней. Одна сторона полностью контролирует рынок.", d: "M20 15h20v70H20z", c: "#2ee59d" },
];
function Flashcards() {
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [out, setOut] = useState<"l" | "r" | null>(null);
  const [known, setKnown] = useState(0);
  const tRef = useRef<number | undefined>(undefined);
  const card = CARDS[i % CARDS.length];
  const next = (dir: "l" | "r") => {
    setOut(dir); if (dir === "r") setKnown((k) => k + 1);
    clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => { setI((x) => x + 1); setFlip(false); setOut(null); }, 320);
  };
  const back = useMemo(() => CARDS[(i + 1) % CARDS.length], [i]);
  return (
    <AssetCard id="TRD-08" title="Pattern Flashcards" desc="Колода паттернов: тап — переворот, свайп-кнопки «Знаю / Повторить» с улётом карты." tags={["flashcards", "srs", "learn"]}>
      <div className="relative mx-auto h-56 w-full max-w-[240px]" style={{ perspective: 900 }}>
        <div className="raised absolute inset-0 translate-y-3 scale-[.92] rounded-3xl opacity-60" />
        <div className="raised absolute inset-0 translate-y-1.5 scale-[.96] rounded-3xl opacity-80 grid place-items-center"><svg viewBox="0 0 60 100" className="h-24 opacity-30"><path d={back.d} stroke={back.c} strokeWidth="4" fill={back.c} fillOpacity=".3" strokeLinecap="round" /></svg></div>
        <button onClick={() => setFlip(!flip)} className="absolute inset-0 transition-all duration-300"
          style={{ transformStyle: "preserve-3d", transform: `${out === "l" ? "translateX(-140%) rotate(-18deg)" : out === "r" ? "translateX(140%) rotate(18deg)" : ""} rotateY(${flip ? 180 : 0}deg)`, opacity: out ? 0 : 1 }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-b from-ink-600 to-ink-700 shadow-[0_6px_0_#0b1638,inset_0_1px_0_#fff2]" style={{ backfaceVisibility: "hidden" }}>
            <svg viewBox="0 0 60 100" className="h-28"><path d={card.d} stroke={card.c} strokeWidth="4" fill={card.c} fillOpacity=".35" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${card.c})` }} /></svg>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Tap to reveal</span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl p-5 text-center shadow-[0_6px_0_#0b1638]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: `linear-gradient(160deg, ${card.c}33, #182a5c 60%)` }}>
            <div className="text-xl font-extrabold" style={{ color: card.c }}>{card.n}</div>
            <div className="text-xs font-semibold leading-relaxed text-ink-200">{card.m}</div>
          </div>
        </button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Btn v="bear" size="sm" onClick={() => next("l")}><Icon name="refresh" size={14} />Review</Btn>
        <Btn v="bull" size="sm" onClick={() => next("r")}><Icon name="check" size={14} stroke={3} />Know it</Btn>
      </div>
      <Label className="mt-3 text-center">Mastered: {known} · Card {(i % CARDS.length) + 1}/{CARDS.length}</Label>
    </AssetCard>
  );
}

export default function Trading() {
  return (
    <Section id="trading" num="04" title="Trading Modules" subtitle="Рыночные виджеты, превращённые в обучающие игровые механики">
      <LiveChart />
      <Predict />
      <Watchlist />
      <Portfolio />
      <FearGreed />
      <OrderBook />
      <Position />
      <Flashcards />
    </Section>
  );
}
