"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StorePageShell } from "@/components/storefront/StorePageShell";
import { useCart } from "@/context/CartContext";
import { useStorefront } from "@/context/StorefrontContext";
import { getWebsiteProduct, normalizeProduct } from "@/lib/website-api";

export function ProductDetailClient({ id }) {
  const { host } = useStorefront();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!host) return;

    let isMounted = true;

    async function loadProduct() {
      const result = await getWebsiteProduct(host, id);
      const normalizedProduct = normalizeProduct(result);

      if (isMounted) {
        const firstVariant = normalizedProduct?.variants?.[0];
        const firstSelectedOptions = {};
        firstVariant?.optionValues?.forEach((value) => {
          if (value.product_option_id) {
            firstSelectedOptions[value.product_option_id] = value.option_value_id;
          }
        });

        setProduct(normalizedProduct);
        setSelectedVariantId(firstVariant?.product_variant_id || "");
        setSelectedOptions(firstSelectedOptions);
        setSelectedImage(normalizedProduct?.images?.[0] || "");
        setIsLoading(false);
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [host, id]);

  const selectedVariant = useMemo(() => {
    return product?.variants?.find(
      (variant) => variant.product_variant_id === selectedVariantId
    );
  }, [product, selectedVariantId]);

  const findVariantByOptions = (options) => {
    if (!product) return null;
    const selectedValueIds = Object.values(options).filter(Boolean);

    return product.variants.find((variant) => {
      const variantValueIds = (variant.optionValues || []).map(
        (value) => value.option_value_id
      );

      return selectedValueIds.every((valueId) => variantValueIds.includes(valueId));
    });
  };

  const isOptionValueAvailable = (optionId, valueId) => {
    const nextOptions = {
      ...selectedOptions,
      [optionId]: valueId,
    };

    return Boolean(findVariantByOptions(nextOptions));
  };

  const handleOptionSelect = (optionId, valueId) => {
    const nextOptions = {
      ...selectedOptions,
      [optionId]: valueId,
    };
    const nextVariant = findVariantByOptions(nextOptions);

    setSelectedOptions(nextOptions);

    if (nextVariant) {
      setSelectedVariantId(nextVariant.product_variant_id);
    }
  };

  const updateZoomPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  return (
    <StorePageShell>
      <section className="mx-auto max-w-[var(--store-content-max-width)] px-4 py-10 lg:px-6">
        {isLoading && <p className="text-sm text-muted-foreground">Loading product</p>}

        {!isLoading && !product && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h1 className="text-xl font-semibold">Product not found</h1>
          </div>
        )}

        {product && (
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <div
              className={
                product.images.length > 1
                  ? "grid gap-4 lg:grid-cols-[96px_minmax(0,1fr)]"
                  : "grid gap-4"
              }
            >
              {product.images.length > 1 && (
                <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:max-h-[620px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pr-1">
                  {product.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      className={[
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-card lg:h-24 lg:w-24",
                        selectedImage === image
                          ? "border-primary ring-2 ring-ring/30"
                          : "border-border",
                      ].join(" ")}
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} image ${index + 1}`}
                        fill
                        sizes="96px"
                        className="object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="order-1 lg:order-2">
                {selectedImage ? (
                  <div
                    className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-lg border border-border bg-card"
                    onMouseMove={updateZoomPosition}
                    onMouseEnter={() => setIsZooming(true)}
                    onMouseLeave={() => setIsZooming(false)}
                  >
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      priority
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-contain p-4"
                    />

                    {isZooming && (
                      <div
                        className="pointer-events-none absolute hidden h-40 w-40 rounded-full border border-border bg-card shadow-[var(--shadow-lg)] lg:block"
                        style={{
                          left: `${zoomPosition.x}%`,
                          top: `${zoomPosition.y}%`,
                          transform: "translate(-50%, -50%)",
                          backgroundImage: `url(${selectedImage})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "220%",
                          backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
                    No product image
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {product.category && <Badge>{product.category}</Badge>}
                  {product.productType && (
                    <Badge variant="secondary">{product.productType}</Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
                {product.vendor && (
                  <p className="text-sm text-muted-foreground">{product.vendor}</p>
                )}
                <p className="text-2xl font-bold">
                  {selectedVariant?.price
                    ? `$${Number(selectedVariant.price).toFixed(2)}`
                    : product.priceRange || product.price}
                </p>
                {product.description && (
                  <p className="leading-7 text-muted-foreground">{product.description}</p>
                )}
              </div>

              {product.tags.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.options.length > 0 && (
                <div className="space-y-4">
                  {product.options.map((option) => (
                    <div key={option.id}>
                      <p className="mb-2 text-sm font-medium">{option.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const isSelected = selectedOptions[option.id] === value.id;
                          const isAvailable = isOptionValueAvailable(option.id, value.id);

                          return (
                          <button
                            key={value.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleOptionSelect(option.id, value.id)}
                            className={[
                              "rounded-md border px-3 py-1.5 text-sm transition-colors",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary",
                              !isAvailable ? "cursor-not-allowed opacity-40" : "",
                            ].join(" ")}
                          >
                            {value.value}
                          </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedVariant && (
                <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
                  <p>SKU: {selectedVariant.sku || product.sku}</p>
                  <p>Stock: {selectedVariant.inventory_quantity ?? 0}</p>
                </div>
              )}

              <Button
                size="lg"
                className="w-full"
                disabled={product.variants.length > 0 && !selectedVariant}
                onClick={() =>
                  addItem({
                    product,
                    variant: selectedVariant,
                    quantity: 1,
                  })
                }
              >
                Add to cart
              </Button>
            </div>
          </div>
        )}
      </section>
    </StorePageShell>
  );
}
