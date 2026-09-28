import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState } from "react";
import { ParticleCanvas, useParticles } from "../components/particles";
import { Code, I } from "../components/kit";
import { Magnetic, Reveal, Segmented, TextReveal } from "../components/ui";
import { EASE, SPRING } from "../motion/tokens";

export function Lab({ n, title, sub, children, color = "#2ee6c5" }: { n: string; title: string; sub: string; children: React.ReactNode; color?: string }) {
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

function Knob({ label, v, set, min, max, step = 1, suffix = "" }: { label: string; v: number; set: (n: number) => void; min: number; max: number; step?: number; suffix?: string }) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-[11px]"><span className="text-white/55">{label}</span><span className="font-mono font-bold">{v}{suffix}</span></div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} className="w-full accent-[#2ee6c5]" />
    </label>
  );
}

/* ============================ LAB: PARTICLES ============================ */
function ParticleLab() {
  const p = useParticles();
  const [cfg, setCfg] = useState({ count: 30, speed: 320, spread: 360, gravity: 0, drag: 2.2, life: 0.9, shape: "spark" as "spark" | "dot" | "star" | "confetti" | "coin", color: "#2ee6c5" });
  const box = useRef<HTMLDivElement>(null);
  const emit = (x: number, y: number) =>
    p.burst({
      x, y, count: cfg.count, colors: [cfg.color, "#ffffff"],
      speed: [cfg.speed * 0.3, cfg.speed], spread: (cfg.spread * Math.PI) / 360,
      gravity: cfg.gravity, drag: cfg.drag, life: [cfg.life * 0.6, cfg.life], shape: cfg.shape,
      size: cfg.shape === "coin" ? [5, 7] : cfg.shape === "confetti" ? [3, 5] : [1.5, 3.5],
      angle: -Math.PI / 2,
    });
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3">
        <Knob label="количество" v={cfg.count} set={(n) => setCfg({ ...cfg, count: n })} min={1} max={120} />
        <Knob label="скорость" v={cfg.speed} set={(n) => setCfg({ ...cfg, speed: n })} min={40} max={800} step={10} />
        <Knob label="конус" v={cfg.spread} set={(n) => setCfg({ ...cfg, spread: n })} min={0} max={360} suffix="°" />
        <Knob label="гравитация" v={cfg.gravity} set={(n) => setCfg({ ...cfg, gravity: n })} min={-400} max={900} step={20} />
        <Knob label="трение" v={cfg.drag} set={(n) => setCfg({ ...cfg, drag: n })} min={0} max={6} step={0.1} />
        <Knob label="жизнь" v={cfg.life} set={(n) => setCfg({ ...cfg, life: n })} min={0.2} max={2.4} step={0.1} suffix="s" />
        <div className="flex flex-wrap gap-1.5">
          {(["spark", "dot", "star", "confetti", "coin"] as const).map((s) => (
            <button key={s} onClick={() => setCfg({ ...cfg, shape: s })} className={`rounded-lg px-2.5 py-1 font-mono text-[10px] ${cfg.shape === s ? "bg-teal text-black" : "border border-white/10 text-white/55"}`}>{s}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["#2ee6c5", "#ffc34d", "#ff4d5e", "#9b7bff", "#4cc3ff", "#3ddc84"].map((c) => (
            <button key={c} onClick={() => setCfg({ ...cfg, color: c })} className="h-6 w-6 rounded-md border border-white/20" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div
        ref={box}
        onPointerDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          emit(e.clientX - r.left, e.clientY - r.top);
        }}
        className="relative h-[280px] cursor-crosshair overflow-hidden rounded-2xl border border-white/5 bg-[#070b17]"
      >
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] text-white/25">клик — выброс</div>
        <ParticleCanvas canvasRef={p.ref} />
      </div>
    </div>
  );
}

/* ============================ LAB: STAGGER ============================ */
const MODES = [
  { id: "index", label: "По индексу", note: "Просто и предсказуемо. Волна всегда слева направо — быстро становится скучной." },
  { id: "tap", label: "От точки касания", note: "Волна расходится от пальца. Интерфейс отвечает там, где его тронули." },
  { id: "diagonal", label: "По диагонали", note: "row + col — даёт перспективу, как будто элементы лежат в плоскости." },
  { id: "center", label: "От центра", note: "Симметричный «взрыв». Хорош для сеток наград и бейджей." },
  { id: "random", label: "Случайно", note: "Хаос = органика. Используй для частиц, никогда — для списков." },
] as const;
function StaggerLab() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("tap");
  const [k, setK] = useState(0);
  const [origin, setOrigin] = useState({ x: 3, y: 2 });
  const cols = 10, rows = 6;
  const delay = (i: number) => {
    const x = i % cols, y = Math.floor(i / cols);
    switch (mode) {
      case "index": return i * 0.02;
      case "tap": return Math.hypot(x - origin.x, y - origin.y) * 0.05;
      case "diagonal": return (x + y) * 0.03;
      case "center": return Math.hypot(x - cols / 2, y - rows / 2) * 0.045;
      case "random": return Math.random() * 0.5;
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((m) => (
            <button key={m.id} onClick={() => { setMode(m.id); setK((v) => v + 1); }} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${mode === m.id ? "bg-gold text-black" : "border border-white/10 text-white/55"}`}>{m.label}</button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-white/55">{MODES.find((m) => m.id === mode)!.note}</p>
        <Code code={`// ${MODES.find((m) => m.id === mode)!.label}
const delay = ${mode === "index" ? "(i) => i * 0.02"
  : mode === "tap" ? "(i) => Math.hypot(x - ox, y - oy) * 0.05"
  : mode === "diagonal" ? "(i) => (x + y) * 0.03"
  : mode === "center" ? "(i) => Math.hypot(x - cols/2, y - rows/2) * 0.045"
  : "() => Math.random() * 0.5"};

transition={{ delay: delay(i), ...SPRING.reward }}`} />
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
        {Array.from({ length: cols * rows }).map((_, i) => (
          <motion.button
            key={`${k}-${i}`}
            onClick={() => { setOrigin({ x: i % cols, y: Math.floor(i / cols) }); setK((v) => v + 1); }}
            initial={{ scale: 0, opacity: 0, background: "#ffc34d" }}
            animate={{ scale: 1, opacity: 1, background: "#ffffff12" }}
            transition={{ delay: delay(i), ...SPRING.reward, background: { delay: delay(i) + 0.35, duration: 0.8 } }}
            className="aspect-square rounded-md"
            style={{ boxShadow: "inset 0 0 0 1px #ffffff14" }}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================ LAB: MORPH ============================ */
function MorphSandbox() {
  const [open, setOpen] = useState(false);
  const [radius, setRadius] = useState(24);
  const [curve, setCurve] = useState<"spring" | "expo">("spring");
  const tr = curve === "spring" ? SPRING.panel : { duration: 0.6, ease: EASE.outExpo };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          <Segmented items={[{ id: "spring", label: "Пружина" }, { id: "expo", label: "outExpo" }]} value={curve} onChange={setCurve} color="#9b7bff" />
        </div>
        <Knob label="радиус" v={radius} set={setRadius} min={0} max={48} />
        <p className="text-xs leading-relaxed text-white/55">Один и тот же <b className="text-white">layoutId</b> — но кривая и радиус меняют смысл целиком. Пружина = «предмет», outExpo = «интерфейс». Радиус 0 превращает карточку в экран-плитку.</p>
        <Code code={`<motion.div layoutId="card"
  style={{ borderRadius: ${radius} }}
  transition={${curve === "spring" ? "SPRING.panel" : "{ duration: .6, ease: outExpo }"}} />

// Внутри — три уровня layoutId:
// контейнер, иконка, заголовок. Каждый летит своей траекторией.`} />
      </div>
      <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/5 bg-[#070b17] p-4">
        <AnimatePresence>
          {!open && (
            <motion.button
              key="card"
              layoutId="morphCard"
              transition={tr}
              onClick={() => setOpen(true)}
              style={{ borderRadius: radius }}
              className="absolute left-6 top-8 h-32 w-56 overflow-hidden border border-violet/40 bg-gradient-to-br from-[#3b2a7a] to-[#140d33] p-4 text-left"
            >
              <motion.div layoutId="morphIcon" transition={tr} className="grid h-10 w-10 place-items-center rounded-xl bg-violet/25 text-violet"><I.gem size={18} /></motion.div>
              <motion.div layoutId="morphTitle" transition={tr} className="mt-3 font-display text-base font-bold">Тень Рынка</motion.div>
              <div className="text-[10px] text-white/45">Тап — развернуть</div>
            </motion.button>
          )}
          {open && (
            <motion.div
              key="sheet"
              layoutId="morphCard"
              transition={tr}
              style={{ borderRadius: radius }}
              className="absolute inset-3 overflow-hidden border border-violet/40 bg-gradient-to-br from-[#3b2a7a] to-[#140d33] p-5"
            >
              <div className="flex items-center gap-3">
                <motion.div layoutId="morphIcon" transition={tr} className="grid h-14 w-14 place-items-center rounded-2xl bg-violet/25 text-violet"><I.gem size={26} /></motion.div>
                <motion.div layoutId="morphTitle" transition={tr} className="font-display text-xl font-black">Тень Рынка</motion.div>
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ delay: 0.2, ...tr }} className="mt-4 space-y-2">
                {[80, 62, 44].map((w, i) => (
                  <div key={i} className="h-2 rounded bg-white/15" style={{ width: `${w}%` }} />
                ))}
              </motion.div>
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ delay: 0.3, ...tr }} onClick={() => setOpen(false)} className="absolute bottom-5 left-5 right-5 rounded-xl bg-violet py-2.5 text-xs font-bold text-black">
                Свернуть
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================ LAB: TEXT ============================ */
function TextLab() {
  const [mode, setMode] = useState<"char" | "word" | "type" | "mask">("char");
  const [k, setK] = useState(0);
  const txt = "Пробой без объёма — это ловушка";
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Segmented items={[{ id: "char", label: "Буквы 3D" }, { id: "word", label: "Слова" }, { id: "type", label: "Печать" }, { id: "mask", label: "Маска" }]} value={mode} onChange={(m) => { setMode(m); setK((v) => v + 1); }} color="#4cc3ff" />
        <p className="text-xs leading-relaxed text-white/55">Текст — самый дешёвый способ добавить «дороговизны». Но каскад по буквам работает только на коротких заголовках: 6+ слов читаются в темпе речи, а не по букве.</p>
        <div className="rounded-xl bg-black/30 p-3 text-xs text-white/60">
          <b className="text-white">Правило:</b> заголовок → буквы/маска. Абзац → слова с blur. Список → маска по строке.
        </div>
      </div>
      <div className="grid h-[220px] place-items-center rounded-2xl border border-white/5 bg-[#070b17] p-6 text-center">
        <div key={k} className="font-display text-2xl font-black leading-tight">
          <TextReveal key={k} text={txt} mode={mode} step={mode === "word" ? 0.07 : 0.035} />
        </div>
      </div>
    </div>
  );
}

/* ============================ LAB: MAGNET ============================ */
function MagnetLab() {
  const [s, setS] = useState(0.35);
  const nx = useMotionValue(0), ny = useMotionValue(0);
  const rx = useSpring(nx, { stiffness: 150, damping: 14 }), ry = useSpring(ny, { stiffness: 150, damping: 14 });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <Knob label="сила притяжения" v={s} set={setS} min={0} max={1} step={0.05} />
        <p className="text-xs leading-relaxed text-white/55">Магнитный элемент перекрывает зону больше своей площади — промах по кнопке почти невозможен. Критично для мобильных CTA на краю экрана и для «большой красной кнопки».</p>
        <Code code={`const x = useSpring(mx, { stiffness: 300, damping: 18 });
onPointerMove={(e) => {
  const r = el.getBoundingClientRect();
  mx.set((e.clientX - (r.left + r.width/2)) * ${s});
}}
whileTap={{ scale: 0.93 }}  // вдавливание`} />
      </div>
      <div
        className="relative grid h-[240px] place-items-center overflow-hidden rounded-2xl border border-white/5 bg-[#070b17]"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          nx.set(((e.clientX - r.left) / r.width - 0.5) * 40 * s);
          ny.set(((e.clientY - r.top) / r.height - 0.5) * 40 * s);
        }}
        onPointerLeave={() => { nx.set(0); ny.set(0); }}
      >
        <motion.div style={{ x: rx, y: ry }}>
          <Magnetic strength={s}>
            <span className="block rounded-2xl bg-gradient-to-b from-[#ffd76a] to-[#e8a121] px-8 py-4 font-display text-sm font-black text-[#3a2200]">ВОЙТИ</span>
          </Magnetic>
        </motion.div>
        <div className="absolute bottom-3 left-3 font-mono text-[10px] text-white/25">x: {rx.get().toFixed(1)} y: {ry.get().toFixed(1)}</div>
      </div>
    </div>
  );
}

/* ============================ LAB: MOTION PATH ============================ */
const PATHS = [
  { id: "arc", d: "M20 200 C120 40 260 40 360 200", label: "Дуга" },
  { id: "zig", d: "M20 200 L110 60 L200 200 L290 60 L360 160", label: "Зигзаг" },
  { id: "loop", d: "M20 180 C140 20 260 20 380 180 C300 240 100 240 20 180", label: "Петля" },
];
function PathLab() {
  const [p, setP] = useState(0);
  const [go, setGo] = useState(0);
  const [ease, setEase] = useState<"expo" | "spring" | "linear">("expo");
  const path = PATHS[p];
  const tr = ease === "spring" ? SPRING.reward : { duration: 1.4, ease: ease === "expo" ? EASE.outExpo : "linear" };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {PATHS.map((x, i) => (
            <button key={x.id} onClick={() => { setP(i); setGo((v) => v + 1); }} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${p === i ? "bg-bull text-black" : "border border-white/10 text-white/55"}`}>{x.label}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["expo", "spring", "linear"] as const).map((e) => (
            <button key={e} onClick={() => { setEase(e); setGo((v) => v + 1); }} className={`rounded-lg px-3 py-1.5 font-mono text-[10px] ${ease === e ? "bg-teal text-black" : "border border-white/10 text-white/55"}`}>{e}</button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-white/55"><b className="text-white">offset-path</b> двигает элемент по реальной кривой Безье — с правильным ускорением по дуге, а не по прямой между точками. Идеально для «кометы», бегущей по ветке навыков.</p>
        <Code code={`<motion.div
  style={{ offsetPath: \`path('\${d}')\`, offsetRotate: "0deg" }}
  initial={{ offsetDistance: "0%" }}
  animate={{ offsetDistance: "100%" }}
  transition={{ duration: 1.4, ease: EASE.outExpo }} />`} />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#070b17]">
        <svg viewBox="0 0 400 260" className="h-[240px] w-full">
          <path d={path.d} fill="none" stroke="#ffffff18" strokeWidth="14" strokeLinecap="round" />
          <path d={path.d} fill="none" stroke={path.label === "Дуга" ? "#3ddc84" : path.label === "Зигзаг" ? "#ffc34d" : "#9b7bff"} strokeWidth="2" strokeDasharray="5 9" className="flow-dash" />
        </svg>
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            key={go}
            className="absolute left-0 top-0 h-5 w-5 rounded-full bg-white"
            style={{ offsetPath: `path('${path.d}')`, offsetRotate: "0deg", boxShadow: "0 0 18px 6px #ffffff88" } as React.CSSProperties}
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={tr as never}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================ LAB: REDUCED MOTION ============================ */
function ReducedLab() {
  const [calm, setCalm] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <button onClick={() => setCalm((c) => !c)} className={`relative h-10 w-full overflow-hidden rounded-xl border text-xs font-bold ${calm ? "border-bull bg-bull/15 text-bull" : "border-white/10 text-white/60"}`}>
          <motion.div className="absolute inset-0" animate={{ background: calm ? "#3ddc8422" : "#00000000" }} />
          <span className="relative">{calm ? "prefers-reduced-motion: reduce" : "prefers-reduced-motion: no-preference"}</span>
        </button>
        <p className="text-xs leading-relaxed text-white/55">При reduced-motion убираем: параллакс, тряску, полёты по экрану, бесконечные лупы. Оставляем: цвет, прозрачность, мгновенные смены состояния. Смысл должен сохраниться без движения.</p>
        <Code code={`@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
  }
}

// И в JS: режим "спокойно" для shake/parallax
const calm = usePrefersReducedMotion();
animate(el, calm ? { opacity: [0, 1] } : shakeKeys(1), { duration: calm ? .2 : .45 });`} />
      </div>
      <div className="grid h-[220px] place-items-center gap-4 rounded-2xl border border-white/5 bg-[#070b17]">
        <motion.div
          animate={calm ? { y: 0, rotate: 0, scale: [1, 1] } : { y: [0, -14, 0], rotate: [0, 3, -3, 0], scale: [1, 1.04, 1] }}
          transition={calm ? { duration: 0.2 } : { duration: 2.4, repeat: Infinity }}
          className="h-20 w-20 rounded-2xl bg-gradient-to-br from-teal to-[#167f70]"
        />
        <div className="text-xs text-white/45">{calm ? "Только смена состояния" : "Параллакс + вращение + пульс"}</div>
      </div>
    </div>
  );
}

/* ============================ EXPORTED ============================ */
export function ExtraLabs() {
  return (
    <>
      <Lab n="LAB 06" title="Конструктор частиц" sub="Пять форм, конус выброса, гравитация и трение. Кликни по полю — почувствуй, как меняется характер эффекта." color="#ffc34d">
        <ParticleLab />
      </Lab>
      <Lab n="LAB 07" title="Пять каскадов" sub="Одинаковая сетка, разная логика задержки. Каскад — это не «чуть-чуть позже», а выбор направления волны." color="#4cc3ff">
        <StaggerLab />
      </Lab>
      <Lab n="LAB 08" title="Shared-element: кривая и радиус" sub="Меняй пружину на outExpo и радиус — и переход из «предметного» становится «интерфейсным»." color="#9b7bff">
        <MorphSandbox />
      </Lab>
      <Lab n="LAB 09" title="Появление текста" sub="Четыре режима раскрытия текста и правило, когда какой применять." color="#ffffff">
        <TextLab />
      </Lab>
      <Lab n="LAB 10" title="Магнитные элементы" sub="Элемент тянется к курсору и вдавливается при нажатии. Промах по кнопке становится почти невозможным." color="#3ddc84">
        <MagnetLab />
      </Lab>
      <Lab n="LAB 11" title="Движение по кривой" sub="offset-path двигает по настоящей дуге Безье. Сравни кривые траектории и кривые времени." color="#3ddc84">
        <PathLab />
      </Lab>
      <Lab n="LAB 12" title="Reduced motion" sub="Переключи режим и посмотри, что остаётся, когда движение запрещено." color="#ff4d5e">
        <ReducedLab />
      </Lab>
      <Lab n="LAB 13" title="Появление при скролле" sub="Пять режимов входа для секций страницы. Используй один на страницу — иначе получишь салат." color="#2ee6c5">
        <div className="space-y-3">
          {(["up", "mask", "scale", "flip", "blur"] as const).map((m) => (
            <div key={m} className="flex items-center gap-4">
              <div className="w-24 shrink-0 font-mono text-[11px] text-white/50">{m}</div>
              <div className="flex-1 overflow-hidden rounded-xl border border-white/5 bg-black/20 p-3">
                <Reveal mode={m} amount={0.1} once={false}>
                  <div className="font-display text-sm font-bold">Заголовок секции</div>
                  <div className="text-xs text-white/50">Подзаголовок с описанием того, что происходит дальше.</div>
                </Reveal>
              </div>
            </div>
          ))}
        </div>
      </Lab>
    </>
  );
}
