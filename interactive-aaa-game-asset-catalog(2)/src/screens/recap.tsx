import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone } from "../ui/kit";
import { S, E, feel, useCount, Particles } from "../lib/motion";
import { IcTrophy, IcFlame, IcTarget, IcCrown, IcStar, IcArrow, IcClock, IcTrend, ArtCard } from "../ui/icons";

/* =====================================================================
   АССЕТ · SEASON RECAP — итоги сезона в формате stories.
   5 слайдов, у каждого свой фон, своя «герой-цифра» и свой приём:
   счётчик, рост графика, веер карт, серия, финальная открытка.
   ===================================================================== */
const SLIDE_MS = 3600;
const SLIDES = [
  { id: "games", tone: "#3ec9a7", bg: "#0f2c2a" },
  { id: "rating", tone: "#5b9cd6", bg: "#122238" },
  { id: "card", tone: "#f2c14e", bg: "#2e2412" },
  { id: "streak", tone: "#e46a5f", bg: "#2e1618" },
  { id: "final", tone: "#9d8cf5", bg: "#1f1a3a" },
];

export function SeasonRecap({ live = true }: { live?: boolean }) {
  const [i, setI] = useState(live ? 0 : 4);
  const [t, setT] = useState(0);
  const [hold, setHold] = useState(false);
  const burst = useRef<any>(null);
  const sl = SLIDES[i];

  const go = (d: number) => { setI((v) => (v + d + SLIDES.length) % SLIDES.length); setT(0); feel("tap", 6); };

  useEffect(() => {
    if (!live || hold) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      setT((v) => {
        if (v + dt >= SLIDE_MS) { setI((k) => (k + 1) % SLIDES.length); return 0; }
        return v + dt;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live, hold]);

  useEffect(() => {
    if (sl.id === "final") { feel("reward"); setTimeout(() => burst.current?.(160, 300, { n: 60, power: 12, square: true }), 250); }
  }, [i]);

  return (
    <Phone live={false}>
      <div className="relative h-full overflow-hidden"
        onPointerDown={() => setHold(true)} onPointerUp={() => setHold(false)} onPointerLeave={() => setHold(false)}>
        {/* фон перетекает между слайдами */}
        <motion.div className="absolute inset-0" animate={{ background: `radial-gradient(90% 60% at 50% 30%, ${sl.tone}55, ${sl.bg} 70%)` }} transition={{ duration: 0.7, ease: E.out }} />
        <div className="mesh absolute inset-0 opacity-40" />
        <Particles api={burst} />

        {/* прогресс-полосы stories */}
        <div className="absolute inset-x-3 top-9 z-20 flex gap-1">
          {SLIDES.map((s, k) => (
            <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: k < i ? "100%" : k === i ? `${(t / SLIDE_MS) * 100}%` : "0%" }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-4 top-14 z-20 flex items-center justify-between">
          <span className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-white/70">Сезон 1 · итоги</span>
          {hold && <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/60">пауза</span>}
        </div>

        {/* тап-зоны */}
        <button aria-label="назад" onClick={() => go(-1)} className="absolute inset-y-0 left-0 z-10 w-1/3" />
        <button aria-label="вперёд" onClick={() => go(1)} className="absolute inset-y-0 right-0 z-10 w-2/3" />

        <div className="absolute inset-0 flex items-center justify-center px-6 pt-10">
          <AnimatePresence mode="wait">
            <motion.div key={sl.id} className="w-full text-center"
              initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -24, scale: 1.04, filter: "blur(8px)" }}
              transition={{ ...S.soft, damping: 24 }}>
              {sl.id === "games" && <SlideGames />}
              {sl.id === "rating" && <SlideRating />}
              {sl.id === "card" && <SlideCard />}
              {sl.id === "streak" && <SlideStreak />}
              {sl.id === "final" && <SlideFinal />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Phone>
  );
}

function Kicker({ children, tone }: { children: any; tone: string }) {
  return <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[10px] font-extrabold uppercase tracking-[0.35em]" style={{ color: tone }}>{children}</motion.div>;
}

function SlideGames() {
  const n = useCount(142, 1.4);
  const w = useCount(89, 1.6);
  return (
    <div>
      <Kicker tone="#3ec9a7">ты сыграл</Kicker>
      <div className="mono mt-2 text-[92px] font-extrabold leading-none tabular-nums" style={{ textShadow: "0 0 40px rgba(62,201,167,.5)" }}>{Math.round(n)}</div>
      <div className="title-xl text-[22px] uppercase">боёв</div>
      <div className="mt-6 flex justify-center gap-3">
        {[{ l: "побед", v: Math.round(w), c: "#3ec9a7" }, { l: "винрейт", v: "63%", c: "#f2c14e" }].map((s, k) => (
          <motion.div key={s.l} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.pop, delay: 0.5 + k * 0.1 }}
            className="rounded-2xl bg-black/25 px-4 py-2.5">
            <div className="mono text-[20px] font-extrabold" style={{ color: s.c }}>{s.v}</div>
            <div className="text-[8.5px] font-extrabold uppercase tracking-widest text-white/60">{s.l}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlideRating() {
  const pts = [18, 22, 20, 30, 28, 38, 44, 41, 52, 60, 58, 72];
  const d = pts.map((p, k) => `${k ? "L" : "M"}${k * 22},${96 - p}`).join(" ");
  const r = useCount(4480, 1.6);
  return (
    <div>
      <Kicker tone="#5b9cd6">рейтинг вырос на</Kicker>
      <div className="mono mt-2 flex items-center justify-center gap-2 text-[56px] font-extrabold leading-none">
        <span className="text-teal"><IcTrend size={40} /></span>+1 240
      </div>
      <div className="mx-auto mt-5 w-[250px] rounded-2xl bg-black/25 p-3">
        <svg viewBox="0 0 244 100" className="w-full">
          <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5b9cd6" stopOpacity=".5" /><stop offset="1" stopColor="#5b9cd6" stopOpacity="0" /></linearGradient></defs>
          <motion.path d={`${d} L242,100 L0,100 Z`} fill="url(#rg)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} />
          <motion.path d={d} fill="none" stroke="#5b9cd6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: E.out, delay: 0.2 }} />
          <motion.circle cx={242} cy={96 - 72} r="5" fill="#fff" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 1.4 }} />
        </svg>
        <div className="mono mt-1 flex justify-between text-[9px] font-bold text-white/60"><span>3 240</span><span className="text-white">{Math.round(r)}</span></div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-3 text-[11px] font-bold text-white/70">из Серебра II — в Золото III</motion.div>
    </div>
  );
}

function SlideCard() {
  return (
    <div>
      <Kicker tone="#f2c14e">карта сезона</Kicker>
      <div className="relative mx-auto mt-4 h-[200px] w-[200px]">
        {[-1, 1].map((k) => (
          <motion.div key={k} className="absolute left-1/2 top-4" style={{ marginLeft: -45 }}
            initial={{ rotate: 0, x: 0, opacity: 0 }} animate={{ rotate: k * 16, x: k * 46, opacity: 0.55 }} transition={{ ...S.pop, delay: 0.3 }}>
            <ArtCard w={90} seed={k > 0 ? 5 : 7} rarity={k > 0 ? "epic" : "rare"} />
          </motion.div>
        ))}
        <motion.div className="absolute left-1/2 top-0 z-10" style={{ marginLeft: -60 }}
          initial={{ y: 60, scale: 0.4, rotateY: 180 }} animate={{ y: 0, scale: 1, rotateY: 0 }} transition={{ ...S.pop, delay: 0.1 }}>
          <ArtCard w={120} seed={11} rarity="legend" label="КИТ" />
          <motion.span className="absolute -inset-4 -z-10 rounded-3xl bg-gold/40 blur-2xl" animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.div>
      </div>
      <div className="title-xl mt-2 text-[20px] uppercase">«Кит» · 37 побед</div>
      <div className="mt-1 text-[11px] font-bold text-white/70">самая результативная карта в твоей колоде</div>
    </div>
  );
}

function SlideStreak() {
  const days = Array.from({ length: 28 }, (_, k) => k % 9 !== 7 && k !== 3);
  return (
    <div>
      <Kicker tone="#e46a5f">лучшая серия</Kicker>
      <div className="mt-2 flex items-center justify-center gap-2">
        <motion.span animate={{ scale: [1, 1.15, 1], rotate: [0, -6, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-coral"><IcFlame size={46} /></motion.span>
        <span className="mono text-[72px] font-extrabold leading-none">19</span>
      </div>
      <div className="title-xl text-[20px] uppercase">дней подряд</div>
      <div className="mx-auto mt-5 grid w-[224px] grid-cols-7 gap-1.5">
        {days.map((on, k) => (
          <motion.span key={k} className="aspect-square rounded-md" style={{ background: on ? "#e46a5f" : "rgba(255,255,255,.12)" }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 0.2 + (Math.floor(k / 7) + (k % 7)) * 0.035 }} />
        ))}
      </div>
    </div>
  );
}

function SlideFinal() {
  return (
    <div>
      <Kicker tone="#9d8cf5">твой титул сезона</Kicker>
      <motion.div initial={{ scale: 0.3, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...S.pop, damping: 12 }}
        className="relative mx-auto mt-4 grid h-28 w-28 place-items-center rounded-[28px]"
        style={{ background: "linear-gradient(160deg,#b8a9ff,#5b4fd6)", boxShadow: "0 20px 50px -14px #9d8cf5" }}>
        <IcCrown size={54} />
        <motion.span className="absolute inset-0 rounded-[28px] border-2 border-white/60 ring-out" />
      </motion.div>
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="title-xl mt-4 text-[26px] uppercase">Охотник за трендом</motion.div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[{ I: IcTrophy, v: "89", l: "побед" }, { I: IcTarget, v: "63%", l: "точность" }, { I: IcClock, v: "3.1с", l: "отклик" }].map((s, k) => (
          <motion.div key={s.l} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.pop, delay: 0.45 + k * 0.08 }} className="rounded-2xl bg-black/25 py-2.5">
            <div className="grid place-items-center text-purple"><s.I size={16} /></div>
            <div className="mono mt-1 text-[14px] font-extrabold">{s.v}</div>
            <div className="text-[8px] font-extrabold uppercase tracking-widest text-white/60">{s.l}</div>
          </motion.div>
        ))}
      </div>
      <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.75, ...S.pop }}
        className="relative z-20 mx-auto mt-5 flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-[12px] font-extrabold uppercase tracking-wide text-[#1f1a3a]">
        <IcStar size={14} /> поделиться <IcArrow size={14} />
      </motion.button>
    </div>
  );
}
