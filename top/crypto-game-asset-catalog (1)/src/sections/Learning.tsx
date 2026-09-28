import { useEffect, useMemo, useState } from "react";
import { X, Check, Flag, Volume2, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";
import { Asset, Section, Btn, Bar, GhostBtn } from "../kit/ui";
import { HeartIcon, FlameIcon } from "../kit/GameIcons";
import { Mascot, type Mood } from "../kit/Mascot";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

function MiniCandle({ up, body = 26, wick = 44 }: { up: boolean; body?: number; wick?: number }) {
  const c = up ? "#22d39a" : "#ff4f6d";
  return (
    <svg width="28" height={wick} viewBox={`0 0 28 ${wick}`}>
      <rect x="13" y="0" width="2" height={wick} rx="1" fill={c} />
      <rect x="6" y={(wick - body) / 2} width="16" height={body} rx="3" fill={c} />
    </svg>
  );
}

const qOptions = [
  { t: "Hammer", s: "Long lower wick after downtrend", ok: true },
  { t: "Shooting star", s: "Long upper wick at top", ok: false },
  { t: "Marubozu", s: "No wicks, full body", ok: false },
  { t: "Spinning top", s: "Small body, equal wicks", ok: false },
];
function Quiz() {
  const [sel, setSel] = useState<number | null>(null);
  const [res, setRes] = useState<null | boolean>(null);
  const [hearts, setHearts] = useState(3);
  const [shake, setShake] = useState(0);
  const check = () => {
    if (sel === null) return;
    const ok = qOptions[sel].ok;
    setRes(ok);
    if (ok) sfx.correct(); else { sfx.wrong(); setHearts((h) => Math.max(0, h - 1)); setShake((s) => s + 1); }
  };
  const reset = () => { setSel(null); setRes(null); sfx.whoosh(); };
  return (
    <Asset code="D-001" title="Quiz Card + Feedback Sheet" desc="Выбор ответа плитками → CHECK → выезжающий лист фидбека (верно/неверно) с объяснением." hint="Ответь неверно, потом верно" specs={["4 tiles", "sheet 350ms", "shake"]} className="xl:row-span-2">
      <div className="relative flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl bg-ink-900/60 p-4">
        <div className="mb-4 flex items-center gap-3">
          <X size={20} className="text-mist" />
          <div className="flex-1"><Bar value={res ? 70 : 55} tone="bull" h={14} /></div>
          <div key={shake} className={cn("flex items-center gap-1", shake && "anim-shake")}>
            <HeartIcon size={22} empty={hearts === 0} />
            <span className="num text-sm font-extrabold text-bear">{hearts}</span>
          </div>
        </div>
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-violet">New pattern</div>
        <h4 className="font-display mb-3 text-base font-bold leading-snug">Which candle signals a bullish reversal?</h4>
        <div className="panel-inset mb-4 flex h-20 items-end justify-center gap-1.5 px-4 pb-2">
          {[40, 34, 30, 22].map((h, i) => <div key={i} style={{ marginBottom: 30 - h / 1.4 }}><MiniCandle up={false} body={h / 1.6} wick={h} /></div>)}
          <div className="relative">
            <svg width="28" height="56" viewBox="0 0 28 56"><rect x="13" y="0" width="2" height="56" rx="1" fill="#ffc53d" /><rect x="6" y="2" width="16" height="12" rx="3" fill="#ffc53d" /></svg>
            <span className="absolute -top-1 -right-2 h-3 w-3 rounded-full bg-gold" style={{ animation: "pulse-ring 1.4s infinite" }} />
          </div>
        </div>
        <div key={shake} className={cn("grid grid-cols-2 gap-2.5", res === false && "anim-shake")}>
          {qOptions.map((o, i) => {
            const picked = sel === i;
            const state = res !== null && picked ? (res ? "ok" : "bad") : picked ? "sel" : "idle";
            const col = state === "ok" ? "#22d39a" : state === "bad" ? "#ff4f6d" : state === "sel" ? "#3b82ff" : "#2c4580";
            return (
              <button
                key={o.t}
                disabled={res !== null}
                onClick={() => { setSel(i); sfx.tick(); }}
                className="rounded-2xl border-2 p-3 text-left transition-all duration-150 active:translate-y-1"
                style={{ borderColor: col, background: state === "idle" ? "#15264a" : `${col}1f`, boxShadow: `0 4px 0 ${state === "idle" ? "#0f1c3a" : col + "99"}`, transform: picked && res === null ? "translateY(2px)" : undefined }}
              >
                <div className="flex items-center justify-between">
                  <span className="num grid h-5 w-5 place-items-center rounded-md border border-white/15 text-[10px] font-bold text-mist">{i + 1}</span>
                  {state === "ok" && <Check size={16} className="anim-pop text-bull" />}
                  {state === "bad" && <X size={16} className="anim-pop text-bear" />}
                </div>
                <div className="mt-1.5 text-[13px] font-extrabold" style={{ color: state === "idle" ? "#e8eeff" : col }}>{o.t}</div>
                <div className="text-[10px] leading-tight text-mist">{o.s}</div>
              </button>
            );
          })}
        </div>
        <div className="mt-auto pt-4">
          <Btn tone="bull" block disabled={sel === null} onClick={check} silent>Check</Btn>
        </div>
        {res !== null && (
          <div className="anim-slide-up absolute inset-x-0 bottom-0 z-10 rounded-t-3xl p-4 pt-5" style={{ background: res ? "linear-gradient(180deg,#0f3b35,#0c2d2a)" : "linear-gradient(180deg,#3d1426,#2e0f1d)", boxShadow: "0 -10px 30px rgba(0,0,0,.5)" }}>
            <div className="flex items-start gap-3">
              <span className={cn("anim-pop grid h-11 w-11 shrink-0 place-items-center rounded-full", res ? "bg-bull" : "bg-bear")}>{res ? <Check size={24} strokeWidth={4} /> : <X size={24} strokeWidth={4} />}</span>
              <div className="min-w-0 flex-1">
                <div className={cn("font-display text-lg font-extrabold", res ? "text-bull" : "text-bear")}>{res ? "Sharp read! +15 XP" : "Not quite"}</div>
                <div className="text-[12px] text-snow/80">{res ? "Hammer = покупатели выкупили падение. Жди подтверждения следующей свечой." : "Правильно: Hammer — длинная нижняя тень после нисходящего тренда."}</div>
              </div>
              <div className="flex gap-2 text-mist"><Flag size={16} /><Volume2 size={16} /></div>
            </div>
            <Btn tone={res ? "bull" : "bear"} block className="mt-4" onClick={reset}>{res ? "Continue" : "Got it"}</Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

type Cndl = { o: number; c: number; h: number; l: number };
const nextCandle = (prev: number): Cndl => {
  const o = prev;
  const c = o + (Math.random() - 0.5) * 16;
  return { o, c, h: Math.max(o, c) + Math.random() * 5, l: Math.min(o, c) - Math.random() * 5 };
};
function Predict() {
  const init = useMemo(() => { const a: Cndl[] = []; let p = 50; for (let i = 0; i < 12; i++) { const c = nextCandle(p); a.push(c); p = c.c; } return a; }, []);
  const [cs, setCs] = useState<Cndl[]>(init);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [last, setLast] = useState<null | boolean>(null);
  const [busy, setBusy] = useState(false);
  const guess = (up: boolean) => {
    if (busy) return;
    setBusy(true);
    const n = nextCandle(cs[cs.length - 1].c);
    const ok = n.c >= n.o === up;
    setCs((a) => [...a.slice(-13), n]);
    setLast(ok);
    if (ok) { setScore((s) => s + 10 + streak * 2); setStreak((s) => s + 1); sfx.correct(); } else { setStreak(0); sfx.wrong(); }
    setTimeout(() => setBusy(false), 450);
  };
  const vals = cs.flatMap((c) => [c.h, c.l]);
  const min = Math.min(...vals), max = Math.max(...vals);
  const y = (v: number) => 130 - ((v - min) / (max - min || 1)) * 120;
  return (
    <Asset code="D-002" title="Predict the Candle" desc="Мини-игра: угадай направление следующей свечи. Комбо-множитель и мгновенная реакция." hint="Жми UP или DOWN" specs={["live chart", "combo", "score"]}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase text-mist">Score</div>
          <div key={score} className="num anim-pop text-2xl font-extrabold text-gold">{score}</div>
        </div>
        <div className={cn("flex items-center gap-1 rounded-xl px-2.5 py-1 transition", streak >= 2 ? "bg-ember/20" : "bg-ink-800")}>
          <FlameIcon size={22} className={streak >= 2 ? "anim-flame" : "opacity-40 grayscale"} />
          <span className="num text-sm font-extrabold text-ember">x{streak}</span>
        </div>
        {last !== null && <span key={cs.length + String(last)} className={cn("anim-pop rounded-lg px-2 py-1 text-[11px] font-extrabold", last ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>{last ? "CORRECT" : "MISSED"}</span>}
      </div>
      <div className="grid-bg panel-inset relative overflow-hidden !rounded-2xl">
        <svg viewBox="0 0 280 140" className="block h-40 w-full">
          {cs.map((c, i) => {
            const x = 12 + i * 19.5, up = c.c >= c.o, col = up ? "#22d39a" : "#ff4f6d";
            const isNew = i === cs.length - 1 && last !== null;
            return (
              <g key={`${i}-${cs.length}`} style={isNew ? { transformOrigin: `${x}px ${y(c.o)}px`, animation: "bar-grow .4s cubic-bezier(.3,1.5,.5,1)" } : undefined}>
                <rect x={x - 0.8} y={y(c.h)} width="1.6" height={Math.max(1, y(c.l) - y(c.h))} fill={col} />
                <rect x={x - 6} y={y(Math.max(c.o, c.c))} width="12" height={Math.max(2, Math.abs(y(c.o) - y(c.c)))} rx="2" fill={col} style={isNew ? { filter: `drop-shadow(0 0 6px ${col})` } : undefined} />
              </g>
            );
          })}
          <line x1="0" x2="280" y1={y(cs[cs.length - 1].c)} y2={y(cs[cs.length - 1].c)} stroke="#ffc53d" strokeDasharray="3 4" strokeWidth="1" />
        </svg>
        <div className="absolute right-2 top-2 rounded-md bg-gold px-1.5 py-0.5 text-[9px] font-extrabold text-ink-900">NEXT?</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn tone="bull" size="lg" onClick={() => guess(true)} silent><ArrowUp size={18} strokeWidth={3} /> Up</Btn>
        <Btn tone="bear" size="lg" onClick={() => guess(false)} silent><ArrowDown size={18} strokeWidth={3} /> Down</Btn>
      </div>
    </Asset>
  );
}

const pairs = [["HODL", "Держать долго"], ["FOMO", "Страх упустить"], ["DCA", "Усреднение"], ["ATH", "Исторический max"]];
function MatchPairs() {
  const right = useMemo(() => [...pairs].sort(() => Math.random() - 0.5).map((p) => p[1]), []);
  const [l, setL] = useState<number | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const pick = (side: "l" | "r", i: number) => {
    if (side === "l") { setL(i); sfx.tick(); return; }
    if (l === null) { sfx.soft(); return; }
    if (pairs[l][1] === right[i]) { setDone((d) => [...d, pairs[l][0]]); setL(null); sfx.correct(); }
    else { setBad([pairs[l][0], right[i]]); sfx.wrong(); setTimeout(() => setBad([]), 500); setL(null); }
  };
  const all = done.length === pairs.length;
  return (
    <Asset code="D-003" title="Match the Pairs" desc="Сопоставь термин и значение. Верно — плитки гаснут, неверно — красная встряска." hint="Выбери слева, потом справа" specs={["tap-tap", "shake", "fade out"]}>
      <div className="grid grid-cols-2 gap-2.5">
        {pairs.map((p, i) => {
          const d = done.includes(p[0]);
          const r = right[i], rd = pairs.some((x) => x[1] === r && done.includes(x[0]));
          return [
            <button key={p[0]} disabled={d} onClick={() => pick("l", i)} className={cn("num h-12 rounded-2xl border-2 text-sm font-extrabold transition-all active:translate-y-1", d ? "border-transparent bg-ink-800/40 text-ink-500 scale-95" : bad.includes(p[0]) ? "anim-shake border-bear bg-bear/15 text-bear" : l === i ? "border-sky bg-sky/15 text-sky shadow-[0_4px_0_#2152c4]" : "border-ink-500 bg-ink-700 shadow-[0_4px_0_#0f1c3a]")}>{p[0]}</button>,
            <button key={r} disabled={rd} onClick={() => pick("r", i)} className={cn("h-12 rounded-2xl border-2 px-2 text-[12px] font-bold transition-all active:translate-y-1", rd ? "border-transparent bg-ink-800/40 text-ink-500 scale-95" : bad.includes(r) ? "anim-shake border-bear bg-bear/15 text-bear" : "border-ink-500 bg-ink-700 shadow-[0_4px_0_#0f1c3a]")}>{r}</button>,
          ];
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1"><Bar value={(done.length / pairs.length) * 100} tone="gold" h={12} /></div>
        {all ? <button onClick={() => { setDone([]); sfx.whoosh(); }} className="anim-pop flex items-center gap-1 text-[11px] font-extrabold text-bull"><RotateCcw size={12} /> again</button> : <span className="num text-[11px] font-bold text-mist">{done.length}/4</span>}
      </div>
    </Asset>
  );
}

const bank = ["low", "high", "panic", "sell", "hold"];
function WordBank() {
  const [slot, setSlot] = useState<string[]>([]);
  const [res, setRes] = useState<null | boolean>(null);
  const toggle = (w: string) => {
    setRes(null);
    if (slot.includes(w)) { setSlot(slot.filter((x) => x !== w)); sfx.soft(); }
    else if (slot.length < 2) { setSlot([...slot, w]); sfx.tick(); }
  };
  const check = () => { const ok = slot[0] === "low" && slot[1] === "high"; setRes(ok); ok ? sfx.correct() : sfx.wrong(); };
  return (
    <Asset code="D-004" title="Word Bank Builder" desc="Собери фразу из слов-плиток — фирменная механика «перевода», но про рынок." hint="Собери: Buy low, sell high" specs={["tap to place", "validate"]}>
      <div className="flex items-start gap-3">
        <Mascot size={72} mood={res === null ? "think" : res ? "happy" : "sad"} />
        <div className="panel-raised relative flex-1 p-3 text-[13px] font-bold">
          <span className="absolute -left-1.5 top-5 h-3 w-3 rotate-45 border-b border-l border-white/10 bg-[#1f3462]" />
          Закончи золотое правило трейдера 👇
        </div>
      </div>
      <div className={cn("mt-4 flex min-h-[64px] flex-wrap items-center gap-2 border-b-2 border-t-2 border-white/5 py-3 text-base font-extrabold", res === false && "anim-shake")}>
        <span>Buy</span>
        <Slot w={slot[0]} onClick={() => slot[0] && toggle(slot[0])} res={res} />
        <span>, sell</span>
        <Slot w={slot[1]} onClick={() => slot[1] && toggle(slot[1])} res={res} />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {bank.map((w) => {
          const used = slot.includes(w);
          return (
            <button key={w} onClick={() => toggle(w)} className={cn("h-11 rounded-xl border-2 px-4 text-sm font-extrabold transition-all", used ? "border-ink-600 bg-ink-800 text-transparent shadow-none" : "border-ink-500 bg-ink-700 shadow-[0_4px_0_#0f1c3a] active:translate-y-1 active:shadow-none")}>{w}</button>
          );
        })}
      </div>
      <Btn tone={res ? "bull" : "sky"} block className="mt-4" disabled={slot.length < 2} onClick={check} silent>{res ? "Perfect!" : "Check"}</Btn>
    </Asset>
  );
}
function Slot({ w, onClick, res }: { w?: string; onClick: () => void; res: null | boolean }) {
  return (
    <button onClick={onClick} className={cn("h-10 min-w-[72px] rounded-xl border-2 border-dashed px-3 text-sm transition-all", w ? cn("anim-pop border-solid shadow-[0_3px_0_#0f1c3a]", res === true ? "border-bull bg-bull/15 text-bull" : res === false ? "border-bear bg-bear/15 text-bear" : "border-sky bg-sky/15 text-white") : "border-ink-400 text-transparent")}>
      {w ?? "___"}
    </button>
  );
}

const tips: Record<Mood, string> = {
  idle: "Я Торо. Научу читать рынок без потерь.",
  happy: "Отличная сделка! Риск под контролем 💪",
  sad: "Стоп-лосс сработал. Это часть игры.",
  think: "Хм… объём падает. Тренд слабеет?",
  hype: "7 дней подряд! Ты в топ-3 лиги 🔥",
};
function MascotAsset() {
  const [m, setM] = useState<Mood>("idle");
  const [typed, setTyped] = useState("");
  useEffect(() => {
    let i = 0;
    setTyped("");
    const t = setInterval(() => { i++; setTyped(tips[m].slice(0, i)); if (i % 3 === 0) sfx.tick(); if (i >= tips[m].length) clearInterval(t); }, 28);
    return () => clearInterval(t);
  }, [m]);
  const moods: { k: Mood; e: string }[] = [{ k: "idle", e: "😐" }, { k: "happy", e: "😄" }, { k: "sad", e: "😢" }, { k: "think", e: "🤔" }, { k: "hype", e: "😎" }];
  return (
    <Asset code="D-005" title="Mentor Mascot «Toro»" desc="Бык-наставник: следит глазами за курсором, 5 эмоций, моргает, печатает подсказки." hint="Води мышкой, меняй эмоцию" specs={["eye-track", "5 moods", "typewriter"]}>
      <div className="flex flex-col items-center">
        <div className="panel-raised relative mb-3 min-h-[56px] w-full p-3 text-center text-[13px] font-bold">
          {typed}<span className="ml-0.5 inline-block h-3.5 w-0.5 translate-y-0.5 bg-sky" style={{ animation: "blink 1s steps(1) infinite" }} />
          <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-[#1a2e57]" />
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-0 rounded-full bg-sky/20 blur-2xl" />
          <Mascot mood={m} size={150} onClick={() => { const ks = moods.map((x) => x.k); setM(ks[(ks.indexOf(m) + 1) % ks.length]); sfx.tap(); }} />
        </div>
        <div className="mt-3 grid w-full grid-cols-5 gap-2">
          {moods.map(({ k, e }) => (
            <button key={k} onClick={() => { setM(k); sfx.tap(); }} className={cn("flex h-12 flex-col items-center justify-center rounded-xl text-lg transition", m === k ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 shadow-[0_3px_0_#08112a] hover:bg-ink-700")}>
              {e}<span className="text-[8px] font-extrabold uppercase">{k}</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

function ComboBar() {
  const [p, setP] = useState(30);
  const [combo, setCombo] = useState(0);
  const [flash, setFlash] = useState<null | "ok" | "bad">(null);
  const hit = (ok: boolean) => {
    setFlash(ok ? "ok" : "bad");
    setTimeout(() => setFlash(null), 400);
    if (ok) { setP((v) => Math.min(100, v + 12)); setCombo((c) => c + 1); combo + 1 >= 3 ? sfx.coin() : sfx.correct(); }
    else { setCombo(0); sfx.wrong(); }
  };
  return (
    <Asset code="D-006" title="Lesson Progress + Combo" desc="Прогресс урока с «комбо»-бейджем: после 3 верных подряд вспыхивает огонь." hint="Серия верных ответов" specs={["combo ≥3", "flash", "700ms"]}>
      <div className={cn("rounded-2xl p-4 transition-colors duration-300", flash === "ok" ? "bg-bull/10" : flash === "bad" ? "bg-bear/10" : "bg-ink-900/50")}>
        <div className="flex items-center gap-3">
          <X size={20} className="text-mist" />
          <div className="relative flex-1">
            <Bar value={p} tone={combo >= 3 ? "ember" : "bull"} h={18} />
            {combo >= 3 && (
              <span key={combo} className="anim-pop absolute -top-7 flex items-center gap-1 rounded-lg bg-ember px-2 py-0.5 text-[10px] font-extrabold shadow-[0_3px_0_#c75a14]" style={{ left: `calc(${p}% - 40px)` }}>
                🔥 {combo} IN A ROW
              </span>
            )}
          </div>
          <span className="num text-xs font-bold text-mist">{p}%</span>
        </div>
        {p >= 100 && <div className="anim-pop mt-3 text-center font-display text-sm font-extrabold text-bull">Lesson complete · +25 XP</div>}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <Btn tone="bull" size="sm" onClick={() => hit(true)} silent>Correct</Btn>
        <Btn tone="bear" size="sm" onClick={() => hit(false)} silent>Wrong</Btn>
        <GhostBtn className="!h-10 !text-[11px]" onClick={() => { setP(0); setCombo(0); }}>Reset</GhostBtn>
      </div>
    </Asset>
  );
}

export default function Learning() {
  return (
    <Section id="learning" index="04" title="Learning Gameplay" subtitle="Механики уроков: квизы, мини-игры, сопоставление, маскот">
      <Quiz />
      <Predict />
      <MascotAsset />
      <MatchPairs />
      <WordBank />
      <ComboBar />
    </Section>
  );
}
