import { useLayoutEffect, useRef, useState } from "react";
import { Asset, Badge, Bar, Btn3D, Section, Segmented, Spinner } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { Phone } from "./Screens";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstConfetti } from "../utils/fx";
import type { G } from "./Carousels";

/* =========================================================
   1. SCREEN TRANSITIONS (Web Animations API)
   ========================================================= */
type TType = "slide" | "push" | "zoom" | "flip" | "circle";
const SCREENS = [
  { t: "Home", g: "rocket" as G, c: "#3d7bff", d: "Продолжить обучение" },
  { t: "Lesson", g: "star" as G, c: "#8d5cff", d: "Вопрос 3 из 5" },
  { t: "Result", g: "crown" as G, c: "#1fdb8b", d: "+45 XP · точность 100%" },
];
function MiniScreen({ i, onNext, onBack }: { i: number; onNext: (e: React.MouseEvent) => void; onBack: (e: React.MouseEvent) => void }) {
  const s = SCREENS[i];
  return (
    <div className="absolute inset-0 flex flex-col p-4 pt-9" style={{ background: `radial-gradient(circle at 50% 25%, ${s.c}45, #070d1f 70%)` }}>
      <div className="flex items-center justify-between">
        <button onClick={onBack} disabled={i === 0} className="size-8 rounded-lg grid place-items-center bg-white/5 disabled:opacity-30"><Icon name="chevL" size={16} stroke={3} /></button>
        <span className="font-extrabold text-[14px]">{s.t}</span>
        <span className="num text-[10px] text-dim font-bold w-8 text-right">{i + 1}/3</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Glyph name={s.g} size={80} />
        <div className="font-extrabold text-[20px] mt-3">{s.t}</div>
        <div className="text-[12px] text-mute">{s.d}</div>
        {i === 1 && <div className="w-full mt-4 space-y-2">{["Hammer", "Doji"].map((o) => <div key={o} className="opt px-3 py-2.5 text-[12px] font-bold">{o}</div>)}</div>}
      </div>
      <button onClick={onNext} className="btn3d h-12 text-[12px] w-full" style={{ ["--top" as string]: "#6a9dff", ["--base" as string]: s.c, ["--lip" as string]: "#1a2a5c" }}>{i === 2 ? "Back to home" : "Continue"}</button>
    </div>
  );
}
function ScreenTransitions() {
  const [type, setType] = useState<TType>("push");
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const origin = useRef({ x: 50, y: 80 });
  const inRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const go = (n: number, d: number, e?: React.MouseEvent) => {
    if (prev !== null) return;
    const host = inRef.current?.parentElement?.getBoundingClientRect();
    if (e && host) origin.current = { x: ((e.clientX - host.left) / host.width) * 100, y: ((e.clientY - host.top) / host.height) * 100 };
    setDir(d); setPrev(cur); setCur(n); sfx.whoosh(); haptic(6);
  };
  useLayoutEffect(() => {
    if (prev === null) return;
    const inEl = inRef.current, outEl = outRef.current;
    if (!inEl || !outEl) return;
    const E = "cubic-bezier(.3,1.1,.4,1)", D = 520;
    const o = origin.current;
    const K: Record<TType, [Keyframe[], Keyframe[]]> = {
      slide: [[{ transform: `translateX(${dir * 100}%)` }, { transform: "none" }], [{ transform: "none" }, { transform: `translateX(${-dir * 100}%)` }]],
      push: [[{ transform: `translateX(${dir * 100}%)`, boxShadow: "-20px 0 40px rgba(0,0,0,.6)" }, { transform: "none", boxShadow: "-20px 0 40px rgba(0,0,0,0)" }], [{ transform: "none", filter: "brightness(1)" }, { transform: `translateX(${-dir * 30}%) scale(.94)`, filter: "brightness(.45)" }]],
      zoom: [[{ transform: "scale(1.25)", opacity: 0 }, { transform: "none", opacity: 1 }], [{ transform: "none", opacity: 1 }, { transform: "scale(.85)", opacity: 0 }]],
      flip: [[{ transform: `perspective(900px) rotateY(${dir * -90}deg)`, opacity: 0.4, offset: 0 }, { transform: `perspective(900px) rotateY(${dir * -90}deg)`, opacity: 0.4, offset: 0.5 }, { transform: "perspective(900px) rotateY(0)", opacity: 1 }], [{ transform: "perspective(900px) rotateY(0)" }, { transform: `perspective(900px) rotateY(${dir * 90}deg)`, offset: 0.5 }, { transform: `perspective(900px) rotateY(${dir * 90}deg)` }]],
      circle: [[{ clipPath: `circle(0% at ${o.x}% ${o.y}%)` }, { clipPath: `circle(150% at ${o.x}% ${o.y}%)` }], [{ transform: "none" }, { transform: "scale(.96)", filter: "brightness(.6)" }]],
    };
    const [ki, ko] = K[type];
    const a = inEl.animate(ki, { duration: D, easing: E, fill: "both" });
    outEl.animate(ko, { duration: D, easing: E, fill: "both" });
    a.onfinish = () => setPrev(null);
  }, [prev, cur, type, dir]);
  return (
    <Asset title="Screen Transitions" id="trn.screens" desc="5 типов переходов между экранами (Web Animations API): slide, iOS push, zoom, 3D flip, circle reveal от точки касания.">
      <Segmented value={type} onChange={(v) => setType(v as TType)} size="sm" className="mb-4" options={[{ value: "slide", label: "Slide" }, { value: "push", label: "Push" }, { value: "zoom", label: "Zoom" }, { value: "flip", label: "Flip" }, { value: "circle", label: "Circle" }]} />
      <Phone>
        <div className="absolute inset-0 overflow-hidden">
          {prev !== null && <div ref={outRef} className="absolute inset-0"><MiniScreen i={prev} onNext={() => {}} onBack={() => {}} /></div>}
          <div ref={inRef} key={cur} className="absolute inset-0 z-10">
            <MiniScreen i={cur} onNext={(e) => go((cur + 1) % 3, 1, e)} onBack={(e) => go(Math.max(0, cur - 1), -1, e)} />
          </div>
        </div>
      </Phone>
    </Asset>
  );
}

/* =========================================================
   2. SHARED ELEMENT EXPAND (FLIP)
   ========================================================= */
const LESSONS: { t: string; s: string; g: G; c: string; body: string }[] = [
  { t: "Свечи", s: "12 уроков", g: "flame", c: "#ff8a3d", body: "Японские свечи показывают open, high, low и close. Тело — борьба покупателей и продавцов, фитили — отвергнутые цены." },
  { t: "Уровни", s: "10 уроков", g: "shield", c: "#1fdb8b", body: "Поддержка и сопротивление — зоны, где цена исторически разворачивалась. Пробой с объёмом — сильный сигнал." },
  { t: "Риск", s: "9 уроков", g: "heart", c: "#ff4d6a", body: "Правило 1%: максимальный убыток на сделку — не больше 1% депозита. Размер позиции считается от стопа." },
  { t: "DeFi", s: "14 уроков", g: "gem", c: "#2ed3f0", body: "Децентрализованные финансы: DEX, пулы ликвидности, стейкинг и доходность без посредников." },
];
function SharedExpand() {
  const host = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const overlay = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  const flipFrom = (i: number, reverse: boolean) => {
    const h = host.current!.getBoundingClientRect(), c = cards.current[i]!.getBoundingClientRect(), o = overlay.current!;
    const dx = c.left - h.left, dy = c.top - h.top, sx = c.width / h.width, sy = c.height / h.height;
    const from = { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: "40px" };
    const to = { transform: "none", borderRadius: "24px" };
    return o.animate(reverse ? [to, from] : [from, to], { duration: 520, easing: "cubic-bezier(.3,1.15,.4,1)", fill: "both" });
  };
  useLayoutEffect(() => { if (open !== null && !closing) flipFrom(open, false); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const close = () => {
    if (open === null) return;
    setClosing(true); sfx.whoosh();
    const a = flipFrom(open, true);
    a.onfinish = () => { setOpen(null); setClosing(false); };
  };
  const L = open !== null ? LESSONS[open] : null;
  return (
    <Asset title="Shared Element Expand" id="trn.shared" desc="Карточка «вырастает» в полноэкранную деталь из своей позиции (FLIP: First-Last-Invert-Play) и схлопывается обратно.">
      <div ref={host} className="relative h-[340px]">
        <div className="grid grid-cols-2 gap-3 h-full">
          {LESSONS.map((l, i) => (
            <button key={l.t} ref={(e) => { cards.current[i] = e; }} onClick={() => { setOpen(i); sfx.pop(); haptic(8); }}
              className={cn("rounded-[22px] p-4 text-left flex flex-col relative overflow-hidden transition-opacity hover:-translate-y-0.5", open === i && "opacity-0")}
              style={{ background: `linear-gradient(160deg, ${l.c}, #0f1b3f 85%)`, boxShadow: "0 5px 0 #081028" }}>
              <Glyph name={l.g} size={36} />
              <div className="mt-auto font-extrabold text-[16px]">{l.t}</div>
              <div className="text-[11px] font-bold text-white/70">{l.s}</div>
            </button>
          ))}
        </div>
        {L && (
          <div ref={overlay} className="absolute inset-0 z-20 p-5 flex flex-col overflow-hidden origin-top-left" style={{ background: `linear-gradient(160deg, ${L.c}, #0f1b3f 75%)`, boxShadow: "0 20px 50px rgba(0,0,0,.6)" }}>
            <div className="flex items-start justify-between">
              <Glyph name={L.g} size={52} />
              <button onClick={close} className="size-9 rounded-full bg-black/30 grid place-items-center"><Icon name="x" size={16} stroke={3} /></button>
            </div>
            <div className={cn("transition-all duration-500", closing ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0 delay-300")} style={{ transitionDelay: closing ? "0ms" : "280ms" }}>
              <div className="font-extrabold text-[26px] mt-3">{L.t}</div>
              <div className="text-[12px] font-bold text-white/70">{L.s}</div>
              <p className="text-[13px] font-semibold text-white/85 leading-relaxed mt-3">{L.body}</p>
              <div className="mt-4"><Bar value={35} tone="bull" h={10} /></div>
              <Btn3D size="md" variant="bull" full className="mt-4" icon={<Icon name="play" size={16} />}>Start lesson</Btn3D>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =========================================================
   3. FLIP GRID (filter / shuffle / sort)
   ========================================================= */
const COINS = [
  { s: "BTC", k: "L1", c: 2.4, col: "#f7931a" }, { s: "ETH", k: "L1", c: -1.1, col: "#8c8cff" }, { s: "SOL", k: "L1", c: 6.8, col: "#14f195" },
  { s: "UNI", k: "DeFi", c: 3.1, col: "#ff4d9a" }, { s: "AAVE", k: "DeFi", c: -2.6, col: "#8d5cff" }, { s: "DOGE", k: "Meme", c: 11.4, col: "#c2a633" },
  { s: "PEPE", k: "Meme", c: -7.2, col: "#1fdb8b" }, { s: "FET", k: "AI", c: 9.3, col: "#3d7bff" }, { s: "RNDR", k: "AI", c: 4.4, col: "#ff4d6a" },
  { s: "LINK", k: "DeFi", c: 1.2, col: "#2a5ada" }, { s: "AVAX", k: "L1", c: -0.7, col: "#e84142" }, { s: "WIF", k: "Meme", c: 15.1, col: "#d9a066" },
];
function FlipGrid() {
  const [filter, setFilter] = useState("All");
  const [order, setOrder] = useState(COINS.map((c) => c.s));
  const els = useRef(new Map<string, HTMLDivElement>());
  const rects = useRef(new Map<string, DOMRect>());
  const snapshot = () => { rects.current.clear(); els.current.forEach((el, k) => rects.current.set(k, el.getBoundingClientRect())); };
  useLayoutEffect(() => {
    els.current.forEach((el, k) => {
      const prev = rects.current.get(k);
      const now = el.getBoundingClientRect();
      if (prev) {
        const dx = prev.left - now.left, dy = prev.top - now.top;
        if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 500, easing: "cubic-bezier(.3,1.25,.5,1)" });
      } else el.animate([{ transform: "scale(.4)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.3,1.5,.5,1)" });
    });
  }, [filter, order]);
  const list = order.map((s) => COINS.find((c) => c.s === s)!).filter((c) => filter === "All" || c.k === filter);
  return (
    <Asset title="FLIP Layout Grid" id="trn.flip" desc="Фильтр, перемешивание и сортировка с анимацией раскладки: элементы плавно перелетают на новые места, новые — выпрыгивают." className="lg:col-span-2">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["All", "L1", "DeFi", "Meme", "AI"].map((f) => <button key={f} onClick={() => { snapshot(); setFilter(f); sfx.tick(); }} className="opt !rounded-full px-3.5 h-9 text-[12px] font-extrabold" data-state={filter === f ? "selected" : undefined}>{f}</button>)}
        <div className="ml-auto flex gap-2">
          <Btn3D size="xs" variant="neutral" icon={<Icon name="swap" size={12} />} onClick={() => { snapshot(); setOrder((o) => [...o].sort(() => Math.random() - 0.5)); sfx.whoosh(); }}>Shuffle</Btn3D>
          <Btn3D size="xs" variant="neutral" icon={<Icon name="sort" size={12} />} onClick={() => { snapshot(); setOrder((o) => [...o].sort((a, b) => COINS.find((c) => c.s === b)!.c - COINS.find((c) => c.s === a)!.c)); sfx.whoosh(); }}>Top gainers</Btn3D>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {list.map((c) => (
          <div key={c.s} ref={(e) => { if (e) els.current.set(c.s, e); else els.current.delete(c.s); }} className="raised p-3 text-center">
            <span className="size-10 mx-auto rounded-full grid place-items-center font-extrabold text-[12px]" style={{ background: c.col, color: "#0b1330" }}>{c.s[0]}</span>
            <div className="font-extrabold text-[13px] mt-1.5">{c.s}</div>
            <div className={cn("num text-[11px] font-extrabold", c.c >= 0 ? "text-bull" : "text-bear")}>{c.c >= 0 ? "+" : ""}{c.c}%</div>
            <div className="text-[9px] font-extrabold text-dim uppercase">{c.k}</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* =========================================================
   4. STAGGER PATTERNS
   ========================================================= */
function StaggerList() {
  const [mode, setMode] = useState("cascade");
  const [k, setK] = useState(0);
  const N = 12;
  const delay = (i: number) => {
    const col = i % 4, row = Math.floor(i / 4);
    if (mode === "cascade") return i * 55;
    if (mode === "wave") return (Math.abs(col - 1.5) + Math.abs(row - 1)) * 90;
    if (mode === "diagonal") return (col + row) * 80;
    return ((i * 7919) % 13) * 50;
  };
  return (
    <Asset title="Stagger Patterns" id="trn.stagger" desc="4 паттерна задержек появления: каскад, волна от центра, диагональ, случайно.">
      <Segmented value={mode} onChange={(v) => { setMode(v); setK(k + 1); sfx.tick(); }} size="sm" className="mb-4" options={[{ value: "cascade", label: "Cascade" }, { value: "wave", label: "Wave" }, { value: "diagonal", label: "Diag" }, { value: "random", label: "Rand" }]} />
      <div key={k + mode} className="grid grid-cols-4 gap-2">
        {Array.from({ length: N }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl grid place-items-center" style={{ background: `hsl(${210 + i * 8} 60% ${22 + (i % 3) * 4}%)`, animation: `scale-in .5s cubic-bezier(.3,1.5,.5,1) ${delay(i)}ms both`, boxShadow: "0 3px 0 rgba(0,0,0,.35)" }}>
            <Glyph name={(["coin", "gem", "star", "bolt"] as G[])[i % 4]} size={22} />
          </div>
        ))}
      </div>
      <Btn3D size="xs" variant="neutral" className="mt-3" icon={<Icon name="refresh" size={12} />} onClick={() => setK(k + 1)}>Replay</Btn3D>
    </Asset>
  );
}

/* =========================================================
   5. MORPHING BUTTON
   ========================================================= */
function MorphButton() {
  const [st, setSt] = useState<"idle" | "load" | "done" | "fail">("idle");
  const run = (fail: boolean, e: React.MouseEvent) => {
    if (st !== "idle") return;
    const r = e.currentTarget.getBoundingClientRect();
    setSt("load"); sfx.tap();
    setTimeout(() => {
      setSt(fail ? "fail" : "done");
      if (fail) { sfx.error(); haptic([30, 30]); } else { sfx.success(); burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 30, 0.7); }
      setTimeout(() => setSt("idle"), 1700);
    }, 1400);
  };
  const W = st === "idle" ? 240 : 56;
  const bg = st === "done" ? "linear-gradient(180deg,#5af5b4,#1fdb8b)" : st === "fail" ? "linear-gradient(180deg,#ff7c93,#ff4d6a)" : "linear-gradient(180deg,#6a9dff,#3d7bff)";
  const lip = st === "done" ? "#0d9a5c" : st === "fail" ? "#c0253f" : "#2250c2";
  return (
    <Asset title="Morphing Button" id="trn.morph" desc="Кнопка превращается: текст → круг со спиннером → галочка/крестик с цветом → обратно. Ширина, радиус и цвет интерполируются.">
      <div className="h-[140px] grid place-items-center">
        <button onClick={(e) => run(false, e)} className="h-14 text-white font-extrabold uppercase tracking-wider text-[13px] grid place-items-center overflow-hidden"
          style={{ width: W, borderRadius: st === "idle" ? 18 : 28, background: bg, boxShadow: `0 5px 0 ${lip}, 0 14px 24px -6px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.3)`, transition: "width .45s cubic-bezier(.3,1.3,.5,1), border-radius .45s, background .3s, box-shadow .3s" }}>
          {st === "idle" && <span className="anim-fade whitespace-nowrap">Place order</span>}
          {st === "load" && <Spinner size={22} />}
          {st === "done" && <Icon name="check" size={26} stroke={3.4} className="anim-pop text-ink-900" />}
          {st === "fail" && <Icon name="x" size={24} stroke={3.4} className="anim-pop" />}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Btn3D size="xs" variant="bull" onClick={(e) => run(false, e)}>Success path</Btn3D>
        <Btn3D size="xs" variant="bear" onClick={(e) => run(true, e)}>Fail path</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   6. GOOEY TABS (stretch indicator + directional content)
   ========================================================= */
function GooeyTabs() {
  const TABS = [
    { t: "Overview", g: "chart", body: "Цена, объём и настроение рынка за 24 часа." },
    { t: "Lessons", g: "book", body: "Три незавершённых урока ждут тебя." },
    { t: "League", g: "trophy", body: "Ты на 3 месте Sapphire League." },
    { t: "Wallet", g: "wallet", body: "Демо-баланс: $12 480. Открытых позиций: 2." },
  ];
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(0);
  const dir = i >= prev ? 1 : -1;
  const L = (i * 100) / TABS.length, R = 100 - ((i + 1) * 100) / TABS.length;
  const content = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { content.current?.animate([{ transform: `translateX(${dir * 40}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 380, easing: "cubic-bezier(.3,1.2,.5,1)" }); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Asset title="Gooey Tabs" id="trn.tabs" desc="Индикатор «тянется»: ведущий край движется быстрее, хвост догоняет. Контент въезжает с учётом направления.">
      <div className="relative inset !rounded-2xl p-1.5 grid grid-cols-4">
        <div className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-b from-[#6a9dff] to-[#3d7bff] shadow-[0_3px_0_#2250c2]"
          style={{ left: `calc(${L}% + 6px)`, right: `calc(${R}% + 6px)`, transition: dir > 0 ? "right .25s cubic-bezier(.3,1.2,.5,1), left .45s cubic-bezier(.3,1.2,.5,1) .05s" : "left .25s cubic-bezier(.3,1.2,.5,1), right .45s cubic-bezier(.3,1.2,.5,1) .05s" }} />
        {TABS.map((t, k) => (
          <button key={t.t} onClick={() => { setPrev(i); setI(k); sfx.tick(); }} className={cn("relative z-10 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] font-extrabold transition-colors", k === i ? "text-white" : "text-mute")}>
            <Icon name={t.g} size={16} />{t.t}
          </button>
        ))}
      </div>
      <div ref={content} key={i} className="raised p-4 mt-4 min-h-[96px]">
        <div className="flex items-center gap-2 font-extrabold text-[15px]"><Icon name={TABS[i].g} size={18} className="text-blue" />{TABS[i].t}</div>
        <p className="text-[12.5px] text-mute mt-1.5">{TABS[i].body}</p>
      </div>
    </Asset>
  );
}

/* =========================================================
   7. CIRCULAR THEME REVEAL
   ========================================================= */
const THEMES = [
  { n: "Sapphire", a: "#3d7bff", b: "#8d5cff" },
  { n: "Emerald", a: "#1fdb8b", b: "#2ed3f0" },
  { n: "Ruby", a: "#ff4d6a", b: "#ff8a3d" },
  { n: "Gold", a: "#ffc53d", b: "#ff8a3d" },
];
function ThemeCard({ t }: { t: (typeof THEMES)[0] }) {
  return (
    <div className="absolute inset-0 p-4 flex flex-col" style={{ background: `radial-gradient(circle at 80% 0%, ${t.a}40, #0a1330 65%)` }}>
      <div className="flex items-center justify-between"><span className="font-extrabold">Portfolio</span><Badge tone="neutral" size="xs">{t.n}</Badge></div>
      <div className="num text-[28px] font-extrabold mt-2" style={{ color: t.a }}>$24,817</div>
      <svg viewBox="0 0 200 60" className="w-full h-16 mt-1"><polyline points="0,50 25,44 50,48 75,30 100,34 125,18 150,24 175,10 200,6" fill="none" stroke={t.a} strokeWidth="3" strokeLinejoin="round" /></svg>
      <div className="mt-auto h-11 rounded-2xl grid place-items-center font-extrabold text-[13px] text-ink-900" style={{ background: `linear-gradient(90deg, ${t.a}, ${t.b})`, boxShadow: `0 4px 0 rgba(0,0,0,.35)` }}>Trade now</div>
    </div>
  );
}
function ThemeReveal() {
  const [cur, setCur] = useState(0);
  const [next, setNext] = useState<number | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 50, y: 50 });
  const pick = (i: number, e: React.MouseEvent) => {
    if (i === cur || next !== null) return;
    const h = host.current!.getBoundingClientRect();
    pos.current = { x: e.clientX - h.left, y: e.clientY - h.top };
    setNext(i); sfx.whoosh(); haptic(8);
  };
  useLayoutEffect(() => {
    if (next === null || !layer.current) return;
    const { x, y } = pos.current;
    const a = layer.current.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(600px at ${x}px ${y}px)` }], { duration: 650, easing: "cubic-bezier(.4,0,.2,1)", fill: "both" });
    a.onfinish = () => { setCur(next); setNext(null); };
  }, [next]);
  return (
    <Asset title="Circular Theme Reveal" id="trn.theme" desc="Смена акцентной темы: новый слой раскрывается кругом из точки клика (clip-path), как в Telegram.">
      <div ref={host} className="relative h-[230px] rounded-2xl overflow-hidden border border-white/10">
        <ThemeCard t={THEMES[cur]} />
        {next !== null && <div ref={layer} className="absolute inset-0"><ThemeCard t={THEMES[next]} /></div>}
        <div className="absolute bottom-[68px] right-3 flex gap-2 z-10">
          {THEMES.map((t, i) => (
            <button key={t.n} onClick={(e) => pick(i, e)} className={cn("size-8 rounded-full border-[3px] transition-transform hover:scale-110", (next ?? cur) === i ? "border-white scale-110" : "border-white/20")} style={{ background: `linear-gradient(135deg, ${t.a}, ${t.b})` }} aria-label={t.n} />
          ))}
        </div>
      </div>
    </Asset>
  );
}

export default function Transitions() {
  return (
    <Section id="transitions" index="15" title="Transitions" subtitle="Переходы и layout-анимации: экраны, shared element, FLIP-сетка, стаггер, морфинг, gooey-табы, circular reveal" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <ScreenTransitions />
        <SharedExpand />
        <MorphButton />
        <FlipGrid />
        <StaggerList />
        <GooeyTabs />
        <ThemeReveal />
      </div>
    </Section>
  );
}
