import { useMemo, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Label, Section } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useRaf } from "../ui/hooks";
import { CandleChart, PriceTag } from "../ui/Chart";
import { ExHeader, Summary, TimerBar, Verdict } from "../ui/exercise";
import { genCandles } from "../game/market";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ GPX-01 · Fibonacci Tool ═════════ */
const FIB = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
function FibTool() {
  const game = useGame();
  const data = useMemo(() => {
    const d = genCandles(88, 34, 100, 1.1, 0.05);
    // create a clear swing up then pullback to 0.618
    for (let i = 20; i < d.length; i++) { const shift = -(i - 20) * 0.35; d[i] = { ...d[i], o: d[i].o + shift, c: d[i].c + shift, h: d[i].h + shift, l: d[i].l + shift }; }
    return d;
  }, []);
  const swingHi = Math.max(...data.slice(0, 22).map((c) => c.h));
  const swingLo = Math.min(...data.slice(0, 8).map((c) => c.l));
  const bounce = swingHi - (swingHi - swingLo) * 0.618;
  const W = 300, H = 200, PAD = 10;
  const lo = Math.min(...data.map((c) => c.l)) - 2, hi = Math.max(...data.map((c) => c.h)) + 2;
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H - PAD * 2);
  const price = (py: number) => hi - ((py - PAD) / (H - PAD * 2)) * (hi - lo);
  const svg = useRef<SVGSVGElement>(null);
  const [line, setLine] = useState<null | { a: number; b: number }>(null);
  const lineRef = useRef<null | { a: number; b: number }>(null);
  const [stage, setStage] = useState<"draw" | "pick" | "done">("draw");
  const [pick, setPick] = useState<number | null>(null);
  const toP = (cy: number) => { const r = svg.current!.getBoundingClientRect(); return price(((cy - r.top) / r.height) * H); };
  const onDown = useDrag({
    onStart: (_x, cy) => { if (stage !== "draw") return false; lineRef.current = { a: toP(cy), b: toP(cy) }; setLine({ ...lineRef.current }); feel("tap", 4); },
    onMove: (d) => { if (lineRef.current) { lineRef.current = { ...lineRef.current, b: toP(d.y) }; setLine({ ...lineRef.current }); } },
    onEnd: () => { const l = lineRef.current; if (l && Math.abs(l.a - l.b) > 4) { setStage("pick"); feel("pop"); } else setLine(null); },
  });
  const top = line ? Math.max(line.a, line.b) : 0, bot = line ? Math.min(line.a, line.b) : 0;
  const fibPrice = (f: number) => top - (top - bot) * f;
  const goodDraw = line && Math.abs(Math.max(line.a, line.b) - swingHi) < 4 && Math.abs(Math.min(line.a, line.b) - swingLo) < 4;
  const pickLevel = (idx: number, x: number, cy: number) => {
    if (stage !== "pick") return;
    setPick(idx); setStage("done");
    const ok = Math.abs(fibPrice(FIB[idx]) - bounce) < 3 && goodDraw;
    if (ok) { game.complete({ skill: "patterns", xp: 20, x, y: cy }); feel("success", [20, 30]); } else { game.complete({ skill: "patterns", ok: false }); feel("error"); }
  };
  const reset = () => { setLine(null); lineRef.current = null; setStage("draw"); setPick(null); };
  return (
    <AssetCard id="GPX-01" title="Fibonacci Retracement Tool" desc="Профи-инструмент: протяни фибо от максимума свинга к минимуму — уровни 0.236…1 появляются автоматически. Затем тапни уровень, где цена нашла поддержку." tags={["gameplay", "learn", "fibonacci", "draw", "tool"]}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} onPointerDown={onDown} className="well w-full cursor-crosshair touch-none select-none rounded-2xl">
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#ffffff0a" />)}
        {data.map((c, i) => { const up = c.c >= c.o, col = up ? "#2ee59d" : "#ff4d6a", cw = W / data.length, cx = i * cw + cw / 2; return <g key={i}><line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" /><rect x={cx - cw * 0.3} width={cw * 0.6} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx="1" /></g>; })}
        {line && FIB.map((f, i) => {
          const fp = fibPrice(f); const isPick = pick === i;
          return <g key={f}>
            <line x1="0" x2={W} y1={y(fp)} y2={y(fp)} stroke={isPick ? (Math.abs(fp - bounce) < 3 ? "#2ee59d" : "#ff4d6a") : f === 0.618 ? "#ffc53d" : "#5ce1ff"} strokeWidth={f === 0.618 ? 2 : 1} strokeDasharray={f === 0 || f === 1 ? undefined : "5 3"} opacity={stage === "draw" ? 0.5 : 1} />
            {stage !== "draw" && <g onPointerDown={(e) => { e.stopPropagation(); pickLevel(i, e.clientX, e.clientY); }} className="cursor-pointer"><rect x="0" y={y(fp) - 8} width="46" height="16" rx="4" fill={isPick ? "#fff" : "#0d1839"} /><text x="4" y={y(fp) + 3.5} fontSize="9" fontWeight="800" fill={isPick ? "#0a1330" : "#5ce1ff"} fontFamily="JetBrains Mono">{(f * 100).toFixed(1)}%</text></g>}
          </g>;
        })}
        {stage === "done" && <circle cx={W - 30} cy={y(bounce)} r="6" fill="none" stroke="#2ee59d" strokeWidth="2.5" style={{ animation: "pulseRing 1.4s infinite", transformOrigin: `${W - 30}px ${y(bounce)}px` }} />}
        {!line && <text x={W / 2} y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#8fa0cf">↕ протяни фибо: high → low</text>}
      </svg>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("text-xs font-bold", stage === "draw" ? "text-ink-400" : stage === "pick" ? "text-sky" : pick !== null && Math.abs(fibPrice(FIB[pick]) - bounce) < 3 ? "text-bull" : "text-bear")}>
          {stage === "draw" ? "Протяни инструмент по свингу" : stage === "pick" ? "Тапни уровень отскока" : pick !== null && Math.abs(fibPrice(FIB[pick]) - bounce) < 3 ? "Верно! Золотой карман 0.618 +20 XP" : "Цена отбилась от 61.8% — золотого кармана"}
        </span>
        <Btn v="ghost" size="sm" onClick={reset}><Icon name="refresh" size={14} /></Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ GPX-02 · Guess Next Candle (reveal) ═════════ */
function GuessNext() {
  const game = useGame();
  const [seed, setSeed] = useState(3);
  const full = useMemo(() => genCandles(seed, 30, 100, 1.2, (seed % 3 - 1) * 0.06), [seed]);
  const [shown, setShown] = useState(14);
  const [guess, setGuess] = useState<null | "up" | "down">(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [reveal, setReveal] = useState(false);
  const next = full[shown];
  const actual = next.c >= next.o ? "up" : "down";
  const pick = (g: "up" | "down", x: number, y: number) => {
    if (guess) return;
    setGuess(g); setReveal(true);
    const ok = g === actual;
    game.addCombo(ok);
    if (ok) { setScore((s) => s + 1); game.complete({ skill: "candles", xp: 8, x, y }); feel("success", 10); } else { game.complete({ skill: "candles", ok: false }); feel("error", 20); }
  };
  const cont = () => {
    if (shown >= 24) { setSeed((s) => s + 5); setShown(14); } else setShown(shown + 1);
    setGuess(null); setReveal(false); setRound((r) => r + 1); sfx.play("whoosh");
  };
  const view = full.slice(0, reveal ? shown + 1 : shown);
  return (
    <AssetCard id="GPX-02" title="Guess the Next Candle" desc="График открывается свеча за свечой. Предскажи направление следующей — она проявляется с подсветкой. Серия верных прогнозов растит комбо." tags={["gameplay", "learn", "prediction", "candles"]}>
      <div className="mb-2 flex items-center justify-between font-mono text-xs font-extrabold"><span className="text-bull">✓ {score}</span><span className="flex items-center gap-1 text-flame"><Icon name="flame" size={13} variant="solid" />×{game.combo}</span></div>
      <div className="relative">
        <CandleChart key={`${seed}-${shown}-${reveal}`} data={view} h={180} active={reveal ? view.length - 1 : null} className="well w-full rounded-2xl">
          {(s) => !reveal ? <><line x1={s.x(view.length)} x2={s.x(view.length)} y1="0" y2={s.h} stroke="#ffffff22" strokeDasharray="4 4" /><text x={s.x(view.length) + 4} y="16" fontSize="18" fontWeight="800" fill="#8fa0cf">?</text></> : null}
        </CandleChart>
      </div>
      {!guess ? (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Btn v="bull" onClick={(e) => pick("up", e.clientX, e.clientY)}><Icon name="trendUp" size={18} stroke={3} />Up</Btn>
          <Btn v="bear" onClick={(e) => pick("down", e.clientX, e.clientY)}><Icon name="trendDown" size={18} stroke={3} />Down</Btn>
        </div>
      ) : <Verdict inline ok={guess === actual} title={guess === actual ? "Угадал!" : "Мимо"} text={`Свеча закрылась ${actual === "up" ? "выше открытия (бычья)" : "ниже открытия (медвежья)"}.`} onNext={cont} label="Next candle" />}
      <span className="sr-only">{round}</span>
    </AssetCard>
  );
}

/* ═════════ GPX-03 · Indicator Lab ═════════ */
const IND_Q = [
  { q: "Включи EMA и определи тренд по наклону средней", need: ["ema"], a: "up", opts: ["up", "down"], why: "EMA наклонена вверх — восходящий тренд." },
  { q: "Включи RSI. Рынок сейчас…", need: ["rsi"], a: "overbought", opts: ["overbought", "oversold"], why: "RSI выше 70 — зона перекупленности." },
  { q: "Включи объём. Пробой подтверждён?", need: ["vol"], a: "yes", opts: ["yes", "no"], why: "Всплеск объёма на пробое = подтверждение." },
];
function IndicatorLab() {
  const game = useGame();
  const data = useMemo(() => genCandles(45, 30, 100, 1, 0.14), []);
  const closes = data.map((c) => c.c);
  const ema = useMemo(() => { const k = 2 / 11; const o: number[] = []; let e = closes[0]; closes.forEach((v, i) => { e = i ? v * k + e * (1 - k) : v; o.push(e); }); return o; }, [closes]);
  const rsiV = 74;
  const [on, setOn] = useState<Record<string, boolean>>({ ema: false, rsi: false, vol: false });
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = IND_Q[qi];
  const W = 300, H = 170, PAD = 8;
  const lo = Math.min(...data.map((c) => c.l)), hi = Math.max(...data.map((c) => c.h));
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H - PAD * 2 - (on.vol ? 30 : 0));
  const answer = (o: string, x: number, cy: number) => {
    if (ans) return; setAns(o);
    const ok = o === q.a && q.need.every((n) => on[n]);
    if (ok) { setScore((s) => s + 1); game.complete({ skill: "patterns", xp: 12, x, y: cy }); feel("success"); } else { game.complete({ skill: "patterns", ok: false }); feel("error"); }
  };
  const next = () => { if (qi === IND_Q.length - 1) { setDone(true); return; } setQi(qi + 1); setAns(null); sfx.play("whoosh"); };
  return (
    <AssetCard id="GPX-03" title="Indicator Lab" desc="Наложи индикаторы (EMA / RSI / Volume) кнопками и ответь на вопрос. Правильный ответ засчитывается, только если нужный индикатор включён." tags={["gameplay", "learn", "indicators", "toggle"]}>
      {done ? <Summary correct={score} total={IND_Q.length} xp={score * 12} onRestart={() => { setQi(0); setAns(null); setScore(0); setDone(false); setOn({ ema: false, rsi: false, vol: false }); }} /> : (
        <div>
          <ExHeader step={qi} total={IND_Q.length} />
          <svg viewBox={`0 0 ${W} ${H}`} className="well w-full rounded-2xl">
            {data.map((c, i) => { const up = c.c >= c.o, col = up ? "#2ee59d" : "#ff4d6a", cw = W / data.length, cx = i * cw + cw / 2; return <g key={i}><line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" /><rect x={cx - cw * 0.3} width={cw * 0.6} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx="1" /></g>; })}
            {on.ema && <path d={ema.map((v, i) => `${i ? "L" : "M"}${(i + 0.5) * (W / data.length)} ${y(v)}`).join(" ")} fill="none" stroke="#ffc53d" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 4px #ffc53d)", animation: "fadeIn .4s both" }} />}
            {on.vol && data.map((c, i) => { const cw = W / data.length, cx = i * cw + cw / 2; const vh = (c.v / 160) * 26; return <rect key={i} x={cx - cw * 0.3} width={cw * 0.6} y={H - vh - 2} height={vh} fill={c.c >= c.o ? "#2ee59d55" : "#ff4d6a55"} style={{ animation: "barGrow .4s ease both", transformOrigin: "bottom" }} />; })}
            {on.rsi && <g style={{ animation: "fadeIn .4s both" }}><rect x={W - 54} y="6" width="50" height="20" rx="5" fill={rsiV > 70 ? "#ff4d6a" : "#2ee59d"} /><text x={W - 29} y="19.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0a1330" fontFamily="JetBrains Mono">RSI {rsiV}</text></g>}
          </svg>
          <div className="mt-2 flex gap-2">{(["ema", "rsi", "vol"] as const).map((k) => <button key={k} onClick={() => { setOn((o) => ({ ...o, [k]: !o[k] })); feel("tap"); }} className={cn("flex-1 rounded-xl py-2 text-[11px] font-extrabold uppercase transition-all", on[k] ? "raised text-white ring-2 ring-sky" : "bg-ink-800 text-ink-400")}>{k}</button>)}</div>
          <div className="raised mt-3 rounded-2xl p-3 text-sm font-extrabold text-white">{q.q}</div>
          {!ans ? <div className="mt-2 grid grid-cols-2 gap-2">{q.opts.map((o) => <Btn key={o} v="sky" size="sm" onClick={(e) => answer(o, e.clientX, e.clientY)} className="normal-case! tracking-normal!">{o}</Btn>)}</div>
            : <Verdict inline ok={ans === q.a && q.need.every((n) => on[n])} text={q.need.every((n) => on[n]) ? q.why : `Сначала включи: ${q.need.join(", ").toUpperCase()}`} onNext={next} label={qi === IND_Q.length - 1 ? "Finish" : "Next"} />}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPX-04 · Spot the Fake Breakout ═════════ */
type BO = { i: number; fake: boolean };
function FakeBreakout() {
  const game = useGame();
  const [seed, setSeed] = useState(6);
  const build = useMemo(() => {
    const d = genCandles(seed, 40, 100, 0.8);
    const level = 104;
    const bos: BO[] = [];
    [10, 20, 30].forEach((i, k) => { const fake = k !== 1; d[i] = { ...d[i], h: level + 2, c: fake ? level - 1.5 : level + 1.5, o: level - 1, l: level - 3 }; if (fake) { d[i + 1] = { ...d[i + 1], o: level - 1, c: level - 3, h: level, l: level - 4 }; } else { d[i + 1] = { ...d[i + 1], o: level + 1, c: level + 4, h: level + 5, l: level }; } bos.push({ i, fake }); });
    return { d, level, bos };
  }, [seed]);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const lo = 96, hi = 110;
  const tap = (i: number) => { if (checked) return; const bo = build.bos.find((b) => Math.abs(b.i - i) <= 1); if (!bo) { feel("lock"); return; } setPicked((p) => p.includes(bo.i) ? p.filter((x) => x !== bo.i) : [...p, bo.i]); feel("tap"); };
  const check = (x: number, y: number) => {
    setChecked(true);
    const fakes = build.bos.filter((b) => b.fake).map((b) => b.i);
    const correct = picked.filter((p) => fakes.includes(p)).length;
    const wrong = picked.filter((p) => !fakes.includes(p)).length;
    const sc = clamp(correct - wrong, 0, fakes.length);
    setScore(sc);
    if (sc >= 2) { game.complete({ skill: "patterns", xp: 16, x, y }); feel("success"); } else { game.complete({ skill: "patterns", ok: false }); feel("error"); }
  };
  return (
    <AssetCard id="GPX-04" title="Spot the Fake Breakout" desc="Цена трижды пробивает уровень сопротивления. Тапни ложные пробои (цена вернулась под уровень) и пропусти настоящий. Учит не гоняться за проколами." tags={["gameplay", "learn", "breakout", "tap"]}>
      <CandleChart data={build.d} h={190} lo={lo} hi={hi} onTap={tap} className="well w-full cursor-crosshair touch-none rounded-2xl">
        {(s) => <>
          <PriceTag s={s} price={build.level} color="#ffc53d" label="RES" dash="5 3" />
          {build.bos.map((b) => { const picked2 = picked.includes(b.i); const showRes = checked; return <g key={b.i}>
            {picked2 && <rect x={s.x(b.i) - s.cw} y="0" width={s.cw * 2} height={s.h} rx="4" fill="none" stroke={checked ? (b.fake ? "#2ee59d" : "#ff4d6a") : "#5ce1ff"} strokeWidth="2" strokeDasharray="4 3" />}
            {showRes && <text x={s.x(b.i)} y="14" textAnchor="middle" fontSize="14" fontWeight="800" fill={b.fake ? "#ff4d6a" : "#2ee59d"}>{b.fake ? "✕" : "✓"}</text>}
          </g>; })}
        </>}
      </CandleChart>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("text-xs font-bold", !checked ? "text-ink-400" : score >= 2 ? "text-bull" : "text-bear")}>{!checked ? `Выбрано проколов: ${picked.length}` : score >= 2 ? `${score}/2 ложных найдено! +16 XP` : "✕ = ложный (закрылся под уровнем), ✓ = настоящий"}</span>
        {!checked ? <Btn v="bull" size="sm" disabled={!picked.length} onClick={(e) => check(e.clientX, e.clientY)}>Check</Btn> : <Btn v="ghost" size="sm" onClick={() => { setSeed((s) => s + 3); setPicked([]); setChecked(false); }}>New</Btn>}
      </div>
    </AssetCard>
  );
}

/* ═════════ GPX-05 · Margin Call Simulator ═════════ */
function MarginCall() {
  const game = useGame();
  const [lev, setLev] = useState(10);
  const [entry] = useState(64000);
  const [phase, setPhase] = useState<"set" | "run" | "safe" | "liq">("set");
  const price = useRef(64000);
  const [px, setPx] = useState(64000);
  const path = useRef<number[]>([64000]);
  const [, force] = useState(0);
  const liq = entry * (1 - 1 / lev);
  const tp = entry * (1 + 0.6 / lev);
  const t = useRef(0);
  useRaf((dt) => {
    t.current += dt;
    const drift = -Math.sin(t.current / 900) * 40 - 8;
    price.current += drift * (dt / 200) + (Math.random() - 0.5) * 30;
    path.current.push(price.current); if (path.current.length > 60) path.current.shift();
    setPx(price.current); force((n) => (n + 1) % 1000);
    if (price.current <= liq) { setPhase("liq"); feel("error", [50, 40, 80]); game.complete({ skill: "risk", ok: false }); }
    else if (price.current >= tp) { setPhase("safe"); feel("success", [20, 30, 60]); game.complete({ skill: "risk", xp: 12 }); }
  }, phase === "run");
  const start = () => { price.current = entry; path.current = [entry]; t.current = 0; setPhase("run"); feel("whoosh"); };
  const pnl = ((px - entry) / entry) * lev * 100;
  const mn = Math.min(liq - 200, ...path.current), mx = Math.max(tp + 200, ...path.current);
  const yy = (v: number) => 110 - ((v - mn) / (mx - mn)) * 100;
  return (
    <AssetCard id="GPX-05" title="Margin Call Simulator" desc="Выставь плечо и почувствуй риск: чем выше плечо, тем ближе линия ликвидации к цене. Запусти рынок и смотри, переживёт ли позиция просадку." tags={["gameplay", "practice", "leverage", "liquidation"]}>
      <div className="mb-2 flex items-center justify-between"><span className="font-mono text-sm font-extrabold text-white">{px.toFixed(0)}</span><span className={cn("font-mono text-sm font-extrabold", pnl >= 0 ? "text-bull" : "text-bear")}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(1)}% ROE</span></div>
      <svg viewBox="0 0 300 120" className="well w-full rounded-2xl">
        <rect x="0" y={yy(liq)} width="300" height={120 - yy(liq)} fill="#ff4d6a" opacity=".12" />
        <line x1="0" x2="300" y1={yy(liq)} y2={yy(liq)} stroke="#ff4d6a" strokeWidth="1.5" strokeDasharray="5 3" /><text x="4" y={yy(liq) - 3} fontSize="8" fontWeight="800" fill="#ff4d6a">LIQ {liq.toFixed(0)}</text>
        <line x1="0" x2="300" y1={yy(tp)} y2={yy(tp)} stroke="#2ee59d" strokeWidth="1.5" strokeDasharray="5 3" /><text x="4" y={yy(tp) - 3} fontSize="8" fontWeight="800" fill="#2ee59d">TP {tp.toFixed(0)}</text>
        <line x1="0" x2="300" y1={yy(entry)} y2={yy(entry)} stroke="#8fa0cf" strokeDasharray="2 3" />
        <path d={path.current.map((v, i) => `${i ? "L" : "M"}${(i / 59) * 300} ${yy(v)}`).join(" ")} fill="none" stroke="#5ce1ff" strokeWidth="2" />
        {path.current.length > 0 && <circle cx={((path.current.length - 1) / 59) * 300} cy={yy(px)} r="4" fill="#fff" />}
      </svg>
      {phase === "set" && <><Label className="mt-3">Leverage · {lev}×</Label><input type="range" min={2} max={50} value={lev} onChange={(e) => { setLev(+e.target.value); sfx.play("tick"); }} className="w-full accent-sky" /><div className="mt-1 flex justify-between font-mono text-[10px] text-ink-400"><span>Liq at −{(100 / lev).toFixed(1)}%</span><span className={lev > 25 ? "text-bear" : lev > 10 ? "text-gold" : "text-bull"}>{lev > 25 ? "extreme" : lev > 10 ? "high" : "moderate"}</span></div><Btn v="gold" size="sm" block className="mt-3" onClick={start}><Icon name="play" size={14} variant="solid" />Run market</Btn></>}
      {phase === "run" && <div className="mt-3 text-center text-xs font-extrabold text-ink-300">Рынок падает… удержится ли позиция?</div>}
      {phase === "safe" && <Verdict inline ok text={`При ${lev}× ты пережил просадку и дошёл до TP. Умеренное плечо = запас прочности.`} onNext={() => setPhase("set")} label="Again" />}
      {phase === "liq" && <Verdict inline ok={false} title="Ликвидация!" text={`Плечо ${lev}× ликвидировало позицию при −${(100 / lev).toFixed(1)}%. Меньше плечо — дальше стоп ликвидации.`} onNext={() => setPhase("set")} label="Try lower leverage" />}
    </AssetCard>
  );
}

/* ═════════ GPX-06 · P&L Math Race ═════════ */
function makeMath(seed: number) {
  const r = (n: number) => Math.floor((Math.sin(seed * 99 + n) * 0.5 + 0.5) * 1000);
  const type = seed % 4;
  if (type === 0) { const qty = 2 + (r(1) % 8), e = 100 + (r(2) % 900), x = e + (r(3) % 200) - 100; return { q: `Купил ${qty} @ $${e}, продал @ $${x}. P&L?`, a: qty * (x - e), unit: "$", opts: 4 }; }
  if (type === 1) { const bal = 1000 * (1 + r(1) % 20), risk = [1, 2, 5][r(2) % 3]; return { q: `Депозит $${bal}, риск ${risk}%. Сколько $ риска?`, a: Math.round((bal * risk) / 100), unit: "$", opts: 4 }; }
  if (type === 2) { const e = 100 + r(1) % 200, tp = e + 20 + r(2) % 60, sl = e - (10 + r(3) % 30); return { q: `Вход $${e}, стоп $${sl}, цель $${tp}. R:R?`, a: +((tp - e) / (e - sl)).toFixed(1), unit: ":1", opts: 4 }; }
  const lev = [5, 10, 20, 25][r(1) % 4]; return { q: `Плечо ${lev}×. Движение −5%. Твой убыток по ROE?`, a: 5 * lev, unit: "%", opts: 4 };
}
function MathRace() {
  const game = useGame();
  const [seed, setSeed] = useState(1);
  const [state, setState] = useState<"ready" | "run" | "done">("ready");
  const [time, setTime] = useState(1);
  const tRef = useRef(1);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [feedback, setFeedback] = useState<null | boolean>(null);
  const cur = useMemo(() => makeMath(seed), [seed]);
  const opts = useMemo(() => { const a = cur.a; const set = new Set<number>([a]); let i = 1; while (set.size < 4) { const d = a + (i % 2 ? i : -i) * (cur.unit === ":1" ? 0.5 : Math.max(1, Math.round(a * 0.15))); if (d !== a && d > 0) set.add(+d.toFixed(1)); i++; } return [...set].sort(() => Math.sin(seed * i) - 0.5); }, [cur, seed]);
  useRaf((dt) => { tRef.current -= dt / 8000; setTime(tRef.current); if (tRef.current <= 0) { setState("done"); } }, state === "run" && feedback === null);
  const start = () => { setSeed(Math.floor(Math.random() * 900) + 1); tRef.current = 1; setTime(1); setScore(0); setTotal(0); setFeedback(null); setState("run"); feel("whoosh"); };
  const answer = (v: number, x: number, y: number) => {
    if (feedback !== null) return;
    const ok = Math.abs(v - cur.a) < 0.05;
    setFeedback(ok); setTotal((t) => t + 1);
    if (ok) { setScore((s) => s + 1); game.complete({ skill: "risk", xp: 3, x, y }); feel("success", 6); } else { game.complete({ skill: "risk", ok: false }); feel("error", 15); }
    window.setTimeout(() => { setSeed((s) => s + 7 + Math.floor(Math.random() * 5)); setFeedback(null); }, 550);
  };
  return (
    <AssetCard id="GPX-06" title="P&L Math Race" desc="Устный счёт трейдера на время: P&L, риск в $, R:R, ROE с плечом. Отвечай быстро, пока не кончился таймер. Тренирует расчёт в уме." tags={["gameplay", "practice", "math", "speed"]}>
      {state === "ready" && <div className="flex flex-col items-center py-6 text-center"><Mascot mood="think" size={76} /><div className="mt-2 text-lg font-extrabold text-white">Считаем в уме</div><div className="mb-4 text-xs text-ink-400">Успей до конца таймера</div><Btn v="gold" size="lg" onClick={start}><Icon name="bolt" size={18} variant="solid" />Start</Btn></div>}
      {state === "run" && <div>
        <div className="mb-2 flex items-center justify-between font-mono text-xs font-extrabold"><span className="text-bull">✓ {score}</span><span className="text-ink-400">{total} answered</span></div>
        <TimerBar t={clamp(time, 0, 1)} />
        <div key={seed} className={cn("raised my-4 grid min-h-[80px] place-items-center rounded-2xl p-4 text-center text-base font-extrabold text-white", feedback === true && "ring-2 ring-bull", feedback === false && "anim-shake ring-2 ring-bear")} style={{ animation: "screenIn .25s ease both" }}>{cur.q}</div>
        <div className="grid grid-cols-2 gap-2">{opts.map((o) => <button key={o} onClick={(e) => answer(o, e.clientX, e.clientY)} className="rounded-xl border-2 border-ink-600 bg-ink-800 py-3 font-mono text-lg font-extrabold text-white transition-all active:translate-y-0.5 hover:border-sky">{cur.unit === "$" ? "$" : ""}{o}{cur.unit !== "$" ? cur.unit : ""}</button>)}</div>
      </div>}
      {state === "done" && <Summary correct={score} total={total} xp={score * 3} title={score >= total * 0.8 ? "Быстрый ум!" : "Тренируйся ещё"} onRestart={start} />}
    </AssetCard>
  );
}

/* ═════════ GPX-07 · Pattern Typing ═════════ */
const TYPE_WORDS = [{ w: "HAMMER", d: "M30 12v4 M22 16h16v6H30z", h: "Молот — разворот вверх" }, { w: "DOJI", d: "M30 8v20 M20 18h20", h: "Доджи — нерешительность" }, { w: "ENGULFING", d: "M22 12v14 M18 15h8v8h-8z M38 8v22 M34 11h8v16h-8z", h: "Поглощение" }, { w: "MARUBOZU", d: "M24 8h12v22H24z", h: "Марубозу — импульс" }, { w: "SPINNING", d: "M30 6v8 M24 14h12v10H24z M30 24v8", h: "Волчок" }];
function PatternTyping() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"ready" | "run" | "done">("ready");
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const startT = useRef(0);
  const charsRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cur = TYPE_WORDS[i];
  const start = () => { setState("run"); setI(0); setTyped(""); setScore(0); startT.current = performance.now(); charsRef.current = 0; feel("whoosh"); window.setTimeout(() => inputRef.current?.focus(), 50); };
  const onType = (v: string) => {
    const val = v.toUpperCase().replace(/[^A-Z]/g, "");
    setTyped(val);
    if (val === cur.w) {
      charsRef.current += cur.w.length;
      setScore((s) => s + 1); feel("success", 8); game.complete({ skill: "candles", xp: 4, x: window.innerWidth / 2, y: 200 });
      const mins = (performance.now() - startT.current) / 60000;
      setWpm(Math.round((charsRef.current / 5) / Math.max(0.01, mins)));
      if (i === TYPE_WORDS.length - 1) { setState("done"); } else { setI(i + 1); setTyped(""); sfx.play("whoosh"); }
    } else if (cur.w.startsWith(val)) { if (val.length > typed.length) sfx.play("tick"); }
    else feel("error", 10);
  };
  return (
    <AssetCard id="GPX-07" title="Pattern Typing Drill" desc="Назови паттерн: печатай его имя как можно быстрее (клавиатура). Правильные буквы зеленеют, ошибка краснит поле. В конце — скорость в WPM." tags={["gameplay", "learn", "typing", "keyboard"]}>
      {state === "ready" && <div className="flex flex-col items-center py-6 text-center"><Icon name="book" size={44} variant="duo" className="text-sky" /><div className="mt-2 text-lg font-extrabold text-white">Печатай названия</div><div className="mb-4 text-xs text-ink-400">5 паттернов на скорость</div><Btn v="sky" size="lg" onClick={start}><Icon name="play" size={18} variant="solid" />Start</Btn></div>}
      {state === "run" && <div>
        <ExHeader step={i} total={TYPE_WORDS.length} right={wpm > 0 ? <span className="font-mono text-[11px] font-extrabold text-gold">{wpm} wpm</span> : undefined} />
        <div className="my-4 flex flex-col items-center">
          <svg viewBox="0 0 60 36" className="h-16"><path d={cur.d} stroke="#5ce1ff" strokeWidth="3" fill="#5ce1ff33" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <div className="mt-2 text-xs font-bold text-ink-400">{cur.h}</div>
        </div>
        <div className="mb-3 flex justify-center gap-1">
          {cur.w.split("").map((ch, k) => <span key={k} className={cn("grid h-10 w-8 place-items-center rounded-lg font-mono text-lg font-extrabold transition-colors", k < typed.length ? (typed[k] === ch ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear") : k === typed.length ? "bg-sky/20 text-white ring-2 ring-sky" : "bg-ink-800 text-ink-500")}>{k < typed.length ? typed[k] : ch}{k === typed.length && <span className="ml-0.5 inline-block h-4 w-0.5 bg-white" style={{ animation: "caret .7s step-end infinite" }} />}</span>)}
        </div>
        <input ref={inputRef} value={typed} onChange={(e) => onType(e.target.value)} autoFocus className="w-full rounded-xl bg-ink-800 px-3 py-2 text-center font-mono text-sm text-white outline-none ring-1 ring-ink-600 focus:ring-sky" placeholder="печатай здесь…" />
      </div>}
      {state === "done" && <Summary correct={score} total={TYPE_WORDS.length} xp={score * 4} title={`${wpm} WPM`} onRestart={start} extra={<div className="mb-3 font-mono text-sm font-extrabold text-gold">Скорость печати {wpm} слов/мин</div>} />}
    </AssetCard>
  );
}

/* ═════════ GPX-08 · Supply & Demand Zone Painter ═════════ */
function ZonePainter() {
  const game = useGame();
  const data = useMemo(() => { const d = genCandles(52, 34, 100, 1); for (let i = 0; i < d.length; i++) { const wave = Math.sin(i / 4) * 4; d[i] = { ...d[i], o: d[i].o + wave, c: d[i].c + wave, h: d[i].h + wave, l: d[i].l + wave }; } return d; }, []);
  const demand = { lo: 94, hi: 97 }, supply = { lo: 107, hi: 110 };
  const W = 300, H = 200, PAD = 8;
  const lo = 90, hi = 114;
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H - PAD * 2);
  const price = (py: number) => hi - ((py - PAD) / (H - PAD * 2)) * (hi - lo);
  const svg = useRef<SVGSVGElement>(null);
  const [zone, setZone] = useState<null | { a: number; b: number }>(null);
  const zoneRef = useRef<null | { a: number; b: number }>(null);
  const [placed, setPlaced] = useState<{ lo: number; hi: number }[]>([]);
  const [checked, setChecked] = useState(false);
  const toP = (cy: number) => { const r = svg.current!.getBoundingClientRect(); return price(((cy - r.top) / r.height) * H); };
  const onDown = useDrag({
    onStart: (_x, cy) => { if (checked || placed.length >= 2) return false; zoneRef.current = { a: toP(cy), b: toP(cy) }; setZone({ ...zoneRef.current }); feel("tap", 4); },
    onMove: (d) => { if (zoneRef.current) { zoneRef.current = { ...zoneRef.current, b: toP(d.y) }; setZone({ ...zoneRef.current }); } },
    onEnd: () => { const z = zoneRef.current; if (z && Math.abs(z.a - z.b) > 1.5) { setPlaced((p) => [...p, { lo: Math.min(z.a, z.b), hi: Math.max(z.a, z.b) }]); feel("pop"); } setZone(null); zoneRef.current = null; },
  });
  const overlap = (z: { lo: number; hi: number }, t: { lo: number; hi: number }) => Math.max(0, Math.min(z.hi, t.hi) - Math.max(z.lo, t.lo)) / (t.hi - t.lo);
  const check = (x: number, cy: number) => {
    setChecked(true);
    const hitD = placed.some((z) => overlap(z, demand) > 0.4);
    const hitS = placed.some((z) => overlap(z, supply) > 0.4);
    const ok = hitD && hitS;
    if (ok) { game.complete({ skill: "patterns", xp: 20, x, y: cy }); feel("success", [20, 30]); } else { game.complete({ skill: "patterns", ok: false }); feel("error"); }
  };
  return (
    <AssetCard id="GPX-08" title="Supply & Demand Zones" desc="Протяни прямоугольники там, где цена резко разворачивалась: нижняя зона спроса и верхняя зона предложения. Проверка подсветит истинные зоны." tags={["gameplay", "learn", "zones", "draw"]}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} onPointerDown={onDown} className="well w-full cursor-crosshair touch-none select-none rounded-2xl">
        {checked && <><rect x="0" y={y(demand.hi)} width={W} height={y(demand.lo) - y(demand.hi)} fill="#2ee59d" opacity=".16" /><text x="4" y={y(demand.hi) - 3} fontSize="8" fontWeight="800" fill="#2ee59d">DEMAND</text><rect x="0" y={y(supply.hi)} width={W} height={y(supply.lo) - y(supply.hi)} fill="#ff4d6a" opacity=".16" /><text x="4" y={y(supply.hi) - 3} fontSize="8" fontWeight="800" fill="#ff4d6a">SUPPLY</text></>}
        {data.map((c, i) => { const up = c.c >= c.o, col = up ? "#2ee59d" : "#ff4d6a", cw = W / data.length, cx = i * cw + cw / 2; return <g key={i}><line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" /><rect x={cx - cw * 0.3} width={cw * 0.6} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx="1" /></g>; })}
        {placed.map((z, k) => { const good = checked && (overlap(z, demand) > 0.4 || overlap(z, supply) > 0.4); return <rect key={k} x="0" y={y(z.hi)} width={W} height={y(z.lo) - y(z.hi)} fill="none" stroke={checked ? (good ? "#2ee59d" : "#ff4d6a") : "#5ce1ff"} strokeWidth="2" strokeDasharray="5 3" />; })}
        {zone && <rect x="0" y={y(Math.max(zone.a, zone.b))} width={W} height={Math.abs(y(zone.a) - y(zone.b))} fill="#5ce1ff22" stroke="#5ce1ff" strokeWidth="1.5" />}
        {placed.length === 0 && !zone && <text x={W / 2} y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#8fa0cf">↕ выдели 2 зоны разворота</text>}
      </svg>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("text-xs font-bold", !checked ? "text-ink-400" : "text-white")}>{!checked ? `Зон нарисовано: ${placed.length}/2` : placed.some((z) => overlap(z, demand) > 0.4) && placed.some((z) => overlap(z, supply) > 0.4) ? "Обе зоны найдены! +20 XP" : "Зоны там, где длинные тени и развороты"}</span>
        <div className="flex gap-2"><Btn v="ghost" size="sm" onClick={() => { setPlaced([]); setChecked(false); }}>Clear</Btn>{!checked && <Btn v="bull" size="sm" disabled={placed.length < 2} onClick={(e) => check(e.clientX, e.clientY)}>Check</Btn>}</div>
      </div>
    </AssetCard>
  );
}

export default function Gameplay3() {
  return (
    <Section id="advanced" num="G4" title="Gameplay · Advanced" subtitle="8 продвинутых механик: фибо-инструмент, угадай свечу, лаборатория индикаторов, ложные пробои, маржин-колл, счёт P&L, печать паттернов, зоны спроса/предложения">
      <FibTool />
      <GuessNext />
      <IndicatorLab />
      <FakeBreakout />
      <MarginCall />
      <MathRace />
      <PatternTyping />
      <ZonePainter />
    </Section>
  );
}
