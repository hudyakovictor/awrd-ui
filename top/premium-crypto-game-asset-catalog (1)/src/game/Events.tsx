import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton } from "./Device";
import { ART, type ArtKey, GemArt, TrophyArt, TicketArt, RocketArt, FlameArt } from "./art";
import { sfx, Confetti, Rays, Pop, fmtClock } from "./Juice";
import { Avatar } from "./Social";

/* ================================================================== */
/*  LIVE EVENTS & TOURNAMENTS                                           */
/*  event calendar · featured tournament · bracket · live prediction    */
/*  mini-leaderboard · news ticker                                      */
/* ================================================================== */

type Ev = { d: number; t: string; a: ArtKey; c: string; live?: boolean; ends?: number };
const MONTH = "SEPTEMBER 2026";
const EVENTS: Ev[] = [
  { d: 3, t: "Paper Trading Cup", a: "trophy", c: "#ffc24b" },
  { d: 7, t: "Whale Watch Party", a: "ticket", c: "#38e1ff" },
  { d: 12, t: "Bear Market Survival", a: "shield", c: "#ff4d6a", live: true, ends: 2 * 3600 + 14 * 60 },
  { d: 18, t: "Altcoin Sprint", a: "rocket", c: "#9b6bff" },
  { d: 21, t: "Diamond Hands Day", a: "gem", c: "#2be08a" },
  { d: 26, t: "Halving Grand Final", a: "crown", c: "#ffc24b" },
  { d: 28, t: "Community AMA", a: "star", c: "#38e1ff" },
];

function Calendar() {
  const [sel, setSel] = useState<number>(12);
  const [t, setT] = useState(2 * 3600 + 14 * 60 + 9);
  useEffect(() => {
    const id = setInterval(() => setT((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const ev = EVENTS.find((e) => e.d === sel);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-ink-400">{MONTH}</span>
        <span className="flex items-center gap-1 font-mono text-[10px] font-black text-bear"><span className="h-2 w-2 animate-pulse rounded-full bg-bear" /> 1 live now</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-center font-mono text-[8px] font-black text-ink-500">{d}</span>
        ))}
        <span />
        {days.map((d) => {
          const e = EVENTS.find((x) => x.d === d);
          const isSel = sel === d;
          return (
            <motion.button
              key={d}
              type="button"
              whileTap={e ? { scale: 0.88 } : undefined}
              onClick={() => {
                if (!e) return;
                setSel(d);
                sfx("select");
              }}
              className={cn("relative grid aspect-square place-items-center rounded-lg font-mono text-[10px] font-black transition-colors", isSel ? "" : e ? "bg-[#14203e] text-white hover:bg-[#1a2a52]" : "text-[#3d4d73]")}
              style={isSel && e ? { background: e.c, color: "#0a1226", boxShadow: `0 3px 0 color-mix(in srgb, ${e.c} 45%, #000), 0 0 16px ${e.c}66` } : e ? { boxShadow: "0 2px 0 #070d1c" } : undefined}
            >
              {d}
              {e?.live && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-[#0a1022] bg-bear" />}
              {e && !e.live && <span className="absolute bottom-1 h-1 w-1 rounded-full" style={{ background: isSel ? "#0a1226" : e.c }} />}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {ev && (
          <motion.div key={ev.d} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-3 rounded-2xl border-2 p-3" style={{ borderColor: `${ev.c}55`, background: `linear-gradient(100deg, ${ev.c}1a, #0d1528 70%)` }}>
            {(() => {
              const A = ART[ev.a];
              return <A size={44} />;
            })()}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-extrabold text-white">{ev.t}</span>
                {ev.live && <Tag tone="bear">live</Tag>}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Sep {ev.d} · 18:00 UTC · 4,218 joined</div>
              {ev.live && <div className="tnum mt-0.5 font-mono text-[11px] font-black" style={{ color: ev.c }}>ends in {fmtClock(t)}</div>}
            </div>
            <div className="w-[92px]">
              <GameButton size="md" tone={ev.live ? "bear" : "ghost"} onClick={() => sfx(ev.live ? "go" : "select")}>{ev.live ? "Join" : "RSVP"}</GameButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- tournament bracket ---------------- */
type Team = { n: string; c: string; s: number };
const SEMIS: [Team, Team][] = [
  [{ n: "Bull Riders", c: "#2be08a", s: 3 }, { n: "Stop Hunters", c: "#ff4d6a", s: 1 }],
  [{ n: "Diamond Apes", c: "#9b6bff", s: 2 }, { n: "HODL Gang", c: "#38e1ff", s: 3 }],
];
const FINAL: [Team, Team] = [
  { n: "Bull Riders", c: "#2be08a", s: 0 },
  { n: "HODL Gang", c: "#38e1ff", s: 0 },
];

function Bracket() {
  const [f, setF] = useState<[number, number]>([1, 1]);
  const [conf, setConf] = useState(0);
  const [champ, setChamp] = useState<string | null>(null);
  const score = (i: number) => {
    if (champ) return;
    const n: [number, number] = [...f] as [number, number];
    n[i] += 1;
    setF(n);
    sfx("coin");
    if (n[i] >= 3) {
      setChamp(FINAL[i].n);
      setConf((c) => c + 1);
      sfx("levelup");
    }
  };
  const Match = ({ a, b, live, onA, onB }: { a: Team; b: Team; live?: boolean; onA?: () => void; onB?: () => void }) => (
    <div className={cn("overflow-hidden rounded-2xl border-2", live ? "border-gold" : "border-[#1c2c52]")} style={{ background: "#0d1528", boxShadow: live ? "0 0 24px -8px #ffc24b" : "0 3px 0 #070d1c" }}>
      {[a, b].map((t, i) => {
        const win = t.s > (i === 0 ? b.s : a.s);
        return (
          <button key={t.n} type="button" onClick={i === 0 ? onA : onB} disabled={!live} className={cn("flex w-full items-center gap-2 px-2.5 py-2", i === 0 && "border-b border-[#1c2c52]", live && "transition-colors hover:bg-white/5")}>
            <span className="h-5 w-5 rounded-md" style={{ background: t.c }} />
            <span className={cn("flex-1 truncate text-left text-[11.5px] font-bold", win ? "text-white" : "text-ink-400")}>{t.n}</span>
            {win && !live && <Icon name="check" size={12} strokeWidth={4} className="text-bull" />}
            <span className={cn("tnum grid h-6 w-6 place-items-center rounded-md font-mono text-[11px] font-black", win ? "bg-white/10 text-white" : "text-ink-500")}>{t.s}</span>
          </button>
        );
      })}
      {live && <div className="bg-gold/15 py-1 text-center font-mono text-[8px] font-black uppercase tracking-[0.2em] text-gold">final · first to 3 · tap a team</div>}
    </div>
  );
  return (
    <div className="relative space-y-3">
      <Confetti fire={conf} />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="space-y-2">
          <div className="text-center font-mono text-[8px] font-black uppercase tracking-[0.2em] text-ink-500">semis</div>
          {SEMIS.map(([a, b], i) => (
            <Match key={i} a={a} b={b} />
          ))}
        </div>
        <div className="flex flex-col items-center gap-1 text-ink-500">
          <Icon name="chevronRight" size={18} />
          <TrophyArt size={34} />
          <Icon name="chevronLeft" size={18} />
        </div>
        <div>
          <div className="mb-2 text-center font-mono text-[8px] font-black uppercase tracking-[0.2em] text-gold">grand final</div>
          <Match a={{ ...FINAL[0], s: f[0] }} b={{ ...FINAL[1], s: f[1] }} live onA={() => score(0)} onB={() => score(1)} />
        </div>
      </div>
      <AnimatePresence>
        {champ && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-2xl p-3 text-center" style={{ background: "linear-gradient(120deg,#3a2a0e,#0b1224)" }}>
            <Rays color="rgba(255,194,75,.2)" />
            <div className="relative font-mono text-[9px] font-black uppercase tracking-[0.25em] text-gold">champions</div>
            <div className="relative font-[family-name:var(--font-display)] text-[20px] font-bold text-white">{champ}</div>
            <button type="button" onClick={() => { setF([1, 1]); setChamp(null); }} className="relative mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-400 hover:text-white">reset final</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- live prediction market ---------------- */
function LivePrediction() {
  const [pool, setPool] = useState({ up: 6420, down: 4180 });
  const [mine, setMine] = useState<"up" | "down" | null>(null);
  const [amt, setAmt] = useState(100);
  const [t, setT] = useState(94);
  const [settled, setSettled] = useState<"up" | "down" | null>(null);
  useEffect(() => {
    if (t <= 0) {
      if (!settled) {
        const w = Math.random() > 0.45 ? "up" : "down";
        setSettled(w);
        sfx(mine === w ? "levelup" : "lose");
      }
      return;
    }
    const id = setTimeout(() => {
      setT((v) => v - 1);
      setPool((p) => ({ up: p.up + Math.floor(Math.random() * 40), down: p.down + Math.floor(Math.random() * 40) }));
    }, 1000);
    return () => clearTimeout(id);
  }, [t, settled, mine]);
  const total = pool.up + pool.down;
  const upPct = Math.round((pool.up / total) * 100);
  const bet = (side: "up" | "down") => {
    if (mine || t <= 0) return;
    setMine(side);
    setPool((p) => ({ ...p, [side]: p[side] + amt }));
    sfx("coin");
  };
  const reset = () => {
    setPool({ up: 6420, down: 4180 });
    setMine(null);
    setT(94);
    setSettled(null);
  };
  return (
    <div className="space-y-3 rounded-3xl border-2 border-[#1c2c52] bg-[#0d1528] p-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-bear/15 px-2 py-1 font-mono text-[9px] font-black uppercase text-bear"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bear" /> live</span>
        <span className="text-[12px] font-extrabold text-white">BTC closes above $68,500?</span>
        <span className={cn("ml-auto tnum font-mono text-[13px] font-black", t < 15 ? "text-bear" : "text-ink-200")}>{fmtClock(t)}</span>
      </div>
      <div className="relative h-8 overflow-hidden rounded-full bg-[#0a1122]" style={{ boxShadow: "inset 0 3px 6px rgba(0,0,0,.7)" }}>
        <motion.div animate={{ width: `${upPct}%` }} className="absolute inset-y-0 left-0 bg-bull" />
        <motion.div animate={{ width: `${100 - upPct}%` }} className="absolute inset-y-0 right-0 bg-bear" />
        <div className="absolute inset-0 flex items-center justify-between px-3 font-mono text-[11px] font-black text-white" style={{ textShadow: "0 1px 3px #000" }}>
          <span>YES {upPct}%</span>
          <span>{100 - upPct}% NO</span>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {settled ? (
          <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-2xl p-3 text-center", mine === settled ? "bg-[#0f3326]" : "bg-[#3a0f1c]")}>
            <div className={cn("font-[family-name:var(--font-display)] text-[18px] font-bold", mine === settled ? "text-bull" : "text-bear")}>
              {mine === settled ? `You won ${Math.round(amt * (total / (settled === "up" ? pool.up : pool.down)))} coins!` : mine ? "Wrong side — better luck next round" : `Settled: ${settled.toUpperCase()}`}
            </div>
            <button type="button" onClick={reset} className="mt-2 rounded-xl border-2 border-[#22355e] bg-[#101a33] px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-ink-200">next round</button>
          </motion.div>
        ) : (
          <motion.div key="b" exit={{ opacity: 0 }}>
            <div className="mb-2 flex items-center gap-2">
              {[50, 100, 250, 500].map((a) => (
                <button key={a} type="button" onClick={() => { setAmt(a); sfx("select"); }} className={cn("flex-1 rounded-lg border-2 py-1.5 font-mono text-[10px] font-black", amt === a ? "border-[var(--accent)] text-[var(--accent)]" : "border-[#22355e] text-ink-400")}>{a}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <GameButton size="md" tone="bull" onClick={() => bet("up")}>{mine === "up" ? `YES · ${amt} ✓` : "Bet YES"}</GameButton>
              <GameButton size="md" tone="bear" onClick={() => bet("down")}>{mine === "down" ? `NO · ${amt} ✓` : "Bet NO"}</GameButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- event leaderboard ---------------- */
const LB = [
  { n: "Kira_V", c: "#9b6bff", s: 9840 },
  { n: "0xNomad", c: "#38e1ff", s: 9210 },
  { n: "You", c: "#2be08a", s: 8870, me: true },
  { n: "Delta_One", c: "#ffc24b", s: 8310 },
  { n: "Mika.eth", c: "#5fe6ff", s: 7990 },
  { n: "Satoshi_Jr", c: "#ff4d6a", s: 7640 },
];
function EventLB() {
  const [tick, setTick] = useState(0);
  const rows = LB.map((r, i) => ({ ...r, s: r.s + ((tick * (i + 3) * 37) % 400) })).sort((a, b) => b.s - a.s);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <FlameArt size={26} />
        <span className="font-[family-name:var(--font-display)] text-[15px] font-bold text-white">Bear Survival · Live</span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-widest text-ink-500">updates 2.2s</span>
      </div>
      {rows.map((r, i) => (
        <motion.div layout key={r.n} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="flex items-center gap-2.5 rounded-xl border-2 p-2" style={{ borderColor: r.me ? "var(--accent)" : "transparent", background: r.me ? "color-mix(in srgb, var(--accent) 10%, #0d1528)" : "#0d1528" }}>
          <span className={cn("w-5 text-center font-mono text-[12px] font-black", i === 0 ? "text-gold" : i === 1 ? "text-ink-200" : i === 2 ? "text-[#d08a4b]" : "text-ink-500")}>{i + 1}</span>
          <Avatar name={r.n} color={r.c} size={30} />
          <span className="flex-1 truncate text-[12px] font-bold text-ink-200">{r.n}</span>
          <Pop value={r.s.toLocaleString()} className="tnum font-mono text-[12px] font-black text-white" />
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------- news ticker cards ---------------- */
const NEWS: { i: IconName; t: string; s: string; c: string }[] = [
  { i: "trophy", t: "Paper Cup finals this Sunday", s: "Top 8 · 5,000 gem pool", c: "#ffc24b" },
  { i: "sparkles", t: "New season: Halving Hype", s: "Battle pass refreshed", c: "#9b6bff" },
  { i: "bolt", t: "Double XP weekend", s: "Sat–Sun · all lessons", c: "#2be08a" },
  { i: "alert", t: "Maintenance 02:00 UTC", s: "~20 min downtime", c: "#ff4d6a" },
];
function News() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {NEWS.map((n, i) => (
        <motion.button key={n.t} type="button" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -3 }} onClick={() => sfx("select")} className="rounded-2xl border-2 border-[#1c2c52] bg-[#0d1528] p-3 text-left" style={{ boxShadow: "0 3px 0 #070d1c" }}>
          <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${n.c}22`, color: n.c }}>
            <Icon name={n.i} size={17} strokeWidth={2.4} />
          </span>
          <div className="mt-2 text-[12px] font-extrabold leading-tight text-white">{n.t}</div>
          <div className="mt-0.5 font-mono text-[9px] text-ink-400">{n.s}</div>
        </motion.button>
      ))}
    </div>
  );
}

/* ---------------- prize showcase ---------------- */
function Prizes() {
  const p: { a: ArtKey; t: string; s: string }[] = [
    { a: "crown", t: "Champion frame", s: "1st place" },
    { a: "chest", t: "Epic chest ×3", s: "top 10" },
    { a: "gem", t: "500 gems", s: "top 100" },
    { a: "coin", t: "1,000 coins", s: "all finishers" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2">
      {p.map((x, i) => {
        const A = ART[x.a];
        return (
          <motion.div key={x.t} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: "spring", stiffness: 260, damping: 16 }} className="flex flex-col items-center rounded-2xl border-2 border-gold/40 bg-[#171106] p-2.5 text-center">
            <A size={44} />
            <div className="mt-1 text-[10.5px] font-extrabold leading-tight text-white">{x.t}</div>
            <div className="font-mono text-[8px] uppercase tracking-widest text-gold">{x.s}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------- countdown hero ---------------- */
function CountdownHero() {
  const [t, setT] = useState(3 * 86400 + 7 * 3600 + 22 * 60);
  useEffect(() => {
    const id = setInterval(() => setT((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const d = Math.floor(t / 86400);
  const h = Math.floor((t % 86400) / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const cells = [[d, "days"], [h, "hrs"], [m, "min"], [s, "sec"]] as const;
  return (
    <div className="relative overflow-hidden rounded-3xl p-5 text-center" style={{ background: "linear-gradient(150deg,#2a1d56,#0a1226 70%)", boxShadow: "inset 0 0 0 2px #9b6bff44" }}>
      <Rays color="rgba(155,107,255,.2)" />
      <div className="relative mx-auto w-fit"><RocketArt size={58} /></div>
      <div className="relative mt-1 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-violet">halving grand final</div>
      <div className="relative mt-3 flex justify-center gap-2">
        {cells.map(([v, l]) => (
          <div key={l} className="w-[64px] rounded-2xl border-2 border-[#4a3a8a] bg-[#120c2e] py-2" style={{ boxShadow: "0 4px 0 #0d0a24" }}>
            <Pop value={String(v).padStart(2, "0")} className="tnum font-mono text-[22px] font-black text-white" />
            <div className="font-mono text-[8px] uppercase tracking-widest text-ink-400">{l}</div>
          </div>
        ))}
      </div>
      <div className="relative mx-auto mt-4 flex max-w-[280px] items-center gap-2">
        <div className="w-[130px] shrink-0"><TicketArt size={44} /></div>
        <div className="flex-1"><GameButton tone="violet" size="md" onClick={() => sfx("unlock")}>Get ticket</GameButton></div>
        <div className="flex items-center gap-1 font-mono text-[11px] font-black text-gold"><GemArt size={14} /> 50</div>
      </div>
    </div>
  );
}

export default function Events() {
  return (
    <Section id="events" index="" title="Live Events" kicker="Calendar · brackets · predictions" count="7 systems">
      <Grid>
        <Cell title="Event Calendar" spec="live countdown" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Calendar />
        </Cell>
        <Cell title="Tournament Bracket" spec="tap to score final" span="col-span-2 md:col-span-2 lg:col-span-2">
          <Bracket />
        </Cell>
        <Cell title="Live Prediction" spec="parimutuel pool" span="col-span-2 md:col-span-2 lg:col-span-2">
          <LivePrediction />
        </Cell>
        <Cell title="Grand Final Countdown" spec="real timer" span="col-span-2 md:col-span-2 lg:col-span-3">
          <CountdownHero />
        </Cell>
        <Cell title="Live Leaderboard" spec="layout shuffle" span="col-span-2 md:col-span-2 lg:col-span-3">
          <EventLB />
        </Cell>
        <Cell title="Prize Pool" spec="4 tiers" span="col-span-2 md:col-span-2 lg:col-span-3">
          <Prizes />
        </Cell>
        <Cell title="News & Announcements" spec="4 cards" span="col-span-2 md:col-span-2 lg:col-span-3">
          <News />
        </Cell>
      </Grid>
      <div className="mt-3 flex flex-wrap gap-2">
        <Tag tone="bear">FOMO done right</Tag>
        <Tag tone="gold">real timers</Tag>
        <Tag tone="accent">parimutuel math</Tag>
        <Tag tone="violet">bracket drama</Tag>
      </div>
    </Section>
  );
}
