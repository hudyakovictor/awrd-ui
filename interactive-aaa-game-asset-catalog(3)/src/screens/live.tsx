import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, PillTabs } from "../ui/kit";
import { S, feel, useCount, useTimeline, Particles, useImpact, useInterval, commitTune, TUNE, useTuneVersion } from "../lib/motion";
import { RankCrest, Avatar, SceneBackdrop, Ribbon, Spark } from "../ui/art";
import {
  IcArrow, IcCheck, IcClose, IcCoinMark, IcShield, IcSwords, IcClock,
  IcTrophy, IcGem, IcBolt, IcCards, IcGauge, IcBell, IcGear, IcCap,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 28 · SEASON FINALE — финал сезона: повышение лиги
   ===================================================================== */
export function SeasonFinale({ live = true }: { live?: boolean }) {
  const [act, setAct] = useState<0 | 1 | 2 | 3>(0);
  const burst = useRef<any>(null);
  const imp = useImpact();

  useEffect(() => {
    if (!live) return;
    let t: any[] = [];
    const run = () => {
      setAct(0);
      t.push(setTimeout(() => { setAct(1); feel("sweep"); }, 700));
      t.push(setTimeout(() => {
        setAct(2); feel("reward", [14, 34, 14]); imp.fire(18, 0.5);
        burst.current?.(160, 230, { n: 60, power: 13, square: true, colors: ["#a9c6ff", "#eaf2ff", "#7fe3d6"] });
      }, 1700));
      t.push(setTimeout(() => setAct(3), 2700));
    };
    run();
    const iv = setInterval(run, 6400);
    return () => { clearInterval(iv); t.forEach(clearTimeout); };
  }, [live]);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col items-center">
        <SceneBackdrop tone="#a9c6ff" alt="#7fe3d6" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <AnimatePresence>
          {act === 2 && <motion.div className="absolute inset-0 z-30 bg-white" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }} />}
        </AnimatePresence>

        {/* лучи */}
        {act >= 2 && Array.from({ length: 18 }).map((_, i) => (
          <motion.span key={i} className="absolute h-32 w-[3px] origin-bottom rounded-full"
            style={{ background: "linear-gradient(to top, transparent, #a9c6ff)", rotate: `${i * 20}deg`, bottom: "52%" }}
            initial={{ scaleY: 0, opacity: 1 }} animate={{ scaleY: [0, 1.9, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 1.1, delay: i * 0.02 }} />
        ))}

        <div className="relative z-10 mt-3 text-center">
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-[9px] font-extrabold uppercase tracking-[0.45em] text-sky">Сезон 1 завершён</motion.div>
          <div className="title-xl mt-1 text-[20px] uppercase">Итоговая лига</div>
        </div>

        {/* смена герба */}
        <div className="relative z-10 mt-5 grid h-[150px] place-items-center">
          <AnimatePresence mode="wait">
            <motion.div key={act >= 2 ? "new" : "old"}
              initial={{ scale: 0.4, opacity: 0, rotateY: -60 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.7, opacity: 0, rotateY: 60 }}
              transition={{ ...S.pop, damping: 13 }}
              style={{ perspective: 800 }}
            >
              <RankCrest rank={act >= 2 ? "dia" : "gold"} size={130} stars={act >= 2 ? 1 : 3}
                label={act >= 2 ? "АЛМАЗ IV" : "ЗОЛОТО III"} />
            </motion.div>
          </AnimatePresence>
          {act >= 2 && (
            <motion.div className="absolute -z-10 h-40 w-40 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(169,198,255,.45), transparent 68%)" }}
              animate={{ scale: [0.9, 1.25, 0.9] }} transition={{ duration: 3, repeat: Infinity }} />
          )}
        </div>

        <motion.div className="relative z-10 mt-3 flex items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <span className="mono text-[11px] font-extrabold text-mist">ЗОЛОТО III</span>
          <motion.span animate={{ x: act >= 2 ? [0, 6, 0] : 0 }} transition={{ duration: 1, repeat: Infinity }} className="text-sky"><IcArrow size={16} /></motion.span>
          <motion.span className="mono text-[11px] font-extrabold" animate={{ color: act >= 2 ? "#a9c6ff" : "#5f7496" }}>АЛМАЗ IV</motion.span>
        </motion.div>

        {/* награды сезона */}
        <div className="relative z-10 mt-4 flex gap-2.5 px-4">
          {[
            { Icon: IcCoinMark, v: "+5 000", tone: "#f2c14e" },
            { Icon: IcCards, v: "×5 паков", tone: "#9d8cf5" },
            { Icon: IcGem, v: "+250", tone: "#7fe3d6" },
          ].map((r, i) => (
            <motion.div key={i} initial={{ scale: 0, y: 26 }} animate={act >= 3 ? { scale: 1, y: 0 } : {}}
              transition={{ ...S.pop, delay: i * 0.1 }}
              className="panel grid w-[92px] place-items-center gap-1 rounded-2xl py-3"
              style={{ boxShadow: `inset 0 0 0 1px ${r.tone}44` }}>
              <span style={{ color: r.tone }}><r.Icon size={22} /></span>
              <span className="mono text-[11px] font-extrabold">{r.v}</span>
            </motion.div>
          ))}
        </div>

        <motion.div className="relative z-10 mt-4" initial={{ opacity: 0, y: 18 }} animate={act >= 3 ? { opacity: 1, y: 0 } : {}} transition={S.soft}>
          <Ribbon tone="#a9c6ff" w={220}>топ 8% сезона</Ribbon>
        </motion.div>

        <div className="relative z-10 mt-auto mb-7 w-full px-5">
          <BigButton tone="sky" icon={<IcArrow size={16} />}>НАЧАТЬ СЕЗОН 2</BigButton>
        </div>
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 29 · INBOX — входящие: события, подарки, вызовы
   ===================================================================== */
type Msg = { id: number; t: string; s: string; tone: string; Icon: any; unread: boolean; act?: string };
const SEED_MSGS: Msg[] = [
  { id: 1, t: "Подарок от клана", s: "Ликвидность · 2 часа назад", tone: "#f2c14e", Icon: IcCoinMark, unread: true, act: "ЗАБРАТЬ" },
  { id: 2, t: "Вызов на дуэль", s: "@crypto_knight ждёт ответа", tone: "#9d8cf5", Icon: IcSwords, unread: true, act: "ПРИНЯТЬ" },
  { id: 3, t: "Сезон заканчивается", s: "Осталось 2 дня · подними лигу", tone: "#e46a5f", Icon: IcClock, unread: true },
  { id: 4, t: "Новая карта в коллекции", s: "«Кит» · легендарная", tone: "#3ec9a7", Icon: IcCards, unread: false },
  { id: 5, t: "Турнир Bull Run Blitz", s: "Регистрация открыта", tone: "#5b9cd6", Icon: IcTrophy, unread: false, act: "УЧАСТВОВАТЬ" },
];

export function InboxScreen({ live = true }: { live?: boolean }) {
  const [msgs, setMsgs] = useState(SEED_MSGS);
  const [tab, setTab] = useState(0);
  const burst = useRef<any>(null);
  const unread = msgs.filter((m) => m.unread).length;

  useInterval(() => {
    if (!live) return;
    setMsgs((ms) => {
      const first = ms.find((m) => m.unread);
      if (!first) return SEED_MSGS;
      feel("tap", 6);
      return ms.map((m) => (m.id === first.id ? { ...m, unread: false } : m));
    });
  }, live ? 1900 : null);

  const list = tab === 0 ? msgs : tab === 1 ? msgs.filter((m) => m.unread) : msgs.filter((m) => m.act);

  const take = (m: Msg) => {
    feel("reward", [10, 24, 10]);
    burst.current?.(250, 180, { n: 22, power: 9, colors: [m.tone, "#eaf2ff"] });
    setMsgs((ms) => ms.filter((x) => x.id !== m.id));
  };

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <SceneBackdrop tone="#9d8cf5" alt="#3ec9a7" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 flex items-baseline justify-between px-4 pt-2">
          <div className="title-xl text-[19px] uppercase">Входящие</div>
          <motion.span key={unread} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={S.pop}
            className="mono rounded-full bg-coral/20 px-2 py-[3px] text-[10px] font-extrabold text-coral">
            {unread} новых
          </motion.span>
        </div>
        <PillTabs tabs={["ВСЕ", "НОВЫЕ", "ДЕЙСТВИЯ"]} i={tab} set={setTab} tone="#9d8cf5" />

        <div className="no-bar relative z-10 flex-1 space-y-2 overflow-y-auto px-3 pb-24">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((m, i) => (
              <motion.div key={m.id} layout
                initial={{ x: 40, opacity: 0, filter: "blur(6px)" }}
                animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ x: -80, opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ ...S.soft, delay: Math.min(i * 0.05, 0.2) }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={{ left: 0.6, right: 0.1 }}
                onDragEnd={(_, info) => { if (info.offset.x < -70) { feel("deny", 16); setMsgs((ms) => ms.filter((x) => x.id !== m.id)); } }}
                className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2.5"
                style={{
                  background: m.unread ? `linear-gradient(90deg, ${m.tone}16, #1a2338)` : "#181f33",
                  boxShadow: `inset 0 0 0 1px ${m.unread ? m.tone + "44" : "rgba(255,255,255,.05)"}`,
                }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: m.tone + "22", color: m.tone }}>
                  <m.Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-extrabold">{m.t}</div>
                  <div className="truncate text-[10px] font-bold text-mist">{m.s}</div>
                </div>
                {m.act ? (
                  <motion.button whileTap={{ scale: 0.92, y: 2 }} onClick={() => take(m)}
                    className="shrink-0 rounded-xl px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider"
                    style={{ background: m.tone, color: "#0b1220", boxShadow: `0 3px 0 ${m.tone}66` }}>
                    {m.act}
                  </motion.button>
                ) : m.unread ? (
                  <motion.span className="h-2 w-2 shrink-0 rounded-full" style={{ background: m.tone }}
                    animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>
          {list.length === 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={S.pop}
              className="grid place-items-center gap-2 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-mist"><IcBell size={24} /></span>
              <span className="text-[11px] font-bold text-mist">Пусто. Свайп влево удаляет письмо.</span>
            </motion.div>
          )}
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 30 · SETTINGS — настройки, включая реальный режим motion
   ===================================================================== */
export function SettingsScreen({ live = true }: { live?: boolean }) {
  useTuneVersion();
  const [sound, setSound] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [quality, setQuality] = useState(1);

  useEffect(() => {
    if (!live) return;
    const iv = setInterval(() => setReduced((r) => !r), 3400);
    return () => clearInterval(iv);
  }, [live]);

  const applyReduced = (v: boolean) => {
    setReduced(v);
    feel(v ? "deny" : "confirm");
    commitTune(v
      ? { speed: 1.6, bounce: 0.35, weight: 0.8, stagger: 0.2, impact: 0, particles: 0.15 }
      : { speed: 1, bounce: 1, weight: 1, stagger: 1, impact: 1, particles: 1 });
  };

  const rows: { g: string; items: { t: string; s: string; Icon: any; tone: string; on: boolean; set: (v: boolean) => void }[] }[] = [
    {
      g: "Ощущения",
      items: [
        { t: "Звук интерфейса", s: "Синтез, без аудиофайлов", Icon: IcBolt, tone: "#3ec9a7", on: sound, set: (v) => { setSound(v); commitTune({ sound: v }); feel("tap"); } },
        { t: "Вибрация", s: "Отклик на ключевых событиях", Icon: IcGauge, tone: "#f2c14e", on: haptic, set: (v) => { setHaptic(v); feel("tap"); } },
        { t: "Уменьшить движение", s: "Отключает импакт и частицы", Icon: IcShield, tone: "#9d8cf5", on: reduced, set: applyReduced },
      ],
    },
  ];

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <SceneBackdrop tone="#8fa4c7" alt="#3ec9a7" animate={live && !reduced} />
        <TopHUD compact />

        <div className="relative z-10 flex items-center gap-2.5 px-4 pt-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.06] text-mist"><IcGear size={20} /></span>
          <div>
            <div className="title-xl text-[19px] uppercase">Настройки</div>
            <div className="text-[9.5px] font-bold text-mist">Профиль ощущений влияет на всю игру</div>
          </div>
        </div>

        <div className="no-bar relative z-10 mt-3 flex-1 space-y-4 overflow-y-auto px-3 pb-24">
          {rows.map((g) => (
            <div key={g.g}>
              <div className="mb-1.5 px-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">{g.g}</div>
              <div className="space-y-1.5">
                {g.items.map((it, i) => (
                  <motion.button key={it.t} onClick={() => it.set(!it.on)}
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06, ...S.soft }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left"
                    style={{ background: "#1a2338", boxShadow: `inset 0 0 0 1px ${it.on ? it.tone + "55" : "rgba(255,255,255,.05)"}` }}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: it.tone + (it.on ? "22" : "10"), color: it.on ? it.tone : "#5f7496" }}>
                      <it.Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-extrabold">{it.t}</span>
                      <span className="block text-[9.5px] font-bold text-mist">{it.s}</span>
                    </span>
                    <span className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                      style={{ background: it.on ? it.tone : "rgba(255,255,255,.12)" }}>
                      <motion.span layout transition={S.snap} className="absolute top-1 h-4 w-4 rounded-full bg-white"
                        style={{ left: it.on ? 26 : 4 }} />
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="mb-1.5 px-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">Качество эффектов</div>
            <Panel className="p-3">
              <div className="flex gap-1.5">
                {["НИЗКОЕ", "СРЕДНЕЕ", "ВЫСОКОЕ"].map((q, k) => (
                  <button key={q} onClick={() => { setQuality(k); feel("tap"); commitTune({ particles: [0.3, 0.7, 1.4][k] }); }}
                    className="relative flex-1 rounded-xl py-2 text-[9.5px] font-extrabold uppercase tracking-wider">
                    {quality === k && <motion.span layoutId="qpill" transition={S.pop} className="absolute inset-0 rounded-xl bg-teal" />}
                    {quality !== k && <span className="absolute inset-0 rounded-xl bg-white/[0.04]" />}
                    <span className={`relative ${quality === k ? "text-[#06231c]" : "text-mist"}`}>{q}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[9.5px] font-bold text-mist">плотность частиц</span>
                <Bar v={TUNE.particles} max={2} tone="#3ec9a7" h={6} />
                <span className="mono text-[10px] font-extrabold text-teal">×{TUNE.particles.toFixed(2)}</span>
              </div>
            </Panel>
          </div>

          <div>
            <div className="mb-1.5 px-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">Аккаунт</div>
            <div className="space-y-1.5">
              {[{ t: "Привязать почту", Icon: IcCheck }, { t: "Язык · Русский", Icon: IcCap }, { t: "Выйти", Icon: IcClose }].map((r) => (
                <div key={r.t} className="flex items-center gap-3 rounded-2xl bg-[#1a2338] px-3 py-2.5">
                  <span className="text-mist"><r.Icon size={15} /></span>
                  <span className="flex-1 text-[12px] font-extrabold">{r.t}</span>
                  <span className="text-mist"><IcArrow size={14} /></span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 31 · VAULT — витрина скинов с 3D-каруселью и примеркой
   ===================================================================== */
const SKINS = [
  { id: 0, t: "НЕОН", tone: "#3ec9a7", price: 490, own: true },
  { id: 1, t: "ПЛАЗМА", tone: "#9d8cf5", price: 690, own: false },
  { id: 2, t: "ЗОЛОТО", tone: "#f2c14e", price: 990, own: false },
  { id: 3, t: "КРОВЬ", tone: "#e46a5f", price: 790, own: false },
];

export function VaultScreen({ live = true }: { live?: boolean }) {
  const [i, setI] = useTimeline(SKINS.length, 2600, live);
  const s = SKINS[i];
  const burst = useRef<any>(null);
  const price = useCount(s.price, 0.5);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <motion.div className="absolute inset-0" animate={{ background: `radial-gradient(75% 48% at 50% 22%, ${s.tone}2e, transparent 70%)` }} transition={{ duration: 0.6 }} />
        <SceneBackdrop tone={s.tone} alt="#5b9cd6" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 px-4 pt-2 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.35em]" style={{ color: s.tone }}>Хранилище · облики</div>
          <div className="title-xl mt-0.5 text-[19px] uppercase">Витрина</div>
        </div>

        {/* карусель аватаров */}
        <div className="relative z-10 mt-4 grid h-[196px] place-items-center" style={{ perspective: 900 }}>
          <AnimatePresence mode="popLayout">
            <motion.div key={s.id}
              initial={{ rotateY: 70, x: 150, opacity: 0, scale: 0.7 }}
              animate={{ rotateY: 0, x: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: -70, x: -150, opacity: 0, scale: 0.7 }}
              transition={{ ...S.soft, damping: 22 }}
              className="relative grid place-items-center">
              <motion.div className="absolute h-44 w-44 rounded-full"
                style={{ background: `radial-gradient(circle, ${s.tone}44, transparent 68%)` }}
                animate={{ scale: [0.92, 1.12, 0.92] }} transition={{ duration: 3.4, repeat: Infinity }} />
              <motion.div className="absolute h-40 w-40 rounded-full border"
                style={{ borderColor: s.tone + "66" }}
                animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
                {[0, 1, 2, 3].map((k) => (
                  <span key={k} className="absolute h-2 w-2 rounded-full" style={{
                    background: s.tone, top: "50%", left: "50%",
                    transform: `rotate(${k * 90}deg) translateY(-80px)`,
                  }} />
                ))}
              </motion.div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}>
                <Avatar seed={s.id + 2} size={120} tone={s.tone} />
              </motion.div>
              {!s.own && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 0.2 }}
                  className="absolute -right-2 -top-1 rounded-full px-2 py-1 text-[9px] font-extrabold uppercase"
                  style={{ background: s.tone, color: "#0b1220" }}>новый</motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mt-1 text-center">
          <motion.div key={`t${s.id}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={S.pop}
            className="title-xl text-[24px] uppercase" style={{ color: s.tone }}>{s.t}</motion.div>
          <div className="mt-1 flex justify-center gap-1.5">
            {SKINS.map((x, k) => (
              <motion.button key={x.id} onClick={() => { feel("tap"); setI(k); }}
                animate={{ width: k === i ? 22 : 7, background: k === i ? x.tone : "#2a354e" }} transition={S.pop}
                className="h-[6px] rounded-full" />
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-3 px-3">
          <Panel className="flex items-center gap-2 p-2.5">
            {[{ l: "РЕДКОСТЬ", v: s.own ? "ЕСТЬ" : "ЭПИК" }, { l: "ЭФФЕКТ", v: "АУРА" }, { l: "СЕЗОН", v: "S1" }].map((x) => (
              <div key={x.l} className="flex-1 rounded-xl bg-white/[0.04] py-1.5 text-center">
                <div className="mono text-[10.5px] font-extrabold" style={{ color: s.tone }}>{x.v}</div>
                <div className="text-[7.5px] font-bold tracking-widest text-mist">{x.l}</div>
              </div>
            ))}
          </Panel>
        </div>

        <div className="relative z-10 mt-auto mb-24 px-4">
          <BigButton tone={s.own ? "ghost" : "gold"} icon={s.own ? <IcCheck size={15} /> : <IcCoinMark size={15} />}
            onClick={() => { if (!s.own) burst.current?.(160, 420, { n: 26, power: 9, colors: [s.tone, "#f2c14e"] }); }}>
            {s.own ? "НАДЕТ" : `КУПИТЬ ЗА ${Math.round(price)}`}
          </BigButton>
        </div>
        <BottomNav active="collection" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 32 · LIVE EVENT — ивент в реальном времени: волны и лидеры
   ===================================================================== */
export function LiveEvent({ live = true }: { live?: boolean }) {
  const [wave, setWave] = useState(2);
  const [hp, setHp] = useState(0.72);
  const burst = useRef<any>(null);
  const imp = useImpact();
  const players = useCount(2148);

  useInterval(() => {
    if (!live) return;
    setHp((h) => {
      const n = h - 0.07;
      if (n <= 0.05) {
        setWave((w) => (w >= 5 ? 1 : w + 1));
        feel("reward", [12, 28, 12]); imp.fire(14, 0.42);
        burst.current?.(160, 240, { n: 42, power: 12, square: true, colors: ["#e46a5f", "#f2c14e", "#eaf2ff"] });
        return 1;
      }
      feel("tap", 5);
      imp.fire(5, 0.22);
      return n;
    });
  }, live ? 1200 : null);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <SceneBackdrop tone="#e46a5f" alt="#f2c14e" animate={live} />
        <Particles api={burst} />
        <TopHUD compact />

        <div className="relative z-10 flex items-center justify-between px-4 pt-2">
          <div>
            <motion.div className="flex items-center gap-1.5">
              <motion.span className="h-2 w-2 rounded-full bg-coral" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-coral">live · идёт сейчас</span>
            </motion.div>
            <div className="title-xl mt-0.5 text-[18px] uppercase">Нашествие китов</div>
          </div>
          <div className="text-right">
            <div className="mono text-[13px] font-extrabold text-teal">{Math.round(players).toLocaleString("ru-RU")}</div>
            <div className="text-[8px] font-bold uppercase tracking-widest text-mist">в бою</div>
          </div>
        </div>

        {/* босс */}
        <div className="relative z-10 mt-3 px-3">
          <Panel className="relative overflow-hidden p-3">
            <div className="flex items-center justify-between text-[10px] font-extrabold">
              <span className="uppercase tracking-widest text-mist">волна {wave} из 5</span>
              <span className="mono text-coral">{Math.round(hp * 100)}%</span>
            </div>
            <div className="mt-2"><Bar v={hp} tone="#e46a5f" h={12} /></div>
            <motion.div className="mt-3 grid place-items-center"
              animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <BossWhale />
            </motion.div>
            <motion.div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-coral/20 blur-2xl"
              animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 4, repeat: Infinity }} />
          </Panel>
        </div>

        {/* волны */}
        <div className="relative z-10 mt-3 flex gap-1.5 px-3">
          {[1, 2, 3, 4, 5].map((w) => (
            <motion.div key={w} className="h-1.5 flex-1 rounded-full"
              animate={{ background: w < wave ? "#3ec9a7" : w === wave ? "#e46a5f" : "rgba(255,255,255,.1)" }} transition={S.soft} />
          ))}
        </div>

        {/* топ вклада */}
        <div className="relative z-10 mt-3 flex-1 space-y-1.5 px-3">
          <div className="px-1 text-[9px] font-extrabold uppercase tracking-[0.28em] text-mist">топ урона</div>
          {[
            { n: "ТЫ", v: 18400, tone: "#3ec9a7", seed: 4, you: true },
            { n: "NOVA_K", v: 17250, tone: "#f2c14e", seed: 2 },
            { n: "ЛИКВИД", v: 15980, tone: "#9d8cf5", seed: 6 },
          ].map((p, i) => (
            <motion.div key={p.n} layout initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.07, ...S.soft }}
              className="relative flex items-center gap-2.5 overflow-hidden rounded-2xl px-2.5 py-2"
              style={{ background: p.you ? "linear-gradient(90deg,#1e3b37,#1a2338)" : "#1a2338", boxShadow: `inset 0 0 0 1px ${p.you ? "#3ec9a7" : "rgba(255,255,255,.06)"}` }}>
              <span className="mono w-4 text-[10px] font-extrabold text-mist">{i + 1}</span>
              <Avatar seed={p.seed} size={28} tone={p.tone} ring={false} />
              <span className="flex-1 text-[11px] font-extrabold">{p.n}</span>
              <Spark data={[4, 6, 5, 8, 7, 9, 11]} tone={p.tone} w={40} h={16} />
              <span className="mono text-[11px] font-extrabold tabular-nums">{p.v.toLocaleString("ru-RU")}</span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mb-24 px-4">
          <BigButton tone="coral" icon={<IcBolt size={16} />}>АТАКОВАТЬ</BigButton>
        </div>
        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

function BossWhale() {
  return (
    <svg width="150" height="86" viewBox="0 0 160 96" fill="none">
      <defs>
        <linearGradient id="bwg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e46a5f" /><stop offset="1" stopColor="#7b2f36" />
        </linearGradient>
      </defs>
      <path d="M10 56c14 0 22-15 22-15s10 34 42 34c26 0 45-17 51-36-12 4-22 2-28-5" fill="url(#bwg)" stroke="#2a0f12" strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 30c4-12 15-19 26-19" stroke="#2a0f12" strokeWidth="3" strokeLinecap="round" />
      <circle cx="44" cy="50" r="3.6" fill="#140a0c" />
      <motion.path d="M18 78c9 6 18 6 27 0s18-6 27 0 18 6 27 0 18-6 27 0" stroke="#f2c14e" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".55"
        animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2.4, repeat: Infinity }} />
      {[30, 60, 90].map((x, i) => (
        <motion.circle key={x} cx={x} cy={20 - i * 2} r="2.5" fill="#f2c14e"
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.4 }} />
      ))}
    </svg>
  );
}
