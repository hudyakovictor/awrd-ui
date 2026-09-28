/* 54 · CANDLE ANATOMY 3D — a candle you can hold.
   Orbit rotation · exploded view with OHLC planes · pattern morphs
   · live tick-by-tick formation with trace · auto classification. */
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, Rotate3d, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat, Seg } from "../showcase/Scene";
import { Box3D, clamp, Orbit, useSceneKeys } from "../showcase/fx";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type OHLC = { o: number; h: number; l: number; c: number };
const PRESETS: Record<string, OHLC> = {
  Hammer: { o: 42, c: 50, h: 52, l: 8 },
  "Shooting Star": { o: 50, c: 42, h: 92, l: 40 },
  Doji: { o: 50, c: 51, h: 82, l: 20 },
  "Bull Marubozu": { o: 18, c: 84, h: 85, l: 17 },
  "Bear Marubozu": { o: 84, c: 18, h: 85, l: 17 },
  "Spinning Top": { o: 46, c: 54, h: 78, l: 22 },
};
const K = 2.6; // px per unit

function classify(v: OHLC) {
  const body = Math.abs(v.c - v.o);
  const range = Math.max(0.01, v.h - v.l);
  const upper = v.h - Math.max(v.o, v.c);
  const lower = Math.min(v.o, v.c) - v.l;
  const bull = v.c >= v.o;
  if (body / range < 0.08) return { name: "Doji", bias: "neutral", note: "Нерешительность: открытие ≈ закрытию. Важен контекст уровня." };
  if (body / range > 0.88) return { name: bull ? "Bull Marubozu" : "Bear Marubozu", bias: bull ? "bull" : "bear", note: "Почти без теней — одна сторона доминировала всю свечу." };
  if (lower > body * 2 && upper < body * 0.6) return { name: bull ? "Hammer" : "Hanging Man", bias: bull ? "bull" : "bear", note: "Длинная нижняя тень: продавцы давили, покупатели вернули цену." };
  if (upper > body * 2 && lower < body * 0.6) return { name: bull ? "Inverted Hammer" : "Shooting Star", bias: bull ? "bull" : "bear", note: "Длинная верхняя тень: рост отвергнут у хая." };
  if (upper > body && lower > body) return { name: "Spinning Top", bias: "neutral", note: "Тени с обеих сторон — баланс сил." };
  return { name: bull ? "Bullish candle" : "Bearish candle", bias: bull ? "bull" : "bear", note: "Обычная направленная свеча без выраженного паттерна." };
}

export default function CandleAnatomy() {
  const [v, setV] = useState<OHLC>(PRESETS.Hammer);
  const [explode, setExplode] = useState(false);
  const [spin, setSpin] = useState(true);
  const [preset, setPreset] = useState("Hammer");
  const [building, setBuilding] = useState(false);
  const [trace, setTrace] = useState<number[]>([]);
  const [speed, setSpeed] = useState<"1" | "2" | "4">("1");
  const buildRef = useRef<{ p: number; n: number } | null>(null);

  const bull = v.c >= v.o;
  const color = bull ? "#2ede8a" : "#ff5470";
  const cls = classify(v);
  const bodyLo = Math.min(v.o, v.c);
  const bodyHi = Math.max(v.o, v.c);
  const gap = explode ? 26 : 0;

  const setField = (k: keyof OHLC, val: number) => {
    setPreset("Custom");
    setV((prev) => {
      const n = { ...prev, [k]: val };
      n.h = Math.max(n.h, n.o, n.c);
      n.l = Math.min(n.l, n.o, n.c);
      return n;
    });
  };

  const applyPreset = (name: string) => {
    setPreset(name);
    setV(PRESETS[name]);
    setTrace([]);
    sfx.pop();
  };

  const startBuild = () => {
    const o = 30 + Math.random() * 40;
    buildRef.current = { p: o, n: 0 };
    setV({ o, h: o, l: o, c: o });
    setTrace([o]);
    setBuilding(true);
    setPreset("Live");
    sfx.whoosh();
  };

  useEffect(() => {
    if (!building) return;
    const id = window.setInterval(() => {
      const b = buildRef.current;
      if (!b) return;
      b.n += 1;
      const drift = (Math.random() - 0.5) * 7 + Math.sin(b.n / 7) * 1.4;
      b.p = clamp(b.p + drift, 3, 97);
      setTrace((t) => [...t, b.p]);
      setV((prev) => ({ o: prev.o, c: b.p, h: Math.max(prev.h, b.p), l: Math.min(prev.l, b.p) }));
      if (b.n % 3 === 0) sfx.tick();
      if (b.n >= 60) {
        setBuilding(false);
        sfx.success();
      }
    }, 110 / Number(speed));
    return () => window.clearInterval(id);
  }, [building, speed]);

  const keys = useSceneKeys({
    Space: () => (building ? setBuilding(false) : startBuild()),
    e: () => setExplode((x) => !x),
    r: () => setSpin((x) => !x),
    "1": () => applyPreset("Hammer"),
    "2": () => applyPreset("Shooting Star"),
    "3": () => applyPreset("Doji"),
    "4": () => applyPreset("Bull Marubozu"),
  });

  const levels: { k: keyof OHLC; label: string; col: string }[] = [
    { k: "h", label: "HIGH", col: "#ffc531" },
    { k: bull ? "c" : "o", label: bull ? "CLOSE" : "OPEN", col: "#fff" },
    { k: bull ? "o" : "c", label: bull ? "OPEN" : "CLOSE", col: "#9db9ff" },
    { k: "l", label: "LOW", col: "#ff8ba0" },
  ];

  const upper = v.h - bodyHi;
  const lower = bodyLo - v.l;
  const range = Math.max(0.01, v.h - v.l);

  return (
    <ShowcaseSection
      id="anatomy" index="54" kicker="Candle Anatomy 3D" title="Свеча, которую можно держать в руках"
      desc="Объёмная свеча: вращай мышью, разбирай на части в exploded-виде с плоскостями уровней, морфи между паттернами или запусти живое формирование — тело и тени растут тик за тиком."
      accent="#ff8b3d" variant="floor"
      keys={[{ k: "Space", d: "live build" }, { k: "E", d: "explode" }, { k: "R", d: "spin" }, { k: "1–4", d: "паттерны" }]}
      moment="Запоминающийся момент: свеча собирается в 3D прямо на глазах, а распознавание меняет название на лету"
      tags={<div className="flex gap-2"><Tag tone={cls.bias === "bull" ? "green" : cls.bias === "bear" ? "red" : "gold"}>{cls.name}</Tag><Tag tone="ghost">{preset}</Tag></div>}
    >
      <div {...keys}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(PRESETS).map((p) => (
              <button key={p} onClick={() => applyPreset(p)}
                className={cn("rounded-lg px-3 py-1.5 text-[11px] font-extrabold transition", preset === p ? "bg-[#ff8b3d] text-[#2a1200]" : "bg-white/5 text-[#8ea6d8] hover:text-white")}>{p}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => { setExplode((x) => !x); sfx.whoosh(); }} className={cn("btn3d px-3 py-2 text-[10px]", explode ? "btn3d-gold" : "btn3d-ghost")}><Sparkles size={13} /> Explode</button>
            <button onClick={() => setSpin((x) => !x)} className={cn("btn3d px-3 py-2 text-[10px]", spin ? "btn3d-blue" : "btn3d-ghost")}><Rotate3d size={13} /> Spin</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
          <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,#2a1d4a,#060c24_70%)]" style={{ boxShadow: `inset 0 0 90px rgba(0,0,0,.55), 0 0 60px ${color}22` }}>
            <Orbit height={400} initial={{ x: -14, y: 32 }} autoSpin={spin && !building}>
              <div className="absolute left-1/2 top-[88%]" style={{ transformStyle: "preserve-3d" }}>
                {/* floor */}
                <div className="absolute" style={{
                  width: 360, height: 360, left: -180, top: -180, transform: "rotateX(90deg)", borderRadius: "50%",
                  background: `radial-gradient(circle, ${color}33, transparent 65%)`,
                  backgroundImage: `radial-gradient(circle, ${color}30, transparent 62%), linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)`,
                  backgroundSize: "100% 100%, 24px 24px, 24px 24px",
                }} />
                {/* lower wick */}
                <Box3D w={12} d={12} h={Math.max(1, lower * K)} bottom={v.l * K - gap} color="#cfd8f0" />
                {/* body */}
                <Box3D w={92} d={92} h={Math.max(4, (bodyHi - bodyLo) * K)} bottom={bodyLo * K} color={color} glow top={bull ? "#7dffc0" : "#ff9db0"} />
                {/* upper wick */}
                <Box3D w={12} d={12} h={Math.max(1, upper * K)} bottom={bodyHi * K + gap} color="#cfd8f0" />
                {/* level planes */}
                {explode && levels.map((lv) => (
                  <div key={lv.label} style={{ position: "absolute", left: 0, bottom: 0, transformStyle: "preserve-3d", transform: `translateY(${-(v[lv.k] * K + (lv.label === "HIGH" ? gap : lv.label === "LOW" ? -gap : 0))}px)`, transition: "transform .45s cubic-bezier(.22,1,.36,1)" }}>
                    <div style={{ position: "absolute", width: 230, height: 230, left: -115, top: -115, transform: "rotateX(90deg)", border: `1px solid ${lv.col}66`, background: `${lv.col}12`, borderRadius: 18 }} />
                    <div style={{ position: "absolute", left: 120, top: -10, transform: "translateZ(0px)", whiteSpace: "nowrap" }}>
                      <span className="rounded-md px-2 py-0.5 font-mono text-[11px] font-extrabold" style={{ background: lv.col, color: "#081130" }}>{lv.label} {v[lv.k].toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Orbit>
            <div className="pointer-events-none absolute left-3 top-3 space-y-1">
              <p className="display text-lg font-extrabold text-white">{cls.name}</p>
              <p className="text-[10px] font-bold text-[#8ea6d8]">drag — вращать · dbl-click — сброс</p>
            </div>
            <AnimatePresence>
              {building && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-extrabold text-[#ffd9a8] backdrop-blur"
                >
                  <span className="h-2 w-2 animate-ping rounded-full bg-[#ff8b3d]" /> forming · tick {trace.length}/61
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <ScenePanel title="Live formation" sub="Путь цены внутри одной свечи" accent="#ff8b3d"
              right={
                <div className="flex items-center gap-1.5">
                  <Seg options={["1", "2", "4"] as const} value={speed} onChange={setSpeed} accent="#ff8b3d" />
                </div>
              }
            >
              <div className="flex items-stretch gap-3">
                <svg viewBox="0 0 200 110" className="flex-1 rounded-xl border border-white/10 bg-black/30">
                  {[v.h, v.l].map((lv, k) => (
                    <line key={k} x1={0} x2={200} y1={105 - lv} y2={105 - lv} stroke={k ? "#ff8ba0" : "#ffc531"} strokeDasharray="3 4" opacity={0.6} />
                  ))}
                  <path
                    d={trace.map((p, i) => `${i ? "L" : "M"}${(i / 60) * 196 + 2},${105 - p}`).join(" ")}
                    fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round"
                  />
                  {trace.length > 0 && <circle cx={((trace.length - 1) / 60) * 196 + 2} cy={105 - trace[trace.length - 1]} r={4} fill="#fff" />}
                </svg>
                <svg viewBox="0 0 40 110" className="w-12 rounded-xl border border-white/10 bg-black/30">
                  <line x1={20} x2={20} y1={105 - v.h} y2={105 - v.l} stroke="#cfd8f0" strokeWidth={2} />
                  <rect x={9} y={105 - bodyHi} width={22} height={Math.max(2, bodyHi - bodyLo)} rx={3} fill={color} />
                </svg>
              </div>
              <button onClick={() => (building ? setBuilding(false) : startBuild())} className={cn("btn3d mt-3 w-full py-3 text-xs", building ? "btn3d-ghost" : "btn3d-gold")}>
                {building ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Build a candle live</>}
              </button>
            </ScenePanel>

            <ScenePanel title="OHLC sculptor" sub="Ограничения H ≥ max(O,C) ≥ min(O,C) ≥ L" accent="#9db9ff">
              {(["o", "h", "l", "c"] as const).map((k) => (
                <label key={k} className="mb-2 block text-[10px] font-extrabold text-[#8ea6d8]">
                  <span className="flex justify-between"><span>{k.toUpperCase()}</span><span className="num-mono text-white">{v[k].toFixed(1)}</span></span>
                  <input type="range" min={1} max={99} value={v[k]} disabled={building} onChange={(e) => setField(k, +e.target.value)}
                    className="lever mt-1 w-full" style={{ ["--fill" as string]: `${v[k]}%` }} />
                </label>
              ))}
            </ScenePanel>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr]">
          <ScenePanel title="Anatomy ratios" sub="Тело vs тени" accent={color}>
            {([["Upper wick", upper, "#ffc531"], ["Body", bodyHi - bodyLo, color], ["Lower wick", lower, "#ff8ba0"]] as const).map(([k, val, c]) => (
              <div key={k} className="mb-2">
                <div className="flex justify-between text-[10px] font-extrabold"><span className="text-[#8ea6d8]">{k}</span><span className="num-mono text-white">{((val / range) * 100).toFixed(0)}%</span></div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-black/50">
                  <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${(val / range) * 100}%` }} style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                </div>
              </div>
            ))}
          </ScenePanel>
          <ScenePanel title="Reading" sub="Автоклассификация" accent={cls.bias === "bull" ? "#2ede8a" : cls.bias === "bear" ? "#ff5470" : "#ffc531"}>
            <AnimatePresence mode="wait">
              <motion.div key={cls.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <p className={cn("display text-xl font-extrabold", cls.bias === "bull" ? "text-[#2ede8a]" : cls.bias === "bear" ? "text-[#ff5470]" : "text-[#ffc531]")}>{cls.name}</p>
                <p className="mt-1 text-sm text-[#c9d8ff]">{cls.note}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <SceneStat label="Range" value={range.toFixed(1)} color="#fff" />
              <SceneStat label="Change" value={`${bull ? "+" : ""}${(v.c - v.o).toFixed(1)}`} color={color} />
              <SceneStat label="Bias" value={cls.bias.toUpperCase()} color={cls.bias === "bull" ? "#2ede8a" : cls.bias === "bear" ? "#ff5470" : "#ffc531"} />
            </div>
          </ScenePanel>
        </div>
      </div>
    </ShowcaseSection>
  );
}
