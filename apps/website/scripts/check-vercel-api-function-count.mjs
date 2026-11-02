/**
 * Vercel Hobby counts each non-`_` .ts/.js file under /api as a Serverless Function.
 * Keep this at 0 — route handlers live in src/app/api instead.
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

const files = await walk(API_ROOT);
if (files.length > 0) {
  console.error(
    `Found ${files.length} file(s) under api/ that Vercel may treat as Serverless Functions (Hobby limit ${LIMIT}):`,
  );
  for (const f of files) console.error(`  - ${path.relative(process.cwd(), f)}`);
  process.exit(1);
}

console.log("OK: no deployable handlers under api/ (helpers are in api/_lib/).");
