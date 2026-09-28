/* 46 · RISK MATRIX — assets plotted by volatility × drawdown risk.
   Drag bubbles, group by sector, filter → matrix morphs with springs. */
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Asset = { sym: string; sector: "L1" | "DeFi" | "Meme" | "Stable"; vol: number; risk: number; mcap: number; chg: number; color: string };
const DATA: Asset[] = [
  { sym: "BTC", sector: "L1", vol: 32, risk: 38, mcap: 1900, chg: 2.8, color: "#F7931A" },
  { sym: "ETH", sector: "L1", vol: 44, risk: 46, mcap: 460, chg: 1.9, color: "#8fa2ff" },
  { sym: "SOL", sector: "L1", vol: 68, risk: 62, mcap: 98, chg: -1.2, color: "#14F195" },
  { sym: "BNB", sector: "L1", vol: 40, risk: 42, mcap: 96, chg: 0.6, color: "#F0B90B" },
  { sym: "TON", sector: "L1", vol: 55, risk: 50, mcap: 19, chg: -0.8, color: "#0098EA" },
  { sym: "AAVE", sector: "DeFi", vol: 61, risk: 58, mcap: 2.4, chg: 3.4, color: "#2eb59a" },
  { sym: "UNI", sector: "DeFi", vol: 58, risk: 55, mcap: 4.1, chg: -2.1, color: "#ff007a" },
  { sym: "DOGE", sector: "Meme", vol: 74, risk: 70, mcap: 44, chg: 5.4, color: "#C2A633" },
  { sym: "PEPE", sector: "Meme", vol: 92, risk: 88, mcap: 6.2, chg: 11.2, color: "#3d9e44" },
  { sym: "WIF", sector: "Meme", vol: 85, risk: 80, mcap: 3.8, chg: -6.4, color: "#ff8b3d" },
  { sym: "USDT", sector: "Stable", vol: 2, risk: 6, mcap: 140, chg: 0.01, color: "#26A17B" },
  { sym: "USDC", sector: "Stable", vol: 2, risk: 5, mcap: 58, chg: 0.0, color: "#2775ca" },
];

const QUADS = [
  { x: 0, y: 0, t: "Anchor", d: "низкий риск", c: "#2ede8a" },
  { x: 1, y: 0, t: "Kicker", d: "волатильно, но живо", c: "#ffc531" },
  { x: 0, y: 1, t: "Value?", d: "просадка без шума", c: "#5b8cff" },
  { x: 1, y: 1, t: "Rocket / Trap", d: "макс риск", c: "#ff5470" },
];

export default function RiskMatrix() {
  const [sectors, setSectors] = useState<string[]>(["L1", "DeFi", "Meme", "Stable"]);
  const [minMcap, setMinMcap] = useState(0);
  const [sel, setSel] = useState<string | null>("SOL");
  const [offsets, setOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const [group, setGroup] = useState(false);

  const list = useMemo(
    () => DATA.filter((a) => sectors.includes(a.sector) && a.mcap >= minMcap),
    [sectors, minMcap],
  );
  const a = DATA.find((x) => x.sym === sel) ?? list[0];

  const toggleSector = (s: string) => {
    setSectors((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    sfx.tick();
  };

  const pos = (v: Asset) => {
    const o = offsets[v.sym] ?? { dx: 0, dy: 0 };
    return {
      x: Math.max(6, Math.min(94, v.vol + o.dx)),
      y: Math.max(8, Math.min(92, v.risk + o.dy)),
    };
  };

  return (
    <ShowcaseSection
      id="riskmatrix" index="46" kicker="Risk Matrix" title="Карта риска и волатильности"
      desc="Активы живут в координатах риск × волатильность. Тащи пузыри, группируй по секторам, крути фильтры — матрица перестраивается пружинно."
      accent="#ff8b3d"
      variant="circuit"
      moment="Запоминающийся момент: выключаешь Meme — пузыри разлетаются, матрица перестраивается пружиной"
      keys={[{ k: "G", d: "группы" }, { k: "1–4", d: "секторы" }, { k: "0", d: "сброс позиций" }]}
      hotkeys={{
        g: () => setGroup((v) => !v),
        "1": () => toggleSector("L1"), "2": () => toggleSector("DeFi"), "3": () => toggleSector("Meme"), "4": () => toggleSector("Stable"),
        "0": () => setOffsets({}),
      }}
      tags={<div className="flex gap-2"><Tag tone="gold">{list.length} assets</Tag><Tag tone="ghost">drag · group · filter</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["L1", "DeFi", "Meme", "Stable"] as const).map((s) => (
          <button key={s} onClick={() => toggleSector(s)}
            className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold", sectors.includes(s) ? "bg-[#ff8b3d] text-[#231303]" : "bg-white/5 text-[#54678f]")}>{s}</button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-[10px] font-extrabold text-[#8ea6d8]">
          min mcap ${minMcap}B
          <input type="range" min={0} max={100} value={minMcap} onChange={(e) => setMinMcap(+e.target.value)} className="lever w-28" style={{ ["--fill" as string]: `${minMcap}%` }} />
        </label>
        <button onClick={() => { setGroup((g) => !g); sfx.pop(); }} className={cn("btn3d px-3.5 py-2 text-[10px]", group ? "btn3d-blue" : "btn3d-ghost")}>
          {group ? "Ungroup" : "Group rings"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <ScenePanel title="Volatility → · Risk ↑" sub="Drag bubble · click — details" accent="#ff8b3d">
          <div className="panel-inset relative h-[380px] overflow-hidden">
            {/* quadrants */}
            {QUADS.map((q) => (
              <div key={q.t} className="absolute w-1/2 p-3" style={{ left: q.x ? "50%" : 0, top: q.y ? "50%" : 0, height: "50%" }}>
                <p className="text-[11px] font-black" style={{ color: `${q.c}aa` }}>{q.t}</p>
                <p className="text-[9px] font-bold text-[#54678f]">{q.d}</p>
              </div>
            ))}
            <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
            {group && (["L1", "DeFi", "Meme", "Stable"] as const).map((s, i) => {
              const members = list.filter((a) => a.sector === s);
              if (!members.length) return null;
              const cx = members.reduce((x, m) => x + pos(m).x, 0) / members.length;
              const cy = members.reduce((y, m) => y + (100 - pos(m).y), 0) / members.length;
              return (
                <motion.div key={s} className="pointer-events-none absolute rounded-full border-2 border-dashed"
                  style={{ borderColor: ["#F7931A", "#2eb59a", "#C2A633", "#26A17B"][i] }}
                  initial={false} animate={{ left: `${cx - 16}%`, top: `${(100 - cy) - 18}%`, width: "32%", height: "36%", opacity: 0.5 }}
                />
              );
            })}
            {list.map((v) => {
              const p = pos(v);
              const size = 34 + Math.min(44, Math.log10(v.mcap + 1) * 22);
              const active = sel === v.sym;
              return (
                <motion.button
                  key={v.sym}
                  drag dragMomentum={false}
                  onDragEnd={(_, info) => {
                    setOffsets((o) => ({
                      ...o,
                      [v.sym]: {
                        dx: (o[v.sym]?.dx ?? 0) + (info.offset.x / 4),
                        dy: (o[v.sym]?.dy ?? 0) - (info.offset.y / 4),
                      },
                    }));
                    sfx.soft();
                  }}
                  onClick={() => { setSel(v.sym); sfx.tick(); }}
                  className="absolute z-10 flex cursor-grab flex-col items-center justify-center rounded-full border-2 font-black active:cursor-grabbing"
                  style={{ width: size, height: size }}
                  initial={false}
                  animate={{ left: `calc(${p.x}% - ${size / 2}px)`, top: `calc(${100 - p.y}% - ${size / 2}px)`, scale: active ? 1.18 : 1, zIndex: active ? 20 : 10 }}
                  transition={{ type: "spring", stiffness: 170, damping: 19 }}
                >
                  <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${v.color}, ${v.color}55 60%, transparent 75%)`, border: `2px solid ${v.color}`, boxShadow: active ? `0 0 26px ${v.color}` : `0 0 12px ${v.color}55` }} />
                  <span className="relative text-[10px] text-white" style={{ textShadow: "0 1px 3px #000" }}>{v.sym}</span>
                  <span className={cn("num-mono relative text-[8px] font-extrabold", v.chg >= 0 ? "text-[#b6ff7d]" : "text-[#ffb3c0]")}>{v.chg >= 0 ? "+" : ""}{v.chg.toFixed(1)}%</span>
                </motion.button>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-extrabold uppercase tracking-widest text-[#54678f]">
            <span>← calm</span><span>volatile →</span>
          </div>
        </ScenePanel>

        <ScenePanel title={a ? a.sym : "Asset"} sub={a ? `${a.sector} · $${a.mcap}B mcap` : "—"} accent={a?.color}>
          {a ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black" style={{ background: `${a.color}25`, color: a.color, border: `2px solid ${a.color}66` }}>
                  {a.sym.slice(0, 3)}
                </span>
                <div>
                  <p className={cn("num-mono text-xl font-extrabold", a.chg >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]")}>{a.chg >= 0 ? "+" : ""}{a.chg.toFixed(2)}%</p>
                  <p className="text-[10px] font-bold text-[#8ea6d8]">24h momentum</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <SceneStat label="Volatility" value={`${a.vol}`} color="#ffc531" />
                <SceneStat label="Risk" value={`${a.risk}`} color="#ff5470" />
              </div>
              <div className="mt-3 space-y-2">
                {[["Vol", a.vol, "#ffc531"], ["Risk", a.risk, "#ff5470"]].map(([k, v, c]) => (
                  <div key={k as string}>
                    <div className="flex justify-between text-[10px] font-extrabold"><span className="text-[#8ea6d8]">{k}</span><span className="text-white">{v}/100</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/50">
                      <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${v}%` }} style={{ background: c as string }} />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setOffsets((o) => ({ ...o, [a.sym]: { dx: 0, dy: 0 } })); sfx.soft(); }}
                className="btn3d btn3d-ghost mt-3 w-full py-2.5 text-[10px]"
              >Reset position</button>
            </>
          ) : (
            <p className="py-8 text-center text-xs text-[#7d92c4]">Фильтры скрыли все активы</p>
          )}
        </ScenePanel>
      </div>
    </ShowcaseSection>
  );
}
