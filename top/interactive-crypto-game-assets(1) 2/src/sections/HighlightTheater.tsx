/* ------------------------------------------------------------------
 * 32 · HIGHLIGHT THEATER — replay cards, share mock, scrub timeline
 * ------------------------------------------------------------------ */
import { motion } from "framer-motion";
import { Pause, Play, Share2, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import { Tag } from "../components/ui";
import { GameSection } from "../fx/gamekit";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { toast: (t: string, s: string, tone?: string) => void };

const highlights = [
  { t: "Boss kill · RSI Dragon", d: "Combo ×8 finisher", dur: 12, c: "#ff8b3d" },
  { t: "Perfect quiz · Risk School", d: "3★ · 0 mistakes", dur: 8, c: "#8ef23c" },
  { t: "Liquidation survive ×40", d: "0.2% from liq", dur: 15, c: "#ff5470" },
  { t: "Clan raid victory", d: "Hydra down · 4 players", dur: 20, c: "#a78bff" },
  { t: "Season tier 30", d: "Prestige unlocked", dur: 10, c: "#ffc531" },
];

export default function HighlightTheater({ toast }: Props) {
  const [i, setI] = useState(0);
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(false);
  const h = highlights[i];

  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setT(x => {
      if (x >= h.dur) { setPlay(false); return h.dur; }
      return x + 0.1;
    }), 100);
    return () => clearInterval(id);
  }, [play, h.dur]);

  const select = (idx: number) => { setI(idx); setT(0); setPlay(false); sfx.soft(); };

  return (
    <GameSection id="theater" index="32" kicker="Highlights" title="Театр реплеев"
      desc="Лента хайлайтов, таймлайн со scrub, play/pause, шаринг. Как stories побед."
      right={<Tag tone="gold">5 clips</Tag>}>
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="panel-3d overflow-hidden !rounded-[28px]">
          <div className="relative flex h-[280px] items-center justify-center" style={{ background: `radial-gradient(circle at 50% 30%, ${h.c}44, #050c22 70%)` }}>
            <motion.div key={i + String(play)} animate={play ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}} transition={{ duration: 2, repeat: Infinity }}
              className="text-center">
              <p className="display text-3xl font-extrabold text-white">{h.t}</p>
              <p className="text-sm text-white/70">{h.d}</p>
              <p className="num-mono mt-4 text-xs text-white/50">{t.toFixed(1)}s / {h.dur}s</p>
            </motion.div>
            {/* scrub */}
            <div className="absolute inset-x-4 bottom-4">
              <input type="range" min={0} max={h.dur} step={0.1} value={t} onChange={e => { setT(+e.target.value); setPlay(false); }}
                className="lever w-full" style={{ ["--fill" as string]: `${(t / h.dur) * 100}%` }} />
              <div className="mt-2 flex items-center justify-center gap-2">
                <button onClick={() => select((i - 1 + highlights.length) % highlights.length)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><SkipBack size={16} /></button>
                <button onClick={() => { setPlay(p => !p); sfx.tap(); }} className="btn3d btn3d-green h-12 w-12 !rounded-2xl">{play ? <Pause size={18} /> : <Play size={18} />}</button>
                <button onClick={() => select((i + 1) % highlights.length)} className="btn3d btn3d-ghost h-10 w-10 !rounded-xl"><SkipForward size={16} /></button>
                <button onClick={() => { sfx.coin(); toast("Shared highlight", h.t, "blue"); }} className="btn3d btn3d-blue ml-2 px-4 py-2.5 text-[11px]"><Share2 size={14} /> Share</button>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {highlights.map((hh, idx) => (
            <button key={hh.t} onClick={() => select(idx)}
              className={cn("w-full rounded-2xl border px-3 py-3 text-left", idx === i ? "border-white/30 bg-white/10" : "border-white/10 bg-black/25")}>
              <p className="text-xs font-extrabold text-white">{hh.t}</p>
              <p className="text-[10px] text-[#8ea6d8]">{hh.d} · {hh.dur}s</p>
            </button>
          ))}
        </div>
      </div>
    </GameSection>
  );
}
