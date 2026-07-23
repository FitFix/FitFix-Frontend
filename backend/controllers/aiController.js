const aiService = require('../services/aiService');
const { exerciseRegistry } = require('../utils/exerciseRegistry');

class AIController {
  async logEntry(req, res) {
    try {
      const { embedding, gymId } = req.body;
      const io = req.app.get('io');
      
      if (!embedding || embedding.length !== 128) {
        return res.status(400).json({ error: 'Valid 128-d embedding required' });
      }

      const closestUser = await aiService.identifyUserByEmbedding(embedding, gymId);

      if (closestUser) {
        const now = new Date();
        if (!closestUser.subscriptionExpiry || closestUser.subscriptionExpiry < now) {
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
        io.emit('entry-alert', {
          status: 'unknown',
          message: 'User Not Identified.'
        });
        return res.json({ status: 'unknown' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  getExercises(req, res) {
    try {
      const list = Object.values(exerciseRegistry).map(ex => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        targetJoints: ex.targetJoints,
        thresholds: ex.thresholds,
        type: ex.type
      }));
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  getExerciseById(req, res) {
    const exercise = exerciseRegistry[req.params.id];
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    res.json({
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      targetJoints: exercise.targetJoints,
      thresholds: exercise.thresholds,
      type: exercise.type
    });
  }

  async analyzeExercise(req, res) {
    try {
      const exercise = exerciseRegistry[req.params.id];
      if (!exercise) {
        return res.status(404).json({ error: 'Exercise not found' });
      }

      const { image, keypoints: clientKeypoints } = req.body;

      if (exercise.id === 'hand_detection') {
        let hands = [];
        let count = 0;
        if (image) {
          const result = await aiService.detectHands(image);
          if (result) {
            hands = result.hands || [];
            count = result.count || 0;
          }
        }
        return res.json({
          success: true,
          hands,
          count,
          angle: count,
          feedback: exercise.getFeedback(count)
        });
      }

      let keypoints = clientKeypoints;

      if (image) {
        const yoloKeypoints = await aiService.predictYOLOPose(image);
        if (yoloKeypoints) {
          keypoints = yoloKeypoints;
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

      const findPoint = (name) => keypoints.find(k => k.name === name);

      // Pick the joint triplet from the exercise's declared targetJoints,
      // using one consistent side (left or right) — whichever is better detected.
      const sidePoints = (side) => exercise.targetJoints.map(j => findPoint(`${side}_${j}`));
      const sideScore = (pts) => pts.every(p => p) ? pts.reduce((sum, p) => sum + p.score, 0) : -1;
      const leftPts = sidePoints('left');
      const rightPts = sidePoints('right');
      const useLeft = sideScore(leftPts) >= sideScore(rightPts);
      const side = useLeft ? 'left' : 'right';
      const [a, b, c] = useLeft ? leftPts : rightPts;

      let angle = 0;
      let feedback = { message: 'Position yourself in frame', color: 'yellow' };

      if (a && b && c && a.score > 0.4 && b.score > 0.4 && c.score > 0.4) {
        angle = Math.round(aiService.calculateAngle(a, b, c));
        // ctx lets an exercise read secondary joint angles for richer form cues.
        const ctx = {
          side,
          point: (name) => findPoint(name),
          jointAngle: (n1, n2, n3) => {
            const p1 = findPoint(n1), p2 = findPoint(n2), p3 = findPoint(n3);
            if (!p1 || !p2 || !p3 || p1.score < 0.4 || p2.score < 0.4 || p3.score < 0.4) return 0;
            return Math.round(aiService.calculateAngle(p1, p2, p3));
          }
        };
        feedback = exercise.getFeedback(angle, ctx);
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
  }
}

module.exports = new AIController();
