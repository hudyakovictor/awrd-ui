import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Award, Flame, Gem, Heart, Play, Sparkles, TrendingDown, TrendingUp, Trophy, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { Magnetic, ParticleField, Tilt, Typewriter } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { StatPill } from "../components/ui";
import { fmtCompact, useCountUp, useMarket } from "../lib/sim";

export default function Hero({ xp, setXp, gems }: { xp: number; setXp: (n: number) => void; gems: number }) {
  const { coins } = useMarket(true, 1600);
  const [side, setSide] = useState<"long" | "short" | null>(null);
  const [phoneXp, setPhoneXp] = useState(64);
  const total = useCountUp(148, 1400);
  const animatedXp = useCountUp(xp, 800, [xp]);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 100, damping: 22 });
  const titleY = useTransform(sp, [0, 1], [0, 160]);
  const titleO = useTransform(sp, [0, 0.8], [1, 0]);
  const phoneY = useTransform(sp, [0, 1], [0, -120]);
  const phoneR = useTransform(sp, [0, 1], [0, -10]);
  const phoneS = useTransform(sp, [0, 1], [1, 0.85]);
  const gridY = useTransform(sp, [0, 1], [0, 200]);

  return (
    <header ref={heroRef} className="relative overflow-hidden">
      <motion.div style={{ y: gridY }} className="grid-texture pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 opacity-60"><ParticleField count={55} /></div>
      {/* ticker */}
      <div className="relative z-10 border-b border-white/10 bg-[#060d24]/80 backdrop-blur">
        <div className="flex overflow-hidden py-2">
          <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
            {[...coins, ...coins].map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black" style={{ background: `${c.color}22`, color: c.color, border: `1px solid ${c.color}55` }}>{c.icon}</span>
                <span className="font-bold text-white">{c.sym}</span>
                <span className="num-mono text-[#9fb2dd]">${fmtCompact(c.price)}</span>
                <span className={`num-mono font-bold ${c.chg >= 0 ? "text-[#2ede8a]" : "text-[#ff5470]"}`}>{c.chg >= 0 ? "+" : ""}{c.chg.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] gap-10 px-4 sm:px-6 lg:px-8 pt-10 pb-6 lg:grid-cols-[1.15fr_.85fr] lg:pt-16">
        <motion.div style={{ y: titleY, opacity: titleO }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex flex-wrap items-center gap-2">
            <span className="chip-3d bg-[#8ef23c]/15 px-3 py-1.5 text-[#a4ff5e] border border-[#8ef23c]/30 text-[11px] font-extrabold uppercase tracking-widest">◆ Unified Asset Catalog v3.0</span>
            <span className="chip-3d bg-white/5 px-3 py-1.5 text-[#9fb2dd] text-[11px] font-bold uppercase tracking-widest">Award-winning · Mobile-first</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}
            className="display text-[38px] sm:text-[56px] lg:text-[64px] font-extrabold leading-[0.98] tracking-tight text-white">
            TRADE<span className="bg-gradient-to-b from-[#b6ff7d] to-[#5cbf1c] bg-clip-text text-transparent text-glow-green">LINGO</span>
            <br />
            <span className="bg-gradient-to-r from-[#9db9ff] via-white to-[#9db9ff] bg-clip-text text-transparent">Tactile System</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#aebdе6] text-[#aebde6]">
            Единый каталог объёмных ассетов для крипто-игры в духе Duolingo — но взрослый.
            Тёмно-синий фон, толстые 3D-кнопки, живые свечи, путь уроков, лиги и награды.
            Каждый блок ниже — <b className="text-white">интерактивный</b>: нажимай, тяни, свайпай, крути.
          </motion.p>
          <p className="display mt-3 text-lg font-extrabold text-white">Учись <Typewriter words={["свечам", "плечу", "стоп-лоссам", "DeFi", "психологии", "побеждать"]} className="text-[#8ef23c]" /></p>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-7 flex flex-wrap gap-3">
            <Magnetic><a href="#trading" onClick={() => sfx.whoosh()} className="btn3d btn3d-green px-7 py-4 text-sm"><Play size={17} strokeWidth={2.8} /> Открыть Trading Lab</a></Magnetic>
            <a href="#learn" className="btn3d btn3d-ghost px-7 py-4 text-sm"><Sparkles size={17} /> Путь уроков</a>
            <button onClick={() => { setXp(xp + 25); sfx.coin(); }} className="btn3d btn3d-gold px-6 py-4 text-sm"><Zap size={17} strokeWidth={2.8} /> +25 XP</button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35 }} className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill icon={<Trophy size={20} />} label="assets" value={String(Math.round(total))} tone="gold" />
            <StatPill icon={<Flame size={20} />} label="streak" value="12 дней" tone="red" />
            <StatPill icon={<Zap size={20} />} label="total xp" value={Math.round(animatedXp).toLocaleString()} tone="green" />
            <StatPill icon={<Gem size={20} />} label="gems" value={String(gems)} tone="blue" />
          </motion.div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: .2, type: "spring", stiffness: 60, damping: 16 }}
          className="relative mx-auto w-full max-w-[340px]">
          <motion.div style={{ y: phoneY, rotate: phoneR, scale: phoneS }}>
          <Tilt max={8} glare={false} scale={1.02}>
          <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-b from-[#5b8cff]/25 via-transparent to-[#8ef23c]/15 blur-2xl" />
          <div className="panel-3d relative overflow-hidden !rounded-[36px] p-3">
            <div className="overflow-hidden rounded-[26px] bg-gradient-to-b from-[#0e2152] to-[#070f2b]">
              <div className="flex items-center justify-between px-4 pt-4">
                <div className="flex items-center gap-1.5">
                  <Heart size={15} className="fill-[#ff5470] text-[#ff5470]" />
                  <span className="num-mono text-xs font-extrabold text-white">5</span>
                </div>
                <div className="h-2.5 w-28 overflow-hidden rounded-full bg-black/50 shadow-inner">
                  <motion.div className="h-full rounded-full bg-gradient-to-b from-[#b6ff7d] to-[#62c91d]" animate={{ width: `${phoneXp}%` }} />
                </div>
                <div className="flex items-center gap-1">
                  <Gem size={14} className="text-[#5b8cff]" />
                  <span className="num-mono text-xs font-extrabold text-white">240</span>
                </div>
              </div>
              <div className="anim-floaty mx-auto mt-2 h-36 w-36">
                <img src="/images/bull-mascot.png" alt="Bull mentor" className="h-full w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,.6)]" />
              </div>
              <div className="px-4 pb-2 text-center">
                <p className="display text-[15px] font-extrabold text-white">BTC пробьёт $100K?</p>
                <p className="text-[11px] text-[#8ea6d8]">Урок 4 · Поддержка и сопротивление</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 px-4 pb-3">
                <button onClick={() => { setSide("long"); setPhoneXp(Math.min(100, phoneXp + 6)); sfx.long(); }}
                  className={`btn3d py-3.5 text-xs ${side === "long" ? "btn3d-long" : "btn3d-ghost"} ${side === "long" ? "anim-pulse-ring" : ""}`}>
                  <TrendingUp size={16} strokeWidth={3} /> Long
                </button>
                <button onClick={() => { setSide("short"); setPhoneXp(Math.max(8, phoneXp - 4)); sfx.short(); }}
                  className={`btn3d py-3.5 text-xs ${side === "short" ? "btn3d-short" : "btn3d-ghost"}`}>
                  <TrendingDown size={16} strokeWidth={3} /> Short
                </button>
              </div>
              <div className="px-4 pb-4">
                <div className="panel-inset flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Award size={15} className="text-[#ffc531]" />
                    <span className="text-[11px] font-bold text-[#c9d8ff]">Combo ×3 · +18 XP</span>
                  </div>
                  <span className="num-mono text-[11px] font-extrabold text-[#8ef23c]">LIVE</span>
                </div>
              </div>
            </div>
          </div>
          </Tilt>
          </motion.div>
          <div className="absolute -right-4 top-16 hidden rotate-6 sm:block">
            <div className="panel-3d anim-breathe !rounded-2xl px-3 py-2 text-center">
              <p className="num-mono text-sm font-extrabold text-[#2ede8a]">+$248.10</p>
              <p className="text-[10px] font-bold text-[#8ea6d8]">PNL сегодня</p>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
