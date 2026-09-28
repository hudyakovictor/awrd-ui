import { AnimatePresence, motion } from "framer-motion";
import { Activity, ChevronDown, ChevronUp, Gauge, RotateCcw, Volume2, VolumeX, Vibrate } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFx, type Intensity } from "../fx/fx";
import { STAT_KEYS, resetStats, useStats, type StatKey } from "../fx/stats";

const META: Record<StatKey, { label: string; color: string }> = {
  effects: { label: "Effects", color: "#fb923c" },
  flash: { label: "Flash", color: "#ffffff" },
  particles: { label: "Particles", color: "#fbbf24" },
  shake: { label: "Shake", color: "#f97316" },
  haptic: { label: "Haptic", color: "#8b5cf6" },
  sound: { label: "Sound", color: "#3b82f6" },
  success: { label: "Success", color: "#22c55e" },
  error: { label: "Error", color: "#ef4444" },
  combo: { label: "Combo", color: "#f472b6" },
  lock: { label: "Lock", color: "#fb923c" },
  reveal: { label: "Reveal", color: "#60a5fa" },
};

const fmt = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(1)}k` : n.toLocaleString("en-US"));

function Counter({ k, value, hit }: { k: StatKey; value: number; hit: number }) {
  const m = META[k];
  const [lit, setLit] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value > prev.current) {
      setLit(true);
      const t = window.setTimeout(() => setLit(false), 380);
      prev.current = value;
      return () => window.clearTimeout(t);
    }
    prev.current = value;
  }, [value, hit]);
  const wide = k === "effects" || k === "particles";
  return (
    <div
      className={`relative overflow-hidden rounded-xl px-2.5 py-2 transition-[box-shadow,background] duration-300 ${wide ? "col-span-2" : ""}`}
      style={{
        background: lit ? `linear-gradient(145deg, ${m.color}33, rgba(8,12,26,.95))` : "linear-gradient(180deg, #060a14, #0b1124)",
        boxShadow: lit ? `inset 0 0 0 1.5px ${m.color}, 0 0 16px ${m.color}55` : "inset 3px 3px 7px rgba(2,5,18,.85), inset -2px -2px 5px rgba(255,255,255,.05)",
      }}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider text-white/45">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color, boxShadow: lit ? `0 0 8px ${m.color}` : undefined, opacity: lit ? 1 : 0.6 }} />
        {m.label}
      </div>
      <motion.div
        key={value}
        initial={lit ? { scale: 1.25, y: -2 } : false}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        className={`font-mono font-bold tabular-nums leading-tight ${wide ? "text-[22px]" : "text-[18px]"}`}
        style={{ color: value ? m.color : "rgba(255,255,255,.3)", textShadow: lit ? `0 0 10px ${m.color}` : undefined }}
      >
        {fmt(value)}
      </motion.div>
    </div>
  );
}

/** 30-second activity histogram, sampled once per second from the effects counter */
function Activity30() {
  const { counts } = useStats();
  const last = useRef(counts.effects);
  const [bins, setBins] = useState<number[]>(() => Array(30).fill(0));
  const cur = useRef(counts.effects);
  cur.current = counts.effects;
  useEffect(() => {
    const id = window.setInterval(() => {
      const d = Math.max(0, cur.current - last.current);
      last.current = cur.current;
      setBins((b) => [...b.slice(1), d]);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (counts.effects === 0) {
      last.current = 0;
      setBins(Array(30).fill(0));
    }
  }, [counts.effects]);
  const max = Math.max(4, ...bins);
  return (
    <div className="flex h-10 items-end gap-[2px]" aria-label="Effects per second, last 30 seconds">
      {bins.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-t-sm transition-[height] duration-300"
          style={{ height: `${Math.max(6, (v / max) * 100)}%`, background: v ? `linear-gradient(180deg, #fbbf24, #f97316)` : "rgba(255,255,255,.08)", boxShadow: v && i === bins.length - 1 ? "0 0 8px #f97316" : undefined }}
        />
      ))}
    </div>
  );
}

function Controls() {
  const fx = useFx();
  return (
    <>
      <div className="mt-3">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white/45">
          <Gauge size={13} strokeWidth={3} /> Intensity
        </div>
        <div className="inset-well grid grid-cols-3 gap-1 rounded-xl p-1" role="radiogroup" aria-label="Effect intensity">
          {(["low", "normal", "high"] as Intensity[]).map((i) => (
            <button
              key={i}
              role="radio"
              aria-checked={fx.intensity === i}
              onClick={() => { fx.setIntensity(i); fx.sfx("click"); }}
              className="h-8 rounded-lg text-[12px] font-black uppercase tracking-wide transition-all"
              style={fx.intensity === i ? { background: "linear-gradient(180deg,#fb923c,#f97316)", color: "#fff", boxShadow: "0 3px 0 #c2410c, 0 0 12px rgba(249,115,22,.5)" } : { color: "rgba(255,255,255,.5)" }}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5">
        <button onClick={() => fx.setSound(!fx.sound)} aria-pressed={fx.sound} className={`btn-3d flex h-9 items-center justify-center gap-1 rounded-xl text-[11.5px] font-black ${fx.sound ? "text-[#60a5fa]" : "text-white/45"}`} style={{ background: "linear-gradient(145deg,#1e2a49,#141c31)" }}>
          {fx.sound ? <Volume2 size={14} strokeWidth={3} /> : <VolumeX size={14} strokeWidth={3} />} SFX
        </button>
        <button onClick={() => fx.setHaptics(!fx.haptics)} aria-pressed={fx.haptics} className={`btn-3d flex h-9 items-center justify-center gap-1 rounded-xl text-[11.5px] font-black ${fx.haptics ? "text-[#a78bfa]" : "text-white/45"}`} style={{ background: "linear-gradient(145deg,#1e2a49,#141c31)" }}>
          <Vibrate size={14} strokeWidth={3} /> HAPT
        </button>
        <button onClick={() => fx.setSpeed(fx.speed === 1 ? 0.5 : fx.speed === 0.5 ? 0.25 : 1)} className="btn-3d flex h-9 items-center justify-center gap-1 rounded-xl text-[11.5px] font-black text-[#fbbf24]" style={{ background: "linear-gradient(145deg,#1e2a49,#141c31)" }} title="Cycle speed">
          {fx.speed}×
        </button>
      </div>
    </>
  );
}

function Feed() {
  const { log } = useStats();
  const items = log.slice(-6).reverse();
  return (
    <div className="inset-well mt-3 h-[118px] overflow-hidden rounded-xl px-2.5 py-2" aria-live="off">
      <div className="mb-1 text-[10px] font-black uppercase tracking-[.18em] text-[#fb923c]/70">Event feed</div>
      {items.length === 0 ? (
        <div className="pt-4 text-center text-[12px] font-bold text-white/30">Interact with any block…</div>
      ) : (
        <div className="space-y-[3px] font-mono text-[11.5px]">
          <AnimatePresence initial={false}>
            {items.map((e, i) => (
              <motion.div key={e.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - i * 0.13, x: 0 }} className="flex items-center gap-1.5 truncate">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: META[e.key].color }} />
                <span className="truncate text-white/75">{e.label}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Header({ right }: { right?: React.ReactNode }) {
  const { counts, startedAt } = useStats();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const sec = Math.max(0, Math.floor((now - startedAt) / 1000));
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "rgba(249,115,22,.18)", boxShadow: "inset 2px 2px 4px rgba(0,0,0,.5)" }}>
        <Activity size={16} strokeWidth={3} className="text-[#fb923c]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-[14px] font-black leading-none tracking-wide">VFX CONSOLE</div>
        <div className="mt-1 font-mono text-[11px] font-bold text-white/40">
          session {String(Math.floor(sec / 60)).padStart(2, "0")}:{String(sec % 60).padStart(2, "0")} · {fmt(counts.effects)} fx
        </div>
      </div>
      {right}
    </div>
  );
}

function ResetButton() {
  const fx = useFx();
  return (
    <button onClick={() => { resetStats(); fx.sfx("close"); }} className="duo-btn duo-ghost duo-btn-sm mt-3 w-full !h-10">
      <RotateCcw size={15} strokeWidth={3} /> Reset session
    </button>
  );
}

function Grid() {
  const { counts, hits } = useStats();
  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5">
      {STAT_KEYS.map((k) => (
        <Counter key={k} k={k} value={counts[k]} hit={hits[k]} />
      ))}
    </div>
  );
}

/** Pinned right rail (xl+) */
export function VfxConsoleRail() {
  return (
    <div className="rounded-[24px] border border-white/10 p-4" style={{ background: "linear-gradient(170deg, rgba(24,34,62,.92), rgba(7,11,24,.96))", boxShadow: "var(--e3), var(--bevel)", backdropFilter: "blur(10px)" }}>
      <Header />
      <div className="mt-3">
        <Activity30 />
      </div>
      <Grid />
      <Controls />
      <Feed />
      <ResetButton />
    </div>
  );
}

/** Collapsible dock for screens below xl */
export function VfxConsoleDock() {
  const [open, setOpen] = useState(false);
  const { counts, hits } = useStats();
  const recent = Math.max(...Object.values(hits));
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!recent) return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 250);
    return () => window.clearTimeout(t);
  }, [recent]);

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 sm:left-auto sm:w-[360px] lg:bottom-11 xl:hidden">
      <motion.div
        layout
        className="overflow-hidden rounded-[22px] border border-white/10"
        style={{ background: "linear-gradient(170deg, rgba(24,34,62,.97), rgba(7,11,24,.98))", boxShadow: "0 14px 40px rgba(1,2,8,.85), var(--bevel)", backdropFilter: "blur(12px)" }}
      >
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg" style={{ background: pulse ? "rgba(249,115,22,.45)" : "rgba(249,115,22,.18)", transition: "background .2s" }}>
            <Activity size={16} strokeWidth={3} className="text-[#fb923c]" />
          </span>
          <span className="font-display text-[13px] font-black tracking-wide">VFX</span>
          <span className="no-scrollbar flex flex-1 gap-2 overflow-x-auto font-mono text-[12px] font-bold">
            {(["effects", "particles", "success", "error", "combo"] as StatKey[]).map((k) => (
              <span key={k} className="shrink-0" style={{ color: counts[k] ? META[k].color : "rgba(255,255,255,.3)" }}>
                {META[k].label.slice(0, 4)} {fmt(counts[k])}
              </span>
            ))}
          </span>
          {open ? <ChevronDown size={18} className="text-white/60" /> : <ChevronUp size={18} className="text-white/60" />}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-h-[70vh] overflow-y-auto px-3 pb-3">
              <Activity30 />
              <Grid />
              <Controls />
              <ResetButton />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
