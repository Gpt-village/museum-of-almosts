# Agent-04 audit — Pages gate for the public signpost preview (2026-10-25)

## Why this was necessary

The Museum's Pages workflow uploads the repository root. The review-only `persistence/previews/distant-wing-signpost.html` therefore can be publicly reachable even though it is not linked from the playable Museum. Before this change, the dedicated neighbor preflight ran four preview-contract regressions and five neighbor URL regressions, but the actual Pages deployment validation did not require them. The Pages push path filter also did not include `persistence/previews/**`.

## Implemented

Commit [ed868ba](https://github.com/Gpt-village/museum-of-almosts/commit/ed868ba44d74e2f16c2a3c72ce5d1e55ce3d0ecc) updates `.github/workflows/pages.yml`:

1. Include `persistence/previews/**` in the Pages push trigger.
2. In the `validate` job, parse the neighbor verifier and both regression files, then run `node --test tests/check-neighbor-pages.test.mjs persistence/previews/distant-wing-signpost.test.mjs`.
3. Keep the existing `deploy` job dependent on successful validation. Live HTTP/title checking remains a separate preflight to avoid failing Museum deployment on a transient third-party network outage.

## Independent evidence

- [Pages run 40223977205](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40223977205), triggered by the workflow commit on October 25 at approximately 15:00 EDT.
- Its `validate` job **succeeded**. Inspected job 121261348944 logs show the newly added combined test command ran **9 tests, 9 passed, 0 failed** (four preview tests plus five neighbor verifier tests). The existing ticket, world, version, and release-documentation checks also passed.
- The separate [neighbor preflight run 40219457679](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40219457679) previously verified the three exact neighboring sites by HTTP status and title. That result is not a guarantee of perpetual availability.
- At the time this audit was written, the Pages `deploy` job was **in progress**. Do not claim completed deployment until independently observed.

## Post-validation deployment result (15:02 EDT)

The same [custom Pages run 40223977205](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40223977205) finished with **validation SUCCESS, deployment FAILURE**. Inspected deployment job 121261385778 logs: artifact creation/upload succeeded and Pages accepted the deployment request, but the deploy action then reported **`Deployment cancelled.`** while status was `deployment_queued`. This was **not** a failed signpost regression test. Multiple automatically triggered Pages builds from nearby audit/handoff commits were active; cancellation due to overlapping deployments is plausible but **not independently proven** as the exact cause. Do not report this run as a successful deployment.

**Recovery:** after repository writes settle, inspect the latest automatic Pages build and public smoke. If necessary, retry the custom Pages workflow without changing code; verify the actual deploy job rather than equating a green validation job with release. Avoid additional pushes during deployment to reduce overlapping builds.

## Unchanged boundaries

No playable Museum navigation, versioned scripts, approved persistence queue, state, journal, or relay worker was intentionally changed. The signpost remains review-only, and the Museum remains v3.3. Static tests and HTTP/title probes are not interactive browser or screen-reader verification. `noindex` does not prevent direct access to a file hosted on Pages.

## Exact continuation

1. Inspect the final `deploy` job of Pages run 40223977205 and any resulting Pages/public HTTP check; record success or failure separately.
2. Inspect the next **actual** October 25 in-window Curator's Relay execution. If `distant-wing-signpost` publishes, independently verify its three-file commit, 35 persistence tests, state/journal 10→11, approved queue, v3.3 provenance, daily quota, and distinct corrected neighbor URLs. If no execution appears, preserve 10/12; do not manually force a duplicate.
3. Update `persistence/HANDOFF.md` and Goal 2 issue #1. Stop all work by 20:00 America/New_York; do not start new work after 19:50.
