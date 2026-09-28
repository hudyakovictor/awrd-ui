import { useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { burstSparks } from "../utils/fx";

/* ============ data ============ */
const GROUPS: { n: string; icons: string[] }[] = [
  { n: "Навигация", icons: ["home", "menu", "chevL", "chevR", "chevU", "chevD", "arrowUp", "arrowDown", "search", "moreH"] },
  { n: "Торговля", icons: ["candles", "chart", "trendUp", "trendDown", "wallet", "coin", "bitcoin", "swap", "target", "layers"] },
  { n: "Игра", icons: ["trophy", "crown", "gem", "star", "gift", "flame", "bolt", "heart", "shield", "sparkles"] },
  { n: "Система", icons: ["bell", "settings", "user", "users", "lock", "eye", "eyeOff", "volume", "mute", "refresh"] },
  { n: "Действия", icons: ["plus", "minus", "check", "x", "play", "copy", "send", "filter", "sort", "link"] },
  { n: "Контент", icons: ["book", "dumbbell", "clock", "calendar", "folder", "grid", "info", "warning", "logout", "brain"] },
];
const HOVER_FX = [
  { id: "lift", n: "Lift", cls: "hover:-translate-y-1.5 hover:text-blue" },
  { id: "spin", n: "Spin", cls: "hover:rotate-[20deg] hover:scale-110 hover:text-gold" },
  { id: "pop", n: "Pop", cls: "hover:scale-125 hover:text-bull" },
  { id: "shake", n: "Wiggle", cls: "hover:text-bear" },
  { id: "flip", n: "Flip", cls: "hover:[transform:rotateY(180deg)] hover:text-violet" },
  { id: "glow", n: "Glow", cls: "hover:text-cyan hover:drop-shadow-[0_0_10px_rgba(46,211,240,.9)]" },
];

/* ============ 1. ICON WALL ============ */
function IconWall() {
  const [fx, setFx] = useState("lift");
  const [size, setSize] = useState(22);
  const [stroke, setStroke] = useState(2);
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const fxCls = HOVER_FX.find((f) => f.id === fx)?.cls ?? "";
  const copy = (n: string, e: React.MouseEvent) => {
    navigator.clipboard?.writeText(`<Icon name="${n}" />`).catch(() => {});
    setCopied(n); sfx.pop();
    const r = (e.target as HTMLElement).getBoundingClientRect();
    burstSparks(r.left + r.width / 2, r.top + r.height / 2, 10);
    setTimeout(() => setCopied(null), 1200);
  };
  const filtered = GROUPS.map((g) => ({ ...g, icons: g.icons.filter((i) => i.includes(q.toLowerCase())) })).filter((g) => g.icons.length);
  return (
    <Asset title="Icon Wall · 60 icons" id="icx.wall" desc="Вся иконография: 6 hover-эффектов, размер, толщина, поиск, клик копирует код." className="lg:col-span-2">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {HOVER_FX.map((f) => <Btn3D key={f.id} size="xs" variant={fx === f.id ? "blue" : "neutral"} onClick={() => setFx(f.id)}>{f.n}</Btn3D>)}
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск иконки…" className="h-10 px-3.5 rounded-xl bg-[#0a1330] border-2 border-[#22366f] focus:border-blue outline-none text-[12.5px] font-semibold w-44" />
        <label className="text-[11px] font-bold text-dim flex items-center gap-2">Size <input type="range" min={14} max={34} value={size} onChange={(e) => setSize(+e.target.value)} className="w-24 accent-[#3d7bff]" /><span className="num w-6">{size}</span></label>
        <label className="text-[11px] font-bold text-dim flex items-center gap-2">Stroke <input type="range" min={12} max={30} value={stroke * 10} onChange={(e) => setStroke(+e.target.value / 10)} className="w-24 accent-[#8d5cff]" /><span className="num w-6">{stroke.toFixed(1)}</span></label>
        {copied && <Badge tone="bull" size="xs">copied: {copied}</Badge>}
      </div>
      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {filtered.map((g) => (
          <div key={g.n}>
            <div className="label-caps !mb-2">{g.n} · {g.icons.length}</div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {g.icons.map((n) => (
                <button key={n} title={n} onClick={(e) => copy(n, e)}
                  className={cn("aspect-square rounded-xl bg-[#101c42] border border-white/5 grid place-items-center text-mute transition-all duration-200", fxCls, copied === n && "!border-bull !text-bull")}
                  style={fx === "shake" ? undefined : { transition: "all .2s" }}
                  onMouseEnter={(e) => { if (fx === "shake") { e.currentTarget.style.animation = "wiggle .5s ease"; setTimeout(() => (e.currentTarget.style.animation = ""), 500); } }}>
                  <Icon name={n} size={size} stroke={stroke} />
                </button>
              ))}
            </div>
          </div>
        ))}
        {!filtered.length && <div className="text-center text-dim text-[13px] py-8">Ничего не найдено</div>}
      </div>
    </Asset>
  );
}

/* ============ 2. ANIMATED ICONS ============ */
function AnimatedSet() {
  const items: { n: string; i: string; anim: string; c: string }[] = [
    { n: "Bell ring", i: "bell", anim: "wiggle 1.2s ease-in-out infinite", c: "#ffc53d" },
    { n: "Spin refresh", i: "refresh", anim: "spin-slow 2s linear infinite", c: "#2ed3f0" },
    { n: "Pulse heart", i: "heart", anim: "pulse-soft 1.1s ease-in-out infinite", c: "#ff4d6a" },
    { n: "Flicker bolt", i: "bolt", anim: "flicker 1s ease-in-out infinite", c: "#ffc53d" },
    { n: "Float gift", i: "gift", anim: "floaty 2.4s ease-in-out infinite", c: "#8d5cff" },
    { n: "Twinkle star", i: "star", anim: "twinkle 1.6s ease-in-out infinite", c: "#ffe27a" },
  ];
  const [on, setOn] = useState(true);
  return (
    <Asset title="Always-Animated" id="icx.anim" desc="Иконки с бесконечной анимацией: звонок, спин, пульс, мерцание, парение, мерцание звезды.">
      <div className="grid grid-cols-3 gap-3">
        {items.map((a) => (
          <div key={a.n} className="inset !rounded-2xl h-[92px] flex flex-col items-center justify-center gap-1.5">
            <span style={{ animation: on ? a.anim : undefined, color: a.c, transformOrigin: a.i === "bell" ? "50% 0" : undefined }}><Icon name={a.i} size={28} /></span>
            <span className="text-[9px] font-extrabold text-dim uppercase">{a.n}</span>
          </div>
        ))}
      </div>
      <Btn3D size="xs" variant={on ? "gold" : "neutral"} full className="mt-3" onClick={() => setOn(!on)}>{on ? "Pause all" : "Play all"}</Btn3D>
    </Asset>
  );
}

/* ============ 3. BADGED ICONS ============ */
function BadgedIcons() {
  const [counts, setCounts] = useState<Record<string, number>>({ bell: 3, send: 12, gift: 1, trophy: 5 });
  const bump = (k: string) => { setCounts((c) => ({ ...c, [k]: c[k] + 1 })); sfx.pop(); };
  const clear = (k: string) => { setCounts((c) => ({ ...c, [k]: 0 })); sfx.tap(); };
  return (
    <Asset title="Badged Icons" id="icx.badges" desc="Иконки со счётчиками: клик +1 с поп-анимацией, правый клик — сброс.">
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(counts).map(([k, v]) => (
          <button key={k} onClick={() => bump(k)} onContextMenu={(e) => { e.preventDefault(); clear(k); }}
            className="flex flex-col items-center gap-2 group" title="клик +1 · правый клик = 0">
            <span className="relative size-14 rounded-2xl bg-[#1c3068] grid place-items-center text-mute group-hover:text-txt group-hover:-translate-y-0.5 transition-all shadow-[0_4px_0_#0b1536]">
              <Icon name={k} size={24} />
              {v > 0 && <span key={v} className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-bear text-[11px] font-extrabold grid place-items-center border-[3px] border-ink-800 num anim-pop">{v > 99 ? "99+" : v}</span>}
            </span>
            <span className="text-[9.5px] font-extrabold text-dim uppercase">{k}</span>
          </button>
        ))}
      </div>
      <div className="text-center text-[10.5px] text-dim font-bold mt-3">всего уведомлений: <span className="num text-bear">{Object.values(counts).reduce((a, b) => a + b, 0)}</span></div>
    </Asset>
  );
}

/* ============ 4. ICON BUTTON SIZES ============ */
function IconSizes() {
  const sizes = [32, 40, 48, 56, 64];
  const [v, setV] = useState("blue");
  const variants: Record<string, string> = {
    blue: "from-[#6a9dff] to-[#3d7bff] text-white shadow-[0_4px_0_#2250c2]",
    bull: "from-[#5af5b4] to-[#1fdb8b] text-[#03261a] shadow-[0_4px_0_#0d9a5c]",
    bear: "from-[#ff7c93] to-[#ff4d6a] text-white shadow-[0_4px_0_#c0253f]",
    neutral: "from-[#2a4185] to-[#1f336e] text-mute shadow-[0_4px_0_#0b1536]",
  };
  return (
    <Asset title="Icon Button Sizes" id="icx.sizes" desc="Круглые icon-кнопки 5 размеров × 4 варианта. Клик — ripple-волна.">
      <div className="flex items-end justify-center gap-3 py-3">
        {sizes.map((s) => (
          <button key={s} onClick={(e) => { sfx.tap(); const r = e.currentTarget.getBoundingClientRect(); burstSparks(r.left + r.width / 2, r.top + r.height / 2, 8); }}
            className={cn("rounded-full bg-gradient-to-b grid place-items-center transition-all hover:-translate-y-1 active:translate-y-0.5 active:scale-95", variants[v])} style={{ width: s, height: s }}>
            <Icon name="bolt" size={s * 0.42} stroke={2.4} />
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-2">
        {Object.keys(variants).map((k) => <button key={k} onClick={() => { setV(k); sfx.tick(); }} className={cn("h-8 px-3 rounded-lg text-[11px] font-extrabold capitalize", v === k ? "bg-white/10 text-txt" : "text-dim hover:text-txt")}>{k}</button>)}
      </div>
    </Asset>
  );
}

/* ============ 5. DUO-TONE ICONS ============ */
function DuoTone() {
  const [swap, setSwap] = useState(false);
  const items = ["shield", "crown", "gem", "trophy", "rocket", "gift"];
  return (
    <Asset title="Duo-tone Icons" id="icx.duo" desc="Двухслойные иконки: контур + заливка со сдвигом. Swap меняет слои местами.">
      <div className="grid grid-cols-3 gap-3">
        {items.map((n, i) => (
          <div key={n} className="inset !rounded-2xl h-[86px] grid place-items-center relative overflow-hidden group cursor-pointer" onClick={() => sfx.pop()}>
            <span className="absolute transition-transform duration-300 group-hover:translate-x-[3px] group-hover:translate-y-[3px]" style={{ color: swap ? "#3d7bff" : "#8d5cff", opacity: 0.9 }}>
              <Icon name={n} size={34} stroke={2.6} />
            </span>
            <span className="absolute transition-transform duration-300 group-hover:-translate-x-[3px] group-hover:-translate-y-[3px]" style={{ color: swap ? "#8d5cff" : "#2ed3f0", opacity: 0.65 }}>
              <Icon name={n} size={34} stroke={1.4} />
            </span>
            <span className="absolute bottom-1 text-[8.5px] font-extrabold text-dim uppercase">{n} · {i + 1}</span>
          </div>
        ))}
      </div>
      <Btn3D size="xs" variant="violet" full className="mt-3" onClick={() => { setSwap(!swap); sfx.toggle(); }}>Swap layers</Btn3D>
    </Asset>
  );
}

export default function IconFX() {
  return (
    <Section id="icons" index="33" title="Icon FX Lab" subtitle="5 групп иконок: стена 60 штук, always-animated, бейджи, размеры, duo-tone" count={5}>
      <div className="grid lg:grid-cols-3 gap-6">
        <IconWall />
        <AnimatedSet />
        <BadgedIcons />
        <IconSizes />
        <DuoTone />
      </div>
    </Section>
  );
}
