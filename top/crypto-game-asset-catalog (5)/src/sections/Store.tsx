import { useRef, useState } from "react";
import { Asset, Badge, Bar, Btn3D, Confetti, CountUp, Label, Section, Segmented, useToast } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { burstAtEl, burstCoins, burstConfetti, flash, shake } from "../utils/fx";
import { MASCOT_IMG } from "./Mascot";

type Wallet = { coins: number; gems: number };
const START: Wallet = { coins: 12450, gems: 1280 };

type ShopItem = { id: string; t: string; d: string; price: number; g: "bolt" | "heart" | "chest" | "gem"; rare?: boolean };
const BOOSTS: ShopItem[] = [
  { id: "b1", t: "XP Boost ×2", d: "30 минут двойного опыта", price: 250, g: "bolt" },
  { id: "b2", t: "XP Boost ×4", d: "1 час · для маратона", price: 450, g: "bolt", rare: true },
  { id: "b3", t: "Streak Freeze", d: "Заморозка серии на 1 день", price: 200, g: "heart" },
  { id: "b4", t: "Refill Hearts", d: "+5 сердец мгновенно", price: 400, g: "heart", rare: true },
];
const CHESTS: ShopItem[] = [
  { id: "c1", t: "Bronze Chest", d: "100–250 XP, монеты", price: 100, g: "chest" },
  { id: "c2", t: "Silver Chest", d: "250–600 XP, шанс буста", price: 250, g: "chest" },
  { id: "c3", t: "Gold Chest", d: "600–1200 XP + freeze", price: 600, g: "chest", rare: true },
  { id: "c4", t: "Mystery Vault", d: "Редкие награды · skin?", price: 1200, g: "chest", rare: true },
];
const PACKS = [
  { id: "p1", price: "$0.99", gems: 150, b: "" },
  { id: "p2", price: "$4.99", gems: 800, b: "Популярно" },
  { id: "p3", price: "$19.99", gems: 4500, b: "Best value" },
];
type Quest = { id: string; t: string; p: number; total: number; reward: number; claimed?: boolean };
const START_QUESTS: Quest[] = [
  { id: "q1", t: "Пройди 3 урока", p: 2, total: 3, reward: 100 },
  { id: "q2", t: "Выиграй 5 прогнозов рынка", p: 5, total: 5, reward: 150 },
  { id: "q3", t: "Добей комбо ×5", p: 3, total: 5, reward: 200 },
];
const SKINS = [
  { id: "default", t: "Classic", price: 0, f: "none", d: "Стандартная худи" },
  { id: "neon", t: "Neon Pulse", price: 2000, f: "hue-rotate(120deg) saturate(1.5) brightness(1.05)", d: "Медвежий неон" },
  { id: "gold", t: "Golden Bull", price: 5000, f: "sepia(1) saturate(3.2) hue-rotate(-18deg) brightness(1.02)", d: "За золото рынка" },
  { id: "stealth", t: "Stealth Ops", price: 3000, f: "grayscale(1) brightness(1.15) contrast(1.1) hue-rotate(190deg) saturate(2.5)", d: "Для ночных сессий" },
];

function GemPrice({ n }: { n: number }) {
  return <span className="inline-flex items-center gap-1 num font-extrabold text-[12.5px] text-cyan"><Glyph name="gem" size={15} />{n.toLocaleString()}</span>;
}

function Shop() {
  const toast = useToast();
  const [w, setW] = useState<Wallet>(START);
  const [tab, setTab] = useState<"boosts" | "chests" | "iaps">("boosts");
  const [owned, setOwned] = useState<string[]>(["b3"]);
  const [fire, setFire] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const tryBuy = (item: ShopItem, free = false) => {
    if (owned.includes(item.id)) return;
    if (!free && w.gems < item.price) {
      shake("soft"); flash("rgba(255,77,106,.16)"); sfx.error();
      toast({ type: "error", title: "Не хватает кристаллов", msg: `Нужно ещё ${(item.price - w.gems).toLocaleString()} 💎` });
      return;
    }
    if (!free) setW((s) => ({ ...s, gems: s.gems - item.price }));
    setOwned((o) => [...o, item.id]);
    setFire(Date.now());
    const r = ref.current?.getBoundingClientRect();
    if (r) burstCoins(r.left + Math.min(r.width / 2, 320), r.top + 120, 14);
    burstAtEl(ref.current, "ring", "#2ed3f0");
    sfx.success(); haptic([15, 25, 40]);
    toast({ type: "success", title: `Куплено: ${item.t}`, msg: free ? "Бесплатно" : `−${item.price.toLocaleString()} 💎` });
  };
  return (
    <Asset title="Gem Shop" id="eco.shop" desc="Живой баланс: покупка списывает кристаллы; нехватка — shake + красная вспышка. Вкладка IAP — имитация покупки пакетов." className="lg:col-span-2" tags={["CORE"]}>
      <div ref={ref} className="relative">
        <Confetti fire={fire} count={40} />
        <div className="flex items-center gap-3 mb-4">
          <span className="raised !rounded-full pl-1.5 pr-3.5 h-10 flex items-center gap-2"><span className="size-7 rounded-full bg-ink-850 grid place-items-center"><Glyph name="coin" size={20} /></span><CountUp value={w.coins} className="text-[14px] font-extrabold text-gold" /></span>
          <span className="raised !rounded-full pl-1.5 pr-3.5 h-10 flex items-center gap-2"><span className="size-7 rounded-full bg-ink-850 grid place-items-center"><Glyph name="gem" size={20} /></span><CountUp value={w.gems} className="text-[14px] font-extrabold text-cyan" /></span>
          <span className="text-[11px] text-dim font-bold ml-auto hidden sm:block">Скип — <button className="text-blue underline font-bold" onClick={() => { setW(START); sfx.tap(); }}>сброс</button></span>
        </div>
        <Segmented value={tab} onChange={setTab} size="sm" className="mb-4 w-full sm:w-auto sm:min-w-[300px]" options={[{ value: "boosts", label: "Boosts" }, { value: "chests", label: "Chests" }, { value: "iaps", label: "Gems" }]} />
        {tab !== "iaps" ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {(tab === "boosts" ? BOOSTS : CHESTS).map((it) => {
              const isOwned = owned.includes(it.id);
              return (
                <div key={it.id} className={cn("raised p-3.5 flex items-center gap-3 relative overflow-hidden", it.rare && "ring-1 ring-gold/30")}>
                  {it.rare && <div className="absolute -top-6 -right-6 size-16 rounded-full bg-gold/15 blur-xl" />}
                  <span className="size-12 rounded-xl bg-ink-850 grid place-items-center shadow-inner"><Glyph name={it.g} size={30} /></span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold flex items-center gap-1.5">{it.t}{it.rare && <Badge tone="gold" size="xs">Rare</Badge>}</div>
                    <div className="text-[11px] text-mute">{it.d}</div>
                  </div>
                  {isOwned
                    ? <span className="text-[11px] font-extrabold text-bull flex items-center gap-1"><Icon name="check" size={14} stroke={3} />Active</span>
                    : <Btn3D size="xs" variant="cyan" onClick={() => tryBuy(it)}><GemPrice n={it.price} /></Btn3D>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {PACKS.map((p) => (
              <div key={p.id} className={cn("raised p-4 text-center relative", p.b === "Best value" && "ring-2 ring-gold/60")}>
                {p.b && <span className={cn("absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold uppercase tracking-wider rounded-full px-2 py-0.5", p.b === "Best value" ? "bg-gold text-ink-900" : "bg-blue text-white")}>{p.b}</span>}
                <div className="flex justify-center gap-1 my-2">{Array.from({ length: Math.ceil(p.gems / 1500) + 1 }).map((_, i) => <Glyph key={i} name="gem" size={26} dim={i > 0} />)}</div>
                <div className="num text-[20px] font-extrabold">{p.gems.toLocaleString()}</div>
                <div className="text-[10px] text-dim font-bold uppercase mb-3">Gems</div>
                <Btn3D size="sm" full variant={p.b ? "gold" : "blue"} onClick={() => { setW((s) => ({ ...s, gems: s.gems + p.gems })); setFire(Date.now()); burstCoins(innerWidth / 2, innerHeight / 2, 10); sfx.coin(); toast({ type: "success", title: "Пакет активирован", msg: `+${p.gems.toLocaleString()} 💎` }); }}>{p.price}</Btn3D>
              </div>
            ))}
          </div>
        )}
      </div>
    </Asset>
  );
}

function DailyQuests() {
  const toast = useToast();
  const [quests, setQuests] = useState(START_QUESTS);
  const [fire, setFire] = useState(0);
  const claim = (q: Quest) => {
    if (q.claimed || q.p < q.total) return;
    setQuests(quests.map((x) => (x.id === q.id ? { ...x, claimed: true } : x)));
    setFire(Date.now());
    sfx.coin(); haptic(20);
    toast({ type: "success", title: `+${q.reward} 💎 за квест`, msg: q.t });
  };
  const done = quests.filter((q) => q.p >= q.total && !q.claimed).length;
  return (
    <Asset title="Daily Quests" id="eco.quests" desc="Задания дня с наградами в кристаллах. Клик — прогресс, при выполнении — claim.">
      <div className="relative">
        <Confetti fire={fire} count={30} />
        <div className="flex items-center justify-between mb-3">
          <Label className="!mb-0 flex items-center gap-1.5"><Icon name="clock" size={13} />Обновление через 7ч 42м</Label>
          <Badge tone="gold">{done} готово</Badge>
        </div>
        <div className="space-y-3">
          {quests.map((q) => {
            const complete = q.p >= q.total;
            return (
              <div key={q.id} className={cn("inset p-3", q.claimed && "opacity-50")}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12.5px] font-extrabold">{q.t}</span>
                  {q.claimed
                    ? <span className="text-[10.5px] font-extrabold text-bull flex items-center gap-1"><Icon name="check" size={12} stroke={3.4} />Claimed</span>
                    : complete
                      ? <Btn3D size="xs" variant="gold" onClick={() => claim(q)}><GemPrice n={q.reward} /></Btn3D>
                      : <Btn3D size="xs" variant="neutral" onClick={() => { setQuests((qs) => qs.map((x) => (x.id === q.id ? { ...x, p: Math.min(x.total, x.p + 1) } : x))); sfx.tap(); if (q.p + 1 >= q.total) { setFire(Date.now()); sfx.success(); } }}>+1</Btn3D>}
                </div>
                <Bar value={(q.p / q.total) * 100} tone={complete ? "gold" : "blue"} h={8} />
                <div className="num text-[10px] text-dim mt-1.5">{q.p}/{q.total}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Asset>
  );
}

function Skins() {
  const toast = useToast();
  const [gems, setGems] = useState(6200);
  const [equipped, setEquipped] = useState("default");
  const [owned, setOwned] = useState<string[]>(["default"]);
  const buy = (s: (typeof SKINS)[0]) => {
    if (owned.includes(s.id)) { setEquipped(s.id); sfx.pop(); return; }
    if (gems < s.price) { shake("soft"); sfx.error(); toast({ type: "error", title: "Не хватает кристаллов", msg: `Нужно ещё ${(s.price - gems).toLocaleString()}` }); return; }
    setGems((g) => g - s.price); setOwned([...owned, s.id]); setEquipped(s.id);
    burstConfetti(innerWidth / 2, innerHeight / 2, 30, 0.8); sfx.success(); haptic([15, 20, 30]);
    toast({ type: "success", title: `Скин «${s.t}» куплен`, msg: "И уже надет на Bulli" });
  };
  return (
    <Asset title="Mascot Skins" id="eco.skins" desc="Скины меняют Bulli живым CSS-фильтром. Куплено — сразу надеть.">
      <div className="flex items-center justify-between mb-3">
        <Label className="!mb-0">Wardrobe</Label>
        <span className="raised !rounded-full pl-1.5 pr-3 h-8 flex items-center gap-1.5"><span className="size-5 rounded-full bg-ink-850 grid place-items-center"><Glyph name="gem" size={14} /></span><CountUp value={gems} className="text-[12px] font-extrabold text-cyan" /></span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {SKINS.map((s) => {
          const has = owned.includes(s.id);
          const on = equipped === s.id;
          return (
            <button key={s.id} onClick={() => buy(s)} className={cn("raised p-3 text-center transition-all hover:-translate-y-0.5", on && "ring-2 ring-bull/70")} data-pressed={undefined}>
              <div className="size-20 mx-auto rounded-full bg-[#0A1330] overflow-hidden ring-1 ring-white/10 grid place-items-center relative">
                <img src={MASCOT_IMG.idle} alt={s.t} className="w-full h-full object-contain transition-all duration-500" style={{ filter: s.f }} draggable={false} />
                {on && <span className="absolute bottom-0 size-4 rounded-full bg-bull border-2 border-ink-800 animate-pulse" />}
              </div>
              <div className="text-[12px] font-extrabold mt-2">{s.t}</div>
              <div className="text-[10px] text-dim">{s.d}</div>
              <div className="mt-1.5 h-6">
                {s.price === 0 ? <span className="text-[10.5px] font-extrabold text-bull">FREE</span>
                  : has ? <span className={cn("text-[10.5px] font-extrabold", on ? "text-bull" : "text-blue")}>{on ? "Equipped" : "Tap to wear"}</span>
                    : <span className="inline-flex items-center gap-1 num text-[11.5px] font-extrabold text-cyan"><Glyph name="gem" size={13} />{s.price.toLocaleString()}</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-center">
        <div className="inline-block text-[11px] font-bold text-mute">Текущий вид Bulli:</div>
        <img src={MASCOT_IMG.cheer} alt="equipped skin preview" className="h-28 object-contain mx-auto mt-1 transition-all duration-500 anim-float" style={{ filter: SKINS.find((s) => s.id === equipped)!.f }} draggable={false} />
      </div>
    </Asset>
  );
}

export default function Store() {
  return (
    <Section id="store" index="17" title="Economy & Shop" subtitle="Игровая экономика: кристаллы, бусты, сундуки, IAP, квесты дня, скины маскота" count={3}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Shop />
        <DailyQuests />
        <Skins />
      </div>
    </Section>
  );
}
