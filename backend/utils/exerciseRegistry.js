class Exercise {
  constructor(id, name, description, targetJoints, thresholds) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.targetJoints = targetJoints;
    this.thresholds = thresholds;
  }

  getFeedback(angle) {
    throw new Error('getFeedback(angle) must be implemented');
  }
}

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

class Lunge extends Exercise {
  constructor() {
    super('lunge', 'Lunges', 'Leg strength and balance.', ['hip', 'knee', 'ankle'], { min: 80, max: 170 });
  }

  getFeedback(angle) {
    if (angle > 160) return { message: 'Good Form', color: '#00E5FF' };
    if (angle < 90) return { message: 'Great Depth!', color: 'green' };
    return { message: 'Lower your back knee', color: 'yellow' };
  }
}

class Plank extends Exercise {
  constructor() {
    super('plank', 'Plank', 'Core stabilization.', ['shoulder', 'hip', 'ankle'], { min: 160, max: 180 });
  }

  getFeedback(angle) {
    if (angle < 160) return { message: 'Straighten your back!', color: 'red' };
    return { message: 'Hold it!', color: 'green' };
  }
}

class SitUp extends Exercise {
  constructor() {
    super('situp', 'Sit-ups', 'Core strength builder.', ['shoulder', 'hip', 'knee'], { min: 45, max: 140 });
  }

  getFeedback(angle) {
    if (angle < 60) return { message: 'Good flex!', color: 'green' };
    return { message: 'Keep going!', color: 'yellow' };
  }
}

class ShoulderPress extends Exercise {
  constructor() {
    super('shoulder_press', 'Shoulder Press', 'Overhead shoulder strength.', ['shoulder', 'elbow', 'wrist'], { min: 60, max: 170 });
  }

  getFeedback(angle) {
    if (angle > 160) return { message: 'Good Extension', color: '#00E5FF' };
    if (angle < 80) return { message: 'Good Depth', color: 'green' };
    return { message: 'Push higher', color: 'yellow' };
  }
}

class Deadlift extends Exercise {
  constructor() {
    super('deadlift', 'Deadlift', 'Posterior chain builder.', ['shoulder', 'hip', 'knee'], { min: 80, max: 180 });
  }

  getFeedback(angle) {
    if (angle > 170) return { message: 'Lockout', color: 'green' };
    if (angle < 100) return { message: 'Keep back straight', color: 'yellow' };
    return { message: 'Good Form', color: '#00E5FF' };
  }
}

class PullUp extends Exercise {
  constructor() {
    super('pullup', 'Pull-ups', 'Back and bicep builder.', ['shoulder', 'elbow', 'wrist'], { min: 45, max: 160 });
  }

  getFeedback(angle) {
    if (angle < 60) return { message: 'Chin over bar!', color: 'green' };
    if (angle > 150) return { message: 'Full extension', color: '#00E5FF' };
    return { message: 'Pull higher', color: 'yellow' };
  }
}

class LateralRaise extends Exercise {
  constructor() {
    super('lateral_raise', 'Lateral Raises', 'Shoulder isolation.', ['shoulder', 'elbow', 'wrist'], { min: 20, max: 90 });
  }

  getFeedback(angle) {
    if (angle > 80) return { message: 'Good height', color: 'green' };
    return { message: 'Raise higher', color: 'yellow' };
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
