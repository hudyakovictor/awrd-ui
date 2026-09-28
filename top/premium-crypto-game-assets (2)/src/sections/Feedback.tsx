import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Asset, Bar, Btn, Label, Section, useInterval, Coin } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

function Modal() {
  const [open, setOpen] = useState<null | "danger" | "success">(null);
  const [text, setText] = useState("");
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <Asset code="FBK-01" title="Modal Dialogs" desc="Blurred backdrop, spring scale-in, Esc/backdrop close, type-to-confirm for destructive actions." tags={["overlay", "a11y"]}>
      <div className="well dotgrid flex-1 grid place-items-center p-6 min-h-[180px]">
        <div className="space-y-3 w-full max-w-[220px]">
          <Btn variant="bear" block icon="alert" onClick={() => { setText(""); setOpen("danger"); }}>Reset progress</Btn>
          <Btn variant="bull" block icon="check" onClick={() => setOpen("success")}>Success dialog</Btn>
        </div>
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-md anim-rise" style={{ animationDuration: ".2s" }} onClick={() => setOpen(null)} />
          <div className="relative panel w-full max-w-sm p-6 text-center anim-bounce-in">
            {open === "danger" ? (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-bear/15 text-bear grid place-items-center mb-4 anim-wiggle"><Icon name="alert" size={32} /></div>
                <h4 className="text-xl font-black mb-1">Reset all progress?</h4>
                <p className="text-sm text-mist mb-4">Your 12-day streak, 48k XP and badges will be lost. This can't be undone.</p>
                <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder='Type "RESET" to confirm' className="well w-full h-11 px-3 text-sm text-center outline-none border-2 border-transparent focus:border-bear/60 mb-4 num uppercase" />
                <div className="grid grid-cols-2 gap-3"><Btn variant="ghost" onClick={() => setOpen(null)}>Cancel</Btn><Btn variant="bear" disabled={text.toUpperCase() !== "RESET"} onClick={() => setOpen(null)}>Reset</Btn></div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_5px_0_#0b7a4a] grid place-items-center mb-4 anim-bounce-in">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" strokeDasharray="24" strokeDashoffset="24" style={{ animation: "dash .5s .3s forwards" }} /></svg>
                </div>
                <h4 className="text-xl font-black mb-1">Deposit confirmed</h4>
                <p className="text-sm text-mist mb-5">500 USDT (demo) is now available for practice trading.</p>
                <Btn variant="bull" block onClick={() => setOpen(null)}>Start trading</Btn>
              </>
            )}
            <button onClick={() => setOpen(null)} className="absolute right-4 top-4 text-mist hover:text-fog" aria-label="Close"><Icon name="x" size={20} /></button>
          </div>
        </div>,
        document.body
      )}
    </Asset>
  );
}

type T = { id: number; k: "ok" | "info" | "warn" | "err"; t: string };
const TK = {
  ok: { i: "check", c: "#22d38a", bg: "from-[#0f3b33]", msg: ["Order filled: 0.01 BTC", "Lesson saved", "+25 XP earned"] },
  info: { i: "info", c: "#3da5ff", bg: "from-[#0f2a55]", msg: ["New lesson unlocked", "Market opens in 5m", "Friend joined league"] },
  warn: { i: "alert", c: "#ffc53d", bg: "from-[#3b2f10]", msg: ["High volatility detected", "1 heart left", "Streak at risk!"] },
  err: { i: "x", c: "#ff4b6e", bg: "from-[#3b1427]", msg: ["Order rejected: low margin", "Connection lost", "Payment failed"] },
};
function Toasts() {
  const [list, setList] = useState<T[]>([{ id: 1, k: "ok", t: "Order filled: 0.01 BTC" }, { id: 2, k: "info", t: "New lesson unlocked" }]);
  const push = (k: T["k"]) => setList((l) => [...l.slice(-3), { id: Date.now(), k, t: TK[k].msg[Math.floor(Math.random() * 3)] }]);
  const rm = (id: number) => setList((l) => l.filter((x) => x.id !== id));
  return (
    <Asset code="FBK-02" title="Toast Stack" desc="Slide-in toasts with 4 semantics, auto-dismiss timer bar, manual close, max-4 queue." tags={["queue", "auto"]}>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {(["ok", "info", "warn", "err"] as const).map((k) => <Btn key={k} size="xs" variant={k === "ok" ? "bull" : k === "info" ? "sky" : k === "warn" ? "gold" : "bear"} onClick={() => push(k)}>{k}</Btn>)}
      </div>
      <div className="space-y-2 flex-1 min-h-[210px]">
        {list.map((t) => <Toast key={t.id} t={t} onClose={() => rm(t.id)} />)}
        {!list.length && <div className="text-center text-xs text-mist pt-12">No notifications — push one ↑</div>}
      </div>
    </Asset>
  );
}
function Toast({ t, onClose }: { t: T; onClose: () => void }) {
  const s = TK[t.k];
  useEffect(() => { const id = setTimeout(onClose, 5000); return () => clearTimeout(id); }, []); // eslint-disable-line
  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-gradient-to-r to-ink-800 border flex items-center gap-3 p-3 shadow-[0_4px_0_#060c1f]", s.bg)} style={{ borderColor: `${s.c}55`, animation: "slideIn .35s cubic-bezier(.2,.9,.3,1.2) both" }}>
      <span className="w-7 h-7 rounded-lg grid place-items-center shrink-0" style={{ background: s.c, color: t.k === "warn" ? "#3a2500" : "#fff" }}><Icon name={s.i} size={16} stroke={3} /></span>
      <span className="text-sm font-bold flex-1">{t.t}</span>
      <button onClick={onClose} className="text-mist hover:text-fog"><Icon name="x" size={16} /></button>
      <span className="absolute left-0 bottom-0 h-[3px]" style={{ background: s.c, animation: "shrink 5s linear forwards", width: "100%" }} />
      <style>{`@keyframes shrink{from{width:100%}to{width:0}}`}</style>
    </div>
  );
}

function Banners() {
  const B = [
    { k: "warn", i: "alert", c: "#ffc53d", t: "Scheduled maintenance at 02:00 UTC", a: "Details" },
    { k: "err", i: "zap", c: "#ff4b6e", t: "Connection lost. Prices may be stale.", a: "Retry" },
    { k: "ok", i: "shield", c: "#22d38a", t: "2FA enabled — your account is secured", a: "" },
    { k: "info", i: "sparkle", c: "#9b6bff", t: "PRO trial: 7 days of advanced charts", a: "Try it" },
  ];
  const [hidden, setHidden] = useState<number[]>([]);
  const [retry, setRetry] = useState(false);
  return (
    <Asset code="FBK-03" title="Alert Banners" desc="Inline system banners with actions (incl. async retry) and collapse-on-dismiss." tags={["dismiss", "action"]}>
      <div className="space-y-2">
        {B.map((b, i) => (
          <div key={i} className="grid transition-all duration-300" style={{ gridTemplateRows: hidden.includes(i) ? "0fr" : "1fr", opacity: hidden.includes(i) ? 0 : 1 }}>
            <div className="overflow-hidden">
              <div className="rounded-xl p-3 flex items-center gap-3 border" style={{ background: `linear-gradient(90deg, ${b.c}22, ${b.c}08)`, borderColor: `${b.c}40` }}>
                <span style={{ color: b.c }} className={cn("shrink-0", b.k === "err" && "anim-glow")}><Icon name={b.i} size={20} /></span>
                <span className="text-xs font-bold flex-1">{b.t}</span>
                {b.a && <button onClick={() => { if (b.k === "err") { setRetry(true); setTimeout(() => { setRetry(false); setHidden((h) => [...h, i]); }, 1300); } }} className="text-[10px] font-black uppercase px-2 py-1 rounded-lg border shrink-0 flex items-center gap-1" style={{ color: b.c, borderColor: `${b.c}66` }}>{b.k === "err" && retry ? <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent anim-spin" /> : null}{b.a}</button>}
                <button onClick={() => setHidden([...hidden, i])} className="text-mist hover:text-fog shrink-0"><Icon name="x" size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hidden.length > 0 && <button onClick={() => setHidden([])} className="text-[11px] text-mist hover:text-sky mt-3 self-center">↺ restore {hidden.length}</button>}
    </Asset>
  );
}

function Progress() {
  const [p, setP] = useState(0);
  const [run, setRun] = useState(true);
  useInterval(() => setP((x) => (x >= 100 ? 0 : x + Math.random() * 7)), run ? 220 : null);
  const v = Math.min(100, p);
  const R = 40, C = 2 * Math.PI * R;
  const steps = ["Fetching prices", "Loading chart", "Syncing wallet", "Ready"];
  const si = Math.min(3, Math.floor(v / 26));
  return (
    <Asset code="FBK-04" title="Progress Indicators" desc="Linear with label, circular ring, segmented & staged loader — all driven by one value." tags={["sync", "ring"]}>
      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#0a1330" strokeWidth="12" />
            <circle cx="50" cy="50" r={R} fill="none" stroke="url(#pg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v / 100)} style={{ transition: "stroke-dashoffset .25s" }} />
            <defs><linearGradient id="pg"><stop offset="0" stopColor="#ffa25e" /><stop offset="1" stopColor="#ff6f1f" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 grid place-items-center num font-black text-lg">{Math.round(v)}%</div>
        </div>
        <div className="flex-1 space-y-2">
          {steps.map((s, i) => (
            <div key={s} className={cn("flex items-center gap-2 text-xs font-bold transition-colors", i < si ? "text-bull" : i === si ? "text-fog" : "text-mist/50")}>
              {i < si ? <Icon name="check" size={14} stroke={3} /> : i === si ? <span className="w-3.5 h-3.5 rounded-full border-2 border-flame border-t-transparent anim-spin" /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-current" />}{s}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[11px] mb-1.5"><span className="font-bold">Updating market data…</span><span className="num text-mist">{Math.round(v)}%</span></div>
      <Bar value={v} color="flame" h={16} />
      <Label className="mt-4">Segmented</Label>
      <div className="flex gap-1.5 mb-4">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-3 flex-1 rounded-full transition-all duration-300" style={{ background: i < v / 10 ? "linear-gradient(180deg,#6dbbff,#2d8cf0)" : "#172856", boxShadow: i < v / 10 ? "0 2px 0 #1a56a8" : "none" }} />)}</div>
      <Btn variant="ghost" size="sm" icon={run ? "minus" : "play"} onClick={() => setRun(!run)} className="mt-auto">{run ? "Pause" : "Resume"}</Btn>
    </Asset>
  );
}

function Loaders() {
  const [loaded, setLoaded] = useState(false);
  return (
    <Asset code="FBK-05" title="Loaders & Skeleton" desc="Four spinner styles and shimmering skeleton rows that swap to real content." tags={["shimmer", "spin"]}>
      <div className="grid grid-cols-4 gap-2 mb-5">
        <div className="tile !rounded-xl h-16 grid place-items-center"><span className="w-7 h-7 rounded-full border-4 border-sky/25 border-t-sky anim-spin" /></div>
        <div className="tile !rounded-xl h-16 grid place-items-center"><div className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="w-2 h-2 rounded-full bg-bull" style={{ animation: `typing 1s ${i * 0.15}s infinite` }} />)}</div></div>
        <div className="tile !rounded-xl h-16 grid place-items-center" style={{ perspective: 200 }}><div style={{ animation: "spin 1.2s linear infinite", transformStyle: "preserve-3d" }}><div style={{ transform: "rotateY(0)" }}><Coin sym="BTC" size={30} /></div></div></div>
        <div className="tile !rounded-xl h-16 grid place-items-center"><div className="flex items-end gap-0.5 h-6">{[0, 1, 2, 3].map((i) => <span key={i} className="w-1.5 rounded-sm bg-gold" style={{ height: "100%", animation: `breathe .8s ${i * 0.12}s ease-in-out infinite`, transformOrigin: "bottom", transform: `scaleY(${0.4 + i * 0.15})` }} />)}</div></div>
      </div>
      <div className="well p-3 space-y-3 mb-4">
        {[0, 1, 2].map((i) => loaded ? (
          <div key={i} className="flex items-center gap-3 anim-rise" style={{ animationDelay: `${i * 0.08}s` }}>
            <Coin sym={["BTC", "ETH", "SOL"][i]} size={36} />
            <div className="flex-1"><div className="text-sm font-extrabold">{["Bitcoin", "Ethereum", "Solana"][i]}</div><div className="text-[10px] text-mist">{["Store of value", "Smart contracts", "High throughput"][i]}</div></div>
            <span className="num text-xs font-bold text-bull">+{(2.1 + i).toFixed(1)}%</span>
          </div>
        ) : (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-9 h-9 !rounded-full" />
            <div className="flex-1 space-y-1.5"><div className="skeleton h-3 w-2/3" /><div className="skeleton h-2.5 w-1/3" /></div>
            <div className="skeleton h-3 w-10" />
          </div>
        ))}
      </div>
      <Btn variant="ghost" size="sm" block icon="refresh" onClick={() => setLoaded(!loaded)}>{loaded ? "Show skeleton" : "Load content"}</Btn>
    </Asset>
  );
}

function Empty() {
  const [has, setHas] = useState(false);
  return (
    <Asset code="FBK-06" title="Empty State" desc="Floating illustration, clear message and a single primary CTA that fills the state." tags={["illustration", "cta"]}>
      <div className="well border-2 border-dashed !border-ink-600 flex-1 grid place-items-center p-6 text-center min-h-[240px]">
        {has ? (
          <div className="anim-pop w-full space-y-2">
            {[["BTC", "Long", "+$42.10"], ["ETH", "Short", "−$8.35"]].map(([s, side, p]) => (
              <div key={s} className="tile !rounded-xl p-2.5 flex items-center gap-3"><Coin sym={s} size={28} /><span className="text-sm font-bold flex-1 text-left">{s} {side}</span><span className={cn("num text-xs font-bold", p.startsWith("+") ? "text-bull" : "text-bear")}>{p}</span></div>
            ))}
            <button onClick={() => setHas(false)} className="text-[11px] text-mist hover:text-sky pt-2">↺ clear</button>
          </div>
        ) : (
          <div>
            <div className="relative w-28 h-24 mx-auto mb-4 anim-float">
              <svg viewBox="0 0 112 96" className="w-full h-full">
                <rect x="10" y="20" width="92" height="66" rx="12" fill="#172856" stroke="#2b4380" strokeWidth="2" />
                <path d="M22 70 L40 52 L54 62 L76 38 L90 46" stroke="#3da5ff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="120" strokeDashoffset="120" style={{ animation: "dash 1.4s .2s ease forwards" }} />
                <circle cx="90" cy="46" r="5" fill="#3da5ff" />
                <circle cx="88" cy="18" r="12" fill="#1f3468" stroke="#2b4380" strokeWidth="2" />
                <path d="M84 18 h8 M88 14 v8" stroke="#8ea3cf" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="font-black text-lg">No trades yet</div>
            <p className="text-xs text-mist mb-4 max-w-[220px] mx-auto">Practice with $10,000 in demo funds. No risk, all the learning.</p>
            <Btn variant="bull" size="sm" icon="plus" onClick={() => setHas(true)}>Open first trade</Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

function BottomSheet() {
  const [open, setOpen] = useState(false);
  const [cond, setCond] = useState<"above" | "below">("above");
  const [price, setPrice] = useState(70000);
  const [saved, setSaved] = useState(false);
  return (
    <Asset code="FBK-07" title="Bottom Sheet" desc="Mobile sheet with grab handle, slide-up spring, scrim tap-to-close. Contains a price-alert form." tags={["mobile", "sheet"]}>
      <div className="well relative overflow-hidden flex-1 min-h-[300px]">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4"><Coin sym="BTC" size={36} /><div><div className="font-extrabold">Bitcoin</div><div className="num text-sm text-bull">$67,421.50</div></div></div>
          {saved && <div className="rounded-xl p-2.5 bg-bull/10 border border-bull/30 text-xs font-bold text-bull flex items-center gap-2 mb-3 anim-rise"><Icon name="bell" size={14} />Alert set: {cond} ${price.toLocaleString()}</div>}
          <Btn variant="sky" block icon="bell" onClick={() => setOpen(true)}>Set price alert</Btn>
        </div>
        <div className={cn("absolute inset-0 bg-ink-950/60 transition-opacity duration-300", open ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setOpen(false)} />
        <div className="absolute inset-x-0 bottom-0 panel !rounded-b-none !rounded-t-3xl p-4 pt-2 transition-transform duration-500 ease-[cubic-bezier(.2,1.2,.4,1)]" style={{ transform: open ? "translateY(0)" : "translateY(110%)" }}>
          <div className="w-10 h-1.5 rounded-full bg-ink-500 mx-auto mb-3" />
          <div className="font-black mb-3">New price alert</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {(["above", "below"] as const).map((c) => <button key={c} onClick={() => setCond(c)} className={cn("h-10 rounded-xl border-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all", cond === c ? (c === "above" ? "border-bull bg-bull/15 text-bull" : "border-bear bg-bear/15 text-bear") : "border-ink-600 text-mist")}><Icon name={c === "above" ? "trendUp" : "trendDown"} size={14} />{c}</button>)}
          </div>
          <div className="well flex items-center px-3 h-11 mb-3"><span className="text-mist mr-1">$</span><input value={price} onChange={(e) => setPrice(+e.target.value.replace(/\D/g, "") || 0)} className="num bg-transparent outline-none flex-1 font-bold" /></div>
          <Btn variant="bull" block onClick={() => { setSaved(true); setOpen(false); }}>Save alert</Btn>
        </div>
      </div>
    </Asset>
  );
}

export default function Feedback() {
  return (
    <Section id="feedback" index="08" title="Feedback" subtitle="System responses: confirm, notify, warn, wait, and guide when there's nothing yet.">
      <Modal />
      <Toasts />
      <Banners />
      <Progress />
      <Loaders />
      <BottomSheet />
      <Empty />
    </Section>
  );
}
