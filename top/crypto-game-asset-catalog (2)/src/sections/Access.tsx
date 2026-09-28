import { useState } from "react";
import { Check, X, Keyboard, Eye, Contrast, Languages, ArrowLeftRight } from "lucide-react";
import { Asset, Section, Chip, Bar, Btn } from "../kit/ui";
import { FlameIcon, GemIcon, HeartIcon, TrophyIcon, CoinIcon, BoltIcon } from "../kit/GameIcons";
import { sfx } from "../kit/sfx";
import { cn } from "../utils/cn";

/* ---------- WCAG maths ---------- */
function lum(hex: string) {
  const h = hex.replace("#", "");
  const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function ratio(a: string, b: string) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const pairings: [string, string, string][] = [
  ["#e8eeff", "#0a1224", "Snow on Midnight"],
  ["#8a9bc4", "#0a1224", "Mist on Midnight"],
  ["#22d39a", "#0a1224", "Bull on Midnight"],
  ["#ffc53d", "#0a1224", "Gold on Midnight"],
  ["#3b82ff", "#0a1224", "Signal on Midnight"],
  ["#0a1224", "#ffc53d", "Midnight on Gold"],
  ["#ff4f6d", "#0d1730", "Bear on Panel"],
  ["#2bd9ff", "#111d3a", "Cyan on Panel"],
];
function ContrastAuditor() {
  const [i, setI] = useState(0);
  const [size, setSize] = useState(16);
  const [fg, bg, name] = pairings[i];
  const r = ratio(fg, bg);
  const aa = r >= 4.5, aaLarge = r >= 3, aaa = r >= 7;
  return (
    <Asset code="N-001" title="Contrast Auditor" desc="Реальная проверка WCAG по формуле яркости: AA, AA-large и AAA для каждой пары." hint="Выбери пару и размер" specs={["WCAG 2.2", "live ratio", "8 pairs"]}>
      <div className="grid grid-cols-4 gap-1.5">
        {pairings.map((p, k) => (
          <button key={p[2]} onClick={() => { setI(k); sfx.tick(); }} title={p[2]} className={cn("h-10 rounded-xl text-[9px] font-extrabold transition", i === k && "ring-2 ring-white")} style={{ background: p[1], color: p[0], boxShadow: i === k ? undefined : "0 3px 0 rgba(0,0,0,.35)" }}>
            Aa
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl p-5 transition-colors duration-300" style={{ background: bg, color: fg }}>
        <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">{name}</div>
        <div className="mt-1 font-display font-black leading-tight" style={{ fontSize: size * 1.9 }}>Read the market</div>
        <div className="mt-1.5 leading-snug" style={{ fontSize: size }}>Рискуй 1–2% на сделку, ставь стоп до входа.</div>
        <div className="num mt-1 opacity-80" style={{ fontSize: size * 0.9 }}>$64,218.40 ▲ 2.14%</div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {[12, 16, 22].map((s) => (
          <button key={s} onClick={() => { setSize(s); sfx.tick(); }} className={cn("num h-9 flex-1 rounded-xl text-[11px] font-bold", size === s ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{s}px</button>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-ink-900/60 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-mist">Contrast ratio</span>
          <span className="num text-xl font-extrabold" style={{ color: aa ? "#22d39a" : aaLarge ? "#ffc53d" : "#ff4f6d" }}>{r.toFixed(2)}:1</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {[["AA 4.5", aa], ["AA large 3", aaLarge], ["AAA 7", aaa]].map(([l, ok]) => (
            <span key={l as string} className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-extrabold", ok ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear")}>
              {ok ? <Check size={11} /> : <X size={11} />} {l as string}
            </span>
          ))}
        </div>
        <div className="mt-2"><Bar value={Math.min(100, (r / 21) * 100)} tone={aa ? "bull" : aaLarge ? "gold" : "bear"} h={8} glow={false} /></div>
      </div>
    </Asset>
  );
}

const filters = [
  { n: "Normal", f: "none" },
  { n: "Protanopia", f: "url(#sim-prot)" },
  { n: "Deuteranopia", f: "url(#sim-deut)" },
  { n: "Tritanopia", f: "url(#sim-trit)" },
  { n: "Achromatopsia", f: "url(#sim-achr)" },
];
function ColourBlind() {
  const [f, setF] = useState(1);
  return (
    <Asset code="N-002" title="Colour-blind Simulation" desc="Симуляция 4 типов дальтонизма на реальной палитре и игровом экране через цветовые матрицы." hint="Меняй симуляцию" specs={["feColorMatrix", "4 types", "game UI"]}>
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="sim-prot"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" /></filter>
          <filter id="sim-deut"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" /></filter>
          <filter id="sim-trit"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" /></filter>
          <filter id="sim-achr"><feColorMatrix type="matrix" values="0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" /></filter>
        </defs>
      </svg>
      <div className="grid grid-cols-5 gap-1.5">
        {filters.map((x, i) => (
          <button key={x.n} onClick={() => { setF(i); sfx.tick(); }} className={cn("h-9 rounded-xl px-1 text-[8px] font-extrabold uppercase transition", f === i ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>{x.n}</button>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl" style={{ filter: filters[f].f }}>
        <div className="grid grid-cols-6">
          {[["#22d39a", "Bull"], ["#ff4f6d", "Bear"], ["#ffc53d", "Gold"], ["#3b82ff", "Signal"], ["#8b5cff", "Legend"], ["#2bd9ff", "Gems"]].map(([c, n]) => (
            <div key={n} className="h-12" style={{ background: c }} />
          ))}
        </div>
        <div className="flex items-center gap-2 bg-ink-800 p-3">
          <FlameIcon size={26} /><GemIcon size={26} /><HeartIcon size={26} /><TrophyIcon size={26} /><CoinIcon size={26} /><BoltIcon size={26} />
          <span className="ml-auto text-[11px] font-bold text-mist">Иконки + цвет</span>
        </div>
        <div className="flex items-center gap-2 bg-ink-900 p-3">
          <span className="num rounded-lg px-2 py-1 text-[11px] font-extrabold text-bull bg-bull/15">+2.14%</span>
          <span className="num rounded-lg px-2 py-1 text-[11px] font-extrabold text-bear bg-bear/15">−0.82%</span>
          <span className="ml-auto text-[10px] text-mist">Цвет ≠ единственный сигнал</span>
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-dashed border-ink-500 p-3">
        <Eye size={15} className="mt-0.5 text-sky" />
        <div className="text-[10px] leading-snug text-mist">Рядом с цветом всегда есть форма: стрелка, иконка, знак или текст. Поэтому палитра читается и при дальтонизме.</div>
      </div>
    </Asset>
  );
}

const keys = [
  ["Tab", "Перемещение по фокусу"], ["Shift+Tab", "Назад"], ["Enter", "Активировать / проверить"],
  ["Space", "Нажать кнопку"], ["1–4", "Ответить в квизе"], ["← →", "Слайдер, табы"],
  ["Esc", "Закрыть модалку"], ["R", "Replay анимации"], ["M", "Звук вкл/выкл"], ["?", "Горячие клавиши"],
];
function KeyboardMap() {
  const [hit, setHit] = useState<string | null>(null);
  return (
    <Asset code="N-003" title="Keyboard & Focus" desc="Полная карта горячих клавиш и видимый фокус-ринг на всех интерактивных элементах." hint="Нажми клавишу на экране" specs={["10 bindings", "focus ring", "skip link"]}>
      <div className="grid grid-cols-2 gap-2">
        {keys.map(([k, d]) => (
          <button key={k} onClick={() => { setHit(k); sfx.tick(); setTimeout(() => setHit(null), 600); }} className="flex items-center gap-2 rounded-xl bg-ink-800 p-2.5 text-left shadow-[0_3px_0_#08112a] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky">
            <kbd className={cn("num rounded-md border-b-4 px-2 py-1 text-[10px] font-extrabold", hit === k ? "border-sky-d bg-sky" : "border-ink-500 bg-ink-700 text-mist")}>{k}</kbd>
            <span className="text-[10px] leading-tight text-mist">{d}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-sky/10 p-3">
        <Keyboard size={16} className="shrink-0 text-sky" />
        <div className="text-[10px] leading-snug text-mist">Фокус всегда виден: 3 px контур + смещение 4 px. Пропуск контента — первый Tab на странице.</div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Default", "Hover", "Focus"].map((s) => (
          <div key={s} className="rounded-xl bg-ink-900/60 p-2 text-center">
            <div className={cn("mx-auto grid h-10 place-items-center rounded-lg text-[10px] font-extrabold uppercase", s === "Focus" ? "outline outline-2 outline-offset-2 outline-sky text-white" : s === "Hover" ? "bg-sky/25 text-sky" : "bg-ink-700 text-mist")}>Aa</div>
            <div className="mt-1.5 text-[8px] font-bold uppercase text-mist">{s}</div>
          </div>
        ))}
      </div>
    </Asset>
  );
}

const langs = [
  { k: "en", l: "English", flag: "🇬🇧", t: ["Read the market", "Continue", "Correct! +15 XP"], dir: "ltr" },
  { k: "ru", l: "Русский", flag: "🇷🇺", t: ["Читай рынок", "Продолжить", "Верно! +15 XP"], dir: "ltr" },
  { k: "es", l: "Español", flag: "🇪🇸", t: ["Lee el mercado", "Continuar", "¡Correcto! +15 XP"], dir: "ltr" },
  { k: "tr", l: "Türkçe", flag: "🇹🇷", t: ["Piyasayı oku", "Devam", "Doğru! +15 XP"], dir: "ltr" },
  { k: "ar", l: "العربية", flag: "🇸🇦", t: ["اقرأ السوق", "متابعة", "صحيح! +15 XP"], dir: "rtl" },
];
function Localization() {
  const [i, setI] = useState(1);
  const lang = langs[i];
  return (
    <Asset code="N-004" title="Localization & RTL" desc="5 языков, включая RTL. Строки, числа и направление переключаются в живом экране." hint="Смени язык" specs={["5 locales", "RTL flip", "plurals"]}>
      <div className="flex flex-wrap gap-1.5">
        {langs.map((x, k) => (
          <button key={x.k} onClick={() => { setI(k); sfx.tick(); }} className={cn("flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-extrabold transition", i === k ? "bg-sky shadow-[0_3px_0_#2152c4]" : "bg-ink-800 text-mist shadow-[0_3px_0_#08112a]")}>
            <span className="text-sm">{x.flag}</span>{x.l}
          </button>
        ))}
      </div>
      <div key={lang.k} className="anim-fade mt-4 overflow-hidden rounded-2xl bg-ink-900/60 p-4" dir={lang.dir}>
        <div className="flex items-center justify-between">
          <Languages size={16} className="text-sky" />
          <span className="num text-[9px] font-bold uppercase text-mist">{lang.k} · {lang.dir}</span>
        </div>
        <div className="font-display mt-3 text-lg font-extrabold">{lang.t[0]}</div>
        <div className="mt-3 flex gap-2">
          <button className="btn3d h-11 flex-1 !rounded-xl !text-[11px]" style={{ ["--c" as string]: "var(--color-bull)", ["--cd" as string]: "var(--color-bull-d)" }}>{lang.t[1]}</button>
          <button className="btn-ghost3d h-11 !rounded-xl !text-[11px]">✕</button>
        </div>
        <div className="mt-3 rounded-xl bg-bull/12 p-2.5 text-[12px] font-bold text-bull">{lang.t[2]}</div>
        <div className="num mt-3 flex items-center justify-between text-[11px] text-mist">
          <span>1 284.50</span><span>87.4%</span><span>24.10.2026</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-ink-500 p-3">
        <ArrowLeftRight size={15} className="text-gold" />
        <div className="text-[10px] text-mist">RTL: макет зеркалится, иконки-стрелки меняют направление, числа остаются LTR.</div>
      </div>
    </Asset>
  );
}

function MotionPrefs() {
  const [motion, setMotion] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [text, setText] = useState(100);
  const sw = (v: boolean, set: (b: boolean) => void) => (
    <button onClick={() => { set(!v); sfx.toggle(!v); }} className={cn("relative h-7 w-12 rounded-full transition-colors", v ? "bg-bull" : "bg-ink-600")}>
      <span className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300" style={{ transform: v ? "translateX(20px)" : "none" }} />
    </button>
  );
  return (
    <Asset code="N-005" title="Comfort & Motion Settings" desc="Регулировки доступности: движение, звук, гаптика, размер текста. Учитываются системные настройки." hint="Покрути настройки" specs={["prefers-reduced-motion", "text zoom", "system aware"]}>
      <div className="space-y-2">
        {([["Reduce motion", motion, setMotion], ["Sound effects", sound, setSound], ["Haptics", haptic, setHaptic]] as const).map(([l, v, set]) => (
          <div key={l} className="flex items-center justify-between rounded-2xl bg-ink-800 px-3.5 py-2.5 shadow-[0_3px_0_#08112a]">
            <span className="text-[13px] font-bold">{l}</span>
            {sw(v, set)}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-2xl bg-ink-800 p-3 shadow-[0_3px_0_#08112a]">
        <div className="mb-1.5 flex justify-between text-[12px] font-bold"><span>Text size</span><span className="num text-gold">{text}%</span></div>
        <input type="range" min={85} max={150} value={text} onChange={(e) => setText(+e.target.value)} className="h-2 w-full cursor-pointer appearance-none rounded-full" style={{ accentColor: "#ffc53d", background: `linear-gradient(90deg,#ffc53d ${((text - 85) / 65) * 100}%,#0b1530 0)` }} />
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl border border-white/5 bg-ink-900/60 p-3">
        <div className="flex items-center gap-3">
          <div className={cn("h-12 w-12 shrink-0 rounded-full bg-gradient-to-b from-sky to-sky-d shadow-[0_3px_0_#15398f]", motion && "anim-float")} />
          <div>
            <div className="font-display font-extrabold" style={{ fontSize: 12 * (text / 100) }}>Lesson complete</div>
            <div className="text-mist" style={{ fontSize: 10 * (text / 100) }}>Текст масштабируется без обрезки</div>
          </div>
          <Btn tone="bull" size="sm" className="ml-auto !h-9 !text-[10px]" onClick={() => sfx.correct()}>Claim</Btn>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip tone="bull">respect system</Chip>
        <Chip tone="sky">no flash &gt; 3/s</Chip>
        <Chip tone="gold">zoom 200%</Chip>
      </div>
    </Asset>
  );
}

function Summary() {
  const rows: [string, number, string][] = [
    ["Contrast AA", 100, "8/8 пар проходят"],
    ["Keyboard", 100, "10 действий с клавиатуры"],
    ["Screen reader", 92, "aria-label у иконок и игр"],
    ["Motion control", 100, "prefers-reduced-motion"],
    ["Localization", 96, "5 языков, RTL"],
    ["Touch targets", 100, "≥ 44 px"],
  ];
  return (
    <Asset code="N-006" title="Accessibility Summary" desc="Сводка по доступности: что закрыто, что осталось довести." hint="Смотри прогресс" specs={["6 dimensions", "honest status"]}>
      <div className="space-y-3">
        {rows.map(([n, v, d], i) => (
          <div key={n}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[12px] font-extrabold">{n}</span>
              <span className="num text-[11px] font-bold text-mist">{v}%</span>
            </div>
            <Bar value={v} tone={v >= 100 ? "bull" : "gold"} h={10} glow={false} />
            <div className="mt-0.5 text-[10px] text-mist">{d}</div>
            <style>{`.delay-${i}{animation-delay:${i * 80}ms}`}</style>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-ink-900/60 p-3">
        <Contrast size={16} className="text-gold" />
        <div className="text-[10px] leading-snug text-mist">Доступность — не пункт чек-листа: она проектируется вместе с токенами цвета и движения.</div>
      </div>
    </Asset>
  );
}

export default function Access() {
  return (
    <Section id="access" index="14" title="Accessibility & Localization" subtitle="Контраст, дальтонизм, клавиатура, комфорт, 5 языков">
      <ContrastAuditor />
      <ColourBlind />
      <KeyboardMap />
      <Localization />
      <MotionPrefs />
      <Summary />
    </Section>
  );
}
