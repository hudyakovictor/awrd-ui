import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { Phone, TopHUD, BottomNav, Panel, Bar, BigButton, Tag } from "../ui/kit";
import { S, E, feel, useCount, useTimeline, Particles, useImpact, clamp } from "../lib/motion";
import {
  IcSwords, IcClock, IcCheck, IcClose, IcTrend, IcShield, IcEye, IcBolt, IcFlame, IcRefresh, IcWarn, IcCoinMark, IcGauge,
} from "../ui/icons";

/* =====================================================================
   ВЕКТОРНЫЙ АВАТАР — гексагональный жетон игрока.
   Процедурный: seed меняет «шлем», визор и цвет, без растра.
   ===================================================================== */
export function HexAvatar({ size = 84, tone = "#3ec9a7", seed = 1, ring = true }: { size?: number; tone?: string; seed?: number; ring?: boolean }) {
  const visor = ["M34 44h32", "M32 42q18 10 36 0", "M34 40l16 8 16-8"][seed % 3];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id={`hx${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={tone} />
          <stop offset="1" stopColor="#1b2a48" />
        </linearGradient>
        <clipPath id={`hc${seed}`}><path d="M50 6 88 28v44L50 94 12 72V28L50 6Z" /></clipPath>
      </defs>
      <path d="M50 6 88 28v44L50 94 12 72V28L50 6Z" fill="#0e1729" />
      <g clipPath={`url(#hc${seed})`}>
        <rect width="100" height="100" fill={`url(#hx${seed})`} opacity=".35" />
        {/* плечи */}
        <path d="M18 96c4-20 18-28 32-28s28 8 32 28" fill="#0e1729" stroke={tone} strokeWidth="2.5" />
        {/* шлем */}
        <path d="M30 50c0-14 9-24 20-24s20 10 20 24v6c0 8-9 14-20 14s-20-6-20-14v-6Z" fill="#16233c" stroke={tone} strokeWidth="2.5" />
        <path d={visor} stroke={tone} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 26v-8" stroke={tone} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="16" r="3" fill={tone} />
      </g>
      {ring && <path d="M50 6 88 28v44L50 94 12 72V28L50 6Z" stroke={tone} strokeWidth="3" strokeLinejoin="round" />}
    </svg>
  );
}

/* =====================================================================
   АССЕТ 23 · PLAYER PROFILE — статус игрока: кольцо XP + радар навыков
   ===================================================================== */
const SKILLS = [
  { k: "Техника", v: 0.85, tone: "#3ec9a7" },
  { k: "Риск", v: 0.72, tone: "#5b9cd6" },
  { k: "Фундамент", v: 0.5, tone: "#f2c14e" },
  { k: "Психология", v: 0.9, tone: "#9d8cf5" },
  { k: "Безопасность", v: 0.6, tone: "#e46a5f" },
];
const RIVAL = [0.6, 0.8, 0.7, 0.55, 0.75];

export function PlayerProfile({ live = true }: { live?: boolean }) {
  const [cmp] = useTimeline(2, [3600, 3000], live);
  const [focus, setFocus] = useState<number | null>(null);
  const xp = useCount(67, 1.4);
  const R = 58;
  const C = 2 * Math.PI * R;

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-40" />
        <TopHUD compact />

        {/* шапка: аватар + кольцо XP */}
        <div className="relative z-10 mt-2 flex items-center gap-3 px-4">
          <div className="relative">
            <motion.div initial={{ scale: 0.4, rotate: -30, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={S.pop}>
              <HexAvatar size={74} seed={2} />
            </motion.div>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...S.pop, delay: 0.3 }}
              className="absolute -bottom-1 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full bg-gold text-[#3c2a04]"
              style={{ boxShadow: "0 0 0 3px #101827" }}>
              <IcTrend size={13} />
            </motion.span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mono text-[10px] font-bold text-mist">@trader_pro</div>
            <div className="title-xl truncate text-[18px] uppercase">Охотник за трендом</div>
            <div className="mt-1 flex gap-1.5"><Tag tone="#f2c14e">Лига Золото</Tag><Tag tone="#e46a5f">12 дн</Tag></div>
          </div>
          <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center">
            <svg viewBox="0 0 140 140" className="absolute inset-0 -rotate-90">
              <circle cx="70" cy="70" r={R} stroke="rgba(255,255,255,.08)" strokeWidth="12" fill="none" />
              <motion.circle cx="70" cy="70" r={R} stroke="url(#xpg)" strokeWidth="12" fill="none" strokeLinecap="round"
                strokeDasharray={C} initial={{ strokeDashoffset: C }} animate={{ strokeDashoffset: C * (1 - 0.67) }} transition={{ ...S.heavy, delay: 0.2 }} />
              <defs><linearGradient id="xpg"><stop stopColor="#3ec9a7" /><stop offset="1" stopColor="#5b9cd6" /></linearGradient></defs>
            </svg>
            <div className="text-center">
              <div className="mono text-[17px] font-extrabold leading-none">{Math.round(xp)}%</div>
              <div className="mono text-[7.5px] font-bold text-mist">6 700 XP</div>
            </div>
          </div>
        </div>

        {/* радар */}
        <div className="relative z-10 mt-3 px-3">
          <Panel className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-mist">Профиль навыков</span>
              <AnimatePresence mode="wait">
                <motion.span key={cmp} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="text-[9px] font-extrabold uppercase" style={{ color: cmp ? "#9d8cf5" : "#3ec9a7" }}>
                  {cmp ? "vs TRADER_K" : "только ты"}
                </motion.span>
              </AnimatePresence>
            </div>
            <Radar values={SKILLS.map((s) => s.v)} rival={cmp ? RIVAL : null} focus={focus} />
          </Panel>
        </div>

        {/* бары навыков */}
        <div className="relative z-10 mt-2.5 space-y-1.5 px-3">
          {SKILLS.map((s, i) => (
            <motion.button key={s.k}
              onPointerEnter={() => setFocus(i)} onPointerLeave={() => setFocus(null)} onClick={() => { feel("tap"); setFocus(focus === i ? null : i); }}
              initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ ...S.soft, delay: 0.3 + i * 0.06 }}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-1"
              style={{ background: focus === i ? s.tone + "18" : "transparent" }}>
              <span className="w-[74px] shrink-0 text-left text-[10px] font-extrabold" style={{ color: focus === i ? s.tone : "#cfe0f7" }}>{s.k}</span>
              <Bar v={s.v} tone={s.tone} h={6} />
              <span className="mono w-8 shrink-0 text-right text-[10px] font-extrabold" style={{ color: s.tone }}>{Math.round(s.v * 100)}</span>
            </motion.button>
          ))}
        </div>

        <div className="relative z-10 mt-auto mb-[84px] px-3">
          <BigButton tone="teal" icon={<IcGauge size={15} />}>ОТКРЫТЬ ДЕРЕВО НАВЫКОВ</BigButton>
        </div>
        <BottomNav active="more" />
      </div>
    </Phone>
  );
}

/** Радар: полигон морфится через атрибут points, сравнение — вторым слоем */
function Radar({ values, rival, focus }: { values: number[]; rival: number[] | null; focus: number | null }) {
  const cx = 120, cy = 84, r = 66, n = values.length;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v];
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");
  const zero = poly(values.map(() => 0.05));
  return (
    <svg viewBox="0 0 240 168" className="mt-1 w-full">
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <polygon key={k} points={poly(values.map(() => k))} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={focus === i ? SKILLS[i].tone : "rgba(255,255,255,.07)"} strokeWidth={focus === i ? 1.6 : 1} />;
      })}
      <AnimatePresence>
        {rival && (
          <motion.polygon key="rival" fill="rgba(157,140,245,.16)" stroke="#9d8cf5" strokeWidth="1.6" strokeDasharray="4 3"
            initial={{ points: zero, opacity: 0 } as any} animate={{ points: poly(rival), opacity: 1 } as any} exit={{ points: zero, opacity: 0 } as any}
            transition={S.soft} />
        )}
      </AnimatePresence>
      <motion.polygon fill="rgba(62,201,167,.22)" stroke="#3ec9a7" strokeWidth="2" strokeLinejoin="round"
        initial={{ points: zero } as any} animate={{ points: poly(values) } as any} transition={{ ...S.pop, delay: 0.25 }} />
      {values.map((v, i) => {
        const [x, y] = pt(i, v);
        const [lx, ly] = pt(i, 1.22);
        return (
          <g key={i}>
            <motion.circle cx={x} cy={y} fill={SKILLS[i].tone} initial={{ r: 0 }} animate={{ r: focus === i ? 5.5 : 3.4 }} transition={{ ...S.pop, delay: focus === null ? 0.4 + i * 0.05 : 0 }} />
            <text x={lx} y={ly + 3} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={focus === i ? SKILLS[i].tone : "#8fa4c7"} fontFamily="Manrope, sans-serif">
              {SKILLS[i].k}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* =====================================================================
   АССЕТ 24 · DUEL INVITE — входящий вызов: обратный отсчёт, свайп-решение
   ===================================================================== */
export function DuelInvite({ live = true }: { live?: boolean }) {
  const [state, setState] = useState<"idle" | "incoming" | "accepted" | "declined">("idle");
  const [left, setLeft] = useState(1);
  const x = useMotionValue(0);
  const rot = useTransform(x, [-160, 160], [-14, 14]);
  const okOp = useTransform(x, [30, 110], [0, 1]);
  const noOp = useTransform(x, [-110, -30], [1, 0]);
  const imp = useImpact();
  const burst = useRef<any>(null);

  const decide = (ok: boolean) => {
    if (state !== "incoming") return;
    animate(x, ok ? 380 : -380, { duration: 0.34, ease: E.out });
    feel(ok ? "reward" : "deny", ok ? [10, 26, 10] : 24);
    setTimeout(() => {
      setState(ok ? "accepted" : "declined");
      if (ok) { imp.fire(14, 0.4); burst.current?.(160, 280, { n: 44, power: 11, colors: ["#3ec9a7", "#f2c14e", "#eaf2ff"] }); }
    }, 260);
  };

  /* сценарий: вызов → отсчёт → решение → сброс */
  useEffect(() => {
    if (!live) { setState("incoming"); setLeft(0.7); return; }
    let t: any[] = [];
    const cycle = () => {
      x.set(0); setState("idle"); setLeft(1);
      t.push(setTimeout(() => { setState("incoming"); feel("sweep"); }, 700));
      t.push(setTimeout(() => decide(true), 4200));
      t.push(setTimeout(cycle, 7600));
    };
    cycle();
    return () => t.forEach(clearTimeout);
  }, [live]);

  useEffect(() => {
    if (state !== "incoming" || !live) return;
    const t0 = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      const v = clamp(1 - (t - t0) / 15000);
      setLeft(v);
      if (v > 0) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, live]);

  const R = 26, C = 2 * Math.PI * R;

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />

        {/* фоновый хаб — дуэль приходит поверх игры */}
        <div className="pointer-events-none mt-3 space-y-2 px-3 opacity-40">
          <div className="panel h-28 rounded-2xl" />
          <div className="grid grid-cols-2 gap-2"><div className="panel h-20 rounded-2xl" /><div className="panel h-20 rounded-2xl" /></div>
          <div className="panel h-24 rounded-2xl" />
        </div>

        <AnimatePresence>
          {state !== "idle" && (
            <motion.div className="absolute inset-0 z-20 bg-[#070c17]/70 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>

        <div className="absolute inset-x-4 top-[110px] z-30">
          <AnimatePresence mode="wait">
            {state === "incoming" && (
              <motion.div key="card"
                initial={{ y: -120, scale: 0.85, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ ...S.pop, damping: 15 }}
                drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8}
                onDragEnd={(_, i) => { if (Math.abs(i.offset.x) > 90 || Math.abs(i.velocity.x) > 520) decide(i.offset.x > 0); }}
                style={{ x, rotate: rot }}
                className="relative cursor-grab touch-none overflow-hidden rounded-3xl p-4 active:cursor-grabbing"
              >
                <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(165deg,#2a2450,#18223a 60%)", boxShadow: "inset 0 0 0 1.5px #9d8cf5aa, 0 30px 60px -20px #000" }} />
                <motion.div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple/30 blur-2xl"
                  animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2.4, repeat: Infinity }} />

                <motion.div style={{ opacity: okOp }} className="absolute left-4 top-4 z-10 rotate-[-12deg] rounded-lg border-2 border-teal px-2 py-0.5 text-[11px] font-extrabold text-teal">ПРИНЯТЬ</motion.div>
                <motion.div style={{ opacity: noOp }} className="absolute right-4 top-4 z-10 rotate-[12deg] rounded-lg border-2 border-coral px-2 py-0.5 text-[11px] font-extrabold text-coral">ОТКАЗ</motion.div>

                <div className="relative text-center">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.35em] text-purple">Вызов на дуэль</div>
                  <div className="relative mx-auto mt-3 grid h-[92px] w-[92px] place-items-center">
                    <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
                      <circle cx="32" cy="32" r={R} stroke="rgba(255,255,255,.08)" strokeWidth="4" fill="none" />
                      <circle cx="32" cy="32" r={R} stroke={left < 0.3 ? "#e46a5f" : "#9d8cf5"} strokeWidth="4" fill="none" strokeLinecap="round"
                        strokeDasharray={C} strokeDashoffset={C * (1 - left)} />
                    </svg>
                    <HexAvatar size={66} tone="#9d8cf5" seed={4} />
                  </div>
                  <div className="title-xl mt-2 text-[18px] uppercase">@crypto_knight</div>
                  <div className="mono text-[10px] font-bold text-mist">ЗОЛОТО II · MMR 4 310 · винрейт 58%</div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[{ l: "СТАВКА", v: "200", Icon: IcCoinMark, t: "#f2c14e" }, { l: "РАУНДЫ", v: "5", Icon: IcSwords, t: "#3ec9a7" }, { l: "ОТВЕТ", v: `${Math.ceil(left * 15)}с`, Icon: IcClock, t: left < 0.3 ? "#e46a5f" : "#9d8cf5" }].map((s) => (
                      <div key={s.l} className="panel-sunk rounded-xl py-2">
                        <div className="grid place-items-center" style={{ color: s.t }}><s.Icon size={15} /></div>
                        <div className="mono mt-0.5 text-[12px] font-extrabold tabular-nums">{s.v}</div>
                        <div className="text-[7.5px] font-extrabold tracking-widest text-mist">{s.l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <div className="flex-1"><BigButton tone="ghost" onClick={() => decide(false)} icon={<IcClose size={14} />}>ОТКАЗ</BigButton></div>
                    <div className="flex-1"><BigButton tone="teal" onClick={() => decide(true)} icon={<IcCheck size={14} />}>ПРИНЯТЬ</BigButton></div>
                  </div>
                  <div className="mt-2 text-[9px] font-bold text-mist">или свайп карточки влево / вправо</div>
                </div>
              </motion.div>
            )}

            {state === "accepted" && (
              <motion.div key="acc" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={S.pop}
                className="flex items-center justify-center gap-4 pt-10">
                <motion.div initial={{ x: -140, rotate: -20 }} animate={{ x: 0, rotate: 0 }} transition={S.pop}><HexAvatar size={84} seed={2} /></motion.div>
                <motion.div initial={{ scale: 3, opacity: 0, filter: "blur(10px)" }} animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }} transition={{ ...S.pop, delay: 0.15 }}
                  className="title-xl text-[34px] italic text-gold" style={{ textShadow: "0 0 24px rgba(242,193,78,.7)" }}>VS</motion.div>
                <motion.div initial={{ x: 140, rotate: 20 }} animate={{ x: 0, rotate: 0 }} transition={S.pop}><HexAvatar size={84} tone="#9d8cf5" seed={4} /></motion.div>
              </motion.div>
            )}

            {state === "declined" && (
              <motion.div key="dec" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
                className="panel mx-auto mt-16 w-fit rounded-2xl px-4 py-3 text-center text-[11px] font-extrabold text-mist">Вызов отклонён</motion.div>
            )}
          </AnimatePresence>
        </div>

        <BottomNav active="arena" />
      </motion.div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 25 · FORECAST — «угадай следующую свечу»: drag & snap
   ===================================================================== */
const PUZ = [
  { o: 40, c: 48 }, { o: 48, c: 45 }, { o: 45, c: 56 }, { o: 56, c: 53 }, { o: 53, c: 64 }, { o: 64, c: 60 }, { o: 60, c: 70 },
];
const OPTIONS = [
  { id: "up", label: "Продолжение", o: 70, c: 80, ok: true },
  { id: "doji", label: "Дожи", o: 70, c: 71, ok: false },
  { id: "down", label: "Разворот", o: 70, c: 58, ok: false },
];

export function ForecastPuzzle({ live = true }: { live?: boolean }) {
  const [placed, setPlaced] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<null | boolean>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const burst = useRef<any>(null);
  const imp = useImpact();

  const drop = (id: string, pt: { x: number; y: number }) => {
    const r = slotRef.current?.getBoundingClientRect();
    if (!r) return false;
    const inside = pt.x > r.left - 24 && pt.x < r.right + 24 && pt.y > r.top - 24 && pt.y < r.bottom + 24;
    if (!inside) { feel("tap"); return false; }
    place(id);
    return true;
  };
  const place = (id: string) => {
    const o = OPTIONS.find((x) => x.id === id)!;
    setPlaced(id);
    setVerdict(o.ok);
    feel(o.ok ? "reward" : "deny", o.ok ? [10, 24, 10] : 26);
    imp.fire(o.ok ? 8 : 14, 0.35);
    if (o.ok) burst.current?.(236, 190, { n: 40, power: 10 });
  };

  useEffect(() => {
    if (!live) return;
    const seq = ["down", "up"];
    let k = 0;
    const t = setInterval(() => {
      if (k % 3 === 2) { setPlaced(null); setVerdict(null); } else place(seq[k % 3]);
      k++;
    }, 2400);
    return () => clearInterval(t);
  }, [live]);

  const cy = (v: number) => 128 - v * 1.35;
  const opt = OPTIONS.find((o) => o.id === placed);

  return (
    <Phone>
      <motion.div style={{ x: imp.x, y: imp.y }} className="relative flex h-full flex-col">
        <Particles api={burst} />
        <TopHUD compact />

        <div className="px-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-gold">Прогноз дня · #214</div>
            <span className="mono flex items-center gap-1 text-[10px] font-bold text-mist"><IcClock size={11} />11:42:08</span>
          </div>
          <div className="title-xl mt-1 text-[17px] uppercase leading-tight">Какой будет следующая свеча?</div>
          <div className="mt-1 text-[10px] font-bold text-mist">Перетащи вариант в пустой слот графика</div>
        </div>

        <div className="mt-3 px-3">
          <Panel className="relative p-3">
            <div className="relative h-[140px]">
              <svg viewBox="0 0 280 140" className="absolute inset-0 h-full w-full">
                {[0, 1, 2, 3].map((g) => <line key={g} x1="0" y1={20 + g * 32} x2="280" y2={20 + g * 32} stroke="rgba(255,255,255,.05)" />)}
                <motion.path d={`M8 ${cy(46)} L220 ${cy(72)}`} stroke="#3ec9a7" strokeWidth="1.5" strokeDasharray="5 5" opacity=".5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.6 }} />
                {PUZ.map((c, i) => {
                  const up = c.c > c.o, col = up ? "#3ec9a7" : "#e46a5f", x = 12 + i * 30;
                  return (
                    <motion.g key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...S.pop, delay: 0.1 + i * 0.07 }}>
                      <line x1={x + 7} y1={cy(Math.max(c.o, c.c) + 4)} x2={x + 7} y2={cy(Math.min(c.o, c.c) - 4)} stroke={col} strokeWidth="2" />
                      <rect x={x} y={cy(Math.max(c.o, c.c))} width="14" height={Math.max(4, Math.abs(c.c - c.o) * 1.35)} rx="2.5" fill={col} />
                    </motion.g>
                  );
                })}
              </svg>
              {/* слот */}
              <div ref={slotRef} className="absolute bottom-2 top-2 w-[34px] rounded-xl" style={{ left: `${(222 / 280) * 100}%` }}>
                <motion.div className="absolute inset-0 rounded-xl border-2 border-dashed"
                  animate={{ borderColor: verdict === null ? ["#f2c14e55", "#f2c14ecc", "#f2c14e55"] : verdict ? "#3ec9a7" : "#e46a5f" }}
                  transition={{ duration: 1.6, repeat: verdict === null ? Infinity : 0 }} />
                <AnimatePresence>
                  {opt && (
                    <motion.svg key={opt.id} viewBox="0 0 34 136" className="absolute inset-0 h-full w-full"
                      initial={{ scale: 1.5, opacity: 0, y: -30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6 }} transition={S.pop}>
                      {(() => {
                        const up = opt.c >= opt.o, col = up ? "#3ec9a7" : "#e46a5f";
                        const y = (v: number) => 128 - v * 1.35 - 2;
                        return (
                          <>
                            <line x1="17" y1={y(Math.max(opt.o, opt.c) + 4)} x2="17" y2={y(Math.min(opt.o, opt.c) - 4)} stroke={col} strokeWidth="2" />
                            <rect x="10" y={y(Math.max(opt.o, opt.c))} width="14" height={Math.max(4, Math.abs(opt.c - opt.o) * 1.35)} rx="2.5" fill={col} />
                          </>
                        );
                      })()}
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <AnimatePresence>
              {verdict !== null && (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={S.pop}
                  className="mt-2 flex items-center gap-2 rounded-xl px-2.5 py-2"
                  style={{ background: verdict ? "#3ec9a71c" : "#e46a5f1c", color: verdict ? "#3ec9a7" : "#e46a5f" }}>
                  {verdict ? <IcCheck size={14} /> : <IcClose size={14} />}
                  <span className="text-[10.5px] font-extrabold text-white/90">
                    {verdict ? "Верно: восходящий канал с растущими минимумами." : "Нет: структура минимумов не сломана."}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </div>

        {/* варианты — перетаскиваемые жетоны */}
        <div className="mt-3 grid grid-cols-3 gap-2 px-3">
          {OPTIONS.map((o, i) => (
            <PuzzleChip key={o.id} o={o} i={i} used={placed === o.id} onDrop={drop} onTap={() => place(o.id)} />
          ))}
        </div>

        <div className="mt-3 px-3">
          <Panel className="flex items-center gap-2.5 p-2.5">
            <span className="text-coral"><IcFlame size={18} /></span>
            <div className="flex-1">
              <div className="text-[11px] font-extrabold">Серия прогнозов: 6 дней</div>
              <div className="mt-1"><Bar v={6} max={7} tone="#e46a5f" h={5} /></div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-1 text-gold"><IcCoinMark size={12} /><span className="mono text-[10px] font-extrabold">+50</span></span>
          </Panel>
        </div>
        <div className="flex-1" />
        <div className="h-[70px] shrink-0" />
        <BottomNav active="academy" />
      </motion.div>
    </Phone>
  );
}

function PuzzleChip({ o, i, used, onDrop, onTap }: { o: (typeof OPTIONS)[number]; i: number; used: boolean; onDrop: (id: string, p: { x: number; y: number }) => boolean; onTap: () => void }) {
  const x = useMotionValue(0), y = useMotionValue(0);
  const up = o.c >= o.o, col = up ? "#3ec9a7" : "#e46a5f";
  return (
    <motion.div
      drag dragMomentum={false} style={{ x, y }}
      onDragStart={() => feel("tap")}
      onDragEnd={(_, info) => { onDrop(o.id, info.point); animate(x, 0, S.pop); animate(y, 0, S.pop); }}
      onTap={onTap}
      initial={{ y: 20, opacity: 0 }} animate={{ opacity: used ? 0.4 : 1 }} transition={{ ...S.pop, delay: 0.3 + i * 0.07 }}
      whileDrag={{ scale: 1.12, zIndex: 40, boxShadow: "0 20px 40px -10px #000" }}
      whileTap={{ scale: 0.95 }}
      className="panel relative z-10 flex cursor-grab touch-none flex-col items-center gap-1 rounded-2xl py-2.5 active:cursor-grabbing"
    >
      <svg width="20" height="36" viewBox="0 0 20 36">
        <line x1="10" y1="2" x2="10" y2="34" stroke={col} strokeWidth="2" />
        <rect x="3" y={up ? 8 : 10} width="14" height={Math.max(3, Math.abs(o.c - o.o) * 1.6)} rx="2.5" fill={col} />
      </svg>
      <span className="text-[9.5px] font-extrabold">{o.label}</span>
    </motion.div>
  );
}

/* =====================================================================
   АССЕТ 26 · RESUME BATTLE — прерванный бой: тревога, отсчёт, возврат
   ===================================================================== */
export function ResumeBattle({ live = true }: { live?: boolean }) {
  const [sec, setSec] = useState(29 * 60 + 45);
  const [phase, setPhase] = useState<"alert" | "loading" | "back">("alert");
  const [load, setLoad] = useState(0);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    const c = setInterval(() => {
      setPhase("loading"); setLoad(0); feel("sweep");
      setTimeout(() => { setPhase("back"); feel("confirm"); }, 1700);
      setTimeout(() => setPhase("alert"), 3600);
    }, 6400);
    return () => { clearInterval(t); clearInterval(c); };
  }, [live]);

  useEffect(() => {
    if (phase !== "loading") return;
    const t0 = performance.now(); let raf = 0;
    const loop = (t: number) => { const v = clamp((t - t0) / 1500); setLoad(v); if (v < 1) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <TopHUD compact />

        <div className="relative mx-3 mt-4 flex-1">
          <AnimatePresence mode="wait">
            {phase !== "back" ? (
              <motion.div key="alert" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                transition={S.soft} className="relative h-full">
                {/* тревожная рамка — угловые скобы + пульс */}
                <motion.div className="absolute inset-0 rounded-3xl"
                  animate={{ boxShadow: ["0 0 0 1.5px #e46a5f66, 0 0 0px #e46a5f00", "0 0 0 1.5px #e46a5fdd, 0 0 36px #e46a5f55", "0 0 0 1.5px #e46a5f66, 0 0 0px #e46a5f00"] }}
                  transition={{ duration: 1.8, repeat: Infinity }} style={{ background: "linear-gradient(170deg,#3a1e24,#18223a 55%)" }} />
                {[["left-2 top-2", "M2 14V2h12"], ["right-2 top-2", "M2 2h12v12"], ["left-2 bottom-2", "M2 2v12h12"], ["right-2 bottom-2", "M14 2v12H2"]].map(([pos, d]) => (
                  <motion.svg key={pos} width="16" height="16" viewBox="0 0 16 16" className={`absolute ${pos}`}
                    animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <path d={d} stroke="#e46a5f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </motion.svg>
                ))}

                <div className="relative p-5 text-center">
                  <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                    className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-coral/20 text-coral"><IcWarn size={28} /></motion.div>
                  <div className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.35em] text-coral">Бой прерван</div>
                  <div className="title-xl mt-1 text-[21px] uppercase">«Крепость HODL»</div>
                  <div className="mt-1 text-[10.5px] font-bold text-mist">Раунд 4 из 7 · ты ведёшь 3 : 1</div>

                  {/* мини-карта мира: точки-сервера */}
                  <div className="panel-sunk relative mx-auto mt-4 h-[104px] overflow-hidden rounded-2xl">
                    <svg viewBox="0 0 240 104" className="absolute inset-0 h-full w-full">
                      {Array.from({ length: 13 }).map((_, r) =>
                        Array.from({ length: 30 }).map((__, c) => {
                          const on = Math.sin(c * 0.45 + r * 0.9) + Math.cos(r * 0.6 - c * 0.2) > 0.6;
                          return on ? <circle key={`${r}-${c}`} cx={6 + c * 7.9} cy={6 + r * 7.6} r="1.4" fill="#5b7799" opacity=".55" /> : null;
                        }),
                      )}
                      <motion.path d="M52 58 Q120 10 186 44" stroke="#e46a5f" strokeWidth="1.6" fill="none" strokeDasharray="4 4"
                        animate={{ strokeDashoffset: [0, -16] }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                      {[[52, 58], [186, 44]].map(([x, y], i) => (
                        <g key={i}>
                          <motion.circle cx={x} cy={y} fill="none" stroke="#e46a5f" strokeWidth="1.5" animate={{ r: [3, 12], opacity: [0.9, 0] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.5 }} />
                          <circle cx={x} cy={y} r="3.2" fill="#e46a5f" />
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="mt-4">
                    <div className="text-[9px] font-extrabold uppercase tracking-widest text-mist">место сохранено ещё</div>
                    <div className="mono mt-1 text-[34px] font-extrabold tabular-nums text-white">
                      {mm}<motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>:</motion.span>{ss}
                    </div>
                  </div>

                  <div className="mt-3">
                    {phase === "loading" ? (
                      <div className="space-y-2">
                        <Bar v={load} tone="#3ec9a7" h={12} label={`синхронизация ${Math.round(load * 100)}%`} />
                        <div className="text-[9.5px] font-bold text-mist">восстанавливаем стакан и таймеры…</div>
                      </div>
                    ) : (
                      <motion.div animate={{ scale: [1, 1.025, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>
                        <BigButton tone="coral" icon={<IcRefresh size={15} />}>ВЕРНУТЬСЯ В БОЙ</BigButton>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="back" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={S.pop}
                className="grid h-full place-items-center">
                <div className="text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={S.pop}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal/20 text-teal"><IcCheck size={32} /></motion.div>
                  <div className="title-xl mt-3 text-[22px] uppercase">Ты снова в бою</div>
                  <div className="mono mt-1 text-[11px] font-bold text-mist">раунд 4 · счёт 3 : 1</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[84px] shrink-0" />
        <BottomNav active="arena" />
      </div>
    </Phone>
  );
}

/* =====================================================================
   АССЕТ 27 · AI COACH — рекомендации: «печатающийся» инсайт + приоритеты
   ===================================================================== */
const TIPS = [
  { t: "Слабый навык: размер позиции", d: "В 4 из 5 последних боёв риск на сделку был выше 2%.", cta: "УЛУЧШИТЬ", tone: "#e46a5f", Icon: IcShield, p: 0.92 },
  { t: "Повтор: игнор объёма (3× за неделю)", d: "Все три входа — на пробое без подтверждения.", cta: "РАЗБОР", tone: "#f2c14e", Icon: IcClock, p: 0.74 },
  { t: "Проверка мастерства через 234 XP", d: "Ветка «Риск» почти закрыта — время подготовиться.", cta: "ГОТОВ", tone: "#3ec9a7", Icon: IcCheck, p: 0.45 },
];
const INSIGHT = "Ты лучше всего играешь первые три раунда. После четвёртого точность падает на 18% — скорее всего, усталость и спешка.";

export function AICoach({ live = true }: { live?: boolean }) {
  const [typed, setTyped] = useState(live ? 0 : INSIGHT.length);
  const [thinking, setThinking] = useState(live);

  useEffect(() => {
    if (!live) return;
    let raf = 0, t0 = 0;
    const start = setTimeout(() => {
      setThinking(false);
      t0 = performance.now();
      const loop = (t: number) => {
        const n = Math.min(INSIGHT.length, Math.floor((t - t0) / 22));
        setTyped(n);
        if (n < INSIGHT.length) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }, 1300);
    const reset = setInterval(() => { setTyped(0); setThinking(true); setTimeout(() => { setThinking(false); t0 = performance.now(); const loop = (t: number) => { const n = Math.min(INSIGHT.length, Math.floor((t - t0) / 22)); setTyped(n); if (n < INSIGHT.length) raf = requestAnimationFrame(loop); }; raf = requestAnimationFrame(loop); }, 1300); }, 9000);
    return () => { clearTimeout(start); clearInterval(reset); cancelAnimationFrame(raf); };
  }, [live]);

  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <div className="aurora opacity-35" />
        <TopHUD compact />

        <div className="relative z-10 flex items-center gap-3 px-4 pt-2">
          <CoachOrb thinking={thinking} />
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-[0.3em] text-teal">AI-коуч</div>
            <div className="title-xl text-[18px] uppercase">Разбор недели</div>
          </div>
        </div>

        {/* инсайт */}
        <div className="relative z-10 mt-3 px-3">
          <Panel className="relative overflow-hidden p-3">
            <motion.div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal to-transparent"
              animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }} />
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-mist"><IcEye size={12} /> наблюдение</div>
            <div className="mt-1.5 min-h-[64px] text-[12px] font-bold leading-snug text-white/90">
              {thinking ? (
                <span className="flex items-center gap-1.5 text-mist">
                  анализирую 42 боя
                  {[0, 1, 2].map((k) => (
                    <motion.span key={k} className="h-1.5 w-1.5 rounded-full bg-teal" animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: k * 0.15 }} />
                  ))}
                </span>
              ) : (
                <>
                  {INSIGHT.slice(0, typed)}
                  {typed < INSIGHT.length && <motion.span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 bg-teal" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />}
                </>
              )}
            </div>
            {/* мини-график точности по раундам */}
            <div className="mt-2 flex h-10 items-end gap-1.5">
              {[0.82, 0.86, 0.84, 0.7, 0.66, 0.64, 0.61].map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-0.5">
                  <motion.div className="w-full rounded-sm" style={{ background: i < 3 ? "#3ec9a7" : "#e46a5f" }}
                    initial={{ height: 2 }} animate={{ height: typed > 40 ? v * 34 : 2 }} transition={{ ...S.pop, delay: i * 0.05 }} />
                  <span className="mono text-[7px] font-bold text-mist">R{i + 1}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* рекомендации по приоритету */}
        <div className="relative z-10 mt-3 space-y-2 px-3">
          {TIPS.map((t, i) => (
            <motion.div key={t.t}
              initial={{ x: 30, opacity: 0, filter: "blur(6px)" }}
              animate={typed >= INSIGHT.length || !live ? { x: 0, opacity: 1, filter: "blur(0px)" } : { x: 30, opacity: 0, filter: "blur(6px)" }}
              transition={{ ...S.soft, delay: i * 0.09 }}
              className="flex items-center gap-2.5 rounded-2xl p-2.5"
              style={{ background: "#1a2338", boxShadow: `inset 3px 0 0 ${t.tone}, inset 0 0 0 1px rgba(255,255,255,.06)` }}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: t.tone + "22", color: t.tone }}><t.Icon size={16} /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-extrabold">{t.t}</div>
                <div className="line-clamp-2 text-[9.5px] font-bold leading-snug text-mist">{t.d}</div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 text-[7.5px] font-extrabold tracking-widest text-mist">ПРИОРИТЕТ</span>
                  <div className="h-1 min-w-0 max-w-[56px] flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full" style={{ background: t.tone }} initial={{ width: 0 }} animate={{ width: `${t.p * 100}%` }} transition={{ ...S.soft, delay: 0.3 + i * 0.1 }} />
                  </div>
                </div>
              </div>
              <button onClick={() => feel("confirm")} className="shrink-0 rounded-lg px-1.5 py-1.5 text-[8px] font-extrabold tracking-wide" style={{ background: t.tone + "22", color: t.tone }}>
                {t.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="flex-1" />
        <div className="h-[80px] shrink-0" />
        <BottomNav active="academy" />
      </div>
    </Phone>
  );
}

/** «Живая» сфера коуча: в режиме анализа вращается быстрее и дышит */
function CoachOrb({ thinking }: { thinking: boolean }) {
  return (
    <div className="relative grid h-14 w-14 shrink-0 place-items-center">
      <motion.div className="absolute inset-0 rounded-full"
        style={{ background: "conic-gradient(from 0deg, #3ec9a7, #5b9cd6, #9d8cf5, #3ec9a7)" }}
        animate={{ rotate: 360 }} transition={{ duration: thinking ? 1.4 : 6, repeat: Infinity, ease: "linear" }} />
      <div className="absolute inset-[3px] rounded-full bg-[#101827]" />
      <motion.div className="relative grid h-9 w-9 place-items-center rounded-full bg-teal/20 text-teal"
        animate={{ scale: thinking ? [1, 1.15, 1] : 1 }} transition={{ duration: 0.9, repeat: thinking ? Infinity : 0 }}>
        <IcBolt size={18} />
      </motion.div>
      {thinking && <span className="absolute inset-0 rounded-full border-2 border-teal ring-out" />}
    </div>
  );
}

