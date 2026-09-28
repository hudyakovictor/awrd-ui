/* 48 · WHALE RADAR — sweep, pings and a live money map.
   Filter size → blips change; click blip → dossier + spark + route. */
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { closesPath, genCandles } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Ping = { id: number; ang: number; dist: number; amt: number; sym: string; from: string; to: string; age: number; dir: "in" | "out" };
const SYMS = ["BTC", "ETH", "SOL", "USDT", "BNB"];
const VENUES = ["Binance", "Coinbase", "Kraken", "OKX", "Cold wallet", "Unknown"];

let pid = 1;
function spawn(minAmt: number): Ping {
  const sym = SYMS[Math.floor(Math.random() * SYMS.length)];
  return {
    id: pid++,
    ang: Math.random() * Math.PI * 2,
    dist: 18 + Math.random() * 72,
    amt: minAmt + Math.random() * (minAmt * 4 + 12),
    sym,
    from: VENUES[Math.floor(Math.random() * VENUES.length)],
    to: VENUES[Math.floor(Math.random() * VENUES.length)],
    age: 0,
    dir: Math.random() > 0.5 ? "in" : "out",
  };
}

export default function WhaleRadar() {
  const [pings, setPings] = useState<Ping[]>(() => Array.from({ length: 7 }, () => spawn(5)));
  const [sel, setSel] = useState<number | null>(null);
  const [minAmt, setMinAmt] = useState(5);
  const [live, setLive] = useState(true);
  const [sweep, setSweep] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      setPings((p) => {
        const aged = p.map((x) => ({ ...x, age: x.age + 1 })).filter((x) => x.age < 14);
        return Math.random() > 0.25 ? [...aged, spawn(minAmt)] : aged;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [live, minAmt]);

  useEffect(() => {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (live) setSweep((s) => (s + dt * 70) % 360);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [live]);

  const selected = pings.find((p) => p.id === sel) ?? [...pings].sort((a, b) => b.amt - a.amt)[0] ?? null;
  const spark = useMemo(() => genCandles((selected?.id ?? 3) * 17, 40, 100, selected && selected.amt > 20 ? "volatile" : "calm", 60_000).map((c) => c.c), [selected?.id, selected?.amt]);

  const pick = (id: number) => {
    setSel(id);
    sfx.pop();
  };

  return (
    <ShowcaseSection
      id="whales" index="48" kicker="Whale Radar" title="Радар крупных денег"
      desc="Развёртка ловит переводы китов. Фильтруй размер, жми на вспышку — откроются маршрут, вес сделки и реакция цены."
      accent="#14c8f5"
      variant="radar"
      moment="Запоминающийся момент: тяжёлый кит вспыхивает золотым кольцом прямо под лучом"
      keys={[{ k: "Space", d: "freeze" }, { k: "P", d: "force ping" }, { k: "↑ ↓", d: "мин. размер" }]}
      hotkeys={{
        Space: () => setLive((v) => !v),
        p: () => setPings((ps) => [...ps, spawn(minAmt)]),
        ArrowUp: () => setMinAmt((m) => Math.min(25, m + 2)),
        ArrowDown: () => setMinAmt((m) => Math.max(1, m - 2)),
      }}
      tags={<div className="flex gap-2"><Tag tone="blue">{pings.length} live pings</Tag><Tag tone="ghost">≥ ${minAmt}M</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[11px] font-extrabold text-[#8ea6d8]">
          Min size ${minAmt}M
          <input type="range" min={1} max={25} value={minAmt} onChange={(e) => setMinAmt(+e.target.value)} className="lever w-36" style={{ ["--fill" as string]: `${(minAmt / 25) * 100}%` }} />
        </label>
        <button onClick={() => { setLive((v) => !v); sfx.tap(); }} className={cn("btn3d px-4 py-2 text-[10px]", live ? "btn3d-ghost" : "btn3d-green")}>
          {live ? <><Pause size={13} /> Freeze</> : <><Play size={13} /> Resume</>}
        </button>
        <button onClick={() => { setPings((p) => [...p, spawn(minAmt)]); sfx.coin(); }} className="btn3d btn3d-gold px-4 py-2 text-[10px]">Force ping</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <ScenePanel title="Sweep · 360°" sub="Клик по вспышке — досье" accent="#14c8f5">
          <div className="relative mx-auto aspect-square max-w-[440px] overflow-hidden rounded-full border-2 border-[#14c8f5]/40 bg-[radial-gradient(circle,#0a2540,#040a1c_70%)]" style={{ boxShadow: "0 0 60px rgba(20,200,245,.2), inset 0 0 80px rgba(0,0,0,.6)" }}>
            {[33, 66, 100].map((r) => (
              <div key={r} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#14c8f5]/20" style={{ width: `${r}%`, height: `${r}%` }} />
            ))}
            <div className="absolute left-1/2 top-0 h-full w-px bg-[#14c8f5]/15" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-[#14c8f5]/15" />
            {/* sweep */}
            <div className="absolute inset-0" style={{ background: `conic-gradient(from ${sweep}deg, rgba(20,200,245,.5), transparent 18%)` }} />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#14c8f5]" style={{ boxShadow: "0 0 14px #14c8f5" }} />
            {/* pings */}
            <AnimatePresence>
              {pings.map((p) => {
                const x = 50 + Math.cos(p.ang) * (p.dist / 2);
                const y = 50 + Math.sin(p.ang) * (p.dist / 2);
                const big = p.amt > 18;
                const active = selected?.id === p.id;
                return (
                  <motion.button
                    key={p.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: Math.max(0.25, 1 - p.age / 14) }} exit={{ scale: 0, opacity: 0 }}
                    onClick={() => pick(p.id)}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span className="relative flex items-center justify-center">
                      {big && <span className="absolute h-10 w-10 animate-ping rounded-full bg-[#ffc531]/30" />}
                      <span
                        className={cn("flex items-center justify-center rounded-full border-2 font-black", active ? "border-white" : "border-[#14c8f5]/60")}
                        style={{
                          width: big ? 34 : 24, height: big ? 34 : 24, fontSize: 10,
                          background: p.dir === "in" ? "#2ede8a" : "#ff5470", color: "#04121a",
                          boxShadow: active ? "0 0 22px #fff" : `0 0 14px ${p.dir === "in" ? "#2ede8a" : "#ff5470"}`,
                        }}
                      >{p.sym.slice(0, 1)}</span>
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-extrabold">
            <span className="flex items-center gap-1.5 text-[#2ede8a]"><span className="h-2.5 w-2.5 rounded-full bg-[#2ede8a]" /> inflow</span>
            <span className="flex items-center gap-1.5 text-[#ff5470]"><span className="h-2.5 w-2.5 rounded-full bg-[#ff5470]" /> outflow</span>
            <span className="text-[#7d92c4]">ring = size</span>
          </div>
        </ScenePanel>

        <div className="space-y-3">
          <ScenePanel title="Dossier" sub={selected ? `#${selected.id} · ${selected.sym}` : "—"} accent="#ffc531">
            {selected ? (
              <>
                <p className="num-mono text-3xl font-extrabold text-white">${selected.amt.toFixed(1)}M</p>
                <p className="text-[11px] font-bold text-[#8ea6d8]">{selected.from} → {selected.to}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] font-extrabold">
                  <span className={cn("rounded-full px-2.5 py-1", selected.dir === "in" ? "bg-[#2ede8a]/15 text-[#2ede8a]" : "bg-[#ff5470]/15 text-[#ff5470]")}>
                    {selected.dir === "in" ? "◀ inflow · buy pressure" : "outflow · sell risk ▶"}
                  </span>
                </div>
                <svg viewBox="0 0 260 70" className="mt-3 w-full rounded-xl border border-white/10 bg-black/30">
                  <motion.path key={selected.id} d={closesPath(spark, 260, 70)} fill="none" stroke={selected.dir === "in" ? "#2ede8a" : "#ff5470"} strokeWidth={2.2}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
                </svg>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <SceneStat label="Weight" value={selected.amt > 18 ? "HEAVY" : selected.amt > 9 ? "MID" : "LIGHT"} color={selected.amt > 18 ? "#ffc531" : "#fff"} />
                  <SceneStat label="Age" value={`${selected.age}s`} color="#8ea6d8" />
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-xs text-[#7d92c4]">Нет сигналов — снизь фильтр</p>
            )}
          </ScenePanel>
          <ScenePanel title="Feed" sub="Свежие переводы" accent="#5b8cff">
            <div className="max-h-[190px] space-y-1.5 overflow-y-auto">
              {[...pings].sort((a, b) => b.id - a.id).slice(0, 7).map((p) => (
                <button key={p.id} onClick={() => pick(p.id)} className={cn("flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left", selected?.id === p.id ? "border-white/40 bg-white/8" : "border-white/8 bg-black/25")}>
                  <span className={cn("h-2.5 w-2.5 rounded-full", p.dir === "in" ? "bg-[#2ede8a]" : "bg-[#ff5470]")} />
                  <span className="flex-1 text-[11px] font-extrabold text-white">{p.sym} · ${p.amt.toFixed(1)}M</span>
                  <span className="text-[10px] text-[#7d92c4]">{p.from.slice(0, 6)}→</span>
                </button>
              ))}
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
