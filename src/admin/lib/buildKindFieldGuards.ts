export type BuildKindFieldSlice = {
  build_kind: "custom" | "cms";
  custom_framework?: string | null;
  github_url?: string;
  technologies?: string[];
  cms_platform?: string | null;
  cms_theme_name?: string | null;
  cms_extensions?: (string | null)[] | null;
};

export function hasCustomBuildFieldValues(
  values: Pick<
    BuildKindFieldSlice,
    "custom_framework" | "github_url" | "technologies"
  >,
): boolean {
  if ((values.custom_framework ?? "").trim()) return true;
  if (values.github_url?.trim()) return true;
  return (values.technologies ?? []).map((t) => t.trim()).filter(Boolean)
    .length > 0;
}

export function hasCmsBuildFieldValues(
  values: Pick<
    BuildKindFieldSlice,
    "cms_platform" | "cms_theme_name" | "cms_extensions"
  >,
): boolean {
  if ((values.cms_platform ?? "").trim()) return true;
  if ((values.cms_theme_name ?? "").trim()) return true;
  return (values.cms_extensions ?? [])
    .map((e) => (e ?? "").trim())
    .filter(Boolean).length > 0;
}

/** Keep only the field set that matches the selected build type. */
export function stripInactiveBuildFields<T extends BuildKindFieldSlice>(
  values: T,
): T {
  if (values.build_kind === "custom") {
    return {
      ...values,
      cms_platform: "",
      cms_theme_name: "",
      cms_extensions: [""],
    };
  }

  return {
    ...values,
    custom_framework: "",
    github_url: "",
    technologies: [],
  };
}
