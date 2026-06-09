import { getDrinkById, getRegionById, getRegions } from "@/lib/data";
import AppShell from "@/components/AppShell";
import type { Region } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = {
  region?: string;
  drink?: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const regions = await getRegions();

  let focusRegion: Region | null = null;
  let focusDrinkId: string | null = null;

  if (params?.drink) {
    const drink = await getDrinkById(params.drink);
    if (drink) {
      focusRegion = drink.region;
      focusDrinkId = drink.id;
    }
  } else if (params?.region) {
    focusRegion =
      regions.find((region) => region.id === params.region) ??
      (await getRegionById(params.region));
  }

  return (
    <AppShell
      regions={regions}
      focusRegion={focusRegion}
      focusDrinkId={focusDrinkId}
    />
  );
}
