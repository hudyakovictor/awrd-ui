import { useMemo, useState } from "react";
import { Asset, Bar, Coin, Confetti, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { Avatar } from "./Gamification";

type ScreenName = "home" | "learn" | "arena" | "market" | "profile";

const SHELL_TABS: { id: ScreenName; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "learn", label: "Learn", icon: "book" },
  { id: "arena", label: "Arena", icon: "bolt" },
  { id: "market", label: "Market", icon: "candles" },
  { id: "profile", label: "Profile", icon: "user" },
];

function PhoneHeader({ title, back, onBack }: { title?: string; back?: boolean; onBack?: () => void }) {
  return (
    <div className="h-16 pt-5 px-4 flex items-center gap-3 shrink-0">
      {back ? (
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl bg-white/5 grid place-items-center text-fog active:scale-90 transition-transform"
        >
          <Icon name="chevL" size={17} stroke={3} />
        </button>
      ) : (
        <div className="w-8 h-8 rounded-xl grid place-items-center bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_3px_0_#0b7a4a]">
          <Icon name="logo" size={17} stroke={3} />
        </div>
      )}
      <div className="font-black text-sm flex-1">{title ?? "BULLRUN"}</div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 num text-[10px] font-black text-flame">
          <Icon name="flame" size={15} fill="currentColor" stroke={1.5} />12
        </span>
        <span className="flex items-center gap-1 num text-[10px] font-black text-sky">
          <Icon name="gem" size={14} fill="currentColor" stroke={1.5} />840
        </span>
      </div>
    </div>
  );
}

function PhoneTabs({ active, onChange }: { active: ScreenName; onChange: (name: ScreenName) => void }) {
  return (
    <div className="safe-bottom shrink-0 px-2 pt-1 bg-ink-900/95 border-t border-white/[.07] grid grid-cols-5 relative z-20">
      {SHELL_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative flex flex-col items-center gap-0.5 py-2"
        >
          {tab.id === "arena" && (
            <span
              className={cn(
                "absolute -top-5 w-12 h-12 rounded-2xl grid place-items-center transition-all",
                active === tab.id
                  ? "bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#3a2500] shadow-[0_5px_0_#b07600] -translate-y-1"
                  : "bg-gradient-to-b from-[#263a6a] to-[#1c2b52] text-mist shadow-[0_4px_0_#0b1430]",
              )}
            >
              <Icon name="bolt" size={22} fill="currentColor" />
            </span>
          )}
          {tab.id !== "arena" && (
            <Icon
              name={tab.icon}
              size={19}
              stroke={active === tab.id ? 2.7 : 2}
              className={active === tab.id ? "text-sky anim-pop" : "text-mist"}
            />
          )}
          <span
            className={cn(
              "text-[7px] font-black uppercase tracking-wider",
              tab.id === "arena" && "mt-5",
              active === tab.id ? "text-fog" : "text-mist/60",
            )}
          >
            {tab.label}
          </span>
          {active === tab.id && tab.id !== "arena" && (
            <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-sky shadow-[0_0_8px_#3da5ff]" />
          )}
        </button>
      ))}
    </div>
  );
}

function HomeScreen({ onGo }: { onGo: (name: ScreenName) => void }) {
  const [claim, setClaim] = useState(false);
  return (
    <div className="h-full flex flex-col anim-rise">
      <PhoneHeader />
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Avatar name="Alex" size={42} ring="gold" status="on" hue={205} />
          <div className="flex-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-mist">Good evening</div>
            <div className="font-black text-base">Ready to read the market?</div>
          </div>
        </div>

        <button
          onClick={() => onGo("learn")}
          className="relative w-full text-left rounded-[22px] overflow-hidden p-4 mb-3 bg-gradient-to-br from-[#2d8cf0] via-[#206ccb] to-[#173c88] shadow-[0_5px_0_#123165,inset_0_2px_0_rgba(255,255,255,.25)] active:translate-y-1 active:shadow-none transition-all"
        >
          <div className="relative z-10">
            <div className="text-[8px] font-black uppercase tracking-[.2em] text-white/65 mb-1">Continue learning</div>
            <div className="font-black text-base">Candlestick Patterns</div>
            <div className="text-[10px] text-white/75 mb-3">Lesson 4 · Hammer & Star</div>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 bg-[#12346d] rounded-full overflow-hidden">
                <div className="h-full w-[68%] bg-gradient-to-b from-[#ffd560] to-[#f5b01c] rounded-full" />
              </div>
              <span className="num text-[9px] font-black">68%</span>
            </div>
          </div>
          <Icon name="candles" size={90} className="absolute -right-2 -bottom-4 text-white/15" stroke={1.4} />
          <span className="absolute right-3 top-3 w-8 h-8 rounded-full bg-white/15 grid place-items-center">
            <Icon name="play" size={14} fill="white" />
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => onGo("arena")}
            className="game-surface rounded-2xl p-3 text-left active:translate-y-1 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-violet/20 text-violet grid place-items-center mb-2">
              <Icon name="bolt" size={18} fill="currentColor" />
            </div>
            <div className="text-[8px] font-black uppercase tracking-wider text-violet">Live event</div>
            <div className="text-xs font-black">Chart Duel</div>
            <div className="text-[8px] text-mist mt-1">8 players online</div>
          </button>
          <button
            onClick={() => onGo("market")}
            className="game-surface rounded-2xl p-3 text-left active:translate-y-1 transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-bull/15 text-bull grid place-items-center mb-2">
              <Icon name="trendUp" size={18} />
            </div>
            <div className="text-[8px] font-black uppercase tracking-wider text-bull">Market pulse</div>
            <div className="text-xs font-black">Greed · 72</div>
            <div className="text-[8px] text-mist mt-1">BTC +2.4% today</div>
          </button>
        </div>

        <div className="game-surface rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[8px] font-black uppercase tracking-wider text-gold">Daily mission</div>
              <div className="text-xs font-black">Complete 3 lessons</div>
            </div>
            <div className="relative">
              <button
                onClick={() => setClaim(true)}
                className={cn(
                  "w-10 h-10 rounded-xl grid place-items-center transition-all",
                  claim
                    ? "bg-bull/15 text-bull"
                    : "bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#5a3a00] shadow-[0_4px_0_#b07600] active:translate-y-1 active:shadow-none",
                )}
              >
                <Icon name={claim ? "check" : "gift"} size={18} stroke={2.7} />
              </button>
            </div>
          </div>
          <Bar value={claim ? 100 : 66} color={claim ? "bull" : "gold"} h={9} />
          <div className="flex justify-between text-[8px] text-mist mt-1.5">
            <span>{claim ? "Reward claimed" : "2/3 complete"}</span>
            <span className="text-sky font-black">+20 gems</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearnScreen({ onOpen }: { onOpen: () => void }) {
  const nodes = [
    { x: 50, y: 8, icon: "check", state: "done" },
    { x: 28, y: 27, icon: "check", state: "done" },
    { x: 52, y: 47, icon: "star", state: "current" },
    { x: 74, y: 67, icon: "gift", state: "locked" },
    { x: 50, y: 87, icon: "crown", state: "locked" },
  ];
  return (
    <div className="h-full flex flex-col anim-rise">
      <PhoneHeader title="Technical Analysis" />
      <div className="mx-3 rounded-2xl p-3 bg-gradient-to-br from-[#8252f5] to-[#4f2bb0] shadow-[0_4px_0_#342078] relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-[8px] uppercase font-black tracking-[.18em] text-white/65">Unit 3 of 8</div>
          <div className="text-sm font-black">Candlestick Patterns</div>
          <div className="text-[9px] text-white/70 mt-0.5">4 of 7 lessons complete</div>
        </div>
        <Icon name="candles" size={65} className="absolute -right-1 -bottom-3 text-white/15" />
      </div>
      <div className="relative flex-1 mx-3 my-3 well overflow-hidden dotgrid">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M50 8 C20 17 18 30 30 37 S76 50 72 62 S35 77 50 89"
            fill="none"
            stroke="#1f3468"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="4 3"
          />
          <path
            d="M50 8 C20 17 18 30 30 37 S76 50 72 62"
            fill="none"
            stroke="#3da5ff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="5 3"
            style={{ animation: "routeFlow 2s linear infinite" }}
          />
        </svg>
        {nodes.map((node, index) => (
          <button
            key={index}
            onClick={node.state === "current" ? onOpen : undefined}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full grid place-items-center transition-all",
              node.state === "done" && "w-12 h-11 bg-gradient-to-b from-[#ffd560] to-[#f5b01c] text-[#523500] shadow-[0_5px_0_#b07600]",
              node.state === "current" && "w-14 h-[52px] bg-gradient-to-b from-[#3ce49e] to-[#16b56f] text-white shadow-[0_6px_0_#0b7a4a] anim-pulse-ring",
              node.state === "locked" && "w-12 h-11 bg-gradient-to-b from-[#263a6a] to-[#1c2b52] text-mist shadow-[0_5px_0_#0b1430]",
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%`, ["--ring" as string]: "rgba(34,211,138,.5)" }}
          >
            <Icon name={node.state === "locked" ? "lock" : node.icon} size={20} stroke={2.8} fill={node.icon === "star" ? "currentColor" : "none"} />
            {node.state === "current" && (
              <span className="absolute -top-7 text-[8px] font-black bg-bull text-ink-900 px-2 py-1 rounded-lg whitespace-nowrap anim-float">
                START
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

const ARENA_PROMPTS = [
  { q: "BTC breaks resistance with volume. Your move?", a: "LONG", b: "WAIT", good: "LONG" },
  { q: "RSI is 88 and momentum fades. Your move?", a: "BUY", b: "WAIT", good: "WAIT" },
  { q: "Price retests support and forms a hammer.", a: "LONG", b: "SHORT", good: "LONG" },
];

function ArenaScreen() {
  const [round, setRound] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [score, setScore] = useState(1240);
  const [burst, setBurst] = useState(0);
  const prompt = ARENA_PROMPTS[round % ARENA_PROMPTS.length];
  const choose = (choice: string) => {
    if (pick) return;
    setPick(choice);
    if (choice === prompt.good) {
      setScore((value) => value + 120);
      setBurst((value) => value + 1);
    }
  };
  const next = () => {
    setRound((value) => value + 1);
    setPick(null);
  };
  const points = useMemo(() => {
    let y = 45;
    return Array.from({ length: 18 }, (_, index) => {
      y += (Math.random() - 0.43) * 13;
      return `${index * 15},${Math.max(8, Math.min(82, y))}`;
    }).join(" ");
  }, [round]);
  const correct = pick === prompt.good;
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#16113d] to-[#081128] anim-rise relative">
      <Confetti burst={burst} count={22} />
      <div className="pt-6 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-violet grid place-items-center shadow-[0_3px_0_#4f2bb0]">
            <Icon name="bolt" size={17} fill="currentColor" />
          </span>
          <div>
            <div className="text-[8px] font-black uppercase tracking-widest text-violet">Arena ranked</div>
            <div className="text-xs font-black">Chart Duel</div>
          </div>
        </div>
        <div className="num text-xs font-black text-gold">{score}</div>
      </div>
      <div className="flex justify-center items-center gap-2 mt-3">
        <Avatar name="YOU" size={35} ring="sky" hue={210} />
        <div className="text-center">
          <div className="text-[8px] text-mist uppercase font-black">Round</div>
          <div className="num text-sm font-black">{round + 1}/5</div>
        </div>
        <Avatar name="MAX" size={35} ring="violet" hue={290} />
      </div>
      <div className="mx-3 mt-3 well p-2 h-36 relative overflow-hidden">
        <div className="absolute left-3 top-2 text-[8px] font-black text-bull flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-bull rounded-full anim-live" />BTC/USDT
        </div>
        <svg viewBox="0 0 255 90" className="absolute inset-x-2 bottom-2 w-[calc(100%_-_16px)] h-24">
          {[20, 45, 70].map((y) => (
            <line key={y} x1="0" x2="255" y1={y} y2={y} stroke="rgba(140,175,255,.08)" />
          ))}
          <polyline
            points={points}
            fill="none"
            stroke="#22d38a"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray="400"
            strokeDashoffset="400"
            style={{ animation: "dash 1.2s ease forwards" }}
          />
        </svg>
      </div>
      <div className="px-4 pt-4 flex-1">
        <div className="text-[8px] uppercase tracking-widest font-black text-mist mb-1">Read the setup</div>
        <div key={round} className="text-base font-black leading-tight anim-rise">{prompt.q}</div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[prompt.a, prompt.b].map((choice) => {
            const selected = pick === choice;
            const isGood = pick && choice === prompt.good;
            const isBad = selected && !correct;
            return (
              <button
                key={choice}
                onClick={() => choose(choice)}
                className={cn(
                  "h-14 rounded-2xl font-black text-xs transition-all border-2",
                  !pick && "border-ink-600 bg-ink-750 shadow-[0_5px_0_#0a1430] active:translate-y-1 active:shadow-none",
                  isGood && "border-bull bg-bull/20 text-bull shadow-[0_5px_0_#0b7a4a]",
                  isBad && "border-bear bg-bear/20 text-bear shadow-[0_5px_0_#a01e3c] anim-shake",
                  pick && !selected && !isGood && "opacity-45 border-ink-700",
                )}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {pick && (
          <div className={cn("mt-3 rounded-xl p-2.5 flex items-center gap-2 anim-rise", correct ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}>
            <Icon name={correct ? "check" : "x"} size={17} stroke={3} />
            <div className="text-[9px] font-bold flex-1">
              {correct ? "+120 rating · Great market read" : `Correct move: ${prompt.good}`}
            </div>
            <button onClick={next} className="w-8 h-8 rounded-lg bg-white/10 grid place-items-center">
              <Icon name="chevR" size={15} stroke={3} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniCandleChart() {
  const data = [
    [37, 23, 17, 44],
    [23, 29, 19, 35],
    [29, 18, 13, 33],
    [18, 15, 9, 24],
    [15, 27, 12, 31],
    [27, 35, 23, 41],
    [35, 31, 27, 39],
    [31, 46, 29, 50],
    [46, 41, 37, 52],
    [41, 55, 39, 59],
    [55, 49, 45, 60],
    [49, 58, 47, 64],
  ];
  return (
    <svg viewBox="0 0 220 72" className="w-full h-24">
      {data.map(([open, close, low, high], index) => {
        const up = close < open;
        const color = up ? "#22d38a" : "#ff4b6e";
        const x = 12 + index * 18;
        return (
          <g key={index} style={{ animation: `rise .35s ${index * .04}s both` }}>
            <line x1={x} x2={x} y1={low} y2={high} stroke={color} strokeWidth="1.5" />
            <rect x={x - 4.5} y={Math.min(open, close)} width="9" height={Math.max(2, Math.abs(open - close))} rx="1.5" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

function MarketScreen() {
  const [watch, setWatch] = useState(["BTC", "SOL"]);
  const [tab, setTab] = useState<"overview" | "portfolio">("overview");
  const assets = [
    { symbol: "BTC", price: "$67,421", change: "+2.41%" },
    { symbol: "ETH", price: "$3,512", change: "−1.12%" },
    { symbol: "SOL", price: "$172.35", change: "+6.82%" },
  ];
  return (
    <div className="h-full flex flex-col anim-rise">
      <PhoneHeader title="Market" />
      <div className="px-3 flex-1 overflow-y-auto">
        <div className="well p-1 grid grid-cols-2 mb-3">
          {(["overview", "portfolio"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                "h-8 rounded-[10px] text-[9px] font-black uppercase transition-all",
                tab === value ? "bg-sky text-white shadow-[0_3px_0_#1a56a8]" : "text-mist",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        {tab === "overview" ? (
          <>
            <div className="game-surface rounded-2xl p-3 mb-3">
              <div className="flex items-center gap-2">
                <Coin sym="BTC" size={32} />
                <div className="flex-1">
                  <div className="text-[9px] text-mist font-bold">Bitcoin · BTC/USDT</div>
                  <div className="num text-lg font-black">$67,421.50</div>
                </div>
                <span className="num text-[10px] font-black text-bull bg-bull/10 px-2 py-1 rounded-lg">+2.41%</span>
              </div>
              <MiniCandleChart />
              <div className="grid grid-cols-2 gap-2">
                <button className="h-9 rounded-xl bg-bull text-ink-900 text-[9px] font-black shadow-[0_3px_0_#0b7a4a] active:translate-y-1 active:shadow-none">PRACTICE LONG</button>
                <button className="h-9 rounded-xl bg-bear text-white text-[9px] font-black shadow-[0_3px_0_#a01e3c] active:translate-y-1 active:shadow-none">PRACTICE SHORT</button>
              </div>
            </div>
            <div className="text-[8px] uppercase tracking-widest font-black text-mist mb-2">Watchlist</div>
            <div className="space-y-1.5">
              {assets.map((asset) => {
                const selected = watch.includes(asset.symbol);
                const up = asset.change.startsWith("+");
                return (
                  <div key={asset.symbol} className="game-surface rounded-xl p-2 flex items-center gap-2">
                    <button
                      onClick={() => setWatch(selected ? watch.filter((item) => item !== asset.symbol) : [...watch, asset.symbol])}
                      className={selected ? "text-gold" : "text-ink-500"}
                    >
                      <Icon name="star" size={14} fill={selected ? "currentColor" : "none"} />
                    </button>
                    <Coin sym={asset.symbol} size={25} />
                    <span className="text-[10px] font-black flex-1">{asset.symbol}</span>
                    <span className="num text-[9px] font-bold">{asset.price}</span>
                    <span className={cn("num text-[8px] font-black w-11 text-right", up ? "text-bull" : "text-bear")}>{asset.change}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div key="portfolio" className="anim-rise">
            <div className="holo-card rounded-2xl p-4 mb-3">
              <div className="text-[8px] uppercase tracking-widest font-black text-white/60">Demo portfolio</div>
              <div className="num text-3xl font-black mt-1">$12,846.32</div>
              <div className="num text-[10px] text-bull font-black">+$342.18 today</div>
              <div className="flex gap-1 h-2 mt-4 rounded-full overflow-hidden">
                <div className="w-[48%] bg-[#F7931A]" />
                <div className="w-[28%] bg-[#7B8CFF]" />
                <div className="w-[16%] bg-[#14F195]" />
                <div className="flex-1 bg-[#0098EA]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[["Win rate", "68%"], ["Best trade", "+14.2%"], ["Risk score", "A−"], ["Trades", "42"]].map(([label, value]) => (
                <div key={label} className="game-surface rounded-xl p-3">
                  <div className="num font-black text-sm text-sky">{value}</div>
                  <div className="text-[8px] text-mist font-bold uppercase">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileScreen() {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("Alex Volkov");
  return (
    <div className="h-full flex flex-col anim-rise">
      <PhoneHeader title="Profile" />
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="relative rounded-2xl bg-gradient-to-br from-[#2d8cf0] to-[#4f2bb0] p-4 pt-12 mt-8 text-center shadow-[0_5px_0_#111d4f]">
          <div className="absolute left-1/2 -top-8 -translate-x-1/2">
            <Avatar name="Alex" size={68} ring="gold" status="on" hue={205} />
          </div>
          {edit ? (
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setEdit(false)}
              onKeyDown={(event) => event.key === "Enter" && setEdit(false)}
              className="bg-white/10 rounded-lg outline-none text-center font-black text-sm w-full py-1"
            />
          ) : (
            <button onClick={() => setEdit(true)} className="font-black text-sm inline-flex items-center gap-1">
              {name}<Icon name="settings" size={11} />
            </button>
          )}
          <div className="text-[8px] text-white/65 mt-0.5">@alexv · Diamond League</div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[["48.2k", "XP"], ["124", "Streak"], ["92%", "Accuracy"]].map(([value, label]) => (
              <div key={label} className="bg-black/15 rounded-xl py-2">
                <div className="num text-xs font-black">{value}</div>
                <div className="text-[7px] text-white/60 font-bold uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[8px] uppercase tracking-widest font-black text-mist mt-4 mb-2">Achievements</div>
        <div className="flex justify-between game-surface rounded-2xl p-3">
          {[
            ["trophy", "#ffc53d"],
            ["shield", "#22d38a"],
            ["gem", "#3da5ff"],
            ["flame", "#ff8a3d"],
            ["lock", "#4b5f8f"],
          ].map(([icon, color], index) => (
            <div key={index} className="w-10 h-11 relative grid place-items-center">
              <svg viewBox="0 0 40 44" className="absolute inset-0">
                <polygon points="20,1 38,11 38,33 20,43 2,33 2,11" fill={`${color}33`} stroke={color} strokeWidth="2" />
              </svg>
              <span className="relative" style={{ color }}><Icon name={icon} size={17} /></span>
            </div>
          ))}
        </div>
        <div className="text-[8px] uppercase tracking-widest font-black text-mist mt-4 mb-2">This week</div>
        <div className="game-surface rounded-2xl p-3">
          <div className="flex items-end justify-between h-20 gap-1">
            {[42, 70, 55, 88, 64, 92, 35].map((height, index) => (
              <div key={index} className="flex-1 h-full flex flex-col justify-end gap-1">
                <div
                  className={cn("rounded-t-md", index < 6 ? "bg-gradient-to-t from-[#16b56f] to-[#3ce49e]" : "bg-ink-600")}
                  style={{ height: `${height}%`, animation: `rise .45s ${index * .05}s both` }}
                />
                <span className="text-[7px] text-mist text-center">{["M", "T", "W", "T", "F", "S", "S"][index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileGameShell() {
  const [screen, setScreen] = useState<ScreenName>("home");
  const [lesson, setLesson] = useState(false);
  return (
    <Asset
      code="SCR-01"
      title="Playable Mobile Shell"
      desc="Five connected production screens inside a real device shell. Bottom navigation preserves state; Learn opens a nested lesson route."
      tags={["5 screens", "stateful", "mobile"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-center">
        <div className="phone mx-auto">
          <div className="phone-screen flex flex-col">
            <div className="flex-1 min-h-0">
              {lesson ? (
                <div className="h-full flex flex-col anim-rise">
                  <PhoneHeader title="Hammer & Star" back onBack={() => setLesson(false)} />
                  <div className="px-4 flex-1 flex flex-col">
                    <Bar value={42} color="bull" h={9} />
                    <div className="flex-1 grid place-items-center text-center">
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-violet mb-3">Lesson 4 · Concept</div>
                        <div className="relative w-32 h-32 mx-auto rounded-full bg-sky/10 grid place-items-center mb-4">
                          <svg viewBox="0 0 70 90" className="w-20 h-24 anim-float">
                            <line x1="35" x2="35" y1="14" y2="82" stroke="#22d38a" strokeWidth="4" strokeLinecap="round" />
                            <rect x="20" y="20" width="30" height="30" rx="6" fill="#22d38a" />
                            <rect x="24" y="24" width="7" height="22" rx="3" fill="rgba(255,255,255,.3)" />
                          </svg>
                          <span className="absolute inset-3 rounded-full border border-sky/20 anim-pulse-ring" style={{ ["--ring" as string]: "rgba(61,165,255,.18)" }} />
                        </div>
                        <div className="text-xl font-black">The Hammer</div>
                        <p className="text-[10px] leading-relaxed text-mist mt-2 max-w-[240px]">
                          A small body with a long lower wick. Sellers pushed down, but buyers took control before the close.
                        </p>
                      </div>
                    </div>
                    <button className="mb-4 h-12 rounded-2xl bg-gradient-to-b from-[#3ce49e] to-[#16b56f] text-white text-[10px] font-black uppercase shadow-[0_5px_0_#0b7a4a] active:translate-y-1 active:shadow-none">
                      Got it · Continue
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {screen === "home" && <HomeScreen onGo={setScreen} />}
                  {screen === "learn" && <LearnScreen onOpen={() => setLesson(true)} />}
                  {screen === "arena" && <ArenaScreen />}
                  {screen === "market" && <MarketScreen />}
                  {screen === "profile" && <ProfileScreen />}
                </>
              )}
            </div>
            {!lesson && <PhoneTabs active={screen} onChange={setScreen} />}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[.2em] text-sky mb-3">Real product composition</div>
          <h4 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">Not isolated atoms.<br />A connected game.</h4>
          <p className="text-sm text-mist leading-relaxed mb-5 max-w-xl">
            The shell proves the system at product level: persistent navigation, nested routes, responsive chart content,
            real challenge feedback, profile editing, mission claiming and a complete learning handoff.
          </p>
          <div className="space-y-2 mb-6">
            {SHELL_TABS.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => { setLesson(false); setScreen(tab.id); }}
                className={cn(
                  "w-full max-w-md flex items-center gap-3 p-3 rounded-2xl text-left transition-all border",
                  screen === tab.id && !lesson
                    ? "bg-sky/10 border-sky/40 translate-x-1"
                    : "bg-white/[.025] border-white/[.06] hover:bg-white/[.05]",
                )}
              >
                <span className={cn("w-9 h-9 rounded-xl grid place-items-center", screen === tab.id && !lesson ? "bg-sky text-white" : "bg-ink-700 text-mist")}>
                  <Icon name={tab.icon} size={18} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-black">{tab.label}</span>
                  <span className="block text-[10px] text-mist">{["Missions & daily loop", "Skill path & lessons", "Ranked decision drills", "Practice market", "Identity & progress"][index]}</span>
                </span>
                <Icon name="chevR" size={16} className="text-mist" />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["State preserved", "44px tap targets", "Safe-area ready", "No dead screens"].map((item) => (
              <span key={item} className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-bull/10 text-bull border border-bull/20 flex items-center gap-1">
                <Icon name="check" size={11} stroke={3} />{item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Asset>
  );
}

function TodayHub() {
  const [mission, setMission] = useState(1);
  const missions = [
    { title: "Morning Pulse", sub: "Read 3 market headlines", icon: "sparkle", color: "sky" },
    { title: "Risk Check", sub: "Set a stop-loss in demo", icon: "shield", color: "bull" },
    { title: "Quick Fire", sub: "Answer 5 pattern cards", icon: "bolt", color: "gold" },
  ];
  return (
    <Asset
      code="SCR-02"
      title="Today Hub"
      desc="A daily agenda that keeps one clear next action. Selecting a mission updates the hero and reward context without navigation."
      tags={["daily loop", "focus"]}
    >
      <div className="rounded-[22px] overflow-hidden bg-gradient-to-br from-[#1b3471] to-[#0c1839] border border-sky/20 shadow-[0_5px_0_#050b1d]">
        <div className="p-4 relative min-h-36">
          <div className="relative z-10 max-w-[70%]">
            <div className="text-[9px] uppercase tracking-[.18em] font-black text-gold mb-1">Today · 12 min</div>
            <div key={mission} className="font-black text-xl leading-tight anim-rise">{missions[mission].title}</div>
            <p key={`s${mission}`} className="text-xs text-mist mt-1 anim-rise">{missions[mission].sub}</p>
            <button className="mt-4 h-9 px-4 rounded-xl bg-bull text-ink-900 text-[10px] font-black uppercase shadow-[0_4px_0_#0b7a4a] active:translate-y-1 active:shadow-none">
              Start · +15 XP
            </button>
          </div>
          <div className="absolute right-3 bottom-2 w-24 h-24 rounded-full bg-sky/10 grid place-items-center anim-liquid">
            <Icon name={missions[mission].icon} size={45} className={cn({ sky: "text-sky", bull: "text-bull", gold: "text-gold" }[missions[mission].color])} />
          </div>
        </div>
        <div className="p-2 bg-black/15 grid grid-cols-3 gap-1.5">
          {missions.map((item, index) => (
            <button
              key={item.title}
              onClick={() => setMission(index)}
              className={cn(
                "rounded-xl p-2 text-left transition-all border",
                mission === index ? "bg-white/10 border-sky/35" : "border-transparent hover:bg-white/5",
              )}
            >
              <Icon name={item.icon} size={15} className={cn("mb-1", { sky: "text-sky", bull: "text-bull", gold: "text-gold" }[item.color])} />
              <div className="text-[9px] font-black leading-tight">{item.title}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mt-4">
        {[true, true, true, true, false, false, false].map((done, index) => (
          <div key={index} className="text-center">
            <div className={cn("h-7 rounded-lg grid place-items-center", done ? "bg-bull text-ink-900 shadow-[0_2px_0_#0b7a4a]" : index === 4 ? "border-2 border-dashed border-gold text-gold anim-breathe" : "bg-ink-700 text-mist")}>{done ? <Icon name="check" size={12} stroke={3} /> : index + 1}</div>
            <div className="text-[7px] text-mist mt-1">{["M", "T", "W", "T", "F", "S", "S"][index]}</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

function SessionRecap() {
  const [page, setPage] = useState(0);
  const [shared, setShared] = useState(false);
  const pages = [
    { label: "Market read", value: "92%", detail: "You caught the breakout before 88% of players.", icon: "target", color: "text-bull" },
    { label: "Risk discipline", value: "A−", detail: "Every trade had a stop. Average risk stayed below 1.4%.", icon: "shield", color: "text-sky" },
    { label: "New best", value: "7×", detail: "Seven correct decisions in a row. Personal record.", icon: "flame", color: "text-flame" },
  ];
  const current = pages[page];
  return (
    <Asset
      code="SCR-03"
      title="Session Recap"
      desc="Swipe-like recap carousel turns raw stats into a motivating story and creates a branded share moment."
      tags={["story", "share"]}
    >
      <div className="holo-card rounded-[22px] p-5 min-h-64 flex flex-col relative">
        <div className="relative z-10 flex justify-between items-center">
          <div className="text-[9px] font-black uppercase tracking-[.2em] text-white/55">Session complete</div>
          <div className="flex gap-1">{pages.map((_, index) => <span key={index} className={cn("h-1.5 rounded-full transition-all", index === page ? "w-6 bg-white" : "w-2 bg-white/25")} />)}</div>
        </div>
        <div key={page} className="relative z-10 flex-1 grid place-items-center text-center anim-card-deal">
          <div>
            <div className="w-20 h-20 mx-auto rounded-[24px] bg-white/10 border border-white/15 grid place-items-center mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
              <Icon name={current.icon} size={38} className={current.color} />
            </div>
            <div className={cn("num text-5xl font-black", current.color)}>{current.value}</div>
            <div className="font-black text-lg">{current.label}</div>
            <p className="text-xs text-fog/70 max-w-xs mt-2">{current.detail}</p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-[40px_1fr_40px] gap-2">
          <button onClick={() => setPage((page + pages.length - 1) % pages.length)} className="h-10 rounded-xl bg-white/5 grid place-items-center active:scale-90"><Icon name="chevL" size={16} /></button>
          <button onClick={() => setShared(true)} className={cn("h-10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all", shared ? "bg-bull/15 text-bull" : "bg-sky text-white shadow-[0_3px_0_#1a56a8]")}>
            <Icon name={shared ? "check" : "send"} size={14} />{shared ? "Share card copied" : "Share result"}
          </button>
          <button onClick={() => setPage((page + 1) % pages.length)} className="h-10 rounded-xl bg-white/5 grid place-items-center active:scale-90"><Icon name="chevR" size={16} /></button>
        </div>
      </div>
    </Asset>
  );
}

export default function CoreScreens() {
  return (
    <Section
      id="screens"
      index="09"
      title="Core Screens"
      subtitle="The system assembled into connected mobile experiences — not another wall of disconnected components."
    >
      <MobileGameShell />
      <TodayHub />
      <SessionRecap />
    </Section>
  );
}