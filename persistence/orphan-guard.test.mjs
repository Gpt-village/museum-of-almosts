import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(HERE, 'relay.mjs');
const FIXED_TIME = '2026-10-22T22:00:00.000Z'; // 18:00 EDT

function fixture(orphan, clockTime = FIXED_TIME) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent04-orphan-'));
  const dir = path.join(root, 'persistence');
  fs.mkdirSync(path.join(dir, 'drafts'), { recursive: true });
  fs.copyFileSync(SOURCE, path.join(dir, 'relay.mjs'));
  fs.writeFileSync(path.join(root, 'README.md'), 'Current development version: v3.3\n');
  fs.writeFileSync(path.join(root, 'v33.js'), '/* fixture-only version script */\n');
  const task = { id: 'fixture-first', title: 'Fixture', room: 'Archive', seed: 'Seed', experiment: 'Experiment', review: 'Review' };
  fs.writeFileSync(path.join(dir, 'tasks.json'), JSON.stringify({ schema: 1, agent: 'agent-04', tasks: [task] }) + '\n');
  const initialState = '{"schema":1,"agent":"agent-04","completed":[]}\n';
  fs.writeFileSync(path.join(dir, 'state.json'), initialState);
  fs.writeFileSync(path.join(dir, 'journal.jsonl'), '');
  const draft = path.join(dir, 'drafts', task.id + '.md');
  if (orphan) fs.writeFileSync(draft, '# Interrupted old draft\n');
  const clock = path.join(root, 'clock.mjs');
  fs.writeFileSync(clock, `const RealDate = Date;\nglobalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['${clockTime}'])); } };\n`);
  return { root, dir, draft, clock, initialState };
}
function run(f) {
  return spawnSync(process.execPath, ['--import', f.clock, path.join(f.dir, 'relay.mjs'), 'run'], { cwd: f.root, encoding: 'utf8', timeout: 10000 });
}
function cleanup(f) { fs.rmSync(f.root, { recursive: true, force: true }); }

test('orphan draft fails closed without mutating state or journal', () => {
  const f = fixture(true);
  try {
    const result = run(f);
    assert.notEqual(result.status, 0, 'orphan must not be recorded as completed');
    assert.match(result.stderr, /Orphan draft|orphan draft/i);
    assert.equal(fs.readFileSync(f.draft, 'utf8'), '# Interrupted old draft\n');
    assert.equal(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'), f.initialState);
    assert.equal(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8'), '');
  } finally { cleanup(f); }
});

test('clean run writes exactly one draft and matching checkpoint', () => {
  const f = fixture(false);
  try {
    const result = run(f);
    assert.equal(result.status, 0, result.stderr);
    const state = JSON.parse(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'));
    const journal = fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    assert.equal(state.completed.length, 1);
    assert.deepEqual(journal, state.completed);
    assert.deepEqual(state.lastCompleted, state.completed[0]);
    assert.equal(state.completed[0].timestamp, FIXED_TIME);
    assert.equal(state.completed[0].id, 'fixture-first');
    assert.match(fs.readFileSync(f.draft, 'utf8'), /\*\*Proposal ID:\*\* fixture-first/);
  } finally { cleanup(f); }
});

test('19:50 Eastern shutdown buffer leaves checkpoint untouched', () => {
  const f = fixture(false, '2026-10-22T23:50:00.000Z');
  try {
    const result = run(f);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Outside GPT Village operating window/);
    assert.equal(fs.existsSync(f.draft), false);
    assert.equal(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'), f.initialState);
    assert.equal(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8'), '');
  } finally { cleanup(f); }
});

test('after October 25 expiry, no checkpoint is written', () => {
  const f = fixture(false, '2026-10-26T16:00:00.000Z');
  try {
    const result = run(f);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Outside GPT Village operating window/);
    assert.equal(fs.existsSync(f.draft), false);
    assert.equal(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'), f.initialState);
    assert.equal(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8'), '');
  } finally { cleanup(f); }
});
