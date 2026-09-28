import { useEffect, useMemo, useRef, useState } from "react";
import { Swords, Trophy, Flag, Send, Heart, Zap, Lock } from "lucide-react";
import { Asset, Section, Btn, Chip, Bar, GhostBtn } from "../kit/ui";
import { FlameIcon, GemIcon, CoinIcon, ShieldIcon, TrophyIcon } from "../kit/GameIcons";
import { AnimatedNumber } from "../kit/spring";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ============ CL-01 CLAN CARD ============ */
const members = [
  { n: "You", c: "#3b82ff", xp: 1840, on: true },
  { n: "Mira", c: "#ff4f6d", xp: 1620, on: true },
  { n: "Denis", c: "#22d39a", xp: 1410, on: true },
  { n: "Kate", c: "#ffc53d", xp: 990, on: false },
  { n: "Omar", c: "#8b5cff", xp: 720, on: false },
];
function ClanCard() {
  const [boost, setBoost] = useState(0);
  const [boosting, setBoosting] = useState(false);
  const total = members.reduce((a, m) => a + m.xp, 0) + boost;
  const goal = 9000;
  const fire = () => {
    if (boosting) return;
    setBoosting(true);
    sfx.levelUp();
    let n = 0;
    const t = setInterval(() => {
      n += 25;
      setBoost((b) => b + 25);
      if (n >= 500) { clearInterval(t); setBoosting(false); }
    }, 40);
  };
  return (
    <Asset code="CL-01" title="Clan HQ Card" desc="Штаб клана: общий прогресс к сундуку, состав с онлайном, кнопка командного буста." hint="Жми Boost" specs={["shared goal", "roster", "boost anim"]}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-d to-ink-800 p-4">
        <ShieldIcon size={110} className="absolute -right-4 -bottom-6 opacity-25" />
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-gold to-gold-d font-display text-lg font-black text-ink-900 shadow-[0_4px_0_#8a5c08]">B</span>
          <div className="flex-1"><div className="font-display text-base font-extrabold">Bull Riders</div><div className="text-[11px] text-snow/70">12 480 трофеев · топ 3%</div></div>
          <Chip tone="gold"><Trophy size={11} /> Diamond</Chip>
        </div>
        <div className="mt-3 flex justify-between text-[11px] font-bold"><span>Clan chest</span><span className="num"><AnimatedNumber value={total} /> / {goal.toLocaleString()}</span></div>
        <div className="mt-1"><Bar value={(total / goal) * 100} tone="gold" h={12} /></div>
      </div>
      <div className="mt-3 space-y-1.5">
        {members.map((m, i) => (
          <div key={m.n} className="anim-slide-right flex items-center gap-2.5 rounded-xl bg-ink-800 p-2" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="relative grid h-8 w-8 place-items-center rounded-full text-[12px] font-black text-ink-900" style={{ background: `linear-gradient(160deg,#fff,${m.c} 60%)` }}>
              {m.n[0]}<span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-800", m.on ? "bg-bull" : "bg-ink-500")} />
            </span>
            <span className="flex-1 text-[13px] font-bold">{m.n}</span>
            <span className="num text-[11px] text-mist">{m.xp} XP</span>
          </div>
        ))}
      </div>
      <Btn tone="violet" block size="sm" className="mt-3" disabled={boosting} onClick={fire} silent><Zap size={14} /> {boosting ? "Boosting…" : "Team boost +500"}</Btn>
    </Asset>
  );
}

/* ============ CL-02 CLAN WAR ============ */
function ClanWar() {
  const [a, setA] = useState(1240);
  const [b, setB] = useState(1180);
  const [t, setT] = useState(45);
  const [tapping, setTapping] = useState(false);
  const [hits, setHits] = useState<{ id: number; x: number }[]>([]);
  const id = useRef(1);
  useEffect(() => {
    const x = setInterval(() => { setB((v) => v + Math.round(Math.random() * 14)); setT((v) => Math.max(0, v - 1)); }, 1000);
    return () => clearInterval(x);
  }, []);
  const tap = (e: React.PointerEvent) => {
    if (t <= 0) return;
    setA((v) => v + 8);
    setTapping(true);
    setTimeout(() => setTapping(false), 120);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const hid = id.current++;
    setHits((h) => [...h.slice(-8), { id: hid, x: ((e.clientX - r.left) / r.width) * 100 }]);
    setTimeout(() => setHits((h) => h.filter((z) => z.id !== hid)), 700);
    sfx.tick();
  };
  const total = a + b;
  const pct = (a / total) * 100;
  const win = a >= b;
  return (
    <Asset code="CL-02" title="Clan War · Tap Battle" desc="Перетягивание очков между кланами: тапай по зоне, чтобы толкать шкалу. Соперник отвечает каждую секунду." hint="Тапай быстро" specs={["tap power", "live enemy", "timer"]}>
      <div className="flex items-center justify-between">
        <div className="text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-b from-sky to-sky-d font-black">B</div><div className="num mt-1 text-sm font-extrabold text-sky">{a}</div></div>
        <div className="text-center"><div className={cn("num font-display text-2xl font-black", t <= 10 && "anim-pop text-bear")}>{t}s</div><div className="text-[9px] font-bold uppercase text-mist">{t > 0 ? "war ends in" : win ? "victory!" : "defeat"}</div></div>
        <div className="text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-b from-bear to-bear-d font-black">R</div><div className="num mt-1 text-sm font-extrabold text-bear">{b}</div></div>
      </div>
      <div className="mt-3 flex h-6 overflow-hidden rounded-full bg-ink-950 shadow-[inset_0_2px_4px_rgba(0,0,0,.6)]">
        <div className="h-full bg-gradient-to-r from-sky-d to-sky transition-all duration-300" style={{ width: `${pct}%` }} />
        <div className="h-full flex-1 bg-gradient-to-r from-bear to-bear-d transition-all duration-300" />
      </div>
      <div
        onPointerDown={tap}
        className={cn("relative mt-3 grid h-32 touch-none select-none place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition", t > 0 ? "cursor-pointer border-sky/50 bg-sky/5 active:bg-sky/15" : "border-ink-600")}
        style={{ transform: tapping ? "scale(.985)" : undefined }}
      >
        {hits.map((h) => <span key={h.id} className="num pointer-events-none absolute bottom-6 text-lg font-black text-sky" style={{ left: `${h.x}%`, animation: "rise .7s ease-out forwards" }}>+8</span>)}
        <div className="text-center"><Swords size={30} className={cn("mx-auto", t > 0 ? "text-sky anim-float" : "text-mist")} /><div className="mt-1 text-[12px] font-extrabold">{t > 0 ? "TAP TO ATTACK" : win ? "🏆 Clan wins +200 trophies" : "💀 Clan loses −100"}</div></div>
      </div>
      <GhostBtn className="mt-3 !h-10 w-full !text-[10px]" onClick={() => { setA(1240); setB(1180); setT(45); }}>Restart war</GhostBtn>
    </Asset>
  );
}

/* ============ CL-03 BRACKET ============ */
const rounds = [
  ["You", "RexBear", "Mira", "Denis", "Kate", "Omar", "Satoshi_V", "WickHunter"],
  ["You", "Mira", "Satoshi_V", "Kate"],
  ["You", "Satoshi_V"],
  ["You"],
];
function Bracket() {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [champ, setChamp] = useState(false);
  const play = () => {
    if (playing || stage >= 3) return;
    setPlaying(true);
    sfxRaw.swipe();
    setTimeout(() => {
      setPlaying(false);
      setStage((s) => s + 1);
      if (stage + 1 >= 3) { setChamp(true); sfx.levelUp(); } else sfx.correct();
    }, 900);
  };
  return (
    <Asset code="CL-03" title="Tournament Bracket" desc="Сетка на 8 участников: выигрывай раунд за раундом, пока не поднимешь кубок." hint="Играй раунды" specs={["8 → 1", "stage anim", "champion"]}>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rounds.map((r, ri) => (
          <div key={ri} className="flex min-w-[118px] flex-1 flex-col justify-around gap-2">
            <div className="text-center text-[9px] font-extrabold uppercase text-mist">{["QF", "SF", "Final", "🏆"][ri]}</div>
            {r.map((p) => {
              const alive = ri <= stage;
              const isYou = p === "You";
              const out = ri > 0 && ri <= stage && !rounds[ri].includes(p);
              void out;
              return (
                <div key={`${ri}-${p}`} className={cn("anim-pop rounded-xl px-2 py-2 text-center text-[11px] font-extrabold transition-all", !alive && "opacity-30 grayscale", ri === 3 ? "bg-gradient-to-b from-gold to-gold-d text-ink-900 shadow-[0_4px_0_#8a5c08]" : isYou && alive ? "bg-sky/20 text-sky ring-2 ring-sky" : "bg-ink-800", playing && ri === stage + 1 && "anim-wiggle")}>
                  {p}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center">
        {champ ? (
          <div className="anim-pop"><TrophyIcon size={64} className="mx-auto anim-float" /><div className="font-display text-lg font-black text-gold">CHAMPION</div><div className="text-[11px] text-mist">+500 gems · +1000 XP · exclusive badge</div></div>
        ) : (
          <Btn tone="gold" className="!text-[#3b2600]" onClick={play} disabled={playing} silent>{playing ? "Playing…" : stage === 0 ? "Start quarterfinal" : stage === 1 ? "Play semifinal" : "Play final"}</Btn>
        )}
      </div>
      {champ && <button onClick={() => { setStage(0); setChamp(false); }} className="mt-2 w-full text-[11px] font-bold text-sky">New tournament</button>}
    </Asset>
  );
}

/* ============ CL-04 SEASON PASS ============ */
const pass = [
  { xp: 0, free: "50", prem: "150", I: CoinIcon },
  { xp: 100, free: "chest", prem: "3 chests", I: GemIcon },
  { xp: 250, free: "100", prem: "400", I: CoinIcon },
  { xp: 450, free: "freeze", prem: "skin", I: FlameIcon },
  { xp: 700, free: "200", prem: "800", I: GemIcon },
  { xp: 1000, free: "trophy", prem: "mythic", I: TrophyIcon },
];
function SeasonPass() {
  const [xp, setXp] = useState(320);
  const [prem, setPrem] = useState(true);
  const [claimed, setClaimed] = useState<number[]>([0]);
  const lvl = pass.filter((p) => xp >= p.xp).length;
  const claim = (i: number, which: "free" | "prem") => {
    const key = i * 2 + (which === "prem" ? 1 : 0);
    if (claimed.includes(key) || xp < pass[i].xp || (which === "prem" && !prem)) return;
    setClaimed([...claimed, key]);
    sfx.coin();
  };
  return (
    <Asset code="CL-04" title="Season Pass Track" desc="Двухъярусный трек наград: free и premium. XP двигает прогресс, награды забираются по одной." hint="Забирай награды" specs={["6 tiers", "2 tracks", "claim"]}>
      <div className="mb-3 flex items-center justify-between">
        <div><div className="font-display text-sm font-extrabold">Season 7 · Bull Run</div><div className="num text-[11px] text-mist">{xp} / 1000 XP · 12 days left</div></div>
        <button onClick={() => { setPrem(!prem); sfx.toggle(!prem); }} className={cn("h-9 rounded-xl px-3 text-[10px] font-extrabold uppercase", prem ? "bg-gold text-ink-900 shadow-[0_3px_0_#8a5c08]" : "bg-ink-800 text-mist")}>{prem ? "★ Premium" : "Free"}</button>
      </div>
      <div className="relative mb-2 h-2 overflow-hidden rounded-full bg-ink-950">
        <div className="h-full rounded-full bg-gradient-to-r from-violet to-gold transition-all duration-700" style={{ width: `${(xp / 1000) * 100}%` }} />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {pass.map((p, i) => {
          const un = xp >= p.xp;
          return (
            <div key={i} className={cn("min-w-[86px] flex-1 rounded-2xl border-2 p-1.5 text-center transition", un ? "border-gold/60 bg-gold/5" : "border-white/5 bg-ink-800 opacity-60")}>
              <div className="num text-[9px] font-extrabold text-mist">Lv {i + 1}</div>
              <p.I size={30} className="mx-auto" />
              {(["free", "prem"] as const).map((w) => {
                const key = i * 2 + (w === "prem" ? 1 : 0);
                const got = claimed.includes(key);
                const lock = !un || (w === "prem" && !prem);
                return (
                  <button key={w} onClick={() => claim(i, w)} disabled={lock || got} className={cn("mt-1 w-full rounded-lg py-1 text-[9px] font-extrabold transition", got ? "bg-bull/20 text-bull" : lock ? "bg-ink-900 text-ink-500" : w === "prem" ? "bg-gold text-ink-900 shadow-[0_2px_0_#8a5c08]" : "bg-sky/20 text-sky")}>
                    {got ? "✓" : lock && w === "prem" && un ? <Lock size={10} className="mx-auto" /> : `${w === "prem" ? "★ " : ""}${p[w]}`}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <GhostBtn className="!h-10 !text-[10px]" onClick={() => setXp((x) => Math.max(0, x - 100))}>−100 XP</GhostBtn>
        <Btn tone="bull" className="!h-10 !text-[10px]" onClick={() => { setXp((x) => Math.min(1000, x + 100)); sfx.correct(); }} silent>+100 XP</Btn>
      </div>
      <div className="mt-2 text-center text-[10px] text-mist">Claimed {claimed.length}/{pass.length * 2} · {lvl} tiers unlocked</div>
    </Asset>
  );
}

/* ============ CL-05 WEEKLY RACE ============ */
function Race() {
  const [tick, setTick] = useState(0);
  const [racing, setRacing] = useState(true);
  const racers = useMemo(() => [
    { n: "You", c: "#3b82ff", sp: 1.0 },
    { n: "Mira", c: "#ff4f6d", sp: 0.94 },
    { n: "Denis", c: "#22d39a", sp: 0.88 },
    { n: "Kate", c: "#ffc53d", sp: 0.97 },
    { n: "Omar", c: "#8b5cff", sp: 0.82 },
  ], []);
  const [pos, setPos] = useState<number[]>([10, 14, 8, 12, 6]);
  useEffect(() => {
    if (!racing) return;
    const t = setInterval(() => {
      setTick((x) => x + 1);
      setPos((p) => p.map((v, i) => Math.min(100, v + Math.random() * 3.2 * racers[i].sp)));
    }, 500);
    return () => clearInterval(t);
  }, [racing, racers]);
  const order = [...pos.keys()].sort((a, b) => pos[b] - pos[a]);
  const finished = pos.some((v) => v >= 100);
  useEffect(() => { if (finished) { setRacing(false); sfx.levelUp(); } }, [finished]);
  return (
    <Asset code="CL-05" title="Weekly XP Race" desc="Гонка недели: пять бегунов ползут к финишу в реальном времени. Твоя строка подсвечена." hint="Смотри гонку" specs={["live race", "5 racers", "rank"]}>
      <div className="space-y-2.5">
        {order.map((ri, rank) => {
          const r = racers[ri];
          const v = pos[ri];
          const you = r.n === "You";
          return (
            <div key={r.n} className={cn("rounded-2xl p-2 transition-all", you ? "bg-sky/10 ring-2 ring-sky" : "bg-ink-800/60")}>
              <div className="mb-1 flex items-center gap-2">
                <span className={cn("num grid h-6 w-6 place-items-center rounded-lg text-[11px] font-black", rank === 0 ? "bg-gold text-ink-900" : "bg-ink-700 text-mist")}>{rank + 1}</span>
                <span className="text-[12px] font-extrabold">{r.n}</span>
                <span className="num ml-auto text-[11px] text-mist">{Math.round(v * 24)} XP</span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-ink-950">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${v}%`, background: r.c, boxShadow: `0 0 10px ${r.c}` }} />
                <span className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-ink-900 transition-all duration-500" style={{ left: `calc(${v}% - 8px)`, background: r.c }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px]">
        <span className="text-mist">tick {tick} · ends Sunday</span>
        <button onClick={() => { setPos([10, 14, 8, 12, 6]); setRacing(true); sfx.whoosh(); }} className="font-bold text-sky">Restart race</button>
      </div>
    </Asset>
  );
}

/* ============ CL-06 CLAN CHAT ============ */
type Msg = { id: number; who: string; c: string; t: string; likes: number; liked: boolean; sys?: boolean };
function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, who: "Mira", c: "#ff4f6d", t: "Кто на дуэль? 🔥", likes: 2, liked: false },
    { id: 2, who: "Denis", c: "#22d39a", t: "Я! Только дочитаю про стопы 😅", likes: 1, liked: false },
  ]);
  const [txt, setTxt] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const id = useRef(10);
  useEffect(() => { box.current?.scrollTo({ top: 9999, behavior: "smooth" }); }, [msgs.length, typing]);
  const send = () => {
    const v = txt.trim();
    if (!v) return;
    setMsgs((m) => [...m, { id: id.current++, who: "You", c: "#3b82ff", t: v, likes: 0, liked: false }]);
    setTxt("");
    sfxRaw.pop();
    setTimeout(() => setTyping("Mira"), 700);
    setTimeout(() => {
      setTyping(null);
      setMsgs((m) => [...m, { id: id.current++, who: "Mira", c: "#ff4f6d", t: ["Согласен! 💯", "Го в дуэль после урока ⚔️", "+1, отличная идея"][Math.floor(Math.random() * 3)], likes: 0, liked: false }]);
      sfxRaw.swipe();
    }, 1800);
  };
  return (
    <Asset code="CL-06" title="Clan Chat" desc="Живой чат клана: отправка, индикатор печати, лайки сообщений, автоответы." hint="Напиши сообщение" specs={["typing…", "likes", "auto-reply"]}>
      <div ref={box} className="h-56 space-y-2 overflow-y-auto rounded-2xl bg-ink-900/60 p-3">
        <div className="text-center text-[10px] text-mist">— Today · #general —</div>
        {msgs.map((m) => {
          const mine = m.who === "You";
          return (
            <div key={m.id} className={cn("anim-slide-right flex items-end gap-2", mine && "flex-row-reverse")}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black text-ink-900" style={{ background: m.c }}>{m.who[0]}</span>
              <div className={cn("max-w-[75%] rounded-2xl px-3 py-2", mine ? "rounded-br-md bg-sky text-white" : "rounded-bl-md bg-ink-700")}>
                {!mine && <div className="text-[10px] font-extrabold" style={{ color: m.c }}>{m.who}</div>}
                <div className="text-[13px] font-semibold leading-snug">{m.t}</div>
              </div>
              <button onClick={() => { setMsgs((x) => x.map((z) => (z.id === m.id ? { ...z, likes: z.likes + (z.liked ? -1 : 1), liked: !z.liked } : z))); sfx.tick(); }} className="flex items-center gap-0.5 text-[10px] text-mist hover:text-bear">
                <Heart size={12} className={m.liked ? "anim-pop fill-bear text-bear" : ""} />{m.likes || ""}
              </button>
            </div>
          );
        })}
        {typing && <div className="anim-fade flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#ff4f6d] text-[11px] font-black text-ink-900">M</span><span className="flex gap-1 rounded-2xl rounded-bl-md bg-ink-700 px-3 py-2.5">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-mist" style={{ animation: `blink 1s ${i * 0.2}s infinite` }} />)}</span></div>}
      </div>
      <div className="panel-inset mt-3 flex items-center gap-2 p-1.5 pl-3 !rounded-2xl">
        <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} maxLength={80} placeholder="Message #general…" className="h-10 flex-1 bg-transparent text-[13px] font-semibold outline-none placeholder:text-mist/60" />
        <button onClick={send} disabled={!txt.trim()} className="btn3d !h-10 !w-10 !rounded-xl !p-0" style={{ ["--c" as string]: "var(--color-sky)", ["--cd" as string]: "var(--color-sky-d)", ["--depth" as string]: "3px" }}><Send size={15} /></button>
      </div>
      <div className="mt-2 flex justify-center gap-2 text-[10px] text-mist"><Flag size={11} /> 5 online · code of conduct applies</div>
    </Asset>
  );
}

export default function Clans() {
  return (
    <Section id="clans" index="CL" title="Clans & Tournaments" subtitle="Командная игра: штаб, войны, сетки, сезонный пропуск, гонки, чат">
      <ClanCard />
      <ClanWar />
      <Bracket />
      <SeasonPass />
      <Race />
      <Chat />
    </Section>
  );
}
