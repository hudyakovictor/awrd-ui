import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Bar, Chip, Confetti, useFloaters } from "../components/ui";
import { Mascot, FomoGhost, PaperHands, WhaleBoss, type Mood } from "../components/art";
import { tap, sfx, haptic, useInterval } from "../lib/fx";
import { cn } from "../utils/cn";

/* K01 — Mascot emotions */
const MOODS: { m: Mood; t: string; say: string }[] = [
  { m: "idle", t: "Спокоен", say: "Рынок открыт. Учимся?" },
  { m: "happy", t: "Рад", say: "Отличная сделка, партнёр!" },
  { m: "think", t: "Думает", say: "Хм… а где стоп-лосс?" },
  { m: "sad", t: "Грустит", say: "Жизни кончились. Вернись завтра." },
  { m: "hype", t: "Хайп", say: "LEVEL UP! Ты в топ-3 лиги!" },
];
export function MascotMoods() {
  const [i, setI] = useState(0);
  const [pet, setPet] = useState(0);
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="relative mx-auto">
        <div className="absolute inset-x-4 bottom-2 h-10 rounded-full bg-sky/30 blur-xl" />
        <button onClick={() => { setPet(Date.now()); setI(4); sfx("levelup"); haptic([10, 20, 10]); }} className={cn("relative", pet ? "animate-wiggle" : "animate-float")} key={pet} aria-label="pet mascot">
          <Mascot size={170} mood={MOODS[i].m} />
        </button>
        <div key={i} className="absolute -top-2 left-full hidden w-40 -translate-x-8 rounded-2xl border-2 border-ink-600 bg-ink-800 p-2.5 text-[12px] font-bold animate-pop sm:block">
          {MOODS[i].say}
          <span className="absolute -bottom-2 left-6 size-3 rotate-45 border-b-2 border-r-2 border-ink-600 bg-ink-800" />
        </div>
      </div>
      <div>
        <div className="mb-3 font-display text-sm font-black">Бык Макс <span className="text-ink-400 font-sans text-xs font-semibold">— ментор игры</span></div>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map((m, j) => (
            <button key={m.m} onClick={() => { tap("tick"); setI(j); }} data-state={i === j ? "selected" : undefined} className="tile3d flex flex-col items-center p-1.5">
              <Mascot size={44} mood={m.m} />
              <span className="text-[9px] font-extrabold uppercase">{m.t}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 text-[12px] text-ink-300 sm:hidden">«{MOODS[i].say}»</div>
        <div className="mt-3 text-[11px] text-ink-400">Моргает сам · тапни Макса, чтобы погладить</div>
      </div>
    </div>
  );
}

/* K02 — Bestiary of biases */
const FOES = [
  { n: "Фомо-Дух", d: "Шепчет «все уже купили»", hp: 60, Art: FomoGhost, c: "violet" as const, weak: "План сделки" },
  { n: "Бумажные Руки", d: "Продаёт на первой просадке", hp: 45, Art: PaperHands, c: "sky" as const, weak: "Стоп-лосс" },
  { n: "Кит Ликвидации", d: "Босс. Охотится за плечами", hp: 120, Art: WhaleBoss, c: "gold" as const, weak: "Риск 1%" },
];
function Foe({ f }: { f: (typeof FOES)[number] }) {
  const [hp, setHp] = useState(f.hp);
  const [hit, setHit] = useState(0);
  const [boom, setBoom] = useState(0);
  const { add, layer } = useFloaters();
  const strike = () => {
    if (hp <= 0) { setHp(f.hp); tap(); return; }
    const crit = Math.random() < 0.2;
    const dmg = crit ? 25 : 8 + Math.round(Math.random() * 8);
    const n = Math.max(0, hp - dmg);
    setHp(n); setHit(Date.now());
    add(crit ? `КРИТ −${dmg}` : `−${dmg}`, 30 + Math.random() * 30, 20, crit ? "text-gold" : "text-bear");
    sfx(n === 0 ? "levelup" : "hit"); haptic(crit ? [30, 20, 30] : 20);
    if (n === 0) setBoom(Date.now());
  };
  const dead = hp <= 0;
  return (
    <div className="panel-soft relative flex flex-col items-center p-3 text-center">
      {layer}<Confetti fire={boom} count={20} />
      <Chip tone={f.c} className="self-start">{f.hp >= 100 ? "Босс" : "Враг"}</Chip>
      <button onClick={strike} className={cn("relative my-1 transition-all duration-500", dead ? "scale-75 opacity-30 grayscale" : "animate-bob")} aria-label={`attack ${f.n}`}>
        <div key={hit} className={hit ? "animate-shake" : ""} style={{ filter: hit && Date.now() - hit < 200 ? "brightness(2)" : undefined }}>
          <f.Art size={f.hp >= 100 ? 120 : 100} />
        </div>
      </button>
      <div className="font-display text-xs font-black">{f.n}</div>
      <div className="text-[11px] text-ink-400">{f.d}</div>
      <div className="mt-2 flex w-full items-center gap-2">
        <Icon name="heart" size={14} className="text-bear" />
        <Bar value={(hp / f.hp) * 100} tone={hp / f.hp < 0.3 ? "bear" : "bull"} h={10} className="flex-1" />
        <span className="w-12 text-right font-mono text-[10px]">{hp}/{f.hp}</span>
      </div>
      <div className="mt-2 text-[10px] font-bold text-ink-300">Слабость: <span className="text-gold">{f.weak}</span></div>
      <div className="mt-1 text-[10px] text-ink-500">{dead ? "Побеждён · тап — воскресить" : "Тапни, чтобы атаковать"}</div>
    </div>
  );
}
export function Bestiary() {
  return <div className="grid gap-3 sm:grid-cols-3">{FOES.map((f) => <Foe key={f.n} f={f} />)}</div>;
}

/* K03 — Boss duel */
const DUEL_Q = [
  { q: "Депозит $1000. Макс. риск на сделку по правилу 1%?", a: ["$10", "$100", "$1"], ok: 0 },
  { q: "Цена упала на 5% с плечом 20x. Что с позицией?", a: ["−5%", "Ликвидация", "+5%"], ok: 1 },
  { q: "Что снижает влияние FOMO?", a: ["Заранее готовый план", "Купить на хаях", "Чат в Telegram"], ok: 0 },
];
export function Duel() {
  const [me, setMe] = useState(100);
  const [boss, setBoss] = useState(100);
  const [q, setQ] = useState(0);
  const [t, setT] = useState(100);
  const [anim, setAnim] = useState<"me" | "boss" | null>(null);
  const [boom, setBoom] = useState(0);
  const over = me <= 0 || boss <= 0;
  useInterval(() => setT((v) => v - 1.25), over ? null : 100);
  useEffect(() => { if (t <= 0 && !over) answer(-1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [t]);
  function answer(j: number) {
    const cur = DUEL_Q[q % DUEL_Q.length];
    if (j === cur.ok) { setBoss((b) => { const n = Math.max(0, b - 34); if (n === 0) { setBoom(Date.now()); sfx("levelup"); } return n; }); setAnim("boss"); sfx("hit"); haptic(25); }
    else { setMe((m) => Math.max(0, m - 30)); setAnim("me"); sfx("error"); haptic([40, 30, 40]); }
    setTimeout(() => setAnim(null), 450);
    setQ((x) => x + 1); setT(100);
  }
  const reset = () => { setMe(100); setBoss(100); setQ(0); setT(100); tap(); };
  const cur = DUEL_Q[q % DUEL_Q.length];
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-bear/15 via-ink-850 to-ink-900 p-4 ring-1 ring-bear/20">
      <Confetti fire={boom} count={40} />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <div className="mb-1 flex justify-between text-[10px] font-black uppercase"><span className="text-sky">Ты</span><span className="font-mono">{me}</span></div>
          <Bar value={me} tone="sky" h={12} />
        </div>
        <div className="font-display text-lg font-black text-ink-500">VS</div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] font-black uppercase"><span className="text-bear">Кит</span><span className="font-mono">{boss}</span></div>
          <Bar value={boss} tone="bear" h={12} />
        </div>
      </div>
      <div className="relative mt-3 flex items-end justify-between px-2">
        <div className={cn("transition-transform duration-300", anim === "boss" && "translate-x-10", anim === "me" && "animate-shake")}><Mascot size={96} mood={over ? (me > 0 ? "hype" : "sad") : anim === "me" ? "sad" : "idle"} /></div>
        <div className={cn("transition-all duration-500", anim === "boss" && "animate-shake", boss <= 0 && "opacity-20 grayscale scale-75", anim === "me" && "-translate-x-10")}><WhaleBoss size={130} /></div>
      </div>
      {over ? (
        <div className="mt-2 text-center animate-pop">
          <div className={cn("font-display text-lg font-black", boss <= 0 ? "text-gold" : "text-bear")}>{boss <= 0 ? "Босс повержен! +100 XP" : "Ликвидирован…"}</div>
          <Btn s="sm" v={boss <= 0 ? "gold" : "sky"} className="mt-3" icon="refresh" onClick={reset}>Реванш</Btn>
        </div>
      ) : (
        <>
          <div className="mt-2 flex items-center gap-2"><Icon name="clock" size={14} className={t < 30 ? "text-bear" : "text-ink-400"} /><Bar value={t} tone={t < 30 ? "bear" : "gold"} h={6} className="flex-1" /></div>
          <div className="mt-3 text-center text-[13px] font-bold">{cur.q}</div>
          <div className="mt-3 grid grid-cols-3 gap-2" key={q}>
            {cur.a.map((a, j) => <button key={a} onClick={() => answer(j)} className="tile3d animate-slide-up px-2 py-2.5 text-[12px] font-bold" style={{ animationDelay: `${j * 60}ms` }}>{a}</button>)}
          </div>
        </>
      )}
    </div>
  );
}
