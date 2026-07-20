import type { WebContainer } from '@webcontainer/api';
import type { FileMap } from '~/lib/stores/files';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('ProjectSnapshots');
const SNAPSHOT_ENDPOINT = '/__project_storage/snapshot';
const SAVE_DELAY_MS = 5000;
const PROJECT_PREFIX = '/home/project/';

interface SnapshotFile {
  path: string;
  content: string;
  isBinary: boolean;
}

interface SnapshotResponse {
  files: SnapshotFile[];
  commit: string | null;
  committedAt: string | null;
  commitCount: number;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let latestFiles: FileMap | undefined;
let snapshotServiceAvailable: boolean | undefined;
let saveQueue = Promise.resolve();

function relativeProjectPath(filePath: string) {
  const normalizedPath = filePath.replaceAll('\\', '/');

  if (!normalizedPath.startsWith(PROJECT_PREFIX)) {
    return undefined;
  }

  const relativePath = normalizedPath.slice(PROJECT_PREFIX.length);
  const segments = relativePath.split('/');

  if (
    !relativePath ||
    segments.includes('..') ||
    segments.includes('.') ||
    segments.includes('.git') ||
    segments.includes('node_modules')
  ) {
    return undefined;
  }

  return relativePath;
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function serializeFiles(files: FileMap): SnapshotFile[] {
  const snapshotFiles: SnapshotFile[] = [];

  for (const [filePath, dirent] of Object.entries(files)) {
    if (dirent?.type !== 'file' || !relativeProjectPath(filePath)) {
      continue;
    }

    snapshotFiles.push({
      path: filePath,
      content: dirent.content,
      isBinary: dirent.isBinary,
    });
  }

  return snapshotFiles.sort((left, right) => left.path.localeCompare(right.path));
}

async function saveLatestSnapshot() {
  if (!latestFiles || snapshotServiceAvailable === false) {
    return;
  }

  const body = JSON.stringify({ files: serializeFiles(latestFiles) });
  const response = await fetch(SNAPSHOT_ENDPOINT, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!response.ok) {
    throw new Error(`Snapshot save failed with status ${response.status}`);
  }

  snapshotServiceAvailable = true;
  const result = (await response.json()) as { commit?: string; changed?: boolean };
  logger.info(result.changed ? `Project snapshot saved at ${result.commit}` : 'Project snapshot already current');
}

export function scheduleProjectSnapshot(files: FileMap) {
  if (snapshotServiceAvailable === false) {
    return;
  }

  latestFiles = files;

  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    saveTimer = undefined;
    saveQueue = saveQueue
      .then(saveLatestSnapshot)
      .catch((error) => logger.error('Failed to save project snapshot', error));
  }, SAVE_DELAY_MS);
}

export async function restoreProjectSnapshot(webcontainer: WebContainer) {
  try {
    const response = await fetch(SNAPSHOT_ENDPOINT, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const contentType = response.headers.get('content-type') || '';

    if (response.status === 404 || !contentType.includes('application/json')) {
      snapshotServiceAvailable = false;
      return false;
    }

    if (!response.ok) {
      throw new Error(`Snapshot restore failed with status ${response.status}`);
    }

    const snapshot = (await response.json()) as SnapshotResponse;
    snapshotServiceAvailable = true;

    for (const file of snapshot.files || []) {
      const relativePath = relativeProjectPath(file.path);

      if (!relativePath) {
        logger.warn(`Ignoring unsafe snapshot path: ${file.path}`);
        continue;
      }

      const lastSlash = relativePath.lastIndexOf('/');

      if (lastSlash > 0) {
        await webcontainer.fs.mkdir(relativePath.slice(0, lastSlash), { recursive: true });
      }

      await webcontainer.fs.writeFile(relativePath, file.isBinary ? decodeBase64(file.content) : file.content);
    }

    if (snapshot.files?.length) {
      logger.info(`Restored ${snapshot.files.length} files from commit ${snapshot.commit}`);
    }

    return true;
  } catch (error) {
    logger.error('Failed to restore project snapshot', error);
    return false;
  }
}
