import { useEffect, useRef, useState } from "react";
import { Timer, Gift, Swords, Zap, Skull, Check, Dices } from "lucide-react";
import { Asset, Section, Btn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { FlameIcon, GemIcon, CoinIcon, ChestIcon, TrophyIcon, StarIcon, BoltIcon, HeartIcon } from "../kit/GameIcons";
import { Confetti } from "./Rewards";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ============ TR-01 DAILY TRIALS ============ */
function useCountdown() {
  const [left, setLeft] = useState(() => {
    const n = new Date();
    const mid = new Date(n);
    mid.setHours(24, 0, 0, 0);
    return Math.floor((mid.getTime() - n.getTime()) / 1000);
  });
  useEffect(() => { const t = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000); return () => clearInterval(t); }, []);
  const h = String(Math.floor(left / 3600)).padStart(2, "0"), m = String(Math.floor((left % 3600) / 60)).padStart(2, "0"), s = String(left % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
function DailyTrials() {
  const cd = useCountdown();
  const [tasks, setTasks] = useState([
    { n: "Пройди 1 урок", p: 1, max: 1, xp: 30 },
    { n: "Выиграй 2 дуэли", p: 1, max: 2, xp: 50 },
    { n: "Заработай 100 XP", p: 64, max: 100, xp: 40 },
  ]);
  const [claimed, setClaimed] = useState<number[]>([]);
  const bump = (i: number) => {
    setTasks((t) => t.map((x, k) => (k === i ? { ...x, p: Math.min(x.max, x.p + (x.max > 5 ? 12 : 1)) } : x)));
    sfx.tick();
  };
  const claim = (i: number) => {
    if (tasks[i].p < tasks[i].max || claimed.includes(i)) return;
    setClaimed([...claimed, i]);
    sfx.coin();
  };
  const all = tasks.every((_, i) => claimed.includes(i));
  return (
    <Asset code="TR-01" title="Daily Trials" desc="Три испытания дня с живым таймером до сброса. Прогресс, награды, бонус за полное закрытие." hint="Добей и забери" specs={["countdown", "3 tasks", "all-clear bonus"]}>
      <div className="mb-3 flex items-center justify-between">
        <Chip tone="gold"><Timer size={11} /> reset in {cd}</Chip>
        <span className="num text-[11px] text-mist">{claimed.length}/3 claimed</span>
      </div>
      <div className="space-y-2.5">
        {tasks.map((t, i) => {
          const done = t.p >= t.max, got = claimed.includes(i);
          return (
            <div key={t.n} className={cn("rounded-2xl p-3 transition", got ? "bg-ink-800/40" : "bg-ink-800 shadow-[0_4px_0_#08112a]", done && !got && "ring-2 ring-gold")} style={done && !got ? { animation: "glow-pulse 1.6s infinite" } : undefined}>
              <div className="flex items-center justify-between text-[13px] font-extrabold">
                <span className={got ? "text-mist line-through" : ""}>{t.n}</span>
                <span className="num text-[11px] text-gold">+{t.xp} XP</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1"><Bar value={(t.p / t.max) * 100} tone={got ? "sky" : "bull"} h={10} glow={false} /></div>
                <span className="num text-[10px] text-mist">{t.p}/{t.max}</span>
                {!done ? <button onClick={() => bump(i)} className="h-9 rounded-xl bg-ink-700 px-3 text-[11px] font-extrabold shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none">Do</button>
                  : got ? <span className="text-bull"><Check size={18} /></span>
                    : <button onClick={() => claim(i)} className="btn3d !h-9 !rounded-xl !px-3 !text-[10px]" style={{ ["--c" as string]: "var(--color-gold)", ["--cd" as string]: "var(--color-gold-d)", color: "#3b2600" }}>Claim</button>}
              </div>
            </div>
          );
        })}
      </div>
      {all && <div className="anim-pop mt-3 rounded-2xl bg-gradient-to-r from-gold/25 to-ember/25 p-3 text-center text-[13px] font-extrabold text-gold">🎉 All clear! Bonus chest unlocked</div>}
    </Asset>
  );
}

/* ============ TR-02 STREAK LADDER ============ */
const ladder = [
  { d: 1, r: "+10 XP", I: BoltIcon },
  { d: 2, r: "+25 XP", I: BoltIcon },
  { d: 3, r: "+50 💎", I: GemIcon },
  { d: 4, r: "+80 XP", I: StarIcon },
  { d: 5, r: "Chest", I: ChestIcon },
  { d: 6, r: "+150 💎", I: GemIcon },
  { d: 7, r: "🏆 +500 XP", I: TrophyIcon },
];
function StreakLadder() {
  const [day, setDay] = useState(3);
  const [claimed, setClaimed] = useState([0, 1, 2]);
  const claim = (i: number) => {
    if (i > day || claimed.includes(i)) return;
    setClaimed([...claimed, i]);
    sfx.coin();
  };
  return (
    <Asset code="TR-02" title="7-Day Streak Ladder" desc="Лестница наград за серию входов. Текущий день пульсирует, будущие закрыты, награды забираются." hint="Забирай по дням" specs={["7 rungs", "pulse today", "claim"]}>
      <div className="flex items-center gap-3">
        <FlameIcon size={54} className="anim-flame" />
        <div><div className="num text-3xl font-black text-ember">{day + 1}</div><div className="text-[11px] font-bold text-mist">day streak</div></div>
        <div className="ml-auto flex gap-1">
          <button onClick={() => { setDay((d) => Math.max(0, d - 1)); sfx.soft(); }} className="h-8 rounded-lg bg-ink-800 px-2 text-[11px] font-bold text-mist">−</button>
          <button onClick={() => { setDay((d) => Math.min(6, d + 1)); sfx.correct(); }} className="h-8 rounded-lg bg-ink-800 px-2 text-[11px] font-bold text-mist">+ day</button>
        </div>
      </div>
      <div className="relative mt-4">
        <div className="absolute bottom-6 left-4 right-4 top-6 w-1 rounded-full bg-ink-700" />
        <div className="absolute bottom-6 left-4 right-4 top-6 w-1 rounded-full bg-gradient-to-b from-ember to-gold transition-all" style={{ height: `${(day / 6) * 100}%`, top: "auto" }} />
        <div className="relative space-y-2">
          {ladder.map((l, i) => {
            const past = i < day, now = i === day, got = claimed.includes(i);
            return (
              <button key={l.d} onClick={() => claim(i)} disabled={i > day || got} className={cn("flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition", now && !got ? "bg-ember/15 ring-2 ring-ember" : past ? "bg-ink-800" : "bg-ink-800/50 opacity-60")} style={now && !got ? { animation: "glow-pulse 1.8s infinite" } : undefined}>
                <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", past || now ? "bg-gradient-to-b from-gold to-gold-d shadow-[0_3px_0_#8a5c08]" : "bg-ink-700")}>
                  {got ? <Check size={18} strokeWidth={3.5} className="text-bull" /> : <l.I size={26} style={{ filter: past || now ? undefined : "grayscale(1)" }} />}
                </span>
                <span className="flex-1"><span className="block text-[12px] font-extrabold">Day {l.d}</span><span className="num block text-[11px] text-gold">{l.r}</span></span>
                {now && !got && <span className="rounded-lg bg-ember px-2 py-1 text-[10px] font-extrabold">CLAIM</span>}
              </button>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

/* ============ TR-03 BOSS RUSH ============ */
const bosses = [
  { n: "Paper Hands", hp: 60, c: "#8a9bc4", q: ["Хранить seed в облаке — норма?", "Плечо 100x для новичка — ок?"], a: [false, false] },
  { n: "FOMO Demon", hp: 80, c: "#ff8a3d", q: ["Покупать на хаях без плана — стратегия?", "Стоп-лосс ограничивает убыток?"], a: [false, true] },
  { n: "Liquidator", hp: 100, c: "#ff4f6d", q: ["Маржин-колл — это подарок биржи?", "Риск 1% переживает серию убытков?"], a: [false, true] },
];
function BossRush() {
  const [bi, setBi] = useState(0);
  const [hp, setHp] = useState(bosses[0].hp);
  const [qi, setQi] = useState(0);
  const [me, setMe] = useState(5);
  const [flash, setFlash] = useState<null | boolean>(null);
  const [won, setWon] = useState(false);
  const b = bosses[bi];
  const answer = (v: boolean) => {
    if (won || me <= 0) return;
    const ok = b.a[qi % b.a.length] === v;
    setFlash(ok);
    setTimeout(() => setFlash(null), 300);
    if (ok) {
      const dmg = 34;
      sfx.correct();
      if (hp - dmg <= 0) {
        if (bi + 1 >= bosses.length) { setWon(true); sfx.levelUp(); }
        else { setBi((x) => x + 1); setHp(bosses[bi + 1].hp); sfx.levelUp(); }
      } else setHp((h) => h - dmg);
    } else { setMe((m) => m - 1); sfx.wrong(); }
    setQi((x) => x + 1);
  };
  const reset = () => { setBi(0); setHp(bosses[0].hp); setQi(0); setMe(5); setWon(false); };
  return (
    <Asset code="TR-03" title="Boss Rush · 3 in a Row" desc="Три босса подряд на одних жизнях. Правда/ложь — твоё оружие, ошибка стоит сердца." hint="Пройди всех троих" specs={["3 bosses", "shared lives", "TF combat"]}>
      <div className={cn("rounded-2xl p-4 transition-colors", flash === true ? "bg-bull/15" : flash === false ? "bg-bear/15" : "bg-ink-900/60")}>
        <div className="flex items-center gap-1.5">
          {bosses.map((x, i) => <span key={x.n} className={cn("flex h-7 flex-1 items-center justify-center gap-1 rounded-lg text-[9px] font-extrabold uppercase", i < bi ? "bg-bull/20 text-bull" : i === bi ? "text-white" : "bg-ink-800 text-mist")} style={i === bi ? { background: x.c } : undefined}>{i < bi ? "✓" : x.n}</span>)}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] font-extrabold"><span style={{ color: b.c }}>{b.n}</span><span className="num">{Math.max(0, hp)}/{b.hp}</span></div>
        <div className="mt-1 h-3.5 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${(hp / b.hp) * 100}%`, background: b.c, boxShadow: `0 0 12px ${b.c}` }} /></div>
        <div className="mt-2 flex gap-0.5">{[...Array(5)].map((_, i) => <HeartIcon key={i} size={20} empty={i >= me} />)}</div>
        {won ? (
          <div className="anim-pop py-4 text-center"><TrophyIcon size={64} className="mx-auto anim-float" /><div className="font-display text-lg font-black text-gold">RUSH CLEARED</div></div>
        ) : me <= 0 ? (
          <div className="anim-pop py-4 text-center"><Mascot size={80} mood="sad" /><div className="font-display text-lg font-black text-bear">WIPED OUT</div></div>
        ) : (
          <div key={qi} className="anim-slide-right mt-3 text-center font-display text-[15px] font-extrabold leading-snug">{b.q[qi % b.q.length]}</div>
        )}
      </div>
      {!won && me > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Btn tone="bear" onClick={() => answer(false)} silent>False</Btn>
          <Btn tone="bull" onClick={() => answer(true)} silent>True</Btn>
        </div>
      ) : (
        <Btn tone="sky" block size="sm" className="mt-3" onClick={reset}><Swords size={14} /> Run it back</Btn>
      )}
    </Asset>
  );
}

/* ============ TR-04 TIME ATTACK ============ */
function TimeAttack() {
  const [t, setT] = useState(60);
  const [run, setRun] = useState(false);
  const [pnl, setPnl] = useState(0);
  const [trades, setTrades] = useState(0);
  const [, setPrice] = useState(100);
  const [hist, setHist] = useState<number[]>([100]);
  useEffect(() => {
    if (!run) return;
    const i = setInterval(() => {
      setT((v) => { if (v <= 1) { clearInterval(i); setRun(false); sfx.levelUp(); return 0; } return v - 1; });
      setPrice((p) => { const n = p + (Math.random() - 0.5) * 3; setHist((h) => [...h.slice(-40), n]); return n; });
    }, 500);
    return () => clearInterval(i);
  }, [run]);
  const trade = (long: boolean) => {
    if (!run) return;
    const move = (Math.random() - 0.42) * (long ? 6 : 6) * (long ? 1 : 1);
    const r = Math.round(move * 10);
    setPnl((p) => p + r);
    setTrades((x) => x + 1);
    r >= 0 ? sfx.correct() : sfx.wrong();
  };
  const mn = Math.min(...hist), mx = Math.max(...hist);
  const pts = hist.map((v, i) => `${(i / (hist.length - 1)) * 300},${110 - ((v - mn) / (mx - mn || 1)) * 100}`).join(" ");
  return (
    <Asset code="TR-04" title="60s PnL Attack" desc="Минута скальпинга: цена тикает каждые полсекунды, каждый трейд мгновенно даёт или забирает." hint="Скальпируй минуту" specs={["500ms ticks", "instant settle", "score"]}>
      <div className="flex items-center justify-between">
        <span className={cn("num rounded-xl px-3 py-1.5 font-display text-xl font-black", t <= 10 && run ? "anim-pop bg-bear/20 text-bear" : "bg-ink-800")}>{t}s</span>
        <span className={cn("num text-2xl font-extrabold", pnl >= 0 ? "text-bull" : "text-bear")}>{pnl >= 0 ? "+" : ""}{pnl}</span>
        <span className="num text-[11px] text-mist">{trades} trades</span>
      </div>
      <div className="panel-inset mt-3 overflow-hidden !rounded-2xl">
        <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="h-32 w-full">
          <polyline points={pts} fill="none" stroke={pnl >= 0 ? "#22d39a" : "#ff4f6d"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <circle cx="300" cy={110 - ((hist[hist.length - 1] - mn) / (mx - mn || 1)) * 100} r="4" fill="#ffc53d" style={{ filter: "drop-shadow(0 0 6px #ffc53d)" }} />
        </svg>
      </div>
      {!run && t === 60 ? (
        <Btn tone="gold" block className="mt-4 !text-[#3b2600]" onClick={() => { setRun(true); setPnl(0); setTrades(0); }}><Zap size={16} /> Start 60s</Btn>
      ) : !run ? (
        <div className="anim-pop mt-4 text-center">
          <div className={cn("font-display text-2xl font-black", pnl >= 0 ? "text-bull" : "text-bear")}>{pnl >= 0 ? "+" : ""}{pnl} pts</div>
          <Btn tone="sky" size="sm" className="mt-2" onClick={() => { setT(60); setRun(true); setPnl(0); setTrades(0); }}>Again</Btn>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Btn tone="bear" size="lg" onClick={() => trade(false)} silent>▼ Short</Btn>
          <Btn tone="bull" size="lg" onClick={() => trade(true)} silent>▲ Long</Btn>
        </div>
      )}
    </Asset>
  );
}

/* ============ TR-05 MYSTERY BOX ============ */
const boxLoot = [
  { n: "+50 XP", c: "#3b82ff", w: 40 },
  { n: "+100 💎", c: "#2bd9ff", w: 28 },
  { n: "Chest", c: "#8b5cff", w: 16 },
  { n: "+300 💎", c: "#ffc53d", w: 10 },
  { n: "MYTHIC SKIN", c: "#ff4f6d", w: 6 },
];
function MysteryBox() {
  const [phase, setPhase] = useState<"idle" | "shaking" | "reveal">("idle");
  const [win, setWin] = useState(0);
  const [count, setCount] = useState(3);
  const open = () => {
    if (phase !== "idle" || count <= 0) return;
    const r = Math.random() * 100;
    let acc = 0, idx = 0;
    for (let i = 0; i < boxLoot.length; i++) { acc += boxLoot[i].w; if (r <= acc) { idx = i; break; } }
    setWin(idx);
    setPhase("shaking");
    setCount((c) => c - 1);
    sfxRaw.thud();
    setTimeout(() => { setPhase("reveal"); sfx.levelUp(); }, 1400);
  };
  return (
    <Asset code="TR-05" title="Mystery Box" desc="Тапни бокс — он трясётся с нарастанием, потом взрыв света и награда по честным шансам." hint="Открой бокс" specs={["build-up", "weighted loot", "3 boxes"]}>
      <div className="relative grid h-56 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_60%,#2a1f6e,#0d1730_75%)]">
        {phase === "reveal" && <Confetti />}
        <button onClick={open} disabled={phase !== "idle" || count <= 0} className="relative">
          {phase === "idle" && <Gift size={110} className="text-violet drop-shadow-[0_0_24px_rgba(139,92,255,.7)] anim-float" />}
          {phase === "shaking" && <Gift size={110} className="text-violet" style={{ animation: "chest-shake .35s ease-in-out infinite", filter: "drop-shadow(0 0 30px rgba(139,92,255,.9))" }} />}
          {phase === "reveal" && (
            <div className="anim-pop text-center">
              {win === 2 ? <ChestIcon size={110} open /> : <CoinIcon size={110} />}
              <div className="font-display mt-1 text-xl font-black" style={{ color: boxLoot[win].c, textShadow: `0 0 18px ${boxLoot[win].c}` }}>{boxLoot[win].n}</div>
            </div>
          )}
        </button>
        <div className="absolute bottom-3 flex gap-1.5">{[...Array(3)].map((_, i) => <span key={i} className={cn("h-2 w-8 rounded-full", i < count ? "bg-violet shadow-[0_0_8px_#8b5cff]" : "bg-ink-600")} />)}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {boxLoot.map((l) => <span key={l.n} className="num rounded-md px-1.5 py-0.5 text-[9px] font-bold" style={{ color: l.c, background: `${l.c}18` }}>{l.n} · {l.w}%</span>)}
      </div>
      <Btn tone={phase === "reveal" ? "sky" : "violet"} block size="sm" className="mt-3" disabled={count <= 0 && phase !== "reveal"} onClick={() => { if (phase === "reveal") { if (count > 0) { setPhase("idle"); } } else open(); }}>
        {phase === "reveal" ? (count > 0 ? "Next box" : "No boxes left") : `Open · ${count} left`}
      </Btn>
    </Asset>
  );
}

/* ============ TR-06 SURVIVAL ============ */
function Survival() {
  const [lvl, setLvl] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [a, setA] = useState<[number, number]>([12, 7]);
  const [opts, setOpts] = useState<number[]>([]);
  const [run, setRun] = useState(false);
  const [over, setOver] = useState(false);
  const [t, setT] = useState(0);
  const timer = useRef<number>(0);
  const newQ = (l: number) => {
    const x = Math.floor(Math.random() * (10 + l * 6)) + 5;
    const y = Math.floor(Math.random() * (8 + l * 4)) + 3;
    const ans = x + y;
    const set = new Set([ans]);
    while (set.size < 4) set.add(ans + Math.floor(Math.random() * 11) - 5);
    setA([x, y]);
    setOpts([...set].sort(() => Math.random() - 0.5));
    const limit = Math.max(3, 9 - l * 0.5);
    setT(limit);
    clearInterval(timer.current);
    timer.current = window.setInterval(() => setT((v) => {
      if (v <= 0.2) {
        clearInterval(timer.current);
        miss();
        return 0;
      }
      return +(v - 0.2).toFixed(1);
    }), 200);
  };
  const miss = () => {
    sfx.wrong();
    setLives((l) => {
      if (l - 1 <= 0) { setOver(true); setRun(false); clearInterval(timer.current); return 0; }
      return l - 1;
    });
    if (lives - 1 > 0) setTimeout(() => newQ(lvl), 350);
  };
  const pick = (o: number) => {
    clearInterval(timer.current);
    if (o === a[0] + a[1]) {
      const pts = Math.round(10 * lvl + t * 3);
      setScore((s) => s + pts);
      sfx.correct();
      const nl = lvl + 1;
      setLvl(nl);
      setTimeout(() => newQ(nl), 250);
    } else miss();
  };
  const start = () => { setLvl(1); setLives(3); setScore(0); setOver(false); setRun(true); newQ(1); };
  useEffect(() => () => clearInterval(timer.current), []);
  const limit = Math.max(3, 9 - lvl * 0.5);
  return (
    <Asset code="TR-06" title="Math Survival" desc="Быстрый счёт для трейдера: время сжимается с каждым уровнем, три жизни, очки за скорость." hint="Считай быстро" specs={["shrinking timer", "3 lives", "score"]}>
      <div className="flex items-center justify-between">
        <Chip tone="violet"><Skull size={11} /> Lv {lvl}</Chip>
        <div className="flex gap-0.5">{[...Array(3)].map((_, i) => <HeartIcon key={i} size={20} empty={i >= lives} />)}</div>
        <span key={score} className="num anim-pop text-xl font-extrabold text-gold">{score}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full bg-gradient-to-r from-bull to-bear transition-all duration-200" style={{ width: `${(t / limit) * 100}%` }} /></div>
      <div className="grid h-44 place-items-center">
        {!run && !over && <div className="text-center"><Dices size={40} className="mx-auto text-violet anim-float" /><div className="mt-2 text-[12px] text-mist">Считай сумму быстрее таймера</div></div>}
        {over && <div className="anim-pop text-center"><div className="font-display text-2xl font-black">Game over</div><div className="num text-gold">{score} pts · level {lvl}</div></div>}
        {run && (
          <div key={`${lvl}-${a[0]}`} className="anim-pop text-center">
            <div className="num text-5xl font-black">{a[0]} + {a[1]} = ?</div>
            <div className="num mt-1 text-sm text-bear">{t.toFixed(1)}s</div>
          </div>
        )}
      </div>
      {run ? (
        <div className="grid grid-cols-4 gap-2">
          {opts.map((o) => <button key={o} onClick={() => pick(o)} className="num h-12 rounded-xl bg-ink-700 text-base font-extrabold shadow-[0_3px_0_#08112a] transition active:translate-y-[3px] active:shadow-none">{o}</button>)}
        </div>
      ) : (
        <Btn tone="violet" block onClick={start}>{over ? "Try again" : "Start survival"}</Btn>
      )}
    </Asset>
  );
}

export default function Trials() {
  return (
    <Section id="trials" index="TR" title="Daily Trials & Survival" subtitle="Испытания на каждый день: таймеры, серии, боссы, скорость, удача, выживание">
      <DailyTrials />
      <StreakLadder />
      <BossRush />
      <TimeAttack />
      <MysteryBox />
      <Survival />
    </Section>
  );
}
