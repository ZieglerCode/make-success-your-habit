import { randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join, posix, relative, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const PROJECT_PREFIX = '/home/project/';
const MAX_FILES = 5000;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_SNAPSHOT_BYTES = 25 * 1024 * 1024;

function isIgnoredPath(filePath) {
  const segments = filePath.split('/');
  return segments.includes('.git') || segments.includes('node_modules');
}

export function normalizeProjectPath(filePath) {
  if (typeof filePath !== 'string') {
    throw new Error('File path must be a string');
  }

  const unixPath = filePath.replaceAll('\\', '/');

  if (!unixPath.startsWith(PROJECT_PREFIX)) {
    throw new Error(`File path must start with ${PROJECT_PREFIX}`);
  }

  const sourceRelativePath = unixPath.slice(PROJECT_PREFIX.length);
  const normalizedPath = posix.normalize(sourceRelativePath);

  if (
    !normalizedPath ||
    normalizedPath === '.' ||
    normalizedPath.startsWith('../') ||
    posix.isAbsolute(normalizedPath) ||
    isIgnoredPath(normalizedPath)
  ) {
    throw new Error('Unsafe or ignored project path');
  }

  return normalizedPath;
}

function decodeFile(file) {
  if (typeof file.content !== 'string') {
    throw new Error('File content must be a string');
  }

  const content = file.isBinary ? Buffer.from(file.content, 'base64') : Buffer.from(file.content, 'utf8');

  if (content.byteLength > MAX_FILE_BYTES) {
    throw new Error(`File exceeds ${MAX_FILE_BYTES} bytes`);
  }

  return content;
}

export function validateSnapshot(payload) {
  if (!payload || !Array.isArray(payload.files)) {
    throw new Error('Snapshot must contain a files array');
  }

  if (payload.files.length > MAX_FILES) {
    throw new Error(`Snapshot exceeds ${MAX_FILES} files`);
  }

  const files = [];
  const paths = new Set();
  let totalBytes = 0;

  for (const file of payload.files) {
    const filePath = normalizeProjectPath(file?.path);

    if (paths.has(filePath)) {
      throw new Error(`Duplicate file path: ${filePath}`);
    }

    const content = decodeFile(file);
    totalBytes += content.byteLength;

    if (totalBytes > MAX_SNAPSHOT_BYTES) {
      throw new Error(`Snapshot exceeds ${MAX_SNAPSHOT_BYTES} bytes`);
    }

    paths.add(filePath);
    files.push({ path: filePath, content });
  }

  return { files, totalBytes };
}

async function git(repositoryPath, args, options = {}) {
  return execFileAsync('git', ['-C', repositoryPath, ...args], {
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
    ...options,
  });
}

export async function ensureRepository(repositoryPath) {
  await mkdir(repositoryPath, { recursive: true });

  try {
    await stat(join(repositoryPath, '.git'));
  } catch {
    await git(repositoryPath, ['init', '-b', 'main']);
    await git(repositoryPath, ['config', 'user.name', 'Bolt Snapshot']);
    await git(repositoryPath, ['config', 'user.email', 'snapshots@build.mathishoffmann.com']);
  }
}

async function clearWorktree(repositoryPath) {
  const entries = await readdir(repositoryPath, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.name !== '.git')
      .map((entry) => rm(join(repositoryPath, entry.name), { recursive: true, force: true })),
  );
}

async function stageSnapshot(stagingPath, files) {
  for (const file of files) {
    const targetPath = join(stagingPath, ...file.path.split('/'));
    const safeRelativePath = relative(stagingPath, resolve(targetPath));

    if (!safeRelativePath || safeRelativePath.startsWith(`..${sep}`) || safeRelativePath === '..') {
      throw new Error('Snapshot path escaped staging directory');
    }

    await mkdir(resolve(targetPath, '..'), { recursive: true });
    await writeFile(targetPath, file.content, { mode: 0o600 });
  }
}

async function hasHead(repositoryPath) {
  try {
    await git(repositoryPath, ['rev-parse', '--verify', 'HEAD']);
    return true;
  } catch {
    return false;
  }
}

async function restoreCleanHead(repositoryPath) {
  if (await hasHead(repositoryPath)) {
    await git(repositoryPath, ['reset', '--hard', 'HEAD']);
    await git(repositoryPath, ['clean', '-fdx']);
  } else {
    await clearWorktree(repositoryPath);
  }
}

export async function saveSnapshot(repositoryRoot, payload, actorEmail = 'unknown') {
  const repositoryPath = join(repositoryRoot, 'repo');
  const stagingPath = join(repositoryRoot, `.incoming-${randomUUID()}`);
  const snapshot = validateSnapshot(payload);

  await mkdir(repositoryRoot, { recursive: true });
  await ensureRepository(repositoryPath);

  try {
    await mkdir(stagingPath, { recursive: true });
    await stageSnapshot(stagingPath, snapshot.files);
    await clearWorktree(repositoryPath);

    for (const entry of await readdir(stagingPath)) {
      await rename(join(stagingPath, entry), join(repositoryPath, entry));
    }

    await git(repositoryPath, ['add', '--all']);

    try {
      await git(repositoryPath, ['diff', '--cached', '--quiet']);

      const currentCommit = await getRepositoryStatus(repositoryRoot);
      return { ...currentCommit, changed: false, fileCount: snapshot.files.length, totalBytes: snapshot.totalBytes };
    } catch {
      const safeActor = String(actorEmail).replaceAll(/[\r\n<>]/g, '').slice(0, 120) || 'unknown';
      const message = `Automatic snapshot by ${safeActor}`;
      await git(repositoryPath, ['commit', '-m', message]);

      const currentCommit = await getRepositoryStatus(repositoryRoot);
      return { ...currentCommit, changed: true, fileCount: snapshot.files.length, totalBytes: snapshot.totalBytes };
    }
  } catch (error) {
    await restoreCleanHead(repositoryPath);
    throw error;
  } finally {
    await rm(stagingPath, { recursive: true, force: true });
  }
}

function isBinary(buffer) {
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    return buffer.includes(0);
  } catch {
    return true;
  }
}

async function listFiles(rootPath, currentPath = rootPath) {
  const result = [];

  for (const entry of await readdir(currentPath, { withFileTypes: true })) {
    if (entry.name === '.git') {
      continue;
    }

    const absolutePath = join(currentPath, entry.name);

    if (entry.isDirectory()) {
      result.push(...(await listFiles(rootPath, absolutePath)));
    } else if (entry.isFile()) {
      result.push(absolutePath);
    }
  }

  return result;
}

export async function loadSnapshot(repositoryRoot) {
  const repositoryPath = join(repositoryRoot, 'repo');
  await ensureRepository(repositoryPath);

  const files = [];
  let totalBytes = 0;

  for (const absolutePath of await listFiles(repositoryPath)) {
    const content = await readFile(absolutePath);
    totalBytes += content.byteLength;

    if (totalBytes > MAX_SNAPSHOT_BYTES) {
      throw new Error('Stored snapshot exceeds response limit');
    }

    const binary = isBinary(content);
    const filePath = relative(repositoryPath, absolutePath).split(sep).join('/');
    files.push({
      path: `${PROJECT_PREFIX}${filePath}`,
      content: binary ? content.toString('base64') : content.toString('utf8'),
      isBinary: binary,
    });
  }

  return { files, totalBytes, ...(await getRepositoryStatus(repositoryRoot)) };
}

export async function getRepositoryStatus(repositoryRoot) {
  const repositoryPath = join(repositoryRoot, 'repo');
  await ensureRepository(repositoryPath);

  try {
    const [{ stdout: commit }, { stdout: committedAt }, { stdout: commitCount }] = await Promise.all([
      git(repositoryPath, ['rev-parse', 'HEAD']),
      git(repositoryPath, ['log', '-1', '--format=%cI']),
      git(repositoryPath, ['rev-list', '--count', 'HEAD']),
    ]);

    return {
      initialized: true,
      commit: commit.trim(),
      committedAt: committedAt.trim(),
      commitCount: Number(commitCount.trim()),
    };
  } catch {
    return {
      initialized: true,
      commit: null,
      committedAt: null,
      commitCount: 0,
    };
  }
}
