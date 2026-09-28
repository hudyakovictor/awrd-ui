import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Btn3D, Bar, Section, Badge } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { Mascot, type Mood } from "./Mascot";
import { CandleSvg } from "./Learning";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstAtEl, burstCoins, burstConfetti, burstText, burstStars, celebrate, flash, shake } from "../utils/fx";
import { LESSON_META, LESSONS, VOICE, type BuildQ, type ChartQ, type ChoiceQ, type GameQ, type LessonDef, type MatchQ, type MiniCandle } from "../data/lessons";

/* ---------- mini candle chart for chart-questions ---------- */
export function MiniChart({ candles, w = 64, h = 48 }: { candles: MiniCandle[]; w?: number; h?: number }) {
  const cw = w / candles.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {candles.map((c, i) => {
        const scale = (h - 10) / Math.max(...candles.map((x) => x.body + x.wT + x.wB));
        const cx = i * cw + cw / 2;
        const top = (h - c.wT * scale - c.body * scale) / 2;
        const col = c.d === 1 ? "#1fdb8b" : "#ff4d6a";
        return (
          <g key={i}>
            <line x1={cx} x2={cx} y1={top} y2={top + (c.wT + c.body + c.wB) * scale} stroke={col} strokeWidth="1.6" strokeLinecap="round" />
            <rect x={cx - cw / 2 + 3} y={top + c.wT * scale} width={cw - 6} height={Math.max(2, c.body * scale)} fill={col} rx="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

/* ================= PLAYABLE LESSON ================= */
type Stage = "intro" | "quiz" | "results" | "fail";

export function PlayGame({ open, onClose, lesson = LESSONS[0] }: { open: boolean; onClose: (earnedXp: number) => void; lesson?: LessonDef }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [qi, setQi] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [xp, setXp] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [res, setRes] = useState<null | "ok" | "bad">(null);
  const [built, setBuilt] = useState<string[]>([]);
  const [mL, setML] = useState<string | null>(null);
  const [mR, setMR] = useState<string | null>(null);
  const [mOk, setMOk] = useState<string[]>([]);
  const [mBad, setMBad] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood>("idle");
  const [line, setLine] = useState(VOICE.idle);
  const [comboPop, setComboPop] = useState(0);
  const startRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);

  const questions = lesson.questions;
  const q: GameQ = questions[Math.min(qi, questions.length - 1)];
  const total = questions.length;
  const reward = questions.reduce((a, x) => a + x.xp, 0);
  const prog = (qi / total) * 100;

  const reset = useCallback(() => {
    setStage("intro"); setQi(0); setHearts(5); setXp(0); setCorrect(0); setCombo(0); setMaxCombo(0);
    setSel(null); setRes(null); setBuilt([]); setML(null); setMR(null); setMOk([]); setMBad([]);
    setMood("idle"); setLine(VOICE.idle); setElapsed(0);
  }, []);
  useEffect(() => { if (open) { reset(); startRef.current = performance.now(); } }, [open, reset]);

  const say = (m: Mood, t: string) => { setMood(m); setLine(t); };
  const startLesson = () => {
    setStage("quiz"); setMood("idle"); setLine(VOICE.ready); sfx.whoosh(); haptic(10);
  };

  const applyResult = (ok: boolean, qxp: number) => {
    setRes(ok ? "ok" : "bad");
    if (ok) {
      const nc = combo + 1;
      const bonus = Math.min(6, nc - 1) * 2;
      setCombo(nc); setMaxCombo((m) => Math.max(m, nc)); setCorrect((c) => c + 1);
      const gained = qxp + bonus;
      setXp((x) => x + gained);
      setMood("cheer"); setLine(VOICE.correct[Math.floor(Math.random() * VOICE.correct.length)]);
      const r = document.getElementById("pg-answer")?.getBoundingClientRect();
      if (r) { burstConfetti(r.left + r.width / 2, r.top, 30, 0.85); burstText(r.left + r.width / 2, r.top - 10, `+${gained} XP`); }
      if (nc >= 3 && nc % 2 === 0) { setComboPop(nc); burstStars(innerWidth / 2, innerHeight * 0.25, 8); }
      sfx.success(); haptic(12);
    } else {
      setHearts((h) => Math.max(0, h - 1));
      setCombo(0);
      setMood("worried"); setLine(VOICE.wrong[Math.floor(Math.random() * VOICE.wrong.length)]);
      flash(); shake("soft"); sfx.error(); haptic([30, 40, 30]);
    }
  };
  const next = () => {
    if (res === "bad" && hearts <= 0) { setStage("fail"); say("worried", VOICE.fail); return; }
    if (qi === total - 1) {
      setElapsed(Math.round((performance.now() - startRef.current) / 1000));
      setStage("results"); say("cheer", VOICE.win);
      fanfare(); celebrate(); haptic([30, 40, 80]);
      return;
    }
    setQi((i) => i + 1); setSel(null); setRes(null); setBuilt([]); setML(null); setMR(null); setMOk([]); setMBad([]);
    sfx.whoosh(); say("idle", "Следующий.");
    if (hearts === 1) setTimeout(() => say("worried", VOICE.lowHearts), 400);
  };

  /* match logic */
  const matchedR = useMemo(() => mOk.map((k) => (q as MatchQ).pairs.find((p) => p[0] === k)![1]), [mOk, q]);
  useEffect(() => {
    if (q.kind !== "match" || !mL || !mR || res) return;
    const ok = (q as MatchQ).pairs.find((p) => p[0] === mL)?.[1] === mR;
    if (ok) {
      const nok = [...mOk, mL];
      setMOk(nok); sfx.success(); setML(null); setMR(null);
      if (nok.length === (q as MatchQ).pairs.length) applyResult(true, (q as MatchQ).xp);
    } else {
      setMBad([mL, mR]); sfx.error(); shake("soft");
      setTimeout(() => { setMBad([]); setML(null); setMR(null); }, 480);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mL, mR]);

  /* keyboard */
  useEffect(() => {
    if (!open || stage !== "quiz" || res) return;
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (q.kind === "choice" && ["1", "2", "3", "4"].includes(e.key)) { setSel(+e.key - 1); sfx.tap(); }
      if (e.key === "Enter" && canCheck()) doCheck();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const canCheck = () => {
    if (q.kind === "choice") return sel !== null;
    if (q.kind === "build") return built.length === (q as BuildQ).answer.length;
    if (q.kind === "match") return mOk.length === (q as MatchQ).pairs.length;
    return false;
  };
  const doCheck = () => {
    if (q.kind === "choice") applyResult(sel === (q as ChoiceQ).answer, (q as ChoiceQ).xp);
    if (q.kind === "build") applyResult(built.join("|") === (q as BuildQ).answer.join("|"), (q as BuildQ).xp);
  };
  const bank = useMemo(() => (q.kind === "build" ? [...(q as BuildQ).bank].sort(() => Math.random() - 0.5) : []), [q]);

  if (!open) return null;
  const acc = Math.round((correct / Math.max(1, total)) * 100);

  return (
    <div data-playgame className="fixed inset-0 z-[160] bg-ink-950/90 backdrop-blur-md anim-fade overflow-y-auto" role="dialog" aria-modal>
      <div className="min-h-full grid place-items-center p-3 sm:p-6">
        <div className="relative w-full max-w-[480px] h-[min(94vh,820px)] rounded-[36px] border-[6px] border-[#1a2a5c] bg-ink-900 overflow-hidden flex flex-col shadow-[0_12px_0_#0b1536,0_40px_80px_rgba(0,0,0,.6)]">
          {/* star field */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="absolute size-1 rounded-full bg-[#8fb3ff]" style={{ left: `${(i * 71) % 100}%`, top: `${(i * 37) % 100}%`, animation: `twinkle 2.2s ${(i % 5) * 0.4}s ease-in-out infinite` }} />
            ))}
          </div>

          {/* ---- INTRO ---- */}
          {stage === "intro" && (
            <div className="relative flex-1 flex flex-col items-center justify-center text-center p-6 anim-scale">
              <Badge tone="bull" className="mb-4">{lesson.key === "candles" ? LESSON_META.unit : "Урок · " + lesson.key}</Badge>
              <Mascot mood="idle" size={170} />
              <h2 className="text-[30px] font-extrabold mt-4">{lesson.title}</h2>
              <p className="text-mute text-[13.5px] mt-1">{lesson.subtitle} · 5 типов заданий</p>
              <div className="flex gap-2 mt-6">
                {["choice", "build", "chart", "match"].map((t) => (
                  <span key={t} className="raised px-3 h-9 grid place-items-center text-[11px] font-extrabold uppercase tracking-wider text-[#8fb3ff]">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-6 text-gold font-extrabold num"><Glyph name="bolt" size={22} />+{reward} XP · комбо-бонусы</div>
              <Btn3D size="xl" variant="bull" full className="mt-6 max-w-[300px]" icon={<Icon name="play" size={20} />} onClick={startLesson} sound="pop">Start lesson</Btn3D>
              <button onClick={() => onClose(xp)} className="mt-4 text-dim text-[12px] font-bold hover:text-txt">Позже</button>
            </div>
          )}

          {/* ---- QUIZ ---- */}
          {stage === "quiz" && (
            <>
              <div className="relative flex items-center gap-3 px-4 pt-5 pb-3">
                <button onClick={() => onClose(xp)} className="text-dim hover:text-txt"><Icon name="x" size={24} stroke={2.6} /></button>
                <div className="flex-1"><Bar value={prog} tone="bull" h={12} /></div>
                <span key={hearts} className={cn("flex items-center gap-1 font-extrabold text-bear num", res === "bad" && "anim-shake")}><Glyph name="heart" size={22} dim={hearts === 0} />{hearts}</span>
              </div>
              <div className="flex items-start gap-2 px-4">
                <Mascot mood={mood} size={64} />
                <div key={line} className="relative mt-1 rounded-2xl bg-[#142350] border border-white/10 px-3 py-2 text-[12px] font-bold leading-snug shadow-[0_3px_0_#0b1536] anim-pop max-w-[220px]">
                  {line}
                  <i className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 size-2.5 rotate-45 bg-[#142350] border-l border-b border-white/10" />
                </div>
                {comboPop > 0 && (
                  <span key={comboPop} className="absolute right-4 top-0 anim-pop flex items-center gap-1 text-[13px] font-extrabold text-gold"><Glyph name="flame" size={18} />x{comboPop} combo</span>
                )}
              </div>

              <div key={qi} className="relative flex-1 px-5 pt-4 pb-4 overflow-y-auto anim-fade" id="pg-answer">
                {q.kind === "choice" && (
                  <>
                    <h3 className="text-[19px] font-extrabold leading-snug mb-4">{q.prompt}</h3>
                    <div className={cn("grid gap-3", q.options[0].c ? "grid-cols-2" : "grid-cols-1")}>
                      {q.options.map((o, i) => (
                        <button key={o.t} onClick={() => { if (!res) { setSel(i); sfx.tap(); } }}
                          data-state={res ? (i === (q as ChoiceQ).answer ? "correct" : i === sel ? "wrong" : "disabled") : sel === i ? "selected" : undefined}
                          className={cn("opt text-left font-bold text-[14px]", o.c ? "p-3 flex flex-col items-center gap-1" : "px-4 py-3.5 flex items-center gap-3")}>
                          {o.c && <CandleSvg kind={o.c} />}
                          <span className={cn("flex items-center gap-3 w-full", !o.c && "flex-1", o.c && "justify-center")}>
                            <kbd className={cn("num text-[10px] border border-white/15 rounded-md px-1.5 py-0.5 opacity-70", o.c && "hidden")}>{i + 1}</kbd>{o.t}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {q.kind === "build" && (
                  <>
                    <h3 className="text-[19px] font-extrabold leading-snug mb-4">{q.prompt}</h3>
                    <div className={cn("min-h-[120px] rounded-2xl p-3 flex flex-wrap gap-2 content-start border-2 border-dashed transition", res === "bad" ? "border-bear/60 bg-bear/5 anim-shake" : res === "ok" ? "border-bull/60 bg-bull/5" : "border-[#22366f] bg-[#0a1330]")}>
                      {built.length === 0 && <span className="text-[12px] text-dim font-semibold px-2 py-1.5">Собирайте предложение, нажимая слова ниже…</span>}
                      {built.map((w, i) => (
                        <button key={w + i} onClick={() => !res && setBuilt(built.filter((_, k) => k !== i))}
                          className={cn("opt px-3 h-10 text-[13px] font-extrabold", res && w !== (q as BuildQ).answer[i] && "data-wrong")}
                          data-state={res ? (w === (q as BuildQ).answer[i] ? "correct" : "wrong") : "selected"}>
                          {w}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {bank.map((w) => {
                        const isUsed = built.includes(w);
                        return (
                          <button key={w} disabled={!!res || isUsed} onClick={() => { if (!res) { setBuilt([...built, w]); sfx.pop(); } }}
                            className={cn("opt px-3 h-10 text-[13px] font-bold", isUsed && "opacity-30 pointer-events-none")}>
                            {w}
                          </button>
                        );
                      })}
                    </div>
                    <div className="text-[11px] text-dim mt-3 font-semibold">Нажмите слово в строке, чтобы убрать его</div>
                  </>
                )}

                {q.kind === "chart" && (
                  <>
                    <h3 className="text-[19px] font-extrabold leading-snug mb-4">{q.prompt}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(q as ChartQ).options.map((o, i) => (
                        <button key={o.name} onClick={() => { if (!res) { setSel(i); sfx.tap(); } }}
                          data-state={res ? (i === (q as ChartQ).answer ? "correct" : i === sel ? "wrong" : "disabled") : sel === i ? "selected" : undefined}
                          className="opt p-3 flex flex-col items-center gap-2">
                          <span className="w-24 h-16 inset !rounded-xl grid place-items-center"><MiniChart candles={o.candles} w={80} h={44} /></span>
                          <span className="num text-[11px] font-extrabold opacity-70">{o.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {q.kind === "match" && (
                  <>
                    <h3 className="text-[19px] font-extrabold leading-snug mb-4">{q.prompt}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2.5">
                        {(q as MatchQ).pairs.map(([k]) => (
                          <button key={k} disabled={mOk.includes(k)} onClick={() => { if (!res) { setML(k); sfx.tap(); } }}
                            data-state={mOk.includes(k) ? "correct" : mBad.includes(k) ? "wrong" : mL === k ? "selected" : undefined}
                            className={cn("opt w-full h-11 text-[12.5px] font-extrabold", mOk.includes(k) && "opacity-50")}>{k}</button>
                        ))}
                      </div>
                      <div className="space-y-2.5">
                        {(q as MatchQ).pairs.map((p) => p[1]).sort(() => 0).map((v) => (
                          <button key={v} disabled={matchedR.includes(v)} onClick={() => { if (!res) { setMR(v); sfx.tap(); } }}
                            data-state={matchedR.includes(v) ? "correct" : mBad.includes(v) ? "wrong" : mR === v ? "selected" : undefined}
                            className={cn("opt w-full h-11 text-[12px] font-bold", matchedR.includes(v) && "opacity-50")}>{v}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-4 text-[12px] font-extrabold num"><span className="text-mute">{mOk.length}/{(q as MatchQ).pairs.length} пар</span><span className="text-dim">Ошибка = −1 сердце</span></div>
                  </>
                )}
              </div>

              {/* bottom */}
              <div className={cn("px-5 pb-5 pt-4 border-t-2 transition-colors duration-300", res === "ok" ? "bg-[#0e3b33] border-transparent" : res === "bad" ? "bg-[#3b1428] border-transparent" : "border-[#16275a]")}>
                {!res ? (
                  <Btn3D full size="lg" variant={canCheck() ? "bull" : "neutral"} disabled={!canCheck()} onClick={doCheck}>Check</Btn3D>
                ) : (
                  <div className="anim-slide-up">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className={cn("size-9 rounded-full grid place-items-center anim-pop", res === "ok" ? "bg-bull text-ink-900" : "bg-bear text-white")}><Icon name={res === "ok" ? "check" : "x"} size={20} stroke={3.4} /></span>
                      <span className={cn("text-[17px] font-extrabold", res === "ok" ? "text-bull" : "text-bear")}>{res === "ok" ? `+${q.xp + Math.min(6, combo) * 2} XP${combo >= 3 ? " · combo!" : ""}` : "Не совсем…"}</span>
                    </div>
                    <p className={cn("text-[12.5px] font-semibold mb-3 leading-snug", res === "ok" ? "text-[#8ff0c6]" : "text-[#ffb3c0]")}>{q.why}</p>
                    <Btn3D full size="lg" variant={res === "ok" ? "bull" : "bear"} onClick={next}>{hearts === 0 && res === "bad" ? "See results" : "Continue"}</Btn3D>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ---- RESULTS ---- */}
          {stage === "results" && (
            <div className="relative flex-1 flex flex-col items-center justify-center text-center p-6 anim-scale">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[420px] h-[420px] pointer-events-none opacity-60" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.18) 0 12deg, transparent 12deg 24deg)", animation: "ray 12s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 68%)" }} />
              <Badge tone="gold" className="mb-4 anim-pop">LESSON COMPLETE</Badge>
              <Mascot mood="cheer" size={160} />
              <h2 className="text-[28px] font-extrabold mt-3">Свечи читаешь как книга</h2>
              <div className="grid grid-cols-3 gap-2.5 w-full my-6">
                {([
                  ["Total XP", `+${xp}`, "gold", "bolt"],
                  ["Точность", `${acc}%`, "bull", "target"],
                  ["Время", `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`, "cyan", "clock"],
                ] as const).map(([l, v, c, ic], i) => (
                  <div key={l} className={cn("rounded-2xl border-2 overflow-hidden anim-pop", c === "gold" ? "border-gold bg-gold" : c === "bull" ? "border-bull bg-bull" : "border-cyan bg-cyan")} style={{ animationDelay: `${i * 120}ms` }}>
                    <div className="text-[9.5px] font-extrabold uppercase tracking-wider py-1 text-ink-900">{l}</div>
                    <div className="bg-ink-900 rounded-t-xl py-3 flex items-center justify-center gap-1.5">
                      <Icon name={ic} size={15} className={c === "gold" ? "text-gold" : c === "bull" ? "text-bull" : "text-cyan"} />
                      <span className="num font-extrabold text-[17px]">{v}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mb-6 text-[12px] font-extrabold text-mute">
                Max combo
                {[1, 2, 3, 4, 5, 6].map((n) => <Glyph key={n} name="flame" size={20} dim={n > maxCombo} />)}
                <span className="num text-gold ml-1">x{Math.max(1, maxCombo)}</span>
              </div>
              <Btn3D size="lg" variant="bull" full className="max-w-[320px]" icon={<Icon name="check" size={18} stroke={3} />} onClick={() => { burstCoins(innerWidth / 2, innerHeight / 2, 14); onClose(xp); }}>Claim +{xp} XP</Btn3D>
              <button onClick={() => { reset(); startLesson(); }} className="mt-3 text-dim text-[12px] font-bold hover:text-txt">Play again</button>
            </div>
          )}

          {/* ---- FAIL ---- */}
          {stage === "fail" && (
            <div className="relative flex-1 flex flex-col items-center justify-center text-center p-6 anim-scale">
              <Mascot mood="worried" size={160} />
              <h2 className="text-[26px] font-extrabold mt-4">Сердца закончились</h2>
              <p className="text-mute text-[13.5px] mt-2 max-w-[280px] leading-relaxed">В трейдинге это было бы −100% депозита. Хорошая новость: здесь депозиты не сгорают.</p>
              <div className="flex gap-2 mt-6">
                <Btn3D variant="neutral" onClick={() => onClose(xp)}>Close</Btn3D>
                <Btn3D variant="bull" icon={<Icon name="refresh" size={16} />} onClick={() => { reset(); setTimeout(startLesson, 60); }}>Retry</Btn3D>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= CATALOG SECTION (trigger) ================= */
export default function PlaySection() {
  const [open, setOpen] = useState(false);
  const [lastXp, setLastXp] = useState<number | null>(null);
  const [lessonKey, setLessonKey] = useState("candles");
  const lesson = LESSONS.find((l) => l.key === lessonKey) ?? LESSONS[0];
  return (
    <Section id="play" index="21" title="Playable Lesson" subtitle="Не демо-анимация — настоящая играбельная сессия: 3 урока прямо в каталоге" count={1}>
      <div className="panel p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 size-64 rounded-full bg-bull/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row gap-6 items-center">
          <div className="shrink-0">
            <Mascot mood="idle" size={150} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap gap-2 mb-3 md:justify-start justify-center"><Badge tone="bull" dot>Live gameplay</Badge><Badge tone="violet">3 lessons × 5 types</Badge></div>
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">Сыграй урок</h3>
            <p className="text-mute text-[14px] mt-2 max-w-xl leading-relaxed">
              Три полноценных урока: «Японские свечи», «Риск-менеджмент» и «Прогноз рынка». В каждом — выбор с иллюстрациями, сбор фраз, мини-графики и пары.
              5 сердец, комбо-бонусы, реакции маскота, звук, вибрация и конфетти на награде. Работает на клавиатуре (1–4, Enter) и таче.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 md:justify-start justify-center">
              {LESSONS.map((l) => (
                <button key={l.key} onClick={() => { setLessonKey(l.key); sfx.tick(); }} data-state={lessonKey === l.key ? "selected" : undefined}
                  className="opt !rounded-full px-3.5 h-10 text-[12px] font-extrabold flex items-center gap-2">
                  <Icon name={l.icon} size={15} />{l.title}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-5 md:justify-start justify-center">
              <Btn3D size="lg" variant="bull" icon={<Icon name="play" size={18} />} sound="pop" onClick={() => setOpen(true)}>Play now</Btn3D>
              {lastXp !== null && (
                <span key={lastXp} className="anim-pop flex items-center gap-2 h-12 px-4 rounded-2xl raised text-[13px] font-extrabold">
                  <Glyph name="bolt" size={18} />Last session: +{lastXp} XP
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 shrink-0">
            {([["choice", "Выбор", "candles"], ["build", "Сбор слов", "brain"], ["chart", "Мини-графики", "chart"], ["match", "Пары", "swap"]] as const).map(([k, l, ic]) => (
              <div key={k} className="raised p-3 w-32 text-center">
                <Icon name={ic} size={20} className="text-[#8fb3ff] mx-auto mb-1.5" />
                <div className="text-[11px] font-extrabold">{l}</div>
                <div className="num text-[9px] text-dim">{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PlayGame open={open} lesson={lesson} onClose={(earned) => { setOpen(false); if (earned > 0) { setLastXp(earned); burstAtEl(document.getElementById("play"), "confetti", 40); } }} />
    </Section>
  );
}
