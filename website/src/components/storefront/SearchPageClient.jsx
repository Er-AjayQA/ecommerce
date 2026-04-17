"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/storefront/ProductCard";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useStorefront } from "@/context/StorefrontContext";
import { getWebsiteProducts, normalizeProduct } from "@/lib/website-api";

export function SearchPageClient() {
  const { host } = useStorefront();
  const searchParams = useSearchParams();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!host) return;

    let isMounted = true;

    async function loadSearchResults() {
      setIsLoading(true);
      const result = await getWebsiteProducts(host, {
        limit: 100,
        search: query,
      });

      if (isMounted) {
        setProducts(result.items.map(normalizeProduct).filter(Boolean));
        setIsLoading(false);
      }
    }

    loadSearchResults();

    return () => {
      isMounted = false;
    };
  }, [host, query]);

  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-10 lg:px-6">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Search</h1>
          <p className="text-sm text-muted-foreground">
            {query ? `Results for "${query}"` : "Browse all products"}
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading products</p>}

        {!isLoading && products.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No products found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another search term.
            </p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </StorePageShell>
  );
}
