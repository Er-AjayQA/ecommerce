"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function filterOptions(options, query, labelKey) {
  const term = query.trim().toLowerCase();
  if (!term) return options;

  return options.filter((option) =>
    String(option[labelKey] || "").toLowerCase().includes(term)
  );
}

function FilterGroup({
  title,
  options,
  labelKey,
  selectedIds,
  searchValue,
  onSearchChange,
  onToggle,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const visibleOptions = useMemo(
    () => filterOptions(options, searchValue, labelKey),
    [labelKey, options, searchValue]
  );

  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left font-semibold"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <div className="mt-4 space-y-3">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}`}
          />

          <div className="max-h-64 space-y-2 overflow-auto pr-1">
            {visibleOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">No options found</p>
            )}

            {visibleOptions.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={selectedIds.includes(option.id)}
                  onCheckedChange={() => onToggle(option.id)}
                />
                <span className="min-w-0 flex-1 truncate">{option[labelKey]}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductFilterSidebar({
  categories,
  collections,
  selectedCategoryIds,
  selectedCollectionIds,
  onToggleCategory,
  onToggleCollection,
  onClear,
  resultCount,
  totalCount,
}) {
  const [categorySearch, setCategorySearch] = useState("");
  const [collectionSearch, setCollectionSearch] = useState("");
  const hasFilters =
    selectedCategoryIds.length > 0 || selectedCollectionIds.length > 0;

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-4" />
            Filters
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {resultCount} of {totalCount} products
          </p>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2">
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="mt-2">
        <FilterGroup
          title="Categories"
          options={categories}
          labelKey="name"
          selectedIds={selectedCategoryIds}
          searchValue={categorySearch}
          onSearchChange={setCategorySearch}
          onToggle={onToggleCategory}
        />

        <FilterGroup
          title="Collections"
          options={collections}
          labelKey="title"
          selectedIds={selectedCollectionIds}
          searchValue={collectionSearch}
          onSearchChange={setCollectionSearch}
          onToggle={onToggleCollection}
        />
      </div>
    </aside>
  );
}
