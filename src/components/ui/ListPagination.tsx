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

  const btnBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-all duration-200";

  const btnIdle =
    "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white";

  const btnActive = "bg-white text-[#161616] shadow-lg shadow-white/10";

  const btnDisabled =
    "cursor-not-allowed border border-white/[0.06] bg-white/[0.03] text-white/25";

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
          className={cn(btnBase, page <= 1 ? btnDisabled : btnIdle)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-center gap-1.5">
          {pages.map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1 text-sm text-white/30"
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
                  btnBase,
                  "min-w-[2.5rem]",
                  item === page ? btnActive : btnIdle,
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
          className={cn(btnBase, page >= totalPages ? btnDisabled : btnIdle)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}
