import { useMemo, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Label, Segmented, Toggle, type Variant } from "../components/ui";
import { CoinArt } from "../components/art";
import { useDrag } from "../lib/gestures";
import { tap, notify, clamp } from "../lib/fx";
import { cn } from "../utils/cn";

/* ——— Design tokens: single object → CSS / JSON / Tailwind ——— */
export const TOKENS = {
  color: {
    ink: { 950: "#050B1C", 900: "#081229", 800: "#11203F", 700: "#1B305C", 500: "#30508F", 300: "#7D93C6", 100: "#DFE7FA" },
    bull: { base: "#2BE38B", sole: "#12A25E" },
    bear: { base: "#FF4D6D", sole: "#BF2345" },
    gold: { base: "#FFC940", sole: "#C98A08" },
    sky: { base: "#3D9BFF", sole: "#1B5FC9" },
    violet: { base: "#9A6BFF", sole: "#5F35C9" },
    flame: { base: "#FF8A3D", sole: "#C9521A" },
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 24, full: 999 },
  space: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32 },
  sole: { press: 5, tile: 4, panel: 6 },
  motion: { spring: "cubic-bezier(.34,1.56,.64,1)", out: "cubic-bezier(.22,1,.36,1)", press: "90ms", screen: "380ms" },
  font: { display: "Unbounded", body: "Manrope", mono: "JetBrains Mono" },
};

type Flat = [string, string | number][];
function flatten(o: object, pre = ""): Flat {
  return Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? flatten(v as object, `${pre}${k}-`) : [[`${pre}${k}`, v as string | number] as [string, string | number]]));
}

function hl(line: string, mode: "css" | "json" | "tw") {
  // tiny syntax highlighter → spans
  const parts: { t: string; c?: string }[] = [];
  const re = mode === "css" ? /(--[\w-]+)|(#[0-9A-Fa-f]{6})|(\d+(?:px|ms)?)|(\/\*.*\*\/)|([{}:;])/g : /("[\w-]+")(?=:)|("[^"]*")|(\b\d+\b)|(\/\/.*)|([{}[\],:])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push({ t: line.slice(last, m.index) });
    const cls = m[1] ? "k" : m[2] ? "s" : m[3] ? "n" : m[4] ? "c" : "p";
    parts.push({ t: m[0], c: cls });
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push({ t: line.slice(last) });
  return parts;
}

/* ═══════════════ Z01 — Token export ═══════════════ */
export function TokenExport() {
  const [mode, setMode] = useState<"css" | "json" | "tw">("css");
  const code = useMemo(() => {
    const flat = flatten(TOKENS);
    if (mode === "css") return [":root {", "  /* TradeLingo tokens v1 */", ...flat.map(([k, v]) => `  --tl-${k}: ${typeof v === "number" && !k.startsWith("font") ? v + "px" : v};`), "}"].join("\n");
    if (mode === "json") return JSON.stringify(TOKENS, null, 2);
    return ["// tailwind v4 · @theme", "@theme {", ...flat.filter(([k]) => k.startsWith("color")).map(([k, v]) => `  --${k}: ${v};`), ...Object.entries(TOKENS.radius).map(([k, v]) => `  --radius-${k}: ${v}px;`), "}"].join("\n");
  }, [mode]);
  const lines = code.split("\n");
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Segmented className="w-64" value={mode} onChange={setMode} options={[{ v: "css", label: "CSS" }, { v: "json", label: "JSON" }, { v: "tw", label: "Tailwind" }]} />
        <span className="font-mono text-[11px] text-ink-400">{flatten(TOKENS).length} токенов · {lines.length} строк</span>
        <Btn s="sm" v="sky" icon="copy" className="ml-auto" onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); notify(`Токены ${mode.toUpperCase()} скопированы`, "success"); }}>Копировать</Btn>
      </div>
      <div className="code mt-3 max-h-80 overflow-auto rounded-2xl bg-ink-950 p-4 ring-1 ring-white/5">
        {lines.map((l, i) => (
          <div key={i} className="flex hover:bg-white/[.03]">
            <span className="mr-4 w-6 shrink-0 select-none text-right text-ink-600">{i + 1}</span>
            <span className="whitespace-pre text-ink-200">{hl(l, mode).map((p, j) => <span key={j} className={p.c}>{p.t}</span>)}</span>
            {mode !== "json" && /#[0-9A-F]{6}/i.test(l) && <span className="ml-2 mt-1 inline-block size-3 shrink-0 rounded-sm ring-1 ring-white/20" style={{ background: l.match(/#[0-9A-F]{6}/i)![0] }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ Z02 — Anatomy with redlines ═══════════════ */
export function Anatomy() {
  const [lines, setLines] = useState(true);
  const [part, setPart] = useState<string | null>(null);
  const parts = [["face", "Лицо · градиент +14% → base"], ["gloss", "Блик · 38% высоты, white 35%"], ["sole", "Подошва · 5px, тон −30%"], ["shadow", "Тень · y+13 blur 18"], ["label", "Лейбл · Unbounded 700, 12px, +4% трекинг"]];
  return (
    <div className="grid gap-5 sm:grid-cols-[1.3fr_1fr]">
      <div className="well grid-bg relative flex h-64 items-center justify-center">
        <div className="relative">
          <button className="btn3d h-14 w-56 text-xs" onClick={() => tap()}>
            <span className={cn("transition-opacity", part && part !== "label" && "opacity-40")}>Проверить</span>
          </button>
          {part === "gloss" && <span className="pointer-events-none absolute left-[10px] right-[10px] top-1 h-[38%] rounded-xl ring-2 ring-[#ff4d9a]" />}
          {part === "sole" && <span className="pointer-events-none absolute -bottom-[5px] left-0 right-0 h-[7px] rounded-b-2xl ring-2 ring-[#ff4d9a]" />}
          {part === "face" && <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-[#ff4d9a]" />}
          {part === "shadow" && <span className="pointer-events-none absolute -bottom-6 left-2 right-2 h-6 rounded-full ring-2 ring-dashed ring-[#ff4d9a]" />}
          {lines && (
            <>
              <div className="redline h" style={{ left: 0, right: 0, top: -22, height: 12 }}><span className="absolute left-1/2 -translate-x-1/2 -top-0.5">224</span></div>
              <div className="redline v" style={{ top: 0, bottom: 0, right: -30, width: 12 }}><span className="absolute top-1/2 -translate-y-1/2 left-3">56</span></div>
              <div className="redline h" style={{ left: 0, width: 24, top: 22, height: 12 }}><span className="absolute -bottom-3 left-0">24</span></div>
              <div className="redline v" style={{ bottom: -5, height: 5, left: -18, width: 12 }}><span className="absolute -left-4 -top-1">5</span></div>
              <div className="absolute -left-10 -top-10 font-mono text-[9px] font-bold text-[#ff4d9a]">r 16</div>
            </>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between"><Label className="mb-0">Анатомия 3D-кнопки</Label><Toggle on={lines} onChange={setLines} tone="bear" label="Размеры" /></div>
        <div className="mt-3 space-y-1.5">
          {parts.map(([k, d], i) => (
            <button key={k} onMouseEnter={() => setPart(k)} onMouseLeave={() => setPart(null)} onFocus={() => setPart(k)} onBlur={() => setPart(null)} onClick={() => tap("tick")}
              className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors", part === k ? "bg-[#ff4d9a]/15" : "bg-ink-850")}>
              <span className="flex size-6 items-center justify-center rounded-full bg-[#ff4d9a] font-mono text-[10px] font-black text-white">{i + 1}</span>
              <span className="text-[12px] font-semibold">{d}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Z03 — Variant × state matrix ═══════════════ */
export function StateMatrix() {
  const vs: Variant[] = ["bull", "sky", "bear", "gold", "violet", "ink"];
  const states = ["default", "pressed", "loading", "disabled"] as const;
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[520px] gap-3" style={{ gridTemplateColumns: "72px repeat(4, 1fr)" }}>
        <span />
        {states.map((s) => <span key={s} className="text-center font-mono text-[10px] font-bold uppercase text-ink-400">{s}</span>)}
        {vs.map((v) => (
          <div key={v} className="contents">
            <span className="self-center font-mono text-[11px] font-bold text-ink-300">{v}</span>
            {states.map((s) => (
              <div key={s} className="flex justify-center pb-1">
                <Btn s="sm" v={v} className="w-full" data-pressed={s === "pressed" ? "true" : undefined} loading={s === "loading"} disabled={s === "disabled"}>{s === "loading" ? "" : "Купить"}</Btn>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-ink-400">24 комбинации из одного класса <code className="rounded bg-ink-850 px-1 font-mono">.btn3d</code> + модификатор цвета через 3 CSS-переменные.</div>
    </div>
  );
}

/* ═══════════════ Z04 — Light model: drag the sun ═══════════════ */
export function LightModel() {
  const box = useRef<HTMLDivElement>(null);
  const [sun, setSun] = useState({ x: 0.25, y: 0.15 });
  const [depth, setDepth] = useState(8);
  const d = useDrag({
    threshold: 0,
    onMove: (i) => {
      const r = box.current!.getBoundingClientRect();
      setSun({ x: clamp((i.x - r.left) / r.width, 0, 1), y: clamp((i.y - r.top) / r.height, 0, 1) });
    },
  });
  const ox = (0.5 - sun.x) * depth * 2.2, oy = (0.5 - sun.y) * depth * 2.2;
  const shadow = (k: number) => `${ox * k}px ${oy * k}px 0 #0a1430, ${ox * k * 2}px ${oy * k * 2 + 8}px ${14 * k}px -4px rgba(0,0,0,.6), inset ${-ox * 0.25}px ${-oy * 0.25}px 0 rgba(255,255,255,.12)`;
  return (
    <div>
      <div ref={box} onPointerDown={(e) => { d.onPointerDown(e); const r = box.current!.getBoundingClientRect(); setSun({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }); }}
        className="relative h-64 cursor-crosshair overflow-hidden rounded-3xl well" style={{ touchAction: "none", background: `radial-gradient(circle at ${sun.x * 100}% ${sun.y * 100}%, rgba(255,230,160,.18), transparent 55%), linear-gradient(180deg,#081330,#0b1938)` }}>
        <div className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-[#FFF6C9] to-gold shadow-[0_0_40px_12px_rgba(255,201,64,.5)]" style={{ left: `${sun.x * 100}%`, top: `${sun.y * 100}%` }} />
        <div className="absolute inset-0 flex items-center justify-center gap-6">
          {[1, 1.6, 2.4].map((k, i) => (
            <div key={k} className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-b from-ink-600 to-ink-750" style={{ boxShadow: shadow(k), transform: `translate(${-ox * k * 0.2}px, ${-oy * k * 0.2}px)` }}>
              {i === 1 ? <CoinArt size={40} /> : <Icon name={i === 0 ? "candle" : "trophy"} size={28} className="text-ink-200" />}
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-4 text-[11px] font-bold text-ink-400">Перетащи солнце — тени пересчитываются</div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Label className="mb-0 w-24">Глубина {depth}</Label>
        <div className="relative flex-1">
          <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
          <div className="absolute left-0 top-[11px] h-3 rounded-full bg-gold" style={{ width: `${(depth / 16) * 100}%` }} />
          <input type="range" className="rng relative" min={0} max={16} value={depth} onChange={(e) => setDepth(+e.target.value)} aria-label="depth" />
        </div>
      </div>
    </div>
  );
}
