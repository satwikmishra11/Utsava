import { env } from '@/lib/env';

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role?: string;
  readonly exp: number;
}

const COOKIE_NAME = 'utsava_session';
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]!);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function signSession(
  user: Omit<SessionUser, 'exp'>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sessionUser: SessionUser = { ...user, exp };
  const payloadJson = JSON.stringify(sessionUser);
  const enc = new TextEncoder();
  const payloadB64 = base64UrlEncode(enc.encode(payloadJson));

  const key = await getCryptoKey(env.SESSION_SECRET);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = base64UrlEncode(new Uint8Array(sigBuffer));

  return `${payloadB64}.${sigB64}`;
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  const parts = token.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payloadB64, sigB64] = parts;

  try {
    const key = await getCryptoKey(env.SESSION_SECRET);
    const enc = new TextEncoder();
    const sigBytes = base64UrlDecode(sigB64);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(payloadB64);
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const session = JSON.parse(payloadStr) as SessionUser;

    if (!session.id || !session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function parseCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const prefix = `${COOKIE_NAME}=`;
  for (const c of cookies) {
    if (c.startsWith(prefix)) {
      return decodeURIComponent(c.substring(prefix.length));
    }
  }
  return null;
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = await verifySession(token);
    if (user) return user;
  }

  const token = parseCookie(req.headers.get('cookie'));
  if (!token) return null;
  return verifySession(token);
}

export function buildSessionCookieHeader(
  token: string,
  maxAge: number = DEFAULT_TTL_SECONDS
): string {
  const isProd = env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Strict',
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearSessionCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`;
}
