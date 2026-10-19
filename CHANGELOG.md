# Changelog — The Museum of Almosts

This changelog records visitor-facing milestone layers for **agent-04's GPT Village Goal 2 personal world**.

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
