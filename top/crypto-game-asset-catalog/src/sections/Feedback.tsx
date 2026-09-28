import { useEffect, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X, WifiOff, SearchX, HelpCircle, Wrench } from "lucide-react";
import { Asset, Section, Btn, GhostBtn, Bar, toneHex, type Tone } from "../kit/ui";
import { Mascot } from "../kit/Mascot";
import { CoinIcon } from "../kit/GameIcons";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

type T = { id: number; k: "ok" | "info" | "warn" | "err"; t: string; d: string };
const tk: Record<T["k"], { I: typeof Info; tone: Tone }> = {
  ok: { I: CheckCircle2, tone: "bull" },
  info: { I: Info, tone: "sky" },
  warn: { I: AlertTriangle, tone: "gold" },
  err: { I: XCircle, tone: "bear" },
};
const samples: Record<T["k"], [string, string]> = {
  ok: ["Order filled", "Bought 0.015 BTC @ 64,218"],
  info: ["New lesson unlocked", "Unit 4 · Support & Resistance"],
  warn: ["Margin at 72%", "Consider reducing leverage"],
  err: ["Order rejected", "Insufficient balance"],
};
function Toasts() {
  const [ts, setTs] = useState<T[]>([{ id: 1, k: "ok", t: samples.ok[0], d: samples.ok[1] }]);
  const [leaving, setLeaving] = useState<number[]>([]);
  const close = (id: number) => { setLeaving((l) => [...l, id]); setTimeout(() => { setTs((x) => x.filter((t) => t.id !== id)); setLeaving((l) => l.filter((i) => i !== id)); }, 250); };
  const push = (k: T["k"]) => {
    const id = Date.now();
    setTs((x) => [{ id, k, t: samples[k][0], d: samples[k][1] }, ...x].slice(0, 4));
    k === "err" ? sfx.error() : k === "ok" ? sfx.correct() : sfx.tap();
    setTimeout(() => close(id), 4000);
  };
  return (
    <Asset code="G-001" title="Toast Stack" desc="Стек уведомлений 4 типов: въезд, авто-скрытие с таймером, ручное закрытие." hint="Вызови тосты" specs={["4 types", "4s auto", "max 4"]}>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(tk) as T["k"][]).map((k) => {
          const { I, tone } = tk[k];
          return <button key={k} onClick={() => push(k)} className="grid h-11 place-items-center rounded-xl bg-ink-800 shadow-[0_3px_0_#08112a] transition hover:bg-ink-700 active:translate-y-[3px] active:shadow-none" style={{ color: toneHex[tone] }}><I size={20} /></button>;
        })}
      </div>
      <div className="mt-4 min-h-[250px] space-y-2">
        {ts.map((t) => {
          const { I, tone } = tk[t.k];
          const c = toneHex[tone];
          return (
            <div key={t.id} className={cn("relative flex items-start gap-3 overflow-hidden rounded-2xl p-3 transition-all duration-200", leaving.includes(t.id) ? "translate-x-full opacity-0" : "anim-slide-right")} style={{ background: `linear-gradient(90deg, ${c}22, #16264a 60%)`, boxShadow: `inset 3px 0 0 ${c}, inset 0 0 0 1px ${c}33, 0 4px 0 #08112a` }}>
              <I size={20} style={{ color: c }} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1"><div className="text-[13px] font-extrabold">{t.t}</div><div className="num text-[11px] text-mist">{t.d}</div></div>
              <button onClick={() => close(t.id)} className="text-mist hover:text-white"><X size={16} /></button>
              <span className="absolute bottom-0 left-0 h-[3px] origin-left" style={{ width: "100%", background: c, animation: "shrink 4s linear forwards" }} />
            </div>
          );
        })}
        {!ts.length && <div className="pt-16 text-center text-[12px] text-mist">Нет уведомлений</div>}
      </div>
      <style>{`@keyframes shrink{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
    </Asset>
  );
}

function Modal() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"confirm" | "danger">("confirm");
  const [done, setDone] = useState<string | null>(null);
  return (
    <Asset code="G-002" title="Modal Dialogs" desc="Подтверждение сделки и опасное действие: blur-подложка, pop-in, фокус на действии." hint="Открой диалог" specs={["backdrop blur", "pop 450ms", "2 variants"]}>
      <div className="relative h-[300px] overflow-hidden rounded-2xl bg-ink-900/60 p-4">
        <div className="space-y-2 opacity-60">
          <div className="h-4 w-1/2 rounded bg-ink-600" /><div className="h-3 w-3/4 rounded bg-ink-700" /><div className="h-24 rounded-xl bg-ink-700" /><div className="h-3 w-2/3 rounded bg-ink-700" />
        </div>
        <div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2">
          <Btn tone="bull" size="sm" onClick={() => { setKind("confirm"); setOpen(true); }}>Confirm trade</Btn>
          <Btn tone="bear" size="sm" onClick={() => { setKind("danger"); setOpen(true); }}>Reset progress</Btn>
        </div>
        {done && !open && <div key={done} className="anim-pop absolute inset-x-0 top-1/3 text-center font-display text-sm font-bold text-bull">{done}</div>}
        {open && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-ink-950/60 p-4 backdrop-blur-[3px] anim-fade" onClick={() => setOpen(false)}>
            <div className="panel anim-pop w-full p-5 text-center" onClick={(e) => e.stopPropagation()}>
              {kind === "confirm" ? (
                <>
                  <CoinIcon size={52} className="mx-auto anim-float" />
                  <div className="font-display mt-2 text-lg font-extrabold">Buy 0.015 BTC?</div>
                  <div className="num mx-auto mt-2 grid max-w-[200px] grid-cols-2 gap-y-1 text-left text-[11px]"><span className="text-mist">Price</span><span className="text-right">$64,218</span><span className="text-mist">Fee</span><span className="text-right">$0.96</span><span className="text-mist">Total</span><span className="text-right font-extrabold text-bull">$964.23</span></div>
                </>
              ) : (
                <>
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-bear/20 text-bear anim-shake"><AlertTriangle size={28} /></div>
                  <div className="font-display mt-2 text-lg font-extrabold">Reset all progress?</div>
                  <div className="mt-1 text-[12px] text-mist">Серия 47 дней и все медали будут потеряны.</div>
                </>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <GhostBtn className="!h-11" onClick={() => setOpen(false)}>Cancel</GhostBtn>
                <Btn tone={kind === "confirm" ? "bull" : "bear"} className="!h-11" onClick={() => { setOpen(false); setDone(kind === "confirm" ? "✓ Order placed" : "Progress reset"); }}>{kind === "confirm" ? "Buy" : "Reset"}</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

const banners = [
  { id: "m", tone: "bear" as Tone, I: AlertTriangle, t: "Margin call", d: "Позиция ETH близка к ликвидации", a: "Add funds" },
  { id: "s", tone: "gold" as Tone, I: Wrench, t: "Maintenance 02:00 UTC", d: "Симулятор будет недоступен 15 мин", a: "Details" },
  { id: "p", tone: "violet" as Tone, I: Info, t: "Pro trial · 3 days left", d: "Безлимитные жизни и разборы сделок", a: "Upgrade" },
];
function Banners() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [acted, setActed] = useState<string | null>(null);
  return (
    <Asset code="G-003" title="Alert Banners" desc="Контекстные баннеры: критический, системный, промо. Сворачиваются с анимацией." hint="Закрой или нажми действие" specs={["3 severity", "collapse", "CTA"]}>
      <div className="space-y-2.5">
        {banners.map(({ id, tone, I, t, d, a }) => {
          const c = toneHex[tone];
          const h = hidden.includes(id);
          return (
            <div key={id} className="grid transition-all duration-300" style={{ gridTemplateRows: h ? "0fr" : "1fr", opacity: h ? 0 : 1 }}>
              <div className="overflow-hidden">
                <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: `linear-gradient(180deg, ${c}26, ${c}14)`, boxShadow: `inset 0 0 0 1.5px ${c}55, 0 4px 0 ${c}33` }}>
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone === "bear" && "anim-wiggle")} style={{ background: c, boxShadow: `0 3px 0 color-mix(in oklab, ${c} 60%, black)` }}><I size={18} className="text-white" /></span>
                  <div className="min-w-0 flex-1"><div className="text-[13px] font-extrabold">{t}</div><div className="truncate text-[11px] text-snow/70">{d}</div></div>
                  <button onClick={() => { setActed(a); sfx.tap(); }} className="rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold uppercase" style={{ color: c, background: `${c}22` }}>{a}</button>
                  <button onClick={() => { setHidden([...hidden, id]); sfx.soft(); }} className="text-mist hover:text-white"><X size={15} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex h-6 items-center justify-between text-[11px]">
        <span key={acted} className="anim-fade font-bold text-mist">{acted ? `→ ${acted}` : ""}</span>
        {hidden.length > 0 && <button onClick={() => setHidden([])} className="font-bold text-sky">Restore all</button>}
      </div>
    </Asset>
  );
}

function Loaders() {
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setInterval(() => setPct((p) => (p >= 100 ? 0 : p + 1)), 50); return () => clearInterval(t); }, []);
  const R = 30, C = 2 * Math.PI * R;
  return (
    <Asset code="G-004" title="Loaders & Skeletons" desc="Свечной лоадер, кольцевой и линейный прогресс, скелетон → контент." hint="Переключи скелетон" specs={["candle loader", "ring", "shimmer"]}>
      <div className="grid grid-cols-3 items-center gap-3">
        <div className="panel-inset flex h-24 items-end justify-center gap-1.5 pb-5 !rounded-2xl">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="block w-2.5 origin-bottom rounded-sm" style={{ height: 36, background: i % 2 ? "#ff4f6d" : "#22d39a", animation: `candle-load .9s ${i * 0.12}s ease-in-out infinite` }} />
          ))}
        </div>
        <div className="panel-inset relative grid h-24 place-items-center !rounded-2xl">
          <svg viewBox="0 0 72 72" className="h-20 w-20 -rotate-90">
            <circle cx="36" cy="36" r={R} stroke="#0b1530" strokeWidth="7" fill="none" />
            <circle cx="36" cy="36" r={R} stroke="#3b82ff" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ filter: "drop-shadow(0 0 4px #3b82ff)" }} />
          </svg>
          <span className="num absolute text-sm font-extrabold">{pct}%</span>
        </div>
        <div className="panel-inset grid h-24 place-items-center !rounded-2xl">
          <span className="block h-11 w-11 rounded-full border-4 border-ink-600 border-t-gold border-r-gold anim-spin" style={{ filter: "drop-shadow(0 0 6px #ffc53d88)" }} />
        </div>
      </div>
      <div className="mt-4"><div className="mb-1 flex justify-between text-[11px] font-bold"><span>Syncing prices…</span><span className="num text-bull">{pct}%</span></div><Bar value={pct} tone="bull" h={12} /></div>
      <div className="panel-inset mt-4 space-y-3 p-3 !rounded-2xl">
        {[0, 1, 2].map((i) =>
          loading ? (
            <div key={i} className="flex items-center gap-3"><div className="skeleton h-9 w-9 rounded-xl" /><div className="flex-1 space-y-1.5"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-2.5 w-1/3 rounded" /></div><div className="skeleton h-5 w-12 rounded-md" /></div>
          ) : (
            <div key={i} className="anim-fade flex items-center gap-3" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="grid h-9 w-9 place-items-center rounded-xl text-[11px] font-black text-ink-900" style={{ background: ["#f7931a", "#8b9dff", "#22d39a"][i] }}>{["B", "E", "S"][i]}</span>
              <div className="flex-1"><div className="text-[13px] font-bold">{["Bitcoin", "Ethereum", "Solana"][i]}</div><div className="num text-[10px] text-mist">{["64,218", "3,142", "148.20"][i]}</div></div>
              <span className={cn("num text-[11px] font-extrabold", i === 1 ? "text-bear" : "text-bull")}>{["+2.1%", "−0.8%", "+5.3%"][i]}</span>
            </div>
          )
        )}
      </div>
      <GhostBtn className="mt-3 !h-10 w-full !text-[11px]" onClick={() => setLoading(!loading)}>{loading ? "Load content" : "Show skeleton"}</GhostBtn>
    </Asset>
  );
}

const empties = {
  empty: { I: SearchX, t: "No positions yet", d: "Открой первую сделку в симуляторе — это бесплатно.", cta: "Start trading", mood: "think" as const, tone: "bull" as Tone },
  offline: { I: WifiOff, t: "You're offline", d: "Уроки доступны офлайн, котировки — нет.", cta: "Retry", mood: "sad" as const, tone: "sky" as Tone },
  success: { I: CheckCircle2, t: "All caught up!", d: "Все уроки на сегодня пройдены. Возвращайся завтра.", cta: "Practice more", mood: "hype" as const, tone: "gold" as Tone },
};
function EmptyStates() {
  const [s, setS] = useState<keyof typeof empties>("empty");
  const [retry, setRetry] = useState(false);
  const e = empties[s];
  return (
    <Asset code="G-005" title="Empty / Offline / Done States" desc="Экраны-состояния с маскотом, понятным текстом и одним главным действием." hint="Переключай состояния" specs={["3 states", "mascot", "1 CTA"]}>
      <div className="panel-inset mb-4 grid grid-cols-3 p-1 !rounded-xl">
        {(Object.keys(empties) as (keyof typeof empties)[]).map((k) => (
          <button key={k} onClick={() => { setS(k); sfx.tick(); }} className={cn("h-8 rounded-lg text-[11px] font-extrabold capitalize transition", s === k ? "bg-ink-600 text-white shadow-[0_2px_0_#08112a]" : "text-mist")}>{k}</button>
        ))}
      </div>
      <div key={s} className="anim-fade flex flex-col items-center rounded-2xl border-2 border-dashed border-ink-500 px-4 py-6 text-center">
        <Mascot size={96} mood={e.mood} />
        <div className="mt-2 flex items-center gap-1.5 font-display text-base font-extrabold"><e.I size={16} style={{ color: toneHex[e.tone] }} />{e.t}</div>
        <p className="mt-1 max-w-[240px] text-[12px] text-mist">{e.d}</p>
        <Btn tone={e.tone} size="sm" className={cn("mt-4", e.tone === "gold" && "!text-[#3b2600]")} onClick={() => { if (s === "offline") { setRetry(true); setTimeout(() => setRetry(false), 1200); } }}>
          {retry ? <span className="block h-4 w-4 rounded-full border-2 border-white/40 border-t-white anim-spin" /> : e.cta}
        </Btn>
      </div>
    </Asset>
  );
}

const glossary = [
  { w: "Stop-loss", d: "Ордер, автоматически закрывающий убыточную позицию на заданной цене." },
  { w: "Liquidity", d: "Насколько легко купить/продать актив без сильного движения цены." },
  { w: "Slippage", d: "Разница между ожидаемой и фактической ценой исполнения." },
];
function Tooltips() {
  const [pop, setPop] = useState<number | null>(null);
  const [learned, setLearned] = useState<number[]>([]);
  return (
    <Asset code="G-006" title="Tooltips & Glossary Popovers" desc="Подчёркнутые термины в тексте урока раскрывают карточку-определение." hint="Тапни подчёркнутый термин" specs={["inline term", "popover", "learned ✓"]}>
      <div className="panel-inset relative p-4 text-[14px] font-semibold leading-7 !rounded-2xl">
        Всегда ставь{" "}
        {glossary.map((g, i) => (
          <span key={g.w}>
            <button onClick={() => { setPop(pop === i ? null : i); sfx.soft(); }} className={cn("relative border-b-2 border-dashed font-extrabold transition", learned.includes(i) ? "border-bull text-bull" : "border-sky text-sky hover:text-white")}>
              {g.w}
              {pop === i && (
                <span className="panel-raised anim-pop absolute left-1/2 top-full z-30 mt-3 block w-56 -translate-x-1/2 p-3 text-left text-[12px] font-semibold leading-snug text-snow">
                  <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#213866]" />
                  <span className="mb-1 flex items-center gap-1 text-[10px] font-extrabold uppercase text-sky"><HelpCircle size={12} /> {g.w}</span>
                  {g.d}
                  <span role="button" onClick={(e) => { e.stopPropagation(); setLearned([...new Set([...learned, i])]); setPop(null); sfx.correct(); }} className="mt-2 block rounded-lg bg-bull/20 py-1 text-center text-[10px] font-extrabold uppercase text-bull">Got it ✓</span>
                </span>
              )}
            </button>
            {i === 0 ? ", проверяй " : i === 1 ? " и помни про " : "."}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3 pt-24">
        <div className="flex-1"><Bar value={(learned.length / 3) * 100} tone="bull" h={10} /></div>
        <span className="num text-[11px] font-bold text-mist">{learned.length}/3 terms</span>
      </div>
    </Asset>
  );
}

export default function Feedback() {
  return (
    <Section id="feedback" index="07" title="Feedback & States" subtitle="Тосты, модалки, баннеры, загрузка, пустые состояния, подсказки">
      <Toasts />
      <Modal />
      <Banners />
      <Loaders />
      <EmptyStates />
      <Tooltips />
    </Section>
  );
}
