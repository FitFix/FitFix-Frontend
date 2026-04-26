const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
    req.user = await User.findOne({ _id }).select('_id gymId role');
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
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

module.exports = { requireAuth, checkGymSubscription };
