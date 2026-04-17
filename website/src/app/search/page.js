import { Suspense } from "react";
import { SearchPageClient } from "@/components/storefront/SearchPageClient";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageClient />
    </Suspense>
  );
}
