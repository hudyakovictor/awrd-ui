import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Label, Chip } from "../components/ui";
import { useInterval, tap, sfx, fmt, clamp } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   T06–T07 — Глубина рынка и лента сделок (продолжение трейдинга).
   ═══════════════════════════════════════════════════════════════════ */

/* ── T06 · Depth chart ── */
type Side = { p: number; q: number }[];
function genBook(mid: number): { bids: Side; asks: Side } {
  const bids: Side = [];
  const asks: Side = [];
  let bq = 0, aq = 0;
  for (let i = 1; i <= 24; i++) {
    bq += 0.15 + Math.random() * 1.4 * (1 + i / 14);
    aq += 0.15 + Math.random() * 1.4 * (1 + i / 14);
    bids.push({ p: mid - i * 3.2, q: bq });
    asks.push({ p: mid + i * 3.2, q: aq });
  }
  return { bids, asks };
}

export function DepthChart() {
  const [mid, setMid] = useState(67412);
  const [book, setBook] = useState(() => genBook(67412));
  const [hov, setHov] = useState<{ x: number; side: "bid" | "ask"; p: number; q: number } | null>(null);
  const [live, setLive] = useState(true);
  const W = 560, H = 230, pad = 10;
  useInterval(() => {
    setMid((m) => m + (Math.random() - 0.5) * 9);
    setBook(genBook(mid));
  }, live ? 1600 : null);

  const { bids, asks } = book;
  const maxQ = Math.max(bids[bids.length - 1].q, asks[asks.length - 1].q);
  const lo = bids[bids.length - 1].p, hi = asks[asks.length - 1].p;
  const X = (p: number) => pad + ((p - lo) / (hi - lo)) * (W - pad * 2);
  const Y = (q: number) => H - pad - (q / maxQ) * (H - pad * 2 - 14);
  const midX = X(mid);

  const bidPts = useMemo(() => bids.map((l) => `${X(l.p)},${Y(l.q)}`).join(" "), [book]); // eslint-disable-line react-hooks/exhaustive-deps
  const askPts = useMemo(() => asks.map((l) => `${X(l.p)},${Y(l.q)}`).join(" "), [book]); // eslint-disable-line react-hooks/exhaustive-deps
  const imbalance = bids[bids.length - 1].q / (bids[bids.length - 1].q + asks[asks.length - 1].q);
  const spread = asks[0].p - bids[0].p;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Chip tone={imbalance > 0.55 ? "bull" : imbalance < 0.45 ? "bear" : "sky"}>
          {imbalance > 0.55 ? "▲ Покупатели сильнее" : imbalance < 0.45 ? "▼ Продавцы сильнее" : "● Баланс"}
        </Chip>
        <span className="font-mono text-[11px] text-ink-400">спред {spread.toFixed(1)} · mid {fmt(mid, 1)}</span>
        <button onClick={() => { tap(); setLive(!live); }} className={cn("ml-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-display text-[10px] font-bold uppercase", live ? "bg-bear/15 text-bear" : "bg-ink-700 text-ink-300")}>
          <span className={cn("size-2 rounded-full", live ? "bg-bear animate-pulse" : "bg-ink-400")} />{live ? "Live" : "Пауза"}
        </button>
      </div>
      <div className="well grid-bg relative overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`} className="block h-56 w-full" preserveAspectRatio="none"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const p = lo + ((px - pad) / (W - pad * 2)) * (hi - lo);
            if (p < bids[bids.length - 1].p || p > asks[asks.length - 1].p) { setHov(null); return; }
            const side = p >= mid ? "ask" : "bid";
            const arr = side === "ask" ? asks : [...bids].reverse();
            const lvl = arr.find((l) => (side === "ask" ? l.p >= p : l.p <= p)) ?? arr[arr.length - 1];
            setHov({ x: px, side, p: lvl.p, q: lvl.q });
          }}
          onMouseLeave={() => setHov(null)}
        >
          <polygon points={`${X(bids[bids.length - 1].p)},${H - pad} ${bidPts} ${midX},${H - pad}`} fill="#2BE38B" opacity=".18" />
          <polygon points={`${midX},${H - pad} ${askPts} ${X(asks[asks.length - 1].p)},${H - pad}`} fill="#FF4D6D" opacity=".18" />
          <polyline points={bidPts} fill="none" stroke="#2BE38B" strokeWidth="2.5" strokeLinejoin="round" />
          <polyline points={askPts} fill="none" stroke="#FF4D6D" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1={midX} x2={midX} y1="0" y2={H} stroke="#fff" strokeOpacity=".35" strokeDasharray="4 4" />
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <g key={f}>
              <line x1={pad} x2={W - pad} y1={Y(maxQ * f)} y2={Y(maxQ * f)} stroke="#4d69a8" strokeOpacity=".35" strokeDasharray="2 4" />
              <text x={W - pad - 2} y={Y(maxQ * f) - 3} fontSize="9" fill="#7d93c6" textAnchor="end" fontFamily="monospace">{(maxQ * f).toFixed(1)}</text>
            </g>
          ))}
          {hov && (
            <g>
              <line x1={hov.x} x2={hov.x} y1="0" y2={H - pad} stroke="#fff" strokeOpacity=".5" strokeDasharray="3 3" />
              <circle cx={hov.x} cy={Y(hov.q)} r="4.5" fill={hov.side === "ask" ? "#FF4D6D" : "#2BE38B"} stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
        </svg>
        {hov && (
          <div className="absolute z-10 rounded-xl bg-ink-950/90 px-2.5 py-1.5 font-mono text-[10px] backdrop-blur animate-pop" style={{ left: clamp((hov.x / W) * 100, 8, 72) + "%", top: 8 }}>
            <div className={cn("font-bold", hov.side === "ask" ? "text-bear" : "text-bull")}>{hov.side === "ask" ? "ASK" : "BID"} {fmt(hov.p, 1)}</div>
            <div className="text-ink-300">накопл. {hov.q.toFixed(2)} BTC</div>
          </div>
        )}
        <div className="absolute bottom-1.5 left-3 font-mono text-[10px] text-bull">BID {fmt(bids[0].p, 1)}</div>
        <div className="absolute bottom-1.5 right-3 font-mono text-[10px] text-bear">ASK {fmt(asks[0].p, 1)}</div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[11px] text-ink-400">Дисбаланс</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-900">
          <div className="absolute inset-y-0 left-0 bg-bull transition-all duration-1000" style={{ width: `${imbalance * 100}%` }} />
          <div className="absolute inset-y-0 right-0 bg-bear transition-all duration-1000" style={{ width: `${(1 - imbalance) * 100}%` }} />
        </div>
        <span className="font-mono text-[11px] font-bold">{Math.round(imbalance * 100)}/{Math.round((1 - imbalance) * 100)}</span>
      </div>
    </div>
  );
}

/* ── T07 · Лента сделок ── */
type Trade = { id: number; p: number; q: number; buy: boolean; t: number; big: boolean };

export function TradeTape() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [speed, setSpeed] = useState(1);
  const [filter, setFilter] = useState<"all" | "buy" | "sell" | "big">("all");
  const [sound, setSound] = useState(false);
  const [paused, setPaused] = useState(false);
  const id = useRef(0);
  const mid = useRef(67412);
  const list = useRef<HTMLDivElement>(null);

  useInterval(() => {
    mid.current += (Math.random() - 0.5) * 7;
    const n = 1 + Math.floor(Math.random() * 2);
    const fresh: Trade[] = Array.from({ length: n }).map(() => {
      const q = +(Math.random() * Math.random() * 3).toFixed(3);
      return {
        id: ++id.current,
        p: mid.current + (Math.random() - 0.5) * 4,
        q,
        buy: Math.random() > 0.48,
        t: Date.now(),
        big: q > 1.2,
      };
    });
    if (sound && fresh.some((t) => t.big)) sfx("coin");
    setTrades((t) => [...fresh.reverse(), ...t].slice(0, 40));
  }, paused ? null : Math.round(700 / speed));

  useEffect(() => { list.current?.scrollTo({ top: 0 }); }, [trades.length]);

  const rows = trades.filter((t) => filter === "all" || (filter === "buy" && t.buy) || (filter === "sell" && !t.buy) || (filter === "big" && t.big));
  const buyVol = trades.filter((t) => t.buy).reduce((a, t) => a + t.q, 0);
  const sellVol = trades.filter((t) => !t.buy).reduce((a, t) => a + t.q, 0);
  const maxQ = Math.max(0.5, ...trades.map((t) => t.q));

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {(["all", "buy", "sell", "big"] as const).map((f) => (
          <button key={f} onClick={() => { tap("tick"); setFilter(f); }}
            className={cn("rounded-lg px-2.5 py-1.5 font-display text-[10px] font-bold uppercase transition-colors",
              filter === f ? (f === "buy" ? "bg-bull text-ink-900" : f === "sell" ? "bg-bear text-white" : f === "big" ? "bg-gold text-ink-900" : "bg-sky text-white") : "bg-ink-850 text-ink-400")}>
            {f === "all" ? "Все" : f === "buy" ? "Покупки" : f === "sell" ? "Продажи" : "🐋 Киты"}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          <button onClick={() => { tap("tick"); setSound(!sound); }} aria-label="Звук китов" className={cn("flex size-8 items-center justify-center rounded-lg", sound ? "bg-gold/20 text-gold" : "bg-ink-850 text-ink-500")}><Icon name={sound ? "volume" : "volumeX"} size={15} /></button>
          <button onClick={() => { tap(); setPaused(!paused); }} aria-label="Пауза" className="flex size-8 items-center justify-center rounded-lg bg-ink-850 text-ink-300"><Icon name={paused ? "play" : "minus"} size={15} /></button>
        </span>
      </div>
      <div className="mb-2 flex items-center gap-2 text-[11px]">
        <span className="font-bold text-bull">{buyVol.toFixed(2)}</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-900">
          <div className="absolute inset-y-0 left-0 bg-bull transition-all duration-500" style={{ width: `${(buyVol / (buyVol + sellVol || 1)) * 100}%` }} />
        </div>
        <span className="font-bold text-bear">{sellVol.toFixed(2)}</span>
      </div>
      <div ref={list} className="well h-64 space-y-1 overflow-hidden p-2">
        {rows.slice(0, 14).map((t) => (
          <div key={t.id} className={cn("relative grid grid-cols-[64px_1fr_64px] items-center overflow-hidden rounded-lg px-2 py-[5px] font-mono text-[11px] animate-slide-up", t.big && "ring-1 ring-gold/60 bg-gold/10")}>
            <span className={cn("absolute inset-y-0 left-0 transition-all", t.buy ? "bg-bull/15" : "bg-bear/15")} style={{ width: `${(t.q / maxQ) * 100}%` }} />
            <span className={cn("relative font-bold", t.buy ? "text-bull" : "text-bear")}>{fmt(t.p, 1)}</span>
            <span className="relative text-right tabular-nums text-ink-200">{t.q.toFixed(3)}</span>
            <span className="relative text-right text-[10px] text-ink-500">{new Date(t.t).toLocaleTimeString("ru-RU", { minute: "2-digit", second: "2-digit" })}</span>
            {t.big && <span className="absolute right-1 top-0.5 text-[9px]">🐋</span>}
          </div>
        ))}
        {!rows.length && <div className="flex h-full items-center justify-center text-[12px] text-ink-500">Нет сделок под фильтром</div>}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Label className="mb-0">Скорость</Label>
        {[0.5, 1, 2, 4].map((v) => (
          <button key={v} onClick={() => { tap("tick"); setSpeed(v); }} className={cn("rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold", speed === v ? "bg-sky text-white" : "bg-ink-850 text-ink-400")}>×{v}</button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-ink-500">{trades.length} в буфере</span>
      </div>
    </div>
  );
}
