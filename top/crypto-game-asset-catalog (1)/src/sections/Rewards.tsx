import { useMemo, useState, type CSSProperties } from "react";
import { ChevronsUp, ChevronsDown, Snowflake, Sparkles } from "lucide-react";
import { Asset, Section, Btn, Bar, Chip } from "../kit/ui";
import { ChestIcon, GemIcon, CoinIcon, BoltIcon, FlameIcon, TrophyIcon, ShieldIcon, TargetIcon, StarIcon, CandleUpIcon } from "../kit/GameIcons";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

export function Confetti({ n = 36 }: { n?: number }) {
  const cols = ["#22d39a", "#ffc53d", "#3b82ff", "#8b5cff", "#ff4f6d", "#2bd9ff"];
  const parts = useMemo(() => [...Array(n)].map((_, i) => ({ a: (i / n) * Math.PI * 2 + Math.random(), d: 80 + Math.random() * 120, w: 6 + Math.random() * 6, h: 4 + Math.random() * 10, r: Math.random() * 720, t: 0.9 + Math.random() * 0.8 })), [n]);
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      {parts.map(({ a, d, w, h, r, t }, i) => {
        return (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 block"
            style={{
              width: w,
              height: h,
              borderRadius: i % 3 === 0 ? 99 : 2,
              background: cols[i % cols.length],
              ["--dx" as string]: `${Math.cos(a) * d}px`,
              ["--dy" as string]: `${Math.sin(a) * d + 60}px`,
              ["--rot" as string]: `${r}deg`,
              animation: `confetti-fall ${t}s cubic-bezier(.2,.8,.4,1) forwards`,
            } as CSSProperties}
          />
        );
      })}
    </div>
  );
}

function Chest() {
  const [taps, setTaps] = useState(0);
  const [open, setOpen] = useState(false);
  const [k, setK] = useState(0);
  const need = 3;
  const tap = () => {
    if (open) return;
    const t = taps + 1;
    setTaps(t);
    setK((x) => x + 1);
    if (t >= need) { setOpen(true); sfx.open(); } else sfx.tap();
  };
  const loot = [{ I: GemIcon, v: "+120", c: "#2bd9ff" }, { I: CoinIcon, v: "+500", c: "#ffc53d" }, { I: BoltIcon, v: "+10", c: "#ffc53d" }];
  return (
    <Asset code="F-001" title="Reward Chest Opening" desc="Тапай сундук — он трясётся и нагнетает. На 3-й тап: лучи, конфетти и лут." hint="Тапни 3 раза" specs={["build-up", "god rays", "loot pop"]}>
      <div className="relative grid h-64 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_55%,#2a1f6e,#0d1730_70%)]">
        {open && (
          <div className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 opacity-60" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.28) 0deg 10deg, transparent 10deg 24deg)", animation: "rays 12s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 65%)", WebkitMaskImage: "radial-gradient(circle, #000 20%, transparent 65%)" }} />
        )}
        {open && <Confetti />}
        <button onClick={tap} className="relative z-10" aria-label="Open chest">
          <span key={k} className="block" style={{ animation: open ? "pop-in .5s cubic-bezier(.2,1.6,.4,1)" : taps ? `chest-shake ${0.3 + taps * 0.1}s ease` : "float 2.4s ease-in-out infinite" }}>
            <ChestIcon size={open ? 130 : 120} open={open} style={{ filter: `drop-shadow(0 0 ${10 + taps * 10}px rgba(139,92,255,.8))` }} />
          </span>
        </button>
        {!open && (
          <div className="absolute bottom-4 flex gap-1.5">
            {[...Array(need)].map((_, i) => <span key={i} className={cn("h-2 w-6 rounded-full transition-all", i < taps ? "bg-gold shadow-[0_0_8px_#ffc53d]" : "bg-ink-600")} />)}
          </div>
        )}
        {open && (
          <div className="absolute bottom-4 z-20 flex gap-3">
            {loot.map(({ I, v, c }, i) => (
              <div key={i} className="panel-raised anim-pop flex flex-col items-center px-3 py-2" style={{ animationDelay: `${300 + i * 150}ms` }}>
                <I size={30} />
                <span className="num text-xs font-extrabold" style={{ color: c }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Btn tone={open ? "violet" : "gold"} block className={cn("mt-4", !open && "!text-[#3b2600]")} onClick={() => { if (open) { setOpen(false); setTaps(0); } else tap(); }} silent>
        {open ? "Collect & reset" : `Tap to open · ${need - taps}`}
      </Btn>
    </Asset>
  );
}

const achievements = [
  { n: "First Trade", d: "Открыть первую сделку", tier: "bronze", I: CandleUpIcon, p: 100 },
  { n: "Risk Master", d: "10 сделок со стоп-лоссом", tier: "silver", I: ShieldIcon, p: 100 },
  { n: "Sniper", d: "5 точных входов подряд", tier: "gold", I: TargetIcon, p: 60 },
  { n: "Diamond Hands", d: "Держать 30 дней", tier: "diamond", I: GemIcon, p: 20 },
  { n: "On Fire", d: "Серия 50 дней", tier: "gold", I: FlameIcon, p: 94 },
  { n: "Legend", d: "Топ-1 в Diamond лиге", tier: "legend", I: TrophyIcon, p: 0 },
];
const tierC: Record<string, [string, string]> = {
  bronze: ["#e39a62", "#8a4a22"],
  silver: ["#d6e1ff", "#6f82ad"],
  gold: ["#ffd76b", "#b87708"],
  diamond: ["#8ff3ff", "#1395b8"],
  legend: ["#c3a6ff", "#5a33c7"],
};
function Achievements() {
  const [flip, setFlip] = useState<number | null>(null);
  return (
    <Asset code="F-002" title="Achievement Badges" desc="Гексагональные медали 5 тиров с блеском. Тап — переворот с прогрессом." hint="Тапни медаль" specs={["5 tiers", "3D flip", "sheen"]}>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((a, i) => {
          const [c1, c2] = tierC[a.tier];
          const done = a.p >= 100;
          const f = flip === i;
          return (
            <button key={a.n} onClick={() => { setFlip(f ? null : i); sfx.whoosh(); }} className="group/a h-32 [perspective:600px]">
              <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.3,1.4,.5,1)]" style={{ transform: f ? "rotateY(180deg)" : undefined }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 [backface-visibility:hidden]">
                  <div className={cn("relative grid h-20 w-[72px] place-items-center transition-transform group-hover/a:-translate-y-1", done && "sheen")} style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: done || a.p > 0 ? `linear-gradient(160deg, ${c1}, ${c2})` : "#1d3160" }}>
                    <div className="grid h-[62px] w-14 place-items-center" style={{ clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: "#0d1730" }}>
                      <a.I size={34} style={{ filter: done ? undefined : "grayscale(1) brightness(.55)" }} />
                    </div>
                  </div>
                  <span className={cn("text-[10px] font-extrabold leading-tight", done ? "text-white" : "text-mist")}>{a.n}</span>
                </div>
                <div className="panel-raised absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="text-[9px] font-extrabold uppercase" style={{ color: c1 }}>{a.tier}</span>
                  <span className="text-[10px] font-bold leading-tight">{a.d}</span>
                  <div className="w-full"><Bar value={a.p} tone={done ? "bull" : "gold"} h={8} glow={false} /></div>
                  <span className="num text-[10px] text-mist">{a.p}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Asset>
  );
}

function Quests() {
  const [q, setQ] = useState([
    { n: "Earn 50 XP", I: BoltIcon, p: 50, max: 50, claimed: false, r: 20 },
    { n: "Win 3 predictions", I: TargetIcon, p: 2, max: 3, claimed: false, r: 30 },
    { n: "Set a stop-loss", I: ShieldIcon, p: 0, max: 1, claimed: false, r: 15 },
  ]);
  const [gems, setGems] = useState(1280);
  const [fly, setFly] = useState<number | null>(null);
  const act = (i: number) => {
    const x = q[i];
    const c = [...q];
    if (x.p >= x.max && !x.claimed) { c[i] = { ...x, claimed: true }; setGems((g) => g + x.r); setFly(i); sfx.coin(); setTimeout(() => setFly(null), 700); }
    else if (x.p < x.max) { c[i] = { ...x, p: x.p + (x.max > 3 ? 10 : 1) }; sfx.tick(); }
    setQ(c);
  };
  return (
    <Asset code="F-003" title="Daily Quests" desc="Ежедневные задания с прогрессом, кнопкой «забрать» и полётом награды в счётчик." hint="Прокачай и забери" specs={["claim", "fly-to-HUD", "reset 24h"]}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold text-mist">⏱ 14ч 22м до сброса</span>
        <span className="flex items-center gap-1"><GemIcon size={20} /><span key={gems} className="num anim-pop text-sm font-extrabold text-cyan">{gems}</span></span>
      </div>
      <div className="space-y-2.5">
        {q.map((x, i) => {
          const ready = x.p >= x.max && !x.claimed;
          return (
            <div key={x.n} className={cn("relative flex items-center gap-3 rounded-2xl p-3 transition", x.claimed ? "bg-ink-800/40" : "bg-ink-800 shadow-[0_4px_0_#08112a]", ready && "ring-2 ring-gold")} style={ready ? { animation: "glow-pulse 1.6s infinite" } : undefined}>
              <x.I size={34} style={{ filter: x.claimed ? "grayscale(1) opacity(.5)" : undefined }} />
              <div className="min-w-0 flex-1">
                <div className={cn("text-[13px] font-extrabold", x.claimed && "text-mist line-through")}>{x.n}</div>
                <div className="mt-1 flex items-center gap-2"><div className="flex-1"><Bar value={(x.p / x.max) * 100} tone={x.claimed ? "sky" : "gold"} h={10} glow={false} /></div><span className="num text-[10px] text-mist">{x.p}/{x.max}</span></div>
              </div>
              <button onClick={() => act(i)} disabled={x.claimed} className={cn("btn3d !h-10 !w-[74px] !rounded-xl !text-[10px]", ready && "sheen")} style={{ ["--c" as string]: ready ? "var(--color-gold)" : "var(--color-sky)", ["--cd" as string]: ready ? "var(--color-gold-d)" : "var(--color-sky-d)", ["--depth" as string]: "4px", color: ready ? "#3b2600" : undefined }}>
                {x.claimed ? "✓" : ready ? "Claim" : "Do it"}
              </button>
              {fly === i && (
                <span className="pointer-events-none absolute right-8 top-0 flex items-center gap-1" style={{ animation: "rise .7s ease-out forwards" }}>
                  <GemIcon size={20} /><span className="num text-sm font-black text-cyan">+{x.r}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

const players0 = [
  { n: "Satoshi_V", xp: 2340, c: "#f7931a" },
  { n: "you", xp: 1980, c: "#3b82ff" },
  { n: "CandleQueen", xp: 1875, c: "#ff4f6d" },
  { n: "HODLer42", xp: 1620, c: "#22d39a" },
  { n: "WickHunter", xp: 1410, c: "#8b5cff" },
  { n: "BearTrap", xp: 990, c: "#2bd9ff" },
  { n: "PaperHands", xp: 610, c: "#8a9bc4" },
];
function League() {
  const [ps, setPs] = useState(players0);
  const sorted = [...ps].sort((a, b) => b.xp - a.xp);
  const rankOf = (n: string) => sorted.findIndex((p) => p.n === n);
  const RH = 50;
  const sim = () => { setPs((p) => p.map((x) => ({ ...x, xp: x.xp + Math.round(Math.random() * (x.n === "you" ? 700 : 500)) }))); sfx.whoosh(); };
  return (
    <Asset code="F-004" title="League Leaderboard" desc="Лига с зонами повышения/понижения и плавной FLIP-перестановкой строк." hint="Симулируй неделю" specs={["FLIP reorder", "zones", "you-row"]}>
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-cyan to-cyan-d shadow-[inset_0_2px_0_rgba(255,255,255,.35),0_4px_0_#0c6a85]"><GemIcon size={30} /></div>
        <div><div className="font-display text-sm font-extrabold">Diamond League</div><div className="text-[11px] text-mist">Топ-3 повышаются · 2 дня</div></div>
      </div>
      <div className="relative" style={{ height: sorted.length * RH + 32 }}>
        {ps.map((p) => {
          const r = rankOf(p.n);
          const you = p.n === "you";
          const top = r * RH + (r >= 3 ? 16 : 0) + (r >= 5 ? 16 : 0);
          return (
            <div key={p.n} className={cn("absolute inset-x-0 flex h-[44px] items-center gap-2.5 rounded-xl px-2.5 transition-all duration-700 [transition-timing-function:cubic-bezier(.3,1.2,.5,1)]", you ? "z-10 bg-sky/15 ring-2 ring-sky" : "bg-ink-800/60")} style={{ top }}>
              <span className={cn("num w-5 text-center text-sm font-extrabold", r === 0 ? "text-gold" : r === 1 ? "text-[#d6e1ff]" : r === 2 ? "text-[#e39a62]" : "text-mist")}>{r + 1}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-black text-ink-900 shadow-[0_2px_0_rgba(0,0,0,.35)]" style={{ background: `linear-gradient(160deg, #fff, ${p.c} 60%)` }}>{p.n[0].toUpperCase()}</span>
              <span className={cn("flex-1 truncate text-[13px] font-bold", you && "text-sky")}>{you ? "You" : p.n}</span>
              <span className="num text-[12px] font-bold text-mist">{p.xp} XP</span>
            </div>
          );
        })}
        <div className="absolute inset-x-0 flex items-center gap-2 text-[9px] font-extrabold uppercase text-bull" style={{ top: 3 * RH - 2 }}><ChevronsUp size={12} /> promotion zone <span className="h-px flex-1 bg-bull/30" /></div>
        <div className="absolute inset-x-0 flex items-center gap-2 text-[9px] font-extrabold uppercase text-bear" style={{ top: 5 * RH + 14 }}><ChevronsDown size={12} /> demotion zone <span className="h-px flex-1 bg-bear/30" /></div>
      </div>
      <Btn tone="violet" block size="sm" className="mt-2" onClick={sim} silent><Sparkles size={14} /> Simulate day</Btn>
    </Asset>
  );
}

function LevelUp() {
  const [xp, setXp] = useState(70);
  const [lvl, setLvl] = useState(12);
  const [modal, setModal] = useState(false);
  const add = () => {
    const n = xp + 15;
    if (n >= 100) { setXp(100); sfx.levelUp(); setTimeout(() => { setModal(true); setLvl((l) => l + 1); setXp(n - 100); }, 500); }
    else { setXp(n); sfx.coin(); }
  };
  return (
    <Asset code="F-005" title="XP & Level-Up Moment" desc="Полоска опыта с пересчётом, и праздничное окно повышения уровня с конфетти." hint="Жми +15 XP" specs={["overflow", "modal", "confetti"]}>
      <div className="relative min-h-[260px] overflow-hidden rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <StarIcon size={64} className="anim-float" />
            <span key={lvl} className="num anim-pop absolute inset-0 grid place-items-center pt-2 text-lg font-black text-[#6b4300]">{lvl}</span>
          </div>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-[11px] font-bold"><span>Level {lvl}</span><span className="num text-gold">{xp}/100 XP</span></div>
            <Bar value={xp} tone="gold" h={20} />
            <div className="mt-1 text-[11px] text-mist">Следующий: <span className="font-bold text-violet">Swing Trader</span></div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[["Lessons", "48"], ["Accuracy", "87%"], ["Best streak", "63"]].map(([a, b]) => (
            <div key={a} className="panel-inset py-2.5"><div className="num text-base font-extrabold">{b}</div><div className="text-[9px] font-bold uppercase text-mist">{a}</div></div>
          ))}
        </div>
        <Btn tone="gold" block className="mt-5 !text-[#3b2600]" onClick={add} silent>+15 XP</Btn>
        {modal && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-ink-950/70 backdrop-blur-sm anim-fade">
            <Confetti n={44} />
            <div className="panel anim-pop relative z-40 w-[85%] p-5 text-center">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-gold">Level up!</div>
              <div className="text-gradient-gold font-display my-1 text-5xl font-black">{lvl}</div>
              <div className="mb-3 text-[12px] text-mist">Открыт урок «Уровни поддержки»</div>
              <div className="mb-4 flex justify-center gap-2"><Chip tone="cyan">+50 gems</Chip><Chip tone="gold">+1 chest</Chip></div>
              <Btn tone="bull" block onClick={() => setModal(false)}>Awesome</Btn>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

function StreakCal() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const [done, setDone] = useState([true, true, true, false, false, false, false]);
  const [freeze, setFreeze] = useState(false);
  const [streak, setStreak] = useState(47);
  const today = done.indexOf(false);
  const extend = () => {
    if (today < 0) { setDone(done.map(() => false)); return; }
    const d = [...done]; d[today] = true; setDone(d); setStreak((s) => s + 1); sfx.levelUp();
  };
  return (
    <Asset code="F-006" title="Streak Calendar" desc="Недельная серия с огоньками, заморозкой серии и праздничным продлением." hint="Продли серию" specs={["7-day", "freeze", "flame grow"]}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <FlameIcon size={80} className="anim-flame" style={{ filter: "drop-shadow(0 0 18px rgba(255,138,61,.7))" }} />
          {freeze && <Snowflake size={28} className="anim-pop absolute -right-1 -bottom-1 text-cyan drop-shadow-[0_0_6px_#2bd9ff]" />}
        </div>
        <div>
          <div key={streak} className="num anim-pop text-5xl font-black text-ember">{streak}</div>
          <div className="font-display text-sm font-bold">day streak</div>
        </div>
      </div>
      <div className="panel-inset mt-4 grid grid-cols-7 gap-1 p-3 !rounded-2xl">
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className={cn("text-[10px] font-extrabold", i === today ? "text-white" : "text-mist")}>{d}</span>
            <span className={cn("grid h-9 w-9 place-items-center rounded-full transition-all duration-300", done[i] ? "anim-pop bg-gradient-to-b from-gold to-ember shadow-[0_3px_0_#c75a14]" : i === today ? "border-2 border-dashed border-ember" : "bg-ink-700")} style={{ animationDelay: `${i * 40}ms` }}>
              {done[i] ? <FlameIcon size={20} /> : i === today ? <span className="h-2 w-2 rounded-full bg-ember" style={{ animation: "pulse-ring 1.2s infinite" }} /> : null}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => { setFreeze(!freeze); sfx.toggle(!freeze); }} className={cn("flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl border-2 text-[11px] font-extrabold uppercase transition", freeze ? "border-cyan bg-cyan/15 text-cyan shadow-[0_4px_0_#1395b8]" : "border-ink-500 bg-ink-700 text-mist shadow-[0_4px_0_#0f1c3a]")}>
          <Snowflake size={15} /> Freeze {freeze ? "on" : "off"}
        </button>
        <Btn tone="ember" className="flex-1" onClick={extend} silent>{today < 0 ? "New week" : "Extend"}</Btn>
      </div>
    </Asset>
  );
}

export default function Rewards() {
  return (
    <Section id="rewards" index="06" title="Rewards & Progression" subtitle="Мотивационный слой: сундуки, медали, квесты, лиги, уровни, серии">
      <Chest />
      <Achievements />
      <Quests />
      <League />
      <LevelUp />
      <StreakCal />
    </Section>
  );
}
