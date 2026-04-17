import { Suspense } from "react";
import { ProductsPageClient } from "@/components/storefront/ProductsPageClient";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageClient />
    </Suspense>
  );
}
