import { useMemo, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { burstConfetti, burstSparks } from "../utils/fx";

type GName = "coin" | "gem" | "star" | "bolt" | "crown" | "rocket" | "shield" | "flame" | "heart" | "chest";
type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
const RCOL: Record<Rarity, { c1: string; c2: string; label: string; w: number }> = {
  common: { c1: "#8e9cc8", c2: "#3a4668", label: "Common", w: 50 },
  rare: { c1: "#3d7bff", c2: "#1a2a5c", label: "Rare", w: 28 },
  epic: { c1: "#8d5cff", c2: "#35198f", label: "Epic", w: 15 },
  legendary: { c1: "#ffc53d", c2: "#6e4500", label: "Legendary", w: 6 },
  mythic: { c1: "#ff4d9a", c2: "#5c1030", label: "Mythic", w: 1 },
};
const CARDS: { t: string; g: GName; atk: number; def: number; r: Rarity; d: string }[] = [
  { t: "Satoshi Prime", g: "coin", atk: 99, def: 88, r: "mythic", d: "Первая монета. Владелец рынка." },
  { t: "Diamond Whale", g: "gem", atk: 84, def: 92, r: "legendary", d: "Держит сквозь любые дампы." },
  { t: "Bull Charger", g: "rocket", atk: 91, def: 64, r: "legendary", d: "+30% к прибыли на пампе." },
  { t: "FOMO Imp", g: "flame", atk: 72, def: 31, r: "epic", d: "Покупает хаи. Всегда." },
  { t: "Stop Knight", g: "shield", atk: 45, def: 95, r: "epic", d: "Режет убытки без жалости." },
  { t: "Volt Scout", g: "bolt", atk: 68, def: 52, r: "rare", d: "Первый видит импульс." },
  { t: "Lucky Star", g: "star", atk: 55, def: 58, r: "rare", d: "Шанс крита +12%." },
  { t: "Paper Hands", g: "heart", atk: 22, def: 35, r: "common", d: "Продаёт на первой красной свече." },
  { t: "Crown Holder", g: "crown", atk: 77, def: 80, r: "epic", d: "Топ-1 лиги три сезона." },
  { t: "Vault Keeper", g: "chest", atk: 40, def: 88, r: "rare", d: "Хранит ключи и секреты." },
];

function CardFace({ c, small }: { c: (typeof CARDS)[0]; small?: boolean }) {
  const r = RCOL[c.r];
  return (
    <div className={cn("relative rounded-2xl overflow-hidden border-2", small ? "p-2.5" : "p-3.5")}
      style={{ background: `linear-gradient(165deg, ${r.c1}55, #0f1b3f 70%)`, borderColor: `${r.c1}88`, boxShadow: `0 5px 0 #081028, 0 0 24px ${r.c1}44` }}>
      {c.r === "legendary" || c.r === "mythic" ? <div className="shine absolute inset-0 pointer-events-none" /> : null}
      <div className="flex items-center justify-between">
        <span className="text-[8.5px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md" style={{ background: `${r.c1}33`, color: r.c1 }}>{r.label}</span>
        <span className="num text-[9px] font-extrabold text-dim">ATK {c.atk}</span>
      </div>
      <div className={cn("grid place-items-center", small ? "my-1.5" : "my-3")}>
        <span className="relative">
          <span className="absolute -inset-4 rounded-full blur-xl" style={{ background: `${r.c1}55` }} />
          <Glyph name={c.g} size={small ? 44 : 64} />
        </span>
      </div>
      <div className={cn("font-extrabold leading-tight", small ? "text-[12px]" : "text-[15px]")}>{c.t}</div>
      {!small && <div className="text-[10.5px] text-mute font-semibold leading-snug mt-0.5 min-h-[28px]">{c.d}</div>}
      <div className="flex gap-1.5 mt-2">
        <div className="flex-1"><div className="flex justify-between text-[8.5px] font-extrabold"><span className="text-bear">ATK</span><span className="num">{c.atk}</span></div><div className="h-1.5 rounded-full bg-black/30 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-bear to-[#ff8a3d]" style={{ width: `${c.atk}%` }} /></div></div>
        <div className="flex-1"><div className="flex justify-between text-[8.5px] font-extrabold"><span className="text-cyan">DEF</span><span className="num">{c.def}</span></div><div className="h-1.5 rounded-full bg-black/30 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-blue" style={{ width: `${c.def}%` }} /></div></div>
      </div>
    </div>
  );
}

/* ============ 1. PACK OPENING ============ */
function PackOpening() {
  const [pack, setPack] = useState<(typeof CARDS)[0][] | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [opening, setOpening] = useState(false);
  const roll = (): (typeof CARDS)[0] => {
    let x = Math.random() * 100;
    let rr: Rarity = "common";
    (Object.keys(RCOL) as Rarity[]).forEach((k) => { if (x < RCOL[k].w) { rr = k; x = -1; } else x -= RCOL[k].w; });
    const pool = CARDS.filter((c) => c.r === rr);
    return pool.length ? pool[(Math.random() * pool.length) | 0] : CARDS[7];
  };
  const open = () => {
    if (opening) return;
    setOpening(true); setRevealed(0); sfx.whoosh();
    const p = [roll(), roll(), roll()];
    // pity: хотя бы rare
    if (p.every((c) => c.r === "common")) p[2] = CARDS.find((c) => c.r === "rare") ?? p[2];
    setPack(p);
    p.forEach((c, i) => setTimeout(() => {
      setRevealed(i + 1);
      if (c.r === "legendary" || c.r === "mythic") { sfx.levelUp(); } else sfx.pop();
    }, 600 + i * 550));
    setTimeout(() => {
      setOpening(false);
      const best = p.find((c) => c.r === "mythic") ?? p.find((c) => c.r === "legendary");
      if (best) burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 60, 1.1);
    }, 600 + 3 * 550 + 200);
  };
  return (
    <Asset title="Pack Opening" id="crd.pack" desc="Пак из 3 карт: pity-система (минимум rare), поочерёдный флип, салют за legendary+." className="lg:col-span-2">
      {!pack ? (
        <button onClick={open} className="w-full h-[240px] rounded-2xl border-2 border-dashed border-gold/40 grid place-items-center group hover:border-gold transition-colors bg-gradient-to-b from-[#1a1408] to-[#0a1330]">
          <span className="text-center">
            <span className="inline-block anim-float"><Glyph name="chest" size={72} /></span>
            <span className="block font-extrabold text-[17px] mt-2 group-hover:text-gold transition-colors">Открыть пак · 100 💎</span>
            <span className="block text-[11px] text-dim font-bold mt-1">3 карты · шанс mythic 1%</span>
          </span>
        </button>
      ) : (
        <div>
          <div className="grid grid-cols-3 gap-3" style={{ perspective: 900 }}>
            {pack.map((c, i) => (
              <div key={i} className="relative transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: revealed > i ? "rotateY(0)" : "rotateY(180deg)" }}>
                <div style={{ backfaceVisibility: i < revealed ? "visible" : "hidden" }}><CardFace c={c} small /></div>
                <div className="absolute inset-0 rounded-2xl grid place-items-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", opacity: revealed > i ? 0 : 1, background: "repeating-linear-gradient(45deg,#1c3068 0 10px,#16275a 10px 20px)", boxShadow: "0 5px 0 #081028, inset 0 0 0 3px rgba(255,197,61,.4)" }}>
                  <span className="size-11 rounded-full bg-ink-850 grid place-items-center text-gold font-extrabold text-[18px]">?</span>
                </div>
                {revealed > i && (c.r === "legendary" || c.r === "mythic") && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-extrabold bg-gold text-ink-900 rounded-full px-2 py-0.5 anim-pop whitespace-nowrap">★ {RCOL[c.r].label} ★</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Btn3D size="sm" variant="gold" full loading={opening} onClick={() => { setPack(null); setTimeout(open, 80); }}>{opening ? "Revealing…" : "Open another"}</Btn3D>
            <Btn3D size="sm" variant="neutral" onClick={() => { setPack(null); setRevealed(0); }}>Close</Btn3D>
          </div>
        </div>
      )}
      <div className="flex gap-2 mt-3 justify-center">
        {(Object.keys(RCOL) as Rarity[]).map((r) => <span key={r} className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md" style={{ background: `${RCOL[r].c1}22`, color: RCOL[r].c1 }}>{RCOL[r].label} {RCOL[r].w}%</span>)}
      </div>
    </Asset>
  );
}

/* ============ 2. COLLECTION GRID ============ */
function Collection() {
  const [owned] = useState<Record<string, number>>({ "Paper Hands": 3, "Volt Scout": 1, "Lucky Star": 2, "Vault Keeper": 1 });
  const [filter, setFilter] = useState<Rarity | "all">("all");
  const [sort, setSort] = useState<"rarity" | "atk" | "name">("rarity");
  const order: Record<Rarity, number> = { mythic: 0, legendary: 1, epic: 2, rare: 3, common: 4 };
  const list = useMemo(() => CARDS
    .filter((c) => filter === "all" || c.r === filter)
    .sort((a, b) => sort === "atk" ? b.atk - a.atk : sort === "name" ? a.t.localeCompare(b.t) : order[a.r] - order[b.r]), [filter, sort]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = Object.values(owned).reduce((a, b) => a + b, 0);
  return (
    <Asset title="Collection" id="crd.collection" desc="Коллекция с фильтром редкости и сортировкой. Серые силуэты — недостающие карты.">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge tone="gold"><span className="num">{Object.keys(owned).length}/{CARDS.length}</span> карт</Badge>
        <div className="flex gap-1 ml-auto">
          {(["rarity", "atk", "name"] as const).map((s) => <button key={s} onClick={() => { setSort(s); sfx.tick(); }} className={cn("h-7 px-2 rounded-lg text-[10px] font-extrabold uppercase", sort === s ? "bg-blue text-white" : "text-mute")}>{s === "atk" ? "ATK" : s}</button>)}
        </div>
      </div>
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {(["all", "common", "rare", "epic", "legendary", "mythic"] as const).map((r) => (
          <button key={r} onClick={() => { setFilter(r); sfx.tick(); }} className={cn("h-7 px-2.5 rounded-lg text-[10.5px] font-extrabold capitalize border", filter === r ? "border-blue bg-blue/15" : "border-transparent text-mute")}
            style={r !== "all" ? { color: filter === r ? RCOL[r].c1 : undefined } : undefined}>{r}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-h-[330px] overflow-y-auto pr-1">
        {list.map((c) => {
          const has = owned[c.t] ?? 0;
          return (
            <div key={c.t} className={cn("relative", !has && "grayscale opacity-50")}>
              <CardFace c={c} small />
              {has > 0 && <span className="absolute top-1.5 right-1.5 min-w-6 h-6 px-1 rounded-full bg-blue text-[10.5px] font-extrabold grid place-items-center border-2 border-ink-800 num">×{has}</span>}
              {!has && <span className="absolute inset-0 grid place-items-center"><Icon name="lock" size={22} className="text-dim" /></span>}
            </div>
          );
        })}
      </div>
      <div className="text-[11px] text-dim font-bold mt-2 text-center">всего копий: <span className="num">{total}</span></div>
    </Asset>
  );
}

/* ============ 3. CARD BATTLE ============ */
function CardBattle() {
  const [mine, setMine] = useState(CARDS[1]);
  const [foe] = useState(CARDS[3]);
  const [log, setLog] = useState<string[]>(["Выбери свою карту и атакуй!"]);
  const [hp, setHp] = useState<[number, number]>([100, 100]);
  const [anim, setAnim] = useState<"mine" | "foe" | null>(null);
  const [round, setRound] = useState(1);
  const attack = () => {
    if (hp[0] <= 0 || hp[1] <= 0 || anim) return;
    setAnim("mine"); sfx.whoosh();
    setTimeout(() => {
      const crit = Math.random() < 0.18;
      const dmg = Math.max(4, Math.round((mine.atk * (0.7 + Math.random() * 0.5) - foe.def * 0.25) / 4) * (crit ? 2 : 1));
      const nhp = Math.max(0, hp[1] - dmg);
      setHp([hp[0], nhp]); setAnim(null);
      setLog((l) => [`Раунд ${round}: ${mine.t} → ${dmg}${crit ? " CRIT!" : ""}`, ...l].slice(0, 4));
      if (nhp <= 0) { sfx.levelUp(); setLog((l) => ["🏆 Победа! +120 XP", ...l]); return; }
      setTimeout(() => {
        setAnim("foe");
        setTimeout(() => {
          const dmg2 = Math.max(3, Math.round((foe.atk * (0.7 + Math.random() * 0.5) - mine.def * 0.25) / 4));
          setHp(([a]) => [Math.max(0, a - dmg2), nhp]); setAnim(null);
          setLog((l) => [`${foe.t} отвечает: ${dmg2}`, ...l].slice(0, 4));
          setRound((r) => r + 1);
          if (hp[0] - dmg2 <= 0) { sfx.error(); setLog((l) => ["💀 Поражение…", ...l]); }
        }, 380);
      }, 420);
    }, 380);
  };
  const reset = () => { setHp([100, 100]); setRound(1); setLog(["Выбери свою карту и атакуй!"]); sfx.tap(); };
  const over = hp[0] <= 0 || hp[1] <= 0;
  return (
    <Asset title="Card Battle" id="crd.battle" desc="Пошаговый бой: урон от ATK/DEF с критами 18%, анимации атак, лог раундов.">
      <div className="grid grid-cols-2 gap-3">
        {[{ c: mine, h: hp[0], me: true }, { c: foe, h: hp[1], me: false }].map((p, i) => (
          <div key={i} className={cn("transition-transform duration-300", anim === (p.me ? "mine" : "foe") && (p.me ? "translate-x-6 rotate-3" : "-translate-x-6 -rotate-3"))}>
            <CardFace c={p.c} small />
            <div className="mt-1.5 h-3 rounded-full bg-[#0a1330] overflow-hidden border border-white/5">
              <div className={cn("h-full rounded-full transition-all duration-500", p.h > 50 ? "bg-gradient-to-r from-bull to-[#5af5b4]" : p.h > 25 ? "bg-gradient-to-r from-gold to-[#ff8a3d]" : "bg-gradient-to-r from-bear to-[#ff7c93]")} style={{ width: `${p.h}%` }} />
            </div>
            <div className="num text-[10.5px] font-extrabold text-center mt-0.5">{p.h} HP</div>
          </div>
        ))}
      </div>
      <div className="inset !rounded-xl p-2.5 mt-3 h-[86px] overflow-hidden text-[11px] font-semibold space-y-1">
        {log.map((l, i) => <div key={`${l}-${i}`} className={cn(i === 0 ? "text-txt anim-fade" : "text-dim")}>{l}</div>)}
      </div>
      <div className="flex gap-2 mt-3">
        <Btn3D size="sm" variant="bear" full disabled={over || !!anim} onClick={attack} icon={<Icon name="bolt" size={15} />}>{over ? "Battle over" : `Attack · R${round}`}</Btn3D>
        <Btn3D size="sm" variant="neutral" onClick={reset}><Icon name="refresh" size={15} /></Btn3D>
      </div>
      <div className="flex gap-1.5 mt-2.5 flex-wrap">
        {CARDS.slice(0, 6).map((c) => <button key={c.t} onClick={() => { if (!anim && !over) { setMine(c); sfx.tick(); } }} className={cn("size-9 rounded-lg grid place-items-center border-2 transition", mine.t === c.t ? "border-gold scale-110" : "border-transparent bg-white/5")}><Glyph name={c.g} size={22} /></button>)}
      </div>
    </Asset>
  );
}

/* ============ 4. DAILY CARD SHOP ============ */
function DailyShop() {
  const [gems, setGems] = useState(1280);
  const [stock, setStock] = useState(() => [CARDS[5], CARDS[2], CARDS[8]].map((c, i) => ({ c, price: [150, 600, 450][i], sold: false })));
  const [time] = useState("07:42:18");
  const buy = (i: number, e: React.MouseEvent) => {
    const it = stock[i];
    if (it.sold || gems < it.price) { sfx.error(); return; }
    setGems((g) => g - it.price);
    setStock((s) => s.map((x, k) => (k === i ? { ...x, sold: true } : x)));
    const r = (e.target as HTMLElement).getBoundingClientRect();
    burstSparks(r.left + 40, r.top, 16, "#ffc53d"); sfx.coin();
  };
  return (
    <Asset title="Daily Card Shop" id="crd.shop" desc="Магазин дня: 3 карты с ценами, баланс списывается, проданные запечатываются.">
      <div className="flex items-center justify-between mb-3">
        <span className="raised !rounded-full pl-1.5 pr-3 h-9 flex items-center gap-1.5"><Glyph name="gem" size={20} /><span className="num text-[13px] font-extrabold text-cyan">{gems.toLocaleString()}</span></span>
        <span className="text-[11px] font-bold text-dim num">обновление через {time}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {stock.map((it, i) => (
          <div key={i} className="relative">
            <div className={cn(it.sold && "grayscale opacity-60")}><CardFace c={it.c} small /></div>
            {it.sold ? <span className="absolute inset-0 grid place-items-center"><span className="border-[3px] border-bull text-bull rounded-lg px-2 text-[11px] font-extrabold -rotate-12 bg-ink-900/70 anim-pop">SOLD</span></span>
              : <Btn3D size="xs" variant={gems >= it.price ? "cyan" : "neutral"} full className="mt-2 num" disabled={gems < it.price} onClick={(e) => buy(i, e)}>💎 {it.price}</Btn3D>}
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* ============ 5. UPGRADE FUSION ============ */
function Fusion() {
  const [a, setA] = useState(CARDS[7]);
  const [b, setB] = useState(CARDS[7]);
  const [prog, setProg] = useState(0);
  const [fusing, setFusing] = useState(false);
  const [result, setResult] = useState<(typeof CARDS)[0] | null>(null);
  const fuse = () => {
    if (fusing) return;
    setFusing(true); setResult(null); setProg(0); sfx.whoosh();
    let p = 0;
    const h = setInterval(() => {
      p += 4 + Math.random() * 6; setProg(Math.min(100, p));
      if (Math.random() > 0.6) sfx.tick();
      if (p >= 100) {
        clearInterval(h); setFusing(false);
        const pool = CARDS.filter((c) => c.r === "epic" || c.r === "legendary");
        setResult(pool[(Math.random() * pool.length) | 0]);
        sfx.levelUp();
        burstConfetti(window.innerWidth / 2, window.innerHeight / 2, 50, 1);
      }
    }, 90);
  };
  const pick = (setter: (c: (typeof CARDS)[0]) => void, cur: (typeof CARDS)[0]) => (
    <div className="flex gap-1 flex-wrap justify-center mt-1.5">
      {CARDS.filter((c) => c.r === "common" || c.r === "rare").slice(0, 4).map((c) => (
        <button key={c.t} onClick={() => { setter(c); sfx.tick(); }} className={cn("size-8 rounded-lg grid place-items-center border-2", cur.t === c.t ? "border-violet scale-110" : "border-transparent bg-white/5")}><Glyph name={c.g} size={20} /></button>
      ))}
    </div>
  );
  return (
    <Asset title="Card Fusion" id="crd.fusion" desc="Слияние двух слабых карт в epic/legendary: прогрев с тряской, вспышка, результат.">
      <div className="flex items-center justify-center gap-2">
        <div className="w-[110px]"><CardFace c={a} small />{pick(setA, a)}</div>
        <span className={cn("text-[26px] font-extrabold text-violet", fusing && "anim-wiggle")}>+</span>
        <div className="w-[110px]"><CardFace c={b} small />{pick(setB, b)}</div>
      </div>
      <div className="my-3 h-3 rounded-full bg-[#0a1330] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet to-[#ff4d9a] transition-all duration-100" style={{ width: `${prog}%`, boxShadow: fusing ? "0 0 16px #8d5cff" : "none" }} />
      </div>
      {result ? (
        <div className="anim-scale"><CardFace c={result} small />
          <div className="text-center text-[12px] font-extrabold text-gold mt-1.5 anim-pop">★ {result.t} ★</div>
          <Btn3D size="xs" variant="neutral" full className="mt-2" onClick={() => { setResult(null); setProg(0); }}>Fuse again</Btn3D>
        </div>
      ) : <Btn3D size="sm" variant="violet" full loading={fusing} onClick={fuse}>{fusing ? `Fusing ${Math.round(prog)}%` : "Fuse · 200 💎"}</Btn3D>}
    </Asset>
  );
}

export default function CardLab() {
  return (
    <Section id="cards" index="34" title="Card Lab" subtitle="5 карточных механик: открытие паков, коллекция, пошаговый бой, дейли-шоп, слияние" count={5}>
      <div className="grid lg:grid-cols-3 gap-6">
        <PackOpening />
        <Collection />
        <CardBattle />
        <DailyShop />
        <Fusion />
      </div>
    </Section>
  );
}
