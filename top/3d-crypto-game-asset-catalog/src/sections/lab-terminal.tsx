import { useEffect, useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Label, Segmented, Toggle, Bar } from "../components/ui";
import { tap, sfx, haptic, useInterval, notify } from "../lib/fx";
import { CandleSpark, LabChart, RegimeBadge, fmtP, genCandles, macd, rsi, sma, type Candle, type Regime } from "../labs/engine";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   TL01 · TRADING TERMINAL PRO — терминал как живой организм.
   Активы · таймфреймы · play/скорость · позиция с живым PnL ·
   состояние терминала меняется целиком.
   ═══════════════════════════════════════════════════════════════════ */

const ASSETS = [
  { k: "BTC", base: 67400, vol: 1, hex: "#F7931A", seed: 11 },
  { k: "ETH", base: 3520, vol: 1.25, hex: "#8C9EFF", seed: 27 },
  { k: "SOL", base: 172, vol: 1.7, hex: "#2BE3C8", seed: 43 },
] as const;
type AssetK = (typeof ASSETS)[number]["k"];
const TFS = [
  { k: "1m", n: 64, vol: 0.7 }, { k: "5m", n: 56, vol: 1 },
  { k: "15m", n: 48, vol: 1.35 }, { k: "1h", n: 40, vol: 1.8 },
] as const;

export function TerminalPro() {
  const [asset, setAsset] = useState<AssetK>("BTC");
  const [tf, setTf] = useState<(typeof TFS)[number]["k"]>("5m");
  const [regime, setRegime] = useState<Regime>("trend-up");
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [ma, setMa] = useState(true);
  const [vol, setVol] = useState(true);
  const [data, setData] = useState<Candle[]>([]);
  const [hov, setHov] = useState<number | null>(null);
  const [balance, setBalance] = useState(10000);
  const [equity, setEquity] = useState<number[]>([10000]);
  // позиция
  const [side, setSide] = useState<"long" | "short">("long");
  const [size, setSize] = useState(500);
  const [lev, setLev] = useState(5);
  const [slPct, setSlPct] = useState(1.5);
  const [tpPct, setTpPct] = useState(3);
  const [pos, setPos] = useState<{ entry: number; sl: number; tp: number; side: "long" | "short"; size: number; lev: number } | null>(null);

  const A = ASSETS.find((a) => a.k === asset)!;
  const T = TFS.find((t) => t.k === tf)!;

  // регенерация при смене актива/ТФ/режима
  useEffect(() => {
    setData(genCandles(A.seed + T.n * 7 + regime.length * 131, T.n, A.base, regime, A.vol * T.vol));
    setPos(null);
    setHov(null);
  }, [asset, tf, regime]); // eslint-disable-line react-hooks/exhaustive-deps

  // живой тик
  useInterval(() => {
    setData((d) => {
      if (!d.length) return d;
      const nd = [...d];
      const last = { ...nd[nd.length - 1] };
      const shock = (Math.random() - 0.49) * 0.0035 * A.vol * T.vol * speed;
      last.c = Math.max(1, last.c * (1 + shock));
      last.h = Math.max(last.h, last.c);
      last.l = Math.min(last.l, last.c);
      last.v += Math.random() * 0.4;
      nd[nd.length - 1] = last;
      if (Math.random() < 0.16 * speed) {
        const o = last.c;
        const c = o * (1 + (Math.random() - 0.49) * 0.004 * A.vol);
        nd.push({ o, c, h: Math.max(o, c) * 1.001, l: Math.min(o, c) * 0.999, v: 0.6 + Math.random() });
        nd.shift();
      }
      return nd;
    });
  }, playing ? Math.max(120, 550 - speed * 110) : null);

  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const chg = last && prev ? ((last.c - prev.c) / prev.c) * 100 : 0;

  // живой PnL позиции + авто-закрытия
  const pnl = useMemo(() => {
    if (!pos || !last) return null;
    const dir = pos.side === "long" ? 1 : -1;
    const gross = pos.size * pos.lev * (((last.c - pos.entry) / pos.entry) * dir);
    const liq = pos.side === "long" ? pos.entry * (1 - 0.9 / pos.lev) : pos.entry * (1 + 0.9 / pos.lev);
    const hitSl = pos.side === "long" ? last.l <= pos.sl : last.h >= pos.sl;
    const hitTp = pos.side === "long" ? last.h >= pos.tp : last.l <= pos.tp;
    const hitLiq = pos.side === "long" ? last.l <= liq : last.h >= liq;
    return { gross, liq, hitSl, hitTp, hitLiq };
  }, [pos, last]);

  // авто-закрытие по SL/TP/LIQ — меняет баланс и эквити
  useEffect(() => {
    if (!pos || !pnl) return;
    if (pnl.hitLiq || pnl.hitSl || pnl.hitTp) {
      const res = pnl.hitLiq ? -pos.size : pnl.hitTp
        ? pos.size * pos.lev * (Math.abs(pos.tp - pos.entry) / pos.entry)
        : -pos.size * pos.lev * (Math.abs(pos.sl - pos.entry) / pos.entry);
      const kind = pnl.hitLiq ? "ЛИКВИДАЦИЯ" : pnl.hitTp ? "ТЕЙК +$" + Math.round(res) : "СТОП " + Math.round(res);
      setBalance((b) => Math.max(0, b + res));
      setEquity((e) => [...e.slice(-39), Math.max(0, (e[e.length - 1] ?? 10000) + res)]);
      notify(pnl.hitLiq ? "Ликвидация! Позиция закрыта" : pnl.hitTp ? `Тейк-профит ${kind}` : `Стоп-лосс ${kind}`, pnl.hitTp ? "success" : "error");
      (pnl.hitTp ? sfx("levelup") : sfx("error"), haptic(pnl.hitTp ? [10, 30, 10] : [40, 30, 40]));
      setPos(null);
    }
  }, [pnl, pos]);

  const openPos = () => {
    if (!last || pos) return;
    const entry = last.c;
    const sl = side === "long" ? entry * (1 - slPct / 100) : entry * (1 + slPct / 100);
    const tp = side === "long" ? entry * (1 + tpPct / 100) : entry * (1 - tpPct / 100);
    setPos({ entry, sl, tp, side, size, lev });
    sfx("success"); haptic(15);
    notify(`${side === "long" ? "LONG" : "SHORT"} ${asset} · ${lev}x · $${size}`, "info");
  };
  const closeManual = () => {
    if (!pos || !pnl) return;
    setBalance((b) => Math.max(0, b + pnl.gross));
    setEquity((e) => [...e.slice(-39), Math.max(0, (e[e.length - 1] ?? 10000) + pnl.gross)]);
    notify(`Закрыто вручную ${pnl.gross >= 0 ? "+" : ""}$${Math.round(pnl.gross)}`, pnl.gross >= 0 ? "success" : "error");
    tap("whoosh");
    setPos(null);
  };

  const stateTone = !pos ? "flat" : pnl && (pnl.hitLiq ? true : false) ? "liq" : pnl && pnl.gross >= 0 ? "profit" : "loss";
  const stateStyle =
    stateTone === "profit" ? "from-bull/25 via-ink-850 to-ink-900 ring-bull/40"
    : stateTone === "loss" ? "from-bear/25 via-ink-850 to-ink-900 ring-bear/40"
    : "from-ink-750 via-ink-850 to-ink-900 ring-white/10";

  return (
    <div className={cn("overflow-hidden rounded-3xl bg-gradient-to-b p-4 ring-1 transition-colors duration-500 sm:p-5", stateStyle)}>
      {/* верхняя панель терминала */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {ASSETS.map((a) => (
            <button key={a.k} onClick={() => { tap("tick"); setAsset(a.k); }}
              className={cn("flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 font-display text-[11px] font-black transition-all", asset === a.k ? "text-ink-900" : "text-ink-300 hover:text-white")}
              style={asset === a.k ? { background: a.hex, boxShadow: "0 3px 0 rgba(0,0,0,.4)" } : undefined}>
              <span className="size-2 rounded-full" style={{ background: asset === a.k ? "#081229" : a.hex }} />{a.k}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-2xl bg-ink-950/60 p-1">
          {TFS.map((t) => (
            <button key={t.k} onClick={() => { tap("tick"); setTf(t.k); }}
              className={cn("rounded-xl px-2.5 py-1.5 font-mono text-[11px] font-bold", tf === t.k ? "bg-sky text-white" : "text-ink-400 hover:text-white")}>{t.k}</button>
          ))}
        </div>
        <RegimeBadge regime={regime} />
        <div className="ml-auto flex items-center gap-1.5">
          {[1, 2, 4].map((s) => (
            <button key={s} onClick={() => { tap("tick"); setSpeed(s); }} className={cn("rounded-lg px-2 py-1 font-mono text-[11px] font-bold", speed === s ? "bg-gold text-ink-900" : "bg-ink-800 text-ink-300")}>{s}x</button>
          ))}
          <button onClick={() => { tap(); setPlaying(!playing); }} aria-label={playing ? "Пауза" : "Старт"}
            className={cn("btn3d size-10 rounded-xl px-0", playing ? "v-bear" : "v-bull")}>
            <Icon name={playing ? "minus" : "play"} size={16} stroke={2.8} />
          </button>
        </div>
      </div>

      {/* цена + режимы рынка */}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black tabular-nums">{last ? fmtP(last.c, asset === "BTC" ? 0 : 2) : "—"}</span>
            <span className={cn("font-mono text-sm font-bold", chg >= 0 ? "text-bull" : "text-bear")}>{chg >= 0 ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%</span>
          </div>
          <div className="font-mono text-[10px] text-ink-500">{asset}/USDT · {tf} · спред 0.4 · фандинг +0.01%</div>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {(["trend-up", "range", "volatile", "breakout", "crash"] as Regime[]).map((r) => (
            <button key={r} onClick={() => { tap("tick"); setRegime(r); }}
              className={cn("rounded-lg px-2 py-1 text-[10px] font-bold", regime === r ? "bg-white text-ink-900" : "bg-ink-800 text-ink-400 hover:text-white")}>
              {r === "trend-up" ? "Тренд" : r === "range" ? "Флэт" : r === "volatile" ? "Пилы" : r === "breakout" ? "Пробой" : "Крах"}
            </button>
          ))}
        </div>
      </div>

      {/* график */}
      <div className="well relative mt-3 overflow-hidden p-1.5">
        {data.length > 0 && (
          <LabChart
            id="terminal" data={data} height={250} showMA={ma} showVol={vol}
            position={pos ? { entry: pos.entry, sl: pos.sl, tp: pos.tp, side: pos.side } : null}
            onHover={setHov}
          />
        )}
        {hov !== null && data[hov] && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-ink-950/85 px-2.5 py-1.5 font-mono text-[10px] backdrop-blur animate-fade">
            <span className="text-ink-400">O</span> <b>{fmtP(data[hov].o, 1)}</b>{" "}
            <span className="text-ink-400">H</span> <b className="text-bull">{fmtP(data[hov].h, 1)}</b>{" "}
            <span className="text-ink-400">L</span> <b className="text-bear">{fmtP(data[hov].l, 1)}</b>{" "}
            <span className="text-ink-400">C</span> <b>{fmtP(data[hov].c, 1)}</b>
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-1.5">
          <button onClick={() => { tap("tick"); setMa(!ma); }} className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-bold", ma ? "bg-violet text-white" : "bg-ink-800 text-ink-400")}>MA</button>
          <button onClick={() => { tap("tick"); setVol(!vol); }} className={cn("rounded-lg px-2 py-1 font-mono text-[10px] font-bold", vol ? "bg-sky text-white" : "bg-ink-800 text-ink-400")}>VOL</button>
        </div>
      </div>

      {/* панель позиции */}
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="rounded-2xl bg-ink-950/50 p-3 ring-1 ring-white/5">
          <div className="flex items-center gap-2">
            <Segmented value={side} onChange={setSide} options={[
              { v: "long", label: "Long ↑", tone: "bg-bull shadow-[0_3px_0_var(--color-bull-d)]" },
              { v: "short", label: "Short ↓", tone: "bg-bear shadow-[0_3px_0_var(--color-bear-d)]" },
            ]} />
            <div className="flex gap-1">
              {[1, 3, 5, 10, 25].map((l) => (
                <button key={l} onClick={() => { tap("tick"); setLev(l); }} className={cn("rounded-lg px-2 py-2 font-mono text-[11px] font-bold", lev === l ? "bg-gold text-ink-900" : "bg-ink-800 text-ink-300")}>{l}x</button>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <Label>Маржа ${size}</Label>
              <input type="range" min={100} max={2000} step={50} value={size} onChange={(e) => setSize(+e.target.value)} className="rng" aria-label="маржа" />
            </div>
            <div>
              <Label>Стоп {slPct}%</Label>
              <input type="range" min={0.5} max={5} step={0.25} value={slPct} onChange={(e) => setSlPct(+e.target.value)} className="rng" aria-label="стоп" />
            </div>
            <div>
              <Label>Тейк {tpPct}%</Label>
              <input type="range" min={1} max={10} step={0.5} value={tpPct} onChange={(e) => setTpPct(+e.target.value)} className="rng" aria-label="тейк" />
            </div>
          </div>
          {!pos ? (
            <Btn block s="md" v={side === "long" ? "bull" : "bear"} className="mt-3" icon={side === "long" ? "up" : "down"} onClick={openPos}>
              Открыть {side === "long" ? "Long" : "Short"} · ${size * lev} · {lev}x
            </Btn>
          ) : (
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-ink-900/70 p-2.5 ring-1 ring-white/10">
              <div className="flex-1">
                <div className="text-[11px] font-bold">{pos.side.toUpperCase()} {asset} · вход {fmtP(pos.entry, 1)}</div>
                <div className={cn("font-mono text-lg font-black tabular-nums", pnl && pnl.gross >= 0 ? "text-bull" : "text-bear")}>
                  {pnl ? `${pnl.gross >= 0 ? "+" : "−"}$${Math.abs(Math.round(pnl.gross))}` : "—"}
                </div>
              </div>
              <Btn s="sm" v="bear" onClick={closeManual}>Закрыть</Btn>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-ink-950/50 p-3 ring-1 ring-white/5">
          <div className="flex justify-between text-[11px]"><span className="text-ink-400">Баланс</span><b className="font-mono">${Math.round(balance).toLocaleString("ru-RU")}</b></div>
          <div className="flex items-end gap-1">
            <CandleSpark data={equity.map((v) => ({ o: v, h: v, l: v, c: v, v: 1 }))} w={200} h={46} hex={equity[equity.length - 1] >= 10000 ? "#2BE38B" : "#FF4D6D"} />
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="rounded-lg bg-ink-900 px-2 py-1.5"><div className="text-ink-500">позиция</div><b>{pos ? `$${pos.size * pos.lev}` : "—"}</b></div>
            <div className="rounded-lg bg-ink-900 px-2 py-1.5"><div className="text-ink-500">ликвидация</div><b className="text-flame">{pos && pnl ? fmtP(pnl.liq, 0) : "—"}</b></div>
          </div>
          <div className={cn("rounded-xl px-2.5 py-2 text-center font-display text-[10px] font-black uppercase tracking-wider", !pos ? "bg-ink-800 text-ink-300" : pnl && pnl.gross >= 0 ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear")}>
            {!pos ? "вне рынка · выбери сторону" : pnl && pnl.gross >= 0 ? "позиция в прибыли" : "позиция в убытке"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TL02 · INDICATOR LAB — переключатели реально меняют график.
   RSI / MACD / Объём / MA · ховер синхронизирует все панели.
   ═══════════════════════════════════════════════════════════════════ */

export function IndicatorLab() {
  const [seed, setSeed] = useState(7);
  const [regime, setRegime] = useState<Regime>("volatile");
  const [show, setShow] = useState({ rsi: true, macd: true, vol: true, ma: true });
  const [hov, setHov] = useState<number | null>(null);
  const data = useMemo(() => genCandles(seed, 72, 50000, regime, 1), [seed, regime]);
  const closes = data.map((d) => d.c);
  const R = useMemo(() => rsi(closes), [closes]);
  const M = useMemo(() => macd(closes), [closes]);
  const m20 = useMemo(() => sma(closes, 20), [closes]);
  const i = hov ?? data.length - 1;
  const c = data[i];
  const r = R[i];
  const panel = (on: boolean) => on;
  const W2 = 640, H2 = 90;

  const rsiY = (v: number) => 8 + (1 - v / 100) * (H2 - 16);
  const mMax = Math.max(...M.line.map(Math.abs), 1);
  const mY = (v: number) => H2 / 2 - (v / mMax) * (H2 / 2 - 10);
  const x = (k: number) => 8 + (k / (data.length - 1)) * (W2 - 16);

  const presets: { t: string; s: number; r: Regime }[] = [
    { t: "Тренд", s: 3, r: "trend-up" }, { t: "Разворот", s: 21, r: "crash" },
    { t: "Флэт", s: 9, r: "range" }, { t: "Пилы", s: 7, r: "volatile" },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-b from-ink-750 via-ink-850 to-ink-900 p-4 ring-1 ring-white/10 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p.t} onClick={() => { tap("tick"); setSeed(p.s); setRegime(p.r); }}
              className={cn("rounded-xl px-3 py-1.5 text-[12px] font-bold", seed === p.s && regime === p.r ? "bg-white text-ink-900" : "bg-ink-800 text-ink-300 hover:text-white")}>{p.t}</button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {([["rsi", "RSI", "#9A6BFF"], ["macd", "MACD", "#3D9BFF"], ["vol", "Объём", "#FFC940"], ["ma", "MA 20", "#2BE38B"]] as const).map(([k, t, hex]) => (
            <label key={k} className="flex cursor-pointer items-center gap-1.5 text-[11px] font-bold">
              <button role="switch" aria-checked={show[k]} aria-label={t} onClick={() => { tap("tick"); setShow((s) => ({ ...s, [k]: !s[k] })); }}
                className={cn("relative h-6 w-11 rounded-full transition-colors", show[k] ? "" : "bg-ink-700")}
                style={show[k] ? { background: hex } : undefined}>
                <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", show[k] && "translate-x-5")} />
              </button>
              <span style={{ color: show[k] ? hex : "#5b71a4" }}>{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* значения в точке ховера */}
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px] sm:grid-cols-6">
        {[
          ["C", fmtP(c.c, 0), "text-white"], ["Δ", `${c.c >= c.o ? "+" : ""}${(((c.c - c.o) / c.o) * 100).toFixed(2)}%`, c.c >= c.o ? "text-bull" : "text-bear"],
          ["MA20", m20[i] ? fmtP(m20[i]!, 0) : "—", show.ma ? "text-bull" : "text-ink-600"],
          ["RSI", r !== null ? r.toFixed(1) : "—", show.rsi ? (r !== null && r > 70 ? "text-bear" : r !== null && r < 30 ? "text-bull" : "text-violet") : "text-ink-600"],
          ["MACD", M.line[i].toFixed(0), show.macd ? (M.hist[i] >= 0 ? "text-bull" : "text-bear") : "text-ink-600"],
          ["VOL", c.v.toFixed(2), show.vol ? "text-gold" : "text-ink-600"],
        ].map(([k, v, cls]) => (
          <div key={k as string} className="well px-2 py-1.5"><span className="text-ink-500">{k} </span><b className={cn("tabular-nums", cls as string)}>{v}</b></div>
        ))}
      </div>

      <div className="well relative mt-2 overflow-hidden p-1.5">
        <LabChart id="ind" data={data} height={190} showMA={show.ma} showVol={show.vol} onHover={setHov} />
        {hov !== null && <div className="absolute left-3 top-3 rounded-lg bg-ink-950/80 px-2 py-1 font-mono text-[10px] text-ink-300">свеча #{hov + 1}</div>}
      </div>

      {panel(show.rsi) && (
        <div className="mt-2 rounded-2xl bg-ink-950/50 p-2 ring-1 ring-white/5">
          <div className="mb-1 flex items-center gap-2 px-1"><span className="font-display text-[10px] font-black uppercase text-violet">RSI 14</span>
            <span className={cn("ml-auto font-mono text-[11px] font-bold", r !== null && r > 70 ? "text-bear" : r !== null && r < 30 ? "text-bull" : "text-ink-300")}>
              {r !== null ? r.toFixed(1) : "—"} {r !== null && r > 70 ? "· перекуплен" : r !== null && r < 30 ? "· перепродан" : ""}
            </span>
          </div>
          <svg viewBox={`0 0 ${W2} ${H2}`} className="block h-[76px] w-full" preserveAspectRatio="none">
            <rect x="0" width={W2} y={rsiY(70)} height={rsiY(30) - rsiY(70)} fill="#2BE38B" opacity=".08" />
            <line x1="0" x2={W2} y1={rsiY(70)} y2={rsiY(70)} stroke="#FF4D6D" strokeDasharray="4 4" strokeOpacity=".7" />
            <line x1="0" x2={W2} y1={rsiY(30)} y2={rsiY(30)} stroke="#2BE38B" strokeDasharray="4 4" strokeOpacity=".7" />
            <polyline points={R.map((v, k) => (v === null ? "" : `${x(k)},${rsiY(v)}`)).filter(Boolean).join(" ")} fill="none" stroke="#9A6BFF" strokeWidth="2.2" strokeLinejoin="round" />
            {hov !== null && R[hov] !== null && <circle cx={x(hov)} cy={rsiY(R[hov]!)} r="4.5" fill="#fff" stroke="#9A6BFF" strokeWidth="2" />}
          </svg>
        </div>
      )}

      {panel(show.macd) && (
        <div className="mt-2 rounded-2xl bg-ink-950/50 p-2 ring-1 ring-white/5">
          <div className="mb-1 flex items-center gap-2 px-1"><span className="font-display text-[10px] font-black uppercase text-sky">MACD 12·26·9</span>
            <span className={cn("ml-auto font-mono text-[11px] font-bold", M.hist[i] >= 0 ? "text-bull" : "text-bear")}>hist {M.hist[i] >= 0 ? "+" : ""}{M.hist[i].toFixed(0)}</span>
          </div>
          <svg viewBox={`0 0 ${W2} ${H2}`} className="block h-[76px] w-full" preserveAspectRatio="none">
            <line x1="0" x2={W2} y1={H2 / 2} y2={H2 / 2} stroke="#4d69a8" strokeOpacity=".6" />
            {M.hist.map((v, k) => {
              const up = v >= 0;
              const hgt = Math.abs(v / mMax) * (H2 / 2 - 10);
              return <rect key={k} x={x(k) - 2} width="4" y={up ? H2 / 2 - hgt : H2 / 2} height={Math.max(1.5, hgt)} rx="1" fill={up ? "#2BE38B" : "#FF4D6D"} opacity={hov === k ? 1 : 0.65} />;
            })}
            <polyline points={M.line.map((v, k) => `${x(k)},${mY(v)}`).join(" ")} fill="none" stroke="#3D9BFF" strokeWidth="2" />
            {hov !== null && <circle cx={x(hov)} cy={mY(M.line[hov])} r="4" fill="#fff" stroke="#3D9BFF" strokeWidth="2" />}
          </svg>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-ink-400">
        <Toggle on={show.ma} tone="bull" label="MA" onChange={(v) => setShow((s) => ({ ...s, ma: v }))} />
        <span>Наведи на график — все панели покажут значения одной свечи</span>
        <Bar value={show.rsi && show.macd && show.vol && show.ma ? 100 : 50} tone="violet" h={8} className="ml-auto w-24" />
      </div>
    </div>
  );
}
