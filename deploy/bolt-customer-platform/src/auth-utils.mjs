import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export function normalizeEmail(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function normalizeHost(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

export function isAllowedProjectHost(host, rootHost) {
  const normalizedHost = normalizeHost(host);
  const normalizedRoot = normalizeHost(rootHost);
  return (
    normalizedHost === normalizedRoot ||
    normalizedHost.endsWith(`.${normalizedRoot}`)
  );
}

export function safeReturnTo(value, rootHost) {
  const fallback = `https://${normalizeHost(rootHost)}/`;

  try {
    const parsed = new URL(String(value ?? fallback));
    if (
      parsed.protocol !== 'https:' ||
      !isAllowedProjectHost(parsed.hostname, rootHost)
    ) {
      return fallback;
    }
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export function isTrustedRequestOrigin(origin, secFetchSite, referer, rootHost) {
  if (!origin) {
    if (secFetchSite === 'same-origin') return true;
    try {
      const parsedReferer = new URL(String(referer ?? ''));
      return (
        parsedReferer.protocol === 'https:' &&
        isAllowedProjectHost(parsedReferer.hostname, rootHost)
      );
    } catch {
      return false;
    }
  }

  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && isAllowedProjectHost(parsed.hostname, rootHost);
  } catch {
    return false;
  }
}

export async function hashPassword(password) {
  if (String(password).length < 12) {
    throw new Error('Passwords must contain at least 12 characters.');
  }

  const salt = randomBytes(16);
  const derivedKey = await scrypt(String(password), salt, 64);
  return `scrypt$${salt.toString('base64url')}$${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password, encodedHash) {
  const [algorithm, saltValue, hashValue] = String(encodedHash).split('$');
  if (algorithm !== 'scrypt' || !saltValue || !hashValue) {
    return false;
  }

  try {
    const expected = Buffer.from(hashValue, 'base64url');
    const actual = await scrypt(
      String(password),
      Buffer.from(saltValue, 'base64url'),
      expected.length,
    );
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token, pepper) {
  return createHash('sha256')
    .update(`${String(pepper)}:${String(token)}`)
    .digest('hex');
}

export function parseCookies(header) {
  const cookies = {};
  for (const part of String(header ?? '').split(';')) {
    const separator = part.indexOf('=');
    if (separator <= 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }
  return cookies;
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
