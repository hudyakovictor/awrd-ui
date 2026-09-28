import type { ComponentType } from "react";
import type { Track } from "../components/kit";
import { EASE, type Bezier } from "../motion/tokens";
import type { SceneProps } from "../scenes/common";
import { HubAssemble, ParallaxOnboarding, SplashBoot } from "../scenes/boot";
import { LiquidTabs, PortalDive, SharedMorph } from "../scenes/transitions";
import { BattleImpact, ChartDecision, ThreatTakeover, TurnTimer } from "../scenes/battle";
import { ChestOpen, GradeReveal, LevelUp } from "../scenes/rewards";
import { HoloCard, Leaderboard, SkillTree } from "../scenes/progression";
import { BreathOrb, DecisionOutcome, ErrorFeedback } from "../scenes/mind";
import { EXTRA } from "./catalog2";
import { INTERACTIVE_SETS } from "./catalog3";

export interface Scene {
  id: string;
  n: string;
  title: string;
  kind: string;
  lead: string;
  secrets: string[];
  tracks: Track[];
  total: number;
  ease: { bez: Bezier; label: string };
  code: string;
  C: ComponentType<SceneProps>;
  interactive?: string;
}
export interface Category {
  id: string;
  n: string;
  title: string;
  en: string;
  color: string;
  blurb: string;
  scenes: Scene[];
}

const T = "#2ee6c5", G = "#ffc34d", R = "#ff4d5e", V = "#9b7bff", B = "#4cc3ff", Gr = "#3ddc84";

export const CATEGORIES: Category[] = [
  {
    id: "boot",
    n: "01",
    title: "Вход в игру",
    en: "Boot · Hub · Onboarding",
    color: T,
    blurb: "Первые 3 секунды решают, останется ли игрок. Логотип не «появляется» — он рождается из удара.",
    scenes: [
      {
        id: "splash", n: "01", title: "Сплэш: удар двух трендов", kind: "Cinematic boot",
        lead: "Бычий и медвежий тренды врезаются в центр как клинки. Удар рождает щит, буквы падают с 3D-поворотом, загрузка сыплет искрами, iris-переход открывает арену.",
        secrets: [
          "Motion blur без блюра: во время полёта клинки растянуты scaleX 1.8 → 1 в момент контакта. Глаз читает скорость.",
          "Удар = 4 слоя одновременно: белый флэш 350мс, 2 ударных кольца разной скорости, 70 искр, trauma-shake. Один слой — «пук», четыре — «БУМ».",
          "Буквы: rotateX -100° с origin по низу + пружина damping 18. Каскад 45мс — быстрее глаз сливает, медленнее — видит лаг.",
          "Прогресс-бар не линейный: ease [0.45,0,0.2,1] — быстро стартует (ощущение отзывчивости), замедляется в конце (ожидание).",
          "Iris-выход: clip-path circle 0% → 80% + фон зумится 1.5 → 1. Два движения в противофазе = глубина.",
        ],
        tracks: [
          { label: "Bloom", start: 60, dur: 900, color: B },
          { label: "Клинки", start: 60, dur: 550, color: Gr },
          { label: "IMPACT + shake", start: 620, dur: 420, color: R },
          { label: "Щит (spring)", start: 620, dur: 700, color: G },
          { label: "Буквы каскад", start: 880, dur: 700, color: "#ffffff" },
          { label: "Загрузка", start: 1580, dur: 2000, color: T },
          { label: "Iris → хаб", start: 3580, dur: 900, color: V },
        ],
        total: 4500,
        ease: { bez: EASE.snap, label: "snap — полёт клинка" },
        code: `// Удар = синхронный залп из 4 слоёв
setPhase("impact");
p.ring(cx, cy, "#fff", 190, 0.7, 10);     // быстрое белое кольцо
p.ring(cx, cy, TEAL, 140, 0.9, 5);        // медленное цветное
p.burst({ x: cx, y: cy, count: 70, speed: [200, 700], drag: 3.2 });
animate(root, shakeKeys(1, 12, 10, 2), { duration: 0.42 });

// Буквы: 3D-падение с каскадом
<motion.span
  initial={{ rotateX: -100, y: -30, opacity: 0 }}
  animate={{ rotateX: 0, y: 0, opacity: 1 }}
  transition={{ delay: i * 0.045, type: "spring", stiffness: 420, damping: 18 }}
  style={{ transformOrigin: "50% 100%" }} />`,
        C: SplashBoot,
      },
      {
        id: "hub", n: "02", title: "Хаб собирается из глубины", kind: "Screen assembly",
        lead: "Экран не «загружается» — он строится: камера оседает, HUD падает сверху, главная карточка поднимается из перспективы, плитки переворачиваются каскадом.",
        secrets: [
          "Порядок сборки = иерархия важности: фон → HUD → герой → действия → навигация. Глаз ведётся по сценарию.",
          "Camera settle: фон scale 1.35 → 1 + blur 14 → 2px за 1.4с outExpo. Ощущение, что камера прилетела и «встала».",
          "Главная карточка: rotateX 38° с origin по нижнему краю — «встаёт с пола». Мягкая пружина stiffness 180.",
          "Плитки — rotateY -90° с каскадом 60мс. Вращение по другой оси, чем у героя, — разнообразие без хаоса.",
          "Индикатор таба — один элемент с layoutId, перелетающий между кнопками. Никогда не fade-in/fade-out.",
        ],
        tracks: [
          { label: "Camera settle", start: 0, dur: 1400, color: B },
          { label: "HUD drop", start: 150, dur: 500, color: T },
          { label: "Nav rise", start: 400, dur: 500, color: V },
          { label: "Hero rotateX", start: 300, dur: 800, color: G },
          { label: "Tiles flip", start: 550, dur: 600, color: Gr },
          { label: "Counters roll", start: 550, dur: 1400, color: G },
        ],
        total: 2000,
        ease: { bez: EASE.outExpo, label: "outExpo — вход UI" },
        code: `// Карточка «встаёт с пола»
<motion.div
  initial={{ rotateX: 38, y: 80, opacity: 0, scale: 0.86 }}
  animate={{ rotateX: 0, y: 0, opacity: 1, scale: 1 }}
  transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 20 }}
  style={{ transformOrigin: "50% 100%" }} />

// Плитки: другая ось + каскад
tiles.map((t, i) => (
  <motion.button
    initial={{ rotateY: -90, opacity: 0 }}
    animate={{ rotateY: 0, opacity: 1 }}
    transition={{ delay: 0.55 + i * 0.06, type: "spring" }} />
))`,
        C: HubAssemble,
      },
      {
        id: "onboarding", n: "03", title: "Параллакс-онбординг на жесте", kind: "Gesture-driven",
        lead: "Один свайп двигает 4 слоя с разной скоростью: свечение, линия графика, персонаж (в обратную сторону!) и текст. Rubber-band на краях.",
        secrets: [
          "Всё производное от ОДНОГО MotionValue x. useTransform даёт каждому слою свой коэффициент: фон 0.35, персонаж -0.25, текст 0.6.",
          "Персонаж движется против свайпа — это создаёт ощущение, что он «в глубине», а не приклеен к карточке.",
          "Rubber-band: offset^0.72 на краях. Сопротивление растёт нелинейно, как у iOS.",
          "Снэп учитывает скорость: projection = offset + velocity × 0.2. Короткий резкий флик листает, медленный — нет.",
          "Точки-индикаторы морфят ширину 8 → 28px пружиной, а не переключают класс.",
        ],
        tracks: [
          { label: "Свайп → x", start: 500, dur: 600, color: T },
          { label: "Фон ×0.35", start: 500, dur: 600, color: B },
          { label: "Персонаж ×-0.25", start: 500, dur: 600, color: R },
          { label: "Текст ×0.6", start: 500, dur: 600, color: G },
          { label: "Слайд 3", start: 1900, dur: 600, color: T },
        ],
        total: 3400,
        ease: { bez: EASE.camera, label: "camera — перелистывание" },
        code: `const x = useMotionValue(0);
// каждому слою — свой коэффициент глубины
const off   = useTransform(x, v => v + i * W);
const bgX   = useTransform(off, v => v * 0.35);
const charX = useTransform(off, v => v * -0.25); // против жеста!
const charR = useTransform(off, [-W, 0, W], [12, 0, -12]);

onPan={(_, info) => {
  let o = info.offset.x;
  if (atEdge) o = Math.sign(o) * Math.pow(Math.abs(o), 0.72); // rubber
  x.set(-idx * W + o);
}}
onPanEnd={(_, info) => {
  const proj = info.offset.x + info.velocity.x * 0.2;
  go(idx + (proj < -W / 3 ? 1 : proj > W / 3 ? -1 : 0));
}}`,
        C: ParallaxOnboarding,
        interactive: "Свайпай влево/вправо",
      },
    ],
  },
  {
    id: "transitions",
    n: "02",
    title: "Переходы",
    en: "Shared element · Portal · Liquid",
    color: V,
    blurb: "Переход — это не смена экрана, а путешествие. Игрок никогда не должен терять, «откуда он пришёл».",
    scenes: [
      {
        id: "morph", n: "04", title: "Карточка становится экраном", kind: "Shared element",
        lead: "Иконка, заголовок и контейнер физически перелетают в новый экран. Список уходит в глубину с блюром. Контент новой страницы догоняет каскадом.",
        secrets: [
          "layoutId на 3 уровнях: контейнер, иконка, заголовок. Каждый летит своей траекторией — получается «разворачивание», а не «масштаб».",
          "Фон не исчезает, а уходит назад: scale 0.92 + blur 3px + opacity 0.35. Это depth-push — пространство, а не слайды.",
          "Вторичный контент (график, шаги, кнопка) стартует с задержкой 150–450мс — когда главный морф уже «приземлился».",
          "При закрытии вторичный контент исчезает за 100–150мс ДО морфа. Выход всегда быстрее входа.",
          "Звёзды сложности — scale 0 + rotate -90 → reward-пружина с каскадом 60мс. Маленький праздник внутри перехода.",
        ],
        tracks: [
          { label: "Список → глубина", start: 700, dur: 450, color: B },
          { label: "Контейнер morph", start: 700, dur: 550, color: V },
          { label: "Иконка/заголовок", start: 700, dur: 550, color: T },
          { label: "Звёзды", start: 1000, dur: 400, color: G },
          { label: "График+шаги", start: 900, dur: 800, color: Gr },
          { label: "Закрытие", start: 3600, dur: 500, color: R },
        ],
        total: 4300,
        ease: { bez: EASE.outExpo, label: "outExpo — вторичный контент" },
        code: `// Список
<motion.button layoutId={\`card\${i}\`}>
  <motion.div layoutId={\`icon\${i}\`} />
  <motion.div layoutId={\`title\${i}\`}>{t}</motion.div>
</motion.button>

// Экран-детали (тот же layoutId = тот же объект)
<AnimatePresence>
  {open !== null && (
    <motion.div layoutId={\`card\${open}\`} transition={SPRING.panel}>
      <motion.div layoutId={\`icon\${open}\`} className="h-20 w-20" />
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }} // выход быстрее
        transition={{ delay: 0.2 }} />
    </motion.div>)}
</AnimatePresence>`,
        C: SharedMorph,
        interactive: "Тапни по сценарию",
      },
      {
        id: "portal", n: "05", title: "Прыжок камеры сквозь UI", kind: "Portal dive",
        lead: "Кнопка втягивает энергию, приседает, и камера ныряет в неё: интерфейс разлетается мимо, туннель колец и speed-lines, арена вылетает из глубины с пружиной.",
        secrets: [
          "Charge: частицы летят К кнопке (homing), кнопка сжимается 0.88 с кривой anticipate. Игрок чувствует накопление.",
          "Zoom-through: хаб scale 1 → 2.6 + blur + разлёт элементов по радиусу от точки входа. Origin = позиция кнопки, не центр экрана.",
          "Туннель: 7 колец с каскадом 60мс, scale 0 → 6. Кольца чередуют цвета — мозг считывает скорость по мельканию.",
          "Speed lines рисуются через pathLength + pathOffset — линия «пролетает», а не просто появляется.",
          "Арена входит мягкой пружиной (stiffness 140) из scale 0.4 + blur 16. Резкий вход после быстрого туннеля = контраст темпа.",
        ],
        tracks: [
          { label: "Charge + homing", start: 0, dur: 260, color: G },
          { label: "Кнопка присед", start: 0, dur: 240, color: G },
          { label: "UI разлёт", start: 260, dur: 700, color: V },
          { label: "Туннель колец", start: 260, dur: 1060, color: T },
          { label: "Speed lines", start: 260, dur: 720, color: "#ffffff" },
          { label: "Арена spring", start: 1010, dur: 900, color: R },
          { label: "Босс heavy", start: 1210, dur: 900, color: R },
        ],
        total: 2200,
        ease: { bez: EASE.inQuart, label: "inQuart — ныряние" },
        code: `// 1. Энергия стягивается в кнопку
p.burst({ x: c.x, y: c.y, count: 30, shape: "dot", target: c });
setSt("charge"); // scale 0.88, ease anticipate
await wait(260);

// 2. Камера ныряет: origin = точка входа
<motion.div style={{ transformOrigin: "50% 78%" }}
  animate={{ scale: 2.6, opacity: 0, filter: "blur(10px)" }}
  transition={{ duration: 0.7, ease: EASE.inQuart }} />

// 3. Туннель
rings.map((_, i) => <motion.div
  animate={{ scale: 6, opacity: [0, 1, 0] }}
  transition={{ duration: 0.7, delay: i * 0.06, ease: EASE.inQuart }} />)`,
        C: PortalDive,
        interactive: "Тапни «Войти в арену»",
      },
      {
        id: "tabs", n: "06", title: "Жидкая навигация", kind: "Liquid tab bar",
        lead: "Индикатор — капля: ведущий край летит жёсткой пружиной, хвост догоняет мягкой. Контент уезжает строго в направлении навигации.",
        secrets: [
          "Два независимых MotionValue: left и right. Ведущий край stiffness 520, хвост 170. Капля растягивается сама — без SVG-фильтров.",
          "При растяжении индикатор худеет по Y (scaleY от ширины) — сохранение объёма, как у настоящей жидкости.",
          "Направленность: custom-проп в AnimatePresence. Идёшь вправо — старое уезжает влево, новое приезжает справа. Пространственная память.",
          "Строки внутри таба каскадом въезжают с той же стороны, что и экран (x: dir × 40).",
          "Иконка активного таба делает «прыжок» y [0,-6,0] + scale [1,1.25,1.1] — тактильный отклик без вибрации.",
        ],
        tracks: [
          { label: "Лидирующий край", start: 900, dur: 250, color: T },
          { label: "Хвост капли", start: 900, dur: 550, color: V },
          { label: "Экран out", start: 900, dur: 350, color: R },
          { label: "Экран in", start: 900, dur: 450, color: Gr },
          { label: "Строки каскад", start: 940, dur: 500, color: B },
          { label: "Иконка прыжок", start: 900, dur: 450, color: G },
        ],
        total: 1800,
        ease: { bez: EASE.overshoot, label: "overshoot — прыжок иконки" },
        code: `const left = useMotionValue(L0), right = useMotionValue(R0);
const width = useTransform([left, right], ([l, r]) => r - l);
const scaleY = useTransform(width, w => Math.max(0.6, base / w)); // объём

const go = (n) => {
  const d = n > tab ? 1 : -1;
  const fast = { type: "spring", stiffness: 520, damping: 34 };
  const slow = { type: "spring", stiffness: 170, damping: 22 };
  animate(right, R(n), d > 0 ? fast : slow); // ведущий — жёсткий
  animate(left,  L(n), d > 0 ? slow : fast); // хвост — мягкий
};

<AnimatePresence custom={dir} mode="popLayout">
  <motion.div key={tab} custom={dir} variants={{
    in:  d => ({ x: d * 120, opacity: 0 }),
    out: d => ({ x: d * -80, opacity: 0 }) }} />`,
        C: LiquidTabs,
        interactive: "Переключай табы",
      },
    ],
  },
  {
    id: "battle",
    n: "03",
    title: "Бой",
    en: "Impact · Decision · Threat · Pressure",
    color: R,
    blurb: "Удар должен ощущаться руками. Hit-stop, отдача, trauma-shake и «призрачная» полоса здоровья — азбука сочного боя.",
    scenes: [
      {
        id: "impact", n: "07", title: "Розыгрыш карты и удар", kind: "Combat juice",
        lead: "Карта приседает, рвётся вверх, ускоряется к врагу со шлейфом. Мир замирает на 90мс. Потом — тряска, искры, отдача врага, цифра урона и медленно тающая белая полоса HP.",
        secrets: [
          "Anticipation 100мс: карта приседает (y +14, scale 0.96) перед рывком. Без замаха удар выглядит слабым.",
          "Полёт — ease-IN [0.55,0,0.9,0.5]: карта УСКОРЯЕТСЯ к цели. Ease-out при атаке — ошибка №1, удар «тормозит» перед контактом.",
          "HIT-STOP 90мс: всё замирает, враг заливается белым (brightness 4). Мозг успевает «прочитать» контакт. Главный секрет Street Fighter.",
          "Ghost bar: красная полоса падает мгновенно (80мс), белая — через 450мс плавно. Игрок видит «сколько снёс».",
          "Цифра урона: scale 2.6 → 0.9 → 1.05 + rotate -8 → 0. Крит — больше, золотой, с подписью. Уход — вверх с ease-in.",
        ],
        tracks: [
          { label: "Anticipation", start: 600, dur: 100, color: G },
          { label: "Lift", start: 700, dur: 200, color: G },
          { label: "Flight + trail", start: 900, dur: 300, color: T },
          { label: "HIT-STOP", start: 1200, dur: 90, color: "#ffffff" },
          { label: "Shake + sparks", start: 1290, dur: 450, color: R },
          { label: "Damage pop", start: 1290, dur: 900, color: G },
          { label: "Ghost HP drain", start: 1740, dur: 600, color: "#ffffff" },
          { label: "Draw card", start: 1640, dur: 600, color: V },
        ],
        total: 2500,
        ease: { bez: [0.55, 0, 0.9, 0.5], label: "ease-in — атака ускоряется" },
        code: `// 1. Замах
await animate(card, { y: 14, scale: 0.96 }, { duration: 0.1 });
// 2. Рывок
await animate(card, { y: -50, scale: 1.25 }, { duration: 0.2, ease: EASE.outExpo });
// 3. Полёт с УСКОРЕНИЕМ
await animate(card, { x: dx, y: dy, rotate: 540, scale: 0.35 },
  { duration: 0.3, ease: [0.55, 0, 0.9, 0.5] });
// 4. HIT-STOP — мир замирает
setFlash(true); await sleep(90); setFlash(false);
// 5. Импакт
animate(root, shakeKeys(0.7, 14, 13, 2.5), { duration: 0.45 });
animate(enemyX, [0, 22, 0], { duration: 0.5 });      // отдача
setHp(n); setTimeout(() => setGhost(n), 450);          // ghost bar`,
        C: BattleImpact,
        interactive: "Тапни по карте в руке",
      },
      {
        id: "fog", n: "08", title: "Туман будущего", kind: "Reveal mechanic",
        lead: "Будущее графика скрыто анимированным туманом. После решения невыбранные варианты тонут, сканирующая линия стирает туман, и свечи вырастают ровно под ней.",
        secrets: [
          "Туман — живой: диагональные штрихи бесконечно едут (backgroundPosition). Статичная заглушка = «не загрузилось».",
          "Один MotionValue scan управляет тремя вещами: clip-path тумана, позиция линии и количество видимых свечей. Идеальная синхронизация бесплатно.",
          "Выбранный вариант: scale 1.03 + свечение + белая вспышка. Остальные: opacity 0.25, scale 0.94 — фокус через подавление.",
          "Кривая camera [0.65,0,0.35,1] для скана — медленный старт даёт напряжение, медленный финиш — «приземление».",
          "Вердикт въезжает reward-пружиной, иконка — с rotate -120°. Сначала контейнер, потом смысл.",
        ],
        tracks: [
          { label: "Варианты in", start: 100, dur: 500, color: T },
          { label: "Выбор + фокус", start: 1500, dur: 400, color: G },
          { label: "Скан тумана", start: 2000, dur: 1400, color: "#ffffff" },
          { label: "Свечи растут", start: 2000, dur: 1500, color: Gr },
          { label: "Вердикт", start: 3400, dur: 600, color: Gr },
        ],
        total: 4200,
        ease: { bez: EASE.camera, label: "camera — скан" },
        code: `const scan = useMotionValue(0);
const scanX   = useTransform(scan, v => t0 + v * (W - t0));
const fogClip = useTransform(scan, v => \`inset(0 0 0 \${v * 100}%)\`);

// одна анимация — три синхронных эффекта
const unsub = scan.on("change", v => setVisible(18 + Math.round(v * 10)));
await animate(scan, 1, { duration: 1.4, ease: EASE.camera });
unsub();

<motion.div style={{ clipPath: fogClip }}>  {/* туман */}
<motion.div style={{ x: scanX }} />          {/* линия */}`,
        C: ChartDecision,
        interactive: "Выбери вариант",
      },
      {
        id: "threat", n: "09", title: "Угроза захватывает экран", kind: "Alert takeover",
        lead: "Глитч с RGB-расслоением, баннер врезается с масштаба 2.4, сирена вращается, края пульсируют красным, полосы опасности бегут, список угроз влетает со вспышками.",
        secrets: [
          "Глитч 280мс: две копии слоя (красная/голубая) в mix-blend screen, дёргаются по x и режутся clip-path. Дольше 300мс — раздражает.",
          "Slam-in: scale 2.4 → 1 за 320мс с кривой snap. Объект «падает на камеру» — это угроза, а не уведомление.",
          "Сирена: conic-gradient с двумя лучами, rotate 360° за 3с linear. Бесконечные элементы ВСЕГДА linear, иначе «дышат».",
          "Виньетка inset box-shadow пульсирует 60 → 120px. Периферийное зрение ловит угрозу раньше, чем игрок прочтёт текст.",
          "Каждый пункт списка въезжает с собственной красной вспышкой (opacity 0.7 → 0). Ритм 90мс = «сигнал тревоги».",
        ],
        tracks: [
          { label: "RGB glitch", start: 900, dur: 280, color: B },
          { label: "Slam banner", start: 1180, dur: 320, color: R },
          { label: "Shake + искры", start: 1180, dur: 400, color: R },
          { label: "Сирена (loop)", start: 1180, dur: 1800, color: R },
          { label: "Список угроз", start: 1530, dur: 700, color: G },
          { label: "CTA pulse", start: 1980, dur: 1000, color: R },
        ],
        total: 3000,
        ease: { bez: EASE.snap, label: "snap — slam-in" },
        code: `// RGB split: три копии, две из них — цветные в screen
[["#ff004c", -4], ["#00e5ff", 4], ["", 0]].map(([c, o]) => (
  <motion.div style={{ mixBlendMode: c ? "screen" : "normal" }}
    animate={glitch && c ? {
      x: [0, o, -o, o, 0],
      clipPath: ["inset(10% 0 60% 0)", "inset(50% 0 20% 0)", "inset(0)"],
    } : { x: 0 }}
    transition={{ duration: 0.28, ease: "linear" }} />
));

// Slam
<motion.div initial={{ scale: 2.4, opacity: 0, rotate: -6 }}
  animate={{ scale: 1, opacity: 1, rotate: 0 }}
  transition={{ duration: 0.32, ease: EASE.snap }} />`,
        C: ThreatTakeover,
      },
      {
        id: "timer", n: "10", title: "Давление времени", kind: "Tension loop",
        lead: "Кольцо таймера меняет цвет по пути бирюза → золото → красный. На последних 3 секундах весь экран бьётся как сердце, а края наливаются кровью.",
        secrets: [
          "Цвет — функция прогресса через useTransform с 4 стопами. Не переключение классов, а непрерывный градиент эмоции.",
          "Heartbeat «лаб-дап»: scale [1, k, 1, k/2, 1] за 550мс. Двойной удар узнаётся подсознательно. k растёт к нулю.",
          "Цифры: старая уходит вверх с scale 1.4, новая приходит снизу с 0.6. Время «утекает» вверх.",
          "Кнопки выбора дрожат ±1.5px с каскадом — нервозность передаётся интерфейсу, а не только таймеру.",
          "«ВРЕМЯ ВЫШЛО» — штамп: scale 3 → 1, rotate -18 → -8 за 280мс. Остаточный наклон = рукотворность.",
        ],
        tracks: [
          { label: "Кольцо (linear)", start: 0, dur: 6000, color: T },
          { label: "Цвет → золото", start: 2400, dur: 1500, color: G },
          { label: "Heartbeat ×3", start: 3000, dur: 2600, color: R },
          { label: "Виньетка", start: 3000, dur: 3000, color: R },
          { label: "Штамп", start: 6000, dur: 300, color: R },
        ],
        total: 6400,
        ease: { bez: [0.45, 0, 0.55, 1], label: "sine — сердцебиение" },
        code: `const color = useTransform(prog, [0, .35, .6, 1],
  ["#ff4d5e", "#ff4d5e", "#ffc34d", "#2ee6c5"]);

for (let s = 5; s >= 0; s--) {
  await wait(1000); setSec(s);
  if (s <= 3 && s > 0) {
    const k = 1 + (4 - s) * 0.008;              // сильнее к нулю
    animate(root, { scale: [1, k, 1, 1 + (k - 1) / 2, 1] },
      { duration: 0.55 });                        // лаб-дап
  }
}`,
        C: TurnTimer,
      },
    ],
  },
  {
    id: "rewards",
    n: "04",
    title: "Награды",
    en: "Chest · Grade · Level up",
    color: G,
    blurb: "Награда — это не число, а ритуал. Замах, ожидание, взрыв, праздник, и деньги, которые физически летят в карман.",
    scenes: [
      {
        id: "chest", n: "11", title: "Сундук: ритуал открытия", kind: "Loot ceremony",
        lead: "Три нарастающих удара с сжатием и светом из щели, взрыв, god-rays, легендарная карта крутится из сундука, монеты взлетают и магнитом летят в счётчик, который подпрыгивает на каждой.",
        secrets: [
          "Замах ×3 с нарастанием: каждый удар сильнее (scale ×i, rotate ×i), пауза между ними короче (120→30мс). Ускорение ритма = предвкушение.",
          "Свет из щели растёт с каждым ударом (seam 0.33 → 1) — обещание того, что внутри.",
          "Squash & stretch: при ударе сундук сплющивается scaleY 0.79 / scaleX 1.15, origin по дну. Объект «живой».",
          "Монеты-магниты: разлёт с гравитацией → через 280мс homing к HUD. Каждая долетевшая +25 и bump счётчика scale 1.22 → 1.",
          "Карта: rotateY 540° → 0 с мягкой пружиной (stiffness 120). Полтора оборота — «раскрутка рулетки».",
        ],
        tracks: [
          { label: "Удар ×3", start: 500, dur: 1100, color: G },
          { label: "Seam glow", start: 500, dur: 1100, color: "#ffffff" },
          { label: "BURST", start: 1600, dur: 400, color: R },
          { label: "God rays", start: 1600, dur: 2500, color: G },
          { label: "Карта spin", start: 1750, dur: 1200, color: V },
          { label: "Монеты → HUD", start: 2500, dur: 1400, color: G },
        ],
        total: 4200,
        ease: { bez: EASE.overshoot, label: "overshoot — bump счётчика" },
        code: `for (let i = 1; i <= 3; i++) {
  setSeam(i / 3);                                  // свет из щели
  await animate(chest, {
    scaleX: [1, 1 + 0.05 * i, 0.97, 1],
    scaleY: [1, 1 - 0.07 * i, 1.04, 1],            // squash & stretch
    rotate: [0, -3 * i, 3 * i, 0],
  }, { duration: 0.32 });
  await wait(120 - i * 30);                        // ритм ускоряется
}
p.burst({ shape: "coin", count: 18, gravity: 300,
  target: hudCoin,                                 // HOMING
  onArrive: () => {
    coins += 25;
    animate(counter, { scale: [1.22, 1] }, { type: "spring", stiffness: 600, damping: 12 });
  }});`,
        C: ChestOpen,
      },
      {
        id: "grade", n: "12", title: "Оценка вместо победы", kind: "Score reveal",
        lead: "Стрелка спидометра качества решения пролетает цель и возвращается. Буква-оценка падает штампом, «+» подпрыгивает следом, метрики заполняются каскадом со счётчиками.",
        secrets: [
          "Стрелка — пружина с damping 9: она ПЕРЕЛЕТАЕТ 78%, откатывается, колеблется. Настоящий стрелочный прибор, а не прогресс-бар.",
          "Дуга и стрелка — от одного MotionValue. strokeDasharray = L × 0.75 × v. Синхрон без ручной подгонки.",
          "Штамп «B»: scale 3.2 → 1 за 260мс + trauma 0.6. Оценка «прилетает», а не «появляется».",
          "«+» появляется через 250мс после буквы — отдельный маленький праздник. Двухтактный ритм «БАМ-пум».",
          "Каскад метрик 80мс, числа считают ease-out-expo: быстро до 90%, медленно добирают. Ощущение точности.",
        ],
        tracks: [
          { label: "Стрелка spring", start: 300, dur: 1400, color: Gr },
          { label: "Дуга синхрон", start: 300, dur: 1400, color: G },
          { label: "Штамп B", start: 1400, dur: 260, color: Gr },
          { label: "«+» pop", start: 1650, dur: 400, color: G },
          { label: "Метрики каскад", start: 1660, dur: 1400, color: T },
          { label: "Вывод", start: 2160, dur: 500, color: Gr },
        ],
        total: 3200,
        ease: { bez: EASE.outExpo, label: "outExpo — счётчики" },
        code: `const val = useMotionValue(0);
const dash   = useTransform(val, v => \`\${L * 0.75 * v} \${L}\`);
const needle = useTransform(val, v => -135 + v * 270);

// Недодемпфированная пружина = стрелка «перелетает»
animate(val, 0.78, { type: "spring", stiffness: 60, damping: 9 });

<motion.circle style={{ strokeDasharray: dash }} />
<motion.div style={{ rotate: needle, transformOrigin: "50% 100%" }} />`,
        C: GradeReveal,
      },
      {
        id: "levelup", n: "13", title: "Переполнение уровня", kind: "Progression burst",
        lead: "XP-шкала разгоняется к краю, вспыхивает белым, бейдж делает оборот, цифра уровня прокручивается, заголовок сжимается из разрядки, разблокировки откидываются как карточки.",
        secrets: [
          "Шкала к переполнению — ease-IN: ускоряется к краю. Игрок физически ощущает «сейчас будет».",
          "Остаток XP после переполнения продолжает заполнять шкалу с нуля (1000 → 1100). Прогресс не теряется — важно для доверия.",
          "Цифра уровня — слот-машина: AnimatePresence popLayout, старая уходит вверх, новая приходит снизу с пружиной.",
          "Заголовок: letter-spacing 0.6em → 0.08em + scale 0.4 → 1. Буквы «собираются» в слово.",
          "Разблокировки: rotateX -80° с origin сверху — откидываются как карточки на петлях.",
        ],
        tracks: [
          { label: "XP разгон", start: 500, dur: 1100, color: V },
          { label: "Flash + burst", start: 1600, dur: 500, color: "#ffffff" },
          { label: "Бейдж оборот", start: 1600, dur: 800, color: V },
          { label: "Цифра слот", start: 1600, dur: 500, color: T },
          { label: "Заголовок", start: 1600, dur: 600, color: "#ffffff" },
          { label: "Остаток XP", start: 1600, dur: 900, color: V },
          { label: "Unlocks", start: 2100, dur: 700, color: G },
        ],
        total: 3000,
        ease: { bez: [0.5, 0, 0.9, 0.6], label: "ease-in — разгон к краю" },
        code: `await animate(xp, 999.9, { duration: 1.1, ease: [0.5, 0, 0.9, 0.6] });
setLvl(13);                                   // слот-машина
p.ring(c.x, c.y, "#fff", 220, 0.7, 12);
xp.set(1000);
await animate(xp, 1100, { duration: 0.9, ease: EASE.outExpo }); // остаток

<AnimatePresence mode="popLayout">
  <motion.div key={lvl}
    initial={{ y: 70 }} animate={{ y: 0 }} exit={{ y: -70 }}
    transition={SPRING.reward}>{lvl}</motion.div>
</AnimatePresence>`,
        C: LevelUp,
      },
    ],
  },
  {
    id: "progression",
    n: "05",
    title: "Прогрессия",
    en: "Skill tree · Leaderboard · Collection",
    color: B,
    blurb: "Рост должен быть видимым и осязаемым: энергия бежит по веткам, строки физически обгоняют соперников, карты отражают свет.",
    scenes: [
      {
        id: "skilltree", n: "14", title: "Энергия по ветке навыков", kind: "Unlock flow",
        lead: "Камера плавно следует к узлу, комета бежит по кривой Безье (CSS motion path), узел заряжается кольцом, взрывается и переворачивается с замка на иконку. Следующие ветки оживают.",
        secrets: [
          "CSS offset-path + offsetDistance 0 → 100%: комета едет по той же кривой, что и SVG-линия. Одна строка path — два эффекта.",
          "Доступные ветки — бегущий пунктир (stroke-dashoffset loop). Заблокированные — статика. Движение = доступность.",
          "Узел — 3D-карточка с двумя гранями (backface hidden). Разблокировка = rotateY 180 → 0. Замок буквально переворачивается.",
          "Charge: кольцо pathLength 0 → 1 + сжатие anticipate перед взрывом. Энергия накапливается, потом высвобождается.",
          "Камера (y контейнера) едет к цели кривой camera ДО анимации узла. Игрок всегда видит место действия.",
        ],
        tracks: [
          { label: "Camera follow", start: 700, dur: 800, color: B },
          { label: "Комета path", start: 700, dur: 600, color: "#ffffff" },
          { label: "Charge ring", start: 1350, dur: 520, color: T },
          { label: "Burst + flip", start: 1870, dur: 600, color: G },
          { label: "Ветки оживают", start: 1870, dur: 400, color: Gr },
          { label: "2-й узел", start: 2800, dur: 1200, color: R },
        ],
        total: 4200,
        ease: { bez: EASE.anticipate, label: "anticipate — заряд узла" },
        code: `const edge = \`M\${a.x} \${a.y} C\${a.x} \${my} \${b.x} \${my} \${b.x} \${b.y}\`;

<motion.path d={edge} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
<motion.div   // та же кривая — для кометы
  style={{ offsetPath: \`path('\${edge}')\` }}
  initial={{ offsetDistance: "0%" }}
  animate={{ offsetDistance: "100%" }}
  transition={{ duration: 0.6, ease: EASE.camera }} />

// Узел: две грани, разблокировка = переворот
<motion.div animate={{ rotateY: done ? 0 : 180 }} style={{ transformStyle: "preserve-3d" }}>
  <Face icon />  <Face lock style={{ transform: "rotateY(180deg)" }} />
</motion.div>`,
        C: SkillTree,
        interactive: "Тапни по пульсирующему узлу",
      },
      {
        id: "leaderboard", n: "15", title: "Прорыв в рейтинге", kind: "FLIP reorder",
        lead: "Пьедестал вырастает пружинами в порядке 2-1-3. Строка игрока растёт очками и физически обгоняет соперников по одному, каждый обгон — отдельное событие.",
        secrets: [
          "FLIP через layout-проп: сортируешь массив — строки сами перелетают. Никаких расчётов позиций вручную.",
          "Обгон пошагово: 4 обновления очков с паузой 380мс. Прыжок сразу на 2 место — скучно; 4 обгона — история.",
          "Строка игрока при подъёме: scale 1.05 + золотое свечение + z-index 10. Она «проплывает над» остальными.",
          "Номер места — вертикальный слот с popLayout. Число меняется «механически», как табло.",
          "Пьедестал: 2-е место стартует первым (0.15с), 1-е — с задержкой 0, 3-е — последним. Центр — главный, края — свита.",
        ],
        tracks: [
          { label: "Пьедестал", start: 0, dur: 900, color: G },
          { label: "Кубки pop", start: 500, dur: 600, color: G },
          { label: "Обгон #5", start: 1480, dur: 400, color: T },
          { label: "Обгон #4", start: 1860, dur: 400, color: T },
          { label: "Обгон #3", start: 2240, dur: 400, color: T },
          { label: "Обгон #2", start: 2620, dur: 400, color: Gr },
        ],
        total: 3600,
        ease: { bez: EASE.outExpo, label: "layout spring ≈ outExpo" },
        code: `for (const s of [2200, 2300, 2450, 2760]) {
  await wait(380);                                 // каждый обгон — событие
  setRows(r => r.map(x => x.me ? { ...x, s } : x)
                .sort((a, b) => b.s - a.s));
}

rows.map(r => (
  <motion.div key={r.n} layout transition={SPRING.layout}
    animate={r.me && climb
      ? { scale: 1.05, boxShadow: "0 0 30px #ffc34d88" }
      : { scale: 1 }} />
))`,
        C: Leaderboard,
      },
      {
        id: "holo", n: "16", title: "Голографическая карта", kind: "3D material",
        lead: "Карта наклоняется за пальцем через пружины, фольга переливается радугой в color-dodge, блик следует за точкой касания, портрет смещается внутри рамки как в окне.",
        secrets: [
          "Указатель → MotionValue → useSpring (180/18). Наклон догоняет палец с инерцией — ощущение массы.",
          "Фольга: радужный градиент 200% ширины в mix-blend color-dodge, backgroundPosition от указателя. Настоящий голо-эффект.",
          "Блик — radial-gradient в mix-blend overlay, центр = позиция пальца. useMotionTemplate собирает строку без ререндеров.",
          "Parallax-окно: портрет двигается ±10px, значок стоимости — в обратную сторону. 3 глубины в одной карте.",
          "Флип через вложенный rotateY внутри наклона. Наклон и переворот не конфликтуют — это разные уровни иерархии.",
        ],
        tracks: [
          { label: "Орбита наклона", start: 0, dur: 3200, color: V },
          { label: "Фольга", start: 0, dur: 3200, color: G },
          { label: "Блик", start: 0, dur: 3200, color: "#ffffff" },
          { label: "Флип 180°", start: 3300, dur: 900, color: T },
          { label: "Флип назад", start: 4900, dur: 900, color: T },
        ],
        total: 5800,
        ease: { bez: EASE.camera, label: "camera ≈ spring наклона" },
        code: `const sx = useSpring(px, { stiffness: 180, damping: 18 });
const rotY = useTransform(sx, [0, 1], [-22, 22]);
const foil = useTransform(sx, v => \`\${v * 200}% 50%\`);
const glare = useMotionTemplate\`radial-gradient(circle at \${gx} \${gy},
  rgba(255,255,255,.55), transparent 45%)\`;

<motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
  <motion.img style={{ x: layerX, y: layerY }} />        {/* окно */}
  <motion.div className="mix-blend-color-dodge"
    style={{ backgroundImage: RAINBOW, backgroundSize: "200% 100%",
             backgroundPosition: foil }} />
  <motion.div className="mix-blend-overlay" style={{ background: glare }} />
</motion.div>`,
        C: HoloCard,
        interactive: "Води курсором, тап — флип",
      },
    ],
  },
  {
    id: "mind",
    n: "06",
    title: "Сознание",
    en: "Error · Outcome · Breath",
    color: Gr,
    blurb: "Самое сложное: анимация, которая учит, а не наказывает. Ошибка — это разбор, исход — не оценка, спокойствие — навык.",
    scenes: [
      {
        id: "error", n: "17", title: "Ошибка, которая учит", kind: "Feedback loop",
        lead: "Выбранный вариант качает головой «нет» затухающей синусоидой, экран расслаивается, правильный ответ мягко подсвечивается, шторка «Почему?» выезжает, аннотация рисуется поверх графика, текст проявляется из блюра по словам.",
        secrets: [
          "«Нет-нет» — затухающая синусоида amp × (1 - i/n)², а не случайная тряска. Направленное движение = смысл, а не шум.",
          "RGB-split через filter: drop-shadow(3px 0 red) drop-shadow(-3px 0 cyan) на 260мс. Дешёвый и мощный глитч.",
          "Правильный ответ подсвечивается ЧЕРЕЗ 450мс после ошибки. Сначала осознание, потом подсказка.",
          "Аннотация рисуется pathLength 0 → 1 как маркер от руки. Эллипс с наклоном -8° — рукотворность.",
          "Текст проявляется по словам: blur 6px → 0 + y 4 → 0, каскад 35мс. Читается в темпе речи, а не падает стеной.",
        ],
        tracks: [
          { label: "Нет-нет shake", start: 1100, dur: 500, color: R },
          { label: "RGB split", start: 1100, dur: 260, color: B },
          { label: "Header morph", start: 1100, dur: 300, color: R },
          { label: "Верный ответ", start: 1550, dur: 450, color: Gr },
          { label: "Шторка ПОЧЕМУ", start: 1860, dur: 500, color: R },
          { label: "Аннотация", start: 2160, dur: 800, color: G },
          { label: "Текст по словам", start: 2110, dur: 900, color: "#ffffff" },
        ],
        total: 3400,
        ease: { bez: EASE.outExpo, label: "outExpo — рисование маркера" },
        code: `// затухающая синусоида: направленное «нет»
const noShake = (amp = 14, n = 7) => Array.from({ length: n + 1 },
  (_, i) => i === n ? 0 : (i % 2 ? -1 : 1) * amp * Math.pow(1 - i / n, 2));

<motion.div animate={{ x: noShake(12) }} transition={{ duration: 0.5 }} />

// Текст проявляется словами
words.map((w, i) => (
  <motion.span
    initial={{ opacity: 0, filter: "blur(6px)", y: 4 }}
    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    transition={{ delay: 0.25 + i * 0.035 }}>{w} </motion.span>
))`,
        C: ErrorFeedback,
      },
      {
        id: "outcome", n: "18", title: "Решение ≠ исход", kind: "Split reveal",
        lead: "Две панели съезжаются с противоположных сторон, разделитель прорастает светом, решение получает галочку, рынок рисует падение. Потом панели разворачиваются друг от друга — два разных мира.",
        secrets: [
          "Противоположные направления входа (x ±160) визуально кодируют «это разные вещи».",
          "Разделитель растёт height 0 → 100% с градиентом к прозрачности по краям — световой шов, а не линия.",
          "Финальный разворот rotateY ±10° с origin у шва — панели «раскрываются как книга». Метафора разделения.",
          "Галочка: rotate -180 → 0 + reward-пружина. Линия рынка: pathLength с кривой camera — неумолимо, без перелёта.",
          "Разный характер движения для хорошего (пружина) и нейтрального (линейная кривая) — эмоция через физику.",
        ],
        tracks: [
          { label: "Панели съезд", start: 200, dur: 600, color: V },
          { label: "Шов света", start: 400, dur: 600, color: "#ffffff" },
          { label: "Галочка", start: 900, dur: 500, color: Gr },
          { label: "Линия рынка", start: 900, dur: 900, color: R },
          { label: "Книга раскрыта", start: 1900, dur: 600, color: V },
          { label: "Вердикт", start: 1900, dur: 700, color: Gr },
        ],
        total: 2800,
        ease: { bez: EASE.camera, label: "camera — линия рынка" },
        code: `// Левая панель — шарнир справа, правая — слева
<motion.div style={{ transformOrigin: "100% 50%" }}
  animate={{ x: 0, rotateY: split ? 10 : 0 }} transition={SPRING.panel} />
<motion.div className="bg-gradient-to-b from-transparent via-white to-transparent"
  animate={{ height: "100%" }} />
<motion.div style={{ transformOrigin: "0% 50%" }}
  animate={{ x: 0, rotateY: split ? -10 : 0 }} transition={SPRING.panel} />`,
        C: DecisionOutcome,
      },
      {
        id: "breath", n: "19", title: "Дыхательная сфера 4-4-4-4", kind: "Calm loop",
        lead: "Органическая сфера из трёх морфящих слоёв дышит вместе с игроком. Точка обегает квадрат, частицы втягиваются на вдохе и рассеиваются на выдохе, стресс тает.",
        secrets: [
          "Органика: border-radius с 8 значениями (x / y) морфит между двумя формами. 3 слоя с разными периодами (5/6/7с) — никогда не повторяется.",
          "Период морфа НЕ кратен дыханию. Если кратен — мозг замечает механику и магия пропадает.",
          "Дыхание — синусоида [0.45,0,0.55,1]. Никаких пружин: спокойствие = отсутствие перелёта.",
          "Частицы на вдохе летят В центр (homing), на выдохе — ИЗ центра с низким drag. Воздух видимый.",
          "Подпись фазы: letter-spacing 0.4em → 0.1em — слово «выдыхается» в форму.",
        ],
        tracks: [
          { label: "Вдох", start: 0, dur: 2000, color: T },
          { label: "Задержка", start: 2000, dur: 2000, color: B },
          { label: "Выдох", start: 4000, dur: 2000, color: V },
          { label: "Задержка", start: 6000, dur: 2000, color: B },
          { label: "Стресс ↓", start: 0, dur: 8000, color: Gr },
        ],
        total: 8000,
        ease: { bez: [0.45, 0, 0.55, 1], label: "sine — дыхание" },
        code: `<motion.div animate={{
  scale: phase.scale,
  borderRadius: [
    "42% 58% 63% 37% / 41% 44% 56% 59%",
    "58% 42% 38% 62% / 55% 38% 62% 45%",
    "42% 58% 63% 37% / 41% 44% 56% 59%"],
}} transition={{
  scale: { duration: 2, ease: [0.45, 0, 0.55, 1] },   // без перелёта
  borderRadius: { duration: 5 + i, repeat: Infinity }, // НЕ кратно дыханию
}} />`,
        C: BreathOrb,
      },
    ],
  },
];

CATEGORIES.push(...EXTRA, ...INTERACTIVE_SETS);

export const ALL_SCENES = CATEGORIES.flatMap((c) => c.scenes.map((s) => ({ ...s, cat: c })));
