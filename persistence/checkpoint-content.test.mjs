import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyCheckpoint } from './verify-checkpoint.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function withFixture(change) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent04-checkpoint-'));
  try {
    fs.cpSync(path.join(ROOT, 'persistence'), path.join(root, 'persistence'), { recursive: true });
    const state = JSON.parse(fs.readFileSync(path.join(root, 'persistence/state.json'), 'utf8'));
    assert.ok(state.completed.length > 0, 'expected at least one completed draft');
    const draft = path.join(root, state.completed[0].draft);
    fs.writeFileSync(draft, change(fs.readFileSync(draft, 'utf8')));
    assert.throws(() => verifyCheckpoint(root), /draft differs|draft proposal body mismatch|draft title mismatch/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('canonical checkpoint verifies before drafting', () => {
  const result = verifyCheckpoint(ROOT);
  assert.ok(result.completed >= 1);
  assert.equal(result.completed + result.remaining, 12);
});

test('checkpoint verifier rejects a modified proposal body', () => {
  withFixture(text => text.replace('## Almost\n\n', '## Almost\n\nCORRUPTED: '));
});

test('checkpoint verifier rejects an appended unreviewed claim', () => {
  withFixture(text => text + '\nThis draft was automatically deployed.\n');
});
