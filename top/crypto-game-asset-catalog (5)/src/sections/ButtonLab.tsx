import { useRef, useState } from "react";
import { Asset, Btn3D, Section, Spinner } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { sfx } from "../utils/sfx";
import { burstConfetti, burstSparks } from "../utils/fx";

/* ============ shared ============ */
function RippleBtn({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) {
  const [rip, setRip] = useState<{ x: number; y: number; id: number }[]>([]);
  return (
    <button
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRip((p) => [...p, { x: e.clientX - r.left, y: e.clientY - r.top, id }]);
        setTimeout(() => setRip((p) => p.filter((x) => x.id !== id)), 700);
        sfx.tap(); onClick?.(e);
      }}
      className={cn("relative overflow-hidden h-12 px-6 rounded-2xl font-extrabold text-[13px] uppercase tracking-wider text-white transition active:scale-[.97]", className)}
      style={{ background: "linear-gradient(180deg,#6a9dff,#3d7bff)", boxShadow: "0 5px 0 #2250c2, 0 14px 24px -8px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.3)" }}>
      <span className="relative z-10">{children}</span>
      {rip.map((p) => <span key={p.id} className="absolute rounded-full bg-white/50 pointer-events-none" style={{ left: p.x, top: p.y, width: 12, height: 12, marginLeft: -6, marginTop: -6, animation: "ripple .65s ease-out forwards" }} />)}
    </button>
  );
}
function Magnet({ children, str = 0.35 }: { children: React.ReactNode; str?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <div ref={ref} className="inline-block p-4 -m-4"
      onPointerMove={(e) => { const r = ref.current?.getBoundingClientRect(); if (!r) return; setT({ x: (e.clientX - (r.left + r.width / 2)) * str, y: (e.clientY - (r.top + r.height / 2)) * str }); }}
      onPointerLeave={() => setT({ x: 0, y: 0 })}>
      <div className="transition-transform duration-150 ease-out" style={{ transform: `translate(${t.x}px,${t.y}px)` }}>{children}</div>
    </div>
  );
}

/* ============ 1. HOVER FX GRID ============ */
function HoverGrid() {
  const Item = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="text-[9.5px] font-extrabold text-dim uppercase tracking-wider">{label}</span>
    </div>
  );
  return (
    <Asset title="Hover FX Grid" id="btn.hover" desc="12 эффектов наведения: shine, lift, glow, border-trace, slide-fill, skew, squeeze, neon, gradient-shift, underline-grow, icon-slide, ghost-fill." className="lg:col-span-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-6 py-2">
        <Item label="Shine sweep">
          <button className="shine h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase bg-gradient-to-b from-[#2a4185] to-[#1f336e] shadow-[0_4px_0_#0b1536] hover:-translate-y-0.5 transition">Shine</button>
        </Item>
        <Item label="Lift + shadow">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase bg-gradient-to-b from-[#5af5b4] to-[#1fdb8b] text-[#03261a] shadow-[0_4px_0_#0d9a5c] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_8px_0_#0d9a5c,0_20px_30px_rgba(31,219,139,.35)] active:translate-y-0 active:shadow-[0_1px_0_#0d9a5c]">Lift</button>
        </Item>
        <Item label="Neon glow">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase border-2 border-cyan/60 text-cyan transition-all duration-300 hover:shadow-[0_0_24px_rgba(46,211,240,.6),inset_0_0_16px_rgba(46,211,240,.25)] hover:bg-cyan/10 hover:border-cyan">Neon</button>
        </Item>
        <Item label="Slide fill">
          <button className="group relative h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase border-2 border-violet/60 text-[#b89bff] overflow-hidden transition-colors hover:text-white">
            <span className="absolute inset-0 bg-gradient-to-r from-violet to-blue origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
            <span className="relative">Fill</span>
          </button>
        </Item>
        <Item label="Border trace">
          <button className="group relative h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase bg-[#101c42]">
            <span className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold/70 transition-colors duration-300" style={{ mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", maskComposite: "exclude", padding: 2 }} />
            <span className="relative text-gold">Trace</span>
          </button>
        </Item>
        <Item label="Skew pop">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase bg-gradient-to-b from-[#ff7c93] to-[#ff4d6a] shadow-[0_4px_0_#c0253f] transition-transform duration-200 hover:skew-x-[-8deg] hover:scale-105 active:skew-x-0 active:scale-95">Skew</button>
        </Item>
        <Item label="Icon slide">
          <button className="group h-12 pl-5 pr-6 rounded-2xl font-extrabold text-[12px] uppercase bg-gradient-to-b from-[#2a4185] to-[#1f336e] shadow-[0_4px_0_#0b1536] flex items-center gap-2 overflow-hidden">
            <Icon name="arrowUp" size={16} className="transition-transform duration-300 group-hover:-translate-y-8 group-hover:opacity-0" />
            <Icon name="arrowUp" size={16} className="absolute transition-all duration-300 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100" />
            <span>Send</span>
          </button>
        </Item>
        <Item label="Squeeze">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase bg-gradient-to-b from-[#ab86ff] to-[#6f3cf0] shadow-[0_4px_0_#4a22b0] transition-transform duration-150 hover:scale-x-110 hover:scale-y-90 active:scale-90">Squish</button>
        </Item>
        <Item label="Gradient shift">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase text-ink-900 transition-all duration-500 hover:brightness-110 hover:shadow-[0_0_24px_rgba(255,197,61,.5)]" style={{ background: "linear-gradient(120deg,#ffc53d,#ff8a3d,#ff4d6a,#ffc53d)", backgroundSize: "250% 100%", animation: "gradient-x 4s linear infinite" }}>Shift</button>
        </Item>
        <Item label="Underline grow">
          <button className="group h-12 px-6 font-extrabold text-[12px] uppercase text-mute hover:text-txt transition-colors relative">Link<span className="absolute bottom-2 left-6 right-6 h-[3px] rounded-full bg-bull origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" /></button>
        </Item>
        <Item label="Double shadow">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase bg-[#101c42] border border-white/10 transition-all duration-200 hover:border-blue/60 hover:shadow-[4px_4px_0_#3d7bff,-4px_-4px_0_#8d5cff]">Offset</button>
        </Item>
        <Item label="Ghost fill">
          <button className="h-12 px-6 rounded-2xl font-extrabold text-[12px] uppercase border-2 border-dashed border-[#2f4890] text-mute transition-all duration-300 hover:border-solid hover:border-bull hover:text-bull hover:bg-bull/10">Ghost</button>
        </Item>
      </div>
    </Asset>
  );
}

/* ============ 2. RIPPLE LAB ============ */
function RippleLab() {
  const [c, setC] = useState(0);
  return (
    <Asset title="Ripple Lab" id="btn.ripple" desc="Material-волна от точки клика: несколько волн складываются, счётчик нажатий.">
      <div className="flex flex-col items-center gap-4 py-4">
        <RippleBtn onClick={() => setC((x) => x + 1)}>Tap anywhere on me</RippleBtn>
        <div className="num text-[15px] font-extrabold text-mute">taps: <span key={c} className="text-txt anim-pop inline-block">{c}</span></div>
        <div className="flex gap-2">
          <RippleBtn className="!h-10 !px-4 !text-[11px]" onClick={() => setC((x) => x + 1)}>Small</RippleBtn>
          <RippleBtn className="!h-14 !px-8" onClick={() => setC((x) => x + 1)}>Large</RippleBtn>
        </div>
      </div>
    </Asset>
  );
}

/* ============ 3. MAGNETIC ============ */
function MagneticDemo() {
  return (
    <Asset title="Magnetic Buttons" id="btn.magnet" desc="Кнопки тянутся к курсору в радиусе, пружинят назад при уходе. Сила разная.">
      <div className="h-[190px] flex items-center justify-center gap-8">
        <Magnet str={0.45}><Btn3D size="lg" variant="bull">Strong</Btn3D></Magnet>
        <Magnet str={0.2}><Btn3D size="md" variant="violet">Soft</Btn3D></Magnet>
      </div>
      <div className="text-center text-[11px] text-dim font-bold">наведите курсор рядом с кнопками</div>
    </Asset>
  );
}

/* ============ 4. MORPH STATES ============ */
function MorphStates() {
  const [st, setSt] = useState<"idle" | "load" | "done">("idle");
  const [st2, setSt2] = useState<"idle" | "load" | "fail">("idle");
  const run = (ok: boolean) => {
    if (ok) { if (st !== "idle") return; setSt("load"); setTimeout(() => { setSt("done"); sfx.success(); setTimeout(() => setSt("idle"), 1800); }, 1400); }
    else { if (st2 !== "idle") return; setSt2("load"); setTimeout(() => { setSt2("fail"); sfx.error(); setTimeout(() => setSt2("idle"), 1800); }, 1400); }
  };
  const morph = (state: string, ok: boolean) => {
    const W = state === "idle" ? 220 : 56;
    const bg = state === "done" ? "linear-gradient(180deg,#5af5b4,#1fdb8b)" : state === "fail" ? "linear-gradient(180deg,#ff7c93,#ff4d6a)" : "linear-gradient(180deg,#6a9dff,#3d7bff)";
    return (
      <button onClick={() => run(ok)} className="h-14 grid place-items-center overflow-hidden font-extrabold text-[12px] uppercase tracking-wider text-white"
        style={{ width: W, borderRadius: state === "idle" ? 16 : 28, background: bg, boxShadow: "0 5px 0 rgba(0,0,0,.35), inset 0 2px 0 rgba(255,255,255,.3)", transition: "width .45s cubic-bezier(.3,1.3,.5,1), border-radius .45s, background .3s" }}>
        {state === "idle" && <span className="whitespace-nowrap anim-fade">{ok ? "Buy BTC" : "Withdraw"}</span>}
        {state === "load" && <Spinner size={22} />}
        {state === "done" && <Icon name="check" size={26} stroke={3.4} className="anim-pop text-ink-900" />}
        {state === "fail" && <Icon name="x" size={24} stroke={3.4} className="anim-pop" />}
      </button>
    );
  };
  return (
    <Asset title="Morph States" id="btn.morph" desc="Кнопка превращается: пилюля → круг-спиннер → галочка успеха / крест ошибки → обратно.">
      <div className="flex flex-col items-center gap-5 py-4">
        {morph(st, true)}
        {morph(st2, false)}
      </div>
    </Asset>
  );
}

/* ============ 5. HOLD TO CHARGE ============ */
function HoldCharge() {
  const [p, setP] = useState(0);
  const [fire, setFire] = useState(false);
  const timer = useRef(0);
  const down = () => {
    const t0 = performance.now();
    const loop = () => {
      const k = Math.min(1, (performance.now() - t0) / 1400);
      setP(k);
      if (k < 1) timer.current = requestAnimationFrame(loop);
      else { setFire(true); sfx.levelUp(); setTimeout(() => { setFire(false); setP(0); }, 1200); }
    };
    timer.current = requestAnimationFrame(loop);
  };
  const up = () => { cancelAnimationFrame(timer.current); if (!fire) setP(0); };
  return (
    <Asset title="Hold to Charge" id="btn.hold" desc="Удерживайте 1.4с: кольцо заряжается, кнопка вибрирует сильнее, в конце — выстрел.">
      <div className="grid place-items-center py-4">
        <button onPointerDown={down} onPointerUp={up} onPointerLeave={up}
          className="relative size-[150px] rounded-full grid place-items-center font-extrabold text-[13px] uppercase select-none touch-none"
          style={{ background: fire ? "linear-gradient(180deg,#5af5b4,#1fdb8b)" : "linear-gradient(180deg,#2a4185,#16275a)", boxShadow: fire ? "0 0 50px rgba(31,219,139,.7), 0 6px 0 #0d9a5c" : `0 6px 0 #0b1536, 0 0 ${p * 40}px rgba(61,123,255,.6)`, transform: `scale(${1 + (fire ? 0.1 : p * 0.04)})`, animation: p > 0 && p < 1 ? `box-shake ${0.3 - p * 0.22}s linear infinite` : undefined, color: fire ? "#03261a" : undefined }}>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="68" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
            <circle cx="75" cy="75" r="68" fill="none" stroke={fire ? "#03261a" : "#6a9dff"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${p * 427} 427`} />
          </svg>
          {fire ? <span className="anim-pop">Fired!</span> : p > 0 ? <span className="num">{Math.round(p * 100)}%</span> : "Hold"}
        </button>
      </div>
      <div className="text-center text-[11px] text-dim font-bold">удерживайте, не отпускайте</div>
    </Asset>
  );
}

/* ============ 6. SPLIT BUTTON ============ */
function SplitButton() {
  const [open, setOpen] = useState(false);
  const [main, setMain] = useState("Market buy");
  const opts = ["Market buy", "Limit buy", "Stop buy", "DCA buy"];
  return (
    <Asset title="Split Button" id="btn.split" desc="Основное действие + стрелка с меню: выбор меняет главную кнопку, меню со стаггером.">
      <div className="py-6 flex flex-col items-center gap-3">
        <div className="relative flex">
          <button onClick={(e) => { sfx.success(); const r = e.currentTarget.getBoundingClientRect(); burstSparks(r.left + r.width / 2, r.top + r.height / 2, 16); }}
            className="h-13 py-3.5 px-6 rounded-l-2xl font-extrabold text-[13px] uppercase text-white transition active:translate-y-[3px]"
            style={{ background: "linear-gradient(180deg,#5af5b4,#1fdb8b)", color: "#03261a", boxShadow: "0 5px 0 #0d9a5c" }}>{main}</button>
          <button onClick={() => { setOpen(!open); sfx.tick(); }} className="w-12 rounded-r-2xl grid place-items-center transition active:translate-y-[3px]"
            style={{ background: "linear-gradient(180deg,#3fe9a1,#17b873)", color: "#03261a", boxShadow: "0 5px 0 #0d9a5c", borderLeft: "2px solid rgba(0,0,0,.15)" }}>
            <Icon name="chevD" size={18} stroke={3} className={cn("transition-transform duration-300", open && "rotate-180")} />
          </button>
          {open && (
            <div className="absolute top-full mt-2 inset-x-0 raised !rounded-2xl p-1.5 z-20 anim-scale origin-top">
              {opts.map((o, i) => (
                <button key={o} onClick={() => { setMain(o); setOpen(false); sfx.pop(); }}
                  className={cn("w-full text-left px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-colors", o === main ? "bg-bull/15 text-bull" : "hover:bg-white/5")}
                  style={{ animation: `fade-in .3s ${i * 50}ms both` }}>
                  {o}{o === main && <Icon name="check" size={14} stroke={3} className="float-right mt-0.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Asset>
  );
}

/* ============ 7. SEGMENT SLIDER ============ */
function SegmentSlider() {
  const opts = ["1m", "5m", "15m", "1H", "4H", "1D"];
  const [i, setI] = useState(3);
  return (
    <Asset title="Segment Slider" id="btn.segment" desc="Пилюля-индикатор скользит между сегментами с пружиной, активный сегмент приподнят.">
      <div className="inset !rounded-2xl p-1.5 relative grid grid-cols-6 mt-2">
        <div className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-b from-[#6a9dff] to-[#3d7bff] shadow-[0_3px_0_#2250c2] transition-all duration-400 ease-[cubic-bezier(.3,1.4,.5,1)]"
          style={{ width: "calc((100% - 12px) / 6)", left: `calc(6px + ${i} * (100% - 12px) / 6)` }} />
        {opts.map((o, k) => (
          <button key={o} onClick={() => { setI(k); sfx.tick(); }} className={cn("relative z-10 h-10 rounded-xl num text-[12px] font-extrabold transition-all", k === i ? "text-white -translate-y-[1px]" : "text-mute hover:text-txt")}>{o}</button>
        ))}
      </div>
      <div key={i} className="mt-3 text-center text-[12px] font-bold text-mute anim-fade">Таймфрейм <span className="text-txt num">{opts[i]}</span> · свечей: <span className="num">{[240, 180, 120, 96, 72, 60][i]}</span></div>
    </Asset>
  );
}

/* ============ 8. CONFETTI BUTTONS ============ */
function ConfettiBtns() {
  return (
    <Asset title="Celebration Buttons" id="btn.party" desc="Кнопки-салюты: взрыв из центра кнопки, монеты вверх, кольцо-волна.">
      <div className="flex flex-col gap-3 py-2">
        <Btn3D variant="gold" full icon={<Icon name="gift" size={16} />} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 60, 1.1); sfx.levelUp(); }}>Claim reward</Btn3D>
        <div className="grid grid-cols-2 gap-3">
          <Btn3D variant="bull" icon={<Icon name="check" size={16} stroke={3} />} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); burstSparks(r.left + r.width / 2, r.top + r.height / 2, 30, "#1fdb8b"); sfx.success(); }}>Win trade</Btn3D>
          <Btn3D variant="violet" icon={<Icon name="star" size={16} />} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); burstConfetti(r.left + r.width / 2, r.top, 26, 0.7); sfx.coin(); }}>Level up</Btn3D>
        </div>
      </div>
    </Asset>
  );
}

export default function ButtonLab() {
  return (
    <Section id="buttons" index="27" title="Button FX Lab" subtitle="8 групп кнопок: 12 hover-эффектов, ripple, магнит, morph-статусы, hold-заряд, split, сегменты, салюты" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <HoverGrid />
        <RippleLab />
        <MagneticDemo />
        <MorphStates />
        <HoldCharge />
        <SplitButton />
        <SegmentSlider />
        <ConfettiBtns />
      </div>
    </Section>
  );
}
