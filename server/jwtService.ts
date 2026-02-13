import crypto from 'crypto';

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET is not set. Using a random secret which will invalidate tokens on restart.');
}

const ACCESS_TOKEN_SECRET = process.env.SESSION_SECRET || 'dev-secret-not-for-production';
const REFRESH_TOKEN_SECRET = process.env.SESSION_SECRET ? process.env.SESSION_SECRET + '_refresh' : 'dev-refresh-secret-not-for-production';

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes in ms
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function sign(payload: object, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${headerB64}.${payloadB64}.${signature}`;
}

function verify(token: string, secret: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as TokenPayload;
    
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export function generateAccessToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + ACCESS_TOKEN_EXPIRY,
  };
  return sign(payload, ACCESS_TOKEN_SECRET);
}

export function generateRefreshToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + REFRESH_TOKEN_EXPIRY,
  };
  return sign(payload, REFRESH_TOKEN_SECRET);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  return verify(token, ACCESS_TOKEN_SECRET);
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  return verify(token, REFRESH_TOKEN_SECRET);
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const TOKEN_EXPIRY = {
  ACCESS: ACCESS_TOKEN_EXPIRY,
  REFRESH: REFRESH_TOKEN_EXPIRY,
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET: 60 * 60 * 1000, // 1 hour
};
