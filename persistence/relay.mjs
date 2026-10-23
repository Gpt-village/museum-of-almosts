import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "persistence");
const WINDOW_START = "2026-10-20";
const WINDOW_END = "2026-10-25";
const MINUTES_OPEN = 12 * 60;
const MINUTES_LAST_START = 19 * 60 + 50; // Ten-minute safety margin before 20:00 ET.
const MAX_PER_DAY = 2;
const MAX_TOTAL = 12;

export function easternClock(instant) {
  if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
    throw new TypeError("A valid Date is required");
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(instant);
  const fields = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    day: [fields.year, fields.month, fields.day].join("-"),
    minute: Number(fields.hour) * 60 + Number(fields.minute),
    hour: Number(fields.hour)
  };
}

export function isOperatingWindow(instant) {
  const local = easternClock(instant);
  return local.day >= WINDOW_START && local.day <= WINDOW_END
    && local.minute >= MINUTES_OPEN && local.minute < MINUTES_LAST_START;
}

export function selectNext(queue, state, day) {
  const completed = new Set((state.completed || []).map((entry) => entry.id));
  const daily = (state.completed || []).filter((entry) => entry.day === day).length;
  if (daily >= MAX_PER_DAY || completed.size >= MAX_TOTAL) return null;
  return queue.find((task) => !completed.has(task.id)) || null;
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(DIR, filename), "utf8"));
}

function museumVersion() {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  const match = readme.match(/Current development version:\s*(v\d+\.\d+)/i);
  // Fail before creating a draft when the Museum's provenance cannot be verified.
  // A placeholder version/script would create an invalid checkpoint that the
  // post-run verifier rejects only after the worker has mutated local files.
  if (!match) throw new Error("Museum version preflight failed: README version missing");
  const version = match[1];
  const script = "v" + version.slice(1).replace(".", "").padStart(2, "0") + ".js";
  const scriptPath = path.join(ROOT, script);
  if (!fs.existsSync(scriptPath) || !fs.statSync(scriptPath).isFile()) {
    throw new Error("Museum version preflight failed: version script missing: " + script);
  }
  const digest = createHash("sha256").update(fs.readFileSync(scriptPath)).digest("hex").slice(0, 12);
  return { version, source: script, digest };
}

function renderDraft(task, version, now) {
  return [
    "# " + task.title,
    "",
    "> **Status:** scripted relay draft for human/agent review — not a deployed Museum feature.",
    "> **Authoring:** seeded by agent-04; assembled by a deterministic Node.js worker, not a continuing ChatGPT conversation.",
    "",
    "- **Proposal ID:** " + task.id,
    "- **Location:** " + task.room,
    "- **Created:** " + now.toISOString(),
    "- **Museum README version at creation:** " + version.version,
    "- **Version script:** " + version.source,
    "- **Version-script SHA-256 prefix:** " + version.digest,
    "",
    "## Almost",
    "",
    task.seed,
    "",
    "## Small possible next step",
    "",
    task.experiment,
    "",
    "## Conditions before publication",
    "",
    task.review,
    "",
    "The relay does **not** edit the playable Museum, infer discarded evidence,",
    "call an LLM, publish this proposal, or assert successful verification.",
    "Promotion to the live world requires a separate explicit development and test step.",
    ""
  ].join("\n");
}

function run(now) {
  if (!isOperatingWindow(now)) {
    console.log("Outside GPT Village operating window or after challenge; no changes made.");
    return;
  }
  const { day } = easternClock(now);
  const queue = readJson("tasks.json");
  const state = readJson("state.json");
  if (queue.schema !== 1 || state.schema !== 1 || queue.agent !== "agent-04") {
    throw new Error("Unexpected relay schema or owner");
  }
  if (!Array.isArray(queue.tasks) || !Array.isArray(state.completed)) {
    throw new Error("Malformed relay queue/state");
  }
  const ids = new Set();
  for (const task of queue.tasks) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(task.id) || ids.has(task.id)) {
      throw new Error("Duplicate or unsafe proposal identifier");
    }
    ids.add(task.id);
    for (const key of ["title", "room", "seed", "experiment", "review"]) {
      if (typeof task[key] !== "string" || !task[key].trim()) {
        throw new Error("Malformed proposal: " + task.id);
      }
    }
  }
  const task = selectNext(queue.tasks, state, day);
  if (!task) {
    console.log("Queue idle: daily quota or total bounded tasks exhausted.");
    return;
  }
  const version = museumVersion();
  const draftDirectory = path.join(DIR, "drafts");
  fs.mkdirSync(draftDirectory, { recursive: true });
  const draft = "persistence/drafts/" + task.id + ".md";
  const fullDraft = path.join(ROOT, draft);
  // Refuse to restamp an uncheckpointed draft: recovery needs manual inspection.
  // The draft must be absent before state or journal are changed.
  if (fs.existsSync(fullDraft)) {
    throw new Error("Orphan draft exists without a matching checkpoint: " + draft);
  }
  fs.writeFileSync(fullDraft, renderDraft(task, version, now), { flag: "wx" });
  const entry = {
    id: task.id, day, timestamp: now.toISOString(), draft,
    source: "deterministic relay", museumVersion: version.version
  };
  state.completed.push(entry);
  state.lastCompleted = entry;
  fs.writeFileSync(path.join(DIR, "state.json"), JSON.stringify(state, null, 2) + "\n");
  fs.appendFileSync(path.join(DIR, "journal.jsonl"), JSON.stringify(entry) + "\n");
  console.log("Completed one bounded draft: " + task.id);
}

const command = process.argv[2];
if (command === "run") run(new Date());
else if (command === "gate") {
  if (!isOperatingWindow(new Date())) {
    console.error("Village time boundary blocks repository write.");
    process.exitCode = 1;
  } else {
    console.log("Inside permitted ET write window.");
  }
} else if (command && command !== "test") {
  throw new Error("Usage: node persistence/relay.mjs [run|gate]");
}
