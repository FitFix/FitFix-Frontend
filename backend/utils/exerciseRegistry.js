// Exercise form-analysis registry.
//
// The backend measures ONE primary angle per exercise: the interior angle at the
// MIDDLE joint of `targetJoints`, on whichever body side is better detected
// (see aiController.analyzeExercise). getFeedback(angle, ctx) turns that angle
// into a coaching message. `ctx` (optional) exposes the detected side and helpers
// to read secondary joint angles for richer form checks:
//   ctx.side                         -> 'left' | 'right'
//   ctx.point(name)                  -> keypoint {x,y,score} or undefined
//   ctx.jointAngle(n1, n2, n3)       -> interior angle at n2 (0 if a point is missing)
//
// Buffers: each getFeedback uses graded angle BANDS with clear gaps so the live
// message doesn't flicker at a boundary. `thresholds {min,max}` describe the
// primary joint's usable range of motion; the frontend rep counter (which reads
// its own copy in ExerciseLogic.js) treats [min, min+20] as the contracted end
// and [max-20, max] as the extended end, so min and max are kept > 40 apart.
// `type`: 'rep' (counted) or 'hold' (isometric — timed, not counted).

const GOOD = '#00E5FF'; // on-track
const GREAT = 'green';  // peak / target reached
const WARN = 'yellow';  // correct this
const BAD = 'red';      // stop / injury risk

class Exercise {
  constructor(id, name, description, targetJoints, thresholds, type = 'rep') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.targetJoints = targetJoints;
    this.thresholds = thresholds;
    this.type = type;
  }

  getFeedback() {
    throw new Error('getFeedback(angle, ctx) must be implemented');
  }
}

/* ============================================================
 * WORKING MODELS (unchanged) — bicep curl, squat, push-up
 * ============================================================ */

class BicepCurl extends Exercise {
  constructor() {
    super('bicep_curl', 'Bicep Curls', 'Build your biceps with controlled curls.', ['shoulder', 'elbow', 'wrist'], { min: 45, max: 160 });
  }

  getFeedback(angle) {
    if (angle > 170) return { message: 'Hyperextension! Keep slight bend.', color: 'red' };
    if (angle < 45) return { message: 'Good flex!', color: 'green' };
    if (angle > 140) return { message: 'Lower all the way', color: 'yellow' };
    return { message: 'Good Form', color: '#00E5FF' };
  }
}

class Squat extends Exercise {
  constructor() {
    super('squat', 'Squats', 'Lower body strength builder.', ['hip', 'knee', 'ankle'], { min: 70, max: 170 });
  }

  getFeedback(angle) {
    if (angle > 170) return { message: 'Good Form', color: '#00E5FF' };
    if (angle < 75) return { message: 'Great Depth!', color: 'green' };
    if (angle > 120 && angle < 150) return { message: 'Lower your hips', color: 'yellow' };
    return { message: 'Good Form', color: '#00E5FF' };
  }
}

class PushUp extends Exercise {
  constructor() {
    super('pushup', 'Push-ups', 'Classic upper body and core exercise.', ['shoulder', 'elbow', 'wrist'], { min: 70, max: 160 });
  }

  getFeedback(angle) {
    if (angle > 160) return { message: 'Good Form', color: '#00E5FF' };
    if (angle < 80) return { message: 'Great Depth!', color: 'green' };
    return { message: 'Lower your chest', color: 'yellow' };
  }
}

/* ============================================================
 * NEW / REWRITTEN LOGIC
 * ============================================================ */

// LUNGE — primary: front-knee angle (hip-knee-ankle). Target ~90° at the bottom
// (parallel); standing ~170°. Going much below ~70° usually means the front knee
// is driving past the toes.
class Lunge extends Exercise {
  constructor() {
    super('lunge', 'Lunges', 'Leg strength and balance.', ['hip', 'knee', 'ankle'], { min: 90, max: 170 });
  }

  getFeedback(angle) {
    if (angle < 70) return { message: 'Too deep — keep front knee near 90°', color: WARN };
    if (angle <= 105) return { message: 'Perfect depth!', color: GREAT };
    if (angle < 150) return { message: 'Lower into the lunge', color: WARN };
    return { message: 'Stand tall, then lunge', color: GOOD };
  }
}

// PLANK — isometric HOLD. Primary: body-line angle (shoulder-hip-ankle) which
// should stay ~170-180°. A drop below that means the hips are sagging or piking.
// Not rep-counted (type 'hold').
class Plank extends Exercise {
  constructor() {
    super('plank', 'Plank', 'Core stabilization.', ['shoulder', 'hip', 'ankle'], { min: 160, max: 180 }, 'hold');
  }

  getFeedback(angle) {
    if (angle >= 165) return { message: 'Solid plank — hold it!', color: GREAT };
    if (angle >= 150) return { message: 'Level your hips', color: WARN };
    return { message: 'Straighten up — no sag or pike', color: BAD };
  }
}

// SIT-UP — primary: trunk-to-thigh angle (shoulder-hip-knee). Lying back (knees
// bent) ~120-130°; fully curled up ~55-65°.
class SitUp extends Exercise {
  constructor() {
    super('situp', 'Sit-ups', 'Core strength builder.', ['shoulder', 'hip', 'knee'], { min: 55, max: 130 });
  }

  getFeedback(angle) {
    if (angle < 70) return { message: 'Full contraction!', color: GREAT };
    if (angle <= 110) return { message: 'Good — stay controlled', color: GOOD };
    return { message: 'Curl up toward your knees', color: WARN };
  }
}

// SHOULDER PRESS — primary: elbow angle (shoulder-elbow-wrist). Rack/bottom
// ~70-90°; locked out overhead ~170-180°.
class ShoulderPress extends Exercise {
  constructor() {
    super('shoulder_press', 'Shoulder Press', 'Overhead shoulder strength.', ['shoulder', 'elbow', 'wrist'], { min: 70, max: 175 });
  }

  getFeedback(angle) {
    if (angle > 165) return { message: 'Locked out — strong!', color: GREAT };
    if (angle >= 95) return { message: 'Keep driving to lockout', color: GOOD };
    if (angle >= 70) return { message: 'Good start — press up', color: GOOD };
    return { message: 'Ease off — elbows level with shoulders', color: WARN };
  }
}

// DEADLIFT — primary: hip-hinge angle (shoulder-hip-knee). Lockout ~170-180°;
// bottom (hinged) ~90°. Secondary: at lockout the KNEE should also be extended —
// if hips lock while knees stay bent, cue extending together.
class Deadlift extends Exercise {
  constructor() {
    super('deadlift', 'Deadlift', 'Posterior chain builder.', ['shoulder', 'hip', 'knee'], { min: 80, max: 175 });
  }

  getFeedback(angle, ctx) {
    const knee = ctx && ctx.jointAngle ? ctx.jointAngle(`${ctx.side}_hip`, `${ctx.side}_knee`, `${ctx.side}_ankle`) : 0;
    if (angle > 165) {
      if (knee && knee < 150) return { message: 'Extend hips AND knees together', color: WARN };
      return { message: 'Full lockout!', color: GREAT };
    }
    if (angle >= 95) return { message: 'Drive your hips forward', color: GOOD };
    return { message: 'Hinge — keep your back flat', color: GOOD };
  }
}

// PULL-UP — primary: elbow angle (shoulder-elbow-wrist). Dead hang ~170-180°;
// chin-over-bar top ~30-55°.
class PullUp extends Exercise {
  constructor() {
    super('pullup', 'Pull-ups', 'Back and bicep builder.', ['shoulder', 'elbow', 'wrist'], { min: 45, max: 160 });
  }

  getFeedback(angle) {
    if (angle < 60) return { message: 'Chin over bar — great!', color: GREAT };
    if (angle <= 150) return { message: 'Pull higher', color: WARN };
    return { message: 'Full dead hang — now pull', color: GOOD };
  }
}

// LATERAL RAISE — primary: SHOULDER ABDUCTION (hip-shoulder-elbow), NOT the elbow.
// Arms at sides ~5-15°; raised to shoulder height ~90°. Above ~110° is too high
// (shoulder impingement). Secondary: elbows should stay softly bent, not locked.
class LateralRaise extends Exercise {
  constructor() {
    super('lateral_raise', 'Lateral Raises', 'Shoulder isolation.', ['hip', 'shoulder', 'elbow'], { min: 20, max: 95 });
  }

  getFeedback(angle, ctx) {
    if (angle > 110) return { message: 'Too high — stop at shoulder height', color: WARN };
    if (angle >= 80) {
      const elbow = ctx && ctx.jointAngle ? ctx.jointAngle(`${ctx.side}_shoulder`, `${ctx.side}_elbow`, `${ctx.side}_wrist`) : 0;
      if (elbow && elbow > 178) return { message: 'Soften your elbows slightly', color: WARN };
      return { message: 'Shoulder height — perfect!', color: GREAT };
    }
    if (angle >= 30) return { message: 'Raise to shoulder height', color: GOOD };
    return { message: 'Arms at your sides — begin', color: GOOD };
  }
}

class HandDetection extends Exercise {
  constructor() {
    super('hand_detection', 'Hand Tracking', 'Track 21 hand landmarks and count hands in the frame.', ['hand_wrist', 'fingers'], { min: 0, max: 2 });
  }

  getFeedback(count) {
    if (count === 0) return { message: 'Show your hands to the camera', color: 'yellow' };
    if (count === 1) return { message: '1 Hand Detected', color: 'green' };
    return { message: `${count} Hands Detected`, color: 'green' };
  }
}

const exerciseRegistry = {
  'bicep_curl': new BicepCurl(),
  'squat': new Squat(),
  'pushup': new PushUp(),
  'lunge': new Lunge(),
  'plank': new Plank(),
  'situp': new SitUp(),
  'shoulder_press': new ShoulderPress(),
  'deadlift': new Deadlift(),
  'pullup': new PullUp(),
  'lateral_raise': new LateralRaise(),
  'hand_detection': new HandDetection()
};

module.exports = {
  Exercise,
  exerciseRegistry
};
