"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product, addLabel = "Add" }) {
  const router = useRouter();
  const { addItem } = useCart();
  const firstVariant = product.variants?.[0];

  const openProduct = () => {
    router.push(product.href);
  };

  return (
    <Card
      role="link"
      tabIndex={0}
      onClick={openProduct}
      onKeyDown={(event) => {
        if (event.key === "Enter") openProduct();
      }}
      className="group h-full cursor-pointer overflow-hidden rounded-lg transition-shadow hover:shadow-[var(--shadow-md)]"
    >
        {product.image && (
          <div className="relative h-56 overflow-hidden bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.tag && <Badge className="absolute left-3 top-3">{product.tag}</Badge>}
          </div>
        )}

        <CardContent className="space-y-4 p-4">
          <div className="space-y-1">
            <p className="font-semibold group-hover:text-primary">{product.name}</p>
            {product.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
            )}
            {product.vendor && (
              <p className="text-xs text-muted-foreground">{product.vendor}</p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-bold">{product.priceRange || product.price}</span>
            <Button
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                addItem({
                  product,
                  variant: firstVariant,
                  quantity: 1,
                });
              }}
            >
              {addLabel}
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}
