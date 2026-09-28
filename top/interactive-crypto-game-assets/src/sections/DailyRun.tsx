/* ------------------------------------------------------------------
 * 33 · DAILY RUN — roguelite map crawl with relics & elites
 * ------------------------------------------------------------------ */
import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Card, Tag } from "../components/ui";
import {
  BossHp, ComboMeter, fireWin, GameSection, generateRunMap, RUN_EVENTS, RUN_RELICS,
  ReadyGo, StarBurst, type RunNode,
} from "../fx/gamekit";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; onGems: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

export default function DailyRun({ onXp, onGems, toast }: Props) {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 9999));
  const map = useMemo(() => generateRunMap(seed), [seed]);
  const [layer, setLayer] = useState(0);
  const [node, setNode] = useState<RunNode | null>(null);
  const [hp, setHp] = useState(100);
  const [gold, setGold] = useState(50);
  const [atk, setAtk] = useState(12);
  const [def, setDef] = useState(4);
  const [enemyHp, setEnemyHp] = useState(0);
  const [enemyMax, setEnemyMax] = useState(0);
  const [combo, setCombo] = useState(0);
  const [phase, setPhase] = useState<"map" | "fight" | "event" | "shop" | "rest" | "result">("map");
  const [ready, setReady] = useState(false);
  const [relics, setRelics] = useState<string[]>([]);
  const [won, setWon] = useState(false);

  const enter = (n: RunNode, y: number) => {
    if (y !== layer) return;
    setNode(n);
    if (n.type === "fight" || n.type === "elite" || n.type === "boss") {
      const max = n.type === "boss" ? 220 : n.type === "elite" ? 140 : 80;
      setEnemyMax(max); setEnemyHp(max); setPhase("fight"); setReady(true); setCombo(0);
    } else if (n.type === "shop") setPhase("shop");
    else if (n.type === "rest") setPhase("rest");
    else setPhase("event");
    sfx.pop();
  };

  const hit = () => {
    const dmg = atk + combo * 2 + Math.floor(Math.random() * 6);
    setEnemyHp(h => {
      const n = Math.max(0, h - dmg);
      if (n <= 0) {
        const g = 15 + layer * 5;
        setGold(x => x + g);
        toast("Node cleared", `+${g} gold`, "green");
        sfx.success();
        if (node?.type === "boss") { setWon(true); setPhase("result"); onXp(150); onGems(40); fireWin(); }
        else { setLayer(l => l + 1); setPhase("map"); setNode(null); }
      }
      return n;
    });
    setCombo(c => c + 1);
    // enemy hit
    setTimeout(() => {
      const ed = Math.max(3, 14 + layer * 2 - def);
      setHp(h => {
        const n = Math.max(0, h - ed);
        if (n <= 0) { setPhase("result"); setWon(false); sfx.error(); }
        return n;
      });
    }, 300);
  };

  const takeRelic = (id: string) => {
    const r = RUN_RELICS.find(x => x.id === id)!;
    if (relics.includes(id) || gold < 40) { sfx.error(); return; }
    setGold(g => g - 40);
    setRelics(rs => [...rs, id]);
    setAtk(a => a + r.atk);
    setDef(d => d + r.def);
    sfx.coin();
  };

  const reset = () => {
    setSeed(Math.floor(Math.random() * 9999));
    setLayer(0); setNode(null); setHp(100); setGold(50); setAtk(12); setDef(4);
    setPhase("map"); setRelics([]); setWon(false); setCombo(0);
  };

  return (
    <GameSection id="dailyrun" index="33" kicker="Daily Run" title="Рогалик дня"
      desc="Карта из 8 слоёв: бои, элиты, магазин реликвий, rest, ивенты и финальный босс. Один забег — один билд."
      right={<div className="flex gap-2"><Tag tone="green">HP {hp}</Tag><Tag tone="gold">Gold {gold}</Tag><Tag tone="blue">ATK {atk}/DEF {def}</Tag></div>}>

      {phase === "map" && (
        <div className="panel-3d relative p-4">
          <div className="relative mx-auto h-[420px] max-w-md">
            {map.map((row, y) => row.map(n => (
              <button key={n.id} onClick={() => enter(n, y)}
                className={cn("absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 text-[10px] font-black uppercase transition",
                  y === layer ? "anim-pulse-ring border-[#8ef23c] bg-[#8ef23c]/20 text-[#8ef23c]" :
                  y < layer ? "border-white/20 bg-white/10 text-[#8ea6d8]" : "border-white/10 bg-black/30 text-[#54678f]")}
                style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%`, boxShadow: "0 4px 0 #030816" }}>
                {n.type === "boss" ? "BOSS" : n.type === "elite" ? "ELITE" : n.type[0].toUpperCase()}
              </button>
            )))}
          </div>
          <p className="mt-2 text-center text-[11px] text-[#8ea6d8]">Layer {layer + 1}/8 · pick a node</p>
        </div>
      )}

      {phase === "fight" && node && (
        <div className="panel-3d relative p-5">
          <AnimatePresence>{ready && <ReadyGo onDone={() => setReady(false)} />}</AnimatePresence>
          <BossHp hp={enemyHp} max={enemyMax} name={`${node.type.toUpperCase()} · L${layer + 1}`} color={node.type === "boss" ? "#ffc531" : "#ff5470"} />
          <div className="my-6 flex justify-center text-5xl">{node.type === "boss" ? "🐙" : node.type === "elite" ? "😈" : "🐻"}</div>
          <BossHp hp={hp} max={100} name="You" color="#8ef23c" />
          <div className="mt-3"><ComboMeter combo={combo} /></div>
          <button onClick={hit} className="btn3d btn3d-short mt-4 w-full py-4 text-sm">Strike</button>
        </div>
      )}

      {phase === "shop" && (
        <Card title="Relic shop" sub="40 gold each">
          <div className="grid gap-2 sm:grid-cols-2">
            {RUN_RELICS.map(r => (
              <button key={r.id} onClick={() => takeRelic(r.id)} className={cn("rounded-2xl border p-3 text-left", relics.includes(r.id) ? "border-[#8ef23c]/40 bg-[#8ef23c]/10" : "border-white/10 bg-black/25")}>
                <p className="text-xs font-extrabold text-white">{r.n}</p>
                <p className="text-[10px] text-[#8ea6d8]">{r.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => { setLayer(l => l + 1); setPhase("map"); }} className="btn3d btn3d-ghost mt-3 w-full py-3 text-xs">Leave shop</button>
        </Card>
      )}

      {phase === "rest" && (
        <Card title="Campfire" sub="Heal or upgrade">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setHp(h => Math.min(100, h + 30)); setLayer(l => l + 1); setPhase("map"); sfx.coin(); }} className="btn3d btn3d-green py-4 text-xs">Heal +30</button>
            <button onClick={() => { setAtk(a => a + 5); setLayer(l => l + 1); setPhase("map"); sfx.pop(); }} className="btn3d btn3d-gold py-4 text-xs">+5 ATK</button>
          </div>
        </Card>
      )}

      {phase === "event" && (
        <Card title={RUN_EVENTS[layer % RUN_EVENTS.length].t} sub="Choose wisely">
          <p className="mb-4 text-sm text-[#c9d8ff]">{RUN_EVENTS[layer % RUN_EVENTS.length].b}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { setHp(h => Math.max(10, h - 10)); setAtk(a => a + 8); setLayer(l => l + 1); setPhase("map"); sfx.whoosh(); }} className="btn3d btn3d-short py-3 text-xs">{RUN_EVENTS[layer % RUN_EVENTS.length].ok}</button>
            <button onClick={() => { setLayer(l => l + 1); setPhase("map"); sfx.soft(); }} className="btn3d btn3d-ghost py-3 text-xs">{RUN_EVENTS[layer % RUN_EVENTS.length].no}</button>
          </div>
        </Card>
      )}

      {phase === "result" && (
        <div className="py-10 text-center">
          <StarBurst stars={won ? 3 : 1} />
          <p className={cn("display mt-3 text-3xl font-extrabold", won ? "text-[#8ef23c]" : "text-[#ff5470]")}>{won ? "RUN CLEAR" : "RUN FAILED"}</p>
          <button onClick={reset} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">New run</button>
        </div>
      )}
    </GameSection>
  );
}
