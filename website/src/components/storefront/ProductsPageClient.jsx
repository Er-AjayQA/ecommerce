"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductFilterSidebar } from "@/components/storefront/ProductFilterSidebar";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useStorefront } from "@/context/StorefrontContext";
import {
  getWebsiteCategories,
  getWebsiteCollections,
  getWebsiteProducts,
  normalizeCategoryOption,
  normalizeCollectionOption,
  normalizeProduct,
} from "@/lib/website-api";

function uniqueById(items) {
  const map = new Map();

  items.filter(Boolean).forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}

function flattenCategories(items = [], result = []) {
  items.forEach((item) => {
    const option = normalizeCategoryOption(item);
    if (option) result.push(option);
    flattenCategories(item.children || [], result);
  });

  return result;
}

function productMatchesFilters(product, selectedCategoryIds, selectedCollectionIds) {
  const categoryMatch =
    selectedCategoryIds.length === 0 ||
    selectedCategoryIds.includes(product.categoryId) ||
    selectedCategoryIds.includes(product.categoryCode);

  const collectionIds = product.collections.flatMap((collection) => [
    collection.id,
    collection.code,
  ]);
  const collectionMatch =
    selectedCollectionIds.length === 0 ||
    selectedCollectionIds.some((id) => collectionIds.includes(id));

  return categoryMatch && collectionMatch;
}

export function ProductsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { host } = useStorefront();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [meta, setMeta] = useState({ total: 0, currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const selectedCategoryIds = useMemo(
    () => searchParams.getAll("category"),
    [searchParams]
  );
  const selectedCollectionIds = useMemo(
    () => searchParams.getAll("collection"),
    [searchParams]
  );

  useEffect(() => {
    if (!host) return;

    let isMounted = true;

    async function loadProducts() {
      const [result, categoryResult, collectionResult] = await Promise.all([
        getWebsiteProducts(host, { limit: 200 }),
        getWebsiteCategories(host),
        getWebsiteCollections(host),
      ]);

      if (isMounted) {
        const normalizedProducts = result.items.map(normalizeProduct).filter(Boolean);
        const categoryOptionsFromProducts = normalizedProducts
          .filter((product) => product.categoryId && product.category)
          .map((product) => ({
            id: product.categoryId,
            code: product.categoryCode,
            name: product.category,
          }));
        const collectionOptionsFromProducts = normalizedProducts.flatMap(
          (product) => product.collections
        );

        setProducts(normalizedProducts);
        setCategories(
          uniqueById([
            ...flattenCategories(categoryResult),
            ...categoryOptionsFromProducts,
          ])
        );
        setCollections(
          uniqueById([
            ...collectionResult.items.map(normalizeCollectionOption),
            ...collectionOptionsFromProducts,
          ])
        );
        setMeta({
          total: result.total,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
        });
        setIsLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [host]);

  const updateFilterUrl = (type, nextIds) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(type);
    nextIds.forEach((id) => params.append(type, id));
    const query = params.toString();

    router.replace(query ? `/products?${query}` : "/products", {
      scroll: false,
    });
  };

  const handleToggleCategory = (id) => {
    const nextIds = selectedCategoryIds.includes(id)
      ? selectedCategoryIds.filter((selectedId) => selectedId !== id)
      : [...selectedCategoryIds, id];

    updateFilterUrl("category", nextIds);
  };

  const handleToggleCollection = (id) => {
    const nextIds = selectedCollectionIds.includes(id)
      ? selectedCollectionIds.filter((selectedId) => selectedId !== id)
      : [...selectedCollectionIds, id];

    updateFilterUrl("collection", nextIds);
  };

  const handleClearFilters = () => {
    router.replace("/products", { scroll: false });
  };

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        productMatchesFilters(product, selectedCategoryIds, selectedCollectionIds)
      ),
    [products, selectedCategoryIds, selectedCollectionIds]
  );

  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-10 lg:px-6">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Products</h1>
          {!isLoading && meta.total > 0 && (
            <p className="text-sm text-muted-foreground">{meta.total} products</p>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading products</p>}

        {!isLoading && products.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No products found</h2>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <ProductFilterSidebar
              categories={categories}
              collections={collections}
              selectedCategoryIds={selectedCategoryIds}
              selectedCollectionIds={selectedCollectionIds}
              onToggleCategory={handleToggleCategory}
              onToggleCollection={handleToggleCollection}
              onClear={handleClearFilters}
              resultCount={filteredProducts.length}
              totalCount={products.length}
            />

            <div>
              {filteredProducts.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <h2 className="text-lg font-semibold">No matching products</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try removing a filter.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </StorePageShell>
  );
}
