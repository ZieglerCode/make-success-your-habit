import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadSnapshot, normalizeProjectPath, saveSnapshot, validateSnapshot } from '../src/storage.mjs';

test('normalizes project paths and rejects traversal or ignored folders', () => {
  assert.equal(normalizeProjectPath('/home/project/src/app.ts'), 'src/app.ts');
  assert.throws(() => normalizeProjectPath('/home/project/../../etc/passwd'));
  assert.throws(() => normalizeProjectPath('/home/project/node_modules/pkg/index.js'));
  assert.throws(() => normalizeProjectPath('/home/project/.git/config'));
});

test('validates text and binary snapshots', () => {
  const snapshot = validateSnapshot({
    files: [
      { path: '/home/project/index.html', content: '<h1>Hallo</h1>', isBinary: false },
      { path: '/home/project/public/pixel.bin', content: Buffer.from([0, 1, 2]).toString('base64'), isBinary: true },
    ],
  });

  assert.equal(snapshot.files.length, 2);
  assert.equal(snapshot.files[1].content.byteLength, 3);
});

test('writes versioned snapshots and restores the latest tree', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bolt-storage-test-'));

  try {
    const first = await saveSnapshot(root, {
      files: [{ path: '/home/project/index.html', content: 'erste version', isBinary: false }],
    });
    assert.equal(first.changed, true);
    assert.equal(first.commitCount, 1);

    const unchanged = await saveSnapshot(root, {
      files: [{ path: '/home/project/index.html', content: 'erste version', isBinary: false }],
    });
    assert.equal(unchanged.changed, false);
    assert.equal(unchanged.commitCount, 1);

    const second = await saveSnapshot(root, {
      files: [{ path: '/home/project/src/main.js', content: 'console.log("neu")', isBinary: false }],
    });
    assert.equal(second.changed, true);
    assert.equal(second.commitCount, 2);
    await assert.rejects(readFile(join(root, 'repo', 'index.html')));

    const restored = await loadSnapshot(root);
    assert.deepEqual(restored.files, [
      {
        path: '/home/project/src/main.js',
        content: 'console.log("neu")',
        isBinary: false,
      },
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
