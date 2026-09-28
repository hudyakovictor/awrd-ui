import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Btn, Cell, Grid, Section, Ring, blip } from "../components/kit";
import { Burst } from "./GameLayer";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

/* ============ Modal ============ */
function ModalDemo() {
  const [o, setO] = useState(false);
  return (
    <div className="grid h-full place-items-center">
      <Btn variant="danger" size="sm" icon="alert" onClick={() => setO(true)}>Close all positions</Btn>
      <AnimatePresence>
        {o && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] grid place-items-center p-4" style={{ background: "rgba(3,6,14,.72)", backdropFilter: "blur(8px)" }} onClick={() => setO(false)}>
            <motion.div
              initial={{ scale: 0.86, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-[26px] sf-raised hairline-strong p-5 text-center"
            >
              <motion.span animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mx-auto grid h-14 w-14 place-items-center rounded-2xl" style={{ background: "linear-gradient(180deg,#ff8fa2,#d61f42)", boxShadow: "0 5px 0 #8e0f2c" }}>
                <Icon name="alert" size={26} strokeWidth={2.2} className="text-[#1c0309]" />
              </motion.span>
              <h4 className="mt-3 text-[17px] font-black text-white">Close all positions?</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-400">You'll realise <span className="font-bold text-bear">−$812.40</span> and lose your 42-day risk streak. This cannot be undone.</p>
              <div className="mt-4 flex gap-2">
                <Btn variant="neutral" size="sm" full onClick={() => setO(false)}>Cancel</Btn>
                <Btn variant="danger" size="sm" full onClick={() => { setO(false); blip("err"); }}>Close all</Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Bottom sheet ============ */
function SheetDemo() {
  const [o, setO] = useState(false);
  return (
    <div className="grid h-full place-items-center">
      <Btn variant="neutral" size="sm" icon="layers" onClick={() => setO(true)}>Open bottom sheet</Btn>
      <AnimatePresence>
        {o && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-end justify-center" style={{ background: "rgba(3,6,14,.68)", backdropFilter: "blur(6px)" }} onClick={() => setO(false)}>
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, i) => i.offset.y > 90 && setO(false)}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[440px] rounded-t-[28px] sf-raised hairline-strong p-5 pb-8"
            >
              <span className="mx-auto mb-4 block h-1.5 w-11 rounded-full bg-[rgba(140,175,255,.28)]" />
              <h4 className="text-[16px] font-black text-white">Select order type</h4>
              <div className="mt-3 space-y-1.5">
                {(["Market", "Limit", "Stop-limit", "Trailing"] as const).map((t, i) => (
                  <button key={t} onClick={() => { setO(false); blip("ok"); }} className="flex w-full items-center gap-2.5 rounded-xl sf-base hairline p-3 text-left transition-transform hover:translate-x-1">
                    <Icon name={(["bolt", "target", "shield", "trendUp"] as IconName[])[i]} size={16} style={{ color: "var(--accent)" }} />
                    <span className="flex-1 text-[12px] font-bold text-ink-200">{t}</span>
                    <Icon name="chevronRight" size={14} className="text-ink-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ Toasts ============ */
type Toast = { id: number; k: "ok" | "info" | "warn" | "err"; t: string };
const TCFG = {
  ok: { c: "#2be08a", i: "check" as IconName, l: "Order filled at $68,412" },
  info: { c: "#38e1ff", i: "info" as IconName, l: "New lesson unlocked" },
  warn: { c: "#ffc24b", i: "alert" as IconName, l: "Funding rate spike +0.08%" },
  err: { c: "#ff4d6a", i: "x" as IconName, l: "Insufficient margin" },
};

function Toasts() {
  const [list, setList] = useState<Toast[]>([{ id: 1, k: "ok", t: TCFG.ok.l }]);
  const push = (k: Toast["k"]) => {
    const id = Date.now();
    setList((l) => [...l.slice(-2), { id, k, t: TCFG[k].l }]);
    blip(k === "err" ? "err" : "ok");
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4200);
  };
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex min-h-[112px] flex-col justify-end gap-1.5">
        <AnimatePresence initial={false}>
          {list.map((t) => {
            const c = TCFG[t.k];
            return (
              <motion.div
                layout key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="relative flex items-center gap-2.5 overflow-hidden rounded-xl sf-raised p-2.5"
                style={{ boxShadow: `inset 0 0 0 1px ${c.c}44, 0 12px 26px -14px ${c.c}` }}
              >
                <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: c.c }} />
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${c.c}22`, color: c.c }}><Icon name={c.i} size={14} strokeWidth={3} /></span>
                <span className="flex-1 text-[10.5px] font-bold text-ink-200">{t.t}</span>
                <button onClick={() => setList((l) => l.filter((x) => x.id !== t.id))}><Icon name="x" size={12} className="text-ink-500 hover:text-white" /></button>
                <motion.span initial={{ width: "100%" }} animate={{ width: 0 }} transition={{ duration: 4.2, ease: "linear" }} className="absolute bottom-0 left-0 h-[2px]" style={{ background: c.c, opacity: 0.6 }} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="mt-auto grid grid-cols-4 gap-1.5">
        {(Object.keys(TCFG) as Toast["k"][]).map((k) => (
          <button key={k} onClick={() => push(k)} className="rounded-lg sf-base hairline py-1.5 font-mono text-[8px] font-bold uppercase tracking-wider transition-colors" style={{ color: TCFG[k].c }}>{k}</button>
        ))}
      </div>
    </div>
  );
}

/* ============ Alerts ============ */
function Alerts() {
  const rows: { c: string; i: IconName; t: string; s: string }[] = [
    { c: "#ff4d6a", i: "alert", t: "Liquidation risk", s: "Margin below 12% — add collateral" },
    { c: "#ffc24b", i: "clock", t: "Market closing soon", s: "Simulation ends in 04:12" },
    { c: "#38e1ff", i: "info", t: "New season live", s: "Diamond league resets Monday" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {rows.map((r) => (
        <motion.div key={r.t} whileHover={{ x: 3 }} className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: `linear-gradient(90deg, ${r.c}18, #0d1528 70%)`, boxShadow: `inset 0 0 0 1px ${r.c}3a` }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${r.c}25`, color: r.c }}><Icon name={r.i} size={15} strokeWidth={2.4} /></span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-black" style={{ color: r.c }}>{r.t}</div>
            <div className="truncate font-mono text-[8.5px] text-ink-400">{r.s}</div>
          </div>
          <Btn variant="ghost" size="xs" depth="sm">Fix</Btn>
        </motion.div>
      ))}
    </div>
  );
}

/* ============ Skeleton ============ */
function Skeletons() {
  const [load, setLoad] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setLoad((l) => !l), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-xl sf-base hairline p-2.5">
          {load ? <span className="skel h-9 w-9 shrink-0 rounded-xl" /> : <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl sf-inset" style={{ color: "var(--accent)" }}><Icon name="candle" size={15} /></span>}
          <div className="flex-1 space-y-1.5">
            {load ? <><span className="skel block h-2.5 w-2/3 rounded-full" /><span className="skel block h-2 w-1/3 rounded-full" /></> : <><div className="text-[11px] font-bold text-white">Momentum breakout</div><div className="font-mono text-[8.5px] text-ink-500">Lesson · 8 min</div></>}
          </div>
          {load ? <span className="skel h-6 w-12 rounded-lg" /> : <span className="rounded-lg px-2 py-1 font-mono text-[8px] font-black" style={{ background: "var(--accent)", color: "var(--accent-ink)" }}>NEW</span>}
        </div>
      ))}
      <span className="text-center font-mono text-[8px] uppercase tracking-widest text-ink-500">auto-toggle 2.6s · shimmer 1.6s</span>
    </div>
  );
}

/* ============ Empty state ============ */
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
      <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.4, repeat: Infinity }} className="relative">
        <span className="absolute inset-0 rounded-full blur-2xl" style={{ background: "var(--accent-glow)", opacity: 0.4 }} />
        <span className="relative grid h-16 w-16 place-items-center rounded-3xl sf-raised hairline-strong" style={{ color: "var(--accent)" }}><Icon name="wallet" size={28} strokeWidth={1.6} /></span>
      </motion.div>
      <div>
        <div className="text-[13px] font-black text-white">No open positions</div>
        <div className="mt-0.5 font-mono text-[9px] text-ink-500">Your simulated book is flat.</div>
      </div>
      <Btn variant="accent" size="sm" icon="plus">Place first trade</Btn>
    </div>
  );
}

/* ============ Progress & spinners ============ */
function Progress() {
  const [p, setP] = useState(34);
  useEffect(() => {
    const id = setInterval(() => setP((v) => (v >= 100 ? 0 : v + 2)), 90);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-4">
        <Ring value={p} size={64} stroke={8} />
        <div className="relative h-11 w-11">
          <span className="absolute inset-0 rounded-full border-[3px] border-[rgba(120,160,240,.14)]" />
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent" style={{ borderTopColor: "var(--accent)", borderRightColor: "var(--accent)" }} />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.14 }} className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
          ))}
        </div>
      </div>
      <div className="w-full">
        <div className="mb-1 flex justify-between font-mono text-[8.5px] uppercase tracking-wider"><span className="text-ink-500">Syncing orderbook</span><span className="tnum" style={{ color: "var(--accent)" }}>{p}%</span></div>
        <div className="h-3 overflow-hidden rounded-full sf-inset">
          <div className="shine h-full rounded-full transition-[width] duration-100" style={{ width: `${p}%`, background: "linear-gradient(90deg, color-mix(in srgb,var(--accent) 45%,#000), var(--accent))", boxShadow: "0 0 14px var(--accent-glow)" }} />
        </div>
      </div>
      <div className="flex w-full gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full sf-inset">
            <motion.span className="block h-full rounded-full" style={{ background: "var(--accent)" }} animate={{ width: p / 100 > i / 5 ? "100%" : "0%" }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============ Validation states ============ */
function Validation() {
  const [st, setSt] = useState<"idle" | "err" | "ok">("idle");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <motion.div key={st} className={cn("w-full rounded-xl p-3", st === "err" && "shake")} style={{ background: "linear-gradient(180deg,#060a16,#0b1224)", boxShadow: `inset 0 3px 8px rgba(0,0,0,.85), inset 0 0 0 2px ${st === "err" ? "#ff4d6a" : st === "ok" ? "#2be08a" : "rgba(140,175,255,.2)"}` }}>
        <div className="flex items-center gap-2">
          <Icon name="key" size={15} style={{ color: st === "err" ? "#ff4d6a" : st === "ok" ? "#2be08a" : "#7d8db4" }} />
          <span className="flex-1 font-mono text-[11px] text-white">•••••••••</span>
          {st === "ok" && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2be08a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="m4 12.5 5.2 5.2L20 6.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35 }} />
            </svg>
          )}
          {st === "err" && <Icon name="alert" size={15} className="text-bear" />}
        </div>
      </motion.div>
      <div className="font-mono text-[9px]" style={{ color: st === "err" ? "#ff4d6a" : st === "ok" ? "#2be08a" : "#5f6f96" }}>
        {st === "err" ? "Wrong passphrase · 2 attempts left" : st === "ok" ? "Vault unlocked" : "Enter your vault key"}
      </div>
      <div className="flex gap-1.5">
        <Btn variant="danger" size="xs" depth="sm" onClick={() => { setSt("err"); blip("err"); }}>Fail</Btn>
        <Btn variant="bull" size="xs" depth="sm" onClick={() => { setSt("ok"); blip("ok"); }}>Pass</Btn>
        <Btn variant="neutral" size="xs" depth="sm" onClick={() => setSt("idle")}>Reset</Btn>
      </div>
    </div>
  );
}

/* ============ Celebration ============ */
function Celebration() {
  const [f, setF] = useState(0);
  const [show, setShow] = useState(false);
  return (
    <div className="relative grid h-full min-h-[190px] place-items-center">
      <Burst fire={f} count={40} />
      <AnimatePresence>
        {show && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 16 }} className="absolute inset-x-2 top-2 rounded-2xl p-3 text-center" style={{ background: "linear-gradient(165deg, color-mix(in srgb,var(--accent) 26%,#101a34), #0a1022)", boxShadow: "inset 0 0 0 1px var(--accent-glow), 0 18px 34px -16px var(--accent)" }}>
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Icon name="trophy" size={34} className="mx-auto text-gold" strokeWidth={1.6} />
            </motion.div>
            <div className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.25em]" style={{ color: "var(--accent)" }}>chapter cleared</div>
            <div className="text-[16px] font-black text-white">Perfect Run!</div>
            <div className="font-mono text-[9px] text-ink-400">12/12 correct · +320 XP · ×2 gems</div>
          </motion.div>
        )}
      </AnimatePresence>
      <Btn variant="gold" size="sm" icon="sparkles" className="mt-20" onClick={() => { setF((x) => x + 1); setShow(true); blip("level"); setTimeout(() => setShow(false), 3400); }}>
        Trigger celebration
      </Btn>
    </div>
  );
}

export default function Feedback() {
  return (
    <Section id="feedback" index="07" title="Feedback" kicker="Overlays · Status · Celebration" count="10 assets">
      <Grid>
        <Cell title="Toast Stack" spec="4 tones · autodismiss" span="col-span-2"><Toasts /></Cell>
        <Cell title="Alert Banners" spec="3 severities" span="col-span-2"><Alerts /></Cell>
        <Cell title="Skeleton Rows" spec="shimmer loop" span="col-span-2"><Skeletons /></Cell>
        <Cell title="Confirm Modal" spec="blur backdrop" span="col-span-2"><ModalDemo /></Cell>
        <Cell title="Bottom Sheet" spec="drag-to-dismiss" span="col-span-2"><SheetDemo /></Cell>
        <Cell title="Empty State" spec="float 3.4s" span="col-span-2"><EmptyState /></Cell>
        <Cell title="Progress & Spinners" spec="4 variants" span="col-span-2"><Progress /></Cell>
        <Cell title="Validation States" spec="shake · path-draw" span="col-span-2"><Validation /></Cell>
        <Cell title="Celebration Overlay" spec="40 particles" span="col-span-2"><Celebration /></Cell>
      </Grid>
    </Section>
  );
}
