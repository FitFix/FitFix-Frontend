export const exerciseRules = {
  'bicep_curl': {
    name: 'Bicep Curls',
    description: 'Build your biceps with controlled curls.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 45, max: 160 },
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
    thresholds: { min: 80, max: 170 },
    formCorrection: (angle) => {
      if (angle > 160) return { message: 'Good Form', color: '#00E5FF' };
      if (angle < 90) return { message: 'Great Depth!', color: 'green' };
      return { message: 'Lower your back knee', color: 'yellow' };
    }
  },
  'plank': {
    name: 'Plank',
    description: 'Core stabilization.',
    targetJoints: ['shoulder', 'hip', 'ankle'],
    thresholds: { min: 160, max: 180 },
    formCorrection: (angle) => {
      if (angle < 160) return { message: 'Straighten your back!', color: 'red' };
      return { message: 'Hold it!', color: 'green' };
    }
  },
  'situp': {
    name: 'Sit-ups',
    description: 'Core strength builder.',
    targetJoints: ['shoulder', 'hip', 'knee'],
    thresholds: { min: 45, max: 140 },
    formCorrection: (angle) => {
      if (angle < 60) return { message: 'Good flex!', color: 'green' };
      return { message: 'Keep going!', color: 'yellow' };
    }
  },
  'shoulder_press': {
    name: 'Shoulder Press',
    description: 'Overhead shoulder strength.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 60, max: 170 },
    formCorrection: (angle) => {
      if (angle > 160) return { message: 'Good Extension', color: '#00E5FF' };
      if (angle < 80) return { message: 'Good Depth', color: 'green' };
      return { message: 'Push higher', color: 'yellow' };
    }
  },
  'deadlift': {
    name: 'Deadlift',
    description: 'Posterior chain builder.',
    targetJoints: ['shoulder', 'hip', 'knee'],
    thresholds: { min: 80, max: 180 },
    formCorrection: (angle) => {
      if (angle > 170) return { message: 'Lockout', color: 'green' };
      if (angle < 100) return { message: 'Keep back straight', color: 'yellow' };
      return { message: 'Good Form', color: '#00E5FF' };
    }
  },
  'pullup': {
    name: 'Pull-ups',
    description: 'Back and bicep builder.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 45, max: 160 },
    formCorrection: (angle) => {
      if (angle < 60) return { message: 'Chin over bar!', color: 'green' };
      if (angle > 150) return { message: 'Full extension', color: '#00E5FF' };
      return { message: 'Pull higher', color: 'yellow' };
    }
  },
  'lateral_raise': {
    name: 'Lateral Raises',
    description: 'Shoulder isolation.',
    targetJoints: ['shoulder', 'elbow', 'wrist'],
    thresholds: { min: 20, max: 90 },
    formCorrection: (angle) => {
      if (angle > 80) return { message: 'Good height', color: 'green' };
      return { message: 'Raise higher', color: 'yellow' };
    }
  },
  'hand_detection': {
    name: 'Hand Tracking',
    description: 'Track 21 hand landmarks and count hands in the frame.',
    targetJoints: ['hand_wrist', 'fingers'],
    thresholds: { min: 0, max: 2 },
    formCorrection: (count) => {
      if (count === 0) return { message: 'Show your hands to the camera', color: 'yellow' };
      if (count === 1) return { message: '1 Hand Detected', color: 'green' };
      return { message: `${count} Hands Detected`, color: 'green' };
    }
  }
};
