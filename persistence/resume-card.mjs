/**
 * Agent-04 read-only checkpoint resume card.
 * This reports verified scripted work; it neither runs the relay nor publishes a Museum feature.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIRST_DAY = '2026-10-20';
const LAST_DAY = '2026-10-25';
const MAX_PER_DAY = 2;

export function easternClock(instant) {
  assert.ok(instant instanceof Date && Number.isFinite(instant.getTime()), 'invalid inspection instant');
  const fields = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(instant).map(x => [x.type, x.value]));
  return { day: `${fields.year}-${fields.month}-${fields.day}`, minute: Number(fields.hour) * 60 + Number(fields.minute) };
}

export function deriveResumeCard(queue, state, now = new Date()) {
  assert.equal(queue?.schema, 1, 'invalid queue schema');
  assert.equal(state?.schema, 1, 'invalid state schema');
  assert.equal(queue.agent, 'agent-04', 'wrong queue owner');
  assert.equal(state.agent, 'agent-04', 'wrong state owner');
  assert.ok(Array.isArray(queue.tasks) && queue.tasks.length <= 12, 'invalid task queue');
  assert.ok(Array.isArray(state.completed) && state.completed.length <= queue.tasks.length, 'invalid completed entries');
  state.completed.forEach((entry, i) => assert.equal(entry?.id, queue.tasks[i]?.id, 'completion not a queue prefix'));
  assert.deepEqual(state.lastCompleted ?? null, state.completed.at(-1) ?? null, 'lastCompleted mismatch');
  const clock = easternClock(now);
  const total = queue.tasks.length;
  const completed = state.completed.length;
  const remaining = total - completed;
  const usedToday = state.completed.filter(x => x.day === clock.day).length;
  assert.ok(usedToday <= MAX_PER_DAY, 'daily quota exceeded');
  const withinChallenge = clock.day >= FIRST_DAY && clock.day <= LAST_DAY;
  const withinHours = clock.minute >= 720 && clock.minute < 1190;
  const canStart = withinChallenge && withinHours && usedToday < MAX_PER_DAY && remaining > 0;
  const next = queue.tasks[completed] ?? null;
  const status = remaining === 0 ? 'queue-complete'
    : !withinChallenge ? 'outside-challenge-dates'
    : !withinHours ? 'outside-operating-window'
    : usedToday >= MAX_PER_DAY ? 'daily-quota-exhausted'
    : 'eligible-for-scheduled-relay';
  const nextAction = remaining === 0
    ? 'Audit the final checkpoint and all completed drafts; do not generate another proposal.'
    : !withinChallenge
      ? 'Challenge dates are closed. Preserve the checkpoint; any continuation requires a separately authorized plan.'
      : !withinHours
        ? 'Wait until the permitted 12:00–19:50 Eastern start window; do not modify the relay checkpoint now.'
        : usedToday >= MAX_PER_DAY
          ? 'Daily quota exhausted. Do not force another draft; preserve the checkpoint.'
          : `Inspect the next actual in-window Curator’s Relay run for ${next.id}; verify its draft/state/journal commit, full persistence test suite, queue order, v3.3 provenance, and daily quota. Do not force a duplicate if delayed.`;
  return {
    inspectedAt: now.toISOString(), easternDay: clock.day,
    checkpoint: { completed, total, remaining, lastCompleted: state.lastCompleted?.id ?? null },
    quota: { usedToday, limit: MAX_PER_DAY, remainingToday: MAX_PER_DAY - usedToday },
    next: next ? { id: next.id, title: next.title } : null,
    status, canStart, nextAction,
    canonicalSources: ['persistence/HANDOFF.md', 'persistence/tasks.json', 'persistence/state.json', 'persistence/journal.jsonl', 'persistence/verify-checkpoint.mjs'],
    limits: 'Scripted deterministic drafts are review-only; this card is read-only and does not imply a resumed LLM session, an approved feature, or a deployment.'
  };
}

export function renderResumeCard(card) {
  return [
    '# Agent-04 — verified checkpoint resume card',
    '',
    `- Inspected: ${card.inspectedAt} (${card.easternDay} Eastern)`,
    `- Scripted proposals: ${card.checkpoint.completed}/${card.checkpoint.total}; remaining: ${card.checkpoint.remaining}`,
    `- Last completion: ${card.checkpoint.lastCompleted ?? '(none)'}`,
    `- Today’s quota: ${card.quota.usedToday}/${card.quota.limit}`,
    `- Next approved seed: ${card.next ? `${card.next.id} — ${card.next.title}` : '(none)'}`,
    `- Status: ${card.status}; eligible to start: ${card.canStart ? 'yes' : 'no'}`,
    '',
    `**Exact next action:** ${card.nextAction}`,
    '',
    `**Limits:** ${card.limits}`,
    '',
    `**Canonical sources:** ${card.canonicalSources.map(x => '\x60' + x + '\x60').join(', ')}.`,
    ''
  ].join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { verifyCheckpoint } = await import('./verify-checkpoint.mjs');
  const verified = verifyCheckpoint(ROOT); // Fail closed before displaying a misleading card.
  const read = name => JSON.parse(fs.readFileSync(path.join(ROOT, 'persistence', name), 'utf8'));
  const card = deriveResumeCard(read('tasks.json'), read('state.json'));
  assert.equal(card.checkpoint.completed, verified.completed, 'verification/count disagreement');
  assert.equal(card.checkpoint.remaining, verified.remaining, 'verification/remaining disagreement');
  if (process.argv[2] === '--json') console.log(JSON.stringify(card, null, 2));
  else if (!process.argv[2]) process.stdout.write(renderResumeCard(card));
  else throw new Error('Usage: node persistence/resume-card.mjs [--json]');
}
