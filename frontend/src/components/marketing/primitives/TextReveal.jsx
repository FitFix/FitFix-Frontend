import { motion, useReducedMotion } from 'framer-motion';
import { VIEWPORT_ONCE } from '../motion/orchestration';

// Word-staggered blur-rise reveal, fires once. Words wrap naturally.
export default function TextReveal({ children, className = '', as: Tag = 'p', delay = 0 }) {
  const reduced = useReducedMotion();
  const words = String(children).split(' ');
  const MotionTag = motion.create(Tag);

  if (reduced) return <Tag className={className}>{children}</Tag>;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      transition={{ staggerChildren: 0.035, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className="inline-block will-change-transform"
          variants={{
            hidden: { opacity: 0, y: 10, filter: 'blur(8px)' },
            visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } },
          }}
        >
          {w}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </MotionTag>
  );
}
