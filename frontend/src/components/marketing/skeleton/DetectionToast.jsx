import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TIMING, GRAMMAR } from '../motion/orchestration';

// Glass detection toast that narrates the skeleton's fault/correction beats.
// Schedules itself from the shared TIMING constants — no subscription to the
// skeleton's animation state. Decorative: aria-hidden (the sr-only narrative
// beside the skeleton carries the meaning for screen readers).

const STATES = {
  fault: { color: GRAMMAR.warn, dot: GRAMMAR.warn, text: 'Depth 12° short — sink to parallel' },
  corrected: { color: GRAMMAR.clean, dot: '#22C55E', text: 'Corrected · depth 96% · rep counted' },
};

export default function DetectionToast({ className = '' }) {
  const reduced = useReducedMotion();
  const [state, setState] = useState(reduced ? 'corrected' : null);

  useEffect(() => {
    if (reduced) return;
    const t1 = setTimeout(() => setState('fault'), TIMING.faultAt * 1000);
    const t2 = setTimeout(() => setState('corrected'), TIMING.correctedAt * 1000);
    const t3 = setTimeout(() => setState(null), (TIMING.correctedAt + 3.2) * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [reduced]);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <AnimatePresence>
        {state && (
          <motion.div
            key={state}
            initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="glass rounded-xl px-4 py-2.5 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.10),0_10px_30px_rgba(0,0,0,0.35)] inline-flex items-center gap-2.5"
          >
            <span
              className="w-2 h-2 rounded-full flex-none"
              style={{ background: STATES[state].dot, boxShadow: `0 0 8px ${STATES[state].dot}` }}
            />
            <span
              className="text-xs font-semibold tracking-wide"
              style={{ color: STATES[state].color, fontVariantNumeric: 'tabular-nums' }}
            >
              {STATES[state].text}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
