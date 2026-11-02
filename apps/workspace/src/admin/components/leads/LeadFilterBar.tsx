"use client";

import {
  LEAD_SOURCE_OPTIONS,
  OUTREACH_STATUS_OPTIONS,
  WEBSITE_STATUS_OPTIONS,
  type Option,
} from "@/admin/constants/leadOptions";
import type {
  FollowUpBucket,
  LeadFilterState,
} from "@/admin/lib/leads/leadService";
import { Input } from "@sahinpro/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sahinpro/shared/ui/select";
import { Search, X } from "lucide-react";

const ALL = "__all__";

const triggerClass =
  "h-9 w-full rounded-lg border-white/[0.08] bg-white/[0.04] text-sm text-white " +
  "data-[placeholder]:text-white/40 focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]";

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option<string>[];
}): JSX.Element {
  return (
    <div className="min-w-0 flex-1">
      <label className="mb-1 block text-[11px] font-medium text-white/40">
        {label}
      </label>
      <Select
        value={value === "" ? ALL : value}
        onValueChange={(v) => onChange(v === ALL ? "" : v)}
      >
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent className="border-white/10 bg-[#111] text-white">
          <SelectItem value={ALL} className="focus:bg-white/10">
            All
          </SelectItem>
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
    </div>
  );
}

function FacetFilter({
  label,
  value,
  onChange,
  facets,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  facets: string[];
}): JSX.Element {
  return (
    <SelectFilter
      label={label}
      value={value}
      onChange={onChange}
      options={facets.map((f) => ({ value: f, label: f }))}
    />
  );
}

const FOLLOW_UP_TABS: { value: "" | FollowUpBucket; label: string }[] = [
  { value: "", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "none", label: "No date" },
];

export function LeadFilterBar({
  filters,
  onPatch,
  nicheFacets,
  countryFacets,
  hasActive,
  onClear,
}: {
  filters: LeadFilterState;
  onPatch: (patch: Partial<LeadFilterState>) => void;
  nicheFacets: string[];
  countryFacets: string[];
  hasActive: boolean;
  onClear: () => void;
}): JSX.Element {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <Input
            type="search"
            value={filters.search}
            onChange={(e) => onPatch({ search: e.target.value })}
            placeholder="Search name, niche, location, contact…"
            aria-label="Search leads"
            className="w-full rounded-lg border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]"
          />
        </div>

        <div
          className="flex flex-wrap items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5"
          role="group"
          aria-label="Follow-up filter"
        >
          {FOLLOW_UP_TABS.map((tab) => (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => onPatch({ followUp: tab.value })}
              aria-pressed={filters.followUp === tab.value}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                filters.followUp === tab.value
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <FacetFilter
          label="Niche"
          value={filters.niche}
          onChange={(v) => onPatch({ niche: v })}
          facets={nicheFacets}
        />
        <FacetFilter
          label="Country"
          value={filters.country}
          onChange={(v) => onPatch({ country: v })}
          facets={countryFacets}
        />
        <SelectFilter
          label="Lead source"
          value={filters.leadSource}
          onChange={(v) => onPatch({ leadSource: v })}
          options={LEAD_SOURCE_OPTIONS}
        />
        <SelectFilter
          label="Website"
          value={filters.websiteStatus}
          onChange={(v) => onPatch({ websiteStatus: v })}
          options={WEBSITE_STATUS_OPTIONS}
        />
        <SelectFilter
          label="Outreach"
          value={filters.outreachStatus}
          onChange={(v) => onPatch({ outreachStatus: v })}
          options={OUTREACH_STATUS_OPTIONS}
        />
      </div>

      {hasActive ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
