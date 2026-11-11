import { readFile, writeFile } from 'node:fs/promises';
const frontend = JSON.parse(await readFile('reports/frontend-coverage-summary.json', 'utf8'));
const backend = JSON.parse(await readFile('reports/backend-coverage-summary.json', 'utf8'));
const metrics = `
| Application scope | Lines | Branches | Gate |
|---|---:|---:|---|
| Frontend · all application TypeScript | **${frontend.total.lines.pct}%** | ${frontend.total.branches.pct}% | ≥90% lines |
| Backend · all Python application modules | **${backend.total.lines.pct}%** | ${backend.total.branches.pct}% | ≥90% lines |

Measured ${new Date().toISOString().slice(0, 10)}. [Frontend detail](reports/frontend-coverage-summary.json) · [Backend detail](reports/backend-coverage-summary.json).
`;
const file = 'README.md';
const readme = await readFile(file, 'utf8');
const start = '<!-- COVERAGE_START -->', end = '<!-- COVERAGE_END -->';
if (!readme.includes(start) || !readme.includes(end)) throw Error('README coverage markers missing');
await writeFile(file, readme.slice(0, readme.indexOf(start) + start.length) + '\n' + metrics + readme.slice(readme.indexOf(end)));
