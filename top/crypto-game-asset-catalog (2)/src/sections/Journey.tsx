import { useViewportProgress, clamp } from "../kit/motion";
import { Mascot } from "../kit/Mascot";
import { CandleUpIcon, ShieldIcon, TargetIcon, TrophyIcon, GemIcon } from "../kit/GameIcons";
import heroArt from "../assets/hero-arena.jpg";
import terrain from "../assets/terrain.jpg";
import duel from "../assets/arena-duel.jpg";
import vault from "../assets/vault.jpg";
import plate from "../assets/plate.jpg";

const chapters = [
  { n: "01", t: "Read the candle", d: "Тела, тени, цвет. Первые 5 минут — и ты читаешь график.", img: terrain, c: "#22d39a", I: CandleUpIcon, l: 12 },
  { n: "02", t: "Find the trend", d: "Повышающиеся минимумы, уровни, пробои. Рынок перестаёт быть шумом.", img: heroArt, c: "#3b82ff", I: TargetIcon, l: 18 },
  { n: "03", t: "Protect capital", d: "Стоп-лосс, размер позиции, правило 1%. Выживает тот, кто считает риск.", img: plate, c: "#ffc53d", I: ShieldIcon, l: 9 },
  { n: "04", t: "Duel the market", d: "Реплеи, дуэли 1v1, лиги. Навык проверяется под давлением.", img: duel, c: "#ff4f6d", I: TrophyIcon, l: 24 },
  { n: "05", t: "Master & earn", d: "Сундуки, медали, Obsidian-лига. Прогресс, который видно.", img: vault, c: "#8b5cff", I: GemIcon, l: 15 },
];

/** Pinned horizontal scroll: vertical page scroll drives a horizontal chapter track. */
export default function Journey() {
  const [ref, p] = useViewportProgress<HTMLElement>("pinned");
  const n = chapters.length;
  const active = clamp(Math.round(p * (n - 1)), 0, n - 1);
  return (
    <section id="journey" ref={ref} className="relative scroll-mt-24" style={{ height: `${n * 85 + 40}vh` }}>
      <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden">
        <div className="mb-6 flex flex-wrap items-end gap-4 px-1">
          <div className="font-display text-5xl font-black leading-none text-transparent [-webkit-text-stroke:1.5px_#2c4580] sm:text-6xl">J</div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">The Learning Journey</h2>
            <p className="text-sm text-mist">Прокручивай страницу вниз — главы едут вбок. Закреплённый горизонтальный скролл с параллаксом.</p>
          </div>
          <div className="flex items-center gap-2">
            {chapters.map((c, i) => (
              <span key={c.n} className="h-2.5 rounded-full transition-all duration-300" style={{ width: i === active ? 34 : 10, background: i <= active ? c.c : "#273f75", boxShadow: i === active ? `0 0 12px ${c.c}` : undefined }} />
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex gap-6 will-change-transform" style={{ transform: `translateX(calc(${-p * (n - 1)} * (min(78vw, 720px) + 24px)))` }}>
            {chapters.map((c, i) => {
              const local = p * (n - 1) - i;
              return (
                <article key={c.n} className="relative h-[min(62vh,520px)] shrink-0 overflow-hidden rounded-[34px] border border-white/10 shadow-[0_12px_0_#060b18,0_40px_60px_-20px_rgba(0,0,0,.8)]" style={{ width: "min(78vw, 720px)", transform: `scale(${1 - Math.min(1, Math.abs(local)) * 0.07})`, opacity: 1 - Math.min(1, Math.abs(local)) * 0.35, transition: "transform .1s linear" }}>
                  <img src={c.img} alt="" className="absolute inset-0 h-full w-[130%] max-w-none object-cover" style={{ left: "-15%", transform: `translateX(${local * -12}%) scale(1.08)` }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-ink-950/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                  <div className="relative flex h-full flex-col justify-end p-7 sm:p-10" style={{ transform: `translateX(${local * 60}px)` }}>
                    <div className="num text-7xl font-black leading-none sm:text-8xl" style={{ color: `${c.c}`, opacity: 0.85, textShadow: `0 0 40px ${c.c}66` }}>{c.n}</div>
                    <h3 className="font-display mt-2 text-3xl font-black sm:text-5xl">{c.t}</h3>
                    <p className="mt-3 max-w-md text-[15px] leading-relaxed text-snow/80">{c.d}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="rounded-xl px-3 py-1.5 text-[11px] font-extrabold uppercase text-ink-900" style={{ background: c.c }}>{c.l} lessons</span>
                      <span className="text-[11px] font-bold text-mist">Chapter {i + 1} / {n}</span>
                    </div>
                  </div>
                  <div className="absolute right-6 top-6 sm:right-10 sm:top-10" style={{ transform: `translateY(${local * -40}px) rotate(${local * 12}deg)` }}>
                    <c.I size={96} className="drop-shadow-[0_16px_24px_rgba(0,0,0,.6)]" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 px-1">
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-ink-800">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-bull via-sky to-violet" style={{ width: `${p * 100}%` }} />
          </div>
          <div className="relative h-14 w-14 shrink-0" style={{ transform: `translateY(${Math.sin(p * 20) * 3}px)` }}>
            <Mascot size={56} mood={p > 0.95 ? "hype" : "idle"} />
          </div>
        </div>
      </div>
    </section>
  );
}
