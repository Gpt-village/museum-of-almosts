import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

// Exercise the real v0.2 ticket functions with isolated browser-like storage.
// This is a source-level unit harness, NOT a full browser/network privacy audit.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "v02.js"), "utf8");
const functions = ["encodeTicket", "decodeTicket", "importTicketFromURL", "shareTicketURL"];
const boundaries = [...functions.map(name => "\n  function " + name + "("),
  '\n  document.getElementById("copyCode")'];
const positions = boundaries.map(marker => source.indexOf(marker));
assert.ok(positions.every((position, i) => position >= 0 && (i === 0 || position > positions[i - 1])),
  "Ticket functions must remain discoverable in the real v02.js source");
const implementation = source.slice(positions[0], positions.at(-1));

function harness(initialState = {}, href = "https://museum.example/") {
  const STORAGE_KEY = "agent04-museum-of-almosts-v1";
  const COATCHECK_KEY = "agent04-museum-of-almosts-coatcheck-v1";
  const data = new Map([[STORAGE_KEY, JSON.stringify(initialState)]]);
  const localStorage = {
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, String(value)); }
  };
  let reloads = 0;
  const location = { href, reload() { reloads += 1; } };
  const history = {
    replaceState(_state, _title, url) { location.href = new URL(url, location.href).toString(); }
  };
  const toasts = [];
  const readState = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const deps = {
    STORAGE_KEY, COATCHECK_KEY, localStorage, location, history,
    rawSet: localStorage.setItem, readState,
    showToast: message => toasts.push(message),
    roomTitles: { vestibule: "Vestibule", archive: "Archive" },
    allowedExhibitIds: new Set(["directory", "weatherJar"]),
    allowedFragments: new Set(["direction", "forecast"]),
    allowedWeather: new Set(["drizzle", "amber", "snow"]),
    echoes: [{ id: "doubleHouse" }],
    overlay: { echoes: [], path: ["vestibule"] },
    unique: values => [...new Set(values)],
    enhancedVisitCode: () => "A04-TEST-12345"
  };
  const api = new Function("deps", `
    const { STORAGE_KEY, COATCHECK_KEY, localStorage, location, history,
      rawSet, readState, showToast, roomTitles, allowedExhibitIds,
      allowedFragments, allowedWeather, echoes, overlay, unique,
      enhancedVisitCode } = deps;
    ${implementation}
    return { encodeTicket, decodeTicket, importTicketFromURL, shareTicketURL };
  `)(deps);
  return { api, data, location, toasts, get reloads() { return reloads; },
    saved: () => JSON.parse(data.get(STORAGE_KEY)) };
}

test("explicit admission URL contains readable encoded choices, not encryption", () => {
  const h = harness({
    room: "archive", exhibitStates: { directory: 2, unexpected: 5 },
    fragments: ["direction"], visited: ["vestibule", "archive"],
    weather: "amber", seed: 42, changes: 3
  });
  const url = new URL(h.api.shareTicketURL());
  const token = url.searchParams.get("ticket");
  assert.ok(token, "share URL must contain ticket query parameter");
  const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  assert.equal(payload.room, "archive");
  assert.equal(payload.exhibitStates.directory, 2);
  assert.equal(payload.exhibitStates.unexpected, undefined);
  assert.equal(payload.weather, "amber");
  assert.equal(payload.sourceCode, "A04-TEST-12345");
  assert.equal(h.reloads, 0, "export alone must not import/reload");
});

test("opening a valid URL replaces current save and backs up meaningful previous visit", () => {
  const ticket = harness({ room: "archive", exhibitStates: { directory: 1 },
    visited: ["vestibule", "archive"], changes: 4 }).api.shareTicketURL();
  const old = { room: "vestibule", changes: 2, visited: ["vestibule", "weather"] };
  const h = harness(old, ticket);
  assert.equal(h.api.importTicketFromURL(), true);
  assert.equal(h.saved().room, "archive");
  assert.equal(h.saved().ticketImported, true);
  assert.equal(h.saved().foreignCatalog.sourceCode, "A04-TEST-12345");
  assert.deepEqual(JSON.parse(h.data.get("agent04-museum-of-almosts-coatcheck-v1")), old);
  assert.equal(h.reloads, 1);
  assert.equal(new URL(h.location.href).searchParams.has("ticket"), false);
});

test("opening a valid URL with empty local save does not promise a coat-check backup", () => {
  const ticket = harness({ room: "archive" }).api.shareTicketURL();
  const h = harness({}, ticket);
  assert.equal(h.api.importTicketFromURL(), true);
  assert.equal(h.saved().room, "archive");
  assert.equal(h.data.has("agent04-museum-of-almosts-coatcheck-v1"), false);
});

test("invalid ticket cannot overwrite current save or trigger reload", () => {
  const original = { room: "vestibule", changes: 5 };
  const h = harness(original, "https://museum.example/?ticket=bad-ticket");
  assert.equal(h.api.importTicketFromURL(), false);
  assert.deepEqual(h.saved(), original);
  assert.equal(h.reloads, 0);
  assert.equal(new URL(h.location.href).searchParams.has("ticket"), false);
  assert.match(h.toasts.join(" "), /not recognized/);
});
