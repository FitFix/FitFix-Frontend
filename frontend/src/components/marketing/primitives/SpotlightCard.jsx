import { useRef, useState, useEffect } from 'react';
import {
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
  motion,
} from 'framer-motion';

// Cursor spotlight via the CSS-var bridge (mousemove writes motion values,
// CSS paints the gradient — zero React re-renders) plus a subtle 3D tilt
// toward the cursor. Tilt only engages on hover-capable fine pointers with
// motion allowed; everywhere else the card stays flat.
const TILT_QUERY = '(hover: hover) and (pointer: fine)';
const MAX_TILT = 5; // degrees

export default function SpotlightCard({ children, className = '', radius = 240 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(TILT_QUERY);
    setCanTilt(mq.matches);
    const onChange = (e) => setCanTilt(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });

  const tilting = canTilt && !reduced;

  const onMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    x.set(px);
    y.set(py);
    if (tilting) {
      tiltY.set(((px / rect.width) - 0.5) * 2 * MAX_TILT);
      tiltX.set((0.5 - (py / rect.height)) * 2 * MAX_TILT);
    }
  };

  const onMouseLeave = () => {
    x.set(-9999);
    y.set(-9999);
    tiltX.set(0);
    tiltY.set(0);
  };

  const spotlight = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, rgba(0,229,255,0.09), transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={tilting ? { rotateX: tiltX, rotateY: tiltY, transformPerspective: 800 } : undefined}
      className={`relative group glass rounded-2xl shadow-[inset_0_0.5px_0_rgba(255,255,255,0.10),0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden ${className}`}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: spotlight }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}
