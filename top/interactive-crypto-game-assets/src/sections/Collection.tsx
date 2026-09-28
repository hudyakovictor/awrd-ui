/* 17 · COLLECTION v2 — one collector room scene.
   Pack ritual × holo foil × flip × rarity × gallery viewer. */
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Crown, Flame, Gem, Gift, Search, Sparkles, Swords, Wallet } from "lucide-react";
import { useMemo, useState, type PointerEvent as RPE } from "react";
import confetti from "canvas-confetti";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
const RC: Record<Rarity, string> = { common: "#8ea6d8", rare: "#5b8cff", epic: "#a78bff", legendary: "#ffc531", mythic: "#ff5470" };
const DROP: Rarity[] = ["common", "common", "common", "common", "rare", "rare", "rare", "epic", "epic", "legendary", "mythic"];

const HEROES = [
  { id: 1, n: "Satoshi", r: "mythic" as Rarity, i: Crown, atk: 98, def: 90, lore: "Genesis. Владелец первого блока." },
  { id: 2, n: "Whale", r: "legendary" as Rarity, i: Wallet, atk: 88, def: 76, lore: "Двигает стакан одним ордером." },
  { id: 3, n: "Duelist", r: "epic" as Rarity, i: Swords, atk: 90, def: 65, lore: "Непобедим в PvP-прогнозах." },
  { id: 4, n: "Degen", r: "rare" as Rarity, i: Flame, atk: 95, def: 22, lore: "×100 на всё. Живёт ярко." },
  { id: 5, n: "Sniper", r: "legendary" as Rarity, i: Sparkles, atk: 92, def: 55, lore: "Вход в тик разворота." },
  { id: 6, n: "Hodler", r: "rare" as Rarity, i: Gem, atk: 40, def: 99, lore: "Бриллиантовые руки." },
  { id: 7, n: "Scalper", r: "common" as Rarity, i: Sparkles, atk: 72, def: 44, lore: "Сто сделок по 0.1%." },
  { id: 8, n: "Ghost", r: "epic" as Rarity, i: Crown, atk: 77, def: 81, lore: "Невидимка ордербука." },
];
type Hero = (typeof HEROES)[number];

function HoloCard({ h, w = 168, onPick, active }: { h: Hero; w?: number; onPick?: () => void; active?: boolean }) {
  const rx = useMotionValue(0), ry = useMotionValue(0), px = useMotionValue(50), py = useMotionValue(50);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });
  const [flip, setFlip] = useState(false);
  const col = RC[h.r];
  const foil = useMotionTemplate`conic-gradient(from 200deg at ${px}% ${py}%, transparent 0deg, ${col}66 40deg, #ffffff88 70deg, ${col}66 110deg, transparent 150deg)`;
  const glare = useMotionTemplate`radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.5), transparent 46%)`;
  const H = Math.round(w * 1.42);
  const Icon = h.i;
  return (
    <div style={{ perspective: 1000, width: w, height: H }} className="shrink-0">
      <motion.div
        onPointerMove={(e: RPE<HTMLDivElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          ry.set((x - 0.5) * 26); rx.set(-(y - 0.5) * 26); px.set(x * 100); py.set(y * 100);
        }}
        onPointerLeave={() => { rx.set(0); ry.set(0); px.set(50); py.set(50); }}
        onClick={() => { setFlip((f) => !f); sfx.whoosh(); onPick?.(); }}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="relative h-full w-full cursor-pointer"
        animate={{ scale: active ? 1.05 : 1 }}
      >
        <motion.div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: flip ? 180 : 0 }} transition={{ type: "spring", stiffness: 170, damping: 19 }}>
          <div
            className="absolute inset-0 overflow-hidden rounded-[20px] border-[3px] p-3"
            style={{
              backfaceVisibility: "hidden", borderColor: col,
              background: `linear-gradient(165deg, ${col}4d, #0b1a42 55%, #050c22)`,
              boxShadow: `0 8px 0 #030816, 0 0 ${h.r === "common" ? 8 : h.r === "mythic" ? 42 : 24}px ${col}55`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest" style={{ color: col }}>{h.r}</span>
              <span className="num-mono text-[10px] font-extrabold text-white/60">#{String(h.id).padStart(3, "0")}</span>
            </div>
            <div className="mt-2 flex items-center justify-center rounded-2xl border border-white/10 bg-black/35" style={{ height: H * 0.44 }}>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <Icon size={w * 0.32} style={{ color: col, filter: `drop-shadow(0 0 16px ${col})` }} strokeWidth={1.6} />
              </motion.div>
            </div>
            <p className="display mt-2 text-[15px] font-extrabold text-white">{h.n}</p>
            <div className="mt-1 grid grid-cols-2 gap-1">
              <div className="rounded-md bg-black/40 py-0.5 text-center"><p className="num-mono text-[12px] font-extrabold text-[#ff8ba0]">{h.atk}</p><p className="text-[8px] font-bold text-white/45">ATK</p></div>
              <div className="rounded-md bg-black/40 py-0.5 text-center"><p className="num-mono text-[12px] font-extrabold text-[#9db9ff]">{h.def}</p><p className="text-[8px] font-bold text-white/45">DEF</p></div>
            </div>
            {h.r !== "common" && <motion.div className="pointer-events-none absolute inset-0 mix-blend-color-dodge" style={{ background: foil }} />}
            <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
          </div>
          <div
            className="absolute inset-0 flex flex-col rounded-[20px] border-[3px] p-3"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: col, background: "linear-gradient(160deg,#141f4a,#050c22)", boxShadow: "0 8px 0 #030816" }}
          >
            <p className="display text-sm font-extrabold text-white">{h.n}</p>
            <p className="mt-1 text-[11px] leading-snug text-[#aebde6]">{h.lore}</p>
            <div className="mt-auto">
              <div className="flex justify-between text-[9px] font-bold text-white/50"><span>POWER</span><span>{h.atk + h.def}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/50">
                <motion.div className="h-full rounded-full" animate={{ width: flip ? `${Math.min(100, (h.atk + h.def) / 2)}%` : "0%" }} style={{ background: col }} />
              </div>
              <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-[#7d92c4]">tap — flip back</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Collection() {
  const [phase, setPhase] = useState<"sealed" | "ritual" | "reveal">("sealed");
  const [pulled, setPulled] = useState<Hero[]>([]);
  const [owned, setOwned] = useState<number[]>([6, 7, 4]);
  const [filter, setFilter] = useState<Rarity | "all">("all");
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<Hero>(HEROES[1]);

  const open = () => {
    if (phase !== "sealed") return;
    setPhase("ritual");
    sfx.whoosh();
    setTimeout(() => {
      const picks = [0, 1, 2].map(() => {
        const r = DROP[Math.floor(Math.random() * DROP.length)];
        const pool = HEROES.filter((h) => h.r === r);
        return (pool.length ? pool : HEROES)[Math.floor(Math.random() * (pool.length ? pool.length : HEROES.length))];
      });
      setPulled(picks);
      setOwned((o) => Array.from(new Set([...o, ...picks.map((p) => p.id)])));
      setFocus(picks.sort((a, b) => DROP.indexOf(b.r) - DROP.indexOf(a.r))[0]);
      setPhase("reveal");
      sfx.levelUp();
      const top = picks.some((p) => p.r === "mythic" || p.r === "legendary");
      confetti({ particleCount: top ? 220 : 110, spread: 100, origin: { y: 0.55 }, colors: top ? ["#ffc531", "#ff5470", "#fff"] : ["#5b8cff", "#a78bff", "#fff"] });
    }, 1500);
  };

  const gallery = useMemo(
    () => HEROES.filter((h) => (filter === "all" || h.r === filter) && h.n.toLowerCase().includes(query.toLowerCase())),
    [filter, query],
  );

  return (
    <ShowcaseSection
      id="collection" index="17" kicker="Collection · v2" title="Комната коллекционера"
      desc="Полный ритуал: пак трясётся, вспыхивает и раскрывается веером. Карты с holo-фольгой за курсором, переворотом и редкостью до mythic."
      accent="#ffc531"
      variant="holo"
      moment="Запоминающийся момент: пак вспыхивает и раскрывается веером holo-карт"
      keys={[{ k: "Space", d: "открыть пак" }]}
      hotkeys={{ Space: () => (phase === "sealed" ? open() : (setPhase("sealed"), setPulled([]))) }}
      tags={<div className="flex gap-2"><Tag tone="gold">{owned.length}/{HEROES.length} owned</Tag><Tag tone="violet">holo foil</Tag></div>}
    >
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <ScenePanel title="Bull Pack" sub="3 карты · mythic 9%" accent="#ffc531">
          <div className="flex min-h-[340px] flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {phase !== "reveal" ? (
                <motion.button
                  key="pack" onClick={open} exit={{ scale: 1.7, opacity: 0, filter: "blur(12px)" }}
                  animate={phase === "ritual" ? { rotate: [0, -7, 7, -12, 12, 0], scale: [1, 1.06, 1.12, 1.18, 1.24] } : { y: [0, -9, 0] }}
                  transition={phase === "ritual" ? { duration: 1.5 } : { duration: 2.4, repeat: Infinity }}
                  className="relative flex h-[250px] w-[175px] flex-col items-center justify-center overflow-hidden rounded-[24px] border-[3px] border-[#ffc531]"
                  style={{ background: "linear-gradient(160deg,#4d3a08,#1a1204)", boxShadow: "0 8px 0 #8a5c00, 0 0 55px rgba(255,197,49,.4)" }}
                >
                  <Gift size={64} className="relative text-[#ffd76a]" style={{ filter: "drop-shadow(0 0 22px #ffc531)" }} />
                  <p className="display relative mt-3 text-sm font-extrabold tracking-[0.25em] text-[#ffd76a]">BULL PACK</p>
                  <p className="relative text-[10px] font-bold text-white/60">{phase === "ritual" ? "Opening…" : "Tap to open"}</p>
                  {phase === "ritual" && <motion.div className="absolute inset-0 bg-white" animate={{ opacity: [0, 0, 0.85] }} transition={{ duration: 1.5, times: [0, 0.8, 1] }} />}
                </motion.button>
              ) : (
                <motion.div key="reveal" className="flex flex-col items-center gap-4">
                  <div className="flex flex-wrap justify-center gap-3">
                    {pulled.map((p, i) => (
                      <motion.div key={`${p.id}-${i}`} initial={{ y: 110, rotateY: 160, opacity: 0, scale: 0.55 }} animate={{ y: 0, rotateY: 0, opacity: 1, scale: 1 }} transition={{ delay: i * 0.22, type: "spring", stiffness: 150, damping: 15 }}>
                        <HoloCard h={p} w={i === 0 ? 150 : 128} onPick={() => setFocus(p)} active={focus.id === p.id} />
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={() => { setPhase("sealed"); setPulled([]); sfx.pop(); }} className="btn3d btn3d-gold px-6 py-2.5 text-[11px]"><Gift size={14} /> Open another</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <SceneStat label="Packs" value="∞" sub="demo" color="#ffd76a" />
            <SceneStat label="Best" value={focus.r.slice(0, 4).toUpperCase()} sub={focus.n} color={RC[focus.r]} />
            <SceneStat label="Power" value={`${focus.atk + focus.def}`} sub="focus card" color="#fff" />
          </div>
        </ScenePanel>

        <div className="space-y-4">
          <ScenePanel title="Spotlight" sub="Клик — переворот · движение — фольга" accent={RC[focus.r]}
            right={<span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: RC[focus.r] }}>{focus.r}</span>}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <HoloCard h={focus} w={210} />
              <div className="flex-1">
                <p className="display text-xl font-extrabold text-white">{focus.n}</p>
                <p className="mt-1 text-sm text-[#aebde6]">{focus.lore}</p>
                <div className="mt-3 space-y-2">
                  {[["ATK", focus.atk, "#ff5470"], ["DEF", focus.def, "#5b8cff"]].map(([k, v, c]) => (
                    <div key={k as string}>
                      <div className="flex justify-between text-[10px] font-extrabold"><span className="text-[#8ea6d8]">{k}</span><span className="num-mono text-white">{v}</span></div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-black/50">
                        <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${v}%` }} style={{ background: c as string, boxShadow: `0 0 10px ${c}` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-[#7d92c4]">{owned.includes(focus.id) ? "✓ В коллекции" : "○ Ещё не выбита — открывай паки"}</p>
              </div>
            </div>
          </ScenePanel>

          <ScenePanel title="Vault" sub="Фильтр редкости + поиск" accent="#a78bff"
            right={
              <div className="field-3d flex items-center gap-2 px-3 py-2">
                <Search size={13} className="text-[#7d92c4]" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="w-28 bg-transparent text-xs font-bold text-white outline-none placeholder:text-[#54678f]" />
              </div>
            }
          >
            <div className="mb-3 flex flex-wrap gap-1.5">
              {(["all", "common", "rare", "epic", "legendary", "mythic"] as const).map((f) => (
                <button key={f} onClick={() => { setFilter(f); sfx.tick(); }} className={cn("rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold uppercase", filter === f ? "text-[#081130]" : "bg-white/5 text-[#8ea6d8]")}
                  style={filter === f ? { background: f === "all" ? "#8ef23c" : RC[f] } : undefined}>{f}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {gallery.map((h) => {
                  const has = owned.includes(h.id);
                  return (
                    <motion.button key={h.id} layout initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => { setFocus(h); sfx.pop(); }}
                      className={cn("relative overflow-hidden rounded-2xl border-2 p-3 text-left transition", focus.id === h.id ? "border-white" : "border-white/10 bg-black/25")}
                      style={{ boxShadow: focus.id === h.id ? `0 0 22px ${RC[h.r]}66` : undefined }}
                    >
                      <h.i size={26} style={{ color: has ? RC[h.r] : "#2a4b8f" }} />
                      <p className={cn("mt-2 text-xs font-extrabold", has ? "text-white" : "text-[#54678f]")}>{has ? h.n : "???"}</p>
                      <p className="text-[9px] font-extrabold uppercase" style={{ color: has ? RC[h.r] : "#2a4b8f" }}>{h.r}</p>
                      {!has && <span className="absolute right-2 top-2 text-[10px] text-[#2a4b8f]">🔒</span>}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
