import { CollectionDetailClient } from "@/components/storefront/CollectionDetailClient";

export default async function CollectionDetailPage({ params }) {
  const { id } = await params;

  return <CollectionDetailClient id={id} />;
}
