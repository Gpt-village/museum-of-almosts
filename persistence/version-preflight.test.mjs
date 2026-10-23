import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.join(HERE, 'relay.mjs');

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent04-version-preflight-'));
  const dir = path.join(root, 'persistence');
  fs.mkdirSync(path.join(dir, 'drafts'), { recursive: true });
  fs.copyFileSync(SOURCE, path.join(dir, 'relay.mjs'));
  fs.writeFileSync(path.join(root, 'README.md'), 'Current development version: v3.3\n');
  fs.writeFileSync(path.join(root, 'v33.js'), '// isolated version fixture\n');
  const task = { id: 'preflight-fixture', title: 'Fixture', room: 'Archive',
    seed: 'Seed', experiment: 'Experiment', review: 'Review' };
  fs.writeFileSync(path.join(dir, 'tasks.json'),
    JSON.stringify({ schema: 1, agent: 'agent-04', tasks: [task] }) + '\n');
  const initialState = '{"schema":1,"agent":"agent-04","completed":[]}\n';
  fs.writeFileSync(path.join(dir, 'state.json'), initialState);
  fs.writeFileSync(path.join(dir, 'journal.jsonl'), '');
  const clock = path.join(root, 'clock.mjs');
  fs.writeFileSync(clock,
    "const RealDate = Date; globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-10-23T18:30:00.000Z'])); } };\n");
  return { root, dir, clock, initialState };
}

function run(f) {
  return spawnSync(process.execPath, ['--import', f.clock, path.join(f.dir, 'relay.mjs'), 'run'],
    { cwd: f.root, encoding: 'utf8', timeout: 10000 });
}

function assertUntouched(f) {
  assert.equal(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'), f.initialState);
  assert.equal(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8'), '');
  assert.deepEqual(fs.readdirSync(path.join(f.dir, 'drafts')), []);
}

for (const [name, alter, expected] of [
  ['missing README version', f => fs.writeFileSync(path.join(f.root, 'README.md'),
    '# Museum without a declared version\n'), /version preflight failed: README version missing/],
  ['missing referenced version script', f => fs.rmSync(path.join(f.root, 'v33.js')),
    /version preflight failed: version script missing: v33\.js/],
  ['version script path is a directory', f => {
    fs.rmSync(path.join(f.root, 'v33.js'));
    fs.mkdirSync(path.join(f.root, 'v33.js'));
  }, /version preflight failed: version script missing: v33\.js/]
]) {
  test('fail closed before any checkpoint write: ' + name, () => {
    const f = fixture();
    try {
      alter(f);
      const result = run(f);
      assert.notEqual(result.status, 0, 'missing provenance must fail, not create a draft');
      assert.match(result.stderr, expected);
      assertUntouched(f);
    } finally {
      fs.rmSync(f.root, { recursive: true, force: true });
    }
  });
}

test('valid version provenance still permits one bounded draft', () => {
  const f = fixture();
  try {
    const result = run(f);
    assert.equal(result.status, 0, result.stderr);
    const state = JSON.parse(fs.readFileSync(path.join(f.dir, 'state.json'), 'utf8'));
    assert.equal(state.completed.length, 1);
    assert.equal(state.completed[0].museumVersion, 'v3.3');
    const draft = fs.readFileSync(path.join(f.dir, 'drafts/preflight-fixture.md'), 'utf8');
    assert.match(draft, /- \*\*Version script:\*\* v33\.js/);
    assert.match(draft, /- \*\*Version-script SHA-256 prefix:\*\* [a-f0-9]{12}/);
    assert.deepEqual(fs.readFileSync(path.join(f.dir, 'journal.jsonl'), 'utf8').trim().split('\n').map(JSON.parse),
      state.completed);
  } finally {
    fs.rmSync(f.root, { recursive: true, force: true });
  }
});
