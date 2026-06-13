const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { exerciseRegistry } = require('../utils/exerciseRegistry');

// Helper function to calculate Euclidean distance between two vectors
const euclideanDistance = (vec1, vec2) => {
  if (vec1.length !== vec2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.pow(vec1[i] - vec2[i], 2);
  }
  return Math.sqrt(sum);
};

// Helper function to calculate angle between three keypoints (a, b, c with b as vertex)
const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
};

// Threshold for face matching
const DISTANCE_THRESHOLD = 0.6; // Typical threshold for FaceNet embeddings

router.post('/entry', async (req, res) => {
  try {
    const { embedding, gymId } = req.body; // embedding should be an array of 128 numbers
    const io = req.app.get('io');
    
    if (!embedding || embedding.length !== 128) {
      return res.status(400).json({ error: 'Valid 128-d embedding required' });
    }

    const users = await User.find({ gymId, role: 'user' });
    
    let closestUser = null;
    let minDistance = Infinity;

    for (const user of users) {
      if (user.faceEncoding && user.faceEncoding.length === 128) {
        const distance = euclideanDistance(embedding, user.faceEncoding);
        if (distance < minDistance) {
          minDistance = distance;
          closestUser = user;
        }
      }
    }

    if (minDistance <= DISTANCE_THRESHOLD && closestUser) {
      // User identified
      const now = new Date();
      if (!closestUser.subscriptionExpiry || closestUser.subscriptionExpiry < now) {
        // Expired
        let daysOverdue = 0;
        if (closestUser.subscriptionExpiry) {
           const diffTime = Math.abs(now - closestUser.subscriptionExpiry);
           daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        }
        
        io.emit('entry-alert', {
          status: 'expired',
          user: closestUser,
          message: `Subscription Expired - ${daysOverdue} Days Overdue.`
        });
        return res.json({ status: 'expired', user: closestUser });
      } else {
        // Valid
        closestUser.attendanceLog.push(now);
        await closestUser.save();
        io.emit('entry-alert', {
          status: 'valid',
          user: closestUser,
          message: `Subscription Valid - Welcome ${closestUser.name}!`
        });
        return res.json({ status: 'valid', user: closestUser });
      }
    } else {
      // User Not Identified
      io.emit('entry-alert', {
        status: 'unknown',
        message: 'User Not Identified.'
      });
      return res.json({ status: 'unknown' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/exercises - Get all active exercises
router.get('/exercises', (req, res) => {
  try {
    const list = Object.values(exerciseRegistry).map(ex => ({
      id: ex.id,
      name: ex.name,
      description: ex.description,
      targetJoints: ex.targetJoints,
      thresholds: ex.thresholds
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/exercises/:id - Get details of a specific exercise
router.get('/exercises/:id', (req, res) => {
  const exercise = exerciseRegistry[req.params.id];
  if (!exercise) {
    return res.status(404).json({ error: 'Exercise not found' });
  }
  res.json({
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    targetJoints: exercise.targetJoints,
    thresholds: exercise.thresholds
  });
});

// POST /api/ai/exercises/:id/analyze - Real-time analysis with YOLO model or edge coordinates
router.post('/exercises/:id/analyze', async (req, res) => {
  try {
    const exercise = exerciseRegistry[req.params.id];
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const { image, keypoints: clientKeypoints } = req.body;
    let keypoints = clientKeypoints;

    // If base64 image is provided, run YOLO model inference via the python microservice
    if (image) {
      try {
        const response = await fetch('http://127.0.0.1:5001/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image })
        });
        
        if (response.ok) {
          const data = await response.json();
          keypoints = data.keypoints;
        } else {
          console.warn('YOLO microservice returned an error status:', response.status);
        }
      } catch (err) {
        console.warn('Could not reach YOLO python microservice. Using client-side keypoint fallback.', err.message);
      }
    }

    if (!keypoints || keypoints.length === 0) {
      return res.json({ 
        success: false, 
        message: 'No user detected in frame. Position yourself fully in front of the camera.', 
        angle: 0,
        feedback: { message: 'Position yourself in frame', color: 'yellow' }
      });
    }

    // Calculate angle based on the exercise definition
    const findPoint = (name) => keypoints.find(k => k.name === name);
    let a, b, c;

    if (exercise.id === 'bicep_curl') {
      a = findPoint('left_shoulder') || findPoint('right_shoulder');
      b = findPoint('left_elbow') || findPoint('right_elbow');
      c = findPoint('left_wrist') || findPoint('right_wrist');
    } else if (exercise.id === 'squat') {
      a = findPoint('left_hip') || findPoint('right_hip');
      b = findPoint('left_knee') || findPoint('right_knee');
      c = findPoint('left_ankle') || findPoint('right_ankle');
    } else if (exercise.id === 'pushup') {
      a = findPoint('left_shoulder') || findPoint('right_shoulder');
      b = findPoint('left_elbow') || findPoint('right_elbow');
      c = findPoint('left_wrist') || findPoint('right_wrist');
    }

    let angle = 0;
    let feedback = { message: 'Position yourself in frame', color: 'yellow' };

    if (a && b && c && a.score > 0.4 && b.score > 0.4 && c.score > 0.4) {
      angle = Math.round(calculateAngle(a, b, c));
      feedback = exercise.getFeedback(angle);
    } else {
      feedback = { message: 'Align joints with camera', color: 'yellow' };
    }

    res.json({
      success: true,
      keypoints,
      angle,
      feedback
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
