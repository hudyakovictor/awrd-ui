import { motion } from "framer-motion";
import { Bell, CandlestickChart, Flame, Gem, Heart, LayoutGrid, LineChart, Search, Settings, ShieldCheck, Swords, Trophy, User, Wallet, Zap } from "lucide-react";
import { useState } from "react";
import { Card, CopyHex, SectionShell, Tag } from "../components/ui";
import { cn } from "../utils/cn";

const palette = [
  { n: "Abyss", h: "#050C22", d: "App background", g: "linear-gradient(180deg,#0a1740,#050c22)" },
  { n: "Navy Panel", h: "#14295C", d: "3D surface", g: "linear-gradient(180deg,#1b3773,#101f47)" },
  { n: "Line Blue", h: "#2A4B8F", d: "Borders 1px", g: "linear-gradient(180deg,#35589f,#244385)" },
  { n: "Lime Pop", h: "#8EF23C", d: "Primary CTA", g: "linear-gradient(180deg,#a4ff5e,#62c91d)" },
  { n: "Long", h: "#2EDE8A", d: "Profit / Buy", g: "linear-gradient(180deg,#5ff5a8,#0fa968)" },
  { n: "Short", h: "#FF5470", d: "Loss / Sell", g: "linear-gradient(180deg,#ff8ba0,#c81d47)" },
  { n: "Gold", h: "#FFC531", d: "XP / Rewards", g: "linear-gradient(180deg,#ffd76a,#e79a06)" },
  { n: "Electric", h: "#5B8CFF", d: "Info / Gems", g: "linear-gradient(180deg,#7aa5ff,#3358d6)" },
];

const icons = [CandlestickChart, LineChart, Wallet, Trophy, Flame, Gem, Heart, Zap, ShieldCheck, Swords, Bell, Search, User, Settings, LayoutGrid, CandlestickChart];

export default function Foundations() {
  const [radius, setRadius] = useState(20);
  const [elev, setElev] = useState(3);
  const [iconSize, setIconSize] = useState(22);
  const [iconStroke, setIconStroke] = useState(2.2);

  return (
    <SectionShell id="foundations" index="01" kicker="Foundations" title="Токены, свет и объём" desc="Нажми на цвет чтобы скопировать. Тяни слайдеры — все поверхности пересчитаются вживую."
      right={<Tag tone="green">8 surfaces · live</Tag>}>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Surface Tokens" sub="Click-to-copy · тёмно-синяя гамма" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {palette.map((c) => (
              <motion.button key={c.n} whileTap={{ scale: .94 }}
                onClick={() => navigator.clipboard?.writeText(c.h)}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/25 text-left transition hover:-translate-y-1">
                <div className="h-16 w-full" style={{ background: c.g, boxShadow: "inset 0 2px 0 rgba(255,255,255,.3), inset 0 -3px 0 rgba(0,0,0,.3)" }} />
                <div className="p-2.5">
                  <p className="text-xs font-extrabold text-white">{c.n}</p>
                  <p className="text-[10px] text-[#7d92c4]">{c.d}</p>
                  <div className="mt-1.5"><CopyHex hex={c.h} /></div>
                </div>
              </motion.button>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="panel-inset p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#8ea6d8]">Radius · {radius}px</p>
                <Tag tone="blue">live</Tag>
              </div>
              <input type="range" min={4} max={32} value={radius} onChange={e => setRadius(+e.target.value)}
                className="lever w-full" style={{ ["--fill" as string]: `${((radius - 4) / 28) * 100}%` }} />
              <div className="mt-3 flex gap-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-14 flex-1 border border-white/15 bg-gradient-to-b from-[#244385] to-[#14295c]"
                    style={{ borderRadius: radius, boxShadow: "inset 0 1px 0 rgba(255,255,255,.25), 0 4px 0 #030816" }} />
                ))}
              </div>
            </div>
            <div className="panel-inset p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#8ea6d8]">Elevation · L{elev}</p>
                <Tag tone="gold">tactile</Tag>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(l => (
                  <button key={l} onClick={() => setElev(l)}
                    className={cn("h-9 flex-1 rounded-xl text-xs font-extrabold transition",
                      elev === l ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8] hover:bg-white/10")}>L{l}</button>
                ))}
              </div>
              <div className="mt-3 flex justify-center py-2">
                <motion.div animate={{ y: [0, -elev * 2, 0], scale: 1 + elev * 0.02 }} transition={{ duration: 1.4, repeat: Infinity }}
                  className="flex h-16 w-40 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-b from-[#2a4b8f] to-[#16295c] text-xs font-extrabold text-white"
                  style={{ boxShadow: `inset 0 2px 0 rgba(255,255,255,.25), 0 ${4 + elev * 5}px ${10 + elev * 8}px rgba(0,0,0,.6), 0 ${elev * 2}px 0 #030816` }}>
                  0 / {4 + elev * 5} / {10 + elev * 8}
                </motion.div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Iconography" sub="Stroke + size — живьём" action={<Tag tone="violet">{icons.length} icons</Tag>}>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label className="text-[11px] font-bold text-[#8ea6d8]">Size {iconSize}px
                <input type="range" min={14} max={34} value={iconSize} onChange={e => setIconSize(+e.target.value)} className="lever mt-1 w-full" style={{ ["--fill" as string]: `${((iconSize - 14) / 20) * 100}%` }} />
              </label>
              <label className="text-[11px] font-bold text-[#8ea6d8]">Stroke {iconStroke.toFixed(1)}
                <input type="range" min={1} max={3} step={0.1} value={iconStroke} onChange={e => setIconStroke(+e.target.value)} className="lever mt-1 w-full" style={{ ["--fill" as string]: `${((iconStroke - 1) / 2) * 100}%` }} />
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {icons.map((Icon, i) => (
                <motion.div key={i} whileHover={{ scale: 1.12, rotate: -4 }} whileTap={{ scale: .9 }}
                  className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-gradient-to-b from-[#1b3773] to-[#0e1f4a] text-[#ffd76a]"
                  style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.2), 0 3px 0 #030816" }}>
                  <Icon size={iconSize} strokeWidth={iconStroke} />
                </motion.div>
              ))}
            </div>
          </Card>
          <Card title="Typography" sub="Sora / Inter / JetBrains Mono">
            <p className="display text-3xl font-extrabold text-white">Aa Sora 800</p>
            <p className="text-sm text-[#aebde6]">Inter — интерфейсный текст уроков и ордеров.</p>
            <p className="num-mono mt-2 rounded-xl bg-black/40 p-2.5 text-sm font-bold text-[#8ef23c]">$97,432.10 · +2.84%</p>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}
