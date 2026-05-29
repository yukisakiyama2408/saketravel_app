import { notFound } from "next/navigation";
import { getDrinkById, getStoresByDrink } from "@/lib/data";
import DrinkPageClient from "@/components/DrinkPageClient";

export const dynamic = "force-dynamic";

export default async function DrinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const drink = await getDrinkById(id);
  if (!drink) notFound();

  const stores = await getStoresByDrink(id);

  return <DrinkPageClient drink={drink} stores={stores} />;
}
