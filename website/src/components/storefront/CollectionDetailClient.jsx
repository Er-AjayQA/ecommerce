"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/storefront/ProductCard";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useStorefront } from "@/context/StorefrontContext";
import {
  getWebsiteCollection,
  getWebsiteCollectionProducts,
  normalizeCollectionOption,
  normalizeProduct,
} from "@/lib/website-api";

export function CollectionDetailClient({ id }) {
  const { host } = useStorefront();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!host) return;

    let isMounted = true;

    async function loadCollection() {
      const [collectionResult, productResult] = await Promise.all([
        getWebsiteCollection(host, id),
        getWebsiteCollectionProducts(host, id, { limit: 200 }),
      ]);
      const normalizedCollection = normalizeCollectionOption(collectionResult);
      const normalizedProducts = productResult.items
        .map(normalizeProduct)
        .filter(Boolean);
      const collectionImages = (collectionResult?.media || [])
        .filter((item) => item.type !== "video" && item.url && !item.isDeleted)
        .sort((a, b) => (a.position || a.order_by || 0) - (b.position || b.order_by || 0))
        .map((item) => item.url);

      if (isMounted) {
        setCollection(
          collectionResult && normalizedCollection
            ? {
                ...normalizedCollection,
                description: collectionResult.description || "",
                image: collectionImages[0] || "",
                images: collectionImages,
              }
            : null
        );
        setSelectedImage(collectionImages[0] || "");
        setProducts(normalizedProducts);
        setIsLoading(false);
      }
    }

    loadCollection();

    return () => {
      isMounted = false;
    };
  }, [host, id]);

  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-10 lg:px-6">
        {isLoading && <p className="text-sm text-muted-foreground">Loading collection</p>}

        {!isLoading && !collection && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="text-xl font-semibold">Collection not found</h1>
          </div>
        )}

        {collection && (
          <div className="space-y-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div className="space-y-4">
                <Badge className="w-fit">Collection</Badge>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                  {collection.title}
                </h1>
                {collection.description && (
                  <p className="max-w-2xl text-muted-foreground">
                    {collection.description}
                  </p>
                )}
              </div>

              {selectedImage && (
                <div className="space-y-3">
                  <div className="relative min-h-[320px] overflow-hidden rounded-lg bg-muted shadow-[var(--shadow-lg)]">
                    <Image
                      src={selectedImage}
                      alt={collection.title}
                      fill
                      priority
                      sizes="(min-width: 1024px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  {collection.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {collection.images.map((image) => (
                        <button
                          key={image}
                          type="button"
                          onClick={() => setSelectedImage(image)}
                          className={[
                            "relative h-16 overflow-hidden rounded-md border bg-muted",
                            selectedImage === image ? "border-primary ring-2 ring-ring/30" : "border-border",
                          ].join(" ")}
                        >
                          <Image
                            src={image}
                            alt={collection.title}
                            fill
                            sizes="20vw"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                  <p className="text-sm text-muted-foreground">
                    {products.length} products in this collection
                  </p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <h2 className="text-lg font-semibold">No products found</h2>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((product) => (
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
