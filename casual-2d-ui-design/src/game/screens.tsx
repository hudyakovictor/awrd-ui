import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check, Clock, Crown, Flame, Lock, Play, TrendingUp, BookOpen } from "lucide-react";
import { Art, Badge, Bolt, Btn, Coin, Gem, Heart, Star, Stars, Sword } from "../lib/ui";
import { Magnet, Tilt } from "../lib/ui2";
import { Dust, Rays, Sparkles } from "../lib/fx";
import { LEVELS, LevelNode, M, MAP_H, MAP_W, MONSTERS, Monster, RARITY, SHOP, ShopItem } from "../data/kit";
import { ART } from "../art";
import { cn } from "../utils/cn";

/* ════════════════ MENU ════════════════ */
export function MenuScreen({ onPlay, onDaily }: { onPlay?: () => void; onDaily?: () => void }) {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 14 });
  const sy = useSpring(my, { stiffness: 60, damping: 14 });
  const px1 = useTransform(sx, [-1, 1], [-7, 7]);
  const py1 = useTransform(sy, [-1, 1], [-5, 5]);
  const px2 = useTransform(sx, [-1, 1], [12, -12]);
  const py2 = useTransform(sy, [-1, 1], [8, -8]);

  return (
    <div className="no-sb relative flex h-full flex-col overflow-hidden px-5 pb-5 pt-3"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}>
      <motion.img src={ART.bgMap} alt="" style={{ x: px2, y: py2, scale: 1.07 }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,23,53,.55) 0%, rgba(7,16,38,.2) 40%, #0a1735 92%)" }} />
      <Dust n={14} />

      <div className="relative z-10 mx-auto">
        <span className="pnl-soft flex items-center gap-1.5 rounded-full px-3 py-1 font-num text-[10px] font-medium uppercase tracking-[.18em] text-teal">
          <Flame size={11} /> Сезон I · бычий рынок
        </span>
      </div>

      <div className="relative z-10 mt-4 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0, y: -10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 190, damping: 14 }} className="relative inline-block">
          <Sparkles n={6} />
          <motion.div style={{ y: py1, x: px1 }}>
            <div className="hd text-[46px] leading-[.86]">SIGNAL</div>
            <div className="hd grad-teal text-[46px] leading-[.86]" style={{ WebkitTextStrokeColor: "#06364a" }}>ARENA</div>
          </motion.div>
          <span className="absolute -right-6 top-7 rotate-[14deg] rounded-[8px] px-1.5 py-0.5 font-display text-[9px] font-black uppercase italic text-[#4a2a04]"
            style={{ background: "linear-gradient(180deg,#ffe884,#ff9b1f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 3px 8px rgba(0,0,0,.5)" }}>edu</span>
        </motion.div>
      </div>

      <div className="relative z-10 mt-1 flex-1">
        <Rays className="inset-x-[-40%] top-[-25%] bottom-[-10%] opacity-60" />
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 170, damping: 15 }}
          style={{ x: px1, y: py1 }}
          className="a-f1 absolute inset-x-0 top-1 grid place-items-center">
          <div className="relative">
            <div className="absolute inset-[-8%] rounded-full bg-teal/25 blur-3xl" />
            <Art src={ART.hero} alt="Герой" className="relative h-[208px] w-[208px]" />
          </div>
        </motion.div>
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .3, type: "spring", stiffness: 150 }}
          style={{ x: px2, y: py2 }} className="a-f2 absolute -left-1 bottom-6">
          <Art src={ART.fomo} alt="" className="h-[84px] w-[84px] -rotate-6" />
        </motion.div>
        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: .42, type: "spring", stiffness: 150 }}
          style={{ x: px1, y: py2 }} className="a-f1 absolute -right-2 bottom-12">
          <Art src={ART.dopamine} alt="" className="h-[78px] w-[78px] rotate-6" />
        </motion.div>
      </div>

      <motion.div initial={{ y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: .22, type: "spring", stiffness: 160, damping: 18 }}
        className="relative z-10 space-y-2">
        <Magnet strength={0.16} className="block">
          <Btn color="teal" size="xl" full onClick={onPlay}><Play size={20} fill="currentColor" /> Играть</Btn>
        </Magnet>
        <div className="flex gap-2">
          <Btn color="navy" size="sm" className="flex-1" onClick={onDaily}>
            <Coin s={14} /> Награда дня
            <span className="ml-0.5 h-[7px] w-[7px] rounded-full bg-coral a-breathe" />
          </Btn>
          <Btn color="navy" size="sm" className="flex-1"><TrendingUp size={13} className="text-teal" /> Рейтинг</Btn>
        </div>
        <p className="pt-1 text-center font-num text-[9px] font-semibold uppercase tracking-[.2em] text-sky/40">
          учитесь торговле, побеждая свои страхи
        </p>
      </motion.div>
    </div>
  );
}

/* ════════════════ MAP ════════════════ */
const state = (l: LevelNode) => (l.stars < 0 ? "lock" : l.stars === 0 && (l.type === "battle" || l.type === "elite") ? "now" : "done");

export function MapScreen({ onNode, onLesson }: { onNode?: (l: LevelNode) => void; onLesson?: (id: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cur = LEVELS.find((l) => state(l) === "now");
  const sv = useMotionValue(0);
  const par = useTransform(sv, (v) => v * -0.06);

  useEffect(() => {
    const el = box.current;
    if (!el || !cur) return;
    const t = setTimeout(() => el.scrollTo({ top: cur.y - el.clientHeight / 2, behavior: "smooth" }), 400);
    return () => clearTimeout(t);
  }, [cur]);

  const d = useMemo(() => {
    const p = [...LEVELS].sort((a, b) => b.y - a.y);
    let s = `M ${p[0].x} ${p[0].y}`;
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1], b = p[i], m = (a.y + b.y) / 2;
      s += ` C ${a.x} ${m}, ${b.x} ${m}, ${b.x} ${b.y}`;
    }
    return s;
  }, []);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={box} className="no-sb absolute inset-0 overflow-y-auto overscroll-contain"
        onScroll={(e) => sv.set((e.target as HTMLDivElement).scrollTop)}>
        <div className="relative mx-auto" style={{ width: MAP_W, height: MAP_H }}>
          <motion.div style={{ y: par, scale: 1.1 }} className="pointer-events-none absolute inset-0">
            <img src={ART.bgMap} alt="" className="h-full w-full object-cover opacity-55" />
          </motion.div>
          <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg,#0a1735 0%,transparent 10%,transparent 90%,#0a1735 100%)" }} />

          <svg className="absolute left-0 top-0" width={MAP_W} height={MAP_H}>
            <path d={d} fill="none" stroke="#050e26" strokeWidth={17} strokeLinecap="round" opacity=".85" />
            <path d={d} fill="none" stroke="#2c4f92" strokeWidth={11} strokeLinecap="round" />
            <path d={d} fill="none" stroke="#4d7fd1" strokeWidth={5} strokeLinecap="round" opacity=".7" />
            <path d={d} fill="none" stroke="#1ff0c8" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="4 12" className="a-dash" opacity=".9" />
          </svg>

          {LEVELS.map((l, i) => <MapNode key={l.id} l={l} i={i} onNode={onNode} onLesson={onLesson} />)}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-1.5">
        <div className="pnl-glass shine rounded-2xl px-5 py-1.5 text-center">
          <div className="hd hd-thin text-[14px] uppercase leading-tight">Арена сигналов</div>
          <div className="font-num text-[9px] font-medium tracking-[.16em] text-teal">СЕЗОН I · УЧИСЬ ТОРГОВАТЬ</div>
        </div>
      </div>
    </div>
  );
}

function MapNode({ l, i, onNode, onLesson }: { l: LevelNode; i: number; onNode?: (l: LevelNode) => void; onLesson?: (id: string) => void }) {
  const st = state(l);
  const common = "absolute -translate-x-1/2 -translate-y-1/2 z-10";
  const pos = { left: l.x, top: l.y };

  if (l.type === "chest") {
    return (
      <motion.div className={common} style={pos} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 280, damping: 15, delay: i * 0.02 }}>
        <motion.div animate={st === "done" ? {} : { rotate: [0, -3, 3, 0] }} transition={{ repeat: Infinity, duration: 3 }}
          className={cn("pnl-soft grid h-[52px] w-[58px] place-items-center rounded-[18px]", st === "lock" && "opacity-70 grayscale-[.5]")}>
          <ChestIco open={st === "done"} />
          {st !== "lock" && <Sparkles n={3} />}
        </motion.div>
      </motion.div>
    );
  }

  if (l.type === "lesson") {
    return (
      <motion.div className={common} style={pos} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 280, damping: 15, delay: i * 0.02 }}>
        <motion.button whileTap={st !== "lock" ? { scale: 0.88, y: 2 } : undefined}
          onClick={() => st !== "lock" && l.pattern && onLesson?.(l.pattern)}
          className="relative grid h-[48px] w-[48px] place-items-center rounded-[16px]"
          style={{
            background: st === "lock" ? "linear-gradient(177deg,#2b4d8f,#122445)" : "linear-gradient(177deg,#bb9bff,#7a3ef0)",
            boxShadow: st === "lock"
              ? "inset 0 2px 0 rgba(150,195,255,.25), inset 0 -5px 0 #091a3d, 0 4px 0 #071331"
              : "inset 0 2px 0 rgba(255,255,255,.55), inset 0 -5px 0 #4a1fa8, 0 5px 0 #34157c, 0 10px 18px -6px rgba(154,107,255,.6)",
          }}>
          {st === "lock" ? <Lock size={17} className="text-sky/45" /> : <BookOpen size={19} className="text-[#210c4d]" />}
          {st !== "lock" && l.pattern && (
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0a1838] px-1.5 py-[1px] font-display text-[8px] font-black uppercase italic text-grape"
              style={{ boxShadow: "inset 0 0 0 1px rgba(154,107,255,.6)" }}>урок</span>
          )}
          {st === "done" && <span className="absolute -right-1.5 -top-1.5 grid h-4.5 w-4.5 h-[18px] w-[18px] place-items-center rounded-full bg-mint">
            <Check size={10} strokeWidth={4.5} className="text-[#05391f]" /></span>}
        </motion.button>
      </motion.div>
    );
  }

  if (l.type === "boss") return <BossNode l={l} st={st} pos={pos} />;

  const done = st === "done", now = st === "now", elite = l.type === "elite";
  const size = elite ? 62 : 54;
  const en = l.enemy ? M(l.enemy) : null;

  return (
    <motion.div className={common} style={pos} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 280, damping: 16, delay: i * 0.02 }}>
      {done && <div className="absolute -top-7 left-1/2 -translate-x-1/2"><Stars n={l.stars} s={13} /></div>}
      {now && <span className="absolute inset-[-10px] rounded-full a-ring" />}
      <motion.button whileTap={now ? { scale: 0.88 } : undefined} onClick={() => now && onNode?.(l)}
        className={cn("relative grid place-items-center rounded-full", now && "a-breathe")}
        style={{
          width: size, height: size,
          background: done ? "linear-gradient(177deg,#ffe884,#f08a12)" : now ? "linear-gradient(177deg,#35f7d2,#0bb7d8)" : "linear-gradient(177deg,#2b4d8f,#122445)",
          boxShadow: done
            ? "inset 0 2px 0 rgba(255,255,255,.7), inset 0 -6px 0 #a8530a, 0 5px 0 #7a3c06, 0 10px 18px -6px rgba(255,170,40,.55)"
            : now
              ? "inset 0 2px 0 rgba(255,255,255,.7), inset 0 -6px 0 #056a80, 0 5px 0 #044f61, 0 12px 22px -6px rgba(24,226,198,.7)"
              : "inset 0 2px 0 rgba(150,195,255,.25), inset 0 -5px 0 #091a3d, 0 4px 0 #071331",
        }}>
        {elite && <Crown size={16} className="absolute -top-3 left-1/2 -translate-x-1/2 text-gold drop-shadow" fill="#ffd14a" />}
        {done ? <Check size={26} strokeWidth={4} className="text-[#6b3c05]" />
          : st === "lock" ? <Lock size={19} className="text-sky/45" />
            : <span className="hd text-[21px] leading-none">{l.id}</span>}
      </motion.button>
      {now && (
        <div className="absolute -bottom-[26px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-[2px] a-breathe"
          style={{ background: "linear-gradient(180deg,#35f7d2,#0bb7d8)", boxShadow: "0 4px 12px rgba(24,226,198,.55), inset 0 1px 0 rgba(255,255,255,.6)" }}>
          <span className="font-display text-[9.5px] font-black uppercase italic text-[#04303f]">Ты здесь</span>
        </div>
      )}
      {now && en && (
        <div className="absolute -right-8 -top-7 h-12 w-12 -rotate-6 overflow-hidden rounded-[14px] a-f2"
          style={{ background: "radial-gradient(circle at 50% 40%, #2a3f70, #0d1730)", boxShadow: `inset 0 0 0 2px ${en.tint}, 0 6px 14px rgba(0,0,0,.6)` }}>
          <Art src={en.art} alt="" className="h-full w-full scale-110" blend={false} />
        </div>
      )}
    </motion.div>
  );
}

function BossNode({ l, st, pos }: { l: LevelNode; st: string; pos: { left: number; top: number } }) {
  const en = M(l.enemy ?? "chimera");
  return (
    <motion.div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={pos}
      initial={{ scale: 0, y: 24 }} whileInView={{ scale: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 210, damping: 14 }}>
      <div className="relative">
        <div className="absolute inset-[-18px] rounded-full bg-pink/25 blur-2xl" />
        <span className="absolute inset-[-8px] rounded-[30px] a-ring" style={{ animationDuration: "2.8s" }} />
        <div className="frame relative h-[108px] w-[108px]" style={{ background: "linear-gradient(170deg,#ffe884,#ff4d8d 60%,#7a3ef0)", boxShadow: "0 14px 30px -8px rgba(255,77,141,.5)" }}>
          <div className="relative h-full w-full overflow-hidden rounded-[19px]" style={{ background: "radial-gradient(circle at 50% 35%, #3a1540, #0d1730)" }}>
            <Art src={en.art} alt={en.name} className={cn("h-full w-full scale-110", st === "lock" && "brightness-[.5] saturate-[.55]")} />
            {st === "lock" && <div className="absolute inset-0 grid place-items-center bg-[#04081a]/35"><Lock size={26} className="text-white/90 drop-shadow" /></div>}
          </div>
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-[3px]"
          style={{ background: "linear-gradient(180deg,#ff8fb6,#e01f5e)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 0 rgba(0,0,0,.3), 0 5px 12px rgba(0,0,0,.55)" }}>
          <span className="font-display text-[10px] font-black uppercase italic tracking-wide text-white" style={{ textShadow: "0 1px 1px rgba(0,0,0,.45)" }}>Босс · Химера</span>
        </div>
      </div>
    </motion.div>
  );
}

const ChestIco = ({ open }: { open: boolean }) => (
  <svg width="34" height="26" viewBox="0 0 150 108" className="overflow-visible">
    <rect x="25" y="52" width="100" height="50" rx="9" fill="#a9691f" stroke="#5c360a" strokeWidth="6" />
    <path d="M25 54c0-24 22-38 50-38s50 14 50 38z" fill={open ? "#7a4a12" : "#c98a3c"} stroke="#5c360a" strokeWidth="6" />
    <rect x="66" y="44" width="18" height="22" rx="4" fill="#ffd14a" stroke="#9c4e06" strokeWidth="5" />
  </svg>
);

/* ════════════════ COLLECTION ════════════════ */
const OWNED = new Set(["dopamine", "wick", "paper", "fomo"]);

export function CollectionScreen({ onPick }: { onPick?: (m: Monster) => void }) {
  const [f, setF] = useState<"all" | "rare" | "epic" | "legend">("all");
  const list = MONSTERS.filter((m) => f === "all" || m.rarity === f);
  const FS = [["all", "Все"], ["rare", "Редкие"], ["epic", "Эпик"], ["legend", "Легенды"]] as const;

  return (
    <div className="no-sb flex-1 overflow-y-auto px-3 pb-3 pt-1">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="hd text-[23px] uppercase leading-none">Бестиарий</h2>
          <p className="mt-1 font-num text-[9.5px] font-medium uppercase tracking-[.14em] text-sky/55">демоны рынка · {OWNED.size}/{MONSTERS.length}</p>
        </div>
        <div className="pnl-soft rounded-xl px-2.5 py-1 text-center">
          <div className="font-num text-[13px] font-bold leading-none text-gold">4/6</div>
          <div className="font-display text-[8px] font-bold uppercase text-sky/50">поймано</div>
        </div>
      </div>

      <div className="no-sb sticky top-0 z-10 -mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 py-2"
        style={{ background: "linear-gradient(180deg,#0a1735 55%,transparent)" }}>
        {FS.map(([id, label]) => {
          const on = f === id;
          return (
            <button key={id} onClick={() => setF(id)}
              className="shrink-0 rounded-full px-3 py-[5px] font-display text-[10.5px] font-extrabold uppercase italic tracking-wide transition-transform active:scale-95"
              style={on
                ? { background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", color: "#04303f", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -3px 0 #056a80, 0 5px 12px -3px rgba(24,226,198,.5)" }
                : { background: "rgba(16,34,73,.9)", color: "#7fa6d9", boxShadow: "inset 0 0 0 1.5px rgba(47,92,176,.5)" }}>
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {list.map((m, i) => {
          const own = OWNED.has(m.id), r = RARITY[m.rarity];
          return (
            <motion.div key={m.id} layout initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 240, damping: 20 }}>
              <Tilt max={9} className="h-full" style={{ height: "100%" }}>
                <button onClick={() => onPick?.(m)} className="frame block w-full text-left"
                  style={{ background: `linear-gradient(170deg, ${r.c1}, ${r.c2} 55%, #16295c)`, boxShadow: `0 8px 20px -9px ${r.glow}`, height: "100%" }}>
                  <div className="relative h-full overflow-hidden rounded-[19px]" style={{ background: "linear-gradient(178deg,#1a3467,#0c1c40)" }}>
                    <div className="relative h-[100px]" style={{ background: `radial-gradient(circle at 50% 38%, ${m.tint}28, transparent 68%)` }}>
                      <Art src={m.art} alt={m.name} className={cn("h-full w-full scale-[1.12] transition-transform", !own && "brightness-[.28] saturate-0")} />
                      {!own && <Lock size={20} className="absolute left-1/2 top-[42%] -translate-x-1/2 text-white/60" />}
                      {m.rarity === "legend" && own && <span className="shine absolute inset-0" />}
                      <span className="absolute left-1.5 top-1.5 rounded-[7px] px-1.5 py-[1px] font-display text-[7.5px] font-black uppercase italic tracking-wider"
                        style={{ background: `linear-gradient(180deg,${r.c1},${r.c2})`, color: "#0a1735", boxShadow: "0 2px 5px rgba(0,0,0,.4)" }}>{r.label}</span>
                    </div>
                    <div className="px-2 pb-2 pt-0.5">
                      <div className="truncate font-display text-[12px] font-black leading-tight text-white">{own ? m.name : "? ? ?"}</div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="flex items-center gap-[3px] font-num text-[10px] font-semibold text-coral"><Heart s={11} />{own ? m.hp : "—"}</span>
                        <span className="flex items-center gap-[3px] font-num text-[10px] font-semibold text-gold"><Sword s={11} />{own ? m.atk : "—"}</span>
                        {own && <span className="ml-auto flex">{[0, 1, 2].map((s) => <Star key={s} s={9} on={s < (m.rarity === "legend" ? 3 : m.rarity === "epic" ? 2 : 1)} />)}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              </Tilt>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════ SHOP ════════════════ */
const ACC: Record<ShopItem["accent"], [string, string]> = {
  teal: ["#35f7d2", "#0bb7d8"], gold: ["#ffe884", "#ff9b1f"], grape: ["#bb9bff", "#7a3ef0"],
  pink: ["#ff8fb6", "#f0316f"], mint: ["#8bffbd", "#17c46b"],
};

export function ShopScreen({ onBuy }: { onBuy?: (i: ShopItem) => void }) {
  return (
    <div className="no-sb flex-1 overflow-y-auto px-3 pb-3 pt-1">
      <div className="flex items-end justify-between px-1">
        <h2 className="hd text-[23px] uppercase leading-none">Магазин</h2>
        <span className="pnl-soft flex items-center gap-1 rounded-full px-2 py-1 font-num text-[9.5px] font-semibold text-sky/70">
          <Clock size={10} className="text-teal" /> 14:32:07
        </span>
      </div>

      <motion.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="frame shine mt-2.5" style={{ background: "linear-gradient(140deg,#ffe884,#ff4d8d 52%,#7a3ef0)", boxShadow: "0 14px 32px -12px rgba(255,77,141,.55)" }}>
        <div className="relative flex items-center gap-2 overflow-hidden rounded-[19px] px-3 py-2.5"
          style={{ background: "linear-gradient(150deg,#2a1552,#0c1a3c)" }}>
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-pink/30 blur-3xl" />
          <Sparkles n={5} />
          <div className="a-f1 relative shrink-0">
            <div className="absolute inset-[-10%] rounded-full bg-gold/30 blur-2xl" />
            <Art src={ART.chimera} alt="" className="relative h-[96px] w-[96px]" />
          </div>
          <div className="relative min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-coral/25 px-2 py-[2px] font-num text-[9px] font-semibold uppercase tracking-wide text-coral"
              style={{ boxShadow: "inset 0 0 0 1px rgba(255,92,110,.45)" }}><Clock size={9} /> 23ч 59м</span>
            <div className="hd hd-thin mt-1 text-[16px] leading-tight">Сундук Химеры</div>
            <div className="font-body text-[10.5px] font-bold leading-snug text-sky/70">Гарантированный легендарный монстра</div>
            <div className="mt-1.5 flex items-center gap-2">
              <Btn color="gold" size="sm">649 ₽</Btn>
              <span className="font-num text-[11px] font-medium text-sky/45 line-through">1 290 ₽</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mb-1.5 mt-3 flex items-center gap-1.5 px-1">
        <span className="h-[3px] w-4 rounded-full bg-teal" />
        <span className="font-display text-[12px] font-black uppercase italic tracking-wide text-white/90">Пакеты рынка</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {SHOP.map((it, i) => {
          const [c1, c2] = ACC[it.accent];
          return (
            <motion.button key={it.id} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 + i * 0.04 }}
              whileTap={{ scale: 0.95 }} onClick={() => onBuy?.(it)}
              className="pnl-soft relative flex flex-col items-center rounded-[18px] px-2 pb-2 pt-3.5">
              {it.tag && <Badge color={it.tag === "ХИТ" ? "#ff4d8d" : "#17c46b"}>{it.tag}</Badge>}
              <span className="relative mb-1 grid h-14 w-16 place-items-center rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 40%, ${c1}30, transparent 72%)` }}>
                <Stack kind={it.kind} c1={c1} />
              </span>
              <span className="font-num text-[13px] font-bold leading-none" style={{ color: c1 }}>{it.amount}</span>
              <span className="mt-1 text-center font-display text-[10px] font-bold leading-tight text-white/80">{it.title}</span>
              {it.old && <span className="font-num text-[9px] font-medium text-sky/40 line-through">{it.old}</span>}
              <span className="mt-1.5 w-full rounded-[11px] py-[5px] text-center font-display text-[11.5px] font-black italic text-[#0a1735]"
                style={{ background: `linear-gradient(177deg, ${c1}, ${c2})`, boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.6), inset 0 -3px 0 rgba(0,0,0,.25), 0 4px 10px -3px rgba(0,0,0,.6)" }}>
                {it.price}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Stack({ kind, c1 }: { kind: ShopItem["kind"]; c1: string }) {
  if (kind === "coins") return (
    <span className="relative block h-10 w-12">
      <span className="absolute left-0 top-3"><Coin s={26} /></span>
      <span className="absolute right-0 top-3"><Coin s={26} /></span>
      <span className="absolute left-3 top-0"><Coin s={30} /></span>
    </span>
  );
  if (kind === "gems") return (
    <span className="relative block h-10 w-12">
      <span className="absolute left-0 top-3.5"><Gem s={22} /></span>
      <span className="absolute right-0 top-4"><Gem s={20} /></span>
      <span className="absolute left-[10px] top-0"><Gem s={30} /></span>
    </span>
  );
  if (kind === "energy") return (
    <span className="relative grid h-10 w-12 place-items-center">
      <span className="absolute inset-0 rounded-full blur-lg" style={{ background: `${c1}55` }} />
      <Bolt s={38} />
    </span>
  );
  return (
    <span className="relative block h-10 w-12">
      <span className="absolute left-0 top-4"><Coin s={22} /></span>
      <span className="absolute right-0 top-4"><Gem s={22} /></span>
      <span className="absolute left-[13px] top-0"><ChestIco open={false} /></span>
    </span>
  );
}
export const ArtIcon = ART;
