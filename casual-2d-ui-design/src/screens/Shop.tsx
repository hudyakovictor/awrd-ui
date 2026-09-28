import { motion } from "framer-motion";
import { Clock, Package } from "lucide-react";
import { ArtImage, BoltIcon, CoinIcon, GemIcon, JellyBtn } from "../components/ui";
import { MONSTERS, SHOP, ShopItem } from "../data/game";

const ACC: Record<ShopItem["accent"], [string, string]> = {
  teal: ["#19f2c4", "#07bcd8"],
  gold: ["#ffe066", "#ff9a1f"],
  grape: ["#a37bff", "#6c3df0"],
  pink: ["#ff6f9f", "#f43f7f"],
};

export default function Shop({ onBuy }: { onBuy: (item: ShopItem) => void }) {
  const featured = MONSTERS.find((m) => m.id === "chimera")!;
  return (
    <div className="no-scrollbar relative flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-2">
      <h2 className="tstrok font-display text-[26px] font-black italic uppercase leading-none">Магазин</h2>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-sky/60">обновление через 14:32:07</p>

      {/* featured */}
      <motion.div
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="card-shine relative mt-3 overflow-hidden rounded-[24px] p-[2.5px]"
        style={{ background: "linear-gradient(140deg,#ffe066,#ff4d8d 55%,#6c3df0)", boxShadow: "0 16px 36px -12px rgba(255,77,141,.5)" }}
      >
        <div className="relative flex items-center gap-3 overflow-hidden rounded-[21px] px-4 py-3.5" style={{ background: "linear-gradient(160deg,#231352,#0d1b3f)" }}>
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-pink/25 blur-3xl" />
          <div className="anim-floaty relative shrink-0">
            <div className="absolute inset-[-10px] rounded-3xl bg-gold/30 blur-xl" />
            <ArtImage src={featured.art} alt={featured.name} tint={featured.tint} className="relative h-24 w-24 rounded-3xl" style={{ boxShadow: "inset 0 0 0 2px #ffe066aa" }} />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 rounded-full bg-hp/20 px-2 py-0.5 font-display text-[9px] font-black uppercase tracking-wider text-hp" style={{ boxShadow: "inset 0 0 0 1px #ff546866" }}>
              <Clock size={9} /> 23ч 59м
            </div>
            <div className="mt-1 font-display text-[17px] font-black leading-tight text-white">Сундук Химеры</div>
            <div className="font-body text-[11px] font-bold text-sky/70">Шанс на легендарного монстра ×3</div>
            <JellyBtn variant="gold" className="mt-2 px-5 py-2 text-[13px] uppercase italic">649 ₽</JellyBtn>
          </div>
        </div>
      </motion.div>

      {/* items */}
      <div className="mt-4 mb-2 flex items-center gap-2">
        <Package size={14} className="text-teal" />
        <span className="font-display text-[13px] font-black uppercase tracking-wide text-white/90">Пакеты рынка</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SHOP.map((it, i) => {
          const [c1, c2] = ACC[it.accent];
          return (
            <motion.button
              key={it.id}
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 + i * 0.05 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onBuy(it)}
              className="panel-soft card-shine relative flex flex-col items-center rounded-[22px] px-3 pb-3 pt-4"
            >
              {it.tag && (
                <span className="absolute -right-1.5 -top-1.5 rotate-6 rounded-lg px-2 py-0.5 font-display text-[9px] font-black text-white"
                  style={{ background: "linear-gradient(180deg,#ff7b8a,#f2304c)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 4px 8px rgba(0,0,0,.4)" }}>
                  {it.tag}
                </span>
              )}
              <span className="relative mb-1.5 grid h-14 w-14 place-items-center rounded-2xl"
                style={{ background: `linear-gradient(160deg, ${c1}33, ${c2}22)`, boxShadow: `inset 0 0 0 2px ${c1}55` }}>
                {it.kind === "coins" && <CoinStack />}
                {it.kind === "gems" && <GemStack />}
                {it.kind === "bundle" && <BundleStack c={c1} />}
              </span>
              <span className="font-mono text-[13px] leading-none" style={{ color: c1 }}>{it.amount}</span>
              <span className="mt-0.5 text-center font-display text-[11px] font-bold leading-tight text-white/85">{it.title}</span>
              <span className="mt-2 rounded-full px-3 py-1 font-display text-[11px] font-black text-[#081430]"
                style={{ background: `linear-gradient(180deg, ${c1}, ${c2})`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 4px 10px -2px rgba(0,0,0,.5)" }}>
                {it.price}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const CoinStack = () => (
  <span className="relative block h-9 w-10">
    <span className="absolute left-0 top-1.5"><CoinIcon size={26} /></span>
    <span className="absolute left-3 top-0"><CoinIcon size={26} /></span>
    <span className="absolute left-1.5 top-2.5"><CoinIcon size={26} /></span>
  </span>
);
const GemStack = () => (
  <span className="relative block h-9 w-10">
    <span className="absolute left-3 top-0 scale-110"><GemIcon size={26} /></span>
    <span className="absolute left-0 top-2 opacity-90"><GemIcon size={22} /></span>
    <span className="absolute right-0 top-2.5 opacity-80"><GemIcon size={20} /></span>
  </span>
);
const BundleStack = ({ c }: { c: string }) => (
  <span className="relative block h-9 w-10">
    <span className="absolute left-0 top-2"><CoinIcon size={24} /></span>
    <span className="absolute right-0 top-0"><GemIcon size={24} /></span>
    <BoltIcon size={14} />
    <span className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full blur-[3px]" style={{ background: c }} />
  </span>
);
