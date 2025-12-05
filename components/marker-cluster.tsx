"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";

interface MarkerClusterProps {
  markers: Array<{
    id: string;
    position: [number, number];
    icon: L.DivIcon;
    popupContent: string;
  }>;
}

export function MarkerCluster({ markers }: MarkerClusterProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!clusterGroupRef.current) {
      clusterGroupRef.current = L.markerClusterGroup({
        chunkedLoading: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          const color = "#0f766e";
          return L.divIcon({
            html: `<div style="
              background-color: ${color};
              width: 45px;
              height: 45px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 16px;
            ">${count}</div>`,
            className: "marker-cluster",
            iconSize: L.point(45, 45),
          });
        },
      });
      map.addLayer(clusterGroupRef.current);
    }

    const group = clusterGroupRef.current;
    group.clearLayers();

    markers.forEach(({ position, icon, popupContent }) => {
      const marker = L.marker(position, { icon });
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
      group.addLayer(marker);
    });

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
    };
  }, [map, markers]);

  return null;
}
