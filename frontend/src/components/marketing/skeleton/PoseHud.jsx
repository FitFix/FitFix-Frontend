import { useRef } from 'react';
import { useAnimationFrame, useInView, useReducedMotion } from 'framer-motion';
import { jointAngle } from './poses';
import { TIMING, GRAMMAR } from '../motion/orchestration';

// HUD instrument layer around the living skeleton: corner brackets, camera
// status chips, and a live knee-angle readout. The readout derives from the
// same pose data the rig animates with (shared TIMING + jointAngle), written
// straight to the DOM each frame — deterministic sync, zero re-renders.
// Purely decorative: everything here is aria-hidden.

const STAND_KNEE = '172.0';

function Bracket({ className }) {
  return (
    <span
      className={`absolute w-5 h-5 border-[rgba(0,229,255,0.45)] ${className}`}
      aria-hidden="true"
    />
  );
}

function Chip({ children, pulse = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] tracking-[0.14em] text-[var(--text-muted)]">
      {pulse && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-accent motion-safe:animate-pulse"
          style={{ boxShadow: `0 0 6px ${GRAMMAR.clean}` }}
        />
      )}
      {children}
    </span>
  );
}

export default function PoseHud({ children, className = '' }) {
  const wrapRef = useRef(null);
  const kneeRef = useRef(null);
  const confRef = useRef(null);
  const inView = useInView(wrapRef, { amount: 0.2 });
  const reduced = useReducedMotion();

  useAnimationFrame((t) => {
    if (reduced || !inView || !kneeRef.current) return;
    const sec = t / 1000;
    if (sec < TIMING.drawIn) return;

    const loopT = (sec - TIMING.drawIn) % TIMING.loopDuration;
    const rep = Math.floor(loopT / TIMING.repCycle);
    const phase = (loopT % TIMING.repCycle) / TIMING.repCycle;
    const isFault = rep === 2;

    // Interior knee angle from the same relative flexion the rig renders.
    const interior = 180 - Math.abs(jointAngle('knee', phase, isFault));
    const hot = isFault && phase > 0.35 && phase < 0.8;
    kneeRef.current.textContent = `KNEE ${interior.toFixed(1)}°`;
    kneeRef.current.style.color = hot ? GRAMMAR.warn : GRAMMAR.clean;
    if (confRef.current) {
      // Confidence dips slightly at speed, recovers at the turnarounds.
      const conf = 0.96 + 0.03 * Math.abs(Math.cos(phase * Math.PI * 2));
      confRef.current.textContent = `CONF ${Math.min(conf, 0.99).toFixed(2)}`;
    }
  });

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div aria-hidden="true">
        <Bracket className="top-0 left-0 border-t-2 border-l-2" />
        <Bracket className="top-0 right-0 border-t-2 border-r-2" />
        <Bracket className="bottom-0 left-0 border-b-2 border-l-2" />
        <Bracket className="bottom-0 right-0 border-b-2 border-r-2" />

        <div className="absolute -top-3 left-6 right-6 flex justify-between">
          <Chip pulse>CAM 01 · LIVE</Chip>
          <Chip>POSE LOCK 17/17</Chip>
        </div>

        <div className="absolute -bottom-3 left-6 right-6 flex justify-between font-mono text-[10px] tracking-[0.12em]" style={{ fontVariantNumeric: 'tabular-nums' }}>
          <span ref={kneeRef} style={{ color: GRAMMAR.clean }}>
            KNEE {STAND_KNEE}°
          </span>
          <span ref={confRef} className="text-[var(--text-muted)]">
            CONF 0.98
          </span>
        </div>
      </div>

      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
