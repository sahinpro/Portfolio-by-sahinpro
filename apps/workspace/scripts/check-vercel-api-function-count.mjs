/**
 * Vercel counts every route handler under `src/app/api` as a Serverless Function,
 * plus anything it discovers under a top-level `/api` directory.
 *
 * The Admin app serves its whole HTTP API through ONE Next.js catch-all
 * (`src/app/api/[[...route]]/route.ts`) that delegates to the Hono app in
 * `src/server/api`, so there must be no top-level `api/` directory here at all
 * — helpers that need one live under `src/server/api/lib`.
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const API_ROOT = path.join(process.cwd(), "api");
const LIMIT = 12;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith("_")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
      continue;
    }
    if (/\.(t|j)sx?$/.test(entry.name)) files.push(full);
  }
  return files;
}

try {
  await stat(API_ROOT);
} catch {
  console.log("OK: no top-level api/ directory (all routes go through the Hono catch-all).");
  process.exit(0);
}

const files = await walk(API_ROOT);
if (files.length > 0) {
  console.error(
    `Found ${files.length} file(s) under api/ that Vercel may treat as Serverless Functions (Hobby limit ${LIMIT}):`,
  );
  for (const f of files) console.error(`  - ${path.relative(process.cwd(), f)}`);
  process.exit(1);
}

console.log("OK: no deployable handlers under api/.");
