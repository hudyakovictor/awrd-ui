import { useEffect, useRef, useState } from "react";
import { Plus, Sparkles, Box, LayoutPanelTop, Hash } from "lucide-react";
import { Asset, Section, Chip, Btn, GhostBtn } from "../kit/ui";
import { Scramble, Odometer, Flip, useRaf, Mag } from "../kit/fx";
import { useViewportProgress, useInView, clamp } from "../kit/motion";
import { sfx, sfxRaw } from "../kit/sfx";
import { cn } from "../utils/cn";
import heroArt from "../assets/hero-arena.jpg";
import vault from "../assets/vault.jpg";
import terrain from "../assets/terrain.jpg";

/* ------------------------------------------------ MO-16 spotlight grid */
const cells = [
  { t: "Long", s: "Ставь на рост", c: "#22d39a", img: heroArt },
  { t: "Short", s: "Ставь на падение", c: "#ff4f6d", img: vault },
  { t: "Streak", s: "47 дней", c: "#ff8a3d", img: terrain },
  { t: "League", s: "Diamond", c: "#8b5cff", img: heroArt },
];
function SpotlightGrid() {
  const [pos, setPos] = useState<Record<number, { x: number; y: number }>>({});
  return (
    <Asset code="MO-16" title="Spotlight Reveal Grid" desc="Из-под тёмного слоя при наведении проявляется картинка и подпись — «свет» следует за курсором по ячейкам." hint="Веди курсор по сетке" specs={["radial mask", "per-cell", "hover only"]}>
      <div className="grid grid-cols-2 gap-2.5">
        {cells.map((c, i) => (
          <div
            key={c.t}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl"
            onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPos({ ...pos, [i]: { x: e.clientX - r.left, y: e.clientY - r.top } }); }}
            onPointerLeave={() => setPos({ ...pos, [i]: { x: -999, y: -999 } })}
          >
            <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `radial-gradient(170px circle at ${pos[i]?.x ?? -999}px ${pos[i]?.y ?? -999}px, transparent, rgba(6,11,24,.94) 62%)` }} />
            <div className="absolute inset-0 bg-ink-950/40" />
            <div className="absolute inset-x-3 bottom-3">
              <div className="font-display text-base font-extrabold" style={{ color: c.c }}>{c.t}</div>
              <div className="text-[11px] text-snow/70">{c.s}</div>
            </div>
            <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 40px ${c.c}33`, opacity: pos[i] ? 1 : 0, transition: "opacity .3s" }} />
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-[10px] text-mist">Свет следует за курсором — контент раскрывается локально, а не везде сразу.</div>
    </Asset>
  );
}

/* --------------------------------------------- MO-17 sticky stacking cards */
const stack = [
  { n: "Unit 1", t: "Basics", c: "#3b82ff", d: "Свечи, объём, биржа и ордера — за 12 уроков." },
  { n: "Unit 2", t: "Structure", c: "#22d39a", d: "Тренды, уровни, поддержка и сопротивление." },
  { n: "Unit 3", t: "Risk", c: "#ffc53d", d: "Стопы, размер позиции, плечо и управление капиталом." },
  { n: "Unit 4", t: "Mind", c: "#8b5cff", d: "Дисциплина, торговый журнал и работа с эмоциями." },
];
function StickyStack() {
  return (
    <Asset code="MO-17" title="Sticky Card Stack" desc="Карточки юнитов прилипают к верху и складываются стопкой при прокрутке страницы." hint="Прокручивай страницу мимо" specs={["position sticky", "stack", "rotate"]}>
      <div className="relative">
        {stack.map((s, i) => (
          <div key={s.n} className="mb-4" style={{ position: "sticky", top: `${88 + i * 18}px`, zIndex: 10 + i }}>
            <div className="rounded-3xl border-2 p-4 shadow-[0_10px_0_#060b18,0_30px_40px_-16px_rgba(0,0,0,.7)]" style={{ borderColor: `${s.c}55`, background: `linear-gradient(135deg, ${s.c}22, #122143 60%)`, transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)` }}>
              <div className="flex items-center gap-3">
                <span className="num grid h-10 w-10 place-items-center rounded-xl font-black text-ink-900" style={{ background: s.c }}>{i + 1}</span>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: s.c }}>{s.n}</div>
                  <div className="font-display text-base font-extrabold">{s.t}</div>
                </div>
              </div>
              <p className="mt-2 text-[12px] leading-snug text-mist">{s.d}</p>
            </div>
          </div>
        ))}
        <div className="h-6" />
      </div>
      <div className="text-center text-[10px] text-mist">4 карточки прилипают друг за другом и формируют стопку.</div>
    </Asset>
  );
}

/* ---------------------------------------------------- MO-18 3D drag cube */
const cubeFaces: { c: string; label: string }[] = [
  { c: "linear-gradient(140deg,#3b82ff,#2152c4)", label: "LEARN" },
  { c: "linear-gradient(140deg,#8b5cff,#5a33c7)", label: "DRILL" },
  { c: "linear-gradient(140deg,#ffc53d,#c98a12)", label: "REWARD" },
  { c: "linear-gradient(140deg,#22d39a,#10916a)", label: "TRADE" },
  { c: "linear-gradient(140deg,#ff4f6d,#c02a47)", label: "DUEL" },
  { c: "linear-gradient(140deg,#2bd9ff,#1395b8)", label: "LEAGUE" },
];
function Cube3D() {
  const [r, setR] = useState({ x: -22, y: 32 });
  const st = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const [auto, setAuto] = useState(true);
  useRaf(() => { if (auto && !st.current) setR((p) => ({ ...p, y: p.y + 0.35, x: -22 + Math.sin(Date.now() / 2400) * 12 })); }, auto);
  const S = 118;
  const faces = [
    `translateZ(${S / 2}px)`, `rotateY(180deg) translateZ(${S / 2}px)`,
    `rotateY(90deg) translateZ(${S / 2}px)`, `rotateY(-90deg) translateZ(${S / 2}px)`,
    `rotateX(90deg) translateZ(${S / 2}px)`, `rotateX(-90deg) translateZ(${S / 2}px)`,
  ];
  return (
    <Asset code="MO-18" title="Draggable 3D Cube" desc="Куб из шести граней режима игры. Вращается на автопилоте, тянется мышью и пальцем, инерция вращения." hint="Хватай и вращай" specs={["6 faces", "auto-idle", "drag inertia"]}>
      <div
        className="grid h-56 cursor-grab place-items-center touch-none select-none active:cursor-grabbing [perspective:700px]"
        data-drag
        onPointerDown={(e) => { setAuto(false); st.current = { x: e.clientX, y: e.clientY, rx: r.x, ry: r.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (st.current) setR({ y: st.current.ry + (e.clientX - st.current.x) * 0.6, x: clamp(st.current.rx - (e.clientY - st.current.y) * 0.6, -80, 80) }); }}
        onPointerUp={() => { st.current = null; sfxRaw.pop(); setTimeout(() => setAuto(true), 2600); }}
      >
        <div className="relative [transform-style:preserve-3d]" style={{ width: S, height: S, transform: `rotateX(${r.x}deg) rotateY(${r.y}deg)` }}>
          {faces.map((f, i) => (
            <div key={i} className="absolute inset-0 grid place-items-center rounded-xl border border-white/20 font-display text-lg font-black text-white shadow-[inset_0_2px_0_rgba(255,255,255,.25)]" style={{ background: cubeFaces[i].c, transform: f, backfaceVisibility: "hidden" }}>
              {cubeFaces[i].label}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-2">
        <Chip tone="sky"><Box size={11} /> 3D transform</Chip>
        <Chip tone="gold">{auto ? "auto rotate" : "manual"}</Chip>
      </div>
    </Asset>
  );
}

/* ------------------------------------------------------ MO-19 accordion */
const faqs: [string, string][] = [
  ["Нужны ли деньги, чтобы начать?", "Нет. Весь прогресс, сделки и награды виртуальные — обучение безопасно для кошелька."],
  ["Откуда берутся цены?", "Симулятор использует синтетические, но правдоподобные серии цен: свечи, объёмы и волатильность считают те же формулы, что и на реальном рынке."],
  ["Что происходит при ошибке?", "Теряется одна жизнь и разбирается пояснение. Неверный вопрос возвращается в конец урока позже — это и есть интервальное повторение."],
  ["Есть ли соревнования?", "Да: еженедельные лиги с зонами повышения и понижения и дуэли 1v1 в реальном времени."],
];
function Accordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Asset code="MO-19" title="Height-Driven Accordion" desc="Высота раскрывается по кривой, плюс поворачивается знак «+», содержимое появляется со сдвигом." hint="Раскрывай вопросы" specs={["grid-rows", "spring icon", "stagger text"]}>
      <div className="space-y-2.5">
        {faqs.map(([q, a], i) => {
          const on = open === i;
          return (
            <div key={q} className={cn("overflow-hidden rounded-2xl border transition-colors", on ? "border-sky/50 bg-ink-800" : "border-transparent bg-ink-800/70")}>
              <button onClick={() => { setOpen(on ? null : i); sfxRaw.pop(); }} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform duration-500", on ? "rotate-45 bg-sky text-white" : "bg-ink-600 text-mist")}>
                  <Plus size={16} strokeWidth={3} />
                </span>
                <span className="text-[13px] font-extrabold">{q}</span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-500 [transition-timing-function:cubic-bezier(.3,1.3,.5,1)]" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="px-4 pb-4 pl-[60px] text-[12.5px] leading-relaxed text-mist" style={{ opacity: on ? 1 : 0, transform: on ? "translateY(0)" : "translateY(-6px)", transition: "all .4s .1s" }}>{a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* --------------------------------------------------- MO-20 image reveal */
function ImageReveal() {
  const [ref, p] = useViewportProgress<HTMLDivElement>("through");
  const shots = [
    { img: terrain, c: "#22d39a", t: "Chart ranges" },
    { img: vault, c: "#ffc53d", t: "Reward vault" },
  ];
  return (
    <Asset code="MO-20" title="Scroll Image Wipe" desc="Кадры открываются заслонкой снизу вверх и масштабируются, пока секция проходит через экран." hint="Прокручивай секцию" specs={["clip-path", "scroll progress", "2 layers"]}>
      <div ref={ref} className="grid grid-cols-2 gap-3">
        {shots.map((s, i) => {
          const local = clamp((p - i * 0.18) / 0.5, 0, 1);
          return (
            <div key={s.t} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img src={s.img} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ transform: `scale(${1.25 - local * 0.25})` }} />
              <div className="absolute inset-0 bg-ink-950" style={{ clipPath: `inset(${(1 - local) * 100}% 0 0 0)` }} />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <span className="h-1 w-10 block rounded-full" style={{ background: s.c, width: `${local * 64}px` }} />
                <div className="font-display mt-2 text-sm font-extrabold" style={{ opacity: local }}>{s.t}</div>
              </div>
              <span className="num absolute right-2 top-2 rounded-md bg-ink-950/80 px-1.5 py-0.5 text-[9px] font-bold" style={{ color: s.c }}>{Math.round(local * 100)}%</span>
            </div>
          );
        })}
      </div>
    </Asset>
  );
}

/* ------------------------------------------- MO-21 directional push nav */
function PushTransition() {
  const [i, setI] = useState(0);
  const dir = useRef(1);
  const panels = [
    { t: "Урок", c: "#3b82ff", body: "«Пробой уровня с подтверждением объёма — лучший момент для входа.»" },
    { t: "Практика", c: "#22d39a", body: "Найди уровень сопротивления на графике: два тапа, мгновенная оценка." },
    { t: "Награда", c: "#ffc53d", body: "+15 XP, +5 кристаллов и обновление серии." },
  ];
  const go = (n: number) => { dir.current = n > i ? 1 : -1; setI(n); sfxRaw.swipe(); };
  return (
    <Asset code="MO-21" title="Push / Pop Screen Transition" desc="Разделы въезжают по направлению движения, с лёгким поворотом и затуханием уходящего экрана." hint="Листай вперёд и назад" specs={["direction aware", "crossfade", "3 panels"]}>
      <div className="relative h-52 overflow-hidden rounded-2xl bg-ink-950">
        {panels.map((p, k) => {
          const state = k === i ? "in" : k === i - dir.current || (dir.current === -1 && k > i) || (dir.current === 1 && k < i) ? "out" : "hidden";
          return (
            <div
              key={p.t}
              className="absolute inset-0 flex flex-col justify-center px-6"
              style={{
                background: `radial-gradient(circle at 70% 20%, ${p.c}33, #0a1224 70%)`,
                opacity: state === "in" ? 1 : state === "out" ? 0 : 0,
                transform: state === "in" ? "translateX(0) rotate(0)" : `translateX(${dir.current * -22}%) rotate(${dir.current * -4}deg)`,
                transition: "all .5s cubic-bezier(.3,1.2,.4,1)",
                pointerEvents: state === "in" ? "auto" : "none",
              }}
            >
              <span className="rounded-md px-2 py-0.5 text-[9px] font-black uppercase text-ink-900 w-fit" style={{ background: p.c }}>{p.t}</span>
              <div className="font-display mt-3 text-lg font-extrabold leading-snug">{p.body}</div>
            </div>
          );
        })}
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
          <button onClick={() => go(Math.max(0, i - 1))} disabled={i === 0} className="h-9 rounded-xl bg-ink-800 px-3 text-[11px] font-extrabold disabled:opacity-30">← back</button>
          <div className="flex gap-1.5">{panels.map((p, k) => <span key={p.t} className="h-2 rounded-full transition-all" style={{ width: k === i ? 20 : 7, background: k === i ? p.c : "#273f75" }} />)}</div>
          <button onClick={() => go(Math.min(panels.length - 1, i + 1))} disabled={i === panels.length - 1} className="h-9 rounded-xl bg-ink-800 px-3 text-[11px] font-extrabold disabled:opacity-30">next →</button>
        </div>
      </div>
    </Asset>
  );
}

/* --------------------------------------------------- MO-22 odometer board */
function OdometerBoard() {
  const [price, setPrice] = useState(64218);
  const [xp, setXp] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPrice((p) => Math.round(p + (Math.random() - 0.48) * 60)), 900);
    const t2 = setInterval(() => setXp((x) => x + 7), 1400);
    return () => { clearInterval(t); clearInterval(t2); };
  }, []);
  const up = price >= 64218;
  return (
    <Asset code="MO-22" title="Odometer Digits" desc="Цифровые барабаны перекатываются при каждом изменении: цена, XP, счётчик наград." hint="Смотри за перекатом" specs={["digit columns", "eased", "tabular"]}>
      <div className="space-y-3">
        <div className="rounded-2xl bg-ink-900/70 p-4 text-center">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-mist">BTC / USDT</div>
          <Odometer value={price.toLocaleString()} h={40} className="num text-3xl font-black" />
          <div className="num text-[12px] font-bold" style={{ color: up ? "#22d39a" : "#ff4f6d" }}>{up ? "▲" : "▼"} live tick</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-ink-800 p-4 text-center"><div className="text-[10px] uppercase text-mist">XP</div><Odometer value={xp} h={30} cls="text-gold" className="num text-2xl font-black" /></div>
          <div className="rounded-2xl bg-ink-800 p-4 text-center"><div className="text-[10px] uppercase text-mist">Season</div><Odometer value="07/30" h={30} cls="text-sky" className="num text-2xl font-black" /></div>
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-2"><Chip tone="gold"><Hash size={11} /> tabular nums</Chip><Chip tone="sky">spring ease</Chip></div>
    </Asset>
  );
}

/* -------------------------------------------------- MO-23 scramble gallery */
function ScrambleGallery() {
  const lines = ["BUY THE DIP", "READ THE CANDLES", "PROTECT CAPITAL", "CLIMB THE LEAGUE"];
  const [k, setK] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Asset code="MO-23" title="Text Decode / Scramble" desc="Буквы дешифруются при попадании в зону видимости. При наведении строка пересобирается заново." hint="Наведи на строку" specs={["per-char lock", "re-trigger", "no libs"]}>
      <div className="space-y-2">
        {lines.map((l, i) => (
          <button
            key={l}
            onMouseEnter={() => { setHover(i); setK((x) => x + 1); }}
            onMouseLeave={() => setHover(null)}
            className="block w-full rounded-xl bg-ink-900/60 px-3 py-3 text-left font-display text-lg font-black tracking-wider text-white transition hover:bg-ink-800"
          >
            <Scramble text={l} on={hover === i || k >= 0} key={`${i}-${hover === i}`} delay={i * 60} />
          </button>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-mist">Глифы подставляются посимвольно, пока не зафиксируются в нужном порядке.</div>
    </Asset>
  );
}

/* ---------------------------------------------------- MO-24 logo stroke draw */
function LogoDraw() {
  const [ref, seen] = useInView<HTMLDivElement>(0.4);
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    if (!seen) return;
    const t = setTimeout(() => setFilled(true), 2400);
    return () => clearTimeout(t);
  }, [seen]);
  return (
    <Asset code="MO-24" title="Logo Stroke Draw" desc="Знак рисуется линиями при появлении на экране, затем заливается. Форма та же, что и в фирменном блоке." hint="Убери из видимости и верни" specs={["pathLength 1", "stagger", "fill fade"]}>
      <div ref={ref} className="grid place-items-center py-4">
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none" onClick={() => { setFilled(false); sfxRaw.pop(); setTimeout(() => setFilled(true), 2400); }} className="cursor-pointer">
          <g stroke="#3b82ff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill={filled ? "url(#lgg)" : "none"} style={{ transition: "fill .7s ease" }}>
            <defs>
              <linearGradient id="lgg" x1="10" y1="4" x2="52" y2="60">
                <stop stopColor="#8FC0FF" /><stop offset=".45" stopColor="#3B82FF" /><stop offset="1" stopColor="#2152C4" />
              </linearGradient>
            </defs>
            <path d="M32 5.5a26.5 26.5 0 1 0 .001 0z" pathLength={1} strokeDasharray="1" strokeDashoffset={seen ? 0 : 1} style={{ transition: "stroke-dashoffset 1.4s ease, fill .7s .9s" }} />
            <path d="M31.2 18.5h1.6v27h-1.6z" pathLength={1} strokeDasharray="1" strokeDashoffset={seen ? 0 : 1} style={{ transition: "stroke-dashoffset .5s .9s ease" }} />
            <path d="M26 24.4c0-1 .8-1.8 1.8-1.8h8.4c1 0 1.8.8 1.8 1.8v12.6c0 1-.8 1.8-1.8 1.8h-8.4a1.8 1.8 0 0 1-1.8-1.8z" pathLength={1} strokeDasharray="1" strokeDashoffset={seen ? 0 : 1} style={{ transition: "stroke-dashoffset .8s 1.2s ease" }} />
            <path d="M44.9 41.1 59.7 55.9 56.1 59.5 41.3 44.7z" pathLength={1} strokeDasharray="1" strokeDashoffset={seen ? 0 : 1} style={{ transition: "stroke-dashoffset .5s 1.6s ease" }} />
            <path d="M45.9 42.2c0-.8.7-1.5 1.5-1.5h8.4c.8 0 1.5.7 1.5 1.5v8.4c0 .8-.7 1.5-1.5 1.5h-8.4a1.5 1.5 0 0 1-1.5-1.5z" transform="rotate(45 50.85 47.15)" pathLength={1} strokeDasharray="1" strokeDashoffset={seen ? 0 : 1} style={{ transition: "stroke-dashoffset .6s 1.9s ease" }} />
          </g>
        </svg>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-mist">{seen ? (filled ? "заливка завершена" : "рисую линии…") : "знак вне экрана"}</span>
        <button onClick={() => { setFilled(false); setTimeout(() => setFilled(true), 2400); }} className="font-bold text-sky">replay</button>
      </div>
    </Asset>
  );
}

/* --------------------------------------------- MO-25 flip cards + magnetic */
function FlipSquad() {
  return (
    <Asset code="MO-25" title="Flip + Magnetic Combo" desc="Карточка переворачивается по клику, пока курсор наклоняет её в 3D; кнопка внутри притягивается." hint="Кликни и наведи" specs={["3D flip", "hover tilt", "magnet"]}>
      <div className="grid place-items-center">
        <Flip
          ratio="4/5"
          front={
            <div className="relative grid h-full w-[210px] place-items-center overflow-hidden rounded-[26px] border-2 border-violet/50 bg-gradient-to-br from-violet/30 to-ink-800 shadow-[0_10px_0_#060b18]">
              <Sparkles className="absolute right-3 top-3 text-gold" size={18} />
              <div className="text-center">
                <div className="font-display text-3xl font-black text-gradient-gold">EPIC</div>
                <div className="text-[11px] font-extrabold uppercase text-mist">tap to flip</div>
              </div>
            </div>
          }
          back={
            <div className="grid h-full w-[210px] place-items-center rounded-[26px] border-2 border-violet/50 bg-gradient-to-br from-ink-700 to-ink-900 p-4 shadow-[0_10px_0_#060b18]">
              <div className="text-center">
                <div className="text-[12px] font-extrabold text-violet">+300 XP · 3 дня</div>
                <p className="mt-1.5 text-[11px] leading-snug text-mist">Бонус за серию из 30 дней без пропусков.</p>
                <Mag strength={0.4} className="mt-3"><button onClick={() => sfx.coin()} className="btn3d !h-10 !rounded-xl !text-[10px]" style={{ ["--c" as string]: "var(--color-violet)", ["--cd" as string]: "var(--color-violet-d)" }}>Claim</button></Mag>
              </div>
            </div>
          }
        />
      </div>
    </Asset>
  );
}

/* ----------------------------------------------- MO-26 skeleton → content */
function SkeletonSwap() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setInterval(() => setLoaded((l) => !l), 3200); return () => clearInterval(t); }, []);
  const rows = [
    { t: "BTC/USDT", s: "Long 3x", v: "+$412.80", c: "#22d39a" },
    { t: "ETH/USDT", s: "Short 2x", v: "−$86.10", c: "#ff4f6d" },
    { t: "SOL/USDT", s: "Long 5x", v: "+$128.44", c: "#22d39a" },
  ];
  return (
    <Asset code="MO-26" title="Skeleton → Content Swap" desc="Заглушка с бегущим блеском исчезает по строкам — контент проявляется волной, а не разом." hint="Смотри смену" specs={["shimmer", "row stagger", "loop"]}>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={r.t} className="relative overflow-hidden rounded-2xl bg-ink-800 p-3">
            {!loaded && <div className="absolute inset-0 flex items-center gap-3 p-3" style={{ transitionDelay: `${i * 90}ms`, opacity: loaded ? 0 : 1, transition: "opacity .4s" }}>
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5"><div className="skeleton h-3 w-2/3 rounded" /><div className="skeleton h-2.5 w-1/3 rounded" /></div>
              <div className="skeleton h-5 w-14 rounded-md" />
            </div>}
            <div className="flex items-center gap-3" style={{ opacity: loaded ? 1 : 0, transitionDelay: `${i * 120}ms`, transition: "opacity .4s" }}>
              <span className="grid h-9 w-9 place-items-center rounded-xl font-black text-ink-900" style={{ background: r.c }}>{r.t[0]}</span>
              <div className="flex-1"><div className="text-[13px] font-extrabold">{r.t}</div><div className="text-[10px] text-mist">{r.s}</div></div>
              <span className="num text-[13px] font-extrabold" style={{ color: r.c }}>{r.v}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <GhostBtn className="!h-10 flex-1 !text-[10px]" onClick={() => setLoaded(false)}>Show skeleton</GhostBtn>
        <Btn tone="sky" className="!h-10 flex-1 !text-[10px]" onClick={() => setLoaded(true)}>Load data</Btn>
      </div>
    </Asset>
  );
}

/* --------------------------------------------- MO-27 parallax pointer card */
function PointerParallax() {
  const [o, setO] = useState({ x: 0, y: 0 });
  const layers: { d: number; y: number }[] = [
    { d: 0.2, y: -40 }, { d: 0.45, y: -14 }, { d: 0.8, y: 16 },
  ];
  return (
    <Asset code="MO-27" title="Pointer Parallax Layers" desc="Три слоя двигаются с разной амплитудой при движении курсора: глубина без 3D-библиотек." hint="Води по постеру" specs={["3 layers", "sub-pixel", "no libs"]}>
      <div
        className="relative h-64 overflow-hidden rounded-2xl bg-ink-950"
        onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setO({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }); }}
        onPointerLeave={() => setO({ x: 0, y: 0 })}
      >
        <img src={heroArt} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ transform: `translate(${-o.x * 14}px, ${-o.y * 10}px) scale(1.1)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/50" />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at ${50 + o.x * 40}% ${50 + o.y * 40}%, rgba(59,130,255,.28), transparent 55%)` }} />
        {layers.map((l, i) => (
          <div key={i} className="absolute" style={{ left: `${18 + i * 26}%`, top: `${30 + i * 18}%`, transform: `translate(${o.x * l.d * 90}px, ${o.y * l.d * 60}px)`, transition: "transform .2s" }}>
            <span className="block rounded-xl border border-white/15 bg-ink-800/80 px-3 py-1.5 text-[11px] font-extrabold backdrop-blur" style={{ color: ["#22d39a", "#ffc53d", "#8b5cff"][i] }}>
              {["trend", "level", "entry"][i]}
            </span>
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 p-4 text-center font-display text-xl font-black text-white" style={{ transform: `translate(${o.x * -8}px, ${o.y * -6}px)` }}>
          <Scramble text="DEPTH ON DEMAND" on={Math.abs(o.x) + Math.abs(o.y) > 0.01} />
        </div>
      </div>
    </Asset>
  );
}

/* --------------------------------------------------- MO-28 toast conveyor */
function ToastConveyor() {
  const [items, setItems] = useState<{ id: number; t: string; c: string }[]>([]);
  const pool = [
    { t: "+15 XP · lesson complete", c: "#ffc53d" },
    { t: "Combo x3 · bonus", c: "#ff8a3d" },
    { t: "Order filled at 64,218", c: "#22d39a" },
    { t: "Mira sent a duel invite", c: "#3b82ff" },
    { t: "Streak extended to 48", c: "#8b5cff" },
    { t: "⚠ Price alert triggered", c: "#ff4f6d" },
  ];
  const push = () => {
    const p = pool[Math.floor(Math.random() * pool.length)];
    const id = Date.now();
    setItems((x) => [...x.slice(-3), { id, ...p }]);
    sfx.tick();
    setTimeout(() => setItems((x) => x.filter((z) => z.id !== id)), 3200);
  };
  useEffect(() => {
    const t = setInterval(push, 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <Asset code="MO-28" title="Toast Conveyor" desc="Уведомления выезжают сверху стопкой, живут 3 секунды и уходят вверх с хвостом прогресса." hint="Ускорь поток" specs={["stack 4", "auto", "progress tail"]}>
      <div className="relative h-52 overflow-hidden rounded-2xl bg-ink-900/60">
        <div className="absolute inset-x-3 top-3 space-y-2">
          {items.map((it) => (
            <div key={it.id} className="relative flex items-center gap-2.5 rounded-xl px-3 py-2 shadow-[0_4px_0_#060b18]" style={{ background: `linear-gradient(90deg, ${it.c}33, #16264a 70%)`, animation: "slide-in-right .4s cubic-bezier(.2,1.2,.3,1) both", borderLeft: `3px solid ${it.c}` }}>
              <span className="h-6 w-6 rounded-lg" style={{ background: `${it.c}44` }} />
              <span className="flex-1 text-[12px] font-bold">{it.t}</span>
              <span className="num text-[10px] text-mist">now</span>
              <span className="absolute bottom-0 left-0 h-[2px]" style={{ width: "100%", background: it.c, animation: "shrink 3.2s linear forwards" }} />
            </div>
          ))}
        </div>
        {!items.length && <div className="grid h-full place-items-center text-[12px] text-mist">тихо…</div>}
      </div>
      <Btn tone="sky" block size="sm" className="mt-3" onClick={push}><LayoutPanelTop size={14} /> Push a toast</Btn>
      <style>{`@keyframes shrink{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
    </Asset>
  );
}

export default function MotionLab2() {
  return (
    <Section id="motion2" index="M2" title="Motion Lab · Part 2" subtitle="Свет, стопки, 3D, переходы, декодирование и типографика в движении">
      <SpotlightGrid />
      <StickyStack />
      <Cube3D />
      <Accordion />
      <ImageReveal />
      <PushTransition />
      <OdometerBoard />
      <ScrambleGallery />
      <LogoDraw />
      <FlipSquad />
      <SkeletonSwap />
      <PointerParallax />
      <ToastConveyor />
    </Section>
  );
}
