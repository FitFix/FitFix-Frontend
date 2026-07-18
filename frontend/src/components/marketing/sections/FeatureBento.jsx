import { motion } from 'framer-motion';
import Eyebrow from '../primitives/Eyebrow';
import SpotlightCard from '../primitives/SpotlightCard';
import NumberTicker from '../primitives/NumberTicker';
import SectionBloom from '../primitives/SectionBloom';
import {
  containerVariants,
  itemVariants,
  blurRiseVariants,
  VIEWPORT_ONCE,
  GRAMMAR,
} from '../motion/orchestration';

// The three-color legend. This cell TEACHES the page's color grammar — the one
// place red is allowed outside the dashboard hotspot, as a 10px legend dot only.
const LEGEND = [
  { color: GRAMMAR.clean, word: 'Clean', rest: 'tracked and counted' },
  { color: GRAMMAR.warn, word: 'Deviation', rest: 'coached in the moment' },
  { color: GRAMMAR.risk, word: 'Risk', rest: 'trainer alerted instantly' },
];

// Shared bento cell: staggered child of the grid's containerVariants.
// Titles stay sentence case in the DOM; uppercase happens in CSS.
function Cell({ title, caption, className = '', children }) {
  return (
    <motion.div variants={itemVariants} className="h-full">
      <SpotlightCard className={`h-full p-6 ${className}`}>
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-text">
          {title}
        </h3>
        {children}
        {caption && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
            {caption}
          </p>
        )}
      </SpotlightCard>
    </motion.div>
  );
}

// Semicircular form-score gauge. Static path; the fill arc reveals via
// pathLength (stroke-dasharray under the hood) once, in view. 0.96 = score 96.
function FormGauge() {
  return (
    <div className="relative mt-5 w-36">
      <svg viewBox="0 0 120 66" className="w-full" aria-hidden="true">
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <motion.path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 5px rgba(0,229,255,0.35))' }}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 0.96 }}
          viewport={VIEWPORT_ONCE}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-baseline justify-center gap-1">
        <span className="text-3xl font-extrabold tracking-tight text-text tabular-nums">
          96
        </span>
        <span className="text-xs font-semibold text-[var(--text-muted)]">/100</span>
      </div>
    </div>
  );
}

// Mini stacked floor-tablet alerts: one amber deviation event over one clean
// cyan event — the color grammar doing its job in miniature.
function AlertStack() {
  return (
    <div className="mt-5 space-y-2">
      <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 backdrop-blur-sm">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: GRAMMAR.warn, boxShadow: `0 0 6px ${GRAMMAR.warn}66` }}
        />
        <span className="text-xs font-medium text-text/90 tabular-nums">
          Station 4 · depth fading · set 3
        </span>
      </div>
      <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 opacity-60 backdrop-blur-sm">
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: GRAMMAR.clean, boxShadow: `0 0 6px ${GRAMMAR.clean}66` }}
        />
        <span className="text-xs font-medium text-text/90 tabular-nums">
          Station 2 · rep 12 counted · clean
        </span>
      </div>
    </div>
  );
}

export default function FeatureBento() {
  return (
    <section
      id="features"
      aria-labelledby="features-h"
      className="relative scroll-mt-28 px-6 py-24 md:py-32"
    >
      <SectionBloom className="left-1/2 top-24 h-[480px] w-[480px] -translate-x-1/2" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mb-12 flex flex-col items-center text-center md:mb-16"
        >
          <Eyebrow live>Live capability</Eyebrow>
          <h2
            id="features-h"
            className="mt-5 max-w-2xl text-[clamp(1.9rem,1.2rem+2.6vw,3.1rem)] font-extrabold leading-[1.08] tracking-tight text-text"
          >
            Everything the floor needs, nothing it doesn&rsquo;t.
          </h2>
          <p className="mt-4 max-w-xl text-base text-[var(--text-muted)] md:text-lg">
            Six live capabilities from one camera feed — at 30 fps, on the
            hardware you already own.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* 1 — Rep counting */}
          <Cell title="Rep counting" caption="Counted from real joint angles, not timers.">
            <div className="mt-5">
              <NumberTicker
                value={128}
                suffix=" reps"
                className="text-[2.75rem] font-extrabold leading-none tracking-tight text-accent"
              />
            </div>
          </Cell>

          {/* 2 — Form scoring */}
          <Cell
            title="Form scoring"
            caption="Every rep graded 0–100 from depth, tempo and alignment."
          >
            <FormGauge />
          </Cell>

          {/* 3 — Color grammar legend */}
          <Cell
            title="Color grammar"
            caption="The same grammar on every station, screen and alert."
          >
            <ul className="mt-5 space-y-3.5">
              {LEGEND.map(({ color, word, rest }) => (
                <li key={word} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}59` }}
                  />
                  <span className="text-sm">
                    <span className="font-semibold text-text">{word}</span>
                    <span className="text-[var(--text-muted)]"> — {rest}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Cell>

          {/* 4 — Injury prevention: THE one gradient card. No BorderBeam here —
              that's reserved for the featured pricing tier. The ! modifiers are
              required: unlayered .glass declarations beat layered utilities. */}
          <Cell
            title="Injury prevention"
            caption="Dangerous patterns are flagged before they become injuries — the fault is named at the joint, with the fix."
            className="bg-gradient-to-br! from-accent/15 to-transparent border-accent/30!"
          >
            <div
              aria-hidden="true"
              className="mt-5 flex h-9 w-9 items-center justify-center rounded-lg border border-accent/25 bg-accent/10"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-accent"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </Cell>

          {/* 5 — Any camera */}
          <Cell
            title="Any camera"
            caption="Runs on standard gym cameras. No proprietary hardware, no per-member devices."
          >
            <div
              aria-hidden="true"
              className="mt-5 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-text/70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
          </Cell>

          {/* 6 — Trainer alerts */}
          <Cell
            title="Trainer alerts"
            caption="Alerts reach the floor tablet the moment form degrades."
          >
            <AlertStack />
          </Cell>
        </motion.div>
      </div>
    </section>
  );
}
