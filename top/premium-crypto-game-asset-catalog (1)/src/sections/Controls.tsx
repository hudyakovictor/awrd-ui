import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Btn, Cell, Grid, Section, Tag, blip, Num } from "../components/kit";
import { Icon, type IconName } from "../components/icons";
import { cn } from "../utils/cn";

/* ============ 01 Button matrix ============ */
function ButtonMatrix() {
  const [busy, setBusy] = useState(false);
  const run = () => {
    setBusy(true);
    setTimeout(() => { setBusy(false); blip("ok"); }, 1400);
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2.5">
        <Btn variant="accent" size="lg" depth="lg" icon="bolt" onClick={run} loading={busy}>
          {busy ? "Executing" : "Start Lesson"}
        </Btn>
        <Btn variant="gold" size="md" icon="crown">Go Pro</Btn>
        <Btn variant="danger" size="md" icon="trendDown">Short</Btn>
        <Btn variant="bull" size="md" icon="trendUp">Long</Btn>
        <Btn variant="aqua" size="sm" icon="swap">Swap</Btn>
        <Btn variant="violet" size="sm" icon="brain">Quiz</Btn>
        <Btn variant="neutral" size="sm" icon="settings">Settings</Btn>
        <Btn variant="ghost" size="sm" icon="eye">Preview</Btn>
        <Btn variant="neutral" size="sm" icon="lock" disabled>Locked</Btn>
        <Btn variant="accent" size="xs" depth="sm">XS</Btn>
      </div>
      <div className="flex flex-wrap gap-2 font-mono text-[8.5px] uppercase tracking-wider text-ink-500">
        <Tag tone="accent">8 variants</Tag>
        <Tag>4 sizes</Tag>
        <Tag>ripple + audio + haptic</Tag>
        <Tag>press → translateY 5px</Tag>
      </div>
    </div>
  );
}

/* ============ 02 Icon buttons / FAB ============ */
function IconButtons() {
  const [on, setOn] = useState<Record<string, boolean>>({});
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        {(["heart", "star", "bell", "refresh", "volume", "copy"] as IconName[]).map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.86 }}
            onClick={() => { setOn((p) => ({ ...p, [n]: !p[n] })); blip("tap"); }}
            data-depth="sm"
            className="btn3d h-11 w-11 rounded-full"
            style={{
              background: on[n]
                ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))"
                : "linear-gradient(180deg,#2c4372,#152444)",
              color: on[n] ? "var(--accent-ink)" : "#a3b1d2",
              ["--edge" as any]: on[n] ? "var(--accent-edge)" : "#0b1226",
            }}
          >
            <Icon name={n} size={18} strokeWidth={2.2} className="relative z-[4]" />
          </motion.button>
        ))}
      </div>
      <div className="relative flex items-center gap-4">
        <div className="relative">
          <span className="pulse-ring absolute inset-0 rounded-full" style={{ boxShadow: "0 0 0 3px var(--accent)" }} />
          <button
            data-depth="lg"
            onClick={() => blip("coin")}
            className="btn3d relative h-16 w-16 rounded-full text-[22px]"
            style={{
              background: "linear-gradient(180deg, color-mix(in srgb,var(--accent) 78%,#fff), var(--accent) 50%, color-mix(in srgb,var(--accent) 70%,#000))",
              color: "var(--accent-ink)",
              ["--edge" as any]: "var(--accent-edge)",
              ["--glow" as any]: "var(--accent-glow)",
            }}
          >
            <Icon name="play" size={24} strokeWidth={2} className="relative z-[4] translate-x-[2px]" />
          </button>
        </div>
        <div className="font-mono text-[9px] leading-relaxed text-ink-500">
          FAB / 64 · pulse-ring 1.8s
          <br />
          toggle-icon / 44 · state-persist
        </div>
      </div>
    </div>
  );
}

/* ============ 03 Switches ============ */
function Switch({ label, def = false, tone = "accent" }: { label: string; def?: boolean; tone?: "accent" | "gold" | "bear" }) {
  const [on, setOn] = useState(def);
  const c = tone === "accent" ? "var(--accent)" : tone === "gold" ? "#ffc24b" : "#ff4d6a";
  return (
    <button onClick={() => { setOn(!on); blip(on ? "tap" : "ok"); }} className="flex w-full items-center justify-between gap-3 py-1">
      <span className="text-[11px] font-semibold text-ink-300">{label}</span>
      <span
        className="relative h-7 w-[52px] shrink-0 rounded-full transition-colors duration-300"
        style={{
          background: on ? `linear-gradient(180deg, color-mix(in srgb,${c} 60%,#000), ${c})` : "linear-gradient(180deg,#070c18,#111c34)",
          boxShadow: on ? `inset 0 2px 5px rgba(0,0,0,.45), 0 0 18px -4px ${c}` : "inset 0 3px 7px rgba(0,0,0,.85)",
        }}
      >
        <motion.span
          animate={{ x: on ? 25 : 3 }}
          transition={{ type: "spring", stiffness: 640, damping: 30 }}
          className="absolute top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full"
          style={{
            background: "linear-gradient(180deg,#f4f8ff,#b9c7e6)",
            boxShadow: "0 2px 4px rgba(0,0,0,.6), inset 0 -2px 3px rgba(0,0,0,.22), inset 0 2px 2px #fff",
          }}
        />
      </span>
    </button>
  );
}

function Checkbox({ label, def = false }: { label: string; def?: boolean }) {
  const [on, setOn] = useState(def);
  return (
    <button onClick={() => { setOn(!on); blip(on ? "tap" : "ok"); }} className="flex items-center gap-2.5 py-1">
      <span
        className="relative grid h-[22px] w-[22px] place-items-center rounded-[7px] transition-all duration-200"
        style={{
          background: on ? "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))" : "linear-gradient(180deg,#0a1024,#141f3a)",
          boxShadow: on
            ? "0 3px 0 var(--accent-edge), 0 0 18px -4px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,.5)"
            : "inset 0 2px 5px rgba(0,0,0,.8), inset 0 0 0 1px rgba(140,175,255,.2)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="m4 12.5 5.2 5.2L20 6.5" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.22 }} />
        </svg>
      </span>
      <span className="text-[11px] font-semibold text-ink-300">{label}</span>
    </button>
  );
}

function RadioGroup() {
  const [v, setV] = useState("spot");
  return (
    <div className="space-y-1">
      {[["spot", "Spot"], ["margin", "Margin ×3"], ["futures", "Futures ×20"]].map(([k, l]) => (
        <button key={k} onClick={() => { setV(k); blip("tap"); }} className="flex w-full items-center gap-2.5 py-1">
          <span
            className="grid h-[20px] w-[20px] place-items-center rounded-full"
            style={{ background: "linear-gradient(180deg,#0a1024,#16213d)", boxShadow: v === k ? "inset 0 0 0 2px var(--accent), 0 0 14px -3px var(--accent-glow)" : "inset 0 2px 5px rgba(0,0,0,.8), inset 0 0 0 1px rgba(140,175,255,.18)" }}
          >
            <motion.span animate={{ scale: v === k ? 1 : 0 }} transition={{ type: "spring", stiffness: 520, damping: 24 }} className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
          </span>
          <span className={cn("text-[11px] font-semibold", v === k ? "text-white" : "text-ink-400")}>{l}</span>
        </button>
      ))}
    </div>
  );
}

/* ============ 04 Segmented ============ */
function Segmented() {
  const items = ["1H", "4H", "1D", "1W"];
  const [i, setI] = useState(2);
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="relative flex gap-1 rounded-2xl sf-inset p-1.5">
        {items.map((t, k) => (
          <button key={t} onClick={() => { setI(k); blip("tap"); }} className="relative z-10 flex-1 py-2 text-[11px] font-extrabold tracking-wide transition-colors" style={{ color: i === k ? "var(--accent-ink)" : "#7d8db4" }}>
            {i === k && (
              <motion.span
                layoutId="seg-pill"
                transition={{ type: "spring", stiffness: 480, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-xl"
                style={{ background: "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))", boxShadow: "0 3px 0 var(--accent-edge), 0 8px 16px -6px var(--accent-glow)" }}
              />
            )}
            {t}
          </button>
        ))}
      </div>
      <div className="font-mono text-[9px] text-ink-500">segmented / layout-spring 480·34</div>
    </div>
  );
}

/* ============ 05 Slider ============ */
export function Slider({ value, onChange, min = 0, max = 100, marks, tone }: { value: number; onChange: (v: number) => void; min?: number; max?: number; marks?: string[]; tone?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const pct = ((value - min) / (max - min)) * 100;
  const set = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    onChange(Math.round(min + p * (max - min)));
  };
  useEffect(() => {
    const mv = (e: PointerEvent) => drag.current && set(e.clientX);
    const up = () => (drag.current = false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
  });
  const c = tone || "var(--accent)";
  return (
    <div className="w-full select-none">
      <div
        ref={ref}
        onPointerDown={(e) => { drag.current = true; set(e.clientX); blip("tap"); }}
        className="relative h-6 cursor-pointer touch-none"
      >
        <div className="absolute top-1/2 h-3 w-full -translate-y-1/2 rounded-full sf-inset" />
        <div className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full transition-[width] duration-75" style={{ width: `${pct}%`, background: `linear-gradient(90deg, color-mix(in srgb,${c} 45%,#000), ${c})`, boxShadow: `0 0 16px -2px ${c}` }} />
        <motion.div
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${pct}%`, background: "linear-gradient(180deg,#fbfdff,#adbcdc)", boxShadow: `0 3px 6px rgba(0,0,0,.7), inset 0 -2px 3px rgba(0,0,0,.25), inset 0 2px 2px #fff, 0 0 0 2px ${c}55` }}
          whileTap={{ scale: 1.2 }}
        />
      </div>
      {marks && (
        <div className="mt-1 flex justify-between font-mono text-[8px] text-ink-500">
          {marks.map((m) => <span key={m}>{m}</span>)}
        </div>
      )}
    </div>
  );
}

function SliderCell() {
  const [risk, setRisk] = useState(35);
  const [lev, setLev] = useState(5);
  const tone = risk > 70 ? "#ff4d6a" : risk > 40 ? "#ffc24b" : "#2be08a";
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div>
        <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wider">
          <span className="text-ink-400">Risk exposure</span>
          <span className="tnum font-bold" style={{ color: tone }}>{risk}%</span>
        </div>
        <Slider value={risk} onChange={setRisk} marks={["0", "25", "50", "75", "100"]} tone={tone} />
      </div>
      <div>
        <div className="mb-1 flex justify-between font-mono text-[9px] uppercase tracking-wider">
          <span className="text-ink-400">Leverage</span>
          <span className="tnum font-bold" style={{ color: "var(--accent)" }}>×{lev}</span>
        </div>
        <Slider value={lev} onChange={setLev} min={1} max={20} marks={["1", "5", "10", "15", "20"]} />
      </div>
    </div>
  );
}

/* ============ 06 Stepper ============ */
function Stepper() {
  const [v, setV] = useState(250);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-3">
        <Btn variant="neutral" size="sm" depth="sm" onClick={() => setV((p) => Math.max(0, p - 50))} className="!w-10 !px-0">
          <Icon name="minus" size={16} strokeWidth={3} />
        </Btn>
        <div className="sf-inset hairline grid h-12 w-28 place-items-center rounded-xl">
          <span className="tnum font-mono text-[17px] font-bold text-white"><Num value={v} /></span>
        </div>
        <Btn variant="accent" size="sm" depth="sm" onClick={() => setV((p) => p + 50)} className="!w-10 !px-0">
          <Icon name="plus" size={16} strokeWidth={3} />
        </Btn>
      </div>
      <div className="flex gap-1.5">
        {[100, 500, 1000].map((q) => (
          <button key={q} onClick={() => { setV(q); blip("tap"); }} className="rounded-lg sf-base hairline px-2.5 py-1 font-mono text-[9px] font-bold text-ink-400 transition-colors hover:text-[var(--accent)]">
            ${q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============ 07 Text fields ============ */
function Field({ label, state = "idle", hint, icon, value: v0 = "" }: { label: string; state?: "idle" | "error" | "success"; hint?: string; icon?: IconName; value?: string }) {
  const [v, setV] = useState(v0);
  const [foc, setFoc] = useState(false);
  const col = state === "error" ? "#ff4d6a" : state === "success" ? "#2be08a" : foc ? "var(--accent)" : "rgba(140,175,255,.2)";
  return (
    <div className={cn("w-full", state === "error" && "shake")}>
      <div
        className="relative flex h-[52px] items-center gap-2 rounded-xl px-3 transition-all duration-200 sf-inset"
        style={{ boxShadow: `inset 0 3px 8px rgba(0,0,0,.85), inset 0 0 0 ${foc || state !== "idle" ? 2 : 1}px ${col}${foc ? "" : ""}, ${foc ? "0 0 22px -6px var(--accent-glow)" : "0 0 0 transparent"}` }}
      >
        {icon && <Icon name={icon} size={16} className="shrink-0" style={{ color: col }} />}
        <div className="relative flex-1">
          <motion.label
            animate={{ y: foc || v ? -9 : 0, fontSize: foc || v ? 8 : 12, opacity: foc || v ? 1 : 0.6 }}
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 font-mono uppercase tracking-wider"
            style={{ color: foc || state !== "idle" ? col : "#7d8db4" }}
          >
            {label}
          </motion.label>
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            onFocus={() => setFoc(true)}
            onBlur={() => setFoc(false)}
            className="w-full translate-y-[6px] bg-transparent text-[13px] font-semibold text-white outline-none placeholder:text-ink-500"
          />
        </div>
        {state === "error" && <Icon name="alert" size={16} className="text-bear" />}
        {state === "success" && <Icon name="check" size={16} strokeWidth={3} className="text-bull" />}
      </div>
      {hint && <div className="mt-1 pl-1 font-mono text-[8.5px]" style={{ color: state === "error" ? "#ff4d6a" : state === "success" ? "#2be08a" : "#5f6f96" }}>{hint}</div>}
    </div>
  );
}

function Fields() {
  return (
    <div className="space-y-3">
      <Field label="Wallet label" icon="wallet" />
      <Field label="Entry price" icon="candle" value="68412.55" state="success" hint="Valid · within 2% of spot" />
      <Field label="Stop loss" icon="shield" value="99999" state="error" hint="Stop must sit below entry" />
    </div>
  );
}

/* ============ 08 Search w/ live results ============ */
const COINS = [
  ["BTC", "Bitcoin", "+2.14%"],
  ["ETH", "Ethereum", "+1.02%"],
  ["SOL", "Solana", "-0.84%"],
  ["LINK", "Chainlink", "+4.51%"],
  ["ARB", "Arbitrum", "-1.73%"],
];

function SearchField() {
  const [q, setQ] = useState("");
  const [foc, setFoc] = useState(false);
  const res = COINS.filter((c) => (c[0] + c[1]).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="relative">
      <div className="flex h-[46px] items-center gap-2 rounded-xl sf-inset px-3" style={{ boxShadow: `inset 0 3px 8px rgba(0,0,0,.85), inset 0 0 0 ${foc ? 2 : 1}px ${foc ? "var(--accent)" : "rgba(140,175,255,.18)"}` }}>
        <Icon name="search" size={16} className="text-ink-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => setTimeout(() => setFoc(false), 140)} placeholder="Search markets…" className="flex-1 bg-transparent text-[12px] font-semibold text-white outline-none placeholder:text-ink-500" />
        {q && <button onClick={() => setQ("")}><Icon name="x" size={14} className="text-ink-400 hover:text-white" /></button>}
        <kbd className="rounded-md sf-base hairline px-1.5 py-0.5 font-mono text-[8px] text-ink-500">⌘K</kbd>
      </div>
      <AnimatePresence>
        {foc && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute inset-x-0 top-[52px] z-30 overflow-hidden rounded-xl sf-raised hairline-strong p-1">
            {res.length === 0 && <div className="px-3 py-3 text-center font-mono text-[10px] text-ink-500">no markets</div>}
            {res.map((c) => (
              <div key={c[0]} className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-[rgba(90,130,220,.12)]">
                <span className="grid h-6 w-6 place-items-center rounded-full sf-base hairline font-mono text-[8px] font-bold text-ink-300">{c[0][0]}</span>
                <span className="text-[11px] font-bold text-white">{c[0]}</span>
                <span className="flex-1 truncate text-[10px] text-ink-500">{c[1]}</span>
                <span className={cn("tnum font-mono text-[10px] font-bold", c[2].startsWith("+") ? "text-bull" : "text-bear")}>{c[2]}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============ 09 OTP ============ */
function Otp() {
  const [d, setD] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const done = d.every((x) => x);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex gap-1.5">
        {d.map((v, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={v}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => {
              const n = [...d];
              n[i] = e.target.value.replace(/\D/g, "").slice(-1);
              setD(n);
              if (n[i] && i < 5) refs.current[i + 1]?.focus();
              blip(n.every((x) => x) ? "ok" : "tap");
            }}
            onKeyDown={(e) => { if (e.key === "Backspace" && !d[i] && i > 0) refs.current[i - 1]?.focus(); }}
            className="tnum h-12 w-9 rounded-xl bg-transparent text-center font-mono text-[17px] font-bold text-white outline-none transition-all sf-inset"
            style={{ boxShadow: `inset 0 3px 8px rgba(0,0,0,.85), inset 0 0 0 ${v ? 2 : 1}px ${v ? "var(--accent)" : "rgba(140,175,255,.18)"}` }}
          />
        ))}
      </div>
      <motion.div animate={{ opacity: done ? 1 : 0.4 }} className="font-mono text-[9px] uppercase tracking-widest" style={{ color: done ? "var(--accent)" : "#5f6f96" }}>
        {done ? "✓ 2FA verified" : "enter 6-digit code"}
      </motion.div>
    </div>
  );
}

/* ============ 10 Hold to confirm ============ */
function HoldToConfirm() {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const t = useRef<number | null>(null);
  const start = () => {
    if (done) return;
    t.current = window.setInterval(() => {
      setP((v) => {
        if (v >= 100) { window.clearInterval(t.current!); setDone(true); blip("level"); return 100; }
        return v + 3.4;
      });
    }, 16);
  };
  const stop = () => { if (t.current) window.clearInterval(t.current); if (!done) setP(0); };
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <button
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        data-depth="md"
        className="btn3d relative h-14 w-full max-w-[230px] overflow-hidden rounded-2xl text-[12px]"
        style={{
          background: done ? "linear-gradient(180deg,#5cf0ab,#18b06a)" : "linear-gradient(180deg,#ff8fa2,#ff4d6a 46%,#d61f42)",
          color: done ? "#02150b" : "#1c0309",
          ["--edge" as any]: done ? "#0f7048" : "#8e0f2c",
        }}
      >
        <span className="absolute inset-y-0 left-0 z-[1] bg-black/25" style={{ width: `${p}%` }} />
        <span className="relative z-[4] flex items-center gap-2">
          <Icon name={done ? "check" : "lock"} size={16} strokeWidth={2.6} />
          {done ? "Position closed" : p > 0 ? `Hold… ${Math.round(p)}%` : "Hold to close position"}
        </span>
      </button>
      <button onClick={() => { setP(0); setDone(false); }} className="font-mono text-[9px] uppercase tracking-widest text-ink-500 hover:text-white">reset</button>
    </div>
  );
}

/* ============ 11 Swipe to confirm ============ */
function SwipeConfirm() {
  const track = useRef<HTMLDivElement>(null);
  const [ok, setOk] = useState(false);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div ref={track} className="relative h-14 w-full overflow-hidden rounded-2xl sf-inset hairline">
        <div className="absolute inset-0 grid place-items-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500">
          {ok ? "" : "swipe to execute →"}
        </div>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-2xl"
          animate={{ width: ok ? "100%" : 56 }}
          style={{ background: "linear-gradient(90deg, color-mix(in srgb,var(--accent) 40%,#000), var(--accent))", opacity: 0.35 }}
        />
        <motion.button
          drag="x"
          dragConstraints={track}
          dragElastic={0.02}
          dragMomentum={false}
          onDragEnd={(_, i) => {
            const w = track.current?.offsetWidth ?? 260;
            if (i.point.x - (track.current?.getBoundingClientRect().left ?? 0) > w * 0.7) { setOk(true); blip("level"); }
          }}
          animate={ok ? { x: (track.current?.offsetWidth ?? 260) - 56 } : { x: 0 }}
          className="btn3d absolute left-1 top-1 h-12 w-12 cursor-grab rounded-xl active:cursor-grabbing"
          data-depth="sm"
          style={{ background: "linear-gradient(180deg, color-mix(in srgb,var(--accent) 80%,#fff), var(--accent))", color: "var(--accent-ink)", ["--edge" as any]: "var(--accent-edge)" }}
        >
          <Icon name={ok ? "check" : "chevronRight"} size={20} strokeWidth={3} className="relative z-[4]" />
        </motion.button>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: ok ? "var(--accent)" : "#5f6f96" }}>{ok ? "order filled ✓" : "threshold 70%"}</span>
        <button onClick={() => setOk(false)} className="font-mono text-[9px] text-ink-500 underline hover:text-white">reset</button>
      </div>
    </div>
  );
}

/* ============ 12 Select ============ */
function Select() {
  const opts = ["Market order", "Limit order", "Stop-limit", "Trailing stop"];
  const [o, setO] = useState(false);
  const [v, setV] = useState(0);
  return (
    <div className="relative">
      <button onClick={() => { setO(!o); blip("tap"); }} className="flex h-[46px] w-full items-center gap-2 rounded-xl sf-raised hairline px-3">
        <Icon name="layers" size={16} style={{ color: "var(--accent)" }} />
        <span className="flex-1 text-left text-[12px] font-bold text-white">{opts[v]}</span>
        <motion.span animate={{ rotate: o ? 180 : 0 }}><Icon name="chevronDown" size={16} className="text-ink-400" /></motion.span>
      </button>
      <AnimatePresence>
        {o && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} className="absolute inset-x-0 top-[52px] z-30 rounded-xl sf-raised hairline-strong p-1">
            {opts.map((t, i) => (
              <button key={t} onClick={() => { setV(i); setO(false); blip("ok"); }} className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-colors", i === v ? "text-white" : "text-ink-400 hover:bg-[rgba(90,130,220,.12)]")} style={i === v ? { background: "color-mix(in srgb,var(--accent) 16%,transparent)" } : undefined}>
                {i === v && <Icon name="check" size={13} strokeWidth={3} style={{ color: "var(--accent)" }} />}
                <span className={i === v ? "" : "pl-[21px]"}>{t}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Controls() {
  return (
    <Section id="controls" index="02" title="Controls" kicker="Tactile inputs · 3D press physics" count="12 assets">
      <Grid>
        <Cell title="Button Matrix" spec="8 variants · ripple" span="col-span-2 md:col-span-4 lg:col-span-4"><ButtonMatrix /></Cell>
        <Cell title="Icon Buttons + FAB" spec="44 / 64 · pulse" span="col-span-2"><IconButtons /></Cell>
        <Cell title="Switches" spec="spring 640·30" span="col-span-2">
          <div className="flex h-full flex-col justify-center gap-1">
            <Switch label="Price alerts" def />
            <Switch label="Haptics" def tone="gold" />
            <Switch label="Demo capital" />
            <Switch label="Liquidation warn" def tone="bear" />
          </div>
        </Cell>
        <Cell title="Checkboxes" spec="path-draw 220ms" span="col-span-2">
          <div className="flex h-full flex-col justify-center gap-1">
            <Checkbox label="Remember device" def />
            <Checkbox label="Auto-compound" />
            <Checkbox label="Risk disclaimer" def />
          </div>
        </Cell>
        <Cell title="Radio Group" spec="scale-spring" span="col-span-2"><RadioGroup /></Cell>
        <Cell title="Segmented Control" spec="layoutId pill" span="col-span-2"><Segmented /></Cell>
        <Cell title="Sliders" spec="pointer-drag · tonal" span="col-span-2"><SliderCell /></Cell>
        <Cell title="Stepper" spec="count-up 700ms" span="col-span-2"><Stepper /></Cell>
        <Cell title="Text Fields" spec="idle/success/error" span="col-span-2 lg:col-span-2"><Fields /></Cell>
        <Cell title="Search + Live Results" spec="fuzzy · ⌘K" span="col-span-2"><SearchField /></Cell>
        <Cell title="2FA / OTP Input" spec="auto-advance ×6" span="col-span-2"><Otp /></Cell>
        <Cell title="Hold To Confirm" spec="500ms dwell" span="col-span-2"><HoldToConfirm /></Cell>
        <Cell title="Swipe To Execute" spec="drag · 70% commit" span="col-span-2"><SwipeConfirm /></Cell>
        <Cell title="Select / Dropdown" spec="4 options" span="col-span-2"><Select /></Cell>
      </Grid>
    </Section>
  );
}
