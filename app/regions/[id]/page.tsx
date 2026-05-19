import { notFound } from "next/navigation";
import { getRegionById, getDrinksByRegion, getStoresByRegion } from "@/lib/data";
import RegionDetailClient from "@/components/RegionDetailClient";

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [region, drinks, stores] = await Promise.all([
    getRegionById(id),
    getDrinksByRegion(id),
    getStoresByRegion(id),
  ]);

  if (!region) notFound();

  return <RegionDetailClient region={region} drinks={drinks} stores={stores} />;
}
