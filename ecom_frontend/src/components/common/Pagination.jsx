import React from "react";
import { cn } from "../../lib/utils";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t bg-white",
        className
      )}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "px-3 py-1.5 text-sm border rounded-lg transition",
          "hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white",
          "disabled:opacity-50 disabled:hover:bg-none"
        )}
      >
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg border transition",
              page === p
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent"
                : "hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "px-3 py-1.5 text-sm border rounded-lg transition",
          "hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white",
          "disabled:opacity-50 disabled:hover:bg-none"
        )}
      >
        Next
      </button>
    </div>
  );
}