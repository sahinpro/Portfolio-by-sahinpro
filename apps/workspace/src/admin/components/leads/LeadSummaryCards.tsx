"use client";

import type {
  FollowUpBucket,
  LeadSummary,
} from "@/admin/lib/leads/leadService";
import {
  CalendarClock,
  Clock,
  Inbox,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SummaryAction = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  /** Full filter patch this card applies when clicked. */
  patch: SummaryFilters;
};

/** The subset of filters a summary card toggles. */
export type SummaryFilters = {
  outreachStatus: string;
  followUp: "" | FollowUpBucket;
};

type Card = SummaryAction & { isActive: boolean };

const ACCENTS: Record<string, string> = {
  total: "text-white/60 bg-white/[0.05] border-white/[0.08]",
  notContacted: "text-zinc-300 bg-zinc-500/15 border-zinc-500/25",
  awaiting: "text-amber-200 bg-amber-500/15 border-amber-500/25",
  interested: "text-emerald-300 bg-emerald-500/15 border-emerald-500/25",
  due: "text-red-300 bg-red-500/15 border-red-500/25",
};

export function LeadSummaryCards({
  summary,
  filters,
  onSelect,
}: {
  summary: LeadSummary;
  filters: SummaryFilters;
  onSelect: (patch: SummaryFilters) => void;
}): JSX.Element {
  const cards: Card[] = [
    {
      key: "total",
      label: "Total Leads",
      value: summary.total,
      icon: Users,
      accent: ACCENTS.total,
      patch: { outreachStatus: "", followUp: "" },
      isActive: !filters.outreachStatus && !filters.followUp,
    },
    {
      key: "notContacted",
      label: "Not Contacted",
      value: summary.notContacted,
      icon: Inbox,
      accent: ACCENTS.notContacted,
      patch: {
        outreachStatus: "not_contacted",
        followUp: "",
      },
      isActive: filters.outreachStatus === "not_contacted",
    },
    {
      key: "awaiting",
      label: "Awaiting Reply",
      value: summary.awaitingReply,
      icon: Clock,
      accent: ACCENTS.awaiting,
      patch: {
        outreachStatus: "awaiting_reply",
        followUp: "",
      },
      isActive: filters.outreachStatus === "awaiting_reply",
    },
    {
      key: "interested",
      label: "Interested",
      value: summary.interested,
      icon: Star,
      accent: ACCENTS.interested,
      patch: { outreachStatus: "interested", followUp: "" },
      isActive: filters.outreachStatus === "interested",
    },
    {
      key: "due",
      label: "Follow-ups Due",
      value: summary.followUpsDue,
      icon: CalendarClock,
      accent: ACCENTS.due,
      patch: { outreachStatus: "", followUp: "overdue" },
      isActive: filters.followUp === "overdue",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect(card.patch)}
            aria-pressed={card.isActive}
            className={`group rounded-xl border bg-[#111] p-3 text-left transition-all
              hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20
              ${card.isActive ? "border-white/25 ring-1 ring-white/15" : "border-white/[0.08]"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {card.label}
              </p>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${card.accent}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums text-white">
              {card.value}
            </p>
          </button>
        );
      })}
    </div>
  );
}
