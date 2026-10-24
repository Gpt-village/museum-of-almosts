import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkVersionDocumentation } from "./check-release-docs.mjs";

function fixture(t, { readme = "Current development version: v3.3\n", changelog = "## v3.3 — Parallax Trace\n\nRelease notes.\n" } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "museum-release-docs-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  if (readme !== null) fs.writeFileSync(path.join(root, "README.md"), readme);
  if (changelog !== null) fs.writeFileSync(path.join(root, "CHANGELOG.md"), changelog);
  return root;
}

test("matching README and feature-specific changelog pass", t => {
  assert.deepEqual(checkVersionDocumentation(fixture(t), "3.3", "Parallax Trace"), []);
});

test("missing README fails closed", t => {
  const errors = checkVersionDocumentation(fixture(t, { readme: null }), "3.3", "Parallax Trace");
  assert.ok(errors.some(x => x.includes("README.md must exist")));
});

test("missing CHANGELOG fails closed", t => {
  const errors = checkVersionDocumentation(fixture(t, { changelog: null }), "3.3", "Parallax Trace");
  assert.ok(errors.some(x => x.includes("CHANGELOG.md must exist")));
});

test("stale changelog feature cannot pass with only the correct version number", t => {
  const errors = checkVersionDocumentation(fixture(t, { changelog: "## v3.3 — Another Feature\n" }), "3.3", "Parallax Trace");
  assert.ok(errors.some(x => x.includes("CHANGELOG must begin")));
});

test("non-file changelog cannot bypass the gate", t => {
  const root = fixture(t, { changelog: null });
  fs.mkdirSync(path.join(root, "CHANGELOG.md"));
  const errors = checkVersionDocumentation(root, "3.3", "Parallax Trace");
  assert.ok(errors.some(x => x.includes("must be a regular file")));
});
