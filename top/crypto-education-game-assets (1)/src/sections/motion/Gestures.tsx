import { useEffect, useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Phone, haptic } from "../../components/ui";
import { Icon } from "../../components/icons";
import { fx } from "../../lib/game";
import { sfx } from "../../lib/sound";
import { clamp, mulberry32, useDrag, useRaf } from "../../lib/motion";
import { cn } from "../../utils/cn";

/* =====================================================================
 * M-14 · SWIPE-TO-ACTION ROWS — reveal actions, full-swipe delete, undo
 * ===================================================================== */
type Alert = { id: number; t: string; d: string; i: string; c: string };
const ALERTS: Alert[] = [
  { id: 1, t: "BTC crossed $64,000", d: "Price alert · 2m", i: "bell", c: "#f7931a" },
  { id: 2, t: "Stop-loss triggered", d: "SOL Long · 14m", i: "shield", c: "#ff4d6d" },
  { id: 3, t: "New lesson unlocked", d: "Fibonacci · 1h", i: "book", c: "#3e8bff" },
  { id: 4, t: "You moved up a league!", d: "Diamond · 3h", i: "trophy", c: "#ffc23d" },
  { id: 5, t: "Whale moved 5,000 ETH", d: "On-chain · 5h", i: "eye", c: "#9170ff" },
];

function SwipeRow({
  item,
  openId,
  setOpenId,
  pinned,
  onPin,
  onRemove,
}: {
  item: Alert;
  openId: number | null;
  setOpenId: (id: number | null) => void;
  pinned: boolean;
  onPin: () => void;
  onRemove: (kind: "delete" | "archive") => void;
}) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [gone, setGone] = useState(false);
  const base = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const OPEN_L = -148;
  const OPEN_R = 76;
  useEffect(() => {
    if (openId !== item.id && !dragging) setX(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);
  const remove = (kind: "delete" | "archive") => {
    const w = rowRef.current?.offsetWidth ?? 300;
    setX(-w - 20);
    sfx("swipe");
    setTimeout(() => setGone(true), 220);
    setTimeout(() => onRemove(kind), 520);
  };
  const bind = useDrag((s) => {
    if (s.first) {
      base.current = x;
      return;
    }
    if (!s.last) {
      if (!s.moved || Math.abs(s.dy) > Math.abs(s.dx) * 1.2) return;
      setDragging(true);
      let nx = base.current + s.dx;
      if (nx > OPEN_R) nx = OPEN_R + (nx - OPEN_R) * 0.35;
      setX(nx);
      if (openId !== item.id) setOpenId(item.id);
      return;
    }
    setDragging(false);
    if (!s.moved) {
      if (x !== 0) setX(0);
      return;
    }
    const nx = base.current + s.dx;
    const w = rowRef.current?.offsetWidth ?? 300;
    if (nx < -w * 0.62 || (nx < -90 && s.vx < -1.3)) remove("delete");
    else if (nx < -50 || s.vx < -0.5) {
      setX(OPEN_L);
      sfx("tick");
    } else if (nx > 56) {
      onPin();
      setX(0);
      sfx("pop");
      haptic(15);
    } else setX(0);
  });
  const deleteW = Math.max(74, -x - 74);
  return (
    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: gone ? 0 : 80, marginBottom: gone ? 0 : 8, opacity: gone ? 0 : 1 }}>
      <div ref={rowRef} className="relative h-[68px] overflow-hidden rounded-2xl bg-ink-950">
        <div className="absolute inset-y-0 left-0 flex items-center bg-gold pl-6 text-ink-950" style={{ width: Math.max(0, x) + 20 }}>
          <div className="flex flex-col items-center text-[10px] font-black uppercase" style={{ transform: `scale(${clamp(x / OPEN_R, 0.5, 1.15)})` }}>
            <Icon name="star" size={20} stroke={2.6} />
            {pinned ? "Unpin" : "Pin"}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex">
          <button onClick={() => remove("archive")} className="flex w-[74px] flex-col items-center justify-center bg-azure text-[10px] font-black uppercase text-white" style={{ opacity: clamp(-x / 74, 0, 1) }}>
            <Icon name="layers" size={18} stroke={2.6} />
            Archive
          </button>
          <button onClick={() => remove("delete")} className="flex flex-col items-center justify-center bg-bear text-[10px] font-black uppercase text-white transition-[width] duration-75" style={{ width: deleteW }}>
            <Icon name="x" size={18} stroke={3} />
            Delete
          </button>
        </div>
        <div
          {...bind}
          className="absolute inset-0 flex cursor-grab items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-b from-ink-700 to-ink-750 px-3 active:cursor-grabbing"
          style={{ transform: `translateX(${x}px)`, transition: dragging ? "none" : "transform .45s cubic-bezier(.3,1.25,.5,1)", touchAction: "pan-y" }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${item.c}26`, color: item.c }}>
            <Icon name={item.i} size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 truncate text-sm font-extrabold text-white">
              {pinned && <span className="text-gold">★</span>}
              {item.t}
            </div>
            <div className="text-[11px] font-semibold text-ink-400">{item.d}</div>
          </div>
          <span className="h-2 w-2 rounded-full bg-azure" />
        </div>
      </div>
    </div>
  );
}

function SwipeRows() {
  const [items, setItems] = useState(ALERTS);
  const [openId, setOpenId] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number[]>([4]);
  const [undo, setUndo] = useState<{ item: Alert; idx: number; kind: string } | null>(null);
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 3500);
    return () => clearTimeout(t);
  }, [undo]);
  const sorted = [...items].sort((a, b) => Number(pinned.includes(b.id)) - Number(pinned.includes(a.id)));
  return (
    <Asset title="Swipe-to-Action Rows" code="M-14" tags="swipe row actions delete archive pin undo list gesture inbox" span={4}>
      <div className="relative min-h-[420px]">
        {sorted.map((it) => (
          <SwipeRow
            key={it.id}
            item={it}
            openId={openId}
            setOpenId={setOpenId}
            pinned={pinned.includes(it.id)}
            onPin={() => setPinned((p) => (p.includes(it.id) ? p.filter((x) => x !== it.id) : [...p, it.id]))}
            onRemove={(kind) => {
              const idx = items.findIndex((x) => x.id === it.id);
              setItems((l) => l.filter((x) => x.id !== it.id));
              setUndo({ item: it, idx, kind });
            }}
          />
        ))}
        {!items.length && (
          <div className="anim-pop flex flex-col items-center py-12 text-center">
            <span className="text-4xl">📭</span>
            <div className="mt-2 font-display text-sm font-black text-white">Inbox zero!</div>
            <Btn variant="ghost" size="sm" className="mt-3" onClick={() => setItems(ALERTS)}>
              Restore
            </Btn>
          </div>
        )}
        {undo && (
          <div className="anim-slide-up absolute inset-x-0 bottom-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink-900 shadow-[0_4px_0_#8ea4d2]">
            <span className="flex-1 truncate">
              {undo.kind === "delete" ? "Deleted" : "Archived"}: {undo.item.t}
            </span>
            <button
              className="font-black text-azure"
              onClick={() => {
                setItems((l) => {
                  const n = [...l];
                  n.splice(undo.idx, 0, undo.item);
                  return n;
                });
                setUndo(null);
                sfx("pop");
              }}
            >
              UNDO
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 text-[11px] font-bold text-ink-500">← reveal · full ← delete · → pin</div>
    </Asset>
  );
}

/* =====================================================================
 * M-15 · DRAGGABLE BOTTOM SHEET — snap points, velocity, iOS card depth
 * ===================================================================== */
function BottomSheet() {
  const H = 560;
  const SNAPS = [H - 120, Math.round(H * 0.45), 64];
  const [y, setY] = useState(SNAPS[0]);
  const [drag, setDrag] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const base = useRef(0);
  const bind = useDrag(
    (s) => {
      if (s.first) {
        base.current = y;
        setDrag(true);
        return;
      }
      if (!s.last) {
        let ny = base.current + s.dy;
        if (ny < SNAPS[2]) ny = SNAPS[2] - (SNAPS[2] - ny) * 0.3;
        if (ny > SNAPS[0]) ny = SNAPS[0] + (ny - SNAPS[0]) * 0.3;
        setY(ny);
        return;
      }
      setDrag(false);
      const proj = base.current + s.dy + s.vy * 200;
      const t = SNAPS.reduce((a, b) => (Math.abs(b - proj) < Math.abs(a - proj) ? b : a));
      if (t !== base.current) sfx("tick");
      setY(t);
    },
    { capture: "immediate" },
  );
  const prog = clamp((SNAPS[0] - y) / (SNAPS[0] - SNAPS[2]), 0, 1);
  const tr = drag ? "none" : "transform .5s cubic-bezier(.2,.9,.3,1.08), border-radius .5s, opacity .5s";
  return (
    <Asset title="Draggable Bottom Sheet" code="M-15" tags="bottom sheet drawer drag snap points velocity modal mobile ios" span={4}>
      <Phone width={300} height={H} screenClass="bg-black">
        <div className="absolute inset-0 origin-top overflow-hidden bg-ink-900" style={{ transform: `scale(${1 - prog * 0.07}) translateY(${prog * 14}px)`, borderRadius: prog * 26, transition: tr }}>
          <div className="px-5 pt-12">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7931a] font-display text-xs font-black text-white">₿</span>
              <div>
                <div className="text-xs font-black text-white">BTC / USDT</div>
                <div className="text-[10px] font-bold text-ink-400">Bitcoin · Perp</div>
              </div>
              <Chip tone="bull" className="ml-auto">+4.2%</Chip>
            </div>
            <div className="mt-4 font-mono text-3xl font-bold text-white">$64,250</div>
            <svg viewBox="0 0 260 150" className="mt-3 w-full">
              <defs>
                <linearGradient id="bsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22d39a" stopOpacity=".35" />
                  <stop offset="1" stopColor="#22d39a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 120 L20 110 L40 115 L60 90 L80 96 L100 70 L120 78 L140 52 L160 60 L180 38 L200 46 L220 24 L240 30 L260 12 L260 150 L0 150Z" fill="url(#bsArea)" />
              <path d="M0 120 L20 110 L40 115 L60 90 L80 96 L100 70 L120 78 L140 52 L160 60 L180 38 L200 46 L220 24 L240 30 L260 12" stroke="#22d39a" strokeWidth="2.5" fill="none" />
            </svg>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["1H", "1D", "1W"].map((t) => (
                <span key={t} className="rounded-lg bg-ink-800 py-1 text-center text-[10px] font-black text-ink-300">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: prog * 0.45, transition: drag ? "none" : "opacity .5s" }} />
        <div className="absolute inset-x-0 top-0 flex flex-col rounded-t-[28px] border-t border-white/10 bg-gradient-to-b from-ink-700 to-ink-800 shadow-[0_-16px_40px_rgba(0,0,0,.5)]" style={{ height: H, transform: `translateY(${y}px)`, transition: tr }}>
          <div {...bind} className="cursor-grab touch-none px-5 pb-3 pt-2.5 active:cursor-grabbing">
            <div className="mx-auto h-1.5 w-11 rounded-full bg-ink-400" />
            <div className="mt-3 flex items-center justify-between">
              <div className="font-display text-base font-black text-white">Trade BTC</div>
              <span className="text-[10px] font-black uppercase text-ink-400">{prog > 0.8 ? "Full" : prog > 0.3 ? "Half" : "Peek"}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-6" style={{ maxHeight: H - y - 70 }}>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-ink-950/60 p-1">
              {(["buy", "sell"] as const).map((s) => (
                <button key={s} onClick={() => setSide(s)} className={cn("h-9 rounded-xl text-xs font-black uppercase transition", side === s ? (s === "buy" ? "bg-bull text-ink-950" : "bg-bear text-white") : "text-ink-400")}>
                  {s}
                </button>
              ))}
            </div>
            <div className="panel-inset mt-3 flex items-center justify-between rounded-2xl px-4 py-3">
              <span className="text-xs font-bold text-ink-400">Amount</span>
              <span className="font-mono text-lg font-bold text-white">$250.00</span>
            </div>
            <button className={cn("btn3d mt-3 h-12 w-full rounded-2xl text-sm", side === "buy" ? "v-bull" : "v-bear")}>{side === "buy" ? "Buy" : "Sell"} BTC</button>
            <div className="mt-5 text-[10px] font-black uppercase tracking-widest text-ink-400">Recent trades</div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 py-2.5 text-xs font-bold">
                <span className={i % 3 ? "text-bull" : "text-bear"}>{i % 3 ? "Buy" : "Sell"}</span>
                <span className="font-mono text-ink-200">{(64250 - i * 13.5).toLocaleString()}</span>
                <span className="font-mono text-ink-400">{(0.012 * (i + 1)).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>
      </Phone>
      <div className="mt-3 flex justify-center gap-2">
        {["Peek", "Half", "Full"].map((l, i) => (
          <button key={l} onClick={() => { setY(SNAPS[i]); sfx("tick"); }} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-black transition", Math.abs(y - SNAPS[i]) < 4 ? "bg-azure text-white" : "text-ink-400 hover:text-white")}>
            {l}
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-16 · PULL TO REFRESH — native overscroll + candle loader
 * ===================================================================== */
const FEED = [
  { t: "ETH ETF inflows hit record", s: "Bloomberg", tm: "5m" },
  { t: "SOL breaks key resistance", s: "The Block", tm: "12m" },
  { t: "Fed minutes: rates on hold", s: "Reuters", tm: "30m" },
  { t: "Whale accumulates 2,000 BTC", s: "Whale Alert", tm: "1h" },
  { t: "New DeFi exploit patched", s: "Rekt News", tm: "2h" },
  { t: "DOGE rallies on social buzz", s: "CoinDesk", tm: "3h" },
  { t: "Stablecoin supply at new high", s: "Glassnode", tm: "4h" },
];
const FRESH = ["BTC reclaims $65k 🚀", "Funding rates flip positive", "Altseason index jumps", "L2 activity at record", "Options expiry: $4B today"];

function PullRefresh() {
  const ref = useRef<HTMLDivElement>(null);
  const PULL = 84;
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState(FEED.map((f, i) => ({ ...f, id: i, fresh: false })));
  const armed = useRef(false);
  const idle = useRef(0);
  const down = useRef(false);
  const mouse = useRef<{ y: number; st: number } | null>(null);
  const n = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = PULL;
  }, []);
  const doRefresh = () => {
    const el = ref.current;
    if (!el) return;
    setRefreshing(true);
    sfx("whoosh");
    el.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const t = FRESH[n.current++ % FRESH.length];
      setItems((l) => [{ t, s: "Just now", tm: "now", id: Date.now(), fresh: true }, ...l]);
      setRefreshing(false);
      sfx("success");
      el.scrollTo({ top: PULL, behavior: "smooth" });
    }, 1500);
  };
  const settle = () => {
    const el = ref.current;
    if (!el || down.current || refreshing) return;
    if (el.scrollTop < PULL) {
      if (armed.current) doRefresh();
      else el.scrollTo({ top: PULL, behavior: "smooth" });
    }
    armed.current = false;
  };
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const st = el.scrollTop;
    const p = clamp(1 - st / PULL, 0, 1);
    setPull(p);
    if (refreshing) return;
    if (st <= 3) {
      if (!armed.current) sfx("tick");
      armed.current = true;
    }
    clearTimeout(idle.current);
    idle.current = window.setTimeout(settle, 160);
  };
  const label = refreshing ? "Updating markets…" : pull >= 0.98 ? "Release to refresh" : "Pull to refresh";
  return (
    <Asset title="Pull to Refresh" code="M-16" tags="pull to refresh overscroll loader feed mobile gesture" span={4}>
      <Phone width={300} height={560}>
        <div className="absolute inset-x-0 top-0 z-10 h-11 bg-ink-900" />
        <div
          ref={ref}
          onScroll={onScroll}
          onTouchStart={() => (down.current = true)}
          onTouchEnd={() => {
            down.current = false;
            settle();
          }}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" || !ref.current) return;
            down.current = true;
            mouse.current = { y: e.clientY, st: ref.current.scrollTop };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!mouse.current || !ref.current) return;
            ref.current.scrollTop = mouse.current.st - (e.clientY - mouse.current.y);
          }}
          onPointerUp={() => {
            if (!mouse.current) return;
            mouse.current = null;
            down.current = false;
            settle();
          }}
          className="no-scrollbar absolute inset-x-0 bottom-0 top-11 cursor-grab select-none overflow-y-auto overscroll-contain active:cursor-grabbing"
        >
          <div className="flex flex-col items-center justify-center" style={{ height: PULL }}>
            <div className="flex h-8 items-end gap-1" style={{ transform: `scale(${0.6 + pull * 0.4})`, opacity: 0.3 + pull * 0.7 }}>
              {[0.5, 0.8, 0.4, 1, 0.65].map((h, i) => (
                <span
                  key={i}
                  className={cn("w-1.5 origin-bottom rounded-sm", i % 2 ? "bg-bear" : "bg-bull")}
                  style={{ height: 32 * h * (refreshing ? 1 : Math.max(0.15, pull)), animation: refreshing ? `bar-grow .6s ${i * 0.1}s ease-in-out infinite alternate` : undefined }}
                />
              ))}
            </div>
            <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-ink-300">{label}</div>
          </div>
          <div className="px-4 pb-8">
            <div className="mb-3 font-display text-lg font-black text-white">Market feed</div>
            {items.map((it) => (
              <div key={it.id} className={cn("mb-2 flex items-center gap-3 rounded-2xl p-3", it.fresh ? "anim-slide-down bg-azure/15 ring-1 ring-azure/40" : "bg-ink-800")}>
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", it.fresh ? "bg-azure text-white" : "bg-ink-700 text-ink-300")}>
                  <Icon name={it.fresh ? "sparkle" : "bell"} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-extrabold text-white">{it.t}</div>
                  <div className="text-[10px] font-bold text-ink-400">
                    {it.s} · {it.tm}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Phone>
      <div className="mt-3 text-center text-[11px] font-bold text-ink-500">Drag / wheel / swipe down at the top</div>
    </Asset>
  );
}

/* =====================================================================
 * M-17 · HOLD-TO-CONFIRM + SLIDE-TO-CONFIRM — deliberate trade gestures
 * ===================================================================== */
function HoldConfirm() {
  const [p, setP] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const holdRef = useRef(false);
  const q = useRef(0);
  const btnRef = useRef<HTMLButtonElement>(null);
  useRaf((dt) => {
    setP((prev) => clamp(holdRef.current ? prev + dt / 1.3 : prev - dt * 2.6, 0, 1));
  }, (holding || p > 0) && !done);
  useEffect(() => {
    const quarter = Math.floor(p * 4);
    if (holding && quarter > q.current) {
      sfx("charge", 1 + quarter * 0.25);
      haptic(12);
    }
    q.current = quarter;
    if (p >= 1 && !done) {
      setDone(true);
      holdRef.current = false;
      setHolding(false);
      sfx("success");
      haptic(40);
      fx.burst(btnRef.current, { colors: ["#ff4d6d", "#ffc23d", "#fff"], count: 30, spread: 110 });
      setTimeout(() => {
        setDone(false);
        setP(0);
      }, 1800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);
  const r = 46;
  const c = 2 * Math.PI * r;
  const start = () => {
    if (done) return;
    holdRef.current = true;
    setHolding(true);
  };
  const stop = () => {
    holdRef.current = false;
    setHolding(false);
  };
  return (
    <div className="flex flex-col items-center">
      <button
        ref={btnRef}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        className="relative h-32 w-32 touch-none select-none"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#0a1330" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={done ? "#22d39a" : "#ff4d6d"} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ filter: `drop-shadow(0 0 6px ${done ? "#22d39a" : "#ff4d6d"})` }} />
        </svg>
        <span
          className={cn("absolute inset-3 flex flex-col items-center justify-center rounded-full font-display text-xs font-black text-white transition-all", done ? "bg-bull text-ink-950" : "bg-gradient-to-b from-[#ff7d95] to-bear")}
          style={{ transform: `scale(${1 - p * 0.08})`, boxShadow: done ? "0 5px 0 #0c8f63" : `0 ${5 - p * 4}px 0 #b31f3d` }}
        >
          {done ? <Icon name="check" size={34} stroke={3.5} className="anim-pop" /> : <><Icon name="warning" size={22} /> HOLD</>}
        </span>
      </button>
      <div className="mt-3 text-center">
        <div className="font-display text-sm font-black text-white">{done ? "Position closed" : "Close all positions"}</div>
        <div className="text-[11px] font-bold text-ink-400">Hold 1.3s · release cancels</div>
      </div>
    </div>
  );
}

function SlideConfirm() {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [done, setDone] = useState(false);
  const base = useRef(0);
  const max = () => (track.current ? track.current.clientWidth - 64 : 200);
  const bind = useDrag(
    (s) => {
      if (done) return;
      if (s.first) {
        base.current = x;
        setDrag(true);
        return;
      }
      if (!s.last) {
        const nx = clamp(base.current + s.dx, 0, max());
        if (Math.floor(nx / 40) !== Math.floor(x / 40)) sfx("tick");
        setX(nx);
        return;
      }
      setDrag(false);
      if (base.current + s.dx >= max() * 0.9) {
        setX(max());
        setDone(true);
        sfx("success");
        haptic(40);
        fx.burst(track.current, { colors: ["#22d39a", "#2fd4ff", "#fff"], count: 26, spread: 100 });
        setTimeout(() => {
          setDone(false);
          setX(0);
        }, 1900);
      } else setX(0);
    },
    { capture: "immediate" },
  );
  const m = max();
  return (
    <div className="w-full">
      <div ref={track} className={cn("relative h-16 overflow-hidden rounded-full p-1 transition-colors duration-300", done ? "bg-bull" : "panel-inset")}>
        <div className="absolute inset-y-1 left-1 rounded-full bg-bull/25" style={{ width: x + 56 }} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pl-10 font-display text-sm font-black" style={{ opacity: done ? 1 : 1 - x / (m || 1) }}>
          {done ? <span className="text-ink-950">Order placed ✓</span> : <span className="text-shine">Slide to buy BTC →</span>}
        </div>
        <div
          {...bind}
          className="relative z-10 flex h-14 w-14 cursor-grab touch-none items-center justify-center rounded-full bg-gradient-to-b from-white to-ink-200 text-ink-900 shadow-[0_4px_0_#6f86b8,0_8px_16px_rgba(0,0,0,.4)] active:cursor-grabbing"
          style={{ transform: `translateX(${x}px)`, transition: drag ? "none" : "transform .5s cubic-bezier(.3,1.4,.5,1)" }}
        >
          <Icon name={done ? "check" : "chevronRight"} size={24} stroke={3.2} />
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-400">Prevents accidental orders</div>
    </div>
  );
}

function ConfirmGestures() {
  return (
    <Asset title="Hold & Slide to Confirm" code="M-17" tags="hold to confirm long press slide to confirm unlock gesture safety" span={6}>
      <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        <HoldConfirm />
        <SlideConfirm />
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-18 · RADIAL MENU — long-press to open, drag-to-select (game wheel)
 * ===================================================================== */
const WHEEL = [
  { i: "trendUp", l: "Buy", c: "#22d39a" },
  { i: "trendDown", l: "Sell", c: "#ff4d6d" },
  { i: "bell", l: "Alert", c: "#ffc23d" },
  { i: "star", l: "Watch", c: "#3e8bff" },
  { i: "share", l: "Share", c: "#9170ff" },
  { i: "info", l: "Info", c: "#2fd4ff" },
];

function RadialMenu() {
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState<number | null>(null);
  const [charge, setCharge] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [pressing, setPressing] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const downAt = useRef(0);
  const longPress = useRef(false);
  const R = 96;
  useRaf(() => {
    const c = clamp((performance.now() - downAt.current) / 420, 0, 1);
    setCharge(c);
    if (c >= 1 && !open) {
      setOpen(true);
      longPress.current = true;
      sfx("pop");
      haptic(20);
    }
  }, pressing && !open);
  const angleIdx = (cx: number, cy: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    const dx = cx - (r.left + r.width / 2);
    const dy = cy - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 38) return null;
    const a = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    return ((Math.round(a / 60) % 6) + 6) % 6;
  };
  const select = (i: number) => {
    setPicked(WHEEL[i].l);
    setOpen(false);
    setHl(null);
    sfx("success");
    const r = boxRef.current?.getBoundingClientRect();
    if (r) fx.burst({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, { colors: [WHEEL[i].c, "#fff"], count: 20, spread: 80 });
  };
  return (
    <Asset title="Radial Menu · Long-press" code="M-18" tags="radial menu pie wheel long press context menu drag select game" span={6}>
      <div
        ref={boxRef}
        className="relative mx-auto h-[280px] w-[280px] touch-none select-none"
        onPointerMove={(e) => {
          if (!open) return;
          const i = angleIdx(e.clientX, e.clientY);
          if (i !== hl) {
            setHl(i);
            if (i !== null) sfx("tick");
          }
        }}
        onPointerUp={() => {
          const wasPress = pressing;
          setPressing(false);
          setCharge(0);
          if (!wasPress) return;
          if (longPress.current) {
            longPress.current = false;
            if (open && hl !== null) return select(hl);
            setOpen(false);
            setHl(null);
            return;
          }
          if (open && hl !== null) return select(hl);
          setOpen((o) => !o);
          setHl(null);
          sfx("pop");
        }}
      >
        <div className={cn("absolute inset-6 rounded-full border-2 border-dashed border-ink-600 transition-all duration-500", open ? "scale-100 opacity-100" : "scale-50 opacity-0")} />
        {WHEEL.map((w, i) => {
          const a = ((-90 + i * 60) * Math.PI) / 180;
          const x = Math.cos(a) * R;
          const y = Math.sin(a) * R;
          const on = hl === i;
          return (
            <button
              key={w.l}
              onClick={() => open && select(i)}
              onPointerEnter={() => open && setHl(i)}
              className="absolute left-1/2 top-1/2 -ml-7 -mt-7 flex h-14 w-14 flex-col items-center justify-center rounded-2xl text-white"
              style={{
                transform: open ? `translate(${x}px, ${y}px) scale(${on ? 1.22 : 1})` : "translate(0,0) scale(.3)",
                opacity: open ? 1 : 0,
                background: `linear-gradient(180deg, color-mix(in srgb, ${w.c} 80%, white), ${w.c})`,
                boxShadow: on ? `0 4px 0 color-mix(in srgb, ${w.c} 45%, black), 0 0 24px ${w.c}` : `0 4px 0 color-mix(in srgb, ${w.c} 45%, black)`,
                transition: `transform .35s ${open ? i * 0.03 : 0}s cubic-bezier(.3,1.5,.5,1), opacity .25s, box-shadow .2s`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              <Icon name={w.i} size={20} stroke={2.8} />
              <span className="text-[9px] font-black uppercase">{w.l}</span>
            </button>
          );
        })}
        <button
          onPointerDown={(e) => {
            downAt.current = performance.now();
            longPress.current = false;
            setPressing(true);
            boxRef.current?.setPointerCapture(e.pointerId);
          }}
          className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2"
        >
          <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#9170ff" strokeWidth="5" strokeLinecap="round" strokeDasharray={226} strokeDashoffset={226 * (1 - (open ? 1 : charge))} style={{ transition: open ? "stroke-dashoffset .2s" : "none" }} />
          </svg>
          <span className={cn("absolute inset-2 flex items-center justify-center rounded-full bg-[#f7931a] font-display text-lg font-black text-white shadow-[0_4px_0_#a35e00] transition-transform", (pressing || open) && "scale-90")}>₿</span>
        </button>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="text-[11px] font-bold text-ink-500">Long-press & drag, or tap then choose</span>
        {picked && (
          <Chip key={picked + Date.now()} tone="violet" className="anim-pop">
            Selected: {picked}
          </Chip>
        )}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * M-19 · ZOOM & PAN CHART — wheel, drag, pinch, minimap brush
 * ===================================================================== */
function ZoomChart() {
  const TOTAL = 160;
  const data = useMemo(() => {
    const r = mulberry32(2024);
    let p = 50000;
    return Array.from({ length: TOTAL }, (_, i) => {
      const o = p;
      p = p * (1 + (r() - 0.48) * 0.025 + Math.sin(i / 14) * 0.002);
      return { o, c: p, h: Math.max(o, p) * (1 + r() * 0.01), l: Math.min(o, p) * (1 - r() * 0.01) };
    });
  }, []);
  const [view, setView] = useState({ s: 100, n: 60 });
  const [armed, setArmed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const ptrs = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef<{ s: number; n: number; x: number; dist: number; midF: number } | null>(null);
  const fit = (s: number, n: number) => {
    const nn = clamp(n, 15, TOTAL);
    return { s: clamp(s, 0, TOTAL - nn), n: nn };
  };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!armed && !e.ctrlKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const f = clamp((e.clientX - r.left) / r.width, 0, 1);
      setView((v) => {
        const anchor = v.s + f * v.n;
        const nn = v.n * (e.deltaY > 0 ? 1.12 : 0.89);
        return fit(anchor - f * nn, nn);
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [armed]);
  const begin = () => {
    const pts = [...ptrs.current.values()];
    const r = box.current!.getBoundingClientRect();
    if (pts.length >= 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      g.current = { s: view.s, n: view.n, x: 0, dist, midF: ((pts[0].x + pts[1].x) / 2 - r.left) / r.width };
    } else if (pts.length === 1) g.current = { s: view.s, n: view.n, x: pts[0].x, dist: 0, midF: 0 };
  };
  const W = 720;
  const H = 260;
  const start = Math.floor(view.s);
  const end = Math.min(TOTAL, Math.ceil(view.s + view.n) + 1);
  const vis = data.slice(start, end);
  const max = Math.max(...vis.map((d) => d.h));
  const min = Math.min(...vis.map((d) => d.l));
  const y = (v: number) => 10 + ((max - v) / (max - min || 1)) * (H - 20);
  const cw = W / view.n;
  const mm = data.map((d, i) => `${i ? "L" : "M"}${(i / (TOTAL - 1)) * W},${40 - ((d.c - 40000) / 30000) * 36}`).join("");
  return (
    <Asset title="Zoom & Pan Chart" code="M-19" tags="zoom pan pinch chart wheel drag minimap brush gesture candlestick" span={12}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip tone="azure">Zoom {(TOTAL / view.n).toFixed(1)}×</Chip>
        <Chip tone={armed ? "bull" : "ink"}>{armed ? "Wheel zoom active" : "Click chart to enable wheel zoom"}</Chip>
        <div className="ml-auto flex gap-2">
          <Btn variant="ghost" size="iconSm" onClick={() => setView((v) => fit(v.s + v.n * 0.1, v.n * 0.8))}>
            <Icon name="plus" size={16} stroke={3} />
          </Btn>
          <Btn variant="ghost" size="iconSm" onClick={() => setView((v) => fit(v.s - v.n * 0.125, v.n * 1.25))}>
            <Icon name="minus" size={16} stroke={3} />
          </Btn>
          <Btn variant="ghost" size="sm" onClick={() => setView({ s: 0, n: TOTAL })}>
            Fit all
          </Btn>
        </div>
      </div>
      <div
        ref={box}
        className={cn("panel-inset relative cursor-grab touch-none select-none overflow-hidden rounded-2xl active:cursor-grabbing", armed && "ring-2 ring-bull/50")}
        onClick={() => setArmed(true)}
        onDoubleClick={() => setView({ s: 100, n: 60 })}
        onPointerLeave={() => setArmed(false)}
        onPointerDown={(e) => {
          ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          e.currentTarget.setPointerCapture(e.pointerId);
          begin();
        }}
        onPointerMove={(e) => {
          if (!ptrs.current.has(e.pointerId) || !g.current) return;
          ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          const r = box.current!.getBoundingClientRect();
          const pts = [...ptrs.current.values()];
          const G = g.current;
          if (pts.length >= 2 && G.dist) {
            const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const nn = G.n * (G.dist / d);
            const anchor = G.s + G.midF * G.n;
            setView(fit(anchor - G.midF * nn, nn));
          } else if (pts.length === 1) {
            setView(fit(G.s - ((pts[0].x - G.x) / r.width) * G.n, G.n));
          }
        }}
        onPointerUp={(e) => {
          ptrs.current.delete(e.pointerId);
          begin();
        }}
        onPointerCancel={(e) => {
          ptrs.current.delete(e.pointerId);
          begin();
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          {[0.2, 0.4, 0.6, 0.8].map((gg) => (
            <line key={gg} x1="0" x2={W} y1={H * gg} y2={H * gg} stroke="#16295a" />
          ))}
          {vis.map((d, k) => {
            const i = start + k;
            const x = (i - view.s) * cw;
            const col = d.c >= d.o ? "#22d39a" : "#ff4d6d";
            return (
              <g key={i}>
                <line x1={x + cw / 2} x2={x + cw / 2} y1={y(d.h)} y2={y(d.l)} stroke={col} strokeWidth={Math.max(1, Math.min(2, cw / 8))} />
                <rect x={x + cw * 0.15} y={y(Math.max(d.o, d.c))} width={Math.max(1, cw * 0.7)} height={Math.max(1.5, Math.abs(y(d.o) - y(d.c)))} fill={col} rx={Math.min(2, cw / 6)} />
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-ink-950/70 px-2 py-1 font-mono text-[10px] font-bold text-ink-200">
          ${Math.round(max).toLocaleString()}
        </div>
        <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-ink-950/70 px-2 py-1 font-mono text-[10px] font-bold text-ink-200">
          ${Math.round(min).toLocaleString()}
        </div>
      </div>
      <div
        className="relative mt-3 h-12 cursor-pointer touch-none overflow-hidden rounded-xl bg-ink-950/60"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const r = e.currentTarget.getBoundingClientRect();
          setView((v) => fit(((e.clientX - r.left) / r.width) * TOTAL - v.n / 2, v.n));
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          const r = e.currentTarget.getBoundingClientRect();
          setView((v) => fit(((e.clientX - r.left) / r.width) * TOTAL - v.n / 2, v.n));
        }}
      >
        <svg viewBox={`0 0 ${W} 44`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d={mm} stroke="#5c79b5" strokeWidth="1.5" fill="none" />
        </svg>
        <div className="absolute inset-y-0 rounded-lg border-2 border-cyan bg-cyan/10 shadow-[0_0_12px_rgba(47,212,255,.4)]" style={{ left: `${(view.s / TOTAL) * 100}%`, width: `${(view.n / TOTAL) * 100}%` }} />
      </div>
      <div className="mt-2 text-[11px] font-bold text-ink-500">Drag to pan · pinch or wheel (after click) to zoom · double-click to reset · drag the minimap brush</div>
    </Asset>
  );
}

export { SwipeRows, BottomSheet, PullRefresh, ConfirmGestures, RadialMenu, ZoomChart };
