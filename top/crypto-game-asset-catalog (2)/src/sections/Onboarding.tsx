import { useEffect, useState } from "react";
import { Check, ChevronLeft, Bell, Sparkles } from "lucide-react";
import { Asset, Section, Btn, Bar, Toggle, GhostBtn } from "../kit/ui";
import { Mascot, type Mood } from "../kit/Mascot";
import { CandleUpIcon, ShieldIcon, TargetIcon, TrophyIcon, BoltIcon, FlameIcon, GemIcon } from "../kit/GameIcons";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

const qs = [
  { q: "Рынок упал на 20% за день. Твои действия?", a: [["Продаю всё", 0], ["Жду и наблюдаю", 1], ["Докупаю", 2]] },
  { q: "Какой горизонт инвестиций тебе ближе?", a: [["Дни", 2], ["Месяцы", 1], ["Годы", 0]] },
  { q: "Сколько готов потерять ради +50%?", a: [["5%", 0], ["20%", 1], ["50%", 2]] },
] as const;
const profiles = [
  { n: "Guardian", d: "Консервативный — защита капитала прежде всего.", c: "#22d39a", I: ShieldIcon, m: "happy" as Mood },
  { n: "Strategist", d: "Сбалансированный — риск под контролем.", c: "#3b82ff", I: TargetIcon, m: "think" as Mood },
  { n: "Hunter", d: "Агрессивный — высокая волатильность, быстрые решения.", c: "#ff4f6d", I: BoltIcon, m: "hype" as Mood },
];
function RiskQuiz() {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<number[]>([]);
  const [pick, setPick] = useState<number | null>(null);
  const done = i >= qs.length;
  const score = ans.reduce((s, v) => s + v, 0);
  const prof = profiles[score <= 1 ? 0 : score <= 4 ? 1 : 2];
  const next = () => {
    if (pick === null) return;
    setAns([...ans, qs[i].a[pick][1]]); setPick(null); setI(i + 1);
    i + 1 >= qs.length ? sfx.levelUp() : sfx.correct();
  };
  return (
    <Asset code="J-001" title="Risk Profile Quiz" desc="Онбординг-опрос о риске: вопрос → плитки → результат-архетип с маскотом." hint="Пройди 3 вопроса" specs={["3 steps", "archetype", "back nav"]}>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => { if (i > 0) { setI(i - 1); setAns(ans.slice(0, -1)); sfx.soft(); } }} className={cn("text-mist", i === 0 && "opacity-30")}><ChevronLeft size={20} /></button>
        <div className="flex-1"><Bar value={(Math.min(i, qs.length) / qs.length) * 100} tone="sky" h={12} /></div>
      </div>
      {!done ? (
        <div key={i} className="anim-fade">
          <div className="flex items-start gap-3">
            <Mascot size={64} mood="think" />
            <div className="panel-raised relative flex-1 p-3 text-[13px] font-bold">{qs[i].q}</div>
          </div>
          <div className="mt-4 space-y-2.5">
            {qs[i].a.map(([t], k) => (
              <button key={t} onClick={() => { setPick(k); sfx.tick(); }} className={cn("flex h-12 w-full items-center gap-3 rounded-2xl border-2 px-4 text-left text-[13px] font-extrabold transition active:translate-y-1", pick === k ? "border-sky bg-sky/15 text-sky shadow-[0_4px_0_#2152c4]" : "border-ink-500 bg-ink-700 shadow-[0_4px_0_#0f1c3a]")}>
                <span className={cn("grid h-6 w-6 place-items-center rounded-lg border-2 text-[10px]", pick === k ? "border-sky bg-sky text-white" : "border-ink-400 text-mist")}>{pick === k ? <Check size={12} strokeWidth={4} /> : k + 1}</span>{t}
              </button>
            ))}
          </div>
          <Btn tone="bull" block className="mt-4" disabled={pick === null} onClick={next} silent>Continue</Btn>
        </div>
      ) : (
        <div className="anim-pop text-center">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: `${prof.c}55` }} />
            <Mascot size={110} mood={prof.m} />
          </div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">Your archetype</div>
          <div className="mt-1 flex items-center justify-center gap-2 font-display text-2xl font-black" style={{ color: prof.c }}><prof.I size={30} />{prof.n}</div>
          <p className="mx-auto mt-1 max-w-[260px] text-[12px] text-mist">{prof.d}</p>
          <GhostBtn className="mt-4 !h-10" onClick={() => { setI(0); setAns([]); }}>Retake</GhostBtn>
        </div>
      )}
    </Asset>
  );
}

const goals = [
  { n: "Understand crypto", I: GemIcon },
  { n: "Read charts", I: CandleUpIcon },
  { n: "Manage risk", I: ShieldIcon },
  { n: "Become a pro trader", I: TrophyIcon },
];
const daily = [
  { m: 5, l: "Casual", c: "#22d39a" },
  { m: 10, l: "Regular", c: "#3b82ff" },
  { m: 15, l: "Serious", c: "#8b5cff" },
  { m: 20, l: "Intense", c: "#ff4f6d" },
];
function Goals() {
  const [g, setG] = useState<number[]>([1]);
  const [d, setD] = useState(1);
  return (
    <Asset code="J-002" title="Goal & Daily Target Picker" desc="Мультивыбор целей плитками и дневная цель с цветовой интенсивностью и прогнозом." hint="Выбери цели и темп" specs={["multi-tile", "intensity", "forecast"]}>
      <div className="grid grid-cols-2 gap-2.5">
        {goals.map(({ n, I }, i) => {
          const on = g.includes(i);
          return (
            <button key={n} onClick={() => { setG(on ? g.filter((x) => x !== i) : [...g, i]); sfx.toggle(!on); }} className={cn("relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all active:translate-y-1", on ? "-translate-y-0.5 border-bull bg-bull/10 shadow-[0_5px_0_#10916a]" : "border-ink-500 bg-ink-700 shadow-[0_4px_0_#0f1c3a]")}>
              {on && <span className="anim-pop absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-bull"><Check size={12} strokeWidth={4} /></span>}
              <I size={38} className={on ? "anim-pop" : ""} style={{ filter: on ? undefined : "saturate(.4)" }} />
              <span className="text-[12px] font-extrabold leading-tight">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 space-y-2">
        {daily.map((x, i) => (
          <button key={x.m} onClick={() => { setD(i); sfx.tick(); }} className={cn("flex h-11 w-full items-center justify-between rounded-2xl border-2 px-4 text-[13px] font-extrabold transition", d === i ? "text-white" : "border-ink-500 bg-ink-800 text-mist")} style={d === i ? { borderColor: x.c, background: `${x.c}1f`, boxShadow: `0 4px 0 ${x.c}88` } : undefined}>
            <span>{x.l}</span>
            <span className="flex items-center gap-2"><span className="num">{x.m} min/day</span><span className="flex gap-0.5">{[0, 1, 2, 3].map((k) => <span key={k} className="h-3 w-1.5 rounded-full" style={{ background: k <= i ? x.c : "#273f75" }} />)}</span></span>
          </button>
        ))}
      </div>
      <div key={d} className="anim-fade mt-3 text-center text-[12px] text-mist">≈ <span className="num font-extrabold text-white">{daily[d].m * 30 / 5}</span> уроков в месяц · базовый курс за <span className="font-extrabold text-white">{Math.ceil(40 / daily[d].m * 5)} дней</span></div>
    </Asset>
  );
}

const skins = ["#3b82ff", "#22d39a", "#8b5cff", "#ff8a3d", "#ff4f6d"];
const hats = ["none", "crown", "cap", "headset"];
const accs = ["none", "glasses", "chain"];
function AvatarBuilder() {
  const [skin, setSkin] = useState(0);
  const [hat, setHat] = useState(1);
  const [acc, setAcc] = useState(1);
  const [bg, setBg] = useState(0);
  const bgs = ["from-sky-d to-violet-d", "from-bull-d to-cyan-d", "from-gold-d to-ember-d", "from-ink-600 to-ink-800"];
  const random = () => { setSkin(Math.floor(Math.random() * skins.length)); setHat(Math.floor(Math.random() * hats.length)); setAcc(Math.floor(Math.random() * accs.length)); setBg(Math.floor(Math.random() * bgs.length)); sfx.whoosh(); };
  const c = skins[skin];
  return (
    <Asset code="J-003" title="Avatar Builder" desc="Конструктор аватара: цвет, головной убор, аксессуар, фон и кнопка случайного выбора." hint="Собери персонажа" specs={["4 layers", "randomize", "live preview"]}>
      <div className={cn("relative mx-auto grid h-44 w-44 place-items-center rounded-[36px] bg-gradient-to-br shadow-[inset_0_2px_0_rgba(255,255,255,.2),0_6px_0_#060b18]", bgs[bg])}>
        <svg key={`${skin}${hat}${acc}`} viewBox="0 0 120 120" className="anim-pop h-36 w-36">
          <ellipse cx="60" cy="112" rx="30" ry="4" fill="#000" opacity=".3" />
          <path d="M20 108c0-22 18-36 40-36s40 14 40 36z" fill={c} />
          <circle cx="60" cy="52" r="30" fill={c} />
          <circle cx="60" cy="52" r="30" fill="url(#shade)" />
          <defs><radialGradient id="shade" cx=".35" cy=".3"><stop stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#000" stopOpacity=".15" /></radialGradient></defs>
          <circle cx="49" cy="52" r="5" fill="#0a1224" /><circle cx="71" cy="52" r="5" fill="#0a1224" />
          <circle cx="50.5" cy="50.5" r="1.6" fill="#fff" /><circle cx="72.5" cy="50.5" r="1.6" fill="#fff" />
          <path d="M50 66q10 8 20 0" stroke="#0a1224" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {accs[acc] === "glasses" && <g><rect x="38" y="44" width="18" height="14" rx="4" fill="#0a1224" opacity=".85" /><rect x="64" y="44" width="18" height="14" rx="4" fill="#0a1224" opacity=".85" /><path d="M56 50h8" stroke="#0a1224" strokeWidth="3" /><path d="M41 47l6 6" stroke="#2bd9ff" strokeWidth="2" /></g>}
          {accs[acc] === "chain" && <path d="M38 84q22 16 44 0" stroke="#ffc53d" strokeWidth="4" fill="none" strokeDasharray="4 2" />}
          {accs[acc] === "chain" && <circle cx="60" cy="92" r="6" fill="#ffc53d" stroke="#c98a12" strokeWidth="2" />}
          {hats[hat] === "crown" && <path d="M38 28l6-16 10 10 6-14 6 14 10-10 6 16z" fill="#ffc53d" stroke="#c98a12" strokeWidth="2" strokeLinejoin="round" />}
          {hats[hat] === "cap" && <g><path d="M30 36a30 22 0 0160 0z" fill="#0a1224" /><path d="M60 34h38q-4 8-20 6z" fill="#0a1224" /><circle cx="60" cy="24" r="4" fill="#22d39a" /></g>}
          {hats[hat] === "headset" && <g><path d="M28 50a32 32 0 0164 0" stroke="#1d3160" strokeWidth="6" fill="none" /><rect x="22" y="44" width="10" height="18" rx="4" fill="#ff4f6d" /><rect x="88" y="44" width="10" height="18" rx="4" fill="#ff4f6d" /></g>}
        </svg>
      </div>
      <div className="mt-4 space-y-3">
        <Row label="Color">{skins.map((s, i) => <button key={s} onClick={() => { setSkin(i); sfx.tick(); }} className={cn("h-8 w-8 rounded-full transition shadow-[0_3px_0_rgba(0,0,0,.35)]", skin === i && "scale-110 ring-2 ring-white")} style={{ background: s }} />)}</Row>
        <Row label="Hat">{hats.map((h, i) => <Opt key={h} on={hat === i} onClick={() => { setHat(i); sfx.tick(); }}>{h}</Opt>)}</Row>
        <Row label="Extra">{accs.map((h, i) => <Opt key={h} on={acc === i} onClick={() => { setAcc(i); sfx.tick(); }}>{h}</Opt>)}</Row>
        <Row label="BG">{bgs.map((b, i) => <button key={b} onClick={() => { setBg(i); sfx.tick(); }} className={cn("h-8 w-8 rounded-lg bg-gradient-to-br", b, bg === i && "ring-2 ring-white")} />)}</Row>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3"><GhostBtn onClick={random}><Sparkles size={14} /> Random</GhostBtn><Btn tone="bull" onClick={() => sfx.levelUp()} silent>Save</Btn></div>
    </Asset>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><span className="w-12 text-[10px] font-extrabold uppercase text-mist">{label}</span><div className="flex flex-1 flex-wrap gap-1.5">{children}</div></div>;
}
function Opt({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={cn("h-8 rounded-lg px-2.5 text-[10px] font-extrabold capitalize transition", on ? "bg-sky text-white shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{children}</button>;
}

function NotifPrompt() {
  const [st, setSt] = useState<"ask" | "sys" | "on" | "off">("ask");
  const [prefs, setPrefs] = useState({ streak: true, price: true, league: false });
  const [time, setTime] = useState(19);
  return (
    <Asset code="J-004" title="Notification Permission" desc="Мягкий pre-prompt перед системным запросом, затем настройка типов и времени напоминаний." hint="Разреши уведомления" specs={["pre-prompt", "system mock", "prefs"]}>
      <div className="relative min-h-[330px]">
        {st === "ask" && (
          <div className="anim-fade text-center">
            <div className="relative mx-auto w-fit">
              <Mascot size={100} mood="happy" />
              <span className="anim-pop absolute -right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-bear shadow-[0_3px_0_#c02a47]"><Bell size={20} className="anim-wiggle" style={{ animationIterationCount: "infinite", animationDuration: "1s" }} /></span>
            </div>
            <div className="font-display mt-2 text-base font-extrabold">Не теряй серию!</div>
            <p className="mx-auto mt-1 max-w-[250px] text-[12px] text-mist">Торо напомнит об уроке и сообщит о резких движениях рынка.</p>
            <Btn tone="bull" block className="mt-5" onClick={() => setSt("sys")}>Remind me</Btn>
            <button onClick={() => setSt("off")} className="mt-3 text-[12px] font-bold text-mist">Not now</button>
          </div>
        )}
        {st === "sys" && (
          <div className="grid h-[330px] place-items-center bg-black/40 anim-fade rounded-2xl">
            <div className="anim-pop w-60 overflow-hidden rounded-2xl bg-[#2a2d36] text-center">
              <div className="p-4"><div className="text-[13px] font-bold">“CandleQuest” Would Like to Send You Notifications</div><div className="mt-1 text-[11px] text-white/60">Alerts, sounds and badges.</div></div>
              <div className="grid grid-cols-2 border-t border-white/10 text-[13px] text-[#4b9dff]">
                <button onClick={() => { setSt("off"); sfx.soft(); }} className="border-r border-white/10 py-2.5">Don’t Allow</button>
                <button onClick={() => { setSt("on"); sfx.correct(); }} className="py-2.5 font-bold">Allow</button>
              </div>
            </div>
          </div>
        )}
        {st === "on" && (
          <div className="anim-fade space-y-3">
            <div className="flex items-center gap-2 rounded-2xl bg-bull/15 p-3 text-[13px] font-bold text-bull"><Check size={16} /> Уведомления включены</div>
            {([["streak", "Streak reminder", "ember"], ["price", "Price alerts", "gold"], ["league", "League updates", "violet"]] as const).map(([k, l, t]) => (
              <div key={k} className="flex items-center justify-between rounded-2xl bg-ink-800 p-3 text-[13px] font-bold shadow-[0_3px_0_#08112a]">{l}<Toggle on={prefs[k]} tone={t} onChange={(v) => setPrefs({ ...prefs, [k]: v })} /></div>
            ))}
            <div className="rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#08112a]">
              <div className="mb-2 flex justify-between text-[13px] font-bold"><span>Reminder time</span><span className="num text-sky">{time}:00</span></div>
              <div className="flex gap-1">{[8, 12, 19, 22].map((h) => <button key={h} onClick={() => { setTime(h); sfx.tick(); }} className={cn("num h-9 flex-1 rounded-lg text-[11px] font-extrabold", time === h ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-700 text-mist")}>{h}:00</button>)}</div>
            </div>
          </div>
        )}
        {st === "off" && (
          <div className="anim-fade grid h-[300px] place-items-center text-center">
            <div><Mascot size={90} mood="sad" /><div className="mt-2 text-[13px] font-bold">Можно включить позже в настройках</div><GhostBtn className="mt-3 !h-10" onClick={() => setSt("ask")}>Try again</GhostBtn></div>
          </div>
        )}
      </div>
    </Asset>
  );
}

function Splash() {
  const [p, setP] = useState(0);
  const [k, setK] = useState(0);
  useEffect(() => {
    setP(0);
    const t = setInterval(() => setP((v) => { if (v >= 100) { clearInterval(t); return 100; } return v + 2 + Math.random() * 4; }), 60);
    return () => clearInterval(t);
  }, [k]);
  const tips = ["Никогда не рискуй больше 2% депозита", "Тренд — твой друг", "Стоп-лосс ставится до входа"];
  return (
    <Asset code="J-005" title="Splash & Loading Screen" desc="Заставка: логотип собирается из свечей, прогресс, совет дня, переход в игру." hint="Перезапусти заставку" specs={["logo build", "tips", "progress"]}>
      <div className="relative grid h-[330px] place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_40%,#1d3a7a,#0a1224_70%)]">
        <div className="text-center" key={k}>
          <div className="flex h-24 items-end justify-center gap-2">
            {[40, 64, 50, 86, 72].map((h, i) => (
              <div key={i} className="relative w-5 origin-bottom" style={{ height: h, animation: `bar-grow .6s ${i * 120}ms both cubic-bezier(.3,1.6,.5,1)` }}>
                <div className="absolute left-1/2 -top-2 -bottom-2 w-0.5 -translate-x-1/2 rounded" style={{ background: i === 2 ? "#ff4f6d" : "#22d39a" }} />
                <div className="relative h-full rounded-md shadow-[inset_0_2px_0_rgba(255,255,255,.35)]" style={{ background: i === 2 ? "#ff4f6d" : "#22d39a" }} />
              </div>
            ))}
          </div>
          <div className="font-display mt-4 text-2xl font-black anim-pop" style={{ animationDelay: "700ms" }}>CANDLE<span className="text-gold">QUEST</span></div>
          <div className="mx-auto mt-6 w-52"><Bar value={p} tone="gold" h={10} /></div>
          <div className="mt-3 h-8 text-[11px] text-mist">{p >= 100 ? <span className="anim-pop inline-flex items-center gap-1 font-bold text-bull"><FlameIcon size={16} /> Ready to trade</span> : `💡 ${tips[Math.floor(p / 34) % 3]}`}</div>
        </div>
      </div>
      <GhostBtn className="mt-4 !h-10 w-full !text-[11px]" onClick={() => setK((x) => x + 1)}>Replay splash</GhostBtn>
    </Asset>
  );
}

function Settings() {
  const [s, setS] = useState({ sound: true, haptic: true, motion: false, dark: true });
  const [lang, setLang] = useState("RU");
  const [vol, setVol] = useState(70);
  return (
    <Asset code="J-006" title="Settings Panel" desc="Экран настроек: группы, свитчи, громкость с живым значением, выбор языка, опасная зона." hint="Настрой под себя" specs={["grouped", "volume", "danger zone"]}>
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-mist">Experience</div>
          <div className="divide-y divide-white/5 overflow-hidden rounded-2xl bg-ink-800 shadow-[0_4px_0_#08112a]">
            {([["sound", "Sound effects", "bull"], ["haptic", "Haptics", "sky"], ["motion", "Reduce motion", "violet"]] as const).map(([k, l, t]) => (
              <div key={k} className="flex items-center justify-between px-3.5 py-2.5 text-[13px] font-bold">{l}<Toggle on={s[k]} tone={t} onChange={(v) => setS({ ...s, [k]: v })} /></div>
            ))}
            <div className="px-3.5 py-3">
              <div className="mb-1 flex justify-between text-[13px] font-bold"><span>Volume</span><span className="num text-bull">{vol}%</span></div>
              <input type="range" min={0} max={100} value={vol} onChange={(e) => { setVol(+e.target.value); if (+e.target.value % 10 === 0) sfx.tick(); }} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#22d39a", background: `linear-gradient(90deg,#22d39a ${vol}%,#0b1530 0)` }} />
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-mist">Language</div>
          <div className="grid grid-cols-4 gap-2">{["RU", "EN", "ES", "TR"].map((l) => <button key={l} onClick={() => { setLang(l); sfx.tick(); }} className={cn("h-10 rounded-xl text-[12px] font-extrabold transition", lang === l ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{l}</button>)}</div>
        </div>
        <div className="rounded-2xl border-2 border-bear/40 bg-bear/5 p-3">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-bear">Danger zone</div>
          <button onClick={() => sfx.error()} className="mt-2 h-10 w-full rounded-xl bg-bear/15 text-[12px] font-extrabold text-bear transition hover:bg-bear/25 active:translate-y-0.5">Delete account</button>
        </div>
      </div>
    </Asset>
  );
}

export default function Onboarding() {
  return (
    <Section id="onboarding" index="10" title="Onboarding & Personalization" subtitle="Первый запуск, риск-профиль, цели, аватар, уведомления, настройки">
      <Splash />
      <RiskQuiz />
      <Goals />
      <AvatarBuilder />
      <NotifPrompt />
      <Settings />
    </Section>
  );
}
