import { useMemo, useRef, useState } from "react";
import { Asset, Btn, Chip, Label, Section, SubHead, haptic } from "../components/ui";
import { CoinIcon, GemIcon, Icon, XPIcon } from "../components/icons";
import { sfx, type SfxName } from "../lib/sound";
import { fx } from "../lib/game";
import { cn } from "../utils/cn";

/* =====================================================================
 * PG-01 · BUTTON CONFIGURATOR — live 3D button lab + CSS export
 * ===================================================================== */
const FACES = ["#22d39a", "#ff4d6d", "#ffc23d", "#3e8bff", "#9170ff", "#ff7a2f", "#1a2f5f", "#e3eaf8"];
function ButtonLab() {
  const [face, setFace] = useState("#22d39a");
  const [depth, setDepth] = useState(5);
  const [radius, setRadius] = useState(16);
  const [label, setLabel] = useState("Claim reward");
  const [icon, setIcon] = useState(true);
  const [upper, setUpper] = useState(true);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [copied, setCopied] = useState(false);
  const dark = ["#22d39a", "#ffc23d", "#e3eaf8"].includes(face);
  const css = `.btn {\n  --face: ${face};\n  --depth: ${depth}px;\n  border-radius: ${radius}px;\n  box-shadow: 0 var(--depth) 0 color-mix(in srgb, var(--face) 45%, black),\n    inset 0 2px 0 rgba(255,255,255,.28);\n}\n.btn:active { transform: translateY(var(--depth)); }`;
  const sz = { sm: "h-10 px-4 text-xs", md: "h-12 px-5 text-sm", lg: "h-14 px-7 text-base" }[size];
  return (
    <Asset title="Button Configurator" code="PG-01" tags="button configurator lab css export playground customize 3d" span={6} badge="Lab">
      <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl bg-ink-950/40 p-6">
          <button
            className={cn("btn3d", sz, upper && "uppercase")}
            style={{ ["--face" as string]: face, ["--lip" as string]: `color-mix(in srgb, ${face} 45%, black)`, ["--ink" as string]: dark ? (face === "#e3eaf8" ? "#0d1a3d" : "#03281b") : "#fff", ["--depth" as string]: `${depth}px`, borderRadius: radius }}
            onClick={() => {
              haptic();
              sfx("pop");
            }}
          >
            {icon && <CoinIcon size={20} />}
            {label || "Button"}
          </button>
          <div className="flex gap-1.5">
            {(["sm", "md", "lg"] as const).map((s) => (
              <button key={s} onClick={() => setSize(s)} className={cn("rounded-lg px-2.5 py-1 text-[11px] font-black uppercase", size === s ? "bg-white/15 text-white" : "text-ink-400 hover:text-white")}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Face color</Label>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-4">
              {FACES.map((f) => (
                <button key={f} onClick={() => { setFace(f); sfx("tick"); }} className={cn("h-8 rounded-lg transition-transform hover:scale-110", face === f && "ring-2 ring-white ring-offset-2 ring-offset-ink-800")} style={{ background: f }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Depth · {depth}px</Label>
            <input type="range" min={0} max={10} value={depth} onChange={(e) => setDepth(+e.target.value)} className="w-full" style={{ accentColor: "#22d39a" }} />
          </div>
          <div>
            <Label>Radius · {radius}px</Label>
            <input type="range" min={4} max={32} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full" style={{ accentColor: "#3e8bff" }} />
          </div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="panel-inset h-10 w-full rounded-xl px-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-azure" />
          <div className="flex gap-2">
            <button onClick={() => setIcon((v) => !v)} className={cn("flex-1 rounded-xl py-1.5 text-[11px] font-black uppercase", icon ? "bg-white/10 text-white" : "text-ink-500")}>
              Icon {icon ? "on" : "off"}
            </button>
            <button onClick={() => setUpper((v) => !v)} className={cn("flex-1 rounded-xl py-1.5 text-[11px] font-black uppercase", upper ? "bg-white/10 text-white" : "text-ink-500")}>
              Caps {upper ? "on" : "off"}
            </button>
          </div>
        </div>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-2xl bg-black/50 p-3">
        <pre className="overflow-x-auto font-mono text-[11px] leading-relaxed text-cyan-200">{css}</pre>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(css).catch(() => {});
            setCopied(true);
            sfx("success");
            setTimeout(() => setCopied(false), 1400);
          }}
          className="absolute right-2 top-2 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-black uppercase text-white transition hover:bg-white/20"
        >
          {copied ? "Copied ✓" : "Copy CSS"}
        </button>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * PG-02 · EASING VISUALIZER — curves, race track, spring tuning
 * ===================================================================== */
const EASES: { n: string; f: (t: number) => number; c: string }[] = [
  { n: "linear", f: (t) => t, c: "#8ea4d2" },
  { n: "outCubic", f: (t) => 1 - Math.pow(1 - t, 3), c: "#3e8bff" },
  { n: "outBack", f: (t) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, c: "#22d39a" },
  { n: "outElastic", f: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1), c: "#ffc23d" },
  { n: "inOutCubic", f: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), c: "#9170ff" },
  { n: "bounce", f: (t) => { const n1 = 7.5625; const d1 = 2.75; if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75; if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375; return n1 * (t -= 2.625 / d1) * t + 0.984375; }, c: "#ff4d6d" },
];
function EasingLab() {
  const [sel, setSel] = useState(2);
  const [run, setRun] = useState(0);
  const [dur, setDur] = useState(1200);
  const E = EASES[sel];
  const curve = useMemo(() => Array.from({ length: 60 }, (_, i) => E.f(i / 59)), [E]);
  const W = 260;
  const H = 140;
  const path = curve.map((v, i) => `${i ? "L" : "M"}${(i / 59) * W},${H - 8 - Math.min(1.25, Math.max(-0.25, v)) * (H - 16)}`).join("");
  return (
    <Asset title="Easing Visualizer" code="PG-02" tags="easing curve visualizer animation timing race playground" span={6} badge="Lab">
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <div className="flex flex-wrap gap-1.5">
            {EASES.map((e, i) => (
              <button key={e.n} onClick={() => { setSel(i); sfx("select"); }} className={cn("rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition", sel === i ? "text-white" : "text-ink-400 hover:text-white")} style={sel === i ? { background: e.c } : undefined}>
                {e.n}
              </button>
            ))}
          </div>
          <div className="panel-inset relative mt-3 overflow-hidden rounded-2xl">
            <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
              {[0.25, 0.5, 0.75, 1].map((g) => (
                <line key={g} x1="0" x2={W} y1={H - 8 - g * (H - 16)} y2={H - 8 - g * (H - 16)} stroke="#16295a" strokeDasharray={g === 1 ? "none" : "3 4"} />
              ))}
              <path d={path} fill="none" stroke={E.c} strokeWidth="3" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${E.c})` }} />
              <circle cx="4" cy={H - 8} r="4" fill={E.c} />
              <circle cx={W - 4} cy={H - 8 - (H - 16)} r="4" fill={E.c} />
            </svg>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Label className="mb-0">Duration</Label>
            <input type="range" min={300} max={2500} step={100} value={dur} onChange={(e) => setDur(+e.target.value)} className="flex-1" style={{ accentColor: E.c }} />
            <span className="font-mono text-xs font-bold text-white">{dur}ms</span>
            <Btn variant="azure" size="sm" onClick={() => { setRun((r) => r + 1); sfx("whoosh"); }}>
              Race!
            </Btn>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Race track</Label>
          {EASES.map((e, i) => (
            <div key={e.n} className="flex items-center gap-2">
              <span className="w-16 truncate font-mono text-[10px] text-ink-400">{e.n}</span>
              <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-ink-950/60">
                <span
                  key={run}
                  className="absolute top-1 h-4 w-4 rounded-full"
                  style={{ background: e.c, boxShadow: `0 0 8px ${e.c}`, left: 2, animation: `race-${i} ${dur}ms forwards` }}
                />
                <style>{`@keyframes race-${i} { ${Array.from({ length: 11 }, (_, k) => `${k * 10}%{left:calc(${(e.f(k / 10) * 100).toFixed(1)}% - 8px)}`).join("")} }`}</style>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * PG-03 · ELEVATION LAB — depth, blur, lip color explorer
 * ===================================================================== */
function ElevationLab() {
  const [depth, setDepth] = useState(6);
  const [blur, setBlur] = useState(22);
  const [lift, setLift] = useState(0);
  const [pressed, setPressed] = useState(false);
  return (
    <Asset title="Elevation Lab" code="PG-03" tags="elevation shadow depth blur lab playground surface" span={4}>
      <div className="flex h-[190px] items-center justify-center rounded-2xl bg-ink-950/40">
        <div
          className="flex h-28 w-40 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-b from-[#213a72] to-[#1a2f5f] font-display text-sm font-black text-white transition-all"
          style={{
            transform: `translateY(${-lift + (pressed ? depth : 0)}px)`,
            boxShadow: pressed
              ? "inset 0 4px 10px rgba(0,0,0,.6)"
              : `0 ${depth}px 0 #081231, 0 ${depth + blur}px ${blur * 2}px -18px rgba(0,0,0,.75), inset 0 1px 0 rgba(255,255,255,.12)`,
          }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
        >
          {depth}px
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <Label>Lip depth · {depth}px</Label>
          <input type="range" min={0} max={16} value={depth} onChange={(e) => setDepth(+e.target.value)} className="w-full" style={{ accentColor: "#22d39a" }} />
        </div>
        <div>
          <Label>Ambient blur · {blur}px</Label>
          <input type="range" min={0} max={60} value={blur} onChange={(e) => setBlur(+e.target.value)} className="w-full" style={{ accentColor: "#3e8bff" }} />
        </div>
        <div>
          <Label>Hover lift · {lift}px</Label>
          <input type="range" min={0} max={20} value={lift} onChange={(e) => setLift(+e.target.value)} className="w-full" style={{ accentColor: "#ffc23d" }} />
        </div>
      </div>
      <div className="mt-3 rounded-xl bg-black/40 p-2 font-mono text-[10px] text-cyan-200">
        box-shadow: 0 {depth}px 0 #081231, 0 {depth + blur}px {blur * 2}px -18px rgba(0,0,0,.75)
      </div>
    </Asset>
  );
}

/* =====================================================================
 * PG-04 · SOUND BOARD — every SFX with pitch + combo tester
 * ===================================================================== */
const SFX_LIST: { n: SfxName; d: string; c: string }[] = [
  { n: "tap", d: "UI tap", c: "#8ea4d2" },
  { n: "select", d: "Select", c: "#3e8bff" },
  { n: "pop", d: "Pop", c: "#22d39a" },
  { n: "success", d: "Win arpeggio", c: "#22d39a" },
  { n: "error", d: "Error buzz", c: "#ff4d6d" },
  { n: "coin", d: "Coin ding", c: "#ffc23d" },
  { n: "gem", d: "Gem shimmer", c: "#2fd4ff" },
  { n: "whoosh", d: "Whoosh", c: "#9170ff" },
  { n: "swipe", d: "Swipe", c: "#9170ff" },
  { n: "levelup", d: "Level fanfare", c: "#ffc23d" },
  { n: "tick", d: "Tick", c: "#8ea4d2" },
  { n: "flip", d: "Card flip", c: "#3e8bff" },
  { n: "unlock", d: "Unlock", c: "#22d39a" },
  { n: "hit", d: "Impact", c: "#ff7a2f" },
  { n: "combo", d: "Combo", c: "#ff7a2f" },
  { n: "lose", d: "Defeat", c: "#ff4d6d" },
  { n: "countdown", d: "Beep", c: "#ffc23d" },
  { n: "go", d: "GO!", c: "#22d39a" },
  { n: "charge", d: "Charge", c: "#9170ff" },
  { n: "open", d: "Chest open", c: "#ffc23d" },
];
function SoundBoard() {
  const [pitch, setPitch] = useState(1);
  const [last, setLast] = useState<SfxName | null>(null);
  const play = (n: SfxName) => {
    sfx(n, pitch);
    setLast(n);
  };
  const fanfare = () => {
    (["countdown", "countdown", "countdown", "go"] as SfxName[]).forEach((s, i) => setTimeout(() => play(s), i * 450));
    setTimeout(() => play("levelup"), 2000);
    setTimeout(() => play("open"), 2600);
  };
  return (
    <Asset title="Sound Board" code="PG-04" tags="sound board sfx audio test pitch fanfare playground" span={8} badge="Audio">
      <div className="mb-3 flex items-center gap-3">
        <Label className="mb-0">Pitch</Label>
        <input type="range" min={50} max={200} value={pitch * 100} onChange={(e) => setPitch(+e.target.value / 100)} className="max-w-[220px] flex-1" style={{ accentColor: "#ffc23d" }} />
        <span className="font-mono text-xs font-bold text-gold">{pitch.toFixed(2)}×</span>
        <Btn variant="violet" size="sm" className="ml-auto" onClick={fanfare}>
          ▶ Play fanfare
        </Btn>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {SFX_LIST.map((s) => (
          <button
            key={s.n}
            onClick={() => play(s.n)}
            className={cn("rounded-2xl border-2 p-2.5 text-left transition-all hover:-translate-y-0.5 active:translate-y-0.5", last === s.n ? "border-white/60 bg-white/10" : "border-transparent bg-ink-850 hover:bg-ink-800")}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: s.c }}>
              <Icon name={s.n === "coin" ? "wallet" : s.n === "gem" ? "sparkle" : s.n === "levelup" ? "trophy" : s.n === "error" || s.n === "lose" ? "x" : s.n === "hit" ? "bolt" : "volume"} size={16} />
            </span>
            <div className="mt-1.5 font-mono text-[11px] font-bold text-white">{s.n}</div>
            <div className="text-[10px] font-semibold text-ink-400">{s.d}</div>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * PG-05 · HAPTICS LAB — vibration patterns tester (mobile)
 * ===================================================================== */
const PATTERNS = [
  { n: "Tap", p: [10], d: "Buttons" },
  { n: "Select", p: [15, 40, 15], d: "Toggles" },
  { n: "Success", p: [20, 60, 40], d: "Correct" },
  { n: "Error", p: [80], d: "Wrong" },
  { n: "Coin", p: [10, 30, 10, 30, 30], d: "Reward" },
  { n: "Impact", p: [60, 40, 90], d: "Hit" },
  { n: "Fanfare", p: [30, 50, 30, 50, 30, 50, 120], d: "Level up" },
  { n: "Heartbeat", p: [40, 120, 60], d: "Low HP" },
];
function HapticsLab() {
  const [supported] = useState(() => typeof navigator !== "undefined" && "vibrate" in navigator);
  const [last, setLast] = useState<string | null>(null);
  const fire = (n: string, p: number[]) => {
    try {
      navigator.vibrate?.(p);
    } catch {
      /* noop */
    }
    setLast(n);
    sfx("tick");
  };
  return (
    <Asset title="Haptics Lab" code="PG-05" tags="haptics vibration mobile patterns test playground" span={4}>
      <div className="mb-3 flex items-center gap-2">
        <Chip tone={supported ? "bull" : "bear"}>{supported ? "● Vibration API" : "○ Not supported"}</Chip>
        <span className="text-[11px] font-bold text-ink-500">Best on a real phone</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PATTERNS.map((p) => (
          <button
            key={p.n}
            onClick={() => fire(p.n, p.p)}
            className={cn("rounded-2xl border-2 p-3 text-left transition active:translate-y-0.5", last === p.n ? "anim-pop border-bull bg-bull/10" : "border-ink-600 bg-ink-850 hover:bg-ink-800")}
          >
            <div className="text-sm font-extrabold text-white">{p.n}</div>
            <div className="text-[10px] font-bold text-ink-400">{p.d}</div>
            <div className="mt-2 flex h-3 items-center gap-[3px]">
              {p.p.map((ms, i) =>
                i % 2 === 0 ? (
                  <span key={i} className="h-full rounded-sm bg-cyan" style={{ width: Math.max(4, ms / 4) }} />
                ) : (
                  <span key={i} style={{ width: Math.max(2, ms / 12) }} />
                ),
              )}
            </div>
          </button>
        ))}
      </div>
    </Asset>
  );
}

/* =====================================================================
 * PG-06 · REWARD SIMULATOR — preview fly-to-HUD for any currency
 * ===================================================================== */
function RewardSim() {
  const [kind, setKind] = useState<"xp" | "gems" | "coins" | "hearts">("coins");
  const [amt, setAmt] = useState(100);
  const boxRef = useRef<HTMLDivElement>(null);
  const fire = (e: React.MouseEvent) => {
    e.stopPropagation();
    fx.fly(kind, e.currentTarget, 8);
    fx.text(e.currentTarget, `+${amt}`, { xp: "#ffc23d", gems: "#2fd4ff", coins: "#ffd35a", hearts: "#ff4d6d" }[kind]);
    sfx(kind === "gems" ? "gem" : kind === "coins" ? "coin" : "pop");
  };
  return (
    <Asset title="Reward FX Simulator" code="PG-06" tags="reward fly hud simulator preview currency burst playground" span={4}>
      <div ref={boxRef} onClick={fire} className="relative flex h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-ink-950/40">
        <div className="text-[11px] font-black uppercase tracking-widest text-ink-400">Click anywhere</div>
        <div className="mt-1 flex items-center gap-2 font-display text-3xl font-black text-white">
          {kind === "xp" ? <XPIcon size={34} /> : kind === "gems" ? <GemIcon size={34} /> : <CoinIcon size={34} />}
          +{amt}
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {(["xp", "gems", "coins", "hearts"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cn("flex-1 rounded-xl py-1.5 text-[11px] font-black uppercase transition", kind === k ? "bg-white/15 text-white" : "text-ink-400 hover:text-white")}>
            {k}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Label className="mb-0">Amount</Label>
        <input type="range" min={5} max={500} step={5} value={amt} onChange={(e) => setAmt(+e.target.value)} className="flex-1" style={{ accentColor: "#ffc23d" }} />
        <span className="font-mono text-xs font-bold text-gold">{amt}</span>
      </div>
    </Asset>
  );
}

/* =====================================================================
 * PG-07 · PALETTE MIXER — generate ramps from any base color
 * ===================================================================== */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d ? (l > 0.5 ? d / (2 - max - min) : d / (max + min)) : 0;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}
function PaletteMixer() {
  const [base, setBase] = useState("#3e8bff");
  const [copied, setCopied] = useState<string | null>(null);
  const [h, s] = hexToHsl(base);
  const ramp = [8, 16, 26, 38, 52, 66, 80, 90].map((l) => `hsl(${Math.round(h)} ${Math.round(s)}% ${l}%)`);
  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex).catch(() => {});
    setCopied(hex);
    sfx("tick");
    setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1200);
  };
  return (
    <Asset title="Palette Mixer" code="PG-07" tags="palette color mixer ramp shades generator playground" span={4}>
      <div className="flex items-center gap-3">
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-12 w-16 cursor-pointer rounded-xl bg-transparent" />
        <div>
          <div className="font-mono text-lg font-bold text-white">{base.toUpperCase()}</div>
          <div className="text-[11px] font-bold text-ink-400">
            H {Math.round(h)}° · S {Math.round(s)}%
          </div>
        </div>
        <div className="ml-auto flex gap-1.5">
          {["#22d39a", "#ff4d6d", "#ffc23d", "#9170ff"].map((c) => (
            <button key={c} onClick={() => setBase(c)} className="h-7 w-7 rounded-lg transition-transform hover:scale-110" style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-8 gap-1.5">
        {ramp.map((c, i) => (
          <button key={i} onClick={() => copy(c)} className="group/r relative h-20 rounded-xl transition-transform hover:-translate-y-1" style={{ background: c }}>
            {copied === c && <span className="anim-pop absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-white">✓</span>}
          </button>
        ))}
      </div>
      <div className="mt-2 text-[11px] font-bold text-ink-500">Tap a shade to copy · hues stay locked to base</div>
    </Asset>
  );
}

export default function Playground() {
  return (
    <Section id="playground" kicker="Tune every pixel" title="Playground" desc="Live labs for tuning buttons, motion, shadows, sound, haptics and rewards. Change a slider — copy the CSS.">
      <SubHead icon="grid" title="Component labs" desc="Buttons, elevation and color systems" tone="#22d39a" count={3} />
      <ButtonLab />
      <ElevationLab />
      <PaletteMixer />
      <SubHead icon="sparkle" title="Motion & feedback labs" desc="Easing curves, SFX, haptics and reward FX" tone="#9170ff" count={4} />
      <EasingLab />
      <SoundBoard />
      <HapticsLab />
      <RewardSim />
    </Section>
  );
}
