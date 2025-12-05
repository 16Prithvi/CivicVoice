"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { Report } from "@/types";
import { getCategoryColor, formatDate } from "@/lib/utils";
import { MarkerCluster } from "./marker-cluster";
import { HeatMapLayer } from "./heat-map-layer";
import { Search, Radio, X, Flame } from "lucide-react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface CommunityMapEnhancedProps {
  reports: Report[];
  isAdmin?: boolean;
}

// Category icon SVGs
const categoryIcons: Record<Report["category"], string> = {
  roads: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 10h4v4h-4z"/>
    <path d="M6 10h4v4H6z"/>
    <path d="M2 8h20v8H2z"/>
  </svg>`,
  safety: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>`,
  environment: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>`,
  garbage: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"/>
  </svg>`,
};

function createCustomIcon(
  category: Report["category"],
  status: Report["status"],
  isUrgent: boolean = false
) {
  const color = getCategoryColor(category);
  const iconSvg = categoryIcons[category];
  
  // Size based on status
  const sizeMap = {
    reported: 32,
    processing: 36,
    action_taken: 38,
    resolved: 30,
  };
  const size = sizeMap[status];
  const pulseAnimation = isUrgent ? "marker-pulse" : "";
  
  return L.divIcon({
    className: `custom-marker ${pulseAnimation}`,
    html: `
      <div style="
        background-color: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.3), ${isUrgent ? `0 0 0 8px ${color}40` : 'none'};
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        animation: ${isUrgent ? 'pulse 2s infinite' : 'fadeIn 0.5s ease-in'};
      ">
        <div style="color: white; width: ${size * 0.6}px; height: ${size * 0.6}px; display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
      map.setView([40.7128, -74.006], 13);
    }
  }, [map, reports]);

  return null;
}

function LayerControl({ onLayerChange }: { onLayerChange: (layer: string) => void }) {
  const [layer, setLayer] = useState("map");
  
  useEffect(() => {
    onLayerChange(layer);
  }, [layer, onLayerChange]);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-2 flex gap-2">
      <button
        onClick={() => setLayer("map")}
        className={`px-3 py-2 rounded text-sm ${layer === "map" ? "bg-teal-600 text-white" : "bg-gray-100"}`}
        title="Standard Map"
      >
        Map
      </button>
      <button
        onClick={() => setLayer("satellite")}
        className={`px-3 py-2 rounded text-sm ${layer === "satellite" ? "bg-teal-600 text-white" : "bg-gray-100"}`}
        title="Satellite"
      >
        Satellite
      </button>
      <button
        onClick={() => setLayer("terrain")}
        className={`px-3 py-2 rounded text-sm ${layer === "terrain" ? "bg-teal-600 text-white" : "bg-gray-100"}`}
        title="Terrain"
      >
        Terrain
      </button>
    </div>
  );
}

function SearchControl() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const map = useMap();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        map.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 15);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    setSearching(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 min-w-[300px]">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search address..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}

function RadiusSearchControl({ map }: { map: L.Map }) {
  const [radius, setRadius] = useState<number | null>(null);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    let clickHandler: ((e: L.LeafletMouseEvent) => void) | null = null;

    if (radius !== null) {
      clickHandler = (e: L.LeafletMouseEvent) => {
        setCenter([e.latlng.lat, e.latlng.lng]);
      };
      map.on("click", clickHandler);
    }

    return () => {
      if (clickHandler) {
        map.off("click", clickHandler);
      }
    };
  }, [map, radius]);

  useEffect(() => {
    if (center && radius) {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
      const circle = L.circle(center, { radius: radius * 1000 }).addTo(map);
      circleRef.current = circle;
      map.fitBounds(circle.getBounds());
    }

    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [center, radius, map]);

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Radio size={18} />
        <span className="font-semibold text-sm">Radius Search</span>
        {radius !== null && (
          <button onClick={() => { setRadius(null); setCenter(null); }} className="ml-2">
            <X size={16} />
          </button>
        )}
      </div>
      {radius === null ? (
        <div className="flex gap-2">
          <button onClick={() => setRadius(1)} className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
            1 km
          </button>
          <button onClick={() => setRadius(5)} className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
            5 km
          </button>
          <button onClick={() => setRadius(10)} className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700">
            10 km
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Click on map to set center ({radius} km radius)</p>
      )}
    </div>
  );
}

function MapLayerController({ layer }: { layer: string }) {
  const map = useMap();

  useEffect(() => {
    map.eachLayer((l) => {
      if (l instanceof L.TileLayer && l.options.attribution) {
        map.removeLayer(l);
      }
    });

    let tileUrl = "";
    let attribution = "";

    switch (layer) {
      case "satellite":
        tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        attribution = "Esri";
        break;
      case "terrain":
        tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
        attribution = "OpenTopoMap";
        break;
      default:
        tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        attribution = "OpenStreetMap";
    }

    L.tileLayer(tileUrl, {
      attribution: `&copy; ${attribution} contributors`,
      maxZoom: 19,
    }).addTo(map);
  }, [map, layer]);

  return null;
}

function RadiusController() {
  const map = useMap();
  return <RadiusSearchControl map={map} />;
}

export default function CommunityMapEnhanced({ reports, isAdmin = false }: CommunityMapEnhancedProps) {
  const defaultCenter = useMemo(() => {
    if (reports.length > 0) {
      const avgLat = reports.reduce((sum, r) => sum + r.location.lat, 0) / reports.length;
      const avgLng = reports.reduce((sum, r) => sum + r.location.lng, 0) / reports.length;
      return [avgLat, avgLng] as [number, number];
    }
    return [40.7128, -74.006] as [number, number];
  }, [reports]);

  const [selectedLayer, setSelectedLayer] = useState("map");
  const [heatMapEnabled, setHeatMapEnabled] = useState(false);

  const markers = useMemo(() => {
    return reports.map((report) => {
      const statusColors = {
        resolved: "bg-green-100 text-green-800",
        processing: "bg-yellow-100 text-yellow-800",
        action_taken: "bg-blue-100 text-blue-800",
        reported: "bg-orange-100 text-orange-800",
      };
      
      const popupContent = `
        <div class="p-3" style="min-width: 250px;">
          <h3 class="font-semibold text-gray-900 mb-2 text-lg">${report.title}</h3>
          <p class="text-sm text-gray-600 mb-3">${report.description}</p>
          <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span class="capitalize px-2 py-1 rounded bg-gray-100">${report.category}</span>
            <span>${formatDate(report.createdAt)}</span>
          </div>
          ${report.imageUrl ? `
            <div class="relative w-full h-32 rounded overflow-hidden mb-3 bg-gray-200">
              <img src="${report.imageUrl}" alt="${report.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
            </div>
          ` : ''}
          <div class="flex items-center justify-between mb-3">
            <span class="inline-block px-3 py-1 rounded text-xs font-medium ${statusColors[report.status]}">
              ${report.status}
            </span>
            ${report.urgent ? '<span class="text-xs font-semibold text-red-600">⚠️ URGENT</span>' : ''}
          </div>
          <div class="flex gap-2 mt-3">
            ${report.location.address ? `
              <a href="https://www.google.com/maps/dir/?api=1&destination=${report.location.lat},${report.location.lng}" 
                 target="_blank" rel="noopener noreferrer" 
                 class="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700">
                🧭 Directions
              </a>
            ` : ''}
            <a href="https://www.google.com/maps?q=${report.location.lat},${report.location.lng}&layer=c&cbll=${report.location.lat},${report.location.lng}" 
               target="_blank" rel="noopener noreferrer" 
               class="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700">
              🔗 Street View
            </a>
          </div>
        </div>
      `;
      
      return {
        id: report.id,
        position: [report.location.lat, report.location.lng] as [number, number],
        icon: createCustomIcon(report.category, report.status, report.urgent),
        popupContent,
      };
    });
  }, [reports]);


  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            box-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 0 8px rgba(220, 38, 38, 0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        key={selectedLayer}
      >
        <MapLayerController layer={selectedLayer} />
        <MapBounds reports={reports} />
        
        {heatMapEnabled && (
          <HeatMapLayer 
            reports={reports} 
            enabled={heatMapEnabled} 
            intensity={0.8}
          />
        )}
        
        <MarkerCluster markers={markers} />
        
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
          <div className="pointer-events-auto">
            <SearchControl />
          </div>
        </div>
        
        <div className="absolute top-4 right-4 z-[1000] pointer-events-none flex flex-col gap-2">
          <div className="pointer-events-auto">
            <LayerControl onLayerChange={setSelectedLayer} />
          </div>
          {isAdmin && (
            <div className="pointer-events-auto">
              <button
                onClick={() => setHeatMapEnabled(!heatMapEnabled)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  heatMapEnabled
                    ? "bg-orange-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Toggle Heat Map (Admin Only)"
              >
                <Flame size={16} className="inline mr-1" />
                Heat Map
              </button>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none">
          <div className="pointer-events-auto">
            <RadiusController />
          </div>
        </div>
      </MapContainer>
    </>
  );
}