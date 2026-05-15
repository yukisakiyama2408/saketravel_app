"use client";

import MapView from "@/components/MapView";
import type { Region } from "@/types";

type Props = {
  regions: Region[];
};

export default function AppShell({ regions }: Props) {
  return (
    <div className="h-full">
      <MapView regions={regions} />
    </div>
  );
}
