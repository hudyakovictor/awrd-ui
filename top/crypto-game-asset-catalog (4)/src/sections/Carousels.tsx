import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Label, Section, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useRaf, useSpring } from "../ui/hooks";
import { feel, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

const UNITS = [
  { t: "Crypto Basics", s: "12 уроков", i: "coin", g: ["#2ee59d", "#0b7a4d"], p: 100 },
  { t: "Candlesticks", s: "14 уроков", i: "candle", g: ["#3d8bff", "#1a3aa0"], p: 64 },
  { t: "Risk Control", s: "10 уроков", i: "shield", g: ["#ffc53d", "#a86d00"], p: 30 },
  { t: "Indicators", s: "18 уроков", i: "chart", g: ["#ff8a3d", "#a33a0d"], p: 0 },
  { t: "Futures", s: "16 уроков", i: "rocket", g: ["#ff4d6a", "#8c1530"], p: 0 },
  { t: "DeFi & Yield", s: "20 уроков", i: "gem", g: ["#a174ff", "#4a24a8"], p: 0 },
  { t: "On-chain", s: "12 уроков", i: "target", g: ["#5ce1ff", "#1579a8"], p: 0 },
  { t: "Psychology", s: "8 уроков", i: "heart", g: ["#ff7ab6", "#a3245f"], p: 0 },
];

/* ═════════ CAR-01 · Scroll-snap with inner parallax ═════════ */

function SnapCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [sl, setSl] = useState(0);
  const [w, setW] = useState(1);
  const items = UNITS.slice(0, 6);
  const cardW = w * 0.74 + 12;
  const idx = clamp(Math.round(sl / cardW), 0, items.length - 1);
  const prevIdx = useRef(idx);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useEffect(() => { if (idx !== prevIdx.current) { sfx.play("tick"); prevIdx.current = idx; } }, [idx]);
  const go = (i: number) => ref.current?.scrollTo({ left: clamp(i, 0, items.length - 1) * cardW, behavior: "smooth" });
  return (
    <AssetCard id="CAR-01" title="Snap Carousel · Parallax" desc="Нативный scroll-snap + параллакс контента внутри карточки, масштаб по расстоянию до центра, синхронные точки." tags={["carousel", "snap", "parallax", "swipe"]} stageClass="px-0 overflow-hidden">
      <div ref={ref} onScroll={(e) => setSl(e.currentTarget.scrollLeft)} className="no-scrollbar snap-x-strict flex gap-3 overflow-x-auto px-[13%] py-3">
        {items.map((u, i) => {
          const d = (i * cardW - sl) / cardW;
          const ad = Math.min(1, Math.abs(d));
          return (
            <div key={u.t} className="relative h-48 shrink-0 snap-center overflow-hidden rounded-3xl" style={{ width: "74%", transform: `scale(${1 - ad * 0.1})`, opacity: 1 - ad * 0.45, background: `linear-gradient(150deg, ${u.g[0]}, ${u.g[1]})`, boxShadow: `0 6px 0 ${u.g[1]}, inset 0 1px 0 #fff5` }}>
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15" style={{ transform: `translateX(${d * 60}px)` }} />
              <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10" style={{ transform: `translateX(${d * -40}px)` }} />
              <div className="absolute right-4 top-4" style={{ transform: `translateX(${d * 90}px) rotate(${d * 25}deg)` }}>
                <Icon name={u.i} size={64} variant="duo" className="text-white/90 drop-shadow-[0_6px_0_rgba(0,0,0,.2)]" />
              </div>
              <div className="absolute bottom-4 left-4 right-4" style={{ transform: `translateX(${d * 30}px)` }}>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Unit {i + 1}</div>
                <div className="text-xl font-extrabold text-white text-3d">{u.t}</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-white" style={{ width: `${u.p}%` }} /></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-4">
        <Btn v="dark" size="icon" onClick={() => go(idx - 1)} disabled={idx === 0}><Icon name="chevL" size={18} stroke={3} /></Btn>
        <div className="flex gap-1.5">
          {items.map((_, i) => {
            const d = Math.abs(i - sl / cardW);
            return <button key={i} onClick={() => go(i)} className="h-2.5 rounded-full bg-sky transition-[width]" style={{ width: 10 + Math.max(0, 1 - d) * 20, opacity: 0.3 + Math.max(0, 1 - d) * 0.7 }} />;
          })}
        </div>
        <Btn v="dark" size="icon" onClick={() => go(idx + 1)} disabled={idx === items.length - 1}><Icon name="chevR" size={18} stroke={3} /></Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-02 · Coverflow with momentum ═════════ */
function Coverflow() {
  const N = UNITS.length;
  const [target, setTarget] = useState(2);
  const [pos, api] = useSpring(target, 160, 22);
  const base = useRef(0);
  const last = useRef(2);
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => {
      const p = clamp(base.current - d.dx / 130, -0.4, N - 0.6);
      api.set(p);
      const r = Math.round(p);
      if (r !== last.current) { last.current = r; sfx.play("tick"); }
    },
    onEnd: (d) => {
      const t = clamp(Math.round(api.get() - d.vx * 0.35), 0, N - 1);
      if (Math.abs(d.dx) < 5) { api.release(); return; }
      setTarget(t);
      api.release(-d.vx * 0.1);
    },
  });
  const go = (i: number) => { const t = clamp(i, 0, N - 1); setTarget(t); feel("swipe", 6); };
  const active = clamp(Math.round(pos), 0, N - 1);
  return (
    <AssetCard id="CAR-02" title="Coverflow 3D · Momentum" desc="Перетаскивание с инерцией и пружинным доводчиком, 3D-поворот боковых карточек, отражение, тики звука при прохождении." tags={["carousel", "coverflow", "3d", "drag", "physics"]} stageClass="overflow-hidden">
      <div onPointerDown={onDown} className="relative h-56 cursor-grab touch-pan-y select-none active:cursor-grabbing" style={{ perspective: 900 }}
        tabIndex={0} onKeyDown={(e) => { if (e.key === "ArrowRight") go(target + 1); if (e.key === "ArrowLeft") go(target - 1); }}>
        {UNITS.map((u, i) => {
          const d = i - pos;
          const ad = Math.abs(d);
          if (ad > 3.5) return null;
          return (
            <div key={u.t} onClick={() => Math.abs(d) > 0.3 && go(i)} className="absolute left-1/2 top-4 h-40 w-32" style={{
              transform: `translateX(calc(-50% + ${d * 72 + Math.sign(d) * Math.min(ad, 1) * 30}px)) translateZ(${-Math.min(ad, 1) * 140 - ad * 20}px) rotateY(${clamp(-d * 55, -55, 55)}deg)`,
              zIndex: 100 - Math.round(ad * 10), transformStyle: "preserve-3d",
            }}>
              <div className="relative h-full w-full rounded-2xl p-3" style={{ background: `linear-gradient(160deg, ${u.g[0]}, ${u.g[1]})`, boxShadow: `0 5px 0 ${u.g[1]}, 0 20px 30px -10px #000`, filter: `brightness(${1 - Math.min(ad, 2) * 0.22})` }}>
                <Icon name={u.i} size={34} variant="duo" className="text-white" />
                <div className="absolute bottom-3 left-3 right-3 text-sm font-extrabold leading-tight text-white text-3d">{u.t}</div>
              </div>
              <div className="absolute left-0 right-0 top-full mt-1 h-12 rounded-2xl opacity-25" style={{ background: `linear-gradient(180deg, ${u.g[0]}, transparent)`, transform: "scaleY(-1)", maskImage: "linear-gradient(180deg, transparent, #000)" }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-center">
        <div key={active} className="anim-fade-up text-base font-extrabold text-white">{UNITS[active].t}</div>
        <div className="text-xs text-ink-400">{UNITS[active].s} · drag / ← →</div>
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-03 · 3D Ring carousel ═════════ */
const RING = [
  { t: "BTC", c: "#f7931a" }, { t: "ETH", c: "#8c8cff" }, { t: "SOL", c: "#14f195" }, { t: "TON", c: "#0098ea" },
  { t: "BNB", c: "#f3ba2f" }, { t: "XRP", c: "#9aa8c7" }, { t: "ADA", c: "#3468d1" }, { t: "DOGE", c: "#c2a633" },
];
function Ring() {
  const N = RING.length, step = 360 / N;
  const [target, setTarget] = useState(0);
  const [ang, api] = useSpring(target, 90, 18);
  const [hover, setHover] = useState(false);
  const base = useRef(0);
  const dragging = useRef(false);
  useInterval(() => { if (!hover && !dragging.current) setTarget((t) => t - step); }, 2600);
  const onDown = useDrag({
    onStart: () => { dragging.current = true; base.current = api.get(); api.set(base.current); },
    onMove: (d) => api.set(base.current + d.dx * 0.5),
    onEnd: (d) => {
      dragging.current = false;
      const t = Math.round((api.get() + d.vx * 4) / step) * step;
      setTarget(t);
      api.release(d.vx * 20);
    },
  });
  const front = ((Math.round(-ang / step) % N) + N) % N;
  const R = 150;
  return (
    <AssetCard id="CAR-03" title="3D Ring Carousel" desc="Цилиндрическая карусель: автопрокрутка, пауза при наведении, вращение перетаскиванием с инерцией, фронтальная плитка подсвечена." tags={["carousel", "3d", "ring", "autoplay"]} stageClass="overflow-hidden">
      <div onPointerDown={onDown} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="relative h-52 cursor-grab touch-pan-y select-none" style={{ perspective: 800 }}>
        <div className="absolute left-1/2 top-1/2 h-0 w-0 preserve-3d" style={{ transform: `translateZ(-${R}px) rotateX(-8deg) rotateY(${ang}deg)` }}>
          {RING.map((r, i) => {
            const isF = i === front;
            return (
              <div key={r.t} className="absolute -left-12 -top-14 grid h-28 w-24 place-items-center rounded-2xl backface-hidden transition-[filter,box-shadow]" style={{
                transform: `rotateY(${i * step}deg) translateZ(${R}px)`,
                background: `linear-gradient(160deg, ${r.c}, ${r.c}99 70%, #0a1330)`,
                boxShadow: isF ? `0 0 30px ${r.c}, 0 5px 0 #0008` : "0 5px 0 #0008",
                filter: isF ? "none" : "brightness(.55) saturate(.8)",
              }}>
                <div className="text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white/20 text-sm font-extrabold text-white">{r.t[0]}</div>
                  <div className="mt-2 font-mono text-sm font-extrabold text-white text-3d">{r.t}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-0 left-1/2 h-6 w-56 -translate-x-1/2 rounded-full bg-sky/20 blur-xl" />
      </div>
      <div className="flex items-center justify-between">
        <Btn v="dark" size="icon" onClick={() => setTarget((t) => t + step)}><Icon name="chevL" size={18} stroke={3} /></Btn>
        <div className="text-center"><div className="font-mono text-lg font-extrabold" style={{ color: RING[front].c }}>{RING[front].t}</div><div className="text-[10px] font-bold uppercase tracking-widest text-ink-400">{hover ? "paused" : "autoplay"}</div></div>
        <Btn v="dark" size="icon" onClick={() => setTarget((t) => t - step)}><Icon name="chevR" size={18} stroke={3} /></Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-04 · Stories viewer ═════════ */
const STORIES = [
  { k: "Market", t: "BTC пробил $64k", s: "Объём +38% — пробой подтверждён покупателями.", g: ["#0f3b33", "#2ee59d"], m: "happy" as const, i: "trendUp" },
  { k: "Lesson", t: "Что такое FOMO?", s: "Страх упустить рост заставляет покупать на хаях. Жди отката.", g: ["#2a1760", "#a174ff"], m: "think" as const, i: "book" },
  { k: "Alert", t: "Funding rate 0.1%", s: "Лонги переплачивают — рынок перегрет. Осторожно с плечом.", g: ["#3d1628", "#ff4d6a"], m: "wow" as const, i: "warn" },
  { k: "Quest", t: "Daily x2 XP", s: "Пройди 2 урока до полуночи и забери бонус.", g: ["#3b2f10", "#ffc53d"], m: "cool" as const, i: "gift" },
];
function Stories() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [prog, setProg] = useState(0);
  const [paused, setPaused] = useState(false);
  const [closed, setClosed] = useState(false);
  const [dy, setDy] = useState(0);
  const holdT = useRef<number | undefined>(undefined);
  const held = useRef(false);
  const DUR = 5000;
  const progRef = useRef(0);
  useRaf((dt) => {
    let np = progRef.current + dt / DUR;
    if (np >= 1) {
      if (i < STORIES.length - 1) { setI(i + 1); np = 0; }
      else { setClosed(true); np = 0; }
    }
    progRef.current = np;
    setProg(np);
  }, !paused && !closed);
  const nav = (dir: 1 | -1) => {
    feel("tap", 6);
    progRef.current = 0;
    if (dir === 1) { if (i < STORIES.length - 1) { setI(i + 1); setProg(0); } else setClosed(true); }
    else { setI(Math.max(0, i - 1)); setProg(0); }
  };
  const onDown = useDrag({
    onStart: () => { held.current = false; holdT.current = window.setTimeout(() => { held.current = true; setPaused(true); }, 180); },
    onMove: (d) => { if (d.dy > 0) setDy(d.dy); },
    onEnd: (d) => {
      clearTimeout(holdT.current);
      setPaused(false);
      if (d.dy > 90) { setClosed(true); setDy(0); feel("whoosh"); return; }
      setDy(0);
      if (held.current || Math.abs(d.dx) > 8 || Math.abs(d.dy) > 8) return;
      const el = document.getElementById("story-stage");
      const r = el?.getBoundingClientRect();
      if (r) nav(d.x - r.left < r.width / 3 ? -1 : 1);
    },
  });
  const s = STORIES[i];
  return (
    <AssetCard id="CAR-04" title="Stories Viewer" desc="Сторис как в Instagram: авто-прогресс, тап влево/вправо, удержание — пауза, свайп вниз — закрыть. Контент — новости и мини-уроки." tags={["stories", "carousel", "gesture", "autoplay"]} stageClass="p-2">
      {closed ? (
        <div className="flex h-[380px] flex-col items-center justify-center gap-3">
          <div className="flex gap-3">
            {STORIES.map((st, k) => (
              <button key={k} onClick={() => { setI(k); setProg(0); setClosed(false); feel("pop"); }} className="rounded-full p-[3px]" style={{ background: `conic-gradient(${st.g[1]}, #2ee59d, ${st.g[1]})` }}>
                <span className="grid h-14 w-14 place-items-center rounded-full bg-ink-900 ring-2 ring-ink-900"><Icon name={st.i} size={22} variant="duo" style={{ color: st.g[1] }} /></span>
              </button>
            ))}
          </div>
          <div className="text-xs font-bold text-ink-400">Tap a story ring</div>
        </div>
      ) : (
        <div id="story-stage" onPointerDown={onDown} className="relative h-[380px] cursor-pointer touch-none select-none overflow-hidden rounded-2xl transition-[transform,border-radius]"
          style={{ background: `radial-gradient(circle at 30% 20%, ${s.g[1]}55, transparent 60%), linear-gradient(180deg, ${s.g[0]}, #0a1330)`, transform: `translateY(${dy}px) scale(${1 - dy / 1200})`, borderRadius: 16 + dy / 6 }}>
          <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
            {STORIES.map((_, k) => (
              <div key={k} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                <div className="h-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${k < i ? 1 : k === i ? prog : 0})` }} />
              </div>
            ))}
          </div>
          <div className="absolute left-3 right-3 top-7 z-10 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-b from-bull to-bull-edge"><Icon name="candle" size={16} stroke={2.8} className="text-ink-900" /></span>
            <span className="text-xs font-extrabold text-white">Pipwise · {s.k}</span>
            <span className="text-[10px] text-white/60">{i + 1}h</span>
            {paused && <span className="ml-auto rounded-md bg-black/40 px-1.5 text-[10px] font-extrabold text-white">❚❚</span>}
          </div>
          <div key={i} className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center" style={{ animation: "scaleIn .45s cubic-bezier(.3,1.4,.5,1) both" }}>
            <Mascot mood={s.m} size={110} className="anim-float" />
            <div className="mt-3 text-2xl font-extrabold text-white text-3d">{s.t}</div>
            <div className="mt-2 text-sm font-semibold text-white/80">{s.s}</div>
          </div>
          <div className="absolute inset-x-4 bottom-4 z-10" onPointerDown={(e) => e.stopPropagation()}>
            <Btn v="gold" size="sm" block onClick={(e) => game.reward({ xp: 10, x: e.clientX, y: e.clientY })}>Swipe up · +10 XP</Btn>
          </div>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ CAR-05 · Swipeable card stack ═════════ */
const TIPS = [
  { t: "Не торгуй на эмоциях", i: "heart", c: "#ff4d6a" }, { t: "Всегда ставь стоп-лосс", i: "shield", c: "#2ee59d" },
  { t: "Тренд — твой друг", i: "trendUp", c: "#3d8bff" }, { t: "Риск ≤ 1% на сделку", i: "target", c: "#ffc53d" }, { t: "Веди дневник сделок", i: "book", c: "#a174ff" },
];
function Stack() {
  const [order, setOrder] = useState(TIPS.map((_, i) => i));
  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const onDown = useDrag({
    onMove: (d) => setDx(d.dx),
    onEnd: (d) => {
      if (Math.abs(d.dx) > 90 || Math.abs(d.vx) > 12) {
        const dir = (d.dx || d.vx) > 0 ? 1 : -1;
        setFly(dir as 1 | -1);
        feel("swipe", 10);
        window.setTimeout(() => { setOrder((o) => [...o.slice(1), o[0]]); setFly(0); setDx(0); }, 260);
      } else setDx(0);
    },
  });
  return (
    <AssetCard id="CAR-05" title="Card Stack · Swipe to Cycle" desc="Колода советов: верхнюю карту смахиваешь, она уходит вниз стопки. Задние карты подтягиваются с пружиной." tags={["stack", "swipe", "deck", "carousel"]}>
      <div className="relative mx-auto h-64 w-full max-w-[240px]">
        {order.slice(0, 4).map((ti, k) => ({ ti, k })).reverse().map(({ ti, k }) => {
          const t = TIPS[ti];
          const top = k === 0;
          const x = top ? (fly ? fly * 400 : dx) : 0;
          const lift = top ? 0 : Math.max(0, k - Math.min(1, Math.abs(dx) / 120));
          return (
            <div key={ti} onPointerDown={top ? onDown : undefined} className={cn("absolute inset-0 flex cursor-grab touch-none select-none flex-col justify-between rounded-3xl p-5", !top || fly || dx === 0 ? "transition-transform duration-300 ease-[cubic-bezier(.3,1.3,.5,1)]" : "")}
              style={{
                transform: `translate(${x}px, ${lift * 14}px) rotate(${top ? x / 14 : (k % 2 ? 3 : -3) * lift}deg) scale(${1 - lift * 0.06})`,
                background: `linear-gradient(160deg, #22376f, #16264f)`, boxShadow: `0 6px 0 #0b1638, 0 20px 30px -12px #000, inset 0 0 0 2px ${t.c}55`, zIndex: 10 - k,
              }}>
              <span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: `${t.c}26` }}><Icon name={t.i} size={30} variant="duo" style={{ color: t.c }} /></span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: t.c }}>Rule #{ti + 1}</div>
                <div className="text-xl font-extrabold leading-tight text-white">{t.t}</div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-ink-400"><span>← swipe →</span><span>{ti + 1}/{TIPS.length}</span></div>
            </div>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-06 · Onboarding pager with layered parallax ═════════ */
const PAGES = [
  { t: "Учись играя", s: "5 минут в день — и ты читаешь графики как профи.", c: "#2ee59d", i: "book" },
  { t: "Торгуй без риска", s: "$10,000 демо-баланс и реальные котировки.", c: "#3d8bff", i: "wallet" },
  { t: "Соревнуйся", s: "Лиги, стрики и награды за дисциплину.", c: "#ffc53d", i: "trophy" },
];
function Onboarding() {
  const [page, setPage] = useState(0);
  const [p, api] = useSpring(page, 140, 20);
  const base = useRef(0);
  const W = 260;
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => api.set(clamp(base.current - d.dx / W, -0.25, PAGES.length - 0.75)),
    onEnd: (d) => { const t = clamp(Math.round(api.get() - d.vx * 0.05), 0, PAGES.length - 1); setPage(t); api.release(); if (t !== page) feel("swipe"); },
  });
  const go = (t: number) => { setPage(t); feel("swipe"); };
  const hue = PAGES[clamp(Math.round(p), 0, 2)].c;
  return (
    <AssetCard id="CAR-06" title="Onboarding Pager · Layered Parallax" desc="Три слоя двигаются с разной скоростью (0.3× / 0.7× / 1.4×) относительно свайпа. Индикатор — растягивающаяся капля." tags={["onboarding", "pager", "parallax", "swipe"]} stageClass="p-0 overflow-hidden">
      <div onPointerDown={onDown} className="relative h-72 cursor-grab touch-pan-y select-none overflow-hidden" style={{ background: `radial-gradient(circle at 50% 30%, ${hue}33, transparent 60%)`, transition: "background .5s" }}>
        {/* far layer: stars */}
        <div className="absolute inset-0" style={{ transform: `translateX(${-p * W * 0.3}px)`, width: W * 3 }}>
          {Array.from({ length: 30 }).map((_, k) => <span key={k} className="absolute h-1 w-1 rounded-full bg-white" style={{ left: (k * 97) % (W * 3), top: (k * 53) % 260, animation: `twinkle ${2 + (k % 4)}s ease-in-out ${k * 0.1}s infinite` }} />)}
        </div>
        {/* mid layer: candle mountains */}
        <svg className="absolute bottom-0 left-0" width={W * 4} height="120" style={{ transform: `translateX(${-p * W * 0.7}px)` }}>
          {Array.from({ length: 40 }).map((_, k) => {
            const h = 30 + Math.abs(Math.sin(k * 0.7)) * 70;
            return <rect key={k} x={k * 26} y={120 - h} width="16" height={h} rx="4" fill={k % 3 ? "#16264f" : "#1c3066"} />;
          })}
        </svg>
        {/* front layer: pages */}
        {PAGES.map((pg, k) => {
          const off = k - p;
          return (
            <div key={pg.t} className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center" style={{ transform: `translateX(${off * W * 1.4}px)`, opacity: 1 - Math.min(1, Math.abs(off)) }}>
              <div className="grid h-24 w-24 place-items-center rounded-[30px]" style={{ background: `linear-gradient(160deg, ${pg.c}, ${pg.c}88)`, boxShadow: `0 6px 0 #0006, 0 0 40px ${pg.c}66`, transform: `rotate(${off * 30}deg) scale(${1 - Math.abs(off) * 0.3})` }}>
                <Icon name={pg.i} size={46} variant="duo" className="text-white" />
              </div>
              <div className="mt-5 text-2xl font-extrabold text-white" style={{ transform: `translateX(${off * 40}px)` }}>{pg.t}</div>
              <div className="mt-1 text-sm text-ink-300" style={{ transform: `translateX(${off * 80}px)` }}>{pg.s}</div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between p-4">
        <div className="relative flex h-3 items-center gap-2">
          {PAGES.map((_, k) => <button key={k} onClick={() => go(k)} className="h-2.5 w-2.5 rounded-full bg-ink-600" />)}
          <span className="absolute h-2.5 rounded-full bg-sky shadow-[0_0_10px_#3d8bff]" style={{ left: Math.min(p, Math.ceil(p)) * 18, width: 10 + Math.sin((p % 1) * Math.PI) * 18 }} />
        </div>
        <Btn v={page === 2 ? "bull" : "sky"} size="sm" onClick={() => go(page === 2 ? 0 : page + 1)}>{page === 2 ? "Get started" : "Next"}</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-07 · Vertical reel (TikTok-style) ═════════ */
const REELS = [
  { t: "Бычье поглощение", s: "Зелёная свеча полностью перекрывает красную", c: "#2ee59d", likes: 1204 },
  { t: "Двойное дно", s: "Цена дважды отбивается от уровня — разворот", c: "#3d8bff", likes: 987 },
  { t: "Голова и плечи", s: "Классический разворот вершины", c: "#ff4d6a", likes: 2310 },
  { t: "Флаг", s: "Консолидация после импульса — продолжение", c: "#ffc53d", likes: 756 },
];
function Reel() {
  const [idx, setIdx] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== idx) { setIdx(i); sfx.play("tick"); }
  };
  return (
    <AssetCard id="CAR-07" title="Vertical Reel · Learn Feed" desc="Вертикальная snap-лента мини-уроков: контент анимируется при попадании в кадр, двойной тап — лайк, боковые экшены." tags={["reel", "vertical", "snap", "feed"]} stageClass="p-2">
      <div ref={ref} onScroll={onScroll} className="no-scrollbar snap-y-strict relative h-[380px] overflow-y-auto rounded-2xl">
        {REELS.map((r, k) => {
          const on = k === idx;
          return (
            <div key={r.t} onDoubleClick={() => { if (!liked.includes(k)) { setLiked([...liked, k]); feel("pop", 12); } }} className="relative h-full snap-start overflow-hidden" style={{ background: `radial-gradient(circle at 50% 35%, ${r.c}40, transparent 65%), #0a1330` }}>
              <svg viewBox="0 0 200 100" className={cn("absolute left-6 right-16 top-16 transition-all duration-700", on ? "opacity-100" : "translate-y-8 opacity-0")}>
                <path d={["M0 80 L40 70 L60 85 L90 40 L120 55 L160 20 L200 30", "M0 30 L40 80 L80 40 L120 80 L160 30 L200 20", "M0 70 L40 40 L70 60 L100 15 L130 60 L160 40 L200 75", "M0 90 L40 30 L70 45 L100 35 L130 48 L160 38 L200 10"][k]}
                  fill="none" stroke={r.c} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" pathLength={100} strokeDasharray="100" style={{ strokeDashoffset: on ? 0 : 100, transition: "stroke-dashoffset 1.2s ease .2s", filter: `drop-shadow(0 0 6px ${r.c})` }} />
              </svg>
              <div className={cn("absolute bottom-6 left-4 right-16 transition-all delay-300 duration-700", on ? "opacity-100" : "translate-y-6 opacity-0")}>
                <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: r.c }}>Pattern · {k + 1}/{REELS.length}</div>
                <div className="text-xl font-extrabold text-white">{r.t}</div>
                <div className="text-xs text-ink-300">{r.s}</div>
              </div>
              <div className="absolute bottom-6 right-3 flex flex-col items-center gap-4">
                {[
                  { i: "heart", on: liked.includes(k), c: "#ff4d6a", n: r.likes + (liked.includes(k) ? 1 : 0), f: () => { setLiked(liked.includes(k) ? liked.filter((x) => x !== k) : [...liked, k]); feel("pop"); } },
                  { i: "star", on: saved.includes(k), c: "#ffc53d", n: "Save", f: () => { setSaved(saved.includes(k) ? saved.filter((x) => x !== k) : [...saved, k]); feel("tap"); } },
                  { i: "swap", on: false, c: "#fff", n: "Share", f: () => feel("whoosh") },
                ].map((a) => (
                  <button key={a.i} onClick={a.f} className="flex flex-col items-center gap-0.5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur"><Icon key={String(a.on)} name={a.i} size={22} variant={a.on ? "solid" : "line"} className={a.on ? "anim-pop" : ""} style={{ color: a.on ? a.c : "#fff" }} /></span>
                    <span className="font-mono text-[10px] font-bold text-white">{a.n}</span>
                  </button>
                ))}
              </div>
              {k === 0 && idx === 0 && <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-white/60"><Icon name="chevU" size={22} stroke={3} style={{ animation: "scrollHint 1.2s ease-in infinite reverse" }} /></div>}
            </div>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-08 · Main + thumbnails synced gallery ═════════ */
const PATTERNS = [
  { n: "Hammer", d: "M30 12v14 M22 26h16v16H22z M30 42v46", c: "#2ee59d" },
  { n: "Doji", d: "M30 10v80 M16 50h28", c: "#ffc53d" },
  { n: "Shooting Star", d: "M30 10v46 M22 56h16v16H22z M30 72v10", c: "#ff4d6a" },
  { n: "Marubozu", d: "M18 14h24v72H18z", c: "#2ee59d" },
  { n: "Spinning Top", d: "M30 10v30 M22 40h16v20H22z M30 60v30", c: "#8fa0cf" },
  { n: "Hanging Man", d: "M30 14v10 M22 24h16v14H22z M30 38v50", c: "#ff4d6a" },
  { n: "Inverted Hammer", d: "M30 10v48 M22 58h16v16H22z M30 74v6", c: "#2ee59d" },
];
function Gallery() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const strip = useRef<HTMLDivElement>(null);
  const set = (n: number) => { const t = (n + PATTERNS.length) % PATTERNS.length; setDir(t > i ? 1 : -1); setI(t); sfx.play("tick"); };
  useEffect(() => {
    const el = strip.current;
    const th = el?.children[i] as HTMLElement | undefined;
    if (el && th) el.scrollTo({ left: th.offsetLeft - el.clientWidth / 2 + th.clientWidth / 2, behavior: "smooth" });
  }, [i]);
  const p = PATTERNS[i];
  return (
    <AssetCard id="CAR-08" title="Gallery · Synced Thumbnails" desc="Главный просмотр со сдвигом по направлению + лента превью, автоцентрирующая активный элемент." tags={["gallery", "thumbnails", "carousel"]}>
      <div className="raised relative h-44 overflow-hidden rounded-2xl">
        <div key={i} className="absolute inset-0 flex items-center justify-center gap-6" style={{ animation: `${dir > 0 ? "screenIn" : "slideInL"} .4s cubic-bezier(.3,1.2,.5,1) both` }}>
          <svg viewBox="0 0 60 100" className="h-32"><path d={p.d} stroke={p.c} strokeWidth="4" fill={p.c} fillOpacity=".35" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${p.c})` }} /></svg>
          <div><div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Pattern {i + 1}</div><div className="text-xl font-extrabold text-white">{p.n}</div></div>
        </div>
        <button onClick={() => set(i - 1)} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink-900/60 text-white hover:bg-ink-900"><Icon name="chevL" size={16} stroke={3} /></button>
        <button onClick={() => set(i + 1)} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-ink-900/60 text-white hover:bg-ink-900"><Icon name="chevR" size={16} stroke={3} /></button>
      </div>
      <div ref={strip} className="no-scrollbar mask-fade-x mt-3 flex gap-2 overflow-x-auto px-6 py-2">
        {PATTERNS.map((q, k) => (
          <button key={q.n} onClick={() => set(k)} className={cn("grid h-16 w-14 shrink-0 place-items-center rounded-xl transition-all duration-300", k === i ? "raised -translate-y-1 ring-2" : "bg-ink-800 opacity-60 hover:opacity-100")} style={k === i ? { ["--tw-ring-color" as string]: q.c } : undefined}>
            <svg viewBox="0 0 60 100" className="h-10"><path d={q.d} stroke={q.c} strokeWidth="5" fill={q.c} fillOpacity=".3" strokeLinecap="round" /></svg>
          </button>
        ))}
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-09 · Expanding accordion carousel ═════════ */
function Accordion() {
  const items = UNITS.slice(0, 5);
  const [a, setA] = useState(1);
  const [t, setT] = useState(0);
  const [hover, setHover] = useState(false);
  const tRef = useRef(0);
  useRaf((dt) => {
    let n = tRef.current + dt / 3500;
    if (n >= 1) { setA((v) => (v + 1) % items.length); n = 0; }
    tRef.current = n;
    setT(n);
  }, !hover);
  return (
    <AssetCard id="CAR-09" title="Expanding Panels Carousel" desc="Панели раскрываются по наведению/тапу, автоцикл с индикатором прогресса, вертикальные заголовки у свёрнутых." tags={["accordion", "carousel", "autoplay", "expand"]}>
      <div className="flex h-60 gap-2" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {items.map((u, k) => {
          const on = k === a;
          return (
            <button key={u.t} onClick={() => { setA(k); tRef.current = 0; setT(0); feel("tap"); }} onMouseEnter={() => { if (k !== a) { setA(k); tRef.current = 0; setT(0); sfx.play("tick"); } }}
              className="relative overflow-hidden rounded-2xl text-left transition-[flex-grow] duration-500 ease-[cubic-bezier(.3,1.1,.4,1)]"
              style={{ flexGrow: on ? 6 : 1, flexBasis: 0, background: `linear-gradient(160deg, ${u.g[0]}, ${u.g[1]})`, boxShadow: `0 5px 0 ${u.g[1]}` }}>
              <div className={cn("absolute inset-0 flex items-center justify-center transition-opacity duration-300", on ? "opacity-0" : "opacity-100")}>
                <span className="whitespace-nowrap text-xs font-extrabold uppercase tracking-widest text-white/90" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{u.t}</span>
              </div>
              <div className={cn("absolute inset-0 flex flex-col justify-between p-4 transition-all duration-500", on ? "translate-y-0 opacity-100 delay-150" : "translate-y-4 opacity-0")}>
                <Icon name={u.i} size={40} variant="duo" className="text-white" />
                <div>
                  <div className="text-lg font-extrabold leading-tight text-white text-3d">{u.t}</div>
                  <div className="text-xs font-bold text-white/80">{u.s}</div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/25"><div className="h-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${on ? t : 0})` }} /></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </AssetCard>
  );
}

/* ═════════ CAR-10 · Infinite momentum marquee carousel ═════════ */
const GAINERS = [
  { s: "PEPE", c: 24.1 }, { s: "SOL", c: 8.4 }, { s: "INJ", c: 12.9 }, { s: "TON", c: 5.2 }, { s: "ARB", c: -3.1 }, { s: "OP", c: 6.7 }, { s: "LINK", c: 4.4 }, { s: "AVAX", c: -1.9 },
];
function Infinite() {
  const x = useRef(0);
  const vel = useRef(-0.6);
  const dragging = useRef(false);
  const [, force] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const ITEM = 116;
  const total = GAINERS.length * ITEM;
  useRaf((dt) => {
    if (!dragging.current) {
      vel.current += (-0.6 - vel.current) * 0.03;
      x.current += vel.current * (dt / 16);
    }
    x.current = ((x.current % total) + total) % total - total;
    force((n) => (n + 1) % 1000000);
  });
  const lastX = useRef(0);
  const onDown = useDrag({
    onStart: () => { dragging.current = true; lastX.current = 0; },
    onMove: (d) => { x.current += d.dx - lastX.current; lastX.current = d.dx; },
    onEnd: (d) => { dragging.current = false; vel.current = d.vx; },
  });
  return (
    <AssetCard id="CAR-10" title="Infinite Momentum Carousel" desc="Бесконечная лента топ-движений: автодвижение, перетаскивание, бросок с инерцией, которая плавно возвращается к автоскорости." tags={["infinite", "marquee", "momentum", "drag"]} stageClass="px-0 overflow-hidden">
      <div onPointerDown={onDown} className="mask-fade-x relative h-36 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing">
        <div className="absolute left-0 top-3 flex" style={{ transform: `translateX(${x.current}px)` }}>
          {[...GAINERS, ...GAINERS, ...GAINERS].map((g, k) => {
            const up = g.c >= 0;
            return (
              <div key={k} onClick={() => { setPicked(g.s); feel("pop"); }} className="mr-3 flex h-28 w-[104px] shrink-0 flex-col justify-between rounded-2xl p-3" style={{ background: up ? "linear-gradient(160deg,#0f3b33,#16264f)" : "linear-gradient(160deg,#3d1628,#16264f)", boxShadow: `0 5px 0 #081130, inset 0 0 0 1.5px ${up ? "#2ee59d44" : "#ff4d6a44"}` }}>
                <div className="font-mono text-sm font-extrabold text-white">{g.s}</div>
                <svg viewBox="0 0 80 24" className="h-6 w-full"><path d={up ? "M0 20 L15 16 L30 18 L45 10 L60 12 L80 2" : "M0 4 L15 8 L30 6 L45 14 L60 12 L80 22"} fill="none" stroke={up ? "#2ee59d" : "#ff4d6a"} strokeWidth="2.2" /></svg>
                <div className={cn("font-mono text-sm font-extrabold", up ? "text-bull" : "text-bear")}>{up ? "+" : ""}{g.c}%</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="px-4">
        <Label>Speed · {Math.abs(vel.current).toFixed(1)} px/f</Label>
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-ink-300">{picked ? <>Selected: <b className="text-white">{picked}</b></> : "Tap a tile or fling the strip"}</div>
          <div className="flex gap-2">
            <Btn v="dark" size="icon" onClick={() => (vel.current = 22)}><Icon name="chevL" size={16} stroke={3} /></Btn>
            <Btn v="dark" size="icon" onClick={() => (vel.current = -22)}><Icon name="chevR" size={16} stroke={3} /></Btn>
          </div>
        </div>
      </div>
    </AssetCard>
  );
}

export default function Carousels() {
  return (
    <Section id="carousels" num="08" title="Carousels" subtitle="10 типов каруселей: snap, coverflow, ring, stories, stack, pager, reel, gallery, accordion, infinite">
      <SnapCarousel />
      <Coverflow />
      <Ring />
      <Stories />
      <Stack />
      <Onboarding />
      <Reel />
      <Gallery />
      <Accordion />
      <Infinite />
    </Section>
  );
}
