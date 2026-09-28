import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, SkipForward, RotateCcw, Check, GripVertical, Newspaper, Hammer, Scale, Target, Lightbulb } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { CandleChart, genSeries, fromCloses, makeScale, svgPoint, BULL, BEAR } from "../kit/chart";
import { clamp } from "../kit/motion";
import { useGame } from "../kit/game";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ======================================================================
   P-07  CANDLE BUILDER — match the target silhouette with 4 sliders
   ==================================================================== */
const targets = [
  { n: "Hammer", o: 72, c: 80, h: 84, l: 14 },
  { n: "Shooting Star", o: 30, c: 22, h: 90, l: 16 },
  { n: "Bullish Marubozu", o: 18, c: 86, h: 88, l: 16 },
  { n: "Doji", o: 50, c: 51, h: 82, l: 20 },
];
function CandleBuilder() {
  const [ti, setTi] = useState(0);
  const [v, setV] = useState({ o: 40, c: 60, h: 70, l: 30 });
  const [ok, setOk] = useState(false);
  const t = targets[ti];
  const hi = Math.max(v.h, v.o, v.c), lo = Math.min(v.l, v.o, v.c);
  const diff = (Math.abs(v.o - t.o) + Math.abs(v.c - t.c) + Math.abs(hi - t.h) + Math.abs(lo - t.l)) / 4;
  const match = Math.round(clamp(100 - diff * 3, 0, 100));
  const Y = (p: number) => 180 - p * 1.6;
  const draw = (o: number, c: number, h: number, l: number, x: number, ghost = false) => {
    const up = c >= o, col = Math.abs(c - o) < 2 ? "#ffc53d" : up ? BULL : BEAR;
    return (
      <g>
        <rect x={x - 1.5} y={Y(h)} width="3" height={Y(l) - Y(h)} fill={ghost ? "none" : col} stroke={ghost ? "#8a9bc4" : "none"} strokeDasharray="3 3" />
        <rect x={x - 22} y={Y(Math.max(o, c))} width="44" height={Math.max(3, Math.abs(Y(o) - Y(c)))} rx="6" fill={ghost ? "none" : col} stroke={ghost ? "#8a9bc4" : "none"} strokeWidth="2" strokeDasharray="5 4" style={ghost ? undefined : { filter: `drop-shadow(0 0 8px ${col}88)`, transition: "all .15s" }} />
      </g>
    );
  };
  const submit = () => { if (match >= 88) { setOk(true); sfx.correct(); } else sfx.wrong(); };
  const next = () => { setTi((x) => (x + 1) % targets.length); setOk(false); setV({ o: 40, c: 60, h: 70, l: 30 }); };
  return (
    <Asset code="PR-07" title="Candle Builder" desc="Собери свечу по силуэту: 4 слайдера O/H/L/C. Совпадение считается в реальном времени." hint="Совмести с пунктиром" specs={["4 sliders", "live match", "4 targets"]}>
      <div className="flex items-center justify-between">
        <div className="font-display text-base font-extrabold">Build: <span className="text-gold">{t.n}</span></div>
        <Chip tone={match >= 88 ? "bull" : "gold"}>{match}% match</Chip>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_1.1fr] gap-3">
        <div className="panel-inset grid place-items-center !rounded-2xl">
          <svg viewBox="0 0 120 190" className="h-48 w-full">
            {draw(t.o, t.c, t.h, t.l, 60, true)}
            {draw(v.o, v.c, hi, lo, 60)}
          </svg>
        </div>
        <div className="space-y-2.5">
          {([["o", "Open", "#e8eeff"], ["h", "High", "#22d39a"], ["l", "Low", "#ff4f6d"], ["c", "Close", "#ffc53d"]] as const).map(([k, l, c]) => (
            <div key={k}>
              <div className="flex justify-between text-[10px] font-bold"><span style={{ color: c }}>{l}</span><span className="num text-mist">{v[k]}</span></div>
              <input type="range" min={0} max={100} value={v[k]} disabled={ok} onChange={(e) => { setV({ ...v, [k]: +e.target.value }); if (+e.target.value % 5 === 0) sfx.tick(); }} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: c, background: `linear-gradient(90deg, ${c} ${v[k]}%, #0b1530 0)` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3"><Bar value={match} tone={match >= 88 ? "bull" : "gold"} h={10} /></div>
      <div className="mt-3">{ok ? <Btn tone="sky" block size="sm" onClick={next}>Next candle →</Btn> : <Btn tone="bull" block size="sm" onClick={submit} silent><Hammer size={14} /> Check build</Btn>}</div>
    </Asset>
  );
}

/* ======================================================================
   P-08  POSITION SIZER — hit exactly 1% account risk
   ==================================================================== */
const sizerRounds = [
  { acc: 10000, entry: 64000, stop: 62720, coin: "BTC", step: 0.001, max: 0.3 },
  { acc: 5000, entry: 3200, stop: 3040, coin: "ETH", step: 0.01, max: 3 },
  { acc: 2500, entry: 148, stop: 141.3, coin: "SOL", step: 0.1, max: 20 },
];
function PositionSizer() {
  const [r, setR] = useState(0);
  const cfg = sizerRounds[r];
  const [size, setSize] = useState(cfg.max / 2);
  const [solved, setSolved] = useState(false);
  const riskUsd = size * (cfg.entry - cfg.stop);
  const riskPct = (riskUsd / cfg.acc) * 100;
  const inBand = riskPct >= 0.9 && riskPct <= 1.1;
  const pos = clamp((riskPct / 3) * 100, 0, 100);
  const submit = () => { if (inBand) { setSolved(true); sfx.correct(); } else sfx.wrong(); };
  const next = () => { const n = (r + 1) % sizerRounds.length; setR(n); setSize(sizerRounds[n].max / 2); setSolved(false); if (n === 0) sfx.levelUp(); };
  return (
    <Asset code="PR-08" title="Position Sizer" desc="Подбери размер позиции так, чтобы риск был ровно 1% депозита. Три рынка, разные цены." hint="Попади в зелёную зону" specs={["risk gauge", "3 scenarios", "1% rule"]}>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[["Account", `$${cfg.acc.toLocaleString()}`], ["Entry", cfg.entry.toLocaleString()], ["Stop", cfg.stop.toLocaleString()]].map(([a, b]) => (
          <div key={a} className="rounded-xl bg-ink-800 py-2"><div className="text-[9px] font-bold uppercase text-mist">{a}</div><div className="num text-[13px] font-extrabold">{b}</div></div>
        ))}
      </div>
      <div className="relative mt-5 h-8">
        <div className="panel-inset absolute inset-x-0 top-2 h-4 overflow-hidden !rounded-full">
          <div className="absolute inset-y-0 bg-bull/35" style={{ left: `${(0.9 / 3) * 100}%`, width: `${(0.2 / 3) * 100}%` }} />
          <div className="h-full rounded-full transition-all duration-150" style={{ width: `${pos}%`, background: inBand ? BULL : riskPct > 1.1 ? BEAR : "#ffc53d" }} />
        </div>
        <div className="absolute -top-1 -translate-x-1/2 transition-all duration-150" style={{ left: `${pos}%` }}>
          <div className={cn("num whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-extrabold", inBand ? "bg-bull text-ink-900" : "bg-ink-600")}>{riskPct.toFixed(2)}%</div>
        </div>
      </div>
      <div className="num mt-1 flex justify-between text-[9px] text-mist"><span>0%</span><span className="text-bull">1%</span><span>3%</span></div>
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Position size</span><span className="num text-gold">{size.toFixed(cfg.step < 0.01 ? 3 : cfg.step < 0.1 ? 2 : 1)} {cfg.coin}</span></div>
        <input type="range" min={0} max={cfg.max} step={cfg.step} value={size} disabled={solved} onChange={(e) => { setSize(+e.target.value); sfx.tick(); }} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${(size / cfg.max) * 100}%,#0b1530 0)` }} />
      </div>
      <div className="mt-3 rounded-xl bg-ink-800 p-2.5 text-[11px] text-mist">
        Риск в деньгах: <span className={cn("num font-extrabold", inBand ? "text-bull" : "text-snow")}>${riskUsd.toFixed(2)}</span> из цели <span className="num font-extrabold text-bull">${(cfg.acc / 100).toFixed(0)}</span>
      </div>
      {solved && <div className="anim-pop mt-3 rounded-xl bg-bull/15 p-2.5 text-[12px] text-bull"><Scale size={14} className="mr-1 inline" />Формула: размер = (депозит × 1%) ÷ (вход − стоп)</div>}
      <div className="mt-3">{solved ? <Btn tone="sky" block size="sm" onClick={next}>Next market ({r + 1}/3) →</Btn> : <Btn tone="bull" block size="sm" onClick={submit} silent>Lock size</Btn>}</div>
    </Asset>
  );
}

/* ======================================================================
   P-09  ORDER SORTER — pointer drag & drop into buckets (touch-ready)
   ==================================================================== */
const orderCards = [
  { id: 0, t: "Купить сейчас по лучшей цене", b: "market" },
  { id: 1, t: "Купить, если цена упадёт до 60k", b: "limit" },
  { id: 2, t: "Продать, если цена упадёт до 58k", b: "stop" },
  { id: 3, t: "Мгновенно закрыть позицию", b: "market" },
  { id: 4, t: "Продать, когда вырастет до 72k", b: "limit" },
  { id: 5, t: "Защитить позицию от падения", b: "stop" },
];
const buckets = [
  { k: "market", n: "Market", c: "#3b82ff" },
  { k: "limit", n: "Limit", c: "#22d39a" },
  { k: "stop", n: "Stop", c: "#ff4f6d" },
];
function OrderSorter() {
  const [placed, setPlaced] = useState<Record<number, string>>({});
  const [drag, setDrag] = useState<{ id: number; x: number; y: number; ox: number; oy: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [bad, setBad] = useState<number | null>(null);
  const { celebrate } = useGame();
  useEffect(() => {
    if (!drag) return;
    const mv = (e: PointerEvent) => {
      setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-bucket]") as HTMLElement | null;
      setOver(el?.dataset.bucket ?? null);
    };
    const up = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-bucket]") as HTMLElement | null;
      const b = el?.dataset.bucket;
      const card = orderCards.find((c) => c.id === drag.id)!;
      if (b) {
        if (b === card.b) {
          setPlaced((p) => {
            const n = { ...p, [card.id]: b };
            if (Object.keys(n).length === orderCards.length) setTimeout(() => { sfx.levelUp(); celebrate("Все ордера на месте!"); }, 250);
            return n;
          });
          sfx.correct();
        } else { setBad(card.id); sfx.wrong(); setTimeout(() => setBad(null), 500); }
      }
      setDrag(null); setOver(null);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag?.id]); // eslint-disable-line
  const free = orderCards.filter((c) => !placed[c.id]);
  const dragged = drag ? orderCards.find((c) => c.id === drag.id) : null;
  return (
    <Asset code="PR-09" title="Order Type Sorter" desc="Перетащи ситуации в правильный тип ордера. Работает мышью и пальцем, с подсветкой зоны сброса." hint="Тащи карточки в корзины" specs={["pointer DnD", "drop zones", "touch"]}>
      <div className="flex min-h-[132px] flex-wrap content-start gap-2">
        {free.map((c) => (
          <button
            key={c.id}
            onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); setDrag({ id: c.id, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top }); sfxRaw.pop(); }}
            className={cn("touch-none rounded-xl border-2 border-ink-500 bg-ink-700 px-3 py-2 text-left text-[12px] font-bold shadow-[0_3px_0_#0f1c3a] transition", drag?.id === c.id && "opacity-25", bad === c.id && "anim-shake border-bear")}
          >
            <GripVertical size={12} className="mr-1 inline text-mist" />{c.t}
          </button>
        ))}
        {!free.length && <div className="anim-pop grid w-full place-items-center py-6 text-center"><Mascot size={70} mood="hype" /><button onClick={() => setPlaced({})} className="text-[11px] font-bold text-sky">Reset</button></div>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {buckets.map((b) => {
          const inside = orderCards.filter((c) => placed[c.id] === b.k);
          return (
            <div key={b.k} data-bucket={b.k} className="min-h-[120px] rounded-2xl border-2 border-dashed p-2 transition-all" style={{ borderColor: over === b.k ? b.c : `${b.c}55`, background: over === b.k ? `${b.c}22` : `${b.c}0a`, transform: over === b.k ? "scale(1.04)" : undefined }}>
              <div className="text-center text-[10px] font-extrabold uppercase" style={{ color: b.c }}>{b.n}</div>
              <div className="mt-1.5 space-y-1">{inside.map((c) => <div key={c.id} className="anim-pop rounded-lg px-1.5 py-1 text-[9px] font-bold leading-tight" style={{ background: `${b.c}26` }}>{c.t}</div>)}</div>
            </div>
          );
        })}
      </div>
      {drag && dragged && (
        <div className="pointer-events-none fixed z-[100] w-48 rotate-3 rounded-xl border-2 border-sky bg-ink-600 px-3 py-2 text-[12px] font-bold shadow-[0_18px_30px_rgba(0,0,0,.6)]" style={{ left: drag.x - drag.ox, top: drag.y - drag.oy }}>
          {dragged.t}
        </div>
      )}
    </Asset>
  );
}

/* ======================================================================
   P-10  TRADE SEQUENCE — drag to reorder with live slot animation
   ==================================================================== */
const seqCorrect = ["Определи тренд", "Найди уровень входа", "Поставь стоп-лосс", "Рассчитай размер позиции", "Открой сделку", "Запиши в журнал"];
const ROW = 46;
function Sequence() {
  const [order, setOrder] = useState(() => [3, 0, 5, 2, 4, 1]);
  const [drag, setDrag] = useState<{ item: number; startY: number; dy: number; from: number } | null>(null);
  const [checked, setChecked] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!drag) return;
    const mv = (e: PointerEvent) => {
      const dy = e.clientY - drag.startY;
      const target = clamp(drag.from + Math.round(dy / ROW), 0, order.length - 1);
      const cur = order.indexOf(drag.item);
      if (target !== cur) {
        const n = order.filter((x) => x !== drag.item);
        n.splice(target, 0, drag.item);
        setOrder(n);
        sfx.tick();
      }
      setDrag((d) => (d ? { ...d, dy } : d));
    };
    const up = () => { setDrag(null); sfxRaw.thud(); };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  }, [drag, order]);
  const correctCount = order.filter((it, i) => it === i).length;
  const check = () => {
    setChecked(true);
    if (correctCount === order.length) sfx.levelUp(); else sfx.wrong();
  };
  return (
    <Asset code="PR-10" title="Trade Checklist Order" desc="Расставь шаги сделки в правильном порядке. Строки плавно уступают место при перетаскивании." hint="Тащи за ручку" specs={["drag reorder", "slot anim", "check"]}>
      <div ref={list} className="relative" style={{ height: order.length * ROW }}>
        {seqCorrect.map((txt, item) => {
          const idx = order.indexOf(item);
          const isDrag = drag?.item === item;
          const ok = checked && idx === item;
          const top = isDrag ? drag.from * ROW + drag.dy : idx * ROW;
          return (
            <div
              key={item}
              className={cn("absolute inset-x-0 flex h-[40px] items-center gap-2.5 rounded-xl border-2 px-2.5 text-[13px] font-bold", isDrag ? "z-10 scale-[1.03] border-sky bg-ink-600 shadow-[0_14px_24px_rgba(0,0,0,.5)]" : checked ? (ok ? "border-bull bg-bull/12" : "border-bear bg-bear/12") : "border-ink-500 bg-ink-700 shadow-[0_3px_0_#0f1c3a]")}
              style={{ top, transition: isDrag ? "none" : "top .3s cubic-bezier(.3,1.3,.5,1), background .2s" }}
            >
              <button onPointerDown={(e) => { setChecked(false); setDrag({ item, startY: e.clientY, dy: 0, from: idx }); sfxRaw.pop(); }} className="touch-none cursor-grab text-mist active:cursor-grabbing" aria-label="Drag"><GripVertical size={16} /></button>
              <span className="num grid h-6 w-6 place-items-center rounded-md bg-ink-900 text-[10px] font-black text-mist">{idx + 1}</span>
              <span className="flex-1">{txt}</span>
              {checked && (ok ? <Check size={15} className="text-bull" /> : <span className="text-[10px] text-bear">→ {item + 1}</span>)}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <GhostBtn className="!h-11 !text-[10px]" onClick={() => { setOrder([...order].sort(() => Math.random() - 0.5)); setChecked(false); }}><RotateCcw size={13} /> Shuffle</GhostBtn>
        <Btn tone="bull" className="!h-11 !text-[10px]" onClick={check} silent>Check · {checked ? `${correctCount}/6` : "?"}</Btn>
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-11  CHART REPLAY — trade candle by candle, full PnL tracking
   ==================================================================== */
function Replay() {
  const [seed, setSeed] = useState(11);
  const data = useMemo(() => genSeries(seed, 60, { vol: 1.6, drift: 0.05 }), [seed]);
  const [n, setN] = useState(20);
  const [play, setPlay] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pos, setPos] = useState<{ side: "long" | "short"; entry: number } | null>(null);
  const [trades, setTrades] = useState<number[]>([]);
  const end = n >= data.length;
  const price = data[Math.min(n, data.length) - 1].c;
  const open = pos ? (pos.side === "long" ? price - pos.entry : pos.entry - price) : 0;
  const realized = trades.reduce((a, b) => a + b, 0);
  useEffect(() => {
    if (!play || end) return;
    const t = setInterval(() => setN((x) => { if (x + 1 >= data.length) setPlay(false); return x + 1; }), 700 / speed);
    return () => clearInterval(t);
  }, [play, speed, end, data.length]);
  const close = () => {
    if (!pos) return;
    setTrades((t) => [...t, open]);
    open >= 0 ? sfx.correct() : sfxRaw.thud();
    setPos(null);
  };
  const s = useMemo(() => makeScale(data, 330, 180, 12), [data]);
  const reset = () => { setSeed((x) => x + 7); setN(20); setPos(null); setTrades([]); setPlay(false); };
  return (
    <Asset code="PR-11" title="Chart Replay Trainer" desc="Рынок идёт свеча за свечой. Открывай long/short, закрывай, следи за PnL и статистикой сделок." hint="Play, потом Long/Short" specs={["replay 60", "speed x1-x4", "trade log"]} className="md:col-span-2 xl:col-span-2">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="panel-inset p-2 !rounded-2xl">
            <CandleChart data={data.slice(0, n)} s={s} W={330} H={180} animate={false} volume>
              {(sc) => (
                <>
                  {pos && <><line x1="0" x2={sc.W} y1={sc.y(pos.entry)} y2={sc.y(pos.entry)} stroke={pos.side === "long" ? BULL : BEAR} strokeDasharray="4 3" /><text x="6" y={sc.y(pos.entry) - 4} fontSize="9" fontWeight="900" fill={pos.side === "long" ? BULL : BEAR}>{pos.side.toUpperCase()} {pos.entry.toFixed(1)}</text></>}
                  <line x1="0" x2={sc.W} y1={sc.y(price)} y2={sc.y(price)} stroke="#ffc53d" strokeOpacity=".6" strokeDasharray="2 3" />
                  <rect x={sc.W - 40} y={sc.y(price) - 8} width="38" height="16" rx="4" fill="#ffc53d" />
                  <text x={sc.W - 21} y={sc.y(price) + 4} textAnchor="middle" fontSize="9" fontWeight="900" fill="#0a1224">{price.toFixed(1)}</text>
                </>
              )}
            </CandleChart>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => { setPlay(!play); sfxRaw.pop(); }} disabled={end} className="grid h-10 w-10 place-items-center rounded-xl bg-sky shadow-[0_3px_0_#2152c4] active:translate-y-[3px] active:shadow-none disabled:opacity-40">{play ? <Pause size={16} /> : <Play size={16} />}</button>
            <button onClick={() => setN((x) => Math.min(data.length, x + 1))} disabled={end} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-700 shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none disabled:opacity-40"><SkipForward size={16} /></button>
            {[1, 2, 4].map((sp) => <button key={sp} onClick={() => setSpeed(sp)} className={cn("num h-10 rounded-xl px-3 text-[11px] font-extrabold", speed === sp ? "bg-gold text-ink-900" : "bg-ink-800 text-mist")}>x{sp}</button>)}
            <div className="ml-auto flex-1"><Bar value={(n / data.length) * 100} tone="sky" h={8} glow={false} /></div>
          </div>
        </div>
        <div className="flex flex-col">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-ink-800 p-3"><div className="text-[9px] font-bold uppercase text-mist">Open PnL</div><div className={cn("num text-xl font-extrabold", open >= 0 ? "text-bull" : "text-bear")}>{open >= 0 ? "+" : ""}{open.toFixed(2)}</div></div>
            <div className="rounded-2xl bg-ink-800 p-3"><div className="text-[9px] font-bold uppercase text-mist">Realized</div><div className={cn("num text-xl font-extrabold", realized >= 0 ? "text-bull" : "text-bear")}>{realized >= 0 ? "+" : ""}{realized.toFixed(2)}</div></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Btn tone="bull" size="sm" disabled={!!pos || end} onClick={() => setPos({ side: "long", entry: price })}>Long</Btn>
            <Btn tone="bear" size="sm" disabled={!!pos || end} onClick={() => setPos({ side: "short", entry: price })}>Short</Btn>
            <Btn tone="gold" size="sm" className="!text-[#3b2600]" disabled={!pos} onClick={close} silent>Close</Btn>
          </div>
          <div className="mt-3 flex-1 space-y-1 overflow-y-auto rounded-2xl bg-ink-900/60 p-2" style={{ maxHeight: 130 }}>
            {!trades.length && <div className="py-4 text-center text-[11px] text-mist">Журнал сделок пуст</div>}
            {trades.map((t, i) => <div key={i} className="anim-slide-right num flex justify-between rounded-lg bg-ink-800 px-2 py-1 text-[11px]"><span className="text-mist">#{i + 1}</span><span className={t >= 0 ? "text-bull" : "text-bear"}>{t >= 0 ? "+" : ""}{t.toFixed(2)}</span></div>)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-mist">Win rate <span className="num font-extrabold text-snow">{trades.length ? Math.round((trades.filter((t) => t > 0).length / trades.length) * 100) : 0}%</span></span>
            <button onClick={reset} className="flex items-center gap-1 font-bold text-sky"><RotateCcw size={12} /> New market</button>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ======================================================================
   P-12  NEWS IMPACT — predict reaction, watch the price draw
   ==================================================================== */
const news = [
  { h: "ФРС снизила ставку на 0.5%", src: "Reuters", a: "bull", m: 6.4 },
  { h: "Крупный майнер продал 20 000 BTC", src: "CoinDesk", a: "bear", m: -4.1 },
  { h: "Обновление сети прошло по плану", src: "The Block", a: "neutral", m: 0.3 },
  { h: "Регулятор подал иск против биржи", src: "Bloomberg", a: "bear", m: -7.8 },
  { h: "Страна приняла BTC как платёжное средство", src: "FT", a: "bull", m: 9.2 },
];
function NewsImpact() {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const n = news[i % news.length];
  const path = useMemo(() => {
    const pts: string[] = [];
    let y = 60;
    for (let k = 0; k <= 30; k++) {
      const target = 60 - n.m * 5;
      y += (target - y) * 0.18 + Math.sin(k * 1.9 + i) * 2.2;
      pts.push(`${k * 10},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [i, n.m]);
  const choose = (a: string) => {
    if (pick) return;
    setPick(a);
    if (a === n.a) { setScore((s) => s + 1); sfx.correct(); } else sfx.wrong();
  };
  return (
    <Asset code="PR-12" title="News Impact" desc="Прочитай заголовок, предскажи реакцию рынка — и смотри, как рисуется настоящая траектория цены." hint="Выбери реакцию" specs={["5 headlines", "path draw", "slide next"]}>
      <div className="flex items-center justify-between">
        <Chip tone="sky"><Newspaper size={11} /> {i % news.length + 1}/{news.length}</Chip>
        <span className="num text-[11px] font-bold text-gold">score {score}</span>
      </div>
      <div key={i} className="anim-slide-right mt-3 rounded-2xl bg-ink-700 p-4 shadow-[0_4px_0_#08112a]">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">{n.src} · breaking</div>
        <div className="font-display mt-1 text-[17px] font-extrabold leading-snug">{n.h}</div>
      </div>
      <div className="panel-inset relative mt-3 h-32 overflow-hidden !rounded-2xl">
        <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="h-full w-full">
          <line x1="0" x2="300" y1="60" y2="60" stroke="#3a5494" strokeDasharray="3 4" />
          {pick && <polyline key={i} points={path} fill="none" stroke={n.m > 1 ? BULL : n.m < -1 ? BEAR : "#ffc53d"} strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" strokeDasharray="700" style={{ ["--len" as string]: "700", animation: "draw 1.4s ease-out both" }} />}
        </svg>
        {pick && <span className="num anim-pop absolute right-3 top-2 rounded-lg px-2 py-1 text-[12px] font-extrabold" style={{ animationDelay: "1s", color: n.m > 0 ? BULL : BEAR, background: "#0a1224cc" }}>{n.m > 0 ? "+" : ""}{n.m}%</span>}
        {!pick && <div className="absolute inset-0 grid place-items-center text-[11px] text-mist">Реакция появится после ответа</div>}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {([["bull", "Bullish", BULL], ["neutral", "Neutral", "#ffc53d"], ["bear", "Bearish", BEAR]] as const).map(([k, l, c]) => (
          <button key={k} onClick={() => choose(k)} disabled={!!pick} className={cn("h-11 rounded-xl text-[11px] font-extrabold transition active:translate-y-0.5", pick === k && (k === n.a ? "ring-2" : "anim-shake ring-2"))} style={{ color: c, background: `${c}1c`, boxShadow: pick && n.a === k ? `inset 0 0 0 2px ${c}` : `0 3px 0 ${c}44`, opacity: pick && n.a !== k && pick !== k ? 0.4 : 1 }}>
            {l}
          </button>
        ))}
      </div>
      <Btn tone="sky" block size="sm" className="mt-3" disabled={!pick} onClick={() => { setI((x) => x + 1); setPick(null); if ((i + 1) % news.length === 0) sfx.levelUp(); }}>Next headline →</Btn>
    </Asset>
  );
}

/* ======================================================================
   P-13  TERM GUESS — letter puzzle where mistakes crash the chart
   ==================================================================== */
const words = [
  { w: "STOPLOSS", h: "Ордер, ограничивающий убыток" },
  { w: "LEVERAGE", h: "Заёмные деньги для усиления позиции" },
  { w: "WHALE", h: "Очень крупный держатель монет" },
  { w: "HODL", h: "Держать несмотря ни на что" },
  { w: "SLIPPAGE", h: "Разница ожидаемой и фактической цены" },
];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function TermGuess() {
  const [wi, setWi] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const w = words[wi].w;
  const wrong = guessed.filter((l) => !w.includes(l));
  const won = w.split("").every((l) => guessed.includes(l));
  const lost = wrong.length >= 6;
  const guess = (l: string) => {
    if (guessed.includes(l) || won || lost) return;
    const n = [...guessed, l];
    setGuessed(n);
    if (w.includes(l)) {
      sfxRaw.pop();
      if (w.split("").every((x) => n.includes(x))) sfx.correct();
    } else {
      sfxRaw.thud();
      if (n.filter((x) => !w.includes(x)).length >= 6) sfx.wrong();
    }
  };
  const next = () => { setWi((x) => (x + 1) % words.length); setGuessed([]); setHint(false); };
  return (
    <Asset code="PR-13" title="Term Guess" desc="Угадай термин по буквам. Каждая ошибка — красная свеча вниз; шесть ошибок — ликвидация." hint="Жми буквы или клавиатуру" specs={["6 lives", "chart crash", "keyboard"]}>
      <div tabIndex={0} onKeyDown={(e) => { const k = e.key.toUpperCase(); if (ALPHA.includes(k)) guess(k); }} className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky">
        <div className="flex items-end justify-between gap-3">
          <div className="panel-inset flex h-24 flex-1 items-end gap-1.5 p-2 !rounded-2xl">
            {[...Array(6)].map((_, k) => {
              const crashed = k < wrong.length;
              return <div key={k} className="flex-1 rounded-sm transition-all duration-500" style={{ height: crashed ? `${70 - k * 11}%` : `${40 + k * 8}%`, background: crashed ? BEAR : `${BULL}55`, boxShadow: crashed ? `0 0 8px ${BEAR}` : undefined }} />;
            })}
          </div>
          <Mascot size={80} mood={won ? "hype" : lost ? "sad" : wrong.length > 3 ? "sad" : "think"} />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {w.split("").map((l, k) => (
            <span key={k} className={cn("num grid h-11 w-9 place-items-center rounded-xl border-b-4 text-lg font-black", guessed.includes(l) ? "anim-pop border-bull-d bg-bull text-ink-900" : lost ? "border-bear-d bg-bear/30 text-bear" : "border-ink-600 bg-ink-800 text-transparent")}>
              {guessed.includes(l) || lost ? l : "_"}
            </span>
          ))}
        </div>
        <div className="mt-2 flex min-h-[20px] items-center justify-center text-[12px] text-mist">
          {hint ? <span className="anim-fade">💡 {words[wi].h}</span> : <button onClick={() => setHint(true)} className="flex items-center gap-1 font-bold text-sky"><Lightbulb size={12} /> Hint</button>}
        </div>
        <div className="mt-3 grid grid-cols-9 gap-1">
          {ALPHA.map((l) => {
            const used = guessed.includes(l), hit = used && w.includes(l);
            return (
              <button key={l} onClick={() => guess(l)} disabled={used || won || lost} className={cn("num h-8 rounded-lg text-[11px] font-black transition active:translate-y-0.5", hit ? "bg-bull/25 text-bull" : used ? "bg-ink-900 text-ink-500" : "bg-ink-700 shadow-[0_2px_0_#08112a] hover:bg-ink-600")}>
                {l}
              </button>
            );
          })}
        </div>
      </div>
      {(won || lost) && <Btn tone={won ? "bull" : "sky"} block size="sm" className="mt-3 anim-pop" onClick={next}>{won ? "Next term →" : "Try another"}</Btn>}
    </Asset>
  );
}

/* ======================================================================
   P-14  SUPPORT & RESISTANCE — place levels by tapping the chart
   ==================================================================== */
const srCloses = [104, 106.5, 108.8, 107.2, 104.6, 102.1, 101.2, 103.8, 106.6, 108.9, 107.5, 104.9, 102.4, 101.4, 103.2, 105.9, 108.6, 107.1, 104.3, 101.6, 102.9];
function SRLevels() {
  const data = useMemo(() => fromCloses(srCloses, 0.55, 103), []);
  const W = 330, H = 190;
  const s = useMemo(() => makeScale(data, W, H, 14), [data]);
  const truth = [101.1, 109.1];
  const [lines, setLines] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const tol = 0.9;
  const click = (e: React.PointerEvent<SVGSVGElement>) => {
    if (checked) return;
    const v = s.inv(svgPoint(svg.current!, e.clientX, e.clientY, W, H).y);
    const near = lines.findIndex((l) => Math.abs(l - v) < 0.8);
    if (near >= 0) { setLines(lines.filter((_, k) => k !== near)); sfxRaw.thud(); return; }
    if (lines.length >= 2) { sfx.error(); return; }
    setLines([...lines, v]);
    sfxRaw.pop();
  };
  const hits = truth.map((t) => lines.some((l) => Math.abs(l - t) <= tol));
  const check = () => { setChecked(true); hits.every(Boolean) ? sfx.correct() : sfx.wrong(); };
  return (
    <Asset code="PR-14" title="Support & Resistance" desc="Тапни по графику, чтобы поставить до двух уровней. Повторный тап удаляет линию. Потом сравни с ответом." hint="Отметь дно и потолок диапазона" specs={["tap to place", "tap to remove", "reveal"]}>
      <div className="panel-inset relative p-2 !rounded-2xl">
        <CandleChart data={data} s={s} W={W} H={H} animate={false} svgRef={svg} onPointerDown={click} style={{ cursor: checked ? "default" : "crosshair" }}>
          {(sc) => (
            <>
              {checked && truth.map((t, k) => <g key={k} style={{ animation: "fade-in .4s both" }}><rect x="0" y={sc.y(t + tol)} width={sc.W} height={sc.y(t - tol) - sc.y(t + tol)} fill={k ? BEAR : BULL} opacity=".14" /><text x={sc.W - 6} y={sc.y(t) - 4} textAnchor="end" fontSize="9" fontWeight="900" fill={k ? BEAR : BULL}>{k ? "RESISTANCE" : "SUPPORT"}</text></g>)}
              {lines.map((l, k) => <g key={k} style={{ animation: "pop-in .3s both" }}><line x1="0" x2={sc.W} y1={sc.y(l)} y2={sc.y(l)} stroke="#3b82ff" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 4px #3b82ff)" }} /><circle cx="10" cy={sc.y(l)} r="5" fill="#3b82ff" /></g>)}
            </>
          )}
        </CandleChart>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["Support", "Resistance"].map((n, k) => (
          <div key={n} className={cn("rounded-xl p-2.5 text-center transition", checked ? (hits[k] ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear") : "bg-ink-800 text-mist")}>
            <div className="text-[10px] font-extrabold uppercase">{n}</div>
            <div className="num text-sm font-extrabold">{checked ? (hits[k] ? "✓ found" : `≈ ${truth[k]}`) : "?"}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <GhostBtn className="!h-11 !text-[10px]" onClick={() => { setLines([]); setChecked(false); }}><Target size={13} /> Clear</GhostBtn>
        <Btn tone="bull" className="!h-11 !text-[10px]" disabled={!lines.length || checked} onClick={check} silent>Check levels</Btn>
      </div>
    </Asset>
  );
}

export default function Practice2() {
  return (
    <Section id="practice2" index="P2" title="Practice Arena · Part 2" subtitle="Конструктор, риск-менеджмент, drag&drop, реплей, новости, словарь, уровни">
      <Replay />
      <CandleBuilder />
      <PositionSizer />
      <OrderSorter />
      <Sequence />
      <NewsImpact />
      <TermGuess />
      <SRLevels />
    </Section>
  );
}
