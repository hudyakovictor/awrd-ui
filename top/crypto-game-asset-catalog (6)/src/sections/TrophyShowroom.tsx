import { useRef, useState } from "react";
import { Asset, Badge, Btn3D, Section } from "../components/ui";
import { Glyph, Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";
import { fanfare } from "../utils/music";
import { celebrate } from "../utils/fx";
import { clamp } from "../hooks/motion";

/* =========================================================
   1. 360° ROTATABLE 3D TROPHY WITH SPECULAR SHADERS
   ========================================================= */
type TrophyMaterial = "gold" | "platinum" | "obsidian" | "holographic";

function TrophyViewer() {
  const [rotY, setRotY] = useState(25);
  const [rotX, setRotX] = useState(-10);
  const [material, setMaterial] = useState<TrophyMaterial>("gold");
  const [inspecting, setInspecting] = useState(false);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const matConfig: Record<TrophyMaterial, { name: string; bg: string; shine: string; glow: string; textCol: string }> = {
    gold: {
      name: "Aurum Grandmaster",
      bg: "linear-gradient(135deg, #ffe27a 0%, #ffc53d 40%, #c38709 70%, #f0a811 100%)",
      shine: "rgba(255, 255, 255, 0.75)",
      glow: "rgba(255, 197, 61, 0.45)",
      textCol: "#ffc53d",
    },
    platinum: {
      name: "Platinum Sovereign",
      bg: "linear-gradient(135deg, #ffffff 0%, #c9d5f5 40%, #7d8fc4 75%, #dfe7ff 100%)",
      shine: "rgba(255, 255, 255, 0.9)",
      glow: "rgba(141, 170, 255, 0.45)",
      textCol: "#c9d5f5",
    },
    obsidian: {
      name: "Obsidian Void",
      bg: "linear-gradient(135deg, #2b314d 0%, #11172f 50%, #050a18 100%)",
      shine: "rgba(141, 92, 255, 0.8)",
      glow: "rgba(141, 92, 255, 0.5)",
      textCol: "#8d5cff",
    },
    holographic: {
      name: "Hyper-Dimensional",
      bg: "linear-gradient(135deg, #ff4d6a 0%, #ffc53d 25%, #1fdb8b 50%, #2ed3f0 75%, #8d5cff 100%)",
      shine: "rgba(255, 255, 255, 0.9)",
      glow: "rgba(46, 211, 240, 0.55)",
      textCol: "#2ed3f0",
    },
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setRotY((prev) => prev + dx * 0.9);
    setRotX((prev) => clamp(prev - dy * 0.7, -45, 45));
  };

  const currentMat = matConfig[material];

  return (
    <Asset title="3D Rotatable Championship Trophy" id="trophy.view" desc="360° вращение кубка по X и Y осям: шейдеры материалов (золото, платина, обсидиан, голограмма), динамический блик от угла света." className="lg:col-span-2" tags={["3D"]}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5">
          {(["gold", "platinum", "obsidian", "holographic"] as TrophyMaterial[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMaterial(m);
                sfx.pop();
                haptic(6);
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold capitalize transition-all",
                material === m ? "bg-blue text-white shadow-[0_2px_0_#2250c2]" : "bg-white/5 text-mute hover:bg-white/10"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Btn3D size="xs" variant="gold" onClick={() => setInspecting(!inspecting)}>
          {inspecting ? "Close Details" : "Inspect Lore"}
        </Btn3D>
      </div>

      {/* 3D Trophy Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => (isDragging.current = false)}
        onPointerCancel={() => (isDragging.current = false)}
        className="relative h-[280px] inset !rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none grid place-items-center"
        style={{ perspective: 1000 }}
      >
        {/* Ambient pedestal glow */}
        <div
          className="absolute bottom-6 size-48 rounded-full blur-3xl transition-colors duration-500"
          style={{ background: currentMat.glow }}
        />

        {/* 3D Trophy Mesh Container */}
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* Trophy Cup Graphic */}
          <div
            className="relative size-44 rounded-3xl grid place-items-center shadow-2xl transition-all duration-500"
            style={{
              background: currentMat.bg,
              boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${currentMat.glow}`,
            }}
          >
            {/* Specular highlight sweep */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none opacity-60"
              style={{
                background: `radial-gradient(circle at ${50 + (rotY % 180) * 0.4}% ${50 + rotX * 0.8}%, ${currentMat.shine}, transparent 60%)`,
              }}
            />
            <Icon name="trophy" size={88} className="text-white drop-shadow-md" />
          </div>

          {/* Pedestal */}
          <div
            className="w-48 h-8 mx-auto -mt-3 rounded-xl bg-gradient-to-b from-[#1b2c5e] to-[#0c1638] border border-white/20 shadow-[0_8px_0_#081028] grid place-items-center"
            style={{ transform: "translateZ(15px)" }}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90">
              TRADELINGO APEX
            </span>
          </div>
        </div>

        <div className="absolute bottom-2 text-[10px] font-extrabold text-dim">
          Тяните в любую сторону для вращения на 360°
        </div>
      </div>

      {inspecting && (
        <div className="inset p-3 mt-3 anim-scale">
          <div className="flex justify-between items-center text-[12px] font-extrabold mb-1">
            <span style={{ color: currentMat.textCol }}>{currentMat.name}</span>
            <Badge tone="gold" size="xs">Season 1 Trophy</Badge>
          </div>
          <p className="text-[11.5px] text-mute leading-snug">
            Присуждается трейдерам, достигшим 50 уровня без ликвидаций в течение 30-дневного рейтингового марафона.
          </p>
        </div>
      )}
    </Asset>
  );
}

/* =========================================================
   2. CHAMPIONSHIP RINGS UNLOCK CEREMONY
   ========================================================= */
const RINGS = [
  { name: "Bull Market Ring", tier: "Gold I", color: "#ffc53d", glyph: "flame" as const },
  { name: "Diamond Hands Ring", tier: "Diamond II", color: "#2ed3f0", glyph: "gem" as const },
  { name: "Whale Sovereign Ring", tier: "Master Apex", color: "#8d5cff", glyph: "crown" as const },
];

function ChampionshipRings() {
  const [activeRing, setActiveRing] = useState(0);
  const [unlocked, setUnlocked] = useState<boolean[]>([true, false, false]);
  const [ceremony, setCeremony] = useState(false);

  const unlockRing = (idx: number) => {
    if (unlocked[idx]) return;
    setCeremony(true);
    sfx.whoosh();
    haptic([20, 40, 80]);

    setTimeout(() => {
      setUnlocked((prev) => {
        const next = [...prev];
        next[idx] = true;
        return next;
      });
      setCeremony(false);
      celebrate();
      fanfare();
    }, 1200);
  };

  const ring = RINGS[activeRing];
  const isUnlocked = unlocked[activeRing];

  return (
    <Asset title="Championship Rings Ceremony" id="trophy.rings" desc="Перстни победителей турниров: церемония вручения с золотыми лучами, взрывом конфетти и тактильным откликом." className="lg:col-span-1" tags={["CEREMONY"]}>
      <div className="flex flex-col items-center">
        {/* Ring Preview Stage */}
        <div className="relative size-44 rounded-3xl inset !rounded-3xl overflow-hidden grid place-items-center mb-3">
          {ceremony && (
            <div
              className="absolute inset-0 opacity-80"
              style={{
                background: "repeating-conic-gradient(from 0deg, rgba(255,197,61,0.3) 0 12deg, transparent 12deg 24deg)",
                animation: "ray 6s linear infinite",
              }}
            />
          )}

          <div className={cn("relative transition-all duration-500", ceremony ? "scale-125 animate-bounce" : isUnlocked ? "anim-float" : "opacity-40 grayscale")}>
            <div className="relative size-24 rounded-full border-4 border-white/40 grid place-items-center shadow-[0_0_24px_rgba(255,197,61,0.5)]" style={{ background: `radial-gradient(circle, ${ring.color}66, #0a1330)` }}>
              <Glyph name={ring.glyph} size={48} />
            </div>
          </div>

          {!isUnlocked && !ceremony && (
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px] grid place-items-center">
              <Icon name="lock" size={24} className="text-white/60" />
            </div>
          )}
        </div>

        {/* Ring Selector Tabs */}
        <div className="flex gap-1.5 w-full mb-3">
          {RINGS.map((r, i) => (
            <button
              key={r.name}
              onClick={() => {
                setActiveRing(i);
                sfx.tap();
              }}
              className={cn(
                "flex-1 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border",
                activeRing === i ? "bg-blue/20 border-blue text-white" : "border-white/5 bg-white/5 text-mute"
              )}
            >
              #{i + 1}
            </button>
          ))}
        </div>

        <div className="text-center mb-3">
          <span className="text-[13px] font-extrabold block">{ring.name}</span>
          <span className="text-[10px] font-bold text-dim">{ring.tier}</span>
        </div>

        {isUnlocked ? (
          <Badge tone="bull" size="sm" className="w-full justify-center">
            Claimed & Owned ✓
          </Badge>
        ) : (
          <Btn3D size="sm" variant="gold" full loading={ceremony} onClick={() => unlockRing(activeRing)}>
            Unlock Ring Ceremony
          </Btn3D>
        )}
      </div>
    </Asset>
  );
}

/* =========================================================
   3. PRESTIGE CRESTS & RANKED TIERS
   ========================================================= */
const CRESTS = [
  { rank: "Silver II", rp: 1420, maxRp: 2000, glyph: "shield" as const, color: "#8fb3ff" },
  { rank: "Gold I", rp: 2850, maxRp: 3000, glyph: "star" as const, color: "#ffc53d" },
  { rank: "Diamond III", rp: 4890, maxRp: 5000, glyph: "gem" as const, color: "#2ed3f0" },
  { rank: "Apex Predator", rp: 9999, maxRp: 9999, glyph: "crown" as const, color: "#8d5cff" },
];

function PrestigeCrests() {
  const [currentIdx, setCurrentIdx] = useState(1);
  const crest = CRESTS[currentIdx];

  const levelUpRank = () => {
    sfx.levelUp();
    haptic([30, 50, 90]);
    celebrate();
    setCurrentIdx((prev) => (prev + 1) % CRESTS.length);
  };

  const progressPct = (crest.rp / crest.maxRp) * 100;

  return (
    <Asset title="Ranked Prestige Crests" id="trophy.crests" desc="Гербы соревновательного ранга: динамические частицы ауры, шкала рейтинговых очков (RP), переход на следующий дивизион." className="lg:col-span-3" tags={["RANKS"]}>
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        {CRESTS.map((cr, i) => (
          <button
            key={cr.rank}
            onClick={() => {
              setCurrentIdx(i);
              sfx.tick();
            }}
            className={cn(
              "raised p-3 text-center rounded-2xl border transition-all",
              currentIdx === i ? "border-gold/60 ring-2 ring-gold/40 -translate-y-1" : "border-white/5 opacity-60 hover:opacity-100"
            )}
          >
            <div className="size-12 mx-auto rounded-xl grid place-items-center mb-1.5" style={{ background: `${cr.color}22` }}>
              <Glyph name={cr.glyph} size={30} />
            </div>
            <span className="text-[12px] font-extrabold block" style={{ color: cr.color }}>
              {cr.rank}
            </span>
            <span className="num text-[10px] text-dim font-bold">{cr.rp} RP</span>
          </button>
        ))}
      </div>

      <div className="inset !rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl grid place-items-center shadow-lg" style={{ background: `${crest.color}25`, border: `2px solid ${crest.color}` }}>
            <Glyph name={crest.glyph} size={38} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-extrabold text-txt">{crest.rank}</span>
              <Badge tone="gold" size="xs">Season 4 Active</Badge>
            </div>
            <div className="w-56 mt-2">
              <div className="flex justify-between text-[10px] font-extrabold text-mute mb-1">
                <span>Rank Progress</span>
                <span className="num">{crest.rp} / {crest.maxRp} RP</span>
              </div>
              <div className="h-2 rounded-full bg-[#16275a] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, backgroundColor: crest.color }} />
              </div>
            </div>
          </div>
        </div>

        <Btn3D size="sm" variant="gold" onClick={levelUpRank} icon={<Glyph name="crown" size={16} />}>
          Promote Next Rank
        </Btn3D>
      </div>
    </Asset>
  );
}

export default function TrophyShowroom() {
  return (
    <Section id="trophyshowroom" index="19" title="Trophy Showroom & Crests" subtitle="3D зал славы: 360° вращение кубка с шейдерами материалов, чемпионские перстни с церемонией вручения, гербы престижа" count={3}>
      <div className="grid lg:grid-cols-3 gap-6">
        <TrophyViewer />
        <ChampionshipRings />
        <PrestigeCrests />
      </div>
    </Section>
  );
}
