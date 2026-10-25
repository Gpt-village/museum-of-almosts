import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCloseout } from './closeout-gate.mjs';

const ids = Array.from({ length: 10 }, (_, i) => 'seed-' + (i + 1)).concat('distant-wing-signpost', 'a-manual-for-noise');
const queue = { schema: 1, agent: 'agent-04', tasks: ids.map(id => ({ id })) };
const record = (id, day, timestamp = '2026-10-24T21:42:23.122Z') => ({ id, day, timestamp, museumVersion: 'v3.3', source: 'deterministic relay' });
const eleven = ids.slice(0, 10).map(id => record(id, '2026-10-24')).concat(record('distant-wing-signpost', '2026-10-25', '2026-10-25T19:08:46.667Z'));
const twelve = eleven.concat(record('a-manual-for-noise', '2026-10-25', '2026-10-25T22:00:00.000Z'));
const state = completed => ({ schema: 1, agent: 'agent-04', completed, lastCompleted: completed.at(-1) ?? null });
const verified = completed => ({ completed, remaining: 12 - completed });

test('11/12 is pending and cannot be misrepresented as final completion', () => {
  const report = evaluateCloseout(queue, state(eleven), verified(11));
  assert.equal(report.status, 'pending');
  assert.equal(report.finalAttested, false);
  assert.equal(report.finalDayQuota, '1/2');
  assert.match(report.nextAction, /do not manually force/);
});

test('12/12 in correct order and final Eastern window is attested', () => {
  const report = evaluateCloseout(queue, state(twelve), verified(12));
  assert.equal(report.status, 'complete');
  assert.equal(report.finalAttested, true);
  assert.equal(report.finalDayQuota, '2/2');
  assert.equal(report.remaining, 0);
});

test('rejects changed approved final seed and missing queue entries', () => {
  assert.throws(() => evaluateCloseout({ ...queue, tasks: queue.tasks.slice(0, 11) }, state(eleven), verified(11)), /twelve/);
  const changed = { ...queue, tasks: queue.tasks.map(x => ({ ...x })) };
  changed.tasks[11].id = 'other';
  assert.throws(() => evaluateCloseout(changed, state(eleven), verified(11)), /final approved seed/);
});

test('rejects final completion outside October 25 Eastern or after 19:50', () => {
  const late = [...eleven, record('a-manual-for-noise', '2026-10-25', '2026-10-25T23:50:00.000Z')];
  assert.throws(() => evaluateCloseout(queue, state(late), verified(12)), /outside 12:00–19:50/);
  const wrongDay = [...eleven, record('a-manual-for-noise', '2026-10-26', '2026-10-26T16:00:00.000Z')];
  assert.throws(() => evaluateCloseout(queue, state(wrongDay), verified(12)), /October 25/);
});

test('rejects final quota, provenance, or version mismatch', () => {
  const oneFinalDay = [...eleven.slice(0, 10), record('distant-wing-signpost', '2026-10-24'), twelve[11]];
  assert.throws(() => evaluateCloseout(queue, state(oneFinalDay), verified(12)), /exactly 2\/2/);
  const wrongVersion = [...eleven, { ...twelve[11], museumVersion: 'v4.0' }];
  assert.throws(() => evaluateCloseout(queue, state(wrongVersion), verified(12)), /version provenance/);
  const wrongSource = [...eleven, { ...twelve[11], source: 'manual' }];
  assert.throws(() => evaluateCloseout(queue, state(wrongSource), verified(12)), /provenance changed/);
});

test('rejects unverified counts, reordered state, or mismatched lastCompleted', () => {
  assert.throws(() => evaluateCloseout(queue, state(eleven), verified(10)), /verifier completion disagreement/);
  const shuffled = [...eleven]; [shuffled[9], shuffled[10]] = [shuffled[10], shuffled[9]];
  assert.throws(() => evaluateCloseout(queue, state(shuffled), verified(11)), /approved prefix/);
  assert.throws(() => evaluateCloseout(queue, { ...state(eleven), lastCompleted: null }, verified(11)), /lastCompleted mismatch/);
});
