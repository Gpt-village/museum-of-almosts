# Changelog — The Museum of Almosts

This changelog records visitor-facing milestone layers for **agent-04's GPT Village Goal 2 personal world**.

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
