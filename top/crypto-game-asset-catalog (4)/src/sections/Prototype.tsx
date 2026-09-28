import { useEffect, useMemo, useRef, useState } from "react";
import { Btn, Burst, Confetti, Icon, Label, Section, useBump, useCountUp } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

type Screen = "home" | "lesson" | "result" | "league" | "shop" | "profile";
type Log = { id: number; t: string; c: string };

/* ───────── DATA ───────── */

const UNITS_P = [
  { n: 1, t: "Основы крипты", c: ["#2ee59d", "#0b7a4d"], icons: ["coin", "wallet", "gift", "shield", "crown"] },
  { n: 2, t: "Свечной анализ", c: ["#3d8bff", "#1a3aa0"], icons: ["candle", "trendUp", "gift", "target", "crown"] },
  { n: 3, t: "Риск-менеджмент", c: ["#ffc53d", "#a86d00"], icons: ["shield", "lock", "gift", "chart", "crown"] },
];
const OFF = [0, 50, 70, 40, -10];

type Ex =
  | { k: "choice"; q: string; opts: string[]; a: number; tip: string }
  | { k: "words"; pre: string; post: string; bank: string[]; a: string; tip: string }
  | { k: "match"; pairs: [string, string][]; tip: string }
  | { k: "predict"; q: string; a: "up" | "down"; tip: string }
  | { k: "swipe"; q: string; card: string; left: string; right: string; a: "left" | "right"; tip: string };

const LESSON: Ex[] = [
  { k: "choice", q: "Что означает зелёная свеча?", opts: ["Цена закрытия выше открытия", "Цена закрытия ниже открытия", "Объём вырос", "Рынок закрыт"], a: 0, tip: "Зелёная (бычья) свеча — покупатели победили за период." },
  { k: "words", pre: "Стоп-лосс ограничивает твои", post: "в сделке.", bank: ["прибыли", "убытки", "комиссии", "плечо"], a: "убытки", tip: "Стоп-лосс закрывает позицию, когда цена идёт против тебя." },
  { k: "match", pairs: [["HODL", "Держать долго"], ["FOMO", "Страх упустить"], ["DYOR", "Изучи сам"], ["ATH", "Ист. максимум"]], tip: "Сленг помогает понимать крипто-сообщество." },
  { k: "predict", q: "Цена отбилась от поддержки третий раз. Куда дальше?", a: "up", tip: "Многократный отскок от уровня — сильная поддержка." },
  { k: "swipe", q: "RSI = 86. Это…", card: "RSI 86", left: "Перепродан", right: "Перекуплен", a: "right", tip: "RSI выше 70 — зона перекупленности." },
];

/* ───────── HOME (path map with parallax) ───────── */
function Home({ progress, onStart }: { progress: number; onStart: () => void }) {
  const [st, setSt] = useState(0);
  const [pop, setPop] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const UNIT_H = 560;
  const unit = clamp(Math.floor((st + 90) / UNIT_H), 0, UNITS_P.length - 1);
  useEffect(() => {
    const b = box.current;
    const cur = b?.querySelector<HTMLElement>("[data-current]");
    if (cur && b) b.scrollTo({ top: cur.getBoundingClientRect().top - b.getBoundingClientRect().top + b.scrollTop - 260, behavior: "smooth" });
  }, [progress]);
  const U = UNITS_P[unit];
  return (
    <div className="absolute inset-0">
      {/* parallax BG */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2000px]" style={{ transform: `translateY(${-st * 0.15}px)` }}>
          {Array.from({ length: 60 }).map((_, i) => <span key={i} className="absolute h-1 w-1 rounded-full bg-white/70" style={{ left: `${(i * 37) % 100}%`, top: (i * 83) % 2000, animation: `twinkle ${2 + (i % 4)}s ease-in-out ${i * 0.1}s infinite` }} />)}
        </div>
        <div className="absolute inset-x-0 top-0 h-[2400px]" style={{ transform: `translateY(${-st * 0.45}px)` }}>
          {Array.from({ length: 14 }).map((_, i) => <span key={i} className="absolute rounded-md" style={{ left: i % 2 ? "84%" : "4%", top: 120 + i * 160, width: 10, height: 30 + (i % 3) * 20, background: i % 3 ? "#1a2e66" : "#12a46a55" }} />)}
        </div>
      </div>
      {/* sticky unit banner */}
      <div className="absolute inset-x-3 top-[86px] z-20">
        <div key={unit} className="flex items-center justify-between rounded-2xl p-3" style={{ background: `linear-gradient(135deg, ${U.c[0]}, ${U.c[1]})`, boxShadow: `0 5px 0 ${U.c[1]}`, animation: "screenUp .35s cubic-bezier(.3,1.4,.5,1) both" }}>
          <div><div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-900/70">Unit {U.n}</div><div className="text-base font-extrabold text-ink-900">{U.t}</div></div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink-900/15"><Icon name="book" size={20} stroke={2.6} className="text-ink-900" /></span>
        </div>
      </div>
      <div ref={box} onScroll={(e) => { setSt(e.currentTarget.scrollTop); setPop(null); }} className="no-scrollbar absolute inset-0 overflow-y-auto pb-28 pt-[170px]">
        {UNITS_P.map((u, ui) => (
          <div key={u.n} className="relative" style={{ height: UNIT_H }}>
            {ui > 0 && (
              <div className="mx-6 mb-8 flex items-center gap-3">
                <span className="h-px flex-1 bg-ink-600" /><span className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">{u.t}</span><span className="h-px flex-1 bg-ink-600" />
              </div>
            )}
            <div className="flex flex-col items-center gap-6">
              {u.icons.map((ic, i) => {
                const gi = ui * 5 + i;
                const s = gi < progress ? "done" : gi === progress ? "cur" : "lock";
                const col = s === "done" ? ["#ffc53d", "#cc8a00"] : s === "cur" ? u.c : ["#22376f", "#132250"];
                const isChest = ic === "gift", isBoss = ic === "crown";
                return (
                  <div key={i} className="relative" style={{ transform: `translateX(${OFF[i] * (ui % 2 ? -1 : 1)}px)` }} {...(s === "cur" ? { "data-current": true } : {})}>
                    {s === "cur" && <span className="absolute inset-0 rounded-full border-4" style={{ borderColor: u.c[0], animation: "pulseRing 1.6s infinite" }} />}
                    {s === "cur" && pop === null && <div className="absolute -top-9 left-1/2 z-10 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase shadow-[0_3px_0_#c3cdea]" style={{ color: u.c[1], animation: "bob 1.4s ease-in-out infinite" }}>Start<span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-white" /></div>}
                    <button onClick={() => { if (s === "lock") { feel("lock", 20); return; } setPop(pop === gi ? null : gi); feel("pop", 8); }}
                      className={cn("relative grid place-items-center rounded-full transition-transform active:translate-y-1.5", s === "lock" && "active:animate-none")}
                      style={{ width: isBoss ? 76 : 64, height: isBoss ? 70 : 58, background: `radial-gradient(circle at 50% 30%, ${col[0]}, ${col[0]} 60%)`, boxShadow: `0 6px 0 ${col[1]}, 0 12px 18px -6px #000a, inset 0 2px 0 #fff5` }}>
                      {s === "done" ? <Icon name={isChest ? "gift" : isBoss ? "crown" : "star"} size={28} variant="solid" className="text-white" />
                        : s === "cur" ? <Icon name={ic} size={28} stroke={2.8} className="text-ink-900" />
                        : <Icon name={isChest || isBoss ? ic : "lock"} size={24} className="text-ink-400" />}
                    </button>
                    {pop === gi && (
                      <div className="absolute left-1/2 top-full z-30 mt-4 w-52 -translate-x-1/2 rounded-2xl p-3" style={{ background: s === "done" ? "#cc8a00" : u.c[0], boxShadow: `0 5px 0 ${s === "done" ? "#8a5c00" : u.c[1]}`, animation: "scaleIn .25s cubic-bezier(.3,1.5,.5,1) both", transformOrigin: "top" }}>
                        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45" style={{ background: s === "done" ? "#cc8a00" : u.c[0] }} />
                        <div className="text-sm font-extrabold text-ink-900">{isChest ? "Сундук" : isBoss ? "Босс юнита" : `Урок ${gi + 1}`}</div>
                        <div className="mb-2 text-[11px] font-bold text-ink-900/70">{s === "done" ? "Пройдено · повторить" : "5 упражнений · +15 XP"}</div>
                        <button onClick={onStart} className="w-full rounded-xl bg-white py-2 text-xs font-extrabold uppercase tracking-wider shadow-[0_4px_0_#c3cdea] active:translate-y-1 active:shadow-none" style={{ color: u.c[1] }}>{s === "done" ? "Practice" : "Start +15 XP"}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {ui === 0 && <div className="absolute right-3 top-40"><Mascot mood="idle" size={70} className="anim-float" /></div>}
            {ui === 1 && <div className="absolute left-2 top-56"><Mascot mood="think" size={62} className="anim-float" /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── LESSON ───────── */
function Lesson({ onExit, onDone, log }: { onExit: () => void; onDone: (r: { correct: number; total: number; time: number }) => void; log: (t: string, c: string) => void }) {
  const game = useGame();
  const [idx, setIdx] = useState(0);
  const [sel, setSel] = useState<number | string | null>(null);
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboK, setComboK] = useState(0);
  const [shake, setShake] = useState(0);
  const [matched, setMatched] = useState<string[]>([]);
  const [left, setLeft] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [sw, setSw] = useState(0);
  const [swFly, setSwFly] = useState<0 | 1 | -1>(0);
  const [conf, setConf] = useState(0);
  const t0 = useRef(performance.now());
  const ex = LESSON[idx];
  const rightCol = useMemo(() => (ex.k === "match" ? [...ex.pairs.map((p) => p[1])].sort((a, b) => a.localeCompare(b)) : []), [ex]);

  const finish = (ok: boolean) => {
    setStatus(ok ? "ok" : "bad");
    game.addCombo(ok);
    if (ok) {
      setCorrect((c) => c + 1);
      const nc = combo + 1;
      setCombo(nc);
      if (nc >= 2) setComboK((k) => k + 1);
      if (nc >= 3) setConf((c) => c + 1);
      feel("success", 15);
      log(`✓ Упражнение ${idx + 1} верно${nc >= 2 ? ` · combo ×${nc}` : ""}`, "#2ee59d");
    } else {
      setCombo(0); setShake((s) => s + 1); game.loseHeart(); feel("error", [30, 40, 30]);
      log(`✗ Ошибка в упражнении ${idx + 1} · −1 ❤`, "#ff4d6a");
    }
  };
  const check = () => {
    if (ex.k === "choice") finish(sel === ex.a);
    else if (ex.k === "words") finish(sel === ex.a);
    else if (ex.k === "predict") finish(sel === ex.a);
  };
  const next = () => {
    if (idx === LESSON.length - 1) { onDone({ correct, total: LESSON.length, time: (performance.now() - t0.current) / 1000 }); return; }
    setIdx(idx + 1); setSel(null); setStatus("idle"); setMatched([]); setLeft(null); setSw(0); setSwFly(0);
    sfx.play("whoosh");
  };
  const tapMatch = (side: "l" | "r", v: string) => {
    if (ex.k !== "match" || status !== "idle") return;
    if (side === "l") { setLeft(v); sfx.play("tap"); return; }
    if (!left) { feel("lock"); return; }
    const pair = ex.pairs.find((p) => p[0] === left);
    if (pair && pair[1] === v) {
      const nm = [...matched, left, v];
      setMatched(nm); setLeft(null); feel("pop", 8);
      if (nm.length === ex.pairs.length * 2) window.setTimeout(() => finish(true), 300);
    } else {
      setWrongPair([left, v]); setLeft(null); feel("error", 20);
      window.setTimeout(() => setWrongPair([]), 450);
    }
  };
  const onSwipe = useDrag({
    onMove: (d) => { if (status === "idle") setSw(d.dx); },
    onEnd: (d) => {
      if (ex.k !== "swipe" || status !== "idle") return;
      if (Math.abs(d.dx) > 80 || Math.abs(d.vx) > 12) {
        const dir = (d.dx || d.vx) > 0 ? 1 : -1;
        setSwFly(dir as 1 | -1); feel("swipe");
        window.setTimeout(() => finish((dir > 0 ? "right" : "left") === ex.a), 250);
      } else setSw(0);
    },
  });
  const prog = (idx + (status !== "idle" ? 1 : 0)) / LESSON.length;
  const canCheck = sel !== null && (ex.k === "choice" || ex.k === "words" || ex.k === "predict");

  return (
    <div className="absolute inset-0 flex flex-col px-4 pb-4 pt-10">
      <Confetti trigger={conf} count={40} />
      <div className="flex items-center gap-3">
        <button onClick={onExit} className="text-ink-400 hover:text-white"><Icon name="x" size={22} stroke={2.8} /></button>
        <div className="well relative h-4 flex-1 overflow-hidden rounded-full">
          <div className="relative h-full rounded-full bg-gradient-to-b from-bull to-bull-edge transition-[width] duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ width: `${Math.max(4, prog * 100)}%` }}>
            <span className="absolute left-2 right-2 top-[3px] h-1 rounded-full bg-white/40" />
          </div>
        </div>
        <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon key={game.hearts} name="heart" size={20} variant="solid" className="anim-pop" />{game.hearts}</span>
      </div>
      {combo >= 2 && <div key={comboK} className="pointer-events-none absolute left-1/2 top-20 z-30 flex items-center gap-1 rounded-full bg-flame px-3 py-1 text-sm font-extrabold text-white shadow-[0_3px_0_#a33a0d]" style={{ animation: "comboIn 1.4s ease both" }}><Icon name="flame" size={16} variant="solid" />{combo} in a row!</div>}

      <div key={idx} className="mt-5 flex flex-1 flex-col" style={{ animation: "screenIn .35s cubic-bezier(.3,1.2,.5,1) both" }}>
        <div className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-violet">{{ choice: "Выбери ответ", words: "Заполни пропуск", match: "Найди пары", predict: "Сделай прогноз", swipe: "Свайпни карту" }[ex.k]}</div>
        <div key={shake} className={cn("flex flex-1 flex-col", shake && status === "bad" && "anim-shake")}>
          {ex.k === "choice" && (<>
            <div className="mb-4 flex items-start gap-2"><Mascot mood="think" size={56} /><div className="flex-1 rounded-2xl rounded-tl-md border-2 border-ink-600 p-3 text-sm font-extrabold text-white">{ex.q}</div></div>
            <div className="space-y-2.5">
              {ex.opts.map((o, i) => {
                const isSel = sel === i;
                const showOk = status !== "idle" && i === ex.a;
                const showBad = status === "bad" && isSel;
                return <button key={o} disabled={status !== "idle"} onClick={() => { setSel(i); sfx.play("tap"); }} className={cn("w-full rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-all active:translate-y-1", showOk ? "border-bull bg-bull/15 text-bull shadow-[0_4px_0_#12a46a]" : showBad ? "border-bear bg-bear/15 text-bear shadow-[0_4px_0_#c21f43]" : isSel ? "border-sky bg-sky/15 text-white shadow-[0_4px_0_#1e56c9]" : "border-ink-600 bg-ink-800 text-ink-100 shadow-[0_4px_0_#0b1638]")}>{o}</button>;
              })}
            </div>
          </>)}
          {ex.k === "words" && (<>
            <div className="mb-5 flex items-center gap-2"><Mascot mood="idle" size={56} /><div className="text-xs font-bold text-ink-300">Подбери слово</div></div>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-lg font-extrabold leading-relaxed text-white">
              {ex.pre}
              <button onClick={() => status === "idle" && setSel(null)} className={cn("min-w-[90px] rounded-xl border-b-2 px-3 py-1 text-center transition-all", sel ? (status === "ok" ? "border-bull bg-bull/15 text-bull" : status === "bad" ? "border-bear bg-bear/15 text-bear" : "border-sky bg-sky/15 text-sky anim-pop") : "border-dashed border-ink-400 text-transparent")}>{sel ?? "____"}</button>
              {ex.post}
            </div>
            <div className="flex flex-wrap justify-center gap-2 border-t-2 border-ink-700 pt-5">
              {ex.bank.map((w) => <button key={w} disabled={status !== "idle" || sel === w} onClick={() => { setSel(w); sfx.play("pop"); }} className={cn("rounded-xl border-2 border-ink-600 px-4 py-2 text-sm font-extrabold transition-all active:translate-y-1", sel === w ? "bg-ink-800 text-transparent shadow-none" : "bg-ink-700 text-white shadow-[0_4px_0_#0b1638]")}>{w}</button>)}
            </div>
          </>)}
          {ex.k === "match" && (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-2.5">{ex.pairs.map(([l]) => <button key={l} onClick={() => tapMatch("l", l)} disabled={matched.includes(l)} className={cn("h-14 w-full rounded-2xl border-2 font-mono text-sm font-extrabold transition-all active:translate-y-1", matched.includes(l) ? "border-bull/40 bg-bull/10 text-bull/60 shadow-none" : wrongPair.includes(l) ? "anim-shake border-bear bg-bear/15 text-bear" : left === l ? "border-sky bg-sky/15 text-white shadow-[0_4px_0_#1e56c9]" : "border-ink-600 bg-ink-800 text-white shadow-[0_4px_0_#0b1638]")}>{l}</button>)}</div>
              <div className="space-y-2.5">{rightCol.map((r) => <button key={r} onClick={() => tapMatch("r", r)} disabled={matched.includes(r)} className={cn("h-14 w-full rounded-2xl border-2 px-2 text-xs font-bold transition-all active:translate-y-1", matched.includes(r) ? "border-bull/40 bg-bull/10 text-bull/60 shadow-none" : wrongPair.includes(r) ? "anim-shake border-bear bg-bear/15 text-bear" : "border-ink-600 bg-ink-800 text-ink-100 shadow-[0_4px_0_#0b1638]")}>{r}</button>)}</div>
            </div>
          )}
          {ex.k === "predict" && (<>
            <div className="mb-3 text-sm font-extrabold text-white">{ex.q}</div>
            <svg viewBox="0 0 240 130" className="well w-full rounded-2xl">
              <line x1="0" x2="240" y1="100" y2="100" stroke="#ffc53d" strokeWidth="2" strokeDasharray="6 4" />
              <text x="4" y="115" fontSize="9" fontWeight="800" fill="#ffc53d">SUPPORT</text>
              <path d="M10 40 L35 70 L55 98 L75 60 L95 50 L115 98 L135 66 L155 72 L175 99 L190 88" fill="none" stroke="#5ce1ff" strokeWidth="3" strokeLinejoin="round" />
              {[55, 115, 175].map((x) => <circle key={x} cx={x} cy="99" r="5" fill="none" stroke="#ffc53d" strokeWidth="2" />)}
              {sel && <path d={sel === "up" ? "M190 88 L230 40" : "M190 88 L230 124"} stroke={status === "idle" ? "#fff" : status === "ok" ? "#2ee59d" : "#ff4d6a"} strokeWidth="3" strokeDasharray="5 4" style={{ animation: "fadeIn .3s both" }} />}
              <text x="210" y="70" fontSize="18" fontWeight="800" fill="#8fa0cf">?</text>
            </svg>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["up", "down"] as const).map((d) => <button key={d} disabled={status !== "idle"} onClick={() => { setSel(d); sfx.play("tap"); }} className={cn("flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 font-extrabold uppercase transition-all active:translate-y-1", sel === d ? (d === "up" ? "border-bull bg-bull/15 text-bull shadow-[0_4px_0_#12a46a]" : "border-bear bg-bear/15 text-bear shadow-[0_4px_0_#c21f43]") : "border-ink-600 bg-ink-800 text-ink-200 shadow-[0_4px_0_#0b1638]")}><Icon name={d === "up" ? "trendUp" : "trendDown"} size={26} stroke={2.8} />{d}</button>)}
            </div>
          </>)}
          {ex.k === "swipe" && (<>
            <div className="mb-4 text-center text-lg font-extrabold text-white">{ex.q}</div>
            <div className="relative mx-auto h-56 w-48">
              <div onPointerDown={onSwipe} className={cn("absolute inset-0 flex cursor-grab touch-none select-none flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-ink-600 to-ink-700 shadow-[0_6px_0_#0b1638]", (swFly || sw === 0) && "transition-transform duration-300")} style={{ transform: `translateX(${swFly ? swFly * 300 : sw}px) rotate(${(swFly ? swFly * 300 : sw) / 12}deg)` }}>
                <div className="font-mono text-4xl font-extrabold" style={{ color: "#ff8a3d" }}>{ex.card}</div>
                <div className="mt-2 h-3 w-32 overflow-hidden rounded-full bg-ink-900"><div className="h-full w-[86%] rounded-full bg-gradient-to-r from-bull via-gold to-bear" /></div>
                <div className="absolute left-3 top-3 rounded-lg border-2 border-sky px-2 text-xs font-extrabold text-sky" style={{ opacity: clamp(-sw / 70, 0, 1) }}>{ex.left}</div>
                <div className="absolute right-3 top-3 rounded-lg border-2 border-flame px-2 text-xs font-extrabold text-flame" style={{ opacity: clamp(sw / 70, 0, 1) }}>{ex.right}</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs font-extrabold"><span className="text-sky">← {ex.left}</span><span className="text-flame">{ex.right} →</span></div>
          </>)}
        </div>
      </div>

      {status === "idle" && (ex.k === "choice" || ex.k === "words" || ex.k === "predict") && <Btn v="bull" block disabled={!canCheck} onClick={check}>Check</Btn>}
      {status !== "idle" && (
        <div className={cn("absolute inset-x-0 bottom-0 z-40 rounded-t-3xl p-4", status === "ok" ? "bg-[#0f3b33]" : "bg-[#3d1628]")} style={{ animation: "slideUp .35s cubic-bezier(.2,1.2,.4,1) both" }}>
          <div className="mb-3 flex items-center gap-3">
            <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full anim-pop", status === "ok" ? "bg-bull text-ink-900" : "bg-bear text-white")}><Icon name={status === "ok" ? "check" : "x"} size={24} stroke={3.4} /></span>
            <div><div className={cn("text-base font-extrabold", status === "ok" ? "text-bull" : "text-bear")}>{status === "ok" ? ["Отлично!", "Супер!", "В точку!"][idx % 3] : "Неверно"}</div><div className="text-[11px] font-semibold text-ink-200">{ex.tip}</div></div>
          </div>
          <Btn v={status === "ok" ? "bull" : "bear"} block onClick={next}>{idx === LESSON.length - 1 ? "Finish" : "Continue"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────── RESULT ───────── */
function Result({ r, onContinue }: { r: { correct: number; total: number; time: number }; onContinue: (x: number, y: number) => void }) {
  const xpT = 10 + r.correct * 5;
  const acc = Math.round((r.correct / r.total) * 100);
  const xp = useCountUp(xpT, 1400);
  const ac = useCountUp(acc, 1600);
  const tm = useCountUp(r.time, 1800);
  const [chest, setChest] = useState(false);
  const [b, bump] = useBump();
  useEffect(() => { sfx.play("levelup"); }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center px-5 pb-5 pt-14 text-center">
      <Confetti trigger={1} count={60} />
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "repeating-conic-gradient(#ffc53d33 0 10deg, transparent 10deg 30deg)", animation: "rays 10s linear infinite", maskImage: "radial-gradient(circle, #000 25%, transparent 65%)" }} />
        <Mascot mood={acc >= 80 ? "happy" : "cool"} size={120} className="anim-pop relative" />
      </div>
      <div className="anim-pop mt-3 text-3xl font-extrabold text-gold text-glow-gold">{acc === 100 ? "Perfect lesson!" : "Lesson complete!"}</div>
      <div className="mt-6 grid w-full grid-cols-3 gap-2.5">
        {[
          { l: "Total XP", v: `${Math.round(xp)}`, c: "#ffc53d", e: "#cc8a00", i: "bolt" },
          { l: "Accuracy", v: `${Math.round(ac)}%`, c: "#2ee59d", e: "#12a46a", i: "target" },
          { l: "Time", v: `${Math.floor(tm / 60)}:${String(Math.round(tm % 60)).padStart(2, "0")}`, c: "#3d8bff", e: "#1e56c9", i: "clock" },
        ].map((s, i) => (
          <div key={s.l} className="anim-fade-up overflow-hidden rounded-2xl" style={{ background: s.c, boxShadow: `0 4px 0 ${s.e}`, animationDelay: `${0.3 + i * 0.15}s` }}>
            <div className="py-1 text-[9px] font-extrabold uppercase tracking-widest text-ink-900">{s.l}</div>
            <div className="m-0.5 flex items-center justify-center gap-1 rounded-[14px] bg-ink-900 py-3 font-mono text-base font-extrabold" style={{ color: s.c }}><Icon name={s.i} size={14} variant="solid" />{s.v}</div>
          </div>
        ))}
      </div>
      <button onClick={() => { if (!chest) { setChest(true); bump(); feel("open", 30); } }} className="relative mt-6 flex items-center gap-3 rounded-2xl bg-ink-800 p-3 shadow-[0_4px_0_#081130]" style={{ animation: chest ? undefined : "chestShake 1.2s ease-in-out infinite" }}>
        <Icon name="gift" size={30} variant="duo" className="text-violet" />
        <span className="text-sm font-extrabold text-white">{chest ? "+50 💎 бонус добавлен" : "Открой бонусный сундук"}</span>
        <Burst trigger={b} colors={["#a174ff", "#ffc53d"]} />
      </button>
      <div className="mt-auto w-full"><Btn v="bull" block size="lg" onClick={(e) => onContinue(e.clientX, e.clientY)}>Claim & continue</Btn></div>
    </div>
  );
}

/* ───────── LEAGUE ───────── */
function League() {
  const game = useGame();
  const rows = useMemo(() => {
    const base = [["Satoshi_N", 2140, "#ffc53d"], ["Vitalik.eth", 1980, "#a174ff"], ["CZ_fan", 1610, "#3d8bff"], ["HODLqueen", 1400, "#ff4d6a"], ["DiamondPaws", 1210, "#ff8a3d"], ["MoonBoy", 990, "#5ce1ff"], ["RektRick", 720, "#8fa0cf"]] as [string, number, string][];
    return [...base, ["You", game.xp, "#2ee59d"] as [string, number, string]].sort((a, b) => b[1] - a[1]);
  }, [game.xp]);
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 pb-28 pt-12">
      <div className="mb-4 flex flex-col items-center">
        <div className="flex gap-2">{["#e59a64", "#d7e0f2", "#ffd76a", "#7ee8ff", "#a174ff"].map((c, i) => <span key={c} className={cn("grid place-items-center rounded-2xl transition-transform", i === 3 ? "h-16 w-16 scale-110" : "h-11 w-11 opacity-50")} style={{ background: `linear-gradient(160deg, ${c}, ${c}66)`, clipPath: "polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)" }}><Icon name={i === 4 ? "crown" : "gem"} size={i === 3 ? 26 : 18} variant="solid" className="text-white" /></span>)}</div>
        <div className="mt-3 text-xl font-extrabold text-white">Diamond League</div>
        <div className="text-xs text-ink-400">Топ-3 повышаются · 2д 4ч</div>
      </div>
      {rows.map(([n, xp, c], i) => (
        <div key={n} className={cn("mb-1.5 flex items-center gap-3 rounded-2xl px-3 py-2.5", n === "You" ? "raised ring-2 ring-bull" : "bg-ink-800/50")} style={{ animation: `fadeUp .4s ease ${i * 0.05}s both` }}>
          <span className={cn("w-5 text-center font-mono text-sm font-extrabold", i < 3 ? "text-bull" : "text-ink-400")}>{i + 1}</span>
          <span className="grid h-9 w-9 place-items-center rounded-full text-sm font-extrabold text-ink-900" style={{ background: c }}>{n[0]}</span>
          <span className={cn("flex-1 text-sm font-extrabold", n === "You" ? "text-bull" : "text-white")}>{n}</span>
          <span className="font-mono text-xs font-bold text-ink-300">{xp} XP</span>
        </div>
      ))}
    </div>
  );
}

/* ───────── SHOP ───────── */
const ITEMS = [
  { id: "freeze", t: "Streak Freeze", d: "Сохранит стрик на 1 день", p: 200, i: "snow", c: "#5ce1ff" },
  { id: "hearts", t: "Refill Hearts", d: "Восстановить все жизни", p: 350, i: "heart", c: "#ff4d6a" },
  { id: "boost", t: "2× XP Boost", d: "15 минут двойного опыта", p: 500, i: "bolt", c: "#ffc53d" },
  { id: "skin", t: "Golden Pip", d: "Скин маскота", p: 1000, i: "crown", c: "#ffd76a" },
];
function Shop({ log }: { log: (t: string, c: string) => void }) {
  const game = useGame();
  const [owned, setOwned] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  return (
    <div className="absolute inset-0 overflow-y-auto px-4 pb-28 pt-12">
      <div className="mb-4 flex items-center justify-between"><div className="text-xl font-extrabold text-white">Shop</div><span className="flex items-center gap-1 font-mono text-sm font-extrabold text-violet"><Icon name="gem" size={16} variant="solid" />{game.gems.toLocaleString()}</span></div>
      <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-violet to-sky p-4 shadow-[0_5px_0_#4a24a8]">
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">Super Pipwise</div>
        <div className="text-lg font-extrabold text-white">Безлимитные жизни + без рекламы</div>
        <button className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-extrabold uppercase text-violet-edge shadow-[0_4px_0_#c3cdea] active:translate-y-1">Try 2 weeks free</button>
      </div>
      {ITEMS.map((it, i) => {
        const has = owned.includes(it.id);
        return (
          <div key={it.id} className={cn("mb-2.5 flex items-center gap-3 rounded-2xl bg-ink-800 p-3 shadow-[0_4px_0_#081130] transition-all", flash === it.id && "anim-pop ring-2 ring-bull")} style={{ animation: flash === it.id ? undefined : `fadeUp .4s ease ${i * 0.06}s both` }}>
            <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${it.c}22` }}><Icon name={it.i} size={26} variant="duo" style={{ color: it.c }} /></span>
            <div className="flex-1"><div className="text-sm font-extrabold text-white">{it.t}</div><div className="text-[11px] text-ink-400">{it.d}</div></div>
            <button disabled={has} onClick={() => {
              if (game.spend(it.p)) { setOwned([...owned, it.id]); setFlash(it.id); window.setTimeout(() => setFlash(null), 600); if (it.id === "hearts") game.refillHearts(); log(`🛒 Куплено: ${it.t} (−${it.p} 💎)`, "#a174ff"); }
              else log(`Недостаточно гемов для ${it.t}`, "#ff4d6a");
            }} className={cn("flex items-center gap-1 rounded-xl px-3 py-2 font-mono text-xs font-extrabold transition-all active:translate-y-1", has ? "bg-bull/20 text-bull" : "bg-violet text-white shadow-[0_3px_0_#4a24a8]")}>
              {has ? <><Icon name="check" size={12} stroke={3.4} />Owned</> : <><Icon name="gem" size={12} variant="solid" />{it.p}</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── PROFILE ───────── */
function Profile({ progress }: { progress: number }) {
  const game = useGame();
  const ach = [["rocket", "First Trade", "#e59a64"], ["flame", "7-day Streak", "#ff8a3d"], ["target", "Sharpshooter", "#ffd76a"], ["shield", "Iron Hands", "#d7e0f2"], ["crown", "Whale", "#7ee8ff"]];
  return (
    <div className="absolute inset-0 overflow-y-auto pb-28 pt-12">
      <div className="px-4 text-center">
        <div className="relative mx-auto h-24 w-24 rounded-full p-1" style={{ background: `conic-gradient(#ffc53d ${(game.levelXp / game.levelMax) * 360}deg, #22376f 0)` }}>
          <div className="grid h-full w-full place-items-center rounded-full bg-ink-800"><Mascot mood="cool" size={70} /></div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-lg bg-gold px-2 font-mono text-xs font-extrabold text-ink-900 shadow-[0_2px_0_#cc8a00]">LVL {game.level}</span>
        </div>
        <div className="mt-3 text-xl font-extrabold text-white">You</div>
        <div className="text-xs text-ink-400">Joined March 2025 · Diamond</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 px-4">
        {[["flame", "Streak", `${game.streak}`, "#ff8a3d"], ["bolt", "Total XP", `${game.xp}`, "#ffc53d"], ["book", "Lessons", `${progress}`, "#2ee59d"], ["gem", "Gems", game.gems.toLocaleString(), "#a174ff"]].map(([i, l, v, c]) => (
          <div key={l} className="flex items-center gap-2 rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#081130]"><Icon name={i} size={22} variant="solid" style={{ color: c }} /><div><div className="font-mono text-sm font-extrabold text-white">{v}</div><div className="text-[10px] text-ink-400">{l}</div></div></div>
        ))}
      </div>
      <div className="mt-5 px-4"><Label>Achievements · swipe</Label></div>
      <div className="no-scrollbar snap-x-strict flex gap-3 overflow-x-auto px-4 pb-2">
        {ach.map(([i, t, c], k) => (
          <div key={t} className="flex h-32 w-28 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl bg-ink-800 shadow-[0_4px_0_#081130]" style={{ opacity: k < 3 ? 1 : 0.45 }}>
            <span className="grid h-14 w-14 place-items-center" style={{ clipPath: "polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)", background: `linear-gradient(160deg, ${c}, ${c}66)` }}><Icon name={i} size={24} variant="solid" className="text-white" /></span>
            <span className="text-center text-[11px] font-extrabold text-white">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── MAIN PROTOTYPE ───────── */
export default function Prototype() {
  const game = useGame();
  const [screen, setScreen] = useState<Screen>("home");
  const [progress, setProgress] = useState(1);
  const [res, setRes] = useState<{ correct: number; total: number; time: number } | null>(null);
  const [logs, setLogs] = useState<Log[]>([{ id: 0, t: "Игра загружена. Нажми на зелёный узел!", c: "#8fa0cf" }]);
  const lid = useRef(1);
  const log = (t: string, c: string) => setLogs((l) => [{ id: lid.current++, t, c }, ...l].slice(0, 7));
  const tab = screen === "league" ? 1 : screen === "shop" ? 2 : screen === "profile" ? 3 : 0;
  const inLesson = screen === "lesson" || screen === "result";
  const go = (s: Screen) => { setScreen(s); sfx.play("whoosh"); };
  return (
    <Section id="play" num="00" title="Playable Prototype" subtitle="Полностью играбельная мобильная игра: карта, урок с 5 типами упражнений, результат, лига, магазин, профиль — всё связано с HUD" layout="free">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 space-y-4 lg:order-1">
          <div className="panel p-5">
            <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-bull">How it works</div>
            <ul className="space-y-2.5 text-sm text-ink-200">
              {[
                ["target", "Тапни пульсирующий узел → Start"],
                ["book", "Пройди 5 упражнений: выбор, пропуск, пары, прогноз, свайп"],
                ["flame", "Серия верных ответов = combo + конфетти"],
                ["heart", "Ошибки стоят жизней (видно в шапке)"],
                ["bolt", "XP и гемы летят в верхний HUD"],
              ].map(([i, t]) => <li key={t} className="flex gap-2.5"><Icon name={i} size={18} variant="duo" className="mt-0.5 shrink-0 text-sky" />{t}</li>)}
            </ul>
          </div>
          <div className="panel p-5">
            <Label>Jump to screen</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["home", "lesson", "league", "shop", "profile"] as Screen[]).map((s) => <button key={s} onClick={() => go(s)} className={cn("rounded-xl py-2 text-[11px] font-extrabold uppercase tracking-wider transition", screen === s ? "raised text-white ring-2 ring-sky" : "bg-ink-800 text-ink-400 hover:text-white")}>{s}</button>)}
              <button onClick={() => { setRes({ correct: 5, total: 5, time: 74 }); go("result"); }} className={cn("rounded-xl py-2 text-[11px] font-extrabold uppercase tracking-wider", screen === "result" ? "raised text-white ring-2 ring-sky" : "bg-ink-800 text-ink-400 hover:text-white")}>result</button>
            </div>
          </div>
        </div>

        {/* PHONE */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-[320px]">
            <div className="absolute -inset-12 rounded-full bg-sky/15 blur-3xl" />
            <div className="relative rounded-[50px] bg-gradient-to-b from-ink-600 to-ink-800 p-3 shadow-[0_10px_0_#050b1f,0_40px_80px_-20px_#000,inset_0_1px_0_#ffffff22]">
              <div className="relative h-[640px] overflow-hidden rounded-[40px] bg-ink-900">
                <div className="pointer-events-none absolute left-1/2 top-2 z-[60] h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
                {!inLesson && (
                  <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-ink-900 via-ink-900/95 to-transparent px-5 pb-4 pt-11">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-b from-[#ffb547] to-[#f7931a] text-sm font-extrabold text-white shadow-[0_2px_0_#b36200]">₿</span>
                    <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-flame"><Icon name="flame" size={20} variant="solid" className="anim-flame" />{game.streak}</span>
                    <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-violet"><Icon name="gem" size={18} variant="solid" />{game.gems.toLocaleString()}</span>
                    <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-bear"><Icon name="heart" size={20} variant="solid" />{game.hearts}</span>
                  </div>
                )}
                <div key={screen} className="absolute inset-0" style={{ animation: inLesson ? "screenUp .4s cubic-bezier(.3,1.2,.5,1) both" : "screenIn .35s cubic-bezier(.3,1.2,.5,1) both" }}>
                  {screen === "home" && <Home progress={progress} onStart={() => { go("lesson"); log("▶ Урок начат", "#3d8bff"); }} />}
                  {screen === "lesson" && <Lesson log={log} onExit={() => { go("home"); log("Урок прерван", "#8fa0cf"); }} onDone={(r) => { setRes(r); setScreen("result"); log(`🏁 Урок завершён: ${r.correct}/${r.total}`, "#ffc53d"); }} />}
                  {screen === "result" && res && <Result r={res} onContinue={(x, y) => { game.reward({ xp: 10 + res.correct * 5, gems: 50, x, y }); setProgress((p) => Math.min(14, p + 1)); go("home"); log(`+${10 + res.correct * 5} XP · +50 💎 · узел открыт`, "#2ee59d"); }} />}
                  {screen === "league" && <League />}
                  {screen === "shop" && <Shop log={log} />}
                  {screen === "profile" && <Profile progress={progress} />}
                </div>
                {!inLesson && (
                  <div className="absolute inset-x-0 bottom-0 z-40 flex border-t border-white/5 bg-ink-850/95 px-2 pb-5 pt-2 backdrop-blur">
                    <div className="absolute top-2 h-11 rounded-xl transition-all duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]" style={{ left: `calc(${tab * 25}% + 14px)`, width: "calc(25% - 12px)", background: `${["#2ee59d", "#ffc53d", "#a174ff", "#3d8bff"][tab]}22`, boxShadow: `inset 0 0 0 2px ${["#2ee59d", "#ffc53d", "#a174ff", "#3d8bff"][tab]}88` }} />
                    {([["home", "home", "#2ee59d"], ["trophy", "league", "#ffc53d"], ["gem", "shop", "#a174ff"], ["user", "profile", "#3d8bff"]] as [string, Screen, string][]).map(([ic, s, c], i) => (
                      <button key={s} onClick={() => go(s)} className="relative z-10 flex h-11 flex-1 items-center justify-center">
                        <Icon name={ic} size={24} variant={tab === i ? "duo" : "line"} style={{ color: tab === i ? c : "#5a70ad" }} className={cn("transition-transform", tab === i && "scale-110")} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-3 space-y-4">
          <div className="panel p-5">
            <div className="mb-3 flex items-center justify-between"><Label className="mb-0">Live event log</Label><span className="relative flex h-2 w-2"><span className="absolute inset-0 rounded-full bg-bull" style={{ animation: "pulseRing 1.4s infinite" }} /><span className="relative h-2 w-2 rounded-full bg-bull" /></span></div>
            <div className="space-y-1.5">
              {logs.map((l) => <div key={l.id} className="anim-fade-up rounded-lg bg-ink-900/60 px-3 py-2 font-mono text-[11px] font-bold" style={{ color: l.c }}>{l.t}</div>)}
            </div>
          </div>
          <div className="panel p-5">
            <Label>Session state</Label>
            <div className="grid grid-cols-2 gap-2 text-center">
              {[["Level", game.level, "#ffc53d"], ["Nodes", progress, "#2ee59d"], ["Hearts", game.hearts, "#ff4d6a"], ["Combo", game.combo, "#ff8a3d"]].map(([l, v, c]) => (
                <div key={l as string} className="raised rounded-xl p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">{l}</div><div key={String(v)} className="anim-pop font-mono text-lg font-extrabold" style={{ color: c as string }}>{v}</div></div>
              ))}
            </div>
            {game.hearts === 0 && <Btn v="bear" size="sm" block className="mt-3" onClick={() => game.refillHearts()}>Refill hearts</Btn>}
          </div>
        </div>
      </div>
    </Section>
  );
}
