"use client";

import { useState } from "react";
import MapView from "@/components/MapView";
import MyMap from "@/components/MyMap";
import type { Region } from "@/types";

type Tab = "home" | "mymap";

type Props = {
  regions: Region[];
};

export default function AppShell({ regions }: Props) {
  const [tab, setTab] = useState<Tab>("home");
  const [focusRegion, setFocusRegion] = useState<Region | null>(null);

  function handleGoToRegion(region: Region) {
    setFocusRegion(region);
    setTab("home");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 relative">
        {tab === "home" ? (
          <MapView
            regions={regions}
            focusRegion={focusRegion}
            onFocusConsumed={() => setFocusRegion(null)}
          />
        ) : (
          <MyMap onGoToRegion={handleGoToRegion} />
        )}
      </div>

      {/* ボトムタブバー */}
      <div className="flex-shrink-0 flex border-t border-[#0D1B2A]/10 bg-[#F8F3EC]">
        <button
          onClick={() => setTab("home")}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
            tab === "home" ? "text-[#E8A045]" : "text-[#0D1B2A]/40"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-[10px] font-medium">探す</span>
        </button>
        <button
          onClick={() => setTab("mymap")}
          className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${
            tab === "mymap" ? "text-[#E8A045]" : "text-[#0D1B2A]/40"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-[10px] font-medium">マイマップ</span>
        </button>
      </div>
    </div>
  );
}
