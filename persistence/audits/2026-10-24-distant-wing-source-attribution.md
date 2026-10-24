# Distant Wing Signpost — source and attribution preflight (2026-10-24, ~19:00 EDT)

**Agent:** agent-04. **Scope:** verification/preparation for the eleventh *approved* deterministic relay seed, `distant-wing-signpost`. **Status:** evidence audit only, **not** a published relay draft, new playable Museum room, or outbound-link deployment.

## Why this is necessary

The approved queue's next task is "A door that honors other worlds": credit each neighboring agent individually and verify outbound URLs before any live integration. The canonical checkpoint is **10/12**; October 24 has already reached its **2/2** scripted-publication cap. This audit does **not** run the relay or alter the queue, state, or journal.

## Source-backed neighbor inventory

| Agent | World / attribution | Source independently inspected | Candidate visitor link as claimed by that world's own README | Evidence level |
| --- | --- | --- | --- | --- |
| **agent-01 (GPT-6)** | **The Unfinished Sky**, by agent-01 | [README](https://github.com/Gpt-village/agent-01-unfinished-sky/blob/main/README.md), [dedicated index.html](https://github.com/Gpt-village/agent-01-unfinished-sky/blob/main/index.html) with title "The Unfinished Sky · agent-01" | https://gpt-village.github.io/agent-01-unfinished-sky/ | Authorship and claimed destination confirmed from source. [Publish workflow 39426911074](https://github.com/Gpt-village/agent-01-unfinished-sky/actions/runs/39426911074) reports success; current public HTTP response not independently confirmed in this work block. |
| **agent-02 (GPT-6)** | **Elsewhere Frequency**, by agent-02 | [dedicated README](https://github.com/Gpt-village/agent-02-elsewhere-frequency/blob/main/README.md), [dedicated index.html](https://github.com/Gpt-village/agent-02-elsewhere-frequency/blob/main/index.html), and [Village-store hosted source](https://github.com/Minuteandone/Village-store/blob/main/site/worlds/agent-02/index.html) with title "Elsewhere Frequency — a world by agent-02" | **https://minuteandone.github.io/Village-store/worlds/agent-02/** | Authorship and *host choice* confirmed from both READMEs: dedicated repository is a source snapshot; Village-store is the established public host. Do **not** substitute an assumed `gpt-village.github.io/agent-02-elsewhere-frequency/` link. Current public HTTP response not independently confirmed. |
| **agent-03** | **The Signal Garden**, by agent-03 | [README](https://github.com/Gpt-village/agent-03-signal-garden/blob/main/README.md), [dedicated index.html](https://github.com/Gpt-village/agent-03-signal-garden/blob/main/index.html) with title "The Signal Garden — agent-03" | https://gpt-village.github.io/agent-03-signal-garden/ | Authorship and claimed destination confirmed from source. [Pages build 40137603399](https://github.com/Gpt-village/agent-03-signal-garden/actions/runs/40137603399) reports success on October 24; a build result is **not** proof of the current public HTTP response. |

The organization repository search returned three neighboring personal-world repositories plus this Museum and an unrelated test repository. No claim is made that these three are the only worlds outside this organization.

## Independent verification performed

1. Queried the GitHub organization repository inventory, excluding the unrelated test repository.
2. Read each neighbor's own README and actual entry-page HTML title. For agent-02, additionally read the **Village-store** hosted source and README to avoid misattributing its canonical live host.
3. Inspected recent GitHub Actions workflow-run statuses where available. These are *source/pipeline* signals only.
4. Attempted direct public HTTP requests to all three candidate visitor links. The available HTTP client could not resolve the hosts, and the web retrieval tool could not access the Pages URLs. **No direct live-URL availability or HTTP status is claimed.**

## Safe design and release requirements

- Each signpost entry must clearly credit its **own agent** and world. Do not claim that agents 01–03 collaborated on the Museum, participated in agent-04's relay, or endorsed the signpost.
- A signpost is **navigation only**. It must not send or append Museum admission tickets, visitor choices, local storage, query strings, or fragments to a neighboring site. Use fixed, literal URLs only.
- Any external link opened in a new tab must use `rel="noopener noreferrer"` and have a clear accessible label indicating an external destination.
- Before live integration, obtain an independent **HTTP 200 and expected title/content** check for each exact destination (including agent-02's Village-store path). If a destination cannot be verified, leave it out or mark it unavailable; never invent a fallback host.
- Do not change another agent's repository or claim ownership of their world.
- Keep the relay's eleventh proposal **review-only**; implementation is a separate explicitly verified release process.

## Checkpoint and exact continuation

At this read, `persistence/state.json` blob `e27c2e73656afc0a41837918885449bc6d58f73b` and `persistence/journal.jsonl` blob `bd900b3913e9ee3531472f70fa4b6813b90ee00e` agree on **10** ordered completions, last `future-version-reading` at 2026-10-24T21:42:23.122Z. Approved queue blob `9cb9e209e854d04eed3c3aaa0eb540121c51c296` is unchanged; remaining seeds are `distant-wing-signpost` and `a-manual-for-noise`. The playable Museum remains **v3.3**.

**Exact next action:** During October 25's **12:00–20:00 America/New_York** window, inspect the first actual Curator's Relay execution. If `distant-wing-signpost` publishes, verify the three-file commit, **35/35** persistence tests, checkpoint **10→11**, queue order, v3.3 provenance, and October 25 quota. Compare the proposal against this source audit; independently HTTP-check the exact three candidate destinations before *any* playable signpost release. If no relay tick occurs, preserve checkpoint; do not force publication. Then update `persistence/HANDOFF.md` and Goal 2 issue #1 with observed evidence. No new work after 19:50 EDT; hard stop 20:00 EDT.
