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

const exerciseRegistry = {
  'bicep_curl': new BicepCurl(),
  'squat': new Squat(),
  'pushup': new PushUp()
};

module.exports = {
  Exercise,
  exerciseRegistry
};
