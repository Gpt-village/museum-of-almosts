import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveResumeCard, easternClock, renderResumeCard } from './resume-card.mjs';

const task = (id) => ({ id, title: `Proposal ${id}` });
const queue = { schema: 1, agent: 'agent-04', tasks: [task('first'), task('second'), task('third')] };
const entry = (id, day) => ({ id, day });
const state = (completed) => ({ schema: 1, agent: 'agent-04', completed, lastCompleted: completed.at(-1) ?? null });

test('reads Eastern time across UTC day boundaries', () => {
  assert.deepEqual(easternClock(new Date('2026-10-25T17:03:00Z')), { day: '2026-10-25', minute: 783 });
  assert.deepEqual(easternClock(new Date('2026-10-26T00:03:00Z')), { day: '2026-10-25', minute: 1203 });
});

test('reports actual next approved seed without advancing the queue', () => {
  const s = state([entry('first', '2026-10-24')]);
  const before = JSON.stringify(s);
  const card = deriveResumeCard(queue, s, new Date('2026-10-25T17:03:00Z'));
  assert.equal(card.status, 'eligible-for-scheduled-relay');
  assert.equal(card.canStart, true);
  assert.deepEqual(card.checkpoint, { completed: 1, total: 3, remaining: 2, lastCompleted: 'first' });
  assert.equal(card.next.id, 'second');
  assert.match(card.nextAction, /Do not force a duplicate/);
  assert.equal(JSON.stringify(s), before, 'read-only status must not mutate state');
  assert.match(renderResumeCard(card), /1\/3/);
});

test('does not recommend work after two completions on the same Eastern day', () => {
  const card = deriveResumeCard(queue, state([entry('first', '2026-10-25'), entry('second', '2026-10-25')]), new Date('2026-10-25T18:03:00Z'));
  assert.equal(card.status, 'daily-quota-exhausted');
  assert.equal(card.canStart, false);
  assert.equal(card.next.id, 'third');
  assert.match(card.nextAction, /Do not force another draft/);
});

test('refuses to imply a permitted start after 19:50 Eastern or after the challenge', () => {
  const s = state([]);
  const late = deriveResumeCard(queue, s, new Date('2026-10-25T23:50:00Z'));
  assert.equal(late.status, 'outside-operating-window');
  assert.equal(late.canStart, false);
  const expired = deriveResumeCard(queue, s, new Date('2026-10-26T16:03:00Z'));
  assert.equal(expired.status, 'outside-challenge-dates');
  assert.match(expired.nextAction, /separately authorized plan/);
});

test('recognizes exhausted finite queue and never offers another draft', () => {
  const card = deriveResumeCard(queue, state([entry('first', '2026-10-24'), entry('second', '2026-10-24'), entry('third', '2026-10-25')]), new Date('2026-10-25T17:03:00Z'));
  assert.equal(card.status, 'queue-complete');
  assert.equal(card.next, null);
  assert.equal(card.canStart, false);
});

test('fails closed on mismatched checkpoint or unsafe queue order', () => {
  assert.throws(() => deriveResumeCard(queue, state([entry('third', '2026-10-25')]), new Date('2026-10-25T17:03:00Z')), /queue prefix/);
  const s = state([entry('first', '2026-10-25')]);
  s.lastCompleted = null;
  assert.throws(() => deriveResumeCard(queue, s, new Date('2026-10-25T17:03:00Z')), /lastCompleted mismatch/);
});

test('final-day 19:50 cutoff never promises a nonexistent next start window', () => {
  const pending = deriveResumeCard(queue, state([entry('first', '2026-10-24')]), new Date('2026-10-25T23:50:00Z'));
  assert.equal(pending.status, 'outside-operating-window');
  assert.equal(pending.canStart, false);
  assert.equal(pending.next.id, 'second');
  assert.match(pending.nextAction, /final October 25 start window has closed/);
  assert.match(pending.nextAction, /explicit authorization/);
});

test('completed queue never recommends an audit outside permitted dates or hours', () => {
  const finished = state([entry('first', '2026-10-24'), entry('second', '2026-10-24'), entry('third', '2026-10-25')]);
  const afterHours = deriveResumeCard(queue, finished, new Date('2026-10-26T00:01:00Z'));
  assert.equal(afterHours.status, 'queue-complete');
  assert.equal(afterHours.canStart, false);
  assert.match(afterHours.nextAction, /do not start an audit now/);
  const expired = deriveResumeCard(queue, finished, new Date('2026-10-26T16:03:00Z'));
  assert.equal(expired.status, 'queue-complete');
  assert.equal(expired.canStart, false);
  assert.match(expired.nextAction, /explicit authorization/);
});
