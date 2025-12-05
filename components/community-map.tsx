"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Report } from "@/types";
import { getCategoryColor, formatDate } from "@/lib/utils";
import Image from "next/image";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface CommunityMapProps {
  reports: Report[];
}

function createCustomIcon(category: Report["category"]) {
  const color = getCategoryColor(category);
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapBounds({ reports }: { reports: Report[] }) {
  const map = useMap();

  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map((r) => [r.location.lat, r.location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Default to a sample location
      map.setView([40.7128, -74.006], 13);
    }
  }, [map, reports]);

  return null;
}

export default function CommunityMap({ reports }: CommunityMapProps) {
  const defaultCenter = useMemo(() => {
    if (reports.length > 0) {
      const avgLat = reports.reduce((sum, r) => sum + r.location.lat, 0) / reports.length;
      const avgLng = reports.reduce((sum, r) => sum + r.location.lng, 0) / reports.length;
      return [avgLat, avgLng] as [number, number];
    }
    return [40.7128, -74.006] as [number, number];
  }, [reports]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds reports={reports} />
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.location.lat, report.location.lng]}
          icon={createCustomIcon(report.category)}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <h3 className="font-semibold text-gray-900 mb-2">{report.title}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="capitalize">{report.category}</span>
                <span>{formatDate(report.createdAt)}</span>
              </div>
              {report.imageUrl && (
                <div className="relative w-full h-24 rounded overflow-hidden mb-2 bg-gray-200">
                  <Image
                    src={report.imageUrl}
                    alt={report.title}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="text-xs">
                <span
                  className={`inline-block px-2 py-1 rounded ${
                    report.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : report.status === "processing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {report.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

