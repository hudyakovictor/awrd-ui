import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section, Spinner, useToast } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { MASCOT_IMG } from "./Mascot";
import { Phone } from "./Screens";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstConfetti, burstSparks, burstStars, burstText, flash, shake } from "../utils/fx";
import { clamp, rubber, useDrag } from "../hooks/motion";

/* helpers (shared candle generator/renderer for gesture demos) */
type Cd = { o: number; c: number; h: number; l: number };
function genSeries(n: number, bias: number, seed = Math.random()): Cd[] {
  let p = 100 + seed * 10;
  return Array.from({ length: n }, (_, i) => {
    const o = p;
    const c = o * (1 + (Math.random() - 0.5 + (i > n * 0.6 ? bias : 0)) * 0.045);
    p = c;
    return { o, c, h: Math.max(o, c) * (1 + Math.random() * 0.012), l: Math.min(o, c) * (1 - Math.random() * 0.012) };
  });
}
function Candles({ data, w = 260, h = 120, cut }: { data: Cd[]; w?: number; h?: number; cut?: number }) {
  const mx = Math.max(...data.map((d) => d.h)), mn = Math.min(...data.map((d) => d.l));
  const cw = w / data.length;
  const y = (v: number) => 4 + ((mx - v) / (mx - mn || 1)) * (h - 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      {data.map((d, i) => {
        const col = d.c >= d.o ? "#1fdb8b" : "#ff4d6a";
        const hidden = cut !== undefined && i >= cut;
        return (
          <g key={i} opacity={hidden ? 0 : 1}>
            <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.2" />
            <rect x={i * cw + cw * 0.18} y={y(Math.max(d.o, d.c))} width={cw * 0.64} height={Math.max(1.2, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="1" />
          </g>
        );
      })}
      {cut !== undefined && <line x1={cut * cw} x2={cut * cw} y1="0" y2={h} stroke="rgba(255,255,255,.35)" strokeDasharray="3 3" />}
    </svg>
  );
}

/* =========================================================
   1. BULL OR BEAR — Tinder-style swipe game
   ========================================================= */
const SYMS = ["BTC", "ETH", "SOL", "DOGE", "AVAX", "LINK", "ARB", "PEPE"];
type Deal = { sym: string; data: Cd[]; answer: "bull" | "bear" };
const mkDeal = (): Deal => { const bull = Math.random() > 0.5; return { sym: SYMS[(Math.random() * SYMS.length) | 0], data: genSeries(28, bull ? 0.28 : -0.28), answer: bull ? "bull" : "bear" }; };
function BullBear() {
  const [deck, setDeck] = useState<Deal[]>(() => [mkDeal(), mkDeal(), mkDeal()]);
  const [d, setD] = useState({ x: 0, y: 0 });
  const [fly, setFly] = useState<null | "bull" | "bear" | "skip">(null);
  const [reveal, setReveal] = useState(false);
  const [score, setScore] = useState({ w: 0, l: 0, streak: 0 });
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const decide = (dir: "bull" | "bear" | "skip") => {
    if (fly) return;
    const top = deck[0];
    setFly(dir);
    haptic(10);
    if (dir === "skip") { sfx.whoosh(); }
    else {
      const ok = top.answer === dir;
      setVerdict(ok);
      const r = cardRef.current?.getBoundingClientRect();
      if (ok) {
        sfx.success();
        setScore((s) => ({ w: s.w + 1, l: s.l, streak: s.streak + 1 }));
        if (r) { burstConfetti(r.left + r.width / 2, r.top + 40, 26, 0.8); burstText(r.left + r.width / 2, r.top + 20, "+15 XP"); }
      } else {
        sfx.error(); flash(); shake("soft");
        setScore((s) => ({ w: s.w, l: s.l + 1, streak: 0 }));
      }
    }
    setTimeout(() => { setDeck((dk) => [...dk.slice(1), mkDeal()]); setFly(null); setD({ x: 0, y: 0 }); setReveal(false); setVerdict(null); }, 650);
  };
  const ref = useDrag<HTMLDivElement>({
    onMove: (i) => { if (!fly) setD({ x: i.dx, y: i.dy }); },
    onEnd: (i) => {
      if (fly || !i.moved) return;
      if (i.dx > 110 || i.vx > 0.6) decide("bull");
      else if (i.dx < -110 || i.vx < -0.6) decide("bear");
      else if (i.dy < -120 || i.vy < -0.7) decide("skip");
      else setD({ x: 0, y: 0 });
    },
  });
  const top = deck[0];
  const k = clamp(Math.abs(d.x) / 140);
  const flyT = fly === "bull" ? "translate(640px, 40px) rotate(28deg)" : fly === "bear" ? "translate(-640px, 40px) rotate(-28deg)" : fly === "skip" ? "translate(0, -620px)" : `translate(${d.x}px, ${d.y}px) rotate(${d.x * 0.07}deg)`;
  return (
    <Asset title="Bull or Bear · Swipe Game" id="ges.bullbear" desc="Tinder-механика: вправо — рост (Bull), влево — падение (Bear), вверх — пропуск. Штампы проявляются по ходу, фон подсвечивается, следующая карта растёт." className="lg:col-span-2" tags={["GAME"]}>
      <div className="grid md:grid-cols-[1fr_200px] gap-5">
        <div className="relative h-[330px] rounded-3xl overflow-hidden" style={{ background: d.x > 20 ? `rgba(31,219,139,${k * 0.14})` : d.x < -20 ? `rgba(255,77,106,${k * 0.14})` : "transparent", transition: "background .2s" }}>
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none" style={{ opacity: d.x < 0 ? k : 0.15 }}><span className="text-bear font-extrabold text-[12px] [writing-mode:vertical-rl] rotate-180 tracking-[.3em]">BEAR ←</span></div>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none" style={{ opacity: d.x > 0 ? k : 0.15 }}><span className="text-bull font-extrabold text-[12px] [writing-mode:vertical-rl] tracking-[.3em]">→ BULL</span></div>
          <div ref={ref} className="absolute inset-x-10 top-5 bottom-5 select-none cursor-grab active:cursor-grabbing">
            {deck.slice(1, 3).reverse().map((dl, j) => {
              const depth = 2 - j;
              const kk = depth - (fly ? 1 : k);
              return (
                <div key={dl.sym + j + dl.data[0].o} className="absolute inset-0 raised !rounded-3xl p-4 transition-transform duration-300" style={{ transform: `translateY(${Math.max(0, kk) * 12}px) scale(${1 - Math.max(0, kk) * 0.05})`, filter: `brightness(${1 - Math.max(0, kk) * 0.15})` }}>
                  <div className="font-extrabold">{dl.sym}/USDT</div>
                </div>
              );
            })}
            <div ref={cardRef} key={top.sym + top.data[0].o} className="absolute inset-0 raised !rounded-3xl p-4 flex flex-col"
              style={{ transform: flyT, transition: fly ? "transform .55s cubic-bezier(.5,0,.75,.4)" : d.x || d.y ? "none" : "transform .5s cubic-bezier(.3,1.5,.5,1)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="size-8 rounded-full bg-[#f7931a] grid place-items-center text-ink-900 font-extrabold text-[12px]">{top.sym[0]}</span><div><div className="font-extrabold text-[14px]">{top.sym}/USDT</div><div className="text-[10px] text-dim font-bold">1H · что дальше?</div></div></div>
                <button data-nodrag onClick={() => { setReveal(!reveal); sfx.tap(); }} className="text-[10px] font-extrabold text-blue bg-blue/10 rounded-lg px-2 py-1">{reveal ? "Hide" : "Hint"}</button>
              </div>
              <div className="flex-1 mt-3 inset !rounded-2xl p-2"><Candles data={top.data} cut={reveal || fly ? undefined : 18} /></div>
              <div className="absolute top-14 left-5 rotate-[-14deg] border-4 border-bull text-bull rounded-xl px-3 py-1 font-extrabold text-[26px] tracking-wider pointer-events-none" style={{ opacity: fly === "bull" ? 1 : clamp(d.x / 110) }}>BULL</div>
              <div className="absolute top-14 right-5 rotate-[14deg] border-4 border-bear text-bear rounded-xl px-3 py-1 font-extrabold text-[26px] tracking-wider pointer-events-none" style={{ opacity: fly === "bear" ? 1 : clamp(-d.x / 110) }}>BEAR</div>
              {verdict !== null && <div className={cn("absolute inset-x-0 bottom-4 mx-auto w-fit px-3 py-1.5 rounded-xl font-extrabold text-[12px] anim-pop", verdict ? "bg-bull text-ink-900" : "bg-bear text-white")}>{verdict ? "Верно!" : `Нет — это был ${top.answer.toUpperCase()}`}</div>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="inset !rounded-xl p-2"><div className="num text-[18px] font-extrabold text-bull">{score.w}</div><div className="label-caps !mb-0">Win</div></div>
            <div className="inset !rounded-xl p-2"><div className="num text-[18px] font-extrabold text-bear">{score.l}</div><div className="label-caps !mb-0">Loss</div></div>
            <div className="inset !rounded-xl p-2"><div className="num text-[18px] font-extrabold text-gold flex items-center justify-center gap-0.5"><Glyph name="flame" size={14} />{score.streak}</div><div className="label-caps !mb-0">Streak</div></div>
          </div>
          <div className="text-[11.5px] text-mute font-semibold leading-snug">Смотрите на последние свечи и объём тела. Серия верных ответов = комбо XP.</div>
          <div className="mt-auto grid grid-cols-3 gap-2">
            <Btn3D round size="lg" variant="bear" className="w-full" sound="none" onClick={() => decide("bear")}><Icon name="arrowDown" size={22} stroke={3} /></Btn3D>
            <Btn3D round size="lg" variant="neutral" className="w-full" sound="none" onClick={() => decide("skip")}><Icon name="chevU" size={22} stroke={3} /></Btn3D>
            <Btn3D round size="lg" variant="bull" className="w-full" sound="none" onClick={() => decide("bull")}><Icon name="arrowUp" size={22} stroke={3} /></Btn3D>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. SWIPE-ACTION LIST
   ========================================================= */
type Row = { id: number; s: string; t: string; p: string; c: number; fav: boolean };
function SwipeRow({ r, onDelete, onFav, onArchive }: { r: Row; onDelete: () => void; onFav: () => void; onArchive: () => void }) {
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [gone, setGone] = useState(false);
  const base = useRef(0);
  const ref = useDrag<HTMLDivElement>({
    onStart: () => { base.current = x; setDrag(true); },
    onMove: (d) => { let nx = base.current + d.dx; if (nx > 110) nx = 110 + rubber(nx - 110, 120); if (nx < -260) nx = -260 + rubber(nx + 260, 120); setX(nx); },
    onEnd: (d) => {
      setDrag(false);
      const nx = base.current + d.dx;
      if (nx < -220 || d.vx < -1.2) { setX(-600); setGone(true); sfx.whoosh(); haptic(20); setTimeout(onDelete, 320); }
      else if (nx < -60) { setX(-150); sfx.tick(); }
      else if (nx > 80) { onFav(); setX(0); sfx.pop(); haptic(10); }
      else setX(0);
    },
  }, "x");
  const leftK = clamp(x / 80), rightK = clamp(-x / 150);
  return (
    <div className="grid transition-all duration-300" style={{ gridTemplateRows: gone ? "0fr" : "1fr", opacity: gone ? 0 : 1, marginBottom: gone ? 0 : 8 }}>
      <div className="overflow-hidden rounded-2xl relative">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-gold flex items-center pl-5 text-ink-900" style={{ opacity: leftK }}><Icon name="star" size={22} className={cn("transition-transform", leftK >= 1 && "scale-125")} /><span className="ml-2 text-[12px] font-extrabold">{r.fav ? "Unfav" : "Favorite"}</span></div>
          <div className="flex-1 flex justify-end" style={{ opacity: rightK > 0 ? 1 : 0 }}>
            <button data-nodrag onClick={() => { onArchive(); setX(0); }} className="w-[75px] bg-blue grid place-items-center"><Icon name="folder" size={20} /></button>
            <button data-nodrag onClick={() => { setX(-600); setGone(true); setTimeout(onDelete, 320); }} className="bg-bear grid place-items-center transition-all" style={{ width: Math.max(75, -x - 75) }}><Icon name="x" size={20} stroke={3} /></button>
          </div>
        </div>
        <div ref={ref} className="relative raised !rounded-2xl p-3 flex items-center gap-3 select-none" style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : "transform .4s cubic-bezier(.3,1.3,.5,1)" }}>
          <span className="size-10 rounded-full grid place-items-center font-extrabold text-[12px] bg-[#1c3068]">{r.s[0]}</span>
          <div className="flex-1 min-w-0"><div className="font-extrabold text-[13px] flex items-center gap-1.5">{r.s}{r.fav && <Icon name="star" size={12} className="text-gold fill-current anim-pop" />}</div><div className="text-[11px] text-dim truncate">{r.t}</div></div>
          <div className="text-right"><div className="num text-[13px] font-bold">${r.p}</div><div className={cn("num text-[11px] font-extrabold", r.c >= 0 ? "text-bull" : "text-bear")}>{r.c >= 0 ? "+" : ""}{r.c}%</div></div>
        </div>
      </div>
    </div>
  );
}
function SwipeList() {
  const toast = useToast();
  const START: Row[] = [
    { id: 1, s: "BTC", t: "Bitcoin · Spot", p: "67,420", c: 2.4, fav: true }, { id: 2, s: "ETH", t: "Ethereum · Spot", p: "3,512", c: -1.1, fav: false },
    { id: 3, s: "SOL", t: "Solana · Perp", p: "172.4", c: 6.8, fav: false }, { id: 4, s: "DOGE", t: "Dogecoin · Spot", p: "0.161", c: 11.4, fav: false },
    { id: 5, s: "LINK", t: "Chainlink · Spot", p: "14.20", c: -2.3, fav: false },
  ];
  const [rows, setRows] = useState(START);
  return (
    <Asset title="Swipe Actions List" id="ges.swipelist" desc="Вправо — в избранное, влево — открыть действия, длинный свайп влево — удалить. Резинка на краях, схлопывание строки.">
      <div className="flex items-center justify-between mb-3 text-[11px] font-bold text-dim"><span>← удалить · избранное →</span>{rows.length < START.length && <button onClick={() => { setRows(START); sfx.pop(); }} className="text-blue">Restore</button>}</div>
      {rows.map((r) => (
        <SwipeRow key={r.id} r={r}
          onDelete={() => { setRows((rs) => rs.filter((x) => x.id !== r.id)); toast({ type: "info", title: `${r.s} удалён из watchlist`, dur: 2200 }); }}
          onFav={() => setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, fav: !x.fav } : x)))}
          onArchive={() => toast({ type: "success", title: `${r.s} в архиве`, dur: 2000 })} />
      ))}
      {!rows.length && <div className="text-center text-dim text-[12px] py-8">Пусто. Нажмите Restore.</div>}
    </Asset>
  );
}

/* =========================================================
   3. PULL TO REFRESH
   ========================================================= */
const NEWS = ["SEC одобрила новый спотовый ETF", "Solana обновила рекорд TPS", "Киты накопили 40k BTC за неделю", "Ethereum: газ упал до минимума года", "Биржевые резервы BTC — минимум 5 лет", "Стейблкоины: капитализация $180B"];
function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState(NEWS.slice(0, 4).map((t, i) => ({ id: i, t, fresh: false })));
  const scroller = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const TH = 70;
  const ref = useDrag<HTMLDivElement>({
    onStart: () => { active.current = (scroller.current?.scrollTop ?? 0) <= 0 && !loading; },
    onMove: (d) => { if (!active.current) return; const p = d.dy > 0 ? rubber(d.dy, 160, 0.7) : 0; if (p > TH && pull <= TH) { sfx.tick(); haptic(10); } setPull(p); },
    onEnd: () => {
      if (!active.current) return;
      active.current = false;
      if (pull > TH) {
        setLoading(true); setPull(56); sfx.whoosh();
        setTimeout(() => {
          const n = NEWS[(Math.random() * NEWS.length) | 0];
          setItems((it) => [{ id: Date.now(), t: n, fresh: true }, ...it.map((x) => ({ ...x, fresh: false }))].slice(0, 7));
          setLoading(false); setPull(0); sfx.success();
        }, 1300);
      } else setPull(0);
    },
  }, "y");
  const k = clamp(pull / TH);
  return (
    <Asset title="Pull to Refresh" id="ges.ptr" desc="Тяните ленту новостей вниз: сопротивление, спиннер крутится от величины натяжения, порог с хаптиком, новая новость въезжает сверху.">
      <Phone>
        <div className="absolute inset-0 flex flex-col pt-8">
          <div className="px-4 pb-2 flex items-center justify-between"><span className="font-extrabold text-[15px]">News</span><Badge tone="bull" dot size="xs">Live</Badge></div>
          <div ref={ref} className="relative flex-1 overflow-hidden select-none">
            <div className="absolute inset-x-0 top-0 flex justify-center pointer-events-none" style={{ height: pull, opacity: k }}>
              <div className="mt-3 size-9 rounded-full bg-[#1c3068] grid place-items-center shadow-[0_3px_0_#0b1536]" style={{ transform: `scale(${0.5 + k * 0.5})` }}>
                {loading ? <Spinner size={18} className="text-bull" /> : <Icon name="refresh" size={18} className={k >= 1 ? "text-bull" : "text-mute"} style={{ transform: `rotate(${pull * 4}deg)` }} />}
              </div>
            </div>
            <div ref={scroller} className="absolute inset-0 overflow-y-auto px-3 [scrollbar-width:none]" style={{ transform: `translateY(${pull}px)`, transition: active.current ? "none" : "transform .45s cubic-bezier(.3,1.3,.5,1)" }}>
              {items.map((it) => (
                <div key={it.id} className={cn("raised !rounded-2xl p-3 mb-2 flex gap-2.5", it.fresh && "ring-2 ring-bull/60 anim-scale")}>
                  <span className="size-9 shrink-0 rounded-xl bg-ink-850 grid place-items-center"><Icon name="info" size={16} className="text-cyan" /></span>
                  <div><div className="text-[12px] font-extrabold leading-snug">{it.t}</div><div className="text-[10px] text-dim font-bold mt-0.5">{it.fresh ? "только что" : "12 мин назад"}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Phone>
    </Asset>
  );
}

/* =========================================================
   4. LONG-PRESS RADIAL MENU
   ========================================================= */
const RAD = [{ i: "arrowUp", l: "Buy", c: "#1fdb8b" }, { i: "arrowDown", l: "Sell", c: "#ff4d6a" }, { i: "bell", l: "Alert", c: "#ffc53d" }, { i: "star", l: "Fav", c: "#8d5cff" }, { i: "send", l: "Share", c: "#2ed3f0" }, { i: "chart", l: "Chart", c: "#3d7bff" }];
function RadialMenu() {
  const [open, setOpen] = useState(false);
  const [hold, setHold] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const center = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const start = useRef(0);
  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = performance.now();
    const loop = () => {
      const p = clamp((performance.now() - start.current) / 380);
      setHold(p);
      if (p >= 1) { setOpen(true); sfx.pop(); haptic(20); return; }
      timer.current = requestAnimationFrame(loop);
    };
    timer.current = requestAnimationFrame(loop);
  };
  const move = (e: React.PointerEvent) => {
    if (!open || !center.current) return;
    const r = center.current.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 30) { if (sel !== null) setSel(null); return; }
    let a = Math.atan2(dy, dx) + Math.PI / 2;
    if (a < 0) a += Math.PI * 2;
    const k = Math.round(a / ((Math.PI * 2) / RAD.length)) % RAD.length;
    if (k !== sel) { setSel(k); sfx.tick(); haptic(5); }
  };
  const up = () => {
    cancelAnimationFrame(timer.current);
    setHold(0);
    if (open && sel !== null) { setPicked(RAD[sel].l); setOpen(false); setSel(null); sfx.success(); const r = center.current?.getBoundingClientRect(); if (r) burstSparks(r.left + r.width / 2, r.top + r.height / 2, 20, RAD[sel].c); }
  };
  return (
    <Asset title="Long-Press Radial Menu" id="ges.radial" desc="Удерживайте монету 0.4с → колесо действий (как weapon wheel в играх). Не отпуская, ведите к пункту и отпустите.">
      <div className="relative h-[270px] grid place-items-center select-none touch-none">
        {RAD.map((it, k) => {
          const a = (k / RAD.length) * Math.PI * 2 - Math.PI / 2;
          const on = sel === k;
          return (
            <div key={it.l} className="absolute left-1/2 top-1/2 pointer-events-none" style={{ transform: open ? `translate(calc(-50% + ${Math.cos(a) * 92}px), calc(-50% + ${Math.sin(a) * 92}px)) scale(${on ? 1.2 : 1})` : "translate(-50%,-50%) scale(0.2)", opacity: open ? 1 : 0, transition: `transform .4s cubic-bezier(.3,1.6,.5,1) ${open ? k * 30 : 0}ms, opacity .2s` }}>
              <span className="size-14 rounded-2xl grid place-items-center flex-col" style={{ background: on ? it.c : "#1c3068", color: on ? "#071022" : it.c, boxShadow: on ? `0 0 24px ${it.c}, 0 4px 0 rgba(0,0,0,.4)` : "0 4px 0 #0b1536" }}>
                <Icon name={it.i} size={20} stroke={2.6} />
                <span className="text-[8.5px] font-extrabold">{it.l}</span>
              </span>
            </div>
          );
        })}
        <div ref={center} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} className="relative size-24 rounded-full grid place-items-center cursor-pointer">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 96 96"><circle cx="48" cy="48" r="44" fill="none" stroke="#ffc53d" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${hold * 276} 276`} /></svg>
          <div className={cn("size-20 rounded-full bg-gradient-to-b from-[#2a4185] to-[#16275a] grid place-items-center shadow-[0_5px_0_#0b1536] transition-transform", (hold > 0 || open) && "scale-90")}><Glyph name="coin" size={46} /></div>
        </div>
        {open && <div className="absolute size-[250px] rounded-full border-2 border-dashed border-white/10 pointer-events-none anim-scale" />}
      </div>
      <div className="inset p-3 text-center text-[12.5px] font-bold min-h-[44px]">
        {picked ? <span key={picked} className="anim-pop inline-block">Выбрано: <span className="text-gold">{picked}</span></span> : <span className="text-dim">{open ? "Ведите к действию и отпустите" : "Нажмите и удерживайте монету"}</span>}
      </div>
    </Asset>
  );
}

/* =========================================================
   5. DRAG REORDER
   ========================================================= */
function ReorderList() {
  const H = 58;
  const [list, setList] = useState([
    { id: "btc", s: "BTC", n: "Bitcoin", c: "#f7931a" }, { id: "eth", s: "ETH", n: "Ethereum", c: "#8c8cff" }, { id: "sol", s: "SOL", n: "Solana", c: "#14f195" },
    { id: "avax", s: "AVAX", n: "Avalanche", c: "#ff4d6a" }, { id: "link", s: "LINK", n: "Chainlink", c: "#3d7bff" },
  ]);
  const [drag, setDrag] = useState<{ i: number; dy: number } | null>(null);
  const startY = useRef(0);
  const target = drag ? clamp(Math.round(drag.i + drag.dy / H), 0, list.length - 1) : -1;
  const lastT = useRef(-1);
  useEffect(() => { if (target >= 0 && target !== lastT.current) { lastT.current = target; sfx.tick(); haptic(4); } }, [target]);
  return (
    <Asset title="Drag to Reorder" id="ges.reorder" desc="Ранжируйте свой watchlist: тяните за ручку, остальные строки плавно расступаются, при отпускании — снап на место.">
      <div className="relative select-none" style={{ height: list.length * H }}>
        {list.map((it, i) => {
          let y = i * H;
          const isD = drag?.i === i;
          if (drag && !isD) {
            if (drag.i < target && i > drag.i && i <= target) y -= H;
            if (drag.i > target && i < drag.i && i >= target) y += H;
          }
          if (isD && drag) y = i * H + drag.dy;
          return (
            <div key={it.id} className={cn("absolute inset-x-0 h-[50px] raised !rounded-2xl flex items-center gap-3 px-3", isD && "ring-2 ring-blue shadow-[0_18px_30px_rgba(0,0,0,.5)]")}
              style={{ transform: `translateY(${y}px) scale(${isD ? 1.04 : 1})`, transition: isD ? "none" : "transform .3s cubic-bezier(.3,1.3,.5,1)", zIndex: isD ? 20 : 1 }}>
              <span className="num w-5 text-center text-[12px] font-extrabold text-mute">{(drag ? (isD ? target : i) : i) + 1}</span>
              <span className="size-8 rounded-full grid place-items-center text-[11px] font-extrabold" style={{ background: it.c, color: "#0b1330" }}>{it.s[0]}</span>
              <div className="flex-1"><div className="text-[13px] font-extrabold">{it.s}</div><div className="text-[10.5px] text-dim">{it.n}</div></div>
              <span className="p-2 cursor-grab active:cursor-grabbing text-dim hover:text-txt touch-none"
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startY.current = e.clientY; setDrag({ i, dy: 0 }); sfx.pop(); haptic(8); }}
                onPointerMove={(e) => { if (drag?.i === i) setDrag({ i, dy: e.clientY - startY.current }); }}
                onPointerUp={() => { if (!drag) return; const t = target; setList((l) => { const n = [...l]; const [m] = n.splice(drag.i, 1); n.splice(t, 0, m); return n; }); setDrag(null); lastT.current = -1; sfx.tap(); }}>
                <Icon name="menu" size={18} />
              </span>
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* =========================================================
   6. SNAP-POINT BOTTOM SHEET
   ========================================================= */
function SnapSheet() {
  const SNAPS = [0.2, 0.52, 0.9];
  const box = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState(0);
  const [dy, setDy] = useState(0);
  const [drag, setDrag] = useState(false);
  const Hc = () => box.current?.clientHeight ?? 500;
  const ref = useDrag<HTMLDivElement>({
    onStart: () => setDrag(true),
    onMove: (d) => setDy(d.dy),
    onEnd: (d) => {
      setDrag(false);
      const h = Hc();
      const cur = SNAPS[snap] - dy / h - d.vy * 0.25;
      let best = 0;
      SNAPS.forEach((s, i) => { if (Math.abs(s - cur) < Math.abs(SNAPS[best] - cur)) best = i; });
      if (best !== snap) { sfx.whoosh(); haptic(8); }
      setSnap(best); setDy(0);
    },
  }, "y");
  const h = Hc();
  const frac = clamp(SNAPS[snap] - dy / h, 0.1, 0.95);
  return (
    <Asset title="Snap Bottom Sheet" id="ges.sheet" desc="3 точки привязки (peek / half / full), учёт скорости броска, фон затемняется и уменьшается пропорционально.">
      <Phone>
        <div ref={box} className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 pt-9 px-3 origin-top transition-transform" style={{ transform: `scale(${1 - frac * 0.08})`, filter: `brightness(${1 - frac * 0.5})`, transition: drag ? "none" : "transform .45s cubic-bezier(.3,1.2,.5,1), filter .45s" }}>
            <div className="font-extrabold text-[15px]">BTC/USDT</div>
            <div className="num text-[24px] font-extrabold text-bull">$67,420</div>
            <div className="inset !rounded-2xl h-40 mt-2 p-1"><Candles data={useMemo(() => genSeries(30, 0.1), [])} /></div>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-[#15254f] rounded-t-[26px] border-t border-white/10 shadow-[0_-12px_30px_rgba(0,0,0,.5)]"
            style={{ height: `${frac * 100}%`, transition: drag ? "none" : "height .45s cubic-bezier(.3,1.2,.5,1)" }}>
            <div ref={ref} className="pt-2.5 pb-2 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-white/25 mx-auto" />
              <div className="flex items-center justify-between px-4 mt-2.5">
                <span className="font-extrabold text-[14px]">Order book</span>
                <div className="flex gap-1">{SNAPS.map((_, i) => <button key={i} data-nodrag onClick={() => { setSnap(i); sfx.tick(); }} className={cn("h-1.5 rounded-full transition-all", snap === i ? "w-5 bg-blue" : "w-1.5 bg-white/25")} />)}</div>
              </div>
            </div>
            <div className="px-3 space-y-1.5 overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="relative flex justify-between px-2 py-1.5 rounded-lg num text-[11px] font-bold overflow-hidden">
                  <div className={cn("absolute inset-y-0 right-0", i < 5 ? "bg-bear/15" : "bg-bull/15")} style={{ width: `${20 + ((i * 37) % 70)}%` }} />
                  <span className={cn("relative", i < 5 ? "text-bear" : "text-bull")}>{(67440 - i * 4.5).toFixed(1)}</span>
                  <span className="relative text-mute">{(0.2 + ((i * 13) % 20) / 10).toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Phone>
    </Asset>
  );
}

/* =========================================================
   7. PINCH / WHEEL ZOOM & PAN CHART
   ========================================================= */
function PinchChart() {
  const data = useMemo(() => genSeries(120, 0.05), []);
  const box = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  const [tx, setTx] = useState(0);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef({ dist: 0, s: 1, tx: 0, x: 0 });
  const W = () => box.current?.clientWidth ?? 600;
  const clampTx = (t: number, sc: number) => clamp(t, -(W() * sc - W()), 0);
  const zoomAt = (cx: number, ns: number) => {
    ns = clamp(ns, 1, 8);
    const r = box.current!.getBoundingClientRect();
    const px = cx - r.left;
    const nt = px - ((px - tx) / s) * ns;
    setS(ns); setTx(clampTx(nt, ns));
  };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wh = (e: WheelEvent) => { e.preventDefault(); zoomAt(e.clientX, s * (e.deltaY < 0 ? 1.15 : 1 / 1.15)); };
    el.addEventListener("wheel", wh, { passive: false });
    return () => el.removeEventListener("wheel", wh);
  });
  const down = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const arr = [...pts.current.values()];
    g.current = { dist: arr.length === 2 ? Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y) : 0, s, tx, x: e.clientX };
  };
  const move = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const arr = [...pts.current.values()];
    if (arr.length === 2 && g.current.dist) {
      const d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      zoomAt((arr[0].x + arr[1].x) / 2, g.current.s * (d / g.current.dist));
    } else if (arr.length === 1) setTx(clampTx(g.current.tx + (e.clientX - g.current.x), s));
  };
  const up = (e: React.PointerEvent) => { pts.current.delete(e.pointerId); const arr = [...pts.current.values()]; if (arr.length === 1) g.current = { dist: 0, s, tx, x: arr[0].x }; };
  const w = W();
  const viewL = clamp(-tx / (w * s)), viewW = 1 / s;
  return (
    <Asset title="Pinch · Zoom · Pan Chart" id="ges.pinch" desc="Два пальца — pinch-zoom вокруг точки, один — панорама, колесо мыши — зум под курсором, двойной клик — сброс. Мини-карта показывает окно." className="lg:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <Badge tone="blue"><span className="num">{s.toFixed(1)}x</span></Badge>
        <div className="flex gap-1.5">
          <Btn3D size="xs" variant="neutral" onClick={() => zoomAt((box.current?.getBoundingClientRect().left ?? 0) + w / 2, s / 1.5)}><Icon name="minus" size={13} stroke={3} /></Btn3D>
          <Btn3D size="xs" variant="neutral" onClick={() => zoomAt((box.current?.getBoundingClientRect().left ?? 0) + w / 2, s * 1.5)}><Icon name="plus" size={13} stroke={3} /></Btn3D>
          <Btn3D size="xs" variant="neutral" onClick={() => { setS(1); setTx(0); }}><Icon name="refresh" size={13} /></Btn3D>
        </div>
      </div>
      <div ref={box} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onDoubleClick={() => { setS(1); setTx(0); sfx.whoosh(); }}
        className="relative h-[220px] inset !rounded-2xl overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing">
        <div className="absolute inset-y-2 left-0 origin-left" style={{ width: w * s, transform: `translateX(${tx}px)` }}><Candles data={data} w={1200} h={200} /></div>
        {s === 1 && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10.5px] font-extrabold text-dim bg-ink-900/70 rounded-lg px-2.5 py-1 pointer-events-none flex items-center gap-1.5"><Icon name="search" size={12} />Колесо / pinch для зума</div>}
      </div>
      <div className="relative h-10 mt-2 inset !rounded-xl overflow-hidden">
        <div className="absolute inset-1 opacity-60"><Candles data={data} w={1200} h={40} /></div>
        <div className="absolute inset-y-0 border-2 border-blue rounded-lg bg-blue/10 transition-[left,width] duration-75" style={{ left: `${viewL * 100}%`, width: `${viewW * 100}%` }} />
      </div>
    </Asset>
  );
}

/* =========================================================
   8. DOUBLE-TAP LIKE
   ========================================================= */
function DoubleTap() {
  const [likes, setLikes] = useState(1284);
  const [liked, setLiked] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; r: number }[]>([]);
  const last = useRef(0);
  const tap = (e: React.PointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    const r = e.currentTarget.getBoundingClientRect();
    if (now - last.current < 300) {
      const id = now;
      setHearts((h) => [...h, { id, x: e.clientX - r.left, y: e.clientY - r.top, r: Math.random() * 30 - 15 }]);
      setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 950);
      if (!liked) { setLiked(true); setLikes((l) => l + 1); }
      burstStars(e.clientX, e.clientY, 6);
      sfx.pop(); haptic(15);
    }
    last.current = now;
  };
  return (
    <Asset title="Double-Tap to Like" id="ges.doubletap" desc="Двойной тап по посту трейдера: сердце в точке касания с наклоном, звёзды, счётчик.">
      <div className="raised !rounded-3xl overflow-hidden">
        <div className="flex items-center gap-2 p-3"><span className="size-8 rounded-full bg-gradient-to-br from-bull to-cyan" /><div className="flex-1"><div className="text-[12.5px] font-extrabold">bulli.trades</div><div className="text-[10px] text-dim">ETH long · +34%</div></div><Icon name="moreH" size={18} className="text-dim" /></div>
        <div onPointerUp={tap} className="relative h-[220px] bg-gradient-to-br from-[#123a5e] to-[#0a1330] select-none cursor-pointer overflow-hidden">
          <img src={MASCOT_IMG.cheer} alt="" className="absolute inset-0 m-auto h-[200px] object-contain pointer-events-none" draggable={false} />
          {hearts.map((h) => <span key={h.id} className="absolute pointer-events-none" style={{ left: h.x, top: h.y, animation: "heart-pop .95s ease-out forwards", rotate: `${h.r}deg` }}><Glyph name="heart" size={96} /></span>)}
          <span className="absolute bottom-2 right-3 text-[10px] font-extrabold text-white/60">double-tap ♥</span>
        </div>
        <div className="flex items-center gap-4 p-3">
          <button onClick={() => { setLiked(!liked); setLikes((l) => l + (liked ? -1 : 1)); sfx.pop(); }} className={cn("transition", liked ? "text-bear" : "text-mute")}><Icon name="heart" size={22} className={liked ? "fill-current anim-pop" : ""} /></button>
          <Icon name="send" size={20} className="text-mute" />
          <span className="ml-auto num text-[12px] font-extrabold">{likes.toLocaleString()} likes</span>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   9. SWIPEABLE TABS (indicator follows finger)
   ========================================================= */
function SwipeTabs() {
  const TABS = [
    { t: "Spot", c: "#1fdb8b", d: "Покупка актива без плеча. Хранишь монеты у себя." },
    { t: "Futures", c: "#ffc53d", d: "Торговля контрактами с плечом до 100x." },
    { t: "Earn", c: "#2ed3f0", d: "Стейкинг и сбережения с фиксированным APY." },
    { t: "P2P", c: "#8d5cff", d: "Сделки напрямую между пользователями." },
  ];
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const ref = useDrag<HTMLDivElement>({
    onMove: (d) => { let x = d.dx; if ((i === 0 && x > 0) || (i === TABS.length - 1 && x < 0)) x = rubber(x, 150); setDx(x); },
    onEnd: (d) => {
      const w = box.current?.clientWidth ?? 300;
      let n = i;
      if (d.dx < -w * 0.25 || d.vx < -0.5) n = i + 1;
      else if (d.dx > w * 0.25 || d.vx > 0.5) n = i - 1;
      n = clamp(n, 0, TABS.length - 1);
      if (n !== i) { sfx.whoosh(); haptic(6); }
      setI(n); setDx(0);
    },
  }, "x");
  const w = box.current?.clientWidth ?? 300;
  const pos = clamp(i - dx / w, 0, TABS.length - 1);
  return (
    <Asset title="Swipeable Tabs" id="ges.tabs" desc="Свайп страниц: индикатор вкладки движется синхронно с пальцем (дробная позиция), цвет интерполируется.">
      <div className="relative flex border-b-2 border-[#1c3068] mb-3">
        {TABS.map((t, k) => <button key={t.t} onClick={() => { setI(k); sfx.tick(); }} className={cn("flex-1 pb-2.5 text-[12.5px] font-extrabold transition-colors", Math.round(pos) === k ? "text-txt" : "text-dim")}>{t.t}</button>)}
        <span className="absolute -bottom-[2px] h-[3px] rounded-full" style={{ width: `${100 / TABS.length}%`, left: `${(pos * 100) / TABS.length}%`, background: TABS[Math.round(pos)].c, transition: dx ? "none" : "left .35s cubic-bezier(.3,1.3,.5,1), background .3s", boxShadow: `0 0 12px ${TABS[Math.round(pos)].c}` }} />
      </div>
      <div ref={box} className="overflow-hidden rounded-2xl select-none">
        <div ref={ref} className="flex cursor-grab active:cursor-grabbing" style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))`, transition: dx ? "none" : "transform .4s cubic-bezier(.3,1.2,.5,1)" }}>
          {TABS.map((t) => (
            <div key={t.t} className="w-full shrink-0 p-5 h-[170px] flex flex-col justify-end rounded-2xl" style={{ background: `linear-gradient(160deg, ${t.c}33, #0a1330 80%)` }}>
              <div className="text-[26px] font-extrabold" style={{ color: t.c }}>{t.t}</div>
              <div className="text-[12.5px] text-mute font-semibold">{t.d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center text-[10.5px] text-dim font-bold mt-2 num">{(pos + 1).toFixed(2)} / {TABS.length}</div>
      <span className="hidden">{w}</span>
    </Asset>
  );
}

/* =========================================================
   10. DRAG ORDERS TO CHART ZONES (educational DnD)
   ========================================================= */
const CHIPS = [
  { id: "bl", t: "Buy Limit", zone: "below", c: "#1fdb8b" }, { id: "sl", t: "Sell Limit", zone: "above", c: "#ff4d6a" },
  { id: "bs", t: "Buy Stop", zone: "above", c: "#1fdb8b" }, { id: "ss", t: "Sell Stop", zone: "below", c: "#ff4d6a" },
];
function DragChip({ chip, placed, onDrop }: { chip: (typeof CHIPS)[0]; placed: boolean; onDrop: (x: number, y: number) => boolean }) {
  const [p, setP] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);
  const [bad, setBad] = useState(0);
  const ref = useDrag<HTMLDivElement>({
    onStart: () => { if (!placed) { setDrag(true); sfx.pop(); } },
    onMove: (d) => { if (!placed) setP({ x: d.dx, y: d.dy }); },
    onEnd: (d) => { setDrag(false); if (placed) return; const ok = onDrop(d.x, d.y); if (!ok) { setBad((b) => b + 1); } setP({ x: 0, y: 0 }); },
  });
  return (
    <div ref={ref} key={bad} className={cn("relative h-10 px-3 rounded-xl flex items-center gap-1.5 text-[12px] font-extrabold select-none", placed ? "opacity-25 pointer-events-none" : "cursor-grab active:cursor-grabbing", bad && "anim-shake")}
      style={{ transform: `translate(${p.x}px, ${p.y}px) scale(${drag ? 1.1 : 1}) rotate(${drag ? p.x * 0.03 : 0}deg)`, transition: drag ? "none" : "transform .4s cubic-bezier(.3,1.5,.5,1)", zIndex: drag ? 50 : 1, background: `${chip.c}22`, border: `2px solid ${chip.c}88`, color: chip.c, boxShadow: drag ? "0 16px 30px rgba(0,0,0,.5)" : "0 3px 0 rgba(0,0,0,.3)" }}>
      <Icon name={chip.zone === "above" ? "arrowUp" : "arrowDown"} size={13} stroke={3} />{chip.t}
    </div>
  );
}
function DropZones() {
  const above = useRef<HTMLDivElement>(null);
  const below = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Record<string, "above" | "below">>({});
  const [hover] = useState<null | string>(null);
  const done = Object.keys(placed).length === CHIPS.length;
  const tryDrop = (chip: (typeof CHIPS)[0], x: number, y: number) => {
    const hit = (el: HTMLDivElement | null) => { if (!el) return false; const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
    const z = hit(above.current) ? "above" : hit(below.current) ? "below" : null;
    if (!z) return false;
    if (z !== chip.zone) { sfx.error(); shake("soft"); haptic([30, 20, 30]); return false; }
    setPlaced((p) => ({ ...p, [chip.id]: z }));
    sfx.success(); haptic(15);
    burstSparks(x, y, 18, chip.c);
    if (Object.keys(placed).length + 1 === CHIPS.length) setTimeout(() => burstConfetti(x, y, 50, 1), 150);
    return true;
  };
  return (
    <Asset title="Drag Orders to Zones" id="ges.dnd" desc="Обучающий drag-and-drop: перетащите тип ордера в правильную зону относительно текущей цены. Неверно — отскок и тряска.">
      <div className="relative h-[210px] inset !rounded-2xl overflow-hidden">
        <div ref={above} className={cn("absolute inset-x-0 top-0 h-[46%] border-b border-dashed border-white/15 p-2 flex flex-wrap gap-1.5 content-start", hover === "above" && "bg-white/5")}>
          <span className="absolute right-2 top-2 text-[9.5px] font-extrabold uppercase text-dim">Выше цены</span>
          {CHIPS.filter((c) => placed[c.id] === "above").map((c) => <span key={c.id} className="h-7 px-2 rounded-lg text-[10.5px] font-extrabold grid place-items-center anim-pop" style={{ background: `${c.c}33`, color: c.c }}>{c.t}</span>)}
        </div>
        <div className="absolute inset-x-0 top-[46%] h-[8%] flex items-center">
          <div className="flex-1 h-[2px] bg-gold" />
          <span className="num text-[10.5px] font-extrabold bg-gold text-ink-900 rounded px-1.5 mx-1">$67,420</span>
        </div>
        <div ref={below} className={cn("absolute inset-x-0 bottom-0 h-[46%] border-t border-dashed border-white/15 p-2 pt-6 flex flex-wrap gap-1.5 content-start")}>
          <span className="absolute right-2 bottom-2 text-[9.5px] font-extrabold uppercase text-dim">Ниже цены</span>
          {CHIPS.filter((c) => placed[c.id] === "below").map((c) => <span key={c.id} className="h-7 px-2 rounded-lg text-[10.5px] font-extrabold grid place-items-center anim-pop" style={{ background: `${c.c}33`, color: c.c }}>{c.t}</span>)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 min-h-[40px]">
        {CHIPS.map((c) => <DragChip key={c.id} chip={c} placed={!!placed[c.id]} onDrop={(x, y) => tryDrop(c, x, y)} />)}
      </div>
      {done && <div className="mt-3 flex items-center justify-between anim-fade"><span className="text-bull font-extrabold text-[13px]">Все ордера на месте! +40 XP</span><Btn3D size="xs" variant="neutral" onClick={() => setPlaced({})}>Again</Btn3D></div>}
    </Asset>
  );
}

export default function Gestures() {
  return (
    <Section id="gestures" index="11" title="Gestures & Swipes" subtitle="10 жестовых паттернов: свайп-игра, свайп-действия, pull-to-refresh, long-press, reorder, bottom sheet, pinch-zoom, double-tap, swipe-tabs, drag-and-drop" count={10}>
      <div className="grid lg:grid-cols-3 gap-6">
        <BullBear />
        <RadialMenu />
        <SwipeList />
        <PullToRefresh />
        <SnapSheet />
        <PinchChart />
        <DoubleTap />
        <ReorderList />
        <SwipeTabs />
        <DropZones />
      </div>
    </Section>
  );
}
