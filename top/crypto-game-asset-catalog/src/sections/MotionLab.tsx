import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Archive, Pin, Trash2, RefreshCw, ChevronLeft, ChevronRight, Sparkles, MousePointer2 } from "lucide-react";
import { Asset, Section, Chip } from "../kit/ui";
import { GemIcon, TrophyIcon, ShieldIcon, FlameIcon, StarIcon, CoinIcon, TargetIcon, BoltIcon } from "../kit/GameIcons";
import { LogoMark } from "../kit/Brand";
import { useInView, useViewportProgress, useScrollVelocity, useTilt, useCountUp, clamp } from "../kit/motion";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";
import heroArt from "../assets/hero-arena.jpg";
import terrain from "../assets/terrain.jpg";
import duel from "../assets/arena-duel.jpg";
import vault from "../assets/vault.jpg";
import plate from "../assets/plate.jpg";

/* ---------------- M-01 STACKED DECK CAROUSEL ---------------- */
const tiers = [
  { n: "Bronze", c: "#e39a62", d: "#8a4a22", I: ShieldIcon, xp: "0+" },
  { n: "Silver", c: "#d6e1ff", d: "#6f82ad", I: StarIcon, xp: "500+" },
  { n: "Gold", c: "#ffd76b", d: "#b87708", I: CoinIcon, xp: "1.5k+" },
  { n: "Diamond", c: "#8ff3ff", d: "#1395b8", I: GemIcon, xp: "4k+" },
  { n: "Obsidian", c: "#c3a6ff", d: "#5a33c7", I: TrophyIcon, xp: "10k+" },
];
function StackDeck() {
  const [order, setOrder] = useState(tiers.map((_, i) => i));
  const [d, setD] = useState({ x: 0, y: 0 });
  const [leaving, setLeaving] = useState(false);
  const st = useRef<{ x: number; y: number } | null>(null);
  const cycle = (dir = 1) => {
    setLeaving(true);
    setD({ x: dir * 380, y: -40 });
    sfxRaw.swipe();
    setTimeout(() => { setOrder((o) => [...o.slice(1), o[0]]); setD({ x: 0, y: 0 }); setLeaving(false); }, 260);
  };
  return (
    <Asset code="MO-01" title="Stacked Deck Carousel" desc="Колода с веером: свайп в любую сторону отправляет верхнюю карту назад. Глубина, наклон, пружина." hint="Свайпни верхнюю карту" specs={["fan stack", "any-dir swipe", "loop"]}>
      <div className="relative mx-auto h-64 w-full max-w-[230px]">
        {order.slice(0, 4).reverse().map((ti, rk, arr) => {
          const depth = arr.length - 1 - rk;
          const t = tiers[ti];
          const top = depth === 0;
          return (
            <div
              key={ti}
              className="absolute inset-0 touch-none select-none"
              style={{ transform: top ? `translate(${d.x}px,${d.y}px) rotate(${d.x / 14}deg)` : `translateY(${depth * -12}px) rotate(${depth * (depth % 2 ? 5 : -5)}deg) scale(${1 - depth * 0.06})`, transition: st.current && top ? "none" : "transform .45s cubic-bezier(.3,1.3,.5,1)", zIndex: 10 - depth, opacity: top && leaving ? 0.4 : 1 }}
              onPointerDown={top ? (e) => { st.current = { x: e.clientX, y: e.clientY }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } : undefined}
              onPointerMove={top ? (e) => { if (st.current) setD({ x: e.clientX - st.current.x, y: e.clientY - st.current.y }); } : undefined}
              onPointerUp={top ? () => { st.current = null; if (Math.hypot(d.x, d.y) > 90) cycle(Math.sign(d.x) || 1); else setD({ x: 0, y: 0 }); } : undefined}
            >
              <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[28px] border border-white/15 shadow-[0_10px_0_#060b18,0_30px_40px_-10px_rgba(0,0,0,.7)]" style={{ background: `linear-gradient(160deg, ${t.c}, ${t.d})` }}>
                <div className="absolute inset-0 opacity-25" style={{ background: "repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,.12) 12px 14px)" }} />
                <t.I size={84} className="relative drop-shadow-[0_8px_12px_rgba(0,0,0,.4)]" />
                <div className="font-display relative mt-3 text-2xl font-black text-ink-900">{t.n}</div>
                <div className="num relative text-[11px] font-extrabold text-ink-900/70">{t.xp} XP</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        {tiers.map((t, i) => <span key={t.n} className="h-2 rounded-full transition-all" style={{ width: order[0] === i ? 22 : 8, background: order[0] === i ? t.c : "#273f75" }} />)}
      </div>
    </Asset>
  );
}

/* ---------------- M-02 3D RING CAROUSEL ---------------- */
const ringItems = [FlameIcon, GemIcon, TrophyIcon, ShieldIcon, StarIcon, CoinIcon, TargetIcon, BoltIcon];
const ringNames = ["Streak", "Gems", "Trophy", "Shield", "Star", "Coins", "Target", "Energy"];
function Ring3D() {
  const [rot, setRot] = useState(0);
  const [drag, setDrag] = useState<{ x: number; r: number } | null>(null);
  const [idle, setIdle] = useState(true);
  const N = ringItems.length, step = 360 / N;
  useEffect(() => {
    if (!idle || drag) return;
    let raf = 0;
    const f = () => { setRot((r) => r - 0.18); raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [idle, drag]);
  const active = ((Math.round(-rot / step) % N) + N) % N;
  return (
    <Asset code="MO-02" title="3D Ring Carousel" desc="Кольцо из 8 наград в 3D. Автовращение, перетаскивание, доводка к ближайшей карточке." hint="Крути кольцо" specs={["preserve-3d", "auto-rotate", "snap"]}>
      <div
        className="relative h-56 touch-pan-y select-none [perspective:800px]"
        onPointerDown={(e) => { setDrag({ x: e.clientX, r: rot }); setIdle(false); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (drag) setRot(drag.r + (e.clientX - drag.x) * 0.4); }}
        onPointerUp={() => { setDrag(null); setRot((r) => Math.round(r / step) * step); sfxRaw.pop(); setTimeout(() => setIdle(true), 2500); }}
      >
        <div className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]" style={{ transform: `rotateX(-8deg) rotateY(${rot}deg)`, transition: drag || idle ? "none" : "transform .6s cubic-bezier(.3,1.3,.5,1)" }}>
          {ringItems.map((I, i) => (
            <div key={i} className="absolute -left-12 -top-16 grid h-32 w-24 place-items-center rounded-2xl border border-white/10 bg-gradient-to-b from-ink-600/95 to-ink-800/95 [backface-visibility:hidden]" style={{ transform: `rotateY(${i * step}deg) translateZ(150px)`, boxShadow: i === active ? "0 0 30px rgba(255,197,61,.45)" : "0 8px 20px rgba(0,0,0,.5)" }}>
              <I size={48} />
              <span className="text-[10px] font-extrabold uppercase text-mist">{ringNames[i]}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-10 bottom-2 h-6 rounded-[50%] bg-black/40 blur-md" />
      </div>
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => { setIdle(false); setRot((r) => Math.round(r / step) * step + step); sfxRaw.pop(); }} className="grid h-9 w-9 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a]"><ChevronLeft size={16} /></button>
        <Chip tone="gold">{ringNames[active]}</Chip>
        <button onClick={() => { setIdle(false); setRot((r) => Math.round(r / step) * step - step); sfxRaw.pop(); }} className="grid h-9 w-9 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a]"><ChevronRight size={16} /></button>
      </div>
    </Asset>
  );
}

/* ---------------- M-03 PARALLAX IMAGE CAROUSEL ---------------- */
const courses = [
  { img: heroArt, t: "Trading Canyon", s: "Основы рынка · 12 уроков", c: "#22d39a" },
  { img: terrain, t: "Chart Ranges", s: "Свечной анализ · 18 уроков", c: "#ffc53d" },
  { img: duel, t: "Duel Arena", s: "PvP-практика · бесконечно", c: "#ff4f6d" },
  { img: vault, t: "Reward Vault", s: "Риск и капитал · 9 уроков", c: "#8b5cff" },
];
function ParallaxCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [sc, setSc] = useState({ l: 0, w: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => setSc({ l: el.scrollLeft, w: el.clientWidth });
    on();
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  const CW = sc.w * 0.78;
  return (
    <Asset code="MO-03" title="Parallax Image Carousel" desc="Нативный свайп со snap. Картинка внутри карточки едет медленнее рамки — глубина при каждом движении." hint="Свайпай курсы" specs={["inner parallax", "scroll-snap", "art-driven"]} className="md:col-span-2 xl:col-span-1">
      <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {courses.map((c, i) => {
          const off = (i * (CW + 12) - sc.l) / CW;
          return (
            <div key={c.t} className="relative h-72 shrink-0 snap-center overflow-hidden rounded-[26px] shadow-[0_8px_0_#08112a]" style={{ width: "78%" }}>
              <img src={c.img} alt="" className="absolute inset-y-0 h-full w-[150%] max-w-none object-cover" style={{ left: "-25%", transform: `translateX(${off * -22}%) scale(1.05)` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute inset-x-4 bottom-4" style={{ transform: `translateX(${off * 30}px)`, opacity: 1 - Math.min(1, Math.abs(off)) * 0.6 }}>
                <span className="rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase text-ink-900" style={{ background: c.c }}>Course {i + 1}</span>
                <div className="font-display mt-1.5 text-xl font-extrabold">{c.t}</div>
                <div className="text-[11px] text-snow/75">{c.s}</div>
              </div>
            </div>
          );
        })}
        <div className="w-4 shrink-0" />
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {courses.map((c, i) => { const a = Math.round(sc.l / (CW + 12)) === i; return <button key={c.t} onClick={() => ref.current?.scrollTo({ left: i * (CW + 12), behavior: "smooth" })} className="h-2 rounded-full transition-all" style={{ width: a ? 22 : 8, background: a ? c.c : "#273f75" }} />; })}
      </div>
    </Asset>
  );
}

/* ---------------- M-04 INFINITE DRAGGABLE MARQUEE ---------------- */
const tape = ["BTC +2.1%", "ETH −0.8%", "SOL +5.3%", "TON +1.0%", "DOGE −3.4%", "XRP +0.6%", "AVAX +2.9%", "LINK −1.1%"];
function Marquee() {
  const vel = useScrollVelocity();
  const [x, setX] = useState(0);
  const drag = useRef<{ px: number; last: number; v: number } | null>(null);
  const inertia = useRef(0);
  const W = 900;
  useEffect(() => {
    let raf = 0;
    const f = () => {
      if (!drag.current) {
        inertia.current *= 0.95;
        setX((v) => (((v - 0.7 - vel * 0.6 + inertia.current) % W) + W) % W - W);
      }
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [vel]);
  const skew = clamp(vel * 0.9, -14, 14);
  const row = (rev: boolean) => (
    <div className="flex w-max gap-3 whitespace-nowrap" style={{ transform: `translateX(${rev ? -W - x : x}px) skewX(${rev ? skew : -skew}deg)` }}>
      {[...tape, ...tape, ...tape, ...tape].map((t, i) => (
        <span key={i} className={cn("num rounded-2xl border px-4 py-2 text-sm font-extrabold", t.includes("−") ? "border-bear/40 bg-bear/10 text-bear" : "border-bull/40 bg-bull/10 text-bull")}>{t}</span>
      ))}
    </div>
  );
  return (
    <Asset code="MO-04" title="Infinite Marquee · Drag + Scroll" desc="Бесконечная лента: тащи и бросай с инерцией. Скорость и наклон реагируют на прокрутку страницы." hint="Тащи ленту и скролль страницу" specs={["inertia", "scroll velocity", "skew"]} className="md:col-span-2 xl:col-span-2">
      <div
        className="cursor-grab touch-pan-y select-none space-y-3 overflow-hidden rounded-2xl bg-ink-900/60 py-5 active:cursor-grabbing"
        onPointerDown={(e) => { drag.current = { px: e.clientX, last: e.clientX, v: 0 }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.last; d.v = dx; d.last = e.clientX; setX((v) => (((v + dx) % W) + W) % W - W); }}
        onPointerUp={() => { if (drag.current) inertia.current = drag.current.v * 0.9; drag.current = null; }}
      >
        {row(false)}
        {row(true)}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px]">
        <span className="text-mist">Scroll velocity</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-950"><div className="absolute top-0 h-full rounded-full bg-gold transition-all" style={{ left: "50%", width: `${Math.min(50, Math.abs(vel) * 2)}%`, transform: vel < 0 ? "translateX(-100%)" : undefined }} /></div>
        <span className="num w-12 text-right font-extrabold text-gold">{vel.toFixed(1)}</span>
      </div>
    </Asset>
  );
}

/* ---------------- M-05 HOLOGRAPHIC TILT CARD ---------------- */
function HoloCard() {
  const { t, bind } = useTilt(16);
  return (
    <Asset code="MO-05" title="Holographic Tilt Card" desc="Коллекционная карта: 3D-наклон за курсором, блик, голографическая плёнка и параллакс слоёв." hint="Води по карте" specs={["pointer tilt", "glare", "layer depth"]}>
      <div className="grid place-items-center py-2 [perspective:900px]">
        <div {...bind} className="relative h-80 w-56 cursor-pointer [transform-style:preserve-3d]" style={{ transform: `rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.on ? 1.04 : 1})`, transition: t.on ? "transform .08s" : "transform .6s cubic-bezier(.3,1.4,.5,1)" }} onClick={() => sfx.coin()}>
          <div className="absolute inset-0 overflow-hidden rounded-[26px] border-2 border-gold/60 shadow-[0_20px_40px_rgba(0,0,0,.6)]">
            <img src={vault} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover" style={{ transform: `translate(${-t.ry * 0.8}px, ${t.rx * 0.8}px) scale(1.25)` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
            <div className="absolute inset-0 mix-blend-color-dodge" style={{ opacity: t.on ? 0.55 : 0.15, background: "linear-gradient(115deg, transparent 20%, #ff4f6d 35%, #ffc53d 45%, #22d39a 55%, #3b82ff 65%, #8b5cff 75%, transparent 90%)", backgroundSize: "200% 200%", backgroundPosition: `${t.mx}% ${t.my}%`, transition: "opacity .3s" }} />
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at ${t.mx}% ${t.my}%, rgba(255,255,255,.35), transparent 45%)`, opacity: t.on ? 1 : 0, transition: "opacity .3s" }} />
          </div>
          <div className="absolute left-4 top-4 [transform:translateZ(40px)]"><span className="rounded-lg bg-gold px-2 py-0.5 text-[10px] font-black text-ink-900">LEGENDARY</span></div>
          <div className="absolute inset-x-0 top-20 grid place-items-center [transform:translateZ(70px)]"><TrophyIcon size={96} className="drop-shadow-[0_14px_20px_rgba(0,0,0,.6)]" /></div>
          <div className="absolute inset-x-4 bottom-4 [transform:translateZ(50px)]">
            <div className="font-display text-lg font-black">Diamond Hands</div>
            <div className="text-[11px] text-snow/75">Держал позицию 30 дней</div>
            <div className="num mt-1 text-[10px] text-gold">#0042 / 1000</div>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ---------------- M-06 LAYERED SCROLL PARALLAX SCENE ---------------- */
function ParallaxScene() {
  const ref = useRef<HTMLDivElement>(null);
  const [y, setY] = useState(0);
  const [max, setMax] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => { setY(el.scrollTop); setMax(el.scrollHeight - el.clientHeight); };
    on();
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, []);
  const p = y / Math.max(1, max);
  return (
    <Asset code="MO-06" title="Layered Scroll Parallax" desc="Четыре слоя движутся с разной скоростью при прокрутке: небо, горы, свечи, передний план. Заголовок растворяется." hint="Скролль внутри сцены" specs={["4 layers", "scroll-linked", "fade title"]}>
      <div className="relative h-80 overflow-hidden rounded-2xl">
        <div className="pointer-events-none absolute inset-0">
          <img src={terrain} alt="" className="absolute inset-0 h-[140%] w-full object-cover" style={{ transform: `translateY(${-y * 0.15}px) scale(${1.1 + p * 0.1})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/30 via-transparent to-ink-950" />
          <div className="absolute inset-x-0 top-16 text-center" style={{ transform: `translateY(${y * 0.5}px)`, opacity: 1 - p * 2.2 }}>
            <LogoMark size={48} variant="bevel" className="mx-auto" />
            <div className="font-display mt-2 text-2xl font-black">Chart Ranges</div>
            <div className="text-[11px] text-snow/70">Unit 2 · scroll ↓</div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-40 items-end justify-around px-4" style={{ transform: `translateY(${120 - y * 0.55}px)` }}>
            {[50, 80, 60, 110, 90, 130, 100].map((h, i) => (
              <div key={i} className="relative w-6" style={{ height: h }}>
                <div className="absolute -top-3 -bottom-3 left-1/2 w-0.5 -translate-x-1/2" style={{ background: i % 3 === 2 ? "#ff4f6d" : "#22d39a" }} />
                <div className="relative h-full rounded-md shadow-[inset_0_2px_0_rgba(255,255,255,.35)]" style={{ background: i % 3 === 2 ? "#ff4f6d" : "#22d39a", boxShadow: `0 0 20px ${i % 3 === 2 ? "#ff4f6d66" : "#22d39a66"}` }} />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950 to-transparent" style={{ transform: `translateY(${60 - y * 0.8}px)` }} />
          <div className="absolute inset-x-6 bottom-6 flex justify-between" style={{ transform: `translateY(${180 - y * 1.1}px)`, opacity: clamp(p * 2 - 0.3, 0, 1) }}>
            <span className="rounded-2xl bg-ink-800/90 px-3 py-2 text-[12px] font-extrabold backdrop-blur">18 уроков</span>
            <span className="rounded-2xl bg-bull px-3 py-2 text-[12px] font-extrabold text-ink-900">Start ▶</span>
          </div>
        </div>
        <div ref={ref} className="no-scrollbar absolute inset-0 overflow-y-auto"><div style={{ height: 820 }} /></div>
        <div className="pointer-events-none absolute right-2 top-2 bottom-2 w-1 rounded-full bg-white/10"><div className="w-full rounded-full bg-gold" style={{ height: `${p * 100}%` }} /></div>
      </div>
    </Asset>
  );
}

/* ---------------- M-07 PULL TO REFRESH ---------------- */
function PullRefresh() {
  const [pull, setPull] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([{ id: 1, t: "BTC закрыл неделю ростом", c: "#22d39a" }, { id: 2, t: "Новый урок: уровни Фибоначчи", c: "#ffc53d" }, { id: 3, t: "Mira обогнала тебя в лиге", c: "#ff4f6d" }]);
  const st = useRef<number | null>(null);
  const TH = 70;
  const fresh = ["ETH обновил месячный максимум", "Серия 7 дней! +50 XP", "Турнир выходного дня стартовал", "Дуэль: RexBear вызывает тебя"];
  const release = () => {
    st.current = null;
    if (pull >= TH) {
      setLoading(true); setPull(56); sfxRaw.pop();
      setTimeout(() => {
        setItems((it) => [{ id: Date.now(), t: fresh[it.length % fresh.length], c: ["#3b82ff", "#22d39a", "#8b5cff", "#ffc53d"][it.length % 4] }, ...it].slice(0, 6));
        setLoading(false); setPull(0); sfx.coin();
      }, 1100);
    } else setPull(0);
  };
  return (
    <Asset code="MO-07" title="Pull to Refresh" desc="Потяни ленту вниз: резиновое сопротивление, свечной лоадер крутится по мере натяжения, новая карточка въезжает сверху." hint="Тяни ленту вниз" specs={["rubber band", "threshold 70", "insert anim"]}>
      <div className="relative h-80 overflow-hidden rounded-[28px] border border-white/10 bg-ink-900">
        <div className="absolute inset-x-0 top-0 grid place-items-center" style={{ height: pull, opacity: clamp(pull / TH, 0, 1) }}>
          <div className="flex items-end gap-1" style={{ transform: `rotate(${loading ? 0 : pull * 3}deg)` }}>
            {[0, 1, 2].map((i) => <span key={i} className="block w-2 origin-bottom rounded-sm" style={{ height: 18, background: i === 1 ? "#ff4f6d" : "#22d39a", animation: loading ? `candle-load .8s ${i * 0.12}s ease-in-out infinite` : undefined, transform: loading ? undefined : `scaleY(${clamp(pull / TH, 0.2, 1)})` }} />)}
          </div>
          {!loading && <span className="absolute bottom-1 text-[9px] font-extrabold uppercase text-mist">{pull >= TH ? "release" : "pull"}</span>}
        </div>
        <div
          className="h-full touch-none select-none space-y-2 p-3"
          style={{ transform: `translateY(${pull}px)`, transition: st.current !== null ? "none" : "transform .45s cubic-bezier(.3,1.3,.5,1)" }}
          onPointerDown={(e) => { if (loading) return; st.current = e.clientY; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (st.current === null) return; const d = Math.max(0, e.clientY - st.current); const r = d < TH ? d : TH + (d - TH) * 0.3; if (r >= TH && pull < TH) sfx.tick(); setPull(r); }}
          onPointerUp={release}
        >
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">Feed</div>
          {items.map((it, i) => (
            <div key={it.id} className={cn("flex items-center gap-3 rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#060b18]", i === 0 && "anim-slide-right")}>
              <span className="h-9 w-1.5 rounded-full" style={{ background: it.c }} />
              <span className="flex-1 text-[12px] font-bold">{it.t}</span>
              <span className="text-[10px] text-mist">now</span>
            </div>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* ---------------- M-08 SWIPE ACTIONS LIST ---------------- */
function SwipeRow({ t, sub, onRemove }: { t: string; sub: string; onRemove: (kind: "delete" | "archive") => void }) {
  const [x, setX] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [gone, setGone] = useState(false);
  const st = useRef<number | null>(null);
  const end = () => {
    st.current = null;
    if (x < -200) { setX(-500); setGone(true); sfxRaw.thud(); setTimeout(() => onRemove("delete"), 300); }
    else if (x < -60) setX(-136);
    else if (x > 70) { setPinned((p) => !p); setX(0); sfx.toggle(!pinned); }
    else setX(0);
  };
  return (
    <div className="grid transition-all duration-300" style={{ gridTemplateRows: gone ? "0fr" : "1fr", opacity: gone ? 0 : 1 }}>
      <div className="overflow-hidden">
        <div className="relative mb-2 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 flex items-center justify-between">
            <div className="flex h-full items-center bg-gold px-5 text-ink-900" style={{ opacity: clamp(x / 70, 0, 1) }}><Pin size={18} /></div>
            <div className="flex h-full">
              <button onClick={() => { setGone(true); setTimeout(() => onRemove("archive"), 300); sfxRaw.pop(); }} className="grid h-full w-[68px] place-items-center bg-sky"><Archive size={18} /></button>
              <button onClick={() => { setGone(true); setTimeout(() => onRemove("delete"), 300); sfxRaw.thud(); }} className="grid h-full place-items-center bg-bear transition-all" style={{ width: Math.max(68, -x - 68) }}><Trash2 size={18} /></button>
            </div>
          </div>
          <div
            className="relative flex touch-pan-y items-center gap-3 bg-ink-700 p-3"
            style={{ transform: `translateX(${x}px)`, transition: st.current !== null ? "none" : "transform .35s cubic-bezier(.3,1.3,.5,1)" }}
            onPointerDown={(e) => { st.current = e.clientX - x; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (st.current !== null) setX(clamp(e.clientX - st.current, -320, 110)); }}
            onPointerUp={end}
          >
            {pinned && <Pin size={13} className="anim-pop text-gold" />}
            <div className="min-w-0 flex-1"><div className="truncate text-[13px] font-extrabold">{t}</div><div className="truncate text-[11px] text-mist">{sub}</div></div>
            <span className="text-[10px] text-mist">⇠ swipe</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function SwipeList() {
  const seed = [{ id: 1, t: "Alert: BTC > $70k", s: "Price alert · 2m" }, { id: 2, t: "Lesson reminder", s: "Unit 3 ждёт тебя" }, { id: 3, t: "Duel invite · RexBear", s: "Истекает через 1 ч" }, { id: 4, t: "Weekly report", s: "+12.4% в симуляторе" }];
  const [list, setList] = useState(seed);
  const [log, setLog] = useState<string | null>(null);
  return (
    <Asset code="MO-08" title="Swipe Actions" desc="Свайп влево — Archive/Delete, полный свайп удаляет со схлопыванием; вправо — закрепить." hint="Свайпай строки в обе стороны" specs={["2-way", "full-swipe delete", "collapse"]}>
      <div className="min-h-[240px]">
        {list.map((r) => <SwipeRow key={r.id} t={r.t} sub={r.s} onRemove={(k) => { setList((l) => l.filter((x) => x.id !== r.id)); setLog(`${k === "delete" ? "Deleted" : "Archived"}: ${r.t}`); }} />)}
        {!list.length && <div className="anim-pop py-10 text-center text-[12px] text-mist">Inbox zero ✨</div>}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span key={log} className="anim-fade truncate text-mist">{log ?? "—"}</span>
        <button onClick={() => { setList(seed); setLog(null); }} className="font-bold text-sky">Restore</button>
      </div>
    </Asset>
  );
}

/* ---------------- M-09 BOTTOM SHEET WITH SNAP POINTS ---------------- */
function BottomSheet() {
  const H = 340;
  const snaps = [H - 70, H * 0.45, 40];
  const [y, setY] = useState(snaps[0]);
  const [drag, setDrag] = useState<{ sy: number; y0: number; last: number; v: number } | null>(null);
  const settle = () => {
    if (!drag) return;
    const proj = y + drag.v * 8;
    const target = snaps.reduce((a, b) => (Math.abs(b - proj) < Math.abs(a - proj) ? b : a));
    setY(target); setDrag(null); sfxRaw.pop();
  };
  const open = 1 - (y - snaps[2]) / (snaps[0] - snaps[2]);
  return (
    <Asset code="MO-09" title="Bottom Sheet · 3 Snaps" desc="Шторка с тремя точками фиксации и учётом скорости броска. Фон темнеет и уходит вглубь." hint="Тяни шторку за ручку" specs={["velocity snap", "3 detents", "backdrop depth"]}>
      <div className="relative overflow-hidden rounded-[28px] border border-white/10" style={{ height: H }}>
        <div className="absolute inset-0 origin-top transition-transform" style={{ transform: `scale(${1 - open * 0.06})`, borderRadius: open * 20 }}>
          <img src={heroArt} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink-950" style={{ opacity: 0.25 + open * 0.5 }} />
          <div className="absolute left-4 top-4 font-display text-lg font-extrabold">BTC / USDT</div>
        </div>
        <div
          className="absolute inset-x-0 rounded-t-[26px] border-t border-white/10 bg-ink-800 shadow-[0_-10px_30px_rgba(0,0,0,.5)]"
          style={{ top: y, height: H, transition: drag ? "none" : "top .45s cubic-bezier(.3,1.25,.5,1)" }}
        >
          <div
            className="touch-none cursor-grab px-4 pb-2 pt-3 active:cursor-grabbing"
            onPointerDown={(e) => { setDrag({ sy: e.clientY, y0: y, last: e.clientY, v: 0 }); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
            onPointerMove={(e) => { if (!drag) return; const v = e.clientY - drag.last; setDrag({ ...drag, last: e.clientY, v }); setY(clamp(drag.y0 + e.clientY - drag.sy, 20, H - 50)); }}
            onPointerUp={settle}
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-ink-500" />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-base font-extrabold">Place order</span>
              <span className="num text-[10px] text-mist">{Math.round(open * 100)}%</span>
            </div>
          </div>
          <div className="space-y-2 px-4">
            {[["Side", "Long"], ["Size", "0.015 BTC"], ["Leverage", "5x"], ["Stop-loss", "62,720"], ["Take-profit", "68,400"]].map(([a, b]) => (
              <div key={a} className="flex justify-between rounded-xl bg-ink-700 px-3 py-2.5 text-[12px]"><span className="text-mist">{a}</span><span className="num font-bold">{b}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Peek", "Half", "Full"].map((n, i) => <button key={n} onClick={() => { setY(snaps[i]); sfxRaw.pop(); }} className={cn("h-9 rounded-xl text-[10px] font-extrabold uppercase", y === snaps[i] ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist")}>{n}</button>)}
      </div>
    </Asset>
  );
}

/* ---------------- M-10 DUAL-THUMB RANGE WITH HISTOGRAM ---------------- */
function DualRange() {
  const bars = useMemo(() => [...Array(40)].map((_, i) => 0.15 + Math.exp(-Math.pow((i - 22) / 8, 2)) * 0.85 + ((i * 17) % 7) / 40), []);
  const [lo, setLo] = useState(12);
  const [hi, setHi] = useState(30);
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"lo" | "hi" | null>(null);
  const set = (cx: number) => {
    const r = track.current!.getBoundingClientRect();
    const v = clamp(Math.round(((cx - r.left) / r.width) * 39), 0, 39);
    if (drag === "lo" && v < hi) { if (v !== lo) sfx.tick(); setLo(v); }
    if (drag === "hi" && v > lo) { if (v !== hi) sfx.tick(); setHi(v); }
  };
  const price = (i: number) => (58000 + i * 350).toLocaleString();
  const count = bars.slice(lo, hi + 1).reduce((a, b) => a + b, 0);
  return (
    <Asset code="MO-10" title="Dual Range + Histogram" desc="Диапазон цены двумя ползунками. Гистограмма объёма подсвечивается внутри выбранной зоны." hint="Тяни оба ползунка" specs={["2 thumbs", "histogram", "haptic ticks"]}>
      <div className="flex h-28 items-end gap-[2px]">
        {bars.map((b, i) => <div key={i} className="flex-1 rounded-t-sm transition-colors duration-200" style={{ height: `${b * 100}%`, background: i >= lo && i <= hi ? "linear-gradient(0deg,#2152c4,#3b82ff)" : "#1d3160" }} />)}
      </div>
      <div ref={track} className="relative mt-2 h-8 touch-none" onPointerMove={(e) => drag && set(e.clientX)} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
        <div className="panel-inset absolute inset-x-0 top-3 h-2 !rounded-full" />
        <div className="absolute top-3 h-2 rounded-full bg-sky shadow-[0_0_10px_#3b82ff]" style={{ left: `${(lo / 39) * 100}%`, width: `${((hi - lo) / 39) * 100}%` }} />
        {(["lo", "hi"] as const).map((k) => (
          <button key={k} onPointerDown={(e) => { setDrag(k); (e.currentTarget.parentElement as HTMLElement).setPointerCapture(e.pointerId); }} className={cn("absolute top-0 h-8 w-8 -translate-x-1/2 rounded-xl bg-gradient-to-b from-white to-[#d3ddff] shadow-[0_3px_0_#8ea3d6,0_6px_12px_rgba(0,0,0,.4)] transition-transform", drag === k && "scale-110")} style={{ left: `${((k === "lo" ? lo : hi) / 39) * 100}%` }} aria-label={k} />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="rounded-xl bg-ink-800 px-3 py-2"><div className="text-[9px] font-bold uppercase text-mist">From</div><div className="num text-sm font-extrabold">${price(lo)}</div></div>
        <Chip tone="sky">{Math.round((count / bars.reduce((a, b) => a + b, 0)) * 100)}% volume</Chip>
        <div className="rounded-xl bg-ink-800 px-3 py-2 text-right"><div className="text-[9px] font-bold uppercase text-mist">To</div><div className="num text-sm font-extrabold">${price(hi)}</div></div>
      </div>
    </Asset>
  );
}

/* ---------------- M-11 ROTARY KNOB ---------------- */
function Knob() {
  const [v, setV] = useState(35);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ang = -135 + (v / 100) * 270;
  const set = (cx: number, cy: number) => {
    const r = ref.current!.getBoundingClientRect();
    let a = (Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) * 180) / Math.PI + 90;
    if (a > 180) a -= 360;
    const nv = Math.round(clamp((a + 135) / 270, 0, 1) * 100);
    if (Math.floor(nv / 5) !== Math.floor(v / 5)) sfx.tick();
    setV(nv);
  };
  const col = v < 33 ? "#22d39a" : v < 66 ? "#ffc53d" : "#ff4f6d";
  return (
    <Asset code="MO-11" title="Rotary Risk Dial" desc="Круговой регулятор аппетита к риску: угол от центра, тики каждые 5%, цвет зоны меняется." hint="Крути диск" specs={["polar drag", "270° arc", "tick haptics"]}>
      <div className="grid place-items-center">
        <div
          ref={ref}
          className="relative h-52 w-52 touch-none select-none"
          onPointerDown={(e) => { setDrag(true); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); set(e.clientX, e.clientY); }}
          onPointerMove={(e) => drag && set(e.clientX, e.clientY)}
          onPointerUp={() => setDrag(false)}
        >
          <svg viewBox="0 0 200 200" className="absolute inset-0">
            {[...Array(28)].map((_, i) => {
              const a = ((-135 + (i / 27) * 270 - 90) * Math.PI) / 180;
              const on = i / 27 <= v / 100;
              return <line key={i} x1={100 + Math.cos(a) * 82} y1={100 + Math.sin(a) * 82} x2={100 + Math.cos(a) * 94} y2={100 + Math.sin(a) * 94} stroke={on ? col : "#273f75"} strokeWidth="4" strokeLinecap="round" style={{ transition: "stroke .15s" }} />;
            })}
          </svg>
          <div className={cn("absolute inset-8 rounded-full bg-gradient-to-b from-ink-500 to-ink-800 shadow-[inset_0_2px_0_rgba(255,255,255,.15),0_8px_0_#060b18,0_16px_24px_rgba(0,0,0,.5)] transition-transform", drag && "scale-95")} style={{ transform: `rotate(${ang}deg)` }}>
            <span className="absolute left-1/2 top-3 h-6 w-2 -translate-x-1/2 rounded-full" style={{ background: col, boxShadow: `0 0 10px ${col}` }} />
          </div>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center"><div className="num text-3xl font-black" style={{ color: col }}>{v}</div><div className="text-[9px] font-extrabold uppercase text-mist">risk appetite</div></div>
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold uppercase">
        {[["Guardian", "#22d39a", 0], ["Strategist", "#ffc53d", 33], ["Hunter", "#ff4f6d", 66]].map(([n, c, min]) => (
          <span key={n as string} className="rounded-lg py-1.5 transition" style={{ color: c as string, background: v >= (min as number) && v < (min as number) + 34 ? `${c}22` : "transparent" }}>{n as string}</span>
        ))}
      </div>
    </Asset>
  );
}

/* ---------------- M-12 SCROLL-DRAWN CHART + COUNT-UP ---------------- */
function ScrollDraw() {
  const [ref, p] = useViewportProgress<HTMLDivElement>("through");
  const [vref, inView] = useInView<HTMLDivElement>(0.4);
  const users = useCountUp(248000, inView, 1600);
  const lessons = useCountUp(12.4, inView, 1600);
  const acc = useCountUp(87, inView, 1600);
  const pts = useMemo(() => { const a: string[] = []; let y = 110; for (let i = 0; i <= 40; i++) { y += Math.sin(i * 0.8) * 5 - 2.2; a.push(`${i * 7.5},${clamp(y, 10, 130).toFixed(1)}`); } return a.join(" "); }, []);
  const draw = clamp((p - 0.15) / 0.5, 0, 1);
  return (
    <Asset code="MO-12" title="Scroll-driven Chart & Count-up" desc="Линия графика рисуется по мере прокрутки страницы, цифры считаются вверх при появлении в зоне видимости." hint="Прокрути страницу вверх-вниз" specs={["viewport progress", "stroke draw", "count-up"]}>
      <div ref={ref} className="panel-inset relative h-40 overflow-hidden !rounded-2xl">
        <svg viewBox="0 0 300 140" preserveAspectRatio="none" className="h-full w-full">
          <defs><linearGradient id="sd-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#22d39a" stopOpacity=".35" /><stop offset="1" stopColor="#22d39a" stopOpacity="0" /></linearGradient></defs>
          <polygon points={`0,140 ${pts} 300,140`} fill="url(#sd-fill)" style={{ clipPath: `inset(0 ${100 - draw * 100}% 0 0)` }} />
          <polyline points={pts} fill="none" stroke="#22d39a" strokeWidth="3" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        </svg>
        <span className="num absolute right-3 top-2 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-bold text-gold">{Math.round(draw * 100)}%</span>
      </div>
      <div ref={vref} className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-ink-800 py-3"><div className="num text-lg font-extrabold">{Math.round(users / 1000)}k</div><div className="text-[9px] font-bold uppercase text-mist">players</div></div>
        <div className="rounded-xl bg-ink-800 py-3"><div className="num text-lg font-extrabold text-gold">{lessons.toFixed(1)}M</div><div className="text-[9px] font-bold uppercase text-mist">lessons</div></div>
        <div className="rounded-xl bg-ink-800 py-3"><div className="num text-lg font-extrabold text-bull">{Math.round(acc)}%</div><div className="text-[9px] font-bold uppercase text-mist">accuracy</div></div>
      </div>
    </Asset>
  );
}

/* ---------------- M-13 MAGNETIC BUTTONS + RIPPLE ---------------- */
function Magnetic({ label, c, cd }: { label: string; c: string; cd: string }) {
  const [o, setO] = useState({ x: 0, y: 0 });
  const [rip, setRip] = useState<{ id: number; x: number; y: number }[]>([]);
  return (
    <div
      className="grid h-28 place-items-center"
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setO({ x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35 }); }}
      onPointerLeave={() => setO({ x: 0, y: 0 })}
    >
      <button
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const id = Date.now(); setRip((x) => [...x, { id, x: e.clientX - r.left, y: e.clientY - r.top }]); setTimeout(() => setRip((x) => x.filter((z) => z.id !== id)), 650); sfx.tap(); }}
        className="btn3d relative h-14 px-7 text-xs"
        style={{ ["--c" as string]: c, ["--cd" as string]: cd, transform: `translate(${o.x}px, ${o.y}px)`, transition: "transform .25s cubic-bezier(.3,1.5,.5,1)" } as CSSProperties}
      >
        <span style={{ transform: `translate(${o.x * 0.3}px, ${o.y * 0.3}px)`, display: "inline-flex", gap: 6, alignItems: "center" }}><MousePointer2 size={15} /> {label}</span>
        {rip.map((r) => <span key={r.id} className="pointer-events-none absolute rounded-full bg-white/50" style={{ left: r.x, top: r.y, width: 10, height: 10, transform: "translate(-50%,-50%)", animation: "pulse-ring .65s ease-out forwards" }} />)}
      </button>
    </div>
  );
}
function MagneticButtons() {
  return (
    <Asset code="MO-13" title="Magnetic Buttons + Ripple" desc="Кнопки притягиваются к курсору, текст двигается ещё глубже; клик разбегается волной от точки касания." hint="Подведи курсор к кнопке" specs={["magnet 35%", "inner parallax", "ripple"]}>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        <Magnetic label="Start lesson" c="var(--color-bull)" cd="var(--color-bull-d)" />
        <Magnetic label="Join duel" c="var(--color-bear)" cd="var(--color-bear-d)" />
        <Magnetic label="Open chest" c="var(--color-violet)" cd="var(--color-violet-d)" />
        <Magnetic label="Claim XP" c="var(--color-sky)" cd="var(--color-sky-d)" />
      </div>
    </Asset>
  );
}

/* ---------------- M-14 SWIPEABLE TABS ---------------- */
const tabData = [
  { n: "Today", c: "#3b82ff", body: ["Урок 4 · Уровни", "Дуэль с Mira", "Квест: 50 XP"] },
  { n: "Week", c: "#22d39a", body: ["+1 840 XP", "12 уроков", "Точность 87%"] },
  { n: "League", c: "#8b5cff", body: ["#2 в Diamond", "Отрыв 140 XP", "2 дня до конца"] },
  { n: "Goals", c: "#ffc53d", body: ["Серия 50 дней", "Obsidian лига", "Пройти Unit 5"] },
];
function SwipeTabs() {
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const st = useRef<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const go = (n: number) => { const x = clamp(n, 0, tabData.length - 1); if (x !== i) sfxRaw.swipe(); setI(x); };
  const w = box.current?.clientWidth ?? 300;
  const prog = i - dx / w;
  return (
    <Asset code="MO-14" title="Swipeable Tabs" desc="Индикатор вкладок следует за пальцем в реальном времени, контент листается свайпом с резинкой на краях." hint="Свайпай контент" specs={["finger-follow", "rubber edge", "shared indicator"]}>
      <div className="panel-inset relative grid grid-cols-4 p-1 !rounded-xl">
        <span className="absolute top-1 bottom-1 rounded-lg" style={{ left: `calc(${(clamp(prog, 0, 3) / 4) * 100}% + 4px)`, width: "calc(25% - 8px)", background: tabData[Math.round(clamp(prog, 0, 3))].c, transition: st.current !== null ? "none" : "left .35s cubic-bezier(.3,1.3,.5,1), background .3s", boxShadow: "0 3px 0 rgba(0,0,0,.35)" }} />
        {tabData.map((t, k) => <button key={t.n} onClick={() => go(k)} className={cn("relative z-10 h-9 text-[11px] font-extrabold transition-colors", i === k ? "text-white" : "text-mist")}>{t.n}</button>)}
      </div>
      <div
        ref={box}
        className="mt-3 touch-pan-y select-none overflow-hidden rounded-2xl"
        onPointerDown={(e) => { st.current = e.clientX; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (st.current === null) return; let d = e.clientX - st.current; if ((i === 0 && d > 0) || (i === tabData.length - 1 && d < 0)) d *= 0.3; setDx(d); }}
        onPointerUp={() => { st.current = null; if (dx < -60) go(i + 1); else if (dx > 60) go(i - 1); setDx(0); }}
      >
        <div className="flex" style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))`, transition: st.current !== null ? "none" : "transform .4s cubic-bezier(.3,1.2,.5,1)" }}>
          {tabData.map((t) => (
            <div key={t.n} className="w-full shrink-0 space-y-2 p-1">
              {t.body.map((b, k) => (
                <div key={b} className="flex items-center gap-3 rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#08112a]">
                  <span className="grid h-8 w-8 place-items-center rounded-xl text-[11px] font-black text-ink-900" style={{ background: t.c }}>{k + 1}</span>
                  <span className="text-[13px] font-bold">{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-mist"><Sparkles size={11} className="text-gold" /> работает мышью, пальцем и тапом по вкладке</div>
    </Asset>
  );
}

/* ---------------- M-15 MATERIAL BUTTON PRESS STUDY ---------------- */
function PressStudy() {
  const [depth, setDepth] = useState(6);
  const [pressed, setPressed] = useState(false);
  return (
    <Asset code="MO-15" title="Physical Press Study" desc="Глубина кнопки настраивается: видно, как тень-«грань» превращается в физическое нажатие." hint="Меняй глубину и жми" specs={["depth 2–12px", "hold state", "metal plate"]}>
      <div className="relative grid h-44 place-items-center overflow-hidden rounded-2xl">
        <img src={plate} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <button
          onPointerDown={() => { setPressed(true); sfxRaw.thud(); }}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          className="btn3d relative h-16 px-10 text-sm"
          data-pressed={pressed}
          style={{ ["--c" as string]: "var(--color-gold)", ["--cd" as string]: "var(--color-gold-d)", ["--depth" as string]: `${depth}px`, color: "#3b2600" } as CSSProperties}
        >
          Hold me
        </button>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[11px] font-bold"><span className="text-mist">Depth</span><span className="num text-gold">{depth}px</span></div>
        <input type="range" min={2} max={12} value={depth} onChange={(e) => { setDepth(+e.target.value); sfx.tick(); }} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${((depth - 2) / 10) * 100}%,#0b1530 0)` }} />
      </div>
      <div className="mt-2 flex gap-1.5"><Chip tone="gold">press 90ms</Chip><Chip tone="sky">translateY = depth</Chip><Chip tone="violet"><RefreshCw size={10} /> sheen</Chip></div>
    </Asset>
  );
}

export default function MotionLab() {
  return (
    <Section id="motion" index="M" title="Motion Lab · Carousels, Sliders, Parallax, Swipes, Scroll" subtitle="15 паттернов движения — каждый работает на игровом контенте, а не на заглушках">
      <StackDeck />
      <Ring3D />
      <ParallaxCarousel />
      <Marquee />
      <HoloCard />
      <ParallaxScene />
      <PullRefresh />
      <SwipeList />
      <BottomSheet />
      <DualRange />
      <Knob />
      <ScrollDraw />
      <MagneticButtons />
      <SwipeTabs />
      <PressStudy />
    </Section>
  );
}
