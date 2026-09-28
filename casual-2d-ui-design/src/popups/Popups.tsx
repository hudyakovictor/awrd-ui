import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Home, Music, Play, RotateCcw, Shield, Skull, Sword, Volume2, X, Zap } from "lucide-react";
import { ArtImage, CoinIcon, GemIcon, JellyBtn, JellySlider, JellyToggle, Modal, ModalTitle, StarIcon } from "../components/ui";
import { CoinRain, Confetti, Rays } from "../components/fx";
import { DAILY, MONSTERS, Monster, LevelNode, RARITY } from "../data/game";
import { cn } from "../utils/cn";

/* ==================== VICTORY ==================== */

export function VictoryModal({ open, stars, coins, onContinue }: { open: boolean; stars: number; coins: number; onContinue: () => void }) {
  return (
    <Modal open={open}>
      {open && <><CoinRain /><Confetti /></>}
      <div className="relative">
        <Rays className="opacity-60" />
        <motion.div initial={{ scale: 0, rotate: -6 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: .1 }}
          className="relative -mt-14 mb-2 text-center">
          <span className="tstrok font-display text-[44px] font-black italic uppercase leading-none tracking-wide"
            style={{ color: "#ffe066", WebkitTextStrokeColor: "#7a4404" }}>Победа!</span>
        </motion.div>

        <div className="relative mb-4 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span key={i}
              initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.45 + i * 0.22, type: "spring", stiffness: 300, damping: 13 }}
              className={i === 1 ? "-translate-y-2" : ""}>
              <StarIcon size={i === 1 ? 56 : 42} on={i < stars} />
            </motion.span>
          ))}
        </div>

        <div className="relative mx-auto mb-5 flex w-fit items-center gap-2 rounded-full well px-4 py-2">
          <CoinIcon size={20} />
          <span className="font-mono text-sm text-white">+{coins}</span>
          <span className="font-display text-[10px] font-bold uppercase tracking-wider text-sky/70">награда</span>
        </div>

        <JellyBtn variant="gold" className="w-full py-3.5 text-lg uppercase italic" onClick={onContinue}>
          Забрать
        </JellyBtn>
      </div>
    </Modal>
  );
}

/* ==================== DEFEAT ==================== */

export function DefeatModal({ open, enemyName, onRetry, onExit }: { open: boolean; enemyName: string; onRetry: () => void; onExit: () => void }) {
  return (
    <Modal open={open}>
      <ModalTitle color="tstrok">Ликвидация</ModalTitle>
      <div className="mb-3 flex justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 15, delay: .15 }}
          className="grid h-20 w-20 place-items-center rounded-[26px]"
          style={{ background: "linear-gradient(160deg,#3a1430,#141030)", boxShadow: "inset 0 0 0 2px #ff546866, inset 0 -6px 0 rgba(0,0,0,.4)" }}>
          <Skull size={38} className="text-hp" />
        </motion.div>
      </div>
      <p className="mb-5 text-center font-body text-[13px] font-bold leading-snug text-sky/80">
        <span className="text-pink">{enemyName}</span> забрал ваш депозит.<br />Стоп-лосс — это страховка, а не слабость.
      </p>
      <div className="flex gap-2">
        <JellyBtn variant="navy" className="h-12 w-12 rounded-2xl" onClick={onExit}><Home size={18} /></JellyBtn>
        <JellyBtn variant="teal" className="flex-1 py-3 uppercase italic" onClick={onRetry}>
          <RotateCcw size={17} /> Ещё раз
        </JellyBtn>
      </div>
    </Modal>
  );
}

/* ==================== PAUSE ==================== */

export function PauseModal({ open, onResume, onQuit }: { open: boolean; onResume: () => void; onQuit: () => void }) {
  return (
    <Modal open={open}>
      <ModalTitle>Пауза</ModalTitle>
      <div className="mb-4 space-y-2.5">
        {[{ v: 80, l: "Музыка" }, { v: 100, l: "Звук" }].map((row) => (
          <div key={row.l} className="panel-soft flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
            {row.l === "Музыка" ? <Music size={16} className="text-teal" /> : <Volume2 size={16} className="text-teal" />}
            <span className="w-14 font-display text-[11px] font-bold uppercase text-sky/80">{row.l}</span>
            <JellySlider value={row.v} onChange={() => {}} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <JellyBtn variant="teal" className="w-full py-3 uppercase italic" onClick={onResume}><Play size={17} /> Продолжить</JellyBtn>
        <JellyBtn variant="navy" className="w-full py-2.5 uppercase italic text-white/85" onClick={onQuit}><Home size={16} /> Выйти</JellyBtn>
      </div>
    </Modal>
  );
}

/* ==================== SETTINGS ==================== */

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [t, setT] = useState({ sound: true, music: true, vibro: false });
  const [vol, setVol] = useState(75);
  const rows: { key: keyof typeof t; label: string; icon: typeof Volume2 }[] = [
    { key: "sound", label: "Звуки", icon: Volume2 },
    { key: "music", label: "Музыка", icon: Music },
    { key: "vibro", label: "Вибрация", icon: Zap },
  ];
  return (
    <Modal open={open} onClose={onClose}>
      <button onClick={onClose} className="absolute -right-2 -top-2 z-10 grid h-9 w-9 place-items-center rounded-full text-white active:scale-90"
        style={{ background: "linear-gradient(180deg,#ff7b8a,#f2304c)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), inset 0 -4px 0 #a11430" }}>
        <X size={16} strokeWidth={3} />
      </button>
      <ModalTitle>Настройки</ModalTitle>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.key} className="panel-soft flex items-center gap-3 rounded-2xl px-4 py-3">
            <r.icon size={17} className="text-teal" />
            <span className="flex-1 font-display text-[13px] font-bold text-white/90">{r.label}</span>
            <JellyToggle on={t[r.key]} onChange={(v) => setT({ ...t, [r.key]: v })} />
          </div>
        ))}
        <div className="panel-soft flex items-center gap-3 rounded-2xl px-4 py-3">
          <Volume2 size={17} className="text-teal" />
          <span className="w-16 font-display text-[13px] font-bold text-white/90">Громкость</span>
          <JellySlider value={vol} onChange={setVol} />
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-[10px] text-sky/50">SIGNAL ARENA · UI KIT v1.0</p>
    </Modal>
  );
}

/* ==================== DAILY ==================== */

export function DailyModal({ open, onClose, claimed, onClaim }: { open: boolean; onClose: () => void; claimed: number; onClaim: () => void }) {
  return (
    <Modal open={open} onClose={onClose} wide>
      <ModalTitle color="tstrok-gold">Награды дня</ModalTitle>
      <div className="grid grid-cols-4 gap-2">
        {DAILY.map((d, i) => {
          const isClaimed = i < claimed;
          const isNext = i === claimed;
          const big = d.day === 7;
          return (
            <motion.div
              key={d.day}
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className={cn(
                "panel-soft relative flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5",
                big && "col-span-2",
                isNext && "card-shine"
              )}
              style={isNext ? { boxShadow: "inset 0 1px 0 rgba(140,180,255,.2), inset 0 0 0 2px #19f2c4" } : undefined}
            >
              <span className="font-mono text-[9px] uppercase text-sky/60">День {d.day}</span>
              <span className={cn("grid place-items-center", big ? "h-9" : "h-7")}>
                {d.kind === "coins" && <CoinIcon size={big ? 32 : 24} />}
                {d.kind === "gems" && <GemIcon size={big ? 32 : 24} />}
                {d.kind === "energy" && <Zap size={big ? 28 : 20} className="text-teal" fill="#19f2c4" />}
              </span>
              <span className="font-display text-[10px] font-extrabold text-white/90">{d.label}</span>
              {isClaimed && (
                <span className="absolute inset-0 grid place-items-center rounded-2xl bg-[#050c1e]/70">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-[#081430]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="relative mt-4 grid grid-cols-4 gap-2">
        <div className="col-span-4">
          <JellyBtn variant={claimed < 7 ? "gold" : "navy"} className="w-full py-3 uppercase italic" onClick={() => claimed < 7 && onClaim()} disabled={claimed >= 7}>
            {claimed >= 7 ? "Всё собрано" : "Забрать сегодня"}
          </JellyBtn>
        </div>
      </div>
      <button onClick={onClose} className="mt-2 w-full text-center font-display text-[11px] font-bold uppercase tracking-wider text-sky/60 active:scale-95">Закрыть</button>
    </Modal>
  );
}

/* ==================== PRE-FIGHT ==================== */

export function PreFightModal({ level, onClose, onStart }: { level: LevelNode | null; onClose: () => void; onStart: () => void }) {
  const enemy = MONSTERS.find((m) => m.id === level?.enemyId) ?? MONSTERS[0];
  const r = RARITY[enemy.rarity];
  return (
    <Modal open={!!level} onClose={onClose}>
      {level && (
        <>
          <ModalTitle color="tstrok-teal">Уровень {level.id}</ModalTitle>
          <div className="mb-3 flex items-center gap-3">
            <motion.div initial={{ rotate: -8, scale: .6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 14 }}
              className="anim-floaty relative shrink-0">
              <div className="absolute inset-[-8px] rounded-3xl blur-lg" style={{ background: `${enemy.tint}44` }} />
              <ArtImage src={enemy.art} alt={enemy.name} tint={enemy.tint} className="relative h-20 w-20 rounded-3xl" style={{ boxShadow: `inset 0 0 0 2px ${enemy.tint}` }} />
            </motion.div>
            <div className="min-w-0">
              <div className="font-display text-[16px] font-black leading-tight text-white">{enemy.name}</div>
              <div className="mt-0.5 inline-block rounded-full px-2 py-[2px] font-display text-[9px] font-bold uppercase tracking-wider"
                style={{ background: `linear-gradient(90deg, ${r.c1}33, ${r.c2}33)`, color: r.c1, boxShadow: `inset 0 0 0 1px ${r.c1}66` }}>
                {r.label}
              </div>
              <div className="mt-1.5 flex gap-2 font-mono text-[10px] text-sky/80">
                <span className="flex items-center gap-1"><Sword size={10} className="text-hp" />{enemy.atk}</span>
                <span className="flex items-center gap-1"><Shield size={10} className="text-sky" />{enemy.hp}</span>
                <span className="flex items-center gap-1"><Flame size={10} className="text-gold" />{enemy.spd}</span>
              </div>
            </div>
          </div>

          <div className="panel-soft mb-4 rounded-2xl px-3.5 py-2.5">
            <div className="font-display text-[10px] font-bold uppercase tracking-wider text-teal">Способность</div>
            <div className="mt-0.5 text-[12px] font-bold leading-snug text-white/85">{enemy.ability}</div>
          </div>

          <div className="mb-4 flex items-center justify-center gap-1.5">
            <span className="font-display text-[10px] font-bold uppercase tracking-wider text-sky/60 mr-1">Сложность</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="h-2 w-6 rounded-full" style={{ background: i < Math.min(5, 1 + Math.floor(level.id / 2.5)) ? "linear-gradient(90deg,#ffcb40,#ff9a1f)" : "#0a1735", boxShadow: i < Math.min(5, 1 + Math.floor(level.id / 2.5)) ? "0 0 6px rgba(255,180,40,.5)" : "inset 0 1px 3px rgba(0,0,0,.6)" }} />
            ))}
          </div>

          <div className="flex gap-2">
            <JellyBtn variant="navy" className="h-12 w-12 rounded-2xl" onClick={onClose}><X size={17} /></JellyBtn>
            <JellyBtn variant="teal" className="flex-1 py-3 text-lg uppercase italic" onClick={onStart}>В бой!</JellyBtn>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ==================== MONSTER DETAIL SHEET ==================== */

export function MonsterSheet({ m, owned, onClose }: { m: Monster | null; owned: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {m && (
        <motion.div className="absolute inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#030918]/78 backdrop-blur-[6px]" onClick={onClose} />
          <motion.div
            className="panel absolute inset-x-3 bottom-3 top-16 flex flex-col overflow-hidden"
            initial={{ y: "105%" }} animate={{ y: 0 }} exit={{ y: "105%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="relative">
              <ArtImage src={m.art} alt={m.name} tint={m.tint} className={cn("h-56 w-full", !owned && "brightness-[.35] saturate-0")} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 30%, #101f49 96%)" }} />
              {!owned && <div className="absolute inset-0 grid place-items-center font-display text-4xl font-black italic text-white/25">???</div>}
              <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-white active:scale-90"
                style={{ background: "linear-gradient(180deg,#ff7b8a,#f2304c)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), inset 0 -4px 0 #a11430" }}>
                <X size={16} strokeWidth={3} />
              </button>
              <div className="absolute bottom-2 left-4 right-4">
                <div className="font-mono text-[10px] uppercase tracking-[.2em]" style={{ color: m.tint }}>{RARITY[m.rarity].label}</div>
                <div className="tstrok font-display text-2xl font-black italic leading-tight">{owned ? m.name : "Неизвестный зверь"}</div>
              </div>
            </div>

            <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
              <p className="text-[13px] font-bold leading-relaxed text-sky/85">{owned ? m.desc : "Поразите этого монстра на арене, чтобы открыть запись в бестиарии."}</p>
              {owned && (
                <div className="panel-soft rounded-2xl px-3.5 py-2.5">
                  <div className="font-display text-[10px] font-bold uppercase tracking-wider text-teal">Способность</div>
                  <div className="mt-0.5 text-[12px] font-bold text-white/85">{m.ability}</div>
                </div>
              )}
              <div className="space-y-2.5 pb-2">
                {[
                  { l: "Здоровье", v: m.hp, max: 900, c: "#42e98c" },
                  { l: "Атака", v: m.atk, max: 40, c: "#ff5468" },
                  { l: "Скорость", v: m.spd, max: 100, c: "#ffcb40" },
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-3">
                    <span className={cn("w-20 font-display text-[11px] font-bold uppercase", !owned && "text-white/25")}>{s.l}</span>
                    <div className="well relative h-3 flex-1">
                      <motion.div className="fillbar absolute inset-y-[3px] left-[3px] rounded-full"
                        initial={{ width: 0 }} animate={{ width: owned ? `calc(${(s.v / s.max) * 100}% - 6px)` : "0%" }}
                        transition={{ delay: .25, type: "spring", stiffness: 90, damping: 18 }}
                        style={{ background: s.c, boxShadow: `0 0 8px ${s.c}88` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-[11px] text-white/80">{owned ? s.v : "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
