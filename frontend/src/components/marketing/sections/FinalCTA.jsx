// Final CTA — the emotional line lives here, over the lead form every
// primary CTA on the page anchors to (#walkthrough). Human voice.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../primitives/GlassCard';
import SectionBloom from '../primitives/SectionBloom';
import { blurRiseVariants, VIEWPORT_ONCE } from '../motion/orchestration';
import { API_BASE_URL } from '../../../config';

const INPUT_CLASSES =
  'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text placeholder:text-[var(--text-muted)] focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-colors';

const LABEL_CLASSES = 'block text-sm font-semibold text-text mb-2';

export default function FinalCTA() {
  const [gymName, setGymName] = useState('');
  const [locations, setLocations] = useState('1');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');

    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymName: gymName.trim(),
          locations: Math.max(1, Number(locations) || 1),
          email: email.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section aria-labelledby="cta-h" className="relative py-32 px-6">
      <SectionBloom className="inset-x-0 mx-auto top-12 h-[26rem] w-[min(42rem,90vw)]" />

      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <h2
            id="cta-h"
            className="font-extrabold tracking-tight text-text text-[length:clamp(2.5rem,1.6rem+3.5vw,4.5rem)] leading-[1.05]"
          >
            Make every rep count.
          </h2>
          <p className="mt-5 max-w-xl mx-auto text-lg text-[var(--text-muted)] leading-relaxed">
            A 20-minute walkthrough of your floor is all it takes to scope
            the pilot.
          </p>
        </motion.div>

        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          id="walkthrough"
          className="mt-12 scroll-mt-28"
        >
          <GlassCard className="max-w-lg mx-auto p-8 text-left">
            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {status === 'success' ? (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="text-center py-4"
                  >
                    <p className="text-2xl font-extrabold tracking-tight text-text">
                      Locked in.
                    </p>
                    <p className="mt-3 text-[var(--text-muted)] leading-relaxed">
                      We&rsquo;ll reach out within one business day.
                    </p>
                    <p className="mt-6 text-sm text-[var(--text-muted)]">
                      Can&rsquo;t wait?{' '}
                      <a
                        href="mailto:fitfix@gmail.com"
                        className="text-accent hover:underline"
                      >
                        fitfix@gmail.com
                      </a>{' '}
                      or{' '}
                      <a
                        href="tel:+918146830484"
                        className="text-accent hover:underline tabular-nums"
                      >
                        +91 81468 30484
                      </a>
                      .
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSubmit}
                    noValidate={false}
                  >
                    <div className="flex flex-col gap-5">
                      <div>
                        <label htmlFor="lead-gym-name" className={LABEL_CLASSES}>
                          Gym name
                        </label>
                        <input
                          id="lead-gym-name"
                          name="gymName"
                          type="text"
                          required
                          autoComplete="organization"
                          placeholder="Iron Works Fitness"
                          value={gymName}
                          onChange={(e) => setGymName(e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      </div>

                      <div>
                        <label htmlFor="lead-locations" className={LABEL_CLASSES}>
                          Locations
                        </label>
                        <input
                          id="lead-locations"
                          name="locations"
                          type="number"
                          min={1}
                          inputMode="numeric"
                          value={locations}
                          onChange={(e) => setLocations(e.target.value)}
                          className={`${INPUT_CLASSES} tabular-nums`}
                        />
                      </div>

                      <div>
                        <label htmlFor="lead-email" className={LABEL_CLASSES}>
                          Work email
                        </label>
                        <input
                          id="lead-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="you@yourgym.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      </div>

                      {status === 'error' && (
                        <p className="text-sm text-[#FF6B76]" role="alert">
                          That didn&rsquo;t go through. Try again, or email{' '}
                          <a
                            href="mailto:fitfix@gmail.com"
                            className="underline"
                          >
                            fitfix@gmail.com
                          </a>
                          .
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        aria-busy={status === 'loading'}
                        className="w-full px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all inline-block disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === 'loading'
                          ? 'Booking…'
                          : 'Book my walkthrough'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          <p className="mt-4 text-xs text-[var(--text-muted)] text-center">
            Prefer humans?{' '}
            <a
              href="mailto:fitfix@gmail.com"
              className="hover:text-accent transition-colors"
            >
              fitfix@gmail.com
            </a>{' '}
            &middot;{' '}
            <a
              href="tel:+918146830484"
              className="hover:text-accent transition-colors tabular-nums"
            >
              +91 81468 30484
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
