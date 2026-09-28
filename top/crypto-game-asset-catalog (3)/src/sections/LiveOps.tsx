import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Burst, Confetti, Icon, ProgressBar, Section, useBump, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { useDrag } from "../ui/hooks";
import { feel, haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ LOP-01 · Boss battle ═════════ */
const BQ = [
  { q: "Цена пробила сопротивление на большом объёме. Действие?", o: ["Покупка на ретесте", "Продажа"], a: 0 },
  { q: "Ты в минусе 20%. Стоп сработал. Что делать?", o: ["Удвоить позицию", "Принять убыток"], a: 1 },
  { q: "Funding rate сильно положительный — это…", o: ["Перегрев лонгов", "Перегрев шортов"], a: 0 },
  { q: "Лучший риск на сделку для новичка?", o: ["1% депозита", "25% депозита"], a: 0 },
  { q: "RSI 22 на дневке означает…", o: ["Перекупленность", "Перепроданность"], a: 1 },
];
function BossBattle() {
  const game = useGame();
  const [boss, setBoss] = useState(100);
  const [ghost, setGhost] = useState(100);
  const [me, setMe] = useState(3);
  const [qi, setQi] = useState(0);
  const [hit, setHit] = useState(0);
  const [ouch, setOuch] = useState(0);
  const [dmg, setDmg] = useState<{ k: number; v: number } | null>(null);
  const [state, setState] = useState<"fight" | "win" | "lose">("fight");
  const [conf, setConf] = useState(0);
  const q = BQ[qi % BQ.length];
  const answer = (i: number, x: number, y: number) => {
    if (state !== "fight") return;
    if (i === q.a) {
      const v = 18 + Math.floor(Math.random() * 12);
      const nb = Math.max(0, boss - v);
      setBoss(nb); setHit((h) => h + 1); setDmg({ k: Date.now(), v }); feel("success", [20, 30, 60]);
      window.setTimeout(() => setGhost(nb), 500);
      if (nb === 0) { setState("win"); setConf((c) => c + 1); game.reward({ xp: 60, gems: 120, x, y }); sfx.play("levelup"); }
    } else {
      const nm = me - 1;
      setMe(nm); setOuch((o) => o + 1); feel("error", [60, 40, 60]); game.loseHeart();
      if (nm <= 0) setState("lose");
    }
    setQi((n) => n + 1);
  };
  const reset = () => { setBoss(100); setGhost(100); setMe(3); setState("fight"); setQi(0); };
  return (
    <AssetCard id="LOP-01" title="Boss Battle · Bear Market" desc="Финал юнита: отвечай верно — бьёшь босса (урон, тряска, «призрачная» полоса HP). Ошибка — босс атакует, экран вспыхивает красным." tags={["boss", "battle", "combat", "quiz"]} className="row-span-2" stageClass="overflow-hidden">
      <Confetti trigger={conf} count={60} />
      {ouch > 0 && <div key={`o${ouch}`} className="pointer-events-none absolute inset-0 z-30 rounded-[18px] bg-bear" style={{ animation: "flashRed .5s ease-out both" }} />}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-bear">Boss · Unit 2</span>
        <span className="flex gap-0.5">{Array.from({ length: 3 }).map((_, i) => <Icon key={i} name="heart" size={18} variant={i < me ? "solid" : "line"} className={i < me ? "text-bear" : "text-ink-600"} />)}</span>
      </div>
      <div className="text-lg font-extrabold text-white">The Bear Market</div>
      <div className="well relative mt-2 h-5 overflow-hidden rounded-full">
        <div className="absolute inset-y-0 left-0 rounded-full bg-white/60 transition-[width] duration-700" style={{ width: `${ghost}%` }} />
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-b from-bear to-bear-edge transition-[width] duration-200" style={{ width: `${boss}%` }} />
        <span className="absolute inset-0 grid place-items-center font-mono text-[10px] font-extrabold text-white text-3d">{boss} / 100 HP</span>
      </div>
      <div className="relative my-4 flex h-44 items-end justify-between px-2">
        <div key={`p${hit}`} style={{ animation: hit ? "lunge .4s ease both" : undefined }}><Mascot mood={state === "lose" ? "sad" : state === "win" ? "happy" : "cool"} size={90} /></div>
        <div className="relative">
          <div key={`b${hit}`} style={{ animation: hit ? "hitShake .45s ease both" : "floaty 3s ease-in-out infinite" }}>
            <svg viewBox="0 0 120 120" width="130" height="130" style={{ filter: state === "win" ? "grayscale(1) opacity(.4)" : "drop-shadow(0 0 20px #ff4d6a66)" }}>
              <ellipse cx="60" cy="114" rx="36" ry="5" fill="#000" opacity=".35" />
              <circle cx="30" cy="30" r="14" fill="#8c1530" /><circle cx="90" cy="30" r="14" fill="#8c1530" />
              <circle cx="30" cy="30" r="7" fill="#ff4d6a" /><circle cx="90" cy="30" r="7" fill="#ff4d6a" />
              <rect x="16" y="28" width="88" height="80" rx="36" fill="#6b1026" />
              <rect x="16" y="24" width="88" height="78" rx="36" fill="#a3163a" />
              <path d="M36 54 L52 60 M84 54 L68 60" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
              <circle cx="46" cy="66" r="5" fill="#fff" /><circle cx="74" cy="66" r="5" fill="#fff" />
              <ellipse cx="60" cy="84" rx="16" ry="11" fill="#6b1026" />
              <path d="M50 92 L54 86 L58 92 L62 86 L66 92 L70 86" stroke="#fff" strokeWidth="2.5" fill="none" />
              <path d="M24 100 L40 88 L50 96 L66 80 L80 92 L98 74" stroke="#ff4d6a" strokeWidth="3" fill="none" opacity=".8" />
            </svg>
          </div>
          {dmg && <span key={dmg.k} className="absolute left-1/2 top-0 font-mono text-2xl font-extrabold text-gold" style={{ animation: "floatAway 1s ease-out forwards", textShadow: "0 0 14px #ffc53d, 0 3px 0 #0008" }}>−{dmg.v}</span>}
        </div>
      </div>
      {state === "fight" ? (
        <div key={qi} className="anim-fade-up">
          <div className="mb-3 rounded-2xl bg-ink-900/70 p-3 text-sm font-extrabold text-white">{q.q}</div>
          <div className="grid grid-cols-2 gap-2">{q.o.map((o, i) => <Btn key={o} v={i === 0 ? "sky" : "violet"} size="sm" onClick={(e) => answer(i, e.clientX, e.clientY)} className="h-auto! min-h-12 py-2 normal-case! tracking-normal!">{o}</Btn>)}</div>
        </div>
      ) : (
        <div className="anim-pop text-center">
          <div className={cn("text-2xl font-extrabold", state === "win" ? "text-gold text-glow-gold" : "text-bear")}>{state === "win" ? "Boss defeated!" : "You got rekt"}</div>
          <div className="mb-3 text-xs text-ink-300">{state === "win" ? "+60 XP · +120 💎 · Unit 3 unlocked" : "Повтори урок и возвращайся"}</div>
          <Btn v={state === "win" ? "gold" : "bear"} size="sm" onClick={reset}>{state === "win" ? "Next boss" : "Retry"}</Btn>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ LOP-02 · Battle pass track ═════════ */
const TIERS = Array.from({ length: 12 }, (_, i) => ({
  free: i % 3 === 2 ? { i: "gift", t: "Chest" } : i % 2 ? { i: "bolt", t: `${(i + 1) * 10} XP` } : { i: "gem", t: `${(i + 1) * 25}` },
  prem: i % 4 === 3 ? { i: "crown", t: "Skin" } : i % 2 ? { i: "gem", t: `${(i + 1) * 60}` } : { i: "snow", t: "Freeze" },
}));
function BattlePass() {
  const game = useGame();
  const [lvl, setLvl] = useState(4.4);
  const [premium, setPremium] = useState(false);
  const [claimed, setClaimed] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; s: number } | null>(null);
  const onDown = useDrag({
    onStart: (x) => { drag.current = { x, s: ref.current?.scrollLeft ?? 0 }; },
    onMove: (d) => { if (ref.current && drag.current) ref.current.scrollLeft = drag.current.s - d.dx; },
    onEnd: (d) => { if (ref.current) ref.current.scrollBy({ left: -d.vx * 12, behavior: "smooth" }); drag.current = null; },
  });
  useEffect(() => { ref.current?.scrollTo({ left: Math.max(0, Math.floor(lvl) * 84 - 80) }); }, [lvl]);
  const claim = (k: string, i: number, prem: boolean, x: number, y: number) => {
    if (claimed.includes(k) || i >= Math.floor(lvl) || (prem && !premium)) { feel("lock", 20); return; }
    setClaimed([...claimed, k]);
    const r = prem ? TIERS[i].prem : TIERS[i].free;
    if (r.i === "gem") game.reward({ gems: parseInt(r.t), x, y });
    else if (r.i === "bolt") game.reward({ xp: parseInt(r.t), x, y });
    else feel("open", 20);
  };
  const Cell = ({ r, k, i, prem }: { r: { i: string; t: string }; k: string; i: number; prem: boolean }) => {
    const unlocked = i < Math.floor(lvl) && (!prem || premium);
    const done = claimed.includes(k);
    return (
      <button onClick={(e) => claim(k, i, prem, e.clientX, e.clientY)} className={cn("relative flex h-20 w-[72px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl transition-all", done ? "bg-ink-800 opacity-50" : unlocked ? "raised -translate-y-0.5 ring-2 ring-gold" : "bg-ink-800/60")} style={unlocked && !done ? { animation: "heartbeat 1.6s ease-in-out infinite" } : undefined}>
        <Icon name={r.i} size={24} variant="duo" className={prem ? "text-violet" : r.i === "gem" ? "text-violet" : r.i === "bolt" ? "text-gold" : "text-bull"} />
        <span className="font-mono text-[10px] font-extrabold text-white">{r.t}</span>
        {done && <Icon name="check" size={16} stroke={3.4} className="absolute right-1 top-1 text-bull" />}
        {!unlocked && !done && <Icon name="lock" size={12} className="absolute right-1.5 top-1.5 text-ink-500" />}
      </button>
    );
  };
  return (
    <AssetCard id="LOP-02" title="Battle Pass Track" desc="Сезонный пропуск: горизонтальная дорожка с перетаскиванием и инерцией, бесплатный и премиум-ряд, линия прогресса, пульсирующие награды." tags={["battle-pass", "season", "rewards", "horizontal"]} className="md:col-span-2" stageClass="px-0">
      <div className="mb-3 flex items-center justify-between px-4">
        <div><div className="text-[10px] font-extrabold uppercase tracking-widest text-gold">Season 7 · Bull Run</div><div className="text-sm font-extrabold text-white">Tier {Math.floor(lvl)} · {Math.round((lvl % 1) * 100)}% to next</div></div>
        <div className="flex gap-2">
          <Btn v="gold" size="sm" onClick={() => setLvl((l) => Math.min(12, l + 0.6))}>+XP</Btn>
          <Btn v={premium ? "dark" : "violet"} size="sm" onClick={() => { setPremium(!premium); feel(premium ? "lock" : "unlock", 20); }}>{premium ? "Premium ✓" : "Go Premium"}</Btn>
        </div>
      </div>
      <div ref={ref} onPointerDown={onDown} className="no-scrollbar cursor-grab touch-pan-y select-none overflow-x-auto px-4 active:cursor-grabbing">
        <div className="relative w-max">
          <div className="flex gap-3">{TIERS.map((t, i) => <Cell key={`f${i}`} r={t.free} k={`f${i}`} i={i} prem={false} />)}</div>
          <div className="relative my-3 flex h-8 items-center">
            <div className="absolute inset-x-0 h-2 rounded-full bg-ink-900" />
            <div className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-gold to-flame shadow-[0_0_10px_#ffc53d] transition-[width] duration-700" style={{ width: lvl * 84 - 48 }} />
            <div className="relative flex gap-3">{TIERS.map((_, i) => <span key={i} className={cn("grid h-8 w-[72px] place-items-center")}><span className={cn("grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-extrabold transition-all", i < Math.floor(lvl) ? "bg-gold text-ink-900 shadow-[0_2px_0_#cc8a00]" : "bg-ink-700 text-ink-400")}>{i + 1}</span></span>)}</div>
          </div>
          <div className="relative flex gap-3">
            {TIERS.map((t, i) => <Cell key={`p${i}`} r={t.prem} k={`p${i}`} i={i} prem />)}
            {!premium && <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-violet/10 to-transparent" />}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-4 px-4 text-[10px] font-extrabold uppercase tracking-widest"><span className="text-ink-400">▲ Free</span><span className="text-violet">▼ Premium</span></div>
    </AssetCard>
  );
}

/* ═════════ LOP-03 · Daily login calendar ═════════ */
const DAYS = [["gem", "25"], ["bolt", "20"], ["gem", "50"], ["snow", "1"], ["gem", "100"], ["bolt", "50"], ["gift", "Chest"]];
function DailyLogin() {
  const game = useGame();
  const [day, setDay] = useState(3);
  const [claimed, setClaimed] = useState(3);
  const [flip, setFlip] = useState<number | null>(null);
  const [b, bump] = useBump();
  const claim = (i: number, x: number, y: number) => {
    if (i !== claimed || i > day) { feel("lock", 15); return; }
    setFlip(i); setClaimed(i + 1); bump(); feel("coin", 15);
    const [ic, v] = DAYS[i];
    if (ic === "gem") game.reward({ gems: parseInt(v), x, y }); else if (ic === "bolt") game.reward({ xp: parseInt(v), x, y }); else feel("open");
  };
  return (
    <AssetCard id="LOP-03" title="Daily Login Rewards" desc="7-дневный календарь входов: доступный день светится, забираешь — карта переворачивается, 7-й день — большой сундук." tags={["daily", "login", "calendar", "retention"]}>
      <div className="grid grid-cols-4 gap-2">
        {DAYS.map(([ic, v], i) => {
          const got = i < claimed;
          const ready = i === claimed && i <= day;
          const big = i === 6;
          return (
            <button key={i} onClick={(e) => claim(i, e.clientX, e.clientY)} className={cn("relative h-24", big && "col-span-2")} style={{ perspective: 600 }}>
              <div className="relative h-full w-full transition-transform duration-500 preserve-3d" style={{ transform: got ? "rotateY(180deg)" : "none" }}>
                <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl backface-hidden", ready ? "raised ring-2 ring-bull" : "bg-ink-800")} style={ready ? { animation: "glowPulse 1.8s ease-in-out infinite" } : undefined}>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-ink-400">Day {i + 1}</span>
                  <Icon name={ic} size={big ? 34 : 24} variant="duo" className={ic === "gem" ? "text-violet" : ic === "bolt" ? "text-gold" : ic === "snow" ? "text-[#5ce1ff]" : "text-bull"} />
                  <span className="font-mono text-xs font-extrabold text-white">{v}</span>
                  {i > day && <Icon name="lock" size={12} className="absolute right-2 top-2 text-ink-500" />}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-b from-bull to-bull-edge backface-hidden" style={{ transform: "rotateY(180deg)" }}>
                  <Icon name="check" size={26} stroke={3.4} className="text-ink-900" />
                  <span className="text-[9px] font-extrabold uppercase text-ink-900">Claimed</span>
                </div>
              </div>
              {flip === i && <Burst trigger={b} count={12} spread={60} />}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-ink-300">Сегодня: день {day + 1}</span>
        <Btn v="ghost" size="sm" onClick={() => setDay((d) => Math.min(6, d + 1))}>Next day ›</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ LOP-04 · Split-flap countdown ═════════ */
function Flap({ v }: { v: string }) {
  const [cur, setCur] = useState(v);
  const [prev, setPrev] = useState(v);
  const [k, setK] = useState(0);
  useEffect(() => { if (v !== cur) { setPrev(cur); setCur(v); setK((x) => x + 1); } }, [v, cur]);
  const half = "absolute inset-x-0 overflow-hidden bg-gradient-to-b from-ink-600 to-ink-700 font-mono text-3xl font-extrabold text-white";
  return (
    <div className="relative h-14 w-10 rounded-lg shadow-[0_4px_0_#050b1f]" style={{ perspective: 300 }}>
      <div className={cn(half, "top-0 h-1/2 rounded-t-lg")}><span className="absolute inset-x-0 top-0 grid h-14 place-items-center">{cur}</span></div>
      <div className={cn(half, "bottom-0 h-1/2 rounded-b-lg")}><span className="absolute inset-x-0 bottom-0 grid h-14 place-items-center">{k ? prev : cur}</span></div>
      {k > 0 && <>
        <div key={`t${k}`} className={cn(half, "top-0 z-10 h-1/2 origin-bottom rounded-t-lg")} style={{ animation: "flipOut .3s ease-in forwards" }}><span className="absolute inset-x-0 top-0 grid h-14 place-items-center">{prev}</span></div>
        <div key={`b${k}`} className={cn(half, "bottom-0 z-10 h-1/2 origin-top rounded-b-lg")} style={{ animation: "flipIn .3s ease-out .3s both" }}><span className="absolute inset-x-0 bottom-0 grid h-14 place-items-center">{cur}</span></div>
      </>}
      <div className="absolute inset-x-0 top-1/2 z-20 h-px bg-black/60" />
    </div>
  );
}
function Countdown() {
  const [left, setLeft] = useState(2 * 86400 + 4 * 3600 + 17 * 60 + 9);
  useInterval(() => { setLeft((l) => (l > 0 ? l - 1 : 3 * 86400)); sfx.play("tick"); }, 1000);
  const d = Math.floor(left / 86400), h = Math.floor((left % 86400) / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
  const grp = (n: number, l: string) => (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1">{String(n).padStart(2, "0").split("").map((c, i) => <Flap key={i} v={c} />)}</div>
      <span className="text-[9px] font-extrabold uppercase tracking-widest text-ink-400">{l}</span>
    </div>
  );
  return (
    <AssetCard id="LOP-04" title="Split-Flap Event Timer" desc="Таймер события в стиле табло: каждая цифра переворачивается механически, с тиком звука. Для турниров и распродаж." tags={["countdown", "timer", "flip", "event"]}>
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-bear px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">Live</span>
        <span className="text-sm font-extrabold text-white">Halving Tournament ends in</span>
      </div>
      <div className="flex items-start justify-center gap-2">
        {grp(d, "days")}<span className="mt-3 text-2xl font-extrabold text-ink-500">:</span>{grp(h, "hrs")}<span className="mt-3 text-2xl font-extrabold text-ink-500">:</span>{grp(m, "min")}<span className="mt-3 text-2xl font-extrabold text-ink-500">:</span>{grp(s, "sec")}
      </div>
      <div className="mt-4"><ProgressBar value={100 - (left / (3 * 86400)) * 100} color="flame" h={10} striped /></div>
    </AssetCard>
  );
}

/* ═════════ LOP-05 · Coachmark tour ═════════ */
const TOUR = [
  { el: "c-balance", t: "Твой демо-баланс", d: "$10,000 виртуальных — торгуй без риска." },
  { el: "c-chart", t: "График", d: "Тапни свечу, чтобы увидеть OHLC." },
  { el: "c-buy", t: "Кнопка сделки", d: "Покупай, когда видишь сигнал." },
  { el: "c-tab", t: "Уроки", d: "Здесь твоя карта обучения." },
];
function Coachmarks() {
  const box = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<number | null>(0);
  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  useEffect(() => {
    if (step === null || !box.current) return;
    const el = box.current.querySelector<HTMLElement>(`[data-c="${TOUR[step].el}"]`);
    if (!el) return;
    const b = box.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    setRect({ x: r.left - b.left - 6, y: r.top - b.top - 6, w: r.width + 12, h: r.height + 12 });
  }, [step]);
  const next = () => { feel("tap"); setStep((s) => (s === null || s >= TOUR.length - 1 ? null : s + 1)); };
  const below = rect.y < 200;
  return (
    <AssetCard id="LOP-05" title="Coachmark Tour" desc="Онбординг-подсказки: «прожектор» плавно перелетает между элементами интерфейса, тултип позиционируется сверху/снизу." tags={["onboarding", "tour", "coachmark", "spotlight"]} stageClass="p-2">
      <div ref={box} className="relative h-[360px] overflow-hidden rounded-2xl bg-ink-950 p-4">
        <div data-c="c-balance" className="rounded-2xl bg-ink-800 p-3"><div className="text-[10px] font-bold uppercase text-ink-400">Balance</div><div className="font-mono text-2xl font-extrabold text-white">$10,000.00</div></div>
        <div data-c="c-chart" className="mt-3 rounded-2xl bg-ink-800 p-3"><svg viewBox="0 0 200 60" className="w-full"><path d="M0 50 L30 40 L50 45 L80 22 L110 30 L140 12 L170 18 L200 6" fill="none" stroke="#2ee59d" strokeWidth="2.5" /></svg></div>
        <div className="mt-3 grid grid-cols-2 gap-2"><div data-c="c-buy"><Btn v="bull" size="sm" block>Buy</Btn></div><Btn v="bear" size="sm" block>Sell</Btn></div>
        <div className="absolute inset-x-3 bottom-3 flex justify-around rounded-2xl bg-ink-800 py-2">
          <span data-c="c-tab" className="grid h-10 w-10 place-items-center rounded-xl"><Icon name="book" size={22} className="text-bull" /></span>
          <span className="grid h-10 w-10 place-items-center"><Icon name="chart" size={22} className="text-ink-400" /></span>
          <span className="grid h-10 w-10 place-items-center"><Icon name="user" size={22} className="text-ink-400" /></span>
        </div>
        {step !== null && (
          <>
            <div className="pointer-events-none absolute z-20 rounded-2xl ring-2 ring-sky transition-all duration-500 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxShadow: "0 0 0 9999px rgba(5,11,31,.78), 0 0 24px #3d8bff" }} />
            <div key={step} className="absolute left-3 right-3 z-30 rounded-2xl bg-white p-3 shadow-[0_4px_0_#c3cdea] transition-all duration-500" style={{ top: below ? rect.y + rect.h + 12 : undefined, bottom: below ? undefined : 360 - rect.y + 12, animation: "scaleIn .3s cubic-bezier(.3,1.4,.5,1) both" }}>
              <div className="flex items-start gap-2">
                <Mascot mood="idle" size={40} />
                <div className="flex-1"><div className="text-sm font-extrabold text-ink-900">{TOUR[step].t}</div><div className="text-xs font-semibold text-ink-500">{TOUR[step].d}</div></div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">{TOUR.map((_, i) => <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-sky" : "w-1.5 bg-ink-200")} />)}</div>
                <div className="flex gap-2"><button onClick={() => setStep(null)} className="text-xs font-extrabold text-ink-400">Skip</button><button onClick={next} className="rounded-lg bg-sky px-3 py-1 text-xs font-extrabold text-white shadow-[0_3px_0_#1e56c9] active:translate-y-0.5">{step === TOUR.length - 1 ? "Done" : "Next"}</button></div>
              </div>
            </div>
          </>
        )}
      </div>
      {step === null && <div className="mt-2 text-center"><Btn v="ghost" size="sm" onClick={() => setStep(0)}><Icon name="refresh" size={14} />Replay tour</Btn></div>}
    </AssetCard>
  );
}

/* ═════════ LOP-06 · Tournament bracket ═════════ */
const PLAYERS = [["You", "#2ee59d"], ["Satoshi", "#ffc53d"], ["Vitalik", "#a174ff"], ["CZ", "#3d8bff"], ["Mira", "#ff4d6a"], ["Kai", "#ff8a3d"], ["Zoe", "#5ce1ff"], ["Leo", "#ff7ab6"]];
function Bracket() {
  const [rounds, setRounds] = useState<number[][]>([[0, 1, 2, 3, 4, 5, 6, 7]]);
  const sim = () => {
    const last = rounds[rounds.length - 1];
    if (last.length === 1) { setRounds([[0, 1, 2, 3, 4, 5, 6, 7]]); feel("whoosh"); return; }
    const next: number[] = [];
    for (let i = 0; i < last.length; i += 2) next.push(last[i] === 0 || last[i + 1] === 0 ? (Math.random() < 0.75 ? 0 : last[i] === 0 ? last[i + 1] : last[i]) : (Math.random() < 0.5 ? last[i] : last[i + 1]));
    setRounds([...rounds, next]); feel(next.length === 1 ? "levelup" : "success", 15);
  };
  const champ = rounds[rounds.length - 1].length === 1 ? rounds[rounds.length - 1][0] : null;
  const H = 34;
  return (
    <AssetCard id="LOP-06" title="Tournament Bracket" desc="Сетка на 8 игроков: раунды симулируются, линии дорисовываются, победители «переезжают» в следующий столбец." tags={["tournament", "bracket", "pvp", "event"]}>
      <div className="relative flex gap-3 overflow-x-auto pb-2">
        {[0, 1, 2, 3].map((r) => {
          const col = rounds[r];
          const n = 8 / 2 ** r;
          return (
            <div key={r} className="relative flex shrink-0 flex-col justify-around" style={{ height: 8 * H + 16, width: 82 }}>
              {Array.from({ length: n }).map((_, i) => {
                const p = col?.[i];
                const lost = p !== undefined && rounds[r + 1] && !rounds[r + 1].includes(p);
                return (
                  <div key={i} className={cn("flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-extrabold transition-all duration-500", p === undefined ? "border border-dashed border-ink-600" : lost ? "bg-ink-800 text-ink-500 line-through" : p === 0 ? "bg-bull/20 text-bull ring-1 ring-bull" : "bg-ink-700 text-white")} style={p !== undefined && r > 0 ? { animation: "slideInL .45s cubic-bezier(.3,1.4,.5,1) both" } : undefined}>
                    {p !== undefined && <><span className="h-2.5 w-2.5 rounded-full" style={{ background: PLAYERS[p][1] }} />{PLAYERS[p][0]}</>}
                    {r === 3 && p !== undefined && <Icon name="crown" size={12} variant="solid" className="ml-auto text-gold" />}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn("text-xs font-extrabold", champ === 0 ? "text-gold" : "text-ink-300")}>{champ !== null ? (champ === 0 ? "🏆 Ты чемпион!" : `Победитель: ${PLAYERS[champ][0]}`) : `Раунд ${rounds.length} из 4`}</span>
        <Btn v={champ !== null ? "ghost" : "gold"} size="sm" onClick={sim}>{champ !== null ? "New cup" : "Play round"}</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ LOP-07 · Stacked notification center ═════════ */
const NOTIFS = [
  { i: "flame", c: "#ff8a3d", t: "Стрик под угрозой!", d: "Осталось 2 часа, чтобы сохранить 27 дней" },
  { i: "trophy", c: "#ffc53d", t: "Ты в топ-3 лиги", d: "Удержи позицию до воскресенья" },
  { i: "trendUp", c: "#2ee59d", t: "BTC +5% за час", d: "Твой прогноз сыграл: +30 XP" },
  { i: "gift", c: "#a174ff", t: "Сундук готов", d: "Забери ежедневную награду" },
];
function NotifStack() {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(NOTIFS);
  return (
    <AssetCard id="LOP-07" title="Stacked Notifications" desc="Уведомления в стопке как в iOS: тап раскрывает веером с пружиной, смахивание в сторону удаляет." tags={["notifications", "stack", "expand", "ios"]}>
      <div className="relative" style={{ height: open ? list.length * 74 + 10 : 110, transition: "height .5s cubic-bezier(.3,1.3,.5,1)" }}>
        {list.map((n, i) => <NotifCard key={n.t} n={n} i={i} open={open} onClick={() => { setOpen(!open); feel("pop", 6); }} onDismiss={() => setList((l) => l.filter((x) => x.t !== n.t))} />)}
        {list.length === 0 && <div className="grid h-full place-items-center text-xs font-bold text-ink-500">All caught up ✓</div>}
      </div>
      <div className="mt-2 flex justify-between">
        <span className="text-[11px] font-bold text-ink-400">{open ? "Свайп влево/вправо — удалить" : `${list.length} уведомления · тап`}</span>
        {list.length < NOTIFS.length && <button onClick={() => setList(NOTIFS)} className="text-[11px] font-extrabold text-sky">Restore</button>}
      </div>
    </AssetCard>
  );
}
function NotifCard({ n, i, open, onClick, onDismiss }: { n: (typeof NOTIFS)[number]; i: number; open: boolean; onClick: () => void; onDismiss: () => void }) {
  const [dx, setDx] = useState(0);
  const [gone, setGone] = useState(false);
  const moved = useRef(false);
  const onDown = useDrag({
    onStart: () => { moved.current = false; },
    onMove: (d) => { if (open && Math.abs(d.dx) > 6) { moved.current = true; setDx(d.dx); } },
    onEnd: (d) => {
      if (Math.abs(d.dx) > 100) { setGone(true); setDx(Math.sign(d.dx) * 400); feel("whoosh"); window.setTimeout(onDismiss, 250); }
      else { setDx(0); if (!moved.current) onClick(); }
    },
  });
  const top = open ? i * 74 : Math.min(i, 2) * 10;
  const sc = open ? 1 : 1 - Math.min(i, 2) * 0.05;
  return (
    <div onPointerDown={onDown} className="glass absolute inset-x-0 flex h-16 cursor-pointer touch-pan-y select-none items-center gap-3 rounded-2xl px-3" style={{
      top, zIndex: 10 - i, transform: `translateX(${dx}px) scale(${sc})`, opacity: gone ? 0 : open || i < 3 ? 1 - (open ? 0 : i * 0.2) : 0,
      transition: dx !== 0 && !gone ? "none" : `all .5s cubic-bezier(.3,1.3,.5,1) ${open ? i * 40 : 0}ms`,
    }}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${n.c}22` }}><Icon name={n.i} size={20} variant="duo" style={{ color: n.c }} /></span>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-white">{n.t}</div><div className="truncate text-[11px] text-ink-300">{n.d}</div></div>
      <span className="text-[10px] text-ink-400">{i + 1}m</span>
    </div>
  );
}

/* ═════════ LOP-08 · Streak repair ═════════ */
function StreakRepair() {
  const game = useGame();
  const [broken, setBroken] = useState(true);
  const [b, bump] = useBump();
  const [shk, setShk] = useState(0);
  const repair = (x: number, y: number) => {
    if (!game.spend(300)) { setShk((s) => s + 1); return; }
    setBroken(false); bump(); feel("levelup"); haptic([30, 50, 30, 50, 100]);
    game.reward({ xp: 15, x, y });
  };
  return (
    <AssetCard id="LOP-08" title="Streak Repair" desc="Потерянный стрик: потухшее треснувшее пламя дрожит. Починка за гемы — пламя вспыхивает с частицами и счётчик возвращается." tags={["streak", "repair", "monetization", "emotion"]}>
      <div className="flex flex-col items-center py-2 text-center">
        <div className="relative grid h-32 w-32 place-items-center">
          {!broken && <div className="absolute inset-0 rounded-full bg-flame/40 blur-2xl" style={{ animation: "fadeIn .6s both" }} />}
          <div key={String(broken)} style={{ animation: broken ? "crack 2s ease-in-out infinite" : "popIn .6s cubic-bezier(.2,1.4,.4,1) both" }}>
            <svg viewBox="0 0 24 24" width="110" height="110">
              <path d="M12 2.5c1.2 3.6 5.5 5.6 5.5 10.5a5.5 5.5 0 0 1-11 0c0-2.2 1-3.8 2.2-4.8 0 1.6.8 2.6 2 3.2 0-3.2-1-5.8 1.3-8.9z" fill={broken ? "#2f4789" : "#ff8a3d"} stroke={broken ? "#5a70ad" : "#ffc53d"} strokeWidth="1" style={{ filter: broken ? "none" : "drop-shadow(0 0 10px #ff8a3d)" }} className={broken ? "" : "anim-flame"} />
              {broken && <path d="M11 6 L13 10 L10.5 13 L13 17" stroke="#0a1330" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
            </svg>
          </div>
          <Burst trigger={b} colors={["#ff8a3d", "#ffc53d", "#fff"]} count={20} spread={100} />
        </div>
        <div key={`n${String(broken)}`} className={cn("anim-pop font-mono text-4xl font-extrabold", broken ? "text-ink-500 line-through" : "text-flame text-glow-gold")}>{broken ? "0" : "27"}</div>
        <div className="text-sm font-extrabold text-white">{broken ? "Стрик потерян" : "Стрик восстановлен!"}</div>
        <div className="mb-4 text-xs text-ink-400">{broken ? "Ты пропустил вчерашний урок. 27 дней под угрозой." : "Не забудь пройти урок сегодня."}</div>
        <div key={shk} className={cn("flex w-full gap-2", shk && "anim-shake")}>
          {broken ? <>
            <Btn v="flame" block onClick={(e) => repair(e.clientX, e.clientY)}><Icon name="gem" size={14} variant="solid" />Repair · 300</Btn>
            <Btn v="ghost" onClick={() => feel("lock")}>Skip</Btn>
          </> : <Btn v="ghost" block onClick={() => setBroken(true)}><Icon name="refresh" size={14} />Reset demo</Btn>}
        </div>
      </div>
    </AssetCard>
  );
}

export default function LiveOps() {
  return (
    <Section id="liveops" num="13" title="LiveOps & Events" subtitle="Боссы, сезонный пропуск, ежедневные награды, таймеры, онбординг-тур, турниры, уведомления, возврат стрика">
      <BossBattle />
      <BattlePass />
      <DailyLogin />
      <Countdown />
      <Coachmarks />
      <Bracket />
      <NotifStack />
      <StreakRepair />
    </Section>
  );
}


