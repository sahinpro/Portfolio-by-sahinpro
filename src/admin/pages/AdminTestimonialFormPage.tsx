"use client";

import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { useToast } from "@/admin/context/ToastContext";
import {
  formatSupabaseUserMessage,
  withRlsHint,
} from "@/admin/lib/formatAdminError";
import { listFormErrors } from "@/admin/lib/formErrors";
import {
  clearOtherAssignments,
  defaultEmptyTestimonialForm,
  formValuesToTestimonialPayload,
  testimonialRowToFormValues,
} from "@/admin/lib/testimonialMappers";
import {
  testimonialFormSchema,
  type TestimonialFormValues,
} from "@/admin/schemas/testimonialFormSchema";
import type { ProjectRow, TestimonialRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProjectTestimonialCard } from "@/components/projects/ProjectTestimonialCard";
import { invalidateTestimonialsPublicCache } from "@/lib/publicDataCache";
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";
const SELECT_NONE = "__none__";

const FIELD_LABELS: Record<string, string> = {
  quote: "Quote",
  client_name: "Client name",
  client_role: "Client role",
  client_photo: "Client photo",
  project_id: "Assigned project",
};

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

export function AdminTestimonialFormPage({
  testimonialId,
}: {
  testimonialId?: string;
}): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const isNewRoute = !testimonialId;
  const [loadingRow, setLoadingRow] = useState(!isNewRoute);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: defaultEmptyTestimonialForm(),
  });
  const assignedProjectId = useWatch({ control, name: "project_id" });
  const previewQuote = useWatch({ control, name: "quote" });
  const previewName = useWatch({ control, name: "client_name" });
  const previewRole = useWatch({ control, name: "client_role" });
  const previewPhoto = useWatch({ control, name: "client_photo" });
  const assignableProjects = projects.filter(
    (project) =>
      project.status !== "trash" || project.id === assignedProjectId,
  );

  const closePanel = useCallback(() => {
    if (saving) return;
    router.replace("/admin/testimonials");
  }, [router, saving]);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, status")
        .order("updated_at", { ascending: false });
      if (error) {
        showToast(withRlsHint(error.message), "error");
        return;
      }
      setProjects((data ?? []) as ProjectRow[]);
    })();
  }, [showToast]);

  useEffect(() => {
    if (isNewRoute) {
      reset(defaultEmptyTestimonialForm());
      return;
    }
    if (!testimonialId) return;
    let cancelled = false;
    setLoadingRow(true);
    void (async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("id", testimonialId)
        .single();
      if (cancelled) return;
      setLoadingRow(false);
      if (error || !data) {
        showToast(withRlsHint(error?.message ?? "Not found"), "error");
        router.replace("/admin/testimonials");
        return;
      }
      reset(testimonialRowToFormValues(data as TestimonialRow));
    })();
    return () => {
      cancelled = true;
    };
  }, [isNewRoute, reset, router, showToast, testimonialId]);

  const onInvalid = useCallback(
    (fieldErrors: FieldErrors<TestimonialFormValues>) => {
      const issues = listFormErrors(fieldErrors);
      const summary =
        issues.length === 0
          ? "Fix the highlighted fields below"
          : issues
              .map(
                (issue) =>
                  `${FIELD_LABELS[issue.field] ?? issue.field}: ${issue.message}`,
              )
              .join(" · ");
      showToast(summary, "error");
    },
    [showToast],
  );

  const onSubmit = async (values: TestimonialFormValues) => {
    setSaving(true);
    try {
      const payload = formValuesToTestimonialPayload(values);
      const assignedProjectId = payload.project_id;

      if (assignedProjectId) {
        const { error: clearError } = await clearOtherAssignments(
          assignedProjectId,
          isNewRoute ? undefined : testimonialId,
        );
        if (clearError) {
          showToast(withRlsHint(clearError), "error");
          return;
        }
      }

      if (isNewRoute) {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) {
          showToast(
            withRlsHint(formatSupabaseUserMessage(error, "Could not save")),
            "error",
          );
          return;
        }
        showToast("Testimonial saved");
      } else if (testimonialId) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", testimonialId);
        if (error) {
          showToast(
            withRlsHint(formatSupabaseUserMessage(error, "Could not save")),
            "error",
          );
          return;
        }
        showToast("Testimonial updated");
      }

      void invalidateTestimonialsPublicCache();
      router.replace("/admin/testimonials");
    } catch {
      showToast("Could not save testimonial. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onSubmit, onInvalid)(event);
  };

  if (loadingRow) {
    return (
      <AdminSidePanel
        title="Edit testimonial"
        description="Loading…"
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
      title={isNewRoute ? "New testimonial" : "Edit testimonial"}
      description="Save the quote here, then assign it to a project to show it on that case-study page."
      onClose={closePanel}
      busy={saving}
    >
      <form
        onSubmit={onFormSubmit}
        className="mx-auto max-w-3xl space-y-6 pb-20"
        noValidate
      >
        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Quote</h2>
          <div data-field="quote">
            <label className={labelCls} htmlFor="testimonial-quote">
              Quote
            </label>
            <Textarea
              id="testimonial-quote"
              className={`${field} min-h-[120px]`}
              aria-invalid={Boolean(errors.quote)}
              {...register("quote")}
            />
            <FieldError message={errors.quote?.message} />
          </div>
          <div data-field="client_name">
            <label className={labelCls} htmlFor="testimonial-name">
              Client name
            </label>
            <Input
              id="testimonial-name"
              className={field}
              aria-invalid={Boolean(errors.client_name)}
              {...register("client_name")}
            />
            <FieldError message={errors.client_name?.message} />
          </div>
          <div>
            <label className={labelCls} htmlFor="testimonial-role">
              Client role (optional)
            </label>
            <Input
              id="testimonial-role"
              className={field}
              placeholder="Founder, Product lead…"
              {...register("client_role")}
            />
          </div>
          <Controller
            name="client_photo"
            control={control}
            render={({ field: f }) => (
              <ImageUrlField
                label="Client photo (optional)"
                value={f.value}
                onChange={f.onChange}
                bucket="portfolio-assets"
                pathPrefix="testimonials"
                placeholder="Or paste photo URL"
              />
            )}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-white">Card preview</h2>
          {previewQuote?.trim() ? (
            <ProjectTestimonialCard
              className="md:pl-0"
              testimonial={{
                quote: previewQuote,
                clientName: previewName ?? "",
                clientRole: previewRole,
                clientPhoto: previewPhoto,
              }}
            />
          ) : (
            <p className="text-sm text-white/40">
              The public card appears here as you type the quote.
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">
            Assign to project
          </h2>
          <p className="text-[11px] text-white/35">
            Optional. The assigned project’s details page shows this quote. A
            project can have only one testimonial.
          </p>
          <Controller
            name="project_id"
            control={control}
            render={({ field: f }) => (
              <div data-field="project_id">
                <label className={labelCls} htmlFor="testimonial-project">
                  Project
                </label>
                <Select
                  value={f.value ? f.value : SELECT_NONE}
                  onValueChange={(value) =>
                    f.onChange(value === SELECT_NONE ? "" : value)
                  }
                >
                  <SelectTrigger id="testimonial-project" className={field}>
                    <SelectValue placeholder="Not assigned" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#111] text-white">
                    <SelectItem value={SELECT_NONE} className="focus:bg-white/10">
                      Not assigned
                    </SelectItem>
                    {assignableProjects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="focus:bg-white/10"
                      >
                        {project.title}
                        {project.status === "draft" ? " (draft)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          />
        </section>

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
                Saving…
              </>
            ) : isNewRoute ? (
              "Save testimonial"
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
