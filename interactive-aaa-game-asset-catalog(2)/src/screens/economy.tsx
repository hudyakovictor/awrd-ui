import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, PillTabs } from "../ui/kit";
import { S, feel, useCount, Particles, useTimeline } from "../lib/motion";
import {
  IcCheck, IcCrown, IcLock, IcCoinMark, IcGem, IcShield, IcBolt, IcArrow, IcEye,
  ArtCoinStack, ArtPack, ArtChest, IcCards, IcClock,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 04 · SHOP — витрина с баттл-пассом, подпиской и паками
   ===================================================================== */
const TRACK = [
  { id: 1, Icon: IcShield, tone: "#6f83a6", claimed: true },
  { id: 2, Icon: IcCoinMark, tone: "#6f83a6", claimed: true },
  { id: 3, Icon: IcCards, tone: "#3ec9a7", claimed: false },
  { id: 4, Icon: IcCrown, tone: "#9d8cf5", claimed: false },
  { id: 5, Icon: IcGem, tone: "#9d8cf5", claimed: false },
];

export function ShopScreen({ live = true }: { live?: boolean }) {
  const [tab, setTab] = useState(0);
  const idle = live ? { scale: [1, 1.015, 1] } : {};
  const [claimed, setClaimed] = useState(2);
  const burst = useRef<any>(null);
  const price = useCount(490, 0.8);

  const claim = (i: number) => {
    if (i !== claimed) return feel("deny", 20);
    feel("reward", [10, 25, 10]);
    setClaimed((c) => Math.min(TRACK.length, c + 1));
    burst.current?.(60 + i * 54, 250, { n: 30, power: 9, colors: ["#f2c14e", "#3ec9a7", "#eaf2ff"] });
  };

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD />
        <PillTabs tabs={["МАГАЗИН", "БАТТЛ-ПАСС", "ПОДПИСКА", "ПАКИ"]} i={tab} set={(n) => setTab(n)} />

        <div className="no-bar flex-1 space-y-3 overflow-y-auto px-3 pb-24">
          {/* баттл-пасс */}
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.soft, delay: 0.05 }}>
            <Panel className="relative overflow-hidden p-3">
              <motion.div
                className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gold/18 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="text-center text-[9px] font-extrabold uppercase tracking-[0.3em] text-gold">Баттл-пасс</div>
              <div className="title-xl mt-0.5 text-center text-[16px] uppercase">Сигнал-пасс · Сезон 1</div>

              {/* трек наград */}
              <div className="relative mt-3 flex items-end justify-between px-1">
                <div className="absolute left-5 right-5 top-[38px] h-[3px] rounded bg-white/10" />
                <motion.div
                  className="absolute left-5 top-[38px] h-[3px] rounded bg-gradient-to-r from-teal to-gold"
                  initial={{ width: 0 }} animate={{ width: `${(claimed / TRACK.length) * 74}%` }} transition={{ ...S.soft, delay: 0.3 }}
                />
                {TRACK.map((r, i) => {
                  const done = i < claimed;
                  const next = i === claimed;
                  return (
                    <motion.button
                      key={r.id}
                      onClick={() => claim(i)}
                      initial={{ y: 18, opacity: 0, scale: 0.6 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ ...S.pop, delay: 0.15 + i * 0.07 }}
                      whileTap={{ scale: 0.88, y: 3 }}
                      className="relative z-10 flex flex-col items-center gap-1"
                    >
                      <motion.span
                        animate={next ? { y: [0, -4, 0] } : {}}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="grid h-5 w-5 place-items-center"
                        style={{ color: done ? "#f2c14e" : "#6f83a6" }}
                      >
                        <IcCrown size={17} />
                      </motion.span>
                      <span
                        className="grid h-12 w-12 place-items-center rounded-xl chip-3d"
                        style={{
                          background: done ? "linear-gradient(180deg,#3a4a68,#26344f)" : next ? "linear-gradient(180deg,#f7d271,#d29a20)" : "linear-gradient(180deg,#2a354e,#1e2a42)",
                          color: next ? "#3c2a04" : done ? "#8fa4c7" : "#5f7496",
                          opacity: done ? 0.7 : 1,
                        }}
                      >
                        <r.Icon size={22} />
                      </span>
                      {next && (
                        <>
                          <motion.span className="absolute -inset-1 top-4 rounded-xl border-2 border-gold ring-out" />
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop}
                            className="absolute -right-1 top-3 grid h-4 w-4 place-items-center rounded-full bg-coral text-[8px] text-white">!</motion.span>
                        </>
                      )}
                      {done && (
                        <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={S.pop}
                          className="absolute right-0 top-5 grid h-4 w-4 place-items-center rounded-full bg-teal text-[#06231c]"><IcCheck size={10} /></motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Bar v={claimed * 6} max={30} tone="#3ec9a7" h={12} />
                <span className="mono shrink-0 text-[11px] font-extrabold text-mist">{claimed * 6} / 30</span>
              </div>

              <motion.div className="mt-3" animate={idle} transition={{ duration: 2.6, repeat: Infinity }}>
                <BigButton tone="gold" onClick={() => feel("coin")}>КУПИТЬ ЗА {Math.round(price)} ₽</BigButton>
              </motion.div>
            </Panel>
          </motion.div>

          {/* PRO + паки */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...S.soft, delay: 0.18 }}>
              <Panel className="flex h-full flex-col p-3">
                <div className="title-xl text-[17px]">PRO <span className="text-teal">СИГНАЛ</span></div>
                <div className="mt-2 flex-1 space-y-1.5">
                  {["Без рекламы", "×2 XP", "Эксклюзивные карты", "Ранний доступ"].map((f, i) => (
                    <motion.div key={f} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.07 }} className="flex items-start gap-1.5">
                      <span className="mt-[1px] text-teal"><IcCheck size={12} /></span>
                      <span className="text-[10.5px] font-bold leading-tight text-white/85">{f}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3"><BigButton tone="teal" className="!py-2.5 !text-[11px]">30 ДНЕЙ · 199 ₽</BigButton></div>
              </Panel>
            </motion.div>

            <div className="space-y-3">
              <ShelfCard delay={0.24} title="НАБОР НОВИЧКА" badge="-50%" tone="#e46a5f">
                <div className="flex items-end justify-center gap-1">
                  <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}><ArtCoinStack size={52} /></motion.div>
                  <motion.div animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity }}><ArtPack size={42} hue="#e46a5f" /></motion.div>
                </div>
              </ShelfCard>
              <ShelfCard delay={0.32} title="ПАК КАРТ · ×3" badge="-2 ₽" tone="#9d8cf5">
                <div className="flex justify-center">
                  {[-1, 0, 1].map((k) => (
                    <motion.div key={k} initial={{ rotate: k * 12, x: k * 14 }} animate={{ rotate: [k * 12, k * 9, k * 12], y: k === 0 ? -4 : 0 }}
                      transition={{ duration: 3.4, repeat: Infinity }} style={{ zIndex: k === 0 ? 3 : 1 }} className="-mx-2">
                      <ArtPack size={40} hue={k === 0 ? "#9d8cf5" : "#3ec9a7"} />
                    </motion.div>
                  ))}
                </div>
              </ShelfCard>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-mist">
            <IcShield size={12} /><span className="text-[9.5px] font-bold">Покупки не влияют на навык · нет pay-to-win</span>
          </div>
        </div>

        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

function ShelfCard({ title, badge, tone, children, delay }: any) {
  return (
    <motion.div initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...S.soft, delay }}>
      <Panel className="relative overflow-hidden p-2.5">
        <div className="text-center text-[11px] font-extrabold uppercase">{title}</div>
        <div className="panel-sunk relative mt-2 rounded-xl py-2">
          {children}
          <motion.div
            initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: -12 }} transition={{ ...S.pop, delay: delay + 0.2 }}
            className="absolute -left-1 -top-2 rounded-full px-2 py-[3px] text-[9px] font-extrabold text-white"
            style={{ background: tone, boxShadow: `0 6px 14px -6px ${tone}` }}
          >
            {badge}
          </motion.div>
        </div>
      </Panel>
    </motion.div>
  );
}

/* =====================================================================
   АССЕТ 05 · BATTLE PASS TRACK — вертикальный сезонный трек
   ===================================================================== */
export function BattlePassTrack({ live = true }: { live?: boolean }) {
  const [lvl, setLvl] = useState(12);
  const burst = useRef<any>(null);
  const rows = Array.from({ length: 8 }, (_, i) => ({ n: 10 + i, free: i % 2 === 0, tone: i === 2 ? "#f2c14e" : i % 3 === 0 ? "#9d8cf5" : "#3ec9a7" }));

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setLvl((l) => (l >= 16 ? 12 : l + 1)), 2600);
    return () => clearInterval(t);
  }, [live]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />
        <div className="px-3 pt-2">
          <Panel className="flex items-center gap-3 p-3">
            <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 7, repeat: Infinity }}><ArtChest size={56} open={false} /></motion.div>
            <div className="flex-1">
              <div className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-gold">Сезон 1 · Сигнал</div>
              <div className="title-xl text-[15px] uppercase">Уровень {lvl}</div>
              <div className="mt-1.5"><Bar v={(lvl % 4) / 4} tone="#f2c14e" h={8} /></div>
            </div>
            <div className="text-right">
              <div className="mono text-[11px] font-extrabold text-white">14д</div>
              <div className="text-[8px] font-bold text-mist">ОСТАЛОСЬ</div>
            </div>
          </Panel>
        </div>

        <div className="mt-2 flex px-3 text-[9px] font-extrabold uppercase tracking-widest text-mist">
          <span className="flex-1 text-center">FREE</span>
          <span className="w-10" />
          <span className="flex-1 text-center text-gold">PREMIUM</span>
        </div>

        <div className="no-bar relative flex-1 overflow-y-auto px-3 pb-24 pt-1">
          <div className="absolute bottom-24 left-1/2 top-2 w-[3px] -translate-x-1/2 rounded bg-white/8" />
          <motion.div
            className="absolute left-1/2 top-2 w-[3px] -translate-x-1/2 rounded bg-gradient-to-b from-teal to-gold"
            animate={{ height: `${(lvl - 9) * 74}px` }} transition={S.soft}
          />
          {rows.map((r, i) => {
            const unlocked = r.n <= lvl;
            const isNext = r.n === lvl + 1;
            return (
              <div key={r.n} className="relative flex items-center gap-2 py-2">
                <RewardSlot side="l" tone="#3ec9a7" unlocked={unlocked} icon={IcCoinMark} label="+120"
                  onClick={() => { if (unlocked) { feel("coin"); burst.current?.(70, 120 + i * 60, { n: 18, power: 7, colors: ["#3ec9a7", "#eaf2ff"] }); } else feel("deny", 18); }} />
                <motion.div
                  animate={{ scale: isNext ? [1, 1.1, 1] : 1, background: unlocked ? "#f2c14e" : "#243250" }}
                  transition={{ duration: 1.4, repeat: isNext ? Infinity : 0 }}
                  className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#101827]"
                >
                  <span className={`mono text-[11px] font-extrabold ${unlocked ? "text-[#3c2a04]" : "text-mist"}`}>{r.n}</span>
                </motion.div>
                <RewardSlot side="r" tone={r.tone} unlocked={unlocked} premium icon={i % 3 === 0 ? IcCards : IcGem} label={i % 3 === 0 ? "ПАК" : "+30"}
                  onClick={() => { if (unlocked) { feel("reward"); burst.current?.(250, 120 + i * 60, { n: 26, power: 9 }); } else feel("deny", 18); }} />
              </div>
            );
          })}
        </div>

        <div className="absolute inset-x-3 bottom-[76px] z-20">
          <BigButton tone="gold" icon={<IcCrown size={16} />}>ОТКРЫТЬ PREMIUM · 490 ₽</BigButton>
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

function RewardSlot({ side, tone, unlocked, premium, icon: Icon, label, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ x: side === "l" ? -20 : 20, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={S.soft}
      whileTap={{ scale: 0.93 }}
      className="relative flex flex-1 items-center gap-2 rounded-xl px-2 py-2"
      style={{
        background: unlocked ? `linear-gradient(180deg, ${tone}2e, ${tone}10)` : "linear-gradient(180deg,#1b2540,#161f36)",
        boxShadow: unlocked ? `inset 0 0 0 1.5px ${tone}77` : "inset 0 0 0 1px rgba(255,255,255,.06)",
        opacity: unlocked ? 1 : 0.55,
        flexDirection: side === "l" ? "row" : "row-reverse",
      }}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: tone + "26", color: unlocked ? tone : "#6f83a6" }}>
        {unlocked ? <Icon size={16} /> : <IcLock size={15} />}
      </span>
      <span className="mono text-[11px] font-extrabold" style={{ color: unlocked ? "#fff" : "#6f83a6" }}>{label}</span>
      {premium && <span className="absolute right-1 top-1 text-gold opacity-70"><IcCrown size={10} /></span>}
    </motion.button>
  );
}

/* =====================================================================
   АССЕТ 06 · PAYWALL PRO — экран подписки с переключением тарифа
   ===================================================================== */
export function PaywallPro({ live = true }: { live?: boolean }) {
  const [plan, setPlan] = useState(1);
  const plans = [
    { id: 0, t: "НЕДЕЛЯ", p: 99, sub: "14 ₽ / день", save: null },
    { id: 1, t: "МЕСЯЦ", p: 199, sub: "6.6 ₽ / день", save: "−52%" },
    { id: 2, t: "ГОД", p: 1490, sub: "4 ₽ / день", save: "−72%" },
  ];
  const price = useCount(plans[plan].p, 0.6);
  const [i] = useTimeline(3, 2400, live);
  useEffect(() => { setPlan(i); }, [i]);

  const perks = [
    { t: "Без рекламы", d: "Чистый игровой цикл", Icon: IcEye, tone: "#3ec9a7" },
    { t: "Двойной XP", d: "Сезон проходится вдвое быстрее", Icon: IcBolt, tone: "#f2c14e" },
    { t: "Эксклюзивные карты", d: "12 PRO-карт каждый сезон", Icon: IcCards, tone: "#9d8cf5" },
    { t: "Ранний доступ", d: "Новые режимы за 2 недели", Icon: IcClock, tone: "#5b9cd6" },
  ];

  return (
    <Phone>
      <div className="relative flex h-full flex-col overflow-hidden">
        <div className="aurora opacity-60" />
        <motion.div className="absolute inset-x-0 top-0 h-52"
          style={{ background: "radial-gradient(60% 80% at 50% 0%, rgba(62,201,167,.3), transparent)" }}
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 4, repeat: Infinity }} />

        <div className="relative z-10 px-4 pt-12 text-center">
          <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={S.pop}
            className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal/18 text-teal glow-teal">
            <IcCrown size={32} />
          </motion.div>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, ...S.soft }} className="title-xl mt-3 text-[26px] uppercase">
            PRO <span className="text-grad">СИГНАЛ</span>
          </motion.div>
          <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }} className="mt-1 text-[11px] font-bold text-mist">
            Всё, что ускоряет обучение. Без pay-to-win.
          </motion.p>
        </div>

        <div className="relative z-10 mt-4 space-y-2 px-4">
          {perks.map((p, k) => (
            <motion.div key={p.t} initial={{ x: -26, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.24 + k * 0.08, ...S.soft }}
              className="panel flex items-center gap-3 rounded-2xl px-3 py-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: p.tone + "22", color: p.tone }}><p.Icon size={18} /></span>
              <div className="flex-1">
                <div className="text-[12px] font-extrabold">{p.t}</div>
                <div className="text-[9.5px] font-bold text-mist">{p.d}</div>
              </div>
              <span className="text-teal"><IcCheck size={16} /></span>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-4 flex gap-2 px-4">
          {plans.map((p) => {
            const on = plan === p.id;
            return (
              <motion.button key={p.id} onClick={() => { feel("tap"); setPlan(p.id); }} animate={{ y: on ? -6 : 0 }} transition={S.pop}
                className="relative flex-1 rounded-2xl px-2 py-3 text-center"
                style={{ background: on ? "linear-gradient(180deg,#2a4a44,#1c3330)" : "#1b2540", boxShadow: on ? "0 0 0 2px #3ec9a7, 0 14px 26px -14px #3ec9a7" : "inset 0 0 0 1px rgba(255,255,255,.07)" }}>
                {p.save && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop}
                    className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-coral px-1.5 py-[2px] text-[8px] font-extrabold text-white">{p.save}</motion.span>
                )}
                <div className="text-[10px] font-extrabold tracking-wider" style={{ color: on ? "#3ec9a7" : "#8fa4c7" }}>{p.t}</div>
                <div className="mono mt-0.5 text-[13px] font-extrabold">{p.p} ₽</div>
                <div className="text-[8px] font-bold text-mist">{p.sub}</div>
              </motion.button>
            );
          })}
        </div>

        <div className="relative z-10 mt-4 px-4">
          <BigButton tone="teal" icon={<IcArrow size={16} />} sub="Отмена в любой момент">
            ОФОРМИТЬ ЗА {Math.round(price)} ₽
          </BigButton>
        </div>
        <div className="relative z-10 mt-2 text-center text-[9px] font-bold text-mist">Восстановить покупки</div>
        <div className="flex-1" />
      </div>
    </Phone>
  );
}
