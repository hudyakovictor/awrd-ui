import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, Check, Lock, MousePointerClick, Zap } from "lucide-react";
import { Bar, Badge } from "../lib/ui";
import PatternIcon from "./PatternIcon";
import { PATTERNS } from "../data/kit";
import { cn } from "../utils/cn";

export default function Academy({ unlocked, focus }: { unlocked: Set<string>; focus?: string | null }) {
  const [flip, setFlip] = useState<string | null>(focus ?? null);
  const learned = unlocked.size;

  return (
    <div className="no-sb flex-1 overflow-y-auto px-3 pb-3 pt-1">
      <div className="flex items-end justify-between px-1">
        <div>
          <h2 className="hd text-[23px] uppercase leading-none">Академия</h2>
          <p className="mt-1 font-num text-[9.5px] font-medium uppercase tracking-[.14em] text-sky/55">повергай монстров знанием паттернов</p>
        </div>
        <div className="pnl-soft rounded-xl px-2.5 py-1 text-center">
          <div className="font-num text-[13px] font-bold leading-none text-teal">{learned}/{PATTERNS.length}</div>
          <div className="font-display text-[8px] font-bold uppercase text-sky/50">уроков</div>
        </div>
      </div>

      {/* progress */}
      <div className="pnl-soft mt-2.5 flex items-center gap-3 rounded-[16px] p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] text-[#04303f]"
          style={{ background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -4px 0 #056a80" }}>
          <BookOpenCheck size={19} strokeWidth={2.6} />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-display text-[12px] font-black uppercase italic text-white/90">Трейдер-аналитик</span>
            <span className="font-num text-[10px] font-semibold text-teal">{Math.round((learned / PATTERNS.length) * 100)}%</span>
          </div>
          <Bar v={learned} max={PATTERNS.length} c1="#35f7d2" c2="#0bb7d8" h={10} className="mt-1.5" />
        </div>
      </div>

      {/* how to */}
      <div className="pnl-soft mt-2.5 rounded-[16px] p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-[3px] w-3 rounded-full bg-gold" />
          <span className="font-display text-[10.5px] font-black uppercase italic text-white/90">Как побеждать</span>
        </div>
        <div className="space-y-1.5">
          {[
            { t: "График идёт сам — следи за свечами", i: <Zap size={13} className="text-teal" /> },
            { t: "Найди паттерн в жёлтой рамке", i: <BookOpenCheck size={13} className="text-gold" /> },
            { t: "Лонг = рост, Шорт = падение. 6.5 секунд!", i: <MousePointerClick size={13} className="text-pink" /> },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-2">
              <span className="well grid h-6 w-6 shrink-0 place-items-center rounded-lg">{r.i}</span>
              <span className="font-body text-[11px] font-bold text-sky/75">{r.t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-1.5 mt-3 flex items-center gap-1.5 px-1">
        <span className="h-[3px] w-4 rounded-full bg-teal" />
        <span className="font-display text-[12px] font-black uppercase italic tracking-wide text-white/90">Коллекция паттернов</span>
      </div>

      {/* pattern flip cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {PATTERNS.map((p, i) => {
          const known = unlocked.has(p.id);
          const isFlip = flip === p.id;
          return (
            <motion.button key={p.id} layout initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 240, damping: 20 }}
              onClick={() => setFlip(isFlip ? null : p.id)}
              className="relative h-[132px] text-left [perspective:800px]">
              <motion.div className="absolute inset-0" animate={{ rotateY: isFlip ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }} style={{ transformStyle: "preserve-3d" }}>
                {/* front */}
                <div className={cn("absolute inset-0 flex flex-col items-center justify-center rounded-[18px] p-2 [backface-visibility:hidden]",
                  known ? "shine" : "")}
                  style={{
                    background: known ? "linear-gradient(170deg,#1e3d75,#11234a)" : "linear-gradient(170deg,#17294f,#0e1c3e)",
                    boxShadow: known
                      ? "inset 0 1.5px 0 rgba(150,195,255,.3), inset 0 0 0 2px rgba(31,240,200,.7), 0 8px 20px -8px rgba(31,240,200,.5)"
                      : "inset 0 1.5px 0 rgba(150,195,255,.2), inset 0 0 0 1.5px rgba(60,104,185,.45)",
                  }}>
                  {!known && <Badge color="#3c68b5" rotate={-8}>закрыт</Badge>}
                  <span className={cn(!known && "saturate-0 opacity-60 blur-[1px]")}><PatternIcon id={p.id} s={46} /></span>
                  <span className="mt-1.5 text-center font-display text-[11.5px] font-black italic leading-tight text-white">
                    {known ? p.name : "???"}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 font-num text-[9px] font-semibold" style={{ color: p.dir === 1 ? "#4ceb96" : "#ff5c6e" }}>
                    {known ? (p.dir === 1 ? "→ рост" : "→ падение") : ""}
                  </span>
                </div>
                {/* back */}
                <div className="absolute inset-0 flex flex-col rounded-[18px] p-2.5 [backface-visibility:hidden]"
                  style={{
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(170deg,#22154e,#0e1c3e)",
                    boxShadow: "inset 0 1.5px 0 rgba(190,170,255,.3), inset 0 0 0 1.5px rgba(154,107,255,.55)",
                  }}>
                  <span className="mb-1 flex items-center gap-1">
                    {known ? <Check size={11} className="text-mint" strokeWidth={3.5} /> : <Lock size={10} className="text-sky/50" />}
                    <span className="font-display text-[9px] font-black uppercase italic tracking-wide" style={{ color: known ? "#4ceb96" : "#7fa6d9" }}>
                      {known ? "Изучен" : "Победи с этим"}
                    </span>
                  </span>
                  <p className="flex-1 font-body text-[9.8px] font-bold leading-snug text-sky/80">
                    {known ? p.insight : "Пройди уровень с этим паттерном, чтобы открыть разбор."}
                  </p>
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>
      <p className="mt-2 text-center font-num text-[9px] font-medium uppercase tracking-[.14em] text-sky/40">тап по карточке — перевернуть разбор</p>
    </div>
  );
}
