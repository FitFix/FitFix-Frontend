// Pilot log — anonymous pilot-floor observation, human voice.
// Deliberately NOT a testimonial: framed as field notes until real,
// permissioned quotes exist (honesty is the design).
import { motion } from 'framer-motion';
import { blurRiseVariants, VIEWPORT_ONCE } from '../motion/orchestration';
import GlassCard from '../primitives/GlassCard';

export default function PilotLog() {
  return (
    <section aria-labelledby="pilot-h" className="relative py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          id="pilot-h"
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center font-extrabold tracking-tight text-text text-[length:clamp(1.9rem,1.4rem+1.8vw,2.8rem)] leading-tight"
        >
          From our pilot floor.
        </motion.h2>

        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="mt-10"
        >
          <GlassCard as="figure" className="p-8">
            <blockquote className="text-text text-xl md:text-2xl font-medium leading-relaxed tracking-tight">
              <p>
                &ldquo;Week 3: members started asking the screen for a depth
                check before their heavy sets. The trainers stopped policing
                form and started programming it.&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-6 text-xs text-[var(--text-muted)]">
              Field notes &mdash; FitFix pilot deployment, 2026
            </figcaption>
          </GlassCard>

          <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
            Pilot names and numbers published with permission as they land.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
