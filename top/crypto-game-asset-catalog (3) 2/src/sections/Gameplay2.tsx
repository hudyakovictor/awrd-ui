import { useMemo, useRef, useState, type PointerEvent as RPE } from "react";
import { AssetCard, Btn, Burst, Icon, Label, Section, useBump, useCountUp, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useRaf } from "../ui/hooks";
import { CandleChart, PriceTag, tri } from "../ui/Chart";
import { ExHeader, ScoreRing, Summary, TimerBar, Verdict } from "../ui/exercise";
import { genCandles, rng, type Candle } from "../game/market";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ GPP-01 · Bar Replay Trading Simulator ═════════ */

const REPLAY = genCandles(42, 140, 100, 1.0, 0.04);
type Trade = { side: "long" | "short"; entry: number; exit: number; i0: number; i1: number; pnl: number };
function BarReplay() {
  const game = useGame();
  const START = 40, END = REPLAY.length;
  const [idx, setIdx] = useState(START);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pos, setPos] = useState<{ side: "long" | "short"; entry: number; qty: number; i0: number } | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [bal, setBal] = useState(10000);
  const [eq, setEq] = useState<number[]>([10000]);
  const [done, setDone] = useState(false);
  const [b, bump] = useBump();
  const last = REPLAY[idx - 1];
  const upnl = pos ? (pos.side === "long" ? last.c - pos.entry : pos.entry - last.c) * pos.qty : 0;
  const balV = useCountUp(bal + upnl, 400);
  const step = () => {
    if (idx >= END) { setPlaying(false); setDone(true); return; }
    const nc = REPLAY[idx];
    setIdx(idx + 1);
    setEq((e) => [...e, bal + (pos ? (pos.side === "long" ? nc.c - pos.entry : pos.entry - nc.c) * pos.qty : 0)]);
    if (idx % 10 === 0) sfx.play("tick");
  };
  useInterval(step, playing ? 700 / speed : null);
  const close = (i: number, price: number) => {
    if (!pos) return;
    const pnl = (pos.side === "long" ? price - pos.entry : pos.entry - price) * pos.qty;
    setTrades((t) => [...t, { side: pos.side, entry: pos.entry, exit: price, i0: pos.i0, i1: i, pnl }]);
    setBal((v) => v + pnl); setPos(null);
    if (pnl > 0) { bump(); feel("coin", 12); } else feel("lock", 20);
  };
  const act = (side: "long" | "short") => {
    if (done) return;
    const price = last.c;
    if (pos && pos.side !== side) { close(idx - 1, price); return; }
    if (pos) return;
    setPos({ side, entry: price, qty: (bal * 0.5) / price, i0: idx - 1 });
    feel(side === "long" ? "success" : "error", 10);
  };
  const finish = (x: number, y: number) => {
    if (pos) close(idx - 1, last.c);
    setPlaying(false); setDone(true);
    const total = bal + upnl - 10000;
    game.complete({ skill: "risk", xp: clamp(Math.round(10 + total / 15), 8, 40), x, y });
  };
  const reset = () => { setIdx(START); setPlaying(false); setPos(null); setTrades([]); setBal(10000); setEq([10000]); setDone(false); };
  const win0 = Math.max(0, idx - 50);
  const view = REPLAY.slice(win0, idx);
  const wins = trades.filter((t) => t.pnl > 0).length;
  const total = bal + upnl - 10000;
  const eqPath = (() => { const mx = Math.max(...eq), mn = Math.min(...eq); return eq.map((v, i) => `${i ? "L" : "M"}${(i / Math.max(1, eq.length - 1)) * 300} ${30 - ((v - mn) / (mx - mn || 1)) * 26}`).join(" "); })();
  const best = trades.reduce((a, t) => Math.max(a, t.pnl), 0);
  return (
    <AssetCard id="GPP-01" title="Bar Replay · Trading Simulator" desc="Флагманский тренажёр: график проигрывается бар за баром (play / step / скорость), ты открываешь лонг/шорт, видишь живой PnL, метки сделок и кривую капитала. Итог — статистика и XP." tags={["gameplay", "practice", "simulator", "replay", "trading"]} className="md:col-span-2" stageClass="overflow-hidden">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Balance</div>
          <div className="font-mono text-2xl font-extrabold tabular-nums text-white">${balV.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
        </div>
        <div className={cn("rounded-xl px-3 py-1.5 font-mono text-sm font-extrabold", total >= 0 ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>{total >= 0 ? "+" : "−"}${Math.abs(total).toFixed(0)} · {((total / 10000) * 100).toFixed(1)}%</div>
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-ink-300"><span>Bar {idx}/{END}</span><span className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-900"><span className="block h-full bg-sky" style={{ width: `${((idx - START) / (END - START)) * 100}%` }} /></span></div>
      </div>
      <div className="relative">
        <CandleChart data={view} h={190} className="well w-full rounded-2xl">
          {(s) => (
            <>
              {pos && <PriceTag s={s} price={pos.entry} color={pos.side === "long" ? "#2ee59d" : "#ff4d6a"} label={pos.side.toUpperCase()} />}
              <PriceTag s={s} price={last.c} color="#ffffff" label={last.c.toFixed(1)} dash="2 3" />
              {trades.map((t, k) => (
                <g key={k}>
                  {t.i0 >= win0 && <path d={tri(s.x(t.i0 - win0), s.y(t.entry), t.side === "long")} fill={t.side === "long" ? "#2ee59d" : "#ff4d6a"} />}
                  {t.i1 >= win0 && <path d={tri(s.x(t.i1 - win0), s.y(t.exit), t.side !== "long")} fill={t.pnl >= 0 ? "#ffc53d" : "#8fa0cf"} />}
                </g>
              ))}
              {pos && pos.i0 >= win0 && <path d={tri(s.x(pos.i0 - win0), s.y(pos.entry), pos.side === "long")} fill={pos.side === "long" ? "#2ee59d" : "#ff4d6a"} style={{ filter: "drop-shadow(0 0 6px #fff)" }} />}
            </>
          )}
        </CandleChart>
        {pos && <div className={cn("absolute left-3 top-3 rounded-xl px-2.5 py-1.5 font-mono text-xs font-extrabold", upnl >= 0 ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>{pos.side.toUpperCase()} {upnl >= 0 ? "+" : "−"}${Math.abs(upnl).toFixed(1)}</div>}
        <Burst trigger={b} colors={["#ffc53d", "#2ee59d"]} />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Equity</span>
        <svg viewBox="0 0 300 32" className="h-8 flex-1" preserveAspectRatio="none"><path d={eqPath} fill="none" stroke={total >= 0 ? "#2ee59d" : "#ff4d6a"} strokeWidth="2" /></svg>
      </div>
      {!done ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[auto_auto_1fr_1fr_auto]">
          <div className="flex gap-1.5">
            <Btn v="dark" size="icon" onClick={() => { setPlaying(!playing); feel("tap"); }} aria-label="play">{playing ? <span className="flex gap-1"><span className="h-3.5 w-1 rounded bg-current" /><span className="h-3.5 w-1 rounded bg-current" /></span> : <Icon name="play" size={16} variant="solid" />}</Btn>
            <Btn v="dark" size="icon" onClick={step} aria-label="step"><Icon name="chevR" size={16} stroke={3} /></Btn>
          </div>
          <div className="well flex rounded-xl p-1">{[1, 2, 4].map((s) => <button key={s} onClick={() => setSpeed(s)} className={cn("rounded-lg px-2 font-mono text-[11px] font-extrabold", speed === s ? "raised text-white" : "text-ink-400")}>{s}×</button>)}</div>
          <Btn v="bull" onClick={() => act("long")} className={pos?.side === "long" ? "is-pressed" : ""}>{pos?.side === "short" ? "Close & Buy" : "Buy"}</Btn>
          <Btn v="bear" onClick={() => act("short")} className={pos?.side === "short" ? "is-pressed" : ""}>{pos?.side === "long" ? "Close & Sell" : "Sell"}</Btn>
          <div className="col-span-2 flex gap-1.5 sm:col-span-1">
            {pos && <Btn v="ghost" onClick={() => close(idx - 1, last.c)}>Close</Btn>}
            <Btn v="gold" onClick={(e) => finish(e.clientX, e.clientY)}>Finish</Btn>
          </div>
        </div>
      ) : (
        <div className="anim-pop mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-3"><Mascot mood={total >= 0 ? "happy" : "sad"} size={64} /><div><div className={cn("text-lg font-extrabold", total >= 0 ? "text-bull" : "text-bear")}>{total >= 0 ? "Profit session" : "Losing session"}</div><div className="text-xs text-ink-300">{total >= 0 ? "Дисциплина окупилась." : "Разбери сделки — это опыт."}</div></div></div>
          <div className="grid grid-cols-4 gap-2">
            {[["Trades", trades.length], ["Win rate", trades.length ? `${Math.round((wins / trades.length) * 100)}%` : "—"], ["Best", `+$${best.toFixed(0)}`], ["Net", `${total >= 0 ? "+" : "−"}$${Math.abs(total).toFixed(0)}`]].map(([l, v]) => <div key={l as string} className="raised rounded-xl p-2 text-center"><div className="text-[9px] font-extrabold uppercase text-ink-400">{l}</div><div className="font-mono text-sm font-extrabold text-white">{v}</div></div>)}
            <Btn v="sky" size="sm" className="col-span-4" onClick={reset}><Icon name="refresh" size={14} />Replay session</Btn>
          </div>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPP-02 · Drag SL / TP ═════════ */
function DragSLTP() {
  const game = useGame();
  const data = useMemo(() => genCandles(9, 32, 100, 1.1, 0.06), []);
  const entry = data[data.length - 1].c;
  const swing = Math.min(...data.slice(-12).map((c) => c.l));
  const lo = Math.min(...data.map((c) => c.l)) * 0.965, hi = Math.max(...data.map((c) => c.h)) * 1.05;
  const H = 200, PAD = 8;
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H - PAD * 2);
  const price = (py: number) => hi - ((py - PAD) / (H - PAD * 2)) * (hi - lo);
  const [sl, setSl] = useState(entry * 0.985);
  const [tp, setTp] = useState(entry * 1.02);
  const [res, setRes] = useState<null | { ok: boolean; msg: string }>(null);
  const box = useRef<HTMLDivElement>(null);
  const toY = (cy: number) => { const r = box.current!.getBoundingClientRect(); return ((cy - r.top) / r.height) * H; };
  const dSl = useDrag({ onStart: () => { setRes(null); feel("tap", 4); }, onMove: (d) => setSl(clamp(price(toY(d.y)), lo, entry - 0.2)) });
  const dTp = useDrag({ onStart: () => { setRes(null); feel("tap", 4); }, onMove: (d) => setTp(clamp(price(toY(d.y)), entry + 0.2, hi)) });
  const rr = (tp - entry) / (entry - sl);
  const check = (x: number, yy: number) => {
    const below = sl < swing;
    const ok = below && rr >= 2;
    const msg = !below ? "Стоп выше свинг-лоу — его снимут первым же «хвостом»." : rr < 2 ? `R:R ${rr.toFixed(1)} — цель слишком близко. Нужно ≥ 2.` : `R:R ${rr.toFixed(1)}, стоп под структурой. Профессионально!`;
    setRes({ ok, msg });
    if (ok) { game.complete({ skill: "risk", xp: 18, x, y: yy }); feel("success"); } else { game.complete({ skill: "risk", ok: false }); feel("error"); }
  };
  const rrCol = rr >= 2 ? "#2ee59d" : rr >= 1 ? "#ffc53d" : "#ff4d6a";
  return (
    <AssetCard id="GPP-02" title="Drag Stop-Loss & Take-Profit" desc="Перетаскивай линии SL и TP прямо на графике. Зоны риска/прибыли заливаются, R:R считается живьём. Проверка: стоп под свинг-лоу и R:R ≥ 2." tags={["gameplay", "practice", "risk", "drag", "orders"]}>
      <div ref={box} className="relative">
        <CandleChart data={data} h={H} lo={lo} hi={hi} className="well w-full rounded-2xl">
          {(s) => (
            <>
              <rect x="0" y={s.y(tp)} width={s.w} height={Math.max(0, s.y(entry) - s.y(tp))} fill="#2ee59d" opacity=".12" />
              <rect x="0" y={s.y(entry)} width={s.w} height={Math.max(0, s.y(sl) - s.y(entry))} fill="#ff4d6a" opacity=".12" />
              <line x1="0" x2={s.w} y1={s.y(swing)} y2={s.y(swing)} stroke="#ffc53d" strokeDasharray="3 4" strokeWidth="1" />
              <text x="4" y={s.y(swing) - 3} fontSize="8" fontWeight="800" fill="#ffc53d">SWING LOW</text>
              <PriceTag s={s} price={entry} color="#ffffff" label={`E ${entry.toFixed(1)}`} dash="0" />
            </>
          )}
        </CandleChart>
        {[{ k: "tp", v: tp, fn: dTp, c: "#2ee59d", l: "TP" }, { k: "sl", v: sl, fn: dSl, c: "#ff4d6a", l: "SL" }].map((h) => (
          <div key={h.k} onPointerDown={h.fn} className="absolute left-0 right-0 flex -translate-y-1/2 cursor-ns-resize touch-none items-center" style={{ top: `${(y(h.v) / H) * 100}%` }}>
            <div className="h-0.5 flex-1" style={{ background: h.c }} />
            <div className="flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-[10px] font-extrabold text-ink-900 shadow-[0_3px_0_rgba(0,0,0,.35)]" style={{ background: h.c }}><Icon name="chevU" size={10} stroke={3} />{h.l} {h.v.toFixed(1)}<Icon name="chevD" size={10} stroke={3} /></div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Risk</div><div className="font-mono text-xs font-extrabold text-bear">−{(((entry - sl) / entry) * 100).toFixed(1)}%</div></div>
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">R : R</div><div className="font-mono text-base font-extrabold" style={{ color: rrCol }}>1 : {rr.toFixed(1)}</div></div>
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Reward</div><div className="font-mono text-xs font-extrabold text-bull">+{(((tp - entry) / entry) * 100).toFixed(1)}%</div></div>
      </div>
      {res ? <Verdict inline ok={res.ok} text={res.msg} onNext={() => setRes(null)} label="Adjust again" /> : <Btn v="bull" size="sm" block className="mt-3" onClick={(e) => check(e.clientX, e.clientY)}>Place order</Btn>}
    </AssetCard>
  );
}

/* ═════════ GPP-03 · Support / Resistance Tap ═════════ */
const SR_LEVELS = [{ p: 105, t: "Resistance" }, { p: 95, t: "Support" }];
function SRTap() {
  const game = useGame();
  const data = useMemo(() => { const r = rng(77); const out: Candle[] = []; let p = 100; for (let i = 0; i < 40; i++) { const target = 100 + 5 * Math.sin(i / 3.2); const o = p; const c = o + (target - o) * 0.5 + (r() - 0.5) * 1.4; out.push({ o, c, h: Math.max(o, c) + r() * 0.6, l: Math.min(o, c) - r() * 0.6, v: 1 }); p = c; } return out; }, []);
  const lo = 91, hi = 109, H = 180, PAD = 8;
  const price = (py: number) => hi - ((py - PAD) / (H - PAD * 2)) * (hi - lo);
  const [lines, setLines] = useState<number[]>([]);
  const [res, setRes] = useState<number | null>(null);
  const tap = (e: RPE<HTMLDivElement>) => {
    if (res !== null) return;
    const r = e.currentTarget.getBoundingClientRect();
    const pr = price(((e.clientY - r.top) / r.height) * H);
    const near = lines.findIndex((l) => Math.abs(l - pr) < 0.7);
    if (near >= 0) { setLines(lines.filter((_, k) => k !== near)); feel("lock"); return; }
    if (lines.length >= 3) { feel("error"); return; }
    setLines([...lines, pr]); feel("pop", 6);
  };
  const check = (x: number, yy: number) => {
    let sc = 0;
    SR_LEVELS.forEach((L) => { if (lines.some((l) => Math.abs(l - L.p) < 1.0)) sc += 50; });
    sc = clamp(sc - Math.max(0, lines.length - 2) * 10, 0, 100);
    setRes(sc);
    if (sc >= 50) { game.complete({ skill: "patterns", xp: Math.round(sc / 5), x, y: yy }); feel("success"); } else { game.complete({ skill: "patterns", ok: false }); feel("error"); }
  };
  return (
    <AssetCard id="GPP-03" title="Mark Support & Resistance" desc="Тапни по графику, чтобы провести до 3 уровней (повторный тап удаляет). Проверка показывает истинные зоны и точки касания с оценкой точности." tags={["gameplay", "practice", "levels", "tap"]}>
      <div onPointerDown={tap} className="relative cursor-crosshair touch-none">
        <CandleChart data={data} h={H} lo={lo} hi={hi} className="well w-full rounded-2xl">
          {(s) => (
            <>
              {res !== null && SR_LEVELS.map((L) => (
                <g key={L.t} style={{ animation: "fadeIn .5s both" }}>
                  <rect x="0" y={s.y(L.p + 0.8)} width={s.w} height={s.y(L.p - 0.8) - s.y(L.p + 0.8)} fill="#2ee59d" opacity=".15" />
                  <text x="4" y={s.y(L.p) - 10} fontSize="8" fontWeight="800" fill="#2ee59d">{L.t.toUpperCase()}</text>
                  {data.map((c, i) => (Math.abs(c.h - L.p) < 0.6 || Math.abs(c.l - L.p) < 0.6) && <circle key={i} cx={s.x(i)} cy={s.y(L.p)} r="3" fill="#2ee59d" />)}
                </g>
              ))}
              {lines.map((l, k) => (
                <g key={k}>
                  <line x1="0" x2={s.w} y1={s.y(l)} y2={s.y(l)} stroke={res === null ? "#fff" : SR_LEVELS.some((L) => Math.abs(L.p - l) < 1) ? "#2ee59d" : "#ff4d6a"} strokeWidth="2" strokeDasharray="6 4" />
                  <rect x={s.w - 40} y={s.y(l) - 8} width="40" height="16" rx="4" fill="#fff" /><text x={s.w - 20} y={s.y(l) + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fill="#0a1330" fontFamily="JetBrains Mono">{l.toFixed(1)}</text>
                </g>
              ))}
            </>
          )}
        </CandleChart>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {res !== null ? <div className="anim-pop flex items-center gap-3"><ScoreRing value={res} size={56} color={res >= 50 ? "#2ee59d" : "#ff4d6a"} /><div className="text-xs font-bold text-ink-300">{res === 100 ? "Оба уровня найдены!" : res >= 50 ? "Один уровень точный" : "Ищи, где цена разворачивалась ≥ 2 раз"}</div></div> : <span className="text-[11px] font-bold text-ink-400">Линий: {lines.length}/3</span>}
        <div className="flex gap-2">
          <Btn v="ghost" size="sm" onClick={() => { setLines([]); setRes(null); }}>Clear</Btn>
          {res === null && <Btn v="bull" size="sm" disabled={lines.length === 0} onClick={(e) => check(e.clientX, e.clientY)}>Check</Btn>}
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ GPP-04 · Estimation Slider ═════════ */
const EST = [
  { q: "При плече 20× какое движение против тебя ликвидирует позицию?", unit: "%", max: 50, ans: 5, tol: 1.5, why: "100% / 20 = 5%. Плечо делит твой запас прочности." },
  { q: "Ты рискуешь 2% на сделку. Сколько подряд убытков «съедят» половину депозита?", unit: " сделок", max: 100, ans: 34, tol: 6, why: "0.98³⁴ ≈ 0.5. Маленький риск даёт запас на длинную серию неудач." },
  { q: "После падения на 50% сколько % роста нужно, чтобы вернуться в ноль?", unit: "%", max: 200, ans: 100, tol: 12, why: "Убытки асимметричны: −50% требует +100%." },
  { q: "Комиссия 0.1% за сделку. Сколько % депозита съест 200 сделок туда-обратно?", unit: "%", max: 100, ans: 40, tol: 8, why: "400 операций × 0.1% = 40%. Overtrading убивает счёт." },
];
function EstimateSlider() {
  const game = useGame();
  const [i, setI] = useState(0);
  const q = EST[i];
  const [v, setV] = useState(q.max / 2);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const set = (cx: number) => { const r = track.current!.getBoundingClientRect(); const nv = Math.round(clamp((cx - r.left) / r.width, 0, 1) * q.max); setV((o) => { if (o !== nv) sfx.play("tick"); return nv; }); };
  const onDown = useDrag({ onStart: (x) => { if (locked) return false; set(x); }, onMove: (d) => set(d.x) });
  const ok = Math.abs(v - q.ans) <= q.tol;
  const lock = (x: number, y: number) => { setLocked(true); if (ok) { setScore((s) => s + 1); game.complete({ skill: "risk", xp: 12, x, y }); feel("success"); } else { game.complete({ skill: "risk", ok: false }); feel("error"); } };
  const next = () => { if (i === EST.length - 1) { setDone(true); return; } setI(i + 1); setV(EST[i + 1].max / 2); setLocked(false); sfx.play("whoosh"); };
  const pct = (x: number) => (x / q.max) * 100;
  return (
    <AssetCard id="GPP-04" title="Estimate the Number" desc="Интуиция риска: оцени величину слайдером и зафиксируй. Ответ «въезжает» маркером, полоса допуска показывает, насколько ты близко." tags={["gameplay", "practice", "estimate", "slider", "risk"]}>
      {done ? <Summary correct={score} total={EST.length} xp={score * 12} onRestart={() => { setI(0); setV(EST[0].max / 2); setLocked(false); setScore(0); setDone(false); }} /> : (
        <div>
          <ExHeader step={i} total={EST.length} />
          <div className="raised mb-4 rounded-2xl p-3 text-sm font-extrabold text-white">{q.q}</div>
          <div className={cn("text-center font-mono text-4xl font-extrabold", locked ? (ok ? "text-bull" : "text-bear") : "text-sky")}>{v}{q.unit}</div>
          <div ref={track} onPointerDown={onDown} className="relative mt-2 h-12 cursor-pointer touch-none">
            <div className="well absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" />
            {locked && <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full bg-bull/40" style={{ left: `${pct(Math.max(0, q.ans - q.tol))}%`, width: `${pct(Math.min(q.max, q.ans + q.tol)) - pct(Math.max(0, q.ans - q.tol))}%`, animation: "fadeIn .5s both" }} />}
            <div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-edge to-sky" style={{ width: `${pct(v)}%` }} />
            {locked && <div className="absolute top-0 flex h-12 -translate-x-1/2 flex-col items-center" style={{ left: `${pct(q.ans)}%`, transition: "left 1s cubic-bezier(.3,1.4,.5,1)" }}><span className="rounded bg-bull px-1 font-mono text-[9px] font-extrabold text-ink-900">{q.ans}</span><span className="h-full w-0.5 bg-bull" /></div>}
            <div className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_4px_0_#1e56c9]" style={{ left: `${pct(v)}%`, background: locked ? (ok ? "#2ee59d" : "#ff4d6a") : "#3d8bff" }} />
          </div>
          <div className="flex justify-between font-mono text-[10px] font-bold text-ink-400"><span>0</span><span>{q.max / 2}</span><span>{q.max}</span></div>
          {locked ? <Verdict inline ok={ok} title={ok ? "В допуске!" : `Ответ: ${q.ans}${q.unit}`} text={q.why} onNext={next} label={i === EST.length - 1 ? "Finish" : "Next"} /> : <Btn v="gold" size="sm" block className="mt-3" onClick={(e) => lock(e.clientX, e.clientY)}><Icon name="lock" size={14} />Lock in</Btn>}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPP-05 · Rebalance to Target ═════════ */
const RB = [{ s: "BTC", c: "#f7931a", cur: 60, tgt: 40 }, { s: "ETH", c: "#8c8cff", cur: 10, tgt: 25 }, { s: "SOL", c: "#14f195", cur: 20, tgt: 15 }, { s: "USDT", c: "#26a17b", cur: 10, tgt: 20 }];
function Rebalance() {
  const game = useGame();
  const [cur, setCur] = useState(RB.map((r) => r.cur));
  const [src, setSrc] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const tap = (i: number, x: number, y: number) => {
    if (done) return;
    if (src === null) { if (cur[i] < 5) { feel("lock"); return; } setSrc(i); sfx.play("tap"); return; }
    if (src === i) { setSrc(null); return; }
    const n = [...cur]; n[src] -= 5; n[i] += 5;
    setCur(n); setSrc(null); setMoves((m) => m + 1); feel("coin", 6);
    if (n.every((v, k) => Math.abs(v - RB[k].tgt) <= 2.5)) { setDone(true); game.complete({ skill: "defi", xp: Math.max(8, 26 - moves * 2), x, y }); feel("success", [20, 30, 60]); }
  };
  const reset = () => { setCur(RB.map((r) => r.cur)); setSrc(null); setMoves(0); setDone(false); };
  const optimal = 7;
  return (
    <AssetCard id="GPP-05" title="Rebalance to Target" desc="Приведи портфель к целевым долям: тап на источник, тап на получателя — переезжает 5%. Каждый ход стоит комиссию, поэтому ищи минимальный путь." tags={["gameplay", "practice", "portfolio", "rebalance"]}>
      <div className="mb-3 flex items-center justify-between text-xs font-bold"><span className="text-ink-300">Moves <span className="font-mono text-white">{moves}</span> · optimal {optimal}</span><span className="font-mono text-bear">fee −${(moves * 2.5).toFixed(1)}</span></div>
      <div className="space-y-2.5">
        {RB.map((r, i) => {
          const diff = cur[i] - r.tgt;
          const okRow = Math.abs(diff) <= 2.5;
          return (
            <button key={r.s} onClick={(e) => tap(i, e.clientX, e.clientY)} className={cn("w-full rounded-2xl p-2.5 text-left transition-all", src === i ? "raised ring-2 ring-sky -translate-y-0.5" : src !== null ? "bg-ink-800 ring-1 ring-bull/40 hover:ring-bull" : "bg-ink-800", okRow && done && "ring-2 ring-bull")}>
              <div className="mb-1.5 flex items-center justify-between text-xs font-extrabold"><span className="flex items-center gap-2 text-white"><span className="h-3 w-3 rounded" style={{ background: r.c }} />{r.s}</span><span className="font-mono"><span className="text-white">{cur[i]}%</span><span className="text-ink-500"> → {r.tgt}%</span><span className={cn("ml-2", okRow ? "text-bull" : "text-gold")}>{okRow ? "✓" : `${diff > 0 ? "−" : "+"}${Math.abs(diff)}`}</span></span></div>
              <div className="relative h-3 overflow-hidden rounded-full bg-ink-950">
                <div className="h-full rounded-full transition-[width] duration-400" style={{ width: `${cur[i]}%`, background: r.c }} />
                <div className="absolute top-0 h-full w-0.5 bg-white" style={{ left: `${r.tgt}%` }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-bold text-ink-400">{done ? `Сбалансировано за ${moves} ходов` : src !== null ? `Куда перевести 5% из ${RB[src].s}?` : "Выбери источник"}</span>
        <Btn v="ghost" size="sm" onClick={reset}><Icon name="refresh" size={14} />Reset</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ GPP-06 · Stop Hunt Survival ═════════ */
const HUNT: Candle[] = [
  { o: 100, c: 99.2, h: 100.6, l: 98.8, v: 1 }, { o: 99.2, c: 98.4, h: 99.5, l: 97.9, v: 1 }, { o: 98.4, c: 98.9, h: 99.3, l: 97.6, v: 1 }, { o: 98.9, c: 98.2, h: 99.1, l: 96.2, v: 1 },
  { o: 98.2, c: 100.4, h: 100.9, l: 98.0, v: 1 }, { o: 100.4, c: 102.1, h: 102.5, l: 100.1, v: 1 }, { o: 102.1, c: 103.6, h: 104, l: 101.8, v: 1 }, { o: 103.6, c: 105.8, h: 106.2, l: 103.2, v: 1 },
];
function StopHunt() {
  const game = useGame();
  const pre = useMemo(() => { const g = genCandles(13, 16, 100, 0.9); const shift = 100 - g[g.length - 1].c; const d = g.map((c) => ({ o: c.o + shift, c: c.c + shift, h: c.h + shift, l: c.l + shift, v: 1 })); d[6].l = 97.0; d[11].l = 97.2; d[6].c = Math.max(d[6].c, 97.6); d[11].c = Math.max(d[11].c, 97.8); return d; }, []);
  const [stop, setStop] = useState(97.8);
  const [n, setN] = useState(0);
  const [state, setState] = useState<"place" | "run" | "stopped" | "won">("place");
  const lo = 94, hi = 107, H = 200, PAD = 8;
  const y = (v: number) => PAD + ((hi - v) / (hi - lo)) * (H - PAD * 2);
  const price = (py: number) => hi - ((py - PAD) / (H - PAD * 2)) * (hi - lo);
  const box = useRef<HTMLDivElement>(null);
  const dStop = useDrag({ onStart: () => state === "place", onMove: (d) => { const r = box.current!.getBoundingClientRect(); setStop(clamp(price(((d.y - r.top) / r.height) * H), lo + 0.3, 99.6)); } });
  useInterval(() => {
    const c = HUNT[n];
    setN(n + 1); sfx.play("tick");
    if (c.l <= stop) { setState("stopped"); feel("error", [40, 40, 60]); game.complete({ skill: "psychology", ok: false }); return; }
    if (n + 1 === HUNT.length) { setState("won"); feel("success", [20, 30, 60]); game.complete({ skill: "psychology", xp: 100 - stop > 6 ? 10 : 22 }); }
  }, state === "run" && n < HUNT.length ? 420 : null);
  const risk = 100 - stop;
  const shown = state === "stopped" ? HUNT : HUNT.slice(0, n);
  const reset = () => { setN(0); setState("place"); setStop(97.8); };
  return (
    <AssetCard id="GPP-06" title="Stop Hunt Survival" desc="Ты в лонге от 100. Поставь стоп, учитывая зону ликвидности (равные минимумы). Запусти рынок: он сходит за стопами, а потом улетит. Выживешь?" tags={["gameplay", "practice", "stop-loss", "liquidity", "psychology"]}>
      <div ref={box} className="relative">
        <CandleChart data={[...pre, ...shown]} h={H} lo={lo} hi={hi} dim={state === "stopped" ? (i) => i >= pre.length + n : undefined} className="well w-full rounded-2xl">
          {(s) => (
            <>
              <rect x="0" y={s.y(97.6)} width={s.w} height={s.y(96.8) - s.y(97.6)} fill="#ff8a3d" opacity=".18" />
              <text x="4" y={s.y(97.6) - 3} fontSize="8" fontWeight="800" fill="#ff8a3d">LIQUIDITY POOL · equal lows</text>
              <PriceTag s={s} price={100} color="#ffffff" label="LONG 100" dash="0" />
              {state !== "place" && <line x1={s.x(pre.length) - s.cw / 2} x2={s.x(pre.length) - s.cw / 2} y1="0" y2={s.h} stroke="#ffffff33" strokeDasharray="3 3" />}
            </>
          )}
        </CandleChart>
        <div onPointerDown={dStop} className={cn("absolute left-0 right-0 flex -translate-y-1/2 items-center", state === "place" ? "cursor-ns-resize touch-none" : "")} style={{ top: `${(y(stop) / H) * 100}%` }}>
          <div className={cn("h-0.5 flex-1", state === "stopped" ? "bg-bear" : "bg-bear/80")} style={{ boxShadow: state === "stopped" ? "0 0 10px #ff4d6a" : undefined }} />
          <div className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-extrabold text-white shadow-[0_3px_0_#8c1530]", state === "stopped" ? "anim-shake bg-bear" : "bg-bear")}>STOP {stop.toFixed(1)} · −{risk.toFixed(1)}%</div>
        </div>
      </div>
      <div className="mt-3">
        {state === "place" && <div className="flex items-center justify-between"><span className="text-xs font-bold text-ink-300">Риск <b className={risk > 6 ? "text-bear" : risk > 3.5 ? "text-gold" : "text-bull"}>{risk.toFixed(1)}%</b> · тяни красную линию</span><Btn v="gold" size="sm" onClick={() => { setState("run"); feel("whoosh"); }}><Icon name="play" size={14} variant="solid" />Run market</Btn></div>}
        {state === "run" && <div className="text-center text-xs font-extrabold text-ink-300">Рынок идёт… свеча {n}/{HUNT.length}</div>}
        {state === "stopped" && <Verdict inline ok={false} title="Стоп снят — и цена улетела без тебя" text={`Твой стоп стоял в зоне ликвидности. Крупные игроки собрали такие стопы «хвостом» до 96.2 и развернули рынок на +5.8%.`} onNext={reset} label="Try again" />}
        {state === "won" && <Verdict inline ok={risk <= 6} title={risk <= 6 ? "Выжил и заработал +5.8%!" : "Выжил, но риск был слишком большой"} text={risk <= 6 ? `Стоп под ликвидностью при риске ${risk.toFixed(1)}% — R:R ≈ 1:${(5.8 / risk).toFixed(1)}. Отлично.` : `Риск ${risk.toFixed(1)}% при цели +5.8% даёт R:R < 1. Ставь стоп сразу под зоной, а не далеко.`} onNext={reset} label="Play again" />}
      </div>
    </AssetCard>
  );
}

/* ═════════ GPP-07 · Order Book Reading ═════════ */
function mkBook(seed: number) {
  const r = rng(seed);
  const asks = Array.from({ length: 7 }, (_, i) => ({ p: 64250 + (i + 1) * 5, s: +(0.3 + r() * 2).toFixed(2) }));
  const bids = Array.from({ length: 7 }, (_, i) => ({ p: 64250 - (i + 1) * 5, s: +(0.3 + r() * 2).toFixed(2) }));
  const wallSide = r() > 0.5 ? "ask" : "bid";
  const wallIdx = Math.floor(r() * 7);
  (wallSide === "ask" ? asks : bids)[wallIdx].s = +(7 + r() * 4).toFixed(2);
  const sum = (a: { s: number }[]) => a.reduce((x, q) => x + q.s, 0);
  return { asks, bids, wallSide, wallIdx, bidSum: sum(bids), askSum: sum(asks) };
}
function OrderBookRead() {
  const game = useGame();
  const [round, setRound] = useState(0);
  const [book, setBook] = useState(() => mkBook(1));
  const [res, setRes] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [t, setT] = useState(1);
  const tRef = useRef(1);
  const lock = useRef(false);
  const TOTAL = 5;
  const done = round >= TOTAL;
  const wallQ = round % 2 === 0;
  const finish = (ok: boolean, x?: number, y?: number) => {
    if (lock.current) return;
    lock.current = true; setRes(ok);
    if (ok) { setScore((s) => s + 1); game.complete({ skill: "patterns", xp: 6 + Math.round(tRef.current * 4), x, y }); feel("success", 8); } else { game.complete({ skill: "patterns", ok: false }); feel("error", 20); }
  };
  useRaf((dt) => { tRef.current = Math.max(0, tRef.current - dt / 6000); setT(tRef.current); if (tRef.current === 0) finish(false); }, res === null && !done);
  const next = () => { setRound(round + 1); setBook(mkBook(round + 2)); setRes(null); tRef.current = 1; setT(1); lock.current = false; sfx.play("whoosh"); };
  const maxS = Math.max(...book.asks.map((a) => a.s), ...book.bids.map((a) => a.s));
  const Row = (side: "ask" | "bid", r: { p: number; s: number }, idx: number) => {
    const isWall = book.wallSide === side && book.wallIdx === idx;
    return (
      <button key={`${side}${idx}`} disabled={!wallQ || res !== null} onClick={(e) => wallQ && finish(isWall, e.clientX, e.clientY)} className={cn("relative flex w-full justify-between rounded-md px-2 py-[3px] font-mono text-[11px] font-bold transition-all", wallQ && res === null && "hover:bg-white/5 active:scale-[.98]", res !== null && isWall && "ring-2 ring-bull")}>
        <div className={cn("absolute inset-y-0 right-0 rounded transition-all duration-500", side === "ask" ? "bg-bear/15" : "bg-bull/15")} style={{ width: `${(r.s / maxS) * 100}%` }} />
        <span className={cn("relative", side === "ask" ? "text-bear" : "text-bull")}>{r.p.toLocaleString()}</span><span className="relative text-ink-200">{r.s.toFixed(2)}</span>
      </button>
    );
  };
  return (
    <AssetCard id="GPP-07" title="Read the Order Book" desc="Тренажёр чтения стакана: «найди стену» — тап по крупнейшей заявке; «чья сторона сильнее» — сравни суммарную ликвидность. 6 секунд на ответ." tags={["gameplay", "practice", "orderbook", "liquidity", "timer"]}>
      {done ? <Summary correct={score} total={TOTAL} xp={score * 8} onRestart={() => { setRound(0); setBook(mkBook(1)); setRes(null); setScore(0); tRef.current = 1; lock.current = false; }} /> : (
        <div>
          <ExHeader step={round} total={TOTAL} label={wallQ ? "Тапни стену (крупнейшую заявку)" : "Какая сторона сильнее?"} />
          <TimerBar t={t} />
          <div className="mt-3 rounded-2xl bg-ink-950/60 p-2">
            {[...book.asks].reverse().map((r, k) => Row("ask", r, 6 - k))}
            <div className="my-1 flex items-center justify-between rounded-lg bg-ink-800 px-2 py-1 font-mono text-xs font-extrabold text-white"><span>64,250.0</span><span className="text-[10px] text-ink-400">spread 10</span></div>
            {book.bids.map((r, k) => Row("bid", r, k))}
          </div>
          {!wallQ && res === null && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Btn v="bull" size="sm" onClick={(e) => finish(book.bidSum > book.askSum, e.clientX, e.clientY)}>Bids ({book.bidSum.toFixed(1)})</Btn>
              <Btn v="bear" size="sm" onClick={(e) => finish(book.askSum > book.bidSum, e.clientX, e.clientY)}>Asks ({book.askSum.toFixed(1)})</Btn>
            </div>
          )}
          {res !== null && <Verdict inline ok={res} text={wallQ ? `Стена: ${book.wallSide === "ask" ? "ask" : "bid"} ${(book.wallSide === "ask" ? book.asks : book.bids)[book.wallIdx].p.toLocaleString()} — крупная заявка часто действует как магнит и барьер.` : `${book.bidSum > book.askSum ? "Покупатели" : "Продавцы"} доминируют: ${Math.max(book.bidSum, book.askSum).toFixed(1)} vs ${Math.min(book.bidSum, book.askSum).toFixed(1)} BTC.`} onNext={next} label={round === TOTAL - 1 ? "Finish" : "Next"} />}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPP-08 · Reaction Entry ═════════ */
const KF: [number, number][] = [[0, 52], [0.2, 40], [0.35, 30], [0.5, 22], [0.62, 30], [0.8, 48], [1, 60]];
const rsiAt = (t: number) => { for (let i = 1; i < KF.length; i++) if (t <= KF[i][0]) { const [t0, v0] = KF[i - 1], [t1, v1] = KF[i]; return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0); } return 60; };
const CROSS = 0.62, DUR = 3200;
function ReactionEntry() {
  const game = useGame();
  const [phase, setPhase] = useState<"ready" | "run" | "result">("ready");
  const [t, setT] = useState(0);
  const tRef = useRef(0);
  const [tries, setTries] = useState<number[]>([]);
  const [last, setLast] = useState<{ ms: number; grade: string; ok: boolean } | null>(null);
  useRaf((dt) => { tRef.current = Math.min(1, tRef.current + dt / DUR); setT(tRef.current); if (tRef.current >= 1) { setPhase("result"); setLast({ ms: 9999, grade: "Пропустил вход", ok: false }); feel("error"); } }, phase === "run");
  const start = () => { tRef.current = 0; setT(0); setLast(null); setPhase("run"); feel("whoosh"); };
  const tap = (x: number, y: number) => {
    if (phase !== "run") return;
    const ms = Math.round((tRef.current - CROSS) * DUR);
    const grade = ms < 0 ? "Рано — RSI ещё ниже 30" : ms <= 250 ? "PERFECT" : ms <= 600 ? "Good" : "Поздно — импульс ушёл";
    const ok = ms >= 0 && ms <= 600;
    setLast({ ms, grade, ok }); setTries((q) => [...q, ms]); setPhase("result");
    if (ok) { game.complete({ skill: "psychology", xp: ms <= 250 ? 16 : 8, x, y }); feel("success", 15); } else { game.complete({ skill: "psychology", ok: false }); feel("error"); }
  };
  const W = 300, H = 120;
  const pts = Array.from({ length: 121 }, (_, k) => k / 120).filter((k) => k <= t).map((k) => `${k * W},${H - (rsiAt(k) / 100) * H}`);
  const best = tries.filter((m) => m >= 0).sort((a, b) => a - b)[0];
  return (
    <AssetCard id="GPP-08" title="Reaction Entry · RSI Cross" desc="Тренажёр тайминга: RSI рисуется в реальном времени, жми BUY ровно когда он пересекает 30 снизу вверх. Замер реакции в мс, окно «идеально» 250 мс." tags={["gameplay", "practice", "reaction", "timing", "rsi"]}>
      <svg viewBox={`0 0 ${W} ${H}`} className="well w-full rounded-2xl">
        <rect x="0" y={H - 0.3 * H} width={W} height={0.3 * H} fill="#2ee59d" opacity=".08" />
        <rect x="0" y="0" width={W} height={0.3 * H} fill="#ff4d6a" opacity=".08" />
        <line x1="0" x2={W} y1={H - 0.3 * H} y2={H - 0.3 * H} stroke="#2ee59d" strokeDasharray="4 4" /><text x="4" y={H - 0.3 * H - 3} fontSize="8" fontWeight="800" fill="#2ee59d">30 · oversold</text>
        <line x1="0" x2={W} y1={0.3 * H} y2={0.3 * H} stroke="#ff4d6a" strokeDasharray="4 4" /><text x="4" y={0.3 * H - 3} fontSize="8" fontWeight="800" fill="#ff4d6a">70</text>
        {phase === "result" && <line x1={CROSS * W} x2={CROSS * W} y1="0" y2={H} stroke="#ffc53d" strokeWidth="1.5" strokeDasharray="3 3" />}
        {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke="#a174ff" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px #a174ff)" }} />}
        {phase !== "ready" && <circle cx={t * W} cy={H - (rsiAt(t) / 100) * H} r="5" fill="#fff" />}
        {last && phase === "result" && last.ms < 9999 && <circle cx={clamp(CROSS + last.ms / DUR, 0, 1) * W} cy={H - (rsiAt(clamp(CROSS + last.ms / DUR, 0, 1)) / 100) * H} r="8" fill="none" stroke={last.ok ? "#2ee59d" : "#ff4d6a"} strokeWidth="3" />}
      </svg>
      <div className="mt-3 flex items-center gap-3">
        {phase === "ready" && <Btn v="sky" size="lg" block onClick={start}><Icon name="play" size={18} variant="solid" />Start</Btn>}
        {phase === "run" && <Btn v="bull" size="lg" block onClick={(e) => tap(e.clientX, e.clientY)}><Icon name="trendUp" size={20} stroke={3} />BUY NOW</Btn>}
        {phase === "result" && last && (
          <div className="anim-pop flex w-full items-center justify-between">
            <div><div className={cn("text-lg font-extrabold", last.ok ? "text-bull" : "text-bear")}>{last.grade}</div><div className="font-mono text-xs text-ink-300">{last.ms === 9999 ? "—" : `${last.ms > 0 ? "+" : ""}${last.ms} ms`}{best !== undefined && ` · best ${best} ms`}</div></div>
            <Btn v="sky" size="sm" onClick={start}>Again</Btn>
          </div>
        )}
      </div>
    </AssetCard>
  );
}

/* ═════════ GPP-09 · Scenario Simulator ═════════ */
const SCN = [
  { s: "Ты в лонге BTC, +4%. Выходит новость: ETF одобрен, цена +9% за минуту.", ch: [{ t: "Фиксирую половину", e: 7, g: true, k: "Забрал прибыль, оставил ход. Профессионально." }, { t: "Держу всё, будет +50%", e: 1, g: false, k: "«Покупай слухи, продавай новости» — откат съел рост." }, { t: "Докупаю на всё", e: -8, g: false, k: "Купил вершину эмоций." }] },
  { s: "Портфель −12% за неделю. Друзья говорят: «всё, крипта умерла».", ch: [{ t: "Продаю всё", e: -4, g: false, k: "Продал на дне. Рынок отскочил через 3 дня." }, { t: "Держу по плану", e: 5, g: true, k: "Просадки — норма. План важнее эмоций." }, { t: "Шорчу с плечом", e: -10, g: false, k: "Шорт на панике — самое опасное." }] },
  { s: "Мемкоин в портфеле сделал ×3 за день. Все кричат «×100 скоро».", ch: [{ t: "Забираю тело, катаю прибыль", e: 9, g: true, k: "Риск ноль, апсайд остался." }, { t: "Держу всё", e: -6, g: false, k: "−70% через два дня. Классика." }, { t: "Докупаю", e: -12, g: false, k: "Пирамидинг в пампе." }] },
  { s: "Твой стоп сработал, и цена тут же развернулась вверх без тебя.", ch: [{ t: "Перезахожу по системе", e: 4, g: true, k: "Сигнал есть — вход есть. Без обид на рынок." }, { t: "Захожу с 3× «отыграться»", e: -14, g: false, k: "Revenge trading — путь к ликвидации." }, { t: "Пауза до завтра", e: 0, g: true, k: "Тоже дисциплина: пауза лучше мести." }] },
];
function ScenarioSim() {
  const game = useGame();
  const [step, setStep] = useState(0);
  const [eq, setEq] = useState<number[]>([100]);
  const [good, setGood] = useState(0);
  const [lastK, setLastK] = useState<{ k: string; g: boolean } | null>(null);
  const done = step >= SCN.length;
  const pick = (c: (typeof SCN)[number]["ch"][number], x: number, y: number) => {
    const ne = [...eq, clamp(eq[eq.length - 1] + c.e, 40, 160)];
    setEq(ne); setLastK({ k: c.k, g: c.g });
    if (c.g) { setGood((g) => g + 1); feel("success", 10); } else feel("error", 20);
    game.complete({ skill: "psychology", xp: c.g ? 8 : undefined, ok: c.g, x, y });
  };
  const next = () => { setStep(step + 1); setLastK(null); sfx.play("whoosh"); };
  const W = 300, H = 80;
  const mx = Math.max(...eq, 110), mn = Math.min(...eq, 90);
  const path = eq.map((v, i) => `${i ? "L" : "M"}${(i / SCN.length) * W} ${H - 6 - ((v - mn) / (mx - mn)) * (H - 12)}`).join(" ");
  const final = eq[eq.length - 1];
  const eqV = useCountUp(final * 100, 600);
  return (
    <AssetCard id="GPP-09" title="Scenario Simulator" desc="4 стрессовых ситуации с рынка. Каждый выбор двигает кривую капитала и получает разбор. Психология риска на практике." tags={["gameplay", "practice", "scenario", "psychology", "branching"]}>
      <div className="mb-2 flex items-end justify-between"><div><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Equity</div><div className={cn("font-mono text-2xl font-extrabold", final >= 100 ? "text-bull" : "text-bear")}>${Math.round(eqV).toLocaleString()}</div></div><span className="font-mono text-xs font-bold text-ink-400">step {Math.min(step + 1, SCN.length)}/{SCN.length}</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} className="well w-full rounded-2xl">
        <line x1="0" x2={W} y1={H - 6 - ((100 - mn) / (mx - mn)) * (H - 12)} y2={H - 6 - ((100 - mn) / (mx - mn)) * (H - 12)} stroke="#ffffff22" strokeDasharray="4 4" />
        <path d={path} fill="none" stroke={final >= 100 ? "#2ee59d" : "#ff4d6a"} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" style={{ transition: "d .5s", filter: "drop-shadow(0 0 6px currentColor)" }} />
        {eq.map((v, i) => <circle key={i} cx={(i / SCN.length) * W} cy={H - 6 - ((v - mn) / (mx - mn)) * (H - 12)} r="4" fill="#fff" className="anim-pop" />)}
      </svg>
      {done ? (
        <Summary correct={good} total={SCN.length} xp={good * 8} title={final >= 110 ? "Хладнокровный трейдер" : final >= 95 ? "Выжил" : "Эмоции победили"} onRestart={() => { setStep(0); setEq([100]); setGood(0); setLastK(null); }} />
      ) : (
        <div key={step} className="anim-fade-up mt-3">
          <div className="raised mb-3 flex items-start gap-2 rounded-2xl p-3"><Mascot mood="think" size={40} /><div className="text-sm font-extrabold text-white">{SCN[step].s}</div></div>
          {!lastK ? (
            <div className="space-y-2">{SCN[step].ch.map((c, k) => <button key={c.t} onClick={(e) => pick(c, e.clientX, e.clientY)} className="anim-rise w-full rounded-xl bg-ink-800 px-3 py-2.5 text-left text-xs font-extrabold text-ink-100 shadow-[0_3px_0_#081130] transition-all hover:translate-x-1 active:translate-y-0.5" style={{ animationDelay: `${k * 80}ms` }}>› {c.t}</button>)}</div>
          ) : <Verdict inline ok={lastK.g} text={lastK.k} onNext={next} label={step === SCN.length - 1 ? "See results" : "Next situation"} />}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPP-10 · Trade Journal ═════════ */
type Entry = { emo: string; setup: string; plan: boolean; r: number };
const EMO = ["Calm", "FOMO", "Revenge", "Confident", "Bored"];
const SETUPS = ["Breakout", "Pullback", "Reversal"];
function TradeJournal() {
  const game = useGame();
  const [entries, setEntries] = useState<Entry[]>([{ emo: "Calm", setup: "Pullback", plan: true, r: 2.1 }, { emo: "FOMO", setup: "Breakout", plan: false, r: -1 }, { emo: "Calm", setup: "Breakout", plan: true, r: 1.4 }, { emo: "Revenge", setup: "Reversal", plan: false, r: -2 }]);
  const [emo, setEmo] = useState("Calm");
  const [setup, setSetup] = useState("Pullback");
  const [plan, setPlan] = useState(true);
  const [r, setR] = useState(1);
  const [flash, setFlash] = useState(0);
  const submit = (x: number, y: number) => {
    setEntries((e) => [...e.slice(-7), { emo, setup, plan, r }]);
    setFlash((f) => f + 1); feel("success", 10);
    game.complete({ skill: "psychology", xp: 10, x, y });
  };
  const avg = (f: (e: Entry) => boolean) => { const s = entries.filter(f); return s.length ? s.reduce((a, e) => a + e.r, 0) / s.length : 0; };
  const calmR = avg((e) => e.emo === "Calm" || e.emo === "Confident"), hotR = avg((e) => e.emo === "FOMO" || e.emo === "Revenge");
  const planPct = Math.round((entries.filter((e) => e.plan).length / entries.length) * 100);
  const c1 = useCountUp(calmR * 10, 600), c2 = useCountUp(hotR * 10, 600), c3 = useCountUp(planPct, 600);
  return (
    <AssetCard id="GPP-10" title="Trade Journal · Insights" desc="Структурированный дневник: эмоция, сетап, следование плану, результат в R. После записи инсайты пересчитываются — видно, как эмоции влияют на результат." tags={["gameplay", "practice", "journal", "reflection", "psychology"]}>
      <Label>Emotion</Label>
      <div className="mb-3 flex flex-wrap gap-1.5">{EMO.map((e) => <button key={e} onClick={() => { setEmo(e); sfx.play("tap"); }} className={cn("rounded-full px-3 py-1 text-[11px] font-extrabold transition-all", emo === e ? "bg-sky text-white shadow-[0_3px_0_#1e56c9]" : "bg-ink-800 text-ink-300")}>{e}</button>)}</div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Setup</Label><div className="well flex rounded-xl p-1">{SETUPS.map((s) => <button key={s} onClick={() => setSetup(s)} className={cn("flex-1 rounded-lg py-1 text-[10px] font-extrabold", setup === s ? "raised text-white" : "text-ink-400")}>{s}</button>)}</div></div>
        <div><Label>Followed plan</Label><button onClick={() => { setPlan(!plan); feel("tap"); }} className="flex w-full items-center justify-between rounded-xl bg-ink-800 px-3 py-1.5"><span className="text-xs font-extrabold text-white">{plan ? "Yes" : "No"}</span><span className={cn("relative h-6 w-11 rounded-full transition-colors", plan ? "bg-bull" : "well")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-all", plan ? "left-6" : "left-1")} /></span></button></div>
      </div>
      <Label className="mt-3">Result · {r > 0 ? "+" : ""}{r.toFixed(1)}R</Label>
      <div className="relative h-8"><div className="well absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full" /><div className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full" style={{ left: r >= 0 ? "50%" : `${50 + (r / 3) * 50}%`, width: `${(Math.abs(r) / 3) * 50}%`, background: r >= 0 ? "#2ee59d" : "#ff4d6a" }} /><input type="range" min={-3} max={3} step={0.1} value={r} onChange={(e) => setR(+e.target.value)} className="range-reset absolute inset-0" aria-label="R multiple" /><div className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-[0_3px_0_#8fa0cf]" style={{ left: `${50 + (r / 3) * 50}%`, background: r >= 0 ? "#2ee59d" : "#ff4d6a" }} /></div>
      <Btn v="sky" size="sm" block className="mt-2" onClick={(e) => submit(e.clientX, e.clientY)}><Icon name="book" size={14} />Log trade</Btn>
      <div key={flash} className="anim-fade-up mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Calm avg</div><div className="font-mono text-sm font-extrabold text-bull">{(c1 / 10).toFixed(1)}R</div></div>
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">FOMO/Revenge</div><div className="font-mono text-sm font-extrabold text-bear">{(c2 / 10).toFixed(1)}R</div></div>
        <div className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">Plan</div><div className="font-mono text-sm font-extrabold text-gold">{Math.round(c3)}%</div></div>
      </div>
      <div className="mt-3 flex h-14 items-end gap-1">
        {entries.map((e, k) => <div key={k} className="flex flex-1 flex-col items-center justify-end" title={`${e.emo} · ${e.setup}`}><div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${(Math.abs(e.r) / 3) * 100}%`, background: e.r >= 0 ? "#2ee59d" : "#ff4d6a", opacity: k === entries.length - 1 ? 1 : 0.6 }} /><span className="mt-0.5 text-[8px] font-bold text-ink-500">{e.emo.slice(0, 4)}</span></div>)}
      </div>
    </AssetCard>
  );
}

export default function Gameplay2() {
  return (
    <Section id="practice" num="G2" title="Gameplay · Practice" subtitle="10 тренажёров: бар-реплей симулятор, SL/TP на графике, уровни, оценка чисел, ребаланс, стоп-хант, стакан, тайминг входа, сценарии, дневник">
      <BarReplay />
      <DragSLTP />
      <SRTap />
      <EstimateSlider />
      <Rebalance />
      <StopHunt />
      <OrderBookRead />
      <ReactionEntry />
      <ScenarioSim />
      <TradeJournal />
    </Section>
  );
}
