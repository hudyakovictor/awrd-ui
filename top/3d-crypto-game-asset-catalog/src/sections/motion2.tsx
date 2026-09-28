import { useEffect, useRef, useState } from "react";
import { Icon } from "../components/Icon";
import { Label } from "../components/ui";
import { Mascot } from "../components/art";
import { EASE_CSS } from "../lib/motion";
import { tap, sfx } from "../lib/fx";
import { cn } from "../utils/cn";

/* ═══════════════════════════════════════════════════════════════════
   J05 — Секвенсор: цепочка анимаций со скрабом по таймлайну.
   ═══════════════════════════════════════════════════════════════════ */

type Key = { t: number; x: number; y: number; s: number; r: number; o: number };
const TRACK: Key[] = [
  { t: 0, x: 0, y: 0, s: 1, r: 0, o: 1 },
  { t: 0.25, x: 90, y: -40, s: 1.25, r: -10, o: 1 },
  { t: 0.5, x: 0, y: 0, s: 0.85, r: 8, o: 1 },
  { t: 0.75, x: -90, y: 30, s: 1.1, r: 0, o: 0.4 },
  { t: 1, x: 0, y: 0, s: 1, r: 360, o: 1 },
];
const EASES = ["spring", "out", "snap", "smooth"] as const;

function sample(track: Key[], t: number): Key {
  let a = track[0], b = track[track.length - 1];
  for (let i = 0; i < track.length - 1; i++) {
    if (t >= track[i].t && t <= track[i + 1].t) { a = track[i]; b = track[i + 1]; break; }
  }
  const span = b.t - a.t || 1;
  let k = (t - a.t) / span;
  k = k * k * (3 - 2 * k); // smoothstep между ключами
  const L = (x: number, y: number) => x + (y - x) * k;
  return { t, x: L(a.x, b.x), y: L(a.y, b.y), s: L(a.s, b.s), r: L(a.r, b.r), o: L(a.o, b.o) };
}

export function Sequencer() {
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(false);
  const [loop, setLoop] = useState(true);
  const [ease, setEase] = useState<(typeof EASES)[number]>("spring");
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);
  const raf = useRef(0);
  const last = useRef(0);
  const k = sample(TRACK, t);

  useEffect(() => {
    if (!play) return;
    last.current = performance.now();
    const step = (now: number) => {
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((v) => {
        const n = v + dt / 3.2;
        if (n >= 1) {
          if (loop) { setTrail([]); return 0; }
          setPlay(false);
          return 1;
        }
        return n;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [play, loop]);

  useEffect(() => {
    if (play) setTrail((tr) => [...tr.slice(-46), { x: k.x, y: k.y }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const toggle = () => {
    if (!play && t >= 1) { setT(0); setTrail([]); }
    if (!play) sfx("whoosh");
    setPlay(!play);
  };

  return (
    <div>
      <div className="well grid-bg relative flex h-56 items-center justify-center overflow-hidden">
        <svg viewBox="-140 -90 280 180" className="absolute h-full w-full" preserveAspectRatio="xMidYMid meet">
          <polyline points={trail.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#9A6BFF" strokeWidth="2" opacity=".55" />
          {TRACK.map((key, i) => (
            <g key={i} opacity={t >= key.t - 0.02 ? 1 : 0.35}>
              <circle cx={key.x} cy={key.y} r="4" fill={t >= key.t - 0.02 ? "#FFC940" : "#30508F"} />
              <text x={key.x + 7} y={key.y - 7} fontSize="9" fill="#7d93c6" fontFamily="monospace">K{i}</text>
            </g>
          ))}
        </svg>
        <div
          className="absolute"
          style={{
            transform: `translate(calc(-50% + ${(k.x / 140) * 38}cqw), ${(-k.y / 90) * 40}%) scale(${k.s}) rotate(${k.r * 0.28}deg)`,
            opacity: k.o,
            left: "50%", top: "50%",
          }}
        >
          <div style={{ transform: `translate(-50%,-50%) translate(${k.x * 0.55}px, ${k.y * 0.55}px) scale(${k.s}) rotate(${k.r}deg)`, opacity: k.o }}>
            <Mascot size={84} mood="happy" />
          </div>
        </div>
        <div className="absolute left-3 top-2.5 font-mono text-[10px] text-ink-400">t = {t.toFixed(2)} · ease {ease}</div>
        <div className="absolute right-3 top-2.5 font-mono text-[10px] text-ink-400">x {Math.round(k.x)} · s {k.s.toFixed(2)} · r {Math.round(k.r)}°</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button onClick={toggle} aria-label={play ? "Пауза" : "Играть"} className={cn("btn3d size-11 shrink-0 rounded-xl px-0", play ? "v-ink" : "v-violet")}>
          <Icon name={play ? "minus" : "play"} size={18} stroke={2.6} />
        </button>
        <div className="relative flex-1">
          <div className="well absolute inset-x-0 top-[11px] h-3 rounded-full" />
          <div className="absolute left-0 top-[11px] h-3 rounded-full bg-violet" style={{ width: `${t * 100}%` }} />
          {TRACK.map((key, i) => (
            <button key={i} onClick={() => { tap("tick"); setT(key.t); }} aria-label={`Ключ ${i}`}
              className="absolute top-[7px] size-4 -translate-x-1/2 rounded-full border-2 border-ink-900 transition-transform hover:scale-125"
              style={{ left: `${key.t * 100}%`, background: t >= key.t - 0.01 ? "#FFC940" : "#30508F" }} />
          ))}
          <input type="range" className="rng relative opacity-0" min={0} max={1000} value={Math.round(t * 1000)} aria-label="время"
            onChange={(e) => { setPlay(false); setT(+e.target.value / 1000); }} />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-ink-300">{(t * 3.2).toFixed(1)}s</span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Кривая перехода</Label>
          <div className="flex gap-1.5">
            {EASES.map((e) => (
              <button key={e} onClick={() => { tap("tick"); setEase(e); }} className={cn("flex-1 rounded-xl py-2 font-mono text-[11px] font-bold", ease === e ? "bg-violet text-white" : "bg-ink-850 text-ink-300")}>{e}</button>
            ))}
          </div>
          <div className="code mt-2 truncate rounded-lg bg-ink-950 px-2 py-1.5">{EASE_CSS[ease]}</div>
        </div>
        <div>
          <Label>Ключи · клик — прыжок</Label>
          <div className="flex flex-wrap gap-1.5">
            {TRACK.map((key, i) => (
              <button key={i} onClick={() => { tap("tick"); setPlay(false); setT(key.t); }}
                className={cn("rounded-lg px-2 py-1.5 font-mono text-[10px]", Math.abs(t - key.t) < 0.03 ? "bg-gold text-ink-900 font-black" : "bg-ink-850 text-ink-300")}>
                K{i}@{key.t.toFixed(2)}
              </button>
            ))}
            <button onClick={() => { tap("tick"); setLoop(!loop); }} className={cn("rounded-lg px-2 py-1.5 text-[10px] font-bold", loop ? "bg-bull/20 text-bull" : "bg-ink-850 text-ink-400")}>
              {loop ? "⟳ loop" : "loop выкл"}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-ink-500">Так собраны появление сундука, победа над боссом и level-up</div>
        </div>
      </div>
    </div>
  );
}
