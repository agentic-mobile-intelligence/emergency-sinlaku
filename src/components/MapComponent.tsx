import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SERVICE_TYPE_COLORS: Record<string, string> = {
  shelter: "#DC2626",
  food: "#16A34A",
  medical: "#3B82F6",
  water: "#EAB308",
  cleanup: "#8B5CF6",
};

const DEFAULT_COLOR = "#6B7280";

interface Offering {
  id: string | number;
  latitude: number;
  longitude: number;
  service_type: string;
  [key: string]: unknown;
}

interface MapComponentProps {
  offerings: Offering[];
  selectedId: string | number | null;
  onSelect: (id: string | number) => void;
  center: [number, number];
  zoom: number;
}

export default function MapComponent({
  offerings,
  selectedId,
  onSelect,
  center,
  zoom,
}: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {offerings.map((offering) => {
        const isSelected = offering.id === selectedId;
        const color =
          SERVICE_TYPE_COLORS[offering.service_type] ?? DEFAULT_COLOR;
        return (
          <CircleMarker
            key={offering.id}
            center={[offering.latitude, offering.longitude]}
            radius={isSelected ? 14 : 8}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isSelected ? 1 : 0.6,
              weight: isSelected ? 2 : 1,
            }}
            eventHandlers={{
              click: () => onSelect(offering.id),
            }}
          />
        );
      })}
    </MapContainer>
  );
}
