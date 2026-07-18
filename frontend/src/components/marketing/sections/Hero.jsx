import { motion, useReducedMotion } from 'framer-motion';
import { TIMING, GRAMMAR, blurRiseVariants, VIEWPORT_ONCE } from '../motion/orchestration';
import Eyebrow from '../primitives/Eyebrow';
import SectionBloom from '../primitives/SectionBloom';
import FlipWords from '../primitives/FlipWords';
import StatNumeral from '../primitives/StatNumeral';
import PoseSkeleton from '../skeleton/PoseSkeleton';
import PoseHud from '../skeleton/PoseHud';
import DetectionToast from '../skeleton/DetectionToast';

// THE opening. Living skeleton on the right, verdict on the left, spec bar
// underneath. H1 lines clip-reveal ON MOUNT (never whileInView — this is the
// first paint); the outlined word fills cyan at TIMING.wordFillDelay so it
// lands just as the skeleton finishes drawing in. Reduced motion: everything
// renders pre-revealed and pre-filled.

const CY = GRAMMAR.clean;

// One H1 line: clip-path inset rising reveal. Negative final insets leave
// room for descenders + the outlined word's stroke (invalid-negative fallback
// in older engines simply means "no clip" — same end state).
function HeroLine({ delay, children }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="block"
      initial={reduced ? false : { clipPath: 'inset(0% 0% 100% 0%)', y: '0.3em' }}
      animate={{ clipPath: 'inset(-10% -5% -20% -2%)', y: '0em' }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}

// The outlined word: 1.5px cyan stroke + transparent fill, fills solid cyan
// at the shared wordFillDelay. Reduced motion renders it pre-filled.
function OutlinedWord({ children }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      style={{ WebkitTextStroke: `1.5px ${CY}` }}
      initial={
        reduced
          ? false
          : { color: 'rgba(0, 229, 255, 0)', WebkitTextFillColor: 'rgba(0, 229, 255, 0)' }
      }
      animate={{ color: CY, WebkitTextFillColor: CY }}
      transition={{ delay: reduced ? 0 : TIMING.wordFillDelay, duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.span>
  );
}

// On-mount fade-rise for the copy around the H1 (the H1 owns its own reveal).
function Rise({ delay, className = '', children }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

const CHIPS = ['No wearables', 'Works with any camera', '2-week install'];

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-h"
      className="relative min-h-[100svh] flex items-center pt-28 pb-12 overflow-hidden"
    >
      {/* background: engineering grid + one cyan bloom behind the skeleton */}
      <div aria-hidden="true" className="absolute inset-0 marketing-grid-bg" />
      <SectionBloom className="w-[600px] h-[600px] right-0 top-1/4" />

      <div className="relative w-full grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6">
        {/* LEFT — the verdict */}
        <div>
          <Rise delay={0}>
            <Eyebrow live>Pose engine · live</Eyebrow>
          </Rise>

          <h1
            id="hero-h"
            className="mt-6 font-extrabold leading-[1.02] tracking-[-0.04em] text-[clamp(3rem,1.8rem+4.5vw,6.5rem)] text-text"
          >
            <HeroLine delay={0.05}>Every rep.</HeroLine>
            <HeroLine delay={0.16}>
              Perfect <OutlinedWord>form.</OutlinedWord>
            </HeroLine>
          </h1>

          <Rise delay={0.35}>
            <p className="mt-6 text-lg text-[var(--text-muted)] max-w-[46ch]">
              Real-time AI form correction for your{' '}
              <FlipWords words={['squat', 'deadlift', 'bench press', 'lunge']} /> — no wearables,
              just one camera and {'<'}30ms of judgment.
            </p>
          </Rise>

          <Rise delay={0.45} className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#walkthrough"
              className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all inline-block"
            >
              Book a 20-min walkthrough
            </a>
            <a
              href="#demo"
              className="px-6 py-3 bg-transparent border border-white/15 text-text font-bold rounded-xl hover:bg-white/5 transition-colors inline-block"
            >
              Watch it work
            </a>
          </Rise>

          <Rise delay={0.55} className="mt-6 flex flex-wrap gap-2">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-[var(--text-muted)]"
              >
                {chip}
              </span>
            ))}
          </Rise>
        </div>

        {/* RIGHT — the living skeleton */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <PoseHud className="w-full max-w-[340px] lg:max-w-[460px] mx-auto">
            <PoseSkeleton className="w-full" />
          </PoseHud>
          <DetectionToast className="absolute top-8 right-0" />
          <p className="sr-only">
            Animated demo: a 17-point pose skeleton performs squats; FitFix flags a shallow-depth
            fault in amber on rep 3, then confirms the corrected rep in cyan.
          </p>
        </motion.div>

        {/* BOTTOM — spec bar */}
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="lg:col-span-2 border-y border-white/5 grid grid-cols-3 divide-x divide-white/5 py-6"
        >
          <StatNumeral value={17} label="joints tracked" className="px-2" />
          <StatNumeral value={30} label="frames / second" className="px-2" />
          <StatNumeral
            text={'<30ms'}
            label="inference latency"
            source="pilot hardware, single camera"
            className="px-2"
          />
        </motion.div>
      </div>
    </section>
  );
}
