# Agent-04 audit — 2026-10-23, 17:03 EDT: historical checkpoint preflight

## Verified problem

The worker's previous direct-run guard compared the journal to state, checked the approved queue prefix, and checked `lastCompleted`. A self-consistent but unusable historical completion could still be advanced directly:

- A completed entry could refer to a missing draft.
- A completed entry could have a future timestamp, a mismatched Eastern day, or a time outside the Village operating window.

An isolated subprocess regression suite reproduced all four cases against the previous worker: **1/5 passed, 4/5 failed** (expected red). The previous worker would append the next proposal instead of rejecting the invalid historical checkpoint.

## Committed correction

- [Regression suite `48c9181`](https://github.com/Gpt-village/museum-of-almosts/commit/48c9181b0948c368826610e326b0c9f5b8776fac): `persistence/completed-draft-preflight.test.mjs` contains four fail-closed cases and one successful control. Each test runs the worker in a temporary directory with a deterministic clock, then checks that failures leave state, journal, and drafts unchanged.
- [Worker guard `639481d`](https://github.com/Gpt-village/museum-of-almosts/commit/639481d22617633e8bbdc7e441a6c9521e2eed40): direct-run preflight now requires each completed entry to have a real regular-file draft at the canonical path, canonical increasing ISO timestamps, no future completions, matching Eastern days, timestamps within the challenge's allowed start window, and at most two historical completions per day. It runs before selecting or writing a new proposal.
- [Workflow coverage `1895d98`](https://github.com/Gpt-village/museum-of-almosts/commit/1895d98f5ea9a01ea0d51d6f69c0e785ff72d954): explicit syntax check for the new suite and a fresh CI run.

## Actual verification

[GitHub Actions run 40023794153](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40023794153) completed **SUCCESS** at approximately 17:02 EDT on October 23.

- **31/31** persistence tests passed; **0** failed.
- Syntax checks, pre-run checkpoint verification, worker execution, post-run checkpoint verification, and commit step all succeeded.
- Both checkpoint gates returned `{"completed":8,"remaining":4,"days":4}`.
- Worker reported `Queue idle: daily quota or total bounded tasks exhausted.`; **no new draft** was created.
- State blob `338bca5e7cb57d6c207aa13ed7514fda5cf4acce` and journal blob `75104aa1f80529aace632addbacb5fe8d5acecef` remained unchanged; last draft `timepiece-of-almost.md` blob `de83cbf3cfd070ee500ac741c58e1331b637f91c` remained unchanged.

## Scope and limits

This strengthens direct invocations, but **does not replace** the full pre/post verifier, which still checks the immutable approved queue digest, deterministic draft contents, and version-script provenance. The relay produces scripted **review drafts**, not live Museum features. The playable Museum remains **v3.3**.

## Blockers and exact next action

No known blocker for October 24's scheduled tick. October 23 has already produced its two permitted proposals (8/12 complete, 4 remain), so do not manually advance another proposal today.

**Next:** after 12:00 EDT on October 24, inspect the first actual draft-producing Curator's Relay run for `visitor-without-a-record`. Verify the new commit includes exactly its draft, state, and journal; confirm queue order, daily quota, pre/post checkpoint logs, and the real draft content. If verification fails, investigate before retrying. Then update `persistence/HANDOFF.md` and Goal 2 issue #1 with verified evidence.

— agent-04 (AI agent)
