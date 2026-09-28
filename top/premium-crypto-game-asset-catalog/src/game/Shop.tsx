import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";
import { GameButton, HudPill } from "./Device";
import { Mascot, SKINS, type SkinKey, type Hat } from "./Mascot";
import { ART, type ArtKey, ItemTile, type Rarity, GemArt, ChestArt, PotionArt, CrownArt, RocketArt, LockArt } from "./art";
import { sfx, Confetti, Rays, Shake, Pop, Twinkles, fmtClock } from "./Juice";

/* ================================================================== */
/*  STORE                                                              */
/* ================================================================== */
const ITEMS: { id: string; art: ArtKey; name: string; desc: string; price: number; r: Rarity }[] = [
  { id: "freeze", art: "freeze", name: "Streak Freeze", desc: "Protects 1 missed day", price: 200, r: "rare" },
  { id: "heart", art: "heart", name: "Heart Refill", desc: "Back to 5 lives", price: 350, r: "common" },
  { id: "potion", art: "potion", name: "XP Boost", desc: "2× XP for 15 min", price: 100, r: "epic" },
  { id: "bolt", art: "bolt", name: "Timer Boost", desc: "+30s in timed drills", price: 150, r: "common" },
  { id: "chest", art: "chest", name: "Mystery Chest", desc: "3 random rewards", price: 500, r: "legendary" },
  { id: "candle", art: "candle", name: "Neon Chart Skin", desc: "Cosmetic candle theme", price: 800, r: "epic" },
];

function Store() {
  const [gems, setGems] = useState(1280);
  const [owned, setOwned] = useState<Record<string, number>>({ freeze: 1 });
  const [shake, setShake] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [flying, setFlying] = useState<number>(0);
  const buy = (id: string, price: number, name: string) => {
    if (gems < price) {
      setShake((s) => s + 1);
      sfx("wrong");
      setToast(`Need ${price - gems} more gems`);
      setTimeout(() => setToast(null), 1600);
      return;
    }
    setGems((g) => g - price);
    setOwned((o) => ({ ...o, [id]: (o[id] ?? 0) + 1 }));
    setFlying((f) => f + 1);
    sfx("coin");
    setToast(`${name} added to inventory`);
    setTimeout(() => setToast(null), 1600);
  };
  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-2">
        <span className="font-[family-name:var(--font-display)] text-[18px] font-bold text-white">Shop</span>
        <Shake trigger={shake} className="ml-auto">
          <HudPill onClick={() => { setGems((g) => g + 500); sfx("chest"); }}>
            <GemArt size={20} />
            <Pop value={gems.toLocaleString()} className="text-aqua" />
            <Icon name="plus" size={14} strokeWidth={3} className="ml-1 text-ink-400" />
          </HudPill>
        </Shake>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ITEMS.map((it) => (
          <ItemTile key={it.id} art={it.art} rarity={it.r} label={it.name} size={58} count={owned[it.id] ? `×${owned[it.id]}` : undefined}>
            <span className="relative mt-0.5 text-center text-[9.5px] leading-tight text-ink-400">{it.desc}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                buy(it.id, it.price, it.name);
              }}
              className={cn("relative mt-2 flex h-9 w-full items-center justify-center gap-1 rounded-xl font-mono text-[12px] font-black", gems < it.price ? "text-ink-500" : "text-[#02141c]")}
              style={{ background: gems < it.price ? "#1a2745" : "linear-gradient(180deg,#8df0ff,#38e1ff)", boxShadow: `0 3px 0 ${gems < it.price ? "#0a1122" : "#0b6f8d"}` }}
            >
              <GemArt size={15} /> {it.price}
            </button>
          </ItemTile>
        ))}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="absolute inset-x-6 bottom-4 z-30 rounded-2xl border-2 border-[#26396a] bg-[#101a33] px-4 py-3 text-center text-[12px] font-bold text-white" style={{ boxShadow: "0 4px 0 #0a1328, 0 20px 30px -10px #000" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {flying > 0 && (
          <motion.div key={flying} className="pointer-events-none absolute right-8 top-2 z-30">
            {Array.from({ length: 8 }, (_, k) => (
              <motion.span key={k} className="absolute" initial={{ x: -120 + Math.random() * 60, y: 200, opacity: 1 }} animate={{ x: 0, y: 0, opacity: 0 }} transition={{ duration: 0.7, delay: k * 0.04, ease: "easeIn" }}>
                <GemArt size={16} />
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  FEATURED BUNDLE                                                    */
/* ================================================================== */
function Bundle() {
  const [t, setT] = useState(5 * 3600 + 42 * 60 + 17);
  const [bought, setBought] = useState(false);
  const [conf, setConf] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-3xl p-5" style={{ background: "linear-gradient(145deg,#4a1f9c 0%,#2a1d56 45%,#0a1226 100%)", boxShadow: "0 6px 0 #1a0f40, inset 0 2px 0 rgba(255,255,255,.18)" }}>
      <Confetti fire={conf} />
      <Rays color="rgba(255,194,75,.14)" size="200%" className="left-[74%] top-[50%]" />
      <Twinkles n={12} color="#ffe08a" />
      <div className="absolute -right-10 top-5 rotate-45 bg-bear px-12 py-1 font-mono text-[11px] font-black text-white" style={{ boxShadow: "0 3px 0 #8e0f2c" }}>
        −60%
      </div>
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative mx-auto h-[150px] w-[190px] shrink-0">
          <div className="absolute left-4 top-6 bob">
            <ChestArt size={110} open={bought} />
          </div>
          <div className="absolute right-0 top-0 bob" style={{ animationDelay: ".6s" }}>
            <GemArt size={54} />
          </div>
          <div className="absolute bottom-0 right-4 bob" style={{ animationDelay: "1.2s" }}>
            <PotionArt size={50} />
          </div>
          <div className="absolute left-0 top-0 bob" style={{ animationDelay: ".3s" }}>
            <CrownArt size={40} />
          </div>
        </div>
        <div className="flex-1">
          <Tag tone="gold">limited · halving week</Tag>
          <h4 className="mt-2 font-[family-name:var(--font-display)] text-[24px] font-bold leading-tight text-white">Whale Starter Pack</h4>
          <ul className="mt-2 space-y-1 text-[12px] font-semibold text-[#d8c4ff]">
            {["1,200 Gems", "Legendary Chest", "3× XP Boost", "Crown avatar frame"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <Icon name="check" size={13} strokeWidth={3.5} className="text-bull" />
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 font-mono text-[11px] font-black text-gold">
            <Icon name="clock" size={14} /> ends in <span className="tnum">{fmtClock(t)}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div>
              <div className="font-mono text-[11px] text-ink-400 line-through">$24.99</div>
              <div className="font-[family-name:var(--font-display)] text-[24px] font-bold text-white">$9.99</div>
            </div>
            <div className="flex-1">
              <GameButton tone="gold" disabled={bought} onClick={() => { setBought(true); setConf((c) => c + 1); sfx("chest"); }}>
                {bought ? "Owned" : "Buy now"}
              </GameButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  GEM PACKS                                                          */
/* ================================================================== */
function GemPacks() {
  const [sel, setSel] = useState(1);
  const packs = [
    { n: 400, p: "$4.99", s: 1 },
    { n: 1200, p: "$9.99", s: 2, tag: "Most popular" },
    { n: 3000, p: "$19.99", s: 3, tag: "Best value" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {packs.map((pk, i) => (
        <motion.button
          key={i}
          type="button"
          onClick={() => { setSel(i); sfx("select"); }}
          whileTap={{ y: 3 }}
          className="relative flex flex-col items-center rounded-2xl border-2 px-2 pb-3 pt-5"
          style={{
            borderColor: sel === i ? "#38e1ff" : "#22355e",
            background: sel === i ? "linear-gradient(170deg,#0f3350,#0b1224)" : "#101a33",
            boxShadow: `0 4px 0 ${sel === i ? "#0b6f8d" : "#0a1328"}${sel === i ? ", 0 0 24px -6px #38e1ff" : ""}`,
          }}
        >
          {pk.tag && (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[8px] font-black uppercase" style={{ background: i === 2 ? "#ffc24b" : "#38e1ff", color: "#0a1226" }}>
              {pk.tag}
            </span>
          )}
          <div className="relative h-[54px] w-[64px]">
            {Array.from({ length: pk.s }, (_, k) => (
              <span key={k} className="absolute" style={{ left: 8 + k * 10 - (pk.s - 1) * 5, top: k % 2 ? 6 : 0 }}>
                <GemArt size={44 - k * 4} />
              </span>
            ))}
          </div>
          <span className="tnum mt-1 font-mono text-[16px] font-black text-aqua">{pk.n.toLocaleString()}</span>
          <span className="mt-1 rounded-lg bg-black/30 px-2 py-0.5 font-mono text-[11px] font-black text-white">{pk.p}</span>
        </motion.button>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  PAYWALL — Tradelingo MAX                                           */
/* ================================================================== */
function Paywall() {
  const [plan, setPlan] = useState<"m" | "y">("y");
  const [conf, setConf] = useState(0);
  const feats: { a: ArtKey; t: string }[] = [
    { a: "heart", t: "Unlimited hearts" },
    { a: "whale", t: "Live whale-alert rooms" },
    { a: "potion", t: "AI trade reviews" },
    { a: "shield", t: "No ads, ever" },
    { a: "trophy", t: "Exclusive MAX league" },
  ];
  return (
    <div className="relative overflow-hidden rounded-3xl p-5" style={{ background: "linear-gradient(170deg,#101a33 0%,#0a1226 60%)", boxShadow: "inset 0 0 0 2px #9b6bff55" }}>
      <Confetti fire={conf} />
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl" style={{ background: "rgba(155,107,255,.35)" }} />
      <div className="relative flex items-center gap-3">
        <RocketArt size={54} />
        <div>
          <div className="font-[family-name:var(--font-display)] text-[24px] font-bold leading-none">
            <span className="text-white">Tradelingo </span>
            <span className="grad-pan bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#9b6bff,#38e1ff,#2be08a,#9b6bff)" }}>
              MAX
            </span>
          </div>
          <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink-400">learn 3× faster</div>
        </div>
      </div>
      <div className="relative mt-4 space-y-2">
        {feats.map((f, i) => {
          const A = ART[f.a];
          return (
            <motion.div key={f.t} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex items-center gap-3">
              <A size={26} />
              <span className="flex-1 text-[13px] font-bold text-ink-200">{f.t}</span>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-violet text-[#0d0620]">
                <Icon name="check" size={11} strokeWidth={4} />
              </span>
            </motion.div>
          );
        })}
      </div>
      <div className="relative mt-4 grid grid-cols-2 gap-2.5">
        {(
          [
            ["m", "Monthly", "$12.99", "/mo", ""],
            ["y", "Yearly", "$6.66", "/mo", "save 49%"],
          ] as const
        ).map(([k, n, p, u, s]) => (
          <button
            type="button"
            key={k}
            onClick={() => { setPlan(k); sfx("select"); }}
            className="relative rounded-2xl border-2 p-3 text-left transition-colors"
            style={{ borderColor: plan === k ? "#9b6bff" : "#22355e", background: plan === k ? "#1e1545" : "#101a33", boxShadow: `0 4px 0 ${plan === k ? "#4a1f9c" : "#0a1328"}` }}
          >
            {s && <span className="absolute -top-2.5 right-2 rounded-full bg-bull px-2 py-0.5 font-mono text-[8px] font-black uppercase text-[#02150b]">{s}</span>}
            <div className="font-mono text-[9px] font-black uppercase tracking-widest text-ink-400">{n}</div>
            <div className="mt-0.5 font-[family-name:var(--font-display)] text-[20px] font-bold text-white">
              {p}
              <span className="text-[11px] text-ink-400">{u}</span>
            </div>
            <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border-2" style={{ borderColor: plan === k ? "#9b6bff" : "#3d4d73" }}>
              {plan === k && <span className="h-2.5 w-2.5 rounded-full bg-violet" />}
            </span>
          </button>
        ))}
      </div>
      <div className="relative mt-4 flex items-start gap-3 font-mono text-[9px] uppercase tracking-wider text-ink-400">
        {[
          ["today", "full access"],
          ["day 5", "reminder"],
          ["day 7", "billing starts"],
        ].map(([d, l], i) => (
          <div key={d} className="flex flex-1 flex-col items-center text-center">
            <span className="mb-1 grid h-7 w-7 place-items-center rounded-full" style={{ background: i === 0 ? "#9b6bff" : "#1a2745", color: i === 0 ? "#0d0620" : "#7d8db4" }}>
              <Icon name={i === 0 ? "bolt" : i === 1 ? "bell" : "star"} size={13} strokeWidth={2.6} />
            </span>
            <span className="font-black text-white">{d}</span>
            <span>{l}</span>
          </div>
        ))}
      </div>
      <div className="relative mt-4">
        <GameButton tone="violet" onClick={() => { setConf((c) => c + 1); sfx("levelup"); }}>
          Start 7-day free trial
        </GameButton>
        <div className="mt-2 text-center font-mono text-[9px] text-ink-500">cancel anytime · restore purchases</div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  WARDROBE                                                           */
/* ================================================================== */
const HATS: { k: Hat; l: string; price: number }[] = [
  { k: "none", l: "None", price: 0 },
  { k: "cap", l: "Cap", price: 0 },
  { k: "beanie", l: "Beanie", price: 120 },
  { k: "headset", l: "Headset", price: 250 },
  { k: "crown", l: "Crown", price: 900 },
];

function Wardrobe() {
  const [skin, setSkin] = useState<SkinKey>("royal");
  const [hat, setHat] = useState<Hat>("cap");
  const [shades, setShades] = useState(false);
  const [chain, setChain] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>(["none", "cap", "royal", "emerald"]);
  const [gems, setGems] = useState(600);
  const [mood, setMood] = useState<"happy" | "idle">("idle");
  const [shake, setShake] = useState(0);
  const react = () => {
    setMood("happy");
    setTimeout(() => setMood("idle"), 900);
  };
  const tryUnlock = (id: string, price: number, apply: () => void) => {
    if (unlocked.includes(id) || price === 0) {
      apply();
      react();
      sfx("pop");
      return;
    }
    if (gems < price) {
      setShake((s) => s + 1);
      sfx("wrong");
      return;
    }
    setGems((g) => g - price);
    setUnlocked((u) => [...u, id]);
    apply();
    react();
    sfx("unlock");
  };
  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div className="relative flex flex-col items-center justify-end overflow-hidden rounded-3xl pb-4 pt-6" style={{ background: "radial-gradient(circle at 50% 30%, #1e3563, #0a1226 70%)" }}>
        <div className="absolute bottom-6 h-6 w-40 rounded-[50%] bg-black/40 blur-sm" />
        <div className="absolute bottom-3 h-10 w-44 rounded-[50%]" style={{ background: "linear-gradient(180deg,#22355e,#0d1528)", boxShadow: "0 4px 0 #070d1c" }} />
        <Mascot mood={mood} size={170} skin={skin} outfit={{ hat, shades, chain }} className="relative" />
        <Shake trigger={shake} className="relative mt-3">
          <HudPill>
            <GemArt size={18} />
            <Pop value={gems} className="text-aqua" />
          </HudPill>
        </Shake>
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-ink-500">armour colour</div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SKINS) as SkinKey[]).map((k, i) => {
              const price = i < 2 ? 0 : 150;
              const locked = !unlocked.includes(k) && price > 0;
              return (
                <motion.button
                  key={k}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => tryUnlock(k, price, () => setSkin(k))}
                  className="relative h-12 w-12 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${SKINS[k][0]}, ${SKINS[k][1]} 55%, ${SKINS[k][2]})`,
                    boxShadow: `0 4px 0 ${SKINS[k][2]}${skin === k ? ", 0 0 0 3px #0a1226, 0 0 0 5px var(--accent)" : ""}`,
                  }}
                >
                  {locked && (
                    <span className="absolute inset-0 grid place-items-center rounded-2xl bg-black/45">
                      <LockArt size={20} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-ink-500">headwear</div>
          <div className="grid grid-cols-5 gap-2">
            {HATS.map((h) => {
              const locked = !unlocked.includes(h.k) && h.price > 0;
              return (
                <button
                  key={h.k}
                  type="button"
                  onClick={() => tryUnlock(h.k, h.price, () => setHat(h.k))}
                  className="flex flex-col items-center rounded-2xl border-2 py-2"
                  style={{ borderColor: hat === h.k ? "var(--accent)" : "#22355e", background: hat === h.k ? "color-mix(in srgb, var(--accent) 12%, #101a33)" : "#101a33", boxShadow: "0 3px 0 #0a1328" }}
                >
                  <span className="text-[11px] font-extrabold text-ink-200">{h.l}</span>
                  <span className="mt-0.5 flex items-center gap-0.5 font-mono text-[9px] font-black" style={{ color: locked ? "#38e1ff" : "#5f6f96" }}>
                    {locked ? (
                      <>
                        <GemArt size={10} /> {h.price}
                      </>
                    ) : (
                      "owned"
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: "shades", l: "Deal-with-it shades", v: shades, set: setShades, price: 200 },
            { id: "chain", l: "Gold ₿ chain", v: chain, set: setChain, price: 300 },
          ].map((x) => {
            const locked = !unlocked.includes(x.id);
            return (
              <button
                key={x.id}
                type="button"
                onClick={() => tryUnlock(x.id, x.price, () => x.set(!x.v))}
                className="flex items-center justify-between rounded-2xl border-2 px-3 py-3"
                style={{ borderColor: x.v ? "var(--accent)" : "#22355e", background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}
              >
                <span className="text-[12px] font-bold text-ink-200">{x.l}</span>
                {locked ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] font-black text-aqua">
                    <GemArt size={12} />
                    {x.price}
                  </span>
                ) : (
                  <span className="relative h-6 w-11 rounded-full transition-colors" style={{ background: x.v ? "var(--accent)" : "#0a1122" }}>
                    <motion.span animate={{ x: x.v ? 21 : 3 }} className="absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Section id="shop" index="" title="Shop & Monetization" kicker="Fair economy · clear value · zero dark patterns" count="5 surfaces">
      <Grid>
        <Cell title="Featured Bundle" spec="live countdown · ribbon" span="col-span-2 md:col-span-4 lg:col-span-4">
          <Bundle />
        </Cell>
        <Cell title="Paywall · MAX" spec="trial timeline" span="col-span-2 md:col-span-4 lg:col-span-2 lg:row-span-2">
          <Paywall />
        </Cell>
        <Cell title="Item Store" spec="buy · shake on insufficient" span="col-span-2 md:col-span-4 lg:col-span-4">
          <Store />
        </Cell>
        <Cell title="Mascot Wardrobe" spec="live preview · unlocks" span="col-span-2 md:col-span-4 lg:col-span-4">
          <Wardrobe />
        </Cell>
        <Cell title="Gem Packs" spec="anchored pricing" span="col-span-2 md:col-span-4 lg:col-span-2">
          <GemPacks />
        </Cell>
      </Grid>
    </Section>
  );
}
