import { Section, SubHead } from "../components/ui";
import { CardStack, Coverflow, HeroCarousel, Onboarding, SnapCarousel, StoriesViewer, VelocityMarquee } from "./motion/Carousels";
import { CompareSlider, DualRange, EmojiSlider, Odometer, RiskKnob, WheelPicker } from "./motion/Sliders";
import { BottomSheet, ConfirmGestures, PullRefresh, RadialMenu, SwipeRows, ZoomChart } from "./motion/Gestures";
import { HoloCards, HorizontalJourney, ParallaxScene, RevealGallery, ScrollScrub, StickyStory } from "./motion/Scroll";
import { ChartLens, ContextMenu, DragGrid, ElasticTabs, GlitchBanner, Kanban, MorphFab, StickyStack } from "./motion/Advanced";
import { Chapters, EquityCurve, Headlines, LiveTape, MagneticPlay, PageTransitions, SkeletonMorph, Spotlight, StatDash, TiltShow } from "./motion/Immersive";

export default function Motion() {
  return (
    <Section
      id="motion"
      kicker="Carousels · sliders · gestures · scroll"
      title="Motion & Gestures"
      desc="Physics-based drag with velocity, spring snapping, 3D perspective, parallax depth and scroll-driven storytelling. Everything works with touch, mouse and keyboard."
    >
      <SubHead icon="layers" title="Carousels" desc="Snap, stories, coverflow, stack, autoplay hero, onboarding, velocity marquee" tone="#3e8bff" count={7} />
      <SnapCarousel />
      <StoriesViewer />
      <Coverflow />
      <CardStack />
      <HeroCarousel />
      <Onboarding />
      <VelocityMarquee />
      <SubHead icon="sort" title="Sliders & pickers" desc="Range, knob, compare, emoji, wheel and odometer" tone="#22d39a" count={6} />
      <DualRange />
      <RiskKnob />
      <CompareSlider />
      <EmojiSlider />
      <WheelPicker />
      <Odometer />
      <SubHead icon="swap" title="Gestures & swipes" desc="Swipe actions, bottom sheet, pull-to-refresh, hold/slide confirm, radial menu, pinch zoom" tone="#ff7a2f" count={6} />
      <SwipeRows />
      <BottomSheet />
      <PullRefresh />
      <ConfirmGestures />
      <RadialMenu />
      <ZoomChart />
      <SubHead icon="eye" title="Parallax & scroll reactions" desc="Depth layers, holo tilt, sticky story, horizontal journey, scrubbing, reveals" tone="#9170ff" count={6} />
      <ParallaxScene />
      <HoloCards />
      <StickyStory />
      <HorizontalJourney />
      <ScrollScrub />
      <RevealGallery />
      <SubHead icon="grid" title="Advanced interactions" desc="Sticky stacks, draggable grids, kanban, lens, elastic tabs, FAB, menus, decoders" tone="#22d39a" count={8} />
      <StickyStack />
      <DragGrid />
      <Kanban />
      <ChartLens />
      <ElasticTabs />
      <MorphFab />
      <ContextMenu />
      <GlitchBanner />
      <SubHead icon="sparkle" title="Immersive & live" desc="Equity playback, spotlight, magnets, transitions, skeletons, tape, stats, marquees" tone="#ffc23d" count={10} />
      <EquityCurve />
      <Spotlight />
      <MagneticPlay />
      <PageTransitions />
      <SkeletonMorph />
      <LiveTape />
      <StatDash />
      <Headlines />
      <TiltShow />
      <Chapters />
    </Section>
  );
}
