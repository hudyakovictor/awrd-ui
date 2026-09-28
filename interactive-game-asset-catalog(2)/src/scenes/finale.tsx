import { animate, AnimatePresence, motion, useAnimate, useMotionValue, useTransform, type AnimationPlaybackControls } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import enemy from "../assets/enemy.jpg";
import hood from "../assets/hood.jpg";
import { Candles, Coin, CountUp, genCandles, I } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, rand, shakeKeys } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "./common";

/* ================================================================
   SHATTER — изображение раскалывается на N×N осколков.
   Задержка осколка = расстояние от точки удара → волна разрушения.
   ================================================================ */
export function Shatter({ img, size, go, origin = { x: 0.5, y: 0.5 }, n = 7, blend = true }: { img: string; size: number; go: boolean; origin?: { x: number; y: number }; n?: number; blend?: boolean }) {
  const tiles = useMemo(
    () =>
      Array.from({ length: n * n }, (_, i) => {
        const cx = i % n, cy = Math.floor(i / n);
        const dx = (cx + 0.5) / n - origin.x, dy = (cy + 0.5) / n - origin.y;
        const d = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx) + rand(-0.6, 0.6);
        const sp = rand(90, 240) * (1.2 - d);
        return { cx, cy, d, tx: Math.cos(ang) * sp, ty: Math.sin(ang) * sp, r: rand(-300, 300) };
      }),
    [n, origin.x, origin.y],
  );
  const s = size / n;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {tiles.map((t, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: t.cx * s,
            top: t.cy * s,
            width: s + 0.6,
            height: s + 0.6,
            backgroundImage: `url(${img})`,
            backgroundSize: `${size}px ${size}px`,
            backgroundPosition: `-${t.cx * s}px -${t.cy * s}px`,
            mixBlendMode: blend ? "screen" : "normal",
          }}
          initial={false}
          animate={
            go
              ? { x: [0, t.tx * 0.45, t.tx], y: [0, t.ty * 0.45 - 30, t.ty + 300], rotate: [0, t.r * 0.3, t.r], opacity: [1, 1, 0], scale: [1, 1.1, 0.5], filter: ["brightness(3)", "brightness(1.3)", "brightness(1)"] }
              : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, filter: "brightness(1)" }
          }
          transition={go ? { duration: 1.4, delay: t.d * 0.35, times: [0, 0.3, 1], ease: [0.2, 0.6, 0.4, 1] } : { duration: 0 }}
        />
      ))}
    </div>
  );
}

/* ================================================================
   28 · VICTORY — bullet-time добивание, раскол босса, 3 звезды
   ================================================================ */
export function VictorySequence({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [ph, setPh] = useState(0);
  const [stars, setStars] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const boss = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);

  useScript(run, async (wait) => {
    setPh(0);
    setStars(0);
    if (card.current) card.current.style.opacity = "1";
    await animate(card.current!, { x: 0, y: 0, rotate: 0, scale: 1 }, { duration: 0 });
    await wait(700);
    cue();
    // 1. BULLET TIME: камера наезжает, мир обесцвечивается, звук втягивается
    setPh(1);
    sfx.suck();
    animate(cam.current!, { scale: 1.16 }, { duration: 1.1, ease: EASE.camera });
    const c = centerIn(card.current, scope.current);
    const b = centerIn(boss.current, scope.current);
    const trail = window.setInterval(() => {
      const t = centerIn(card.current, scope.current);
      p.burst({ x: t.x, y: t.y, count: 4, speed: [5, 30], colors: ["#2ee6c5", "#fff"], shape: "dot", life: [0.5, 0.9], size: [2, 4] });
    }, 20);
    await animate(card.current!, { x: b.x - c.x, y: b.y - c.y, rotate: 720, scale: 0.5 }, { duration: 1.05, ease: [0.7, 0, 0.95, 0.6] });
    clearInterval(trail);
    card.current!.style.opacity = "0";
    // 2. HIT-STOP 200мс (длиннее обычного — это финал)
    setPh(2);
    await wait(200);
    // 3. SHATTER
    setPh(3);
    sfx.shatter();
    animate(cam.current!, { scale: 1 }, { type: "spring", stiffness: 120, damping: 14 });
    anim(scope.current, shakeKeys(1, 18, 16, 3), { duration: 0.6 });
    p.ring(b.x, b.y, "#fff", 260, 0.6, 16);
    p.ring(b.x, b.y, "#ff4d5e", 200, 1, 6);
    p.burst({ x: b.x, y: b.y, count: 100, colors: ["#ff4d5e", "#ff9a3d", "#fff", "#ffc34d"], speed: [300, 900], drag: 3.5 });
    await wait(1100);
    setPh(4);
    sfx.chime();
    await wait(500);
    // 4. ЗВЁЗДЫ: каждая — отдельный удар
    for (let i = 1; i <= 3; i++) {
      setStars(i);
      await wait(260);
      const sc = centerIn(starRefs.current[i - 1], scope.current);
      sfx.stamp();
      sfx.pop(i * 4);
      anim(scope.current, shakeKeys(0.35 + i * 0.12, 8, 7, 1), { duration: 0.28 });
      p.burst({ x: sc.x, y: sc.y, count: 26, shape: "star", colors: ["#ffc34d", "#fff"], speed: [120, 360], size: [2, 5] });
      p.ring(sc.x, sc.y, "#ffc34d", 70, 0.5, 5);
      await wait(200);
    }
    setPh(5);
  });

  const letters = "ПОБЕДА".split("");
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden bg-[#050811]">
      <div ref={cam} className="absolute inset-0" style={{ transformOrigin: "50% 28%" }}>
        <motion.div className="absolute inset-0" animate={{ filter: ph === 1 || ph === 2 ? "grayscale(0.85) brightness(0.7)" : "grayscale(0) brightness(1)" }} transition={{ duration: ph === 1 ? 0.9 : 0.2 }}>
          <SceneBg tint={ph >= 4 ? "#ffc34d" : "#ff4d5e"} />
        </motion.div>
        {/* boss HP */}
        <motion.div className="absolute inset-x-5 top-11" animate={{ opacity: ph >= 3 ? 0 : 1 }}>
          <div className="flex justify-between text-[10px] font-bold">
            <span>FOMO · БОСС</span>
            <span className="text-bear">{ph >= 3 ? 0 : 80} / 1000</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full border border-white/10 bg-black/40">
            <motion.div className="h-full bg-bear" initial={false} animate={{ width: ph >= 3 ? "0%" : "8%" }} transition={{ duration: 0.1 }} />
          </div>
          <div className="mt-1 text-[9px] font-bold text-bear blink">КРИТИЧЕСКОЕ СОСТОЯНИЕ</div>
        </motion.div>
        {/* boss */}
        <div ref={boss} className="absolute left-1/2 top-[90px] -ml-[90px] h-[180px] w-[180px]">
          {ph < 3 ? (
            <motion.div
              className="h-full w-full"
              animate={ph === 2 ? { filter: "brightness(5) saturate(0)" } : { scale: [1, 1.03, 1], x: [0, -2, 2, 0] }}
              transition={ph === 2 ? { duration: 0 } : { duration: 0.4, repeat: Infinity }}
              style={{ backgroundImage: `url(${enemy})`, backgroundSize: "cover", mixBlendMode: "screen" }}
            />
          ) : (
            <Shatter img={enemy} size={180} go={ph >= 3} origin={{ x: 0.5, y: 0.55 }} />
          )}
        </div>
        {/* card */}
        <div className="absolute inset-x-0 bottom-20 flex justify-center">
          <motion.div
            ref={card}
            className="relative h-[120px] w-[84px] rounded-xl p-[3px]"
            style={{ background: "linear-gradient(160deg,#2ee6c5,#1a2440 60%,#2ee6c5)", boxShadow: "0 0 30px #2ee6c588" }}
            animate={ph === 0 ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            <div className="grid h-full place-items-center rounded-[9px] bg-[#0c1428] text-teal">
              <div className="text-center">
                <I.target size={28} />
                <div className="mt-1 font-display text-[9px] font-black text-white">РЕТЕСТ</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      {/* impact flash */}
      <motion.div className="pointer-events-none absolute inset-0 bg-white" initial={false} animate={{ opacity: ph === 2 ? 0.5 : 0 }} transition={{ duration: ph === 2 ? 0 : 0.35 }} />
      {/* letterbox bars — кинематографичность */}
      {[0, 1].map((i) => (
        <motion.div key={i} className={`absolute inset-x-0 z-20 h-12 bg-black ${i ? "bottom-0" : "top-0"}`} initial={false} animate={{ scaleY: ph === 1 || ph === 2 ? 1 : 0 }} style={{ transformOrigin: i ? "50% 100%" : "50% 0%" }} transition={{ duration: 0.4, ease: EASE.outExpo }} />
      ))}
      {/* banner */}
      {ph >= 4 && (
        <div className="absolute inset-x-0 top-[150px] z-30">
          <motion.div className="mx-6 rounded-xl bg-gradient-to-b from-[#ffd76a] to-[#c8801a] py-3 shadow-[0_0_40px_#ffc34d88]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: EASE.overshoot }}>
            <div className="flex justify-center">
              {letters.map((l, i) => (
                <motion.span key={i} className="font-display text-3xl font-black text-[#3a2200]" initial={{ y: -40, opacity: 0, rotate: -20 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ delay: 0.25 + i * 0.05, ...SPRING.reward }}>
                  {l}
                </motion.span>
              ))}
            </div>
          </motion.div>
          <div className="mt-6 flex items-end justify-center gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} ref={(el) => { starRefs.current[i] = el; }} className={i === 1 ? "-translate-y-4" : ""}>
                <motion.svg width={i === 1 ? 64 : 48} height={i === 1 ? 64 : 48} viewBox="0 0 24 24" initial={false} animate={stars > i ? { scale: [3, 0.85, 1], rotate: [-45, 10, 0], opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }} transition={{ duration: 0.35, ease: EASE.snap }}>
                  <path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" fill={stars > i ? "#ffc34d" : "#ffffff14"} stroke={stars > i ? "#fff6cc" : "#ffffff22"} strokeWidth="1" style={{ filter: stars > i ? "drop-shadow(0 0 8px #ffc34d)" : "none" }} />
                </motion.svg>
              </div>
            ))}
          </div>
        </div>
      )}
      <AnimatePresence>
        {ph >= 5 && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING.panel} className="absolute inset-x-4 bottom-8 z-30 grid grid-cols-3 gap-2">
            {[
              { v: 450, l: "монет", c: "#ffc34d" },
              { v: 180, l: "XP", c: "#9b7bff" },
              { v: 92, l: "% точность", c: "#3ddc84" },
            ].map((r, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, ...SPRING.reward }} className="glass rounded-xl py-2 text-center">
                <div className="font-display text-lg font-black" style={{ color: r.c }}>
                  <CountUp to={r.v} delay={0.1 + i * 0.08} />
                </div>
                <div className="text-[9px] text-white/50">{r.l}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   29 · DEFEAT & COMEBACK — поражение, которое мотивирует
   ================================================================ */
const HEART = "M12 21s-8-5.2-8-11.2A4.6 4.6 0 0112 7a4.6 4.6 0 018 2.8C20 15.8 12 21 12 21z";
const CRACKS = [
  "M150 250 L120 210 L128 170 L96 120 L100 60",
  "M150 250 L190 230 L220 190 L270 180 L310 140",
  "M150 250 L160 300 L140 350 L150 420 L130 500",
  "M150 250 L100 270 L60 260 L20 300 L-10 290",
  "M150 250 L200 290 L230 340 L290 360",
  "M120 210 L80 200",
  "M160 300 L200 320",
];

export function DefeatComeback({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [hearts, setHearts] = useState(3);
  const [ph, setPh] = useState(0);
  const [flash, setFlash] = useState(0);

  useScript(run, async (wait) => {
    setHearts(3);
    setPh(0);
    await wait(700);
    cue();
    for (let h = 2; h >= 0; h--) {
      setHearts(h);
      setFlash((f) => f + 1);
      sfx.error();
      anim(scope.current, shakeKeys(0.45 + (2 - h) * 0.2, 10, 9, 1.5), { duration: 0.35 });
      const hx = 110 + h * 40;
      p.burst({ x: hx, y: 64, count: 18, colors: ["#ff4d5e", "#ff9aa6"], speed: [80, 240], gravity: 400 });
      await wait(650);
    }
    // обесцвечивание + трещины
    setPh(1);
    sfx.lose();
    await wait(700);
    setPh(2);
    await wait(420);
    // тяжёлое приземление заголовка
    sfx.stamp();
    anim(scope.current, shakeKeys(0.7, 12, 10, 1.5), { duration: 0.4 });
    p.burst({ x: 150, y: 300, count: 40, shape: "dot", colors: ["#888", "#bbb"], speed: [60, 220], angle: 0, spread: Math.PI * 2, gravity: 200, drag: 3, life: [0.6, 1.2], size: [2, 4] });
    await wait(1300);
    // возвращение цвета — надежда
    setPh(3);
    sfx.chime();
  });

  const gray = ph === 1 || ph === 2 ? 1 : ph === 3 ? 0.35 : 0;
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <motion.div className="absolute inset-0" animate={{ filter: `grayscale(${gray}) brightness(${ph === 2 ? 0.7 : 1})` }} transition={{ duration: 1 }}>
        <SceneBg tint={ph === 3 ? "#2ee6c5" : "#ff4d5e"} />
        <div className="absolute inset-x-5 top-12 flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="relative h-8 w-8">
              <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full">
                <path d={HEART} fill="#ffffff10" stroke="#ffffff22" />
              </svg>
              {[0, 1].map((half) => (
                <motion.svg
                  key={half}
                  viewBox="0 0 24 24"
                  className="absolute inset-0 h-full w-full"
                  style={{ clipPath: half ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)" }}
                  initial={false}
                  animate={i < hearts ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x: half ? 14 : -14, y: 40, rotate: half ? 40 : -40, opacity: 0 }}
                  transition={i < hearts ? { duration: 0 } : { duration: 0.6, ease: EASE.inQuart }}
                >
                  <path d={HEART} fill="#ff4d5e" style={{ filter: "drop-shadow(0 0 4px #ff4d5e)" }} />
                </motion.svg>
              ))}
            </div>
          ))}
          <span className="ml-auto font-mono text-[10px] text-white/50">Попытка 1</span>
        </div>
        <div className="glass absolute inset-x-4 top-[100px] rounded-2xl p-3">
          <Candles data={genCandles(24, 55, -0.28)} w={250} h={130} grow={false} />
        </div>
      </motion.div>
      <motion.div key={flash} className="pointer-events-none absolute inset-0 bg-bear" initial={{ opacity: flash ? 0.35 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />
      {/* cracks */}
      <svg viewBox="0 0 300 624" className="pointer-events-none absolute inset-0 h-full w-full">
        {CRACKS.map((d, i) => (
          <motion.path key={i} d={d} fill="none" stroke="#e6ecff" strokeWidth={i < 5 ? 2 : 1.2} strokeLinejoin="round" initial={false} animate={{ pathLength: ph >= 1 ? 1 : 0, opacity: ph >= 1 ? (ph === 3 ? 0.25 : 0.8) : 0 }} transition={{ duration: 0.35, delay: ph === 1 ? i * 0.04 : 0, ease: EASE.snap }} style={{ filter: "drop-shadow(0 0 3px #fff)" }} />
        ))}
      </svg>
      <AnimatePresence>
        {ph >= 2 && (
          <motion.div key="t" initial={{ y: -300 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, mass: 2 }} className="absolute inset-x-0 top-[262px] text-center">
            <div className="font-display text-4xl font-black text-white/90" style={{ textShadow: "0 6px 0 #000" }}>ПОРАЖЕНИЕ</div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ph === 3 && (
          <>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={SPRING.panel} className="glass absolute inset-x-4 top-[330px] flex gap-3 rounded-2xl border-teal/40 p-3">
              <img src={hood} className="h-12 w-12 rounded-xl object-cover" />
              <div>
                <div className="text-sm font-bold text-teal">Ошибка — это данные</div>
                <div className="text-[11px] leading-snug text-white/60">Ты увидел ложный пробой. В следующий раз ты его узнаешь.</div>
              </div>
            </motion.div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, ...SPRING.reward }} className="absolute inset-x-0 top-[420px] text-center text-xs font-bold text-violet">
              +35 XP за разбор ошибки
            </motion.div>
            <motion.button
              initial={{ y: 80 }}
              animate={{ y: 0, boxShadow: ["0 0 0 0 #2ee6c588", "0 0 0 16px #2ee6c500"] }}
              transition={{ y: { delay: 0.3, ...SPRING.panel }, boxShadow: { duration: 1.4, repeat: Infinity } }}
              whileTap={{ scale: 0.95 }}
              className="absolute inset-x-8 bottom-10 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3.5 font-display text-sm font-black text-[#032a24]"
            >
              <I.replay size={16} stroke={2.5} /> ЕЩЁ РАЗ
            </motion.button>
          </>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   30 · COMBO FEVER — комбо-счётчик, остывающая шкала, режим FEVER
   ================================================================ */
export function ComboFever({ run, cue }: SceneProps) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [fever, setFever] = useState(false);
  const [broken, setBroken] = useState(false);
  const [press, setPress] = useState<{ i: number; ok: boolean; k: number } | null>(null);
  const [pops, setPops] = useState<{ id: number; x: number; v: number }[]>([]);
  const heat = useMotionValue(0);
  const heatW = useTransform(heat, (v) => `${v * 100}%`);
  const heatC = useTransform(heat, [0, 0.5, 1], ["#2ee6c5", "#ffc34d", "#ff4d5e"]);
  const ctl = useRef<AnimationPlaybackControls | null>(null);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const comboRef = useRef(0);

  const bump = (v: number) => {
    ctl.current?.stop();
    const target = Math.min(1, v);
    ctl.current = animate(heat, target, { duration: 0.15, ease: EASE.outExpo, onComplete: () => { ctl.current = animate(heat, 0, { duration: 1 + target * 2.5, ease: "linear" }); } });
  };

  const hit = (i: number, ok: boolean) => {
    const el = btns.current[i];
    const c = centerIn(el, scope.current);
    setPress({ i, ok, k: Date.now() });
    if (ok) {
      comboRef.current += 1;
      const n = comboRef.current;
      setCombo(n);
      setBroken(false);
      const pts = 10 * n;
      setScore((s) => s + pts);
      setPops((pp) => [...pp.slice(-4), { id: Date.now(), x: c.x, v: pts }]);
      sfx.combo(n);
      bump(heat.get() + 0.2);
      p.burst({ x: c.x, y: c.y, count: 8 + n * 3, colors: n >= 5 ? ["#ff4d5e", "#ffc34d", "#fff"] : ["#2ee6c5", "#fff"], speed: [100, 260 + n * 30] });
      if (n === 5) {
        setFever(true);
        sfx.fever();
        anim(scope.current, shakeKeys(0.7, 12, 9, 1.5), { duration: 0.4 });
        p.ring(150, 170, "#ffc34d", 200, 0.7, 10);
      }
    } else {
      comboRef.current = 0;
      setBroken(true);
      setFever(false);
      sfx.error();
      anim(scope.current, shakeKeys(0.6, 10, 8, 1.5), { duration: 0.35 });
      ctl.current?.stop();
      animate(heat, 0, { duration: 0.4, ease: EASE.inQuart });
      window.setTimeout(() => setCombo(0), 50);
    }
  };

  useScript(run, async (wait) => {
    comboRef.current = 0;
    setCombo(0);
    setScore(0);
    setFever(false);
    setBroken(false);
    heat.set(0);
    await wait(600);
    cue();
    const seq = [1, 0, 2, 1, 1, 2, 0, 1];
    for (let k = 0; k < seq.length; k++) {
      hit(seq[k], true);
      await wait(k < 4 ? 480 : 380);
    }
    await wait(300);
    hit(2, false);
  });

  const col = fever ? "#ff4d5e" : combo >= 3 ? "#ffc34d" : "#2ee6c5";
  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={col} />
      {/* fever border */}
      <AnimatePresence>
        {fever && (
          <motion.div
            key="fb"
            className="pointer-events-none absolute inset-0 z-20 rounded-[40px] p-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "conic-gradient(from var(--a, 0deg), #ff4d5e, #ffc34d, #3ddc84, #2ee6c5, #9b7bff, #ff6bd6, #ff4d5e)",
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <motion.div className="absolute inset-0" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.5, repeat: Infinity }} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-x-5 top-11 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[.25em] text-white/50">Счёт</div>
        <motion.div key={score} initial={{ scale: 1.3, color: "#ffffff" }} animate={{ scale: 1, color: "#e6ecff" }} className="font-display text-lg font-black tabular-nums">
          {score}
        </motion.div>
      </div>
      {/* combo */}
      <div className="absolute inset-x-0 top-[90px] flex flex-col items-center">
        <div className="text-[10px] font-bold uppercase tracking-[.4em]" style={{ color: col }}>{broken ? "Комбо прервано" : "Комбо"}</div>
        <div className="relative h-[100px] w-full">
          <AnimatePresence mode="popLayout">
            {combo > 0 && (
              <motion.div
                key={combo}
                initial={{ scale: 1.9, rotate: rand(-12, 12), opacity: 0.4 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={broken ? { y: 240, rotate: 50, opacity: 0, transition: { duration: 0.7, ease: EASE.inQuart } } : { scale: 0.6, opacity: 0, transition: { duration: 0.08 } }}
                transition={{ type: "spring", stiffness: 600, damping: 16 }}
                className="absolute inset-0 text-center font-display text-[84px] font-black leading-[100px] italic"
                style={{ color: col, textShadow: `0 0 30px ${col}, 0 6px 0 #00000088` }}
              >
                x{combo}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-1 h-3 w-48 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <motion.div className="h-full rounded-full" style={{ width: heatW, background: heatC, boxShadow: "0 0 12px currentColor" }} />
        </div>
      </div>
      <AnimatePresence>
        {fever && (
          <motion.div key="fv" initial={{ scale: 3, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: -6 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.3, ease: EASE.snap }} className="absolute right-5 top-[210px] z-10 rounded-lg bg-bear px-2 py-1 font-display text-sm font-black text-white shadow-[0_0_24px_#ff4d5e]">
            FEVER x2
          </motion.div>
        )}
      </AnimatePresence>
      {/* question */}
      <div className="glass absolute inset-x-4 top-[250px] rounded-2xl p-3">
        <div className="text-[10px] font-bold text-white/45">Что делать на пробое без объёма?</div>
        <Candles data={genCandles(16, 71)} w={250} h={70} grow={false} />
      </div>
      <div className="absolute inset-x-4 top-[380px] space-y-2">
        {["Войти сразу", "Ждать ретест", "Увеличить лот"].map((t, i) => (
          <motion.button
            key={`${i}-${press?.i === i ? press.k : 0}`}
            ref={(el) => { btns.current[i] = el; }}
            onClick={() => hit(i, i === 1 || Math.random() > 0.3)}
            animate={press?.i === i ? { scale: [0.94, 1.02, 1], background: press.ok ? ["#3ddc8455", "#ffffff08"] : ["#ff4d5e55", "#ffffff08"] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
            className="glass relative w-full rounded-xl py-3 text-sm font-bold"
          >
            {t}
          </motion.button>
        ))}
      </div>
      {/* floating points */}
      <AnimatePresence>
        {pops.map((pp) => (
          <motion.div key={pp.id} className="pointer-events-none absolute top-[360px] z-30 -ml-6 w-12 text-center font-display text-sm font-black text-gold" style={{ left: pp.x }} initial={{ y: 20, opacity: 0, scale: 0.5 }} animate={{ y: -60, opacity: [0, 1, 1, 0], scale: 1.2 }} transition={{ duration: 0.9, ease: EASE.outExpo }} onAnimationComplete={() => setPops((a) => a.filter((q) => q.id !== pp.id))}>
            +{pp.v}
          </motion.div>
        ))}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   31 · DYNAMIC ISLAND — системные события морфят «остров»
   ================================================================ */
type IslandMode = "idle" | "compact" | "expanded";
const SIZE: Record<IslandMode, { w: number; h: number; r: number }> = {
  idle: { w: 88, h: 22, r: 11 },
  compact: { w: 190, h: 30, r: 15 },
  expanded: { w: 278, h: 100, r: 34 },
};
type Ev = { mode: IslandMode; kind: "ach" | "coin" | "rank" | "streak" };
const EVENTS: Ev[] = [
  { mode: "expanded", kind: "ach" },
  { mode: "compact", kind: "coin" },
  { mode: "expanded", kind: "rank" },
  { mode: "compact", kind: "streak" },
];

export function DynamicIsland({ run, cue }: SceneProps) {
  const [ev, setEv] = useState<Ev | null>(null);
  const [rank, setRank] = useState(42);
  useScript(run, async (wait) => {
    setEv(null);
    setRank(42);
    await wait(700);
    cue();
    for (const e of EVENTS) {
      setEv(e);
      sfx.island();
      if (e.kind === "rank") {
        await wait(700);
        for (const r of [38, 31, 24, 18, 12]) {
          setRank(r);
          sfx.tick();
          await wait(120);
        }
        await wait(1000);
      } else await wait(e.mode === "expanded" ? 2000 : 1500);
      setEv(null);
      await wait(550);
    }
  });
  const mode: IslandMode = ev?.mode ?? "idle";
  const sz = SIZE[mode];
  const content = (
    <AnimatePresence mode="popLayout">
      {ev && (
        <motion.div
          key={ev.kind}
          initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.85, filter: "blur(8px)", transition: { duration: 0.12 } }}
          transition={{ delay: 0.12, duration: 0.3, ease: EASE.outExpo }}
          className="absolute inset-0"
        >
          {ev.kind === "ach" && (
            <div className="flex h-full items-center gap-3 px-4">
              <div className="relative h-14 w-14 shrink-0">
                <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
                  <circle cx="28" cy="28" r="25" fill="none" stroke="#ffffff1a" strokeWidth="4" />
                  <motion.circle cx="28" cy="28" r="25" fill="none" stroke="#ffc34d" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.3, duration: 0.9, ease: EASE.outExpo }} />
                </svg>
                <motion.div className="absolute inset-0 grid place-items-center text-gold" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 1.1, ...SPRING.reward }}>
                  <I.target size={22} />
                </motion.div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[.25em] text-gold">Достижение</div>
                <div className="font-display text-sm font-bold text-white">Снайпер</div>
                <div className="text-[10px] text-white/50">10 точных входов подряд</div>
              </div>
            </div>
          )}
          {ev.kind === "coin" && (
            <div className="flex h-full items-center justify-between px-2">
              <Coin size={20} />
              <span className="font-display text-xs font-bold text-gold">+250</span>
            </div>
          )}
          {ev.kind === "rank" && (
            <div className="flex h-full items-center gap-3 px-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold"><I.trophy size={26} /></div>
              <div className="flex-1">
                <div className="text-[9px] font-bold uppercase tracking-[.25em] text-white/50">Турнир недели</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-white/40 line-through">#42</span>
                  <div className="relative h-7 w-14 overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      <motion.span key={rank} initial={{ y: 28 }} animate={{ y: 0 }} exit={{ y: -28 }} transition={{ duration: 0.1 }} className="absolute inset-0 font-display text-xl font-black text-bull">
                        #{rank}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <I.arrowUp size={20} className="text-bull" stroke={3} />
            </div>
          )}
          {ev.kind === "streak" && (
            <div className="flex h-full items-center justify-between px-2.5">
              <I.flame size={18} className="text-[#ff9a3d]" />
              <span className="font-display text-xs font-bold text-[#ff9a3d]">7 дней</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint="#b8ff3d" />
      <motion.div className="absolute inset-0" animate={{ scale: mode === "expanded" ? 0.96 : 1, filter: mode === "expanded" ? "blur(2px) brightness(.7)" : "blur(0px) brightness(1)" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
        <div className="absolute inset-x-4 top-[70px]">
          <div className="font-display text-xl font-bold">Главная</div>
          <div className="mt-4 space-y-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="glass flex items-center gap-3 rounded-2xl p-3">
                <div className="h-10 w-10 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded bg-white/20" style={{ width: `${75 - i * 8}%` }} />
                  <div className="h-2 rounded bg-white/10" style={{ width: `${50 + i * 6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-6 bottom-10 text-center text-[11px] text-white/40">Остров морфит между 3 состояниями на пружинах с разной жёсткостью по осям</div>
      </motion.div>
      <motion.div
        className="absolute left-1/2 top-2 z-[70] overflow-hidden bg-black"
        style={{ x: "-50%" }}
        initial={false}
        animate={{ width: sz.w, height: sz.h, borderRadius: sz.r }}
        transition={{
          width: { type: "spring", stiffness: 420, damping: 30 },
          height: { type: "spring", stiffness: 300, damping: 26 },
          borderRadius: { type: "spring", stiffness: 300, damping: 30 },
        }}
      >
        {content}
      </motion.div>
    </div>
  );
}
