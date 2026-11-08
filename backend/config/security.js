const crypto = require('crypto');

// Values that have ever shipped as defaults/examples in this repo. A secret
// that is public can't protect anything: anyone could sign their own tokens.
const KNOWN_PUBLIC_SECRETS = new Set([
  'your_super_secret_jwt_key_here',
  'admin-secret-token-123',
  'password123'
]);

const MIN_JWT_SECRET_LENGTH = 32;

/**
 * The JWT signing secret. Throws if it's missing, too short, or a known
 * public default — the server refuses to start rather than run with a
 * forgeable secret (see server.js).
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH || KNOWN_PUBLIC_SECRETS.has(secret)) {
    throw new Error(
      `JWT_SECRET must be set to a private random value of at least ${MIN_JWT_SECRET_LENGTH} characters. ` +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
  return secret;
}

/**
 * The token that lets someone register as a gym owner, or null when admin
 * self-registration is disabled (unset, or a known public default).
 */
function getAdminAccessToken() {
  const token = process.env.ADMIN_ACCESS_TOKEN;
  if (!token || KNOWN_PUBLIC_SECRETS.has(token)) return null;
  return token;
}

/** Constant-time string comparison (hashing first equalizes lengths). */
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** A random one-time password for accounts created by an admin. */
function generateTemporaryPassword() {
  return crypto.randomBytes(9).toString('base64url'); // 12 URL-safe chars
}

module.exports = { getJwtSecret, getAdminAccessToken, safeEqual, generateTemporaryPassword, MIN_JWT_SECRET_LENGTH };
