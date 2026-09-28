import { useState } from "react";
import { Icon } from "../components/Icon";
import { Btn, Chip, Bar } from "../components/ui";
import { AvatarArt, CoinArt, GemArt, WhaleBoss } from "../components/art";
import { particles } from "../lib/particles";
import { wallet } from "../lib/wallet";
import { tap, sfx, haptic, notify } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   S09 — Клан: казна, состав, рейд на босса.
   ═══════════════════════════════════════════════════════════════════ */

const MEMBERS = [
  { n: "Вы", seed: 0, role: "Капитан", xp: 1980, me: true },
  { n: "Кира", seed: 1, role: "Офицер", xp: 2140 },
  { n: "Макс", seed: 2, role: "Боец", xp: 1810 },
  { n: "Лена", seed: 4, role: "Боец", xp: 1320 },
  { n: "Олег", seed: 5, role: "Новичок", xp: 900 },
];

export function Clan() {
  const [joined, setJoined] = useState(true);
  const [treasury, setTreasury] = useState(12400);
  const [boss, setBoss] = useState(68);
  const [cool, setCool] = useState(false);
  const [sort, setSort] = useState<"xp" | "az">("xp");
  const members = [...MEMBERS].sort((a, b) => (sort === "xp" ? b.xp - a.xp : a.n.localeCompare(b.n, "ru")));
  const maxXp = Math.max(...members.map((m) => m.xp));

  const raid = (e: React.MouseEvent<HTMLElement>) => {
    if (cool || boss <= 0) return;
    setCool(true);
    setTimeout(() => setCool(false), 900);
    const crit = Math.random() < 0.2;
    const dmg = crit ? 9 : 3 + Math.round(Math.random() * 3);
    setBoss((b) => {
      const n = Math.max(0, b - dmg);
      if (n <= 0) {
        sfx("levelup"); haptic([10, 30, 10, 30, 80]);
        particles.burstAt(e.currentTarget as HTMLElement, { count: 60, speed: 640 });
        particles.flyFrom(e.currentTarget as HTMLElement, "coins", "coin", 8, () => wallet.add({ coins: 300 }));
        notify("Рейд пройден! +300 монет в казну клана", "success");
        setTreasury((t) => t + 300);
      }
      return n;
    });
    sfx("hit"); haptic(crit ? [30, 20, 30] : 15);
    particles.burstAt(e.currentTarget as HTMLElement, { kind: "spark", count: crit ? 26 : 12, speed: 380, colors: crit ? ["#FFC940", "#fff"] : ["#3D9BFF", "#8CCBFF"] });
  };

  if (!joined) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <div className="flex -space-x-4">{[1, 2, 4].map((s) => <span key={s} className="rounded-full border-4 border-ink-800"><AvatarArt seed={s} size={52} /></span>)}</div>
        <div className="mt-3 font-display text-lg font-black">Клан «Бычье братство»</div>
        <div className="mt-1 max-w-xs text-[12px] text-ink-400">5 участников · 12 место в сезоне · еженедельные рейды и общая казна</div>
        <div className="mt-2 flex gap-2"><Chip tone="gold">топ-15</Chip><Chip tone="sky">набор открыт</Chip></div>
        <Btn s="md" className="mt-4" icon="plus" onClick={() => { setJoined(true); sfx("levelup"); }}>Вступить</Btn>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">{members.slice(0, 4).map((m) => <span key={m.n} className="rounded-full border-[3px] border-ink-800"><AvatarArt seed={m.seed} size={36} /></span>)}</div>
        <div className="flex-1">
          <div className="font-display text-sm font-black">Бычье братство <span className="text-ink-500">ур. 7</span></div>
          <div className="flex items-center gap-1 text-[11px] text-ink-400"><CoinArt size={14} />казна <b className="font-mono text-gold">{treasury.toLocaleString("ru-RU")}</b></div>
        </div>
        <button onClick={() => { tap(); setJoined(false); }} className="text-[11px] font-bold text-ink-500 hover:text-bear">выйти</button>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-bear/20 to-ink-900 p-4 ring-1 ring-bear/30">
        <div className="flex items-center gap-3">
          <div className={cn(boss <= 0 && "opacity-40 grayscale")}><WhaleBoss size={96} /></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="font-display text-xs font-black uppercase text-bear">Рейд · Кит</span><span className="ml-auto font-mono text-[11px]">{boss}%</span></div>
            <Bar value={boss} tone="bear" h={14} className="mt-1.5" />
            <div className="mt-1 text-[11px] text-ink-400">{boss > 0 ? "Бей вместе с кланом · награда всем" : "Повержен! Следующий рейд завтра"}</div>
            <Btn s="sm" v="bear" icon="sword" disabled={cool || boss <= 0} className="mt-2.5" onClick={raid}>
              {boss <= 0 ? "Готово" : cool ? "Перезарядка…" : "Атаковать"}
            </Btn>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[11px] text-ink-400">Состав · {members.length}/20</span>
        <button onClick={() => { tap("tick"); setSort(sort === "xp" ? "az" : "xp"); }} className="ml-auto flex items-center gap-1 rounded-lg bg-ink-850 px-2 py-1 text-[11px] font-bold text-ink-300">
          <Icon name="sort" size={12} />{sort === "xp" ? "по XP" : "по имени"}
        </button>
        <Btn s="xs" v="sky" icon="plus" onClick={() => notify("Ссылка-приглашение скопирована", "info")}>Звать</Btn>
      </div>
      <div className="mt-2 space-y-1.5">
        {members.map((m) => (
          <div key={m.n} className={cn("flex items-center gap-2.5 rounded-2xl px-2.5 py-2", m.me ? "bg-sky/10 ring-1 ring-sky/40" : "bg-ink-850")}>
            <AvatarArt seed={m.seed} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[12px] font-bold">
                <span className={cn("truncate", m.me && "text-sky")}>{m.n}</span>
                <span className="rounded bg-ink-800 px-1.5 text-[9px] font-black uppercase text-ink-400">{m.role}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-900">
                <div className="h-full rounded-full bg-gradient-to-r from-violet to-sky" style={{ width: `${(m.xp / maxXp) * 100}%` }} />
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold tabular-nums">{m.xp}</span>
            {!m.me && <button aria-label={`Подарок для ${m.n}`} onClick={(e) => { sfx("coin"); particles.flyFrom(e.currentTarget, "gems", "gem", 4); notify(`${m.n} получил(а) подарок`, "success"); }} className="text-ink-500 hover:text-gold"><GemArt size={18} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}
