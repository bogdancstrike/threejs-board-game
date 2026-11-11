import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import libCoverage from 'istanbul-lib-coverage';
import libReport from 'istanbul-lib-report';
import sourceMaps from 'istanbul-lib-source-maps';
import reports from 'istanbul-reports';
const browser=libCoverage.createCoverageMap({});
for(const name of await readdir('coverage/browser/raw'))browser.merge(JSON.parse(await readFile(`coverage/browser/raw/${name}`,'utf8')));
const mapped=await sourceMaps.createSourceMapStore().transformCoverage(browser);
// Browser instrumentation has one consistent statement/branch map. Mixing Vitest's
// pre-transpile maps with Vite's post-transpile maps doubles branch denominators.
// Report browser coverage independently; unit coverage remains in coverage/unit.
const merged=mapped;
// Explicitly require every application TypeScript file in the denominator.
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(`${dir}/${e.name}`):`${dir}/${e.name}`))).flat();}
const missing=(await files('src')).filter(f=>f.endsWith('.ts')&&!f.endsWith('.d.ts')&&!merged.files().includes(resolve(f)));
if(missing.length)throw new Error('Application files missing from coverage: '+missing.join(', '));
const context=libReport.createContext({dir:'coverage/frontend',coverageMap:merged});
for(const name of ['text','html','json','json-summary','lcovonly'])reports.create(name).execute(context);
const summary=merged.getCoverageSummary().toJSON();
await mkdir('reports',{recursive:true});
const perFile=Object.fromEntries(merged.files().map(f=>[relative(process.cwd(),f),merged.fileCoverageFor(f).toSummary().toJSON()]));
await writeFile('reports/frontend-coverage-summary.json',JSON.stringify({generatedAt:new Date().toISOString(),scope:'All src/**/*.ts; instrumented Chromium browser tests (unit coverage reported separately)',total:summary,files:perFile},null,2)+'\n');
if(summary.lines.pct<90){console.error(`Frontend line coverage ${summary.lines.pct}% is below 90%.`);process.exitCode=1;}
