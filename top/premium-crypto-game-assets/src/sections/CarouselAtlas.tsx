import { useRef, useState } from "react";
import { Asset, Section, useInterval } from "../components/ui";
import { Icon } from "../components/icons";
import { clamp, useDrag, useSpringNumber, wrap } from "../components/motion";
import { cn } from "../utils/cn";

const VISUAL_SLIDES = [
  { image: "/images/gameplay-arena.jpg", title: "Arena", kicker: "Compete", color: "#22d38a", body: "Ranked chart decisions with equal conditions." },
  { image: "/images/learning-map.jpg", title: "World Map", kicker: "Explore", color: "#3da5ff", body: "A learning path that reads like a real game world." },
  { image: "/images/bullrun-hero.jpg", title: "Pip the Bull", kicker: "Learn", color: "#ffc53d", body: "A coach for discipline, reflection and confidence." },
];

function FadeCarousel() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [progress, setProgress] = useState(0);
  useInterval(() => {
    if (!auto) return;
    setProgress((value) => {
      if (value >= 100) { setIndex((current) => wrap(current + 1, 0, VISUAL_SLIDES.length)); return 0; }
      return value + 2;
    });
  }, 80);
  const go = (value: number) => { setIndex(wrap(value, 0, VISUAL_SLIDES.length)); setProgress(0); };
  return (
    <Asset code="CAR-01" title="Crossfade Hero" desc="Layered image crossfade with independent caption motion, timed progress and pause-on-hover." tags={["fade", "hero", "autoplay"]} span={2}>
      <div className="relative h-[420px] rounded-[26px] overflow-hidden panel" onPointerEnter={() => setAuto(false)} onPointerLeave={() => setAuto(true)}>
        {VISUAL_SLIDES.map((slide, itemIndex) => <div key={slide.title} className="absolute inset-0 bg-cover bg-center transition-[opacity,transform] duration-1000" style={{ backgroundImage: `url(${slide.image})`, opacity: itemIndex === index ? 1 : 0, transform: itemIndex === index ? "scale(1.03)" : "scale(1.1)" }} />)}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
        <div key={index} className="absolute left-6 bottom-16 max-w-sm anim-rise">
          <div className="text-[9px] uppercase tracking-[.2em] font-black" style={{ color: VISUAL_SLIDES[index].color }}>{VISUAL_SLIDES[index].kicker}</div>
          <h4 className="text-4xl font-black mt-2">{VISUAL_SLIDES[index].title}</h4>
          <p className="text-sm text-fog/70 mt-2">{VISUAL_SLIDES[index].body}</p>
        </div>
        <div className="absolute left-6 right-6 bottom-5 flex items-center gap-2">
          <button onClick={() => go(index - 1)} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevL" size={15} /></button>
          {VISUAL_SLIDES.map((slide, itemIndex) => <button key={slide.title} onClick={() => go(itemIndex)} className="relative h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden"><span className="absolute inset-y-0 left-0 bg-white rounded-full" style={{ width: itemIndex < index ? "100%" : itemIndex === index ? `${progress}%` : "0%" }} /></button>)}
          <button onClick={() => go(index + 1)} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevR" size={15} /></button>
        </div>
        <span className="absolute right-4 top-4 glass rounded-xl px-2 py-1 text-[8px] font-black uppercase tracking-widest">{auto ? "Auto" : "Paused"}</span>
      </div>
    </Asset>
  );
}

function CubeCarousel() {
  const [face, setFace] = useState(0);
  const rotate = useSpringNumber(face * -90, { stiffness: 170, damping: 23 });
  const faces = [
    { title: "Learn", icon: "book", color: "#3da5ff", detail: "Understand the setup" },
    { title: "Practice", icon: "candles", color: "#22d38a", detail: "Make the decision" },
    { title: "Review", icon: "refresh", color: "#ffc53d", detail: "Explain the outcome" },
    { title: "Compete", icon: "trophy", color: "#9b6bff", detail: "Test skill under time" },
  ];
  return (
    <Asset code="CAR-02" title="3D Cube Carousel" desc="Four product pillars are mounted on a real CSS 3D cube with a physics-spring rotation and keyboard paging." tags={["cube", "3D", "spring"]}>
      <div className="h-80 rounded-[24px] panel grid place-items-center overflow-hidden" style={{ perspective: 900 }} tabIndex={0} onKeyDown={(event) => { if (event.key === "ArrowRight") setFace((value) => value + 1); if (event.key === "ArrowLeft") setFace((value) => value - 1); }}>
        <div className="relative w-44 h-44" style={{ transformStyle: "preserve-3d", transform: `rotateY(${rotate}deg)` }}>
          {faces.map((item, index) => {
            const transforms = ["rotateY(0deg) translateZ(88px)", "rotateY(90deg) translateZ(88px)", "rotateY(180deg) translateZ(88px)", "rotateY(-90deg) translateZ(88px)"];
            return <div key={item.title} className="absolute inset-0 rounded-3xl p-5 flex flex-col border border-white/20" style={{ transform: transforms[index], background: `linear-gradient(145deg,${item.color}df,${item.color}66)`, boxShadow: "inset 0 2px 0 rgba(255,255,255,.25)" }}><Icon name={item.icon} size={32} /><div className="mt-auto text-2xl font-black">{item.title}</div><div className="text-[10px] text-white/70">{item.detail}</div></div>;
          })}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 mt-3"><button onClick={() => setFace((value) => value - 1)} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="chevL" size={15} /></button><span className="num text-[10px] text-mist w-16 text-center">{wrap(face, 0, 4) + 1} / 4</span><button onClick={() => setFace((value) => value + 1)} className="btn3d v-ghost w-10 h-10 !p-0 !rounded-xl" style={{ ["--lip" as string]: "3px" }}><Icon name="chevR" size={15} /></button></div>
    </Asset>
  );
}

function AccordionCarousel() {
  const [active, setActive] = useState(1);
  const items = [
    { title: "Basics", icon: "book", color: "#3da5ff", lessons: 18 },
    { title: "Charts", icon: "candles", color: "#22d38a", lessons: 42 },
    { title: "Risk", icon: "shield", color: "#ffc53d", lessons: 24 },
    { title: "DeFi", icon: "layers", color: "#9b6bff", lessons: 31 },
  ];
  return (
    <Asset code="CAR-03" title="Accordion Carousel" desc="Horizontal panels expand on tap or focus while neighboring context stays visible. Works with pointer and keyboard." tags={["accordion", "expand", "responsive"]} span={2}>
      <div className="h-72 flex gap-2 rounded-[24px] overflow-hidden">
        {items.map((item, index) => {
          const open = active === index;
          return <button key={item.title} onClick={() => setActive(index)} onFocus={() => setActive(index)} className="relative rounded-3xl overflow-hidden text-left transition-[flex] duration-500 ease-[cubic-bezier(.2,.9,.3,1.1)]" style={{ flex: open ? 3.7 : 1, background: `linear-gradient(150deg,${item.color}cc,${item.color}55 70%,#0a1430)`, minWidth: 54 }}><div className="absolute inset-0 dotgrid opacity-20" /><div className="relative h-full p-4 flex flex-col"><span className="w-10 h-10 rounded-xl bg-white/15 grid place-items-center"><Icon name={item.icon} size={20} /></span><div className="mt-auto"><div className={cn("font-black transition-all", open ? "text-2xl" : "text-sm [writing-mode:vertical-rl] rotate-180")}>{item.title}</div>{open && <div className="anim-rise"><div className="text-[10px] text-white/65 mt-1">{item.lessons} lessons · 6 practice sets</div><div className="h-1.5 rounded-full bg-black/20 mt-3 overflow-hidden"><div className="h-full w-2/3 bg-white/70 rounded-full" /></div></div>}</div></div></button>;
        })}
      </div>
    </Asset>
  );
}

const RAIL_ITEMS = [
  { w: 180, title: "Morning pulse", icon: "sparkle", color: "#3da5ff" },
  { w: 260, title: "Pattern sprint", icon: "bolt", color: "#9b6bff" },
  { w: 205, title: "Risk review", icon: "shield", color: "#22d38a" },
  { w: 300, title: "Market replay", icon: "chart", color: "#ffc53d" },
  { w: 190, title: "Club duel", icon: "users", color: "#ff8a3d" },
];

function VariableWidthRail() {
  const totalWidth = RAIL_ITEMS.reduce((sum, item) => sum + item.w + 12, 0);
  const drag = useDrag({ min: -(totalWidth - 520), max: 0, initial: 0, friction: .9, rubberBand: .16 });
  return (
    <Asset code="CAR-04" title="Variable-width Rail" desc="Mixed-width editorial cards move on a shared inertial rail with rubber-band edges, velocity decay and no forced item snap." tags={["variable width", "inertia", "rubber band"]} span={2}>
      <div className="relative h-64 rounded-[24px] panel overflow-hidden">
        <div className="absolute left-3 right-3 top-3 flex justify-between text-[8px] uppercase tracking-widest font-black text-mist"><span>Drag editorial rail</span><span className="num">x {Math.round(drag.value)} · v {Math.round(drag.velocity)}</span></div>
        <div {...drag.bind} className={cn("absolute left-4 top-12 bottom-4 flex gap-3 select-none touch-pan-y", drag.dragging ? "cursor-grabbing" : "cursor-grab")} style={{ width: totalWidth, transform: `translate3d(${drag.value}px,0,0)`, willChange: "transform" }}>
          {RAIL_ITEMS.map((item, index) => <article key={item.title} className="h-full rounded-3xl p-4 flex flex-col shrink-0" style={{ width: item.w, background: `linear-gradient(145deg,${item.color}d9,${item.color}55)`, boxShadow: "inset 0 2px 0 rgba(255,255,255,.22),0 7px 0 rgba(0,0,0,.25)" }}><div className="flex justify-between"><Icon name={item.icon} size={24} /><span className="num text-[8px] opacity-60">0{index + 1}</span></div><div className="mt-auto"><div className="font-black text-lg">{item.title}</div><div className="text-[9px] text-white/65 mt-1">Tap to continue your tailored practice.</div></div></article>)}
        </div>
      </div>
    </Asset>
  );
}

function SyncedNavigationCarousel() {
  const [index, setIndex] = useState(0);
  const spring = useSpringNumber(index, { stiffness: 250, damping: 28 });
  const tabs = [
    { title: "Concept", icon: "book", body: "Read why the pattern forms before naming it.", color: "#3da5ff" },
    { title: "Example", icon: "candles", body: "Inspect a real setup with volume and context.", color: "#22d38a" },
    { title: "Practice", icon: "target", body: "Make the call without a visible label.", color: "#9b6bff" },
    { title: "Review", icon: "refresh", body: "Explain the decision and save the miss.", color: "#ffc53d" },
  ];
  return (
    <Asset code="CAR-05" title="Synced Main + Nav" desc="A primary slide and compact chapter navigation share one index. Main content and active-nav indicator use different spring distances." tags={["synced", "tabs", "chapters"]}>
      <div className="rounded-[24px] panel overflow-hidden">
        <div className="relative h-60 overflow-hidden">
          <div className="absolute inset-0 flex" style={{ width: `${tabs.length * 100}%`, transform: `translate3d(${-spring * (100 / tabs.length)}%,0,0)` }}>
            {tabs.map((tab, itemIndex) => <article key={tab.title} className="h-full p-5 flex flex-col relative" style={{ width: `${100 / tabs.length}%`, background: `radial-gradient(circle at 80% 25%,${tab.color}35,transparent 40%),linear-gradient(145deg,#122049,#070e22)` }}><div className="w-12 h-12 rounded-2xl grid place-items-center" style={{ color: tab.color, background: `${tab.color}1f` }}><Icon name={tab.icon} size={24} /></div><div className="mt-auto"><div className="text-[8px] uppercase tracking-[.2em] font-black" style={{ color: tab.color }}>Chapter 0{itemIndex + 1}</div><div className="text-2xl font-black mt-1">{tab.title}</div><p className="text-xs text-mist mt-1">{tab.body}</p></div></article>)}
          </div>
        </div>
        <div className="p-2 grid grid-cols-4 gap-1 bg-black/15">{tabs.map((tab, itemIndex) => <button key={tab.title} onClick={() => setIndex(itemIndex)} className={cn("relative rounded-xl p-2 flex flex-col items-center gap-1 transition-colors", index === itemIndex ? "bg-white/10 text-fog" : "text-mist hover:bg-white/5")}><Icon name={tab.icon} size={16} /><span className="text-[8px] font-black">{tab.title}</span>{index === itemIndex && <span className="absolute bottom-0 h-0.5 w-6 rounded-full" style={{ background: tab.color }} />}</button>)}</div>
      </div>
    </Asset>
  );
}

function VerticalWheelPicker() {
  const [index, setIndex] = useState(2);
  const spring = useSpringNumber(index, { stiffness: 210, damping: 25 });
  const options = ["Conservative", "Balanced", "Growth", "Aggressive", "Degen-free"];
  return (
    <Asset code="CAR-06" title="Vertical 3D Wheel" desc="A perspective picker for risk profile. Items scale, blur and rotate based on distance from the selected center row." tags={["wheel", "picker", "3D"]}>
      <div className="relative h-72 rounded-[24px] panel overflow-hidden" style={{ perspective: 600 }}>
        <div className="absolute inset-x-6 top-1/2 h-14 -translate-y-1/2 rounded-2xl border-2 border-sky/35 bg-sky/[.06]" />
        <div className="absolute inset-0 grid place-items-center">
          {options.map((option, itemIndex) => {
            const distance = itemIndex - spring;
            const y = distance * 56;
            const scale = 1 - Math.min(.42, Math.abs(distance) * .16);
            return <button key={option} onClick={() => setIndex(itemIndex)} className="absolute h-12 w-56 rounded-xl font-black transition-colors" style={{ transform: `translate3d(0,${y}px,${-Math.abs(distance) * 55}px) rotateX(${distance * -13}deg) scale(${scale})`, opacity: 1 - Math.min(.82, Math.abs(distance) * .28), color: Math.abs(distance) < .5 ? "#eef3ff" : "#8ea3cf" }}>{option}<span className="block num text-[8px] mt-0.5">risk {itemIndex + 1}/5</span></button>;
          })}
        </div>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2"><button onClick={() => setIndex((value) => clamp(value - 1, 0, options.length - 1))} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevU" size={14} /></button><button onClick={() => setIndex((value) => clamp(value + 1, 0, options.length - 1))} className="w-9 h-9 glass rounded-xl grid place-items-center"><Icon name="chevD" size={14} /></button></div>
      </div>
    </Asset>
  );
}

function NativePeekCarousel() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const items = [
    { title: "Daily goal", value: "2 / 3", icon: "target", color: "#22d38a" },
    { title: "League rank", value: "#12", icon: "trophy", color: "#ffc53d" },
    { title: "Demo PnL", value: "+$284", icon: "trendUp", color: "#3da5ff" },
    { title: "Accuracy", value: "92%", icon: "shield", color: "#9b6bff" },
  ];
  return (
    <Asset code="CAR-07" title="Native Snap + Peek" desc="Browser-native scroll snap keeps the next card visible as an affordance. Touch, trackpad and scrollbar all use the same implementation." tags={["native snap", "peek", "mobile"]} span={2}>
      <div className="rounded-[24px] panel py-4 overflow-hidden">
        <div ref={ref} onScroll={() => { const element = ref.current; if (element) setIndex(Math.round(element.scrollLeft / (element.clientWidth * .72))); }} className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 pb-4 overscroll-x-contain">
          {items.map((item, itemIndex) => <article key={item.title} className="relative shrink-0 w-[72%] sm:w-[42%] h-48 rounded-3xl snap-center p-5 flex flex-col overflow-hidden" style={{ background: `linear-gradient(145deg,${item.color}cc,${item.color}55)`, boxShadow: "inset 0 2px 0 rgba(255,255,255,.25),0 6px 0 rgba(0,0,0,.3)" }}><div className="flex justify-between"><span className="w-11 h-11 rounded-xl bg-white/15 grid place-items-center"><Icon name={item.icon} size={21} /></span><span className="num text-[9px] text-white/55">0{itemIndex + 1}</span></div><div className="mt-auto"><div className="num text-3xl font-black">{item.value}</div><div className="text-xs text-white/70">{item.title}</div></div></article>)}
        </div>
        <div className="flex justify-center gap-1.5">{items.map((_, itemIndex) => <button key={itemIndex} onClick={() => ref.current?.children[itemIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })} className={cn("h-2 rounded-full transition-all", index === itemIndex ? "w-7 bg-sky" : "w-2 bg-ink-600")} aria-label={`Card ${itemIndex + 1}`} />)}</div>
      </div>
    </Asset>
  );
}

export default function CarouselAtlas() {
  return (
    <Section id="carousel-atlas" index="04" title="Carousel Atlas" subtitle="The full carousel vocabulary: crossfade, cube, accordion, variable-width inertia, synced navigation, 3D wheel and native snap-with-peek.">
      <FadeCarousel />
      <CubeCarousel />
      <AccordionCarousel />
      <VariableWidthRail />
      <SyncedNavigationCarousel />
      <VerticalWheelPicker />
      <NativePeekCarousel />
    </Section>
  );
}