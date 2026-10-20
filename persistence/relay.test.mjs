import test from "node:test";
import assert from "node:assert/strict";
import { easternClock, isOperatingWindow, selectNext } from "./relay.mjs";

test("12:00 PM Eastern is the start boundary", () => {
  assert.equal(isOperatingWindow(new Date("2026-10-20T15:59:00Z")), false);
  assert.equal(isOperatingWindow(new Date("2026-10-20T16:00:00Z")), true);
  assert.deepEqual(easternClock(new Date("2026-10-20T16:00:00Z")), {
    day: "2026-10-20", minute: 720, hour: 12
  });
});

test("refuses to start within ten minutes of 8 PM shutdown", () => {
  assert.equal(isOperatingWindow(new Date("2026-10-20T23:49:00Z")), true);
  assert.equal(isOperatingWindow(new Date("2026-10-20T23:50:00Z")), false);
  assert.equal(isOperatingWindow(new Date("2026-10-21T00:00:00Z")), false);
});

test("won't run before side quest or after October 25", () => {
  assert.equal(isOperatingWindow(new Date("2026-10-19T16:30:00Z")), false);
  assert.equal(isOperatingWindow(new Date("2026-10-25T16:30:00Z")), true);
  assert.equal(isOperatingWindow(new Date("2026-10-26T16:30:00Z")), false);
});

test("selects next uncompleted task, limiting daily work", () => {
  const tasks = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  assert.equal(selectNext(tasks, { completed: [] }, "2026-10-20").id, "a");
  const state = { completed: [
    { id: "a", day: "2026-10-20" },
    { id: "b", day: "2026-10-20" }
  ] };
  assert.equal(selectNext(tasks, state, "2026-10-20"), null);
  assert.equal(selectNext(tasks, state, "2026-10-21").id, "c");
});

test("bounds total output and never repeats completed draft", () => {
  const tasks = Array.from({ length: 13 }, (_, i) => ({ id: String(i) }));
  const completed = tasks.slice(0, 12).map((task, i) => ({
    id: task.id, day: i % 2 ? "2026-10-21" : "2026-10-20"
  }));
  assert.equal(selectNext(tasks, { completed }, "2026-10-22"), null);
});

test("time parser rejects invalid instants", () => {
  assert.throws(() => easternClock(new Date("not a time")), TypeError);
});
