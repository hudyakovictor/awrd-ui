import type { Category } from "./catalog";
import { EASE } from "../motion/tokens";
import { Matchmaking, PackOpening, SpinWheel, StreakFire } from "../scenes/meta";
import { Coachmark, DragToSlot, PullRefresh, SwipeDecide } from "../scenes/gestures";
import { ComboFever, DefeatComeback, DynamicIsland, VictorySequence } from "../scenes/finale";

const T = "#2ee6c5", G = "#ffc34d", R = "#ff4d5e", V = "#9b7bff", B = "#4cc3ff", Gr = "#3ddc84", P = "#ff6bd6", O = "#ff8a3d", L = "#b8ff3d";

export const EXTRA: Category[] = [
  {
    id: "meta",
    n: "07",
    title: "Мета-игра",
    en: "Pack · Wheel · Streak · Matchmaking",
    color: P,
    blurb: "Всё, что возвращает игрока завтра: паки, колесо, серии и матчмейкинг. Каждое — маленький аттракцион с ритуалом.",
    scenes: [
      {
        id: "pack", n: "20", title: "Открытие набора карт", kind: "Gacha ritual",
        lead: "Пак трясётся трижды, линия разрыва бежит искрами, клапан улетает, карты веером вылетают рубашкой вверх. Обычные переворачиваются сразу, редкие — сначала дрожат и светятся, легендарная — трясёт весь экран.",
        secrets: [
          "Порядок раскрытия от худшей к лучшей: 0 → 2 → 1 → 3 → 4. Кульминация всегда последней. Так делает Hearthstone и каждая gacha-игра.",
          "Pre-reveal tell: эпик и легенда дрожат (rotate ±4°) и пульсируют цветом редкости ДО переворота. Предвкушение сильнее, чем сама награда.",
          "Масштаб реакции пропорционален редкости: частиц 10 + r×22, кольца только с эпика, тряска только на легенде. Иерархия эмоций.",
          "Разрыв — MotionValue 0→1 управляет шириной линии, а подписка на него роняет искры в точке разрыва. Одна величина — два эффекта.",
          "Веер: x = (i-2)×50, rotate = (i-2)×9°, y — парабола. Каскад 60мс, пружина 220/18 — карты «раскладываются рукой».",
        ],
        tracks: [
          { label: "Встряска ×3", start: 500, dur: 1000, color: P },
          { label: "Разрыв + искры", start: 1500, dur: 350, color: "#ffffff" },
          { label: "Клапан улетает", start: 1850, dur: 600, color: P },
          { label: "Веер", start: 2230, dur: 900, color: T },
          { label: "Обычные flip", start: 3180, dur: 800, color: "#cfd8ea" },
          { label: "Эпик: tell+flip", start: 4000, dur: 1500, color: V },
          { label: "Легенда: tell+flip", start: 5500, dur: 1900, color: G },
        ],
        total: 7600,
        ease: { bez: EASE.camera, label: "camera — разрыв" },
        code: `const flip = async (i) => {
  const r = PACK[i].r;
  if (r >= 2) {                                  // PRE-REVEAL TELL
    setFocus(i);
    await anim(card, { scale: [1, 1.18, 1.14], rotate: [0, -4, 4, -3, 3, 0] },
      { duration: r === 3 ? 0.9 : 0.55 });
  }
  setFlipped(i);                                  // rotateY 180 → 0
  p.burst({ count: 10 + r * 22, colors: [RAR[r].c, "#fff"] });
  if (r === 3) anim(root, shakeKeys(0.85), { duration: 0.45 });
};
for (const i of [0, 2, 1, 3, 4]) await flip(i);  // худшее → лучшее`,
        C: PackOpening,
        interactive: "Тапай по картам",
      },
      {
        id: "wheel", n: "21", title: "Колесо с трещоткой", kind: "Physics wheel",
        lead: "Колесо сначала отводится назад (замах), затем крутится 6 оборотов с долгим торможением. Язычок отклоняется на каждом колышке и отпружинивает, лампочки бегут быстрее во время вращения.",
        secrets: [
          "Язычок — чистая функция от угла: useTransform(rot, r => f(r mod 45°)). Никакой физики — но выглядит как настоящая трещотка.",
          "Звук тика — на смене сегмента через useMotionValueEvent. Частота тиков сама замедляется вместе с колесом — идеальный синхрон.",
          "Кривая [0.12, 0.8, 0.18, 1] за 4.4с: 80% пути за первую секунду, затем долгое «доползание». Последние 2 сегмента решают всё — напряжение.",
          "Джиттер ±30% сегмента: колесо никогда не останавливается ровно по центру — ощущение честности.",
          "Замах назад на 18° перед спином — anticipation, который продаёт силу толчка.",
        ],
        tracks: [
          { label: "Замах -18°", start: 700, dur: 350, color: G },
          { label: "Спин 6 оборотов", start: 1050, dur: 4400, color: T },
          { label: "Лампы (fast)", start: 1050, dur: 4400, color: G },
          { label: "Трещотка", start: 1050, dur: 4400, color: R },
          { label: "Выигрыш+конфетти", start: 5450, dur: 900, color: P },
        ],
        total: 6500,
        ease: { bez: [0.12, 0.8, 0.18, 1], label: "долгое торможение" },
        code: `const flapper = useTransform(rot, r => {
  const f = ((r % 45) + 45) % 45 / 45;          // позиция колышка
  return f > .78 ? -((f - .78) / .22) * 30       // колышек давит
       : f < .12 ? -30 * (1 - f / .12)           // отпружинивание
       : 0;
});
useMotionValueEvent(rot, "change", r => {
  const s = Math.floor(r / 45);
  if (s !== last) { last = s; sfx.spinTick(s); }
});
await animate(rot, cur - 18, { duration: .35 });            // замах
await animate(rot, final, { duration: 4.4, ease: [.12, .8, .18, 1] });`,
        C: SpinWheel,
        interactive: "Тапни «Крути»",
      },
      {
        id: "streak", n: "22", title: "Серия: огонь разгорается", kind: "Retention loop",
        lead: "Шесть прошлых дней вспыхивают каскадом, огненная линия тянется между ними. На сегодняшнем дне уголёк втягивает энергию, вспыхивает, и пламя вырастает с пружинным перелётом. Счётчик переворачивается, бонус падает штампом.",
        secrets: [
          "Пламя — два SVG-пути с разной частотой колебаний (0.9с и 0.6с). Несинхронные слои = живой огонь без спрайтов.",
          "Origin пламени по нижнему краю: scaleY и skewX раскачивают только верх, основание стоит на месте.",
          "Угли — частицы с ОТРИЦАТЕЛЬНОЙ гравитацией (-220) и низким drag. Одна смена знака — и искры летят вверх.",
          "Счётчик 6 → 7 переворачивается по X (rotateX ±90°) — табло аэропорта. Ощущение «записано навсегда».",
          "Прогресс недельного сундука заполняется синхронно с днями — связь между маленькой и большой наградой.",
        ],
        tracks: [
          { label: "Дни каскадом", start: 400, dur: 700, color: O },
          { label: "Огненная линия", start: 400, dur: 800, color: R },
          { label: "Уголёк-втягивание", start: 1500, dur: 500, color: O },
          { label: "Вспышка пламени", start: 2000, dur: 700, color: G },
          { label: "Счётчик flip", start: 2000, dur: 500, color: "#ffffff" },
          { label: "Штамп x1.5", start: 2250, dur: 300, color: G },
          { label: "Угли (loop)", start: 2000, dur: 4000, color: O },
        ],
        total: 6000,
        ease: { bez: EASE.overshoot, label: "overshoot — вспышка дня" },
        code: `// Два языка пламени с разной частотой
<motion.path d={OUTER} style={{ transformOrigin: "50% 100%" }}
  animate={{ scaleY: [1, 1.08, .95, 1.05, 1], skewX: [0, 3, -2, 2, 0] }}
  transition={{ duration: .9, repeat: Infinity }} />
<motion.path d={INNER} animate={{ scaleY: [1, .9, 1.1, 1] }}
  transition={{ duration: .6, repeat: Infinity }} />

// Угли летят вверх: гравитация со знаком минус
p.burst({ gravity: -220, drag: .8, angle: -Math.PI / 2, spread: .8 });`,
        C: StreakFire,
      },
      {
        id: "matchmaking", n: "23", title: "Матчмейкинг → VS-экран", kind: "Versus reveal",
        lead: "Радар крутится, на нём вспыхивают соперники, имена прокручиваются как барабан слот-машины и замедляются. Найден: две диагональные панели влетают навстречу, молния рисуется по шву, VS падает на камеру. Отсчёт 3-2-1.",
        secrets: [
          "Барабан имён: интервалы 60 → 400мс растут. Замедление читается как «сейчас остановится» — тот же трюк, что в колесе.",
          "Диагональный сплит — две clip-path полигональные маски, влетающие с противоположных сторон. Цвет и направление = команда.",
          "Портреты внутри панелей едут медленнее панелей (parallax x ±60) — глубина даже в 2D-композиции.",
          "Молния: pathLength за 180мс с задержкой 300мс — появляется ровно когда панели «сталкиваются».",
          "VS: scale 4 → 1 за 280мс кривой snap + максимальная trauma. Самый громкий кадр сцены — один.",
        ],
        tracks: [
          { label: "Радар (loop)", start: 0, dur: 2300, color: T },
          { label: "Барабан имён", start: 0, dur: 2300, color: "#ffffff" },
          { label: "Найден", start: 2300, dur: 700, color: R },
          { label: "Панели slam", start: 3000, dur: 500, color: P },
          { label: "Молния", start: 3300, dur: 180, color: G },
          { label: "VS + shake", start: 3380, dur: 450, color: G },
          { label: "3-2-1-БОЙ", start: 4480, dur: 2400, color: T },
        ],
        total: 7000,
        ease: { bez: EASE.snap, label: "snap — VS" },
        code: `// Барабан тормозит: растущие интервалы
for (const ms of [60, 60, 60, 70, 80, 100, 140, 210, 320, 400]) {
  await wait(ms); setName(n => n + 1); sfx.tick();
}
// Диагональные панели
<motion.div style={{ clipPath: "polygon(0 0,100% 0,100% 42%,0 58%)" }}
  animate={{ x: 0 }} initial={{ x: -340 }} />
<motion.div style={{ clipPath: "polygon(0 58%,100% 42%,100% 100%,0 100%)" }}
  animate={{ x: 0 }} initial={{ x: 340 }} />`,
        C: Matchmaking,
      },
    ],
  },
  {
    id: "gestures",
    n: "08",
    title: "Жесты",
    en: "Swipe · Drag · Pull · Coachmark",
    color: O,
    blurb: "Палец — главный контроллер мобильной игры. Интерфейс обязан реагировать на каждый пиксель движения, а не только на отпускание.",
    scenes: [
      {
        id: "swipe", n: "24", title: "Свайп-решения", kind: "Card deck",
        lead: "Колода торговых сценариев. Карта наклоняется за пальцем, штамп «ЛОНГ» или «ШОРТ» проявляется от расстояния, фон окрашивается. Бросок учитывает скорость, следующая карта поднимается из стопки.",
        secrets: [
          "Всё — производные от одного x: rotate, opacity штампов, цвет свечения, тинт фона. 5 эффектов, ноль стейта во время жеста.",
          "Решение по проекции: offset + velocity × 0.25. Короткий резкий флик = решение; медленное перетаскивание на 100px — ещё нет.",
          "Не дошёл — пружина 500/28 возвращает карту. Высокая жёсткость = «колода не хочет тебя отпускать».",
          "Стопка: scale 1 − depth×0.06, y depth×16. Когда верхняя улетает, остальные поднимаются одной пружиной.",
          "Колебание в демо (70 → −40 → 0) — показывает, что жест обратим. Обучение без текста.",
        ],
        tracks: [
          { label: "Вытягивание", start: 700, dur: 600, color: O },
          { label: "Бросок inQuart", start: 1300, dur: 320, color: Gr },
          { label: "Стопка вверх", start: 1620, dur: 400, color: B },
          { label: "Результат pop", start: 1620, dur: 350, color: Gr },
          { label: "Колебание", start: 3900, dur: 1100, color: G },
          { label: "Шорт-бросок", start: 5200, dur: 900, color: R },
        ],
        total: 6300,
        ease: { bez: EASE.inQuart, label: "inQuart — бросок" },
        code: `const rotate  = useTransform(x, [-220, 220], [-20, 20]);
const longOp  = useTransform(x, [20, 110], [0, 1]);
const glow    = useTransform(x, [-150, 0, 150],
  ["0 0 40px #ff4d5e", "0 20px 40px -20px #000", "0 0 40px #3ddc84"]);

<motion.div drag="x" dragMomentum={false} style={{ x, rotate, boxShadow: glow }}
  onDragEnd={(_, i) => {
    const proj = i.offset.x + i.velocity.x * 0.25;
    if (Math.abs(proj) > 110) fly(Math.sign(proj));
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 28 });
  }} />`,
        C: SwipeDecide,
        interactive: "Свайпай карту",
      },
      {
        id: "drag", n: "25", title: "Сборка сетапа перетаскиванием", kind: "Drag & drop",
        lead: "Карты поднимаются при захвате, слоты подсвечиваются и пульсируют при приближении. Правильный слот защёлкивает карту пружиной с искрами, неправильный «мотает головой» и отбрасывает карту домой.",
        secrets: [
          "Подъём при захвате: scale 1.12 + rotate −6°. Карта «отрывается от стола» — пользователь видит, что держит её.",
          "Защёлка = пружина 600/30 к центру слота + scale 0.92. Жёсткая и короткая — ощущение магнита.",
          "Отказ: слот делает x [0,−8,8,−5,5,0] (жест «нет»), а карта летит домой мягкой пружиной 300/18 с перелётом.",
          "Демо-траектория — дуга через keyframes [старт, середина−40px, цель]. Прямая линия выглядит как робот, дуга — как рука.",
          "Motion values созданы через motionValue() в useRef — по паре на карту, без перерендеров при каждом пикселе.",
        ],
        tracks: [
          { label: "Захват карты", start: 700, dur: 200, color: O },
          { label: "Дуга к слоту", start: 700, dur: 700, color: B },
          { label: "Защёлка", start: 1550, dur: 300, color: Gr },
          { label: "Ошибка: отказ", start: 3100, dur: 450, color: R },
          { label: "Возврат домой", start: 3100, dur: 600, color: R },
          { label: "Сетап собран", start: 6000, dur: 600, color: G },
        ],
        total: 6800,
        ease: { bez: EASE.camera, label: "camera — дуга пальца" },
        code: `// Защёлка в слот
await Promise.all([
  animate(m.x, m.x.get() + slot.x - card.x, { type: "spring", stiffness: 600, damping: 30 }),
  animate(m.y, m.y.get() + slot.y - card.y, { type: "spring", stiffness: 600, damping: 30 }),
]);
// Отказ: слот говорит «нет»
<motion.div animate={reject === k
  ? { x: [0, -8, 8, -5, 5, 0], borderColor: "#ff4d5e" }
  : { scale: hover === k ? 1.1 : 1 }} />`,
        C: DragToSlot,
        interactive: "Перетаскивай карты в слоты",
      },
      {
        id: "pull", n: "26", title: "Pull-to-refresh со свечами", kind: "Elastic pull",
        lead: "Лента тянется с экспоненциальным сопротивлением, свечи индикатора вырастают по очереди от натяжения, кольцо замыкается. На пороге — щелчок и «Отпусти». Свечи прыгают при загрузке, новые новости падают сверху со вспышкой.",
        secrets: [
          "Сопротивление: y = 150 × (1 − e^(−pull/170)). Чем дальше тянешь, тем тяжелее — асимптота, а не жёсткий стоп.",
          "5 свечей = 5 useTransform от одного прогресса со сдвигом: clamp(v×5 − i). Они вырастают строго по очереди.",
          "Порог срабатывания отмечен тактильно: щелчок звука и вибрация ровно в момент пересечения, а не при отпускании.",
          "Полка: во время загрузки лента удерживается на 110px, чтобы индикатор было видно, и только потом уезжает пружиной.",
          "Новые элементы: layout-анимация сдвигает старые вниз, новые приходят с y −30 и оранжевой вспышкой-подсветкой.",
        ],
        tracks: [
          { label: "Пробное натяжение", start: 700, dur: 900, color: O },
          { label: "Полное натяжение", start: 1900, dur: 900, color: O },
          { label: "Свечи растут", start: 1900, dur: 700, color: Gr },
          { label: "Порог + щелчок", start: 2500, dur: 100, color: "#ffffff" },
          { label: "Загрузка (loop)", start: 3100, dur: 1300, color: G },
          { label: "Новые элементы", start: 4400, dur: 600, color: O },
        ],
        total: 5400,
        ease: { bez: [0.3, 0, 0.3, 1], label: "натяжение пальцем" },
        code: `const listY = useTransform(pull, v => 150 * (1 - Math.exp(-v / 170)));
const prog  = useTransform(listY, v => Math.min(1, v / 92));
const h_i   = useTransform(prog, v => clamp(v * 5 - i) * H[i]);  // i-я свеча

useMotionValueEvent(prog, "change", v => {
  if ((v >= 1) !== wasReady) { wasReady = v >= 1; if (wasReady) sfx.snap(); }
});`,
        C: PullRefresh,
        interactive: "Потяни ленту вниз",
      },
      {
        id: "coachmark", n: "27", title: "Прожектор обучения", kind: "Tutorial spotlight",
        lead: "Затемнение с дырой-прожектором перетекает между элементами интерфейса пружиной, светящаяся рамка следует за ней, подсказка переезжает и меняет текст, «палец» показывает, куда нажать.",
        secrets: [
          "SVG-маска: белый прямоугольник минус motion.rect. Анимируются x, y, width, height, rx — дыра морфит форму и скругление.",
          "Прожектор перетекает (spring 180/22), а не прыгает. Глаз следует за светом — пользователь не теряет фокус.",
          "Подсказка едет контейнером (top), а текст внутри меняется через AnimatePresence mode=wait — движение и содержание разделены.",
          "Палец едет медленнее прожектора (stiffness 120) — сначала место, потом действие.",
          "Каждый тап пальца = кольцо, расходящееся scale 0.5 → 2.4. Универсальный язык «нажми здесь».",
        ],
        tracks: [
          { label: "Затемнение", start: 600, dur: 400, color: "#ffffff" },
          { label: "Шаг 1 → HUD", start: 600, dur: 1800, color: T },
          { label: "Шаг 2 → график", start: 2400, dur: 1800, color: B },
          { label: "Шаг 3 → карты", start: 4200, dur: 1800, color: G },
          { label: "Шаг 4 → кнопка", start: 6000, dur: 1800, color: O },
        ],
        total: 8200,
        ease: { bez: EASE.camera, label: "≈ пружина прожектора" },
        code: `<mask id="hole">
  <rect width="300" height="624" fill="#fff" />
  <motion.rect fill="#000"
    animate={{ x: s.x, y: s.y, width: s.w, height: s.h, rx: s.r }}
    transition={{ type: "spring", stiffness: 180, damping: 22 }} />
</mask>
<rect width="300" height="624" fill="#03060ecc" mask="url(#hole)" />`,
        C: Coachmark,
      },
    ],
  },
  {
    id: "finale",
    n: "09",
    title: "Кульминация",
    en: "Victory · Defeat · Combo · Island",
    color: L,
    blurb: "Моменты, ради которых играют: добивание босса, честное поражение, лихорадка комбо и живые системные события.",
    scenes: [
      {
        id: "victory", n: "28", title: "Победа: bullet time и раскол", kind: "Boss finisher",
        lead: "Мир обесцвечивается, появляются кинематографичные чёрные полосы, камера наезжает, карта летит в замедлении. Hit-stop 200мс, босс раскалывается на 49 осколков волной от точки удара. Лента «ПОБЕДА», три звезды — три отдельных удара.",
        secrets: [
          "Bullet time — это не замедление времени, а длительность ×3.5 (0.3 → 1.05с) + обесцвечивание + letterbox. Мозг достраивает «слоу-мо».",
          "Shatter: картинка режется на N×N div с background-position. Задержка = расстояние до точки удара × 0.35с — волна разрушения.",
          "Осколки: brightness 3 → 1 (раскалённые края), гравитация через keyframe y [0, −30, +300]. Сначала разлёт, потом падение.",
          "mix-blend-mode: screen на тёмном арте — фон картинки исчезает, остаётся только светящийся монстр. Бесплатная маска.",
          "Звёзды: средняя больше и выше. Каждая — свой штамп, свой звук с повышением тона, своя тряска с растущей trauma.",
        ],
        tracks: [
          { label: "Desat + letterbox", start: 700, dur: 900, color: "#ffffff" },
          { label: "Camera push", start: 700, dur: 1100, color: B },
          { label: "Slow-mo полёт", start: 700, dur: 1050, color: T },
          { label: "HIT-STOP 200", start: 1750, dur: 200, color: "#ffffff" },
          { label: "Shatter волна", start: 1950, dur: 1800, color: R },
          { label: "Лента ПОБЕДА", start: 3050, dur: 800, color: G },
          { label: "Звёзды ×3", start: 3550, dur: 1400, color: G },
          { label: "Награды", start: 5000, dur: 700, color: L },
        ],
        total: 5800,
        ease: { bez: [0.7, 0, 0.95, 0.6], label: "ease-in — slow-mo удар" },
        code: `// Осколок: задержка от расстояния до точки удара
const d = Math.hypot((cx + .5) / n - origin.x, (cy + .5) / n - origin.y);
<motion.div style={{
    backgroundImage: \`url(\${img})\`, backgroundSize: \`\${size}px\`,
    backgroundPosition: \`-\${cx * s}px -\${cy * s}px\`, mixBlendMode: "screen" }}
  animate={{ x: [0, tx * .45, tx], y: [0, ty * .45 - 30, ty + 300],
             filter: ["brightness(3)", "brightness(1.3)", "brightness(1)"] }}
  transition={{ duration: 1.4, delay: d * 0.35, times: [0, .3, 1] }} />`,
        C: VictorySequence,
      },
      {
        id: "defeat", n: "29", title: "Поражение, которое мотивирует", kind: "Fail state",
        lead: "Сердца раскалываются пополам одно за другим, мир теряет цвет, экран трескается, «ПОРАЖЕНИЕ» падает тяжело с пылью. Затем цвет частично возвращается, появляется поддержка наставника и дышащая кнопка «Ещё раз».",
        secrets: [
          "Сердце режется двумя clip-path половинами (inset 0 50% 0 0 / inset 0 0 0 50%), которые разлетаются с разными rotate. Разбитое, а не исчезнувшее.",
          "Grayscale 0 → 1 → 0.35: поражение отнимает цвет, но не полностью. Цвет возвращается вместе с надеждой.",
          "Заголовок — пружина с mass 2: тяжёлое падение с отскоком. Пыль разлетается ровно в момент приземления.",
          "Трещины рисуются кривой snap с каскадом 40мс от точки удара. На фазе надежды гаснут до 25% — шрам остаётся, но не мешает.",
          "Кнопка повтора дышит расходящимся box-shadow. Поражение завершается приглашением, а не тупиком — главное для retention.",
        ],
        tracks: [
          { label: "Сердце 3", start: 700, dur: 600, color: R },
          { label: "Сердце 2", start: 1350, dur: 600, color: R },
          { label: "Сердце 1", start: 2000, dur: 600, color: R },
          { label: "Grayscale + трещины", start: 2650, dur: 1000, color: "#888888" },
          { label: "Тяжёлое падение", start: 3770, dur: 700, color: "#ffffff" },
          { label: "Цвет возвращается", start: 5500, dur: 1000, color: T },
          { label: "Поддержка + кнопка", start: 5500, dur: 800, color: T },
        ],
        total: 6600,
        ease: { bez: EASE.snap, label: "snap — трещины" },
        code: `{[0, 1].map(half => (
  <motion.svg style={{ clipPath: half ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)" }}
    animate={alive ? {} : { x: half ? 14 : -14, y: 40, rotate: half ? 40 : -40, opacity: 0 }}
    transition={{ duration: .6, ease: EASE.inQuart }} />
))}
<motion.div animate={{ filter: \`grayscale(\${ph === 3 ? .35 : 1})\` }} />
<motion.div initial={{ y: -300 }} animate={{ y: 0 }}
  transition={{ type: "spring", stiffness: 260, damping: 14, mass: 2 }} />`,
        C: DefeatComeback,
      },
      {
        id: "combo", n: "30", title: "Комбо и режим FEVER", kind: "Streak multiplier",
        lead: "Каждый верный ответ бьёт по счётчику с поворотом, шкала нагрева подскакивает и остывает. На x5 — FEVER: радужная рамка по периметру экрана, штамп, тряска. Ошибка — цифра обрушивается вниз, шкала сливается.",
        secrets: [
          "Шкала — две цепочки анимаций: быстрый подскок 150мс, затем линейное остывание, длительность которого пропорциональна нагреву.",
          "Цифра комбо: scale 1.9 → 1 со случайным поворотом ±12°. Случайность = каждый удар уникален, нет ощущения лупа.",
          "Цвет по стадиям: бирюза → золото (x3) → красный (x5). Периферийное зрение читает силу комбо без цифры.",
          "Радужная рамка — conic-gradient с маской content-box XOR. Только бордер, контент под ним не тронут.",
          "Слом комбо — exit с гравитацией: y +240, rotate 50, ease-in. Падение ощущается как потеря.",
        ],
        tracks: [
          { label: "Хиты x1–x4", start: 600, dur: 1920, color: T },
          { label: "Нагрев шкалы", start: 600, dur: 3500, color: G },
          { label: "FEVER x5", start: 2520, dur: 400, color: R },
          { label: "Радужная рамка", start: 2520, dur: 1500, color: P },
          { label: "Хиты x6–x8", start: 2900, dur: 1140, color: R },
          { label: "Слом комбо", start: 4340, dur: 700, color: "#888888" },
        ],
        total: 5200,
        ease: { bez: EASE.outExpo, label: "outExpo — подскок нагрева" },
        code: `const bump = v => {
  ctl?.stop();
  ctl = animate(heat, Math.min(1, v), { duration: .15,
    onComplete: () => { ctl = animate(heat, 0, { duration: 1 + v * 2.5, ease: "linear" }); } });
};
// радужная рамка только по бордеру
style={{ background: "conic-gradient(#ff4d5e,#ffc34d,#3ddc84,#2ee6c5,#9b7bff,#ff4d5e)",
  padding: 4, WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor", maskComposite: "exclude" }}`,
        C: ComboFever,
      },
      {
        id: "island", n: "31", title: "Dynamic Island события", kind: "System morph",
        lead: "Вырез камеры оживает: остров перетекает в компактную пилюлю с монетами, в большую карточку достижения с кольцом прогресса, в рейтинг, прокручивающий позиции. Интерфейс под ним отступает в глубину.",
        secrets: [
          "Разная жёсткость по осям: ширина 420, высота 300. Остров сначала растягивается, потом «набухает» — органика, а не масштаб.",
          "Контент появляется с задержкой 120мс ПОСЛЕ старта морфа и уходит за 120мс ДО. Контейнер никогда не показывает обрезанный текст.",
          "Кроссфейд с blur 8px → 0 + scale 0.85 → 1 — фирменный язык iOS: элементы «фокусируются», а не просто проявляются.",
          "При раскрытии фон scale 0.96 + blur + затемнение — система важнее приложения, пространство это подтверждает.",
          "Рейтинг 42 → 12 прокручивается через 5 промежуточных значений с тиками — прогресс, который можно услышать.",
        ],
        tracks: [
          { label: "Достижение", start: 700, dur: 2000, color: G },
          { label: "Кольцо + иконка", start: 1000, dur: 1300, color: G },
          { label: "Монеты compact", start: 3250, dur: 1500, color: G },
          { label: "Рейтинг expanded", start: 5300, dur: 2300, color: Gr },
          { label: "Серия compact", start: 8150, dur: 1500, color: O },
        ],
        total: 10000,
        ease: { bez: EASE.outExpo, label: "outExpo — фокус контента" },
        code: `<motion.div className="bg-black overflow-hidden" style={{ x: "-50%" }}
  animate={{ width: sz.w, height: sz.h, borderRadius: sz.r }}
  transition={{
    width:  { type: "spring", stiffness: 420, damping: 30 },
    height: { type: "spring", stiffness: 300, damping: 26 },   // медленнее
  }}>
  <AnimatePresence mode="popLayout">
    <motion.div key={ev.kind}
      initial={{ opacity: 0, scale: .85, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: .12 }} />
  </AnimatePresence>
</motion.div>`,
        C: DynamicIsland,
      },
    ],
  },
];
