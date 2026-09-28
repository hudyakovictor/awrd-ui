import { useEffect, useRef, useState } from "react";
import { UserPlus, UserCheck, Swords, Share2, Copy, Check, MessageCircle, Settings, TrendingUp } from "lucide-react";
import { Asset, Section, Btn, Chip, GhostBtn } from "../kit/ui";
import { FlameIcon, GemIcon, TrophyIcon, StarIcon, CandleUpIcon, ShieldIcon, TargetIcon } from "../kit/GameIcons";
import { Mascot } from "../kit/Mascot";
import { Confetti } from "./Rewards";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

function Avatar({ name, color, size = 44, ring, online }: { name: string; color: string; size?: number; ring?: string; online?: boolean }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <span className="grid h-full w-full place-items-center rounded-full font-black text-ink-900 shadow-[inset_0_-3px_0_rgba(0,0,0,.2),0_3px_0_rgba(0,0,0,.35)]" style={{ background: `linear-gradient(160deg,#fff,${color} 55%)`, fontSize: size * 0.38, boxShadow: ring ? `0 0 0 3px #0a1224, 0 0 0 5px ${ring}` : undefined }}>
        {name[0].toUpperCase()}
      </span>
      {online !== undefined && <span className={cn("absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-ink-800", online ? "bg-bull" : "bg-ink-400")} />}
    </span>
  );
}

function Profile() {
  const [tab, setTab] = useState(0);
  const stats = [
    { I: FlameIcon, v: "47", l: "Day streak" },
    { I: GemIcon, v: "12.4k", l: "Total XP" },
    { I: TrophyIcon, v: "Diamond", l: "League" },
    { I: StarIcon, v: "18", l: "Top-3 finishes" },
  ];
  const week = [40, 65, 30, 90, 75, 55, 100];
  return (
    <Asset code="I-001" title="Player Profile" desc="Шапка профиля, статистика-плитки, недельная активность и витрина медалей." hint="Переключай вкладки" specs={["stats grid", "bar chart", "showcase"]} className="xl:row-span-2">
      <div className="relative -mx-1 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-d to-violet-d p-4 pb-12">
        <Settings size={18} className="absolute right-3 top-3 text-white/60" />
        <div className="flex items-center gap-3">
          <Avatar name="Alex" color="#3b82ff" size={64} ring="#ffc53d" />
          <div>
            <div className="font-display text-lg font-extrabold">Alex Trader</div>
            <div className="text-[11px] text-white/70">@alex_hodl · с марта 2024</div>
            <div className="mt-1 flex gap-1.5"><Chip tone="gold">Lv 24</Chip><Chip tone="cyan">Pro</Chip></div>
          </div>
        </div>
      </div>
      <div className="-mt-8 grid grid-cols-2 gap-2.5 px-1">
        {stats.map(({ I, v, l }, i) => (
          <div key={l} className="panel-raised anim-pop flex items-center gap-2 p-2.5" style={{ animationDelay: `${i * 70}ms` }}>
            <I size={30} />
            <div><div className="num text-sm font-extrabold">{v}</div><div className="text-[9px] font-bold uppercase text-mist">{l}</div></div>
          </div>
        ))}
      </div>
      <div className="panel-inset mt-4 grid grid-cols-2 p-1 !rounded-xl">
        {["Activity", "Badges"].map((t, i) => (
          <button key={t} onClick={() => { setTab(i); sfx.tick(); }} className={cn("h-8 rounded-lg text-[11px] font-extrabold transition", tab === i ? "bg-ink-600 text-white shadow-[0_2px_0_#08112a]" : "text-mist")}>{t}</button>
        ))}
      </div>
      {tab === 0 ? (
        <div key="a" className="mt-4">
          <div className="mb-2 flex justify-between text-[11px] font-bold"><span>XP this week</span><span className="num text-bull">+1,840</span></div>
          <div className="flex h-32 items-end gap-2">
            {week.map((h, i) => (
              <div key={i} className="group/b flex flex-1 flex-col items-center gap-1">
                <span className="num text-[9px] font-bold text-mist opacity-0 transition group-hover/b:opacity-100">{h * 3}</span>
                <div className="w-full origin-bottom rounded-lg bg-gradient-to-t from-sky-d to-sky shadow-[inset_0_2px_0_rgba(255,255,255,.3)] transition group-hover/b:from-gold-d group-hover/b:to-gold" style={{ height: `${h}%`, animation: `bar-grow .6s ${i * 60}ms both cubic-bezier(.3,1.5,.5,1)` }} />
                <span className="text-[9px] font-bold text-mist">{"MTWTFSS"[i]}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div key="b" className="mt-4 grid grid-cols-4 gap-2">
          {[CandleUpIcon, ShieldIcon, TargetIcon, FlameIcon, TrophyIcon, GemIcon, StarIcon, CandleUpIcon].map((I, i) => (
            <div key={i} className="panel-raised anim-pop grid aspect-square place-items-center !rounded-xl" style={{ animationDelay: `${i * 50}ms` }}>
              <I size={32} style={{ filter: i > 5 ? "grayscale(1) brightness(.5)" : undefined }} />
            </div>
          ))}
        </div>
      )}
    </Asset>
  );
}

const friends0 = [
  { n: "Mira", c: "#ff4f6d", xp: 820, on: true, f: true },
  { n: "Denis", c: "#22d39a", xp: 640, on: true, f: false },
  { n: "Kate", c: "#ffc53d", xp: 1210, on: false, f: true },
  { n: "Omar", c: "#8b5cff", xp: 300, on: false, f: false },
];
function Friends() {
  const [fr, setFr] = useState(friends0);
  const [q, setQ] = useState("");
  const [nudged, setNudged] = useState<string | null>(null);
  const list = fr.filter((f) => f.n.toLowerCase().includes(q.toLowerCase()));
  return (
    <Asset code="I-002" title="Friends & Follow" desc="Поиск, онлайн-статус, подписка с морфингом кнопки, «пнуть» друга." hint="Подпишись и пни" specs={["search", "follow morph", "nudge"]}>
      <div className="panel-inset mb-3 flex items-center px-3 !rounded-xl">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search friends…" className="h-10 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-mist/60" />
      </div>
      <div className="space-y-2">
        {list.map((f) => (
          <div key={f.n} className="anim-fade flex items-center gap-3 rounded-2xl bg-ink-800 p-2.5 shadow-[0_3px_0_#08112a]">
            <Avatar name={f.n} color={f.c} size={40} online={f.on} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-extrabold">{f.n}</div>
              <div className="num text-[10px] text-mist">{f.xp} XP this week</div>
            </div>
            <button onClick={() => { setNudged(f.n); sfx.whoosh(); setTimeout(() => setNudged(null), 1200); }} className="grid h-9 w-9 place-items-center rounded-xl bg-ink-700 text-mist shadow-[0_3px_0_#08112a] hover:text-white active:translate-y-[3px] active:shadow-none">
              {nudged === f.n ? <span className="anim-pop">👋</span> : <MessageCircle size={16} />}
            </button>
            <button onClick={() => { setFr(fr.map((x) => (x.n === f.n ? { ...x, f: !x.f } : x))); sfx.toggle(!f.f); }} className={cn("flex h-9 w-[92px] items-center justify-center gap-1 rounded-xl text-[10px] font-extrabold uppercase transition-all active:translate-y-[3px]", f.f ? "bg-ink-700 text-mist shadow-[0_3px_0_#08112a]" : "bg-sky text-white shadow-[0_3px_0_#2152c4]")}>
              {f.f ? <><UserCheck size={14} className="anim-pop" /> Following</> : <><UserPlus size={14} /> Follow</>}
            </button>
          </div>
        ))}
        {!list.length && <div className="py-6 text-center text-[12px] text-mist">Никого не найдено</div>}
      </div>
    </Asset>
  );
}

function Duel() {
  const [st, setSt] = useState<"lobby" | "search" | "vs" | "fight" | "end">("lobby");
  const [me, setMe] = useState(0);
  const [op, setOp] = useState(0);
  const [t, setT] = useState(10);
  const tm = useRef<number>(0);
  useEffect(() => () => clearInterval(tm.current), []);
  const start = () => {
    setSt("search"); sfx.whoosh();
    setTimeout(() => { setSt("vs"); sfx.open(); }, 1500);
    setTimeout(() => {
      setSt("fight"); setMe(0); setOp(0); setT(10);
      let n = 10;
      tm.current = window.setInterval(() => {
        n--; setT(n); setOp((o) => o + Math.round(Math.random() * 18 - 4));
        if (n <= 0) { clearInterval(tm.current); setSt("end"); }
      }, 1000);
    }, 3000);
  };
  const trade = (good: boolean) => { const d = good ? 12 + Math.round(Math.random() * 10) : -8; setMe((m) => m + d); d > 0 ? sfx.coin() : sfx.wrong(); };
  const win = me >= op;
  useEffect(() => { if (st === "end") (win ? sfx.levelUp : sfx.wrong)(); }, [st]); // eslint-disable-line
  const total = Math.max(1, Math.abs(me) + Math.abs(op));
  return (
    <Asset code="I-003" title="1v1 Trading Duel" desc="PvP-дуэль: матчмейкинг, экран VS, 10-секундный бой с перетягиванием PnL, итоги." hint="Найди соперника" specs={["matchmaking", "VS intro", "tug-of-war"]}>
      <div className="relative h-[330px] overflow-hidden rounded-2xl bg-ink-900/70">
        {st === "lobby" && (
          <div className="anim-fade grid h-full place-items-center text-center">
            <div>
              <Swords size={56} className="mx-auto text-bear anim-float drop-shadow-[0_0_14px_#ff4f6d]" />
              <div className="font-display mt-3 text-lg font-extrabold">Trading Duel</div>
              <div className="text-[12px] text-mist">Кто наберёт больше PnL за 10 секунд</div>
              <Btn tone="bear" className="mt-4" onClick={start} silent>Find opponent</Btn>
            </div>
          </div>
        )}
        {st === "search" && (
          <div className="grid h-full place-items-center">
            <div className="relative grid h-32 w-32 place-items-center">
              {[0, 1, 2].map((i) => <span key={i} className="absolute inset-0 rounded-full border-2 border-sky" style={{ animation: `pulse-ring 1.5s ${i * 0.5}s infinite` }} />)}
              <Avatar name="You" color="#3b82ff" size={56} />
            </div>
            <div className="absolute bottom-10 text-[12px] font-bold text-mist">Поиск соперника…</div>
          </div>
        )}
        {st === "vs" && (
          <div className="relative flex h-full items-center justify-between px-6">
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-sky/40 to-transparent" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-bear/40 to-transparent" />
            <div className="anim-slide-right relative text-center" style={{ animationDirection: "reverse" }}><Avatar name="You" color="#3b82ff" size={72} ring="#3b82ff" /><div className="mt-2 text-sm font-extrabold">You</div><div className="num text-[10px] text-mist">1840 ELO</div></div>
            <div className="anim-pop relative font-display text-5xl font-black italic text-gold drop-shadow-[0_0_20px_#ffc53d]">VS</div>
            <div className="anim-slide-right relative text-center"><Avatar name="Rex" color="#ff4f6d" size={72} ring="#ff4f6d" /><div className="mt-2 text-sm font-extrabold">RexBear</div><div className="num text-[10px] text-mist">1795 ELO</div></div>
          </div>
        )}
        {st === "fight" && (
          <div className="flex h-full flex-col p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Avatar name="You" color="#3b82ff" size={34} /><span key={me} className={cn("num anim-pop text-lg font-extrabold", me >= 0 ? "text-bull" : "text-bear")}>{me >= 0 ? "+" : ""}{me}</span></div>
              <span className={cn("num grid h-12 w-12 place-items-center rounded-full text-xl font-black", t <= 3 ? "anim-pop bg-bear" : "bg-ink-700")} key={t}>{t}</span>
              <div className="flex items-center gap-2"><span className={cn("num text-lg font-extrabold", op >= 0 ? "text-bull" : "text-bear")}>{op >= 0 ? "+" : ""}{op}</span><Avatar name="Rex" color="#ff4f6d" size={34} /></div>
            </div>
            <div className="panel-inset mt-4 flex h-5 overflow-hidden !rounded-full">
              <div className="h-full bg-gradient-to-r from-sky-d to-sky transition-all duration-300" style={{ width: `${50 + ((me - op) / total) * 50}%` }} />
              <div className="h-full flex-1 bg-gradient-to-r from-bear to-bear-d" />
            </div>
            <div className="mt-auto text-center text-[11px] font-bold text-mist">Выбирай сетапы быстрее соперника</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Btn tone="bull" onClick={() => trade(Math.random() > 0.3)} silent><TrendingUp size={16} /> Breakout</Btn>
              <Btn tone="violet" onClick={() => trade(Math.random() > 0.45)} silent>Reversal</Btn>
            </div>
          </div>
        )}
        {st === "end" && (
          <div className="anim-pop relative grid h-full place-items-center text-center">
            {win && <Confetti />}
            <div>
              <Mascot size={96} mood={win ? "hype" : "sad"} />
              <div className={cn("font-display text-2xl font-black", win ? "text-gold" : "text-bear")}>{win ? "VICTORY" : "DEFEAT"}</div>
              <div className="num text-[12px] text-mist">{me} vs {op} · {win ? "+24" : "−18"} ELO</div>
              <div className="mt-3 flex justify-center gap-2"><GhostBtn className="!h-10" onClick={() => setSt("lobby")}>Lobby</GhostBtn><Btn tone="bear" size="sm" onClick={start} silent>Rematch</Btn></div>
            </div>
          </div>
        )}
      </div>
    </Asset>
  );
}

const emojis = ["🚀", "🔥", "💎", "🐻", "😂", "👏"];
function Reactions() {
  const [counts, setCounts] = useState<Record<string, number>>({ "🚀": 12, "🔥": 7, "💎": 3 });
  const [mine, setMine] = useState<string | null>(null);
  const [floaters, setFloaters] = useState<{ id: number; e: string; x: number }[]>([]);
  const [picker, setPicker] = useState(false);
  const react = (e: string) => {
    const was = mine;
    setCounts((c) => { const n = { ...c }; if (was) n[was] = Math.max(0, (n[was] ?? 1) - 1); if (was !== e) n[e] = (n[e] ?? 0) + 1; return n; });
    setMine(was === e ? null : e);
    const id = Date.now();
    setFloaters((f) => [...f, { id, e, x: 20 + Math.random() * 60 }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1000);
    setPicker(false); sfx.tap();
  };
  return (
    <Asset code="I-004" title="Trade Post & Reactions" desc="Пост в ленте о сделке: мини-график, реакции с всплывающими эмодзи и пикером." hint="Поставь реакцию" specs={["picker", "float emoji", "counts"]}>
      <div className="relative rounded-2xl bg-ink-800 p-3.5 shadow-[0_4px_0_#08112a]">
        {floaters.map((f) => <span key={f.id} className="pointer-events-none absolute bottom-12 text-2xl" style={{ left: `${f.x}%`, animation: "rise 1s ease-out forwards" }}>{f.e}</span>)}
        <div className="flex items-center gap-2.5">
          <Avatar name="Mira" color="#ff4f6d" size={36} online />
          <div className="flex-1"><div className="text-[13px] font-extrabold">Mira <span className="font-semibold text-mist">closed a trade</span></div><div className="text-[10px] text-mist">2 min ago</div></div>
          <Chip tone="bull">+18.4%</Chip>
        </div>
        <div className="panel-inset mt-3 flex h-16 items-end gap-1 p-2 !rounded-xl">
          {[30, 45, 38, 55, 50, 68, 62, 80, 76, 95].map((h, i) => <div key={i} className="flex-1 origin-bottom rounded-sm" style={{ height: `${h}%`, background: i % 3 === 2 ? "#ff4f6d" : "#22d39a", animation: `bar-grow .5s ${i * 40}ms both` }} />)}
        </div>
        <div className="mt-2 text-[12px]">SOL long 5x · вход по пробою уровня 142 📈</div>
        <div className="relative mt-3 flex flex-wrap items-center gap-1.5">
          {Object.entries(counts).filter(([, n]) => n > 0).map(([e, n]) => (
            <button key={e} onClick={() => react(e)} className={cn("flex h-8 items-center gap-1 rounded-full px-2.5 text-[12px] font-extrabold transition active:scale-90", mine === e ? "bg-sky/20 ring-2 ring-sky" : "bg-ink-700")}>
              {e}<span key={n} className="num anim-pop">{n}</span>
            </button>
          ))}
          <button onClick={() => { setPicker(!picker); sfx.soft(); }} className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-sm text-mist hover:text-white">＋</button>
          {picker && (
            <div className="panel-raised anim-pop absolute bottom-10 left-0 z-10 flex gap-1 p-1.5 !rounded-full">
              {emojis.map((e, i) => <button key={e} onClick={() => react(e)} className="anim-pop grid h-9 w-9 place-items-center rounded-full text-xl transition hover:-translate-y-1 hover:scale-125" style={{ animationDelay: `${i * 30}ms` }}>{e}</button>)}
            </div>
          )}
        </div>
      </div>
    </Asset>
  );
}

function ShareCard() {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState(0);
  const themes = ["from-sky-d to-violet-d", "from-bull-d to-cyan-d", "from-ember-d to-bear-d"];
  return (
    <Asset code="I-005" title="Shareable Result Card" desc="Карточка достижения для соцсетей: темы, копирование реф-ссылки, кнопка шеринга." hint="Смени тему, скопируй" specs={["3 themes", "copy link", "native share"]}>
      <div key={theme} className={cn("anim-pop relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 shadow-[inset_0_2px_0_rgba(255,255,255,.2),0_8px_0_#060b18]", themes[theme])}>
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">CandleQuest · Weekly recap</div>
        <div className="mt-2 flex items-center gap-3">
          <TrophyIcon size={60} className="anim-float" />
          <div>
            <div className="font-display text-3xl font-black">#2</div>
            <div className="text-[12px] font-bold text-white/80">Diamond League</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[["47", "streak"], ["87%", "accuracy"], ["+32%", "sim PnL"]].map(([v, l]) => (
            <div key={l} className="rounded-xl bg-black/20 py-2"><div className="num text-sm font-extrabold">{v}</div><div className="text-[9px] font-bold uppercase text-white/60">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {themes.map((t, i) => <button key={t} onClick={() => { setTheme(i); sfx.tick(); }} className={cn("h-8 w-8 rounded-full bg-gradient-to-br transition", t, theme === i ? "scale-110 ring-2 ring-white" : "opacity-60")} />)}
        <button onClick={() => { navigator.clipboard?.writeText("candlequest.app/r/alex").catch(() => {}); setCopied(true); sfx.coin(); setTimeout(() => setCopied(false), 1400); }} className="panel-inset ml-auto flex h-10 items-center gap-2 px-3 text-[11px] font-bold !rounded-xl">
          <span className="num text-mist">candlequest.app/r/alex</span>{copied ? <Check size={14} className="anim-pop text-bull" /> : <Copy size={14} />}
        </button>
      </div>
      <Btn tone="sky" block className="mt-3" onClick={() => { (navigator as Navigator & { share?: (d: object) => Promise<void> }).share?.({ title: "CandleQuest", url: "https://candlequest.app" }).catch(() => {}); }}><Share2 size={16} /> Share</Btn>
    </Asset>
  );
}

const feed = [
  { who: "Kate", c: "#ffc53d", t: "reached a 100-day streak", I: FlameIcon, time: "1m" },
  { who: "Denis", c: "#22d39a", t: "passed Unit 5 exam with 3 crowns", I: StarIcon, time: "8m" },
  { who: "Omar", c: "#8b5cff", t: "got promoted to Diamond", I: GemIcon, time: "23m" },
  { who: "Mira", c: "#ff4f6d", t: "won 5 duels in a row", I: TrophyIcon, time: "1h" },
];
function ActivityFeed() {
  const [liked, setLiked] = useState<number[]>([]);
  const [items, setItems] = useState(feed.slice(0, 3));
  const more = () => { setItems((x) => [feed[(x.length) % feed.length], ...x].slice(0, 5)); sfx.whoosh(); };
  return (
    <Asset code="I-006" title="Friends Activity Feed" desc="Лента друзей: новые события сверху, поздравления с анимацией, живые обновления." hint="Поздравь друга" specs={["prepend", "congrats", "timeline"]}>
      <div className="relative space-y-2.5 pl-4">
        <span className="absolute bottom-2 left-[5px] top-2 w-0.5 rounded-full bg-ink-600" />
        {items.map((f, i) => (
          <div key={`${f.who}-${i}-${items.length}`} className={cn("relative flex items-center gap-3 rounded-2xl bg-ink-800 p-2.5 shadow-[0_3px_0_#08112a]", i === 0 && "anim-slide-right")}>
            <span className="absolute -left-[15px] h-2.5 w-2.5 rounded-full border-2 border-ink-900" style={{ background: f.c }} />
            <Avatar name={f.who} color={f.c} size={34} />
            <div className="min-w-0 flex-1 text-[12px]"><span className="font-extrabold">{f.who}</span> <span className="text-mist">{f.t}</span><div className="text-[10px] text-mist/70">{f.time} ago</div></div>
            <f.I size={26} />
            <button onClick={() => { setLiked(liked.includes(i) ? liked.filter((x) => x !== i) : [...liked, i]); sfx.correct(); }} className={cn("h-8 rounded-xl px-2 text-[10px] font-extrabold uppercase transition active:scale-90", liked.includes(i) ? "bg-gold text-ink-900 shadow-[0_2px_0_#c98a12]" : "bg-ink-700 text-mist")}>
              {liked.includes(i) ? <span className="anim-pop inline-block">🎉</span> : "Congrats"}
            </button>
          </div>
        ))}
      </div>
      <GhostBtn className="mt-3 !h-10 w-full !text-[11px]" onClick={more}>Simulate new event</GhostBtn>
    </Asset>
  );
}

export default function Social() {
  return (
    <Section id="social" index="09" title="Social & Competition" subtitle="Профиль, друзья, PvP-дуэли, реакции, шеринг, лента">
      <Profile />
      <Duel />
      <Friends />
      <Reactions />
      <ShareCard />
      <ActivityFeed />
    </Section>
  );
}
