import { useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { tap, sfx, haptic, useInterval, notify } from "../lib/fx";
import { mulberry32 } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   ГЛУБИНА: Depth Chamber 3D · Liquidity Pools · Whale Radar.
   ═══════════════════════════════════════════════════════════════════ */

/* ── TL06 · MARKET DEPTH CHAMBER ────────────────────────── */
type Lvl = { p: number; q: number; cum: number };
function book(mid: number, seed: number): { bids: Lvl[]; asks: Lvl[]; max: number } {
  const rnd = mulberry32(seed);
  const bids: Lvl[] = []; const asks: Lvl[] = [];
  let b = 0, a = 0;
  for (let i = 1; i <= 18; i++) {
    b += 0.2 + rnd() * 2.2 * (1 + (18 - i) / 10);
    a += 0.2 + rnd() * 2.2 * (1 + (18 - i) / 10);
    bids.push({ p: mid - i * 4, q: b, cum: b });
    asks.push({ p: mid + i * 4, q: a, cum: a });
  }
  return { bids, asks, max: Math.max(b, a) };
}

export function DepthChamber() {
  const [mid, setMid] = useState(67400);
  const [seed, setSeed] = useState(5);
  const [mode, setMode] = useState<"2d" | "3d">("3d");
  const [alert, setAlert] = useState<number | null>(null);
  const [live, setLive] = useState(true);
  const wall = useRef<HTMLDivElement>(null);
  const B = useMemo(() => book(mid, seed), [mid, seed]);
  useInterval(() => { setSeed((s) => s + 1); setMid((m) => m + (Math.random() - 0.5) * 12); }, live ? 2000 : null);

  const rows = [...B.asks].reverse().concat(B.bids);
  const spread = B.asks[0].p - B.bids[0].p;

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B1C44] via-ink-850 to-ink-900 p-4 ring-1 ring-sky/20 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={B.bids[17].cum > B.asks[17].cum ? "bull" : "bear"}>
          {B.bids[17].cum > B.asks[17].cum ? "▲ стена покупок" : "▼ стена продаж"}
        </Chip>
        <span className="font-mono text-[11px] text-ink-400">спред {spread.toFixed(0)} · mid {Math.round(mid).toLocaleString("ru-RU")}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex rounded-xl bg-ink-950/70 p-1">
            {(["2d", "3d"] as const).map((m) => (
              <button key={m} onClick={() => { tap("tick"); setMode(m); sfx("whoosh"); }}
                className={cn("rounded-lg px-3 py-1.5 font-display text-[11px] font-black uppercase", mode === m ? "bg-sky text-white" : "text-ink-400")}>{m}</button>
            ))}
          </div>
          <button onClick={() => { tap(); setLive(!live); }} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-[10px] font-bold uppercase", live ? "bg-bear/15 text-bear" : "bg-ink-700 text-ink-300")}>
            <span className={cn("size-2 rounded-full", live ? "bg-bear animate-pulse" : "bg-ink-400")} />{live ? "Live" : "Стоп"}
          </button>
        </div>
      </div>

      {mode === "2d" ? (
        <div className="well relative mt-3 overflow-hidden p-1.5 animate-fade" key="2d">
          <svg viewBox="0 0 560 200" className="block h-48 w-full" preserveAspectRatio="none">
            <polygon points={`0,190 ${B.bids.map((l, i) => `${10 + (i / 17) * 260},${190 - (l.cum / B.max) * 160}`).join(" ")} 270,190`} fill="#2BE38B" opacity=".2" />
            <polygon points={`290,190 ${B.asks.map((l, i) => `${290 + (i / 17) * 260},${190 - (l.cum / B.max) * 160}`).join(" ")} 550,190`} fill="#FF4D6D" opacity=".2" />
            <polyline points={B.bids.map((l, i) => `${10 + (i / 17) * 260},${190 - (l.cum / B.max) * 160}`).join(" ")} fill="none" stroke="#2BE38B" strokeWidth="2.5" />
            <polyline points={B.asks.map((l, i) => `${290 + (i / 17) * 260},${190 - (l.cum / B.max) * 160}`).join(" ")} fill="none" stroke="#FF4D6D" strokeWidth="2.5" />
            <line x1="280" x2="280" y1="0" y2="200" stroke="#fff" strokeOpacity=".4" strokeDasharray="4 4" />
          </svg>
          <div className="flex justify-between px-2 font-mono text-[10px]"><span className="text-bull">BID {B.bids[0].p.toFixed(0)}</span><span className="text-bear">ASK {B.asks[0].p.toFixed(0)}</span></div>
        </div>
      ) : (
        <div key="3d" ref={wall} className="relative mt-3 overflow-hidden rounded-2xl bg-ink-950/70 p-3 animate-fade" style={{ perspective: "900px" }}>
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(500px 200px at 50% 110%, rgba(61,155,255,.22), transparent 65%)" }} />
          <div className="relative flex h-56 items-end justify-center gap-[3px]" style={{ transform: "rotateX(38deg)", transformStyle: "preserve-3d" }}>
            {rows.map((l, i) => {
              const isAsk = i < 18;
              const h = 24 + (l.cum / B.max) * 150;
              const z = (l.cum / B.max) * 90;
              const hot = alert === l.p;
              return (
                <button
                  key={`${l.p}`}
                  onClick={() => { tap("tick"); setAlert(hot ? null : l.p); if (!hot) notify(`Алерт на ${Math.round(l.p)} поставлен`, "info"); }}
                  title={`${isAsk ? "ASK" : "BID"} ${l.p.toFixed(0)} · ${l.cum.toFixed(1)} BTC`}
                  className="group relative w-full max-w-6 rounded-t-[3px] transition-all duration-700"
                  style={{
                    height: h, transform: `translateZ(${z.toFixed(0)}px)`,
                    background: isAsk ? `linear-gradient(180deg, #FF8A9E, #BF2345)` : `linear-gradient(180deg, #6DF5B3, #12A25E)`,
                    boxShadow: hot ? "0 0 0 2px #fff, 0 0 18px rgba(255,255,255,.6)" : `0 0 ${8 + (l.cum / B.max) * 18}px ${(isAsk ? "#FF4D6D" : "#2BE38B")}55`,
                    opacity: alert !== null && !hot ? 0.45 : 1,
                  }}
                >
                  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-950/90 px-1.5 py-0.5 font-mono text-[9px] opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                    {l.cum.toFixed(1)} BTC
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative mt-1 flex justify-between font-mono text-[10px] text-ink-400">
            <span className="text-bull">← BID {B.bids[0].p.toFixed(0)}</span>
            <span className="text-ink-300">наклон — перспектива · тап по столбу = алерт</span>
            <span className="text-bear">ASK {B.asks[0].p.toFixed(0)} →</span>
          </div>
          {alert !== null && (
            <div className="relative mt-2 flex items-center gap-2 rounded-xl bg-gold/10 px-3 py-2 text-[12px] font-bold text-gold ring-1 ring-gold/40 animate-pop">
              <Icon name="bell" size={15} /> Алерт: цена {Math.round(alert).toLocaleString("ru-RU")}
              <button onClick={() => setAlert(null)} className="ml-auto text-gold/70 hover:text-gold"><Icon name="x" size={14} /></button>
            </div>
          )}
        </div>
      )}
      <div className="mt-2 text-[11px] text-ink-500">Запоминающийся момент: переключение 2D → 3D превращает плоский график в стену ликвидности с глубиной и свечением.</div>
    </div>
  );
}

/* ── TL07 · LIQUIDITY POOLS ───────────────────────────── */
export function LiquidityPools() {
  const N = 28;
  const [lo, setLo] = useState(8);
  const [hi, setHi] = useState(20);
  const [cur] = useState(15);
  const [amt, setAmt] = useState(5000);
  const [fee] = useState(0.3);
  const rnd = useMemo(() => mulberry32(99), []);
  const dist = useMemo(() => Array.from({ length: N }, (_, i) => {
    const c = 14 + Math.sin(i * 0.5) * 2;
    return Math.exp(-((i - c) ** 2) / 18) * (0.7 + rnd() * 0.6);
  }), [rnd]);
  const maxD = Math.max(...dist);
  const inRange = cur >= lo && cur <= hi;
  const width = hi - lo;
  const active = dist.slice(lo, hi + 1).reduce((a, b) => a + b, 0);
  const total = dist.reduce((a, b) => a + b, 0);
  const share = active / total;
  const apr = (share * fee * 365 * (amt / 5000) * 12).toFixed(1);
  const drag = useRef<"lo" | "hi" | null>(null);

  const xPos = (i: number) => (i / (N - 1)) * 100;
  const setFromClient = (clientX: number, which: "lo" | "hi", el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const i = Math.round(((clientX - r.left) / r.width) * (N - 1));
    if (which === "lo") setLo(Math.max(0, Math.min(hi - 2, i)));
    else setHi(Math.min(N - 1, Math.max(lo + 2, i)));
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex items-center gap-2">
        <Chip tone={inRange ? "bull" : "bear"}>{inRange ? "● в диапазоне · фармит комиссии" : "○ вне диапазона · пауза"}</Chip>
        <span className="ml-auto font-mono text-[11px] text-ink-400">пул BTC/USDT · {fee}%</span>
      </div>
      <div
        className="relative mt-3 h-48 cursor-ew-resize select-none rounded-2xl bg-ink-950/60 p-3"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = ((e.clientX - r.left) / r.width) * (N - 1);
          const which = Math.abs(i - lo) < Math.abs(i - hi) ? "lo" : "hi";
          drag.current = which;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromClient(e.clientX, which, e.currentTarget);
        }}
        onPointerMove={(e) => { if (drag.current) { setFromClient(e.clientX, drag.current, e.currentTarget); if (Math.random() < 0.3) sfx("tick"); } }}
        onPointerUp={() => { drag.current = null; haptic(10); }}
        onPointerCancel={() => { drag.current = null; }}
        role="slider" aria-label="Диапазон ликвидности" aria-valuetext={`${lo}–${hi}`}
      >
        <div className="absolute inset-x-3 top-3 bottom-8 flex items-end gap-[3px]">
          {dist.map((v, i) => {
            const inside = i >= lo && i <= hi;
            return (
              <div key={i} className="flex-1 rounded-t-[3px] transition-all duration-200"
                style={{ height: `${(v / maxD) * 100}%`, background: inside ? "linear-gradient(180deg,#8CCBFF,#1B5FC9)" : "#1b305c", opacity: inside ? 1 : 0.5, boxShadow: inside ? "0 0 8px rgba(61,155,255,.4)" : undefined }} />
            );
          })}
        </div>
        <div className="absolute top-3 bottom-8 rounded-lg border-2 border-dashed border-sky/50 bg-sky/10" style={{ left: `calc(0.75rem + ${(lo / (N - 1)) * 100}% * 0.925)`, width: `calc(${((hi - lo) / (N - 1)) * 100}% * 0.925)` }} />
        {/* текущая цена */}
        <div className="absolute top-1 bottom-7 w-0.5 bg-white shadow-[0_0_8px_#fff]" style={{ left: `calc(0.75rem + ${xPos(cur)}% * 0.94)` }}>
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1 font-mono text-[9px] font-black text-ink-900">price</span>
        </div>
        {([["lo", lo, "#2BE38B"], ["hi", hi, "#FF4D6D"]] as const).map(([k, v, c]) => (
          <div key={k} className="absolute bottom-1 top-1 w-6 -translate-x-1/2 cursor-grab active:cursor-grabbing" style={{ left: `calc(0.75rem + ${xPos(v)}% * 0.94)` }}>
            <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 rounded-full" style={{ background: c }} />
            <span className="absolute top-1/2 left-1/2 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold text-ink-900 shadow" style={{ background: c }}>
              <Icon name="sort" size={13} stroke={3} />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[["Диапазон", `${width} т.`, "text-sky"], ["Доля пула", `${(share * 100).toFixed(0)}%`, "text-violet"], ["APR≈", `${apr}%`, inRange ? "text-bull" : "text-ink-500"], ["Депозит", `$${amt}`, "text-gold"]].map(([t, v, c]) => (
          <div key={t as string} className="rounded-xl bg-ink-950/60 px-1 py-2"><div className={cn("font-mono text-sm font-black", c as string)}>{v}</div><div className="text-[9px] text-ink-500">{t}</div></div>
        ))}
      </div>
      <div className="mt-3">
        <Label>Депозит ${amt}</Label>
        <input type="range" min={500} max={20000} step={500} value={amt} onChange={(e) => setAmt(+e.target.value)} className="rng" aria-label="депозит" />
      </div>
      <div className="text-[11px] text-ink-500">Тяни границы — распределение, доля пула и APR пересчитываются мгновенно. Удерживай цену внутри диапазона.</div>
    </div>
  );
}

/* ── TL08 · WHALE RADAR ─────────────────────────────── */
type Tx = { id: number; ang: number; dist: number; amt: number; from: string; to: string; age: number };
const NAMES = ["Binance", "Coinbase", "Kraken", "Cold ❄", "Jump", "OTC-деск", "ETF-кастоди"];

export function WhaleRadar() {
  const [txs, setTxs] = useState<Tx[]>(() => [
    { id: 1, ang: 40, dist: 0.55, amt: 820, from: "Cold ❄", to: "Binance", age: 0 },
    { id: 2, ang: 200, dist: 0.75, amt: 1450, from: "Jump", to: "Coinbase", age: 0 },
    { id: 3, ang: 300, dist: 0.35, amt: 240, from: "Kraken", to: "OTC-деск", age: 0 },
  ]);
  const [sel, setSel] = useState(2);
  const [min, setMin] = useState(200);
  const [paused, setPaused] = useState(false);
  const [sweep, setSweep] = useState(0);
  const idRef = useRef(4);

  useInterval(() => setSweep((s) => (s + 4) % 360), paused ? null : 50);
  useInterval(() => {
    setTxs((t) => {
      const nt = t.map((x) => ({ ...x, age: x.age + 1 })).filter((x) => x.age < 5);
      if (Math.random() < 0.75) {
        nt.push({
          id: idRef.current++, ang: Math.random() * 360, dist: 0.25 + Math.random() * 0.7,
          amt: Math.round(80 + Math.random() * Math.random() * 2200),
          from: NAMES[Math.floor(Math.random() * NAMES.length)], to: NAMES[Math.floor(Math.random() * NAMES.length)], age: 0,
        });
      }
      return nt.slice(-14);
    });
  }, paused ? null : 2600);

  const vis = txs.filter((t) => t.amt >= min);
  const cur = vis.find((t) => t.id === sel) ?? vis[vis.length - 1];
  const pol = (ang: number, d: number, R: number) => {
    const a = ((ang - 90) * Math.PI) / 180;
    return { x: 150 + Math.cos(a) * d * R, y: 150 + Math.sin(a) * d * R };
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
      <div className="relative mx-auto aspect-square w-full max-w-105 overflow-hidden rounded-3xl bg-ink-950/80 ring-1 ring-bull/20" style={{ maxWidth: 420 }}>
        <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
          {[0.33, 0.66, 1].map((f) => <circle key={f} cx="150" cy="150" r={120 * f} fill="none" stroke="#1b305c" strokeWidth="1.5" />)}
          {[0, 45, 90, 135].map((a) => <line key={a} x1="150" y1="30" x2="150" y2="270" stroke="#1b305c" strokeWidth="1" transform={`rotate(${a} 150 150)`} />)}
          <text x="150" y="24" fontSize="9" fill="#4d69a8" textAnchor="middle" fontFamily="monospace">≥ $10M</text>
          {/* развертка */}
          <g style={{ transform: `rotate(${sweep}deg)`, transformOrigin: "150px 150px" }}>
            <path d={`M150 150 L150 30 A120 120 0 0 1 192 38 Z`} fill="url(#sweep)" opacity=".8" />
            <defs><linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2BE38B" stopOpacity="0" /><stop offset="1" stopColor="#2BE38B" stopOpacity=".55" /></linearGradient></defs>
            <line x1="150" y1="150" x2="150" y2="30" stroke="#2BE38B" strokeWidth="2" />
          </g>
          {vis.map((t) => {
            const p = pol(t.ang, t.dist, 120);
            const big = t.amt >= 1000;
            const isSel = cur?.id === t.id;
            const fresh = t.age === 0;
            return (
              <g key={t.id} onClick={() => { tap("tick"); setSel(t.id); }} className="cursor-pointer">
                {isSel && <circle cx={p.x} cy={p.y} r={big ? 20 : 14} fill="none" stroke="#fff" strokeWidth="1.5"><animate attributeName="r" values={big ? "14;24;14" : "10;17;10"} dur="1.4s" repeatCount="indefinite" /></circle>}
                {fresh && <circle cx={p.x} cy={p.y} r={big ? 16 : 11} fill="none" stroke="#2BE38B" strokeWidth="2" opacity=".8"><animate attributeName="r" values="4;22" dur="1s" fill="freeze" /><animate attributeName="opacity" values=".9;0" dur="1s" fill="freeze" /></circle>}
                <circle cx={p.x} cy={p.y} r={big ? 8 : 4 + (t.amt / 1500) * 4} fill={big ? "#FFC940" : "#2BE38B"} opacity={0.55 + (1 - t.dist) * 0.45} stroke="#081229" strokeWidth="1.5" />
                {big && <text x={p.x} y={p.y - 12} fontSize="9" fontWeight="900" fill="#FFC940" textAnchor="middle" fontFamily="monospace">${(t.amt / 1000).toFixed(1)}M</text>}
              </g>
            );
          })}
          <circle cx="150" cy="150" r="10" fill="#0C1834" stroke="#2BE38B" strokeWidth="2" />
          <text x="150" y="153.5" fontSize="9" fontWeight="900" fill="#2BE38B" textAnchor="middle">₿</text>
        </svg>
        <div className="absolute left-3 top-3 rounded-lg bg-ink-950/80 px-2 py-1 font-mono text-[10px] text-bull backdrop-blur">● {paused ? "пауза" : "сканирование"}</div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button onClick={() => { tap(); setPaused(!paused); }} aria-label="Пауза" className="flex size-8 items-center justify-center rounded-lg bg-ink-800/90 text-ink-200"><Icon name={paused ? "play" : "minus"} size={14} /></button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex items-center gap-2">
          <Label className="mb-0">Мин. размер ${min}K</Label>
          <input type="range" min={50} max={1000} step={50} value={min} onChange={(e) => setMin(+e.target.value)} className="rng flex-1" aria-label="минимальный размер" />
        </div>
        <div className="mt-2 min-h-30 rounded-2xl bg-ink-950/60 p-3 ring-1 ring-white/5" key={cur?.id ?? "none"}>
          {cur ? (
            <div className="animate-slide-up">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-gold">${cur.amt}K</span>
                {cur.amt >= 1000 && <Chip tone="gold">Кит</Chip>}
                <span className="ml-auto font-mono text-[10px] text-ink-500">{cur.age === 0 ? "только что" : `${cur.age * 3} мин назад`}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-bold">
                <span className="rounded-lg bg-ink-800 px-2 py-1">{cur.from}</span>
                <Icon name="chevR" size={14} className="text-bull" />
                <span className="rounded-lg bg-ink-800 px-2 py-1">{cur.to}</span>
              </div>
              <div className="mt-2 text-[11px] leading-snug text-ink-300">
                {cur.to === "Binance" || cur.to === "Coinbase" ? "Перевод на биржу — возможное давление продаж." : cur.from.includes("Cold") || cur.from.includes("ETF") ? "Уход в холод — бычий сигнал накопления." : "Внутреннее перемещение — нейтрально."}
              </div>
              <Btn s="xs" v="gold" className="mt-2.5" icon="bell" onClick={() => notify(`Следим за кошельком ${cur.from}`, "info")}>Следить за кошельком</Btn>
            </div>
          ) : (
            <div className="py-6 text-center text-[12px] text-ink-500">Нет сигналов ≥ ${min}K — понизь порог</div>
          )}
        </div>
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {[...vis].reverse().slice(0, 8).map((t) => (
            <button key={t.id} onClick={() => { tap("tick"); setSel(t.id); }}
              className={cn("shrink-0 rounded-xl px-2.5 py-1.5 font-mono text-[11px] font-bold", cur?.id === t.id ? "bg-bull text-ink-900" : "bg-ink-800 text-ink-300")}>
              ${t.amt}K
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
