import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Icon, Section } from "../ui/kit";
import { useRaf } from "../ui/hooks";
import { feel, note, sfx } from "../game/sfx";
import { useGame } from "../game/ctx";
import { cn } from "../utils/cn";

/* ═════════ MIN-01 · Reflex trainer ═════════ */
function Reflex() {
  const game = useGame();
  const [state, setState] = useState<"idle" | "wait" | "go" | "hit" | "early" | "done">("idle");
  const [ms, setMs] = useState(0);
  const [rounds, setRounds] = useState<number[]>([]);
  const goAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const start = () => {
    setRounds([]);
    setState("wait");
    timer.current = window.setTimeout(() => { goAt.current = performance.now(); setState("go"); sfx.play("pop"); }, 1200 + Math.random() * 2800);
  };
  const tap = () => {
    if (state === "wait") {
      clearTimeout(timer.current);
      setState("early");
      feel("error", [40, 20, 40]);
      window.setTimeout(start, 900);
    } else if (state === "go") {
      const d = Math.round(performance.now() - goAt.current);
      setMs(d);
      const rr = [...rounds, d].slice(-5);
      setRounds(rr);
      setState("hit");
      feel("success", 12);
      sfx.play(d < 250 ? "levelup" : "combo");
      if (rr.length >= 5) {
        const avg = Math.round(rr.reduce((a, b) => a + b, 0) / rr.length);
        game.complete({ skill: "psychology", xp: Math.max(5, Math.round(40 - avg / 25)), ok: true });
        window.setTimeout(() => setState("done"), 700);
      } else window.setTimeout(start, 700);
    } else if (state === "done") start();
  };
  const avg = rounds.length ? Math.round(rounds.reduce((a, b) => a + b, 0) / rounds.length) : 0;
  return (
    <AssetCard id="MIN-01" title="Reflex Trainer" desc="Подожди зелёный и жми как можно быстрее; ранний тап — пенальти. 5 раундов, средний результат даёт XP за навык «Психология»." tags={["minigame", "reflex", "timing", "reaction"]}>
      <button onClick={tap}
        className={cn("relative grid h-48 w-full select-none overflow-hidden rounded-2xl text-center transition-colors duration-150",
          state === "idle" && "bg-ink-800 hover:bg-ink-700",
          state === "wait" && "bg-bear/80",
          state === "go" && "bg-bull",
          (state === "hit") && "bg-ink-700",
          state === "early" && "bg-bear",
          state === "done" && "bg-ink-800")}>
        {state === "idle" && <div><div className="text-lg font-extrabold text-white">Reflex 5 rounds</div><div className="text-xs text-ink-300">tap to start</div></div>}
        {state === "wait" && <div className="text-2xl font-extrabold text-white" style={{ animation: "pulseSoft 1s ease-in-out infinite" }}>Wait for green…</div>}
        {state === "go" && <div className="text-4xl font-extrabold text-ink-900" style={{ animation: "popIn .15s ease both" }}>TAP!</div>}
        {state === "hit" && <div className="font-mono text-5xl font-extrabold text-gold" style={{ animation: "popIn .2s ease both" }}>{ms}<span className="text-xl">ms</span></div>}
        {state === "early" && <div className="text-2xl font-extrabold text-white anim-shake">Too early!</div>}
        {state === "done" && <div className="anim-pop"><div className="font-mono text-4xl font-extrabold text-bull">{avg}ms avg</div><div className="mt-1 text-xs font-bold text-ink-300">{avg < 260 ? "Молния! Так держать руку." : "Хороший темп. Ещё партия?"}</div><div className="mt-2 text-[11px] font-extrabold uppercase text-sky">tap to replay</div></div>}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => <span key={i} className={cn("h-1.5 w-6 rounded-full", i < rounds.length ? "bg-gold" : "bg-white/15")} />)}
        </div>
      </button>
    </AssetCard>
  );
}

/* ═════════ MIN-02 · Simon sequence ═════════ */

const PADS = [
  { i: 0, c: "#2ee59d", f: 329.63 }, { i: 1, c: "#3d8bff", f: 392 }, { i: 2, c: "#ffc53d", f: 440 }, { i: 3, c: "#ff4d6a", f: 523.25 },
];
function Simon() {
  const game = useGame();
  const [seq, setSeq] = useState<number[]>([]);
  const [lit, setLit] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "over">("idle");
  const [step, setStep] = useState(0);
  const [best, setBest] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const show = (s: number[]) => {
    setPhase("show");
    s.forEach((p, i) => {
      timers.current.push(window.setTimeout(() => { setLit(p); note(PADS[p].f, 0.35, "triangle", 0.14); }, 500 + i * 550));
      timers.current.push(window.setTimeout(() => setLit(-1), 500 + i * 550 + 380));
    });
    timers.current.push(window.setTimeout(() => { setPhase("input"); setStep(0); }, 500 + s.length * 550));
  };
  const start = () => { const s = [Math.floor(Math.random() * 4)]; setSeq(s); show(s); feel("whoosh"); };
  const press = (p: number) => {
    if (phase !== "input") return;
    setLit(p); note(PADS[p].f, 0.3, "triangle", 0.14);
    window.setTimeout(() => setLit(-1), 200);
    if (p !== seq[step]) {
      setPhase("over");
      feel("error", [40, 30, 60]);
      sfx.play("lock");
      if (seq.length - 1 > best) { setBest(seq.length - 1); game.complete({ skill: "psychology", xp: (seq.length - 1) * 3, ok: seq.length > 1 }); }
      return;
    }
    if (step + 1 === seq.length) {
      const ns = [...seq, Math.floor(Math.random() * 4)];
      setSeq(ns);
      window.setTimeout(() => show(ns), 600);
    }
    setStep(step + 1);
  };
  return (
    <AssetCard id="MIN-02" title="Simon Sequence" desc="Повтори нарастающую последовательность цветов и звуков. Каждый раунд быстрее. Ошибка — конец серии, очки в навык." tags={["minigame", "simon", "memory", "audio"]}>
      <div className="relative mx-auto grid h-48 w-48 grid-cols-2 gap-2">
        {PADS.map((p) => (
          <button key={p.i} onClick={() => press(p.i)} disabled={phase !== "input"}
            className={cn("rounded-2xl transition-all duration-100", lit === p.i ? "scale-95" : "hover:brightness-110", phase !== "input" && "cursor-default")}
            style={{ background: p.c, opacity: lit === p.i ? 1 : 0.45, boxShadow: lit === p.i ? `0 0 30px ${p.c}, inset 0 2px 0 #fff8` : `0 4px 0 rgba(0,0,0,.4)` }}>
          </button>
        ))}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink-950 shadow-[0_4px_0_#050b1f]">
          {phase === "idle" && <Btn v="bull" size="sm" onClick={start}>Start</Btn>}
          {phase === "show" && <span className="font-mono text-xs font-extrabold text-sky">watch…</span>}
          {phase === "input" && <span className="font-mono text-2xl font-extrabold text-white">{seq.length}</span>}
          {phase === "over" && <span className="text-center font-mono text-[10px] font-extrabold leading-tight text-bear">OVER<br />best {best}</span>}
        </div>
      </div>
      <div className="mt-2 text-center text-[11px] font-bold text-ink-400">{phase === "input" ? `раунд ${seq.length} — повтори` : phase === "over" ? <button onClick={start} className="font-extrabold uppercase text-sky">play again</button> : "best streak: " + best}</div>
    </AssetCard>
  );
}

/* ═════════ MIN-03 · Catch the coins ═════════ */
type Coin = { id: number; x: number; y: number; vy: number; spin: number; vs: number };
function CatchCoins() {
  const game = useGame();
  const [state, setState] = useState<"ready" | "run" | "done">("ready");
  const [time, setTime] = useState(30);
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [bx, setBx] = useState(50);
  const coins = useRef<Coin[]>([]);
  const nextId = useRef(1);
  const keys = useRef({ l: false, r: false });
  const timeRef = useRef(30);
  const bxRef = useRef(50);
  const [, force] = useState(0);
  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") keys.current.l = true; if (e.key === "ArrowRight") keys.current.r = true; };
    const ku = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") keys.current.l = false; if (e.key === "ArrowRight") keys.current.r = false; };
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, []);
  useRaf((dt) => {
    if (state !== "run") return;
    const k = dt / 16.67;
    if (keys.current.l) bxRef.current = Math.max(12, bxRef.current - 1.4 * k);
    if (keys.current.r) bxRef.current = Math.min(88, bxRef.current + 1.4 * k);
    setBx((o) => (o === bxRef.current ? o : bxRef.current));
    if (Math.random() < 0.035 * k) coins.current.push({ id: nextId.current++, x: 8 + Math.random() * 84, y: -6, vy: 1.6 + Math.random() * 1.4 + (30 - timeRef.current) * 0.04, spin: 0, vs: 6 + Math.random() * 8 });
    let changed = false;
    for (const c of coins.current) {
      c.y += c.vy * k; c.spin += c.vs * k;
      if (c.y > 82) {
        if (Math.abs(c.x - bxRef.current) < 11) {
          setScore((s) => s + 10);
          sfx.play("coin");
          hapticLite();
        } else setMiss((m) => m + 1);
        c.y = 999;
        changed = true;
      }
    }
    if (changed) coins.current = coins.current.filter((c) => c.y < 500);
    force((n) => (n + 1) % 100000);
  }, state === "run");
  const hapticLite = () => { try { navigator.vibrate?.(8); } catch { /* noop */ } };
  const start = () => {
    coins.current = []; nextId.current = 1; timeRef.current = 30;
    setTime(30); setScore(0); setMiss(0); bxRef.current = 50; setBx(50);
    setState("run");
    feel("whoosh");
    const id = window.setInterval(() => {
      timeRef.current -= 1; setTime(timeRef.current);
      if (timeRef.current <= 0) {
        clearInterval(id);
        setState("done");
        sfx.play("levelup");
        game.reward({ gems: Math.round(score / 5), x: undefined, y: undefined });
        game.complete({ skill: "defi", xp: Math.max(5, Math.round(score / 10)), ok: true });
      }
    }, 1000);
    window.setTimeout(() => clearInterval(id), 31000);
  };
  const move = (e: React.PointerEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    bxRef.current = clampN(((e.clientX - r.left) / r.width) * 100, 12, 88);
    setBx(bxRef.current);
  };
  return (
    <AssetCard id="MIN-03" title="Catch the Coins · 30s" desc="Лови падающие монеты корзиной: палец/мышь/стрелки. Скорость падения растёт, промахи считаются, итог — гемы." tags={["minigame", "catch", "arcade", "score"]}>
      <div onPointerMove={move} onPointerDown={move} className="relative h-56 touch-none overflow-hidden rounded-2xl bg-ink-950/70 grid-dots">
        {state === "ready" && <div className="grid h-full place-items-center"><div className="text-center"><div className="mb-3 text-lg font-extrabold text-white">30 секунд на ловлю</div><Btn v="gold" size="lg" onClick={start}><Icon name="coin" size={18} />Start</Btn></div></div>}
        {state === "run" && <>
          <div className="absolute left-3 top-3 flex items-center gap-2"><span className="rounded-xl bg-ink-900/80 px-2.5 py-1 font-mono text-sm font-extrabold text-white">{time}</span><span className="rounded-xl bg-ink-900/80 px-2.5 py-1 font-mono text-sm font-extrabold text-gold">{score}</span></div>
          {coins.current.map((c) => (
            <span key={c.id} className="absolute grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full" style={{ left: `${c.x}%`, top: `${c.y}%`, background: "radial-gradient(circle at 35% 30%, #ffe9a8, #e09a10)", boxShadow: "0 0 12px #ffc53d88", transform: `translateX(-50%) scaleX(${Math.cos((c.spin * Math.PI) / 180)})` }}>
              <span className="font-mono text-[10px] font-extrabold text-[#7a4a00]">$</span>
            </span>
          ))}
          <div className="absolute bottom-3 h-9 w-24 -translate-x-1/2" style={{ left: `${bx}%` }}>
            <div className="h-full rounded-2xl bg-gradient-to-b from-sky to-sky-edge shadow-[0_4px_0_#123a8f]" style={{ transform: `rotate(${(bx - 50) * 0.15}deg)` }} />
            <div className="absolute inset-x-3 top-0 h-2 rounded-full bg-white/30" />
          </div>
        </>}
        {state === "done" && (
          <div className="grid h-full place-items-center">
            <div className="anim-pop text-center">
              <div className="font-mono text-4xl font-extrabold text-gold">{score}</div>
              <div className="mb-3 text-xs font-bold text-ink-300">coins · missed {miss} · +{Math.round(score / 5)} 💎</div>
              <Btn v="bull" size="sm" onClick={start}>Again</Btn>
            </div>
          </div>
        )}
      </div>
    </AssetCard>
  );
}
function clampN(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

export default function MiniGames() {
  return (
    <Section id="minigames" num="25" title="Quick Minigames" subtitle="Рефлекс-тренажёр, «Саймон» на звуки, аркада-ловля монет — быстрые сессии между уроками">
      <Reflex />
      <Simon />
      <CatchCoins />
    </Section>
  );
}
