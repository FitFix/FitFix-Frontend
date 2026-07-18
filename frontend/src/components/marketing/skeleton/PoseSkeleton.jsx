import { useRef } from 'react';
import { motion, useAnimationFrame, useInView, useReducedMotion } from 'framer-motion';
import { BONES, jointAngle } from './poses';
import { TIMING, GRAMMAR } from '../motion/orchestration';

// The Living Skeleton — a side-view FK rig performing a continuous squat loop.
// Limbs draw in via pathLength on mount; after that a single rAF loop writes
// rotate() attribute transforms straight to the DOM (native local-origin pivots,
// zero React re-renders). Rep 3 of every loop is a shallow-depth fault: the knee
// joint flashes amber and an angle arc appears; rep 4 corrects in cyan.
// aria-hidden — the sr-only narrative lives beside it.

const CY = GRAMMAR.clean;

function Bone({ x2 = 0, y2, drawDelay, far = false }) {
  return (
    <motion.line
      x1={0} y1={0} x2={far ? x2 - 6 : x2} y2={y2}
      stroke={CY}
      strokeWidth={far ? 2.4 : 3}
      strokeLinecap="round"
      opacity={far ? 0.35 : 1}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.45, delay: drawDelay, ease: 'easeOut' }}
    />
  );
}

function Joint({ cx = 0, cy = 0, r = 3.4, refProp }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 3.5} fill={CY} opacity={0.12} />
      <circle ref={refProp} cx={cx} cy={cy} r={r} fill={CY} />
    </g>
  );
}

export default function PoseSkeleton({ className = '' }) {
  const wrapRef = useRef(null);
  const shinRef = useRef(null);
  const thighRef = useRef(null);
  const torsoRef = useRef(null);
  const armRef = useRef(null);
  const kneeDotRef = useRef(null);
  const arcRef = useRef(null);
  const hipDotRef = useRef(null);

  const inView = useInView(wrapRef, { amount: 0.2 });
  const reduced = useReducedMotion();

  useAnimationFrame((t) => {
    if (reduced || !inView) return;
    const sec = t / 1000;
    if (sec < TIMING.drawIn) return; // hold standing pose while limbs draw in

    const loopT = (sec - TIMING.drawIn) % TIMING.loopDuration;
    const rep = Math.floor(loopT / TIMING.repCycle);
    const phase = (loopT % TIMING.repCycle) / TIMING.repCycle;
    const isFault = rep === 2;

    shinRef.current?.setAttribute('transform', `rotate(${jointAngle('shin', phase, isFault)})`);
    thighRef.current?.setAttribute('transform', `rotate(${jointAngle('knee', phase, isFault)})`);
    torsoRef.current?.setAttribute('transform', `rotate(${jointAngle('hip', phase, isFault)})`);
    armRef.current?.setAttribute('transform', `rotate(${jointAngle('arm', phase, isFault)})`);

    // fault visuals: amber knee + angle arc while the shallow rep is near depth
    const hot = isFault && phase > 0.35 && phase < 0.8;
    if (kneeDotRef.current) kneeDotRef.current.setAttribute('fill', hot ? GRAMMAR.warn : CY);
    if (hipDotRef.current) hipDotRef.current.setAttribute('fill', hot ? GRAMMAR.warn : CY);
    if (arcRef.current) arcRef.current.setAttribute('opacity', hot ? '1' : '0');
  });

  const { shin, thigh, torso, neck, upperArm, forearm } = BONES;
  let delay = 0.12;
  const next = () => (delay += 0.14);

  return (
    <div ref={wrapRef} className={className}>
      <svg
        viewBox="0 0 220 250"
        className="w-full h-auto"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        {/* ground */}
        <motion.line
          x1={30} y1={222} x2={195} y2={222}
          stroke="rgba(255,255,255,0.12)" strokeWidth={1}
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* foot (static at the ankle root) */}
        <g transform="translate(104,216)">
          <Bone x2={20} y2={5} drawDelay={0.1} />
          {/* ankle root -> nested FK chain */}
          <g ref={shinRef}>
            <Bone y2={-shin} drawDelay={next()} far />
            <Bone y2={-shin} drawDelay={delay} />
            <Joint />
            <g transform={`translate(0,${-shin})`}>
              {/* knee pivot */}
              <g ref={thighRef}>
                <Bone y2={-thigh} drawDelay={next()} far />
                <Bone y2={-thigh} drawDelay={delay} />
                <Joint refProp={kneeDotRef} r={4} />
                {/* fault angle arc, revealed only during the shallow rep */}
                <path
                  ref={arcRef}
                  d="M 14 -6 A 16 16 0 0 1 6 14"
                  fill="none"
                  stroke={GRAMMAR.warn}
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  opacity="0"
                />
                <g transform={`translate(0,${-thigh})`}>
                  {/* hip pivot */}
                  <g ref={torsoRef}>
                    <Bone y2={-torso} drawDelay={next()} />
                    <Joint refProp={hipDotRef} r={4} />
                    <g transform={`translate(0,${-torso})`}>
                      {/* shoulder / neck / head */}
                      <Joint r={3.4} />
                      <Bone y2={-neck} drawDelay={next()} />
                      <motion.circle
                        cx={0} cy={-neck - 11} r={10}
                        fill="none" stroke={CY} strokeWidth={3}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.45, delay: next(), ease: 'easeOut' }}
                      />
                      {/* arm chain (drawn downward from shoulder) */}
                      <g ref={armRef}>
                        <Bone y2={upperArm} drawDelay={next()} far />
                        <Bone y2={upperArm} drawDelay={delay} />
                        <g transform={`translate(0,${upperArm}) rotate(8)`}>
                          <Bone y2={forearm} drawDelay={next()} />
                          <Joint cy={forearm} r={2.8} />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
