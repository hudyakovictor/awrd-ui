import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Asset, Badge, Btn3D, Section, Segmented } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { Mascot, type Mood } from "./Mascot";
import { Phone } from "./Screens";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstAtEl } from "../utils/fx";
import { clamp, readScrollVelocity, useDrag, useInView, useRafLoop, wrap } from "../hooks/motion";

export type G = "flame" | "gem" | "heart" | "bolt" | "coin" | "star" | "crown" | "shield" | "chest" | "rocket";

/* ============ shared bits ============ */
export function Arrows({ onPrev, onNext, disPrev, disNext }: { onPrev: () => void; onNext: () => void; disPrev?: boolean; disNext?: boolean }) {
  return (
    <div className="flex gap-2">
      <Btn3D round size="xs" variant="neutral" className="w-9" onClick={onPrev} disabled={disPrev} sound="tick" aria-label="Previous"><Icon name="chevL" size={15} stroke={3} /></Btn3D>
      <Btn3D round size="xs" variant="neutral" className="w-9" onClick={onNext} disabled={disNext} sound="tick" aria-label="Next"><Icon name="chevR" size={15} stroke={3} /></Btn3D>
    </div>
  );
}
export function Dots({ n, i, onPick, tone = "bg-blue" }: { n: number; i: number; onPick?: (k: number) => void; tone?: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: n }).map((_, k) => (
        <button key={k} onClick={() => onPick?.(k)} aria-label={`Slide ${k + 1}`}
          className={cn("h-2 rounded-full transition-all duration-300", k === i ? cn("w-6 shadow-[0_2px_0_rgba(0,0,0,.35)]", tone) : "w-2 bg-[#22366f] hover:bg-[#2f4890]")} />
      ))}
    </div>
  );
}

/* =========================================================
   1. SNAP CAROUSEL (native scroll-snap + mouse drag)
   ========================================================= */
const COURSES: { t: string; s: string; g: G; a: string; b: string; p: number; tag?: string }[] = [
  { t: "Основы блокчейна", s: "8 уроков · 40 мин", g: "gem", a: "#4f86ff", b: "#1c3068", p: 100, tag: "Пройдено" },
  { t: "Японские свечи", s: "12 уроков · 1ч", g: "flame", a: "#22d68f", b: "#0b5a3c", p: 42, tag: "В процессе" },
  { t: "Уровни и тренды", s: "10 уроков · 55 мин", g: "rocket", a: "#9a6dff", b: "#35198f", p: 8 },
  { t: "Риск-менеджмент", s: "9 уроков · 45 мин", g: "shield", a: "#f5b72e", b: "#6e4500", p: 0, tag: "Новое" },
  { t: "DeFi и стейкинг", s: "14 уроков · 1ч 20м", g: "coin", a: "#2ed3f0", b: "#0b4f5e", p: 0 },
  { t: "Психология сделки", s: "7 уроков · 35 мин", g: "heart", a: "#ff5c78", b: "#6e1226", p: 0, tag: "Pro" },
  { t: "Ончейн-аналитика", s: "11 уроков · 1ч", g: "crown", a: "#ff9a3d", b: "#6b2c05", p: 0 },
];
function SnapCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [prog, setProg] = useState(0);
  const last = useRef(0);
  const drag = useRef<{ x: number; s: number } | null>(null);
  const step = () => { const c = ref.current?.firstElementChild as HTMLElement | null; return c ? c.offsetWidth + 14 : 234; };
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProg(max > 0 ? el.scrollLeft / max : 0);
    const i = clamp(Math.round(el.scrollLeft / step()), 0, COURSES.length - 1);
    if (i !== last.current) { last.current = i; setIdx(i); sfx.tick(); }
  };
  const go = (i: number) => ref.current?.scrollTo({ left: clamp(i, 0, COURSES.length - 1) * step(), behavior: "smooth" });
  const end = () => {
    const el = ref.current;
    if (!el || !drag.current) return;
    drag.current = null;
    el.style.scrollSnapType = "";
    go(Math.round(el.scrollLeft / step()));
  };
  return (
    <Asset title="Snap Carousel" id="car.snap" desc="Нативный scroll-snap + drag мышью. Стрелки, точки, счётчик и прогресс-трек синхронизированы со скроллом; активная карта приподнята." className="lg:col-span-2" tags={["CORE"]}>
      <div className="flex items-center justify-between mb-3">
        <Badge tone="blue"><span className="num">{idx + 1} / {COURSES.length}</span></Badge>
        <Arrows onPrev={() => go(idx - 1)} onNext={() => go(idx + 1)} disPrev={idx === 0} disNext={idx === COURSES.length - 1} />
      </div>
      <div ref={ref} onScroll={onScroll}
        onPointerDown={(e) => { if (e.pointerType !== "mouse" || !ref.current) return; drag.current = { x: e.clientX, s: ref.current.scrollLeft }; ref.current.style.scrollSnapType = "none"; }}
        onPointerMove={(e) => { if (drag.current && ref.current) ref.current.scrollLeft = drag.current.s - (e.clientX - drag.current.x); }}
        onPointerUp={end} onPointerLeave={end}
        className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pt-2 pb-5 -mx-1 px-1 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none]">
        {COURSES.map((c, i) => (
          <div key={c.t} className="snap-start shrink-0 w-[220px] h-[230px] rounded-3xl p-4 relative overflow-hidden transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]"
            style={{ background: `linear-gradient(160deg, ${c.a}, ${c.b})`, boxShadow: `0 6px 0 ${c.b}, 0 18px 30px -12px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.25)`, transform: i === idx ? "translateY(-6px)" : "none" }}>
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
            <div className="absolute right-2 bottom-2 opacity-15"><Icon name="candles" size={84} stroke={1.2} className="text-white" /></div>
            <div className="relative flex items-start justify-between">
              <span className={cn("transition-transform duration-500", i === idx && "scale-110 -rotate-6")}><Glyph name={c.g} size={46} /></span>
              {c.tag && <span className="text-[9.5px] font-extrabold uppercase tracking-wider rounded-full bg-black/25 text-white px-2 py-1">{c.tag}</span>}
            </div>
            <div className="relative mt-10 font-extrabold text-[17px] leading-tight text-white drop-shadow">{c.t}</div>
            <div className="relative text-[11.5px] font-bold text-white/75 mt-0.5">{c.s}</div>
            <div className="relative mt-3 h-2 rounded-full bg-black/25 overflow-hidden"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${c.p}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-1.5 rounded-full bg-[#16275a] overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue to-violet" style={{ width: `${18 + prog * 82}%`, transition: "width .1s" }} />
        </div>
        <Dots n={COURSES.length} i={idx} onPick={go} />
      </div>
    </Asset>
  );
}

/* =========================================================
   2. INFINITE LOOP CAROUSEL (momentum + wrap + autoplay)
   ========================================================= */
const TICKERS = [
  { s: "BTC", n: "Bitcoin", p: "67,420", c: 2.41, col: "#f7931a" },
  { s: "ETH", n: "Ethereum", p: "3,512", c: -1.12, col: "#8c8cff" },
  { s: "SOL", n: "Solana", p: "172.4", c: 6.83, col: "#14f195" },
  { s: "BNB", n: "BNB", p: "598.1", c: 0.54, col: "#f3ba2f" },
  { s: "XRP", n: "Ripple", p: "0.521", c: -3.2, col: "#8fb3ff" },
  { s: "DOGE", n: "Dogecoin", p: "0.161", c: 11.4, col: "#c2a633" },
  { s: "ADA", n: "Cardano", p: "0.452", c: 1.9, col: "#3d7bff" },
  { s: "AVAX", n: "Avalanche", p: "35.80", c: -0.7, col: "#ff4d6a" },
];
function InfiniteCarousel() {
  const W = 150;
  const N = TICKERS.length;
  const total = N * W;
  const st = useRef({ off: 0, v: 0, drag: false, start: 0, idle: 0 });
  const [off, setOff] = useState(0);
  const [cw, setCw] = useState(700);
  const [auto, setAuto] = useState(true);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  const box = useDrag<HTMLDivElement>({
    onStart: () => { const s = st.current; s.drag = true; s.start = s.off; s.v = 0; s.idle = 0; },
    onMove: (d) => { st.current.off = st.current.start - d.dx; },
    onEnd: (d) => { const s = st.current; s.drag = false; s.v = clamp(-d.vx * 17, -70, 70); s.idle = 0; },
  }, "x");
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [box]);
  useRafLoop((dt) => {
    const s = st.current;
    if (!s.drag) {
      s.idle += dt;
      if (Math.abs(s.v) > 0.25) { s.off += s.v; s.v *= 0.94; }
      else {
        s.v = 0;
        const target = Math.round(s.off / W) * W;
        s.off += (target - s.off) * 0.16;
        if (auto && s.idle > 2.4) { s.v = W * 0.061; s.idle = 0; }
      }
    }
    setOff(s.off);
  }, inView);
  const center = cw / 2 - W / 2;
  let active = 0, best = 1e9;
  const items = TICKERS.map((t, i) => {
    const px = wrap(i * W - off + center, -W * 1.5, total - W * 1.5);
    const dist = Math.abs(px - center) / W;
    if (dist < best) { best = dist; active = i; }
    return { t, i, px, dist };
  });
  const nudge = (dir: number) => { st.current.v = dir * W * 0.061; st.current.idle = 0; sfx.tick(); };
  return (
    <Asset title="Infinite Loop Carousel" id="car.infinite" desc="Бесконечная лента без клонов DOM: математический wrap, инерция броска, магнит к центру, автоплей в простое. Работает мышью и тачем." className="lg:col-span-3" tags={["NEW"]}>
      <div ref={wrapRef}>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[12px] font-bold text-mute"><Icon name="swap" size={15} />Бросьте ленту — у неё есть инерция</div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setAuto(!auto); sfx.toggle(); }} className={cn("h-9 px-3 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition", auto ? "bg-bull/15 text-bull" : "bg-white/5 text-dim")}>
              <Icon name={auto ? "play" : "clock"} size={13} />{auto ? "Autoplay" : "Paused"}
            </button>
            <Arrows onPrev={() => nudge(-1)} onNext={() => nudge(1)} />
          </div>
        </div>
        <div ref={box} className="relative h-[190px] overflow-hidden inset !rounded-3xl select-none cursor-grab active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="absolute left-1/2 top-3 bottom-3 w-[150px] -ml-[75px] rounded-2xl border-2 border-dashed border-blue/30 pointer-events-none" />
          {items.map(({ t, i, px, dist }) => {
            const k = Math.max(0, 1 - dist);
            return (
              <div key={t.s} className="absolute top-1/2 w-[150px] px-2" style={{ transform: `translate3d(${px}px, -50%, 0) scale(${0.86 + k * 0.18})`, opacity: 0.45 + k * 0.55, zIndex: Math.round(k * 10) }}>
                <div className={cn("raised p-3.5 text-center transition-shadow", i === active && "ring-2 ring-blue/70 shadow-[0_0_30px_rgba(61,123,255,.35)]")}>
                  <div className="size-11 mx-auto rounded-full grid place-items-center font-extrabold text-[13px] shadow-[inset_0_2px_0_rgba(255,255,255,.3),0_3px_0_rgba(0,0,0,.35)]" style={{ background: t.col, color: "#0b1330" }}>{t.s.slice(0, 1)}</div>
                  <div className="font-extrabold text-[14px] mt-2">{t.s}</div>
                  <div className="text-[10px] text-dim font-bold">{t.n}</div>
                  <div className="num text-[13px] font-bold mt-1">${t.p}</div>
                  <div className={cn("num text-[11px] font-extrabold", t.c >= 0 ? "text-bull" : "text-bear")}>{t.c >= 0 ? "+" : ""}{t.c}%</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-center"><Dots n={N} i={active} onPick={(k) => { const cur = Math.round(st.current.off / W); const curIdx = wrap(cur, 0, N); let d = k - curIdx; if (d > N / 2) d -= N; if (d < -N / 2) d += N; st.current.v = d * W * 0.061; st.current.idle = 0; }} /></div>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. 3D COVERFLOW
   ========================================================= */
const CARDS: { t: string; r: string; g: G; a: string; b: string }[] = [
  { t: "Lucky Coin", r: "Common", g: "coin", a: "#ffe27a", b: "#a86a06" },
  { t: "Night Owl", r: "Rare", g: "star", a: "#8fb3ff", b: "#27408a" },
  { t: "Risk Master", r: "Rare", g: "shield", a: "#5af5b4", b: "#0a7a4a" },
  { t: "Diamond Hands", r: "Legendary", g: "gem", a: "#7fe3ff", b: "#2e59ff" },
  { t: "Bull Run", r: "Epic", g: "rocket", a: "#c7d2ff", b: "#4a5bd6" },
  { t: "Whale", r: "Legendary", g: "crown", a: "#c9a6ff", b: "#5a2fcc" },
  { t: "On Fire", r: "Epic", g: "flame", a: "#ffb35c", b: "#c2410c" },
];
const RARITY: Record<string, string> = { Common: "neutral", Rare: "blue", Epic: "violet", Legendary: "gold" };
function Coverflow() {
  const [i, setI] = useState(3);
  const [dx, setDx] = useState(0);
  const go = (n: number) => { const c = clamp(n, 0, CARDS.length - 1); if (c !== i) { setI(c); sfx.whoosh(); haptic(6); } };
  const ref = useDrag<HTMLDivElement>({
    onMove: (d) => setDx(d.dx),
    onEnd: (d) => {
      setDx(0);
      if (!d.moved) return;
      let s = Math.round(-d.dx / 120);
      if (!s && Math.abs(d.vx) > 0.35) s = -Math.sign(d.vx);
      go(i + s);
    },
  }, "x");
  const pos0 = i - dx / 140;
  const cur = CARDS[i];
  return (
    <Asset title="3D Coverflow" id="car.coverflow" desc="Коллекционные карты трейдера: перспектива, отражение, drag/свайп, клавиши ←/→, клик по боковой карте.">
      <div ref={ref} tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowLeft") go(i - 1); if (e.key === "ArrowRight") go(i + 1); }}
        className="relative h-[300px] select-none outline-none cursor-grab active:cursor-grabbing focus-visible:ring-2 ring-blue/50 rounded-3xl" style={{ perspective: 1100 }}>
        {CARDS.map((c, k) => {
          const p = k - pos0;
          const a = Math.abs(p);
          return (
            <button key={c.t} onClick={() => go(k)}
              className="absolute left-1/2 top-[18px] w-[150px] h-[210px] -ml-[75px] rounded-3xl p-3 text-left overflow-hidden"
              style={{
                transform: `translateX(${p * 96}px) translateZ(${-a * 110}px) rotateY(${clamp(-p * 45, -62, 62)}deg)`,
                zIndex: 100 - Math.round(a * 10),
                opacity: a > 3.6 ? 0 : 1,
                transition: dx ? "none" : "transform .55s cubic-bezier(.3,1.25,.5,1), opacity .4s, filter .4s",
                background: `linear-gradient(165deg, ${c.a}, ${c.b})`,
                boxShadow: `0 6px 0 ${c.b}, 0 22px 30px -10px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.35)`,
                filter: `brightness(${1 - Math.min(a, 3) * 0.17})`,
                WebkitBoxReflect: "below 6px linear-gradient(transparent 68%, rgba(255,255,255,.22))",
              } as CSSProperties}>
              {k === i && <div className="shine absolute inset-0" />}
              <span className="relative text-[9px] font-extrabold uppercase tracking-wider rounded-full bg-black/25 text-white px-2 py-0.5">{c.r}</span>
              <div className={cn("relative grid place-items-center mt-5", k === i && "anim-float")}><Glyph name={c.g} size={70} /></div>
              <div className="absolute bottom-3 inset-x-3">
                <div className="font-extrabold text-white text-[14px] drop-shadow leading-tight">{c.t}</div>
                <div className="flex gap-1 mt-1">{[0, 1, 2, 3, 4].map((s) => <span key={s} className={cn("h-1 flex-1 rounded-full", s < ["Common", "Rare", "Epic", "Legendary"].indexOf(c.r) + 2 ? "bg-white" : "bg-black/25")} />)}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        <div key={i} className="anim-fade"><div className="font-extrabold text-[14px]">{cur.t}</div><Badge tone={RARITY[cur.r]} size="xs">{cur.r}</Badge></div>
        <Arrows onPrev={() => go(i - 1)} onNext={() => go(i + 1)} disPrev={i === 0} disNext={i === CARDS.length - 1} />
      </div>
    </Asset>
  );
}

/* =========================================================
   4. CARD STACK DECK (fling any direction)
   ========================================================= */
const TIPS: { t: string; d: string; g: G; a: string; b: string }[] = [
  { t: "Сначала стоп — потом вход", d: "Определи, где ты неправ, до того как нажмёшь Buy.", g: "shield", a: "#1fdb8b", b: "#0a5c3a" },
  { t: "Не гонись за свечой", d: "Пропущенная сделка лучше, чем FOMO-вход на хаях.", g: "flame", a: "#ff8a3d", b: "#6b2c05" },
  { t: "Риск 1% на сделку", d: "10 убытков подряд — и ты всё ещё в игре.", g: "heart", a: "#ff5c78", b: "#6e1226" },
  { t: "Тренд — твой друг", d: "Торгуй по направлению старшего таймфрейма.", g: "rocket", a: "#6a8dff", b: "#1f2f7a" },
  { t: "Веди журнал", d: "Каждая сделка — урок, если ты её записал.", g: "star", a: "#ffc53d", b: "#6e4500" },
];
function TipDeck() {
  const [order, setOrder] = useState(TIPS.map((_, i) => i));
  const [d, setD] = useState({ x: 0, y: 0 });
  const [fly, setFly] = useState<null | { x: number; y: number }>(null);
  const [count, setCount] = useState(0);
  const flingOut = (a: number) => {
    setFly({ x: Math.cos(a) * 620, y: Math.sin(a) * 620 });
    sfx.whoosh(); haptic(8);
    setTimeout(() => { setOrder((o) => [...o.slice(1), o[0]]); setFly(null); setD({ x: 0, y: 0 }); setCount((c) => c + 1); }, 300);
  };
  const ref = useDrag<HTMLDivElement>({
    onMove: (i) => { if (!fly) setD({ x: i.dx, y: i.dy }); },
    onEnd: (i) => {
      if (!i.moved || fly) return;
      if (Math.hypot(i.dx, i.dy) > 110 || Math.hypot(i.vx, i.vy) > 0.7) flingOut(Math.atan2(i.dy + i.vy * 100, i.dx + i.vx * 100));
      else setD({ x: 0, y: 0 });
    },
  });
  const pull = clamp(Math.hypot(d.x, d.y) / 160);
  return (
    <Asset title="Card Stack Deck" id="car.stack" desc="Колода советов: бросьте верхнюю карту в любую сторону — она уходит под низ, остальные поднимаются.">
      <div ref={ref} className="relative h-[280px] select-none cursor-grab active:cursor-grabbing">
        {order.slice(0, 4).map((ti, k) => {
          const t = TIPS[ti];
          const top = k === 0;
          const kk = Math.max(0, k - pull);
          const style: CSSProperties = top
            ? { transform: fly ? `translate(${fly.x}px, ${fly.y}px) rotate(${fly.x * 0.05}deg)` : `translate(${d.x}px, ${d.y}px) rotate(${d.x * 0.06}deg)`, transition: fly ? "transform .3s ease-in" : d.x || d.y ? "none" : "transform .45s cubic-bezier(.3,1.5,.5,1)", zIndex: 10 }
            : { transform: `translateY(${kk * 14}px) scale(${1 - kk * 0.06})`, transition: "transform .35s cubic-bezier(.3,1.3,.5,1)", zIndex: 10 - k, filter: `brightness(${1 - kk * 0.14})` };
          return (
            <div key={ti} className="absolute inset-x-4 top-3 h-[220px] rounded-3xl p-5 text-white" style={{ ...style, background: `linear-gradient(160deg, ${t.a}, ${t.b})`, boxShadow: `0 6px 0 ${t.b}, 0 20px 30px -12px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.3)` }}>
              <div className="flex items-center justify-between"><Glyph name={t.g} size={40} /><span className="num text-[11px] font-extrabold bg-black/25 rounded-full px-2 py-0.5">#{ti + 1}</span></div>
              <div className="font-extrabold text-[19px] leading-tight mt-5 drop-shadow">{t.t}</div>
              <div className="text-[12.5px] font-semibold text-white/85 mt-2 leading-snug">{t.d}</div>
              {top && <div className="absolute bottom-4 left-5 right-5 flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white/70"><Icon name="swap" size={13} />Бросьте карту</div>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] font-bold text-mute">Просмотрено: <span className="num text-txt">{count}</span></span>
        <Btn3D size="xs" variant="blue" onClick={() => flingOut(-0.3)} iconRight={<Icon name="chevR" size={13} stroke={3} />}>Next tip</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   5. STORIES (autoplay segments, tap zones, hold to pause)
   ========================================================= */
const STORIES: { who: string; mood: Mood; title: string; text: string; bg: string; g: G }[] = [
  { who: "Market", mood: "idle", title: "Рынок открылся", text: "BTC +3.2% за ночь. Разберём, почему это не повод для FOMO.", bg: "from-[#1d3a8a] via-[#142350] to-[#070d1f]", g: "rocket" },
  { who: "Streak", mood: "cheer", title: "Серия 47 дней", text: "Ты в топ-5% учеников недели. Не сбавляй темп!", bg: "from-[#8a3d0a] via-[#3a1a14] to-[#070d1f]", g: "flame" },
  { who: "Alert", mood: "worried", title: "Волатильность", text: "Индекс страха упал до 22. Уменьши размер позиций.", bg: "from-[#7a1428] via-[#2a0f24] to-[#070d1f]", g: "shield" },
  { who: "Lesson", mood: "idle", title: "Новый урок", text: "Фибоначчи: как найти точку входа на откате.", bg: "from-[#3a1b9e] via-[#1c1650] to-[#070d1f]", g: "star" },
  { who: "League", mood: "cheer", title: "+2 места в лиге", text: "Ты обогнал Vitalik B. До зоны повышения — 180 XP.", bg: "from-[#0a6b48] via-[#0f2a33] to-[#070d1f]", g: "crown" },
];
function Stories() {
  const N = STORIES.length;
  const [s, setS] = useState(0);
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seen, setSeen] = useState<number[]>([0]);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.35 });
  const tr = useRef(0);
  const hold = useRef<number | null>(null);
  const held = useRef(false);
  const goto = (n: number) => { const k = (n + N) % N; tr.current = 0; setT(0); setS(k); setSeen((v) => (v.includes(k) ? v : [...v, k])); sfx.tap(); };
  useRafLoop((dt) => {
    tr.current += dt / 5;
    if (tr.current >= 1) { tr.current = 0; setS((x) => { const k = (x + 1) % N; setSeen((v) => (v.includes(k) ? v : [...v, k])); return k; }); sfx.tick(); }
    setT(tr.current);
  }, inView && !paused);
  const st = STORIES[s];
  return (
    <Asset title="Stories Carousel" id="car.stories" desc="Автоплей сегментов 5с. Тап слева/справа — назад/вперёд, удержание — пауза. Кольца-аватары для прыжка.">
      <div ref={wrapRef} className="flex flex-col items-center">
        <div className="flex gap-2.5 mb-4">
          {STORIES.map((x, k) => (
            <button key={x.who} onClick={() => goto(k)} className="flex flex-col items-center gap-1">
              <span className={cn("p-[2.5px] rounded-full transition-transform", k === s && "scale-110", seen.includes(k) && k !== s ? "bg-[#26397a]" : "bg-gradient-to-tr from-gold via-bear to-violet")}>
                <span className="size-10 rounded-full bg-ink-850 border-2 border-ink-800 grid place-items-center"><Glyph name={x.g} size={20} /></span>
              </span>
              <span className="text-[9px] font-extrabold text-mute">{x.who}</span>
            </button>
          ))}
        </div>
        <div className={cn("relative w-full max-w-[260px] aspect-[9/14] rounded-[28px] overflow-hidden bg-gradient-to-b select-none shadow-[0_8px_0_#0b1536,0_24px_40px_rgba(0,0,0,.5)] border border-white/10", st.bg)}
          onPointerDown={() => { held.current = false; hold.current = window.setTimeout(() => { held.current = true; setPaused(true); }, 200); }}
          onPointerUp={(e) => {
            if (hold.current) clearTimeout(hold.current);
            if (held.current) { setPaused(false); held.current = false; return; }
            const r = e.currentTarget.getBoundingClientRect();
            goto(e.clientX - r.left < r.width / 3 ? s - 1 : s + 1);
          }}
          onPointerLeave={() => { if (hold.current) clearTimeout(hold.current); if (held.current) { setPaused(false); held.current = false; } }}>
          <div className="absolute top-2.5 inset-x-2.5 flex gap-1 z-10">
            {STORIES.map((_, k) => (
              <div key={k} className="flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${k < s ? 100 : k === s ? t * 100 : 0}%` }} />
              </div>
            ))}
          </div>
          <div className="absolute top-6 inset-x-3 flex items-center gap-2 z-10">
            <span className="size-7 rounded-full bg-black/30 grid place-items-center"><Glyph name={st.g} size={16} /></span>
            <span className="text-[11px] font-extrabold text-white">{st.who}</span>
            <span className="text-[10px] text-white/60 font-bold">· сейчас</span>
            {paused && <span className="ml-auto text-[9px] font-extrabold bg-black/40 rounded px-1.5 py-0.5 text-white anim-pop">PAUSED</span>}
          </div>
          <div key={s} className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 pt-8 anim-scale">
            <Mascot mood={st.mood} size={110} bg={false} />
            <div className="text-[20px] font-extrabold text-white mt-2 drop-shadow">{st.title}</div>
            <div className="text-[12.5px] text-white/80 font-semibold mt-1.5 leading-snug">{st.text}</div>
          </div>
          <div className="absolute bottom-4 inset-x-0 flex flex-col items-center text-white/80">
            <Icon name="chevU" size={18} stroke={3} className="anim-float" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Подробнее</span>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   6. SCROLL-VELOCITY MARQUEE
   ========================================================= */
const WORDS = ["BUY THE DIP", "HODL", "DYOR", "STOP-LOSS FIRST", "TO THE MOON", "RISK 1%", "DIAMOND HANDS", "NO FOMO"];
function MarqueeRow({ dir, speed, paused, children }: { dir: 1 | -1; speed: number; paused: boolean; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const flip = useRef(1);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  useRafLoop((dt) => {
    const el = track.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    const v = readScrollVelocity();
    if (v > 0.05) flip.current = 1; else if (v < -0.05) flip.current = -1;
    const boost = 1 + Math.min(8, Math.abs(v) * 6);
    x.current -= (paused ? 0 : speed * boost) * dt * dir * flip.current;
    if (x.current < -half) x.current += half;
    if (x.current > 0) x.current -= half;
    el.style.transform = `translate3d(${x.current}px,0,0) skewX(${clamp(-v * 10, -14, 14)}deg)`;
  }, inView);
  return (
    <div ref={wrapRef} className="overflow-hidden">
      <div ref={track} className="flex w-max will-change-transform">
        {children}
        {children}
      </div>
    </div>
  );
}
function VelocityMarquee() {
  const [speed, setSpeed] = useState("n");
  const [paused, setPaused] = useState(false);
  const sp = { s: 30, n: 70, f: 150 }[speed as "s" | "n" | "f"];
  return (
    <Asset title="Scroll-Velocity Marquee" id="car.marquee" desc="Бегущие строки реагируют на скролл страницы: ускоряются, наклоняются (skew) и меняют направление вместе со скроллом. Hover — пауза." className="lg:col-span-3" tags={["SCROLL"]}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-[12px] font-bold text-mute flex items-center gap-2"><Icon name="arrowDown" size={15} className="anim-float" />Прокрутите страницу вверх-вниз и смотрите на строки</div>
        <Segmented className="w-56" size="sm" value={speed} onChange={setSpeed} options={[{ value: "s", label: "Slow" }, { value: "n", label: "Normal" }, { value: "f", label: "Fast" }]} />
      </div>
      <div className="space-y-3 -mx-5" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <MarqueeRow dir={1} speed={sp} paused={paused}>
          {WORDS.map((w, i) => (
            <span key={w} className="flex items-center gap-6 pr-6">
              <span className={cn("text-[44px] sm:text-[60px] font-extrabold tracking-tight whitespace-nowrap leading-none", i % 2 ? "text-transparent [-webkit-text-stroke:2px_#3d5aa8]" : "bg-gradient-to-r from-bull via-cyan to-blue bg-clip-text text-transparent")}>{w}</span>
              <Glyph name={(["star", "gem", "flame", "coin"] as const)[i % 4]} size={36} />
            </span>
          ))}
        </MarqueeRow>
        <MarqueeRow dir={-1} speed={sp * 0.8} paused={paused}>
          {TICKERS.map((t) => (
            <span key={t.s} className="flex items-center gap-2 mr-3 raised !rounded-full pl-1.5 pr-4 h-11 whitespace-nowrap">
              <span className="size-8 rounded-full grid place-items-center text-[11px] font-extrabold" style={{ background: t.col, color: "#0b1330" }}>{t.s[0]}</span>
              <span className="font-extrabold text-[13px]">{t.s}</span>
              <span className="num text-[12px] text-mute">${t.p}</span>
              <span className={cn("num text-[11px] font-extrabold", t.c >= 0 ? "text-bull" : "text-bear")}>{t.c >= 0 ? "▲" : "▼"} {Math.abs(t.c)}%</span>
            </span>
          ))}
        </MarqueeRow>
        <MarqueeRow dir={1} speed={sp * 1.3} paused={paused}>
          {["LEARN", "PRACTICE", "TRADE", "COMPETE", "EARN XP", "LEVEL UP"].map((w) => (
            <span key={w} className="flex items-center gap-4 pr-4 text-[13px] font-extrabold tracking-[.3em] text-dim whitespace-nowrap">{w}<span className="size-1.5 rounded-full bg-violet" /></span>
          ))}
        </MarqueeRow>
      </div>
    </Asset>
  );
}

/* =========================================================
   7. VERTICAL FEED (TikTok-style) in a phone
   ========================================================= */
const FEED: { t: string; d: string; g: G; bg: string; tag: string; likes: number }[] = [
  { t: "Что такое спред?", d: "Разница между лучшей ценой покупки и продажи. Меньше спред — дешевле сделка.", g: "gem", bg: "from-[#1c3a8a] to-[#070d1f]", tag: "#basics", likes: 1240 },
  { t: "Бычье поглощение", d: "Крупная зелёная свеча накрывает красную — покупатели перехватили инициативу.", g: "flame", bg: "from-[#0a6b48] to-[#070d1f]", tag: "#candles", likes: 3820 },
  { t: "Плечо x100 — ловушка", d: "Движение на 1% против тебя — и позиция ликвидирована.", g: "bolt", bg: "from-[#7a1428] to-[#070d1f]", tag: "#risk", likes: 9120 },
  { t: "DCA стратегия", d: "Покупай на фиксированную сумму регулярно — усредняешь цену входа.", g: "coin", bg: "from-[#6e4500] to-[#070d1f]", tag: "#strategy", likes: 2410 },
  { t: "Halving BTC", d: "Раз в ~4 года награда майнерам делится пополам. Предложение — дефицитнее.", g: "rocket", bg: "from-[#3a1b9e] to-[#070d1f]", tag: "#bitcoin", likes: 5630 },
];
function VerticalFeed() {
  const ref = useRef<HTMLDivElement>(null);
  const [a, setA] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [heart, setHeart] = useState<{ id: number; x: number; y: number } | null>(null);
  const lastTap = useRef(0);
  const onScroll = () => { const el = ref.current; if (!el) return; const i = Math.round(el.scrollTop / el.clientHeight); if (i !== a) { setA(i); sfx.tick(); } };
  const like = (i: number, x?: number, y?: number) => {
    if (x !== undefined && y !== undefined) setHeart({ id: Date.now(), x, y });
    if (!liked.includes(i)) setLiked([...liked, i]);
    sfx.pop(); haptic(12);
  };
  return (
    <Asset title="Vertical Feed" id="car.feed" desc="Лента микро-уроков: вертикальный snap, анимация активного слайда, двойной тап — лайк с сердцем.">
      <Phone>
        <div ref={ref} onScroll={onScroll} className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none]">
          {FEED.map((f, i) => (
            <div key={f.t} className={cn("relative h-full snap-start snap-always bg-gradient-to-b overflow-hidden select-none", f.bg)}
              onPointerUp={(e) => {
                const now = Date.now();
                const r = e.currentTarget.getBoundingClientRect();
                if (now - lastTap.current < 300) like(i, e.clientX - r.left, e.clientY - r.top);
                lastTap.current = now;
              }}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
              <div className={cn("absolute inset-x-0 top-[22%] flex justify-center transition-all duration-700 ease-[cubic-bezier(.3,1.4,.5,1)]", a === i ? "opacity-100 scale-100" : "opacity-0 scale-50")}>
                <div className={a === i ? "anim-float" : ""}><Glyph name={f.g} size={96} /></div>
              </div>
              <div className="absolute left-4 right-14 bottom-8 text-white">
                <div className={cn("text-[10px] font-extrabold text-cyan transition-all duration-500 delay-100", a === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>{f.tag}</div>
                <div className={cn("text-[19px] font-extrabold leading-tight mt-1 transition-all duration-500 delay-200", a === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>{f.t}</div>
                <div className={cn("text-[11.5px] text-white/80 font-semibold mt-1.5 leading-snug transition-all duration-500 delay-300", a === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>{f.d}</div>
              </div>
              <div className="absolute right-2.5 bottom-10 flex flex-col items-center gap-4 text-white" data-nodrag>
                <button onClick={() => (liked.includes(i) ? setLiked(liked.filter((x) => x !== i)) : like(i))} className="flex flex-col items-center">
                  <span className={cn("size-10 rounded-full bg-black/30 grid place-items-center transition", liked.includes(i) && "text-bear")}><Icon name="heart" size={20} className={liked.includes(i) ? "fill-current anim-pop" : ""} /></span>
                  <span className="num text-[9.5px] font-extrabold mt-0.5">{(f.likes + (liked.includes(i) ? 1 : 0)).toLocaleString()}</span>
                </button>
                <button onClick={() => { setSaved(saved.includes(i) ? saved.filter((x) => x !== i) : [...saved, i]); sfx.toggle(); }} className="flex flex-col items-center">
                  <span className={cn("size-10 rounded-full bg-black/30 grid place-items-center", saved.includes(i) && "text-gold")}><Icon name="star" size={19} className={saved.includes(i) ? "fill-current anim-pop" : ""} /></span>
                  <span className="text-[9.5px] font-extrabold mt-0.5">Save</span>
                </button>
                <button className="flex flex-col items-center"><span className="size-10 rounded-full bg-black/30 grid place-items-center"><Icon name="send" size={18} /></span><span className="text-[9.5px] font-extrabold mt-0.5">Share</span></button>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/15">
                {a === i && <div className="h-full bg-white origin-left" style={{ animation: "progress-fill 6s linear forwards" }} />}
              </div>
              {heart && a === i && (
                <span key={heart.id} className="absolute pointer-events-none" style={{ left: heart.x, top: heart.y, animation: "heart-pop .9s ease-out forwards" }}>
                  <Glyph name="heart" size={90} />
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none z-20">
          {FEED.map((_, i) => <span key={i} className={cn("w-1 rounded-full transition-all duration-300", a === i ? "h-5 bg-white" : "h-1.5 bg-white/35")} />)}
        </div>
      </Phone>
    </Asset>
  );
}

/* =========================================================
   8. CENTER-MODE (scale/blur/rotate from scroll position)
   ========================================================= */
const TIERS = [
  { n: "Bronze", c: "#d08a3d", r: "Старт" }, { n: "Silver", c: "#c9d5f5", r: "Топ-20 → вверх" }, { n: "Gold", c: "#ffc53d", r: "Топ-15 → вверх" },
  { n: "Sapphire", c: "#3d7bff", r: "Топ-10 → вверх" }, { n: "Ruby", c: "#ff4d6a", r: "Топ-10 → вверх" }, { n: "Emerald", c: "#1fdb8b", r: "Топ-7 → вверх" },
  { n: "Amethyst", c: "#8d5cff", r: "Топ-5 → вверх" }, { n: "Diamond", c: "#7fe3ff", r: "Элита · x2 награды" },
];
function TierBadge({ c, size = 84 }: { c: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 80 88">
      <defs><linearGradient id={`tb${c.slice(1)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".35" stopColor={c} /><stop offset="1" stopColor={c} stopOpacity=".6" /></linearGradient></defs>
      <path d="M40 4 L74 18 V46 C74 66 58 80 40 86 C22 80 6 66 6 46 V18 Z" fill="rgba(0,0,0,.35)" transform="translate(0 4)" />
      <path d="M40 4 L74 18 V46 C74 66 58 80 40 86 C22 80 6 66 6 46 V18 Z" fill={`url(#tb${c.slice(1)})`} stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
      <path d="M40 22 L46 36 L61 37 L49 46 L53 61 L40 52 L27 61 L31 46 L19 37 L34 36 Z" fill="rgba(255,255,255,.85)" />
    </svg>
  );
}
function CenterMode() {
  const ref = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const [act, setAct] = useState(3);
  const actRef = useRef(3);
  const paint = () => {
    const el = ref.current;
    if (!el) return;
    const cx = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bd = 1e9;
    items.current.forEach((it, k) => {
      if (!it) return;
      const c = it.offsetLeft + it.offsetWidth / 2;
      const d = (c - cx) / it.offsetWidth;
      const a = Math.min(Math.abs(d), 2.5);
      it.style.transform = `scale(${1 - a * 0.2}) rotateY(${clamp(-d * 28, -45, 45)}deg) translateY(${a * 8}px)`;
      it.style.opacity = String(1 - a * 0.32);
      it.style.filter = `blur(${a > 0.6 ? (a - 0.6) * 1.4 : 0}px)`;
      if (Math.abs(d) < bd) { bd = Math.abs(d); best = k; }
    });
    if (best !== actRef.current) { actRef.current = best; setAct(best); sfx.tick(); }
  };
  const center = (k: number, smooth = true) => {
    const el = ref.current, it = items.current[k];
    if (!el || !it) return;
    el.scrollTo({ left: it.offsetLeft + it.offsetWidth / 2 - el.clientWidth / 2, behavior: smooth ? "smooth" : "auto" });
  };
  useEffect(() => { center(3, false); requestAnimationFrame(paint); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const t = TIERS[act];
  return (
    <Asset title="Center-Mode Carousel" id="car.center" desc="Лиги: центральный элемент в фокусе, соседи уменьшаются, поворачиваются и размываются — всё вычисляется от позиции скролла." className="lg:col-span-2">
      <div ref={ref} onScroll={paint} className="relative flex overflow-x-auto snap-x snap-mandatory py-6 [scrollbar-width:none] [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]" style={{ perspective: 800, paddingInline: "calc(50% - 70px)" }}>
        {TIERS.map((x, k) => (
          <button key={x.n} ref={(e) => { items.current[k] = e; }} onClick={() => center(k)} className="snap-center shrink-0 w-[140px] flex flex-col items-center gap-2 will-change-transform">
            <div className="relative">
              {k === act && <div className="absolute inset-0 blur-2xl rounded-full" style={{ background: x.c, opacity: 0.45 }} />}
              <div className="relative"><TierBadge c={x.c} /></div>
            </div>
            <span className="font-extrabold text-[13px]" style={{ color: k === act ? x.c : undefined }}>{x.n}</span>
          </button>
        ))}
      </div>
      <div key={act} className="inset p-3.5 flex items-center gap-3 anim-fade">
        <span className="size-10 rounded-xl grid place-items-center font-extrabold num text-[13px]" style={{ background: `${t.c}25`, color: t.c }}>{act + 1}</span>
        <div className="flex-1"><div className="font-extrabold text-[14px]">{t.n} League</div><div className="text-[11.5px] text-mute">{t.r}</div></div>
        <Arrows onPrev={() => center(Math.max(0, act - 1))} onNext={() => center(Math.min(TIERS.length - 1, act + 1))} disPrev={act === 0} disNext={act === TIERS.length - 1} />
      </div>
    </Asset>
  );
}

/* =========================================================
   9. 3D CUBE
   ========================================================= */
const FACES: { t: string; d: string; g: G; c: string }[] = [
  { t: "Spot", d: "Покупаешь актив напрямую. Без плеча и ликвидаций.", g: "coin", c: "#1fdb8b" },
  { t: "Futures", d: "Контракт на цену. Плечо усиливает и прибыль, и убыток.", g: "bolt", c: "#ffc53d" },
  { t: "Options", d: "Право, но не обязанность купить или продать.", g: "shield", c: "#8d5cff" },
  { t: "Staking", d: "Блокируешь монеты и получаешь доход за валидацию.", g: "gem", c: "#2ed3f0" },
];
function Cube() {
  const [f, setF] = useState(0);
  const [dx, setDx] = useState(0);
  const turn = (d: number) => { setF((x) => x + d); sfx.whoosh(); haptic(8); };
  const ref = useDrag<HTMLDivElement>({
    onMove: (d) => setDx(d.dx),
    onEnd: (d) => { setDx(0); if (!d.moved) return; if (d.dx < -50 || d.vx < -0.4) turn(1); else if (d.dx > 50 || d.vx > 0.4) turn(-1); },
  }, "x");
  const active = wrap(f, 0, 4);
  return (
    <Asset title="3D Cube Carousel" id="car.cube" desc="Четыре грани — четыре рынка. Крутите пальцем: грань следует за жестом и докручивается пружиной.">
      <div ref={ref} className="h-[230px] grid place-items-center select-none cursor-grab active:cursor-grabbing" style={{ perspective: 900 }}>
        <div className="relative size-[170px]" style={{ transformStyle: "preserve-3d", transform: `translateZ(-85px) rotateY(${-f * 90 + dx * 0.4}deg)`, transition: dx ? "none" : "transform .7s cubic-bezier(.3,1.3,.5,1)" }}>
          {FACES.map((x, k) => (
            <div key={x.t} className="absolute inset-0 rounded-3xl p-4 flex flex-col text-white border border-white/15"
              style={{ transform: `rotateY(${k * 90}deg) translateZ(85px)`, background: `linear-gradient(160deg, ${x.c}, #0f1b3f 90%)`, boxShadow: "inset 0 2px 0 rgba(255,255,255,.3)", backfaceVisibility: "hidden" }}>
              <Glyph name={x.g} size={40} />
              <div className="font-extrabold text-[20px] mt-auto drop-shadow">{x.t}</div>
              <div className="text-[11px] font-semibold text-white/80 leading-snug">{x.d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Dots n={4} i={active} onPick={(k) => { const d = k - active; turn(d > 2 ? d - 4 : d < -2 ? d + 4 : d); }} tone="bg-violet" />
        <Arrows onPrev={() => turn(-1)} onNext={() => turn(1)} />
      </div>
    </Asset>
  );
}

/* =========================================================
   10. PATTERN GALLERY (main + thumbs + path-draw)
   ========================================================= */
const PATTERNS = [
  { n: "Head & Shoulders", t: "Медвежий разворот", d: "M0,80 L25,55 L40,70 L70,22 L100,70 L125,50 L145,72 L170,85 L200,95", neck: 70, c: "#ff4d6a" },
  { n: "Double Top", t: "Медвежий разворот", d: "M0,90 L40,25 L70,60 L100,25 L140,70 L200,92", neck: 60, c: "#ff4d6a" },
  { n: "Double Bottom", t: "Бычий разворот", d: "M0,12 L40,78 L70,40 L100,78 L140,30 L200,8", neck: 40, c: "#1fdb8b" },
  { n: "Cup & Handle", t: "Бычье продолжение", d: "M0,20 C30,88 90,88 120,22 L140,36 L155,28 L200,4", neck: 22, c: "#1fdb8b" },
  { n: "Ascending Triangle", t: "Бычий пробой", d: "M0,90 L30,25 L50,70 L80,25 L100,55 L125,25 L140,42 L160,25 L200,4", neck: 25, c: "#1fdb8b" },
  { n: "Bull Flag", t: "Бычье продолжение", d: "M0,95 L50,20 L65,35 L80,25 L95,40 L110,30 L125,45 L200,4", neck: 0, c: "#1fdb8b" },
];
function PatternGallery() {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [t, setT] = useState(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (n: number) => { const k = wrap(n, 0, PATTERNS.length); setI(k); setT(0); sfx.whoosh(); thumbs.current[k]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); };
  useRafLoop((dt) => { setT((v) => { const n = v + dt / 3; if (n >= 1) { go(i + 1); return 0; } return n; }); }, auto);
  const p = PATTERNS[i];
  return (
    <Asset title="Pattern Gallery" id="car.gallery" desc="Главный слайд с анимацией отрисовки графика + полоса миниатюр с автопрокруткой к активной. Автоплей с прогрессом." className="lg:col-span-2">
      <div className="inset !rounded-3xl p-4 relative overflow-hidden">
        <div className="flex items-start justify-between relative z-10">
          <div key={"t" + i} className="anim-fade"><div className="font-extrabold text-[18px]">{p.n}</div><Badge tone={p.c === "#1fdb8b" ? "bull" : "bear"} size="xs">{p.t}</Badge></div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setAuto(!auto); sfx.toggle(); }} className="relative size-9 rounded-full bg-white/5 grid place-items-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="none" stroke={p.c} strokeWidth="2.5" strokeDasharray={`${t * 100.5} 100.5`} /></svg>
              <Icon name={auto ? "minus" : "play"} size={14} />
            </button>
            <Arrows onPrev={() => go(i - 1)} onNext={() => go(i + 1)} />
          </div>
        </div>
        <svg key={i} viewBox="0 0 200 100" className="w-full h-[180px] mt-2 overflow-visible">
          <defs><linearGradient id="pg-f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={p.c} stopOpacity=".3" /><stop offset="1" stopColor={p.c} stopOpacity="0" /></linearGradient></defs>
          {[25, 50, 75].map((y) => <line key={y} x1="0" x2="200" y1={y} y2={y} stroke="rgba(140,170,255,.07)" />)}
          {p.neck > 0 && <line x1="0" x2="200" y1={p.neck} y2={p.neck} stroke="#ffc53d" strokeDasharray="4 4" strokeWidth="1" style={{ animation: "fade-in .6s .9s both" }} />}
          <path d={`${p.d} L200,100 L0,100 Z`} fill="url(#pg-f)" style={{ animation: "fade-in .8s .6s both" }} />
          <path d={p.d} fill="none" stroke={p.c} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" style={{ animation: "draw 1.1s cubic-bezier(.3,.8,.3,1) forwards", filter: `drop-shadow(0 0 6px ${p.c})` }} />
        </svg>
      </div>
      <div className="flex gap-2.5 overflow-x-auto mt-3 pb-1 snap-x [scrollbar-width:none]">
        {PATTERNS.map((x, k) => (
          <button key={x.n} ref={(e) => { thumbs.current[k] = e; }} onClick={() => go(k)}
            className={cn("snap-center shrink-0 w-28 rounded-2xl p-2 border-2 transition-all", k === i ? "border-blue bg-blue/10 -translate-y-1" : "border-[#22366f] bg-ink-850 opacity-60 hover:opacity-100")}>
            <svg viewBox="0 0 200 100" className="w-full h-10"><path d={x.d} fill="none" stroke={x.c} strokeWidth="6" strokeLinejoin="round" /></svg>
            <div className="text-[9.5px] font-extrabold mt-1 truncate">{x.n}</div>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   11. ORBIT CAROUSEL
   ========================================================= */
const ORB: { g: G; t: string; d: string }[] = [
  { g: "coin", t: "Coins", d: "Валюта магазина" }, { g: "gem", t: "Gems", d: "Премиум-валюта" }, { g: "bolt", t: "XP Boost", d: "x2 опыт на 30 мин" },
  { g: "heart", t: "Hearts", d: "Жизни в уроках" }, { g: "shield", t: "Freeze", d: "Защита серии" }, { g: "chest", t: "Chest", d: "Случайная награда" }, { g: "crown", t: "Pro", d: "Всё безлимитно" },
];
function Orbit() {
  const N = ORB.length;
  const st = useRef({ a: 0, v: 0, drag: false, start: 0, idle: 0 });
  const [a, setA] = useState(0);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  const ref = useDrag<HTMLDivElement>({
    onStart: () => { const s = st.current; s.drag = true; s.start = s.a; s.v = 0; },
    onMove: (d) => { st.current.a = st.current.start + d.dx * 0.012; },
    onEnd: (d) => { const s = st.current; s.drag = false; s.v = d.vx * 0.2; s.idle = 0; },
  }, "x");
  useRafLoop((dt) => {
    const s = st.current;
    if (!s.drag) {
      s.a += s.v; s.v *= 0.95; s.idle += dt;
      if (s.idle > 1.6 && Math.abs(s.v) < 0.002) s.a += dt * 0.3;
    }
    setA(s.a);
  }, inView);
  const R = 118;
  let front = 0, fz = -2;
  const pos = ORB.map((o, k) => {
    const ang = a + (k * Math.PI * 2) / N;
    const z = Math.sin(ang);
    if (z > fz) { fz = z; front = k; }
    return { o, k, x: Math.cos(ang) * R, y: z * 34, z, ang };
  });
  const bring = (k: number) => {
    const ang = pos[k].ang;
    let diff = Math.PI / 2 - ang;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    st.current.v = diff / 20; st.current.idle = 0; sfx.whoosh();
  };
  return (
    <Asset title="Orbit Carousel" id="car.orbit" desc="Награды вращаются вокруг Bulli по эллипсу с глубиной. Крутите жестом, клик — вывести предмет вперёд.">
      <div ref={wrapRef}>
        <div ref={ref} className="relative h-[250px] select-none cursor-grab active:cursor-grabbing">
          <div className="absolute left-1/2 top-1/2 w-[260px] h-[76px] -ml-[130px] -mt-[38px] rounded-[50%] border-2 border-dashed border-blue/25" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 50 }}><Mascot mood="idle" size={110} /></div>
          {pos.map(({ o, k, x, y, z }) => (
            <button key={o.t} onClick={() => bring(k)} className="absolute left-1/2 top-1/2" style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${0.6 + ((z + 1) / 2) * 0.6})`, zIndex: z > 0 ? 60 + Math.round(z * 10) : 40 + Math.round(z * 10), filter: `brightness(${0.55 + ((z + 1) / 2) * 0.45})` }}>
              <span className={cn("size-14 rounded-2xl grid place-items-center raised", k === front && "ring-2 ring-gold/70")}><Glyph name={o.g} size={32} /></span>
            </button>
          ))}
        </div>
        <div key={front} className="inset p-3 flex items-center gap-3 anim-fade">
          <Glyph name={ORB[front].g} size={28} />
          <div className="flex-1"><div className="font-extrabold text-[13px]">{ORB[front].t}</div><div className="text-[11px] text-mute">{ORB[front].d}</div></div>
          <Btn3D size="xs" variant="gold" onClick={(e) => { burstAtEl(e.currentTarget, "coins", 10); }}>Get</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   12. ACCORDION SLIDER
   ========================================================= */
const PANELS: { t: string; d: string; g: G; a: string; b: string; stat: string }[] = [
  { t: "Learn", d: "5-минутные уроки с квизами и прогнозами.", g: "rocket", a: "#4f86ff", b: "#152658", stat: "240+ уроков" },
  { t: "Practice", d: "Демо-счёт $10 000 и живые графики.", g: "bolt", a: "#22d68f", b: "#083b28", stat: "0$ риска" },
  { t: "Compete", d: "Недельные лиги, 30 соперников.", g: "crown", a: "#9a6dff", b: "#26136b", stat: "8 лиг" },
  { t: "Earn", d: "XP, кристаллы, сундуки и скины.", g: "gem", a: "#f5b72e", b: "#553500", stat: "∞ наград" },
  { t: "Master", d: "Сертификаты и Pro-стратегии.", g: "star", a: "#ff5c78", b: "#560e1e", stat: "Сертификат" },
];
function AccordionSlider() {
  const [a, setA] = useState(0);
  const [hover, setHover] = useState(false);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.3 });
  useEffect(() => {
    if (hover || !inView) return;
    const h = setInterval(() => setA((x) => (x + 1) % PANELS.length), 3200);
    return () => clearInterval(h);
  }, [hover, inView]);
  return (
    <Asset title="Accordion Slider" id="car.accordion" desc="Раскрывающиеся панели: hover/тап раскрывает, flex-grow с пружиной, контент проявляется со сдвигом; автоплей в простое." className="lg:col-span-2">
      <div ref={wrapRef} className="flex gap-2 h-[270px]" onMouseLeave={() => setHover(false)}>
        {PANELS.map((p, i) => {
          const on = a === i;
          return (
            <button key={p.t} onMouseEnter={() => { setHover(true); if (!on) { setA(i); sfx.tick(); } }} onClick={() => { setA(i); sfx.tap(); }}
              className="relative rounded-3xl overflow-hidden text-left min-w-0 transition-[flex-grow] duration-600 ease-[cubic-bezier(.3,1.2,.5,1)]"
              style={{ flexGrow: on ? 5 : 1, flexBasis: 0, background: `linear-gradient(170deg, ${p.a}, ${p.b})`, boxShadow: `0 6px 0 ${p.b}, inset 0 2px 0 rgba(255,255,255,.25)` }}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
              <div className={cn("absolute left-1/2 bottom-5 -translate-x-1/2 transition-all duration-300 whitespace-nowrap", on ? "opacity-0" : "opacity-100")}>
                <span className="block text-white font-extrabold text-[14px] tracking-wider [writing-mode:vertical-rl] rotate-180">{p.t}</span>
              </div>
              <div className={cn("absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500", on && "left-5 translate-x-0 scale-125 origin-left")}><Glyph name={p.g} size={34} /></div>
              <div className={cn("absolute bottom-5 left-5 right-5 text-white transition-all duration-500", on ? "opacity-100 translate-y-0 delay-200" : "opacity-0 translate-y-6")}>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-black/25 rounded-full px-2 py-0.5">{p.stat}</span>
                <div className="font-extrabold text-[24px] mt-2 drop-shadow">{p.t}</div>
                <div className="text-[12.5px] font-semibold text-white/85 max-w-[260px] leading-snug">{p.d}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3"><Dots n={PANELS.length} i={a} onPick={setA} /></div>
    </Asset>
  );
}

/* =========================================================
   13. DEPTH PARALLAX SLIDER (layers move at different rates)
   ========================================================= */
const DEPTH: { t: string; s: string; mood: Mood; g: G; bg: string; accent: string }[] = [
  { t: "Учись", s: "5 минут в день — и рынок перестаёт быть казино.", mood: "idle", g: "rocket", bg: "from-[#1d3a8a] to-[#070d1f]", accent: "#3d7bff" },
  { t: "Практикуй", s: "$10 000 демо-баланса. Ошибайся без последствий.", mood: "worried", g: "bolt", bg: "from-[#6e4500] to-[#070d1f]", accent: "#ffc53d" },
  { t: "Побеждай", s: "Лиги, серии и сундуки за дисциплину.", mood: "cheer", g: "crown", bg: "from-[#0a6b48] to-[#070d1f]", accent: "#1fdb8b" },
];
function DepthSlider() {
  const N = DEPTH.length;
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const [t, setT] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const [wrapRef, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.4 });
  const go = (n: number) => { setI(wrap(n, 0, N)); setT(0); sfx.whoosh(); haptic(6); };
  const ref = useDrag<HTMLDivElement>({
    onMove: (d) => setDx(d.dx),
    onEnd: (d) => { const w = box.current?.clientWidth ?? 400; setDx(0); if (d.dx < -w * 0.2 || d.vx < -0.5) go(i + 1); else if (d.dx > w * 0.2 || d.vx > 0.5) go(i - 1); },
  }, "x");
  useRafLoop((dt) => { if (dx) return; setT((v) => { const n = v + dt / 4.5; if (n >= 1) { setI((x) => wrap(x + 1, 0, N)); return 0; } return n; }); }, inView);
  const w = box.current?.clientWidth ?? 400;
  return (
    <Asset title="Depth Parallax Slider" id="car.depth" desc="Онбординг-слайдер с глубиной: при свайпе фон, маскот и текст едут с разной скоростью (0.3× / 0.7× / 1.3×). Автоплей с прогрессом." className="lg:col-span-3">
      <div ref={wrapRef}>
        <div ref={box} className="relative h-[300px] rounded-[28px] overflow-hidden select-none">
          <div ref={ref} className="absolute inset-0 cursor-grab active:cursor-grabbing">
            {DEPTH.map((s, k) => {
              let off = k - i;
              if (off > N / 2) off -= N;
              if (off < -N / 2) off += N;
              const base = off * w + dx;
              const tr = dx ? "none" : "transform .7s cubic-bezier(.3,1.1,.4,1)";
              return (
                <div key={s.t} className="absolute inset-0 overflow-hidden" style={{ transform: `translateX(${base}px)`, transition: tr }}>
                  <div className={cn("absolute inset-[-20%] bg-gradient-to-br", s.bg)} style={{ transform: `translateX(${-base * 0.7}px)`, transition: tr }}>
                    <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.4) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
                    <div className="absolute right-[25%] top-[20%] size-64 rounded-full blur-3xl" style={{ background: s.accent, opacity: 0.25 }} />
                  </div>
                  <div className="absolute right-[6%] bottom-0" style={{ transform: `translateX(${-base * 0.3}px)`, transition: tr }}>
                    <Mascot mood={s.mood} size={230} bg={false} />
                  </div>
                  <div className="absolute right-[40%] top-[14%]" style={{ transform: `translateX(${base * 0.35}px)`, transition: tr }}><div className="anim-float"><Glyph name={s.g} size={54} /></div></div>
                  <div className="absolute left-[7%] top-1/2 -translate-y-1/2 max-w-[46%]" style={{ transform: `translate(${base * 0.3}px, -50%)`, transition: tr }}>
                    <div className="label-caps !mb-2" style={{ color: s.accent }}>Шаг {k + 1} из {N}</div>
                    <div className="text-[36px] sm:text-[48px] font-extrabold leading-none tracking-tight">{s.t}</div>
                    <div className="text-[13.5px] text-white/80 font-semibold mt-3 leading-snug">{s.s}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-4 left-[7%] flex gap-1.5 z-10">
            {DEPTH.map((s, k) => (
              <button key={s.t} onClick={() => go(k)} className="h-1.5 w-12 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${k < i ? 100 : k === i ? t * 100 : 0}%`, background: s.accent }} />
              </button>
            ))}
          </div>
          <div className="absolute bottom-3 right-4 z-10"><Arrows onPrev={() => go(i - 1)} onNext={() => go(i + 1)} /></div>
        </div>
      </div>
    </Asset>
  );
}

export default function Carousels() {
  return (
    <Section id="carousels" index="09" title="Carousels" subtitle="13 видов каруселей: snap, infinite, 3D coverflow, deck, stories, marquee, vertical feed, center-mode, cube, gallery, orbit, accordion, depth parallax" count={13}>
      <div className="grid lg:grid-cols-3 gap-6">
        <SnapCarousel />
        <Stories />
        <InfiniteCarousel />
        <Coverflow />
        <TipDeck />
        <VelocityMarquee />
        <VerticalFeed />
        <CenterMode />
        <Cube />
        <PatternGallery />
        <Orbit />
        <AccordionSlider />
        <DepthSlider />
      </div>
    </Section>
  );
}
