import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Crown, Heart as HeartL, Lock, MousePointerClick, Sparkles, Star as StarL, TrendingUp, Zap } from "lucide-react";
import { Bar, Bolt, Btn, Coin, Gem, Heart, Pill, ShieldIco, Slider, Stars, Sword, Toggle } from "../lib/ui";
import { CountUp, Magnet, Segmented, Stepper, Tilt } from "../lib/ui2";
import { Burst } from "../lib/fx";
import PatternIcon from "../game/PatternIcon";
import { PALETTE, PATTERNS, PRINCIPLES, RARITY } from "../data/kit";

export function Section({ id, n, title, sub, children }: { id: string; n: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section id={id} className="relative mx-auto w-full max-w-[1280px] px-5 py-14 md:py-20">
      <div className="mb-8 flex items-end gap-4">
        <span className="hd grad-teal shrink-0 text-[42px] leading-none opacity-70 md:text-[56px]" style={{ WebkitTextStrokeColor: "#06364a" }}>{n}</span>
        <div className="min-w-0">
          <h2 className="hd text-[26px] uppercase leading-none md:text-[34px]">{title}</h2>
          {sub && <p className="mt-1.5 max-w-xl font-body text-[13px] font-bold leading-snug text-sky/55 md:text-[14px]">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ───────── palette ───────── */
export function PaletteGrid() {
  const [copied, setCopied] = useState("");
  const copy = (h: string) => { navigator.clipboard?.writeText(h); setCopied(h); setTimeout(() => setCopied(""), 1200); };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {PALETTE.map((g) => (
        <div key={g.group} className="pnl noise p-4">
          <div className="mb-3 font-display text-[11px] font-black uppercase italic tracking-[.16em] text-teal">{g.group}</div>
          <div className="space-y-2.5">
            {g.items.map((c) => (
              <button key={c.hex} onClick={() => copy(c.hex)} className="group flex w-full items-center gap-3 text-left">
                <span className="relative h-11 w-11 shrink-0 rounded-[13px] transition-transform group-hover:scale-105"
                  style={{ background: c.hex, boxShadow: `inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(0,0,0,.25), 0 6px 14px -4px ${c.hex}99` }}>
                  {copied === c.hex && <Check size={18} className="absolute inset-0 m-auto text-[#04081a]" strokeWidth={4} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[13px] font-extrabold text-white/95">{c.name}</span>
                  <span className="block font-body text-[11px] font-bold text-sky/50">{c.use}</span>
                </span>
                <span className="flex items-center gap-1 font-num text-[11px] font-semibold text-sky/70 opacity-60 group-hover:opacity-100">
                  {c.hex}<Copy size={11} />
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────── typography ───────── */
export function Typography() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="pnl noise p-5">
        <Tag>Rubik · 900 Italic</Tag>
        <div className="hd mt-3 text-[38px] leading-none">ПОБЕДА!</div>
        <div className="hd hd-gold mt-2 text-[26px] leading-none">Уровень 12</div>
        <p className="mt-3 font-body text-[12px] font-bold text-sky/55">Заголовки и кнопки. Всегда с тёмной обводкой 0.13em — читается поверх любой иллюстрации.</p>
      </div>
      <div className="pnl noise p-5">
        <Tag>Nunito · 700–900</Tag>
        <div className="mt-3 font-body text-[17px] font-black text-white">Фитиль-Мимик рисует идеальный сетап…</div>
        <p className="mt-2 font-body text-[13px] font-bold leading-relaxed text-sky/70">Текст интерфейса: подсказки, лор, разборы паттернов. Скруглённые формы букв поддерживают casual-настроение.</p>
      </div>
      <div className="pnl noise p-5">
        <Tag>Oswald · 600</Tag>
        <div className="mt-3 flex flex-wrap items-baseline gap-3">
          <span className="font-num text-[34px] font-bold tabular-nums text-gold"><CountUp value={12480} duration={1.4} /></span>
          <span className="font-num text-[20px] font-semibold text-teal">+4.2%</span>
          <span className="font-num text-[20px] font-semibold text-coral">−18 HP</span>
        </div>
        <p className="mt-3 font-body text-[12px] font-bold text-sky/55">Все числа: валюта, урон, таймеры. Попробуйте — счёт «дотикает» до цели плавно.</p>
      </div>
    </div>
  );
}
const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-block rounded-full bg-teal/12 px-2.5 py-1 font-num text-[10px] font-semibold uppercase tracking-[.18em] text-teal"
    style={{ boxShadow: "inset 0 0 0 1px rgba(31,240,200,.3)" }}>{children}</span>
);

/* ───────── interactions playground ───────── */
export function Playground() {
  const [t1, setT1] = useState(true);
  const [t2, setT2] = useState(false);
  const [sl, setSl] = useState(65);
  const [step, setStep] = useState(3);
  const [seg, setSeg] = useState<"d1" | "d2" | "d3">("d1");
  const [bangs, setBangs] = useState<{ id: number; x: number; y: number; c: string }[]>([]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* 3d tilt */}
      <Card title="3D-наклон карт">
        <div className="grid grid-cols-2 gap-3">
          {["hammer", "soldiers"].map((id, i) => {
            const p = PATTERNS.find((x) => x.id === id)!;
            return (
              <Tilt key={id} max={14} className="h-[104px]">
                <div className="relative flex h-full flex-col items-center justify-center rounded-[18px]"
                  style={{
                    background: i === 0 ? "linear-gradient(170deg,#1e3d75,#11234a)" : "linear-gradient(170deg,#22154e,#120a3f)",
                    boxShadow: "inset 0 1.5px 0 rgba(150,195,255,.35), inset 0 0 0 2px rgba(31,240,200,.55), 0 12px 26px -10px rgba(31,240,200,.4)",
                  }}>
                  <span style={{ transform: "translateZ(30px)" }}><PatternIcon id={id} s={42} /></span>
                  <span className="mt-1 font-display text-[10px] font-black italic text-white" style={{ transform: "translateZ(24px)" }}>{p.name}</span>
                </div>
              </Tilt>
            );
          })}
        </div>
        <Note>Ведите курсором — карты наклоняются в пространстве по пружинной физике. Используется в бестиарии и академии.</Note>
      </Card>

      {/* magnet + burst */}
      <Card title="Магнит и частицы">
        <div className="relative flex h-[130px] items-center justify-center gap-3 overflow-hidden rounded-[18px]"
          style={{ background: "linear-gradient(180deg,#0e2049,#0a1838)", boxShadow: "inset 0 0 0 1.5px rgba(60,104,185,.4)" }}
          onPointerDown={(e) => {
            const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const id = Math.random();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const cols = ["#1ff0c8", "#ffd14a", "#ff4d8d", "#9a6bff"];
            const c = cols[Math.floor(Math.random() * cols.length)];
            setBangs((b) => [...b, { id, x, y, c }]);
            setTimeout(() => setBangs((b) => b.filter((q) => q.id !== id)), 850);
          }}>
          {bangs.map((b) => <Burst key={b.id} x={b.x} y={b.y} c={b.c} />)}
          <Magnet strength={0.3}>
            <Btn color="gold" size="md"><Sparkles size={15} /> Притяни меня</Btn>
          </Magnet>
        </div>
        <Note>Кнопка тянется за курсором и отпрыгивает обратно. Тап по коробке — радиальный взрыв частиц, как в бою.</Note>
      </Card>

      {/* controls */}
      <Card title="Геймплейные контролы">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[11px] font-bold uppercase text-sky/60">Плечо</span>
            <Stepper value={step} onChange={setStep} min={1} max={25} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-[11px] font-bold uppercase text-sky/60">Сессия</span>
            <div className="w-[210px]"><Segmented value={seg} onChange={setSeg} options={[{ id: "d1", label: "UT" }, { id: "d2", label: "btc" }, { id: "d3", label: "eth" }]} /></div>
          </div>
          <div className="flex items-center gap-3"><Toggle on={t1} onChange={setT1} /><span className="font-display text-[12px] font-bold text-white/85">Звук {t1 ? "вкл" : "выкл"}</span></div>
          <div className="flex items-center gap-3"><Toggle on={t2} onChange={setT2} /><span className="font-display text-[12px] font-bold text-white/85">Вибрация {t2 ? "вкл" : "выкл"}</span></div>
          <Slider value={sl} onChange={setSl} />
        </div>
      </Card>

      {/* buttons */}
      <Card title="Кнопки" wide>
        <div className="flex flex-wrap items-center gap-2.5">
          <Btn color="teal" size="lg">В бой</Btn>
          <Btn color="gold" size="md">Забрать</Btn>
          <Btn color="pink" size="md">-35%</Btn>
          <Btn color="grape" size="md"><Gem s={15} /> Купить</Btn>
          <Btn color="mint" size="md">Готово</Btn>
          <Btn color="coral" size="md">Сдаться</Btn>
          <Btn color="navy" size="md">Назад</Btn>
          <Btn color="teal" size="md" disabled>Недоступно</Btn>
        </div>
        <Note>«Желе» вдавливается на 0.33em, у каждой — верхний глянец и пробегающий блик. Хвавер — +brightness.</Note>
      </Card>

      {/* currencies / bars */}
      <Card title="Ресурсы и прогресс">
        <div className="flex flex-wrap gap-2">
          <Pill icon={<Coin s={18} />} value="12 480" onAdd />
          <Pill icon={<Gem s={18} />} value="240" onAdd />
          <Pill icon={<Bolt s={18} />} value="42/60" />
        </div>
        <div className="mt-3.5 space-y-2.5">
          <BarRow l="HP" v={82} max={120} c1="#5cf09e" c2="#17c46b" />
          <BarRow l="Босс" v={310} max={680} c1="#ff8fb6" c2="#ef2f4c" />
          <BarRow l="XP" v={1420} max={1800} c1="#ffe884" c2="#ff9b1f" />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex items-center gap-1 font-num text-[13px] font-semibold text-coral"><Heart s={15} /> 320</span>
          <span className="flex items-center gap-1 font-num text-[13px] font-semibold text-gold"><Sword s={15} /> 18</span>
          <span className="flex items-center gap-1 font-num text-[13px] font-semibold text-sky"><ShieldIco s={15} /> 45</span>
        </div>
      </Card>

      {/* stars & frames */}
      <Card title="Звёзды и редкости">
        <div className="flex items-center gap-4"><Stars n={3} s={30} /><Stars n={1} s={22} /></div>
        <div className="mt-3.5 flex flex-wrap gap-2.5">
          {(Object.keys(RARITY) as (keyof typeof RARITY)[]).map((k) => {
            const r = RARITY[k];
            return (
              <div key={k} className="frame w-[66px]" style={{ background: `linear-gradient(170deg, ${r.c1}, ${r.c2} 60%, #16295c)` }}>
                <div className="rounded-[19px] px-1 py-2 text-center" style={{ background: "linear-gradient(178deg,#1a3467,#0c1c40)" }}>
                  <StarL size={14} className="mx-auto" style={{ color: r.c1 }} fill={r.c1} />
                  <span className="mt-1 block font-display text-[7px] font-black uppercase italic" style={{ color: r.c1 }}>{r.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* map states */}
      <Card title="Узлы карты">
        <div className="flex items-center gap-4">
          {[
            { l: "Пройден", bg: "linear-gradient(177deg,#ffe884,#f08a12)", sh: "inset 0 2px 0 rgba(255,255,255,.7), inset 0 -6px 0 #a8530a, 0 5px 0 #7a3c06", ic: <Check size={22} strokeWidth={4} className="text-[#6b3c05]" /> },
            { l: "Текущий", bg: "linear-gradient(177deg,#35f7d2,#0bb7d8)", sh: "inset 0 2px 0 rgba(255,255,255,.7), inset 0 -6px 0 #056a80, 0 5px 0 #044f61", ic: <span className="hd text-[18px]">5</span> },
            { l: "Закрыт", bg: "linear-gradient(177deg,#2b4d8f,#122445)", sh: "inset 0 2px 0 rgba(150,195,255,.25), inset 0 -5px 0 #091a3d, 0 4px 0 #071331", ic: <Lock size={19} className="text-sky/45" /> },
          ].map((n) => (
            <div key={n.l} className="text-center">
              <span className="mx-auto grid h-[52px] w-[52px] place-items-center rounded-full" style={{ background: n.bg, boxShadow: n.sh }}>{n.ic}</span>
              <span className="mt-2 block font-display text-[10px] font-bold uppercase text-sky/55">{n.l}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`pnl noise p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-3.5 flex items-center gap-2">
        <span className="h-[3px] w-4 rounded-full bg-teal" />
        <span className="font-display text-[12px] font-black uppercase italic tracking-wide text-white/90">{title}</span>
      </div>
      {children}
    </div>
  );
}
const Note = ({ children }: { children: ReactNode }) => (
  <p className="mt-3.5 font-body text-[11.5px] font-bold leading-snug text-sky/45">{children}</p>
);
const BarRow = ({ l, v, max, c1, c2 }: { l: string; v: number; max: number; c1: string; c2: string }) => (
  <div className="flex items-center gap-3">
    <span className="w-9 font-display text-[11px] font-bold uppercase text-sky/60">{l}</span>
    <Bar v={v} max={max} c1={c1} c2={c2} h={13} label={`${v} / ${max}`} />
  </div>
);

/* ───────── principles ───────── */
export function Principles() {
  const ic = [
    <TrendingUp key="0" strokeWidth={2.7} />, <MousePointerClick key="1" strokeWidth={2.7} />, <StarL key="2" strokeWidth={2.7} />,
    <HeartL key="3" strokeWidth={2.7} />, <Zap key="4" strokeWidth={2.7} />, <Crown key="5" strokeWidth={2.7} />,
  ];
  return (
    <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
      {PRINCIPLES.map((p, i) => (
        <motion.div key={p.t} initial={{ y: 26, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: i * 0.05 }} className="pnl noise p-5">
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-[14px] text-[#04303f]"
            style={{ background: "linear-gradient(177deg,#35f7d2,#0bb7d8)", boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -4px 0 #056a80" }}>
            {ic[i]}
          </span>
          <div className="font-display text-[15px] font-black uppercase italic text-white">{p.t}</div>
          <p className="mt-1.5 font-body text-[12.5px] font-bold leading-relaxed text-sky/55">{p.d}</p>
        </motion.div>
      ))}
    </div>
  );
}
