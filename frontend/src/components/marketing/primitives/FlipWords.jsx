import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

// Cycles words a finite number of times, then settles (WCAG 2.2.2 — no
// indefinite auto-updating content). Rotating node is aria-hidden; screen
// readers get the static settled word.
export default function FlipWords({ words, cycles = 2, interval = 2200, className = '' }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduced || done) return;
    const total = words.length * cycles;
    let count = 0;
    const id = setInterval(() => {
      count += 1;
      if (count >= total) {
        setIndex(0);
        setDone(true);
        clearInterval(id);
      } else {
        setIndex((i) => (i + 1) % words.length);
      }
    }, interval);
    return () => clearInterval(id);
  }, [words, cycles, interval, reduced, done]);

  const settled = reduced || done;
  const word = settled ? words[0] : words[index];

  return (
    <span className={`relative inline-block align-baseline ${className}`}>
      <span className="sr-only">{words[0]}</span>
      {/* widest word reserves space so the line never shifts */}
      <span aria-hidden="true" className="invisible font-bold">
        {[...words].sort((a, b) => b.length - a.length)[0]}
      </span>
      <span aria-hidden="true" className="absolute inset-0">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={word + (settled ? '-settled' : '')}
            className="absolute left-0 font-bold text-accent"
            initial={settled ? false : { opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
