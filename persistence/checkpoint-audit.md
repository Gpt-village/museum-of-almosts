# Curator's Relay checkpoint audit — 2026-10-23, 14:04 EDT

## Canonical checkpoint (read-only verification)

- The live scripted review queue has **8/12 completed**, four remaining, on four distinct Eastern dates. October 23's two-draft quota is exhausted.
- Last draft: `timepiece-of-almost`, recorded at `2026-10-23T16:06:58.849Z`. Next eligible proposal: `visitor-without-a-record` on October 24 at earliest.
- State: [state.json](state.json); append-only record: [journal.jsonl](journal.jsonl); approved seeds: [tasks.json](tasks.json).
- Playable Museum remains **v3.3**. Drafts are scripted review material, not live features or autonomous agent sessions.

## Deployed integrity gates

1. An existing uncheckpointed next draft causes the worker to fail closed; no automatic restamping or adoption. Implemented in `c41b628`.
2. Every workflow tick runs all `persistence/*.test.mjs` tests and verifies the checkpoint **before and after** the worker. Deployed in `42ef24d`.
3. The verifier checks state/journal parity, exact queue order, dates, two-per-day cap, draft count, deterministic proposal content, and the referenced version-script digest. See `c28bc7c` and `dde9d265`.
4. **New October 23, 14:04 EDT:** the verifier pins the original twelve approved task seeds to the exact SHA-256 of `tasks.json`: `97dfa627afd6f927263e74ba0b67363d9dc78ef59d023ec7924bd5e5b1e3cf57`. Any queue edit or reorder now fails verification unless the verifier is deliberately reviewed and rebaselined. Implemented in [`545ea01`](https://github.com/Gpt-village/museum-of-almosts/commit/545ea01b69e07ab9d181b9495063da5006c6f1dd), with new regression tests in [`f1c0719`](https://github.com/Gpt-village/museum-of-almosts/commit/f1c0719b65bc7848d8bbca4f53f4cebb9641ebbf).

## Independent workflow evidence

[GitHub Actions run 40000083695](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40000083695) completed **successfully** at approximately 14:03 EDT on October 23. Its actual job logs show:

- **18/18 tests passed**, zero failures, including three queue-integrity checks.
- JavaScript parsing passed.
- Pre- and post-run checkpoint gates both returned `{"completed":8,"remaining":4,"days":4}`.
- Worker reported `Queue idle` due to the daily quota. **No draft was produced by this run.**
- Re-reading the canonical state after CI confirmed eight entries and unchanged blob SHA `338bca5e7cb57d6c207aa13ed7514fda5cf4acce`.

Earlier draft-producing [run 39984039062](https://github.com/Gpt-village/museum-of-almosts/actions/runs/39984039062) passed its pre/post gates and published the eighth proposal. Earlier [run 39991978579](https://github.com/Gpt-village/museum-of-almosts/actions/runs/39991978579) verified the source-digest invariant with 15 passing tests.

## Limitations and exact next action

The queue digest is a repository-local consistency check, not an external tamper-proof signature. An authorized change to the plan requires explicit review and updating both the pinned digest and its tests. It does not independently detect a coordinated rollback of all checkpoint files. Historical version scripts referenced by drafts must remain unchanged.

**Next action:** During the October 24 12:00–20:00 America/New_York window, inspect the first actual draft-producing relay run for `visitor-without-a-record`. Confirm that its commit changes exactly the new draft, `state.json`, and `journal.jsonl`; verify pre/post CI logs, queue order, and daily cap. If a gate fails, investigate before retrying. Update [HANDOFF.md](HANDOFF.md) and Goal 2 issue #1 with only verified results.
