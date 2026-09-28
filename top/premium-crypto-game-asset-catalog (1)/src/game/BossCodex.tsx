import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton } from "./Device";
import { Mascot, type Mood } from "./Mascot";
import { ART, type ArtKey } from "./art";
import { sfx, Confetti, Rays } from "./Juice";

/* ================================================================== */
/*  BOSS CODEX — bestiary + weakness lab + battle sim                   */
/* ================================================================== */

type Boss = {
  id: string;
  n: string;
  title: string;
  art: ArtKey;
  c: string;
  hp: number;
  atk: number;
  lore: string;
  weak: string[];
  moves: { n: string; d: string; i: IconName; pow: number }[];
  loot: { a: ArtKey; t: string; r: number }[];
  diff: 1 | 2 | 3 | 4 | 5;
  cleared: boolean;
};

const BOSSES: Boss[] = [
  {
    id: "fomo",
    n: "FOMO Fiend",
    title: "Imp of Impulse",
    art: "flame",
    c: "#ff8a3d",
    hp: 1200,
    atk: 45,
    lore: "Born from green candles and group chats. Whispers 'buy now or cry later' at 3am.",
    weak: ["Stop-loss", "Patience", "Plan"],
    moves: [
      { n: "Hype Wave", d: "Forces a market buy", i: "trendUp", pow: 30 },
      { n: "Green Candle Lure", d: "+50% greed", i: "candle", pow: 45 },
      { n: "All-In Scream", d: "Removes your stop", i: "alert", pow: 70 },
    ],
    loot: [
      { a: "shield", t: "Stop Amulet", r: 80 },
      { a: "gem", t: "20 gems", r: 100 },
      { a: "potion", t: "Calm Draught", r: 35 },
    ],
    diff: 1,
    cleared: true,
  },
  {
    id: "bear",
    n: "Capitulation",
    title: "Eater of Stops",
    art: "candle",
    c: "#ff4d6a",
    hp: 4200,
    atk: 120,
    lore: "A winter that walks. Feeds on leverage and loose stops. Its roar is a -30% wick.",
    weak: ["Spot holdings", "Low leverage", "Stables"],
    moves: [
      { n: "Red Wick Slam", d: "AoE fear damage", i: "trendDown", pow: 90 },
      { n: "Liquidation Cascade", d: "Chains on leverage", i: "bolt", pow: 130 },
      { n: "Despair Aura", d: "Halves your healing", i: "heart", pow: 60 },
    ],
    loot: [
      { a: "trophy", t: "Winter Survivor", r: 60 },
      { a: "gem", t: "80 gems", r: 100 },
      { a: "freeze", t: "Streak Freeze", r: 45 },
    ],
    diff: 3,
    cleared: true,
  },
  {
    id: "whale",
    n: "The Whale",
    title: "Mover of Markets",
    art: "whale",
    c: "#9b6bff",
    hp: 8800,
    atk: 210,
    lore: "Ancient. Patient. Its smallest splash is your entire portfolio. Never fight the tide.",
    weak: ["Follow the flow", "Wide stops", "Small size"],
    moves: [
      { n: "Spoof Wall", d: "Fake 50 BTC wall", i: "layers", pow: 120 },
      { n: "Stop Hunt", d: "Wicks both sides", i: "target", pow: 180 },
      { n: "Tsunami", d: "±12% in minutes", i: "rocket", pow: 260 },
    ],
    loot: [
      { a: "whale", t: "Whale Companion", r: 12 },
      { a: "crown", t: "Tide Crown", r: 40 },
      { a: "chest", t: "Deep chest", r: 100 },
    ],
    diff: 5,
    cleared: false,
  },
  {
    id: "rug",
    n: "Rugpull Raptor",
    title: "Dev of Darkness",
    art: "lock",
    c: "#ffc24b",
    hp: 2600,
    atk: 85,
    lore: "Promises 1000x. Liquidity? Never heard of it. Doxxed? Anon forever.",
    weak: ["Audits", "DYOR", "Small bets"],
    moves: [
      { n: "Honeypot", d: "You can buy, never sell", i: "lock", pow: 70 },
      { n: "Liquidity Drain", d: "Pool → 0 instantly", i: "wallet", pow: 110 },
      { n: "Telegram Vanish", d: "All admins leave", i: "x", pow: 50 },
    ],
    loot: [
      { a: "key", t: "Audit Key", r: 55 },
      { a: "coin", t: "500 coins", r: 100 },
      { a: "shield", t: "DYOR Shield", r: 70 },
    ],
    diff: 2,
    cleared: false,
  },
  {
    id: "fud",
    n: "FUD Hydra",
    title: "Nine Heads of Doubt",
    art: "ticket",
    c: "#38e1ff",
    hp: 5400,
    atk: 140,
    lore: "Cut off one headline, two grow back. 'China bans Bitcoin' — again, for the 40th time.",
    weak: ["Primary sources", "On-chain data", "Zoom out"],
    moves: [
      { n: "Fake Headline", d: "-8% on rumor", i: "bell", pow: 90 },
      { n: "Exchange Hack FUD", d: "Panic withdrawals", i: "alert", pow: 120 },
      { n: "Regulation Roar", d: "Freezes alts", i: "lock", pow: 100 },
    ],
    loot: [
      { a: "star", t: "Diamond Lens", r: 50 },
      { a: "gem", t: "60 gems", r: 100 },
      { a: "medal", t: "FUD Slayer", r: 30 },
    ],
    diff: 4,
    cleared: false,
  },
  {
    id: "liq",
    n: "Leverage Lich",
    title: "King of 100×",
    art: "bolt",
    c: "#ff4d6a",
    hp: 7000,
    atk: 190,
    lore: "Offers godlike power for a 1% move against you. The funding rate is your soul.",
    weak: ["×1–×3 only", "Isolated margin", "TP/SL set"],
    moves: [
      { n: "Funding Bleed", d: "Drains hourly", i: "clock", pow: 80 },
      { n: "Liquidation Gaze", d: "Instant KO if close", i: "eye", pow: 220 },
      { n: "Revenge Trade", d: "Forces re-entry", i: "refresh", pow: 110 },
    ],
    loot: [
      { a: "bolt", t: "Lich's Fuse", r: 35 },
      { a: "crown", t: "Risk Crown", r: 45 },
      { a: "gem", t: "120 gems", r: 100 },
    ],
    diff: 4,
    cleared: false,
  },
];

/* ---------------- codex browser ---------------- */
function Codex({ sel, setSel }: { sel: number; setSel: (n: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {BOSSES.map((b, i) => {
        const A = ART[b.art];
        const active = sel === i;
        return (
          <motion.button
            key={b.id}
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setSel(i);
              sfx("select");
            }}
            className="relative flex flex-col items-center rounded-2xl border-2 p-2"
            style={{
              borderColor: active ? b.c : "#22355e",
              background: active ? `linear-gradient(170deg, ${b.c}26, #0d1528)` : "#0d1528",
              boxShadow: active ? `0 0 20px -6px ${b.c}, 0 4px 0 #070d1c` : "0 4px 0 #070d1c",
            }}
          >
            <A size={52} className={cn(!b.cleared && "opacity-90")} />
            <span className="mt-1 truncate text-[10px] font-extrabold text-white">{b.n}</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }, (_, k) => (
                <span key={k} className="h-1.5 w-1.5 rounded-full" style={{ background: k < b.diff ? b.c : "#22355e" }} />
              ))}
            </span>
            {b.cleared && (
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-bull text-[#02150b]">
                <Icon name="check" size={11} strokeWidth={4} />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ---------------- boss dossier ---------------- */
function Dossier({ b }: { b: Boss }) {
  const A = ART[b.art];
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 p-5" style={{ borderColor: `${b.c}55`, background: `radial-gradient(circle at 50% 0%, ${b.c}26, #0a1226 65%)` }}>
      <AnimatePresence mode="wait">
        <motion.div key={b.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <motion.div animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }} transition={{ duration: 3, repeat: Infinity }} className="relative shrink-0">
              <span className="absolute inset-0 -z-0 rounded-full blur-2xl" style={{ background: `${b.c}55` }} />
              <A size={130} />
            </motion.div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-[family-name:var(--font-display)] text-[24px] font-bold text-white">{b.n}</span>
                {b.cleared ? <Tag tone="bull">defeated</Tag> : <Tag tone="bear">undefeated</Tag>}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: b.c }}>{b.title}</div>
              <p className="mt-2 max-w-[440px] text-[12.5px] italic leading-relaxed text-ink-300">“{b.lore}”</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-black/30 p-2">
                  <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">HP</div>
                  <div className="tnum font-mono text-[16px] font-black" style={{ color: b.c }}>{b.hp.toLocaleString()}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(b.hp / 9000) * 100}%` }} className="h-full rounded-full" style={{ background: b.c }} />
                  </div>
                </div>
                <div className="rounded-xl bg-black/30 p-2">
                  <div className="font-mono text-[8px] uppercase tracking-widest text-ink-500">Attack</div>
                  <div className="tnum font-mono text-[16px] font-black text-bear">{b.atk}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(b.atk / 260) * 100}%` }} className="h-full rounded-full bg-bear" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-black/25 p-3">
              <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-bull">weaknesses</div>
              {b.weak.map((w) => (
                <div key={w} className="mb-1.5 flex items-center gap-2 text-[12px] font-bold text-ink-200">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-bull/20 text-bull"><Icon name="check" size={11} strokeWidth={4} /></span>{w}
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-black/25 p-3">
              <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-bear">moveset</div>
              {b.moves.map((m) => (
                <div key={m.n} className="mb-2 flex items-start gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${b.c}22`, color: b.c }}><Icon name={m.i} size={14} /></span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11.5px] font-extrabold text-white">{m.n}<span className="font-mono text-[9px] text-bear">{m.pow}pow</span></div>
                    <div className="truncate text-[10px] text-ink-400">{m.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-black/25 p-3">
              <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-gold">loot table</div>
              {b.loot.map((l) => {
                const L = ART[l.a];
                return (
                  <div key={l.t} className="mb-1.5 flex items-center gap-2">
                    <L size={26} />
                    <span className="flex-1 truncate text-[11.5px] font-bold text-ink-200">{l.t}</span>
                    <span className="tnum font-mono text-[10px] font-black text-gold">{l.r}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------------- quiz: guess the weakness ---------------- */
function WeaknessQuiz({ b }: { b: Boss }) {
  const pool = ["Stop-loss", "Patience", "Plan", "×100 leverage", "All-in", "FOMO", "DYOR", "Revenge trading", "Wide stops", "Small size", "Audits", "Hype"];
  const [opts] = useState(() => {
    const wrong = pool.filter((p) => !b.weak.includes(p)).sort(() => 0.5 - Math.random()).slice(0, 3);
    return [...b.weak.slice(0, 1), ...wrong].sort(() => 0.5 - Math.random());
  });
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const answer = b.weak[0];
  return (
    <div className="space-y-2.5" key={b.id}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-extrabold text-white">What beats {b.n}?</span>
        <span className="font-mono text-[11px] font-black text-gold">score {score}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {opts.map((o) => {
          const right = o === answer;
          const sel = pick === o;
          return (
            <motion.button
              key={o}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (pick) return;
                setPick(o);
                if (right) {
                  setScore((s) => s + 1);
                  sfx("correct");
                } else sfx("wrong");
              }}
              animate={pick && sel && !right ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              className="rounded-xl border-2 px-2 py-3 text-[12px] font-bold"
              style={{
                borderColor: pick ? (right ? "#2be08a" : sel ? "#ff4d6a" : "#22355e") : "#22355e",
                background: pick && right ? "rgba(43,224,138,.12)" : pick && sel ? "rgba(255,77,106,.12)" : "#101a33",
                color: pick && right ? "#2be08a" : pick && sel ? "#ff4d6a" : "#dbe5ff",
                boxShadow: "0 3px 0 #0a1328",
              }}
            >
              {o}
            </motion.button>
          );
        })}
      </div>
      {pick && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-xl p-2.5 text-[11.5px] font-bold", pick === answer ? "bg-[#0f3326] text-bull" : "bg-[#3a0f1c] text-bear")}>
          {pick === answer ? `Correct — ${answer} counters ${b.n}.` : `Nope — the answer was ${answer}.`}
          <button type="button" onClick={() => setPick(null)} className="ml-2 font-mono text-[9px] uppercase underline">retry</button>
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- auto-battle sim ---------------- */
function BattleSim({ b }: { b: Boss }) {
  const [player, setPlayer] = useState(1000);
  const [boss, setBoss] = useState(b.hp);
  const [round, setRound] = useState(0);
  const [run, setRun] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [conf, setConf] = useState(0);
  useEffect(() => {
    setBoss(b.hp);
    setPlayer(1000);
    setRound(0);
    setRun(false);
    setLog([]);
  }, [b]);
  useEffect(() => {
    if (!run) return;
    if (player <= 0 || boss <= 0) {
      setRun(false);
      if (boss <= 0) {
        setConf((c) => c + 1);
        sfx("levelup");
        setLog((l) => ["🏆 SIMULATION: boss defeated!", ...l]);
      } else {
        sfx("lose");
        setLog((l) => ["💀 SIMULATION: you got rekt", ...l]);
      }
      return;
    }
    const id = setTimeout(() => {
      const pd = 90 + Math.random() * 160;
      const bd = (b.atk * 0.5 + Math.random() * b.atk * 0.5) / 4;
      setBoss((x) => Math.max(0, x - pd));
      setPlayer((x) => Math.max(0, x - bd));
      setRound((r) => r + 1);
      setLog((l) => [`R${round + 1} · you deal ${Math.round(pd)} · take ${Math.round(bd)}`, ...l].slice(0, 4));
      sfx("hit", false);
    }, 700);
    return () => clearTimeout(id);
  }, [run, player, boss, b, round]);
  const mood: Mood = boss <= 0 ? "celebrate" : player <= 0 ? "sad" : run ? "shock" : "idle";
  return (
    <div className="relative space-y-3 rounded-3xl border-2 border-[#1c2c52] bg-[#0d1528] p-4">
      <Confetti fire={conf} count={80} />
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col items-center">
          <Mascot mood={mood} size={90} track={false} />
          <span className="font-mono text-[9px] font-black uppercase text-bull">you · {Math.round(player)} hp</span>
          <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-black/40">
            <motion.div animate={{ width: `${player / 10}%` }} className="h-full rounded-full bg-bull" />
          </div>
        </div>
        <div className="pb-6 font-[family-name:var(--font-display)] text-[22px] font-bold text-gold">VS</div>
        <div className="flex flex-col items-center">
          {(() => {
            const A = ART[b.art];
            return (
              <motion.div animate={run ? { scale: [1, 1.08, 1], rotate: [0, -4, 4, 0] } : {}} transition={{ duration: 0.7, repeat: run ? Infinity : 0 }}>
                <A size={80} />
              </motion.div>
            );
          })()}
          <span className="font-mono text-[9px] font-black uppercase" style={{ color: b.c }}>{b.n} · {Math.round(boss)}</span>
          <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-black/40">
            <motion.div animate={{ width: `${(boss / b.hp) * 100}%` }} className="h-full rounded-full" style={{ background: b.c }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <GameButton size="md" tone={run ? "ghost" : "bear"} disabled={run || player <= 0 || boss <= 0} onClick={() => { setRun(true); sfx("go"); }}>
          {round === 0 ? "Simulate fight" : "Resume"}
        </GameButton>
        <GameButton
          size="md"
          tone="ghost"
          onClick={() => {
            setRun(false);
            setBoss(b.hp);
            setPlayer(1000);
            setRound(0);
            setLog([]);
            sfx("select");
          }}
        >
          Reset
        </GameButton>
      </div>
      <div className="min-h-[76px] space-y-0.5 rounded-2xl bg-black/30 p-2.5 font-mono text-[9.5px]">
        {log.length === 0 && <span className="text-ink-500">press simulate — 700ms rounds, paper stats</span>}
        {log.map((l, i) => (
          <motion.div key={l + i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1 - i * 0.2, x: 0 }} className="text-ink-200">{l}</motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- drop-rate lab ---------------- */
function DropLab({ b }: { b: Boss }) {
  const [rolls, setRolls] = useState<{ a: ArtKey; t: string }[]>([]);
  const [spinning, setSpinning] = useState(false);
  const roll = () => {
    if (spinning) return;
    setSpinning(true);
    sfx("whoosh");
    const got: { a: ArtKey; t: string }[] = [];
    b.loot.forEach((l) => {
      if (Math.random() * 100 < l.r) got.push({ a: l.a, t: l.t });
    });
    setTimeout(() => {
      setRolls(got.length ? got : [{ a: "coin", t: "Consolation: 10 coins" }]);
      setSpinning(false);
      sfx(got.length ? "chest" : "pop");
    }, 800);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-extrabold text-white">Simulate {b.n} kill</span>
        <GameButton size="md" tone="gold" onClick={roll} className="!w-[130px]">{spinning ? "Rolling…" : "Roll loot"}</GameButton>
      </div>
      <div className="grid min-h-[110px] grid-cols-3 gap-2">
        <AnimatePresence>
          {spinning && (
            <motion.div key="spin" className="col-span-3 grid place-items-center py-6" exit={{ opacity: 0 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}>
                <Icon name="refresh" size={30} className="text-gold" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {!spinning &&
          rolls.map((r, i) => {
            const A = ART[r.a];
            return (
              <motion.div key={r.t + i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: i * 0.1 }} className="flex flex-col items-center rounded-2xl border-2 border-gold/40 bg-[#171106] p-2">
                <A size={44} />
                <span className="mt-1 text-center text-[10px] font-bold leading-tight text-white">{r.t}</span>
              </motion.div>
            );
          })}
        {!spinning && rolls.length === 0 && (
          <div className="col-span-3 grid place-items-center rounded-2xl border-2 border-dashed border-[#26396a] py-6 font-mono text-[10px] uppercase tracking-widest text-ink-500">
            no rolls yet
          </div>
        )}
      </div>
      <div className="font-mono text-[9px] text-ink-500">true probability rolls · pity not modeled · paper loot</div>
    </div>
  );
}

export default function BossCodex() {
  const [sel, setSel] = useState(1);
  const b = BOSSES[sel];
  const cleared = BOSSES.filter((x) => x.cleared).length;
  return (
    <Section id="codex" index="" title="Boss Codex" kicker="Bestiary · lab · sim" count="6 bosses">
      <Grid>
        <Cell title="Bestiary" spec={`${cleared}/6 cleared`} span="col-span-2 md:col-span-4 lg:col-span-6">
          <Codex sel={sel} setSel={setSel} />
        </Cell>
        <Cell title="Dossier" spec="lore · stats · loot" span="col-span-2 md:col-span-4 lg:col-span-4">
          <div className="relative">
            <Rays color={`${b.c}22`} size="130%" className="top-[30%]" />
            <Dossier b={b} />
          </div>
        </Cell>
        <Cell title="Battle Simulator" spec="700ms rounds" span="col-span-2 md:col-span-4 lg:col-span-2">
          <BattleSim b={b} />
        </Cell>
        <Cell title="Weakness Quiz" spec="counter-play" span="col-span-2 md:col-span-2 lg:col-span-3">
          <WeaknessQuiz b={b} />
        </Cell>
        <Cell title="Loot Drop Lab" spec="true RNG" span="col-span-2 md:col-span-2 lg:col-span-3">
          <DropLab b={b} />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="bear">teach through enemies</Tag>
        <Tag tone="gold">transparent odds</Tag>
        <Tag tone="accent">counter-play first</Tag>
      </div>
    </Section>
  );
}
