import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { burstConfetti } from "../utils/fx";
import { clamp } from "../hooks/motion";

/* ============ shared mock screen ============ */
function MockApp({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-[#0a1330] border border-white/10 transition-[filter] duration-500", dim && "brightness-[.35] saturate-50")}>
      <div className="flex items-center gap-2 px-3 h-10 border-b border-white/5">
        <span className="size-7 rounded-lg bg-gradient-to-b from-[#5af5b4] to-[#12c47a] grid place-items-center"><Icon name="trendUp" size={15} stroke={3} className="text-[#03261a]" /></span>
        <span className="font-extrabold text-[12.5px]">Tradelingo</span>
        <span className="ml-auto flex gap-1.5">
          <span className="h-6 px-2 rounded-lg bg-white/5 flex items-center gap-1 text-[10.5px] font-extrabold text-[#ff9a3d]"><Glyph name="flame" size={13} />47</span>
          <span className="h-6 px-2 rounded-lg bg-white/5 flex items-center gap-1 text-[10.5px] font-extrabold text-cyan"><Glyph name="gem" size={13} />1.2k</span>
        </span>
      </div>
      {children}
    </div>
  );
}

/* ============ 1. SPOTLIGHT TOUR ============ */
const TOUR = [
  { t: "Твой путь", d: "Уроки открываются по порядку. Зелёный узел — текущий.", pos: "left" as const },
  { t: "Серия дней", d: "Заходи каждый день — пламя растёт и даёт бонусы.", pos: "right" as const },
  { t: "Начни урок", d: "Одна кнопка — и ты уже учишься. Погнали!", pos: "center" as const },
];
function SpotlightTour() {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const spots = [
    { x: 22, y: 52, r: 46 }, { x: 82, y: 30, r: 40 }, { x: 50, y: 80, r: 56 },
  ];
  const next = () => {
    if (step >= TOUR.length - 1) {
      setStep(-1); setDone(true); sfx.levelUp();
      burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 60, 1);
      setTimeout(() => setDone(false), 2500);
      return;
    }
    setStep(step + 1); sfx.whoosh();
  };
  const s = step >= 0 ? spots[step] : null;
  return (
    <Asset title="Spotlight Tour" id="tour.spot" desc="Классический тур: затемнение + круг-прожектор перетекает между точками, карточка подсказки следует.">
      <div className="relative">
        <MockApp dim={step >= 0}>
          <div className="p-4 flex gap-3">
            <div className="flex flex-col items-center gap-2">
              {[0, 1, 2].map((i) => <span key={i} className={cn("size-11 rounded-full grid place-items-center", i === 1 ? "bg-gradient-to-b from-[#5af5b4] to-[#12c47a] shadow-[0_4px_0_#0d9a5c]" : "bg-[#1c3068]")}>{i === 0 ? <Icon name="check" size={18} stroke={3} /> : i === 1 ? <Icon name="candles" size={18} /> : <Icon name="lock" size={15} className="text-dim" />}</span>)}
            </div>
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 rounded bg-white/10 w-2/3" />
              <div className="h-3 rounded bg-white/5 w-1/2" />
              <div className="h-11 rounded-2xl bg-gradient-to-b from-[#5af5b4] to-[#1fdb8b] grid place-items-center font-extrabold text-[12px] text-[#03261a] mt-4">Start lesson</div>
            </div>
          </div>
        </MockApp>
        {s && (
          <div className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{ background: `radial-gradient(circle ${s.r + 26}px at ${s.x}% ${s.y}%, transparent ${s.r}px, rgba(3,6,17,.82) ${s.r + 22}px)` }} />
        )}
        {s && (
          <div key={step} className="absolute z-10 w-[210px] raised !rounded-2xl p-3 anim-pop"
            style={{
              left: TOUR[step].pos === "left" ? `calc(${s.x}% + ${s.r + 30}px)` : TOUR[step].pos === "right" ? `calc(${s.x}% - ${s.r + 240}px)` : `calc(${s.x}% - 105px)`,
              top: step === 2 ? `calc(${s.y}% - 150px)` : `calc(${s.y}% - 50px)`,
              maxWidth: "min(210px, 60%)",
            }}>
            <div className="flex items-center justify-between mb-1"><span className="font-extrabold text-[12.5px]">{TOUR[step].t}</span><Badge tone="gold" size="xs">{step + 1}/{TOUR.length}</Badge></div>
            <div className="text-[11px] text-mute leading-snug">{TOUR[step].d}</div>
            <div className="flex justify-between items-center mt-2.5">
              <button onClick={() => setStep(-1)} className="text-[10.5px] font-bold text-dim">Skip</button>
              <Btn3D size="xs" variant="gold" onClick={next}>{step === TOUR.length - 1 ? "Finish" : "Next"}</Btn3D>
            </div>
            <div className="flex gap-1 mt-2">{TOUR.map((_, i) => <span key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-gold" : "bg-white/10")} />)}</div>
          </div>
        )}
        {done && <div className="absolute inset-0 grid place-items-center"><span className="raised px-4 py-2.5 font-extrabold text-[14px] text-bull anim-pop">🎉 Тур пройден! +25 XP</span></div>}
      </div>
      {step < 0 && !done && <Btn3D size="sm" variant="blue" full className="mt-3" icon={<Icon name="sparkles" size={15} />} onClick={() => { setStep(0); sfx.pop(); }}>Start tour</Btn3D>}
    </Asset>
  );
}

/* ============ 2. PULSE BEACONS ============ */
function Beacons() {
  const [found, setFound] = useState<number[]>([]);
  const spots = [
    { x: 18, y: 34, t: "График", d: "Живые свечи BTC" }, { x: 68, y: 26, t: "Buy", d: "Открыть лонг" }, { x: 44, y: 66, t: "Лига", d: "Ты на 3 месте" }, { x: 84, y: 70, t: "Чат", d: "2 новых сообщения" },
  ];
  const tap = (i: number, e: React.MouseEvent) => {
    if (found.includes(i)) return;
    setFound((f) => [...f, i]);
    const r = (e.target as HTMLElement).getBoundingClientRect();
    import("../utils/fx").then((m) => m.burstSparks(r.left + 16, r.top + 16, 14));
    sfx.pop();
    if (found.length + 1 === spots.length) setTimeout(() => { sfx.levelUp(); burstConfetti(window.innerWidth / 2, 200, 40, 0.9); }, 300);
  };
  return (
    <Asset title="Pulse Beacons" id="tour.beacons" desc="Маяки на новых функциях: пульсируют, пока не тапнешь. Счётчик найденных, финал с салютом.">
      <div className="relative rounded-2xl overflow-hidden bg-[#0a1330] border border-white/10 h-[220px]">
        <div className="absolute inset-0 p-4 grid grid-cols-2 gap-2.5 opacity-60">
          <div className="rounded-xl bg-[#101c42] p-2"><div className="h-2 w-1/2 rounded bg-white/10 mb-2" /><div className="h-10 rounded bg-white/5" /></div>
          <div className="rounded-xl bg-bull/20 border border-bull/30 grid place-items-center font-extrabold text-bull">BUY</div>
          <div className="rounded-xl bg-[#101c42] p-2 flex items-center gap-2"><Glyph name="gem" size={22} /><div className="h-2 flex-1 rounded bg-white/10" /></div>
          <div className="rounded-xl bg-[#101c42] p-2 flex items-center gap-2"><Icon name="send" size={16} className="text-dim" /><div className="h-2 flex-1 rounded bg-white/10" /></div>
        </div>
        {spots.map((sp, i) => found.includes(i) ? (
          <span key={i} className="absolute size-8 -ml-4 -mt-4 rounded-full bg-bull grid place-items-center anim-pop" style={{ left: `${sp.x}%`, top: `${sp.y}%` }}><Icon name="check" size={16} stroke={3.4} className="text-ink-900" /></span>
        ) : (
          <button key={i} onClick={(e) => tap(i, e)} className="absolute size-8 -ml-4 -mt-4 rounded-full group" style={{ left: `${sp.x}%`, top: `${sp.y}%` }}>
            <span className="absolute inset-0 rounded-full bg-gold/80" style={{ animation: `pulse-ring 1.8s ${i * 0.3}s ease-out infinite` }} />
            <span className="absolute inset-[9px] rounded-full bg-gold shadow-[0_0_16px_rgba(255,197,61,.9)] group-hover:scale-125 transition-transform" />
            <span className="absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg bg-ink-900 border border-white/10 text-[10px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{sp.t}</span>
          </button>
        ))}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-ink-900/80 rounded-full px-3 py-1.5 border border-white/10">
          <span className="text-[11px] font-extrabold num">{found.length}/{spots.length}</span>
          <div className="flex gap-1">{spots.map((_, i) => <span key={i} className={cn("size-1.5 rounded-full", found.includes(i) ? "bg-gold" : "bg-white/15")} />)}</div>
          {found.length === spots.length ? <span className="text-[10px] font-extrabold text-bull anim-pop">всё найдено!</span> : <button onClick={() => setFound([])} className="text-[10px] font-bold text-dim">reset</button>}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 3. TOOLTIP TOUR ============ */
function TooltipTour() {
  const [i, setI] = useState(0);
  const tips = [
    { t: "Стоп-лосс", d: "Ограничивает убыток, если цена пошла против тебя.", icon: "shield" },
    { t: "Тейк-профит", d: "Фиксирует прибыль на заданном уровне.", icon: "target" },
    { t: "Плечо", d: "Умножает позицию — и риск вместе с ней.", icon: "bolt" },
  ];
  const tip = tips[i];
  return (
    <Asset title="Tooltip Cards" id="tour.tips" desc="Обучающие карточки терминов: стрелка, иконка, листание, прогресс.">
      <div className="flex flex-col items-center pt-2">
        <div key={i} className="relative w-full max-w-[280px] raised !rounded-2xl p-4 anim-scale">
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 size-4 rotate-45 bg-[#1d3169] border-b border-r border-white/10" />
          <div className="flex items-center gap-2.5">
            <span className="size-10 rounded-xl bg-blue/15 text-[#8fb3ff] grid place-items-center"><Icon name={tip.icon} size={20} /></span>
            <div><div className="font-extrabold text-[14px]">{tip.t}</div><div className="text-[10px] text-dim font-bold">Глоссарий · {i + 1}/{tips.length}</div></div>
          </div>
          <p className="text-[12.5px] text-mute leading-relaxed mt-2.5">{tip.d}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1.5">{tips.map((_, k) => <button key={k} onClick={() => { setI(k); sfx.tick(); }} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-6 bg-blue" : "w-1.5 bg-[#22366f]")} />)}</div>
            <div className="flex gap-1.5">
              <Btn3D size="xs" variant="neutral" disabled={i === 0} onClick={() => setI(i - 1)}>←</Btn3D>
              <Btn3D size="xs" variant="blue" onClick={() => { setI((i + 1) % tips.length); sfx.tick(); }}>{i === tips.length - 1 ? "Again" : "Next"}</Btn3D>
            </div>
          </div>
        </div>
        <div className="mt-6 inset !rounded-xl px-4 py-2.5 text-[12px] font-bold text-mute">наведи на <span className="text-blue border-b-2 border-dashed border-blue/50">подчёркнутый термин</span> в уроке</div>
      </div>
    </Asset>
  );
}

/* ============ 4. CHECKLIST ONBOARDING ============ */
function ChecklistOnboarding() {
  const [items, setItems] = useState([
    { t: "Пройди первый урок", xp: 10, done: true }, { t: "Открой демо-сделку", xp: 15, done: true },
    { t: "Поставь стоп-лосс", xp: 15, done: false }, { t: "Вступи в лигу", xp: 20, done: false }, { t: "Пригласи друга", xp: 50, done: false },
  ]);
  const [xp, setXp] = useState(25);
  const [fire, setFire] = useState(0);
  const toggle = (k: number) => {
    const n = items.map((x, i) => (i === k ? { ...x, done: !x.done } : x));
    setItems(n);
    if (!items[k].done) {
      setXp((x) => x + items[k].xp); sfx.success(); setFire(Date.now());
      if (n.every((x) => x.done)) setTimeout(() => burstConfetti(window.innerWidth / 2, 300, 70, 1.1), 200);
    } else { setXp((x) => x - items[k].xp); sfx.tap(); }
  };
  const done = items.filter((x) => x.done).length;
  return (
    <Asset title="Onboarding Checklist" id="tour.checklist" desc="Чек-лист новичка с XP за каждый шаг: прогресс-бар, конфетти за полное прохождение.">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12.5px] font-extrabold">Добро пожаловать! <span className="num text-mute">{done}/{items.length}</span></span>
        <span className="text-[12px] font-extrabold text-gold num">+{xp} XP</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#16275a] overflow-hidden mb-3"><div className="h-full rounded-full bg-gradient-to-r from-bull to-gold transition-all duration-700" style={{ width: `${(done / items.length) * 100}%` }} /></div>
      <div className="space-y-2 relative">
        {fire > 0 && <span key={fire} className="absolute -top-1 right-4 num text-[13px] font-extrabold text-gold pointer-events-none" style={{ animation: "rise 1s ease-out forwards" }}>+XP</span>}
        {items.map((it, k) => (
          <button key={it.t} onClick={() => toggle(k)} className={cn("w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all", it.done ? "bg-bull/10" : "bg-white/[.03] hover:bg-white/5 hover:translate-x-1")}>
            <span className={cn("size-7 rounded-lg border-2 grid place-items-center shrink-0 transition-all duration-300", it.done ? "bg-bull border-bull" : "border-[#2f4890]")}>
              {it.done && <Icon name="check" size={15} stroke={3.4} className="text-ink-900 anim-pop" />}
            </span>
            <span className={cn("flex-1 text-[12.5px] font-bold", it.done && "line-through text-dim")}>{it.t}</span>
            <span className="num text-[11px] font-extrabold text-gold">+{it.xp}</span>
          </button>
        ))}
      </div>
      {done === items.length && <div className="mt-3 text-center text-[12.5px] font-extrabold text-bull anim-pop">🎉 Онбординг пройден! Разблокирован Pro-триал</div>}
    </Asset>
  );
}

/* ============ 5. FEATURE MODAL ============ */
function FeatureModal() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const slides = [
    { g: "rocket" as const, t: "Новая лига: Diamond", d: "Топ-7 Emerald переходят в Diamond с множителем наград ×3." },
    { g: "gem" as const, t: "Скины маскота", d: "Neon, Gold и Stealth уже в магазине за кристаллы." },
    { g: "crown" as const, t: "Pro-триал 7 дней", d: "Безлимитные сердца и все уроки открыты." },
  ];
  const s = slides[slide];
  return (
    <Asset title="Feature Modal" id="tour.modal" desc="Модалка «Что нового»: слайды фич, точки, CTA. Открывается поверх с blur.">
      <div className="grid place-items-center py-8">
        <Btn3D variant="violet" icon={<Icon name="sparkles" size={16} />} onClick={() => { setOpen(true); setSlide(0); sfx.pop(); }}>Что нового? <span className="ml-1 min-w-5 h-5 px-1 rounded-full bg-bear text-[10px] grid place-items-center">3</span></Btn3D>
      </div>
      {open && (
        <div className="fixed inset-0 z-[150] grid place-items-center p-4 anim-fade" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-md" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-xs panel p-6 text-center anim-scale">
            <div key={slide} className="anim-fade">
              <div className="anim-float inline-block"><Glyph name={s.g} size={72} /></div>
              <div className="font-extrabold text-[19px] mt-3">{s.t}</div>
              <div className="text-[12.5px] text-mute mt-1.5 leading-relaxed min-h-[54px]">{s.d}</div>
            </div>
            <div className="flex justify-center gap-1.5 my-4">{slides.map((_, k) => <button key={k} onClick={() => setSlide(k)} className={cn("h-2 rounded-full transition-all", k === slide ? "w-6 bg-violet" : "w-2 bg-[#22366f]")} />)}</div>
            <div className="grid grid-cols-2 gap-2">
              <Btn3D size="sm" variant="neutral" onClick={() => setOpen(false)}>Later</Btn3D>
              {slide < slides.length - 1
                ? <Btn3D size="sm" variant="violet" onClick={() => { setSlide(slide + 1); sfx.tick(); }}>Next</Btn3D>
                : <Btn3D size="sm" variant="bull" onClick={() => { setOpen(false); sfx.success(); }}>Try now</Btn3D>}
            </div>
          </div>
        </div>
      )}
    </Asset>
  );
}

/* ============ 6. GESTURE HINT ============ */
function GestureHint() {
  const [demo, setDemo] = useState(true);
  return (
    <Asset title="Gesture Hints" id="tour.gesture" desc="Подсказки жестов: анимированный палец показывает свайп, тап, pinch.">
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { n: "Swipe", anim: "hint-swipe 1.8s ease-in-out infinite" },
          { n: "Tap", anim: "hint-tap 1.6s ease-in-out infinite" },
          { n: "Pinch", anim: "hint-pinch 2s ease-in-out infinite" },
        ].map((g) => (
          <div key={g.n} className="inset !rounded-2xl h-[130px] grid place-items-center relative overflow-hidden">
            <span className="text-[26px]" style={{ animation: demo ? g.anim : undefined }}>👆</span>
            <span className="absolute bottom-2 text-[10px] font-extrabold text-dim uppercase">{g.n}</span>
            {g.n === "Tap" && <span className="absolute size-10 rounded-full border-2 border-blue/60" style={{ animation: demo ? "pulse-ring 1.6s ease-out infinite" : undefined }} />}
          </div>
        ))}
      </div>
      <Btn3D size="xs" variant={demo ? "blue" : "neutral"} full className="mt-3" onClick={() => setDemo(!demo)}>{demo ? "Pause demos" : "Play demos"}</Btn3D>
      <style>{`
        @keyframes hint-swipe { 0%,100% { transform: translateX(-26px); } 50% { transform: translateX(26px); } }
        @keyframes hint-tap { 0%,100% { transform: scale(1); } 12% { transform: scale(.82); } 24% { transform: scale(1); } }
        @keyframes hint-pinch { 0%,100% { transform: scale(1.25); } 50% { transform: scale(.8); } }
      `}</style>
    </Asset>
  );
}

/* ============ 7. EMPTY STATE TOUR ============ */
function EmptyTour() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { t: "Портфель пуст", d: "Пройди первый урок — получишь стартовые $10 000 демо.", g: "coin" as const, icon: null as string | null, cta: "К урокам" },
    { t: "Нет сделок", d: "Открой первую позицию на демо. Это бесплатно и безопасно.", g: "coin" as const, icon: "candles", cta: "Открыть сделку" },
    { t: "Нет друзей", d: "Пригласи друга — оба получите по 200 кристаллов.", g: "gem" as const, icon: null as string | null, cta: "Пригласить" },
  ];
  const cur = tabs[tab];
  return (
    <Asset title="Empty States" id="tour.empty" desc="Пустые состояния как онбординг: иллюстрация, объяснение и кнопка действия. 3 варианта.">
      <div className="flex gap-1.5 mb-3 justify-center">
        {tabs.map((t, i) => <button key={t.t} onClick={() => { setTab(i); sfx.tick(); }} className={cn("h-8 px-3 rounded-lg text-[11px] font-extrabold", tab === i ? "bg-blue/15 text-txt" : "text-dim")}>{t.t}</button>)}
      </div>
      <div key={tab} className="inset !rounded-2xl p-6 text-center anim-fade">
        <div className="anim-float inline-block">{cur.icon ? <Icon name={cur.icon} size={52} className="text-dim" /> : <Glyph name={cur.g} size={56} />}</div>
        <div className="font-extrabold text-[16px] mt-3">{cur.t}</div>
        <div className="text-[12px] text-mute mt-1 max-w-[240px] mx-auto leading-relaxed">{cur.d}</div>
        <Btn3D size="sm" variant="bull" className="mt-4" icon={<Icon name="arrowUp" size={14} stroke={3} />} onClick={() => sfx.pop()}>{cur.cta}</Btn3D>
      </div>
    </Asset>
  );
}

/* ============ 8. PROGRESSIVE HINT BAR ============ */
function HintBar() {
  const hints = [
    "Тапни по свече, чтобы увидеть OHLC",
    "Удерживай кнопку — увидишь детали",
    "Свайп влево удаляет из вотчлиста",
    "Двойной тап — быстрый лайк",
  ];
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [bar, setBar] = useState(0);
  const timer = useRef(0);
  useEffect(() => {
    if (paused) return;
    setBar(0);
    const t0 = performance.now();
    const loop = () => {
      const k = (performance.now() - t0) / 4000;
      setBar(Math.min(1, k));
      if (k >= 1) { setI((x) => (x + 1) % hints.length); return; }
      timer.current = requestAnimationFrame(loop);
    };
    timer.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(timer.current);
  }, [i, paused]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Asset title="Hint Rotator" id="tour.hints" desc="Полоса советов: ротация каждые 4с с прогрессом, пауза при наведении, навигация.">
      <div className="rounded-2xl border border-blue/30 bg-blue/[.07] p-4 relative overflow-hidden"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="absolute bottom-0 left-0 h-[3px] bg-blue transition-none" style={{ width: `${bar * 100}%` }} />
        <div className="flex items-start gap-3">
          <span className="size-9 rounded-xl bg-blue/15 text-[#8fb3ff] grid place-items-center shrink-0"><Icon name="sparkles" size={18} /></span>
          <div className="flex-1">
            <div className="flex items-center justify-between"><span className="label-caps !mb-0">Совет {i + 1}/{hints.length}</span>{paused && <Badge tone="neutral" size="xs">paused</Badge>}</div>
            <div key={i} className="text-[13px] font-bold mt-1 anim-fade">{hints[i]}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-1">{hints.map((_, k) => <button key={k} onClick={() => setI(k)} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-5 bg-blue" : "w-1.5 bg-white/15")} />)}</div>
          <div className="flex gap-1.5">
            <button onClick={() => setI((i + hints.length - 1) % hints.length)} className="size-7 rounded-lg bg-white/5 grid place-items-center hover:bg-white/10"><Icon name="chevL" size={14} stroke={3} /></button>
            <button onClick={() => setI((i + 1) % hints.length)} className="size-7 rounded-lg bg-white/5 grid place-items-center hover:bg-white/10"><Icon name="chevR" size={14} stroke={3} /></button>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-dim font-bold mt-2 text-center">наведи — ротация встанет на паузу</div>
    </Asset>
  );
}

export default function TourLab() {
  const v = clamp(1);
  void v;
  return (
    <Section id="tour" index="35" title="Tour & Onboarding Lab" subtitle="8 онбординг-механик: спот-тур, маяки, тултипы, чек-лист, модалка фич, жесты, пустые состояния, советы" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <SpotlightTour />
        <Beacons />
        <TooltipTour />
        <ChecklistOnboarding />
        <FeatureModal />
        <GestureHint />
        <EmptyTour />
        <HintBar />
      </div>
    </Section>
  );
}
