const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper function to calculate Euclidean distance between two vectors
const euclideanDistance = (vec1, vec2) => {
  if (vec1.length !== vec2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.pow(vec1[i] - vec2[i], 2);
  }
  return Math.sqrt(sum);
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

module.exports = router;
