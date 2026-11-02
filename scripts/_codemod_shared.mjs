/**
 * One-off codemod for the monorepo shared-package extraction.
 * Rewrites import specifiers in apps/website/**  and packages/shared/**.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const APP_MAP = {
  "@/lib/utils": "@sahinpro/shared/utils",
  "@/lib/env": "@sahinpro/shared/env",
  "@/utils/supabase": "@sahinpro/shared/supabase",
  "@/lib/revalidate": "@sahinpro/shared/revalidate",
  "@/lib/pagination": "@sahinpro/shared/pagination",
  "@/lib/siteMode": "@sahinpro/shared/siteMode",
  "@/lib/publicFileReachable": "@sahinpro/shared/publicFileReachable",
  "@/lib/resumeStorage": "@sahinpro/shared/resumeStorage",
  "@/constants/placeholders": "@sahinpro/shared/placeholders",
  "@/admin/lib/authHelpers": "@sahinpro/shared/auth",
  "@/admin/lib/slug": "@sahinpro/shared/slug",
  "@/admin/types/database": "@sahinpro/shared/types/database",
  "@/admin/constants/frameworkFieldConfig": "@sahinpro/shared/frameworkFields",
  "@/components/common/PageSpinner": "@sahinpro/shared/PageSpinner",
  "@/components/comingSoon/ComingSoonDisplay":
    "@sahinpro/shared/ComingSoonDisplay",
  "@/components/projects/ProjectTestimonialCard":
    "@sahinpro/shared/ProjectTestimonialCard",
  "@/lib/publicDataCache": "@sahinpro/shared/publicDataCache",
};

const SHARED_UI = [
  "button",
  "card",
  "checkbox",
  "input",
  "label",
  "ListPagination",
  "popover",
  "PublicImage",
  "scroll-area",
  "select",
  "separator",
  "textarea",
];
for (const name of SHARED_UI) {
  APP_MAP[`@/components/ui/${name}`] = `@sahinpro/shared/ui/${name}`;
}

/** Files that keep the CMS form mappers instead of the shared row parsers. */
const APP_FILE_OVERRIDES = {
  "src/data/projectUiMapper.ts": {
    "@/admin/lib/projectMappers": "@sahinpro/shared/projectRowParsers",
  },
  "src/data/publicSupabase.ts": {
    "@/admin/lib/projectMappers": "@sahinpro/shared/projectRowParsers",
  },
};

const SHARED_MAP = {
  "@/lib/utils": "./utils",
  "@/lib/env": "./env",
  "@/utils/supabase": "./supabase",
  "@/lib/revalidate": "./revalidate",
  "@/lib/pagination": "./pagination",
  "@/lib/siteMode": "./siteMode",
  "@/lib/publicFileReachable": "./publicFileReachable",
  "@/lib/resumeStorage": "./resumeStorage",
  "@/constants/placeholders": "./placeholders",
  "@/admin/lib/authHelpers": "./auth",
  "@/admin/lib/slug": "./slug",
  "@/admin/types/database": "./types/database",
  "@/admin/constants/frameworkFieldConfig": "./frameworkFields",
  "@/components/ui/slot": "./ui/slot",
};
for (const name of SHARED_UI) {
  SHARED_MAP[`@/components/ui/${name}`] = `./ui/${name}`;
}
SHARED_MAP["@/components/common/PageSpinner"] = "./PageSpinner";
SHARED_MAP["@/components/comingSoon/ComingSoonDisplay"] = "./ComingSoonDisplay";
SHARED_MAP["@/components/projects/ProjectTestimonialCard"] =
  "./ProjectTestimonialCard";

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx)$/.test(e.name)) yield full;
  }
}

let changed = 0;
for (const file of walk(path.join(ROOT, "apps/website"))) {
  const rel = path.relative(path.join(ROOT, "apps/website"), file);
  const map = { ...APP_MAP, ...(APP_FILE_OVERRIDES[rel] || {}) };
  const src = readFileSync(file, "utf8");
  let out = src;
  for (const [from, to] of Object.entries(map)) {
    out = out.split(`"${from}"`).join(`"${to}"`);
    out = out.split(`'${from}'`).join(`'${to}'`);
    out = out.split(`"${from}/`).join(`"${to}/`);
  }
  if (out !== src) {
    writeFileSync(file, out);
    changed++;
  }
}

for (const file of walk(path.join(ROOT, "packages/shared/src"))) {
  const rel = path.relative(path.join(ROOT, "packages/shared/src"), file);
  const depth = rel.split("/").length - 1;
  const prefix = depth > 0 ? "../" : "./";
  const src = readFileSync(file, "utf8");
  let out = src;
  for (const [from, toBase] of Object.entries(SHARED_MAP)) {
    const to = toBase.startsWith("./") ? prefix + toBase.slice(2) : toBase;
    out = out.split(`"${from}"`).join(`"${to}"`);
    out = out.split(`'${from}'`).join(`'${to}'`);
  }
  if (out !== src) {
    writeFileSync(file, out);
    changed++;
  }
}

console.log("files changed:", changed);
void statSync;
