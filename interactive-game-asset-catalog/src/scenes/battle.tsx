import { animate, AnimatePresence, motion, useAnimate, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import enemy from "../assets/enemy.jpg";
import { Candles, genCandles, I } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, STAGGER, shakeKeys, sleep } from "../motion/tokens";
import { getSound, sfx } from "../motion/audio";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   07 · BATTLE IMPACT — замах → полёт → hit-stop → отдача
   ================================================================ */
const CARDS = [
  { n: "Тренд", icon: I.trend, c: "#2ee6c5", dmg: 280, cost: 2 },
  { n: "Объём", icon: I.bars, c: "#ffc34d", dmg: 420, cost: 3 },
  { n: "Риск", icon: I.shield, c: "#3ddc84", dmg: 190, cost: 1 },
];

export function BattleImpact({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const enemyRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const [hp, setHp] = useState(1000);
  const [ghost, setGhost] = useState(1000);
  const [flash, setFlash] = useState(false);
  const [dmg, setDmg] = useState<{ id: number; v: number; crit: boolean }[]>([]);
  const busy = useRef(false);
  const enemyX = useMotionValue(0);
  const enemyR = useTransform(enemyX, (v) => v * 0.4);

  const play = async (slot: number) => {
    if (busy.current) return;
    busy.current = true;
    cue();
    const el = cardEls.current[slot]!;
    const root = scope.current as HTMLElement;
    const c = centerIn(el, root);
    const e = centerIn(enemyRef.current, root);
    // 1. ANTICIPATION — карта приседает
    await animate(el, { y: 14, scale: 0.96 }, { duration: 0.1, ease: "easeOut" });
    // 2. LIFT — рывок вверх с перелётом
    await animate(el, { y: -50, scale: 1.25, rotate: 0 }, { duration: 0.2, ease: EASE.outExpo });
    // 3. FLIGHT — ускорение к цели + след
    const trail = window.setInterval(() => {
      const t = centerIn(el, root);
      p.burst({ x: t.x, y: t.y, count: 5, speed: [10, 60], colors: [CARDS[slot].c, "#fff"], shape: "dot", life: [0.25, 0.5], size: [2, 4] });
    }, 16);
    await animate(el, { x: e.x - c.x, y: e.y - c.y, rotate: 540, scale: 0.35 }, { duration: 0.3, ease: [0.55, 0, 0.9, 0.5] });
    clearInterval(trail);
    el.style.opacity = "0";
    // 4. HIT-STOP — мир замирает на 90мс, враг белый
    setFlash(true);
    await sleep(90);
    setFlash(false);
    // 5. IMPACT
    const crit = slot === 1;
    if (getSound()) (crit ? sfx.crit : sfx.impact)();
    const v = CARDS[slot].dmg;
    anim(root, shakeKeys(crit ? 1 : 0.7, 14, 13, 2.5), { duration: 0.45 });
    p.ring(e.x, e.y, "#ffffff", 150, 0.45, 12);
    p.ring(e.x, e.y, CARDS[slot].c, 110, 0.7, 4);
    p.burst({ x: e.x, y: e.y, count: crit ? 80 : 45, colors: [CARDS[slot].c, "#fff", "#ff4d5e"], speed: [250, 800], drag: 4 });
    animate(enemyX, [0, 22, 0], { duration: 0.5, ease: EASE.outExpo });
    setDmg((d) => [...d, { id: Date.now(), v, crit }]);
    setHp((h) => {
      const n = Math.max(0, h - v);
      window.setTimeout(() => setGhost(n), 450); // ghost bar догоняет
      return n;
    });
    // 6. DRAW — новая карта выезжает из колоды
    await sleep(350);
    await animate(el, { x: 0, y: 220, rotate: 0, scale: 1 }, { duration: 0 });
    el.style.opacity = "1";
    await animate(el, { y: 0 }, SPRING.reward);
    busy.current = false;
  };

  useScript(run, async (wait) => {
    setHp(1000);
    setGhost(1000);
    await wait(600);
    await play(1);
  });

  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#ff4d5e" />
      {/* enemy */}
      <div className="absolute inset-x-4 top-11">
        <div className="flex items-center gap-3">
          <div className="font-display text-sm font-bold">FOMO</div>
          <div className="text-[10px] font-bold text-bear">УР. 7</div>
          <div className="ml-auto font-mono text-[10px] tabular-nums text-white/60">{hp} / 1000</div>
        </div>
        <div className="relative mt-1.5 h-3 overflow-hidden rounded-full border border-white/10 bg-black/50">
          <motion.div className="absolute inset-y-0 left-0 bg-white/80" animate={{ width: `${ghost / 10}%` }} transition={{ duration: 0.6, ease: EASE.camera }} />
          <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#b3122a] to-bear shadow-[0_0_10px_#ff4d5e]" animate={{ width: `${hp / 10}%` }} transition={{ duration: 0.08 }} />
        </div>
      </div>
      <motion.div ref={enemyRef} className="absolute left-1/2 top-[84px] h-44 w-44 -ml-22" style={{ x: enemyX, rotate: enemyR, marginLeft: -88 }}>
        <motion.img
          src={enemy}
          className="mask-soft h-full w-full object-cover"
          animate={{ scale: [1, 1.035, 1], y: [0, -4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ filter: flash ? "brightness(4) saturate(0)" : "none" }}
        />
        <AnimatePresence>
          {dmg.map((d) => (
            <motion.div
              key={d.id}
              initial={{ scale: 2.6, opacity: 0, y: 0, rotate: -8 }}
              animate={{ scale: [2.6, 0.9, 1.05], opacity: 1, y: -30, rotate: 0 }}
              exit={{ opacity: 0, y: -70, scale: 0.8, transition: { duration: 0.5, ease: EASE.inQuart } }}
              transition={{ duration: 0.4, ease: EASE.overshoot }}
              onAnimationComplete={() => window.setTimeout(() => setDmg((x) => x.filter((y) => y.id !== d.id)), 450)}
              className="absolute left-1/2 top-8 -translate-x-1/2 text-center font-display font-black"
            >
              {d.crit && <div className="text-[10px] tracking-[.3em] text-gold">КРИТ</div>}
              <div className={d.crit ? "text-4xl text-gold" : "text-3xl text-white"} style={{ WebkitTextStroke: "1.5px #3a0010", textShadow: "0 4px 0 #3a0010, 0 0 20px #ff4d5e" }}>
                -{d.v}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {/* scenario */}
      <div className="glass absolute inset-x-4 top-[276px] rounded-2xl p-3">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-white/50">
          <span>СЦЕНАРИЙ · ПРОБОЙ БЕЗ ОБЪЁМА</span>
          <span className="text-teal">t0</span>
        </div>
        <Candles data={genCandles(20, 9, 0.1)} w={244} h={80} grow={false} highlight={19} />
      </div>
      {/* hand */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center">
        {CARDS.map((cd, i) => (
          <div key={i} className="-mx-2" style={{ transform: `rotate(${(i - 1) * 10}deg) translateY(${Math.abs(i - 1) * 12}px)`, zIndex: i === 1 ? 3 : 1 }}>
            <motion.div
              ref={(el) => { cardEls.current[i] = el; }}
              onClick={() => play(i)}
              whileHover={{ y: -16, scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-[140px] w-[96px] cursor-pointer rounded-2xl p-[3px]"
              style={{ background: `linear-gradient(160deg, ${cd.c}, #1a2440 60%, ${cd.c}88)`, boxShadow: `0 12px 30px -8px ${cd.c}88` }}
            >
              <div className="flex h-full flex-col items-center rounded-[13px] bg-gradient-to-b from-[#1d2b4f] to-[#0c1428] p-2">
                <div className="grid h-6 w-6 place-items-center self-start rounded-full bg-gradient-to-b from-[#6fd6ff] to-[#2365d9] font-display text-[11px] font-black shadow-[0_0_10px_#4cc3ff]">{cd.cost}</div>
                <div className="mt-1 grid h-12 w-12 place-items-center rounded-full border-2" style={{ borderColor: cd.c, color: cd.c, boxShadow: `0 0 16px ${cd.c}66, inset 0 0 12px ${cd.c}44` }}>
                  <cd.icon size={22} />
                </div>
                <div className="mt-auto w-full rounded-md bg-white py-1 text-center font-display text-[9px] font-black text-[#0c1428]">{cd.n.toUpperCase()}</div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-white" style={{ opacity: flash ? 0.12 : 0 }} />
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   08 · FOG OF FUTURE — решение до знания, раскрытие после
   ================================================================ */
const FUT = genCandles(28, 17, 0.12);
export function ChartDecision({ run, cue }: SceneProps) {
  const [vis, setVis] = useState(18);
  const [pick, setPick] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [verdict, setVerdict] = useState(false);
  const scan = useMotionValue(0);
  const W = 252;
  const t0 = (18 / 28) * W;
  const scanX = useTransform(scan, (v) => t0 + v * (W - t0));
  const fogClip = useTransform(scan, (v) => `inset(0 0 0 ${v * 100}%)`);

  const choose = async (i: number) => {
    if (pick !== null) return;
    cue();
    setPick(i);
    await sleep(500);
    setReveal(true);
    const unsub = scan.on("change", (v) => setVis(18 + Math.round(v * 10)));
    await animate(scan, 1, { duration: 1.4, ease: EASE.camera });
    unsub();
    setVerdict(true);
  };
  useScript(run, async (wait) => {
    setVis(18); setPick(null); setReveal(false); setVerdict(false); scan.set(0);
    await wait(1500);
    choose(1);
  });
  const opts = [
    { t: "Войти сразу", c: "#3ddc84", icon: I.arrowUp },
    { t: "Ждать ретест и объём", c: "#2ee6c5", icon: I.hourglass },
    { t: "Увеличить позицию", c: "#ff4d5e", icon: I.warn },
  ];
  return (
    <div className="absolute inset-0">
      <SceneBg />
      <div className="absolute inset-x-4 top-11 flex items-center gap-2 text-[11px] text-white/70">
        <div className="h-1.5 w-1.5 rounded-full bg-teal blink" /> Пробой без объёма. Объём молчит.
      </div>
      <div className="glass absolute inset-x-3 top-[72px] h-[210px] overflow-hidden rounded-2xl p-3">
        <div className="text-[10px] font-bold text-white/45">BTC/USDT · 15M</div>
        <div className="relative mt-2">
          <Candles data={FUT} w={W} h={160} visible={vis} step={0.03} highlight={17} />
          <div className="absolute inset-y-0 border-l border-dashed border-teal/70" style={{ left: t0 }}>
            <div className="absolute -left-3 -top-1 rounded bg-teal px-1 font-mono text-[9px] font-bold text-black">t0</div>
          </div>
          {/* fog */}
          <motion.div className="absolute inset-y-0 right-0 overflow-hidden rounded-r-lg" style={{ left: t0 + 2, clipPath: fogClip }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a2748]/95 to-[#0d1530]/95 backdrop-blur-md" />
            <motion.div className="absolute inset-0 opacity-50" style={{ background: "repeating-linear-gradient(115deg, transparent 0 10px, #2ee6c511 10px 12px)" }} animate={{ backgroundPositionX: ["0px", "40px"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
            <div className="absolute inset-0 grid place-items-center">
              <I.eye size={22} className="text-white/30" />
            </div>
          </motion.div>
          {reveal && <motion.div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_14px_4px_#2ee6c5]" style={{ x: scanX }} animate={{ opacity: verdict ? 0 : 1 }} />}
        </div>
      </div>
      <div className="absolute inset-x-3 top-[296px] space-y-2">
        {opts.map((o, i) => (
          <motion.button
            key={i}
            onClick={() => choose(i)}
            initial={{ x: 60, opacity: 0 }}
            animate={
              pick === null
                ? { x: 0, opacity: 1, scale: 1 }
                : pick === i
                  ? { x: 0, opacity: 1, scale: 1.03 }
                  : { x: 0, opacity: 0.25, scale: 0.94 }
            }
            transition={{ delay: pick === null ? 0.1 + i * STAGGER.loose : 0, ...SPRING.panel }}
            whileTap={{ scale: 0.96 }}
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left text-sm font-bold"
            style={{ borderColor: `${o.c}55`, background: `linear-gradient(90deg, ${o.c}33, ${o.c}0d)`, boxShadow: pick === i ? `0 0 30px -4px ${o.c}` : "none" }}
          >
            <div className="grid h-9 w-9 place-items-center rounded-full border-2" style={{ borderColor: o.c, color: o.c }}><o.icon size={16} /></div>
            {o.t}
            {pick === i && <motion.div className="absolute inset-0 bg-white" initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {verdict && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING.reward}
            className="glass absolute inset-x-3 bottom-5 flex items-center gap-3 rounded-2xl border-bull/40 p-3"
          >
            <motion.div initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.15, ...SPRING.reward }} className="grid h-11 w-11 place-items-center rounded-full bg-bull text-[#022] shadow-[0_0_20px_#3ddc84]">
              <I.check size={22} stroke={3} />
            </motion.div>
            <div>
              <div className="text-sm font-bold text-bull">Решение качественное</div>
              <div className="text-[11px] text-white/55">Ретест подтвердился. +120 XP мастерства</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   09 · THREAT TAKEOVER — угроза захватывает экран
   ================================================================ */
export function ThreatTakeover({ run, cue }: SceneProps) {
  const [on, setOn] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [scope, anim] = useAnimate();
  const p = useParticles();
  useScript(run, async (wait) => {
    setOn(false);
    await wait(900);
    cue();
    setGlitch(true);
    await wait(280);
    setGlitch(false);
    setOn(true);
    anim(scope.current, shakeKeys(0.9, 12, 10, 2), { duration: 0.4 });
    p.burst({ x: 150, y: 150, count: 50, colors: ["#ff4d5e", "#ff9a4d", "#fff"], speed: [200, 600] });
  });
  const threats = ["Резкий рост волатильности", "Ложный пробой", "Выход крупных игроков", "Эмоциональный фон"];
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={on ? "#ff4d5e" : "#2ee6c5"} />
      {/* siren beam */}
      <motion.div
        className="absolute left-1/2 top-[150px] h-[700px] w-[700px] -ml-[350px] -mt-[350px]"
        style={{ background: "conic-gradient(from 0deg, transparent 0deg, #ff4d5e33 30deg, transparent 60deg, transparent 180deg, #ff4d5e33 210deg, transparent 240deg)" }}
        animate={{ opacity: on ? 1 : 0, rotate: on ? 360 : 0 }}
        transition={{ opacity: { duration: 0.3 }, rotate: { duration: 3, repeat: Infinity, ease: "linear" } }}
      />
      {/* base chart layer with RGB split glitch */}
      <div className="absolute inset-x-3 top-12">
        {([["#ff004c", -4], ["#00e5ff", 4], ["", 0]] as [string, number][]).map(([c, o], i) => (
          <motion.div
            key={i}
            className="glass absolute inset-x-0 rounded-2xl p-3"
            style={{ mixBlendMode: c ? "screen" : "normal", opacity: c ? (glitch ? 0.8 : 0) : 1, filter: c ? `drop-shadow(0 0 0 ${c})` : "none" }}
            animate={glitch && c ? { x: [0, o as number, -(o as number), o as number, 0], clipPath: ["inset(10% 0 60% 0)", "inset(50% 0 20% 0)", "inset(20% 0 40% 0)", "inset(0 0 0 0)"] } : { x: 0 }}
            transition={{ duration: 0.28, ease: "linear" }}
          >
            <div className="text-[10px] font-bold" style={{ color: c || "#ffffff77" }}>BTC/USDT · 1H</div>
            <Candles data={genCandles(22, 31, -0.05)} w={250} h={110} grow={false} glow={!c} />
          </motion.div>
        ))}
      </div>
      {/* vignette */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={on ? { boxShadow: ["inset 0 0 60px 10px #ff4d5e66", "inset 0 0 120px 30px #ff4d5eaa", "inset 0 0 60px 10px #ff4d5e66"] } : { boxShadow: "inset 0 0 0 0 #ff4d5e00" }}
        transition={on ? { duration: 1.1, repeat: Infinity } : { duration: 0.3 }}
      />
      {/* hazard stripes */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className={`absolute inset-x-0 h-3 ${i ? "bottom-0" : "top-[176px]"}`}
          style={{ background: "repeating-linear-gradient(45deg, #ff4d5e 0 10px, #1a0508 10px 20px)" }}
          initial={false}
          animate={on ? { scaleX: 1, backgroundPositionX: ["0px", "28px"] } : { scaleX: 0 }}
          transition={on ? { scaleX: { duration: 0.35, ease: EASE.outExpo }, backgroundPositionX: { duration: 0.6, repeat: Infinity, ease: "linear" } } : { duration: 0.2 }}
        />
      ))}
      {/* banner */}
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ scale: 2.4, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.32, ease: EASE.snap }}
            className="absolute inset-x-6 top-[200px] flex items-center justify-center gap-3 rounded-2xl border-2 border-bear bg-gradient-to-b from-[#5a0a16] to-[#2a040a] py-3 shadow-[0_0_40px_#ff4d5e88]"
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity }} className="text-bear">
              <I.warn size={26} />
            </motion.span>
            <span className="font-display text-2xl font-black tracking-wider text-white" style={{ textShadow: "0 0 18px #ff4d5e" }}>УГРОЗА</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* threat list */}
      <div className="absolute inset-x-5 top-[282px] space-y-2">
        {threats.map((t, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={on ? { x: 0, opacity: 1 } : { x: 260, opacity: 0 }}
            transition={on ? { delay: 0.35 + i * 0.09, ...SPRING.panel } : { duration: 0.2 }}
            className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-bear/30 bg-[#2a0a12]/80 px-3 py-2 text-xs"
          >
            <div className="h-2 w-2 rounded-full bg-bear shadow-[0_0_8px_#ff4d5e]" />
            {t}
            {on && <motion.div className="absolute inset-0 bg-bear" initial={{ opacity: 0.7 }} animate={{ opacity: 0 }} transition={{ delay: 0.35 + i * 0.09, duration: 0.35 }} />}
          </motion.div>
        ))}
      </div>
      <motion.button
        initial={false}
        animate={on ? { y: 0, opacity: 1, boxShadow: ["0 0 0 0 #ff4d5e88", "0 0 0 14px #ff4d5e00"] } : { y: 80, opacity: 0 }}
        transition={on ? { y: { delay: 0.8, ...SPRING.panel }, opacity: { delay: 0.8 }, boxShadow: { duration: 1.2, repeat: Infinity } } : { duration: 0.2 }}
        className="absolute inset-x-8 bottom-8 rounded-2xl bg-gradient-to-b from-[#ff6b7a] to-[#d61f3a] py-3.5 font-display text-sm font-black"
      >
        УЧТИ РИСК
      </motion.button>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   10 · TURN TIMER — давление времени через «сердцебиение»
   ================================================================ */
export function TurnTimer({ run, cue }: SceneProps) {
  const [sec, setSec] = useState(6);
  const [over, setOver] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const prog = useMotionValue(1);
  const R = 70, L = 2 * Math.PI * R;
  const dash = useTransform(prog, (v) => L * (1 - v));
  const color = useTransform(prog, [0, 0.35, 0.6, 1], ["#ff4d5e", "#ff4d5e", "#ffc34d", "#2ee6c5"]);
  useScript(run, async (wait) => {
    cue();
    setOver(false);
    setSec(6);
    prog.set(1);
    animate(prog, 0, { duration: 6, ease: "linear" });
    for (let s = 5; s >= 0; s--) {
      await wait(1000);
      setSec(s);
      if (getSound()) sfx.tick(s <= 2);
    // HEARTBEAT: двойной удар «лаб-дап», сила растёт к нулю
      if (s <= 3 && s > 0 && rootRef.current) {
        const k = 1 + (4 - s) * 0.008;
        animate(rootRef.current, { scale: [1, k, 1, 1 + (k - 1) * 0.5, 1] }, { duration: 0.55, ease: "easeOut" });
      }
    }
    setOver(true);
  });
  const danger = sec <= 3 && !over;
  return (
    <motion.div ref={rootRef} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={danger ? "#ff4d5e" : "#2ee6c5"} />
      <motion.div className="pointer-events-none absolute inset-0" animate={{ boxShadow: danger ? ["inset 0 0 40px #ff4d5e00", `inset 0 0 ${60 + (3 - sec) * 30}px #ff4d5e99`, "inset 0 0 40px #ff4d5e33"] : "inset 0 0 0 #0000" }} transition={{ duration: 0.6 }} />
      <div className="absolute inset-x-0 top-14 text-center text-[10px] font-bold uppercase tracking-[.3em] text-white/50">Ход игрока</div>
      <div className="absolute left-1/2 top-[110px] h-[180px] w-[180px] -ml-[90px]">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
          <circle cx="90" cy="90" r={R} fill="none" stroke="#ffffff12" strokeWidth="10" />
          <motion.circle cx="90" cy="90" r={R} fill="none" strokeWidth="10" strokeLinecap="round" strokeDasharray={L} style={{ strokeDashoffset: dash, stroke: color, filter: "drop-shadow(0 0 8px currentColor)" }} />
        </svg>
        <div className="absolute inset-0 grid place-items-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={sec}
              initial={{ y: 60, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -60, opacity: 0, scale: 1.4 }}
              transition={SPRING.reward}
              className="font-display text-6xl font-black tabular-nums"
              style={{ color: danger ? "#ff4d5e" : "#fff", textShadow: danger ? "0 0 24px #ff4d5e" : "0 0 20px #2ee6c555" }}
            >
              {sec}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="absolute inset-x-4 top-[320px] grid grid-cols-2 gap-2">
        {["Тренд", "Объём", "Риск", "Ждать"].map((t, i) => (
          <motion.div key={i} animate={danger ? { x: [0, -1.5, 1.5, 0] } : { x: 0 }} transition={{ duration: 0.2, delay: i * 0.03 }} className="glass rounded-2xl py-4 text-center text-sm font-bold">
            {t}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {over && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 3, rotate: -18, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ duration: 0.28, ease: EASE.snap }}
              className="rounded-xl border-4 border-bear px-5 py-2 font-display text-2xl font-black text-bear"
              style={{ textShadow: "0 0 20px #ff4d5e", boxShadow: "0 0 30px #ff4d5e66, inset 0 0 20px #ff4d5e44" }}
            >
              ВРЕМЯ ВЫШЛО
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
