import { useMemo, useState } from "react";
import { Btn, Chip, Label, Segmented } from "../components/ui";
import { CoinArt } from "../components/art";
import { HourglassArt } from "../components/art2";
import { useCountdown } from "../lib/gestures";
import { tap, sfx, fmt } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   T08–T09 — Симулятор PnL и пульс фандинга.
   ═══════════════════════════════════════════════════════════════════ */

/* ── T08 · Симулятор сделки: что если? ── */
export function PnlSim() {
  const [side, setSide] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState(67000);
  const [exit, setExit] = useState(69500);
  const [size, setSize] = useState(1000);
  const [lev, setLev] = useState(5);
  const [fee, setFee] = useState(0.05);
  const dir = side === "long" ? 1 : -1;
  const chg = ((exit - entry) / entry) * dir;
  const gross = size * lev * chg;
  const fees = size * lev * (fee / 100) * 2;
  const net = gross - fees;
  const roe = (net / size) * 100;
  const liq = side === "long" ? entry * (1 - 0.9 / lev) : entry * (1 + 0.9 / lev);
  const dead = side === "long" ? exit <= liq : exit >= liq;
  const shown = dead ? -size : net;
  const curve = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i <= 24; i++) {
      const px = entry * (1 + dir * (-0.06 + (i / 24) * 0.14));
      const g = size * lev * (((px - entry) / entry) * dir);
      const deadAt = side === "long" ? px <= liq : px >= liq;
      pts.push(deadAt ? -size : g - fees);
    }
    return pts;
  }, [entry, size, lev, fees, dir, side, liq]);
  const cMin = Math.min(...curve), cMax = Math.max(...curve);
  const W = 300, H = 110;
  const X = (i: number) => (i / (curve.length - 1)) * W;
  const Y = (v: number) => 6 + (1 - (v - cMin) / (cMax - cMin || 1)) * (H - 12);
  const zeroY = Y(Math.max(cMin, Math.min(cMax, 0)));
  const exitI = Math.round(((exit / entry - 1) * dir + 0.06) / 0.14 * 24);
  const Slider = ({ label, v, min, max, step, fmtF, set }: { label: string; v: number; min: number; max: number; step: number; fmtF: (v: number) => string; set: (v: number) => void }) => (
    <div>
      <div className="flex justify-between"><Label className="mb-1">{label}</Label><span className="font-mono text-[12px] font-bold">{fmtF(v)}</span></div>
      <div className="relative">
        <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
        <div className="absolute left-0 top-[11px] h-3 rounded-full bg-sky" style={{ width: `${((v - min) / (max - min)) * 100}%` }} />
        <input type="range" className="rng relative" min={min} max={max} step={step} value={v} aria-label={label} onChange={(e) => { sfx("tick"); set(+e.target.value); }} />
      </div>
    </div>
  );
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-4">
        <Segmented value={side} onChange={setSide} options={[
          { v: "long", label: "Long ↑", tone: "bg-bull shadow-[0_3px_0_var(--color-bull-d)]" },
          { v: "short", label: "Short ↓", tone: "bg-bear shadow-[0_3px_0_var(--color-bear-d)]" },
        ]} />
        <Slider label="Вход" v={entry} min={60000} max={74000} step={100} fmtF={(v) => fmt(v, 0)} set={setEntry} />
        <Slider label="Выход" v={exit} min={60000} max={76000} step={100} fmtF={(v) => fmt(v, 0)} set={setExit} />
        <div className="grid grid-cols-3 gap-3">
          <Slider label="Маржа $" v={size} min={100} max={5000} step={50} fmtF={(v) => String(v)} set={setSize} />
          <div>
            <Label>Плечо</Label>
            <div className="grid grid-cols-4 gap-1">
              {[1, 3, 5, 10, 20, 25, 50, 100].map((l) => (
                <button key={l} onClick={() => { tap("tick"); setLev(l); }} className={cn("rounded-lg py-1.5 font-mono text-[10px] font-bold", lev === l ? "bg-gold text-ink-900" : "bg-ink-850 text-ink-300")}>{l}x</button>
              ))}
            </div>
          </div>
          <Slider label="Комиссия %" v={fee} min={0} max={0.2} step={0.01} fmtF={(v) => v.toFixed(2)} set={setFee} />
        </div>
        <div className="well relative overflow-hidden p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-28 w-full" preserveAspectRatio="none">
            <polygon points={`0,${zeroY} ${curve.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} ${W},${zeroY}`} fill={shown >= 0 ? "#2BE38B" : "#FF4D6D"} opacity=".15" />
            <polyline points={curve.map((v, i) => `${X(i)},${Y(v)}`).join(" ")} fill="none" stroke={shown >= 0 ? "#2BE38B" : "#FF4D6D"} strokeWidth="2.5" />
            <line x1="0" x2={W} y1={zeroY} y2={zeroY} stroke="#fff" strokeOpacity=".3" strokeDasharray="3 3" />
            {exitI >= 0 && exitI < curve.length && <circle cx={X(exitI)} cy={Y(curve[exitI])} r="4.5" fill="#fff" stroke={shown >= 0 ? "#2BE38B" : "#FF4D6D"} strokeWidth="2.5" />}
          </svg>
          <div className="flex justify-between px-1 font-mono text-[9px] text-ink-500"><span>−6%</span><span>цена выхода →</span><span>+8%</span></div>
        </div>
      </div>
      <div className={cn("flex flex-col items-center justify-center rounded-3xl p-5 text-center ring-1", dead ? "bg-bear/15 ring-bear/40" : shown >= 0 ? "bg-bull/10 ring-bull/30" : "bg-bear/10 ring-bear/30")}>
        <CoinArt size={44} />
        <div className="mt-1 text-[10px] font-black uppercase text-ink-400">Чистый результат</div>
        <div key={shown} className={cn("font-mono text-3xl font-bold tabular-nums animate-pop", dead || shown < 0 ? "text-bear" : "text-bull")}>
          {dead ? "ЛИКВИДАЦИЯ" : `${shown >= 0 ? "+" : "−"}$${fmt(Math.abs(shown))}`}
        </div>
        {!dead && <div className={cn("font-mono text-sm font-bold", roe >= 0 ? "text-bull" : "text-bear")}>ROE {roe >= 0 ? "+" : ""}{roe.toFixed(1)}%</div>}
        <div className="mt-3 w-full space-y-1 font-mono text-[10px]">
          <div className="flex justify-between"><span className="text-ink-400">Комиссии</span><span>−${fmt(fees)}</span></div>
          <div className="flex justify-between"><span className="text-ink-400">Ликвидация</span><span className="text-flame">{fmt(liq, 0)}</span></div>
          <div className="flex justify-between"><span className="text-ink-400">Позиция</span><span>${fmt(size * lev, 0)}</span></div>
        </div>
        {dead && <Chip tone="bear" className="mt-3">цена прошла ликвидацию</Chip>}
        <Btn s="xs" v="ghost" className="mt-3" onClick={() => { setSide("long"); setEntry(67000); setExit(69500); setSize(1000); setLev(5); setFee(0.05); }}>Сброс</Btn>
      </div>
    </div>
  );
}

/* ── T09 · Фандинг и соотношение лонг/шорт ── */
const FUND_HIST = [0.012, 0.008, 0.021, 0.035, 0.028, 0.041, 0.033, 0.05];
const RATIO_HIST = [52, 55, 58, 61, 57, 63, 66, 64];

export function FundingPulse() {
  const cd = useCountdown(5 * 3600 * 1000 + 22 * 60000);
  const [i, setI] = useState(FUND_HIST.length - 1);
  const rate = FUND_HIST[i];
  const longs = RATIO_HIST[i];
  const hot = rate >= 0.04;
  const ang = -90 + (longs / 100) * 180;
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="panel-soft p-4 text-center">
        <div className="flex items-center justify-center gap-2"><HourglassArt size={30} /><span className="font-display text-xs font-black uppercase">Фандинг · 8ч</span></div>
        <div className={cn("mt-2 font-mono text-3xl font-bold tabular-nums", rate >= 0.03 ? "text-bear" : rate >= 0.01 ? "text-gold" : "text-bull")}>
          {rate >= 0 ? "+" : ""}{rate.toFixed(3)}%
        </div>
        <div className="text-[11px] text-ink-400">{hot ? "Лонги перегреты — шортисты получают выплаты" : rate >= 0.01 ? "Умеренный перекос в лонги" : "Нейтрально"}</div>
        <div className="mt-3 flex items-end justify-center gap-1.5">
          {FUND_HIST.map((v, k) => (
            <button key={k} onClick={() => { tap("tick"); setI(k); }} aria-label={`Период ${k + 1}`}
              className={cn("w-7 rounded-t-md transition-all", k === i ? "ring-2 ring-white" : "opacity-70 hover:opacity-100")}
              style={{ height: `${(v / 0.055) * 64}px`, background: v >= 0.04 ? "#FF4D6D" : v >= 0.02 ? "#FFC940" : "#2BE38B" }} />
          ))}
        </div>
        <div className="mt-2 font-mono text-[11px] text-ink-400">следующее списание через <b className="text-white">{cd.text}</b></div>
      </div>
      <div className="panel-soft p-4 text-center">
        <div className="font-display text-xs font-black uppercase">Лонг / Шорт</div>
        <svg viewBox="0 0 200 112" className="mx-auto mt-1 w-full max-w-[230px]">
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#1b305c" strokeWidth="18" strokeLinecap="round" />
          <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="url(#ls)" strokeWidth="18" strokeLinecap="round" strokeDasharray="252" strokeDashoffset={252 * (1 - longs / 100)} style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)" }} />
          <defs><linearGradient id="ls"><stop offset="0" stopColor="#FF4D6D" /><stop offset="1" stopColor="#2BE38B" /></linearGradient></defs>
          <g style={{ transform: `rotate(${ang}deg)`, transformOrigin: "100px 100px", transition: "transform .6s cubic-bezier(.34,1.56,.64,1)" }}>
            <path d="M97.5 100 L100 34 L102.5 100 Z" fill="#fff" />
          </g>
          <circle cx="100" cy="100" r="9" fill="#DFE7FA" stroke="#081229" strokeWidth="3" />
        </svg>
        <div className="-mt-1 font-display text-2xl font-black tabular-nums"><span className="text-bull">{longs}%</span><span className="text-ink-500"> / </span><span className="text-bear">{100 - longs}%</span></div>
        <div className="text-[11px] text-ink-400">{longs >= 60 ? "Толпа в лонгах — осторожно" : longs <= 40 ? "Толпа в шортах — возможный шорт-сквиз" : "Баланс сил"}</div>
        <div className="mt-2 flex justify-center gap-1.5">
          <Btn s="xs" v="ink" onClick={() => setI(Math.max(0, i - 1))}>←</Btn>
          <span className="px-2 py-1 font-mono text-[11px] text-ink-400">период {i + 1}/8</span>
          <Btn s="xs" v="ink" onClick={() => setI(Math.min(FUND_HIST.length - 1, i + 1))}>→</Btn>
        </div>
      </div>
    </div>
  );
}
