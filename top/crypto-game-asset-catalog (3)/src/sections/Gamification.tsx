import { useState, type ReactNode } from "react";
import { AssetCard, Btn, Burst, Confetti, FloatText, Icon, Label, ProgressBar, Section, useBump, useCountUp } from "../ui/kit";
import { Mascot, type Mood } from "../ui/Mascot";
import { cn } from "../utils/cn";

/* ───────── LESSON PATH ───────── */
type NodeKind = "lesson" | "chest" | "boss";
const PATH: { k: NodeKind; icon: string; t: string }[] = [
  { k: "lesson", icon: "candle", t: "What is a candle" },
  { k: "lesson", icon: "trendUp", t: "Bullish patterns" },
  { k: "chest", icon: "gift", t: "Reward" },
  { k: "lesson", icon: "trendDown", t: "Bearish patterns" },
  { k: "lesson", icon: "target", t: "Support & resistance" },
  { k: "boss", icon: "crown", t: "Unit boss: Doji battle" },
];
const OFFS = [0, 52, 72, 38, -30, 0];

function LessonPath() {
  const [cur, setCur] = useState(1);
  const [b, bump] = useBump();
  const done = cur >= PATH.length;
  const advance = () => { if (!done) { setCur(cur + 1); bump(); } };
  return (
    <AssetCard id="GAM-01" title="Lesson Path Map" desc="Карта юнита в стиле Duolingo: пройдено / текущий (пульс + бейдж START) / закрыто / сундук / босс. Тапни текущий узел." tags={["path", "map", "progression"]} className="row-span-2" stageClass="p-0 overflow-hidden">
      <div className="relative m-3 overflow-hidden rounded-2xl bg-gradient-to-br from-bull to-bull-edge p-4 shadow-[0_5px_0_#0b7a4d]">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" />
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-900/70">Section 1 · Unit 2</div>
        <div className="text-lg font-extrabold text-ink-900">Candlestick Patterns</div>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-900/25"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${(Math.min(cur, PATH.length) / PATH.length) * 100}%` }} /></div>
          <span className="font-mono text-[11px] font-extrabold text-ink-900">{Math.min(cur, PATH.length)}/{PATH.length}</span>
        </div>
      </div>
      <div className="relative flex flex-col items-center gap-7 pb-8 pt-10">
        {PATH.map((n, i) => {
          const st = i < cur ? "done" : i === cur ? "cur" : "locked";
          const size = n.k === "boss" ? 84 : 70;
          const colors = st === "done" ? (n.k === "chest" ? ["#ffc53d", "#cc8a00"] : ["#ffc53d", "#cc8a00"]) : st === "cur" ? ["#2ee59d", "#12a46a"] : ["#22376f", "#132250"];
          return (
            <div key={i} className="relative" style={{ transform: `translateX(${OFFS[i]}px)` }}>
              {st === "cur" && (
                <>
                  <span className="absolute inset-0 rounded-full border-4 border-bull" style={{ animation: "pulseRing 1.6s ease-out infinite" }} />
                  <div className="absolute -top-11 left-1/2 z-10 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-bull-edge shadow-[0_3px_0_#c3cdea]" style={{ animation: "bob 1.4s ease-in-out infinite" }}>
                    Start
                    <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
                  </div>
                </>
              )}
              <button onClick={st === "cur" ? advance : undefined} disabled={st === "locked"} title={n.t}
                className={cn("relative grid place-items-center rounded-full transition-transform duration-100", st === "cur" && "active:translate-y-[6px]", st === "locked" && "cursor-not-allowed")}
                style={{
                  width: size, height: size - 6,
                  background: `radial-gradient(circle at 50% 30%, ${colors[0]}ee, ${colors[0]} 60%)`,
                  boxShadow: `0 6px 0 ${colors[1]}, 0 14px 20px -6px #000a, inset 0 2px 0 #ffffff55, inset 0 -3px 0 #0002`,
                }}>
                {st === "done" && n.k !== "chest" && <span key={b} className="anim-pop"><Icon name={n.k === "boss" ? "crown" : "star"} size={32} variant="solid" className="text-white drop-shadow" /></span>}
                {st === "done" && n.k === "chest" && <Icon name="gift" size={32} variant="duo" className="anim-pop text-white" />}
                {st === "cur" && <Icon name={n.icon} size={32} stroke={2.8} className="text-ink-900" />}
                {st === "locked" && <Icon name={n.k === "lesson" ? "lock" : n.icon} size={28} className="text-ink-400" />}
              </button>
              {st === "done" && i === cur - 1 && <Burst trigger={b} />}
            </div>
          );
        })}
        <div className="absolute bottom-24 right-2 opacity-90"><Mascot mood={done ? "happy" : "idle"} size={70} className="anim-float" /></div>
      </div>
      <div className="flex justify-center gap-2 pb-4">
        <Btn v="ghost" size="sm" onClick={() => setCur(0)}><Icon name="refresh" size={14} />Reset</Btn>
        <Btn v="bull" size="sm" onClick={advance} disabled={done}>Complete node</Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── QUIZ ───────── */
const OPTS = [
  { t: "Hammer", d: "M12 3v4 M9 7h6v5H9z M12 12v9" },
  { t: "Shooting star", d: "M12 3v12 M9 15h6v4H9z M12 19v2" },
  { t: "Bearish engulfing", d: "M8 6v14 M6 9h4v8H6z M16 3v18 M14 5h4v13h-4z" },
  { t: "Doji", d: "M12 3v18 M8 12h8" },
];
function Quiz() {
  const [sel, setSel] = useState<number | null>(null);
  const [res, setRes] = useState<null | boolean>(null);
  const [hearts, setHearts] = useState(5);
  const [shakeK, shake] = useBump();
  const [c, conf] = useBump();
  const correct = 0;
  const check = () => {
    if (sel === null) return;
    const ok = sel === correct;
    setRes(ok);
    if (ok) conf(); else { shake(); setHearts((h) => Math.max(0, h - 1)); }
  };
  const reset = () => { setSel(null); setRes(null); };
  return (
    <AssetCard id="GAM-02" title="Quiz Answer Tiles" desc="Выбор ответа → CHECK → фидбек-шит снизу. Верно: конфетти. Ошибка: тряска и −1 жизнь." tags={["quiz", "lesson", "feedback"]} stageClass="p-0 overflow-hidden">
      <div className="relative flex min-h-[430px] flex-col p-4">
        <Confetti trigger={c} count={40} />
        <div className="mb-4 flex items-center gap-3">
          <Icon name="x" size={22} className="text-ink-400" />
          <ProgressBar value={res ? 70 : 55} className="flex-1" h={14} />
          <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon key={hearts} name="heart" size={20} variant="solid" className={hearts < 5 ? "anim-pop" : ""} />{hearts}</span>
        </div>
        <div className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-violet">New pattern</div>
        <div className="mb-4 text-lg font-extrabold leading-tight text-white">Which candle signals a <span className="text-bull">bullish reversal</span> at support?</div>
        <div key={shakeK} className={cn("grid grid-cols-2 gap-3", shakeK && res === false && "anim-shake")}>
          {OPTS.map((o, i) => {
            const isSel = sel === i;
            const showOk = res !== null && i === correct;
            const showBad = res === false && isSel;
            return (
              <button key={o.t} disabled={res !== null} onClick={() => setSel(i)}
                className={cn("group flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all duration-100 active:translate-y-1",
                  showOk ? "border-bull bg-bull/15 shadow-[0_4px_0_#12a46a]" : showBad ? "border-bear bg-bear/15 shadow-[0_4px_0_#c21f43]" : isSel ? "border-sky bg-sky/15 shadow-[0_4px_0_#1e56c9]" : "border-ink-600 bg-ink-800 shadow-[0_4px_0_#0b1638] hover:bg-ink-700")}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" className={cn("transition-transform group-hover:scale-110", showOk ? "text-bull" : showBad ? "text-bear" : isSel ? "text-sky" : "text-ink-200")}>
                  <path d={o.d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity=".2" />
                </svg>
                <span className="text-center text-xs font-extrabold text-ink-100">{o.t}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-4">
          <Btn v={sel === null ? "sky" : "bull"} block disabled={sel === null} onClick={check}>Check</Btn>
        </div>
        {res !== null && (
          <div className={cn("absolute inset-x-0 bottom-0 z-20 rounded-t-3xl p-4 pb-5", res ? "bg-[#0f3b33]" : "bg-[#3d1628]")} style={{ animation: "slideUp .35s cubic-bezier(.2,1.2,.4,1) both" }}>
            <div className="mb-3 flex items-center gap-3">
              <span className={cn("grid h-11 w-11 place-items-center rounded-full anim-pop", res ? "bg-bull text-ink-900" : "bg-bear text-white")}><Icon name={res ? "check" : "x"} size={24} stroke={3.4} /></span>
              <div>
                <div className={cn("text-lg font-extrabold", res ? "text-bull" : "text-bear")}>{res ? "Excellent! +15 XP" : "Not quite"}</div>
                <div className="text-xs font-semibold text-ink-200">{res ? "Long lower wick = buyers rejected lower prices." : "Correct answer: Hammer"}</div>
              </div>
            </div>
            <Btn v={res ? "bull" : "bear"} block onClick={reset}>{res ? "Continue" : "Got it"}</Btn>
          </div>
        )}
      </div>
    </AssetCard>
  );
}

/* ───────── HUD CURRENCIES ───────── */
function PillBtn({ children, onClick, trigger, text, color }: { children: ReactNode; onClick: () => void; trigger: number; text: string; color: string }) {
  return (
    <button onClick={onClick} className="raised relative flex h-14 items-center justify-center gap-2 rounded-2xl px-3 transition-transform active:translate-y-1">
      {children}
      <FloatText trigger={trigger} text={text} color={color} />
    </button>
  );
}
function Currencies() {
  const [streak, setStreak] = useState(27);
  const [gems, setGems] = useState(1240);
  const [hearts, setHearts] = useState(3);
  const [energy, setEnergy] = useState(18);
  const [fx, setFx] = useState({ s: 0, g: 0, h: 0, e: 0 });
  const g = useCountUp(gems, 900);
  const bump = (k: keyof typeof fx) => setFx((f) => ({ ...f, [k]: f[k] + 1 }));
  return (
    <AssetCard id="GAM-03" title="HUD Currencies" desc="Стрик, гемы, жизни, энергия. Счётчики с count-up, float-текстом и микроанимациями." tags={["hud", "currency", "streak", "gems"]}>
      <div className="grid grid-cols-2 gap-3">
        <PillBtn trigger={fx.s} text="+1 day" color="#ff8a3d" onClick={() => { setStreak((s) => s + 1); bump("s"); }}>
          <Icon name="flame" size={28} variant="solid" className="anim-flame text-flame drop-shadow-[0_0_8px_#ff8a3d]" />
          <span className="font-mono text-xl font-extrabold text-flame">{streak}</span>
        </PillBtn>
        <PillBtn trigger={fx.g} text="+250" color="#a174ff" onClick={() => { setGems((x) => x + 250); bump("g"); }}>
          <Icon key={fx.g} name="gem" size={26} variant="duo" className="anim-pop text-violet drop-shadow-[0_0_8px_#a174ff]" />
          <span className="font-mono text-xl font-extrabold tabular-nums text-violet">{Math.round(g).toLocaleString()}</span>
        </PillBtn>
        <PillBtn trigger={fx.h} text={hearts > 0 ? "−1" : "refill"} color="#ff4d6a" onClick={() => { setHearts((h) => (h > 0 ? h - 1 : 5)); bump("h"); }}>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => <Icon key={i} name="heart" size={17} variant={i < hearts ? "solid" : "line"} className={cn(i < hearts ? "text-bear" : "text-ink-500", i === hearts - 1 && "anim-heartbeat")} />)}
          </div>
        </PillBtn>
        <PillBtn trigger={fx.e} text="+5" color="#ffc53d" onClick={() => { setEnergy((e) => Math.min(25, e + 5)); bump("e"); }}>
          <Icon name="bolt" size={24} variant="solid" className="text-gold drop-shadow-[0_0_8px_#ffc53d]" />
          <div className="w-16"><ProgressBar value={(energy / 25) * 100} color="gold" h={10} /></div>
        </PillBtn>
      </div>
      <Label className="mt-5">Shop price tag</Label>
      <div className="flex gap-3">
        {[["snow", "Streak Freeze", 200, "text-sky"], ["heart", "Refill Hearts", 350, "text-bear"], ["bolt", "2× XP Boost", 500, "text-gold"]].map(([ic, t, p, c]) => (
          <button key={t as string} className="raised group flex flex-1 flex-col items-center gap-1 rounded-2xl p-3 transition-transform hover:-translate-y-1 active:translate-y-0.5">
            <Icon name={ic as string} size={28} variant="duo" className={cn(c as string, "transition-transform group-hover:scale-110 group-hover:rotate-6")} />
            <span className="text-center text-[10px] font-bold leading-tight text-ink-200">{t}</span>
            <span className="flex items-center gap-1 font-mono text-xs font-extrabold text-violet"><Icon name="gem" size={12} variant="solid" />{p}</span>
          </button>
        ))}
      </div>
    </AssetCard>
  );
}

/* ───────── XP / LEVEL ───────── */
function XpLevel() {
  const [xp, setXp] = useState(70);
  const [lvl, setLvl] = useState(12);
  const [up, setUp] = useState(0);
  const [ft, bumpFt] = useBump();
  const gain = (n: number) => {
    bumpFt();
    const next = xp + n;
    if (next >= 100) { setXp(100); setTimeout(() => { setLvl((l) => l + 1); setXp(next - 100); setUp((u) => u + 1); }, 650); }
    else setXp(next);
  };
  const titles = ["Rookie", "Chartist", "Swing Trader", "Market Maker", "Whale"];
  return (
    <AssetCard id="GAM-04" title="XP Bar & Level Up" desc="Прогресс опыта с переполнением, лучи и медаль нового уровня." tags={["xp", "level", "reward"]}>
      <div className="relative flex items-center gap-4">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center">
          {up > 0 && <div key={up} className="absolute inset-[-18px] rounded-full opacity-70" style={{ background: "repeating-conic-gradient(#ffc53d55 0 10deg, transparent 10deg 30deg)", animation: "rays 6s linear infinite, fadeIn .3s" }} />}
          <div key={`m${up}`} className={cn("relative grid h-20 w-20 place-items-center rounded-[26px] bg-gradient-to-b from-gold to-gold-edge shadow-[0_5px_0_#8a5c00,0_0_30px_#ffc53d55,inset_0_2px_0_#fff8]", up > 0 && "anim-pop")}>
            <span className="font-mono text-3xl font-extrabold text-ink-900">{lvl}</span>
            <span className="absolute -bottom-2 rounded-md bg-ink-900 px-1.5 text-[9px] font-extrabold uppercase tracking-wider text-gold">LVL</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Rank</div>
          <div className="text-lg font-extrabold text-white">{titles[Math.floor((lvl - 10) / 2) % titles.length]}</div>
          <div className="relative mt-2">
            <ProgressBar value={xp} color="gold" h={18} />
            <FloatText trigger={ft} text="+XP" color="#ffc53d" />
            <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-extrabold text-white text-3d">{xp} / 100 XP</span>
          </div>
        </div>
      </div>
      {up > 0 && <div key={`t${up}`} className="anim-pop mt-4 rounded-xl bg-gold/15 py-2 text-center text-sm font-extrabold uppercase tracking-widest text-gold text-glow-gold">Level up! Unlocked: Futures 101</div>}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Btn v="gold" size="sm" onClick={() => gain(10)}>+10</Btn>
        <Btn v="gold" size="sm" onClick={() => gain(25)}>+25</Btn>
        <Btn v="violet" size="sm" onClick={() => gain(50)}>2× +50</Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── STREAK WEEK ───────── */
function StreakWeek() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const [done, setDone] = useState([true, true, true, false, false, false, false]);
  const [frozen, setFrozen] = useState<number | null>(null);
  const today = done.indexOf(false);
  const count = done.filter(Boolean).length + 23;
  return (
    <AssetCard id="GAM-05" title="Streak Calendar" desc="Неделя стрика: тапни сегодняшний день, используй заморозку. Пламя растёт со стриком." tags={["streak", "calendar", "retention"]}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-flame/30 blur-xl" />
          <Icon name="flame" size={70} variant="solid" className="anim-flame relative text-flame drop-shadow-[0_0_14px_#ff8a3d]" />
        </div>
        <div>
          <div key={count} className="anim-pop font-mono text-4xl font-extrabold text-flame">{count}</div>
          <div className="text-sm font-extrabold text-white">day streak</div>
          <div className="text-xs text-ink-400">Top 3% трейдеров недели</div>
        </div>
      </div>
      <div className="raised mt-4 flex justify-between rounded-2xl p-3">
        {days.map((d, i) => {
          const isToday = i === today;
          const isFrozen = frozen === i;
          return (
            <button key={i} onClick={() => isToday && setDone(done.map((x, j) => (j === i ? true : x)))} className="flex flex-col items-center gap-1.5">
              <span className={cn("text-[10px] font-extrabold", isToday ? "text-flame" : "text-ink-400")}>{d}</span>
              <span className={cn("grid h-9 w-9 place-items-center rounded-full transition-all",
                done[i] ? "bg-gradient-to-b from-flame to-flame-edge shadow-[0_3px_0_#a33a0d]" : isFrozen ? "bg-sky/30 ring-2 ring-sky" : isToday ? "well ring-2 ring-flame/60" : "well")}>
                {done[i] ? <Icon key={String(done[i])} name="check" size={16} stroke={3.4} className="anim-pop text-white" /> : isFrozen ? <Icon name="snow" size={16} className="text-sky" /> : isToday ? <span className="h-2 w-2 rounded-full bg-flame anim-heartbeat" /> : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn v="flame" size="sm" disabled={today < 0} onClick={() => today >= 0 && setDone(done.map((x, j) => (j === today ? true : x)))}>Practice</Btn>
        <Btn v="sky" size="sm" onClick={() => setFrozen(today >= 0 ? Math.min(6, today + 1) : null)}><Icon name="snow" size={14} />Freeze</Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── QUESTS ───────── */
function Quests() {
  const [q, setQ] = useState([
    { t: "Earn 50 XP", icon: "bolt", c: "gold" as const, v: 30, max: 50 },
    { t: "Win 3 predictions", icon: "target", c: "bull" as const, v: 1, max: 3 },
    { t: "Perfect lesson", icon: "star", c: "sky" as const, v: 0, max: 1 },
  ]);
  const [opened, setOpened] = useState(false);
  const all = q.every((x) => x.v >= x.max);
  const step = (i: number) => setQ(q.map((x, j) => (j === i ? { ...x, v: Math.min(x.max, x.v + Math.ceil(x.max / 3)) } : x)));
  return (
    <AssetCard id="GAM-06" title="Daily Quests" desc="Список заданий с прогрессом. Тапни задание — прогресс. Все выполнены → сундук открывается." tags={["quests", "daily", "progress"]}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-white">Daily Quests</span>
        <span className="flex items-center gap-1 font-mono text-xs font-bold text-ink-400"><Icon name="clock" size={14} />7h 12m</span>
      </div>
      <div className="space-y-3">
        {q.map((x, i) => {
          const d = x.v >= x.max;
          return (
            <button key={x.t} onClick={() => step(i)} className="raised flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform active:translate-y-0.5">
              <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", d ? "bg-bull/20" : "bg-ink-900/60")}>
                <Icon name={d ? "check" : x.icon} size={22} variant="duo" stroke={d ? 3 : 2.2} className={d ? "anim-pop text-bull" : `text-${x.c}`} />
              </span>
              <div className="flex-1">
                <div className="mb-1.5 flex justify-between text-sm font-extrabold text-ink-100"><span>{x.t}</span><span className="font-mono text-xs text-ink-400">{x.v}/{x.max}</span></div>
                <ProgressBar value={(x.v / x.max) * 100} color={d ? "bull" : x.c} h={12} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-ink-900/50 p-3">
        <div className="text-xs font-bold text-ink-300">{all ? (opened ? "Награда получена: 120 гемов" : "Сундук готов!") : "Выполни все задания"}</div>
        <button disabled={!all} onClick={() => setOpened(true)} className={cn("relative", all && !opened && "anim-heartbeat")}>
          <ChestSvg open={opened} size={52} dim={!all} />
          {opened && <Burst trigger={1} colors={["#a174ff", "#ffc53d"]} />}
        </button>
      </div>
    </AssetCard>
  );
}

function ChestSvg({ open, size = 90, dim }: { open: boolean; size?: number; dim?: boolean }) {
  return (
    <svg viewBox="0 0 100 90" width={size} height={size * 0.9} className={cn("overflow-visible", dim && "opacity-40 grayscale")}>
      <defs>
        <linearGradient id="cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" /><stop offset="1" stopColor="#5b34c4" /></linearGradient>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#e09a10" /></linearGradient>
      </defs>
      {open && <ellipse cx="50" cy="42" rx="34" ry="14" fill="#ffc53d" opacity=".6" style={{ filter: "blur(6px)" }} />}
      <rect x="12" y="42" width="76" height="42" rx="8" fill="#3b1f8f" />
      <rect x="12" y="40" width="76" height="40" rx="8" fill="url(#cb)" />
      <rect x="44" y="40" width="12" height="40" fill="url(#cg)" />
      <g style={{ transformOrigin: "50px 40px", transform: open ? "rotate(-28deg) translate(-8px,-10px)" : "none", transition: "transform .5s cubic-bezier(.3,1.6,.5,1)" }}>
        <path d="M12 40V28a16 16 0 0 1 16-16h44a16 16 0 0 1 16 16v12z" fill="url(#cb)" stroke="#3b1f8f" strokeWidth="2" />
        <rect x="44" y="12" width="12" height="28" fill="url(#cg)" />
        <path d="M22 20q28-8 56 0" stroke="#fff" strokeOpacity=".35" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <rect x="42" y="38" width="16" height="14" rx="4" fill="url(#cg)" stroke="#a86d00" strokeWidth="2" />
    </svg>
  );
}

/* ───────── REWARD CHEST ───────── */
function RewardChest() {
  const [st, setSt] = useState<"closed" | "shaking" | "open">("closed");
  const [reward, setReward] = useState(0);
  const r = useCountUp(reward, 1200);
  const tap = () => {
    if (st !== "closed") { setSt("closed"); setReward(0); return; }
    setSt("shaking");
    setTimeout(() => { setSt("open"); setReward(80 + Math.floor(Math.random() * 120)); }, 900);
  };
  return (
    <AssetCard id="GAM-07" title="Reward Chest Opening" desc="Предвкушение → тряска → открытие со светом, частицами и count-up наградой." tags={["chest", "loot", "reward"]}>
      <div className="relative flex h-60 flex-col items-center justify-center">
        {st === "open" && <div className="absolute h-56 w-56 rounded-full" style={{ background: "repeating-conic-gradient(#ffc53d33 0 12deg, transparent 12deg 30deg)", animation: "rays 8s linear infinite", maskImage: "radial-gradient(circle, #000 30%, transparent 70%)" }} />}
        <button onClick={tap} className="relative" style={{ animation: st === "shaking" ? "chestShake .3s ease-in-out infinite" : st === "closed" ? "floaty 2.4s ease-in-out infinite" : undefined }}>
          <ChestSvg open={st === "open"} size={130} />
          {st === "open" && <Burst trigger={reward} colors={["#a174ff", "#ffc53d", "#2ee59d"]} count={18} spread={110} />}
        </button>
        <div className="relative mt-3 h-10 text-center">
          {st === "open" ? (
            <div className="anim-pop flex items-center gap-2 font-mono text-3xl font-extrabold text-violet"><Icon name="gem" size={28} variant="solid" />+{Math.round(r)}</div>
          ) : (
            <div className="text-sm font-extrabold uppercase tracking-widest text-ink-300">{st === "shaking" ? "Opening…" : "Tap to open"}</div>
          )}
        </div>
      </div>
    </AssetCard>
  );
}

/* ───────── ACHIEVEMENTS ───────── */
const ACH = [
  { t: "First Trade", d: "Совершить первую сделку", icon: "rocket", tier: "bronze", p: 100 },
  { t: "Iron Hands", d: "Держать позицию 7 дней", icon: "shield", tier: "silver", p: 100 },
  { t: "Sharpshooter", d: "10 прогнозов подряд", icon: "target", tier: "gold", p: 70 },
  { t: "Whale", d: "Портфель $100k (демо)", icon: "crown", tier: "diamond", p: 25 },
];
const TIER: Record<string, [string, string, string]> = {
  bronze: ["#e59a64", "#a4592b", "#5a2d10"], silver: ["#d7e0f2", "#8e9bbd", "#4a5577"], gold: ["#ffd76a", "#d99a0b", "#7a5200"], diamond: ["#7ee8ff", "#3d8bff", "#1a3aa0"],
};
function Achievements() {
  const [flip, setFlip] = useState<number | null>(null);
  return (
    <AssetCard id="GAM-08" title="Achievement Badges" desc="4 тира медалей. Незавершённые — с кольцом прогресса. Тап переворачивает карточку." tags={["achievements", "badges", "tiers"]}>
      <div className="grid grid-cols-2 gap-3">
        {ACH.map((a, i) => {
          const [c1, c2, c3] = TIER[a.tier];
          const locked = a.p < 100;
          const f = flip === i;
          return (
            <button key={a.t} onClick={() => setFlip(f ? null : i)} className="h-40" style={{ perspective: 800 }}>
              <div className="relative h-full w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: f ? "rotateY(180deg)" : "none" }}>
                <div className="raised absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl p-2" style={{ backfaceVisibility: "hidden" }}>
                  <div className="relative">
                    <svg width="76" height="76" viewBox="0 0 76 76" className="absolute -inset-1.5 -rotate-90" style={{ width: 88, height: 88, left: -6, top: -6 }}>
                      <circle cx="38" cy="38" r="35" stroke="#0a1433" strokeWidth="4" fill="none" />
                      <circle cx="38" cy="38" r="35" stroke={c1} strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={220} strokeDashoffset={220 - (220 * a.p) / 100} />
                    </svg>
                    <div className={cn("grid h-[76px] w-[76px] place-items-center", locked && "opacity-50 grayscale-[.6]")}
                      style={{ clipPath: "polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)", background: `linear-gradient(160deg, ${c1}, ${c2} 60%, ${c3})` }}>
                      <Icon name={a.icon} size={32} variant="duo" stroke={2.4} className="text-white drop-shadow-[0_2px_0_rgba(0,0,0,.3)]" />
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-white">{a.t}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-widest" style={{ color: c1 }}>{a.tier} {locked && `· ${a.p}%`}</div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: `linear-gradient(160deg, ${c2}, ${c3})`, boxShadow: `0 5px 0 ${c3}` }}>
                  <Icon name={locked ? "lock" : "check"} size={22} stroke={3} className="text-white" />
                  <div className="text-xs font-extrabold text-white">{a.d}</div>
                  <div className="font-mono text-[10px] font-bold text-white/80">{locked ? `Прогресс ${a.p}%` : "Получено 12.03"}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ───────── LEAGUE ───────── */
function League() {
  const [rows, setRows] = useState([
    { n: "Satoshi_N", xp: 1840, c: "#ffc53d" }, { n: "Vitalik.eth", xp: 1620, c: "#a174ff" }, { n: "You", xp: 1180, c: "#2ee59d" },
    { n: "CZ_fan", xp: 1250, c: "#3d8bff" }, { n: "HODLqueen", xp: 990, c: "#ff4d6a" }, { n: "DiamondPaws", xp: 870, c: "#ff8a3d" },
  ]);
  const sorted = [...rows].sort((a, b) => b.xp - a.xp);
  const me = sorted.findIndex((r) => r.n === "You");
  const H = 52;
  return (
    <AssetCard id="GAM-09" title="League Leaderboard" desc="Недельная лига: зона повышения, анимированная перестановка строк при наборе XP." tags={["league", "leaderboard", "social"]}>
      <div className="mb-3 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-[#7ee8ff] to-sky-edge shadow-[0_4px_0_#1a3aa0]"><Icon name="gem" size={24} variant="solid" className="text-white" /></div>
        <div className="flex-1"><div className="text-sm font-extrabold text-white">Diamond League</div><div className="text-xs text-ink-400">Топ-3 переходят в Master · 2д 4ч</div></div>
      </div>
      <div className="relative" style={{ height: sorted.length * H + 14 }}>
        {rows.map((r) => {
          const idx = sorted.indexOf(r);
          const you = r.n === "You";
          return (
            <div key={r.n} className={cn("absolute inset-x-0 flex h-12 items-center gap-3 rounded-2xl px-3 transition-all duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]", you ? "raised z-10 ring-2 ring-bull" : "")}
              style={{ top: idx * H + (idx >= 3 ? 14 : 0) }}>
              <span className={cn("w-6 text-center font-mono text-sm font-extrabold", idx < 3 ? "text-bull" : "text-ink-400")}>{idx < 3 ? <Icon name="medal" size={20} className={["text-gold", "text-ink-200", "text-[#e59a64]"][idx]} /> : idx + 1}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold text-ink-900" style={{ background: r.c, boxShadow: `0 2px 0 ${r.c}88` }}>{r.n[0]}</span>
              <span className={cn("flex-1 truncate text-sm font-extrabold", you ? "text-bull" : "text-ink-100")}>{r.n}</span>
              <span className="font-mono text-xs font-bold text-ink-300">{r.xp} XP</span>
            </div>
          );
        })}
        <div className="absolute inset-x-2 flex items-center gap-2" style={{ top: 3 * H + 1 }}>
          <span className="h-px flex-1 bg-bull/40" /><span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-bull"><Icon name="up" size={10} stroke={3} />Promotion zone</span><span className="h-px flex-1 bg-bull/40" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-ink-300">Твоё место: <b className="text-white">#{me + 1}</b></span>
        <Btn v="bull" size="sm" onClick={() => setRows(rows.map((r) => (r.n === "You" ? { ...r, xp: r.xp + 240 } : { ...r, xp: r.xp + Math.floor(Math.random() * 60) })))}>+240 XP</Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── MASCOT ───────── */
const LINES: Record<Mood, string> = {
  idle: "Готов разобрать новый паттерн?",
  happy: "Отличная сделка! Риск под контролем.",
  sad: "Стоп-лосс сработал. Это часть игры.",
  think: "Хм… объём не подтверждает пробой.",
  wow: "Ого! +12% за день. Фиксируем?",
  cool: "HODL. Мы здесь надолго.",
};
function MascotStates() {
  const [m, setM] = useState<Mood>("idle");
  return (
    <AssetCard id="GAM-10" title="Mascot «Pip» · 6 moods" desc="Бык-бот с визором: эмоции синхронизированы с событиями рынка. Не детский — аватар-компаньон." tags={["mascot", "character", "emotion"]}>
      <div className="flex items-center gap-3">
        <div className="shrink-0"><Mascot key={m} mood={m} size={110} className="anim-pop" /></div>
        <div key={`b${m}`} className="anim-fade-up relative rounded-2xl rounded-bl-md bg-white p-3 text-sm font-bold text-ink-900 shadow-[0_4px_0_#c3cdea]">
          {LINES[m]}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(Object.keys(LINES) as Mood[]).map((k) => (
          <button key={k} onClick={() => setM(k)} className={cn("rounded-xl py-2 text-[11px] font-extrabold uppercase tracking-wider transition-all", m === k ? "raised -translate-y-0.5 text-white ring-2 ring-sky" : "bg-ink-800 text-ink-400 hover:text-ink-200")}>{k}</button>
        ))}
      </div>
    </AssetCard>
  );
}

export default function Gamification() {
  return (
    <Section id="game" num="03" title="Game Layer" subtitle="Прогрессия, мотивация и награды — ядро обучения через игру">
      <LessonPath />
      <Quiz />
      <Currencies />
      <XpLevel />
      <StreakWeek />
      <Quests />
      <RewardChest />
      <Achievements />
      <League />
      <MascotStates />
    </Section>
  );
}
