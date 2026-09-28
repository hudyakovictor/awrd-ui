import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Label } from "../../components/ui";
import { CoinIcon, GemIcon, Icon, XPIcon } from "../../components/icons";
import { sfx } from "../../lib/sound";
import { clamp, useDrag, useElementThrough, useFlip, useSpring } from "../../lib/motion";
import { Glitch } from "../../lib/fx2";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-26 · STICKY STACKING CARDS — cards pile with scale + dim on scroll
 * ===================================================================== */
const STACK = [
  { t: "Learn the basics", d: "Candles, trends and market structure in tiny lessons.", c1: "#3e8bff", c2: "#1c55c2", i: "book", xp: 450 },
  { t: "Master risk", d: "Position sizing, stop-losses and the 1% rule.", c1: "#22d39a", c2: "#0c8f63", i: "shield", xp: 380 },
  { t: "Read order flow", d: "Footprint, DOM and whale prints decoded.", c1: "#9170ff", c2: "#5a3ccc", i: "layers", xp: 520 },
  { t: "Trade live", d: "Paper trade with real-time prices and zero risk.", c1: "#ff7a2f", c2: "#c24a0c", i: "chart", xp: 600 },
];
function StickyStack() {
  const box = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  useElementThrough(box, (p) => {
    const n = STACK.length;
    const seg = 1 / n;
    cards.current.forEach((el, i) => {
      if (!el) return;
      const start = i * seg;
      const t = clamp((p - 0.12 - start) / (seg * 0.9), 0, 1);
      const left = 1 - t;
      el.style.transform = `translateY(${i * 44}px) scale(${1 - (1 - left) * 0.05 - Math.max(0, (n - 1 - i) * 0)})`;
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) {
        inner.style.transform = `scale(${0.92 + 0.08 * Math.min(1, t + 1 / n)})`;
        inner.style.filter = `brightness(${0.55 + 0.45 * Math.min(1, (p - 0.12 - start) / seg + 1)})`;
      }
    });
  });
  return (
    <Asset title="Sticky Stacking Cards" code="M-26" tags="sticky stack cards scroll scale pile deck course" span={6}>
      <div ref={box} className="relative" style={{ height: STACK.length * 300 + 200 }}>
        {STACK.map((c, i) => (
          <div key={c.t} ref={(el) => { cards.current[i] = el; }} className="sticky" style={{ top: 120 + i * 44, height: 280 }}>
            <div className="h-[260px] overflow-hidden rounded-3xl p-6 text-white shadow-[0_10px_0_#081231,0_24px_48px_rgba(0,0,0,.5)] ring-1 ring-white/15 will-change-transform" style={{ background: `linear-gradient(140deg, ${c.c1}, ${c.c2})` }}>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                  <Icon name={c.i} size={24} />
                </span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Module {i + 1}</div>
                  <div className="font-display text-xl font-black">{c.t}</div>
                </div>
                <span className="ml-auto flex items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-xs font-black">
                  <XPIcon size={14} /> {c.xp}
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm font-semibold opacity-85">{c.d}</p>
              <div className="mt-5 flex gap-2">
                <span className="rounded-xl bg-white px-4 py-2 text-xs font-black text-ink-900">Start</span>
                <span className="rounded-xl bg-black/20 px-4 py-2 text-xs font-black">Preview</span>
              </div>
              <span className="pointer-events-none absolute -bottom-6 right-4 font-display text-[120px] font-black leading-none text-white/10">
                {i + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-27 · DRAGGABLE GRID — reorder tiles with FLIP + live placeholder
 * ===================================================================== */
const TILES = [
  { s: "BTC", c: "#f7931a" },
  { s: "ETH", c: "#627eea" },
  { s: "SOL", c: "#14f195" },
  { s: "BNB", c: "#f3ba2f" },
  { s: "XRP", c: "#9ca3af" },
  { s: "ADA", c: "#3468d1" },
  { s: "DOGE", c: "#c2a633" },
  { s: "AVAX", c: "#e84142" },
];
function DragGrid() {
  const [order, setOrder] = useState(TILES.map((_, i) => i));
  const [drag, setDrag] = useState<number | null>(null);
  const [ghost, setGhost] = useState({ x: 0, y: 0, dx: 0, dy: 0 });
  const box = useRef<HTMLDivElement>(null);
  const start = useRef({ x: 0, y: 0 });
  useFlip(box, [order]);
  const onDown = (e: React.PointerEvent, slot: number) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    start.current = { x: e.clientX, y: e.clientY };
    setGhost({ x: r.left, y: r.top, dx: 0, dy: 0 });
    setDrag(slot);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    sfx("select");
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag === null || !box.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    setGhost((g) => ({ ...g, dx, dy }));
    const els = [...box.current.querySelectorAll<HTMLElement>("[data-slot]")];
    const cx = e.clientX;
    const cy = e.clientY;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      const slot = Number(el.dataset.slot);
      if (cx > r.left && cx < r.right && cy > r.top && cy < r.bottom && slot !== drag) {
        setOrder((o) => {
          const n = [...o];
          const moving = o[drag];
          n.splice(drag, 1);
          n.splice(slot, 0, moving);
          return n;
        });
        setDrag(slot);
        sfx("tick");
      }
    });
  };
  const tile = TILES[order[drag ?? 0]];
  return (
    <Asset title="Draggable Grid · FLIP" code="M-27" tags="drag grid reorder flip sortable tiles watchlist dashboard" span={6}>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-bold text-ink-400">Drag tiles to reorder your dashboard</div>
        <Btn variant="ghost" size="sm" onClick={() => setOrder(TILES.map((_, i) => i))}>
          Reset
        </Btn>
      </div>
      <div ref={box} className="relative grid grid-cols-4 gap-3 select-none" style={{ touchAction: "none" }}>
        {order.map((ti, slot) => {
          const t = TILES[ti];
          const hidden = drag === slot;
          return (
            <div
              key={t.s}
              data-flip={t.s}
              data-slot={slot}
              onPointerDown={(e) => onDown(e, slot)}
              onPointerMove={onMove}
              onPointerUp={() => {
                setDrag(null);
                sfx("tap");
              }}
              onPointerCancel={() => setDrag(null)}
              className={cn(
                "flex aspect-square cursor-grab flex-col items-center justify-center rounded-2xl ring-1 ring-white/10 transition active:cursor-grabbing",
                hidden && "opacity-20",
              )}
              style={{ background: `linear-gradient(160deg, ${t.c}, color-mix(in srgb, ${t.c} 40%, #0a1330))`, boxShadow: `0 5px 0 color-mix(in srgb, ${t.c} 35%, black)` }}
            >
              <span className="font-display text-lg font-black text-white">{t.s}</span>
              <span className="font-mono text-[10px] font-bold text-white/70">#{slot + 1}</span>
            </div>
          );
        })}
        {drag !== null && (
          <div
            className="pointer-events-none fixed z-50 flex h-[76px] w-[76px] flex-col items-center justify-center rounded-2xl ring-2 ring-white/60"
            style={{
              left: ghost.x + ghost.dx,
              top: ghost.y + ghost.dy,
              width: 76,
              background: `linear-gradient(160deg, ${tile.c}, color-mix(in srgb, ${tile.c} 40%, #0a1330))`,
              boxShadow: "0 18px 36px rgba(0,0,0,.55)",
              transform: "scale(1.1) rotate(-4deg)",
            }}
          >
            <span className="font-display text-base font-black text-white">{tile.s}</span>
          </div>
        )}
      </div>
      <div className="mt-3 text-[11px] font-bold text-ink-500">FLIP-animated reflow · ghost follows the pointer</div>
    </Asset>
  );
}

/* =====================================================================
 * M-28 · KANBAN BOARD — drag cards between columns
 * ===================================================================== */
type Card = { id: string; t: string; tag: string; c: string };
const COLS = [
  { id: "todo", t: "To learn", c: "#3e8bff" },
  { id: "doing", t: "Practicing", c: "#ffc23d" },
  { id: "done", t: "Mastered", c: "#22d39a" },
];
function Kanban() {
  const [cols, setCols] = useState<Record<string, Card[]>>({
    todo: [
      { id: "k1", t: "Fibonacci retracements", tag: "TA", c: "#3e8bff" },
      { id: "k2", t: "Funding rates", tag: "Perp", c: "#9170ff" },
      { id: "k3", t: "Liquidity pools", tag: "DeFi", c: "#22d39a" },
    ],
    doing: [{ id: "k4", t: "RSI divergence", tag: "TA", c: "#3e8bff" }],
    done: [{ id: "k5", t: "Candlestick basics", tag: "TA", c: "#3e8bff" }],
  });
  const [drag, setDrag] = useState<{ id: string; from: string } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const counts = COLS.map((c) => cols[c.id].length);
  return (
    <Asset title="Kanban · Learning Board" code="M-28" tags="kanban board drag columns tasks learning plan" span={6}>
      <div className="grid grid-cols-3 gap-3">
        {COLS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(col.id);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/card");
              if (!id || !drag) return;
              setCols((cs) => {
                if (drag.from === col.id) return cs;
                const card = cs[drag.from].find((c) => c.id === id)!;
                return { ...cs, [drag.from]: cs[drag.from].filter((c) => c.id !== id), [col.id]: [...cs[col.id], card] };
              });
              setDrag(null);
              setOver(null);
              sfx("pop");
            }}
            className={cn("rounded-2xl p-2 transition-all", over === col.id ? "bg-white/10 ring-2 ring-white/30" : "bg-ink-950/40")}
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: col.c }} />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink-200">{col.t}</span>
              <span className="ml-auto rounded-md bg-ink-800 px-1.5 font-mono text-[10px] font-bold text-ink-300">{cols[col.id].length}</span>
            </div>
            <div className="min-h-[150px] space-y-2">
              {cols[col.id].map((card) => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/card", card.id);
                    setDrag({ id: card.id, from: col.id });
                    sfx("select");
                  }}
                  onDragEnd={() => {
                    setDrag(null);
                    setOver(null);
                  }}
                  className={cn(
                    "cursor-grab rounded-xl border-l-4 bg-gradient-to-b from-ink-700 to-ink-800 p-2.5 shadow-[0_3px_0_#0b1838] transition active:cursor-grabbing",
                    drag?.id === card.id && "rotate-2 scale-105 opacity-80",
                    col.id === "done" && "opacity-80",
                  )}
                  style={{ borderColor: card.c }}
                >
                  <div className={cn("text-xs font-extrabold text-white", col.id === "done" && "line-through opacity-70")}>{card.t}</div>
                  <span className="mt-1 inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase" style={{ background: `${card.c}26`, color: card.c }}>
                    {card.tag}
                  </span>
                </div>
              ))}
              {over === col.id && drag && <div className="h-16 rounded-xl border-2 border-dashed border-white/30" />}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-2 flex-1 gap-1 overflow-hidden rounded-full">
          {counts.map((n, i) => (
            <div key={i} className="h-full rounded-full transition-all" style={{ width: `${(n / 5) * 100}%`, background: COLS[i].c }} />
          ))}
        </div>
        <span className="text-[11px] font-bold text-ink-400">Drag cards · touch: long-press not needed on desktop</span>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-29 · CHART LENS — magnifier loupe follows the pointer
 * ===================================================================== */
function ChartLens() {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(2.2);
  const W = 520;
  const H = 200;
  const data = useMemo(() => {
    let p = 100;
    const r = (i: number) => Math.sin(i * 12.9898) * 43758.5453 % 1;
    return Array.from({ length: 70 }, (_, i) => {
      const o = p;
      p = p + (Math.abs(r(i)) - 0.45) * 4 + Math.sin(i / 7) * 0.8;
      return { o, c: p, h: Math.max(o, p) + Math.abs(r(i + 99)) * 1.6, l: Math.min(o, p) - Math.abs(r(i + 55)) * 1.6 };
    });
  }, []);
  const max = Math.max(...data.map((d) => d.h));
  const min = Math.min(...data.map((d) => d.l));
  const cw = W / data.length;
  const y = (v: number) => 10 + ((max - v) / (max - min)) * (H - 20);
  const Chart = ({ id }: { id: string }) => (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" key={id}>
      {data.map((d, i) => {
        const col = d.c >= d.o ? "#22d39a" : "#ff4d6d";
        return (
          <g key={i}>
            <line x1={i * cw + cw / 2} x2={i * cw + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth="1.4" />
            <rect x={i * cw + 1} y={y(Math.max(d.o, d.c))} width={cw - 2} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} fill={col} rx="1" />
          </g>
        );
      })}
    </svg>
  );
  const move = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    setPos({ x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) });
  };
  const L = 150;
  return (
    <Asset title="Chart Lens · Magnifier" code="M-29" tags="magnifier lens loupe zoom chart inspect hover" span={6}>
      <div className="mb-3 flex items-center gap-3">
        <Label className="mb-0">Zoom</Label>
        {[1.6, 2.2, 3].map((z) => (
          <button key={z} onClick={() => setZoom(z)} className={cn("rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition", zoom === z ? "bg-azure text-white" : "text-ink-400 hover:text-white")}>
            {z}×
          </button>
        ))}
        <span className="ml-auto text-[11px] font-bold text-ink-500">Hover / drag over the chart</span>
      </div>
      <div ref={box} onPointerMove={move} onPointerLeave={() => setPos(null)} onPointerDown={move} className="panel-inset relative cursor-none overflow-hidden rounded-2xl">
        <Chart id="base" />
        {pos && (
          <div
            className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-[3px] border-white shadow-[0_10px_30px_rgba(0,0,0,.6)]"
            style={{ width: L, height: L, left: `calc(${pos.x * 100}% - ${L / 2}px)`, top: `calc(${pos.y * 100}% - ${L / 2}px)` }}
          >
            <div className="absolute" style={{ width: `${100 * zoom}%`, left: `${-(pos.x * 100 * zoom - 50)}%`, top: `${-(pos.y * 100 * zoom - 50)}%` }}>
              <Chart id="zoom" />
            </div>
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,.4)", background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.18), transparent 50%)" }} />
            <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-cyan" />
            <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-cyan" />
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-30 · ELASTIC TABS — spring pill + swipeable panels
 * ===================================================================== */
const ETABS = [
  { t: "Overview", c: "#3e8bff", body: "Portfolio health, allocation and today's movers at a glance." },
  { t: "Positions", c: "#22d39a", body: "3 open positions · +$412 unrealized · margin 12%." },
  { t: "Orders", c: "#ffc23d", body: "2 limit orders waiting · 1 stop armed below support." },
  { t: "History", c: "#9170ff", body: "Win rate 58% · avg R 1.8 · best pair SOL/USDT." },
];
function ElasticTabs() {
  const [tab, setTab] = useState(1);
  const [dragX, setDragX] = useState(0);
  const pill = useSpring(tab, { stiffness: 260, damping: 17 });
  const bind = useDrag((s) => {
    if (!s.last) {
      setDragX(s.dx);
      return;
    }
    if (s.dx < -60 && tab < ETABS.length - 1) {
      setTab(tab + 1);
      sfx("swipe");
    } else if (s.dx > 60 && tab > 0) {
      setTab(tab - 1);
      sfx("swipe");
    }
    setDragX(0);
  });
  return (
    <Asset title="Elastic Tabs + Swipe" code="M-30" tags="tabs elastic spring pill swipe panels segmented" span={6}>
      <div className="panel-inset relative flex rounded-2xl p-1">
        <div
          className="absolute bottom-1 top-1 rounded-xl transition-[background] duration-300"
          style={{
            left: `calc(${(pill * 100) / ETABS.length}% + 4px)`,
            width: `calc(${100 / ETABS.length}% - 8px)`,
            background: `linear-gradient(180deg, color-mix(in srgb, ${ETABS[Math.round(clamp(pill, 0, 3))].c} 80%, white), ${ETABS[Math.round(clamp(pill, 0, 3))].c})`,
            boxShadow: `0 3px 0 color-mix(in srgb, ${ETABS[Math.round(clamp(pill, 0, 3))].c} 50%, black)`,
          }}
        />
        {ETABS.map((t, i) => (
          <button key={t.t} onClick={() => { setTab(i); sfx("select"); }} className={cn("relative z-10 h-10 flex-1 text-xs font-extrabold uppercase tracking-wider transition-colors", Math.round(pill) === i ? "text-white" : "text-ink-400 hover:text-ink-200")}>
            {t.t}
          </button>
        ))}
      </div>
      <div className="relative mt-4 h-[150px] overflow-hidden rounded-2xl" style={{ touchAction: "pan-y" }} {...bind}>
        {ETABS.map((t, i) => {
          const rel = i - tab;
          return (
            <div
              key={t.t}
              className="absolute inset-0 flex flex-col justify-center rounded-2xl p-5"
              style={{
                background: `linear-gradient(140deg, color-mix(in srgb, ${t.c} 30%, #0d1a3d), #0d1a3d)`,
                transform: `translateX(calc(${rel * 100}% + ${dragX}px)) scale(${rel === 0 ? 1 : 0.94})`,
                opacity: Math.abs(rel) > 1 ? 0 : 1 - Math.abs(rel) * 0.35 - Math.abs(dragX) / 800,
                transition: dragX ? "none" : "transform .5s cubic-bezier(.2,.9,.3,1.05), opacity .4s",
                zIndex: rel === 0 ? 2 : 1,
              }}
            >
              <div className="font-display text-lg font-black" style={{ color: t.c }}>
                {t.t}
              </div>
              <div className="mt-1 text-sm font-semibold text-ink-200">{t.body}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {ETABS.map((t, i) => (
          <span key={t.t} className="h-1.5 rounded-full transition-all" style={{ width: i === tab ? 20 : 8, background: i === tab ? t.c : "#27427d" }} />
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-31 · MORPHING FAB — speed-dial with staggered pop
 * ===================================================================== */
function MorphFab() {
  const [open, setOpen] = useState(false);
  const actions = [
    { i: "trendUp", l: "Long", c: "#22d39a" },
    { i: "trendDown", l: "Short", c: "#ff4d6d" },
    { i: "bell", l: "Alert", c: "#ffc23d" },
    { i: "book", l: "Learn", c: "#3e8bff" },
  ];
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Asset title="Morphing FAB · Speed Dial" code="M-31" tags="fab floating action button speed dial expand actions" span={4} bodyClass="min-h-[330px]">
      <div className="relative h-[280px] overflow-hidden rounded-2xl bg-ink-950/40">
        <div className="absolute inset-0 p-4">
          <div className="font-display text-base font-black text-white">BTC / USDT</div>
          <div className="font-mono text-2xl font-bold text-bull">$64,250</div>
          <svg viewBox="0 0 260 90" className="mt-2 w-full opacity-60">
            <path d="M0 70 L30 60 L55 64 L85 44 L110 50 L140 30 L170 36 L200 18 L230 24 L260 8" stroke="#22d39a" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
        <div className={cn("absolute inset-0 bg-ink-950/50 backdrop-blur-[1px] transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setOpen(false)} />
        {actions.map((a, i) => {
          const ang = (-90 - 32 * i - 10) * (Math.PI / 180);
          const R = 96;
          const x = Math.cos(ang) * R;
          const y = Math.sin(ang) * R;
          return (
            <div key={a.l} className="absolute bottom-6 right-6 flex items-center gap-2" style={{ transform: open ? `translate(${x}px, ${y}px)` : "translate(0,0) scale(.4)", opacity: open ? 1 : 0, transition: `all .4s ${open ? (actions.length - i) * 0.05 : 0}s cubic-bezier(.3,1.5,.5,1)`, pointerEvents: open ? "auto" : "none", zIndex: 10 }}>
              <span className="whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-[11px] font-black text-white shadow">{a.l}</span>
              <button
                onClick={() => {
                  setPicked(a.l);
                  setOpen(false);
                  sfx("pop");
                  setTimeout(() => setPicked(null), 1500);
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${a.c} 80%, white), ${a.c})`, boxShadow: `0 4px 0 color-mix(in srgb, ${a.c} 45%, black)` }}
              >
                <Icon name={a.i} size={20} stroke={2.8} />
              </button>
            </div>
          );
        })}
        <button
          onClick={() => {
            setOpen((o) => !o);
            sfx(open ? "tap" : "pop");
          }}
          className={cn("btn3d absolute bottom-6 right-6 z-20 h-14 w-14 rounded-full", open ? "v-bear" : "v-azure")}
        >
          <span className="transition-transform duration-400" style={{ transform: open ? "rotate(135deg)" : "none", display: "inline-flex" }}>
            <Icon name="plus" size={24} stroke={3} />
          </span>
        </button>
        {picked && <div className="anim-pop absolute left-4 top-4 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-ink-900 shadow">Action: {picked}</div>}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-32 · CUSTOM CONTEXT MENU — right-click with spring + sub-hints
 * ===================================================================== */
function ContextMenu() {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const items = [
    { i: "trendUp", l: "Buy BTC", hint: "B", c: "#22d39a" },
    { i: "trendDown", l: "Sell BTC", hint: "S", c: "#ff4d6d" },
    { i: "bell", l: "Set alert", hint: "A", c: "#ffc23d" },
    { i: "star", l: "Add to watchlist", hint: "W", c: "#3e8bff" },
    { i: "copy", l: "Copy price", hint: "C", c: "#8ea4d2" },
    { i: "share", l: "Share chart", hint: "", c: "#9170ff" },
  ];
  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("pointerdown", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);
  const act = (l: string) => {
    setLog((x) => [l, ...x].slice(0, 4));
    setMenu(null);
    sfx("pop");
  };
  return (
    <Asset title="Context Menu" code="M-32" tags="context menu right click custom dropdown actions shortcuts" span={4} bodyClass="min-h-[330px]">
      <div
        ref={box}
        onContextMenu={(e) => {
          e.preventDefault();
          const r = box.current!.getBoundingClientRect();
          setMenu({ x: clamp(e.clientX - r.left, 8, r.width - 220), y: clamp(e.clientY - r.top, 8, r.height - 280) });
          sfx("select");
        }}
        className="relative flex h-[280px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-950/40"
      >
        <CoinIcon size={56} className="anim-float" />
        <div className="mt-3 font-display text-base font-black text-white">Right-click me</div>
        <div className="text-[11px] font-bold text-ink-500">Long-press works on touch too</div>
        <div className="mt-4 space-y-1 text-center">
          {log.map((l, i) => (
            <div key={`${l}${i}`} className="anim-slide-up text-[11px] font-bold text-ink-300" style={{ opacity: 1 - i * 0.25 }}>
              ✓ {l}
            </div>
          ))}
        </div>
        {menu && (
          <div
            className="absolute z-20 w-[210px] origin-top-left overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.6)] backdrop-blur-xl"
            style={{ left: menu.x, top: menu.y, animation: "pop-in .25s cubic-bezier(.3,1.5,.5,1) both" }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {items.map((it, i) => (
              <button
                key={it.l}
                onClick={() => act(it.l)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-extrabold text-ink-100 transition hover:bg-white/10"
                style={{ animation: `slide-in-right .25s ${i * 0.03}s both` }}
              >
                <span style={{ color: it.c }}>
                  <Icon name={it.i} size={16} stroke={2.6} />
                </span>
                {it.l}
                {it.hint && <kbd className="ml-auto rounded bg-ink-700 px-1.5 font-mono text-[10px] text-ink-300">{it.hint}</kbd>}
              </button>
            ))}
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-33 · GLITCH + DECODER BANNER — system alert with scramble text
 * ===================================================================== */
const MSGS = ["VOLATILITY SPIKE DETECTED", "WHALE ALERT: 5,000 BTC MOVED", "FUNDING RATE FLIPPED POSITIVE", "BREAKOUT CONFIRMED ON SOL"];
function GlitchBanner() {
  const [mi, setMi] = useState(0);
  const [txt, setTxt] = useState("");
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!on) return;
    const target = MSGS[mi % MSGS.length];
    const chars = "₿Ξ$#%/\\|<>*+";
    let frame = 0;
    const t = setInterval(() => {
      frame++;
      setTxt(
        target
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            const reveal = frame * 2 - i * 3;
            if (reveal > 6) return ch;
            if (reveal > 0) return chars[Math.floor(Math.random() * chars.length)];
            return "·";
          })
          .join(""),
      );
      if (frame * 2 > target.length * 3 + 8) {
        clearInterval(t);
        setTimeout(() => setMi((m) => m + 1), 2200);
      }
    }, 40);
    return () => clearInterval(t);
  }, [mi, on]);
  return (
    <Asset title="Alert Decoder Banner" code="M-33" tags="glitch scramble decode text alert banner terminal hacker" span={4}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-bear/50 bg-black p-5">
        <div className="bg-grid absolute inset-0 opacity-30" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-bear to-transparent anim-glow" />
        <div className="relative flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-bear">
          <span className="h-2 w-2 rounded-full bg-bear anim-glow" /> Live wire
          <button onClick={() => setOn((o) => !o)} className="ml-auto rounded bg-white/10 px-2 py-0.5 text-white/70 hover:text-white">
            {on ? "❚❚" : "▶"}
          </button>
        </div>
        <div className="relative mt-3 min-h-[64px] font-mono text-lg font-bold leading-relaxed text-white">
          {on ? <Glitch text={txt} /> : <span className="text-ink-500">— paused —</span>}
          <span className="ml-1 inline-block h-5 w-2.5 translate-y-1 bg-bear" style={{ animation: "blink .8s steps(1) infinite" }} />
        </div>
        <div className="relative mt-3 flex gap-2">
          <GemIcon size={16} />
          <span className="text-[11px] font-bold text-ink-400">Decoding market wire… tap pause to freeze</span>
        </div>
      </div>
    </Asset>
  );
}

export { StickyStack, DragGrid, Kanban, ChartLens, ElasticTabs, MorphFab, ContextMenu, GlitchBanner };
