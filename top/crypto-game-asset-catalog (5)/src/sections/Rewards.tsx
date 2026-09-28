import { useEffect, useRef, useState } from "react";
import { Asset, Badge, Bar, Btn3D, Section, useToast } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstCoins, burstConfetti, burstRing, burstSparks, burstText, celebrate, shake } from "../utils/fx";
import { clamp, easeOutQuart, useDrag, useInView, useRafLoop } from "../hooks/motion";
import type { G } from "./Carousels";

/* =========================================================
   1. WHEEL OF FORTUNE (physics ease + flick)
   ========================================================= */
const SEG: { l: string; g: G; c: string }[] = [
  { l: "50 XP", g: "bolt", c: "#3d7bff" }, { l: "100 💎", g: "gem", c: "#8d5cff" }, { l: "Freeze", g: "shield", c: "#1fdb8b" }, { l: "250 🪙", g: "coin", c: "#ff8a3d" },
  { l: "x2 XP", g: "star", c: "#2ed3f0" }, { l: "Chest", g: "chest", c: "#ff4d6a" }, { l: "25 XP", g: "heart", c: "#27408a" }, { l: "JACKPOT", g: "crown", c: "#ffc53d" },
];
function WheelOfFortune() {
  const toast = useToast();
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [flap, setFlap] = useState(0);
  const [win, setWin] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const N = SEG.length, A = 360 / N;
  const spin = (power = 1) => {
    if (spinning) return;
    setSpinning(true); setWin(null); sfx.whoosh();
    const from = rot;
    const to = from + 360 * (4 + power * 2) + Math.random() * 360;
    const dur = 3800 + power * 900;
    const t0 = performance.now();
    let lastSeg = Math.floor(from / A);
    const loop = (t: number) => {
      const k = clamp((t - t0) / dur);
      const a = from + (to - from) * easeOutQuart(k);
      setRot(a);
      const seg = Math.floor(a / A);
      if (seg !== lastSeg) { lastSeg = seg; sfx.tick(); setFlap((f) => f + 1); if (k > 0.7) haptic(4); }
      if (k < 1) requestAnimationFrame(loop);
      else {
        setSpinning(false);
        const idx = Math.floor((((360 - (a % 360)) % 360) / A)) % N;
        setWin(idx);
        const r = box.current?.getBoundingClientRect();
        if (idx === 7) { celebrate(); fanfare(); } else if (r) { burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 40, 1); sfx.success(); }
        toast({ type: "xp", title: `Выигрыш: ${SEG[idx].l}`, msg: idx === 7 ? "ДЖЕКПОТ! Удача на твоей стороне" : "Колесо снова через 24 часа" });
      }
    };
    requestAnimationFrame(loop);
  };
  const ref = useDrag<HTMLDivElement>({ onEnd: (d) => { if (!d.moved) return; const p = clamp(Math.hypot(d.vx, d.vy), 0.3, 2.5); spin(p / 1.2); } });
  const wedge = (i: number) => {
    const a0 = ((i * A - 90) * Math.PI) / 180, a1 = (((i + 1) * A - 90) * Math.PI) / 180;
    return `M100,100 L${100 + Math.cos(a0) * 96},${100 + Math.sin(a0) * 96} A96,96 0 0 1 ${100 + Math.cos(a1) * 96},${100 + Math.sin(a1) * 96} Z`;
  };
  return (
    <Asset title="Wheel of Fortune" id="rwd.wheel" desc="Раскрутите кнопкой или броском пальца: сила броска = сила вращения. Щелчок и флажок на каждом секторе, замедление quart-ease." className="lg:row-span-2" tags={["GAME"]}>
      <div ref={box} className="flex flex-col items-center">
        <div className="relative size-[280px] mt-4">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-b from-[#ffdc7a] to-[#b8780a] shadow-[0_10px_0_#6e4500,0_30px_50px_rgba(0,0,0,.5)]" />
          <div className="absolute -inset-3 rounded-full">
            {Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2; return <span key={i} className="absolute size-2.5 rounded-full bg-white shadow-[0_0_8px_#fff]" style={{ left: `calc(50% + ${Math.cos(a) * 146}px - 5px)`, top: `calc(50% + ${Math.sin(a) * 146}px - 5px)`, animation: `twinkle 1s ${(i % 2) * 0.5}s infinite` }} />; })}
          </div>
          <div ref={ref} className="absolute inset-0 rounded-full cursor-grab active:cursor-grabbing select-none" style={{ transform: `rotate(${rot}deg)` }}>
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {SEG.map((s, i) => (
                <g key={i}>
                  <path d={wedge(i)} fill={s.c} stroke="#0a1330" strokeWidth="1.5" />
                  <path d={wedge(i)} fill="url(#wh-sh)" />
                  <g transform={`rotate(${i * A + A / 2} 100 100)`}>
                    <text x="100" y="34" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.35)", strokeWidth: 2 }}>{s.l}</text>
                  </g>
                </g>
              ))}
              <defs><radialGradient id="wh-sh"><stop offset=".55" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,.28)" /></radialGradient></defs>
            </svg>
            {SEG.map((s, i) => { const a = ((i * A + A / 2 - 90) * Math.PI) / 180; return <span key={i} className="absolute" style={{ left: `calc(50% + ${Math.cos(a) * 88}px - 13px)`, top: `calc(50% + ${Math.sin(a) * 88}px - 13px)`, transform: `rotate(${i * A + A / 2}deg)` }}><Glyph name={s.g} size={26} /></span>; })}
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full bg-gradient-to-b from-[#2a4185] to-[#111e47] border-4 border-[#ffc53d] grid place-items-center shadow-[0_4px_0_#0b1536]">
            <button onClick={() => spin(1)} disabled={spinning} className="text-[11px] font-extrabold text-gold disabled:opacity-50">SPIN</button>
          </div>
          <div key={flap} className="absolute left-1/2 -top-5 -translate-x-1/2 origin-top" style={{ animation: spinning ? "swing .15s ease-out" : undefined }}>
            <svg width="34" height="44" viewBox="0 0 34 44"><path d="M17 44 L3 10 A14 14 0 1 1 31 10 Z" fill="#ff4d6a" stroke="#fff" strokeWidth="3" /><circle cx="17" cy="14" r="5" fill="#fff" /></svg>
          </div>
        </div>
        <div className="mt-6 w-full min-h-[64px]">
          {win !== null ? (
            <div className="raised p-3 flex items-center gap-3 anim-pop">
              <Glyph name={SEG[win].g} size={34} />
              <div className="flex-1"><div className="label-caps !mb-0">Вы выиграли</div><div className="font-extrabold text-[18px]" style={{ color: SEG[win].c }}>{SEG[win].l}</div></div>
              <Btn3D size="xs" variant="gold" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); burstCoins(r.left + r.width / 2, r.top, 14); setWin(null); }}>Claim</Btn3D>
            </div>
          ) : <Btn3D full size="lg" variant="gold" loading={spinning} onClick={() => spin(1)} icon={<Icon name="refresh" size={18} />}>{spinning ? "Spinning…" : "Spin the wheel"}</Btn3D>}
        </div>
        <div className="text-[11px] text-dim font-bold mt-2 flex items-center gap-1.5"><Icon name="swap" size={13} />Или бросьте колесо пальцем</div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. SCRATCH CARD (canvas)
   ========================================================= */
const PRIZES = [{ t: "500 💎", g: "gem" as G }, { t: "x2 XP · 1ч", g: "bolt" as G }, { t: "Pro · 3 дня", g: "crown" as G }, { t: "Сундук", g: "chest" as G }];
function ScratchCard() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [prize, setPrize] = useState(PRIZES[0]);
  const [pct, setPct] = useState(0);
  const [done, setDone] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moves = useRef(0);
  const paint = () => {
    const c = cv.current;
    if (!c) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#c9d5f5"); g.addColorStop(0.5, "#8fa3d6"); g.addColorStop(1, "#dfe7ff");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`; ctx.fillRect(Math.random() * c.width, Math.random() * c.height, 2 * dpr, 2 * dpr); }
    ctx.fillStyle = "rgba(20,35,80,.65)"; ctx.font = `800 ${18 * dpr}px "Plus Jakarta Sans"`; ctx.textAlign = "center";
    ctx.fillText("СОТРИ МЕНЯ", c.width / 2, c.height / 2 + 6 * dpr);
    ctx.font = `700 ${10 * dpr}px "Plus Jakarta Sans"`; ctx.fillText("✦ lucky ticket ✦", c.width / 2, c.height / 2 + 26 * dpr);
  };
  useEffect(() => { paint(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const scratch = (x: number, y: number) => {
    const c = cv.current!;
    const ctx = c.getContext("2d")!;
    const dpr = c.width / c.clientWidth;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 36 * dpr; ctx.lineCap = "round";
    ctx.beginPath();
    const l = last.current ?? { x, y };
    ctx.moveTo(l.x * dpr, l.y * dpr); ctx.lineTo(x * dpr, y * dpr); ctx.stroke();
    last.current = { x, y };
    if (++moves.current % 8 === 0) {
      sfx.tick();
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let clear = 0, tot = 0;
      for (let i = 3; i < data.length; i += 4 * 24) { tot++; if (data[i] === 0) clear++; }
      const p = clear / tot;
      setPct(p);
      if (p > 0.55 && !done) {
        setDone(true);
        const r = c.getBoundingClientRect();
        burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 50, 1); burstCoins(r.left + r.width / 2, r.top + r.height / 2, 12); sfx.levelUp(); haptic([20, 40, 80]);
      }
    }
  };
  const reset = () => { setPrize(PRIZES[(Math.random() * PRIZES.length) | 0]); setDone(false); setPct(0); moves.current = 0; paint(); sfx.whoosh(); };
  return (
    <Asset title="Scratch Card" id="rwd.scratch" desc="Сотрите защитный слой пальцем (canvas destination-out). После 55% — автоматическое раскрытие и награда.">
      <div className="relative h-[170px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#3a1b9e] to-[#0f1b3f] border-2 border-dashed border-gold/40">
        <div className="absolute inset-0 grid place-items-center text-center">
          <div className={cn(done && "anim-pop")}><Glyph name={prize.g} size={54} /><div className="font-extrabold text-[20px] text-gold mt-1">{prize.t}</div></div>
        </div>
        <canvas ref={cv} className={cn("absolute inset-0 w-full h-full touch-none cursor-crosshair transition-opacity duration-700", done && "opacity-0 pointer-events-none")}
          onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); last.current = null; scratch(e.clientX - r.left, e.clientY - r.top); }}
          onPointerMove={(e) => { if (!drawing.current) return; const r = e.currentTarget.getBoundingClientRect(); scratch(e.clientX - r.left, e.clientY - r.top); }}
          onPointerUp={() => { drawing.current = false; last.current = null; }} />
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1"><Bar value={done ? 100 : pct * 100 / 0.55} tone="gold" h={8} /></div>
        <Btn3D size="xs" variant="neutral" onClick={reset} icon={<Icon name="refresh" size={12} />}>New</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. SLOT MACHINE
   ========================================================= */
const SYM: G[] = ["coin", "gem", "star", "bolt", "crown", "flame", "rocket"];
const STRIP = 28, SH = 72;
function SlotMachine() {
  const toast = useToast();
  const [reels, setReels] = useState([{ pos: 2, anim: false, strip: SYM }, { pos: 4, anim: false, strip: SYM }, { pos: 1, anim: false, strip: SYM }].map((r) => ({ ...r, strip: Array.from({ length: STRIP + 3 }, (_, i) => SYM[i % SYM.length]) })));
  const [spinning, setSpinning] = useState(false);
  const [lever, setLever] = useState(0);
  const [win, setWin] = useState<null | "big" | "small" | "none">(null);
  const box = useRef<HTMLDivElement>(null);
  const pull = () => {
    if (spinning) return;
    setSpinning(true); setWin(null); sfx.whoosh(); haptic(15);
    const rig = Math.random();
    const target = rig < 0.25 ? Array(3).fill(SYM[(Math.random() * SYM.length) | 0]) : rig < 0.6 ? (() => { const a = SYM[(Math.random() * SYM.length) | 0]; const b = SYM[(Math.random() * SYM.length) | 0]; return [a, a, b].sort(() => Math.random() - 0.5); })() : [0, 1, 2].map(() => SYM[(Math.random() * SYM.length) | 0]);
    setReels((rs) => rs.map((r) => ({ ...r, pos: 1, anim: false, strip: Array.from({ length: STRIP + 3 }, (_, i) => (i === STRIP ? r.strip[r.pos] : SYM[(Math.random() * SYM.length) | 0])) })));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setReels((rs) => rs.map((r, i) => { const strip = [...r.strip]; strip[STRIP] = target[i]; return { ...r, strip, pos: STRIP, anim: true }; }));
    }));
    [1300, 1750, 2200].forEach((ms, i) => setTimeout(() => { sfx.tap(); haptic(10); if (i === 2) finish(target); }, ms));
  };
  const finish = (t: G[]) => {
    setSpinning(false);
    const r = box.current?.getBoundingClientRect();
    if (t[0] === t[1] && t[1] === t[2]) { setWin("big"); celebrate(); fanfare(); toast({ type: "xp", title: "JACKPOT ×3!", msg: "+1000 💎" }); }
    else if (t[0] === t[1] || t[1] === t[2] || t[0] === t[2]) { setWin("small"); if (r) { burstCoins(r.left + r.width / 2, r.top + 60, 14); } sfx.success(); }
    else { setWin("none"); sfx.error(); }
  };
  const lref = useDrag<HTMLDivElement>({
    onMove: (d) => setLever(clamp(d.dy / 80)),
    onEnd: (d) => { if (clamp(d.dy / 80) > 0.8) pull(); setLever(0); },
  }, "y");
  return (
    <Asset title="Slot Machine" id="rwd.slots" desc="Потяните рычаг вниз (или кнопку). Барабаны останавливаются по очереди с отскоком; ×3 — джекпот, ×2 — монеты." className="lg:col-span-2" tags={["GAME"]}>
      <div ref={box} className="flex items-center justify-center gap-4">
        <div className="relative rounded-[28px] p-4 bg-gradient-to-b from-[#8d5cff] to-[#3a1b9e] shadow-[0_8px_0_#26136b,0_24px_40px_rgba(0,0,0,.5)]">
          <div className="flex justify-center gap-1 mb-2">{Array.from({ length: 9 }).map((_, i) => <span key={i} className="size-2 rounded-full bg-gold" style={{ animation: spinning || win === "big" ? `twinkle .5s ${i * 0.06}s infinite` : undefined }} />)}</div>
          <div className="flex gap-2 p-2 rounded-2xl bg-[#0a1330] shadow-[inset_0_6px_14px_rgba(0,0,0,.6)]">
            {reels.map((r, i) => (
              <div key={i} className="relative w-[72px] overflow-hidden rounded-xl bg-gradient-to-b from-[#dfe7ff] via-white to-[#dfe7ff]" style={{ height: SH * 1.6 }}>
                <div style={{ transform: `translateY(${-(r.pos * SH) + SH * 0.3}px)`, transition: r.anim ? `transform ${1.3 + i * 0.45}s cubic-bezier(.2,.75,.25,1.08)` : "none" }}>
                  {r.strip.map((g, k) => <div key={k} className="grid place-items-center" style={{ height: SH }}><Glyph name={g} size={46} /></div>)}
                </div>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/35 via-transparent to-black/35" />
                {win === "big" && <div className="absolute inset-0 ring-4 ring-gold rounded-xl animate-pulse" />}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 h-6 font-extrabold text-[13px]">
            {win === "big" ? <span className="text-gold anim-pop inline-block">JACKPOT!</span> : win === "small" ? <span className="text-bull anim-pop inline-block">+120 🪙</span> : win === "none" ? <span className="text-white/60">Почти…</span> : <span className="text-white/60">Crypto Slots</span>}
          </div>
        </div>
        <div className="flex flex-col items-center h-[210px]">
          <div className="w-3 h-3 rounded-full bg-[#1c3068]" />
          <div ref={lref} className="relative flex-1 w-6 cursor-grab active:cursor-grabbing select-none">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2 rounded-full bg-gradient-to-b from-[#c9d5f5] to-[#5b6a98] origin-top" style={{ height: `${60 + lever * 40}%`, transition: lever ? "none" : "height .4s cubic-bezier(.3,1.6,.5,1)" }} />
            <div className="absolute left-1/2 -translate-x-1/2 size-9 rounded-full bg-gradient-to-b from-[#ff7c93] to-[#c0253f] shadow-[0_4px_0_#7a1428]" style={{ top: `calc(${60 + lever * 40}% - 18px)`, transition: lever ? "none" : "top .4s cubic-bezier(.3,1.6,.5,1)" }} />
          </div>
        </div>
      </div>
      <Btn3D full size="md" variant="violet" className="mt-4" loading={spinning} onClick={pull}>{spinning ? "Spinning…" : "Pull · 50 🪙"}</Btn3D>
    </Asset>
  );
}

/* =========================================================
   4. PICK A CARD (shuffle + flip)
   ========================================================= */
const PICK: { t: string; g: G; c: string }[] = [{ t: "300 💎", g: "gem", c: "#8d5cff" }, { t: "Freeze", g: "shield", c: "#1fdb8b" }, { t: "x3 XP", g: "bolt", c: "#ffc53d" }];
function PickCard() {
  const [order, setOrder] = useState([0, 1, 2]);
  const [phase, setPhase] = useState<"idle" | "shuffle" | "pick" | "reveal">("idle");
  const [chosen, setChosen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const start = () => {
    setPhase("shuffle"); setChosen(null); setAll(false); sfx.whoosh();
    let n = 0;
    const h = setInterval(() => {
      setOrder((o) => { const a = [...o]; const i = (Math.random() * 3) | 0, j = (i + 1 + ((Math.random() * 2) | 0)) % 3; [a[i], a[j]] = [a[j], a[i]]; return a; });
      sfx.tick();
      if (++n >= 8) { clearInterval(h); setPhase("pick"); }
    }, 230);
  };
  const pick = (card: number, el: HTMLElement) => {
    if (phase !== "pick") return;
    setChosen(card); setPhase("reveal"); sfx.pop(); haptic(15);
    const r = el.getBoundingClientRect();
    setTimeout(() => { burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 30, 0.8); sfx.success(); }, 350);
    setTimeout(() => setAll(true), 1000);
  };
  return (
    <Asset title="Pick a Card" id="rwd.pick" desc="Карты показываются, переворачиваются, перемешиваются (FLIP-позиции) — выберите одну. Потом увидите, что упустили.">
      <div className="relative h-[190px]" style={{ perspective: 900 }}>
        {[0, 1, 2].map((card) => {
          const slot = order.indexOf(card);
          const faceUp = phase === "idle" || (phase === "reveal" && (chosen === card || all));
          return (
            <button key={card} onClick={(e) => pick(card, e.currentTarget)}
              className={cn("absolute top-3 w-[29%] h-[160px]", phase === "pick" && "hover:-translate-y-2")}
              style={{ left: `${slot * 35.5}%`, transition: "left .22s cubic-bezier(.3,1.3,.5,1), transform .3s", transform: chosen === card ? "translateY(-10px) scale(1.06)" : undefined, zIndex: chosen === card ? 5 : 1 }}>
              <div className="relative w-full h-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: faceUp ? "rotateY(0)" : "rotateY(180deg)" }}>
                <div className="absolute inset-0 rounded-2xl grid place-items-center text-center" style={{ backfaceVisibility: "hidden", background: `linear-gradient(160deg, ${PICK[card].c}, #0f1b3f)`, boxShadow: `0 5px 0 #081028, 0 0 ${chosen === card ? 30 : 0}px ${PICK[card].c}` }}>
                  <div><Glyph name={PICK[card].g} size={40} /><div className="font-extrabold text-[13px] mt-1">{PICK[card].t}</div></div>
                  {all && chosen !== card && <span className="absolute inset-0 rounded-2xl bg-ink-900/60" />}
                </div>
                <div className="absolute inset-0 rounded-2xl grid place-items-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "repeating-linear-gradient(45deg, #1c3068 0 8px, #16275a 8px 16px)", boxShadow: "0 5px 0 #081028, inset 0 0 0 3px rgba(255,197,61,.5)" }}>
                  <span className="size-12 rounded-full bg-ink-850 grid place-items-center text-gold font-extrabold text-[20px]">?</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Btn3D full size="sm" variant={phase === "pick" ? "neutral" : "blue"} disabled={phase === "shuffle" || phase === "pick"} onClick={start} className="mt-2">
        {phase === "idle" ? "Shuffle & play" : phase === "shuffle" ? "Shuffling…" : phase === "pick" ? "Выберите карту!" : "Play again"}
      </Btn3D>
    </Asset>
  );
}

/* =========================================================
   5. FLIP CLOCK COUNTDOWN
   ========================================================= */
function FlipDigit({ d }: { d: string }) {
  const [cur, setCur] = useState(d);
  const [prev, setPrev] = useState(d);
  const [k, setK] = useState(0);
  useEffect(() => { if (d !== cur) { setPrev(cur); setCur(d); setK((x) => x + 1); } }, [d]); // eslint-disable-line react-hooks/exhaustive-deps
  const half = "absolute inset-x-0 h-1/2 overflow-hidden bg-gradient-to-b from-[#1f336e] to-[#16275a] flex justify-center";
  return (
    <div className="relative w-11 h-16 rounded-xl" style={{ perspective: 300 }}>
      <div className={cn(half, "top-0 rounded-t-xl items-end")}><span className="num text-[38px] font-extrabold leading-none translate-y-1/2">{cur}</span></div>
      <div className={cn(half, "bottom-0 rounded-b-xl items-start bg-gradient-to-b from-[#1a2c62] to-[#13224e]")}><span className="num text-[38px] font-extrabold leading-none -translate-y-1/2">{prev}</span></div>
      {k > 0 && <>
        <div key={"t" + k} className={cn(half, "top-0 rounded-t-xl items-end origin-bottom")} style={{ animation: "flip-top .3s ease-in forwards", backfaceVisibility: "hidden" }}><span className="num text-[38px] font-extrabold leading-none translate-y-1/2">{prev}</span></div>
        <div key={"b" + k} className={cn(half, "bottom-0 rounded-b-xl items-start origin-top bg-gradient-to-b from-[#1a2c62] to-[#13224e]")} style={{ animation: "flip-bottom .3s .3s ease-out both", backfaceVisibility: "hidden" }}><span className="num text-[38px] font-extrabold leading-none -translate-y-1/2">{cur}</span></div>
      </>}
      <div className="absolute inset-x-0 top-1/2 h-[2px] -mt-px bg-[#0a1330] z-10" />
      <div className="absolute inset-0 rounded-xl shadow-[0_4px_0_#0b1536,inset_0_1px_0_rgba(255,255,255,.12)] pointer-events-none" />
    </div>
  );
}
function FlipClock() {
  const [t, setT] = useState(3 * 3600 + 59 * 60 + 12);
  const [ready, setReady] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0.1 });
  useEffect(() => {
    if (!inView || ready) return;
    const h = setInterval(() => setT((x) => { if (x <= 1) { setReady(true); sfx.levelUp(); return 0; } return x - 1; }), 1000);
    return () => clearInterval(h);
  }, [inView, ready]);
  const hh = String(Math.floor(t / 3600)).padStart(2, "0"), mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0"), ss = String(t % 60).padStart(2, "0");
  return (
    <Asset title="Flip Clock" id="rwd.flip" desc="Таймер до бесплатного сундука: механические флипы половинок. «Skip» — 5 секунд для демо.">
      <div ref={ref} className="flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          {[hh, mm, ss].map((grp, gi) => (
            <div key={gi} className="flex items-center gap-1.5">
              {grp.split("").map((d, i) => <FlipDigit key={i} d={d} />)}
              {gi < 2 && <span className="text-[26px] font-extrabold text-dim -mt-1 animate-pulse">:</span>}
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-1.5 text-[9.5px] font-extrabold uppercase text-dim"><span>hours</span><span>min</span><span>sec</span></div>
        {ready ? (
          <Btn3D full size="md" variant="gold" className="mt-4" icon={<Glyph name="chest" size={20} />} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); burstCoins(r.left + r.width / 2, r.top, 16); burstRing(r.left + r.width / 2, r.top, "#ffc53d"); sfx.coin(); setReady(false); setT(4 * 3600); }}>Open free chest</Btn3D>
        ) : (
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <Btn3D size="sm" variant="neutral" disabled>Wait</Btn3D>
            <Btn3D size="sm" variant="cyan" onClick={() => setT(5)}>Skip · 20 💎</Btn3D>
          </div>
        )}
      </div>
    </Asset>
  );
}

/* =========================================================
   6. DAILY LOGIN CALENDAR
   ========================================================= */
function DailyLogin() {
  const R: { g: G; v: string }[] = [{ g: "coin", v: "50" }, { g: "gem", v: "10" }, { g: "bolt", v: "x2" }, { g: "coin", v: "150" }, { g: "heart", v: "+3" }, { g: "gem", v: "40" }, { g: "chest", v: "EPIC" }];
  const [claimed, setClaimed] = useState(3);
  const [stamp, setStamp] = useState<number | null>(null);
  const claim = (i: number, el: HTMLElement) => {
    if (i !== claimed) { if (i > claimed) { shake("soft"); sfx.error(); } return; }
    setClaimed(i + 1); setStamp(i);
    const r = el.getBoundingClientRect();
    burstCoins(r.left + r.width / 2, r.top + r.height / 2, i === 6 ? 24 : 10);
    burstText(r.left + r.width / 2, r.top, `+${R[i].v}`);
    if (i === 6) { celebrate(); fanfare(); } else sfx.coin();
    haptic([15, 25]);
  };
  return (
    <Asset title="Daily Login Rewards" id="rwd.daily" desc="7-дневный календарь: печать «CLAIMED» со штамп-анимацией, будущие дни заблокированы, 7-й день — эпический сундук." className="lg:col-span-2">
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
        {R.map((r, i) => {
          const done = i < claimed, today = i === claimed, big = i === 6;
          return (
            <button key={i} onClick={(e) => claim(i, e.currentTarget)}
              className={cn("relative rounded-2xl p-2 pt-6 flex flex-col items-center gap-1 border-2 border-b-[5px] transition-all", big && "col-span-2 sm:col-span-1", today ? "border-gold bg-gold/10 -translate-y-1 anim-glow" : done ? "border-bull/40 bg-bull/5" : "border-[#22366f] bg-ink-850 opacity-70")}>
              <span className={cn("absolute top-1.5 left-2 text-[9.5px] font-extrabold uppercase", today ? "text-gold" : "text-dim")}>Day {i + 1}</span>
              <span className={cn(today && "anim-float", done && "opacity-50")}><Glyph name={r.g} size={big ? 40 : 30} /></span>
              <span className="num text-[12px] font-extrabold">{r.v}</span>
              {done && <span key={stamp === i ? "s" : "n"} className="absolute inset-0 grid place-items-center pointer-events-none"><span className="border-[3px] border-bull text-bull rounded-lg px-1.5 text-[10px] font-extrabold tracking-wider bg-ink-900/70" style={{ animation: stamp === i ? "stamp .5s cubic-bezier(.3,1.5,.5,1) both" : undefined, transform: "rotate(-10deg)" }}>CLAIMED</span></span>}
              {!done && !today && <Icon name="lock" size={12} className="absolute top-1.5 right-2 text-dim" />}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-[12px] font-bold text-mute">Серия входов: <span className="num text-gold">{claimed}/7</span></span>
        <Btn3D size="xs" variant="neutral" onClick={() => { setClaimed(0); setStamp(null); }}>Reset week</Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   7. TAP CLICKER "PUMP IT"
   ========================================================= */
function TapClicker() {
  const [taps, setTaps] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [combo, setCombo] = useState(0);
  const [sq, setSq] = useState(0);
  const [chart, setChart] = useState<number[]>(() => Array(30).fill(50));
  const lastTap = useRef(0);
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, threshold: 0 });
  useRafLoop((dt) => {
    setEnergy((e) => Math.min(100, e + dt * 6));
    if (performance.now() - lastTap.current > 700) setCombo((c) => Math.max(0, c - dt * 12));
    setChart((c) => { const last = c[c.length - 1]; return [...c.slice(1), Math.max(10, last - dt * 6 + (Math.random() - 0.5) * 1.2)]; });
  }, inView);
  const tap = (e: React.PointerEvent) => {
    if (energy < 1) { shake("soft"); sfx.error(); return; }
    lastTap.current = performance.now();
    const c = Math.min(50, combo + 1);
    const gain = 1 + Math.floor(c / 10);
    setTaps((t) => { const n = t + gain; if (Math.floor(n / 100) > Math.floor(t / 100)) { burstConfetti(e.clientX, e.clientY, 40, 1); sfx.levelUp(); } return n; });
    setCombo(c); setEnergy((x) => x - 1); setSq((s) => s + 1);
    setChart((ch) => { const a = [...ch]; a[a.length - 1] = Math.min(98, a[a.length - 1] + 2.5 * gain); return a; });
    burstText(e.clientX + (Math.random() - 0.5) * 30, e.clientY - 20, `+${gain}`, c > 20 ? "#ff8a3d" : "#ffc53d");
    burstSparks(e.clientX, e.clientY, 5, "#ffd24a");
    sfx.coin(); haptic(6);
  };
  const pts = chart.map((v, i) => `${(i / 29) * 200},${100 - v}`).join(" ");
  return (
    <Asset title="Tap to Pump" id="rwd.clicker" desc="Кликер: каждый тап «пампит» график, монета сжимается (squash), комбо увеличивает награду, энергия восстанавливается.">
      <div ref={ref} className="relative inset !rounded-2xl p-3 overflow-hidden">
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none">
          <defs><linearGradient id="tc-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1fdb8b" stopOpacity=".35" /><stop offset="1" stopColor="#1fdb8b" stopOpacity="0" /></linearGradient></defs>
          <polygon points={`0,100 ${pts} 200,100`} fill="url(#tc-g)" />
          <polyline points={pts} fill="none" stroke="#1fdb8b" strokeWidth="1.5" />
        </svg>
        <div className="relative flex items-center justify-between">
          <div><div className="label-caps !mb-0">Pumped</div><div className="num text-[22px] font-extrabold text-gold">{taps.toLocaleString()}</div></div>
          <Badge tone={combo > 20 ? "bear" : combo > 8 ? "gold" : "neutral"}><Glyph name="flame" size={12} /> x{1 + Math.floor(combo / 10)} · {Math.round(combo)}</Badge>
        </div>
        <div className="relative h-[150px] grid place-items-center">
          <button onPointerDown={tap} className="relative select-none touch-manipulation active:brightness-110" aria-label="tap">
            <div className="absolute -inset-4 rounded-full bg-gold/20 blur-xl" style={{ opacity: 0.3 + combo / 60 }} />
            <div key={sq} style={{ animation: "squash .28s cubic-bezier(.3,1.5,.5,1)" }}><Glyph name="coin" size={110} /></div>
          </button>
        </div>
        <div className="relative flex items-center gap-2"><Glyph name="bolt" size={16} /><div className="flex-1"><Bar value={energy} tone="cyan" h={8} /></div><span className="num text-[10.5px] font-extrabold w-8">{Math.floor(energy)}</span></div>
      </div>
    </Asset>
  );
}

/* =========================================================
   8. LOOT BOX RARITY REVEAL
   ========================================================= */
const RAR = [
  { n: "Common", c: "#8e9cc8", w: 50, g: "coin" as G, item: "150 монет" },
  { n: "Rare", c: "#3d7bff", w: 30, g: "gem" as G, item: "80 кристаллов" },
  { n: "Epic", c: "#8d5cff", w: 15, g: "bolt" as G, item: "XP Boost ×3" },
  { n: "Legendary", c: "#ffc53d", w: 5, g: "crown" as G, item: "Скин Golden Bull" },
];
function LootBox() {
  const [st, setSt] = useState<"idle" | "charge" | "open">("idle");
  const [res, setRes] = useState(RAR[0]);
  const [charge, setCharge] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const open = () => {
    if (st !== "idle") return;
    let r = Math.random() * 100, pick = RAR[0];
    for (const x of RAR) { if (r < x.w) { pick = x; break; } r -= x.w; }
    setRes(pick); setSt("charge"); setCharge(0);
    const t0 = performance.now();
    const loop = (t: number) => {
      const k = clamp((t - t0) / 1600);
      setCharge(k);
      if (Math.floor(k * 12) !== Math.floor(clamp((t - 16 - t0) / 1600) * 12)) { sfx.tick(); haptic(4 + k * 10); }
      if (k < 1) requestAnimationFrame(loop);
      else {
        setSt("open");
        const b = box.current?.getBoundingClientRect();
        if (b) { burstRing(b.left + b.width / 2, b.top + b.height / 2, pick.c, 240); burstSparks(b.left + b.width / 2, b.top + b.height / 2, 40, pick.c); }
        if (pick.n === "Legendary") { celebrate(); fanfare(); } else if (pick.n === "Epic") { if (b) burstConfetti(b.left + b.width / 2, b.top + b.height / 2, 50, 1); sfx.levelUp(); } else sfx.success();
      }
    };
    requestAnimationFrame(loop);
  };
  const col = st === "idle" ? "#3d7bff" : res.c;
  return (
    <Asset title="Loot Box Reveal" id="rwd.loot" desc="Заряд с нарастающей тряской и свечением цвета редкости → вспышка → предмет. Шансы: 50/30/15/5.">
      <div ref={box} className="relative h-[230px] grid place-items-center rounded-2xl overflow-hidden" style={{ background: `radial-gradient(circle at 50% 55%, ${col}${st === "idle" ? "22" : "44"}, transparent 65%)` }}>
        {st === "open" && <div className="absolute size-[340px] opacity-70" style={{ background: `repeating-conic-gradient(from 0deg, ${res.c}40 0 10deg, transparent 10deg 20deg)`, animation: "ray 8s linear infinite", maskImage: "radial-gradient(circle, #000 20%, transparent 65%)" }} />}
        {st !== "open" ? (
          <button onClick={open} className="relative" style={{ animation: st === "charge" ? `box-shake ${0.3 - charge * 0.22}s linear infinite` : "floaty 3s ease-in-out infinite" }}>
            <div className="absolute -inset-6 rounded-full blur-2xl" style={{ background: col, opacity: 0.2 + charge * 0.6 }} />
            <div className="relative" style={{ transform: `scale(${1 + charge * 0.15})`, filter: `drop-shadow(0 0 ${charge * 30}px ${col})` }}><Glyph name="chest" size={120} /></div>
          </button>
        ) : (
          <div className="relative text-center anim-scale">
            <div className="anim-float"><Glyph name={res.g} size={90} /></div>
            <Badge tone={res.n === "Legendary" ? "gold" : res.n === "Epic" ? "violet" : res.n === "Rare" ? "blue" : "neutral"} className="mt-2">{res.n}</Badge>
            <div className="font-extrabold text-[18px] mt-1" style={{ color: res.c }}>{res.item}</div>
          </div>
        )}
      </div>
      <div className="flex gap-1 mt-3">{RAR.map((r) => <div key={r.n} className="flex-1 text-center"><div className="h-1.5 rounded-full" style={{ background: r.c, opacity: st === "open" && res.n === r.n ? 1 : 0.35 }} /><div className="text-[9px] font-extrabold mt-1 text-dim">{r.w}%</div></div>)}</div>
      <Btn3D full size="sm" variant={st === "open" ? "bull" : "blue"} className="mt-3" disabled={st === "charge"} onClick={() => (st === "open" ? setSt("idle") : open())}>{st === "open" ? "Collect" : st === "charge" ? "Opening…" : "Open · 100 💎"}</Btn3D>
    </Asset>
  );
}

export default function Rewards() {
  return (
    <Section id="rewards" index="14" title="Reward Mini-games" subtitle="8 игровых механик наград: колесо фортуны, скретч-карта, слоты, выбор карты, flip-таймер, ежедневные входы, кликер, лутбокс" count={8}>
      <div className="grid lg:grid-cols-3 gap-6">
        <WheelOfFortune />
        <SlotMachine />
        <ScratchCard />
        <PickCard />
        <DailyLogin />
        <FlipClock />
        <TapClicker />
        <LootBox />
      </div>
    </Section>
  );
}
