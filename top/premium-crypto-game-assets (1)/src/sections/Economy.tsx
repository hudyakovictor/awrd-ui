import { useEffect, useState } from "react";
import { Asset, Bar, Btn, Confetti, Section, useAnimatedNumber } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { Medal } from "./Gamification";

type StoreItem = {
  id: string;
  name: string;
  sub: string;
  icon: string;
  price: number;
  color: string;
  variant: "sky" | "gold" | "violet" | "bull" | "flame";
};

const STORE_ITEMS: StoreItem[] = [
  { id: "freeze", name: "Streak Freeze", sub: "Protect one missed day", icon: "shield", price: 180, color: "#3da5ff", variant: "sky" },
  { id: "hearts", name: "Full Hearts", sub: "Restore all five lives", icon: "heart", price: 240, color: "#ff4b6e", variant: "flame" },
  { id: "xp", name: "Double XP", sub: "2× rewards for 30 min", icon: "bolt", price: 320, color: "#ffc53d", variant: "gold" },
  { id: "radar", name: "Whale Radar", sub: "Reveal one market clue", icon: "target", price: 150, color: "#9b6bff", variant: "violet" },
];

function ShopItemCard({ item, owned, onBuy }: { item: StoreItem; owned: number; onBuy: () => void }) {
  return (
    <div className="game-surface rounded-2xl p-3 flex flex-col relative overflow-hidden group">
      <div className="absolute -right-5 -top-5 w-20 h-20 rounded-full opacity-10 blur-xl transition-transform group-hover:scale-150" style={{ background: item.color }} />
      <div className="flex items-start justify-between mb-3 relative">
        <div className="w-12 h-12 rounded-2xl grid place-items-center" style={{ color: item.color, background: `${item.color}1f`, boxShadow: `inset 0 0 0 1px ${item.color}33` }}>
          <Icon name={item.icon} size={25} fill={item.icon === "heart" || item.icon === "bolt" ? "currentColor" : "none"} />
        </div>
        {owned > 0 && <span className="num text-[9px] font-black px-2 py-1 rounded-lg bg-bull/15 text-bull anim-pop">OWNED ×{owned}</span>}
      </div>
      <div className="font-black text-sm">{item.name}</div>
      <div className="text-[10px] text-mist leading-relaxed mt-0.5 mb-3">{item.sub}</div>
      <button onClick={onBuy} className={cn("btn3d h-10 text-[10px] mt-auto", `v-${item.variant}`)} style={{ ["--lip" as string]: "4px" }}>
        <Icon name="gem" size={14} fill="currentColor" />{item.price}
      </button>
    </div>
  );
}

function ItemShop() {
  const [gems, setGems] = useState(840);
  const [owned, setOwned] = useState<Record<string, number>>({ freeze: 1 });
  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [status, setStatus] = useState<"confirm" | "success" | "poor">("confirm");
  const [burst, setBurst] = useState(0);
  const displayGems = useAnimatedNumber(gems, 550);

  const open = (item: StoreItem) => {
    setSelected(item);
    setStatus(gems >= item.price ? "confirm" : "poor");
  };

  const buy = () => {
    if (!selected || gems < selected.price) return;
    setGems((value) => value - selected.price);
    setOwned((value) => ({ ...value, [selected.id]: (value[selected.id] ?? 0) + 1 }));
    setStatus("success");
    setBurst((value) => value + 1);
  };

  return (
    <Asset
      code="ECO-01"
      title="Power-up Shop"
      desc="Consumable economy with persistent inventory, insufficient-funds guard and a complete confirm-to-reward purchase flow."
      tags={["purchase flow", "inventory"]}
      span={2}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="tile px-3 py-2 flex items-center gap-2">
          <Icon name="gem" size={20} fill="#3da5ff" stroke={1.5} className="text-sky" />
          <div><div className="num text-lg font-black text-sky">{Math.round(displayGems).toLocaleString()}</div><div className="text-[8px] uppercase font-bold text-mist">Gem balance</div></div>
        </div>
        <div className="text-xs text-mist">Power-ups support learning. They never alter simulated market results.</div>
        <Btn variant="sky" size="sm" className="ml-auto" icon="plus" onClick={() => setGems((value) => value + 500)}>Demo +500</Btn>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STORE_ITEMS.map((item) => (
          <ShopItemCard key={item.id} item={item} owned={owned[item.id] ?? 0} onBuy={() => open(item)} />
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[90] grid place-items-center p-4">
          <button aria-label="Close purchase" onClick={() => setSelected(null)} className="absolute inset-0 bg-ink-950/75 backdrop-blur-md" />
          <div className="panel p-6 max-w-sm w-full relative text-center anim-bounce-in">
            <Confetti burst={burst} count={34} />
            {status === "confirm" && (
              <>
                <div className="w-20 h-20 rounded-[26px] mx-auto grid place-items-center mb-4" style={{ color: selected.color, background: `${selected.color}1f`, boxShadow: `inset 0 0 0 2px ${selected.color}44, 0 8px 0 #060c1f` }}>
                  <Icon name={selected.icon} size={38} fill={selected.icon === "heart" || selected.icon === "bolt" ? "currentColor" : "none"} />
                </div>
                <div className="text-xl font-black">Buy {selected.name}?</div>
                <div className="text-sm text-mist mt-1 mb-5">{selected.sub}</div>
                <div className="well p-3 flex items-center justify-between mb-5">
                  <span className="text-xs text-mist">Total</span>
                  <span className="num text-lg font-black text-sky flex items-center gap-1"><Icon name="gem" size={18} fill="currentColor" />{selected.price}</span>
                </div>
                <div className="grid grid-cols-2 gap-3"><Btn variant="ghost" onClick={() => setSelected(null)}>Cancel</Btn><Btn variant={selected.variant} onClick={buy}>Confirm</Btn></div>
              </>
            )}
            {status === "success" && (
              <>
                <div className="w-24 h-24 rounded-full mx-auto grid place-items-center bg-gradient-to-b from-[#3ce49e] to-[#16b56f] shadow-[0_6px_0_#0b7a4a,0_0_34px_rgba(34,211,138,.35)] anim-bounce-in">
                  <Icon name="check" size={44} stroke={3.5} />
                </div>
                <div className="text-2xl font-black mt-5">Added to inventory</div>
                <div className="text-sm text-mist mt-1 mb-5">{selected.name} is ready when you need it.</div>
                <Btn variant="bull" block onClick={() => setSelected(null)}>Nice</Btn>
              </>
            )}
            {status === "poor" && (
              <>
                <div className="w-20 h-20 rounded-[26px] mx-auto grid place-items-center bg-bear/15 text-bear mb-4 anim-shake"><Icon name="gem" size={38} /></div>
                <div className="text-xl font-black">Not enough gems</div>
                <div className="text-sm text-mist mt-1 mb-5">You need {selected.price - gems} more. Complete quests instead of interrupting the session with a payment wall.</div>
                <Btn variant="sky" block onClick={() => { setGems((value) => value + 500); setStatus("confirm"); }}>Use demo gems</Btn>
              </>
            )}
          </div>
        </div>
      )}
    </Asset>
  );
}

const PASS_REWARDS = [
  { level: 1, free: "50 gems", pro: "Avatar frame", icon: "gem" },
  { level: 2, free: "10 XP", pro: "2× XP boost", icon: "bolt" },
  { level: 3, free: "Freeze", pro: "Bull badge", icon: "shield" },
  { level: 4, free: "80 gems", pro: "Market theme", icon: "sparkle" },
  { level: 5, free: "Chest", pro: "Legend medal", icon: "gift" },
  { level: 6, free: "20 XP", pro: "300 gems", icon: "crown" },
];

function SeasonPass() {
  const [xp, setXp] = useState(240);
  const [pro, setPro] = useState(false);
  const [claimed, setClaimed] = useState<string[]>(["f1", "p1", "f2"]);
  const level = Math.min(6, Math.floor(xp / 100) + 1);
  const claim = (id: string) => setClaimed((value) => value.includes(id) ? value : [...value, id]);
  return (
    <Asset
      code="ECO-02"
      title="Season Road"
      desc="Free and Pro reward tracks share one readable progression road. Claimable rewards pulse; claimed states never compete."
      tags={["season", "claim"]}
      span={2}
    >
      <div className="rounded-[22px] bg-gradient-to-r from-[#25185d] via-[#44248f] to-[#1d3f85] p-4 relative overflow-hidden mb-5 shadow-[0_5px_0_#100a31]">
        <div className="absolute inset-0 dotgrid opacity-20" />
        <div className="relative flex flex-wrap items-center gap-4">
          <Medal tier="legend" icon="crown" size={65} />
          <div className="flex-1 min-w-48">
            <div className="text-[9px] font-black uppercase tracking-[.2em] text-[#d8c6ff]">Season 04 · Market Makers</div>
            <div className="text-xl font-black">22 days remaining</div>
            <div className="flex items-center gap-2 mt-2"><Bar value={xp % 100} color="violet" h={10} className="flex-1" /><span className="num text-[10px] font-black">{xp % 100}/100</span></div>
          </div>
          <Btn variant={pro ? "ghost" : "violet"} size="sm" icon={pro ? "check" : "crown"} onClick={() => setPro(true)}>{pro ? "Pro active" : "Unlock Pro"}</Btn>
        </div>
      </div>
      <div className="overflow-x-auto pb-3">
        <div className="min-w-[720px] grid grid-cols-[90px_repeat(6,1fr)] gap-2 items-center">
          <div className="text-[9px] font-black uppercase text-mist">Pro road</div>
          {PASS_REWARDS.map((reward) => {
            const unlocked = pro && reward.level <= level;
            const id = `p${reward.level}`;
            const done = claimed.includes(id);
            return (
              <button key={id} disabled={!unlocked || done} onClick={() => claim(id)} className={cn("h-24 rounded-2xl p-2 flex flex-col items-center justify-center transition-all border-2", done ? "bg-bull/10 border-bull/25 text-bull" : unlocked ? "bg-violet/15 border-violet text-violet shadow-[0_4px_0_#4f2bb0] anim-breathe" : "bg-ink-800 border-ink-700 text-mist/45")}>
                <Icon name={done ? "check" : pro ? reward.icon : "lock"} size={21} stroke={2.6} />
                <span className="text-[9px] font-black mt-1 text-center">{reward.pro}</span>
                {unlocked && !done && <span className="text-[7px] uppercase mt-1">Claim</span>}
              </button>
            );
          })}
          <div className="text-[9px] font-black uppercase text-mist">Free road</div>
          {PASS_REWARDS.map((reward) => {
            const unlocked = reward.level <= level;
            const id = `f${reward.level}`;
            const done = claimed.includes(id);
            return (
              <button key={id} disabled={!unlocked || done} onClick={() => claim(id)} className={cn("h-20 rounded-2xl p-2 flex flex-col items-center justify-center transition-all border-2", done ? "bg-bull/10 border-bull/25 text-bull" : unlocked ? "bg-gold/10 border-gold text-gold shadow-[0_4px_0_#b07600]" : "bg-ink-800 border-ink-700 text-mist/45")}>
                <Icon name={done ? "check" : unlocked ? reward.icon : "lock"} size={19} />
                <span className="text-[9px] font-black mt-1">{reward.free}</span>
              </button>
            );
          })}
          <span />
          {PASS_REWARDS.map((reward) => <div key={reward.level} className={cn("num text-center text-[10px] font-black pt-1", reward.level <= level ? "text-gold" : "text-mist")}>LV {reward.level}</div>)}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
        <Btn variant="gold" size="sm" icon="bolt" onClick={() => setXp((value) => Math.min(599, value + 75))}>+75 season XP</Btn>
        <span className="text-xs text-mist">Level <b className="num text-fog">{level}</b> · {claimed.length} rewards claimed</span>
      </div>
    </Asset>
  );
}

const CALENDAR = [
  { day: 1, icon: "gem", value: "20", color: "sky" },
  { day: 2, icon: "bolt", value: "15 XP", color: "gold" },
  { day: 3, icon: "heart", value: "+1", color: "bear" },
  { day: 4, icon: "gem", value: "40", color: "sky" },
  { day: 5, icon: "shield", value: "Freeze", color: "violet" },
  { day: 6, icon: "bolt", value: "30 XP", color: "gold" },
  { day: 7, icon: "gift", value: "Mega", color: "flame" },
];

function LoginCalendar() {
  const [day, setDay] = useState(3);
  const [claimed, setClaimed] = useState<number[]>([1, 2]);
  const [burst, setBurst] = useState(0);
  const claim = () => {
    if (claimed.includes(day)) return;
    setClaimed((value) => [...value, day]);
    setBurst((value) => value + 1);
    if (day < 7) setTimeout(() => setDay((value) => value + 1), 500);
  };
  return (
    <Asset
      code="ECO-03"
      title="7-Day Reward Calendar"
      desc="A compact retention loop with explicit past, today, future and milestone states. Reward reveal never hides what comes next."
      tags={["retention", "reward"]}
    >
      <div className="relative">
        <Confetti burst={burst} count={28} />
        <div className="grid grid-cols-4 gap-2">
          {CALENDAR.slice(0, 6).map((reward) => {
            const done = claimed.includes(reward.day);
            const current = reward.day === day;
            return (
              <button key={reward.day} disabled={!current || done} onClick={claim} className={cn("relative rounded-2xl p-2 min-h-24 border-2 flex flex-col items-center justify-center transition-all", done ? "bg-bull/10 border-bull/20 text-bull" : current ? "bg-gold/15 border-gold text-gold shadow-[0_5px_0_#b07600] anim-breathe" : "bg-ink-800 border-ink-700 text-mist/45")}>
                <span className="absolute top-1.5 left-2 num text-[8px] font-black">DAY {reward.day}</span>
                <Icon name={done ? "check" : reward.icon} size={23} fill={reward.icon === "heart" || reward.icon === "bolt" ? "currentColor" : "none"} />
                <span className="text-[9px] font-black mt-1">{done ? "Claimed" : reward.value}</span>
              </button>
            );
          })}
          <button disabled={day !== 7 || claimed.includes(7)} onClick={claim} className={cn("col-span-2 relative rounded-2xl p-3 min-h-24 border-2 flex items-center gap-3 transition-all overflow-hidden", claimed.includes(7) ? "bg-bull/10 border-bull/20 text-bull" : day === 7 ? "bg-gradient-to-br from-flame/25 to-violet/20 border-flame text-flame shadow-[0_5px_0_#b84a10] anim-breathe" : "bg-ink-800 border-ink-700 text-mist/45")}>
            <Icon name={claimed.includes(7) ? "check" : "gift"} size={38} />
            <div className="text-left"><div className="num text-[8px] font-black">DAY 7 · GRAND PRIZE</div><div className="font-black text-sm">Mega learning chest</div><div className="text-[9px] opacity-75">500 gems + rare frame</div></div>
            <Icon name="sparkle" size={50} className="absolute -right-2 -top-3 opacity-10" />
          </button>
          <div className="col-span-2 game-surface rounded-2xl p-3 flex items-center gap-3">
            <div className="text-3xl font-black text-flame num">{claimed.length}</div>
            <div><div className="text-xs font-black">Rewards collected</div><div className="text-[9px] text-mist">Return daily to continue</div></div>
          </div>
        </div>
      </div>
      <Btn variant="gold" block className="mt-4" disabled={claimed.includes(day)} onClick={claim}>{claimed.includes(day) ? "Come back tomorrow" : `Claim day ${day}`}</Btn>
    </Asset>
  );
}

function CurrencyPacks() {
  const packs = [
    { gems: 500, bonus: 0, price: "$2.99", label: "Starter", color: "sky" },
    { gems: 1400, bonus: 12, price: "$6.99", label: "Popular", color: "violet" },
    { gems: 3200, bonus: 25, price: "$14.99", label: "Best value", color: "gold" },
  ];
  const [selected, setSelected] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const pay = () => {
    setLoading(true);
    setDone(false);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1300);
  };
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(false), 2500);
    return () => clearTimeout(timer);
  }, [done]);
  return (
    <Asset
      code="ECO-04"
      title="Currency Packs"
      desc="Transparent value comparison with one highlighted recommendation and an async native-purchase state."
      tags={["store", "async"]}
    >
      <div className="space-y-2.5 mb-4">
        {packs.map((pack, index) => (
          <button key={pack.gems} onClick={() => setSelected(index)} className={cn("w-full rounded-2xl p-3 border-2 flex items-center gap-3 transition-all text-left", selected === index ? ({ sky: "border-sky bg-sky/10 shadow-[0_4px_0_#1a56a8]", violet: "border-violet bg-violet/10 shadow-[0_4px_0_#4f2bb0]", gold: "border-gold bg-gold/10 shadow-[0_4px_0_#b07600]" }[pack.color]) : "border-ink-600 bg-ink-800 hover:border-ink-500")}>
            <div className="relative w-12 h-12 grid place-items-center">
              <Icon name="gem" size={30} fill={selected === index ? "currentColor" : "none"} className={({ sky: "text-sky", violet: "text-violet", gold: "text-gold" }[pack.color])} />
              {index > 0 && <Icon name="sparkle" size={14} className="absolute right-0 top-0 text-gold anim-glow" />}
            </div>
            <div className="flex-1"><div className="font-black">{pack.gems.toLocaleString()} gems</div><div className="text-[9px] text-mist">{pack.label}{pack.bonus ? ` · ${pack.bonus}% bonus` : ""}</div></div>
            <span className="num font-black">{pack.price}</span>
          </button>
        ))}
      </div>
      {done ? (
        <div className="rounded-xl p-3 bg-bull/10 border border-bull/30 text-bull flex items-center gap-2 anim-rise"><Icon name="check" size={18} stroke={3} /><span className="text-sm font-black">Purchase complete · +{packs[selected].gems} gems</span></div>
      ) : (
        <Btn variant={({ sky: "sky", violet: "violet", gold: "gold" } as const)[packs[selected].color as "sky" | "violet" | "gold"]} block loading={loading} onClick={pay}>Buy {packs[selected].price}</Btn>
      )}
      <p className="text-[9px] text-mist text-center mt-3">One-time purchase · no subscription · parental controls supported</p>
    </Asset>
  );
}

export default function Economy() {
  return (
    <Section
      id="economy"
      index="10"
      title="Economy & Rewards"
      subtitle="A fair progression economy: clear value, useful rewards, no manipulative pressure and no pay-to-win."
    >
      <ItemShop />
      <SeasonPass />
      <LoginCalendar />
      <CurrencyPacks />
    </Section>
  );
}