import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Bar, Chip, Label, Spinner } from "../components/ui";
import { Mascot } from "../components/art";
import { BearRival } from "../components/art2";
import { useDrag, useLongPress } from "../lib/gestures";
import { particles } from "../lib/particles";
import { tap, sfx, haptic, clamp, fmt } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════ G01 — Swipe deck: Bull or Bear ═══════════════ */
const DECK = [
  { h: "SEC одобрила спотовый ETF на Bitcoin", src: "Reuters · 2 мин", a: "bull" as const, why: "Институциональный приток — классический бычий катализатор." },
  { h: "Крупная биржа приостановила вывод средств", src: "CoinDesk · 5 мин", a: "bear" as const, why: "Страх заражения и паника — давление продавцов." },
  { h: "ФРС неожиданно снизила ставку на 0.5%", src: "Bloomberg · 12 мин", a: "bull" as const, why: "Дешёвые деньги → аппетит к риску растёт." },
  { h: "Кит перевёл 20 000 BTC на биржу", src: "Whale Alert · 1 мин", a: "bear" as const, why: "Депозит на биржу часто = подготовка к продаже." },
  { h: "Ethereum завершил апгрейд без сбоев", src: "The Block · 30 мин", a: "bull" as const, why: "Снятие технического риска поддерживает цену." },
];

export function SwipeDeck() {
  const [i, setI] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [exit, setExit] = useState<0 | 1 | -1>(0);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<null | { ok: boolean; why: string }>(null);
  const ref = useRef<HTMLDivElement>(null);
  const done = i >= DECK.length;

  const decide = (dir: 1 | -1) => {
    if (done || exit) return;
    const card = DECK[i];
    const ok = (dir === 1 ? "bull" : "bear") === card.a;
    setExit(dir);
    setPos({ x: dir * 520, y: pos.y + 40 });
    setLast({ ok, why: card.why });
    if (ok) {
      setScore((s) => s + 1);
      sfx("success");
      haptic([10, 40, 10]);
      particles.burstAt(ref.current, { kind: "star", count: 14, speed: 380, colors: ["#FFC940", "#2BE38B"] });
    } else {
      sfx("error");
      haptic([40, 30, 40]);
    }
    setTimeout(() => {
      setI((v) => v + 1);
      setExit(0);
      setPos({ x: 0, y: 0 });
    }, 260);
  };

  const { onPointerDown, dragging } = useDrag({
    disabled: done,
    onMove: (d) => setPos({ x: d.dx, y: d.dy * 0.4 }),
    onEnd: (d) => {
      if (Math.abs(d.dx) > 110 || Math.abs(d.vx) > 700) decide(d.dx > 0 ? 1 : -1);
      else setPos({ x: 0, y: 0 });
    },
  });

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!ref.current || !ref.current.matches(":hover, :focus-within")) return;
      if (e.key === "ArrowRight") decide(1);
      if (e.key === "ArrowLeft") decide(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const p = clamp(pos.x / 120, -1, 1);
  return (
    <div ref={ref} className="relative" tabIndex={-1}>
      <div className="mb-3 flex items-center justify-between">
        <Chip tone="sky">Новость → реакция рынка</Chip>
        <span className="font-mono text-[11px] text-ink-300">{Math.min(i + 1, DECK.length)}/{DECK.length} · верно <b className="text-bull">{score}</b></span>
      </div>
      <div className="relative mx-auto h-[270px] max-w-sm">
        {/* direction glows */}
        <div className="pointer-events-none absolute inset-y-6 -left-2 w-24 rounded-3xl bg-bear/40 blur-2xl transition-opacity" style={{ opacity: Math.max(0, -p) }} />
        <div className="pointer-events-none absolute inset-y-6 -right-2 w-24 rounded-3xl bg-bull/40 blur-2xl transition-opacity" style={{ opacity: Math.max(0, p) }} />
        {done ? (
          <div className="flex h-full flex-col items-center justify-center text-center animate-zoom-in">
            {score >= 4 ? <Mascot size={110} mood="hype" /> : <BearRival size={110} mood="smug" />}
            <div className="font-display text-lg font-black">{score}/{DECK.length} верно</div>
            <div className="text-[12px] text-ink-400">{score >= 4 ? "Чуешь рынок!" : "Бора смеётся. Ещё раунд?"}</div>
            <Btn s="sm" v="sky" className="mt-3" icon="refresh" onClick={() => { setI(0); setScore(0); setLast(null); }}>Заново</Btn>
          </div>
        ) : (
          DECK.slice(i, i + 3).map((c, k) => {
            const top = k === 0;
            const style = top
              ? { transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x / 14}deg)`, transition: dragging ? "none" : "transform .35s cubic-bezier(.22,1,.36,1)", zIndex: 10 }
              : { transform: `translateY(${k * 12}px) scale(${1 - k * 0.05})`, zIndex: 10 - k, transition: "transform .35s cubic-bezier(.34,1.3,.64,1)" };
            return (
              <div key={i + k} onPointerDown={top ? onPointerDown : undefined} style={{ ...style, touchAction: "none" }}
                className={cn("absolute inset-0 select-none panel flex flex-col p-5", top ? "cursor-grab active:cursor-grabbing" : "opacity-90")}>
                <div className="flex items-center gap-2 text-[11px] font-bold text-ink-400"><Icon name="bell" size={14} />{c.src}</div>
                <div className="mt-4 font-display text-lg font-black leading-snug">{c.h}</div>
                <div className="mt-auto flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-bear"><Icon name="chevL" size={14} stroke={3} />Медведь</span>
                  <span className="text-ink-500">свайп</span>
                  <span className="flex items-center gap-1 text-bull">Бык<Icon name="chevR" size={14} stroke={3} /></span>
                </div>
                {top && (
                  <>
                    <div className="absolute left-5 top-14 rounded-xl border-4 border-bull px-3 py-1 font-display text-2xl font-black text-bull" style={{ opacity: Math.max(0, p), transform: "rotate(-14deg)" }}>BULL</div>
                    <div className="absolute right-5 top-14 rounded-xl border-4 border-bear px-3 py-1 font-display text-2xl font-black text-bear" style={{ opacity: Math.max(0, -p), transform: "rotate(14deg)" }}>BEAR</div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
      {!done && (
        <div className="mt-5 flex items-center justify-center gap-5">
          <Btn s="lg" v="bear" className="w-16 px-0" icon="trendDown" aria-label="Медведь" onClick={() => decide(-1)} />
          <div className="w-44 text-center text-[11px] text-ink-400">
            {last ? <span className={cn("font-bold", last.ok ? "text-bull" : "text-bear")}>{last.ok ? "✓ " : "✕ "}{last.why}</span> : "← → на клавиатуре тоже работают"}
          </div>
          <Btn s="lg" className="w-16 px-0" icon="trendUp" aria-label="Бык" onClick={() => decide(1)} />
        </div>
      )}
    </div>
  );
}

/* ═══════════════ G02 — Drag SL / TP on chart ═══════════════ */
const SERIES = [92, 94, 93, 96, 95, 97, 99, 98, 101, 99, 100, 102, 101, 100];
export function DragLevels() {
  const box = useRef<HTMLDivElement>(null);
  const entry = 100;
  const [sl, setSl] = useState(97);
  const [tp, setTp] = useState(103);
  const [checked, setChecked] = useState<null | boolean>(null);
  const lo = 86, hi = 114, H = 240;
  const y = (p: number) => ((hi - p) / (hi - lo)) * H;
  const priceAt = (clientY: number) => {
    const r = box.current!.getBoundingClientRect();
    return clamp(hi - ((clientY - r.top) / r.height) * (hi - lo), lo + 0.5, hi - 0.5);
  };
  const mk = (set: (v: number) => void) =>
    useDrag({
      threshold: 0,
      onStart: () => haptic(8),
      onMove: (d) => { const v = Math.round(priceAt(d.y) * 2) / 2; set(v); setChecked(null); },
      onEnd: () => sfx("tick"),
    });
  const slDrag = mk(setSl);
  const tpDrag = mk(setTp);
  const risk = entry - sl, reward = tp - entry;
  const valid = sl < entry && tp > entry;
  const rr = valid ? reward / risk : 0;
  const lossUsd = (risk / entry) * 1000;
  const gainUsd = (reward / entry) * 1000;
  const check = () => {
    const ok = valid && rr >= 2 && risk <= 5;
    setChecked(ok);
    if (ok) { sfx("levelup"); haptic([10, 30, 10]); particles.burstAt(box.current, { count: 30 }); } else { sfx("error"); haptic([40, 30, 40]); }
  };
  const handle = ({ p, tone, label, drag }: { p: number; tone: "bull" | "bear"; label: string; drag: ReturnType<typeof useDrag> }) => (
    <div key={label} className="absolute inset-x-0 z-10" style={{ top: y(p) - 14, height: 28, touchAction: "none" }} onPointerDown={drag.onPointerDown}>
      <div className={cn("absolute inset-x-0 top-1/2 border-t-2 border-dashed", tone === "bull" ? "border-bull" : "border-bear")} />
      <button aria-label={label} onKeyDown={(e) => {
        const set = tone === "bull" ? setTp : setSl;
        if (e.key === "ArrowUp") { e.preventDefault(); set(p + 0.5); }
        if (e.key === "ArrowDown") { e.preventDefault(); set(p - 0.5); }
      }}
        className={cn("absolute right-2 top-0 flex h-7 cursor-ns-resize items-center gap-1 rounded-lg px-2 font-mono text-[11px] font-bold text-ink-900 transition-transform", tone === "bull" ? "bg-bull shadow-[0_3px_0_var(--color-bull-d)]" : "bg-bear shadow-[0_3px_0_var(--color-bear-d)]", drag.dragging && "scale-110")}>
        <Icon name="sort" size={12} stroke={3} />{label} {p.toFixed(1)}
      </button>
    </div>
  );
  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="mb-2 text-sm font-bold">Перетащи линии <span className="text-bear">SL</span> и <span className="text-bull">TP</span> — R:R минимум 1:2, риск ≤5%</div>
        <div ref={box} className="well grid-bg relative select-none overflow-hidden" style={{ height: H }}>
          {valid && <div className="absolute inset-x-0 bg-bull/10" style={{ top: y(tp), height: y(entry) - y(tp) }} />}
          {valid && <div className="absolute inset-x-0 bg-bear/10" style={{ top: y(entry), height: y(sl) - y(entry) }} />}
          <svg viewBox={`0 0 280 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <polyline fill="none" stroke="#3D9BFF" strokeWidth="2.5" strokeLinejoin="round" points={SERIES.map((v, k) => `${(k / (SERIES.length - 1)) * 200},${y(v)}`).join(" ")} />
            <circle cx="200" cy={y(entry)} r="5" fill="#fff" />
          </svg>
          <div className="absolute inset-x-0 border-t border-white/60" style={{ top: y(entry) }}><span className="absolute left-2 -top-5 rounded bg-white px-1.5 font-mono text-[10px] font-bold text-ink-900">Вход 100.0</span></div>
          {handle({ p: tp, tone: "bull", label: "TP", drag: tpDrag })}
          {handle({ p: sl, tone: "bear", label: "SL", drag: slDrag })}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="panel-soft p-4 text-center">
          <Label className="mb-1">Risk : Reward</Label>
          <div className={cn("font-display text-4xl font-black tabular-nums", !valid ? "text-ink-500" : rr >= 2 ? "text-bull" : rr >= 1 ? "text-gold" : "text-bear")}>{valid ? `1:${rr.toFixed(1)}` : "—"}</div>
          <Bar value={clamp(rr * 25, 0, 100)} tone={rr >= 2 ? "bull" : rr >= 1 ? "gold" : "bear"} h={10} className="mt-2" />
        </div>
        <div className="well grid grid-cols-2 gap-y-1 p-3 font-mono text-[11px]">
          <span className="text-ink-400">Позиция</span><span className="text-right font-bold">$1 000</span>
          <span className="text-ink-400">Макс. убыток</span><span className="text-right font-bold text-bear">−${fmt(Math.max(0, lossUsd))}</span>
          <span className="text-ink-400">Цель</span><span className="text-right font-bold text-bull">+${fmt(Math.max(0, gainUsd))}</span>
        </div>
        {checked !== null && (
          <div className={cn("rounded-xl p-2.5 text-[12px] font-bold animate-slide-up", checked ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
            {checked ? "Идеальный сетап! +20 XP" : !valid ? "SL должен быть ниже входа, TP — выше" : risk > 5 ? "Слишком далёкий стоп: риск >5%" : "R:R меньше 1:2 — не стоит риска"}
          </div>
        )}
        <Btn block onClick={check} icon="check">Проверить</Btn>
      </div>
    </div>
  );
}

/* ═══════════════ G03 — Hold to confirm + slide to confirm ═══════════════ */
export function HoldConfirm() {
  const btn = useRef<HTMLButtonElement>(null);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const lp = useLongPress(1400, () => {
    setDone(true);
    sfx("levelup");
    haptic([10, 30, 10, 30, 60]);
    particles.burstAt(btn.current, { kind: "confetti", count: 40 });
  }, () => { setShake(Date.now()); sfx("error"); haptic(30); });

  const track = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState(0);
  const [sold, setSold] = useState(false);
  const maxX = () => (track.current ? track.current.clientWidth - 56 : 200);
  const slide = useDrag({
    threshold: 0,
    disabled: sold,
    onMove: (d) => {
      const nx = clamp(d.dx, 0, maxX());
      if (Math.floor(nx / 40) !== Math.floor(knob / 40)) sfx("tick");
      setKnob(nx);
    },
    onEnd: () => {
      if (knob > maxX() * 0.9) { setKnob(maxX()); setSold(true); sfx("success"); haptic([10, 40, 10]); }
      else setKnob(0);
    },
  });
  const r = 26, C = 2 * Math.PI * r;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col items-center text-center">
        <Label>Удержание · вывод средств</Label>
        <button ref={btn} {...lp.handlers} disabled={done} key={shake}
          className={cn("relative flex size-32 select-none items-center justify-center rounded-full transition-transform", done ? "bg-bull text-ink-900 shadow-[0_6px_0_var(--color-bull-d)]" : "bg-ink-750 shadow-[0_6px_0_#0a1430]", lp.holding && "translate-y-1.5 shadow-[0_1px_0_#0a1430] scale-95", shake && "animate-shake")}
          style={{ touchAction: "none" }}>
          <svg viewBox="0 0 60 60" className="absolute inset-0 size-full -rotate-90">
            <circle cx="30" cy="30" r={r} fill="none" stroke="#0a1430" strokeWidth="4" />
            <circle cx="30" cy="30" r={r} fill="none" stroke="var(--color-bull)" strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - lp.progress)} />
          </svg>
          <span className="relative flex flex-col items-center">
            <Icon name={done ? "check" : "lock"} size={30} stroke={2.8} className={done ? "animate-pop" : ""} />
            <span className="mt-1 font-display text-[10px] font-black uppercase">{done ? "Готово" : lp.holding ? `${Math.round(lp.progress * 100)}%` : "Держи"}</span>
          </span>
        </button>
        <div className="mt-3 text-[12px] text-ink-400">{done ? "Вывод $250 подтверждён" : "Защита от случайных нажатий · Space тоже работает"}</div>
        {done && <Btn s="xs" v="ghost" className="mt-2" icon="refresh" onClick={() => { setDone(false); lp.reset(); }}>Сброс</Btn>}
      </div>
      <div className="flex flex-col justify-center">
        <Label>Свайп · продать позицию</Label>
        <div ref={track} className={cn("well relative h-16 overflow-hidden rounded-full p-1", sold && "ring-2 ring-bear/60")}>
          <div className="absolute inset-y-1 left-1 rounded-full bg-gradient-to-r from-bear/10 to-bear/50" style={{ width: knob + 56 }} />
          <div className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-black uppercase tracking-widest text-ink-400" style={{ opacity: 1 - knob / maxX() }}>
            <span className="shine-sweep px-4">Проведи чтобы продать →</span>
          </div>
          {sold && <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-black text-white animate-pop">Продано · +$84.20</div>}
          <div onPointerDown={slide.onPointerDown} style={{ transform: `translateX(${knob}px)`, transition: slide.dragging ? "none" : "transform .4s cubic-bezier(.34,1.56,.64,1)", touchAction: "none" }}
            className="relative z-10 flex size-14 cursor-grab items-center justify-center rounded-full bg-gradient-to-b from-[#FF8FA3] to-bear text-white shadow-[0_4px_0_var(--color-bear-d)] active:cursor-grabbing">
            <Icon name={sold ? "check" : "chevR"} size={24} stroke={3} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-ink-400">
          <span>Отпусти раньше 90% — вернётся</span>
          {sold && <button className="font-bold text-sky" onClick={() => { tap(); setSold(false); setKnob(0); }}>Сброс</button>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ G04 — Drag to reorder ═══════════════ */
const STEPS_OK = ["Анализ графика", "Определить вход", "Поставить стоп-лосс", "Рассчитать размер", "Открыть позицию", "Вести журнал"];
const ROW = 58;
function SortRow({ label, idx, shift, active, dy, onStart, onMove, onEnd, state }: {
  label: string; idx: number; shift: number; active: boolean; dy: number; state?: "ok" | "bad";
  onStart: () => void; onMove: (dy: number) => void; onEnd: () => void;
}) {
  const d = useDrag({ threshold: 2, onStart, onMove: (i) => onMove(i.dy), onEnd });
  return (
    <div onPointerDown={d.onPointerDown} style={{ transform: `translateY(${active ? dy : shift}px) scale(${active ? 1.03 : 1})`, transition: active ? "none" : "transform .25s cubic-bezier(.22,1,.36,1)", zIndex: active ? 20 : 1, top: idx * ROW, touchAction: "none" }}
      className={cn("absolute inset-x-0 flex h-[50px] cursor-grab items-center gap-3 rounded-2xl border-2 bg-ink-750 px-3 active:cursor-grabbing",
        active ? "border-sky shadow-[0_14px_30px_-6px_rgba(0,0,0,.7)]" : state === "ok" ? "border-bull/70 shadow-[0_4px_0_var(--color-bull-d)]" : state === "bad" ? "border-bear/70 shadow-[0_4px_0_var(--color-bear-d)]" : "border-ink-600 shadow-[0_4px_0_#0e1b3a]")}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-ink-850 font-display text-[11px] font-black text-ink-300">{idx + 1}</span>
      <span className="flex-1 text-[13px] font-bold">{label}</span>
      <Icon name="menu" size={18} className="text-ink-500" />
    </div>
  );
}
export function Reorder() {
  const [items, setItems] = useState(() => [...STEPS_OK].sort(() => Math.random() - 0.5));
  const [drag, setDrag] = useState<null | { from: number; dy: number }>(null);
  const [checked, setChecked] = useState(false);
  const target = drag ? clamp(drag.from + Math.round(drag.dy / ROW), 0, items.length - 1) : -1;
  const shiftFor = (i: number) => {
    if (!drag || i === drag.from) return 0;
    if (drag.from < target && i > drag.from && i <= target) return -ROW;
    if (drag.from > target && i < drag.from && i >= target) return ROW;
    return 0;
  };
  const allOk = items.every((x, i) => x === STEPS_OK[i]);
  return (
    <div>
      <div className="mb-3 text-sm font-bold">Расставь шаги сделки в правильном порядке</div>
      <div className="relative" style={{ height: items.length * ROW }}>
        {items.map((it, i) => (
          <SortRow key={it} label={it} idx={i} active={drag?.from === i} dy={drag?.from === i ? drag.dy : 0} shift={shiftFor(i)}
            state={checked ? (it === STEPS_OK[i] ? "ok" : "bad") : undefined}
            onStart={() => { setChecked(false); setDrag({ from: i, dy: 0 }); haptic(10); sfx("tick"); }}
            onMove={(dy) => setDrag((d) => {
              if (!d) return d;
              const nt = clamp(d.from + Math.round(dy / ROW), 0, items.length - 1);
              const ot = clamp(d.from + Math.round(d.dy / ROW), 0, items.length - 1);
              if (nt !== ot) { sfx("tick"); haptic(6); }
              return { ...d, dy };
            })}
            onEnd={() => {
              setDrag((d) => {
                if (!d) return null;
                const t = clamp(d.from + Math.round(d.dy / ROW), 0, items.length - 1);
                setItems((arr) => { const a = [...arr]; const [m] = a.splice(d.from, 1); a.splice(t, 0, m); return a; });
                return null;
              });
            }} />
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className={cn("flex-1 text-[12px] font-bold", checked ? (allOk ? "text-bull" : "text-bear") : "text-ink-400")}>
          {checked ? (allOk ? "Безупречно! Дисциплина = прибыль." : `Верно ${items.filter((x, i) => x === STEPS_OK[i]).length}/6 — поправь красные`) : "Потяни карточку вверх или вниз"}
        </span>
        <Btn s="sm" v="ghost" icon="refresh" onClick={() => { setItems((a) => [...a].sort(() => Math.random() - 0.5)); setChecked(false); }}>Мешать</Btn>
        <Btn s="sm" onClick={() => { setChecked(true); if (allOk) { sfx("levelup"); haptic([10, 30, 10]); } else { sfx("error"); haptic(30); } }}>Проверить</Btn>
      </div>
    </div>
  );
}

/* ═══════════════ G05 — Bottom sheet with snap points ═══════════════ */
const SNAPS = [{ y: 296, n: "peek" }, { y: 160, n: "half" }, { y: 24, n: "full" }];
export function BottomSheet() {
  const [y, setY] = useState(SNAPS[0].y);
  const [base, setBase] = useState(SNAPS[0].y);
  const d = useDrag({
    threshold: 2,
    onStart: () => setBase(y),
    onMove: (i) => {
      const ny = base + i.dy;
      setY(ny < 24 ? 24 - Math.sqrt(24 - ny) * 3 : ny > 296 ? 296 + Math.sqrt(ny - 296) * 3 : ny);
    },
    onEnd: (i) => {
      const proj = y + i.vy * 0.18;
      const s = SNAPS.reduce((a, b) => (Math.abs(b.y - proj) < Math.abs(a.y - proj) ? b : a));
      setY(s.y);
      setBase(s.y);
      haptic(10);
      sfx("tick");
    },
  });
  const snapName = SNAPS.reduce((a, b) => (Math.abs(b.y - y) < Math.abs(a.y - y) ? b : a)).n;
  const go = (n: number) => { tap(); setY(SNAPS[n].y); setBase(SNAPS[n].y); };
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <div className="relative h-[380px] overflow-hidden rounded-3xl well grid-bg">
        <div className="p-4">
          <div className="font-display text-sm font-bold">BTC/USDT</div>
          <div className="font-mono text-2xl font-bold text-bull">67 412.5</div>
          <svg viewBox="0 0 200 80" className="mt-2 h-24 w-full"><polyline fill="none" stroke="var(--color-bull)" strokeWidth="2.5" points="0,70 20,60 40,64 60,40 80,48 100,30 120,36 140,20 160,26 180,12 200,16" /></svg>
        </div>
        <div className="absolute inset-0 bg-ink-950 transition-opacity" style={{ opacity: ((296 - y) / 272) * 0.6, pointerEvents: "none" }} />
        <div className="absolute inset-x-0 h-[400px] rounded-t-[28px] bg-gradient-to-b from-ink-700 to-ink-800 shadow-[0_-10px_30px_rgba(0,0,0,.5)] ring-1 ring-white/10"
          style={{ transform: `translateY(${y}px)`, transition: d.dragging ? "none" : "transform .45s cubic-bezier(.22,1.2,.36,1)" }}>
          <div onPointerDown={d.onPointerDown} className="cursor-grab px-4 pb-2 pt-3 active:cursor-grabbing" style={{ touchAction: "none" }}>
            <div className="mx-auto h-1.5 w-12 rounded-full bg-ink-400" />
            <div className="mt-3 flex items-center justify-between">
              <div className="font-display text-sm font-black">Открытые позиции</div>
              <Chip tone="bull">+$184</Chip>
            </div>
          </div>
          <div className="space-y-2 px-4">
            {[["BTC Long 10x", "+$142.10", "bull"], ["ETH Short 5x", "−$12.40", "bear"], ["SOL Long 3x", "+$54.50", "bull"], ["TON Long 2x", "+$0.90", "bull"]].map(([a, b, t]) => (
              <div key={a} className="flex items-center gap-3 rounded-2xl bg-ink-850/70 p-3">
                <span className={cn("flex size-9 items-center justify-center rounded-xl", t === "bull" ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}><Icon name={t === "bull" ? "trendUp" : "trendDown"} size={18} /></span>
                <span className="flex-1 text-[13px] font-bold">{a}</span>
                <span className={cn("font-mono text-xs font-bold", t === "bull" ? "text-bull" : "text-bear")}>{b}</span>
              </div>
            ))}
            <Btn block s="sm" v="bear" className="mt-2">Закрыть все</Btn>
          </div>
        </div>
      </div>
      <div className="flex gap-2 sm:flex-col">
        <Label className="hidden sm:block">Snap</Label>
        {SNAPS.map((s, i) => <button key={s.n} onClick={() => go(i)} className={cn("tile3d px-3 py-2 font-mono text-[11px] font-bold")} data-state={snapName === s.n ? "selected" : undefined}>{s.n}</button>)}
        <div className="hidden text-[10px] leading-snug text-ink-500 sm:block">Бросок учитывает<br />скорость пальца</div>
      </div>
    </div>
  );
}

/* ═══════════════ G06 — Pull to refresh ═══════════════ */
export function PullRefresh() {
  const [pull, setPull] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => ["BTC", "ETH", "SOL", "XRP", "TON"].map((s) => ({ s, ch: +(Math.random() * 10 - 4).toFixed(2) })));
  const [flash, setFlash] = useState(0);
  const armed = pull > 70;
  const d = useDrag({
    threshold: 4,
    disabled: loading,
    onMove: (i) => {
      const np = Math.max(0, i.dy) * 0.5;
      const v = np > 110 ? 110 + (np - 110) * 0.2 : np;
      if ((v > 70) !== (pull > 70)) { haptic(12); sfx("tick"); }
      setPull(v);
    },
    onEnd: () => {
      if (pull > 70) {
        setLoading(true);
        setPull(60);
        sfx("whoosh");
        setTimeout(() => {
          setData((arr) => arr.map((x) => ({ ...x, ch: +(Math.random() * 10 - 4).toFixed(2) })));
          setLoading(false);
          setPull(0);
          setFlash(Date.now());
          sfx("success");
        }, 1200);
      } else setPull(0);
    },
  });
  return (
    <div className="mx-auto max-w-sm">
      <div className="relative h-[330px] overflow-hidden rounded-3xl well" onPointerDown={d.onPointerDown} style={{ touchAction: "none" }}>
        <div className="absolute inset-x-0 top-0 flex items-center justify-center" style={{ height: Math.max(pull, 0) }}>
          {loading ? <Spinner className="size-7 text-sky" /> : (
            <div className="flex flex-col items-center" style={{ opacity: Math.min(1, pull / 50) }}>
              <Icon name="refresh" size={24} className={armed ? "text-bull" : "text-ink-300"} style={{ transform: `rotate(${pull * 3}deg)` }} />
              <span className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">{armed ? "Отпусти" : "Потяни"}</span>
            </div>
          )}
        </div>
        <div className="space-y-2 p-3" style={{ transform: `translateY(${pull}px)`, transition: d.dragging ? "none" : "transform .4s cubic-bezier(.34,1.3,.64,1)" }}>
          <div className="px-1 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">Топ движения · 24ч</div>
          {data.map((x, k) => (
            <div key={x.s + flash} className="flex items-center gap-3 rounded-2xl bg-ink-800 p-3 animate-slide-up" style={{ animationDelay: `${k * 50}ms` }}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-ink-700 font-display text-[11px] font-black">{x.s[0]}</span>
              <span className="flex-1 font-display text-xs font-bold">{x.s}</span>
              <span className={cn("rounded-lg px-2 py-0.5 font-mono text-xs font-bold", x.ch >= 0 ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>{x.ch >= 0 ? "+" : ""}{x.ch}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] text-ink-400">Тяни список вниз мышью или пальцем</div>
    </div>
  );
}
