import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { CandleSpark, genCandles, mulberry32 } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   КОНСТРУКТОРЫ: Strategy Constructor · Volatility Reactor ·
   Workspace Builder. Каждый — перестройка всей композиции блока.
   ═══════════════════════════════════════════════════════════════════ */

/* ── TL15 · STRATEGY CONSTRUCTOR ────────────────────────── */
type Lane = "signal" | "confirm" | "entry" | "risk" | "exit";
const LANES: { k: Lane; t: string; hex: string }[] = [
  { k: "signal", t: "Сигнал", hex: "#3D9BFF" },
  { k: "confirm", t: "Подтверждение", hex: "#9A6BFF" },
  { k: "entry", t: "Вход", hex: "#2BE38B" },
  { k: "risk", t: "Риск", hex: "#FFC940" },
  { k: "exit", t: "Выход", hex: "#FF4D6D" },
];
const OPTS: Record<Lane, string[]> = {
  signal: ["RSI < 30", "MACD пересечение", "Пробой уровня", "Двойное дно"],
  confirm: ["Объём ×2", "Ретест уровня", "Новость+", "Свеча поглощения"],
  entry: ["Лимит-ордер", "Маркет-ордер", "Стоп-ордер"],
  risk: ["Стоп 2%", "Трейлинг 1.5%", "Риск 1% депозита"],
  exit: ["Тейк 1:2", "По времени 4ч", "По RSI > 70"],
};
type Node = { id: number; lane: Lane; opt: string; x: number; y: number };
let nid = 1;

function backtest(nodes: Node[]) {
  const s = nodes.map((n) => n.opt).join("|");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const has = (l: Lane) => nodes.some((n) => n.lane === l);
  const complete = has("signal") && has("entry") && has("risk");
  const wr = complete ? 48 + (h % 22) : 0;
  const pf = complete ? (1.1 + ((h >> 4) % 100) / 100).toFixed(2) : "—";
  const trades = complete ? 24 + (h % 40) : 0;
  return { complete, wr, pf, trades };
}

export function StrategyConstructor() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: nid++, lane: "signal", opt: "RSI < 30", x: 8, y: 12 },
    { id: nid++, lane: "entry", opt: "Лимит-ордер", x: 40, y: 52 },
    { id: nid++, lane: "risk", opt: "Стоп 2%", x: 66, y: 20 },
  ]);
  const [drag, setDrag] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [prog, setProg] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const off = useRef({ x: 0, y: 0 });
  const bt = backtest(nodes);
  const eq = useMemo(() => {
    const rnd = mulberry32(nodes.reduce((a, n) => a + n.id * 7 + n.opt.length, 13));
    let v = 0; const out = [0];
    for (let i = 0; i < 48; i++) { v += (rnd() - (bt.complete ? 0.42 : 0.55)) * 2; out.push(v); }
    return out;
  }, [nodes, bt.complete]);

  useEffect(() => {
    if (!running) return;
    setProg(0);
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 2200);
      setProg(k);
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        setRunning(false);
        if (bt.complete && bt.wr >= 55) { sfx("levelup"); notify(`Бэктест: WR ${bt.wr}% · PF ${bt.pf}`, "success"); }
        else if (bt.complete) { sfx("coin"); notify(`Бэктест: WR ${bt.wr}% — докрути фильтры`, "info"); }
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const add = (lane: Lane, opt: string) => {
    tap("tick");
    setNodes((ns) => {
      if (ns.some((n) => n.lane === lane && n.opt === opt)) return ns;
      const li = LANES.findIndex((l) => l.k === lane);
      return [...ns, { id: nid++, lane, opt, x: 8 + li * 17 + Math.random() * 4, y: 10 + Math.random() * 68 }];
    });
    sfx("coin");
  };
  const ordered = [...nodes].sort((a, b) => LANES.findIndex((l) => l.k === a.lane) - LANES.findIndex((l) => l.k === b.lane) || a.y - b.y);

  const posOf = (n: Node) => ({ x: n.x, y: n.y });
  const path = (a: Node, b: Node) => {
    const A = posOf(a), B = posOf(b);
    const mx = (A.x + B.x) / 2;
    return `M${A.x} ${A.y} C${mx} ${A.y}, ${mx} ${B.y}, ${B.x} ${B.y}`;
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={bt.complete ? "bull" : "gold"}>{bt.complete ? `Готова к тесту · ${nodes.length} блоков` : "Собери цепочку: сигнал + вход + риск"}</Chip>
        <span className="ml-auto flex gap-4 font-mono text-[11px]">
          <span>WR <b className={bt.wr >= 55 ? "text-bull" : "text-ink-300"}>{bt.complete ? `${bt.wr}%` : "—"}</b></span>
          <span>PF <b className="text-sky">{bt.pf}</b></span>
          <span className="text-ink-500">{bt.trades} сделок</span>
        </span>
      </div>

      {/* палитра */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {LANES.map((l) => (
          <div key={l.k} className="min-w-40 flex-1 rounded-2xl bg-ink-950/50 p-2 ring-1 ring-white/5">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: l.hex }} />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: l.hex }}>{l.t}</span>
            </div>
            <div className="space-y-1">
              {OPTS[l.k].map((o) => {
                const has = nodes.some((n) => n.lane === l.k && n.opt === o);
                return (
                  <button key={o} onClick={() => add(l.k, o)}
                    className={cn("block w-full truncate rounded-lg px-2 py-1.5 text-left text-[11px] font-bold transition-all", has ? "opacity-40 line-through" : "bg-ink-800 hover:-translate-y-0.5 hover:bg-ink-700")}>
                    + {o}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* холст */}
      <div ref={box} className="relative mt-3 h-72 overflow-hidden rounded-2xl bg-ink-950/70 ring-1 ring-white/5"
        style={{ touchAction: "none" }}
        onPointerMove={(e) => {
          if (drag === null) return;
          const r = box.current!.getBoundingClientRect();
          const x = ((e.clientX - r.left - off.current.x) / r.width) * 100;
          const y = ((e.clientY - r.top - off.current.y) / r.height) * 100;
          setNodes((ns) => ns.map((n) => (n.id === drag ? { ...n, x: Math.max(4, Math.min(96, x)), y: Math.max(8, Math.min(92, y)) } : n)));
        }}
        onPointerUp={() => { setDrag(null); haptic(6); }}
        onPointerCancel={() => setDrag(null)}
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(125,147,198,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(125,147,198,.12) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
        {/* связи */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="scl" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#3D9BFF" /><stop offset="1" stopColor="#2BE38B" />
            </linearGradient>
          </defs>
          {ordered.slice(0, -1).map((n, i) => (
            <path key={n.id} d={path(n, ordered[i + 1])} fill="none" stroke="url(#scl)" strokeWidth="1.1" strokeDasharray="3 2" opacity=".85">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
            </path>
          ))}
        </svg>
        {/* узлы */}
        {nodes.map((n, idx) => {
          const L = LANES.find((l) => l.k === n.lane)!;
          const isFirst = idx === 0 || ordered[ordered.indexOf(n) - 1]?.lane !== n.lane;
          return (
            <div key={n.id}
              onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); off.current = { x: 0, y: 20 }; setDrag(n.id); tap("tick"); }}
              className="absolute z-10 w-32 -translate-x-1/2 -translate-y-1/2 cursor-grab select-none active:cursor-grabbing"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className="rounded-xl bg-ink-800 p-1.5 ring-2 shadow-[0_5px_0_rgba(0,0,0,.45)]" style={{ ["--tw-ring-color" as string]: L.hex } as React.CSSProperties}>
                <div className="flex items-center gap-1">
                  <span className="rounded px-1 font-display text-[8px] font-black uppercase text-ink-900" style={{ background: L.hex }}>{isFirst ? `${ordered.indexOf(n) + 1}` : "•"}</span>
                  <span className="truncate text-[10px] font-black">{n.opt}</span>
                  <button aria-label="Убрать" onClick={(e) => { e.stopPropagation(); tap("tick"); setNodes((ns) => ns.filter((x) => x.id !== n.id)); }}
                    className="ml-auto rounded p-0.5 text-ink-500 hover:text-bear"><Icon name="x" size={11} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {nodes.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-[12px] text-ink-500">Кликай блоки сверху — они появятся здесь</div>}
        <div className="absolute bottom-2 left-3 font-mono text-[9px] text-ink-500">тяни узлы · связи перестраиваются · порядок = слева направо</div>
      </div>

      {/* итог + бэктест */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_220px]">
        <div className="rounded-2xl bg-ink-950/50 p-3 font-mono text-[11px] leading-relaxed ring-1 ring-white/5">
          <span className="text-ink-500">ЕСЛИ </span>
          {ordered.length ? ordered.map((n, i) => (
            <span key={n.id}><b style={{ color: LANES.find((l) => l.k === n.lane)!.hex }}>{n.opt}</b>{i < ordered.length - 1 && <span className="text-ink-500"> → </span>}</span>
          )) : <span className="text-ink-600">…пусто…</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 overflow-hidden rounded-xl bg-ink-950/60 ring-1 ring-white/5">
            <svg viewBox="0 0 48 20" className="h-full w-full" preserveAspectRatio="none">
              <polyline points={eq.map((v, i) => `${(i / (eq.length - 1)) * 48},${10 - v * 0.6}`).join(" ")} fill="none" stroke={bt.wr >= 55 ? "#2BE38B" : "#FFC940"} strokeWidth="1.6"
                strokeDasharray="60" strokeDashoffset={running ? 60 * (1 - prog) : 0} style={{ transition: "stroke-dashoffset .1s linear" }} />
            </svg>
          </div>
          <Btn s="md" block v={bt.complete ? "bull" : "ink"} disabled={!bt.complete || running} loading={running} icon="play"
            onClick={() => { setRunning(true); haptic(15); }}>
            {running ? `${Math.round(prog * 100)}%` : "Бэктест"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── TL16 · VOLATILITY REACTOR ──────────────────────────── */
export function VolatilityReactor() {
  const [vol, setVol] = useState(0.55);
  const [trend, setTrend] = useState(0.2);
  const [noise, setNoise] = useState(0.4);
  const [speed, setSpeed] = useState(1);
  const [pulse, setPulse] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  const prm = useRef({ vol, trend, noise, speed, pulse });
  prm.current = { vol, trend, noise, speed, pulse };

  useEffect(() => {
    const c = cv.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0; let t = 0;
    const P = Array.from({ length: 90 }, () => ({ a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.7, s: 0.5 + Math.random() * 2, o: Math.random() }));
    const draw = () => {
      t += 0.016 * prm.current.speed;
      const r = c.parentElement!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = r.width * dpr; c.height = 260 * dpr;
      c.style.height = "260px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = r.width, H = 260;
      ctx.clearRect(0, 0, W, H);
      const { vol: v, trend: tr, noise: nz, pulse: pu } = prm.current;
      const bull = tr >= 0;
      const col = bull ? "43,227,139" : "255,77,109";
      // фоновая сетка с дыханием
      ctx.strokeStyle = "rgba(125,147,198,.1)";
      for (let i = 0; i < 8; i++) {
        const y = (H / 8) * i + Math.sin(t * 2 + i) * 3 * v;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // волна
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const k = x / W;
        const y = H / 2
          + Math.sin(k * 9 + t * 3) * 46 * v
          + Math.sin(k * 23 - t * 5) * 18 * v * nz
          + (k - 0.5) * -tr * 90;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${col},.95)`;
      ctx.lineWidth = 2.6;
      ctx.shadowColor = `rgba(${col},.8)`;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // заливка под волной
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, `rgba(${col},.28)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.fill();
      // частицы
      P.forEach((p, i) => {
        p.a += 0.008 * prm.current.speed * (0.5 + v);
        const R = (0.25 + p.r * (0.4 + v)) * Math.min(W, H) * 0.55;
        const x = W / 2 + Math.cos(p.a + i) * R;
        const y = H / 2 + Math.sin(p.a * 1.3 + i * 2) * R * 0.6 - tr * 40;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 3 + p.o * 9));
        ctx.fillStyle = i % 5 === 0 ? `rgba(255,201,64,${tw})` : `rgba(${col},${tw * 0.9})`;
        const s = p.s * (1 + v * 1.6) * (pu && i % 7 === 0 ? 2.2 : 1);
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
      });
      // ядро
      const core = 10 + Math.sin(t * 4) * 3 * (0.5 + v) + (pu ? 6 : 0);
      const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, core * 4);
      cg.addColorStop(0, "#fff");
      cg.addColorStop(0.3, `rgba(${col},.9)`);
      cg.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(W / 2, H / 2, core * 4, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const atr = (vol * 4.2).toFixed(2);
  const regime = vol > 0.75 ? "Шторм" : vol > 0.45 ? "Живой рынок" : "Штиль";
  const Slider = ({ label, v, set, hex }: { label: string; v: number; set: (v: number) => void; hex: string }) => (
    <div>
      <div className="flex justify-between"><Label className="mb-1">{label}</Label><b className="font-mono text-[12px]" style={{ color: hex }}>{v.toFixed(2)}</b></div>
      <div className="relative">
        <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
        <div className="absolute left-0 top-[11px] h-3 rounded-full" style={{ width: `${v * 100}%`, background: hex }} />
        <input type="range" min={0} max={1} step={0.01} value={v} aria-label={label} onChange={(e) => set(+e.target.value)} className="rng relative" />
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-3xl bg-ink-950 p-4 ring-1 ring-violet/30 sm:p-5">
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
        <canvas ref={cv} className="block w-full" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-lg bg-ink-950/80 px-2 py-1 font-display text-[10px] font-black uppercase text-violet backdrop-blur">reactor</span>
          <span className="rounded-lg bg-ink-950/80 px-2 py-1 font-mono text-[10px] text-ink-300 backdrop-blur">ATR {atr}% · {regime}</span>
        </div>
        <button onClick={() => { tap(pulse ? "error" : "levelup"); setPulse(!pulse); haptic(pulse ? 10 : [10, 40, 10]); }}
          className={cn("absolute bottom-3 right-3 rounded-xl px-3 py-2 font-display text-[10px] font-black uppercase transition-all", pulse ? "bg-gold text-ink-900 animate-pulse" : "bg-ink-800/90 text-ink-200")}>
          {pulse ? "⚡ импульс" : "импульс"}
        </button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Slider label="Волатильность" v={vol} set={setVol} hex="#9A6BFF" />
        <div>
          <div className="flex justify-between"><Label className="mb-1">Тренд</Label><b className={cn("font-mono text-[12px]", trend >= 0 ? "text-bull" : "text-bear")}>{trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(2)}</b></div>
          <div className="relative">
            <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
            <div className="absolute top-[11px] h-3 rounded-full" style={{ left: trend < 0 ? `${(trend + 1) * 50}%` : "50%", width: `${Math.abs(trend) * 50}%`, background: trend >= 0 ? "#2BE38B" : "#FF4D6D" }} />
            <input type="range" min={-1} max={1} step={0.01} value={trend} aria-label="тренд" onChange={(e) => setTrend(+e.target.value)} className="rng relative" />
          </div>
        </div>
        <Slider label="Шум" v={noise} set={setNoise} hex="#3D9BFF" />
        <div>
          <div className="flex justify-between"><Label className="mb-1">Скорость ×{speed.toFixed(1)}</Label></div>
          <div className="flex gap-1">
            {[0.5, 1, 2, 3].map((s) => (
              <button key={s} onClick={() => { tap("tick"); setSpeed(s); }} className={cn("flex-1 rounded-lg py-2 font-mono text-[11px] font-bold", speed === s ? "bg-violet text-white" : "bg-ink-800 text-ink-300")}>×{s}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-ink-500">Регуляторы мгновенно меняют амплитуду, цвет, скорость и плотность частиц. Запоминающийся момент — кнопка импульса.</div>
    </div>
  );
}

/* ── TL17 · WORKSPACE BUILDER ───────────────────────────── */
type Comp = "chart" | "book" | "watch" | "news" | "pos";
const COMP_META: Record<Comp, { t: string; hex: string }> = {
  chart: { t: "График", hex: "#2BE38B" }, book: { t: "Стакан", hex: "#FF4D6D" },
  watch: { t: "Вотчлист", hex: "#3D9BFF" }, news: { t: "Новости", hex: "#FFC940" }, pos: { t: "Позиции", hex: "#9A6BFF" },
};
const PRESETS: Record<string, Comp[]> = {
  "Скальпер": ["chart", "book", "pos", "watch"],
  "Свинг": ["chart", "news", "watch", "pos"],
  "Минимализм": ["chart", "pos", "watch", "book"],
};

function MiniComp({ k, data }: { k: Comp; data: ReturnType<typeof genCandles> }) {
  if (k === "chart") return (
    <div className="h-full p-1.5"><CandleSpark data={data} w={220} h={64} hex="#2BE38B" />
      <div className="mt-1 flex justify-between font-mono text-[9px] text-ink-400"><span>BTC 67 412</span><span className="text-bull">+1.2%</span></div>
    </div>
  );
  if (k === "book") return (
    <div className="space-y-1 p-2 font-mono text-[9px]">
      {[["67 418", "0.42", "bear"], ["67 415", "1.08", "bear"], ["67 412", "2.31", "bull"], ["67 409", "0.87", "bull"]].map(([p, q, c]) => (
        <div key={p} className="relative flex justify-between overflow-hidden rounded px-1.5 py-0.5">
          <span className={cn("absolute inset-y-0 left-0", c === "bull" ? "bg-bull/15" : "bg-bear/15")} style={{ width: `${+q * 38}%` }} />
          <span className={cn("relative", c === "bull" ? "text-bull" : "text-bear")}>{p}</span><span className="relative">{q}</span>
        </div>
      ))}
    </div>
  );
  if (k === "watch") return (
    <div className="space-y-1 p-2 text-[10px] font-bold">
      {[["BTC", "+2.1%", "text-bull"], ["ETH", "−0.8%", "text-bear"], ["SOL", "+5.4%", "text-bull"]].map(([s, c, cls]) => (
        <div key={s} className="flex justify-between rounded-lg bg-ink-900/60 px-2 py-1"><span>{s}</span><span className={cls as string}>{c}</span></div>
      ))}
    </div>
  );
  if (k === "news") return (
    <div className="space-y-1 p-2 text-[10px]">
      {[["ETF притоки рекорд", "2 мин"], ["ФРС: пауза", "1 ч"]].map(([t, tm]) => (
        <div key={t} className="rounded-lg bg-ink-900/60 px-2 py-1"><b>{t}</b><div className="text-ink-500">{tm} назад</div></div>
      ))}
    </div>
  );
  return (
    <div className="p-2 font-mono text-[10px]">
      <div className="flex justify-between rounded-lg bg-bull/15 px-2 py-1"><span>LONG BTC</span><b className="text-bull">+$142</b></div>
      <div className="mt-1 flex justify-between rounded-lg bg-bear/15 px-2 py-1"><span>SHORT ETH</span><b className="text-bear">−$12</b></div>
    </div>
  );
}

export function WorkspaceBuilder() {
  const [slots, setSlots] = useState<Comp[]>(PRESETS["Скальпер"]);
  const [preset, setPreset] = useState("Скальпер");
  const [sel, setSel] = useState<number | null>(null);
  const [hidden, setHidden] = useState<Comp[]>([]);
  const [compact, setCompact] = useState(false);
  const data = useMemo(() => genCandles(9, 40, 67000, "trend-up", 1), []);
  const vis = slots.filter((s) => !hidden.includes(s));

  const move = (from: number, to: number) => {
    if (from === to) return;
    setSlots((s) => { const n = [...s]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n; });
    setPreset("Свой");
    sfx("whoosh"); haptic(8);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {Object.keys(PRESETS).map((p) => (
            <button key={p} onClick={() => { tap("tick"); setSlots(PRESETS[p]); setHidden([]); setPreset(p); sfx("whoosh"); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", preset === p ? "bg-sky text-white" : "text-ink-300 hover:text-white")}>{p}</button>
          ))}
        </div>
        <button onClick={() => { tap("tick"); setCompact(!compact); }} className={cn("rounded-xl px-3 py-1.5 text-[11px] font-bold", compact ? "bg-violet/20 text-violet" : "bg-ink-800 text-ink-300")}>
          {compact ? "Компакт" : "Комфорт"}
        </button>
        <span className="ml-auto hidden text-[11px] text-ink-500 sm:block">Клик по панели → клик по слоту = переместить · магнитит к сетке</span>
      </div>

      <div className={cn("mt-3 grid gap-2", compact ? "sm:grid-cols-4" : "sm:grid-cols-2")}>
        {vis.map((c, i) => (
          <button key={`${c}-${i}`} onClick={() => {
            if (sel === null) { tap("tick"); setSel(i); }
            else { move(sel, i); setSel(null); }
          }}
            className={cn("overflow-hidden rounded-2xl bg-ink-950/60 text-left ring-2 transition-all", sel === i ? "ring-gold scale-[1.02]" : "ring-white/5 hover:ring-white/20")}
            style={{ minHeight: compact ? 110 : c === "chart" ? 170 : 140 }}>
            <div className="flex items-center gap-1.5 px-2.5 pt-2">
              <span className="size-2 rounded-full" style={{ background: COMP_META[c].hex }} />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: COMP_META[c].hex }}>{COMP_META[c].t}</span>
              <span className="ml-auto font-mono text-[9px] text-ink-600">слот {i + 1}</span>
              <span onClick={(e) => { e.stopPropagation(); tap("tick"); setHidden((h) => [...h, c]); }} className="cursor-pointer rounded p-0.5 text-ink-500 hover:text-bear" role="button" aria-label="Скрыть"><Icon name="x" size={11} /></span>
            </div>
            <MiniComp k={c} data={data} />
            {sel === i && <div className="bg-gold/15 py-1 text-center text-[10px] font-bold text-gold">выбрана → кликни целевой слот</div>}
          </button>
        ))}
      </div>
      {hidden.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ink-500">Скрыты:</span>
          {hidden.map((c) => (
            <button key={c} onClick={() => { tap("tick"); setHidden((h) => h.filter((x) => x !== c)); }} className="rounded-lg bg-ink-800 px-2 py-1 text-[11px] font-bold text-ink-300">+ {COMP_META[c].t}</button>
          ))}
        </div>
      )}
      <div className="mt-2 text-[11px] text-ink-500">Компоненты магнитно встают в сетку, запоминают порядок, переживают смену пресета «Свой». Попробуй: выбери панель, кликни другой слот.</div>
    </div>
  );
}
