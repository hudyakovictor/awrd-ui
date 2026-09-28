import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, ArrowDown, RotateCcw, Lightbulb, Timer, ShieldAlert, Check, X, Eye, Zap } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { CandleChart, genSeries, fromCloses, makeScale, svgPoint, Stamp, BULL, BEAR, type Candle } from "../kit/chart";
import { clamp } from "../kit/motion";
import { useGame } from "../kit/game";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ======================================================================
   P-01  SWIPE BULL / BEAR — Tinder-style scenario deck
   ==================================================================== */
const scenarios = [
  { t: "BTC пробил сопротивление $70k на рекордном объёме", a: "bull", why: "Пробой на объёме — классический сигнал продолжения." },
  { t: "Крупная биржа приостановила вывод средств", a: "bear", why: "Страх заражения и продажи в панике." },
  { t: "Три свечи подряд с длинными верхними тенями у максимума", a: "bear", why: "Продавцы каждый раз возвращают цену вниз." },
  { t: "Одобрен спотовый ETF на Ethereum", a: "bull", why: "Новый поток институциональных денег." },
  { t: "Цена ушла ниже 200-дневной средней и не вернулась", a: "bear", why: "Долгосрочный тренд сломан." },
  { t: "Бычье поглощение на уровне сильной поддержки", a: "bull", why: "Разворотный паттерн в правильном месте." },
  { t: "Хакеры вывели $300M из популярного моста", a: "bear", why: "Удар по доверию к экосистеме." },
  { t: "Повышающиеся минимумы 4 недели подряд", a: "bull", why: "Структура восходящего тренда." },
];
function SwipeDeck() {
  const [i, setI] = useState(0);
  const [d, setD] = useState({ x: 0, y: 0 });
  const [fly, setFly] = useState<"bull" | "bear" | null>(null);
  const [res, setRes] = useState<boolean[]>([]);
  const [last, setLast] = useState<{ ok: boolean; why: string } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const { celebrate } = useGame();
  const done = i >= scenarios.length;

  const decide = (dir: "bull" | "bear") => {
    if (fly || done) return;
    setFly(dir);
    sfxRaw.swipe();
    const sc = scenarios[i];
    const ok = sc.a === dir;
    setTimeout(() => {
      ok ? sfx.correct() : sfx.wrong();
      setRes((r) => [...r, ok]);
      setLast({ ok, why: sc.why });
      setI((x) => x + 1);
      setFly(null);
      setD({ x: 0, y: 0 });
      if (i + 1 === scenarios.length) setTimeout(() => celebrate("Колода пройдена!", `${[...res, ok].filter(Boolean).length}/${scenarios.length} верно`), 300);
    }, 280);
  };
  const tx = fly === "bull" ? 520 : fly === "bear" ? -520 : d.x;
  return (
    <Asset code="PR-01" title="Swipe: Bull or Bear?" desc="Колода рыночных сценариев. Свайп вправо = рост, влево = падение. Штампы появляются по мере свайпа." hint="Свайпай карточки" specs={["drag physics", "stamps", "8 scenarios"]} className="xl:row-span-2">
      <div className="mb-3 flex items-center gap-2">
        {scenarios.map((_, k) => <span key={k} className={cn("h-2 flex-1 rounded-full transition-colors", k < res.length ? (res[k] ? "bg-bull" : "bg-bear") : k === i ? "bg-sky" : "bg-ink-700")} />)}
      </div>
      <div className="relative h-[330px]">
        {done ? (
          <div className="anim-pop flex h-full flex-col items-center justify-center rounded-3xl bg-ink-900/60 text-center">
            <Mascot size={110} mood={res.filter(Boolean).length >= 6 ? "hype" : "think"} />
            <div className="font-display mt-2 text-xl font-extrabold">{res.filter(Boolean).length}/{scenarios.length} верно</div>
            <div className="text-[12px] text-mist">Точность {Math.round((res.filter(Boolean).length / scenarios.length) * 100)}%</div>
            <Btn tone="sky" size="sm" className="mt-3" onClick={() => { setI(0); setRes([]); setLast(null); }}><RotateCcw size={14} /> New deck</Btn>
          </div>
        ) : (
          scenarios.slice(i, i + 3).reverse().map((sc, rk, arr) => {
            const depth = arr.length - 1 - rk;
            const top = depth === 0;
            return (
              <div
                key={i + depth}
                className="absolute inset-0 touch-none select-none"
                style={{
                  transform: top ? `translate(${tx}px, ${d.y}px) rotate(${tx / 14}deg)` : `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`,
                  transition: start.current && top ? "none" : "transform .4s cubic-bezier(.3,1.2,.5,1)",
                  zIndex: 10 - depth,
                }}
                onPointerDown={top ? (e) => { start.current = { x: e.clientX, y: e.clientY }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } : undefined}
                onPointerMove={top ? (e) => { if (start.current) setD({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.4 }); } : undefined}
                onPointerUp={top ? () => { start.current = null; if (d.x > 110) decide("bull"); else if (d.x < -110) decide("bear"); else setD({ x: 0, y: 0 }); } : undefined}
              >
                <div className="relative flex h-full cursor-grab flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-600 to-ink-800 p-5 shadow-[0_10px_0_#08112a,0_30px_40px_-10px_rgba(0,0,0,.6)] active:cursor-grabbing">
                  <div className="absolute inset-0 transition-opacity" style={{ background: `linear-gradient(90deg, ${BEAR}55, transparent 40%, transparent 60%, ${BULL}55)`, opacity: top ? clamp(Math.abs(tx) / 160, 0, 1) : 0, maskImage: tx > 0 ? "linear-gradient(90deg,transparent 50%,#000)" : "linear-gradient(90deg,#000,transparent 50%)", WebkitMaskImage: tx > 0 ? "linear-gradient(90deg,transparent 50%,#000)" : "linear-gradient(90deg,#000,transparent 50%)" }} />
                  <div className="relative flex items-center justify-between">
                    <Chip tone="sky">Scenario {i + depth + 1}</Chip>
                    <span className="num text-[10px] text-mist">BREAKING</span>
                  </div>
                  <div className="relative mt-6 flex-1">
                    <div className="font-display text-[19px] font-extrabold leading-snug">{sc.t}</div>
                  </div>
                  <div className="relative mt-4 grid h-20 grid-cols-12 items-end gap-1 opacity-60">
                    {[...Array(12)].map((_, k) => <div key={k} className="rounded-sm" style={{ height: `${20 + ((k * 37 + i * 11) % 70)}%`, background: (k + i) % 3 ? "#3a5494" : "#273f75" }} />)}
                  </div>
                  {top && (
                    <>
                      <div className="absolute left-5 top-16" style={{ opacity: clamp(tx / 110, 0, 1) }}><Stamp text="BULL ▲" color={BULL} show /></div>
                      <div className="absolute right-5 top-16" style={{ opacity: clamp(-tx / 110, 0, 1) }}><Stamp text="BEAR ▼" color={BEAR} show /></div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-6 min-h-[48px]">
        {last && <div key={res.length} className={cn("anim-slide-right flex items-start gap-2 rounded-xl p-2.5 text-[12px]", last.ok ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>{last.ok ? <Check size={15} /> : <X size={15} />}<span className="text-snow/85">{last.why}</span></div>}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Btn tone="bear" size="lg" onClick={() => decide("bear")} disabled={done} silent><ArrowDown size={18} strokeWidth={3} /> Bear</Btn>
        <Btn tone="bull" size="lg" onClick={() => decide("bull")} disabled={done} silent><ArrowUp size={18} strokeWidth={3} /> Bull</Btn>
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-02  PATTERN SPOTTER — find the pattern among generated candles
   ==================================================================== */
type PatKind = "Hammer" | "Shooting Star" | "Doji" | "Bullish Engulfing";
function buildRound(seed: number): { data: Candle[]; k: number; kind: PatKind } {
  const kinds: PatKind[] = ["Hammer", "Shooting Star", "Doji", "Bullish Engulfing"];
  const kind = kinds[seed % kinds.length];
  const base = genSeries(seed * 7 + 3, 18, { vol: 1.4 });
  const k = 8 + (seed * 5) % 7;
  const data = base.map((c) => ({ ...c }));
  const shift = (from: number, dir: number) => {
    for (let j = from; j < k; j++) {
      const p = data[j - 1].c;
      const c = p + dir * (0.9 + (j % 2) * 0.3);
      data[j] = { o: p, c, h: Math.max(p, c) + 0.3, l: Math.min(p, c) - 0.3 };
    }
  };
  if (kind === "Hammer" || kind === "Bullish Engulfing") shift(k - 3, -1);
  if (kind === "Shooting Star") shift(k - 3, 1);
  const p = data[k - 1].c;
  if (kind === "Hammer") data[k] = { o: p - 0.2, c: p + 0.25, h: p + 0.4, l: p - 3.6 };
  if (kind === "Shooting Star") data[k] = { o: p + 0.2, c: p - 0.2, h: p + 3.6, l: p - 0.4 };
  if (kind === "Doji") data[k] = { o: p, c: p + 0.03, h: p + 1.9, l: p - 1.9 };
  if (kind === "Bullish Engulfing") {
    data[k - 1] = { o: data[k - 2].c, c: data[k - 2].c - 0.8, h: data[k - 2].c + 0.2, l: data[k - 2].c - 1 };
    const q = data[k - 1].c;
    data[k] = { o: q - 0.3, c: q + 1.9, h: q + 2.1, l: q - 0.5 };
  }
  for (let j = k + 1; j < data.length; j++) {
    const pp = data[j - 1].c;
    const dd = data[j].c - data[j].o;
    data[j] = { o: pp, c: pp + dd, h: Math.max(pp, pp + dd) + 0.4, l: Math.min(pp, pp + dd) - 0.4 };
  }
  return { data, k, kind };
}
function PatternSpotter() {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [wrongs, setWrongs] = useState<number[]>([]);
  const [found, setFound] = useState(false);
  const [hint, setHint] = useState(false);
  const r = useMemo(() => buildRound(round), [round]);
  const TOTAL = 5;
  const pick = (i: number) => {
    if (found) return;
    if (i === r.k) { setFound(true); setScore((s) => s + (hint ? 5 : wrongs.length ? 7 : 10)); sfx.correct(); }
    else if (!wrongs.includes(i)) { setWrongs((w) => [...w, i]); sfx.wrong(); }
  };
  const next = () => {
    if (round >= TOTAL) { sfx.levelUp(); setRound(1); setScore(0); } else setRound((x) => x + 1);
    setWrongs([]); setFound(false); setHint(false);
  };
  return (
    <Asset code="PR-02" title="Pattern Spotter" desc="Найди на графике указанный паттерн. Каждый раунд — новый сгенерированный рынок." hint="Тапни нужную свечу" specs={["procedural", "5 rounds", "hint penalty"]}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">Round {round}/{TOTAL}</div>
          <div className="font-display text-base font-extrabold">Найди: <span className="text-gold">{r.kind}</span></div>
        </div>
        <div className="text-right"><div className="text-[10px] font-bold uppercase text-mist">Score</div><div key={score} className="num anim-pop text-xl font-extrabold text-gold">{score}</div></div>
      </div>
      <div key={round} className={cn("panel-inset relative p-2 !rounded-2xl", wrongs.length && !found && "anim-shake")}>
        <CandleChart
          data={r.data}
          W={320}
          H={180}
          onPick={pick}
          highlight={found ? [r.k] : hint ? [r.k - 2, r.k - 1, r.k, r.k + 1, r.k + 2] : undefined}
          dimOthers={found || hint}
          colorOf={(i) => (wrongs.includes(i) ? "#ff8a3d" : undefined)}
        >
          {(s) => (
            <>
              {wrongs.map((w) => <text key={w} x={s.x(w)} y={s.y(r.data[w].h) - 6} textAnchor="middle" fontSize="11" fontWeight="900" fill="#ff8a3d" style={{ animation: "pop-in .3s both" }}>✗</text>)}
              {found && <g style={{ animation: "pop-in .45s both" }}><circle cx={s.x(r.k)} cy={s.y((r.data[r.k].h + r.data[r.k].l) / 2)} r="20" fill="none" stroke={BULL} strokeWidth="2.5" /><rect x={s.x(r.k) - 34} y={s.y(r.data[r.k].h) - 26} width="68" height="16" rx="5" fill={BULL} /><text x={s.x(r.k)} y={s.y(r.data[r.k].h) - 15} textAnchor="middle" fontSize="9" fontWeight="900" fill="#0a1224">{r.kind.toUpperCase()}</text></g>}
            </>
          )}
        </CandleChart>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <GhostBtn className="!h-11 !text-[10px]" disabled={found || hint} onClick={() => { setHint(true); sfxRaw.pop(); }}><Lightbulb size={14} /> Hint (−5)</GhostBtn>
        <Btn tone={found ? "bull" : "sky"} className="!h-11 !text-[10px]" disabled={!found} onClick={next}>{round >= TOTAL && found ? "Finish" : "Next round"}</Btn>
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-03  PLACE THE STOP-LOSS — drag a line, then watch the future play out
   ==================================================================== */
const slPast = [100, 101.2, 100.4, 102.5, 101.1, 99.2, 100.6, 102.4, 104, 103.1, 105.2, 104.3, 106.1];
const slFuture = [105, 103.4, 101.9, 100.1, 99.6, 101.8, 104.2, 106.8, 108.6, 110.3];
function StopLoss() {
  const past = useMemo(() => fromCloses(slPast, 0.7, 99.4), []);
  const future = useMemo(() => fromCloses(slFuture, 0.6, slPast[slPast.length - 1]).map((c, i) => (i === 4 ? { ...c, l: 99.45 } : c)), []);
  const all = useMemo(() => [...past, ...future], [past, future]);
  const W = 330, H = 200;
  const s = useMemo(() => makeScale(all, W, H, 14, [96]), [all]);
  const support = 99.2 - 0.7 * 0.6; // lowest wick of the swing low ≈ 98.8
  const entry = slPast[slPast.length - 1];
  const [sl, setSl] = useState(103.5);
  const [drag, setDrag] = useState(false);
  const [shown, setShown] = useState(0);
  const [verdict, setVerdict] = useState<null | "tight" | "good" | "wide">(null);
  const svg = useRef<SVGSVGElement>(null);
  const risk = ((entry - sl) / entry) * 100;

  const submit = () => {
    if (verdict) return;
    const v = sl > 99.45 ? "tight" : sl >= 96.8 ? "good" : "wide";
    let n = 0;
    const t = setInterval(() => {
      n++;
      setShown(n);
      sfx.tick();
      if (n >= future.length) {
        clearInterval(t);
        setVerdict(v);
        v === "good" ? sfx.correct() : sfx.wrong();
      }
    }, 170);
  };
  const reset = () => { setShown(0); setVerdict(null); setSl(103.5); };
  const stopped = verdict === "tight";
  return (
    <Asset code="PR-03" title="Place the Stop-Loss" desc="Тащи линию стопа. Потом рынок проиграет будущее: слишком близкий стоп выбьет, слишком далёкий — лишний риск." hint="Тащи синюю линию" specs={["drag line", "future replay", "3 outcomes"]}>
      <div className="panel-inset relative p-2 !rounded-2xl">
        <CandleChart
          data={[...past, ...future.slice(0, shown)]}
          s={s}
          W={W}
          H={H}
          animate={false}
          svgRef={svg}
          style={{ cursor: verdict ? "default" : "ns-resize" }}
          onPointerDown={(e) => { if (verdict || shown) return; setDrag(true); (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId); setSl(clamp(s.inv(svgPoint(svg.current!, e.clientX, e.clientY, W, H).y), 94, entry - 0.3)); }}
          onPointerMove={(e) => { if (drag) { const v = clamp(s.inv(svgPoint(svg.current!, e.clientX, e.clientY, W, H).y), 94, entry - 0.3); if (Math.abs(v - sl) > 0.35) sfx.tick(); setSl(v); } }}
          onPointerUp={() => setDrag(false)}
          under={(sc) => <rect x="0" y={sc.y(99.6)} width={sc.W} height={sc.y(98.6) - sc.y(99.6)} fill={BULL} opacity=".1" />}
        >
          {(sc) => (
            <>
              <line x1="0" x2={sc.W} y1={sc.y(support)} y2={sc.y(support)} stroke={BULL} strokeDasharray="4 4" strokeOpacity=".7" />
              <text x="6" y={sc.y(support) + 12} fontSize="9" fontWeight="800" fill={BULL}>support</text>
              <line x1={sc.x(12)} x2={sc.W} y1={sc.y(entry)} y2={sc.y(entry)} stroke="#e8eeff" strokeOpacity=".6" />
              <text x={sc.W - 6} y={sc.y(entry) - 4} textAnchor="end" fontSize="9" fontWeight="800" fill="#e8eeff">ENTRY {entry}</text>
              <rect x={sc.x(12)} y={sc.y(entry)} width={sc.W - sc.x(12)} height={Math.max(0, sc.y(sl) - sc.y(entry))} fill={BEAR} opacity=".12" />
              <line x1="0" x2={sc.W} y1={sc.y(sl)} y2={sc.y(sl)} stroke={stopped ? BEAR : "#3b82ff"} strokeWidth={drag ? 3 : 2} style={{ filter: `drop-shadow(0 0 4px ${stopped ? BEAR : "#3b82ff"})` }} />
              <g transform={`translate(${sc.W - 62} ${sc.y(sl) - 9})`}>
                <rect width="58" height="18" rx="6" fill={stopped ? BEAR : "#3b82ff"} />
                <text x="29" y="12.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">SL {sl.toFixed(1)}</text>
              </g>
              {!verdict && !shown && <g transform={`translate(${sc.W / 2} ${sc.y(sl)})`}><rect x="-10" y="-10" width="20" height="20" rx="6" fill="#fff" /><path d="M-4 -2l4-4 4 4M-4 2l4 4 4-4" stroke="#0a1224" strokeWidth="1.8" fill="none" strokeLinecap="round" /></g>}
            </>
          )}
        </CandleChart>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Risk</div><div className={cn("num text-sm font-extrabold", risk > 7 ? "text-bear" : risk < 3.5 ? "text-gold" : "text-bull")}>{risk.toFixed(1)}%</div></div>
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">Distance</div><div className="num text-sm font-extrabold">{(entry - sl).toFixed(1)}</div></div>
        <div className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">vs support</div><div className="num text-sm font-extrabold">{sl < support ? "below" : "above"}</div></div>
      </div>
      {verdict && (
        <div className={cn("anim-pop mt-3 rounded-2xl p-3 text-[12px]", verdict === "good" ? "bg-bull/15" : verdict === "tight" ? "bg-bear/15" : "bg-gold/15")}>
          <div className={cn("font-display text-sm font-extrabold", verdict === "good" ? "text-bull" : verdict === "tight" ? "text-bear" : "text-gold")}>{verdict === "good" ? "Идеально — пережил откат и забрал рост" : verdict === "tight" ? "Выбило стопом у поддержки" : "Выжил, но риск слишком большой"}</div>
          <div className="mt-0.5 text-snow/75">{verdict === "good" ? "Стоп чуть ниже поддержки: откат его не задел." : verdict === "tight" ? "Стоп выше поддержки — обычный шум рынка его снимает." : "Далёкий стоп = маленькая позиция или огромный убыток."}</div>
        </div>
      )}
      <div className="mt-3">{verdict ? <Btn tone="sky" block size="sm" onClick={reset}><RotateCcw size={14} /> Try again</Btn> : <Btn tone="bull" block size="sm" disabled={shown > 0} onClick={submit} silent>Play the future ▶</Btn>}</div>
    </Asset>
  );
}

/* ======================================================================
   P-04  DRAW THE TRENDLINE — two draggable anchors, live scoring
   ==================================================================== */
const tlCloses = [100, 102, 101, 103.5, 102.2, 104.8, 103.4, 106, 104.6, 107.3, 105.9, 108.6, 107.2, 110];
function Trendline() {
  const data = useMemo(() => fromCloses(tlCloses, 0.6, 99.2), []);
  const W = 320, H = 190;
  const s = useMemo(() => makeScale(data, W, H, 14, [96, 113]), [data]);
  const [a, setA] = useState({ i: 1, v: 104 });
  const [b, setB] = useState({ i: 12, v: 104 });
  const [drag, setDrag] = useState<"a" | "b" | null>(null);
  const [done, setDone] = useState(false);
  const [reveal, setReveal] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const lineAt = (i: number) => a.v + ((b.v - a.v) / (b.i - a.i || 1)) * (i - a.i);
  const tol = 0.55;
  let touches = 0, cuts = 0;
  data.forEach((d, i) => {
    const L = lineAt(i);
    if (Math.abs(d.l - L) <= tol) touches++;
    else if (L > d.l + tol) cuts++;
  });
  const score = clamp(touches * 22 - cuts * 12, 0, 100);
  const onMove = (e: React.PointerEvent) => {
    if (!drag || done) return;
    const p = svgPoint(svg.current!, e.clientX, e.clientY, W, H);
    const pt = { i: clamp(Math.round((p.x - s.pad - s.cw / 2) / s.cw), 0, data.length - 1), v: s.inv(p.y) };
    if (drag === "a" && pt.i < b.i) setA(pt);
    if (drag === "b" && pt.i > a.i) setB(pt);
  };
  const submit = () => {
    if (score >= 70) { setDone(true); sfx.correct(); } else { sfx.wrong(); setReveal(true); setTimeout(() => setReveal(false), 1600); }
  };
  return (
    <Asset code="PR-04" title="Draw the Trendline" desc="Проведи линию по минимумам. Оценка в реальном времени: касания добавляют, пересечения тел отнимают." hint="Тащи две точки" specs={["2 anchors", "live score", "reveal on miss"]}>
      <div className="panel-inset relative p-2 !rounded-2xl">
        <CandleChart data={data} s={s} W={W} H={H} animate={false} svgRef={svg} onPointerMove={onMove} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
          {(sc) => (
            <>
              {reveal && <line x1={sc.x(0)} y1={sc.y(data[0].l)} x2={sc.x(13)} y2={sc.y(data[0].l + (13 * (data[12].l - data[0].l)) / 12)} stroke="#ffc53d" strokeDasharray="5 4" strokeWidth="2" style={{ animation: "fade-in .3s both" }} />}
              <line x1={sc.x(0)} y1={sc.y(lineAt(0))} x2={sc.x(data.length - 1)} y2={sc.y(lineAt(data.length - 1))} stroke={done ? BULL : score >= 70 ? BULL : "#3b82ff"} strokeWidth="2.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${done || score >= 70 ? BULL : "#3b82ff"})` }} />
              {data.map((d, i) => Math.abs(d.l - lineAt(i)) <= tol ? <circle key={i} cx={sc.x(i)} cy={sc.y(d.l)} r="4" fill={BULL} style={{ animation: "pop-in .25s both" }} /> : null)}
              {([["a", a], ["b", b]] as const).map(([k, p]) => (
                <g key={k} onPointerDown={(e) => { if (done) return; setDrag(k); (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId); sfxRaw.pop(); }} style={{ cursor: done ? "default" : "grab" }}>
                  <circle cx={sc.x(p.i)} cy={sc.y(p.v)} r="16" fill="transparent" />
                  <circle cx={sc.x(p.i)} cy={sc.y(p.v)} r={drag === k ? 9 : 7} fill="#fff" stroke="#3b82ff" strokeWidth="3" />
                </g>
              ))}
            </>
          )}
        </CandleChart>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Line quality</span><span className="num" style={{ color: score >= 70 ? BULL : "#ffc53d" }}>{score}%</span></div>
          <Bar value={score} tone={score >= 70 ? "bull" : "gold"} h={10} />
        </div>
        <div className="text-center"><div className="num text-lg font-extrabold text-bull">{touches}</div><div className="text-[9px] font-bold uppercase text-mist">touches</div></div>
        <div className="text-center"><div className="num text-lg font-extrabold text-bear">{cuts}</div><div className="text-[9px] font-bold uppercase text-mist">cuts</div></div>
      </div>
      <div className="mt-3">{done ? <Btn tone="sky" block size="sm" onClick={() => { setDone(false); setA({ i: 1, v: 104 }); setB({ i: 12, v: 104 }); }}><RotateCcw size={14} /> Again</Btn> : <Btn tone="bull" block size="sm" onClick={submit} silent>Confirm line</Btn>}</div>
    </Asset>
  );
}

/* ======================================================================
   P-05  SPEED ROUND — 30 seconds true/false with multiplier
   ==================================================================== */
const facts: [string, boolean][] = [
  ["Зелёная свеча закрылась выше открытия", true], ["Стоп-лосс ставят после входа", false], ["Плечо увеличивает и убыток", true],
  ["Доджи — сильный бычий сигнал", false], ["Спред = разница bid и ask", true], ["DCA — покупка частями через интервалы", true],
  ["Высокая ликвидность = большое проскальзывание", false], ["Seed-фразу можно сообщить поддержке", false], ["Тренд вверх = повышающиеся минимумы", true],
  ["Риск 25% на сделку — норма", false], ["Лимитный ордер исполняется по твоей цене или лучше", true], ["Молот появляется на вершине тренда", false],
  ["Холодный кошелёк не подключён к сети", true], ["ATH — исторический минимум", false], ["Диверсификация снижает риск", true], ["Маркет-ордер гарантирует цену", false],
];
function SpeedRound() {
  const [state, setState] = useState<"idle" | "run" | "end">("idle");
  const [t, setT] = useState(30);
  const [order, setOrder] = useState<number[]>([]);
  const [k, setK] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [flash, setFlash] = useState<null | boolean>(null);
  const [best, setBest] = useState(() => Number(localStorage.getItem("cq-speed-best") || 0));
  const [answers, setAnswers] = useState(0);
  useEffect(() => {
    if (state !== "run") return;
    const i = setInterval(() => setT((v) => {
      if (v <= 1) { clearInterval(i); setState("end"); return 0; }
      if (v <= 6) sfx.tick();
      return v - 1;
    }), 1000);
    return () => clearInterval(i);
  }, [state]);
  useEffect(() => {
    if (state === "end") {
      if (score > best) { setBest(score); localStorage.setItem("cq-speed-best", String(score)); sfx.levelUp(); }
    }
  }, [state]); // eslint-disable-line
  const start = () => {
    setOrder([...facts.keys()].sort(() => Math.random() - 0.5));
    setK(0); setScore(0); setStreak(0); setT(30); setAnswers(0); setState("run"); sfxRaw.swipe();
  };
  const mult = streak >= 8 ? 4 : streak >= 5 ? 3 : streak >= 2 ? 2 : 1;
  const answer = (v: boolean) => {
    if (state !== "run") return;
    const ok = facts[order[k % order.length]][1] === v;
    setFlash(ok);
    setTimeout(() => setFlash(null), 220);
    setAnswers((a) => a + 1);
    if (ok) { setScore((s) => s + 10 * mult); setStreak((s) => s + 1); sfx.correct(); } else { setStreak(0); sfx.wrong(); }
    setK((x) => x + 1);
  };
  return (
    <Asset code="PR-05" title="Speed Round · 30s" desc="Правда или ложь на скорость. Серия поднимает множитель до x4. Рекорд сохраняется." hint="Жми быстро" specs={["30s timer", "x4 multiplier", "best score"]}>
      <div className={cn("relative overflow-hidden rounded-2xl p-4 transition-colors duration-200", flash === true ? "bg-bull/20" : flash === false ? "bg-bear/20" : "bg-ink-900/60")}>
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-1.5 rounded-xl px-2.5 py-1", t <= 6 && state === "run" ? "anim-pop bg-bear/25 text-bear" : "bg-ink-800 text-snow")} key={t <= 6 ? t : "t"}>
            <Timer size={15} /><span className="num text-sm font-extrabold">{t}s</span>
          </div>
          <span className={cn("num rounded-xl px-2.5 py-1 text-sm font-black transition", mult > 1 ? "bg-ember/25 text-ember" : "bg-ink-800 text-mist")}>x{mult}</span>
          <div className="text-right"><div key={score} className="num anim-pop text-xl font-extrabold text-gold">{score}</div></div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full bg-gradient-to-r from-bull to-gold transition-[width] duration-1000 ease-linear" style={{ width: `${(t / 30) * 100}%` }} /></div>
        <div className="grid h-32 place-items-center text-center">
          {state === "idle" && <div><Zap size={34} className="mx-auto text-gold anim-float" /><div className="mt-2 text-[13px] font-bold">Рекорд: <span className="num text-gold">{best}</span></div></div>}
          {state === "run" && <div key={k} className="anim-slide-right font-display px-2 text-lg font-extrabold leading-snug">{facts[order[k % order.length]][0]}</div>}
          {state === "end" && <div className="anim-pop"><div className="font-display text-2xl font-black text-gold">{score} pts</div><div className="text-[12px] text-mist">{answers} ответов · рекорд {best}</div></div>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {state === "run" ? (
          <>
            <Btn tone="bear" size="lg" onClick={() => answer(false)} silent><X size={20} strokeWidth={3} /> False</Btn>
            <Btn tone="bull" size="lg" onClick={() => answer(true)} silent><Check size={20} strokeWidth={3} /> True</Btn>
          </>
        ) : (
          <Btn tone="gold" size="lg" className="col-span-2 !text-[#3b2600]" onClick={start}>{state === "end" ? "Play again" : "Start"}</Btn>
        )}
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-06  SCAM DETECTOR — find red flags, then judge messages
   ==================================================================== */
const scamMsg: { t: string; flag?: string }[] = [
  { t: "🚀 Эксклюзивная возможность!" },
  { t: "Гарантированный доход", flag: "Никто не гарантирует доход на рынке." },
  { t: "x100 за 24 часа.", flag: "Нереалистичная доходность — главный признак пирамиды." },
  { t: "Просто" },
  { t: "отправь 0.1 BTC", flag: "Просят сначала отправить деньги." },
  { t: "на кошелёк ниже и" },
  { t: "введи seed-фразу", flag: "Seed-фраза = полный доступ к кошельку. Никогда." },
  { t: "для верификации." },
  { t: "Осталось 3 места!", flag: "Искусственная срочность давит на решение." },
];
const verdicts = [
  { m: "Binance: вход с нового устройства. Если это не вы — смените пароль в приложении.", safe: true },
  { m: "Илон раздаёт 5000 BTC! Отправь 1 BTC — получишь 2 обратно 🎁", safe: false },
  { m: "Поддержка MetaMask: для восстановления кошелька пришлите 12 слов в личку.", safe: false },
];
function ScamDetector() {
  const [found, setFound] = useState<number[]>([]);
  const [miss, setMiss] = useState<number[]>([]);
  const [why, setWhy] = useState<string | null>(null);
  const [phase, setPhase] = useState<1 | 2>(1);
  const [vi, setVi] = useState(0);
  const [vres, setVres] = useState<boolean[]>([]);
  const flags = scamMsg.filter((x) => x.flag).length;
  const tap = (i: number) => {
    const seg = scamMsg[i];
    if (found.includes(i) || miss.includes(i)) return;
    if (seg.flag) {
      const n = [...found, i];
      setFound(n); setWhy(seg.flag); sfx.correct();
      if (n.length === flags) setTimeout(() => { sfx.levelUp(); setPhase(2); }, 900);
    } else { setMiss((m) => [...m, i]); sfx.wrong(); }
  };
  const judge = (safe: boolean) => {
    const ok = verdicts[vi].safe === safe;
    ok ? sfx.correct() : sfx.wrong();
    setVres((r) => [...r, ok]);
    setVi((v) => v + 1);
  };
  const reset = () => { setFound([]); setMiss([]); setWhy(null); setPhase(1); setVi(0); setVres([]); };
  return (
    <Asset code="PR-06" title="Scam Detector" desc="Раунд 1: найди все красные флаги в сообщении. Раунд 2: быстро реши — безопасно или скам." hint="Тапай подозрительные фразы" specs={["5 flags", "3 verdicts", "safety"]}>
      <div className="mb-3 flex items-center justify-between">
        <Chip tone={phase === 1 ? "bear" : "sky"}><ShieldAlert size={11} /> Round {phase}/2</Chip>
        {phase === 1 && <span className="num text-[11px] font-bold text-mist">{found.length}/{flags} flags · {miss.length} misses</span>}
      </div>
      {phase === 1 ? (
        <>
          <div className="rounded-2xl rounded-tl-md bg-ink-700 p-4 text-[15px] font-semibold leading-8 shadow-[0_4px_0_#08112a]">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-mist"><span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[10px] font-black text-ink-900">$</span>CryptoProfit_VIP · now</div>
            {scamMsg.map((seg, i) => (
              <span key={i}>
                <button onClick={() => tap(i)} className={cn("rounded-md px-0.5 transition", found.includes(i) ? "anim-pop bg-bear/30 text-bear underline decoration-wavy decoration-bear" : miss.includes(i) ? "anim-shake text-mist line-through" : "hover:bg-white/10")}>{seg.t}</button>{" "}
              </span>
            ))}
          </div>
          <div className="mt-3 min-h-[52px]">{why && <div key={why} className="anim-slide-right flex gap-2 rounded-xl bg-bear/15 p-2.5 text-[12px] text-snow/85"><ShieldAlert size={15} className="mt-0.5 shrink-0 text-bear" />{why}</div>}</div>
        </>
      ) : vi < verdicts.length ? (
        <>
          <div key={vi} className="anim-slide-right rounded-2xl rounded-tl-md bg-ink-700 p-4 text-[14px] font-semibold leading-snug shadow-[0_4px_0_#08112a]">{verdicts[vi].m}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Btn tone="bear" onClick={() => judge(false)} silent><ShieldAlert size={16} /> Scam</Btn>
            <Btn tone="bull" onClick={() => judge(true)} silent><Check size={16} /> Safe</Btn>
          </div>
        </>
      ) : (
        <div className="anim-pop py-4 text-center">
          <Mascot size={90} mood={vres.every(Boolean) ? "hype" : "think"} />
          <div className="font-display text-lg font-extrabold">{vres.filter(Boolean).length}/3 верно</div>
          <p className="text-[12px] text-mist">Ты нашёл все {flags} флагов в первом раунде.</p>
        </div>
      )}
      <GhostBtn className="mt-3 !h-10 w-full !text-[10px]" onClick={reset}><Eye size={13} /> Restart</GhostBtn>
    </Asset>
  );
}

export default function Practice() {
  return (
    <Section id="practice" index="P" title="Practice Arena · Part 1" subtitle="Мини-игры с реальной механикой: свайпы, поиск паттерна, стоп-лосс, трендовая линия, скорость, безопасность">
      <SwipeDeck />
      <PatternSpotter />
      <StopLoss />
      <Trendline />
      <SpeedRound />
      <ScamDetector />
    </Section>
  );
}
