import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXED_NOW = '2026-10-23T18:30:00.000Z'; // 14:30 EDT

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent04-completed-preflight-'));
  const dir = path.join(root, 'persistence');
  fs.mkdirSync(path.join(dir, 'drafts'), { recursive: true });
  fs.copyFileSync(path.join(HERE, 'relay.mjs'), path.join(dir, 'relay.mjs'));
  fs.writeFileSync(path.join(root, 'README.md'), 'Current development version: v3.3\n');
  fs.writeFileSync(path.join(root, 'v33.js'), '// isolated version script\n');
  const tasks = ['first', 'second'].map(id => ({ id, title: id, room: 'Archive', seed: 'Seed', experiment: 'Experiment', review: 'Review' }));
  fs.writeFileSync(path.join(dir, 'tasks.json'), JSON.stringify({ schema: 1, agent: 'agent-04', tasks }) + '\n');
  const clock = path.join(root, 'clock.mjs');
  fs.writeFileSync(clock, "const RealDate = Date; globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['" + FIXED_NOW + "'])); } };\n");
  return { root, dir, clock };
}

function checkpoint(f, { timestamp = '2026-10-22T18:00:00.000Z', day = '2026-10-22', draftExists = true } = {}) {
  const entry = { id: 'first', day, timestamp, draft: 'persistence/drafts/first.md', source: 'deterministic relay', museumVersion: 'v3.3' };
  fs.writeFileSync(path.join(f.dir, 'state.json'), JSON.stringify({ schema: 1, agent: 'agent-04', completed: [entry], lastCompleted: entry }) + '\n');
  fs.writeFileSync(path.join(f.dir, 'journal.jsonl'), JSON.stringify(entry) + '\n');
  if (draftExists) fs.writeFileSync(path.join(f.dir, 'drafts/first.md'), '# existing checkpoint draft\n');
}

function run(f) {
  return spawnSync(process.execPath, ['--import', f.clock, path.join(f.dir, 'relay.mjs'), 'run'],
    { cwd: f.root, encoding: 'utf8', timeout: 10000 });
}

for (const [name, options, expected] of [
  ['completed draft is missing', { draftExists: false }, /Checkpoint preflight failed: completed draft missing/],
  ['completion timestamp lies in the future', { timestamp: '2026-10-24T18:00:00.000Z', day: '2026-10-24' }, /Checkpoint preflight failed: invalid completion timestamp/],
  ['completion Eastern day disagrees with timestamp', { day: '2026-10-21' }, /Checkpoint preflight failed: invalid completion timestamp/],
  ['completion was outside operating hours', { timestamp: '2026-10-22T08:00:00.000Z' }, /Checkpoint preflight failed: invalid completion timestamp/]
]) {
  test('direct worker refuses to advance when ' + name, () => {
    const f = fixture();
    try {
      checkpoint(f, options);
      const beforeState = fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8');
      const beforeJournal = fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8');
      const beforeDraft = fs.existsSync(path.join(f.dir, 'drafts/first.md'))
        ? fs.readFileSync(path.join(f.dir, 'drafts/first.md'), 'utf8') : null;
      const result = run(f);
      assert.notEqual(result.status, 0, 'inconsistent checkpoint must fail');
      assert.match(result.stderr, expected);
      assert.equal(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'), beforeState);
      assert.equal(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8'), beforeJournal);
      assert.equal(fs.existsSync(path.join(f.dir, 'drafts/second.md')), false);
      assert.equal(fs.existsSync(path.join(f.dir, 'drafts/first.md'))
        ? fs.readFileSync(path.join(f.dir, 'drafts/first.md'), 'utf8') : null, beforeDraft);
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  });
}

test('direct worker advances valid checkpoint without modifying existing draft', () => {
  const f = fixture();
  try {
    checkpoint(f);
    const beforeDraft = fs.readFileSync(path.join(f.dir, 'drafts/first.md'), 'utf8');
    const result = run(f);
    assert.equal(result.status, 0, result.stderr);
    const state = JSON.parse(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'));
    assert.deepEqual(state.completed.map(entry => entry.id), ['first', 'second']);
    assert.equal(state.completed[1].timestamp, FIXED_NOW);
    assert.equal(fs.readFileSync(path.join(f.dir, 'drafts/first.md'), 'utf8'), beforeDraft);
    assert.equal(fs.existsSync(path.join(f.dir, 'drafts/second.md')), true);
    assert.deepEqual(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8').trim().split('\n').map(JSON.parse), state.completed);
  } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
});
