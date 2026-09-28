import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Asset, Bar, Btn3D, Confetti, CountUp, Label, Ring, Section, Spinner, ToastView, useToast, type ToastT, type ToastType } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";

/* ---------- Modal ---------- */
function Modal() {
  const [open, setOpen] = useState<null | "confirm" | "danger">(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [open]);
  const confirm = () => { setBusy(true); setTimeout(() => { setBusy(false); setOpen(null); toast({ type: open === "danger" ? "error" : "success", title: open === "danger" ? "Позиция ликвидирована (демо)" : "Позиция закрыта", msg: "+124.50 USDT реализовано" }); }, 1000); };
  return (
    <Asset title="Modal Dialog" id="fbk.modal" desc="Blur-фон, пружинное появление, Esc/клик вне — закрыть, состояние загрузки.">
      <div className="inset h-52 relative overflow-hidden grid place-items-center">
        <div className="absolute inset-3 space-y-2 opacity-40">{[80, 60, 70, 45].map((w, i) => <div key={i} className="h-3 rounded bg-[#1c3068]" style={{ width: `${w}%` }} />)}</div>
        <div className="relative flex gap-2">
          <Btn3D size="sm" variant="blue" onClick={() => setOpen("confirm")}>Close position</Btn3D>
          <Btn3D size="sm" variant="bear" onClick={() => setOpen("danger")}>Danger</Btn3D>
        </div>
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-[150] grid place-items-center p-4 anim-fade" onClick={() => !busy && setOpen(null)}>
          <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-md" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-sm panel p-6 text-center anim-scale" role="dialog" aria-modal>
            <div className={cn("size-16 mx-auto rounded-2xl grid place-items-center mb-4", open === "danger" ? "bg-bear/15 text-bear" : "bg-blue/15 text-blue")}>
              <Icon name={open === "danger" ? "warning" : "info"} size={30} stroke={2.4} className="anim-wiggle" />
            </div>
            <h4 className="text-[20px] font-extrabold">{open === "danger" ? "Рискованное действие" : "Закрыть позицию?"}</h4>
            <p className="text-[13px] text-mute mt-1.5 mb-6">{open === "danger" ? "Плечо 100x может привести к ликвидации всей маржи. Продолжить?" : "BTCUSDT Long 5x будет закрыт по рыночной цене ~67 420."}</p>
            <div className="grid grid-cols-2 gap-3">
              <Btn3D variant="neutral" onClick={() => setOpen(null)} disabled={busy}>Cancel</Btn3D>
              <Btn3D variant={open === "danger" ? "bear" : "blue"} loading={busy} onClick={confirm}>{open === "danger" ? "Proceed" : "Confirm"}</Btn3D>
            </div>
            <button onClick={() => setOpen(null)} className="absolute top-4 right-4 text-dim hover:text-txt"><Icon name="x" size={18} /></button>
          </div>
        </div>, document.body
      )}
    </Asset>
  );
}

/* ---------- Bottom sheet ---------- */
function BottomSheet() {
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [sel, setSel] = useState(1);
  return (
    <Asset title="Bottom Sheet" id="fbk.sheet" desc="Мобильный лист: тяните за ручку вниз, чтобы закрыть.">
      <div className="inset h-[300px] relative overflow-hidden !rounded-3xl">
        <div className="absolute inset-0 grid place-items-center"><Btn3D size="sm" variant="violet" onClick={() => { setOpen(true); sfx.whoosh(); }} icon={<Icon name="crown" size={15} />}>Upgrade</Btn3D></div>
        {open && <div className="absolute inset-0 bg-ink-950/60 anim-fade" onClick={() => setOpen(false)} />}
        <div className={cn("absolute inset-x-0 bottom-0 bg-[#15254f] rounded-t-3xl p-4 pt-2 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,.5)]", start === null && "transition-transform duration-400 ease-[cubic-bezier(.3,1.2,.5,1)]")}
          style={{ transform: open ? `translateY(${Math.max(0, drag)}px)` : "translateY(105%)" }}>
          <div className="py-2 cursor-grab active:cursor-grabbing touch-none" onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); setStart(e.clientY); }} onPointerMove={(e) => start !== null && setDrag(e.clientY - start)} onPointerUp={() => { if (drag > 80) { setOpen(false); sfx.whoosh(); } setDrag(0); setStart(null); }}>
            <div className="w-10 h-1.5 rounded-full bg-white/25 mx-auto" />
          </div>
          <div className="flex items-center gap-2 mb-3"><Glyph name="crown" size={26} /><span className="font-extrabold">Tradelingo Pro</span></div>
          <div className="space-y-2 mb-3">
            {[["Месяц", "$9.99", ""], ["Год", "$59.99", "−50%"]].map(([t, p, b], i) => (
              <button key={t} onClick={() => { setSel(i); sfx.tick(); }} className="opt w-full px-3 py-2.5 flex items-center justify-between" data-state={sel === i ? "selected" : undefined}>
                <span className="font-extrabold text-[13px]">{t}</span><span className="flex items-center gap-2">{b && <span className="text-[10px] font-extrabold bg-bull text-ink-900 rounded px-1.5">{b}</span>}<span className="num font-bold text-[13px]">{p}</span></span>
              </button>
            ))}
          </div>
          <Btn3D full variant="violet" size="sm" onClick={() => setOpen(false)}>Start free trial</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Toast stack ---------- */
function ToastStack() {
  const [list, setList] = useState<ToastT[]>([{ id: 1, type: "success", title: "Урок сохранён", msg: "Прогресс синхронизирован", dur: 60000 }, { id: 2, type: "info", title: "Новое обновление", msg: "Добавлены уроки по DeFi", dur: 60000 }]);
  const toast = useToast();
  const M: Record<ToastType, [string, string]> = { success: ["Ордер исполнен", "BUY 0.01 BTC @ 67 420"], info: ["Рынок открыт", "Волатильность выше средней"], warning: ["Соединение нестабильно", "Переподключение…"], error: ["Ордер отклонён", "Недостаточно маржи"], xp: ["+50 XP", "Бонус за серию 7 дней"] };
  const add = (t: ToastType) => setList((l) => [...l.slice(-3), { id: Date.now(), type: t, title: M[t][0], msg: M[t][1], dur: 5000 }]);
  return (
    <Asset title="Toast Stack" id="fbk.toast" desc="Автоскрытие с таймером (пауза при наведении). Локальный стек + глобальный сверху справа.">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(["success", "info", "warning", "error", "xp"] as const).map((t) => (
          <Btn3D key={t} size="xs" variant={({ success: "bull", info: "blue", warning: "gold", error: "bear", xp: "violet" } as const)[t]} onClick={() => { add(t); t === "error" ? sfx.error() : sfx.pop(); }}>{t}</Btn3D>
        ))}
        <Btn3D size="xs" variant="neutral" onClick={() => toast({ type: "xp", title: "Глобальный тост", msg: "Появляется в углу экрана" })} icon={<Icon name="send" size={12} />}>Global</Btn3D>
      </div>
      <div className="space-y-2 min-h-[150px]">
        {list.map((t) => <ToastView key={t.id} t={t} onClose={() => setList((l) => l.filter((x) => x.id !== t.id))} />)}
        {!list.length && <div className="text-center text-dim text-[12px] py-10">Тостов нет — нажмите кнопку выше</div>}
      </div>
    </Asset>
  );
}

/* ---------- Alert banners ---------- */
function Alerts() {
  const A = [
    { k: "crit", t: "Критично: высокая волатильность", d: "BTC −8% за 15 минут. Проверьте стоп-лоссы.", c: "border-bear/50 bg-bear/10", ic: "warning", icc: "text-bear", btn: "Проверить" },
    { k: "warn", t: "Плановое обслуживание", d: "Сегодня 03:00–03:30 UTC", c: "border-gold/50 bg-gold/10", ic: "clock", icc: "text-gold", btn: "Ок" },
    { k: "info", t: "Новый юнит: Ончейн-аналитика", d: "8 уроков · +200 XP", c: "border-blue/50 bg-blue/10", ic: "sparkles", icc: "text-blue", btn: "Открыть" },
  ];
  const [hidden, setHidden] = useState<string[]>([]);
  const [retry, setRetry] = useState(false);
  return (
    <Asset title="Alert Banners" id="fbk.alert" desc="Критичные/предупреждения/инфо. Закрытие со схлопыванием.">
      <div className="space-y-2.5">
        {A.map((a) => (
          <div key={a.k} className="grid transition-all duration-400" style={{ gridTemplateRows: hidden.includes(a.k) ? "0fr" : "1fr", opacity: hidden.includes(a.k) ? 0 : 1 }}>
            <div className="overflow-hidden">
              <div className={cn("rounded-2xl border-2 p-3 flex items-start gap-3", a.c)}>
                <Icon name={a.ic} size={20} className={cn("shrink-0 mt-0.5", a.icc, a.k === "crit" && "animate-pulse")} stroke={2.4} />
                <div className="flex-1 min-w-0"><div className="text-[13px] font-extrabold">{a.t}</div><div className="text-[11.5px] text-mute">{a.d}</div></div>
                <button onClick={() => { setHidden([...hidden, a.k]); sfx.tap(); }} className="shrink-0 h-8 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-extrabold">{a.btn}</button>
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border-2 border-dashed border-[#26397a] p-3 flex items-center gap-3">
          <Icon name="refresh" size={18} className={cn("text-mute", retry && "animate-spin")} />
          <span className="flex-1 text-[12px] font-bold text-mute">{retry ? "Переподключение…" : "Нет соединения с биржей"}</span>
          <Btn3D size="xs" variant="neutral" onClick={() => { setRetry(true); setTimeout(() => { setRetry(false); setHidden([]); }, 1500); }}>Retry</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Progress & spinners ---------- */
function Progress() {
  const [p, setP] = useState(45);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    if (p >= 100) { setRun(false); sfx.success(); return; }
    const h = setTimeout(() => setP((v) => Math.min(100, v + Math.random() * 9)), 120);
    return () => clearTimeout(h);
  }, [run, p]);
  return (
    <Asset title="Progress & Loaders" id="fbk.progress" desc="Круговой, линейный, полосатый, сегментный прогресс + 4 спиннера." className="lg:col-span-2">
      <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="flex gap-4 justify-center">
          <Ring value={p} size={110} stroke={11} tone="#ff8a3d" tone2="#ffc53d"><CountUp value={Math.round(p)} suffix="%" className="text-[22px] font-extrabold" /></Ring>
          <Ring value={p} size={110} stroke={11} tone="#3d7bff" tone2="#8d5cff"><Icon name="bolt" size={30} className="text-[#8fb3ff]" /></Ring>
        </div>
        <div className="space-y-4">
          <div><div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-mute">Загрузка рынка…</span><span className="num">{Math.round(p)}%</span></div><Bar value={p} tone="blue" h={12} /></div>
          <div><div className="flex justify-between text-[11px] font-bold mb-1.5"><span className="text-mute">Синхронизация</span><span className="num">{Math.round(p)}%</span></div><Bar value={p} tone="bull" h={16} striped>{Math.round(p)}%</Bar></div>
          <div><div className="text-[11px] font-bold mb-1.5 text-mute">Сегменты урока</div>
            <div className="flex gap-1.5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className={cn("h-3 flex-1 rounded-full transition-all duration-300", i < Math.floor(p / 10) ? "bg-gradient-to-b from-[#ffdc7a] to-[#f0a811] shadow-[0_2px_0_#b8780a]" : "bg-[#16275a]")} />)}</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-white/5">
        <div className="flex items-center gap-6">
          <Spinner size={28} className="text-blue" />
          <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="size-2.5 rounded-full bg-bull" style={{ animation: `dot-bounce 1s ${i * 0.15}s infinite` }} />)}</div>
          <div style={{ perspective: 200 }}><div style={{ animation: "coinflip 1.2s linear infinite" }}><Glyph name="coin" size={32} /></div></div>
          <div className="flex items-end gap-1 h-7">{[0, 1, 2, 3].map((i) => <span key={i} className={cn("w-2 rounded-sm", i % 2 ? "bg-bear" : "bg-bull")} style={{ height: "100%", animation: `floaty .9s ${i * 0.12}s ease-in-out infinite`, transformOrigin: "bottom" }} />)}</div>
        </div>
        <div className="flex gap-2">
          <Btn3D size="sm" variant="neutral" onClick={() => setP(0)}>Reset</Btn3D>
          <Btn3D size="sm" variant="blue" onClick={() => { if (p >= 100) setP(0); setRun(true); }} loading={run}>Simulate</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* ---------- Skeleton & empty ---------- */
function SkeletonEmpty() {
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  useEffect(() => { if (!loading) return; const h = setTimeout(() => setLoading(false), 2200); return () => clearTimeout(h); }, [loading]);
  return (
    <Asset title="Skeleton & Empty State" id="fbk.skeleton" desc="Шиммер-загрузка → контент; переключатель в пустое состояние.">
      <div className="flex gap-2 mb-4">
        <Btn3D size="xs" variant="neutral" onClick={() => { setEmpty(false); setLoading(true); }} icon={<Icon name="refresh" size={12} />}>Reload</Btn3D>
        <Btn3D size="xs" variant={empty ? "blue" : "neutral"} onClick={() => setEmpty(!empty)}>Empty</Btn3D>
      </div>
      <div className="inset p-3 min-h-[210px]">
        {empty ? (
          <div className="flex flex-col items-center text-center py-4 anim-scale">
            <div className="relative mb-3">
              <div className="absolute inset-0 blur-2xl bg-blue/30 rounded-full" />
              <div className="relative anim-float text-mute"><Icon name="folder" size={56} stroke={1.6} /></div>
              <span className="absolute -right-2 -top-1 size-6 rounded-full bg-[#22366f] grid place-items-center text-dim anim-pop"><Icon name="search" size={13} stroke={2.6} /></span>
            </div>
            <div className="font-extrabold">Сделок пока нет</div>
            <div className="text-[12px] text-mute mb-4">Откройте первую демо-позицию</div>
            <Btn3D size="sm" variant="bull" icon={<Icon name="plus" size={14} stroke={3} />}>New trade</Btn3D>
          </div>
        ) : loading ? (
          <div className="space-y-3">{[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3"><div className="skeleton size-10 !rounded-xl" /><div className="flex-1 space-y-2"><div className="skeleton h-3" style={{ width: `${70 - i * 8}%` }} /><div className="skeleton h-2.5 w-2/5" /></div><div className="skeleton h-5 w-12" /></div>
          ))}</div>
        ) : (
          <div className="space-y-3">{[["BTC", "+2.4%", true], ["ETH", "−1.1%", false], ["SOL", "+6.8%", true], ["BNB", "+0.5%", true]].map(([s, c, u], i) => (
            <div key={s as string} className="flex items-center gap-3 anim-fade" style={{ animationDelay: `${i * 70}ms` }}><div className="size-10 rounded-xl bg-[#1c3068] grid place-items-center font-extrabold text-[12px]">{(s as string)[0]}</div><div className="flex-1"><div className="text-[13px] font-extrabold">{s as string}</div><div className="text-[11px] text-dim">Спот · демо</div></div><span className={cn("num text-[12px] font-extrabold", u ? "text-bull" : "text-bear")}>{c as string}</span></div>
          ))}</div>
        )}
      </div>
    </Asset>
  );
}

/* ---------- Celebration ---------- */
function Celebration() {
  const [fire, setFire] = useState(0);
  return (
    <Asset title="Celebration Burst" id="fbk.celebrate" desc="Конфетти + вибро + звук для ключевых побед.">
      <div className="relative inset h-[210px] grid place-items-center overflow-visible">
        <Confetti fire={fire} count={90} spread={240} />
        <div className="text-center">
          <div key={fire} className="anim-pop inline-block"><Glyph name="star" size={64} /></div>
          <div className="font-extrabold mt-1">Первая прибыльная сделка!</div>
          <Btn3D size="sm" variant="gold" className="mt-3" onClick={() => { setFire(Date.now()); sfx.levelUp(); haptic([30, 50, 80]); }} icon={<Icon name="sparkles" size={15} />}>Celebrate</Btn3D>
        </div>
      </div>
      <Label className="mt-3 !mb-0 text-center">haptic · sfx · 90 particles</Label>
    </Asset>
  );
}

export default function Feedback() {
  return (
    <Section id="feedback" index="08" title="Feedback" subtitle="Модалки, листы, тосты, баннеры, прогресс, скелетоны и празднования" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Modal />
        <BottomSheet />
        <ToastStack />
        <Progress />
        <Alerts />
        <SkeletonEmpty />
        <Celebration />
      </div>
    </Section>
  );
}
