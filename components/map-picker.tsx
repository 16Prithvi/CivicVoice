"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapPickerProps {
  location: { lat: number; lng: number };
  onLocationChange: (location: { lat: number; lng: number }) => void;
  height?: string;
}

function MapController({ location, onLocationChange }: MapPickerProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng], 15);
  }, [map, location]);

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onLocationChange({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onLocationChange]);

  return null;
}

export default function MapPicker({ location, onLocationChange, height = "400px" }: MapPickerProps) {
  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.lat, location.lng]} />
        <MapController location={location} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}









