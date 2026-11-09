// Pure geometry for turning MediaPipe landmarks into the exercise's joint angle.
// No DOM, no React — unit-tested in isolation.
//
// Accuracy notes
// - 3D first: MediaPipe also returns "world" landmarks (metres, 3D). A joint
//   angle measured in 3D is the real biomechanical angle no matter where the
//   camera is. A 2D angle is only right when the movement is side-on to the
//   camera: a bicep curl or squat done FACING a webcam bends toward the lens,
//   so the 2D angle barely changes and reps get missed. We use 3D when
//   available and fall back to aspect-correct 2D.
// - Aspect-correct 2D: image landmarks are normalized separately on x (by
//   width) and y (by height); angles must be computed after scaling x by the
//   frame's aspect ratio, or every angle is skewed on non-square video.
// - Visibility gate: a joint MediaPipe isn't confident it can see (hidden
//   behind the body, out of frame) is not measured at all.
// - Side lock: we measure one body side and only switch when the other side is
//   clearly better seen, so the angle doesn't jump between arms/legs.

import { POSE_INDEX } from './landmarks.js';

export const MIN_VISIBILITY = 0.5;
export const SIDE_SWITCH_MARGIN = 0.15;

const RAD_TO_DEG = 180 / Math.PI;

/** Interior angle at b (degrees, 0–180) from 2D points, with x scaled by aspect (width/height). */
export function angle2D(a, b, c, aspect = 1) {
  const abx = (a.x - b.x) * aspect;
  const aby = a.y - b.y;
  const cbx = (c.x - b.x) * aspect;
  const cby = c.y - b.y;
  return vectorAngle(abx, aby, 0, cbx, cby, 0);
}

/** Interior angle at b (degrees, 0–180) from 3D points. */
export function angle3D(a, b, c) {
  return vectorAngle(a.x - b.x, a.y - b.y, a.z - b.z, c.x - b.x, c.y - b.y, c.z - b.z);
}

function vectorAngle(ux, uy, uz, vx, vy, vz) {
  const nu = Math.hypot(ux, uy, uz);
  const nv = Math.hypot(vx, vy, vz);
  if (nu === 0 || nv === 0) return 0;
  const cos = Math.min(1, Math.max(-1, (ux * vx + uy * vy + uz * vz) / (nu * nv)));
  return Math.acos(cos) * RAD_TO_DEG;
}

const visibilityOf = (lm) => (lm && typeof lm.visibility === 'number' ? lm.visibility : 0);

/**
 * Choose which body side to measure: the one whose target joints are better
 * seen. Keeps `prevSide` unless the other side is better by SIDE_SWITCH_MARGIN.
 */
export function pickSide(imageLandmarks, joints, prevSide = null, margin = SIDE_SWITCH_MARGIN) {
  const score = (side) =>
    joints.reduce((sum, j) => sum + visibilityOf(imageLandmarks[POSE_INDEX[`${side}_${j}`]]), 0) / joints.length;
  const left = score('left');
  const right = score('right');
  if (prevSide === 'left' && right <= left + margin) return 'left';
  if (prevSide === 'right' && left <= right + margin) return 'right';
  return left >= right ? 'left' : 'right';
}

/**
 * Angle at the middle of three named landmarks, or null when any is not
 * confidently visible. Uses world (3D) landmarks when given.
 */
export function jointAngle(pose, n1, n2, n3, minVisibility = MIN_VISIBILITY) {
  const idx = [POSE_INDEX[n1], POSE_INDEX[n2], POSE_INDEX[n3]];
  if (idx.some((i) => i == null)) return null;
  const img = idx.map((i) => pose.image[i]);
  if (img.some((p) => !p || visibilityOf(p) < minVisibility)) return null;
  const world = pose.world ? idx.map((i) => pose.world[i]) : null;
  if (world && world.every(Boolean)) return angle3D(world[0], world[1], world[2]);
  return angle2D(img[0], img[1], img[2], pose.aspect || 1);
}

/**
 * Measure an exercise's primary angle (interior angle at the middle of
 * rule.targetJoints) on the best-seen side.
 *
 * @param {object} rule  exercise rule with targetJoints e.g. ['shoulder','elbow','wrist']
 * @param {{image: Array, world?: Array|null, aspect?: number}} pose
 * @param {'left'|'right'|null} prevSide
 * @returns {{ measured: boolean, angle: number, side: 'left'|'right', ctx: object }}
 */
export function measureExercise(rule, pose, prevSide = null) {
  const joints = rule.targetJoints;
  const side = pickSide(pose.image, joints, prevSide);
  const ctx = {
    side,
    // Same helper the backend exposes to exercise feedback rules; 0 = not visible.
    jointAngle: (n1, n2, n3) => {
      const a = jointAngle(pose, n1, n2, n3);
      return a == null ? 0 : Math.round(a);
    }
  };
  const angle = jointAngle(pose, `${side}_${joints[0]}`, `${side}_${joints[1]}`, `${side}_${joints[2]}`);
  return { measured: angle != null, angle: angle == null ? 0 : angle, side, ctx };
}
