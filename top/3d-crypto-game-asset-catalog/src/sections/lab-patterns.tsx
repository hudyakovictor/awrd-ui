import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Label } from "../components/ui";
import { tap, sfx, haptic, useInterval, notify } from "../lib/fx";
import { LabChart, genCandles } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   ПАТТЕРНЫ: Trainer Pro (выбор · область · линия) + Scanner.
   ═══════════════════════════════════════════════════════════════════ */

type Task = {
  name: string; seed: number; base: number;
  candles: [number, number]; // правильный диапазон свечей
  line: { a: number; b: number }; // правильная линия (по минимумам/максимумам)
  variants: string[];
};

const TASKS: Task[] = [
  {
    name: "Двойное дно", seed: 7001, base: 64000,
    candles: [16, 27], line: { a: 17, b: 26 },
    variants: ["Двойное дно", "Нисходящий флаг", "Голова и плечи"],
  },
  {
    name: "Бычий флаг", seed: 7002, base: 66000,
    candles: [24, 36], line: { a: 10, b: 24 },
    variants: ["Клин", "Бычий флаг", "Двойная вершина"],
  },
  {
    name: "Голова и плечи", seed: 7003, base: 68000,
    candles: [12, 30], line: { a: 14, b: 28 },
    variants: ["Голова и плечи", "Треугольник", "Чашка с ручкой"],
  },
];

/* ── TL09 · PATTERN TRAINER PRO ─────────────────────────── */
export function PatternTrainerPro() {
  const [task, setTask] = useState(0);
  const [mode, setMode] = useState<"select" | "area" | "line">("select");
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [range, setRange] = useState<[number, number] | null>(null);
  const [line, setLine] = useState<{ a: number; b: number } | null>(null);
  const [variant, setVariant] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const T = TASKS[task];
  const data = useMemo(() => {
    const d = genCandles(T.seed, 44, T.base, "range", 1.1);
    // вырезаем узнаваемую формацию в целевом диапазоне
    const [a, b] = T.candles;
    const mid = (a + b) >> 1;
    d.forEach((c, i) => {
      if (i < a || i > b) return;
      const k = 1 - Math.abs(i - mid) / ((b - a) / 2 + 1);
      if (task === 0) { // двойное дно: два провала
        const dip = (i === a + 1 || i === b - 1) ? 0.985 : 1.0;
        c.l *= dip; c.c = Math.min(c.o, c.c * (dip + 0.002)); c.h = Math.max(c.o, c.c) * 1.002;
      } else if (task === 1) { // флаг: плотный коридор после импульса
        c.o *= 1 + k * 0.002; c.c = c.o * (1 - 0.001 + (i % 2) * 0.002);
        c.h = Math.max(c.o, c.c) * 1.0015; c.l = Math.min(c.o, c.c) * 0.9985;
      } else { // ГиП: плечо-голова-плечо
        const h = i === mid ? 1.012 : (i === a + 2 || i === b - 2) ? 1.005 : 1.0;
        c.h *= h; c.c = Math.max(c.o, c.c);
      }
    });
    return d;
  }, [T, task]);

  const reset = (t = task) => {
    setPicked(new Set()); setRange(null); setLine(null); setVariant(null); setChecked(false);
    if (t !== task) setTask(t);
  };

  const onTap = (i: number) => {
    if (checked) return;
    if (mode === "select") {
      tap("tick");
      setPicked((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; });
    } else if (mode === "line") {
      tap("tick");
      if (!line || (line.a !== -1 && line.b !== -1 && line.a !== line.b)) setLine({ a: i, b: -1 });
      else if (line.b === -1 && i !== line.a) setLine({ a: line.a, b: i });
    }
  };
  const onRange = (a: number, b: number) => { if (!checked) { setRange([a, b]); sfx("tick"); } };

  const correctIdx = T.variants.indexOf(T.name);
  const overlap = (() => {
    const [a, b] = T.candles;
    const user = range ? new Set(Array.from({ length: b - a + 1 }, (_, k) => a + k).filter((x) => x >= range[0] && x <= range[1])) : picked;
    const truth = new Set(Array.from({ length: T.candles[1] - T.candles[0] + 1 }, (_, k) => T.candles[0] + k));
    const inter = [...user].filter((x) => truth.has(x)).length;
    const union = new Set([...user, ...truth]).size || 1;
    return Math.round((inter / union) * 100);
  })();
  const lineOk = line && line.b !== -1 && Math.abs(line.a - T.line.a) <= 3 && Math.abs(line.b - T.line.b) <= 3;
  const variantOk = variant === correctIdx;
  const score = checked ? Math.round(overlap * 0.5 + (lineOk ? 30 : 0) + (variantOk ? 20 : 0)) : 0;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {TASKS.map((t, k) => (
            <button key={t.name} onClick={() => { reset(k); sfx("whoosh"); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", task === k ? "bg-gold text-ink-900" : "text-ink-300 hover:text-white")}>
              {k + 1}. {t.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {([["select", "Свечи"], ["area", "Область"], ["line", "Линия"]] as const).map(([m, t]) => (
            <button key={m} onClick={() => { tap("tick"); setMode(m); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", mode === m ? "bg-sky text-white" : "text-ink-400 hover:text-white")}>{t}</button>
          ))}
        </div>
      </div>
      <div className="mt-2 text-[12px] text-ink-400">
        {mode === "select" ? "Тапай свечи формации — они подсвечиваются." : mode === "area" ? "Потяни по графику — выделишь область." : "Тапни две точки — проведёшь линию шеи / тренда."}
        {" "}Затем выбери название и нажми «Проверить».
      </div>

      <div className="well relative mt-3 overflow-hidden p-1.5">
        <LabChart id="trainer" data={data} height={230}
          highlight={checked ? new Set(Array.from({ length: T.candles[1] - T.candles[0] + 1 }, (_, k) => T.candles[0] + k)) : picked.size || (range && mode === "area") ? null : null}
          selectRange={checked ? [T.candles[0], T.candles[1]] : range}
          trend={checked ? T.line : line && line.b !== -1 ? line : null}
          onTap={onTap} onRange={mode === "area" ? onRange : null}
        />
        {/* маркеры выбранных свечей */}
        {!checked && mode === "select" && (
          <div className="pointer-events-none absolute inset-0">
            {[...picked].map((i) => (
              <span key={i} className="absolute top-2 size-2.5 -translate-x-1/2 rounded-full bg-sky shadow-[0_0_8px_#3D9BFF]" style={{ left: `${(8 + (i + 0.5) * ((640 - 16) / data.length)) / 640 * 100}%` }} />
            ))}
          </div>
        )}
        {mode === "line" && line && line.b === -1 && (
          <div className="absolute bottom-2.5 left-3 rounded-lg bg-ink-950/85 px-2 py-1 font-mono text-[10px] text-gold animate-pulse">поставь вторую точку линии…</div>
        )}
      </div>

      <div className="mt-3">
        <Label>Что это за паттерн?</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {T.variants.map((v, k) => (
            <button key={v} disabled={checked} onClick={() => { tap("tick"); setVariant(k); }}
              className={cn("rounded-2xl border-2 px-3 py-2.5 text-[13px] font-bold transition-all",
                checked ? (k === correctIdx ? "border-bull bg-bull/15 text-bull" : variant === k ? "border-bear bg-bear/15 text-bear" : "border-ink-700 opacity-50")
                : variant === k ? "border-sky bg-sky/15 text-white" : "border-ink-700 bg-ink-850 hover:border-ink-400")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {!checked ? (
        <div className="mt-3 flex gap-2">
          <Btn s="sm" v="ghost" icon="refresh" onClick={() => reset()}>Сброс</Btn>
          <Btn s="md" block disabled={variant === null && picked.size === 0 && !range} onClick={() => {
            setChecked(true);
            const ok = variant === correctIdx && overlap >= 50;
            if (ok) { sfx("levelup"); haptic([10, 30, 10]); notify(`Паттерн разобран! ${T.name}`, "success"); }
            else { sfx("error"); haptic(30); }
          }}>Проверить разбор</Btn>
        </div>
      ) : (
        <div className={cn("mt-3 rounded-2xl p-4 animate-slide-up", score >= 70 ? "bg-bull/10 ring-1 ring-bull/40" : score >= 40 ? "bg-gold/10 ring-1 ring-gold/40" : "bg-bear/10 ring-1 ring-bear/40")}>
          <div className="flex items-center gap-3">
            <span className={cn("font-display text-3xl font-black", score >= 70 ? "text-bull" : score >= 40 ? "text-gold" : "text-bear")}>{score}</span>
            <div className="flex-1 text-[12px] font-bold">
              {score >= 70 ? `Отлично — это «${T.name}».` : score >= 40 ? "Близко! Смотри жёлтую подсказку на графике." : `Это был «${T.name}» — жёлтая зона и пунктир.`}
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-[11px] text-ink-300">
                <span>пересечение области: <b className="text-sky">{overlap}%</b></span>
                <span>линия: <b className={lineOk ? "text-bull" : "text-bear"}>{lineOk ? "точно" : "мимо"}</b></span>
                <span>название: <b className={variantOk ? "text-bull" : "text-bear"}>{variantOk ? "верно" : "мимо"}</b></span>
              </div>
            </div>
            <Btn s="sm" v={task < 2 ? "sky" : "gold"} onClick={() => reset((task + 1) % TASKS.length)}>{task < 2 ? "Дальше" : "Заново"}</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TL10 · PATTERN SCANNER ───────────────────────────── */
const SCAN_SEEDS = [31, 57, 83, 129, 154, 201];
const FILTERS = [
  { k: "flag", t: "Флаг", hex: "#2BE38B", d: "плотный коридор" },
  { k: "double", t: "Двойное дно", hex: "#3D9BFF", d: "два провала" },
  { k: "vol", t: "Всплеск объёма", hex: "#FFC940", d: "аномальный бар" },
] as const;

export function PatternScanner() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["k"]>("flag");
  const [tick, setTick] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  useInterval(() => setTick((t) => t + 1), scanning ? 1600 : null);

  const minis = SCAN_SEEDS.map((s, idx) => {
    const data = genCandles(s + Math.floor(tick / 3) * 13, 36, 60000 + idx * 1500, idx % 2 ? "range" : "trend-up", 1);
    // псевдо-скор соответствия фильтру
    const score = Math.round(40 + ((s * 37 + tick * 11 + FILTERS.findIndex((f) => f.k === filter) * 53) % 55));
    const hit = score >= 68;
    const at = (s + tick) % 20 + 6;
    return { data, score, hit, at, seed: s };
  });
  const F = FILTERS.find((f) => f.k === filter)!;
  const hits = minis.filter((m) => m.hit).length;
  const big = open !== null ? minis[open] : null;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button key={f.k} onClick={() => { tap("tick"); setFilter(f.k); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", filter === f.k ? "text-ink-900" : "bg-ink-800 text-ink-300")}
              style={filter === f.k ? { background: f.hex } : undefined}>
              {f.t}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-ink-400">{F.d} · найдено <b className="text-white">{hits}/{minis.length}</b></span>
        <button onClick={() => { tap(); setScanning(!scanning); }} className={cn("ml-auto flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-[10px] font-bold uppercase", scanning ? "bg-bear/15 text-bear" : "bg-bull/15 text-bull")}>
          <span className={cn("size-2 rounded-full", scanning ? "bg-bear animate-pulse" : "bg-bull")} />{scanning ? "Стоп" : "Скан"}
        </button>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {/* линия сканирования */}
        {scanning && <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-sky/25 to-transparent" style={{ animation: "scan 2.2s ease-in-out infinite alternate" }} />}
        {minis.map((m, k) => (
          <button key={m.seed} onClick={() => { tap("tick"); setOpen(k); }}
            className={cn("relative overflow-hidden rounded-2xl bg-ink-950/60 p-2 text-left ring-2 transition-all hover:-translate-y-0.5", m.hit ? "" : "opacity-75")}
            style={m.hit ? { ["--tw-ring-color" as string]: F.hex, boxShadow: `0 0 16px ${F.hex}44` } as React.CSSProperties : { ["--tw-ring-color" as string]: "transparent" } as React.CSSProperties}
          >
            <div className={cn("ring-2", m.hit && "animate-pulse")} style={{ ["--tw-ring-color" as string]: m.hit ? F.hex : "transparent" } as React.CSSProperties}>
              <LabChart id={`scan${k}`} data={m.data} height={86} showMA={false} showVol={false} showGrid={false} compact crosshair={false}
                highlight={m.hit ? new Set([m.at, m.at + 1, m.at + 2, m.at + 3]) : null} />
            </div>
            <div className="mt-1 flex items-center gap-1.5 px-0.5">
              <span className="font-mono text-[10px] text-ink-500">#{m.seed}</span>
              <span className={cn("ml-auto rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black", m.hit ? "text-ink-900" : "bg-ink-800 text-ink-400")} style={m.hit ? { background: F.hex } : undefined}>
                {m.score}%
              </span>
            </div>
            {m.hit && <span className="absolute right-1.5 top-1.5 rounded-md bg-ink-950/85 px-1.5 py-0.5 text-[9px] font-black uppercase" style={{ color: F.hex }}>match</span>}
          </button>
        ))}
      </div>

      {big && (
        <div className="mt-3 overflow-hidden rounded-2xl bg-ink-950/60 ring-1 ring-white/10 animate-slide-up">
          <div className="flex items-center gap-2 p-3 pb-0">
            <span className="font-mono text-[11px] text-ink-400">График #{big.seed} · {F.t} · скор {big.score}%</span>
            <button onClick={() => setOpen(null)} className="ml-auto text-ink-400 hover:text-white"><Icon name="x" size={16} /></button>
          </div>
          <div className="p-1.5">
            <LabChart id="scanbig" data={genCandles(big.seed, 72, 62000, "range", 1)} height={200}
              highlight={new Set([big.at, big.at + 1, big.at + 2, big.at + 3, big.at + 4])} />
          </div>
          <div className="flex items-center gap-2 p-3 pt-1 text-[12px]">
            <span className="flex-1 text-ink-300">Подсвеченный участок — лучшее совпадение с фильтром «{F.t}».</span>
            <Btn s="xs" v="sky" onClick={() => { sfx("success"); notify("Формация добавлена в тренажёр", "success"); }}>В тренажёр</Btn>
          </div>
        </div>
      )}
      <style>{`@keyframes scan { from { transform: translateY(-8px); opacity:.4 } to { transform: translateY(190px); opacity:1 } }`}</style>
    </div>
  );
}
