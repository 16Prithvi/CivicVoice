"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import { Report } from "@/types";

interface HeatMapLayerProps {
  reports: Report[];
  enabled: boolean;
  intensity: number;
}

export function HeatMapLayer({ reports, enabled, intensity }: HeatMapLayerProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Create heat map data from reports (filter out reports without location)
    const heatData: [number, number, number][] = reports
      .filter((report) => report.location && report.location.lat && report.location.lng)
      .map((report) => [
        report.location!.lat,
        report.location!.lng,
        intensity, // intensity value based on urgency/status
      ]);

    // Remove existing heat layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Create new heat layer
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "blue",
        0.3: "cyan",
        0.5: "lime",
        0.7: "yellow",
        1.0: "red",
      },
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, reports, enabled, intensity]);

  return null;
}







