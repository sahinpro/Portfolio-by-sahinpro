"use client";

import {
  LEAD_SOURCE_OPTIONS,
  OUTREACH_STATUS_OPTIONS,
  WEBSITE_STATUS_OPTIONS,
  labelFor,
  outreachBadgeClass,
  websiteBadgeClass,
  type LeadSource,
  type OutreachStatus,
  type WebsiteStatus,
} from "@/admin/constants/leadOptions";

const base =
  "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap";

function Pill({
  label,
  className,
}: {
  label: string;
  className: string;
}): JSX.Element {
  return <span className={`${base} ${className}`}>{label}</span>;
}

export function OutreachBadge({
  status,
}: {
  status: OutreachStatus;
}): JSX.Element {
  return (
    <Pill
      label={labelFor(OUTREACH_STATUS_OPTIONS, status)}
      className={outreachBadgeClass(status)}
    />
  );
}

export function WebsiteBadge({
  status,
}: {
  status: WebsiteStatus;
}): JSX.Element {
  return (
    <Pill
      label={labelFor(WEBSITE_STATUS_OPTIONS, status)}
      className={websiteBadgeClass(status)}
    />
  );
}

export function LeadSourceText({
  source,
}: {
  source: LeadSource | "";
}): JSX.Element {
  return <>{labelFor(LEAD_SOURCE_OPTIONS, source)}</>;
}
