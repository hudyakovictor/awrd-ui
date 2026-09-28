import { useState } from "react";
import { Asset, Avatar, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { burstConfetti, burstSparks } from "../utils/fx";

/* ============ shared ============ */
const SKINS = ["from-[#3d7bff] to-[#8d5cff]", "from-[#1fdb8b] to-[#2ed3f0]", "from-[#ff4d6a] to-[#ffc53d]", "from-[#8d5cff] to-[#ff4d9a]", "from-[#ffc53d] to-[#ff7a2e]", "from-[#2ed3f0] to-[#3d7bff]"];
const FRAMES = [
  { id: "none", n: "Без рамки", ring: "" },
  { id: "gold", n: "Gold", ring: "ring-[3px] ring-gold ring-offset-2 ring-offset-ink-800" },
  { id: "bull", n: "Bull", ring: "ring-[3px] ring-bull ring-offset-2 ring-offset-ink-800" },
  { id: "neon", n: "Neon", ring: "ring-[3px] ring-cyan ring-offset-2 ring-offset-ink-800 shadow-[0_0_18px_rgba(46,211,240,.7)]" },
  { id: "crown", n: "Crown", ring: "ring-[3px] ring-violet ring-offset-2 ring-offset-ink-800" },
];

/* ============ 1. AVATAR BUILDER ============ */
function Builder() {
  const [name, setName] = useState("Satoshi N");
  const [skin, setSkin] = useState(0);
  const [frame, setFrame] = useState(1);
  const [status, setStatus] = useState<"online" | "trading" | "away" | "off">("trading");
  const [hat, setHat] = useState<"none" | "crown" | "cap">("crown");
  const [saved, setSaved] = useState<string[]>([]);
  const save = (e: React.MouseEvent) => {
    setSaved((s) => [...s.slice(-5), name]);
    const r = (e.target as HTMLElement).getBoundingClientRect();
    burstSparks(r.left + r.width / 2, r.top, 18); sfx.success();
  };
  return (
    <Asset title="Avatar Builder" id="ava.builder" desc="Собери аватар: имя, градиент, рамка, статус, головной убор. Сохранение в коллекцию." className="lg:col-span-2">
      <div className="grid sm:grid-cols-[190px_1fr] gap-5">
        <div className="inset !rounded-3xl p-5 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(140,170,255,.5) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
          <div className="relative anim-float">
            {hat === "crown" && <span className="absolute -top-7 left-1/2 -translate-x-1/2 -rotate-6"><Glyph name="crown" size={34} /></span>}
            {hat === "cap" && <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-6 rounded-t-full bg-gradient-to-b from-bear to-[#7a1428] border-b-4 border-ink-900" />}
            <Avatar name={name} size={96} status={status} ring={FRAMES[frame].ring} className={cn(skin % 2 && "saturate-150")} />
          </div>
          <div className="relative font-extrabold text-[15px] mt-3">{name || "Без имени"}</div>
          <Badge tone={status === "online" ? "bull" : status === "trading" ? "gold" : status === "away" ? "bear" : "neutral"} size="xs" dot={status !== "off"}>{status}</Badge>
        </div>
        <div className="space-y-4">
          <div>
            <div className="label-caps">Имя</div>
            <input value={name} onChange={(e) => setName(e.target.value.slice(0, 18))} className="w-full h-11 px-4 rounded-xl bg-[#0a1330] border-2 border-[#22366f] focus:border-blue outline-none font-bold text-[13px]" placeholder="Nickname…" />
          </div>
          <div>
            <div className="label-caps">Градиент</div>
            <div className="flex gap-2">{SKINS.map((g, i) => <button key={g} onClick={() => { setSkin(i); sfx.tick(); }} className={cn("size-9 rounded-xl bg-gradient-to-br transition-transform hover:scale-110", g, skin === i && "ring-2 ring-white scale-110")} />)}</div>
          </div>
          <div>
            <div className="label-caps">Рамка</div>
            <div className="flex flex-wrap gap-2">{FRAMES.map((f, i) => <button key={f.id} onClick={() => { setFrame(i); sfx.tick(); }} className={cn("h-9 px-3 rounded-xl text-[11.5px] font-extrabold border-2 transition", frame === i ? "border-blue bg-blue/15" : "border-[#22366f] text-mute hover:text-txt")}>{f.n}</button>)}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="label-caps">Статус</div>
              <div className="flex gap-1.5">{(["online", "trading", "away", "off"] as const).map((s) => <button key={s} onClick={() => { setStatus(s); sfx.toggle(); }} className={cn("size-8 rounded-lg grid place-items-center border-2", status === s ? "border-blue bg-blue/15" : "border-transparent")}><span className={cn("size-3 rounded-full", s === "online" && "bg-bull", s === "trading" && "bg-gold animate-pulse", s === "away" && "bg-bear", s === "off" && "bg-dim")} /></button>)}</div>
            </div>
            <div>
              <div className="label-caps">Убор</div>
              <div className="flex gap-1.5">{(["none", "crown", "cap"] as const).map((h) => <button key={h} onClick={() => { setHat(h); sfx.tick(); }} className={cn("h-8 px-2.5 rounded-lg text-[11px] font-extrabold border-2 capitalize", hat === h ? "border-gold bg-gold/15" : "border-transparent text-mute")}>{h}</button>)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Btn3D size="sm" variant="bull" onClick={save} icon={<Icon name="check" size={14} stroke={3} />}>Save</Btn3D>
            <div className="flex -space-x-2">{saved.map((n, i) => <span key={i} className="border-2 border-ink-800 rounded-full anim-pop"><Avatar name={n} size={28} /></span>)}</div>
          </div>
        </div>
      </div>
    </Asset>
  );
}

/* ============ 2. STATUS RINGS ============ */
function StatusRings() {
  const users = [
    { n: "Satoshi N", s: "online" as const }, { n: "Vitalik B", s: "trading" as const },
    { n: "Cathie W", s: "away" as const }, { n: "Mike S", s: "off" as const },
  ];
  const [tick, setTick] = useState(0);
  return (
    <Asset title="Status Rings" id="ava.status" desc="Пульс онлайна, волны торговли, эхо звонка. Клик — смена статуса по кругу.">
      <div className="grid grid-cols-2 gap-4">
        {users.map((u, i) => <StatusCell key={u.n} name={u.n} init={u.s} delay={i * 0.2} onTick={() => setTick((t) => t + 1)} />)}
      </div>
      <div className="text-center text-[10.5px] text-dim font-bold mt-3">переключений: <span className="num">{tick}</span> · клик по аватару</div>
    </Asset>
  );
}
function StatusCell({ name, init, delay, onTick }: { name: string; init: "online" | "trading" | "away" | "off"; delay: number; onTick: () => void }) {
  const order = ["online", "trading", "away", "off"] as const;
  const [s, setS] = useState(init);
  const c = s === "online" ? "#1fdb8b" : s === "trading" ? "#ffc53d" : s === "away" ? "#ff4d6a" : "#5b6a98";
  return (
    <button onClick={() => { setS(order[(order.indexOf(s) + 1) % 4]); onTick(); sfx.toggle(); }} className="flex flex-col items-center gap-2 group">
      <span className="relative">
        {(s === "online" || s === "trading") && [0, 1].map((k) => <span key={k} className="absolute inset-0 rounded-full border-2" style={{ borderColor: c, animation: `pulse-ring 2s ${delay + k}s infinite` }} />)}
        <Avatar name={name} size={58} status={s} />
        {s === "trading" && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-extrabold bg-gold text-ink-900 rounded px-1.5 py-px whitespace-nowrap anim-pop">IN TRADE</span>}
      </span>
      <span className="text-[11.5px] font-extrabold group-hover:text-txt text-mute transition">{name}</span>
    </button>
  );
}

/* ============ 3. LEVEL BADGES ============ */
function LevelBadges() {
  const [lvl, setLvl] = useState(12);
  const tiers = [
    { min: 0, n: "Rookie", c: "#8e9cc8" }, { min: 5, n: "Trader", c: "#3d7bff" }, { min: 10, n: "Pro", c: "#8d5cff" },
    { min: 15, n: "Whale", c: "#ffc53d" }, { min: 20, n: "Legend", c: "#ff4d6a" },
  ];
  const tier = [...tiers].reverse().find((t) => lvl >= t.min) ?? tiers[0];
  return (
    <Asset title="Level Badges" id="ava.level" desc="Тир меняется от уровня: цвет кольца, свечение и титул. Ползунок или кнопки.">
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
            <circle cx="55" cy="55" r="48" fill="none" stroke="#0a1330" strokeWidth="9" />
            <circle cx="55" cy="55" r="48" fill="none" stroke={tier.c} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${((lvl % 5) / 5) * 301} 301`} style={{ transition: "all .6s cubic-bezier(.3,1.2,.4,1)", filter: `drop-shadow(0 0 8px ${tier.c})` }} />
          </svg>
          <div className="absolute inset-0 grid place-items-center"><Avatar name="You Me" size={72} /></div>
          <span key={tier.n} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-extrabold rounded-full px-2.5 py-0.5 anim-pop" style={{ background: tier.c, color: "#071022" }}>{tier.n}</span>
        </div>
        <div className="flex-1">
          <div className="num text-[40px] font-extrabold leading-none" style={{ color: tier.c }}>{lvl}</div>
          <div className="label-caps !mb-2">level</div>
          <input type="range" min={1} max={25} value={lvl} onChange={(e) => setLvl(+e.target.value)} className="w-full accent-[#8d5cff]" />
          <div className="flex gap-1.5 mt-2">
            <Btn3D size="xs" variant="neutral" onClick={() => setLvl(Math.max(1, lvl - 1))}>−1</Btn3D>
            <Btn3D size="xs" variant="gold" onClick={(e) => { setLvl(Math.min(25, lvl + 1)); const r = (e.target as HTMLElement).getBoundingClientRect(); burstSparks(r.left + 20, r.top, 12, tier.c); sfx.coin(); }}>+1</Btn3D>
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-4">{tiers.map((t) => <span key={t.n} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: lvl >= t.min ? t.c : "#16275a" }} />)}</div>
    </Asset>
  );
}

/* ============ 4. GROUP STACK ============ */
function GroupStack() {
  const [n, setN] = useState(6);
  const [hover, setHover] = useState(false);
  const names = ["Satoshi N", "Vitalik B", "Cathie W", "Mike S", "Anna K", "Leo T", "Dana R", "Tom H", "Ivy L", "Max P"];
  const shown = names.slice(0, Math.min(n, 5));
  const extra = n - shown.length;
  return (
    <Asset title="Group Stack" id="ava.group" desc="Стопка участников: hover раздвигает, счётчик +N, ползунок меняет размер группы.">
      <div className="inset !rounded-2xl p-4">
        <div className="flex items-center min-h-[56px]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          {shown.map((u, i) => (
            <span key={u} className="rounded-full border-[3px] border-ink-800 transition-all duration-300 hover:-translate-y-2 hover:z-20 relative"
              style={{ marginLeft: i === 0 ? 0 : hover ? 6 : -12, zIndex: 10 - i, transform: hover ? `rotate(${(i - shown.length / 2) * 4}deg)` : undefined }}>
              <Avatar name={u} size={44} status={i === 0 ? "trading" : i < 3 ? "online" : undefined} />
            </span>
          ))}
          {extra > 0 && <span className="size-11 rounded-full bg-[#22366f] border-[3px] border-ink-800 grid place-items-center text-[11px] font-extrabold num transition-all duration-300" style={{ marginLeft: hover ? 6 : -12, zIndex: 0 }}>+{extra}</span>}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <input type="range" min={1} max={10} value={n} onChange={(e) => setN(+e.target.value)} className="flex-1 accent-[#3d7bff]" />
          <span className="num text-[12px] font-extrabold">{n} online</span>
        </div>
      </div>
      <div className="text-[11px] text-dim font-bold mt-2 text-center">наведи — стопка раскроется веером</div>
    </Asset>
  );
}

/* ============ 5. TYPING AVATARS ============ */
function TypingAvatars() {
  const [on, setOn] = useState(true);
  return (
    <Asset title="Typing Indicators" id="ava.typing" desc="Кто печатает в чате сделки: прыгающие точки у аватара, волна по списку.">
      <div className="space-y-2.5">
        {[["Satoshi N", true], ["Anna K", true], ["Mike S", false]].map(([n, typing], i) => (
          <div key={n as string} className="raised !rounded-2xl px-3 py-2.5 flex items-center gap-3">
            <span className="relative">
              <Avatar name={n as string} size={38} status="online" />
              {on && typing ? <span className="absolute -bottom-1 -right-1 flex gap-[2px] bg-[#16275a] rounded-full px-1.5 py-1 border border-white/10">{[0, 1, 2].map((k) => <i key={k} className="size-1.5 rounded-full bg-cyan" style={{ animation: `dot-bounce 1s ${k * 0.15 + i * 0.2}s infinite` }} />)}</span> : null}
            </span>
            <div className="flex-1"><div className="text-[12.5px] font-extrabold">{n as string}</div><div className="text-[10.5px] text-dim font-bold">{on && typing ? "печатает…" : "в сети"}</div></div>
          </div>
        ))}
      </div>
      <Btn3D size="xs" variant={on ? "cyan" : "neutral"} full className="mt-3" onClick={() => setOn(!on)}>{on ? "Остановить печать" : "Начать печать"}</Btn3D>
    </Asset>
  );
}

/* ============ 6. ACHIEVEMENT FRAMES ============ */
function AchFrames() {
  const items = [
    { n: "First Trade", g: "coin" as const, un: true }, { n: "10 Wins", g: "star" as const, un: true },
    { n: "Streak 30", g: "flame" as const, un: false }, { n: "Whale", g: "crown" as const, un: false },
  ];
  const [list, setList] = useState(items);
  return (
    <Asset title="Achievement Frames" id="ava.ach" desc="Рамки достижений: полученные сияют и парят, закрытые — силуэты. Клик открывает.">
      <div className="grid grid-cols-4 gap-2.5">
        {list.map((a, i) => (
          <button key={a.n} onClick={(e) => {
            if (list[i].un) return;
            setList((l) => l.map((x, k) => (k === i ? { ...x, un: true } : x)));
            const r = (e.target as HTMLElement).getBoundingClientRect();
            burstConfetti(r.left + 30, r.top + 30, 24, 0.6); sfx.levelUp();
          }} className="flex flex-col items-center gap-1.5 group">
            <span className={cn("relative size-[68px] rounded-2xl grid place-items-center border-2 transition-all duration-500", a.un ? "border-gold/60 bg-gradient-to-b from-[#2a2410] to-[#141021] group-hover:-translate-y-1" : "border-[#22366f] bg-ink-850 opacity-60")}>
              {a.un && <span className="absolute inset-0 rounded-2xl overflow-hidden"><span className="absolute inset-y-0 w-6 bg-white/25 blur-[2px] rotate-[20deg]" style={{ animation: "shine 2.6s ease-in-out infinite" }} /></span>}
              <Glyph name={a.g} size={34} dim={!a.un} />
              {!a.un && <Icon name="lock" size={13} className="absolute bottom-1 right-1 text-dim" />}
            </span>
            <span className={cn("text-[9.5px] font-extrabold text-center leading-tight", a.un ? "" : "text-dim")}>{a.n}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 text-center text-[11px] font-bold text-mute">открыто <span className="num text-gold">{list.filter((x) => x.un).length}/{list.length}</span></div>
    </Asset>
  );
}

/* ============ 7. VS MATCHUP ============ */
function Versus() {
  const [a, setA] = useState(2140);
  const [b, setB] = useState(1980);
  const [fight, setFight] = useState(false);
  const duel = () => {
    if (fight) return;
    setFight(true); sfx.whoosh();
    let n = 0;
    const h = setInterval(() => {
      n++;
      setA((x) => x + Math.round(Math.random() * 60)); setB((x) => x + Math.round(Math.random() * 60));
      if (n % 3 === 0) sfx.tick();
      if (n >= 12) { clearInterval(h); setFight(false); sfx.levelUp(); }
    }, 160);
  };
  const lead = a >= b ? 0 : 1;
  return (
    <Asset title="VS Matchup" id="ava.vs" desc="Дуэль недели: бары XP сражаются в реальном времени, лидер подсвечен, финиш с фанфарами.">
      <div className="flex items-center gap-3">
        <div className={cn("flex-1 text-center transition-transform", !fight && lead === 0 && "scale-105")}>
          <Avatar name="You Me" size={52} ring={lead === 0 ? "ring-[3px] ring-gold" : ""} />
          <div className="text-[11.5px] font-extrabold mt-1">You</div>
          <div className="num text-[15px] font-extrabold text-gold">{a.toLocaleString()}</div>
        </div>
        <div className={cn("size-12 rounded-full grid place-items-center font-extrabold text-[15px] shrink-0 bg-gradient-to-b from-[#ff7c93] to-[#c0253f] shadow-[0_4px_0_#7a1428]", fight && "anim-wiggle")}>VS</div>
        <div className={cn("flex-1 text-center transition-transform", !fight && lead === 1 && "scale-105")}>
          <Avatar name="Vitalik B" size={52} ring={lead === 1 ? "ring-[3px] ring-gold" : ""} />
          <div className="text-[11.5px] font-extrabold mt-1">Vitalik B</div>
          <div className="num text-[15px] font-extrabold text-[#8fb3ff]">{b.toLocaleString()}</div>
        </div>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden mt-3">
        <div className="bg-gradient-to-r from-gold to-[#ff8a3d] transition-all duration-200" style={{ width: `${(a / (a + b)) * 100}%` }} />
        <div className="bg-gradient-to-r from-blue to-violet flex-1" />
      </div>
      <Btn3D size="sm" variant="bear" full className="mt-3" loading={fight} onClick={duel} icon={<Icon name="bolt" size={15} />}>{fight ? "Duel…" : "Start duel"}</Btn3D>
    </Asset>
  );
}

/* ============ 8. PRESENCE BAR ============ */
function Presence() {
  const [users, setUsers] = useState([
    { n: "Satoshi N", s: "online" }, { n: "Anna K", s: "online" }, { n: "Leo T", s: "trading" }, { n: "Dana R", s: "away" },
  ]);
  const cycle = (i: number) => {
    const order = ["online", "trading", "away", "off"];
    setUsers((u) => u.map((x, k) => (k === i ? { ...x, s: order[(order.indexOf(x.s) + 1) % 4] } : x)));
    sfx.toggle();
  };
  const online = users.filter((u) => u.s !== "off").length;
  return (
    <Asset title="Presence Bar" id="ava.presence" desc="Кто в комнате урока: клик переключает статус, счётчик онлайна обновляется.">
      <div className="inset !rounded-2xl p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-extrabold">Room · Candles 101</span>
          <Badge tone="bull" dot><span className="num">{online}</span> online</Badge>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {users.map((u, i) => (
            <button key={u.n} onClick={() => cycle(i)} className="flex items-center gap-2 raised !rounded-full pl-1 pr-3 h-10 hover:-translate-y-0.5 transition-transform">
              <Avatar name={u.n} size={30} status={u.s as "online"} />
              <span className="text-[11.5px] font-extrabold">{u.n.split(" ")[0]}</span>
            </button>
          ))}
          <button onClick={(e) => { const r = (e.target as HTMLElement).getBoundingClientRect(); burstConfetti(r.left, r.top, 20, 0.5); sfx.pop(); }} className="size-10 rounded-full border-2 border-dashed border-[#2f4890] grid place-items-center text-mute hover:text-txt hover:border-blue transition"><Icon name="plus" size={16} stroke={3} /></button>
        </div>
      </div>
    </Asset>
  );
}

export default function AvatarLab() {
  return (
    <Section id="avatars" index="31" title="Avatar Lab" subtitle="8 аватарок и присутствия: конструктор, статусы, уровни, группы, печать, рамки, дуэль, комната" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Builder />
        <StatusRings />
        <LevelBadges />
        <GroupStack />
        <TypingAvatars />
        <AchFrames />
        <Versus />
        <Presence />
      </div>
    </Section>
  );
}
