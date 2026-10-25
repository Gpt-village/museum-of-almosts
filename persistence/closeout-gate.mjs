/** Read-only terminal attestation for Agent-04's finite Goal 2 side quest.
 * The CLI runs the full canonical checkpoint verifier before reporting.
 * Pending work must NEVER be presented as a successful final closeout.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FINAL_ID = 'a-manual-for-noise';
const FINAL_DAY = '2026-10-25';
const EXPECTED_TOTAL = 12;

function easternClock(iso) {
  const instant = new Date(iso);
  assert.ok(Number.isFinite(instant.getTime()) && instant.toISOString() === iso, 'invalid final timestamp');
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(instant).map(p => [p.type, p.value]));
  return { day: [fields.year, fields.month, fields.day].join('-'), minute: Number(fields.hour) * 60 + Number(fields.minute) };
}

export function evaluateCloseout(queue, state, verified) {
  assert.equal(queue?.schema, 1, 'invalid queue schema');
  assert.equal(state?.schema, 1, 'invalid state schema');
  assert.equal(queue.agent, 'agent-04', 'wrong queue owner');
  assert.equal(state.agent, 'agent-04', 'wrong checkpoint owner');
  assert.ok(Array.isArray(queue.tasks) && queue.tasks.length === EXPECTED_TOTAL, 'expected exactly twelve approved seeds');
  assert.equal(queue.tasks.at(-1)?.id, FINAL_ID, 'final approved seed changed');
  assert.ok(Array.isArray(state.completed) && state.completed.length <= EXPECTED_TOTAL, 'invalid completed entries');
  assert.equal(verified?.completed, state.completed.length, 'full verifier completion disagreement');
  assert.equal(verified?.remaining, EXPECTED_TOTAL - state.completed.length, 'full verifier remaining disagreement');
  state.completed.forEach((entry, i) => assert.equal(entry?.id, queue.tasks[i].id, 'completion not an approved prefix'));
  assert.deepEqual(state.lastCompleted ?? null, state.completed.at(-1) ?? null, 'lastCompleted mismatch');

  const completed = state.completed.length;
  const usedFinalDay = state.completed.filter(entry => entry.day === FINAL_DAY).length;
  assert.ok(usedFinalDay <= 2, 'final-day quota exceeded');
  if (completed === EXPECTED_TOTAL) {
    const final = state.completed.at(-1);
    const clock = easternClock(final.timestamp);
    assert.equal(final.id, FINAL_ID, 'wrong final proposal');
    assert.equal(final.day, FINAL_DAY, 'final proposal must publish on October 25');
    assert.equal(clock.day, FINAL_DAY, 'final timestamp is not on October 25 Eastern');
    assert.ok(clock.minute >= 720 && clock.minute < 1190, 'final publication outside 12:00–19:50 Eastern');
    assert.equal(usedFinalDay, 2, 'final-day quota should be exactly 2/2');
    assert.equal(final.museumVersion, 'v3.3', 'final draft version provenance changed');
    assert.equal(final.source, 'deterministic relay', 'final draft provenance changed');
  }
  return {
    status: completed === EXPECTED_TOTAL ? 'complete' : 'pending',
    finalAttested: completed === EXPECTED_TOTAL,
    completed, total: EXPECTED_TOTAL, remaining: EXPECTED_TOTAL - completed,
    finalSeed: FINAL_ID, finalDayQuota: usedFinalDay + '/2',
    nextAction: completed === EXPECTED_TOTAL
      ? 'Preserve final state, journal, draft, CI evidence and human-readable handoff; no further scripted publication.'
      : 'Await an actual scheduled Curator’s Relay publication for ' + queue.tasks[completed].id + '; do not manually force a draft or claim final completion.',
    limitations: 'Read-only attestation of deterministic review drafts, not a playable Museum release or a continuing model session.'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  assert.ok(args.every(arg => ['--json', '--require-complete'].includes(arg)), 'Usage: node persistence/closeout-gate.mjs [--json] [--require-complete]');
  const { verifyCheckpoint } = await import('./verify-checkpoint.mjs');
  const verified = verifyCheckpoint(ROOT); // Fail closed on corrupt queue, draft, journal or provenance.
  const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'persistence', name), 'utf8'));
  const report = evaluateCloseout(read('tasks.json'), read('state.json'), verified);
  console.log(JSON.stringify(report, null, 2));
  if (args.includes('--require-complete') && !report.finalAttested) {
    console.error('Final closeout is NOT attested: approved proposal(s) remain.');
    process.exitCode = 2;
  }
}
