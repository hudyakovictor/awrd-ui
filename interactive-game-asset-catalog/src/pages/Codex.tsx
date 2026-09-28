import { animate, motion, useAnimate } from "framer-motion";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Code, I } from "../components/kit";
import { ParticleCanvas, useParticles } from "../components/particles";
import { EASE, SPRING, sleep, type Bezier } from "../motion/tokens";
import { ExtraLabs } from "./labs";

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
  ["Звук — половина сочности", "Низкий буп на 40–150 Гц в момент удара делает удар тяжёлым. Синтезируй WebAudio: 0 КБ ассетов, нулевая задержка."],
  ["UI-звук короче 200мс", "Гейн ниже 0.35, без реверберации. Долгие звуки в интерфейсе превращаются в шум."],
  ["Хаптика дешевле десяти слоёв", "Короткий buzz на ключевом событии стоит дешевле ещё одного слоя частиц и ощущается сильнее."],
  ["Данные двигаются как цена", "Стакан, рейтинг, прогресс — всё живёт. Статичная таблица цифр читается как сломанная."],
  ["Прогресс шагами, не перескоком", "1 → 2 → 3 с паузами 300–400мс и звуком. Каждое обновление — событие, а не перескок."],
  ["Ресурсы возвращаются видимо", "Потрачено и получено — противоположные направления движения частиц. Мозг различает их без текста."],

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
          12 законов, токены движения и 5 лабораторий, где каждый секрет можно потрогать руками.
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
        <ExtraLabs />
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
