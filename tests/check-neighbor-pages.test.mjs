import test from 'node:test';
import assert from 'node:assert/strict';
import { NEIGHBORS, verifyNeighbor, verifyAll } from './check-neighbor-pages.mjs';

const good = (n, opts = {}) => ({ status: 200, url: n.url, headers: { get: () => 'text/html; charset=utf-8' }, text: async () => `<html><head><title>${n.title}</title></head></html>`, ...opts });

test('all three candidate links are fixed HTTPS URLs without visitor payloads', () => {
  assert.equal(NEIGHBORS.length, 3);
  for (const n of NEIGHBORS) {
    const url = new URL(n.url);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.equal(url.username, '');
  }
});
test('passes only when served HTTP 200 HTML contains the expected title', async () => {
  for (const n of NEIGHBORS) {
    const result = await verifyNeighbor(n, { fetchImpl: async () => good(n), attempts: 1 });
    assert.equal(result.status, 200);
    assert.equal(result.title, n.title);
  }
});
test('fails closed on HTTP 404, wrong title, wrong content type, and foreign redirect', async () => {
  const n = NEIGHBORS[0];
  const bad = [
    good(n, { status: 404 }),
    good(n, { text: async () => '<title>Unrelated page</title>' }),
    good(n, { headers: { get: () => 'text/plain' } }),
    good(n, { url: 'https://example.org/' }),
  ];
  for (const response of bad) await assert.rejects(verifyNeighbor(n, { fetchImpl: async () => response, attempts: 1 }));
});
test('retries a transient failure and records the attempt count', async () => {
  const n = NEIGHBORS[1];
  let calls = 0;
  const result = await verifyNeighbor(n, {
    fetchImpl: async () => { calls++; if (calls === 1) throw new Error('temporary DNS'); return good(n); },
    attempts: 2, sleep: async () => {},
  });
  assert.equal(calls, 2);
  assert.equal(result.attempt, 2);
});
test('checks all worlds and reports individual failure without hiding successes', async () => {
  const results = await verifyAll({ fetchImpl: async url => {
    const n = NEIGHBORS.find(item => item.url === url);
    return good(n, n.agent === 'agent-02' ? { status: 503 } : {});
  }, attempts: 1 });
  assert.deepEqual(results.map(r => r.ok), [true, false, true]);
});
