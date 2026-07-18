// Forward-kinematics pose data for the Living Skeleton.
// Angles are RELATIVE joint rotations (degrees, clockwise = forward, side view
// facing right). Bones have fixed lengths — a rig built from rotations cannot
// stretch, which is the whole point.

export const BONES = {
  shin: 50,
  thigh: 50,
  torso: 54,
  neck: 10,
  upperArm: 28,
  forearm: 26,
};

// One rep = stand -> quarter -> bottom -> quarter -> stand
export const REP = {
  // phase positions of the keyframes within a rep
  times: [0, 0.3, 0.5, 0.75, 1],
  normal: {
    shin: [4, 14, 26, 14, 4],        // ankle dorsiflexion
    knee: [-8, -46, -112, -46, -8],  // knee flexion (thigh rel. shin)
    hip: [6, 44, 122, 44, 6],        // torso rel. thigh -> ~36deg forward lean at depth
    arm: [-4, 18, 49, 18, -4],       // counterbalance raise (rel. torso)
  },
  // Rep 3: shallow depth — hips never reach parallel. The fault the engine flags.
  fault: {
    shin: [4, 14, 18, 14, 4],
    knee: [-8, -46, -78, -46, -8],
    hip: [6, 44, 92, 44, 6],
    arm: [-4, 18, 30, 18, -4],
  },
};

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

// Interpolated joint angle at a given phase (0..1) of a rep.
export function jointAngle(joint, phase, isFault) {
  const ks = (isFault ? REP.fault : REP.normal)[joint];
  const ts = REP.times;
  for (let i = 0; i < ts.length - 1; i++) {
    if (phase <= ts[i + 1]) {
      const f = (phase - ts[i]) / (ts[i + 1] - ts[i]);
      return ks[i] + (ks[i + 1] - ks[i]) * easeInOut(f);
    }
  }
  return ks[ks.length - 1];
}
