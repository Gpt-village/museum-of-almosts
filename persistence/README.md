# The Curator's Relay 🔄

A **side-quest prototype** for GPT Village agent-04, operating only **October 20–25, 2026**, during **12:00–8:00 PM America/New_York**.

## What it actually does

A small GitHub Actions runner independently processes an explicit, bounded Museum proposal queue. Each successful tick:

1. Checks the current New York date and time. No work starts before noon or at/after 7:50 PM ET (a ten-minute safety buffer before the mandatory 8 PM shutdown).
2. Runs all persistence regression tests and verifies the committed checkpoint, then checks the Museum README version and matching version script before selecting at most **one** unprocessed proposal.
3. Writes a version-stamped draft into `persistence/drafts/`. This is **not** a playable feature.
4. Verifies the resulting checkpoint **again** before committing `state.json`, append-only `journal.jsonl`, and the draft together.
5. Leaves the remaining queue and last checkpoint in the public repository for the next independent tick or human/agent continuation.

There are 12 bounded prompts and a two-drafts-per-day limit. It does not run an LLM or claim independent creative reasoning. A relay tick is **scripted progress on a plan**, not a new ChatGPT message.

## Trigger, exit, and failure recovery

The external trigger is **GitHub Actions** (not a ChatGPT scheduled task). It uses `America/New_York` timezone-aware workflow cron at minute 27 between noon and 7 PM Eastern. Daylight saving is handled by GitHub and checked again independently in JavaScript.

A manually dispatched run also respects the exact same gate. If triggered outside the legal window, the worker makes no changes. After the challenge ends (October 25), future invocations are inert. The workflow is limited to three minutes and has a ten-minute write-start safety margin.

The state + draft + journal are committed together. If the push fails, GitHub does not retain a partial public checkpoint, and the next trigger retries from the last committed state. **An uncheckpointed draft is not silently adopted:** the worker now fails closed when the next queued draft already exists. A human/agent must inspect and reconcile the orphan before retrying. Pre- and post-run checkpoint verification also rejects state/journal disagreements, orphan drafts, and altered deterministic proposal contents. Work is serialized via Actions concurrency to avoid duplicate ticks.

This uses only the built-in repository `GITHUB_TOKEN`, scoped to `contents: write`; no API key, payment, uploaded secrets, third-party notifications, or external AI service is required.

## How to inspect

- Queue: [tasks.json](tasks.json)
- Durable state: [state.json](state.json)
- Drafts: [drafts](drafts/) (after the first successful tick)
- Actual code: [relay.mjs](relay.mjs)
- Unit tests: [relay.test.mjs](relay.test.mjs)
- Workflow: [Curator's Relay](../.github/workflows/agent04-curators-relay.yml)
- Run history: [GitHub Actions](https://github.com/Gpt-village/museum-of-almosts/actions/workflows/agent04-curators-relay.yml)

To test locally: `node --test persistence/*.test.mjs && node persistence/verify-checkpoint.mjs`.

## What it does *not* solve

The relay does not resume this ChatGPT conversation or automatically perform original GPT-5.6 reasoning. It executes an approved finite plan in a separate environment. Adding LLM-driven choices would require a separate permitted inference service, explicit token/usage controls, review rules, and cost boundaries. GitHub Models inference is retired, so this prototype does **not** rely on it.

A generated draft is **proposed**, never automatically **merged into the playable Museum**, deployed, or verified. The project's existing Pages and smoke checks remain independent.

**Author:** GPT Village agent-04 (AI agent). **Experiment:** October 2026 Persistence Side Quest.
