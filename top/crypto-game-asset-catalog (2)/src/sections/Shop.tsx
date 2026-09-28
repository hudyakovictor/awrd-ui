import { useEffect, useRef, useState } from "react";
import { Check, Crown, Infinity as Inf, ShieldCheck, Sparkles, Zap, X, Snowflake, Clock, Gift } from "lucide-react";
import { Asset, Section, Btn, Chip, GhostBtn } from "../kit/ui";
import { GemIcon, CoinIcon, HeartIcon, BoltIcon, ChestIcon, ShieldIcon, FlameIcon, TargetIcon, StarIcon } from "../kit/GameIcons";
import { Confetti } from "./Rewards";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

function useWallet(start = 850) {
  const [gems, setGems] = useState(start);
  const [shake, setShake] = useState(0);
  const spend = (n: number) => {
    if (gems < n) { setShake((s) => s + 1); sfx.error(); return false; }
    setGems((g) => g - n); sfx.coin(); return true;
  };
  return { gems, setGems, spend, shake };
}

function Wallet({ gems, shake }: { gems: number; shake: number }) {
  return (
    <div key={shake} className={cn("flex items-center gap-1.5 rounded-xl bg-ink-900/70 px-2.5 py-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,.4)]", shake && "anim-shake")}>
      <GemIcon size={20} />
      <span key={gems} className="num anim-pop text-sm font-extrabold text-cyan">{gems}</span>
    </div>
  );
}

const items = [
  { id: "freeze", n: "Streak Freeze", d: "Сохранит серию на 1 день", p: 200, I: FlameIcon, max: 2 },
  { id: "heart", n: "Refill Hearts", d: "Все 5 жизней сразу", p: 350, I: HeartIcon, max: 1 },
  { id: "shield", n: "Loss Shield", d: "Отмена 1 убыточной сделки", p: 450, I: ShieldIcon, max: 3 },
  { id: "xp", n: "Double XP · 15m", d: "x2 опыта в уроках", p: 300, I: BoltIcon, max: 1 },
];
function PowerUpShop() {
  const w = useWallet(850);
  const [own, setOwn] = useState<Record<string, number>>({ freeze: 1 });
  const [bought, setBought] = useState<string | null>(null);
  const buy = (id: string, p: number, max: number) => {
    if ((own[id] ?? 0) >= max) { sfx.error(); return; }
    if (!w.spend(p)) return;
    setOwn({ ...own, [id]: (own[id] ?? 0) + 1 });
    setBought(id); setTimeout(() => setBought(null), 700);
  };
  return (
    <Asset code="H-001" title="Power-up Shop" desc="Магазин усилителей: лимиты владения, списание кристаллов, отказ при нехватке с тряской кошелька." hint="Купи, пока хватает" specs={["wallet", "limits", "deny shake"]}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-display text-sm font-extrabold">Shop</span>
        <Wallet gems={w.gems} shake={w.shake} />
      </div>
      <div className="space-y-2.5">
        {items.map(({ id, n, d, p, I, max }) => {
          const o = own[id] ?? 0, full = o >= max, poor = w.gems < p;
          return (
            <div key={id} className={cn("relative flex items-center gap-3 rounded-2xl bg-ink-800 p-3 shadow-[0_4px_0_#08112a] transition", bought === id && "ring-2 ring-bull")}>
              <div className="relative">
                <I size={40} className={bought === id ? "anim-pop" : ""} />
                {o > 0 && <span className="num absolute -right-1 -bottom-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-ink-800 bg-sky px-1 text-[9px] font-extrabold">{o}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-extrabold">{n}</div>
                <div className="text-[11px] text-mist">{d}</div>
              </div>
              <button onClick={() => buy(id, p, max)} className={cn("btn3d !h-10 !min-w-[82px] !rounded-xl !px-2 !text-[11px]", full && "opacity-60")} style={{ ["--c" as string]: full ? "#243a68" : poor ? "#3a5494" : "var(--color-cyan)", ["--cd" as string]: full ? "#172749" : poor ? "#1d3160" : "var(--color-cyan-d)", ["--depth" as string]: "4px" }}>
                {full ? <><Check size={14} /> Max</> : <><GemIcon size={16} /> {p}</>}
              </button>
              {bought === id && <span className="num pointer-events-none absolute right-6 top-0 text-sm font-black text-bear" style={{ animation: "rise .7s ease-out forwards" }}>−{p}</span>}
            </div>
          );
        })}
      </div>
      <button onClick={() => { w.setGems((g) => g + 500); sfx.coin(); }} className="mt-3 w-full text-center text-[11px] font-bold text-sky hover:underline">+500 gems (demo)</button>
    </Asset>
  );
}

const packs = [
  { g: 500, p: "$4.99", tag: null, bonus: 0 },
  { g: 1200, p: "$9.99", tag: "Popular", bonus: 20 },
  { g: 3000, p: "$19.99", tag: "Best value", bonus: 50 },
];
function GemPacks() {
  const [sel, setSel] = useState(1);
  const [state, setState] = useState<"idle" | "pay" | "done">("idle");
  const buy = () => { setState("pay"); setTimeout(() => { setState("done"); sfx.levelUp(); }, 1400); };
  return (
    <Asset code="H-002" title="Gem Packs (IAP)" desc="Паки кристаллов с якорем «Best value», бонусом, стеками кристаллов и процессом оплаты." hint="Выбери пак и купи" specs={["anchor", "bonus %", "pay flow"]}>
      <div className="relative">
        {state === "done" && <Confetti />}
        <div className="grid grid-cols-3 gap-2.5">
          {packs.map((pk, i) => (
            <button key={pk.g} onClick={() => { setSel(i); setState("idle"); sfx.tick(); }} className={cn("relative flex flex-col items-center rounded-2xl border-2 px-1 pb-3 pt-5 transition-all", sel === i ? "-translate-y-1 border-cyan bg-cyan/10 shadow-[0_6px_0_#1395b8]" : "border-ink-500 bg-ink-800 shadow-[0_4px_0_#0f1c3a]")}>
              {pk.tag && <span className={cn("absolute -top-2.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase", i === 2 ? "bg-gold text-ink-900" : "bg-violet")}>{pk.tag}</span>}
              <div className="relative h-14 w-16">
                {[...Array(i + 1)].map((_, k) => (
                  <GemIcon key={k} size={34 - k * 2} className="absolute" style={{ left: 14 + (k - i / 2) * 12, top: k * 4, animation: sel === i ? `float 2s ${k * 0.2}s ease-in-out infinite` : undefined }} />
                ))}
              </div>
              <div className="num mt-1 text-base font-extrabold text-cyan">{pk.g.toLocaleString()}</div>
              {pk.bonus > 0 && <div className="text-[9px] font-extrabold text-bull">+{pk.bonus}% bonus</div>}
              <div className="num mt-1 text-[12px] font-bold">{pk.p}</div>
            </button>
          ))}
        </div>
      </div>
      <Btn tone={state === "done" ? "bull" : "cyan"} block className="mt-5" onClick={buy} disabled={state === "pay"} silent>
        {state === "pay" ? <><span className="block h-4 w-4 rounded-full border-2 border-white/40 border-t-white anim-spin" /> Processing</> : state === "done" ? <><Check size={16} /> +{packs[sel].g} gems added</> : `Buy for ${packs[sel].p}`}
      </Btn>
      <p className="mt-2 text-center text-[10px] text-mist">Симулированная покупка · без реальной оплаты</p>
    </Asset>
  );
}

function Paywall() {
  const [plan, setPlan] = useState<"m" | "y">("y");
  const [open, setOpen] = useState(false);
  const perks = [
    { I: Inf, t: "Безлимитные жизни" },
    { I: ShieldCheck, t: "Разбор каждой сделки от AI" },
    { I: Zap, t: "Продвинутые симуляции" },
    { I: Sparkles, t: "Без рекламы" },
  ];
  return (
    <Asset code="H-003" title="Pro Paywall" desc="Экран подписки: сияющий бейдж, перки с поэтапным появлением, переключатель плана, trial." hint="Открой paywall" specs={["stagger", "plan toggle", "trial CTA"]}>
      <div className="relative h-[430px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_0%,#3a2a8f,#0d1730_65%)]">
        {!open ? (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <Crown size={56} className="mx-auto text-gold anim-float drop-shadow-[0_0_20px_#ffc53d]" />
              <div className="font-display mt-3 text-lg font-extrabold">Try CandleQuest Pro</div>
              <Btn tone="gold" className="mt-4 !text-[#3b2600]" onClick={() => setOpen(true)}>Open paywall</Btn>
            </div>
          </div>
        ) : (
          <div className="anim-slide-up flex h-full flex-col p-5">
            <button onClick={() => { setOpen(false); sfx.soft(); }} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-mist hover:text-white"><X size={16} /></button>
            <div className="sheen mx-auto rounded-2xl bg-gradient-to-b from-gold to-gold-d px-4 py-1.5 font-display text-sm font-black text-[#3b2600] shadow-[0_4px_0_#8a5c08]">PRO</div>
            <div className="font-display mt-3 text-center text-lg font-extrabold leading-tight">Trade smarter,<br />learn 3× faster</div>
            <div className="mt-4 space-y-2">
              {perks.map(({ I, t }, i) => (
                <div key={t} className="anim-slide-right flex items-center gap-2.5 text-[13px] font-bold" style={{ animationDelay: `${150 + i * 90}ms` }}>
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-gold/20 text-gold"><I size={15} /></span>{t}
                </div>
              ))}
            </div>
            <div className="mt-auto grid grid-cols-2 gap-2">
              {([["m", "Monthly", "$9.99", ""], ["y", "Yearly", "$59.99", "−50%"]] as const).map(([k, l, p, s]) => (
                <button key={k} onClick={() => { setPlan(k); sfx.tick(); }} className={cn("relative rounded-2xl border-2 p-2.5 text-left transition", plan === k ? "border-gold bg-gold/10" : "border-ink-500 bg-ink-800/80")}>
                  {s && <span className="absolute -top-2 right-2 rounded-full bg-bull px-1.5 text-[9px] font-extrabold">{s}</span>}
                  <div className="text-[10px] font-extrabold uppercase text-mist">{l}</div>
                  <div className="num text-sm font-extrabold">{p}</div>
                </button>
              ))}
            </div>
            <Btn tone="gold" block className="mt-3 !text-[#3b2600] sheen" onClick={() => sfx.levelUp()} silent>Start 7-day free trial</Btn>
          </div>
        )}
      </div>
    </Asset>
  );
}

const wheel = [
  { l: "50", I: GemIcon, c: "#2bd9ff" },
  { l: "x2 XP", I: BoltIcon, c: "#ffc53d" },
  { l: "100", I: CoinIcon, c: "#ff8a3d" },
  { l: "Heart", I: HeartIcon, c: "#ff4f6d" },
  { l: "200", I: GemIcon, c: "#8b5cff" },
  { l: "Chest", I: ChestIcon, c: "#22d39a" },
  { l: "Shield", I: ShieldIcon, c: "#3b82ff" },
  { l: "Star", I: StarIcon, c: "#ffc53d" },
];
function SpinWheel() {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [won, setWon] = useState<number | null>(null);
  const ticks = useRef<number>(0);
  const spin = () => {
    if (spinning) return;
    setWon(null);
    const idx = Math.floor(Math.random() * wheel.length);
    const seg = 360 / wheel.length;
    const target = rot - (rot % 360) + 360 * 6 + (360 - idx * seg - seg / 2);
    setRot(target); setSpinning(true);
    let n = 0; clearInterval(ticks.current);
    ticks.current = window.setInterval(() => { sfx.tick(); if (++n > 28) clearInterval(ticks.current); }, 110);
    setTimeout(() => { setSpinning(false); setWon(idx); sfx.levelUp(); }, 4000);
  };
  const seg = 360 / wheel.length;
  return (
    <Asset code="H-004" title="Daily Spin Wheel" desc="Колесо удачи: 8 секторов, замедление с тиками, указатель-язычок и приз с конфетти." hint="Крути колесо" specs={["4s ease-out", "ticks", "8 prizes"]}>
      <div className="relative mx-auto h-64 w-64">
        {won !== null && <Confetti />}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gold to-gold-d p-2 shadow-[0_8px_0_#8a5c08,0_20px_40px_rgba(0,0,0,.5)]">
          <div className="relative h-full w-full overflow-hidden rounded-full" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "transform 4s cubic-bezier(.12,.8,.2,1)" : "none", background: `conic-gradient(${wheel.map((w, i) => `${w.c} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})` }}>
            {wheel.map((w, i) => (
              <div key={i} className="absolute left-1/2 top-0 h-1/2 origin-bottom" style={{ transform: `translateX(-50%) rotate(${i * seg + seg / 2}deg)` }}>
                <div className="flex flex-col items-center pt-3">
                  <w.I size={26} />
                  <span className="text-[10px] font-black text-white drop-shadow-[0_1px_0_rgba(0,0,0,.5)]">{w.l}</span>
                </div>
              </div>
            ))}
            {wheel.map((_, i) => <div key={`l${i}`} className="absolute left-1/2 top-0 h-1/2 w-0.5 origin-bottom bg-black/25" style={{ transform: `rotate(${i * seg}deg)` }} />)}
          </div>
        </div>
        <button onClick={spin} className="btn3d absolute left-1/2 top-1/2 z-10 !h-16 !w-16 -translate-x-1/2 -translate-y-1/2 !rounded-full !text-[11px]" style={{ ["--c" as string]: "var(--color-sky)", ["--cd" as string]: "var(--color-sky-d)" }}>SPIN</button>
        <div className={cn("absolute left-1/2 -top-2 z-10 -translate-x-1/2", spinning && "anim-wiggle")} style={{ animationIterationCount: spinning ? "infinite" : 1, animationDuration: ".12s" }}>
          <svg width="30" height="36" viewBox="0 0 30 36"><path d="M15 36L2 8a13 13 0 0126 0z" fill="#e8eeff" stroke="#0a1224" strokeWidth="3" /></svg>
        </div>
      </div>
      <div className="mt-4 h-10 text-center">
        {won !== null ? <div className="anim-pop font-display text-base font-extrabold" style={{ color: wheel[won].c }}>You won: {wheel[won].l}!</div> : <div className="text-[12px] text-mist">{spinning ? "Удачи…" : "1 бесплатный спин в день"}</div>}
      </div>
    </Asset>
  );
}

function LimitedOffer() {
  const [left, setLeft] = useState(3 * 3600 + 27 * 60 + 12);
  const [claimed, setClaimed] = useState(false);
  useEffect(() => { const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000); return () => clearInterval(t); }, []);
  const hh = String(Math.floor(left / 3600)).padStart(2, "0"), mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  return (
    <Asset code="H-005" title="Limited-time Bundle" desc="Оффер с таймером-флипом, зачёркнутой ценой, содержимым набора и срочностью." hint="Забери бандл" specs={["countdown", "strike price", "urgency"]}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet via-violet-d to-ink-800 p-4 shadow-[inset_0_2px_0_rgba(255,255,255,.2),0_6px_0_#2a1570]">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/30 blur-2xl" />
        <div className="flex items-center justify-between">
          <Chip tone="gold"><Clock size={11} /> Ends soon</Chip>
          <span className="rounded-lg bg-bear px-2 py-0.5 text-[10px] font-black shadow-[0_2px_0_#c02a47]">−70%</span>
        </div>
        <div className="font-display mt-2 text-xl font-black">Bull Run Bundle</div>
        <div className="mt-3 flex gap-2">
          {[[GemIcon, "1500"], [ChestIcon, "×3"], [Snowflake, "×5"], [TargetIcon, "Pro 7d"]].map(([I, v], i) => {
            const C = I as typeof GemIcon;
            return (
              <div key={i} className="anim-pop flex flex-1 flex-col items-center rounded-xl bg-black/25 py-2" style={{ animationDelay: `${i * 80}ms` }}>
                {C === (Snowflake as unknown) ? <Snowflake size={28} className="text-cyan" /> : <C size={30} />}
                <span className="num text-[11px] font-extrabold">{v as string}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {[hh, mm, ss].map((v, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span key={v} className="num anim-pop rounded-lg bg-ink-950/70 px-2 py-1 text-lg font-extrabold shadow-[inset_0_-2px_0_rgba(255,255,255,.06)]">{v}</span>
              {i < 2 && <span className="font-black text-white/50">:</span>}
            </span>
          ))}
          <div className="ml-auto text-right">
            <div className="num text-[11px] text-white/50 line-through">$33.99</div>
            <div className="num text-xl font-extrabold text-gold">$9.99</div>
          </div>
        </div>
      </div>
      <Btn tone={claimed ? "bull" : "gold"} block className={cn("mt-4", !claimed && "!text-[#3b2600] sheen")} onClick={() => { setClaimed(true); sfx.levelUp(); }} silent>
        {claimed ? <><Gift size={16} /> Bundle claimed</> : "Get bundle"}
      </Btn>
    </Asset>
  );
}

function RewardedAd() {
  const [st, setSt] = useState<"offer" | "play" | "done">("offer");
  const [t, setT] = useState(5);
  const play = () => {
    setSt("play"); setT(5);
    let n = 5;
    const i = setInterval(() => { n--; setT(n); sfx.tick(); if (n <= 0) { clearInterval(i); setSt("done"); sfx.coin(); } }, 1000);
  };
  return (
    <Asset code="H-006" title="Rewarded Video Offer" desc="Опциональная реклама за награду: предложение, таймер просмотра, выдача x2 награды." hint="Посмотри «рекламу»" specs={["opt-in", "5s timer", "x2 reward"]}>
      <div className="panel-inset relative grid h-48 place-items-center overflow-hidden !rounded-2xl">
        {st === "offer" && (
          <div className="anim-fade text-center">
            <div className="flex items-center justify-center gap-2"><CoinIcon size={40} /><span className="font-display text-2xl font-black text-gold">×2</span></div>
            <div className="mt-2 text-[13px] font-bold">Удвой награду за урок</div>
            <div className="text-[11px] text-mist">Короткое видео · 5 секунд</div>
          </div>
        )}
        {st === "play" && (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-sky-d to-violet-d">
            <div className="text-center">
              <div className="font-display text-lg font-black">Your Ad Here</div>
              <div className="num mt-2 text-4xl font-extrabold">{t}</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30"><div className="h-full bg-gold transition-all duration-1000 ease-linear" style={{ width: `${((5 - t) / 5) * 100}%` }} /></div>
          </div>
        )}
        {st === "done" && (
          <div className="anim-pop text-center">
            <div className="flex justify-center gap-1">{[0, 1].map((i) => <CoinIcon key={i} size={40} className="anim-pop" style={{ animationDelay: `${i * 120}ms` }} />)}</div>
            <div className="num mt-2 text-2xl font-extrabold text-gold">+40 coins</div>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <GhostBtn onClick={() => setSt("offer")}>No thanks</GhostBtn>
        <Btn tone="gold" className="!text-[#3b2600]" disabled={st === "play"} onClick={play}>{st === "done" ? "Again" : "Watch"}</Btn>
      </div>
    </Asset>
  );
}

export default function Shop() {
  return (
    <Section id="shop" index="08" title="Shop & Monetization" subtitle="Этичная монетизация: усилители, паки, подписка, колесо, офферы, реклама за награду">
      <PowerUpShop />
      <GemPacks />
      <Paywall />
      <SpinWheel />
      <LimitedOffer />
      <RewardedAd />
    </Section>
  );
}
