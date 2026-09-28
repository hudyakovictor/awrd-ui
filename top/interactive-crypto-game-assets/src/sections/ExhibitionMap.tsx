/* EXHIBITION MAP — navigator for the large showcase scenes.
   Filter by interaction principle · tilt tiles · hover preview glow
   · click to fly to the scene. */
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Boxes, Clock, GitBranch, Layers3, MousePointerClick, Move3d, Radar, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection } from "../showcase/Scene";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Principle = "drag" | "3d" | "timeline" | "sync" | "canvas" | "link" | "morph" | "zoom";
const PRINCIPLES: { id: Principle; label: string; icon: typeof Move3d; color: string }[] = [
  { id: "drag", label: "Drag & bounds", icon: MousePointerClick, color: "#8ef23c" },
  { id: "3d", label: "2D ↔ 3D / rotate", icon: Move3d, color: "#a78bff" },
  { id: "timeline", label: "Timeline / speed", icon: Clock, color: "#ffc531" },
  { id: "sync", label: "Synced views", icon: Layers3, color: "#5b8cff" },
  { id: "canvas", label: "Canvas / particles", icon: Sparkles, color: "#ff8b3d" },
  { id: "link", label: "Link with lines", icon: GitBranch, color: "#14c8f5" },
  { id: "morph", label: "Layout morph", icon: Boxes, color: "#ff5470" },
  { id: "zoom", label: "Zoom & pan", icon: Radar, color: "#2ede8a" },
];

const SCENES: { id: string; n: string; t: string; d: string; color: string; p: Principle[] }[] = [
  { id: "mtf", n: "38", t: "Multi-Timeframe", d: "Одна кисть на четырёх таймфреймах", color: "#5b8cff", p: ["sync", "drag", "morph"] },
  { id: "depth", n: "39", t: "Depth Chamber", d: "Стакан → 3D-стена ликвидности", color: "#14c8f5", p: ["3d", "drag"] },
  { id: "scanner", n: "40", t: "Pattern Scanner", d: "Радар формаций на шести графиках", color: "#F7931A", p: ["sync", "timeline"] },
  { id: "portfolio", n: "41", t: "Portfolio Center", d: "Перетаскиваемые доли портфеля", color: "#2ede8a", p: ["drag", "morph"] },
  { id: "news", n: "42", t: "News Timeline", d: "Новости, прибитые к графику", color: "#ffc531", p: ["timeline"] },
  { id: "strategy", n: "43", t: "Strategy Constructor", d: "Схема стратегии из блоков", color: "#a78bff", p: ["link", "drag"] },
  { id: "volatility", n: "44", t: "Volatility Reactor", d: "Рой частиц под регуляторами", color: "#ff5470", p: ["canvas"] },
  { id: "history", n: "45", t: "History Room", d: "Эпохи перекрашивают всю сцену", color: "#8ef23c", p: ["timeline", "morph"] },
  { id: "riskmatrix", n: "46", t: "Risk Matrix", d: "Пузыри риск × волатильность", color: "#ff8b3d", p: ["drag", "morph"] },
  { id: "workspace", n: "47", t: "Workspace Builder", d: "Магнитные сплиттеры терминала", color: "#8ef23c", p: ["drag", "morph"] },
  { id: "whales", n: "48", t: "Whale Radar", d: "Развёртка крупных переводов", color: "#14c8f5", p: ["canvas", "timeline"] },
  { id: "replay", n: "49", t: "Market Replay", d: "Кинотеатр торговой сессии", color: "#ffc531", p: ["timeline"] },
  { id: "liquidity", n: "50", t: "Liquidity Pool", d: "Диапазон ликвидности и 3D-город", color: "#14F195", p: ["drag", "3d", "timeline"] },
  { id: "heatmap", n: "51", t: "Liquidity Heatmap", d: "Стены ликвидности во времени", color: "#ffc531", p: ["canvas", "timeline"] },
  { id: "galaxy", n: "52", t: "Correlation Galaxy", d: "Физика связей и шоковый импульс", color: "#a78bff", p: ["link", "3d", "drag", "morph"] },
  { id: "compare", n: "53", t: "Chart Comparator", d: "A/B двух состояний графика", color: "#5b8cff", p: ["sync", "zoom", "drag"] },
  { id: "anatomy", n: "54", t: "Candle Anatomy 3D", d: "Свеча, которую можно вращать", color: "#ff8b3d", p: ["3d", "timeline"] },
  { id: "sessions", n: "55", t: "Session Clock", d: "Циферблат сессий и глобус", color: "#0098EA", p: ["drag", "timeline", "3d"] },
  { id: "liquidations", n: "56", t: "Liquidation Cascade", d: "Цепная реакция ликвидаций", color: "#ff5470", p: ["drag", "canvas"] },
  { id: "terrain", n: "57", t: "Sentiment Terrain", d: "Вращаемый рельеф с волнами", color: "#8ef23c", p: ["3d", "morph"] },
  { id: "drawing", n: "58", t: "Drawing Studio", d: "Разметка, приклеенная к свечам", color: "#8ef23c", p: ["zoom", "drag"] },
  { id: "arbitrage", n: "59", t: "Arbitrage Network", d: "Маршрут арбитража линиями", color: "#F0B90B", p: ["link", "timeline"] },
  { id: "marketmaker", n: "60", t: "Market Maker Console", d: "Котировки и балансир инвентаря", color: "#14c8f5", p: ["drag", "timeline"] },
  { id: "footprint", n: "61", t: "Order Flow Footprint", d: "Объём bid×ask в каждой свече", color: "#2ede8a", p: ["zoom", "canvas"] },
];

function MiniGlyph({ color, seed }: { color: string; seed: number }) {
  const pts = Array.from({ length: 14 }, (_, i) => 20 + Math.sin(i * 0.9 + seed) * 10 + Math.cos(i * 0.4 + seed * 2) * 6);
  const d = pts.map((v, i) => `${i ? "L" : "M"}${(i / 13) * 100},${v}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-10 w-full">
      <path d={`${d} L100,40 L0,40 Z`} fill={color} opacity={0.12} />
      <motion.path d={d} fill="none" stroke={color} strokeWidth={2} initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1 }} />
    </svg>
  );
}

export default function ExhibitionMap() {
  const [active, setActive] = useState<Principle[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const list = useMemo(
    () => SCENES.filter((s) => active.length === 0 || active.every((a) => s.p.includes(a))),
    [active],
  );
  const toggle = (p: Principle) => {
    setActive((a) => (a.includes(p) ? a.filter((x) => x !== p) : [...a, p]));
    sfx.tick();
  };
  const fly = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    sfx.whoosh();
  };
  const counts = PRINCIPLES.map((p) => ({ ...p, n: SCENES.filter((s) => s.p.includes(p.id)).length }));
  const hs = SCENES.find((s) => s.id === hover);

  return (
    <ShowcaseSection
      id="exhibition" index="∞" kicker="Exhibition Map" title="Карта выставки крупных сцен"
      desc="24 самостоятельные интерактивные системы. Фильтруй по принципу взаимодействия — плитки перестраиваются. Клик по сцене — перелёт к ней."
      accent="#8ef23c" variant="aurora"
      keys={[{ k: "1–8", d: "фильтр принципа" }, { k: "0", d: "сброс" }]}
      hotkeys={{
        ...Object.fromEntries(PRINCIPLES.map((p, i) => [String(i + 1), () => toggle(p.id)])),
        "0": () => setActive([]),
      }}
      tags={<div className="flex gap-2"><Tag tone="green">{list.length}/{SCENES.length} scenes</Tag>{active.length > 0 && <Tag tone="ghost">{active.length} filters</Tag>}</div>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {counts.map((p) => {
          const on = active.includes(p.id);
          const Icon = p.icon;
          return (
            <motion.button
              key={p.id} whileTap={{ scale: 0.94 }} onClick={() => toggle(p.id)}
              className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-extrabold transition", on ? "text-[#081130]" : "border-white/10 bg-black/25 text-[#c9d8ff] hover:border-white/25")}
              style={on ? { background: p.color, borderColor: p.color, boxShadow: `0 0 18px ${p.color}66, 0 4px 0 #030816` } : undefined}
            >
              <Icon size={14} />
              {p.label}
              <span className={cn("rounded-md px-1.5 text-[10px]", on ? "bg-black/20" : "bg-white/10")}>{p.n}</span>
            </motion.button>
          );
        })}
        {active.length > 0 && <button onClick={() => { setActive([]); sfx.soft(); }} className="btn3d btn3d-ghost px-3 py-2 text-[10px]">Reset</button>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((s, k) => (
              <motion.button
                key={s.id} layout
                initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 24, delay: k * 0.015 }}
                whileHover={{ y: -6, rotateX: 6, rotateY: -6 }}
                style={{ transformPerspective: 700 }}
                onPointerEnter={() => setHover(s.id)} onPointerLeave={() => setHover(null)}
                onClick={() => fly(s.id)}
                className="group relative overflow-hidden rounded-[20px] border border-white/10 bg-[#0a1740]/70 p-3 text-left"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at 30% 0%, ${s.color}33, transparent 65%)` }} />
                <div className="relative flex items-center justify-between">
                  <span className="num-mono text-[11px] font-black" style={{ color: s.color }}>#{s.n}</span>
                  <ArrowRight size={13} className="text-[#54678f] transition group-hover:translate-x-1 group-hover:text-white" />
                </div>
                <p className="display relative mt-1 text-[13px] font-extrabold leading-tight text-white">{s.t}</p>
                <MiniGlyph color={s.color} seed={parseInt(s.n, 10)} />
                <div className="relative flex flex-wrap gap-1">
                  {s.p.map((pp) => {
                    const pr = PRINCIPLES.find((x) => x.id === pp)!;
                    return <span key={pp} className="h-1.5 w-5 rounded-full" style={{ background: pr.color, opacity: active.includes(pp) || active.length === 0 ? 1 : 0.3 }} />;
                  })}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
          {list.length === 0 && <p className="col-span-full py-10 text-center text-sm text-[#7d92c4]">Нет сцен со всеми выбранными принципами — сними один фильтр</p>}
        </motion.div>

        <div className="rounded-[22px] border border-white/10 bg-[#0a1740]/60 p-4">
          <AnimatePresence mode="wait">
            {hs ? (
              <motion.div key={hs.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <p className="num-mono text-[11px] font-black" style={{ color: hs.color }}>SCENE #{hs.n}</p>
                <p className="display mt-1 text-xl font-extrabold text-white">{hs.t}</p>
                <p className="mt-1 text-sm text-[#aebde6]">{hs.d}</p>
                <div className="mt-3 space-y-1.5">
                  {hs.p.map((pp) => {
                    const pr = PRINCIPLES.find((x) => x.id === pp)!;
                    const Icon = pr.icon;
                    return (
                      <div key={pp} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/25 px-2.5 py-1.5 text-[11px] font-bold text-white">
                        <Icon size={13} style={{ color: pr.color }} />{pr.label}
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => fly(hs.id)} className="btn3d btn3d-green mt-4 w-full py-3 text-xs">Open scene <ArrowRight size={14} /></button>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
                <p className="display text-lg font-extrabold text-white">Принципы выставки</p>
                <p className="mt-1 text-[12px] text-[#8ea6d8]">Наведи на плитку — увидишь, какие механики взаимодействия демонстрирует сцена.</p>
                <div className="mt-4 space-y-2">
                  {counts.map((p) => (
                    <div key={p.id}>
                      <div className="flex justify-between text-[10px] font-extrabold"><span className="text-[#c9d8ff]">{p.label}</span><span className="text-white">{p.n}</span></div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50">
                        <motion.div className="h-full rounded-full" initial={{ width: 0 }} whileInView={{ width: `${(p.n / SCENES.length) * 100}%` }} viewport={{ once: true }} style={{ background: p.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ShowcaseSection>
  );
}
