import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Section, useBump } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { useInView, useTilt } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ ONB-01 · Boot screen ═════════ */
function BootScreen() {
  const [stage, setStage] = useState<"boot" | "ready" | "gone">("boot");
  const [p, setP] = useState(0);
  const [tip, setTip] = useState(0);
  const TIPS = ["Совет: стрик даёт ×2 гемы", "1% риска — правило профи", "Проверь свой радар навыков"];
  useEffect(() => {
    if (stage !== "boot") return;
    const id = window.setInterval(() => setP((v) => Math.min(100, v + 2 + Math.random() * 4)), 60);
    return () => clearInterval(id);
  }, [stage]);
  useEffect(() => {
    if (p >= 100 && stage === "boot") window.setTimeout(() => { setStage("ready"); sfx.play("success"); }, 350);
  }, [p, stage]);
  useEffect(() => {
    const id = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <AssetCard id="ONB-01" title="Game Boot Screen" desc="Загрузчик игры: пульсирующий логотип, прогресс ассетов, ротация советов и «TAP TO START», сжимающийся в точку." tags={["boot", "loading", "splash", "onboarding"]}>
      <div
        onClick={() => { if (stage === "ready") { setStage("gone"); feel("whoosh", 20); } }}
        className={cn("relative grid h-64 cursor-pointer select-none place-items-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#123078] to-ink-950 transition-all duration-500", stage === "gone" && "scale-0 opacity-0")}
        style={{ transitionTimingFunction: "cubic-bezier(.5,0,.8,.4)" }}>
        <div className="absolute inset-0 grid-dots opacity-30" />
        {stage !== "gone" && <>
          <div className="absolute left-6 top-6 font-mono text-[10px] font-bold text-ink-400">PIPWISE v5.0 · build 2026</div>
          <div className="relative" style={{ animation: "bootPulse 1.6s ease-in-out infinite" }}>
            <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-gradient-to-b from-bull to-bull-edge shadow-[0_8px_0_#0b7a4d,0_0_50px_#2ee59d55,inset_0_2px_0_#fff8]"><Icon name="candle" size={48} stroke={2.8} className="text-ink-900" /></div>
            <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-gold shadow-[0_3px_0_#cc8a00]"><Icon name="flame" size={16} variant="solid" className="anim-flame text-ink-900" /></span>
          </div>
          <div className="mt-6 text-2xl font-extrabold tracking-tight text-white text-3d">PIPWISE</div>
          {stage === "boot" ? (
            <div className="mt-4 w-56">
              <div className="well h-3 overflow-hidden rounded-full"><div className="h-full rounded-full bg-gradient-to-r from-bull to-gold transition-[width] duration-150" style={{ width: `${p}%` }} /></div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] font-bold text-ink-400"><span>loading assets</span><span>{Math.round(p)}%</span></div>
            </div>
          ) : (
            <button className="mt-6 rounded-2xl bg-gold px-8 py-3 text-sm font-extrabold uppercase tracking-widest text-ink-900 shadow-[0_6px_0_#cc8a00]" style={{ animation: "heartbeat 1.2s ease-in-out infinite" }}>Tap to start</button>
          )}
          <div key={tip} className="anim-fade-up absolute bottom-5 text-[11px] font-bold text-ink-300">{TIPS[tip]}</div>
        </>}
        {stage === "gone" && <Btn v="ghost" size="sm" className="absolute" onClick={(e) => { e.stopPropagation(); setStage("boot"); setP(0); }}>Replay boot</Btn>}
      </div>
    </AssetCard>
  );
}

/* ═════════ ONB-02 · Onboarding carousel ═════════ */

const PAGES = [
  { t: "Learn", s: "5 минут в день. Короткие уроки, которые остаются в памяти.", i: "book", c: "#2ee59d" },
  { t: "Trade", s: "$10,000 демо-баланс и реальные котировки. Ноль риска.", i: "candle", c: "#3d8bff" },
  { t: "Win", s: "Лиги, стрики и награды. Соревнуйся и прокачивай навыки.", i: "trophy", c: "#ffc53d" },
];
function OnbCarousel() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [b, bump] = useBump();
  const next = (e?: React.MouseEvent) => {
    if (i < PAGES.length - 1) { setI(i + 1); feel("swipe"); }
    else { setDone(true); bump(); if (e) game.reward({ xp: 10, x: e.clientX, y: e.clientY }); sfx.play("success"); }
  };
  return (
    <AssetCard id="ONB-02" title="Onboarding Carousel 3D" desc="Три страницы с 3D-переходом (scale/rotate/blur по расстоянию), точки-прогресс и финальный CTA с наградой." tags={["onboarding", "carousel", "3d", "first-run"]}>
      <div className="relative h-64 overflow-hidden rounded-3xl bg-ink-950/60" style={{ perspective: 900 }}>
        {PAGES.map((pg, k) => {
          const d = k - i;
          return (
            <div key={pg.t} className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" style={{
              transform: `translateX(${d * 55}%) scale(${1 - Math.abs(d) * 0.12}) rotateY(${d * -16}deg)`,
              opacity: Math.abs(d) > 1 ? 0 : 1 - Math.abs(d) * 0.5,
              filter: Math.abs(d) ? "blur(3px)" : "none", zIndex: 10 - Math.abs(d),
              transition: "all .55s cubic-bezier(.3,1.2,.5,1)", pointerEvents: d === 0 ? "auto" : "none",
            }}>
              <span className="grid h-24 w-24 place-items-center rounded-[30px]" style={{ background: `linear-gradient(160deg, ${pg.c}, ${pg.c}55)`, boxShadow: `0 6px 0 rgba(0,0,0,.35), 0 0 40px ${pg.c}44` }}><Icon name={pg.i} size={48} variant="duo" className="text-white" /></span>
              <div className="mt-5 text-3xl font-extrabold text-white text-3d">{pg.t}</div>
              <div className="mt-2 max-w-[260px] text-sm font-semibold text-ink-200">{pg.s}</div>
              {k === PAGES.length - 1 && <Btn v="bull" size="lg" className="mt-5" onClick={(e) => next(e)}><Icon name="rocket" size={18} />Create trader</Btn>}
            </div>
          );
        })}
        {done && <div className="anim-pop absolute inset-x-0 bottom-16 z-20 text-center text-sm font-extrabold text-bull">Welcome aboard! +10 XP</div>}
        {!done && (
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
            <button onClick={() => { if (i > 0) { setI(i - 1); feel("tap"); } }} className={cn("grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-white transition", i === 0 && "opacity-30")}><Icon name="chevL" size={16} stroke={3} /></button>
            <div className="flex gap-1.5">{PAGES.map((_, k) => <span key={k} className="h-2 rounded-full transition-all duration-300" style={{ width: k === i ? 22 : 8, background: k === i ? PAGES[i].c : "#2f4789" }} />)}</div>
            <button onClick={() => next()} className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-white"><Icon name="chevR" size={16} stroke={3} /></button>
          </div>
        )}
        {done && <div className="absolute inset-x-0 bottom-6"><Btn v="ghost" size="sm" block onClick={() => { setDone(false); setI(0); }}>Replay</Btn></div>}
      </div>
    </AssetCard>
  );
}

/* ═════════ ONB-03 · Curtain gate ═════════ */
function CurtainGate() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [k, bump] = useBump();
  const open = inView || k > 0;
  return (
    <AssetCard id="ONB-03" title="Curtain Gate Transition" desc="Занавес из двух половин разъезжается при появлении в вьюпорте, контент из-под него выскальзывает со scale-pop. Кнопка воспроизводит." tags={["transition", "gate", "curtain", "reveal"]}>
      <div ref={ref} className="relative h-52 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4fbf] to-ink-950">
        <div className="absolute inset-0 grid place-items-center" style={{ transform: open ? "scale(1)" : "scale(.7)", opacity: open ? 1 : 0, transition: `all .6s cubic-bezier(.2,1.4,.4,1) ${open ? ".45s" : "0s"}` }}>
          <div className="text-center">
            <div className="text-4xl font-extrabold text-white text-3d">NEW<br />CHAPTER</div>
            <div className="mt-2 text-sm font-bold text-white/70">Unit 4 · Derivatives</div>
            <span className="mt-3 inline-block"><Btn v="gold" size="sm">Enter</Btn></span>
          </div>
        </div>
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink-700 to-ink-600" style={{ animation: open ? "partL .7s cubic-bezier(.7,0,.25,1) both" : undefined, transition: open ? undefined : "transform .4s" }}>
          <span className="absolute bottom-4 left-4 font-mono text-[10px] font-bold text-ink-400">PIPWISE</span>
          <div className="absolute right-0 top-0 h-full w-1 bg-black/40" />
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-ink-700 to-ink-600" style={{ animation: open ? "partR .7s cubic-bezier(.7,0,.25,1) both" : undefined, transition: open ? undefined : "transform .4s" }}>
          <span className="absolute right-4 top-4 font-mono text-[10px] font-bold text-ink-400">CH.4</span>
          <div className="absolute left-0 top-0 h-full w-1 bg-black/40" />
        </div>
      </div>
      <div className="mt-3 text-center"><Btn v="ghost" size="sm" onClick={() => { bump(); feel("whoosh"); }}><Icon name="refresh" size={14} />Replay</Btn></div>
    </AssetCard>
  );
}

/* ═════════ ONB-04 · Book page turn ═════════ */
const BOOK = [
  { t: "Свеча", d: "Четыре цены: открытие, максимум, минимум, закрытие.", i: "candle" },
  { t: "Тренд", d: "Серия максимумов выше минимумов — тренд вверх.", i: "trendUp" },
  { t: "Риск", d: "Стоп-лосс — не поражение, а страховка.", i: "shield" },
  { t: "Дисциплина", d: "План сделки важнее интуиции.", i: "heart" },
];
function PageTurn() {
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState<null | 1 | -1>(null);
  const next = () => {
    if (flipping || page >= BOOK.length - 1) return;
    setFlipping(1); feel("whoosh");
    window.setTimeout(() => { setPage((p) => p + 1); setFlipping(null); }, 750);
  };
  const prev = () => {
    if (flipping || page <= 0) return;
    setFlipping(-1); sfx.play("pop");
    window.setTimeout(() => { setPage((p) => p - 1); setFlipping(null); }, 750);
  };
  const cur = BOOK[page];
  return (
    <AssetCard id="ONB-04" title="Book Page Turn" desc="Двухсторонняя страница с поворотом 180° вокруг корешка: лицевая и оборотная стороны, тень во время переворота, счётчик глав." tags={["book", "page-turn", "3d", "story"]}>
      <div className="relative mx-auto h-56 w-full max-w-[320px]" style={{ perspective: 1200 }}>
        <div className="absolute inset-0 rounded-r-3xl bg-gradient-to-br from-ink-600 to-ink-800 p-5 shadow-[0_8px_0_#050b1f,inset_1px_0_0_#ffffff22]">
          <div className="absolute left-3 top-1/2 h-16 w-1 -translate-y-1/2 rounded bg-black/40" />
          <div key={page} className="anim-rise">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Chapter {page + 1}</div>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink-900/60"><Icon name={cur.i} size={30} variant="duo" className="text-sky" /></span>
              <div><div className="text-xl font-extrabold text-white">{cur.t}</div></div>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-ink-200">{cur.d}</div>
            <div className="mt-5 flex gap-1">{BOOK.map((_, k) => <span key={k} className={cn("h-1.5 w-6 rounded-full", k <= page ? "bg-sky" : "bg-ink-700")} />)}</div>
          </div>
        </div>
        {flipping !== null && (
          <div className="absolute inset-0 z-10 preserve-3d" style={{ transformOrigin: "left", animation: flipping === 1 ? "pageFlipR .75s cubic-bezier(.6,0,.4,1) forwards" : "pageFlipL .75s cubic-bezier(.6,0,.4,1) forwards" }}>
            <div className="absolute inset-0 rounded-r-3xl bg-gradient-to-br from-ink-500 to-ink-700 p-5 backface-hidden" style={{ boxShadow: "0 10px 40px #000a" }}>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">turning…</div>
              <div className="mt-6 space-y-2">{[0, 1, 2].map((k) => <div key={k} className="h-2 rounded-full bg-ink-900/50" style={{ width: `${80 - k * 18}%` }} />)}</div>
            </div>
            <div className="absolute inset-0 rounded-r-3xl bg-ink-900/80 backface-hidden" style={{ transform: "rotateY(180deg)" }} />
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-center gap-2"><Btn v="ghost" size="sm" onClick={prev} disabled={page === 0 || !!flipping}><Icon name="chevL" size={14} />Prev</Btn><Btn v="sky" size="sm" onClick={next} disabled={page === BOOK.length - 1 || !!flipping}>Next<Icon name="chevR" size={14} /></Btn></div>
    </AssetCard>
  );
}

/* ═════════ ONB-05 · Stagger title intro ═════════ */
function TitleIntro() {
  const t = useTilt();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [k, bump] = useBump();
  const on = inView || k > 0;
  return (
    <AssetCard id="ONB-05" title="Title Sequence Intro" desc="Заставка: маска-выезд строк, рисующийся подчёркивающий штрих, бейдж с задержкой; параллакс по наклону устройства." tags={["intro", "title", "stagger", "sequence"]}>
      <div ref={ref} onClick={() => bump()} className="relative grid h-56 cursor-pointer select-none place-items-center overflow-hidden rounded-3xl bg-ink-950/60" style={{ perspective: 800 }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 40%, #3d8bff22, transparent 60%)", transform: `translate(${t.x * 10}px, ${t.y * 8}px)` }} />
        <div className="text-center" style={{ transform: `rotateY(${t.x * 8}deg) rotateX(${-t.y * 6}deg)` }}>
          <div className="overflow-hidden"><div className={cn("text-[11px] font-extrabold uppercase tracking-[.4em] text-sky", on && "anim-fade-up")}>Crypto Trading Academy</div></div>
          <div className="mt-2 flex justify-center gap-3">
            {["PIP", "WISE"].map((w, wi) => (
              <div key={w} className="overflow-hidden">
                <div className="text-5xl font-extrabold tracking-tight text-white text-3d" style={{ animation: `letterIn .7s cubic-bezier(.2,1.2,.4,1) ${0.15 + wi * 0.12}s ${on ? "" : "both"} both`, animationPlayState: on ? "running" : "paused" }}>{w}</div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-3 h-1 w-40 origin-left rounded-full bg-gradient-to-r from-bull via-gold to-sky" style={{ animation: on ? "lineGrow .8s cubic-bezier(.2,.8,.2,1) .6s both" : "none" }} />
          <div className="mt-3 overflow-hidden"><div className="text-xs font-bold text-ink-300" style={{ animation: on ? "fadeUp .6s ease 1s both" : "none" }}>tap the stage to replay</div></div>
        </div>
        {on && <div className="absolute right-4 top-4"><Mascot mood="cool" size={56} className="anim-float" /></div>}
      </div>
    </AssetCard>
  );
}

export default function Onboarding() {
  return (
    <Section id="onboarding" num="23" title="Flows & Onboarding" subtitle="Boot-экран, 3D-карусель первого запуска, gate-занавес, переворот страницы, титровая заставка">
      <BootScreen />
      <OnbCarousel />
      <CurtainGate />
      <PageTurn />
      <TitleIntro />
    </Section>
  );
}
