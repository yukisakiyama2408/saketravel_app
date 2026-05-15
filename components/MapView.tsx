"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent, LayerSpecification } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Region } from "@/types";
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

type Props = {
  regions: Region[];
  focusRegion?: Region | null;
  onFocusConsumed?: () => void;
};

export default function MapView({ regions, focusRegion, onFocusConsumed }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (!focusRegion) return;
    const map = mapRef.current?.getMap();
    if (map) {
      map.flyTo({ center: [focusRegion.longitude, focusRegion.latitude], zoom: 8, duration: 1500 });
    }
    setSelectedRegion(focusRegion);
    onFocusConsumed?.();
  }, [focusRegion]); // eslint-disable-line react-hooks/exhaustive-deps

  const geojson: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: regions.map((r) => ({
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
      >
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
        onClose={() => setSelectedRegion(null)}
      />
    </div>
  );
}
