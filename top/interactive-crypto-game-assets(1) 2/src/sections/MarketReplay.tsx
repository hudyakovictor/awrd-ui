/* 49 · MARKET REPLAY — cinematic session replayer.
   Scrub + speed + events + masked future in one theater. */
import { motion } from "framer-motion";
import { Eye, EyeOff, Pause, Play, StepBack, StepForward } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { candlesRange, genCandles, pctChange, type Regime } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const SESSIONS: { id: string; label: string; regime: Regime; color: string }[] = [
  { id: "asia", label: "Asia · calm", regime: "calm", color: "#8ea6d8" },
  { id: "eu", label: "EU · trend", regime: "trend", color: "#2ede8a" },
  { id: "us", label: "US · volatile", regime: "volatile", color: "#ffc531" },
  { id: "news", label: "News · crash", regime: "crash", color: "#ff5470" },
];

const EVENTS = [
  { at: 0.18, t: "Open drive", d: "Импульс на открытии сессии" },
  { at: 0.42, t: "Liquidity sweep", d: "Сбор стопов под лоем" },
  { at: 0.66, t: "Reclaim", d: "Возврат в диапазон" },
  { at: 0.85, t: "Expansion", d: "Расширение диапазона" },
];

export default function MarketReplay() {
  const [session, setSession] = useState("us");
  const [seed, setSeed] = useState(12);
  const [cursor, setCursor] = useState(30);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<"0.5" | "1" | "2" | "4">("1");
  const [masked, setMasked] = useState(true);
  const timer = useRef<number | null>(null);

  const ses = SESSIONS.find((s) => s.id === session) ?? SESSIONS[2];
  const candles = useMemo(() => genCandles(seed + session.length * 5, 110, 100, ses.regime, 60_000), [seed, session, ses.regime]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);
  const W = 680, H = 250;
  const y = (v: number) => 12 + (1 - (v - min) / (max - min || 1)) * (H - 34);
  const bw = W / candles.length;

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setCursor((c) => (c + 1 >= candles.length ? 0 : c + 1));
    }, Math.max(120, 550 / Number(speed)));
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing, speed, candles.length]);

  useEffect(() => { setCursor(30); }, [session, seed]);

  const cur = candles[cursor];
  const ret = pctChange(candles[0].o, cur.c);
  const nearEv = EVENTS.reduce((b, e, i) => (Math.abs(e.at * (candles.length - 1) - cursor) < Math.abs(EVENTS[b].at * (candles.length - 1) - cursor) ? i : b), 0);

  const jumpEv = (i: number) => {
    setCursor(Math.floor(EVENTS[i].at * (candles.length - 1)));
    setPlaying(false);
    sfx.pop();
  };

  return (
    <ShowcaseSection
      id="replay" index="49" kicker="Market Replay" title="Кинотеатр сессии"
      desc="Одна сцена: большой график, транспорт, скорость, события и маска будущего. Выбирай сессию — характер плёнки меняется."
      accent={ses.color}
      tags={<div className="flex gap-2"><Tag tone="gold">{ses.label}</Tag><Tag tone={ret >= 0 ? "green" : "red"}>{ret >= 0 ? "+" : ""}{ret.toFixed(2)}%</Tag></div>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {SESSIONS.map((s) => (
          <button key={s.id} onClick={() => { setSession(s.id); sfx.tick(); }}
            className={cn("rounded-xl border px-3.5 py-2 text-[11px] font-extrabold transition", session === s.id ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-[#8ea6d8]")}
            style={session === s.id ? { boxShadow: `0 0 16px ${s.color}55` } : undefined}
          >
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label}
          </button>
        ))}
        <button onClick={() => { setSeed((s) => s + 1); sfx.whoosh(); }} className="btn3d btn3d-ghost ml-auto px-3 py-1.5 text-[10px]">New film</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
        <ScenePanel title={`${ses.label} · replay`} sub={masked ? "Будущее за шторкой" : "Вся плёнка видна"} accent={ses.color}
          right={
            <button onClick={() => { setMasked((v) => !v); sfx.pop(); }} className={cn("btn3d px-3 py-1.5 text-[10px]", masked ? "btn3d-gold" : "btn3d-ghost")}>
              {masked ? <EyeOff size={13} /> : <Eye size={13} />} {masked ? "Masked" : "Open"}
            </button>
          }
        >
          <div className="panel-inset relative overflow-hidden p-2" style={{ boxShadow: `inset 0 3px 10px rgba(0,0,0,.7), 0 0 50px ${ses.color}22` }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              {candles.map((c, i) => {
                const future = i > cursor;
                const up = c.c >= c.o;
                const col = up ? "#2ede8a" : "#ff5470";
                const x = i * bw + bw * 0.2, w = bw * 0.6;
                return (
                  <g key={i} opacity={future ? (masked ? 0.1 : 0.35) : 1} filter={future && masked ? "blur(1.5px)" : undefined}>
                    <line x1={x + w / 2} x2={x + w / 2} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth={1.1} />
                    <rect x={x} y={y(Math.max(c.o, c.c))} width={w} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} rx={1} fill={col} />
                  </g>
                );
              })}
              {EVENTS.map((e, i) => {
                const ex = e.at * W;
                const past = e.at * (candles.length - 1) <= cursor;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => jumpEv(i)} opacity={masked && !past ? 0.25 : 1}>
                    <line x1={ex} x2={ex} y1={0} y2={H} stroke={ses.color} strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
                    <circle cx={ex} cy={14} r={i === nearEv ? 8 : 5.5} fill={ses.color} stroke="#fff" strokeWidth={2} />
                    <text x={ex} y={17.5} textAnchor="middle" fontSize={8.5} fontWeight={900} fill="#081130">{i + 1}</text>
                  </g>
                );
              })}
              <line x1={cursor * bw + bw / 2} x2={cursor * bw + bw / 2} y1={0} y2={H} stroke="#fff" strokeWidth={1.8} />
              <circle cx={cursor * bw + bw / 2} cy={y(cur.c)} r={5.5} fill={ses.color} stroke="#fff" strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 10px ${ses.color})` }} />
            </svg>
            <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur">
              BAR {cursor + 1}/{candles.length} · C {cur.c.toFixed(1)}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3">
            <input type="range" min={0} max={candles.length - 1} value={cursor}
              onChange={(e) => { setCursor(+e.target.value); setPlaying(false); }}
              className="lever w-full" style={{ ["--fill" as string]: `${(cursor / (candles.length - 1)) * 100}%` }} />
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button onClick={() => setCursor((c) => Math.max(0, c - 1))} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><StepBack size={16} /></button>
              <button onClick={() => { setPlaying((p) => !p); sfx.tap(); }} className="btn3d btn3d-green h-11 w-14 !rounded-2xl">{playing ? <Pause size={17} /> : <Play size={17} />}</button>
              <button onClick={() => setCursor((c) => Math.min(candles.length - 1, c + 1))} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><StepForward size={16} /></button>
              <div className="ml-auto"><Seg options={["0.5", "1", "2", "4"] as const} value={speed} onChange={setSpeed} accent={ses.color} /></div>
            </div>
          </div>
        </ScenePanel>

        <div className="space-y-3">
          <ScenePanel title="Now" sub="Текущий кадр" accent={ses.color}>
            <div className="grid grid-cols-2 gap-2">
              <SceneStat label="Return" value={`${ret >= 0 ? "+" : ""}${ret.toFixed(2)}%`} color={ret >= 0 ? "#2ede8a" : "#ff5470"} />
              <SceneStat label="Progress" value={`${Math.round((cursor / (candles.length - 1)) * 100)}%`} color="#fff" />
            </div>
          </ScenePanel>
          <ScenePanel title="Chapters" sub="Клик — прыжок" accent="#5b8cff">
            <div className="space-y-1.5">
              {EVENTS.map((e, i) => {
                const done = e.at * (candles.length - 1) <= cursor;
                return (
                  <button key={i} onClick={() => jumpEv(i)}
                    className={cn("flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition", i === nearEv ? "border-white/40 bg-white/8" : "border-white/8 bg-black/25")}>
                    <span className="num-mono flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black"
                      style={{ background: done ? ses.color : "rgba(255,255,255,.08)", color: done ? "#081130" : "#7d92c4" }}>{i + 1}</span>
                    <span className="flex-1">
                      <span className="block text-xs font-extrabold text-white">{e.t}</span>
                      <span className="block text-[10px] text-[#8ea6d8]">{e.d}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <motion.div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/50">
              <motion.div className="h-full rounded-full" style={{ background: ses.color }} initial={false} animate={{ width: `${(cursor / (candles.length - 1)) * 100}%` }} />
            </motion.div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
