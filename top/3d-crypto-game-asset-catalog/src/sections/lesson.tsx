import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Bar, Confetti, Label, useFloaters } from "../components/ui";
import { Mascot, HeartArt, CoinArt, FlameArt } from "../components/art";
import { tap, sfx, haptic, useCountUp } from "../lib/fx";
import { cn } from "../utils/cn";

/* L01 — Multiple-choice quiz with feedback sheet */
const QS = [
  { q: "Что защищает депозит от большого убытка?", a: ["Тейк-профит", "Стоп-лосс", "Плечо 50x", "Усреднение"], ok: 1, why: "Стоп-лосс закрывает позицию на заданном уровне убытка." },
  { q: "Зелёная свеча означает, что…", a: ["Цена закрытия выше открытия", "Объём вырос", "Цена упала", "Рынок закрыт"], ok: 0, why: "Close > Open — свеча бычья." },
  { q: "Что такое «ликвидность»?", a: ["Цена монеты", "Комиссия биржи", "Лёгкость купить/продать без сдвига цены", "Кол-во монет"], ok: 2, why: "Чем больше ликвидность, тем меньше проскальзывание." },
];
export function Quiz() {
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [hearts, setHearts] = useState(5);
  const [done, setDone] = useState(0);
  const q = QS[i % QS.length];
  const right = sel === q.ok;
  const check = () => {
    setChecked(true);
    if (sel === q.ok) { sfx("success"); haptic(15); setDone((d) => d + 1); }
    else { sfx("error"); haptic([40, 30, 40]); setHearts((h) => Math.max(0, h - 1)); }
  };
  const next = () => { tap(); setI(i + 1); setSel(null); setChecked(false); };
  return (
    <div className="relative overflow-hidden rounded-3xl well p-4 pb-0">
      <div className="flex items-center gap-3">
        <button className="text-ink-400 hover:text-white" onClick={() => { setI(0); setDone(0); setHearts(5); setSel(null); setChecked(false); }} aria-label="reset"><Icon name="x" size={20} stroke={2.6} /></button>
        <Bar value={(done / QS.length) * 100} className="flex-1" h={14} />
        <div className="flex items-center gap-1"><HeartArt size={22} empty={!hearts} className={checked && !right ? "animate-shake" : ""} /><span className="font-display text-sm font-black text-bear">{hearts}</span></div>
      </div>
      <div className="mt-4 flex items-start gap-3">
        <Mascot size={64} mood={checked ? (right ? "happy" : "sad") : "think"} className="shrink-0" />
        <div className="relative mt-2 rounded-2xl border-2 border-ink-600 bg-ink-800 px-3 py-2 text-sm font-bold">
          <span className="absolute -left-2 top-4 size-3 rotate-45 border-b-2 border-l-2 border-ink-600 bg-ink-800" />
          {q.q}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2" key={i}>
        {q.a.map((a, j) => {
          const state = checked ? (j === q.ok ? "correct" : j === sel ? "wrong" : "disabled") : sel === j ? "selected" : undefined;
          return (
            <button key={a} data-state={state} onClick={() => { if (!checked) { tap("tick"); setSel(j); } }}
              className={cn("tile3d flex items-center gap-3 px-3 py-3 text-left text-sm font-bold animate-slide-up", state === "wrong" && "animate-shake")} style={{ animationDelay: `${j * 50}ms` }}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-current/30 font-display text-[11px] opacity-80">{j + 1}</span>{a}
            </button>
          );
        })}
      </div>
      <div className={cn("-mx-4 mt-5 p-4 transition-colors duration-300", checked ? (right ? "bg-bull/15" : "bg-bear/15") : "")}>
        {checked && (
          <div className="mb-3 flex items-center gap-3 animate-slide-up">
            <span className={cn("flex size-10 items-center justify-center rounded-full text-ink-900 animate-pop", right ? "bg-bull" : "bg-bear")}><Icon name={right ? "check" : "x"} size={22} stroke={3.4} /></span>
            <div><div className={cn("font-display text-sm font-black", right ? "text-bull" : "text-bear")}>{right ? "Отлично! +10 XP" : "Не совсем"}</div><div className="text-[12px] text-ink-200">{q.why}</div></div>
          </div>
        )}
        <Btn block s="lg" disabled={sel === null} v={checked && !right ? "bear" : "bull"} onClick={checked ? next : check}>{checked ? "Продолжить" : "Проверить"}</Btn>
      </div>
    </div>
  );
}

/* L02 — Pattern finder: tap the correct candle */
export function PatternFinder() {
  const candles = [
    { o: 60, c: 50 }, { o: 52, c: 44 }, { o: 46, c: 40 }, { o: 42, c: 36 }, { o: 37, c: 33 }, { o: 31, c: 49 }, { o: 48, c: 56 }, { o: 55, c: 62 },
  ];
  const target = 5;
  const [pick, setPick] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [boom, setBoom] = useState(0);
  const choose = (i: number) => {
    if (pick === target) return;
    if (i === target) { setPick(i); sfx("levelup"); haptic([10, 30, 10]); setBoom(Date.now()); }
    else { setWrong((w) => [...w, i]); sfx("error"); haptic(40); }
  };
  const Y = (v: number) => 100 - v;
  return (
    <div className="relative">
      <Confetti fire={boom} />
      <div className="mb-3 text-sm font-bold">Найди <span className="text-bull">бычье поглощение</span> — тапни свечу</div>
      <div className="well grid-bg relative p-2">
        <svg viewBox="0 0 320 90" className="h-44 w-full">
          {candles.map((c, i) => {
            const g = c.c > c.o, x = 20 + i * 38;
            const st = pick === i ? "ok" : wrong.includes(i) ? "bad" : "";
            return (
              <g key={i} onClick={() => choose(i)} className="cursor-pointer" style={{ transformOrigin: `${x}px 50px`, transition: "transform .2s" }}>
                <rect x={x - 16} y="0" width="32" height="90" fill={st === "ok" ? "rgba(43,227,139,.15)" : st === "bad" ? "rgba(255,77,109,.12)" : "transparent"} rx="6" className="hover:fill-white/5" />
                <line x1={x} x2={x} y1={Y(Math.max(c.o, c.c) + 4) - 8} y2={Y(Math.min(c.o, c.c) - 4) - 8} stroke={g ? "#2BE38B" : "#FF4D6D"} strokeWidth="2" />
                <rect x={x - 8} y={Y(Math.max(c.o, c.c)) - 8} width="16" height={Math.abs(c.c - c.o)} rx="2" fill={g ? "#2BE38B" : "#FF4D6D"} opacity={st === "bad" ? 0.4 : 1} />
                {st === "bad" && <text x={x} y="86" textAnchor="middle" fill="#FF4D6D" fontSize="10" fontWeight="900">✕</text>}
                {st === "ok" && <text x={x} y="86" textAnchor="middle" fill="#2BE38B" fontSize="10" fontWeight="900">✓</text>}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[12px] text-ink-400">{pick === target ? <span className="font-bold text-bull">Верно! Тело зелёной полностью «съело» красную.</span> : `Попыток: ${wrong.length}`}</div>
        <Btn s="xs" v="ghost" icon="refresh" onClick={() => { setPick(null); setWrong([]); }}>Заново</Btn>
      </div>
    </div>
  );
}

/* L03 — Match pairs */
const PAIRS = [["HODL", "Держать долго"], ["FOMO", "Страх упустить"], ["ATH", "Исторический max"], ["DCA", "Покупка частями"]];
export function MatchPairs() {
  const [left] = useState(() => PAIRS.map((p) => p[0]));
  const [right, setRight] = useState(() => [...PAIRS.map((p) => p[1])].sort(() => Math.random() - 0.5));
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  useEffect(() => {
    if (!a || !b) return;
    const ok = PAIRS.some(([x, y]) => x === a && y === b);
    if (ok) { sfx("success"); haptic(12); setMatched((m) => [...m, a, b]); setA(null); setB(null); }
    else { sfx("error"); haptic(40); setBad([a, b]); const t = setTimeout(() => { setBad([]); setA(null); setB(null); }, 500); return () => clearTimeout(t); }
  }, [a, b]);
  const st = (v: string, sel: string | null) => (matched.includes(v) ? "disabled" : bad.includes(v) ? "wrong" : sel === v ? "selected" : undefined);
  const all = matched.length === PAIRS.length * 2;
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">{left.map((v) => <button key={v} data-state={st(v, a)} onClick={() => { tap("tick"); setA(v); }} className={cn("tile3d w-full py-3 font-display text-xs font-bold", bad.includes(v) && "animate-shake")}>{v}</button>)}</div>
        <div className="space-y-3">{right.map((v) => <button key={v} data-state={st(v, b)} onClick={() => { tap("tick"); setB(v); }} className={cn("tile3d w-full py-3 text-[12px] font-bold", bad.includes(v) && "animate-shake")}>{v}</button>)}</div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className={cn("text-[12px] font-bold", all ? "text-bull" : "text-ink-400")}>{all ? "Все пары собраны! +15 XP" : `Пар: ${matched.length / 2}/${PAIRS.length}`}</span>
        <Btn s="xs" v="ghost" icon="refresh" onClick={() => { setMatched([]); setRight((r) => [...r].sort(() => Math.random() - 0.5)); }}>Перемешать</Btn>
      </div>
    </div>
  );
}

/* L04 — Up or down prediction */
export function Predict() {
  const [base] = useState([40, 44, 41, 47, 45, 50, 48, 53]);
  const [future, setFuture] = useState<number[]>([]);
  const [guess, setGuess] = useState<"up" | "down" | null>(null);
  const [streak, setStreak] = useState(0);
  const { add, layer } = useFloaters();
  const go = (g: "up" | "down") => {
    setGuess(g); tap("whoosh");
    const dir = Math.random() > 0.45 ? 1 : -1;
    const f: number[] = []; let p = base[base.length - 1];
    for (let i = 0; i < 4; i++) { p += dir * (2 + Math.random() * 4); f.push(p); }
    setTimeout(() => {
      setFuture(f);
      const win = (dir > 0 && g === "up") || (dir < 0 && g === "down");
      if (win) { sfx("coin"); haptic(15); setStreak((s) => s + 1); add("+20", 70, 30, "text-gold"); } else { sfx("error"); haptic(40); setStreak(0); add("−1", 70, 30, "text-bear"); }
    }, 350);
  };
  const all = [...base, ...future];
  const min = 20, max = 80;
  const pts = (arr: number[], off = 0) => arr.map((v, i) => `${(i + off) * 25},${100 - ((v - min) / (max - min)) * 100}`).join(" ");
  const res = future.length ? (future[future.length - 1] > base[base.length - 1] ? "up" : "down") : null;
  return (
    <div className="relative">
      {layer}
      <div className="flex items-center justify-between"><span className="text-sm font-bold">Куда пойдёт цена через 4 свечи?</span><span className="flex items-center gap-1 font-display text-xs font-black text-flame"><FlameArt size={18} />{streak}</span></div>
      <div className="well relative mt-3 overflow-hidden p-2">
        <svg viewBox="0 0 300 100" className="h-36 w-full" preserveAspectRatio="none">
          <line x1="175" x2="175" y1="0" y2="100" stroke="#4d69a8" strokeDasharray="3 3" />
          <polyline points={pts(base)} fill="none" stroke="#3D9BFF" strokeWidth="3" strokeLinejoin="round" />
          {future.length > 0 && <polyline points={pts([base[base.length - 1], ...future], base.length - 1)} fill="none" stroke={res === "up" ? "#2BE38B" : "#FF4D6D"} strokeWidth="3" strokeLinejoin="round" strokeDasharray="200" strokeDashoffset="200" style={{ animation: "dash .8s ease-out forwards" }} />}
        </svg>
        {!future.length && <div className="absolute right-4 top-1/2 -translate-y-1/2 font-display text-3xl font-black text-ink-600">?</div>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {future.length ? (
          <>
            <div className={cn("col-span-1 flex items-center gap-2 font-display text-sm font-black", res === guess ? "text-bull" : "text-bear")}>{res === guess ? "Прогноз верный!" : "Мимо"}</div>
            <Btn s="md" v="sky" icon="refresh" onClick={() => { setFuture([]); setGuess(null); }}>Ещё</Btn>
          </>
        ) : (
          <>
            <Btn s="lg" icon="up" disabled={!!guess} onClick={() => go("up")}>Вверх</Btn>
            <Btn s="lg" v="bear" icon="down" disabled={!!guess} onClick={() => go("down")}>Вниз</Btn>
          </>
        )}
      </div>
      <div className="sr-only">{all.length}</div>
    </div>
  );
}

/* L05 — Lesson complete */
export function LessonComplete() {
  const [run, setRun] = useState(0);
  const xp = useCountUp(run ? 45 : 0, 1200);
  const acc = useCountUp(run ? 92 : 0, 1400);
  useEffect(() => { if (run) { sfx("levelup"); haptic([10, 40, 10, 40, 60]); } }, [run]);
  const stats = [
    { t: "Всего XP", v: Math.round(xp), c: "from-gold to-gold-d", icon: "bolt" as const },
    { t: "Точность", v: `${Math.round(acc)}%`, c: "from-bull to-bull-d", icon: "target" as const },
    { t: "Время", v: "2:41", c: "from-sky to-sky-d", icon: "clock" as const },
  ];
  return (
    <div className="relative text-center">
      <Confetti fire={run} count={40} />
      <div className="relative mx-auto w-fit">
        <div className="absolute inset-0 rounded-full bg-gold/30 blur-2xl" />
        <Mascot size={120} mood={run ? "hype" : "idle"} className={cn("relative", run && "animate-bob")} />
      </div>
      <div className="font-display text-xl font-black text-gold drop-shadow-[0_3px_0_rgba(0,0,0,.4)]">Урок пройден!</div>
      <div className="text-[12px] text-ink-300">Модуль «Свечи» · урок 4/6</div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((s, i) => (
          <div key={s.t} className={cn("rounded-2xl bg-gradient-to-b p-[2px] shadow-[0_4px_0_rgba(0,0,0,.35)]", s.c, run && "animate-pop")} style={{ animationDelay: `${i * 120}ms` }}>
            <div className="rounded-[14px] bg-ink-850 px-1 pb-2 pt-1">
              <div className="text-[9px] font-extrabold uppercase tracking-wider text-white/80">{s.t}</div>
              <div className="mt-1 flex items-center justify-center gap-1 font-display text-lg font-black"><Icon name={s.icon} size={14} stroke={2.6} />{s.v}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-[12px] font-bold text-ink-300"><CoinArt size={20} /> +30 монет <FlameArt size={20} /> стрик 28</div>
      <Label className="mt-3 mb-0">&nbsp;</Label>
      <Btn block s="lg" v={run ? "bull" : "gold"} onClick={() => setRun(Date.now())}>{run ? "Ещё раз праздновать" : "Завершить урок"}</Btn>
    </div>
  );
}
