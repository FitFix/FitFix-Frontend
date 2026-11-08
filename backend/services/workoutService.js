const WorkoutSession = require('../models/WorkoutSession');
const User = require('../models/User');
const { exerciseRegistry } = require('../utils/exerciseRegistry');

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
    // Hold exercises (plank) store SECONDS in `reps`, so keep them out of the rep total.
    const isHold = (exerciseId) => exerciseRegistry[exerciseId]?.type === 'hold';
    const totalReps = sessions.reduce((sum, session) => sum + (isHold(session.exerciseId) ? 0 : session.reps), 0);

    // Per-exercise totals (powers the dashboard's training-mix chart).
    const byExerciseMap = new Map();
    for (const session of sessions) {
      const ex = exerciseRegistry[session.exerciseId];
      const entry = byExerciseMap.get(session.exerciseId) || {
        exerciseId: session.exerciseId,
        name: ex ? ex.name : session.exerciseId,
        type: ex ? ex.type : 'rep',
        sessions: 0,
        reps: 0
      };
      entry.sessions += 1;
      entry.reps += session.reps;
      byExerciseMap.set(session.exerciseId, entry);
    }
    const byExercise = [...byExerciseMap.values()].sort((a, b) => b.sessions - a.sessions);

    return {
      totalWorkouts: sessions.length,
      totalReps,
      activeDays,
      byExercise,
      recentSessions: sessions.slice(0, 5)
    };
  }
}

module.exports = new WorkoutService();
