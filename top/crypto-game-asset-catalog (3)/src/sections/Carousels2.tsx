import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AssetCard, Btn, Icon, Label, Section, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useRaf, useSpring } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { cn } from "../utils/cn";

const FACES = [
  { t: "Spot", d: "Покупай актив напрямую", i: "coin", c: ["#2ee59d", "#0b7a4d"] },
  { t: "Futures", d: "Контракты с плечом", i: "rocket", c: ["#ff4d6a", "#8c1530"] },
  { t: "Options", d: "Право, а не обязанность", i: "target", c: ["#ffc53d", "#a86d00"] },
  { t: "DeFi", d: "Пулы и стейкинг", i: "gem", c: ["#a174ff", "#4a24a8"] },
];

/* ═════════ CAR-11 · 3D Cube ═════════ */

function Cube() {
  const [target, setTarget] = useState(0);
  const [ang, api] = useSpring(target, 120, 18);
  const base = useRef(0);
  const W = 220;
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => api.set(base.current + d.dx * 0.6),
    onEnd: (d) => { const t = Math.round((api.get() + d.vx * 3) / 90) * 90; setTarget(t); api.release(d.vx * 10); if (t !== target) feel("swipe", 8); },
  });
  const face = ((Math.round(-ang / 90) % 4) + 4) % 4;
  return (
    <AssetCard id="CAR-11" title="3D Cube Carousel" desc="Куб с четырьмя гранями: вращай перетаскиванием с инерцией или кнопками, пружинный доводчик до ближайшей грани." tags={["carousel", "cube", "3d", "drag"]} stageClass="overflow-hidden">
      <div onPointerDown={onDown} className="relative mx-auto h-56 w-[220px] cursor-grab touch-pan-y select-none" style={{ perspective: 800 }}>
        <div className="absolute inset-0 preserve-3d" style={{ transform: `translateZ(-${W / 2}px) rotateY(${ang}deg)` }}>
          {FACES.map((f, i) => (
            <div key={f.t} className="absolute inset-0 flex flex-col justify-between rounded-3xl p-5 backface-hidden" style={{ transform: `rotateY(${i * 90}deg) translateZ(${W / 2}px)`, background: `linear-gradient(160deg, ${f.c[0]}, ${f.c[1]})`, boxShadow: "inset 0 1px 0 #fff5, 0 20px 40px -10px #000a" }}>
              <Icon name={f.i} size={44} variant="duo" className="text-white" />
              <div><div className="text-2xl font-extrabold text-white text-3d">{f.t}</div><div className="text-xs font-bold text-white/80">{f.d}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Btn v="dark" size="icon" onClick={() => { setTarget((t) => t + 90); feel("swipe"); }}><Icon name="chevL" size={18} stroke={3} /></Btn>
        <div className="flex gap-1.5">{FACES.map((_, i) => <span key={i} className={cn("h-2 rounded-full transition-all", face === i ? "w-6 bg-white" : "w-2 bg-ink-600")} />)}</div>
        <Btn v="dark" size="icon" onClick={() => { setTarget((t) => t - 90); feel("swipe"); }}><Icon name="chevR" size={18} stroke={3} /></Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-12 · Flip Book ═════════ */
const PAGES = [
  { t: "Глава 1", s: "Что такое свеча", body: "Свеча показывает открытие, максимум, минимум и закрытие за период." },
  { t: "Глава 2", s: "Тренды", body: "Тренд — серия более высоких максимумов и минимумов (или наоборот)." },
  { t: "Глава 3", s: "Уровни", body: "Поддержка и сопротивление — зоны, где цена разворачивалась." },
  { t: "Глава 4", s: "Риск", body: "Никогда не рискуй больше 1–2% депозита в одной сделке." },
];
function FlipBook() {
  const [page, setPage] = useState(0);
  const [prog, api] = useSpring(0, 140, 20);
  const dir = useRef<1 | -1>(1);
  const onDown = useDrag({
    onStart: () => { api.set(0); },
    onMove: (d) => { dir.current = d.dx < 0 ? 1 : -1; if ((dir.current === 1 && page >= PAGES.length - 1) || (dir.current === -1 && page <= 0)) return; api.set(clamp(Math.abs(d.dx) / 180, 0, 1)); },
    onEnd: (d) => {
      const p = api.get();
      if (p > 0.45 || Math.abs(d.vx) > 14) { setPage((v) => clamp(v + dir.current, 0, PAGES.length - 1)); feel("whoosh", 6); }
      api.set(0);
    },
  });
  const go = (d: 1 | -1) => { dir.current = d; setPage((v) => clamp(v + d, 0, PAGES.length - 1)); feel("whoosh", 6); };
  const flipping = prog > 0.01;
  const front = dir.current === 1 ? page : page - 1;
  const rot = dir.current === 1 ? -180 * prog : -180 + 180 * prog;
  return (
    <AssetCard id="CAR-12" title="Flip Book Pages" desc="Учебник со страницами: тяни край — страница перелистывается вокруг корешка с тенью; двусторонняя страница показывает следующую главу." tags={["carousel", "book", "flip", "3d"]}>
      <div onPointerDown={onDown} className="relative mx-auto h-56 w-full max-w-[280px] cursor-grab touch-pan-y select-none" style={{ perspective: 1000 }}>
        <div className="absolute inset-0 flex rounded-2xl bg-ink-950 shadow-[0_6px_0_#050b1f]">
          <div className="flex-1 rounded-l-2xl bg-gradient-to-r from-ink-700 to-ink-600 p-4"><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Trading 101</div><div className="mt-2 text-xs text-ink-300">{page > 0 ? PAGES[page - 1].body : "Учебник для будущих трейдеров. Листай →"}</div></div>
          <div className="flex-1 rounded-r-2xl bg-gradient-to-l from-ink-700 to-ink-600 p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-sky">{PAGES[Math.min(page + (dir.current === 1 && flipping ? 1 : 0), PAGES.length - 1)].t}</div>
            <div className="text-base font-extrabold text-white">{PAGES[Math.min(page + (dir.current === 1 && flipping ? 1 : 0), PAGES.length - 1)].s}</div>
            <div className="mt-2 text-xs text-ink-300">{PAGES[Math.min(page + (dir.current === 1 && flipping ? 1 : 0), PAGES.length - 1)].body}</div>
          </div>
        </div>
        {flipping && front >= 0 && front < PAGES.length && (
          <div className="absolute inset-y-0 left-1/2 w-1/2 origin-left preserve-3d" style={{ transform: `rotateY(${rot}deg)` }}>
            <div className="absolute inset-0 rounded-r-2xl bg-gradient-to-l from-ink-700 to-ink-600 p-4 backface-hidden" style={{ boxShadow: `${-prog * 20}px 0 30px #0008` }}><div className="text-[10px] font-extrabold uppercase tracking-widest text-sky">{PAGES[front].t}</div><div className="text-base font-extrabold text-white">{PAGES[front].s}</div></div>
            <div className="absolute inset-0 rounded-l-2xl bg-gradient-to-r from-ink-700 to-ink-600 p-4 backface-hidden" style={{ transform: "rotateY(180deg)" }}><div className="text-xs text-ink-300">{PAGES[front].body}</div></div>
          </div>
        )}
        <div className="absolute inset-y-3 left-1/2 w-px bg-black/50" />
      </div>
      <div className="mt-3 flex items-center justify-between"><Btn v="dark" size="icon" onClick={() => go(-1)} disabled={page === 0}><Icon name="chevL" size={18} stroke={3} /></Btn><span className="font-mono text-xs font-bold text-ink-300">Page {page + 1} / {PAGES.length}</span><Btn v="dark" size="icon" onClick={() => go(1)} disabled={page === PAGES.length - 1}><Icon name="chevR" size={18} stroke={3} /></Btn></div>
    </AssetCard>
  );
}

/* ═════════ CAR-13 · Fan / Arc ═════════ */
const FAN = [{ t: "BTC", c: "#f7931a" }, { t: "ETH", c: "#8c8cff" }, { t: "SOL", c: "#14f195" }, { t: "TON", c: "#0098ea" }, { t: "AVAX", c: "#e84142" }, { t: "LINK", c: "#2a5ada" }, { t: "DOT", c: "#e6007a" }];
function Fan() {
  const [target, setTarget] = useState(3);
  const [pos, api] = useSpring(target, 150, 20);
  const base = useRef(0);
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => api.set(clamp(base.current - d.dx / 60, -0.5, FAN.length - 0.5)),
    onEnd: (d) => { const t = clamp(Math.round(api.get() - d.vx * 0.15), 0, FAN.length - 1); setTarget(t); api.release(); if (t !== target) sfx.play("tick"); },
  });
  const act = clamp(Math.round(pos), 0, FAN.length - 1);
  return (
    <AssetCard id="CAR-13" title="Fan · Arc Carousel" desc="Карты веером по дуге: перетаскивание вращает веер вокруг нижней точки, центральная карта поднимается и подсвечивается." tags={["carousel", "fan", "arc", "cards"]} stageClass="overflow-hidden">
      <div onPointerDown={onDown} className="relative h-60 cursor-grab touch-pan-y select-none">
        {FAN.map((f, i) => {
          const d = i - pos;
          const a = d * 16;
          const lift = Math.max(0, 1 - Math.abs(d)) * 26;
          return (
            <div key={f.t} className="absolute bottom-[-140px] left-1/2 h-[300px] w-28 origin-bottom" style={{ transform: `translateX(-50%) rotate(${a}deg)`, zIndex: 10 - Math.round(Math.abs(d)) }}>
              <div className="flex h-40 w-full flex-col items-center justify-between rounded-2xl p-3" style={{ transform: `translateY(${-lift}px)`, background: `linear-gradient(160deg, ${f.c}, ${f.c}77 70%, #16264f)`, boxShadow: `0 5px 0 rgba(0,0,0,.35), 0 ${10 + lift}px ${20 + lift}px -10px #000`, filter: `brightness(${1 - Math.min(1, Math.abs(d)) * 0.35})` }}>
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-sm font-extrabold text-white">{f.t[0]}</div>
                <div className="font-mono text-base font-extrabold text-white text-3d">{f.t}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between"><Label className="mb-0">Selected</Label><span className="font-mono text-sm font-extrabold" style={{ color: FAN[act].c }}>{FAN[act].t}</span></div>
    </AssetCard>
  );
}

/* ═════════ CAR-14 · Timeline ═════════ */
const TL = [
  { y: "2009", t: "Genesis block", d: "Сатоши майнит первый блок", c: "#ffc53d" }, { y: "2013", t: "$1,000", d: "Первый большой пузырь", c: "#ff8a3d" }, { y: "2017", t: "ICO mania", d: "Ethereum и токены", c: "#a174ff" },
  { y: "2020", t: "DeFi Summer", d: "Пулы, фарминг, AMM", c: "#2ee59d" }, { y: "2021", t: "$69k ATH", d: "NFT и институционалы", c: "#3d8bff" }, { y: "2024", t: "ETF", d: "Спотовые ETF в США", c: "#5ce1ff" },
];
function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [sl, setSl] = useState(0);
  const [w, setW] = useState(1);
  useEffect(() => { const el = ref.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth); return () => ro.disconnect(); }, []);
  const CW = 200;
  const act = clamp(Math.round(sl / (CW + 16)), 0, TL.length - 1);
  return (
    <AssetCard id="CAR-14" title="Timeline Carousel" desc="Горизонтальная лента истории с scroll-snap: крупный год едет с параллаксом, узлы на оси загораются, линия заполняется по позиции." tags={["carousel", "timeline", "snap", "parallax"]} stageClass="px-0 overflow-hidden">
      <div className="relative px-4">
        <div className="pointer-events-none absolute right-4 top-0 font-mono text-6xl font-extrabold text-white/5" style={{ transform: `translateX(${-(sl % (CW + 16)) * 0.5}px)` }}>{TL[act].y}</div>
        <Label>Crypto history</Label>
      </div>
      <div className="relative mt-2 h-8 px-4">
        <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink-800" />
        <div className="absolute left-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-gold to-sky transition-[width] duration-300" style={{ width: `calc((100% - 32px) * ${act / (TL.length - 1)})` }} />
        {TL.map((e, i) => <button key={e.y} onClick={() => ref.current?.scrollTo({ left: i * (CW + 16), behavior: "smooth" })} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `calc(16px + (100% - 32px) * ${i / (TL.length - 1)})` }}><span className={cn("block rounded-full border-4 border-ink-900 transition-all", i <= act ? "h-5 w-5" : "h-3.5 w-3.5 bg-ink-600")} style={i <= act ? { background: e.c, boxShadow: i === act ? `0 0 14px ${e.c}` : undefined } : undefined} /></button>)}
      </div>
      <div ref={ref} onScroll={(e) => setSl(e.currentTarget.scrollLeft)} className="no-scrollbar snap-x-strict mt-2 flex gap-4 overflow-x-auto px-4 py-2" style={{ paddingRight: Math.max(16, w - CW - 16) }}>
        {TL.map((e, i) => {
          const d = Math.abs(i - sl / (CW + 16));
          return (
            <div key={e.y} className="shrink-0 snap-start rounded-2xl p-4 transition-all" style={{ width: CW, background: `linear-gradient(160deg, ${e.c}33, #16264f)`, boxShadow: `inset 0 0 0 1.5px ${e.c}${d < 0.5 ? "aa" : "33"}, 0 5px 0 #081130`, transform: `scale(${1 - Math.min(1, d) * 0.06})` }}>
              <div className="font-mono text-2xl font-extrabold" style={{ color: e.c }}>{e.y}</div>
              <div className="mt-1 text-base font-extrabold text-white">{e.t}</div>
              <div className="text-xs text-ink-300">{e.d}</div>
            </div>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-15 · Orbit ═════════ */
const ORB = [{ t: "Lesson", i: "book", c: "#2ee59d" }, { t: "Trade", i: "candle", c: "#3d8bff" }, { t: "League", i: "trophy", c: "#ffc53d" }, { t: "Quests", i: "target", c: "#ff8a3d" }, { t: "Shop", i: "gem", c: "#a174ff" }, { t: "Profile", i: "user", c: "#ff4d6a" }];
function Orbit() {
  const [target, setTarget] = useState(0);
  const [ang] = useSpring(target, 60, 14);
  const [hover, setHover] = useState(false);
  const auto = useRef(0);
  useRaf((dt) => { if (!hover) { auto.current += dt * 0.00025; } }, true);
  const [, tick] = useState(0);
  useRaf(() => tick((n) => (n + 1) % 100000), true);
  const N = ORB.length;
  const front = ((Math.round(-(ang + auto.current * (180 / Math.PI)) / (360 / N)) % N) + N) % N;
  return (
    <AssetCard id="CAR-15" title="Orbit Carousel" desc="Элементы вращаются по эллиптической орбите вокруг маскота; передний — крупнее и ярче. Тап переносит элемент вперёд, наведение ставит орбиту на паузу." tags={["carousel", "orbit", "3d", "autoplay"]}>
      <div className="relative h-56" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><Mascot mood={hover ? "wow" : "idle"} size={80} /></div>
        <div className="absolute left-1/2 top-1/2 h-24 w-56 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-ink-600" />
        {ORB.map((o, i) => {
          const a = ((i * 360) / N + ang) * (Math.PI / 180) + auto.current;
          const x = Math.sin(a) * 120, y = Math.cos(a) * 42;
          const depth = (Math.cos(a) + 1) / 2;
          return (
            <button key={o.t} onClick={() => { setTarget(ang - ((i * 360) / N + ang + (auto.current * 180) / Math.PI) % 360); feel("pop"); }} className="absolute left-1/2 top-1/2 flex flex-col items-center" style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${0.65 + depth * 0.55})`, zIndex: Math.round(depth * 10), opacity: 0.45 + depth * 0.55 }}>
              <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: `linear-gradient(160deg, ${o.c}, ${o.c}88)`, boxShadow: `0 4px 0 rgba(0,0,0,.35), 0 0 ${depth * 20}px ${o.c}66` }}><Icon name={o.i} size={22} variant="duo" className="text-white" /></span>
              <span className="mt-1 text-[10px] font-extrabold text-white">{o.t}</span>
            </button>
          );
        })}
      </div>
      <div className="text-center text-xs font-bold text-ink-400">Front: <span className="text-white">{ORB[front].t}</span> · {hover ? "paused" : "orbiting"}</div>
    </AssetCard>
  );
}

/* ═════════ CAR-16 · Hero Slider (Ken Burns + text mask) ═════════ */
const HERO = [
  { k: "New course", t: "Options 101", s: "Право купить — без обязанности", c: ["#1d4fbf", "#0a1330"], i: "target" },
  { k: "Event", t: "Halving Cup", s: "Турнир на $10,000 в призах", c: ["#a33a0d", "#0a1330"], i: "trophy" },
  { k: "Season 7", t: "Bull Run Pass", s: "60 уровней наград", c: ["#0b7a4d", "#0a1330"], i: "rocket" },
];
function HeroSlider() {
  const [i, setI] = useState(0);
  const [p, setP] = useState(0);
  const pRef = useRef(0);
  const [hover, setHover] = useState(false);
  useRaf((dt) => { let n = pRef.current + dt / 4200; if (n >= 1) { n = 0; setI((v) => (v + 1) % HERO.length); } pRef.current = n; setP(n); }, !hover);
  const go = (k: number) => { setI(k); pRef.current = 0; setP(0); feel("tap"); };
  const h = HERO[i];
  return (
    <AssetCard id="CAR-16" title="Hero Slider · Ken Burns" desc="Промо-слайдер: фон медленно наезжает (Ken Burns), заголовок выезжает из маски строка за строкой, автоплей с полосой прогресса, пауза при наведении." tags={["carousel", "hero", "ken-burns", "autoplay", "mask"]} stageClass="p-0 overflow-hidden">
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="relative h-64 overflow-hidden">
        <div key={i} className="absolute inset-0" style={{ background: `radial-gradient(circle at 70% 30%, ${h.c[0]}, ${h.c[1]} 70%)`, animation: "kenburns 6s ease-out both" }}>
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
          <Icon name={h.i} size={150} variant="duo" className="absolute -bottom-6 right-2 text-white/20" />
        </div>
        <div key={`t${i}`} className="absolute bottom-6 left-5 right-5">
          <div className="overflow-hidden"><div className="text-[10px] font-extrabold uppercase tracking-[.3em] text-white/70" style={{ animation: "textUp .6s cubic-bezier(.2,.8,.2,1) both" }}>{h.k}</div></div>
          <div className="overflow-hidden"><div className="text-3xl font-extrabold text-white text-3d" style={{ animation: "textUp .6s cubic-bezier(.2,.8,.2,1) .1s both" }}>{h.t}</div></div>
          <div className="overflow-hidden"><div className="text-sm font-bold text-white/80" style={{ animation: "textUp .6s cubic-bezier(.2,.8,.2,1) .2s both" }}>{h.s}</div></div>
          <div className="mt-3" style={{ animation: "fadeUp .5s ease .4s both" }}><Btn v="gold" size="sm">Learn more</Btn></div>
        </div>
        <div className="absolute right-4 top-4 flex gap-1.5">{HERO.map((_, k) => <button key={k} onClick={() => go(k)} className="h-1.5 w-8 overflow-hidden rounded-full bg-white/25"><span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${k < i ? 1 : k === i ? p : 0})` }} /></button>)}</div>
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-17 · Testimonial marquee ═════════ */
const TESTI = [
  { n: "Alex", t: "Первый раз понял, что такое R:R. Спасибо стоп-ханту!", c: "#2ee59d" }, { n: "Mira", t: "Стрик 60 дней. Дисциплина перенеслась в реальные сделки.", c: "#a174ff" },
  { n: "Kai", t: "Свечи наконец «читаются». Игра лучше учебников.", c: "#ffc53d" }, { n: "Zoe", t: "Лига — это зло. Не могу остановиться 😅", c: "#ff4d6a" },
  { n: "Leo", t: "Бар-реплей показал, что я торгую на эмоциях.", c: "#3d8bff" }, { n: "Nia", t: "Прошла Placement и попала сразу в Unit 3.", c: "#ff8a3d" },
];
function Testimonials() {
  const [open, setOpen] = useState<number | null>(null);
  const Row = ({ rev, dur }: { rev?: boolean; dur: string }) => (
    <div className={cn("marquee-row flex w-max gap-3", rev && "rev")} style={{ ["--dur" as string]: dur } as CSSProperties}>
      {[...TESTI, ...TESTI].map((t, k) => (
        <button key={k} onClick={() => { setOpen(k % TESTI.length); feel("pop"); }} className="raised flex w-60 shrink-0 items-start gap-2.5 rounded-2xl p-3 text-left transition-transform hover:-translate-y-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold text-ink-900" style={{ background: t.c }}>{t.n[0]}</span>
          <div><div className="text-xs font-extrabold text-white">{t.n} <span className="text-gold">★★★★★</span></div><div className="line-clamp-2 text-[11px] text-ink-300">{t.t}</div></div>
        </button>
      ))}
    </div>
  );
  return (
    <AssetCard id="CAR-17" title="Testimonial Marquee" desc="Две бесконечные ленты отзывов в противоположных направлениях, пауза при наведении, тап раскрывает карточку крупно." tags={["carousel", "marquee", "testimonials", "infinite"]} stageClass="px-0 overflow-hidden">
      <div className="pause-hover mask-fade-x space-y-3 py-1"><Row dur="34s" /><Row rev dur="40s" /></div>
      {open !== null && (
        <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl bg-ink-900/70 p-3 ring-1 ring-white/10" style={{ animation: "scaleIn .3s cubic-bezier(.3,1.4,.5,1) both" }}>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-lg font-extrabold text-ink-900" style={{ background: TESTI[open].c }}>{TESTI[open].n[0]}</span>
          <div className="flex-1"><div className="text-sm font-extrabold text-white">{TESTI[open].n}</div><div className="text-xs text-ink-200">«{TESTI[open].t}»</div></div>
          <button onClick={() => setOpen(null)}><Icon name="x" size={16} className="text-ink-400" /></button>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ CAR-18 · Peek + rubber band ═════════ */
const PEEK = [{ t: "Bitcoin", s: "Digital gold", c: "#f7931a" }, { t: "Ethereum", s: "World computer", c: "#8c8cff" }, { t: "Solana", s: "Speed", c: "#14f195" }, { t: "Toncoin", s: "Telegram", c: "#0098ea" }, { t: "Chainlink", s: "Oracles", c: "#2a5ada" }];
function Peek() {
  const CW = 200, GAP = 12, STEP = CW + GAP;
  const [idx, setIdx] = useState(0);
  const [x, api] = useSpring(-idx * STEP, 170, 22);
  const base = useRef(0);
  const max = -(PEEK.length - 1) * STEP;
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => { let v = base.current + d.dx; if (v > 0) v = v * 0.3; if (v < max) v = max + (v - max) * 0.3; api.set(v); },
    onEnd: (d) => { const proj = api.get() + d.vx * 14; const t = clamp(Math.round(-proj / STEP), 0, PEEK.length - 1); setIdx(t); api.release(d.vx * 30); if (t !== idx) sfx.play("tick"); },
  });
  const over = x > 0 ? x : x < max ? x - max : 0;
  return (
    <AssetCard id="CAR-18" title="Peek Carousel · Rubber Band" desc="Соседние карточки выглядывают по краям, на границах — резиновое сопротивление и растяжение карточек, бросок по скорости с пружинной остановкой." tags={["carousel", "peek", "rubber-band", "momentum"]} stageClass="overflow-hidden">
      <div onPointerDown={onDown} className="relative h-44 cursor-grab touch-pan-y select-none">
        <div className="absolute left-[calc(50%-100px)] top-0 flex gap-3" style={{ transform: `translateX(${x}px)` }}>
          {PEEK.map((p, i) => (
            <div key={p.t} className="flex h-44 flex-col justify-between rounded-3xl p-4" style={{ width: CW, background: `linear-gradient(160deg, ${p.c}, ${p.c}66 70%, #16264f)`, boxShadow: "0 5px 0 rgba(0,0,0,.35)", transform: `scaleX(${1 + Math.abs(over) / 900}) scale(${i === idx ? 1 : 0.94})`, transformOrigin: over > 0 ? "left" : "right", transition: "scale .3s" }}>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-base font-extrabold text-white">{p.t[0]}</div>
              <div><div className="text-xl font-extrabold text-white text-3d">{p.t}</div><div className="text-xs font-bold text-white/80">{p.s}</div></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">{PEEK.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={cn("h-2 rounded-full transition-all", i === idx ? "w-6 bg-sky" : "w-2 bg-ink-600")} />)}</div>
    </AssetCard>
  );
}

/* ═════════ CAR-19 · Vertical news ticker ═════════ */
const NEWS = ["BTC ETF inflows hit $1.2B", "ETH gas at 3-year low", "SOL DEX volume flips ETH", "Fed holds rates, crypto rallies", "TON hits 900M wallets", "BTC hashrate ATH", "Stablecoin supply +$8B"];
function VerticalTicker() {
  const [hover, setHover] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  return (
    <AssetCard id="CAR-19" title="Vertical News Ticker" desc="Вертикальная бесконечная лента заголовков с маской по краям, пауза при наведении, тап фиксирует новость и подсвечивает её." tags={["carousel", "vertical", "ticker", "news"]}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="mask-fade-y relative h-56 overflow-hidden rounded-2xl bg-ink-950/60">
        <div className="space-y-2 p-2" style={{ animation: "marqueeY 16s linear infinite", animationPlayState: hover ? "paused" : "running" }}>
          {[...NEWS, ...NEWS].map((n, k) => (
            <button key={k} onClick={() => { setPick(k % NEWS.length); feel("tap"); }} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors", pick === k % NEWS.length ? "bg-sky/20 ring-1 ring-sky" : "bg-ink-800/70 hover:bg-ink-800")}>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky/15"><Icon name="news" size={16} className="text-sky" /></span>
              <span className="text-xs font-extrabold text-white">{n}</span>
              <span className="ml-auto font-mono text-[10px] text-ink-500">{(k % NEWS.length) + 1}m</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-400">{pick !== null ? `Выбрано: ${NEWS[pick]}` : hover ? "paused" : "auto-scrolling"}</div>
    </AssetCard>
  );
}

/* ═════════ CAR-20 · Split reveal ═════════ */
const SPLIT = [{ t: "BTC", p: "$64,250", c: "#f7931a" }, { t: "ETH", p: "$3,412", c: "#8c8cff" }, { t: "SOL", p: "$148", c: "#14f195" }, { t: "TON", p: "$6.84", c: "#0098ea" }];
function SplitCarousel() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => { setDir(d); setI((v) => (v + d + SPLIT.length) % SPLIT.length); feel("swipe", 6); };
  const onDown = useDrag({ onEnd: (d) => { if (Math.abs(d.dx) > 40 || Math.abs(d.vx) > 10) go(d.dx < 0 ? 1 : -1); } });
  useInterval(() => go(1), 3500);
  const s = SPLIT[i];
  return (
    <AssetCard id="CAR-20" title="Split Reveal Carousel" desc="Слайд разрезан пополам: верхняя половина уезжает вверх, нижняя — вниз, новая собирается из двух частей навстречу. Свайп и автоплей." tags={["carousel", "split", "reveal", "transition"]} stageClass="p-0 overflow-hidden">
      <div onPointerDown={onDown} className="relative h-56 cursor-grab touch-pan-y select-none overflow-hidden" style={{ background: `radial-gradient(circle at 50% 50%, ${s.c}33, #0a1330 70%)`, transition: "background .5s" }}>
        {[0, 1].map((half) => (
          <div key={`${i}-${half}`} className="absolute inset-x-0 overflow-hidden" style={{ top: half ? "50%" : 0, height: "50%", animation: `${half ? "screenUp" : "screenIn"} .5s cubic-bezier(.3,1.2,.5,1) both`, animationName: half ? "screenUp" : "textUp" }}>
            <div className="absolute inset-x-0 flex h-56 flex-col items-center justify-center" style={{ top: half ? "-100%" : 0 }}>
              <div className="grid h-16 w-16 place-items-center rounded-full text-2xl font-extrabold text-white" style={{ background: s.c, boxShadow: `0 6px 0 rgba(0,0,0,.35), 0 0 40px ${s.c}66` }}>{s.t[0]}</div>
              <div className="mt-3 font-mono text-4xl font-extrabold text-white text-3d">{s.p}</div>
              <div className="text-xs font-extrabold uppercase tracking-[.3em] text-white/70">{s.t}</div>
            </div>
          </div>
        ))}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
        <button onClick={() => go(-1)} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink-900/60 text-white"><Icon name="chevL" size={16} stroke={3} /></button>
        <button onClick={() => go(1)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink-900/60 text-white"><Icon name="chevR" size={16} stroke={3} /></button>
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{SPLIT.map((_, k) => <span key={k} className={cn("h-1.5 rounded-full transition-all", k === i ? "w-6 bg-white" : "w-1.5 bg-white/30")} />)}</div>
        <span className="sr-only">{dir}</span>
      </div>
    </AssetCard>
  );
}

export default function Carousels2() {
  return (
    <Section id="carousels2" num="14" title="Carousels II" subtitle="Куб, книга, веер, таймлайн, орбита, hero-слайдер, marquee отзывов, peek с резинкой, вертикальный тикер, split-reveal">
      <Cube />
      <FlipBook />
      <Fan />
      <Timeline />
      <Orbit />
      <HeroSlider />
      <Testimonials />
      <Peek />
      <VerticalTicker />
      <SplitCarousel />
    </Section>
  );
}
