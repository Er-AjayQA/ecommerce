import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PromoSection({ data }) {
  const collection = data.collections[0];

  if (!collection) {
    return null;
  }

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-[var(--store-content-max-width)] flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between lg:px-6">
        <div>
          <h2 className="text-2xl font-bold">{collection.title}</h2>
          {collection?.description && (
            <p className="mt-1 max-w-2xl text-sm opacity-85">{collection.description}</p>
          )}
        </div>
        <a
          className={cn(buttonVariants({ variant: "secondary" }))}
          href={collection.href}
        >
          Explore
        </a>
      </div>
    </section>
  );
}
