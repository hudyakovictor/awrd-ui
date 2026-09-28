/* ------------------------------------------------------------------
 * 27 · BOSS RUSH CAMPAIGN — sequential bosses with loadout & relics
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import { Swords } from "lucide-react";
import { useState } from "react";
import { Card, Tag } from "../components/ui";
import { BossHp, ComboMeter, fireWin, GameSection, ReadyGo, StarBurst } from "../fx/gamekit";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; onGems: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

const bosses = [
  { n: "FOMO Imp", hp: 120, emoji: "😈", color: "#ff5470", skill: "Temptation strike" },
  { n: "Funding Leech", hp: 180, emoji: "🩸", color: "#a78bff", skill: "Drain margin" },
  { n: "RSI Dragon", hp: 240, emoji: "🐉", color: "#ff8b3d", skill: "Overbought breath" },
  { n: "Whale Ghost", hp: 320, emoji: "🐋", color: "#5b8cff", skill: "Spoof wall" },
  { n: "Volatility Hydra", hp: 400, emoji: "🐙", color: "#ffc531", skill: "Triple wick" },
];

const loadout = [
  { n: "Plan Shield", dmg: 0, def: 8, c: "#5b8cff" },
  { n: "Risk Dagger", dmg: 14, def: 0, c: "#ff5470" },
  { n: "Patience Bow", dmg: 10, def: 4, c: "#8ef23c" },
  { n: "Journal Tome", dmg: 6, def: 6, c: "#ffc531" },
];

export default function BossRush({ onXp, onGems, toast }: Props) {
  const [idx, setIdx] = useState(0);
  const [hp, setHp] = useState(bosses[0].hp);
  const [myHp, setMyHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [gear, setGear] = useState([0, 1]);
  const [won, setWon] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const boss = bosses[idx];
  const atk = gear.reduce((a, i) => a + loadout[i].dmg, 12);
  const def = gear.reduce((a, i) => a + loadout[i].def, 0);

  const strike = (type: "light" | "heavy") => {
    if (!started || won || myHp <= 0) return;
    const dmg = type === "heavy" ? atk * 2 + combo * 3 : atk + combo * 2;
    setHp(h => {
      const n = Math.max(0, h - dmg);
      if (n <= 0) {
        if (idx + 1 >= bosses.length) {
          setWon(true); onXp(200); onGems(50); fireWin(); toast("Campaign clear!", "+200 XP", "gold");
        } else {
          toast(`${boss.n} down`, "Next boss…", "green");
          setTimeout(() => {
            setIdx(i => i + 1);
            setHp(bosses[idx + 1].hp);
            setCombo(0);
            setReady(true);
            sfx.levelUp();
          }, 600);
        }
      }
      return n;
    });
    setCombo(c => c + 1);
    setLog(l => [`You −${dmg}`, ...l].slice(0, 5));
    sfx.success();
    // boss counter
    setTimeout(() => {
      setMyHp(h => Math.max(0, h - Math.max(4, 16 + idx * 3 - def)));
      setLog(l => [`${boss.n} hits`, ...l].slice(0, 5));
      sfx.error();
    }, 400);
  };

  return (
    <GameSection id="bossrush" index="27" kicker="Boss Rush" title="Кампания боссов"
      desc="5 боссов подряд. Выбери экипировку, комбо-удары, защита от контратак. Победа = легендарный сундук."
      right={<Tag tone="red">Boss {idx + 1}/{bosses.length}</Tag>}>

      {!started ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Loadout" sub="Pick 2 relics">
            <div className="grid grid-cols-2 gap-2">
              {loadout.map((g, i) => {
                const on = gear.includes(i);
                return (
                  <button key={g.n} onClick={() => {
                    setGear(gr => on ? gr.filter(x => x !== i) : gr.length < 2 ? [...gr, i] : [gr[1], i]);
                    sfx.tick();
                  }} className={cn("rounded-2xl border p-3 text-left", on ? "border-[#8ef23c] bg-[#8ef23c]/10" : "border-white/10 bg-black/25")}>
                    <p className="text-xs font-extrabold text-white">{g.n}</p>
                    <p className="text-[10px] text-[#8ea6d8]">ATK +{g.dmg} · DEF +{g.def}</p>
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setStarted(true); setReady(true); sfx.whoosh(); }} className="btn3d btn3d-short mt-4 w-full py-3.5 text-xs"><Swords size={14} /> Enter rush</button>
          </Card>
          <Card title="Boss list" sub="Order of battle">
            <div className="space-y-2">
              {bosses.map((b, i) => (
                <div key={b.n} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                  <span className="text-2xl">{b.emoji}</span>
                  <div className="flex-1"><p className="text-xs font-extrabold text-white">{b.n}</p><p className="text-[10px] text-[#7d92c4]">{b.skill} · {b.hp} HP</p></div>
                  <span className="text-[10px] font-bold text-[#8ea6d8]">#{i + 1}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="relative panel-3d overflow-hidden p-5">
          <AnimatePresence>{ready && <ReadyGo onDone={() => setReady(false)} />}</AnimatePresence>
          <div className="mb-3 flex gap-1">
            {bosses.map((_, i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < idx ? "bg-[#8ef23c]" : i === idx ? "bg-[#ffc531]" : "bg-white/10")} />)}
          </div>
          <BossHp hp={hp} max={boss.hp} name={`${boss.emoji} ${boss.n}`} color={boss.color} />
          <div className="my-5 flex justify-center">
            <motion.div key={boss.n} initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: [0, -8, 0] }} transition={{ y: { duration: 2, repeat: Infinity } }}
              className="flex h-28 w-28 items-center justify-center rounded-[32px] border-4 text-5xl"
              style={{ borderColor: boss.color, boxShadow: `0 0 40px ${boss.color}88`, background: `${boss.color}22` }}>
              {boss.emoji}
            </motion.div>
          </div>
          <BossHp hp={myHp} max={100} name="You" color="#8ef23c" />
          <div className="mt-3 flex items-center justify-between">
            <ComboMeter combo={combo} />
            <div className="text-right text-[10px] font-bold text-[#8ea6d8]">{log.map((l, i) => <div key={i}>{l}</div>)}</div>
          </div>
          {won || myHp <= 0 ? (
            <div className="mt-5 text-center">
              <StarBurst stars={won ? 3 : 1} />
              <p className={cn("display mt-3 text-3xl font-extrabold", won ? "text-[#8ef23c]" : "text-[#ff5470]")}>{won ? "RUSH CLEAR" : "WIPED"}</p>
              <button onClick={() => { setStarted(false); setIdx(0); setHp(bosses[0].hp); setMyHp(100); setWon(false); setCombo(0); }} className="btn3d btn3d-green mt-4 px-8 py-3 text-xs">Again</button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button onClick={() => strike("light")} className="btn3d btn3d-gold py-5 text-sm">Light</button>
              <button onClick={() => strike("heavy")} className="btn3d btn3d-short py-5 text-sm">Heavy</button>
            </div>
          )}
        </div>
      )}
    </GameSection>
  );
}
