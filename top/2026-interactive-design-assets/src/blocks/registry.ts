import type { ComponentType } from "react";
import { CandleReveal, HoldToLock, ScoreBreakdown } from "./reveal";
import { QuizFeedback, RiskSlider, SwipeEvidence } from "./input";
import { LevelUp, RewardChest, StreakCombo } from "./reward";
import { BreakingNews, Leaderboard, LiquidationGlitch, ScenarioCarousel } from "./nav";
import { DrawPrediction, OrderBook, VolatilityField, Watchlist } from "./market";
import { NotificationStack, PullRefresh, TabBar, TradeSheet } from "./ui";
import { AcademyPath, CoachMarks, ConfidenceDial, VersusMatch } from "./meta";
import { LessonQuiz } from "./duo-lesson";
import { DailyQuests, LeaguePromotion, StreakCelebration } from "./duo-rewards";
import { MascotPlayground, MascotStory } from "./duo-story";
import { BossBattle, FeverCombo, SpinWheel, VfxLab } from "./vfx";
import { AchievementWall, CandleCatcher, CandleCrush, PackOpening } from "./arcade";
import { AlertConsole, RiskDial, SafetySwitchboard, SetupDealer, SignalSlots } from "./tactile";
import { CommitVault, RevealTerminal, ScoreDashboard, StreakFurnace } from "./core-tactile";
import { ChartSniper, LeverageTower, MemoryDeck, PatternTrace, PortfolioBalance, WhaleRadar } from "./mechanics";

export type Category =
  | "Mechanics"
  | "Tactile"
  | "Arcade"
  | "VFX"
  | "Lessons"
  | "Character"
  | "Reveal"
  | "Decision Input"
  | "Feedback"
  | "Rewards"
  | "Market Data"
  | "Navigation"
  | "Onboarding"
  | "Social"
  | "Transitions";

export const CATEGORIES: Category[] = ["Mechanics", "Tactile", "Arcade", "VFX", "Lessons", "Character", "Reveal", "Decision Input", "Feedback", "Rewards", "Market Data", "Navigation", "Onboarding", "Social", "Transitions"];

export interface BlockMeta {
  id: string;
  n: string;
  title: string;
  category: Category;
  desc: string;
  trigger: string;
  duration: string;
  easing: string;
  haptics: string;
  sound: string;
  reduced: string;
  tech: string[];
  checks: string[];
  Component: ComponentType;
}

const BASE = ["Transform/opacity only", "prefers-reduced-motion", "Touch target ≥ 44px", "Replayable state"];

export const BLOCKS: BlockMeta[] = [
  {
    id: "chart-sniper", n: "49", title: "Chart Sniper", category: "Mechanics", Component: ChartSniper,
    desc: "Rhythm game at 92 BPM: candles fall down a lane, tap when a green one crosses the copper line, let red fakeouts pass. Perfect / good / miss windows, multipliers every 8 hits.",
    trigger: "Tap / Space on the beat", duration: "±70ms perfect · ±220ms good", easing: "constant 160 px/s",
    haptics: "[10,10,20] perfect · 10 good · 20 miss · [50,30,50] fakeout", sound: "metronome ticks · coin / pop / lose", reduced: "Same game, fewer particles",
    tech: ["rAF timeline", "Hit windows", "Juice VFX"], checks: [...BASE, "Teaches patience on fakeouts", "Keyboard playable"],
  },
  {
    id: "portfolio-scale", n: "50", title: "Portfolio Scale", category: "Mechanics", Component: PortfolioBalance,
    desc: "A physical balance scale. Drop weighted asset blocks on the risk-on or risk-off pan; the beam tilts with mass-spring physics and the pans sag. Balance within one weight to lock.",
    trigger: "Tap L / R per asset", duration: "spring 60/7 mass 1.4", easing: "under-damped spring",
    haptics: "6–18ms by weight · [30,20,80] lock", sound: "pop · tick · win · lock", reduced: "Beam snaps",
    tech: ["Shared layoutId weights", "Spring beam", "Readout"], checks: [...BASE, "Teaches allocation"],
  },
  {
    id: "pattern-trace", n: "51", title: "Pattern Trace", category: "Mechanics", Component: PatternTrace,
    desc: "Trace chart patterns with one stroke over a glowing dashed guide with a moving dot; sparks fly where you're on-line, error lines show where you drifted, accuracy % on a gauge.",
    trigger: "Freehand pointer stroke", duration: "continuous", easing: "—",
    haptics: "2ms on-line · [20,20,20] incomplete", sound: "tick per column · win / coin / lose", reduced: "No moving dot",
    tech: ["offset-path guide", "Path error scoring", "Gauge"], checks: [...BASE, "Best per pattern", "Guide toggle"],
  },
  {
    id: "memory-deck", n: "52", title: "Memory Deck", category: "Mechanics", Component: MemoryDeck,
    desc: "Spaced-repetition flash cards where memory visibly decays: strength bars drain in real time, weak cards return sooner, 3D flip, Again / Hard / Easy grading.",
    trigger: "Flip → grade", duration: "0.5s flip · 2.5s decay tick", easing: "cubic-bezier(.6,0,.2,1)",
    haptics: "8 flip · [15,20,40] easy · [40,20,40] again", sound: "pop · win / coin / lose", reduced: "No decay animation",
    tech: ["Decay timer", "Scheduling", "preserve-3d"], checks: [...BASE, "Forgetting curve visible"],
  },
  {
    id: "leverage-tower", n: "53", title: "Liquidation Tower", category: "Mechanics", Component: LeverageTower,
    desc: "Stack-the-blocks with leverage: each floor multiplies leverage ×1.6, misaligned overhang is cut off and falls, perfect drops ring, the camera rises, and a full miss liquidates the tower.",
    trigger: "Drop / Space", duration: "speed rises per floor", easing: "spring 500/26 landing",
    haptics: "12 drop · [15,15,40] perfect · [80,40,120] collapse", sound: "pop · win · glitch → lose", reduced: "No wobble",
    tech: ["rAF mover", "Overlap math", "Camera follow"], checks: [...BASE, "Base shrinks with mistakes"],
  },
  {
    id: "whale-radar", n: "54", title: "Whale Radar", category: "Mechanics", Component: WhaleRadar,
    desc: "Green-phosphor sonar: a sweep reveals drifting contacts that fade until the next pass. Tag whales (+10), ignore noise (−3), avoid wash trades (−8). 30-second scan.",
    trigger: "Tap contacts", duration: "110°/s sweep · 30s", easing: "linear sweep · fade decay",
    haptics: "[10,10,30] whale · 8 noise · [50,30,50] wash", sound: "tick on whale pass · coin / lose", reduced: "Contacts stay visible",
    tech: ["conic sweep", "Polar drift", "Fade memory"], checks: [...BASE, "Signal vs noise scoring"],
  },
  {
    id: "reveal-terminal", n: "45", title: "Reveal Terminal", category: "Tactile", Component: RevealTerminal,
    desc: "The future sits behind a corrugated steel shutter on a bezelled CRT. Pick a side, press the big red button: three arming clicks, a glitch, the shutter slides, candles print one by one, verdict slams.",
    trigger: "Side → push button", duration: "0.42s arm · 1.1s print", easing: "spring 90/18 shutter",
    haptics: "[15,20,40] arm · 4ms per candle · [30,40,90] / [70,40,70]", sound: "lock → tick ×3 → whoosh → ticks → win / lose", reduced: "Shutter cuts, no glitch",
    tech: ["Bezel + scanlines", "Motion-value shutter", "Readouts"], checks: [...BASE, "Future hidden until commit"],
  },
  {
    id: "commit-vault", n: "46", title: "Commit Vault", category: "Tactile", Component: CommitVault,
    desc: "A bank-vault dial: rotate past three pins (each lights an LED and rings), then the core turns copper — hold it for one second while it trembles to seal the decision.",
    trigger: "Rotate ×3 → hold 1s", duration: "1.0s hold", easing: "spring 260/22",
    haptics: "3ms notch · [10,10,20] pin · [40,30,120] seal", sound: "tick · pop · lock → win", reduced: "No tremble, no flash",
    tech: ["atan2 dial", "rAF hold loop", "Keyboard fallback"], checks: [...BASE, "Two-step commit", "Release cancels"],
  },
  {
    id: "score-dashboard", n: "47", title: "Score Dashboard", category: "Tactile", Component: ScoreDashboard,
    desc: "Seven-segment total counts up with ticks, four analog needle gauges swing in with overshoot, a copper grade stamp slams with shake, then the insight card slides into an inset well.",
    trigger: "On mount / replay", duration: "2.9s choreography", easing: "spring 60/9 needles",
    haptics: "2ms ticks · [30,30,90] stamp", sound: "tick ×16 → lock → win", reduced: "Values appear, no shake",
    tech: ["Needle gauges", "Readout", "Gauge"], checks: [...BASE, "Explains the score"],
  },
  {
    id: "streak-furnace", n: "48", title: "Streak Furnace", category: "Tactile", Component: StreakFurnace,
    desc: "A pressure gauge and a furnace window: each completed day stokes the flame, the needle climbs, embers rise; every 7th day blows the door open with a Perfect Week; a miss puts it out in smoke.",
    trigger: "Complete / miss", duration: "spring 80/14 needle", easing: "spring",
    haptics: "12ms stoke · [40,40,120] week · [70,30,40] miss", sound: "coin · win · lose", reduced: "No embers",
    tech: ["Pressure gauge SVG", "Ember emitter", "LED week"], checks: [...BASE, "Loss is recoverable"],
  },
  {
    id: "risk-dial", n: "40", title: "Risk Dial", category: "Tactile", Component: RiskDial,
    desc: "Brushed-metal rotary knob with 0.25% detents, a lit tick ring, LED zone indicators and a glowing seven-segment readout. Crossing a zone fires a shockwave; DEGEN shakes the screen.",
    trigger: "Rotate (drag / arrow keys)", duration: "spring 380/26", easing: "detent snap",
    haptics: "3ms detent · 8ms integer · [12,20,12] zone", sound: "tick · lock on arm", reduced: "No glow pulse, no shake",
    tech: ["atan2 rotation", "SVG tick ring", "Juice VFX"], checks: [...BASE, "role=slider", "Teaches sizing"],
  },
  {
    id: "switchboard", n: "41", title: "Safety Switchboard", category: "Tactile", Component: SafetySwitchboard,
    desc: "Four physical toggles with sprung knobs and LEDs gate a drag-down mission lever. All guards on → lever engages with a green shockwave; flipping one off mid-session kills it with an alarm.",
    trigger: "Toggle · drag lever", duration: "spring 600/30 knobs", easing: "spring",
    haptics: "[8,15,8] on · [20,20,80] engage · [60,30,60] kill", sound: "pop / tick → lock → win / lose", reduced: "No flash, no shake",
    tech: ["role=switch", "drag lever", "Inset/raised states"], checks: [...BASE, "Interlock logic", "Kill switch"],
  },
  {
    id: "setup-dealer", n: "42", title: "Setup Dealer", category: "Tactile", Component: SetupDealer,
    desc: "Cards deal in from off-screen onto a felt table, flip in 3D, and get a TAKE / PASS verdict stamped on them before flying off left or right.",
    trigger: "Tap flip · take / pass", duration: "0.55s flip · 0.5s fling", easing: "cubic-bezier(.6,0,.2,1)",
    haptics: "10ms flip · [20,30,50] right · [50,30,50] wrong", sound: "whoosh deal · pop flip · win / lose", reduced: "No deal-in arc",
    tech: ["preserve-3d", "Deck z-order", "Verdict stamp"], checks: [...BASE, "Each card explains itself"],
  },
  {
    id: "signal-slots", n: "43", title: "Signal Slots", category: "Tactile", Component: SignalSlots,
    desc: "A working slot machine — reel strips with ticking, overshoot stops, chasing bulbs and a pull lever — rigged with near-misses to teach how gambling UI manipulates you.",
    trigger: "Pull lever / spin", duration: "1.4 / 1.95 / 2.5s reels", easing: "cubic-bezier(.15,.85,.2,1.08)",
    haptics: "20ms per reel stop · [40,40,160] jackpot", sound: "lock → ticks → win / lose / coin", reduced: "Instant stop",
    tech: ["Reel strips", "Rigged outcomes", "Coin rain"], checks: [...BASE, "Teaches house edge", "Credits run out on purpose"],
  },
  {
    id: "alert-console", n: "44", title: "Alert Console", category: "Tactile", Component: AlertConsole,
    desc: "Raised toast stack with depth, lifetime bars, swipe-to-dismiss with fade, LED status row and a scrolling event log — the feedback layer as a physical console.",
    trigger: "Trigger buttons · swipe", duration: "6s lifetime", easing: "spring 420/30",
    haptics: "10ms · [40,30,40] error", sound: "pop / coin / lose", reduced: "No burst, no shake",
    tech: ["layout stack", "drag x", "rAF lifetime"], checks: [...BASE, "Dismissable", "Log persists"],
  },
  {
    id: "candle-crush", n: "36", title: "Candle Crush", category: "Arcade", Component: CandleCrush,
    desc: "Match-3 with swipe or tap-swap, spring gravity drops, cascading combos, 4/5-match shockwaves, invalid-swap wobble, idle hints, auto-shuffle, and a 3-star finish.",
    trigger: "Swipe / tap two tiles", duration: "0.24s clear · 0.4s drop per cascade", easing: "spring 480/28",
    haptics: "6ms swap · 12ms clear · [15,20,30] cascade", sound: "whoosh → pop / coin → win", reduced: "Instant drops, no shake",
    tech: ["Grid solver", "AnimatePresence exits", "Juice VFX"], checks: [...BASE, "Hint after idle", "No dead boards"],
  },
  {
    id: "candle-catcher", n: "37", title: "Candle Catcher", category: "Arcade", Component: CandleCatcher,
    desc: "30-second canvas arcade: steer Moo to catch green candles and gold stars, dodge red ones. Squash on catch, combo multipliers, countdown pops and best score.",
    trigger: "Drag / arrow keys", duration: "30s round", easing: "lerp steering",
    haptics: "6ms catch · [50,30,50] hit", sound: "tick · coin · lose · win", reduced: "Same game, fewer particles",
    tech: ["Canvas 2D", "rAF loop", "Juice VFX"], checks: [...BASE, "Keyboard playable"],
  },
  {
    id: "card-pack", n: "38", title: "Card Pack", category: "Rewards", Component: PackOpening,
    desc: "Tilt the foil pack, swipe along the perforation to tear it (sparks follow your finger), then flip 5 holo cards — epic and legendary cards charge up before a big reveal.",
    trigger: "Swipe tear · tap cards", duration: "0.55s flip · 0.9s legendary charge", easing: "cubic-bezier(.6,0,.2,1)",
    haptics: "3ms tear ticks → [40,30,100] · legendary [50,40,150]", sound: "tick → lock → pop / coin / win", reduced: "No tilt, no rays",
    tech: ["preserve-3d flips", "Pointer holo", "Rarity tiers"], checks: [...BASE, "Cosmetic-only disclosure", "Button alternative to swipe"],
  },
  {
    id: "achievements", n: "39", title: "Achievement Wall", category: "Rewards", Component: AchievementWall,
    desc: "Badges tilt under your finger. Unlocking one flies it from its slot to center, spins it 720° with rays and confetti, then it flies home and lands with a burst.",
    trigger: "Complete challenge", duration: "~1.6s unlock", easing: "shared layout spring 160/18",
    haptics: "10ms → [30,40,100] → 15ms landing", sound: "whoosh → win → coin", reduced: "No spin, no tilt",
    tech: ["layoutId flight", "3D tilt", "Shine sweep"], checks: [...BASE, "Shows how to earn"],
  },
  {
    id: "boss-battle", n: "32", title: "Boss Battle", category: "VFX", Component: BossBattle,
    desc: "Fight the Volatility boss with good trading habits. Cards fly and hit with crits, damage numbers, a lagging HP chip-bar, knockback, hit-flash, rage mode, counter-attacks and a victory explosion.",
    trigger: "Tap move card", duration: "0.33s throw · 0.45s impact", easing: "anticipation → spring",
    haptics: "25ms hit · [40,20,60] crit · [70,30,50] hurt", sound: "whoosh → pop / lock → lose", reduced: "No throw, no shake",
    tech: ["Juice layer", "Chip HP bar", "Hit-flash filter"], checks: [...BASE, "FOMO is punished", "Readable damage"],
  },
  {
    id: "spin-wheel", n: "33", title: "Daily Spin", category: "VFX", Component: SpinWheel,
    desc: "Prize wheel with eased deceleration, a pointer that flicks on every segment, chasing marquee bulbs, and a jackpot with coin rain and confetti.",
    trigger: "Tap spin", duration: "4.4s", easing: "cubic-bezier(.12,.75,.14,1)",
    haptics: "3ms per segment · jackpot [40,40,140]", sound: "tick per segment → coin / win", reduced: "Instant result",
    tech: ["Motion value spin", "Segment ticks", "Coin rain"], checks: [...BASE, "Fair odds disclosed"],
  },
  {
    id: "fever", n: "34", title: "Fever Combo", category: "VFX", Component: FeverCombo,
    desc: "Rapid-tap speed round: the combo builds heat, numbers pop bigger and brighter, then FEVER mode brings rotating rays, a rainbow border and a 5× multiplier.",
    trigger: "Rapid tap", duration: "4s fever", easing: "rAF heat decay",
    haptics: "6ms tap · 12ms fever", sound: "pop → coin", reduced: "No rays / border spin",
    tech: ["rAF loop", "conic border", "Floating numbers"], checks: [...BASE, "Decay is visible"],
  },
  {
    id: "vfx-lab", n: "35", title: "VFX Lab", category: "VFX", Component: VfxLab,
    desc: "Every effect in the juice engine behind one button each: shake, flash, confetti, glowing stars, shockwaves, coin rain, damage, crits, level-up and hearts.",
    trigger: "Tap effect", duration: "0.4–1.2s", easing: "per effect",
    haptics: "per effect", sound: "per effect", reduced: "Softer flashes, no shake",
    tech: ["useJuice()", "Additive particles", "WAAPI shake"], checks: [...BASE, "One API for all blocks"],
  },
  {
    id: "duo-lesson", n: "26", title: "Lesson", category: "Lessons", Component: LessonQuiz,
    desc: "Full Duolingo-style lesson: pick-the-image, word-bank tiles that fly into place, match pairs and true/false — with hearts, combos, re-queued mistakes and a stat-card finale.",
    trigger: "Tap · check · continue", duration: "Spring 380/34 per step", easing: "shared layout (tiles)",
    haptics: "5ms select · [20,30,50] right · [60,40,60] wrong", sound: "tick · pop · win · lose", reduced: "No slides, instant tiles",
    tech: ["layoutId tiles", "Feedback sheet", "Mascot moods"], checks: [...BASE, "Mistakes re-queued", "Explains the answer"],
  },
  {
    id: "duo-story", n: "30", title: "Story", category: "Lessons", Component: MascotStory,
    desc: "Characters chat in typewriter bubbles with talking mouths; inline questions gate the plot until answered correctly.",
    trigger: "Continue / answer", duration: "18ms per char", easing: "spring 400/30",
    haptics: "[20,30,50] right · [50,30,50] wrong", sound: "pop per line · win / lose", reduced: "Full text instantly",
    tech: ["Typewriter", "Auto-scroll", "Talking mascot"], checks: [...BASE, "Learning in narrative"],
  },
  {
    id: "mascot", n: "31", title: "Meet Moo", category: "Character", Component: MascotPlayground,
    desc: "Pure-SVG mascot with 8 moods, blinking, talking mouth, arm poses and 5 cosmetic skins. Tap to pet.",
    trigger: "Tap · mood chips · skins", duration: "Per mood", easing: "spring 260/14 arms",
    haptics: "12ms pet · 5ms chips", sound: "pop → win", reduced: "Static poses",
    tech: ["SVG rig", "Mood state machine", "Skins"], checks: [...BASE, "Cosmetic-only disclosure"],
  },
  {
    id: "duo-streak", n: "27", title: "Streak Day", category: "Rewards", Component: StreakCelebration,
    desc: "Flame ignites, the number rolls 6→7, today's circle fills with a drawn check and the week bounces into a Perfect Week.",
    trigger: "Complete today", duration: "1.3s", easing: "spring 300/20",
    haptics: "15 → [30,40,90]", sound: "whoosh → win → coin", reduced: "No flicker or embers",
    tech: ["Rolling number", "pathLength", "Ember emitter"], checks: [...BASE, "Streak freeze safety net"],
  },
  {
    id: "duo-quests", n: "28", title: "Daily Quests", category: "Rewards", Component: DailyQuests,
    desc: "Quest bars fill with shine, ready chests shake, tapping one sends gems flying along arcs into the counter.",
    trigger: "Play / tap chest", duration: "0.75s flights", easing: "keyframed arcs",
    haptics: "8ms play · [20,20,40] claim", sound: "pop → win → coin ×6", reduced: "Instant gems",
    tech: ["Flying elements", "Progress shine", "Chest rig"], checks: [...BASE, "Clear ready state"],
  },
  {
    id: "duo-league", n: "29", title: "League Promotion", category: "Social", Component: LeaguePromotion,
    desc: "Weekly league with promotion/demotion zones; climb with FLIP re-ranks, then a rays-and-shield promotion screen.",
    trigger: "Earn XP / end week", duration: "Spring 420/36", easing: "spring 260/11 shield",
    haptics: "10ms · [30,50,120]", sound: "coin → win", reduced: "No rays, no layout motion",
    tech: ["layout FLIP", "Shield SVG", "Particles"], checks: [...BASE, "Zones clearly labelled"],
  },
  {
    id: "server-reveal", n: "01", title: "Server Reveal", category: "Reveal", Component: CandleReveal,
    desc: "Sealed future candles wipe open with a scan line, grow in sequence and slam an outcome badge.",
    trigger: "Tap after decision lock", duration: "1.5s sequence", easing: "cubic-bezier(.7,0,.2,1)",
    haptics: "15 → [30,40,70]", sound: "whoosh → win / lose", reduced: "Instant reveal, no scan, badge fades",
    tech: ["SVG", "clip-path", "Canvas particles"], checks: [...BASE, "No client-side future leak"],
  },
  {
    id: "hold-lock", n: "02", title: "Hold-to-Lock", category: "Decision Input", Component: HoldToLock,
    desc: "Commit ring fills while held, tension shake grows, release cancels. Locks with shockwave + sparks.",
    trigger: "Press & hold 1.2s (Space/Enter)", duration: "1.2s hold · 0.9s release", easing: "linear fill · spring 500/14",
    haptics: "6ms ticks ×10 → [40,30,90]", sound: "tick ×10 → lock", reduced: "No shake, rings disabled",
    tech: ["rAF loop", "SVG stroke", "Pointer events"], checks: [...BASE, "Keyboard accessible", "Anti mis-tap"],
  },
  {
    id: "score-breakdown", n: "03", title: "Process Score", category: "Feedback", Component: ScoreBreakdown,
    desc: "Count-up ring, staggered criteria bars, grade stamp with screen shake and a Personal Insight card.",
    trigger: "On debrief mount", duration: "3.0s choreography", easing: "cubic-bezier(.16,1,.3,1)",
    haptics: "[25,30,70] on stamp", sound: "lock on stamp", reduced: "Values appear, no shake",
    tech: ["framer animate()", "useAnimate", "Particles"], checks: [...BASE, "Explains the score"],
  },
  {
    id: "evidence-swipe", n: "04", title: "Evidence Swipe", category: "Decision Input", Component: SwipeEvidence,
    desc: "Tinder-style evidence cards with BULL/BEAR stamps, velocity fling and a background sentiment tint.",
    trigger: "Drag / tap buttons", duration: "0.28s fling", easing: "spring 500/28 return",
    haptics: "14ms on fling", sound: "whoosh", reduced: "Instant card swap",
    tech: ["drag", "useTransform", "velocity"], checks: [...BASE, "Button alternative to gesture"],
  },
  {
    id: "risk-slider", n: "05", title: "Invalidation Setter", category: "Decision Input", Component: RiskSlider,
    desc: "Drag the stop line on a live chart — risk %, R:R and color react; breaking the 2% rule shakes a warning.",
    trigger: "Vertical drag", duration: "Continuous", easing: "elastic .12",
    haptics: "5ms grab · [30,20,30] over-risk", sound: "tick / lose on threshold", reduced: "Warning without shake",
    tech: ["drag y", "useMotionValueEvent", "color interpolation"], checks: [...BASE, "Teaches a risk rule"],
  },
  {
    id: "quiz-feedback", n: "06", title: "Answer Feedback", category: "Feedback", Component: QuizFeedback,
    desc: "Wrong answers shake with a red flash; the right one sweeps green, draws a check and pops +XP.",
    trigger: "Tap option", duration: "0.35–1.3s", easing: "cubic-bezier(.7,0,.2,1)",
    haptics: "[60,40,60] wrong · [20,30,50] right", sound: "lose / win", reduced: "Color only",
    tech: ["pathLength", "scaleX sweep", "Particles"], checks: [...BASE, "Explains why"],
  },
  {
    id: "streak-combo", n: "07", title: "Streak Combo", category: "Rewards", Component: StreakCombo,
    desc: "Flame grows with each correct call, emits embers, flashes on multiplier tiers and shatters on a miss.",
    trigger: "Correct / miss", duration: "Spring 260/14", easing: "spring",
    haptics: "10ms hit · [70,30,40] miss", sound: "coin · win · lose", reduced: "No embers, no shake",
    tech: ["SVG flame", "Emitter", "popLayout"], checks: [...BASE, "Loss is recoverable"],
  },
  {
    id: "reward-chest", n: "08", title: "Founder Pack Open", category: "Rewards", Component: RewardChest,
    desc: "Three-tap anticipation build, lid blast, god rays, coin fountain and a 3D card flip reveal.",
    trigger: "Tap ×3", duration: "2.2s", easing: "cubic-bezier(.6,0,.2,1)",
    haptics: "8·16·24ms → [40,40,120]", sound: "pop ×3 → win → coin", reduced: "No rays rotation",
    tech: ["preserve-3d", "conic-gradient", "Particles"], checks: [...BASE, "Cosmetic-only disclosure"],
  },
  {
    id: "rank-up", n: "09", title: "Rank Up", category: "Rewards", Component: LevelUp,
    desc: "XP overflow triggers white flash, shockwaves, rotating rays, hex badge spring and staggered title.",
    trigger: "XP threshold", duration: "2.4s", easing: "spring 300/11",
    haptics: "[30,50,120]", sound: "win", reduced: "Static badge, no rays",
    tech: ["clip-path hex", "blur stagger", "Particles"], checks: [...BASE, "Shows unlocks"],
  },
  {
    id: "arena-carousel", n: "10", title: "Arena Carousel", category: "Navigation", Component: ScenarioCarousel,
    desc: "Snap carousel with 3D depth, inner parallax, morphing dots and a CTA that swaps with the card.",
    trigger: "Scroll / swipe / tap", duration: "Scroll-linked", easing: "native snap",
    haptics: "5ms per snap", sound: "tick", reduced: "Flat cards, instant scroll",
    tech: ["scroll-snap", "perspective", "AnimatePresence"], checks: [...BASE, "Native scrolling"],
  },
  {
    id: "leaderboard", n: "11", title: "Live Leaderboard", category: "Social", Component: Leaderboard,
    desc: "Rows re-rank with FLIP layout springs, rank-change badges and rolling score counters.",
    trigger: "Realtime update", duration: "Spring 450/38", easing: "spring",
    haptics: "12ms when you climb", sound: "coin", reduced: "No layout animation",
    tech: ["layout FLIP", "animate()", "WebSocket-ready"], checks: [...BASE, "Stable row keys"],
  },
  {
    id: "liquidation", n: "12", title: "Liquidation → Protocol", category: "Transitions", Component: LiquidationGlitch,
    desc: "RGB-split glitch, tabloid REKT slam, then a calm spring into the Post-Loss breathing protocol.",
    trigger: "Liquidation event", duration: "3.0s", easing: "steps → spring 120/20",
    haptics: "[80,40,140] → 120", sound: "glitch → lose", reduced: "Crossfade only",
    tech: ["clip-path slices", "drop-shadow RGB", "Halftone"], checks: [...BASE, "Anti-tilt design"],
  },
  {
    id: "breaking-news", n: "13", title: "Breaking News", category: "Transitions", Component: BreakingNews,
    desc: "Punk-tabloid stripe wipe, headline words drop in, crash chart draws, then a signal-vs-noise call.",
    trigger: "Event push", duration: "2.0s", easing: "cubic-bezier(.7,0,.3,1)",
    haptics: "30ms on slam", sound: "whoosh → lock", reduced: "No wipe, words appear",
    tech: ["skew wipe", "word stagger", "Marquee"], checks: [...BASE, "Brand tone of voice"],
  },
  {
    id: "draw-forecast", n: "14", title: "Draw Your Forecast", category: "Decision Input", Component: DrawPrediction,
    desc: "Sketch the next 12 candles with your finger; the real path draws over it and per-point error lines score you.",
    trigger: "Freehand pointer drawing", duration: "1.4s compare", easing: "cubic-bezier(.6,0,.2,1)",
    haptics: "3ms per grid step → result", sound: "tick → whoosh → win / lose", reduced: "Instant compare",
    tech: ["Pointer capture", "Path interpolation", "SVG"], checks: [...BASE, "Scores shape, not luck"],
  },
  {
    id: "order-book", n: "15", title: "Live Order Book", category: "Market Data", Component: OrderBook,
    desc: "Depth ladder re-flows with FLIP springs, liquidity walls at round numbers; tap a level to place a limit that fills live.",
    trigger: "Tap price level", duration: "520ms tick", easing: "spring 500/42",
    haptics: "8ms place · [20,30,60] fill", sound: "pop → coin", reduced: "No row motion",
    tech: ["layout FLIP", "Odometer", "Shared layoutId"], checks: [...BASE, "Teaches limit orders"],
  },
  {
    id: "watchlist", n: "16", title: "Watchlist → Detail", category: "Market Data", Component: Watchlist,
    desc: "Rolling-digit prices with tick flashes; a row morphs into a full-screen detail with path-morphing timeframes.",
    trigger: "Tap row / timeframe", duration: "Spring 320/34", easing: "shared layout",
    haptics: "8ms open · 5ms timeframe", sound: "whoosh · tick", reduced: "Instant open",
    tech: ["layoutId morph", "path d morph", "Odometer"], checks: [...BASE, "Continuity of place"],
  },
  {
    id: "coach-marks", n: "17", title: "Coach Marks", category: "Onboarding", Component: CoachMarks,
    desc: "Spotlight glides between real UI targets, tooltip re-anchors above/below, copy types in, pulse draws the eye.",
    trigger: "First session", duration: "Spring 260/28", easing: "spring",
    haptics: "6ms per step", sound: "whoosh → win", reduced: "Jump cuts, no typing",
    tech: ["Measured rects", "box-shadow spotlight", "Typewriter"], checks: [...BASE, "Skippable"],
  },
  {
    id: "pull-refresh", n: "18", title: "Pull to Refresh", category: "Navigation", Component: PullRefresh,
    desc: "Rubber-band pull grows candle loader, arms with a haptic click, new scenarios cascade in with NEW flashes.",
    trigger: "Pull down", duration: "1.5s load", easing: "exp rubber-band",
    haptics: "12ms armed · [15,20,30] done", sound: "pop → whoosh → coin", reduced: "No cascade",
    tech: ["Pointer capture", "Motion values", "layout"], checks: [...BASE, "Clear armed state"],
  },
  {
    id: "notifications", n: "19", title: "Notification Stack", category: "Feedback", Component: NotificationStack,
    desc: "iOS-style stacking toasts with countdown bars; tap to fan out, swipe sideways to dismiss.",
    trigger: "Push event", duration: "5s auto-dismiss", easing: "spring 420/32",
    haptics: "12ms · [40,30,40] alert", sound: "per kind", reduced: "No fly-in",
    tech: ["drag x", "AnimatePresence", "Stack math"], checks: [...BASE, "Dismissable"],
  },
  {
    id: "trade-sheet", n: "20", title: "Trade Sheet", category: "Decision Input", Component: TradeSheet,
    desc: "Three-snap bottom sheet with velocity projection, background recede, leverage danger states and swipe-to-confirm.",
    trigger: "Drag handle", duration: "Spring 420/40", easing: "velocity projection",
    haptics: "6ms snaps · 4ms swipe steps", sound: "tick → win", reduced: "Instant snaps",
    tech: ["useDragControls", "useTransform", "Swipe confirm"], checks: [...BASE, "Deliberate confirm", "Leverage warning"],
  },
  {
    id: "versus", n: "21", title: "Versus Match", category: "Social", Component: VersusMatch,
    desc: "Radar sweep matchmaking, diagonal split slam-in, lightning VS, screen shake and a punchy 3-2-1-GO.",
    trigger: "Find opponent", duration: "~7s sequence", easing: "spring 500/15",
    haptics: "[40,30,100] match · 15ms counts", sound: "whoosh → lock → tick ×3 → win", reduced: "No shake/sweep",
    tech: ["conic sweep", "clip-path split", "Particles"], checks: [...BASE, "Process over luck framing"],
  },
  {
    id: "academy-path", n: "22", title: "Academy Path", category: "Onboarding", Component: AcademyPath,
    desc: "Winding lesson path; completing a node bursts, XP coins fly along arcs into the counter and the trail draws on.",
    trigger: "Tap current lesson", duration: "0.95s", easing: "keyframed arcs",
    haptics: "10ms → [20,30,60]", sound: "pop → coin ×6 → win", reduced: "Instant XP",
    tech: ["Flying elements", "pathLength", "3D press"], checks: [...BASE, "Clear next step"],
  },
  {
    id: "volatility-field", n: "23", title: "Volatility Field", category: "Market Data", Component: VolatilityField,
    desc: "WebGL domain-warped noise shifts calm→panic with implied vol; touch injects shockwave ripples into the shader.",
    trigger: "Slider + touch", duration: "Realtime", easing: "exp smoothing",
    haptics: "6ms per ripple · 8ms regime", sound: "pop · tick", reduced: "Near-static field",
    tech: ["WebGL", "GLSL fbm", "Uniform ripples"], checks: [...BASE, "Graceful no-WebGL fallback"],
  },
  {
    id: "tab-bar", n: "24", title: "Tab Bar", category: "Navigation", Component: TabBar,
    desc: "Sliding pill, expanding labels, icon micro-animations, directional page transitions and a popping badge.",
    trigger: "Tap tab", duration: "Spring 380/36", easing: "spring",
    haptics: "6ms", sound: "tick", reduced: "Crossfade only",
    tech: ["layoutId", "custom variants", "Badge pop"], checks: [...BASE, "aria-current"],
  },
  {
    id: "confidence-dial", n: "25", title: "Confidence Dial", category: "Decision Input", Component: ConfidenceDial,
    desc: "Rotary knob with detents; compares stated confidence to historical hit-rate and flags overconfidence.",
    trigger: "Rotate / arrow keys", duration: "Continuous", easing: "spring 300/30",
    haptics: "4ms detents · 14ms quarters", sound: "tick → lock", reduced: "No shake",
    tech: ["atan2 input", "SVG arcs", "role=slider"], checks: [...BASE, "Teaches calibration"],
  },
];
