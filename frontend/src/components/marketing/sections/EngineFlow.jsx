// EngineFlow — "how it works" architecture section.
// Three glass nodes (camera -> vision core -> dashboard) joined by measured SVG
// beams that pulse left-to-right. Beams are desktop-only decoration (aria-hidden);
// the copy carries the full story on its own.
import { useLayoutEffect, useRef, useState, useCallback, useId } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Camera, Cpu, LayoutDashboard } from 'lucide-react';
import Eyebrow from '../primitives/Eyebrow';
import GlassCard from '../primitives/GlassCard';
import {
  blurRiseVariants,
  containerVariants,
  itemVariants,
  VIEWPORT_ONCE,
  GRAMMAR,
} from '../motion/orchestration';

const STEPS = [
  {
    icon: Camera,
    title: 'Any camera',
    body: 'One standard camera per floor. No wearables, no member setup.',
  },
  {
    icon: Cpu,
    title: 'FitFix Vision core',
    body: '17-keypoint pose model runs on-device. Member video is processed at the edge — it never leaves your building.',
    core: true,
  },
  {
    icon: LayoutDashboard,
    title: 'Trainer dashboard',
    body: 'Faults, reps and form scores stream to the floor dashboard in real time.',
  },
];

// True product facts (exercise registry, per-joint rule engine, socket.io alerts).
const FACTS = ['11-exercise registry', 'Rule-based feedback per joint', 'Socket.io live alerts'];

// Beam pulse rhythm: travel + rest = 4s cycle, second beam trails by 1.2s.
const PULSE_TRAVEL = 1.4;
const PULSE_PERIOD = 4;
const PULSE_STAGGER = 1.2;

export default function EngineFlow() {
  const gid = useId();
  const wrapRef = useRef(null);
  // Refs land on untransformed wrapper divs so reveal transforms (y-rise on the
  // inner motion.div) can never skew the measured beam geometry.
  const cardRefs = [useRef(null), useRef(null), useRef(null)];
  const [beams, setBeams] = useState([]);

  const beamsInView = useInView(wrapRef, { amount: 0.4 });
  const reduceMotion = useReducedMotion();

  const compute = useCallback(() => {
    const container = wrapRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();
    const rects = cardRefs.map((r) => r.current?.getBoundingClientRect());
    if (rects.some((r) => !r)) return;

    const next = [];
    for (let i = 0; i < rects.length - 1; i += 1) {
      const a = rects[i];
      const b = rects[i + 1];
      const x1 = a.right - cRect.left;
      const y1 = a.top + a.height / 2 - cRect.top;
      const x2 = b.left - cRect.left;
      const y2 = b.top + b.height / 2 - cRect.top;
      // Stacked layout (cards not side by side) — no beams to draw.
      if (x2 - x1 < 8) {
        setBeams([]);
        return;
      }
      const mx = (x1 + x2) / 2;
      next.push({
        d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${mx.toFixed(1)} ${y1.toFixed(1)}, ${mx.toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`,
        x1,
        y1,
        x2,
        y2,
      });
    }
    setBeams(next);
    // cardRefs is a stable tuple of refs; identity never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    cardRefs.forEach((r) => {
      if (r.current) ro.observe(r.current);
    });
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compute]);

  const pulsesActive = beamsInView && !reduceMotion;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-h"
      className="relative scroll-mt-24 px-6 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mx-auto max-w-3xl text-center"
        >
          <Eyebrow>Architecture · edge inference</Eyebrow>
          <h2
            id="how-h"
            className="mt-6 font-extrabold tracking-tight text-text text-[clamp(1.9rem,1.2rem_+_2.6vw,3.25rem)] leading-[1.08]"
          >
            Camera in. Coaching out.
            <br className="hidden sm:block" /> Nothing leaves the building.
          </h2>
        </motion.div>

        {/* Nodes + measured beam overlay */}
        <div ref={wrapRef} className="relative mt-14 lg:mt-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-16"
          >
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} ref={cardRefs[i]} className="h-full">
                  <motion.div variants={itemVariants} className="h-full">
                    <GlassCard
                      className="h-full p-6 lg:p-7"
                      style={step.core ? { borderColor: 'rgba(0, 229, 255, 0.30)' } : undefined}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10"
                          aria-hidden="true"
                        >
                          <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                        </span>
                        <span
                          className="text-xs font-semibold tabular-nums text-[var(--text-muted)]"
                          aria-hidden="true"
                        >
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold tracking-tight text-text">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                        {step.body}
                      </p>
                    </GlassCard>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>

          {/* Connecting beams — decorative, desktop only, measured against the grid */}
          <motion.svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            aria-hidden="true"
            focusable="false"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.7, delay: 0.45 } },
            }}
          >
            <defs>
              {beams.map((beam, i) => (
                <linearGradient
                  key={`grad-${i}`}
                  id={`${gid}-beam-${i}`}
                  gradientUnits="userSpaceOnUse"
                  x1={beam.x1}
                  y1={beam.y1}
                  x2={beam.x2}
                  y2={beam.y2}
                >
                  <stop offset="0%" stopColor={GRAMMAR.clean} stopOpacity="0.06" />
                  <stop offset="50%" stopColor={GRAMMAR.clean} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={GRAMMAR.clean} stopOpacity="0.06" />
                </linearGradient>
              ))}
            </defs>
            {beams.map((beam, i) => (
              <g key={beam.d}>
                {/* Static beam */}
                <path
                  d={beam.d}
                  fill="none"
                  stroke={`url(#${gid}-beam-${i})`}
                  strokeWidth="1.5"
                />
                {/* Traveling pulse — a short pathLength segment sweeping start -> end */}
                {pulsesActive && (
                  <motion.path
                    d={beam.d}
                    fill="none"
                    stroke={GRAMMAR.clean}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0.4, pathOffset: 0, opacity: 0 }}
                    animate={{ pathOffset: [0, 0.6], opacity: [0, 1, 1, 0] }}
                    transition={{
                      pathOffset: {
                        duration: PULSE_TRAVEL,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        repeatDelay: PULSE_PERIOD - PULSE_TRAVEL,
                        delay: i * PULSE_STAGGER,
                      },
                      opacity: {
                        duration: PULSE_TRAVEL,
                        times: [0, 0.2, 0.8, 1],
                        repeat: Infinity,
                        repeatDelay: PULSE_PERIOD - PULSE_TRAVEL,
                        delay: i * PULSE_STAGGER,
                      },
                    }}
                  />
                )}
              </g>
            ))}
          </motion.svg>
        </div>

        {/* Fact chips */}
        <motion.ul
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mt-10 flex flex-wrap items-center justify-center gap-2.5"
        >
          {FACTS.map((fact) => (
            <motion.li
              key={fact}
              variants={itemVariants}
              className="rounded-full border border-white/10 px-3.5 py-1.5 text-xs tabular-nums text-[var(--text-muted)]"
            >
              {fact}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
