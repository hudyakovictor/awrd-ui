import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { useRef, useState } from "react";
import hood from "../assets/hood.jpg";
import type { Category } from "../data/catalog";
import { HoldButton, Roll, Segmented, useGhost } from "../components/controls";
import { I } from "../components/kit";
import {
  ParticleCanvas,
  centerIn,
  useParticles,
} from "../components/particles";
import { EASE, SPRING, clamp, shakeKeys, sleep } from "../motion/tokens";
import { sfx } from "../motion/sfx";
import { SceneBg, useScript, type SceneProps } from "../scenes/common";

const S = "#38bdf8";
const TIER_C = ["#cfd8ea", "#4cc3ff", "#9b7bff", "#ffc34d"];
const TIER_N = ["I", "II", "III", "IV"];
const ICONS = [I.trend, I.shield, I.bars, I.eye, I.bolt, I.heart];

/* ================================================================
   63 · MERGE CARDS — перетащи одинаковые, получи уровень выше
   ================================================================ */
interface Cell {
  id: number;
  kind: number;
  tier: number;
}
const START: (Cell | null)[] = [
  { id: 1, kind: 0, tier: 0 },
  { id: 2, kind: 1, tier: 0 },
  { id: 3, kind: 0, tier: 0 },
  { id: 4, kind: 2, tier: 1 },
  null,
  { id: 5, kind: 1, tier: 0 },
  { id: 6, kind: 0, tier: 1 },
  { id: 7, kind: 2, tier: 1 },
  { id: 8, kind: 3, tier: 0 },
];
const CS = 78,
  GAP = 10;

function MergeTile({
  c,
  onDrop,
  onGrab,
}: {
  c: Cell;
  onDrop: (id: number, x: number, y: number) => void;
  onGrab: () => void;
}) {
  const Ic = ICONS[c.kind];
  const col = TIER_C[c.tier];
  return (
    <motion.div
      layoutId={`m${c.id}`}
      drag
      dragSnapToOrigin
      dragElastic={0.6}
      onDragStart={onGrab}
      onDragEnd={(_e, info) => onDrop(c.id, info.point.x, info.point.y)}
      whileDrag={{
        scale: 1.15,
        rotate: -6,
        zIndex: 50,
        boxShadow: `0 20px 40px -10px ${col}`,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={SPRING.reward}
      className="relative grid h-full w-full cursor-grab touch-none place-items-center rounded-2xl border-2 active:cursor-grabbing"
      style={{
        borderColor: col,
        background: `linear-gradient(160deg, ${col}33, #0c1428 70%)`,
        color: col,
      }}
    >
      <Ic size={26} />
      <span className="absolute bottom-1 right-1.5 font-display text-[10px] font-black">
        {TIER_N[c.tier]}
      </span>
      {c.tier >= 2 && <div className="sheen absolute inset-0 rounded-2xl" />}
    </motion.div>
  );
}

export function MergeCards({ run, cue }: SceneProps) {
  const [grid, setGrid] = useState<(Cell | null)[]>(START);
  const [flash, setFlash] = useState<number | null>(null);
  const [merges, setMerges] = useState(0);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const cells = useRef<(HTMLDivElement | null)[]>([]);
  const g = useGhost();
  const p = useParticles();
  const nextId = useRef(100);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const cellAt = (px: number, py: number) => {
    let best = -1,
      bd = 1e9;
    cells.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.hypot(
        r.left + r.width / 2 - px,
        r.top + r.height / 2 - py,
      );
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    const r = cells.current[best]?.getBoundingClientRect();
    return r && bd < r.width * 0.7 ? best : -1;
  };

  const merge = (fromIdx: number, toIdx: number) => {
    const G = gridRef.current;
    const a = G[fromIdx],
      b = G[toIdx];
    if (!a) return false;
    if (
      b &&
      b.id !== a.id &&
      b.kind === a.kind &&
      b.tier === a.tier &&
      a.tier < 3
    ) {
      const n = [...G];
      n[fromIdx] = null;
      n[toIdx] = { id: nextId.current++, kind: a.kind, tier: a.tier + 1 };
      setGrid(n);
      setFlash(toIdx);
      setMerges((m) => m + 1);
      sfx.success();
      const c = centerIn(cells.current[toIdx] ?? null, root);
      p.ring(c.x, c.y, TIER_C[a.tier + 1], 80, 0.5, 6);
      p.burst({
        x: c.x,
        y: c.y,
        count: 30,
        shape: "star",
        colors: [TIER_C[a.tier + 1], "#fff"],
        speed: [100, 300],
        size: [2, 5],
      });
      if (a.tier + 1 === 3 && root)
        animate(root, shakeKeys(0.6, 12, 8, 1.2), { duration: 0.4 });
      window.setTimeout(() => setFlash(null), 500);
      return true;
    }
    if (!b && toIdx !== fromIdx) {
      const n = [...G];
      n[toIdx] = a;
      n[fromIdx] = null;
      setGrid(n);
      sfx.snap();
      return true;
    }
    return false;
  };

  const onDrop = (id: number, x: number, y: number) => {
    const from = gridRef.current.findIndex((c) => c?.id === id);
    const to = cellAt(x, y);
    if (to < 0 || !merge(from, to)) sfx.error();
  };

  useScript(run, async (wait) => {
    setGrid(START);
    setMerges(0);
    await wait(600);
    cue();
    const pos = (i: number) => ({
      x: 30 + (i % 3) * (CS + GAP) + CS / 2,
      y: 150 + Math.floor(i / 3) * (CS + GAP) + CS / 2,
    });
    const demo = async (a: number, b: number) => {
      const pa = pos(a),
        pb = pos(b);
      g.show(pa.x, pa.y);
      g.press(true);
      sfx.tap();
      await g.move(pb.x, pb.y, 0.6);
      g.press(false);
      merge(a, b);
      await wait(700);
    };
    await demo(0, 2); // I + I → II в ячейке 2
    await demo(2, 6); // II + II → III
    await demo(3, 7); // II + II (kind 2) → III
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={S} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div>
          <div className="font-display text-sm font-black">Слияние карт</div>
          <div className="text-[10px] text-white/45">
            перетащи одинаковые друг на друга
          </div>
        </div>
        <div className="glass rounded-full px-2.5 py-1 text-[10px] font-bold">
          слияний <Roll value={merges} color={S} />
        </div>
      </div>
      <div
        className="absolute left-[30px] top-[150px] grid grid-cols-3"
        style={{ gap: GAP }}
      >
        {grid.map((c, i) => (
          <div
            key={i}
            ref={(el) => {
              cells.current[i] = el;
            }}
            className="relative rounded-2xl border border-dashed border-white/10"
            style={{ width: CS, height: CS }}
          >
            {c && <MergeTile c={c} onDrop={onDrop} onGrab={() => sfx.tap()} />}
            <AnimatePresence>
              {flash === i && (
                <motion.div
                  key="f"
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-white"
                  initial={{ opacity: 0.9, scale: 1.2 }}
                  animate={{ opacity: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-4 top-[430px] flex justify-center gap-2">
        {TIER_N.map((n, i) => (
          <div
            key={n}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold"
            style={{ background: `${TIER_C[i]}1a`, color: TIER_C[i] }}
          >
            {n} {i < 3 && <I.arrowR size={10} />}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-6 bottom-8 text-center text-[10px] text-white/40">
        Две карты одного уровня → одна уровнем выше. Можно двигать и в пустые
        ячейки.
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   64 · SORT FLIP — сортировка и фильтр с каскадным FLIP
   ================================================================ */
const ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  kind: i % 6,
  tier: (i * 7) % 4,
  power: 20 + ((i * 37) % 80),
  fresh: (i * 5) % 12,
}));
const SORTS = ["Редкость", "Сила", "Новые"];

export function SortFlip({ run, cue }: SceneProps) {
  const [sort, setSort] = useState(0);
  const [hide, setHide] = useState<Set<number>>(new Set());
  const g = useGhost();
  const sorted = [...ITEMS]
    .filter((it) => !hide.has(it.tier))
    .sort((a, b) =>
      sort === 0
        ? b.tier - a.tier || b.power - a.power
        : sort === 1
          ? b.power - a.power
          : a.fresh - b.fresh,
    );
  const toggle = (t: number) => {
    sfx.tap();
    setHide((h) => {
      const n = new Set(h);
      n.has(t) ? n.delete(t) : n.add(t);
      return n;
    });
  };
  useScript(run, async (wait) => {
    setSort(0);
    setHide(new Set());
    await wait(600);
    cue();
    g.show(150, 108);
    for (const k of [1, 2]) {
      await g.move([60, 150, 240][k], 108, 0.35);
      g.press(true);
      await wait(90);
      g.press(false);
      setSort(k);
      sfx.whoosh(0.3);
      await wait(1200);
    }
    await g.move(48, 530, 0.4);
    g.press(true);
    await wait(90);
    g.press(false);
    toggle(0);
    await wait(900);
    await g.move(122, 530, 0.3);
    g.press(true);
    await wait(90);
    g.press(false);
    toggle(1);
    await wait(900);
    setHide(new Set());
    setSort(0);
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={S} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Инвентарь</div>
        <div className="text-[10px] text-white/50">
          <Roll value={sorted.length} color={S} /> предметов
        </div>
      </div>
      <div className="absolute inset-x-4 top-[90px]">
        <Segmented
          options={SORTS}
          value={sort}
          onChange={(k) => {
            setSort(k);
            sfx.whoosh(0.3);
          }}
          color={S}
        />
      </div>
      <motion.div
        layout
        className="absolute inset-x-4 top-[146px] grid grid-cols-4 gap-2"
      >
        <AnimatePresence mode="popLayout">
          {sorted.map((it, i) => {
            const Ic = ICONS[it.kind];
            const c = TIER_C[it.tier];
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.3,
                  rotate: 20,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 26,
                  delay: i * 0.025,
                }}
                className="relative grid aspect-square place-items-center rounded-xl border-2"
                style={{
                  borderColor: `${c}88`,
                  background: `linear-gradient(160deg, ${c}26, #0c1428)`,
                  color: c,
                }}
              >
                <Ic size={20} />
                <span className="absolute bottom-0.5 left-1 font-mono text-[8px] font-bold text-white/60">
                  {sort === 1 ? it.power : TIER_N[it.tier]}
                </span>
                {sort === 2 && it.fresh < 3 && (
                  <span className="absolute -right-1 -top-1 rounded bg-bear px-1 text-[7px] font-black text-white">
                    NEW
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      <div className="absolute inset-x-4 bottom-[70px] text-[9px] font-bold uppercase tracking-[.2em] text-white/40">
        Фильтр по редкости
      </div>
      <div className="absolute inset-x-4 bottom-6 grid grid-cols-4 gap-2">
        {TIER_N.map((n, t) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(t)}
            className="rounded-xl border-2 py-2 text-[11px] font-black"
            animate={{
              borderColor: hide.has(t) ? "#ffffff14" : TIER_C[t],
              color: hide.has(t) ? "#ffffff44" : TIER_C[t],
              background: hide.has(t) ? "#00000000" : `${TIER_C[t]}14`,
            }}
          >
            {n}
          </motion.button>
        ))}
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   65 · UPGRADE HOLD — заточка удержанием: успех или трещина
   ================================================================ */
export function UpgradeHold({ run, cue }: SceneProps) {
  const prog = useMotionValue(0);
  const [lvl, setLvl] = useState(4);
  const [res, setRes] = useState<null | "ok" | "fail">(null);
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const g = useGhost();
  const p = useParticles();
  const forced = useRef<null | boolean>(null);
  const chance = Math.max(20, 100 - lvl * 12);
  const glow = useTransform(prog, (v) => `0 0 ${20 + v * 60}px ${S}`);
  const itemScale = useTransform(prog, [0, 1], [1, 1.12]);
  const jit = useTransform(prog, (v) =>
    v > 0.7 ? (Math.random() - 0.5) * (v - 0.7) * 16 : 0,
  );
  const seg = useTransform(prog, (v) => Math.floor(v * 10));
  const [segN, setSegN] = useState(0);
  useMotionValueEvent(seg, "change", (s) => {
    setSegN(s);
    if (s > 0) sfx.combo(s);
  });

  const resolve = async () => {
    const ok = forced.current ?? Math.random() * 100 < chance;
    forced.current = null;
    await sleep(120);
    if (ok) {
      setRes("ok");
      setLvl((l) => l + 1);
      sfx.levelup();
      p.ring(150, 220, S, 160, 0.7, 8);
      p.burst({
        x: 150,
        y: 220,
        count: 60,
        shape: "star",
        colors: [S, "#fff", "#ffc34d"],
        speed: [150, 450],
        size: [2, 6],
      });
    } else {
      setRes("fail");
      sfx.shatter();
      if (root) animate(root, shakeKeys(0.8, 14, 10, 1.5), { duration: 0.45 });
      p.burst({
        x: 150,
        y: 220,
        count: 40,
        colors: ["#888", "#fff", "#ff4d5e"],
        speed: [150, 400],
        gravity: 400,
      });
    }
    animate(prog, 0, { duration: 0.6, ease: EASE.outExpo });
    window.setTimeout(() => setRes(null), 1400);
  };

  useScript(run, async (wait) => {
    prog.set(0);
    setLvl(4);
    setRes(null);
    await wait(600);
    cue();
    for (const ok of [true, false]) {
      forced.current = ok;
      g.show(150, 470);
      g.press(true);
      sfx.suck();
      await animate(prog, 1, { duration: 1.4, ease: "linear" });
      g.press(false);
      await resolve();
      await wait(1600);
    }
    g.hide();
  });

  return (
    <div ref={setRoot} className="absolute inset-0 overflow-hidden">
      <SceneBg tint={res === "fail" ? "#ff4d5e" : S} />
      <div className="absolute inset-x-4 top-11 flex items-center justify-between">
        <div className="font-display text-sm font-black">Заточка карты</div>
        <div className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold">
          шанс{" "}
          <Roll
            value={`${chance}%`}
            color={chance > 50 ? "#3ddc84" : "#ffc34d"}
          />
        </div>
      </div>
      <motion.div
        className="absolute left-1/2 top-[100px] -ml-[70px] h-[190px] w-[140px] rounded-2xl p-[3px]"
        style={{
          boxShadow: glow,
          scale: itemScale,
          x: jit,
          background: `linear-gradient(160deg, ${S}, #1a2440 60%, ${S})`,
        }}
      >
        <div className="relative h-full overflow-hidden rounded-[13px] bg-[#0c1428]">
          <img
            src={hood}
            className="mask-bottom h-[120px] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-3 text-center">
            <div className="font-display text-sm font-black">Тень рынка</div>
            <div
              className="font-display text-2xl font-black"
              style={{ color: S }}
            >
              +<Roll value={lvl} />
            </div>
          </div>
          <AnimatePresence>
            {res === "fail" && (
              <motion.svg
                key="cr"
                viewBox="0 0 140 190"
                className="absolute inset-0 h-full w-full"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[
                  "M70 0 L60 50 L80 90 L55 140 L70 190",
                  "M0 80 L40 90 L60 50",
                  "M140 110 L100 100 L80 90",
                ].map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    style={{ filter: "drop-shadow(0 0 4px #fff)" }}
                  />
                ))}
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <div className="absolute inset-x-8 top-[310px] flex gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-3 flex-1 rounded-sm"
            animate={{
              background: i < segN ? S : "#ffffff14",
              scaleY: i === segN - 1 ? [1.6, 1] : 1,
            }}
            style={{ boxShadow: i < segN ? `0 0 8px ${S}` : "none" }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-[340px] h-8 text-center">
        <AnimatePresence mode="wait">
          {res === "ok" && (
            <motion.div
              key="ok"
              initial={{ scale: 2.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE.snap }}
              className="font-display text-xl font-black text-bull"
              style={{ textShadow: "0 0 18px #3ddc84" }}
            >
              УСПЕХ!
            </motion.div>
          )}
          {res === "fail" && (
            <motion.div
              key="fail"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 12,
                mass: 1.5,
              }}
              className="font-display text-xl font-black text-bear"
            >
              НЕУДАЧА — уровень сохранён
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="absolute inset-x-0 top-[420px] flex justify-center">
        <HoldButton
          mv={prog}
          ms={1400}
          color={S}
          size={100}
          onStart={() => sfx.suck()}
          onCancel={() => sfx.error()}
          onComplete={resolve}
        >
          <I.bolt size={30} className="text-sky" />
        </HoldButton>
      </div>
      <div className="absolute inset-x-6 bottom-6 text-center text-[10px] text-white/40">
        Удерживай, чтобы заточить. Чем выше уровень, тем ниже шанс.
      </div>
      {g.el}
      <ParticleCanvas canvasRef={p.ref} />
    </div>
  );
}

/* ================================================================
   66 · DETAIL SHEET — шторка с тремя точками привязки
   ================================================================ */
const SNAPS = [470, 250, 70];
const SNAP_N = ["Превью", "Детали", "Полностью"];

export function DetailSheet({ run, cue }: SceneProps) {
  const y = useMotionValue(SNAPS[0]);
  const [snap, setSnap] = useState(0);
  const base = useRef(0);
  const g = useGhost();
  const dim = useTransform(y, [SNAPS[2], SNAPS[0]], [0.7, 0]);
  const bgScale = useTransform(y, [SNAPS[2], SNAPS[0]], [0.9, 1]);
  const radius = useTransform(y, [SNAPS[2], SNAPS[0]], [12, 28]);
  const handleW = useTransform(y, [SNAPS[2], SNAPS[0]], [60, 40]);
  const toSnap = (k: number, v = 0) => {
    const t = clamp(k, 0, 2);
    setSnap(t);
    sfx.snap();
    animate(y, SNAPS[t], {
      type: "spring",
      stiffness: 320,
      damping: 30,
      velocity: v,
    });
  };
  useMotionValueEvent(y, "change", (v) => {
    const k = SNAPS.reduce(
      (b, s, i) => (Math.abs(s - v) < Math.abs(SNAPS[b] - v) ? i : b),
      0,
    );
    if (k !== snap) setSnap(k);
  });
  useScript(run, async (wait) => {
    y.set(SNAPS[0]);
    setSnap(0);
    await wait(600);
    cue();
    g.show(150, SNAPS[0] + 20);
    g.press(true);
    await Promise.all([
      g.move(150, SNAPS[1] + 40, 0.5),
      animate(y, SNAPS[1] + 20, { duration: 0.5 }),
    ]);
    g.press(false);
    toSnap(1);
    await wait(900);
    g.press(true);
    await Promise.all([
      g.move(150, SNAPS[2] + 60, 0.3),
      animate(y, SNAPS[2] + 40, { duration: 0.3 }),
    ]);
    g.press(false);
    toSnap(2);
    await wait(1000);
    await g.move(150, SNAPS[2] + 20, 0.3);
    g.press(true);
    await Promise.all([
      g.move(150, 320, 0.2),
      animate(y, 260, { duration: 0.2 }),
    ]);
    g.press(false);
    toSnap(0, 1500);
    await wait(500);
    g.hide();
  });
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#050811]">
      <motion.div
        className="absolute inset-0 origin-top"
        style={{ scale: bgScale }}
      >
        <SceneBg tint={S} />
        <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
          Инвентарь
        </div>
        <div className="absolute inset-x-4 top-[80px] grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => {
            const Ic = ICONS[i % 6];
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.92 }}
                onClick={() => toSnap(1)}
                className="grid aspect-square place-items-center rounded-2xl border-2"
                style={{
                  borderColor: `${TIER_C[i % 4]}66`,
                  color: TIER_C[i % 4],
                  background: "#0c1428",
                }}
              >
                <Ic size={24} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        style={{ opacity: dim }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 top-0 touch-none bg-gradient-to-b from-[#16223f] to-[#0a1122] shadow-[0_-20px_40px_-10px_#000]"
        style={{ y, borderTopLeftRadius: radius, borderTopRightRadius: radius }}
        onPanStart={() => {
          base.current = y.get();
          y.stop();
        }}
        onPan={(_, i) => {
          let v = base.current + i.offset.y;
          if (v < SNAPS[2]) v = SNAPS[2] - Math.pow(SNAPS[2] - v, 0.7);
          y.set(v);
        }}
        onPanEnd={(_, i) => {
          const proj = y.get() + i.velocity.y * 0.2;
          const k = SNAPS.reduce(
            (b, s, idx) =>
              Math.abs(s - proj) < Math.abs(SNAPS[b] - proj) ? idx : b,
            0,
          );
          toSnap(k, i.velocity.y);
        }}
      >
        <motion.div
          className="mx-auto mt-2.5 h-1.5 rounded-full bg-white/30"
          style={{ width: handleW }}
        />
        <div className="flex items-center gap-3 px-4 pt-3">
          <div
            className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-gold text-gold"
            style={{ background: "#ffc34d1a" }}
          >
            <I.eye size={26} />
          </div>
          <div className="flex-1">
            <div className="text-[9px] font-bold uppercase tracking-[.25em] text-gold">
              Легендарная · IV
            </div>
            <div className="font-display text-lg font-black">Тень рынка</div>
          </div>
          <div className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold">
            {SNAP_N[snap]}
          </div>
        </div>
        <div className="space-y-2 px-4 pt-4">
          {[
            ["Сила", 92],
            ["Точность", 78],
            ["Хладнокровие", 85],
          ].map(([l, v], i) => (
            <div key={l as string}>
              <div className="flex justify-between text-[11px]">
                <span className="text-white/55">{l}</span>
                <span className="font-bold">{v}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gold"
                  animate={{ width: snap > 0 ? `${v}%` : "0%" }}
                  transition={{
                    delay: snap > 0 ? i * 0.06 : 0,
                    duration: 0.6,
                    ease: EASE.outExpo,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pt-5">
          <div className="text-[9px] font-bold uppercase tracking-[.25em] text-white/40">
            История
          </div>
          {[
            "Получена из пака «Сезон 3»",
            "Заточена до +4",
            "Использована в 38 боях",
            "Лучший урон: 420",
          ].map((t, i) => (
            <motion.div
              key={t}
              className="mt-2 flex items-center gap-2 rounded-xl bg-white/[.04] px-3 py-2 text-[11px] text-white/70"
              animate={{
                opacity: snap === 2 ? 1 : 0.3,
                x: snap === 2 ? 0 : 20,
              }}
              transition={{ delay: snap === 2 ? i * 0.05 : 0, ...SPRING.panel }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {t}
            </motion.div>
          ))}
        </div>
      </motion.div>
      {g.el}
    </div>
  );
}

/* ================================================================
   90 · ITEM COMPARE — шторка между двумя картами + дельты
   ================================================================ */
const CMP = [
  ["Сила", 72, 88],
  ["Точность", 81, 64],
  ["Скорость", 55, 79],
  ["Защита", 68, 70],
] as const;

export function ItemCompare({ run, cue }: SceneProps) {
  const split = useMotionValue(0.5);
  const [sv, setSv] = useState(0.5);
  const base = useRef(0);
  const g = useGhost();
  const W = 268;
  useMotionValueEvent(split, "change", setSv);
  const divX = useTransform(split, (v) => v * W);
  const clipA = useTransform(split, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const bWins = CMP.filter(([, a, b]) => b > a).length;
  useScript(run, async (wait) => {
    split.set(0.5);
    await wait(600);
    cue();
    g.show(16 + 0.5 * W, 200);
    g.press(true);
    for (const to of [0.15, 0.85, 0.5]) {
      await Promise.all([
        g.move(16 + to * W, 200, 0.7),
        animate(split, to, { duration: 0.7, ease: EASE.camera }),
      ]);
      await wait(500);
    }
    g.press(false);
    g.hide();
  });
  const focusA = sv > 0.6;
  const focusB = sv < 0.4;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SceneBg tint={S} />
      <div className="absolute inset-x-4 top-11 font-display text-sm font-black">
        Сравнение карт
      </div>
      <div
        className="absolute left-4 top-[84px] h-[220px] overflow-hidden rounded-2xl border border-white/10"
        style={{ width: W }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(160deg,#ffc34d33,#0c1428 60%)",
          }}
        >
          <img
            src={hood}
            className="mask-bottom h-[160px] w-full object-cover"
            style={{ filter: "hue-rotate(160deg)" }}
          />
          <div className="absolute bottom-3 right-3 text-right">
            <div className="text-[9px] font-bold tracking-[.2em] text-gold">
              Б · ЭПИК
            </div>
            <div className="font-display text-sm font-black">Импульс</div>
          </div>
        </div>
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: clipA,
            background: `linear-gradient(160deg, ${S}33, #0c1428 60%)`,
          }}
        >
          <img
            src={hood}
            className="mask-bottom h-[160px] w-full object-cover"
          />
          <div className="absolute bottom-3 left-3">
            <div
              className="text-[9px] font-bold tracking-[.2em]"
              style={{ color: S }}
            >
              А · ЛЕГЕНДА
            </div>
            <div className="font-display text-sm font-black">Тень рынка</div>
          </div>
        </motion.div>
        <motion.div
          className="absolute inset-y-0 -ml-5 w-10 cursor-ew-resize touch-none"
          style={{ x: divX }}
          onPanStart={() => {
            base.current = split.get();
            sfx.tap();
          }}
          onPan={(_, i) =>
            split.set(clamp(base.current + i.offset.x / W, 0.05, 0.95))
          }
        >
          <div className="absolute inset-y-0 left-1/2 w-0.5 -ml-px bg-white shadow-[0_0_10px_#fff]" />
          <div className="absolute left-1/2 top-1/2 grid h-8 w-8 -ml-4 -mt-4 place-items-center rounded-full bg-white text-[10px] font-black text-black">
            VS
          </div>
        </motion.div>
      </div>
      <div className="absolute inset-x-4 top-[318px] space-y-2">
        {CMP.map(([n, a, b]) => {
          const d = b - a;
          return (
            <div key={n} className="glass rounded-xl p-2">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span
                  className={focusA ? "text-white" : "text-white/50"}
                  style={{ color: a > b ? S : undefined }}
                >
                  {a}
                </span>
                <span className="text-white/60">{n}</span>
                <span
                  className={focusB ? "text-white" : "text-white/50"}
                  style={{ color: b > a ? "#ffc34d" : undefined }}
                >
                  {b}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1">
                <div className="flex h-1.5 flex-1 justify-end overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${a}%`, opacity: focusB ? 0.35 : 1 }}
                    style={{ background: S }}
                  />
                </div>
                <motion.span
                  className="w-8 text-center font-mono text-[9px] font-black"
                  animate={{ scale: focusA || focusB ? 1.2 : 1 }}
                  style={{ color: d > 0 ? "#ffc34d" : S }}
                >
                  {d > 0 ? `+${d}` : d}
                </motion.span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${b}%`, opacity: focusA ? 0.35 : 1 }}
                    style={{ background: "#ffc34d" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-x-4 bottom-6 text-center text-[11px] font-bold text-white/70">
        Б лучше в <Roll value={bWins} color="#ffc34d" /> из {CMP.length}
      </div>
      {g.el}
    </div>
  );
}

/* ================================================================
   META
   ================================================================ */
export const SET_INV: Category = {
  id: "inventory",
  n: "20",
  title: "Инвентарь",
  en: "Merge · Sort FLIP · Upgrade · Sheet",
  color: S,
  blurb:
    "Инвентарь как игровая механика: слияние карт перетаскиванием, сортировка с каскадным FLIP, заточка удержанием с риском неудачи и шторка деталей с тремя точками привязки.",
  scenes: [
    {
      id: "merge",
      n: "63",
      title: "Слияние карт",
      kind: "Drag & merge",
      lead: "Карту перетаскивают на такую же — обе сливаются в карту уровнем выше: вспышка в ячейке, кольцо и звёзды её нового цвета. Можно двигать в пустые клетки. Неподходящая цель — карта возвращается на место и звучит отказ. Слияние в четвёртый уровень трясёт экран.",
      secrets: [
        "dragSnapToOrigin + layoutId: неудачный дроп возвращает карту пружиной, удачный — карта «перетекает» в новую ячейку по layout.",
        "Цель ищется по ближайшему центру ячейки и порогу 70% ширины — палец не обязан попадать точно.",
        "whileDrag: scale 1.15, rotate −6°, тень цвета редкости. Взятая карта парит над остальными.",
        "Цвет эффекта слияния = цвет НОВОГО уровня. Игрок видит результат ещё до того, как прочтёт цифру.",
        "Тряска только на четвёртом уровне — редкая эмоция для редкого события.",
      ],
      tracks: [
        { label: "I + I → II", start: 600, dur: 900, color: "#4cc3ff" },
        { label: "II + II → III", start: 1900, dur: 900, color: "#9b7bff" },
        { label: "II + II → III", start: 3200, dur: 900, color: "#9b7bff" },
      ],
      total: 4400,
      ease: { bez: EASE.overshoot, label: "overshoot — новая карта" },
      code: `<motion.div layoutId={\`m\${c.id}\`} drag dragSnapToOrigin
  whileDrag={{ scale: 1.15, rotate: -6, zIndex: 50 }}
  onDragEnd={(_, i) => onDrop(c.id, i.point.x, i.point.y)} />

if (b.kind === a.kind && b.tier === a.tier)
  grid[to] = { id: next++, kind: a.kind, tier: a.tier + 1 };  // новая карта`,
      C: MergeCards,
      interactive: "Перетаскивай одинаковые карты",
    },
    {
      id: "sortflip",
      n: "64",
      title: "Сортировка FLIP",
      kind: "Layout reorder",
      lead: "Сегмент сортировки переставляет 12 предметов — каждый перелетает на новое место с каскадной задержкой. Фильтры по редкости убирают предметы с поворотом и сжатием, остальные смыкаются. Счётчик прокручивается.",
      secrets: [
        "layout-проп — вся FLIP-математика бесплатно. Задержка = новый индекс × 25мс: перестановка идёт волной.",
        "AnimatePresence mode=popLayout: удаляемый элемент сразу выходит из потока, соседи смыкаются одновременно с его исчезновением.",
        "Выход с rotate 20° и scale 0.3 за 200мс — элемент «сдувается», не мешая перестановке.",
        "Подпись в углу меняется по режиму (уровень / сила / NEW) — сортировка объясняет сама себя.",
        "Кнопки фильтра анимируют бордер, цвет и фон — выключенная редкость визуально «гаснет».",
      ],
      tracks: [
        { label: "Сорт: сила", start: 900, dur: 700, color: S },
        { label: "Сорт: новые", start: 2500, dur: 700, color: S },
        { label: "Фильтр I", start: 4200, dur: 500, color: "#cfd8ea" },
        { label: "Фильтр II", start: 5500, dur: 500, color: "#4cc3ff" },
      ],
      total: 6800,
      ease: { bez: EASE.outExpo, label: "≈ spring 380/26" },
      code: `<AnimatePresence mode="popLayout">
  {sorted.map((it, i) => (
    <motion.div key={it.id} layout
      exit={{ opacity: 0, scale: .3, rotate: 20, transition: { duration: .2 } }}
      transition={{ type: "spring", stiffness: 380, damping: 26, delay: i * .025 }} />
  ))}
</AnimatePresence>`,
      C: SortFlip,
      interactive: "Сортируй и фильтруй",
    },
    {
      id: "upgrade",
      n: "65",
      title: "Заточка удержанием",
      kind: "Risky hold",
      lead: "Удержание заряжает 10 сегментов с повышающимся тоном, карта светится и растёт, после 70% начинает дрожать. Успех — фанфары, звёзды, уровень прокручивается. Неудача — трещины рисуются по карте, звук стекла, тяжёлое падение надписи.",
      secrets: [
        "Шанс виден ДО действия и падает с уровнем — риск честный, эмоция от неудачи оправдана.",
        "10 сегментов с combo-звуком на каждом: удержание звучит как нарастающая гамма.",
        "Дрожь только после 70% — финальный отрезок самый напряжённый.",
        "Неудача не отбирает уровень («уровень сохранён») — драма без фрустрации.",
        "Надпись неудачи падает пружиной с mass 1.5 — тяжело, разочарование ощущается физически.",
      ],
      tracks: [
        { label: "Удержание 1", start: 600, dur: 1400, color: S },
        { label: "Успех + звёзды", start: 2100, dur: 700, color: "#3ddc84" },
        { label: "Удержание 2", start: 3700, dur: 1400, color: S },
        { label: "Трещины + стекло", start: 5200, dur: 600, color: "#ff4d5e" },
      ],
      total: 6400,
      ease: { bez: EASE.snap, label: "snap — УСПЕХ" },
      code: `const seg = useTransform(prog, v => Math.floor(v * 10));
useMotionValueEvent(seg, "change", s => sfx.combo(s));       // гамма
const jit = useTransform(prog, v => v > .7 ? (Math.random() - .5) * (v - .7) * 16 : 0);

ok ? (sfx.levelup(), stars())
   : (sfx.shatter(), drawCracks(), shake(.8));`,
      C: UpgradeHold,
      interactive: "Удерживай молнию",
    },
    {
      id: "sheet",
      n: "66",
      title: "Шторка с точками привязки",
      kind: "Bottom sheet",
      lead: "Шторка деталей предмета имеет три положения: превью, детали и полный экран. Её тянут пальцем, на отпускании скорость проецируется к ближайшей точке. Фон при подъёме сжимается и темнеет, скругление углов уменьшается, ручка расширяется, контент раскрывается по уровням.",
      secrets: [
        "Снэп по проекции: y + v·0.2 → ближайшая точка из [470, 250, 70]; пружина получает velocity жеста.",
        "Фон — iOS-модальный язык: scale 1 → 0.9 и затемнение 0 → 0.7 как функции позиции шторки.",
        "Скругление углов 28 → 12 и ширина ручки 40 → 60 — шторка «становится экраном» по мере подъёма.",
        "Контент раскрывается по порогам: статы на «деталях», история — только на полном экране.",
        "Rubber-band выше верхней точки — шторку можно потянуть, но она не отрывается.",
      ],
      tracks: [
        { label: "→ Детали", start: 600, dur: 700, color: S },
        { label: "Статы растут", start: 1100, dur: 600, color: "#ffc34d" },
        { label: "→ Полностью", start: 2200, dur: 500, color: S },
        { label: "История каскадом", start: 2500, dur: 500, color: "#ffc34d" },
        { label: "Флик вниз", start: 3700, dur: 600, color: "#ff4d5e" },
      ],
      total: 4600,
      ease: { bez: EASE.outExpo, label: "≈ spring 320/30" },
      code: `const dim     = useTransform(y, [TOP, PEEK], [.7, 0]);
const bgScale = useTransform(y, [TOP, PEEK], [.9, 1]);
const radius  = useTransform(y, [TOP, PEEK], [12, 28]);
onPanEnd={(_, i) => {
  const proj = y.get() + i.velocity.y * .2;
  const k = nearest(SNAPS, proj);
  animate(y, SNAPS[k], { type: "spring", stiffness: 320, damping: 30, velocity: i.velocity.y });
}}`,
      C: DetailSheet,
      interactive: "Тяни шторку",
    },
    {
      id: "compare",
      n: "90",
      title: "Сравнение предметов",
      kind: "Compare divider",
      lead: "Две карты делят одно окно: разделитель «VS» тянут пальцем, открывая одну или другую. Ниже — строки характеристик с зеркальными полосами и дельтами. Сторона, к которой сдвинут разделитель, получает фокус: её полосы ярче, чужие гаснут.",
      secrets: [
        "Одна рамка на два предмета: clip-path верхнего слоя от позиции разделителя. Сравнение без переключений.",
        "Зеркальные полосы растут от центра в разные стороны — разница видна как асимметрия.",
        "Фокус следует за разделителем: сдвинул к карте — её данные выходят на первый план (opacity 1 против 0.35).",
        "Дельта окрашивается цветом победителя строки и слегка увеличивается в режиме фокуса.",
        "Итог «Б лучше в N из 4» — синтез без необходимости читать все числа.",
      ],
      tracks: [
        { label: "→ Б", start: 600, dur: 700, color: "#ffc34d" },
        { label: "→ А", start: 1800, dur: 700, color: S },
        { label: "Центр", start: 3000, dur: 700, color: "#ffffff" },
      ],
      total: 3900,
      ease: { bez: EASE.camera, label: "camera — разделитель" },
      code: `const clipA = useTransform(split, v => \`inset(0 \${(1 - v) * 100}% 0 0)\`);
<Card b />
<motion.div style={{ clipPath: clipA }}><Card a /></motion.div>
<motion.div animate={{ width: \`\${a}%\`, opacity: focusB ? .35 : 1 }} />`,
      C: ItemCompare,
      interactive: "Тяни разделитель VS",
    },
  ],
};
