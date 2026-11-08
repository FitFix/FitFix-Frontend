// Pure workout tracking: rep counting, isometric hold timing and the per-session
// metrics we save. Deliberately framework-free (no React state) so a frame is
// processed exactly once — React may re-run state updater functions, which
// previously could count a rep twice. Keep in sync with
// mobile/src/engine/workoutTracker.js.
//
// Rep counting is a hysteresis state machine on the primary joint angle:
//   extended --(angle < min + BUFFER)--> contracted --(angle > max - BUFFER)--> extended (+1 rep)
// The BUFFER gap means jitter around a single line can't produce extra reps.

export const REP_BUFFER_DEG = 20;

export function createWorkoutTracker(rule) {
  const isHold = rule?.type === 'hold';
  const { min = 0, max = 180 } = rule?.thresholds || {};
  const depthAtMax = rule?.depthAt === 'max';

  let phase = 'extended';
  let reps = 0;
  let holdSeconds = 0;
  let lastHoldAt = null;
  let minAngle = null;
  let maxAngle = null;
  const repTimes = [];

  return {
    /**
     * Feed one analysed frame.
     * @param {object} f
     * @param {number} f.angle     primary joint angle in degrees
     * @param {boolean} [f.measured] false when the joints weren't confidently visible
     * @param {boolean} [f.goodForm] whether feedback says form is OK (used for holds)
     * @param {number} f.now       timestamp in ms (performance.now() / Date.now())
     */
    update({ angle, measured = true, goodForm = false, now }) {
      // An unmeasured frame (angle 0) must never move the state machine:
      // 0° would otherwise read as "fully contracted" and fake a rep.
      if (!measured || !(angle > 0)) {
        lastHoldAt = null; // don't credit hold time across a gap
        return;
      }

      minAngle = minAngle == null ? angle : Math.min(minAngle, angle);
      maxAngle = maxAngle == null ? angle : Math.max(maxAngle, angle);

      if (isHold) {
        if (goodForm && lastHoldAt != null) holdSeconds += (now - lastHoldAt) / 1000;
        lastHoldAt = now;
        return;
      }

      if (phase === 'extended' && angle < min + REP_BUFFER_DEG) {
        phase = 'contracted';
      } else if (phase === 'contracted' && angle > max - REP_BUFFER_DEG) {
        phase = 'extended';
        reps += 1;
        repTimes.push(now);
      }
    },

    /** Call when the person leaves the frame or the camera stops. */
    pause() {
      lastHoldAt = null;
    },

    get reps() {
      return reps;
    },

    get holdSeconds() {
      return holdSeconds;
    },

    /** Values for POST /api/workouts/sessions. */
    summary() {
      if (isHold) {
        return { reps: Math.floor(holdSeconds), maxDepthAngle: undefined, avgSpeed: null };
      }
      const depth = depthAtMax ? maxAngle : minAngle;
      const avgSpeed = repTimes.length >= 2
        ? Math.round(((repTimes[repTimes.length - 1] - repTimes[0]) / (repTimes.length - 1)) / 100) / 10
        : null;
      return { reps, maxDepthAngle: depth == null ? undefined : Math.round(depth), avgSpeed };
    }
  };
}
