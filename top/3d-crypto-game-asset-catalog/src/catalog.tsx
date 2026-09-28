import type { ComponentType } from "react";
import type { IconName } from "./components/Icon";
import { Surfaces, Palette, Typography, Iconography, Motion } from "./sections/foundations";
import { Buttons, Fields, Selection, Sliders } from "./sections/controls";
import { TabBar, Hud, TabsNav, Stepper } from "./sections/navigation";
import { Watchlist, Cards, BadgesAvatars, Table, Glossary } from "./sections/data";
import { Modal, Toasts, Alerts, Progress, SkeletonEmpty } from "./sections/feedback";
import { CandleChart, OrderTicket, OrderBook, PnlCard, FearGreed } from "./sections/trading";
import { Quiz, PatternFinder, MatchPairs, Predict, LessonComplete } from "./sections/lesson";
import { Chest, Currencies, Streak, Achievements, Quests, SkillCards } from "./sections/rewards";
import { PathMap, Leaderboard, LevelUp, Career } from "./sections/progress";
import { MascotMoods, Bestiary, Duel } from "./sections/characters";
import { SwipeDeck, DragLevels, HoldConfirm, Reorder, BottomSheet, PullRefresh } from "./sections/gestures";
import { WordBank, RiskNumpad, Portfolio, SpeedRound, ListenTap, SupportTap } from "./sections/exercises";
import { SpinWheel, SeasonPass, Shop, Paywall, OutOfHearts, DailyGoal } from "./sections/meta";
import { Profile, FriendsFeed, Notifications, LeagueResult, FriendQuest, Invite } from "./sections/social";
import { A11ySettings, ContrastMatrix, SoundLab, TouchTargets } from "./sections/a11y";
import { TokenExport, Anatomy, StateMatrix, LightModel } from "./sections/tokens";
import { Dialogue, MentorChat, CoachMarks, Chapters } from "./sections/story";
import { LockScreen, AppIcons, ErrorStates, Milestone } from "./sections/surfaces";
import { HeroCarousel, CoverflowCards, CubeShowcase, StackReviews, VerticalNews, PeekLeagues } from "./sections/carousels";
import { RevealLab, StickyDemo, TrackScroll, ParallaxScene, Counters, VelocitySkew } from "./sections/scrollfx";
import { BeforeAfter, Lightbox, SkinPicker, KenBurns, Magnifier } from "./sections/galleries";
import { SpringTuner, EasingLab, CarouselLab, FlingLab } from "./sections/motionlab";
import { OnboardingPager, FeatureTabs, QuoteMarquee, EventBanner } from "./sections/promo";
import { MagnetButtons, BurstButton, MorphButton, GlowCards, BadgePop } from "./sections/microfx";
import { Bracket, LiveRace, EventCalendar, PrizePool, MatchTracker } from "./sections/tournaments";
import { Equity, Winrate, PnlCalendar, TagStats, MistakeCoach } from "./sections/journal";
import { AvatarStudio, FrameShop } from "./sections/builder";
import { DepthChart, TradeTape } from "./sections/trading2";
import { AmbientMixer } from "./sections/ambient";
import { Roadmap, Checklist } from "./sections/promo2";
import { PnlSim, FundingPulse } from "./sections/trading3";
import { Cloze, SpotMistake } from "./sections/lesson2";
import { Clan } from "./sections/social2";
import { PredictionPool, RaidBoss } from "./sections/arena2";
import { Underwater, WeekReport } from "./sections/journal2";
import { Sequencer } from "./sections/motion2";
import { TerminalPro, IndicatorLab } from "./sections/lab-terminal";
import { MarketReplay, NewsTimeline, HistoryRoom } from "./sections/lab-time";
import { DepthChamber, LiquidityPools, WhaleRadar } from "./sections/lab-depth";
import { PatternTrainerPro, PatternScanner } from "./sections/lab-patterns";
import { PortfolioCommand, RiskMatrix, MultiTimeframe } from "./sections/lab-portfolio";
import { CollectionVault } from "./sections/lab-collection";
import { StrategyConstructor, VolatilityReactor, WorkspaceBuilder } from "./sections/lab-construct";

export type Asset = { id: string; title: string; desc: string; states: string[]; wide?: boolean; C: ComponentType };
export type Category = { key: string; code: string; title: string; sub: string; icon: IconName; tone: string; hex: string; assets: Asset[] };

export const CATALOG: Category[] = [
  {
    key: "foundations", code: "F", title: "Основы", sub: "Токены поверхности, цвета, шрифтов, иконок и движения", icon: "sparkles", tone: "text-sky", hex: "#3D9BFF",
    assets: [
      { id: "F01", title: "Поверхности и высота", desc: "5 уровней высоты, радиусы, «подошва» нажатия, шкала отступов 4pt.", states: ["inset", "base", "raised", "card", "overlay"], wide: true, C: Surfaces },
      { id: "F02", title: "Палитра", desc: "Семантические цвета с «подошвой» и ink-шкала. Тап — скопировать HEX.", states: ["hover", "press", "copy"], C: Palette },
      { id: "F03", title: "Типографика и цифры", desc: "Unbounded + Manrope + JetBrains Mono, живой тикер цены.", states: ["display", "body", "mono", "live"], C: Typography },
      { id: "F04", title: "Иконография", desc: "Собственный набор из 60+ иконок, 3 размера × 3 толщины, 3D-валюты.", states: ["16/24/32", "thin/reg/bold", "select"], C: Iconography },
      { id: "F05", title: "Кривые движения", desc: "Spring, ease-out, snap, press — единый словарь анимаций.", states: ["spring", "ease", "snap", "press"], C: Motion },
    ],
  },
  {
    key: "controls", code: "C", title: "Управление", sub: "Объёмные кнопки, поля, выбор и слайдеры", icon: "hand", tone: "text-bull", hex: "#2BE38B",
    assets: [
      { id: "C01", title: "3D-кнопки", desc: "8 семантических вариантов, 4 размера, loading → success, sound + haptic.", states: ["default", "hover", "pressed", "loading", "success", "disabled", "focus"], wide: true, C: Buttons },
      { id: "C02", title: "Текстовые поля", desc: "Живая валидация, сила пароля, ввод суммы с быстрыми процентами.", states: ["empty", "focus", "valid", "error", "overflow"], C: Fields },
      { id: "C03", title: "Выбор и свитчи", desc: "Чекбоксы, радио-тайлы, пружинные свитчи, Long/Short segmented.", states: ["on", "off", "selected", "hover"], C: Selection },
      { id: "C04", title: "Слайдер плеча", desc: "Логарифмический 1–100x, цвет риска, цена ликвидации, степпер.", states: ["low", "mid", "extreme", "min", "max"], C: Sliders },
    ],
  },
  {
    key: "navigation", code: "N", title: "Навигация", sub: "Таб-бар, HUD, табы, степпер онбординга", icon: "map", tone: "text-violet", hex: "#9A6BFF",
    assets: [
      { id: "N01", title: "Нижний таб-бар", desc: "Утопленный индикатор на пружине, бейджи уведомлений.", states: ["active", "idle", "badge"], C: () => <div className="pt-6"><TabBar /></div> },
      { id: "N02", title: "Игровой HUD", desc: "Стрик, кристаллы, монеты, жизни — поповеры с действиями.", states: ["popover", "empty", "refill"], C: () => <div className="min-h-[190px]"><Hud /></div> },
      { id: "N03", title: "Табы · крошки · пагинация", desc: "Светящийся индикатор, интерактивные крошки, умная пагинация.", states: ["active", "visited", "disabled"], C: TabsNav },
      { id: "N04", title: "Степпер онбординга", desc: "5 шагов с тултипом, пульсом текущего и заливкой прогресса.", states: ["done", "current", "next"], C: Stepper },
    ],
  },
  {
    key: "data", code: "D", title: "Данные", sub: "Котировки, карточки, бейджи, таблицы, глоссарий", icon: "chart", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "D01", title: "Вотчлист", desc: "Живые котировки со вспышкой тика, спарклайны, избранное.", states: ["tick up", "tick down", "fav", "selected"], C: Watchlist },
      { id: "D02", title: "Карточки курсов", desc: "Обложка-график, прогресс, лайк, заблокированный модуль, статистика.", states: ["progress", "done", "locked", "liked"], C: Cards },
      { id: "D03", title: "Бейджи и аватары", desc: "Редкости, live-точка, кольцо уровня, статус, стек друзей.", states: ["online", "busy", "offline"], C: BadgesAvatars },
      { id: "D04", title: "Таблица сделок", desc: "Сортировка по колонкам и фильтр по стороне.", states: ["asc", "desc", "filter"], C: Table },
      { id: "D05", title: "Глоссарий-тултипы", desc: "Термины трейдинга прямо в тексте. Выучил — получил XP.", states: ["hover", "open", "learned"], C: Glossary },
    ],
  },
  {
    key: "feedback", code: "E", title: "Обратная связь", sub: "Модалки, тосты, баннеры, прогресс, пустые состояния", icon: "bell", tone: "text-flame", hex: "#FF8A3D",
    assets: [
      { id: "E01", title: "Модальные окна", desc: "Опасное подтверждение и окно награды с маскотом.", states: ["enter", "exit", "danger", "reward"], C: Modal },
      { id: "E02", title: "Стек тостов", desc: "4 типа, таймер жизни, ручное закрытие, лимит стека.", states: ["success", "info", "warn", "error"], C: Toasts },
      { id: "E03", title: "Баннеры-алерты", desc: "Волатильность, ивенты, защита — со сворачиванием.", states: ["show", "dismiss", "restore"], C: Alerts },
      { id: "E04", title: "Индикаторы прогресса", desc: "Круговой, линейный, сегментный, спиннеры и монета-лоадер.", states: ["run", "pause", "segment"], C: Progress },
      { id: "E05", title: "Скелетон и пустое состояние", desc: "Shimmer-загрузка → пусто → данные.", states: ["loading", "empty", "data"], C: SkeletonEmpty },
    ],
  },
  {
    key: "gestures", code: "G", title: "Жесты", sub: "Свайп, перетаскивание, удержание, шторка, pull-to-refresh", icon: "hand", tone: "text-sky", hex: "#3D9BFF",
    assets: [
      { id: "G01", title: "Свайп «Бык или Медведь»", desc: "Колода новостей: свайп вправо/влево, штампы, бросок по скорости, клавиши ← →.", states: ["drag", "fling", "stamp", "correct", "wrong", "end"], wide: true, C: SwipeDeck },
      { id: "G02", title: "Перетащи SL / TP", desc: "Двигай стоп-лосс и тейк-профит по графику — живой R:R и расчёт убытка.", states: ["drag", "invalid", "rr<2", "ok", "keyboard"], wide: true, C: DragLevels },
      { id: "G03", title: "Удержание и слайд", desc: "Hold-to-confirm с кольцом прогресса и slide-to-sell с пружинным возвратом.", states: ["hold", "cancel", "done", "slide", "snap-back"], C: HoldConfirm },
      { id: "G04", title: "Сортировка перетаскиванием", desc: "Расставь шаги сделки — строки раздвигаются, тик на каждом слоте.", states: ["lift", "reorder", "drop", "check"], C: Reorder },
      { id: "G05", title: "Шторка с точками фиксации", desc: "Peek / half / full, резиновые края, бросок с учётом скорости.", states: ["peek", "half", "full", "rubber"], C: BottomSheet },
      { id: "G06", title: "Потяни, чтобы обновить", desc: "Сопротивление, взвод с вибро, спиннер, каскад новых данных.", states: ["pull", "armed", "refreshing", "done"], C: PullRefresh },
    ],
  },
  {
    key: "trading", code: "T", title: "Трейдинг", sub: "Симулятор: график, ордер, стакан, PnL, индекс страха", icon: "candle", tone: "text-bull", hex: "#2BE38B",
    assets: [
      { id: "T01", title: "Живой свечной график", desc: "Real-time свечи, MA7, crosshair с OHLC, таймфреймы, пауза.", states: ["live", "pause", "hover", "tf"], wide: true, C: CandleChart },
      { id: "T02", title: "Тикет ордера", desc: "Long/Short, маржа, плечо, TP/SL, ликвидация и обучающая блокировка.", states: ["form", "blocked", "sending", "filled"], C: OrderTicket },
      { id: "T03", title: "Стакан заявок", desc: "Анимированная глубина, спред, выбор лимит-цены.", states: ["live", "pick"], C: OrderBook },
      { id: "T04", title: "Карточка PnL", desc: "Анимированный PnL/ROE, скрытие баланса, шэр.", states: ["profit", "loss", "hidden"], C: PnlCard },
      { id: "T05", title: "Индекс страха и жадности", desc: "Пружинная стрелка, 5 зон, подсказка по настроению.", states: ["fear", "neutral", "greed"], C: FearGreed },
      { id: "T06", title: "Глубина рынка", desc: "BID/ASK-ступени с кроссхейром, спредом и баром дисбаланса.", states: ["live", "crosshair", "imbalance"], C: DepthChart },
      { id: "T07", title: "Лента сделок", desc: "Живой поток принтов: фильтры, киты, скорость, звук.", states: ["tape", "filter", "whale", "speed"], C: TradeTape },
      { id: "T08", title: "Симулятор PnL", desc: "Что если: сторона, вход/выход, плечо, комиссии и кривая исходов.", states: ["long", "short", "liq", "curve"], wide: true, C: PnlSim },
      { id: "T09", title: "Фандинг и L/S", desc: "Ставка фандинга по периодам и стрелка соотношения толпы.", states: ["funding", "ratio", "sentiment"], C: FundingPulse },
    ],
  },
  {
    key: "lab", code: "TL", title: "Торговая лаборатория", sub: "Крупные интерактивные сцены: терминалы, глубина, паттерны, портфель, конструкторы", icon: "sparkles", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "TL01", title: "Терминал PRO", desc: "Активы · таймфреймы · play/скорость · живая позиция с SL/TP/ликвидацией · баланс и эквити реагируют.", states: ["asset", "tf", "play", "position", "pnl", "liq"], wide: true, C: TerminalPro },
      { id: "TL02", title: "Лаборатория индикаторов", desc: "RSI · MACD · объём · MA реально перестраивают график, ховер синхронизирует все панели.", states: ["rsi", "macd", "vol", "ma", "hover"], wide: true, C: IndicatorLab },
      { id: "TL03", title: "Market Replay", desc: "Транспорт, скорости, скраб, скрытие будущего, события-маркеры и журнал сессии.", states: ["play", "scrub", "speed", "hidden", "event"], wide: true, C: MarketReplay },
      { id: "TL04", title: "News Impact Timeline", desc: "Лента новостей связана с графиком: выбор события двигает окно и считает реакцию цены.", states: ["select", "sync", "reaction"], wide: true, C: NewsTimeline },
      { id: "TL05", title: "Historical Scenario Room", desc: "4 эпохи меняют график, палитру и моменты; перемещение между ключевыми точками.", states: ["epoch", "moment", "expand"], wide: true, C: HistoryRoom },
      { id: "TL06", title: "Depth Chamber 3D", desc: "Стакан превращается в стену ликвидности: глубина, свечение, алерты по клику.", states: ["2d", "3d", "alert", "live"], wide: true, C: DepthChamber },
      { id: "TL07", title: "Liquidity Pools", desc: "Перетаскиваемые границы диапазона меняют долю пула, APR и визуализацию.", states: ["drag", "apr", "range"], wide: true, C: LiquidityPools },
      { id: "TL08", title: "Whale Radar", desc: "Радар крупных транзакций: развёртка, сигналы, фильтр, карточка события.", states: ["sweep", "signal", "filter", "track"], wide: true, C: WhaleRadar },
      { id: "TL09", title: "Pattern Trainer PRO", desc: "Выбор свечей, выделение области, линия тренда и проверка с разбором по баллам.", states: ["select", "area", "line", "score"], wide: true, C: PatternTrainerPro },
      { id: "TL10", title: "Pattern Scanner", desc: "Шесть живых мини-графиков, фильтры формаций, раскрытие совпадения.", states: ["scan", "filter", "match", "expand"], wide: true, C: PatternScanner },
      { id: "TL11", title: "Portfolio Command Center", desc: "Перетаскивание долей перестраивает донат, риск, прогноз и тему блока.", states: ["drag", "risk", "forecast"], wide: true, C: PortfolioCommand },
      { id: "TL12", title: "Risk Matrix", desc: "Перетаскиваемые пузыри активов, фильтры, квадранты и карточка актива.", states: ["drag", "filter", "quadrant"], wide: true, C: RiskMatrix },
      { id: "TL13", title: "Multi-Timeframe", desc: "Четыре синхронных графика: ховер времени подсвечивает все ТФ, раскладки.", states: ["sync", "grid", "focus"], wide: true, C: MultiTimeframe },
      { id: "TL14", title: "Collection Vault", desc: "Открытие наборов, переворот карт, редкость, holo-блеск и коллекция.", states: ["pack", "flip", "holo", "set"], wide: true, C: CollectionVault },
      { id: "TL15", title: "Strategy Constructor", desc: "Перетаскиваемые блоки условий соединяются линиями в схему + бэктест.", states: ["drag", "link", "backtest"], wide: true, C: StrategyConstructor },
      { id: "TL16", title: "Volatility Reactor", desc: "Регуляторы меняют амплитуду, цвет, частицы и скорость живого реактора.", states: ["vol", "trend", "pulse"], wide: true, C: VolatilityReactor },
      { id: "TL17", title: "Workspace Builder", desc: "Пресеты и магнитная сетка: перемещай график, стакан, вотчлист, новости.", states: ["preset", "snap", "hide"], wide: true, C: WorkspaceBuilder },
    ],
  },
  {
    key: "lesson", code: "L", title: "Уроки", sub: "Игровые механики обучения в стиле Duolingo", icon: "book", tone: "text-sky", hex: "#3D9BFF",
    assets: [
      { id: "L01", title: "Квиз с проверкой", desc: "Выбор → Проверить → нижний лист с объяснением, жизни, реакция маскота.", states: ["idle", "selected", "correct", "wrong"], wide: true, C: Quiz },
      { id: "L02", title: "Найди паттерн", desc: "Тапни нужную свечу на графике — поиск бычьего поглощения.", states: ["miss", "hit"], C: PatternFinder },
      { id: "L03", title: "Собери пары", desc: "Сленг ↔ значение: HODL, FOMO, ATH, DCA.", states: ["pick", "match", "mismatch"], C: MatchPairs },
      { id: "L04", title: "Вверх или вниз", desc: "Прогноз движения с анимированным раскрытием и серией.", states: ["guess", "win", "lose"], C: Predict },
      { id: "L05", title: "Урок пройден", desc: "Счётчики XP/точности, конфетти, празднование маскота.", states: ["enter", "count", "celebrate"], C: LessonComplete },
      { id: "L06", title: "Заполни пропуски", desc: "Cloze-тест: тап по пропуску, вставки-чипсы, жизни.", states: ["blank", "fill", "correct", "wrong"], C: Cloze },
      { id: "L07", title: "Найди ошибки", desc: "Ордер с 3 planted-ошибками: тапай строки, читай разбор.", states: ["hint", "miss", "found", "all"], C: SpotMistake },
    ],
  },
  {
    key: "exercises", code: "X", title: "Упражнения", sub: "Ещё 6 типов заданий: слова, калькулятор, портфель, скорость, аудио, график", icon: "brain", tone: "text-violet", hex: "#9A6BFF",
    assets: [
      { id: "X01", title: "Сборка фразы из слов", desc: "Классика Duolingo: банк слов, тап туда-обратно, линованная строка ответа.", states: ["empty", "building", "correct", "wrong"], C: WordBank },
      { id: "X02", title: "Калькулятор риска", desc: "3D-цифровая клавиатура, задача на размер позиции, подсказка с формулой.", states: ["input", "hint", "correct", "wrong"], C: RiskNumpad },
      { id: "X03", title: "Распредели портфель", desc: "Связанные слайдеры = 100%, кольцевая диаграмма, живые критерии цели.", states: ["risky", "balanced", "goal"], C: Portfolio },
      { id: "X04", title: "Скоростной раунд", desc: "30 секунд правды/лжи, комбо до x4, штраф −3 с, пламя на сериях.", states: ["ready", "play", "combo", "penalty", "end"], C: SpeedRound },
      { id: "X05", title: "Послушай и выбери", desc: "Синтез речи ru-RU, режим 0.5x, анимированная волна, 3 жизни.", states: ["speaking", "slow", "correct", "wrong"], C: ListenTap },
      { id: "X06", title: "Найди уровень поддержки", desc: "Тапни по графику — «горячо/холодно», зона допуска и точки отскока.", states: ["miss", "hot", "hit"], C: SupportTap },
    ],
  },
  {
    key: "rewards", code: "R", title: "Награды", sub: "Экономика, сундуки, стрики, ачивки, квесты, карты", icon: "gift", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "R01", title: "Сундук с лутом", desc: "3 редкости, тап-тап-тап → открытие с лучами и выпадением.", states: ["idle", "shake", "open", "loot"], C: Chest },
      { id: "R02", title: "Валюты и энергия", desc: "Монеты, кристаллы, энергия — летящие +N и count-up.", states: ["gain", "spend", "full"], C: Currencies },
      { id: "R03", title: "Стрик-неделя", desc: "Огонь, календарь, заморозка, зажигание сегодняшнего дня.", states: ["lit", "off", "freeze"], C: Streak },
      { id: "R04", title: "Достижения", desc: "Гексагональные медали, прогресс, разблокировка с блеском.", states: ["locked", "progress", "unlocked"], C: Achievements },
      { id: "R05", title: "Ежедневные квесты", desc: "Прогресс, кнопка получения с блеском, летящая награда.", states: ["progress", "ready", "claimed"], C: Quests },
      { id: "R06", title: "Карты навыков", desc: "4 редкости, голографический 3D-наклон, флип с описанием.", states: ["tilt", "flip", "holo"], wide: true, C: SkillCards },
    ],
  },
  {
    key: "meta", code: "M", title: "Мета-экономика", sub: "Колесо, сезонный пропуск, магазин, Pro, жизни, цель дня", icon: "gem", tone: "text-sky", hex: "#3D9BFF",
    assets: [
      { id: "M01", title: "Колесо удачи", desc: "Физика замедления, тик на каждом секторе, открытые шансы, награда летит в шапку.", states: ["idle", "spin", "tick", "win", "no spins"], wide: true, C: SpinWheel },
      { id: "M02", title: "Сезонный пропуск", desc: "Free/Pro дорожки, автоскролл к уровню, получение наград, покупка Pro.", states: ["locked", "claimable", "claimed", "pro"], wide: true, C: SeasonPass },
      { id: "M03", title: "Магазин", desc: "Лимитированный оффер с таймером, бусты и паки, кристаллы летят из шапки в товар.", states: ["affordable", "poor", "buying", "owned"], C: Shop },
      { id: "M04", title: "Пейвол Pro", desc: "3 тарифа, сравнение Free/Pro, честная шкала пробного периода.", states: ["plan", "trial", "loading", "pro"], C: Paywall },
      { id: "M05", title: "Нет жизней", desc: "Песочные часы, таймер, 3 пути восстановления, сердечки летят в слоты.", states: ["full", "empty", "refill", "practice"], C: OutOfHearts },
      { id: "M06", title: "Цель на день", desc: "4 режима, реакция маскота, прогноз XP на неделю.", states: ["lite", "standard", "serious", "intense"], C: DailyGoal },
    ],
  },
  {
    key: "progress", code: "P", title: "Прогрессия", sub: "Путь обучения, лиги, уровни и карьера трейдера", icon: "trophy", tone: "text-violet", hex: "#9A6BFF",
    assets: [
      { id: "P01", title: "Путь обучения", desc: "Зигзаг-карта: пройдено, текущий, сундук, закрыто, босс.", states: ["done", "current", "chest", "locked", "boss"], C: PathMap },
      { id: "P02", title: "Лидерборд лиги", desc: "Зоны повышения/понижения, живая пересортировка.", states: ["promote", "demote", "me"], C: Leaderboard },
      { id: "P03", title: "Опыт и уровень", desc: "XP-бар, переполнение → level-up баннер и конфетти.", states: ["gain", "level-up"], C: LevelUp },
      { id: "P04", title: "Карьерная лестница", desc: "6 рангов от Планктона до Кита с превью.", states: ["passed", "current", "locked"], C: Career },
    ],
  },
  {
    key: "social", code: "S", title: "Социальное", sub: "Профиль, лента друзей, уведомления, итоги лиги, кооп, рефералка", icon: "users", tone: "text-bull", hex: "#2BE38B",
    assets: [
      { id: "S01", title: "Профиль и активность", desc: "Кольцо уровня, значок лиги, счётчики, тепловая карта за 16 недель.", states: ["follow", "hover", "today"], wide: true, C: Profile },
      { id: "S02", title: "Лента друзей", desc: "События друзей, меню реакций, частицы при реакции.", states: ["react", "unreact", "picker"], C: FriendsFeed },
      { id: "S03", title: "Центр уведомлений", desc: "Группы, непрочитанные, свайп для удаления, «прочитать все».", states: ["unread", "swipe", "dismiss", "empty"], C: Notifications },
      { id: "S04", title: "Итоги лиги", desc: "Подиум вырастает, повышение со сменой значка, шкала 6 лиг.", states: ["podium", "counting", "promoted"], C: LeagueResult },
      { id: "S05", title: "Квест с другом", desc: "Общая двухцветная шкала, «пнуть друга», совместный сундук.", states: ["progress", "nudge", "complete", "claimed"], C: FriendQuest },
      { id: "S06", title: "Пригласи друзей", desc: "Код с копированием, ступени наград, окно «Поделиться».", states: ["copy", "tier", "share sheet"], C: Invite },
      { id: "S07", title: "Конструктор аватара", desc: "7 слоёв внешности, 100K+ комбинаций, случайный и история.", states: ["layer", "random", "save"], wide: true, C: AvatarStudio },
      { id: "S08", title: "Рамки профиля", desc: "4 рамки с прогресс-кольцом и покупкой за кристаллы.", states: ["frame", "progress", "buy"], C: FrameShop },
      { id: "S09", title: "Клан и рейд", desc: "Казна, состав с сортировкой, рейд на босса с критами.", states: ["join", "raid", "crit", "win"], wide: true, C: Clan },
    ],
  },
  {
    key: "characters", code: "K", title: "Персонажи", sub: "Маскот, враги-когнитивные искажения, дуэль с боссом", icon: "users", tone: "text-bear", hex: "#FF4D6D",
    assets: [
      { id: "K01", title: "Маскот «Бык Макс»", desc: "5 эмоций, моргание, реплики, реакция на касание.", states: ["idle", "happy", "think", "sad", "hype"], wide: true, C: MascotMoods },
      { id: "K02", title: "Бестиарий искажений", desc: "Фомо-Дух, Бумажные Руки, Кит — HP, криты, урон-цифры.", states: ["idle", "hit", "crit", "defeated"], wide: true, C: Bestiary },
      { id: "K03", title: "Дуэль с боссом", desc: "Ответ = удар. Таймер, HP обеих сторон, победа/поражение.", states: ["attack", "damage", "timeout", "win", "lose"], wide: true, C: Duel },
    ],
  },
  {
    key: "story", code: "V", title: "Сюжет и ментор", sub: "Диалоги с выбором, ИИ-наставник, прожектор-обучение, главы", icon: "book", tone: "text-flame", hex: "#FF8A3D",
    assets: [
      { id: "V01", title: "Диалог с ветвлением", desc: "Макс против Боры: печатная машинка, выборы, хорошая и плохая концовка.", states: ["typing", "skip", "choice", "good end", "bad end"], wide: true, C: Dialogue },
      { id: "V02", title: "Чат с ИИ-ментором", desc: "Индикатор набора, быстрые ответы, сообщения с графиком и мини-квизом.", states: ["typing", "reply", "rich card", "quiz"], C: MentorChat },
      { id: "V03", title: "Прожектор-обучение", desc: "Вырез в затемнении переезжает между элементами, подсказка сама выбирает сторону.", states: ["spotlight", "next", "skip", "done"], C: CoachMarks },
      { id: "V04", title: "Главы истории", desc: "Обложки глав, блокировка с тряской, отметки прохождения.", states: ["done", "open", "locked"], wide: true, C: Chapters },
    ],
  },
  {
    key: "surfaces", code: "W", title: "Системные поверхности", sub: "Пуши, виджет, иконки, ошибки, юбилеи стрика", icon: "bell", tone: "text-sky", hex: "#3D9BFF",
    assets: [
      { id: "W01", title: "Экран блокировки", desc: "Живой виджет стрика и BTC, стопка пушей с раскрытием.", states: ["push", "stack", "expand", "widget"], wide: true, C: LockScreen },
      { id: "W02", title: "Иконки приложения", desc: "6 альтернативных иконок, превью на рабочем столе, бейдж.", states: ["default", "seasonal", "pro", "badge"], C: AppIcons },
      { id: "W03", title: "Ошибки и офлайн", desc: "Офлайн, 500, работы, апдейт — повтор с экспоненциальной задержкой.", states: ["offline", "500", "maintenance", "update", "backoff"], C: ErrorStates },
      { id: "W04", title: "Юбилей стрика", desc: "Лучи, пламя из частиц, значок и карточка «Поделиться».", states: ["pre", "celebrate", "share"], C: Milestone },
    ],
  },
  {
    key: "carousels", code: "Q", title: "Карусели", sub: "Один движок — 7 вариантов: слайд, fade, coverflow, куб, стопка, вертикаль, peek", icon: "refresh", tone: "text-sky", hex: "#3D9BFF",
    assets: [
      { id: "Q01", title: "Hero-промо", desc: "Fade-слайды с автоплеем, прогрессом, счётчиком и каскадом текста.", states: ["autoplay", "pause", "swipe", "cta"], wide: true, C: HeroCarousel },
      { id: "Q02", title: "Coverflow карт", desc: "3D-веер карт навыков с поворотом, глубиной и затемнением краёв.", states: ["drag", "fling", "active", "dim"], C: CoverflowCards },
      { id: "Q03", title: "3D-куб фич", desc: "Грани куба + иконки-переключатели с цветом активной грани.", states: ["rotate", "face", "switch"], C: CubeShowcase },
      { id: "Q04", title: "Стопка отзывов", desc: "Карточки стопкой: свайп верхней, остальные догоняют.", states: ["drag", "stack", "dots"], C: StackReviews },
      { id: "Q05", title: "Вертикальные новости", desc: "Автопрокрутка вверх с паузой при наведении и прогрессом.", states: ["auto", "pause", "progress"], C: VerticalNews },
      { id: "Q06", title: "Витрина лиг (peek)", desc: "Соседние слайды видно краем + синхронизированные миниатюры.", states: ["peek", "thumbs", "arrows"], C: PeekLeagues },
    ],
  },
  {
    key: "scrollfx", code: "U", title: "Реакция на скролл", sub: "Появления, липкие стопки, горизонтальный трек, параллакс, счётчики", icon: "chevD", tone: "text-violet", hex: "#9A6BFF",
    assets: [
      { id: "U01", title: "Лаборатория появлений", desc: "8 вариантов reveal + каскад с настраиваемой задержкой.", states: ["fade-up", "scale", "flip", "blur", "pop", "stagger"], wide: true, C: RevealLab },
      { id: "U02", title: "Липкая стопка модулей", desc: "Карточки налипают при скролле страницы, предыдущие сжимаются.", states: ["stick", "scale", "dim", "progress"], wide: true, C: StickyDemo },
      { id: "U03", title: "Горизонтальный трек", desc: "Снап-прокрутка: карточки наклоняются от центра, иконки едут.", states: ["snap", "tilt", "progress"], wide: true, C: TrackScroll },
      { id: "U04", title: "Параллакс-сцена", desc: "4 слоя за курсором с глубиной + плашка на скролл-параллаксе.", states: ["mouse", "depth", "scroll"], C: ParallaxScene },
      { id: "U05", title: "Счётчики по появлению", desc: "Числа и бары анимируются, когда входят в кадр.", states: ["count", "bar", "replay"], C: Counters },
      { id: "U06", title: "Скорость скролла", desc: "Быстрый скролл наклоняет карточки + бонус 3D-tilt.", states: ["skew", "blur", "tilt"], C: VelocitySkew },
    ],
  },
  {
    key: "galleries", code: "H", title: "Галереи и просмотр", sub: "До/после, лайтбокс, скины графика, Ken Burns, лупа", icon: "image", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "H01", title: "До / После", desc: "Разделитель портфеля: тяни ручку или стрелки клавиатуры.", states: ["drag", "keyboard", "50/50"], C: BeforeAfter },
      { id: "H02", title: "Лайтбокс моментов", desc: "Сетка → полноэкранный просмотр: свайп, зум, клавиатура.", states: ["open", "swipe", "zoom", "keys"], C: Lightbox },
      { id: "H03", title: "Скины графика", desc: "4 темы свечей с живым превью и покупкой за кристаллы.", states: ["preview", "buy", "owned"], C: SkinPicker },
      { id: "H04", title: "Ken Burns шоу", desc: "Медленный наезд камеры, сторис-прогресс, пауза.", states: ["zoom", "progress", "pause"], C: KenBurns },
      { id: "H05", title: "Лупа над графиком", desc: "Круглая лупа следует за курсором, зум ×1.5–×3.", states: ["lens", "zoom", "touch"], C: Magnifier },
    ],
  },
  {
    key: "motionlab", code: "J", title: "Лаборатория движения", sub: "Пружины, кривые, конструктор каруселей, физика броска", icon: "sparkles", tone: "text-flame", hex: "#FF8A3D",
    assets: [
      { id: "J01", title: "Тюнер пружины", desc: "Жёсткость и демпфер с живым следом и замером перелёта.", states: ["target", "trail", "overshoot", "preset"], C: SpringTuner },
      { id: "J02", title: "Гонка кривых", desc: "4 кривые бегут наперегонки + SVG-графики и CSS-код.", states: ["race", "curve", "duration", "code"], C: EasingLab },
      { id: "J03", title: "Конструктор карусели", desc: "Собери свою: вариант, loop, автоплей, точки — и забери код.", states: ["variant", "loop", "auto", "gap", "code"], wide: true, C: CarouselLab },
      { id: "J04", title: "Физика броска", desc: "Швырни монету: инерция, трение, отскок и вектор скорости.", states: ["fling", "friction", "bounce"], C: FlingLab },
      { id: "J05", title: "Секвенсор анимаций", desc: "5 ключей, скраб по таймлайну, след, кривые, loop.", states: ["keys", "scrub", "trail", "loop"], C: Sequencer },
    ],
  },
  {
    key: "promo", code: "O", title: "Промо и онбординг", sub: "Пейджер, табы фич, marquee отзывов, баннер ивента", icon: "sparkles", tone: "text-bull", hex: "#2BE38B",
    assets: [
      { id: "O01", title: "Свайп-пейджер", desc: "Онбординг из 3 экранов: свайп, прогресс, пропуск.", states: ["swipe", "dots", "skip", "done"], C: OnboardingPager },
      { id: "O02", title: "Табы фич", desc: "Бегущий индикатор, автопрокрутка с паузой, каскад пунктов.", states: ["indicator", "auto", "stagger"], C: FeatureTabs },
      { id: "O03", title: "Marquee отзывов", desc: "Две ленты в разные стороны, скорость, пауза при наведении.", states: ["marquee", "reverse", "speed", "pause"], wide: true, C: QuoteMarquee },
      { id: "O04", title: "Баннер ивента", desc: "Флип-таймер, бегущая строка, tilt и конфетти за участие.", states: ["countdown", "tilt", "join", "marquee"], wide: true, C: EventBanner },
      { id: "O05", title: "Роадмап с голосованием", desc: "5 идей сезона: 3 голоса, бары поддержки, итоги.", states: ["vote", "unvote", "empty"], C: Roadmap },
      { id: "O06", title: "Чек-лист новичка", desc: "5 первых шагов с кольцом прогресса и бонусом за всё.", states: ["check", "ring", "bonus"], C: Checklist },
    ],
  },
  {
    key: "microfx", code: "B", title: "Микрофизика", sub: "Магнит, ripple, взрывы, morph-кнопка, светящиеся рамки, бейджи", icon: "bolt", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "B01", title: "Магнит + ripple", desc: "Кнопки тянутся к курсору, клик расходится волной.", states: ["magnet", "ripple", "strength"], C: MagnetButtons },
      { id: "B02", title: "Кнопка-взрыв", desc: "Тап = частицы, комбо-серия и джекпот каждый 10-й.", states: ["tap", "combo", "jackpot"], C: BurstButton },
      { id: "B03", title: "Morph-кнопка", desc: "Idle → загрузка с бликом → успех. Одна кнопка, ноль скачков.", states: ["idle", "loading", "success"], C: MorphButton },
      { id: "B04", title: "Светящиеся рамки", desc: "Рамка и подсветка карточек следуют за курсором.", states: ["glow", "hover", "lift"], C: GlowCards },
      { id: "B05", title: "Живой бейдж", desc: "Pop при росте, тряска колокола, переполнение 99+.", states: ["pop", "shake", "99+", "clear"], C: BadgePop },
    ],
  },
  {
    key: "arena", code: "A", title: "Арена турниров", sub: "Сетка плей-офф, живая гонка, календарь, фонд, трекер матча", icon: "trophy", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "A01", title: "Турнирная сетка", desc: "Плей-офф 8→1: симуляция раундов, зачёркнутые проигравшие, чемпион.", states: ["quarter", "semi", "final", "champion"], wide: true, C: Bracket },
      { id: "A02", title: "Живая гонка лиги", desc: "Бары XP едут по неделям, позиции и корона пересчитываются.", states: ["play", "pause", "week", "crown"], C: LiveRace },
      { id: "A03", title: "Календарь событий", desc: "Месяц ивентов: точки событий, сегодня, карточка дня.", states: ["day", "event", "today", "remind"], C: EventCalendar },
      { id: "A04", title: "Призовой фонд", desc: "Растущий пул, распределение мест, таймер и вход за кристаллы.", states: ["pool", "countdown", "join"], C: PrizePool },
      { id: "A05", title: "Трекер матча", desc: "Live-счёт, моментум-бар, лента событий, итог с реваншем.", states: ["live", "momentum", "log", "result"], C: MatchTracker },
      { id: "A06", title: "Пул прогнозов", desc: "Ставки на исход недели: живой %, банк, выплата победителям.", states: ["bet", "pool", "resolve", "payout"], C: PredictionPool },
      { id: "A07", title: "Рейд-босс Гидра", desc: "Тапай босса: урон-цифры, криты, гонка вклада, награды.", states: ["tap", "crit", "race", "loot"], C: RaidBoss },
    ],
  },
  {
    key: "journal", code: "I", title: "Журнал трейдера", sub: "Кривая доходности, винрейт, календарь PnL, теги, разбор ошибок", icon: "chart", tone: "text-bull", hex: "#2BE38B",
    assets: [
      { id: "I01", title: "Кривая доходности", desc: "Canvas-график с анимацией отрисовки, кроссхейром и периодами.", states: ["draw", "crosshair", "period"], C: Equity },
      { id: "I02", title: "Винрейт и сплит", desc: "Кольцо Long/Short с ховером + столбцы сделок по парам.", states: ["donut", "hover", "bars"], C: Winrate },
      { id: "I03", title: "Календарь PnL", desc: "Тепловая карта месяца: зелёные и красные дни, детали дня.", states: ["heatmap", "day", "export"], C: PnlCalendar },
      { id: "I04", title: "Теги сетапов", desc: "Винрейт по стратегиям, сортировки, скрытие, совет Макса.", states: ["sort", "hide", "coach"], C: TagStats },
      { id: "I05", title: "Разбор ошибок", desc: "Топ-3 утечки денег с ценой, советами и чек-листом фиксов.", states: ["cost", "tip", "fix"], C: MistakeCoach },
      { id: "I06", title: "Подводная просадка", desc: "Canvas-глубина drawdown с зонами, худшей точкой и кроссхейром.", states: ["draw", "zones", "crosshair"], C: Underwater },
      { id: "I07", title: "Отчёт недели", desc: "Оценка S–C, статистика, лучшее/худшее и цель на неделю.", states: ["grade", "stats", "goal", "share"], C: WeekReport },
    ],
  },
  {
    key: "a11y", code: "Y", title: "Доступность и звук", sub: "Дальтонизм, движение, контраст, размер текста, звук и вибро", icon: "eye", tone: "text-gold", hex: "#FFC940",
    assets: [
      { id: "Y01", title: "Живые настройки доступности", desc: "4 цветовых режима, меньше движения, контраст, текст 90–130% — на весь сайт.", states: ["deut", "trit", "mono", "reduced", "hc", "scale"], wide: true, C: A11ySettings },
      { id: "Y02", title: "Матрица контраста WCAG", desc: "Реальный расчёт контраста токенов на всех поверхностях.", states: ["AAA", "AA", "large", "fail"], wide: true, C: ContrastMatrix },
      { id: "Y03", title: "Звуки и вибро", desc: "9 синтезированных звуков и 7 именованных вибро-паттернов с таймлайном.", states: ["play", "pattern"], C: SoundLab },
      { id: "Y04", title: "Зоны касания и клавиатура", desc: "Оверлей минимальных зон касания 44/48 и карта горячих клавиш.", states: ["overlay", "fail", "pass"], C: TouchTargets },
      { id: "Y05", title: "Амбиент-миксер", desc: "Процедурный фон: пэд, дождь, лента, пульс + пресеты. 0 КБ файлов.", states: ["stems", "preset", "viz"], C: AmbientMixer },
    ],
  },
  {
    key: "tokens", code: "Z", title: "Токены и хендофф", sub: "Экспорт, анатомия, матрица состояний, модель света", icon: "copy", tone: "text-violet", hex: "#9A6BFF",
    assets: [
      { id: "Z01", title: "Экспорт токенов", desc: "Один объект → CSS-переменные, JSON или Tailwind @theme, с подсветкой.", states: ["css", "json", "tailwind", "copy"], wide: true, C: TokenExport },
      { id: "Z02", title: "Анатомия с размерами", desc: "Выноски размеров как в спецификации, подсветка каждого слоя кнопки.", states: ["redlines", "layer hover"], C: Anatomy },
      { id: "Z03", title: "Матрица вариантов", desc: "6 вариантов × 4 состояния из одного класса.", states: ["default", "pressed", "loading", "disabled"], C: StateMatrix },
      { id: "Z04", title: "Модель освещения", desc: "Перетащи солнце — подошвы, тени и блики пересчитываются.", states: ["drag", "depth"], wide: true, C: LightModel },
    ],
  },
];

export const TOTAL = CATALOG.reduce((a, c) => a + c.assets.length, 0);
export const TOTAL_STATES = CATALOG.reduce((a, c) => a + c.assets.reduce((b, x) => b + x.states.length, 0), 0);
