import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Lock, Swords } from "lucide-react";
import { ArtImage, StarIcon } from "../components/ui";
import { LEVELS, MONSTERS, LevelNode, nodeState } from "../data/game";
import { cn } from "../utils/cn";

const enemyOf = (id?: string) => MONSTERS.find((m) => m.id === id);

export default function MapScreen({ onFight }: { onFight: (l: LevelNode) => void }) {
  const current = LEVELS.find((l) => nodeState(l) === "current");
  const curRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => curRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
    return () => clearTimeout(t);
  }, []);

  const path = useMemo(() => {
    const pts = [...LEVELS].sort((a, b) => b.y - a.y); // bottom -> top
    let d = `M ${pts[0].x} ${1060 - ((1060 - pts[0].y))}`;
    d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const my = (p.y + c.y) / 2;
      d += ` C ${p.x} ${my}, ${c.x} ${my}, ${c.x} ${c.y}`;
    }
    return d;
  }, []);

  return (
    <div className="relative flex-1 min-h-0">
      <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain px-4 pb-6 mask-fade-b">
        <div className="relative mx-auto mt-3 h-[1140px] max-w-[380px]">
          {/* header plate */}
          <div className="sticky top-0 z-20 -mx-4 flex justify-center pb-2 pt-1" style={{ background: "linear-gradient(180deg,#081430 30%,transparent)" }}>
            <div className="panel-soft rounded-2xl px-5 py-2 text-center card-shine">
              <div className="font-display text-[15px] font-black italic uppercase tracking-wide tstrok">Арена сигналов</div>
              <div className="font-mono text-[10px] text-teal">СЕЗОН I · УР. 1–12</div>
            </div>
          </div>

          {/* connecting path */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 1126" preserveAspectRatio="none">
            <path d={scalePath(path)} fill="none" stroke="#0b1838" strokeWidth="14" strokeLinecap="round" transform="translate(0,0)" />
            <path d={scalePath(path)} fill="none" stroke="#31579f" strokeWidth="8" strokeLinecap="round" />
            <path d={scalePath(path)} fill="none" stroke="#19f2c4" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 10" className="anim-dash" opacity=".8" />
          </svg>

          {/* decor */}
          <Decor />

          {/* nodes */}
          {LEVELS.map((l, i) => (
            <Node key={l.id} l={l} idx={i} refCb={current?.id === l.id ? curRef : undefined} onFight={onFight} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* keep viewBox == pixel coords (container max-w 380 is close to 100 units * 3.8) */
function scalePath(d: string) {
  return d.replace(/([MLC])\s*([\d.]+)/g, (_m, cmd, x) => `${cmd} ${(+x / 100) * 100}`);
}

function Node({ l, idx, refCb, onFight }: { l: LevelNode; idx: number; refCb?: React.Ref<HTMLDivElement>; onFight: (l: LevelNode) => void }) {
  const st = nodeState(l);
  const enemy = enemyOf(l.enemyId);
  const left = `${l.x}%`;
  const top = l.y;

  if (l.type === "chest") return <ChestNode st={st} left={left} top={top} />;
  if (l.type === "boss") return <BossNode st={st} left={left} top={top} enemyArt={enemy?.art} tint={enemy?.tint ?? "#ffe066"} />;

  const isCurrent = st === "current";
  const done = st === "done";
  const size = l.type === "elite" ? 62 : 56;

  return (
    <motion.div
      ref={refCb as React.Ref<HTMLDivElement>}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left, top }}
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay: idx * 0.02 }}
    >
      {/* stars for completed */}
      {done && (
        <div className="absolute -top-9 left-1/2 z-10 flex -translate-x-1/2 gap-[1px]">
          {[0, 1, 2].map((i) => (
            <span key={i} className={i === 1 ? "-translate-y-1" : ""}><StarIcon size={15} on={i < l.stars} /></span>
          ))}
        </div>
      )}

      {isCurrent && <span className="absolute inset-[-14px] rounded-full anim-ring" />}

      <motion.button
        whileTap={st !== "locked" ? { scale: 0.88 } : undefined}
        onClick={() => isCurrent && onFight(l)}
        className={cn("relative grid place-items-center rounded-full", isCurrent && "anim-breathe")}
        style={{
          width: size, height: size,
          background: done
            ? "linear-gradient(180deg,#ffe066,#ff9a1f)"
            : isCurrent
              ? "linear-gradient(180deg,#1cf5c7,#07bbd8)"
              : "linear-gradient(180deg,#223d78,#132450)",
          boxShadow: done
            ? "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -5px 0 #b45d06, 0 8px 16px -6px rgba(255,170,40,.5)"
            : isCurrent
              ? "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -5px 0 #066a80, 0 10px 22px -6px rgba(16,224,196,.65)"
              : "inset 0 2px 0 rgba(140,180,255,.25), inset 0 -5px 0 #0b1838",
        }}
      >
        {l.type === "elite" && !done && <Crown size={15} className="absolute -top-2 left-1/2 -translate-x-1/2 text-gold" />}
        {done ? (
          <Check size={26} strokeWidth={3.5} className="text-[#4d2c07]" />
        ) : st === "locked" ? (
          <Lock size={20} className="text-sky/50" />
        ) : (
          <span className="tstrok-sm font-display text-[22px] font-black italic">{l.id}</span>
        )}
      </motion.button>

      {isCurrent && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="rounded-full bg-teal px-2.5 py-0.5 font-display text-[10px] font-black uppercase tracking-wider text-[#06283b] anim-breathe inline-block"
            style={{ boxShadow: "0 4px 10px rgba(25,242,196,.5)" }}>
            Ты здесь
          </span>
        </div>
      )}

      {isCurrent && enemy && (
        <div className="absolute -right-9 -top-6 h-11 w-11 -rotate-6 overflow-hidden rounded-xl ring-2 ring-pink anim-floaty2"
          style={{ boxShadow: "0 6px 14px rgba(0,0,0,.5)" }}>
          <ArtImage src={enemy.art} alt={enemy.name} tint={enemy.tint} className="h-full w-full" />
        </div>
      )}
    </motion.div>
  );
}

function ChestNode({ st, left, top }: { st: string; left: string; top: number }) {
  const opened = st === "done";
  return (
    <motion.div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left, top }}
      initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 15 }}>
      <div className={cn("panel-soft grid h-12 w-14 place-items-center rounded-2xl", !opened && "grayscale-[.4] opacity-80")}>
        <svg width="30" height="26" viewBox="0 0 30 26">
          <rect x="2" y="9" width="26" height="15" rx="3" fill={opened ? "#7a5a22" : "#a3742a"} stroke="#5e4212" strokeWidth="2" />
          <path d="M2 12c0-5 5-9 13-9s13 4 13 9" fill={opened ? "#8a6626" : "#c08a35"} stroke="#5e4212" strokeWidth="2" />
          <rect x="12.5" y="10" width="5" height="7" rx="1.5" fill={opened ? "#3a2c10" : "#ffe066"} stroke="#5e4212" strokeWidth="1.5" />
        </svg>
      </div>
      <span className="mt-1 block text-center font-mono text-[9px] text-sky/60">ЛУТ</span>
    </motion.div>
  );
}

function BossNode({ st, left, top, enemyArt, tint }: { st: string; left: string; top: number; enemyArt?: string; tint: string }) {
  return (
    <motion.div className="absolute z-10 -translate-x-1/2 -translate-y-1/2" style={{ left, top }}
      initial={{ scale: 0, y: 20 }} whileInView={{ scale: 1, y: 0 }} viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}>
      <div className="relative">
        <span className="absolute inset-[-10px] rounded-[26px] anim-ring" style={{ animationDuration: "2.6s" }} />
        <div className="relative grid h-24 w-24 place-items-center rounded-[26px] p-1"
          style={{ background: "linear-gradient(160deg,#3a1430,#141030)", boxShadow: `inset 0 0 0 2px ${tint}88, 0 14px 30px -8px rgba(255,77,141,.4), inset 0 -6px 0 rgba(0,0,0,.5)` }}>
          {enemyArt
            ? <ArtImage src={enemyArt} alt="boss" tint={tint} className={cn("h-full w-full rounded-[20px]", st === "locked" && "brightness-[.55] saturate-[.6]")} />
            : <Swords size={30} className="text-pink" />}
          {st === "locked" && (
            <div className="absolute inset-0 grid place-items-center">
              <Lock size={26} className="text-white/85 drop-shadow" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1"
          style={{ background: "linear-gradient(180deg,#ff6f9f,#f43f7f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 6px 12px rgba(0,0,0,.4)" }}>
          <span className="font-display text-[10px] font-black uppercase tracking-wider text-white">Босс · Химера</span>
        </div>
      </div>
    </motion.div>
  );
}

function Decor() {
  const items = [
    { x: 78, y: 1000, e: "☁" }, { x: 12, y: 780, e: "☁" }, { x: 88, y: 460, e: "☁" },
  ];
  return (
    <>
      {/* soft islands */}
      {items.map((d, i) => (
        <div key={i} className="anim-floaty2 absolute h-10 w-24 rounded-[100%] bg-line/20 blur-[2px]" style={{ left: `${d.x}%`, top: d.y, animationDelay: `${i * 0.9}s` }} />
      ))}
      {/* sparkles */}
      {[...Array(10)].map((_, i) => (
        <span key={i} className="anim-twinkle absolute h-1.5 w-1.5 rounded-full bg-teal"
          style={{ left: `${8 + (i * 37) % 84}%`, top: 90 + i * 105, animationDelay: `${i * 0.4}s`, boxShadow: "0 0 8px #19f2c4" }} />
      ))}
      {/* big glow behind boss */}
      <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-pink/14 blur-3xl" />
    </>
  );
}
