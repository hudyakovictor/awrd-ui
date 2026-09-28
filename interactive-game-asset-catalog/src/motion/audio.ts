// ============================================================
//  GAME AUDIO + HAPTICS — синтез звука в рантайме, без файлов
//  Секрет: звук — это 50% «сочности». Удар без низкого
//  «бух» ощущается как анимация, а не как событие.
//  Всё генерируется WebAudio: 0 КБ ассетов.
// ============================================================

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let comp: DynamicsCompressorNode | null = null;
let on = false;
let noiseBuf: AudioBuffer | null = null;

export function getSound() {
  return on;
}

export function setSound(v: boolean) {
  on = v;
  if (v) {
    ensure();
    void ctx?.resume();
    // короткий «клик включения» — подтверждение жеста
    sfx.tap();
  }
}

function ensure() {
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.ratio.value = 6;
  master = ctx.createGain();
  master.gain.value = 0.42;
  master.connect(comp);
  comp.connect(ctx.destination);
  return ctx;
}

function getNoise(c: AudioContext) {
  if (noiseBuf) return noiseBuf;
  const len = Math.floor(c.sampleRate * 1.2);
  noiseBuf = c.createBuffer(1, len, c.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

interface ToneOpts {
  f: number;
  f2?: number;
  d: number;
  type?: OscillatorType;
  g?: number;
  delay?: number;
  attack?: number;
  detune?: number;
}
function tone(o: ToneOpts) {
  if (!on) return;
  const c = ensure();
  if (!c || !master) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const gn = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + o.d);
  if (o.detune) osc.detune.value = o.detune;
  const g = o.g ?? 0.2;
  const a = o.attack ?? 0.004;
  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.exponentialRampToValueAtTime(g, t0 + a);
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + o.d);
  osc.connect(gn);
  gn.connect(master);
  osc.start(t0);
  osc.stop(t0 + o.d + 0.03);
}

interface NoiseOpts {
  d: number;
  g?: number;
  f?: number;
  f2?: number;
  q?: number;
  delay?: number;
  type?: BiquadFilterType;
}
function noise(o: NoiseOpts) {
  if (!on) return;
  const c = ensure();
  if (!c || !master) return;
  const t0 = c.currentTime + (o.delay ?? 0);
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  src.loop = true;
  const bq = c.createBiquadFilter();
  bq.type = o.type ?? "bandpass";
  bq.Q.value = o.q ?? 1;
  bq.frequency.setValueAtTime(o.f ?? 800, t0);
  if (o.f2) bq.frequency.exponentialRampToValueAtTime(Math.max(60, o.f2), t0 + o.d);
  const gn = c.createGain();
  const g = o.g ?? 0.15;
  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.exponentialRampToValueAtTime(g, t0 + 0.006);
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + o.d);
  src.connect(bq);
  bq.connect(gn);
  gn.connect(master);
  src.start(t0);
  src.stop(t0 + o.d + 0.03);
}

/**
 * SFX-библиотека. Каждому событию интерфейса — свой «тембр».
 * Правило: UI-звук короче 200мс, гейн ниже 0.35, никакой реверберации.
 */
export const sfx = {
  /** Тихий клик — любой тап. Никогда не бывает громким. */
  tap() {
    tone({ f: 1250, f2: 900, d: 0.05, type: "triangle", g: 0.1 });
    noise({ d: 0.03, g: 0.05, f: 3200 });
  },
  /** Свайп / перелистывание — воздух. */
  whoosh(dir: 1 | -1 = 1) {
    noise({ d: 0.24, g: 0.1, f: dir > 0 ? 400 : 2200, f2: dir > 0 ? 2400 : 300, q: 0.8, type: "bandpass" });
  },
  /** Взлёт / полёт карты. */
  fly() {
    tone({ f: 320, f2: 1400, d: 0.22, type: "sawtooth", g: 0.07 });
    noise({ d: 0.22, g: 0.07, f: 600, f2: 3000, q: 1.2 });
  },
  /** Заряд перед событием. */
  charge(dur = 0.5) {
    tone({ f: 110, f2: 660, d: dur, type: "sawtooth", g: 0.09 });
    noise({ d: dur, g: 0.05, f: 200, f2: 2600, q: 1.5 });
  },
  /** Удар: низкий «бух» + щелчок. Низ — обязательный слой. */
  impact(heavy = 1) {
    tone({ f: 150 * heavy, f2: 42, d: 0.34, type: "sine", g: 0.4 });
    tone({ f: 900, f2: 180, d: 0.09, type: "square", g: 0.12 });
    noise({ d: 0.16, g: 0.22, f: 1600, f2: 220, q: 0.6, type: "lowpass" });
    buzz([26, 24, 42]);
  },
  /** Критический удар — слой металла поверх. */
  crit() {
    sfx.impact(0.85);
    [1568, 2093, 2637].forEach((f, i) => tone({ f, d: 0.22, type: "triangle", g: 0.12, delay: i * 0.035 }));
    buzz([40, 20, 70, 20, 90]);
  },
  /** Монета — пара нот в высокой октаве. */
  coin(i = 0) {
    tone({ f: 987.77, d: 0.07, type: "square", g: 0.09, delay: i * 0.045 });
    tone({ f: 1318.5, d: 0.14, type: "square", g: 0.08, delay: i * 0.045 + 0.05 });
  },
  /** Тик таймера / детент слайдера. */
  tick(hi = false) {
    tone({ f: hi ? 1760 : 1100, d: 0.03, type: "square", g: 0.06 });
    if (hi) buzz(12);
  },
  /** Успех — мажорная терция. */
  success() {
    [523.25, 659.25, 783.99].forEach((f, i) => tone({ f, d: 0.3, type: "triangle", g: 0.11, delay: i * 0.07 }));
    buzz([18, 40, 30]);
  },
  /** Уровень / rarity-ап — арпеджио вверх. */
  level() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
      tone({ f, d: 0.34, type: "triangle", g: 0.12, delay: i * 0.075 }),
    );
    tone({ f: 130.8, f2: 65, d: 0.6, type: "sine", g: 0.3 });
    buzz([30, 30, 30, 30, 120]);
  },
  /** Ошибка — низкий диссонанс, без «агрессии». */
  error() {
    tone({ f: 233, f2: 155, d: 0.3, type: "sawtooth", g: 0.13 });
    tone({ f: 246, f2: 164, d: 0.3, type: "sawtooth", g: 0.1, detune: 14 });
    buzz([60, 40, 60]);
  },
  /** Разблокировка узла — «пинг» с эхом. */
  unlock() {
    tone({ f: 880, d: 0.16, type: "triangle", g: 0.14 });
    tone({ f: 1320, d: 0.22, type: "triangle", g: 0.09, delay: 0.06 });
    tone({ f: 1760, d: 0.3, type: "sine", g: 0.06, delay: 0.12 });
    buzz(24);
  },
  /** Опасность / угроза. */
  alarm() {
    tone({ f: 440, f2: 880, d: 0.16, type: "square", g: 0.1 });
    tone({ f: 440, f2: 880, d: 0.16, type: "square", g: 0.1, delay: 0.2 });
    buzz([90, 60, 90]);
  },
};

/** Хаптика. Длинные паттерны только для крупных событий. */
export function buzz(pattern: number | number[]) {
  if (!on) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* игнорируем */
    }
  }
}
