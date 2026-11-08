const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');
const { getJwtSecret } = require('../config/security');

/**
 * Resolve a JWT to the acting principal, or null if invalid.
 * Tokens carry an `_id` that is either a User or (for manager logins) a Gym;
 * a Gym acts as that gym's admin.
 * Shared by the HTTP middleware and the Socket.io handshake.
 */
const authenticateToken = async (token) => {
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }

  const user = await User.findOne({ _id: payload._id }).select('_id gymId role');
  if (user) return user;

  const gym = await Gym.findById(payload._id).select('_id');
  if (gym) return { _id: gym._id, gymId: gym._id, role: 'admin' };

  return null;
};

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    const user = await authenticateToken(authorization.slice('Bearer '.length).trim());
    if (!user) {
      return res.status(401).json({ error: 'Request is not authorized' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

/** Use after requireAuth: only lets through users whose role is listed. */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to do this' });
  }
  next();
};

const checkGymSubscription = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.user.gymId);
    if (!gym) {
      return res.status(404).json({ error: 'Gym not found' });
    }
    if (gym.subscriptionStatus !== 'active') {
      return res.status(403).json({ error: 'Gym subscription is inactive' });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error checking subscription' });
  }
};

module.exports = { authenticateToken, requireAuth, requireRole, checkGymSubscription };
