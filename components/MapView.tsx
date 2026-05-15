"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent, LayerSpecification } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import type { Region, RecordWithJoin } from "@/types";
import RegionPanel from "./RegionPanel";
import SearchBox from "./SearchBox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const clusterLayer: LayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "regions",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#E8A045",
    "circle-radius": ["step", ["get", "point_count"], 20, 5, 28, 10, 36],
    "circle-opacity": 0.9,
  },
};

const clusterCountLayer: LayerSpecification = {
  id: "cluster-count",
  type: "symbol",
  source: "regions",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-size": 13,
  },
  paint: {
    "text-color": "#0D1B2A",
  },
};

const unclusteredPointLayer: LayerSpecification = {
  id: "unclustered-point",
  type: "circle",
  source: "regions",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#E8A045",
    "circle-radius": 10,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#F8F3EC",
  },
};

const recordedHaloLayer: LayerSpecification = {
  id: "recorded-halo",
  type: "circle",
  source: "recorded-regions",
  paint: {
    "circle-color": "#E8A045",
    "circle-radius": 17,
    "circle-opacity": 0.25,
  },
};

type Lang = "ja" | "en";

type Props = {
  regions: Region[];
  focusRegion?: Region | null;
  onFocusConsumed?: () => void;
};

function applyMapLanguage(map: mapboxgl.Map, lang: Lang) {
  const layers = map.getStyle()?.layers ?? [];
  for (const layer of layers) {
    if (layer.type === "symbol") {
      const field = (layer as { layout?: Record<string, unknown> }).layout?.["text-field"];
      if (field) {
        map.setLayoutProperty(layer.id, "text-field", [
          "coalesce",
          ["get", `name_${lang}`],
          ["get", "name"],
        ]);
      }
    }
  }
}

export default function MapView({ regions, focusRegion, onFocusConsumed }: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [lang, setLang] = useState<Lang>("ja");
  const [userRecords, setUserRecords] = useState<RecordWithJoin[]>([]);

  useEffect(() => {
    if (!user) { setUserRecords([]); return; }
    supabase
      .from("records")
      .select("*, drinks(*), regions(*)")
      .eq("user_id", user.id)
      .then(({ data }) => setUserRecords((data as RecordWithJoin[]) ?? []));
  }, [user]);

  useEffect(() => {
    if (!focusRegion) return;
    const map = mapRef.current?.getMap();
    if (map) {
      map.flyTo({ center: [focusRegion.longitude, focusRegion.latitude], zoom: 8, duration: 1500 });
    }
    setSelectedRegion(focusRegion);
    onFocusConsumed?.();
  }, [focusRegion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map?.isStyleLoaded()) {
      applyMapLanguage(map, lang);
    }
  }, [lang]);

  const recordedRegionIds = new Set(userRecords.map((r) => r.region_id));
  const selectedRegionRecords = selectedRegion
    ? userRecords.filter((r) => r.region_id === selectedRegion.id)
    : [];

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: regions.map((r) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
      properties: { id: r.id },
    })),
  };

  const recordedGeojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: regions
      .filter((r) => recordedRegionIds.has(r.id))
      .map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: { id: r.id },
      })),
  };

  const handleSelectFromSearch = useCallback((region: Region) => {
    const map = mapRef.current?.getMap();
    if (map) {
      map.flyTo({
        center: [region.longitude, region.latitude],
        zoom: 8,
        duration: 1500,
      });
    }
    setSelectedRegion(region);
  }, []);

  const handleMapClick = useCallback(
    async (e: MapMouseEvent) => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // クラスターをクリックしたときズームイン
      const clusterFeatures = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      if (clusterFeatures.length > 0) {
        const clusterId = clusterFeatures[0].properties?.cluster_id;
        const source = map.getSource("regions") as unknown as { getClusterExpansionZoom: (id: number) => Promise<number> };
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coords = (clusterFeatures[0].geometry as GeoJSON.Point).coordinates;
        map.easeTo({ center: [coords[0], coords[1]], zoom });
        return;
      }

      // ピンをクリックしたときパネルを開く
      const pointFeatures = map.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point"],
      });
      if (pointFeatures.length > 0) {
        const regionId = pointFeatures[0].properties?.id;
        const region = regions.find((r) => r.id === regionId) ?? null;
        setSelectedRegion(region);
      }
    },
    [regions]
  );

  return (
    <div className="relative w-full h-full">
      <SearchBox onSelectRegion={handleSelectFromSearch} />
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 136, latitude: 36, zoom: 4 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={handleMapClick}
        cursor="auto"
        onLoad={(e) => applyMapLanguage(e.target, lang)}
      >
        <Source id="recorded-regions" type="geojson" data={recordedGeojson}>
          <Layer {...recordedHaloLayer} />
        </Source>
        <Source
          id="regions"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>

      <RegionPanel
        region={selectedRegion}
        regionRecords={selectedRegionRecords}
        onClose={() => setSelectedRegion(null)}
        onRecordSaved={() => {
          if (!user) return;
          supabase
            .from("records")
            .select("*, drinks(*), regions(*)")
            .eq("user_id", user.id)
            .then(({ data }) => setUserRecords((data as RecordWithJoin[]) ?? []));
        }}
      />

      {/* 言語切り替えボタン */}
      <div className="absolute bottom-4 right-4 flex rounded-full overflow-hidden border border-[#0D1B2A]/20 shadow-md text-xs font-medium">
        <button
          onClick={() => setLang("ja")}
          className={`px-3 py-1.5 transition-colors ${
            lang === "ja"
              ? "bg-[#0D1B2A] text-[#E8A045]"
              : "bg-[#F8F3EC] text-[#0D1B2A]/50 hover:text-[#0D1B2A]"
          }`}
        >
          日本語
        </button>
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1.5 transition-colors ${
            lang === "en"
              ? "bg-[#0D1B2A] text-[#E8A045]"
              : "bg-[#F8F3EC] text-[#0D1B2A]/50 hover:text-[#0D1B2A]"
          }`}
        >
          EN
        </button>
      </div>
    </div>
  );
}
