import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Bar, Chip, Confetti, Label } from "../components/ui";
import { AvatarArt, TrophyArt, ChestArt, Mascot } from "../components/art";
import { tap, sfx, haptic, useCountUp } from "../lib/fx";
import { particles } from "../lib/particles";
import { wallet } from "../lib/wallet";
import { cn } from "../utils/cn";

/* P01 — Learning path */
type Node = { t: string; icon: IconName; kind: "done" | "cur" | "lock" | "chest" | "boss" };
const NODES: Node[] = [
  { t: "Что такое биржа", icon: "book", kind: "done" },
  { t: "Свечи", icon: "candle", kind: "done" },
  { t: "Тренды", icon: "trendUp", kind: "cur" },
  { t: "Сундук", icon: "gift", kind: "chest" },
  { t: "Уровни", icon: "chart", kind: "lock" },
  { t: "Босс: FOMO", icon: "sword", kind: "boss" },
];
export function PathMap({ compact }: { compact?: boolean }) {
  const [sel, setSel] = useState<number | null>(compact ? null : 2);
  const offs = [0, 56, 76, 40, -30, 0];
  return (
    <div className={cn("relative", compact ? "py-2" : "py-4")}>
      <div className={cn("mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-b from-bull to-bull-d p-3 text-ink-900 shadow-[0_5px_0_#0b6b3e]", compact && "mb-3 p-2.5")}>
        <div className="flex-1"><div className="text-[10px] font-black uppercase tracking-wider opacity-70">Раздел 1 · Модуль 2</div><div className="font-display text-sm font-black">Основы теханализа</div></div>
        <span className="flex size-9 items-center justify-center rounded-xl bg-black/15"><Icon name="book" size={18} stroke={2.6} /></span>
      </div>
      <div className="relative flex flex-col items-center gap-5">
        {NODES.map((n, i) => {
          const off = offs[i] * (compact ? 0.6 : 1);
          const col = n.kind === "done" ? "bg-gold shadow-[0_6px_0_var(--color-gold-d)] text-ink-900" : n.kind === "cur" ? "bg-bull shadow-[0_6px_0_var(--color-bull-d)] text-ink-900" : n.kind === "boss" ? "bg-bear/80 shadow-[0_6px_0_var(--color-bear-d)] text-white" : "bg-ink-700 shadow-[0_6px_0_#0e1b3a] text-ink-400";
          return (
            <div key={i} className="relative" style={{ transform: `translateX(${off}px)` }}>
              {n.kind === "cur" && (
                <>
                  <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 animate-bob whitespace-nowrap rounded-xl border-2 border-ink-600 bg-ink-800 px-2.5 py-1 font-display text-[10px] font-black text-bull">СТАРТ</div>
                  <svg className="absolute -inset-2.5 size-[calc(100%+20px)] -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" stroke="#1b305c" strokeWidth="8" fill="none" /><circle cx="50" cy="50" r="46" stroke="#2BE38B" strokeWidth="8" fill="none" strokeDasharray="289" strokeDashoffset="190" strokeLinecap="round" /></svg>
                </>
              )}
              {n.kind === "chest" ? (
                <button onClick={() => { tap(); setSel(sel === i ? null : i); }} className="relative transition-transform active:scale-90"><ChestArt size={compact ? 60 : 76} /></button>
              ) : (
                <button onClick={() => { tap(n.kind === "lock" ? "error" : "tap", n.kind === "lock" ? 30 : 8); setSel(sel === i ? null : i); }}
                  className={cn("relative flex items-center justify-center rounded-full transition-transform active:translate-y-1.5", compact ? "size-14" : "size-[68px]", col, n.kind === "boss" && "size-20")}>
                  <span className="absolute left-2 right-2 top-1.5 h-1/3 rounded-full bg-white/30" />
                  <Icon name={n.kind === "done" ? "check" : n.kind === "lock" ? "lock" : n.icon} size={compact ? 24 : 30} stroke={2.8} className="relative" />
                </button>
              )}
              {sel === i && !compact && (
                <div className="absolute left-1/2 top-full z-20 mt-4 w-56 -translate-x-1/2 panel p-3 animate-pop">
                  <div className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-white/10 bg-[#172b57]" />
                  <div className="font-display text-xs font-bold">{n.t}</div>
                  <div className="mb-3 text-[11px] text-ink-400">{n.kind === "done" ? "Пройдено · можно повторить" : n.kind === "lock" ? "Пройди предыдущие уроки" : n.kind === "boss" ? "Финальная битва модуля" : n.kind === "chest" ? "Награда за прогресс" : "Урок 3 из 5"}</div>
                  <Btn block s="sm" v={n.kind === "lock" ? "ink" : n.kind === "boss" ? "bear" : n.kind === "done" ? "gold" : "bull"} disabled={n.kind === "lock"} onClick={() => sfx("success")}>
                    {n.kind === "done" ? "Повторить +5 XP" : n.kind === "lock" ? "Закрыто" : n.kind === "boss" ? "В бой" : n.kind === "chest" ? "Открыть" : "Начать +15 XP"}
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
        {!compact && <div className="absolute right-0 top-40 hidden sm:block"><Mascot size={90} mood="happy" className="animate-float" /></div>}
      </div>
    </div>
  );
}

/* P02 — League leaderboard */
const NAMES = ["Kira_HODL", "Вы", "satoshi_jr", "MoonMax", "Алина_Т", "bear_hunter", "Dmitry.eth", "LiquidLeo"];
export function Leaderboard() {
  const [xp, setXp] = useState([1840, 1520, 1610, 1390, 1200, 980, 760, 540]);
  const [flash, setFlash] = useState(false);
  const list = NAMES.map((n, i) => ({ n, xp: xp[i], seed: i })).sort((a, b) => b.xp - a.xp);
  const me = list.findIndex((r) => r.n === "Вы");
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <TrophyArt size={44} />
        <div className="flex-1"><div className="font-display text-sm font-black">Сапфировая лига</div><div className="text-[11px] text-ink-400">Топ-3 повышаются · 2 дня 4 ч</div></div>
        <Btn s="xs" v="bull" icon="bolt" onClick={() => { sfx("coin"); haptic(10); setFlash(true); setTimeout(() => setFlash(false), 500); setXp((x) => x.map((v, i) => (i === 1 ? v + 120 : v))); }}>+120 XP</Btn>
      </div>
      <div className="panel-soft relative overflow-hidden">
        {list.map((r, i) => {
          const isMe = r.n === "Вы";
          return (
            <div key={r.n}>
              {i === 3 && <div className="flex items-center gap-2 bg-bull/10 px-4 py-1 text-[9px] font-black uppercase tracking-widest text-bull"><Icon name="up" size={10} stroke={3} />Зона повышения</div>}
              {i === 6 && <div className="flex items-center gap-2 bg-bear/10 px-4 py-1 text-[9px] font-black uppercase tracking-widest text-bear"><Icon name="down" size={10} stroke={3} />Зона понижения</div>}
              <div className={cn("flex items-center gap-3 px-4 py-2 transition-all duration-500", isMe && "bg-sky/15 ring-2 ring-inset ring-sky/50", isMe && flash && "bg-sky/30")}>
                <span className={cn("w-6 text-center font-display text-sm font-black", i === 0 ? "text-gold" : i === 1 ? "text-ink-200" : i === 2 ? "text-flame" : "text-ink-500")}>{i + 1}</span>
                <AvatarArt seed={r.seed} size={32} />
                <span className={cn("flex-1 text-[13px] font-bold", isMe && "text-sky")}>{r.n}</span>
                <span className="font-mono text-xs font-bold tabular-nums text-ink-200">{r.xp} XP</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-[11px] text-ink-400">Твоё место: <b className="text-sky">{me + 1}</b>{me < 3 && " — ты в зоне повышения!"}</div>
    </div>
  );
}

/* P03 — XP & level up */
export function LevelUp() {
  const [xp, setXp] = useState(320);
  const [lvl, setLvl] = useState(7);
  const [boom, setBoom] = useState(0);
  const [banner, setBanner] = useState(false);
  const need = 400;
  const v = useCountUp(xp, 500);
  const gain = (n: number) => {
    let nx = xp + n;
    if (nx >= need) { nx -= need; setLvl((l) => l + 1); setBoom(Date.now()); setBanner(true); sfx("levelup"); haptic([10, 40, 10, 40, 80]); setTimeout(() => setBanner(false), 1800); }
    else { sfx("coin"); haptic(8); }
    setXp(nx);
    particles.flyFrom(document.activeElement, "xp", "xp", Math.min(8, Math.ceil(n / 15)), () => wallet.add({ xp: n }));
  };
  return (
    <div className="relative">
      <Confetti fire={boom} />
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="flex size-20 items-center justify-center rounded-[22px] bg-gradient-to-b from-[#C9A8FF] to-violet font-display text-3xl font-black text-white shadow-[0_6px_0_var(--color-violet-d),0_0_30px_rgba(154,107,255,.4)]" key={lvl}>
            <span className="animate-pop drop-shadow-[0_3px_0_rgba(0,0,0,.3)]">{lvl}</span>
          </div>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-ink-900 px-1.5 text-[9px] font-black uppercase tracking-wider text-violet">LVL</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-[11px] font-bold"><span>Трейдер-ученик</span><span className="font-mono text-ink-300">{Math.round(v)}/{need}</span></div>
          <Bar value={(v / need) * 100} tone="violet" h={18} className="mt-1.5" />
          <div className="mt-1 text-[10px] text-ink-400">До уровня {lvl + 1}: {need - xp} XP</div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Btn s="sm" v="ink" onClick={() => gain(15)}>+15</Btn>
        <Btn s="sm" v="sky" onClick={() => gain(45)}>+45</Btn>
        <Btn s="sm" v="violet" onClick={() => gain(120)}>+120</Btn>
      </div>
      {banner && (
        <div className="absolute inset-x-0 top-6 z-20 mx-auto w-fit rounded-2xl bg-gradient-to-b from-gold to-gold-d px-6 py-3 text-center text-ink-900 shadow-[0_6px_0_#8a5c00,0_20px_40px_rgba(0,0,0,.5)] animate-pop">
          <div className="text-[10px] font-black uppercase tracking-widest">Новый уровень</div>
          <div className="font-display text-2xl font-black">LVL {lvl}</div>
        </div>
      )}
    </div>
  );
}

/* P04 — Career ladder */
const RANKS = [
  { t: "Планктон", xp: 0, c: "#7D93C6", icon: "user" as IconName },
  { t: "Креветка", xp: 1000, c: "#FF8A3D", icon: "star" as IconName },
  { t: "Краб", xp: 5000, c: "#FF4D6D", icon: "shield" as IconName },
  { t: "Дельфин", xp: 15000, c: "#3D9BFF", icon: "chart" as IconName },
  { t: "Акула", xp: 40000, c: "#9A6BFF", icon: "sword" as IconName },
  { t: "Кит", xp: 100000, c: "#FFC940", icon: "crown" as IconName },
];
export function Career() {
  const [cur, setCur] = useState(2);
  const [view, setView] = useState(2);
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
      <div className="relative space-y-2 pl-2">
        <div className="absolute bottom-5 left-[29px] top-5 w-1 rounded-full bg-ink-700" />
        {RANKS.map((r, i) => (
          <button key={r.t} onClick={() => { tap("tick"); setView(i); }} className={cn("relative flex w-full items-center gap-3 rounded-2xl p-1.5 pr-3 text-left transition-colors", view === i ? "bg-white/5" : "hover:bg-white/[.03]")}>
            <span className={cn("relative z-10 flex size-10 items-center justify-center rounded-xl transition-all", i <= cur ? "text-ink-900" : "bg-ink-800 text-ink-500 shadow-[0_3px_0_#0a1430]")}
              style={i <= cur ? { background: r.c, boxShadow: `0 3px 0 rgba(0,0,0,.35), 0 0 ${i === cur ? 18 : 0}px ${r.c}` } : undefined}>
              <Icon name={i <= cur ? r.icon : "lock"} size={18} stroke={2.6} />
            </span>
            <span className={cn("flex-1 font-display text-xs font-bold", i > cur && "text-ink-500")}>{r.t}</span>
            {i === cur && <Chip tone="bull">сейчас</Chip>}
            <span className="font-mono text-[10px] text-ink-400">{r.xp >= 1000 ? `${r.xp / 1000}K` : r.xp}</span>
          </button>
        ))}
      </div>
      <div className="panel-soft flex flex-col items-center justify-center p-4 text-center" key={view}>
        <div className="flex size-20 items-center justify-center rounded-3xl animate-pop" style={{ background: `linear-gradient(180deg, ${RANKS[view].c}, ${RANKS[view].c}99)`, boxShadow: `0 6px 0 rgba(0,0,0,.35), 0 0 40px ${RANKS[view].c}55` }}>
          <Icon name={RANKS[view].icon} size={36} stroke={2.4} className="text-ink-900" />
        </div>
        <div className="mt-3 font-display text-base font-black" style={{ color: RANKS[view].c }}>{RANKS[view].t}</div>
        <Label className="mt-1">от {RANKS[view].xp.toLocaleString("ru-RU")} XP</Label>
        <div className="text-[12px] text-ink-300">{["Только начинаешь путь", "Первые сделки позади", "Умеешь ходить боком", "Чувствуешь волну", "Охотишься на тренды", "Двигаешь рынок"][view]}</div>
        {view === cur + 1 && <Btn s="xs" v="gold" className="mt-3" icon="up" onClick={() => { sfx("levelup"); setCur(cur + 1); }}>Повысить (демо)</Btn>}
      </div>
    </div>
  );
}
