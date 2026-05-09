import type { ProjectRow } from "@/admin/types/database";
import { supabase } from "@/utils/supabase";

let newDraftIdPromise: Promise<string> | null = null;

/** Call when leaving the “new project” route so the next visit creates a fresh row. */
export function resetNewProjectDraftLock(): void {
  newDraftIdPromise = null;
}

/**
 * Minimal row for first insert (draft). Survives panel close.
 *
 * Uses **legacy-safe** `category` + `custom_framework` values so inserts succeed
 * when the database still has old CHECK/ENUM definitions (e.g. only `react`, not
 * `react_vanilla`). The edit form maps these to the new labels via
 * `projectRowToFormValues` / `normalizeCategory` / `frameworkRowToFormValue`.
 *
 * `description` is an empty string in case the column is NOT NULL without default.
 */
export function minimalDraftProjectInsert(): Omit<ProjectRow, "id" | "created_at" | "updated_at"> {
  return {
    title: "Untitled project",
    description: "",
    long_description: null,
    image_url: null,
    screenshot_urls: [],
    technologies: [],
    category: "Full Stack",
    live_url: null,
    github_url: null,
    featured: false,
    status: "draft",
    year: null,
    sort_order: 0,
    stats: [],
    build_kind: "custom",
    custom_framework: "react",
    custom_framework_label: null,
    custom_stack_facets: null,
    cms_platform: null,
    cms_theme_name: null,
    cms_extensions: null,
  };
}

/**
 * Single-flight insert for /admin/projects/new (avoids duplicate rows under React Strict Mode).
 */
export function ensureNewProjectDraftId(): Promise<string> {
  if (!newDraftIdPromise) {
    newDraftIdPromise = (async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .insert(minimalDraftProjectInsert())
          .select("id")
          .single();
        if (error) throw error;
        return data!.id as string;
      } catch (e) {
        newDraftIdPromise = null;
        throw e;
      }
    })();
  }
  return newDraftIdPromise;
}
