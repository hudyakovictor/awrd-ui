import { useState } from "react";
import { Asset, Badge, Btn3D, Section, Segmented } from "../components/ui";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { haptic, sfx } from "../utils/sfx";

/* =========================================================
   1. COLOR BLINDNESS SIMULATION (CVD FILTERS)
   ========================================================= */
type CvdType = "normal" | "deuteranopia" | "protanopia" | "tritanopia" | "achromatopsia";

function ColorBlindnessFilter() {
  const [cvd, setCvd] = useState<CvdType>("normal");

  const filterMatrix: Record<CvdType, string> = {
    normal: "none",
    deuteranopia: "url(#cvd-deuteranopia)",
    protanopia: "url(#cvd-protanopia)",
    tritanopia: "url(#cvd-tritanopia)",
    achromatopsia: "grayscale(100%)",
  };

  return (
    <Asset title="Color Vision Deficiency (CVD)" id="acc.cvd" desc="Симуляция дальтонизма (Дейтеранопия, Протанопия, Тританопия, Ахроматопсия): графики и сигналы остаются различимы благодаря форме и контрасту." className="lg:col-span-2" tags={["WCAG"]}>
      {/* SVG Color Matrix Filters */}
      <svg className="hidden">
        <defs>
          <filter id="cvd-deuteranopia">
            <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0   0.7, 0.3, 0, 0, 0   0, 0.3, 0.7, 0, 0   0, 0, 0, 1, 0" />
          </filter>
          <filter id="cvd-protanopia">
            <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0   0.558, 0.442, 0, 0, 0   0, 0.242, 0.758, 0, 0   0, 0, 0, 1, 0" />
          </filter>
          <filter id="cvd-tritanopia">
            <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0   0, 0.433, 0.567, 0, 0   0, 0.475, 0.525, 0, 0   0, 0, 0, 1, 0" />
          </filter>
        </defs>
      </svg>

      <Segmented
        value={cvd}
        onChange={(v) => {
          setCvd(v as CvdType);
          sfx.tick();
        }}
        size="sm"
        className="mb-3"
        options={[
          { value: "normal", label: "Normal" },
          { value: "deuteranopia", label: "Deuter" },
          { value: "protanopia", label: "Protan" },
          { value: "tritanopia", label: "Tritan" },
          { value: "achromatopsia", label: "Mono" },
        ]}
      />

      <div
        className="inset !rounded-2xl p-4 transition-all"
        style={{ filter: filterMatrix[cvd] }}
      >
        <div className="flex justify-between items-center mb-3">
          <Badge tone="bull" dot>Profit Target Hit (+14.2%)</Badge>
          <Badge tone="bear">Stop Loss Triggered (-2.1%)</Badge>
        </div>

        {/* Chart with dual shape & color encoding */}
        <div className="flex gap-2 items-end h-20">
          {[
            { up: true, h: 45 },
            { up: true, h: 65 },
            { up: false, h: 30 },
            { up: true, h: 80 },
            { up: false, h: 50 },
            { up: true, h: 95 },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-extrabold mb-1">
                {bar.up ? "▲" : "▼"}
              </span>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${bar.h}%`,
                  backgroundColor: bar.up ? "#1fdb8b" : "#ff4d6a",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   2. TOUCH TARGET INSPECTOR
   ========================================================= */
function TouchTargetInspector() {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <Asset title="Touch Target Inspector" id="acc.target" desc="Проверка зон нажатия по стандартам WCAG 2.5.5 / 2.5.8 (минимум 48×48px): подсветка фактических хитбоксов вокруг кнопок." className="lg:col-span-1" tags={["A11Y"]}>
      <div className="inset !rounded-2xl p-4 flex flex-col items-center">
        <div className="flex gap-4 items-center justify-center h-32 relative">
          {/* Target 1: 48x48 icon */}
          <div className="relative">
            {showOverlay && (
              <div className="absolute -inset-2 rounded-xl border border-dashed border-bull/70 bg-bull/10 pointer-events-none grid place-items-center">
                <span className="absolute -top-3 text-[8.5px] font-extrabold text-bull bg-ink-900 px-1">48x48 PASS</span>
              </div>
            )}
            <Btn3D round size="sm" variant="blue" className="w-10">
              <Icon name="bell" size={16} />
            </Btn3D>
          </div>

          {/* Target 2: Button */}
          <div className="relative">
            {showOverlay && (
              <div className="absolute -inset-2 rounded-xl border border-dashed border-bull/70 bg-bull/10 pointer-events-none">
                <span className="absolute -top-3 text-[8.5px] font-extrabold text-bull bg-ink-900 px-1">PASS</span>
              </div>
            )}
            <Btn3D size="sm" variant="bull">
              Trade Long
            </Btn3D>
          </div>
        </div>

        <Btn3D size="xs" variant="neutral" full onClick={() => setShowOverlay(!showOverlay)}>
          {showOverlay ? "Hide Hitbox Overlay" : "Show 48x48 Hitboxes"}
        </Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   3. SCREEN READER LIVE REGION LOG
   ========================================================= */
function ScreenReaderAudit() {
  const [logs, setLogs] = useState<string[]>([
    "Урок 'Японские свечи' загружен. Вопрос 1 из 5.",
    "Выбран ответ: Hammer. Верно! Зачислено +10 XP.",
    "Серия дней увеличена до 48.",
  ]);

  const triggerAnnouncement = (text: string) => {
    setLogs((prev) => [text, ...prev.slice(0, 4)]);
    sfx.pop();
    haptic(6);
  };

  return (
    <Asset title="Screen Reader Live Region" id="acc.sr" desc="Журнал голосовых сообщений VoiceOver / TalkBack (aria-live='polite'): каждое событие озвучивается доступным текстом." className="lg:col-span-1" tags={["ARIA"]}>
      <div className="inset !rounded-2xl p-3 space-y-1.5 h-36 overflow-y-auto">
        <div aria-live="polite" className="space-y-1 text-[11px] font-semibold text-mute">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-1.5 anim-fade">
              <span className="text-blue font-bold">›</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Btn3D size="xs" variant="neutral" full onClick={() => triggerAnnouncement("Ордер исполнен: покупка 0.05 BTC")}>
          Announce Buy
        </Btn3D>
        <Btn3D size="xs" variant="neutral" full onClick={() => triggerAnnouncement("Ошибка: недостаточно маржи")}>
          Announce Error
        </Btn3D>
      </div>
    </Asset>
  );
}

/* =========================================================
   4. HAPTIC CALIBRATION BENCH
   ========================================================= */
function HapticCalibrationBench() {
  const [duration, setDuration] = useState(15);

  const testVibe = (pattern: number | number[]) => {
    haptic(pattern);
    sfx.tick();
  };

  return (
    <Asset title="Haptic Calibration Bench" id="acc.haptic" desc="Калибровочный стенд тактильной отдачи: настраивайте миллисекунды импульса и тестируйте последовательности вибраций." className="lg:col-span-1" tags={["HAPTIC"]}>
      <div className="inset !rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center text-[11px] font-bold text-mute">
          <span>Pulse Length:</span>
          <span className="num text-txt font-extrabold">{duration}ms</span>
        </div>
        <input
          type="range"
          min="5"
          max="80"
          value={duration}
          onChange={(e) => setDuration(+e.target.value)}
          className="w-full accent-blue"
        />

        <div className="grid grid-cols-3 gap-1.5">
          <Btn3D size="xs" variant="neutral" onClick={() => testVibe(duration)}>
            Single ({duration}ms)
          </Btn3D>
          <Btn3D size="xs" variant="gold" onClick={() => testVibe([duration, 20, duration])}>
            Double
          </Btn3D>
          <Btn3D size="xs" variant="bull" onClick={() => testVibe([10, 20, 30, 40])}>
            Staccato
          </Btn3D>
        </div>
      </div>
    </Asset>
  );
}

/* =========================================================
   5. DYSLEXIA-FRIENDLY & SCALING DIAL
   ========================================================= */
function TypographyDial() {
  const [fontScale, setFontScale] = useState(100);
  const [isMono, setIsMono] = useState(false);

  return (
    <Asset title="Dynamic Font Scaling" id="acc.type" desc="Масштабирование текста (от 80% до 140%) и переключение моноширинного шрифта для удобства чтения при дислексии." className="lg:col-span-1" tags={["A11Y"]}>
      <div className="inset !rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center text-[11px] font-bold text-mute">
          <span>Размер шрифта:</span>
          <span className="num text-txt font-extrabold">{fontScale}%</span>
        </div>
        <input
          type="range"
          min="80"
          max="140"
          step="5"
          value={fontScale}
          onChange={(e) => setFontScale(+e.target.value)}
          className="w-full accent-blue"
        />

        <div
          className={cn("p-2 rounded-lg bg-white/5 leading-snug transition-all", isMono ? "font-mono" : "font-sans")}
          style={{ fontSize: `${(13 * fontScale) / 100}px` }}
        >
          Рыночная цена определяется балансом спроса и предложения.
        </div>

        <Btn3D size="xs" variant={isMono ? "bull" : "neutral"} full onClick={() => setIsMono(!isMono)}>
          {isMono ? "Monospace Active" : "Enable Monospace"}
        </Btn3D>
      </div>
    </Asset>
  );
}

export default function AccessibilityLab() {
  return (
    <Section id="accessibility" index="18" title="Accessibility & Game Feel" subtitle="5 лабораторий доступности: симуляция дальтонизма (CVD), инспектор зон нажатия 48px, чтец экрана aria-live, калибровка вибро, масштабирование шрифта" count={5}>
      <div className="grid lg:grid-cols-3 gap-6">
        <ColorBlindnessFilter />
        <TouchTargetInspector />
        <ScreenReaderAudit />
        <HapticCalibrationBench />
        <TypographyDial />
      </div>
    </Section>
  );
}
