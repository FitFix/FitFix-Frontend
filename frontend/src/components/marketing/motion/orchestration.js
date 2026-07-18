// Single source of truth for landing-page motion timing.
// Components schedule against these constants instead of subscribing to each
// other's animation state — sync without coupling.

export const TIMING = {
  drawIn: 1.4,        // s — skeleton limbs draw in via pathLength stagger
  repCycle: 2.4,      // s — one full squat rep
  repsPerLoop: 4,     // rep 3 is the fault rep, rep 4 the correction
  get loopDuration() { return this.repCycle * this.repsPerLoop; },
  get faultAt() { return this.drawIn + this.repCycle * 2.5; },      // mid-rep-3
  get correctedAt() { return this.drawIn + this.repCycle * 3.5; },  // mid-rep-4
  get wordFillDelay() { return this.drawIn + 0.2; },                // H1 outlined word fills
};

// The app's established stagger vocabulary (Dashboard/Login) — extended, not replaced.
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

// Landing-page section reveal: blur-rise, fires once.
export const blurRiseVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

export const VIEWPORT_ONCE = { once: true, amount: 0.3 };

// 3-color grammar — cyan means "the AI is seeing", amber = deviation, red = risk (once per page).
export const GRAMMAR = {
  clean: '#00E5FF',
  warn: '#FFB020',
  risk: '#FF4757',
};
