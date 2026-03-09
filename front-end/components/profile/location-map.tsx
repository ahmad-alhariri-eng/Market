// components/location-map.tsx (updated)
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  initialPosition: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
}

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapEvents({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function LocationMap({
  initialPosition,
  onLocationSelect,
}: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [markerPosition, setMarkerPosition] =
    useState<[number, number]>(initialPosition);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMarkerPosition(initialPosition);
  }, [initialPosition]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  if (!isClient) {
    return (
      <div className="w-full h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={markerPosition} icon={customIcon} />
        <MapEvents onLocationSelect={handleLocationSelect} />
        <MapUpdater position={markerPosition} />
      </MapContainer>
    </div>
  );
}
