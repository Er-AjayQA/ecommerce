"use client";

import { StorePageShell } from "@/components/storefront/StorePageShell";

export function SimplePage({ title }) {
  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-16 text-center lg:px-6">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Content is not configured from backend yet.
        </p>
      </section>
    </StorePageShell>
  );
}
