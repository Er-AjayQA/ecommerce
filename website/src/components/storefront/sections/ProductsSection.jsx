import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { cn } from "@/lib/utils";

export function ProductsSection({ section, data }) {
  const limit = section.settings?.limit || 8;
  const visibleProducts = data.products.slice(0, limit);

  if (visibleProducts.length === 0) {
    return null;
  }

  return (
    <section id="products" className="bg-background">
      <div className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-12 lg:px-6">
        <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            {section.settings?.eyebrow && (
              <p className="text-sm font-medium text-primary">{section.settings.eyebrow}</p>
            )}
            {section.settings?.title && (
              <h2 className="text-3xl font-bold tracking-tight">{section.settings.title}</h2>
            )}
          </div>
          {section.settings?.actionLabel && (
            <a
              className={cn(buttonVariants({ variant: "outline" }))}
              href={section.settings.actionHref || "#"}
            >
              {section.settings.actionLabel}
            </a>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id || product.name}
              product={product}
              addLabel={section.settings?.addButtonLabel || "Add"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
