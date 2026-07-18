import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

// Counts up once when scrolled into view. The churn is aria-hidden;
// screen readers get the final value only.
export default function NumberTicker({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 80, damping: 30 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setDisplay(value.toFixed(decimals)); return; }
    mv.set(value);
    const unsub = spring.on('change', (v) => setDisplay(v.toFixed(decimals)));
    return unsub;
  }, [inView, reduced, value, decimals, mv, spring]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {prefix}{display}{suffix}
      </span>
      <span className="sr-only">{prefix}{value.toFixed(decimals)}{suffix}</span>
    </span>
  );
}
