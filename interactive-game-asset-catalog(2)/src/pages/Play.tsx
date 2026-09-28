import { animate, AnimatePresence, motion, useAnimate, useMotionValue, useTransform } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import arena from "../assets/arena.jpg";
import enemy from "../assets/enemy.jpg";
import hood from "../assets/hood.jpg";
import { Candles, Coin, CountUp, fmt, genCandles, I, Phone, type Candle } from "../components/kit";
import { ParticleCanvas, centerIn, useParticles } from "../components/particles";
import { EASE, SPRING, shakeKeys, sleep } from "../motion/tokens";
import { sfx, sound, useMuted } from "../motion/sfx";
import { Shatter } from "../scenes/finale";

/* ============================ DATA ============================ */
interface Scn { q: string; seed: number; drift: number; fut: number; opts: string[]; ok: number; why: string }
const SCN: Scn[] = [
  { q: "Пробой уровня без объёма. Объём молчит.", seed: 9, drift: 0.14, fut: -0.35, opts: ["Войти на пробое", "Ждать ретест и объём", "Увеличить позицию"], ok: 1, why: "Пробой без объёма часто ложный: крупные игроки собирают стопы над уровнем и разворачивают цену." },
  { q: "Цена у сильной поддержки, объём на падении растёт, свечи с длинными тенями вниз.", seed: 14, drift: -0.18, fut: 0.42, opts: ["Шорт по тренду", "Лонг со стопом под уровнем", "Усреднять без стопа"], ok: 1, why: "Длинные тени и объём у поддержки — поглощение продаж. Лонг с коротким стопом даёт лучший риск/прибыль." },
  { q: "Новостной памп +18% за 15 минут. Соцсети кричат «to the moon».", seed: 23, drift: 0.34, fut: -0.42, opts: ["Купить на хаях", "Не входить, ждать откат", "Шорт всем депозитом"], ok: 1, why: "FOMO-свеча на новостях почти всегда откатывается. Лучшее решение — не участвовать без сетапа." },
  { q: "Боковик 3 дня, диапазон сужается, объём падает.", seed: 31, drift: 0, fut: 0.38, opts: ["Большой лот внутри диапазона", "Ждать выход с объёмом", "Поднять плечо до x20"], ok: 1, why: "Сжатие диапазона предшествует импульсу. Направление неизвестно — ждём выход с подтверждением объёмом." },
  { q: "Ретест пробитого сопротивления сверху, объём подтверждает.", seed: 44, drift: 0.16, fut: 0.36, opts: ["Лонг от ретеста", "Шорт от уровня", "Закрыть терминал"], ok: 0, why: "Бывшее сопротивление стало поддержкой, объём подтвердил — классический вход по тренду." },
];
const HIST = 18, FUT = 8;
function buildChart(s: Scn): Candle[] {
  const h = genCandles(HIST, s.seed, s.drift);
  const f = genCandles(FUT, s.seed + 101, s.fut);
  const shift = h[h.length - 1].c - f[0].o;
  return [...h, ...f.map((c) => ({ o: c.o + shift, c: c.c + shift, h: c.h + shift, l: c.l + shift }))];
}

type Phase = "hub" | "dive" | "battle" | "victory" | "defeat";
interface LogEv { id: number; t: string; c: string; tag: string }
const MAX_HP = 300, XP_MAX = 300;

/* ============================ GAME ============================ */
function Game({ log }: { log: (tag: string, t: string, c?: string) => void }) {
  const [scope, anim] = useAnimate();
  const p = useParticles();
  const [phase, setPhase] = useState<Phase>("hub");
  const [coins, setCoins] = useState(1240);
  const [xp, setXp] = useState(180);
  const [lvl, setLvl] = useState(12);
  const [lvlUp, setLvlUp] = useState(false);
  const [wins, setWins] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  // battle
  const [round, setRound] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [ghost, setGhost] = useState(MAX_HP);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [vis, setVis] = useState(HIST);
  const [result, setResult] = useState<null | "ok" | "bad">(null);
  const [why, setWhy] = useState(false);
  const [flash, setFlash] = useState(false);
  const [dmg, setDmg] = useState<{ id: number; v: number; crit: boolean }[]>([]);
  const [shatter, setShatter] = useState(false);
  const [earned, setEarned] = useState({ coins: 0, xp: 0 });
  const [stars, setStars] = useState(0);
  const [orb, setOrb] = useState(false);

  const busy = useRef(false);
  const scan = useMotionValue(0);
  const enemyX = useMotionValue(0);
  const enemyR = useTransform(enemyX, (v) => v * 0.5);
  const hubBtn = useRef<HTMLButtonElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const optRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const starRefs = useRef<(HTMLDivElement | null)[]>([]);
  const heartsRef = useRef(3);
  const comboRef = useRef(0);
  const earnedRef = useRef({ coins: 0, xp: 0 });

  const s = SCN[round % SCN.length];
  const chart = useMemo(() => buildChart(s), [s]);
  const W = 252;
  const t0 = (HIST / (HIST + FUT)) * W;
  const fogClip = useTransform(scan, (v) => `inset(0 0 0 ${v * 100}%)`);
  const scanX = useTransform(scan, (v) => t0 + v * (W - t0));

  /* ---------- flow ---------- */
  const resetBattle = () => {
    setRound((r) => r);
    setHp(MAX_HP);
    setGhost(MAX_HP);
    setHearts(3);
    heartsRef.current = 3;
    setCombo(0);
    comboRef.current = 0;
    setPick(null);
    setVis(HIST);
    setResult(null);
    setWhy(false);
    setShatter(false);
    setStars(0);
    scan.set(0);
    earnedRef.current = { coins: 0, xp: 0 };
    setEarned({ coins: 0, xp: 0 });
    busy.current = false;
  };

  const enter = async () => {
    if (phase !== "hub") return;
    sfx.suck();
    log("anticipation", "Кнопка сжимается 0.88, энергия стягивается к ней", "#ffc34d");
    const c = centerIn(hubBtn.current, scope.current);
    p.burst({ x: c.x, y: c.y, count: 30, speed: [30, 90], shape: "dot", colors: ["#ffc34d", "#fff"], target: c });
    await anim(hubBtn.current!, { scale: 0.86 }, { duration: 0.24, ease: EASE.anticipate });
    resetBattle();
    setPhase("dive");
    sfx.whoosh(0.6);
    p.ring(c.x, c.y, "#ffc34d", 260, 0.7, 8);
    log("portal dive", "Камера ныряет сквозь UI: scale 2.6 + blur, origin = кнопка", "#2ee6c5");
    await sleep(750);
    setPhase("battle");
    sfx.impact();
    log("spring 140/18", "Арена вылетает из глубины мягкой пружиной", "#9b7bff");
  };

  const nextRound = async () => {
    setWhy(false);
    if (heartsRef.current <= 0) {
      setPhase("defeat");
      sfx.lose();
      log("fail state", "Grayscale + тяжёлое падение заголовка, mass 2", "#888888");
      return;
    }
    setPick(null);
    setResult(null);
    scan.set(0);
    setVis(HIST);
    setRound((r) => r + 1);
    log("stagger 30ms", "Новый сценарий: свечи вырастают каскадом", "#3ddc84");
    busy.current = false;
  };

  const victory = async () => {
    setShatter(true);
    sfx.shatter();
    const e = centerIn(enemyRef.current, scope.current);
    anim(scope.current, shakeKeys(1, 18, 15, 3), { duration: 0.6 });
    p.ring(e.x, e.y, "#fff", 240, 0.6, 14);
    p.burst({ x: e.x, y: e.y, count: 90, colors: ["#ff4d5e", "#ff9a3d", "#fff", "#ffc34d"], speed: [300, 850], drag: 3.5 });
    log("shatter 7×7", "Босс раскалывается волной от точки удара", "#ff4d5e");
    await sleep(1300);
    const st = heartsRef.current;
    const bonus = 150 + st * 50;
    earnedRef.current = { coins: earnedRef.current.coins + bonus, xp: earnedRef.current.xp + 100 };
    setEarned({ ...earnedRef.current });
    setPhase("victory");
    sfx.chime();
    log("overshoot ribbon", "Лента «ПОБЕДА» раскрывается scaleX с перелётом", "#ffc34d");
    await sleep(700);
    for (let i = 1; i <= st; i++) {
      setStars(i);
      await sleep(240);
      const sc = centerIn(starRefs.current[i - 1], scope.current);
      sfx.stamp();
      sfx.pop(i * 4);
      anim(scope.current, shakeKeys(0.3 + i * 0.12, 8, 7, 1), { duration: 0.28 });
      p.burst({ x: sc.x, y: sc.y, count: 24, shape: "star", colors: ["#ffc34d", "#fff"], speed: [120, 340], size: [2, 5] });
      await sleep(180);
    }
    if (st) log("stamp ×" + st, "Каждая звезда — отдельный удар с растущей trauma", "#ffc34d");
    // монеты летят в HUD
    await sleep(300);
    const t = centerIn(coinRef.current, scope.current);
    let k = 0;
    const per = Math.round(earnedRef.current.coins / 16);
    p.burst({
      x: 150, y: 380, count: 16, shape: "coin", size: [6, 8], speed: [220, 420], angle: -Math.PI / 2, spread: 2.6, drag: 1.5, gravity: 300, target: { x: t.x - 20, y: t.y }, stagger: 0.035,
      onArrive: () => {
        setCoins((c) => c + per);
        sfx.coin(k++);
        animate(coinRef.current!, { scale: [1.25, 1] }, { type: "spring", stiffness: 600, damping: 12 });
      },
    });
    log("homing coins", "Монеты разлетаются, затем магнитом летят в счётчик", "#ffc34d");
    setWins((w) => w + 1);
  };

  const choose = async (i: number) => {
    if (busy.current || phase !== "battle" || pick !== null) return;
    busy.current = true;
    setPick(i);
    sfx.tap();
    log("focus", "Выбранный: scale 1.03 + свечение, остальные тонут до 25%", "#2ee6c5");
    await sleep(380);
    sfx.whoosh(0.9);
    log("fog scan", "Один MotionValue: clip-path тумана + линия + свечи", "#4cc3ff");
    await animate(scan, 1, {
      duration: 1.2,
      ease: EASE.camera,
      onUpdate: (v) => setVis(HIST + Math.round(v * FUT)),
    });
    const ok = i === s.ok;
    if (ok) {
      setResult("ok");
      comboRef.current += 1;
      const cb = comboRef.current;
      setCombo(cb);
      setBestCombo((b) => Math.max(b, cb));
      const crit = cb >= 3;
      const v = crit ? 150 : 100;
      // орб летит к врагу
      const from = centerIn(optRefs.current[i], scope.current);
      const to = centerIn(enemyRef.current, scope.current);
      setOrb(true);
      await sleep(40);
      const el = orbRef.current!;
      await animate(el, { x: from.x - 14, y: from.y - 14, scale: 0.4 }, { duration: 0 });
      await animate(el, { scale: 1.2 }, { duration: 0.15, ease: EASE.outExpo });
      sfx.whoosh(0.25);
      const trail = window.setInterval(() => {
        const c = centerIn(el, scope.current);
        p.burst({ x: c.x, y: c.y, count: 4, speed: [10, 50], colors: ["#2ee6c5", "#fff"], shape: "dot", life: [0.25, 0.5], size: [2, 4] });
      }, 16);
      await animate(el, { x: [from.x - 14, (from.x + to.x) / 2 + 60 - 14, to.x - 14], y: [from.y - 14, (from.y + to.y) / 2 - 14, to.y - 14], scale: 0.7 }, { duration: 0.32, ease: [0.55, 0, 0.9, 0.5] });
      clearInterval(trail);
      setOrb(false);
      log("ease-in", "Удар ускоряется к цели — никогда не тормозит", "#ff4d5e");
      // hit-stop
      setFlash(true);
      await sleep(90);
      setFlash(false);
      log("hit-stop 90ms", "Мир замирает, враг заливается белым", "#ffffff");
      crit ? sfx.crit() : sfx.hit();
      anim(scope.current, shakeKeys(crit ? 1 : 0.7, 14, 12, 2.2), { duration: 0.45 });
      p.ring(to.x, to.y, "#fff", 140, 0.45, 12);
      p.ring(to.x, to.y, "#2ee6c5", 100, 0.7, 4);
      p.burst({ x: to.x, y: to.y, count: crit ? 80 : 45, colors: ["#2ee6c5", "#fff", "#ff4d5e"], speed: [250, 780], drag: 4 });
      animate(enemyX, [0, 24, 0], { duration: 0.5, ease: EASE.outExpo });
      setDmg((d) => [...d, { id: Date.now(), v, crit }]);
      log(crit ? "CRIT trauma 1.0" : "trauma² 0.7", crit ? "Комбо ≥3 — крит, золотая цифра, звон" : "Тряска = trauma² × noise", crit ? "#ffc34d" : "#ff4d5e");
      const nhp = Math.max(0, hp - v);
      setHp(nhp);
      window.setTimeout(() => setGhost(nhp), 450);
      log("ghost bar", "Белая полоса HP догоняет красную через 450мс", "#ffffff");
      earnedRef.current = { coins: earnedRef.current.coins + 30 * cb, xp: earnedRef.current.xp + 40 };
      await sleep(900);
      if (nhp <= 0) {
        await victory();
      } else await nextRound();
    } else {
      setResult("bad");
      comboRef.current = 0;
      setCombo(0);
      heartsRef.current -= 1;
      setHearts(heartsRef.current);
      sfx.error();
      anim(scope.current, shakeKeys(0.6, 10, 9, 1.5), { duration: 0.35 });
      setFlash(true);
      await sleep(60);
      setFlash(false);
      log("no-shake", "Неверный вариант «мотает головой» — затухающая синусоида", "#ff4d5e");
      await sleep(500);
      setWhy(true);
      log("sheet + blur words", "Шторка «Почему?», текст проявляется по словам", "#ff4d5e");
    }
  };

  const toHub = async () => {
    const gainedXp = earnedRef.current.xp;
    setPhase("hub");
    sfx.whoosh(0.4);
    log("depth push", "Возврат в хаб: сцена выезжает из глубины", "#9b7bff");
    if (gainedXp > 0) {
      await sleep(600);
      const nx = xp + gainedXp;
      if (nx >= XP_MAX) {
        setXp(XP_MAX);
        await sleep(700);
        setLvl((l) => l + 1);
        setXp(nx - XP_MAX);
        setLvlUp(true);
        sfx.levelup();
        p.ring(150, 90, "#9b7bff", 200, 0.8, 8);
        p.burst({ x: 150, y: 90, count: 60, shape: "star", colors: ["#9b7bff", "#fff", "#2ee6c5"], speed: [200, 560], size: [3, 6] });
        log("level up", "Переполнение XP → слот-цифра уровня + звёзды", "#9b7bff");
        await sleep(1800);
        setLvlUp(false);
      } else setXp(nx);
      earnedRef.current = { coins: 0, xp: 0 };
    }
  };

  const retry = () => {
    resetBattle();
    setRound((r) => r + 1);
    setPhase("battle");
    sfx.tap();
    log("retry", "Повтор без наказания: поражение — это приглашение", "#2ee6c5");
  };

  const hubOut = phase !== "hub";
  const inBattle = phase === "battle" || phase === "victory" || phase === "defeat";

  return (
    <div ref={scope} className="absolute inset-0 overflow-hidden bg-[#050811]">
      {/* ======================= HUB ======================= */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={hubOut ? { scale: 2.6, opacity: 0, filter: "blur(10px)" } : { scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={hubOut ? { duration: 0.7, ease: EASE.inQuart } : { type: "spring", stiffness: 140, damping: 20 }}
        style={{ transformOrigin: "50% 80%", pointerEvents: hubOut ? "none" : "auto" }}
      >
        <img src={arena} className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a16]/70 via-[#060a16]/30 to-[#060a16]" />
        <div className="absolute inset-x-3 top-11 flex gap-2">
          <div className="glass flex h-9 flex-1 items-center gap-2 rounded-full px-1.5">
            <div className="relative h-7 w-7">
              <AnimatePresence mode="popLayout">
                <motion.div key={lvl} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={SPRING.reward} className="absolute inset-0 grid place-items-center rounded-full bg-violet/25 font-display text-[10px] font-black text-violet">
                  {lvl}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#6a4dff] to-violet shadow-[0_0_10px_#9b7bff]" animate={{ width: `${(xp / XP_MAX) * 100}%` }} transition={{ duration: 0.7, ease: EASE.outExpo }} />
            </div>
            <span className="pr-2 font-mono text-[9px] text-white/60">{xp}/{XP_MAX}</span>
          </div>
          <div className="glass flex h-9 items-center gap-1.5 rounded-full pl-1.5 pr-3">
            <Coin size={20} />
            <span className="font-display text-xs font-bold tabular-nums">{fmt(coins)}</span>
          </div>
        </div>
        <div className="absolute inset-x-3 top-[96px] overflow-hidden rounded-3xl border border-bear/30 bg-[#140a14]/70">
          <div className="relative h-[210px]">
            <motion.div className="absolute left-1/2 top-2 h-[190px] w-[190px] -ml-[95px]" animate={{ y: [0, -6, 0], scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ backgroundImage: `url(${enemy})`, backgroundSize: "cover", mixBlendMode: "screen" }} />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#140a14] to-transparent" />
            <div className="absolute bottom-3 left-4">
              <div className="text-[9px] font-bold uppercase tracking-[.3em] text-bear">Босс арены</div>
              <div className="font-display text-xl font-black">FOMO</div>
            </div>
            <div className="absolute bottom-3 right-4 text-right text-[10px] text-white/55">
              {SCN.length} сценариев
              <br />3 жизни
            </div>
          </div>
        </div>
        <div className="absolute inset-x-3 top-[322px] grid grid-cols-3 gap-2">
          {[
            { l: "Побед", v: wins, c: "#3ddc84" },
            { l: "Лучшее комбо", v: bestCombo, c: "#ffc34d" },
            { l: "Уровень", v: lvl, c: "#9b7bff" },
          ].map((x, i) => (
            <div key={i} className="glass rounded-xl py-2 text-center">
              <div className="font-display text-lg font-black" style={{ color: x.c }}>{x.v}</div>
              <div className="text-[9px] text-white/45">{x.l}</div>
            </div>
          ))}
        </div>
        <div className="glass absolute inset-x-3 top-[392px] flex items-center gap-3 rounded-2xl p-3">
          <img src={hood} className="h-11 w-11 rounded-xl object-cover" />
          <div className="text-[11px] leading-snug text-white/70">
            <b className="text-teal">Наставник:</b> Оценивается решение, а не удача. Три верных подряд — крит.
          </div>
        </div>
        <motion.button
          ref={hubBtn}
          onClick={enter}
          animate={{ boxShadow: ["0 6px 0 #9a5f00, 0 0 0 0 #ffc34d88", "0 6px 0 #9a5f00, 0 0 0 18px #ffc34d00"] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          whileTap={{ scale: 0.95 }}
          className="sheen absolute inset-x-6 bottom-14 rounded-2xl bg-gradient-to-b from-[#ffd76a] to-[#e8a121] py-4 font-display text-base font-black text-[#3a2200]"
        >
          В БОЙ
        </motion.button>
        <AnimatePresence>
          {lvlUp && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 grid place-items-center bg-black/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.3, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING.reward} className="text-center">
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-[30px] border-2 border-violet" style={{ background: "linear-gradient(160deg,#3b2a7a,#140d33)", boxShadow: "0 0 50px #9b7bff" }}>
                  <span className="font-display text-5xl font-black">{lvl}</span>
                </div>
                <div className="mt-4 font-display text-xl font-black" style={{ textShadow: "0 0 20px #9b7bff" }}>НОВЫЙ УРОВЕНЬ</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ======================= DIVE TUNNEL ======================= */}
      <AnimatePresence>
        {phase === "dive" && (
          <motion.div key="tun" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div key={i} className="absolute left-1/2 h-40 w-40 -ml-20 -mt-20 rounded-full border-2" style={{ borderColor: i % 2 ? "#ffc34d" : "#2ee6c5", boxShadow: `0 0 30px ${i % 2 ? "#ffc34d" : "#2ee6c5"}` }} initial={{ scale: 0, opacity: 0, top: "82%" }} animate={{ scale: 6, opacity: [0, 1, 0], top: "40%" }} transition={{ duration: 0.7, delay: i * 0.06, ease: EASE.inQuart }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= BATTLE ======================= */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={inBattle ? { scale: 1, opacity: 1, filter: phase === "defeat" ? "grayscale(1) brightness(.6)" : "blur(0px)" } : { scale: 0.5, opacity: 0, filter: "blur(16px)" }}
        transition={inBattle ? { type: "spring", stiffness: 140, damping: 18 } : { duration: 0.3 }}
        style={{ pointerEvents: phase === "battle" ? "auto" : "none" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#2a1030_0%,#0a1122_55%,#060a16_100%)]" />
        <div className="grid-bg absolute inset-0 opacity-50" />
        {/* top bar */}
        <div className="absolute inset-x-3 top-10 flex items-center justify-between">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} animate={i < hearts ? { scale: 1, opacity: 1 } : { scale: [1.4, 0], opacity: 0.2 }} transition={{ duration: 0.4 }}>
                <I.heart size={18} className={i < hearts ? "text-bear drop-shadow-[0_0_6px_#ff4d5e]" : "text-white/20"} />
              </motion.div>
            ))}
          </div>
          <div ref={coinRef} className="glass flex h-8 items-center gap-1.5 rounded-full pl-1 pr-2.5">
            <Coin size={18} />
            <span className="font-display text-[11px] font-bold tabular-nums">{fmt(coins)}</span>
          </div>
        </div>
        {/* enemy */}
        <motion.div ref={enemyRef} className="absolute left-1/2 top-[64px] h-[112px] w-[112px] -ml-[56px]" style={{ x: enemyX, rotate: enemyR }}>
          {shatter ? (
            <Shatter img={enemy} size={112} go origin={{ x: 0.5, y: 0.55 }} />
          ) : (
            <motion.div className="h-full w-full" animate={{ scale: [1, 1.04, 1], y: [0, -3, 0] }} transition={{ duration: 2.4, repeat: Infinity }} style={{ backgroundImage: `url(${enemy})`, backgroundSize: "cover", mixBlendMode: "screen", filter: flash && result === "ok" ? "brightness(4) saturate(0)" : "none" }} />
          )}
          <AnimatePresence>
            {dmg.map((d) => (
              <motion.div
                key={d.id}
                initial={{ scale: 2.6, opacity: 0, y: 0, rotate: -8 }}
                animate={{ scale: [2.6, 0.9, 1.05], opacity: 1, y: -24, rotate: 0 }}
                exit={{ opacity: 0, y: -60, transition: { duration: 0.5, ease: EASE.inQuart } }}
                transition={{ duration: 0.4, ease: EASE.overshoot }}
                onAnimationComplete={() => window.setTimeout(() => setDmg((x) => x.filter((y) => y.id !== d.id)), 400)}
                className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap text-center font-display font-black"
              >
                {d.crit && <div className="text-[9px] tracking-[.3em] text-gold">КРИТ</div>}
                <div className={d.crit ? "text-3xl text-gold" : "text-2xl text-white"} style={{ WebkitTextStroke: "1.5px #3a0010", textShadow: "0 3px 0 #3a0010, 0 0 18px #ff4d5e" }}>-{d.v}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="absolute inset-x-6 top-[180px]">
          <div className="flex justify-between text-[9px] font-bold">
            <span>FOMO</span>
            <span className="font-mono text-white/60">{hp}/{MAX_HP}</span>
          </div>
          <div className="relative mt-1 h-2.5 overflow-hidden rounded-full border border-white/10 bg-black/50">
            <motion.div className="absolute inset-y-0 left-0 bg-white/80" animate={{ width: `${(ghost / MAX_HP) * 100}%` }} transition={{ duration: 0.6, ease: EASE.camera }} />
            <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#b3122a] to-bear shadow-[0_0_10px_#ff4d5e]" animate={{ width: `${(hp / MAX_HP) * 100}%` }} transition={{ duration: 0.08 }} />
          </div>
        </div>
        {/* combo */}
        <AnimatePresence mode="popLayout">
          {combo > 0 && (
            <motion.div key={combo} initial={{ scale: 2, rotate: -15, opacity: 0 }} animate={{ scale: 1, rotate: -6, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 16 }} className="absolute right-4 top-[120px] font-display text-2xl font-black italic" style={{ color: combo >= 3 ? "#ffc34d" : "#2ee6c5", textShadow: `0 0 16px ${combo >= 3 ? "#ffc34d" : "#2ee6c5"}` }}>
              x{combo}
            </motion.div>
          )}
        </AnimatePresence>
        {/* chart */}
        <div className="glass absolute inset-x-3 top-[206px] h-[150px] overflow-hidden rounded-2xl p-2.5">
          <div className="flex justify-between text-[9px] font-bold text-white/45">
            <span>СЦЕНАРИЙ {round + 1}</span>
            <span>BTC/USDT · 15M</span>
          </div>
          <div className="relative mt-1">
            <Candles key={round} data={chart} w={W} h={112} visible={vis} step={0.025} highlight={HIST - 1} />
            <div className="absolute inset-y-0 border-l border-dashed border-teal/70" style={{ left: t0 }} />
            <motion.div className="absolute inset-y-0 right-0 overflow-hidden rounded-r-lg" style={{ left: t0 + 2, clipPath: fogClip }}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a2748]/95 to-[#0d1530]/95" />
              <motion.div className="absolute inset-0 opacity-50" style={{ background: "repeating-linear-gradient(115deg, transparent 0 10px, #2ee6c511 10px 12px)" }} animate={{ backgroundPositionX: ["0px", "40px"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
              <div className="absolute inset-0 grid place-items-center"><I.eye size={18} className="text-white/30" /></div>
            </motion.div>
            {pick !== null && <motion.div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_14px_4px_#2ee6c5]" style={{ x: scanX }} />}
          </div>
        </div>
        {/* question */}
        <AnimatePresence mode="wait">
          <motion.div key={round} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: EASE.outExpo }} className="absolute inset-x-4 top-[364px] text-[12px] font-bold leading-snug text-white/85">
            {s.q}
          </motion.div>
        </AnimatePresence>
        {/* options */}
        <div className="absolute inset-x-3 top-[410px] space-y-2">
          {s.opts.map((o, i) => {
            const isPick = pick === i;
            const reveal = result !== null;
            const good = reveal && i === s.ok;
            const bad = reveal && isPick && result === "bad";
            return (
              <motion.button
                key={`${round}-${i}`}
                ref={(el) => { optRefs.current[i] = el; }}
                onClick={() => choose(i)}
                initial={{ x: 60, opacity: 0 }}
                animate={
                  bad
                    ? { x: [0, 12, -10, 8, -5, 3, 0], opacity: 1, scale: 1 }
                    : pick === null
                      ? { x: 0, opacity: 1, scale: 1 }
                      : isPick || good
                        ? { x: 0, opacity: 1, scale: 1.03 }
                        : { x: 0, opacity: 0.25, scale: 0.95 }
                }
                transition={bad ? { duration: 0.5 } : { delay: pick === null ? i * 0.06 : 0, ...SPRING.panel }}
                whileTap={{ scale: 0.96 }}
                className="relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left text-[12.5px] font-bold"
                style={{
                  borderColor: good ? "#3ddc84" : bad ? "#ff4d5e" : isPick ? "#2ee6c5" : "#ffffff1a",
                  background: good ? "#3ddc8422" : bad ? "#ff4d5e22" : isPick ? "#2ee6c51a" : "#ffffff08",
                  boxShadow: good ? "0 0 24px -4px #3ddc84" : isPick ? "0 0 24px -6px #2ee6c5" : "none",
                }}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 font-mono text-[11px]">{"ABC"[i]}</span>
                {o}
                {good && <I.check size={16} className="ml-auto text-bull" stroke={3} />}
                {bad && <I.x size={16} className="ml-auto text-bear" stroke={3} />}
              </motion.button>
            );
          })}
        </div>
        {/* why sheet */}
        <AnimatePresence>
          {why && (
            <motion.div initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="absolute inset-x-0 bottom-0 z-20 rounded-t-[28px] border-t border-bear/40 bg-gradient-to-b from-[#3a0c16] to-[#1a060b] px-5 pb-7 pt-3" style={{ pointerEvents: "auto" }}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" />
              <div className="font-display text-xl font-black text-bear">ПОЧЕМУ?</div>
              <p className="mt-2 text-[12px] leading-relaxed text-white/80">
                {s.why.split(" ").map((w, i) => (
                  <motion.span key={i} initial={{ opacity: 0, filter: "blur(6px)", y: 4 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ delay: 0.2 + i * 0.03, duration: 0.3 }} className="mr-1 inline-block">{w}</motion.span>
                ))}
              </p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={nextRound} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, ...SPRING.panel }} className="mt-4 w-full rounded-xl bg-teal py-3 text-xs font-bold text-[#022]">
                {hearts <= 0 ? "ЗАВЕРШИТЬ" : "ПОНЯЛ, ДАЛЬШЕ"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* orb projectile */}
      {orb && <div ref={orbRef} className="absolute left-0 top-0 z-30 h-7 w-7 rounded-full bg-white" style={{ boxShadow: "0 0 20px 8px #2ee6c5, 0 0 40px #2ee6c5" }} />}
      <motion.div className="pointer-events-none absolute inset-0 z-30" animate={{ background: flash ? (result === "bad" ? "#ff4d5e55" : "#ffffff22") : "#00000000" }} transition={{ duration: flash ? 0 : 0.3 }} />

      {/* ======================= VICTORY ======================= */}
      <AnimatePresence>
        {phase === "victory" && (
          <motion.div key="vic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 bg-black/55 backdrop-blur-[2px]">
            <motion.div className="absolute left-1/2 top-[250px] h-[560px] w-[560px] -ml-[280px] -mt-[280px]" style={{ background: "repeating-conic-gradient(#ffc34d30 0 7deg, transparent 7deg 22deg)", WebkitMaskImage: "radial-gradient(closest-side,#000 20%,transparent)", maskImage: "radial-gradient(closest-side,#000 20%,transparent)" }} initial={{ scale: 0 }} animate={{ scale: 1, rotate: 90 }} transition={{ scale: { duration: 0.8, ease: EASE.outExpo }, rotate: { duration: 10, ease: "linear" } }} />
            <div className="absolute inset-x-0 top-[120px]">
              <motion.div className="mx-6 rounded-xl bg-gradient-to-b from-[#ffd76a] to-[#c8801a] py-3 shadow-[0_0_40px_#ffc34d88]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.5, ease: EASE.overshoot }}>
                <div className="flex justify-center">
                  {"ПОБЕДА".split("").map((l, i) => (
                    <motion.span key={i} className="font-display text-3xl font-black text-[#3a2200]" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 + i * 0.05, ...SPRING.reward }}>{l}</motion.span>
                  ))}
                </div>
              </motion.div>
              <div className="mt-6 flex items-end justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} ref={(el) => { starRefs.current[i] = el; }} className={i === 1 ? "-translate-y-4" : ""}>
                    <motion.svg width={i === 1 ? 60 : 46} height={i === 1 ? 60 : 46} viewBox="0 0 24 24" initial={false} animate={stars > i ? { scale: [3, 0.85, 1], rotate: [-45, 10, 0] } : { scale: 1 }} transition={{ duration: 0.35, ease: EASE.snap }}>
                      <path d="M12 2l3 7 7 .6-5.3 4.7 1.6 7.2L12 17.8 5.7 21.5l1.6-7.2L2 9.6 9 9z" fill={stars > i ? "#ffc34d" : "#ffffff14"} stroke={stars > i ? "#fff6cc" : "#ffffff22"} style={{ filter: stars > i ? "drop-shadow(0 0 8px #ffc34d)" : "none" }} />
                    </motion.svg>
                  </div>
                ))}
              </div>
            </div>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9, ...SPRING.panel }} className="absolute inset-x-5 top-[330px] grid grid-cols-2 gap-2">
              <div className="glass rounded-xl py-3 text-center">
                <div className="font-display text-xl font-black text-gold">+<CountUp to={earned.coins} delay={1} /></div>
                <div className="text-[9px] text-white/50">монет</div>
              </div>
              <div className="glass rounded-xl py-3 text-center">
                <div className="font-display text-xl font-black text-violet">+<CountUp to={earned.xp} delay={1.05} /></div>
                <div className="text-[9px] text-white/50">XP мастерства</div>
              </div>
            </motion.div>
            <motion.button initial={{ y: 80 }} animate={{ y: 0 }} transition={{ delay: 1.4, ...SPRING.panel }} whileTap={{ scale: 0.95 }} onClick={toHub} className="sheen absolute inset-x-8 bottom-12 rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3.5 font-display text-sm font-black text-[#032a24] shadow-[0_6px_0_#0a7563]">
              ЗАБРАТЬ И В ХАБ
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= DEFEAT ======================= */}
      <AnimatePresence>
        {phase === "defeat" && (
          <motion.div key="def" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40">
            <motion.div initial={{ y: -300 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, mass: 2 }} className="absolute inset-x-0 top-[200px] text-center font-display text-4xl font-black" style={{ textShadow: "0 6px 0 #000" }}>
              ПОРАЖЕНИЕ
            </motion.div>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9, ...SPRING.panel }} className="glass absolute inset-x-5 top-[270px] rounded-2xl border-teal/40 p-3 text-center text-[12px] text-white/70">
              Ошибки — это данные. Каждая разобранная ловушка остаётся с тобой.
            </motion.div>
            <motion.button initial={{ y: 80 }} animate={{ y: 0, boxShadow: ["0 0 0 0 #2ee6c588", "0 0 0 16px #2ee6c500"] }} transition={{ y: { delay: 1.1, ...SPRING.panel }, boxShadow: { duration: 1.4, repeat: Infinity } }} whileTap={{ scale: 0.95 }} onClick={retry} className="absolute inset-x-8 bottom-28 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#4ff5d8] to-[#16b89c] py-3.5 font-display text-sm font-black text-[#032a24]">
              <I.replay size={16} stroke={2.5} /> ЕЩЁ РАЗ
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} onClick={toHub} className="absolute inset-x-8 bottom-14 py-2 text-xs font-bold text-white/50">
              В хаб
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ============================ PAGE ============================ */
export default function Play() {
  const [events, setEvents] = useState<LogEv[]>([]);
  const [count, setCount] = useState(0);
  const muted = useMuted();
  const log = useCallback((tag: string, t: string, c = "#2ee6c5") => {
    setEvents((e) => [{ id: Date.now() + Math.random(), t, c, tag }, ...e].slice(0, 9));
    setCount((n) => n + 1);
  }, []);
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[700px] bg-[radial-gradient(60%_60%_at_50%_0%,#ff4d5e1f,transparent_70%)]" />
      <div className="grid-bg pointer-events-none absolute inset-x-0 top-0 h-[700px] opacity-40 [mask-image:linear-gradient(#000,transparent)]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-24">
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-bear/30 bg-bear/10 px-3 py-1 text-[11px] font-bold text-bear">
            <span className="h-1.5 w-1.5 rounded-full bg-bear blink" /> Играбельный цикл
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: EASE.outExpo }} className="mt-4 font-display text-5xl font-black sm:text-6xl">
            Сыграй. <span className="text-white/40">Почувствуй.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mx-auto mt-4 max-w-2xl text-white/60">
            Полный игровой цикл Signal Arena: хаб → портал → бой с боссом → победа или поражение → прокачка. Справа — живой журнал: какой моушен-приём сработал и зачем.
          </motion.p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => sound.toggle()} className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${muted ? "border-white/15 text-white/60" : "border-teal bg-teal/15 text-teal"}`}>
            <I.bolt size={14} /> {muted ? "Включить звук и вибрацию" : "Звук включён"}
          </motion.button>
        </div>
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_auto_1fr]">
          {/* how to */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, ...SPRING.panel }} className="order-2 space-y-3 lg:order-1">
            <div className="text-xs font-bold uppercase tracking-[.3em] text-white/40">Как играть</div>
            {[
              [I.swords, "Нажми «В бой»", "Кнопка втянет энергию, и камера нырнёт в арену."],
              [I.eye, "Читай ситуацию", "Будущее графика скрыто туманом до твоего решения."],
              [I.target, "Выбирай решение", "Верно — энергия бьёт босса. Три подряд — крит."],
              [I.heart, "3 жизни", "Ошибка отнимает сердце и открывает разбор «Почему?»."],
              [I.trophy, "Победа", "Босс раскалывается, звёзды за оставшиеся жизни, монеты летят в кошелёк."],
            ].map(([Ic, t, d], i) => {
              const Icon = Ic as typeof I.bolt;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.06, ...SPRING.panel }} className="flex gap-3 rounded-2xl border border-white/5 bg-white/[.02] p-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal"><Icon size={17} /></div>
                  <div>
                    <div className="text-sm font-bold">{t as string}</div>
                    <div className="text-xs text-white/50">{d as string}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          {/* phone */}
          <motion.div initial={{ opacity: 0, y: 60, rotateX: 20 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 90, damping: 16 }} className="order-1 flex justify-center lg:order-2" style={{ perspective: 1200 }}>
            <div className="origin-top sm:scale-110">
              <Phone tint="#ff4d5e">
                <Game log={log} />
              </Phone>
            </div>
          </motion.div>
          {/* log */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, ...SPRING.panel }} className="order-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-[.3em] text-white/40">Журнал моушена</div>
              <div className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-[11px] text-white/60">
                событий: <motion.span key={count} initial={{ color: "#2ee6c5", scale: 1.4 }} animate={{ color: "#ffffff99", scale: 1 }} className="inline-block">{count}</motion.span>
              </div>
            </div>
            <div className="relative mt-4 min-h-[420px] space-y-2">
              {events.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">Начни бой — здесь появятся приёмы, которые сработали</div>
              )}
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div
                    key={e.id}
                    layout
                    initial={{ opacity: 0, x: 60, scale: 0.9 }}
                    animate={{ opacity: 1 - i * 0.08, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={SPRING.panel}
                    className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[.03] p-3"
                  >
                    <motion.div className="absolute inset-0" initial={{ opacity: 0.4 }} animate={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{ background: e.c }} />
                    <div className="relative flex items-start gap-2.5">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: e.c, boxShadow: `0 0 8px ${e.c}` }} />
                      <div>
                        <div className="font-mono text-[11px] font-bold" style={{ color: e.c }}>{e.tag}</div>
                        <div className="text-xs text-white/65">{e.t}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
