import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Label } from "../components/ui";
import { GemArt } from "../components/art";
import { LeagueBadge, type Tier } from "../components/art2";
import { tap, sfx, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   Конструктор аватара (S07) и рамки профиля (S08).
   Слои SVG: фон → лицо → глаза → рот → волосы → аксессуар.
   ═══════════════════════════════════════════════════════════════════ */

const SKINS = ["#FFD9C0", "#F0B88C", "#C98A5A", "#8A5A34"];
const HAIRS = ["#1a1030", "#4A2C12", "#C98A08", "#B0C0E4", "#2BE38B", "#FF4D6D"];
const BGS = [
  ["#3D9BFF", "#1B5FC9"], ["#9A6BFF", "#5F35C9"], ["#FF8A3D", "#C9521A"],
  ["#2BE38B", "#12A25E"], ["#FF4D6D", "#BF2345"], ["#FFC940", "#C98A08"],
];
const EYES = ["круглые", "узкие", "сонные", "злые"] as const;
const MOUTHS = ["улыбка", "прямой", "ухмылка", "удивление"] as const;
const HAIR_S = ["ёжик", "чёлка", "длинные", "лысина"] as const;
const ACCS = ["нет", "очки", "монокль", "шляпа", "наушники"] as const;

export type AvatarSpec = { skin: number; hair: number; bg: number; eyes: number; mouth: number; hs: number; acc: number };

export function AvatarBuilder({ spec, size = 120 }: { spec: AvatarSpec; size?: number }) {
  const [a, b] = BGS[spec.bg % BGS.length];
  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  return (
    <svg width={size} height={size} viewBox="0 0 96 96">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <clipPath id={id + "c"}><circle cx="48" cy="48" r="48" /></clipPath>
      </defs>
      <circle cx="48" cy="48" r="48" fill={`url(#${id})`} />
      <g clipPath={`url(#${id}c)`}>
        <circle cx="76" cy="18" r="20" fill="#fff" opacity=".08" />
        {/* тело */}
        <path d="M16 96c5-16 17-22 32-22s27 6 32 22Z" fill="#0c1834" opacity=".6" />
        <rect x="42" y="56" width="12" height="12" rx="4" fill={SKINS[spec.skin % SKINS.length]} opacity=".85" />
        {/* лицо */}
        <ellipse cx="48" cy="44" rx="21" ry="23" fill={SKINS[spec.skin % SKINS.length]} />
        {/* глаза */}
        {spec.eyes === 0 && (
          <g fill="#1a1030"><circle cx="40" cy="44" r="2.6" /><circle cx="56" cy="44" r="2.6" /><circle cx="41" cy="43" r=".9" fill="#fff" /><circle cx="57" cy="43" r=".9" fill="#fff" /></g>
        )}
        {spec.eyes === 1 && (
          <g stroke="#1a1030" strokeWidth="2.4" strokeLinecap="round"><path d="M35 44h9M52 44h9" /></g>
        )}
        {spec.eyes === 2 && (
          <g><path d="M35 42q5 4 10 0M51 42q5 4 10 0" stroke="#1a1030" strokeWidth="2.4" strokeLinecap="round" fill="none" /><circle cx="40" cy="45" r="1.4" fill="#1a1030" /><circle cx="56" cy="45" r="1.4" fill="#1a1030" /></g>
        )}
        {spec.eyes === 3 && (
          <g><path d="M34 39l11 3M62 39l-11 3" stroke="#1a1030" strokeWidth="2.6" strokeLinecap="round" /><circle cx="41" cy="46" r="2.2" fill="#1a1030" /><circle cx="55" cy="46" r="2.2" fill="#1a1030" /></g>
        )}
        {/* рот */}
        {spec.mouth === 0 && <path d="M41 54q7 6 14 0" stroke="#1a1030" strokeWidth="2.4" strokeLinecap="round" fill="none" />}
        {spec.mouth === 1 && <path d="M42 55h12" stroke="#1a1030" strokeWidth="2.4" strokeLinecap="round" />}
        {spec.mouth === 2 && <path d="M41 55q8 4 13-2" stroke="#1a1030" strokeWidth="2.4" strokeLinecap="round" fill="none" />}
        {spec.mouth === 3 && <ellipse cx="48" cy="56" rx="4" ry="5" fill="#7E1A3A" />}
        {/* волосы */}
        {spec.hs === 0 && <path d="M27 38c3-16 11-22 21-22s18 6 21 22c-7-6-14-8-21-8s-14 2-21 8Z" fill={HAIRS[spec.hair % HAIRS.length]} />}
        {spec.hs === 1 && <path d="M26 40c2-18 12-24 22-24s20 6 22 24l-6-6-7 3-5-4-6 4-7-3-6 4-7-2Z" fill={HAIRS[spec.hair % HAIRS.length]} />}
        {spec.hs === 2 && <path d="M26 36c3-15 12-20 22-20s19 5 22 20l3 30h-8l-2-22c-4-3-9-4-15-4s-11 1-15 4l-2 22h-8Z" fill={HAIRS[spec.hair % HAIRS.length]} />}
        {/* аксессуары */}
        {spec.acc === 1 && (
          <g stroke="#081229" strokeWidth="2.4" fill="rgba(61,155,255,.25)"><rect x="32" y="38" width="14" height="11" rx="4" /><rect x="51" y="38" width="14" height="11" rx="4" /><path d="M46 42h5" /></g>
        )}
        {spec.acc === 2 && (
          <g><circle cx="57" cy="44" r="8" fill="rgba(255,201,64,.2)" stroke="#FFC940" strokeWidth="2.4" /><path d="M57 52v10" stroke="#FFC940" strokeWidth="2.4" /></g>
        )}
        {spec.acc === 3 && (
          <g><ellipse cx="48" cy="24" rx="26" ry="6" fill="#C98A08" /><path d="M34 24c0-10 6-15 14-15s14 5 14 15Z" fill="#8A5C00" /><rect x="34" y="20" width="28" height="4" fill="#3a2400" /></g>
        )}
        {spec.acc === 4 && (
          <g><path d="M26 34c2-12 10-17 22-17s20 5 22 17" stroke="#FF4D6D" strokeWidth="5" fill="none" strokeLinecap="round" /><rect x="22" y="32" width="9" height="18" rx="4" fill="#FF4D6D" /><rect x="65" y="32" width="9" height="18" rx="4" fill="#FF4D6D" /></g>
        )}
      </g>
      <circle cx="48" cy="48" r="46.5" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="2" />
    </svg>
  );
}

/* ── S07 · Конструктор ── */
const TABS = ["Фон", "Кожа", "Волосы", "Стиль", "Глаза", "Рот", "Аксессуар"] as const;

export function AvatarStudio() {
  const [spec, setSpec] = useState<AvatarSpec>({ skin: 0, hair: 0, bg: 0, eyes: 0, mouth: 0, hs: 1, acc: 0 });
  const [tab, setTab] = useState<(typeof TABS)[number]>("Фон");
  const [saved, setSaved] = useState<AvatarSpec[]>([]);
  const set = (k: keyof AvatarSpec, v: number) => { tap("tick"); setSpec((s) => ({ ...s, [k]: v })); };
  const random = () => {
    sfx("whoosh");
    setSpec({ skin: Math.floor(Math.random() * SKINS.length), hair: Math.floor(Math.random() * HAIRS.length), bg: Math.floor(Math.random() * BGS.length), eyes: Math.floor(Math.random() * EYES.length), mouth: Math.floor(Math.random() * MOUTHS.length), hs: Math.floor(Math.random() * HAIR_S.length), acc: Math.floor(Math.random() * ACCS.length) });
  };
  const opts: Record<(typeof TABS)[number], { n: number; render: (i: number) => React.ReactNode; pick: (i: number) => void; cur: number }> = {
    "Фон": { n: BGS.length, cur: spec.bg, pick: (i) => set("bg", i), render: (i) => <span className="size-9 rounded-xl" style={{ background: `linear-gradient(180deg, ${BGS[i][0]}, ${BGS[i][1]})` }} /> },
    "Кожа": { n: SKINS.length, cur: spec.skin, pick: (i) => set("skin", i), render: (i) => <span className="size-9 rounded-full" style={{ background: SKINS[i] }} /> },
    "Волосы": { n: HAIRS.length, cur: spec.hair, pick: (i) => set("hair", i), render: (i) => <span className="size-9 rounded-xl" style={{ background: HAIRS[i] }} /> },
    "Стиль": { n: HAIR_S.length, cur: spec.hs, pick: (i) => set("hs", i), render: (i) => <span className="flex h-9 items-center rounded-xl bg-ink-800 px-2 text-[10px] font-bold">{HAIR_S[i]}</span> },
    "Глаза": { n: EYES.length, cur: spec.eyes, pick: (i) => set("eyes", i), render: (i) => <span className="flex h-9 items-center rounded-xl bg-ink-800 px-2 text-[10px] font-bold">{EYES[i]}</span> },
    "Рот": { n: MOUTHS.length, cur: spec.mouth, pick: (i) => set("mouth", i), render: (i) => <span className="flex h-9 items-center rounded-xl bg-ink-800 px-2 text-[10px] font-bold">{MOUTHS[i]}</span> },
    "Аксессуар": { n: ACCS.length, cur: spec.acc, pick: (i) => set("acc", i), render: (i) => <span className="flex h-9 items-center rounded-xl bg-ink-800 px-2 text-[10px] font-bold">{ACCS[i]}</span> },
  };
  const o = opts[tab];
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-[conic-gradient(var(--color-gold)_0_72%,#1b305c_72%)] p-1.5" key={JSON.stringify(spec)}>
          <div className="rounded-full border-4 border-ink-800 animate-pop"><AvatarBuilder spec={spec} size={150} /></div>
        </div>
        <div className="mt-3 flex gap-2">
          <Btn s="xs" v="violet" icon="refresh" onClick={random}>Случайно</Btn>
          <Btn s="xs" v="bull" icon="check" onClick={() => { sfx("success"); setSaved((s) => [...s.slice(-4), spec]); notify("Аватар сохранён", "success"); }}>Готово</Btn>
        </div>
        {saved.length > 0 && (
          <div className="mt-3 flex gap-1.5">
            {saved.map((s, i) => (
              <button key={i} onClick={() => setSpec(s)} className="rounded-full ring-2 ring-transparent transition hover:ring-sky"><AvatarBuilder spec={s} size={34} /></button>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => { tap("tick"); setTab(t); }} className={cn("shrink-0 rounded-xl px-3 py-2 text-[12px] font-bold transition-colors", tab === t ? "bg-sky text-white shadow-[0_3px_0_var(--color-sky-d)]" : "bg-ink-850 text-ink-300")}>{t}</button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6" key={tab}>
          {Array.from({ length: o.n }).map((_, i) => (
            <button key={i} onClick={() => o.pick(i)} className={cn("flex items-center justify-center rounded-2xl border-2 p-1.5 transition-all animate-zoom-in", o.cur === i ? "border-sky bg-sky/10 scale-105" : "border-transparent bg-ink-850 hover:bg-ink-800")} style={{ animationDelay: `${i * 40}ms` }}>
              {o.render(i)}
            </button>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-ink-500">Комбинаций: {(SKINS.length * HAIRS.length * BGS.length * EYES.length * MOUTHS.length * HAIR_S.length * ACCS.length).toLocaleString("ru-RU")} · слои рендерятся в SVG без картинок</div>
      </div>
    </div>
  );
}

/* ── S08 · Рамки профиля ── */
const FRAMES: { k: string; t: string; d: string; price: number; ring: string; tier?: Tier }[] = [
  { k: "std", t: "Стандарт", d: "Для всех", price: 0, ring: "conic-gradient(#30508F 0 100%, #30508F 100%)" },
  { k: "bull", t: "Бычья", d: "Зелёное свечение", price: 150, ring: "conic-gradient(#2BE38B, #8CFFD0, #2BE38B)" },
  { k: "gold", t: "Золотая", d: "Финал сезона", price: 400, ring: "conic-gradient(#FFC940, #FFE58A, #FF8A3D, #FFC940)" },
  { k: "dia", t: "Бриллиант", d: "Только легендам", price: 1200, ring: "conic-gradient(#8FF5FF, #fff, #6FD6F0, #8FF5FF)", tier: "diamond" },
];

export function FrameShop() {
  const [frame, setFrame] = useState(0);
  const [owned, setOwned] = useState<number[]>([0]);
  const [progress, setProgress] = useState(72);
  const spec: AvatarSpec = { skin: 0, hair: 0, bg: 0, eyes: 0, mouth: 0, hs: 1, acc: 0 };
  const f = FRAMES[frame];
  return (
    <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="flex flex-col items-center">
        <div className="rounded-full p-1.5 transition-all" style={{ background: f.ring }} key={frame}>
          <div className="rounded-full border-4 border-ink-800 animate-pop"><AvatarBuilder spec={spec} size={130} /></div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-display text-sm font-black">{f.t}</span>
          {f.tier && <LeagueBadge tier={f.tier} size={26} />}
        </div>
        <div className="text-[11px] text-ink-400">{f.d}</div>
        <div className="mt-2 w-40">
          <Label className="mb-1 text-center">Прогресс кольца {progress}%</Label>
          <input type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(+e.target.value)} className="rng" aria-label="прогресс" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {FRAMES.map((x, i) => (
          <button key={x.k} onClick={() => { tap("tick"); setFrame(i); }}
            className={cn("flex items-center gap-3 rounded-2xl border-2 p-2.5 text-left transition-all", frame === i ? "border-sky bg-sky/10" : "border-transparent bg-ink-850 hover:bg-ink-800")}>
            <span className="rounded-full p-[3px]" style={{ background: owned.includes(i) ? x.ring : "#243d73" }}>
              <span className="block rounded-full border-2 border-ink-800"><AvatarBuilder spec={spec} size={40} /></span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-bold">{x.t}</span>
              {owned.includes(i) ? <Chip tone="bull">есть</Chip> : (
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-lg bg-sky/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky" onClick={(e) => { e.stopPropagation(); sfx("coin"); setOwned((o) => [...o, i]); notify(`Рамка «${x.t}» куплена`, "success"); }}>
                  <GemArt size={12} />{x.price}
                </span>
              )}
            </span>
            {frame === i && <Icon name="check" size={16} stroke={3} className="text-sky" />}
          </button>
        ))}
      </div>
    </div>
  );
}
