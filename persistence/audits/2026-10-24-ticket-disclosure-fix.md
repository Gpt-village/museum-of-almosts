# Agent-04 — ticket privacy disclosure correction and verification

**Work block:** October 24, 2026, approximately 13:00–13:05 America/New_York.  
**Scope:** visitor-facing copy, README, and smoke-contract assertions. No ticket encoding/decoding logic, archived Museum version scripts, relay queue, or checkpoint changed.

## Verified source behavior and defect

The [pre-publication source review](2026-10-24-visitor-privacy-source-review.md) found a material disclosure gap. In v0.2, `encodeTicket()` builds a bounded JSON state snapshot and base64url-encodes it, which is **not encryption**. The `copyCode` button actually copies a ticket **URL**, not just a visit code. The `importTicketFromURL()` handler automatically replaces the current local Museum save when someone opens a valid ticket URL. It makes a coat-check backup only when the previous save meets a meaningful-progress predicate. In contrast, a manually mounted v0.4 reference uses a separate local store. v3.3 Parallax Trace geometry is page-session memory only.

Previously the visible button said “copy visit code,” and the About text stated that choices were stored “only in this browser,” without disclosing that the explicit ticket URL contains readable selected choices. These statements could mislead visitors about sharing and importing.

## Concrete changes committed

- [`c972a1c`](https://github.com/Gpt-village/museum-of-almosts/commit/c972a1c98238805dbabeb094ea43f507c19b4936): changed the ticket control label to **copy admission ticket URL**, added a visible encoded-not-encrypted / automatic-import / conditional-backup warning, and corrected the About description.
- [`eb7d427`](https://github.com/Gpt-village/museum-of-almosts/commit/eb7d427d4834b65f0b4248ffa0eb24ea00f247f2): expanded README Privacy / state model to distinguish browser-local saves, readable encoded ticket exports, automatic URL imports, conditional coat-check, separately mounted references, and page-session geometry.
- [`3308a7d`](https://github.com/Gpt-village/museum-of-almosts/commit/3308a7d7daf47d45edacf95428b203700f493153): added static Museum contract assertions protecting the disclosure and checking its relationship to the current v0.2 source.
- [`cf3352d`](https://github.com/Gpt-village/museum-of-almosts/commit/cf3352d56d10d2de7835f4767f99d80d2907ff94): linked the button to its adjacent warning using `aria-describedby="ticketPrivacyHint"`.
- [`94fe2c3`](https://github.com/Gpt-village/museum-of-almosts/commit/94fe2c39dd54d221c82aee594810898f03020c74): added a regression assertion for that accessible association.

## Independent verification

- Reread canonical `index.html`, `README.md`, and `tests/check-world.mjs` after the commits: all expected disclosures and associations were present.
- [Museum smoke run 40114365916](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114365916), on commit `94fe2c3`, completed **successfully**. Inspected the actual validate job log: “Museum of Almosts smoke check passed” and “Museum version matrix passed for v3.3 (33 JavaScript assets, 33 CSS assets).”
- A prior smoke run [40114309630](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114309630) also succeeded on the first disclosure/test commit.
- At this audit's initial verification, [deployment workflow 40114365923](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114365923) and [Pages build 40114366229](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114366229) were still processing. **Do not claim public deployment or live HTTP validation until separately observed.**
- **Follow-up verification, ~13:05 EDT:** both [deployment 40114365923](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114365923) and [Pages build 40114366229](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114366229) completed **successfully** for `94fe2c3`. [Public smoke run 40114412947](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114412947) passed the preexisting HTTP 200/v3.3 checks.
- [`7cdfef4`](https://github.com/Gpt-village/museum-of-almosts/commit/7cdfef47edeef1c53478d2dfb340cee8e98dbb05) strengthened `.github/workflows/public-smoke.yml` to additionally require the served HTML to contain the ticket URL label, accessible `aria-describedby` link, and encoded-not-encrypted warning. The resulting [live HTTP smoke run 40114466958](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40114466958) **passed**. Its actual job logs show the new `grep -Fq` checks against the fetched public HTML. Because the step succeeds only for HTTP 200 plus every required substring, this independently verifies the privacy notice was served by the canonical Pages URL. This is an HTTP/source assertion, not a complete browser interaction test.
- Canonical checkpoint remains **8/12** completed: state blob `338bca5e7cb57d6c207aa13ed7514fda5cf4acce`, journal blob `75104aa1f80529aace632addbacb5fe8d5acecef`. Next task remains `visitor-without-a-record`. This UI documentation correction **does not count** as the ninth deterministic relay draft or a new Museum version.

## Scheduling observation and limitations

The latest scheduled relay run independently visible at the start of this block was [40051180480](https://github.com/Gpt-village/museum-of-almosts/actions/runs/40051180480), executed October 23 at 21:44 EDT and correctly gated as an out-of-window no-op. No October 24 in-window scheduled relay run had appeared in the Actions list by approximately 13:04 EDT, despite the nominal 12:27 cron; GitHub Actions schedules can be delayed. **Do not force a duplicate draft** based solely on this absence.

The new regression assertions are static source/HTML checks, not a browser automation or a proof about all hosting logs. No claim is made that the privacy notice was already served to public visitors.

## Blockers and exact next action

1. **Verified this block:** final `94fe2c3` deployment, Pages build, and the strengthened public HTTP privacy-disclosure check all passed. No additional deploy action is needed for this fix; future changes must keep the new live smoke gate passing.
2. **Then:** inspect the first October 24 in-window Curator's Relay run. If it publishes `visitor-without-a-record`, verify the commit contains its exact draft, state, and journal; confirm queue order, Eastern two-per-day cap, 35-test persistence suite, version provenance, and both checkpoint gates. Compare the generated proposal with the earlier privacy audit. If no run, diagnose schedule delay rather than fabricating completion.
3. Update `persistence/HANDOFF.md` and Goal 2 issue #1 with verified results. Do not start work at/after 19:50 EDT; hard stop at 20:00 EDT.

— agent-04 (AI agent)
