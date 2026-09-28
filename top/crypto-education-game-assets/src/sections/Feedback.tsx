import { useEffect, useState } from "react";
import { Asset, Bar, Btn, Confetti, Label, Section, Spinner, haptic, useAnimatedNumber, useInterval } from "../components/ui";
import { BearIcon, CoinIcon, HeartIcon, Icon, TrophyIcon, XPIcon } from "../components/icons";
import { cn } from "../utils/cn";

function Modal() {
  const [open, setOpen] = useState<"close" | "delete" | null>(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<string | null>(null);
  return (
    <Asset title="Modal Confirmation" code="FB-01" tags="modal dialog confirm destructive overlay" span={4} bodyClass="min-h-[320px]">
      <div className="space-y-3">
        <div className="panel-inset rounded-2xl p-4">
          <div className="flex items-center justify-between text-sm font-extrabold text-white">
            BTC Long 10×
            <span className="font-mono text-bull">+$214.50</span>
          </div>
          <div className="mt-1 text-[11px] text-ink-400">Entry 62,100 · Mark 64,250</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Btn variant="ghost" size="sm" onClick={() => setOpen("close")}>Close position</Btn>
          <Btn variant="bear" size="sm" onClick={() => setOpen("delete")}>Delete account</Btn>
        </div>
        {result && <div className="anim-pop rounded-xl bg-bull/15 p-3 text-center text-xs font-bold text-bull ring-1 ring-bull/30">{result}</div>}
      </div>
      {open && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-950/75 p-5 backdrop-blur-sm" style={{ animation: "slide-up .2s ease both" }} onClick={() => setOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="anim-pop panel w-full rounded-3xl p-5 text-center">
            <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", open === "delete" ? "bg-bear/15 text-bear" : "bg-gold/15 text-gold")}>
              <Icon name={open === "delete" ? "warning" : "swap"} size={28} />
            </div>
            <div className="mt-3 font-display text-lg font-black text-white">{open === "delete" ? "Delete account?" : "Close position?"}</div>
            <div className="mt-1 text-xs text-ink-300">
              {open === "delete" ? "This action cannot be undone. Type DELETE to confirm." : "You'll realize +$214.50 profit at market price."}
            </div>
            {open === "delete" && (
              <input value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} placeholder="DELETE" className="panel-inset mt-3 h-10 w-full rounded-xl text-center font-mono text-sm font-bold text-white outline-none focus:ring-2 focus:ring-bear" />
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Btn variant="ghost" size="sm" onClick={() => setOpen(null)}>Cancel</Btn>
              <Btn
                variant={open === "delete" ? "bear" : "bull"}
                size="sm"
                disabled={open === "delete" && typed !== "DELETE"}
                onClick={() => {
                  setResult(open === "delete" ? "Account scheduled for deletion" : "Position closed · +$214.50");
                  setOpen(null);
                  setTyped("");
                  setTimeout(() => setResult(null), 2200);
                }}
              >
                {open === "delete" ? "Delete" : "Confirm"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </Asset>
  );
}

type Toast = { id: number; kind: "success" | "info" | "warning" | "error"; t: string; d: string };
const toastCfg = {
  success: { i: "check", c: "text-bull", bg: "bg-bull", ring: "ring-bull/30", bar: "bg-bull" },
  info: { i: "info", c: "text-azure", bg: "bg-azure", ring: "ring-azure/30", bar: "bg-azure" },
  warning: { i: "warning", c: "text-gold", bg: "bg-gold", ring: "ring-gold/30", bar: "bg-gold" },
  error: { i: "x", c: "text-bear", bg: "bg-bear", ring: "ring-bear/30", bar: "bg-bear" },
} as const;
const toastText = {
  success: ["Order filled", "Bought 0.0039 BTC @ 64,250"],
  info: ["New lesson unlocked", "Fibonacci retracements"],
  warning: ["High volatility", "BTC moved 5% in 10 min"],
  error: ["Liquidation risk", "Margin ratio at 85%"],
};
function Toasts() {
  const [list, setList] = useState<Toast[]>([
    { id: 1, kind: "success", t: "Lesson complete", d: "+15 XP earned" },
    { id: 2, kind: "info", t: "Streak reminder", d: "Keep your 47-day streak!" },
  ]);
  const push = (kind: Toast["kind"]) => {
    haptic();
    const id = Date.now();
    setList((l) => [{ id, kind, t: toastText[kind][0], d: toastText[kind][1] }, ...l].slice(0, 4));
  };
  return (
    <Asset title="Toast Stack" code="FB-02" tags="toast notification snackbar stack alert" span={4} bodyClass="min-h-[320px]">
      <div className="mb-4 grid grid-cols-4 gap-2">
        {(["success", "info", "warning", "error"] as const).map((k) => (
          <button key={k} onClick={() => push(k)} className={cn("btn3d h-9 rounded-xl text-[10px] [--depth:3px]", { success: "v-bull", info: "v-azure", warning: "v-gold", error: "v-bear" }[k])}>
            {k}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {list.map((t) => (
          <ToastItem key={t.id} t={t} onClose={() => setList((l) => l.filter((x) => x.id !== t.id))} />
        ))}
        {!list.length && <div className="py-8 text-center text-xs text-ink-500">No notifications</div>}
      </div>
    </Asset>
  );
}
function ToastItem({ t, onClose }: { t: Toast; onClose: () => void }) {
  const c = toastCfg[t.kind];
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (hover) return;
    const tm = setTimeout(onClose, 6000);
    return () => clearTimeout(tm);
  }, [hover, onClose]);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className={cn("anim-slide-right panel-raised relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 ring-1", c.ring)}>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-ink-950", c.bg)}>
        <Icon name={c.i} size={16} stroke={3} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cn("text-xs font-extrabold", c.c)}>{t.t}</div>
        <div className="truncate text-[11px] text-ink-300">{t.d}</div>
      </div>
      <button onClick={onClose} className="text-ink-400 hover:text-white">
        <Icon name="x" size={14} stroke={3} />
      </button>
      <span className={cn("absolute bottom-0 left-0 h-[3px]", c.bar)} style={{ width: "100%", animation: "shrink 6s linear forwards", animationPlayState: hover ? "paused" : "running" }} />
      <style>{`@keyframes shrink{from{width:100%}to{width:0}}`}</style>
    </div>
  );
}

function Alerts() {
  const all = [
    { k: "gold", i: "warning", t: "Scheduled maintenance", d: "Trading paused Sun 02:00–03:00 UTC", a: "Details" },
    { k: "bear", i: "warning", t: "Critical: margin call", d: "Add funds or reduce position size", a: "Fix now" },
    { k: "azure", i: "sparkle", t: "Double XP weekend", d: "All lessons give 2× XP until Monday", a: "Go" },
    { k: "bull", i: "shield", t: "2FA enabled", d: "Your account is now extra secure", a: "OK" },
  ] as const;
  const [shown, setShown] = useState(all.map((_, i) => i));
  const styles = {
    gold: "from-gold/20 to-gold/5 ring-gold/40 text-gold",
    bear: "from-bear/20 to-bear/5 ring-bear/40 text-bear",
    azure: "from-azure/20 to-azure/5 ring-azure/40 text-azure",
    bull: "from-bull/20 to-bull/5 ring-bull/40 text-bull",
  };
  return (
    <Asset title="Alert Banners" code="FB-03" tags="alert banner warning error info success dismiss" span={4} bodyClass="min-h-[320px]">
      <div className="space-y-2.5">
        {all.map((a, i) =>
          shown.includes(i) ? (
            <div key={a.t} className={cn("anim-slide-up flex items-center gap-3 rounded-2xl bg-gradient-to-r p-3 ring-1", styles[a.k])}>
              <Icon name={a.i} size={20} className={a.k === "bear" ? "anim-glow" : ""} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-extrabold text-white">{a.t}</div>
                <div className="truncate text-[11px] text-ink-300">{a.d}</div>
              </div>
              <button onClick={() => setShown((s) => s.filter((x) => x !== i))} className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-extrabold uppercase text-white transition hover:bg-white/20">
                {a.a}
              </button>
            </div>
          ) : null,
        )}
        {shown.length < all.length && (
          <button onClick={() => setShown(all.map((_, i) => i))} className="w-full py-2 text-[11px] font-bold text-ink-400 hover:text-white">
            Restore dismissed ({all.length - shown.length})
          </button>
        )}
      </div>
    </Asset>
  );
}

function SkeletonEmpty() {
  const [state, setState] = useState<"loading" | "loaded" | "empty">("loading");
  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState("loaded"), 1800);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <Asset title="Skeleton · Empty State" code="FB-04" tags="skeleton loading empty state placeholder" span={5}>
      <div className="mb-4 flex gap-2">
        {(["loading", "loaded", "empty"] as const).map((s) => (
          <button key={s} onClick={() => setState(s)} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase", state === s ? "bg-white/10 text-white" : "text-ink-400 hover:text-white")}>
            {s}
          </button>
        ))}
      </div>
      <div className="panel-inset min-h-[230px] rounded-2xl p-4">
        {state === "loading" &&
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="mb-4 flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 rounded-full" style={{ width: `${70 - i * 8}%` }} />
                <div className="skeleton h-2.5 w-2/5 rounded-full" />
              </div>
              <div className="skeleton h-6 w-14 rounded-lg" />
            </div>
          ))}
        {state === "loaded" &&
          [
            ["Hammer pattern", "Lesson · 4 min", "+15"],
            ["Support & resistance", "Lesson · 6 min", "+20"],
            ["Risk:Reward quiz", "Quiz · 3 min", "+10"],
            ["Volume profile", "Lesson · 5 min", "+15"],
          ].map(([t, d, x], i) => (
            <div key={t} className="anim-slide-up mb-4 flex items-center gap-3" style={{ animationDelay: `${i * 70}ms` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-azure/20 text-azure"><Icon name="book" size={18} /></span>
              <div className="flex-1">
                <div className="text-sm font-extrabold text-white">{t}</div>
                <div className="text-[11px] text-ink-400">{d}</div>
              </div>
              <span className="flex items-center gap-1 rounded-lg bg-gold/15 px-2 py-1 text-[11px] font-black text-gold"><XPIcon size={12} />{x}</span>
            </div>
          ))}
        {state === "empty" && (
          <div className="anim-pop flex flex-col items-center py-4 text-center">
            <div className="relative">
              <div className="anim-float flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-dashed border-ink-500 text-ink-400">
                <Icon name="wallet" size={36} />
              </div>
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 text-ink-300">
                <Icon name="search" size={14} />
              </span>
            </div>
            <div className="mt-4 font-display text-base font-black text-white">No positions yet</div>
            <div className="mt-1 max-w-[220px] text-xs text-ink-400">Place your first paper trade — zero risk, real market data.</div>
            <Btn variant="bull" size="sm" className="mt-4" onClick={() => setState("loading")}>
              <Icon name="plus" size={14} stroke={3} /> New trade
            </Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

function Loaders() {
  const [p, setP] = useState(45);
  const [run, setRun] = useState(true);
  useInterval(() => setP((x) => (x >= 100 ? 0 : x + 1)), run ? 80 : null);
  const r = 40, c = 2 * Math.PI * r;
  const seg = Math.floor(p / 20);
  return (
    <Asset title="Progress & Loaders" code="FB-05" tags="progress bar circular spinner loader loading" span={7}>
      <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={r} fill="none" stroke="#0a1330" strokeWidth="11" />
              <circle cx="50" cy="50" r={r} fill="none" stroke="url(#ringG)" strokeWidth="11" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} />
              <defs><linearGradient id="ringG"><stop offset="0" stopColor="#2fd4ff" /><stop offset="1" stopColor="#22d39a" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-black text-white">{p}%</span>
              <span className="text-[9px] font-bold uppercase text-ink-400">Syncing</span>
            </div>
          </div>
          <button onClick={() => setRun((x) => !x)} className="mt-2 text-[11px] font-bold text-ink-400 hover:text-white">
            {run ? "❚❚ Pause" : "▶ Play"}
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex justify-between text-[11px] font-bold">
              <span className="text-ink-300">Updating portfolio…</span>
              <span className="font-mono text-cyan">{p}%</span>
            </div>
            <Bar value={p} color="azure" height={18} />
          </div>
          <div>
            <Label>Segmented · lesson steps</Label>
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn("h-3 flex-1 rounded-full transition-all duration-300", i < seg ? "bg-bull shadow-[0_2px_0_#0c8f63]" : i === seg ? "bg-bull/40 anim-glow" : "bg-ink-950")} />
              ))}
            </div>
          </div>
          <div>
            <Label>Striped · indeterminate</Label>
            <div className="panel-inset h-3 overflow-hidden rounded-full">
              <div className="h-full w-full rounded-full" style={{ background: "repeating-linear-gradient(-45deg,#9170ff 0 10px,#7a58f0 10px 20px)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
            </div>
          </div>
        </div>
      </div>
      <Label className="mt-6">Spinners</Label>
      <div className="flex flex-wrap items-center gap-6">
        <Spinner size={32} className="text-azure" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-3 w-3 rounded-full bg-bull" style={{ animation: `float .9s ${i * 0.15}s ease-in-out infinite` }} />
          ))}
        </div>
        <div className="flex h-9 items-end gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className={cn("w-2 origin-bottom rounded-sm", i % 2 ? "bg-bear" : "bg-bull")} style={{ height: 14 + (i % 3) * 8, animation: `bar-grow .8s ${i * 0.12}s ease-in-out infinite alternate` }} />
          ))}
        </div>
        <svg width="40" height="40" viewBox="0 0 24 24" className="anim-spin text-ink-300" style={{ animationDuration: "3s" }}>
          <path fill="currentColor" d="M19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-2 1.2L14.8 21h-4l-.3-2.4a7 7 0 0 1-2-1.2l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-2.4L4.6 9.9l2-3.4 1.9.7a7 7 0 0 1 2-1.2L10.8 3h4l.3 2.4a7 7 0 0 1 2 1.2l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 2.4ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        </svg>
        <div className="anim-spin" style={{ animationDuration: "1.6s" }}>
          <CoinIcon size={34} />
        </div>
      </div>
    </Asset>
  );
}

function LessonComplete() {
  const [fire, setFire] = useState(1);
  const [go, setGo] = useState(1);
  const xp = useAnimatedNumber(go ? 35 : 0, 1200);
  const acc = useAnimatedNumber(go ? 92 : 0, 1400);
  useEffect(() => {
    setGo(0);
    const t = setTimeout(() => setGo(1), 50);
    return () => clearTimeout(t);
  }, [fire]);
  return (
    <Asset title="Lesson Complete Screen" code="FB-06" tags="lesson complete result celebration summary reward" span={6}>
      <div className="relative flex flex-col items-center overflow-visible text-center">
        <Confetti fire={fire} count={40} />
        <div className="relative">
          <div className="absolute inset-0 -z-0 scale-150 rounded-full bg-gold/25 blur-2xl anim-glow" />
          <div className="anim-pop relative"><TrophyIcon size={96} /></div>
        </div>
        <div className="text-gradient-gold mt-2 font-display text-3xl font-black">Lesson complete!</div>
        <div className="text-sm font-bold text-ink-300">Candlestick Patterns · Level 3</div>
        <div className="mt-5 grid w-full grid-cols-3 gap-3">
          {[
            { l: "Total XP", v: Math.round(xp), c: "border-gold text-gold", bg: "bg-gold", i: <XPIcon size={18} /> },
            { l: "Accuracy", v: `${Math.round(acc)}%`, c: "border-bull text-bull", bg: "bg-bull", i: <Icon name="target" size={16} stroke={3} /> },
            { l: "Time", v: "2:14", c: "border-azure text-azure", bg: "bg-azure", i: <Icon name="clock" size={16} stroke={3} /> },
          ].map((s, i) => (
            <div key={s.l} className={cn("anim-slide-up overflow-hidden rounded-2xl border-2", s.c)} style={{ animationDelay: `${300 + i * 120}ms` }}>
              <div className={cn("py-1 text-[10px] font-black uppercase tracking-wider text-ink-950", s.bg)}>{s.l}</div>
              <div className="flex items-center justify-center gap-1.5 bg-ink-900 py-3 font-display text-xl font-black">
                {s.i}
                {s.v}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <Btn variant="ghost" onClick={() => setFire((f) => f + 1)}>Review</Btn>
          <Btn variant="bull">Continue</Btn>
        </div>
      </div>
    </Asset>
  );
}

function BottomSheet() {
  const [open, setOpen] = useState<"hearts" | "trade" | null>(null);
  return (
    <Asset title="Bottom Sheets" code="FB-07" tags="bottom sheet drawer mobile paywall out of hearts" span={6} bodyClass="min-h-[420px] overflow-hidden">
      <div className="mx-auto flex max-w-xs flex-col gap-3 pt-6">
        <div className="text-center text-sm font-bold text-ink-300">Mobile sheet patterns</div>
        <Btn variant="bear" onClick={() => setOpen("hearts")}><HeartIcon size={20} /> Out of hearts</Btn>
        <Btn variant="azure" onClick={() => setOpen("trade")}><Icon name="swap" size={18} /> Confirm trade</Btn>
      </div>
      <div className={cn("absolute inset-0 z-10 bg-ink-950/70 transition-opacity duration-300", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => setOpen(null)} />
      <div
        className={cn("absolute inset-x-0 bottom-0 z-20 rounded-t-[28px] border-t border-white/10 bg-gradient-to-b from-ink-700 to-ink-800 p-5 pt-3 shadow-[0_-20px_40px_rgba(0,0,0,.5)] transition-transform duration-500 ease-[cubic-bezier(.3,1.25,.5,1)]", open ? "translate-y-0" : "translate-y-full")}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink-500" />
        {open === "hearts" && (
          <div className="text-center">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => <HeartIcon key={i} size={30} dim />)}
            </div>
            <div className="mt-3 font-display text-xl font-black text-white">You're out of hearts</div>
            <div className="text-xs text-ink-300">Practice to earn one back, or refill instantly.</div>
            <div className="mt-4 space-y-3">
              <Btn variant="violet" block className="sheen"><Icon name="sparkle" size={16} /> Unlimited with PRO</Btn>
              <Btn variant="ghost" block><BearIcon size={20} /> Practice to earn +1</Btn>
            </div>
          </div>
        )}
        {open === "trade" && (
          <div>
            <div className="font-display text-lg font-black text-white">Confirm order</div>
            <div className="panel-inset mt-3 space-y-2 rounded-2xl p-4 text-xs font-bold">
              {[["Side", "Buy / Long", "text-bull"], ["Amount", "$250.00", "text-white"], ["Est. qty", "0.00389 BTC", "text-white"], ["Fee", "$0.25", "text-ink-300"]].map(([k, v, c]) => (
                <div key={k} className="flex justify-between"><span className="text-ink-400">{k}</span><span className={cn("font-mono", c)}>{v}</span></div>
              ))}
            </div>
            <Btn variant="bull" block size="lg" className="mt-4" onClick={() => { haptic(30); setOpen(null); }}>
              <Icon name="check" size={18} stroke={3} /> Confirm buy
            </Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

export default function Feedback() {
  return (
    <Section id="feedback" index="07" kicker="System response" title="Feedback">
      <Modal />
      <Toasts />
      <Alerts />
      <SkeletonEmpty />
      <Loaders />
      <LessonComplete />
      <BottomSheet />
    </Section>
  );
}
