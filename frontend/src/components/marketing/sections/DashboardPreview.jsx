// DASHBOARD PREVIEW — the B2B payoff. What the owner and head trainer see.
// Kiosk frame flattens from 22° to 0° as it scrolls into view (continuous,
// scroll-linked — allowed). Contents are a static mock in the app's real
// dashboard language. The floor heatmap carries THE page's single red pixel.
import { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Eyebrow from '../primitives/Eyebrow';
import GlassCard from '../primitives/GlassCard';
import KioskFrame from '../primitives/KioskFrame';
import SectionBloom from '../primitives/SectionBloom';
import {
  blurRiseVariants,
  containerVariants,
  VIEWPORT_ONCE,
  GRAMMAR,
} from '../motion/orchestration';

// 6x4 fault-density heatmap. Literal class names so Tailwind can see them.
// Index 13 (row 3, station 2) is the hotspot — rendered separately in red.
const HOTSPOT_INDEX = 13;
const HEAT_CELLS = [
  'bg-accent/10', 'bg-accent/20', 'bg-accent/15', 'bg-accent/25', 'bg-accent/10', 'bg-accent/15',
  'bg-accent/20', 'bg-accent/30', 'bg-accent/25', 'bg-accent/15', 'bg-accent/10', 'bg-accent/20',
  'bg-accent/15', 'bg-accent/10', 'bg-accent/30', 'bg-accent/20', 'bg-accent/25', 'bg-accent/10',
  'bg-accent/10', 'bg-accent/15', 'bg-accent/20', 'bg-accent/10', 'bg-accent/25', 'bg-accent/15',
];

const STATS = [
  { label: 'Members on floor', value: '34', tone: 'text-text' },
  { label: 'Avg form score', value: '91', tone: 'text-accent' },
  { label: 'Faults this hour', value: '7', tone: 'warn' },
];

const SESSIONS = [
  { who: 'A. Sharma', line: 'Squats · 3x8', score: '94' },
  { who: 'R. Patel', line: 'Deadlift · 3x5', score: '88' },
];

const TRUTHS = [
  'Every fault is flagged before it becomes an injury claim.',
  'Form scores show who needs a trainer before they ask.',
  'Retention follows results members can see.',
];

// Static pentagon radar — mirrors the app's recharts radar without shipping
// recharts in the landing chunk. Center (120,100), outer radius 62.
function RadarChart() {
  return (
    <svg
      viewBox="0 10 240 165"
      className="w-full h-auto"
      role="img"
      aria-label="Radar chart of floor averages across five axes: speed, depth, consistency, form and endurance."
    >
      {/* grid rings */}
      <polygon points="120,38 179,80.8 156.4,150.2 83.6,150.2 61,80.8" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <polygon points="120,58.7 159.3,87.2 144.3,133.4 95.7,133.4 80.7,87.2" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <polygon points="120,79.3 139.7,93.6 132.1,116.7 107.9,116.7 100.3,93.6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* axes */}
      <line x1="120" y1="100" x2="120" y2="38" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="120" y1="100" x2="179" y2="80.8" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="120" y1="100" x2="156.4" y2="150.2" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="120" y1="100" x2="83.6" y2="150.2" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="120" y1="100" x2="61" y2="80.8" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* data */}
      <polygon
        points="120,50.4 158.3,87.6 152.8,145.1 89,142.6 78.7,86.6"
        fill="rgba(0,229,255,0.15)"
        stroke="#00E5FF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="120" cy="50.4" r="2.5" fill="#00E5FF" />
      <circle cx="158.3" cy="87.6" r="2.5" fill="#00E5FF" />
      <circle cx="152.8" cy="145.1" r="2.5" fill="#00E5FF" />
      <circle cx="89" cy="142.6" r="2.5" fill="#00E5FF" />
      <circle cx="78.7" cy="86.6" r="2.5" fill="#00E5FF" />
      {/* axis labels */}
      <g fill="var(--text-muted)" fontSize="10" fontWeight="600">
        <text x="120" y="30" textAnchor="middle">Speed</text>
        <text x="184" y="82" textAnchor="start">Depth</text>
        <text x="152" y="164" textAnchor="start">Consistency</text>
        <text x="88" y="164" textAnchor="end">Form</text>
        <text x="56" y="82" textAnchor="end">Endurance</text>
      </g>
    </svg>
  );
}

function Heatmap() {
  return (
    <div
      role="img"
      aria-label="Floor heatmap: 24 stations shaded by fault density. One station is flagged in red — Squat rack 2, repeated depth faults."
    >
      <div className="grid grid-cols-6 gap-1.5" aria-hidden="true">
        {HEAT_CELLS.map((tone, i) =>
          i === HOTSPOT_INDEX ? (
            <div key={i} className="relative aspect-square">
              {/* THE page's single red appearance */}
              <div className="absolute inset-0 rounded-md bg-[#FF4757]/80 ring-1 ring-[#FF4757] shadow-[0_0_14px_rgba(255,71,87,0.45)]" />
              <div className="pointer-events-none absolute -top-9 left-0 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#FF4757]/40 bg-[#0d0d15]/95 px-2.5 py-1 text-[10px] font-semibold text-text">
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: GRAMMAR.risk }}
                />
                Squat rack 2 · repeated depth faults
              </div>
            </div>
          ) : (
            <div key={i} className={`aspect-square rounded-md ${tone}`} />
          )
        )}
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  const sectionRef = useRef(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });
  const rotateXRaw = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const rotateXSpring = useSpring(rotateXRaw, {
    stiffness: 120,
    damping: 24,
    mass: 0.6,
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="dash-h"
      className="relative py-24 md:py-32 px-6 overflow-hidden"
    >
      <SectionBloom className="w-[600px] h-[600px] left-1/2 -translate-x-1/2 top-1/4" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <Eyebrow>Floor intelligence</Eyebrow>
          <h2
            id="dash-h"
            className="mt-5 font-extrabold tracking-tight text-text text-[clamp(2rem,1.4rem+2.5vw,3.5rem)] leading-[1.05]"
          >
            One floor. Every rep.
          </h2>
          <p className="mt-3 text-lg text-[var(--text-muted)]">
            What the owner and head trainer see.
          </p>
        </motion.div>

        {/* Kiosk frame — rotateX flattens 22° -> 0° on scroll */}
        <motion.div
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <motion.div
            className="max-w-4xl mx-auto"
            style={{
              rotateX: prefersReduced ? 0 : rotateXSpring,
              transformPerspective: 1200,
              willChange: 'transform',
            }}
          >
            <KioskFrame>
              <p className="sr-only">
                Illustrative dashboard preview with sample data.
              </p>
              {/* Scanline sweep — the feed being analyzed. Compositor-only,
                  8s cycle (sweep + long rest), hidden under reduced motion. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 overflow-hidden motion-reduce:hidden"
              >
                <div
                  className="absolute left-0 right-0 h-16"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent, rgba(0,229,255,0.06) 60%, rgba(0,229,255,0.18) 98%, rgba(0,229,255,0.5) 100%)',
                    animation: 'ffx-scan 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                />
                <style>{`@keyframes ffx-scan { 0% { transform: translateY(-110%); opacity: 0; } 4% { opacity: 1; } 42% { transform: translateY(1000%); opacity: 1; } 50% { transform: translateY(1020%); opacity: 0; } 100% { transform: translateY(1020%); opacity: 0; } }`}</style>
              </div>
              <div className="p-4 sm:p-6 grid gap-4">
                {/* Mock header row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-text">
                    <span>
                      Floor overview{' '}
                      <span className="text-[var(--text-muted)] font-medium">
                        · live
                      </span>
                    </span>
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    Single camera · 30 fps
                  </span>
                </div>

                {/* Mini stat cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {STATS.map((s) => (
                    <GlassCard
                      key={s.label}
                      style={{ borderRadius: '0.75rem' }}
                      className="px-3 py-3 sm:px-4 sm:py-4"
                    >
                      <p className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium">
                        {s.label}
                      </p>
                      <p
                        className={`mt-1 text-xl sm:text-2xl font-extrabold tabular-nums ${
                          s.tone === 'warn' ? '' : s.tone
                        }`}
                        style={s.tone === 'warn' ? { color: GRAMMAR.warn } : undefined}
                      >
                        {s.value}
                      </p>
                    </GlassCard>
                  ))}
                </div>

                {/* Main row: heatmap + radar/sessions */}
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  {/* Floor heatmap */}
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--text-muted)]">
                      Floor heatmap
                    </p>
                    <Heatmap />
                  </div>

                  {/* Floor profile + live sessions */}
                  <div className="flex flex-col gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-4">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--text-muted)]">
                        Floor profile
                      </p>
                      <RadarChart />
                    </div>
                    {SESSIONS.map((s) => (
                      <GlassCard
                        key={s.who}
                        style={{ borderRadius: '0.75rem' }}
                        className="flex items-center justify-between px-4 py-2.5 text-sm"
                      >
                        <span className="text-text">
                          {s.who}{' '}
                          <span className="text-[var(--text-muted)]">
                            · {s.line}
                          </span>
                        </span>
                        <span className="text-accent font-bold tabular-nums">
                          {s.score}
                        </span>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>
            </KioskFrame>
          </motion.div>
        </motion.div>

        {/* Mechanism-truth lines */}
        <motion.div
          className="mt-12 md:mt-16 grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          {TRUTHS.map((line) => (
            <motion.div key={line} variants={blurRiseVariants}>
              <GlassCard className="p-5 h-full">
                <p className="text-[15px] leading-relaxed font-medium text-text">
                  {line}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          variants={blurRiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <a
            href="#walkthrough"
            className="px-6 py-3 bg-accent text-black font-bold rounded-xl glow-accent-hover transition-all inline-block"
          >
            Book a 20-min walkthrough
          </a>
        </motion.div>
      </div>
    </section>
  );
}
