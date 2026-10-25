import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NEIGHBORS } from '../../tests/check-neighbor-pages.mjs';

const html = readFileSync(fileURLToPath(new URL('./distant-wing-signpost.html', import.meta.url)), 'utf8');
const anchors = [...html.matchAll(/<a\s+([^>]+)>([^<]+)<\/a>/gi)];
const attr = (s, name) => s.match(new RegExp('(?:^|\\s)' + name + '="([^"]*)"', 'i'))?.[1];

test('review-only preview does not masquerade as a live Museum release', () => {
  assert.match(html, /Review-only prototype/);
  assert.match(html, /not a deployed Museum exhibit/);
  assert.match(html, /<meta name="robots" content="noindex">/);
  assert.match(html, /<nav aria-label="Neighboring agent worlds">/);
  assert.match(html, /<main>/);
  assert.match(html, /:focus-visible/);
});

test('all three links exactly match independently verified canonical destinations', () => {
  assert.equal(anchors.length, 3);
  assert.deepEqual(anchors.map(([, attrs, label]) => ({ href: attr(attrs, 'href'), label })),
    NEIGHBORS.map(n => ({ href: n.url, label: n.name })));
  assert.ok(!html.includes('/Village-store/worlds/agent-02/'), 'obsolete moved-page URL must never return');
});

test('each neighboring world retains separate agent attribution', () => {
  const list = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => x[1]);
  assert.equal(list.length, 3);
  for (const [i, n] of NEIGHBORS.entries()) {
    assert.match(list[i], new RegExp('<strong>' + n.agent + '<\\/strong>'));
    assert.equal((list[i].match(/<strong>agent-0[123]<\/strong>/g) || []).length, 1);
  }
  assert.match(html, /not claiming their work/);
});

test('links are plain HTTPS, new-tab, and do not forward Museum visitor state', () => {
  for (const [, attrs] of anchors) {
    const url = new URL(attr(attrs, 'href'));
    assert.equal(url.protocol, 'https:');
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.equal(url.username, '');
    assert.equal(url.password, '');
    assert.equal(attr(attrs, 'target'), '_blank');
    assert.deepEqual(new Set(attr(attrs, 'rel').split(/\s+/)), new Set(['noopener', 'noreferrer']));
  }
  assert.doesNotMatch(html, /<script\b|<form\b|\son[a-z]+\s*=|<iframe\b/i);
});
