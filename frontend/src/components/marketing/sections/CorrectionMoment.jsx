import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import Eyebrow from '../primitives/Eyebrow';
import GlassCard from '../primitives/GlassCard';
import KioskFrame from '../primitives/KioskFrame';
import {
  blurRiseVariants,
  containerVariants,
  GRAMMAR,
  VIEWPORT_ONCE,
} from '../motion/orchestration';

// THE CORRECTION MOMENT — the signature scroll sequence.
// Desktop (lg+ AND pointer:fine AND no reduced motion): a 300vh scrub. Native
// scroll drives a sticky kiosk scene — continuous values (form score, ring,
// depth angle) map straight off scrollYProgress (no springs), while three
// discrete beats flip on thresholded change events with ±0.02 hysteresis.
// No wheel/touch listeners anywhere — the scrollbar always wins.
// Everyone else gets three stacked glass cards, one per beat, amber middle.

const BEATS = [
  { label: 'Tracking · rep 1-2', color: GRAMMAR.clean },
  { label: 'Depth 12° short · rep 3', color: GRAMMAR.warn },
  { label: 'Corrected · rep counted', color: GRAMMAR.clean },
];

const CLAIMS = [
  'Every rep is tracked — 17 joints at 30 frames a second.',
  'Faults are flagged the moment they happen, at the joint, in plain language.',
  'The member self-corrects. The rep counts. The trainer sees it all.',
];

const THRESHOLDS = [0.33, 0.66];
const HYSTERESIS = 0.02;

const SR_NARRATIVE =
  'Demo transcript: reps 1 and 2 tracked clean at 30 frames a second. ' +
  'Rep 3 flagged — depth 12 degrees short of the 90-degree target, marked amber at the knee. ' +
  'The member corrects, rep 4 counts, and the form score climbs from 87 to 96.';

const H2_CLASS =
  'mt-5 font-extrabold tracking-tight leading-[1.08] text-text text-[clamp(2rem,1.35rem+2.2vw,3.25rem)]';

const DESKTOP_QUERY = '(min-width: 1024px) and (pointer: fine)';

// Move up when progress clears the next threshold (+hysteresis), down when it
// falls back below the previous one (−hysteresis). In between, hold.
function resolveBeat(current, v) {
  let b = current;
  while (b < THRESHOLDS.length && v >= THRESHOLDS[b] + HYSTERESIS) b += 1;
  while (b > 0 && v <= THRESHOLDS[b - 1] - HYSTERESIS) b -= 1;
  return b;
}

function SceneJoint({ cx, cy, r = 4 }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 3.5} fill={GRAMMAR.clean} opacity={0.12} />
      <circle cx={cx} cy={cy} r={r} fill={GRAMMAR.clean} />
    </g>
  );
}

function StickySequence() {
  const wrapperRef = useRef(null);
  const beatRef = useRef(0);
  const [beat, setBeat] = useState(0);

  // Manual scroll progress. Framer's useScroll(target) resolves the target's
  // offsets once at mount; this section mounts late (after the desktop media
  // gate settles), so those offsets go stale and progress freezes at 0.
  // One rect read per scroll frame is deterministic and just as cheap.
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      scrollYProgress.set(total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollYProgress]);

  // Continuous channels — direct useTransform mapping, no springs.
  const score = useTransform(scrollYProgress, [0.5, 0.9], [87, 96]);
  const scoreRounded = useTransform(score, Math.round);
  const scoreText = useMotionTemplate`${scoreRounded}`;
  const ringOffset = useTransform(score, (v) => 1 - v / 100);

  // Depth reads clean (90°) through the tracking beat, dips to 78° for the
  // fault freeze — 12° short of target — then recovers through the correction.
  const depth = useTransform(scrollYProgress, [0.33, 0.4, 0.62, 0.85], [90, 78, 78, 90]);
  const depthRounded = useTransform(depth, Math.round);
  const depthText = useMotionTemplate`${depthRounded}°`;

  // Discrete beats — thresholded change events with hysteresis so a rep never
  // flickers at a boundary. State only updates on actual transitions.
  useEffect(() => {
    const apply = (v) => {
      const next = resolveBeat(beatRef.current, v);
      if (next !== beatRef.current) {
        beatRef.current = next;
        setBeat(next);
      }
    };
    apply(scrollYProgress.get());
    const unsubscribe = scrollYProgress.on('change', apply);
    return unsubscribe;
  }, [scrollYProgress]);

  const beatColor = BEATS[beat].color;

  return (
    <section id="demo" aria-labelledby="demo-h" className="relative">
      <p className="sr-only">{SR_NARRATIVE}</p>

      <div ref={wrapperRef} className="relative h-[300vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <div className="w-full max-w-6xl mx-auto px-6 grid lg:grid-cols-[1fr_1.4fr] gap-10 items-center">
            {/* Left rail — heading + one claim per beat */}
            <motion.div
              variants={blurRiseVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
            >
              <Eyebrow>Correction moment</Eyebrow>
              <h2 id="demo-h" className={H2_CLASS}>
                Watch a fault become a clean rep.
              </h2>

              <div className="mt-10 flex flex-col gap-6">
                {CLAIMS.map((claim, i) => (
                  <motion.div
                    key={claim}
                    initial={false}
                    animate={{
                      opacity: beat === i ? 1 : 0.35,
                      borderColor: beat === i ? BEATS[i].color : 'rgba(255,255,255,0.12)',
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="border-l-2 pl-5"
                  >
                    <p
                      className="text-[11px] font-semibold tracking-[0.16em] tabular-nums"
                      style={{ color: BEATS[i].color }}
                    >
                      0{i + 1}
                    </p>
                    <p className="mt-1.5 text-lg text-text">{claim}</p>
                  </motion.div>
                ))}
              </div>

              <p className="mt-10 text-sm text-[var(--text-muted)]">
                Keep scrolling — the sequence follows you.
              </p>
            </motion.div>

            {/* Right — kiosk scene */}
            <motion.div
              variants={blurRiseVariants}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_ONCE}
            >
              <KioskFrame>
                <svg
                  viewBox="0 0 400 300"
                  className="w-full h-auto block"
                  aria-hidden="true"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <defs>
                    <pattern id="cm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="400" height="300" fill="url(#cm-grid)" />

                  {/* Rep ticks — 1-2 clean, 3 flagged amber, 4 counts on correction */}
                  <text x="28" y="36" fontSize="10" letterSpacing="1.5" fill="var(--text-muted)">
                    REPS
                  </text>
                  {[0, 1, 2, 3].map((i) => {
                    const filled = i < 2 || (i === 2 && beat >= 1) || (i === 3 && beat === 2);
                    const fill = !filled
                      ? 'rgba(255,255,255,0.12)'
                      : i === 2
                        ? GRAMMAR.warn
                        : GRAMMAR.clean;
                    return (
                      <rect
                        key={i}
                        x={70 + i * 26}
                        y={28}
                        width="18"
                        height="6"
                        rx="3"
                        fill={fill}
                        style={{ transition: 'fill 0.25s ease' }}
                      />
                    );
                  })}

                  {/* Mini pose figure — mid-squat freeze frame, side view */}
                  <g strokeLinecap="round">
                    <g stroke="rgba(248,249,250,0.55)" strokeWidth="3" fill="none">
                      <circle cx="108" cy="84" r="11" />
                      <line x1="102" y1="104" x2="84" y2="176" />
                      <path d="M 102 104 L 132 112 L 158 106" />
                      <line x1="84" y1="176" x2="122" y2="212" />
                      <line x1="122" y1="212" x2="104" y2="258" />
                      <line x1="104" y1="258" x2="134" y2="262" />
                    </g>

                    <SceneJoint cx={102} cy={104} />
                    <SceneJoint cx={132} cy={112} r={3.4} />
                    <SceneJoint cx={84} cy={176} />
                    <SceneJoint cx={104} cy={258} r={3.4} />

                    {/* Knee — the joint the fault lives at */}
                    <circle cx="122" cy="212" r="8" fill={beatColor} opacity={0.14} style={{ transition: 'fill 0.3s ease' }} />
                    <motion.circle
                      cx="122"
                      cy="212"
                      r="4.5"
                      initial={false}
                      animate={{ fill: beat === 1 ? GRAMMAR.warn : GRAMMAR.clean }}
                      transition={{ duration: 0.3 }}
                    />

                    {/* Knee angle arc — draws in amber on the fault freeze */}
                    <motion.path
                      d="M 107.5 198.2 A 20 20 0 0 0 114.7 230.6"
                      fill="none"
                      stroke={GRAMMAR.warn}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: beat === 1 ? 1 : 0, opacity: beat === 1 ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </g>

                  {/* Form score ring — strokeDashoffset mapped from scroll */}
                  <circle
                    cx="300"
                    cy="118"
                    r="58"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="300"
                    cy="118"
                    r="58"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    transform="rotate(-90 300 118)"
                    initial={false}
                    animate={{ stroke: beatColor }}
                    transition={{ duration: 0.3 }}
                    style={{ strokeDashoffset: ringOffset }}
                  />
                  <motion.text
                    x="300"
                    y="132"
                    textAnchor="middle"
                    fontSize="40"
                    fontWeight="800"
                    fill={GRAMMAR.clean}
                  >
                    {scoreText}
                  </motion.text>
                  <text
                    x="300"
                    y="156"
                    textAnchor="middle"
                    fontSize="9"
                    letterSpacing="1.5"
                    fill="var(--text-muted)"
                  >
                    FORM SCORE
                  </text>

                  {/* Large angle readout */}
                  <text
                    x="300"
                    y="216"
                    textAnchor="middle"
                    fontSize="9"
                    letterSpacing="1.5"
                    fill="var(--text-muted)"
                  >
                    DEPTH ANGLE
                  </text>
                  <motion.text
                    x="300"
                    y="250"
                    textAnchor="middle"
                    fontSize="34"
                    fontWeight="800"
                    initial={false}
                    animate={{ fill: beatColor }}
                    transition={{ duration: 0.3 }}
                  >
                    {depthText}
                  </motion.text>
                  <text
                    x="300"
                    y="270"
                    textAnchor="middle"
                    fontSize="9"
                    letterSpacing="1.2"
                    fill="var(--text-muted)"
                  >
                    TARGET 90°
                  </text>
                </svg>

                {/* Detection log strip — one line per beat, simple crossfade */}
                <div className="relative h-12 border-t border-white/5" aria-hidden="true">
                  {BEATS.map((b, i) => (
                    <motion.p
                      key={b.label}
                      initial={false}
                      animate={{ opacity: beat === i ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="absolute inset-0 flex items-center gap-2 px-5 text-[13px] font-semibold tabular-nums"
                      style={{ color: b.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ background: b.color }}
                      />
                      {b.label}
                    </motion.p>
                  ))}
                </div>
              </KioskFrame>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StackedFallback() {
  return (
    <section id="demo" aria-labelledby="demo-h" className="relative py-24 px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="max-w-6xl mx-auto"
      >
        <motion.div variants={blurRiseVariants}>
          <Eyebrow>Correction moment</Eyebrow>
          <h2 id="demo-h" className={H2_CLASS}>
            Watch a fault become a clean rep.
          </h2>
        </motion.div>

        <div className="mt-10 flex flex-col gap-4 max-w-2xl">
          {BEATS.map((b, i) => (
            <motion.div key={b.label} variants={blurRiseVariants}>
              <GlassCard
                className="p-6"
                style={i === 1 ? { borderColor: 'rgba(255,176,32,0.35)' } : undefined}
              >
                <p
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] tabular-nums"
                  style={{ color: b.color }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: b.color }}
                    aria-hidden="true"
                  />
                  {b.label}
                </p>
                <p className="mt-3 text-lg text-text">{CLAIMS[i]}</p>
                {i === 2 && (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    Form score{' '}
                    <span className="font-bold text-accent tabular-nums">87 → 96</span> across
                    the set.
                  </p>
                )}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default function CorrectionMoment() {
  const reduced = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DESKTOP_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    // Re-sync on attach: the query can flip between the useState initializer
    // and this effect running, and that transition would otherwise be missed.
    setIsDesktop(mq.matches);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isDesktop && !reduced ? <StickySequence /> : <StackedFallback />;
}
