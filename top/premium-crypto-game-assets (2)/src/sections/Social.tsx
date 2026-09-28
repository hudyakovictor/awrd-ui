import { useEffect, useRef, useState } from "react";
import { Asset, Bar, Btn, Confetti, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { Avatar, Medal } from "./Gamification";
import { cn } from "../utils/cn";

type Friend = {
  name: string;
  handle: string;
  hue: number;
  xp: number;
  status: "on" | "away" | "off";
  league: "gold" | "violet" | "sky" | "bull";
};

const FRIENDS: Friend[] = [
  { name: "Mia Chen", handle: "@moonmia", hue: 332, xp: 1655, status: "on", league: "violet" },
  { name: "Max Petrov", handle: "@maxrisk", hue: 200, xp: 1420, status: "on", league: "sky" },
  { name: "Dana Ortiz", handle: "@chartdana", hue: 42, xp: 1310, status: "away", league: "gold" },
  { name: "Leo Kim", handle: "@leok", hue: 138, xp: 1180, status: "off", league: "bull" },
];

function FriendChallenge() {
  const [selected, setSelected] = useState<Friend | null>(FRIENDS[0]);
  const [mode, setMode] = useState<"patterns" | "risk" | "speed">("patterns");
  const [sent, setSent] = useState(false);
  const [query, setQuery] = useState("");
  const visible = FRIENDS.filter((friend) => `${friend.name} ${friend.handle}`.toLowerCase().includes(query.toLowerCase()));
  const send = () => {
    if (!selected) return;
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };
  return (
    <Asset
      code="SOC-01"
      title="Friend Challenge"
      desc="Search a friend, choose a skill-based duel and send a clear asynchronous challenge with equal conditions."
      tags={["invite", "search", "async"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        <div>
          <div className="well h-11 flex items-center gap-2 px-3 mb-3 border-2 border-transparent focus-within:border-sky/60">
            <Icon name="search" size={16} className="text-mist" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a friend" className="bg-transparent outline-none flex-1 text-sm placeholder:text-mist/50" />
            {query && <button onClick={() => setQuery("")} className="text-mist"><Icon name="x" size={14} /></button>}
          </div>
          <div className="space-y-2">
            {visible.map((friend) => {
              const active = selected?.handle === friend.handle;
              return (
                <button key={friend.handle} onClick={() => setSelected(friend)} className={cn("w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all border-2", active ? "border-sky bg-sky/10 shadow-[0_4px_0_#1a56a8]" : "border-ink-600 bg-ink-800 hover:border-ink-500")}>
                  <Avatar name={friend.name} size={42} ring={friend.league} status={friend.status} hue={friend.hue} />
                  <span className="flex-1 min-w-0"><span className="block text-sm font-black truncate">{friend.name}</span><span className="block text-[10px] text-mist">{friend.handle}</span></span>
                  <span className="num text-xs font-black text-gold">{friend.xp.toLocaleString()} XP</span>
                  <span className={cn("w-5 h-5 rounded-full border-2 grid place-items-center", active ? "border-sky bg-sky" : "border-ink-500")}>
                    {active && <Icon name="check" size={11} stroke={3.5} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="holo-card rounded-[22px] p-4 flex flex-col">
          <div className="relative z-10">
            <div className="text-[9px] uppercase tracking-[.2em] font-black text-violet mb-3">Challenge setup</div>
            {selected ? (
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={selected.name} size={50} ring={selected.league} hue={selected.hue} />
                <div><div className="font-black">vs {selected.name}</div><div className="text-[10px] text-mist">Best score in 24 hours wins</div></div>
              </div>
            ) : <div className="text-sm text-mist">Select a friend</div>}
            <div className="space-y-2 mb-4">
              {([
                ["patterns", "Pattern Sprint", "20 candle calls", "candles"],
                ["risk", "Risk Master", "10 position plans", "shield"],
                ["speed", "Quick Fire", "60 second quiz", "bolt"],
              ] as const).map(([id, label, detail, icon]) => (
                <button key={id} onClick={() => setMode(id)} className={cn("w-full p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all", mode === id ? "border-violet bg-violet/15" : "border-white/[.07] bg-white/[.025]")}>
                  <span className={cn("w-8 h-8 rounded-lg grid place-items-center", mode === id ? "bg-violet text-white" : "bg-ink-700 text-mist")}><Icon name={icon} size={16} /></span>
                  <span><span className="block text-xs font-black">{label}</span><span className="block text-[8px] text-mist">{detail}</span></span>
                </button>
              ))}
            </div>
            <Btn variant={sent ? "bull" : "violet"} block icon={sent ? "check" : "send"} disabled={!selected} onClick={send}>{sent ? "Challenge sent" : "Send challenge"}</Btn>
          </div>
        </div>
      </div>
    </Asset>
  );
}

type Message = {
  id: number;
  own?: boolean;
  author: string;
  text: string;
  time: string;
  reaction?: string;
};

function ClubChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, author: "Mia", text: "That BTC fakeout lesson was brutal 😅", time: "18:42", reaction: "3" },
    { id: 2, author: "Max", text: "Volume divergence gave it away. Watch the last two bars.", time: "18:44" },
    { id: 3, own: true, author: "You", text: "Adding it to my review deck.", time: "18:45", reaction: "2" },
  ]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(true);
  const [reacted, setReacted] = useState<number[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const send = () => {
    const text = value.trim();
    if (!text) return;
    setMessages((items) => [...items, { id: Date.now(), own: true, author: "You", text, time: "now" }]);
    setValue("");
    setTyping(true);
    setTimeout(() => {
      setMessages((items) => [...items, { id: Date.now() + 1, author: "Mia", text: "Good call. I’ll add it too.", time: "now" }]);
      setTyping(false);
    }, 1000);
  };
  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  return (
    <Asset
      code="SOC-02"
      title="Learning Club Chat"
      desc="Focused group chat with replies, reactions, typing state and a composer designed around learning rather than engagement spam."
      tags={["chat", "typing", "reactions"]}
    >
      <div className="well overflow-hidden flex flex-col min-h-[410px]">
        <div className="p-3 border-b border-white/[.07] flex items-center gap-3 bg-ink-750/60">
          <div className="flex -space-x-2">
            <Avatar name="Mia" size={32} hue={332} status="on" />
            <Avatar name="Max" size={32} hue={200} status="on" />
            <Avatar name="Dan" size={32} hue={45} status="away" />
          </div>
          <div className="flex-1"><div className="text-xs font-black">Chart Readers Club</div><div className="text-[8px] text-bull">8 learning now</div></div>
          <button className="w-8 h-8 rounded-lg bg-white/5 grid place-items-center text-mist"><Icon name="more" size={17} /></button>
        </div>
        <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[280px]">
          <div className="text-[8px] uppercase tracking-wider text-mist text-center font-bold">Today · Candlestick unit</div>
          {messages.map((message) => (
            <div key={message.id} className={cn("flex gap-2 anim-rise", message.own && "flex-row-reverse")}>
              {!message.own && <Avatar name={message.author} size={28} hue={message.author === "Mia" ? 332 : 200} />}
              <div className={cn("max-w-[78%]", message.own && "text-right")}>
                {!message.own && <div className="text-[8px] font-black text-mist mb-1 ml-1">{message.author}</div>}
                <button onDoubleClick={() => setReacted((items) => items.includes(message.id) ? items : [...items, message.id])} className={cn("text-left rounded-2xl px-3 py-2 text-[11px] leading-relaxed relative", message.own ? "bg-sky text-white rounded-tr-md" : "bg-ink-700 text-fog rounded-tl-md")}>
                  {message.text}
                  {(message.reaction || reacted.includes(message.id)) && <span className="absolute -bottom-3 right-1 rounded-full px-1.5 py-0.5 bg-ink-800 border border-white/10 text-[8px]">🔥 {Number(message.reaction ?? 0) + (reacted.includes(message.id) ? 1 : 0)}</span>}
                </button>
                <div className="text-[7px] text-mist mt-1 px-1">{message.time}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2 anim-rise">
              <Avatar name="Mia" size={28} hue={332} />
              <div className="bg-ink-700 rounded-2xl rounded-tl-md px-3 py-3 flex gap-1">
                {[0, 1, 2].map((index) => <span key={index} className="w-1.5 h-1.5 rounded-full bg-mist" style={{ animation: `typing 1s ${index * .15}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottom} />
        </div>
        <div className="p-2 border-t border-white/[.07] flex items-center gap-2">
          <button className="w-9 h-9 rounded-xl bg-white/5 grid place-items-center text-mist"><Icon name="plus" size={17} /></button>
          <div className="well flex-1 h-10 flex items-center px-3"><input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Share an insight…" className="bg-transparent outline-none flex-1 text-xs placeholder:text-mist/45" /></div>
          <button onClick={send} className={cn("w-10 h-10 rounded-xl grid place-items-center transition-all", value.trim() ? "bg-sky text-white shadow-[0_3px_0_#1a56a8]" : "bg-ink-700 text-mist")}><Icon name="send" size={17} /></button>
        </div>
      </div>
      <div className="text-[9px] text-mist text-center mt-3">Double-click a message to react</div>
    </Asset>
  );
}

function ClubGoal() {
  const [xp, setXp] = useState(6820);
  const target = 10000;
  const [joined, setJoined] = useState(false);
  const top = [
    { name: "Mia", xp: 1450, hue: 332 },
    { name: "Alex", xp: 1280, hue: 205 },
    { name: "Max", xp: 1170, hue: 70 },
  ];
  return (
    <Asset
      code="SOC-03"
      title="Club Goal"
      desc="Cooperative weekly target, transparent contribution ranking and one useful group reward."
      tags={["co-op", "weekly"]}
    >
      <div className="rounded-[22px] p-4 bg-gradient-to-br from-[#0f473b] to-[#102246] shadow-[0_5px_0_#061b18] relative overflow-hidden mb-4">
        <div className="absolute -right-7 -top-7 w-32 h-32 bg-bull/15 rounded-full blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-bull/15 text-bull grid place-items-center border border-bull/25"><Icon name="users" size={29} /></div>
          <div className="flex-1"><div className="text-[9px] uppercase font-black tracking-[.18em] text-bull">Club mission</div><div className="font-black text-lg">Earn 10,000 XP together</div><div className="text-[10px] text-fog/65">Unlock a 2× XP weekend for everyone</div></div>
        </div>
        <div className="relative mt-4"><Bar value={(xp / target) * 100} color="bull" h={18} /><div className="flex justify-between mt-1.5 num text-[9px] font-bold"><span>{xp.toLocaleString()} XP</span><span>{target.toLocaleString()} XP</span></div></div>
      </div>
      <div className="space-y-2 mb-4">
        {top.map((member, index) => (
          <div key={member.name} className="tile !rounded-xl p-2.5 flex items-center gap-3">
            <span className={cn("num w-5 text-center font-black", index === 0 ? "text-gold" : "text-mist")}>{index + 1}</span>
            <Avatar name={member.name} size={34} hue={member.hue} ring={index === 0 ? "gold" : "none"} />
            <span className="text-sm font-black flex-1">{member.name}</span>
            <span className="num text-xs font-black text-bull">+{member.xp.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <Btn variant="bull" size="sm" icon="bolt" onClick={() => setXp((value) => Math.min(target, value + 250))}>Contribute +250</Btn>
        <Btn variant={joined ? "ghost" : "sky"} size="sm" icon={joined ? "check" : "plus"} onClick={() => setJoined(true)}>{joined ? "Joined club" : "Join club"}</Btn>
      </div>
    </Asset>
  );
}

function DuelLobby() {
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  useInterval(() => {
    if (!searching || found) return;
    setCount((value) => value + 1);
  }, 1000);
  useEffect(() => {
    if (!searching) return;
    const timer = setTimeout(() => setFound(true), 2200);
    return () => clearTimeout(timer);
  }, [searching]);
  const reset = () => {
    setSearching(false);
    setFound(false);
    setCount(0);
    setReady(false);
  };
  return (
    <Asset
      code="SOC-04"
      title="Ranked Matchmaking"
      desc="Search, match-found and ready-check states with clear cancellation and skill-range context."
      tags={["matchmaking", "states"]}
    >
      <div className="well dotgrid min-h-[330px] grid place-items-center p-5 relative overflow-hidden">
        {!searching && (
          <div className="text-center anim-rise">
            <div className="relative inline-block mb-4"><Medal tier="legend" icon="bolt" size={90} /><span className="absolute -right-2 top-0 w-7 h-7 rounded-full bg-bull border-4 border-ink-900 grid place-items-center"><Icon name="check" size={12} stroke={3} /></span></div>
            <div className="text-xl font-black">Ranked Chart Duel</div>
            <div className="text-xs text-mist mt-1 mb-5">Rating 1,240 · Silver II · ±90 skill range</div>
            <Btn variant="violet" size="lg" icon="search" onClick={() => setSearching(true)}>Find opponent</Btn>
          </div>
        )}
        {searching && !found && (
          <div className="text-center anim-rise">
            <div className="relative w-28 h-28 mx-auto mb-4 grid place-items-center">
              {[0, 1, 2].map((index) => <span key={index} className="absolute inset-0 rounded-full border-2 border-violet" style={{ animation: `radar 2s ${index * .55}s ease-out infinite` }} />)}
              <div className="w-16 h-16 rounded-full bg-violet/20 text-violet grid place-items-center"><Icon name="search" size={28} /></div>
            </div>
            <div className="text-lg font-black">Finding a fair match</div>
            <div className="num text-sm text-violet mt-1">00:{String(count).padStart(2, "0")}</div>
            <button onClick={reset} className="mt-5 text-xs font-bold text-mist hover:text-fog">Cancel search</button>
          </div>
        )}
        {found && (
          <div className="w-full text-center anim-bounce-in">
            <div className="text-[9px] uppercase tracking-[.2em] font-black text-bull mb-4">Opponent found</div>
            <div className="flex items-center justify-center gap-5 mb-4">
              <div><Avatar name="YOU" size={68} ring="sky" hue={205} /><div className="num text-[10px] font-black mt-2">1,240</div></div>
              <div className="text-3xl font-black text-grad-gold">VS</div>
              <div><Avatar name="KIRA" size={68} ring="violet" hue={330} /><div className="num text-[10px] font-black mt-2">1,286</div></div>
            </div>
            <div className="text-xs text-mist mb-4">Pattern Sprint · Best of 5 · No power-ups</div>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto"><Btn variant="ghost" size="sm" onClick={reset}>Decline</Btn><Btn variant={ready ? "bull" : "violet"} size="sm" icon={ready ? "check" : "bolt"} onClick={() => setReady(true)}>{ready ? "Ready!" : "I'm ready"}</Btn></div>
          </div>
        )}
      </div>
    </Asset>
  );
}

function SharedResult() {
  const [theme, setTheme] = useState<"blue" | "green" | "violet">("blue");
  const [copied, setCopied] = useState(false);
  const themes = {
    blue: "from-[#123f8b] via-[#1b2868] to-[#07122d]",
    green: "from-[#116044] via-[#103d3a] to-[#071c1d]",
    violet: "from-[#55309c] via-[#2b2467] to-[#100b2b]",
  };
  const copy = () => {
    navigator.clipboard?.writeText("I scored 92% Market Read in BULLRUN Academy").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Asset
      code="SOC-05"
      title="Share Card Composer"
      desc="A branded result card with selectable visual themes and copy feedback. No detached social-watermark clutter."
      tags={["share", "themes"]}
    >
      <div className={cn("aspect-[4/5] max-h-[360px] rounded-[24px] mx-auto p-5 bg-gradient-to-br relative overflow-hidden shadow-[0_7px_0_#040916]", themes[theme])}>
        <div className="absolute inset-0 dotgrid opacity-25" />
        <div className="absolute -right-16 -bottom-16 w-60 h-60 rounded-full border-[26px] border-white/[.04]" />
        <div className="relative h-full flex flex-col">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-bull grid place-items-center shadow-[0_3px_0_#0b7a4a]"><Icon name="logo" size={17} stroke={3} /></div><span className="font-black text-sm">BULLRUN</span></div>
          <div className="flex-1 grid place-items-center text-center">
            <div>
              <div className="w-20 h-20 rounded-[24px] bg-white/10 border border-white/15 grid place-items-center mx-auto mb-4"><Icon name="target" size={40} className="text-bull" /></div>
              <div className="num text-6xl font-black text-white">92%</div>
              <div className="text-xl font-black">MARKET READ</div>
              <div className="text-xs text-white/60 mt-2">Top 12% of learners this week</div>
            </div>
          </div>
          <div className="flex justify-between text-[9px] uppercase tracking-widest font-black text-white/55"><span>Alex · Level 8</span><span>Session #148</span></div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4 mb-3">
        {(Object.keys(themes) as (keyof typeof themes)[]).map((value) => <button key={value} onClick={() => setTheme(value)} className={cn("w-8 h-8 rounded-full transition-all", value === "blue" ? "bg-sky" : value === "green" ? "bg-bull" : "bg-violet", theme === value && "ring-2 ring-white ring-offset-2 ring-offset-ink-800 scale-110")} aria-label={`${value} theme`} />)}
      </div>
      <Btn variant={copied ? "bull" : "sky"} block icon={copied ? "check" : "copy"} onClick={copy}>{copied ? "Copied" : "Copy share card"}</Btn>
    </Asset>
  );
}

function LiveSpectators() {
  const [count, setCount] = useState(128);
  const [hearts, setHearts] = useState(24);
  const [burst, setBurst] = useState(0);
  useInterval(() => setCount((value) => Math.max(120, value + Math.floor(Math.random() * 5) - 2)), 1400);
  return (
    <Asset
      code="SOC-06"
      title="Live Spectator Rail"
      desc="Small-footprint live audience module with presence, restrained reactions and replay-safe score context."
      tags={["live", "presence"]}
    >
      <div className="game-surface rounded-[22px] p-4 relative overflow-hidden">
        <Confetti burst={burst} count={16} />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-bear anim-live" /><span className="text-[9px] font-black uppercase tracking-widest text-bear">Live duel</span></div>
          <span className="num text-[10px] text-mist flex items-center gap-1"><Icon name="eye" size={13} />{count}</span>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center"><Avatar name="MIA" size={54} ring="violet" hue={332} /><div className="num font-black mt-1 text-sky">3</div></div>
          <div className="text-center"><div className="text-[8px] text-mist uppercase font-black">Round 4/5</div><div className="font-black text-lg">VS</div><div className="text-[8px] text-gold">12s left</div></div>
          <div className="text-center"><Avatar name="MAX" size={54} ring="gold" hue={70} /><div className="num font-black mt-1 text-bear">2</div></div>
        </div>
        <div className="well p-2 flex items-center gap-2">
          <div className="flex -space-x-2 flex-1">{[10, 70, 140, 210, 280].map((hue, index) => <Avatar key={index} name={`U${index}`} size={27} hue={hue} />)}<span className="w-[27px] h-[27px] rounded-full bg-ink-600 border-2 border-ink-850 grid place-items-center text-[7px] font-black">+123</span></div>
          <button onClick={() => setHearts((value) => value + 1)} className="h-8 px-2.5 rounded-xl bg-bear/15 text-bear flex items-center gap-1 text-[9px] font-black active:scale-90 transition-transform"><Icon name="heart" size={14} fill="currentColor" />{hearts}</button>
          <button onClick={() => setBurst((value) => value + 1)} className="w-8 h-8 rounded-xl bg-gold/15 text-gold grid place-items-center active:scale-90"><Icon name="sparkle" size={15} /></button>
        </div>
      </div>
    </Asset>
  );
}

export default function Social() {
  return (
    <Section
      id="social"
      index="11"
      title="Social & Multiplayer"
      subtitle="Useful competition and collaboration: skill-matched, asynchronous by default, with restrained social pressure."
    >
      <FriendChallenge />
      <ClubChat />
      <ClubGoal />
      <DuelLobby />
      <SharedResult />
      <LiveSpectators />
    </Section>
  );
}