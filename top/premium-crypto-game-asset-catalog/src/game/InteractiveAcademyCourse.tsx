import React, { useState } from "react";
import { soundFx } from "../sound/soundEngine";
import { Icon } from "../components/icons";

interface LessonStep {
  id: string;
  title: string;
  summary: string;
  visualGraphic: "candlestick" | "support_line" | "trend_line" | "breakout";
  keyTakeaway: string;
}

export const InteractiveAcademyCourse: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps: LessonStep[] = [
    {
      id: "step-1",
      title: "Module 1: The Anatomy of a Japanese Candlestick",
      summary: "Every candle maps four core points: Open, High, Low, and Close over your chosen timeframe. The colored body shows who won the round.",
      visualGraphic: "candlestick",
      keyTakeaway: "Green candles = buyers pushed price up from open to close. Red candles = sellers dominated the auction.",
    },
    {
      id: "step-2",
      title: "Module 2: Identifying Horizontal Support & Resistance",
      summary: "Support is the price floor where institutional buyers accumulate. Resistance is the ceiling where limit sellers distribute.",
      visualGraphic: "support_line",
      keyTakeaway: "When strong resistance is broken with high volume, it flips into new future support.",
    },
    {
      id: "step-3",
      title: "Module 3: Trend Structure & Market Flow",
      summary: "Uptrends create Higher Highs (HH) and Higher Lows (HL). Downtrends form Lower Highs (LH) and Lower Lows (LL).",
      visualGraphic: "trend_line",
      keyTakeaway: "Never fight the macro trend. Trading with trend structure provides asymmetric risk-to-reward.",
    },
    {
      id: "step-4",
      title: "Module 4: The Breakout & Retest Confirmation",
      summary: "Amateurs buy the first breakout candle and get trapped by fakeouts. Professionals wait for the first successful retest.",
      visualGraphic: "breakout",
      keyTakeaway: "The highest probability entry is buying the pullback to retest the broken level with low volume.",
    },
  ];

  const current = steps[activeStep];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl sf-raised hairline-strong p-6 overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-navy-700/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl sf-inset flex items-center justify-center border border-navy-600/40 text-aqua">
            <Icon name="book" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-white text-xl">Interactive Trading Academy</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-navy-800 text-aqua border border-aqua/30 uppercase tracking-widest">
                Core Curriculum
              </span>
            </div>
            <p className="text-ink-400 text-xs">Structured pedagogical steps from candlestick basics to institutional orderflow</p>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                soundFx.playClick("soft");
                setActiveStep(i);
              }}
              className={`w-8 h-8 rounded-xl font-mono text-xs font-bold border transition-all ${
                activeStep === i
                  ? "bg-aqua/20 border-aqua text-aqua shadow"
                  : "sf-inset border-navy-700 text-ink-500 hover:text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Module Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Interactive Visual Graphic Sandbox (5 cols) */}
        <div className="md:col-span-5 sf-inset p-5 rounded-2xl border border-navy-700/80 min-h-[300px] flex flex-col justify-between">
          <div className="text-xs font-mono text-ink-400 uppercase font-bold mb-2">
            Visual Learning Model
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            {current.visualGraphic === "candlestick" && (
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-8 bg-bull rounded-t-full" />
                <div className="w-16 h-28 rounded-xl bg-gradient-to-b from-bull to-emerald-700 border border-bull flex items-center justify-center text-xs font-mono font-black text-navy-950 shadow-lg shadow-bull/20">
                  BODY
                </div>
                <div className="w-1.5 h-10 bg-bull rounded-b-full" />
                <span className="text-xs font-mono text-bull font-bold mt-3">Bullish Candle Anatomy</span>
              </div>
            )}

            {current.visualGraphic === "support_line" && (
              <div className="w-full h-36 relative flex flex-col justify-between p-3 border border-navy-800 rounded-xl bg-navy-950/40">
                <div className="flex justify-between text-[10px] font-mono text-bear border-b border-bear/40 pb-1">
                  <span>Resistance Ceiling</span>
                  <span>Sellers Distribute</span>
                </div>
                <div className="w-full h-12 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 30">
                    <polyline fill="none" stroke="#38e1ff" strokeWidth="2" points="0,25 25,5 50,25 75,5 100,25" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-bull border-t border-bull/40 pt-1">
                  <span>Support Floor</span>
                  <span>Buyers Accumulate</span>
                </div>
              </div>
            )}

            {current.visualGraphic === "trend_line" && (
              <div className="w-full h-36 relative flex items-center justify-center p-3 border border-navy-800 rounded-xl bg-navy-950/40">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <polyline fill="none" stroke="#2be08a" strokeWidth="2.5" points="0,35 25,20 45,28 70,10 85,18 100,2" />
                  <line x1="0" y1="38" x2="100" y2="12" stroke="#ffc24b" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
            )}

            {current.visualGraphic === "breakout" && (
              <div className="w-full h-36 relative flex flex-col justify-center p-3 border border-navy-800 rounded-xl bg-navy-950/40">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#ff4d6a" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polyline fill="none" stroke="#38e1ff" strokeWidth="2.5" points="0,28 35,20 55,5 68,19 100,2" />
                </svg>
                <div className="flex justify-between text-[10px] font-mono text-aqua mt-1">
                  <span>Breakout</span>
                  <span>Retest Floor</span>
                  <span>Continuation</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-navy-950/60 border border-navy-800 text-xs font-mono text-ink-400">
            Concept verified by CFA / CMT curriculum standards
          </div>
        </div>

        {/* Lesson Body & Pedagogical Takeaway (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between min-h-[300px]">
          <div>
            <span className="text-xs font-mono font-bold text-aqua uppercase">
              Step {activeStep + 1} of {steps.length}
            </span>
            <h3 className="font-display font-extrabold text-white text-xl mt-1 mb-3">
              {current.title}
            </h3>
            <p className="text-ink-200 text-sm leading-relaxed mb-6 font-normal">
              {current.summary}
            </p>

            <div className="p-4 rounded-xl sf-base border border-bull/40 bg-bull/5 mb-6">
              <span className="text-[10px] font-mono font-bold uppercase text-bull flex items-center gap-1.5 mb-1">
                <Icon name="sparkles" size={14} /> Golden Rule:
              </span>
              <p className="text-sm font-bold text-white">{current.keyTakeaway}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-navy-800">
            <button
              disabled={activeStep === 0}
              onClick={() => {
                soundFx.playClick("soft");
                setActiveStep((p) => p - 1);
              }}
              className="px-4 py-2 rounded-xl sf-base border border-navy-700 text-xs font-mono font-bold text-ink-300 hover:text-white disabled:opacity-40"
            >
              &larr; Previous Step
            </button>

            <button
              onClick={() => {
                soundFx.playClick("plastic");
                if (activeStep < steps.length - 1) {
                  setActiveStep((p) => p + 1);
                } else {
                  soundFx.playLevelUp();
                }
              }}
              className="btn3d h-10 px-6 rounded-xl font-display font-bold text-xs uppercase"
              style={{
                background: "linear-gradient(180deg, #38e1ff 0%, #12a8cf 100%)",
                color: "#02141c",
                ["--edge" as any]: "#0b6f8d",
              }}
            >
              {activeStep < steps.length - 1 ? "Next Module &rarr;" : "Complete Academy &rarr;"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
