import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Label, Btn, Segmented, Chip, Confetti } from "../components/ui";
import { tap, sfx, haptic, useInterval, fmt, useCountUp, notify, clamp } from "../lib/fx";
import { cn } from "../utils/cn";

type C = { o: number; h: number; l: number; c: number };
function gen(n: number, start: number, vol: number): C[] {
  const out: C[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const o = p, c = o + (Math.random() - 0.48) * vol;
    out.push({ o, c, h: Math.max(o, c) + Math.random() * vol * 0.6, l: Math.min(o, c) - Math.random() * vol * 0.6 });
    p = c;
  }
  return out;
}

/* T01 — Live candlestick chart */
export function CandleChart() {
  const [tf, setTf] = useState<"1m" | "15m" | "1h" | "1D">("15m");
  const vol = { "1m": 40, "15m": 90, "1h": 180, "1D": 600 }[tf];
  const [data, setData] = useState(() => gen(34, 67000, 90));
  const [hover, setHover] = useState<number | null>(null);
  const [live, setLive] = useState(true);
  useInterval(() => {
    setData((d) => {
      const last = { ...d[d.length - 1] };
      if (Math.random() < 0.25) {
        const o = last.c, c = o + (Math.random() - 0.48) * vol;
        return [...d.slice(1), { o, c, h: Math.max(o, c) + Math.random() * vol * 0.3, l: Math.min(o, c) - Math.random() * vol * 0.3 }];
      }
      last.c += (Math.random() - 0.49) * vol * 0.25;
      last.h = Math.max(last.h, last.c); last.l = Math.min(last.l, last.c);
      return [...d.slice(0, -1), last];
    });
  }, live ? 450 : null);
  const W = 560, H = 220, pad = 8;
  const min = Math.min(...data.map((d) => d.l)), max = Math.max(...data.map((d) => d.h));
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (H - pad * 2);
  const cw = W / data.length;
  const last = data[data.length - 1];
  const up = last.c >= last.o;
  const hv = hover !== null ? data[hover] : last;
  const ma = data.map((_, i) => { const s = data.slice(Math.max(0, i - 6), i + 1); return s.reduce((a, b) => a + b.c, 0) / s.length; });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#F7931A] font-display text-sm font-black shadow-[0_3px_0_#a35f00]">₿</div>
          <div>
            <div className="font-display text-xs font-bold">BTC/USDT <Chip tone="sky" className="ml-1">Демо</Chip></div>
            <div className={cn("font-mono text-lg font-bold tabular-nums", up ? "text-bull" : "text-bear")}>{fmt(last.c, 1)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Segmented className="w-56" value={tf} onChange={(v) => { setTf(v); setData(gen(34, 67000, { "1m": 40, "15m": 90, "1h": 180, "1D": 600 }[v])); }} options={(["1m", "15m", "1h", "1D"] as const).map((v) => ({ v, label: v }))} />
          <button onClick={() => { tap(); setLive(!live); }} className={cn("flex h-10 items-center gap-1.5 rounded-xl px-3 font-display text-[10px] font-bold uppercase", live ? "bg-bear/15 text-bear" : "bg-ink-700 text-ink-300")}>
            <span className={cn("size-2 rounded-full", live ? "bg-bear animate-pulse" : "bg-ink-400")} />{live ? "Live" : "Пауза"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 font-mono text-[11px]">
        {(["o", "h", "l", "c"] as const).map((k) => <div key={k} className="well px-2 py-1"><span className="uppercase text-ink-400">{k} </span><span className="font-bold tabular-nums">{fmt(hv[k], 1)}</span></div>)}
      </div>
      <div className="well relative overflow-hidden grid-bg">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-[220px] w-full" preserveAspectRatio="none" onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHover(clamp(Math.floor(((e.clientX - r.left) / r.width) * data.length), 0, data.length - 1)); }}>
          <polyline fill="none" stroke="#9A6BFF" strokeWidth="1.5" strokeOpacity=".8" points={ma.map((v, i) => `${i * cw + cw / 2},${y(v)}`).join(" ")} />
          {data.map((d, i) => {
            const g = d.c >= d.o, x = i * cw + cw / 2;
            return (
              <g key={i} opacity={hover !== null && hover !== i ? 0.55 : 1}>
                <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} stroke={g ? "#2BE38B" : "#FF4D6D"} strokeWidth="1.5" />
                <rect x={x - cw * 0.32} width={cw * 0.64} y={y(Math.max(d.o, d.c))} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="1.5" fill={g ? "#2BE38B" : "#FF4D6D"} />
              </g>
            );
          })}
          <line x1="0" x2={W} y1={y(last.c)} y2={y(last.c)} stroke={up ? "#2BE38B" : "#FF4D6D"} strokeDasharray="4 4" strokeWidth="1" />
          {hover !== null && <line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1="0" y2={H} stroke="#fff" strokeOpacity=".3" strokeDasharray="3 3" />}
        </svg>
        <div className={cn("absolute right-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-900 transition-[top] duration-300", up ? "bg-bull" : "bg-bear")} style={{ top: `calc(${(y(last.c) / H) * 100}% - 9px)` }}>{fmt(last.c, 0)}</div>
        <div className="absolute left-2 top-2 flex items-center gap-1 text-[10px] font-bold text-violet"><span className="h-0.5 w-3 bg-violet" />MA7</div>
      </div>
    </div>
  );
}

/* T02 — Order ticket */
export function OrderTicket() {
  const [side, setSide] = useState<"long" | "short">("long");
  const [amt, setAmt] = useState(200);
  const [lev, setLev] = useState(5);
  const [tp, setTp] = useState(true);
  const [sl, setSl] = useState(true);
  const [phase, setPhase] = useState<"form" | "sending" | "done">("form");
  const [boom, setBoom] = useState(0);
  const price = 67412;
  const pos = amt * lev;
  const liq = side === "long" ? price * (1 - 0.9 / lev) : price * (1 + 0.9 / lev);
  const submit = () => {
    if (!sl && lev >= 10) { sfx("error"); haptic([30, 40, 30]); notify("Без стоп-лосса с плечом ≥10x нельзя — правило урока 3", "error"); return; }
    setPhase("sending");
    setTimeout(() => { setPhase("done"); setBoom(Date.now()); sfx("levelup"); haptic([10, 30, 10, 30, 40]); }, 900);
  };
  if (phase === "done") return (
    <div className="relative flex min-h-[340px] flex-col items-center justify-center text-center">
      <Confetti fire={boom} />
      <div className="flex size-16 items-center justify-center rounded-full bg-bull text-ink-900 shadow-[0_5px_0_var(--color-bull-d)] animate-pop"><Icon name="check" size={32} stroke={3.4} /></div>
      <div className="mt-4 font-display text-lg font-black">Позиция открыта</div>
      <div className="mt-1 font-mono text-sm text-ink-300">{side.toUpperCase()} BTC · ${fmt(pos, 0)} · {lev}x</div>
      <div className="mt-3 flex gap-2"><Chip tone="gold">+25 XP</Chip><Chip tone="sky">Квест 2/3</Chip></div>
      <Btn s="sm" v="ink" className="mt-5" onClick={() => setPhase("form")}>Новая сделка</Btn>
    </div>
  );
  return (
    <div className="space-y-4">
      <Segmented value={side} onChange={setSide} options={[
        { v: "long", label: "Long ↑", tone: "bg-bull shadow-[0_3px_0_var(--color-bull-d)]" },
        { v: "short", label: "Short ↓", tone: "bg-bear shadow-[0_3px_0_var(--color-bear-d)]" },
      ]} />
      <div>
        <div className="flex justify-between"><Label>Маржа</Label><span className="font-mono text-[11px] text-ink-400">баланс $1 000</span></div>
        <div className="well flex items-center gap-2 p-1.5">
          <button className="btn3d v-ink size-9 text-base" onClick={() => { tap("tick"); setAmt(Math.max(10, amt - 50)); }}>−</button>
          <div className="flex-1 text-center font-mono text-xl font-bold tabular-nums">${amt}</div>
          <button className="btn3d v-ink size-9 text-base" onClick={() => { tap("tick"); setAmt(Math.min(1000, amt + 50)); }}>+</button>
        </div>
      </div>
      <div>
        <Label>Плечо</Label>
        <div className="grid grid-cols-5 gap-2">
          {[1, 3, 5, 10, 25].map((l) => (
            <button key={l} onClick={() => { tap("tick"); setLev(l); }} data-state={lev === l ? "selected" : undefined}
              className={cn("tile3d h-10 font-display text-xs font-bold", l >= 10 && lev === l && "!border-bear !shadow-[0_4px_0_var(--color-bear-d)] !bg-bear/10 text-bear")}>{l}x</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {([["TP", tp, setTp, "+8%", "bull"], ["SL", sl, setSl, "−3%", "bear"]] as const).map(([n, on, set, v, tone]) => (
          <button key={n} onClick={() => { tap("tick"); set(!on); }} className={cn("flex items-center justify-between rounded-xl px-3 py-2.5 ring-2 transition-colors", on ? (tone === "bull" ? "bg-bull/10 ring-bull/50" : "bg-bear/10 ring-bear/50") : "bg-ink-850 ring-ink-700")}>
            <span className="font-display text-[11px] font-bold">{n}</span>
            <span className={cn("font-mono text-xs font-bold", on ? (tone === "bull" ? "text-bull" : "text-bear") : "text-ink-500")}>{on ? v : "выкл"}</span>
          </button>
        ))}
      </div>
      <div className="well grid grid-cols-2 gap-y-1 p-3 font-mono text-[11px]">
        <span className="text-ink-400">Размер позиции</span><span className="text-right font-bold">${fmt(pos, 0)}</span>
        <span className="text-ink-400">Цена входа</span><span className="text-right font-bold">{fmt(price, 0)}</span>
        <span className="text-ink-400">Ликвидация</span><span className={cn("text-right font-bold", lev >= 10 ? "text-bear" : "text-flame")}>{fmt(liq, 0)}</span>
      </div>
      <Btn block s="lg" v={side === "long" ? "bull" : "bear"} loading={phase === "sending"} onClick={submit}>{side === "long" ? "Открыть Long" : "Открыть Short"}</Btn>
    </div>
  );
}

/* T03 — Order book */
export function OrderBook() {
  const [mid, setMid] = useState(67412);
  const [seed, setSeed] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  useInterval(() => { setMid((m) => m + (Math.random() - 0.5) * 8); setSeed((s) => s + 1); }, 700);
  const levels = useMemo(() => {
    const mk = (sgn: number) => Array.from({ length: 6 }, (_, i) => ({ p: mid + sgn * (i + 1) * 2.5, q: +(0.2 + Math.random() * 2.4).toFixed(3) }));
    return { asks: mk(1).reverse(), bids: mk(-1) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const maxQ = 2.6;
  const Row = ({ p, q, side }: { p: number; q: number; side: "a" | "b" }) => (
    <button onClick={() => { tap("tick"); setPick(p); }} className={cn("relative grid w-full grid-cols-3 px-3 py-[5px] font-mono text-[11px] hover:bg-white/5", pick === p && "bg-white/10")}>
      <span className={cn("absolute inset-y-0 right-0 transition-[width] duration-500", side === "a" ? "bg-bear/15" : "bg-bull/15")} style={{ width: `${(q / maxQ) * 100}%` }} />
      <span className={cn("relative text-left font-bold", side === "a" ? "text-bear" : "text-bull")}>{fmt(p, 1)}</span>
      <span className="relative text-right tabular-nums">{q.toFixed(3)}</span>
      <span className="relative text-right tabular-nums text-ink-400">{fmt(p * q, 0)}</span>
    </button>
  );
  const spread = levels.asks[levels.asks.length - 1].p - levels.bids[0].p;
  return (
    <div className="panel-soft overflow-hidden">
      <div className="grid grid-cols-3 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400"><span>Цена</span><span className="text-right">Кол-во</span><span className="text-right">Сумма</span></div>
      {levels.asks.map((l, i) => <Row key={"a" + i} {...l} side="a" />)}
      <div className="flex items-center justify-between border-y border-white/5 bg-ink-850 px-3 py-2">
        <span className="font-mono text-base font-bold text-white tabular-nums">{fmt(mid, 1)}</span>
        <span className="font-mono text-[10px] text-ink-400">спред {spread.toFixed(1)}</span>
      </div>
      {levels.bids.map((l, i) => <Row key={"b" + i} {...l} side="b" />)}
      <div className="px-3 py-2 text-[11px] text-ink-400">{pick ? <>Лимит-цена: <b className="font-mono text-sky">{fmt(pick, 1)}</b></> : "Тапни уровень → лимит-цена"}</div>
    </div>
  );
}

/* T04 — PnL card */
export function PnlCard() {
  const [pnl, setPnl] = useState(184.2);
  const [hidden, setHidden] = useState(false);
  useInterval(() => setPnl((p) => p + (Math.random() - 0.45) * 6), 1000);
  const v = useCountUp(pnl, 700);
  const up = v >= 0;
  const roe = (v / 250) * 100;
  return (
    <div className={cn("relative overflow-hidden rounded-3xl p-5 ring-1 shadow-[0_6px_0_#0a1430]", up ? "bg-gradient-to-br from-bull/25 via-ink-800 to-ink-850 ring-bull/30" : "bg-gradient-to-br from-bear/25 via-ink-800 to-ink-850 ring-bear/30")}>
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-current opacity-10 blur-2xl" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Chip tone="bull">Long 10x</Chip><span className="font-display text-xs font-bold">BTC/USDT</span></div>
        <button onClick={() => { tap("tick"); setHidden(!hidden); }} className="text-ink-300 hover:text-white" aria-label="hide"><Icon name={hidden ? "eyeOff" : "eye"} size={18} /></button>
      </div>
      <div className="mt-4 text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Нереализ. PnL</div>
      <div className={cn("font-display text-4xl font-black tabular-nums drop-shadow-[0_4px_0_rgba(0,0,0,.35)]", up ? "text-bull" : "text-bear")}>
        {hidden ? "••••" : `${up ? "+" : "−"}$${fmt(Math.abs(v))}`}
      </div>
      <div className={cn("mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 font-mono text-sm font-bold", up ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
        <Icon name={up ? "trendUp" : "trendDown"} size={14} stroke={2.6} />ROE {hidden ? "••" : `${roe.toFixed(1)}%`}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px]">
        {[["Вход", "66 210"], ["Марк", "67 412"], ["Ликв.", "59 870"]].map(([a, b]) => <div key={a} className="rounded-xl bg-ink-950/40 px-2 py-1.5"><div className="text-ink-400">{a}</div><div className="font-bold">{b}</div></div>)}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn s="sm" v="ink" icon="share" onClick={() => notify("Карточка PnL сохранена в галерею", "info")}>Поделиться</Btn>
        <Btn s="sm" v="gold" icon="target" onClick={() => { sfx("coin"); notify(`Зафиксировано ${up ? "+" : ""}$${fmt(v)}`, "success"); }}>Зафиксировать</Btn>
      </div>
    </div>
  );
}

/* T05 — Fear & Greed gauge */
export function FearGreed() {
  const [val, setVal] = useState(72);
  const zones = [{ t: "Страх+", c: "#FF4D6D" }, { t: "Страх", c: "#FF8A3D" }, { t: "Нейтр.", c: "#FFC940" }, { t: "Жадность", c: "#8BE36B" }, { t: "Жадн.+", c: "#2BE38B" }];
  const z = zones[Math.min(4, Math.floor(val / 20))];
  const ang = -90 + (val / 100) * 180;
  const arc = (a0: number, a1: number) => {
    const r = 80, cx = 100, cy = 100;
    const p = (a: number) => [cx + r * Math.cos(((a - 180) * Math.PI) / 180), cy + r * Math.sin(((a - 180) * Math.PI) / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1);
    return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <div className="text-center">
      <svg viewBox="0 0 200 118" className="mx-auto w-full max-w-[280px]">
        {zones.map((zz, i) => <path key={i} d={arc(i * 36 + 2, (i + 1) * 36 - 2)} stroke={zz.c} strokeWidth="18" fill="none" strokeLinecap="round" opacity={z === zz ? 1 : 0.35} style={{ transition: "opacity .3s" }} />)}
        <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: "100px 100px", transition: "transform .8s cubic-bezier(.34,1.56,.64,1)" }}>
          <path d="M97 100 L100 30 L103 100 Z" fill="#fff" />
        </g>
        <circle cx="100" cy="100" r="10" fill="#DFE7FA" stroke="#081229" strokeWidth="3" />
      </svg>
      <div className="-mt-1 font-display text-3xl font-black tabular-nums" style={{ color: z.c }}>{val}</div>
      <div className="font-display text-xs font-bold uppercase" style={{ color: z.c }}>{z.t}</div>
      <div className="mt-3 flex justify-center gap-2">
        <Btn s="xs" v="bear" onClick={() => { haptic(15); setVal(Math.max(0, val - 17)); }}>Паника</Btn>
        <Btn s="xs" v="bull" onClick={() => { haptic(15); setVal(Math.min(100, val + 17)); }}>Эйфория</Btn>
      </div>
      <div className="mt-3 text-[11px] text-ink-400">{val > 70 ? "Все жадничают — время осторожности" : val < 30 ? "Толпа в страхе — ищи возможности" : "Рынок в равновесии"}</div>
    </div>
  );
}
