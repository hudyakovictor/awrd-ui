import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Confetti, Icon, Label, ProgressBar, Section, useBump, useCountUp } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { cn } from "../utils/cn";

/* ───────── MODAL ───────── */
function Modal() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"quit" | "confirm">("quit");
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 200); };
  return (
    <AssetCard id="FBK-01" title="Modal Dialogs" desc="Диалоги с blur-подложкой, пружинным появлением и маскотом. Esc/клик по фону — закрыть." tags={["modal", "dialog", "confirm"]} stageClass="min-h-[300px] overflow-hidden">
      <div className="space-y-2 opacity-60">
        <div className="skeleton h-4 w-3/4 rounded-full" /><div className="skeleton h-4 w-1/2 rounded-full" /><div className="skeleton h-24 w-full rounded-2xl" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Btn v="bear" size="sm" onClick={() => { setKind("quit"); setOpen(true); }}>Quit lesson</Btn>
        <Btn v="sky" size="sm" onClick={() => { setKind("confirm"); setOpen(true); }}>Confirm trade</Btn>
      </div>
      {open && (
        <div className="absolute inset-0 z-30 grid place-items-center rounded-[18px] bg-ink-950/70 p-4 backdrop-blur-sm" style={{ animation: `${closing ? "fadeIn .2s reverse" : "fadeIn .2s"} both` }} onClick={close}
          onKeyDown={(e) => e.key === "Escape" && close()} tabIndex={-1}>
          <div onClick={(e) => e.stopPropagation()} className="panel w-full max-w-[290px] p-5 text-center" style={{ animation: closing ? "scaleIn .2s reverse both" : "scaleIn .35s cubic-bezier(.3,1.5,.5,1) both" }}>
            {kind === "quit" ? (
              <>
                <Mascot mood="sad" size={80} className="mx-auto -mt-14" />
                <div className="mt-1 text-lg font-extrabold text-white">Уже уходишь?</div>
                <p className="mb-4 mt-1 text-xs text-ink-300">Прогресс урока будет потерян. Осталось всего 3 вопроса!</p>
                <div className="space-y-2.5">
                  <Btn v="bull" block onClick={close}>Keep learning</Btn>
                  <button onClick={close} className="w-full py-2 text-xs font-extrabold uppercase tracking-widest text-bear hover:text-white">End session</button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-gold to-gold-edge shadow-[0_4px_0_#8a5c00]"><Icon name="warn" size={28} stroke={2.6} className="text-ink-900" /></div>
                <div className="mt-3 text-lg font-extrabold text-white">Подтвердить сделку</div>
                <div className="my-3 space-y-1 rounded-xl bg-ink-900/60 p-3 text-left text-xs">
                  <div className="flex justify-between"><span className="text-ink-400">Buy</span><span className="font-mono font-bold text-white">0.0093 BTC</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Leverage</span><span className="font-mono font-bold text-gold">10×</span></div>
                  <div className="flex justify-between"><span className="text-ink-400">Liq. price</span><span className="font-mono font-bold text-bear">57,825</span></div>
                </div>
                <div className="grid grid-cols-2 gap-2.5"><Btn v="ghost" size="sm" onClick={close}>Cancel</Btn><Btn v="bull" size="sm" onClick={close}>Confirm</Btn></div>
              </>
            )}
          </div>
        </div>
      )}
    </AssetCard>
  );
}

/* ───────── TOASTS ───────── */
type T = { id: number; k: "success" | "info" | "warn" | "error"; t: string };
const TK = {
  success: { i: "check", c: "#2ee59d", bg: "from-[#0f3b33]", title: "Success" },
  info: { i: "info", c: "#3d8bff", bg: "from-[#122b5e]", title: "Info" },
  warn: { i: "warn", c: "#ffc53d", bg: "from-[#3b2f10]", title: "Warning" },
  error: { i: "x", c: "#ff4d6a", bg: "from-[#3d1628]", title: "Error" },
};
const MSG = { success: "Урок пройден: +20 XP", info: "Новый курс: Options 101", warn: "Высокая волатильность BTC", error: "Ордер отклонён: мало маржи" };
function Toasts() {
  const [list, setList] = useState<T[]>([{ id: 1, k: "success", t: MSG.success }, { id: 2, k: "info", t: MSG.info }]);
  const [n, setN] = useState(3);
  const add = (k: T["k"]) => { setList((l) => [{ id: n, k, t: MSG[k] }, ...l].slice(0, 4)); setN(n + 1); };
  const rm = (id: number) => setList((l) => l.filter((x) => x.id !== id));
  return (
    <AssetCard id="FBK-02" title="Toast Stack" desc="4 типа уведомлений: влет справа, авто-скрытие с полосой таймера, закрытие вручную, лимит стека." tags={["toast", "notification", "snackbar"]}>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(TK) as T["k"][]).map((k) => (
          <button key={k} onClick={() => add(k)} className="raised flex flex-col items-center gap-1 rounded-xl py-2 transition-transform active:translate-y-0.5">
            <Icon name={TK[k].i} size={18} stroke={2.8} style={{ color: TK[k].c }} />
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-ink-300">{k}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 min-h-[200px] space-y-2">
        {list.map((x) => <ToastItem key={x.id} t={x} onDone={() => rm(x.id)} />)}
        {list.length === 0 && <div className="pt-16 text-center text-xs font-bold text-ink-500">Нет уведомлений</div>}
      </div>
    </AssetCard>
  );
}
function ToastItem({ t, onDone }: { t: T; onDone: () => void }) {
  const k = TK[t.k];
  const ref = useRef(onDone);
  ref.current = onDone;
  useEffect(() => { const id = setTimeout(() => ref.current(), 5000); return () => clearTimeout(id); }, []);
  return (
    <div className={cn("relative flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r to-ink-800 p-3", k.bg)} style={{ animation: "slideInR .4s cubic-bezier(.3,1.3,.5,1) both", boxShadow: `inset 0 0 0 1px ${k.c}44, 0 4px 0 #081130` }}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ background: k.c }}><Icon name={k.i} size={16} stroke={3.2} className="text-ink-900" /></span>
      <div className="min-w-0 flex-1"><div className="text-xs font-extrabold" style={{ color: k.c }}>{k.title}</div><div className="truncate text-xs font-semibold text-ink-100">{t.t}</div></div>
      <button onClick={onDone} className="rounded-lg p-1 text-ink-400 hover:bg-white/10 hover:text-white"><Icon name="x" size={14} stroke={3} /></button>
      <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left" style={{ background: k.c, animation: "toastBar 5s linear forwards" }} />
    </div>
  );
}

/* ───────── ALERTS ───────── */
function Alerts() {
  const init = [
    { id: 1, i: "warn", c: "#ffc53d", t: "Плановые работы в 03:00 UTC", a: "Details" },
    { id: 2, i: "bolt", c: "#ff4d6a", t: "BTC −8% за час: высокий риск", a: "Learn why" },
    { id: 3, i: "sparkles", c: "#a174ff", t: "2× XP выходные активированы!", a: "Play" },
  ];
  const [list, setList] = useState(init);
  const [gone, setGone] = useState<number[]>([]);
  const dismiss = (id: number) => { setGone((g) => [...g, id]); setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 300); };
  return (
    <AssetCard id="FBK-03" title="Alert Banners" desc="Системные баннеры с действием и плавным схлопыванием при закрытии." tags={["alert", "banner", "system"]}>
      <div className="space-y-3">
        {list.map((x) => (
          <div key={x.id} className="grid transition-all duration-300" style={{ gridTemplateRows: gone.includes(x.id) ? "0fr" : "1fr", opacity: gone.includes(x.id) ? 0 : 1 }}>
            <div className="overflow-hidden">
              <div className="flex items-center gap-3 rounded-2xl p-3" style={{ background: `linear-gradient(90deg, ${x.c}26, ${x.c}0d)`, boxShadow: `inset 0 0 0 1.5px ${x.c}66, 0 4px 0 #081130` }}>
                <Icon name={x.i} size={22} variant="duo" style={{ color: x.c }} />
                <span className="flex-1 text-xs font-extrabold text-ink-100">{x.t}</span>
                <button className="rounded-lg px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider" style={{ background: `${x.c}33`, color: x.c }}>{x.a}</button>
                <button onClick={() => dismiss(x.id)} className="text-ink-400 hover:text-white"><Icon name="x" size={14} stroke={3} /></button>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="py-6 text-center"><Btn v="ghost" size="sm" onClick={() => { setList(init); setGone([]); }}><Icon name="refresh" size={14} />Restore</Btn></div>}
      </div>
    </AssetCard>
  );
}

/* ───────── PROGRESS ───────── */
function Progress() {
  const [p, setP] = useState(45);
  const v = useCountUp(p, 800);
  const R = 42, C = 2 * Math.PI * R;
  const seg = 10, filled = Math.round((p / 100) * seg);
  return (
    <AssetCard id="FBK-04" title="Progress Indicators" desc="Кольцо, линейный, сегментный и indeterminate прогресс — синхронно управляются." tags={["progress", "ring", "loader"]}>
      <div className="flex items-center gap-5">
        <div className="relative grid h-28 w-28 shrink-0 place-items-center">
          <svg width="112" height="112" className="absolute -rotate-90">
            <circle cx="56" cy="56" r={R} stroke="#081130" strokeWidth="12" fill="none" />
            <circle cx="56" cy="56" r={R} stroke="url(#pg)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p / 100)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.3,1.2,.5,1)", filter: "drop-shadow(0 0 6px #2ee59d88)" }} />
            <defs><linearGradient id="pg"><stop offset="0" stopColor="#3d8bff" /><stop offset="1" stopColor="#2ee59d" /></linearGradient></defs>
          </svg>
          <div className="text-center"><div className="font-mono text-2xl font-extrabold text-white">{Math.round(v)}%</div><div className="text-[9px] font-extrabold uppercase tracking-widest text-ink-400">Course</div></div>
        </div>
        <div className="flex-1 space-y-4">
          <div><Label>Linear</Label><ProgressBar value={p} color="sky" h={14} /></div>
          <div><Label>Segmented · lessons</Label>
            <div className="flex gap-1">{Array.from({ length: seg }).map((_, i) => <span key={i} className={cn("h-3 flex-1 rounded-full transition-all duration-300", i < filled ? "bg-bull shadow-[0_0_8px_#2ee59d88]" : "well")} style={{ transitionDelay: `${i * 40}ms` }} />)}</div>
          </div>
          <div><Label>Indeterminate</Label><div className="well h-3 overflow-hidden rounded-full"><div className="stripes h-full w-full rounded-full bg-violet/70" /></div></div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Btn v="ghost" size="sm" onClick={() => setP(Math.max(0, p - 15))}>−15</Btn>
        <Btn v="sky" size="sm" onClick={() => setP(Math.min(100, p + 15))}>+15</Btn>
        <Btn v="dark" size="sm" onClick={() => setP(0)}>Reset</Btn>
      </div>
    </AssetCard>
  );
}

/* ───────── LOADERS / SKELETON ───────── */
function Loaders() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (!loaded) { const t = setTimeout(() => setLoaded(true), 2200); return () => clearTimeout(t); } }, [loaded]);
  return (
    <AssetCard id="FBK-05" title="Loaders & Skeletons" desc="Спиннер, свечной эквалайзер, точки и skeleton-строки с шиммером, переходящие в контент." tags={["loader", "spinner", "skeleton"]}>
      <div className="grid grid-cols-3 gap-3">
        <div className="raised grid h-20 place-items-center rounded-2xl"><span className="h-9 w-9 rounded-full border-4 border-ink-600 border-t-sky anim-spin" style={{ filter: "drop-shadow(0 0 6px #3d8bff)" }} /></div>
        <div className="raised flex h-20 items-center justify-center gap-1.5 rounded-2xl">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className={cn("h-9 w-2 origin-bottom rounded-sm", i % 2 ? "bg-bear" : "bg-bull")} style={{ animation: `barBounce 1s ease-in-out ${i * 0.12}s infinite` }} />)}
        </div>
        <div className="raised flex h-20 items-center justify-center gap-1.5 rounded-2xl">
          {[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 rounded-full bg-gold" style={{ animation: `dot 1.2s ease-in-out ${i * 0.16}s infinite` }} />)}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {[0, 1, 2].map((i) => loaded ? (
          <div key={`c${i}`} className="anim-fade-up flex items-center gap-3 rounded-xl bg-ink-800/60 p-2.5" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="grid h-9 w-9 place-items-center rounded-full text-[10px] font-extrabold text-white" style={{ background: ["#f7931a", "#8c8cff", "#14f195"][i] }}>{["BTC", "ETH", "SOL"][i]}</span>
            <div className="flex-1"><div className="text-sm font-extrabold text-white">{["Bitcoin", "Ethereum", "Solana"][i]}</div><div className="text-[11px] text-ink-400">Lesson {i + 1} ready</div></div>
            <Icon name="chevR" size={16} className="text-ink-400" />
          </div>
        ) : (
          <div key={`s${i}`} className="flex items-center gap-3 rounded-xl bg-ink-800/40 p-2.5">
            <span className="skeleton h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5"><div className="skeleton h-3 w-2/3 rounded-full" /><div className="skeleton h-2.5 w-1/3 rounded-full" /></div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center"><Btn v="ghost" size="sm" onClick={() => setLoaded(false)}><Icon name="refresh" size={14} />Reload</Btn></div>
    </AssetCard>
  );
}

/* ───────── EMPTY STATE ───────── */
function Empty() {
  const [has, setHas] = useState(false);
  return (
    <AssetCard id="FBK-06" title="Empty State" desc="Пустое состояние с парящей иллюстрацией, объяснением и CTA — превращает пустоту в действие." tags={["empty", "zero-state", "cta"]}>
      {!has ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-ink-600 px-4 py-6 text-center">
          <div className="relative anim-float">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-ink-700 shadow-[0_5px_0_#0b1638]"><Icon name="wallet" size={38} variant="duo" className="text-ink-400" /></div>
            <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-gold shadow-[0_3px_0_#cc8a00] anim-heartbeat"><Icon name="plus" size={16} stroke={3.4} className="text-ink-900" /></span>
          </div>
          <div className="mt-4 text-base font-extrabold text-white">Пока нет сделок</div>
          <p className="mb-4 mt-1 max-w-[220px] text-xs text-ink-400">Открой первую демо-позицию — без риска, на виртуальные $10,000.</p>
          <Btn v="bull" size="sm" onClick={() => setHas(true)}>Make first trade</Btn>
        </div>
      ) : (
        <div className="anim-pop flex flex-col items-center py-6 text-center">
          <Mascot mood="wow" size={80} />
          <div className="mt-2 text-base font-extrabold text-bull">Первая сделка открыта!</div>
          <div className="mb-3 text-xs text-ink-400">Ачивка «First Trade» разблокирована</div>
          <Btn v="ghost" size="sm" onClick={() => setHas(false)}>Reset</Btn>
        </div>
      )}
    </AssetCard>
  );
}

/* ───────── LESSON COMPLETE ───────── */
function Complete() {
  const [k, bump] = useBump();
  const [run, setRun] = useState(1);
  const xp = useCountUp(run ? 35 : 0, 1200);
  const acc = useCountUp(run ? 92 : 0, 1400);
  const time = useCountUp(run ? 184 : 0, 1600);
  const replay = () => { setRun(0); setTimeout(() => { setRun((r) => r + 1); bump(); }, 60); };
  return (
    <AssetCard id="FBK-07" title="Lesson Complete Screen" desc="Финальный экран урока: конфетти, счётчики статистики с count-up и каскадным появлением." tags={["celebration", "results", "confetti"]} stageClass="overflow-hidden">
      <Confetti trigger={k || 1} count={50} />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-[-24px] rounded-full opacity-60" style={{ background: "repeating-conic-gradient(#ffc53d33 0 10deg, transparent 10deg 30deg)", animation: "rays 10s linear infinite", maskImage: "radial-gradient(circle, #000 35%, transparent 70%)" }} />
          <Mascot key={k} mood="happy" size={96} className="anim-pop relative" />
        </div>
        <div key={`t${k}`} className="anim-pop mt-2 text-2xl font-extrabold text-gold text-glow-gold">Lesson complete!</div>
        <div className="mt-4 grid w-full grid-cols-3 gap-2.5">
          {[
            { l: "Total XP", v: `${Math.round(xp)}`, c: "#ffc53d", e: "#cc8a00", i: "bolt" },
            { l: "Accuracy", v: `${Math.round(acc)}%`, c: "#2ee59d", e: "#12a46a", i: "target" },
            { l: "Time", v: `${Math.floor(time / 60)}:${String(Math.round(time % 60)).padStart(2, "0")}`, c: "#3d8bff", e: "#1e56c9", i: "clock" },
          ].map((s, i) => (
            <div key={`${s.l}${k}`} className="anim-fade-up overflow-hidden rounded-2xl" style={{ background: s.c, boxShadow: `0 4px 0 ${s.e}`, animationDelay: `${0.2 + i * 0.12}s` }}>
              <div className="py-1 text-[9px] font-extrabold uppercase tracking-widest text-ink-900">{s.l}</div>
              <div className="m-0.5 flex items-center justify-center gap-1 rounded-[14px] bg-ink-900 py-2.5 font-mono text-base font-extrabold" style={{ color: s.c }}><Icon name={s.i} size={14} variant="solid" />{s.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <Btn v="ghost" size="sm" onClick={replay}><Icon name="refresh" size={14} />Replay</Btn>
          <Btn v="bull" size="sm" onClick={replay}>Continue</Btn>
        </div>
      </div>
    </AssetCard>
  );
}

export default function Feedback() {
  return (
    <Section id="feedback" num="07" title="Feedback" subtitle="Система отклика: диалоги, уведомления, прогресс, загрузка и празднования">
      <Modal />
      <Toasts />
      <Alerts />
      <Progress />
      <Loaders />
      <Empty />
      <Complete />
    </Section>
  );
}
