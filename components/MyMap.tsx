"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import MapboxMap, { Source, Layer, MapRef } from "react-map-gl/mapbox";
import type { LayerSpecification, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { Region, RecordWithJoin } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const recordedPointLayer: LayerSpecification = {
  id: "recorded-point",
  type: "circle",
  source: "myrecords",
  paint: {
    "circle-color": "#E8A045",
    "circle-radius": 12,
    "circle-stroke-width": 3,
    "circle-stroke-color": "#F8F3EC",
  },
};

type Props = {
  onGoToRegion: (region: Region) => void;
};

export default function MyMap({ onGoToRegion }: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [records, setRecords] = useState<RecordWithJoin[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("records")
      .select("*, drinks(*), regions(*)")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(({ data }) => {
        setRecords((data as RecordWithJoin[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  // 産地ごとに1つのピンを表示（重複を除外）
  const regionEntries: [string, Region][] = [];
  const seenIds = new globalThis.Set<string>();
  for (const r of records) {
    if (!seenIds.has(r.region_id)) {
      seenIds.add(r.region_id);
      regionEntries.push([r.region_id, r.regions]);
    }
  }

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: regionEntries.map(([, r]) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
      properties: { id: r.id },
    })),
  };

  const selectedRegion = selectedRegionId
    ? (regionEntries.find(([id]) => id === selectedRegionId)?.[1] ?? null)
    : null;
  const selectedRecords = selectedRegionId
    ? records.filter((r) => r.region_id === selectedRegionId)
    : [];

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["recorded-point"],
      });
      if (features.length > 0) {
        const regionId = features[0].properties?.id as string;
        setSelectedRegionId(regionId);
      }
    },
    []
  );

  return (
    <div className="relative w-full h-full">
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 136, latitude: 36, zoom: 4 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={handleMapClick}
        cursor="auto"
      >
        <Source id="myrecords" type="geojson" data={geojson}>
          <Layer {...recordedPointLayer} />
        </Source>
      </MapboxMap>

      {/* 空の状態 */}
      {!loading && records.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-2xl px-6 py-5 text-center shadow">
            <p className="text-2xl mb-2">🍶</p>
            <p className="text-sm font-medium text-[#0D1B2A]">まだ記録がありません</p>
            <p className="text-xs text-[#0D1B2A]/50 mt-1">
              お酒を飲んだら「飲んだ ✓」で記録しましょう
            </p>
          </div>
        </div>
      )}

      {/* 産地ポップアップ */}
      {selectedRegion && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setSelectedRegionId(null)} />
          <div className="fixed bottom-16 left-0 right-0 z-20 bg-[#F8F3EC] rounded-t-2xl shadow-2xl max-h-[60dvh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#0D1B2A]/20" />
            </div>

            <div className="flex items-start justify-between px-5 pt-2 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#0D1B2A]">{selectedRegion.name}</h2>
                <p className="text-sm text-[#0D1B2A]/50">{selectedRegion.country}</p>
              </div>
              <button
                onClick={() => setSelectedRegionId(null)}
                className="text-[#0D1B2A]/40 text-2xl leading-none mt-1"
              >
                ×
              </button>
            </div>

            <ul className="px-5 pb-8 space-y-3">
              {selectedRecords.map((rec) => (
                <li
                  key={rec.id}
                  className="border border-[#0D1B2A]/10 rounded-xl p-4 bg-white"
                >
                  <button
                    className="text-left w-full"
                    onClick={() => {
                      setSelectedRegionId(null);
                      onGoToRegion(selectedRegion);
                    }}
                  >
                    <p className="font-semibold text-[#0D1B2A] text-sm">{rec.drinks.name}</p>
                    <p className="text-xs text-[#E8A045] mt-0.5">{rec.drinks.genre}</p>
                  </button>
                  <p className="text-xs text-[#0D1B2A]/50 mt-2">
                    {new Date(rec.date).toLocaleDateString("ja-JP", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                  {rec.memo && (
                    <p className="text-xs text-[#0D1B2A]/70 mt-1 leading-relaxed">{rec.memo}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
