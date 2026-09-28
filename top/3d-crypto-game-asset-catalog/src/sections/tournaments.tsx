import { useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip } from "../components/ui";
import { AvatarArt, TrophyArt, FlameArt, CoinArt, GemArt } from "../components/art";
import { Spark } from "../components/Charts";
import { useCountdown } from "../lib/gestures";
import { useInterval, tap, sfx, haptic, notify } from "../lib/fx";
import { particles } from "../lib/particles";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   A — АРЕНА: сетка турнира, живая гонка, календарь, фонд, трекер матча.
   ═══════════════════════════════════════════════════════════════════ */

/* ── A01 · Турнирная сетка 8 → 1 с симуляцией ── */
type Player = { n: string; seed: number; me?: boolean; xp: number };
const EIGHT: Player[] = [
  { n: "Вы", seed: 0, me: true, xp: 1980 }, { n: "Кира", seed: 1, xp: 2140 },
  { n: "Макс", seed: 2, xp: 1810 }, { n: "Дима", seed: 3, xp: 1500 },
  { n: "Лена", seed: 4, xp: 1320 }, { n: "Олег", seed: 5, xp: 900 },
  { n: "Мира", seed: 6, xp: 1200 }, { n: "Тимур", seed: 7, xp: 760 },
];

function playMatch(a: Player, b: Player): Player {
  const pa = a.xp / (a.xp + b.xp);
  return Math.random() < pa ? a : b;
}

export function Bracket() {
  const [round, setRound] = useState(0); // 0: 1/4, 1: 1/2, 2: финал, 3: чемпион
  const [winners, setWinners] = useState<Player[][]>([]);
  const [playing, setPlaying] = useState(false);
  const [champ, setChamp] = useState<Player | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const rounds = useMemo(() => {
    const r0: Player[][] = [];
    for (let i = 0; i < 8; i += 2) r0.push([EIGHT[i], EIGHT[i + 1]]);
    const out: Player[][][] = [r0];
    let cur = r0.map(([a, b]) => playMatch(a, b));
    out.push([[cur[0], cur[1]], [cur[2], cur[3]]]);
    cur = [playMatch(cur[0], cur[1]), playMatch(cur[2], cur[3])];
    out.push([[cur[0], cur[1]]]);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [champ === null]);

  const sim = () => {
    if (playing || round >= 3) return;
    setPlaying(true);
    sfx("whoosh");
    setTimeout(() => {
      const r = rounds[round];
      const w = r.map(([a, b]) => playMatch(a, b));
      setWinners((ws) => [...ws, w]);
      setPlaying(false);
      if (round === 2) {
        setChamp(w[0]);
        sfx("levelup");
        haptic([10, 30, 10, 30, 80]);
        particles.burstAt(box.current, { count: 70, speed: 700 });
        notify(w[0].me ? "Ты чемпион турнира! 🏆" : `Чемпион: ${w[0].n}`, w[0].me ? "success" : "info");
      } else {
        sfx("coin");
      }
      setRound(round + 1);
    }, 1100);
  };

  const reset = () => { setRound(0); setWinners([]); setChamp(null); tap(); };
  const won = (p: Player, ri: number) => winners[ri]?.includes(p);

  const Match = ({ a, b, ri, live }: { a: Player; b: Player; ri: number; live: boolean }) => (
    <div className={cn("overflow-hidden rounded-2xl bg-ink-850 ring-1 transition-all", live && playing && "ring-sky animate-pulse", ri < round && "opacity-90")}>
      {[a, b].map((p) => {
        const isW = ri < round ? won(p, ri) : undefined;
        return (
          <div key={p.n} className={cn("flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-bold", isW === false && "opacity-35 line-through", isW && "bg-bull/10 text-bull")}>
            <AvatarArt seed={p.seed} size={22} />
            <span className="flex-1 truncate">{p.n}{p.me && " (вы)"}</span>
            {isW && <Icon name="check" size={13} stroke={3.5} className="animate-pop" />}
            {live && playing && <span className="size-1.5 animate-ping rounded-full bg-sky" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div ref={box}>
      <div className="mb-3 flex items-center gap-3">
        <TrophyArt size={36} />
        <div className="flex-1">
          <div className="font-display text-sm font-black">Кубок выходного дня</div>
          <div className="text-[11px] text-ink-400">Single elimination · {["Четвертьфиналы", "Полуфиналы", "Финал", "Чемпион определён"][Math.min(3, round)]}</div>
        </div>
        {round < 3 ? <Btn s="sm" v="gold" icon="play" loading={playing} onClick={sim}>Раунд {round + 1}</Btn>
          : <Btn s="sm" v="ghost" icon="refresh" onClick={reset}>Заново</Btn>}
      </div>
      <div className="grid grid-cols-3 items-center gap-2 sm:gap-3">
        <div className="space-y-2">
          {rounds[0].map(([a, b], i) => <Match key={i} a={a} b={b} ri={0} live={round === 0} />)}
        </div>
        <div className="space-y-4">
          {rounds[1].map(([a, b], i) => (
            <div key={i} className={cn(round < 1 && "opacity-40 saturate-50")}><Match a={a} b={b} ri={1} live={round === 1} /></div>
          ))}
        </div>
        <div className="space-y-3">
          <div className={cn(round < 2 && "opacity-40 saturate-50")}><Match a={rounds[2][0][0]} b={rounds[2][0][1]} ri={2} live={round === 2} /></div>
          <div className={cn("rounded-2xl p-3 text-center transition-all", champ ? "bg-gradient-to-b from-gold/30 to-gold/5 ring-2 ring-gold animate-pop" : "bg-ink-850 ring-1 ring-white/5")}>
            {champ ? (
              <><AvatarArt seed={champ.seed} size={44} /><div className="mt-1 font-display text-xs font-black text-gold">{champ.n}</div><div className="text-[10px] text-ink-300">+2000 крист.</div></>
            ) : (
              <><div className="mx-auto flex size-11 items-center justify-center rounded-full bg-ink-800 text-ink-500"><Icon name="trophy" size={20} /></div><div className="mt-1 text-[10px] font-bold text-ink-500">Чемпион — ?</div></>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 flex gap-1.5">{[0, 1, 2].map((r) => <span key={r} className={cn("h-1.5 flex-1 rounded-full transition-colors", r < round ? "bg-gold" : r === round && playing ? "bg-sky animate-pulse" : "bg-ink-700")} />)}</div>
    </div>
  );
}

/* ── A02 · Живая гонка лиги по неделям ── */
const RACERS = [
  { n: "Кира", seed: 1, hex: "#FF4D6D", data: [300, 700, 1100, 1500, 1900, 2140] },
  { n: "Вы", seed: 0, hex: "#3D9BFF", data: [250, 600, 950, 1300, 1700, 1980] },
  { n: "Макс", seed: 2, hex: "#2BE38B", data: [200, 500, 800, 1150, 1500, 1810] },
  { n: "Дима", seed: 3, hex: "#FFC940", data: [180, 420, 700, 980, 1250, 1500] },
  { n: "Лена", seed: 4, hex: "#9A6BFF", data: [150, 350, 550, 850, 1100, 1320] },
];

export function LiveRace() {
  const [week, setWeek] = useState(5);
  const [play, setPlay] = useState(false);
  useInterval(() => setWeek((w) => {
    if (w >= 5) { setPlay(false); return 5; }
    if (w === 4) sfx("coin");
    return w + 1;
  }), play ? 1100 : null);
  const max = 2200;
  const order = [...RACERS].sort((a, b) => b.data[week] - a.data[week]);
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Btn s="sm" v={play ? "ink" : "bull"} icon={play ? "minus" : "play"} onClick={() => { if (week >= 5 && !play) setWeek(0); setPlay(!play); sfx("whoosh"); }}>
          {play ? "Пауза" : week >= 5 ? "Сначала" : "Гонка"}
        </Btn>
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3, 4, 5].map((w) => (
            <button key={w} onClick={() => { tap("tick"); setPlay(false); setWeek(w); }} className={cn("h-2 flex-1 rounded-full transition-colors", w <= week ? "bg-sky" : "bg-ink-700")} aria-label={`Неделя ${w + 1}`} />
          ))}
        </div>
        <span className="font-mono text-[11px] text-ink-300">нед. {week + 1}/6</span>
      </div>
      <div className="space-y-2">
        {order.map((r, pos) => (
          <div key={r.n} className={cn("flex items-center gap-2.5 rounded-2xl p-2 transition-all duration-700 [transition-timing-function:cubic-bezier(.22,1,.36,1)]", r.n === "Вы" ? "bg-sky/10 ring-1 ring-sky/40" : "bg-ink-850")}>
            <span className={cn("w-5 text-center font-display text-sm font-black", pos === 0 ? "text-gold" : pos < 3 ? "text-bull" : "text-ink-500")}>{pos + 1}</span>
            <AvatarArt seed={r.seed} size={30} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[11px] font-bold"><span className={r.n === "Вы" ? "text-sky" : ""}>{r.n}</span><span className="font-mono tabular-nums">{r.data[week]} XP</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink-900">
                <div className="h-full rounded-full transition-all duration-700 [transition-timing-function:cubic-bezier(.22,1,.36,1)]" style={{ width: `${(r.data[week] / max) * 100}%`, background: r.hex, boxShadow: `0 0 10px ${r.hex}88` }} />
              </div>
            </div>
            {pos === 0 && <Icon name="crown" size={16} className="text-gold animate-bob" />}
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-ink-500">Позиции пересчитываются каждую неделю · корона у лидера</div>
    </div>
  );
}

/* ── A03 · Календарь событий месяца ── */
type Ev = { d: number; t: string; icon: "sword" | "gift" | "flame" | "trophy" | "star"; hex: string; big?: boolean };
const EVENTS: Ev[] = [
  { d: 3, t: "Блиц-турнир", icon: "sword", hex: "#FF4D6D" },
  { d: 7, t: "Двойной XP", icon: "flame", hex: "#FF8A3D" },
  { d: 12, t: "Кубок выходного дня", icon: "trophy", hex: "#FFC940", big: true },
  { d: 15, t: "Новый босс: Бора", icon: "star", hex: "#9A6BFF", big: true },
  { d: 19, t: "Раздача сундуков", icon: "gift", hex: "#2BE38B" },
  { d: 22, t: "Блиц-турнир", icon: "sword", hex: "#FF4D6D" },
  { d: 26, t: "Финал сезона", icon: "trophy", hex: "#FFC940", big: true },
];
const TODAY = 9;

export function EventCalendar() {
  const [sel, setSel] = useState(12);
  const ev = EVENTS.find((e) => e.d === sel);
  const firstDow = 5; // 1-е число — пятница
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return (
    <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="font-display text-sm font-black">Октябрь</span>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-400"><span className="size-2 rounded-full bg-bull" />сегодня {TODAY}</span>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-ink-500">
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <span key={i} />;
            const e = EVENTS.find((x) => x.d === d);
            const isToday = d === TODAY;
            return (
              <button
                key={i}
                onClick={() => { tap("tick"); setSel(d); }}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center rounded-xl text-[12px] font-bold transition-all",
                  sel === d ? "bg-sky text-white shadow-[0_3px_0_var(--color-sky-d)] scale-105" : "bg-ink-850 hover:bg-ink-800",
                  isToday && sel !== d && "ring-2 ring-bull"
                )}
              >
                {d}
                {e && <span className="absolute bottom-1 flex gap-0.5"><span className="size-1.5 rounded-full" style={{ background: sel === d ? "#fff" : e.hex }} />{e.big && <span className="size-1.5 rounded-full" style={{ background: sel === d ? "#fff" : e.hex }} />}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div key={sel} className="panel-soft flex flex-col p-4 animate-slide-up">
        <div className="text-[10px] font-black uppercase tracking-widest text-ink-400">{sel} октября</div>
        {ev ? (
          <>
            <span className="mt-2 flex size-12 items-center justify-center rounded-2xl text-ink-900" style={{ background: ev.hex }}><Icon name={ev.icon} size={24} stroke={2.4} /></span>
            <div className="mt-2 font-display text-sm font-black">{ev.t}</div>
            <div className="text-[12px] text-ink-400">{ev.big ? "Главное событие · награды ×3" : "Регулярное событие"}</div>
            <Btn s="xs" v="gold" className="mt-3" icon="bell" onClick={() => notify(`Напомним о «${ev.t}»`, "info")}>Напомнить</Btn>
          </>
        ) : (
          <>
            <span className="mt-2 flex size-12 items-center justify-center rounded-2xl bg-ink-800 text-ink-500"><Icon name="chevD" size={22} /></span>
            <div className="mt-2 font-display text-sm font-black">Спокойный день</div>
            <div className="text-[12px] text-ink-400">Идеально для стрика и квестов</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── A04 · Призовой фонд с таймером ── */
const PRIZES: [string, number, string][] = [["1 место", 5000, "#FFC940"], ["2 место", 2500, "#B0C0E4"], ["3 место", 1200, "#FF8A3D"], ["4–10", 300, "#3D9BFF"]];

export function PrizePool() {
  const cd = useCountdown(2 * 24 * 3600 * 1000 + 5 * 3600 * 1000);
  const [pool, setPool] = useState(9820);
  const [joined, setJoined] = useState(false);
  useInterval(() => setPool((p) => p + Math.floor(Math.random() * 6)), 2500);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gold/20 via-ink-850 to-ink-900 p-5 text-center ring-1 ring-gold/30">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative">
        <Chip tone="gold">Финал сезона · через {cd.h}ч {cd.m}м</Chip>
        <div className="mt-2 text-[10px] font-black uppercase tracking-[.2em] text-ink-400">Призовой фонд</div>
        <div className="flex items-center justify-center gap-2">
          <GemArt size={34} />
          <span key={pool} className="font-display text-4xl font-black text-sky tabular-nums animate-pop">{pool.toLocaleString("ru-RU")}</span>
        </div>
        <div className="text-[11px] text-ink-400">растёт с каждым участником · +5 за вход</div>
        <div className="mx-auto mt-4 grid max-w-sm grid-cols-4 gap-2">
          {PRIZES.map(([t, v, c]) => (
            <div key={t} className="rounded-2xl bg-ink-900/60 p-2 ring-1 ring-white/5">
              <div className="text-[9px] font-black uppercase" style={{ color: c }}>{t}</div>
              <div className="mt-0.5 flex items-center justify-center gap-1 font-mono text-[12px] font-bold"><GemArt size={13} />{v}</div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-3 flex max-w-sm items-center gap-2 font-mono text-sm font-bold">
          {[cd.h, cd.m, cd.s].map((v, i) => <span key={i} className="flex-1 rounded-xl bg-ink-950/60 py-1.5 tabular-nums">{String(v).padStart(2, "0")}</span>)}
        </div>
        <Btn s="md" v={joined ? "ink" : "gold"} icon={joined ? "check" : "sword"} className="mt-4" onClick={(e) => {
          if (joined) return;
          setJoined(true); setPool((p) => p + 5); sfx("levelup");
          particles.burstAt(e.currentTarget, { kind: "star", count: 24, speed: 420, colors: ["#FFC940", "#fff"] });
        }}>
          {joined ? "Ты в игре · удачи!" : "Войти за 5 крист."}
        </Btn>
      </div>
    </div>
  );
}

/* ── A05 · Трекер live-матча ── */
export function MatchTracker() {
  const [me, setMe] = useState(3);
  const [foe, setFoe] = useState(2);
  const [log, setLog] = useState<string[]>(["Матч начался · вопрос 1/10"]);
  const [live, setLive] = useState(true);
  const [q, setQ] = useState(6);
  const total = me + foe;
  const momentum = total ? me / total : 0.5;
  useInterval(() => {
    setQ((v) => {
      if (v >= 10) { setLive(false); return 10; }
      return v + 1;
    });
    setLog((l) => {
      if (l.length >= 10) return l;
      const mine = Math.random() < 0.55;
      if (mine) setMe((m) => m + 1); else setFoe((f) => f + 1);
      sfx("tick");
      const msgs = mine ? ["Ты ответил верно ⚡", "Точно! +1 очко", "Бора промахнулся, ты — нет"] : ["Бора угадал…", "Соперник сравнял", "Мимо. Бора впереди"];
      return [...l.slice(-6), msgs[Math.floor(Math.random() * msgs.length)]];
    });
  }, live ? 2200 : null);
  const over = q >= 10;
  const win = me > foe;
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className={cn("flex items-center gap-1 rounded-lg px-2 py-1 font-display text-[10px] font-black uppercase", live ? "bg-bear/20 text-bear" : "bg-ink-800 text-ink-400")}>
          <span className={cn("size-1.5 rounded-full", live ? "bg-bear animate-pulse" : "bg-ink-500")} />{live ? "Live" : "Финал"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-400">вопрос {Math.min(q, 10)}/10</span>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-center">
          <AvatarArt seed={0} size={52} />
          <div className="mt-1 text-[12px] font-bold">Вы</div>
          <div key={me} className="font-display text-3xl font-black text-sky animate-pop">{me}</div>
        </div>
        <div className="font-display text-lg font-black text-ink-500">:</div>
        <div className="text-center">
          <AvatarArt seed={3} size={52} />
          <div className="mt-1 text-[12px] font-bold">Бора</div>
          <div key={foe} className="font-display text-3xl font-black text-bear animate-pop">{foe}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px] font-black uppercase text-ink-400"><span>Моментум</span><span>{Math.round(momentum * 100)}% за тобой</span></div>
        <div className="relative h-3 overflow-hidden rounded-full bg-ink-900">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-sky-d to-sky transition-all duration-700" style={{ width: `${momentum * 100}%` }} />
          <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-bear-d to-bear transition-all duration-700" style={{ width: `${(1 - momentum) * 100}%` }} />
          <div className="absolute inset-y-[-2px] w-1 rounded-full bg-white shadow transition-all duration-700" style={{ left: `calc(${momentum * 100}% - 2px)` }} />
        </div>
      </div>
      <div className="well mt-3 h-28 space-y-1 overflow-hidden p-2.5">
        {log.map((l, i) => <div key={`${l}-${i}`} className={cn("text-[11px] font-semibold animate-slide-up", i === log.length - 1 ? "text-white" : "text-ink-400")}>{l}</div>)}
      </div>
      {over && (
        <div className={cn("mt-3 flex items-center gap-3 rounded-2xl p-3 animate-zoom-in", win ? "bg-bull/15 ring-1 ring-bull/40" : "bg-bear/15 ring-1 ring-bear/40")}>
          <FlameArt size={30} off={!win} />
          <div className="flex-1 text-[12px] font-bold">{win ? `Победа ${me}:${foe}! +60 XP и место в полуфинале` : `Поражение ${me}:${foe}. Реванш через час`}</div>
          <Btn s="xs" v={win ? "bull" : "sky"} icon="refresh" onClick={() => { setMe(0); setFoe(0); setQ(1); setLog(["Матч начался · вопрос 1/10"]); setLive(true); }}>Ещё</Btn>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-500">
        <span className="flex items-center gap-1"><CoinArt size={14} />ставка: 50 монет</span>
        <Spark data={[1, 2, 2, 3, 3, 4, me]} w={80} h={22} />
      </div>
    </div>
  );
}
