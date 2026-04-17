import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getEnabledSections = (template) =>
  [...(template?.sections || [])]
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

const sectionTitle = (section) =>
  `${section.type.charAt(0).toUpperCase()}${section.type.slice(1)} - ${section.variant}`;

const HeaderPreview = ({ section }) => (
  <div
    className={cn(
      "z-10 border-b bg-background/95 px-6 py-4 backdrop-blur",
      section.settings?.sticky && "sticky top-0 z-10 shadow-sm",
    )}
  >
    {section.variant === "promoTopbar" && (
      <div className="mb-3 rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground">
        Free shipping on orders above Rs. 999
      </div>
    )}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="text-xl font-bold tracking-tight">Zyno Store</div>
      {(section.variant === "searchFirst" || section.settings?.showSearch) && (
        <div className="min-w-44 flex-1 rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
          Search products
        </div>
      )}
      <div className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
        Cart
      </div>
    </div>
    <div className="mt-3 flex gap-4 overflow-x-auto text-sm text-muted-foreground">
      <span>Shop</span>
      <span>Collections</span>
      <span>Deals</span>
      <span>Contact</span>
    </div>
  </div>
);

const HeroPreview = ({ section }) => (
  <div
    className={cn(
      "grid gap-8 bg-background px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]",
      section.variant === "editorial" && "min-h-72",
    )}
  >
    <div className="flex min-h-44 flex-col justify-center">
      <Badge className="mb-3 w-fit">Featured</Badge>
      <h2 className="max-w-xl text-3xl font-bold">
        {section.settings?.title || "Build your perfect storefront"}
      </h2>
      <p className="mt-3 max-w-lg text-sm text-muted-foreground">
        Preview how this section order and variant set will feel for shoppers.
      </p>
      <Button className="mt-5 w-fit">Shop Now</Button>
    </div>
    {(section.variant === "splitBanner" || section.variant === "offerBanner") && (
      <div className="relative min-h-72 overflow-hidden rounded-lg bg-card p-6 shadow-lg">
        <div className="absolute inset-0 bg-primary/15" />
        <div className="relative mt-32 w-fit rounded-lg bg-background/90 p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Limited Offer</p>
          <h3 className="mt-1 text-2xl font-bold">Weekend Deals</h3>
        </div>
      </div>
    )}
  </div>
);

const CategoriesPreview = ({ section }) => {
  if (section.variant === "leftSidebar") {
    return (
      <div className="border-y bg-secondary/50 px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-lg bg-sidebar p-4 text-sidebar-foreground shadow-md">
            {["Fresh Picks", "Best Sellers", "Offers", "New Arrivals"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent"
                >
                  {item}
                </div>
              ),
            )}
          </aside>
          <div className="grid gap-4 md:grid-cols-3">
            {["Daily Needs", "Fresh Food", "Care"].map((item) => (
              <div key={item} className="rounded-lg border bg-card p-4">
                <div className="mb-3 h-20 rounded-md bg-muted" />
                <h3 className="font-semibold">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-y bg-secondary/50 px-6 py-10">
    <div className="grid gap-4 sm:grid-cols-4">
      {["Women", "Men", "Home", "Beauty"].map((item) => (
        <div
          key={item}
          className="rounded-lg border bg-card p-4 text-center text-sm font-medium"
        >
          {item}
        </div>
      ))}
    </div>
    </div>
  );
};

const ProductsPreview = ({ section }) => {
  const limit = Math.min(Math.max(section.settings?.limit || 6, 3), 9);
  const source = section.settings?.source || "featured";

  return (
    <div className="bg-background px-6 py-12">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="font-semibold capitalize">{source} Products</h3>
        <Badge variant="outline">{limit} items</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-lg border bg-card">
            <div className="h-40 bg-muted" />
            <div className="space-y-3 p-4">
            <p className="text-sm font-medium">Product {index + 1}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                Rs. {999 + index * 250}
              </span>
              <Button size="sm" variant="outline">
                Add
              </Button>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PromoPreview = ({ section }) => (
  <div className="bg-primary px-6 py-6 text-primary-foreground">
    <p className="text-sm opacity-85">{section.variant} section</p>
    <h3 className="mt-1 text-xl font-semibold">
      Offers, trust blocks, coupons and newsletter sections fit here.
    </h3>
  </div>
);

const FooterPreview = ({ section }) => (
  <footer className="bg-sidebar px-6 py-10 text-sidebar-foreground">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold">Zyno Store</h3>
        <p className="mt-1 text-sm opacity-85">
          Footer variant: {section.variant}
        </p>
      </div>
      <div className="flex gap-4 text-sm opacity-85">
        <span>Support</span>
        <span>Shipping</span>
        <span>Returns</span>
      </div>
    </div>
  </footer>
);

const renderSection = (section) => {
  if (section.type === "header") return <HeaderPreview section={section} />;
  if (section.type === "hero") return <HeroPreview section={section} />;
  if (section.type === "categories") {
    return <CategoriesPreview section={section} />;
  }
  if (section.type === "products") return <ProductsPreview section={section} />;
  if (section.type === "promo") return <PromoPreview section={section} />;
  if (section.type === "footer") return <FooterPreview section={section} />;

  return (
    <div className="rounded-lg border bg-white p-5">
      <p className="text-sm text-muted-foreground">{sectionTitle(section)}</p>
    </div>
  );
};

export const TemplateStorefrontPreview = ({ template }) => {
  const enabledSections = getEnabledSections(template);

  if (enabledSections.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Enable at least one section to preview this template.
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg border bg-background text-foreground"
      style={{ "--store-content-max-width": "80rem" }}
    >
      <div>
        {enabledSections.map((section) => (
          <div key={section.id}>
            {renderSection(section)}
          </div>
        ))}
      </div>
    </div>
  );
};
