import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPE } from "react";
import { AssetCard, Btn, Burst, Icon, Label, Section, useBump } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, requestGyro, useDrag, useRaf, useShake, useSpring, useTilt } from "../ui/hooks";
import { CandleChart } from "../ui/Chart";
import { genCandles } from "../game/market";
import { feel, haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ GST-10 · Swipe between tabs ═════════ */

const TABS = [{ t: "Learn", c: "#2ee59d", i: "book" }, { t: "Trade", c: "#3d8bff", i: "candle" }, { t: "League", c: "#ffc53d", i: "trophy" }];
function SwipeTabs() {
  const [tab, setTab] = useState(0);
  const [p, api] = useSpring(tab, 180, 22);
  const base = useRef(0);
  const W = 260;
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => { let v = base.current - d.dx / W; if (v < 0) v *= 0.3; if (v > TABS.length - 1) v = TABS.length - 1 + (v - (TABS.length - 1)) * 0.3; api.set(v); },
    onEnd: (d) => { const t = clamp(Math.round(api.get() - d.vx * 0.03), 0, TABS.length - 1); setTab(t); api.release(); if (t !== tab) feel("swipe", 6); },
  });
  const ind = clamp(p, 0, TABS.length - 1);
  const c0 = TABS[clamp(Math.floor(ind), 0, 2)].c, c1 = TABS[clamp(Math.ceil(ind), 0, 2)].c;
  return (
    <AssetCard id="GST-10" title="Swipe Between Tabs" desc="Экраны листаются свайпом с резинкой на краях, индикатор табов интерполируется вместе с пальцем, а не прыгает после отпускания." tags={["gesture", "swipe", "tabs", "pager"]} stageClass="p-2">
      <div className="relative mx-auto w-full max-w-[260px] overflow-hidden rounded-3xl bg-ink-950">
        <div className="relative flex border-b border-white/5">
          {TABS.map((t, i) => <button key={t.t} onClick={() => { setTab(i); feel("tap"); }} className="flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-colors" style={{ color: Math.abs(ind - i) < 0.5 ? t.c : "#5a70ad" }}>{t.t}</button>)}
          <span className="absolute bottom-0 h-1 rounded-full" style={{ left: `${(ind / TABS.length) * 100}%`, width: `${100 / TABS.length}%`, background: `linear-gradient(90deg, ${c0}, ${c1})`, boxShadow: `0 0 10px ${c0}` }} />
        </div>
        <div onPointerDown={onDown} className="relative h-56 cursor-grab touch-pan-y select-none overflow-hidden">
          <div className="absolute inset-y-0 flex" style={{ width: W * TABS.length, transform: `translateX(${-p * W}px)` }}>
            {TABS.map((t) => (
              <div key={t.t} className="flex flex-col items-center justify-center gap-3 p-5" style={{ width: W }}>
                <span className="grid h-20 w-20 place-items-center rounded-3xl" style={{ background: `${t.c}22`, boxShadow: `inset 0 0 0 2px ${t.c}` }}><Icon name={t.i} size={40} variant="duo" style={{ color: t.c }} /></span>
                <div className="text-xl font-extrabold text-white">{t.t}</div>
                <div className="space-y-2">{[0, 1].map((r) => <div key={r} className="h-3 w-40 rounded-full bg-ink-800" />)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-11 · Edge swipe back ═════════ */
function EdgeSwipe() {
  const [x, api] = useSpring(0, 220, 26);
  const [pushed, setPushed] = useState(true);
  const W = 260;
  const onDown = useDrag({
    onStart: (cx, _y, e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); if (cx - r.left > 34 || !pushed) return false; api.set(0); haptic(5); },
    onMove: (d) => api.set(clamp(d.dx, 0, W)),
    onEnd: (d) => { if (api.get() > W * 0.4 || d.vx > 14) { api.set(W); window.setTimeout(() => { setPushed(false); api.set(0); }, 200); feel("whoosh"); } else api.release(); },
  });
  const k = x / W;
  return (
    <AssetCard id="GST-11" title="Edge Swipe Back" desc="iOS-жест «назад»: тяни от левого края — верхний экран уезжает, нижний выезжает с параллаксом 30% и затемнением; отпустил после 40% — переход." tags={["gesture", "edge-swipe", "navigation", "ios"]} stageClass="p-2">
      <div className="relative mx-auto h-64 w-full max-w-[260px] overflow-hidden rounded-3xl bg-ink-950">
        <div className="absolute inset-0 p-4" style={{ transform: `translateX(${pushed ? -W * 0.3 * (1 - k) : 0}px)`, filter: pushed ? `brightness(${0.5 + k * 0.5})` : "none" }}>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-ink-400">Markets</div>
          {["BTC", "ETH", "SOL", "TON"].map((s) => <button key={s} onClick={() => { if (!pushed) { setPushed(true); feel("tap"); } }} className="mt-2 flex w-full items-center justify-between rounded-2xl bg-ink-800 p-3 text-sm font-extrabold text-white">{s}<Icon name="chevR" size={14} className="text-ink-400" /></button>)}
        </div>
        {pushed && (
          <div onPointerDown={onDown} className="absolute inset-0 touch-pan-y bg-gradient-to-b from-ink-700 to-ink-800 p-4 shadow-[-10px_0_30px_#000a]" style={{ transform: `translateX(${x}px)` }}>
            <div className="flex items-center gap-2 text-xs font-extrabold text-sky"><Icon name="chevL" size={16} stroke={3} />Markets</div>
            <div className="mt-3 text-2xl font-extrabold text-white">Bitcoin</div>
            <div className="font-mono text-sm font-bold text-bull">$64,250 · +2.4%</div>
            <svg viewBox="0 0 200 60" className="mt-3 w-full"><path d="M0 50 L30 40 L50 45 L80 22 L110 30 L140 12 L170 18 L200 6" fill="none" stroke="#2ee59d" strokeWidth="2.5" /></svg>
            <div className="mt-3 grid grid-cols-2 gap-2"><Btn v="bull" size="sm">Buy</Btn><Btn v="bear" size="sm">Sell</Btn></div>
            <div className="absolute inset-y-0 left-0 w-8" style={{ background: `linear-gradient(90deg, ${k > 0 ? "#3d8bff44" : "transparent"}, transparent)` }} />
          </div>
        )}
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-400">{pushed ? "← тяни от левого края" : "тап на актив — открыть снова"}</div>
    </AssetCard>
  );
}

/* ═════════ GST-12 · Long-press radial menu ═════════ */
const RAD = [{ i: "bell", t: "Alert", c: "#3d8bff" }, { i: "star", t: "Watch", c: "#ffc53d" }, { i: "swap", t: "Share", c: "#a174ff" }, { i: "trendUp", t: "Buy", c: "#2ee59d" }];
function RadialMenu() {
  const [open, setOpen] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const box = useRef<HTMLDivElement>(null);
  const R = 70;
  const itemAt = (x: number, y: number) => { if (!open) return null; let best: number | null = null, bd = 44; RAD.forEach((_, i) => { const a = (i / RAD.length) * Math.PI * 2 - Math.PI / 2; const ix = open.x + Math.cos(a) * R, iy = open.y + Math.sin(a) * R; const d = Math.hypot(x - ix, y - iy); if (d < bd) { bd = d; best = i; } }); return best; };
  const onDown = (e: RPE) => {
    const r = box.current!.getBoundingClientRect();
    const pos = { x: e.clientX - r.left, y: e.clientY - r.top };
    timer.current = window.setTimeout(() => { setOpen(pos); setPicked(null); feel("pop", [20, 30]); }, 380);
    const move = (ev: PointerEvent) => { const h = itemAt(ev.clientX - r.left, ev.clientY - r.top); setHover((o) => { if (o !== h && h !== null) sfx.play("tick"); return h; }); };
    const up = (ev: PointerEvent) => {
      clearTimeout(timer.current);
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up);
      const h = itemAt(ev.clientX - r.left, ev.clientY - r.top);
      if (h !== null) { setPicked(RAD[h].t); feel("success", 12); }
      setOpen(null); setHover(null);
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
  };
  return (
    <AssetCard id="GST-12" title="Long-Press Radial Menu" desc="Удержи палец на графике 0.4 с — вокруг точки раскрывается радиальное меню; не отпуская, веди к действию и отпусти. Наведение подсвечивает и тикает." tags={["gesture", "long-press", "radial", "context-menu"]}>
      <div ref={box} onPointerDown={onDown} onContextMenu={(e) => e.preventDefault()} className="relative h-56 touch-none select-none overflow-hidden rounded-2xl bg-ink-950/70">
        <svg viewBox="0 0 300 200" className="h-full w-full"><path d="M0 150 L40 130 L70 140 L110 90 L150 105 L190 60 L230 75 L270 30 L300 40" fill="none" stroke="#5ce1ff" strokeWidth="2.5" /><path d="M0 150 L40 130 L70 140 L110 90 L150 105 L190 60 L230 75 L270 30 L300 40 L300 200 L0 200Z" fill="#5ce1ff" opacity=".08" /></svg>
        {!open && <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs font-extrabold text-ink-400">Hold anywhere on the chart</div>}
        {open && (
          <>
            <span className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_#fff]" style={{ left: open.x, top: open.y }} />
            <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-white/20" style={{ left: open.x, top: open.y, width: R * 2, height: R * 2 }} />
            {RAD.map((it, i) => { const a = (i / RAD.length) * Math.PI * 2 - Math.PI / 2; return (
              <div key={it.t} className="pointer-events-none absolute flex flex-col items-center" style={{ left: open.x, top: open.y, ["--rx" as string]: `${Math.cos(a) * R}px`, ["--ry" as string]: `${Math.sin(a) * R}px`, animation: `radialOut .35s cubic-bezier(.3,1.5,.5,1) ${i * 40}ms both` } as CSSProperties}>
                <span className="grid h-12 w-12 place-items-center rounded-full transition-transform" style={{ background: it.c, boxShadow: `0 4px 0 rgba(0,0,0,.35), 0 0 ${hover === i ? 24 : 0}px ${it.c}`, transform: `scale(${hover === i ? 1.3 : 1})` }}><Icon name={it.i} size={20} stroke={2.6} className="text-ink-900" /></span>
                <span className="mt-1 text-[10px] font-extrabold text-white">{it.t}</span>
              </div>); })}
          </>
        )}
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-400">{picked ? <>Действие: <b className="text-white">{picked}</b></> : "Hold → drag → release"}</div>
    </AssetCard>
  );
}

/* ═════════ GST-13 · Two-finger rotate ═════════ */
function RotateDial() {
  const [ang, setAng] = useState(0);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ a: number; base: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [fingers, setFingers] = useState(0);
  const angleOf = () => { const p = [...ptrs.current.values()]; if (p.length >= 2) return (Math.atan2(p[1].y - p[0].y, p[1].x - p[0].x) * 180) / Math.PI; const r = box.current!.getBoundingClientRect(); return (Math.atan2(p[0].y - (r.top + r.height / 2), p[0].x - (r.left + r.width / 2)) * 180) / Math.PI; };
  const onDown = (e: RPE) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); setFingers(ptrs.current.size); start.current = { a: angleOf(), base: ang }; feel("tap", 4); };
  const onMove = (e: RPE) => { if (!ptrs.current.has(e.pointerId) || !start.current) return; ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); const na = start.current.base + (angleOf() - start.current.a); setAng((o) => { if (Math.floor(o / 15) !== Math.floor(na / 15)) { sfx.play("tick"); haptic(2); } return na; }); };
  const onUp = (e: RPE) => { ptrs.current.delete(e.pointerId); setFingers(ptrs.current.size); start.current = ptrs.current.size ? { a: angleOf(), base: ang } : null; };
  const lev = clamp(Math.round((((ang % 360) + 360) % 360) / 3.6), 1, 100);
  return (
    <AssetCard id="GST-13" title="Two-Finger Rotate" desc="Вращай диск двумя пальцами (или одним вокруг центра): угол между касаниями управляет плечом. Щелчки каждые 15°, счётчик пальцев." tags={["gesture", "multitouch", "rotate", "dial"]}>
      <div ref={box} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className="relative mx-auto h-52 w-52 touch-none select-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-ink-500 to-ink-800 shadow-[0_8px_0_#050b1f,0_20px_40px_#000a,inset_0_2px_0_#ffffff22]" style={{ transform: `rotate(${ang}deg)` }}>
          {Array.from({ length: 24 }).map((_, i) => <span key={i} className="absolute left-1/2 top-2 h-4 w-0.5 -translate-x-1/2 rounded bg-white/25" style={{ transformOrigin: "50% 96px", transform: `translateX(-50%) rotate(${i * 15}deg)` }} />)}
          <span className="absolute left-1/2 top-3 h-6 w-2 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_#ffc53d]" />
          <Icon name="user" size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10" /><Icon name="user" size={24} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10" />
        </div>
        <div className="pointer-events-none absolute inset-14 grid place-items-center rounded-full bg-ink-950 shadow-[inset_0_4px_10px_#000a]"><div className="text-center"><div className="font-mono text-3xl font-extrabold" style={{ color: lev > 50 ? "#ff4d6a" : lev > 20 ? "#ffc53d" : "#2ee59d" }}>{lev}×</div><div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-400">leverage</div></div></div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-ink-400"><span>angle {Math.round(ang)}°</span><span className="flex items-center gap-1">{fingers} {fingers === 1 ? "finger" : "fingers"} <span className={cn("h-2 w-2 rounded-full", fingers >= 2 ? "bg-bull" : "bg-ink-600")} /></span></div>
    </AssetCard>
  );
}

/* ═════════ GST-14 · Double tap ═════════ */
const DT_DATA = genCandles(19, 36, 100, 1);
function DoubleTap() {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [cross, setCross] = useState<number | null>(null);
  const [likes, setLikes] = useState(128);
  const [zoom, setZoom] = useState(false);
  const lastTap = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const singleT = useRef<number | undefined>(undefined);
  const onTap = (i: number, e: { clientX: number; clientY: number }) => {
    const now = Date.now();
    const r = box.current!.getBoundingClientRect();
    if (now - lastTap.current < 280) {
      clearTimeout(singleT.current);
      const id = now; setHearts((h) => [...h, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
      window.setTimeout(() => setHearts((h) => h.filter((q) => q.id !== id)), 900);
      setLikes((l) => l + 1); setZoom((z) => !z); feel("pop", [10, 20]);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    singleT.current = window.setTimeout(() => { setCross(i); sfx.play("tick"); }, 290);
  };
  return (
    <AssetCard id="GST-14" title="Double Tap · Like & Zoom" desc="Один тап — перекрестие на свече (с задержкой распознавания), двойной тап — сердце из точки касания, лайк и переключение зума графика." tags={["gesture", "double-tap", "like", "zoom"]}>
      <div ref={box} className="relative overflow-hidden rounded-2xl">
        <CandleChart data={zoom ? DT_DATA.slice(18) : DT_DATA} h={180} onTap={onTap} active={cross} className="well w-full touch-manipulation select-none" style={{ transition: "all .3s" }}>
          {(s) => cross !== null && cross < (zoom ? 18 : 36) ? <><line x1={s.x(cross)} x2={s.x(cross)} y1="0" y2={s.h} stroke="#ffffff66" strokeDasharray="3 3" /><rect x={s.x(cross) - 24} y="4" width="48" height="16" rx="4" fill="#fff" /><text x={s.x(cross)} y="15.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#0a1330" fontFamily="JetBrains Mono">{(zoom ? DT_DATA.slice(18) : DT_DATA)[cross].c.toFixed(1)}</text></> : null}
        </CandleChart>
        {hearts.map((h) => <span key={h.id} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: h.x, top: h.y, animation: "floatAway .9s ease-out forwards" }}><Icon name="heart" size={56} variant="solid" className="text-bear drop-shadow-[0_0_16px_#ff4d6a]" style={{ animation: "popIn .4s cubic-bezier(.2,1.4,.4,1) both" }} /></span>)}
        <span className="absolute right-2 top-2 rounded-md bg-ink-900/70 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-300">{zoom ? "2×" : "1×"}</span>
      </div>
      <div className="mt-3 flex items-center justify-between"><span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-bear"><Icon name="heart" size={18} variant="solid" />{likes}</span><span className="text-[11px] font-bold text-ink-400">tap — crosshair · double tap — like + zoom</span></div>
    </AssetCard>
  );
}

/* ═════════ GST-15 · Shake to undo ═════════ */
function ShakeUndo() {
  const [orders, setOrders] = useState<{ id: number; s: string; side: "buy" | "sell"; p: string }[]>([{ id: 1, s: "BTC", side: "buy", p: "64,250" }]);
  const [undone, setUndone] = useState<string | null>(null);
  const [shaking, setShaking] = useState(0);
  const idRef = useRef(2);
  const undo = () => { setShaking((s) => s + 1); setOrders((o) => { if (!o.length) return o; const last = o[o.length - 1]; setUndone(`${last.side.toUpperCase()} ${last.s} отменён`); return o.slice(0, -1); }); feel("whoosh", [30, 20, 30]); window.setTimeout(() => setUndone(null), 1500); };
  useShake(undo);
  const add = (side: "buy" | "sell") => { const s = ["BTC", "ETH", "SOL"][idRef.current % 3]; setOrders((o) => [...o.slice(-4), { id: idRef.current++, s, side, p: ["64,250", "3,412", "148.2"][idRef.current % 3] }]); feel(side === "buy" ? "success" : "lock", 8); };
  return (
    <AssetCard id="GST-15" title="Shake to Undo" desc="Встряхни телефон — последний ордер отменяется (DeviceMotion). На десктопе — кнопка-симулятор. Список трясётся, отменённый ордер вылетает." tags={["gesture", "shake", "devicemotion", "undo"]}>
      <div key={shaking} className={cn("space-y-2", shaking && "anim-shake")}>
        {orders.map((o) => <div key={o.id} className="flex items-center justify-between rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#081130]" style={{ animation: "riseIn .3s ease both" }}><span className="flex items-center gap-2 text-sm font-extrabold text-white"><span className={cn("rounded-md px-1.5 py-0.5 text-[10px] uppercase", o.side === "buy" ? "bg-bull text-ink-900" : "bg-bear text-white")}>{o.side}</span>{o.s}</span><span className="font-mono text-xs text-ink-300">@ {o.p}</span></div>)}
        {orders.length === 0 && <div className="rounded-2xl border-2 border-dashed border-ink-600 p-6 text-center text-xs font-bold text-ink-500">Нет ордеров</div>}
      </div>
      {undone && <div className="anim-pop mt-2 rounded-xl bg-gold/15 px-3 py-2 text-center text-xs font-extrabold text-gold">↶ {undone}</div>}
      <div className="mt-3 grid grid-cols-3 gap-2"><Btn v="bull" size="sm" onClick={() => add("buy")}>Buy</Btn><Btn v="bear" size="sm" onClick={() => add("sell")}>Sell</Btn><Btn v="ghost" size="sm" onClick={undo} disabled={!orders.length}><Icon name="refresh" size={14} />Shake</Btn></div>
    </AssetCard>
  );
}

/* ═════════ GST-16 · Drag into slots ═════════ */
const COINS = [{ s: "BTC", c: "#f7931a", k: "core" }, { s: "ETH", c: "#8c8cff", k: "core" }, { s: "USDT", c: "#26a17b", k: "stable" }, { s: "PEPE", c: "#3d9e3d", k: "meme" }, { s: "SOL", c: "#14f195", k: "alt" }];
const SLOTS = [{ t: "Core", k: "core" }, { t: "Stable", k: "stable" }, { t: "Bet", k: "alt" }];
function DragSlots() {
  const game = useGame();
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [drag, setDrag] = useState<{ s: string; x: number; y: number } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [res, setRes] = useState<null | boolean>(null);
  const [b, bump] = useBump();
  const slotAt = (x: number, y: number) => (document.elementFromPoint(x, y)?.closest("[data-slot]") as HTMLElement | null)?.dataset.slot ?? null;
  const onDown = useDrag({
    onStart: (x, y, e) => { const s = (e.currentTarget as HTMLElement).dataset.s!; setDrag({ s, x, y }); setRes(null); feel("tap", 5); },
    onMove: (d) => { setDrag((q) => (q ? { ...q, x: d.x, y: d.y } : q)); setOver(slotAt(d.x, d.y)); },
    onEnd: (d) => { const q = drag; setDrag(null); setOver(null); if (!q) return; const sl = slotAt(d.x, d.y); if (sl) { const np = { ...placed }; Object.keys(np).forEach((k) => { if (np[k] === sl) delete np[k]; }); np[q.s] = sl; setPlaced(np); feel("pop", 8); } },
  });
  const check = (x: number, y: number) => {
    const ok = SLOTS.every((sl) => { const coin = Object.keys(placed).find((k) => placed[k] === sl.t); return coin && COINS.find((c) => c.s === coin)?.k === sl.k; }) && !Object.keys(placed).some((k) => COINS.find((c) => c.s === k)?.k === "meme");
    setRes(ok);
    if (ok) { bump(); game.complete({ skill: "defi", xp: 18, x, y }); feel("success", [20, 30, 60]); } else { game.complete({ skill: "defi", ok: false }); feel("error"); }
  };
  return (
    <AssetCard id="GST-16" title="Drag into Slots · Build Portfolio" desc="Перетащи монеты в слоты Core / Stable / Bet. Слот подсвечивается при наведении, занятая монета вытесняется. Мемкоин в портфель — ошибка." tags={["gesture", "drag-drop", "slots", "portfolio"]}>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((sl) => { const coin = Object.keys(placed).find((k) => placed[k] === sl.t); const c = COINS.find((x) => x.s === coin); return (
          <div key={sl.t} data-slot={sl.t} className={cn("flex h-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all", over === sl.t ? "scale-105 border-sky bg-sky/15" : "border-ink-600 bg-ink-800/40", res === true && "border-bull", res === false && "border-bear")}>
            {c ? <span className="anim-pop grid h-12 w-12 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: c.c, boxShadow: `0 3px 0 ${c.c}88` }}>{c.s}</span> : <Icon name="plus" size={20} className="text-ink-500" />}
            <span className="mt-1 text-[10px] font-extrabold uppercase tracking-widest text-ink-400">{sl.t}</span>
          </div>); })}
      </div>
      <div className="mt-3 flex min-h-[64px] flex-wrap justify-center gap-2">
        {COINS.filter((c) => !placed[c.s]).map((c) => <button key={c.s} data-s={c.s} onPointerDown={onDown} className="grid h-12 w-12 cursor-grab touch-none place-items-center rounded-full text-xs font-extrabold text-white shadow-[0_4px_0_rgba(0,0,0,.35)] transition-transform active:scale-90" style={{ background: c.c, opacity: drag?.s === c.s ? 0.3 : 1 }}>{c.s}</button>)}
      </div>
      <div className="mt-2 flex items-center justify-between"><span className={cn("text-xs font-extrabold", res === null ? "text-ink-400" : res ? "text-bull" : "text-bear")}>{res === null ? `${Object.keys(placed).length}/3 слотов` : res ? "Сбалансированный портфель! +18 XP" : "Проверь: мемкоин ≠ инвестиция, стейбл — в Stable"}</span><div className="flex gap-2"><Btn v="ghost" size="sm" onClick={() => { setPlaced({}); setRes(null); }}>Reset</Btn><Btn v="bull" size="sm" disabled={Object.keys(placed).length < 3} onClick={(e) => check(e.clientX, e.clientY)}>Check</Btn></div></div>
      {drag && <div className="pointer-events-none fixed z-[70] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs font-extrabold text-white shadow-[0_10px_30px_#000a]" style={{ left: drag.x, top: drag.y, background: COINS.find((c) => c.s === drag.s)?.c, transform: "translate(-50%,-50%) scale(1.15)" }}>{drag.s}</div>}
      <Burst trigger={b} />
    </AssetCard>
  );
}

/* ═════════ GST-17 · Flick coins into piggy ═════════ */
function FlickCoins() {
  const game = useGame();
  const [coin, setCoin] = useState<{ x: number; y: number; vx: number; vy: number; live: boolean; spin: number } | null>(null);
  const [saved, setSaved] = useState(0);
  const [miss, setMiss] = useState(0);
  const [b, bump] = useBump();
  const box = useRef<HTMLDivElement>(null);
  const W = 300, H = 230;
  const PIG = { x: 230, y: 70, r: 34 };
  const onDown = useDrag({
    onStart: () => { if (coin?.live) return false; setCoin({ x: 60, y: H - 40, vx: 0, vy: 0, live: false, spin: 0 }); },
    onMove: (d) => setCoin((c) => (c && !c.live ? { ...c, x: 60 + d.dx * 0.4, y: H - 40 + d.dy * 0.4 } : c)),
    onEnd: (d) => { const sp = Math.hypot(d.vx, d.vy); if (sp < 6) { setCoin(null); return; } setCoin((c) => (c ? { ...c, vx: d.vx * 1.1, vy: d.vy * 1.1, live: true } : c)); feel("whoosh", 8); },
  });
  useRaf((dt) => {
    setCoin((c) => {
      if (!c || !c.live) return c;
      const k = dt / 16;
      const n = { ...c, x: c.x + c.vx * k, y: c.y + c.vy * k, vy: c.vy + 0.55 * k, spin: c.spin + c.vx * 2 };
      if (Math.hypot(n.x - PIG.x, n.y - PIG.y) < PIG.r) { setSaved((s) => s + 1); bump(); feel("coin", 15); game.reward({ gems: 5, silent: true }); return null; }
      if (n.y > H + 30 || n.x > W + 30 || n.x < -30) { setMiss((m) => m + 1); sfx.play("lock"); return null; }
      return n;
    });
  }, !!coin?.live);
  return (
    <AssetCard id="GST-17" title="Flick Coins into the Bank" desc="Физика броска: смахни монету — скорость жеста задаёт траекторию с гравитацией и вращением. Попал в копилку — +5 💎, промах считается." tags={["gesture", "flick", "physics", "projectile"]}>
      <div ref={box} onPointerDown={onDown} className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-ink-950 to-ink-900 touch-none select-none" style={{ aspectRatio: `${W}/${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
          <line x1="0" x2={W} y1={H - 12} y2={H - 12} stroke="#22376f" strokeWidth="3" />
          <g style={{ animation: b ? "jelly .6s ease" : undefined }} key={b}>
            <ellipse cx={PIG.x} cy={PIG.y + 8} rx={PIG.r + 4} ry={PIG.r - 6} fill="#a174ff" />
            <circle cx={PIG.x - 26} cy={PIG.y - 2} r="12" fill="#a174ff" /><circle cx={PIG.x - 30} cy={PIG.y - 2} r="6" fill="#6a3fd6" />
            <rect x={PIG.x - 10} y={PIG.y - 26} width="26" height="6" rx="3" fill="#4a24a8" />
            <circle cx={PIG.x - 22} cy={PIG.y - 10} r="2.5" fill="#0a1330" />
            <path d={`M${PIG.x - 20} ${PIG.y - 24} l-6 -10 l10 4z`} fill="#8b5cf6" />
          </g>
          <text x={PIG.x} y={PIG.y + 42} textAnchor="middle" fontSize="9" fontWeight="800" fill="#a174ff">BANK</text>
          {coin && <g transform={`translate(${coin.x} ${coin.y}) rotate(${coin.spin})`}><ellipse rx={12} ry={12 * Math.abs(Math.cos(coin.spin / 40)) + 2} fill="#ffc53d" stroke="#cc8a00" strokeWidth="2" /><text y="4" textAnchor="middle" fontSize="10" fontWeight="800" fill="#7a4a00">$</text></g>}
          {!coin && <g opacity=".6"><circle cx="60" cy={H - 40} r="14" fill="none" stroke="#ffc53d" strokeWidth="2" strokeDasharray="4 3" style={{ animation: "pulseRing 1.6s infinite", transformOrigin: `60px ${H - 40}px` }} /><text x="60" y={H - 60} textAnchor="middle" fontSize="9" fontWeight="800" fill="#8fa0cf">flick me ↗</text></g>}
        </svg>
        <Burst trigger={b} colors={["#a174ff", "#ffc53d"]} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs font-extrabold"><span className="text-violet">saved {saved} · +{saved * 5}💎</span><span className="text-ink-400">missed {miss}</span></div>
    </AssetCard>
  );
}

/* ═════════ GST-18 · Swipe up to dismiss ═════════ */
function SwipeDismiss() {
  const [y, api] = useSpring(0, 240, 24);
  const [gone, setGone] = useState(false);
  const onDown = useDrag({
    onStart: () => api.set(0),
    onMove: (d) => api.set(d.dy < 0 ? d.dy : d.dy * 0.2),
    onEnd: (d) => { if (d.dy < -120 || d.vy < -16) { api.set(-500); setGone(true); feel("whoosh", 10); } else api.release(); },
  });
  const k = clamp(-y / 300, 0, 1);
  return (
    <AssetCard id="GST-18" title="Swipe Up to Dismiss" desc="Карточка уведомления: свайп вверх с прозрачностью и сжатием по прогрессу, порог по расстоянию или скорости, иначе — пружина обратно." tags={["gesture", "swipe-up", "dismiss", "velocity"]}>
      <div className="relative h-56 overflow-hidden rounded-2xl bg-ink-950/60">
        <div className="absolute inset-0 grid place-items-center text-center"><div><Mascot mood={gone ? "happy" : "idle"} size={64} className="mx-auto" /><div className="mt-2 text-xs font-bold text-ink-400">{gone ? "Чисто!" : "Смахни карточку вверх"}</div>{gone && <Btn v="ghost" size="sm" className="mt-2" onClick={() => { setGone(false); api.set(0); }}>Bring back</Btn>}</div></div>
        {!gone && (
          <div onPointerDown={onDown} className="absolute inset-x-4 bottom-4 cursor-grab touch-none rounded-2xl bg-gradient-to-b from-ink-600 to-ink-700 p-4 shadow-[0_6px_0_#0b1638,0_20px_40px_#000a]" style={{ transform: `translateY(${y}px) scale(${1 - k * 0.15})`, opacity: 1 - k * 0.8 }}>
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink-300/50" />
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-flame/20"><Icon name="flame" size={22} variant="solid" className="text-flame" /></span><div><div className="text-sm font-extrabold text-white">Стрик под угрозой!</div><div className="text-xs text-ink-300">Пройди урок до полуночи</div></div></div>
          </div>
        )}
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-19 · Gyroscope parallax card ═════════ */
function GyroCard() {
  const t = useTilt();
  const [gyro, setGyro] = useState<null | boolean>(null);
  useEffect(() => { if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) setGyro(false); }, []);
  const ask = async () => { const ok = await requestGyro(); setGyro(ok); feel(ok ? "unlock" : "lock"); };
  return (
    <AssetCard id="GST-19" title="Gyroscope Parallax Card" desc="Наклоняй телефон — три слоя карточки (фон, монеты, текст) едут с разной глубиной через DeviceOrientation. На десктопе управляет мышь. iOS попросит разрешение." tags={["gesture", "gyroscope", "parallax", "tilt"]}>
      <div className="relative mx-auto h-56 w-full max-w-[300px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4fbf] to-ink-900 shadow-[0_8px_0_#050b1f]" style={{ transform: `perspective(800px) rotateY(${t.x * 10}deg) rotateX(${-t.y * 10}deg)`, transition: "transform .1s" }}>
        <div className="absolute inset-0" style={{ transform: `translate(${t.x * -14}px, ${t.y * -10}px) scale(1.15)`, background: "radial-gradient(circle at 30% 30%, #5ce1ff33, transparent 50%), radial-gradient(circle at 70% 70%, #a174ff33, transparent 50%)" }} />
        {[["coin", 20, 30, "#ffc53d"], ["gem", 220, 40, "#a174ff"], ["bolt", 60, 150, "#ffc53d"], ["candle", 240, 150, "#2ee59d"]].map(([i, x, y, c], k) => <span key={k} className="absolute" style={{ left: x as number, top: y as number, transform: `translate(${t.x * (18 + k * 6)}px, ${t.y * (14 + k * 4)}px)` }}><Icon name={i as string} size={28} variant="duo" style={{ color: c as string, filter: `drop-shadow(0 6px 0 rgba(0,0,0,.3))` }} /></span>)}
        <div className="absolute inset-x-0 bottom-6 text-center" style={{ transform: `translate(${t.x * 26}px, ${t.y * 18}px)` }}><div className="text-[10px] font-extrabold uppercase tracking-[.3em] text-white/70">Tilt me</div><div className="text-3xl font-extrabold text-white text-3d">Depth</div></div>
        <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at ${(t.x + 1) * 50}% ${(t.y + 1) * 50}%, #ffffff33, transparent 45%)` }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-ink-400">x {t.x.toFixed(2)} · y {t.y.toFixed(2)}</span>
        {gyro === false ? <Btn v="sky" size="sm" onClick={ask}>Enable gyroscope</Btn> : <span className={cn("text-[11px] font-extrabold", gyro ? "text-bull" : "text-ink-400")}>{gyro ? "gyro active" : "mouse fallback"}</span>}
      </div>
      <Label className="mt-2 mb-0">DeviceOrientation β/γ → −1…1</Label>
    </AssetCard>
  );
}

export default function Gestures2() {
  return (
    <Section id="gestures2" num="17" title="Gestures II" subtitle="Свайп табов, edge-swipe назад, радиальное меню, вращение двумя пальцами, double tap, shake-to-undo, слоты, бросок монет, swipe-up, гироскоп">
      <SwipeTabs />
      <EdgeSwipe />
      <RadialMenu />
      <RotateDial />
      <DoubleTap />
      <ShakeUndo />
      <DragSlots />
      <FlickCoins />
      <SwipeDismiss />
      <GyroCard />
    </Section>
  );
}
