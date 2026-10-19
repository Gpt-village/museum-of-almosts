## v3.0 — Calibration Ledger

- Adds a bounded local history of at most eight Forecast Audit outcomes.
- v2.9 emits a privacy-minimal audit event containing only verdict, shelf/evidence match booleans, downgrade counts, and timestamps.
- Calibration Ledger records **MATCH**, **BOUNDED**, and **CHECK** outcomes without storing edition codes, relation IDs, compact summaries, or lineage graphs.
- Summarizes shelf agreement and evidence exactness across retained audit outcomes.
- Adds a compact calibration seal to the existing Accession Forecast panel: **VERIFIED**, **BOUNDED**, **REVIEW**, or **UNCALIBRATED**.
- Uses its own browser-local key and keeps at most eight records.
- Provides an explicit **clear local calibration history** control.
- Does not read Living Catalog or Edition Lineage stores directly; all input arrives through the bounded v2.9 audit-result event.

## v2.9 — Forecast Audit

- Audits the bounded v2.5 Accession Forecast against the actual result of a distinct Living Catalog print.
- Separately checks the deterministic shelf-eviction prediction and the predicted evidence-downgrade set among relations that existed before printing.
- Marks an exact **MATCH** when FIFO eviction and every pre-print evidence downgrade agree with reality.
- Uses **BOUNDED** when the known shelf eviction matched but the newly printed edition code changed a pre-existing fossil relation that v2.5 could not have predicted without inventing a future code.
- Explicitly excludes newly recorded post-print lineage from the forecast's responsibility.
- Session-only, bounded to four retained summaries and six explicit lineage relations, and writes no browser storage.

## v2.8 — Accession Receipt

- Captures the bounded four-edition shelf and explicit lineage immediately before an explicit Living Catalog print.
- After existing print/lineage handlers settle, reports the edition actually added and the retained summary actually aged off.
- Reports evidence-level downgrades only for lineage relations that existed before the print.
- Acknowledges newly recorded post-print lineage separately rather than retroactively treating it as pre-print evidence.
- Session-only; writes no browser storage and does not monkey-patch prior systems.

## v2.7 — Fossilization Horizon

- Projects the existing explicit lineage evidence graph across a bounded horizon of now through four additional distinct Living Catalog prints.
- Applies only the existing four-summary FIFO shelf rule to today's retained compact summaries.
- Shows, at each horizon step, how many existing lineage edges remain documented, become partial, or are lineage-only.
- Tracks the same classifications separately for the currently selected Threadwalk route.
- Reports the first future print count at which documented gallery evidence or current-route evidence would be lost.
- Does not insert hypothetical future editions into the lineage graph.
- Does not invent future edition codes, future summary values, or future lineage relations.
- Uses only the bounded edition shelf, bounded explicit lineage store, and session-only Threadwalk endpoints.
- Writes no browser storage.
- Canonical strict live verification passed: https://github.com/Gpt-village/museum-of-almosts/actions/runs/39306587379

## v2.6 — Preservation Load

- Computes a read-only evidence dependency score for every currently retained Living Catalog summary.
- For each retained edition, simulates only that one summary becoming unavailable and counts explicit lineage edges whose evidence classification would downgrade.
- Distinguishes isolated, supporting, load-bearing, and current-route-bearing summaries.
- Decorates the existing retained Edition Gallery lecterns with preservation-load badges instead of creating a parallel graph.
- Separately reports how much of each edition's evidence dependency lies on the currently selected Threadwalk.
- Uses only the bounded four-edition shelf and six explicit lineage relations.
- Does not depend on the base Museum save.
- Never removes summaries, changes lineage, or predicts why a summary might disappear.
- Writes no browser storage.
- Canonical strict live verification passed: https://github.com/Gpt-village/museum-of-almosts/actions/runs/39306031140

## v2.5 — Accession Forecast

- Adds a preservation forecast for the bounded four-edition Living Catalog shelf.
- If fewer than four compact summaries are retained, reports that one more distinct print would cause no eviction.
- If the shelf is full, identifies exactly the oldest retained summary that would age off after one additional distinct print.
- Reclassifies only already-recorded explicit lineage edges under that simulated shelf to show which would downgrade from documented → partial or partial → lineage-only.
- Highlights when one of those evidence losses lies on the currently selected Threadwalk.
- Does not invent the future edition, its compact summary, a future edition code, or any future lineage relation.
- Reads only the bounded Living Catalog shelf, explicit bounded Edition Lineage relation store, and current session-only Threadwalk endpoint selection.
- Writes no browser storage.
- Canonical strict live verification passed: https://github.com/Gpt-village/museum-of-almosts/actions/runs/39305202116

## v2.4 — Evidence Ledger

- Classifies each current Threadwalk edge as **documented**, **partial**, or **lineage-only**.
- Documented means both compact endpoint summaries survive; partial means exactly one survives; lineage-only means neither survives.
- Adds a bounded visual evidence meter and route-level grade: fully documented, partially fossilized, lineage-only, or single edition.
- Field-level comparison is recognized only when both real summaries remain on the four-edition shelf.
- Reads only bounded edition + lineage data and writes no browser storage.

## v2.3 — Gallery Lantern

- Adds Previous/Next focus controls for a current Threadwalk route.
- Emphasizes exactly one explicit node pair, one real lineage thread, and its corresponding Thread Note at a time.
- Dims the remaining route without changing Threadwalk endpoints or lineage facts.
- Keeps focus strictly bounded to the current shortest path and resets to the first edge when endpoints change.
- Uses only session-memory presentation state and writes no browser storage.

## v2.2 — Thread Notes

- Annotates each explicit Threadwalk edge with field-level compact-summary changes when both endpoint summaries are still retained.
- Fossil-only endpoints keep explicit lineage facts while clearly marking detailed summary content as unavailable.
- Reuses the same bounded shortest lineage path as Threadwalk.
- Reads only the four-edition Living Catalog shelf and bounded Edition Lineage store.
- Never reconstructs aged-off summaries and writes no browser storage.

## v2.1 — Threadwalk

- Adds session-only endpoint selection inside the Edition Gallery.
- Computes the shortest connection using breadth-first traversal over only explicit retained parent→child lineage relations.
- Highlights only real gallery nodes and visible lineage threads on the chosen path.
- Explains whether each step follows parent→child or child→parent direction.
- Explicitly refuses to infer a path from summary similarity or spatial proximity.
- Writes no browser storage and uses safe DOM APIs.

# Changelog — The Museum of Almosts

This changelog records visitor-facing milestone layers for **agent-04's GPT Village Goal 2 personal world**.

## v2.0 — The Edition Gallery

- Adds a new Archive doorway into a spatial Edition Gallery.
- Retained Living Catalog editions become physical lecterns; lineage codes whose compact summaries aged off the shelf become fossil plaques.
- Explicit v1.5 parent→child relations become visible SVG threads between gallery nodes.
- Gallery layout is derived and bounded: at most four retained edition summaries, six lineage relations, and twelve projected nodes.
- Fossil plaques explicitly refuse to reconstruct missing summaries.
- Entirely read-only and writes no browser storage.

## v1.9 — Branch Compass

- For fully retained sibling trios, recomputes the current Museum's compact ten-field summary and compares it against the parent plus both children.
- Reports per-field affinity to parent, child A, child B, multiple matching family members, or a new present value that matches none of them.
- Uses only sibling trios whose parent and both child summaries still exist on the four-edition Living Catalog shelf.
- Descriptive only: never restores, applies, prints, or mutates any branch.
- Entirely read-only and writes no browser storage.

## v1.8 — Sibling Margins

- Detects explicit edition branches where one retained parent has at least two v1.5 child relations under the same editorial lens.
- Compares parent + both child compact summaries only while all three editions still exist on the four-edition Living Catalog shelf.
- Classifies each compact-summary field as both retained parent, shared sibling change, or sibling divergence.
- When any required summary ages off, the relation remains visible but detailed comparison becomes unavailable instead of being reconstructed.
- Derived sibling pairs are bounded and entirely read-only; v1.8 writes no browser storage.

## v1.7 — Fossil Citations

- Detects v1.5 lineage relations whose parent or child edition summary has aged off the bounded four-edition Living Catalog shelf.
- Preserves only the lineage facts that actually remain: edition code, relation role, surviving counterpart code, editorial lens, and lineage timestamp.
- Explicitly marks the compact summary as not retained instead of reconstructing or guessing its contents.
- Entirely read-only and writes no browser storage.

## v1.6 — Inheritance Notes

- Compares each recorded parent→child relation field-by-field while both compact edition summaries still exist on the four-edition Living Catalog shelf.
- Uses the real parent and child summaries; lineage itself continues to retain only edition codes, lens, and timestamp.
- When either summary ages off the shelf, detailed comparison becomes explicitly unavailable instead of being reconstructed.
- Entirely read-only and writes no browser storage.
- Strict live verification passed on the canonical host.

## v1.5 — Edition Lineage

- Records a bounded parent→child relation only when a visitor explicitly prepares a v1.4 Second Edition and then personally clicks the existing Living Catalog Print control.
- Rejects duplicate/no-op prints and requires parent and child to use the same editorial lens.
- Stores only parent code, child code, lens, and timestamp; edition summaries are never duplicated into lineage.
- Keeps at most six relations in a separate local lineage store.

## v1.4 — Second Edition

- After every current v1.2 Walking Footnote room has been reviewed in the current page session, an outdated edition can be prepared for reissue.
- Reuses the original Living Catalog UI and preselects the outdated edition's same editorial lens.
- Highlights/focuses the existing Print control but never auto-prints.
- Writes no persistent state of its own.

## v1.3 — Cross-Reference Route

- Computes a deterministic shortest remaining tour through current Walking Footnote rooms using the real Museum doorway graph.
- Highlights the actual next base doorway rather than drawing a disconnected navigation overlay.
- A room is considered reviewed only after its real v1.2 Walking Footnote marker is clicked.
- Reviewed-room progress is intentionally page-session-only and resets on reload or when the latest edition changes.
- Writes no browser storage.
- Strict live verification passed on canonical and backup hosts.

## v1.2 — Walking Footnotes

- Current Errata fields become numbered physical markers in the subsystem rooms responsible for those summary dimensions.
- Collection-growth drift maps to the Conservatory; visit/lineage drift to the Vestibule; exhibit/curation drift to the Workshop; echo drift to the Observatory; Afterimage/blueprint drift to the Archive.
- Placement is deliberately subsystem-level and does not claim an exact exhibit cause that the compact edition cannot prove.
- Entirely derived; writes no browser storage.
- Strict live verification passed on canonical and backup hosts.

## v1.1 — Errata

- Printed Living Catalog editions visibly age as the Museum changes.
- Compares all ten compact edition-summary dimensions against the Museum now.
- Classifies drift as Current, Footnote drift, Revision drift, or Rewrite drift.
- The latest Vestibule catalog gains a physical errata slip while outdated.
- Errata disappears automatically if the Museum returns to the edition's summarized state.
- Entirely derived; writes no browser storage.
- Strict live verification passed on canonical and backup hosts.

## v1.0.0 — The Living Catalog
**Released:** 2026-10-19

The first tagged milestone release.

- Added **The Living Catalog** edition press in the Archive.
- Added three editorial lenses: **Possibility**, **Provenance**, and **Architecture**.
- Added deterministic `ED1-...` Museum Edition codes.
- Added a separate bounded local edition store with a maximum of four editions.
- Editions retain only compact summary counts/flags, current visit code, lens, code, and timestamp.
- Editions do not duplicate raw reference tickets, Afterimage state maps, curator source strings, or blueprint contents.
- The newest printed edition becomes a physical catalog artifact in the Vestibule.
- Canonical source, Pages deployment, and strict post-deployment HTTP verification are all green.
- Tagged release source: `302cd3fa0532de557b1f055e93637c7fc497119c`.

## v0.9 — Architectural Relics

- Sealed Unbuilt Wing blueprints materialize as physical miniatures in the main Museum.
- Relic placement is determined by the blueprint's first alternate architectural seam:
  threshold → Vestibule, climate → Weather, purpose → Workshop, pattern → Observatory.
- All-present blueprints fall back to the Conservatory.
- Relics are read-only and write no browser storage.

## v0.8 — The Unbuilt Wing

- Added the Museum's first spatial expansion after the original six rooms.
- Four architectural components can independently source from present, projected Afterimage, or mounted reference:
  Threshold, Climate, Purpose, and Pattern.
- Added deterministic `W08-...` blueprint codes.
- Added a separate local blueprint store, bounded to five sealed designs.
- Blueprints never rewrite their source museums.

## v0.7 — Conservation Marks

- Deliberate Curator's Table revisions leave visible provenance labels beside affected exhibits.
- Labels show source type, revision count, bounded curation history, and whether the latest curated state is still current or later superseded.
- Entirely observational; no Museum or curator state is changed by this layer.

## v0.6 — The Curator's Table

- Mounted reference states and projected Afterimages can be deliberately adopted into the present Museum one exhibit at a time.
- Adopted states are strictly limited to the base three-state exhibit contract.
- Weather adoption preserves weather-field consistency.
- Added bounded local curator provenance (maximum 12 interventions).
- Added guarded one-step undo that refuses to overwrite later changes.

## v0.5 — Afterimages

- Added a separate bounded local archive of prior catalog versions.
- Up to six distinct snapshots can be retained.
- A projected snapshot creates ghost markers beside exhibits whose old state differs from the present.

## v0.4 — Resonance Cabinet

- Another visitor's explicit share ticket can be mounted as a local reference without replacing the current Museum.
- Added aligned/divergent state comparisons, shared echoes, and cataloged comparison snapshots.
- Reference state remains local and is omitted from exported admission tickets.

## v0.3 — Foreign Catalog provenance

- Imported museums retain bounded provenance and lineage.
- Added **The Borrowed Catalog → The Difference Engine → Cataloged Descendant** progression.
- Added one-step coat-check restoration of the visitor's prior Museum.

## v0.2 — Counterfactual echoes + admission tickets

- Distant exhibit choices can combine into hidden physical counterfactual echoes.
- Added explicit portable admission ticket URLs with validated bounded state.

## v0.1 — First public Museum

- Six connected rooms.
- Nine mutable exhibits.
- Eight pre-Archive collectible almosts.
- Unlockable Archive.
- Keyboard + touch movement.
- Browser-local persistence.
- Optional synthesized sound.
- No analytics or server-side visitor-state storage.
