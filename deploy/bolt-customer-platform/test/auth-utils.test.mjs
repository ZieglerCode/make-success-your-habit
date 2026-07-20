import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  hashSessionToken,
  isAllowedProjectHost,
  isTrustedRequestOrigin,
  normalizeEmail,
  normalizeHost,
  parseCookies,
  safeReturnTo,
  verifyPassword,
} from '../src/auth-utils.mjs';

test('normalizes email and host values', () => {
  assert.equal(normalizeEmail(' Admin@Example.COM '), 'admin@example.com');
  assert.equal(normalizeHost('Client.Build.Example.com:443'), 'client.build.example.com');
});

test('allows only root and child project hosts', () => {
  assert.equal(isAllowedProjectHost('build.example.com', 'build.example.com'), true);
  assert.equal(isAllowedProjectHost('acme.build.example.com', 'build.example.com'), true);
  assert.equal(isAllowedProjectHost('build.example.com.attacker.test', 'build.example.com'), false);
});

test('prevents return URL redirects outside the platform', () => {
  assert.equal(
    safeReturnTo('https://acme.build.example.com/project', 'build.example.com'),
    'https://acme.build.example.com/project',
  );
  assert.equal(
    safeReturnTo('https://attacker.test/', 'build.example.com'),
    'https://build.example.com/',
  );
});

test('accepts same-origin browser forms and rejects cross-site forms', () => {
  assert.equal(
    isTrustedRequestOrigin(undefined, 'same-origin', undefined, 'build.example.com'),
    true,
  );
  assert.equal(
    isTrustedRequestOrigin(undefined, 'cross-site', undefined, 'build.example.com'),
    false,
  );
  assert.equal(
    isTrustedRequestOrigin('https://client.build.example.com', 'cross-site', undefined, 'build.example.com'),
    true,
  );
  assert.equal(
    isTrustedRequestOrigin('https://attacker.test', 'cross-site', undefined, 'build.example.com'),
    false,
  );
  assert.equal(
    isTrustedRequestOrigin(
      undefined,
      undefined,
      'https://build.example.com/_auth/login',
      'build.example.com',
    ),
    true,
  );
  assert.equal(
    isTrustedRequestOrigin(
      undefined,
      undefined,
      'https://attacker.test/form',
      'build.example.com',
    ),
    false,
  );
});

test('hashes and verifies passwords', async () => {
  const hash = await hashPassword('a-secure-password');
  assert.equal(await verifyPassword('a-secure-password', hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
});

test('session hashes are peppered', () => {
  assert.notEqual(hashSessionToken('token', 'pepper-one'), hashSessionToken('token', 'pepper-two'));
});

test('parses cookies without truncating encoded values', () => {
  assert.deepEqual(parseCookies('session=abc%20123; theme=dark'), {
    session: 'abc 123',
    theme: 'dark',
  });
});
