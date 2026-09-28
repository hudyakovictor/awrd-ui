/* 39 · MARKET DEPTH CHAMBER — orderbook that unfolds into a 3D liquidity wall.
   Hover sync × draggable range × 2D/3D morph × orbit. */
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { fmtPrice } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Row = { p: number; a: number; cum: number; flash: number };

function buildBook(mid: number): { bids: Row[]; asks: Row[] } {
  const bids: Row[] = [];
  const asks: Row[] = [];
  let cb = 0, ca = 0;
  for (let i = 0; i < 14; i++) {
    const ba = 0.2 + Math.random() * 2.4 + (i === 4 ? 5 : 0);
    const aa = 0.2 + Math.random() * 2.4 + (i === 5 ? 6 : 0);
    cb += ba; ca += aa;
    bids.push({ p: mid - (i + 1) * 3.5, a: ba, cum: cb, flash: 0 });
    asks.push({ p: mid + (i + 1) * 3.5, a: aa, cum: ca, flash: 0 });
  }
  return { bids, asks };
}

export default function DepthChamber() {
  const [mid, setMid] = useState(97432);
  const [book, setBook] = useState(() => buildBook(97432));
  const [mode, setMode] = useState<"book" | "wall">("book");
  const [hover, setHover] = useState<{ side: "bid" | "ask"; i: number } | null>(null);
  const [range, setRange] = useState<[number, number]>([2, 11]);
  const [orbit, setOrbit] = useState(32);
  const [spin, setSpin] = useState(false);
  const [live, setLive] = useState(true);
  const dragHandle = useRef<0 | 1 | null>(null);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      setMid((m) => m + (Math.random() - 0.5) * 9);
      setBook((b) => {
        const nb = {
          bids: b.bids.map((r) => ({ ...r, a: Math.max(0.05, r.a + (Math.random() - 0.5) * 0.5), flash: Math.max(0, r.flash - 1) })),
          asks: b.asks.map((r) => ({ ...r, a: Math.max(0.05, r.a + (Math.random() - 0.5) * 0.5), flash: Math.max(0, r.flash - 1) })),
        };
        // random order appear / disappear flash
        const side = Math.random() > 0.5 ? "bids" : "asks";
        const i = Math.floor(Math.random() * 14);
        nb[side][i] = { ...nb[side][i], a: nb[side][i].a + Math.random() * 3, flash: 3 };
        let cb = 0, ca = 0;
        nb.bids.forEach((r) => { cb += r.a; r.cum = cb; });
        nb.asks.forEach((r) => { ca += r.a; r.cum = ca; });
        return nb;
      });
    }, 900);
    return () => window.clearInterval(id);
  }, [live]);

  useEffect(() => {
    if (!spin) return;
    const id = window.setInterval(() => setOrbit((o) => (o + 2) % 90), 50);
    return () => window.clearInterval(id);
  }, [spin]);

  const maxCum = Math.max(book.bids[13].cum, book.asks[13].cum);
  const inRange = (i: number) => i >= range[0] && i <= range[1];
  const rangeBid = book.bids.filter((_, i) => inRange(i)).reduce((a, r) => a + r.a, 0);
  const rangeAsk = book.asks.filter((_, i) => inRange(i)).reduce((a, r) => a + r.a, 0);
  const imbalance = ((rangeBid - rangeAsk) / Math.max(0.01, rangeBid + rangeAsk)) * 100;

  const W = 640, H = 210;
  const depthX = (cum: number, side: "bid" | "ask") => (side === "bid" ? W / 2 - (cum / maxCum) * (W / 2 - 20) : W / 2 + (cum / maxCum) * (W / 2 - 20));
  const rowY = (i: number) => 14 + (i / 13) * (H - 28);

  const rows = useMemo(() => {
    const arr: { side: "ask" | "bid"; i: number; r: Row }[] = [];
    [...book.asks].reverse().forEach((r, k) => arr.push({ side: "ask", i: 13 - k, r }));
    book.bids.forEach((r, i) => arr.push({ side: "bid", i, r }));
    return arr;
  }, [book]);

  return (
    <ShowcaseSection
      id="depth" index="39" kicker="Depth Chamber" title="Стакан, который становится стеной"
      desc="Заявки пульсируют и вспыхивают. Наведи на строку — подсветятся объём и область глубины. Переключи режим — книга сложится в 3D-стену ликвидности."
      accent="#14c8f5"
      tags={<div className="flex gap-2"><Tag tone={imbalance >= 0 ? "green" : "red"}>Imb {imbalance >= 0 ? "+" : ""}{imbalance.toFixed(1)}%</Tag><Tag tone="ghost">mid ${fmtPrice(mid)}</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Seg options={["book", "wall"] as const} value={mode} onChange={(v) => { setMode(v); sfx.whoosh(); }} accent="#14c8f5" />
        <button onClick={() => setLive((v) => !v)} className={cn("btn3d px-4 py-2 text-[10px]", live ? "btn3d-ghost" : "btn3d-green")}>{live ? "Pause flow" : "Resume flow"}</button>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
          Orbit
          <input type="range" min={0} max={80} value={orbit} onChange={(e) => setOrbit(+e.target.value)} className="lever w-32" style={{ ["--fill" as string]: `${(orbit / 80) * 100}%` }} disabled={mode !== "wall"} />
          <button onClick={() => setSpin((v) => !v)} className={cn("btn3d px-3 py-1.5 text-[10px]", spin ? "btn3d-blue" : "btn3d-ghost")}>Spin</button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* book */}
        <ScenePanel title="Order book" sub="Hover — объём · строки мигают при сделках" accent="#ff5470">
          <div className="space-y-[3px]">
            {rows.map(({ side, i, r }) => {
              const bid = side === "bid";
              const hov = hover?.side === side && hover.i === i;
              return (
                <button
                  key={side + i}
                  onPointerEnter={() => setHover({ side, i })}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => { setRange(bid ? [Math.min(i, range[1]), range[1]] : [range[0], Math.max(i, range[0])]); sfx.tick(); }}
                  className={cn("relative flex w-full items-center overflow-hidden rounded-md px-2 py-[4px] text-[11px] transition", hov ? "bg-white/10" : "bg-white/[.02]", !inRange(i) && "opacity-45")}
                  style={r.flash > 0 ? { boxShadow: `inset 0 0 0 1px ${bid ? "#2ede8a" : "#ff5470"}` } : undefined}
                >
                  <motion.span className="absolute inset-y-0 right-0" initial={false} animate={{ width: `${(r.a / 8) * 100}%`, backgroundColor: bid ? "rgba(46,222,138,.16)" : "rgba(255,84,112,.16)" }} />
                  <span className={cn("num-mono relative w-[86px] text-left font-bold", bid ? "text-[#5ff5a8]" : "text-[#ff8ba0]")}>{fmtPrice(r.p)}</span>
                  <span className="num-mono relative w-14 text-center text-[#aebde6]">{r.a.toFixed(2)}</span>
                  <span className="num-mono relative ml-auto text-[#7d92c4]">{r.cum.toFixed(1)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <span className="num-mono text-sm font-extrabold text-white">${fmtPrice(mid)}</span>
            <span className="text-[10px] font-bold text-[#7d92c4]">spread 7.0</span>
          </div>
        </ScenePanel>

        {/* depth / wall */}
        <ScenePanel
          title={mode === "book" ? "Depth · cumulative" : "Liquidity wall · 3D"}
          sub={mode === "book" ? "Тяни ручки диапазона · клик по книге тоже двигает" : "Вращай орбиту · стена строится из тех же заявок"}
          accent="#14c8f5"
          right={<span className="num-mono text-[11px] font-bold text-[#8ea6d8]">bid {rangeBid.toFixed(1)} / ask {rangeAsk.toFixed(1)}</span>}
        >
          {mode === "book" ? (
            <div className="panel-inset relative overflow-hidden p-2">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <line x1={W / 2} x2={W / 2} y1={0} y2={H} stroke="rgba(255,255,255,.25)" strokeDasharray="4 4" />
                {/* bid area */}
                <path
                  d={`M${W / 2},${H - 10} ` + book.bids.map((r, i) => `L${depthX(r.cum, "bid")},${rowY(13 - i)}`).join(" ") + ` L${W / 2},10`}
                  fill="rgba(46,222,138,.18)" stroke="#2ede8a" strokeWidth={2}
                />
                <path
                  d={`M${W / 2},${H - 10} ` + book.asks.map((r, i) => `L${depthX(r.cum, "ask")},${rowY(i)}`).join(" ") + ` L${W / 2},10`}
                  fill="rgba(255,84,112,.18)" stroke="#ff5470" strokeWidth={2}
                />
                {/* range band */}
                <rect x={20} y={rowY(range[1]) - 8} width={W - 40} height={rowY(range[0]) - rowY(range[1]) + 16} fill="#14c8f5" opacity={0.08} rx={8} />
                {/* hover marker */}
                {hover && (
                  <g>
                    <circle cx={depthX((hover.side === "bid" ? book.bids[hover.i] : book.asks[hover.i]).cum, hover.side)} cy={rowY(hover.side === "bid" ? 13 - hover.i : hover.i)} r={6} fill="#fff" stroke="#14c8f5" strokeWidth={3} />
                  </g>
                )}
                {/* draggable handles */}
                {[range[0], range[1]].map((_, k) => (
                  <g key={k}
                    className="cursor-ns-resize"
                    onPointerDown={(e) => { dragHandle.current = k as 0 | 1; (e.target as Element).setPointerCapture?.(e.pointerId); }}
                    onPointerMove={(e) => {
                      if (dragHandle.current === null) return;
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                      const yy = ((e.clientY - rect.top) / rect.height) * H;
                      const idx = Math.round(((yy - 14) / (H - 28)) * 13);
                      const cl = Math.max(0, Math.min(13, idx));
                      setRange((r) => (dragHandle.current === 0 ? [Math.min(cl, r[1]), r[1]] : [r[0], Math.max(cl, r[0])]));
                    }}
                    onPointerUp={() => { dragHandle.current = null; sfx.soft(); }}
                  >
                    <rect x={W - 74} y={rowY(k === 0 ? range[0] : range[1]) - 10} width={60} height={20} rx={10} fill="#14c8f5" />
                    <text x={W - 44} y={rowY(k === 0 ? range[0] : range[1]) + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#04121a">{k === 0 ? "TOP" : "BOT"}</text>
                  </g>
                ))}
              </svg>
              {hover && (
                <div className="anim-pop absolute left-3 top-3 rounded-xl border border-white/15 bg-[#060d24]/92 px-3 py-1.5 backdrop-blur">
                  <span className="num-mono text-[11px] font-bold text-white">
                    {hover.side.toUpperCase()} lv{hover.i} · {(hover.side === "bid" ? book.bids[hover.i].a : book.asks[hover.i].a).toFixed(2)} BTC · cum {(hover.side === "bid" ? book.bids[hover.i].cum : book.asks[hover.i].cum).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="panel-inset relative overflow-hidden p-4" style={{ perspective: 1000 }}>
              <motion.div
                className="flex h-[240px] items-end justify-center gap-[3px]"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateX: 52, rotateZ: -orbit * 0.35 }}
                transition={{ type: "spring", stiffness: 60, damping: 18 }}
              >
                {[...book.bids].reverse().map((r, i) => (
                  <motion.div key={"b" + i} className="w-4 rounded-t-md" style={{ transformStyle: "preserve-3d" }}
                    initial={false} animate={{ height: 30 + (r.cum / maxCum) * 150, backgroundColor: inRange(13 - i) ? "#2ede8a" : "#134a35", opacity: inRange(13 - i) ? 1 : 0.4, boxShadow: inRange(13 - i) ? "0 0 18px #2ede8a88" : "none" }}
                  />
                ))}
                <div className="mx-1 h-full w-[3px] rounded bg-white/70" style={{ boxShadow: "0 0 14px #fff" }} />
                {book.asks.map((r, i) => (
                  <motion.div key={"a" + i} className="w-4 rounded-t-md" style={{ transformStyle: "preserve-3d" }}
                    initial={false} animate={{ height: 30 + (r.cum / maxCum) * 150, backgroundColor: inRange(i) ? "#ff5470" : "#5c1a29", opacity: inRange(i) ? 1 : 0.4, boxShadow: inRange(i) ? "0 0 18px #ff547088" : "none" }}
                  />
                ))}
              </motion.div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#14c8f5]/15 to-transparent" />
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2">
            <SceneStat label="Bid depth" value={rangeBid.toFixed(1)} sub={`levels ${range[0]}–${range[1]}`} color="#2ede8a" />
            <SceneStat label="Ask depth" value={rangeAsk.toFixed(1)} sub={`levels ${range[0]}–${range[1]}`} color="#ff5470" />
            <SceneStat label="Wall side" value={imbalance >= 0 ? "BID" : "ASK"} sub={`${Math.abs(imbalance).toFixed(1)}%`} color={imbalance >= 0 ? "#2ede8a" : "#ff5470"} />
          </div>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] font-extrabold"><span className="text-[#2ede8a]">BIDS</span><span className="text-[#ff5470]">ASKS</span></div>
            <div className="flex h-3 overflow-hidden rounded-full bg-black/50">
              <motion.div className="h-full bg-gradient-to-r from-[#0fa968] to-[#2ede8a]" initial={false} animate={{ width: `${(rangeBid / Math.max(0.01, rangeBid + rangeAsk)) * 100}%` }} />
              <motion.div className="h-full bg-gradient-to-r from-[#ff5470] to-[#c81d47]" initial={false} animate={{ width: `${(rangeAsk / Math.max(0.01, rangeBid + rangeAsk)) * 100}%` }} />
            </div>
          </div>
        </ScenePanel>
      </div>
      <p className="mt-3 text-center text-[11px] text-[#7d92c4]">Запоминающийся момент: стакан складывается в светящуюся стену ликвидности</p>
    </ShowcaseSection>
  );
}
