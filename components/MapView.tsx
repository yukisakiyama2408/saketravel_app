"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent, LayerSpecification } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByUser } from "@/lib/data";
import type { Region, RecordWithJoin } from "@/types";
import RegionPanel from "./RegionPanel";
import SearchBox from "./SearchBox";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// ズームによってドット ↔ エリア塗りを切り替えるしきい値
const ZOOM_THRESHOLD = 6;

function pointInPolygon(point: [number, number], ring: number[][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function regionInFeature(region: Region, feature: GeoJSON.Feature): boolean {
  const geom = feature.geometry;
  const pt: [number, number] = [region.longitude, region.latitude];
  if (geom.type === "Polygon") {
    return pointInPolygon(pt, (geom as GeoJSON.Polygon).coordinates[0]);
  }
  if (geom.type === "MultiPolygon") {
    return (geom as GeoJSON.MultiPolygon).coordinates.some((poly) =>
      pointInPolygon(pt, poly[0]),
    );
  }
  return false;
}

const clusterLayer: LayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "regions",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#E8A045",
    "circle-radius": ["step", ["get", "point_count"], 20, 5, 28, 10, 36],
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0,
      ZOOM_THRESHOLD,
      0.9,
    ],
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
    "text-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0,
      ZOOM_THRESHOLD,
      1,
    ],
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
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0,
      ZOOM_THRESHOLD,
      1,
    ],
    "circle-stroke-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0,
      ZOOM_THRESHOLD,
      1,
    ],
  },
};

const recordedHaloLayer: LayerSpecification = {
  id: "recorded-halo",
  type: "circle",
  source: "recorded-regions",
  paint: {
    "circle-color": "#E8A045",
    "circle-radius": 17,
    "circle-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0,
      ZOOM_THRESHOLD,
      0.25,
    ],
  },
};

const prefectureFillLayer: LayerSpecification = {
  id: "prefecture-fill",
  type: "fill",
  source: "prefecture-drinks",
  paint: {
    "fill-color": "#E8A045",
    "fill-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0.35,
      ZOOM_THRESHOLD,
      0,
    ],
  },
};

const prefectureBorderLayer: LayerSpecification = {
  id: "prefecture-border",
  type: "line",
  source: "prefecture-drinks",
  paint: {
    "line-color": "#E8A045",
    "line-width": 1.5,
    "line-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      ZOOM_THRESHOLD - 1,
      0.8,
      ZOOM_THRESHOLD,
      0,
    ],
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
      const field = (layer as { layout?: Record<string, unknown> }).layout?.[
        "text-field"
      ];
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

export default function MapView({
  regions,
  focusRegion,
  onFocusConsumed,
}: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [lang, setLang] = useState<Lang>("ja");
  const [userRecords, setUserRecords] = useState<RecordWithJoin[]>([]);
  const [prefectureBase, setPrefectureBase] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson",
    )
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) => setPrefectureBase(data))
      .catch(() => {
        /* 取得失敗時は都道府県塗りをスキップ */
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setUserRecords([]);
      return;
    }
    getRecordsByUser(user.id).then(setUserRecords);
  }, [user]);

  useEffect(() => {
    if (!focusRegion) return;
    const map = mapRef.current?.getMap();
    if (map) {
      map.flyTo({
        center: [focusRegion.longitude, focusRegion.latitude],
        zoom: 8,
        duration: 1500,
      });
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

  const prefectureDrinksGeojson = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!prefectureBase) return { type: "FeatureCollection", features: [] };
    return {
      type: "FeatureCollection",
      features: prefectureBase.features.filter((f) =>
        regions.some((r) => regionInFeature(r, f)),
      ),
    };
  }, [prefectureBase, regions]);

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
        const source = map.getSource("regions") as unknown as {
          getClusterExpansionZoom: (id: number) => Promise<number>;
        };
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const coords = (clusterFeatures[0].geometry as GeoJSON.Point)
          .coordinates;
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
    [regions],
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
        projection="mercator"
        onClick={handleMapClick}
        cursor="auto"
        onLoad={(e) => applyMapLanguage(e.target, lang)}
      >
        <Source
          id="prefecture-drinks"
          type="geojson"
          data={prefectureDrinksGeojson}
        >
          <Layer {...prefectureFillLayer} />
          <Layer {...prefectureBorderLayer} />
        </Source>
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
          getRecordsByUser(user.id).then(setUserRecords);
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
