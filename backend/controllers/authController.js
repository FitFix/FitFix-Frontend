const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Gym = require('../models/Gym');
const Trainer = require('../models/Trainer');
const { getJwtSecret, getAdminAccessToken, safeEqual } = require('../config/security');

const createToken = (_id) => {
  return jwt.sign({ _id }, getJwtSecret(), { expiresIn: '3d' });
};

class AuthController {
  // Seeds demo accounts with a well-known password. Only available when
  // explicitly enabled for local development — never on a real deployment.
  async setup(req, res) {
    if (process.env.ENABLE_DEMO_SETUP !== 'true') {
      return res.status(404).json({ error: 'Not found' });
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      
      let gym = await Gym.findOne({ adminEmail: 'admin@fitfix.com' });
      if (!gym) {
        gym = await Gym.create({
          name: 'FitFix HQ',
          adminEmail: 'admin@fitfix.com',
          passwordHash: hash,
          subscriptionStatus: 'active'
        });
      }

      let user = await User.findOne({ email: 'user@fitfix.com' });
      if (!user) {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 3);

        user = await User.create({
          name: 'Demo User',
          email: 'user@fitfix.com',
          phone: '555-0101',
          passwordHash: hash,
          gymId: gym._id,
          role: 'user',
          subscriptionExpiry: expiry,
          attendanceLog: [new Date()]
        });
      }

      let expiringUser = await User.findOne({ email: 'soon@example.com' });
      if (!expiringUser) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 4);

        expiringUser = await User.create({
          name: 'Expiring Soon User',
          email: 'soon@example.com',
          phone: '555-0103',
          passwordHash: hash,
          gymId: gym._id,
          role: 'user',
          subscriptionExpiry: expiry
        });
      }

      let expiredUser = await User.findOne({ email: 'expired@example.com' });
      if (!expiredUser) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() - 5);

        expiredUser = await User.create({
          name: 'Expired Member',
          email: 'expired@example.com',
          phone: '555-0102',
          passwordHash: hash,
          gymId: gym._id,
          role: 'user',
          subscriptionExpiry: expiry
        });
      }

      let trainer = await Trainer.findOne({ gymId: gym._id, phone: '555-0199' });
      if (!trainer) {
        trainer = await Trainer.create({
          name: 'Arnold S.',
          phone: '555-0199',
          salary: 5000,
          gymId: gym._id,
          attendanceLog: [new Date()]
        });
      }

      res.status(200).json({
        message: 'Setup complete',
        credentials: {
          manager: { email: 'admin@fitfix.com', password: 'password123' },
          member: { email: 'user@fitfix.com', password: 'password123' }
        },
        gym,
        users: [user, expiringUser, expiredUser],
        trainers: [trainer]
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const emailClean = email.toLowerCase().trim();
      let user = await User.findOne({ email: emailClean });
      let role = 'user';
      let match = false;

      if (user) {
        match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
          return res.status(400).json({ error: 'Invalid login credentials' });
        }
        role = user.role;
      } else {
        const gym = await Gym.findOne({ adminEmail: emailClean });
        if (gym) {
          match = await bcrypt.compare(password, gym.passwordHash);
          if (!match) {
            return res.status(400).json({ error: 'Invalid login credentials' });
          }
          user = await User.create({
            name: gym.name,
            email: emailClean,
            passwordHash: gym.passwordHash,
            gymId: gym._id,
            role: 'admin'
          });
          role = 'admin';
        } else {
          return res.status(400).json({ error: 'Invalid login credentials' });
        }
      }

      if (role === 'user') {
        const now = new Date();
        if (!user.subscriptionExpiry || user.subscriptionExpiry < now) {
          return res.status(403).json({ error: 'Access Denied: Subscription Expired.' });
        }
      }

      const token = createToken(user._id);
      res.status(200).json({
        _id: user._id,
        email: user.email,
        token,
        name: user.name,
        phone: user.phone,
        gymId: user.gymId,
        role: user.role,
        subscriptionExpiry: user.subscriptionExpiry
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async register(req, res) {
    const { name, email, password, adminToken, gymName } = req.body;

    try {
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const emailClean = email.toLowerCase().trim();
      // Also block gym-owner emails: a member account with that email would
      // shadow the owner at /login and lock them out of their gym.
      const [existingUser, existingGym] = await Promise.all([
        User.findOne({ email: emailClean }),
        Gym.exists({ adminEmail: emailClean })
      ]);
      if (existingUser || existingGym) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Becoming a gym owner needs the private ADMIN_ACCESS_TOKEN. With no
      // token configured, owner self-registration is disabled.
      const wantsAdmin = typeof adminToken === 'string' && adminToken.trim() !== '';
      const adminSecret = getAdminAccessToken();
      if (wantsAdmin && (!adminSecret || !safeEqual(adminToken.trim(), adminSecret))) {
        return res.status(403).json({ error: 'Invalid admin access token' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      let role = 'user';
      let gymId = null;

      if (wantsAdmin) {
        role = 'admin';
        const nameOfGym = gymName ? gymName.trim() : `${name}'s Gym`;
        const gym = await Gym.create({
          name: nameOfGym,
          adminEmail: emailClean,
          passwordHash,
          subscriptionStatus: 'active'
        });
        gymId = gym._id;
      } else {
        // NOTE: self-registered members join the first gym. That's a product
        // decision (no gym selection/invite yet), but they can no longer use
        // any admin endpoints (see requireRole in routes/adminRoutes.js).
        let gym = await Gym.findOne();
        if (!gym) {
          // Placeholder owner account nobody can log in to (random password).
          gym = await Gym.create({
            name: 'FitFix HQ',
            adminEmail: 'hq@fitfix.com',
            passwordHash: await bcrypt.hash(require('crypto').randomBytes(32).toString('hex'), 10),
            subscriptionStatus: 'active'
          });
        }
        gymId = gym._id;
      }

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 3);

      const user = await User.create({
        name,
        email: emailClean,
        passwordHash,
        gymId,
        role,
        subscriptionExpiry: role === 'admin' ? undefined : expiry
      });

      const token = createToken(user._id);

      res.status(201).json({
        _id: user._id,
        email: user.email,
        token,
        name: user.name,
        gymId: user.gymId,
        role: user.role,
        subscriptionExpiry: user.subscriptionExpiry
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async managerLogin(req, res) {
    const { email, password } = req.body;

    try {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const gym = await Gym.findOne({ adminEmail: email.toLowerCase().trim() });
      if (!gym) {
        return res.status(400).json({ error: 'Invalid manager credentials' });
      }

      const match = await bcrypt.compare(password, gym.passwordHash);
      if (!match) {
        return res.status(400).json({ error: 'Invalid manager credentials' });
      }

      const token = createToken(gym._id);
      res.status(200).json({ email: gym.adminEmail, token, name: gym.name, gymId: gym._id, role: 'admin' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AuthController();
