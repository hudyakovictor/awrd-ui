import { useState } from "react";
import { Asset, Bar, Btn, Chip, Confetti, Label, Section, haptic, useAnimatedNumber } from "../components/ui";
import { ChestIcon, CoinIcon, FlameIcon, GemIcon, Icon, ShieldIcon, TrophyIcon, XPIcon } from "../components/icons";
import { cn } from "../utils/cn";
import { useGame } from "../lib/game";

function Streak() {
  const game = useGame();
  const [streak, setStreak] = useState(47);
  const [goal, setGoal] = useState(30);
  const [freeze, setFreeze] = useState(true);
  const [bump, setBump] = useState(0);
  const target = 50;
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, goal / target);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <Asset title="Streak & Daily Goal" code="P-01" tags="streak flame daily goal ring calendar freeze" span={4}>
      <div className="flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#0a1330" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="url(#streakGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.3,1.2,.5,1)" }}
            />
            <defs>
              <linearGradient id="streakGrad"><stop offset="0" stopColor="#ffc23d" /><stop offset="1" stopColor="#ff7a2f" /></linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <FlameIcon size={40} className="anim-flicker" />
            <span key={bump} className="anim-pop font-display text-lg font-black leading-none text-flame">
              {streak}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-display text-lg font-black text-white">Day streak</div>
          <div className="text-xs text-ink-300">
            Daily goal <b className="text-gold">{goal}</b>/{target} XP
          </div>
          <Btn
            variant={pct >= 1 ? "flame" : "gold"}
            size="sm"
            className="mt-3"
            onClick={() => {
              if (goal >= target) {
                setStreak((s) => s + 1);
                game.addStreak();
                setBump((b) => b + 1);
                setGoal(0);
              } else setGoal((g) => Math.min(target, g + 10));
            }}
          >
            {pct >= 1 ? "Extend streak!" : "+10 XP"}
          </Btn>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const done = i < 4;
          const frozen = i === 2 && freeze;
          return (
            <div key={i} className="text-center">
              <div className={cn("text-[10px] font-extrabold", i === 4 ? "text-flame" : "text-ink-400")}>{d}</div>
              <div
                className={cn(
                  "mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  frozen ? "bg-cyan/20 text-cyan ring-2 ring-cyan/50" : done ? "bg-gradient-to-b from-[#ffa15c] to-flame text-white shadow-[0_3px_0_#c24a0c]" : i === 4 ? "border-2 border-dashed border-flame/70 anim-glow" : "panel-inset",
                )}
              >
                {frozen ? "❄" : done ? <Icon name="check" size={15} stroke={3.5} /> : null}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => setFreeze((f) => !f)} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-ink-950/40 p-3 text-left transition hover:bg-ink-950/60">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/15 text-lg">❄</span>
        <div className="flex-1">
          <div className="text-xs font-extrabold text-white">Streak Freeze {freeze ? "equipped" : "off"}</div>
          <div className="text-[11px] text-ink-400">Protects your streak for 1 missed day</div>
        </div>
        <span className={cn("h-5 w-9 rounded-full p-0.5 transition", freeze ? "bg-cyan" : "bg-ink-600")}>
          <span className={cn("block h-4 w-4 rounded-full bg-white transition-transform", freeze && "translate-x-4")} />
        </span>
      </button>
    </Asset>
  );
}

function LevelXP() {
  const [xp, setXp] = useState(820);
  const [lvl, setLvl] = useState(12);
  const [fire, setFire] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const need = 1000;
  const shown = useAnimatedNumber(xp);
  const add = (n: number) => {
    haptic();
    const nx = xp + n;
    if (nx >= need) {
      setXp(nx - need);
      setLvl((l) => l + 1);
      setFire((f) => f + 1);
      setLevelUp(true);
      setTimeout(() => setLevelUp(false), 1800);
    } else setXp(nx);
  };
  return (
    <Asset title="Level & XP Progress" code="P-02" tags="level xp experience progress rank up" span={4}>
      <Confetti fire={fire} />
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg viewBox="0 0 100 110" className="h-24 w-24 drop-shadow-[0_6px_0_#3d2399]">
            <defs>
              <linearGradient id="hexg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c2b0ff" /><stop offset=".5" stopColor="#9170ff" /><stop offset="1" stopColor="#5a3ccc" /></linearGradient>
            </defs>
            <path d="M50 4 94 29v52L50 106 6 81V29L50 4Z" fill="url(#hexg)" />
            <path d="M50 16 83 35v40L50 94 17 75V35L50 16Z" fill="#2a1a78" opacity=".55" />
            <path d="M20 32 50 14" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div key={lvl} className="anim-pop absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-violet-200">Lvl</span>
            <span className="font-display text-3xl font-black leading-none text-white">{lvl}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-black text-white">Chart Apprentice</div>
          <div className="text-xs text-ink-400">Next: Swing Trader</div>
          <div className="mt-2 flex items-baseline gap-1 font-mono">
            <span className="text-xl font-bold text-gold">{Math.round(shown)}</span>
            <span className="text-xs text-ink-400">/ {need} XP</span>
          </div>
        </div>
      </div>
      <Bar value={(xp / need) * 100} color="gold" className="mt-4" height={18} />
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[15, 50, 200].map((n) => (
          <Btn key={n} variant="ghost" size="sm" onClick={() => add(n)}>
            <XPIcon size={16} /> +{n}
          </Btn>
        ))}
      </div>
      {levelUp && (
        <div className="anim-pop absolute inset-x-5 top-1/3 z-20 rounded-2xl bg-gradient-to-b from-violet to-violet-dark p-4 text-center shadow-[0_6px_0_#3d2399,0_20px_40px_rgba(0,0,0,.5)]">
          <div className="font-display text-2xl font-black text-white">LEVEL UP!</div>
          <div className="text-sm font-bold text-violet-100">You reached level {lvl}</div>
        </div>
      )}
      <Label className="mt-5">Rank ladder</Label>
      <div className="flex items-center gap-1">
        {["Novice", "Apprentice", "Swing", "Pro", "Whale"].map((r, i) => (
          <div key={r} className="flex-1 text-center">
            <div className={cn("h-2 rounded-full", i < 2 ? "bg-violet" : i === 2 ? "bg-violet/40" : "bg-ink-700")} />
            <div className={cn("mt-1 text-[9px] font-bold uppercase", i === 1 ? "text-violet" : "text-ink-500")}>{r}</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function Quests() {
  const game = useGame();
  const [q, setQ] = useState([
    { t: "Earn 50 XP", p: 50, n: 50, i: "bolt" },
    { t: "Complete 3 lessons", p: 2, n: 3, i: "book" },
    { t: "Place 1 paper trade", p: 0, n: 1, i: "swap" },
  ]);
  const [claimed, setClaimed] = useState<number[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [fire, setFire] = useState(0);
  return (
    <Asset title="Daily Quests" code="P-03" tags="quests daily missions tasks reward chest claim" span={4}>
      <Confetti fire={fire} />
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display text-base font-black text-white">Daily quests</div>
        <Chip tone="gold">
          <Icon name="clock" size={12} /> 7h 12m
        </Chip>
      </div>
      <div className="space-y-3">
        {q.map((x, i) => {
          const done = x.p >= x.n;
          const isClaimed = claimed.includes(i);
          return (
            <div key={x.t} className={cn("panel-raised flex items-center gap-3 rounded-2xl p-3 transition", isClaimed && "opacity-60")}>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", done ? "bg-gold/20 text-gold" : "bg-ink-800 text-ink-300")}>
                <Icon name={x.i} size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-extrabold text-white">{x.t}</div>
                <div className="relative mt-1.5">
                  <Bar value={(x.p / x.n) * 100} color={done ? "gold" : "azure"} height={14} />
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-white drop-shadow">
                    {x.p}/{x.n}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  if (!done) {
                    setQ((s) => s.map((y, j) => (j === i ? { ...y, p: Math.min(y.n, y.p + 1) } : y)));
                    return;
                  }
                  if (isClaimed) return;
                  setOpen(i);
                  game.reward("gems", 30, e.currentTarget);
                  setClaimed((c) => [...c, i]);
                  setFire((f) => f + 1);
                  haptic(30);
                  setTimeout(() => setOpen(null), 1400);
                }}
                className={cn("relative transition-transform hover:scale-110 active:scale-95", done && !isClaimed && "anim-float")}
                title={done ? "Claim" : "Progress +1"}
              >
                <ChestIcon size={40} open={isClaimed} />
                {open === i && (
                  <span className="anim-rise absolute -top-4 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap font-display text-xs font-black text-cyan">
                    +30 <GemIcon size={14} />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-ink-400">Tap chest to progress; claim when full.</div>
    </Asset>
  );
}

const initialLeague = [
  { n: "CryptoKate", xp: 2140, c: "#ff7a2f" },
  { n: "SatoshiJr", xp: 1980, c: "#3e8bff" },
  { n: "You", xp: 1875, c: "#22d39a", me: true },
  { n: "WhaleWatch", xp: 1720, c: "#9170ff" },
  { n: "DiamondHnd", xp: 1610, c: "#2fd4ff" },
  { n: "BearMkt", xp: 1402, c: "#ff4d6d" },
  { n: "Candlestik", xp: 1190, c: "#ffc23d" },
];
function League() {
  const [rows, setRows] = useState(initialLeague);
  const sorted = [...rows].sort((a, b) => b.xp - a.xp);
  const rankOf = (n: string) => sorted.findIndex((r) => r.n === n);
  const H = 54;
  return (
    <Asset title="League Leaderboard" code="P-04" tags="league leaderboard ranking rank competition promotion" span={5}>
      <div className="mb-4 flex items-center gap-3">
        <ShieldIcon tier="diamond" size={48} className="anim-float" />
        <div className="flex-1">
          <div className="font-display text-lg font-black text-white">Diamond League</div>
          <div className="text-xs text-ink-400">Top 3 advance · 2 days left</div>
        </div>
        <Btn
          variant="azure"
          size="sm"
          onClick={() => setRows((r) => r.map((x) => ({ ...x, xp: x.xp + Math.round(Math.random() * (x.me ? 420 : 300)) })))}
        >
          Simulate
        </Btn>
      </div>
      <div className="relative" style={{ height: rows.length * H + 20 }}>
        {rows.map((r) => {
          const rank = rankOf(r.n);
          return (
            <div
              key={r.n}
              className={cn(
                "absolute inset-x-0 flex h-[46px] items-center gap-3 rounded-2xl px-3 transition-all duration-700 ease-[cubic-bezier(.3,1.2,.5,1)]",
                r.me ? "bg-bull/15 ring-2 ring-bull/60" : "bg-ink-850/70",
              )}
              style={{ top: rank * H + (rank >= 3 ? 20 : 0) }}
            >
              <span className={cn("w-6 text-center font-display text-sm font-black", rank === 0 ? "text-gold" : rank === 1 ? "text-ink-200" : rank === 2 ? "text-flame" : "text-ink-500")}>
                {rank < 3 ? ["🥇", "🥈", "🥉"][rank] : rank + 1}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white shadow-[0_2px_0_rgba(0,0,0,.4)]" style={{ background: r.c }}>
                {r.n[0]}
              </span>
              <span className={cn("flex-1 truncate text-sm font-extrabold", r.me ? "text-bull" : "text-white")}>{r.n}</span>
              <span className="font-mono text-xs font-bold text-ink-300">{r.xp.toLocaleString()} XP</span>
            </div>
          );
        })}
        <div className="absolute inset-x-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-bull" style={{ top: 3 * H - 4 }}>
          <span className="h-px flex-1 bg-bull/40" />
          <Icon name="arrowUp" size={12} stroke={3} /> Promotion zone
          <span className="h-px flex-1 bg-bull/40" />
        </div>
      </div>
    </Asset>
  );
}

const achievements = [
  { n: "First Trade", d: "Place your first order", i: "swap", t: "bronze", p: 1, m: 1 },
  { n: "Chart Reader", d: "Finish 10 candle lessons", i: "candle", t: "silver", p: 10, m: 10 },
  { n: "Risk Master", d: "Use stop-loss 25 times", i: "shield", t: "gold", p: 18, m: 25 },
  { n: "Diamond Hands", d: "Hold a position 30 days", i: "sparkle", t: "diamond", p: 12, m: 30 },
  { n: "On Fire", d: "Reach a 100-day streak", i: "bolt", t: "elite", p: 47, m: 100 },
  { n: "Whale", d: "Reach $100k paper balance", i: "wallet", t: "gold", p: 64, m: 100 },
] as const;
const tierColor: Record<string, string> = { bronze: "#c0642a", silver: "#aebbd6", gold: "#ffc23d", diamond: "#2fd4ff", elite: "#9170ff" };

function Achievements() {
  const [prog, setProg] = useState<number[]>(achievements.map((a) => a.p));
  const [fire, setFire] = useState(0);
  const [focus, setFocus] = useState(2);
  const A = achievements[focus];
  return (
    <Asset title="Achievements" code="P-05" tags="achievements badges unlock trophies medals collection" span={7}>
      <Confetti fire={fire} />
      <div className="grid gap-5 md:grid-cols-[1fr_220px]">
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((a, i) => {
            const done = prog[i] >= a.m;
            const col = tierColor[a.t];
            return (
              <button
                key={a.n}
                onClick={() => setFocus(i)}
                className={cn(
                  "group/a relative flex flex-col items-center rounded-2xl p-3 text-center transition-all duration-200 hover:-translate-y-1",
                  focus === i ? "panel-raised ring-2" : "bg-ink-850/60 hover:bg-ink-800",
                )}
                style={{ ["--tw-ring-color" as string]: col }}
              >
                <div
                  className={cn("relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all", !done && "grayscale-[.85] opacity-60")}
                  style={{ background: `linear-gradient(180deg, ${col}, color-mix(in srgb, ${col} 55%, black))`, boxShadow: `0 4px 0 color-mix(in srgb, ${col} 40%, black), inset 0 2px 0 rgba(255,255,255,.4)` }}
                >
                  <Icon name={a.i} size={26} stroke={2.6} className="text-white drop-shadow" />
                  {done && <span className="sheen absolute inset-0 rounded-2xl" />}
                  {!done && (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 text-ink-300 ring-2 ring-ink-700">
                      <Icon name="lock" size={10} stroke={3} />
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[11px] font-extrabold text-white">{a.n}</div>
                <div className="mt-1.5 w-full">
                  <div className="h-1.5 overflow-hidden rounded-full bg-ink-950">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (prog[i] / a.m) * 100)}%`, background: col }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="panel-inset flex flex-col items-center rounded-2xl p-4 text-center">
          <div key={focus} className="anim-pop">
            <ShieldIcon tier={A.t as "gold"} size={72} />
          </div>
          <div className="mt-2 font-display text-base font-black text-white">{A.n}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: tierColor[A.t] }}>
            {A.t} tier
          </div>
          <div className="mt-2 text-xs text-ink-300">{A.d}</div>
          <div className="mt-3 font-mono text-sm font-bold text-white">
            {Math.min(prog[focus], A.m)}/{A.m}
          </div>
          <Btn
            variant={prog[focus] >= A.m ? "bull" : "gold"}
            size="sm"
            block
            className="mt-auto"
            disabled={prog[focus] >= A.m}
            onClick={() => {
              setProg((p) => p.map((v, j) => (j === focus ? A.m : v)));
              setFire((f) => f + 1);
              haptic(30);
            }}
          >
            {prog[focus] >= A.m ? "Unlocked" : "Unlock (demo)"}
          </Btn>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-xl bg-ink-950/40 px-4 py-2.5 text-xs text-ink-300">
        <TrophyIcon size={22} /> {prog.filter((p, i) => p >= achievements[i].m).length}/{achievements.length} unlocked
        <span className="ml-auto flex items-center gap-1">
          <CoinIcon size={18} /> <b className="text-gold">12,450</b>
        </span>
        <span className="flex items-center gap-1">
          <GemIcon size={18} /> <b className="text-cyan">1,240</b>
        </span>
      </div>
    </Asset>
  );
}

export default function Progression() {
  return (
    <Section id="progression" index="05" kicker="Retention systems" title="Progression & Rewards">
      <Streak />
      <LevelXP />
      <Quests />
      <League />
      <Achievements />
    </Section>
  );
}
