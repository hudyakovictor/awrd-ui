import { animate, motion, useAnimate } from "framer-motion";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Code, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, sleep, type Bezier } from "../motion/tokens";
import { sfx, sound, useMuted } from "../motion/sfx";

function Lab({ n, title, sub, children, color = "#2ee6c5" }: { n: string; title: string; sub: string; children: ReactNode; color?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 100, damping: 18 }}
      className="relative overflow-hidden rounded-[28px] border border-white/[.07] bg-gradient-to-b from-[#101a30] to-[#0a1122] p-6 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm" style={{ color }}>{n}</span>
        <h3 className="font-display text-2xl font-bold">{title}</h3>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-white/55">{sub}</p>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function Btn({ onClick, children, color = "#2ee6c5" }: { onClick: () => void; children: ReactNode; color?: string }) {
  return (
    <motion.button whileTap={{ scale: 0.93 }} whileHover={{ y: -2 }} onClick={onClick} className="rounded-xl px-4 py-2 text-xs font-bold text-black" style={{ background: color, boxShadow: `0 6px 20px -6px ${color}` }}>
      {children}
    </motion.button>
  );
}

function Slider({ label, v, set, min, max, step = 1 }: { label: string; v: number; set: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-[11px]"><span className="text-white/55">{label}</span><span className="font-mono font-bold">{v}</span></div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} className="w-full accent-[#2ee6c5]" />
    </label>
  );
}

/* ---------- 1. Easing race ---------- */
function EasingRace() {
  const [k, setK] = useState(0);
  const list: [string, Bezier | "linear", string][] = [
    ["linear — НИКОГДА для UI", "linear", "#ffffff55"],
    ["outExpo — вход", EASE.outExpo, "#2ee6c5"],
    ["inQuart — выход", EASE.inQuart, "#ff4d5e"],
    ["overshoot — награда", EASE.overshoot, "#ffc34d"],
    ["camera — большие сдвиги", EASE.camera, "#4cc3ff"],
    ["anticipate — замах", EASE.anticipate, "#9b7bff"],
  ];
  return (
    <div>
      <div className="space-y-2">
        {list.map(([l, e, c]) => (
          <div key={l} className="flex items-center gap-4">
            <div className="w-48 shrink-0 text-xs text-white/60">{l}</div>
            <div className="relative h-8 flex-1 rounded-lg bg-white/[.03]">
              <motion.div key={k} className="absolute top-1 h-6 w-6 rounded-md" style={{ background: c, boxShadow: `0 0 14px ${c}` }} initial={{ left: "0%" }} animate={{ left: k ? "calc(100% - 24px)" : "0%" }} transition={{ duration: 1.2, ease: e }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5"><Btn onClick={() => setK((x) => x + 1)}>Старт гонки</Btn></div>
    </div>
  );
}

/* ---------- 2. Spring lab ---------- */
function simulate(k: number, c: number, m: number) {
  const pts: number[] = [];
  let x = 0, v = 0;
  const dt = 1 / 120;
  for (let i = 0; i < 240; i++) {
    const f = -k * (x - 1) - c * v;
    v += (f / m) * dt;
    x += v * dt;
    if (i % 2 === 0) pts.push(x);
  }
  return pts;
}
function SpringLab() {
  const [k, setK] = useState(260), [c, setC] = useState(13), [m, setM] = useState(1);
  const [go, setGo] = useState(false);
  const pts = useMemo(() => simulate(k, c, m), [k, c, m]);
  const max = Math.max(1.05, ...pts);
  const W = 420, H = 150;
  const d = pts.map((p, i) => `${i ? "L" : "M"}${(i / (pts.length - 1)) * W},${H - (p / max) * (H - 10)}`).join(" ");
  const presets: [string, number, number, number][] = [["tap", 700, 30, 0.6], ["panel", 380, 32, 0.9], ["reward", 260, 13, 1], ["heavy", 160, 20, 2.2]];
  const ratio = (c / (2 * Math.sqrt(k * m))).toFixed(2);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-4">
        <Slider label="stiffness (жёсткость)" v={k} set={setK} min={40} max={900} step={10} />
        <Slider label="damping (затухание)" v={c} set={setC} min={2} max={60} />
        <Slider label="mass (масса)" v={m} set={setM} min={0.2} max={4} step={0.1} />
        <div className="flex flex-wrap gap-2">
          {presets.map(([n, a, b, mm]) => (
            <button key={n} onClick={() => { setK(a); setC(b); setM(mm); }} className="rounded-lg border border-white/10 px-3 py-1.5 font-mono text-[11px] hover:border-teal/50">SPRING.{n}</button>
          ))}
        </div>
        <div className="rounded-xl bg-black/30 p-3 text-xs text-white/60">
          Коэффициент затухания ζ = <b className="font-mono text-white">{ratio}</b> — {+ratio < 1 ? "перелёт и колебания (живо, игриво)" : "без перелёта (строго, тяжело)"}
        </div>
      </div>
      <div>
        <div className="relative rounded-2xl bg-black/30 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full">
            <line x1="0" x2={W} y1={H - (1 / max) * (H - 10)} y2={H - (1 / max) * (H - 10)} stroke="#ffffff22" strokeDasharray="4 4" />
            <path d={d} fill="none" stroke="#2ee6c5" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 5px #2ee6c5)" }} />
          </svg>
          <div className="relative mt-4 h-14 rounded-xl bg-white/[.03]">
            <motion.div className="absolute top-2 h-10 w-10 rounded-xl bg-teal shadow-[0_0_20px_#2ee6c5]" animate={{ left: go ? "calc(100% - 48px)" : "8px" }} transition={{ type: "spring", stiffness: k, damping: c, mass: m }} />
          </div>
        </div>
        <div className="mt-4"><Btn onClick={() => setGo((g) => !g)}>Толкнуть</Btn></div>
      </div>
    </div>
  );
}

/* ---------- 3. Ripple stagger ---------- */
function RippleStagger() {
  const [ms, setMs] = useState(35);
  const [k, setK] = useState(0);
  const [o, setO] = useState({ x: 3, y: 2 });
  const cols = 8, rows = 5;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-4">
        <Slider label="мс на единицу расстояния" v={ms} set={setMs} min={0} max={150} />
        <p className="text-xs leading-relaxed text-white/50">Каскад по <b className="text-white">расстоянию от точки касания</b>, а не по индексу. Волна расходится от пальца — интерфейс «отвечает» туда, где его тронули. 30–50мс — сладкая зона.</p>
        <Code code={`const d = Math.hypot(col - ox, row - oy);
transition={{ delay: d * ${ms / 1000}, ...SPRING.reward }}`} />
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols * rows }).map((_, i) => {
          const x = i % cols, y = Math.floor(i / cols);
          const dd = Math.hypot(x - o.x, y - o.y);
          return (
            <motion.button
              key={`${i}-${k}`}
              onClick={() => { setO({ x, y }); setK((v) => v + 1); }}
              className="aspect-square rounded-lg"
              initial={k ? { scale: 0.3, opacity: 0.2, background: "#ffc34d" } : false}
              animate={{ scale: 1, opacity: 1, background: "#2ee6c533" }}
              transition={{ delay: (dd * ms) / 1000, ...SPRING.reward, background: { delay: (dd * ms) / 1000 + 0.2, duration: 0.6 } }}
              style={{ boxShadow: "inset 0 0 0 1px #2ee6c544" }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 4. Trauma shake ---------- */
function ShakeLab() {
  const [scope, anim] = useAnimate();
  const [t, setT] = useState(0.8);
  const [sq, setSq] = useState(true);
  const hit = () => {
    const n = 16, x = [0], y = [0], r = [0];
    for (let i = 0; i < n; i++) {
      const tr = t * (1 - i / n);
      const s = sq ? tr * tr : tr;
      x.push((Math.random() * 2 - 1) * 18 * s);
      y.push((Math.random() * 2 - 1) * 18 * s);
      r.push((Math.random() * 2 - 1) * 4 * s);
    }
    x.push(0); y.push(0); r.push(0);
    anim(scope.current, { x, y, rotate: r }, { duration: 0.5 });
  };
  const curve = Array.from({ length: 30 }, (_, i) => { const tr = t * (1 - i / 29); return sq ? tr * tr : tr; });
  return (
    <div className="grid items-center gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Slider label="trauma (0–1)" v={t} set={setT} min={0.1} max={1} step={0.05} />
        <div className="flex gap-2">
          <button onClick={() => setSq(false)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${!sq ? "bg-bear text-black" : "border border-white/10 text-white/60"}`}>линейно</button>
          <button onClick={() => setSq(true)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${sq ? "bg-teal text-black" : "border border-white/10 text-white/60"}`}>trauma²</button>
        </div>
        <svg viewBox="0 0 300 60" className="h-16 w-full rounded-xl bg-black/30">
          <path d={curve.map((v, i) => `${i ? "L" : "M"}${(i / 29) * 300},${58 - v * 54}`).join(" ")} fill="none" stroke={sq ? "#2ee6c5" : "#ff4d5e"} strokeWidth="2.5" />
        </svg>
        <p className="text-xs text-white/50">Квадрат даёт резкий пик и быстрое успокоение: маленькие удары почти не трясут, большие — трясут сильно. Линейная тряска «дребезжит» одинаково всегда.</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <div ref={scope} className="grid h-44 w-72 place-items-center rounded-3xl border border-white/10 bg-gradient-to-b from-[#1d2b4f] to-[#0c1428]">
          <div className="font-display text-4xl font-black text-bear" style={{ textShadow: "0 0 20px #ff4d5e" }}>-420</div>
        </div>
        <Btn onClick={hit} color="#ff4d5e">Удар</Btn>
      </div>
    </div>
  );
}

/* ---------- 5. Hit-stop ---------- */
function HitStopLab() {
  const rows = [false, true];
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const tgt = useRef<(HTMLDivElement | null)[]>([]);
  const p = useParticles();
  const box = useRef<HTMLDivElement>(null);
  const fire = async () => {
    rows.forEach(async (stop, i) => {
      const el = refs.current[i]!, t = tgt.current[i]!;
      await animate(el, { x: -10 }, { duration: 0.1 });
      await animate(el, { x: 220 }, { duration: 0.14, ease: [0.55, 0, 0.9, 0.5] });
      if (stop) {
        t.style.filter = "brightness(4)";
        await sleep(90);
        t.style.filter = "none";
      }
      const r = t.getBoundingClientRect(), b = box.current!.getBoundingClientRect();
      p.burst({ x: r.left - b.left + 10, y: r.top - b.top + r.height / 2, count: 24, speed: [150, 400], colors: ["#fff", "#ffc34d"] });
      animate(t, { x: [0, 26, 0] }, { duration: 0.4, ease: EASE.outExpo });
      await animate(el, { x: 0 }, SPRING.panel);
    });
  };
  return (
    <div>
      <div ref={box} className="relative space-y-4 rounded-2xl bg-black/30 p-5">
        {rows.map((stop, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-28 text-xs font-bold" style={{ color: stop ? "#2ee6c5" : "#ffffff66" }}>{stop ? "С hit-stop 90мс" : "Без hit-stop"}</div>
            <div className="relative h-14 flex-1">
              <div ref={(e) => { refs.current[i] = e; }} className="absolute left-0 top-2 h-10 w-10 rounded-xl bg-gold shadow-[0_0_16px_#ffc34d]" />
              <div ref={(e) => { tgt.current[i] = e; }} className="absolute left-[260px] top-0 h-14 w-14 rounded-2xl bg-bear shadow-[0_0_20px_#ff4d5e]" />
            </div>
          </div>
        ))}
        <ParticleCanvas canvasRef={p.ref} />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Btn onClick={fire} color="#ffc34d">Ударить оба</Btn>
        <span className="text-xs text-white/50">Смотри на нижний: удар «весит» больше при той же длительности анимации.</span>
      </div>
    </div>
  );
}


/* ---------- 6. Sound board ---------- */
const SOUNDS: { k: keyof typeof sfx; t: string; d: string; c: string }[] = [
  { k: "tap", t: "Tap", d: "треугольник 620→380 Гц, 60мс", c: "#2ee6c5" },
  { k: "whoosh", t: "Whoosh", d: "шум, полоса 350→3200 Гц", c: "#4cc3ff" },
  { k: "hit", t: "Hit", d: "саб 160→38 + щелчок + шум", c: "#ff4d5e" },
  { k: "crit", t: "Crit", d: "удар + мажорный звон", c: "#ffc34d" },
  { k: "impact", t: "Impact", d: "70→28 Гц, 0.9с, lowpass-шум", c: "#ff4d5e" },
  { k: "coin", t: "Coin", d: "два square-тона квинтой", c: "#ffc34d" },
  { k: "chime", t: "Chime", d: "арпеджио 0-4-7-12", c: "#3ddc84" },
  { k: "levelup", t: "Level up", d: "11 нот вверх + шиммер", c: "#9b7bff" },
  { k: "error", t: "Error", d: "пила 233→150 + вибро", c: "#ff4d5e" },
  { k: "glitch", t: "Glitch", d: "7 случайных square-щелчков", c: "#4cc3ff" },
  { k: "heartbeat", t: "Heartbeat", d: "«лаб-дап» 62/56 Гц", c: "#ff4d5e" },
  { k: "shatter", t: "Shatter", d: "12 стеклянных тонов + импакт", c: "#ff6bd6" },
];
function SoundBoard() {
  const muted = useMuted();
  const [act, setAct] = useState<{ i: number; k: number } | null>(null);
  return (
    <div>
      {muted && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 p-3 text-xs text-gold">
          Звук выключен. <Btn onClick={() => sound.toggle()} color="#ffc34d">Включить</Btn>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {SOUNDS.map((x, i) => (
          <motion.button
            key={x.k}
            whileTap={{ scale: 0.94 }}
            onClick={() => { (sfx[x.k] as (a?: number) => void)(); setAct({ i, k: Date.now() }); }}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/25 p-3 text-left"
          >
            <div className="flex h-8 items-end gap-[3px]">
              {Array.from({ length: 14 }).map((_, j) => (
                <motion.span
                  key={`${j}-${act?.i === i ? act.k : 0}`}
                  className="w-1 rounded-sm"
                  style={{ background: x.c, height: 3 }}
                  animate={act?.i === i ? { height: [3, 4 + Math.abs(Math.sin(j * 1.7 + i)) * 26, 3] } : { height: 3 }}
                  transition={{ duration: 0.5, delay: j * 0.015, ease: EASE.outExpo }}
                />
              ))}
            </div>
            <div className="mt-2 font-display text-sm font-bold" style={{ color: x.c }}>{x.t}</div>
            <div className="text-[10px] text-white/45">{x.d}</div>
          </motion.button>
        ))}
      </div>
      <p className="mt-4 text-xs text-white/50">Весь звук синтезирован на WebAudio: осцилляторы, шум и фильтры. Ноль аудиофайлов, общий компрессор склеивает слои. Вибрация синхронна с ударами на мобильных.</p>
    </div>
  );
}

/* ---------- 7. Squash & stretch ---------- */
function SquashLab() {
  const [amt, setAmt] = useState(0.35);
  const [k, setK] = useState(0);
  const a = amt;
  return (
    <div className="grid items-center gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Slider label="сила деформации" v={amt} set={setAmt} min={0} max={0.6} step={0.05} />
        <p className="text-xs leading-relaxed text-white/50">Объём сохраняется: scaleX × scaleY ≈ 1. В полёте мяч вытягивается по скорости, в касании — сплющивается, затем перелетает в обратную сторону. При 0 это «камень», при 0.35 — «резина».</p>
        <Code code={`scaleY: [1, 1 + ${a.toFixed(2)}, 1 - ${a.toFixed(2)}, 1 + ${(a / 3).toFixed(2)}, 1],
scaleX: [1, 1 - ${(a / 2).toFixed(2)}, 1 + ${a.toFixed(2)}, 1 - ${(a / 4).toFixed(2)}, 1],
times:  [0, .45, .5, .7, 1]`} />
        <Btn onClick={() => setK((x) => x + 1)} color="#9b7bff">Бросить</Btn>
      </div>
      <div className="relative h-64 overflow-hidden rounded-2xl bg-black/30">
        <div className="absolute inset-x-0 bottom-8 h-px bg-white/20" />
        {[0, 1].map((n) => (
          <motion.div
            key={`${k}-${n}`}
            className="absolute bottom-8 h-14 w-14 rounded-full"
            style={{ left: n ? "62%" : "22%", transformOrigin: "50% 100%", background: n ? "radial-gradient(circle at 35% 30%,#d6c8ff,#9b7bff 60%,#4a2fb0)" : "radial-gradient(circle at 35% 30%,#bbb,#666)", boxShadow: n ? "0 0 20px #9b7bff88" : "none" }}
            initial={{ y: -170 }}
            animate={{
              y: [-170, 0, 0, -60, 0],
              scaleY: n ? [1, 1 + a, 1 - a, 1 + a / 3, 1] : 1,
              scaleX: n ? [1, 1 - a / 2, 1 + a, 1 - a / 4, 1] : 1,
            }}
            transition={{ duration: 1.2, times: [0, 0.45, 0.5, 0.75, 1], ease: ["easeIn", "linear", "easeOut", "easeIn"] }}
          />
        ))}
        <div className="absolute bottom-2 left-[22%] w-14 text-center text-[10px] text-white/40">без</div>
        <div className="absolute bottom-2 left-[62%] w-14 text-center text-[10px] text-violet">squash</div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
const LAWS = [
  ["Сцена, а не элемент", "Анимируй момент игрового опыта целиком: вход, конфликт, развязку. Кнопка — лишь актёр."],
  ["Замах → действие → отдача", "Anticipation 80–150мс, действие 150–300мс, follow-through 300–600мс. Выкинь любую фазу — и движение станет пластиковым."],
  ["Вход медленнее выхода", "Появление: 280–640мс outExpo. Исчезновение: 120–200мс inQuart. Уходящее не должно мешать приходящему."],
  ["Удар ускоряется", "Атака и падение — ease-in. Замедление перед контактом убивает силу удара."],
  ["Hit-stop 60–120мс", "Заморозка кадра в момент контакта даёт мозгу «прочитать» удар. Вместе со вспышкой цели — вес без увеличения урона."],
  ["Слои, а не громкость", "Сильный момент = флэш + кольцо + частицы + тряска + звук одновременно. Один слой громче ≠ сильнее."],
  ["Одно значение — много эффектов", "MotionValue и useTransform: один прогресс управляет clip-path, позицией и счётчиком. Синхрон бесплатно."],
  ["Пространство, а не слайды", "Depth push, shared element, направленные переходы. Игрок всегда знает, откуда пришёл и куда вернётся."],
  ["Пружины для пальца, кривые для камеры", "Всё, что трогает игрок, — пружина (прерываемая, с инерцией). Кинематографичные пролёты — cubic-bezier."],
  ["Бесконечное — линейно", "Вращение сирены, бегущий пунктир, бегущая строка — только linear. Easing на лупе = «дыхание» и подёргивание."],
  ["Только transform и opacity", "Всё тяжёлое (blur, shadow) — на короткие моменты. 60 FPS важнее ещё одного эффекта."],
  ["Уважай reduced-motion", "prefers-reduced-motion: оставь смысл (цвет, opacity), убери тряску, параллакс и полёты."],
];

export default function Codex() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(60%_60%_at_70%_0%,#ffc34d22,transparent_70%)]" />
      <header className="relative mx-auto max-w-7xl px-5 pb-10 pt-28">
        <div className="text-xs font-bold uppercase tracking-[.3em] text-gold">Кодекс секретов</div>
        <motion.h1 initial={{ opacity: 0, y: 30, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, ease: EASE.outExpo }} className="mt-3 max-w-4xl font-display text-5xl font-black leading-[1.05] sm:text-7xl">
          Всё, что отличает <span className="text-gold">AAA</span> от «анимированного сайта»
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 max-w-2xl text-lg text-white/60">
          12 законов, токены движения и 7 лабораторий, где каждый секрет можно потрогать руками.
        </motion.p>
      </header>

      <section className="relative mx-auto max-w-7xl px-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LAWS.map(([t, d], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotateX: 25 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: (i % 3) * 0.07, type: "spring", stiffness: 140, damping: 18 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.02] p-5"
            >
              <div className="absolute -right-4 -top-6 font-display text-8xl font-black text-white/[.03] transition-colors group-hover:text-gold/10">{String(i + 1).padStart(2, "0")}</div>
              <div className="relative flex items-center gap-2 font-display text-base font-bold">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-gold/15 font-mono text-[11px] text-gold">{i + 1}</span>
                {t}
              </div>
              <p className="relative mt-2 text-sm leading-relaxed text-white/55">{d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl space-y-6 px-5 py-16">
        <Lab n="LAB 01" title="Гонка кривых" sub="Одинаковая длительность 1.2с — совершенно разный характер. Каждая кривая имеет роль, а не вкус.">
          <EasingRace />
        </Lab>
        <Lab n="LAB 02" title="Конструктор пружин" sub="Пружина описывается физикой, а не временем. Её можно прервать на лету — поэтому всё, что трогает палец, должно быть пружиной." color="#9b7bff">
          <SpringLab />
        </Lab>
        <Lab n="LAB 03" title="Волновой каскад" sub="Нажми на любую плитку. Задержка считается от расстояния до точки касания." color="#ffc34d">
          <RippleStagger />
        </Lab>
        <Lab n="LAB 04" title="Trauma shake" sub="Тряска экрана из GDC-доклада Squirrel Eiserloh: смещение = trauma² × max × noise." color="#ff4d5e">
          <ShakeLab />
        </Lab>
        <Lab n="LAB 05" title="Hit-stop" sub="90мс заморозки в момент контакта. Самый дешёвый способ сделать удар тяжелее." color="#3ddc84">
          <HitStopLab />
        </Lab>
        <Lab n="LAB 06" title="Звуковая доска" sub="Анимация без звука ощущается на треть слабее. Каждый удар в каталоге озвучен процедурно — нажми и послушай." color="#ff6bd6">
          <SoundBoard />
        </Lab>
        <Lab n="LAB 07" title="Squash & stretch" sub="Первый из 12 принципов Disney. Деформация с сохранением объёма превращает геометрию в материал." color="#9b7bff">
          <SquashLab />
        </Lab>
        <Lab n="TOKENS" title="Словарь движения" sub="Скопируй в проект. Никаких «ease-in-out 300ms» наугад — у каждого значения есть роль." color="#4cc3ff">
          <Code code={`export const EASE = {
  outExpo:    [0.16, 1, 0.3, 1],     // вход UI — 80% появлений
  inQuart:    [0.5, 0, 0.75, 0],     // выход UI — убираемся с дороги
  overshoot:  [0.34, 1.56, 0.64, 1], // награды, бейджи
  camera:     [0.65, 0, 0.35, 1],    // камера, большие сдвиги
  snap:       [0.2, 0.9, 0.1, 1],    // удар, slam-in
  anticipate: [0.36, -0.4, 0.64, 1], // замах
};
export const SPRING = {
  tap:    { stiffness: 700, damping: 30, mass: 0.6 },
  panel:  { stiffness: 380, damping: 32, mass: 0.9 },
  reward: { stiffness: 260, damping: 13, mass: 1 },
  heavy:  { stiffness: 160, damping: 20, mass: 2.2 },
};
export const DUR = { micro: .12, fast: .18, base: .28, slow: .42, scene: .64, epic: .96 };
export const STAGGER = { tight: .03, base: .045, loose: .07 };

// Отменяемый сценарий сцены
useScript(run, async (wait) => {
  setPhase("charge"); await wait(260);
  setPhase("impact"); shake(); burst(); await wait(90); // hit-stop
  setPhase("reward");
});`} />
        </Lab>
        <Lab n="PERF" title="Производительность и доступность" sub="Красиво, но на 30 FPS — это провал. Правила, которые держат 60 FPS на среднем Android." color="#2ee6c5">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [I.bolt, "Canvas для частиц", "Сотни DOM-элементов — смерть. Один canvas с композицией lighter — бесплатный bloom."],
              [I.layers, "Монтаж по вьюпорту", "Сцены вне экрана размонтированы. useInView с запасом 300px — старт до появления."],
              [I.target, "Transform / opacity", "Blur и box-shadow только в коротких вспышках, никогда в лупах на больших слоях."],
              [I.eye, "Reduced motion", "Медиа-запрос обнуляет бесконечные анимации. Смысл сохраняется цветом и прозрачностью."],
            ].map(([Ic, t, d], i) => {
              const Icon = Ic as typeof I.bolt;
              return (
                <div key={i} className="flex gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal/15 text-teal"><Icon size={18} /></div>
                  <div>
                    <div className="text-sm font-bold">{t as string}</div>
                    <div className="mt-1 text-xs leading-relaxed text-white/55">{d as string}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Lab>
      </section>
    </div>
  );
}
