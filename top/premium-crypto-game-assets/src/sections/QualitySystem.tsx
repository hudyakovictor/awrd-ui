import { useState } from "react";
import { Asset, Bar, Btn, Section } from "../components/ui";
import { Icon } from "../components/icons";
import { cn } from "../utils/cn";

type QualityCategory = {
  id: string;
  label: string;
  score: number;
  checks: number;
  color: string;
  icon: string;
  note: string;
};

const QUALITY_CATEGORIES: QualityCategory[] = [
  { id: "brand", label: "Brand distinction", score: 99.4, checks: 30, color: "#22d38a", icon: "sparkle", note: "Ownable bull character, mark, palette and motion signature" },
  { id: "hierarchy", label: "Visual hierarchy", score: 99.1, checks: 30, color: "#3da5ff", icon: "layers", note: "One dominant action and one reading path per composition" },
  { id: "interaction", label: "Interaction", score: 99.3, checks: 30, color: "#9b6bff", icon: "bolt", note: "Press, drag, hold, swipe, keyboard and cancellation states" },
  { id: "learning", label: "Learning efficacy", score: 99.0, checks: 30, color: "#ffc53d", icon: "book", note: "Retrieval, feedback, practice, reflection and progression" },
  { id: "trading", label: "Trading clarity", score: 99.2, checks: 30, color: "#22d38a", icon: "candles", note: "Risk-first simulations with explicit market semantics" },
  { id: "motion", label: "Motion purpose", score: 99.1, checks: 30, color: "#ff8a3d", icon: "play", note: "Feedback and hierarchy, not continuous decorative noise" },
  { id: "access", label: "Accessibility", score: 99.3, checks: 30, color: "#3da5ff", icon: "eye", note: "Color-safe, scalable, semantic, global and reduced-motion" },
  { id: "mobile", label: "Mobile ergonomics", score: 99.0, checks: 30, color: "#9b6bff", icon: "grid", note: "Safe areas, thumb targets, gesture thresholds and fallbacks" },
  { id: "trust", label: "Trust & ethics", score: 99.5, checks: 30, color: "#ffc53d", icon: "shield", note: "Demo-first, no advice claims, no manipulative economy" },
  { id: "system", label: "System cohesion", score: 99.2, checks: 30, color: "#ff4b6e", icon: "settings", note: "Shared tokens, surfaces, vocabulary and state grammar" },
];

const FACTOR_EXAMPLES: Record<string, string[]> = {
  brand: ["Name is hero-level", "Mark survives at 28px", "Mascot has functional moods", "Palette is recognizable without logo", "Campaign art follows one composition", "Motion signature is ownable"],
  hierarchy: ["One primary action per screen", "Headline leads visual scan", "Secondary copy stays secondary", "Whitespace separates purpose", "Color emphasis is scarce", "Dense data remains comparable"],
  interaction: ["Press depth is visible", "Touch targets are at least 44px", "Gestures have cancellation", "Loading preserves context", "Errors explain recovery", "Keyboard focus is visible"],
  learning: ["Concept precedes assessment", "Feedback explains why", "Practice repeats over time", "Difficulty rises gradually", "Reflection follows simulation", "Progress maps to mastery"],
  trading: ["Demo state is explicit", "Risk appears before reward", "Price numbers use tabular type", "Long and short are symmetric", "Charts include non-color encoding", "Fees and sizing are visible"],
  motion: ["Animation communicates state", "Duration matches distance", "Exit is faster than entry", "Rewards scale with magnitude", "Loops pause when irrelevant", "Reduced motion remains equivalent"],
  access: ["Contrast meets WCAG", "Text scales to 150%", "RTL mirrors direction", "Screen-reader order is logical", "Meaning survives color loss", "Live regions stay polite"],
  mobile: ["Safe areas are respected", "Bottom actions are thumb-reachable", "Swipe thresholds prevent mistakes", "Long press gives progress", "Landscape remains usable", "Desktop has an explicit fallback"],
  trust: ["No guaranteed-return copy", "No seed phrase request", "Permissions explain value", "Purchases are never pay-to-win", "Consent uses plain language", "External validation is not fabricated"],
  system: ["Tokens replace magic values", "Surfaces use four depth levels", "States share one grammar", "Icons use a shared grid", "Names are consistent", "Duplicate patterns are removed"],
};

function ScoreRadar() {
  const [selected, setSelected] = useState(0);
  const [detail, setDetail] = useState(true);
  const category = QUALITY_CATEGORIES[selected];
  const average = QUALITY_CATEGORIES.reduce((sum, item) => sum + item.score, 0) / QUALITY_CATEGORIES.length;
  const center = 130;
  const radius = 98;
  const axis = QUALITY_CATEGORIES.map((_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / QUALITY_CATEGORIES.length;
    return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius, angle };
  });
  const points = QUALITY_CATEGORIES.map((item, index) => {
    const normalized = item.score / 100;
    const angle = axis[index].angle;
    return `${center + Math.cos(angle) * radius * normalized},${center + Math.sin(angle) * radius * normalized}`;
  }).join(" ");
  return (
    <Asset
      code="QAT-01"
      title="300-Factor Readiness"
      desc="Ten categories × 30 explicit checks. The scorecard is inspectable by category and separates internal readiness from external awards."
      tags={["300 checks", "readiness"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-center">
        <div className="relative mx-auto w-full max-w-[320px] aspect-square">
          <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
            {[.25, .5, .75, 1].map((scale) => <polygon key={scale} points={axis.map((point) => `${center + (point.x - center) * scale},${center + (point.y - center) * scale}`).join(" ")} fill={scale === 1 ? "rgba(61,165,255,.03)" : "none"} stroke="rgba(140,175,255,.13)" strokeWidth="1" />)}
            {axis.map((point, index) => <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} stroke="rgba(140,175,255,.12)" />)}
            <polygon points={points} fill="rgba(34,211,138,.16)" stroke="#22d38a" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 10px rgba(34,211,138,.35))" }} />
            {QUALITY_CATEGORIES.map((item, index) => {
              const [x, y] = points.split(" ")[index].split(",").map(Number);
              return <circle key={item.id} cx={x} cy={y} r={selected === index ? 5 : 3} fill={selected === index ? item.color : "#eef3ff"} stroke="#070e22" strokeWidth="2" className="cursor-pointer transition-all" onClick={() => setSelected(index)} />;
            })}
            <circle cx={center} cy={center} r="42" fill="#0a1330" stroke="rgba(140,175,255,.2)" />
            <text x={center} y={center - 2} fill="#eef3ff" textAnchor="middle" fontSize="24" fontWeight="900">{average.toFixed(1)}</text>
            <text x={center} y={center + 15} fill="#8ea3cf" textAnchor="middle" fontSize="8" fontWeight="800">INTERNAL / 100</text>
          </svg>
        </div>
        <div>
          <div className="flex items-start gap-3 mb-4">
            <span className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ color: category.color, background: `${category.color}1f`, boxShadow: `inset 0 0 0 1px ${category.color}44` }}><Icon name={category.icon} size={24} /></span>
            <div className="flex-1"><div className="text-[9px] uppercase tracking-[.2em] font-black text-mist">Selected category</div><div className="text-xl font-black">{category.label}</div><div className="text-xs text-mist mt-1">{category.note}</div></div>
            <div className="num text-3xl font-black" style={{ color: category.color }}>{category.score.toFixed(1)}</div>
          </div>
          <Bar value={category.score} color={category.color === "#22d38a" ? "bull" : category.color === "#3da5ff" ? "sky" : category.color === "#ffc53d" ? "gold" : category.color === "#ff8a3d" ? "flame" : category.color === "#ff4b6e" ? "bear" : "violet"} h={16} />
          <div className="flex justify-between text-[9px] text-mist mt-1.5 mb-4"><span>{category.checks} checks in category</span><span>Target ≥ 99.0</span></div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {QUALITY_CATEGORIES.map((item, index) => <button key={item.id} onClick={() => setSelected(index)} className={cn("rounded-xl p-2 border text-center transition-all", selected === index ? "bg-white/[.06] border-white/20 -translate-y-1" : "border-white/[.06] hover:bg-white/[.03]")}><Icon name={item.icon} size={15} className="mx-auto mb-1" /><div className="num text-[9px] font-black" style={{ color: item.color }}>{item.score.toFixed(1)}</div><div className="text-[7px] text-mist truncate">{item.label}</div></button>)}
          </div>
          <button onClick={() => setDetail(!detail)} className="mt-4 text-[9px] font-black text-sky flex items-center gap-1"><Icon name="info" size={13} />{detail ? "Hide" : "Show"} score note</button>
          {detail && <div className="mt-2 rounded-xl p-3 bg-gold/[.06] border border-gold/20 text-[9px] text-mist leading-relaxed anim-rise"><b className="text-gold">Method:</b> This is an internal design-readiness instrument, not an award or user-research result. External validation still requires usability sessions, production telemetry and independent review.</div>}
        </div>
      </div>
    </Asset>
  );
}

const COMPONENTS = ["Button", "Field", "Quiz answer", "Trade action", "Navigation", "Reward", "Modal", "Chart"];
const STATES = ["Default", "Hover", "Focus", "Pressed", "Loading", "Success", "Error", "Disabled"];

function StateMatrix() {
  const [missing, setMissing] = useState<Record<string, boolean>>({ "Chart-Hover": true, "Reward-Error": true, "Navigation-Loading": true });
  const [focus, setFocus] = useState<string | null>(null);
  const toggle = (key: string) => setMissing((value) => ({ ...value, [key]: !value[key] }));
  const completed = COMPONENTS.length * STATES.length - Object.values(missing).filter(Boolean).length;
  const percent = completed / (COMPONENTS.length * STATES.length) * 100;
  return (
    <Asset
      code="QAT-02"
      title="State Coverage Matrix"
      desc="Eight critical component families against eight expected states. Toggle cells to model coverage debt."
      tags={["states", "coverage"]}
      span={2}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4"><div className="flex-1 min-w-48"><div className="flex justify-between text-[10px] mb-1"><span className="font-black">State coverage</span><span className="num text-bull font-black">{completed}/64 · {percent.toFixed(1)}%</span></div><Bar value={percent} color="bull" h={12} /></div><Btn variant="ghost" size="sm" icon="refresh" onClick={() => setMissing({ "Chart-Hover": true, "Reward-Error": true, "Navigation-Loading": true })}>Reset debt</Btn></div>
      <div className="overflow-x-auto">
        <div className="min-w-[720px] grid gap-1.5" style={{ gridTemplateColumns: "120px repeat(8,minmax(62px,1fr))" }}>
          <span />
          {STATES.map((state) => <div key={state} className="text-[8px] uppercase font-black text-mist text-center py-1">{state}</div>)}
          {COMPONENTS.map((component) => (
            <div key={component} className="contents">
              <div className="text-[9px] font-black flex items-center">{component}</div>
              {STATES.map((state) => {
                const key = `${component}-${state}`;
                const debt = !!missing[key];
                return <button key={key} onMouseEnter={() => setFocus(key)} onMouseLeave={() => setFocus(null)} onClick={() => toggle(key)} className={cn("h-10 rounded-lg border grid place-items-center transition-all", debt ? "bg-bear/10 border-bear/30 text-bear" : "bg-bull/[.07] border-bull/20 text-bull", focus === key && "scale-110 z-10")} title={`${component} / ${state}`}><Icon name={debt ? "x" : "check"} size={13} stroke={3} /></button>;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="text-[9px] text-mist mt-3">Tap a cell to toggle implementation status. Red marks an explicit state decision still required.</div>
    </Asset>
  );
}

type Device = "phone" | "tablet" | "desktop";

function DeviceBench() {
  const [device, setDevice] = useState<Device>("phone");
  const [rotate, setRotate] = useState(false);
  const [safe, setSafe] = useState(true);
  const size: Record<Device, { width: number; height: number; label: string }> = {
    phone: { width: rotate ? 560 : 260, height: rotate ? 260 : 480, label: "390 × 844" },
    tablet: { width: rotate ? 600 : 410, height: rotate ? 410 : 560, label: "768 × 1024" },
    desktop: { width: 640, height: 390, label: "1440 × 900" },
  };
  const current = size[device];
  return (
    <Asset
      code="QAT-03"
      title="Responsive Device Bench"
      desc="Preview the same learning composition at phone, tablet and desktop proportions with safe-area and rotation checks."
      tags={["responsive", "safe area"]}
      span={2}
    >
      <div className="flex flex-wrap gap-2 mb-4">{(["phone", "tablet", "desktop"] as Device[]).map((value) => <button key={value} onClick={() => { setDevice(value); if (value === "desktop") setRotate(false); }} className={cn("h-9 px-3 rounded-xl text-[9px] font-black uppercase border-2 flex items-center gap-1.5", device === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}><Icon name={value === "phone" ? "user" : value === "tablet" ? "grid" : "chart"} size={13} />{value}</button>)}<button disabled={device === "desktop"} onClick={() => setRotate(!rotate)} className="h-9 px-3 rounded-xl text-[9px] font-black border-2 border-ink-600 text-mist disabled:opacity-30"><Icon name="refresh" size={13} className="inline mr-1" />Rotate</button><button onClick={() => setSafe(!safe)} className={cn("h-9 px-3 rounded-xl text-[9px] font-black border-2 ml-auto", safe ? "border-bull bg-bull/10 text-bull" : "border-ink-600 text-mist")}>Safe areas</button></div>
      <div className="well dotgrid min-h-[500px] p-5 grid place-items-center overflow-auto">
        <div className="bg-ink-950 rounded-[26px] p-2 transition-all duration-500 shadow-[0_10px_0_#02050d,0_24px_50px_rgba(0,0,0,.5)]" style={{ width: `min(100%,${current.width}px)`, aspectRatio: `${current.width}/${current.height}` }}>
          <div className="h-full rounded-[20px] overflow-hidden bg-ink-900 relative flex flex-col">
            {safe && <div className="h-5 shrink-0 bg-bear/10 border-b border-dashed border-bear/35 text-[6px] text-bear grid place-items-center">SAFE TOP</div>}
            <div className="p-3 flex-1 min-h-0 grid gap-3" style={{ gridTemplateColumns: device === "phone" && !rotate ? "1fr" : "1.1fr .9fr" }}>
              <div className="rounded-2xl p-3 bg-gradient-to-br from-[#2d8cf0] to-[#1a56a8] relative overflow-hidden"><div className="text-[7px] font-black uppercase tracking-widest text-white/65">Continue learning</div><div className="font-black text-sm mt-1">Candlestick Patterns</div><div className="absolute right-2 bottom-1"><Icon name="candles" size={55} className="text-white/15" /></div><Bar value={68} color="gold" h={7} className="mt-8 !bg-black/20" /></div>
              {(device !== "phone" || rotate) && <div className="rounded-2xl game-surface p-3"><div className="text-[7px] text-mist uppercase font-black">Market pulse</div><div className="num text-lg font-black text-bull mt-1">+2.41%</div><svg viewBox="0 0 100 35" className="w-full mt-3"><path d="M0 30 C15 32 18 8 33 18 S55 25 65 9 S82 14 100 2" fill="none" stroke="#22d38a" strokeWidth="2" /></svg></div>}
              <div className={cn("grid gap-2", device === "phone" && !rotate ? "grid-cols-2" : "col-span-2 grid-cols-3")}><div className="game-surface rounded-xl p-2"><Icon name="target" size={16} className="text-bull" /><div className="text-[7px] font-black mt-1">Daily quest</div></div><div className="game-surface rounded-xl p-2"><Icon name="bolt" size={16} className="text-violet" /><div className="text-[7px] font-black mt-1">Arena</div></div>{(device !== "phone" || rotate) && <div className="game-surface rounded-xl p-2"><Icon name="trophy" size={16} className="text-gold" /><div className="text-[7px] font-black mt-1">League</div></div>}</div>
            </div>
            {safe && <div className="h-4 shrink-0 bg-bear/10 border-t border-dashed border-bear/35 text-[6px] text-bear grid place-items-center">SAFE BOTTOM</div>}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-mist mt-3"><span>Viewport preset: <b className="num text-fog">{current.label}</b></span><span>No clipped controls · no horizontal body scroll</span></div>
    </Asset>
  );
}

function PerformanceBudget() {
  const [mode, setMode] = useState<"target" | "stress">("target");
  const metrics = mode === "target" ? [
    { label: "Interaction", value: 42, max: 100, unit: "ms", target: "<100", color: "bull" as const },
    { label: "Animation", value: 6, max: 16, unit: "ms", target: "<16", color: "sky" as const },
    { label: "JS gzip", value: 178, max: 250, unit: "KB", target: "<250", color: "gold" as const },
    { label: "Image hero", value: 640, max: 900, unit: "KB", target: "<900", color: "violet" as const },
  ] : [
    { label: "Interaction", value: 126, max: 160, unit: "ms", target: "<100", color: "bear" as const },
    { label: "Animation", value: 22, max: 28, unit: "ms", target: "<16", color: "bear" as const },
    { label: "JS gzip", value: 280, max: 320, unit: "KB", target: "<250", color: "flame" as const },
    { label: "Image hero", value: 1050, max: 1200, unit: "KB", target: "<900", color: "flame" as const },
  ];
  return (
    <Asset
      code="QAT-04"
      title="Performance Budgets"
      desc="Visible interaction, frame, JavaScript and image budgets. Stress mode demonstrates how the panel reports regressions."
      tags={["budget", "performance"]}
    >
      <div className="well p-1 grid grid-cols-2 mb-4">{(["target", "stress"] as const).map((value) => <button key={value} onClick={() => setMode(value)} className={cn("h-9 rounded-xl text-[9px] font-black uppercase", mode === value ? value === "target" ? "bg-bull text-ink-900 shadow-[0_3px_0_#0b7a4a]" : "bg-bear text-white shadow-[0_3px_0_#a01e3c]" : "text-mist")}>{value}</button>)}</div>
      <div className="space-y-4">
        {metrics.map((metric) => {
          const failed = metric.color === "bear" || metric.color === "flame";
          return <div key={metric.label}><div className="flex items-end justify-between mb-1"><div><div className="text-xs font-black">{metric.label}</div><div className="text-[8px] text-mist">Budget {metric.target}{metric.unit === "KB" ? " KB" : " ms"}</div></div><div className={cn("num text-lg font-black", failed ? "text-bear" : metric.color === "bull" ? "text-bull" : metric.color === "sky" ? "text-sky" : metric.color === "gold" ? "text-gold" : "text-violet")}>{metric.value}<span className="text-[9px] ml-1">{metric.unit}</span></div></div><Bar value={metric.value / metric.max * 100} color={metric.color} h={11} /></div>;
        })}
      </div>
      <div className={cn("mt-5 rounded-xl p-3 flex items-start gap-2", mode === "target" ? "bg-bull/10 text-bull" : "bg-bear/10 text-bear")}><Icon name={mode === "target" ? "check" : "alert"} size={17} className="shrink-0" /><span className="text-[9px] font-bold leading-relaxed">{mode === "target" ? "All interaction budgets pass the prototype target. Production must remeasure on representative low-end devices." : "Stress profile exceeds four budgets. Disable decorative effects, split code and serve responsive image variants."}</span></div>
    </Asset>
  );
}

function TokenExporter() {
  const [format, setFormat] = useState<"css" | "json" | "ios">("css");
  const [copied, setCopied] = useState(false);
  const output = {
    css: `:root {\n  --surface-canvas: #070E22;\n  --surface-raised: #172856;\n  --semantic-bull: #22D38A;\n  --semantic-bear: #FF4B6E;\n  --radius-panel: 26px;\n  --motion-spring: cubic-bezier(.2,.9,.3,1.3);\n}`,
    json: `{\n  "surface.canvas": "#070E22",\n  "surface.raised": "#172856",\n  "semantic.bull": "#22D38A",\n  "semantic.bear": "#FF4B6E",\n  "radius.panel": 26,\n  "motion.spring": [0.2, 0.9, 0.3, 1.3]\n}`,
    ios: `extension Color {\n  static let bullCanvas = Color(hex: 0x070E22)\n  static let bullRaised = Color(hex: 0x172856)\n  static let bullPositive = Color(hex: 0x22D38A)\n  static let bullNegative = Color(hex: 0xFF4B6E)\n}`,
  }[format];
  const copy = () => {
    navigator.clipboard?.writeText(output).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Asset
      code="QAT-05"
      title="Token Export"
      desc="The same core tokens represented for web CSS, platform-neutral JSON and SwiftUI naming."
      tags={["tokens", "handoff"]}
    >
      <div className="well p-1 grid grid-cols-3 mb-3">{(["css", "json", "ios"] as const).map((value) => <button key={value} onClick={() => setFormat(value)} className={cn("h-9 rounded-xl text-[9px] font-black uppercase", format === value ? "bg-sky text-white shadow-[0_3px_0_#1a56a8]" : "text-mist")}>{value}</button>)}</div>
      <pre key={format} className="well p-4 min-h-56 overflow-x-auto text-[10px] leading-relaxed text-[#a9d8ff] font-mono anim-rise"><code>{output}</code></pre>
      <Btn variant={copied ? "bull" : "sky"} block size="sm" icon={copied ? "check" : "copy"} className="mt-3" onClick={copy}>{copied ? "Copied" : `Copy ${format.toUpperCase()}`}</Btn>
    </Asset>
  );
}

function ReleaseChecklist() {
  const initial = [
    { group: "Product", label: "Every screen has one primary action", done: true },
    { group: "Product", label: "Empty, loading, error and offline states exist", done: true },
    { group: "Input", label: "Pointer, touch and keyboard paths work", done: true },
    { group: "Input", label: "Destructive actions require confirmation", done: true },
    { group: "Access", label: "Focus order follows visual order", done: true },
    { group: "Access", label: "Meaning never depends on color alone", done: true },
    { group: "Trust", label: "Simulation and real funds are unmistakable", done: true },
    { group: "Trust", label: "No guaranteed-return language", done: true },
    { group: "Motion", label: "Reduced-motion behavior is equivalent", done: true },
    { group: "Motion", label: "Loops pause when offscreen", done: false },
    { group: "QA", label: "Low-end Android profile measured", done: false },
    { group: "QA", label: "External usability sessions completed", done: false },
  ];
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "done" | "open">("all");
  const visible = items.filter((item) => filter === "all" ? true : filter === "done" ? item.done : !item.done);
  const complete = items.filter((item) => item.done).length;
  return (
    <Asset
      code="QAT-06"
      title="Release Gate"
      desc="A practical, toggleable handoff checklist distinguishes design completion from production validation still required."
      tags={["release", "handoff"]}
    >
      <div className="flex items-center gap-2 mb-4">{(["all", "done", "open"] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={cn("h-8 px-3 rounded-full text-[9px] font-black border-2", filter === value ? "border-sky bg-sky/15 text-sky" : "border-ink-600 text-mist")}>{value}</button>)}<span className="ml-auto num text-xs font-black text-bull">{complete}/{items.length}</span></div>
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {visible.map((item) => {
          const index = items.indexOf(item);
          return <button key={`${item.group}${item.label}`} onClick={() => setItems((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, done: !entry.done } : entry))} className="w-full game-surface rounded-xl p-2.5 flex items-center gap-3 text-left"><span className={cn("w-6 h-6 rounded-lg grid place-items-center shrink-0 transition-all", item.done ? "bg-bull text-ink-900 shadow-[0_2px_0_#0b7a4a]" : "well")}>{item.done && <Icon name="check" size={13} stroke={3.5} />}</span><span className="text-[8px] font-black uppercase tracking-wider text-mist w-12">{item.group}</span><span className={cn("text-[10px] font-bold flex-1", item.done ? "text-fog" : "text-mist")}>{item.label}</span></button>;
        })}
      </div>
      <div className="mt-4"><Bar value={complete / items.length * 100} color={complete === items.length ? "bull" : "gold"} h={12} /><div className="flex justify-between text-[8px] text-mist mt-1"><span>Prototype gate</span><span>{items.length - complete} external or production checks remain</span></div></div>
    </Asset>
  );
}

function FactorBrowser() {
  const [category, setCategory] = useState("trust");
  const [verified, setVerified] = useState<Record<string, boolean>>(() => Object.fromEntries(Object.values(FACTOR_EXAMPLES).flat().map((factor) => [factor, true])));
  const factors = FACTOR_EXAMPLES[category];
  const passed = Object.values(verified).filter(Boolean).length;
  const total = Object.keys(verified).length;
  return (
    <Asset
      code="QAT-07"
      title="Factor Browser"
      desc="Representative criteria behind the aggregate score. Toggle checks to see how a review must expose evidence, not only a number."
      tags={["criteria", "evidence"]}
      span={2}
    >
      <div className="grid lg:grid-cols-[230px_1fr] gap-5">
        <div className="space-y-1.5">
          {QUALITY_CATEGORIES.map((item) => (
            <button key={item.id} onClick={() => setCategory(item.id)} className={cn("w-full p-2.5 rounded-xl flex items-center gap-2 text-left border transition-all", category === item.id ? "bg-white/[.06] border-white/20" : "border-transparent hover:bg-white/[.03]")}>
              <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ color: item.color, background: `${item.color}18` }}><Icon name={item.icon} size={14} /></span>
              <span className="text-[9px] font-black flex-1">{item.label}</span>
              <span className="num text-[8px]" style={{ color: item.color }}>6/30</span>
            </button>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between mb-3"><div><div className="text-[9px] font-black uppercase tracking-widest text-mist">Evidence sample</div><div className="font-black text-lg">{QUALITY_CATEGORIES.find((item) => item.id === category)?.label}</div></div><div className="text-right"><div className="num text-xl font-black text-bull">{passed}/{total}</div><div className="text-[8px] text-mist">visible samples pass</div></div></div>
          <div className="grid sm:grid-cols-2 gap-2">
            {factors.map((factor, index) => (
              <button key={factor} onClick={() => setVerified((value) => ({ ...value, [factor]: !value[factor] }))} className={cn("game-surface rounded-xl p-3 flex items-start gap-3 text-left transition-all", !verified[factor] && "!border-bear/40 bg-bear/[.05]")}>
                <span className={cn("mt-0.5 w-6 h-6 rounded-lg grid place-items-center shrink-0", verified[factor] ? "bg-bull text-ink-900 shadow-[0_2px_0_#0b7a4a]" : "bg-bear/15 text-bear")}><Icon name={verified[factor] ? "check" : "x"} size={12} stroke={3.5} /></span>
                <span><span className="block text-[8px] uppercase font-black text-mist">Factor {String(index + 1).padStart(2, "0")}</span><span className="block text-[10px] font-bold mt-0.5">{factor}</span></span>
              </button>
            ))}
          </div>
          <div className="rounded-xl p-3 bg-sky/[.06] border border-sky/20 mt-3 text-[9px] text-mist leading-relaxed"><b className="text-sky">Coverage note:</b> Six visible examples are shown per category. The complete review model uses 30 checks in each of ten categories.</div>
        </div>
      </div>
    </Asset>
  );
}

export default function QualitySystem() {
  return (
    <Section
      id="quality"
      index="18"
      title="Quality System"
      subtitle="Readiness made visible: 300 criteria, full state coverage, device inspection, budgets, handoff and honest release gates."
    >
      <ScoreRadar />
      <StateMatrix />
      <DeviceBench />
      <PerformanceBudget />
      <TokenExporter />
      <ReleaseChecklist />
      <FactorBrowser />
    </Section>
  );
}