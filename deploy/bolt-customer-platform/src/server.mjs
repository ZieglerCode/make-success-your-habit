import http from 'node:http';
import { readdir, readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import {
  createSessionToken,
  escapeHtml,
  hashPassword,
  hashSessionToken,
  isAllowedProjectHost,
  isTrustedRequestOrigin,
  normalizeEmail,
  normalizeHost,
  parseCookies,
  safeReturnTo,
  verifyPassword,
} from './auth-utils.mjs';

const { Pool } = pg;

const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  rootHost: normalizeHost(process.env.BOLT_ROOT_HOST ?? 'build.mathishoffmann.com'),
  cookieDomain: process.env.COOKIE_DOMAIN ?? '.build.mathishoffmann.com',
  sessionPepper: process.env.SESSION_PEPPER ?? '',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS ?? 7),
  bootstrapAdminEmail: normalizeEmail(process.env.BOOTSTRAP_ADMIN_EMAIL),
  bootstrapAdminPassword: process.env.BOOTSTRAP_ADMIN_PASSWORD ?? '',
  bootstrapAdminName: process.env.BOOTSTRAP_ADMIN_NAME ?? 'Platform Admin',
};

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required.');
}
if (config.sessionPepper.length < 32) {
  throw new Error('SESSION_PEPPER must contain at least 32 characters.');
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
});

const loginAttempts = new Map();
const sessionCookieName = 'bolt_customer_session';

function securityHeaders(contentType = 'text/html; charset=utf-8') {
  return {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Content-Security-Policy':
      "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'Referrer-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { ...securityHeaders(), ...headers });
  res.end(body);
}

function sendJson(res, status, payload, headers = {}) {
  send(res, status, JSON.stringify(payload), {
    ...headers,
    'Content-Type': 'application/json; charset=utf-8',
  });
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, {
    ...securityHeaders(),
    ...headers,
    Location: location,
  });
  res.end();
}

function requestOriginIsAllowed(req) {
  return isTrustedRequestOrigin(
    req.headers.origin,
    req.headers['sec-fetch-site'],
    req.headers.referer,
    config.rootHost,
  );
}

async function readForm(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 64 * 1024) {
      throw Object.assign(new Error('Request too large'), { statusCode: 413 });
    }
  }
  return new URLSearchParams(body);
}

function sessionCookie(token, maxAgeSeconds) {
  return [
    `${sessionCookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    `Domain=${config.cookieDomain}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ');
}

async function runMigrations() {
  const migrationDirectory = new URL('../migrations/', import.meta.url);
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  for (const migrationFile of migrationFiles) {
    const migration = await readFile(new URL(migrationFile, migrationDirectory), 'utf8');
    await pool.query(migration);
  }
}

async function seedAdmin() {
  if (!config.bootstrapAdminEmail || !config.bootstrapAdminPassword) return;

  const existing = await pool.query(
    'SELECT id FROM users WHERE lower(email) = lower($1)',
    [config.bootstrapAdminEmail],
  );
  if (existing.rowCount > 0) return;

  const userId = randomUUID();
  const passwordHash = await hashPassword(config.bootstrapAdminPassword);
  await pool.query(
    `INSERT INTO users (id, email, display_name, password_hash, platform_role)
     VALUES ($1, $2, $3, $4, 'platform_admin')`,
    [userId, config.bootstrapAdminEmail, config.bootstrapAdminName, passwordHash],
  );
  await pool.query(
    `INSERT INTO audit_log (actor_user_id, action, target_type, target_id)
     VALUES ($1, 'platform.bootstrap_admin', 'user', $1::text)`,
    [userId],
  );
  console.log(`Bootstrapped platform administrator ${config.bootstrapAdminEmail}`);
}

async function deleteExpiredSessions() {
  await pool.query('DELETE FROM sessions WHERE expires_at <= now()');
}

async function getCurrentSession(req) {
  const token = parseCookies(req.headers.cookie)[sessionCookieName];
  if (!token) return null;

  const tokenHash = hashSessionToken(token, config.sessionPepper);
  const result = await pool.query(
    `SELECT
       s.id AS session_id,
       s.csrf_token,
       s.expires_at,
       u.id AS user_id,
       u.email,
       u.display_name,
       u.platform_role,
       u.status
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash],
  );
  const session = result.rows[0];
  if (!session || session.status !== 'active') return null;

  pool
    .query('UPDATE sessions SET last_seen_at = now() WHERE id = $1', [session.session_id])
    .catch(() => {});
  return session;
}

async function createSession(res, userId) {
  const token = createSessionToken();
  const csrfToken = createSessionToken();
  const tokenHash = hashSessionToken(token, config.sessionPepper);
  const expiresAt = new Date(
    Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000,
  );

  await pool.query(
    `INSERT INTO sessions (id, user_id, token_hash, csrf_token, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [randomUUID(), userId, tokenHash, csrfToken, expiresAt],
  );
  res.setHeader(
    'Set-Cookie',
    sessionCookie(token, config.sessionTtlDays * 24 * 60 * 60),
  );
}

async function audit(actorUserId, action, targetType, targetId, metadata = {}) {
  await pool.query(
    `INSERT INTO audit_log
       (actor_user_id, action, target_type, target_id, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actorUserId, action, targetType, targetId, JSON.stringify(metadata)],
  );
}

function renderLayout(title, body) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #0a0a0b;
        color: #f5f5f5;
      }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; background: #0a0a0b; }
      main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 64px 0; }
      .login { width: min(420px, 100%); margin: 10vh auto 0; }
      .mark { width: 38px; height: 38px; display: grid; place-items: center; margin-bottom: 36px; border-radius: 10px; background: #f4f4f5; color: #09090b; font-weight: 800; }
      h1 { margin: 0 0 10px; font-size: clamp(30px, 5vw, 46px); line-height: 1; letter-spacing: -0.045em; }
      h2 { margin: 0; font-size: 18px; }
      p { color: #a1a1aa; line-height: 1.6; }
      form { display: grid; gap: 16px; margin-top: 32px; }
      label { display: grid; gap: 8px; color: #d4d4d8; font-size: 13px; }
      input, select { width: 100%; border: 1px solid #303036; border-radius: 10px; padding: 12px 13px; background: #141416; color: #fff; font: inherit; }
      input:focus, select:focus { outline: 2px solid #7c3aed; outline-offset: 1px; }
      button, .button { border: 0; border-radius: 10px; padding: 12px 16px; background: #f4f4f5; color: #09090b; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; }
      button.secondary { background: #242428; color: #f4f4f5; }
      .error { padding: 12px 14px; border: 1px solid #7f1d1d; border-radius: 10px; background: #2a1010; color: #fecaca; }
      header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 44px; }
      header form { margin: 0; display: block; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
      .panel { min-width: 0; border: 1px solid #27272a; border-radius: 14px; padding: 22px; background: #111113; }
      .panel form { margin-top: 22px; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
      th, td { padding: 10px 8px; border-bottom: 1px solid #27272a; text-align: left; vertical-align: top; }
      th { color: #a1a1aa; font-weight: 600; }
      code { color: #c4b5fd; overflow-wrap: anywhere; }
      a { color: #c4b5fd; overflow-wrap: anywhere; }
      .hint { margin: 2px 0 0; font-size: 12px; color: #71717a; overflow-wrap: anywhere; }
      .status { display: inline-flex; align-items: center; gap: 7px; }
      .status::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #71717a; }
      .status-ready::before { background: #22c55e; }
      .status-pending::before, .status-provisioning::before { background: #eab308; }
      .status-failed::before { background: #ef4444; }
      .inline-form { display: inline; margin: 0; }
      .inline-form button { padding: 7px 10px; font-size: 12px; }
      .wide { grid-column: 1 / -1; }
      @media (max-width: 760px) {
        main { padding: 32px 0; }
        .grid { grid-template-columns: minmax(0, 1fr); }
        .wide { grid-column: auto; }
        header { align-items: flex-start; }
        table { display: block; max-width: 100%; overflow-x: auto; }
      }
    </style>
  </head>
  <body><main>${body}</main></body>
</html>`;
}

function renderLogin(returnTo, error = '') {
  return renderLayout(
    'Anmelden · Build',
    `<section class="login">
      <div class="mark">B</div>
      <h1>Willkommen zurück.</h1>
      <p>Melde dich an, um auf deine freigegebenen Projekte zuzugreifen.</p>
      ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}
      <form method="post" action="/_auth/login">
        <input type="hidden" name="return_to" value="${escapeHtml(returnTo)}">
        <label>E-Mail<input name="email" type="email" autocomplete="username" required autofocus></label>
        <label>Passwort<input name="password" type="password" autocomplete="current-password" required></label>
        <button type="submit">Anmelden</button>
      </form>
    </section>`,
  );
}

async function renderAdmin(session) {
  const [users, projects, memberships] = await Promise.all([
    pool.query(
      'SELECT id, email, display_name, platform_role, status FROM users ORDER BY created_at',
    ),
    pool.query(
      `SELECT id, name, slug, primary_host, project_type, status,
         provisioning_status, provisioning_error
       FROM projects ORDER BY created_at`,
    ),
    pool.query(
      `SELECT pm.user_id, pm.project_id, pm.role, u.email, p.name AS project_name
       FROM project_memberships pm
       JOIN users u ON u.id = pm.user_id
       JOIN projects p ON p.id = pm.project_id
       ORDER BY p.name, u.email`,
    ),
  ]);

  const userOptions = users.rows
    .map((user) => `<option value="${user.id}">${escapeHtml(user.email)}</option>`)
    .join('');
  const projectOptions = projects.rows
    .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`)
    .join('');

  return renderLayout(
    'Kundenplattform · Build',
    `<header>
      <div><h1>Kundenplattform</h1><p>Benutzer, Projekte und Zugriffsrechte verwalten.</p></div>
      <form method="post" action="/_auth/logout">
        <input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
        <button class="secondary" type="submit">Abmelden</button>
      </form>
    </header>
    <section class="grid">
      <article class="panel">
        <h2>Kundenkonto anlegen</h2>
        <form method="post" action="/_auth/admin/users">
          <input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
          <label>Name<input name="display_name" required></label>
          <label>E-Mail<input name="email" type="email" required></label>
          <label>Startpasswort<input name="password" type="password" minlength="12" required></label>
          <button type="submit">Konto anlegen</button>
        </form>
      </article>
      <article class="panel">
        <h2>Projekt anlegen</h2>
        <form method="post" action="/_auth/admin/projects">
          <input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
          <label>Name<input name="name" required></label>
          <label>Kürzel<input name="slug" pattern="[a-z0-9-]+" placeholder="kunde-projekt" required></label>
          <p class="hint">Die Adresse wird automatisch als &lt;kürzel&gt;.${escapeHtml(config.rootHost)} angelegt.</p>
          <label>Typ<select name="project_type"><option value="website">Website</option><option value="webapp">Webapp</option></select></label>
          <button type="submit">Projekt anlegen</button>
        </form>
      </article>
      <article class="panel wide">
        <h2>Zugriff zuweisen</h2>
        <form method="post" action="/_auth/admin/memberships">
          <input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
          <label>Benutzer<select name="user_id" required>${userOptions}</select></label>
          <label>Projekt<select name="project_id" required>${projectOptions}</select></label>
          <label>Rolle<select name="role"><option value="editor">Editor</option><option value="reviewer">Reviewer</option><option value="publisher">Publisher</option><option value="customer_admin">Kunden-Admin</option></select></label>
          <button type="submit">Zugriff speichern</button>
        </form>
      </article>
      <article class="panel wide">
        <h2>Aktuelle Zugriffe</h2>
        <table><thead><tr><th>Projekt</th><th>Benutzer</th><th>Rolle</th></tr></thead>
        <tbody>${memberships.rows.map((row) => `<tr><td>${escapeHtml(row.project_name)}</td><td>${escapeHtml(row.email)}</td><td>${escapeHtml(row.role)}</td></tr>`).join('') || '<tr><td colspan="3">Noch keine Projektzugriffe.</td></tr>'}</tbody></table>
      </article>
      <article class="panel wide">
        <h2>Projekte</h2>
        <table><thead><tr><th>Name</th><th>Builder-Adresse</th><th>Typ</th><th>Bereitstellung</th><th></th></tr></thead>
        <tbody>${projects.rows.map((project) => {
          const labels = { pending: 'Wartet', provisioning: 'Wird erstellt', ready: 'Bereit', failed: 'Fehlgeschlagen' };
          const statusLabel = labels[project.provisioning_status] ?? project.provisioning_status;
          const host = escapeHtml(project.primary_host);
          const address = project.provisioning_status === 'ready'
            ? `<a href="https://${host}/" target="_blank" rel="noreferrer">${host}</a>`
            : `<code>${host}</code>`;
          const action = project.provisioning_status === 'failed'
            ? `<form class="inline-form" method="post" action="/_auth/admin/projects/retry">
                <input type="hidden" name="csrf" value="${escapeHtml(session.csrf_token)}">
                <input type="hidden" name="project_id" value="${project.id}">
                <button class="secondary" type="submit">Erneut versuchen</button>
              </form>`
            : '';
          return `<tr title="${escapeHtml(project.provisioning_error ?? '')}">
            <td>${escapeHtml(project.name)}</td>
            <td>${address}</td>
            <td>${escapeHtml(project.project_type)}</td>
            <td><span class="status status-${escapeHtml(project.provisioning_status)}">${escapeHtml(statusLabel)}</span></td>
            <td>${action}</td>
          </tr>`;
        }).join('') || '<tr><td colspan="5">Noch keine Projekte.</td></tr>'}</tbody></table>
      </article>
    </section>`,
  );
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '')
    .split(',')[0]
    .trim();
}

function loginIsRateLimited(req) {
  const key = clientIp(req);
  const now = Date.now();
  const recent = (loginAttempts.get(key) ?? []).filter((timestamp) => now - timestamp < 15 * 60_000);
  loginAttempts.set(key, recent);
  return recent.length >= 10;
}

function recordFailedLogin(req) {
  const key = clientIp(req);
  const current = loginAttempts.get(key) ?? [];
  current.push(Date.now());
  loginAttempts.set(key, current);
}

function clearLoginAttempts(req) {
  loginAttempts.delete(clientIp(req));
}

async function requireAdmin(req, res) {
  const session = await getCurrentSession(req);
  if (!session) {
    redirect(res, `/_auth/login?return_to=${encodeURIComponent(`https://${config.rootHost}/_auth/admin`)}`);
    return null;
  }
  if (session.platform_role !== 'platform_admin') {
    send(res, 403, 'Forbidden');
    return null;
  }
  return session;
}

async function requireAdminPost(req, res, form) {
  const session = await requireAdmin(req, res);
  if (!session) return null;
  if (!requestOriginIsAllowed(req) || form.get('csrf') !== session.csrf_token) {
    send(res, 403, 'Invalid request');
    return null;
  }
  return session;
}

async function handleVerify(req, res) {
  const forwardedHost = normalizeHost(
    req.headers['x-forwarded-host'] ?? req.headers.host ?? config.rootHost,
  );
  const forwardedUri = String(req.headers['x-forwarded-uri'] ?? '/');
  const returnTo = safeReturnTo(`https://${forwardedHost}${forwardedUri}`, config.rootHost);
  const session = await getCurrentSession(req);

  if (!session) {
    redirect(
      res,
      `https://${config.rootHost}/_auth/login?return_to=${encodeURIComponent(returnTo)}`,
    );
    return;
  }

  if (session.platform_role === 'platform_admin') {
    res.writeHead(204, {
      'X-Auth-User-ID': session.user_id,
      'X-Auth-User-Email': session.email,
      'X-Auth-Role': 'platform_admin',
    });
    res.end();
    return;
  }

  if (forwardedHost === config.rootHost) {
    send(res, 403, 'Dieser Bereich ist ausschließlich für Plattform-Administratoren.');
    return;
  }

  const result = await pool.query(
    `SELECT p.id AS project_id, pm.role
     FROM projects p
     JOIN project_memberships pm ON pm.project_id = p.id
     WHERE lower(p.primary_host) = lower($1)
       AND p.status = 'active'
       AND p.provisioning_status = 'ready'
       AND pm.user_id = $2`,
    [forwardedHost, session.user_id],
  );
  const membership = result.rows[0];

  if (!membership) {
    send(res, 403, 'Du hast keinen Zugriff auf dieses Projekt.');
    return;
  }

  res.writeHead(204, {
    'X-Auth-User-ID': session.user_id,
    'X-Auth-User-Email': session.email,
    'X-Auth-Project-ID': membership.project_id,
    'X-Auth-Role': membership.role,
  });
  res.end();
}

async function handleLoginPost(req, res) {
  const form = await readForm(req);
  const returnTo = safeReturnTo(form.get('return_to'), config.rootHost);
  if (!requestOriginIsAllowed(req)) {
    send(res, 403, 'Invalid request');
    return;
  }
  if (loginIsRateLimited(req)) {
    send(res, 429, renderLogin(returnTo, 'Zu viele Versuche. Bitte warte 15 Minuten.'));
    return;
  }

  const email = normalizeEmail(form.get('email'));
  const password = String(form.get('password') ?? '');
  const result = await pool.query(
    `SELECT id, email, password_hash, status
     FROM users WHERE lower(email) = lower($1)`,
    [email],
  );
  const user = result.rows[0];
  const valid = user && user.status === 'active'
    ? await verifyPassword(password, user.password_hash)
    : false;

  if (!valid) {
    recordFailedLogin(req);
    send(res, 401, renderLogin(returnTo, 'E-Mail oder Passwort ist nicht korrekt.'));
    return;
  }

  clearLoginAttempts(req);
  await createSession(res, user.id);
  await audit(user.id, 'auth.login', 'user', user.id, { ip: clientIp(req) });
  redirect(res, returnTo);
}

async function handleLogout(req, res) {
  const form = await readForm(req);
  const session = await getCurrentSession(req);
  if (
    session &&
    requestOriginIsAllowed(req) &&
    form.get('csrf') === session.csrf_token
  ) {
    const token = parseCookies(req.headers.cookie)[sessionCookieName];
    await pool.query('DELETE FROM sessions WHERE token_hash = $1', [
      hashSessionToken(token, config.sessionPepper),
    ]);
    await audit(session.user_id, 'auth.logout', 'user', session.user_id);
  }
  redirect(res, `https://${config.rootHost}/_auth/login`, {
    'Set-Cookie': sessionCookie('', 0),
  });
}

async function handleCreateUser(req, res) {
  const form = await readForm(req);
  const session = await requireAdminPost(req, res, form);
  if (!session) return;

  const email = normalizeEmail(form.get('email'));
  const displayName = String(form.get('display_name') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!email || !displayName) {
    send(res, 400, 'Name and email are required.');
    return;
  }

  const userId = randomUUID();
  await pool.query(
    `INSERT INTO users (id, email, display_name, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [userId, email, displayName, await hashPassword(password)],
  );
  await audit(session.user_id, 'user.create', 'user', userId, { email });
  redirect(res, '/_auth/admin');
}

async function handleCreateProject(req, res) {
  const form = await readForm(req);
  const session = await requireAdminPost(req, res, form);
  if (!session) return;

  const name = String(form.get('name') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim().toLowerCase();
  const primaryHost = `${slug}.${config.rootHost}`;
  const projectType = form.get('project_type') === 'webapp' ? 'webapp' : 'website';
  if (
    !name ||
    !/^[a-z0-9-]+$/.test(slug) ||
    slug.length > 48
  ) {
    send(res, 400, 'Invalid project data.');
    return;
  }

  const projectId = randomUUID();
  await pool.query(
    `INSERT INTO projects (id, name, slug, primary_host, project_type)
     VALUES ($1, $2, $3, $4, $5)`,
    [projectId, name, slug, primaryHost, projectType],
  );
  await audit(session.user_id, 'project.create', 'project', projectId, {
    primaryHost,
  });
  redirect(res, '/_auth/admin');
}

async function handleRetryProject(req, res) {
  const form = await readForm(req);
  const session = await requireAdminPost(req, res, form);
  if (!session) return;

  const projectId = String(form.get('project_id') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(projectId)) {
    send(res, 400, 'Invalid project.');
    return;
  }

  const result = await pool.query(
    `UPDATE projects
     SET provisioning_status = 'pending',
         provisioning_error = NULL,
         updated_at = now()
     WHERE id = $1 AND provisioning_status = 'failed'
     RETURNING id`,
    [projectId],
  );
  if (result.rowCount > 0) {
    await audit(session.user_id, 'project.provisioning_retry', 'project', projectId);
  }
  redirect(res, '/_auth/admin');
}

async function handleMembership(req, res) {
  const form = await readForm(req);
  const session = await requireAdminPost(req, res, form);
  if (!session) return;

  const userId = String(form.get('user_id') ?? '');
  const projectId = String(form.get('project_id') ?? '');
  const allowedRoles = new Set(['customer_admin', 'editor', 'reviewer', 'publisher']);
  const role = String(form.get('role') ?? 'editor');
  if (!allowedRoles.has(role)) {
    send(res, 400, 'Invalid role.');
    return;
  }

  await pool.query(
    `INSERT INTO project_memberships (user_id, project_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, project_id) DO UPDATE SET role = EXCLUDED.role`,
    [userId, projectId, role],
  );
  await audit(session.user_id, 'membership.upsert', 'project', projectId, {
    userId,
    role,
  });
  redirect(res, '/_auth/admin');
}

async function route(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? config.rootHost}`);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/_auth/health') {
    const database = await pool.query('SELECT 1 AS ok');
    sendJson(res, 200, { status: database.rows[0].ok === 1 ? 'healthy' : 'degraded' });
    return;
  }
  if (req.method === 'GET' && path === '/_auth/verify') {
    await handleVerify(req, res);
    return;
  }
  if (req.method === 'GET' && path === '/_auth/login') {
    const returnTo = safeReturnTo(url.searchParams.get('return_to'), config.rootHost);
    const session = await getCurrentSession(req);
    if (session) {
      redirect(
        res,
        session.platform_role === 'platform_admin' && !url.searchParams.has('return_to')
          ? '/_auth/admin'
          : returnTo,
      );
      return;
    }
    send(res, 200, renderLogin(returnTo));
    return;
  }
  if (req.method === 'POST' && path === '/_auth/login') {
    await handleLoginPost(req, res);
    return;
  }
  if (req.method === 'POST' && path === '/_auth/logout') {
    await handleLogout(req, res);
    return;
  }
  if (req.method === 'GET' && path === '/_auth/me') {
    const session = await getCurrentSession(req);
    if (!session) {
      sendJson(res, 401, { authenticated: false });
      return;
    }
    sendJson(res, 200, {
      authenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        platformRole: session.platform_role,
      },
    });
    return;
  }
  if (req.method === 'GET' && path === '/_auth/admin') {
    const session = await requireAdmin(req, res);
    if (session) send(res, 200, await renderAdmin(session));
    return;
  }
  if (req.method === 'POST' && path === '/_auth/admin/users') {
    await handleCreateUser(req, res);
    return;
  }
  if (req.method === 'POST' && path === '/_auth/admin/projects') {
    await handleCreateProject(req, res);
    return;
  }
  if (req.method === 'POST' && path === '/_auth/admin/projects/retry') {
    await handleRetryProject(req, res);
    return;
  }
  if (req.method === 'POST' && path === '/_auth/admin/memberships') {
    await handleMembership(req, res);
    return;
  }
  if (path === '/_auth' || path === '/_auth/') {
    redirect(res, '/_auth/admin');
    return;
  }

  send(res, 404, 'Not found');
}

async function start() {
  await runMigrations();
  await seedAdmin();
  await deleteExpiredSessions();
  setInterval(() => {
    deleteExpiredSessions().catch((error) => console.error('Session cleanup failed', error));
  }, 60 * 60 * 1000).unref();

  const server = http.createServer((req, res) => {
    route(req, res).catch((error) => {
      console.error(error);
      const status = error.statusCode ?? (error.code === '23505' ? 409 : 500);
      send(res, status, status === 409 ? 'Eintrag existiert bereits.' : 'Internal server error');
    });
  });

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`Bolt customer auth listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
