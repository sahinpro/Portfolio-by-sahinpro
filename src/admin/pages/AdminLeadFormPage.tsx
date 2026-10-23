"use client";

import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import {
  LEAD_SOURCE_OPTIONS,
  OUTREACH_STATUS_OPTIONS,
  WEBSITE_STATUS_OPTIONS,
  labelFor,
  type Option,
} from "@/admin/constants/leadOptions";
import { useToast } from "@/admin/context/ToastContext";
import {
  LeadStoreError,
  getLead,
  listLeads,
  putLead,
} from "@/admin/lib/leads/leadRepository";
import {
  defaultEmptyLeadForm,
  formValuesToLead,
  leadToFormValues,
} from "@/admin/lib/leads/leadMappers";
import { findDuplicates } from "@/admin/lib/leads/leadService";
import {
  leadFormSchema,
  type LeadFormInput,
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
const requiredMark = <span className="text-red-400"> *</span>;
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
  children,
}: {
  title: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
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
  control: Control<LeadFormInput>;
  name: keyof LeadFormInput;
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
            <label className={labelCls}>
              {label}
              {allowEmpty ? null : requiredMark}
            </label>
            <Select
              value={current === "" ? NONE : current}
              onValueChange={(v) => f.onChange(v === NONE ? "" : v)}
            >
              <SelectTrigger id={String(name)} className={field}>
                <SelectValue placeholder={allowEmpty ? "Not set" : "Select…"} />
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
    watch,
    formState: { errors },
  } = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: defaultEmptyLeadForm(),
  });

  const websiteStatus = watch("websiteStatus");
  const showWebsiteUrl = websiteStatus !== "no_website";
  const websiteUrlRequired =
    websiteStatus === "has_website" || websiteStatus === "needs_improvement";

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
          showToast("That lead was not found", "error");
          router.replace("/admin/leads");
          return;
        }
        setExisting(row);
        reset(leadToFormValues(row));
      } catch (e) {
        if (cancelled) return;
        setLoadingRow(false);
        showToast(
          e instanceof LeadStoreError
            ? e.message
            : "Could not load that lead",
          "error",
        );
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
        showToast(isNewRoute ? "Lead saved" : "Lead updated");
        router.replace("/admin/leads");
      } catch (e) {
        showToast(
          e instanceof LeadStoreError
            ? e.message
            : "Could not save this lead",
          "error",
        );
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
          const all = await listLeads();
          const dupes = findDuplicates(all, candidate.normalizedKey);
          if (dupes.length > 0) {
            setSaving(false);
            setDuplicateLeads(dupes);
            return;
          }
        }
        await persist(values);
      } catch (e) {
        setSaving(false);
        showToast(
          e instanceof LeadStoreError
            ? e.message
            : "Could not save this lead",
          "error",
        );
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

  const err = errors as FieldErrors<LeadFormInput>;

  return (
    <AdminSidePanel
      title={isNewRoute ? "Add lead" : existing?.businessName || "Edit lead"}
      description="Saved to your Supabase project, visible to authorised admins on every device."
      onClose={closePanel}
      busy={saving}
    >
      <form
        onSubmit={onFormSubmit}
        className="mx-auto max-w-2xl space-y-5 pb-24"
        noValidate
      >
        {/* A. Business Information */}
        <Section title="Business information">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="businessName">
                Business name{requiredMark}
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
                Niche{requiredMark}
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
            <EnumField
              control={control}
              name="websiteStatus"
              label="Website status"
              options={WEBSITE_STATUS_OPTIONS}
              error={err.websiteStatus?.message}
            />
            <EnumField
              control={control}
              name="leadSource"
              label="Lead source"
              options={LEAD_SOURCE_OPTIONS}
              allowEmpty
              error={err.leadSource?.message}
            />
          </div>
          {showWebsiteUrl ? (
            <div>
              <label className={labelCls} htmlFor="websiteUrl">
                Website URL
                {websiteUrlRequired ? requiredMark : " (optional)"}
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
          ) : null}
        </Section>

        {/* B. Contact Information */}
        <Section title="Contact information (all optional)">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="instagramUrl">
                Instagram profile URL
              </label>
              <Input
                id="instagramUrl"
                className={field}
                placeholder="instagram.com/business"
                aria-invalid={Boolean(err.instagramUrl)}
                {...register("instagramUrl")}
              />
              <FieldError message={err.instagramUrl?.message} />
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
                Phone / WhatsApp link
              </label>
              <Input
                id="phone"
                className={field}
                placeholder="+880 1700 000000 or wa.me link"
                {...register("phone")}
              />
            </div>
          </div>
        </Section>

        {/* C. Outreach & Notes */}
        <Section title="Outreach & notes">
          <div className="grid gap-4 sm:grid-cols-2">
            <EnumField
              control={control}
              name="outreachStatus"
              label="Outreach status"
              options={OUTREACH_STATUS_OPTIONS}
              error={err.outreachStatus?.message}
            />
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
            <label className={labelCls} htmlFor="notes">
              Notes
            </label>
            <Textarea
              id="notes"
              className={`${field} min-h-[90px]`}
              placeholder="Why they might need a website, Instagram observations, conversation summaries, planned improvements…"
              {...register("notes")}
            />
          </div>
        </Section>

        {/* Read-only record info (existing leads only) */}
        {existing ? <RecordSection lead={existing} /> : null}

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
              "Save Lead"
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

/** Read-only details kept out of the simplified form: timestamps, quick-action
 * counters, links, and any legacy info still present on older records. */
function RecordSection({ lead }: { lead: Lead }): JSX.Element {
  const legacyNotes: { label: string; value: string }[] = [
    { label: "Contact person", value: lead.contactPerson },
    { label: "Facebook page", value: lead.facebookUrl },
    { label: "Preferred contact", value: lead.preferredContactMethod },
    { label: "First contact date", value: lead.firstContactDate },
    { label: "Last contact date", value: lead.lastContactDate },
    { label: "First message sent", value: lead.firstMessage },
    { label: "Last conversation", value: lead.lastConversation },
    { label: "Opportunity", value: lead.opportunity },
    { label: "Improvements", value: lead.improvements },
    { label: "Est. budget", value: lead.estBudget },
    { label: "Expected value", value: lead.expectedValue },
  ].filter((entry) => Boolean(entry.value));

  return (
    <Section title="Record">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-white/40">Created</dt>
          <dd className="text-white/70">
            {new Date(lead.createdAt).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Last updated</dt>
          <dd className="text-white/70">
            {new Date(lead.updatedAt).toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Contacts logged</dt>
          <dd className="text-white/70">{lead.followUpCount ?? 0}</dd>
        </div>
        <div>
          <dt className="text-white/40">Follow-up count</dt>
          <dd className="text-white/70">
            Use “Log contact” in the list to increment
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2 pt-1">
        {lead.websiteUrl ? <MetaLink href={lead.websiteUrl} label="Website" /> : null}
        {lead.instagramUrl ? (
          <MetaLink href={lead.instagramUrl} label="Instagram" />
        ) : null}
        {lead.facebookUrl ? (
          <MetaLink href={lead.facebookUrl} label="Facebook" />
        ) : null}
        {lead.email ? (
          <a
            href={`mailto:${lead.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 hover:bg-white/[0.06]"
          >
            Email {lead.email}
          </a>
        ) : null}
      </div>
      {legacyNotes.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/[0.06] pt-3 text-xs">
          {legacyNotes.map((entry) => (
            <div key={entry.label} className="min-w-0">
              <dt className="text-white/40">{entry.label}</dt>
              <dd className="break-words text-white/70">{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Section>
  );
}
