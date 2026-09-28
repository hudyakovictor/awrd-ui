/* 45 · HISTORICAL SCENARIO ROOM — one room, four eras.
   Pick an event → chart, palette, timeline and ambience fully switch. */
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Tag } from "../components/ui";
import { ShowcaseSection, ScenePanel, SceneStat } from "../showcase/Scene";
import { candlesRange, genCandles, pctChange, type Regime } from "../showcase/market";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

const ERAS = [
  {
    id: "halving", name: "Halving 2020", years: "2020", color: "#8ef23c", regime: "trend" as Regime, seed: 20,
    bg: "radial-gradient(circle at 30% 20%, rgba(142,242,60,.22), transparent 55%), radial-gradient(circle at 80% 80%, rgba(20,60,20,.5), transparent 60%)",
    moments: [
      { t: "T-30d", title: "Тишина перед халвингом", body: "Волатильность сжата. Майнеры копят, funding нейтральный." },
      { t: "T-0", title: "Блок награды ÷2", body: "Эмиссия падает с 12.5 до 6.25 BTC. Рынок отмечает импульсом." },
      { t: "T+60d", title: "Переоценка", body: "Пробой годового максимума. Возврат покупателей." },
      { t: "T+180d", title: "Новый цикл", body: "ATH близко. История рифмуется, но не повторяется." },
    ],
  },
  {
    id: "defi", name: "DeFi Summer", years: "2020", color: "#5b8cff", regime: "volatile" as Regime, seed: 77,
    bg: "radial-gradient(circle at 70% 20%, rgba(91,140,255,.28), transparent 55%), radial-gradient(circle at 20% 85%, rgba(30,40,120,.5), transparent 60%)",
    moments: [
      { t: "W1", title: "Yield farming", body: "APY трёхзначные. TVL растёт по экспоненте." },
      { t: "W4", title: "Газовый шторм", body: "Комиссии выше $50. Мемпул переполнен." },
      { t: "W8", title: "Коррекция еды", body: "Food-токены −80%. Выживают протоколы с выручкой." },
      { t: "W12", title: "Легитимизация", body: "Институционалы смотрят на on-chain доходность." },
    ],
  },
  {
    id: "ath", name: "ATH Euphoria", years: "2021", color: "#ffc531", regime: "trend" as Regime, seed: 69,
    bg: "radial-gradient(circle at 50% 10%, rgba(255,197,49,.25), transparent 55%), radial-gradient(circle at 85% 85%, rgba(120,70,0,.4), transparent 60%)",
    moments: [
      { t: "Q3", title: "Разгон", body: "Альтсезон. Каждая просадка выкупается за часы." },
      { t: "Nov", title: "$69K", body: "Эйфория. Таксисты дают сигналы." },
      { t: "Top?", title: "Дивергенции", body: "RSI слабеет на новом хае. Умные деньги разгружаются." },
      { t: "After", title: "Тихий разворот", body: "Первый −20%. Никто не верит в медвежий рынок." },
    ],
  },
  {
    id: "crash", name: "Crash 2022", years: "2022", color: "#ff5470", regime: "crash" as Regime, seed: 22,
    bg: "radial-gradient(circle at 20% 30%, rgba(255,84,112,.25), transparent 55%), radial-gradient(circle at 80% 20%, rgba(120,10,30,.5), transparent 60%)",
    moments: [
      { t: "May", title: "UST spiral", body: "Алгостейбл теряет пег. Каскад ликвидаций." },
      { t: "Jun", title: "Celsius freeze", body: "Выводы остановлены. Доверие рушится." },
      { t: "Nov", title: "FTX", body: "Вторая по величине биржа банкротится за неделю." },
      { t: "Dec", title: "Капитуляция", body: "BTC −77% от ATH. Именно здесь рождаются циклы." },
    ],
  },
];

export default function HistoryRoom() {
  const [eraId, setEraId] = useState("halving");
  const [mi, setMi] = useState(1);
  const [playing, setPlaying] = useState(false);
  const era = ERAS.find((e) => e.id === eraId) ?? ERAS[0];

  const candles = useMemo(() => genCandles(era.seed, 120, 100, era.regime, 86_400_000), [era.seed, era.regime]);
  const { min, max } = useMemo(() => candlesRange(candles), [candles]);
  const W = 680, H = 240;
  const y = (v: number) => 12 + (1 - (v - min) / (max - min || 1)) * (H - 30);
  const bw = W / candles.length;

  const mPos = (mi / (era.moments.length - 1)) * 0.8 + 0.1;
  const mIdx = Math.floor(mPos * (candles.length - 1));
  const total = pctChange(candles[0].o, candles[candles.length - 1].c);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setMi((m) => (m + 1) % era.moments.length), 2600);
    return () => window.clearInterval(id);
  }, [playing, era.moments.length]);

  const pickEra = (id: string) => {
    setEraId(id);
    setMi(1);
    setPlaying(false);
    sfx.levelUp();
  };

  const m = era.moments[mi];

  return (
    <ShowcaseSection
      id="history" index="45" kicker="History Room" title="Комната исторических событий"
      desc="Выбери эпоху — сменятся график, палитра, шкала и атмосфера. Путешествуй между ключевыми моментами сценария."
      accent={era.color}
      tags={<div className="flex gap-2"><Tag tone={total >= 0 ? "green" : "red"}>era {total >= 0 ? "+" : ""}{total.toFixed(1)}%</Tag><Tag tone="ghost">{era.years}</Tag></div>}
    >
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        {ERAS.map((e) => (
          <button
            key={e.id} onClick={() => pickEra(e.id)}
            className={cn("rounded-2xl border p-3 text-left transition", eraId === e.id ? "border-white/50 bg-white/8" : "border-white/10 bg-black/25 hover:border-white/25")}
            style={eraId === e.id ? { boxShadow: `0 0 26px ${e.color}44` } : undefined}
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color, boxShadow: `0 0 10px ${e.color}` }} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8ea6d8]">{e.years}</span>
            </span>
            <span className="display mt-1 block text-sm font-extrabold text-white">{e.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={eraId} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-[24px] border border-white/10 p-4 sm:p-5"
          style={{ background: `${era.bg}, linear-gradient(180deg, rgba(10,20,55,.7), rgba(4,8,24,.85))` }}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <ScenePanel title={`${era.name} · BTC/USD`} sub="Daily bars · момент подсвечен" accent={era.color}
              right={
                <button onClick={() => { setPlaying((p) => !p); sfx.tap(); }} className="btn3d btn3d-ghost h-9 w-9 !rounded-xl">
                  {playing ? <Pause size={15} /> : <Play size={15} />}
                </button>
              }
            >
              <div className="panel-inset overflow-hidden p-2" style={{ boxShadow: `inset 0 3px 10px rgba(0,0,0,.7), 0 0 50px ${era.color}22` }}>
                <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                  {candles.map((c, i) => {
                    const up = c.c >= c.o;
                    const col = up ? "#2ede8a" : "#ff5470";
                    const near = Math.abs(i - mIdx) < 9;
                    return (
                      <g key={i} opacity={near ? 1 : 0.5}>
                        <line x1={i * bw + bw / 2} x2={i * bw + bw / 2} y1={y(c.h)} y2={y(c.l)} stroke={near ? era.color : col} strokeWidth={near ? 2 : 1.1} />
                        <rect x={i * bw + bw * 0.2} y={y(Math.max(c.o, c.c))} width={bw * 0.6} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} rx={1}
                          fill={near ? era.color : col} style={near ? { filter: `drop-shadow(0 0 7px ${era.color})` } : undefined} />
                      </g>
                    );
                  })}
                  <line x1={mIdx * bw + bw / 2} x2={mIdx * bw + bw / 2} y1={0} y2={H} stroke="#fff" strokeWidth={1.5} strokeDasharray="6 4" />
                </svg>
              </div>
              {/* era timeline */}
              <div className="relative mt-4 px-1">
                <div className="absolute inset-x-2 top-[15px] h-1 rounded-full bg-white/10" />
                <motion.div className="absolute left-2 top-[15px] h-1 rounded-full" style={{ background: era.color, boxShadow: `0 0 10px ${era.color}` }}
                  initial={false} animate={{ width: `calc(${(mi / (era.moments.length - 1)) * 100}% - 8px)` }} />
                <div className="relative flex justify-between">
                  {era.moments.map((mm, i) => (
                    <button key={mm.t} onClick={() => { setMi(i); sfx.tick(); }} className="flex flex-col items-center gap-1.5">
                      <motion.span
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-black"
                        animate={i === mi ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                        style={i <= mi ? { borderColor: era.color, background: `${era.color}33`, color: "#fff" } : { borderColor: "rgba(255,255,255,.15)", color: "#54678f", background: "#0a1740" }}
                      >{i + 1}</motion.span>
                      <span className={cn("text-[10px] font-extrabold", i === mi ? "text-white" : "text-[#54678f]")}>{mm.t}</span>
                    </button>
                  ))}
                </div>
              </div>
            </ScenePanel>

            <div className="space-y-3">
              <AnimatePresence mode="wait">
                <motion.div key={mi + eraId} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  className="rounded-[22px] border border-white/12 bg-black/40 p-5 backdrop-blur" style={{ boxShadow: `0 0 34px ${era.color}2e` }}
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: era.color }}>{m.t} · key moment</p>
                  <h3 className="display mt-1 text-xl font-extrabold text-white">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#c9d8ff]">{m.body}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <SceneStat label="Era move" value={`${total >= 0 ? "+" : ""}${total.toFixed(1)}%`} color={total >= 0 ? "#2ede8a" : "#ff5470"} />
                    <SceneStat label="Moment" value={`${mi + 1}/${era.moments.length}`} color="#fff" />
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setMi((i) => Math.max(0, i - 1))} className="btn3d btn3d-ghost py-2.5 text-[10px]">← Back</button>
                <button onClick={() => setMi((i) => Math.min(era.moments.length - 1, i + 1))} className="btn3d btn3d-gold py-2.5 text-[10px]">Next →</button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </ShowcaseSection>
  );
}
