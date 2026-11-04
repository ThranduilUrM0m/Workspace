#!/usr/bin/env node
// Scoped security audit. `pnpm audit` has no --filter and always reads the
// whole lockfile, so Maxconfort's (out of scope, to be rebuilt) advisories
// would fail every CI run. This keeps only findings whose dependency path
// starts in one of the importers listed below, and fails on any of them at
// or above --level (default: moderate).
//
// Usage: node scripts/audit-scope.mjs [--level low|moderate|high|critical]
import { execFileSync } from 'node:child_process';

const SCOPES = ['projects__Boutaleb__client', 'projects__Boutaleb__server', 'packages__'];
const RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

const levelArg = process.argv.indexOf('--level');
const level = levelArg > -1 ? process.argv[levelArg + 1] : 'moderate';
if (!(level in RANK)) throw new Error(`Unknown level: ${level}`);

let raw;
try {
  raw = execFileSync('pnpm', ['audit', '--prod', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    shell: process.platform === 'win32',
  });
} catch (err) {
  // pnpm audit exits non-zero whenever it finds anything; the JSON is still on stdout.
  raw = err.stdout;
  if (!raw) throw err;
}

const report = JSON.parse(raw);
const hits = [];
for (const adv of Object.values(report.advisories ?? {})) {
  const paths = adv.findings
    .flatMap((f) => f.paths)
    .filter((p) => SCOPES.some((s) => p.startsWith(s)));
  if (paths.length && RANK[adv.severity] >= RANK[level]) {
    hits.push({ severity: adv.severity, module: adv.module_name, url: adv.url, path: paths[0] });
  }
}

if (!hits.length) {
  console.log(`audit-scope: no ${level}+ advisories in Boutaleb or packages/*.`);
  process.exit(0);
}
for (const h of hits) console.log(`${h.severity.padEnd(8)} ${h.module.padEnd(28)} ${h.path}  ${h.url}`);
console.log(`audit-scope: ${hits.length} advisory(ies) at ${level}+ in scope.`);
process.exit(1);
