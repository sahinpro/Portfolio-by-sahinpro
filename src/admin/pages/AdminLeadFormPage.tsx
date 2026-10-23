"use client";

import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import {
  LEAD_SOURCE_OPTIONS,
  OUTREACH_STATUS_OPTIONS,
  PREFERRED_CONTACT_OPTIONS,
  PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  WEBSITE_STATUS_OPTIONS,
  labelFor,
  type Option,
} from "@/admin/constants/leadOptions";
import { useToast } from "@/admin/context/ToastContext";
import { getAllLeads, getLead, putLead } from "@/admin/lib/leads/leadDb";
import {
  defaultEmptyLeadForm,
  formValuesToLead,
  leadToFormValues,
} from "@/admin/lib/leads/leadMappers";
import { findDuplicates } from "@/admin/lib/leads/leadService";
import {
  leadFormSchema,
  type LeadFormValues,
} from "@/admin/schemas/leadFormSchema";
import type { Lead } from "@/admin/types/lead";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
} from "react-hook-form";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";
const NONE = "__none__";

function FieldError({ message }: { message?: string }): JSX.Element | null {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs text-red-400" role="alert">
      {message}
    </p>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {hint ? <p className="mt-1 text-[11px] text-white/35">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function EnumField({
  control,
  name,
  label,
  options,
  allowEmpty = false,
  error,
}: {
  control: Control<LeadFormValues>;
  name: keyof LeadFormValues;
  label: string;
  options: Option<string>[];
  allowEmpty?: boolean;
  error?: string;
}): JSX.Element {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: f }) => {
        const current = (f.value as string) ?? "";
        return (
          <div>
            <label className={labelCls}>{label}</label>
            <Select
              value={current === "" ? NONE : current}
              onValueChange={(v) => f.onChange(v === NONE ? "" : v)}
            >
              <SelectTrigger id={String(name)} className={field}>
                <SelectValue placeholder={allowEmpty ? "Not set" : undefined} />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                {allowEmpty ? (
                  <SelectItem value={NONE} className="focus:bg-white/10">
                    Not set
                  </SelectItem>
                ) : null}
                {options.map((o) => (
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
            <FieldError message={error} />
          </div>
        );
      }}
    />
  );
}

export function AdminLeadFormPage({
  leadId,
}: {
  leadId?: string;
}): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const isNewRoute = !leadId;

  const [loadingRow, setLoadingRow] = useState(!isNewRoute);
  const [existing, setExisting] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[] | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultEmptyLeadForm(),
  });

  const closePanel = useCallback(() => {
    if (saving) return;
    router.replace("/admin/leads");
  }, [router, saving]);

  useEffect(() => {
    if (isNewRoute) {
      reset(defaultEmptyLeadForm());
      return;
    }
    if (!leadId) return;
    let cancelled = false;
    setLoadingRow(true);
    void (async () => {
      try {
        const row = await getLead(leadId);
        if (cancelled) return;
        setLoadingRow(false);
        if (!row) {
          showToast("That lead was not found in this browser", "error");
          router.replace("/admin/leads");
          return;
        }
        setExisting(row);
        reset(leadToFormValues(row));
      } catch {
        if (cancelled) return;
        setLoadingRow(false);
        showToast("Could not open the local database", "error");
        router.replace("/admin/leads");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNewRoute, leadId, reset, router, showToast]);

  const persist = useCallback(
    async (values: LeadFormValues) => {
      setSaving(true);
      try {
        const lead = formValuesToLead(values, existing);
        await putLead(lead);
        showToast(isNewRoute ? "Lead saved locally" : "Lead updated");
        router.replace("/admin/leads");
      } catch {
        showToast("Could not save to the local database", "error");
      } finally {
        setSaving(false);
      }
    },
    [existing, isNewRoute, router, showToast],
  );

  const onSubmit = useCallback(
    async (values: LeadFormValues) => {
      setSaving(true);
      try {
        const candidate = formValuesToLead(values, existing);
        if (isNewRoute && candidate.normalizedKey) {
          const all = await getAllLeads();
          const dupes = findDuplicates(all, candidate.normalizedKey);
          if (dupes.length > 0) {
            setSaving(false);
            setDuplicateLeads(dupes);
            return;
          }
        }
        await persist(values);
      } catch {
        setSaving(false);
        showToast("Could not save to the local database", "error");
      }
    },
    [existing, isNewRoute, persist, showToast],
  );

  const onInvalid = useCallback(() => {
    showToast("Please fix the highlighted fields", "error");
  }, [showToast]);

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onSubmit, onInvalid)(event);
  };

  const firstError = (key: keyof LeadFormValues): string | undefined =>
    (errors as FieldErrors<LeadFormValues>)[key]?.message as string | undefined;

  if (loadingRow) {
    return (
      <AdminSidePanel
        title="Edit lead"
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

  const err = errors as FieldErrors<LeadFormValues>;

  return (
    <AdminSidePanel
      title={isNewRoute ? "Add lead" : existing?.businessName || "Edit lead"}
      description="Stored only in this browser's local database — never uploaded."
      onClose={closePanel}
      busy={saving}
    >
      <form
        onSubmit={onFormSubmit}
        className="mx-auto max-w-3xl space-y-6 pb-24"
        noValidate
      >
        {/* A. Business Information */}
        <Section title="Business information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="businessName">
                Business name<span className="text-red-400"> *</span>
              </label>
              <Input
                id="businessName"
                className={field}
                aria-invalid={Boolean(err.businessName)}
                {...register("businessName")}
              />
              <FieldError message={err.businessName?.message} />
            </div>
            <div>
              <label className={labelCls} htmlFor="niche">
                Niche<span className="text-red-400"> *</span>
              </label>
              <Input
                id="niche"
                className={field}
                placeholder="Dental clinic, gym, restaurant…"
                aria-invalid={Boolean(err.niche)}
                {...register("niche")}
              />
              <FieldError message={err.niche?.message} />
            </div>
            <div>
              <label className={labelCls} htmlFor="country">
                Country
              </label>
              <Input id="country" className={field} {...register("country")} />
            </div>
            <div>
              <label className={labelCls} htmlFor="city">
                City / Service area
              </label>
              <Input id="city" className={field} {...register("city")} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="websiteUrl">
              Business website URL
            </label>
            <Input
              id="websiteUrl"
              className={field}
              placeholder="example.com"
              aria-invalid={Boolean(err.websiteUrl)}
              {...register("websiteUrl")}
            />
            <FieldError message={err.websiteUrl?.message} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumField
              control={control}
              name="websiteStatus"
              label="Website status"
              options={WEBSITE_STATUS_OPTIONS}
            />
            <EnumField
              control={control}
              name="leadSource"
              label="Lead source"
              options={LEAD_SOURCE_OPTIONS}
              allowEmpty
            />
          </div>
        </Section>

        {/* B. Contact Information */}
        <Section
          title="Contact information"
          hint="All optional. Leave email/phone blank if Instagram DM is the only way to reach them."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="contactPerson">
                Contact person
              </label>
              <Input
                id="contactPerson"
                className={field}
                {...register("contactPerson")}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="email">
                Business email
              </label>
              <Input
                id="email"
                type="email"
                className={field}
                aria-invalid={Boolean(err.email)}
                {...register("email")}
              />
              <FieldError message={err.email?.message} />
            </div>
            <div>
              <label className={labelCls} htmlFor="phone">
                Phone / WhatsApp
              </label>
              <Input id="phone" className={field} {...register("phone")} />
            </div>
            <EnumField
              control={control}
              name="preferredContactMethod"
              label="Preferred contact method"
              options={PREFERRED_CONTACT_OPTIONS}
              allowEmpty
            />
            <div>
              <label className={labelCls} htmlFor="instagramUrl">
                Instagram profile URL
              </label>
              <Input
                id="instagramUrl"
                className={field}
                aria-invalid={Boolean(err.instagramUrl)}
                {...register("instagramUrl")}
              />
              <FieldError message={err.instagramUrl?.message} />
            </div>
            <div>
              <label className={labelCls} htmlFor="facebookUrl">
                Facebook page URL
              </label>
              <Input
                id="facebookUrl"
                className={field}
                aria-invalid={Boolean(err.facebookUrl)}
                {...register("facebookUrl")}
              />
              <FieldError message={err.facebookUrl?.message} />
            </div>
          </div>
        </Section>

        {/* C. Outreach Tracking */}
        <Section
          title="Outreach tracking"
          hint="Independent from project status. A sent DM does not mean the lead is qualified."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumField
              control={control}
              name="outreachStatus"
              label="Outreach status"
              options={OUTREACH_STATUS_OPTIONS}
              error={firstError("outreachStatus")}
            />
            <div>
              <label className={labelCls}>Follow-up count</label>
              <div
                className={`${field} flex items-center justify-between text-white/60`}
              >
                <span>{existing?.followUpCount ?? 0} logged contact(s)</span>
                <span className="text-[11px] text-white/30">
                  use “Log contact” in the list
                </span>
              </div>
            </div>
            <div>
              <label className={labelCls} htmlFor="firstContactDate">
                First contact date
              </label>
              <Input
                id="firstContactDate"
                type="date"
                className={field}
                {...register("firstContactDate")}
              />
              <FieldError message={err.firstContactDate?.message} />
            </div>
            <div>
              <label className={labelCls} htmlFor="lastContactDate">
                Last contact date
              </label>
              <Input
                id="lastContactDate"
                type="date"
                className={field}
                {...register("lastContactDate")}
              />
              <FieldError message={err.lastContactDate?.message} />
            </div>
            <div>
              <label className={labelCls} htmlFor="followUpDate">
                Next follow-up date
              </label>
              <Input
                id="followUpDate"
                type="date"
                className={field}
                {...register("followUpDate")}
              />
              <FieldError message={err.followUpDate?.message} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="firstMessage">
              First message sent
            </label>
            <Textarea
              id="firstMessage"
              className={`${field} min-h-[80px]`}
              {...register("firstMessage")}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="lastConversation">
              Last message / conversation summary
            </label>
            <Textarea
              id="lastConversation"
              className={`${field} min-h-[80px]`}
              {...register("lastConversation")}
            />
          </div>
        </Section>

        {/* D. Qualification & Opportunity */}
        <Section title="Qualification & opportunity">
          <EnumField
            control={control}
            name="priority"
            label="Priority"
            options={PRIORITY_OPTIONS}
          />
          <div>
            <label className={labelCls} htmlFor="opportunity">
              Observed business opportunity
            </label>
            <Textarea
              id="opportunity"
              className={`${field} min-h-[70px]`}
              placeholder="Why might they need a website?"
              {...register("opportunity")}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="improvements">
              Potential website improvements
            </label>
            <Textarea
              id="improvements"
              className={`${field} min-h-[70px]`}
              {...register("improvements")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="estBudget">
                Estimated project budget
              </label>
              <Input
                id="estBudget"
                className={field}
                placeholder="$500–$1,000"
                {...register("estBudget")}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="expectedValue">
                Expected project value
              </label>
              <Input
                id="expectedValue"
                className={field}
                {...register("expectedValue")}
              />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="notes">
              Internal notes
            </label>
            <Textarea
              id="notes"
              className={`${field} min-h-[70px]`}
              {...register("notes")}
            />
          </div>
        </Section>

        {/* E. Project Tracking */}
        <Section
          title="Project status"
          hint="Separate from outreach. Use for the deal pipeline."
        >
          <EnumField
            control={control}
            name="projectStatus"
            label="Project status"
            options={PROJECT_STATUS_OPTIONS}
          />
        </Section>

        {/* Meta + links (view existing) */}
        {existing ? (
          <Section title="Record">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-white/40">Created</dt>
                <dd className="text-white/70">
                  {new Date(existing.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-white/40">Last updated</dt>
                <dd className="text-white/70">
                  {new Date(existing.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2 pt-1">
              {existing.websiteUrl ? (
                <MetaLink href={existing.websiteUrl} label="Website" />
              ) : null}
              {existing.instagramUrl ? (
                <MetaLink href={existing.instagramUrl} label="Instagram" />
              ) : null}
              {existing.facebookUrl ? (
                <MetaLink href={existing.facebookUrl} label="Facebook" />
              ) : null}
              {existing.email ? (
                <a
                  href={`mailto:${existing.email}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06]"
                >
                  Email {existing.email}
                </a>
              ) : null}
            </div>
          </Section>
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
                Saving…
              </>
            ) : isNewRoute ? (
              "Save lead"
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

      <ConfirmDialog
        open={Boolean(duplicateLeads)}
        title="Possible duplicate"
        message={
          <div className="space-y-2">
            <p>
              A lead with the same website, email, or social profile may already
              exist:
            </p>
            <ul className="space-y-1">
              {(duplicateLeads ?? []).slice(0, 5).map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/admin/leads/${d.id}`}
                    className="text-white underline underline-offset-2"
                  >
                    {d.businessName}
                  </Link>{" "}
                  <span className="text-white/40">
                    · {labelFor(WEBSITE_STATUS_OPTIONS, d.websiteStatus)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-white/50">
              Save anyway, or review the existing record before continuing.
            </p>
          </div>
        }
        confirmLabel="Save anyway"
        cancelLabel="Review first"
        onCancel={() => setDuplicateLeads(null)}
        onConfirm={() => {
          setDuplicateLeads(null);
          // Re-run validation and save, bypassing the duplicate gate.
          void handleSubmit((values) => persist(values))();
        }}
      />
    </AdminSidePanel>
  );
}

function MetaLink({
  href,
  label,
}: {
  href: string;
  label: string;
}): JSX.Element {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06]"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}
