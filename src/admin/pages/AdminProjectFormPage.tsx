import { FRAMEWORK_FIELD_CONFIG } from "@/admin/constants/frameworkFieldConfig";
import { useToast } from "@/admin/context/ToastContext";
import {
  defaultEmptyProjectForm,
  formValuesToProjectPayload,
  projectRowToFormValues,
} from "@/admin/lib/projectMappers";
import { ImageGalleryField } from "@/admin/components/ui/ImageGalleryField";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { projectFormSchema, type ProjectFormValues } from "@/admin/schemas/projectFormSchema";
import type { ProjectRow } from "@/admin/types/database";
import { TagInput } from "@/admin/components/ui/TagInput";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { PROJECT_CATEGORIES } from "@/admin/constants/frameworkFieldConfig";
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
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

export function AdminProjectFormPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isNew = id === "new" || !id;
  const [loadingRow, setLoadingRow] = useState(!isNew);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultEmptyProjectForm(),
  });

  const { register, control, handleSubmit, reset, setValue, watch, formState } = form;
  const { errors } = formState;

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({
    control,
    name: "stats",
  });

  const cmsExtensions = watch("cms_extensions");

  const buildKind = useWatch({ control, name: "build_kind" });
  const customFramework = useWatch({ control, name: "custom_framework" });
  const stackFacets = watch("custom_stack_facets");

  useEffect(() => {
    if (isNew) {
      reset(defaultEmptyProjectForm());
      setLoadingRow(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (cancelled) return;
      setLoadingRow(false);
      if (error || !data) {
        showToast(error?.message ?? "Not found", "error");
        navigate("/admin/projects");
        return;
      }
      reset(projectRowToFormValues(data as ProjectRow));
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isNew, navigate, reset, showToast]);

  const setFacet = (key: string, val: string | string[]) => {
    setValue("custom_stack_facets", { ...stackFacets, [key]: val }, { shouldValidate: true });
  };

  const onSubmit = async (values: ProjectFormValues) => {
    const payload = formValuesToProjectPayload(values);
    if (isNew) {
      const { error } = await supabase.from("projects").insert(payload);
      if (error) {
        showToast(error.message, "error");
        return;
      }
      showToast("Project created");
    } else {
      const { error } = await supabase.from("projects").update(payload).eq("id", id!);
      if (error) {
        showToast(error.message, "error");
        return;
      }
      showToast("Project saved");
    }
    navigate("/admin/projects");
  };

  if (loadingRow) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm py-20 justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }

  const facetConfig =
    customFramework &&
    customFramework !== "other" &&
    (customFramework === "react" || customFramework === "next" || customFramework === "vue")
      ? FRAMEWORK_FIELD_CONFIG[customFramework]
      : [];

  return (
    <div className="max-w-3xl pb-20">
      <Link
        to="/admin/projects"
        className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white/75 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <h1 className="text-2xl font-semibold text-white mb-2">
        {isNew ? "New project" : "Edit project"}
      </h1>
      <p className="text-sm text-white/45 mb-8">
        Custom builds vs CMS (WordPress / Shopify) use different fields. Stats appear as metric
        chips on the public page.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Basics</h2>
          <div>
            <label className={labelCls}>Title</label>
            <Input className={field} {...register("title")} />
            {errors.title ? (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>Short description</label>
            <Textarea className={`${field} min-h-[80px]`} {...register("description")} />
            {errors.description ? (
              <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>Long description</label>
            <Textarea className={`${field} min-h-[120px]`} {...register("long_description")} />
          </div>
          <Controller
            name="image_url"
            control={control}
            render={({ field }) => (
              <ImageUrlField
                label="Image"
                value={field.value}
                onChange={field.onChange}
                bucket="portfolio-assets"
                pathPrefix="projects"
              />
            )}
          />
          <Controller
            name="screenshot_urls"
            control={control}
            render={({ field }) => (
              <ImageGalleryField
                label="Screenshot gallery"
                value={field.value}
                onChange={field.onChange}
                bucket="portfolio-assets"
                pathPrefix="projects/screenshots"
              />
            )}
          />
          <div>
            <label className={labelCls}>Technologies</label>
            <Controller
              name="technologies"
              control={control}
              render={({ field: f }) => (
                <TagInput value={f.value} onChange={f.onChange} placeholder="React, TypeScript…" />
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <Controller
                name="category"
                control={control}
                render={({ field: f }) => (
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger className={field}>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#111] text-white">
                      {PROJECT_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="focus:bg-white/10">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <Input className={field} {...register("year")} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Live URL</label>
              <Input className={field} {...register("live_url")} placeholder="https://" />
            </div>
            <div>
              <label className={labelCls}>GitHub URL</label>
              <Input className={field} {...register("github_url")} placeholder="https://" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className={labelCls}>Sort order</label>
              <Input type="number" className={field} {...register("sort_order")} />
            </div>
            <Controller
              name="featured"
              control={control}
              render={({ field: f }) => (
                <ToggleSwitch checked={f.value} onChange={f.onChange} label="Featured on site" />
              )}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field: f }) => (
                <Select value={f.value} onValueChange={f.onChange}>
                  <SelectTrigger className={field}>
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
                      Trash
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Stats (public page)</h2>
          {statFields.map((sf, index) => (
            <div key={sf.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  className={field}
                  placeholder="Label"
                  {...register(`stats.${index}.label` as const)}
                />
              </div>
              <div className="flex-1">
                <Input
                  className={field}
                  placeholder="Value"
                  {...register(`stats.${index}.value` as const)}
                />
              </div>
              <button
                type="button"
                onClick={() => removeStat(index)}
                className="mt-2 p-2 text-red-400/70 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendStat({ label: "", value: "" })}
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-300 hover:text-violet-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add stat
          </button>
        </section>

        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Build type</h2>
          <Controller
            name="build_kind"
            control={control}
            render={({ field: f }) => (
              <RadioGroup
                value={f.value}
                onValueChange={f.onChange}
                className="flex flex-wrap gap-6"
              >
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <RadioGroupItem value="custom" id="build-kind-custom" className="border-white/25 text-white" />
                  Custom code
                </label>
                <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <RadioGroupItem value="cms" id="build-kind-cms" className="border-white/25 text-white" />
                  CMS (WordPress / Shopify)
                </label>
              </RadioGroup>
            )}
          />

          {buildKind === "custom" ? (
            <div className="space-y-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className={labelCls}>Framework</label>
                <Controller
                  name="custom_framework"
                  control={control}
                  render={({ field: f }) => (
                    <Select
                      value={f.value || undefined}
                      onValueChange={f.onChange}
                    >
                      <SelectTrigger className={field}>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#111] text-white">
                        <SelectItem value="react" className="focus:bg-white/10">
                          React
                        </SelectItem>
                        <SelectItem value="next" className="focus:bg-white/10">
                          Next.js
                        </SelectItem>
                        <SelectItem value="vue" className="focus:bg-white/10">
                          Vue
                        </SelectItem>
                        <SelectItem value="other" className="focus:bg-white/10">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.custom_framework ? (
                  <p className="mt-1 text-xs text-red-400">{errors.custom_framework.message}</p>
                ) : null}
              </div>
              {customFramework === "other" ? (
                <div>
                  <label className={labelCls}>Stack name</label>
                  <Input className={field} {...register("custom_framework_label")} />
                  {errors.custom_framework_label ? (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.custom_framework_label.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {facetConfig.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-white/40">Stack facets</p>
                  {facetConfig.map((facet) => {
                    const cur = stackFacets?.[facet.key];
                    if (facet.type === "select") {
                      const v = typeof cur === "string" ? cur : "";
                      return (
                        <div key={facet.key}>
                          <label className={labelCls}>{facet.label}</label>
                          <Select
                            value={v || undefined}
                            onValueChange={(val) => setFacet(facet.key, val)}
                          >
                            <SelectTrigger className={field}>
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-[#111] text-white">
                              {facet.options.map((o) => (
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
                        </div>
                      );
                    }
                    const arr = Array.isArray(cur) ? cur : [];
                    return (
                      <div key={facet.key}>
                        <label className={labelCls}>{facet.label}</label>
                        <div className="flex flex-wrap gap-2">
                          {facet.options.map((o) => {
                            const on = arr.includes(o.value);
                            return (
                              <button
                                key={o.value}
                                type="button"
                                onClick={() =>
                                  setFacet(
                                    facet.key,
                                    on ? arr.filter((x) => x !== o.value) : [...arr, o.value],
                                  )
                                }
                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                                  on
                                    ? "border-violet-500/40 bg-violet-500/20 text-violet-200"
                                    : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/20"
                                }`}
                              >
                                {o.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4 pt-2 border-t border-white/[0.06]">
              <div>
                <label className={labelCls}>Platform</label>
                <Controller
                  name="cms_platform"
                  control={control}
                  render={({ field: f }) => (
                    <Select value={f.value || undefined} onValueChange={f.onChange}>
                      <SelectTrigger className={field}>
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#111] text-white">
                        <SelectItem value="wordpress" className="focus:bg-white/10">
                          WordPress
                        </SelectItem>
                        <SelectItem value="shopify" className="focus:bg-white/10">
                          Shopify
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cms_platform ? (
                  <p className="mt-1 text-xs text-red-400">{errors.cms_platform.message}</p>
                ) : null}
              </div>
              <div>
                <label className={labelCls}>Theme name</label>
                <Input className={field} {...register("cms_theme_name")} />
                {errors.cms_theme_name ? (
                  <p className="mt-1 text-xs text-red-400">{errors.cms_theme_name.message}</p>
                ) : null}
              </div>
              <div>
                <label className={labelCls}>
                  {watch("cms_platform") === "shopify" ? "App names" : "Plugin names"}
                </label>
                {cmsExtensions.map((_, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      className={field}
                      {...register(`cms_extensions.${index}` as const)}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = cmsExtensions.filter((__, j) => j !== index);
                        setValue("cms_extensions", next.length ? next : [""], {
                          shouldValidate: true,
                        });
                      }}
                      className="p-2 text-red-400/70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setValue("cms_extensions", [...cmsExtensions, ""], { shouldValidate: true })
                  }
                  className="text-xs font-medium text-violet-300"
                >
                  + Add name
                </button>
              </div>
            </div>
          )}
        </section>

        {errors.root ? (
          <p className="text-sm text-red-400">{(errors.root as { message?: string }).message}</p>
        ) : null}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          >
            {formState.isSubmitting ? "Saving…" : isNew ? "Create project" : "Save changes"}
          </button>
          <Link
            to="/admin/projects"
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/[0.06]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
