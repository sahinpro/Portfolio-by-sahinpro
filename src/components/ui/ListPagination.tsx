"use client";

import { cn } from "@/lib/utils";
import { LIST_PAGE_SIZE, pageRange } from "@/lib/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

export { LIST_PAGE_SIZE };

export interface ListPaginationProps {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  "aria-label"?: string;
}

export function ListPagination({
  page,
  totalItems,
  pageSize = LIST_PAGE_SIZE,
  onPageChange,
  className,
  "aria-label": ariaLabel = "Pagination",
}: ListPaginationProps): JSX.Element | null {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pages = useMemo(() => pageRange(page, totalPages), [page, totalPages]);

  if (totalItems <= pageSize) return null;

  const navBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.03] text-white/50 transition-all hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex justify-center", className)}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={navBtn}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
          {pages.map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 min-w-8 items-center justify-center px-1 text-xs text-white/25"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  "flex h-8 min-w-8 items-center justify-center rounded-md px-2.5 text-xs font-medium tabular-nums transition-all",
                  item === page
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70",
                )}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={navBtn}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
