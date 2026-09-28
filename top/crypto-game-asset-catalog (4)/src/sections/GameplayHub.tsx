import { useEffect, useRef, useState } from "react";
import { AssetCard, Btn, Burst, Confetti, Icon, Label, Phone, ProgressBar, Section, useBump, useCountUp, useInterval } from "../ui/kit";
import { Mascot } from "../ui/Mascot";
import { clamp, useDrag, useInView, useTilt } from "../ui/hooks";
import { ExHeader } from "../ui/exercise";
import { feel, sfx } from "../game/sfx";
import { SKILLS, skillOf, useGame, type SkillId } from "../game/ctx";
import { cn } from "../utils/cn";

const LINKS: Record<SkillId, string> = { candles: "#GPL-01", patterns: "#GPL-02", risk: "#GPL-10", psychology: "#GPL-09", defi: "#GPL-06" };

/* ═════════ HUB-01 · Skill Tree with crowns ═════════ */

function SkillTree() {
  const game = useGame();
  const [sel, setSel] = useState<SkillId>("candles");
  const prev = useRef<Record<string, number>>({});
  const [popK, setPopK] = useState<string | null>(null);
  useEffect(() => {
    SKILLS.forEach((s) => {
      const lv = Math.floor(game.skills[s.id] / 20);
      if (prev.current[s.id] !== undefined && lv > prev.current[s.id]) { setPopK(s.id); feel("unlock", [20, 40, 20]); }
      prev.current[s.id] = lv;
    });
  }, [game.skills]);
  const pos = (i: number) => ({ x: 30 + i * 60, y: 128 });
  const cur = skillOf(sel);
  const v = game.skills[sel], lv = Math.floor(v / 20), toNext = v % 20;
  const total = SKILLS.reduce((a, s) => a + Math.floor(game.skills[s.id] / 20), 0);
  return (
    <AssetCard id="HUB-01" title="Skill Tree · Crowns" desc="Дерево из 5 навыков. Кольцо — прогресс до следующей короны (5 уровней). Короны выскакивают при апгрейде, навык растёт от любого упражнения каталога." tags={["gameplay", "system", "skill-tree", "crowns", "progression"]}>
      <svg viewBox="0 0 300 175" className="w-full overflow-visible">
        <defs><linearGradient id="rootg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd76a" /><stop offset="1" stopColor="#cc8a00" /></linearGradient></defs>
        {SKILLS.map((s, i) => { const p = pos(i); const on = game.skills[s.id] > 0; return <path key={s.id} d={`M150 44 C150 90 ${p.x} 78 ${p.x} ${p.y - 28}`} fill="none" stroke={on ? s.c : "#22376f"} strokeWidth={on ? 2.5 : 1.5} strokeDasharray={on ? undefined : "4 4"} opacity={on ? 0.9 : 0.6} style={{ transition: "all .6s" }} />; })}
        <circle cx="150" cy="26" r="22" fill="url(#rootg)" stroke="#0a1330" strokeWidth="3" />
        <text x="150" y="31" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0a1330">{total}</text>
        <text x="150" y="-2" textAnchor="middle" fontSize="8" fontWeight="800" fill="#ffc53d">TRADER · {total}/25 ♛</text>
        {SKILLS.map((s, i) => {
          const p = pos(i), val = game.skills[s.id], level = Math.floor(val / 20), isSel = sel === s.id;
          const C = 2 * Math.PI * 27;
          return (
            <g key={s.id} onClick={() => { setSel(s.id); feel("tap"); }} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r="27" fill="none" stroke="#0a1330" strokeWidth="4" />
              <circle cx={p.x} cy={p.y} r="27" fill="none" stroke={s.c} strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - (val % 20) / 20)} transform={`rotate(-90 ${p.x} ${p.y})`} style={{ transition: "stroke-dashoffset .8s" }} />
              <circle cx={p.x} cy={p.y} r={isSel ? 22 : 19} fill={val > 0 ? s.c : "#16264f"} stroke={isSel ? "#fff" : "#0a1330"} strokeWidth="3" style={{ transition: "all .3s" }} />
              <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14" fontWeight="800" fill={val > 0 ? "#0a1330" : "#5a70ad"}>{level}</text>
              {Array.from({ length: 5 }).map((_, k) => <text key={k} x={p.x - 16 + k * 8} y={p.y - 36} fontSize="9" textAnchor="middle" fill={k < level ? "#ffc53d" : "#22376f"} style={popK === s.id && k === level - 1 ? { animation: "crownPop .6s ease both", transformOrigin: `${p.x - 16 + k * 8}px ${p.y - 36}px`, transformBox: "fill-box" } : undefined}>♛</text>)}
              <text x={p.x} y={p.y + 42} textAnchor="middle" fontSize="9" fontWeight="800" fill={isSel ? "#fff" : "#8fa0cf"}>{s.t}</text>
            </g>
          );
        })}
      </svg>
      <div key={sel} className="raised anim-fade-up mt-2 flex items-center gap-3 rounded-2xl p-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: `${cur.c}22` }}><Icon name={cur.i} size={24} variant="duo" style={{ color: cur.c }} /></span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-extrabold text-white">{cur.t} · crown {lv}/5</div>
          <ProgressBar value={(toNext / 20) * 100} color={cur.pb} h={8} className="mt-1" />
          <div className="text-[10px] text-ink-400">{lv >= 5 ? "Максимум — легенда!" : `${20 - toNext} XP до следующей короны`}</div>
        </div>
        <div className="flex flex-col gap-1.5">
          <a href={LINKS[sel]}><Btn v="sky" size="sm">Practice</Btn></a>
          <Btn v="ghost" size="sm" onClick={(e) => game.complete({ skill: sel, xp: 5, x: e.clientX, y: e.clientY })}>Drill</Btn>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ HUB-02 · Practice Hub screen ═════════ */
const REC = [
  { t: "Tap the Pattern", s: "patterns" as SkillId, h: "#GPL-02", i: "target" }, { t: "Bar Replay", s: "risk" as SkillId, h: "#GPP-01", i: "play" },
  { t: "Stop Hunt", s: "psychology" as SkillId, h: "#GPP-06", i: "shield" }, { t: "Memory: DeFi", s: "defi" as SkillId, h: "#GPL-06", i: "gem" }, { t: "Candle Builder", s: "candles" as SkillId, h: "#GPL-01", i: "candle" },
];
function PracticeHub() {
  const game = useGame();
  const startXp = useRef(game.xp);
  const [claimed, setClaimed] = useState<string[]>([]);
  const missions = [
    { id: "ex", t: "Заверши 5 упражнений", v: game.daily.done, max: game.daily.goal, r: 50, i: "target", c: "#2ee59d" },
    { id: "xp", t: "Заработай 100 XP", v: game.xp - startXp.current, max: 100, r: 80, i: "bolt", c: "#ffc53d" },
    { id: "touch", t: "Исследуй 15 ассетов", v: game.touched, max: 15, r: 40, i: "eye", c: "#3d8bff" },
  ];
  const weakest = SKILLS.reduce((a, s) => (game.skills[s.id] < game.skills[a.id] ? s : a), SKILLS[0]);
  const pct = clamp(game.daily.done / game.daily.goal, 0, 1);
  const R = 44, C = 2 * Math.PI * R;
  return (
    <AssetCard id="HUB-02" title="Practice Hub Screen" desc="Экран практики: дневная цель (живая, из движка), миссии с наградами, лента рекомендаций (snap-скролл) и подсказка по самому слабому навыку." tags={["gameplay", "system", "hub", "missions", "daily-goal"]} stageClass="p-2">
      <Phone h={540}>
        <div className="no-scrollbar absolute inset-0 overflow-y-auto px-4 pb-6 pt-10">
          <div className="text-xl font-extrabold text-white">Practice</div>
          <div className="raised mt-3 flex items-center gap-4 rounded-3xl p-4">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center">
              <svg width="96" height="96" className="absolute -rotate-90"><circle cx="48" cy="48" r={R} stroke="#081130" strokeWidth="8" fill="none" /><circle cx="48" cy="48" r={R} stroke="#2ee59d" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset .8s", filter: "drop-shadow(0 0 6px #2ee59d88)" }} /></svg>
              <div className="text-center"><div className="font-mono text-2xl font-extrabold text-white">{game.daily.done}</div><div className="text-[9px] font-extrabold uppercase text-ink-400">of {game.daily.goal}</div></div>
            </div>
            <div><div className="text-sm font-extrabold text-white">Daily goal</div><div className="text-xs text-ink-300">{pct >= 1 ? "Выполнено! Стрик защищён 🔥" : `Ещё ${game.daily.goal - game.daily.done} упражн. до защиты стрика`}</div></div>
          </div>
          <Label className="mt-4">Missions</Label>
          <div className="space-y-2">
            {missions.map((m) => {
              const done = m.v >= m.max, got = claimed.includes(m.id);
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-ink-800 p-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${m.c}22` }}><Icon name={m.i} size={20} variant="duo" style={{ color: m.c }} /></span>
                  <div className="min-w-0 flex-1"><div className="text-xs font-extrabold text-white">{m.t}</div><div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-950"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${clamp(m.v / m.max, 0, 1) * 100}%`, background: m.c }} /></div><div className="font-mono text-[10px] text-ink-400">{Math.min(m.v, m.max)}/{m.max}</div></div>
                  <button disabled={!done || got} onClick={(e) => { setClaimed([...claimed, m.id]); game.reward({ gems: m.r, x: e.clientX, y: e.clientY }); feel("coin"); }} className={cn("rounded-lg px-2 py-1.5 font-mono text-[10px] font-extrabold", got ? "bg-bull/20 text-bull" : done ? "bg-violet text-white shadow-[0_3px_0_#4a24a8] anim-heartbeat" : "bg-ink-900 text-ink-500")}>{got ? "✓" : `+${m.r}💎`}</button>
                </div>
              );
            })}
          </div>
          <Label className="mt-4">Recommended</Label>
          <div className="no-scrollbar snap-x-strict -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {REC.map((r) => { const s = skillOf(r.s); return <a key={r.t} href={r.h} className="flex h-28 w-32 shrink-0 snap-start flex-col justify-between rounded-2xl p-3 transition-transform active:scale-95" style={{ background: `linear-gradient(160deg, ${s.c}, ${s.c}66)`, boxShadow: `0 4px 0 rgba(0,0,0,.35)` }}><Icon name={r.i} size={26} variant="duo" className="text-white" /><div><div className="text-xs font-extrabold text-white text-3d">{r.t}</div><div className="text-[9px] font-bold text-white/70">{s.t} · {game.skills[r.s]}%</div></div></a>; })}
          </div>
          <a href={LINKS[weakest.id]} className="mt-4 flex items-center gap-3 rounded-2xl p-3" style={{ background: `${weakest.c}18`, boxShadow: `inset 0 0 0 1.5px ${weakest.c}66` }}>
            <Mascot mood="think" size={44} /><div className="flex-1"><div className="text-xs font-extrabold text-white">Слабое место: {weakest.t}</div><div className="text-[10px] text-ink-300">Потренируй — это даёт 2× XP к навыку</div></div><Icon name="chevR" size={16} className="text-ink-400" />
          </a>
        </div>
      </Phone>
    </AssetCard>
  );
}

/* ═════════ HUB-03 · Mistakes Review ═════════ */
const MIST = [
  { q: "Doji = сильный тренд?", a: "Нет — доджи означает нерешительность, часто перед разворотом.", s: "candles" as SkillId, h: "#GPL-02" },
  { q: "Стоп выше свинг-лоу", a: "Стоп под структурой рынка, иначе его снимет обычный «хвост».", s: "risk" as SkillId, h: "#GPP-02" },
  { q: "Купил на новости об ETF", a: "Новость — момент фиксации для тех, кто купил слух.", s: "psychology" as SkillId, h: "#GPP-09" },
  { q: "IL — это комиссия?", a: "Impermanent loss — потеря от расхождения цен в пуле ликвидности.", s: "defi" as SkillId, h: "#GPL-06" },
  { q: "Пробой без объёма", a: "Пробой без объёма чаще ложный. Жди подтверждения.", s: "patterns" as SkillId, h: "#GPL-07" },
];
function MistakeRow({ m, onDone }: { m: (typeof MIST)[number]; onDone: () => void }) {
  const [x, setX] = useState(0);
  const [open, setOpen] = useState(false);
  const [gone, setGone] = useState(false);
  const moved = useRef(false);
  const s = skillOf(m.s);
  const onDown = useDrag({
    onStart: () => { moved.current = false; },
    onMove: (d) => { if (Math.abs(d.dx) > 6) moved.current = true; setX(Math.max(0, d.dx)); },
    onEnd: (d) => { if (d.dx > 110 || d.vx > 18) { setGone(true); setX(400); feel("success", 12); window.setTimeout(onDone, 260); } else { setX(0); if (!moved.current) { setOpen(!open); sfx.play("tap"); } } },
  });
  return (
    <div className="grid transition-all duration-300" style={{ gridTemplateRows: gone ? "0fr" : "1fr", opacity: gone ? 0 : 1 }}>
      <div className="overflow-hidden">
        <div className="relative mb-2 overflow-hidden rounded-2xl">
          <div className="absolute inset-y-0 left-0 flex w-full items-center bg-bull pl-4 text-xs font-extrabold text-ink-900" style={{ opacity: clamp(x / 80, 0, 1) }}><Icon name="check" size={18} stroke={3.4} className="mr-1" />Reviewed</div>
          <div onPointerDown={onDown} className="relative cursor-grab touch-pan-y select-none bg-ink-700 p-3" style={{ transform: `translateX(${x}px)`, transition: x === 0 || gone ? "transform .3s" : "none" }}>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${s.c}22` }}><Icon name={s.i} size={18} variant="duo" style={{ color: s.c }} /></span>
              <div className="flex-1"><div className="text-sm font-extrabold text-white">{m.q}</div><div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.c }}>{s.t}</div></div>
              <Icon name="chevD" size={16} className={cn("text-ink-400 transition-transform", open && "rotate-180")} />
            </div>
            <div className="grid transition-[grid-template-rows] duration-300" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}><div className="overflow-hidden"><div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-ink-900/60 p-2.5 text-xs text-ink-200"><span>{m.a}</span><a href={m.h} onPointerDown={(e) => e.stopPropagation()}><Btn v="sky" size="sm" className="h-8! px-3! text-[10px]!">Drill</Btn></a></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
function Mistakes() {
  const [list, setList] = useState(MIST);
  return (
    <AssetCard id="HUB-03" title="Mistakes Review" desc="Разбор ошибок: тап раскрывает объяснение и ссылку на тренажёр, свайп вправо помечает «разобрано» и убирает карточку из очереди." tags={["gameplay", "system", "mistakes", "review", "swipe"]}>
      <div className="mb-3 flex items-center justify-between"><span className="text-sm font-extrabold text-white">Ошибки к повторению</span><span className="rounded-full bg-bear/15 px-2 py-0.5 font-mono text-xs font-extrabold text-bear">{list.length}</span></div>
      {list.map((m) => <MistakeRow key={m.q} m={m} onDone={() => setList((l) => l.filter((q) => q.q !== m.q))} />)}
      {list.length === 0 && <div className="anim-pop flex flex-col items-center py-6 text-center"><Mascot mood="happy" size={70} /><div className="mt-2 text-base font-extrabold text-bull">Все ошибки разобраны!</div><Btn v="ghost" size="sm" className="mt-2" onClick={() => setList(MIST)}>Reset</Btn></div>}
    </AssetCard>
  );
}

/* ═════════ HUB-04 · Lesson Intro ═════════ */
function LessonIntro() {
  const t = useTilt();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [loading, setLoading] = useState(false);
  const bullets = ["Что такое ликвидация и как её избежать", "Формула размера позиции", "Правило 1% на практике"];
  return (
    <AssetCard id="HUB-04" title="Lesson Intro Screen" desc="Обложка урока со слоями параллакса (мышь / гироскоп), каскадное появление тезисов при скролле, метки навыков и сложности, CTA с загрузкой." tags={["gameplay", "system", "intro", "parallax", "gyro"]} stageClass="p-0 overflow-hidden">
      <div ref={ref}>
        <div className="relative h-44 overflow-hidden bg-gradient-to-br from-gold-edge to-[#7a4a00]">
          <div className="absolute -right-6 -top-8 h-40 w-40 rounded-full bg-white/10" style={{ transform: `translate(${t.x * -14}px, ${t.y * -10}px)` }} />
          <div className="absolute left-6 top-6" style={{ transform: `translate(${t.x * 10}px, ${t.y * 8}px)` }}><span className="rounded-lg bg-ink-900/30 px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">Unit 3 · Lesson 2</span></div>
          <div className="absolute bottom-4 left-6" style={{ transform: `translate(${t.x * 6}px, ${t.y * 4}px)` }}><div className="text-2xl font-extrabold text-white text-3d">Position Sizing</div><div className="text-xs font-bold text-white/80">≈ 6 мин · 5 упражнений · +25 XP</div></div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ transform: `translate(${t.x * -24}px, ${t.y * -18 - 50}%) rotate(${t.x * 8}deg)` }}><Icon name="shield" size={90} variant="duo" className="text-white/90 drop-shadow-[0_8px_0_rgba(0,0,0,.25)]" /></div>
        </div>
        <div className="p-4">
          <Label>What you'll learn</Label>
          <ul className="space-y-2">
            {bullets.map((b, i) => <li key={b} className={cn("flex items-start gap-2 text-sm font-bold text-ink-100 transition-all duration-500", inView ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0")} style={{ transitionDelay: `${i * 150}ms` }}><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/20 text-gold"><Icon name="check" size={12} stroke={3.4} /></span>{b}</li>)}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">{(["risk", "psychology"] as SkillId[]).map((s) => { const k = skillOf(s); return <span key={s} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: `${k.c}22`, color: k.c }}><Icon name={k.i} size={11} />{k.t}</span>; })}</div>
            <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-ink-400">Difficulty {[1, 2, 3].map((d) => <span key={d} className={cn("h-2 w-2 rounded-full", d <= 2 ? "bg-gold" : "bg-ink-600")} />)}</div>
          </div>
          <Btn v="gold" size="lg" block className="mt-4" onClick={() => { setLoading(true); feel("whoosh"); window.setTimeout(() => { setLoading(false); window.location.hash = "#play"; }, 1200); }}>
            {loading ? <><span className="h-4 w-4 rounded-full border-[3px] border-ink-900/30 border-t-ink-900 anim-spin" />Loading lesson…</> : <><Icon name="play" size={18} variant="solid" />Start lesson</>}
          </Btn>
        </div>
      </div>
    </AssetCard>
  );
}

/* ═════════ HUB-05 · Legendary Challenge ═════════ */
const LEG = [
  { q: "Позиция $5,000 с плечом 10×. Какая маржа?", o: ["$500", "$50,000", "$5,000"], a: 0 },
  { q: "Риск 1%, стоп 4% от входа. Размер позиции от депозита?", o: ["25%", "4%", "1%"], a: 0 },
  { q: "Бычье поглощение на сопротивлении — это…", o: ["Сигнал шорта", "Слабый лонг, нужен пробой", "Гарантированный лонг"], a: 1 },
  { q: "Funding −0.05% каждые 8ч. Кто платит?", o: ["Шорты лонгам", "Лонги шортам", "Биржа всем"], a: 0 },
  { q: "Impermanent loss максимален, когда…", o: ["Цены активов расходятся", "Цены стоят на месте", "Пул большой"], a: 0 },
];
function Legendary() {
  const game = useGame();
  const [state, setState] = useState<"ready" | "run" | "win" | "lose">("ready");
  const [i, setI] = useState(0);
  const [left, setLeft] = useState(60);
  const [pick, setPick] = useState<number | null>(null);
  const [conf, setConf] = useState(0);
  useInterval(() => { if (left <= 1) { setState("lose"); feel("error", [40, 40, 60]); setLeft(0); } else { setLeft(left - 1); if (left <= 11) sfx.play("tick"); } }, state === "run" ? 1000 : null);
  const start = () => { setState("run"); setI(0); setLeft(60); setPick(null); feel("whoosh"); };
  const answer = (k: number, x: number, y: number) => {
    if (pick !== null) return;
    setPick(k);
    const ok = k === LEG[i].a;
    if (!ok) { window.setTimeout(() => setState("lose"), 600); feel("error", [40, 40, 60]); game.complete({ skill: "risk", ok: false }); return; }
    feel("success", 10);
    window.setTimeout(() => { if (i === LEG.length - 1) { setState("win"); setConf((c) => c + 1); game.complete({ skill: "risk", xp: 40, gems: 50, x, y }); sfx.play("levelup"); } else { setI(i + 1); setPick(null); } }, 600);
  };
  const R = 26, C = 2 * Math.PI * R;
  return (
    <AssetCard id="HUB-05" title="Legendary Challenge" desc="Золотой режим: 5 сложных вопросов за 60 секунд, без права на ошибку и без жизней. Победа — легендарный трофей с лучами и бонус гемов." tags={["gameplay", "system", "legendary", "timed", "challenge"]} stageClass="overflow-hidden">
      <Confetti trigger={conf} count={50} />
      <div className="absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_50%_0%,#ffc53d22,transparent_60%)]" />
      {state === "ready" && (
        <div className="relative flex flex-col items-center py-4 text-center">
          <div className="relative"><div className="absolute inset-[-20px] rounded-full opacity-60" style={{ background: "repeating-conic-gradient(#ffc53d33 0 10deg, transparent 10deg 30deg)", animation: "rays 10s linear infinite", maskImage: "radial-gradient(circle, #000 30%, transparent 70%)" }} /><div className="relative grid h-24 w-24 place-items-center rounded-[30px] bg-gradient-to-b from-gold to-gold-edge shadow-[0_6px_0_#8a5c00,0_0_40px_#ffc53d66]"><Icon name="trophy" size={48} variant="solid" className="text-ink-900" /></div></div>
          <div className="mt-4 text-xl font-extrabold text-gold text-glow-gold">Legendary · Unit 3</div>
          <div className="mb-4 text-xs text-ink-300">5 вопросов · 60 секунд · 0 ошибок · +40 XP +50 💎</div>
          <Btn v="gold" size="lg" onClick={start}><Icon name="bolt" size={18} variant="solid" />Start challenge</Btn>
        </div>
      )}
      {state === "run" && (
        <div className="relative">
          <div className="mb-3 flex items-center gap-3">
            <ExHeader step={i} total={LEG.length} />
            <div className="relative -mt-3 grid h-14 w-14 shrink-0 place-items-center"><svg width="56" height="56" className="absolute -rotate-90"><circle cx="28" cy="28" r={R} stroke="#081130" strokeWidth="5" fill="none" /><circle cx="28" cy="28" r={R} stroke={left > 15 ? "#ffc53d" : "#ff4d6a"} strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / 60)} style={{ transition: "stroke-dashoffset 1s linear" }} /></svg><span className={cn("font-mono text-base font-extrabold", left > 15 ? "text-gold" : "anim-heartbeat text-bear")}>{left}</span></div>
          </div>
          <div key={i} className="raised mb-3 rounded-2xl p-3 text-sm font-extrabold text-white" style={{ animation: "screenIn .3s ease both" }}>{LEG[i].q}</div>
          <div className="space-y-2">{LEG[i].o.map((o, k) => <button key={o} onClick={(e) => answer(k, e.clientX, e.clientY)} className={cn("w-full rounded-xl border-2 px-3 py-2.5 text-left text-xs font-extrabold transition-all active:translate-y-0.5", pick === k ? (k === LEG[i].a ? "border-bull bg-bull/15 text-bull" : "border-bear bg-bear/15 text-bear anim-shake") : "border-gold/30 bg-ink-800 text-ink-100 hover:border-gold")}>{o}</button>)}</div>
        </div>
      )}
      {state === "win" && (
        <div className="relative flex flex-col items-center py-4 text-center anim-pop">
          <div className="relative"><div className="absolute inset-[-30px] rounded-full" style={{ background: "repeating-conic-gradient(#ffc53d55 0 8deg, transparent 8deg 24deg)", animation: "rays 6s linear infinite", maskImage: "radial-gradient(circle, #000 25%, transparent 70%)" }} /><Icon name="trophy" size={90} variant="solid" className="relative text-gold drop-shadow-[0_0_30px_#ffc53d]" /></div>
          <div className="mt-3 text-2xl font-extrabold text-gold text-glow-gold">LEGENDARY!</div>
          <div className="text-xs text-ink-300">{60 - left}s · безупречно · +40 XP +50 💎</div>
          <Btn v="ghost" size="sm" className="mt-4" onClick={() => setState("ready")}>Back</Btn>
        </div>
      )}
      {state === "lose" && (
        <div className="relative flex flex-col items-center py-4 text-center anim-pop">
          <Mascot mood="sad" size={80} />
          <div className="mt-2 text-xl font-extrabold text-bear">{left === 0 ? "Время вышло" : "Одна ошибка — и всё"}</div>
          <div className="mb-3 text-xs text-ink-300">Легенда требует совершенства. Дошёл до вопроса {i + 1}/5.</div>
          <Btn v="gold" size="sm" onClick={start}><Icon name="refresh" size={14} />Retry</Btn>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ HUB-06 · Placement Test (adaptive) ═════════ */
const POOL = [
  { d: 1, q: "Что такое биткоин?", o: ["Криптовалюта", "Банк", "Акция"], a: 0 }, { d: 1, q: "Зелёная свеча означает…", o: ["Рост за период", "Падение", "Нет торгов"], a: 0 },
  { d: 2, q: "Стоп-лосс нужен, чтобы…", o: ["Ограничить убыток", "Увеличить прибыль", "Меньше комиссий"], a: 0 }, { d: 2, q: "RSI 80 — это…", o: ["Перекупленность", "Перепроданность", "Нейтрально"], a: 0 },
  { d: 3, q: "R:R 1:3 означает…", o: ["Риск 1, цель 3", "Риск 3, цель 1", "3 сделки на 1 стоп"], a: 0 }, { d: 3, q: "Пробой без объёма чаще…", o: ["Ложный", "Истинный", "Не важно"], a: 0 },
  { d: 4, q: "Ликвидация при 25× наступает при движении ≈", o: ["4%", "25%", "0.4%"], a: 0 }, { d: 4, q: "Отрицательный funding означает…", o: ["Шорты платят лонгам", "Лонги платят шортам", "Нет плеча"], a: 0 },
  { d: 5, q: "Impermanent loss возникает из-за…", o: ["Расхождения цен в пуле", "Комиссий сети", "Инфляции токена"], a: 0 }, { d: 5, q: "Дельта-нейтральная стратегия — это…", o: ["Хедж направления", "Только лонг", "Только шорт"], a: 0 },
];
function Placement() {
  const game = useGame();
  const [diff, setDiff] = useState(2);
  const [used, setUsed] = useState<number[]>([]);
  const [qi, setQi] = useState<number>(() => POOL.findIndex((p) => p.d === 2));
  const [n, setN] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [hist, setHist] = useState<number[]>([2]);
  const [done, setDone] = useState(false);
  const TOTAL = 6;
  const q = POOL[qi];
  const rot = n % 3;
  const opts = q.o.map((_, k) => (k + rot) % 3);
  const pickNext = (d: number, u: number[]) => { const c = POOL.map((p, i) => ({ p, i })).filter((x) => !u.includes(x.i)); c.sort((a, b) => Math.abs(a.p.d - d) - Math.abs(b.p.d - d)); return c[0].i; };
  const answer = (k: number, x: number, y: number) => {
    if (pick !== null) return;
    setPick(k);
    const ok = k === q.a;
    const nd = clamp(diff + (ok ? 1 : -1), 1, 5);
    if (ok) { feel("success", 8); game.complete({ skill: "patterns", xp: 3 + q.d * 2, x, y }); } else { feel("error", 15); game.complete({ skill: "patterns", ok: false }); }
    window.setTimeout(() => {
      const nu = [...used, qi];
      setUsed(nu); setDiff(nd); setHist((h) => [...h, nd]);
      if (n + 1 >= TOTAL) { setDone(true); return; }
      setQi(pickNext(nd, nu)); setN(n + 1); setPick(null);
    }, 700);
  };
  const restart = () => { setDiff(2); setUsed([]); setQi(POOL.findIndex((p) => p.d === 2)); setN(0); setPick(null); setHist([2]); setDone(false); };
  const unit = clamp(Math.round(hist[hist.length - 1]), 1, 5);
  return (
    <AssetCard id="HUB-06" title="Adaptive Placement Test" desc="Вступительный тест подстраивает сложность: верно — сложнее, ошибка — проще. График сложности рисуется по ходу; в конце рекомендация с какого юнита начать." tags={["gameplay", "system", "placement", "adaptive"]}>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1"><Label>Difficulty path</Label><svg viewBox="0 0 200 40" className="h-10 w-full"><polyline points={hist.map((h, i) => `${(i / TOTAL) * 200},${40 - (h / 5) * 34}`).join(" ")} fill="none" stroke="#5ce1ff" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px #5ce1ff)" }} />{hist.map((h, i) => <circle key={i} cx={(i / TOTAL) * 200} cy={40 - (h / 5) * 34} r="3.5" fill="#fff" />)}</svg></div>
        <div className="text-center"><div className="text-[9px] font-extrabold uppercase text-ink-400">Level</div><div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((d) => <span key={d} className={cn("h-6 w-2 rounded-sm transition-all", d <= diff ? "bg-sky" : "bg-ink-700")} style={{ height: 8 + d * 4 }} />)}</div></div>
      </div>
      {done ? (
        <div className="anim-pop flex flex-col items-center py-3 text-center"><Mascot mood="cool" size={70} /><div className="mt-2 text-lg font-extrabold text-white">Рекомендуем начать с <span className="text-sky">Unit {unit}</span></div><div className="mb-3 text-xs text-ink-400">{["", "Основы крипты", "Свечной анализ", "Риск-менеджмент", "Деривативы", "DeFi & On-chain"][unit]}</div><div className="flex gap-2"><Btn v="sky" size="sm">Start Unit {unit}</Btn><Btn v="ghost" size="sm" onClick={restart}>Retake</Btn></div></div>
      ) : (
        <div key={qi}>
          <ExHeader step={n} total={TOTAL} label={`Difficulty ${q.d}/5`} />
          <div className="raised mb-3 rounded-2xl p-3 text-sm font-extrabold text-white" style={{ animation: "screenIn .3s ease both" }}>{q.q}</div>
          <div className="space-y-2">{opts.map((k) => <button key={k} onClick={(e) => answer(k, e.clientX, e.clientY)} className={cn("w-full rounded-xl border-2 px-3 py-2.5 text-left text-xs font-extrabold transition-all active:translate-y-0.5", pick === null ? "border-ink-600 bg-ink-800 text-ink-100" : k === q.a ? "border-bull bg-bull/15 text-bull" : pick === k ? "border-bear bg-bear/15 text-bear" : "border-ink-700 bg-ink-800 text-ink-500")}>{q.o[k]}</button>)}</div>
        </div>
      )}
    </AssetCard>
  );
}

/* ═════════ HUB-07 · Unit Checkpoint (test out) ═════════ */
const CK = [{ q: "Хаммер после падения — сигнал…", o: ["Разворота вверх", "Продолжения падения"], a: 0 }, { q: "Риск 1% при депозите $10k — это…", o: ["$100", "$1,000"], a: 0 }, { q: "Объём растёт на пробое — пробой…", o: ["Подтверждён", "Ложный"], a: 0 }];
function Checkpoint() {
  const game = useGame();
  const [state, setState] = useState<"locked" | "test" | "open" | "fail">("locked");
  const [i, setI] = useState(0);
  const [b, bump] = useBump();
  const [shk, shake] = useBump();
  const answer = (k: number, x: number, y: number) => {
    if (k !== CK[i].a) { setState("fail"); shake(); feel("error", [40, 40, 60]); game.complete({ skill: "candles", ok: false }); return; }
    feel("success", 8);
    if (i === CK.length - 1) { setState("open"); bump(); feel("unlock", [20, 40, 80]); game.complete({ skill: "candles", xp: 30, gems: 40, x, y }); } else setI(i + 1);
  };
  return (
    <AssetCard id="HUB-07" title="Unit Checkpoint · Test Out" desc="Ворота между юнитами: пройди 3 вопроса без ошибок — ворота разъезжаются и юнит открывается. Ошибка запирает замок с тряской." tags={["gameplay", "system", "checkpoint", "gate", "unlock"]} stageClass="p-0 overflow-hidden">
      <div className="relative h-[300px]">
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,#2ee59d33,transparent_60%)]">
          <div className="text-center"><Icon name="rocket" size={56} variant="duo" className="mx-auto text-bull" /><div className="mt-2 text-xl font-extrabold text-white">Unit 4 · Derivatives</div><div className="text-xs text-ink-300">16 уроков открыто</div><div className="mt-3"><Btn v="bull" size="sm" onClick={() => { setState("locked"); setI(0); }}>Reset demo</Btn></div></div>
        </div>
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink-700 to-ink-600 shadow-[inset_-4px_0_0_#0b1638]" style={{ animation: state === "open" ? "gateL .9s cubic-bezier(.7,0,.3,1) forwards" : undefined }}>{Array.from({ length: 5 }).map((_, k) => <span key={k} className="absolute left-4 right-4 h-px bg-white/5" style={{ top: `${(k + 1) * 16}%` }} />)}</div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-ink-700 to-ink-600 shadow-[inset_4px_0_0_#0b1638]" style={{ animation: state === "open" ? "gateR .9s cubic-bezier(.7,0,.3,1) forwards" : undefined }}>{Array.from({ length: 5 }).map((_, k) => <span key={k} className="absolute left-4 right-4 h-px bg-white/5" style={{ top: `${(k + 1) * 16}%` }} />)}</div>
        {state !== "open" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {state === "locked" && <><div key={shk} className={cn("grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-ink-500 to-ink-800 shadow-[0_6px_0_#050b1f]", shk && "anim-shake")}><Icon name="lock" size={36} className="text-ink-200" /></div><div className="mt-3 text-base font-extrabold text-white">Unit 4 locked</div><div className="mb-3 text-xs text-ink-400">Пройди чекпоинт, чтобы перепрыгнуть Unit 3</div><Btn v="gold" size="sm" onClick={() => { setState("test"); setI(0); feel("whoosh"); }}><Icon name="bolt" size={14} variant="solid" />Test out</Btn></>}
            {state === "test" && <div className="w-full" key={i}><ExHeader step={i} total={CK.length} label="Checkpoint" /><div className="raised mb-3 rounded-2xl p-3 text-sm font-extrabold text-white" style={{ animation: "screenIn .3s ease both" }}>{CK[i].q}</div><div className="grid grid-cols-2 gap-2">{CK[i].o.map((o, k) => <Btn key={o} v={k ? "violet" : "sky"} size="sm" onClick={(e) => answer(k, e.clientX, e.clientY)} className="h-auto! min-h-11 py-2 normal-case! tracking-normal!">{o}</Btn>)}</div></div>}
            {state === "fail" && <><div className="anim-shake grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-bear to-bear-edge shadow-[0_6px_0_#8c1530]"><Icon name="lock" size={36} className="text-white" /></div><div className="mt-3 text-base font-extrabold text-bear">Ворота заперты</div><div className="mb-3 text-xs text-ink-400">Тест-аут требует безошибочного прохода</div><Btn v="bear" size="sm" onClick={() => { setState("test"); setI(0); }}>Retry</Btn></>}
          </div>
        )}
        <Burst trigger={b} count={20} spread={140} colors={["#2ee59d", "#ffc53d", "#fff"]} />
      </div>
    </AssetCard>
  );
}

/* ═════════ HUB-08 · Learning Stats ═════════ */
const WEEK = [40, 85, 120, 60, 150, 95, 30];
const HEAT = Array.from({ length: 12 * 7 }, (_, i) => ((i * 7919) % 17) / 16);
function LearningStats() {
  const game = useGame();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const [hover, setHover] = useState<number | null>(null);
  const total = useCountUp(inView ? WEEK.reduce((a, b) => a + b, 0) + game.xp : 0, 1400);
  const best = useCountUp(inView ? 41 : 0, 1400);
  const mx = Math.max(...WEEK);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <AssetCard id="HUB-08" title="Learning Stats" desc="Статистика обучения: недельные бары растут при появлении, тепловая карта активности с тултипами, счётчики с count-up. Живой XP из движка." tags={["gameplay", "system", "stats", "heatmap", "chart"]}>
      <div ref={ref} className="grid grid-cols-2 gap-2">
        <div className="raised rounded-xl p-3"><div className="text-[9px] font-extrabold uppercase text-ink-400">Total XP</div><div className="font-mono text-xl font-extrabold text-gold">{Math.round(total).toLocaleString()}</div></div>
        <div className="raised rounded-xl p-3"><div className="text-[9px] font-extrabold uppercase text-ink-400">Best streak</div><div className="font-mono text-xl font-extrabold text-flame">{Math.round(best)} days</div></div>
      </div>
      <Label className="mt-4">This week</Label>
      <div className="flex h-24 items-end gap-2">
        {WEEK.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="relative w-full flex-1"><div className="absolute bottom-0 w-full origin-bottom rounded-t-lg bg-gradient-to-t from-sky-edge to-sky" style={{ height: `${(v / mx) * 100}%`, animation: inView ? `barGrow .7s cubic-bezier(.3,1.4,.5,1) ${i * 0.08}s both` : "none", transform: inView ? undefined : "scaleY(0)", boxShadow: i === 4 ? "0 0 14px #3d8bff" : undefined }} /></div>
            <span className={cn("text-[10px] font-extrabold", i === 4 ? "text-sky" : "text-ink-400")}>{days[i]}</span>
          </div>
        ))}
      </div>
      <Label className="mt-4">Activity · 12 weeks</Label>
      <div className="relative">
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {HEAT.map((h, i) => <button key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className="h-3 w-full rounded-[3px] transition-transform hover:scale-125" style={{ background: h < 0.15 ? "#16264f" : `rgba(46,229,157,${0.25 + h * 0.75})`, animation: inView ? `fadeIn .4s ease ${i * 6}ms both` : "none" }} />)}
        </div>
        {hover !== null && <div className="pointer-events-none absolute -top-8 rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-extrabold text-ink-900" style={{ left: `${(Math.floor(hover / 7) / 12) * 100}%` }}>{Math.round(HEAT[hover] * 120)} XP · {Math.round(HEAT[hover] * 6)} lessons</div>}
      </div>
    </AssetCard>
  );
}

export default function GameplayHub() {
  return (
    <Section id="hub" num="G3" title="Gameplay · Systems" subtitle="Мета-слой обучения: дерево навыков с коронами, хаб практики с миссиями, разбор ошибок, интро урока, легендарный челлендж, адаптивный тест, чекпоинт, статистика">
      <SkillTree />
      <PracticeHub />
      <Mistakes />
      <LessonIntro />
      <Legendary />
      <Placement />
      <Checkpoint />
      <LearningStats />
    </Section>
  );
}


