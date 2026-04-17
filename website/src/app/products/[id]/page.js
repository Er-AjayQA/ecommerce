import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  return <ProductDetailClient id={id} />;
}
