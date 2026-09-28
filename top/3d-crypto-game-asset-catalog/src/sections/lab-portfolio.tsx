import { useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Label } from "../components/ui";
import { tap, sfx, haptic } from "../lib/fx";
import { CandleSpark, LabChart, genCandles, mulberry32 } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   ПОРТФЕЛЬ: Command Center · Risk Matrix · Multi-Timeframe.
   ═══════════════════════════════════════════════════════════════════ */

const COINS = [
  { k: "BTC", vol: 0.5, apy: 8, hex: "#F7931A", seed: 5 },
  { k: "ETH", vol: 0.65, apy: 11, hex: "#8C9EFF", seed: 9 },
  { k: "SOL", vol: 0.9, apy: 16, hex: "#2BE3C8", seed: 14 },
  { k: "TON", vol: 0.75, apy: 13, hex: "#3D9BFF", seed: 19 },
  { k: "USDT", vol: 0.02, apy: 5, hex: "#2BE38B", seed: 24 },
];

/* ── TL11 · PORTFOLIO COMMAND CENTER ────────────────────── */
export function PortfolioCommand() {
  const [w, setW] = useState([38, 24, 14, 9, 15]);
  const [preset, setPreset] = useState("Свой");
  const setOne = (i: number, v: number) => {
    v = Math.max(0, Math.min(100, Math.round(v)));
    const rest = w.filter((_, j) => j !== i).reduce((a, b) => a + b, 0) || 1;
    const nw = w.map((x, j) => (j === i ? v : Math.round((x / rest) * (100 - v))));
    const diff = 100 - nw.reduce((a, b) => a + b, 0);
    nw[(i + 1) % nw.length] += diff;
    setW(nw); setPreset("Свой");
  };
  const risk = w.reduce((a, x, i) => a + x * COINS[i].vol, 0) / 100;
  const apy = w.reduce((a, x, i) => a + x * COINS[i].apy, 0) / 100;
  const mode = risk < 0.35 ? { t: "Консервативный", hex: "#2BE38B", d: "капитал защищён" } : risk < 0.6 ? { t: "Сбалансированный", hex: "#3D9BFF", d: "рост + защита" } : { t: "Агрессивный", hex: "#FF4D6D", d: "максимум волатильности" };
  const R = 44, C = 2 * Math.PI * R;
  let acc = 0;
  const eq = useMemo(() => {
    const rnd = mulberry32(777);
    let v = 10000; const out = [v];
    for (let i = 0; i < 40; i++) { v *= 1 + (apy / 100 / 40) + (rnd() - 0.5) * risk * 0.06; out.push(v); }
    return out;
  }, [apy, risk]);
  const presets: Record<string, number[]> = {
    "Консерва": [20, 15, 5, 5, 55], "Баланс": [35, 25, 15, 10, 15], "Деген": [40, 25, 25, 10, 0],
  };

  return (
    <div className="overflow-hidden rounded-3xl p-4 ring-1 transition-colors duration-700 sm:p-5"
      style={{ background: `linear-gradient(160deg, ${mode.hex}26, #0C1834 55%), linear-gradient(180deg,#0C1834,#081229)`, ["--tw-ring-color" as string]: `${mode.hex}44` } as React.CSSProperties}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm font-black" style={{ color: mode.hex }}>{mode.t}</span>
        <span className="text-[11px] text-ink-400">{mode.d} · риск {(risk * 100).toFixed(0)} · APY≈ {apy.toFixed(1)}%</span>
        <div className="ml-auto flex gap-1.5">
          {Object.keys(presets).map((p) => (
            <button key={p} onClick={() => { tap("tick"); setW(presets[p]); setPreset(p); sfx("whoosh"); }}
              className={cn("rounded-xl px-2.5 py-1.5 text-[11px] font-bold", preset === p ? "bg-white text-ink-900" : "bg-ink-800 text-ink-300")}>{p}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr_210px]">
        {/* донат */}
        <div className="relative mx-auto size-52">
          <svg viewBox="0 0 110 110" className="size-full -rotate-90">
            <circle cx="55" cy="55" r={R} fill="none" stroke="#081229" strokeWidth="15" />
            {w.map((x, i) => {
              const len = (x / 100) * C;
              const el = <circle key={i} cx="55" cy="55" r={R} fill="none" stroke={COINS[i].hex} strokeWidth="15"
                strokeDasharray={`${Math.max(0, len - 1.4)} ${C}`} strokeDashoffset={-acc}
                style={{ transition: "stroke-dasharray .45s cubic-bezier(.22,1,.36,1), stroke-dashoffset .45s cubic-bezier(.22,1,.36,1)" }} />;
              acc += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-black tabular-nums">${(10000).toLocaleString("ru-RU")}</span>
            <span className="text-[10px] font-bold uppercase text-ink-400">депозит</span>
          </div>
        </div>
        {/* карта активов */}
        <div className="space-y-2.5">
          {COINS.map((c, i) => (
            <div key={c.k} className="rounded-2xl bg-ink-950/50 p-2.5 ring-1 ring-white/5">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ background: c.hex, boxShadow: `0 0 8px ${c.hex}` }} />
                <b className="text-[13px]">{c.k}</b>
                <span className="font-mono text-[10px] text-ink-500">vol {c.vol} · {c.apy}%</span>
                <b className="ml-auto font-mono text-sm tabular-nums" style={{ color: c.hex }}>{w[i]}%</b>
              </div>
              <div className="relative mt-1.5">
                <div className="well absolute inset-x-0 top-[9px] h-2.5 rounded-full" />
                <div className="absolute left-0 top-[9px] h-2.5 rounded-full transition-all duration-300" style={{ width: `${w[i]}%`, background: c.hex }} />
                <input type="range" min={0} max={100} value={w[i]} aria-label={c.k}
                  onChange={(e) => { const v = +e.target.value; if (Math.abs(v - w[i]) >= 4) sfx("tick"); setOne(i, v); }}
                  className="rng relative" />
              </div>
            </div>
          ))}
        </div>
        {/* прогноз */}
        <div className="flex flex-col rounded-2xl bg-ink-950/50 p-3 ring-1 ring-white/5">
          <Label>Год симуляции</Label>
          <CandleSpark data={eq.map((v) => ({ o: v, h: v, l: v, c: v, v: 1 }))} w={180} h={64} hex={mode.hex} />
          <div className="mt-1 flex justify-between font-mono text-[11px]">
            <span className="text-ink-400">P10 ${(eq[0] * (1 - risk)).toLocaleString("ru-RU", { maximumFractionDigits: 0 })}</span>
            <span className="font-bold" style={{ color: mode.hex }}>~${eq[eq.length - 1].toLocaleString("ru-RU", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-900">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${risk * 100}%`, background: `linear-gradient(90deg,#2BE38B,#FFC940,#FF4D6D)` }} />
          </div>
          <div className="mt-1 text-center text-[10px] text-ink-500">маркер риска на шкале</div>
          <Btn s="xs" v="gold" className="mt-auto" icon="check" onClick={() => { sfx("success"); haptic(15); }}>Зафиксировать</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── TL12 · RISK MATRIX ─────────────────────────────── */
type Cell = { k: string; x: number; y: number; hex: string; cap: string; grp: "Крипта" | "Стейблы" };
const CELLS: Cell[] = [
  { k: "BTC", x: 30, y: 68, hex: "#F7931A", cap: "$1.3T", grp: "Крипта" },
  { k: "ETH", x: 48, y: 58, hex: "#8C9EFF", cap: "$420B", grp: "Крипта" },
  { k: "SOL", x: 68, y: 74, hex: "#2BE3C8", cap: "$80B", grp: "Крипта" },
  { k: "TON", x: 58, y: 40, hex: "#3D9BFF", cap: "$17B", grp: "Крипта" },
  { k: "DOGE", x: 82, y: 52, hex: "#C2A633", cap: "$22B", grp: "Крипта" },
  { k: "USDT", x: 12, y: 22, hex: "#2BE38B", cap: "$110B", grp: "Стейблы" },
  { k: "USDC", x: 20, y: 30, hex: "#3D9BFF", cap: "$34B", grp: "Стейблы" },
];

export function RiskMatrix() {
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>(() => Object.fromEntries(CELLS.map((c) => [c.k, { x: c.x, y: c.y }])));
  const [filter, setFilter] = useState<"Все" | "Крипта" | "Стейблы">("Все");
  const [sel, setSel] = useState<string | null>("SOL");
  const [drag, setDrag] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const fromEvent = (e: { clientX: number; clientY: number }) => {
    const r = box.current!.getBoundingClientRect();
    return {
      x: Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100)),
      y: Math.max(6, Math.min(94, ((e.clientY - r.top) / r.height) * 100)),
    };
  };
  const cur = CELLS.find((c) => c.k === sel);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
      <div>
        <div className="mb-2 flex gap-1.5">
          {(["Все", "Крипта", "Стейблы"] as const).map((f) => (
            <button key={f} onClick={() => { tap("tick"); setFilter(f); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", filter === f ? "bg-white text-ink-900" : "bg-ink-800 text-ink-300")}>{f}</button>
          ))}
          <span className="ml-auto hidden text-[11px] text-ink-500 sm:block">Тяни пузыри — матрица перестроится</span>
        </div>
        <div ref={box}
          className="relative h-72 overflow-hidden rounded-3xl bg-ink-950/60 ring-1 ring-white/5 sm:h-80"
          style={{ touchAction: "none" }}
          onPointerMove={(e) => { if (drag) setPos((p) => ({ ...p, [drag]: fromEvent(e) })); }}
          onPointerUp={() => { setDrag(null); haptic(8); }}
          onPointerCancel={() => setDrag(null)}
        >
          {/* квадранты */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {[["Звезды", "text-bull"], ["Лотерея", "text-gold"], ["Кэш", "text-sky"], ["Мусор", "text-bear"]].map(([t, c]) => (
              <div key={t} className="flex items-start justify-start p-2.5 text-[10px] font-black uppercase tracking-wider opacity-60">
                <span className={c as string}>{t}</span>
              </div>
            ))}
          </div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
          <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] text-ink-500">риск →</span>
          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 -rotate-90 font-mono text-[9px] text-ink-500">доход →</span>
          {CELLS.map((c) => {
            const p = pos[c.k];
            const dim = filter !== "Все" && c.grp !== filter;
            return (
              <button key={c.k}
                onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setDrag(c.k); setSel(c.k); tap("tick"); }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                style={{
                  left: `${p.x}%`, top: `${100 - p.y}%`,
                  width: 44, height: 44, background: `${c.hex}26`, border: `2px solid ${c.hex}`,
                  boxShadow: sel === c.k ? `0 0 0 3px #fff, 0 0 18px ${c.hex}` : `0 4px 14px ${c.hex}55`,
                  opacity: dim ? 0.18 : 1, transform: `translate(-50%,-50%) scale(${sel === c.k ? 1.18 : 1})`,
                  cursor: "grab", transitionProperty: drag === c.k ? "box-shadow" : "left, top, box-shadow, transform, opacity",
                }}
                aria-label={c.k}>
                <b className="pointer-events-none text-[10px] font-black" style={{ color: c.hex }}>{c.k}</b>
              </button>
            );
          })}
        </div>
      </div>
      <div key={sel} className="flex flex-col rounded-3xl bg-ink-950/60 p-4 ring-1 ring-white/5 animate-slide-up">
        {cur ? (
          <>
            <div className="flex items-center gap-2.5">
              <span className="flex size-11 items-center justify-center rounded-2xl font-display text-[11px] font-black text-ink-900" style={{ background: cur.hex }}>{cur.k.slice(0, 3)}</span>
              <div><div className="font-display text-sm font-black">{cur.k}</div><div className="font-mono text-[11px] text-ink-400">{cur.cap} · {cur.grp}</div></div>
            </div>
            <div className="mt-3 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between"><span className="text-ink-500">риск (x)</span><b>{pos[cur.k].x.toFixed(0)}/100</b></div>
              <div className="flex justify-between"><span className="text-ink-500">доход (y)</span><b>{pos[cur.k].y.toFixed(0)}/100</b></div>
              <div className="flex justify-between"><span className="text-ink-500">скор</span><b style={{ color: cur.hex }}>{(pos[cur.k].y / Math.max(1, pos[cur.k].x)).toFixed(2)}</b></div>
            </div>
            <div className="mt-2 text-[11px] leading-snug text-ink-300">
              {pos[cur.k].x > 60 && pos[cur.k].y > 55 ? "Высокий риск и высокий доход — только малая доля." : pos[cur.k].x < 35 ? "Якорь стабильности для любой просадки." : "Середняк: держит баланс портфеля."}
            </div>
            <Btn s="xs" v="sky" className="mt-3" onClick={() => { sfx("success"); }}>В портфель</Btn>
          </>
        ) : (
          <div className="py-8 text-center text-[12px] text-ink-500">Выбери пузырь на матрице</div>
        )}
      </div>
    </div>
  );
}

/* ── TL13 · MULTI-TIMEFRAME ───────────────────────────── */
const TF4 = [
  { k: "M15", group: 1, h: 120 }, { k: "H1", group: 4, h: 140 },
  { k: "H4", group: 16, h: 160 }, { k: "D1", group: 48, h: 180 },
] as const;

function aggregate(base: { o: number; h: number; l: number; c: number; v: number }[], g: number) {
  const out: typeof base = [];
  for (let i = 0; i < base.length; i += g) {
    const s = base.slice(i, i + g);
    if (!s.length) break;
    out.push({ o: s[0].o, h: Math.max(...s.map((x) => x.h)), l: Math.min(...s.map((x) => x.l)), c: s[s.length - 1].c, v: s.reduce((a, x) => a + x.v, 0) });
  }
  return out;
}

export function MultiTimeframe() {
  const [seed, setSeed] = useState(64);
  const [layout, setLayout] = useState<"grid" | "focus" | "column">("grid");
  const [hidden, setHidden] = useState<string[]>([]);
  const [focus, setFocus] = useState("H1");
  const [hovT, setHovT] = useState<number | null>(null); // время в базовых свечах
  const base = useMemo(() => genCandles(seed, 192, 66000, "breakout", 1), [seed]);
  const charts = TF4.map((t) => ({ ...t, data: aggregate(base, t.group) }));
  const shown = charts.filter((c) => !hidden.includes(c.k));
  // ховер в базовом времени → индекс на каждом ТФ
  const idxFor = (tfGroup: number) => (hovT === null ? null : Math.floor(hovT / tfGroup));

  const Card = ({ k, data, group, h }: { k: string; data: ReturnType<typeof aggregate>; group: number; h: number }) => (
    <div className="overflow-hidden rounded-2xl bg-ink-950/60 ring-1 ring-white/5">
      <div className="flex items-center gap-2 px-3 pt-2">
        <b className="font-display text-[11px]">{k}</b>
        <span className="font-mono text-[10px] text-ink-500">{data.length} свечей</span>
        <button onClick={() => { tap("tick"); setHidden((s) => [...s, k]); }} className="ml-auto text-ink-500 hover:text-bear" aria-label={`Скрыть ${k}`}><Icon name="x" size={13} /></button>
        <button onClick={() => { tap("tick"); setFocus(k); setLayout("focus"); }} className="text-ink-500 hover:text-white" aria-label={`Увеличить ${k}`}><Icon name="eye" size={13} /></button>
      </div>
      <div className="p-1.5">
        <LabChart id={`mtf-${k}-${seed}`} data={data} height={layout === "focus" && focus === k ? 300 : h}
          showMA={false} showVol={false} showGrid={false} compact crosshair={false}
          highlight={idxFor(group) !== null ? new Set([Math.min(data.length - 1, idxFor(group)!)]) : null}
          onHover={(i) => { if (i !== null) setHovT(Math.min(base.length - 1, i * group + Math.floor(group / 2))); }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {(["grid", "focus", "column"] as const).map((l) => (
            <button key={l} onClick={() => { tap("tick"); setLayout(l); }}
              className={cn("rounded-xl px-3 py-1.5 font-display text-[10px] font-black uppercase", layout === l ? "bg-sky text-white" : "text-ink-400")}>
              {l === "grid" ? "2×2" : l === "focus" ? "Фокус" : "Лента"}
            </button>
          ))}
        </div>
        {hidden.length > 0 && (
          <div className="flex gap-1.5">
            {hidden.map((k) => (
              <button key={k} onClick={() => { tap("tick"); setHidden((s) => s.filter((x) => x !== k)); }} className="rounded-lg bg-ink-800 px-2 py-1 font-mono text-[10px] text-ink-300">+ {k}</button>
            ))}
          </div>
        )}
        <button onClick={() => { tap("tick"); setSeed((s) => s + 17); }} className="ml-auto flex items-center gap-1.5 rounded-xl bg-ink-800 px-3 py-1.5 text-[11px] font-bold text-ink-200 hover:text-white">
          <Icon name="refresh" size={13} />Новый рынок
        </button>
      </div>
      <div className="mt-1 font-mono text-[10px] text-ink-500">
        {hovT !== null ? `t = свеча #${hovT} · подсвечена на всех ТФ` : "наведи на любой график — время синхронизируется"}
      </div>
      {layout === "grid" && <div className="mt-2 grid gap-2 sm:grid-cols-2">{shown.map((c) => <Card key={c.k} {...c} />)}</div>}
      {layout === "column" && <div className="mt-2 space-y-2">{shown.map((c) => <Card key={c.k} {...c} />)}</div>}
      {layout === "focus" && (
        <div className="mt-2 grid gap-2 lg:grid-cols-[1fr_220px]">
          <Card {...shown.find((c) => c.k === focus)!} />
          <div className="space-y-2">{shown.filter((c) => c.k !== focus).map((c) => <Card key={c.k} {...c} h={86} />)}</div>
        </div>
      )}
    </div>
  );
}
