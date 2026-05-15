import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ImageGalleryField } from "@/admin/components/ui/ImageGalleryField";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { TagInput } from "@/admin/components/ui/TagInput";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import {
  CMS_PLATFORM_OPTIONS,
  CUSTOM_FRAMEWORK_OPTIONS,
  PROJECT_CATEGORIES,
} from "@/admin/constants/frameworkFieldConfig";
import { useToast } from "@/admin/context/ToastContext";
import {
  formatSupabaseUserMessage,
  withRlsHint,
} from "@/admin/lib/formatAdminError";
import { listFormErrors, PROJECT_FIELD_LABELS } from "@/admin/lib/formErrors";
import {
  canLenientDraftInsert,
  defaultEmptyProjectForm,
  formValuesToProjectPayload,
  projectRowToFormValues,
  shouldPersistNewProjectDraft,
} from "@/admin/lib/projectMappers";
import {
  projectFormSchema,
  type ProjectFormValues,
} from "@/admin/schemas/projectFormSchema";
import type { ProjectRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Controller,
  type FieldErrors,
  useForm,
  useWatch,
} from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

/**
 * Radix Select must stay controlled: never pass `undefined` for `value` when the
 * form stores "". Use this sentinel so `value` is always a defined string.
 */
const SELECT_NONE = "__none__";

function FieldError({ message }: { message?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <p
      className="mt-1 text-xs text-red-400"
      data-form-field-error="true"
      role="alert"
    >
      {message}
    </p>
  );
}

export function AdminProjectFormPage(): JSX.Element {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNewRoute = !routeId || routeId === "new";
  const [loadingRow, setLoadingRow] = useState(!isNewRoute);
  const persistedRowFields = useRef<{ stats: unknown; year: string | null }>({
    stats: [],
    year: null,
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues: defaultEmptyProjectForm(),
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState,
    getValues,
    trigger,
  } = form;
  const { errors, isSubmitting } = formState;
  const validationIssues = listFormErrors(errors);

  const cmsExtensions = watch("cms_extensions");
  const buildKind = useWatch({ control, name: "build_kind" });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    if (!isNewRoute) return;
    persistedRowFields.current = { stats: [], year: null };
    reset(defaultEmptyProjectForm());
  }, [isNewRoute, reset]);

  useEffect(() => {
    if (isNewRoute || !routeId) return;
    let cancelled = false;
    setLoadingRow(true);
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", routeId)
        .single();
      if (cancelled) return;
      setLoadingRow(false);
      if (error || !data) {
        showToast(withRlsHint(error?.message ?? "Not found"), "error");
        navigate("/admin/projects");
        return;
      }
      const row = data as ProjectRow;
      persistedRowFields.current = {
        stats: row.stats ?? [],
        year: row.year ?? null,
      };
      reset(projectRowToFormValues(row));
    })();
    return () => {
      cancelled = true;
    };
  }, [isNewRoute, routeId, navigate, reset, showToast]);

  const closePanel = useCallback(() => {
    if (loadingRow) {
      navigate("/admin/projects");
      return;
    }

    if (isNewRoute) {
      const raw = getValues();
      if (shouldPersistNewProjectDraft(raw)) {
        if (!canLenientDraftInsert(raw)) {
          showToast("Select a CMS platform to save this draft.", "warning");
          navigate("/admin/projects");
          return;
        }
        void (async () => {
          try {
            const payload = formValuesToProjectPayload(raw, {
              stats: [],
              year: null,
            });
            const { error } = await supabase.from("projects").insert(payload);
            if (error) {
              showToast(
                withRlsHint(
                  formatSupabaseUserMessage(error, "Could not save draft"),
                ),
                "error",
              );
            } else {
              invalidatePublicDataCache();
              showToast("Draft saved", "success");
            }
          } finally {
            navigate("/admin/projects");
          }
        })();
        return;
      }
      navigate("/admin/projects");
      return;
    }

    if (!routeId) {
      navigate("/admin/projects");
      return;
    }

    void (async () => {
      try {
        const values = getValues();
        const payload = formValuesToProjectPayload(values, {
          stats: persistedRowFields.current.stats,
          year: persistedRowFields.current.year,
        });
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", routeId);
        if (error) showToast(withRlsHint(error.message), "error");
        else invalidatePublicDataCache();
      } catch {
        /* still leave the panel */
      } finally {
        navigate("/admin/projects");
      }
    })();
  }, [getValues, isNewRoute, loadingRow, navigate, routeId, showToast]);

  const scrollToFirstFieldError = useCallback((fieldKeys: string[]) => {
    requestAnimationFrame(() => {
      for (const key of fieldKeys) {
        const el = document.querySelector(`[data-field="${key}"]`);
        if (el) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
      }
      document
        .querySelector('[data-form-field-error="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, []);

  const onInvalid = useCallback(
    (fieldErrors: FieldErrors<ProjectFormValues>) => {
      const issues = listFormErrors(fieldErrors);
      if (issues.length === 0) {
        showToast("Fix the highlighted fields below", "error");
        return;
      }
      const summary = issues
        .map(
          (issue) =>
            `${PROJECT_FIELD_LABELS[issue.field] ?? issue.field}: ${issue.message}`,
        )
        .join(" · ");
      showToast(summary, "error");
      scrollToFirstFieldError(issues.map((i) => i.field));
    },
    [scrollToFirstFieldError, showToast],
  );

  const onSubmit = async (values: ProjectFormValues) => {
    if (values.status === "published" && !values.live_url?.trim()) {
      showToast(
        "Published without a live URL — add one when you can.",
        "warning",
      );
    }

    const payload = formValuesToProjectPayload(values, {
      stats: isNewRoute ? [] : persistedRowFields.current.stats,
      year: isNewRoute ? null : persistedRowFields.current.year,
    });

    if (isNewRoute) {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) {
        showToast(withRlsHint(formatSupabaseUserMessage(error)), "error");
        return;
      }
      showToast("Project saved", "success");
      invalidatePublicDataCache();
      navigate("/admin/projects");
      return;
    }

    if (!routeId) return;

    const { error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", routeId);
    if (error) {
      showToast(withRlsHint(error.message), "error");
      return;
    }
    showToast("Project saved", "success");
    invalidatePublicDataCache();
    navigate("/admin/projects");
  };

  if (loadingRow) {
    return (
      <AdminSidePanel
        title="Edit project"
        description="Loading project…"
        onClose={closePanel}
      >
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      </AdminSidePanel>
    );
  }

  return (
    <AdminSidePanel
      title={isNewRoute ? "New project" : "Edit project"}
      description={
        isNewRoute
          ? "Nothing is saved until you add details and save, or close the panel after editing (draft is created only when there are changes)."
          : "Save changes when ready. Featured image is required to publish."
      }
      onClose={closePanel}
    >
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="mx-auto max-w-3xl space-y-8 pb-20"
        noValidate
      >
        {!isNewRoute && status === "trash" ? (
          <div
            className="rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-white/70"
            role="status"
          >
            This project is in{" "}
            <span className="font-medium text-white/90">trash</span> and is
            hidden from the public site. Set status to Draft or Published to
            restore it.
          </div>
        ) : null}

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Project</h2>
          <div data-field="title">
            <label className={labelCls} htmlFor="project-title">
              Title
            </label>
            <Input
              id="project-title"
              className={field}
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>
          <div data-field="description">
            <label className={labelCls} htmlFor="project-description">
              Short description
            </label>
            <Textarea
              id="project-description"
              className={`${field} min-h-[80px]`}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>
          <div
            data-field="image_url"
            className={cn(
              errors.image_url &&
                "rounded-xl ring-1 ring-red-500/40 ring-offset-2 ring-offset-[#111]",
            )}
          >
            <Controller
              name="image_url"
              control={control}
              render={({ field: f }) => (
                <ImageUrlField
                  label="Featured image"
                  value={f.value}
                  onChange={f.onChange}
                  bucket="portfolio-assets"
                  pathPrefix="projects"
                  invalid={Boolean(errors.image_url)}
                />
              )}
            />
            <FieldError message={errors.image_url?.message} />
            {status === "published" ? (
              <p className="mt-1 text-[11px] text-white/35">
                Required for published projects.
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <Controller
              name="category"
              control={control}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger
                    className={field}
                    aria-invalid={Boolean(errors.category)}
                  >
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111] text-white">
                    {PROJECT_CATEGORIES.map((c) => (
                      <SelectItem
                        key={c}
                        value={c}
                        className="focus:bg-white/10"
                      >
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.category?.message} />
          </div>
          <div data-field="screenshot_urls">
            <Controller
              name="screenshot_urls"
              control={control}
              render={({ field: f }) => (
                <ImageGalleryField
                  label="Screenshot gallery (optional)"
                  value={f.value}
                  onChange={f.onChange}
                  bucket="portfolio-assets"
                  pathPrefix="projects/screenshots"
                />
              )}
            />
            <FieldError message={errors.screenshot_urls?.message} />
          </div>
          <div>
            <label className={labelCls} htmlFor="project-live-url">
              Live URL
            </label>
            <Input
              id="project-live-url"
              className={field}
              placeholder="https://"
              {...register("live_url")}
            />
            <FieldError message={errors.live_url?.message} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Build type</h2>
          <Controller
            name="build_kind"
            control={control}
            render={({ field: f }) => (
              <RadioGroup
                value={f.value}
                onValueChange={(v) => {
                  f.onChange(v);
                  if (v === "cms") {
                    setValue("custom_framework", "", { shouldValidate: true });
                    setValue("github_url", "", { shouldValidate: true });
                    setValue("technologies", [], { shouldValidate: true });
                  } else {
                    setValue("cms_platform", "", { shouldValidate: true });
                    setValue("cms_theme_name", "", { shouldValidate: true });
                    setValue("cms_extensions", [""], { shouldValidate: true });
                  }
                  void trigger([
                    "custom_framework",
                    "technologies",
                    "cms_platform",
                    "image_url",
                  ]);
                }}
                className="flex flex-wrap gap-6"
              >
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <RadioGroupItem
                    value="custom"
                    id="build-kind-custom"
                    className="border-white/25 text-white"
                  />
                  Custom code
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <RadioGroupItem
                    value="cms"
                    id="build-kind-cms"
                    className="border-white/25 text-white"
                  />
                  CMS
                </label>
              </RadioGroup>
            )}
          />

          {buildKind === "custom" ? (
            <div className="space-y-4 pt-2 border-t border-white/[0.06]">
              <div data-field="custom_framework">
                <label className={labelCls}>Framework</label>
                <Controller
                  name="custom_framework"
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value ? f.value : SELECT_NONE}
                      onValueChange={(v) =>
                        f.onChange(v === SELECT_NONE ? "" : v)
                      }
                    >
                      <SelectTrigger
                        className={field}
                        aria-invalid={Boolean(errors.custom_framework)}
                      >
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#111] text-white">
                        <SelectItem
                          value={SELECT_NONE}
                          className="focus:bg-white/10 text-white/45"
                        >
                          Select framework…
                        </SelectItem>
                        {CUSTOM_FRAMEWORK_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                            className="focus:bg-white/10"
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.custom_framework?.message} />
              </div>
              <div data-field="technologies">
                <label className={labelCls}>Technologies</label>
                <Controller
                  name="technologies"
                  control={control}
                  render={({ field: f }) => (
                    <TagInput
                      value={f.value}
                      onChange={f.onChange}
                      placeholder="React, TypeScript…"
                    />
                  )}
                />
                <FieldError message={errors.technologies?.message} />
              </div>
              <div>
                <label className={labelCls} htmlFor="project-github">
                  GitHub URL
                </label>
                <Input
                  id="project-github"
                  className={field}
                  placeholder="https://"
                  {...register("github_url")}
                />
                <FieldError message={errors.github_url?.message} />
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-white/[0.06]">
              <div data-field="cms_platform">
                <label className={labelCls}>CMS platform</label>
                <Controller
                  name="cms_platform"
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value ? f.value : SELECT_NONE}
                      onValueChange={(v) =>
                        f.onChange(v === SELECT_NONE ? "" : v)
                      }
                    >
                      <SelectTrigger
                        className={field}
                        aria-invalid={Boolean(errors.cms_platform)}
                      >
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#111] text-white">
                        <SelectItem
                          value={SELECT_NONE}
                          className="focus:bg-white/10 text-white/45"
                        >
                          Select platform…
                        </SelectItem>
                        {CMS_PLATFORM_OPTIONS.map((o) => (
                          <SelectItem
                            key={o.value}
                            value={o.value}
                            className="focus:bg-white/10"
                          >
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.cms_platform?.message} />
              </div>
              <div>
                <label className={labelCls} htmlFor="project-theme">
                  Theme name (optional)
                </label>
                <Input
                  id="project-theme"
                  className={field}
                  {...register("cms_theme_name")}
                />
                <FieldError message={errors.cms_theme_name?.message} />
              </div>
              <div>
                <label className={labelCls}>Plugin names (optional)</label>
                {cmsExtensions.map((_, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      className={field}
                      {...register(`cms_extensions.${index}` as const)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = cmsExtensions.filter(
                          (__, j) => j !== index,
                        );
                        setValue("cms_extensions", next.length ? next : [""], {
                          shouldValidate: true,
                        });
                      }}
                      className="p-2 text-red-400/70"
                      aria-label="Remove plugin row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setValue("cms_extensions", [...cmsExtensions, ""], {
                      shouldValidate: true,
                    })
                  }
                  className="text-xs font-medium text-violet-300"
                >
                  + Add plugin
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Publishing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className={labelCls}>Sort order</label>
              <Input
                type="number"
                className={field}
                {...register("sort_order")}
              />
              <FieldError message={errors.sort_order?.message} />
            </div>
            <Controller
              name="featured"
              control={control}
              render={({ field: f }) => (
                <ToggleSwitch
                  checked={f.value}
                  onChange={f.onChange}
                  label="Featured on site"
                />
              )}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field: f }) => (
                <Select
                  value={f.value ?? "draft"}
                  onValueChange={(v) => {
                    f.onChange(v);
                    void trigger([
                      "image_url",
                      "technologies",
                      "custom_framework",
                      "cms_platform",
                    ]);
                  }}
                >
                  <SelectTrigger
                    className={field}
                    aria-invalid={Boolean(errors.status)}
                  >
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111] text-white">
                    <SelectItem value="draft" className="focus:bg-white/10">
                      Draft
                    </SelectItem>
                    <SelectItem value="published" className="focus:bg-white/10">
                      Published
                    </SelectItem>
                    <SelectItem value="trash" className="focus:bg-white/10">
                      In trash
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.status?.message} />
          </div>
        </section>

        {validationIssues.length > 0 ? (
          <div
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
            role="alert"
          >
            <p className="text-sm font-medium text-red-200">
              Fix before saving:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-200/90">
              {validationIssues.map((issue) => (
                <li key={`${issue.field}-${issue.message}`}>
                  <span className="font-medium text-red-100">
                    {PROJECT_FIELD_LABELS[issue.field] ?? issue.field}
                  </span>
                  : {issue.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving…"
              : isNewRoute
                ? "Save project"
                : "Save changes"}
          </button>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/[0.06]"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminSidePanel>
  );
}
