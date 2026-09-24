const OTP_TTL_SECONDS = 10 * 60;
export const SESSION_TTL_SECONDS = 365 * 24 * 60 * 60;
const MAX_ATTEMPTS = 5;

const SESSION_COOKIE_PRODUCTION = '__Host-micvolo_session';
const SESSION_COOKIE_DEVELOPMENT = 'micvolo_session';
export const CHALLENGE_COOKIE = 'micvolo_challenge';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'client';
}

interface ChallengeRow {
  challenge_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'client';
  code_hmac: string;
  requested_role: 'admin' | 'client';
  attempts: number;
  expires_at: number;
  consumed_at: number | null;
}

export function normalizeEmail(value: string): string {
  const email = value.trim();
  const at = email.lastIndexOf('@');
  if (at <= 0) return email.toLowerCase();
  return `${email.slice(0, at)}@${email.slice(at + 1).toLowerCase()}`;
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isDevelopment(env: Env, url: URL): boolean {
  const localHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  return env.ENVIRONMENT === 'development' && localHost;
}

export function sessionCookieName(env: Env, url: URL): string {
  return isDevelopment(env, url) ? SESSION_COOKIE_DEVELOPMENT : SESSION_COOKIE_PRODUCTION;
}

export function randomId(): string {
  return crypto.randomUUID();
}

function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base64Url(bytes);
}

export function randomSixDigitCode(): string {
  const max = 4_294_000_000;
  const values = new Uint32Array(1);
  do crypto.getRandomValues(values); while (values[0] >= max);
  return String(values[0] % 1_000_000).padStart(6, '0');
}

async function sha256(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64Url(new Uint8Array(bytes));
}

export async function otpHmac(secret: string, challengeId: string, email: string, code: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const payload = `otp-v1\0${challengeId}\0${email}\0${code}`;
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64Url(new Uint8Array(signature));
}

export async function requestOtp(
  db: D1Database,
  env: Env,
  emailInput: string,
  requestedRole: 'admin' | 'client',
  ip: string,
): Promise<{ challengeId?: string; code?: string; recipient?: string }> {
  const email = normalizeEmail(emailInput);
  const now = Math.floor(Date.now() / 1000);
  const ipHash = await otpHmac(env.OTP_SECRET, 'ip', 'request', ip || 'unknown');
  const user = isEmail(email)
    ? await db.prepare(
        'SELECT id, email, display_name, role FROM users WHERE email = ?1 AND role = ?2 AND active = 1 LIMIT 1',
      ).bind(email, requestedRole).first<UserRow>()
    : null;

  const adminAllowed = requestedRole !== 'admin' || normalizeEmail(env.ADMIN_EMAIL || '') === email;
  if (!user || !adminAllowed) {
    await otpHmac(env.OTP_SECRET, 'unknown', email, randomSixDigitCode());
    return {};
  }

  const challengeId = randomId();
  const code = randomSixDigitCode();
  const codeHmac = await otpHmac(env.OTP_SECRET, challengeId, normalizeEmail(user.email), code);
  const reservation = await db.prepare(
    `INSERT INTO otp_challenges
     (id, user_id, requested_role, code_hmac, requested_ip_hash, expires_at, created_at)
     SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7
     WHERE (SELECT COUNT(*) FROM otp_challenges WHERE user_id = ?2 AND created_at > ?8) < 1
       AND (SELECT COUNT(*) FROM otp_challenges WHERE user_id = ?2 AND created_at > ?9) < 5
       AND (SELECT COUNT(*) FROM otp_challenges WHERE requested_ip_hash = ?5 AND created_at > ?10) < 10`,
  ).bind(
    challengeId,
    user.id,
    requestedRole,
    codeHmac,
    ipHash,
    now + OTP_TTL_SECONDS,
    now,
    now - 60,
    now - 3600,
    now - 900,
  ).run();
  if (reservation.meta.changes !== 1) return {};

  await db.prepare(
    `UPDATE otp_challenges SET consumed_at = ?1
     WHERE user_id = ?2 AND requested_role = ?3 AND consumed_at IS NULL AND id != ?4`,
  ).bind(now, user.id, requestedRole, challengeId).run();

  return { challengeId, code, recipient: user.email };
}

export async function verifyOtp(
  db: D1Database,
  env: Env,
  challengeId: string,
  code: string,
  requestedRole: 'admin' | 'client',
): Promise<{ principal: Principal; token: string } | null> {
  const now = Math.floor(Date.now() / 1000);
  if (!/^\d{6}$/.test(code)) return null;
  const challenge = await db.prepare(
    `SELECT c.id AS challenge_id, c.code_hmac, c.requested_role, c.attempts, c.expires_at, c.consumed_at,
            u.id AS user_id, u.email, u.display_name, u.role
     FROM otp_challenges c JOIN users u ON u.id = c.user_id
     WHERE c.id = ?1 AND u.active = 1 LIMIT 1`,
  ).bind(challengeId).first<ChallengeRow>();
  if (!challenge || challenge.requested_role !== requestedRole || challenge.role !== requestedRole) return null;
  if (requestedRole === 'admin' && normalizeEmail(env.ADMIN_EMAIL || '') !== normalizeEmail(challenge.email)) return null;
  if (challenge.consumed_at || challenge.expires_at <= now || challenge.attempts >= MAX_ATTEMPTS) return null;

  const expected = await otpHmac(env.OTP_SECRET, challengeId, normalizeEmail(challenge.email), code);
  if (!constantTimeEqual(expected, challenge.code_hmac)) {
    await db.prepare(
      'UPDATE otp_challenges SET attempts = MIN(attempts + 1, 5) WHERE id = ?1 AND consumed_at IS NULL AND attempts < 5',
    ).bind(challengeId).run();
    return null;
  }

  const consumed = await db.prepare(
    `UPDATE otp_challenges SET consumed_at = ?1
     WHERE id = ?2 AND consumed_at IS NULL AND expires_at > ?1 AND attempts < ?3`,
  ).bind(now, challengeId, MAX_ATTEMPTS).run();
  if (consumed.meta.changes !== 1) return null;

  const token = randomToken();
  const tokenHash = await sha256(token);
  await db.prepare(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?1, ?2, ?3, ?4, ?5)',
  ).bind(randomId(), challenge.user_id, tokenHash, now + SESSION_TTL_SECONDS, now).run();

  return {
    principal: {
      userId: challenge.user_id,
      email: challenge.email,
      displayName: challenge.display_name,
      role: challenge.role,
    },
    token,
  };
}

export async function getPrincipal(db: D1Database, token: string | undefined): Promise<Principal | null> {
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  return db.prepare(
    `SELECT u.id AS userId, u.email, u.display_name AS displayName, u.role
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?1 AND s.revoked_at IS NULL AND s.expires_at > ?2 AND u.active = 1 LIMIT 1`,
  ).bind(tokenHash, now).first<Principal>();
}

export async function revokeSession(db: D1Database, token: string | undefined): Promise<void> {
  if (!token) return;
  const tokenHash = await sha256(token);
  await db.prepare('UPDATE sessions SET revoked_at = unixepoch() WHERE token_hash = ?1 AND revoked_at IS NULL')
    .bind(tokenHash).run();
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i += 1) difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
