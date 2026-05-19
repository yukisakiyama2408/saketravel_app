"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Map, { Source, Layer, Marker, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent, LayerSpecification } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAuth } from "@/components/AuthProvider";
import { getRecordsByUser, getAllDrinks } from "@/lib/data";
import type { Region, RecordWithJoin } from "@/types";
import RegionPanel from "./RegionPanel";
import SearchBox from "./SearchBox";
import Pin from "./Pin";
import CountryPin from "./CountryPin";
import GenreChips from "./GenreChips";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const ZOOM_THRESHOLD = 6;

type Genre = "sake" | "wine" | "beer";

const COUNTRY_FLAGS: Record<string, string> = {
  "日本": "🇯🇵",
  "フランス": "🇫🇷",
  "アメリカ": "🇺🇸",
  "チェコ": "🇨🇿",
  "イタリア": "🇮🇹",
  "スペイン": "🇪🇸",
  "ドイツ": "🇩🇪",
  "イギリス": "🇬🇧",
};

const GENRE_LABELS: Record<Genre, string> = {
  sake: "🍶 日本酒",
  wine: "🍷 ワイン",
  beer: "🍺 ビール",
};

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
      pointInPolygon(pt, poly[0])
    );
  }
  return false;
}

type Lang = "ja" | "en";

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

const clusterLayer: LayerSpecification = {
  id: "clusters",
  type: "circle",
  source: "regions",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#C8893D",
    "circle-radius": ["step", ["get", "point_count"], 20, 5, 28, 10, 36],
    "circle-opacity": [
      "interpolate", ["linear"], ["zoom"],
      ZOOM_THRESHOLD - 1, 0,
      ZOOM_THRESHOLD, 0.9,
    ],
  },
};

const clusterCountLayer: LayerSpecification = {
  id: "cluster-count",
  type: "symbol",
  source: "regions",
  filter: ["has", "point_count"],
  layout: { "text-field": "{point_count_abbreviated}", "text-size": 13 },
  paint: {
    "text-color": "#0D1B2A",
    "text-opacity": [
      "interpolate", ["linear"], ["zoom"],
      ZOOM_THRESHOLD - 1, 0,
      ZOOM_THRESHOLD, 1,
    ],
  },
};

const prefectureFillLayer: LayerSpecification = {
  id: "prefecture-fill",
  type: "fill",
  source: "prefecture-drinks",
  paint: {
    "fill-color": "#C8893D",
    "fill-opacity": [
      "interpolate", ["linear"], ["zoom"],
      ZOOM_THRESHOLD - 1, 0.35,
      ZOOM_THRESHOLD, 0,
    ],
  },
};

const prefectureBorderLayer: LayerSpecification = {
  id: "prefecture-border",
  type: "line",
  source: "prefecture-drinks",
  paint: {
    "line-color": "#C8893D",
    "line-width": 1.5,
    "line-opacity": [
      "interpolate", ["linear"], ["zoom"],
      ZOOM_THRESHOLD - 1, 0.8,
      ZOOM_THRESHOLD, 0,
    ],
  },
};

type Props = {
  regions: Region[];
  focusRegion?: Region | null;
  onFocusConsumed?: () => void;
};

export default function MapView({ regions, focusRegion, onFocusConsumed }: Props) {
  const { user } = useAuth();
  const mapRef = useRef<MapRef>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [lang, setLang] = useState<Lang>("ja");
  const [userRecords, setUserRecords] = useState<RecordWithJoin[]>([]);
  const [prefectureBase, setPrefectureBase] = useState<GeoJSON.FeatureCollection | null>(null);
  const [zoom, setZoom] = useState(2);
  const [activeGenres, setActiveGenres] = useState<Set<Genre>>(
    new Set(["sake", "wine", "beer"])
  );
  const [regionGenreMap, setRegionGenreMap] = useState<Record<string, Genre[]>>({});

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson")
      .then((r) => r.json())
      .then((data: GeoJSON.FeatureCollection) => setPrefectureBase(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) { setUserRecords([]); return; }
    getRecordsByUser(user.id).then(setUserRecords);
  }, [user]);

  useEffect(() => {
    getAllDrinks().then((drinks) => {
      const map: Record<string, Genre[]> = {};
      for (const d of drinks) {
        if (!d.genre_category) continue;
        if (!map[d.region_id]) map[d.region_id] = [];
        if (!map[d.region_id].includes(d.genre_category as Genre)) {
          map[d.region_id].push(d.genre_category as Genre);
        }
      }
      setRegionGenreMap(map);
    });
  }, []);

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
    if (map?.isStyleLoaded()) applyMapLanguage(map, lang);
  }, [lang]);

  const recordedRegionIds = useMemo(
    () => new Set(userRecords.map((r) => r.region_id)),
    [userRecords]
  );
  const recordedDrinkIds = useMemo(
    () => new Set(userRecords.map((r) => r.drink_id)),
    [userRecords]
  );

  const selectedRegionRecords = selectedRegion
    ? userRecords.filter((r) => r.region_id === selectedRegion.id)
    : [];

  const filteredRegions = useMemo(() => {
    if (activeGenres.size === 3) return regions;
    return regions.filter((r) => {
      const genres = regionGenreMap[r.id] ?? [];
      return genres.some((g) => activeGenres.has(g));
    });
  }, [regions, activeGenres, regionGenreMap]);

  const geojson = useMemo<GeoJSON.FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: filteredRegions.map((r) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.longitude, r.latitude] },
        properties: { id: r.id },
      })),
    }),
    [filteredRegions]
  );

  const prefectureDrinksGeojson = useMemo<GeoJSON.FeatureCollection>(() => {
    if (!prefectureBase) return { type: "FeatureCollection", features: [] };
    return {
      type: "FeatureCollection",
      features: prefectureBase.features.filter((f) =>
        filteredRegions.some((r) => regionInFeature(r, f))
      ),
    };
  }, [prefectureBase, filteredRegions]);

  const countryGroups = useMemo(() => {
    const byCountry: Record<string, Region[]> = {};
    for (const r of filteredRegions) {
      if (!byCountry[r.country]) byCountry[r.country] = [];
      byCountry[r.country].push(r);
    }
    return Object.fromEntries(
      Object.entries(byCountry).map(([country, regs]) => [
        country,
        {
          lat: regs.reduce((s, r) => s + r.latitude, 0) / regs.length,
          lng: regs.reduce((s, r) => s + r.longitude, 0) / regs.length,
          count: regs.length,
        },
      ])
    );
  }, [filteredRegions]);

  const handleSelectFromSearch = useCallback((region: Region) => {
    const map = mapRef.current?.getMap();
    if (map) {
      map.flyTo({ center: [region.longitude, region.latitude], zoom: 8, duration: 1500 });
    }
    setSelectedRegion(region);
  }, []);

  const handleMapClick = useCallback(async (e: MapMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const clusterFeatures = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    if (clusterFeatures.length > 0) {
      const clusterId = clusterFeatures[0].properties?.cluster_id;
      const source = map.getSource("regions") as unknown as {
        getClusterExpansionZoom: (id: number) => Promise<number>;
      };
      const zoomLevel = await source.getClusterExpansionZoom(clusterId);
      const coords = (clusterFeatures[0].geometry as GeoJSON.Point).coordinates;
      map.easeTo({ center: [coords[0], coords[1]], zoom: zoomLevel });
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Search bar */}
      <SearchBox
        onSelectRegion={handleSelectFromSearch}
        recordedDrinkIds={recordedDrinkIds}
      />

      {/* Genre chips */}
      <div className="absolute left-4 right-4 z-20" style={{ top: 68 }}>
        <GenreChips activeGenres={activeGenres} onChange={setActiveGenres} />
      </div>

      {/* Active filter badge */}
      {activeGenres.size < 3 && (
        <div className="absolute z-20 left-1/2 -translate-x-1/2" style={{ top: 116 }}>
          <div
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap"
            style={{ background: "var(--amber-dk)" }}
          >
            {[...activeGenres].map((g) => GENRE_LABELS[g]).join(" · ")}
            &nbsp;· {filteredRegions.length}地域
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{ longitude: 80, latitude: 30, zoom: 2 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        projection="mercator"
        onClick={handleMapClick}
        cursor="auto"
        onLoad={(e) => applyMapLanguage(e.target, lang)}
        onZoom={(e) => setZoom((e as unknown as { viewState: { zoom: number } }).viewState.zoom)}
      >
        <Source id="prefecture-drinks" type="geojson" data={prefectureDrinksGeojson}>
          <Layer {...prefectureFillLayer} />
          <Layer {...prefectureBorderLayer} />
        </Source>

        <Source
          id="regions"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
        </Source>

        {/* Individual pins (zoom >= ZOOM_THRESHOLD) */}
        {zoom >= ZOOM_THRESHOLD &&
          filteredRegions.map((region) => (
            <Marker
              key={region.id}
              longitude={region.longitude}
              latitude={region.latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedRegion(region);
              }}
              style={{ cursor: "pointer" }}
            >
              <Pin
                recorded={recordedRegionIds.has(region.id)}
                halo={recordedRegionIds.has(region.id)}
              />
            </Marker>
          ))}

        {/* Country pins (zoom < 3) */}
        {zoom < 3 &&
          Object.entries(countryGroups).map(([country, data]) => (
            <Marker key={country} longitude={data.lng} latitude={data.lat}>
              <CountryPin
                flag={COUNTRY_FLAGS[country] ?? "🌍"}
                country={country}
                count={data.count}
              />
            </Marker>
          ))}
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

      {/* Language toggle */}
      <div className="absolute bottom-4 right-4 flex rounded-full overflow-hidden border shadow-md text-xs font-medium" style={{ borderColor: "var(--ink-20)" }}>
        {(["ja", "en"] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className="px-3 py-1.5 transition-colors"
            style={
              lang === l
                ? { background: "var(--ink)", color: "var(--amber)" }
                : { background: "var(--washi)", color: "var(--ink-50)" }
            }
          >
            {l === "ja" ? "日本語" : "EN"}
          </button>
        ))}
      </div>
    </div>
  );
}
