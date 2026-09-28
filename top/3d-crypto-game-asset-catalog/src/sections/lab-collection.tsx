import { useMemo, useRef, useState } from "react";
import { Btn, Label } from "../components/ui";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { CandleSpark, genCandles } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   TL14 · COLLECTION VAULT — наборы, переворот, редкость, holo.
   ═══════════════════════════════════════════════════════════════════ */

type Rar = "common" | "rare" | "epic" | "legend";
const RAR: Record<Rar, { t: string; hex: string; w: number }> = {
  common: { t: "Обычная", hex: "#7D93C6", w: 50 },
  rare: { t: "Редкая", hex: "#3D9BFF", w: 30 },
  epic: { t: "Эпик", hex: "#9A6BFF", w: 15 },
  legend: { t: "Легенда", hex: "#FFC940", w: 5 },
};
type Card = { k: string; t: string; d: string; rar: Rar; pow: number; seed: number };
const SET: Card[] = [
  { k: "doji", t: "Доджи", d: "Нерешительность рынка", rar: "common", pow: 2, seed: 11 },
  { k: "hammer", t: "Молот", d: "Разворот вверх", rar: "common", pow: 3, seed: 22 },
  { k: "engulf", t: "Поглощение", d: "Сильный разворот", rar: "rare", pow: 5, seed: 33 },
  { k: "flag", t: "Флаг", d: "Продолжение тренда", rar: "rare", pow: 6, seed: 44 },
  { k: "wedge", t: "Клин", d: "Затухание движения", rar: "epic", pow: 8, seed: 55 },
  { k: "hs", t: "Голова-плечи", d: "Король разворотов", rar: "epic", pow: 9, seed: 66 },
  { k: "cup", t: "Чашка с ручкой", d: "Долгое накопление", rar: "legend", pow: 10, seed: 77 },
  { k: "whale", t: "След кита", d: "Секретная карта сезона", rar: "legend", pow: 10, seed: 88 },
];

function roll(): Card {
  const r = Math.random() * 100;
  let acc = 0;
  let want: Rar = "common";
  (Object.keys(RAR) as Rar[]).forEach((k) => { acc += RAR[k].w; if (r < acc && want === "common" && k !== "common") want = k; });
  // честный ролл по весам
  let x = Math.random() * 100;
  for (const k of Object.keys(RAR) as Rar[]) { x -= RAR[k].w; if (x <= 0) { want = k; break; } }
  const pool = SET.filter((c) => c.rar === want);
  return pool[Math.floor(Math.random() * pool.length)];
}

function CardFace({ c, size = "md" }: { c: Card; size?: "md" | "sm" }) {
  const R = RAR[c.rar];
  const data = useMemo(() => genCandles(c.seed, 24, 100, "range", 1), [c.seed]);
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const holo = c.rar === "epic" || c.rar === "legend";
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        if (!holo) return;
        const r = ref.current!.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 16, y: ((e.clientY - r.top) / r.height - 0.5) * -16 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className={cn("relative overflow-hidden rounded-2xl p-[2px]", size === "md" ? "w-40 sm:w-44" : "w-full")}
      style={{
        background: `linear-gradient(160deg, ${R.hex}, #0C1834 70%)`,
        transform: `perspective(700px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
        transition: "transform .15s",
        boxShadow: c.rar === "legend" ? `0 0 24px ${R.hex}88, 0 6px 0 rgba(0,0,0,.5)` : "0 6px 0 rgba(0,0,0,.5)",
      }}
    >
      <div className="relative rounded-[14px] bg-ink-900/95 p-2.5 text-center">
        <div className="flex items-center justify-between">
          <span className="rounded-md px-1.5 py-0.5 font-display text-[8px] font-black uppercase text-ink-900" style={{ background: R.hex }}>{R.t}</span>
          <span className="font-mono text-[10px] font-black" style={{ color: R.hex }}>✦{c.pow}</span>
        </div>
        <div className="mt-1.5 rounded-xl bg-ink-950/70 p-1">
          <CandleSpark data={data} w={120} h={44} hex={R.hex} />
        </div>
        <div className="mt-1.5 font-display text-[12px] font-black">{c.t}</div>
        <div className="text-[10px] leading-tight text-ink-400">{c.d}</div>
        {holo && (
          <div className="pointer-events-none absolute inset-0 rounded-[14px] opacity-70 mix-blend-screen"
            style={{ background: `linear-gradient(${115 + tilt.x * 4}deg, transparent 30%, ${R.hex}55 45%, #ffffff88 50%, ${R.hex}55 55%, transparent 70%)` }} />
        )}
        {c.rar === "legend" && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]">
            <div className="shine-sweep absolute inset-0" />
          </div>
        )}
      </div>
    </div>
  );
}

export function CollectionVault() {
  const [phase, setPhase] = useState<"idle" | "opening" | "reveal">("idle");
  const [pack, setPack] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [owned, setOwned] = useState<Record<string, number>>({ doji: 2, hammer: 1, engulf: 1 });
  const [filter, setFilter] = useState<"Все" | Rar>("Все");
  const [inspect, setInspect] = useState<Card | null>(null);
  const [packs, setPacks] = useState(3);

  const open = () => {
    if (phase === "opening" || packs <= 0) return;
    setPacks((p) => p - 1);
    setPhase("opening");
    setFlipped([false, false, false]);
    sfx("open"); haptic(20);
    setTimeout(() => {
      const cards = [roll(), roll(), roll()];
      // гарантия: в каждом 3-м паке минимум rare+
      if (!cards.some((c) => c.rar !== "common") && Math.random() < 0.5) cards[2] = SET.find((c) => c.rar === "rare")!;
      setPack(cards);
      setPhase("reveal");
      const leg = cards.find((c) => c.rar === "legend");
      if (leg) { sfx("levelup"); haptic([10, 30, 10, 30, 60]); notify(`ЛЕГЕНДА: ${leg.t}!`, "success"); }
      else if (cards.some((c) => c.rar === "epic")) sfx("levelup");
      else sfx("coin");
      cards.forEach((_, i) => setTimeout(() => setFlipped((f) => f.map((v, j) => (j === i ? true : v))), 350 + i * 380));
    }, 1100);
  };
  const collect = () => {
    const n: Record<string, number> = { ...owned };
    pack.forEach((c) => { n[c.k] = (n[c.k] ?? 0) + 1; });
    setOwned(n);
    setPhase("idle");
    tap("success");
    notify("Карты добавлены в коллекцию", "success");
  };
  const have = Object.keys(owned).length;
  const rows = SET.filter((c) => filter === "Все" || c.rar === filter);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-violet/15 via-ink-850 to-ink-900 p-4 ring-1 ring-violet/30 sm:p-5">
      {phase === "idle" ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center justify-center rounded-3xl bg-ink-950/50 p-5 ring-1 ring-white/5">
            <button onClick={open} disabled={packs <= 0} className={cn("relative transition-transform hover:scale-105 active:scale-95", packs <= 0 && "opacity-50 grayscale")}>
              <div className="flex size-36 items-center justify-center rounded-3xl bg-gradient-to-b from-violet to-violet-d shadow-[0_8px_0_#2d1470] ring-2 ring-white/20">
                <span className="font-display text-4xl">?</span>
              </div>
              <span className="absolute -right-2 -top-2 flex size-9 items-center justify-center rounded-full bg-gold font-display text-sm font-black text-ink-900 shadow">×{packs}</span>
            </button>
            <div className="mt-3 font-display text-sm font-black">Набор «Паттерны»</div>
            <div className="text-[11px] text-ink-400">3 карты · шанс легенды 5%</div>
            <Btn s="md" v="violet" icon="gift" disabled={packs <= 0} className="mt-3" onClick={open}>{packs > 0 ? "Открыть набор" : "Наборы кончились"}</Btn>
            {packs <= 0 && <Btn s="xs" v="ghost" className="mt-2" onClick={() => setPacks(3)}>Взять ещё 3 (демо)</Btn>}
            <div className="mt-3 flex gap-1.5">
              {(Object.keys(RAR) as Rar[]).map((r) => (
                <span key={r} className="rounded-md px-1.5 py-0.5 font-mono text-[9px] font-black" style={{ background: `${RAR[r].hex}22`, color: RAR[r].hex }}>{RAR[r].w}%</span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm font-black">Коллекция {have}/{SET.length}</span>
              <div className="h-2.5 w-32 overflow-hidden rounded-full bg-ink-900">
                <div className="h-full rounded-full bg-gradient-to-r from-violet to-gold transition-all duration-700" style={{ width: `${(have / SET.length) * 100}%` }} />
              </div>
              <div className="ml-auto flex gap-1">
                {(["Все", "common", "rare", "epic", "legend"] as const).map((f) => (
                  <button key={f} onClick={() => { tap("tick"); setFilter(f); }}
                    className={cn("rounded-lg px-2 py-1 text-[10px] font-bold", filter === f ? "bg-white text-ink-900" : "bg-ink-800 text-ink-300")}>
                    {f === "Все" ? "Все" : RAR[f].t}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {rows.map((c) => {
                const n = owned[c.k] ?? 0;
                return (
                  <button key={c.k} onClick={() => { tap("tick"); setInspect(c); }}
                    className={cn("relative rounded-2xl bg-ink-950/50 p-2 ring-1 transition-transform hover:-translate-y-1", n === 0 && "opacity-60")}>
                    {n === 0 ? (
                      <div className="flex h-24 items-center justify-center rounded-xl bg-ink-900 text-3xl text-ink-700">?</div>
                    ) : (
                      <div className="flex justify-center"><CardFace c={c} size="sm" /></div>
                    )}
                    <div className="mt-1 flex items-center justify-between px-0.5">
                      <span className="text-[10px] font-bold">{n === 0 ? "???" : c.t}</span>
                      {n > 1 && <span className="rounded bg-ink-800 px-1 font-mono text-[9px]">×{n}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-2 text-center">
          {phase === "opening" ? (
            <div className="flex min-h-64 flex-col items-center justify-center animate-wiggle">
              <div className="flex size-36 items-center justify-center rounded-3xl bg-gradient-to-b from-violet to-violet-d shadow-[0_8px_0_#2d1470] ring-2 ring-white/30">
                <span className="font-display text-4xl animate-pulse">?</span>
              </div>
              <div className="mt-3 font-display text-sm font-black">Открываем…</div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-center gap-3">
                {pack.map((c, i) => (
                  <div key={i} className="[perspective:800px]">
                    <div className="relative transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: flipped[i] ? "rotateY(0deg)" : "rotateY(90deg)", transitionDelay: `${i * 60}ms` }}>
                      <CardFace c={c} />
                      {c.rar === "legend" && <div className="absolute -inset-2 -z-10 rounded-3xl bg-gold/30 blur-2xl" />}
                    </div>
                    <div className="mt-1.5 font-mono text-[10px] text-ink-400">карта {i + 1}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Btn s="sm" v="ghost" icon="refresh" onClick={open}>Ещё набор ×{packs}</Btn>
                <Btn s="md" v="gold" icon="check" disabled={flipped.some((f) => !f)} onClick={collect}>В коллекцию</Btn>
              </div>
            </>
          )}
        </div>
      )}
      {inspect && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/80 p-4 backdrop-blur-md animate-fade" onClick={() => setInspect(null)}>
          <div onClick={(e) => e.stopPropagation()} className="panel max-w-xs p-5 text-center animate-zoom-in" role="dialog" aria-label={inspect.t}>
            <CardFace c={inspect} />
            <div className="mt-2 text-[12px] text-ink-300">{inspect.d} · сила {inspect.pow}/10</div>
            <div className="mt-1 font-mono text-[11px] text-ink-500">в коллекции: ×{owned[inspect.k] ?? 0}</div>
            <Btn s="sm" v="ink" className="mt-3" block onClick={() => setInspect(null)}>Закрыть</Btn>
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-500">
        <Label>Запоминающийся момент</Label>
        <span className="-ml-2">тряска набора → веер карт с переворотом → holo-блеск эпиков следует за курсором</span>
      </div>
    </div>
  );
}
