import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton, HudPill } from "./Device";
import { ART, type ArtKey, GemArt, CoinArt, TrophyArt, ShieldArt, FlameArt, CrownArt } from "./art";
import { sfx, Confetti, Rays, Pop } from "./Juice";
import { Avatar } from "./Social";

/* ================================================================== */
/*  GUILDS & RAIDS — cooperative endgame                                */
/*  guild hall · member roster · live chat sim · donation pool ·        */
/*  raid boss battle (phases, enrage, loot) · guild wars ladder         */
/* ================================================================== */

/* ---------------- data ---------------- */
type Member = { n: string; c: string; role: "GM" | "Officer" | "Raider" | "Recruit"; xp: number; on: boolean; pow: number };
const MEMBERS: Member[] = [
  { n: "You", c: "#2be08a", role: "Raider", xp: 1840, on: true, pow: 94 },
  { n: "Kira_V", c: "#9b6bff", role: "GM", xp: 3120, on: true, pow: 99 },
  { n: "0xNomad", c: "#38e1ff", role: "Officer", xp: 2740, on: true, pow: 96 },
  { n: "Delta_One", c: "#ffc24b", role: "Officer", xp: 2510, on: false, pow: 93 },
  { n: "Mika.eth", c: "#5fe6ff", role: "Raider", xp: 1980, on: true, pow: 88 },
  { n: "Satoshi_Jr", c: "#ff4d6a", role: "Raider", xp: 1720, on: false, pow: 85 },
  { n: "GreenCandle", c: "#a8e05f", role: "Recruit", xp: 940, on: true, pow: 72 },
  { n: "Wen_Lambo", c: "#ff9471", role: "Recruit", xp: 610, on: false, pow: 64 },
];

type ChatMsg = { id: number; who: string; c: string; t: string; sys?: boolean };
const CHAT_SCRIPT: Omit<ChatMsg, "id">[] = [
  { who: "Kira_V", c: "#9b6bff", t: "Raid in 10 min — check your flasks 🧪" },
  { who: "0xNomad", c: "#38e1ff", t: "I'll tank phase 1, Mika takes adds" },
  { who: "Mika.eth", c: "#5fe6ff", t: "on it o7" },
  { who: "SYSTEM", c: "#5f6f96", t: "GreenCandle donated 500 coins to the vault", sys: true },
  { who: "You", c: "#2be08a", t: "ready, stop-loss set tight" },
  { who: "Kira_V", c: "#9b6bff", t: "Remember: dodge the red wick at 30%!" },
  { who: "Delta_One", c: "#ffc24b", t: "running late, start without me 😅" },
  { who: "SYSTEM", c: "#5f6f96", t: "Guild vault reached 10,000 — perk unlocked: +5% XP", sys: true },
  { who: "Satoshi_Jr", c: "#ff4d6a", t: "just hit Diamond, let's gooo" },
  { who: "0xNomad", c: "#38e1ff", t: "nice! screenshot or it didn't happen 📸" },
];

/* ---------------- guild hall header ---------------- */
function GuildHall() {
  const [level] = useState(12);
  const [xp] = useState(74);
  const perks = [
    { i: "bolt" as IconName, t: "+5% XP", on: true },
    { i: "gem" as IconName, t: "+10% gems", on: true },
    { i: "heart" as IconName, t: "+1 heart", on: true },
    { i: "crown" as IconName, t: "Raid slots ×30", on: false },
    { i: "shield" as IconName, t: "Vault shield", on: false },
  ];
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-3xl p-5" style={{ background: "linear-gradient(140deg,#3a2a0e 0%,#1a1408 45%,#0a1226 100%)", boxShadow: "inset 0 0 0 2px #ffc24b44, 0 6px 0 #070d1c" }}>
        <Rays color="rgba(255,194,75,.14)" size="180%" className="left-[70%] top-[50%]" />
        <div className="relative flex items-center gap-4">
          <motion.div whileHover={{ rotate: -8, scale: 1.08 }} className="relative grid h-[76px] w-[76px] place-items-center rounded-2xl" style={{ background: "conic-gradient(from 200deg,#ffe08a,#c7801a,#ffe08a)", boxShadow: "0 5px 0 #7a4b08, inset 0 2px 0 rgba(255,255,255,.5)" }}>
            <span className="font-[family-name:var(--font-display)] text-[30px] font-bold text-[#2a1a02]">₿</span>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-display)] text-[22px] font-bold text-white">Bull Riders</span>
              <Tag tone="gold">rank #47</Tag>
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-ink-400">28/30 members · Diamond bracket · EU-West</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/40" style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,.6)" }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${xp}%` }} viewport={{ once: true }} transition={{ duration: 1.2 }} className="relative h-full rounded-full" style={{ background: "linear-gradient(90deg,#c7801a,#ffc24b)" }}>
                  <span className="absolute inset-x-2 top-[2px] h-1 rounded-full bg-white/40" />
                </motion.div>
              </div>
              <span className="font-mono text-[10px] font-black text-gold">Lv.{level}</span>
            </div>
          </div>
        </div>
        <div className="relative mt-4 grid grid-cols-5 gap-1.5">
          {perks.map((p) => (
            <div key={p.t} className={cn("flex flex-col items-center rounded-xl border-2 py-2", p.on ? "border-gold/60 bg-gold/10" : "border-[#22355e] bg-black/20 opacity-50")}>
              <Icon name={p.i} size={16} className={p.on ? "text-gold" : "text-ink-500"} />
              <span className="mt-1 font-mono text-[7.5px] font-black uppercase tracking-wider text-ink-300">{p.t}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { l: "Trophies", v: "12.4k", c: "#ffc24b" },
          { l: "Raids cleared", v: "87", c: "#2be08a" },
          { l: "Win rate", v: "68%", c: "#38e1ff" },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-2.5 text-center" style={{ boxShadow: "0 3px 0 #070d1c" }}>
            <div className="tnum font-mono text-[17px] font-black" style={{ color: s.c }}>{s.v}</div>
            <div className="font-mono text-[7.5px] uppercase tracking-widest text-ink-500">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- roster ---------------- */
function Roster() {
  const [sort, setSort] = useState<"pow" | "xp">("pow");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const rows = [...MEMBERS].filter((m) => !onlineOnly || m.on).sort((a, b) => b[sort] - a[sort]);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setSort(sort === "pow" ? "xp" : "pow")} className="flex items-center gap-1 rounded-lg border-2 border-[#22355e] bg-[#101a33] px-2.5 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest text-ink-300" style={{ boxShadow: "0 3px 0 #0a1328" }}>
          <Icon name="sort" size={12} /> {sort === "pow" ? "power" : "xp"}
        </button>
        <button type="button" onClick={() => setOnlineOnly(!onlineOnly)} className={cn("flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 font-mono text-[9px] font-black uppercase tracking-widest", onlineOnly ? "border-bull text-bull" : "border-[#22355e] text-ink-400")} style={{ background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}>
          <span className={cn("h-2 w-2 rounded-full", onlineOnly ? "bg-bull" : "bg-[#3d4d73]")} /> online
        </button>
        <span className="ml-auto font-mono text-[9px] text-ink-500">{rows.length} shown</span>
      </div>
      <div className="max-h-[330px] space-y-1.5 overflow-y-auto pr-1">
        {rows.map((m, i) => (
          <motion.div key={m.n} layout initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className={cn("flex items-center gap-2.5 rounded-xl border-2 p-2", m.n === "You" ? "border-[var(--accent)]" : "border-transparent")} style={{ background: m.n === "You" ? "color-mix(in srgb, var(--accent) 10%, #0d1528)" : "#0d1528" }}>
            <span className="w-4 text-center font-mono text-[10px] font-black text-ink-500">{i + 1}</span>
            <span className="relative">
              <Avatar name={m.n} color={m.c} size={34} />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0a1022]" style={{ background: m.on ? "#2be08a" : "#4a5c85" }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[12px] font-bold text-white">{m.n}</span>
                <span className={cn("rounded px-1 py-0.5 font-mono text-[7px] font-black uppercase", m.role === "GM" ? "bg-gold/20 text-gold" : m.role === "Officer" ? "bg-violet/20 text-violet" : "bg-white/5 text-ink-400")}>{m.role}</span>
              </div>
              <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-[#0a1122]">
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${m.pow}%` }} viewport={{ once: true }} className="h-full rounded-full" style={{ background: m.c }} />
              </div>
            </div>
            <div className="text-right">
              <div className="tnum font-mono text-[12px] font-black text-white">{m.pow}</div>
              <div className="tnum font-mono text-[8px] text-ink-500">{m.xp} xp</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- live chat ---------------- */
function GuildChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ id: 0, who: "SYSTEM", c: "#5f6f96", t: "Welcome to #raid-planning", sys: true }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const idx = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      const next = CHAT_SCRIPT[idx.current % CHAT_SCRIPT.length];
      idx.current += 1;
      if (!next.sys) {
        setTyping(next.who);
        setTimeout(() => {
          setTyping(null);
          setMsgs((m) => [...m.slice(-24), { ...next, id: Date.now() }]);
          sfx("pop", false);
        }, 900);
      } else {
        setMsgs((m) => [...m.slice(-24), { ...next, id: Date.now() }]);
      }
    }, 3600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m.slice(-24), { id: Date.now(), who: "You", c: "#2be08a", t: draft.trim() }]);
    setDraft("");
    sfx("select");
  };

  return (
    <div className="flex h-[380px] flex-col overflow-hidden rounded-2xl border-2 border-[#1c2c52] bg-[#0a1122]">
      <div className="flex items-center gap-2 border-b-2 border-[#16223f] px-3 py-2">
        <span className="h-2 w-2 animate-pulse rounded-full bg-bull" />
        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-ink-300">#raid-planning</span>
        <span className="ml-auto font-mono text-[9px] text-ink-500">5 online</span>
      </div>
      <div ref={box} className="flex-1 space-y-2 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {msgs.map((m) =>
            m.sys ? (
              <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center font-mono text-[9px] text-ink-500">
                ─ {m.t} ─
              </motion.div>
            ) : (
              <motion.div key={m.id} initial={{ opacity: 0, x: m.who === "You" ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={cn("flex gap-2", m.who === "You" && "flex-row-reverse")}>
                <Avatar name={m.who} color={m.c} size={26} />
                <div className={cn("max-w-[75%] rounded-2xl px-3 py-2", m.who === "You" ? "rounded-tr-sm" : "rounded-tl-sm")} style={{ background: m.who === "You" ? "color-mix(in srgb, var(--accent) 18%, #14203e)" : "#14203e", boxShadow: "0 2px 0 #070d1c" }}>
                  <div className="font-mono text-[8px] font-black" style={{ color: m.c }}>{m.who}</div>
                  <div className="text-[12px] font-semibold leading-snug text-ink-200">{m.t}</div>
                </div>
              </motion.div>
            ),
          )}
          {typing && (
            <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 pl-1 font-mono text-[9px] text-ink-500">
              {typing} is typing
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} className="h-1.5 w-1.5 rounded-full bg-ink-400" />
                ))}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex gap-2 border-t-2 border-[#16223f] p-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message #raid-planning…" className="h-10 flex-1 rounded-xl bg-[#0d1528] px-3 text-[12px] font-semibold text-white outline-none placeholder:text-ink-500" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.6)" }} />
        <button type="button" onClick={send} className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--accent)", color: "var(--accent-ink)", boxShadow: "0 3px 0 var(--accent-edge)" }}>
          <Icon name="arrowUp" size={16} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

/* ---------------- vault / donations ---------------- */
function Vault() {
  const [pool, setPool] = useState(7450);
  const [mine, setMine] = useState(8640);
  const goal = 10000;
  const [fly, setFly] = useState<{ id: number }[]>([]);
  const donate = (amt: number) => {
    if (mine < amt) {
      sfx("wrong");
      return;
    }
    setMine((m) => m - amt);
    setPool((p) => p + amt);
    const id = Date.now();
    setFly((f) => [...f, { id }]);
    setTimeout(() => setFly((f) => f.filter((x) => x.id !== id)), 1100);
    sfx(pool + amt >= goal ? "levelup" : "coin");
  };
  return (
    <div className="relative space-y-3 overflow-hidden rounded-3xl border-2 border-[#1c2c52] bg-[#0d1528] p-4">
      <AnimatePresence>
        {fly.map((f) => (
          <motion.div key={f.id} className="pointer-events-none absolute inset-0 z-20">
            {Array.from({ length: 8 }, (_, k) => (
              <motion.span key={k} className="absolute bottom-16 left-1/2" initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: (Math.random() - 0.5) * 160, y: -140 - Math.random() * 60, opacity: 0 }} transition={{ duration: 1 }}>
                <CoinArt size={18} />
              </motion.span>
            ))}
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex items-center gap-3">
        <ShieldArt size={46} />
        <div className="flex-1">
          <div className="font-[family-name:var(--font-display)] text-[17px] font-bold text-white">Guild Vault</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">
            <Pop value={pool} /> / {goal.toLocaleString()} · next perk: raid slots
          </div>
        </div>
        <HudPill>
          <CoinArt size={18} />
          <Pop value={mine.toLocaleString()} className="text-gold" />
        </HudPill>
      </div>
      <div className="relative h-6 overflow-hidden rounded-full bg-[#0a1122]" style={{ boxShadow: "inset 0 3px 6px rgba(0,0,0,.7)" }}>
        <motion.div animate={{ width: `${Math.min(100, (pool / goal) * 100)}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }} className="relative h-full rounded-full" style={{ background: "linear-gradient(90deg,#c7801a,#ffc24b)", boxShadow: "0 0 16px rgba(255,194,75,.5)" }}>
          <span className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/30" />
        </motion.div>
        <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-black text-white" style={{ textShadow: "0 1px 2px #000" }}>
          {Math.floor((pool / goal) * 100)}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[100, 500, 1000].map((a) => (
          <GameButton key={a} size="md" tone="gold" onClick={() => donate(a)}>
            +{a}
          </GameButton>
        ))}
      </div>
      {pool >= goal && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-xl bg-[#0f3326] p-2.5 text-[12px] font-bold text-bull">
          <CrownArt size={26} /> Vault full — perk unlocked for all members!
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- RAID BOSS ---------------- */
type BossPhase = 1 | 2 | 3;
const BOSS = { name: "Capitulation, Eater of Stops", max: 10000, color: "#ff4d6a" };

function RaidBoss() {
  const [hp, setHp] = useState(BOSS.max);
  const [energy, setEnergy] = useState(60);
  const [log, setLog] = useState<string[]>(["Raid started — Capitulation awakens"]);
  const [conf, setConf] = useState(0);
  const [shake, setShake] = useState(0);
  const [over, setOver] = useState(false);
  const [enrage, setEnrage] = useState(0);
  const [auto, setAuto] = useState(false);
  const phase: BossPhase = hp > BOSS.max * 0.66 ? 1 : hp > BOSS.max * 0.3 ? 2 : 3;

  const push = (s: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-GB")} ${s}`, ...l].slice(0, 5));

  const attack = (kind: "basic" | "special" | "ult") => {
    if (over || hp <= 0) return;
    if (kind !== "basic" && energy < (kind === "special" ? 25 : 60)) {
      sfx("wrong");
      push("not enough energy!");
      return;
    }
    const base = kind === "basic" ? 220 + Math.random() * 160 : kind === "special" ? 640 + Math.random() * 320 : 1500 + Math.random() * 700;
    const crit = Math.random() < 0.18;
    const dmg = Math.round(base * (crit ? 2 : 1) * (phase === 3 ? 1.15 : 1));
    setHp((h) => {
      const n = Math.max(0, h - dmg);
      if (n <= 0 && !over) {
        setOver(true);
        setConf((c) => c + 1);
        sfx("levelup");
        push(`BOSS SLAIN — loot distributed`);
      }
      return n;
    });
    setEnergy((e) => Math.max(0, e - (kind === "basic" ? 0 : kind === "special" ? 25 : 60)) + (kind === "basic" ? 12 : 0));
    setShake((s) => s + 1);
    sfx(kind === "ult" ? "levelup" : crit ? "combo" : "hit");
    push(`${crit ? "CRIT " : ""}${kind.toUpperCase()} hits for ${dmg.toLocaleString()}`);
    // boss retaliation
    setTimeout(() => {
      if (over) return;
      const r = Math.random();
      if (r < 0.3) {
        setEnrage((v) => Math.min(100, v + 18));
        push("boss casts FEAR — enrage rising!");
        sfx("wrong", false);
      }
    }, 350);
  };

  useEffect(() => {
    if (!auto || over) return;
    const id = setInterval(() => setEnergy((e) => Math.min(100, e + 4)), 500);
    const id2 = setInterval(() => attack("basic"), 1400);
    return () => {
      clearInterval(id);
      clearInterval(id2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, over]);

  useEffect(() => {
    const id = setInterval(() => setEnergy((e) => Math.min(100, e + 2)), 900);
    return () => clearInterval(id);
  }, []);

  const pct = (hp / BOSS.max) * 100;
  const phaseColor = phase === 1 ? "#9b6bff" : phase === 2 ? "#ff8a3d" : "#ff4d6a";

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-[#1c2c52] p-4" style={{ background: "radial-gradient(circle at 50% 0%, #3a1030 0%, #0a1226 65%)" }}>
      <Confetti fire={conf} count={200} />
      <div className="relative flex items-center gap-3">
        <motion.div animate={over ? { scale: 0.85, opacity: 0.6, rotate: 8 } : phase === 3 ? { scale: [1, 1.06, 1], rotate: [0, -3, 3, 0] } : { y: [0, -5, 0] }} transition={{ duration: phase === 3 ? 0.7 : 2.4, repeat: over ? 0 : Infinity }}>
          <FlameArt size={64} />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-display)] text-[16px] font-bold text-white">{BOSS.name}</span>
            <Tag tone={phase === 1 ? "violet" : phase === 2 ? "gold" : "bear"}>phase {phase}</Tag>
          </div>
          <div className="mt-1.5 h-5 overflow-hidden rounded-full bg-black/50" style={{ boxShadow: "inset 0 2px 5px rgba(0,0,0,.7)" }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 80, damping: 18 }} className="relative h-full rounded-full" style={{ background: `linear-gradient(90deg, ${phaseColor}, #ff8fa2)`, boxShadow: `0 0 18px ${phaseColor}` }}>
              <span className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/35" />
            </motion.div>
          </div>
          <div className="mt-1 flex justify-between font-mono text-[9px] font-black">
            <span className="tnum" style={{ color: phaseColor }}><Pop value={hp} /> / {BOSS.max.toLocaleString()}</span>
            <span className="text-ink-400">enrage {enrage}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
            <motion.div animate={{ width: `${enrage}%` }} className="h-full rounded-full bg-bear" />
          </div>
        </div>
      </div>

      {/* boss mechanics hints */}
      <div className="relative mt-3 grid grid-cols-3 gap-1.5">
        {[
          { t: "Red Wick Slam", d: phase >= 2, c: "#ff4d6a" },
          { t: "Liquidity Drain", d: phase >= 3, c: "#9b6bff" },
          { t: "Fear Aura", d: enrage > 50, c: "#ffc24b" },
        ].map((m) => (
          <div key={m.t} className="rounded-xl border-2 px-2 py-1.5 text-center" style={{ borderColor: m.d ? m.c : "#22355e", background: m.d ? `${m.c}18` : "#0d1528" }}>
            <div className="font-mono text-[8px] font-black uppercase tracking-wider" style={{ color: m.d ? m.c : "#5f6f96" }}>{m.d ? "● active" : "○ dormant"}</div>
            <div className="text-[10.5px] font-bold text-ink-200">{m.t}</div>
          </div>
        ))}
      </div>

      <div className="relative mt-3 flex items-center gap-2">
        <Icon name="bolt" size={14} className="text-aqua" />
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/40">
          <motion.div animate={{ width: `${energy}%` }} className="h-full rounded-full bg-aqua" style={{ boxShadow: "0 0 10px #38e1ff" }} />
        </div>
        <span className="tnum font-mono text-[10px] font-black text-aqua">{Math.round(energy)}</span>
        <button type="button" onClick={() => setAuto(!auto)} className={cn("rounded-lg border-2 px-2 py-1 font-mono text-[8.5px] font-black uppercase", auto ? "border-bull text-bull" : "border-[#22355e] text-ink-500")}>
          auto {auto ? "on" : "off"}
        </button>
      </div>

      <div className="relative mt-3 grid grid-cols-3 gap-2">
        <GameButton size="md" tone="ghost" onClick={() => attack("basic")}>Strike</GameButton>
        <GameButton size="md" tone="aqua" onClick={() => attack("special")}>Snipe · 25</GameButton>
        <GameButton size="md" tone="bear" onClick={() => attack("ult")}>Nuke · 60</GameButton>
      </div>

      <div className="relative mt-3 space-y-1 rounded-2xl bg-black/30 p-2.5 font-mono text-[9.5px] leading-relaxed">
        {log.map((l, i) => (
          <motion.div key={l + i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1 - i * 0.18, x: 0 }} className={i === 0 ? "text-ink-100" : "text-ink-500"}>{l}</motion.div>
        ))}
      </div>

      <AnimatePresence>
        {over && (
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050914]/88 p-6 text-center backdrop-blur-sm">
            <Rays />
            <TrophyArt size={76} />
            <div className="relative mt-2 font-[family-name:var(--font-display)] text-[26px] font-bold text-gold">Boss defeated!</div>
            <div className="relative mt-1 flex gap-2">
              {[<GemArt key="g" size={30} />, <CoinArt key="c" size={30} />, <CrownArt key="r" size={30} />].map((a, i) => (
                <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.12 }} className="rounded-xl border-2 border-gold/50 bg-black/40 p-2">
                  {a}
                </motion.div>
              ))}
            </div>
            <div className="relative mt-4 w-full max-w-[240px]">
              <GameButton
                tone="gold"
                onClick={() => {
                  setHp(BOSS.max);
                  setOver(false);
                  setEnrage(0);
                  setLog(["Raid reset — Capitulation awakens"]);
                  sfx("whoosh");
                }}
              >
                Raid again
              </GameButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <span className="hidden">{shake}</span>
    </div>
  );
}

/* ---------------- guild wars ladder ---------------- */
const WARS = [
  { n: "Bull Riders", c: "#2be08a", w: 14, l: 3, me: true },
  { n: "Diamond Apes", c: "#9b6bff", w: 13, l: 4 },
  { n: "Stop Hunters", c: "#ff4d6a", w: 12, l: 5 },
  { n: "HODL Gang", c: "#38e1ff", w: 10, l: 7 },
  { n: "Paper Hands", c: "#7d8db4", w: 4, l: 13 },
];

function WarLadder() {
  const [week, setWeek] = useState(0);
  const jitter = (i: number) => ((week * 7 + i * 13) % 3) - 1;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <TrophyArt size={30} />
        <div className="flex-1">
          <div className="font-[family-name:var(--font-display)] text-[15px] font-bold text-white">Guild Wars · Week {12 + week}</div>
          <div className="font-mono text-[8.5px] uppercase tracking-widest text-ink-500">top 2 advance to Diamond clash</div>
        </div>
        <button type="button" onClick={() => { setWeek((w) => w + 1); sfx("whoosh"); }} className="rounded-lg border-2 border-[#22355e] bg-[#101a33] px-2.5 py-1.5 font-mono text-[9px] font-black uppercase text-ink-300" style={{ boxShadow: "0 3px 0 #0a1328" }}>
          sim week →
        </button>
      </div>
      {WARS.map((g, i) => {
        const w = Math.max(0, g.w + jitter(i));
        const wr = Math.round((w / (w + g.l)) * 100);
        return (
          <motion.div layout key={g.n} className="flex items-center gap-2.5 rounded-xl border-2 p-2" style={{ borderColor: g.me ? "var(--accent)" : "#1c2c52", background: g.me ? "color-mix(in srgb, var(--accent) 10%, #0d1528)" : "#0d1528" }}>
            <span className={cn("w-5 text-center font-mono text-[12px] font-black", i === 0 ? "text-gold" : i === 1 ? "text-ink-200" : i === 2 ? "text-[#d08a4b]" : "text-ink-500")}>{i + 1}</span>
            <span className="h-8 w-8 rounded-lg" style={{ background: `linear-gradient(160deg, ${g.c}, color-mix(in srgb, ${g.c} 45%, #000))`, boxShadow: `0 2px 0 color-mix(in srgb, ${g.c} 35%, #000)` }} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-white">{g.n}</div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#0a1122]">
                <motion.div animate={{ width: `${wr}%` }} className="h-full rounded-full" style={{ background: g.c }} />
              </div>
            </div>
            <span className="tnum font-mono text-[10px] font-black text-ink-300">{w}W · {g.l}L</span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- art strip (uses ART registry) ---------------- */
function RelicStrip() {
  const relics: { a: ArtKey; n: string }[] = [
    { a: "shield", n: "Aegis" },
    { a: "key", n: "Vault Key" },
    { a: "trophy", n: "War Cup" },
    { a: "gem", n: "Core" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {relics.map((r) => {
        const A = ART[r.a];
        return (
          <motion.button key={r.n} type="button" whileHover={{ y: -4, scale: 1.05 }} whileTap={{ scale: 0.92 }} onClick={() => sfx("unlock")} className="flex flex-col items-center rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] py-3" style={{ boxShadow: "0 3px 0 #070d1c" }}>
            <A size={40} />
            <span className="mt-1 font-mono text-[8px] font-black uppercase tracking-wider text-ink-400">{r.n}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function Guilds() {
  return (
    <Section id="guilds" index="" title="Guilds & Raids" kicker="Co-op endgame · social retention" count="6 systems">
      <Grid>
        <Cell title="Guild Hall" spec="perks · level" span="col-span-2 md:col-span-2 lg:col-span-3">
          <GuildHall />
        </Cell>
        <Cell title="Raid Boss · Capitulation" spec="3 phases · enrage" span="col-span-2 md:col-span-2 lg:col-span-3">
          <RaidBoss />
        </Cell>
        <Cell title="Roster" spec="sortable · presence" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Roster />
        </Cell>
        <Cell title="Guild Chat" spec="live sim · typing" span="col-span-2 md:col-span-2 lg:col-span-2">
          <GuildChat />
        </Cell>
        <Cell title="Vault" spec="donations · perks" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Vault />
        </Cell>
        <Cell title="Guild Wars Ladder" spec="weekly sim" span="col-span-2 md:col-span-2 lg:col-span-2">
          <WarLadder />
        </Cell>
        <Cell title="Relics" spec="tap to inspect" span="col-span-2 md:col-span-4 lg:col-span-2">
          <RelicStrip />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="gold">co-op sinks</Tag>
        <Tag tone="accent">phase-based boss</Tag>
        <Tag tone="violet">presence + chat</Tag>
        <Tag tone="bear">enrage timer</Tag>
      </div>
    </Section>
  );
}
