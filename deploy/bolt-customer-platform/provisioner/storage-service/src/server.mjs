import http from 'node:http';
import { getRepositoryStatus, loadSnapshot, saveSnapshot } from './storage.mjs';

const config = {
  port: Number(process.env.PORT || 4100),
  projectHost: process.env.PROJECT_HOST || '',
  projectSlug: process.env.PROJECT_SLUG || '',
  repositoryRoot: process.env.REPOSITORY_ROOT || '/repository',
  maxRequestBytes: 30 * 1024 * 1024,
};

let snapshotQueue = Promise.resolve();

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(data);
}

function normalizedHost(req) {
  return String(req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, '');
}

function isAuthorized(req) {
  return normalizedHost(req) === config.projectHost.toLowerCase() && Boolean(req.headers['x-auth-user-id']);
}

function isSameOriginMutation(req) {
  const fetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();

  if (fetchSite === 'cross-site') {
    return false;
  }

  const origin = req.headers.origin;

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).hostname.toLowerCase() === config.projectHost.toLowerCase();
  } catch {
    return false;
  }
}

async function readJson(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > config.maxRequestBytes) {
      const error = new Error('Request body too large');
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Invalid JSON');
    error.statusCode = 400;
    throw error;
  }
}

async function route(req, res) {
  const url = new URL(req.url || '/', 'http://storage.internal');

  if (url.pathname === '/health') {
    return json(res, 200, { ok: true, project: config.projectSlug });
  }

  if (!isAuthorized(req)) {
    return json(res, 403, { error: 'Forbidden' });
  }

  if (req.method === 'GET' && url.pathname === '/__project_storage/status') {
    return json(res, 200, {
      project: config.projectSlug,
      ...(await getRepositoryStatus(config.repositoryRoot)),
    });
  }

  if (req.method === 'GET' && url.pathname === '/__project_storage/snapshot') {
    return json(res, 200, await loadSnapshot(config.repositoryRoot));
  }

  if (req.method === 'POST' && url.pathname === '/__project_storage/snapshot') {
    if (!isSameOriginMutation(req)) {
      return json(res, 403, { error: 'Cross-site request rejected' });
    }

    const payload = await readJson(req);
    const actorEmail = String(req.headers['x-auth-user-email'] || 'unknown');
    const queuedSave = snapshotQueue.then(() => saveSnapshot(config.repositoryRoot, payload, actorEmail));
    snapshotQueue = queuedSave.catch(() => {});

    return json(res, 200, await queuedSave);
  }

  return json(res, 404, { error: 'Not found' });
}

if (!config.projectHost || !config.projectSlug) {
  throw new Error('PROJECT_HOST and PROJECT_SLUG are required');
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    console.error(error);
    json(res, error.statusCode || 500, { error: error.statusCode ? error.message : 'Internal server error' });
  });
});

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Bolt storage for ${config.projectSlug} listening on port ${config.port}`);
});
