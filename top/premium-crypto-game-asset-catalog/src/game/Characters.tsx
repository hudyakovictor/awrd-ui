import { useState } from "react";
import { motion } from "framer-motion";
import { Cell, Grid, Section, Tag } from "../components/kit";
import { cn } from "../utils/cn";
import { Mascot, Bubble, MOODS, SKINS, type Mood, type SkinKey } from "./Mascot";
import { ART, ART_KEYS, ItemTile, RARITY, type Rarity, type ArtKey } from "./art";
import { sfx, SFX_LIST, SFX_NOTES, type SfxName } from "./Juice";

const LINES: Record<Mood, string> = {
  idle: "Markets never sleep. Neither do I.",
  happy: "Clean entry! That's how pros do it.",
  wave: "Hey trader! Ready for today's drill?",
  think: "Hmm… is that a double top?",
  shock: "Whoa — 20× leverage?!",
  sad: "We got stopped out. It happens.",
  celebrate: "NEW PERSONAL BEST! 🚀",
  sleep: "Zzz… wake me at the next halving.",
};

/* ================================================================== */
/*  MASCOT LAB                                                         */
/* ================================================================== */
function MascotLab() {
  const [mood, setMood] = useState<Mood>("wave");
  const [species, setSpecies] = useState<"bull" | "bear">("bull");
  const [skin, setSkin] = useState<SkinKey>("royal");
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
      <div className="relative flex min-h-[360px] flex-col items-center justify-end overflow-hidden rounded-3xl pb-6" style={{ background: "radial-gradient(circle at 50% 35%, #1e3563 0%, #0a1226 70%)" }}>
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-[70%] -translate-x-1/2" style={{ background: "linear-gradient(180deg, rgba(160,200,255,.14), transparent 70%)", clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)" }} />
        <div className="absolute left-4 right-4 top-4">
          <Bubble key={mood + species} text={species === "bear" ? LINES[mood].replace("pros", "bears") : LINES[mood]} side="bottom" tone="accent" />
        </div>
        <div className="absolute bottom-5 h-8 w-56 rounded-[50%]" style={{ background: "linear-gradient(180deg,#22355e,#0d1528)", boxShadow: "0 5px 0 #070d1c" }} />
        <Mascot mood={mood} size={230} species={species} skin={skin} className="relative" onClick={() => { const n = MOODS[(MOODS.indexOf(mood) + 1) % MOODS.length]; setMood(n); sfx("pop"); }} />
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-ink-500">emotion states · 8</div>
          <div className="grid grid-cols-4 gap-2">
            {MOODS.map((m) => (
              <motion.button
                key={m}
                type="button"
                whileTap={{ y: 3 }}
                onClick={() => { setMood(m); sfx("select"); }}
                className="flex flex-col items-center rounded-2xl border-2 pb-1.5 pt-1"
                style={{ borderColor: mood === m ? "var(--accent)" : "#22355e", background: mood === m ? "color-mix(in srgb, var(--accent) 12%, #101a33)" : "#101a33", boxShadow: `0 3px 0 ${mood === m ? "var(--accent-edge)" : "#0a1328"}` }}
              >
                <Mascot mood={m} size={50} species={species} skin={skin} track={false} />
                <span className="font-mono text-[8.5px] font-black uppercase tracking-wider" style={{ color: mood === m ? "var(--accent)" : "#7d8db4" }}>
                  {m}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["bull", "bear"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setSpecies(s); sfx("select"); }}
              className="rounded-2xl border-2 py-3 text-center"
              style={{ borderColor: species === s ? (s === "bull" ? "#2be08a" : "#ff4d6a") : "#22355e", background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}
            >
              <div className="font-[family-name:var(--font-display)] text-[16px] font-bold" style={{ color: s === "bull" ? "#2be08a" : "#ff4d6a" }}>
                {s === "bull" ? "TORO" : "URSA"}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-ink-500">{s === "bull" ? "hero · mentor" : "rival · pvp"}</div>
            </button>
          ))}
        </div>
        <div>
          <div className="mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-ink-500">armour</div>
          <div className="flex gap-2">
            {(Object.keys(SKINS) as SkinKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setSkin(k); sfx("select"); }}
                className="h-10 flex-1 rounded-xl"
                style={{ background: `radial-gradient(circle at 35% 30%, ${SKINS[k][0]}, ${SKINS[k][1]} 55%, ${SKINS[k][2]})`, boxShadow: `0 3px 0 ${SKINS[k][2]}${skin === k ? ", 0 0 0 3px #0a1226, 0 0 0 5px var(--accent)" : ""}` }}
                aria-label={k}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Tag tone="accent">eye-tracks cursor</Tag>
          <Tag>random blink 2–5s</Tag>
          <Tag tone="gold">limb rigs</Tag>
          <Tag tone="violet">click = next mood</Tag>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ITEM ART GALLERY                                                   */
/* ================================================================== */
const ART_RARITY: Record<ArtKey, Rarity> = {
  coin: "common",
  gem: "rare",
  heart: "common",
  flame: "rare",
  chest: "legendary",
  trophy: "legendary",
  crown: "legendary",
  shield: "rare",
  bolt: "common",
  key: "rare",
  potion: "epic",
  ticket: "epic",
  medal: "epic",
  rocket: "epic",
  freeze: "rare",
  star: "common",
  lock: "common",
  candle: "common",
  whale: "legendary",
};

function ArtGallery() {
  const [size, setSize] = useState(58);
  const [filter, setFilter] = useState<Rarity | "all">("all");
  const [focus, setFocus] = useState<ArtKey>("chest");
  const F = ART[focus];
  const keys = ART_KEYS.filter((k) => filter === "all" || ART_RARITY[k] === filter);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(["all", "common", "rare", "epic", "legendary"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setFilter(r); sfx("select"); }}
              className="rounded-xl border-2 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider"
              style={{ borderColor: filter === r ? (r === "all" ? "var(--accent)" : RARITY[r].c) : "#22355e", color: r === "all" ? "#dbe5ff" : RARITY[r].c, background: "#101a33", boxShadow: "0 3px 0 #0a1328" }}
            >
              {r}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 font-mono text-[9px] text-ink-400">
            SIZE
            <input type="range" min={36} max={80} value={size} onChange={(e) => setSize(+e.target.value)} className="w-24" />
          </label>
        </div>
        <motion.div layout className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {keys.map((k) => (
            <motion.div layout key={k} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <ItemTile art={k} rarity={ART_RARITY[k]} label={k} size={size} onClick={() => { setFocus(k); sfx("pop"); }} className={cn(focus === k && "ring-2 ring-white/60")} />
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl p-5" style={{ background: `radial-gradient(circle at 50% 40%, ${RARITY[ART_RARITY[focus]].c}33, #0a1226 70%)`, boxShadow: `inset 0 0 0 2px ${RARITY[ART_RARITY[focus]].c}44` }}>
        <motion.div key={focus} initial={{ scale: 0.4, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} className="bob">
          <F size={150} />
        </motion.div>
        <div className="mt-3 font-[family-name:var(--font-display)] text-[22px] font-bold capitalize text-white">{focus}</div>
        <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: RARITY[ART_RARITY[focus]].c }}>
          {RARITY[ART_RARITY[focus]].label}
        </div>
        <div className="mt-3 flex items-end gap-3">
          {[24, 36, 52].map((s) => (
            <F key={s} size={s} />
          ))}
        </div>
        <div className="mt-2 font-mono text-[8.5px] uppercase tracking-widest text-ink-500">24 · 36 · 52 · 150 — crisp at all sizes</div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  SOUND BOARD                                                        */
/* ================================================================== */
function SoundBoard() {
  const [last, setLast] = useState<SfxName | null>(null);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {SFX_LIST.map((s) => {
        const notes = SFX_NOTES[s];
        const maxT = Math.max(...notes.map((n) => n[1] + n[2]));
        return (
          <motion.button
            key={s}
            type="button"
            whileTap={{ y: 3 }}
            onClick={() => { sfx(s); setLast(s); }}
            className="relative overflow-hidden rounded-2xl border-2 p-2.5 text-left"
            style={{ borderColor: last === s ? "var(--accent)" : "#22355e", background: "#101a33", boxShadow: `0 3px 0 ${last === s ? "var(--accent-edge)" : "#0a1328"}` }}
          >
            <div className="font-mono text-[10px] font-black uppercase tracking-wider" style={{ color: last === s ? "var(--accent)" : "#dbe5ff" }}>
              {s}
            </div>
            <svg viewBox="0 0 100 26" className="mt-1 h-6 w-full">
              {notes.map((n, i) => {
                const x = (n[1] / maxT) * 100;
                const w = Math.max(3, (n[2] / maxT) * 100);
                const y = 24 - Math.min(22, (Math.log2(n[0] / 100) / 4.2) * 22);
                return <rect key={i} x={x} y={y} width={w} height={3.5} rx={1.5} fill={last === s ? "var(--accent)" : "#38537f"} />;
              })}
            </svg>
            <div className="font-mono text-[8px] text-ink-500">{notes.length} notes · {Math.round(maxT * 1000)}ms</div>
          </motion.button>
        );
      })}
    </div>
  );
}

export default function Characters() {
  return (
    <Section id="characters" index="" title="Mascot, Item Art & Sound" kicker="The soul of the game" count="2 characters · 19 items · 17 sfx">
      <Grid>
        <Cell title="Mascot Lab · TORO & URSA" spec="8 moods · 6 armours · rigged" span="col-span-2 md:col-span-4 lg:col-span-6">
          <MascotLab />
        </Cell>
        <Cell title="Glossy Item Art" spec="hand-built SVG · rarity law" span="col-span-2 md:col-span-4 lg:col-span-6">
          <ArtGallery />
        </Cell>
        <Cell title="Synth Sound Board" spec="WebAudio · haptic paired" span="col-span-2 md:col-span-4 lg:col-span-6">
          <SoundBoard />
        </Cell>
      </Grid>
    </Section>
  );
}
