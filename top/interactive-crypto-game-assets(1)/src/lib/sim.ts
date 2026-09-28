import { useEffect, useRef, useState } from "react";

export type Coin = {
  sym: string; name: string; price: number; chg: number; vol: string;
  color: string; spark: number[]; icon: string;
};

const baseCoins: Coin[] = [
  { sym: "BTC", name: "Bitcoin", price: 97432, chg: 2.84, vol: "$48.2B", color: "#F7931A", spark: [], icon: "₿" },
  { sym: "ETH", name: "Ethereum", price: 3841, chg: 1.92, vol: "$21.7B", color: "#627EEA", spark: [], icon: "Ξ" },
  { sym: "SOL", name: "Solana", price: 214.6, chg: -1.24, vol: "$5.9B", color: "#14F195", spark: [], icon: "◎" },
  { sym: "BNB", name: "BNB Chain", price: 692.1, chg: 0.64, vol: "$2.1B", color: "#F0B90B", spark: [], icon: "⬢" },
  { sym: "DOGE", name: "Dogecoin", price: 0.3214, chg: 5.41, vol: "$3.4B", color: "#C2A633", spark: [], icon: "Ð" },
  { sym: "TON", name: "Toncoin", price: 5.842, chg: -0.82, vol: "$412M", color: "#0098EA", spark: [], icon: "◈" },
];

function genSpark(seed: number, trend: number) {
  const arr: number[] = []; let v = 50 + seed;
  for (let i = 0; i < 28; i++) { v += (Math.random() - 0.48 + trend * 0.04) * 8; arr.push(v); }
  return arr;
}
baseCoins.forEach((c, i) => { c.spark = genSpark(i * 7, c.chg); });

export function useMarket(live = true, interval = 1400) {
  const [coins, setCoins] = useState<Coin[]>(baseCoins);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setCoins(prev => prev.map(c => {
        const drift = (Math.random() - 0.5) * 0.006;
        const price = c.price * (1 + drift);
        const chg = c.chg + drift * 100 * 0.6;
        const spark = [...c.spark.slice(1), c.spark[c.spark.length - 1] + drift * 900];
        return { ...c, price, chg, spark };
      }));
      setTick(t => t + 1);
    }, interval);
    return () => clearInterval(id);
  }, [live, interval]);
  return { coins, tick };
}

export type Candle = { o: number; h: number; l: number; c: number; v: number };

export function genCandles(n: number, start = 100): Candle[] {
  const out: Candle[] = []; let p = start;
  for (let i = 0; i < n; i++) {
    const o = p;
    const drift = (Math.random() - 0.47) * 4;
    const c = o + drift;
    const h = Math.max(o, c) + Math.random() * 1.8;
    const l = Math.min(o, c) - Math.random() * 1.8;
    out.push({ o, h, l, c, v: 20 + Math.random() * 80 });
    p = c;
  }
  return out;
}

export function useCandles(count = 42) {
  const [candles, setCandles] = useState<Candle[]>(() => genCandles(count));
  const [playing, setPlaying] = useState(true);
  const [price, setPrice] = useState(97432);
  const [pnlTick, setPnlTick] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) return;
    ref.current = window.setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.48) * 2.4;
        const nc = last.c + drift * 0.35;
        const updated: Candle = {
          o: last.o, h: Math.max(last.h, nc), l: Math.min(last.l, nc), c: nc,
          v: last.v + Math.random() * 6,
        };
        if (Math.random() > 0.72) {
          const o = last.c;
          const c = o + (Math.random() - 0.48) * 3;
          return [...prev.slice(1), updated, { o, h: Math.max(o, c) + 1, l: Math.min(o, c) - 1, c, v: 25 }];
        }
        return [...prev.slice(0, -1), updated];
      });
      setPrice(p => p * (1 + (Math.random() - 0.5) * 0.0022));
      setPnlTick(t => t + 1);
    }, 700);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [playing]);
  return { candles, playing, setPlaying, price, pnlTick };
}

export function useCountUp(target: number, dur = 1200, deps: unknown[] = []) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setVal(target * e);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, ...deps]);
  return val;
}

export function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function fmtCompact(n: number) {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: n > 10000 ? 0 : 1 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}
