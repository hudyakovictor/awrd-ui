import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, Play, RotateCcw, ScrollText, Timer } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Bar } from "../kit/ui";
import { CandleChart, fromCloses, makeScale, BULL, BEAR } from "../kit/chart";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ======================================================================
   D-01  QUIZ RUSH — timed Kahoot-style sprint with live scoreboard
   ==================================================================== */
const rushQs: { q: string; a: string[]; c: number; why: string }[] = [
  { q: "Сколько пунктов в одном лоте BTC?", a: ["0.001", "1 BTC", "0.1 BTC"], c: 1, why: "В симуляторе лот = 1 BTC для наглядности." },
  { q: "Что покажет объём на графике?", a: ["Кто продал", "Силу интереса", "Время закрытия"], c: 1, why: "Объём — количество участвовавших контрактов." },
  { q: "Стоп поддержки — это…", a: ["Зона покупателей", "Комиссия биржи", "Стоп-ордер"], c: 0, why: "Сопротивление — зона продавцов, поддержка — покупателей." },
  { q: "При какой просадке маржинколл?", a: ["−50% средств", "−5%", "Нет маржинколла"], c: 0, why: "Недостаток маржи против открытия позиции." },
  { q: "Самая токсичная эмоция при трейдинге?", a: ["Осторожность", "FOMO", "Жадность наоборот"], c: 1, why: "FOMO толкает покупать на пике из страха упустить." },
];
const rushColors = ["#3b82ff", "#22d39a", "#ffc53d", "#8b5cff"];
function QuizRush() {
  const [i, setI] = useState(0);
  const [t, setT] = useState(15);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState([
    { n: "You", v: 0, me: true }, { n: "Mira", v: 820, me: false }, { n: "Denis", v: 640, me: false }, { n: "Rex", v: 505, me: false },
  ]);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run || picked !== null) return;
    const tm = setInterval(() => setT((v) => { if (v <= 1) { clearInterval(tm); setPicked(-1); return 0; } return v - 1; }), 1000);
    return () => clearInterval(tm);
  }, [run, picked]);
  const q = rushQs[i];
  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === q.c;
    const gain = Math.round(200 + t * 20) * (ok ? 1 : 0);
    ok ? sfx.correct() : sfx.wrong();
    setScore((s) => s + gain);
    setTimeout(() => {
      setBoard((b) => {
        const nb = b.map((x) => (x.me ? { ...x, v: x.v + gain + Math.round(Math.random() * 260) } : { ...x, v: x.v + Math.round(Math.random() * 320) }));
        return nb.sort((a, c) => c.v - a.v);
      });
      if (i + 1 >= rushQs.length) { setRun(false); sfx.levelUp(); }
      else { setI((x) => x + 1); setPicked(null); setT(15); sfxRaw.pop(); }
    }, 1600);
  };
  const reset = () => { setI(0); setScore(0); setPicked(null); setT(15); setRun(false); setBoard(board.map((x) => ({ ...x, v: x.me ? 0 : x.v }))); };
  const C = 2 * Math.PI * 34;
  return (
    <Asset code="D-01" title="Quiz Rush" desc="Экзамен на скорость: 15 секунд на вопрос, очки зависят от остатка времени, рейтинг встает по местам после каждого раунда." hint="Отвечай быстро" specs={["timer ring", "speed score", "live board"]} className="xl:row-span-2">
      {!run ? (
        <div className="grid h-[430px] place-items-center rounded-3xl bg-[radial-gradient(circle_at_50%_20%,#1d3a7a,#0a1224_70%)] text-center">
          <div className="anim-pop">
            <Timer size={54} className="mx-auto text-gold anim-float" />
            <div className="font-display mt-3 text-xl font-extrabold">Quiz Rush</div>
            <p className="mx-auto mt-1 max-w-[220px] text-[12px] text-mist">5 вопросов. 15 секунд каждый. Очки за скорость.</p>
            <div className="num mt-2 text-[11px] text-mist">best {score} pts</div>
            <Btn tone="gold" className="mt-4 !text-[#3b2600]" onClick={() => { setRun(true); sfxRaw.swipe(); }}><Play size={15} /> Start rush</Btn>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3">
            <div className="relative grid h-[74px] w-[74px] shrink-0 place-items-center">
              <svg viewBox="0 0 80 80" className="absolute -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#0b1530" strokeWidth="7" fill="none" />
                <circle cx="40" cy="40" r="34" stroke={t > 5 ? "#22d39a" : "#ff4f6d"} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - t / 15)} style={{ transition: "stroke-dashoffset 1s linear" }} />
              </svg>
              <span key={t} className="num anim-pop text-xl font-black" style={{ color: t > 5 ? "#22d39a" : "#ff4f6d" }}>{t}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold uppercase text-mist">Question {i + 1}/{rushQs.length} · <span className="text-gold">{score} pts</span></div>
              <div key={i} className="anim-slide-right font-display text-base font-extrabold leading-snug">{q.q}</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {q.a.map((a, k) => {
              const state = picked === null ? "idle" : k === q.c ? "ok" : picked === k ? "bad" : "dim";
              const c = rushColors[k];
              return (
                <button key={a} disabled={picked !== null} onClick={() => pick(k)} className="flex h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left transition-all active:translate-y-1"
                  style={{ borderColor: state === "ok" ? BULL : state === "bad" ? BEAR : c, background: state === "dim" ? "#15264a" : `${state === "ok" ? BULL : state === "bad" ? BEAR : c}1f`, boxShadow: `0 5px 0 ${state === "ok" ? "#10916a" : state === "bad" ? "#c02a47" : c + "aa"}`, transform: state !== "idle" ? "translateY(3px)" : undefined, opacity: state === "dim" ? 0.35 : 1 }}>
                  <span className="grid h-7 w-7 place-items-center rounded-lg text-[11px] font-black text-ink-900" style={{ background: state === "ok" ? BULL : state === "bad" ? BEAR : c }}>{k + 1}</span>
                  <span className="text-[14px] font-extrabold" style={{ color: state === "ok" ? BULL : state === "bad" ? BEAR : "#e8eeff" }}>{a}</span>
                  {state === "ok" && <Check size={18} className="anim-pop ml-auto text-bull" />}
                  {state === "bad" && <X size={18} className="anim-pop ml-auto text-bear" />}
                </button>
              );
            })}
          </div>
          <div key={picked} className="anim-fade min-h-[70px] rounded-2xl bg-ink-800 p-3">
            <div className="text-[10px] font-extrabold uppercase text-mist">{picked === q.c ? "✓ верно" : "💡 пояснение"}</div>
            <div className="text-[12px] text-snow/85">{q.why}</div>
          </div>
          <div className="mt-3">
            <div className="mb-1.5 text-[10px] font-extrabold uppercase text-mist">Live standings</div>
            <div className="space-y-1">
              {board.map((b, k) => (
                <div key={b.n} className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all duration-700" style={{ background: b.me ? "rgba(59,130,255,.15)" : "#111d3a", transform: `translateX(${k * 0}px)`, boxShadow: "0 2px 0 #060b18" }}>
                  <span className="num w-4 text-center font-black" style={{ color: k === 0 ? "#ffc53d" : "#8a9bc4" }}>{k + 1}</span>
                  <span className={cn("flex-1 text-[12px] font-extrabold", b.me && "text-sky")}>{b.n}</span>
                  <span className="num text-[12px] font-bold text-gold">{b.v}</span>
                </div>
              ))}
            </div>
          </div>
          {!run && <Btn tone="sky" size="sm" className="mt-3" onClick={reset}><RotateCcw size={14} /> New rush</Btn>}
        </>
      )}
    </Asset>
  );
}

/* ======================================================================
   D-02  DCA SIMULATOR — weekly buys vs lump sum, live average line
   ==================================================================== */
const dcaPrices = [64, 61, 55, 52, 57, 63, 68, 66, 71, 77, 74, 69, 73, 79, 84, 81, 86, 92, 88, 94, 99, 96, 102, 108];
function DcaSim() {
  const [bought, setBought] = useState(0);
  const [auto, setAuto] = useState(false);
  const [units, setUnits] = useState<number[]>([]);
  const invested = units.length * 500;
  const value = units.reduce((a, u, i) => a + u * dcaPrices[i], 0);
  const avg = units.length ? invested / units.reduce((a, u) => a + u, 0) : 0;
  const lumpUnits = 500 * 4 / dcaPrices[0];
  const lumpValue = units.length > 3 ? lumpUnits * dcaPrices[units.length - 1] : 0;
  useEffect(() => {
    if (!auto || bought >= dcaPrices.length) return;
    const t = setTimeout(() => { setUnits((u) => [...u, 500 / dcaPrices[u.length]]); setBought((b) => b + 1); sfx.tick(); }, 420);
    return () => clearTimeout(t);
  }, [auto, bought]);
  const buy = () => { if (bought >= dcaPrices.length) return; setUnits((u) => [...u, 500 / dcaPrices[u.length]]); setBought((b) => b + 1); sfx.coin(); };
  const shown = dcaPrices.slice(0, Math.max(1, units.length));
  const mn = Math.min(...dcaPrices) - 6, mx = Math.max(...dcaPrices) + 6;
  const px = (i: number) => 8 + (i / (dcaPrices.length - 1)) * 304;
  const py = (v: number) => 140 - ((v - mn) / (mx - mn)) * 124;
  const pnl = value - invested;
  return (
    <Asset code="D-02" title="DCA Simulator" desc="Покупай каждую неделю и смотри, как усредняет цена. Сравни себя с разовой покупкой в самом дорогом пике." hint="Покупай по неделям" specs={["24 weeks", "avg line", "vs lump sum"]}>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Invested", `$${invested}`, "#e8eeff"], ["Value", `$${Math.round(value)}`, value >= invested ? BULL : BEAR], ["Avg price", `$${avg.toFixed(1)}`, "#ffc53d"]].map(([l, v, c]) => (
          <div key={l as string} className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">{l as string}</div><div className="num text-sm font-extrabold" style={{ color: c as string }}>{v as string}</div></div>
        ))}
      </div>
      <div className="panel-inset mt-3 p-1 !rounded-2xl">
        <svg viewBox="0 0 320 150" className="h-40 w-full">
          <path d={dcaPrices.map((v, i) => `${i ? "L" : "M"}${px(i)} ${py(v)}`).join("")} fill="none" stroke="#2c4580" strokeWidth="2" />
          <path d={shown.map((v, i) => `${i ? "L" : "M"}${px(i)} ${py(v)}`).join("")} fill="none" stroke="#ffc53d" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px #ffc53d88)" }} />
          {units.map((_, i) => <circle key={i} cx={px(i)} cy={py(dcaPrices[i])} r="4.5" fill="#ffc53d" stroke="#0a1224" strokeWidth="2" style={{ animation: "pop-in .3s both" }} />)}
          {units.length > 1 && <line x1={px(0)} x2={px(units.length - 1)} y1={py(avg)} y2={py(avg)} stroke={BULL} strokeDasharray="4 4" strokeWidth="2" />}
          <text x="6" y="14" fontSize="9" fontWeight="900" fill="#2c4580">24w price path</text>
          {avg > 0 && <text x="250" y={py(avg) - 5} fontSize="9" fontWeight="900" fill={BULL}>AVG</text>}
        </svg>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Btn tone="gold" className="flex-1 !text-[#3b2600]" size="sm" disabled={bought >= dcaPrices.length} onClick={buy} silent>Buy week {bought + 1}</Btn>
        <button onClick={() => setAuto((a) => !a)} className={cn("h-11 rounded-xl px-3 text-[11px] font-extrabold uppercase transition", auto ? "bg-bull text-ink-900 shadow-[0_3px_0_#10916a]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{auto ? "pause" : "auto"}</button>
        <button onClick={() => { setUnits([]); setBought(0); setAuto(false); }} className="grid h-11 w-11 place-items-center rounded-xl bg-ink-800 text-mist shadow-[0_3px_0_#08112a]"><RotateCcw size={16} /></button>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-800 px-3 py-2 text-[11px]">
        <span className="text-mist">Разовая покупка в пике #{bought}</span>
        <span className="num font-extrabold" style={{ color: pnl >= 0 ? BULL : BEAR }}>{invested ? `${pnl >= 0 ? "+" : ""}${Math.round(value - lumpValue - invested + invested)}` : "—"}</span>
      </div>
      <div className="mt-3"><Bar value={(bought / dcaPrices.length) * 100} tone="gold" h={10} glow={false} /></div>
    </Asset>
  );
}

/* ======================================================================
   D-03  FIBONACCI RETRACEMENT — choose the level that holds
   ==================================================================== */
const fibCloses = [100, 104, 108, 113, 118, 124, 131, 137, 133, 128, 126, 124, 123, 127, 130, 129, 134, 138, 141, 145];
function Fibonacci() {
  const data = useMemo(() => fromCloses(fibCloses, 0.6, 99), []);
  const swingLo = 100, swingHi = 145;
  const levels = [0.236, 0.382, 0.5, 0.618, 0.786].map((r) => ({ r, price: swingHi - (swingHi - swingLo) * r }));
  const truth = 4; // 0.618 is the one that held
  const [pick, setPick] = useState<number | null>(null);
  const W = 320, H = 190;
  const s = useMemo(() => makeScale(data, W, H, 14, levels.map((l) => l.price)), [data]);
  const ok = pick === truth;
  return (
    <Asset code="D-03" title="Fibonacci Retracement" desc="Определи, какой уровень отката выдержал. Линия рисуется на графике, после проверки — зона отскока." hint="Выбери уровень" specs={["5 ratios", "swing 100→145", "reveal"]}>
      <div className="panel-inset p-1 !rounded-2xl">
        <CandleChart data={data} s={s} W={W} H={H} animate={false}>
          {(sc) => (
            <>
              <rect x="0" y={sc.y(swingHi + 0.5)} width={sc.W} height={sc.y(swingHi - 0.5) - sc.y(swingHi + 0.5)} fill={BEAR} opacity=".25" />
              <rect x="0" y={sc.y(swingLo + 0.5)} width={sc.W} height={sc.y(swingLo - 0.5) - sc.y(swingLo + 0.5)} fill={BULL} opacity=".25" />
              {levels.map((l, k) => (
                <g key={k}>
                  <line x1="0" x2={sc.W} y1={sc.y(l.price)} y2={sc.y(l.price)} stroke={pick === k ? (ok ? BULL : BEAR) : "#3a5494"} strokeWidth={pick === k ? 2.5 : 1.4} strokeDasharray={pick === k ? "none" : "4 4"} />
                  <text x="6" y={sc.y(l.price) - 3} fontSize="9" fontWeight="900" fill={pick === k ? (ok ? BULL : BEAR) : "#8a9bc4"}>{(l.r * 100).toFixed(1)}% · {l.price.toFixed(1)}</text>
                </g>
              ))}
              {pick !== null && (
                <g style={{ animation: "fade-in .5s .3s both" }}>
                  <rect x={sc.x(10)} y={sc.y(127)} width={sc.W - sc.x(10)} height={sc.y(120) - sc.y(127)} fill={BULL} opacity=".18" />
                  <text x={sc.x(11)} y={sc.y(126)} fontSize="9" fontWeight="900" fill={BULL}>BOUNCE ZONE</text>
                </g>
              )}
            </>
          )}
        </CandleChart>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {levels.map((l, k) => (
          <button key={k} disabled={pick !== null} onClick={() => { setPick(k); k === truth ? sfx.correct() : sfx.wrong(); }} className={cn("num h-11 rounded-xl text-[11px] font-extrabold transition active:translate-y-0.5", pick === null ? "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]" : k === truth ? "bg-bull text-ink-900" : pick === k ? "anim-shake bg-bear text-white" : "bg-ink-800/50 text-mist/40")}>
          {(l.r * 100).toFixed(1)}
        </button>
      ))}
      </div>
      {pick !== null && (
        <div key={ok ? "o" : "c"} className={cn("anim-pop mt-3 rounded-2xl p-3 text-[12px]", ok ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
          {ok ? "0.618 — «золотое сечение»: цена отскочила именно от него и обновила максимум." : `Неверно. Уровень 0.618 (${levels[truth].price.toFixed(1)}) дал отскок, а от него развернулись трендовые сделки.`}
        </div>
      )}
      <div className="mt-3">{pick !== null && <Btn tone="sky" block size="sm" onClick={() => setPick(null)}><RotateCcw size={14} /> Again</Btn>}</div>
    </Asset>
  );
}

/* ======================================================================
   D-04  SLIPPAGE — market vs limit, real cost of crossing the spread
   ==================================================================== */
function Slippage() {
  const [mode, setMode] = useState<"idle" | "market" | "limit">("idle");
  const [round, setRound] = useState(0);
  const asks = [64224, 64226, 64229, 64233, 64239];
  const bids = [64219, 64216, 64212, 64207, 64201];
  const mid = (asks[0] + bids[0]) / 2;
  const size = 0.5;
  const marketFill = (asks[0] + asks[1] + asks[2]) / 3;
  const cost = (marketFill - mid) * size;
  const verdict = mode === "market" ? "paid" : mode === "limit" ? "waited" : null;
  const rounds: { q: string; correct: "market" | "limit"; why: string }[] = [
    { q: "Срочно 0.5 BTC до закрытия свечи?", correct: "market", why: "Рыночный ордер исполняется сразу — плата за скорость." },
    { q: "Цена упала к заранее выбранному уровню?", correct: "limit", why: "Лимитный стоит на стакане и исполняется без слейпиджа." },
    { q: "Тонкий стакан, цена может уйти?", correct: "market", why: "Ожидание в тонком стакане — хуже, чем немедленное исполнение." },
  ];
  const r = rounds[round % rounds.length];
  const choose = (m: "market" | "limit") => {
    setMode(m);
    (m === r.correct ? sfx.correct : sfx.wrong)();
    setTimeout(() => { setRound((x) => x + 1); setMode("idle"); }, 1900);
  };
  return (
    <Asset code="D-04" title="Spread & Slippage" desc="Настоящий стакан: рыночный ордер собирает ликвидность по трём уровням и платит разницей от средней цены." hint="Выбери ордер для задачи" specs={["5 levels", "cost calc", "3 tasks"]}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-ink-900/70 p-2">
          <div className="mb-1 text-center text-[9px] font-extrabold uppercase text-bear">asks</div>
          {asks.map((a, k) => (
            <div key={a} className={cn("num relative flex h-6 items-center justify-between rounded px-1.5 text-[11px] font-bold transition-all", mode === "market" && k < 3 && "ring-1 ring-bull")}>
              <span className="absolute inset-y-0 right-0 rounded bg-bear/20 transition-all" style={{ width: `${28 + k * 16}%` }} />
              <span className="relative text-bear">{a}</span><span className="relative text-mist">{(0.8 - k * 0.13).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-ink-900/70 p-2">
          <div className="mb-1 text-center text-[9px] font-extrabold uppercase text-bull">bids</div>
          {bids.map((b, k) => (
            <div key={b} className={cn("num relative flex h-6 items-center justify-between rounded px-1.5 text-[11px] font-bold transition-all", mode === "limit" && k === 0 && "ring-1 ring-sky")}>
              <span className="absolute inset-y-0 right-0 rounded bg-bull/20 transition-all" style={{ width: `${28 + k * 16}%` }} />
              <span className="relative text-bull">{b}</span><span className="relative text-mist">{(0.7 - k * 0.11).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-ink-800 px-3 py-1.5 text-[11px]">
        <span className="text-mist">spread</span><span className="num font-extrabold text-gold">{asks[0] - bids[0]}</span>
        <span className="text-mist">mid</span><span className="num font-extrabold">{mid}</span>
      </div>
      <div className="mt-3 rounded-2xl bg-ink-700 p-3">
        <div className="text-[10px] font-extrabold uppercase text-gold">Задача {round + 1}/3</div>
        <div className="text-[13px] font-bold">{r.q}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Btn tone="bull" size="sm" onClick={() => choose("market")} disabled={mode !== "idle"} silent>Market buy</Btn>
        <Btn tone="sky" size="sm" onClick={() => choose("limit")} disabled={mode !== "idle"} silent>Limit bid</Btn>
      </div>
      {verdict && (
        <div key={round} className={cn("anim-pop mt-3 rounded-2xl p-3 text-[12px]", verdict === "paid" ? "bg-gold/15 text-gold" : "bg-bull/15 text-bull")}>
          {mode === "market" ? <>Fill ${marketFill} · cost <span className="num font-extrabold">${cost.toFixed(2)}</span> · </> : <>Fill по цене {bids[0]}, без слейпиджа, но ждать. </>}
          {r.why}
        </div>
      )}
    </Asset>
  );
}

/* ======================================================================
   D-05  JOURNAL REVIEW — find what went wrong in 3 past trades
   ==================================================================== */
const flagPool = ["Нет стоп-лосса", "Риск 25%", "Месть после убытка", "Покупка на пике FOMO", "Плечо 50x", "Нет плана выхода", "Избыточная частота", "Сорвал прибыль на 10%"];
const journal = [
  { id: 0, t: "LONG BTC 3x", d: "Вход 68 400 → выход 64 100", bad: [0, 1, 5], why: "Три ошибки сразу: без защитного ордера, риск четверть банка и непонятный план выхода." },
  { id: 1, t: "SHORT ETH 5x", d: "Убыток −4% сразу после боя с рынком", bad: [2, 4], why: "Месть после убытка и плечо — самая частая пара в торговых отчётах." },
  { id: 2, t: "LONG SOL 1x", d: "Куплен на +18% дневного движения", bad: [3, 6], why: "Преследование FOMO-входа и лишние клики: 6 сделок за сессию." },
];
function JournalReview() {
  const [ti, setTi] = useState(0);
  const [sel, setSel] = useState<number[]>([]);
  const [res, setRes] = useState<null | boolean>(null);
  const trade = journal[ti];
  const check = () => {
    const ok = flagPool.filter((_, i) => trade.bad.includes(i)).every((b) => sel.includes(flagPool.indexOf(b))) && sel.length === trade.bad.length;
    setRes(ok);
    ok ? sfx.correct() : sfx.wrong();
  };
  const next = () => { setTi((x) => (x + 1) % journal.length); setSel([]); setRes(null); };
  return (
    <Asset code="D-05" title="Journal Review" desc="Разбор своих прошлых сделок: отмечь красные флаги, проверь, потом читай разбор тренера." hint="Отметь ошибки" specs={["3 trades", "multi-select", "coach notes"]}>
      <div className="flex gap-1.5">
        {journal.map((_, k) => <span key={k} className={cn("h-2 flex-1 rounded-full", k < ti || (k === ti && res !== null) ? "bg-bull" : k === ti ? "bg-sky" : "bg-ink-700")} />)}
      </div>
      <div key={ti} className="anim-slide-right mt-3 rounded-2xl border border-white/10 bg-ink-800 p-3.5">
        <div className="flex items-center gap-2">
          <ScrollText size={16} className="text-sky" />
          <span className="font-display text-sm font-extrabold">{trade.t}</span>
          <span className="num ml-auto text-[11px] text-bear">{trade.d}</span>
        </div>
        <div className="mt-2 grid grid-cols-10 gap-1">
          {[...Array(30)].map((_, k) => <div key={k} className="h-6 rounded-sm" style={{ background: k < 16 ? "#22d39a" : "#ff4f6d", opacity: 0.35 + ((k * 13) % 6) / 10 }} />)}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {flagPool.map((f, k) => {
          const on = sel.includes(k);
          const correctFlag = res !== null && trade.bad.includes(k);
          return (
            <button key={f} disabled={res !== null} onClick={() => { setSel(on ? sel.filter((x) => x !== k) : [...sel, k]); sfx.tick(); }}
              className={cn("flex min-h-[46px] items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 text-left text-[11px] font-bold transition active:translate-y-0.5",
                res === null ? on ? "border-sky bg-sky/15" : "border-ink-500 bg-ink-700" : correctFlag ? "border-bull bg-bull/20" : on ? "anim-shake border-bear bg-bear/20" : "border-ink-700 bg-ink-800/50 opacity-50")}>
              <span className={cn("grid h-4 w-4 shrink-0 place-items-center rounded border", on ? "border-sky bg-sky" : "border-ink-400")}>{on && <Check size={11} strokeWidth={4} className="text-white" />}</span>
              {f}
            </button>
          );
        })}
      </div>
      {res !== null && (
        <div className={cn("anim-pop mt-3 rounded-2xl p-3 text-[12px]", res ? "bg-bull/15" : "bg-bear/15")}>
          <div className={cn("font-display text-sm font-extrabold", res ? "text-bull" : "text-bear")}>{res ? "Точно поймал ошибки" : "Что-то упустил"}</div>
          <div className="mt-0.5 text-snow/80">{trade.why}</div>
        </div>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <GhostBtn className="!h-11 !text-[10px]" disabled={res !== null} onClick={check}><Check size={13} /> Check</GhostBtn>
        <Btn tone="sky" className="!h-11 !text-[10px]" disabled={res === null} onClick={next}>Next trade →</Btn>
      </div>
    </Asset>
  );
}

/* ======================================================================
   D-06  RISK OF RUIN — pick a risk size, run 60 rounds, watch survival
   ==================================================================== */
function RiskOfRuin() {
  const [risk, setRisk] = useState(1);
  const [curve, setCurve] = useState<number[]>([100]);
  const [run, setRun] = useState(false);
  const iv = useRef<number>(0);
  useEffect(() => () => clearInterval(iv.current), []);
  const start = () => {
    setCurve([100]); setRun(true);
    clearInterval(iv.current);
    let i = 0;
    iv.current = window.setInterval(() => {
      i++;
      setCurve((c) => {
        const last = c[c.length - 1];
        if (last <= 0) { clearInterval(iv.current); return [...c, 0]; }
        const up = Math.random() > 0.46;
        const next = up ? last * (1 + risk / 100 * 1.6) : last * (1 - risk / 100);
        return [...c, Math.round(next * 10) / 10];
      });
      if (i >= 60) {
        clearInterval(iv.current);
        setRun(false);
        setTimeout(() => {
          setCurve((c) => { const last = c[c.length - 1]; last > 100 ? sfx.levelUp() : sfx.wrong(); return c; });
        }, 200);
      }
    }, 130);
    sfxRaw.swipe();
  };
  const last = curve[curve.length - 1];
  const alive = last > 0;
  const best = Math.max(...curve);
  const W = 320, H = 150;
  const mn = 0, mx = Math.max(140, best + 10);
  const pts = curve.map((v, i) => `${(i / (curve.length - 1)) * W} ${H - ((v - mn) / (mx - mn)) * H}`).join(" ");
  return (
    <Asset code="D-06" title="Risk of Ruin" desc="Выбери риск на сделку и прогони 60 кругов рынка. При 25% депозит умирает, при 1% — переживает серию." hint="Смени риск и запусти" specs={["60 rounds", "equity curve", "ruin at ≤0"]} className="md:col-span-2 xl:col-span-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="panel-inset relative overflow-hidden p-2 !rounded-2xl">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full">
              {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#3a5494" strokeOpacity=".3" strokeDasharray="3 4" />)}
              <line x1="0" x2={W} y1={H - (100 / mx) * H} y2={H - (100 / mx) * H} stroke="#e8eeff" strokeOpacity=".4" strokeDasharray="4 4" />
              <polyline points={pts} fill="none" stroke={alive ? (last >= 100 ? BULL : "#ffc53d") : BEAR} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${alive ? "#22d39a88" : "#ff4f6d88"})` }} />
              {!alive && <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="20" fontWeight="900" fill={BEAR}>RUIN</text>}
            </svg>
            {!run && !alive && (
              <div className="absolute inset-0 grid place-items-center bg-ink-950/60">
                <Btn tone="gold" size="sm" className="!text-[#3b2600]" onClick={start}><Play size={14} /> Run 60 rounds</Btn>
              </div>
            )}
            {run && <div className="absolute inset-x-3 bottom-3"><Bar value={(curve.length / 61) * 100} tone="sky" h={7} glow={false} /></div>}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[["Final", `${last.toFixed(0)}%`, last >= 100 ? BULL : BEAR], ["Peak", `${best.toFixed(0)}%`, "#ffc53d"], ["Rounds", curve.length, "#8a9bc4"]].map(([l, v, c]) => (
              <div key={l as string} className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">{l as string}</div><div className="num text-sm font-extrabold" style={{ color: c as string }}>{v as string}</div></div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-[11px] font-extrabold uppercase text-mist">Risk per trade</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[1, 5, 12, 25].map((r) => (
              <button key={r} onClick={() => { setRisk(r); sfx.tick(); }} disabled={run} className={cn("h-14 rounded-xl text-center transition active:translate-y-0.5", risk === r ? "text-ink-900" : "bg-ink-800 text-mist shadow-[0_4px_0_#08112a]")}
                style={risk === r ? { background: r <= 1 ? BULL : r <= 5 ? "#ffc53d" : r <= 12 ? "#ff8a3d" : BEAR, boxShadow: "0 4px 0 rgba(0,0,0,.35)" } : undefined}>
                <div className="num text-lg font-black">{r}%</div>
                <div className="text-[9px] font-bold uppercase">{r <= 1 ? "safe" : r <= 5 ? "ok" : r <= 12 ? "risky" : "doom"}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-2xl bg-ink-800 p-3 text-[12px] leading-snug text-mist">
            Вероятность прогореть: <span className="num font-extrabold" style={{ color: risk === 1 ? BULL : risk === 5 ? "#ffc53d" : BEAR }}>{risk === 1 ? "<5%" : risk === 5 ? "~18%" : risk === 12 ? "~45%" : "92%"}</span>.
            При {risk}% просадка −25% требует прироста +33%, чтобы вернуться к нулю.
          </div>
          <div className="mt-auto pt-3">
            <Btn tone={run ? "sky" : "bull"} block disabled={run} onClick={start} silent><Play size={14} /> {run ? "Running…" : "Run 60 rounds"}</Btn>
          </div>
        </div>
      </div>
    </Asset>
  );
}

export default function Drills() {
  return (
    <Section id="drills" index="D" title="Drills · Advanced Practice" subtitle="Скоростной экзамен, усреднение, Фибоначчи, слейпидж, журнал сделок и риск разорения">
      <QuizRush />
      <DcaSim />
      <Fibonacci />
      <Slippage />
      <JournalReview />
      <RiskOfRuin />
    </Section>
  );
}
