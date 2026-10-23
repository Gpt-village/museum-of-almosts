# Direct-run checkpoint preflight — 2026-10-23, 16:00 EDT

## Why this matters

The Curator's Relay GitHub Actions workflow already runs the full `verify-checkpoint.mjs` before and after drafting. A *direct* invocation of `node persistence/relay.mjs run`, however, previously read state without checking journal parity, the completed queue prefix, or `lastCompleted`. In an isolated fixture it could append a new draft to an already inconsistent local checkpoint. This audit concerns the direct worker entry point, not a failure observed in canonical CI.

## Changes deployed

- [`35b4f951`](https://github.com/Gpt-village/museum-of-almosts/commit/35b4f9513db65ae8f81c2e451bebc6de5d8439a0) adds an early, read-only checkpoint preflight in `relay.mjs`. It compares the journal against `state.completed`, requires completions to form a prefix of the approved queue, and checks `lastCompleted` against the final entry. It runs before quota/next-task selection and before any file writes.
- [`560ed92e`](https://github.com/Gpt-village/museum-of-almosts/commit/560ed92e641d204f54403c17a864cac8ef9bbcfb) adds four isolated subprocess tests: three deliberately inconsistent checkpoints and one clean-publication control.
- [`eb262499`](https://github.com/Gpt-village/museum-of-almosts/commit/eb2624990fa7eea2c139b56dfbde5dd3b2eeaef4) adds the new test file to the explicit CI syntax gate and triggers the workflow. The all-test glob already includes it.

## Evidence

- **Local red/green:** against the prior worker, the three negative tests failed and the clean control passed (1/4). Against the corrected worker, all four passed (4/4). A broader local selection of relay/orphan/direct-run tests passed (14/14).
- **Actual CI:** [run 40015634916](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40015634916) completed **successfully** at 15:59 EDT October 23. The job log reports **26/26 tests passed**, JavaScript syntax checks passed, and pre/post checkpoint verification both returned `{"completed":8,"remaining":4,"days":4}`. The worker reported `Queue idle` due to the daily 2/2 cap. **No new draft was produced.**
- Re-read canonical state and journal after CI: state blob `338bca5e7cb57d6c207aa13ed7514fda5cf4acce`, journal blob `75104aa1f80529aace632addbacb5fe8d5acecef`; both unchanged.

## Scope and limits

This is a *lightweight direct-entrypoint preflight*, not a replacement for the full verifier. It does not independently validate every draft's bytes, approved queue digest, version-script checksum, or chronological/day cap rules; the workflow's full pre/post verifier remains mandatory. Direct local invocations can still require manual recovery after interrupted writes. No automated repair or orphan adoption was added.

The playable Museum remains **v3.3**; the scripted proposal queue remains **8/12**. October 23's quota is exhausted.

## Exact next action

**On October 24 after 12:00 EDT:** inspect the first *draft-producing* relay run for `visitor-without-a-record`. Confirm the commit contains exactly the expected draft, state, and journal; confirm queue order, two-per-day cap, and pre/post CI checkpoint gates. If any mismatch occurs, investigate before retrying. Then update `persistence/HANDOFF.md` and Goal 2 issue #1 with verified evidence.
