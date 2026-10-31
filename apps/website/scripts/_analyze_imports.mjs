import { lstat, readdir, readFile, stat } from "node:fs/promises";
import { statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_ALIASES = {
  "@/admin": "src/admin",
  "@/components": "src/components",
  "@/views": "src/views",
  "@/hooks": "src/hooks",
  "@/lib": "src/lib",
  "@/constants": "src/constants",
  "@/utils": "src/utils",
  "@/data": "src/data",
  "@/screens": "src/screens",
  "@/theme": "src/theme",
  "@/app": "src/app",
  "@": "src",
};

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(e.name)) yield full;
  }
}

const files = [];
for (const d of ["src", "api", "scripts"]) {
  try {
    await stat(path.join(ROOT, d));
    for await (const f of walk(path.join(ROOT, d))) files.push(f);
  } catch {}
}

function bucketOf(rel) {
  const p = rel.split("/");
  if (p[0] === "src") {
    if (p[1] === "app") return rel.startsWith("src/app/admin") ? "src/app/admin" : rel.startsWith("src/app/api") ? "src/app/api" : "src/app/public";
    return p.slice(0, p[1] === "admin" || p[1] === "components" || p[1] === "screens" || p[1] === "views" ? 3 : 2).join("/");
  }
  return p.slice(0, 2).join("/");
}

const re = /(?:from\s+|import\s+|export\s+\*?\s*from\s+)(?:type\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;

function resolveSpec(fromFile, spec) {
  if (spec.startsWith("@/")) {
    for (const [k, v] of Object.entries(SRC_ALIASES)) {
      if (spec === k || spec.startsWith(k + "/")) {
        const rest = spec === k ? "" : spec.slice(k.length + 1);
        return tryExt(path.join(ROOT, v, rest));
      }
    }
    return null;
  }
  if (spec.startsWith(".")) {
    return tryExt(path.resolve(path.dirname(fromFile), spec));
  }
  return null;
}

const exts = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.tsx", ".css"];
function tryExt(p) {
  for (const e of exts) {
    const c = p + e;
    try {
      const s = statSync(c);
      if (s.isFile()) return c;
    } catch {}
  }
  return null;
}

// module -> Set(importer buckets)
const importersByModule = new Map();
for (const f of files) {
  const rel = path.relative(ROOT, f);
  if (rel.endsWith(".test.ts")) continue;
  const txt = await readFile(f, "utf8");
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(txt))) {
    const spec = m[1] || m[2];
    if (!spec) continue;
    const target = resolveSpec(f, spec);
    if (!target) continue;
    const trel = path.relative(ROOT, target);
    if (!/\.(ts|tsx)$/.test(trel)) continue;
    if (!importersByModule.has(trel)) importersByModule.set(trel, new Map());
    const b = bucketOf(rel);
    const map = importersByModule.get(trel);
    map.set(b, (map.get(b) || 0) + 1);
  }
}

const rows = [];
for (const [mod, buckets] of importersByModule) {
  const distinct = [...buckets.keys()].sort();
  const groupBuckets = new Set();
  for (const b of distinct) {
    if (b.startsWith("src/admin")) groupBuckets.add("ADMIN");
    else if (b.startsWith("api/")) groupBuckets.add("API");
    else if (b.startsWith("src/app/admin")) groupBuckets.add("ADMINROUTE");
    else if (b.startsWith("src/app/api")) groupBuckets.add("APIROUTE");
    else groupBuckets.add("SITE");
  }
  rows.push({
    mod,
    n: [...buckets.values()].reduce((a, c) => a + c, 0),
    groups: [...groupBuckets].sort().join(","),
    buckets: distinct.join(" "),
  });
}
rows.sort((a, b) => b.n - a.n);
console.log("total modules imported:", rows.length);
for (const r of rows) {
  if (r.n < 2) continue;
  console.log(`${String(r.n).padStart(3)} [${r.groups}] ${r.mod}`);
}
