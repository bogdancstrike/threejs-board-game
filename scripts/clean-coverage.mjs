import { rm } from 'node:fs/promises';
// Never combine execution counters from different source revisions or old runs.
await rm('coverage', { recursive: true, force: true });
