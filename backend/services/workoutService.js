const WorkoutSession = require('../models/WorkoutSession');
const User = require('../models/User');

class WorkoutService {
  async getSessions(user) {
    const filter = {};
    if (user.role === 'user') {
      filter.userId = user._id;
    } else {
      const gymUsers = await User.find({ gymId: user.gymId }).select('_id');
      filter.userId = { $in: gymUsers.map(u => u._id) };
    }

    return await WorkoutSession.find(filter)
      .populate('userId', 'name email gymId')
      .sort({ date: -1 })
      .limit(50);
  }

  async createSession(userId, exerciseId, reps, maxDepthAngle, avgSpeed) {
    return await WorkoutSession.create({
      userId,
      exerciseId,
      reps: Number(reps) || 0,
      maxDepthAngle,
      avgSpeed
    });
  }

  async getSummary(userId) {
    const sessions = await WorkoutSession.find({ userId }).sort({ date: -1 });
    const activeDays = new Set(sessions.map(session => session.date.toISOString().slice(0, 10))).size;
    const totalReps = sessions.reduce((sum, session) => sum + session.reps, 0);

    return {
      totalWorkouts: sessions.length,
      totalReps,
      activeDays,
      recentSessions: sessions.slice(0, 5)
    };
  }
}

module.exports = new WorkoutService();
