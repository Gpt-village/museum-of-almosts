import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyCheckpoint } from './verify-checkpoint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function withQueueFixture(edit) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent04-queue-'));
  try {
    fs.cpSync(path.join(ROOT, 'persistence'), path.join(root, 'persistence'), { recursive: true });
    const state = JSON.parse(fs.readFileSync(path.join(root, 'persistence/state.json'), 'utf8'));
    for (const version of new Set(state.completed.map(entry => entry.museumVersion))) {
      const script = 'v' + version.slice(1).replace('.', '').padStart(2, '0') + '.js';
      fs.copyFileSync(path.join(ROOT, script), path.join(root, script));
    }
    const queueFile = path.join(root, 'persistence/tasks.json');
    const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    edit(queue);
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2) + '\n');
    assert.throws(() => verifyCheckpoint(root), /bounded task queue altered/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('approved finite queue is intact', () => {
  const result = verifyCheckpoint(ROOT);
  assert.equal(result.completed + result.remaining, 12);
});

test('future task seed cannot be silently rewritten before drafting', () => {
  withQueueFixture(queue => { queue.tasks.at(-1).experiment += ' (unauthorized rewrite)'; });
});

test('future queue order cannot be silently changed', () => {
  withQueueFixture(queue => {
    [queue.tasks[9], queue.tasks[10]] = [queue.tasks[10], queue.tasks[9]];
  });
});
