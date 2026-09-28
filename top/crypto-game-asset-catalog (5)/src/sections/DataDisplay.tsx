import { useState } from "react";
import { Asset, Avatar, Badge, Bar, Btn3D, Label, Section, Tooltip, useToast } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";

/* ---------- Cards ---------- */
function Cards() {
  const [enrolled, setEnrolled] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(248);
  const [flip, setFlip] = useState(false);
  return (
    <Asset title="Cards" id="dat.card" desc="Карточка курса, соцкарточка, флип-карточка для запоминания терминов." className="lg:col-span-2">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="raised p-4 flex flex-col group hover:-translate-y-1 transition-transform">
          <div className="h-24 rounded-xl mb-3 relative overflow-hidden bg-gradient-to-br from-[#3d7bff] via-[#5a4dff] to-[#8d5cff] grid place-items-center">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
            <span className="group-hover:scale-110 transition-transform"><Glyph name="rocket" size={48} /></span>
            <Badge tone="gold" size="xs" className="absolute top-2 left-2 !bg-black/30">Популярно</Badge>
          </div>
          <div className="font-extrabold text-[14px]">DeFi Masterclass</div>
          <div className="text-[11.5px] text-mute mb-3">12 уроков · 3ч 40м</div>
          <div className="flex justify-between text-[10.5px] font-bold mb-1"><span className="text-dim">Прогресс</span><span className="num">{enrolled ? 8 : 0}%</span></div>
          <Bar value={enrolled ? 8 : 0} tone="blue" h={8} />
          <Btn3D size="sm" variant={enrolled ? "neutral" : "blue"} className="mt-4" onClick={() => setEnrolled(!enrolled)}>{enrolled ? "Continue" : "Enroll"}</Btn3D>
        </div>
        <div className="raised p-4 flex flex-col">
          <div className="flex items-center gap-2.5 mb-3"><Avatar name="Anna K" size={34} status="trading" /><div><div className="text-[12.5px] font-extrabold">Anna K</div><div className="text-[10.5px] text-dim">2 мин назад</div></div><Badge tone="bull" size="xs" className="ml-auto">+34%</Badge></div>
          <div className="text-[12.5px] leading-snug mb-3">Закрыла ETH-лонг по TP. Уровень 3 400 отработал идеально 🎯</div>
          <div className="inset h-16 p-2 mb-3"><svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none"><polyline points="0,25 15,22 30,24 45,15 60,17 75,8 100,4" fill="none" stroke="#1fdb8b" strokeWidth="2" /></svg></div>
          <div className="flex items-center gap-4 mt-auto text-[12px] font-bold text-mute">
            <button onClick={() => { setLiked(!liked); setLikes(likes + (liked ? -1 : 1)); sfx.pop(); }} className={cn("flex items-center gap-1.5 transition", liked && "text-bear")}><Icon name="heart" size={16} className={liked ? "fill-current anim-pop" : ""} /><span className="num">{likes}</span></button>
            <button className="flex items-center gap-1.5 hover:text-txt"><Icon name="send" size={15} />Share</button>
            <button className="ml-auto hover:text-txt"><Icon name="copy" size={15} /></button>
          </div>
        </div>
        <button onClick={() => { setFlip(!flip); sfx.whoosh(); }} className="relative min-h-[240px]" style={{ perspective: 900 }}>
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(.3,1.3,.5,1)]" style={{ transformStyle: "preserve-3d", transform: flip ? "rotateY(180deg)" : "none" }}>
            <div className="absolute inset-0 raised p-4 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: "hidden" }}>
              <Label>Flashcard · 3/20</Label>
              <div className="text-[26px] font-extrabold">Slippage</div>
              <div className="text-[11px] text-dim mt-3 flex items-center gap-1"><Icon name="refresh" size={12} />Тап — перевернуть</div>
            </div>
            <div className="absolute inset-0 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#ab86ff] to-[#6f3cf0] shadow-[0_4px_0_#4a22b0]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="text-[13px] font-bold leading-snug">Разница между ожидаемой ценой сделки и ценой исполнения.</div>
              <div className="flex gap-2 mt-4"><span className="px-3 py-1.5 rounded-lg bg-black/20 text-[11px] font-extrabold">Знаю ✓</span><span className="px-3 py-1.5 rounded-lg bg-black/20 text-[11px] font-extrabold">Повторить</span></div>
            </div>
          </div>
        </button>
      </div>
    </Asset>
  );
}

/* ---------- Stat tiles ---------- */
function Stats() {
  const S = [
    { l: "Win rate", v: "68%", d: "+4.2", up: true, g: "target", c: "text-bull" },
    { l: "Сделок", v: "142", d: "+12", up: true, g: "candles", c: "text-blue" },
    { l: "Max DD", v: "-8.4%", d: "-1.1", up: false, g: "trendDown", c: "text-bear" },
    { l: "Уроков", v: "37", d: "+3", up: true, g: "book", c: "text-violet" },
  ];
  return (
    <Asset title="Stat Tiles" id="dat.stats" desc="KPI с дельтой и hover-подъёмом.">
      <div className="grid grid-cols-2 gap-3">
        {S.map((s, i) => (
          <div key={s.l} className="inset p-3 hover:-translate-y-0.5 transition-transform anim-pop" style={{ animationDelay: `${i * 70}ms` }}>
            <div className="flex items-center justify-between"><Icon name={s.g} size={17} className={s.c} /><span className={cn("text-[10px] font-extrabold num", s.up ? "text-bull" : "text-bear")}>{s.d}</span></div>
            <div className="num text-[22px] font-extrabold mt-2">{s.v}</div>
            <div className="text-[10.5px] text-dim font-bold uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

/* ---------- List items ---------- */
function ListItems() {
  const [open, setOpen] = useState<number | null>(0);
  const [swiped, setSwiped] = useState<number | null>(null);
  const [items, setItems] = useState([
    { t: "Японские свечи", s: "Урок 4 · 8 мин", i: "candles", tag: "В процессе", tone: "blue", body: "Узнайте, как читать фитили, тела и паттерны разворота: молот, поглощение, доджи." },
    { t: "Уровни поддержки", s: "Урок 5 · 12 мин", i: "chart", tag: "Новое", tone: "bull", body: "Как цена «отскакивает» от уровней и почему их пробой — сильный сигнал." },
    { t: "Управление риском", s: "Урок 6 · 10 мин", i: "shield", tag: "Pro", tone: "violet", body: "Правило 1%, соотношение риск/прибыль и расчёт размера позиции." },
  ]);
  const toast = useToast();
  return (
    <Asset title="List Items & Accordion" id="dat.list" desc="Раскрытие с анимацией высоты; кнопка «⋯» имитирует свайп-действия.">
      <div className="space-y-2.5">
        {items.map((it, i) => (
          <div key={it.t} className="relative overflow-hidden rounded-2xl anim-fade">
            <div className="absolute inset-y-0 right-0 flex">
              <button onClick={() => { toast({ type: "info", title: "Добавлено в избранное" }); setSwiped(null); }} className="w-16 bg-gold text-ink-900 grid place-items-center"><Icon name="star" size={18} /></button>
              <button onClick={() => { setItems(items.filter((_, k) => k !== i)); setSwiped(null); sfx.whoosh(); }} className="w-16 bg-bear grid place-items-center"><Icon name="x" size={18} stroke={3} /></button>
            </div>
            <div className="raised !rounded-2xl relative transition-transform duration-300 ease-[cubic-bezier(.3,1.2,.5,1)]" style={{ transform: swiped === i ? "translateX(-128px)" : "none" }}>
              <button onClick={() => { setOpen(open === i ? null : i); sfx.tap(); }} className="w-full flex items-center gap-3 p-3 text-left">
                <span className="size-10 rounded-xl bg-ink-850 grid place-items-center text-blue shadow-inner"><Icon name={it.i} size={19} /></span>
                <span className="flex-1 min-w-0"><span className="block text-[13px] font-extrabold">{it.t}</span><span className="flex items-center gap-2 text-[11px] text-dim">{it.s}<Badge tone={it.tone} size="xs">{it.tag}</Badge></span></span>
                <span onClick={(e) => { e.stopPropagation(); setSwiped(swiped === i ? null : i); sfx.tick(); }} className="size-8 rounded-lg grid place-items-center text-dim hover:bg-white/5 hover:text-txt"><Icon name="moreH" size={18} /></span>
                <Icon name="chevD" size={18} className={cn("text-dim transition-transform duration-300", open === i && "rotate-180")} />
              </button>
              <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
                <div className="overflow-hidden"><div className="px-3 pb-3 pl-16 text-[12px] text-mute leading-relaxed">{it.body}<div className="mt-2"><Btn3D size="xs" variant="blue">Start</Btn3D></div></div></div>
              </div>
            </div>
          </div>
        ))}
        {!items.length && <button onClick={() => location.reload()} className="w-full text-center text-dim text-[12px] py-6">Список пуст</button>}
      </div>
    </Asset>
  );
}

/* ---------- Badges & avatars ---------- */
function BadgesAvatars() {
  const [count, setCount] = useState(3);
  const users = ["Satoshi N", "Vitalik B", "Cathie W", "Mike S", "Anna K", "Leo T", "Dana R"];
  return (
    <Asset title="Badges & Avatars" id="dat.badge" desc="Статусные бейджи, счётчики, аватары со статусом торговли, стек с «+N».">
      <Label>Status badges</Label>
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge tone="bull" dot>Live</Badge><Badge tone="bear">Hot</Badge><Badge tone="violet">Pro</Badge><Badge tone="gold">Beta</Badge><Badge tone="cyan">New</Badge><Badge tone="neutral">Archived</Badge>
      </div>
      <Label>Counters</Label>
      <div className="flex items-center gap-4 mb-4">
        {[["bell", count, "bg-bear"], ["send", 12, "bg-blue"], ["gift", "99+", "bg-gold text-ink-900"]].map(([ic, n, c], i) => (
          <button key={i} onClick={() => i === 0 && setCount(count + 1)} className="relative size-11 raised !rounded-xl grid place-items-center text-mute hover:text-txt">
            <Icon name={ic as string} size={19} />
            <span key={String(n)} className={cn("absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full text-[10px] font-extrabold grid place-items-center border-2 border-ink-800 num anim-pop", c as string)}>{n}</span>
          </button>
        ))}
      </div>
      <Label>Avatars · status</Label>
      <div className="flex items-center gap-3 mb-4">
        <Tooltip text="Онлайн"><Avatar name="Satoshi N" size={44} status="online" /></Tooltip>
        <Tooltip text="Торгует сейчас"><Avatar name="Vitalik B" size={44} status="trading" /></Tooltip>
        <Tooltip text="Отошёл"><Avatar name="Cathie W" size={44} status="away" /></Tooltip>
        <Tooltip text="Офлайн"><Avatar name="Mike S" size={44} status="off" /></Tooltip>
        <div className="relative"><Avatar name="You Me" size={44} ring="ring-[3px] ring-gold ring-offset-2 ring-offset-ink-800" /><span className="absolute -bottom-1 left-1/2 -translate-x-1/2"><Glyph name="crown" size={16} /></span></div>
      </div>
      <Label>Group stack</Label>
      <div className="flex items-center group">
        {users.slice(0, 4).map((u, i) => <div key={u} className="-ml-2.5 first:ml-0 transition-all group-hover:ml-0.5 border-[3px] border-ink-800 rounded-full" style={{ zIndex: 10 - i }}><Avatar name={u} size={34} /></div>)}
        <div className="-ml-2.5 group-hover:ml-0.5 transition-all size-10 rounded-full bg-[#22366f] border-[3px] border-ink-800 grid place-items-center text-[11px] font-extrabold num">+{users.length - 4}</div>
        <span className="ml-3 text-[11.5px] text-mute font-semibold">изучают этот урок</span>
      </div>
    </Asset>
  );
}

/* ---------- Tooltips ---------- */
function Tooltips() {
  return (
    <Asset title="Tooltips & Glossary" id="dat.tooltip" desc="4 направления + inline-глоссарий прямо в тексте урока.">
      <div className="grid grid-cols-2 gap-3 place-items-center py-6">
        <Tooltip text="Сверху" side="top"><Btn3D size="sm" variant="neutral">Top</Btn3D></Tooltip>
        <Tooltip text="Снизу" side="bottom"><Btn3D size="sm" variant="neutral">Bottom</Btn3D></Tooltip>
        <Tooltip text="Слева" side="left"><Btn3D size="sm" variant="neutral">Left</Btn3D></Tooltip>
        <Tooltip text="Справа" side="right"><Btn3D size="sm" variant="neutral">Right</Btn3D></Tooltip>
      </div>
      <div className="inset p-4 text-[13px] leading-relaxed">
        Когда цена пробивает{" "}
        <Tooltip text={<span className="block w-52 whitespace-normal font-semibold">Уровень, где спрос останавливает падение цены.</span>}><span className="text-blue font-bold border-b-2 border-dashed border-blue/50 cursor-help">поддержку</span></Tooltip>
        {" "}на высоком{" "}
        <Tooltip text={<span className="block w-44 whitespace-normal font-semibold">Количество актива, проданного за период.</span>}><span className="text-violet font-bold border-b-2 border-dashed border-violet/50 cursor-help">объёме</span></Tooltip>
        , это часто сигнал к продолжению тренда.
      </div>
    </Asset>
  );
}

/* ---------- Sortable table ---------- */
const ROWS = [
  { a: "BTC", p: 67420, ch: 2.41, v: 28.4, mc: 1320 }, { a: "ETH", p: 3512, ch: -1.12, v: 14.1, mc: 422 },
  { a: "SOL", p: 172.4, ch: 6.83, v: 3.2, mc: 79 }, { a: "BNB", p: 598, ch: 0.54, v: 1.8, mc: 88 },
  { a: "XRP", p: 0.52, ch: -3.2, v: 1.1, mc: 29 }, { a: "DOGE", p: 0.161, ch: 11.4, v: 2.4, mc: 23 },
];
type K = "a" | "p" | "ch" | "v" | "mc";
function Table() {
  const [k, setK] = useState<K>("mc");
  const [dir, setDir] = useState<1 | -1>(-1);
  const [filter, setFilter] = useState<"all" | "gain" | "loss">("all");
  const [sel, setSel] = useState<string | null>(null);
  const sort = (nk: K) => { if (nk === k) setDir(dir === 1 ? -1 : 1); else { setK(nk); setDir(-1); } sfx.tick(); };
  const rows = ROWS.filter((r) => filter === "all" || (filter === "gain" ? r.ch > 0 : r.ch < 0)).sort((x, y) => (x[k] > y[k] ? 1 : -1) * dir);
  const H = ({ id, l, right }: { id: K; l: string; right?: boolean }) => (
    <button onClick={() => sort(id)} className={cn("flex items-center gap-1 label-caps !mb-0 hover:text-txt transition", right && "justify-end", k === id && "!text-blue")}>
      {l}<span className="flex flex-col -space-y-1.5"><Icon name="chevU" size={10} stroke={3} className={k === id && dir === 1 ? "text-blue" : "opacity-40"} /><Icon name="chevD" size={10} stroke={3} className={k === id && dir === -1 ? "text-blue" : "opacity-40"} /></span>
    </button>
  );
  return (
    <Asset title="Sortable Market Table" id="dat.table" desc="Сортировка по любой колонке, фильтр роста/падения, выделение строки." className="lg:col-span-2">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="filter" size={15} className="text-dim" />
        {(["all", "gain", "loss"] as const).map((f) => <button key={f} onClick={() => { setFilter(f); sfx.tick(); }} className={cn("px-3 h-8 rounded-lg text-[11.5px] font-extrabold transition", filter === f ? (f === "gain" ? "bg-bull/20 text-bull" : f === "loss" ? "bg-bear/20 text-bear" : "bg-blue/20 text-[#8fb3ff]") : "text-mute hover:bg-white/5")}>{{ all: "Все", gain: "Рост", loss: "Падение" }[f]}</button>)}
      </div>
      <div className="inset overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-3 border-b border-white/5 sticky top-0">
            <H id="a" l="Asset" /><H id="p" l="Price" right /><H id="ch" l="24h" right /><H id="v" l="Vol $B" right /><H id="mc" l="Mcap $B" right />
          </div>
          {rows.map((r, i) => (
            <button key={r.a} onClick={() => setSel(sel === r.a ? null : r.a)} className={cn("w-full grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-2 px-4 py-2.5 items-center text-[12.5px] transition-all anim-fade border-l-[3px]", sel === r.a ? "bg-blue/10 border-blue" : "border-transparent hover:bg-white/[.03]")} style={{ animationDelay: `${i * 40}ms` }}>
              <span className="flex items-center gap-2 font-extrabold"><span className="text-dim num text-[10px] w-3">{i + 1}</span>{r.a}</span>
              <span className="num text-right font-semibold">${r.p.toLocaleString()}</span>
              <span className={cn("num text-right font-extrabold", r.ch > 0 ? "text-bull" : "text-bear")}>{r.ch > 0 ? "+" : ""}{r.ch}%</span>
              <span className="num text-right text-mute">{r.v}</span>
              <span className="num text-right text-mute">{r.mc}</span>
            </button>
          ))}
        </div>
      </div>
    </Asset>
  );
}

export default function DataDisplay() {
  return (
    <Section id="data" index="07" title="Data Display" subtitle="Карточки, списки, бейджи, аватары, тултипы и таблицы" count={7}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Cards />
        <Stats />
        <ListItems />
        <BadgesAvatars />
        <Tooltips />
        <Table />
      </div>
    </Section>
  );
}
