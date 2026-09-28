import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useId, useRef, useState } from "react";
import arena from "../assets/arena.jpg";
import enemy from "../assets/enemy.jpg";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, STAGGER } from "../motion/tokens";
import { getSound, sfx } from "../motion/audio";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   04 · SHARED ELEMENT MORPH — карточка становится экраном
   ================================================================ */
const SCEN = [
  { t: "Боковик", s: "Рынок в диапазоне", c: "#4cc3ff", icon: I.bars, seed: 3, drift: 0 },
  { t: "Пробой уровня", s: "Ложный и истинный пробой", c: "#9b7bff", icon: I.trend, seed: 11, drift: 0.2 },
  { t: "Новостной шок", s: "Резкие движения", c: "#ff4d5e", icon: I.bolt, seed: 21, drift: -0.2 },
];

export function SharedMorph({ run, cue }: SceneProps) {
  const uid = useId();
  const [open, setOpen] = useState<number | null>(null);
  useScript(run, async (wait) => {
    setOpen(null);
    await wait(700);
    cue();
    setOpen(1);
    await wait(2900);
    setOpen(null);
  });
  return (
    <div className="absolute inset-0">
      <SceneBg tint="#9b7bff" />
      <motion.div
        animate={{ scale: open !== null ? 0.92 : 1, opacity: open !== null ? 0.35 : 1, filter: open !== null ? "blur(3px)" : "blur(0px)" }}
        transition={{ duration: 0.45, ease: EASE.outExpo }}
        className="absolute inset-x-4 top-12"
      >
        <div className="font-display text-xl font-bold">Тренировка</div>
        <div className="mt-1 text-xs text-white/50">Выбор сценария</div>
        <div className="mt-5 space-y-3">
          {SCEN.map((s, i) => (
            <motion.button
              key={i}
              layoutId={`${uid}card${i}`}
              onClick={() => setOpen(i)}
              whileTap={{ scale: 0.97 }}
              transition={SPRING.panel}
              className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-left"
              style={{ borderRadius: 16 }}
            >
              <motion.div layoutId={`${uid}icon${i}`} transition={SPRING.panel} className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${s.c}22`, color: s.c }}>
                <s.icon size={22} />
              </motion.div>
              <div className="flex-1">
                <motion.div layoutId={`${uid}title${i}`} transition={SPRING.panel} className="text-sm font-bold">{s.t}</motion.div>
                <div className="text-[11px] text-white/50">{s.s}</div>
              </div>
              <I.arrowR size={16} className="text-white/30" />
            </motion.button>
          ))}
        </div>
      </motion.div>
      <AnimatePresence>
        {open !== null && (
          <motion.div
            key="sheet"
            layoutId={`${uid}card${open}`}
            transition={SPRING.panel}
            className="absolute inset-0 z-20 overflow-hidden bg-[#0c1428]"
            style={{ borderRadius: 40 }}
          >
            <div className="absolute inset-0" style={{ background: `radial-gradient(100% 50% at 50% 0%, ${SCEN[open].c}33, transparent)` }} />
            <div className="relative px-5 pt-12">
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.15, ...SPRING.tap }}
                onClick={() => setOpen(null)}
                className="glass grid h-9 w-9 place-items-center rounded-full"
              >
                <I.arrowL size={16} />
              </motion.button>
              <div className="mt-4 flex items-center gap-4">
                <motion.div layoutId={`${uid}icon${open}`} transition={SPRING.panel} className="grid h-20 w-20 place-items-center rounded-3xl" style={{ background: `${SCEN[open].c}22`, color: SCEN[open].c, boxShadow: `0 0 40px ${SCEN[open].c}44` }}>
                  {(() => { const Ic = SCEN[open].icon; return <Ic size={38} />; })()}
                </motion.div>
                <div>
                  <motion.div layoutId={`${uid}title${open}`} transition={SPRING.panel} className="font-display text-xl font-bold">{SCEN[open].t}</motion.div>
                  <div className="mt-1 flex gap-1">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <motion.svg key={j} width="14" height="14" viewBox="0 0 24 24" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3 + j * 0.06, ...SPRING.reward }}>
                        <path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" fill={j < 3 ? "#ffc34d" : "#ffffff22"} />
                      </motion.svg>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20, transition: { duration: 0.12 } }} transition={{ delay: 0.2, ...SPRING.panel }} className="glass mt-5 rounded-2xl p-3">
                <div className="mb-1 text-[10px] font-bold text-white/40">BTC/USDT · 15M</div>
                <Candles data={genCandles(22, SCEN[open].seed, SCEN[open].drift)} w={236} h={120} delay={0.3} step={0.025} />
              </motion.div>
              {["Определи направление", "Найди уровень", "Оцени риск"].map((l, j) => (
                <motion.div
                  key={j}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  transition={{ delay: 0.35 + j * STAGGER.loose, ...SPRING.panel }}
                  className="mt-2 flex items-center gap-2 text-xs text-white/70"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold" style={{ background: `${SCEN[open].c}33`, color: SCEN[open].c }}>{j + 1}</span>
                  {l}
                </motion.div>
              ))}
              <motion.button
                initial={{ y: 80 }}
                animate={{ y: 0 }}
                exit={{ y: 120, transition: { duration: 0.15 } }}
                transition={{ delay: 0.45, ...SPRING.panel }}
                className="mt-5 w-full rounded-2xl py-3 font-display text-sm font-bold text-[#04121a]"
                style={{ background: SCEN[open].c, boxShadow: `0 10px 30px -6px ${SCEN[open].c}` }}
              >
                ИГРАТЬ
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   05 · PORTAL DIVE — камера прыгает сквозь интерфейс
   ================================================================ */
export function PortalDive({ run, cue }: SceneProps) {
  const [st, setSt] = useState<"hub" | "charge" | "dive" | "arena">("hub");
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const p = useParticles();
  const [go, setGo] = useState(0);

  const enter = () => setGo((g) => g + 1);

  useScript(go, async (wait) => {
    if (go === 0) return;
    cue();
    setSt("charge");
    if (getSound()) sfx.charge(0.26);
    const c = centerIn(btn.current, root.current);
    p.burst({ x: c.x, y: c.y, count: 30, speed: [30, 90], life: [0.4, 0.7], shape: "dot", colors: ["#ffc34d", "#fff"], target: c });
    await wait(260);
    setSt("dive");
    if (getSound()) sfx.fly();
    p.ring(c.x, c.y, "#ffc34d", 260, 0.7, 8);
    await wait(750);
    setSt("arena");
  }, [go]);

  useScript(run, async (wait) => {
    setSt("hub");
    await wait(800);
    enter();
  });

  const hubOut = st === "dive" || st === "arena";
  const items = [
    { y: 56, h: 36, x: -1 },
    { y: 108, h: 150, x: 0 },
    { y: 272, h: 70, x: 1 },
    { y: 356, h: 70, x: -1 },
  ];
  return (
    <div ref={root} className="absolute inset-0 overflow-hidden bg-[#050811]">
      {/* hub layer */}
      <motion.div className="absolute inset-0" animate={{ scale: hubOut ? 2.6 : 1, opacity: hubOut ? 0 : 1, filter: hubOut ? "blur(10px)" : "blur(0px)" }} transition={{ duration: hubOut ? 0.7 : 0.5, ease: hubOut ? EASE.inQuart : EASE.outExpo }} style={{ transformOrigin: "50% 78%" }}>
        <SceneBg tint="#ffc34d" />
        {items.map((it, i) => (
          <motion.div
            key={i}
            className="glass absolute inset-x-4 rounded-2xl"
            style={{ top: it.y, height: it.h }}
            animate={hubOut ? { x: it.x * 160, y: (it.y - 480) * 0.4, rotate: it.x * 8 } : { x: 0, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: EASE.inQuart }}
          >
            {i === 1 && (
              <div className="flex h-full items-center justify-center">
                <Candles data={genCandles(18, 5)} w={220} h={100} grow={false} />
              </div>
            )}
          </motion.div>
        ))}
        <motion.button
          ref={btn}
          onClick={enter}
          animate={st === "charge" ? { scale: 0.88 } : { scale: 1 }}
          transition={st === "charge" ? { duration: 0.24, ease: EASE.anticipate } : SPRING.tap}
          className="absolute inset-x-8 bottom-24 overflow-hidden rounded-2xl bg-gradient-to-b from-[#ffd76a] to-[#e8a121] py-4 font-display text-sm font-black text-[#3a2200] shadow-[0_6px_0_#9a5f00,0_0_40px_-4px_#ffc34d]"
        >
          <span className="relative z-10">ВОЙТИ В АРЕНУ</span>
          <motion.span className="absolute inset-0 bg-white" animate={{ opacity: st === "charge" ? [0, 0.6] : 0 }} transition={{ duration: 0.25 }} />
        </motion.button>
      </motion.div>
      {/* tunnel */}
      <AnimatePresence>
        {st === "dive" && (
          <motion.div key="tun" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-[78%] h-40 w-40 -ml-20 -mt-20 rounded-full border-2"
                style={{ borderColor: i % 2 ? "#ffc34d" : "#2ee6c5", boxShadow: `0 0 30px ${i % 2 ? "#ffc34d" : "#2ee6c5"}` }}
                initial={{ scale: 0, opacity: 0, top: "78%" }}
                animate={{ scale: 6, opacity: [0, 1, 0], top: "40%" }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: EASE.inQuart }}
              />
            ))}
            <svg viewBox="-150 -150 300 300" className="absolute inset-0 h-full w-full">
              {Array.from({ length: 36 }).map((_, i) => {
                const a = (i / 36) * Math.PI * 2;
                return (
                  <motion.line
                    key={i}
                    x1={Math.cos(a) * 40}
                    y1={Math.sin(a) * 40}
                    x2={Math.cos(a) * 260}
                    y2={Math.sin(a) * 260}
                    stroke="#fff"
                    strokeWidth={i % 3 ? 0.6 : 1.4}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 0.6, 0], pathOffset: [0, 0.3, 1], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.6, delay: (i % 5) * 0.03 }}
                  />
                );
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      {/* arena layer */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={st === "arena" ? { scale: 1, opacity: 1, filter: "blur(0px)" } : { scale: 0.4, opacity: 0, filter: "blur(16px)" }}
        transition={st === "arena" ? { type: "spring", stiffness: 140, damping: 18 } : { duration: 0 }}
      >
        <img src={arena} className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060a16] via-[#060a16]/20 to-[#060a16]/60" />
        <motion.img
          src={enemy}
          className="mask-soft absolute left-1/2 top-20 h-56 w-56 -ml-28 object-cover"
          initial={false}
          animate={st === "arena" ? { y: 0, scale: 1 } : { y: 60, scale: 0.6 }}
          transition={{ delay: 0.2, ...SPRING.heavy }}
        />
        <motion.div initial={false} animate={st === "arena" ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ delay: 0.35, ...SPRING.panel }} className="absolute inset-x-5 top-[310px] text-center">
          <div className="text-[10px] font-bold uppercase tracking-[.3em] text-bear">Босс сценария</div>
          <div className="font-display text-2xl font-black">FOMO</div>
        </motion.div>
        <motion.button
          onClick={() => setSt("hub")}
          initial={false}
          animate={st === "arena" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ delay: 0.5, ...SPRING.tap }}
          className="glass absolute bottom-10 left-1/2 -ml-16 w-32 rounded-full py-2 text-xs font-bold"
        >
          Вернуться
        </motion.button>
      </motion.div>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   06 · LIQUID TABS — индикатор-капля + направленная навигация
   ================================================================ */
const TABS = [
  { t: "Академия", icon: I.cap, c: "#4cc3ff" },
  { t: "Арена", icon: I.swords, c: "#2ee6c5" },
  { t: "Коллекция", icon: I.cards, c: "#9b7bff" },
  { t: "Рейтинг", icon: I.trophy, c: "#ffc34d" },
];
const TW = 70;

export function LiquidTabs({ run, cue }: SceneProps) {
  const [tab, setTab] = useState(1);
  const [dir, setDir] = useState(1);
  const left = useMotionValue(TW * 1 + 8);
  const right = useMotionValue(TW * 2 - 8);
  const width = useTransform([left, right], ([l, r]: number[]) => r - l);
  const stretch = useTransform(width, (w) => Math.max(0.6, Math.min(1, (TW - 16) / w)));

  const go = (n: number) => {
    if (n === tab) return;
    const d = n > tab ? 1 : -1;
    setDir(d);
    setTab(n);
    const L = n * TW + 8, R = (n + 1) * TW - 8;
    // СЕКРЕТ: ведущий край — жёсткая пружина, хвост — мягкая → «капля» тянется
    if (getSound()) sfx.whoosh(d > 0 ? 1 : -1);
    const fast = { type: "spring", stiffness: 520, damping: 34 } as const;
    const slow = { type: "spring", stiffness: 170, damping: 22 } as const;
    animate(right, R, d > 0 ? fast : slow);
    animate(left, L, d > 0 ? slow : fast);
  };
  useScript(run, async (wait) => {
    cue();
    for (const n of [2, 3, 0, 1]) {
      await wait(900);
      go(n);
    }
  });
  const T = TABS[tab];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={T.c} />
      <div className="absolute inset-x-0 top-10 bottom-24 overflow-hidden">
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.div
            key={tab}
            custom={dir}
            variants={{
              in: (d: number) => ({ x: d * 120, opacity: 0, scale: 0.96 }),
              c: { x: 0, opacity: 1, scale: 1 },
              out: (d: number) => ({ x: d * -80, opacity: 0, scale: 0.96 }),
            }}
            initial="in"
            animate="c"
            exit="out"
            transition={SPRING.panel}
            className="absolute inset-x-4 top-4"
          >
            <div className="font-display text-2xl font-bold" style={{ color: T.c }}>{T.t}</div>
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * STAGGER.base, ...SPRING.panel }}
                  className="glass flex items-center gap-3 rounded-2xl p-3"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${T.c}1f`, color: T.c }}>
                    <T.icon size={18} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 rounded bg-white/25" style={{ width: `${70 - i * 7}%` }} />
                    <div className="h-2 rounded bg-white/10" style={{ width: `${45 + i * 5}%` }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="glass absolute bottom-4 left-[10px] h-16 rounded-2xl" style={{ width: TW * 4 }}>
        <motion.div
          className="absolute top-2 h-12 rounded-xl"
          style={{ left, width, background: `${T.c}26`, boxShadow: `inset 0 0 0 1px ${T.c}66, 0 0 22px ${T.c}44`, scaleY: stretch }}
        />
        <div className="relative flex h-full">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => go(i)} className="flex flex-col items-center justify-center gap-1" style={{ width: TW }}>
              <motion.span animate={tab === i ? { y: [0, -6, 0], scale: [1, 1.25, 1.1] } : { y: 0, scale: 1 }} transition={{ duration: 0.45, ease: EASE.outExpo }} style={{ color: tab === i ? t.c : "#ffffff66" }}>
                <t.icon size={20} />
              </motion.span>
              <span className="text-[9px] font-bold" style={{ color: tab === i ? t.c : "#ffffff55" }}>{t.t}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
