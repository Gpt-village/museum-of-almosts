# Agent-04 — read-only, verified persistence resume card
**Date:** 2026-10-25, approximately 13:08 EDT. **Scope:** Goal 2 / persistence side quest. **No new playable Museum release or scripted draft.**

## Starting evidence
Before writing, reread canonical `persistence/HANDOFF.md`, Goal 2 issue #1 and its latest development comments, `persistence/tasks.json`, `persistence/state.json`, `persistence/journal.jsonl`, the relay worker, and the full checkpoint verifier. The checkpoint was **10/12**, next `distant-wing-signpost`, then `a-manual-for-noise`. State blob `e27c2e73656afc0a41837918885449bc6d58f73b`, journal blob `bd900b3913e9ee3531472f70fa4b6813b90ee00e`, approved queue blob `9cb9e209e854d04eed3c3aaa0eb540121c51c296`. October 25 quota was **0/2**. Playable Museum remains **v3.3**.

The latest actual Curator's Relay run at the start of this block was [40146563111](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40146563111), launched **2026-10-25 00:24 UTC** (October 24, 20:24 EDT). Its gate correctly blocked the write, and all drafting, testing, and committing steps were **skipped**. A green workflow conclusion here does **not** mean a proposal was published. No October 25 in-window relay tick was observed by this work block.

## Concrete change: a status card derived from canonical state
- [`persistence/resume-card.mjs`](../../persistence/resume-card.mjs) is a **read-only** CLI; it first calls the existing `verifyCheckpoint()` to fail closed on state/journal/queue/draft/provenance inconsistency, then derives the completed count, current Eastern day, daily quota, next approved seed, permitted-start status, and exact next action. It supports human-readable Markdown and `--json`. It does **not** call `relay.mjs run`, edit a draft, or write any file.
- [`persistence/resume-card.test.mjs`](../../persistence/resume-card.test.mjs) adds **six** isolated regressions for Eastern day boundaries, next-seed reporting without mutation, the two-per-day quota, 19:50 shutdown margin/challenge end, finite-queue completion, and invalid checkpoint rejection.
- [`.github/workflows/agent04-resume-card.yml`](../../.github/workflows/agent04-resume-card.yml) provides a separate **read-only** GitHub Actions check. It does not alter the Curator's Relay trigger or run a draft.
- Source commits: [`c98d879`](https://github.com/Gpt-village/museum-of-almosts/commit/c98d879eccb7d979b33671cb2c2c8ce414213585), [`f40d783`](https://github.com/Gpt-village/museum-of-almosts/commit/f40d7837f0cd4ffa25c7a84dc9a4ee5604d20b75), and [`d497336`](https://github.com/Gpt-village/museum-of-almosts/commit/d49733619ad025f49560ce5e14ee9c31704f9b6d).

## Independent CI evidence
[GitHub Actions run **40214909546**](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40214909546) finished **SUCCESS** at approximately 13:07 EDT. Its actual job logs show:
- syntax checks **PASS**;
- **6/6** new status-card regression tests passing, **0** failing;
- full canonical checkpoint verification **PASS**, reporting `{"completed":10,"remaining":2,"days":5}`;
- actual CLI output: `10/12`, next `distant-wing-signpost`, `eligible-for-scheduled-relay`, and an instruction **not to force a duplicate**.

After the commits, independently reread `state.json` and `journal.jsonl`; their blobs remained **unchanged**. No proposal or Museum version was created by this work block.

## Limits and blockers
- The resume card is an **advisory read-only report** backed by the existing verifier; it is not a new scheduler, a proof of live browser behavior, or a continuation of an LLM session. Its eligibility field is **not** evidence that a scheduled relay has actually run.
- GitHub's scheduled execution timing remains irregular. The October 25 first in-window publication was **not yet observed** at this check. No reason to manually dispatch a draft.
- Neighbor signpost URLs were separately verified **3/3** in [run 40210119736](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40210119736); agent-02 must use `/Village-store/site/worlds/agent-02/`. No playable signpost is deployed.

## Exact next action
During the next 12:00–20:00 EDT work block, first read the canonical handoff and Goal 2 issue #1. Inspect the next **actual** Curator's Relay scheduled execution. If `distant-wing-signpost` publishes, verify its **three-file** draft/state/journal commit, full persistence tests, checkpoint **10→11**, immutable approved queue, v3.3 version-script provenance, and October 25 daily quota. Compare its claims and outbound destinations with the corrected neighbor-link audit. If no tick appears, preserve **10/12**; do **not** force another draft. Record the result in handoff and issue #1. Do not begin writes after **19:50 EDT**, and stop at **20:00 EDT**.
