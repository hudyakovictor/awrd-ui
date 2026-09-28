import { useState } from "react";
import { Asset, Btn3D, Section, Badge, Toggle } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { burstConfetti, burstCoins, burstRing, burstStars, shake } from "../utils/fx";

export type Mood = "idle" | "cheer" | "worried";
export const MASCOT_IMG: Record<Mood, string> = {
  idle: "images/mascot-idle.png",
  cheer: "images/mascot-cheer.png",
  worried: "images/mascot-worried.png",
};

export function Mascot({ mood = "idle", size = 120, className, bubble, bg = true }: { mood?: Mood; size?: number; className?: string; bubble?: string; bg?: boolean }) {
  return (
    <div className={cn("relative inline-flex flex-col items-center", className)} style={{ width: size }}>
      {bubble && (
        <div key={bubble} className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 max-w-[190px] whitespace-normal rounded-2xl bg-white px-3 py-1.5 text-center text-[11.5px] font-extrabold text-[#0d3b2e] shadow-[0_3px_0_#b9c6e8] anim-pop">
          {bubble}
          <i className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 size-2.5 rotate-45 bg-white" />
        </div>
      )}
      <div className="relative" style={{ width: size, height: size }}>
        {mood === "cheer" && (
          <div className="absolute -inset-6 opacity-80" style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,.28) 0 14deg, transparent 14deg 30deg)", animation: "ray 9s linear infinite", maskImage: "radial-gradient(circle, #000 25%, transparent 68%)" }} />
        )}
        {mood === "cheer" && <div className="absolute -inset-3 rounded-full bg-gold/30 blur-xl" />}
        {bg && <div className="absolute inset-0 rounded-full bg-[#0A1330] shadow-[inset_0_4px_14px_rgba(0,0,0,.5),0_10px_30px_rgba(0,0,0,.45)] ring-1 ring-white/10" />}
        <img
          src={MASCOT_IMG[mood]}
          alt="Bulli, the Tradelingo mascot"
          draggable={false}
          className={cn("relative w-full h-full object-contain select-none", mood === "idle" && "anim-float", mood === "cheer" && "anim-pop", mood === "worried" && "grayscale-[.35] saturate-75")}
          style={mood === "worried" ? { transform: "rotate(-4deg)" } : undefined}
        />
      </div>
    </div>
  );
}

/* ================= SECTION ================= */
function MoodShowcase() {
  const [mood, setMood] = useState<Mood>("idle");
  const [line, setLine] = useState("Погнали? Я тут всё проверил.");
  const pick = (m: Mood, l: string) => {
    setMood(m); setLine(l);
    const r = (document.activeElement as HTMLElement)?.getBoundingClientRect();
    const x = r ? r.left + r.width / 2 : innerWidth / 2;
    const y = r ? r.top : innerHeight / 2;
    if (m === "cheer") { burstConfetti(innerWidth / 2, innerHeight / 2 - 100, 30, 0.8); burstRing(x, y, "#ffc53d"); sfx.success(); }
    if (m === "worried") { shake("soft"); sfx.error(); }
    if (m === "idle") sfx.pop();
    haptic(10);
  };
  return (
    <Asset title="Character & Reactions" id="mascot.reactions" desc="Три состояния маскота: idle (парение), cheer (конфетти + лучи), worried (наклон, де-нео + shake).">
      <div className="grid sm:grid-cols-[220px_1fr] gap-6 items-center">
        <div className="inset !rounded-3xl h-64 grid place-items-center relative overflow-hidden">
          <div className="absolute inset-x-8 bottom-6 h-2 rounded-full bg-black/40 blur-sm" />
          <Mascot mood={mood} size={170} bubble={line} />
        </div>
        <div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Btn3D size="sm" variant={mood === "idle" ? "blue" : "neutral"} onClick={() => pick("idle", "Погнали? Я тут всё проверил.")}>Idle</Btn3D>
            <Btn3D size="sm" variant={mood === "cheer" ? "gold" : "neutral"} onClick={() => pick("cheer", "Это был чистый альфа!")}>Cheer</Btn3D>
            <Btn3D size="sm" variant={mood === "worried" ? "bear" : "neutral"} onClick={() => pick("worried", "Стоп-лосс на эмоции!")}>Worried</Btn3D>
          </div>
          <div className="inset p-3 space-y-2 text-[12px] font-semibold">
            {[["idle", "Держит внимание на экране урока", "text-blue"], ["cheer", "Верный ответ · level up · награда", "text-gold"], ["worried", "Ошибка · мало сердец · риск", "text-bear"]].map(([m, d, c]) => (
              <div key={m} className="flex items-center gap-2"><span className={cn("size-2 rounded-full bg-current", c)} /><span className="font-extrabold w-20">{m}</span><span className="text-mute">{d}</span></div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Btn3D size="xs" variant="gold" icon={<Icon name="sparkles" size={12} />} onClick={() => { burstCoins(innerWidth / 2, innerHeight / 2, 16); fanfare(); }}>Reward burst</Btn3D>
            <Btn3D size="xs" variant="neutral" icon={<Icon name="warning" size={12} />} onClick={() => { shake("hard"); }}>Screen shake</Btn3D>
          </div>
        </div>
      </div>
    </Asset>
  );
}

function SpeechLines() {
  const [i, setI] = useState(0);
  const LINES = [
    { mood: "idle" as Mood, t: "Рынок — это волны, а не прямые линии." },
    { mood: "cheer" as Mood, t: "Серия 47 дней! Ты машина." },
    { mood: "worried" as Mood, t: "Без стоп-лосса ты не трейдер, ты жертва." },
    { mood: "idle" as Mood, t: "FOMO — главный налог на эмоции." },
    { mood: "cheer" as Mood, t: "Diamond hands! Держим до TP." },
    { mood: "worried" as Mood, t: "Плечо 100x? Ты точно в этом разбираешься?" },
  ];
  const l = LINES[i % LINES.length];
  return (
    <Asset title="Voice Lines" id="mascot.voice" desc="Реплики маскота привязаны к событиям игры. Клик — следующая фраза.">
      <div className="inset !rounded-3xl p-5 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 size-32 rounded-full bg-blue/10 blur-2xl" />
        <Mascot mood={l.mood} size={110} />
        <div key={i} className="text-center text-[14px] font-bold mt-3 leading-snug anim-fade min-h-[44px]">
          <span className="inline-block bg-[#142350] border border-white/10 rounded-2xl px-4 py-2 shadow-[0_4px_0_#0b1536]">«{l.t}»</span>
        </div>
        <Btn3D size="sm" variant="neutral" full className="mt-4" onClick={() => { setI(i + 1); sfx.pop(); }}>Next line</Btn3D>
      </div>
    </Asset>
  );
}

function MascotFX() {
  const [ambient, setAmbient] = useState(true);
  const [coin, setCoin] = useState(true);
  return (
    <Asset title="Juice Layer" id="mascot.juice" desc="Глобальный canvas-слой: конфетти, монеты, искры, rings, stars, всплывающий текст. + screen shake и hit-flash.">
      <div className="inset p-4">
        <div className="flex flex-wrap gap-2">
          <Btn3D size="sm" variant="bull" onClick={() => { burstConfetti(innerWidth / 2, innerHeight / 2, 50, 1.2); burstRing(innerWidth / 2, innerHeight / 2, "#1fdb8b", 160); sfx.success(); }} icon={<Icon name="sparkles" size={14} />}>Confetti</Btn3D>
          <Btn3D size="sm" variant="gold" onClick={() => { burstCoins(innerWidth / 2, innerHeight / 2, 18); sfx.coin(); }}>Coins</Btn3D>
          <Btn3D size="sm" variant="violet" onClick={() => { burstStars(innerWidth / 2, innerHeight / 2, 12); sfx.pop(); }}>Stars</Btn3D>
          <Btn3D size="sm" variant="cyan" onClick={() => { burstRing(innerWidth / 2, innerHeight / 2, "#2ed3f0", 200); burstConfetti(innerWidth / 2, innerHeight / 2, 24, 0.9); sfx.whoosh(); }}>Ring wave</Btn3D>
          <Btn3D size="sm" variant="bear" onClick={() => { shake("hard"); sfx.error(); }}>Shake</Btn3D>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0c1737]"><span className="text-[12px] font-bold">Амбиент-частицы</span><Toggle size="sm" on={ambient} onChange={setAmbient} tone="blue" /></div>
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0c1737]"><span className="text-[12px] font-bold">Монеты в наградах</span><Toggle size="sm" on={coin} onChange={setCoin} tone="gold" /></div>
        </div>
        <div className="text-[11px] text-dim mt-3 leading-relaxed">
          Слой читается всеми разделами каталога: урок, лига, сундук и results-экран используют один и тот же движок.
          <Badge tone="cyan" size="xs" className="ml-2">canvas · 60fps · ≤900 частиц</Badge>
        </div>
      </div>
    </Asset>
  );
}

export default function MascotSection() {
  return (
    <Section id="mascot" index="19" title="Mascot & Juice" subtitle="Bulli — персонаж системы: реакции, реплики и глобальный слой соков" count={4}>
      <div className="grid lg:grid-cols-3 gap-6">
        <MoodShowcase />
        <SpeechLines />
        <MascotFX />
        <div className="lg:col-span-3 panel p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: "radial-gradient(#8fb3ff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            <Mascot mood="idle" size={150} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2"><Badge tone="gold">Meet Bulli</Badge><Badge tone="bull">v4 mascot</Badge></div>
              <h3 className="text-2xl font-extrabold">Каждый ассет должен «чувствоваться»</h3>
              <p className="text-mute text-[13.5px] mt-2 max-w-xl leading-relaxed">
                Bulli — взрослый, не детский по стилю персонаж: тёмно-синяя худи, неоновые акценты, характер. Он реагирует на каждое событие: парит в idle, празднует победы с лучами и конфетти, наклоняется и бледнеет при ошибках.
                Под ним работает общий canvas-слой частиц, screen shake и hit-flash — тот самый «juice», который отличает игру от приложения.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 shrink-0">
              {(["idle", "cheer", "worried"] as Mood[]).map((m) => (
                <div key={m} className="raised p-2 text-center w-24">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#0A1330] overflow-hidden ring-1 ring-white/10">
                    <img src={MASCOT_IMG[m]} alt={m} className="w-full h-full object-contain" draggable={false} />
                  </div>
                  <div className="text-[10px] font-extrabold mt-1.5 text-mute">{m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
