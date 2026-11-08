// Minimal in-memory fixed-window rate limiter (no extra dependency).
// Counts live in this process only, which fits the single Render instance. If
// the API is ever scaled to several instances, switch to a shared store
// (e.g. express-rate-limit with Redis).

/**
 * @param {object} opts
 * @param {number} opts.windowMs  window length in ms
 * @param {number} opts.max       allowed requests per key per window
 * @param {(req) => string} opts.key  what to count by (IP, IP+email, user id…)
 * @param {string} [opts.message]
 */
function rateLimit({ windowMs, max, key, message = 'Too many requests. Please try again later.' }) {
  const hits = new Map(); // key -> { count, resetAt }

  // Periodically drop expired windows so the map can't grow without bound.
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [k, entry] of hits) if (entry.resetAt <= now) hits.delete(k);
  }, windowMs);
  sweeper.unref();

  return (req, res, next) => {
    const now = Date.now();
    const k = key(req);
    let entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(k, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

const MINUTE = 60 * 1000;
const emailOf = (req) => String(req.body?.email || '').toLowerCase().trim();

// Password guessing: per account (from one IP) and overall per IP.
const loginPerAccount = rateLimit({
  windowMs: 15 * MINUTE,
  max: 10,
  key: (req) => `login:${req.ip}:${emailOf(req)}`,
  message: 'Too many login attempts. Please wait 15 minutes and try again.'
});
const loginPerIp = rateLimit({
  windowMs: 15 * MINUTE,
  max: 50,
  key: (req) => `login-ip:${req.ip}`,
  message: 'Too many login attempts. Please wait 15 minutes and try again.'
});
const registerPerIp = rateLimit({
  windowMs: 60 * MINUTE,
  max: 20,
  key: (req) => `register:${req.ip}`,
  message: 'Too many sign-ups from this network. Please try again later.'
});
// Pose analysis is the expensive endpoint: cap each user at ~10 frames/second.
const analyzePerUser = rateLimit({
  windowMs: MINUTE,
  max: 600,
  key: (req) => `analyze:${req.user ? req.user._id : req.ip}`,
  message: 'Too many frames. Slow down and try again shortly.'
});

module.exports = { rateLimit, loginPerAccount, loginPerIp, registerPerIp, analyzePerUser };
