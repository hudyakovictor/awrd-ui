/* 59 · ARBITRAGE NETWORK — link venues into a route and race the spread.
   Click nodes to chain legs · live venue prices drift · auto route finder
   · execution animation (coin travels each leg while prices keep moving)
   · expected vs realized PnL · spread heat matrix. */
import { AnimatePresence, motion } from "framer-motion";
import { Play, RotateCcw, Search, Undo2 } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { clamp, useOnScreen, useRafLoop } from "../showcase/fx";
import { fmtPrice } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const VENUES = [
  { id: "BIN", name: "Binance", color: "#F0B90B", fee: 0.1, lat: 0.6 },
  { id: "CB", name: "Coinbase", color: "#1f6bff", fee: 0.4, lat: 0.9 },
  { id: "KRK", name: "Kraken", color: "#7b61ff", fee: 0.26, lat: 1.1 },
  { id: "OKX", name: "OKX", color: "#e8eefc", fee: 0.1, lat: 0.7 },
  { id: "BYB", name: "Bybit", color: "#ff8b3d", fee: 0.1, lat: 0.65 },
  { id: "UNI", name: "Uniswap", color: "#ff007a", fee: 0.3, lat: 1.6 },
  { id: "CRV", name: "Curve", color: "#2ede8a", fee: 0.04, lat: 1.4 },
];
const NV = VENUES.length;
const BASE = 97400;

type Exec = { leg: number; t: number; startPrices: number[]; path: number[]; capital: number; expected: number };

function routePnl(path: number[], prices: number[], capital: number, withFees: boolean) {
  if (path.length < 2) return 0;
  let btc = capital / prices[path[0]] * (1 - (withFees ? VENUES[path[0]].fee / 100 : 0));
  let usd = 0;
  for (let k = 1; k < path.length; k++) {
    const v = path[k];
    usd = btc * prices[v] * (1 - (withFees ? VENUES[v].fee / 100 : 0));
    if (k < path.length - 1) btc = usd / prices[v];
  }
  return usd - capital;
}

export default function ArbitrageNetwork() {
  const [prices, setPrices] = useState<number[]>(() => VENUES.map((_, i) => BASE * (1 + (i - 3) * 0.0012)));
  const [path, setPath] = useState<number[]>([]);
  const [capital, setCapital] = useState(25000);
  const [fees, setFees] = useState<"with fees" | "no fees">("with fees");
  const [vol, setVol] = useState(45);
  const [hoverV, setHoverV] = useState<number | null>(null);
  const [hoverEdge, setHoverEdge] = useState<[number, number] | null>(null);
  const [exec, setExec] = useState<Exec | null>(null);
  const [result, setResult] = useState<{ expected: number; realized: number } | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const offsets = useRef(VENUES.map(() => (Math.random() - 0.5) * 0.004));
  const { ref: wrapRef, inView } = useOnScreen<HTMLDivElement>();
  const withFees = fees === "with fees";

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => {
      offsets.current = offsets.current.map((o) => clamp(o * 0.94 + (Math.random() - 0.5) * 0.0011 * (vol / 40), -0.006, 0.006));
      setPrices((ps) => {
        const base = ps.reduce((s, p) => s + p, 0) / NV + (Math.random() - 0.5) * 12;
        return VENUES.map((_, i) => base * (1 + offsets.current[i]));
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [inView, vol]);

  useRafLoop((dt) => {
    if (!exec) return;
    const legDur = VENUES[exec.path[exec.leg + 1]].lat;
    const nt = exec.t + dt / legDur;
    if (nt >= 1) {
      sfx.coin();
      if (exec.leg + 1 >= exec.path.length - 1) {
        const realized = routePnl(exec.path, prices, exec.capital, withFees);
        setResult({ expected: exec.expected, realized });
        setHistory((h) => [realized, ...h].slice(0, 8));
        setExec(null);
        if (realized > 0) sfx.success(); else sfx.error();
        return;
      }
      setExec({ ...exec, leg: exec.leg + 1, t: 0 });
    } else setExec({ ...exec, t: nt });
  }, !!exec);

  const W = 560, H = 420, CX = W / 2, CY = H / 2, R = 160;
  const pos = (i: number) => {
    const a = (i / NV) * Math.PI * 2 - Math.PI / 2;
    return { x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R * 0.9 };
  };

  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const expected = routePnl(path, prices, capital, withFees);

  const best = useMemo(() => {
    let bp: number[] = [];
    let bv = -Infinity;
    for (let a = 0; a < NV; a++) for (let b = 0; b < NV; b++) {
      if (a === b) continue;
      const v2 = routePnl([a, b], prices, capital, withFees);
      if (v2 > bv) { bv = v2; bp = [a, b]; }
      for (let c = 0; c < NV; c++) {
        if (c === a || c === b) continue;
        const v3 = routePnl([a, b, c], prices, capital, withFees);
        if (v3 > bv) { bv = v3; bp = [a, b, c]; }
      }
    }
    return { path: bp, pnl: bv };
  }, [prices, capital, withFees]);

  const clickNode = (i: number) => {
    if (exec) return;
    setResult(null);
    setPath((p) => {
      if (p[p.length - 1] === i) return p.slice(0, -1);
      if (p.includes(i)) return p;
      return p.length >= 5 ? p : [...p, i];
    });
    sfx.pop();
  };

  const run = () => {
    if (path.length < 2 || exec) return;
    setExec({ leg: 0, t: 0, startPrices: [...prices], path: [...path], capital, expected });
    setResult(null);
    sfx.whoosh();
  };

  const legs = path.slice(1).map((v, k) => [path[k], v] as [number, number]);
  const execCoin = exec ? (() => {
    const a = pos(exec.path[exec.leg]), b = pos(exec.path[exec.leg + 1]);
    const t = exec.t;
    const mx = (a.x + b.x) / 2 + (CY - (a.y + b.y) / 2) * 0.18;
    const my = (a.y + b.y) / 2 + ((a.x + b.x) / 2 - CX) * 0.18;
    return {
      x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * mx + t * t * b.x,
      y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * my + t * t * b.y,
    };
  })() : null;

  const curve = (a: number, b: number) => {
    const p1 = pos(a), p2 = pos(b);
    const mx = (p1.x + p2.x) / 2 + (CY - (p1.y + p2.y) / 2) * 0.18;
    const my = (p1.y + p2.y) / 2 + ((p1.x + p2.x) / 2 - CX) * 0.18;
    return `M${p1.x},${p1.y} Q${mx},${my} ${p2.x},${p2.y}`;
  };

  return (
    <ShowcaseSection
      id="arbitrage" index="59" kicker="Arbitrage Network" title="Сеть арбитража между площадками"
      desc="Кликай по биржам, чтобы связать маршрут линиями. Цены на площадках дрейфуют вживую, спреды открываются и схлопываются. Запусти исполнение — монета полетит по ногам, пока рынок продолжает двигаться."
      accent="#F0B90B" variant="circuit"
      keys={[{ k: "Enter", d: "исполнить" }, { k: "F", d: "лучший маршрут" }, { k: "U", d: "undo ноги" }, { k: "Esc", d: "очистить" }]}
      hotkeys={{
        Enter: run,
        f: () => { if (!exec) { setPath(best.path); setResult(null); sfx.levelUp(); } },
        u: () => setPath((p) => p.slice(0, -1)),
        Escape: () => { if (!exec) setPath([]); },
      }}
      moment="Запоминающийся момент: монета летит по дуге, а ожидаемая прибыль тает прямо в полёте"
      tags={<div className="flex gap-2"><Tag tone="gold">spread {(((maxP - minP) / minP) * 100).toFixed(3)}%</Tag><Tag tone={best.pnl > 0 ? "green" : "ghost"}>best ${best.pnl.toFixed(0)}</Tag></div>}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Seg options={["with fees", "no fees"] as const} value={fees} onChange={setFees} accent="#F0B90B" />
        <label className="flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
          Capital ${(capital / 1000).toFixed(0)}k
          <input type="range" min={5000} max={100000} step={5000} value={capital} onChange={(e) => setCapital(+e.target.value)} className="lever w-28" style={{ ["--fill" as string]: `${((capital - 5000) / 95000) * 100}%` }} />
        </label>
        <label className="flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
          Dislocation {vol}
          <input type="range" min={5} max={100} value={vol} onChange={(e) => setVol(+e.target.value)} className="lever w-24" style={{ ["--fill" as string]: `${vol}%` }} />
        </label>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { if (!exec) { setPath(best.path); setResult(null); sfx.levelUp(); } }} className="btn3d btn3d-gold px-3 py-2 text-[10px]"><Search size={13} /> Best route</button>
          <button onClick={() => setPath((p) => p.slice(0, -1))} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><Undo2 size={13} /></button>
          <button onClick={() => { if (!exec) { setPath([]); setResult(null); } }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]"><RotateCcw size={12} /></button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div ref={wrapRef} className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_50%_50%,#1c1a3f,#050a1c_72%)]" style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,.6)" }}>
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full select-none">
            {/* background spread edges */}
            {VENUES.map((_, a) => VENUES.map((__, b) => {
              if (b <= a) return null;
              const sp = Math.abs(prices[a] - prices[b]) / Math.min(prices[a], prices[b]) * 100;
              const hot = hoverEdge && ((hoverEdge[0] === a && hoverEdge[1] === b) || (hoverEdge[0] === b && hoverEdge[1] === a));
              const pa = pos(a), pb = pos(b);
              return (
                <line key={`${a}-${b}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={hot ? "#fff" : sp > 0.4 ? "#F0B90B" : "#5b8cff"} strokeWidth={hot ? 2.5 : 0.6 + sp * 2.2} opacity={hot ? 0.9 : 0.12 + sp * 0.5} />
              );
            }))}
            {/* route legs */}
            {legs.map(([a, b], k) => {
              const gain = prices[b] - prices[a];
              const col = gain >= 0 ? "#2ede8a" : "#ff5470";
              const done = exec ? k < exec.leg : false;
              return (
                <g key={`leg-${k}`}>
                  <path d={curve(a, b)} fill="none" stroke={col} strokeWidth={5} opacity={0.18} />
                  <motion.path d={curve(a, b)} fill="none" stroke={col} strokeWidth={2.8} strokeDasharray="10 8"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1, strokeDashoffset: [0, -36] }}
                    transition={{ pathLength: { duration: 0.5 }, strokeDashoffset: { duration: 1, repeat: Infinity, ease: "linear" } }}
                    style={{ filter: `drop-shadow(0 0 6px ${col})`, opacity: done ? 0.4 : 1 }} />
                </g>
              );
            })}
            {/* coin */}
            {execCoin && (
              <g>
                <circle cx={execCoin.x} cy={execCoin.y} r={20} fill="#F7931A" opacity={0.2} />
                <circle cx={execCoin.x} cy={execCoin.y} r={11} fill="#F7931A" stroke="#fff" strokeWidth={2} style={{ filter: "drop-shadow(0 0 12px #F7931A)" }} />
                <text x={execCoin.x} y={execCoin.y + 4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#231303">₿</text>
              </g>
            )}
            {/* nodes */}
            {VENUES.map((v, i) => {
              const p = pos(i);
              const inPath = path.indexOf(i);
              const cheap = prices[i] === minP, rich = prices[i] === maxP;
              const rel = ((prices[i] - minP) / Math.max(1, maxP - minP));
              return (
                <g key={v.id} className="cursor-pointer" onClick={() => clickNode(i)}
                  onPointerEnter={() => { setHoverV(i); if (path.length) setHoverEdge([path[path.length - 1], i]); }}
                  onPointerLeave={() => { setHoverV(null); setHoverEdge(null); }}
                >
                  <circle cx={p.x} cy={p.y} r={40} fill={v.color} opacity={hoverV === i ? 0.18 : 0.08} />
                  {inPath >= 0 && (
                    <circle cx={p.x} cy={p.y} r={36} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="6 5">
                      <animateTransform attributeName="transform" type="rotate" from={`0 ${p.x} ${p.y}`} to={`360 ${p.x} ${p.y}`} dur="6s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={p.x} cy={p.y} r={28} fill="#081130" stroke={v.color} strokeWidth={3} style={{ filter: `drop-shadow(0 0 ${8 + rel * 10}px ${v.color})` }} />
                  <text x={p.x} y={p.y - 3} textAnchor="middle" fontSize={11} fontWeight={900} fill={v.color}>{v.id}</text>
                  <text x={p.x} y={p.y + 10} textAnchor="middle" fontSize={8.5} fontWeight={800} fill="#fff" fontFamily="JetBrains Mono, monospace">{fmtPrice(prices[i])}</text>
                  {inPath >= 0 && (
                    <g>
                      <circle cx={p.x + 22} cy={p.y - 22} r={10} fill="#fff" />
                      <text x={p.x + 22} y={p.y - 18} textAnchor="middle" fontSize={11} fontWeight={900} fill="#081130">{inPath + 1}</text>
                    </g>
                  )}
                  {(cheap || rich) && (
                    <text x={p.x} y={p.y + 46} textAnchor="middle" fontSize={9} fontWeight={900} fill={cheap ? "#2ede8a" : "#ff8ba0"}>{cheap ? "▼ CHEAPEST" : "▲ RICHEST"}</text>
                  )}
                </g>
              );
            })}
            <text x={CX} y={CY - 6} textAnchor="middle" fontSize={11} fontWeight={800} fill="#7d92c4" letterSpacing={2}>ROUTE</text>
            <text x={CX} y={CY + 16} textAnchor="middle" fontSize={20} fontWeight={900} fill={expected >= 0 ? "#2ede8a" : "#ff5470"} fontFamily="JetBrains Mono, monospace">
              {path.length >= 2 ? `${expected >= 0 ? "+" : ""}$${expected.toFixed(1)}` : "—"}
            </text>
          </svg>
          <p className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-black/55 px-2.5 py-1 text-[10px] font-bold text-[#8ea6d8] backdrop-blur">клик по бирже — добавить ногу · повторный клик по последней — убрать</p>
        </div>

        <div className="space-y-4">
          <ScenePanel title="Route" sub={path.length ? path.map((i) => VENUES[i].id).join(" → ") : "Выбери 2–5 площадок"} accent="#F0B90B">
            <div className="space-y-1.5">
              {legs.length === 0 && <p className="py-3 text-center text-[11px] text-[#54678f]">Buy on first venue, sell on the last</p>}
              {legs.map(([a, b], k) => {
                const d = ((prices[b] - prices[a]) / prices[a]) * 100;
                return (
                  <motion.div key={`${a}-${b}-${k}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className={cn("flex items-center gap-2 rounded-xl border px-2.5 py-2", exec && exec.leg === k ? "border-[#F7931A] bg-[#F7931A]/12" : "border-white/8 bg-black/25")}
                  >
                    <span className="num-mono text-[10px] font-black text-[#7d92c4]">L{k + 1}</span>
                    <span className="text-[11px] font-extrabold" style={{ color: VENUES[a].color }}>{VENUES[a].id}</span>
                    <span className="text-[#54678f]">→</span>
                    <span className="text-[11px] font-extrabold" style={{ color: VENUES[b].color }}>{VENUES[b].id}</span>
                    <span className={cn("num-mono ml-auto text-[11px] font-extrabold", d >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{d >= 0 ? "+" : ""}{d.toFixed(3)}%</span>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <SceneStat label="Expected" value={`${expected >= 0 ? "+" : ""}$${expected.toFixed(2)}`} color={expected >= 0 ? "#2ede8a" : "#ff5470"} />
              <SceneStat label="Latency" value={`${path.slice(1).reduce((s, i) => s + VENUES[i].lat, 0).toFixed(1)}s`} color="#9db9ff" />
            </div>
            <button onClick={run} disabled={path.length < 2 || !!exec} className={cn("btn3d mt-3 w-full py-3.5 text-xs", expected > 0 ? "btn3d-green" : "btn3d-gold")}>
              <Play size={14} /> {exec ? `Executing leg ${exec.leg + 1}…` : "Execute route"}
            </button>
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                  className={cn("mt-3 rounded-2xl border p-3", result.realized >= 0 ? "border-[#2ede8a]/50 bg-[#2ede8a]/10" : "border-[#ff5470]/50 bg-[#ff5470]/10")}
                >
                  <p className={cn("display text-lg font-extrabold", result.realized >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{result.realized >= 0 ? "+" : ""}${result.realized.toFixed(2)} realized</p>
                  <p className="text-[11px] font-bold text-[#aebde6]">expected {result.expected >= 0 ? "+" : ""}${result.expected.toFixed(2)} · slippage ${(result.realized - result.expected).toFixed(2)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </ScenePanel>

          <ScenePanel title="Spread matrix" sub="buy row → sell column" accent="#5b8cff">
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: `28px repeat(${NV}, 1fr)` }}>
              <span />
              {VENUES.map((v) => <span key={v.id} className="text-center text-[8px] font-black" style={{ color: v.color }}>{v.id}</span>)}
              {VENUES.map((va, a) => (
                <Fragment key={`row-${va.id}`}>
                  <span className="text-[8px] font-black leading-5" style={{ color: va.color }}>{va.id}</span>
                  {VENUES.map((vb, b) => {
                    const d = a === b ? 0 : ((prices[b] - prices[a]) / prices[a]) * 100;
                    const on = hoverEdge && hoverEdge[0] === a && hoverEdge[1] === b;
                    return (
                      <button key={`${va.id}-${vb.id}`}
                        onPointerEnter={() => setHoverEdge([a, b])} onPointerLeave={() => setHoverEdge(null)}
                        onClick={() => { if (!exec && a !== b) { setPath([a, b]); setResult(null); sfx.pop(); } }}
                        className="h-5 rounded-[4px] transition"
                        style={{
                          background: a === b ? "rgba(255,255,255,.04)" : d > 0 ? `rgba(46,222,138,${Math.min(0.9, d * 1.8)})` : `rgba(255,84,112,${Math.min(0.9, -d * 1.8)})`,
                          outline: on ? "2px solid #fff" : undefined,
                        }}
                      />
                    );
                  })}
                </Fragment>
              ))}
            </div>
            {history.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {history.map((h, k) => (
                  <span key={k} className={cn("num-mono rounded-md px-1.5 py-0.5 text-[9px] font-extrabold", h >= 0 ? "bg-[#2ede8a]/15 text-[#2ede8a]" : "bg-[#ff5470]/15 text-[#ff8ba0]")}>{h >= 0 ? "+" : ""}{h.toFixed(0)}</span>
                ))}
              </div>
            )}
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
