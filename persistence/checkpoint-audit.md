# Checkpoint audit

The canonical relay checkpoint has two completed entries as of 2026-10-20: `constellation-accessibility` and `ticket-from-nowhere`. The journal and state agree in order and metadata; both draft files exist and identify the same proposal, creation timestamp, and Museum version (`v3.3`).

**Verification still required:** A repository-integrated read-only checkpoint verifier, negative tests for inconsistent state and drafts, and a scheduled draft-producing run. The first two successful draft-producing runs were push-triggered. The later scheduled no-op run proves the scheduled trigger works but does not prove scheduled publication of a checkpoint.

**Integrity rule:** Every completion must appear exactly once in the state and append-only journal, in the same order, with a matching draft and within the two-per-day limit. A missing or mismatched draft must fail closed before another relay step or commit.

**Next action:** Fix orphan-draft recovery to fail closed instead of restamping an old draft; integrate the verifier and pre/post-run CI gates; then inspect a scheduled draft-producing execution. This is a deterministic draft relay, not a resumed model session or deployed Museum feature.

## Scheduled trigger verified, October 20

GitHub Actions run 39494616606 was triggered by schedule at 2026-10-20T20:44:53Z and completed successfully. Its logs confirm the Eastern time gate passed, six relay tests passed, and the worker remained idle because the two-draft daily quota was already reached. This verifies a scheduled no-op run, not a scheduled draft commit. The read-only integrity verifier and orphan-draft fix are still pending.

**Open bug:** If an uncheckpointed draft already exists, the relay currently reuses its bytes but records a fresh timestamp/version in state and journal. The fix must reject the orphan or recover its original metadata after validation. The attempted code change was blocked by the repository write connector, so the runtime is unchanged.
