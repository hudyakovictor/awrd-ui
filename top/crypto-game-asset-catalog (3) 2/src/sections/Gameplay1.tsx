import { useEffect, useMemo, useRef, useState } from "react";
import { AssetCard, Btn, Burst, Icon, Label, ProgressBar, Section, useBump, useCountUp, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useRaf } from "../ui/hooks";
import { CandleChart } from "../ui/Chart";
import { ExHeader, Summary, TimerBar, Verdict } from "../ui/exercise";
import { genCandles, inject, type PatternKind } from "../game/market";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ GPL-01 · Candle Builder ═════════ */

const TARGETS = [
  { n: "Hammer", d: "Маленькое тело сверху, длинная нижняя тень", body: [0, 0.3], up: [0, 0.12], low: [0.55, 1], bull: false },
  { n: "Doji", d: "Открытие ≈ закрытие, тени с обеих сторон", body: [0, 0.08], up: [0.3, 0.7], low: [0.3, 0.7], bull: false },
  { n: "Shooting Star", d: "Маленькое тело снизу, длинная верхняя тень", body: [0, 0.3], up: [0.55, 1], low: [0, 0.12], bull: false },
  { n: "Bullish Marubozu", d: "Большое зелёное тело почти без теней", body: [0.85, 1], up: [0, 0.08], low: [0, 0.08], bull: true },
];
const fitR = (v: number, r: number[]) => (v >= r[0] && v <= r[1] ? 1 : Math.max(0, 1 - Math.min(Math.abs(v - r[0]), Math.abs(v - r[1])) * 2.5));
const INIT = { h: 30, o: 90, c: 120, l: 190 };

function CandleBuilder() {
  const game = useGame();
  const H = 220;
  const [ti, setTi] = useState(0);
  const [p, setP] = useState(INIT);
  const [res, setRes] = useState<null | boolean>(null);
  const [b, bump] = useBump();
  const start = useRef(0);
  const t = TARGETS[ti];
  const top = Math.min(p.o, p.c), bot = Math.max(p.o, p.c), range = Math.max(1, p.l - p.h);
  const body = (bot - top) / range, up = (top - p.h) / range, low = (p.l - bot) / range;
  const bull = p.c < p.o;
  let score = (fitR(body, t.body) + fitR(up, t.up) + fitR(low, t.low)) / 3;
  if (t.bull && !bull) score *= 0.4;
  const pct = Math.round(score * 100);
  const mk = (k: "h" | "o" | "c" | "l") => ({
    onStart: () => { start.current = p[k]; setRes(null); feel("tap", 4); },
    onMove: (d: { dy: number }) => setP((q) => {
      let v = clamp(start.current + d.dy, 0, H);
      if (k === "h") v = Math.min(v, Math.min(q.o, q.c) - 2);
      else if (k === "l") v = Math.max(v, Math.max(q.o, q.c) + 2);
      else v = clamp(v, q.h + 2, q.l - 2);
      return { ...q, [k]: v };
    }),
  });
  const dH = useDrag(mk("h")), dO = useDrag(mk("o")), dC = useDrag(mk("c")), dL = useDrag(mk("l"));
  const handles = [["h", dH, "H"], ["o", dO, "O"], ["c", dC, "C"], ["l", dL, "L"]] as const;
  const check = (x: number, y: number) => {
    const ok = pct >= 80;
    setRes(ok);
    if (ok) { bump(); game.complete({ skill: "candles", xp: 15, x, y }); feel("success", 15); } else { game.complete({ skill: "candles", ok: false }); feel("error", 20); }
  };
  const col = bull ? "#2ee59d" : "#ff4d6a";
  const pcol = pct >= 80 ? "#2ee59d" : pct >= 50 ? "#ffc53d" : "#ff4d6a";
  return (
    <AssetCard id="GPL-01" title="Candle Builder" desc="Собери свечу руками: тяни ручки High / Open / Close / Low, чтобы получить заданный паттерн. Живой процент совпадения объясняет анатомию свечи." tags={["gameplay", "learn", "candles", "drag"]}>
      <div className="flex gap-4">
        <div className="relative h-[244px] w-36 shrink-0 rounded-2xl bg-ink-950/60 p-3">
          <div className="relative h-full">
            <div className="absolute left-1/2 w-1 -translate-x-1/2 rounded-full transition-colors" style={{ top: p.h, height: p.l - p.h, background: col }} />
            <div className="absolute left-1/2 w-12 -translate-x-1/2 rounded-md transition-colors" style={{ top, height: Math.max(2, bot - top), background: col, boxShadow: `0 0 16px ${col}66` }} />
            {handles.map(([k, fn, lab]) => (
              <div key={k} onPointerDown={fn} className="absolute left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-ns-resize touch-none items-center gap-1" style={{ top: p[k] }}>
                <span className="h-5 w-16 rounded-full border-2 border-white/70 bg-ink-800/70 transition-transform hover:scale-105" />
                <span className="rounded bg-white px-1 font-mono text-[9px] font-extrabold text-ink-900">{lab}</span>
              </div>
            ))}
          </div>
          <Burst trigger={b} />
        </div>
        <div className="min-w-0 flex-1">
          <Label>Target · {ti + 1}/{TARGETS.length}</Label>
          <div className="text-lg font-extrabold text-white">{t.n}</div>
          <div className="text-xs text-ink-300">{t.d}</div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-extrabold uppercase text-ink-400"><span>Match</span><span style={{ color: pcol }}>{pct}%</span></div>
            <ProgressBar value={pct} color={pct >= 80 ? "bull" : pct >= 50 ? "gold" : "bear"} h={12} className="mt-1" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1 text-center font-mono text-[10px] font-bold text-ink-300">
            {[["Body", body], ["Up wick", up], ["Low wick", low]].map(([l, v]) => <div key={l as string} className="rounded-lg bg-ink-900/60 p-1.5">{l}<br /><span className="text-white">{Math.round((v as number) * 100)}%</span></div>)}
          </div>
          <div className="mt-3 flex gap-2">
            <Btn v="bull" size="sm" block onClick={(e) => check(e.clientX, e.clientY)} disabled={res === true}>Check</Btn>
            <Btn v="ghost" size="sm" onClick={() => { setTi((ti + 1) % TARGETS.length); setRes(null); setP(INIT); feel("whoosh"); }}>Next</Btn>
          </div>
          {res !== null && <div className={cn("anim-fade-up mt-2 text-xs font-bold", res ? "text-bull" : "text-bear")}>{res ? "Идеальная свеча! +15 XP" : "Нужно ≥ 80%. Смотри на соотношение тела и теней."}</div>}
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ GPL-02 · Tap the Pattern ═════════ */
const PR: { kind: PatternKind; n: string; seed: number; at: number; tip: string }[] = [
  { kind: "engulfBull", n: "Bullish Engulfing", seed: 7, at: 22, tip: "Зелёная свеча перекрыла тело предыдущей красной — покупатели перехватили контроль." },
  { kind: "hammer", n: "Hammer", seed: 11, at: 15, tip: "Длинная нижняя тень: продавцы толкнули вниз, но покупатели вернули цену." },
  { kind: "star", n: "Shooting Star", seed: 5, at: 27, tip: "Длинная верхняя тень: рост отбит, давление продавцов." },
  { kind: "doji", n: "Doji", seed: 3, at: 18, tip: "Открытие ≈ закрытие — нерешительность перед разворотом." },
];
function TapPattern() {
  const game = useGame();
  const [r, setR] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const cur = PR[r];
  const data = useMemo(() => inject(genCandles(cur.seed, 34, 100, 1.1), cur.at, cur.kind), [cur]);
  const tol = cur.kind.startsWith("engulf") ? 1 : 0;
  const ok = pick !== null && Math.abs(pick - cur.at) <= tol;
  const tap = (i: number, e: { clientX: number; clientY: number }) => {
    if (pick !== null) return;
    setPick(i);
    if (Math.abs(i - cur.at) <= tol) { setScore((s) => s + 1); game.complete({ skill: "patterns", xp: 10, x: e.clientX, y: e.clientY }); feel("success", 12); }
    else { game.complete({ skill: "patterns", ok: false }); feel("error", 20); }
  };
  const next = () => { if (r === PR.length - 1) { setDone(true); return; } setR(r + 1); setPick(null); sfx.play("whoosh"); };
  return (
    <AssetCard id="GPL-02" title="Tap the Pattern" desc="Найди паттерн на живом графике: тапни нужную свечу. Правильная зона подсвечивается, остальное гаснет — учимся видеть." tags={["gameplay", "learn", "patterns", "tap"]}>
      {done ? <Summary correct={score} total={PR.length} xp={score * 10} onRestart={() => { setR(0); setPick(null); setScore(0); setDone(false); }} /> : (
        <div>
          <ExHeader step={r} total={PR.length} />
          <div className="mb-2 flex items-center gap-2"><Mascot mood="think" size={40} /><div className="text-sm font-extrabold text-white">Тапни свечу: <span className="text-sky">{cur.n}</span></div></div>
          <CandleChart key={r} data={data} h={170} onTap={tap} active={pick} dim={pick !== null ? (i) => Math.abs(i - cur.at) > 1 && i !== pick : undefined} className="well w-full cursor-crosshair touch-none rounded-2xl">
            {(s) => pick !== null ? <>
              <rect x={s.x(cur.at) - s.cw * (tol + 0.5)} y={2} width={s.cw * (tol * 2 + 1)} height={s.h - 4} rx="6" fill="none" stroke="#2ee59d" strokeWidth="2" strokeDasharray="4 3" style={{ animation: "fadeIn .4s both" }} />
              {!ok && <circle cx={s.x(pick)} cy={8} r="4" fill="#ff4d6a" />}
            </> : null}
          </CandleChart>
          {pick !== null && <Verdict inline ok={ok} text={cur.tip} onNext={next} label={r === PR.length - 1 ? "Finish" : "Next pattern"} />}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPL-03 · Sort into Buckets ═════════ */
const SORT_ITEMS = [
  { t: "Higher lows", a: "bull" }, { t: "Death cross", a: "bear" }, { t: "RSI 24", a: "bull" }, { t: "Golden cross", a: "bull" }, { t: "Lower highs", a: "bear" },
  { t: "Flat volume", a: "neutral" }, { t: "Bearish divergence", a: "bear" }, { t: "Hammer at support", a: "bull" }, { t: "Sideways range", a: "neutral" },
];
const BUCKETS = [{ id: "bull", t: "Bullish", c: "#2ee59d", i: "trendUp" }, { id: "neutral", t: "Neutral", c: "#ffc53d", i: "minus" }, { id: "bear", t: "Bearish", c: "#ff4d6a", i: "trendDown" }];
function SortBuckets() {
  const game = useGame();
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [b, bump] = useBump();
  const bucketAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest("[data-bucket]") as HTMLElement | null)?.dataset.bucket ?? null;
  const tryPlace = (i: number, bucket: string, x: number, y: number) => {
    if (SORT_ITEMS[i].a === bucket) {
      const np = { ...placed, [i]: bucket };
      setPlaced(np); setSel(null); feel("pop", 8);
      if (Object.keys(np).length === SORT_ITEMS.length) { setDone(true); bump(); game.complete({ skill: "patterns", xp: 20, x, y }); feel("success", [20, 30, 60]); }
    } else { setWrong(i); setSel(null); feel("error", 25); game.addCombo(false); window.setTimeout(() => setWrong(null), 500); }
  };
  const onDown = useDrag({
    onStart: (x, y, e) => { const i = Number((e.currentTarget as HTMLElement).dataset.i); setDrag({ i, x, y }); feel("tap", 5); },
    onMove: (d) => { setDrag((q) => (q ? { ...q, x: d.x, y: d.y } : q)); setOver(bucketAt(d.x, d.y)); },
    onEnd: (d) => {
      const q = drag; setDrag(null); setOver(null);
      if (!q) return;
      const bk = bucketAt(d.x, d.y);
      if (bk) tryPlace(q.i, bk, d.x, d.y);
      else if (Math.abs(d.dx) < 6 && Math.abs(d.dy) < 6) setSel(sel === q.i ? null : q.i);
    },
  });
  const left = SORT_ITEMS.map((_, i) => i).filter((i) => placed[i] === undefined);
  return (
    <AssetCard id="GPL-03" title="Sort into Buckets" desc="Перетащи сигналы в корзины Bullish / Neutral / Bearish (или тап → тап). Корзина подсвечивается при наведении, ошибка трясёт чип." tags={["gameplay", "learn", "drag-drop", "sort"]}>
      <div className="grid grid-cols-3 gap-2">
        {BUCKETS.map((bk) => (
          <div key={bk.id} data-bucket={bk.id} onClick={(e) => { if (sel !== null) tryPlace(sel, bk.id, e.clientX, e.clientY); }}
            className={cn("min-h-[120px] rounded-2xl border-2 border-dashed p-2 transition-all", over === bk.id || (sel !== null) ? "scale-[1.03]" : "")}
            style={{ borderColor: over === bk.id ? bk.c : `${bk.c}55`, background: over === bk.id ? `${bk.c}22` : `${bk.c}0a` }}>
            <div className="mb-1.5 flex items-center justify-center gap-1 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: bk.c }}><Icon name={bk.i} size={12} stroke={3} />{bk.t}</div>
            <div className="flex flex-wrap gap-1">
              {SORT_ITEMS.map((it, i) => placed[i] === bk.id && <span key={i} className="anim-pop rounded-md px-1.5 py-0.5 text-[9px] font-extrabold text-ink-900" style={{ background: bk.c }}>{it.t}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex min-h-[92px] flex-wrap content-start gap-2">
        {done ? (
          <div className="anim-pop flex w-full items-center justify-center gap-3 py-3"><Mascot mood="happy" size={52} /><div><div className="text-base font-extrabold text-bull">Все разложено! +20 XP</div><Btn v="ghost" size="sm" className="mt-1" onClick={() => { setPlaced({}); setDone(false); }}>Reset</Btn></div></div>
        ) : left.map((i) => (
          <button key={i} data-i={i} onPointerDown={onDown}
            className={cn("raised cursor-grab touch-none select-none rounded-xl px-3 py-2 text-xs font-extrabold text-white transition-all active:cursor-grabbing", sel === i && "ring-2 ring-sky -translate-y-0.5", wrong === i && "anim-shake ring-2 ring-bear", drag?.i === i && "opacity-30")}>
            {SORT_ITEMS[i].t}
          </button>
        ))}
      </div>
      {sel !== null && !done && <div className="text-center text-[11px] font-bold text-sky">Теперь тапни корзину</div>}
      {drag && <div className="pointer-events-none fixed z-[70] rounded-xl bg-ink-500 px-3 py-2 text-xs font-extrabold text-white shadow-[0_10px_30px_#000a]" style={{ left: drag.x, top: drag.y, transform: "translate(-50%,-50%) rotate(-4deg) scale(1.08)" }}>{SORT_ITEMS[drag.i].t}</div>}
      <Burst trigger={b} />
    </AssetCard>
  );
}

/* ═════════ GPL-04 · Sequence Builder ═════════ */
const SEQS = [
  { n: "Morning Star", tip: "Красная → маленькая нерешительность → зелёная = разворот вверх.", c: [{ o: 100, c: 92, h: 101, l: 91 }, { o: 91.5, c: 91, h: 92.5, l: 89.8 }, { o: 92, c: 99.5, h: 100.2, l: 91.5 }] },
  { n: "Three White Soldiers", tip: "Три растущие зелёные свечи с закрытием у максимумов.", c: [{ o: 90, c: 94, h: 94.5, l: 89.5 }, { o: 93.5, c: 97.5, h: 98, l: 93 }, { o: 97, c: 101, h: 101.5, l: 96.5 }] },
  { n: "Evening Star", tip: "Зелёная → нерешительность → красная = разворот вниз.", c: [{ o: 92, c: 100, h: 101, l: 91.5 }, { o: 100.5, c: 101, h: 102.2, l: 99.8 }, { o: 100, c: 92.5, h: 100.5, l: 91.8 }] },
];
const SHUF = [[2, 0, 1], [1, 2, 0], [2, 1, 0]];
function SequenceBuilder() {
  const game = useGame();
  const [r, setR] = useState(0);
  const [order, setOrder] = useState<number[]>(SHUF[0]);
  const [sel, setSel] = useState<number | null>(null);
  const [res, setRes] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const s = SEQS[r];
  const mx = Math.max(...s.c.map((c) => c.h)), mn = Math.min(...s.c.map((c) => c.l));
  const y = (v: number) => 6 + ((mx - v) / (mx - mn)) * 88;
  const W = 84;
  const tapSlot = (slot: number) => {
    if (res !== null) return;
    if (sel === null) { setSel(slot); sfx.play("tap"); return; }
    if (sel === slot) { setSel(null); return; }
    const o = [...order]; [o[sel], o[slot]] = [o[slot], o[sel]];
    setOrder(o); setSel(null); feel("swipe", 6);
  };
  const check = (x: number, yy: number) => {
    const ok = order.every((t, i) => t === i);
    setRes(ok);
    if (ok) { setScore((v) => v + 1); game.complete({ skill: "candles", xp: 12, x, y: yy }); feel("success"); } else { game.complete({ skill: "candles", ok: false }); feel("error"); }
  };
  const next = () => { if (r === SEQS.length - 1) { setDone(true); return; } setR(r + 1); setOrder(SHUF[r + 1]); setSel(null); setRes(null); sfx.play("whoosh"); };
  return (
    <AssetCard id="GPL-04" title="Sequence Builder" desc="Расставь три свечи в правильном порядке, чтобы получился паттерн. Тап — выбрать, тап — поменять местами; плитки плавно перестраиваются." tags={["gameplay", "learn", "sequence", "swap"]}>
      {done ? <Summary correct={score} total={SEQS.length} xp={score * 12} onRestart={() => { setR(0); setOrder(SHUF[0]); setSel(null); setRes(null); setScore(0); setDone(false); }} /> : (
        <div>
          <ExHeader step={r} total={SEQS.length} label={`Собери: ${s.n}`} />
          <div className="relative mx-auto h-[130px]" style={{ width: W * 3 + 20 }}>
            {s.c.map((c, t) => {
              const slot = order.indexOf(t);
              const up = c.c >= c.o, col = up ? "#2ee59d" : "#ff4d6a";
              const isSel = sel === slot;
              return (
                <button key={t} onClick={() => tapSlot(slot)} className={cn("absolute top-0 h-[130px] rounded-2xl transition-all duration-400 ease-[cubic-bezier(.3,1.3,.5,1)]", res === null ? (isSel ? "raised -translate-y-2 ring-2 ring-sky" : "bg-ink-800 shadow-[0_4px_0_#0b1638]") : res ? "bg-bull/15 ring-2 ring-bull" : "bg-bear/15 ring-2 ring-bear")} style={{ width: W, left: slot * (W + 10) }}>
                  <svg viewBox="0 0 40 100" className="mx-auto h-[100px]"><line x1="20" x2="20" y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="3" /><rect x="10" width="20" y={y(Math.max(c.o, c.c))} height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx="2" fill={col} /></svg>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[10px] font-extrabold text-ink-400">{slot + 1}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-center gap-2 text-[10px] font-bold text-ink-400">{["1st", "2nd", "3rd"].map((l) => <span key={l} className="w-20 text-center">{l}</span>)}</div>
          {res === null ? <Btn v="bull" size="sm" block className="mt-3" onClick={(e) => check(e.clientX, e.clientY)}>Check order</Btn>
            : <Verdict inline ok={res} text={s.tip} onNext={next} label={r === SEQS.length - 1 ? "Finish" : "Next"} />}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPL-05 · Headline Sentiment Swipe ═════════ */
const HEADLINES = [
  { h: "SEC одобрила спотовый ETF на Ethereum", a: "bull", why: "Институциональный спрос → приток капитала." },
  { h: "Крупная биржа приостановила вывод средств", a: "bear", why: "Риск контрагента → паника и отток." },
  { h: "Разработчики перенесли обновление на 2 недели", a: "neutral", why: "Краткосрочный шум, фундаментал не меняется." },
  { h: "Инфляция в США выше прогноза, ФРС ужесточает риторику", a: "bear", why: "Дорогие деньги давят на риск-активы." },
  { h: "MicroStrategy докупила 12,000 BTC", a: "bull", why: "Крупный покупатель сокращает предложение." },
  { h: "Илон сменил аватар на лягушку", a: "neutral", why: "Мемы — не фундаментал. Не торгуй на этом." },
];
function HeadlineSwipe() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [d, setD] = useState({ x: 0, y: 0 });
  const [fly, setFly] = useState<{ x: number; y: number } | null>(null);
  const [res, setRes] = useState<null | { ok: boolean; why: string; a: string }>(null);
  const [score, setScore] = useState(0);
  const [t, setT] = useState(1);
  const tRef = useRef(1);
  const lock = useRef(false);
  const done = i >= HEADLINES.length;
  const answer = (a: string, x?: number, y?: number) => {
    if (lock.current || done) return;
    lock.current = true;
    const h = HEADLINES[i];
    const ok = a === h.a;
    setRes({ ok, why: h.why, a: h.a });
    if (ok) { setScore((s) => s + 1); game.complete({ skill: "psychology", xp: 8 + Math.round(tRef.current * 6), x, y }); feel("success", 10); }
    else { game.complete({ skill: "psychology", ok: false }); feel("error", 20); }
  };
  useRaf((dt) => { tRef.current = Math.max(0, tRef.current - dt / 8000); setT(tRef.current); if (tRef.current === 0) answer("timeout"); }, !res && !done);
  const onDown = useDrag({
    onMove: (m) => { if (!res) setD({ x: m.dx, y: m.dy }); },
    onEnd: (m) => {
      if (res) return;
      const ax = Math.abs(m.dx), ay = Math.abs(m.dy);
      if (ax > 90 || ay > 90 || Math.abs(m.vx) > 12 || m.vy < -12) {
        const dir = ay > ax && m.dy < 0 ? "neutral" : m.dx > 0 ? "bull" : "bear";
        setFly({ x: dir === "neutral" ? 0 : Math.sign(m.dx || 1) * 500, y: dir === "neutral" ? -600 : 0 });
        feel("swipe"); answer(dir, m.x, m.y);
      } else setD({ x: 0, y: 0 });
    },
  });
  const next = () => { setI(i + 1); setD({ x: 0, y: 0 }); setFly(null); setRes(null); tRef.current = 1; setT(1); lock.current = false; };
  const x = fly ? fly.x : d.x, yv = fly ? fly.y : d.y;
  const A: Record<string, string> = { bull: "Bullish", bear: "Bearish", neutral: "Neutral" };
  return (
    <AssetCard id="GPL-05" title="Headline Sentiment Swipe" desc="Новость → оцени эффект: вправо Bullish, влево Bearish, вверх Neutral. Таймер 8 с даёт бонус за скорость, штампы проявляются по силе свайпа." tags={["gameplay", "learn", "swipe", "news", "timer"]}>
      {done ? <Summary correct={score} total={HEADLINES.length} xp={score * 10} onRestart={() => { setI(0); setScore(0); setRes(null); setFly(null); tRef.current = 1; lock.current = false; }} /> : (
        <div>
          <ExHeader step={i} total={HEADLINES.length} />
          <TimerBar t={t} />
          <div className="relative mx-auto mt-3 h-48 w-full max-w-[280px]">
            <div className="absolute inset-0 translate-y-2 scale-95 rounded-3xl bg-ink-700 opacity-60" />
            <div key={i} onPointerDown={onDown} className={cn("absolute inset-0 flex cursor-grab touch-none select-none flex-col justify-between rounded-3xl bg-gradient-to-b from-ink-600 to-ink-700 p-4 shadow-[0_6px_0_#0b1638]", (fly || (d.x === 0 && d.y === 0)) && "transition-transform duration-300")} style={{ transform: `translate(${x}px, ${yv}px) rotate(${x / 14}deg)`, animation: "scaleIn .3s ease both" }}>
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-ink-400"><Icon name="news" size={14} />Breaking · {i + 1}</div>
              <div className="text-lg font-extrabold leading-tight text-white">{HEADLINES[i].h}</div>
              <div className="flex justify-between text-[10px] font-bold text-ink-400"><span className="text-bear">← Bear</span><span className="text-gold">↑ Neutral</span><span className="text-bull">Bull →</span></div>
              <div className="absolute left-4 top-10 rounded-lg border-4 border-bear px-2 text-xl font-extrabold text-bear" style={{ opacity: clamp(-d.x / 80, 0, 1), transform: "rotate(12deg)" }}>BEAR</div>
              <div className="absolute right-4 top-10 rounded-lg border-4 border-bull px-2 text-xl font-extrabold text-bull" style={{ opacity: clamp(d.x / 80, 0, 1), transform: "rotate(-12deg)" }}>BULL</div>
              <div className="absolute left-1/2 top-12 -translate-x-1/2 rounded-lg border-4 border-gold px-2 text-xl font-extrabold text-gold" style={{ opacity: clamp(-d.y / 80, 0, 1) }}>NEUTRAL</div>
            </div>
          </div>
          {!res && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Btn v="bear" size="sm" onClick={(e) => { setFly({ x: -500, y: 0 }); answer("bear", e.clientX, e.clientY); }}>Bear</Btn>
              <Btn v="gold" size="sm" onClick={(e) => { setFly({ x: 0, y: -600 }); answer("neutral", e.clientX, e.clientY); }}>Neutral</Btn>
              <Btn v="bull" size="sm" onClick={(e) => { setFly({ x: 500, y: 0 }); answer("bull", e.clientX, e.clientY); }}>Bull</Btn>
            </div>
          )}
          {res && <Verdict inline ok={res.ok} title={res.ok ? "Верно!" : `Правильно: ${A[res.a]}`} text={res.why} onNext={next} label={i === HEADLINES.length - 1 ? "Finish" : "Next headline"} />}
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GPL-06 · Memory Match ═════════ */
const PAIRS = [["APY", "Годовая доходность"], ["LP", "Пул ликвидности"], ["IL", "Непостоянная потеря"], ["Gas", "Комиссия сети"], ["Bridge", "Мост между сетями"], ["Stake", "Блокировка за награду"]];
const DECK_ORDER = [3, 7, 0, 10, 5, 1, 8, 4, 11, 2, 9, 6];
function MemoryMatch() {
  const game = useGame();
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const [b, bump] = useBump();
  const doneM = matched.length === 12;
  useInterval(() => setSecs((s) => s + 1), doneM || moves === 0 ? null : 1000);
  const flip = (k: number) => {
    if (open.length === 2 || open.includes(k) || matched.includes(k)) return;
    const no = [...open, k];
    setOpen(no); sfx.play("tap");
    if (no.length === 2) {
      setMoves((m) => m + 1);
      const [a, b2] = no.map((x) => DECK_ORDER[x]);
      if (Math.floor(a / 2) === Math.floor(b2 / 2)) {
        window.setTimeout(() => {
          const nm = [...matched, ...no];
          setMatched(nm); setOpen([]); feel("pop", 8);
          if (nm.length === 12) { bump(); game.complete({ skill: "defi", xp: Math.max(10, 32 - moves) }); feel("success", [20, 30, 60]); }
        }, 350);
      } else window.setTimeout(() => { setOpen([]); sfx.play("lock"); }, 800);
    }
  };
  const reset = () => { setOpen([]); setMatched([]); setMoves(0); setSecs(0); };
  return (
    <AssetCard id="GPL-06" title="Memory Match · DeFi Terms" desc="Классическая «память»: 6 пар термин ↔ определение, 3D-переворот карт, счётчик ходов и таймер. Меньше ходов — больше XP." tags={["gameplay", "learn", "memory", "flip", "defi"]}>
      <div className="mb-3 flex items-center justify-between font-mono text-xs font-extrabold">
        <span className="text-ink-300">Moves <span className="text-white">{moves}</span></span>
        <span className="text-ink-300">Pairs <span className="text-violet">{matched.length / 2}/6</span></span>
        <span className="text-ink-300">Time <span className="text-white">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span></span>
      </div>
      <div className="relative grid grid-cols-4 gap-2">
        {DECK_ORDER.map((id, k) => {
          const isOpen = open.includes(k) || matched.includes(k);
          const pair = PAIRS[Math.floor(id / 2)], side = id % 2, isM = matched.includes(k);
          return (
            <button key={k} onClick={() => flip(k)} className="h-[72px]" style={{ perspective: 500 }}>
              <div className="relative h-full w-full preserve-3d transition-transform duration-500" style={{ transform: isOpen ? "rotateY(180deg)" : "none" }}>
                <div className="absolute inset-0 grid place-items-center rounded-xl bg-gradient-to-b from-violet to-violet-edge shadow-[0_3px_0_#4a24a8] backface-hidden"><Icon name="gem" size={22} className="text-white/70" /></div>
                <div className={cn("absolute inset-0 grid place-items-center rounded-xl p-1 text-center backface-hidden", isM ? "bg-bull/20 ring-2 ring-bull" : "raised")} style={{ transform: "rotateY(180deg)" }}>
                  <span className={cn("font-extrabold leading-tight", side === 0 ? "font-mono text-sm text-white" : "text-[10px] text-ink-100")}>{pair[side]}</span>
                </div>
              </div>
            </button>
          );
        })}
        <Burst trigger={b} count={20} spread={110} />
      </div>
      {doneM && <div className="anim-pop mt-3 flex items-center justify-between rounded-2xl bg-bull/10 p-3 ring-1 ring-bull/40"><div><div className="text-sm font-extrabold text-bull">Все пары найдены!</div><div className="text-xs text-ink-300">{moves} ходов · {secs}s · +{Math.max(10, 32 - moves)} XP</div></div><Btn v="ghost" size="sm" onClick={reset}>Again</Btn></div>}
    </AssetCard>
  );
}

/* ═════════ GPL-07 · Draw the Forecast ═════════ */
function DrawForecast() {
  const game = useGame();
  const [seed, setSeed] = useState(21);
  const data = useMemo(() => genCandles(seed, 40, 100, 1.2, 0.05), [seed]);
  const W = 300, H = 170, SPLIT = 24;
  const svg = useRef<SVGSVGElement>(null);
  const [pts, setPts] = useState<[number, number][]>([]);
  const ptsRef = useRef<[number, number][]>([]);
  const [score, setScore] = useState<number | null>(null);
  const mx = Math.max(...data.map((d) => d.h)), mn = Math.min(...data.map((d) => d.l));
  const y = (v: number) => 8 + ((mx - v) / (mx - mn || 1)) * (H - 16);
  const cw = W / 40;
  const x = (i: number) => i * cw + cw / 2;
  const toSvg = (cx: number, cy: number): [number, number] => { const r = svg.current!.getBoundingClientRect(); return [((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H]; };
  const onDown = useDrag({
    onStart: (cx, cy) => { if (score !== null) return false; const p = toSvg(cx, cy); if (p[0] < x(SPLIT - 1) - 10) return false; ptsRef.current = [[x(SPLIT - 1), y(data[SPLIT - 1].c)], [Math.max(p[0], x(SPLIT - 1) + 1), clamp(p[1], 0, H)]]; setPts(ptsRef.current); feel("tap", 4); },
    onMove: (d) => { const p = toSvg(d.x, d.y); const last = ptsRef.current[ptsRef.current.length - 1]; if (p[0] > last[0] + 2 && p[0] <= W) { ptsRef.current = [...ptsRef.current, [p[0], clamp(p[1], 0, H)]]; setPts(ptsRef.current); if (ptsRef.current.length % 4 === 0) sfx.play("tick"); } },
    onEnd: (d) => {
      const u = ptsRef.current;
      if (u.length < 4) { setPts([]); return; }
      let err = 0, n = 0;
      for (let i = SPLIT; i < 40; i++) {
        const xi = x(i);
        const k = u.findIndex((p, idx) => idx > 0 && p[0] >= xi);
        if (k < 1) continue;
        const [x0, y0] = u[k - 1], [x1, y1] = u[k];
        const uy = y0 + ((xi - x0) / Math.max(1, x1 - x0)) * (y1 - y0);
        err += Math.abs(uy - y(data[i].c)) / H; n++;
      }
      const avg = n ? err / n : 1;
      const actualUp = data[39].c > data[SPLIT - 1].c, userUp = u[u.length - 1][1] < y(data[SPLIT - 1].c);
      const sc = Math.round(clamp(100 - avg * 350, 0, 100) * 0.7 + (actualUp === userUp ? 30 : 0));
      setScore(sc);
      if (sc >= 55) { game.complete({ skill: "patterns", xp: Math.round(sc / 5), x: d.x, y: d.y }); feel("success"); } else { game.complete({ skill: "patterns", ok: false }); feel("error"); }
    },
  });
  const actual = data.slice(SPLIT - 1).map((c, k) => `${k ? "L" : "M"}${x(SPLIT - 1 + k)} ${y(c.c)}`).join(" ");
  const reset = () => { setSeed((s) => s + 7); setPts([]); ptsRef.current = []; setScore(null); };
  return (
    <AssetCard id="GPL-07" title="Draw the Forecast" desc="Нарисуй пальцем, куда пойдёт цена. После отпускания реальный путь дорисовывается, а алгоритм считает точность формы и направления." tags={["gameplay", "learn", "draw", "forecast"]}>
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} onPointerDown={onDown} className="well w-full cursor-crosshair touch-none select-none rounded-2xl">
        <rect x={x(SPLIT - 1)} y="0" width={W - x(SPLIT - 1)} height={H} fill="#3d8bff" opacity=".06" />
        {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="#ffffff0c" strokeDasharray="3 5" />)}
        {data.slice(0, SPLIT).map((c, i) => { const up = c.c >= c.o, col = up ? "#2ee59d" : "#ff4d6a"; return <g key={i}><line x1={x(i)} x2={x(i)} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1" /><rect x={x(i) - cw * 0.32} width={cw * 0.64} y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} fill={col} rx="1" /></g>; })}
        {pts.length > 1 && <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#ffc53d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px #ffc53d)" }} />}
        {score !== null && <path d={actual} fill="none" stroke="#5ce1ff" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray="1" style={{ animation: "drawLine2 1.2s ease both", filter: "drop-shadow(0 0 6px #5ce1ff)" }} />}
        {score === null && pts.length === 0 && <text x={x(SPLIT - 1) + 8} y="22" fontSize="10" fontWeight="800" fill="#8fa0cf">✍ рисуй отсюда →</text>}
      </svg>
      <div className="mt-3 flex items-center justify-between">
        {score !== null ? <div className="anim-pop flex items-center gap-3"><div className="font-mono text-3xl font-extrabold" style={{ color: score >= 55 ? "#2ee59d" : "#ff4d6a" }}>{score}</div><div className="text-xs font-bold text-ink-300">{score >= 80 ? "Читаешь рынок!" : score >= 55 ? "Направление верное" : "Рынок пошёл иначе — это нормально"}</div></div> : <span className="text-[11px] font-bold text-ink-400">Жёлтый — твой прогноз, голубой — факт</span>}
        <Btn v="ghost" size="sm" onClick={reset}><Icon name="refresh" size={14} />New chart</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ GPL-08 · Speed Round True/False ═════════ */
const TF: [string, boolean][] = [
  ["Стоп-лосс нужен только новичкам", false], ["RSI выше 70 — зона перекупленности", true], ["Плечо увеличивает и прибыль, и убыток", true], ["Доджи означает сильный тренд", false],
  ["Диверсификация снижает риск портфеля", true], ["Ликвидация возможна и на споте без плеча", false], ["Объём подтверждает пробой уровня", true], ["FOMO — хорошая стратегия входа", false],
  ["Пробитая поддержка часто становится сопротивлением", true], ["Стейблкоины не могут потерять привязку", false],
];
function SpeedRound() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [t, setT] = useState(1);
  const tRef = useRef(1);
  const [state, setState] = useState<"ready" | "run" | "done">("ready");
  const [ans, setAns] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pts, setPts] = useState(0);
  const lock = useRef(false);
  const advance = () => window.setTimeout(() => { setI((v) => v + 1); setAns(null); tRef.current = 1; setT(1); lock.current = false; }, 650);
  const answer = (a: boolean | null, x?: number, y?: number) => {
    if (lock.current || state !== "run") return;
    lock.current = true;
    const ok = a === TF[i][1];
    setAns(ok);
    if (ok) { const ns = streak + 1; setStreak(ns); setScore((s) => s + 1); setPts((p) => p + 10 * Math.min(4, ns) + Math.round(tRef.current * 10)); game.complete({ skill: "risk", xp: 4, x, y }); feel("success", 8); }
    else { setStreak(0); game.complete({ skill: "risk", ok: false }); feel("error", 20); }
    if (i === TF.length - 1) window.setTimeout(() => setState("done"), 650); else advance();
  };
  useRaf((dt) => { tRef.current = Math.max(0, tRef.current - dt / 4000); setT(tRef.current); if (tRef.current === 0) answer(null); }, state === "run" && ans === null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (state !== "run") return; if (e.key === "ArrowLeft") answer(false); if (e.key === "ArrowRight") answer(true); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const start = () => { setI(0); setScore(0); setStreak(0); setPts(0); setAns(null); tRef.current = 1; setT(1); lock.current = false; setState("run"); feel("whoosh"); };
  return (
    <AssetCard id="GPL-08" title="Speed Round · True / False" desc="10 утверждений по 4 секунды. Серия верных ответов растит множитель очков. Клавиши ← → работают." tags={["gameplay", "learn", "speed", "timer", "keyboard"]}>
      {state === "ready" && (
        <div className="flex flex-col items-center py-6 text-center"><Mascot mood="cool" size={80} /><div className="mt-2 text-lg font-extrabold text-white">Готов к блицу?</div><div className="mb-4 text-xs text-ink-400">4 секунды на ответ · множитель за серию</div><Btn v="gold" size="lg" onClick={start}><Icon name="bolt" size={18} variant="solid" />Start</Btn></div>
      )}
      {state === "run" && (
        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-extrabold"><span className="text-ink-300">{i + 1}/{TF.length}</span><span className="flex items-center gap-1 text-flame"><Icon name="flame" size={14} variant="solid" />×{Math.min(4, Math.max(1, streak))}</span><span className="text-gold">{pts} pts</span></div>
          <TimerBar t={t} />
          <div key={i} className={cn("raised my-4 grid min-h-[96px] place-items-center rounded-2xl p-4 text-center text-base font-extrabold text-white", ans === true && "ring-2 ring-bull", ans === false && "anim-shake ring-2 ring-bear")} style={{ animation: "screenIn .3s ease both" }}>{TF[i][0]}</div>
          <div className="grid grid-cols-2 gap-3">
            <Btn v="bear" size="lg" onClick={(e) => answer(false, e.clientX, e.clientY)}><Icon name="x" size={20} stroke={3.4} />False</Btn>
            <Btn v="bull" size="lg" onClick={(e) => answer(true, e.clientX, e.clientY)}><Icon name="check" size={20} stroke={3.4} />True</Btn>
          </div>
        </div>
      )}
      {state === "done" && <Summary correct={score} total={TF.length} xp={score * 4} onRestart={start} extra={<div className="mb-3 font-mono text-sm font-extrabold text-gold">{pts} points</div>} />}
    </AssetCard>
  );
}

/* ═════════ GPL-09 · Story Mode ═════════ */
type SNode = { who: "rick" | "pip"; text: string; choices?: { t: string; to: string; d: number }[]; end?: "good" | "mid" | "bad" };
const STORY: Record<string, SNode> = {
  start: { who: "rick", text: "Бро, PEPE делает +40% за час! Все заходят. Ты с нами на всё?", choices: [{ t: "Погнали на всё!", to: "allin", d: -1 }, { t: "Сначала посмотрю график", to: "check", d: 1 }, { t: "Пас, это пампа", to: "pass", d: 1 }] },
  allin: { who: "pip", text: "Ты купил на пике. Через 20 минут −35%. Рик молчит. Что теперь?", choices: [{ t: "Докупить, усредниться", to: "double", d: -1 }, { t: "Закрыть с убытком", to: "cut", d: 0 }] },
  check: { who: "pip", text: "Объём падает, RSI 92, кошелёк кита начал продавать. Что видишь?", choices: [{ t: "Перегрев — не вхожу", to: "pass", d: 1 }, { t: "Зайду, но на 1% депозита", to: "small", d: 0 }] },
  double: { who: "pip", text: "Усреднение в мемкоин без плана — путь к нулю. Итог: −70% по позиции.", end: "bad" },
  cut: { who: "pip", text: "Убыток −35% по позиции, но депозит жив. Дорогой, но усвоенный урок.", end: "mid" },
  small: { who: "pip", text: "1% — приемлемый риск. Монета упала, ты потерял 1%. Ночью спал спокойно.", end: "good" },
  pass: { who: "pip", text: "Пампа сдулась на 60% за день. Ты сохранил капитал и нервы. Так и торгуют профи.", end: "good" },
};
function Rick({ talk }: { talk: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width="84" height="84">
      <circle cx="50" cy="56" r="34" fill="#ff8a3d" />
      <path d="M18 44q32-34 64 0z" fill="#ffc53d" />
      <rect x="22" y="44" width="56" height="16" rx="6" fill="#0a1330" /><rect x="26" y="47" width="20" height="10" rx="3" fill="#3d8bff" /><rect x="54" y="47" width="20" height="10" rx="3" fill="#3d8bff" />
      <path d="M36 74q14 10 28 0" stroke="#0a1330" strokeWidth="4" fill="none" strokeLinecap="round" style={{ transformOrigin: "50px 74px", animation: talk ? "jelly .5s ease infinite" : undefined }} />
    </svg>
  );
}
function StoryMode() {
  const game = useGame();
  const [node, setNode] = useState("start");
  const [shown, setShown] = useState(0);
  const [eq, setEq] = useState(100);
  const [steps, setSteps] = useState(0);
  const n = STORY[node];
  const typed = shown >= n.text.length;
  useInterval(() => { setShown((s) => s + 1); if (shown % 3 === 0) sfx.play("tick"); }, typed ? null : 22);
  const choose = (c: { t: string; to: string; d: number }, x: number, y: number) => {
    setEq((e) => clamp(e + (c.d > 0 ? 12 : c.d < 0 ? -22 : -4), 0, 140));
    setSteps((s) => s + 1); setNode(c.to); setShown(0);
    feel(c.d > 0 ? "pop" : c.d < 0 ? "lock" : "tap", 8);
    const nx = STORY[c.to];
    if (nx.end) game.complete({ skill: "psychology", xp: nx.end === "good" ? 20 : nx.end === "mid" ? 10 : 5, x, y, ok: nx.end !== "bad" });
  };
  const restart = () => { setNode("start"); setShown(0); setEq(100); setSteps(0); };
  const eqV = useCountUp(eq * 100, 700);
  const stars = n.end === "good" ? 3 : n.end === "mid" ? 2 : n.end === "bad" ? 1 : 0;
  return (
    <AssetCard id="GPL-09" title="Story Mode · Visual Novel" desc="Диалог с персонажами и ветвлением: печатающийся текст, говорящий персонаж оживает, выборы меняют депозит. Учит психологии через историю." tags={["gameplay", "learn", "story", "dialogue", "branching"]} stageClass="p-0 overflow-hidden">
      <div className="relative min-h-[380px] bg-[radial-gradient(circle_at_50%_0%,#1d4fbf33,transparent_60%)] p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-lg bg-ink-900/70 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-ink-300">Chapter 3 · The Pump</span>
          <span className={cn("font-mono text-sm font-extrabold", eq >= 100 ? "text-bull" : "text-bear")}>${Math.round(eqV).toLocaleString()}</span>
        </div>
        <div className="mt-4 flex items-end justify-between px-2">
          <div className={cn("transition-all duration-300", n.who === "rick" ? "scale-110 opacity-100" : "scale-90 opacity-40 grayscale")}><Rick talk={n.who === "rick" && !typed} /><div className="text-center text-[10px] font-extrabold text-flame">Rekt Rick</div></div>
          <div className={cn("transition-all duration-300", n.who === "pip" ? "scale-110 opacity-100" : "scale-90 opacity-40 grayscale")}><Mascot mood={n.end === "bad" ? "sad" : n.end ? "happy" : "think"} size={84} /><div className="text-center text-[10px] font-extrabold text-sky">Pip</div></div>
        </div>
        <div key={node} className="mt-3 min-h-[84px] rounded-2xl border-2 border-ink-500 bg-ink-900/80 p-3 text-sm font-bold leading-relaxed text-white" style={{ animation: "riseIn .3s ease both" }}>
          <span className="mr-1 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: n.who === "rick" ? "#ff8a3d" : "#3d8bff" }}>{n.who === "rick" ? "Rick" : "Pip"}:</span>
          {n.text.slice(0, shown)}{!typed && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-white" style={{ animation: "caret .7s step-end infinite" }} />}
        </div>
        {typed && n.choices && (
          <div className="mt-3 space-y-2">
            {n.choices.map((c, k) => <button key={c.t} onClick={(e) => choose(c, e.clientX, e.clientY)} className="raised anim-rise w-full rounded-xl px-3 py-2.5 text-left text-xs font-extrabold text-ink-100 transition-transform hover:translate-x-1 active:translate-y-0.5" style={{ animationDelay: `${k * 90}ms` }}>› {c.t}</button>)}
          </div>
        )}
        {typed && n.end && (
          <div className="anim-pop mt-3 flex items-center justify-between rounded-2xl bg-ink-800 p-3">
            <div><div className="flex gap-0.5">{[0, 1, 2].map((k) => <Icon key={k} name="star" size={20} variant={k < stars ? "solid" : "line"} className={k < stars ? "anim-pop text-gold" : "text-ink-600"} style={{ animationDelay: `${k * 150}ms` }} />)}</div><div className="text-[10px] font-bold text-ink-400">{steps} решения · {n.end === "good" ? "Дисциплина" : n.end === "mid" ? "Выжил" : "Rekt"}</div></div>
            <Btn v="sky" size="sm" onClick={restart}><Icon name="refresh" size={14} />Replay</Btn>
          </div>
        )}
        {!typed && <button onClick={() => setShown(n.text.length)} className="absolute bottom-2 right-3 text-[10px] font-extrabold uppercase text-ink-500">skip ››</button>}
      </div>
    </AssetCard>
  );
}

/* ═════════ GPL-10 · Position Size Calculator ═════════ */
const PS = [
  { acc: 10000, risk: 1, entry: 64000, stop: 62720, ans: 5000 },
  { acc: 5000, risk: 2, entry: 3400, stop: 3230, ans: 2000 },
  { acc: 20000, risk: 0.5, entry: 150, stop: 142.5, ans: 2000 },
];
function PositionSize() {
  const game = useGame();
  const [i, setI] = useState(0);
  const q = PS[i];
  const [v, setV] = useState(q.acc / 2);
  const [res, setRes] = useState<null | boolean>(null);
  const [step, setStep] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const riskUsd = (q.acc * q.risk) / 100, dist = (q.entry - q.stop) / q.entry;
  const set = (cx: number) => { const r = track.current!.getBoundingClientRect(); const nv = Math.round((clamp((cx - r.left) / r.width, 0, 1) * q.acc) / 100) * 100; setV((o) => { if (o !== nv) sfx.play("tick"); return nv; }); };
  const onDown = useDrag({ onStart: (x) => { if (res !== null) return false; set(x); }, onMove: (d) => set(d.x) });
  const check = (x: number, y: number) => {
    const ok = Math.abs(v - q.ans) / q.ans <= 0.06;
    setRes(ok); setStep(0);
    [1, 2, 3].forEach((s) => window.setTimeout(() => setStep(s), s * 600));
    if (ok) { game.complete({ skill: "risk", xp: 18, x, y }); feel("success"); } else { game.complete({ skill: "risk", ok: false }); feel("error"); }
  };
  const next = () => { const ni = (i + 1) % PS.length; setI(ni); setV(PS[ni].acc / 2); setRes(null); setStep(0); sfx.play("whoosh"); };
  const a1 = useCountUp(step >= 1 ? riskUsd : 0, 500), a2 = useCountUp(step >= 2 ? dist * 100 : 0, 500), a3 = useCountUp(step >= 3 ? q.ans : 0, 700);
  return (
    <AssetCard id="GPL-10" title="Position Size Calculator" desc="Задача на размер позиции: депозит, риск %, вход и стоп. Выстави ответ слайдером — после проверки формула раскрывается по шагам с анимированными числами." tags={["gameplay", "learn", "risk", "math", "slider"]}>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[["Account", `$${q.acc.toLocaleString()}`], ["Risk", `${q.risk}%`], ["Entry", q.entry.toLocaleString()], ["Stop", q.stop.toLocaleString()]].map(([l, val]) => <div key={l} className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">{l}</div><div className="font-mono text-xs font-extrabold text-white">{val}</div></div>)}
      </div>
      <div className="mt-4 text-center text-sm font-extrabold text-white">Какой размер позиции в $?</div>
      <div className="my-2 text-center font-mono text-4xl font-extrabold text-sky">${v.toLocaleString()}</div>
      <div ref={track} onPointerDown={onDown} className="relative h-10 cursor-pointer touch-none">
        <div className="well absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full" />
        <div className="absolute left-0 top-1/2 h-3 -translate-y-1/2 rounded-full bg-gradient-to-r from-sky-edge to-sky" style={{ width: `${(v / q.acc) * 100}%` }} />
        {res !== null && <div className="absolute top-0 h-10 w-1 rounded bg-bull shadow-[0_0_10px_#2ee59d]" style={{ left: `${(q.ans / q.acc) * 100}%` }} />}
        <div className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-sky shadow-[0_4px_0_#1e56c9]" style={{ left: `${(v / q.acc) * 100}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[10px] font-bold text-ink-400"><span>$0</span><span>${(q.acc / 2).toLocaleString()}</span><span>${q.acc.toLocaleString()}</span></div>
      {res === null ? <Btn v="bull" size="sm" block className="mt-3" onClick={(e) => check(e.clientX, e.clientY)}>Check</Btn> : (
        <div className="mt-3 space-y-2">
          {[
            { on: step >= 1, l: "1 · Риск в $", f: `${q.acc.toLocaleString()} × ${q.risk}%`, v: `$${Math.round(a1)}` },
            { on: step >= 2, l: "2 · Дистанция до стопа", f: `(${q.entry} − ${q.stop}) / ${q.entry}`, v: `${a2.toFixed(1)}%` },
            { on: step >= 3, l: "3 · Размер позиции", f: `$${riskUsd} / ${(dist * 100).toFixed(1)}%`, v: `$${Math.round(a3).toLocaleString()}` },
          ].map((s) => (
            <div key={s.l} className={cn("flex items-center justify-between rounded-xl bg-ink-900/60 px-3 py-2 transition-all duration-500", s.on ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0")}>
              <div><div className="text-[10px] font-extrabold uppercase text-ink-400">{s.l}</div><div className="font-mono text-[11px] text-ink-300">{s.f}</div></div>
              <div className="font-mono text-base font-extrabold text-white">{s.v}</div>
            </div>
          ))}
          {step >= 3 && <Verdict inline ok={res} text={res ? "Ты рискуешь ровно 1% — как профи." : `Правильный ответ $${q.ans.toLocaleString()}. Размер = риск$ / дистанция стопа.`} onNext={next} label="Next problem" />}
        </div>
      )}
    </AssetCard>
  );
}

export default function Gameplay1() {
  return (
    <Section id="learn" num="G1" title="Gameplay · Learn" subtitle="10 обучающих механик: конструктор свечи, поиск паттерна, сортировка, последовательность, свайп новостей, память, рисование прогноза, блиц, история, расчёт риска">
      <CandleBuilder />
      <TapPattern />
      <SortBuckets />
      <SequenceBuilder />
      <HeadlineSwipe />
      <MemoryMatch />
      <DrawForecast />
      <SpeedRound />
      <StoryMode />
      <PositionSize />
    </Section>
  );
}
