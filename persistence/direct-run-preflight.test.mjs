import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent04-direct-preflight-'));
  const dir = path.join(root, 'persistence');
  fs.mkdirSync(path.join(dir, 'drafts'), { recursive: true });
  fs.copyFileSync(path.join(HERE, 'relay.mjs'), path.join(dir, 'relay.mjs'));
  fs.writeFileSync(path.join(root, 'README.md'), 'Current development version: v3.3\n');
  fs.writeFileSync(path.join(root, 'v33.js'), '// isolated provenance fixture\n');
  const task = { id: 'first', title: 'Fixture', room: 'Archive', seed: 'Seed',
    experiment: 'Experiment', review: 'Review' };
  fs.writeFileSync(path.join(dir, 'tasks.json'),
    JSON.stringify({ schema: 1, agent: 'agent-04', tasks: [task] }) + '\n');
  fs.writeFileSync(path.join(dir, 'state.json'),
    JSON.stringify({ schema: 1, agent: 'agent-04', completed: [] }) + '\n');
  fs.writeFileSync(path.join(dir, 'journal.jsonl'), '');
  const clock = path.join(root, 'clock.mjs');
  fs.writeFileSync(clock, "const RealDate = Date; globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-10-23T18:30:00.000Z'])); } };\n");
  return { root, dir, clock };
}

function run(f) {
  return spawnSync(process.execPath, ['--import', f.clock, path.join(f.dir, 'relay.mjs'), 'run'],
    { cwd: f.root, encoding: 'utf8', timeout: 10000 });
}

function assertNoChanges(f, beforeState, beforeJournal) {
  assert.equal(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'), beforeState);
  assert.equal(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8'), beforeJournal);
  assert.deepEqual(fs.readdirSync(path.join(f.dir, 'drafts')), []);
}

for (const [name, corrupt, error] of [
  ['state claims a different agent owner', f => {
    const stateFile = path.join(f.dir, 'state.json');
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    state.agent = 'agent-03';
    fs.writeFileSync(stateFile, JSON.stringify(state) + '\n');
  }, /Unexpected relay schema or owner/],
  ['queue exceeds the approved twelve-task bound', f => {
    const queueFile = path.join(f.dir, 'tasks.json');
    const queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    queue.tasks = Array.from({ length: 13 }, (_, i) => ({ ...queue.tasks[0], id: 'task-' + i }));
    fs.writeFileSync(queueFile, JSON.stringify(queue) + '\n');
  }, /Malformed relay queue\/state/],
  ['journal and state disagree', f => {
    fs.writeFileSync(path.join(f.dir, 'journal.jsonl'), JSON.stringify({ id: 'ghost' }) + '\n');
  }, /Checkpoint preflight failed: journal differs from state/],
  ['lastCompleted contradicts empty checkpoint', f => {
    const stateFile = path.join(f.dir, 'state.json');
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    state.lastCompleted = { id: 'ghost' };
    fs.writeFileSync(stateFile, JSON.stringify(state) + '\n');
  }, /Checkpoint preflight failed: lastCompleted differs from state/],
  ['journal agrees with state but completed ID skips approved queue', f => {
    const stateFile = path.join(f.dir, 'state.json');
    const entry = { id: 'ghost', day: '2026-10-22' };
    fs.writeFileSync(stateFile, JSON.stringify({ schema: 1, agent: 'agent-04', completed: [entry], lastCompleted: entry }) + '\n');
    fs.writeFileSync(path.join(f.dir, 'journal.jsonl'), JSON.stringify(entry) + '\n');
  }, /Checkpoint preflight failed: completed proposals not a queue prefix/]
]) {
  test('direct worker fails closed without writes when ' + name, () => {
    const f = fixture();
    try {
      corrupt(f);
      const beforeState = fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8');
      const beforeJournal = fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8');
      const result = run(f);
      assert.notEqual(result.status, 0, 'corrupted checkpoint must be rejected');
      assert.match(result.stderr, error);
      assertNoChanges(f, beforeState, beforeJournal);
    } finally {
      fs.rmSync(f.root, { recursive: true, force: true });
    }
  });
}

test('direct worker still advances a clean checkpoint', () => {
  const f = fixture();
  try {
    const result = run(f);
    assert.equal(result.status, 0, result.stderr);
    const state = JSON.parse(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'));
    const journal = fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    assert.equal(state.completed.length, 1);
    assert.equal(state.completed[0].id, 'first');
    assert.deepEqual(journal, state.completed);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});
