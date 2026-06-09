"use client";

import MapView from "@/components/MapView";
import type { Region } from "@/types";

type Props = {
  regions: Region[];
  focusRegion?: Region | null;
  focusDrinkId?: string | null;
};

export default function AppShell({ regions, focusRegion, focusDrinkId }: Props) {
  return (
    <div className="h-full">
      <MapView
        regions={regions}
        focusRegion={focusRegion}
        focusDrinkId={focusDrinkId}
      />
    </div>
  );
}
