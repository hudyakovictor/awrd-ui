import { useEffect, useMemo, useState } from "react";
import { Calendar, Ticket, Users, ChevronLeft, ChevronRight, Gift, Crown, Target } from "lucide-react";
import { Asset, Section, Btn, Chip } from "../kit/ui";
import { TrophyIcon, StarIcon } from "../kit/GameIcons";
import { Confetti } from "./Rewards";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ============ EV-01 EVENT CALENDAR ============ */
type Ev = { d: number; n: string; c: string; t: string };
const month: Ev[] = [
  { d: 3, n: "Duel Cup", c: "#ff4f6d", t: "PvP" },
  { d: 7, n: "2x XP Weekend", c: "#22d39a", t: "Boost" },
  { d: 12, n: "New Unit: DeFi", c: "#3b82ff", t: "Learn" },
  { d: 15, n: "Clan War", c: "#8b5cff", t: "Clan" },
  { d: 19, n: "Boss Rush", c: "#ff8a3d", t: "Trial" },
  { d: 23, n: "Prediction Pool", c: "#ffc53d", t: "Pool" },
  { d: 27, n: "Season Finale", c: "#2bd9ff", t: "Final" },
];
function EventCalendar() {
  const today = 14;
  const [sel, setSel] = useState<number | null>(15);
  const [joined, setJoined] = useState<number[]>([3]);
  const ev = month.find((e) => e.d === sel);
  return (
    <Asset code="EV-01" title="Event Calendar" desc="Календарь месяца: дни с событиями подсвечены, тап открывает карточку и запись." hint="Выбери день" specs={["7 events", "join", "today ring"]}>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-display text-sm font-extrabold">October 2026</span>
        <span className="flex gap-1">
          <button className="grid h-8 w-8 place-items-center rounded-lg bg-ink-800 text-mist"><ChevronLeft size={15} /></button>
          <button className="grid h-8 w-8 place-items-center rounded-lg bg-ink-800 text-mist"><ChevronRight size={15} /></button>
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="text-[9px] font-extrabold uppercase text-mist">{d}</span>)}
        {[...Array(30)].map((_, i) => {
          const d = i + 1;
          const e = month.find((x) => x.d === d);
          const isSel = sel === d;
          return (
            <button
              key={d}
              onClick={() => { setSel(d); sfx.tick(); }}
              className={cn("relative grid h-10 place-items-center rounded-xl text-[12px] font-extrabold transition", isSel ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800/60 hover:bg-ink-700", d === today && !isSel && "ring-2 ring-gold")}
            >
              {d}
              {e && <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full" style={{ background: e.c, boxShadow: `0 0 6px ${e.c}` }} />}
              {joined.includes(d) && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-bull" />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 min-h-[86px]">
        {ev ? (
          <div key={ev.d} className="anim-pop flex items-center gap-3 rounded-2xl border-2 p-3" style={{ borderColor: ev.c, background: `${ev.c}12` }}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: ev.c }}><Calendar size={20} className="text-white" /></span>
            <div className="min-w-0 flex-1"><div className="text-[14px] font-extrabold">{ev.n}</div><div className="text-[11px] text-mist">{ev.t} · Oct {ev.d} · 18:00 UTC</div></div>
            <button onClick={() => { setJoined((j) => (j.includes(ev.d) ? j.filter((x) => x !== ev.d) : [...j, ev.d])); sfx.toggle(!joined.includes(ev.d)); }} className={cn("h-10 rounded-xl px-4 text-[11px] font-extrabold uppercase transition active:translate-y-0.5", joined.includes(ev.d) ? "bg-bull/20 text-bull" : "text-white")} style={joined.includes(ev.d) ? undefined : { background: ev.c }}>
              {joined.includes(ev.d) ? "✓ In" : "Join"}
            </button>
          </div>
        ) : (
          <div className="grid place-items-center rounded-2xl bg-ink-800/60 py-5 text-[12px] text-mist">Нет событий — день для практики 📚</div>
        )}
      </div>
    </Asset>
  );
}

/* ============ EV-02 PREDICTION POOL ============ */
function PredictPool() {
  const [pool, setPool] = useState({ up: 642, down: 418 });
  const [mine, setMine] = useState<"up" | "down" | null>(null);
  const [stake, setStake] = useState(50);
  const [left, setLeft] = useState(182);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(t); setDone(true); sfx.levelUp(); return 0; }
        return v - 1;
      });
      if (Math.random() > 0.5) setPool((p) => ({ up: p.up + Math.round(Math.random() * 6), down: p.down + Math.round(Math.random() * 6) }));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const total = pool.up + pool.down + (mine ? stake : 0);
  const upPct = ((pool.up + (mine === "up" ? stake : 0)) / total) * 100;
  const winSide: "up" | "down" = "up";
  const won = done && mine === winSide;
  const payout = mine && done && won ? Math.round(stake * (total / (pool.up + stake))) : 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <Asset code="EV-02" title="Prediction Pool" desc="Пул предсказаний: ставь на рост или падение BTC за 3 минуты. Коэффициенты живые, пул делится." hint="Сделай ставку" specs={["live odds", "3:00 lock", "payout"]}>
      <div className="rounded-2xl bg-ink-900/60 p-3 text-center">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">BTC через 3 минуты</div>
        <div className={cn("num font-display mt-1 text-3xl font-black", left < 30 ? "text-bear" : "text-gold")}>{mm}:{ss}</div>
        <div className="num mt-1 text-[11px] text-mist">pool {total.toLocaleString()} 💎</div>
      </div>
      <div className="mt-3 flex h-12 overflow-hidden rounded-2xl">
        <button disabled={!!mine || done} onClick={() => { setMine("up"); sfx.correct(); }} className="relative bg-gradient-to-b from-bull to-bull-d transition-all duration-500 disabled:cursor-default" style={{ width: `${upPct}%` }}>
          <span className="absolute inset-0 grid place-items-center text-sm font-black">▲ {(total / (pool.up + (mine === "up" ? stake : 0))).toFixed(2)}x</span>
        </button>
        <button disabled={!!mine || done} onClick={() => { setMine("down"); sfx.wrong(); }} className="relative flex-1 bg-gradient-to-b from-bear to-bear-d transition-all duration-500 disabled:cursor-default">
          <span className="absolute inset-0 grid place-items-center text-sm font-black">▼ {(total / (pool.down + (mine === "down" ? stake : 0))).toFixed(2)}x</span>
        </button>
      </div>
      {!mine && !done && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Stake</span><span className="num text-cyan">{stake} 💎</span></div>
          <input type="range" min={10} max={200} step={10} value={stake} onChange={(e) => setStake(+e.target.value)} className="h-2 w-full" style={{ accentColor: "#2bd9ff" }} />
        </div>
      )}
      {mine && !done && <div className="anim-pop mt-3 rounded-xl bg-sky/15 p-2.5 text-center text-[12px] font-bold text-sky">Ставка {stake} 💎 на {mine === "up" ? "РОСТ ▲" : "ПАДЕНИЕ ▼"} принята</div>}
      {done && (
        <div className={cn("anim-pop mt-3 rounded-2xl p-3 text-center", won ? "bg-bull/15" : "bg-ink-800")}>
          <div className="text-[11px] font-bold uppercase text-mist">Result: BTC ▲ +0.4%</div>
          <div className={cn("font-display text-xl font-black", won ? "text-bull" : "text-mist")}>{mine ? (won ? `+${payout} 💎` : "Мимо") : "Ты не ставил"}</div>
        </div>
      )}
    </Asset>
  );
}

/* ============ EV-03 RAFFLE ============ */
const faces = ["😎", "🚀", "🐂", "💎", "🔥", "⚡️", "🌙", "👑", "🎯", "💰"];
function Raffle() {
  const [tickets, setTickets] = useState(3);
  const [spinning, setSpinning] = useState(false);
  const [off, setOff] = useState(0);
  const [win, setWin] = useState<number | null>(null);
  const W = 64;
  const spin = () => {
    if (spinning || tickets <= 0) return;
    setSpinning(true);
    setWin(null);
    setTickets((t) => t - 1);
    const target = Math.floor(Math.random() * faces.length);
    const rounds = 4;
    const final = -(rounds * faces.length * W + target * W) + 2 * W;
    setOff(final);
    sfxRaw.swipe();
    let n = 0;
    const ticks = setInterval(() => { sfx.tick(); if (++n > 22) clearInterval(ticks); }, 120);
    setTimeout(() => { setSpinning(false); setWin(target); sfx.levelUp(); }, 4200);
  };
  return (
    <Asset code="EV-03" title="Raffle Spinner" desc="Рулетка удачи: лента крутится 4 круга и останавливается на призе. Три билета в день." hint="Крути рулетку" specs={["4 rounds", "ease-out", "tickets"]}>
      <div className="mb-3 flex items-center justify-between">
        <Chip tone="gold"><Ticket size={11} /> {tickets} tickets</Chip>
        <button onClick={() => { setTickets(3); setWin(null); setOff(0); }} className="text-[11px] font-bold text-sky">Refill</button>
      </div>
      <div className="relative overflow-hidden rounded-2xl bg-ink-900/70 py-4">
        <div className="absolute inset-y-0 left-1/2 z-10 w-1 -translate-x-1/2 bg-gold shadow-[0_0_12px_#ffc53d]" />
        <div className="absolute left-1/2 top-1 z-10 -translate-x-1/2 text-gold">▼</div>
        <div className="flex gap-2 pl-[calc(50%-32px)]" style={{ transform: `translateX(${off}px)`, transition: spinning ? "transform 4s cubic-bezier(.12,.8,.15,1)" : "none" }}>
          {[...Array(5)].flatMap((_, r) => faces.map((f, i) => (
            <span key={`${r}-${i}`} className={cn("grid h-16 w-14 shrink-0 place-items-center rounded-2xl border-2 text-3xl", win === i && r === 4 && !spinning ? "anim-pop border-gold bg-gold/15" : "border-white/5 bg-ink-800")}>{f}</span>
          )))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#132447] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-[#132447] to-transparent" />
      </div>
      {win !== null && !spinning && <div className="anim-pop mt-3 rounded-2xl bg-gold/15 p-3 text-center text-[14px] font-extrabold text-gold">Выигрыш: {faces[win]} +150 💎</div>}
      <Btn tone="gold" block className="mt-3 !text-[#3b2600]" disabled={spinning || tickets <= 0} onClick={spin}>{spinning ? "Spinning…" : tickets <= 0 ? "No tickets" : "Spin"}</Btn>
    </Asset>
  );
}

/* ============ EV-04 SEASON SHOWCASE ============ */
const seasons = [
  { n: "S5 · Genesis", you: 12, best: "#3", c: "#8a9bc4" },
  { n: "S6 · Momentum", you: 4, best: "#2", c: "#3b82ff" },
  { n: "S7 · Bull Run", you: 2, best: "#2", c: "#ffc53d", live: true },
];
function SeasonShowcase() {
  const [i, setI] = useState(2);
  const s = seasons[i];
  return (
    <Asset code="EV-04" title="Season Showcase" desc="Витрина сезонов: листай историю, смотри место и награды. Текущий сезон помечен LIVE." hint="Листай сезоны" specs={["history", "rewards", "live tag"]}>
      <div className="relative overflow-hidden rounded-2xl bg-ink-900/60 p-5 text-center">
        {s.live && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-bear px-2 py-0.5 text-[9px] font-black"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE</span>}
        <div key={s.n} className="anim-pop">
          <TrophyIcon size={72} className="mx-auto anim-float" style={{ filter: `drop-shadow(0 0 20px ${s.c})` }} />
          <div className="font-display mt-2 text-xl font-black" style={{ color: s.c }}>{s.n}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[["Your place", `#${s.you}`], ["Best finish", s.best], ["Reward", s.you <= 3 ? "+500 💎" : "+100 💎"]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-ink-800 py-2"><div className="text-[8px] font-bold uppercase text-mist">{a}</div><div className="num text-sm font-extrabold">{b}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => { setI((x) => Math.max(0, x - 1)); sfx.tick(); }} disabled={i === 0} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 disabled:opacity-30"><ChevronLeft size={16} /></button>
        <div className="flex flex-1 justify-center gap-1.5">{seasons.map((x, k) => <button key={x.n} onClick={() => setI(k)} className="h-2 rounded-full transition-all" style={{ width: k === i ? 24 : 8, background: k === i ? x.c : "#273f75" }} />)}</div>
        <button onClick={() => { setI((x) => Math.min(seasons.length - 1, x + 1)); sfx.tick(); }} disabled={i === seasons.length - 1} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 disabled:opacity-30"><ChevronRight size={16} /></button>
      </div>
    </Asset>
  );
}

/* ============ EV-05 TEAM DRAFT ============ */
const pool = [
  { n: "Mira", r: 92, c: "#ff4f6d" }, { n: "Denis", r: 84, c: "#22d39a" }, { n: "Kate", r: 88, c: "#ffc53d" },
  { n: "Omar", r: 76, c: "#8b5cff" }, { n: "Rex", r: 81, c: "#ff8a3d" }, { n: "Satoshi", r: 95, c: "#f7931a" },
];
function TeamDraft() {
  const [team, setTeam] = useState<string[]>([]);
  const [enemy] = useState(["WickHunter", "BearTrap", "PaperHands"]);
  const power = (names: string[]) => names.reduce((a, n) => a + (pool.find((p) => p.n === n)?.r ?? 70), 0);
  const toggle = (n: string) => {
    if (team.includes(n)) { setTeam(team.filter((x) => x !== n)); sfx.soft(); }
    else if (team.length < 3) { setTeam([...team, n]); sfx.tick(); }
    else sfx.error();
  };
  const mine = power(team), foe = power(enemy);
  const ready = team.length === 3;
  return (
    <Asset code="EV-05" title="Team Draft · 3v3" desc="Собери тройку для клановой войны: у каждого рейтинг, сила команды считается вживую." hint="Выбери троих" specs={["draft 3", "power calc", "vs"]}>
      <div className="grid grid-cols-2 gap-2">
        {pool.map((p) => {
          const on = team.includes(p.n);
          return (
            <button key={p.n} onClick={() => toggle(p.n)} className={cn("flex items-center gap-2.5 rounded-2xl border-2 p-2.5 text-left transition active:scale-95", on ? "bg-sky/10" : "border-transparent bg-ink-800")} style={on ? { borderColor: p.c } : undefined}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-ink-900" style={{ background: `linear-gradient(160deg,#fff,${p.c} 60%)` }}>{p.n[0]}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-extrabold">{p.n}</span><span className="num block text-[10px] text-mist">{p.r} rating</span></span>
              {on && <span className="anim-pop text-bull">✓</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-2xl bg-ink-900/60 p-3">
        <div className="flex justify-between text-[11px] font-extrabold"><span className="text-sky">YOU · {mine}</span><span className="text-mist">VS</span><span className="text-bear">{foe} · FOE</span></div>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-ink-950">
          <div className="bg-sky transition-all duration-500" style={{ width: `${(mine / (mine + foe)) * 100}%` }} />
          <div className="flex-1 bg-bear" />
        </div>
        <div className="mt-1 text-center text-[10px] text-mist">{!ready ? `Выбери ещё ${3 - team.length}` : mine >= foe ? "Шансы хорошие — в бой!" : "Соперник сильнее — нужна тактика"}</div>
      </div>
      <Btn tone={ready ? "bull" : "sky"} block size="sm" className="mt-3" disabled={!ready} onClick={() => sfx.levelUp()}><Users size={14} /> Start 3v3</Btn>
    </Asset>
  );
}

/* ============ EV-06 GIFT DROP ============ */
function GiftDrop() {
  const [grid, setGrid] = useState<boolean[]>([...Array(9)].map(() => false));
  const [found, setFound] = useState(0);
  const [picks, setPicks] = useState(3);
  const prizes = useMemo(() => { const a = [true, true, false, false, false, false, false, false, false]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }, []);
  const tap = (i: number) => {
    if (grid[i] || picks <= 0) return;
    const n = [...grid]; n[i] = true; setGrid(n);
    setPicks((p) => p - 1);
    if (prizes[i]) { setFound((f) => f + 1); sfx.coin(); } else sfxRaw.thud();
  };
  const left = prizes.filter((p, i) => p && !grid[i]).length;
  return (
    <Asset code="EV-06" title="Gift Drop · Find 2" desc="Девять подарков, два с призами, три попытки. Память и удача в одном флаконе." hint="Открывай подарки" specs={["9 tiles", "3 picks", "2 prizes"]}>
      <div className="mb-3 flex items-center justify-between text-[11px] font-bold">
        <span className="text-mist">Picks <span className="num text-white">{picks}</span></span>
        <span className="text-mist">Found <span className="num text-gold">{found}/2</span></span>
      </div>
      <div className="relative grid grid-cols-3 gap-2">
        {picks === 0 && found === 2 && <Confetti />}
        {grid.map((open, i) => (
          <button key={i} onClick={() => tap(i)} disabled={open || picks <= 0} className={cn("relative grid aspect-square place-items-center rounded-2xl transition-all duration-300 [transform-style:preserve-3d]", open && "anim-pop")} style={{ transform: open ? "rotateY(180deg)" : undefined }}>
            {!open ? (
              <span className="absolute inset-0 grid place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-violet-d to-ink-800 shadow-[0_4px_0_#08112a] transition hover:-translate-y-1 [backface-visibility:hidden]">
                <Gift size={34} className="text-violet" />
              </span>
            ) : (
              <span className={cn("absolute inset-0 grid place-items-center rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]", prizes[i] ? "bg-gold/20 ring-2 ring-gold" : "bg-ink-900")}>
                {prizes[i] ? <StarIcon size={36} /> : <span className="text-2xl opacity-30">✕</span>}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-3 text-center text-[12px]">
        {picks === 0 ? (found === 2 ? <span className="font-extrabold text-gold">Perfect! Both gifts found 🎉</span> : <span className="text-mist">Осталось призов: {left} — повезёт завтра</span>) : <span className="text-mist">Осталось попыток: {picks}</span>}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-mist">
        <span className="flex items-center gap-1"><Crown size={11} className="text-gold" /> daily reset</span>
        <span className="flex items-center gap-1"><Target size={11} className="text-sky" /> 22% win rate</span>
      </div>
    </Asset>
  );
}

export default function Events() {
  return (
    <Section id="events" index="EV" title="Live Events" subtitle="Календарь, пулы предсказаний, рулетка, сезоны, драфт и подарки">
      <EventCalendar />
      <PredictPool />
      <Raffle />
      <SeasonShowcase />
      <TeamDraft />
      <GiftDrop />
    </Section>
  );
}
