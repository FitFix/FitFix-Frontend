const User = require('../models/User');

class AIService {
  euclideanDistance(vec1, vec2) {
    if (vec1.length !== vec2.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      sum += Math.pow(vec1[i] - vec2[i], 2);
    }
    return Math.sqrt(sum);
  }

  calculateAngle(a, b, c) {
    if (!a || !b || !c) return 0;
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return angle;
  }

  async identifyUserByEmbedding(embedding, gymId) {
    const DISTANCE_THRESHOLD = 0.6;
    const users = await User.find({ gymId, role: 'user' });
    
    let closestUser = null;
    let minDistance = Infinity;

    for (const user of users) {
      if (user.faceEncoding && user.faceEncoding.length === 128) {
        const distance = this.euclideanDistance(embedding, user.faceEncoding);
        if (distance < minDistance) {
          minDistance = distance;
          closestUser = user;
        }
      }
    }

    if (minDistance <= DISTANCE_THRESHOLD && closestUser) {
      return closestUser;
    }
    return null;
  }

  async predictYOLOPose(image) {
    try {
      const response = await fetch('http://127.0.0.1:5001/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.keypoints;
      }
    } catch (err) {
      console.warn('Could not reach YOLO python microservice. Fallback active.', err.message);
    }
    return null;
  }
}

module.exports = new AIService();
