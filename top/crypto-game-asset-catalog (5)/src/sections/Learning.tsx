import { useEffect, useMemo, useState } from "react";
import { Asset, Bar, Btn3D, Confetti, Label, Ring, Section, useFloat, FloatText } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";

/* ================= SKILL PATH ================= */
type NodeT = { t: string; s: "done" | "current" | "locked" | "chest" | "legend"; icon: string; xp: number };
const NODES: NodeT[] = [
  { t: "Что такое блокчейн", s: "done", icon: "layers", xp: 10 },
  { t: "Кошельки и ключи", s: "done", icon: "wallet", xp: 10 },
  { t: "Сундук прогресса", s: "chest", icon: "gift", xp: 0 },
  { t: "Японские свечи", s: "current", icon: "candles", xp: 15 },
  { t: "Поддержка и сопротивление", s: "locked", icon: "chart", xp: 15 },
  { t: "Стоп-лосс и риск", s: "locked", icon: "shield", xp: 20 },
  { t: "Экзамен юнита", s: "legend", icon: "crown", xp: 50 },
];
const OFF = [0, 52, 78, 52, 0, -52, -78];
function PathNode({ n, i, active, onClick, progress }: { n: NodeT; i: number; active: boolean; onClick: () => void; progress: number }) {
  const sty = {
    done: { bg: "from-[#ffdc7a] to-[#f0a811]", lip: "#b8780a", fg: "text-[#3a2400]" },
    current: { bg: "from-[#5af5b4] to-[#12c47a]", lip: "#0d9a5c", fg: "text-[#03261a]" },
    locked: { bg: "from-[#243870] to-[#1b2c5e]", lip: "#0b1536", fg: "text-dim" },
    chest: { bg: "from-[#243870] to-[#1b2c5e]", lip: "#0b1536", fg: "" },
    legend: { bg: "from-[#243870] to-[#1b2c5e]", lip: "#0b1536", fg: "text-dim" },
  }[n.s];
  return (
    <div className="flex justify-center" style={{ transform: `translateX(${OFF[i % OFF.length]}px)` }}>
     <div className="relative">
      {n.s === "current" && (
        <>
          <div className="absolute -top-14 left-1/2 px-3 py-1.5 rounded-xl bg-white text-[#0d9a5c] text-[12px] font-extrabold uppercase tracking-wider shadow-[0_3px_0_#b9c6e8] z-10 whitespace-nowrap" style={{ animation: "bob 1.4s ease-in-out infinite" }}>
            Start<i className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 size-3 rotate-45 bg-white" />
          </div>
          <div className="absolute -left-[9px] -top-[9px]"><Ring value={progress} size={90} stroke={7} tone="#1fdb8b" track="#16275a" /></div>
        </>
      )}
      <button onClick={onClick}
        className={cn("relative size-[72px] rounded-full grid place-items-center bg-gradient-to-b transition-transform active:translate-y-[6px] hover:brightness-110", sty.bg, sty.fg, active && "scale-105")}
        style={{ boxShadow: `0 7px 0 ${sty.lip}, 0 14px 20px -6px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.3)` }}>
        <span className="absolute inset-x-3 top-1.5 h-5 rounded-full bg-white/20" />
        {n.s === "chest" ? <span className="anim-float"><Glyph name="chest" size={40} /></span> : n.s === "legend" ? <Glyph name="crown" size={36} dim /> : n.s === "done" ? <Icon name="check" size={32} stroke={3.4} /> : <Icon name={n.s === "locked" ? "lock" : n.icon} size={30} stroke={2.6} />}
      </button>
     </div>
    </div>
  );
}
function SkillPath() {
  const [sel, setSel] = useState<number | null>(3);
  const [prog, setProg] = useState(40);
  const n = sel !== null ? NODES[sel] : null;
  return (
    <Asset title="Learning Path · Skill Tree" id="lrn.path" desc="Зигзаг-путь юнита: done / current / chest / locked / legendary. Клик по узлу — поповер урока." className="lg:row-span-2" tags={["CORE"]}>
      <div className="rounded-2xl p-4 bg-gradient-to-br from-[#1fdb8b] to-[#10a86a] shadow-[0_5px_0_#0b7a4a] flex items-center justify-between text-[#03261a] mb-3">
        <div><div className="text-[10.5px] font-extrabold uppercase tracking-wider opacity-70">Section 1 · Unit 2</div><div className="font-extrabold text-[17px] leading-tight">Основы технического анализа</div></div>
        <button className="h-11 px-3 rounded-xl border-2 border-[#03261a]/25 flex items-center gap-1.5 text-[11px] font-extrabold uppercase hover:bg-black/10 active:translate-y-0.5 transition"><Icon name="book" size={16} stroke={2.6} />Guide</button>
      </div>
      <div className="relative h-[520px] overflow-y-auto overflow-x-hidden pt-14 pb-10 space-y-7 [scrollbar-width:thin]">
        {NODES.map((nd, i) => (
          <div key={i} className="relative">
            <PathNode n={nd} i={i} active={sel === i} progress={prog} onClick={() => { setSel(sel === i ? null : i); nd.s === "locked" ? sfx.error() : sfx.pop(); haptic(8); }} />
            {sel === i && n && (
              <div className="relative mt-4 mx-auto w-[88%] anim-scale z-20">
                <div className={cn("rounded-2xl p-4 relative", n.s === "locked" || n.s === "legend" ? "bg-[#1b2c5e] border-2 border-[#26397a]" : n.s === "done" ? "bg-gradient-to-b from-[#ffc53d] to-[#f0a811] text-[#3a2400]" : "bg-gradient-to-b from-[#1fdb8b] to-[#12c47a] text-[#03261a]")}>
                  <i className={cn("absolute -top-2 size-4 rotate-45", n.s === "locked" || n.s === "legend" ? "bg-[#1b2c5e] border-l-2 border-t-2 border-[#26397a]" : n.s === "done" ? "bg-[#ffc53d]" : "bg-[#1fdb8b]")} style={{ left: `calc(50% + ${OFF[i % OFF.length]}px - 8px)` }} />
                  <div className="font-extrabold text-[15px]">{n.t}</div>
                  <div className="text-[12px] font-bold opacity-75 mb-3">{n.s === "locked" ? "Завершите предыдущие уроки, чтобы открыть" : n.s === "legend" ? "Пройдите все уроки юнита" : n.s === "chest" ? "Награда за прогресс" : n.s === "done" ? "Пройдено · можно повторить" : `Урок 2 из 5 · +${n.xp} XP`}</div>
                  {n.s === "locked" || n.s === "legend" ? <Btn3D full size="sm" variant="neutral" disabled>Locked</Btn3D>
                    : <Btn3D full size="sm" variant="neutral" className="!text-inherit" style={{ ["--top" as string]: "#ffffff", ["--base" as string]: "#f1f5ff", ["--lip" as string]: "#b9c6e8", ["--fg" as string]: n.s === "done" ? "#b8780a" : "#0d9a5c" }} onClick={() => { if (n.s === "current") setProg((p) => (p >= 100 ? 0 : p + 20)); }}>{n.s === "done" ? "Practice +5 XP" : n.s === "chest" ? "Open" : `Start +${n.xp} XP`}</Btn3D>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* ================= CANDLE ICON ================= */
export function CandleSvg({ kind }: { kind: "hammer" | "star" | "hanging" | "doji" }) {
  const G = "#1fdb8b", R = "#ff4d6a";
  const c = { hammer: { col: G, wickT: 8, bodyT: 10, bodyB: 20, wickB: 44 }, star: { col: R, wickT: 4, bodyT: 32, bodyB: 42, wickB: 44 }, hanging: { col: R, wickT: 8, bodyT: 10, bodyB: 20, wickB: 44 }, doji: { col: "#8e9cc8", wickT: 6, bodyT: 24, bodyB: 26, wickB: 44 } }[kind];
  return (
    <svg width="40" height="48" viewBox="0 0 40 48">
      <line x1="20" y1={c.wickT} x2="20" y2={c.wickB} stroke={c.col} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="12" y={c.bodyT} width="16" height={c.bodyB - c.bodyT} rx="2.5" fill={c.col} />
    </svg>
  );
}

/* ================= LESSON QUIZ ================= */
type Q = { q: string; opts: { t: string; c?: "hammer" | "star" | "hanging" | "doji" }[]; a: number; why: string };
const QS: Q[] = [
  { q: "Какая свеча сигнализирует о бычьем развороте после падения?", opts: [{ t: "Hammer", c: "hammer" }, { t: "Shooting Star", c: "star" }, { t: "Hanging Man", c: "hanging" }, { t: "Doji", c: "doji" }], a: 0, why: "Длинная нижняя тень показывает, что покупатели выкупили падение." },
  { q: "RSI выше 70 обычно означает, что актив…", opts: [{ t: "Перекуплен" }, { t: "Перепродан" }, { t: "В боковике" }, { t: "Неликвиден" }], a: 0, why: "RSI > 70 — зона перекупленности, возможна коррекция." },
  { q: "Зачем трейдеру стоп-лосс?", opts: [{ t: "Увеличить плечо" }, { t: "Ограничить убыток" }, { t: "Снизить комиссию" }, { t: "Купить дешевле" }], a: 1, why: "Стоп-лосс автоматически закрывает позицию при заданном убытке." },
];
function LessonQuiz() {
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [res, setRes] = useState<"ok" | "bad" | null>(null);
  const [hearts, setHearts] = useState(5);
  const [done, setDone] = useState(0);
  const [end, setEnd] = useState(false);
  const [fire, setFire] = useState(0);
  const [correct, setCorrect] = useState(0);
  const q = QS[qi];
  const check = () => {
    if (sel === null) return;
    if (sel === q.a) { setRes("ok"); setCorrect((c) => c + 1); sfx.success(); haptic(15); } else { setRes("bad"); setHearts((h) => Math.max(0, h - 1)); sfx.error(); haptic([40, 30, 40]); }
    setDone((d) => d + 1);
  };
  const next = () => {
    if (qi === QS.length - 1) { setEnd(true); setFire(Date.now()); sfx.levelUp(); return; }
    setQi(qi + 1); setSel(null); setRes(null); sfx.whoosh();
  };
  const reset = () => { setQi(0); setSel(null); setRes(null); setHearts(5); setDone(0); setEnd(false); setCorrect(0); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.tagName === "INPUT") return;
      if (document.querySelector("[data-playgame]")) return;
      if (!res && ["1", "2", "3", "4"].includes(e.key)) { setSel(+e.key - 1); sfx.tap(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [res]);
  return (
    <Asset title="Lesson · Multiple Choice" id="lrn.quiz" desc="Полный цикл урока: выбор → Check → нижний лист (верно/ошибка) → следующий. Клавиши 1–4." className="lg:col-span-2" tags={["CORE"]}>
      <div className="relative mx-auto max-w-[440px] h-[560px] rounded-[34px] border-[6px] border-[#1a2a5c] bg-ink-900 overflow-hidden flex flex-col shadow-[0_10px_0_#0b1536,0_30px_60px_rgba(0,0,0,.5)]">
        <Confetti fire={fire} count={80} spread={220} />
        <div className="flex items-center gap-3 px-4 pt-5 pb-3">
          <button onClick={reset} className="text-dim hover:text-txt"><Icon name="x" size={24} stroke={2.6} /></button>
          <div className="flex-1"><Bar value={(done / QS.length) * 100} tone="bull" h={12} /></div>
          <span key={hearts} className={cn("flex items-center gap-1 font-extrabold text-bear num", res === "bad" && "anim-shake")}><Glyph name="heart" size={22} />{hearts}</span>
        </div>
        {!end ? (
          <div key={qi} className="flex-1 px-5 pt-2 anim-fade flex flex-col">
            <div className="label-caps !text-violet mb-2 flex items-center gap-1.5"><Icon name="sparkles" size={13} />Новое понятие</div>
            <h4 className="text-[19px] font-extrabold leading-snug mb-5">{q.q}</h4>
            <div className={cn("grid gap-3", q.opts[0].c ? "grid-cols-2" : "grid-cols-1")}>
              {q.opts.map((o, i) => (
                <button key={o.t} onClick={() => { if (!res) { setSel(i); sfx.tap(); } }}
                  data-state={res ? (i === q.a ? "correct" : i === sel ? "wrong" : "disabled") : sel === i ? "selected" : undefined}
                  className={cn("opt text-left font-bold text-[14px]", o.c ? "p-3 flex flex-col items-center gap-1" : "px-4 py-3.5 flex items-center gap-3")}>
                  {o.c ? <CandleSvg kind={o.c} /> : null}
                  <span className="flex items-center gap-3 w-full justify-center"><kbd className={cn("num text-[10px] border rounded-md px-1.5 py-0.5 opacity-60", o.c && "hidden")}>{i + 1}</kbd><span className={cn(!o.c && "flex-1")}>{o.t}</span></span>
                </button>
              ))}
            </div>
            <div className="mt-auto pb-5 pt-4 border-t-2 border-[#16275a] -mx-5 px-5">
              <Btn3D full size="lg" variant={sel === null ? "neutral" : "bull"} disabled={sel === null} onClick={check}>Check</Btn3D>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 anim-scale">
            <div className="anim-float"><Glyph name="star" size={80} /></div>
            <div className="text-[26px] font-extrabold mt-3">Урок пройден!</div>
            <div className="grid grid-cols-3 gap-2.5 w-full my-6">
              {[["Total XP", `${correct * 10 + 5}`, "gold", "bolt"], ["Точность", `${Math.round((correct / QS.length) * 100)}%`, "bull", "target"], ["Время", "1:24", "cyan", "clock"]].map(([l, v, c, ic]) => (
                <div key={l} className={cn("rounded-2xl border-2 overflow-hidden", c === "gold" ? "border-gold bg-gold" : c === "bull" ? "border-bull bg-bull" : "border-cyan bg-cyan")}>
                  <div className="text-[9.5px] font-extrabold uppercase py-1 text-ink-900">{l}</div>
                  <div className="bg-ink-900 rounded-t-xl py-2.5 flex items-center justify-center gap-1"><Icon name={ic} size={15} className={c === "gold" ? "text-gold" : c === "bull" ? "text-bull" : "text-cyan"} /><span className="num font-extrabold">{v}</span></div>
                </div>
              ))}
            </div>
            <Btn3D full size="lg" variant="blue" onClick={reset}>Continue</Btn3D>
          </div>
        )}
        {res && !end && (
          <div className={cn("absolute inset-x-0 bottom-0 p-5 pt-4 anim-slide-up rounded-t-3xl", res === "ok" ? "bg-[#0e3b33]" : "bg-[#3b1428]")}>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("size-10 rounded-full grid place-items-center anim-pop", res === "ok" ? "bg-bull text-ink-900" : "bg-bear text-white")}><Icon name={res === "ok" ? "check" : "x"} size={22} stroke={3.4} /></span>
              <span className={cn("text-[20px] font-extrabold", res === "ok" ? "text-bull" : "text-bear")}>{res === "ok" ? ["Отлично!", "В точку!", "Как профи!"][qi % 3] : "Не совсем…"}</span>
            </div>
            <div className={cn("text-[13px] font-semibold mb-4", res === "ok" ? "text-[#8ff0c6]" : "text-[#ffb3c0]")}>{res === "bad" && <b>Ответ: {q.opts[q.a].t}. </b>}{q.why}</div>
            <Btn3D full size="lg" variant={res === "ok" ? "bull" : "bear"} onClick={next}>{res === "ok" ? "Continue" : "Got it"}</Btn3D>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* ================= CHART PREDICT ================= */
function genCandles(n: number, seed = Math.random()) {
  let p = 100 + seed * 20;
  const out: { o: number; c: number; h: number; l: number }[] = [];
  const drift = seed > 0.5 ? 0.6 : -0.6;
  for (let i = 0; i < n; i++) {
    const o = p;
    const c = o + (Math.random() - 0.5) * 6 + (i > 15 ? drift * 1.6 : drift * 0.2);
    out.push({ o, c, h: Math.max(o, c) + Math.random() * 2.5, l: Math.min(o, c) - Math.random() * 2.5 });
    p = c;
  }
  return out;
}
function ChartPredict() {
  const [data, setData] = useState(() => genCandles(24));
  const [shown, setShown] = useState(16);
  const [pick, setPick] = useState<"up" | "down" | null>(null);
  const [score, setScore] = useState({ w: 0, l: 0 });
  const [time, setTime] = useState(10);
  const [fl, add] = useFloat();
  const revealed = shown >= 24;
  const won = revealed && pick && (data[23].c > data[15].c ? "up" : "down") === pick;
  useEffect(() => {
    if (pick || revealed) return;
    if (time <= 0) { setPick("up"); return; }
    const h = setTimeout(() => { setTime((t) => t - 1); if (time <= 4) sfx.tick(); }, 1000);
    return () => clearTimeout(h);
  }, [time, pick, revealed]);
  useEffect(() => {
    if (!pick || shown >= 24) return;
    const h = setTimeout(() => { setShown((s) => s + 1); sfx.tick(); }, 180);
    return () => clearTimeout(h);
  }, [pick, shown]);
  useEffect(() => {
    if (!revealed || !pick) return;
    if (won) { setScore((s) => ({ ...s, w: s.w + 1 })); sfx.success(); add("+15 XP", "#ffc53d"); } else { setScore((s) => ({ ...s, l: s.l + 1 })); sfx.error(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);
  const again = () => { setData(genCandles(24)); setShown(16); setPick(null); setTime(10); sfx.whoosh(); };
  const vis = data.slice(0, shown);
  const all = data.flatMap((d) => [d.h, d.l]);
  const mx = Math.max(...all), mn = Math.min(...all);
  const W = 320, H = 150, cw = W / 24;
  const y = (v: number) => 8 + ((mx - v) / (mx - mn)) * (H - 16);
  return (
    <Asset title="Price Prediction Game" id="lrn.predict" desc="10 секунд: куда пойдёт цена? Свечи раскрываются по одной.">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 text-[12px] font-extrabold num"><span className="text-bull">W {score.w}</span><span className="text-bear">L {score.l}</span></div>
        <div className="relative"><Ring value={(time / 10) * 100} size={38} stroke={4} tone={time <= 3 ? "#ff4d6a" : "#3d7bff"}><span className={cn("num text-[12px] font-extrabold", time <= 3 && "text-bear")}>{time}</span></Ring></div>
      </div>
      <div className="inset p-2 relative">
        <FloatText items={fl} />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]">
          {[0.25, 0.5, 0.75].map((g) => <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="rgba(140,170,255,.07)" />)}
          <line x1={cw * 16} x2={cw * 16} y1="0" y2={H} stroke="rgba(61,123,255,.5)" strokeDasharray="4 4" />
          {vis.map((d, i) => {
            const up = d.c >= d.o, col = up ? "#1fdb8b" : "#ff4d6a";
            return (
              <g key={i} style={{ animation: i >= 16 ? "pop .3s both" : undefined, transformOrigin: `${i * cw + cw / 2}px ${y(d.c)}px` }}>
                <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.5" />
                <rect x={i * cw + 2} y={y(Math.max(d.o, d.c))} width={cw - 4} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} rx="1.5" fill={col} />
              </g>
            );
          })}
          {!pick && <text x={cw * 20} y={H / 2} fill="#5b6a98" fontSize="26" fontWeight="800" textAnchor="middle">?</text>}
        </svg>
        {revealed && <div className={cn("absolute inset-0 grid place-items-center rounded-[14px] anim-fade", won ? "bg-bull/10" : "bg-bear/10")}><div className={cn("raised px-4 py-2 font-extrabold anim-pop flex items-center gap-2", won ? "text-bull" : "text-bear")}><Icon name={won ? "trendUp" : "trendDown"} size={18} stroke={2.6} />{won ? "Верный прогноз!" : "Рынок против вас"}</div></div>}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {revealed ? <Btn3D size="md" variant="blue" className="col-span-2" onClick={again} icon={<Icon name="refresh" size={16} />}>Next round</Btn3D> : <>
          <Btn3D size="md" variant="bull" disabled={!!pick} pressed={pick === "up"} onClick={() => setPick("up")} icon={<Icon name="arrowUp" size={18} stroke={3} />}>Up</Btn3D>
          <Btn3D size="md" variant="bear" disabled={!!pick} pressed={pick === "down"} onClick={() => setPick("down")} icon={<Icon name="arrowDown" size={18} stroke={3} />}>Down</Btn3D>
        </>}
      </div>
    </Asset>
  );
}

/* ================= MATCH PAIRS ================= */
const PAIRS = [["HODL", "Держать долго"], ["FOMO", "Страх упустить"], ["Whale", "Крупный игрок"], ["Stop-loss", "Лимит убытка"], ["Bear market", "Падающий рынок"]];
function MatchPairs() {
  const [round, setRound] = useState(0);
  const right = useMemo(() => [...PAIRS].sort(() => Math.random() - 0.5).map((p) => p[1]), [round]);
  const [l, setL] = useState<string | null>(null);
  const [r, setR] = useState<string | null>(null);
  const [ok, setOk] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const [fire, setFire] = useState(0);
  useEffect(() => {
    if (!l || !r) return;
    const match = PAIRS.find((p) => p[0] === l)?.[1] === r;
    if (match) {
      const nok = [...ok, l]; setOk(nok); sfx.success(); setL(null); setR(null);
      if (nok.length === PAIRS.length) { setFire(Date.now()); sfx.levelUp(); }
    } else { setBad([l, r]); sfx.error(); haptic([30, 20, 30]); setTimeout(() => { setBad([]); setL(null); setR(null); }, 500); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l, r]);
  const matchedR = ok.map((k) => PAIRS.find((p) => p[0] === k)![1]);
  const st = (v: string, side: "l" | "r") => {
    if ((side === "l" ? ok.includes(v) : matchedR.includes(v))) return "correct";
    if (bad.includes(v)) return "wrong";
    if ((side === "l" ? l : r) === v) return "selected";
    return undefined;
  };
  return (
    <Asset title="Match the Pairs" id="lrn.match" desc="Сопоставьте термин и значение. Сленг криптотрейдеров.">
      <div className="relative">
        <Confetti fire={fire} />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-2.5">{PAIRS.map(([k]) => <button key={k} disabled={ok.includes(k)} onClick={() => { setL(k); sfx.tap(); }} data-state={st(k, "l")} className={cn("opt w-full h-12 text-[13px] font-extrabold transition-opacity", ok.includes(k) && "opacity-50")}>{k}</button>)}</div>
          <div className="space-y-2.5">{right.map((v) => <button key={v} disabled={matchedR.includes(v)} onClick={() => { setR(v); sfx.tap(); }} data-state={st(v, "r")} className={cn("opt w-full h-12 text-[12px] font-bold transition-opacity", matchedR.includes(v) && "opacity-50")}>{v}</button>)}</div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[12px] font-extrabold text-mute num">{ok.length}/{PAIRS.length} пар</span>
          {ok.length === PAIRS.length ? <Btn3D size="sm" variant="bull" onClick={() => { setOk([]); setRound(round + 1); }}>Play again</Btn3D> : <Label className="!mb-0">Выберите слева и справа</Label>}
        </div>
      </div>
    </Asset>
  );
}

export default function Learning() {
  return (
    <Section id="learning" index="05" title="Learning & Lessons" subtitle="Duolingo-механики, переосмысленные для трейдинга: путь, квизы, прогнозы, сопоставления" count={4}>
      <div className="grid lg:grid-cols-3 gap-6">
        <SkillPath />
        <LessonQuiz />
        <ChartPredict />
        <MatchPairs />
      </div>
    </Section>
  );
}
