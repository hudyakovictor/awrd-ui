import { useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Label, Toggle } from "../components/ui";
import { useSettings, settings, COLOR_MODES } from "../lib/settings";
import { sfx, haptic, tap, SFX_LIST, HAPTICS, type Sfx } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════ Y01 — Live accessibility settings ═══════════════ */
export function A11ySettings() {
  const s = useSettings();
  const candles = [[40, 60], [58, 44], [44, 70], [70, 52], [52, 78], [78, 66], [66, 88]];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label>Цветовое зрение · применяется ко всему сайту</Label>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_MODES.map((m) => (
              <button key={m.v} onClick={() => { tap("tick"); settings.set({ cb: m.v }); }} data-state={s.cb === m.v ? "selected" : undefined} className="tile3d p-2.5 text-left">
                <div className="flex gap-1"><span className="h-3 flex-1 rounded-full" style={{ background: m.bull }} /><span className="h-3 flex-1 rounded-full" style={{ background: m.bear }} /></div>
                <div className="mt-1.5 text-[12px] font-bold">{m.label}</div>
                <div className="text-[10px] leading-tight text-ink-400">{m.hint}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="panel-soft divide-y divide-white/5">
          {([
            ["reduced", "Меньше движения", "Отключает анимации и частицы", "sky"],
            ["contrast", "Высокий контраст", "Светлее вторичный текст и рамки", "gold"],
            ["bigTargets", "Крупные зоны касания", "Минимум 44×44 px для всех кнопок", "bull"],
            ["haptics", "Вибро-отклик", "Паттерны на Android / в WebView", "bull"],
          ] as const).map(([k, t, d, tone]) => (
            <div key={k} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1"><div className="text-[13px] font-bold">{t}</div><div className="text-[11px] text-ink-400">{d}</div></div>
              <Toggle on={s[k]} tone={tone} label={t} onChange={(v) => settings.set({ [k]: v })} />
            </div>
          ))}
        </div>
        <div>
          <Label>Размер текста · {Math.round(s.scale * 100)}%</Label>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-ink-400">A</span>
            <div className="relative flex-1">
              <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
              <div className="absolute left-0 top-[11px] h-3 rounded-full bg-sky" style={{ width: `${((s.scale - 0.9) / 0.4) * 100}%` }} />
              <input type="range" className="rng relative" min={90} max={130} step={5} value={Math.round(s.scale * 100)} aria-label="Размер текста" onChange={(e) => { sfx("tick"); settings.set({ scale: +e.target.value / 100 }); }} />
            </div>
            <span className="text-lg font-bold text-ink-400">A</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="well grid-bg p-4">
          <div className="flex items-center justify-between"><span className="font-display text-xs font-bold">Превью: BTC · 1ч</span><span className="font-mono text-sm font-bold" style={{ color: "var(--color-bull)" }}>▲ +2.4%</span></div>
          <svg viewBox="0 0 210 110" className="mt-2 h-32 w-full">
            {candles.map(([o, c], i) => {
              const up = c > o, x = 15 + i * 28;
              const col = up ? "var(--color-bull)" : "var(--color-bear)";
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={110 - Math.max(o, c) - 8} y2={110 - Math.min(o, c) + 8} style={{ stroke: col }} strokeWidth="2" />
                  <rect x={x - 8} y={110 - Math.max(o, c)} width="16" height={Math.abs(c - o)} rx="2" style={{ fill: col }} />
                  {s.cb === "mono" && <text x={x} y={110 - Math.max(o, c) - 12} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="900">{up ? "▲" : "▼"}</text>}
                </g>
              );
            })}
          </svg>
          <div className="mt-2 flex gap-2">
            <span className="flex-1 rounded-xl py-2 text-center font-display text-[11px] font-black text-ink-900" style={{ background: "var(--color-bull)", boxShadow: "0 3px 0 var(--color-bull-d)" }}>▲ Long</span>
            <span className="flex-1 rounded-xl py-2 text-center font-display text-[11px] font-black text-white" style={{ background: "var(--color-bear)", boxShadow: "0 3px 0 var(--color-bear-d)" }}>▼ Short</span>
          </div>
        </div>
        <div className="rounded-2xl bg-sky/10 p-3 text-[12px] leading-relaxed text-ink-200 ring-1 ring-sky/30">
          <b className="text-sky">Правило системы:</b> направление рынка никогда не кодируется только цветом — всегда есть стрелка ▲▼, знак ± или подпись.
        </div>
        <Btn s="sm" v="ghost" icon="refresh" className="self-start" onClick={() => settings.reset()}>Сбросить настройки</Btn>
      </div>
    </div>
  );
}

/* ═══════════════ Y02 — WCAG contrast matrix ═══════════════ */
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a: string, b: string) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const FG = [["Текст", "#DFE7FA"], ["Вторичный", "#7D93C6"], ["Bull", "#2BE38B"], ["Bear", "#FF4D6D"], ["Gold", "#FFC940"], ["Sky", "#3D9BFF"]];
const BG = [["ink-900", "#081229"], ["ink-800", "#11203F"], ["panel", "#172B57"]];
export function ContrastMatrix() {
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const r = contrast(FG[sel[0]][1], BG[sel[1]][1]);
  return (
    <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1.5 text-[11px]">
          <thead><tr><th />{BG.map(([n, h]) => <th key={n} className="pb-1 text-left font-mono font-bold text-ink-400"><span className="mr-1 inline-block size-2.5 rounded-sm ring-1 ring-white/20" style={{ background: h }} />{n}</th>)}</tr></thead>
          <tbody>
            {FG.map(([fn, fh], i) => (
              <tr key={fn}>
                <td className="pr-2 font-bold"><span className="mr-1.5 inline-block size-2.5 rounded-full" style={{ background: fh }} />{fn}</td>
                {BG.map(([bn, bh], j) => {
                  const c = contrast(fh, bh);
                  const lvl = c >= 7 ? "AAA" : c >= 4.5 ? "AA" : c >= 3 ? "AA+" : "✕";
                  return (
                    <td key={bn}>
                      <button onClick={() => { tap("tick"); setSel([i, j]); }} className={cn("w-full rounded-lg px-2 py-2 text-left transition-transform hover:-translate-y-0.5", sel[0] === i && sel[1] === j && "ring-2 ring-white")} style={{ background: bh, color: fh }}>
                        <span className="font-mono font-bold">{c.toFixed(1)}</span> <span className={cn("ml-1 rounded px-1 text-[9px] font-black", lvl === "AAA" ? "bg-bull/25" : lvl === "AA" ? "bg-sky/25" : lvl === "AA+" ? "bg-gold/25" : "bg-bear/30")}>{lvl}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-[10px] text-ink-500">AAA ≥ 7 · AA ≥ 4.5 · AA+ ≥ 3 (только крупный текст и иконки)</div>
      </div>
      <div className="flex flex-col justify-center rounded-2xl p-5 ring-1 ring-white/10" style={{ background: BG[sel[1]][1] }}>
        <div className="font-display text-2xl font-black" style={{ color: FG[sel[0]][1] }}>Aa 67 412</div>
        <div className="mt-1 text-sm font-semibold" style={{ color: FG[sel[0]][1] }}>Стоп-лосс ограничивает убыток.</div>
        <div className="mt-3 font-mono text-3xl font-bold text-white">{r.toFixed(2)}:1</div>
        <div className="mt-2 flex gap-1.5">
          <Chip tone={r >= 4.5 ? "bull" : "bear"}>AA текст {r >= 4.5 ? "✓" : "✕"}</Chip>
          <Chip tone={r >= 7 ? "bull" : "ink"}>AAA {r >= 7 ? "✓" : "✕"}</Chip>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Y03 — Sound & haptic lab ═══════════════ */
export function SoundLab() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [hp, setHp] = useState<string | null>(null);
  const play = (k: Sfx) => { sfx(k); setPlaying(k); setTimeout(() => setPlaying((p) => (p === k ? null : p)), 500); };
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <Label>Звуки · WebAudio синтез, 0 КБ ассетов</Label>
        <div className="grid grid-cols-3 gap-2">
          {SFX_LIST.map((x) => (
            <button key={x.k} onClick={() => play(x.k)} className={cn("tile3d flex flex-col items-center gap-1.5 py-3", playing === x.k && "text-sky")} data-state={playing === x.k ? "selected" : undefined}>
              <div className="flex h-6 items-end gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-1 rounded-full bg-current" style={{ height: `${30 + ((i * 29 + x.k.length * 13) % 70)}%`, animation: playing === x.k ? `wave .35s ease-in-out ${i * 0.05}s infinite` : "none", transformOrigin: "bottom" }} />)}
              </div>
              <span className="font-mono text-[10px] font-bold">{x.k}</span>
              <span className="text-[9px] text-ink-400">{x.d}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Вибро-словарь · паттерн в мс</Label>
        <div className="space-y-2">
          {Object.entries(HAPTICS).map(([k, v]) => {
            const total = v.p.reduce((a, b) => a + b, 0);
            let acc = 0;
            return (
              <button key={k} onClick={() => { haptic(v.p); tap("tick", 0); setHp(k); setTimeout(() => setHp(null), total + 200); }} className={cn("flex w-full items-center gap-3 rounded-xl bg-ink-850 px-3 py-2 text-left transition-colors hover:bg-ink-800", hp === k && "ring-2 ring-bull")}>
                <div className="w-24"><div className="font-mono text-[11px] font-bold">{k}</div><div className="text-[9px] leading-tight text-ink-400">{v.d}</div></div>
                <div className="relative h-5 flex-1 rounded-md bg-ink-900">
                  {v.p.map((ms, i) => {
                    const left = (acc / total) * 100; acc += ms;
                    return i % 2 === 0 ? <span key={i} className={cn("absolute inset-y-1 rounded-sm bg-bull", hp === k && "animate-pulse")} style={{ left: `${left}%`, width: `${Math.max(3, (ms / total) * 100)}%` }} /> : null;
                  })}
                </div>
                <span className="w-10 text-right font-mono text-[10px] text-ink-400">{total}ms</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Y04 — Touch targets & keyboard ═══════════════ */
export function TouchTargets() {
  const [show, setShow] = useState(true);
  const items = [
    { t: "Иконка 20px", w: 20, ok: false },
    { t: "Кнопка 40px", w: 40, ok: false },
    { t: "Кнопка 48px", w: 48, ok: true },
    { t: "Тайл 56px", w: 56, ok: true },
  ];
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <div className="flex items-center justify-between"><Label className="mb-0">Минимум 44×44 (Apple) / 48×48 (Material)</Label><Toggle on={show} onChange={setShow} tone="sky" label="Показать зоны" /></div>
        <div className="well mt-3 flex items-end justify-around p-6">
          {items.map((it) => (
            <div key={it.t} className="flex flex-col items-center gap-2">
              <div className="relative flex size-14 items-center justify-center">
                {show && <span className={cn("absolute rounded-lg border-2 border-dashed", it.ok ? "border-bull bg-bull/10" : "border-bear bg-bear/10")} style={{ width: Math.max(44, it.w), height: Math.max(44, it.w) }} />}
                <button onClick={() => tap()} className="relative flex items-center justify-center rounded-lg bg-sky text-white shadow-[0_3px_0_var(--color-sky-d)]" style={{ width: it.w, height: it.w }} aria-label={it.t}><Icon name="plus" size={Math.min(20, it.w - 4)} /></button>
              </div>
              <span className={cn("text-[10px] font-bold", it.ok ? "text-bull" : "text-bear")}>{it.t}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-ink-400">Маленькие иконки получают невидимую зону касания (padding / hitSlop).</div>
      </div>
      <div>
        <Label>Клавиатура · работает во всём каталоге</Label>
        <div className="panel-soft divide-y divide-white/5">
          {[["Ctrl K", "Командная палитра"], ["/", "Фокус на поиск"], ["Tab", "Переход по элементам (видимый фокус)"], ["Space / Enter", "Нажать · удерживать для hold-to-confirm"], ["← →", "Свайп-колода и скоростной раунд"], ["↑ ↓", "Двигать SL / TP на графике"], ["Esc", "Закрыть палитру и модалки"]].map(([k, d]) => (
            <div key={k} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex gap-1">{k.split(" ").map((x) => <kbd key={x} className="rounded-md border-b-2 border-ink-900 bg-ink-700 px-2 py-0.5 font-mono text-[11px] font-bold">{x}</kbd>)}</span>
              <span className="flex-1 text-right text-[12px] text-ink-300">{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
