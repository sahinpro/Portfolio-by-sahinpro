/**
 * Temporary migration tool: dependency closure for the Admin carve-out.
 * Roots = src/app/admin/** + src/admin/**. Prints reachable modules that live
 * OUTSIDE those roots, with the first admin-side importer that pulls them in.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const APP = path.resolve(process.argv[2] ?? "apps/website");
const SRC = path.join(APP, "src");

const ADMIN_DIRS = [path.join(SRC, "admin"), path.join(SRC, "app", "admin")];

const ALIASES = [
  ["@/admin/", path.join(SRC, "admin") + "/"],
  ["@/components/", path.join(SRC, "components") + "/"],
  ["@/views/", path.join(SRC, "views") + "/"],
  ["@/hooks/", path.join(SRC, "hooks") + "/"],
  ["@/lib/", path.join(SRC, "lib") + "/"],
  ["@/constants/", path.join(SRC, "constants") + "/"],
  ["@/utils/", path.join(SRC, "utils") + "/"],
  ["@/", SRC + "/"],
];

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(e.name)) yield full;
  }
}

function specifiers(file) {
  const src = readFileSync(file, "utf8");
  const out = new Set();
  const re = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src))) out.add(m[1]);
  const sideEffect = /import\s*["']([^"']+)["']/g;
  while ((m = sideEffect.exec(src))) out.add(m[1]);
  return [...out];
}

function resolve(fromFile, spec) {
  let base = null;
  if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else {
    for (const [prefix, target] of ALIASES) {
      if (spec.startsWith(prefix)) {
        base = path.join(target, spec.slice(prefix.length));
        break;
      }
    }
  }
  if (!base) return null; // bare package / @sahinpro/shared
  for (const cand of [
    base + ".ts",
    base + ".tsx",
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    if (existsSync(cand) && statSync(cand).isFile()) return cand;
  }
  return { unresolved: spec, from: fromFile };
}

const isAdmin = (f) => ADMIN_DIRS.some((d) => f.startsWith(d));

const seen = new Map(); // file -> first admin importer
const queue = [];
const unresolved = [];
for (const dir of ADMIN_DIRS) for (const f of walk(dir)) queue.push(f);

const roots = new Set(queue);
for (const f of queue) seen.set(f, null);

while (queue.length) {
  const file = queue.shift();
  for (const spec of specifiers(file)) {
    const r = resolve(file, spec);
    if (!r) continue;
    if (typeof r === "object") {
      if (!r.unresolved.startsWith("@sahinpro/shared")) unresolved.push(r);
      continue;
    }
    if (seen.has(r)) continue;
    seen.set(r, file);
    queue.push(r);
  }
}

const external = [...seen.keys()].filter((f) => !isAdmin(f) && !roots.has(f));
const rel = (f) => path.relative(APP, f);

console.log(`admin roots: ${roots.size} files`);
console.log(`reachable outside admin: ${external.length} files\n`);
for (const f of external.sort((a, b) => rel(a).localeCompare(rel(b)))) {
  console.log(`${rel(f)}   <- ${rel(seen.get(f))}`);
}
if (unresolved.length) {
  console.log("\nUNRESOLVED:");
  for (const u of unresolved) console.log(`  ${u.unresolved} <- ${rel(u.from)}`);
}
