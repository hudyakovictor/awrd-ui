import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton } from "../ui/kit";
import { S, E, feel, useTimeline, Particles, rnd } from "../lib/motion";
import {
  IcArrow, IcCheck, IcClose, IcStar, IcCoinMark, IcSwords, IcCards, IcCrown, IcBell, IcShield,
  IcTarget, IcTrend, IcCap, IcFlame, ArtCard, ArtCandleChart,
} from "../ui/icons";

/* =====================================================================
   АССЕТ 15 · SCREEN FLOW — 4 фирменных перехода между реальными экранами
   ===================================================================== */
const FLOWS = ["STACK PUSH", "SHARED HERO", "IRIS WIPE", "LIQUID CURTAIN"] as const;

export function ScreenFlow({ live = true }: { live?: boolean }) {
  const [mode, setMode] = useTimeline(4, 3600, live);
  const [side, setSide] = useState(0);
  useEffect(() => { setSide((s) => 1 - s); }, [mode]);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => { setSide((s) => 1 - s); feel("sweep", 8); }, 1800);
    return () => clearInterval(t);
  }, [live, mode]);

  const A = (
    <div className="flex h-full flex-col bg-[#101827] p-3">
      <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-teal">Хаб</div>
      <div className="title-xl mt-1 text-[18px] uppercase">Выбор режима</div>
      <motion.div layoutId="hero-tile" transition={{ ...S.soft, damping: 24 }}
        className="mt-3 overflow-hidden rounded-2xl p-3" style={{ background: "linear-gradient(160deg,#2f6f60,#16213a)" }}>
        <div className="flex items-center gap-2">
          <span className="text-teal"><IcSwords size={26} /></span>
          <div><div className="text-[13px] font-extrabold uppercase">Арена</div><div className="text-[9.5px] font-bold text-mist">Ранговый бой</div></div>
        </div>
      </motion.div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[IcCards, IcCap, IcTarget, IcFlame].map((Ic, i) => (
          <div key={i} className="panel-sunk grid h-16 place-items-center rounded-xl text-mist"><Ic size={20} /></div>
        ))}
      </div>
    </div>
  );
  const B = (
    <div className="flex h-full flex-col bg-[#0d1626] p-3">
      <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-gold">Режим</div>
      <motion.div layoutId="hero-tile" transition={{ ...S.soft, damping: 24 }}
        className="mt-1 overflow-hidden rounded-2xl p-4" style={{ background: "linear-gradient(160deg,#2f6f60,#16213a)" }}>
        <span className="text-teal"><IcSwords size={40} /></span>
        <div className="title-xl mt-2 text-[22px] uppercase">Арена</div>
        <div className="text-[10px] font-bold text-mist">7 раундов · лига Золото</div>
      </motion.div>
      <div className="mt-3 space-y-1.5">
        {["Ставка 150", "Соперник по MMR", "Победа: +380"].map((t, i) => (
          <motion.div key={t} initial={{ x: 22, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.12 + i * 0.07, ...S.soft }}
            className="panel-sunk flex items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-bold">
            <span className="text-teal"><IcCheck size={13} /></span>{t}
          </motion.div>
        ))}
      </div>
      <div className="mt-auto"><BigButton tone="gold">В БОЙ</BigButton></div>
    </div>
  );

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <TopHUD compact />
        <div className="relative mt-2 flex-1 overflow-hidden">
          {/* STACK PUSH */}
          {mode === 0 && (
            <>
              <motion.div className="absolute inset-0" animate={{ x: side ? "-26%" : "0%", scale: side ? 0.94 : 1, filter: side ? "brightness(.45)" : "brightness(1)" }} transition={{ ...S.soft, damping: 26 }}>{A}</motion.div>
              <motion.div className="absolute inset-0 shadow-[-18px_0_40px_rgba(0,0,0,.6)]" animate={{ x: side ? "0%" : "104%" }} transition={{ ...S.soft, damping: 26 }}>{B}</motion.div>
            </>
          )}
          {/* SHARED HERO */}
          {mode === 1 && (
            <AnimatePresence>
              <motion.div key={side} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {side ? B : A}
              </motion.div>
            </AnimatePresence>
          )}
          {/* IRIS */}
          {mode === 2 && (
            <>
              <div className="absolute inset-0">{A}</div>
              <motion.div className="absolute inset-0" animate={{ clipPath: side ? "circle(140% at 50% 78%)" : "circle(0% at 50% 78%)" }} transition={{ duration: 0.7, ease: E.io }}>{B}</motion.div>
            </>
          )}
          {/* LIQUID CURTAIN */}
          {mode === 3 && (
            <>
              <div className="absolute inset-0">{side ? B : A}</div>
              <motion.svg key={side} className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path fill="#3ec9a7"
                  initial={{ d: "M0,100 Q50,100 100,100 L100,101 L0,101 Z" }}
                  animate={{ d: ["M0,100 Q50,52 100,100 L100,101 L0,101 Z", "M0,-1 Q50,-1 100,-1 L100,101 L0,101 Z", "M0,-1 Q50,-40 100,-1 L100,-2 L0,-2 Z"] }}
                  transition={{ duration: 1.1, times: [0, 0.5, 1], ease: E.io }} />
              </motion.svg>
            </>
          )}
        </div>

        <div className="px-3 pb-4 pt-2">
          <div className="mb-1.5 text-center text-[9px] font-bold text-mist">
            {["нижний экран не уходит полностью", "общий элемент морфится", "круг растёт из точки касания", "фронт волны выпрямляется"][mode]}
          </div>
          <Panel className="p-2">
            <div className="grid grid-cols-4 gap-1">
              {FLOWS.map((f, i) => (
                <button key={f} onClick={() => { feel("tap"); setMode(i); }} className="relative rounded-lg px-1 py-1.5">
                  {mode === i && <motion.span layoutId="flow-pill" transition={S.pop} className="absolute inset-0 rounded-lg bg-teal" />}
                  <span className={`relative block text-[8.5px] font-extrabold leading-[1.15] ${mode === i ? "text-[#06231c]" : "text-mist"}`}>{f}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 16 · SYSTEM LAYER — тосты, шит, подтверждение, оффлайн-баннер
   ===================================================================== */
type Toast = { id: number; t: string; s: string; tone: string; Icon: any };
export function SystemLayer({ live = true }: { live?: boolean }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sheet, setSheet] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [offline, setOffline] = useState(false);
  const seq = useRef(0);

  const push = () => {
    const pool: Omit<Toast, "id">[] = [
      { t: "Достижение получено", s: "Серия из 5 верных решений", tone: "#f2c14e", Icon: IcCrown },
      { t: "+380 монет", s: "Победа на Арене", tone: "#3ec9a7", Icon: IcCoinMark },
      { t: "Новая карта", s: "«Кит» · легендарная", tone: "#9d8cf5", Icon: IcCards },
    ];
    const t = { ...pool[seq.current++ % pool.length], id: Math.random() };
    setToasts((x) => [t, ...x].slice(0, 3));
    feel("confirm");
    setTimeout(() => setToasts((x) => x.filter((q) => q.id !== t.id)), 3200);
  };

  useEffect(() => {
    if (!live) return;
    const a = setInterval(push, 2600);
    const b = setInterval(() => setSheet((s) => !s), 5200);
    const c = setInterval(() => { setOffline(true); setTimeout(() => setOffline(false), 2400); }, 9000);
    const d = setInterval(() => { setConfirm(true); setTimeout(() => setConfirm(false), 2600); }, 13000);
    return () => [a, b, c, d].forEach(clearInterval);
  }, [live]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <TopHUD compact />

        {/* фоновый экран игры, поверх которого живёт системный слой */}
        <div className="pointer-events-none absolute inset-x-3 top-[168px] space-y-2 opacity-45">
          <div className="panel h-24 rounded-2xl p-3">
            <div className="h-2.5 w-24 rounded-full bg-white/15" />
            <div className="mt-2 h-2 w-36 rounded-full bg-white/8" />
            <div className="mt-4 flex gap-2">
              {[0, 1, 2].map((k) => <div key={k} className="h-9 flex-1 rounded-xl bg-white/6" />)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((k) => <div key={k} className="panel-sunk h-16 rounded-2xl" />)}
          </div>
        </div>

        {/* оффлайн-баннер */}
        <AnimatePresence>
          {offline && (
            <motion.div initial={{ y: -46, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -46, opacity: 0 }} transition={S.pop}
              className="absolute inset-x-3 top-[72px] z-40 flex items-center gap-2 rounded-xl bg-coral px-3 py-2 text-[10.5px] font-extrabold text-white shadow-lg">
              <IcShield size={14} /> Нет соединения · переподключение…
              <motion.span className="ml-auto h-3 w-3 rounded-full border-2 border-white/60 border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* тосты */}
        <div className="absolute inset-x-3 top-[118px] z-30 space-y-2">
          <AnimatePresence initial={false}>
            {toasts.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ x: 90, opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                animate={{ x: 0, opacity: 1 - i * 0.22, scale: 1 - i * 0.04, filter: "blur(0px)" }}
                exit={{ x: 60, opacity: 0, scale: 0.9 }}
                transition={S.pop}
                className="panel flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                style={{ boxShadow: `inset 0 0 0 1px ${t.tone}55, 0 14px 26px -16px ${t.tone}` }}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: t.tone + "22", color: t.tone }}><t.Icon size={17} /></span>
                <div className="flex-1">
                  <div className="text-[11.5px] font-extrabold">{t.t}</div>
                  <div className="text-[9.5px] font-bold text-mist">{t.s}</div>
                </div>
                <motion.div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: t.tone, originX: 0 }}
                  initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 3.2, ease: "linear" }} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-auto mb-5 space-y-2 px-4">
          <BigButton tone="ghost" onClick={push} icon={<IcBell size={15} />}>ПОКАЗАТЬ УВЕДОМЛЕНИЕ</BigButton>
          <BigButton tone="teal" onClick={() => { feel("tap"); setSheet(true); }} icon={<IcArrow size={15} />}>ОТКРЫТЬ ШИТ</BigButton>
        </div>

        {/* bottom sheet */}
        <AnimatePresence>
          {sheet && (
            <>
              <motion.div className="absolute inset-0 z-40 bg-black/65 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} />
              <motion.div
                className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/10 bg-[#1b2740] p-4 pb-6"
                initial={{ y: 420 }} animate={{ y: 0 }} exit={{ y: 420 }} transition={{ ...S.soft, damping: 27 }}
                drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.5 }}
                onDragEnd={(_, i) => { if (i.offset.y > 80) { setSheet(false); feel("tap"); } }}
              >
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
                <div className="title-xl text-[17px] uppercase">Ставка на бой</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[50, 150, 400].map((v, i) => (
                    <motion.div key={v} initial={{ y: 22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 * i, ...S.pop }}
                      className="panel-sunk rounded-xl py-3 text-center">
                      <div className="grid place-items-center text-gold"><IcCoinMark size={18} /></div>
                      <div className="mono mt-1 text-[12px] font-extrabold">{v}</div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3"><BigButton tone="gold" onClick={() => { setSheet(false); setConfirm(true); }}>ПОДТВЕРДИТЬ</BigButton></div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* модалка подтверждения */}
        <AnimatePresence>
          {confirm && (
            <motion.div className="absolute inset-0 z-[60] grid place-items-center bg-black/70 px-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.7, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.85, y: 20, opacity: 0 }} transition={S.pop}
                className="panel w-full rounded-3xl p-5 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 0.08 }} className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/18 text-gold"><IcStar size={28} /></motion.span>
                <div className="title-xl mt-3 text-[18px] uppercase">Поставить 150?</div>
                <p className="mt-1 text-[11px] font-bold text-mist">Ставка спишется в начале боя и удвоится при победе.</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { feel("deny"); setConfirm(false); }} className="panel-sunk flex-1 rounded-2xl py-3 text-[12px] font-extrabold text-mist">ОТМЕНА</button>
                  <div className="flex-1"><BigButton tone="teal" onClick={() => setConfirm(false)}>ДА</BigButton></div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 17 · ONBOARDING — свайп-интро с параллаксом слоёв
   ===================================================================== */
const SLIDES = [
  { t: "ЧИТАЙ РЫНОК", d: "Свечи, объём, уровни — в игровой форме.", tone: "#3ec9a7" },
  { t: "РЕШАЙ БЫСТРО", d: "7 раундов, 14 секунд на решение.", tone: "#f2c14e" },
  { t: "СОБИРАЙ КАРТЫ", d: "Паттерны превращаются в коллекцию.", tone: "#9d8cf5" },
];
export function Onboarding({ live = true }: { live?: boolean }) {
  const [i, setI] = useTimeline(SLIDES.length, 3000, live);
  const s = SLIDES[i];
  return (
    <Phone>
      <div className="relative flex h-full flex-col overflow-hidden">
        <motion.div key={`bg${i}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          style={{ background: `radial-gradient(70% 50% at 50% 24%, ${s.tone}38, transparent 70%)` }} />
        <div className="mesh absolute inset-0 opacity-50" />

        <div className="relative z-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={i} className="absolute inset-0 flex flex-col items-center justify-center px-6"
              initial={{ x: 120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -120, opacity: 0 }} transition={{ ...S.soft, damping: 26 }}>
              <motion.div className="relative h-52 w-full" >
                {i === 0 && (
                  <motion.div className="absolute inset-0 grid place-items-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={S.pop}>
                    <Panel className="p-3"><ArtCandleChart w={220} h={110} /></Panel>
                  </motion.div>
                )}
                {i === 1 && (
                  <div className="absolute inset-0 grid place-items-center">
                    <motion.svg width="150" height="150" viewBox="0 0 100 100" initial={{ rotate: -90 }} animate={{ rotate: -90 }}>
                      <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,.1)" strokeWidth="9" fill="none" />
                      <motion.circle cx="50" cy="50" r="42" stroke="#f2c14e" strokeWidth="9" fill="none" strokeLinecap="round"
                        strokeDasharray={264} initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset: 60 }} transition={{ duration: 2.4, ease: E.out }} />
                    </motion.svg>
                    <motion.span className="absolute mono text-[30px] font-extrabold" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={S.pop}>14</motion.span>
                  </div>
                )}
                {i === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 1, 2].map((k) => (
                      <motion.div key={k} initial={{ y: 60, rotate: 0, opacity: 0 }} animate={{ y: 0, rotate: (k - 1) * 13, x: (k - 1) * 40, opacity: 1 }}
                        transition={{ ...S.pop, delay: k * 0.09 }} className="absolute" style={{ left: "50%", marginLeft: -46 }}>
                        <ArtCard w={92} seed={k * 4 + 3} rarity={(["rare", "legend", "epic"] as const)[k]} label={["ОБЪЁМ", "КИТ", "ФЛЭТ"][k]} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12, ...S.soft }} className="mt-6 text-center">
                <div className="title-xl text-[27px] uppercase" style={{ color: s.tone }}>{s.t}</div>
                <p className="mt-2 text-[12px] font-bold leading-snug text-white/70">{s.d}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 mb-8 px-6">
          <div className="mb-4 flex justify-center gap-2">
            {SLIDES.map((x, k) => (
              <motion.button key={x.t} onClick={() => { feel("tap"); setI(k); }} animate={{ width: k === i ? 26 : 8, background: k === i ? x.tone : "#2a354e" }} transition={S.pop} className="h-2 rounded-full" />
            ))}
          </div>
          <BigButton tone="teal" onClick={() => setI((i + 1) % SLIDES.length)} icon={<IcArrow size={16} />}>
            {i === SLIDES.length - 1 ? "НАЧАТЬ ИГРАТЬ" : "ДАЛЬШЕ"}
          </BigButton>
          <div className="mt-3 text-center text-[10px] font-bold text-mist">Пропустить</div>
        </div>
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 18 · MATCH SEARCH — поиск соперника: радар, пульс, находка
   ===================================================================== */
export function MatchSearch({ live = true }: { live?: boolean }) {
  const [found, setFound] = useState(false);
  const burst = useRef<any>(null);
  const dots = useRef(Array.from({ length: 7 }, () => ({ a: rnd(0, 360), r: rnd(24, 44) }))).current;

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setFound(true); feel("reward");
      burst.current?.(160, 250, { n: 40, power: 11 });
      setTimeout(() => setFound(false), 2200);
    }, 5200);
    return () => clearInterval(t);
  }, [live]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col items-center justify-center">
        <div className="aurora opacity-50" />
        <Particles api={burst} />

        <div className="relative z-10 text-center">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.4em] text-teal">Подбор соперника</div>
          <div className="title-xl mt-1 text-[20px] uppercase">{found ? "Соперник найден" : "Поиск по MMR…"}</div>
        </div>

        <div className="relative z-10 mt-6 grid h-56 w-56 place-items-center">
          <div className="absolute inset-0 rounded-full border border-teal/25 bg-[radial-gradient(circle,rgba(62,201,167,.12),transparent_70%)]" />
          {[0.72, 0.46].map((k) => <div key={k} className="absolute rounded-full border border-teal/15" style={{ width: `${k * 100}%`, height: `${k * 100}%` }} />)}
          <motion.div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(62,201,167,.55), transparent 26%)" }}
            animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }} />
          {dots.map((d, i) => (
            <motion.span key={i} className="absolute h-2.5 w-2.5 rounded-full bg-gold"
              style={{ transform: `rotate(${d.a}deg) translateY(-${d.r}%)`, boxShadow: "0 0 10px #f2c14e" }}
              animate={{ opacity: [1, 0.1, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: (d.a / 360) * 2.4 }} />
          ))}
          <AnimatePresence>
            {found ? (
              <motion.div key="op" initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={S.pop}
                className="relative grid h-24 w-24 place-items-center rounded-3xl bg-purple/22 text-purple glow-purple">
                <IcSwords size={40} />
              </motion.div>
            ) : (
              <motion.div key="me" className="relative grid h-16 w-16 place-items-center rounded-2xl bg-teal/20 text-teal">
                <IcTarget size={28} />
                <motion.span className="absolute inset-0 rounded-2xl border-2 border-teal ring-out" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="relative z-10 mt-6 w-full px-6" animate={{ opacity: found ? 1 : 0.65 }}>
          <Panel className="flex items-center gap-3 p-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-purple/18 text-purple"><IcCrown size={20} /></span>
            <div className="flex-1">
              <div className="text-[12px] font-extrabold">{found ? "TRADER_K · Золото II" : "Ищем равного…"}</div>
              <div className="mt-1"><Bar v={found ? 1 : 0.45} tone={found ? "#9d8cf5" : "#3ec9a7"} h={6} /></div>
            </div>
            <span className="mono text-[11px] font-extrabold text-mist">{found ? "MMR 4310" : "0:07"}</span>
          </Panel>
        </motion.div>

        <div className="relative z-10 mt-4 w-full px-6">
          <BigButton tone={found ? "gold" : "ghost"} icon={found ? <IcTrend size={15} /> : <IcClose size={15} />}>
            {found ? "ПРИНЯТЬ БОЙ" : "ОТМЕНИТЬ ПОИСК"}
          </BigButton>
        </div>
      </div>
    </Phone>
  );
}
