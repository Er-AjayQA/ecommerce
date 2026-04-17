"use client";

import { LayoutShell } from "@/components/storefront/LayoutShell";
import { TemplateRenderer } from "@/components/storefront/TemplateRenderer";
import { ThemeProvider } from "@/components/storefront/ThemeProvider";
import { useStorefront } from "@/context/StorefrontContext";

export function StorePageShell({ children }) {
  const { data: storefrontData, design, isLoading, error } = useStorefront();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading store</p>
      </main>
    );
  }

  if (!design || error) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-lg border border-border bg-card p-6 text-center">
          <h1 className="text-xl font-semibold">Store data unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "Store design is not configured for this tenant."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <ThemeProvider theme={design.theme_config}>
      <LayoutShell layout={design.layout_config}>
        <TemplateRenderer
          template={design.template_config}
          design={design}
          data={storefrontData}
          types={["header"]}
        />
        {children}
        <TemplateRenderer
          template={design.template_config}
          design={design}
          data={storefrontData}
          types={["footer"]}
        />
      </LayoutShell>
    </ThemeProvider>
  );
}
