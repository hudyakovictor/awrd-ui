import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Bar, Chip, Label } from "../components/ui";
import { Mascot, FlameArt, HeartArt } from "../components/art";
import { particles } from "../lib/particles";
import { tap, sfx, haptic, useInterval, clamp, fmt } from "../lib/fx";
import { cn } from "../utils/cn";

/* Shared bottom feedback sheet — Duolingo-style verdict */
function Verdict({ ok, title, body, onNext, cta = "Далее" }: { ok: boolean; title: string; body?: string; onNext: () => void; cta?: string }) {
  return (
    <div className={cn("mt-5 rounded-2xl p-4 animate-slide-up ring-1", ok ? "bg-bull/15 ring-bull/30" : "bg-bear/15 ring-bear/30")}>
      <div className="mb-3 flex items-center gap-3">
        <span className={cn("flex size-10 items-center justify-center rounded-full text-ink-900 animate-pop", ok ? "bg-bull" : "bg-bear")}><Icon name={ok ? "check" : "x"} size={22} stroke={3.4} /></span>
        <div>
          <div className={cn("font-display text-sm font-black", ok ? "text-bull" : "text-bear")}>{title}</div>
          {body && <div className="text-[12px] text-ink-200">{body}</div>}
        </div>
      </div>
      <Btn block s="md" v={ok ? "bull" : "bear"} onClick={onNext}>{cta}</Btn>
    </div>
  );
}

/* ═══════════════ X01 — Word bank sentence builder ═══════════════ */
const SENTENCES = [
  { prompt: "Собери правило риск-менеджмента", answer: ["Никогда", "не", "рискуй", "больше", "2%", "депозита"], extra: ["всегда", "10%", "плеча"] },
  { prompt: "Собери определение шорта", answer: ["Шорт", "—", "это", "ставка", "на", "падение"], extra: ["рост", "покупка", "лонг"] },
];
export function WordBank() {
  const [si, setSi] = useState(0);
  const s = SENTENCES[si % SENTENCES.length];
  const bank = useMemo(() => [...s.answer, ...s.extra].map((w, i) => ({ w, id: i })).sort(() => Math.random() - 0.5), [si]); // eslint-disable-line react-hooks/exhaustive-deps
  const [picked, setPicked] = useState<number[]>([]);
  const [res, setRes] = useState<null | boolean>(null);
  const line = useRef<HTMLDivElement>(null);
  const words = picked.map((id) => bank.find((b) => b.id === id)!.w);
  const check = () => {
    const ok = words.join(" ") === s.answer.join(" ");
    setRes(ok);
    if (ok) { sfx("success"); haptic([10, 40, 10]); particles.burstAt(line.current, { kind: "star", count: 16, speed: 360, colors: ["#FFC940", "#2BE38B"] }); }
    else { sfx("error"); haptic([40, 30, 40]); }
  };
  const next = () => { setSi(si + 1); setPicked([]); setRes(null); tap(); };
  return (
    <div>
      <div className="flex items-start gap-3">
        <Mascot size={60} mood={res === null ? "think" : res ? "happy" : "sad"} />
        <div className="relative mt-1 rounded-2xl border-2 border-ink-600 bg-ink-800 px-3 py-2 text-sm font-bold">
          <span className="absolute -left-2 top-4 size-3 rotate-45 border-b-2 border-l-2 border-ink-600 bg-ink-800" />{s.prompt}
        </div>
      </div>
      <div ref={line} className="mt-4 flex min-h-[104px] flex-wrap content-start gap-2 border-b-2 border-t-2 border-ink-700 py-3" style={{ backgroundImage: "linear-gradient(transparent 49px, rgba(125,147,198,.15) 49px, rgba(125,147,198,.15) 51px, transparent 51px)", backgroundSize: "100% 52px" }}>
        {picked.map((id) => {
          const b = bank.find((x) => x.id === id)!;
          return (
            <button key={id} disabled={res !== null} onClick={() => { tap("tick"); setPicked((p) => p.filter((x) => x !== id)); }}
              className="tile3d h-10 px-3 text-sm font-bold animate-zoom-in">{b.w}</button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {bank.map((b) => {
          const used = picked.includes(b.id);
          return (
            <div key={b.id} className="rounded-2xl bg-ink-850 shadow-[inset_0_2px_4px_rgba(0,0,0,.5)]">
              <button disabled={used || res !== null} onClick={() => { tap("tick"); setPicked((p) => [...p, b.id]); }}
                className={cn("tile3d h-10 px-3 text-sm font-bold transition-opacity", used && "pointer-events-none opacity-0")}>{b.w}</button>
            </div>
          );
        })}
      </div>
      {res === null ? (
        <div className="mt-5 flex gap-3">
          <Btn s="md" v="ghost" onClick={() => setPicked([])} disabled={!picked.length}>Очистить</Btn>
          <Btn s="md" block disabled={!picked.length} onClick={check}>Проверить</Btn>
        </div>
      ) : (
        <Verdict ok={res} title={res ? "Великолепно!" : "Правильный ответ:"} body={res ? "+10 XP · серия 3" : s.answer.join(" ")} onNext={next} />
      )}
    </div>
  );
}

/* ═══════════════ X02 — Risk calculator with 3D numpad ═══════════════ */
export function RiskNumpad() {
  const task = { dep: 2000, risk: 2, stop: 5 }; // answer = 2000*0.02/0.05 = 800
  const answer = (task.dep * task.risk) / 100 / (task.stop / 100);
  const [val, setVal] = useState("");
  const [res, setRes] = useState<null | boolean>(null);
  const [hint, setHint] = useState(false);
  const press = (k: string) => {
    if (res !== null) return;
    tap("tick", 6);
    if (k === "⌫") setVal((v) => v.slice(0, -1));
    else if (k === "C") setVal("");
    else setVal((v) => (v.length < 6 ? (v === "0" ? k : v + k) : v));
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      if (e.key === "Backspace") press("⌫");
    };
    const el = document.getElementById("X02");
    el?.addEventListener("keydown", h);
    return () => el?.removeEventListener("keydown", h);
  });
  const check = () => { const ok = +val === answer; setRes(ok); if (ok) { sfx("levelup"); haptic([10, 30, 10]); } else { sfx("error"); haptic([40, 30, 40]); } };
  return (
    <div className="grid gap-5 sm:grid-cols-2" tabIndex={0}>
      <div>
        <Chip tone="gold">Задача</Chip>
        <div className="mt-3 text-sm font-semibold leading-relaxed text-ink-200">
          Депозит <b className="font-mono text-white">${task.dep}</b>. Риск на сделку <b className="font-mono text-gold">{task.risk}%</b>. Стоп-лосс в <b className="font-mono text-bear">{task.stop}%</b> от входа.
          <br />Какой <b className="text-white">размер позиции</b>?
        </div>
        <div className={cn("well mt-4 flex h-16 items-center justify-end gap-1 px-4 ring-2 transition-colors", res === null ? "ring-sky/40" : res ? "ring-bull" : "ring-bear animate-shake")}>
          <span className="font-display text-xl text-ink-500">$</span>
          <span className="font-mono text-3xl font-bold tabular-nums">{val || <span className="text-ink-600">0</span>}</span>
          <span className="ml-0.5 h-8 w-0.5 animate-pulse bg-sky" />
        </div>
        <button onClick={() => { tap(); setHint(!hint); }} className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-sky"><Icon name="info" size={14} />{hint ? "Скрыть формулу" : "Подсказка (−5 XP)"}</button>
        {hint && <div className="code mt-2 rounded-xl bg-ink-900 p-3 animate-slide-up"><span className="c">// позиция = риск$ / стоп%</span><br /><span className="n">{task.dep}</span> <span className="p">×</span> <span className="n">{task.risk / 100}</span> <span className="p">÷</span> <span className="n">{task.stop / 100}</span></div>}
        {res !== null && (
          <div className={cn("mt-3 rounded-xl p-3 text-[12px] font-bold animate-slide-up", res ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
            {res ? `Верно! Позиция $${answer} → при стопе теряешь ровно $${(task.dep * task.risk) / 100}` : `Ответ: $${answer}. Риск $40 ÷ 5% = $800`}
          </div>
        )}
      </div>
      <div>
        <div className="grid grid-cols-3 gap-2.5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((k) => (
            <button key={k} onClick={() => press(k)} className={cn("key3d h-14 text-xl", (k === "C" || k === "⌫") && "text-ink-300")}>
              {k === "⌫" ? <Icon name="chevL" size={22} stroke={3} className="mx-auto" /> : k}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {res === null ? <Btn block s="lg" disabled={!val} onClick={check}>Проверить</Btn> : <Btn block s="lg" v="sky" icon="refresh" onClick={() => { setVal(""); setRes(null); }}>Ещё раз</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ X03 — Portfolio allocation (linked sliders + donut) ═══════════════ */
const ASSETS = [
  { k: "BTC", c: "#F7931A", risk: 0.6 },
  { k: "ETH", c: "#8C8CFF", risk: 0.7 },
  { k: "Альты", c: "#FF4D6D", risk: 1 },
  { k: "USDT", c: "#2BE38B", risk: 0 },
];
export function Portfolio() {
  const [w, setW] = useState([40, 20, 30, 10]);
  const setOne = (i: number, v: number) => {
    const rest = 100 - v;
    const others = w.map((x, j) => (j === i ? 0 : x));
    const sum = others.reduce((a, b) => a + b, 0) || 1;
    const nw = w.map((_, j) => (j === i ? v : Math.round((others[j] / sum) * rest)));
    const diff = 100 - nw.reduce((a, b) => a + b, 0);
    const fix = nw.findIndex((_, j) => j !== i && nw[j] + diff >= 0);
    if (fix >= 0) nw[fix] += diff;
    setW(nw);
  };
  const risk = Math.round(w.reduce((a, x, i) => a + x * ASSETS[i].risk, 0));
  const target = risk >= 30 && risk <= 50 && w[3] >= 15 && w[2] <= 20;
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  const [wasTarget, setWasTarget] = useState(false);
  useEffect(() => {
    if (target && !wasTarget) { sfx("success"); haptic([10, 40, 10]); }
    setWasTarget(target);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="relative mx-auto size-44">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#081229" strokeWidth="14" />
          {w.map((x, i) => {
            const len = (x / 100) * C;
            const el = <circle key={i} cx="50" cy="50" r={R} fill="none" stroke={ASSETS[i].c} strokeWidth="14" strokeDasharray={`${Math.max(0, len - 1.2)} ${C}`} strokeDashoffset={-acc} style={{ transition: "stroke-dasharray .3s, stroke-dashoffset .3s" }} />;
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">Риск</span>
          <span className={cn("font-display text-3xl font-black", risk > 60 ? "text-bear" : risk > 40 ? "text-gold" : "text-bull")}>{risk}</span>
          {target && <Chip tone="bull" className="animate-pop">цель ✓</Chip>}
        </div>
      </div>
      <div>
        <div className="mb-3 rounded-xl bg-ink-850 p-3 text-[12px] font-semibold text-ink-300">
          <b className="text-white">Задача:</b> сбалансированный портфель — риск 30–50, стейблы ≥15%, альты ≤20%
        </div>
        <div className="space-y-3">
          {ASSETS.map((a, i) => (
            <div key={a.k} className="grid grid-cols-[56px_1fr_44px] items-center gap-3">
              <span className="flex items-center gap-2 text-xs font-bold"><span className="size-3 rounded-full" style={{ background: a.c }} />{a.k}</span>
              <div className="relative">
                <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
                <div className="absolute left-0 top-[11px] h-3 rounded-full" style={{ width: `${w[i]}%`, background: a.c }} />
                <input type="range" className="rng relative" min={0} max={100} value={w[i]} aria-label={a.k}
                  onChange={(e) => { const v = +e.target.value; if (Math.abs(v - w[i]) >= 5 || v % 10 === 0) sfx("tick"); setOne(i, v); }} />
              </div>
              <span className="text-right font-mono text-sm font-bold tabular-nums">{w[i]}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[["Стейблы ≥15%", w[3] >= 15], ["Альты ≤20%", w[2] <= 20], ["Риск 30–50", risk >= 30 && risk <= 50]].map(([t, ok]) => (
            <div key={t as string} className={cn("rounded-xl px-2 py-1.5 text-[10px] font-extrabold transition-colors", ok ? "bg-bull/15 text-bull" : "bg-ink-850 text-ink-500")}>
              {ok ? "✓ " : "○ "}{t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ X04 — Speed round with combo ═══════════════ */
const FACTS = [
  { s: "Стоп-лосс ограничивает убыток", t: true }, { s: "Плечо 100x — безопасно для новичка", t: false },
  { s: "Медвежий рынок — это падение цен", t: true }, { s: "Спред — это комиссия за вывод", t: false },
  { s: "DCA — покупка частями по времени", t: true }, { s: "Зелёная свеча: close < open", t: false },
  { s: "Ликвидность = лёгкость сделки без сдвига цены", t: true }, { s: "Приватный ключ можно отправить поддержке", t: false },
  { s: "Бычье поглощение — сигнал разворота вверх", t: true }, { s: "Диверсификация увеличивает риск", t: false },
];
export function SpeedRound() {
  const [phase, setPhase] = useState<"ready" | "play" | "end">("ready");
  const [time, setTime] = useState(30);
  const [i, setI] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [pts, setPts] = useState(0);
  const [flash, setFlash] = useState<null | boolean>(null);
  const order = useMemo(() => [...FACTS].sort(() => Math.random() - 0.5), [phase === "play"]); // eslint-disable-line react-hooks/exhaustive-deps
  const card = useRef<HTMLDivElement>(null);
  useInterval(() => setTime((t) => { if (t <= 0.1) { setPhase("end"); sfx("levelup"); return 0; } return t - 0.1; }), phase === "play" ? 100 : null);
  const mult = combo >= 8 ? 4 : combo >= 5 ? 3 : combo >= 3 ? 2 : 1;
  const answer = (v: boolean) => {
    if (phase !== "play") return;
    const ok = order[i % order.length].t === v;
    setFlash(ok);
    setTimeout(() => setFlash(null), 220);
    if (ok) {
      const nc = combo + 1;
      setCombo(nc); setBest((b) => Math.max(b, nc)); setPts((p) => p + 10 * mult);
      sfx(nc % 3 === 0 ? "coin" : "success"); haptic(10);
      if (nc === 3 || nc === 5 || nc === 8) particles.burstAt(card.current, { kind: "flame", count: 22, speed: 260 });
    } else { setCombo(0); setTime((t) => Math.max(0, t - 3)); sfx("error"); haptic([40, 30, 40]); }
    setI(i + 1);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (phase !== "play") return; if (e.key === "ArrowLeft") answer(false); if (e.key === "ArrowRight") answer(true); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });
  const start = () => { setPhase("play"); setTime(30); setI(0); setCombo(0); setPts(0); sfx("whoosh"); };
  if (phase === "ready" || phase === "end") return (
    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
      <div className="relative"><div className="absolute inset-0 rounded-full bg-flame/30 blur-2xl" /><FlameArt size={84} className="relative animate-flicker" /></div>
      {phase === "end" ? (
        <>
          <div className="mt-2 font-display text-3xl font-black text-gold animate-pop">{pts} очков</div>
          <div className="text-[12px] text-ink-400">Лучшее комбо: <b className="text-flame">x{best}</b> · ответов: {i}</div>
        </>
      ) : (
        <>
          <div className="mt-2 font-display text-lg font-black">Скоростной раунд</div>
          <div className="max-w-xs text-[12px] text-ink-400">30 секунд. Правда или ложь. Серия умножает очки до x4, ошибка отнимает 3 секунды.</div>
        </>
      )}
      <Btn s="lg" v="flame" icon="bolt" className="mt-5" onClick={start}>{phase === "end" ? "Ещё раз" : "Старт"}</Btn>
    </div>
  );
  const f = order[i % order.length];
  return (
    <div>
      <div className="flex items-center gap-3">
        <div className={cn("font-mono text-lg font-bold tabular-nums", time < 8 ? "text-bear animate-heartbeat" : "text-white")}>{time.toFixed(1)}s</div>
        <Bar value={(time / 30) * 100} tone={time < 8 ? "bear" : "gold"} h={12} className="flex-1" />
        <div className="font-display text-sm font-black text-gold tabular-nums">{pts}</div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((m) => <span key={m} className={cn("rounded-lg px-2 py-0.5 font-display text-[11px] font-black transition-all", mult >= m ? "bg-flame text-white shadow-[0_2px_0_var(--color-flame-d)] scale-110" : "bg-ink-800 text-ink-500")}>x{m}</span>)}
        <span className="ml-2 font-mono text-[11px] text-ink-400">серия {combo}</span>
      </div>
      <div ref={card} key={i} className={cn("panel mt-4 flex min-h-[110px] items-center justify-center p-5 text-center font-display text-base font-bold animate-zoom-in transition-colors",
        flash === true && "ring-4 ring-bull", flash === false && "ring-4 ring-bear")}>{f.s}</div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Btn s="lg" v="bear" icon="x" onClick={() => answer(false)}>Ложь</Btn>
        <Btn s="lg" icon="check" onClick={() => answer(true)}>Правда</Btn>
      </div>
    </div>
  );
}

/* ═══════════════ X05 — Listen & choose (Speech Synthesis) ═══════════════ */
const LISTEN = [
  { w: "Ликвидация", opts: ["Принудительное закрытие позиции", "Вывод средств с биржи", "Покупка на дне"], ok: 0 },
  { w: "Волатильность", opts: ["Объём торгов", "Амплитуда колебаний цены", "Скорость транзакции"], ok: 1 },
  { w: "Проскальзывание", opts: ["Комиссия майнера", "Ошибка в графике", "Разница между ожидаемой и фактической ценой"], ok: 2 },
];
export function ListenTap() {
  const [i, setI] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [sel, setSel] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const q = LISTEN[i % LISTEN.length];
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = (slow = false) => {
    tap();
    if (!canSpeak) { setSpeaking(true); setTimeout(() => setSpeaking(false), 900); return; }
    const u = new SpeechSynthesisUtterance(q.w);
    u.lang = "ru-RU"; u.rate = slow ? 0.55 : 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };
  const pick = (j: number) => {
    if (sel !== null) return;
    setSel(j);
    if (j === q.ok) { sfx("success"); haptic([10, 40, 10]); } else { sfx("error"); haptic([40, 30, 40]); setLives((l) => Math.max(0, l - 1)); }
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="mb-0">Послушай термин и выбери значение</Label>
        <div className="flex gap-0.5">{[0, 1, 2].map((k) => <HeartArt key={k} size={20} empty={k >= lives} />)}</div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button onClick={() => speak()} aria-label="Прослушать" className="btn3d v-sky size-24 rounded-3xl">
          <Icon name="volume" size={40} stroke={2.4} />
        </button>
        <button onClick={() => speak(true)} aria-label="Медленно" className="btn3d v-ink size-14 rounded-2xl text-[10px]">0.5x</button>
        <div className="flex h-16 items-center gap-1" aria-hidden>
          {Array.from({ length: 14 }).map((_, k) => (
            <span key={k} className="w-1.5 rounded-full bg-sky" style={{ height: `${20 + ((k * 37) % 60)}%`, animation: speaking ? `wave ${0.5 + (k % 4) * 0.12}s ease-in-out ${k * 0.04}s infinite` : "none", opacity: speaking ? 1 : 0.3, transformOrigin: "center" }} />
          ))}
        </div>
      </div>
      {!canSpeak && <div className="mt-2 text-center text-[11px] text-ink-500">Синтез речи недоступен — слово: «{q.w}»</div>}
      <div className="mt-5 space-y-2.5" key={i}>
        {q.opts.map((o, j) => (
          <button key={o} onClick={() => pick(j)} className="tile3d flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold animate-slide-up" style={{ animationDelay: `${j * 60}ms` }}
            data-state={sel === null ? undefined : j === q.ok ? "correct" : j === sel ? "wrong" : "disabled"}>
            <span className="flex size-7 items-center justify-center rounded-lg border-2 border-current/30 font-display text-[11px]">{j + 1}</span>{o}
          </button>
        ))}
      </div>
      {sel !== null && (
        <div className="mt-4 flex items-center justify-between animate-slide-up">
          <span className={cn("text-[12px] font-bold", sel === q.ok ? "text-bull" : "text-bear")}>{sel === q.ok ? "Точно! Ты услышал «" + q.w + "»" : "Это было «" + q.w + "»"}</span>
          <Btn s="sm" v="sky" onClick={() => { setI(i + 1); setSel(null); }}>Далее</Btn>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ X06 — Tap to mark support level ═══════════════ */
const PRICES = [64, 58, 52, 47, 55, 61, 56, 48, 46, 53, 60, 57, 49, 47, 58, 66, 70];
export function SupportTap() {
  const box = useRef<HTMLDivElement>(null);
  const [mark, setMark] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const H = 200, lo = 40, hi = 76;
  const y = (p: number) => ((hi - p) / (hi - lo)) * H;
  const truth = 47;
  const ok = mark !== null && Math.abs(mark - truth) <= 2;
  const place = (clientY: number) => {
    if (ok) return;
    const r = box.current!.getBoundingClientRect();
    const p = clamp(hi - ((clientY - r.top) / r.height) * (hi - lo), lo, hi);
    setMark(p);
    setTries((t) => t + 1);
    if (Math.abs(p - truth) <= 2) { sfx("levelup"); haptic([10, 30, 10]); particles.burst(r.left + r.width / 2, clientY, { kind: "spark", count: 30, colors: ["#2BE38B", "#8CFFD0", "#fff"] }); }
    else { sfx("error"); haptic(30); }
  };
  const dist = mark === null ? null : Math.abs(mark - truth);
  return (
    <div>
      <div className="mb-3 text-sm font-bold">Тапни по графику там, где проходит <span className="text-bull">уровень поддержки</span></div>
      <div ref={box} onClick={(e) => place(e.clientY)} className="well grid-bg relative cursor-crosshair overflow-hidden" style={{ height: H }}>
        {ok && <div className="absolute inset-x-0 bg-bull/15 animate-fade" style={{ top: y(truth + 2), height: y(truth - 2) - y(truth + 2) }} />}
        <svg viewBox={`0 0 320 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <polyline fill="none" stroke="#3D9BFF" strokeWidth="2.5" strokeLinejoin="round" points={PRICES.map((v, k) => `${(k / (PRICES.length - 1)) * 320},${y(v)}`).join(" ")} />
          {ok && PRICES.map((v, k) => Math.abs(v - truth) <= 1.5 && <circle key={k} cx={(k / (PRICES.length - 1)) * 320} cy={y(v)} r="6" fill="none" stroke="var(--color-bull)" strokeWidth="2.5" className="animate-pop" />)}
        </svg>
        {mark !== null && (
          <div key={tries} className={cn("absolute inset-x-0 border-t-2 animate-fade", ok ? "border-bull" : "border-bear border-dashed")} style={{ top: y(mark) }}>
            <span className={cn("absolute right-2 -top-6 rounded-md px-1.5 font-mono text-[10px] font-bold text-ink-900", ok ? "bg-bull" : "bg-bear")}>{mark.toFixed(1)}</span>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[12px]">
        <span className={cn("font-bold", ok ? "text-bull" : dist !== null ? "text-gold" : "text-ink-400")}>
          {ok ? `Точно! Цена 4 раза отскакивала от ~${truth}` : dist !== null ? (dist < 5 ? "Горячо! Совсем близко" : mark! > truth ? "Ниже… ищи, где цена разворачивалась вверх" : "Выше…") : "Подсказка: где цена несколько раз отскакивала?"}
        </span>
        <span className="font-mono text-ink-400">попыток: {tries}</span>
      </div>
      {ok && <Btn s="xs" v="ghost" className="mt-2" icon="refresh" onClick={() => { setMark(null); setTries(0); }}>Сброс</Btn>}
      <div className="sr-only">{fmt(truth, 0)}</div>
    </div>
  );
}
