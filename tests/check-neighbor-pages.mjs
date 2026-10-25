/**
 * Agent-04 signpost preflight: independently check *publicly served* neighbor pages.
 * No visitor data, query parameters, fragments, admission tickets, or tracking.
 * Read-only; this does not publish Museum links or edit other agents' worlds.
 */
import { pathToFileURL } from 'node:url';

export const NEIGHBORS = Object.freeze([
  Object.freeze({ agent: 'agent-01', name: 'The Unfinished Sky', url: 'https://gpt-village.github.io/agent-01-unfinished-sky/', title: 'The Unfinished Sky · agent-01' }),
  Object.freeze({ agent: 'agent-02', name: 'Elsewhere Frequency', url: 'https://minuteandone.github.io/Village-store/worlds/agent-02/', title: 'Elsewhere Frequency — a world by agent-02' }),
  Object.freeze({ agent: 'agent-03', name: 'The Signal Garden', url: 'https://gpt-village.github.io/agent-03-signal-garden/', title: 'The Signal Garden — agent-03' }),
]);

const pause = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const extractTitle = (html) => html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1].replace(/\s+/g, ' ').trim() ?? null;

export async function verifyNeighbor(neighbor, { fetchImpl = fetch, attempts = 3, sleep = pause } = {}) {
  const u = new URL(neighbor.url);
  if (u.protocol !== 'https:' || u.search || u.hash || u.username || u.password) throw new Error(`Unsafe signpost URL for ${neighbor.agent}`);
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetchImpl(neighbor.url, {
        method: 'GET', redirect: 'follow',
        headers: { 'user-agent': 'GPT-Village-agent-04-public-signpost-verifier/1.0' },
        signal: AbortSignal.timeout(12000),
      });
      // A redirect to an unrelated URL is not evidence that the proposed destination exists.
      if (response.url && new URL(response.url).href !== u.href) throw new Error(`Unexpected final URL: ${response.url}`);
      if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers?.get('content-type') ?? '';
      if (!/text\/html/i.test(contentType)) throw new Error(`Unexpected Content-Type: ${contentType || '(missing)'}`);
      const title = extractTitle(await response.text());
      if (title !== neighbor.title) throw new Error(`Wrong HTML title: ${JSON.stringify(title)}; expected ${JSON.stringify(neighbor.title)}`);
      return { agent: neighbor.agent, url: neighbor.url, status: response.status, title, attempt };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000);
    }
  }
  throw new Error(`${neighbor.agent} (${neighbor.url}): ${lastError?.message ?? 'unknown error'}`);
}

export async function verifyAll(options = {}) {
  const results = await Promise.allSettled(NEIGHBORS.map(neighbor => verifyNeighbor(neighbor, options)));
  return results.map((result, i) => result.status === 'fulfilled'
    ? { ok: true, ...result.value }
    : { ok: false, agent: NEIGHBORS[i].agent, url: NEIGHBORS[i].url, error: String(result.reason?.message ?? result.reason) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const results = await verifyAll();
  const checkedAt = new Date().toISOString();
  for (const r of results) console.log(r.ok
    ? `PASS ${r.agent}: HTTP ${r.status}, expected <title> verified, ${r.url} (attempt ${r.attempt})`
    : `FAIL ${r.agent}: ${r.error}`);
  const summary = [
    '## Agent-04: neighboring-world public HTTP signpost preflight',
    '',
    `Checked at: ${checkedAt} (UTC). Read-only; no Museum feature deployed.`,
    '',
    '| World | Result | Public URL |', '| --- | --- | --- |',
    ...results.map(r => `| ${r.agent} | ${r.ok ? 'PASS: HTTP 200 + expected HTML title' : `FAIL: ${r.error.replace(/\|/g, '/')}`} | ${r.url} |`),
    '',
    'A passing HTTP/title check does not establish browser interactivity, endorsement, or a permanent availability guarantee.',
  ].join('\n');
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFileSync } = await import('node:fs');
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  }
  if (results.some(r => !r.ok)) process.exitCode = 1;
}
