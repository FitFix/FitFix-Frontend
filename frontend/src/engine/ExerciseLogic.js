// Frontend exercise rules. `thresholds {min,max}` describe the primary joint's
// range of motion and DRIVE REP COUNTING in AIVisionContainer: it treats
// [min, min+20] as the contracted end and [max-20, max] as the extended end, so
// min and max are kept > 40 apart. These MUST match the joint the backend
// measures (exerciseRegistry.js targetJoints) since the backend supplies the
// angle these thresholds are compared against.
// `type`: 'rep' (counted) | 'hold' (isometric, timed) | 'detect' (hand count).
// `formCorrection` mirrors the backend messages (the live message comes from the
// backend response; this is a local fallback / reference).

export const exerciseRules = {
  'bicep_curl': {
    name: 'Bicep Curls',
    description: 'Build your biceps with controlled curls.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 45, max: 160 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle > 170) return { message: 'Hyperextension! Keep slight bend.', color: 'red' };
      if (angle < 45) return { message: 'Good flex!', color: 'green' };
      if (angle > 140) return { message: 'Lower all the way', color: 'yellow' };
      return { message: 'Good Form', color: '#00E5FF' };
    }
  },
  'squat': {
    name: 'Squats',
    description: 'Lower body strength builder.',
    targetJoints: ['hip', 'knee', 'ankle'],
    thresholds: { min: 70, max: 170 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle > 170) return { message: 'Good Form', color: '#00E5FF' };
      if (angle < 75) return { message: 'Great Depth!', color: 'green' };
      if (angle > 120 && angle < 150) return { message: 'Lower your hips', color: 'yellow' };
      return { message: 'Good Form', color: '#00E5FF' };
    }
  },
  'pushup': {
    name: 'Push-ups',
    description: 'Classic upper body and core exercise.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 70, max: 160 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle > 160) return { message: 'Good Form', color: '#00E5FF' };
      if (angle < 80) return { message: 'Great Depth!', color: 'green' };
      return { message: 'Lower your chest', color: 'yellow' };
    }
  },
  'lunge': {
    name: 'Lunges',
    description: 'Leg strength and balance.',
    targetJoints: ['hip', 'knee', 'ankle'],
    thresholds: { min: 90, max: 170 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle < 70) return { message: 'Too deep — keep front knee near 90°', color: 'yellow' };
      if (angle <= 105) return { message: 'Perfect depth!', color: 'green' };
      if (angle < 150) return { message: 'Lower into the lunge', color: 'yellow' };
      return { message: 'Stand tall, then lunge', color: '#00E5FF' };
    }
  },
  'plank': {
    name: 'Plank',
    description: 'Core stabilization.',
    targetJoints: ['shoulder', 'hip', 'ankle'],
    thresholds: { min: 160, max: 180 },
    type: 'hold',
    formCorrection: (angle) => {
      if (angle >= 165) return { message: 'Solid plank — hold it!', color: 'green' };
      if (angle >= 150) return { message: 'Level your hips', color: 'yellow' };
      return { message: 'Straighten up — no sag or pike', color: 'red' };
    }
  },
  'situp': {
    name: 'Sit-ups',
    description: 'Core strength builder.',
    targetJoints: ['shoulder', 'hip', 'knee'],
    thresholds: { min: 55, max: 130 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle < 70) return { message: 'Full contraction!', color: 'green' };
      if (angle <= 110) return { message: 'Good — stay controlled', color: '#00E5FF' };
      return { message: 'Curl up toward your knees', color: 'yellow' };
    }
  },
  'shoulder_press': {
    name: 'Shoulder Press',
    description: 'Overhead shoulder strength.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 70, max: 175 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle > 165) return { message: 'Locked out — strong!', color: 'green' };
      if (angle >= 95) return { message: 'Keep driving to lockout', color: '#00E5FF' };
      if (angle >= 70) return { message: 'Good start — press up', color: '#00E5FF' };
      return { message: 'Ease off — elbows level with shoulders', color: 'yellow' };
    }
  },
  'deadlift': {
    name: 'Deadlift',
    description: 'Posterior chain builder.',
    targetJoints: ['shoulder', 'hip', 'knee'],
    thresholds: { min: 80, max: 175 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle > 165) return { message: 'Full lockout!', color: 'green' };
      if (angle >= 95) return { message: 'Drive your hips forward', color: '#00E5FF' };
      return { message: 'Hinge — keep your back flat', color: '#00E5FF' };
    }
  },
  'pullup': {
    name: 'Pull-ups',
    description: 'Back and bicep builder.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 45, max: 160 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle < 60) return { message: 'Chin over bar — great!', color: 'green' };
      if (angle <= 150) return { message: 'Pull higher', color: 'yellow' };
      return { message: 'Full dead hang — now pull', color: '#00E5FF' };
    }
  },
  'lateral_raise': {
    name: 'Lateral Raises',
    description: 'Shoulder isolation.',
    targetJoints: ['hip', 'shoulder', 'elbow'],
    thresholds: { min: 20, max: 95 },
    type: 'rep',
    formCorrection: (angle) => {
      if (angle > 110) return { message: 'Too high — stop at shoulder height', color: 'yellow' };
      if (angle >= 80) return { message: 'Shoulder height — perfect!', color: 'green' };
      if (angle >= 30) return { message: 'Raise to shoulder height', color: '#00E5FF' };
      return { message: 'Arms at your sides — begin', color: '#00E5FF' };
    }
  },
  'hand_detection': {
    name: 'Hand Tracking',
    description: 'Track 21 hand landmarks and count hands in the frame.',
    targetJoints: ['hand_wrist', 'fingers'],
    thresholds: { min: 0, max: 2 },
    type: 'detect',
    formCorrection: (count) => {
      if (count === 0) return { message: 'Show your hands to the camera', color: 'yellow' };
      if (count === 1) return { message: '1 Hand Detected', color: 'green' };
      return { message: `${count} Hands Detected`, color: 'green' };
    }
  }
};
