const User = require('../models/User');
const Plan = require('../models/Plan');
const engine = require('../services/planEngine');

const BASE_FIELDS = ['gender', 'age', 'heightCm', 'weightKg', 'activityLevel'];
const missingBase = (p) => BASE_FIELDS.filter((k) => p == null || p[k] == null);

class PlanController {
  // PUT /api/plan/profile — create/patch profile, return feasible goals if ready
  async updateProfile(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const current = user.profile ? user.profile.toObject() : {};
      user.profile = { ...current, ...(req.body || {}), updatedAt: new Date() };
      await user.save();

      const p = user.profile.toObject();
      const missing = missingBase(p);
      const feasibleGoals = missing.length ? null : engine.feasibleGoals(p);
      res.json({ profile: p, missing, feasibleGoals });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // GET /api/plan/profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('profile');
      res.json({ profile: user?.profile || null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // GET /api/plan/feasible-goals — from saved profile
  async getFeasibleGoals(req, res) {
    try {
      const user = await User.findById(req.user._id).select('profile');
      const p = user?.profile ? user.profile.toObject() : null;
      const missing = missingBase(p);
      if (missing.length) return res.status(400).json({ error: 'Profile incomplete', missing });
      res.json(engine.feasibleGoals(p));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // POST /api/plan/generate — body { goalId }. Recomputes server-side (never trusts client numbers).
  async generate(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const p = user.profile ? user.profile.toObject() : null;
      const missing = missingBase(p);
      if (missing.length) return res.status(400).json({ error: 'Profile incomplete', missing });

      const fg = engine.feasibleGoals(p);
      const chosen = fg.goals.find((g) => g.id === req.body?.goalId)
        || fg.goals.find((g) => g.recommended) || fg.goals[0];
      if (!chosen) return res.status(400).json({ error: 'No feasible goal available' });

      const planData = engine.generatePlan({ ...p, goalType: chosen.type }, chosen);

      // persist the chosen goal onto the profile
      user.profile = {
        ...p,
        goalType: chosen.type,
        targetWeightKg: chosen.targetWeightKg,
        weeklyRateKg: chosen.weeklyRateKg,
        onboardingComplete: true,
        updatedAt: new Date()
      };
      await user.save();

      const plan = await Plan.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          metrics: planData.metrics,
          goal: planData.goal,
          workoutPlan: planData.workoutPlan,
          dietPlan: planData.dietPlan,
          disclaimerLevel: planData.disclaimerLevel,
          engineVersion: engine.ENGINE_VERSION,
          generatedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      res.status(201).json({ plan });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // GET /api/plan — the saved plan. Auto-heals plans generated before a schema
  // change (e.g. missing per-exercise calories) by deterministically regenerating
  // from the saved profile + chosen goal — same plan, newly-computed fields.
  async getPlan(req, res) {
    try {
      let plan = await Plan.findOne({ userId: req.user._id });
      if (plan && (plan.engineVersion || 0) !== engine.ENGINE_VERSION) {
        const user = await User.findById(req.user._id);
        if (user && user.profile) {
          const p = user.profile.toObject();
          const goal = plan.goal ? (plan.goal.toObject ? plan.goal.toObject() : plan.goal) : undefined;
          const regen = engine.generatePlan({ ...p, goalType: goal && goal.type }, goal);
          plan.metrics = regen.metrics;
          if (regen.goal) plan.goal = regen.goal;
          plan.workoutPlan = regen.workoutPlan;
          plan.dietPlan = regen.dietPlan;
          plan.disclaimerLevel = regen.disclaimerLevel;
          plan.engineVersion = engine.ENGINE_VERSION;
          plan.generatedAt = new Date();
          await plan.save();
        }
      }
      res.json({ plan: plan || null });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PlanController();
