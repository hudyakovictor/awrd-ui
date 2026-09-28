import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Play, RotateCcw, Swords, Brain, PieChart, Crosshair } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { HeartIcon, GemIcon, CoinIcon, ShieldIcon, FlameIcon, TargetIcon, TrophyIcon, BoltIcon } from "../kit/GameIcons";
import { clamp } from "../kit/motion";
import { useGame } from "../kit/game";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ======================================================================
   P-15  WICK CATCHER — arcade: catch green candles, dodge red ones
   ==================================================================== */
type Drop = { id: number; x: number; y: number; v: number; good: boolean; w: number };
function WickCatcher() {
  const [run, setRun] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [px, setPx] = useState(50);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(25);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; good: boolean }[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const pxRef = useRef(50);
  pxRef.current = px;
  const idRef = useRef(1);
  const dropsRef = useRef<Drop[]>([]);
  const { celebrate } = useGame();

  useEffect(() => {
    if (!run) return;
    dropsRef.current = [];
    let raf = 0, last = performance.now(), spawn = 0;
    const loop = (t: number) => {
      const dt = Math.min(40, t - last) / 16.7;
      last = t;
      spawn += dt;
      let next = dropsRef.current.map((d) => ({ ...d, y: d.y + d.v * dt }));
      if (spawn > 18) {
        spawn = 0;
        next.push({ id: idRef.current++, x: 8 + Math.random() * 84, y: -8, v: 0.55 + Math.random() * 0.5, good: Math.random() > 0.35, w: 6 + Math.random() * 3 });
      }
      const caught: Drop[] = [];
      next = next.filter((d) => {
        if (d.y > 82 && d.y < 92 && Math.abs(d.x - pxRef.current) < 11) { caught.push(d); return false; }
        return d.y < 105;
      });
      dropsRef.current = next;
      setDrops(next);
      caught.forEach((d) => {
        const id = idRef.current++;
        setPops((p) => [...p.slice(-6), { id, x: d.x, y: 84, good: d.good }]);
        setTimeout(() => setPops((p) => p.filter((z) => z.id !== id)), 600);
        if (d.good) { setScore((s) => s + 10); sfxRaw.pop(); }
        else { setLives((l) => l - 1); sfxRaw.thud(); }
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const tm = setInterval(() => setTime((v) => v - 1), 1000);
    return () => { cancelAnimationFrame(raf); clearInterval(tm); };
  }, [run]);

  useEffect(() => {
    if (!run) return;
    if (lives <= 0) { setRun(false); sfx.wrong(); }
    else if (time <= 0) { setRun(false); sfx.levelUp(); celebrate("Раунд пройден!", `${score} очков`); }
  }, [lives, time]); // eslint-disable-line

  const start = () => { setDrops([]); setScore(0); setLives(3); setTime(25); setRun(true); sfxRaw.swipe(); };
  const move = (cx: number) => { const r = box.current!.getBoundingClientRect(); setPx(clamp(((cx - r.left) / r.width) * 100, 8, 92)); };
  return (
    <Asset code="PR-15" title="Wick Catcher · Arcade" desc="Аркада: лови зелёные свечи корзиной, уворачивайся от красных. 25 секунд, 3 жизни, стрелки или палец." hint="Води корзину пальцем/мышью" specs={["rAF loop", "collision", "25s"]} className="xl:row-span-2">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-0.5">{[0, 1, 2].map((i) => <HeartIcon key={i} size={22} empty={i >= lives} />)}</div>
        <span className="num rounded-lg bg-ink-800 px-2 py-1 text-[12px] font-extrabold">{time}s</span>
        <span key={score} className="num anim-pop text-xl font-extrabold text-gold">{score}</span>
      </div>
      <div
        ref={box}
        tabIndex={0}
        onPointerMove={(e) => run && move(e.clientX)}
        onPointerDown={(e) => run && move(e.clientX)}
        onKeyDown={(e) => { if (e.key === "ArrowLeft") setPx((p) => clamp(p - 8, 8, 92)); if (e.key === "ArrowRight") setPx((p) => clamp(p + 8, 8, 92)); }}
        className="relative h-[400px] touch-none select-none overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_0%,#1d3a7a,#0a1224_75%)] outline-none focus-visible:ring-2 focus-visible:ring-sky"
      >
        <div className="grid-bg absolute inset-0 opacity-50" />
        {drops.map((d) => (
          <div key={d.id} className="absolute" style={{ left: `${d.x}%`, top: `${d.y}%`, transform: "translate(-50%,-50%)" }}>
            <div className="relative" style={{ width: d.w * 3, height: 44 }}>
              <div className="absolute -top-2 -bottom-2 left-1/2 w-0.5 -translate-x-1/2" style={{ background: d.good ? "#22d39a" : "#ff4f6d" }} />
              <div className="relative h-full rounded-md shadow-[inset_0_2px_0_rgba(255,255,255,.4)]" style={{ background: d.good ? "#22d39a" : "#ff4f6d", boxShadow: `0 0 14px ${d.good ? "#22d39a" : "#ff4f6d"}` }} />
            </div>
          </div>
        ))}
        {pops.map((p) => <span key={p.id} className="num pointer-events-none absolute text-lg font-black" style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.good ? "#22d39a" : "#ff4f6d", animation: "rise .6s ease-out forwards" }}>{p.good ? "+10" : "−❤"}</span>)}
        <div className="absolute bottom-3 h-10 w-24 -translate-x-1/2 transition-[left] duration-75" style={{ left: `${px}%` }}>
          <div className="h-full rounded-b-[22px] rounded-t-md border-2 border-gold bg-gradient-to-b from-gold/40 to-gold-d/60 shadow-[0_0_20px_rgba(255,197,61,.5),0_4px_0_#8a5c08]" />
          <CoinIcon size={22} className="absolute -top-3 left-1/2 -translate-x-1/2" />
        </div>
        {!run && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/60 backdrop-blur-[2px]">
            <div className="anim-pop text-center">
              <Mascot size={96} mood={lives <= 0 ? "sad" : score ? "hype" : "happy"} />
              <div className="font-display text-lg font-extrabold">{lives <= 0 ? "Liquidated!" : score ? `${score} points` : "Wick Catcher"}</div>
              <Btn tone="bull" size="sm" className="mt-3" onClick={start}><Play size={14} /> {score ? "Play again" : "Start"}</Btn>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-16  BOSS FIGHT EXAM — HP bar, attacks, damage numbers
   ==================================================================== */
const bossQs: { q: string; o: string[]; a: number }[] = [
  { q: "Сколько рисковать на сделку новичку?", o: ["1–2%", "10%", "50%"], a: 0 },
  { q: "Длинная нижняя тень после падения — это…", o: ["Shooting star", "Hammer", "Marubozu"], a: 1 },
  { q: "Что защищает от ликвидации?", o: ["Больше плеча", "Стоп-лосс", "Усреднение вниз"], a: 1 },
  { q: "Пробой уровня надёжнее, если…", o: ["объём высокий", "объём низкий", "свеча доджи"], a: 0 },
  { q: "Где хранить seed-фразу?", o: ["В заметках телефона", "Офлайн на бумаге", "Отправить поддержке"], a: 1 },
  { q: "Спред — это разница между…", o: ["open и close", "bid и ask", "high и low"], a: 1 },
];
function BossFight() {
  const [hp, setHp] = useState(100);
  const [me, setMe] = useState(3);
  const [qi, setQi] = useState(0);
  const [hit, setHit] = useState<{ id: number; dmg: number; crit: boolean } | null>(null);
  const [shake, setShake] = useState(0);
  const [hurt, setHurt] = useState(0);
  const [streak, setStreak] = useState(0);
  const { celebrate } = useGame();
  const over = hp <= 0 || me <= 0;
  const attack = (k: number) => {
    if (over) return;
    const q = bossQs[qi % bossQs.length];
    if (k === q.a) {
      const crit = streak >= 1;
      const dmg = crit ? 30 : 20;
      setHp((h) => Math.max(0, h - dmg));
      setHit({ id: Date.now(), dmg, crit });
      setShake((s) => s + 1);
      setStreak((s) => s + 1);
      sfx.correct();
      if (hp - dmg <= 0) setTimeout(() => { sfx.levelUp(); celebrate("Босс повержен!", "Экзамен юнита сдан"); }, 400);
    } else {
      setMe((m) => m - 1);
      setHurt((h) => h + 1);
      setStreak(0);
      sfx.wrong();
    }
    setQi((x) => x + 1);
  };
  const reset = () => { setHp(100); setMe(3); setQi(0); setStreak(0); setHit(null); };
  const q = bossQs[qi % bossQs.length];
  return (
    <Asset code="PR-16" title="Boss Fight · Unit Exam" desc="Экзамен как бой с боссом: верный ответ — удар, серия — критический урон, ошибка — босс бьёт в ответ." hint="Атакуй правильными ответами" specs={["HP bar", "crit ×1.5", "counter-attack"]}>
      <div key={hurt} className={cn("relative overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_30%,#4a1426,#0a1224_70%)] p-4", hurt && "anim-shake")}>
        {hurt > 0 && <div key={`f${hurt}`} className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(255,79,109,.7)", animation: "vignette .5s forwards" }} />}
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
          <span className="text-bear">The Bear King</span>
          <span className="num text-snow">{hp}/100</span>
        </div>
        <div className="mt-1 h-4 overflow-hidden rounded-full bg-ink-950 shadow-[inset_0_2px_4px_rgba(0,0,0,.6)]">
          <div className="h-full rounded-full bg-gradient-to-r from-bear-d to-bear transition-all duration-500" style={{ width: `${hp}%`, boxShadow: "0 0 10px #ff4f6d" }} />
        </div>
        <div className="relative mt-3 grid h-36 place-items-center">
          <div key={shake} className={cn(shake && "anim-shake")} style={{ filter: hp <= 0 ? "grayscale(1) brightness(.5)" : undefined, transform: hp <= 0 ? "rotate(-90deg) translateX(-20px)" : undefined, transition: "all .6s" }}>
            <svg viewBox="0 0 120 120" className="h-32 w-32">
              <path d="M20 40C8 34 6 18 12 8c4 12 12 16 22 18zM100 40c12-6 14-22 8-32-4 12-12 16-22 18z" fill="#c02a47" />
              <ellipse cx="60" cy="68" rx="40" ry="38" fill="#7a1a2e" />
              <ellipse cx="60" cy="64" rx="40" ry="38" fill="#a8233d" />
              <path d="M36 52l14 6M84 52l-14 6" stroke="#0a1224" strokeWidth="5" strokeLinecap="round" />
              <circle cx="44" cy="62" r="5" fill="#ffc53d" /><circle cx="76" cy="62" r="5" fill="#ffc53d" />
              <ellipse cx="60" cy="86" rx="18" ry="11" fill="#e87a8f" />
              <path d="M50 92q10-6 20 0" stroke="#4a0f1d" strokeWidth="3" fill="none" />
              <path d="M40 30l6-14 8 10 6-14 6 14 8-10 6 14z" fill="#ffc53d" stroke="#c98a12" strokeWidth="2" />
            </svg>
          </div>
          {hit && <span key={hit.id} className={cn("num pointer-events-none absolute font-black", hit.crit ? "text-3xl text-gold" : "text-2xl text-white")} style={{ animation: "rise .8s ease-out forwards", textShadow: "0 0 12px #ffc53d" }}>−{hit.dmg}{hit.crit && " CRIT!"}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">{[0, 1, 2].map((i) => <HeartIcon key={i} size={22} empty={i >= me} />)}</div>
          {streak >= 1 && !over && <Chip tone="gold"><Swords size={11} /> next hit CRIT</Chip>}
        </div>
      </div>
      {over ? (
        <div className="anim-pop mt-4 text-center">
          <div className={cn("font-display text-xl font-black", hp <= 0 ? "text-gold" : "text-bear")}>{hp <= 0 ? "VICTORY" : "DEFEATED"}</div>
          <Btn tone="sky" size="sm" className="mt-2" onClick={reset}><RotateCcw size={14} /> Fight again</Btn>
        </div>
      ) : (
        <div key={qi} className="anim-slide-right mt-4">
          <div className="text-[14px] font-extrabold leading-snug">{q.q}</div>
          <div className="mt-2.5 space-y-2">
            {q.o.map((o, k) => (
              <button key={o} onClick={() => attack(k)} className="flex h-11 w-full items-center gap-3 rounded-2xl border-2 border-ink-500 bg-ink-700 px-4 text-left text-[13px] font-bold shadow-[0_4px_0_#0f1c3a] transition hover:border-sky active:translate-y-1 active:shadow-none">
                <Swords size={14} className="text-mist" />{o}
              </button>
            ))}
          </div>
        </div>
      )}
    </Asset>
  );
}

/* ======================================================================
   P-17  HIGHER OR LOWER — guess the next close, build a streak
   ==================================================================== */
const hlCoins = [["BTC", "#f7931a"], ["ETH", "#8b9dff"], ["SOL", "#22d39a"], ["TON", "#2bd9ff"]] as const;
function HigherLower() {
  const [price, setPrice] = useState(64218);
  const [next, setNext] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [coin, setCoin] = useState(0);
  const [flip, setFlip] = useState(false);
  const [res, setRes] = useState<null | boolean>(null);
  const guess = (up: boolean) => {
    if (next !== null) return;
    const n = Math.round(price * (1 + (Math.random() - 0.5) * 0.06));
    setNext(n); setFlip(true);
    const ok = n >= price === up;
    setTimeout(() => {
      setRes(ok);
      if (ok) { setStreak((s) => { setBest((b) => Math.max(b, s + 1)); return s + 1; }); sfx.correct(); } else { setStreak(0); sfx.wrong(); }
    }, 550);
  };
  const cont = () => { if (next !== null) setPrice(next); setNext(null); setFlip(false); setRes(null); setCoin((c) => (c + 1) % hlCoins.length); };
  const [sym, col] = hlCoins[coin];
  return (
    <Asset code="PR-17" title="Higher or Lower" desc="Карточная игра: следующая цена выше или ниже? Карточка переворачивается, серия растёт." hint="Выше или ниже?" specs={["card flip", "streak", "best"]}>
      <div className="flex items-center justify-between text-[11px] font-bold">
        <span className="flex items-center gap-1"><FlameIcon size={20} className={streak >= 2 ? "anim-flame" : "opacity-40 grayscale"} /><span className="num text-ember">{streak}</span></span>
        <span className="text-mist">best <span className="num text-gold">{best}</span></span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 [perspective:800px]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-ink-600 to-ink-800 p-4 text-center shadow-[0_6px_0_#08112a]">
          <span className="grid mx-auto h-10 w-10 place-items-center rounded-xl text-sm font-black text-ink-900" style={{ background: col }}>{sym[0]}</span>
          <div className="mt-2 text-[10px] font-bold uppercase text-mist">Now</div>
          <div className="num text-lg font-extrabold">${price.toLocaleString()}</div>
        </div>
        <div className="relative h-full min-h-[130px] transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flip ? "rotateY(180deg)" : undefined }}>
          <div className="absolute inset-0 grid place-items-center rounded-3xl border-2 border-dashed border-sky/50 bg-sky/10 [backface-visibility:hidden]">
            <span className="font-display text-4xl font-black text-sky">?</span>
          </div>
          <div className={cn("absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 [backface-visibility:hidden] [transform:rotateY(180deg)]", res === null ? "border-white/10 bg-ink-700" : res ? "border-bull bg-bull/15" : "border-bear bg-bear/15")}>
            <div className="text-[10px] font-bold uppercase text-mist">Next</div>
            {next !== null && <div className="num text-lg font-extrabold" style={{ color: next >= price ? "#22d39a" : "#ff4f6d" }}>${next.toLocaleString()}</div>}
            {next !== null && <div className="num text-[11px] font-bold" style={{ color: next >= price ? "#22d39a" : "#ff4f6d" }}>{next >= price ? "▲" : "▼"} {(((next - price) / price) * 100).toFixed(2)}%</div>}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {res === null ? (
          <>
            <Btn tone="bear" onClick={() => guess(false)} disabled={next !== null} silent><ArrowDown size={16} strokeWidth={3} /> Lower</Btn>
            <Btn tone="bull" onClick={() => guess(true)} disabled={next !== null} silent><ArrowUp size={16} strokeWidth={3} /> Higher</Btn>
          </>
        ) : (
          <Btn tone="sky" className="col-span-2" onClick={cont}>Next card →</Btn>
        )}
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-18  MEMORY MATCH — flip pairs of term ↔ icon
   ==================================================================== */
const memPairs = [
  { k: "shield", I: ShieldIcon, t: "Stop-loss" },
  { k: "target", I: TargetIcon, t: "Take-profit" },
  { k: "gem", I: GemIcon, t: "Diamond hands" },
  { k: "bolt", I: BoltIcon, t: "Leverage" },
  { k: "flame", I: FlameIcon, t: "FOMO" },
  { k: "trophy", I: TrophyIcon, t: "ATH" },
];
function MemoryMatch() {
  const make = useCallback(() => [...memPairs.flatMap((p) => [{ id: `${p.k}-i`, k: p.k, kind: "icon" as const }, { id: `${p.k}-t`, k: p.k, kind: "text" as const }])].sort(() => Math.random() - 0.5), []);
  const [cards, setCards] = useState(make);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const flip = (id: string) => {
    if (open.length === 2 || open.includes(id) || matched.includes(id)) return;
    const n = [...open, id];
    setOpen(n);
    sfxRaw.swipe();
    if (n.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = n.map((x) => cards.find((c) => c.id === x)!);
      if (a.k === b.k) {
        setTimeout(() => {
          setMatched((m) => { const nm = [...m, a.id, b.id]; if (nm.length === cards.length) setTimeout(() => sfx.levelUp(), 300); return nm; });
          setOpen([]); sfx.correct();
        }, 450);
      } else setTimeout(() => { setOpen([]); sfxRaw.thud(); }, 850);
    }
  };
  return (
    <Asset code="PR-18" title="Memory Match" desc="Найди пары «иконка ↔ термин». Карты переворачиваются в 3D, совпадения светятся и остаются открытыми." hint="Открывай по две карты" specs={["12 cards", "3D flip", "move count"]}>
      <div className="mb-3 flex justify-between text-[11px] font-bold"><span className="text-mist">Moves <span className="num text-white">{moves}</span></span><span className="text-bull">{matched.length / 2}/{memPairs.length} pairs</span></div>
      <div className="grid grid-cols-4 gap-2 [perspective:700px]">
        {cards.map((c) => {
          const p = memPairs.find((x) => x.k === c.k)!;
          const up = open.includes(c.id) || matched.includes(c.id);
          const done = matched.includes(c.id);
          return (
            <button key={c.id} onClick={() => flip(c.id)} className="relative aspect-[3/4] transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: up ? "rotateY(180deg)" : undefined }}>
              <div className="absolute inset-0 grid place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-sky-d to-violet-d shadow-[0_4px_0_#08112a] [backface-visibility:hidden]">
                <Brain size={18} className="text-white/40" />
              </div>
              <div className={cn("absolute inset-0 grid place-items-center rounded-xl border-2 p-1 [backface-visibility:hidden] [transform:rotateY(180deg)]", done ? "border-bull bg-bull/15 shadow-[0_0_14px_rgba(34,211,154,.4)]" : "border-sky bg-ink-700")}>
                {c.kind === "icon" ? <p.I size={34} /> : <span className="text-center text-[10px] font-extrabold leading-tight">{p.t}</span>}
              </div>
            </button>
          );
        })}
      </div>
      <GhostBtn className="mt-4 !h-10 w-full !text-[10px]" onClick={() => { setCards(make()); setOpen([]); setMatched([]); setMoves(0); }}><RotateCcw size={13} /> Shuffle</GhostBtn>
    </Asset>
  );
}

/* ======================================================================
   P-19  PORTFOLIO REBALANCE — linked sliders that always sum to 100
   ==================================================================== */
const assets = [
  { k: "BTC", c: "#f7931a", target: 40 },
  { k: "ETH", c: "#8b9dff", target: 25 },
  { k: "SOL", c: "#22d39a", target: 15 },
  { k: "USDT", c: "#3a5494", target: 20 },
];
function Rebalance() {
  const [w, setW] = useState([70, 15, 10, 5]);
  const [done, setDone] = useState(false);
  const setOne = (i: number, v: number) => {
    const others = w.reduce((a, b, k) => (k === i ? a : a + b), 0);
    const nv = clamp(v, 0, 100);
    const rest = 100 - nv;
    const n = w.map((x, k) => (k === i ? nv : others ? Math.round((x / others) * rest) : Math.round(rest / 3)));
    const drift = 100 - n.reduce((a, b) => a + b, 0);
    const fix = n.findIndex((_, k) => k !== i);
    n[fix] += drift;
    setW(n);
    sfx.tick();
  };
  const err = w.reduce((a, x, k) => a + Math.abs(x - assets[k].target), 0);
  const score = Math.round(clamp(100 - err * 2, 0, 100));
  const R = 48, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <Asset code="PR-19" title="Portfolio Rebalance" desc="Приведи портфель к целевой аллокации. Слайдеры связаны: сумма всегда 100%, донат пересчитывается вживую." hint="Подгони к целевым %" specs={["linked sliders", "sum=100", "live donut"]}>
      <div className="flex items-center gap-4">
        <div className="relative h-32 w-32 shrink-0">
          <svg viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={R} stroke="#0b1530" strokeWidth="16" fill="none" />
            {w.map((x, k) => { const len = (x / 100) * C; const el = <circle key={k} cx="60" cy="60" r={R} stroke={assets[k].c} strokeWidth="16" fill="none" strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-acc} style={{ transition: "all .3s" }} />; acc += len; return el; })}
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center"><div><div className="num text-xl font-extrabold" style={{ color: score >= 90 ? "#22d39a" : "#ffc53d" }}>{score}</div><div className="text-[8px] font-bold uppercase text-mist">match</div></div></div>
        </div>
        <div className="flex-1 space-y-2.5">
          {assets.map((a, k) => (
            <div key={a.k}>
              <div className="flex justify-between text-[10px] font-bold"><span style={{ color: a.c }}>{a.k}</span><span className="num"><span className="text-white">{w[k]}%</span> <span className="text-mist">/ {a.target}%</span></span></div>
              <input type="range" min={0} max={100} value={w[k]} disabled={done} onChange={(e) => setOne(k, +e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: a.c, background: `linear-gradient(90deg, ${a.c} ${w[k]}%, #0b1530 0)` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3"><Bar value={score} tone={score >= 90 ? "bull" : "gold"} h={10} /></div>
      <div className="mt-3">{done ? <Btn tone="sky" block size="sm" onClick={() => { setDone(false); setW([70, 15, 10, 5]); }}><RotateCcw size={14} /> Again</Btn> : <Btn tone="bull" block size="sm" onClick={() => { if (score >= 90) { setDone(true); sfx.correct(); } else sfx.wrong(); }} silent><PieChart size={14} /> Rebalance</Btn>}</div>
    </Asset>
  );
}

/* ======================================================================
   P-20  PRACTICE HUB — reads the global game state, recommends next drill
   ==================================================================== */
function PracticeHub() {
  const { s, level, levelPct, daily } = useGame();
  const acc = s.correct + s.wrong ? Math.round((s.correct / (s.correct + s.wrong)) * 100) : 0;
  const drills = useMemo(() => [
    { id: "practice", n: "Swipe: Bull or Bear", d: "Чтение рыночного контекста", c: "#22d39a", I: ArrowUp },
    { id: "practice", n: "Place the Stop-Loss", d: "Риск-менеджмент", c: "#3b82ff", I: ShieldIcon },
    { id: "practice2", n: "Chart Replay", d: "Практика сделок", c: "#ffc53d", I: Play },
    { id: "practice3", n: "Boss Fight", d: "Экзамен юнита", c: "#ff4f6d", I: Swords },
  ], []);
  const rec = acc && acc < 70 ? 1 : s.combo >= 5 ? 3 : s.correct < 5 ? 0 : 2;
  return (
    <Asset code="PR-20" title="Practice Hub · Live Stats" desc="Хаб читает общий прогресс со всей страницы и советует следующую тренировку по твоей точности и серии." hint="Играй где угодно — хаб обновится" specs={["global state", "adaptive rec", "persisted"]} className="md:col-span-2 xl:col-span-2">
      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            ["Level", level, "#ffc53d", `${levelPct}/100 XP`],
            ["Accuracy", `${acc}%`, acc >= 80 ? "#22d39a" : "#ff8a3d", `${s.correct}✓ ${s.wrong}✗`],
            ["Combo", `×${s.combo}`, "#ff8a3d", `best ×${s.best}`],
            ["Daily goal", `${Math.round(daily)}%`, "#2bd9ff", "150 XP"],
          ].map(([l, v, c, sub]) => (
            <div key={l as string} className="rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#08112a]">
              <div className="text-[9px] font-extrabold uppercase tracking-widest text-mist">{l as string}</div>
              <div key={String(v)} className="num anim-pop text-2xl font-extrabold" style={{ color: c as string }}>{v as string}</div>
              <div className="num text-[10px] text-mist">{sub as string}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-mist"><Crosshair size={13} className="text-gold" /> Recommended next</div>
          <div className="space-y-2">
            {drills.map((d, i) => (
              <a key={d.n} href={`#${d.id}`} onClick={() => sfxRaw.pop()} className={cn("flex items-center gap-3 rounded-2xl border-2 p-3 transition hover:-translate-y-0.5", i === rec ? "border-gold bg-gold/10 shadow-[0_4px_0_#8a5c08]" : "border-transparent bg-ink-800 shadow-[0_3px_0_#08112a]")} style={i === rec ? { animation: "glow-pulse 1.8s infinite" } : undefined}>
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${d.c}22`, color: d.c }}><d.I size={20} /></span>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-extrabold">{d.n}</div><div className="text-[11px] text-mist">{d.d}</div></div>
                {i === rec && <Chip tone="gold">for you</Chip>}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Asset>
  );
}

export default function Practice3() {
  return (
    <Section id="practice3" index="P3" title="Practice Arena · Part 3" subtitle="Аркада, бой с боссом, карточные и логические игры, живой хаб прогресса">
      <PracticeHub />
      <WickCatcher />
      <BossFight />
      <HigherLower />
      <MemoryMatch />
      <Rebalance />
    </Section>
  );
}
