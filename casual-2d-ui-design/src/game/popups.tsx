import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Home, Music, Play, RotateCcw, Shield, Skull, Sword as SwordL, Volume2, X, Zap } from "lucide-react";
import { Art, Bar, Bolt, Btn, Coin, Gem, Modal, Ribbon, Slider, Star, Toggle } from "../lib/ui";
import { CountUp } from "../lib/ui2";
import { CoinRain, Confetti, Rays, Sparkles } from "../lib/fx";
import { DAILY, LevelNode, M, Monster, P, RARITY } from "../data/kit";
import PatternIcon from "./PatternIcon";
import { cn } from "../utils/cn";

const CloseX = ({ onClose }: { onClose?: () => void }) => (
  <button onClick={onClose} className="absolute -right-2.5 -top-2.5 z-20 grid h-9 w-9 place-items-center rounded-full text-white active:translate-y-[2px]"
    style={{ background: "linear-gradient(177deg,#ff9096,#ef2f4c)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.55), inset 0 -4px 0 #9d1226, 0 4px 0 #7c0e1e, 0 6px 12px rgba(0,0,0,.6)" }}>
    <X size={16} strokeWidth={3.5} />
  </button>
);

/* ═══════════ VICTORY: TAP-TO-OPEN CHEST ═══════════ */

interface LootItem { id: number; icon: "coin" | "gem" | "star"; dx: number; dy: number; r: number; s: number; d: number }

export function ChestVictory({ open, stars = 3, coins = 280, gems = 12, patternId, auto = false, onCollect }: {
  open: boolean; stars?: number; coins?: number; gems?: number; patternId?: string; auto?: boolean;
  onCollect?: () => void;
}) {
  const [st, setSt] = useState(0); // 0 enter · 1 tap hint · 2 opening · 3 spilled · 4 rewards
  const [loot, setLoot] = useState<LootItem[]>([]);
  useEffect(() => {
    if (!open) { setSt(0); setLoot([]); return; }
    const t1 = setTimeout(() => setSt(1), 750);
    const t2 = auto ? setTimeout(() => openChest(), 1800) : undefined;
    return () => { clearTimeout(t1); if (t2) clearTimeout(t2); };
  }, [open, auto]);

  const openChest = () => {
    if (st !== 1) return;
    setSt(2);
    setTimeout(() => {
      setLoot(Array.from({ length: 12 }, (_, i) => ({
        id: i, icon: i % 5 === 0 ? "gem" : i % 4 === 0 ? "star" : "coin",
        dx: -9 + (i % 6) * 22 + (i > 5 ? 8 : 0), dy: i > 5 ? 8 : -14 - (i % 3) * 12,
        r: (i * 53) % 360 - 180, s: i % 4 === 0 ? 22 : 19, d: i * 0.05,
      })));
      setSt(3);
      setTimeout(() => setSt(4), 1350);
    }, 420);
  };

  const pat = patternId ? P(patternId) : null;

  return (
    <Modal open={open}>
      {open && st >= 3 && <><CoinRain /><Confetti /></>}
      <div className="relative">
        {open && <Rays className="inset-[-60%] opacity-60" dur={26} />}
        <motion.div initial={{ scale: 0, rotate: -10, y: -16 }} animate={{ scale: 1, rotate: -2, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 13, delay: .06 }} className="relative -mt-16 mb-1 text-center">
          <Sparkles n={5} />
          <span className="hd hd-gold block text-[40px] uppercase leading-none">Победа!</span>
        </motion.div>

        <div className="mb-2 flex justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} initial={{ scale: 0, rotate: -60 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4 + i * 0.2, type: "spring", stiffness: 340, damping: 12 }}
              className={i === 1 ? "-translate-y-2" : ""}>
              <Star s={i === 1 ? 50 : 36} on={i < stars} />
            </motion.span>
          ))}
        </div>

        {/* chest zone */}
        <div className="relative mx-auto mb-2 h-[118px] w-[190px]">
          {/* light pillar behind */}
          <AnimatePresence>
            {st >= 2 && (
              <motion.div initial={{ scaleY: 0, opacity: 0.9 }} animate={{ scaleY: 1, opacity: 0 }} transition={{ duration: 0.9 }}
                className="absolute bottom-8 left-1/2 h-40 w-16 -translate-x-1/2 origin-bottom rounded-full blur-md"
                style={{ background: "linear-gradient(180deg,#ffe88466,transparent)" }} />
            )}
          </AnimatePresence>

          {/* chest */}
          <motion.button onClick={openChest} disabled={st !== 1}
            initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 220, damping: 15 }}
            className={cn("absolute bottom-0 left-1/2 -translate-x-1/2", st === 1 && "a-breathe cursor-pointer")}
            whileTap={st === 1 ? { scale: 0.82 } : undefined}>
            {st === 1 && <span className="absolute inset-[-12px] rounded-3xl a-ring" />}
            <motion.div animate={st === 2 ? { scaleY: [1, 0.72, 1.08, 1], scaleX: [1, 1.18, 0.96, 1], x: [0, -7, 7, -4, 3, 0] } : {}}
              transition={{ duration: 0.45 }}>
              <ChestSVG open={st >= 2} />
            </motion.div>
          </motion.button>

          {/* spilled loot */}
          {loot.map((l) => (
            <motion.span key={l.id} className="absolute left-[82px] top-[52px]"
              initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
              animate={{ x: l.dx, y: l.dy, scale: 1, rotate: l.r }}
              transition={{ delay: l.d, type: "spring", stiffness: 200, damping: 13 }}>
              {l.icon === "coin" && <Coin s={l.s} />}
              {l.icon === "gem" && <Gem s={l.s} />}
              {l.icon === "star" && <Star s={l.s} />}
            </motion.span>
          ))}

          {/* tap hint */}
          <AnimatePresence>
            {st === 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-3 py-[3px]"
                style={{ boxShadow: "0 4px 12px rgba(255,190,60,.55), inset 0 1px 0 rgba(255,255,255,.7)" }}>
                <span className="font-display text-[10.5px] font-black uppercase italic text-[#4a2a04]">Стоппани, чтобы открыть!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* rewards rows */}
        <motion.div className="pnl-soft mb-3 space-y-1.5 rounded-[16px] px-3 py-2.5" animate={st >= 4 ? { scale: [0.92, 1] } : { opacity: 0.4 }}>
          {[
            { i: <Coin s={17} />, l: "Монеты", v: coins, ic2: "coin" },
            { i: <Gem s={17} />, l: "Бонус звёзд", v: gems, ic2: "gem" },
            { i: <Bolt s={17} />, l: "Опыт героя", v: 180, ic2: "bolt" },
          ].map((r, i) => (
            <div key={r.l} className="flex items-center gap-2" style={{ opacity: st >= 4 ? 1 : 0.1, transition: `opacity .3s ${i * 0.12}s` }}>
              {r.i}
              <span className="flex-1 font-body text-[11.5px] font-bold text-sky/75">{r.l}</span>
              <span className="font-num text-[13px] font-bold text-gold">+{st >= 4 ? <CountUp value={r.v} duration={0.9} /> : 0}</span>
            </div>
          ))}
          <div className="pt-1" style={{ opacity: st >= 4 ? 1 : 0.1, transition: "opacity .3s .3s" }}>
            <div className="mb-1 flex justify-between font-display text-[9px] font-bold uppercase tracking-wide text-sky/55">
              <span>Уровень 12</span><span>1 600 / 1 800 XP</span>
            </div>
            <Bar v={st >= 4 ? 1600 : 1420} max={1800} c1="#35f7d2" c2="#0bb7d8" h={11} delay={.2} />
          </div>
        </motion.div>

        {/* unlocked lesson */}
        <AnimatePresence>
          {st >= 4 && pat && (
            <motion.div initial={{ y: 18, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: .35, type: "spring", stiffness: 260, damping: 18 }}
              className="mb-3 flex items-center gap-2 rounded-[15px] p-2"
              style={{ background: "linear-gradient(90deg, rgba(31,240,200,.14), rgba(31,240,200,.03))", boxShadow: "inset 0 0 0 1.5px rgba(31,240,200,.5)" }}>
              <span className="shrink-0 rounded-[11px] bg-teal/15 p-1.5"><PatternIcon id={pat.id} s={34} /></span>
              <div className="min-w-0">
                <div className="font-display text-[9px] font-black uppercase italic tracking-wide text-teal">Урок изучен</div>
                <div className="font-display text-[12.5px] font-black leading-tight text-white">{pat.name}</div>
                <div className="font-body text-[9.5px] font-bold text-sky/60">открыт в академии</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div animate={st >= 4 ? { opacity: 1 } : { opacity: 0.35 }} transition={{ duration: 0.3 }}>
          <Btn color="gold" size="lg" full disabled={st < 4} onClick={onCollect}>Забрать</Btn>
        </motion.div>
      </div>
    </Modal>
  );
}

const ChestSVG = ({ open }: { open: boolean }) => (
  <svg width="150" height="108" viewBox="0 0 150 108">
    <defs>
      <linearGradient id="cwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c98a3c" /><stop offset="1" stopColor="#8a5416" /></linearGradient>
      <linearGradient id="cgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe884" /><stop offset="1" stopColor="#f08a12" /></linearGradient>
      <linearGradient id="cglow" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ffd14a" stopOpacity=".9" /><stop offset="1" stopColor="#ffd14a" stopOpacity="0" /></linearGradient>
    </defs>
    {/* glow inside */}
    <motion.ellipse cx="75" cy="52" rx="46" ry="10" fill="url(#cglow)" initial={{ opacity: 0 }} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: .3 }} />
    {/* body */}
    <rect x="25" y="52" width="100" height="50" rx="9" fill="url(#cwood)" stroke="#5c360a" strokeWidth="3" />
    <rect x="25" y="52" width="100" height="10" fill="#ffd14a" opacity=".18" />
    <rect x="44" y="52" width="9" height="50" fill="url(#cgold)" stroke="#9c4e06" strokeWidth="2" />
    <rect x="97" y="52" width="9" height="50" fill="url(#cgold)" stroke="#9c4e06" strokeWidth="2" />
    <rect x="25" y="88" width="100" height="7" rx="3.5" fill="url(#cgold)" opacity=".85" stroke="#9c4e06" strokeWidth="1.6" />
    {/* lid */}
    <motion.g style={{ transformOrigin: "30px 52px" }} animate={open ? { rotate: -108, y: -4 } : { rotate: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 12 }}>
      <path d="M25 54c0-24 22-38 50-38s50 14 50 38z" fill="url(#cwood)" stroke="#5c360a" strokeWidth="3" />
      <path d="M25 54c0-24 22-38 50-38" fill="none" stroke="#ffca7a" strokeWidth="2.5" opacity=".5" />
      <rect x="44" y="20" width="9" height="34" fill="url(#cgold)" stroke="#9c4e06" strokeWidth="2" transform="skewX(-3)" />
      <rect x="97" y="20" width="9" height="34" fill="url(#cgold)" stroke="#9c4e06" strokeWidth="2" transform="skewX(3)" />
      {/* lock */}
      <rect x="66" y="42" width="18" height="20" rx="4" fill="url(#cgold)" stroke="#9c4e06" strokeWidth="2.5" />
      <circle cx="75" cy="50" r="3.4" fill="#5c360a" />
    </motion.g>
    {/* shadow */}
    <ellipse cx="75" cy="104" rx="52" ry="4" fill="#04081a" opacity=".45" />
  </svg>
);

/* ═══════════ DEFEAT ═══════════ */
export function Defeat({ open, enemy = "Фомо-Дух", lesson, onRetry, onExit }: { open: boolean; enemy?: string; lesson?: string; onRetry?: () => void; onExit?: () => void }) {
  return (
    <Modal open={open}>
      <Ribbon color="navy">Ликвидация</Ribbon>
      <div className="mb-3 flex justify-center">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 240, damping: 14, delay: .12 }}
          className="grid h-[72px] w-[72px] place-items-center rounded-[22px]"
          style={{ background: "radial-gradient(circle at 50% 35%, #4a1030, #120e2c)", boxShadow: "inset 0 0 0 2px rgba(255,92,110,.45), inset 0 -6px 0 rgba(0,0,0,.45)" }}>
          <Skull size={36} className="text-coral" />
        </motion.div>
      </div>
      <p className="mb-3 text-center font-body text-[12.5px] font-bold leading-snug text-sky/75">
        <span className="text-pink">{enemy}</span> забрал ваш депозит.<br />
        {lesson && <span className="text-teal">Урок: {lesson}</span>}
      </p>
      <div className="flex gap-2">
        <Btn color="navy" size="md" className="!px-3" onClick={onExit}><Home size={17} /></Btn>
        <Btn color="teal" size="md" className="flex-1" onClick={onRetry}><RotateCcw size={15} /> Ещё раз</Btn>
      </div>
    </Modal>
  );
}

/* ═══════════ PAUSE ═══════════ */
export function PauseBox({ open, onResume, onQuit }: { open: boolean; onResume?: () => void; onQuit?: () => void }) {
  const [v, setV] = useState({ m: 80, s: 100 });
  return (
    <Modal open={open}>
      <Ribbon>Пауза</Ribbon>
      <div className="mb-3 space-y-2">
        <Row icon={<Music size={15} className="text-teal" />} label="Музыка"><Slider value={v.m} onChange={(x) => setV({ ...v, m: x })} /></Row>
        <Row icon={<Volume2 size={15} className="text-teal" />} label="Звук"><Slider value={v.s} onChange={(x) => setV({ ...v, s: x })} /></Row>
      </div>
      <div className="space-y-2">
        <Btn color="teal" size="md" full onClick={onResume}><Play size={16} fill="currentColor" /> Продолжить</Btn>
        <Btn color="navy" size="sm" full onClick={onQuit}><Home size={14} /> Сдаться и выйти</Btn>
      </div>
    </Modal>
  );
}
const Row = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="pnl-soft flex items-center gap-2.5 rounded-[15px] px-3 py-2.5">
    {icon}
    <span className="w-[52px] shrink-0 font-display text-[11px] font-bold uppercase text-sky/80">{label}</span>
    {children}
  </div>
);

/* ═══════════ SETTINGS ═══════════ */
export function SettingsBox({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const [t, setT] = useState({ s: true, m: true, v: false, n: true });
  const [vol, setVol] = useState(75);
  return (
    <Modal open={open} onClose={onClose}>
      <CloseX onClose={onClose} />
      <Ribbon>Настройки</Ribbon>
      <div className="space-y-2">
        {([["s", "Звуки", <Volume2 size={15} className="text-teal" key="a" />], ["m", "Музыка", <Music size={15} className="text-teal" key="b" />],
        ["v", "Вибрация", <Zap size={15} className="text-teal" key="c" />], ["n", "Уведомления", <Flame size={15} className="text-teal" key="d" />]] as const).map(([k, l, ic]) => (
          <div key={k} className="pnl-soft flex items-center gap-2.5 rounded-[15px] px-3.5 py-2.5">
            {ic}
            <span className="flex-1 font-display text-[12.5px] font-bold text-white/90">{l}</span>
            <Toggle on={t[k]} onChange={(x) => setT({ ...t, [k]: x })} />
          </div>
        ))}
        <Row icon={<Volume2 size={15} className="text-teal" />} label="Громк."><Slider value={vol} onChange={setVol} /></Row>
      </div>
      <p className="mt-3 text-center font-num text-[9.5px] tracking-[.14em] text-sky/40">SIGNAL ARENA · UI KIT v2.0</p>
    </Modal>
  );
}

/* ═══════════ DAILY ═══════════ */
export function Daily({ open, claimed = 2, onClaim, onClose }: { open: boolean; claimed?: number; onClaim?: () => void; onClose?: () => void }) {
  return (
    <Modal open={open} onClose={onClose} max={340}>
      <CloseX onClose={onClose} />
      <Ribbon color="gold">Награды дня</Ribbon>
      <div className="grid grid-cols-4 gap-1.5">
        {DAILY.map((d, i) => {
          const got = i < claimed, next = i === claimed, big = d.day === 7;
          return (
            <motion.div key={d.day} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.04 }}
              className={cn("pnl-soft relative flex flex-col items-center gap-1 rounded-[14px] px-1 py-2", big && "col-span-2", next && "shine")}
              style={next ? { boxShadow: "inset 0 1.5px 0 rgba(150,195,255,.26), inset 0 0 0 2px #1ff0c8, 0 0 16px -4px rgba(31,240,200,.7)" } : undefined}>
              <span className="font-num text-[8.5px] font-medium uppercase tracking-wide text-sky/55">День {d.day}</span>
              <span className="grid h-8 place-items-center">
                {d.kind === "coins" && <Coin s={big ? 34 : 25} />}
                {d.kind === "gems" && <Gem s={big ? 34 : 25} />}
                {d.kind === "energy" && <Bolt s={big ? 32 : 24} />}
                {d.kind === "chest" && <ChestMini />}
              </span>
              <span className="font-num text-[10.5px] font-bold text-white/90">{d.kind === "chest" ? "×1" : `×${d.label}`}</span>
              {got && (
                <span className="absolute inset-0 grid place-items-center rounded-[14px] bg-[#050c1e]/72">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-mint text-[#05391f]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </span>
              )}
              {next && <BadgeNow />}
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3">
        <Btn color={claimed < 7 ? "gold" : "navy"} size="md" full onClick={onClaim} disabled={claimed >= 7}>
          {claimed >= 7 ? "Всё собрано" : "Забрать награду"}
        </Btn>
      </div>
    </Modal>
  );
}
const ChestMini = () => <ChestSVG open={false} />;
const BadgeNow = () => (
  <span className="absolute -right-1.5 -top-2 z-10 -rotate-[8deg] rounded-[9px] px-1.5 py-[2px] font-display text-[8px] font-black uppercase italic text-[#04303f]"
    style={{ background: "linear-gradient(180deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.6), 0 3px 8px rgba(0,0,0,.5)" }}>сегодня</span>
);

/* ═══════════ PRE-FIGHT ═══════════ */
export function PreFight({ level, onClose, onStart }: { level: LevelNode | null; onClose?: () => void; onStart?: () => void }) {
  const en = level?.enemy ? M(level.enemy) : M("fomo");
  const r = RARITY[en.rarity];
  const pat = level?.pattern ? P(level.pattern) : null;
  return (
    <Modal open={!!level} onClose={onClose}>
      <CloseX onClose={onClose} />
      <Ribbon>Уровень {level?.id ?? 5}</Ribbon>
      <div className="mb-2.5 flex items-center gap-2.5">
        <motion.div initial={{ scale: .6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 250, damping: 14 }}
          className="a-f1 relative shrink-0">
          <div className="absolute inset-[5%] rounded-full blur-xl" style={{ background: `${en.tint}55` }} />
          <div className="frame relative h-[86px] w-[86px]" style={{ background: `linear-gradient(170deg, ${r.c1}, ${r.c2})` }}>
            <div className="h-full w-full overflow-hidden rounded-[19px]" style={{ background: "radial-gradient(circle at 50% 35%, #24406f, #0c1a3c)" }}>
              <Art src={en.art} alt={en.name} className="h-full w-full scale-110" blend={false} />
            </div>
          </div>
        </motion.div>
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded-full px-2 py-[2px] font-display text-[8.5px] font-black uppercase italic tracking-wider"
            style={{ background: `linear-gradient(90deg, ${r.c1}33, ${r.c2}22)`, color: r.c1, boxShadow: `inset 0 0 0 1px ${r.c1}66` }}>{r.label}</span>
          <div className="mt-1 font-display text-[15px] font-black leading-[1.05] text-white">{en.name}</div>
          <div className="font-body text-[10px] font-bold text-sky/55">{en.sub}</div>
          <div className="mt-1.5 flex gap-2">
            <Stat icon={<SwordL size={10} className="text-coral" />} v={en.atk} />
            <Stat icon={<Shield size={10} className="text-sky" />} v={en.hp} />
            <Stat icon={<Zap size={10} className="text-gold" />} v={en.spd} />
          </div>
        </div>
      </div>
      <div className="pnl-soft mb-2.5 rounded-[15px] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-[3px] w-3 rounded-full bg-pink" />
          <span className="font-display text-[9.5px] font-black uppercase italic tracking-wide text-pink">{en.abilityName}</span>
        </div>
        <div className="mt-0.5 font-body text-[11.5px] font-bold leading-snug text-white/80">{en.ability}</div>
      </div>
      {pat && (
        <div className="mb-3 flex items-center gap-2 rounded-[15px] p-2"
          style={{ background: "linear-gradient(90deg, rgba(255,209,74,.1), transparent)", boxShadow: "inset 0 0 0 1.5px rgba(255,209,74,.4)" }}>
          <span className="shrink-0"><PatternIcon id={pat.id} s={32} /></span>
          <div className="min-w-0">
            <span className="font-display text-[9px] font-black uppercase italic tracking-wide text-gold">Урок в бою</span>
            <div className="font-body text-[10.5px] font-bold leading-tight text-white/85">{pat.name}: {pat.sub}</div>
          </div>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="well flex shrink-0 items-center gap-1 px-2.5 py-2"><Bolt s={15} /><span className="font-num text-[12px] font-bold text-white">5</span></div>
        <Btn color="teal" size="lg" className="flex-1" onClick={onStart}>В бой!</Btn>
      </div>
    </Modal>
  );
}
const Stat = ({ icon, v }: { icon: React.ReactNode; v: number }) => (
  <span className="well flex items-center gap-1 px-1.5 py-[3px]">{icon}<span className="font-num text-[10px] font-semibold text-white/85">{v}</span></span>
);

/* ═══════════ MONSTER SHEET ═══════════ */
export function MonsterSheet({ m, owned = true, onClose }: { m: Monster | null; owned?: boolean; onClose?: () => void }) {
  return (
    <AnimatePresence>
      {m && (
        <motion.div className="absolute inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#030816]/80 backdrop-blur-[5px]" onClick={onClose} />
          <motion.div className="pnl absolute inset-x-2.5 bottom-2.5 top-14 flex flex-col overflow-hidden"
            initial={{ y: "104%" }} animate={{ y: 0 }} exit={{ y: "104%" }} transition={{ type: "spring", stiffness: 280, damping: 30 }}>
            <div className="relative h-[200px] shrink-0" style={{ background: `radial-gradient(circle at 50% 40%, ${m.tint}28, transparent 70%)` }}>
              <Rays className="inset-0 opacity-40" />
              <Art src={m.art} alt={m.name} className={cn("h-full w-full scale-105", !owned && "brightness-[.3] saturate-0")} />
              <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(180deg,transparent,#14295a)" }} />
              <CloseX onClose={onClose} />
              <div className="absolute bottom-1 left-4 right-4">
                <span className="font-num text-[9.5px] font-semibold uppercase tracking-[.2em]" style={{ color: m.tint }}>{RARITY[m.rarity].label}</span>
                <div className="hd text-[22px] uppercase leading-tight">{owned ? m.name : "???"}</div>
              </div>
            </div>
            <div className="no-sb flex-1 space-y-2.5 overflow-y-auto px-4 pb-4 pt-2">
              <div className="flex gap-1">{[0, 1, 2].map((i) => <Star key={i} s={17} on={i < (m.rarity === "legend" ? 3 : m.rarity === "epic" ? 2 : 1)} />)}</div>
              <p className="font-body text-[12.5px] font-bold leading-relaxed text-sky/80">{owned ? m.desc : "Победите монстра, чтобы открыть запись."}</p>
              <div className="pnl-soft rounded-[15px] px-3 py-2">
                <span className="font-display text-[9.5px] font-black uppercase italic tracking-wide text-teal">{m.abilityName}</span>
                <div className="mt-0.5 font-body text-[11.5px] font-bold text-white/80">{m.ability}</div>
            </div>
              <div className="pnl-soft rounded-[15px] px-3 py-2" style={{ boxShadow: "inset 0 1.5px 0 rgba(150,195,255,.26), inset 0 0 0 1.5px rgba(255,209,74,.4)" }}>
                <span className="font-display text-[9.5px] font-black uppercase italic tracking-wide text-gold">Урок: реальная рынок-ловушка</span>
                <div className="mt-0.5 font-body text-[11.5px] font-bold text-white/80">{m.lesson}</div>
              </div>
              {[
                { l: "Здоровье", v: m.hp, max: 560, c1: "#5cf09e", c2: "#17c46b" },
                { l: "Атака", v: m.atk, max: 42, c1: "#ff8fb6", c2: "#ef2f4c" },
                { l: "Скорость", v: m.spd, max: 100, c1: "#ffe884", c2: "#ff9b1f" },
              ].map((s, i) => (
                <div key={s.l} className="flex items-center gap-2.5">
                  <span className="w-[62px] font-display text-[10.5px] font-bold uppercase text-sky/70">{s.l}</span>
                  <Bar v={owned ? s.v : 0} max={s.max} c1={s.c1} c2={s.c2} h={12} delay={0.15 + i * 0.1} />
                  <span className="w-7 text-right font-num text-[11px] font-semibold text-white/85">{owned ? s.v : "—"}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Btn color="navy" size="sm" className="flex-1">Улучшить</Btn>
                <Btn color="teal" size="sm" className="flex-1">В отряд</Btn>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export { ChestSVG };
