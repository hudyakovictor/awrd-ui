import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, X, Pause, Play, Check, RotateCcw, MapPin, Sparkles, BookOpen, ArrowLeftRight } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Chip, Bar } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { CandleChart, fromCloses, BULL, BEAR } from "../kit/chart";
import { clamp } from "../kit/motion";
import { useGame } from "../kit/game";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ======================================================================
   L-01  STORY LESSON — Instagram-style micro-lesson
   tap left/right · hold to pause · swipe down to close · auto-advance
   ==================================================================== */
const STORY_MS = 4200;
function AnatomyArt({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <defs>
        <linearGradient id="st-body" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6ff2c4" /><stop offset="1" stopColor="#10916a" /></linearGradient>
        <linearGradient id="st-bear" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ff8fa3" /><stop offset="1" stopColor="#c02a47" /></linearGradient>
      </defs>
      {step === 0 && (
        <g>
          <rect x="97" y="22" width="6" height="156" rx="3" fill="#10916a" style={{ transformOrigin: "100px 100px", animation: "bar-grow .6s .1s both cubic-bezier(.3,1.5,.5,1)" }} />
          <rect x="70" y="60" width="60" height="80" rx="10" fill="url(#st-body)" style={{ transformOrigin: "100px 100px", animation: "bar-grow .6s .3s both cubic-bezier(.3,1.5,.5,1)" }} />
          <rect x="80" y="68" width="10" height="50" rx="5" fill="#fff" opacity=".4" />
        </g>
      )}
      {step === 1 && (
        <g>
          <rect x="97" y="22" width="6" height="156" rx="3" fill="#ffc53d" style={{ filter: "drop-shadow(0 0 8px #ffc53d)" }} />
          <rect x="70" y="60" width="60" height="80" rx="10" fill="url(#st-body)" opacity=".45" />
          <g fontSize="10" fontWeight="800" fill="#ffc53d" style={{ animation: "fade-in .5s .2s both" }}>
            <line x1="106" y1="26" x2="150" y2="26" stroke="#ffc53d" strokeDasharray="3 3" /><text x="152" y="29">HIGH</text>
            <line x1="106" y1="174" x2="150" y2="174" stroke="#ffc53d" strokeDasharray="3 3" /><text x="152" y="177">LOW</text>
          </g>
        </g>
      )}
      {step === 2 && (
        <g>
          <g style={{ animation: "fade-in .4s both" }}>
            <rect x="52" y="30" width="5" height="140" rx="2.5" fill="#10916a" />
            <rect x="34" y="60" width="41" height="70" rx="8" fill="url(#st-body)" />
            <path d="M54 50l-10 12h20z" fill="#22d39a" />
          </g>
          <g style={{ animation: "fade-in .4s .3s both" }}>
            <rect x="143" y="30" width="5" height="140" rx="2.5" fill="#c02a47" />
            <rect x="125" y="70" width="41" height="70" rx="8" fill="url(#st-bear)" />
            <path d="M145 160l-10-12h20z" fill="#ff4f6d" />
          </g>
        </g>
      )}
      {step === 3 && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const up = i !== 2;
            const y = 140 - i * 18;
            return (
              <g key={i} style={{ transformOrigin: `${30 + i * 28}px 180px`, animation: `bar-grow .5s ${i * 110}ms both cubic-bezier(.3,1.5,.5,1)` }}>
                <rect x={29 + i * 28} y={y - 18} width="2.5" height="56" fill={up ? BULL : BEAR} />
                <rect x={21 + i * 28} y={y - 6} width="18" height="30" rx="4" fill={up ? BULL : BEAR} />
              </g>
            );
          })}
          <path d="M20 170 L190 50" stroke="#ffc53d" strokeWidth="3" strokeDasharray="300" style={{ ["--len" as string]: "300", animation: "draw 1.2s .7s both ease-out" }} />
        </g>
      )}
    </svg>
  );
}
const stories: { kicker: string; title: string; text: string; bg: string; art: (i: number) => ReactNode }[] = [
  { kicker: "Урок 1 · 1/5", title: "Свеча — это история одного периода", text: "Каждая свеча показывает, что произошло с ценой за минуту, час или день.", bg: "from-[#0f2f5c] to-[#0a1224]", art: () => <AnatomyArt step={0} /> },
  { kicker: "Урок 1 · 2/5", title: "Тени — это крайние цены", text: "Верхняя тень = максимум периода, нижняя = минимум.", bg: "from-[#3a2a08] to-[#0a1224]", art: () => <AnatomyArt step={1} /> },
  { kicker: "Урок 1 · 3/5", title: "Зелёная растёт, красная падает", text: "Если закрытие выше открытия — свеча бычья. Ниже — медвежья.", bg: "from-[#0b3b30] to-[#2e0f1d]", art: () => <AnatomyArt step={2} /> },
  { kicker: "Урок 1 · 4/5", title: "Много свечей = тренд", text: "Серия повышающихся свечей складывается в восходящий тренд.", bg: "from-[#1d1a5c] to-[#0a1224]", art: () => <AnatomyArt step={3} /> },
  { kicker: "Проверка · 5/5", title: "Что показывает нижняя тень?", text: "", bg: "from-[#16264a] to-[#0a1224]", art: () => <Mascot size={120} mood="think" /> },
];
function StoryLesson() {
  const [i, setI] = useState(0);
  const [p, setP] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closed, setClosed] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const [drag, setDrag] = useState(0);
  const down = useRef<{ t: number; x: number; y: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const isQuiz = i === stories.length - 1;

  useEffect(() => {
    if (paused || closed || isQuiz) return;
    const t = setInterval(() => setP((v) => {
      const n = v + 50 / STORY_MS;
      if (n >= 1) { setI((x) => Math.min(stories.length - 1, x + 1)); sfxRaw.swipe(); return 0; }
      return n;
    }), 50);
    return () => clearInterval(t);
  }, [paused, closed, isQuiz]);

  const go = (d: number) => {
    setI((x) => clamp(x + d, 0, stories.length - 1));
    setP(0);
    sfxRaw.swipe();
  };
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    down.current = { t: performance.now(), x: e.clientX, y: e.clientY };
    setPaused(true);
  };
  const onMove = (e: React.PointerEvent) => { if (down.current) setDrag(Math.max(0, e.clientY - down.current.y)); };
  const onUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    setPaused(false);
    if (!d) return;
    if (drag > 90) { setClosed(true); setDrag(0); sfxRaw.thud(); return; }
    setDrag(0);
    if (performance.now() - d.t < 240 && box.current) {
      const r = box.current.getBoundingClientRect();
      go(e.clientX - r.left < r.width * 0.35 ? -1 : 1);
    }
  };
  const pick = (k: number) => {
    if (answer !== null) return;
    setAnswer(k);
    k === 1 ? sfx.correct() : sfx.wrong();
  };
  const restart = () => { setI(0); setP(0); setAnswer(null); setClosed(false); };

  return (
    <Asset code="LS-01" title="Story Lesson" desc="Микро-урок в формате сторис: тап влево/вправо, удержание — пауза, свайп вниз — закрыть, финальный вопрос." hint="Тапай, держи, свайпай вниз" specs={["auto 4.2s", "hold-pause", "swipe-close"]} className="xl:row-span-2">
      <div className="mx-auto w-full max-w-[300px]">
        {closed ? (
          <div className="anim-pop grid h-[520px] place-items-center rounded-[30px] border-2 border-dashed border-ink-500 text-center">
            <div>
              <Mascot size={100} mood="sad" />
              <div className="mt-2 text-sm font-bold">Сторис закрыт</div>
              <Btn tone="sky" size="sm" className="mt-3" onClick={restart}>Open again</Btn>
            </div>
          </div>
        ) : (
          <div
            ref={box}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={() => { if (down.current) { down.current = null; setPaused(false); setDrag(0); } }}
            className={cn("relative h-[520px] touch-none select-none overflow-hidden rounded-[30px] bg-gradient-to-b shadow-[0_10px_0_#060b18,0_30px_50px_-10px_rgba(0,0,0,.7)]", stories[i].bg)}
            style={{ transform: `translateY(${drag}px) scale(${1 - drag / 1400})`, borderRadius: 30 + drag / 6, transition: drag ? "none" : "transform .35s cubic-bezier(.3,1.4,.5,1), background .4s" }}
          >
            <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
              {stories.map((_, k) => (
                <div key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white" style={{ width: `${k < i ? 100 : k === i ? (isQuiz ? 100 : p * 100) : 0}%` }} />
                </div>
              ))}
            </div>
            <div className="absolute inset-x-3 top-7 z-10 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sky text-[10px] font-black">T</span>
              <span className="text-[11px] font-extrabold">Toro · Candles 101</span>
              <span className="ml-auto flex items-center gap-2 text-white/80">
                {paused ? <Pause size={14} /> : <Play size={14} />}
                <button onClick={() => { setClosed(true); sfxRaw.thud(); }} aria-label="Close"><X size={16} /></button>
              </span>
            </div>
            <div key={i} className="anim-fade flex h-full flex-col px-5 pb-6 pt-20">
              <div className="grid h-52 place-items-center">{stories[i].art(i)}</div>
              <div className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-gold">{stories[i].kicker}</div>
              <div className="font-display mt-1 text-xl font-extrabold leading-tight">{stories[i].title}</div>
              {stories[i].text && <p className="mt-2 text-[13px] leading-snug text-snow/80">{stories[i].text}</p>}
              {isQuiz && (
                <div className="mt-4 space-y-2">
                  {["Объём торгов", "Минимум цены за период", "Цену открытия"].map((o, k) => {
                    const st = answer === null ? "idle" : k === 1 ? "ok" : answer === k ? "bad" : "idle";
                    return (
                      <button key={o} onClick={() => pick(k)} className={cn("flex h-11 w-full items-center justify-between rounded-2xl border-2 px-4 text-left text-[13px] font-extrabold transition", st === "ok" ? "border-bull bg-bull/20 text-bull" : st === "bad" ? "anim-shake border-bear bg-bear/20 text-bear" : "border-white/20 bg-white/10")}>
                        {o}{st === "ok" && <Check size={16} className="anim-pop" />}
                      </button>
                    );
                  })}
                  {answer !== null && <Btn tone="bull" block size="sm" className="mt-2" onClick={restart}><RotateCcw size={14} /> Replay lesson</Btn>}
                </div>
              )}
              {!isQuiz && <div className="mt-auto flex justify-between text-[10px] font-bold text-white/50"><span>◀ tap</span><span>hold ⏸</span><span>tap ▶</span></div>}
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* ======================================================================
   L-02  SCROLLYTELLING EXPLAINER — sticky chart reacts to scrolled steps
   ==================================================================== */
const storyCloses = [100, 99, 101, 100.5, 102, 101.2, 103, 102.4, 104.2, 103.3, 101.8, 102.6, 104, 103.1, 105.2, 104.4, 106.5, 105.8, 105.2, 107.9, 110.4, 109.6];
const steps = [
  { t: "Это просто свечи", d: "22 периода цены. Пока без анализа — посмотри на общую картину.", c: "#8a9bc4" },
  { t: "Восходящий тренд", d: "Минимумы повышаются: каждый откат заканчивается выше предыдущего.", c: "#22d39a" },
  { t: "Уровень сопротивления", d: "Цена трижды упиралась в 104–105. Продавцы защищают эту зону.", c: "#ff4f6d" },
  { t: "Пробой на объёме", d: "Большая зелёная свеча закрылась выше уровня — сигнал продолжения.", c: "#ffc53d" },
  { t: "Где стоп?", d: "Стоп — под последним минимумом. Риск известен до входа в сделку.", c: "#3b82ff" },
];
function Scrollytelling() {
  const data = useMemo(() => fromCloses(storyCloses, 0.8, 99.5), []);
  const [step, setStep] = useState(0);
  const [prog, setProg] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const seen = useRef(new Set<number>());

  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        const k = Number((e.target as HTMLElement).dataset.step);
        setStep(k);
        if (!seen.current.has(k)) { seen.current.add(k); sfxRaw.pop(); if (seen.current.size === steps.length) sfx.levelUp(); }
      }
    }), { root: r, threshold: 0.6 });
    refs.current.forEach((el) => el && io.observe(el));
    const sc = () => setProg(r.scrollTop / Math.max(1, r.scrollHeight - r.clientHeight));
    r.addEventListener("scroll", sc, { passive: true });
    return () => { io.disconnect(); r.removeEventListener("scroll", sc); };
  }, []);

  return (
    <Asset code="LS-02" title="Scrollytelling Explainer" desc="Прокручиваешь объяснение — график сам подсвечивает тренд, уровень, пробой и стоп. Закрытие всех шагов = +XP." hint="Скролль внутри карточки" specs={["sticky chart", "IO steps", "5 states"]} className="md:col-span-2 xl:col-span-2">
      <div className="grid gap-4 md:grid-cols-[1.25fr_1fr]">
        <div className="panel-inset relative overflow-hidden p-3 !rounded-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span key={step} className="anim-pop text-[11px] font-extrabold uppercase tracking-widest" style={{ color: steps[step].c }}>{steps[step].t}</span>
            <span className="num text-[10px] text-mist">step {step + 1}/5</span>
          </div>
          <CandleChart
            data={data}
            W={340}
            H={210}
            animate={false}
            highlight={step === 3 ? [20] : step === 1 ? [1, 5, 7, 10, 13, 18] : undefined}
            dimOthers={step === 3}
            volume
            under={(s) => (
              <>
                {step >= 2 && <rect x="0" y={s.y(105.4)} width={s.W} height={s.y(103.6) - s.y(105.4)} fill="#ff4f6d" opacity=".12" style={{ animation: "fade-in .4s both" }} />}
                {step >= 4 && <rect x={s.x(18) - 4} y={s.y(104.6)} width={s.W - s.x(18) + 4} height={s.y(103.4) - s.y(104.6)} fill="#3b82ff" opacity=".18" style={{ animation: "fade-in .4s both" }} />}
              </>
            )}
          >
            {(s) => (
              <>
                {step >= 1 && <path d={`M${s.x(1)} ${s.y(98.2)} L${s.x(18)} ${s.y(104.3)}`} stroke="#22d39a" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="400" style={{ ["--len" as string]: "400", animation: "draw 1s both ease-out" }} />}
                {step >= 2 && <line x1="0" x2={s.W} y1={s.y(104.6)} y2={s.y(104.6)} stroke="#ff4f6d" strokeWidth="1.5" strokeDasharray="5 4" />}
                {step >= 2 && [8, 12, 14].map((k) => <circle key={k} cx={s.x(k)} cy={s.y(data[k].h)} r="5" fill="none" stroke="#ff4f6d" strokeWidth="2" style={{ animation: "pop-in .4s both" }} />)}
                {step >= 3 && <g style={{ animation: "pop-in .45s both" }}><rect x={s.x(20) - 28} y={s.y(111.8)} width="56" height="15" rx="5" fill="#ffc53d" /><text x={s.x(20)} y={s.y(111.8) + 11} textAnchor="middle" fontSize="9" fontWeight="900" fill="#0a1224">BREAKOUT</text></g>}
                {step >= 4 && <g><line x1={s.x(18) - 4} x2={s.W} y1={s.y(103.4)} y2={s.y(103.4)} stroke="#3b82ff" strokeWidth="2" /><text x={s.W - 6} y={s.y(103.4) + 12} textAnchor="end" fontSize="9" fontWeight="900" fill="#3b82ff">STOP 103.4</text></g>}
              </>
            )}
          </CandleChart>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full bg-gradient-to-r from-sky to-gold transition-[width] duration-150" style={{ width: `${prog * 100}%` }} /></div>
        </div>
        <div ref={root} className="no-scrollbar relative h-[300px] snap-y snap-mandatory overflow-y-auto rounded-2xl md:h-[290px]">
          {steps.map((st, k) => (
            <div key={st.t} ref={(el) => { refs.current[k] = el; }} data-step={k} className="flex h-[290px] snap-start items-center">
              <div className={cn("w-full rounded-2xl border-2 p-4 transition-all duration-500", step === k ? "scale-100 opacity-100" : "scale-95 opacity-40")} style={{ borderColor: step === k ? st.c : "transparent", background: step === k ? `${st.c}14` : "#111d3a" }}>
                <div className="num text-[10px] font-extrabold" style={{ color: st.c }}>0{k + 1}</div>
                <div className="font-display mt-1 text-lg font-extrabold">{st.t}</div>
                <p className="mt-1.5 text-[13px] leading-snug text-mist">{st.d}</p>
                {k < steps.length - 1 && <div className="mt-3 text-[10px] font-bold text-mist/70">↓ scroll</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ======================================================================
   L-03  BEFORE / AFTER COMPARE SLIDER — why stop-loss matters
   ==================================================================== */
function curve(seed: number, n: number, stop: boolean) {
  const pts: number[] = [];
  let v = 100;
  for (let i = 0; i < n; i++) {
    const shock = i === 12 || i === 27 ? -18 : 0;
    const noise = Math.sin(i * 1.7 + seed) * 2.2 + Math.cos(i * 0.6) * 1.2;
    let d = noise + 0.9 + shock;
    if (stop) d = Math.max(d, -3.2);
    v = Math.max(20, v + d);
    pts.push(v);
  }
  return pts;
}
function CompareSlider() {
  const [pos, setPos] = useState(50);
  const [drag, setDrag] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const a = useMemo(() => curve(1, 40, false), []);
  const b = useMemo(() => curve(1, 40, true), []);
  const all = [...a, ...b];
  const mn = Math.min(...all) - 5, mx = Math.max(...all) + 5;
  const path = (arr: number[]) => arr.map((v, i) => `${i ? "L" : "M"}${(i / (arr.length - 1)) * 300} ${150 - ((v - mn) / (mx - mn)) * 140}`).join(" ");
  const set = (cx: number) => { const r = box.current!.getBoundingClientRect(); setPos(clamp(((cx - r.left) / r.width) * 100, 0, 100)); };
  const dd = (arr: number[]) => { let peak = arr[0], m = 0; arr.forEach((v) => { peak = Math.max(peak, v); m = Math.min(m, (v - peak) / peak); }); return Math.round(m * 100); };
  return (
    <Asset code="LS-03" title="Before / After Slider" desc="Одна стратегия, два исхода: без стоп-лосса и со стоп-лоссом. Двигай шторку и сравни просадку." hint="Тяни шторку" specs={["clip-path", "drag + keys", "real maths"]}>
      <div
        ref={box}
        className="relative h-52 touch-none select-none overflow-hidden rounded-2xl bg-ink-950"
        onPointerDown={(e) => { setDrag(true); set(e.clientX); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (drag) { set(e.clientX); if (Math.round(pos) % 10 === 0) sfx.tick(); } }}
        onPointerUp={() => setDrag(false)}
      >
        <div className="absolute inset-0 grid-bg bg-[#2e0f1d]/60">
          <svg viewBox="0 0 300 150" preserveAspectRatio="none" className="h-full w-full">
            <path d={path(a)} fill="none" stroke={BEAR} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <path d={`${path(a)} L300 150 L0 150Z`} fill={BEAR} opacity=".12" />
          </svg>
          <span className="absolute right-3 top-3 rounded-lg bg-bear/25 px-2 py-1 text-[10px] font-extrabold uppercase text-bear">No stop-loss</span>
        </div>
        <div className="absolute inset-0 grid-bg bg-[#0b2f2a]" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <svg viewBox="0 0 300 150" preserveAspectRatio="none" className="h-full w-full">
            <path d={path(b)} fill="none" stroke={BULL} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            <path d={`${path(b)} L300 150 L0 150Z`} fill={BULL} opacity=".14" />
          </svg>
          <span className="absolute left-3 top-3 rounded-lg bg-bull/25 px-2 py-1 text-[10px] font-extrabold uppercase text-bull">With stop-loss</span>
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_#fff]" style={{ left: `${pos}%` }}>
          <button
            aria-label="Compare handle"
            onKeyDown={(e) => { if (e.key === "ArrowLeft") setPos((p) => clamp(p - 5, 0, 100)); if (e.key === "ArrowRight") setPos((p) => clamp(p + 5, 0, 100)); }}
            className={cn("absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink-900 shadow-[0_4px_0_#8ea3d6,0_10px_20px_rgba(0,0,0,.5)] transition-transform", drag && "scale-110")}
          >
            <ArrowLeftRight size={18} />
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className={cn("rounded-2xl p-3 transition-all", pos > 50 ? "bg-bull/15 ring-2 ring-bull" : "bg-ink-800")}>
          <div className="text-[10px] font-extrabold uppercase text-bull">With stop</div>
          <div className="num text-lg font-extrabold">{dd(b)}% <span className="text-[10px] text-mist">max DD</span></div>
          <div className="num text-[11px] text-mist">final {b[b.length - 1].toFixed(0)}</div>
        </div>
        <div className={cn("rounded-2xl p-3 transition-all", pos <= 50 ? "bg-bear/15 ring-2 ring-bear" : "bg-ink-800")}>
          <div className="text-[10px] font-extrabold uppercase text-bear">No stop</div>
          <div className="num text-lg font-extrabold">{dd(a)}% <span className="text-[10px] text-mist">max DD</span></div>
          <div className="num text-[11px] text-mist">final {a[a.length - 1].toFixed(0)}</div>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-snug text-mist">Стоп-лосс режет каждое падение до −3.2%. Две «чёрные» свечи больше не уничтожают депозит.</p>
    </Asset>
  );
}

/* ======================================================================
   L-04  HOTSPOT CHART TOUR — guided exploration with pins
   ==================================================================== */
const tourCloses = [110, 108, 106.5, 107.5, 105, 103.4, 104.6, 102, 100.5, 101.8, 99.8, 100.4, 103.6, 105.2, 104.4, 107, 108.6, 107.6, 110.2, 111.5];
const pins = [
  { i: 4, t: "Нисходящий тренд", d: "Максимумы и минимумы снижаются. Покупать против тренда рискованно.", c: "#ff4f6d" },
  { i: 10, t: "Дно и поддержка", d: "Цена дважды остановилась у 99.8 — здесь сидят покупатели.", c: "#22d39a" },
  { i: 12, t: "Разворотная свеча", d: "Большая зелёная свеча поглотила несколько предыдущих — смена настроения.", c: "#ffc53d" },
  { i: 18, t: "Новый тренд", d: "Повышающиеся минимумы подтверждают: тренд развернулся вверх.", c: "#3b82ff" },
];
function HotspotTour() {
  const data = useMemo(() => fromCloses(tourCloses, 0.9, 111), []);
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<number[]>([]);
  const { celebrate } = useGame();
  const visit = (k: number) => {
    setOpen(k);
    sfxRaw.pop();
    if (!seen.includes(k)) {
      const n = [...seen, k];
      setSeen(n);
      if (n.length === pins.length) { sfx.levelUp(); celebrate("Тур пройден!", "Ты прочитал график целиком"); }
    }
  };
  return (
    <Asset code="LS-04" title="Guided Chart Tour" desc="Пульсирующие метки на реальном графике. Открой все четыре, чтобы прочитать историю рынка." hint="Тапай по меткам" specs={["4 hotspots", "prev/next", "completion"]}>
      <div className="panel-inset relative p-2 !rounded-2xl">
        <CandleChart data={data} W={320} H={190} animate={false} highlight={open !== null ? [pins[open].i] : undefined} dimOthers={open !== null}>
          {(s) => pins.map((p, k) => {
            const d = data[p.i];
            const y = k === 1 ? s.y(d.l) + 14 : s.y(d.h) - 14;
            return (
              <g key={k} onClick={() => visit(k)} style={{ cursor: "pointer" }}>
                {!seen.includes(k) && <circle cx={s.x(p.i)} cy={y} r="12" fill={p.c} opacity=".35" style={{ transformOrigin: `${s.x(p.i)}px ${y}px`, animation: "pulse-ring 1.6s infinite" }} />}
                <circle cx={s.x(p.i)} cy={y} r="9" fill={seen.includes(k) ? p.c : "#0a1224"} stroke={p.c} strokeWidth="2.5" />
                <text x={s.x(p.i)} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="900" fill={seen.includes(k) ? "#0a1224" : p.c}>{seen.includes(k) ? "✓" : k + 1}</text>
              </g>
            );
          })}
        </CandleChart>
      </div>
      <div className="relative mt-3 min-h-[108px]">
        {open === null ? (
          <div className="flex items-center gap-3 rounded-2xl bg-ink-800 p-3">
            <MapPin size={20} className="text-sky" />
            <div className="text-[12px] text-mist">Нажми на цифру на графике, чтобы начать тур.</div>
          </div>
        ) : (
          <div key={open} className="anim-slide-right rounded-2xl border-2 p-3" style={{ borderColor: pins[open].c, background: `${pins[open].c}14` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase" style={{ color: pins[open].c }}>Stop {open + 1} / 4</span>
              <div className="flex gap-1">
                <button disabled={open === 0} onClick={() => visit(open - 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-ink-800 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <button disabled={open === pins.length - 1} onClick={() => visit(open + 1)} className="grid h-7 w-7 place-items-center rounded-lg bg-ink-800 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
            <div className="font-display mt-1 text-base font-extrabold">{pins[open].t}</div>
            <p className="text-[12px] leading-snug text-snow/80">{pins[open].d}</p>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1"><Bar value={(seen.length / pins.length) * 100} tone="gold" h={10} /></div>
        <span className="num text-[11px] font-bold text-mist">{seen.length}/4</span>
      </div>
    </Asset>
  );
}

/* ======================================================================
   L-05  FLASHCARDS with spaced repetition — flip, swipe, rate
   ==================================================================== */
const deck = [
  { f: "Stop-loss", b: "Ордер, который закроет позицию при достижении заданной цены убытка." },
  { f: "Take-profit", b: "Ордер, фиксирующий прибыль на заранее выбранном уровне." },
  { f: "Спред", b: "Разница между лучшей ценой покупки и продажи." },
  { f: "Плечо", b: "Заёмные средства, умножающие и прибыль, и убыток." },
  { f: "Ликвидность", b: "Насколько легко купить/продать без сильного сдвига цены." },
  { f: "Волатильность", b: "Насколько сильно и быстро меняется цена." },
  { f: "DCA", b: "Покупка на одинаковую сумму через равные интервалы." },
];
function Flashcards() {
  const [queue, setQueue] = useState(deck.map((_, i) => i));
  const [flip, setFlip] = useState(false);
  const [mastered, setMastered] = useState<number[]>([]);
  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const start = useRef<number | null>(null);
  const moved = useRef(false);
  const top = queue[0];

  const rate = (r: "again" | "good" | "easy") => {
    if (top === undefined) return;
    setFly(r === "again" ? -1 : 1);
    if (r === "again") sfx.wrong(); else if (r === "easy") sfx.coin(); else sfx.correct();
    setTimeout(() => {
      setQueue((q) => {
        const [h, ...rest] = q;
        if (r === "again") { const n = [...rest]; n.splice(Math.min(2, n.length), 0, h); return n; }
        return rest;
      });
      if (r !== "again") setMastered((m) => [...m, top]);
      setFlip(false);
      setFly(0);
      setDx(0);
    }, 260);
  };
  useEffect(() => { if (queue.length === 0 && mastered.length) sfx.levelUp(); }, [queue.length]); // eslint-disable-line

  return (
    <Asset code="LS-05" title="Spaced-repetition Flashcards" desc="3D-переворот, свайп вправо = «знаю», влево = «повторить». Сложные карточки возвращаются в колоду." hint="Тап — перевернуть, свайп — оценить" specs={["3D flip", "SRS queue", "swipe rate"]}>
      <div className="mb-3 flex items-center justify-between text-[11px] font-bold">
        <span className="text-mist">В колоде: <span className="num text-white">{queue.length}</span></span>
        <span className="text-bull">Выучено: <span className="num">{mastered.length}</span>/{deck.length}</span>
      </div>
      <div className="relative h-56 [perspective:900px]">
        {queue.length === 0 ? (
          <div className="anim-pop grid h-full place-items-center rounded-3xl bg-gradient-to-br from-bull/20 to-sky/20 text-center">
            <div>
              <Sparkles size={34} className="mx-auto text-gold" />
              <div className="font-display mt-2 text-lg font-extrabold">Колода пройдена!</div>
              <GhostBtn className="mt-3 !h-10" onClick={() => { setQueue(deck.map((_, i) => i)); setMastered([]); }}>Again</GhostBtn>
            </div>
          </div>
        ) : (
          queue.slice(0, 3).reverse().map((ci, rk) => {
            const depth = Math.min(2, queue.slice(0, 3).length - 1 - rk);
            const isTop = depth === 0;
            const tx = isTop ? (fly ? fly * 420 : dx) : 0;
            return (
              <div
                key={ci}
                className="absolute inset-0"
                style={{ transform: `translateY(${depth * 12}px) scale(${1 - depth * 0.05}) translateX(${tx}px) rotate(${isTop ? tx / 18 : 0}deg)`, transition: start.current !== null && isTop ? "none" : "transform .35s cubic-bezier(.3,1.3,.5,1)", zIndex: 10 - depth }}
                onPointerDown={isTop ? (e) => { start.current = e.clientX; moved.current = false; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } : undefined}
                onPointerMove={isTop ? (e) => { if (start.current !== null) { const d = e.clientX - start.current; if (Math.abs(d) > 6) moved.current = true; setDx(d); } } : undefined}
                onPointerUp={isTop ? () => {
                  const d = dx;
                  start.current = null;
                  if (!moved.current) { setFlip((f) => !f); sfxRaw.swipe(); return; }
                  if (d > 100) rate("good"); else if (d < -100) rate("again"); else setDx(0);
                } : undefined}
              >
                <div className="relative h-full w-full cursor-grab transition-transform duration-500 [transform-style:preserve-3d] active:cursor-grabbing" style={{ transform: isTop && flip ? "rotateY(180deg)" : undefined }}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-ink-600 to-ink-800 p-5 text-center shadow-[0_8px_0_#08112a] [backface-visibility:hidden]">
                    <BookOpen size={22} className="text-sky" />
                    <div className="font-display mt-2 text-2xl font-black">{deck[ci].f}</div>
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-mist">tap to flip</div>
                    {isTop && dx > 40 && <span className="absolute left-4 top-4 rotate-[-12deg] rounded-lg border-2 border-bull px-2 text-sm font-black text-bull" style={{ opacity: clamp(dx / 100, 0, 1) }}>KNOW</span>}
                    {isTop && dx < -40 && <span className="absolute right-4 top-4 rotate-[12deg] rounded-lg border-2 border-bear px-2 text-sm font-black text-bear" style={{ opacity: clamp(-dx / 100, 0, 1) }}>AGAIN</span>}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-gold/30 bg-gradient-to-br from-[#2e2208] to-ink-800 p-5 text-center shadow-[0_8px_0_#08112a] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <p className="text-[15px] font-bold leading-snug">{deck[ci].b}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Btn tone="bear" size="sm" disabled={!queue.length} onClick={() => rate("again")} silent>Again</Btn>
        <Btn tone="sky" size="sm" disabled={!queue.length} onClick={() => rate("good")} silent>Good</Btn>
        <Btn tone="bull" size="sm" disabled={!queue.length} onClick={() => rate("easy")} silent>Easy</Btn>
      </div>
    </Asset>
  );
}

/* ======================================================================
   L-06  PATTERN COVERFLOW — 3D carousel with drag, inertia and quiz
   ==================================================================== */
const patterns = [
  { n: "Hammer", bull: true, c: [[3, 2.6, 3.1, 0.2]], d: "Длинная нижняя тень после падения — покупатели выкупили." },
  { n: "Shooting Star", bull: false, c: [[1, 1.4, 4, 0.9]], d: "Длинная верхняя тень на вершине — продавцы вернули цену." },
  { n: "Bullish Engulfing", bull: true, c: [[2.6, 1.8, 2.8, 1.6], [1.5, 3.2, 3.4, 1.3]], d: "Зелёная свеча полностью поглощает красную." },
  { n: "Bearish Engulfing", bull: false, c: [[1.8, 2.6, 2.8, 1.6], [3.2, 1.3, 3.4, 1.1]], d: "Красная свеча поглощает зелёную — давление продаж." },
  { n: "Doji", bull: null as unknown as boolean, c: [[2.2, 2.25, 3.6, 0.8]], d: "Открытие ≈ закрытие: рынок не может решить." },
  { n: "Morning Star", bull: true, c: [[3.4, 2, 3.5, 1.9], [1.8, 1.9, 2.1, 1.4], [2, 3.3, 3.5, 1.9]], d: "Три свечи: падение, пауза, сильный рост." },
  { n: "Three Black Crows", bull: false, c: [[3.6, 2.9, 3.7, 2.8], [3, 2.2, 3.1, 2.1], [2.3, 1.4, 2.4, 1.3]], d: "Три красные свечи подряд — сильный медвежий импульс." },
];
function MiniPattern({ c }: { c: number[][] }) {
  const w = 100, h = 90;
  const y = (v: number) => h - 8 - (v / 4) * (h - 16);
  const gap = w / (c.length + 1);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      {c.map(([o, cl, hi, lo], i) => {
        const up = cl >= o, col = Math.abs(cl - o) < 0.1 ? "#ffc53d" : up ? BULL : BEAR, x = gap * (i + 1);
        return (
          <g key={i}>
            <rect x={x - 1} y={y(hi)} width="2" height={y(lo) - y(hi)} fill={col} />
            <rect x={x - 8} y={y(Math.max(o, cl))} width="16" height={Math.max(2, Math.abs(y(o) - y(cl)))} rx="2.5" fill={col} />
          </g>
        );
      })}
    </svg>
  );
}
function Coverflow() {
  const [pos, setPos] = useState(2);
  const [drag, setDrag] = useState<{ x: number; p: number } | null>(null);
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const active = clamp(Math.round(pos), 0, patterns.length - 1);
  const settle = () => { setPos((p) => { const r = clamp(Math.round(p), 0, patterns.length - 1); if (r !== active) sfxRaw.swipe(); return r; }); setDrag(null); };
  const ask = (guess: boolean | null) => {
    const truth = patterns[active].bull ?? null;
    const ok = guess === truth;
    setAnswered((a) => ({ ...a, [active]: ok }));
    ok ? sfx.correct() : sfx.wrong();
  };
  return (
    <Asset code="LS-06" title="Pattern Coverflow" desc="3D-карусель свечных паттернов: тащи, листай стрелками, тапни боковую карточку. Каждую можно проверить." hint="Тащи карусель" specs={["3D coverflow", "drag snap", "inline quiz"]} className="md:col-span-2 xl:col-span-1">
      <div
        className="relative h-56 touch-pan-y select-none overflow-hidden [perspective:900px]"
        onPointerDown={(e) => { setDrag({ x: e.clientX, p: pos }); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (drag) setPos(clamp(drag.p - (e.clientX - drag.x) / 130, -0.4, patterns.length - 0.6)); }}
        onPointerUp={settle}
      >
        {patterns.map((p, i) => {
          const off = i - pos;
          const a = Math.abs(off);
          return (
            <button
              key={p.n}
              onClick={() => { if (a > 0.5) { setPos(i); sfxRaw.swipe(); } }}
              className="absolute left-1/2 top-2 w-40 -ml-20 rounded-3xl border border-white/10 bg-gradient-to-b from-ink-600 to-ink-800 p-3 text-center shadow-[0_8px_0_#08112a,0_20px_30px_rgba(0,0,0,.5)]"
              style={{
                transform: `translateX(${off * 105}px) translateZ(${-a * 90}px) rotateY(${clamp(-off * 38, -60, 60)}deg) scale(${1 - Math.min(a, 2) * 0.08})`,
                zIndex: 50 - Math.round(a * 10),
                opacity: a > 3 ? 0 : 1 - a * 0.18,
                transition: drag ? "none" : "transform .5s cubic-bezier(.3,1.3,.5,1), opacity .4s",
              }}
            >
              <MiniPattern c={p.c} />
              <div className="font-display text-[13px] font-extrabold leading-tight">{p.n}</div>
              {answered[i] !== undefined && <span className={cn("mt-1 inline-block rounded-md px-1.5 text-[9px] font-extrabold", answered[i] ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>{answered[i] ? "✓ solved" : "✗ retry"}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-1.5">
        {patterns.map((_, i) => <button key={i} onClick={() => setPos(i)} className="h-2 rounded-full transition-all" style={{ width: i === active ? 22 : 8, background: i === active ? "#3b82ff" : "#273f75" }} />)}
      </div>
      <div key={active} className="anim-fade mt-3 rounded-2xl bg-ink-800 p-3">
        <p className="text-[12px] leading-snug text-mist">{patterns[active].d}</p>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <button onClick={() => ask(true)} className="h-9 rounded-xl bg-bull/15 text-[11px] font-extrabold text-bull ring-1 ring-bull/40 active:translate-y-0.5">▲ Bullish</button>
          <button onClick={() => ask(null)} className="h-9 rounded-xl bg-gold/15 text-[11px] font-extrabold text-gold ring-1 ring-gold/40 active:translate-y-0.5">◆ Neutral</button>
          <button onClick={() => ask(false)} className="h-9 rounded-xl bg-bear/15 text-[11px] font-extrabold text-bear ring-1 ring-bear/40 active:translate-y-0.5">▼ Bearish</button>
        </div>
      </div>
    </Asset>
  );
}

/* ======================================================================
   L-07  LEVERAGE EXPLORABLE — interactive explanation + check
   ==================================================================== */
function LeverageExplorer() {
  const [lev, setLev] = useState(5);
  const [move, setMove] = useState(-4);
  const [ans, setAns] = useState<number | null>(null);
  const pnl = move * lev;
  const liq = pnl <= -100;
  const equity = liq ? 0 : 100 + pnl;
  const liqMove = -(100 / lev);
  return (
    <Asset code="LS-07" title="Explorable: Leverage" desc="Объяснение, с которым можно играть: крути плечо и движение цены — смотри, как тает или растёт депозит." hint="Двигай оба слайдера" specs={["live model", "liquidation", "check q"]}>
      <div className="relative h-40 overflow-hidden rounded-2xl bg-ink-950 p-3">
        <div className="absolute inset-x-3 bottom-3 top-10 flex items-end gap-4">
          <div className="flex h-full flex-1 flex-col justify-end">
            <div className="rounded-t-xl bg-gradient-to-t from-sky-d to-sky shadow-[0_0_14px_rgba(59,130,255,.5)]" style={{ height: "50%" }} />
            <div className="mt-1 text-center text-[9px] font-extrabold uppercase text-mist">Start $100</div>
          </div>
          <div className="flex h-full flex-1 flex-col justify-end">
            <div className={cn("rounded-t-xl transition-all duration-500 [transition-timing-function:cubic-bezier(.3,1.4,.5,1)]", liq && "anim-shake")} style={{ height: `${clamp(equity / 2, 0, 100)}%`, background: pnl >= 0 ? "linear-gradient(0deg,#10916a,#22d39a)" : "linear-gradient(0deg,#c02a47,#ff4f6d)", boxShadow: `0 0 16px ${pnl >= 0 ? "#22d39a88" : "#ff4f6d88"}` }} />
            <div className="mt-1 text-center text-[9px] font-extrabold uppercase text-mist">Now</div>
          </div>
        </div>
        <div className="relative flex items-start justify-between">
          <span className="num text-2xl font-extrabold" style={{ color: pnl >= 0 ? BULL : BEAR }}>{liq ? "LIQUIDATED" : `$${equity.toFixed(0)}`}</span>
          <span className="num rounded-lg bg-ink-800 px-2 py-1 text-[11px] font-bold">{pnl >= 0 ? "+" : ""}{Math.max(-100, pnl).toFixed(0)}%</span>
        </div>
      </div>
      {[["Leverage", lev, 1, 20, setLev, `${lev}x`, "#ffc53d"], ["Price move", move, -15, 15, setMove, `${move > 0 ? "+" : ""}${move}%`, move >= 0 ? BULL : BEAR]].map(([l, v, mn, mx, set, lbl, c]) => (
        <div key={l as string} className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">{l as string}</span><span className="num" style={{ color: c as string }}>{lbl as string}</span></div>
          <input type="range" min={mn as number} max={mx as number} value={v as number} onChange={(e) => { (set as (n: number) => void)(+e.target.value); sfx.tick(); }} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: c as string, background: `linear-gradient(90deg, ${c} ${(((v as number) - (mn as number)) / ((mx as number) - (mn as number))) * 100}%, #0b1530 0)` }} />
        </div>
      ))}
      <div className="mt-3 rounded-xl bg-ink-800 p-2.5 text-[11px] text-mist">При {lev}x ликвидация наступает при движении <span className="num font-extrabold text-bear">{liqMove.toFixed(1)}%</span></div>
      <div className="mt-3">
        <div className="text-[12px] font-extrabold">Проверка: какое падение ликвидирует позицию 10x?</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[-5, -10, -20].map((m) => (
            <button key={m} disabled={ans !== null} onClick={() => { setAns(m); m === -10 ? sfx.correct() : sfx.wrong(); }} className={cn("num h-10 rounded-xl text-[12px] font-extrabold transition", ans === null ? "bg-ink-700 shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none" : m === -10 ? "bg-bull/20 text-bull ring-2 ring-bull" : ans === m ? "anim-shake bg-bear/20 text-bear ring-2 ring-bear" : "bg-ink-800 text-mist")}>
              {m}%
            </button>
          ))}
        </div>
        {ans !== null && <button onClick={() => setAns(null)} className="mt-2 text-[11px] font-bold text-sky">Try again</button>}
      </div>
    </Asset>
  );
}

/* ======================================================================
   L-08  HISTORY TIMELINE — native snap scroll with scroll-linked scale
   ==================================================================== */
const history = [
  { y: "2008", t: "Whitepaper", d: "Сатоси публикует описание Bitcoin.", c: "#8a9bc4" },
  { y: "2010", t: "Пицца за 10 000 BTC", d: "Первая известная покупка за биткоин.", c: "#ffc53d" },
  { y: "2015", t: "Ethereum", d: "Смарт-контракты открывают DeFi.", c: "#8b5cff" },
  { y: "2017", t: "Первый бум", d: "BTC почти $20 000, волна ICO.", c: "#22d39a" },
  { y: "2018", t: "Крипто-зима", d: "Падение на 80%+. Урок про риск.", c: "#ff4f6d" },
  { y: "2021", t: "ATH $69k", d: "Институционалы и NFT.", c: "#22d39a" },
  { y: "2022", t: "Крах FTX", d: "Не твои ключи — не твои монеты.", c: "#ff4f6d" },
  { y: "2024", t: "Spot ETF", d: "Биткоин входит в традиционные рынки.", c: "#3b82ff" },
];
function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [sc, setSc] = useState({ left: 0, max: 1, w: 1 });
  const [read, setRead] = useState<number[]>([]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => setSc({ left: el.scrollLeft, max: el.scrollWidth - el.clientWidth, w: el.clientWidth });
    on();
    el.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { el.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  const CARD = 196;
  const center = sc.left + sc.w / 2;
  const active = clamp(Math.round((center - CARD / 2 - 16) / (CARD + 12)), 0, history.length - 1);
  useEffect(() => {
    if (!read.includes(active)) {
      const n = [...read, active];
      setRead(n);
      sfx.tick();
      if (n.length === history.length) sfx.levelUp();
    }
  }, [active]); // eslint-disable-line
  const by = (d: number) => ref.current?.scrollBy({ left: d * (CARD + 12), behavior: "smooth" });
  return (
    <Asset code="LS-08" title="History Timeline" desc="Нативный свайп со snap: карточки масштабируются по расстоянию до центра, прогресс привязан к скроллу." hint="Свайпай горизонтально" specs={["scroll-snap", "distance scale", "read tracking"]} className="md:col-span-2 xl:col-span-2">
      <div className="relative">
        <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 py-4" style={{ scrollPaddingInline: `calc(50% - ${CARD / 2}px)` }}>
          <div className="shrink-0" style={{ width: `calc(50% - ${CARD / 2 + 16}px)` }} />
          {history.map((h, i) => {
            const cx = 16 + (sc.w / 2 - CARD / 2 - 16) + i * (CARD + 12) + CARD / 2;
            const dist = clamp(Math.abs(cx - center) / (CARD * 1.6), 0, 1);
            return (
              <div key={h.y} className="shrink-0 snap-center" style={{ width: CARD }}>
                <div className="rounded-3xl border p-4 transition-colors" style={{ transform: `scale(${1 - dist * 0.14}) translateY(${dist * 14}px)`, opacity: 1 - dist * 0.55, borderColor: i === active ? h.c : "rgba(255,255,255,.08)", background: i === active ? `linear-gradient(160deg, ${h.c}26, #16264a)` : "#16264a", boxShadow: i === active ? `0 8px 0 #08112a, 0 0 30px ${h.c}33` : "0 6px 0 #08112a" }}>
                  <div className="num text-3xl font-black" style={{ color: h.c }}>{h.y}</div>
                  <div className="font-display mt-1 text-[14px] font-extrabold">{h.t}</div>
                  <p className="mt-1 text-[11px] leading-snug text-mist">{h.d}</p>
                  {read.includes(i) && <Check size={14} className="mt-2 text-bull" />}
                </div>
              </div>
            );
          })}
          <div className="shrink-0" style={{ width: `calc(50% - ${CARD / 2 + 16}px)` }} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#132447] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#132447] to-transparent" />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button onClick={() => by(-1)} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none"><ChevronLeft size={18} /></button>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-950">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky via-gold to-bull" style={{ width: `${(sc.left / Math.max(1, sc.max)) * 100}%` }} />
          {history.map((_, i) => <span key={i} className="absolute top-0 h-2 w-0.5 bg-ink-900" style={{ left: `${(i / (history.length - 1)) * 100}%` }} />)}
        </div>
        <button onClick={() => by(1)} className="grid h-10 w-10 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a] active:translate-y-[3px] active:shadow-none"><ChevronRight size={18} /></button>
        <Chip tone="gold">{read.length}/{history.length}</Chip>
      </div>
    </Asset>
  );
}

export default function Lessons() {
  return (
    <Section id="learn" index="L" title="Learn · Lesson Formats" subtitle="8 форматов подачи материала: сторис, скроллителлинг, сравнение, тур, карточки, карусель, explorable, лента">
      <StoryLesson />
      <Scrollytelling />
      <CompareSlider />
      <HotspotTour />
      <Flashcards />
      <Coverflow />
      <LeverageExplorer />
      <Timeline />
    </Section>
  );
}
