import { useRef, useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { Magnetic } from "../components/Reveal";
import { CoinArt, GemArt } from "../components/art";
import { particles } from "../lib/particles";
import { tap, sfx, haptic } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   B — МИКРОФИЗИКА: магнит, ripple, взрывы, morph, светящиеся рамки.
   ═══════════════════════════════════════════════════════════════════ */

/* ── B01 · Магнитные кнопки + ripple ── */
function RippleBtn({ children, onClick, className, v = "" }: { children: React.ReactNode; onClick?: () => void; className?: string; v?: string }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  return (
    <button
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const id = Date.now() + Math.random();
        setRipples((s) => [...s, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
        setTimeout(() => setRipples((s) => s.filter((x) => x.id !== id)), 700);
        tap();
        onClick?.();
      }}
      className={cn("btn3d h-12 px-6 text-xs", v, className)}
    >
      {children}
      {ripples.map((r) => (
        <span key={r.id} className="pointer-events-none absolute rounded-full bg-white/50" style={{ left: r.x, top: r.y, width: 12, height: 12, transform: "translate(-50%,-50%)", animation: "ripple .65s ease-out forwards" }} />
      ))}
      <style>{`@keyframes ripple { to { width: 220px; height: 220px; opacity: 0; } }`}</style>
    </button>
  );
}

export function MagnetButtons() {
  const [pull, setPull] = useState(0.35);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-6 py-6">
        <Magnetic strength={pull}><RippleBtn>Магнит + ripple</RippleBtn></Magnetic>
        <Magnetic strength={pull}><RippleBtn v="v-sky">Наведи и кликни</RippleBtn></Magnetic>
        <Magnetic strength={pull}><RippleBtn v="v-gold">Тянется к курсору</RippleBtn></Magnetic>
      </div>
      <div className="flex items-center gap-3">
        <Label className="mb-0 w-28">Сила {pull.toFixed(2)}</Label>
        <input type="range" min={0} max={0.8} step={0.05} value={pull} onChange={(e) => setPull(+e.target.value)} className="rng flex-1" aria-label="сила магнита" />
        <span className="text-[11px] text-ink-500">0 = выкл</span>
      </div>
    </div>
  );
}

/* ── B02 · Кнопка-взрыв: клик = частицы + счётчик ── */
export function BurstButton() {
  const [n, setN] = useState(0);
  const [combo, setCombo] = useState(0);
  const timer = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);
  const kinds = ["coin", "gem", "star", "spark", "confetti"] as const;
  const hit = (e: React.MouseEvent) => {
    const c = n + 1;
    setN(c);
    setCombo((v) => v + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCombo(0), 1400);
    sfx(c % 10 === 0 ? "levelup" : "coin");
    haptic(c % 10 === 0 ? [10, 30, 10, 30, 60] : 10);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    particles.burst(e.clientX, e.clientY, { kind: kinds[c % kinds.length], count: c % 10 === 0 ? 60 : 16, speed: c % 10 === 0 ? 700 : 420 });
    if (c % 10 === 0) particles.burst(r.left + r.width / 2, r.top, { kind: "confetti", count: 40, speed: 600 });
  };
  return (
    <div className="flex flex-col items-center py-4">
      <div className="flex items-end gap-3">
        <CoinArt size={40} className={combo >= 3 ? "animate-coin" : ""} />
        <span key={n} className="font-display text-5xl font-black tabular-nums text-gold animate-pop">{n}</span>
        {combo >= 3 && <Chip tone="flame" className="animate-pop">комбо x{combo}</Chip>}
      </div>
      <button ref={btn} onClick={hit}
        className="btn3d v-gold mt-5 h-20 w-20 !rounded-full text-lg active:scale-90"
        style={{ ["--h" as string]: "6px" }} aria-label="Кликай">
        <span className="pointer-events-none">ТАП</span>
      </button>
      <div className="mt-3 text-[11px] text-ink-500">Каждый 10-й клик — джекпот · серия сгорает за 1.4с</div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={cn("h-2 w-6 rounded-full transition-colors", i < n % 10 || (n % 10 === 0 && n > 0) ? "bg-gold" : "bg-ink-700")} />
        ))}
      </div>
    </div>
  );
}

/* ── B03 · Morph: кнопка превращается в лоадер и успех ── */
type Morph = "idle" | "loading" | "success";
export function MorphButton() {
  const [s, setS] = useState<Morph>("idle");
  const [prog, setProg] = useState(0);
  const run = () => {
    if (s !== "idle") return;
    setS("loading");
    setProg(0);
    sfx("whoosh");
    const t0 = performance.now();
    const dur = 1800;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setProg(k);
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        setS("success");
        sfx("levelup");
        haptic([10, 40, 10]);
        setTimeout(() => setS("idle"), 2200);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  };
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-5">
      <button
        onClick={run}
        disabled={s !== "idle"}
        aria-live="polite"
        className={cn(
          "relative flex h-14 items-center justify-center overflow-hidden font-display text-xs font-black uppercase tracking-wider transition-all duration-500 [transition-timing-function:cubic-bezier(.34,1.3,.64,1)]",
          s === "idle" && "btn3d w-64",
          s === "loading" && "w-64 rounded-2xl bg-ink-750 shadow-[0_5px_0_#0a1430, inset_0_2px_6px_rgba(0,0,0,.5)]",
          s === "success" && "w-64 rounded-2xl bg-bull text-ink-900 shadow-[0_5px_0_var(--color-bull-d)]"
        )}
      >
        {s === "idle" && "Открыть сделку"}
        {s === "loading" && (
          <>
            <span className="absolute inset-y-0 left-0 bg-sky/40 transition-[width]" style={{ width: `${prog * 100}%` }} />
            <span className="absolute inset-0 overflow-hidden rounded-2xl">
              <span className="absolute inset-y-0 w-16 bg-white/25 blur-md" style={{ left: `${prog * 100}%`, animation: "shine 1s linear infinite" }} />
            </span>
            <span className="relative flex items-center gap-2 text-sm"><span className="inline-block size-4 animate-spin rounded-full border-[3px] border-sky border-r-transparent" />{Math.round(prog * 100)}%</span>
          </>
        )}
        {s === "success" && <span className="flex items-center gap-2 text-sm animate-pop"><Icon name="check" size={20} stroke={3.4} />Исполнено</span>}
      </button>
      <div className="flex items-center gap-2">
        {(["idle", "loading", "success"] as Morph[]).map((m) => (
          <span key={m} className={cn("rounded-lg px-2.5 py-1 font-mono text-[10px] font-bold transition-colors", s === m ? "bg-white text-ink-900" : "bg-ink-800 text-ink-500")}>{m}</span>
        ))}
      </div>
      <div className="text-[11px] text-ink-500">Одна кнопка — три состояния без скачков вёрстки</div>
    </div>
  );
}

/* ── B04 · Карточки со светящейся рамкой за курсором ── */
function GlowCard({ icon, hex, t, d }: { icon: IconName; hex: string; t: string; d: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [g, setG] = useState({ x: 50, y: 50, o: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, o: 1 });
      }}
      onMouseLeave={() => setG((v) => ({ ...v, o: 0 }))}
      className="relative overflow-hidden rounded-3xl bg-ink-850 p-[1.5px] transition-transform hover:-translate-y-1"
    >
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-300" style={{ opacity: g.o, background: `radial-gradient(180px circle at ${g.x}% ${g.y}%, ${hex}, transparent 70%)` }} />
      <div className="relative rounded-[21px] bg-ink-850/95 p-4">
        <div className="pointer-events-none absolute inset-0 rounded-[21px] transition-opacity duration-300" style={{ opacity: g.o * 0.5, background: `radial-gradient(240px circle at ${g.x}% ${g.y}%, ${hex}33, transparent 70%)` }} />
        <span className="relative flex size-11 items-center justify-center rounded-xl" style={{ background: `${hex}22`, color: hex }}><Icon name={icon} size={22} stroke={2.4} /></span>
        <div className="relative mt-3 font-display text-sm font-black">{t}</div>
        <div className="relative text-[12px] text-ink-400">{d}</div>
      </div>
    </div>
  );
}

export function GlowCards() {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <GlowCard icon="bolt" hex="#FFC940" t="+25 XP" d="За урок без ошибок" />
        <GlowCard icon="gem" hex="#3D9BFF" t="+15 кристаллов" d="За ежедневный квест" />
        <GlowCard icon="flame" hex="#FF8A3D" t="Стрик x2" d="За выходные подряд" />
      </div>
      <div className="mt-3 text-center text-[11px] text-ink-500">Веди курсором — рамка и подсветка следуют за ним</div>
    </div>
  );
}

/* ── B05 · Бейдж: pop, тряска, переполнение 99+ ── */
export function BadgePop() {
  const [n, setN] = useState(3);
  const [shake, setShake] = useState(0);
  const label = n > 99 ? "99+" : String(n);
  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="flex items-end gap-8">
        <button onClick={() => { tap(); setN(0); sfx("success"); }} className="relative" aria-label="Уведомления">
          <span className="flex size-16 items-center justify-center rounded-3xl bg-ink-750 shadow-[0_5px_0_#0a1430]">
            <Icon name="bell" size={30} className={cn(n > 0 && "text-gold", shake ? "animate-wiggle" : "")} key={shake} />
          </span>
          {n > 0 && (
            <span key={n} className="absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-bear px-1.5 font-display text-[12px] font-black text-white shadow-[0_3px_0_var(--color-bear-d)] animate-pop">
              {label}
            </span>
          )}
        </button>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <button key={i} onClick={() => { setN(i * 25 + 3); setShake(Date.now()); sfx("tick"); }} className={cn("rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold", Math.floor(n / 25) === i ? "bg-bear text-white" : "bg-ink-800 text-ink-300")}>
                {i === 4 ? "99+" : i * 25 + 3}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Btn s="xs" v="ink" icon="minus" className="px-2" aria-label="Меньше" onClick={() => setN((v) => Math.max(0, v - 1))} />
            <span className="w-14 text-center font-mono text-sm font-bold tabular-nums">{n}</span>
            <Btn s="xs" v="bear" icon="plus" className="px-2" aria-label="Больше" onClick={() => { setN((v) => v + 1); setShake(Date.now()); }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-ink-400">
        <GemArt size={18} />Тап по колоколу — «прочитать все»
        <CoinArt size={18} />Бейдж лопается с pop-анимацией
      </div>
    </div>
  );
}
