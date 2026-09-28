import { useState } from "react";
import { Asset, Bar, Btn, Coin, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

type VisionMode = "default" | "deuteranopia" | "protanopia" | "monochrome" | "contrast";

function AccessibleChart() {
  const [mode, setMode] = useState<VisionMode>("default");
  const [patterns, setPatterns] = useState(true);
  const palette: Record<VisionMode, { up: string; down: string; bg: string; label: string }> = {
    default: { up: "#22d38a", down: "#ff4b6e", bg: "#0a1330", label: "Green / red" },
    deuteranopia: { up: "#3da5ff", down: "#ff9f43", bg: "#0a1330", label: "Blue / orange" },
    protanopia: { up: "#25c5d9", down: "#ffc53d", bg: "#0a1330", label: "Cyan / gold" },
    monochrome: { up: "#eef3ff", down: "#61739d", bg: "#0a1330", label: "Light / dark" },
    contrast: { up: "#00ff9d", down: "#ff2f61", bg: "#000000", label: "AAA contrast" },
  };
  const colors = palette[mode];
  const data = [
    [68, 49, 43, 73], [49, 55, 45, 60], [55, 39, 34, 61], [39, 31, 27, 45], [31, 43, 25, 48], [43, 58, 39, 64],
    [58, 53, 48, 66], [53, 69, 50, 74], [69, 62, 58, 76], [62, 75, 57, 80], [75, 70, 64, 84], [70, 86, 67, 91],
  ];
  return (
    <Asset
      code="A11-01"
      title="Color-vision Safe Charts"
      desc="Five palettes plus shape encoding. Up/down meaning survives without hue through solid and striped candle bodies."
      tags={["color vision", "patterns"]}
      span={2}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(palette) as VisionMode[]).map((value) => (
          <button key={value} onClick={() => setMode(value)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black border-2 transition-all", mode === value ? "border-sky bg-sky/15 text-sky shadow-[0_3px_0_#1a56a8]" : "border-ink-600 text-mist")}>
            {value === "default" ? "Default" : value === "deuteranopia" ? "Deuteranopia" : value === "protanopia" ? "Protanopia" : value === "monochrome" ? "Monochrome" : "High contrast"}
          </button>
        ))}
        <button onClick={() => setPatterns(!patterns)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black border-2 flex items-center gap-1.5 ml-auto", patterns ? "border-bull bg-bull/10 text-bull" : "border-ink-600 text-mist")}><Icon name={patterns ? "check" : "x"} size={12} stroke={3} />Shape patterns</button>
      </div>
      <div className="rounded-2xl p-4 transition-colors" style={{ background: colors.bg, border: "1px solid rgba(140,175,255,.15)" }}>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Coin sym="BTC" size={30} /><div><div className="text-[9px] font-black">BTC/USDT · 1H</div><div className="num text-sm font-black">67,421.50</div></div></div><div className="flex gap-3 text-[9px] font-black"><span style={{ color: colors.up }}>▲ UP</span><span style={{ color: colors.down }}>▼ DOWN</span></div></div>
        <svg viewBox="0 0 600 220" className="w-full h-56" role="img" aria-label="Bitcoin hourly candlestick chart. Overall trend is upward. Seven bullish candles and five bearish candles.">
          <defs>
            <pattern id="upPattern" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill={colors.up} /><line x1="0" x2="0" y1="0" y2="5" stroke={colors.bg} strokeWidth="1.5" opacity=".55" /></pattern>
            <pattern id="downPattern" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill={colors.down} /><circle cx="2.5" cy="2.5" r="1" fill={colors.bg} opacity=".7" /></pattern>
          </defs>
          {[35, 75, 115, 155, 195].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="rgba(140,175,255,.08)" />)}
          {data.map(([open, close, low, high], index) => {
            const x = 30 + index * 48;
            const y = (value: number) => 205 - value * 2;
            const up = close > open;
            const color = up ? colors.up : colors.down;
            return (
              <g key={index}>
                <line x1={x} x2={x} y1={y(high)} y2={y(low)} stroke={color} strokeWidth="2.5" />
                <rect x={x - 10} y={y(Math.max(open, close))} width="20" height={Math.max(3, Math.abs(y(open) - y(close)))} rx="3" fill={patterns ? `url(#${up ? "upPattern" : "downPattern"})` : color} stroke={color} strokeWidth="1" />
                {patterns && <text x={x} y="215" fill={color} textAnchor="middle" fontSize="9" fontWeight="900">{up ? "▲" : "▼"}</text>}
              </g>
            );
          })}
        </svg>
        <div className="rounded-xl p-2.5 bg-white/[.04] text-[10px] text-fog flex items-center gap-2"><Icon name="info" size={15} className="text-sky" /><span>Current encoding: <b>{colors.label}</b>{patterns ? " + stripe / dot shapes" : " · color only"}</span></div>
      </div>
    </Asset>
  );
}

function TypeScale() {
  const [scale, setScale] = useState(100);
  const [bold, setBold] = useState(false);
  const [spacing, setSpacing] = useState(false);
  const factor = scale / 100;
  return (
    <Asset
      code="A11-02"
      title="Dynamic Type"
      desc="Live 85–150% text scaling with optional weight and spacing. The sample reflows without clipping or horizontal scroll."
      tags={["type scale", "reflow"]}
    >
      <div className="flex items-center gap-3 mb-4"><Icon name="user" size={17} className="text-sky" /><input type="range" min={85} max={150} step={5} value={scale} onChange={(event) => setScale(+event.target.value)} className="flex-1 accent-sky" /><span className="num text-xs font-black text-sky w-10">{scale}%</span></div>
      <div className="grid grid-cols-2 gap-2 mb-4"><button onClick={() => setBold(!bold)} className={cn("h-9 rounded-xl border-2 text-[9px] font-black", bold ? "border-sky bg-sky/10 text-sky" : "border-ink-600 text-mist")}>Heavier text</button><button onClick={() => setSpacing(!spacing)} className={cn("h-9 rounded-xl border-2 text-[9px] font-black", spacing ? "border-sky bg-sky/10 text-sky" : "border-ink-600 text-mist")}>Extra spacing</button></div>
      <div className="game-surface rounded-2xl p-4 overflow-hidden" style={{ fontWeight: bold ? 600 : 400, letterSpacing: spacing ? ".035em" : undefined }}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-bull/15 text-bull grid place-items-center shrink-0"><Icon name="shield" size={23} /></div>
          <div className="min-w-0">
            <div style={{ fontSize: `${16 * factor}px`, lineHeight: 1.25 }} className="font-black break-words">Protect every trade with a stop-loss</div>
            <p style={{ fontSize: `${12 * factor}px`, lineHeight: spacing ? 1.85 : 1.55 }} className="text-mist mt-2 break-words">A stop-loss closes your position if price reaches a level you define. It keeps one wrong idea from becoming a large account loss.</p>
          </div>
        </div>
        <button style={{ fontSize: `${11 * factor}px`, minHeight: `${44 * factor}px` }} className="mt-4 w-full rounded-xl bg-bull text-ink-900 font-black uppercase shadow-[0_4px_0_#0b7a4a]">Continue lesson</button>
      </div>
      <div className="text-[9px] text-mist mt-3">Sample container remains <b className="text-fog">320px</b> wide. All text wraps and controls grow.</div>
    </Asset>
  );
}

type Locale = "en" | "ru" | "de" | "ar";
const COPY: Record<Locale, { language: string; title: string; body: string; cta: string; direction: "ltr" | "rtl" }> = {
  en: { language: "English", title: "Market basics", body: "Learn why prices move and how buyers and sellers create a market.", cta: "Start lesson", direction: "ltr" },
  ru: { language: "Русский", title: "Основы рынка", body: "Узнайте, почему меняются цены и как покупатели и продавцы создают рынок.", cta: "Начать урок", direction: "ltr" },
  de: { language: "Deutsch", title: "Marktgrundlagen", body: "Lerne, warum sich Preise bewegen und wie Käufer und Verkäufer einen Markt bilden.", cta: "Lektion starten", direction: "ltr" },
  ar: { language: "العربية", title: "أساسيات السوق", body: "تعرّف على أسباب تحرك الأسعار وكيف يصنع المشترون والبائعون السوق.", cta: "ابدأ الدرس", direction: "rtl" },
};

function Localization() {
  const [locale, setLocale] = useState<Locale>("en");
  const text = COPY[locale];
  return (
    <Asset
      code="A11-03"
      title="Localization & RTL"
      desc="Long German labels, Cyrillic and real right-to-left mirroring prove that layouts do not rely on fixed English lengths."
      tags={["i18n", "RTL"]}
    >
      <div className="well p-1 grid grid-cols-4 mb-4">
        {(Object.keys(COPY) as Locale[]).map((value) => <button key={value} onClick={() => setLocale(value)} className={cn("h-9 rounded-xl text-[10px] font-black uppercase transition-all", locale === value ? "bg-sky text-white shadow-[0_3px_0_#1a56a8]" : "text-mist")}>{value}</button>)}
      </div>
      <div key={locale} dir={text.direction} lang={locale} className="game-surface rounded-2xl p-4 anim-rise">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-violet/15 text-violet grid place-items-center shrink-0"><Icon name="book" size={24} /></div>
          <div className="min-w-0 flex-1"><div className="text-[8px] uppercase tracking-widest font-black text-mist">{text.language}</div><div className="font-black text-lg break-words">{text.title}</div></div>
          <Icon name={text.direction === "rtl" ? "chevL" : "chevR"} size={18} className="text-mist shrink-0" />
        </div>
        <p className="text-sm text-mist leading-relaxed min-h-16">{text.body}</p>
        <div className="flex items-center gap-2 mt-4"><div className="flex-1"><Bar value={38} color="violet" h={10} /></div><span className="num text-[10px] font-black text-violet">38%</span></div>
        <button className="w-full min-h-12 mt-4 px-4 rounded-xl bg-violet text-white text-xs font-black uppercase shadow-[0_4px_0_#4f2bb0] whitespace-normal">{text.cta}</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">{[["Text expansion", locale === "de" ? "+41%" : locale === "ru" ? "+24%" : locale === "ar" ? "+18%" : "base"], ["Direction", text.direction.toUpperCase()], ["Overflow", "0"]].map(([label, value]) => <div key={label} className="tile !rounded-xl p-2 text-center"><div className="num text-xs font-black text-bull">{value}</div><div className="text-[7px] text-mist uppercase font-bold">{label}</div></div>)}</div>
    </Asset>
  );
}

function ScreenReaderFlow() {
  const [focus, setFocus] = useState(0);
  const [live, setLive] = useState("Ready");
  const nodes = [
    { role: "Heading level 1", name: "Bitcoin market lesson" },
    { role: "Image", name: "Bitcoin icon" },
    { role: "Text", name: "Current simulated price 67,421 dollars, up 2.41 percent" },
    { role: "Progress bar", name: "Lesson progress, 38 percent" },
    { role: "Button", name: "Continue lesson" },
  ];
  const next = () => {
    const value = (focus + 1) % nodes.length;
    setFocus(value);
    setLive(`${nodes[value].role}: ${nodes[value].name}`);
  };
  return (
    <Asset
      code="A11-04"
      title="Screen Reader Order"
      desc="A visible accessibility tree demonstrates semantic order, role/name output and a polite live region update."
      tags={["semantics", "live region"]}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="game-surface rounded-2xl p-4">
          <div className={cn("rounded-lg p-1 -m-1", focus === 0 && "ring-2 ring-gold")}><h4 className="text-lg font-black">Bitcoin market lesson</h4></div>
          <div className="flex items-center gap-3 mt-4">
            <div className={cn("rounded-full", focus === 1 && "ring-2 ring-gold ring-offset-2 ring-offset-ink-800")}><Coin sym="BTC" size={42} /></div>
            <div className={cn("rounded-lg p-1", focus === 2 && "ring-2 ring-gold")}><div className="num font-black">$67,421.50</div><div className="num text-[10px] font-black text-bull">+2.41%</div></div>
          </div>
          <div className={cn("rounded-lg p-1 mt-4", focus === 3 && "ring-2 ring-gold")}><Bar value={38} color="bull" h={12} /></div>
          <div className={cn("rounded-xl mt-4", focus === 4 && "ring-2 ring-gold ring-offset-2 ring-offset-ink-800")}><Btn variant="bull" block>Continue lesson</Btn></div>
        </div>
        <div className="well p-3">
          <div className="text-[8px] font-black uppercase tracking-widest text-mist mb-2">Accessibility tree</div>
          <div className="space-y-1.5">{nodes.map((node, index) => <button key={node.name} onClick={() => { setFocus(index); setLive(`${node.role}: ${node.name}`); }} className={cn("w-full p-2 rounded-lg text-left transition-colors", focus === index ? "bg-gold/15 text-gold" : "bg-white/[.025] text-mist")}><span className="block text-[8px] font-black uppercase">{node.role}</span><span className="block text-[9px] truncate">{node.name}</span></button>)}</div>
        </div>
      </div>
      <div aria-live="polite" className="mt-3 rounded-xl p-3 bg-sky/10 border border-sky/25 flex items-center gap-2"><Icon name="volume" size={16} className="text-sky" /><span className="text-[10px] flex-1"><b className="text-sky">Announces:</b> {live}</span><button onClick={next} className="h-8 px-3 rounded-lg bg-sky text-white text-[9px] font-black">Next focus</button></div>
    </Asset>
  );
}

function MotionPreferences() {
  const [reduced, setReduced] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [flash, setFlash] = useState(false);
  const [count, setCount] = useState(0);
  const trigger = () => {
    setCount((value) => value + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), reduced ? 60 : 600);
  };
  return (
    <Asset
      code="A11-05"
      title="Motion Preferences"
      desc="Reduced motion swaps travel and scale for color/opacity while preserving confirmation and hierarchy."
      tags={["reduced motion", "preferences"]}
    >
      <div className="space-y-2 mb-4">
        {[
          ["Reduce motion", "Replace movement with fades", reduced, () => setReduced(!reduced)],
          ["Auto-play charts", "Animate new market data", autoplay, () => setAutoplay(!autoplay)],
        ].map(([title, detail, on, action]) => <button key={title as string} onClick={action as () => void} className="w-full game-surface rounded-xl p-3 flex items-center gap-3 text-left"><span className="w-9 h-9 rounded-xl bg-violet/15 text-violet grid place-items-center"><Icon name={title === "Reduce motion" ? "moon" : "chart"} size={18} /></span><span className="flex-1"><span className="block text-xs font-black">{title as string}</span><span className="block text-[9px] text-mist">{detail as string}</span></span><span className={cn("relative w-12 h-7 rounded-full transition-all", on ? "bg-violet" : "bg-ink-600")}><span className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 24 : 4 }} /></span></button>)}
      </div>
      <div className={cn("well dotgrid min-h-44 grid place-items-center relative overflow-hidden transition-colors", flash && "!bg-bull/15")}>
        <div key={count} className="text-center" style={{ animation: reduced ? "glow .6s ease both" : "bounceIn .6s cubic-bezier(.2,.9,.3,1.2) both" }}>
          <div className="w-16 h-16 rounded-full bg-bull/15 text-bull grid place-items-center mx-auto"><Icon name="check" size={31} stroke={3} /></div>
          <div className="font-black mt-3">Order confirmed</div>
          <div className="text-[9px] text-mist">{reduced ? "Opacity + color only" : "Spring scale + color"}</div>
        </div>
      </div>
      <Btn variant="bull" size="sm" block className="mt-3" onClick={trigger}>Replay feedback</Btn>
    </Asset>
  );
}

function ContrastInspector() {
  const [foreground, setForeground] = useState("#EEF3FF");
  const [background, setBackground] = useState("#0E1A3B");
  const luminance = (hex: string) => {
    const values = hex.replace("#", "").match(/.{2}/g)?.map((value) => parseInt(value, 16) / 255) ?? [0, 0, 0];
    const linear = values.map((value) => value <= .03928 ? value / 12.92 : Math.pow((value + .055) / 1.055, 2.4));
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  };
  const l1 = luminance(foreground);
  const l2 = luminance(background);
  const ratio = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
  const grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA Large" : "Fail";
  const presets = [["#EEF3FF", "#0E1A3B"], ["#22D38A", "#070E22"], ["#FFC53D", "#0A1330"], ["#FF4B6E", "#070E22"]];
  return (
    <Asset
      code="A11-06"
      title="Contrast Inspector"
      desc="Real WCAG relative-luminance calculation for token pairs, with AA/AAA status and editable color inputs."
      tags={["WCAG", "calculator"]}
    >
      <div className="rounded-2xl p-5 min-h-36 grid place-items-center text-center transition-colors mb-4" style={{ color: foreground, background }}><div><div className="text-2xl font-black">Readable by design</div><div className="text-sm mt-1 opacity-80">Live token pair preview · 16px body text</div></div></div>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-3">
        <label className="well p-2 flex items-center gap-2"><input type="color" value={foreground} onChange={(event) => setForeground(event.target.value.toUpperCase())} className="w-7 h-7 rounded border-0 bg-transparent" /><span className="num text-[10px] font-bold">{foreground}</span></label>
        <label className="well p-2 flex items-center gap-2"><input type="color" value={background} onChange={(event) => setBackground(event.target.value.toUpperCase())} className="w-7 h-7 rounded border-0 bg-transparent" /><span className="num text-[10px] font-bold">{background}</span></label>
        <div className={cn("rounded-xl px-3 grid place-items-center text-center", grade === "Fail" ? "bg-bear/15 text-bear" : "bg-bull/15 text-bull")}><div><div className="num font-black text-lg">{ratio.toFixed(2)}:1</div><div className="text-[8px] font-black">{grade}</div></div></div>
      </div>
      <div className="flex gap-2">{presets.map(([fg, bg]) => <button key={`${fg}${bg}`} onClick={() => { setForeground(fg); setBackground(bg); }} className="flex-1 h-9 rounded-xl border border-white/10 relative overflow-hidden"><span className="absolute inset-y-0 left-0 w-1/2" style={{ background: fg }} /><span className="absolute inset-y-0 right-0 w-1/2" style={{ background: bg }} /></button>)}</div>
    </Asset>
  );
}

export default function Accessibility() {
  return (
    <Section
      id="accessibility"
      index="15"
      title="Accessibility & Global"
      subtitle="Accessibility is part of the visual system: non-color encoding, reflow, semantics, RTL, motion and measured contrast."
    >
      <AccessibleChart />
      <TypeScale />
      <Localization />
      <ScreenReaderFlow />
      <MotionPreferences />
      <ContrastInspector />
    </Section>
  );
}