import React from "react";
import { PatternArena } from "./PatternArena";
import { RealtimeTradingArena } from "./RealtimeTradingArena";
import { OrderFlowSimulator } from "./OrderFlowSimulator";
import { RiskCalculatorLab } from "./RiskCalculatorLab";
import { BossBattleEncounter } from "./BossBattleEncounter";
import { PostMortemReviewDeck } from "./PostMortemReviewDeck";
import { TraderJournalSystem } from "./TraderJournalSystem";
import { MasterControlDashboard } from "./MasterControlDashboard";
import { GachaVaultExperience } from "./GachaVaultExperience";
import { InteractiveAcademyCourse } from "./InteractiveAcademyCourse";

export const GameModulesSuite: React.FC = () => {
  return (
    <section id="game-modules-suite" className="scroll-mt-24 px-4 py-12 sm:px-8 space-y-16">
      {/* 1. Master Control Dashboard */}
      <div id="master-hub">
        <MasterControlDashboard />
      </div>

      {/* 2. Realtime Simulated Trading Arena */}
      <div id="trading-arena">
        <RealtimeTradingArena />
      </div>

      {/* 3. Interactive Pattern Recognition Dojo */}
      <div id="pattern-dojo">
        <PatternArena />
      </div>

      {/* 4. Orderflow & Liquidity Depth Simulator */}
      <div id="orderflow-sim">
        <OrderFlowSimulator />
      </div>

      {/* 5. Institutional Risk Sizing Lab */}
      <div id="risk-lab">
        <RiskCalculatorLab />
      </div>

      {/* 6. Boss Encounter: Liquidation Whale */}
      <div id="boss-encounter">
        <BossBattleEncounter />
      </div>

      {/* 7. Interactive Structured Academy Course */}
      <div id="academy-course">
        <InteractiveAcademyCourse />
      </div>

      {/* 8. Mystery Chest Gacha Vault */}
      <div id="gacha-vault">
        <GachaVaultExperience />
      </div>

      {/* 9. Liquidation Post-Mortem Lab */}
      <div id="post-mortem">
        <PostMortemReviewDeck />
      </div>

      {/* 10. Neuro-Trader Reflection Journal */}
      <div id="trader-journal">
        <TraderJournalSystem />
      </div>
    </section>
  );
};
