// One Euro filter (Casiez et al., CHI 2012): an adaptive low-pass filter for
// noisy real-time signals. At low speed it smooths hard (kills jitter while
// holding a position); at high speed it raises its cutoff so it barely lags
// (fast reps stay responsive). That trade-off is exactly what a live joint
// angle needs. Pure; no DOM.

const smoothingFactor = (cutoffHz, dtSec) => {
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 / (1 + tau / dtSec);
};

export class OneEuroFilter {
  /**
   * @param {object} [opts]
   * @param {number} [opts.minCutoff=1.5] Hz — lower = smoother when still
   * @param {number} [opts.beta=0.02]     how much speed raises the cutoff (less lag when moving)
   * @param {number} [opts.dCutoff=1.0]   Hz — cutoff for the speed estimate itself
   */
  constructor({ minCutoff = 1.5, beta = 0.02, dCutoff = 1.0 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.reset();
  }

  reset() {
    this.prevValue = null;
    this.prevDeriv = 0;
    this.prevTime = null;
  }

  /** @param {number} value  @param {number} timeMs */
  filter(value, timeMs) {
    if (this.prevValue == null || this.prevTime == null) {
      this.prevValue = value;
      this.prevTime = timeMs;
      return value;
    }
    const dt = Math.max((timeMs - this.prevTime) / 1000, 1e-3);
    this.prevTime = timeMs;

    const deriv = (value - this.prevValue) / dt;
    const aD = smoothingFactor(this.dCutoff, dt);
    const derivHat = aD * deriv + (1 - aD) * this.prevDeriv;
    this.prevDeriv = derivHat;

    const cutoff = this.minCutoff + this.beta * Math.abs(derivHat);
    const a = smoothingFactor(cutoff, dt);
    const valueHat = a * value + (1 - a) * this.prevValue;
    this.prevValue = valueHat;
    return valueHat;
  }
}
