import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Bar } from "../components/ui";
import { Mascot, AvatarArt, GemArt } from "../components/art";
import { particles } from "../lib/particles";
import { wallet } from "../lib/wallet";
import { sfx, haptic, tap, useInterval } from "../lib/fx";
import { cn } from "../utils/cn";
import type { Go } from "./screens";

/* ═══════════════════════════════════════════════════════════════════
   PVP — асинхронная дуэль с другом: поиск, 5 вопросов, рывок, итоги.
   Живёт в прототипе как 11-й экран (точка входа — из Лиги и Друзей).
   ═══════════════════════════════════════════════════════════════════ */

const RIVALS = [
  { n: "Кира", seed: 1, xp: 2140, wr: 0.72 },
  { n: "Макс", seed: 2, xp: 1810, wr: 0.64 },
  { n: "Дима", seed: 3, xp: 1500, wr: 0.58 },
];
const QUESTIONS = [
  { q: "Зелёная свеча: close … open", a: ["выше", "ниже"], ok: 0 },
  { q: "Риск 2% от $800?", a: ["$16", "$160"], ok: 0 },
  { q: "Плечо 5x, цена −20% → ?", a: ["−20%", "Ликвидация"], ok: 1 },
  { q: "ATH — это…", a: ["исторический максимум", "средняя цена"], ok: 0 },
  { q: "Что делает DCA?", a: ["усредняет вход", "удваивает плечо"], ok: 0 },
];
const STAKE = 50;

type Phase = "pick" | "search" | "countdown" | "play" | "result";

export function Duel({ go }: { go: Go }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [rival, setRival] = useState(RIVALS[0]);
  const [qi, setQi] = useState(0);
  const [me, setMe] = useState(0);
  const [foe, setFoe] = useState(0);
  const [meT, setMeT] = useState<boolean[]>([]);
  const [foeT, setFoeT] = useState<boolean[]>([]);
  const [timer, setTimer] = useState(100);
  const [cd, setCd] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);

  /* поиск соперника */
  useEffect(() => {
    if (phase !== "search") return;
    const id = setTimeout(() => { setPhase("countdown"); sfx("coin"); }, 1600);
    return () => clearTimeout(id);
  }, [phase]);

  /* обратный отсчёт */
  useInterval(() => setCd((c) => {
    if (c <= 1) { setPhase("play"); sfx("whoosh"); return 3; }
    sfx("tick");
    return c - 1;
  }), phase === "countdown" ? 750 : null);

  /* таймер вопроса */
  useInterval(() => setTimer((t) => {
    if (t <= 2) { answer(-1); return 100; }
    return t - 2;
  }), phase === "play" ? 100 : null);

  const answer = (j: number) => {
    if (phase !== "play" || picked !== null) return;
    setPicked(j);
    const ok = j === QUESTIONS[qi % QUESTIONS.length].ok;
    const foeOk = Math.random() < rival.wr;
    setTimeout(() => {
      if (ok) { setMe((m) => m + 1); sfx("success"); haptic(12); } else { sfx("error"); haptic(30); }
      if (foeOk) setFoe((f) => f + 1);
      setMeT((t) => [...t, ok]);
      setFoeT((t) => [...t, foeOk]);
      setPicked(null);
      setTimer(100);
      if (qi + 1 >= QUESTIONS.length) {
        setPhase("result");
        const win = me + (ok ? 1 : 0) > foe + (foeOk ? 1 : 0);
        if (win) {
          sfx("levelup"); haptic([10, 30, 10, 30, 80]);
          particles.burst(window.innerWidth / 2, window.innerHeight * 0.35, { count: 60, speed: 640 });
          setTimeout(() => particles.flyFrom(box.current, "p-gems", "gem", 8, () => wallet.add({ gems: STAKE * 2 })), 600);
        } else sfx("error");
      } else setQi(qi + 1);
    }, 650);
  };

  const start = (r: (typeof RIVALS)[number]) => {
    if (!wallet.spend("gems", STAKE)) { sfx("error"); return; }
    setRival(r);
    setMe(0); setFoe(0); setMeT([]); setFoeT([]); setQi(0); setTimer(100);
    setPhase("search");
    sfx("whoosh");
  };

  const again = () => { setPhase("pick"); tap(); };

  /* ── PICK ── */
  if (phase === "pick") {
    return (
      <div className="flex h-full flex-col px-4 pb-6 pt-1">
        <div className="flex items-center gap-2"><button aria-label="назад" onClick={() => go("league", "back")} className="text-ink-400"><Icon name="chevL" size={22} stroke={2.6} /></button><div className="flex-1 font-display text-sm font-black">Дуэль · ставка <span className="inline-flex items-center gap-1 text-sky"><GemArt size={15} />{STAKE}</span></div></div>
        <div className="mt-3 text-center text-[12px] text-ink-400">5 вопросов · победитель забирает банк <b className="text-gold">{STAKE * 2} ◆</b></div>
        <div className="mt-3 space-y-2.5">
          {RIVALS.map((r) => (
            <button key={r.n} onClick={() => start(r)} className="panel-soft flex w-full items-center gap-3 p-3 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0">
              <AvatarArt seed={r.seed} size={44} />
              <span className="flex-1"><span className="block text-sm font-bold">{r.n}</span><span className="block font-mono text-[11px] text-ink-400">{r.xp} XP · точность {Math.round(r.wr * 100)}%</span></span>
              <span className="btn3d h-9 px-3 text-[10px]">Вызвать</span>
            </button>
          ))}
        </div>
        <button onClick={() => start(RIVALS[Math.floor(Math.random() * 3)])} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-600 py-3.5 text-[13px] font-bold text-ink-300 hover:border-sky hover:text-sky">
          <Icon name="refresh" size={16} />Случайный соперник
        </button>
      </div>
    );
  }

  /* ── SEARCH ── */
  if (phase === "search") {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          {[0, 1, 2].map((i) => <span key={i} className="absolute inset-0 rounded-full border-2 border-sky animate-ring" style={{ animationDelay: `${i * 0.6}s` }} />)}
          <AvatarArt seed={rival.seed} size={96} />
        </div>
        <div className="mt-5 font-display text-base font-black">Ищем {rival.n}…</div>
        <div className="mt-1 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-sky" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
        <button onClick={() => setPhase("pick")} className="mt-6 text-[12px] font-bold text-ink-400">Отмена</button>
      </div>
    );
  }

  /* ── COUNTDOWN ── */
  if (phase === "countdown") {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex items-center gap-6">
          <span className="flex flex-col items-center gap-1"><AvatarArt seed={0} size={56} /><b className="text-[12px]">Вы</b></span>
          <span className="font-display text-xl font-black text-ink-500">VS</span>
          <span className="flex flex-col items-center gap-1"><AvatarArt seed={rival.seed} size={56} /><b className="text-[12px]">{rival.n}</b></span>
        </div>
        <div key={cd} className="mt-6 font-display text-7xl font-black text-gold animate-zoom-in drop-shadow-[0_6px_0_rgba(0,0,0,.4)]">{cd}</div>
      </div>
    );
  }

  /* ── RESULT ── */
  if (phase === "result") {
    const win = me > foe;
    const draw = me === foe;
    return (
      <div ref={box} className="flex h-full flex-col items-center px-5 pb-6 pt-4 text-center">
        <Mascot size={96} mood={win ? "hype" : draw ? "think" : "sad"} className="animate-bob" />
        <div className={cn("font-display text-2xl font-black", win ? "text-gold" : draw ? "text-sky" : "text-bear")}>
          {win ? "Победа!" : draw ? "Ничья" : "Поражение"}
        </div>
        <div className="mt-1 font-display text-4xl font-black tabular-nums">{me} : {foe}</div>
        <div className="mt-3 grid w-full grid-cols-2 gap-2">
          <div className="rounded-2xl bg-sky/10 p-2.5 ring-1 ring-sky/30">
            <div className="text-[10px] font-black uppercase text-sky">Твои ответы</div>
            <div className="mt-1 flex justify-center gap-1">{meT.map((t, i) => <span key={i} className={cn("size-2.5 rounded-full", t ? "bg-bull" : "bg-bear")} />)}</div>
          </div>
          <div className="rounded-2xl bg-bear/10 p-2.5 ring-1 ring-bear/30">
            <div className="text-[10px] font-black uppercase text-bear">{rival.n}</div>
            <div className="mt-1 flex justify-center gap-1">{foeT.map((t, i) => <span key={i} className={cn("size-2.5 rounded-full", t ? "bg-bull" : "bg-bear")} />)}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-sm font-bold">
          {win ? <><GemArt size={22} /><span className="text-sky">+{STAKE * 2} кристаллов</span></> : draw ? <span className="text-ink-300">Ставка возвращена</span> : <span className="text-ink-400">−{STAKE} кристаллов</span>}
        </div>
        <div className="mt-auto grid w-full grid-cols-2 gap-3">
          <Btn s="md" v="ink" onClick={() => go("league", "back")}>В лигу</Btn>
          <Btn s="md" v="gold" icon="refresh" onClick={again}>Реванш</Btn>
        </div>
      </div>
    );
  }

  /* ── PLAY ── */
  const cur = QUESTIONS[qi % QUESTIONS.length];
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-violet/15 to-ink-900 px-4 pb-6">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-1">
        <div className="flex items-center gap-2"><AvatarArt seed={0} size={30} /><span className="font-display text-xl font-black text-sky tabular-nums">{me}</span></div>
        <div className="font-mono text-[11px] text-ink-400">{qi + 1}/{QUESTIONS.length}</div>
        <div className="flex items-center justify-end gap-2"><span className="font-display text-xl font-black text-bear tabular-nums">{foe}</span><AvatarArt seed={rival.seed} size={30} /></div>
      </div>
      <Bar value={timer} tone={timer < 30 ? "bear" : "gold"} h={8} className="mt-2" />
      <div className="mt-2 flex justify-between">
        <div className="flex gap-1">{meT.map((t, i) => <span key={i} className={cn("size-2 rounded-full", t ? "bg-bull" : "bg-bear")} />)}</div>
        <div className="flex gap-1">{foeT.map((t, i) => <span key={i} className={cn("size-2 rounded-full", t ? "bg-bull" : "bg-bear")} />)}</div>
      </div>
      <div className="flex flex-1 flex-col justify-center">
        <div key={qi} className="panel p-5 text-center font-display text-[15px] font-bold leading-snug animate-zoom-in">{cur.q}</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {cur.a.map((a, j) => {
            const st = picked === null ? undefined : j === cur.ok ? "correct" : j === picked ? "wrong" : "disabled";
            return <button key={a} disabled={picked !== null} onClick={() => answer(j)} data-state={st} className={cn("tile3d py-4 text-sm font-bold", st === "wrong" && "animate-shake")}>{a}</button>;
          })}
        </div>
      </div>
      <div className="text-center text-[11px] text-ink-500">Отвечай быстрее таймера — соперник не ждёт</div>
    </div>
  );
}
