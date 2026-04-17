"use client";

import { StorefrontRenderer } from "@/components/storefront/StorefrontRenderer";
import { useStorefront } from "@/context/StorefrontContext";

export function StorefrontApiLoader() {
  const { data, isLoading, error } = useStorefront();

  return (
    <>
      {isLoading && (
        <div className="fixed right-4 top-4 z-50 rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-lg">
          Loading store data
        </div>
      )}
      {!isLoading && error && (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
          <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold">Store data unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </main>
      )}
      {!isLoading && !error && <StorefrontRenderer data={data} />}
    </>
  );
}
