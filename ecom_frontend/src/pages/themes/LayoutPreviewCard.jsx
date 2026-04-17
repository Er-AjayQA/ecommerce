import { useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLayouts } from "@/context/layoutsContext";
import { cn } from "@/lib/utils";

const getHeroClass = (hero) => {
  if (hero === "split") return "grid grid-cols-2 gap-2";
  if (hero === "compact") return "h-10";
  if (hero === "immersive" || hero === "editorial") return "h-24";
  return "h-16";
};

const getProductCount = (count) => Math.min(Math.max(count || 4, 3), 9);

const StorefrontPreview = ({ layout }) => {
  const preview = layout?.preview || {};
  const productCount = getProductCount(preview.productCards);
  const isSidebarCatalog = Boolean(layout?.sidebar?.enabled);
  const isPromoShell = layout?.shell === "promo";
  const isEditorialShell =
    layout?.shell === "editorial" || layout?.shell === "story";

  return (
    <div className="overflow-hidden rounded-lg border bg-white text-foreground">
      <div
        className={cn(
          "border-b px-6 py-3",
          isEditorialShell ? "bg-primary text-primary-foreground" : "bg-white",
        )}
      >
        {isPromoShell && (
          <div className="mb-3 rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-primary-foreground">
            Flash sale live today. Extra 20% off selected products.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-lg font-bold">Zyno Store</div>
          <div className="flex items-center gap-4 text-sm">
            <span>Shop</span>
            <span>Collections</span>
            <span>Deals</span>
            <span>Contact</span>
          </div>
          <div className="flex min-w-44 items-center rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
            Search products
          </div>
        </div>
      </div>

      <div className="bg-muted/30 p-6">
        <div
          className={cn(
            "grid gap-5",
            preview.hero === "split" && "md:grid-cols-[1.1fr_0.9fr]",
          )}
        >
          <div
            className={cn(
              "flex min-h-48 flex-col justify-center rounded-lg bg-primary/15 p-8",
              (preview.hero === "immersive" ||
                preview.hero === "editorial" ||
                preview.hero === "story") &&
                "min-h-72",
              preview.hero === "compact" && "min-h-32",
            )}
          >
            <Badge className="mb-3 w-fit">New Season</Badge>
            <h2 className="max-w-xl text-3xl font-bold">
              Fresh products picked for your storefront
            </h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">
              Discover best sellers, curated collections and offers in a layout
              built for ecommerce browsing.
            </p>
            <Button className="mt-5 w-fit">Shop Now</Button>
          </div>

          {preview.hero === "split" && (
            <div className="grid gap-5">
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">Limited Offer</p>
                <h3 className="mt-2 text-xl font-semibold">Weekend Deals</h3>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground">Trending</p>
                <h3 className="mt-2 text-xl font-semibold">Best Sellers</h3>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
          {isSidebarCatalog && (
            <aside className="rounded-lg border bg-white p-4">
              <h3 className="font-semibold">Categories</h3>
              {["Fresh Picks", "Best Sellers", "Offers", "New Arrivals"].map(
                (item) => (
                  <div
                    key={item}
                    className="mt-3 rounded-md bg-muted px-3 py-2 text-sm"
                  >
                    {item}
                  </div>
                ),
              )}
            </aside>
          )}

          <div className={cn("space-y-6", !isSidebarCatalog && "lg:col-span-2")}>
            {!isSidebarCatalog && (
              <div className="grid gap-3 sm:grid-cols-4">
                {["Women", "Men", "Home", "Beauty"].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border bg-white p-4 text-center text-sm font-medium"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: productCount }).map((_, index) => (
                <div key={index} className="rounded-lg border bg-white p-3">
                  <div className="h-32 rounded-md bg-muted" />
                  <p className="mt-3 text-sm font-medium">
                    Product {index + 1}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Rs. {999 + index * 250}
                    </span>
                    <Button size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-white p-5">
              <p className="text-sm text-muted-foreground">
                Template-controlled section
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                Offers, trust blocks and newsletter sections fit here.
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LayoutPreviewCard = ({ layout }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { appliedLayout, handleApplyLayout } = useLayouts();
  const isApplied =
    appliedLayout?.layout_id === layout?.id || appliedLayout?.id === layout?.id;
  const preview = layout?.preview || {};
  const productCount = getProductCount(preview.productCards);

  return (
    <Card className="flex h-full flex-col overflow-hidden border transition-all duration-200 hover:shadow-lg">
      <div className="flex-1 border-b bg-muted/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">{layout.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {layout.description}
            </p>
          </div>

          <Badge variant="secondary" className="shrink-0">
            {layout.shell}
          </Badge>
        </div>

        <div className="mt-4 space-y-3 rounded-lg border bg-background p-3">
          <div className="flex h-8 items-center justify-between rounded-md bg-secondary px-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-12 rounded bg-primary/70" />
              <div className="h-2 w-8 rounded bg-secondary-foreground/20" />
              <div className="h-2 w-8 rounded bg-secondary-foreground/20" />
            </div>
            <div className="h-4 w-14 rounded-full bg-primary/25" />
          </div>

          <div
            className={cn(
              "rounded-md bg-primary/15 p-2",
              getHeroClass(preview.hero),
            )}
          >
            {preview.hero === "split" ? (
              <>
                <div className="rounded bg-primary/35" />
                <div className="rounded bg-muted" />
              </>
            ) : (
              <div className="flex h-full flex-col justify-center gap-2">
                <div className="h-3 w-24 rounded bg-primary/60" />
                <div className="h-2 w-36 rounded bg-primary/25" />
                <div className="h-4 w-16 rounded bg-primary/45" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {(preview.sections || []).slice(0, 3).map((section) => (
              <div
                key={`${layout.id}-${section}`}
                className="h-7 flex-1 rounded-md border bg-card"
                title={section}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: productCount }).map((_, index) => (
              <div
                key={`${layout.id}-product-${index}`}
                className="rounded-md border bg-card p-1.5"
              >
                <div className="mb-1.5 h-8 rounded bg-muted" />
                <div className="mb-1 h-1.5 rounded bg-muted-foreground/20" />
                <div className="h-1.5 w-2/3 rounded bg-primary/30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 p-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{layout.contentWidth}</Badge>
          <Badge variant="outline">
            {layout.sidebar?.enabled ? "sidebar" : "top nav"}
          </Badge>
          <Badge variant="outline">{layout.headerPlacement}</Badge>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="whitespace-nowrap"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          {isApplied ? (
            <Button size="sm" disabled className="whitespace-nowrap bg-green-400">
              Applied
            </Button>
          ) : (
            <Button
              size="sm"
              className="whitespace-nowrap"
              onClick={() => handleApplyLayout(layout)}
            >
              Apply Layout
            </Button>
          )}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{layout.name} Preview</DialogTitle>
            <DialogDescription>{layout.description}</DialogDescription>
          </DialogHeader>

          <StorefrontPreview layout={layout} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
