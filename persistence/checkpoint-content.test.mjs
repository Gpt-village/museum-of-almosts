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
    // Preserve the archived version scripts in the isolated fixture.
    for (const version of new Set(state.completed.map(entry => entry.museumVersion))) {
      const script = 'v' + version.slice(1).replace('.', '').padStart(2, '0') + '.js';
      fs.copyFileSync(path.join(ROOT, script), path.join(root, script));
    }
    const draft = path.join(root, state.completed[0].draft);
    fs.writeFileSync(draft, change(fs.readFileSync(draft, 'utf8'), root));
    assert.throws(() => verifyCheckpoint(root), /draft differs|draft proposal body mismatch|draft title mismatch|draft version-script digest mismatch/);
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

test('checkpoint verifier rejects a forged version-script digest', () => {
  withFixture(text => text.split('\n').map(line =>
    line.startsWith('- **Version-script SHA-256 prefix:** ')
      ? '- **Version-script SHA-256 prefix:** 000000000000'
      : line
  ).join('\n'));
});

test('checkpoint verifier rejects a changed archived version script', () => {
  withFixture((text, root) => {
    fs.appendFileSync(path.join(root, 'v33.js'), '\n// altered after draft creation\n');
    return text;
  });
});
