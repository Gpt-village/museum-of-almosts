import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function easternDay(date) {
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date).map(x => [x.type, x.value]));
  return { day: `${fields.year}-${fields.month}-${fields.day}`, minute: Number(fields.hour) * 60 + Number(fields.minute) };
}

export function verifyCheckpoint(root = ROOT) {
  const dir = path.join(root, 'persistence');
  const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const queue = read('tasks.json');
  const state = read('state.json');
  const journalRaw = fs.readFileSync(path.join(dir, 'journal.jsonl'), 'utf8');
  const journal = journalRaw.trim() ? journalRaw.trim().split('\n').map(line => JSON.parse(line)) : [];

  assert.equal(queue.schema, 1);
  assert.equal(state.schema, 1);
  assert.equal(queue.agent, 'agent-04');
  assert.equal(state.agent, 'agent-04');
  assert.ok(Array.isArray(queue.tasks) && queue.tasks.length <= 12, 'invalid queue');
  assert.ok(Array.isArray(state.completed) && state.completed.length <= 12, 'invalid completions');
  assert.deepEqual(journal, state.completed, 'journal differs from state');

  const ids = queue.tasks.map(x => x.id);
  assert.ok(ids.every(x => typeof x === 'string' && ID.test(x)), 'unsafe task ID');
  assert.equal(new Set(ids).size, ids.length, 'duplicate task ID');
  for (const task of queue.tasks) {
    for (const key of ['title', 'room', 'seed', 'experiment', 'review']) {
      assert.ok(typeof task[key] === 'string' && task[key].trim(), 'malformed queued proposal: ' + task.id);
    }
  }
  const completed = new Set();
  const days = new Map();
  let previous = -1;
  let previousTime = -Infinity;
  for (const entry of state.completed) {
    assert.ok(entry && typeof entry.id === 'string' && ID.test(entry.id), 'unsafe completion');
    assert.ok(!completed.has(entry.id), 'duplicate completion');
    completed.add(entry.id);
    const index = ids.indexOf(entry.id);
    assert.ok(index > previous, 'completion missing from queue or out of order');
    assert.equal(index, completed.size - 1, 'completion skipped queued proposal');
    previous = index;
    assert.equal(entry.source, 'deterministic relay');
    assert.match(entry.museumVersion, /^v\d+\.\d+$/);
    const when = new Date(entry.timestamp);
    assert.ok(Number.isFinite(when.getTime()), 'invalid timestamp');
    assert.equal(when.toISOString(), entry.timestamp, 'timestamp must be canonical ISO');
    assert.ok(when.getTime() > previousTime, 'completion timestamps not strictly increasing');
    previousTime = when.getTime();
    const clock = easternDay(when);
    assert.equal(clock.day, entry.day, 'wrong Eastern day');
    assert.ok(clock.day >= '2026-10-20' && clock.day <= '2026-10-25', 'outside challenge dates');
    assert.ok(clock.minute >= 720 && clock.minute < 1190, 'outside operating hours');
    days.set(entry.day, (days.get(entry.day) || 0) + 1);
    assert.ok(days.get(entry.day) <= 2, 'daily cap exceeded');
    const relative = `persistence/drafts/${entry.id}.md`;
    assert.equal(entry.draft, relative, 'unexpected draft path');
    const draft = fs.readFileSync(path.join(root, relative), 'utf8');
    for (const label of ['Proposal ID', 'Created', 'Museum README version at creation',
      'Version script', 'Version-script SHA-256 prefix']) {
      const prefix = `- **${label}:** `;
      const matches = draft.split('\n').filter(line => line.startsWith(prefix));
      assert.equal(matches.length, 1, 'duplicate or missing draft metadata: ' + label);
    }
    assert.ok(draft.includes(`- **Proposal ID:** ${entry.id}\n`), 'draft ID mismatch');
    assert.ok(draft.includes(`- **Created:** ${entry.timestamp}\n`), 'draft timestamp mismatch');
    assert.ok(draft.includes(`- **Museum README version at creation:** ${entry.museumVersion}\n`), 'draft version mismatch');
    assert.ok(draft.includes('**Status:** scripted relay draft'), 'draft status mismatch');
    const task = queue.tasks[index];
    assert.ok(draft.startsWith('# ' + task.title + '\n'), 'draft title mismatch');
    assert.ok(draft.includes('- **Location:** ' + task.room + '\n'), 'draft room mismatch');
    assert.ok(draft.includes('\n## Almost\n\n' + task.seed + '\n\n## Small possible next step\n\n' + task.experiment + '\n\n## Conditions before publication\n\n' + task.review + '\n'), 'draft proposal body mismatch');
    const versionScript = 'v' + entry.museumVersion.slice(1).replace('.', '').padStart(2, '0') + '.js';
    assert.ok(draft.includes(`- **Version script:** ${versionScript}\n`), 'draft version script mismatch');
    assert.match(draft, /- \*\*Version-script SHA-256 prefix:\*\* [a-f0-9]{12}\n/, 'missing or invalid script digest prefix');
    // Reconstruct the deterministic worker output exactly. Checking only metadata
    // would allow a corrupted or altered proposal body to pass verification.
    const digest = draft.match(/^- \*\*Version-script SHA-256 prefix:\*\* ([a-f0-9]{12})$/m)?.[1];
    const expected = [
      '# ' + task.title, '',
      '> **Status:** scripted relay draft for human/agent review — not a deployed Museum feature.',
      '> **Authoring:** seeded by agent-04; assembled by a deterministic Node.js worker, not a continuing ChatGPT conversation.',
      '', '- **Proposal ID:** ' + task.id, '- **Location:** ' + task.room,
      '- **Created:** ' + entry.timestamp,
      '- **Museum README version at creation:** ' + entry.museumVersion,
      '- **Version script:** ' + versionScript,
      '- **Version-script SHA-256 prefix:** ' + digest,
      '', '## Almost', '', task.seed, '', '## Small possible next step', '',
      task.experiment, '', '## Conditions before publication', '', task.review, '',
      'The relay does **not** edit the playable Museum, infer discarded evidence,',
      'call an LLM, publish this proposal, or assert successful verification.',
      'Promotion to the live world requires a separate explicit development and test step.', ''
    ].join('\n');
    assert.equal(draft, expected, 'draft differs from deterministic proposal rendering');
  }
  if (state.completed.length) assert.deepEqual(state.lastCompleted, state.completed.at(-1), 'lastCompleted mismatch');
  else assert.ok(state.lastCompleted == null, 'unexpected lastCompleted');

  const draftsDir = path.join(dir, 'drafts');
  const drafts = fs.existsSync(draftsDir) ? fs.readdirSync(draftsDir).filter(x => x.endsWith('.md')) : [];
  assert.equal(drafts.length, completed.size, 'draft count mismatch');
  for (const name of drafts) assert.ok(completed.has(name.slice(0, -3)), 'orphan draft');
  return { completed: completed.size, remaining: queue.tasks.length - completed.size, days: days.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('Checkpoint verified:', JSON.stringify(verifyCheckpoint(process.argv[2] || ROOT)));
}
