"use client";

import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ImageGalleryField } from "@/admin/components/ui/ImageGalleryField";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { TagInput } from "@/admin/components/ui/TagInput";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import {
  categoriesForBuildKind,
  CMS_PLATFORM_OPTIONS,
  CUSTOM_FRAMEWORK_OPTIONS,
  isFullStackFormCategory,
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
import type { ProjectRow, TestimonialRow } from "@/admin/types/database";
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
import { ProjectTestimonialCard } from "@/components/projects/ProjectTestimonialCard";
import { invalidateProjectsPublicCache } from "@/lib/publicDataCache";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Controller,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";

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

export function AdminProjectFormPage({
  projectId,
}: {
  projectId?: string;
}): JSX.Element {
  const routeId = projectId;
  const router = useRouter();
  const { showToast } = useToast();
  const isNewRoute = !routeId || routeId === "new";
  const [loadingRow, setLoadingRow] = useState(!isNewRoute);
  const [assignedTestimonial, setAssignedTestimonial] =
    useState<TestimonialRow | null>(null);
  /** Sync mutex — blocks double submit / close-save before React re-renders. */
  const mutationLockRef = useRef(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const persistedRowFields = useRef<{ stats: unknown }>({
    stats: [],
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
  const saving = mutationBusy || isSubmitting;
  const validationIssues = listFormErrors(errors);

  const beginMutation = useCallback((): boolean => {
    if (mutationLockRef.current) return false;
    mutationLockRef.current = true;
    setMutationBusy(true);
    return true;
  }, []);

  const endMutation = useCallback(() => {
    mutationLockRef.current = false;
    setMutationBusy(false);
  }, []);

  const cmsExtensions = watch("cms_extensions");
  const metrics = watch("metrics");
  const buildKind = useWatch({ control, name: "build_kind" });
  const status = useWatch({ control, name: "status" });
  const categoryOptions = categoriesForBuildKind(buildKind ?? "custom");

  useEffect(() => {
    if (!isNewRoute) return;
    persistedRowFields.current = { stats: [] };
    reset(defaultEmptyProjectForm());
    setAssignedTestimonial(null);
  }, [isNewRoute, reset]);

  useEffect(() => {
    if (isNewRoute || !routeId) return;
    let cancelled = false;
    setLoadingRow(true);
    (async () => {
      const [{ data, error }, testimonialRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", routeId).single(),
        supabase
          .from("testimonials")
          .select("*")
          .eq("project_id", routeId)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      setLoadingRow(false);
      if (error || !data) {
        showToast(withRlsHint(error?.message ?? "Not found"), "error");
        router.replace("/admin/projects");
        return;
      }
      const row = data as ProjectRow;
      persistedRowFields.current = {
        stats: row.stats ?? [],
      };
      reset(projectRowToFormValues(row));
      setAssignedTestimonial(
        testimonialRes.error
          ? null
          : ((testimonialRes.data as TestimonialRow | null) ?? null),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [isNewRoute, routeId, router.replace, reset, showToast]);

  const closePanel = useCallback(() => {
    if (mutationLockRef.current) return;

    if (loadingRow) {
      router.replace("/admin/projects");
      return;
    }

    if (isNewRoute) {
      const raw = getValues();
      if (shouldPersistNewProjectDraft(raw)) {
        if (!canLenientDraftInsert(raw)) {
          showToast(
            "Complete required fields and choose a valid category for this build type.",
            "warning",
          );
          router.replace("/admin/projects");
          return;
        }
        if (!beginMutation()) return;
        void (async () => {
          try {
            const payload = formValuesToProjectPayload(raw, {
              stats: [],
            });
            const { error } = await supabase.from("projects").insert(payload);
            if (error) {
              showToast(
                withRlsHint(
                  formatSupabaseUserMessage(error, "Could not save draft"),
                ),
                "error",
              );
              endMutation();
              return;
            }
            void invalidateProjectsPublicCache();
            showToast("Draft saved", "success");
            router.replace("/admin/projects");
          } catch {
            endMutation();
            router.replace("/admin/projects");
          }
        })();
        return;
      }
      router.replace("/admin/projects");
      return;
    }

    if (!routeId) {
      router.replace("/admin/projects");
      return;
    }

    if (!beginMutation()) return;
    void (async () => {
      try {
        const values = getValues();
        const payload = formValuesToProjectPayload(values, {
          stats: persistedRowFields.current.stats,
        });
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", routeId);
        if (error) showToast(withRlsHint(error.message), "error");
        else void invalidateProjectsPublicCache();
      } catch {
        /* still leave the panel */
      } finally {
        router.replace("/admin/projects");
      }
    })();
  }, [
    beginMutation,
    endMutation,
    getValues,
    isNewRoute,
    loadingRow,
    router.replace,
    routeId,
    showToast,
  ]);

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
      endMutation();
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
    [endMutation, scrollToFirstFieldError, showToast],
  );

  const onSubmit = async (values: ProjectFormValues) => {
    // Lock is already held by the form submit gate.
    try {
      if (values.status === "published" && !values.live_url?.trim()) {
        showToast(
          "Published without a live URL — add one when you can.",
          "warning",
        );
      }

      const payload = formValuesToProjectPayload(values, {
        stats: isNewRoute ? [] : persistedRowFields.current.stats,
      });

      if (isNewRoute) {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) {
          showToast(withRlsHint(formatSupabaseUserMessage(error)), "error");
          endMutation();
          return;
        }
        showToast(
          values.status === "published" ? "Project published" : "Draft saved",
          "success",
        );
        const cacheResult = await invalidateProjectsPublicCache();
        if (!cacheResult.ok) {
          showToast(
            "Public site may still show old data — use “Flush site cache” on the Projects list.",
            "warning",
          );
        }
        router.replace("/admin/projects");
        return;
      }

      if (!routeId) {
        endMutation();
        return;
      }

      const { error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", routeId);
      if (error) {
        showToast(withRlsHint(error.message), "error");
        endMutation();
        return;
      }
      showToast(
        values.status === "published" ? "Project published" : "Draft saved",
        "success",
      );
      const cacheResult = await invalidateProjectsPublicCache();
      if (!cacheResult.ok) {
        showToast(
          "Public site may still show old data — use “Flush site cache” on the Projects list.",
          "warning",
        );
      }
      router.replace("/admin/projects");
    } catch {
      showToast("Could not save project. Try again.", "error");
      endMutation();
    }
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!beginMutation()) return;
    void handleSubmit(onSubmit, onInvalid)(event);
  };

  if (loadingRow) {
    return (
      <AdminSidePanel
        title="Edit project"
        description="Loading project…"
        onClose={closePanel}
        busy={saving}
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
      busy={saving}
    >
      <form
        onSubmit={onFormSubmit}
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
          <div data-field="role_label">
            <label className={labelCls} htmlFor="project-role-label">
              Role attribution (optional)
            </label>
            <Input
              id="project-role-label"
              className={field}
              aria-invalid={Boolean(errors.role_label)}
              {...register("role_label")}
            />
            <p className="mt-1 text-[11px] text-white/35">
              e.g. &apos;Sole Developer — built while employed at We Next
              Coder&apos; or &apos;Independent freelance&apos;
            </p>
            <FieldError message={errors.role_label?.message} />
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
                    {categoryOptions.map((c) => (
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
          <h2 className="text-sm font-semibold text-white">Case Study</h2>
          <p className="text-[11px] text-white/35">
            Optional. Each field appears on the project page only when it has
            content. The short description stays.
          </p>
          <div data-field="case_study">
            <label className={labelCls} htmlFor="project-case-problem">
              Problem
            </label>
            <Textarea
              id="project-case-problem"
              className={`${field} min-h-[80px]`}
              aria-invalid={Boolean(errors.case_study?.problem)}
              {...register("case_study.problem")}
            />
            <FieldError message={errors.case_study?.problem?.message} />
          </div>
          <div>
            <label className={labelCls} htmlFor="project-case-solution">
              Solution
            </label>
            <Textarea
              id="project-case-solution"
              className={`${field} min-h-[80px]`}
              aria-invalid={Boolean(errors.case_study?.solution)}
              {...register("case_study.solution")}
            />
            <FieldError message={errors.case_study?.solution?.message} />
          </div>
          <div>
            <label className={labelCls} htmlFor="project-case-result">
              Result
            </label>
            <Textarea
              id="project-case-result"
              className={`${field} min-h-[80px]`}
              aria-invalid={Boolean(errors.case_study?.result)}
              {...register("case_study.result")}
            />
            <FieldError message={errors.case_study?.result?.message} />
          </div>
          <div data-field="metrics">
            <label className={labelCls}>Metrics (optional)</label>
            <p className="mb-2 text-[11px] text-white/35">
              A label and a value, such as Mobile PageSpeed and 38 to 91.
              Blank rows are not saved.
            </p>
            {(metrics ?? []).map((_, index) => (
              <div key={index} className="mb-2 flex gap-2">
                <Input
                  className={field}
                  placeholder="Label"
                  aria-label={`Metric ${index + 1} label`}
                  {...register(`metrics.${index}.label` as const)}
                />
                <Input
                  className={field}
                  placeholder="Value"
                  aria-label={`Metric ${index + 1} value`}
                  {...register(`metrics.${index}.value` as const)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setValue(
                      "metrics",
                      (metrics ?? []).filter((__, j) => j !== index),
                      { shouldValidate: true },
                    );
                  }}
                  className="p-2 text-red-400/70"
                  aria-label="Remove metric"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setValue(
                  "metrics",
                  [...(metrics ?? []), { label: "", value: "" }],
                  { shouldValidate: true },
                )
              }
              className="text-xs font-medium text-violet-300"
            >
              + Add metric
            </button>
            <FieldError message={errors.metrics?.message} />
          </div>
          <div data-field="before_image">
            <Controller
              name="before_image"
              control={control}
              render={({ field: f }) => (
                <ImageUrlField
                  label="Before image (optional)"
                  value={f.value}
                  onChange={f.onChange}
                  bucket="portfolio-assets"
                  pathPrefix="projects/before-after"
                />
              )}
            />
            <FieldError message={errors.before_image?.message} />
          </div>
          <div data-field="after_image">
            <Controller
              name="after_image"
              control={control}
              render={({ field: f }) => (
                <ImageUrlField
                  label="After image (optional)"
                  value={f.value}
                  onChange={f.onChange}
                  bucket="portfolio-assets"
                  pathPrefix="projects/before-after"
                />
              )}
            />
            <FieldError message={errors.after_image?.message} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Testimonial</h2>
          <p className="text-[11px] text-white/35">
            Optional quote stored on this project. It appears on the project
            page only when the quote is filled. If these fields are empty, an
            assigned testimonial from Testimonials is used instead.
          </p>
          <div data-field="testimonial_quote">
            <label className={labelCls} htmlFor="project-testimonial-quote">
              Quote
            </label>
            <Textarea
              id="project-testimonial-quote"
              className={`${field} min-h-[80px]`}
              aria-invalid={Boolean(errors.testimonial_quote)}
              {...register("testimonial_quote")}
            />
            <FieldError message={errors.testimonial_quote?.message} />
          </div>
          <div data-field="testimonial_author">
            <label className={labelCls} htmlFor="project-testimonial-author">
              Author
            </label>
            <Input
              id="project-testimonial-author"
              className={field}
              aria-invalid={Boolean(errors.testimonial_author)}
              {...register("testimonial_author")}
            />
            <FieldError message={errors.testimonial_author?.message} />
          </div>
          <div data-field="testimonial_role">
            <label className={labelCls} htmlFor="project-testimonial-role">
              Role
            </label>
            <Input
              id="project-testimonial-role"
              className={field}
              aria-invalid={Boolean(errors.testimonial_role)}
              {...register("testimonial_role")}
            />
            <FieldError message={errors.testimonial_role?.message} />
          </div>
          <p className="text-[11px] text-white/35">
            You can still assign a quote from Testimonials. That quote is used
            only when the fields above are empty.
          </p>
          {assignedTestimonial?.quote ? (
            <div className="space-y-3">
              <ProjectTestimonialCard
                className="md:pl-0"
                testimonial={{
                  quote: assignedTestimonial.quote,
                  clientName: assignedTestimonial.client_name,
                  clientRole: assignedTestimonial.client_role ?? undefined,
                  clientPhoto: assignedTestimonial.client_photo ?? undefined,
                }}
              />
              <Link
                href={`/admin/testimonials/${assignedTestimonial.id}`}
                className="inline-flex text-xs font-medium text-[#00BB7D] hover:text-[#00d68a]"
              >
                Edit assigned testimonial
              </Link>
            </div>
          ) : (
            <p className="text-sm text-white/45">
              {isNewRoute
                ? "Save this project first, then assign a testimonial to it."
                : "No testimonial assigned yet."}
            </p>
          )}
          <Link
            href="/admin/testimonials"
            className="inline-flex text-xs font-medium text-white/55 underline-offset-2 hover:text-white hover:underline"
          >
            Manage testimonials
          </Link>
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
                    if (isFullStackFormCategory(getValues("category"))) {
                      setValue("category", categoriesForBuildKind("cms")[0], {
                        shouldValidate: true,
                      });
                    }
                  } else {
                    setValue("cms_platform", "", { shouldValidate: true });
                    setValue("cms_theme_name", "", { shouldValidate: true });
                    setValue("cms_extensions", [""], { shouldValidate: true });
                    if (!isFullStackFormCategory(getValues("category"))) {
                      setValue(
                        "category",
                        categoriesForBuildKind("custom")[0],
                        {
                          shouldValidate: true,
                        },
                      );
                    }
                  }
                  void trigger([
                    "build_kind",
                    "category",
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
          <FieldError message={errors.build_kind?.message} />

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
                {(cmsExtensions ?? []).map((_, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      className={field}
                      {...register(`cms_extensions.${index}` as const)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (cmsExtensions ?? []).filter(
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
                    setValue("cms_extensions", [...(cmsExtensions ?? []), ""], {
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
            disabled={saving}
            aria-busy={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {status === "published" ? "Publishing…" : "Saving…"}
              </>
            ) : isNewRoute ? (
              "Save project"
            ) : (
              "Save changes"
            )}
          </button>
          <button
            type="button"
            onClick={closePanel}
            disabled={saving}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminSidePanel>
  );
}
