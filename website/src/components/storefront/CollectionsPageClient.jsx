"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useStorefront } from "@/context/StorefrontContext";
import { getWebsiteCollections } from "@/lib/website-api";
import { cn } from "@/lib/utils";

function getCollectionImage(collection) {
  return (collection.media || [])
    .filter((item) => item.type !== "video" && item.url && !item.isDeleted)
    .sort((a, b) => (a.position || a.order_by || 0) - (b.position || b.order_by || 0))[0]
    ?.url;
}

function normalizeCollectionCard(collection) {
  return {
    id: collection.collection_id,
    code: collection.code || "",
    title: collection.title || "",
    description: collection.description || "",
    href: `/collections/${collection.code || collection.collection_id}`,
    image: getCollectionImage(collection),
  };
}

function toggleSelected(setSelected, id) {
  setSelected((selected) =>
    selected.includes(id)
      ? selected.filter((selectedId) => selectedId !== id)
      : [...selected, id]
  );
}

function CollectionFilterSidebar({
  collections,
  selectedCollectionIds,
  onToggleCollection,
  onClear,
  resultCount,
  totalCount,
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");
  const hasFilters = selectedCollectionIds.length > 0;
  const visibleCollections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return collections;

    return collections.filter((collection) =>
      collection.title.toLowerCase().includes(term)
    );
  }, [collections, search]);

  return (
    <aside className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <SlidersHorizontal className="size-4" />
            Filters
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {resultCount} of {totalCount} collections
          </p>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2">
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left font-semibold"
        >
          <span>Collections</span>
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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search collections"
            />

            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {visibleCollections.length === 0 && (
                <p className="text-sm text-muted-foreground">No collections found</p>
              )}

              {visibleCollections.map((collection) => (
                <label
                  key={collection.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-1 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedCollectionIds.includes(collection.id)}
                    onCheckedChange={() => onToggleCollection(collection.id)}
                  />
                  <span className="min-w-0 flex-1 truncate">{collection.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function CollectionsPageClient() {
  const { host } = useStorefront();
  const [collections, setCollections] = useState([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!host) return;

    let isMounted = true;

    async function loadCollections() {
      const result = await getWebsiteCollections(host);

      if (isMounted) {
        setCollections(result.items.map(normalizeCollectionCard));
        setIsLoading(false);
      }
    }

    loadCollections();

    return () => {
      isMounted = false;
    };
  }, [host]);

  const visibleCollections = useMemo(() => {
    if (selectedCollectionIds.length === 0) return collections;

    return collections.filter((collection) =>
      selectedCollectionIds.includes(collection.id)
    );
  }, [collections, selectedCollectionIds]);

  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-10 lg:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Collections</h1>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading collections</p>}

        {!isLoading && collections.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No collections found</h2>
          </div>
        )}

        {!isLoading && collections.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <CollectionFilterSidebar
              collections={collections}
              selectedCollectionIds={selectedCollectionIds}
              onToggleCollection={(id) => toggleSelected(setSelectedCollectionIds, id)}
              onClear={() => setSelectedCollectionIds([])}
              resultCount={visibleCollections.length}
              totalCount={collections.length}
            />

            {visibleCollections.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <h2 className="text-lg font-semibold">No matching collections</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try removing a filter.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={collection.href}
                    className="group block h-full"
                  >
                    <Card className="h-full overflow-hidden rounded-lg transition-shadow hover:shadow-[var(--shadow-md)]">
                      {collection.image && (
                        <div className="relative h-56 bg-muted">
                          <Image
                            src={collection.image}
                            alt={collection.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, 100vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardContent className="space-y-2 p-4">
                        <h2 className="text-lg font-semibold group-hover:text-primary">
                          {collection.title}
                        </h2>
                        {collection.description && (
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {collection.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </StorePageShell>
  );
}
