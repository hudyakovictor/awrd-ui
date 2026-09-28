import { useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { AssetCard, Btn, Burst, Icon, Label, Section, useBump } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useSpring } from "../ui/hooks";
import { feel, haptic, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ GST-01 · Swipe deck: Bull or Bear ═════════ */

const SCEN = [
  { p: "M0 70 L20 64 L40 66 L60 50 L80 52 L100 36 L120 38 L140 20", a: "bull", why: "Higher highs & higher lows — восходящий тренд." },
  { p: "M0 20 L20 30 L40 26 L60 44 L80 40 L100 58 L120 55 L140 76", a: "bear", why: "Lower highs & lower lows — нисходящий тренд." },
  { p: "M0 60 L20 30 L40 58 L60 28 L80 56 L100 60 L120 70 L140 78", a: "bear", why: "Двойная вершина с пробоем шеи — медвежий разворот." },
  { p: "M0 30 L20 62 L40 36 L60 64 L80 40 L100 30 L120 22 L140 12", a: "bull", why: "Двойное дно и пробой — бычий разворот." },
  { p: "M0 76 L30 30 L50 36 L70 32 L90 38 L110 34 L140 10", a: "bull", why: "Бычий флаг: импульс → консолидация → продолжение." },
] as const;
function SwipeDeck() {
  const game = useGame();
  const [i, setI] = useState(0);
  const [d, setD] = useState({ x: 0, y: 0 });
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const [res, setRes] = useState<null | { ok: boolean; why: string }>(null);
  const [score, setScore] = useState(0);
  const decide = (dir: 1 | -1, x?: number, y?: number) => {
    const s = SCEN[i % SCEN.length];
    const ok = (dir === 1 ? "bull" : "bear") === s.a;
    setFly(dir);
    setRes({ ok, why: s.why });
    game.addCombo(ok);
    if (ok) { setScore((v) => v + 1); feel("success", 15); game.reward({ xp: 10, x, y }); }
    else { feel("error", [30, 40, 30]); game.loseHeart(); }
    window.setTimeout(() => { setI((v) => v + 1); setFly(0); setD({ x: 0, y: 0 }); }, 320);
  };
  const onDown = useDrag({
    onMove: (m) => setD({ x: m.dx, y: m.dy }),
    onEnd: (m) => {
      if (Math.abs(m.dx) > 100 || Math.abs(m.vx) > 14) decide((m.dx || m.vx) > 0 ? 1 : -1, m.x, m.y);
      else setD({ x: 0, y: 0 });
    },
  });
  const s = SCEN[i % SCEN.length];
  const nx = SCEN[(i + 1) % SCEN.length];
  const x = fly ? fly * 420 : d.x;
  const bullO = clamp(x / 100, 0, 1), bearO = clamp(-x / 100, 0, 1);
  return (
    <AssetCard id="GST-01" title="Swipe Deck · Bull or Bear?" desc="Tinder-механика для обучения: свайп вправо — бычий, влево — медвежий. Штампы проявляются по силе свайпа, бросок по скорости." tags={["swipe", "tinder", "quiz", "gesture"]} className="row-span-2">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-bull"><Icon name="target" size={16} />{score} correct</span>
        <span className="flex items-center gap-1.5 font-mono text-sm font-extrabold text-flame"><Icon name="flame" size={16} variant="solid" />combo ×{game.combo}</span>
      </div>
      <div className="relative mx-auto h-[330px] w-full max-w-[270px]">
        <div className="absolute inset-0 translate-y-3 scale-95 rounded-3xl bg-ink-700 p-4 opacity-70 shadow-[0_6px_0_#0b1638]">
          <svg viewBox="0 0 140 90" className="mt-10 w-full opacity-40"><path d={nx.p} fill="none" stroke="#8fa0cf" strokeWidth="3" /></svg>
        </div>
        <div key={i} onPointerDown={fly ? undefined : onDown} className={cn("absolute inset-0 cursor-grab touch-none select-none rounded-3xl bg-gradient-to-b from-ink-600 to-ink-700 p-4 shadow-[0_6px_0_#0b1638,0_24px_40px_-12px_#000]", (fly || (d.x === 0 && d.y === 0)) && "transition-transform duration-300 ease-out")}
          style={{ transform: `translate(${x}px, ${d.y * 0.3}px) rotate(${x / 14}deg)`, animation: fly || d.x ? undefined : "scaleIn .3s ease both" }}>
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-ink-900/60 px-2 py-1 font-mono text-[10px] font-extrabold text-ink-300">CHART #{(i % SCEN.length) + 1}</span>
            <span className="font-mono text-[10px] font-bold text-ink-400">4H · BTC</span>
          </div>
          <svg viewBox="0 0 140 90" className="mt-6 w-full">
            {[20, 45, 70].map((g) => <line key={g} x1="0" x2="140" y1={g} y2={g} stroke="#ffffff10" strokeDasharray="3 4" />)}
            <path d={s.p} fill="none" stroke="#5ce1ff" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px #5ce1ff)" }} />
            <path d={s.p + " L140 90 L0 90 Z"} fill="#5ce1ff" opacity=".08" />
          </svg>
          <div className="mt-4 text-center text-lg font-extrabold text-white">Куда дальше?</div>
          <div className="text-center text-xs text-ink-400">← Bear · Bull →</div>
          <div className="absolute left-5 top-14 rounded-xl border-4 border-bull px-3 py-1 text-2xl font-extrabold text-bull" style={{ opacity: bullO, transform: `rotate(-14deg) scale(${0.8 + bullO * 0.3})` }}>BULL</div>
          <div className="absolute right-5 top-14 rounded-xl border-4 border-bear px-3 py-1 text-2xl font-extrabold text-bear" style={{ opacity: bearO, transform: `rotate(14deg) scale(${0.8 + bearO * 0.3})` }}>BEAR</div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-6">
        <Btn v="bear" size="iconLg" className="rounded-full!" onClick={(e) => decide(-1, e.clientX, e.clientY)}><Icon name="trendDown" size={26} stroke={3} /></Btn>
        <Btn v="bull" size="iconLg" className="rounded-full!" onClick={(e) => decide(1, e.clientX, e.clientY)}><Icon name="trendUp" size={26} stroke={3} /></Btn>
      </div>
      {res && (
        <div key={i} className={cn("anim-fade-up mt-4 flex items-center gap-3 rounded-2xl p-3", res.ok ? "bg-bull/10 ring-1 ring-bull/40" : "bg-bear/10 ring-1 ring-bear/40")}>
          <Mascot mood={res.ok ? "happy" : "sad"} size={44} />
          <div><div className={cn("text-sm font-extrabold", res.ok ? "text-bull" : "text-bear")}>{res.ok ? "Верно! +10 XP" : "Мимо · −1 ❤"}</div><div className="text-xs text-ink-300">{res.why}</div></div>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ GST-02 · Swipe list actions ═════════ */
type Row = { id: number; s: string; n: string; p: string; c: number; col: string; pinned?: boolean };
function SwipeRow({ r, onDelete, onPin, onAlert }: { r: Row; onDelete: () => void; onPin: () => void; onAlert: () => void }) {
  const [target, setTarget] = useState(0);
  const [x, api] = useSpring(target, 300, 28);
  const base = useRef(0);
  const [gone, setGone] = useState(false);
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => { const v = base.current + d.dx; api.set(v > 0 ? Math.min(110, v * 0.7) : Math.max(-300, v)); if (Math.abs(d.dx) > 60) haptic(1); },
    onEnd: (d) => {
      const v = api.get();
      if (v < -220 || d.vx < -25) { setGone(true); feel("whoosh", 20); window.setTimeout(onDelete, 280); api.set(-400); return; }
      if (v > 70) { onPin(); feel("pop", 10); setTarget(0); api.release(); return; }
      const t = v < -60 ? -148 : 0;
      setTarget(t); api.release(d.vx * 5);
    },
  });
  const pull = clamp(-x / 220, 0, 1);
  return (
    <div className="grid transition-all duration-300" style={{ gridTemplateRows: gone ? "0fr" : "1fr", opacity: gone ? 0 : 1 }}>
      <div className="overflow-hidden">
        <div className="relative mb-2 overflow-hidden rounded-2xl">
          <div className="absolute inset-y-0 left-0 flex w-28 items-center justify-start bg-gold pl-5" style={{ opacity: clamp(x / 60, 0, 1) }}>
            <Icon name="star" size={22} variant="solid" className="text-ink-900" style={{ transform: `scale(${0.6 + clamp(x / 70, 0, 1) * 0.6})` }} />
          </div>
          <div className="absolute inset-y-0 right-0 flex">
            <button onClick={() => { onAlert(); setTarget(0); api.release(); }} className="grid w-[74px] place-items-center bg-sky text-white"><div className="text-center"><Icon name="bell" size={18} className="mx-auto" /><div className="text-[9px] font-extrabold uppercase">Alert</div></div></button>
            <button onClick={() => { setGone(true); window.setTimeout(onDelete, 280); feel("whoosh"); }} className="grid place-items-center bg-bear text-white transition-[width]" style={{ width: 74 + Math.max(0, -x - 148) }}><div className="text-center"><Icon name="x" size={18} stroke={3} className="mx-auto" style={{ transform: `scale(${1 + pull * 0.4})` }} /><div className="text-[9px] font-extrabold uppercase">Remove</div></div></button>
          </div>
          <div onPointerDown={onDown} className="relative flex cursor-grab touch-pan-y select-none items-center gap-3 bg-ink-700 p-3" style={{ transform: `translateX(${x}px)` }}>
            <span className="grid h-10 w-10 place-items-center rounded-full text-[10px] font-extrabold text-white" style={{ background: r.col }}>{r.s}</span>
            <div className="flex-1"><div className="flex items-center gap-1 text-sm font-extrabold text-white">{r.n}{r.pinned && <Icon name="star" size={12} variant="solid" className="anim-pop text-gold" />}</div><div className="text-[11px] text-ink-400">{r.s}/USDT</div></div>
            <div className="text-right"><div className="font-mono text-sm font-extrabold text-white">{r.p}</div><div className={cn("font-mono text-[11px] font-bold", r.c >= 0 ? "text-bull" : "text-bear")}>{r.c >= 0 ? "+" : ""}{r.c}%</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
const ROWS0: Row[] = [
  { id: 1, s: "BTC", n: "Bitcoin", p: "64,250", c: 2.4, col: "#f7931a" }, { id: 2, s: "ETH", n: "Ethereum", p: "3,412", c: -1.1, col: "#8c8cff" },
  { id: 3, s: "SOL", n: "Solana", p: "148.2", c: 6.8, col: "#14f195" }, { id: 4, s: "TON", n: "Toncoin", p: "6.84", c: 0.4, col: "#0098ea" },
];
function SwipeList() {
  const [rows, setRows] = useState(ROWS0);
  const [msg, setMsg] = useState("← свайп: действия · → свайп: в избранное");
  return (
    <AssetCard id="GST-02" title="Swipe Actions List" desc="iOS-свайп строк: влево — «Alert/Remove», длинный свайп — удаление со схлопыванием, вправо — пин. Резиновое сопротивление." tags={["swipe", "list", "actions", "ios"]}>
      {rows.map((r) => (
        <SwipeRow key={r.id} r={r}
          onDelete={() => { setRows((x) => x.filter((q) => q.id !== r.id)); setMsg(`${r.s} удалён из watchlist`); }}
          onPin={() => { setRows((x) => x.map((q) => (q.id === r.id ? { ...q, pinned: !q.pinned } : q))); setMsg(`${r.s} ${r.pinned ? "откреплён" : "закреплён"}`); }}
          onAlert={() => setMsg(`Алерт на ${r.s} создан 🔔`)} />
      ))}
      {rows.length === 0 && <div className="py-8 text-center"><Btn v="ghost" size="sm" onClick={() => setRows(ROWS0)}><Icon name="refresh" size={14} />Restore</Btn></div>}
      <div key={msg} className="anim-fade-up mt-2 text-center text-[11px] font-bold text-ink-400">{msg}</div>
    </AssetCard>
  );
}

/* ═════════ GST-03 · Draggable bottom sheet ═════════ */
function BottomSheet() {
  const H = 420;
  const SNAPS = [H - 86, 200, 24];
  const [snap, setSnap] = useState(0);
  const [y, api] = useSpring(SNAPS[snap], 260, 28);
  const base = useRef(0);
  const onDown = useDrag({
    onStart: () => { base.current = api.get(); api.set(base.current); },
    onMove: (d) => { let v = base.current + d.dy; if (v < SNAPS[2]) v = SNAPS[2] - (SNAPS[2] - v) * 0.25; if (v > SNAPS[0]) v = SNAPS[0] + (v - SNAPS[0]) * 0.25; api.set(v); },
    onEnd: (d) => {
      const proj = api.get() + d.vy * 12;
      let best = 0;
      SNAPS.forEach((s, i) => { if (Math.abs(s - proj) < Math.abs(SNAPS[best] - proj)) best = i; });
      if (best !== snap) feel("swipe", 8);
      setSnap(best); api.release(d.vy * 20);
    },
  });
  const go = (i: number) => { setSnap(i); feel("swipe"); };
  const open = clamp((SNAPS[0] - y) / (SNAPS[0] - SNAPS[2]), 0, 1);
  return (
    <AssetCard id="GST-03" title="Bottom Sheet · Snap Points" desc="Шторка с тремя точками фиксации (peek / half / full), бросок по скорости, резинка на краях, фон затемняется и масштабируется." tags={["bottom-sheet", "drag", "snap", "mobile"]} stageClass="p-2">
      <div className="relative overflow-hidden rounded-[28px] bg-ink-950" style={{ height: H }}>
        <div className="absolute inset-0 origin-top p-4 transition-none" style={{ transform: `scale(${1 - open * 0.06})`, borderRadius: open * 24, filter: `brightness(${1 - open * 0.5})` }}>
          <div className="mb-3 text-lg font-extrabold text-white">Markets</div>
          {["BTC", "ETH", "SOL", "TON", "BNB"].map((s, i) => (
            <div key={s} className="mb-2 flex items-center justify-between rounded-2xl bg-ink-800 p-3">
              <span className="text-sm font-extrabold text-white">{s}</span>
              <svg width="70" height="20"><path d={`M0 ${10 + (i % 2 ? -6 : 6)} Q20 ${i * 3} 35 10 T70 ${i % 2 ? 16 : 4}`} fill="none" stroke={i % 2 ? "#ff4d6a" : "#2ee59d"} strokeWidth="2" /></svg>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: open * 0.45 }} />
        <div className="absolute inset-x-0 rounded-t-[28px] bg-gradient-to-b from-ink-600 to-ink-700 shadow-[0_-10px_30px_#0008,inset_0_1px_0_#ffffff22]" style={{ top: y, height: H }}>
          <div onPointerDown={onDown} className="cursor-grab touch-none pb-2 pt-3">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-ink-300/60" />
            <div className="mt-3 flex items-center justify-between px-5">
              <div className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#f7931a] text-xs font-extrabold text-white">₿</span><div><div className="text-sm font-extrabold text-white">Bitcoin</div><div className="font-mono text-[11px] font-bold text-bull">$64,250 +2.4%</div></div></div>
              <Icon name="chevU" size={20} stroke={3} className="text-ink-300 transition-transform" style={{ transform: `rotate(${open * 180}deg)` }} />
            </div>
          </div>
          <div className="px-5" style={{ opacity: clamp(open * 2, 0, 1) }}>
            <svg viewBox="0 0 240 90" className="w-full"><path d="M0 70 L30 60 L60 64 L90 40 L120 48 L150 28 L180 34 L210 16 L240 20" fill="none" stroke="#2ee59d" strokeWidth="3" /><path d="M0 70 L30 60 L60 64 L90 40 L120 48 L150 28 L180 34 L210 16 L240 20 L240 90 L0 90Z" fill="#2ee59d" opacity=".1" /></svg>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[["24h High", "$65,120"], ["24h Low", "$62,880"], ["Volume", "$28.4B"], ["Mkt Cap", "$1.26T"]].map(([a, b]) => <div key={a} className="rounded-xl bg-ink-900/50 p-2"><div className="text-[9px] font-extrabold uppercase text-ink-400">{a}</div><div className="font-mono text-xs font-extrabold text-white">{b}</div></div>)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2" style={{ opacity: clamp((open - 0.5) * 3, 0, 1) }}>
              <Btn v="bull" size="sm">Buy</Btn><Btn v="bear" size="sm">Sell</Btn>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {["Peek", "Half", "Full"].map((l, i) => <button key={l} onClick={() => go(i)} className={cn("rounded-lg px-3 py-1 text-[11px] font-extrabold uppercase", snap === i ? "bg-sky text-white" : "bg-ink-800 text-ink-400")}>{l}</button>)}
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-04 · Pull to refresh ═════════ */
const NEWS = ["ETF inflows hit record $1.2B", "ETH gas fees drop to 3-year low", "SOL DEX volume flips Ethereum", "Fed holds rates — crypto rallies", "TON reaches 900M wallets", "BTC hashrate all-time high"];
function PullRefresh() {
  const [items, setItems] = useState(NEWS.slice(0, 3).map((t, i) => ({ id: i, t, fresh: false })));
  const [pull, setPull] = useState(0);
  const [loading, setLoading] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const n = useRef(3);
  const armed = useRef(false);
  const onDown = useDrag({
    onStart: () => { if (loading || (box.current && box.current.scrollTop > 0)) return false; armed.current = false; },
    onMove: (d) => { const p = Math.max(0, d.dy * 0.45); setPull(p); if (p > 70 && !armed.current) { armed.current = true; feel("tick", 12); } if (p < 70) armed.current = false; },
    onEnd: () => {
      if (armed.current) {
        setLoading(true); setPull(64);
        window.setTimeout(() => {
          const t = NEWS[n.current % NEWS.length];
          setItems((x) => [{ id: n.current, t, fresh: true }, ...x.map((q) => ({ ...q, fresh: false }))].slice(0, 6));
          n.current++;
          setLoading(false); setPull(0); feel("success", 10);
        }, 1300);
      } else setPull(0);
    },
  });
  return (
    <AssetCard id="GST-04" title="Pull to Refresh" desc="Потяни ленту вниз: индикатор вращается пропорционально, щелчок при «взводе», загрузка, новая карточка влетает сверху." tags={["pull-to-refresh", "gesture", "feed"]} stageClass="p-2">
      <div className="relative h-[330px] overflow-hidden rounded-2xl bg-ink-950">
        <div className="absolute inset-x-0 top-0 flex justify-center" style={{ height: pull, opacity: clamp(pull / 50, 0, 1) }}>
          <div className="mt-3 grid h-10 w-10 place-items-center rounded-full bg-ink-700 shadow-[0_4px_0_#081130]" style={{ transform: `scale(${clamp(pull / 70, 0.4, 1)})` }}>
            <Icon name="refresh" size={20} stroke={2.8} className={cn(pull >= 70 || loading ? "text-bull" : "text-ink-300", loading && "anim-spin")} style={loading ? undefined : { transform: `rotate(${pull * 4}deg)` }} />
          </div>
        </div>
        <div ref={box} onPointerDown={onDown} className="no-scrollbar h-full touch-pan-x overflow-y-auto p-3" style={{ transform: `translateY(${pull}px)`, transition: pull === 0 || loading ? "transform .35s cubic-bezier(.3,1.4,.5,1)" : "none" }}>
          <div className="mb-2 text-center text-[10px] font-extrabold uppercase tracking-widest text-ink-500">{pull >= 70 ? "Release to refresh" : "Pull down"}</div>
          {items.map((it) => (
            <div key={it.id} className={cn("mb-2 flex items-center gap-3 rounded-2xl bg-ink-800 p-3", it.fresh && "ring-2 ring-bull")} style={it.fresh ? { animation: "screenUp .5s cubic-bezier(.3,1.4,.5,1) both" } : undefined}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky/15"><Icon name="news" size={18} variant="duo" className="text-sky" /></span>
              <div className="flex-1"><div className="text-sm font-extrabold leading-tight text-white">{it.t}</div><div className="text-[10px] text-ink-400">{it.fresh ? "just now" : "2h ago"}</div></div>
              {it.fresh && <span className="rounded-md bg-bull px-1.5 text-[9px] font-extrabold text-ink-900">NEW</span>}
            </div>
          ))}
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-05 · Spin wheel daily reward ═════════ */
const SEG = [
  { l: "50", t: "gems", c: "#a174ff" }, { l: "10", t: "xp", c: "#ffc53d" }, { l: "200", t: "gems", c: "#3d8bff" }, { l: "25", t: "xp", c: "#2ee59d" },
  { l: "❄", t: "freeze", c: "#5ce1ff" }, { l: "100", t: "gems", c: "#ff8a3d" }, { l: "50", t: "xp", c: "#ff4d6a" }, { l: "500", t: "gems", c: "#ffd76a" },
];
function SpinWheel() {
  const game = useGame();
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);
  const [free, setFree] = useState(true);
  const [b, bump] = useBump();
  const btnRef = useRef<HTMLDivElement>(null);
  const spin = (power = 1) => {
    if (spinning) return;
    if (!free && !game.spend(100)) return;
    setFree(false); setWon(null); setSpinning(true); feel("whoosh", 20);
    const idx = Math.floor(Math.random() * SEG.length);
    const seg = 360 / SEG.length;
    const final = rot - (rot % 360) + 360 * Math.round(5 + power * 2) + (360 - idx * seg - seg / 2);
    setRot(final);
    let delay = 40; let tAcc = 0;
    const tick = () => { sfx.play("spin"); haptic(2); tAcc += delay; delay *= 1.09; if (tAcc < 3800) window.setTimeout(tick, delay); };
    tick();
    window.setTimeout(() => {
      setSpinning(false); setWon(idx); bump(); feel("success", [30, 50, 80]);
      const s = SEG[idx];
      const r = btnRef.current?.getBoundingClientRect();
      const x = r ? r.left + r.width / 2 : undefined, y = r ? r.top + r.height / 2 : undefined;
      if (s.t === "gems") game.reward({ gems: parseInt(s.l), x, y });
      else if (s.t === "xp") game.reward({ xp: parseInt(s.l), x, y });
    }, 4200);
  };
  const onDown = useDrag({ onEnd: (d) => { const v = Math.hypot(d.vx, d.vy); if (v > 8) spin(clamp(v / 30, 0.5, 2)); } });
  const segA = 360 / SEG.length;
  return (
    <AssetCard id="GST-05" title="Daily Spin Wheel" desc="Колесо наград: крути флик-жестом или кнопкой. Щелчки замедляются вместе с колесом, приз летит в HUD. Повтор — 100 💎." tags={["spin", "wheel", "reward", "gacha"]}>
      <div className="relative mx-auto h-60 w-60">
        <div className="absolute -top-1 left-1/2 z-20 -translate-x-1/2" style={{ animation: spinning ? "wiggle .15s linear infinite" : undefined, transformOrigin: "top center" }}>
          <svg width="30" height="36"><path d="M15 34 L3 6 Q15 -2 27 6 Z" fill="#fff" stroke="#c3cdea" strokeWidth="2" /></svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gold to-gold-edge p-2 shadow-[0_6px_0_#8a5c00,0_0_40px_#ffc53d44]">
          {Array.from({ length: 16 }).map((_, i) => <span key={i} className="absolute h-2 w-2 rounded-full bg-white" style={{ left: "50%", top: "50%", transform: `rotate(${i * 22.5}deg) translateY(-114px) translate(-50%,-50%)`, animation: `twinkle 1s ease-in-out ${i * 0.06}s infinite` }} />)}
          <div onPointerDown={onDown} className="relative h-full w-full cursor-grab touch-none overflow-hidden rounded-full" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "transform 4.1s cubic-bezier(.12,.8,.2,1)" : "none" }}>
            <svg viewBox="-100 -100 200 200" className="h-full w-full">
              {SEG.map((s, i) => {
                const a0 = ((i * segA - 90) * Math.PI) / 180, a1 = (((i + 1) * segA - 90) * Math.PI) / 180;
                const mid = ((i + 0.5) * segA - 90) * (Math.PI / 180);
                return (
                  <g key={i}>
                    <path d={`M0 0 L${Math.cos(a0) * 100} ${Math.sin(a0) * 100} A100 100 0 0 1 ${Math.cos(a1) * 100} ${Math.sin(a1) * 100} Z`} fill={s.c} stroke="#0a1330" strokeWidth="1.5" opacity={won === i ? 1 : 0.92} />
                    <text x={Math.cos(mid) * 64} y={Math.sin(mid) * 64} fill="#0a1330" fontSize="15" fontWeight="800" fontFamily="JetBrains Mono" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(i + 0.5) * segA} ${Math.cos(mid) * 64} ${Math.sin(mid) * 64})`}>{s.l}</text>
                    <text x={Math.cos(mid) * 42} y={Math.sin(mid) * 42} fill="#0a1330" fontSize="8" fontWeight="800" textAnchor="middle" dominantBaseline="middle" opacity=".7" transform={`rotate(${(i + 0.5) * segA} ${Math.cos(mid) * 42} ${Math.sin(mid) * 42})`}>{s.t.toUpperCase()}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        <div ref={btnRef} className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <button onClick={() => spin()} disabled={spinning} className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-ink-500 to-ink-800 font-extrabold text-white shadow-[0_4px_0_#050b1f,inset_0_2px_0_#ffffff33] active:translate-y-1">
            <span className="text-[11px] uppercase tracking-wider">{spinning ? "…" : "Spin"}</span>
          </button>
          <Burst trigger={b} count={18} spread={120} />
        </div>
      </div>
      <div className="mt-4 text-center">
        {won !== null ? <div className="anim-pop text-lg font-extrabold" style={{ color: SEG[won].c }}>You won {SEG[won].l} {SEG[won].t}!</div>
          : <div className="text-xs font-bold text-ink-400">{free ? "1 free spin today · flick the wheel" : "Next spin: 100 💎"}</div>}
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-06 · Drag to reorder ═════════ */
const REORD = [
  { id: "a", t: "Проверить новости", i: "news", c: "#3d8bff" }, { id: "b", t: "Разметить уровни", i: "target", c: "#ffc53d" },
  { id: "c", t: "Определить риск", i: "shield", c: "#2ee59d" }, { id: "d", t: "Поставить стоп", i: "lock", c: "#ff4d6a" }, { id: "e", t: "Войти в сделку", i: "rocket", c: "#a174ff" },
];
const RIGHT = ["a", "b", "c", "d", "e"];
function Reorder() {
  const game = useGame();
  const [order, setOrder] = useState(["c", "a", "e", "b", "d"]);
  const [drag, setDrag] = useState<{ id: string; dy: number } | null>(null);
  const [checked, setChecked] = useState<null | boolean>(null);
  const H = 56;
  const startIdx = drag ? order.indexOf(drag.id) : -1;
  const overIdx = drag ? clamp(Math.round(startIdx + drag.dy / H), 0, order.length - 1) : -1;
  const lastOver = useRef(-1);
  const mkDown = (id: string) => (e: RPE) => {
    const sy = e.clientY;
    setDrag({ id, dy: 0 }); feel("pop", 10); setChecked(null);
    const mv = (ev: PointerEvent) => setDrag({ id, dy: ev.clientY - sy });
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up);
      setOrder((o) => {
        const s = o.indexOf(id);
        const t = clamp(Math.round(s + (ev.clientY - sy) / H), 0, o.length - 1);
        const n = [...o]; n.splice(s, 1); n.splice(t, 0, id); return n;
      });
      setDrag(null); sfx.play("tap");
    };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  };
  if (overIdx !== lastOver.current) { if (drag && lastOver.current !== -1) sfx.play("tick"); lastOver.current = overIdx; }
  return (
    <AssetCard id="GST-06" title="Drag to Reorder · Checklist" desc="Упражнение: расставь шаги сделки в правильном порядке. Перетаскивание с подъёмом карточки, остальные раздвигаются." tags={["drag", "reorder", "sortable", "exercise"]}>
      <div className="relative" style={{ height: order.length * H }}>
        {order.map((id, i) => {
          const it = REORD.find((r) => r.id === id)!;
          const isD = drag?.id === id;
          let pos = i;
          if (drag && !isD) { if (i > startIdx && i <= overIdx) pos = i - 1; else if (i < startIdx && i >= overIdx) pos = i + 1; }
          const ok = checked !== null && RIGHT[i] === id;
          return (
            <div key={id} className={cn("absolute inset-x-0 flex h-12 items-center gap-3 rounded-2xl px-3", isD ? "z-20 bg-ink-600 shadow-[0_14px_30px_#000a,0_0_0_2px_#3d8bff]" : "bg-ink-700 shadow-[0_4px_0_#0b1638] transition-all duration-300", checked !== null && (ok ? "ring-2 ring-bull" : "ring-2 ring-bear"))}
              style={{ top: isD ? i * H + (drag?.dy ?? 0) : pos * H, transform: isD ? "scale(1.04) rotate(-1deg)" : undefined }}>
              <span className="font-mono text-xs font-extrabold text-ink-400">{i + 1}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${it.c}22` }}><Icon name={it.i} size={16} variant="duo" style={{ color: it.c }} /></span>
              <span className="flex-1 text-sm font-extrabold text-white">{it.t}</span>
              <button onPointerDown={mkDown(id)} className="cursor-grab touch-none p-1 text-ink-400 active:cursor-grabbing"><Icon name="grid" size={16} /></button>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={cn("text-xs font-extrabold", checked === null ? "text-ink-400" : checked ? "text-bull" : "text-bear")}>{checked === null ? "Тяни за ⋮⋮" : checked ? "Идеальный порядок!" : "Почти — проверь красные"}</span>
        <Btn v="sky" size="sm" onClick={(e) => { const ok = order.join() === RIGHT.join(); setChecked(ok); if (ok) { feel("success"); game.reward({ xp: 20, x: e.clientX, y: e.clientY }); } else feel("error"); }}>Check</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-07 · Draw the trendline ═════════ */
const LOWS = [[20, 150], [70, 128], [120, 118], [170, 96], [220, 84], [270, 64]];
const PRICE = "M10 140 L20 150 L45 110 L70 128 L95 92 L120 118 L145 76 L170 96 L195 58 L220 84 L245 42 L270 64 L290 30";
function Trendline() {
  const game = useGame();
  const svg = useRef<SVGSVGElement>(null);
  const [line, setLine] = useState<null | { x1: number; y1: number; x2: number; y2: number }>(null);
  const [score, setScore] = useState<number | null>(null);
  const lineRef = useRef<null | { x1: number; y1: number; x2: number; y2: number }>(null);
  const pt = (cx: number, cy: number) => { const r = svg.current!.getBoundingClientRect(); return { x: ((cx - r.left) / r.width) * 300, y: ((cy - r.top) / r.height) * 180 }; };
  const onDown = useDrag({
    onStart: (x, y) => { const p = pt(x, y); lineRef.current = { x1: p.x, y1: p.y, x2: p.x, y2: p.y }; setLine(lineRef.current); setScore(null); feel("tap", 5); },
    onMove: (d) => { const p = pt(d.x, d.y); if (lineRef.current) { lineRef.current = { ...lineRef.current, x2: p.x, y2: p.y }; setLine(lineRef.current); } },
    onEnd: (d) => {
      const l = lineRef.current;
      if (!l || Math.abs(l.x2 - l.x1) < 30) { setLine(null); return; }
      const k = (l.y2 - l.y1) / (l.x2 - l.x1);
      const yAt = (x: number) => l.y1 + k * (x - l.x1);
      const diffs = LOWS.map(([x, y]) => y - yAt(x));
      const mean = diffs.reduce((a, b) => a + Math.abs(b), 0) / diffs.length;
      const crossings = diffs.filter((v) => v > 10).length;
      const s = Math.round(clamp(100 - mean * 3 - crossings * 12, 0, 100));
      setScore(s);
      if (s >= 70) { feel("success", 20); game.reward({ xp: Math.round(s / 4), x: d.x, y: d.y }); } else feel("error", 20);
    },
  });
  return (
    <AssetCard id="GST-07" title="Draw the Trendline" desc="Нарисуй линию поддержки пальцем через минимумы. Алгоритм оценивает точность (0–100) и показывает идеальную линию." tags={["draw", "gesture", "exercise", "chart"]}>
      <svg ref={svg} viewBox="0 0 300 180" onPointerDown={onDown} className="well w-full cursor-crosshair touch-none select-none rounded-2xl">
        {[40, 80, 120, 160].map((g) => <line key={g} x1="0" x2="300" y1={g} y2={g} stroke="#ffffff0a" />)}
        <path d={PRICE} fill="none" stroke="#5ce1ff" strokeWidth="2.5" strokeLinejoin="round" />
        {LOWS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="#0a1330" stroke="#5ce1ff" strokeWidth="2" />)}
        {score !== null && <line x1="0" y1="160" x2="300" y2="56" stroke="#2ee59d" strokeWidth="2" strokeDasharray="6 5" opacity=".6" style={{ animation: "fadeIn .4s both" }} />}
        {line && <>
          <line {...line} stroke={score === null ? "#ffc53d" : score >= 70 ? "#2ee59d" : "#ff4d6a"} strokeWidth="3.5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 6px currentColor)" }} />
          <circle cx={line.x1} cy={line.y1} r="6" fill="#fff" /><circle cx={line.x2} cy={line.y2} r="6" fill="#fff" />
        </>}
        {!line && <text x="150" y="30" textAnchor="middle" fill="#8fa0cf" fontSize="11" fontWeight="800">✍ Проведи линию через минимумы</text>}
      </svg>
      <div className="mt-3 flex items-center justify-between">
        {score !== null ? (
          <div className="anim-pop flex items-center gap-3">
            <div className="font-mono text-3xl font-extrabold" style={{ color: score >= 70 ? "#2ee59d" : "#ff4d6a" }}>{score}</div>
            <div className="text-xs font-bold text-ink-300">{score >= 90 ? "Как у профи!" : score >= 70 ? "Хорошая линия" : "Линия пересекает свечи"}</div>
          </div>
        ) : <Label className="mb-0">Accuracy score</Label>}
        <Btn v="ghost" size="sm" onClick={() => { setLine(null); setScore(null); }}><Icon name="refresh" size={14} />Clear</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-08 · Pinch / wheel zoom & pan chart ═════════ */
const BIG = (() => { const o: { o: number; c: number; h: number; l: number }[] = []; let p = 100; for (let i = 0; i < 160; i++) { const op = p; const c = op + Math.sin(i / 7) * 2 + (((i * 7919) % 13) - 6.2) * 0.6; o.push({ o: op, c, h: Math.max(op, c) + ((i * 31) % 5) * 0.4, l: Math.min(op, c) - ((i * 17) % 5) * 0.4 }); p = c; } return o; })();
function ZoomChart() {
  const [view, setView] = useState({ s: 100, n: 40 });
  const box = useRef<HTMLDivElement>(null);
  const ptrs = useRef(new Map<number, number>());
  const pinch0 = useRef<{ d: number; n: number } | null>(null);
  const pan0 = useRef<{ x: number; s: number } | null>(null);
  const setV = (s: number, n: number) => { const nn = clamp(Math.round(n), 12, 160); setView({ n: nn, s: clamp(Math.round(s), 0, 160 - nn) }); };
  const zoomAt = (factor: number, fx = 0.5) => {
    const nn = clamp(view.n * factor, 12, 160);
    setV(view.s + (view.n - nn) * fx, nn); sfx.play("tick");
  };
  const onDown = (e: RPE) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, e.clientX);
    if (ptrs.current.size === 1) pan0.current = { x: e.clientX, s: view.s };
    if (ptrs.current.size === 2) { const [a, b] = [...ptrs.current.values()]; pinch0.current = { d: Math.abs(a - b), n: view.n }; pan0.current = null; }
  };
  const onMove = (e: RPE) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, e.clientX);
    const w = box.current!.clientWidth;
    if (ptrs.current.size === 2 && pinch0.current) { const [a, b] = [...ptrs.current.values()]; const d = Math.abs(a - b); setV(view.s, pinch0.current.n * (pinch0.current.d / Math.max(20, d))); }
    else if (pan0.current) setV(pan0.current.s - ((e.clientX - pan0.current.x) / w) * view.n, view.n);
  };
  const onUp = (e: RPE) => { ptrs.current.delete(e.pointerId); if (ptrs.current.size < 2) pinch0.current = null; if (ptrs.current.size === 0) pan0.current = null; };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const wh = (e: WheelEvent) => { e.preventDefault(); const r = el.getBoundingClientRect(); const fx = (e.clientX - r.left) / r.width; setView((v) => { const nn = clamp(Math.round(v.n * (e.deltaY > 0 ? 1.12 : 0.89)), 12, 160); return { n: nn, s: clamp(Math.round(v.s + (v.n - nn) * fx), 0, 160 - nn) }; }); sfx.play("tick"); };
    el.addEventListener("wheel", wh, { passive: false });
    return () => el.removeEventListener("wheel", wh);
  }, []);
  const vis = BIG.slice(view.s, view.s + view.n);
  const mx = Math.max(...vis.map((c) => c.h)), mn = Math.min(...vis.map((c) => c.l));
  const y = (v: number) => 6 + ((mx - v) / (mx - mn || 1)) * 148;
  const cw = 300 / view.n;
  const all = { mx: Math.max(...BIG.map((c) => c.h)), mn: Math.min(...BIG.map((c) => c.l)) };
  return (
    <AssetCard id="GST-08" title="Pinch · Zoom · Pan Chart" desc="Два пальца — зум, один — панорама, колесо мыши — зум вокруг курсора. Мини-карта показывает видимое окно; клик по ней — переход." tags={["pinch", "zoom", "pan", "chart", "multitouch"]}>
      <div ref={box} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} className="well relative h-44 cursor-grab touch-none select-none overflow-hidden rounded-2xl active:cursor-grabbing">
        <svg viewBox="0 0 300 160" preserveAspectRatio="none" className="h-full w-full">
          {vis.map((c, i) => { const g = c.c >= c.o; const col = g ? "#2ee59d" : "#ff4d6a"; const x = i * cw + cw / 2; return <g key={view.s + i}><line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={Math.max(0.6, cw * 0.1)} /><rect x={x - cw * 0.33} width={cw * 0.66} y={y(Math.max(c.o, c.c))} height={Math.max(1, Math.abs(y(c.o) - y(c.c)))} fill={col} rx={Math.min(2, cw * 0.1)} /></g>; })}
        </svg>
        <span className="absolute right-2 top-2 rounded-md bg-ink-900/70 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-300">{view.n} candles</span>
      </div>
      <div className="relative mt-2 h-10 cursor-pointer overflow-hidden rounded-xl bg-ink-900/60" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setV(((e.clientX - r.left) / r.width) * 160 - view.n / 2, view.n); feel("tap"); }}>
        <svg viewBox="0 0 160 40" preserveAspectRatio="none" className="h-full w-full"><path d={BIG.map((c, i) => `${i ? "L" : "M"}${i} ${4 + ((all.mx - c.c) / (all.mx - all.mn)) * 32}`).join(" ")} fill="none" stroke="#5a70ad" strokeWidth="1" /></svg>
        <div className="absolute inset-y-0 rounded-lg border-2 border-sky bg-sky/15 transition-all duration-100" style={{ left: `${(view.s / 160) * 100}%`, width: `${(view.n / 160) * 100}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Btn v="dark" size="icon" onClick={() => zoomAt(0.75)}><Icon name="plus" size={16} stroke={3} /></Btn>
          <Btn v="dark" size="icon" onClick={() => zoomAt(1.33)}><Icon name="minus" size={16} stroke={3} /></Btn>
        </div>
        <Btn v="ghost" size="sm" onClick={() => setV(120, 40)}>Latest</Btn>
      </div>
    </AssetCard>
  );
}

/* ═════════ GST-09 · Scratch card ═════════ */
const PRIZES = [{ v: 150, t: "gems", c: "#a174ff" }, { v: 40, t: "xp", c: "#ffc53d" }, { v: 300, t: "gems", c: "#5ce1ff" }];
function Scratch() {
  const game = useGame();
  const cv = useRef<HTMLCanvasElement>(null);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const [b, bump] = useBump();
  const prize = PRIZES[round % PRIZES.length];
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.globalCompositeOperation = "source-over";
    const grd = g.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#8fa0cf"); grd.addColorStop(0.5, "#e6ebf8"); grd.addColorStop(1, "#5a70ad");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(10,19,48,.25)";
    for (let i = 0; i < 60; i++) g.fillRect((i * 53) % w, (i * 29) % h, 3, 3);
    g.fillStyle = "#22376f"; g.font = "800 18px Manrope, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("SCRATCH TO WIN", w / 2, h / 2);
    setPct(0); setDone(false);
  }, [round]);
  const scratch = (x: number, y: number) => {
    const c = cv.current!;
    const r = c.getBoundingClientRect();
    const px = x - r.left, py = y - r.top;
    const g = c.getContext("2d")!;
    g.globalCompositeOperation = "destination-out";
    g.lineWidth = 34; g.lineCap = "round";
    g.beginPath();
    const l = last.current ?? { x: px, y: py };
    g.moveTo(l.x, l.y); g.lineTo(px, py); g.stroke();
    last.current = { x: px, y: py };
    sfx.play("tick");
    if (++moves.current % 6 === 0) {
      const data = g.getImageData(0, 0, c.width, c.height).data;
      let clear = 0, tot = 0;
      for (let i = 3; i < data.length; i += 64) { tot++; if (data[i] === 0) clear++; }
      const p = clear / tot;
      setPct(p);
      if (p > 0.55 && !done) {
        setDone(true); bump(); feel("success", [30, 50, 80]);
        if (prize.t === "gems") game.reward({ gems: prize.v, x, y }); else game.reward({ xp: prize.v, x, y });
      }
    }
  };
  const onDown = useDrag({
    onStart: (x, y) => { if (done) return false; last.current = null; scratch(x, y); },
    onMove: (d) => scratch(d.x, d.y),
    onEnd: () => { last.current = null; },
  });
  return (
    <AssetCard id="GST-09" title="Scratch Card Reward" desc="Сотри защитный слой пальцем (canvas). Процент стирания считается в реальном времени, на 55% — автоматическое раскрытие приза." tags={["scratch", "canvas", "reward", "gesture"]}>
      <div className="relative mx-auto h-40 w-full max-w-[300px] overflow-hidden rounded-2xl" style={{ background: `radial-gradient(circle, ${prize.c}55, #111f47 70%)`, boxShadow: `inset 0 0 0 2px ${prize.c}66` }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon name={prize.t === "gems" ? "gem" : "bolt"} size={44} variant="solid" style={{ color: prize.c, filter: `drop-shadow(0 0 12px ${prize.c})` }} className={done ? "anim-pop" : ""} />
          <div className="font-mono text-3xl font-extrabold text-white">+{prize.v}</div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: prize.c }}>{prize.t}</div>
          <Burst trigger={b} count={18} spread={100} />
        </div>
        <canvas ref={cv} onPointerDown={onDown} className="absolute inset-0 h-full w-full cursor-pointer touch-none transition-opacity duration-700" style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="well h-3 flex-1 overflow-hidden rounded-full"><div className="h-full rounded-full bg-gradient-to-r from-violet to-sky transition-[width]" style={{ width: `${Math.min(100, (pct / 0.55) * 100)}%` }} /></div>
        <span className="font-mono text-xs font-extrabold text-ink-300">{Math.round(pct * 100)}%</span>
        <Btn v="ghost" size="sm" onClick={() => setRound((r) => r + 1)}>New</Btn>
      </div>
    </AssetCard>
  );
}

export default function Gestures() {
  return (
    <Section id="gestures" num="10" title="Gestures & Swipes" subtitle="Свайпы, шторки, pull-to-refresh, колесо, перетаскивание, рисование, мультитач, скретч">
      <SwipeDeck />
      <SwipeList />
      <BottomSheet />
      <PullRefresh />
      <SpinWheel />
      <Reorder />
      <Trendline />
      <ZoomChart />
      <Scratch />
    </Section>
  );
}
