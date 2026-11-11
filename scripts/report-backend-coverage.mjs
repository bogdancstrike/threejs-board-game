import { readFile, writeFile } from 'node:fs/promises';
const report = JSON.parse(await readFile('reports/backend-coverage.json', 'utf8'));
function summary(s) {
  return {
    lines: { covered: s.covered_lines, total: s.num_statements, pct: s.num_statements ? +(100 * s.covered_lines / s.num_statements).toFixed(2) : 100 },
    branches: { covered: s.covered_branches, total: s.num_branches, pct: s.num_branches ? +(100 * s.covered_branches / s.num_branches).toFixed(2) : 100 },
  };
}
const total = summary(report.totals);
await writeFile('reports/backend-coverage-summary.json', JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'All backend/app Python modules; domain, PostgreSQL, HTTP and WebSocket tests', total, files: Object.fromEntries(Object.entries(report.files).map(([name, file]) => [name, summary(file.summary)])) }, null, 2) + '\n');
console.log(`Backend: ${total.lines.pct}% lines; ${total.branches.pct}% branches.`);
if (total.lines.pct < 90) process.exitCode = 1;
